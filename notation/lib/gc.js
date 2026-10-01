// gc.js — THE GC OBJECT, ported whole from piece #1 (string quartet,
// public/index.html: GCMaker.calculateTrajectory / renderGC / update) on
// day 23 at the composer's instruction: "when I say GC, that is the whole
// thing ... the same colors, the same lines, and line thickness, and then
// those trajectory ... the ball should be the same color, the same size."
// Piece #2's copy of the same three functions was diffed against piece #1's
// the same day: the drawn object is byte-identical (only page-section
// plumbing differs), so this one port serves both sources.
//
// ONE copy of the physics: render.js draws the static arc + impact marker
// from it, animobj.js moves the ball along it. Pure, dual-load.
//
// The object (piece #1's numbers, all in px at the 1080-high frame; a
// zoomed view scales them by view.heightPx / frameHeightPx so the PP-6
// magnification holds):
//   arc      polyline of 201 samples, stroke = the GC color, 1.5 px, no fill;
//            x is TIME (impact + Δt · pxPerSecond) — the ball travels along it
//   impact   circle r 4 px at (impactX, laneBottom − 5)
//   ball     circle r 5 px, same color, at (xOfSeconds(t), impactY − relY(t))
//   height   h = laneHeight − 10 (impact 5 px above the lane bottom, apex
//            5 px below the lane top — "visual height fills the track")
//   color    neonMagenta = rgb(255, 21, 160) (piece #1 ColorMap)
// Physics (piece #1, verbatim):
//   descentPower = 1 + ictus/1000·20   ascentPower = 1 + stiffness/50
//   rebound = damping/100              descentFraction = descentRatio/100
//   descent: relY = h·(1 − u^descentPower), u: 0→1 over duration·descentFraction
//   ascent:  relY = h·rebound·(1 − (1−u)^ascentPower), over the remainder
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationGC = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // piece #1's "Short" preset = BartokPizz_GC_20260309_112021 — the preset
  // every GC of its 6:10 section carries (43/43, verified day 23)
  const DEFAULT_PRESET = { stiffness: 62, damping: 100, ictus: 90, descentRatio: 60, duration: 0.6 };

  // piece #1's drawn look, verbatim (renderGC + update)
  const LOOK = {
    color: 'rgb(255, 21, 160)',
    arcStrokePx: 1.5,
    impactRadiusPx: 4,
    ballRadiusPx: 5,
    impactInsetPx: 5,     // impactY = trackBottom - 5
    heightInsetPx: 10,    // h = staffHeight - 10
    frameHeightPx: 1080,  // the px above are stated at this frame height
    samples: 100,         // per phase, as piece #1 (numSamples)
  };

  function params(preset) {
    const P = Object.assign({}, DEFAULT_PRESET, preset || {});
    const df = P.descentRatio / 100;
    return {
      descentPower: 1 + (P.ictus / 1000) * 20,
      ascentPower: 1 + P.stiffness / 50,
      rebound: P.damping / 100,
      pre: P.duration * df,          // timeFall
      post: P.duration * (1 - df),   // timeRise
      preset: P,
    };
  }

  // height fraction (0..1 of h) at Δt = t − impact; null outside the span
  function heightFrac(P, dt) {
    const cl = u => (u < 0 ? 0 : u > 1 ? 1 : u);   // float edges → NaN guard
    if (dt < -P.pre - 1e-9 || dt > P.post + 1e-9) return null;
    if (dt <= 0) {
      const u = cl(P.pre > 0 ? (dt + P.pre) / P.pre : 1);
      return 1 - Math.pow(u, P.descentPower);
    }
    const u = cl(P.post > 0 ? dt / P.post : 1);
    return P.rebound * (1 - Math.pow(1 - u, P.ascentPower));
  }

  // the sampled polyline piece #1 draws: [{dt, frac}], descent 0..N then
  // ascent 1..N (201 points at samples = 100)
  function trajectory(P, samples) {
    const N = samples || LOOK.samples;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      pts.push({ dt: -P.pre + u * P.pre, frac: 1 - Math.pow(u, P.descentPower), phase: 'descend' });
    }
    for (let i = 1; i <= N; i++) {
      const u = i / N;
      pts.push({ dt: u * P.post, frac: P.rebound * (1 - Math.pow(1 - u, P.ascentPower)), phase: 'ascend' });
    }
    return pts;
  }

  // lane geometry for a system, in px: the frame-scale factor, impact y,
  // and the drop height — piece #1's renderGC numbers
  // [§593, his 'narrow the aperture of the GC, the angle of spread of its arcs … to about 70%'] the preset a GC plays: the registry's, the
  // note's own on top, and — on the beat-ball geometry — the duration × spread (rules.json objects.gc.beatBall.spread): the same height in
  // a narrower time, the fall and the rise steeper. One copy for the static arc (render.js) and the ball (animobj.js)
  function presetFor(base, item, look) {
    const P = Object.assign({}, base || {}, item || {});
    // [§650] the 'staffTop' geometry (style 3) carries its own spread — the same narrow aperture, by its rules row
    const bb = look && ((look.geom === 'beatBall' && look.beatBall) || (look.geom === 'staffTop' && look.staffTop));
    if (bb && bb.spread) P.duration = (P.duration != null ? P.duration : DEFAULT_PRESET.duration) * bb.spread;
    // [§656, his 'the standard one … let's narrow the aperture. About 30%'] a hand's own aperture (gcSpread → look.spread) on any geometry
    if (look && look.spread > 0) P.duration = (P.duration != null ? P.duration : DEFAULT_PRESET.duration) * look.spread;
    return P;
  }
  function laneGeom(sys, view, look) {
    const L = Object.assign({}, LOOK, look || {});
    const k = view.heightPx / L.frameHeightPx;
    // [§592, his 'a modified GC that follows the same height as the bouncing ball … adjust the arcs accordingly'] geom 'beatBall': the GC's
    // arc and ball take THE BEAT BALL's flight (animobj beatBall, §570 · §571) — the impact at the grid line's foot (the bottom staff line
    // plus the overhang), the height the line's own plus the rise above its top; the arcs scale with it. L.beatBall = { overhangSs, riseSs }
    // from the registry (rules.json objects.gc.beatBall). Any other geom: piece #1's lane geometry below, untouched
    if (L.geom === 'beatBall' && L.beatBall && typeof sys.yOfSs === 'function' && sys.ssPx) {
      const STAFF_HALF = 2, over = L.beatBall.overhangSs != null ? L.beatBall.overhangSs : 0.4, rise = L.beatBall.riseSs != null ? L.beatBall.riseSs : 2;   // RULES MIRROR (rules.json objects.gc.beatBall · objects.tick.gridOverhangSs)
      return { k, impactY: sys.yOfSs(-STAFF_HALF - over), h: (2 * STAFF_HALF + 2 * over + rise) * sys.ssPx, look: L };
    }
    // [RUNNING_LOG §650, his 'it descends from the top of the lane … the impact point being down just above the top staff line'] geom
    // 'staffTop' (GC style 3): the apex where the lane GC's is (the lane's top, inset as piece #1's), the impact just ABOVE the staff's own
    // top line — L.staffTopSs (the part's top line, handed in on the item / the instance; five lines = 2) + L.staffTop.gapSs. The arc and
    // the ball scale to that drop. For a staff whose inside is not free (the percussion's seven lines).
    if (L.geom === 'staffTop' && typeof sys.yOfSs === 'function' && sys.ssPx) {
      const ST = L.staffTop || {}, top = L.staffTopSs != null ? L.staffTopSs : 2, gap = ST.gapSs != null ? ST.gapSs : 0.4;   // RULES MIRROR (rules.json objects.gc.staffTop.gapSs)
      const impactYs = sys.yOfSs(top + gap), apexY = sys.yTopPx + (L.heightInsetPx - L.impactInsetPx) * k;
      return { k, impactY: impactYs, h: Math.max(1, impactYs - apexY), look: L };
    }
    // [RUNNING_LOG §653, his 'the standard one … if there was a staff line below the bass drum, another percussion one … let's have that be
    // the impact point'] the lane GC with a NAMED impact: L.impactSs (the staff's next line below its bottom line, handed in on the item /
    // the instance from the device's gcImpact 'lineBelow') — the apex stays the lane GC's own (the lane's top), the drop runs to that line
    if (L.impactSs != null && typeof sys.yOfSs === 'function') {
      const apexY = sys.yTopPx + (L.heightInsetPx - L.impactInsetPx) * k, impactYs = sys.yOfSs(L.impactSs);
      return { k, impactY: impactYs, h: Math.max(1, impactYs - apexY), look: L };
    }
    const impactY = sys.yBotPx - L.impactInsetPx * k;
    const h = sys.heightPx - L.heightInsetPx * k;
    return { k, impactY, h, look: L };
  }

    // §401e (the composer, on the piano's double-height lane: 'make the GC the same height as all the
  // other GCs ... the top of the arc at the very top of the lane ... the impact lands between the two
  // staffs'): THE GC'S SYSTEM for a part is the FIRST STAFF of a multi-staff part — its top is the
  // lane's top, its bottom is the boundary between the staves, its height a single lane's — else the
  // part's own lane. ONE copy for render.js (arc + impact marker) and animobj.js (the ball), so the
  // ball lands where the marker is. Ensemble-free: a part with staves has a ':0' system.
  function systemOf(view, part) {
    try { return view.system(part + ':0'); } catch (e) { return view.system(part); }
  }
  return { DEFAULT_PRESET, LOOK, params, presetFor, heightFrac, trajectory, laneGeom, systemOf };
});
