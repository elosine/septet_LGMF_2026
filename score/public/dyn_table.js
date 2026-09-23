// dyn_table.js — THE DYNAMICS TABLE (PLAN 1d.10, RUNNING_LOG §146–§148, COMPOSITION_NOTES LG-51).
//
// ONE function for the whole composer: the CC7 value of a WRITTEN DYNAMIC on a given instrument.
//
// HIS PRINCIPLE (LG-51): *a STATED dynamic range is what sounds, for the whole curve* — drawn full for the notation,
// performed between the two values: *"a curve going from MP to FF should go … say 65 to 111 in CC7, not up to the full 127."*
// So every written dynamic gets a CC7 value of its own, and a wave `ppp–mp` sits audibly BELOW a wave `pp–mf`.
//
// THIS AMENDS PLAN 1e's RULE 2 ("the top of the shape is the full fader"), under which only a shape's DEPTH was heard —
// `pp–mf` and `ppp–mp` are both three steps deep and both played about CC7 73 → 127. Rule 1 (the mf strike, per pitch),
// the curve channels and `Composer.curveDirty()` all stand. `docs/DYNAMICS_LAW.md` is the page.
//
// THE LAW. `fff` = CC7 127. Each written step below it is STEP_DB = 4 dB, taken through that instrument's MEASURED fader
// curve (`bank/velocity_remap.json` `cc7Curve`, measured by 0d on the curve channels). ONE constant, so his ear retunes
// the whole table by changing one number. Why 4: 1e as built gave about 4 dB a step, so the depth he has is kept — but it
// is now THE SAME IN dB on every instrument, where before it was 9.6 dB on a UVI one and 14.4 dB on a Kontakt one; and it
// lands his own guess, `mp → ff` = CC7 69 → 109 on a Kontakt instrument. `ppp` is 28 dB under the ceiling: a SOUNDING
// level, not silence. True silence stays the edges' niente — the score's `cc7Fade` multiplies in on top of this answer.
//
// WHO READS IT: `sequence_ui.js` (1d.10), and — when they are brought under the law — the crescendo tool (PLAN 1f) and
// the morph's revision. NOT the drawn swell (CC7 65 → 127, a gesture with no names), NOT the note card's `full fader`
// (0 → 127 by hand), NOT trills, strikes or plain notes: those are STRUCK notes and their velocity IS the dynamic.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(function () { return require('./velocity_remap.js'); });
  else root.DynTable = factory(function () { return root.VelocityRemap || null; });
})(typeof self !== 'undefined' ? self : this, function (VR) {
  'use strict';
  const NAMES = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
  const STEP_DB = 4;          // ONE constant — his ear retunes the whole table here
  const FALLBACK_K = 40;      // no bank, no curve: the UVI law, 127 * 10^(-dB/40) — and the caller's status SAYS SO
  const STEPS = NAMES.length - 1;
  const clamp01 = x => Math.max(0, Math.min(1, +x || 0));
  const clampCc = v => Math.max(0, Math.min(127, Math.round(v)));

  // a level is the drawer's own 0 … 1 height on the written ladder (0 = ppp, 1 = fff, `dyn_ui.js`), fractions allowed
  function levelOfName(name) { const i = NAMES.indexOf(name); return i < 0 ? null : i / STEPS; }
  // how far under `fff` that level is written, in dB — always <= 0
  function dbOf(level) { return -(1 - clamp01(level)) * STEPS * STEP_DB; }
  function curveOf(bank, instKey) {
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    const c = inst && inst.cc7Curve;
    return (c && c.length >= 2) ? c : null;
  }
  // does this instrument have its MEASURED curve? (the status line's question — without it the table is the UVI law's guess)
  function hasCurve(bank, instKey) { return !!curveOf(bank, instKey); }

  // THE TABLE. level (0 … 1 on the written ladder) -> the CC7 that sounds it
  function cc7(bank, instKey, level) {
    const db = dbOf(level), c = curveOf(bank, instKey), V = VR && VR();
    if (c && V && V.cc7ForDelta) return clampCc(V.cc7ForDelta(c, db));
    return clampCc(127 * Math.pow(10, db / FALLBACK_K));
  }
  // a shaped note's `cc7Abs`: the fader range its own breakpoints ask for. A FLAT shape gives lo === hi, which with h = 1
  // holds it at its own written level — the note still sounds, it simply does not move.
  function range(bank, instKey, lo, hi) { return { lo: cc7(bank, instKey, lo), hi: cc7(bank, instKey, hi) }; }
  // and the drawn height that puts a breakpoint EXACTLY on its own table value, given that range: h = (T - T(lo)) / (T(hi) - T(lo)).
  // Every breakpoint lands on the table, not only the two ends — the ladder is not linear in CC7 and a straight line between
  // the ends would miss every dynamic in between.
  function height(bank, instKey, level, lo, hi) {
    const a = cc7(bank, instKey, lo), b = cc7(bank, instKey, hi);
    return b === a ? 1 : clamp01((cc7(bank, instKey, level) - a) / (b - a));
  }
  // PLAN 1n.1 (LGMF, 2026-09-22; RUNNING_LOG §263 · §264 — his B2): THE RESIDUAL. A SHORT note in a texture keeps its LADDER velocity
  // (1b's remap — the timbre of its dynamic; the written span is `spanDb`, 12 dB over the seven steps, ≈ 1.71 dB a name) and goes out
  // on a curve channel with its fader SET ONCE from this second table: each written step below `fff` is (STEP_DB − spanDb / 7) dB
  // ≈ 2.29, through the SAME measured curve — so velocity + fader = STEP_DB a name, the held notes' scale, on every instrument whatever
  // room its samples have. Nothing above changes: the sequences, the morph and the crescendo tool read `range` / `height` as before.
  // `spanDb` is read from the bank where it records it (`scale.spanDb`), else 12 [call, §275]. A level below 0 is niente → CC7 0.
  function spanDb(bank) { const s = bank && bank.scale ? +bank.scale.spanDb : NaN; return (s > 0 && s < STEPS * STEP_DB) ? s : 12; }
  function residualStepDb(bank) { return STEP_DB - spanDb(bank) / STEPS; }
  function residual(bank, instKey, level) {
    if (level < 0) return 0;
    const db = -(1 - clamp01(level)) * STEPS * residualStepDb(bank), c = curveOf(bank, instKey), V = VR && VR();
    if (c && V && V.cc7ForDelta) return clampCc(V.cc7ForDelta(c, db));
    return clampCc(127 * Math.pow(10, db / FALLBACK_K));
  }
  return { NAMES, STEP_DB, FALLBACK_K, levelOfName, dbOf, curveOf, hasCurve, cc7, range, height, spanDb, residualStepDb, residual };
});
