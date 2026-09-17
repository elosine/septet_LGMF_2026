// velocity_remap.js — the remap lookup shared by the composer page and the node tools (PLAN 1g item 1, RUNNING_LOG §116).
//
// The ensemble has one loudness scale: the violins' velocity (65 at the bottom of a curve, 127 at its top by default).
// bank/velocity_remap.json (tools/velocity_remap.js, from the sweep) holds, per instrument and measured register, the
// velocity that instrument must be sent to sound as loud as the violins do at each anchor velocity. velocityFor()
// interpolates between the measured registers and holds the nearest beyond them; without a bank, or for an instrument
// the bank lacks, the anchor velocity passes through unchanged (the pre-sweep behaviour).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VelocityRemap = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function clampV(v) { return Math.max(1, Math.min(127, Math.round(v))); }
  // bank: the parsed remap; instKey: the recipe's key ('flute' …); pitch: MIDI; anchorVel: the ensemble's scale (the violins')
  function velocityFor(bank, instKey, pitch, anchorVel) {
    const a = clampV(anchorVel);
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst || !inst.pitches || !inst.pitches.length) return a;
    const lo = bank.scale && bank.scale.lo != null ? bank.scale.lo : 65;
    const ps = inst.pitches;   // sorted by pitch by the tool
    const idx = tbl => Math.max(0, Math.min(tbl.length - 1, a - lo));
    const at = p => p.table[idx(p.table)];
    if (pitch == null || pitch <= ps[0].pitch) return clampV(at(ps[0]));
    if (pitch >= ps[ps.length - 1].pitch) return clampV(at(ps[ps.length - 1]));
    for (let k = 0; k < ps.length - 1; k++) {
      if (pitch >= ps[k].pitch && pitch <= ps[k + 1].pitch) {
        const t = (pitch - ps[k].pitch) / (ps[k + 1].pitch - ps[k].pitch);
        return clampV(at(ps[k]) + (at(ps[k + 1]) - at(ps[k])) * t);
      }
    }
    return clampV(at(ps[ps.length - 1]));
  }
  // the CC7 to send before the note (127 = none): the trim the remap prescribes at this anchor velocity, by register (§119)
  function cc7For(bank, instKey, pitch, anchorVel) {
    const a = clampV(anchorVel);
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst || !inst.pitches || !inst.pitches.length || !inst.pitches[0].cc7) return 127;
    const lo = bank.scale && bank.scale.lo != null ? bank.scale.lo : 65;
    const ps = inst.pitches;
    const at = p => p.cc7[Math.max(0, Math.min(p.cc7.length - 1, a - lo))];
    const c = v => Math.max(1, Math.min(127, Math.round(v)));
    if (pitch == null || pitch <= ps[0].pitch) return c(at(ps[0]));
    if (pitch >= ps[ps.length - 1].pitch) return c(at(ps[ps.length - 1]));
    for (let k = 0; k < ps.length - 1; k++) {
      if (pitch >= ps[k].pitch && pitch <= ps[k + 1].pitch) { const t = (pitch - ps[k].pitch) / (ps[k + 1].pitch - ps[k].pitch); return c(at(ps[k]) + (at(ps[k + 1]) - at(ps[k])) * t); }
    }
    return c(at(ps[ps.length - 1]));
  }
  // ---- the held-note hybrid (1g item 5, RUNNING_LOG §120): the velocity for the TOP of a note's curve, CC7 for the height ----
  function lerp(a, b, t) { return a + (b - a) * t; }
  function curveAt(pts, x, xk, yk) {   // linear between the points (sorted by xk), flat beyond the ends
    if (!pts || !pts.length) return null;
    if (x <= pts[0][xk]) return pts[0][yk];
    if (x >= pts[pts.length - 1][xk]) return pts[pts.length - 1][yk];
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i][xk] && x <= pts[i + 1][xk]) { const s = pts[i + 1][xk] - pts[i][xk]; return lerp(pts[i][yk], pts[i + 1][yk], s > 0 ? (x - pts[i][xk]) / s : 0); }
    }
    return pts[pts.length - 1][yk];
  }
  // the level (dB, the sweep's weighting) this instrument makes at (pitch, vel) with CC7 127 — the monotone fit where it exists
  function levelFor(bank, instKey, pitch, vel) {
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst || !inst.pitches || !inst.pitches.length) return null;
    const ps = inst.pitches, lv = p => curveAt(p.monotone || p.measured, vel, 'v', 'db');
    if (pitch == null || pitch <= ps[0].pitch) return lv(ps[0]);
    if (pitch >= ps[ps.length - 1].pitch) return lv(ps[ps.length - 1]);
    for (let k = 0; k < ps.length - 1; k++) {
      if (pitch >= ps[k].pitch && pitch <= ps[k + 1].pitch) { const t = (pitch - ps[k].pitch) / (ps[k + 1].pitch - ps[k].pitch); return lerp(lv(ps[k]), lv(ps[k + 1]), t); }
    }
    return lv(ps[ps.length - 1]);
  }
  // the ensemble's target level at an anchor velocity (the violins' curve, from the bank)
  function targetDb(bank, anchorVel) {
    if (!bank || !bank.targetDb || !bank.targetDb.length) return null;
    const lo = bank.scale && bank.scale.lo != null ? bank.scale.lo : 65;
    return bank.targetDb[Math.max(0, Math.min(bank.targetDb.length - 1, clampV(anchorVel) - lo))];
  }
  // the CC7 whose attenuation (the instrument's measured CC7 curve, dB re 127) brings a level down by -delta; 127 when nothing to trim
  function cc7ForDelta(curve, delta) {
    if (!curve || !curve.length || delta == null || delta >= -0.3) return 127;
    if (delta <= curve[0].delta) return curve[0].cc7;
    for (let i = 0; i < curve.length - 1; i++) {
      if (delta >= curve[i].delta && delta <= curve[i + 1].delta) { const s = curve[i + 1].delta - curve[i].delta; return Math.round(lerp(curve[i].cc7, curve[i + 1].cc7, s > 1e-9 ? (delta - curve[i].delta) / s : 0)); }
    }
    return 127;
  }
  // a drawn sustained note: its velocity chosen for the top of its curve (anchorMax = the ensemble's scale at the curve's highest point)
  function heldNote(bank, instKey, pitch, anchorMax) {
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst) return null;
    const vel = velocityFor(bank, instKey, pitch, anchorMax);
    return { vel, level: levelFor(bank, instKey, pitch, vel) };
  }
  // the CC7 to stream at a curve height (anchorVel = the ensemble's scale at that height) for a note sounding at vel
  function cc7ForHeight(bank, instKey, pitch, vel, anchorVel) {
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst) return 127;
    const L = levelFor(bank, instKey, pitch, vel), T = targetDb(bank, anchorVel);
    if (L == null || T == null) return 127;
    return cc7ForDelta(inst.cc7Curve, T - L);
  }
  // what the bank says about a register's reach (for a status line): the clamp counts of the nearest measured pitch
  function reach(bank, instKey, pitch) {
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst || !inst.pitches || !inst.pitches.length) return null;
    const p = inst.pitches.reduce((b, q) => Math.abs(q.pitch - pitch) < Math.abs(b.pitch - pitch) ? q : b, inst.pitches[0]);
    return { pitch: p.pitch, clampedLow: p.clampedLow, clampedHigh: p.clampedHigh };
  }
  return { velocityFor, cc7For, levelFor, targetDb, cc7ForDelta, heldNote, cc7ForHeight, reach };
});
