// texture_dyn.js — DYNAMICS IN THE TEXTURE TAKE: THE ONE HELPER (LGMF PLAN 1n.1, 2026-09-22; RUNNING_LOG §262 … §275, §277;
// COMPOSITION_NOTES LG-86 … LG-99; docs/DYNAMICS_LAW.md is the page).
//
// As `morph_dyn.js` is to the morph: a note's LEVEL in → `velAbs` · `cc7Abs` · the drawn heights · the route out — read by the
// drawer's Hear (SPACE and `Hear orchestrated`, texture_cols.js) and by Insert (texture_insert.js), so the two cannot drift.
//
// THE RULES IT WRITES (his decisions, in the order they were taken):
//   · §262 — a SHORT note (the standard short of 1m.3) SAMPLES the level at its onset. A HELD note (a length) may follow it.
//   · §264 — B2, ONE SCALE FOR SHORT AND HELD: a short note keeps its LADDER velocity (1b's remap, the timbre of its dynamic) and goes
//     out on a CURVE channel with its fader SET ONCE from THE RESIDUAL (dyn_table.js `residual`: 4 − 12/7 ≈ 2.29 dB a written name
//     through the same measured curve), so velocity (≈ 1.71 dB a name) + fader (≈ 2.29) = the table's 4 dB — a short `pp` and a held
//     `pp` at one level, on every instrument. Rejected: a wider ladder (B1 — the english horn, cello and bass have 5–7 dB to give), mf
//     on every short note (B3 — the mf attack played down; the fallback if the set fader misbehaves in his rack).
//   · §265 — a held note takes `sample | follow | auto`. `follow` = struck at MF for its pitch (DYNAMICS_LAW Rule 1), the fader tracing
//     its level between the table values of its own two names (Rule 2), every breakpoint on its own value. `auto` (the default) = follow
//     when the level moves ONE WRITTEN STEP (1/7 of the ladder, STEP_DB) or more across the note's span, else sample. No length dial.
//   · §272 — a hand-typed hairpin (`mp-f`, `mp-f-mp`) on a held note is a `follow` of its own; on a short note only its first name counts.
//     `n` = niente at an end → CC7 0 there (the law's edges; a level below 0 here).
//   · §273 — a mod-wheel voice gets its level exactly as any other; CC1 is not touched.
//   · No measured fader curve → VELOCITY ALONE, as before 1n: the percussion (no remap entry) and the vibraphone's mallet voices (the
//     card measured the bowed one) [call, §275]; a technique with no curve copy stays on MAIN with its velocity (D11: MAIN takes no
//     moving controller) — the drawer's status names every one of them.
//   · §277 — two rules on ONE player's notes, applied in texture_cols.js with this file's help: a length that runs into that player's
//     next ON onset is CUT there (the stored length untouched); two attacks closer than the instrument's minimum gap are FLAGGED and
//     counted, never moved (Composer.CONFLICT's law, Texture's `collisions`, LG-58). Different players are never checked against each other.
//
// TWO PARTS. The first is PURE (no DOM, no MIDI; `TextureDyn` on the page, `module.exports` in node — the checks read it). The second
// is a mixin on the strikes drawer's texture family, present only on the page: the dressing of a note list, the curve seats, the CC7
// points Hear sends after `playNotes`, the collision check. `strike_drawer.js` and `sequence_ui.js` are not changed — THE SHIELD.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(function () { return require('./velocity_remap.js'); }, function () { return require('./dyn_table.js'); });
  else root.TextureDyn = factory(function () { return root.VelocityRemap || null; }, function () { return root.DynTable || null; });
})(typeof self !== 'undefined' ? self : this, function (VR_, DT_) {
  'use strict';
  const NAMES = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'], STEPS = NAMES.length - 1;
  const LO = 65, HI = 127, MF_ANCHOR = 100;   // the written ladder of anchors (dyn_ui.js StrikeDyn), and mf on it — the sequence's and the morph's anchor
  const MIN_Y = 0.05, NIENTE = -1;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const clamp01 = x => clamp(+x || 0, 0, 1);
  const levelOfName = n => { const i = NAMES.indexOf(n); return i < 0 ? null : i / STEPS; };
  const anchorOf = level => Math.round(LO + (HI - LO) * clamp01(level));
  const levelOfAnchor = vel => clamp01((clamp(Math.round(+vel || LO), LO, HI) - LO) / (HI - LO));
  const nameOf = level => (level < 0 ? 'n' : NAMES[Math.round(clamp01(level) * STEPS)]);   // the nearest written name — the mark
  const fmtPts = pts => { const out = []; pts.forEach(p => { const n = nameOf(p[1]); if (out[out.length - 1] !== n) out.push(n); }); return out.join('-'); };

  // THE TYPED BOX (§272): one, two or three names; a dash or a space between them; case forgiven; `n` only at an end
  function parse(txt) {
    const s = String(txt == null ? '' : txt).trim().toLowerCase();
    if (!s) return { ok: true, names: [], levels: [], text: '', empty: true };
    const parts = s.split(/[\s\-–—>→]+/).filter(Boolean);
    if (parts.length > 3) return { ok: false, err: 'one, two or three names — mp · mp-f · mp-f-mp' };
    const names = [], levels = [];
    for (let i = 0; i < parts.length; i++) {
      const w = parts[i] === 'niente' ? 'n' : parts[i];
      if (w === 'n') {
        if (parts.length === 1 || (i !== 0 && i !== parts.length - 1)) return { ok: false, err: 'n (niente) only at an end of a hairpin — n-f, or f-n' };
        names.push('n'); levels.push(NIENTE); continue;
      }
      const l = levelOfName(w);
      if (l == null) return { ok: false, err: '"' + parts[i] + '" is not a dynamic — ' + NAMES.join(' ') + ', or n at an end' };
      names.push(w); levels.push(l);
    }
    return { ok: true, names: names, levels: levels, text: names.join('-') };
  }
  // the level breakpoints [[t, level]] of a note `dur` seconds long from what the pattern holds for it: a typed string (its names spread
  // evenly over the span), a generator's { pts: [[t, level]] } (seconds from the onset), a plain level, or nothing → the fallback level
  function pointsOf(spec, dur, fallback) {
    const d = Math.max(0.001, +dur || 0), flat = l => [[0, l], [d, l]];
    if (spec == null || spec === '') return flat(fallback);
    if (typeof spec === 'number') return flat(clamp(spec, NIENTE, 1));
    if (typeof spec === 'string') {
      const P = parse(spec); if (!P.ok || !P.levels.length) return flat(fallback);
      const L = P.levels; return L.length === 1 ? flat(L[0]) : L.map((l, i) => [d * i / (L.length - 1), l]);
    }
    if (spec && Array.isArray(spec.pts) && spec.pts.length) {
      const P = spec.pts.map(p => [clamp(+p[0] || 0, 0, d), clamp(+p[1] || 0, NIENTE, 1)]).sort((a, b) => a[0] - b[0]);
      if (P[0][0] > 1e-9) P.unshift([0, P[0][1]]); if (P[P.length - 1][0] < d - 1e-9) P.push([d, P[P.length - 1][1]]);
      return P;
    }
    return flat(fallback);
  }
  function levelAt(pts, t) {
    if (!pts || !pts.length) return 0;
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const p = pts[i - 1], q = pts[i]; return p[1] + (q[1] - p[1]) * ((t - p[0]) / Math.max(1e-9, q[0] - p[0])); }
    return pts[pts.length - 1][1];
  }
  const span = pts => { let lo = Infinity, hi = -Infinity; pts.forEach(p => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }); return { lo: lo, hi: hi }; };
  // THE RULE for `auto` (§265): the level moves one written step or more across the span → follow
  function moves(pts) { const s = span(pts); return s.hi - s.lo >= 1 / STEPS - 1e-9; }
  function decide(mode, pts) { return mode === 'follow' ? 'follow' : mode === 'sample' ? 'sample' : (moves(pts) ? 'follow' : 'sample'); }

  // the tables — with niente
  function measured(bank, key) { const T = DT_(); return !!(T && T.hasCurve(bank, key)); }
  function cc7Of(bank, key, level) { const T = DT_(); if (level < 0) return 0; return T ? T.cc7(bank, key, level) : Math.round(127 * Math.pow(10, -(1 - clamp01(level)) * STEPS * 4 / 40)); }
  function residualOf(bank, key, level) { const T = DT_(); if (level < 0) return 0; return (T && T.residual) ? T.residual(bank, key, level) : 127; }
  // THE LADDER VELOCITY for a level, per pitch — what the drawer's Hear sent before 1n (playNotes' remapVel); no bank → the anchor
  function ladderVel(bank, key, midi, level) {
    const V = VR_(), a = anchorOf(level < 0 ? 0 : level);
    return (V && V.velocityFor && bank && bank.instruments && key && bank.instruments[key]) ? V.velocityFor(bank, key, midi, a) : a;
  }
  // RULE 1 — the mf strike, per pitch
  function mfVel(bank, key, midi) { const V = VR_(); const d = (V && V.heldNote && bank && key) ? V.heldNote(bank, key, midi, MF_ANCHOR) : null; return d ? d.vel : MF_ANCHOR; }

  // B2 — a SHORT or a SAMPLED note: the ladder velocity for the timbre, the residual on the fader, set once
  function shapeShort(bank, key, midi, level) {
    const R = residualOf(bank, key, level);
    return { how: 'sample', level: level, lo: level, hi: level, velAbs: ladderVel(bank, key, midi, level), cc7Abs: { lo: R, hi: R }, heights: [[0, 1], [1, 1]], flat: true };
  }
  // a FOLLOW note: struck at mf, the fader between the table values of its lowest and highest level, every breakpoint on its own value
  function shapeHeld(bank, key, midi, pts, dur) {
    const s = span(pts), a = cc7Of(bank, key, s.lo), b = cc7Of(bank, key, s.hi), d = Math.max(0.001, +dur || pts[pts.length - 1][0] || 0.001);
    return { how: 'follow', level: pts[0][1], lo: s.lo, hi: s.hi, velAbs: mfVel(bank, key, midi), cc7Abs: { lo: a, hi: b },
      heights: pts.map(p => [clamp01(p[0] / d), b === a ? 1 : clamp01((cc7Of(bank, key, p[1]) - a) / (b - a))]), flat: b === a };
  }
  // velocity alone — no measured curve (the percussion, a mallet voice) or no curve copy for this technique (stays on MAIN)
  function shapePlain(bank, key, midi, level, why) { return { how: why || 'plain', level: level, lo: level, hi: level, velAbs: ladderVel(bank, key, midi, level), cc7Abs: null, heights: [[0, 1], [1, 1]], flat: true }; }

  // the CC7 a shaped note sends at `u` (0 … 1 of its span), and the points [[ms, cc]] where the value changes over `durMs`
  function heightAt(S, u) { const H = S.heights; if (!H || !H.length) return 1; if (u <= H[0][0]) return H[0][1]; for (let i = 1; i < H.length; i++) if (u <= H[i][0]) { const p = H[i - 1], q = H[i]; return p[1] + (q[1] - p[1]) * ((u - p[0]) / Math.max(1e-9, q[0] - p[0])); } return H[H.length - 1][1]; }
  function cc7At(S, u) { const a = S.cc7Abs; if (!a) return null; return clamp(Math.round(a.lo + (a.hi - a.lo) * clamp01(heightAt(S, u))), 0, 127); }
  function rampPoints(S, durMs, stepMs, skipMs) {
    if (!S || !S.cc7Abs) return [];
    const full = Math.max(1, (+skipMs || 0) + Math.max(1, +durMs || 1)), out = []; let last = -1;
    const point = ms => { const cc = cc7At(S, ((+skipMs || 0) + ms) / full); if (cc !== last) { out.push([ms, cc]); last = cc; } };
    if (S.how !== 'follow' || S.flat) { point(0); return out; }
    for (let ms = 0; ms < durMs; ms += (stepMs || 50)) point(ms);
    point(durMs);
    return out;
  }
  const yOf = h => Math.max(MIN_Y, Math.min(10, Math.round(1000 * 10 * clamp01(h)) / 1000));

  return { NAMES: NAMES, STEPS: STEPS, LO: LO, HI: HI, MF_ANCHOR: MF_ANCHOR, MIN_Y: MIN_Y, NIENTE: NIENTE,
    levelOfName: levelOfName, anchorOf: anchorOf, levelOfAnchor: levelOfAnchor, nameOf: nameOf, fmtPts: fmtPts, parse: parse, pointsOf: pointsOf, levelAt: levelAt, span: span, moves: moves, decide: decide,
    measured: measured, cc7Of: cc7Of, residualOf: residualOf, ladderVel: ladderVel, mfVel: mfVel, shapeShort: shapeShort, shapeHeld: shapeHeld, shapePlain: shapePlain, heightAt: heightAt, cc7At: cc7At, rampPoints: rampPoints, yOf: yOf };
});

