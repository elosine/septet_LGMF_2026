// beating_calc.js — the beating math (PLAN 1f; docs/BEATING_TOOL.md): a pure module shared by the composer page (window.BeatingCalc)
// and the node tools (require), the accel calculator's pattern — no DOM, no MIDI, no players. A BEATING (the composer's word,
// RUNNING_LOG §146) is one pair of players on one centre pitch, both bending around it by mirrored curves, the gap beating.
//
// STEP 1 — THE PALETTE (2026-09-07): who may bend how far, and who may pair with whom.
//   players(recipe)                      the bending players in score order (the piano is out, CN-34: `beating: false`)
//   ordinaryVoice / ordinaryRange        the instrument's ordinary voice (the recipe's `ordinary`) and its measured range [lo, hi]
//   bendLimits(recipe, inst)             { playerSt, samplerSt, measured, limitSt, limitCents } — the player's semitone (his rule) and the
//                                        sampler's range (the bend probe → bendRangeSt); the limit is the smaller
//   holds(recipe, inst, pitch)           can this player sit on this pitch: inside the ordinary range and able to bend
//   pairsFor(recipe, pitch, interval)    every pair of two players that can play the pair's two notes — at unison both hold the pitch;
//                                        at an interval one holds the lower note and the other the upper (the assignment follows the
//                                        ranges: the higher-ranged player takes the upper note when both could)
//   pairingTable(recipe, pitches, iv)    pairsFor over a list of pitches (the panel's dimming, the doc's table)
//   INTERVALS                            unison · m3 · M3 · P4 · P5: semitones, the just ratio, the coincident partial (§148: at a fifth
//                                        the beating is between the lower's 3rd and the upper's 2nd partial — p = 3), the just offset
//                                        in cents against equal temperament (+2 · −2 · −14 · +16, the tool's zero)
// STEP 2 — the beating math proper (rate ↔ cents by pitch and interval, the curves and their difference, the breaths, the stretch)
// follows in this file.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BeatingCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const ORDER = ['flute', 'bass_clarinet', 'piano', 'violin1', 'violin2', 'viola', 'cello'];   // D10 score order
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

  // the intervals inside a pair (RUNNING_LOG §148): ratio p:q, the beating between the lower's p-th and the upper's q-th partial,
  // p times the unison's rate per cent; the just offset = 1200·log2(p/q) − 100·semitones (the tempered interval already beats by it)
  // the octave (2026-09-07, RUNNING_LOG §180, Q1: "at most an octave apart" is the rule — unison · fifth · octave the usual three, the
  // thirds and the fourth kept as tries, nothing wider): ratio 2:1, the beating between the lower's 2nd partial and the upper's 1st,
  // no just offset
  const INTERVALS = {};
  for (const [key, label, semitones, p, q] of [['unison', 'unison', 0, 1, 1], ['m3', 'minor third', 3, 6, 5], ['M3', 'major third', 4, 5, 4], ['P4', 'fourth', 5, 4, 3], ['P5', 'fifth', 7, 3, 2], ['P8', 'octave', 12, 2, 1]]) {
    INTERVALS[key] = { key, label, semitones, ratio: [p, q], partial: p, justOffsetCents: +(1200 * Math.log2(p / q) - 100 * semitones).toFixed(3) };
  }
  const intervalOf = iv => (typeof iv === 'string' ? INTERVALS[iv] : iv) || INTERVALS.unison;
  const LADDER_ORDER = ['unison', 'P5', 'P8', 'm3', 'M3', 'P4'];   // the order the offers come in (§180: usually unison, then fifths or an octave)

  // ---- the palette ----
  function players(recipe) { return ORDER.filter(k => recipe[k] && recipe[k].beating !== false && (recipe[k].playerBendSt == null || recipe[k].playerBendSt > 0)); }
  function ordinaryVoice(recipe, inst) {
    const I = recipe[inst]; if (!I || !I.techniques) return null;
    return I.techniques.find(q => q.key === I.ordinary) || null;
  }
  function ordinaryRange(recipe, inst) {
    const I = recipe[inst]; if (!I) return null;
    const q = ordinaryVoice(recipe, inst);
    const lo = q && q.rangeLow != null ? q.rangeLow : I.rangeLow, hi = q && q.rangeHigh != null ? q.rangeHigh : I.rangeHigh;
    return lo == null || hi == null ? null : [lo, hi];
  }
  function bendLimits(recipe, inst) {
    const I = recipe[inst]; if (!I) return null;
    const playerSt = I.playerBendSt != null ? I.playerBendSt : 1;                    // his rule: within a semitone at the most
    const samplerSt = I.bendRangeSt != null ? I.bendRangeSt : null;                 // the probe's number; null = unknown (the piano)
    const limitSt = samplerSt == null ? playerSt : Math.min(playerSt, samplerSt);
    return { playerSt, samplerSt, measured: !!I.bendMeasured, mutableByMidi: !!I.bendMutableByMidi, limitSt, limitCents: limitSt * 100 };
  }
  function holds(recipe, inst, pitch) {
    const I = recipe[inst]; if (!I || I.beating === false) return false;
    if (I.playerBendSt != null && I.playerBendSt <= 0) return false;
    const r = ordinaryRange(recipe, inst); if (!r) return false;
    if (typeof pitch !== 'number' || !isFinite(pitch)) return false;
    const q = ordinaryVoice(recipe, inst);
    if (q && q.silentKeys && q.silentKeys.includes(pitch)) return false;
    return pitch >= r[0] && pitch <= r[1];
  }
  // the pairs that can play the two notes of the pair on this pitch: pitch = the LOWER note (§158), the partner above by the interval
  function pairsFor(recipe, pitch, interval) {
    const iv = intervalOf(interval);
    const lowerNote = pitch, upperNote = pitch + iv.semitones;
    const P = players(recipe);
    const out = [];
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j];
      const aLo = holds(recipe, a, lowerNote), aHi = holds(recipe, a, upperNote), bLo = holds(recipe, b, lowerNote), bHi = holds(recipe, b, upperNote);
      let lower = null, upper = null, flexible = false;
      if (iv.semitones === 0) { if (aLo && bLo) { lower = a; upper = b; } }
      else {
        const ab = aLo && bHi, ba = bLo && aHi;
        if (ab && ba) { flexible = true; const top = k => (ordinaryRange(recipe, k) || [0, 0])[1]; if (top(b) >= top(a)) { lower = a; upper = b; } else { lower = b; upper = a; } }
        else if (ab) { lower = a; upper = b; }
        else if (ba) { lower = b; upper = a; }
      }
      if (lower) out.push({ players: [a, b], lower, upper, lowerNote, upperNote, interval: iv.key, flexible });
    }
    return out;
  }
  function pairingTable(recipe, pitches, interval) {
    const t = {};
    for (const p of pitches) t[p] = pairsFor(recipe, p, interval);
    return t;
  }

  // ---- THE PAIR'S FOLD (2026-09-07, RUNNING_LOG §179–180; the strikes drawer's fold, for a pair) ----
  // A note from the sonority is the pair's LOWER note; the pair moves BY OCTAVES AS ONE UNIT until both players hold their notes (the
  // lower on the note, the partner above by the interval): as written first (k = 0), then the nearest octave, a tie folding DOWN (Q4).
  // The roles come from pairsFor at the folded pitch — the same rule the page uses — so the two agree by construction.
  // → { pitch (the folded lower note), k (octaves moved), lower, upper, flexible, src (the note as given) } or null when no octave serves.
  // opts.noteIs = 'lower' (default) | 'upper': the note given is the pair's upper note, the lower sits the interval below it (the
  // INVERSION — 2026-09-07, "fourths and fifths can be considered the same": a fifth that no octave serves may sound as the fourth
  // below the same note, the panel's refold does the switch)
  function foldPair(recipe, note, interval, a, b, maxOct, opts) {
    if (typeof note !== 'number' || !isFinite(note) || !a || !b || a === b) return null;
    const iv = intervalOf(interval), M = maxOct == null ? 8 : maxOct, upperGiven = !!(opts && opts.noteIs === 'upper');
    const base = upperGiven ? note - iv.semitones : note;
    const ks = [0]; for (let d = 1; d <= M; d++) { ks.push(-d); ks.push(d); }   // 0, −1, +1, −2, +2 … : the nearest first, a tie down
    for (const k of ks) {
      const p = base + 12 * k; if (p < 0 || p + iv.semitones > 127) continue;
      const c = pairsFor(recipe, p, iv.key).find(q => q.players.includes(a) && q.players.includes(b));
      if (c) return { pitch: p, k, lower: c.lower, upper: c.upper, flexible: c.flexible, src: note, interval: iv.key, noteIs: upperGiven ? 'upper' : 'lower' };
    }
    return null;
  }
  // the fourth and the fifth as one family: the same note as the other one's other end
  const INVERSION = { P5: 'P4', P4: 'P5' };
  const foldMark = k => (k > 0 ? '↑' : k < 0 ? '↓' : '');
  // the LADDER (§180, Q2: offered, never applied by the tool): when no octave serves the pair at its interval — (a) the intervals that
  // would, with the same two players, in LADDER_ORDER; (b) for each seat, the other players that would, the other seat kept; (c) skip —
  // the panel's business. Every offer carries the fold it would make.
  function pairLadder(recipe, note, interval, a, b) {
    const iv = intervalOf(interval);
    const intervals = LADDER_ORDER.filter(k => k !== iv.key).map(k => { const f = foldPair(recipe, note, k, a, b); return f ? { interval: k, label: INTERVALS[k].label, fold: f } : null; }).filter(Boolean);
    const players = [];
    for (const [seat, keep, swap] of [['a', b, a], ['b', a, b]]) {
      for (const p of players_(recipe)) { if (p === keep || p === swap) continue; const f = foldPair(recipe, note, iv.key, seat === 'a' ? p : keep, seat === 'a' ? keep : p); if (f) players.push({ seat, player: p, replaces: swap, fold: f }); }
    }
    return { intervals, players };
  }
  function players_(recipe) { return players(recipe); }
  // what every other player would sound in the seat opposite `me` on this note — the menus' labels (§180: every player listed, the
  // pitch and the arrow shown, ✕ when no octave serves)
  function seatOptions(recipe, note, interval, me) {
    return players(recipe).filter(p => p !== me).map(p => { const f = foldPair(recipe, note, interval, me, p); return { player: p, fold: f, ok: !!f }; });
  }

  // ---- THE VOICINGS (2026-09-07, MORPH_NOTES §3: "a version of the chord voicing options from the strikes drawer in the beating drawer"
  // — original · spread out · cluster · cluster low · cluster high · high + low, the strikes drawer's presets over pitch classes; the
  // OCTAVE box moves the whole sonority; the octave RANGE (below … above) is the window each note may scatter within on a reshuffle:
  // "whatever octave I've chosen the sonority to be in originally plus whatever I say on the octave range") ----
  // voiceChord(pitches0, { preset, seed, oct, below, above }, span) → the voiced pitches, one per input, same order. Pure: the same
  // five numbers give the same voicing (a take carries them). The harmony never changes — octaves move (the drawer's rule, B).
  function shuffled(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  const VOICINGS = [['original', 'original'], ['spread', 'spread out'], ['cluster', 'cluster'], ['low', 'cluster low'], ['high', 'cluster high'], ['highlow', 'high + low']];
  function voiceChord(pitches0, v, span) {
    const o = v || {}, preset = o.preset || 'original', seed = (o.seed == null ? 1 : +o.seed) | 0, oct = (+o.oct || 0), below = Math.max(0, +o.below || 0), above = Math.max(0, +o.above || 0);
    const R = span || { lo: 36, hi: 96 }, LO = 21, HI = 108;
    const rnd = mulberry32(seed * 7919 + 17);
    const items = (pitches0 || []).map((p, i) => ({ i, p0: +p, pc: ((+p % 12) + 12) % 12, pitch: +p }));
    if (!items.length) return [];
    const nearestOct = (pc, target) => { let best = null; for (let p = pc; p <= 127; p += 12) { if (p < R.lo - 12) continue; if (best == null || Math.abs(p - target) < Math.abs(best - target)) best = p; } return clamp(best, R.lo, R.hi); };
    const pack = (list, centre) => {   // the drawer's: the smallest chromatic span — the sorted pitch classes rotated so the largest gap is at the end
      const pcs = [...new Set(list.map(q => q.pc))].sort((a, b) => a - b); if (!pcs.length) return;
      let bestK = 0, bestSpan = 99;
      const spans = pcs.map((_, k) => (pcs[(k - 1 + pcs.length) % pcs.length] - pcs[k] + 12) % 12 || 12);
      pcs.forEach((_, k) => { if (spans[k] < bestSpan) { bestSpan = spans[k]; bestK = k; } });
      const near = pcs.map((_, k) => k).filter(k => spans[k] <= bestSpan + 2);
      const k0 = seed === 1 ? bestK : near[Math.floor(rnd() * near.length)];
      const packed = {}; let p = pcs[k0] + 12 * Math.round((centre - pcs[k0]) / 12);
      for (let j = 0; j < pcs.length; j++) { const pc = pcs[(k0 + j) % pcs.length]; while (((p % 12) + 12) % 12 !== pc) p++; packed[pc] = p; }
      const lo = Math.min(...Object.values(packed)), hi = Math.max(...Object.values(packed));
      const shift = 12 * Math.round((centre - (lo + hi) / 2) / 12);
      list.forEach(q => { q.pitch = packed[q.pc] + shift; });
    };
    switch (preset) {
      case 'spread': { const order = shuffled(items, rnd); order.forEach((q, i) => { q.pitch = nearestOct(q.pc, R.lo + (i + 0.5) * (R.hi - R.lo) / order.length); }); break; }
      case 'cluster': pack(items, 60); break;
      case 'low': pack(items, R.lo + 8); break;
      case 'high': pack(items, R.hi - 8); break;
      case 'highlow': { const order = shuffled(items, rnd), half = Math.ceil(order.length / 2); pack(order.slice(0, half), R.lo + 8); pack(order.slice(half), R.hi - 8); break; }
      default: items.forEach(q => { q.pitch = q.p0; });
    }
    // the octave box moves the whole sonority; the octave range scatters every note by a random octave inside the window (seeded)
    items.forEach(q => { q.pitch += 12 * oct; if (below || above) q.pitch += 12 * (Math.floor(rnd() * (below + above + 1)) - below); q.pitch = clamp(q.pitch, LO, HI); });
    return items.map(q => q.pitch);
  }
  // one line per player for a readout
  function describePalette(recipe) {
    return players(recipe).map(k => {
      const r = ordinaryRange(recipe, k), b = bendLimits(recipe, k), q = ordinaryVoice(recipe, k);
      return k + ': ' + (q ? q.key : '?') + ' ' + (r ? noteName(r[0]) + '–' + noteName(r[1]) + ' (' + r[0] + '–' + r[1] + ')' : '?') +
        ' · player ±' + b.playerSt + ' st · sampler ' + (b.samplerSt == null ? '?' : '±' + b.samplerSt + ' st' + (b.measured ? '' : ' (provisional)')) + ' · limit ±' + b.limitCents + ' c';
    });
  }

  // ======================= STEP 2 — THE BEATING MATH (2026-09-07; PLAN 1f item 2, RUNNING_LOG §152) =======================
  // Units: time in seconds inside the event; curves over normalised time p = t / length; a player's RATE in beats per second, SIGNED
  // (above the centre +, below −); CENTS against the player's own centre note (the upper player's centre is the just interval above
  // the pitch); LEVEL 0 → 1 = the score's curve height (D23: the height is the dynamic; the tick applies 1g's remap, not this module).
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clamp01 = p => clamp(p, 0, 1);
  const r3 = v => Math.round(v * 1000) / 1000;
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---- curves: [[p, v, slope?], …] over p 0 → 1, held flat beyond the ends; a number is a flat curve. The SLOPE (2026-09-07, the
  // composer: "curve adjusting features like curves in main score … use mouse to change slope, like in logic pro") is the score's
  // own power model (computeYAtT 'power'): between a point and the next, y = a + (b − a) · t^(4^slope), slope −1 … +1, 0 = straight;
  // the slope rides on the segment's FIRST point and survives sorting, scaling and mirroring ----
  // The BEND, the score's curve windows' way (2026-09-07, the composer: "you need 2 degrees of freedom to achieve the proper bend,
  // whatever way it works for trill curves … in the main score"): the segment after a point may carry a CONTROL POINT `[cx, cy]` — a
  // quadratic Bézier, cx the fraction along the segment where the line was grabbed, cy the control's value in the curve's own units —
  // so the held point of the line follows the mouse. A plain number is the older power slope, still read.
  const slopeOf = q => (q && q.length > 2 && !Array.isArray(q[2]) && isFinite(+q[2]) ? clamp(+q[2], -3, 3) : 0);
  const ctrlOf = q => (q && q.length > 2 && Array.isArray(q[2]) && q[2].length === 2 && isFinite(+q[2][0]) && isFinite(+q[2][1]) ? [clamp(+q[2][0], 0.02, 0.98), +q[2][1]] : null);
  const withExtra = (p, v, extra) => (extra == null ? [p, v] : [p, v, extra]);
  function curveOf(x) {
    if (typeof x === 'number') return [[0, x], [1, x]];
    if (!Array.isArray(x) || !x.length) return [[0, 0], [1, 0]];
    // a point may sit OUTSIDE 0 … 1 (2026-09-07 night, the region model: nodes keep their time when a region is trimmed — a node beyond
    // the trim waits there); before the first point the curve holds its value, after the last its last
    const pts = x.map(q => { const c = ctrlOf(q), s = c ? 0 : slopeOf(q); return withExtra(+q[0], +q[1], c ? c : (s || null)); }).sort((a, b) => a[0] - b[0]);
    return pts.length === 1 ? [[0, pts[0][1]], [1, pts[0][1]]] : pts;
  }
  const bend01 = (t, s) => (s ? Math.pow(clamp01(t), Math.pow(4, s)) : clamp01(t));
  // the Bézier parameter whose x reaches the column u when the control sits at cx (x runs 0 → 1 over the segment)
  function bezierT(cx, u) {
    u = clamp01(u); const a = 1 - 2 * cx, b = 2 * cx, c = -u;
    if (Math.abs(a) < 1e-6) return u;
    const d = Math.sqrt(Math.max(0, b * b - 4 * a * c)), t1 = (-b + d) / (2 * a), t2 = (-b - d) / (2 * a);
    return clamp01((t1 >= 0 && t1 <= 1) ? t1 : t2);
  }
  function evalCurve(curve, p) {
    const c = curveOf(curve);
    if (p <= c[0][0]) return c[0][1];
    for (let i = 1; i < c.length; i++) if (p <= c[i][0]) {
      const a = c[i - 1], b = c[i]; const w = b[0] - a[0]; if (w <= 1e-9) return b[1];
      const u = (p - a[0]) / w, k = ctrlOf(a);
      if (k) { const t = bezierT(k[0], u), omt = 1 - t; return omt * omt * a[1] + 2 * omt * t * k[1] + t * t * b[1]; }
      return a[1] + (b[1] - a[1]) * bend01(u, slopeOf(a));
    }
    return c[c.length - 1][1];
  }
  const scaleCurve = (curve, k) => curveOf(curve).map(q => { const c = ctrlOf(q); return withExtra(q[0], q[1] * k, c ? [c[0], c[1] * k] : (q.length > 2 ? q[2] : null)); });
  const maxOf = curve => Math.max(...curveOf(curve).map(q => Math.abs(q[1])));
  // the shapes of the panel's menu (step 4): a few points, each a handle; `arc` is a raised cosine sampled at nine points
  const SHAPES = {
    flat:    o => [[0, +o.level || 0], [1, +o.level || 0]],
    rampOut: o => [[0, +o.from || 0], [1, +o.to || 0]],   // out of unison: 0 up to the level (the same line either way — two names for the menu)
    rampIn:  o => [[0, +o.from || 0], [1, +o.to || 0]],   // into unison: the level down to 0
    hump:    o => { const at = clamp(o.at == null ? 0.5 : +o.at, 0.02, 0.98), base = +o.base || 0; return [[0, base], [at, +o.peak || 0], [1, base]]; },
    arc:     o => { const pk = +o.peak || 0, base = +o.base || 0, n = 8, pts = []; for (let i = 0; i <= n; i++) { const p = i / n; pts.push([r3(p), r3(base + (pk - base) * 0.5 * (1 - Math.cos(2 * Math.PI * p)))]); } return pts; },
    burst:   o => { const pk = +o.peak || 0, at = clamp(o.at == null ? 0.1 : +o.at, 0.02, 0.5); return [[0, 0], [at, pk], [clamp(at + 0.25, 0.3, 0.9), pk * 0.35], [1, 0]]; },
    // the ADSR (2026-09-07, his walk-through lines 6 and 9: "holds at max for a few seconds … pretty classic ADSR"): the attack to the
    // peak, the hold, the release to the base — three handles; the birth default (9 s: 2 · 4 · 3)
    // the attack and the release are SECONDS when a length is given (2026-09-07, the composer: "short attack and short release, and
    // medium sustain, the shape isn't changing if I adjust the len number") — the hold absorbs the length; when the two do not fit
    // they shrink in proportion, a hold of at least 0.2 s kept
    adsr:    o => {
      const base = +o.base || 0, pk = +o.peak || 0;
      let a, h;
      if (o.length > 0 && (o.attackS != null || o.releaseS != null)) {
        const L = +o.length; let aS = Math.max(0.05, +o.attackS || 2), rS = Math.max(0.05, +o.releaseS || 3);
        const room = Math.max(0.1, L - 0.2); if (aS + rS > room) { const k = room / (aS + rS); aS *= k; rS *= k; }
        a = aS / L; h = 1 - rS / L;
      } else { a = clamp(o.attack == null ? 0.22 : +o.attack, 0.02, 0.9); h = clamp(o.hold == null ? 0.67 : +o.hold, a + 0.02, 0.98); }
      return [[0, base], [r3(a), pk], [r3(h), pk], [1, base]];
    },
  };
  const shape = (name, o) => (SHAPES[name] || SHAPES.flat)(o || {});
  // the two players from ONE heard-rate curve: mirrored (bipolar, half each by default — the heard beating is the drawn height) or a
  // flat partner (one holds, the other carries it all — the trainable form, CN-33)
  const mirrored = (beatCurve, share) => { const s = share == null ? 0.5 : clamp01(share); return { lower: scaleCurve(beatCurve, -s), upper: scaleCurve(beatCurve, 1 - s) }; };
  const flatPartner = (beatCurve, who) => who === 'lower' ? { lower: scaleCurve(beatCurve, -1), upper: 0 } : { lower: 0, upper: scaleCurve(beatCurve, 1) };
  // a level curve that follows the beating (step 3's birth default: the crescendo following the beating curve), lo → hi over the curve's range
  const levelFromBeat = (beatCurve, lo, hi) => { const m = maxOf(beatCurve) || 1, a = lo == null ? 0.3 : +lo, b = hi == null ? 0.9 : +hi; return curveOf(beatCurve).map(q => [q[0], r3(a + (b - a) * Math.abs(q[1]) / m)]); };

  // ---- the conversion (§148): a player's rate against a partner sitting at the centre, on the interval's coincident partial p ----
  // cents = 1200 · log2(1 + rate / (p · f)); rate = p · f · (2^(|cents|/1200) − 1); both signed by the direction — an exact round trip.
  // The register law is inside (a fixed cents doubles per octave, D28): 1 beat per second at C3 = 13.19 c, at C4 6.6 c.
  function rateToCents(rate, pitch, interval) { const p = intervalOf(interval).partial, f = midiHz(pitch); const c = 1200 * Math.log2(1 + Math.abs(rate) / (p * f)); return rate < 0 ? -c : c; }
  function centsToRate(cents, pitch, interval) { const p = intervalOf(interval).partial, f = midiHz(pitch); const r = p * f * (Math.pow(2, Math.abs(cents) / 1200) - 1); return cents < 0 ? -r : r; }
  // the beating that results from the two players' cents: the coincident partials p · f_lower and q · f_upper, the gap between them
  function beatRate(centsLower, centsUpper, pitch, interval) { const p = intervalOf(interval).partial, f = midiHz(pitch); return p * f * Math.abs(Math.pow(2, centsUpper / 1200) - Math.pow(2, centsLower / 1200)); }
  const ZONES = { flangerBelow: 1, roughnessAbove: 15 };   // beats per second (§145: < 1 flanger · beating · > ~15–20 roughness, timbre)
  const zoneOf = rate => rate < ZONES.flangerBelow ? 'flanger' : rate > ZONES.roughnessAbove ? 'roughness' : 'beating';

  // ---- the breaths (§152; the tuba carrier's rule per instrument, morph.js buildCarrier) ----
  // the ceiling table — the winds' breath, the strings' bow — DEFAULTS, to be tuned by his ear (BEATING_TOOL §11); louder = shorter (the
  // tuba's rule, × 0.7 at the top); the winds re-enter after a gap, a bow changes without one
  const CEILINGS = {
    flute: { breathS: 8, gapS: 0.5 }, bass_clarinet: { breathS: 10, gapS: 0.5 },
    violin1: { bowS: 12, gapS: 0 }, violin2: { bowS: 12, gapS: 0 }, viola: { bowS: 12, gapS: 0 }, cello: { bowS: 10, gapS: 0 },
  };
  function ceilingFor(inst, level) {
    const c = CEILINGS[inst] || { breathS: 8, gapS: 0.5 };
    const base = c.breathS != null ? c.breathS : c.bowS, lv = level == null ? 0.5 : clamp01(+level);
    const k = lv > 0.75 ? 0.7 : lv > 0.5 ? 0.85 : 1;
    return { seconds: r3(base * k), gapS: c.gapS || 0, kind: c.breathS != null ? 'breath' : 'bow', base };
  }
  // deal the breath marks (the boundaries inside (0, length)): a target length with jitter, capped by the ceiling, the first one shortened
  // by the phase (the pair's two players half a breath apart by default); seeded (another seed = another deal); hand-placed marks kept —
  // the nearest dealt mark within a target gives way to each, or it is added — and the rest re-dealt. No span is ever longer than the
  // ceiling; the last one is at least 40 % of the target.
  function dealBreaths(o) {
    const length = Math.max(0.1, +o.length || 0), ceil = ceilingFor(o.inst, o.level).seconds;
    const target = Math.min(ceil, +o.target || Math.min(ceil, 8)), jitter = o.jitter == null ? 0.35 : clamp(+o.jitter, 0, 0.9);
    const rnd = mulberry32((o.seed == null ? 1 : +o.seed) | 0);
    const phase = clamp(+o.phase || 0, 0, 0.95) * target;
    const marks = [];
    let t = 0, first = true;
    while (length - t > ceil) {
      let seg = target * (1 + jitter * (2 * rnd() - 1));
      if (first) { seg = Math.max(target * 0.25, seg - phase); first = false; }
      seg = Math.min(seg, ceil, length - t - target * 0.4);
      marks.push(r3(t + seg)); t += seg;
    }
    for (const k of (o.keep || [])) {
      const kk = +k; if (!(kk > 0 && kk < length)) continue;
      let bi = -1, bd = Infinity; marks.forEach((m, i) => { const d = Math.abs(m - kk); if (d < bd) { bd = d; bi = i; } });
      if (bi >= 0 && bd <= target) marks[bi] = r3(kk); else marks.push(r3(kk));
    }
    return marks.sort((a, b) => a - b);
  }
  // the notes' spans from the mode and the marks: one · continuous = the whole length; designated = cut at the marks, the wind's gap before each
  function breathSpans(mode, marks, length, gapS) {
    if (mode !== 'designated' || !marks || !marks.length) return [[0, length]];
    const spans = []; let start = 0;
    for (const m of marks) { if (m <= start + 0.05 || m >= length) continue; spans.push([start, Math.max(start + 0.05, m - (gapS || 0))]); start = m; }
    spans.push([start, length]);
    return spans;
  }

  // ---- one pair → each player's chain of notes, the beat line, the flags ----
  // spec = { pitch (the pair's LOWER note), interval, players: { lower, upper } (else the first of pairsFor), length (s),
  //          rate: { lower, upper } (signed curves in beats per second) | beat: curve + share (mirrored from one heard-rate curve),
  //          slide: { lower, upper } (s; a player's curve read later by that much — before its start the first value holds, after its end the last),
  //          level: curve 0 → 1 (the crescendo; default 0.6 flat),
  //          breath: { mode: 'one' | 'continuous' | 'designated', marks: { lower: [s…], upper: [s…] } (hand-placed, kept), deal: false (hand marks only),
  //                    target, jitter, seed, phase (the upper's stagger in breaths, default 0.5) },
  //          stepS (the sampling step, default 0.05 s) }
  // → { …, samples (the panel's lines: t, p, the rates, the cents, the beat, the zone, the level), beat: [[t, rate]…], zones, maxBeat, maxCents,
  //      notes: { lower: [note…], upper: [note…] } — note = { player, role, key, keyOffset, startS, endS, breath, bend: [[dt, cents]…] (note-relative,
  //      the tuba's morphBend shape), level: [[dt, 0…1]…], flags }, breaths: { lower: { marks, spans, ceiling }, upper }, flags }
  function renderPair(spec, recipe) {
    const s = spec || {}, R = recipe || {};
    const iv = intervalOf(s.interval), pitch = +s.pitch, length = Math.max(0.1, +s.length || 6), stepS = Math.max(0.01, +s.stepS || 0.05);
    let players = s.players;
    if (!players || !players.lower || !players.upper) { const c = pairsFor(R, pitch, iv.key)[0]; players = c ? { lower: c.lower, upper: c.upper } : { lower: null, upper: null }; }
    const rate = s.rate || (s.beat != null ? mirrored(s.beat, s.share) : { lower: 0, upper: 0 });
    const curves = { lower: curveOf(rate.lower), upper: curveOf(rate.upper) };
    const slide = { lower: +(s.slide && s.slide.lower) || 0, upper: +(s.slide && s.slide.upper) || 0 };
    // the level: one curve for both, or one PER PLAYER ({ lower, upper } — 2026-09-07, his line 15: "peaks and values for individual
    // players … maybe they reach max at different times"); the samples carry both and their mean (the META contour's line)
    const lvIn = s.level == null ? 0.6 : s.level, perPlayer = lvIn && typeof lvIn === 'object' && !Array.isArray(lvIn);
    const levels = { lower: curveOf(perPlayer ? (lvIn.lower != null ? lvIn.lower : lvIn.upper) : lvIn), upper: curveOf(perPlayer ? (lvIn.upper != null ? lvIn.upper : lvIn.lower) : lvIn) };
    const level = levels.lower;
    const just = iv.justOffsetCents;
    const fLower = midiHz(pitch), fUpper = fLower * iv.ratio[0] / iv.ratio[1];
    const rateAt = (who, t) => evalCurve(curves[who], (t - slide[who]) / length);
    const centsAt = (who, t) => rateToCents(rateAt(who, t), pitch, iv);
    const samples = [];
    for (let i = 0, n = Math.ceil(length / stepS); i <= n; i++) {
      const t = Math.min(length, i * stepS), p = t / length, cL = centsAt('lower', t), cU = centsAt('upper', t), beat = beatRate(cL, cU, pitch, iv);
      const lL = evalCurve(levels.lower, p), lU = evalCurve(levels.upper, p);
      samples.push({ t: r3(t), p: r3(p), rateL: r3(rateAt('lower', t)), rateU: r3(rateAt('upper', t)), centsL: r3(cL), centsU: r3(cU), beat: r3(beat), zone: zoneOf(beat), level: r3((lL + lU) / 2), levelL: r3(lL), levelU: r3(lU) });
    }
    const beat = samples.map(q => [q.t, q.beat]);
    const zones = []; for (const q of samples) { const z = zones[zones.length - 1]; if (z && z.zone === q.zone) z.to = q.t; else zones.push({ from: q.t, to: q.t, zone: q.zone }); }
    const flags = [], notes = { lower: [], upper: [] }, breaths = {};
    const br = s.breath || { mode: 'one' };
    const lvMean = samples.reduce((a, q) => a + q.level, 0) / samples.length;
    // UNISON breaths (2026-09-07, "random and unison breaths"): phase 0 = both players breathe together — one deal on the stricter
    // ceiling, the same marks for both (the hand marks of either count)
    const ceils = { lower: ceilingFor(players.lower, lvMean), upper: ceilingFor(players.upper, lvMean) };
    const unison = br.mode === 'designated' && br.deal !== false && br.phase != null && +br.phase === 0;
    let shared = null;
    if (unison) {
      const who = ceils.lower.seconds <= ceils.upper.seconds ? 'lower' : 'upper';
      const hand = [].concat((br.marks && br.marks.lower) || [], (br.marks && br.marks.upper) || []).map(Number).sort((a, b) => a - b);
      shared = dealBreaths({ inst: players[who], length, level: lvMean, target: br.target, jitter: br.jitter, seed: (br.seed == null ? 1 : +br.seed), phase: 0, keep: hand });
    }
    for (const who of ['lower', 'upper']) {
      const inst = players[who];
      const lim = inst ? bendLimits(R, inst) : { playerSt: 1, samplerSt: null };
      const ceil = ceils[who];
      const centre = pitch + (who === 'upper' ? iv.semitones : 0);
      if (inst && !holds(R, inst, centre)) flags.push({ player: inst, role: who, flag: 'out-of-range', note: centre });
      let marks = null;
      if (br.mode === 'designated') {
        const hand = (br.marks && br.marks[who]) || [];
        marks = (hand.length && br.deal === false) ? hand.map(Number).sort((a, b) => a - b)
              : shared ? shared.slice()
              : dealBreaths({ inst, length, level: lvMean, target: br.target, jitter: br.jitter, seed: (br.seed == null ? 1 : +br.seed) + (who === 'upper' ? 1000 : 0), phase: who === 'upper' ? (br.phase == null ? 0.5 : +br.phase) : 0, keep: hand });
      }
      const spans = breathSpans(br.mode, marks, length, ceil.gapS);
      spans.forEach((sp, bi) => {
        // sample the note; split it wherever the sampler's range is passed — the RE-KEY (#1's convention, §150): the key moves a
        // semitone, the bend is re-based against it, the seam flagged
        const start = sp[0], end = sp[1];
        let cur = null;
        const finish = (t) => { if (cur) { cur.endS = r3(t); notes[who].push(cur); cur = null; } };
        for (let i = 0, n = Math.ceil((end - start) / stepS); i <= n; i++) {
          const t = Math.min(end, start + i * stepS);
          const raw = centsAt(who, t) + (who === 'upper' ? just : 0);
          const need = lim.samplerSt != null && Math.abs(raw) > lim.samplerSt * 100 + 1e-9 ? Math.round(raw / 100) : 0;
          if (!cur || need !== cur.keyOffset) {
            finish(t);
            cur = { player: inst, role: who, key: centre, keyOffset: need, startS: r3(t), endS: r3(end), breath: bi, bend: [], level: [], flags: [] };
            if (need) { cur.flags.push('rekey'); flags.push({ player: inst, role: who, flag: 'sampler-range', at: r3(t), cents: r3(raw), keyOffset: need }); }
          }
          cur.bend.push([r3(t - cur.startS), r3(raw - cur.keyOffset * 100)]);
          cur.level.push([r3(t - cur.startS), r3(evalCurve(levels[who], t / length))]);
          if (Math.abs(raw) > lim.playerSt * 100 + 1e-6 && !cur.flags.includes('player-limit')) { cur.flags.push('player-limit'); flags.push({ player: inst, role: who, flag: 'player-limit', at: r3(t), cents: r3(raw) }); }
        }
        finish(end);
      });
      for (const n of notes[who]) {
        if (br.mode === 'continuous') { if (!n.flags.includes('continuous')) n.flags.push('continuous'); }
        else if (n.endS - n.startS > ceil.seconds + 1e-6) { n.flags.push('ceiling'); flags.push({ player: inst, role: who, flag: 'ceiling', at: n.startS, seconds: r3(n.endS - n.startS), ceiling: ceil.seconds }); }
      }
      breaths[who] = { mode: br.mode || 'one', marks, spans: spans.map(q => [r3(q[0]), r3(q[1])]), ceiling: ceil };
    }
    for (const z of zones) if (z.zone === 'roughness') flags.push({ flag: 'roughness', at: z.from, to: z.to });
    return { pitch, interval: iv.key, players, length, stepS, f: { lower: r3(fLower), upper: r3(fUpper) }, justOffsetCents: just, curves, slide, level, breath: br,
             samples, beat, zones, maxBeat: r3(Math.max(...samples.map(q => q.beat))),
             maxCents: { lower: r3(Math.max(...samples.map(q => Math.abs(q.centsL)))), upper: r3(Math.max(...samples.map(q => Math.abs(q.centsU)))) },
             notes, breaths, flags };
  }
  // several pairs at their offsets: the pattern's notes with absolute times, its length, its flags, the META contour (the crescendo's
  // mean across the pattern, §160)
  function renderPattern(pat, recipe) {
    const P = pat || {};
    const rows = (P.pairs || []).map((sp, i) => {
      const out = renderPair(Object.assign({}, sp, { length: sp.length || P.length }), recipe);
      out.offset = r3(+(P.offsets && P.offsets[i]) || +sp.offset || 0);
      return out;
    });
    const notes = [];
    rows.forEach((row, i) => { for (const who of ['lower', 'upper']) for (const n of row.notes[who]) notes.push(Object.assign({}, n, { pair: i, startS: r3(n.startS + row.offset), endS: r3(n.endS + row.offset) })); });
    notes.sort((a, b) => a.startS - b.startS || a.pair - b.pair);
    const length = r3(rows.reduce((m, r) => Math.max(m, r.offset + r.length), 0));
    const flags = rows.flatMap((r, i) => r.flags.map(f => Object.assign({ pair: i }, f)));
    const n = 33, contour = [];
    for (let k = 0; k < n; k++) {
      const t = length * k / (n - 1); let sum = 0, cnt = 0;
      for (const r of rows) if (t >= r.offset - 1e-9 && t <= r.offset + r.length + 1e-9) { sum += evalCurve(r.level, (t - r.offset) / r.length); cnt++; }
      contour.push([r3(t), r3(cnt ? sum / cnt : 0)]);
    }
    return { pairs: rows, notes, length, flags, contour };
  }
  // a typed duration: the same spec over a new length — the curves are already over normalised time; the slides and the hand-placed
  // marks scale; dealt breaths re-deal at the new length in renderPair
  function stretch(spec, newLength) {
    const s = JSON.parse(JSON.stringify(spec || {})), old = Math.max(0.1, +s.length || 6), nl = Math.max(0.1, +newLength || old), k = nl / old;
    s.length = nl;
    if (s.slide) for (const who of ['lower', 'upper']) if (s.slide[who]) s.slide[who] = r3(s.slide[who] * k);
    if (s.breath && s.breath.marks) for (const who of ['lower', 'upper']) if (Array.isArray(s.breath.marks[who])) s.breath.marks[who] = s.breath.marks[who].map(m => r3(m * k));
    return s;
  }
  function describePair(o) {
    const fl = o.flags.map(f => f.flag).filter((v, i, a) => a.indexOf(v) === i);
    return (o.players.lower || '?') + ' + ' + (o.players.upper || '?') + ' on ' + noteName(o.pitch) + (o.interval === 'unison' ? '' : ' + ' + noteName(o.pitch + INTERVALS[o.interval].semitones)) +
      ' (' + INTERVALS[o.interval].label + ') · ' + o.length + ' s · max ' + o.maxBeat + ' beats/s (±' + Math.max(o.maxCents.lower, o.maxCents.upper) + ' c) · ' +
      (o.breath.mode || 'one') + ' (' + o.notes.lower.length + ' + ' + o.notes.upper.length + ' notes)' + (fl.length ? ' · flags: ' + fl.join(' ') : ' · no flags');
  }

  return { ORDER, INTERVALS, LADDER_ORDER, INVERSION, intervalOf, noteName, midiHz, players, ordinaryVoice, ordinaryRange, bendLimits, holds, pairsFor, pairingTable, describePalette,
           foldPair, foldMark, pairLadder, seatOptions, VOICINGS, voiceChord, shuffled, mulberry32,
           curveOf, evalCurve, scaleCurve, slopeOf, ctrlOf, withExtra, bezierT, bend01, SHAPES, shape, mirrored, flatPartner, levelFromBeat, rateToCents, centsToRate, beatRate, ZONES, zoneOf,
           CEILINGS, ceilingFor, dealBreaths, breathSpans, renderPair, renderPattern, stretch, describePair };
});
