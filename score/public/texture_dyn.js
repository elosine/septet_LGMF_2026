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
    // HIS CALL 2026-09-23, "b" (RUNNING_LOG §301): a voice with NO curve copy is not left on velocity alone — a SAMPLED note is a fader SET
    // ONCE, not a moving controller, so it goes out on the note's OWN channel (instance 1's part) with its residual before it, exactly as
    // a plain note gets its CC7 127 there today; only a FOLLOW (a moving fader) still needs a copy and stays velocity alone, counted.
    txDynOwn(n) {
        if (!n.dyn) return;
        if (n.dyn.how === 'sample') { n.dyn.how = 'own'; delete n.seat; }
        else if (n.dyn.how === 'follow') {   // velocity alone: struck on the LADDER at its first level, not at mf — the fader will not move it down
            n.dyn.how = 'main'; n.dyn.cc7Abs = null; delete n.seat;
            n.dyn.velAbs = X.ladderVel(this._txDynBank(), this.txDynKey(n.lane), n.midi, n.dyn.level); n.velAbs = n.dyn.velAbs;
        }
    },
    txDynSeats(notes) {
        const C = C_(); let onMain = 0;
        if (!C || typeof C.curveChannelsOf !== 'function') { notes.forEach(n => { if (n.dyn && n.dyn.how !== 'plain') { this.txDynOwn(n); if (n.dyn.how === 'main') onMain++; } }); return onMain; }
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
                if (!pool.length) { this.txDynOwn(n); if (n.dyn.how === 'main') onMain++; return; }   // no curve copy for the voice: a set fader on its own channel; a moving one stays velocity alone
                const open = i => !(held[real] && held[real].has(JSON.stringify(pool[i])) && held[real].size < pool.length);
                let pick = -1, best = Infinity;
                for (let i = 0; i < pool.length; i++) { if (!open(i)) continue; const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f <= n.onMs + 1e-9 && f < best) { best = f; pick = i; } }
                if (pick < 0) { let lo = Infinity; for (let i = 0; i < pool.length; i++) { if (!open(i)) continue; const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f < lo) { lo = f; pick = i; } } if (pick < 0) pick = 0; }
                freeAt.set(pick, n.onMs + n.durMs + 50);
                n.seat = 'c' + pick;
                // the marker must RESOLVE to a curve channel (the wrap in sequence_ui.js); if it does not, the note would stream on MAIN — so it stays a velocity note there, and the status says
                const base = this.routeFor(lane, n.tech), r = this.routeFor(lane, n.tech, n.seat);
                if (!r || !base || (r.ch === base.ch && r.port === base.port)) { this.txDynOwn(n); if (n.dyn.how === 'main') onMain++; }
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
            const S = n.dyn; if (!S || !S.cc7Abs || (S.how !== 'sample' && S.how !== 'follow' && S.how !== 'own')) return;
            const r = this.routeFor(n.lane, n.tech, n.seat); if (!r || !r.out) return;   // `own`: no seat — the note's own channel, the base route
            X.rampPoints(S, n.durMs, RAMP_MS, S.skipMs).forEach(pt => {
                const when = this.base + n.onMs + pt[0] - RAMP_LEAD_MS, cc = pt[1];
                e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, cc]); } catch (x) {} }, Math.max(0, when - performance.now()))); sent++;
            });
        });
        return sent;
    },
    // the status line's account of what went out — a claim about the sound, said rather than assumed
    txDynText(notes) {
        const shaped = (notes || []).filter(n => n.dyn && (n.dyn.how === 'sample' || n.dyn.how === 'follow' || n.dyn.how === 'own'));
        if (!(notes || []).some(n => n.dyn)) return '';
        const follow = shaped.filter(n => n.dyn.how === 'follow').length, own = shaped.filter(n => n.dyn.how === 'own').length;
        let lo = 127, hi = 0; shaped.forEach(n => { lo = Math.min(lo, n.dyn.cc7Abs.lo); hi = Math.max(hi, n.dyn.cc7Abs.hi); });
        const plain = [...new Set((notes || []).filter(n => n.dyn && n.dyn.how === 'plain').map(n => shortOf(n.lane) + (this.txDynKey(n.lane) === 'bowed_vibraphone' ? ' (mallet)' : '')))];
        const main = [...new Set((notes || []).filter(n => n.dyn && n.dyn.how === 'main').map(n => shortOf(n.lane) + ' ' + n.tech))];
        const owns = [...new Set((notes || []).filter(n => n.dyn && n.dyn.how === 'own').map(n => shortOf(n.lane) + ' ' + n.tech))];
        return (shaped.length ? ' · ' + shaped.length + ' on the one scale (' + (shaped.length - follow) + ' set, ' + follow + ' follow) · the fader CC7 ' + lo + '…' + hi + (own && own === shaped.length ? ' on their own channels' : own ? ' on the curve channels, ' + own + ' set on their own channel (no curve copy: ' + owns.join(', ') + ')' : ' on the curve channels') : '') +
            (plain.length ? ' · velocity alone, no measured curve: ' + plain.join(', ') : '') +
            (main.length ? ' · velocity alone — a MOVING fader needs a curve copy the voice has not got: ' + main.join(', ') : '');
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

// ================================================================ 1n.3 — RANGES: `flat` and `ramp` (RUNNING_LOG §266 … §269; PLAN § 1n.3)
// THE RANGE IS THE SELECTION (1m.4.6). A `dynamics` line at the head of the orchestration panel, texture mode only: `low` · `high` (`n`
// for niente at a ramp's low end) · `who` (all, or rows ticked) · `model` (`flat` · `ramp ↑` · `ramp ↓` · `pointillistic` · `waves` — the
// last two arrive with 1n.4 · 1n.5) · `enter` (`abrupt` · `fade N s`) · `seed` ↻ · GENERATE. A generate writes the level of every note in
// the selected columns for the chosen rows as a generator's `{ pts, r }` (seconds from the onset; `r` the range's id); every hand-set value
// inside is overwritten and counted (§267). `flat`: every note at `low`. `ramp`: from `low` to `high` across the stretch by TIME, a held
// note following by `auto`. `enter: fade N s`: the notes in the range's first N seconds ramp from the level BEFORE the range — that row's
// level in the last column before it, else the range's own `low` — to the range's level (§269). Remembered on the document as `ranges`
// `[{ id, columns, rows, low, high, model, dir, dials, enter, seed }]`, drawn as a BAND under the marks with its names on it; a click on the
// band re-selects its columns and refills the line; a generate over columns an older range holds takes those columns from it [call].
const MODELS = { flat: 'flat', up: 'ramp ↑', down: 'ramp ↓', pointillistic: 'pointillistic', waves: 'waves' };
const BAND_COL = '#8ab4d6';
// 1n.4 — THE POINTILLISTIC MODEL (RUNNING_LOG §270): three dials in WORDS. `rate` = how many CHANGES the stream makes over the range's
// N notes · `distribution` = where they fall (a mapping of a uniform draw along the passage) · `contrast` = how far a change moves.
const RATES = { 'every note': n => n, 'every few': n => Math.max(1, Math.round(n / 3)), 'every many': n => Math.max(1, Math.round(n / 8)), 'twice a passage': n => Math.min(n, 2) };
const DISTS = { 'even': u => u, 'few then many': u => Math.sqrt(u), 'many then few': u => u * u };
const CONTRASTS = { 'small steps': 'step', 'any': 'any', 'extremes only': 'ends' };
// the five presets, PROVISIONAL — drafted from what each will sound like, tuned by his ear after the build [call, §275]
const POINT_PRESETS = {
    Webern:   { rate: 'every note', dist: 'even', contrast: 'any' },
    accents:  { rate: 'every many', dist: 'even', contrast: 'extremes only' },
    drift:    { rate: 'every note', dist: 'even', contrast: 'small steps' },
    terraced: { rate: 'twice a passage', dist: 'even', contrast: 'any' },
    wild:     { rate: 'every note', dist: 'few then many', contrast: 'extremes only' },
};
const POINT_PANEL = 'pointPresets', WAVE_PANEL = 'wavePresets';   // both in the SEQUENCE store (bank/sequences.json), beside each other [call]
const DENSITY_WORDS = [['constant', 1], ['busy', 0.8], ['breathing', 0.6], ['occasional', 0.35], ['rare', 0.15]];   // the sequence drawer's own words
const S_ = () => root.SequenceDrawer || null, SEQ_ = () => root.SequenceGen || root.Sequence || null;
const nameOpts = (withN) => (withN ? '<option value="n">n</option>' : '') + X.NAMES.map(n => '<option value="' + n + '">' + n + '</option>').join('');
Object.assign(D, {
    _txDynDraft: null,   // the line's values while nothing stored matches the selection: { low, high, who, model, enter, fadeS, seed }
    txRanges() { const p = this.txCols(); if (!p) return []; if (!Array.isArray(p.ranges)) p.ranges = []; return p.ranges; },
    txRangeById(id) { return this.txRanges().find(r => r.id === id) || null; },
    // the stored range whose columns are exactly the selection, if any
    txRangeOfSel() { const p = this.txCols(); if (!p || !p.sel.length) return null; const s = p.sel.slice().sort().join('|'); return this.txRanges().find(r => (r.columns || []).slice().sort().join('|') === s) || null; },
    txColsByTime(keys) { const tx = this._tx; return (keys || []).slice().sort((a, b) => this.txDot(a).t - this.txDot(b).t); },
    txDynDraft() { if (!this._txDynDraft) this._txDynDraft = { low: 'pp', high: 'mf', who: null, model: 'flat', enter: 'abrupt', fadeS: 2, seed: 1, point: Object.assign({}, POINT_PRESETS.Webern), waves: this.txWavesDefault(), whoMoves: 'each', groups: '' }; return this._txDynDraft; },
    // the waves' dials: the sequence drawer's `breathing` (its own default), without its low · high (the range's) and seed (the line's)
    txWavesDefault(over) { const S = S_(); const w = S && S.wavesDefaults ? S.wavesDefaults(over || undefined) : Object.assign({ shortest: 8, longest: 20, tilt: 0, shape: 'golden', hold: 0.2, density: 0.6 }, over || {}); delete w.seed; delete w.low; delete w.high; delete w.lengths; delete w.peak; return w; },
    // the level function of a range over [t0, t1], by TIME
    txRangeLevel(R, t0, t1) {
        const lo = R.low === 'n' ? X.NIENTE : X.levelOfName(R.low), hi = R.high === 'n' ? X.NIENTE : X.levelOfName(R.high);
        const a = lo == null ? 0 : lo, b = hi == null ? a : hi, span = Math.max(1e-6, t1 - t0);
        if (R.model === 'flat') return () => a;
        if (R.model === 'up') return t => a + (b - a) * Math.max(0, Math.min(1, (t - t0) / span));
        if (R.model === 'down') return t => b + (a - b) * Math.max(0, Math.min(1, (t - t0) / span));
        return () => a;
    },
    // a row's level at the last ON column before `t0` where it plays — the level before the range (§269); null when there is none
    txLevelBefore(p, lane, t0) {
        const on = new Set(p.on || []); let best = null;
        this._tx.dots.forEach(d => { if (!on.has(d.k) || d.t >= t0 - 1e-6) return; const c = p.cols[d.k]; if (!c || !(c.players || []).includes(lane)) return; if (!best || d.t > best.t) best = { t: d.t, k: d.k }; });
        if (!best) return null;
        const c = p.cols[best.k], nt = (c.notes || []).find(n => (n.row != null ? n.row : n.lane) === lane); if (!nt) return null;
        const dur = this.txPlayLenMs(p, this._tx, c, best.k, lane).ms / 1000, pts = X.pointsOf(this.txDynSpec(c, lane), dur, X.levelOfAnchor(nt.vel));
        return pts[pts.length - 1][1];   // where the note before ended
    },
    // GENERATE: the line's values over the selection → a range on the document, every note's level in it written
    txGenerate() {
        const p = this.txCols(); if (!p || !p.sel.length) { this.txGreySay(); return; }
        const d = this.txDynDraft(), have = this.txRangeOfSel();
        if (d.model === 'flat' && d.low === 'n') { this.setStatus('a flat range cannot be niente — give it a dynamic (n is for a ramp\'s low end)', true); return; }
        if (d.model !== 'flat' && d.high === 'n') { this.setStatus('n (niente) is the LOW end of a ramp only — set high to a dynamic', true); return; }
        if (d.model === 'pointillistic' && typeof this.txGenPoint !== 'function') { this.setStatus('the pointillistic model arrives with 1n.4', true); return; }
        if (d.model === 'waves' && typeof this.txGenWaves !== 'function') { this.setStatus('the waves model arrives with 1n.5', true); return; }
        if ((d.model === 'pointillistic' || d.model === 'waves') && (d.low === 'n' || d.low === d.high)) { this.setStatus(MODELS[d.model] + ' needs two written names, low under high (niente is a ramp\'s low end only)', true); return; }
        if (d.model === 'waves' && !(SEQ_() && SEQ_().buildStream)) { this.setStatus('the waves generator (sequence.js buildStream) is not on this page', true); return; }
        this.txPushUndo();
        const cols = this.txColsByTime(p.sel), t0 = this.txDot(cols[0]).t, tEnd = this.txDot(cols[cols.length - 1]).t, T = TRK();
        const rows = Array.isArray(d.who) && d.who.length ? d.who.slice() : null;
        const R = have || { id: 'r' + Date.now().toString(36) + Math.floor(Math.random() * 1e3).toString(36) };
        Object.assign(R, { columns: cols.slice(), rows, low: d.low, high: d.model === 'flat' ? d.low : d.high, model: d.model, enter: d.enter === 'fade' ? { kind: 'fade', s: Math.max(0.05, +d.fadeS || 2) } : { kind: 'abrupt' }, seed: Math.max(1, Math.round(+d.seed || 1)),
            dials: { point: Object.assign({}, d.point || POINT_PRESETS.Webern), waves: this.txWavesDefault(d.waves), whoMoves: d.whoMoves || 'each', groups: d.groups || '' } });
        // an older range's columns taken over [call]; one left with none goes
        const ranges = this.txRanges(), mine = new Set(cols);
        for (let i = ranges.length - 1; i >= 0; i--) { const o = ranges[i]; if (o === R) continue; o.columns = (o.columns || []).filter(k => !mine.has(k)); if (!o.columns.length) ranges.splice(i, 1); }
        if (!have) ranges.push(R);
        const L = this.txRangeLevel(R, t0, tEnd), fadeS = R.enter.kind === 'fade' ? R.enter.s : 0;
        let written = 0, hand = 0, faded = 0; const special = (d.model === 'pointillistic' || d.model === 'waves') ? (d.model === 'pointillistic' ? this.txGenPoint(R, cols, t0, tEnd) : this.txGenWaves(R, cols, t0, tEnd)) : null;   // 1n.4 · 1n.5: a level function per row, or per note
        cols.forEach(k => {
            const c = p.cols[k]; if (!c) return; const t = this.txDot(k).t;
            (c.notes || []).forEach(nt => {
                const lane = nt.row != null ? nt.row : nt.lane; if (rows && !rows.includes(lane)) return; if (!(c.players || []).includes(lane)) return;
                const dur = this.txPlayLenMs(p, this._tx, c, k, lane).ms / 1000;
                let at = special ? special(lane, k, t) : null;   // a function of time for this note (the waves' carries its shape as `.pts`), or null → the range's own
                const lv = (typeof at === 'function') ? at : L;
                let pts;
                if (fadeS > 0 && t < t0 + fadeS - 1e-9) {
                    const before = this.txLevelBefore(p, lane, t0), from = before == null ? (R.low === 'n' ? X.NIENTE : X.levelOfName(R.low)) : before;
                    const f = tt => { const u = Math.max(0, Math.min(1, (tt - t0) / fadeS)); return from + (lv(tt) - from) * u; };
                    pts = [[0, f(t)], [dur, f(t + dur)]]; faded++;
                } else pts = [[0, lv(t)], [dur, lv(t + dur)]];
                if (!(fadeS > 0 && t < t0 + fadeS - 1e-9) && at && at.pts) pts = at.pts;   // a model that gives the whole shape itself (the waves); inside a fade the two ends stand for it
                c.dyn = c.dyn || {}; if (c.hand && c.hand[lane]) { hand++; delete c.hand[lane]; }
                c.dyn[lane] = { pts: pts.map(q => [+q[0].toFixed(3), +(+q[1]).toFixed(4)]), r: R.id }; written++;
            });
        });
        this._txDynEdited = false;   // the stored range now IS the line
        this.txPersistSoon(); this.txRender(); this.txPaintDynLine();
        this.setStatus('generated ' + MODELS[R.model] + ' ' + (R.model === 'flat' ? R.low : R.low + ' → ' + R.high) + ' over ' + cols.length + ' columns (' + t0.toFixed(2) + '–' + tEnd.toFixed(2) + ' s)' + (rows ? ' · rows ' + rows.map(l => T[l] ? T[l].short : l).join(' ') : ' · every row') + ' · ' + written + ' notes' + (hand ? ' · ' + hand + ' hand-set value' + (hand === 1 ? '' : 's') + ' overwritten' : '') + (fadeS ? ' · enter: fade ' + fadeS + ' s (' + faded + ' notes in it)' : ' · enter: abrupt') + (have ? ' · re-generated' : ''));
    },
    // a click on a band: its columns become the selection, the line refilled
    txSelectRangeById(id) {
        const p = this.txCols(), R = this.txRangeById(id); if (!p || !R) return;
        const cols = this.txColsByTime((R.columns || []).filter(k => (p.on || []).includes(k))); if (!cols.length) return;
        this.txPushUndo(); p.sel = cols.slice(); this._txDynDraft = null; this._txDynEdited = false;
        if (p.cols[cols[0]]) this.txRecall(cols[0], true);
        this.txPersistSoon(); this.txRender(); this.txPaintDynLine();
        this.setStatus('range ' + MODELS[R.model] + ' ' + (R.model === 'flat' ? R.low : R.low + ' → ' + R.high) + ' selected · ' + cols.length + ' columns — change the line and generate to re-run it');
    },
    // the `dynamics` line at the head of the orchestration panel (texture mode only); filled from the stored range the selection matches, else the draft
    txPaintDynLine() {
        const orch = this.el && this.el.querySelector('#skOrch'); if (!orch) return;
        const on = this.txIsOn(); let line = orch.querySelector('#txDynLine');
        if (!on) { if (line) line.remove(); return; }   // THE SHIELD
        const p = this.txCols(), k = p && this.txPrimary(), T = TRK();
        if (!line) {
            line = document.createElement('div'); line.id = 'txDynLine';
            line.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;align-items:center;padding:2px 6px;font-size:10px;border-bottom:1px solid #333';
            line.innerHTML = '<span style="color:#9a9;cursor:help" title="PLAN 1n.3 (2026-09-22): DYNAMICS over the SELECTED columns (the range is the selection: click · SHIFT+click · CTRL+click). Set low, high, who, the model and how the range is entered, then generate: every note in it takes its level, hand-set values overwritten (the status counts them). The range is remembered on the pattern and drawn as a band under the marks; a click on the band re-selects it">dynamics</span>' +
                '<label title="the level (flat), or the ramp\'s start (ramp ↑) / end (ramp ↓); n = niente, a ramp\'s low end only">low <select id="txDLo" style="' + INP + '">' + nameOpts(true) + '</select></label>' +
                '<label title="the ramp\'s other end (a flat range uses low alone)">high <select id="txDHi" style="' + INP + '">' + nameOpts(false) + '</select></label>' +
                '<span title="every row, or only the rows ticked"><button id="txDWho" style="' + BTN_ + '">who: all ▾</button><span id="txDWhoRows" style="display:none;gap:4px;margin-left:4px"></span></span>' +
                '<label title="flat: one level · ramp: from low to high (or high to low) across the stretch by TIME, a held note following it by auto · pointillistic: every note its own level between the two, by rate and distribution (1n.4) · waves: the sequence\'s streams of swells between the two, who moves (1n.5)">model <select id="txDModel" style="' + INP + '">' + Object.keys(MODELS).map(m => '<option value="' + m + '">' + MODELS[m] + '</option>').join('') + '</select></label>' +
                '<span id="txDPoint" style="display:none;gap:5px;align-items:center;flex-wrap:wrap">' +
                    '<label title="PLAN 1n.4: the pointillistic PRESETS — provisional, tuned by your ear; a moved dial reads custom; save preset keeps your own beside the wave presets">preset <select id="txDPPre" style="' + INP + '"></select></label>' +
                    '<label title="how often the level CHANGES along the passage — the stream runs over every note of the chosen rows in time order, so the texture as a whole is pointillistic">rate <select id="txDPRate" style="' + INP + '">' + Object.keys(RATES).map(k => '<option value="' + k + '">' + k + '</option>').join('') + '</select></label>' +
                    '<label title="WHERE the changes fall: evenly, few early then many, many early then few">distribution <select id="txDPDist" style="' + INP + '">' + Object.keys(DISTS).map(k => '<option value="' + k + '">' + k + '</option>').join('') + '</select></label>' +
                    '<label title="how far a change moves: a neighbouring name · any name between low and high · the two ends only (a change is a single-note accent to the far end; the rest at low)">contrast <select id="txDPCon" style="' + INP + '">' + Object.keys(CONTRASTS).map(k => '<option value="' + k + '">' + k + '</option>').join('') + '</select></label>' +
                    '<button id="txDPSave" style="' + BTN_ + '" title="keep these three dials as a preset of your own, under a name — in the sequence store beside the wave presets">save preset</button></span>' +
                '<span id="txDWaves" style="display:none;gap:5px;align-items:center;flex-wrap:wrap">' +
                    '<label title="PLAN 1n.5: the sequence drawer\'s wave presets — ONE library (bank/sequences.json wavePresets): one saved there is here, one saved here is there">preset <select id="txDWPre" style="' + INP + '"></select></label>' +
                    '<label title="the shortest swell, seconds">short <input id="txDWShort" type="number" min="0.5" step="0.5" style="' + INP + ';width:40px"></label>' +
                    '<label title="the longest swell, seconds">long <input id="txDWLong" type="number" min="0.5" step="0.5" style="' + INP + ';width:40px"></label>' +
                    '<label title="−1 short … +1 long: which lengths the draw favours">tilt <input id="txDWTilt" type="number" min="-1" max="1" step="0.1" style="' + INP + ';width:40px"></label>' +
                    '<label title="the swell\'s shape: where its top sits">shape <select id="txDWShape" style="' + INP + '"></select></label>' +
                    '<label title="how long a swell sits at its top, a share of its length">hold <input id="txDWHold" type="number" min="0" max="1" step="0.05" style="' + INP + ';width:40px"></label>' +
                    '<label title="how much of the time a player is inside a swell — the rest sits at low">density <select id="txDWDen" style="' + INP + '"></select></label>' +
                    '<label title="WHO MOVES (§271): each player — a stream of their own · together — one stream for every chosen row · groups — your grouping typed beside, e.g. EH Bsn | Hn Tpt | Vc Db | Perc, one stream per group (a row not named keeps its own)">who moves <select id="txDWWho" style="' + INP + '"><option value="each">each player</option><option value="together">together</option><option value="groups">groups</option></select></label>' +
                    '<input id="txDWGroups" type="text" placeholder="EH Bsn | Hn Tpt | Vc Db | Perc" spellcheck="false" style="' + INP + ';width:150px" title="the groups, the rows\' short names, | between groups">' +
                    '<button id="txDWSave" style="' + BTN_ + '" title="keep these dials as a wave preset of your own, under a name — the sequence drawer sees it too">save preset</button></span>' +
                '<label title="how the range is ENTERED: abrupt — the first note sounds at the range\'s level · fade N s — the notes in the range\'s first N seconds ramp from the level before the range (that row\'s level in the last column before it, else the range\'s low) to the range\'s level">enter <select id="txDEnter" style="' + INP + '"><option value="abrupt">abrupt</option><option value="fade">fade</option></select> <input id="txDFade" type="number" min="0.05" step="0.5" style="' + INP + ';width:40px" title="the fade\'s seconds"> s</label>' +
                '<label title="the seed of a pointillistic or waves deal; ↻ the next">seed <input id="txDSeed" type="number" min="1" step="1" style="' + INP + ';width:40px"><button id="txDNext" style="' + BTN_ + '" title="the next seed">↻</button></label>' +
                '<button id="txDGen" style="' + BTN_ + ';color:#e8cf9a" title="write the level of every note in the selected columns for the chosen rows — hand-set values are overwritten and counted">generate</button>' +
                '<span id="txDNote" style="color:#8ab4d6"></span>';
            orch.insertBefore(line, orch.firstChild);
            const q = s => line.querySelector(s), read = () => { const d = this.txDynDraft(); d.low = q('#txDLo').value; d.high = q('#txDHi').value; d.model = q('#txDModel').value; d.enter = q('#txDEnter').value; d.fadeS = +q('#txDFade').value || d.fadeS; d.seed = Math.max(1, Math.round(+q('#txDSeed').value || 1)); this.txPaintDynLine(); };
            ['#txDLo', '#txDHi', '#txDModel', '#txDEnter', '#txDFade', '#txDSeed'].forEach(s => { q(s).addEventListener('change', e => { if (e.target.tagName === 'SELECT') e.target.blur(); this.txDraftFromLine(); read(); }); q(s).addEventListener('keydown', ev => { ev.stopPropagation(); if (isEnter(ev)) { ev.preventDefault(); ev.target.blur(); } }); });
            q('#txDNext').addEventListener('click', () => { this.txDraftFromLine(); const d = this.txDynDraft(); d.seed = Math.max(1, Math.round(+d.seed || 1)) + 1; this.txPaintDynLine(); });
            q('#txDWho').addEventListener('click', () => { const r = q('#txDWhoRows'); r.style.display = r.style.display === 'none' ? 'inline-flex' : 'none'; });
            q('#txDGen').addEventListener('click', () => { this.txDraftFromLine(); this.txGenerate(); });
            // 1n.4 · 1n.5: the models' dials — a change reads the line into the draft (a moved dial makes the preset `custom`); a preset fills its dials
            ['#txDPRate', '#txDPDist', '#txDPCon', '#txDWShort', '#txDWLong', '#txDWTilt', '#txDWShape', '#txDWHold', '#txDWDen', '#txDWWho', '#txDWGroups'].forEach(s => { const el = q(s); el.addEventListener('change', e => { if (e.target.tagName === 'SELECT') e.target.blur(); this.txDraftFromLine(); this.txPaintDynLine(); }); el.addEventListener('keydown', ev => { ev.stopPropagation(); if (isEnter(ev)) { ev.preventDefault(); ev.target.blur(); } }); });
            q('#txDPPre').addEventListener('change', e => { const n = e.target.value; e.target.blur(); if (n) this.txApplyPointPreset(n); });
            q('#txDWPre').addEventListener('change', e => { const n = e.target.value; e.target.blur(); if (n) this.txApplyWavePreset(n); });
            q('#txDPSave').addEventListener('click', () => this.txSavePointPreset());
            q('#txDWSave').addEventListener('click', () => this.txSaveWavePreset());
        }
        const q = s => line.querySelector(s), R = this.txRangeOfSel(), d = this.txDynDraft();
        if (R && !this._txDynEdited) { d.low = R.low; d.high = R.high; d.model = R.model; d.enter = R.enter && R.enter.kind === 'fade' ? 'fade' : 'abrupt'; if (R.enter && R.enter.s) d.fadeS = R.enter.s; d.seed = R.seed || 1; d.who = R.rows ? R.rows.slice() : null;
            const dl = R.dials || {}; if (dl.point) d.point = Object.assign({}, dl.point); if (dl.waves) d.waves = this.txWavesDefault(dl.waves); if (dl.whoMoves) d.whoMoves = dl.whoMoves; if (dl.groups != null) d.groups = dl.groups; }
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#txDLo', d.low); put('#txDHi', d.high); put('#txDModel', d.model); put('#txDEnter', d.enter); put('#txDFade', d.fadeS); put('#txDSeed', d.seed);
        q('#txDHi').disabled = d.model === 'flat'; q('#txDHi').style.opacity = d.model === 'flat' ? 0.45 : ''; q('#txDFade').disabled = d.enter !== 'fade';
        // 1n.4 · 1n.5: the model's own dials, shown for the model in force
        q('#txDPoint').style.display = d.model === 'pointillistic' ? 'inline-flex' : 'none'; q('#txDWaves').style.display = d.model === 'waves' ? 'inline-flex' : 'none';
        if (d.model === 'pointillistic') {
            const P = d.point, names = this.txPointPresetNames(), here = this.txPointPresetMatch(P), mine = this.txPresetIx(POINT_PANEL);
            const sig = names.map(n => n + (mine[n] ? '*' : '')).join('|') + '@' + here; if (sig !== this._txPPreSig) { this._txPPreSig = sig; q('#txDPPre').innerHTML = '<option value="">' + (here ? '— ' + here + ' —' : '— custom —') + '</option>' + names.map(n => '<option value="' + n + '">' + n + (mine[n] ? (POINT_PRESETS[n] ? ' (yours, over the built-in)' : ' (yours)') : '') + '</option>').join(''); }
            q('#txDPPre').value = ''; put('#txDPRate', P.rate); put('#txDPDist', P.dist); put('#txDPCon', P.contrast);
        }
        if (d.model === 'waves') {
            const W = d.waves, S = S_(), SEQ = SEQ_(), names = S && S.presetNames ? S.presetNames() : [], here = this.txWavePresetMatch(W), mine = this.txPresetIx(WAVE_PANEL);
            const sig = names.map(n => n + (mine[n] ? '*' : '')).join('|') + '@' + here; if (sig !== this._txWPreSig) { this._txWPreSig = sig; q('#txDWPre').innerHTML = '<option value="">' + (here ? '— ' + here + ' —' : '— your own dials —') + '</option>' + names.map(n => '<option value="' + n + '">' + n + (mine[n] ? ' (yours)' : '') + '</option>').join(''); }
            q('#txDWPre').value = '';
            if (!q('#txDWShape').options.length && SEQ) q('#txDWShape').innerHTML = Object.keys(SEQ.SHAPES).map(s => '<option value="' + s + '">' + s + '</option>').join('');
            if (!q('#txDWDen').options.length) q('#txDWDen').innerHTML = DENSITY_WORDS.map(p => '<option value="' + p[0] + '">' + p[0] + '</option>').join('');
            put('#txDWShort', W.shortest); put('#txDWLong', W.longest); put('#txDWTilt', W.tilt || 0); put('#txDWShape', W.shape); put('#txDWHold', W.hold);
            const dw = DENSITY_WORDS.find(p => Math.abs(p[1] - W.density) < 1e-9); put('#txDWDen', dw ? dw[0] : 'breathing');
            put('#txDWWho', d.whoMoves || 'each'); put('#txDWGroups', d.groups || ''); q('#txDWGroups').style.display = d.whoMoves === 'groups' ? '' : 'none';
        }
        const rowsBox = q('#txDWhoRows');
        if (!rowsBox.children.length) { rowsBox.innerHTML = T.map((t, i) => '<label style="display:inline-flex;align-items:center;gap:1px"><input type="checkbox" data-lane="' + i + '">' + t.short + '</label>').join(''); rowsBox.querySelectorAll('input').forEach(cb => cb.addEventListener('change', () => { const on = [...rowsBox.querySelectorAll('input')].filter(x => x.checked).map(x => +x.dataset.lane); this.txDynDraft().who = on.length && on.length < T.length ? on : null; this._txDynEdited = true; this.txPaintDynLine(); })); }
        rowsBox.querySelectorAll('input').forEach(cb => { cb.checked = !d.who || d.who.includes(+cb.dataset.lane); });
        q('#txDWho').textContent = 'who: ' + (d.who ? d.who.map(l => T[l] ? T[l].short : l).join(' ') : 'all') + ' ▾';
        line.style.opacity = k ? '' : 0.45; q('#txDGen').disabled = !k;
        q('#txDNote').textContent = !k ? '' : R ? 'this selection is the range "' + MODELS[R.model] + ' ' + (R.model === 'flat' ? R.low : R.low + ' → ' + R.high) + '" — generate re-runs it' : (p.sel.length + ' column' + (p.sel.length === 1 ? '' : 's') + ' selected — generate makes a range of them');
    },
    txDraftFromLine() {
        const line = this.el && this.el.querySelector('#txDynLine'); if (!line) return; const q = s => line.querySelector(s), d = this.txDynDraft();
        d.low = q('#txDLo').value; d.high = q('#txDHi').value; d.model = q('#txDModel').value; d.enter = q('#txDEnter').value; d.fadeS = +q('#txDFade').value || d.fadeS; d.seed = Math.max(1, Math.round(+q('#txDSeed').value || 1));
        if (q('#txDPoint').style.display !== 'none') { d.point = { rate: q('#txDPRate').value, dist: q('#txDPDist').value, contrast: q('#txDPCon').value }; }
        if (q('#txDWaves').style.display !== 'none') {
            const W = d.waves, num = (s, def) => { const v = q(s).value.trim(); return v === '' || !isFinite(+v) ? def : +v; };
            W.shortest = Math.max(0.5, num('#txDWShort', W.shortest)); W.longest = Math.max(W.shortest, num('#txDWLong', W.longest)); W.tilt = Math.max(-1, Math.min(1, num('#txDWTilt', 0)));
            const SEQ = SEQ_(); W.shape = (SEQ && SEQ.SHAPES[q('#txDWShape').value] != null) ? q('#txDWShape').value : W.shape; W.hold = Math.max(0, Math.min(1, num('#txDWHold', W.hold)));
            const den = DENSITY_WORDS.find(p => p[0] === q('#txDWDen').value); W.density = den ? den[1] : W.density;
            d.whoMoves = q('#txDWWho').value; d.groups = q('#txDWGroups').value;
        }
        this._txDynEdited = true;
    },
    // THE BAND under the marks: one per range, its columns' span, its names on it; behind the pointer (a click is read by geometry in txDown)
    txDynBands(p) {
        const svg = this.el && this.el.querySelector('#txSvg'), run = svg && svg.querySelector('#txRun'); if (!svg || !run || !this._tx || !p) return;
        const mw = this.txMarkW(), W = this.txW(), y = 24 + 18 - 5, h = 10; let s = ''; this._txBands = [];   // ROW_TOP + MARK_H of texture_cols.js
        (p.ranges || []).forEach(R => {
            const cols = this.txColsByTime((R.columns || []).filter(k => this._tx.dots.some(d => d.k === k))); if (!cols.length) return;
            const x0 = this.txX(this.txDot(cols[0]).t), x1 = this.txX(this.txDot(cols[cols.length - 1]).t) + mw; if (x1 < 0 || x0 > W) return;
            const label = MODELS[R.model] + ' ' + (R.model === 'flat' ? R.low : R.low + '→' + R.high) + (R.enter && R.enter.kind === 'fade' ? ' · fade ' + R.enter.s + ' s' : '') + (R.rows ? ' · ' + R.rows.map(l => (TRK()[l] || {}).short || l).join(' ') : '');
            const sel = this.txRangeOfSel() === R;
            s += '<rect class="txBand" x="' + Math.max(-2, x0).toFixed(1) + '" y="' + y + '" width="' + Math.max(2, Math.min(W + 4, x1) - Math.max(-2, x0)).toFixed(1) + '" height="' + h + '" rx="2" fill="' + BAND_COL + '" fill-opacity="' + (sel ? 0.55 : 0.3) + '" stroke="' + (sel ? BAND_COL : 'none') + '" pointer-events="none"/>' +
                 '<text x="' + (Math.max(2, x0) + 3).toFixed(1) + '" y="' + (y + 8) + '" font-size="8" fill="#dfeeff" pointer-events="none">' + label + '</text>';
            this._txBands.push({ id: R.id, x0, x1, y0: y, y1: y + h });
        });
        if (s) run.insertAdjacentHTML('beforebegin', s);
    },
    txBandHit(ev) {
        const svg = this.el.querySelector('#txSvg'), rect = svg.getBoundingClientRect(), x = ev.clientX - rect.left, y = ev.clientY - rect.top;
        return (this._txBands || []).find(b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) || null;
    },
});
const BTN_ = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
// ================================================================ 1n.4 · 1n.5 — THE TWO GENERATORS AND THEIR PRESETS
Object.assign(D, {
    // THE POINTILLISTIC DEAL (§270; PLAN § 1n.4): ONE seeded stream over the range's notes in TIME ORDER across the chosen rows [call] —
    // `rate` says how many CHANGES fall on the N notes, `distribution` where (a uniform draw mapped along the passage), `contrast` how far
    // each moves: `small steps` a neighbouring name that then HOLDS · `any` any name between low and high (never the one in force), held ·
    // `extremes only` — the rest sit at `low` and a change is a single-note ACCENT to the far end (the loud note in a quiet section); with a
    // change on every note the ends alternate. Every level a written name; a held note reads it by `auto`. Answers (lane, k, t) → () => level.
    txGenPoint(R, cols, t0, tEnd) {
        const p = this.txCols(), rows = R.rows, P = (R.dials && R.dials.point) || POINT_PRESETS.Webern, SEQ = SEQ_();
        const list = []; cols.forEach(k => { const c = p.cols[k]; if (!c) return; const t = this.txDot(k).t; (c.notes || []).forEach(nt => { const lane = nt.row != null ? nt.row : nt.lane; if (rows && !rows.includes(lane)) return; if (!(c.players || []).includes(lane)) return; list.push({ k, lane, t }); }); });
        list.sort((a, b) => a.t - b.t || a.lane - b.lane);
        const N = list.length, out = new Map(); if (!N) return () => null;
        const rng = SEQ && SEQ.rngFor ? SEQ.rngFor(R.seed, 'point:' + R.id, 0) : (() => { let s = ((R.seed | 0) * 2654435761 + 12345) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
        const iA = X.NAMES.indexOf(R.low), iB = X.NAMES.indexOf(R.high), a = Math.min(iA, iB), b = Math.max(iA, iB);
        const M = (RATES[P.rate] || RATES['every note'])(N), map = DISTS[P.dist] || DISTS.even, mode = CONTRASTS[P.contrast] || 'any';
        const pos = new Set(); if (P.rate === 'every note') { for (let i = 0; i < N; i++) pos.add(i); } else { for (let j = 0; j < M; j++) pos.add(Math.min(N - 1, Math.floor(map(rng()) * N))); }
        let cur = mode === 'ends' ? a : a + Math.floor(rng() * (b - a + 1)), prev = cur;
        list.forEach((n, i) => {
            let lv;
            if (mode === 'ends') lv = pos.has(i) ? (prev === a ? b : a) : a;
            else if (pos.has(i)) {
                if (mode === 'step') { const dir = rng() < 0.5 ? -1 : 1; let nx = cur + dir; if (nx < a || nx > b) nx = cur - dir; cur = Math.max(a, Math.min(b, nx)); }
                else { let nx = a + Math.floor(rng() * (b - a + 1)); if (b > a && nx === cur) nx = a + ((nx - a + 1 + Math.floor(rng() * (b - a))) % (b - a + 1)); cur = nx; }
                lv = cur;
            } else lv = cur;
            prev = lv; out.set(n.k + '|' + n.lane, lv / X.STEPS);
        });
        return (lane, k) => { const v = out.get(k + '|' + lane); return v == null ? null : (() => v); };
    },
    // THE WAVES MODEL (§271; PLAN § 1n.5): the sequence's `buildStream` run over the range's span with the line's dials, each stream a 0 … 1
    // height in seconds from the range's start, mapped between the range's two names; a stream per row (`each player`), one for every
    // chosen row (`together`) or one per typed group (`groups`, a row not named keeps its own). A note reads its stream across its span —
    // the breakpoints inside it — a short note sampling at its onset, a held one by `auto`. Answers (lane, k, t) → a function of time
    // carrying the note's own shape as `.pts`.
    txGenWaves(R, cols, t0, tEnd) {
        const SEQ = SEQ_(); if (!SEQ || !SEQ.buildStream) return null;
        const p = this.txCols(), W0 = this.txWavesDefault((R.dials && R.dials.waves) || null), lo = X.levelOfName(R.low), hi = X.levelOfName(R.high), T = TRK();
        const W = { lo, hi, density: +W0.density, peak: 0.5, seed: R.seed | 0, shape: W0.shape, rise: SEQ.SHAPES[W0.shape] != null ? SEQ.SHAPES[W0.shape] : SEQ.SHAPES[SEQ.DEFAULT_SHAPE], hold: +W0.hold, shortest: +W0.shortest, longest: +W0.longest, tilt: +W0.tilt || 0 };
        const who = (R.dials && R.dials.whoMoves) || 'each', keyOf = {};
        if (who === 'groups') { const groups = String((R.dials && R.dials.groups) || '').split('|').map(g => g.trim().toLowerCase().split(/[\s,]+/).filter(Boolean)); T.forEach((t, i) => { const gi = groups.findIndex(g => g.includes(String(t.short || '').toLowerCase())); keyOf[i] = gi >= 0 ? 'group' + gi : 'row' + i; }); }
        else T.forEach((t, i) => { keyOf[i] = who === 'together' ? 'all' : 'row' + i; });
        const until = (tEnd - t0) + Math.max(60, W.longest * 2), streams = {};
        const streamOf = key => streams[key] || (streams[key] = SEQ.buildStream(null, W, R.id + ':' + key, until).points);
        return (lane, k, t) => {
            const c = p.cols[k]; if (!c) return null;
            const dur = this.txPlayLenMs(p, this._tx, c, k, lane).ms / 1000, pts = streamOf(keyOf[lane]), x0 = t - t0, x1 = x0 + dur;
            const lvl = x => lo + (hi - lo) * SEQ.levelAt(pts, x);
            const fn = tt => lvl(tt - t0);
            const L = [[0, lvl(x0)]]; pts.forEach(q => { if (q[0] > x0 + 1e-6 && q[0] < x1 - 1e-6) L.push([q[0] - x0, lo + (hi - lo) * q[1]]); }); L.push([dur, lvl(x1)]);
            fn.pts = L; return fn;
        };
    },
    // ---------------------------------------------------------------- the presets: the pointillistic ones beside the wave presets in the SEQUENCE store [call]
    txPresetIx(panel) { const S = S_(); return (S && S._lib && S._lib[panel]) || {}; },
    txPointPresetNames() { const mine = Object.keys(this.txPresetIx(POINT_PANEL)).sort((a, b) => a.localeCompare(b)), built = Object.keys(POINT_PRESETS); return built.concat(mine.filter(n => built.indexOf(n) < 0)); },
    txPointPresetOf(name) { const his = this.txPresetIx(POINT_PANEL)[name]; if (his && his.state && his.state.point) return Object.assign({}, his.state.point); return POINT_PRESETS[name] ? Object.assign({}, POINT_PRESETS[name]) : null; },
    txPointPresetMatch(P) { if (!P) return null; return this.txPointPresetNames().find(n => { const q = this.txPointPresetOf(n); return q && q.rate === P.rate && q.dist === P.dist && q.contrast === P.contrast; }) || null; },
    txApplyPointPreset(name) { const q = this.txPointPresetOf(name); if (!q) { this.setStatus('no pointillistic preset named "' + name + '"', true); return; } this.txDraftFromLine(); this.txDynDraft().point = q; this._txDynEdited = true; this.txPaintDynLine(); this.setStatus('pointillistic preset "' + name + '": ' + q.rate + ' · ' + q.dist + ' · ' + q.contrast + ' — generate'); },
    txWavePresetMatch(W) { const S = S_(); if (!S || !S.presetNames || !W) return null; return S.presetNames().find(n => { const q = S.presetOf(n); return q && q.shape != null && ['shortest', 'longest', 'tilt', 'hold', 'density'].every(k => Math.abs((+q[k] || 0) - (+W[k] || 0)) < 1e-9) && q.shape === W.shape; }) || null; },
    txApplyWavePreset(name) { const S = S_(), q = S && S.presetOf ? S.presetOf(name) : null; if (!q) { this.setStatus('no wave preset named "' + name + '"', true); return; } this.txDraftFromLine(); this.txDynDraft().waves = this.txWavesDefault(q); this._txDynEdited = true; this.txPaintDynLine(); this.setStatus('waves preset "' + name + '": ' + q.shortest + '–' + q.longest + ' s · ' + q.shape + ' · hold ' + q.hold + ' — generate'); },
    async txSavePreset(panel, key, value, nameGiven, suggest) {
        const S = S_(); if (!S || !S.libPost) { this.setStatus('the sequence store is not on this page', true); return false; }
        const name = String(nameGiven || window.prompt('Keep these dials as a preset called:', suggest || '') || '').trim(); if (!name) return false;
        if (!/^[A-Za-z0-9._ -]{1,64}$/.test(name)) { this.setStatus('a preset name may hold letters, digits, dot, underscore, space or hyphen, up to 64 — not "' + name + '"', true); return false; }
        const state = {}; state[key] = JSON.parse(JSON.stringify(value));
        try { await S.libPost({ panel, name, state }); } catch (e) { this.setStatus('the preset did not save: ' + (e && e.message || e), true); return false; }
        S._lib = S._lib || {}; (S._lib[panel] = S._lib[panel] || {})[name] = { saved: new Date().toISOString(), state };
        this._txPPreSig = ''; this._txWPreSig = ''; if (S._preSig != null) S._preSig = ''; if (typeof S.paintWaves === 'function' && S.isOpen && S.isOpen()) try { S.paintWaves(); } catch (e) {}
        this.txPaintDynLine(); return name;
    },
    async txSavePointPreset(nameGiven) { this.txDraftFromLine(); const P = this.txDynDraft().point; const n = await this.txSavePreset(POINT_PANEL, 'point', P, nameGiven, this.txPointPresetMatch(P)); if (n) this.setStatus('pointillistic preset "' + n + '" saved · bank/sequences.json, beside the wave presets'); },
    async txSaveWavePreset(nameGiven) { this.txDraftFromLine(); const d = this.txDynDraft(), w = Object.assign(this.txWavesDefault(d.waves), { low: d.low, high: d.high }); const n = await this.txSavePreset(WAVE_PANEL, 'waves', w, nameGiven, this.txWavePresetMatch(d.waves)); if (n) this.setStatus('waves preset "' + n + '" saved · bank/sequences.json — the sequence drawer sees it too'); },
});
// the undo snapshot carries the ranges too
const _txUndoSnap = D.txUndoSnap;
D.txUndoSnap = function () { const s = _txUndoSnap.apply(this, arguments); if (s == null) return s; const p = this.txCols(); const o = JSON.parse(s); o.ranges = (p && p.ranges) || []; return JSON.stringify(o); };
const _txRestore = D.txRestore;
D.txRestore = function (s) { const r = _txRestore.apply(this, arguments); try { const p = this.txCols(); const o = JSON.parse(s); if (p) p.ranges = Array.isArray(o.ranges) ? o.ranges : []; this._txDynEdited = false; this.txPaintDynLine(); } catch (e) {} return r; };
// the bands after the columns; the line after the panel; a click on a band re-selects; a fresh selection resets the line to the stored range
const _txRenderCols2 = D.txRenderCols;
D.txRenderCols = function () { const r = _txRenderCols2.apply(this, arguments); try { if (this.txIsOn()) { const p = this.txCols(); if (p && this._tx) this.txDynBands(p); this.txPaintDynLine(); } } catch (e) { console.warn('[texture_dyn] bands:', e); } return r; };
const _renderOrch2 = D.renderOrch;
D.renderOrch = function () { const r = _renderOrch2.apply(this, arguments); try { this.txPaintDynLine(); } catch (e) { console.warn('[texture_dyn] line:', e); } return r; };
const _txDown = D.txDown;
D.txDown = function (ev) {
    try { if (this.txIsOn() && this._tx && ev.button === 0 && !ev.shiftKey && !ev.ctrlKey) { const b = this.txBandHit(ev); if (b) { ev.preventDefault(); this.txSelectRangeById(b.id); return; } } } catch (e) { console.warn('[texture_dyn] band click:', e); }
    return _txDown.apply(this, arguments);
};
['txSelect', 'txSelectRange', 'txClearSel'].forEach(name => { const orig = D[name]; if (typeof orig !== 'function') return; D[name] = function () { this._txDynEdited = false; return orig.apply(this, arguments); }; });

// the count in the status: the row's line and the column's line both carry it (the flag is drawn by texture_cols.js txRenderCols)
const _txLine = D.txLine;
D.txLine = function () { const s = _txLine.apply(this, arguments); try { return this._tx ? s + this.txCollisionText(this.txCollisions()) : s; } catch (e) { return s; } };
const _txColLine = D.txColLine;
D.txColLine = function () { const s = _txColLine.apply(this, arguments); try { return s + this.txCollisionText(this.txCollisions()); } catch (e) { return s; } };

root.TextureDyn.WARN = WARN;
}(typeof self !== 'undefined' ? self : this));