// ================================================================ the mixin — on the page only
(function (root) {
'use strict';
const D = root.StrikeDrawer, X = root.TextureDyn;
if (!D || !X || typeof D.txNotesBetween !== 'function') { if (typeof window !== 'undefined') console.warn('[texture_dyn] texture_cols.js is not loaded'); return; }
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const TRK = () => (typeof D.tracks === 'function' ? D.tracks() : (typeof TRACKS !== 'undefined' ? TRACKS : [])) || [];
const RAMP_MS = 50, RAMP_LEAD_MS = 15;   // as the sequence's Hear: a point every 50 ms where the value changes; the first lands AFTER playNotes' own CC7 (30 ms before the note) and before the note-on
const WARN = '#e88';
const shortOf = lane => { const t = TRK()[lane]; return (t && (t.short || t.label)) || ('L' + lane); };

Object.assign(D, {
    _txDynBank() { const C = C_(); return C ? C._velRemap : null; },
    txDynKey(lane) { const T = TRK(), t = T[lane], real = t && t.seatOf != null ? t.seatOf : lane; return (T[real] && T[real].instKey) || null; },
    // does this voice have a MEASURED fader curve? the bank's (1b · 0d) — and on the vibraphone the card measured the BOWED voice [call]
    txDynMeasured(lane, tech) {
        const key = this.txDynKey(lane); if (!X.measured(this._txDynBank(), key)) return false;
        if (key === 'bowed_vibraphone' && !/bow/.test(String(tech || ''))) return false;
        return true;
    },
    // what the pattern holds for this player in this column: a typed string (1n.2), a generator's points (1n.3 …), or nothing
    txDynSpec(c, lane) { const d = c && c.dyn; return (d && d[lane] != null && d[lane] !== '') ? d[lane] : null; },
    // `sample | follow | auto` for this player in this column (§265): the row's own, else the column's, else auto — a typed hairpin follows (§272)
    txDynMode(c, lane) {
        const spec = this.txDynSpec(c, lane);
        if (typeof spec === 'string') { const P = X.parse(spec); if (P.ok && P.levels.length > 1) return 'follow'; }
        const f = c && c.fol && c.fol[lane]; return (f === 'sample' || f === 'follow') ? f : ((c && (c.follow === 'sample' || c.follow === 'follow')) ? c.follow : 'auto');
    },
    // DRESS a list (SPACE's, Insert's, the column preview's): every column note gets the helper's answer as `n.dyn` and its `velAbs`;
    // then the shaped ones their curve seats. `L` = { notes, cols } (cols[i] = the column of notes[i], null for a claves note).
    // `n.dynFullMs` (a note already sounding at the cursor, §285) is the whole note; `n.durMs` what is left of it.
    txDress(L, doc) {
        const p = doc || this.txCols(); if (!p || !L || !L.notes) return L;
        const bank = this._txDynBank();
        L.notes.forEach((n, i) => {
            const k = L.cols ? L.cols[i] : null; if (!k) { delete n.dyn; return; }
            const c = (p.cols || {})[k] || {}, lane = n.row != null ? n.row : n.lane, key = this.txDynKey(lane);
            const fullMs = +n.dynFullMs || +n.durMs || 1, dur = fullMs / 1000, isShort = !this.txLenS(c, lane);   // the standard short, or a length (1m.3)
            const spec = this.txDynSpec(c, lane), fallback = X.levelOfAnchor(n.vel);
            let pts = X.pointsOf(spec, dur, fallback);
            if (isShort && pts.length > 1) { const first = (typeof spec === 'string') ? pts[0][1] : X.levelAt(pts, 0); pts = [[0, first], [dur, first]]; }   // §272: a short note takes one value — its first name
            const how = isShort ? 'sample' : X.decide(this.txDynMode(c, lane), pts);
            let S;
            if (!this.txDynMeasured(lane, n.tech)) S = X.shapePlain(bank, key, n.midi, pts[0][1], 'plain');
            else if (how === 'follow') S = X.shapeHeld(bank, key, n.midi, pts, dur);
            else S = X.shapeShort(bank, key, n.midi, X.levelAt(pts, 0));
            S.pts = pts; S.text = X.fmtPts(pts); S.skipMs = Math.max(0, fullMs - (+n.durMs || fullMs)); S.isShort = isShort;
            n.dyn = S; n.velAbs = S.velAbs;
        });
        this.txDynSeats(L.notes);
        return L;
    },
    // THE ROUTE (DYNAMICS_LAW §4, the sequence's `curveSeats`): every shaped note a MARKER seat 'cN' — the Nth entry of its instrument's
    // curve bank, resolved by the wrap of D.routeFor (sequence_ui.js) — round robin per player in time order, a breath after each; a
    // real seat (the second vibraphone) already sits on curve[0] and keeps it, and the pool skips that entry for the first vibraphone;
    // a technique with NO curve copy stays on MAIN with its velocity and is counted for the status
    txDynSeats(notes) {
        const C = C_(); let onMain = 0;
        if (!C || typeof C.curveChannelsOf !== 'function') { notes.forEach(n => { if (n.dyn && n.dyn.how !== 'plain') { n.dyn.how = 'main'; n.dyn.cc7Abs = null; delete n.seat; onMain++; } }); return onMain; }
        const T = TRK(), held = {};
        notes.forEach(n => { const t = T[n.lane]; if (!(t && t.seatOf != null)) return; const inst = this.instOf(t.seatOf), cur = inst && inst.channels && Array.isArray(inst.channels.curve) ? inst.channels.curve[0] : null; if (cur != null) (held[t.seatOf] = held[t.seatOf] || new Set()).add(JSON.stringify(cur)); });
        const byLane = {};
        notes.forEach(n => {
            if (!n.dyn) return;
            const t = T[n.lane];
            if (t && t.seatOf != null) { delete n.seat; return; }   // a real seat: its own curve channel already (strike_drawer routeFor)
            if (n.dyn.how === 'plain') { delete n.seat; return; }
            (byLane[n.lane] = byLane[n.lane] || []).push(n);
        });
        Object.keys(byLane).forEach(k => {
            const lane = +k, real = this.scoreLane ? this.scoreLane(lane) : lane, list = byLane[k].slice().sort((a, b) => a.onMs - b.onMs), freeAt = new Map();
            list.forEach(n => {
                const pool = C.curveChannelsOf(real, n.tech) || [];
                if (!pool.length) { n.dyn.how = 'main'; n.dyn.cc7Abs = null; delete n.seat; onMain++; return; }
                const open = i => !(held[real] && held[real].has(JSON.stringify(pool[i])) && held[real].size < pool.length);
                let pick = -1, best = Infinity;
                for (let i = 0; i < pool.length; i++) { if (!open(i)) continue; const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f <= n.onMs + 1e-9 && f < best) { best = f; pick = i; } }
                if (pick < 0) { let lo = Infinity; for (let i = 0; i < pool.length; i++) { if (!open(i)) continue; const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f < lo) { lo = f; pick = i; } } if (pick < 0) pick = 0; }
                freeAt.set(pick, n.onMs + n.durMs + 50);
                n.seat = 'c' + pick;
                // the marker must RESOLVE to a curve channel (the wrap in sequence_ui.js); if it does not, the note would stream on MAIN — so it stays a velocity note there, and the status says
                const base = this.routeFor(lane, n.tech), r = this.routeFor(lane, n.tech, n.seat);
                if (!r || !base || (r.ch === base.ch && r.port === base.port)) { n.dyn.how = 'main'; n.dyn.cc7Abs = null; delete n.seat; onMain++; }
            });
        });
        return onMain;
    },
    // after `playNotes` has scheduled the notes: the fader of every shaped note, on its curve channel — one point for a set fader, the
    // ramp for a follow; each RAMP_LEAD_MS before its moment, the first before the note-on (after playNotes' own CC7 30 ms before it)
    txScheduleDyn(notes) {
        const e = E_(); if (!e || !e._playing || !notes) return 0;
        let sent = 0;
        notes.forEach(n => {
            const S = n.dyn; if (!S || !S.cc7Abs || (S.how !== 'sample' && S.how !== 'follow')) return;
            const r = this.routeFor(n.lane, n.tech, n.seat); if (!r || !r.out) return;
            X.rampPoints(S, n.durMs, RAMP_MS, S.skipMs).forEach(pt => {
                const when = this.base + n.onMs + pt[0] - RAMP_LEAD_MS, cc = pt[1];
                e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, cc]); } catch (x) {} }, Math.max(0, when - performance.now()))); sent++;
            });
        });
        return sent;
    },
    // the status line's account of what went out — a claim about the sound, said rather than assumed
    txDynText(notes) {
        const shaped = (notes || []).filter(n => n.dyn && (n.dyn.how === 'sample' || n.dyn.how === 'follow'));
        if (!(notes || []).some(n => n.dyn)) return '';
        const follow = shaped.filter(n => n.dyn.how === 'follow').length;
        let lo = 127, hi = 0; shaped.forEach(n => { lo = Math.min(lo, n.dyn.cc7Abs.lo); hi = Math.max(hi, n.dyn.cc7Abs.hi); });
        const plain = [...new Set((notes || []).filter(n => n.dyn && n.dyn.how === 'plain').map(n => shortOf(n.lane) + (this.txDynKey(n.lane) === 'bowed_vibraphone' ? ' (mallet)' : '')))];
        const main = [...new Set((notes || []).filter(n => n.dyn && n.dyn.how === 'main').map(n => shortOf(n.lane) + ' ' + n.tech))];
        return (shaped.length ? ' · ' + shaped.length + ' on the one scale (' + (shaped.length - follow) + ' set, ' + follow + ' follow) · the fader CC7 ' + lo + '…' + hi + ' on the curve channels' : '') +
            (plain.length ? ' · velocity alone, no measured curve: ' + plain.join(', ') : '') +
            (main.length ? ' · on MAIN, no curve copy for the voice (velocity alone): ' + main.join(', ') : '');
    },
    // THE FLAG (§277, LG-58): on ONE player, two ATTACKS closer than the instrument's minimum gap — the score's own law (Composer.CONFLICT
    // `requiredAttack`: the slur-speed limit at a half step, the leap adding to it) over the pattern's ON columns. The attacks alone are
    // judged: a note that sounds into the next is CUT there by construction (the rule above), so the sounding overlap and the tongue
    // reset the score's `pairTier` would also count are not faults here [call]. Answers { flagged: Set of 'k|lane', per: { short:
    // count }, n }. Nothing is moved.
    txCollisions(doc) {
        const p = doc || this.txCols(), tx = p && p.texture ? p.texture : this._tx, C = C_(), TX = root.Texture;
        const need = (C && typeof C.requiredAttack === 'function') ? C.requiredAttack.bind(C) : (TX && typeof TX.requiredAttack === 'function' ? TX.requiredAttack : ((a, b) => 0.11 + Math.min(0.22, Math.abs((b.sonifyNote || 0) - (a.sonifyNote || 0)) * 0.0093)));
        const win = (C && C._conflictWindow) || (TX && TX.D17 && TX.D17.WINDOW) || 0.33;
        const out = { flagged: new Set(), per: {}, n: 0 };
        if (!p || !tx) return out;
        const on = new Set(p.on || []), byLane = {};
        tx.dots.forEach(d => {
            if (!on.has(d.k)) return; const c = (p.cols || {})[d.k]; if (!c) return;
            (c.notes || []).forEach(nt => { const lane = nt.row != null ? nt.row : nt.lane; (byLane[lane] = byLane[lane] || []).push({ k: d.k, startSeconds: d.t, sonifyNote: nt.midi }); });
        });
        Object.keys(byLane).forEach(l => {
            const ev = byLane[l].sort((a, b) => a.startSeconds - b.startSeconds);
            for (let a = 0; a < ev.length; a++) for (let b = a + 1; b < ev.length; b++) {
                if (ev[b].k === ev[a].k) continue;
                const gap = ev[b].startSeconds - ev[a].startSeconds;
                if (gap > win) break;
                if (gap >= need(ev[a], ev[b]) - 1e-6) continue;
                out.flagged.add(ev[a].k + '|' + l); out.flagged.add(ev[b].k + '|' + l);
                out.per[shortOf(+l)] = (out.per[shortOf(+l)] || 0) + 1; out.n++;
            }
        });
        return out;
    },
    txCollisionText(col) { const c = col || this.txCollisions(); return c.n ? ' · ' + c.n + ' too close on one player (' + Object.keys(c.per).map(s => s + ' ' + c.per[s]).join(' · ') + ') — flagged, nothing moved' : ''; },
});

