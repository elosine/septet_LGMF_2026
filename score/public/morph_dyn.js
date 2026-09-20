// morph_dyn.js — THE MORPH ON THE DYNAMICS LAW (PLAN 1h H3.1, RUNNING_LOG §171; docs/DYNAMICS_LAW.md).
//
// ONE helper, read by both sides of the morph — `morph_panel.js` when it INSERTS and `morph_emit.js` when it HEARS — so the
// panel's audition and the inserted score cannot drift apart. It is the sequence drawer's `mfVel` + `shape` (sequence_ui.js
// ~1500–1535), lifted to the morph's 0 … 10 levels.
//
// THE RULE (PLAN 1h H3, DYNAMICS_LAW §3 Rule 3 carried to the morph): EVERY sustained note the morph writes is SHAPED — struck
// at mf for its own pitch, on a curve channel, its fader between the table values of its own two written dynamics — MOVING OR
// NOT. It replaces the sentence of MORPH_NOTES 2026-09-20, *"a morph note whose level does NOT move stays a struck note"*. The
// reason is his ear, twice over: a bloom follows a sequence on the same take (LG-52), and a still `pp` left on the struck ladder
// would stand about 18 dB over that sequence's `pp` (RUNNING_LOG §157). It holds for EVERY pitch source, not only a take.
//
// WHAT IT DOES NOT TOUCH. `velRef` (the fade's constant velocity, §315) and `cc7Fade` (the fade's window, §317) are the engine's
// and stay exactly as it wrote them: a niente fade is a WEIGHT that multiplies in ON TOP of the answer here, never a rewrite of
// it. That is what keeps the fades a separate layer over the table (his question, RUNNING_LOG §167).
//
// Pure: no DOM, no MIDI. Loads on the page (window.MorphDyn) and in node.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(function () { return require('./velocity_remap.js'); }, function () { return require('./dyn_table.js'); });
  } else {
    root.MorphDyn = factory(function () { return root.VelocityRemap || null; }, function () { return root.DynTable || null; });
  }
})(typeof self !== 'undefined' ? self : this, function (VR, DT) {
  'use strict';

  const MF_ANCHOR = 100;        // mf on the written ladder (65 … 127), the same anchor sequence_ui.js uses
  const MIN_Y = 0.05;           // a drawn node never sits at zero — the score reads 0 as "no node"

  // level: the note's own breakpoints as [[t, 0 … 10], …] — the morph's scale, which is the drawn 0 … 1 height times ten
  // (morph_emit.js ~336 already maps h / 10 onto the anchors). Returns null when there is no table on the page, and then
  // every caller behaves exactly as it did before this file existed.
  function shapeLevels(bank, instKey, midi, level) {
    const T = DT();
    if (!T) return null;
    const pts = (level && level.length) ? level : [[0, 10]];
    const ys = pts.map(function (p) { return Math.max(0, Math.min(10, +(Array.isArray(p) ? p[1] : p) || 0)); });
    let lo = 1, hi = 0;
    ys.forEach(function (y) { const h = y / 10; if (h < lo) lo = h; if (h > hi) hi = h; });
    const V = VR();
    const d = (V && V.heldNote && bank && instKey) ? V.heldNote(bank, instKey, midi, MF_ANCHOR) : null;
    return {
      // RULE 1 — the mf strike, PER PITCH (the remap carries each instrument's register). No bank: the anchor passes through.
      velAbs: d ? d.vel : MF_ANCHOR,
      // RULE 2 — the note's own lowest and highest WRITTEN dynamics are the fader's two ends
      cc7Abs: T.range(bank, instKey, lo, hi),
      // and every breakpoint on its OWN table value, not interpolated between the ends — the ladder is not linear in CC7
      heights: ys.map(function (y) { return T.height(bank, instKey, y / 10, lo, hi); }),
      // RULE 3 — a FLAT note is shaped too: lo === hi, so `heldCc7` answers `lo` whatever the height, and the note keeps the
      // height it was DRAWN at. The caller must therefore not re-base a flat note's nodes.
      flat: hi - lo < 1e-9,
      measured: T.hasCurve(bank, instKey),
      lo: lo, hi: hi,
    };
  }

  // the drawn y for breakpoint i, ready for a score node — never zero, never over ten
  function yOf(S, i) { return Math.max(MIN_Y, Math.min(10, Math.round(1000 * 10 * S.heights[i]) / 1000)); }

  return { MF_ANCHOR: MF_ANCHOR, MIN_Y: MIN_Y, shapeLevels: shapeLevels, yOf: yOf };
});
