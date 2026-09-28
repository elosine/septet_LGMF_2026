// notation/lib/fit.js — THE FIT: ink against the lane, and LADDER v2 (LGMF PLAN 2e.4, 2026-09-27; RUNNING_LOG §422 · §423 · §426 the
// design · §451 the build). One geometry for the layout and the tools (tools/protrusion_detect.js, tools/decisions_needed.js,
// tools/check_rules.js).
//
// A UNIT is every point item of one system at one time — the column of one note (the unit render.js clamps). Its CORE is what the
// pitch fixes (heads, accidentals, ledgers, stems, flags, the staccato dot); its MARKS are what stacks on it (dynamics, accents and
// technique symbols, words and numbers, the ottava, the dynamic arrow). The unit's ink is measured in staff spaces against its LANE
// BOX (the frame's lane, from the staff's middle line up and down) and the inter-lane gap.
//
// THE LADDER (rules.json `ladder`), run per unit, only where the standard placement does not fit — a unit that fits is never touched,
// so a page where everything fits is byte-identical: 0 the standard placement, a spill into the inter-lane gap accepted if it touches
// nothing of the neighbour's · 1 COMPRESS the gaps between the stacked marks 0.45 → 0.30 → 0.20 (never the first mark's own distance
// to the core) · then THE WALK OF §458 (his (a)): 3 FLIP THE ANNOTATION — the marks whose row says 'leaves' 1 (the words, the symbols)
// — to the free side · 2 SHRINK the marks still on the spilling side one size step (÷ 1.122) · 3 FLIP THE PITCH DATA too ('leaves' 2:
// the cents and the partial stay with the head until nothing else helps) · 4 … 7 (the nudge,
// the lane rebalance, the octave device, the staff size) are PAGE-LEVEL — not automatic here, reported as not tried · 8 MANUAL: the
// unit keeps its standard placement, is marked red on the page, and goes on the decisions-needed list until an override exists (an
// `engraving` overlay on the event: the object · the property · the value · the rung · his § and date — five fields, §425).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./coords.js'));
  else root.NotationFit = factory(root.NotationCoords);
}(typeof self !== 'undefined' ? self : this, function (Coords) {
  'use strict';
  const EPS = 1e-9;
  const MARK_GLYPH = /^(dyn-|artic-|text-|accidental-(leftParen|rightParen))/;

  // the frame's lane boxes in ss, per system key ('0', '4', '5' …): { top, bot, gapTop, gapBot } — from the staff's middle line to the
  // lane's edge above and below, and the air to the next lane (0 inside a joined lane). C = the compiled registry; ENS its ensemble.
  function boxesFor(C, ENS, parts) {
    const rz = (C.realizations || {})['video-jury'] || {};
    const lanes = rz.lanes || { padTopPx: 8, padBotPx: 8, gapPx: 4 };
    const ep = p => (ENS && ENS.parts.find(q => q.part === p)) || null;
    const FR = Coords.ensembleFrame(parts, { heightPx: (C.frame && C.frame.heightPx) || 1080, lanes, staffHeightPx: (C.staff && C.staff.staffHeightPx) || 31.6,
      grandStaff: ((C.engraving || {}).layout || {}).grandStaff, weightOf: ENS ? (p => (ep(p) && ep(p).weight) || 1) : undefined,
      stavesOf: p => (ep(p) && ep(p).staves && ep(p).staves.length) || 1, ensemble: ENS });
    const W = (C.frame && C.frame.widthPx) || 1920, S = (C.timeScale && C.timeScale.defaults && C.timeScale.defaults.trance) || 12;
    const v = Coords.makeView(Object.assign({ widthPx: W, heightPx: (C.frame && C.frame.heightPx) || 1080, window: [0, S], systems: FR.systems, ssPerSystem: FR.ssPerSystem }, Coords.edgesOf(C)));
    const out = { byKey: {}, ssPerSec: null };
    const sys = v.systems.filter(s => !/\+/.test(String(s.key || s.part)));
    for (const s of sys) {
      const mid = s.yOfSs(0), k = String(s.key != null ? s.key : s.part);
      const above = sys.find(o => Math.abs(o.yBotPx - s.yTopPx) < 1e-6 || (o.yBotPx < s.yTopPx && s.yTopPx - o.yBotPx <= lanes.gapPx + 1e-6));
      const below = sys.find(o => Math.abs(o.yTopPx - s.yBotPx) < 1e-6 || (o.yTopPx > s.yBotPx && o.yTopPx - s.yBotPx <= lanes.gapPx + 1e-6));
      out.byKey[k] = { top: (mid - s.yTopPx) / s.ssPx, bot: (s.yBotPx - mid) / s.ssPx,
        gapTop: above ? (s.yTopPx - above.yBotPx) / s.ssPx : 0, gapBot: below ? (below.yTopPx - s.yBotPx) / s.ssPx : 0,
        above: above ? String(above.key != null ? above.key : above.part) : null, below: below ? String(below.key != null ? below.key : below.part) : null };
      if (out.ssPerSec == null) out.ssPerSec = v.pxPerSecond / s.ssPx;
    }
    return out;
  }

  // an item's ink, vertically [lo, hi] and horizontally [l, r] relative to x(t), in ss — null for a kind that is not a unit's
  function inkOf(it, glyphs, textScale) {
    const ts = textScale || 1.3, dx = it.dxSs || 0;
    const box = g => {
      if (g === 'notehead') return glyphs.notehead.filled;
      if (g === 'notehead-open') return glyphs.notehead.open;
      const m = /^(dyn|artic|accidental|text|pedal)-(.+)$/.exec(g);
      if (m) return ({ dyn: glyphs.dynamic, artic: glyphs.articulation, accidental: glyphs.accidental, text: glyphs.text, pedal: glyphs.pedal })[m[1]][m[2]];
      const f = /^flag-(up|down)(\d+)$/.exec(g);
      if (f) return glyphs.flag[f[1] + f[2]];
      return null;
    };
    switch (it.k) {
      case 'glyph': {
        const b = box(it.g);
        if (!b) return null;
        const k = it.scale || 1, ky = it.scaleY != null ? it.scaleY : k, h = (b.hSs || 1) * ky, w = (b.wSs || 1) * k;
        const a = it.align && b.anchors && b.anchors[it.align] ? b.anchors[it.align] : { x: (b.wSs || 1) / 2, y: (b.hSs || 1) / 2 };
        return { lo: it.ySs - (h - a.y * ky), hi: it.ySs + a.y * ky, l: dx - a.x * k, r: dx + w - a.x * k };
      }
      case 'text': {
        if (it.yAt === 'top') return null;   // hung from the lane's own top edge by design (sempre secco)
        const em = (it.size || 1) * ts, w = String(it.text || '').length * 0.5 * em;
        const [l, r] = it.anchor === 'middle' ? [dx - w / 2, dx + w / 2] : it.anchor === 'end' ? [dx - w, dx] : [dx, dx + w];
        return { lo: it.ySs - 0.22 * em, hi: it.ySs + 0.75 * em, l, r };
      }
      case 'dot': { const r = ((glyphs.standards || {}).staccatoDot || {}).diameter / 2 || 0.2; return { lo: it.ySs - r, hi: it.ySs + r, l: dx - r, r: dx + r }; }
      case 'ledger': { const w = (it.wSs || glyphs.notehead.filled.wSs) * 1.5; return { lo: it.ySs - 0.05, hi: it.ySs + 0.05, l: dx - w / 2, r: dx + w / 2 }; }
      case 'stem': return { lo: Math.min(it.yA, it.yB), hi: Math.max(it.yA, it.yB), l: dx - 0.07, r: dx + 0.07 };
      case 'ottava': return { lo: it.ySs - 0.9, hi: it.ySs + 0.9, l: it.dx0Ss || 0, r: it.dx1Ss || 0 };
      case 'dynarrow': { const h = (it.headSs || 0.45) * 0.45; return { lo: it.ySs - h, hi: it.ySs + h, l: Math.min(it.dx0Ss, it.dx1Ss), r: Math.max(it.dx0Ss, it.dx1Ss) }; }
      case 'niente': { const r = (it.diaSs || 0.47) / 2; return { lo: it.ySs - r, hi: it.ySs + r, l: dx - r, r: dx + r }; }
      default: return null;
    }
  }
  const isMark = it => it.k === 'text' || it.k === 'ottava' || it.k === 'dynarrow' || it.k === 'niente' || (it.k === 'glyph' && MARK_GLYPH.test(it.g || ''));

  // the units of one system's items: Map(t key → [items]) — point items only
  function unitsOf(items) {
    const u = new Map();
    for (const it of items) {
      if (it.t === undefined || it.k === 'goline' || it.k === 'attackline' || it.k === 'tick' || it.k === 'gc' || it.k === 'clef' || it.k === 'rest' || it.k === 'beam' || it.k === 'tuplet') continue;
      const k = Math.round(it.t * 1e6);
      if (!u.has(k)) u.set(k, []);
      u.get(k).push(it);
    }
    return u;
  }
  // a unit's ink: { lo, hi, l, r, core: {lo, hi} }
  function unitInk(items, glyphs, ts) {
    let lo = Infinity, hi = -Infinity, l = Infinity, r = -Infinity, clo = Infinity, chi = -Infinity;
    for (const it of items) {
      const e = inkOf(it, glyphs, ts);
      if (!e) continue;
      lo = Math.min(lo, e.lo); hi = Math.max(hi, e.hi); l = Math.min(l, e.l); r = Math.max(r, e.r);
      if (!isMark(it)) { clo = Math.min(clo, e.lo); chi = Math.max(chi, e.hi); }
    }
    if (!isFinite(lo)) return null;
    if (!isFinite(clo)) { clo = chi = (lo + hi) / 2; }
    return { lo, hi, l, r, core: { lo: clo, hi: chi } };
  }
  // how far a unit's ink passes its lane box: { top, bot } (≥ 0)
  const overOf = (ink, box) => ({ top: Math.max(0, ink.hi - box.top), bot: Math.max(0, -box.bot - ink.lo) });

  // THE LADDER on one unit (items mutated in place when a rung 1 … 3 succeeds). box = its lane box; ok(ink) = the rung-0 test (inside
  // the box, or a spill into the gap that touches nothing). Returns { rung, by, tried: [{ rung, result }], side, over } — rung 0 = fits.
  function ladder(items, box, ok, glyphs, L) {
    const ts = L.textScale || 1.3, step = L.sizeStep || 1.122462, gaps = L.compressStack || [0.45, 0.3, 0.2];
    const ink0 = unitInk(items, glyphs, ts);
    if (!ink0) return { rung: 0 };
    if (ok(ink0)) return { rung: 0 };
    const o0 = overOf(ink0, box), side = o0.bot >= o0.top ? 'bot' : 'top', sgn = side === 'top' ? 1 : -1;
    const saved = items.map(it => Object.assign({}, it));
    const restore = () => items.forEach((it, i) => { for (const k of Object.keys(it)) delete it[k]; Object.assign(it, saved[i]); });
    const tried = [];
    const marks = () => items.filter(isMark).filter(it => { const e = inkOf(it, glyphs, ts); return e && (sgn > 0 ? (e.lo + e.hi) / 2 > (ink0.core.lo + ink0.core.hi) / 2 : (e.lo + e.hi) / 2 < (ink0.core.lo + ink0.core.hi) / 2); });
    // the marks on the spilling side, grouped into ROWS (items overlapping vertically are one row), ordered outward
    const rowsOf = ms => {
      const rows = [];
      for (const x of ms.map(m => ({ it: m, e: inkOf(m, glyphs, ts) })).sort((a, b) => sgn * (a.e.lo + a.e.hi) - sgn * (b.e.lo + b.e.hi))) {
        const r = rows[rows.length - 1];
        if (r && x.e.lo < r.hi - EPS && x.e.hi > r.lo + EPS) { r.items.push(x.it); r.lo = Math.min(r.lo, x.e.lo); r.hi = Math.max(r.hi, x.e.hi); }
        else rows.push({ items: [x.it], lo: x.e.lo, hi: x.e.hi });
      }
      return rows;
    };
    const shiftRow = (row, d) => { for (const it of row.items) { if (it.ySs != null) it.ySs += d; if (it.yA != null) { it.yA += d; it.yB += d; } } row.lo += d; row.hi += d; };
    const measure = () => unitInk(items, glyphs, ts);
    // 1 COMPRESS
    for (const g of gaps.slice(1)) {
      const rows = rowsOf(marks());
      for (let i = 1; i < rows.length; i++) {
        const inner = rows[i - 1], cur = rows[i];
        const gap = sgn > 0 ? cur.lo - inner.hi : inner.lo - cur.hi;
        if (gap > g + EPS) { const d = -sgn * (gap - g); for (let j = i; j < rows.length; j++) shiftRow(rows[j], d); }
      }
      const ink = measure();
      tried.push({ rung: 1, result: 'the stack at ' + g + ' ss → ' + (ok(ink) ? 'fits' : 'spills ' + fmtOver(overOf(ink, box))) });
      if (ok(ink)) return done(1, ink, items, tried, side, o0, box);
    }
    // THE WALK OF §458 (his (a), 2026-09-27): the ANNOTATION leaves the head side before anything shrinks; the PITCH DATA (the cents and
    // the partial — the rows whose 'leaves' is 2) stays with the head until nothing else helps. L.leaves = { row: rank }, compiled from
    // the objects table (engraving.layout.ladder.leaves); a mark whose row carries no rank is annotation (1).
    const LV = L.leaves || {};
    const rankOf = it => { for (const k of Object.keys(OBJECT_OF)) if (OBJECT_OF[k](it)) return LV[k] != null ? LV[k] : 1; return 1; };
    const other = side === 'top' ? 'bottom' : 'top';
    // FLIP a set of the spilling side's marks to the other side, in the same order outward, from the other side's outermost ink
    const flipMarks = ms => {
      const rows = rowsOf(ms);
      const rest = items.filter(it => !ms.includes(it)), inkRest = unitInk(rest, glyphs, ts);
      if (!rows.length || !inkRest) return;
      // the gaps as they stand, measured before anything moves: the first row's own distance to the core, then row to row
      // (the first row's distance on the free side: its own, or the standard stack if its own was a fixed row far off — the dynamic row)
      const gs = rows.map((r, i) => i === 0 ? Math.min(sgn > 0 ? r.lo - ink0.core.hi : ink0.core.lo - r.hi, gaps[0]) : (sgn > 0 ? r.lo - rows[i - 1].hi : rows[i - 1].lo - r.hi));
      let edge = sgn > 0 ? inkRest.lo : inkRest.hi;   // the other side's outermost ink
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (sgn > 0) { shiftRow(r, (edge - gs[i]) - r.hi); edge = r.lo; }   // a spill up flips DOWN, stacked outward from below
        else { shiftRow(r, (edge + gs[i]) - r.lo); edge = r.hi; }            // a spill down flips UP
      }
    };
    // 3 (stage 1) FLIP THE ANNOTATION — from the standard placement, standard sizes; the pitch data kept over the head
    restore();
    {
      const ms = marks().filter(it => rankOf(it) < 2);
      flipMarks(ms);
      const ink = measure();
      tried.push({ rung: 3, result: 'the annotation (' + ms.length + ') flipped to the ' + other + ', the pitch data kept → ' + (ok(ink) ? 'fits' : 'spills ' + fmtOver(overOf(ink, box))) });
      if (ok(ink)) return done(3, ink, items, tried, side, o0, box);
    }
    // 2 SHRINK the marks still on the spilling side one step, then re-stack them from the first row's inner edge at the compressed gap
    {
      const ms = marks();
      for (const it of ms) { if (it.k === 'text') it.size = +((it.size || 1) / step).toFixed(4); else if (it.k === 'glyph') it.scale = +(((it.scale || 1)) / step).toFixed(4); }
      const rows = rowsOf(ms);
      const g = gaps[gaps.length - 1];
      for (let i = 1; i < rows.length; i++) {   // the smaller rows leave air: close every gap wider than the compressed one (never open one)
        const inner = rows[i - 1], cur = rows[i];
        const gap = sgn > 0 ? cur.lo - inner.hi : inner.lo - cur.hi;
        if (gap > g + EPS) { const d = -sgn * (gap - g); for (let j = i; j < rows.length; j++) shiftRow(rows[j], d); }
      }
      const ink = measure();
      tried.push({ rung: 2, result: 'the marks still on the ' + side + ' one size smaller → ' + (ok(ink) ? 'fits' : 'spills ' + fmtOver(overOf(ink, box))) });
      if (ok(ink)) return done(2, ink, items, tried, side, o0, box);
    }
    // 3 (stage 2) FLIP THE PITCH DATA TOO — the whole spilling side, from the standard placement, standard sizes
    restore();
    {
      flipMarks(marks());
      const ink = measure();
      tried.push({ rung: 3, result: 'the whole side flipped to the ' + other + ', the pitch data too → ' + (ok(ink) ? 'fits' : 'spills ' + fmtOver(overOf(ink, box))) });
      if (ok(ink)) return done(3, ink, items, tried, side, o0, box);
    }
    restore();
    tried.push({ rung: '4-7', result: 'page-level (the nudge · the lane rebalance · the octave device · the staff size) — not automatic' });
    return { rung: 8, by: fmtOver(o0), tried, side, over: o0 };
  }
  const fmtOver = o => (o.top > 0 ? o.top.toFixed(2) + ' ss past the top' : '') + (o.top > 0 && o.bot > 0 ? ', ' : '') + (o.bot > 0 ? o.bot.toFixed(2) + ' ss past the bottom' : '');
  function done(rung, ink, items, tried, side, o0, box) {
    const by = fmtOver(o0);
    for (const it of items) if (isMark(it)) it.fit = { rung, by };
    return { rung, by, tried, side, over: o0 };
  }

  // THE FIT CONTEXT of a whole model: every unit's ink, and the RUNG-0 TEST for any unit — inside its lane box; or a spill that stays
  // inside the inter-lane gap (a frame lane's edge) — the split inside a JOINED lane has no gap, only the neighbour's ink — and touches
  // no ink of the neighbour's at an overlapping x (the neighbour's ink brought into this lane's frame by the distance between the
  // two middle lines). ctx = { units: Map(key → [{ t, items }]), ok(key, u, ink) → true | the reasons }
  function fitContext(model, boxes, glyphs, ts) {
    const units = new Map();
    for (const s of model.systems) {
      const key = String(s.staff > 0 ? s.part + ':' + s.staff : s.part), list = [];
      for (const [, us] of unitsOf(s.items || [])) list.push({ t: us[0].t, items: us });
      units.set(key, list);
    }
    const boxOf = key => boxes.byKey[key] || boxes.byKey[String(key).split(':')[0]] || null;
    const ssPerSec = boxes.ssPerSec || 18.65;
    function why(key, u, ink) {
      const box = boxOf(key);
      if (!box) return [];
      const o = overOf(ink, box), out = [];
      for (const [dir, nk, gap] of [['top', box.above, box.gapTop], ['bot', box.below, box.gapBot]]) {
        if (!(o[dir] > EPS)) continue;
        const joined = !(gap > EPS) && nk != null;
        if (!joined && o[dir] > gap + EPS) out.push(dir + ': ' + o[dir].toFixed(2) + ' ss past the lane edge, the gap is ' + gap.toFixed(2));
        const nb = nk != null ? units.get(nk) : null, nbox = nk != null ? boxOf(nk) : null;
        if (!nb || !nbox) continue;
        const mid = dir === 'top' ? box.top + gap + nbox.bot : -(box.bot + gap + nbox.top);   // the neighbour's middle line, in this lane's ss
        for (const v of nb) {
          const dxs = (v.t - u.t) * ssPerSec;
          const vi = unitInk(v.items, glyphs, ts);
          if (!vi || vi.r + dxs < ink.l - EPS || vi.l + dxs > ink.r + EPS) continue;
          if (dir === 'top' ? ink.hi > vi.lo + mid + EPS : ink.lo < vi.hi + mid - EPS) out.push(dir + ': meets part ' + nk + ' @' + v.t.toFixed(2));
        }
      }
      return out;
    }
    return { units, boxOf, why, ok: (key, u, ink) => why(key, u, ink).length === 0 };
  }
  // THE FIT TEST: every unit that leaves its lane box — [{ key, part, t, over, reasons, ink }] (reasons empty = a spill rung 0 accepts)
  function measureModel(model, boxes, glyphs, ts) {
    const ctx = fitContext(model, boxes, glyphs, ts), out = [];
    for (const [key, list] of ctx.units) {
      const box = ctx.boxOf(key);
      if (!box) continue;
      for (const u of list) {
        const ink = unitInk(u.items, glyphs, ts);
        if (!ink) continue;
        const o = overOf(ink, box);
        if (!(o.top > EPS || o.bot > EPS)) continue;
        out.push({ key, part: +key.split(':')[0], t: u.t, over: o, reasons: ctx.why(key, u, ink), ink, items: u.items });
      }
    }
    return out;
  }

  // RUNG 8 — THE OVERRIDE on an event (§425): { rung: 8, object: <an objects row>, property: 'dySs' | 'dxSs' | 'size', value, ref }
  const OBJECT_OF = {
    dynamic: it => it.k === 'glyph' && /^dyn-/.test(it.g || '') && it.seq !== 'label',
    dynamicLabel: it => it.seq === 'label' || it.seq === 'labelParen',
    accent: it => it.k === 'glyph' && /^artic-(accent|marcato)$/.test(it.g || ''),
    techSymbol: it => it.k === 'glyph' && /^artic-(snappizz|plus|trill)$/.test(it.g || ''),
    number: it => it.k === 'text' && (it.seq === 'cents' || it.seq === 'partial'),
    instruction: it => it.k === 'text' && (it.seq === 'techText' || it.seq === 'instruction' || !it.seq),
    ottava: it => it.k === 'ottava',
    dynArrow: it => it.k === 'dynarrow',
    niente: it => it.k === 'niente',
  };
  function applyOverride(items, ov) {
    const pick = OBJECT_OF[ov.object];
    if (!pick) return 0;
    let n = 0;
    for (const it of items) {
      if (!pick(it)) continue;
      n++;
      if (ov.property === 'dySs') { if (it.ySs != null) it.ySs += ov.value; if (it.yA != null) { it.yA += ov.value; it.yB += ov.value; } }
      else if (ov.property === 'dxSs') { it.dxSs = (it.dxSs || 0) + ov.value; if (it.dx0Ss != null) { it.dx0Ss += ov.value; it.dx1Ss += ov.value; } }
      else if (ov.property === 'size') { if (it.k === 'text') it.size = ov.value; else it.scale = ov.value; }
    }
    return n;
  }

  return { boxesFor, inkOf, isMark, unitsOf, unitInk, overOf, ladder, fitContext, measureModel, fmtOver, applyOverride, OBJECT_OF };
}));