// ================================================================ 1n.2 — THE SINGLE NOTE BY HAND (RUNNING_LOG §272; PLAN § 1n.2)
// In the players list (1m.4.5's rows), texture mode only: a `dyn` box per row — `mp` a value · `mp-f` / `f-mp` a crescendo /
// decrescendo inside the held note · `mp-f-mp` a swell; a dash or a space between names, a dash shown; case forgiven; `n` = niente at
// an end; anything else refused, the status saying so; on a SHORT note only the first name counts and the status says so; blank = the
// level the range or the column gives. Beside it the switch of 1n.1 — `auto | sample | follow` (§265). The lens (1m.4.4): both write to
// every selected column, "mixed" where they differ. The column's MARK (reserved by 1m.4.5): beside each lit circle the RESULTING level —
// a letter-mark, a wedge for a hairpin — generated or by hand alike [call on the look]. Lives with the pattern, never with a take (§251 ·
// §252): `c.dyn[lane]` a typed string (or a generator's `{ pts }`, 1n.3), `c.hand[lane]` when typed, `c.fol[lane]` the switch. Undo covers it.
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const MIXED = '1px dashed #C9A05A', MARK_COL = '#E8CF9A';
const isEnter = ev => ev.key === 'Enter' || ev.code === 'Enter' || ev.code === 'NumpadEnter' || ev.keyCode === 13;
const isEsc = ev => ev.key === 'Escape' || ev.code === 'Escape' || ev.keyCode === 27;
Object.assign(D, {
    // what the box shows for a column: a typed string as typed; a generator's points as a placeholder (their names); nothing → blank
    txDynCell(c, lane) { const s = this.txDynSpec(c, lane); return { value: typeof s === 'string' ? s : '', gen: (s && typeof s === 'object') ? X.fmtPts(X.pointsOf(s, (s.pts && s.pts[s.pts.length - 1][0]) || 1, 0)) : '' }; },
    // the two boxes on every row, texture mode only — the `len` box's idiom (texture_cols.js txPaintRowLens)
    txPaintRowDyn() {
        const orch = this.el && this.el.querySelector('#skOrch'); if (!orch) return;
        const on = this.txIsOn(), p = on ? this.txCols() : null, k = p && this.txPrimary(), c = k ? p.cols[k] : null;
        const cols = p && p.sel.length > 1 ? p.sel.map(kk => p.cols[kk]).filter(Boolean) : [];
        orch.querySelectorAll('.skRow').forEach(row => {
            const lane = +row.dataset.lane; let box = row.querySelector('.txRowDyn'), sel = row.querySelector('.txRowFol');
            if (!on) { if (box) box.remove(); if (sel) sel.remove(); return; }   // THE SHIELD: the strike mode's rows do not change
            if (!box) {
                box = document.createElement('input'); box.className = 'txRowDyn'; box.type = 'text'; box.placeholder = 'dyn'; box.spellcheck = false;
                box.style.cssText = INP + ';width:48px;margin-left:4px;flex:none';
                box.addEventListener('change', e => this.txSetRowDyn(lane, e.target.value));
                box.addEventListener('keydown', ev => { ev.stopPropagation(); if (isEnter(ev)) { ev.preventDefault(); box.blur(); } else if (isEsc(ev)) { ev.preventDefault(); this.txPaintRowDyn(); box.blur(); } });
                row.appendChild(box);
                sel = document.createElement('select'); sel.className = 'txRowFol'; sel.style.cssText = INP + ';width:58px;margin-left:2px;flex:none';
                sel.innerHTML = '<option value="auto">auto</option><option value="sample">sample</option><option value="follow">follow</option>';
                sel.addEventListener('change', e => { e.target.blur(); this.txSetRowFol(lane, e.target.value); });
                sel.addEventListener('keydown', ev => ev.stopPropagation());
                row.appendChild(sel);
            }
            const cell = c ? this.txDynCell(c, lane) : { value: '', gen: '' };
            box.disabled = !k; box.style.opacity = k ? '' : 0.45; sel.disabled = !k; sel.style.opacity = k ? '' : 0.45;
            if (document.activeElement !== box) box.value = cell.value;
            box.placeholder = k ? (cell.gen ? cell.gen : 'dyn') : '—';
            const vals = cols.map(cc => JSON.stringify(this.txDynSpec(cc, lane))), mixed = cols.length > 1 && new Set(vals).size > 1;
            box.style.outline = mixed ? MIXED : '';
            const fols = cols.map(cc => (cc && cc.fol && cc.fol[lane]) || 'auto'), fMixed = cols.length > 1 && new Set(fols).size > 1;
            const f = c && c.fol && c.fol[lane]; if (document.activeElement !== sel) sel.value = (f === 'sample' || f === 'follow') ? f : 'auto';
            sel.style.outline = fMixed ? MIXED : '';
            const who = (TRK()[lane] ? TRK()[lane].label : 'row ' + lane);
            box.title = who + ' — the dynamic of their note in the selected column(s): a value (mp), a hairpin inside a held note (mp-f · f-mp), a swell (mp-f-mp); n = niente at an end; a dash or a space between names; blank = the level the range gives (or the deal\'s own). On a short note only the first name counts' + (cell.gen ? ' · generated: ' + cell.gen + ' (typing overrides it; a re-generate takes it back)' : '') + (mixed ? ' · mixed: ' + [...new Set(vals)].map(v => v === 'null' ? '(none)' : v).join(' · ') : '') + '. ENTER sets · ESC puts it back';
            sel.title = who + ' — a HELD note under a level that moves: auto = follow it when it moves one written step or more across the note, else sample it at the onset · sample · follow (1n.1, §265). A short note always samples; a typed hairpin always follows' + (fMixed ? ' · mixed: ' + [...new Set(fols)].join(' · ') : '');
        });
    },
    txSetRowDyn(lane, raw) {
        const p = this.txCols(); if (!p || !p.sel.length) { this.txPaintRowDyn(); this.txGreySay(); return; }
        const P = X.parse(raw), t = TRK()[lane], who = t ? t.label : 'row ' + lane;
        if (!P.ok) { this.txPaintRowDyn(); this.setStatus(who + ': ' + P.err, true); return; }
        this.txPushUndo();
        let shorts = 0, off = 0;
        p.sel.forEach(k => {
            const c = p.cols[k]; if (!c) return;
            if (!(c.players || []).includes(lane)) off++;
            if (P.empty) { if (c.dyn) delete c.dyn[lane]; if (c.hand) delete c.hand[lane]; }
            else { c.dyn = c.dyn || {}; c.dyn[lane] = P.text; c.hand = c.hand || {}; c.hand[lane] = 1; if (P.names.length > 1 && !this.txLenS(c, lane)) shorts++; }
        });
        this.txPersistSoon(); this.txRender(); this.txPaintRowDyn();
        const where = p.sel.length === 1 ? ' at ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : ' → ' + p.sel.length + ' columns';
        this.setStatus(who + where + ': ' + (P.empty ? 'no dynamic of their own — the level the range gives, else the deal\'s (a generated value comes back with a re-generate)' : P.text + (P.names.length > 1 ? ' — a hairpin: the note follows it' : '')) +
            (shorts ? ' · on a SHORT note only the first name counts (' + P.names[0] + ')' + (p.sel.length > 1 ? ' — ' + shorts + ' of them' : '') : '') + (off ? ' · ' + who + ' is off in ' + off + ' of them (the value waits there)' : ''));
    },
    txSetRowFol(lane, v) {
        const p = this.txCols(); if (!p || !p.sel.length) { this.txPaintRowDyn(); this.txGreySay(); return; }
        const t = TRK()[lane], who = t ? t.label : 'row ' + lane, val = (v === 'sample' || v === 'follow') ? v : null;
        this.txPushUndo();
        p.sel.forEach(k => { const c = p.cols[k]; if (!c) return; if (!val) { if (c.fol) { delete c.fol[lane]; if (!Object.keys(c.fol).length) delete c.fol; } } else { c.fol = c.fol || {}; c.fol[lane] = val; } });
        this.txPersistSoon(); this.txRender(); this.txPaintRowDyn();
        this.setStatus(who + (p.sel.length === 1 ? ' at ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : ' → ' + p.sel.length + ' columns') + ': ' + (val ? val + (val === 'follow' ? ' — a held note traces its level (a short one still samples)' : ' — one level for the span, read at the onset') : 'auto — follow when the level moves a written step across the note, else sample'));
    },
    // THE MARK (1m.4.5's reserved one): beside each lit circle with a note, the RESULTING level — the name at the onset, a wedge for a
    // hairpin (< rising, > falling, <> a swell), drawn only when the marks are far enough apart to read; the circle's title always has it
    txDynMarks(p, ys) {
        const svg = this.el && this.el.querySelector('#txSvg'), run = svg && svg.querySelector('#txRun'); if (!svg || !run || !this._tx || !p) return;
        const mw = this.txMarkW(), px = this._txV ? this._txV.px : 0, gap = (this._tx.gap10 || 0.05) * px, W = this.txW(), on = new Set(p.on || []);
        if (gap < 22) return;   // too dense to read at this zoom
        let s = '';
        this._tx.dots.forEach(d => {
            if (!on.has(d.k)) return; const c = p.cols[d.k]; if (!c) return;
            const cx = this.txX(d.t) + mw / 2; if (cx < -20 || cx > W + 20) return;
            (c.notes || []).forEach(n => {
                const lane = n.row != null ? n.row : n.lane, cy = ys[lane]; if (cy == null || !(c.players || []).includes(lane)) return;
                const dur = this.txPlayLenMs(p, this._tx, c, d.k, lane).ms / 1000, spec = this.txDynSpec(c, lane), pts = X.pointsOf(spec, dur, X.levelOfAnchor(n.vel));
                const isShort = !this.txLenS(c, lane), first = X.nameOf(isShort ? (typeof spec === 'string' ? pts[0][1] : X.levelAt(pts, 0)) : pts[0][1]);
                let wedge = '';
                if (!isShort && pts.length > 1) { const a = pts[0][1], m = Math.max(...pts.map(q => q[1])), z = pts[pts.length - 1][1], lo = Math.min(...pts.map(q => q[1])); if (m > a + 1e-9 && m > z + 1e-9) wedge = '<>'; else if (lo < a - 1e-9 && lo < z - 1e-9) wedge = '><'; else if (z > a + 1e-9) wedge = '<'; else if (z < a - 1e-9) wedge = '>'; }
                s += '<text class="txMark" x="' + (cx + 6.5).toFixed(1) + '" y="' + (cy - 5.5).toFixed(1) + '" font-size="8" fill="' + MARK_COL + '" opacity="' + ((c.hand || {})[lane] ? 1 : 0.75) + '" pointer-events="none" font-style="' + ((c.hand || {})[lane] ? 'normal' : 'italic') + '">' + first + (wedge ? ' ' + wedge : '') + '</text>';
            });
        });
        if (s) run.insertAdjacentHTML('beforebegin', s);
    },
});
// the two boxes after every render of the panel; the marks after every render of the columns
const _renderOrch = D.renderOrch;
D.renderOrch = function () { const r = _renderOrch.apply(this, arguments); try { this.txPaintRowDyn(); } catch (e) { console.warn('[texture_dyn] row dyn:', e); } return r; };
const _txRenderCols = D.txRenderCols;
D.txRenderCols = function () { const r = _txRenderCols.apply(this, arguments); try { if (this.txIsOn()) { const p = this.txCols(); if (p && this._tx) this.txDynMarks(p, this.txRowsY()); this.txPaintRowDyn(); } } catch (e) { console.warn('[texture_dyn] marks:', e); } return r; };

// the count in the status: the row's line and the column's line both carry it (the flag is drawn by texture_cols.js txRenderCols)
const _txLine = D.txLine;
D.txLine = function () { const s = _txLine.apply(this, arguments); try { return this._tx ? s + this.txCollisionText(this.txCollisions()) : s; } catch (e) { return s; } };
const _txColLine = D.txColLine;
D.txColLine = function () { const s = _txColLine.apply(this, arguments); try { return s + this.txCollisionText(this.txCollisions()); } catch (e) { return s; } };

root.TextureDyn.WARN = WARN;
}(typeof self !== 'undefined' ? self : this));
