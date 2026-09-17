// accel_calc.js — the acceleration calculator (PLAN 1h, RUNNING_LOG §129): a run of gaps from a first gap to a last gap,
// shaped by a named curve; shared by the composer page (window.AccelCalc) and the node tools (require). The math alone —
// no DOM, no MIDI, no players: the strikes drawer deals its cards onto the onsets this returns; any other panel may do the same.
//
// The run in one line: gap(p) = interp(w(p)) between the first gap and the last gap, where p runs 0 → 1 either over the
// NOTE INDEX (a fixed fraction per note — the drawer's geometric run of U13, and STRIKES_TOOL §W's per-note shapes) or over
// TIME (the tuba compiler's family: the speed changes by a percentage per second — the ramp heard all the way). w is the
// warp (the shape's dial); interp is 'log' (a ratio) or 'lin' (equal milliseconds). The two ends are exact; the length is
// given as any ONE of the steepness (the per-note ratio), the count of notes, or the duration — the other two follow.
//
// spec = {
//   gapStart, gapEnd,                    ms; either order (gapEnd > gapStart = a deceleration)
//   length: { ratio } | { count } | { duration },   the per-note ratio (a magnitude, 0.5 … 0.99), the notes, or the ms
//   shape: 'even' | 'geometric' | 'curve' | 's' | 'twoPhase' | 'lateRush' | 'linear' | 'raw',   even = one gap throughout (gapEnd ignored)
//   curve, curveZero, gamma, ease, knee,  the shapes' dials (SHAPES); curveZero = a panel's calibrated zero (0 here)
//   domain, warp, interp,                'raw' only: 'index' | 'time'; a WARPS key; 'log' | 'lin'
//   jitter: { pct, pctEnd, seed },       % of each gap; pctEnd (blank = pct) ramps it along the run; seeded
//   hold: { gaps } | { ms },             extra gaps at the last gap after the ramp
//   level: { start, end, curve },        a number per note, start → end along the run's time (any scale; blank = none)
//   mirror: bool                         the run played backwards in time (not the same as swapping the ends)
// }
// → { onsets, gaps, levels, notes, gapCount, rampGaps, holdGaps, duration, ratio, lengthBy, shape, domain, warp, interp,
//     mirror, fit: { iterations, residual } }
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AccelCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clamp01 = p => clamp(p, 0, 1);
  const sum = a => a.reduce((s, g) => s + g, 0);
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gaussOf(rnd) { return () => { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }; }

  // ---- the warps: p 0 → 1 to w 0 → 1, monotone, the ends fixed ----
  const WARPS = {
    linear: () => (p => p),
    // the tuba compiler's dial: k = 4 · (curve + zero); bloom < 0 < surge; the zero is a panel's calibration (compiler.js: −0.4 for its clouds)
    exp: o => { const k = 4 * ((+o.curve || 0) + (+o.curveZero || 0)); if (Math.abs(k) < 1e-3) return p => p; const d = Math.exp(k) - 1; return p => (Math.exp(k * p) - 1) / d; },
    power: o => { const g = clamp(+o.gamma || 1, 0.05, 20); return p => Math.pow(p, g); },
    s: o => { const a = clamp(+o.ease || 1, 0.05, 20); return p => { if (p <= 0) return 0; if (p >= 1) return 1; const x = Math.pow(p, a), y = Math.pow(1 - p, a); return x / (x + y); }; },
    knee: o => { const kn = clamp(+o.knee || 0, 0, 0.95); return p => p <= kn ? 0 : (p - kn) / (1 - kn); },
  };

  // ---- the named shapes, in the menu's order; dial = the one number a panel shows for it ----
  const SHAPES = [
    { key: 'even', label: 'even', domain: 'index', warp: 'linear', interp: 'lin', dial: null, flat: true,
      note: 'the same gap throughout (the gap box; → last ignored) — the length by ms or notes; the dealing and the pool as for a run (§142)' },
    { key: 'geometric', label: 'geometric', domain: 'index', warp: 'linear', interp: 'log', dial: null,
      note: 'each gap a fixed fraction of the one before (U13): a still head, then the collapse' },
    { key: 'curve', label: 'curve', domain: 'time', warp: 'exp', interp: 'log', dial: { key: 'curve', label: 'curve', min: -1, max: 1, step: 0.05, def: 0 },
      note: 'the speed changes by a percentage per second (the tuba dial): 0 = even, below 0 = the change early (bloom), above 0 = a still head then the swell (surge)' },
    { key: 's', label: 'S-curve', domain: 'index', warp: 's', interp: 'log', dial: { key: 'ease', label: 'ease', min: 0.2, max: 6, step: 0.1, def: 2 },
      note: 'even, then accelerating, then the last gaps nearly equal: a roll that lands (§W)' },
    { key: 'twoPhase', label: 'two-phase', domain: 'index', warp: 'knee', interp: 'log', dial: { key: 'knee', label: 'head', min: 0, max: 0.9, step: 0.05, def: 0.5 },
      note: 'a flat head at the first gap for this share of the notes, then the geometric rush (the knee of §89)' },
    { key: 'lateRush', label: 'late rush', domain: 'index', warp: 'power', interp: 'log', dial: { key: 'gamma', label: 'power', min: 0.2, max: 6, step: 0.1, def: 2 },
      note: 'the gaps stay near the first gap, then collapse (a power on the note index; below 1 = the rush early)' },
    { key: 'linear', label: 'linear ms', domain: 'index', warp: 'linear', interp: 'lin', dial: null,
      note: 'each gap shorter by the same milliseconds: a push that eases as it goes (§W)' },
  ];
  const shapeOf = key => SHAPES.find(s => s.key === key) || SHAPES.find(s => s.key === 'geometric');   // the default stays the drawer's geometric run
  const interpOf = (kind, g1, g2) => kind === 'lin' ? (w => g1 + (g2 - g1) * w) : (w => g1 * Math.pow(g2 / g1, w));

  // how many gaps a per-note ratio needs from g1 to g2 (the drawer's rule of U13: the last gap lands exactly, the ratio re-fitted)
  function countForRatio(g1, g2, ratio) {
    let r = Math.abs(+ratio || 0.85); if (r > 1) r = 1 / r; r = clamp(r, 0.01, 0.999);
    const span = Math.abs(Math.log(g2 / g1));
    if (span < 1e-9) return 1;
    return Math.max(1, Math.floor(span / Math.abs(Math.log(r)) + 1e-9) + 1);
  }
  // the index domain: p = i ÷ (k − 1); the ends exact by construction
  function indexGaps(k, w, interp, g1) {
    if (k <= 1) return [g1];
    const out = []; for (let i = 0; i < k; i++) out.push(interp(w(i / (k - 1))));
    return out;
  }
  // the time domain: the profile read at each gap's midpoint in time, the ends exact, the interior scaled so the duration is
  // exact when it is given; a fixed-point iteration from the index-domain gaps
  function timeGaps(k, T, w, interp, g1, g2) {
    if (k <= 1) return { gaps: [g1], iterations: 0, residual: 0 };
    let gaps = indexGaps(k, w, interp, g1); let it = 0;
    for (; it < 80; it++) {
      const total = T != null ? T : sum(gaps);
      let t = 0; const ng = gaps.map(g => { const p = (t + g / 2) / total; t += g; return interp(w(clamp01(p))); });
      ng[0] = g1; ng[k - 1] = g2;
      if (T != null && k > 2) { const inner = sum(ng.slice(1, -1)), want = T - g1 - g2; const sc = inner > 0 && want > 0 ? want / inner : 1; for (let i = 1; i < k - 1; i++) ng[i] *= sc; }
      let d = 0; for (let i = 0; i < k; i++) d = Math.max(d, Math.abs(ng[i] - gaps[i]) / Math.max(1e-9, gaps[i]));
      gaps = ng; if (d < 1e-7) break;
    }
    return { gaps, iterations: it, residual: T != null ? T - sum(gaps) : 0 };
  }
  // how many gaps the time law yields over T when stepped from the start
  function countForDuration(T, w, interp, g1) {
    if (T <= 0) return 1;
    let t = 0, k = 0, g = g1;
    while (t < T && k < 100000) { g = interp(w(clamp01(t / T))); t += g; k++; }
    if (k > 1 && t - T > g / 2) k--;
    return Math.max(1, k);
  }
  // the index domain with a duration given: the k whose run is nearest T (a doubling search, then a bisection), then the
  // interior scaled to make T exact
  function indexGapsForDuration(T, w, interp, g1, g2) {
    const sumFor = k => sum(indexGaps(k, w, interp, g1));
    let lo = 1, hi = 1; while (sumFor(hi) < T && hi < 1000000) { lo = hi; hi *= 2; }
    while (hi - lo > 1) { const mid = Math.floor((lo + hi) / 2); if (sumFor(mid) < T) lo = mid; else hi = mid; }
    const k = Math.abs(sumFor(lo) - T) <= Math.abs(sumFor(hi) - T) ? lo : hi;
    const gaps = indexGaps(k, w, interp, g1);
    if (k > 2) { const inner = sum(gaps.slice(1, -1)), want = T - g1 - g2; const sc = inner > 0 && want > 0 ? want / inner : 1; for (let i = 1; i < k - 1; i++) gaps[i] *= sc; }
    return { gaps, residual: T - sum(gaps) };
  }

  function run(spec) {
    const s = spec || {};
    const sh = s.shape === 'raw' ? { key: 'raw', domain: s.domain || 'index', warp: s.warp || 'linear', interp: s.interp || 'log', dial: null } : shapeOf(s.shape);
    const g1 = Math.max(0.1, +s.gapStart || 1), g2 = sh.flat ? g1 : Math.max(0.1, +s.gapEnd || g1);
    const w = (WARPS[sh.warp] || WARPS.linear)(s);
    const interp = interpOf(sh.interp, g1, g2);
    const L = s.length || {};
    let k, gaps, fit = { iterations: 0, residual: 0 }, lengthBy;
    if (L.duration != null && L.count == null && L.ratio == null) {
      lengthBy = 'duration'; const T = Math.max(0.1, +L.duration || 0);
      if (sh.flat) { k = Math.max(1, Math.round(T / g1)); gaps = new Array(k).fill(T / k); }   // even: every gap exactly T ÷ k, the gap box the target
      else if (sh.domain === 'time') { k = countForDuration(T, w, interp, g1); const r = timeGaps(k, T, w, interp, g1, g2); gaps = r.gaps; fit = { iterations: r.iterations, residual: r.residual }; }
      else { const r = indexGapsForDuration(T, w, interp, g1, g2); gaps = r.gaps; k = gaps.length; fit = { iterations: 0, residual: r.residual }; }
    } else {
      if (L.count != null && L.ratio == null) { lengthBy = 'count'; k = Math.max(1, Math.round(+L.count || 2) - 1); }
      else { lengthBy = 'ratio'; k = countForRatio(g1, g2, L.ratio != null ? L.ratio : 0.85); }
      if (sh.domain === 'time') { const r = timeGaps(k, null, w, interp, g1, g2); gaps = r.gaps; fit = { iterations: r.iterations, residual: 0 }; }
      else gaps = indexGaps(k, w, interp, g1);
    }
    const rampGaps = gaps.length;
    // the hold: extra gaps at the last gap, after the ramp
    const H = s.hold || {}; const holdGaps = H.gaps != null && H.gaps !== '' ? Math.max(0, Math.round(+H.gaps || 0)) : (H.ms != null && H.ms !== '' ? Math.max(0, Math.round((+H.ms || 0) / g2)) : 0);
    for (let i = 0; i < holdGaps; i++) gaps.push(g2);
    // the jitter: each gap × exp(σ · gauss), σ ramped along the run when an end value is given, seeded
    const J = s.jitter || {}; const j0 = Math.max(0, +J.pct || 0) / 100, j1 = J.pctEnd != null && J.pctEnd !== '' ? Math.max(0, +J.pctEnd || 0) / 100 : j0;
    if (j0 > 0 || j1 > 0) { const gauss = gaussOf(mulberry32(((+J.seed || 1) * 9176) + 11)); const n = gaps.length; gaps = gaps.map((g, i) => { const p = n > 1 ? i / (n - 1) : 0; return g * Math.exp((j0 + (j1 - j0) * p) * gauss()); }); }
    if (s.mirror) gaps.reverse();
    const onsets = [0]; for (const g of gaps) onsets.push(onsets[onsets.length - 1] + g);
    const duration = onsets[onsets.length - 1];
    // the levels: start → end along the run's time, its own curve (the tuba's levelCurve: bloom < 0 < surge)
    let levels = null; const V = s.level;
    if (V && V.start != null && V.end != null && V.start !== '' && V.end !== '') { const wl = WARPS.exp({ curve: V.curve || 0 }); levels = onsets.map(t => (+V.start) + ((+V.end) - (+V.start)) * wl(duration > 0 ? t / duration : 0)); }
    const ratio = rampGaps > 1 ? Math.pow(g2 / g1, 1 / (rampGaps - 1)) : 1;   // the per-note ratio of the geometric run with this count
    return { onsets, gaps, levels, notes: onsets.length, gapCount: gaps.length, rampGaps, holdGaps, duration, ratio, lengthBy, k,
             shape: sh.key, domain: sh.domain, warp: sh.warp, interp: sh.interp, mirror: !!s.mirror, fit };
  }
  // one line for a readout
  function describe(res, spec) {
    const sh = res.shape === 'raw' ? null : shapeOf(res.shape); const s = spec || {};
    const dial = sh && sh.dial ? ' · ' + sh.dial.label + ' ' + (+(s[sh.dial.key] != null && s[sh.dial.key] !== '' ? s[sh.dial.key] : sh.dial.def)).toFixed(2) : '';
    return res.notes + ' notes · ' + res.gapCount + ' gaps · ' + Math.round(res.duration) + ' ms · ' + (sh ? sh.label : res.domain + '/' + res.warp) + dial +
      ' · steep ' + res.ratio.toFixed(3) + (res.holdGaps ? ' · hold ' + res.holdGaps : '') + (res.mirror ? ' · mirrored' : '');
  }
  return { run, describe, SHAPES, WARPS, shapeOf, countForRatio };
});
