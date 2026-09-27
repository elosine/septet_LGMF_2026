// notation/lib/edge_rules.js — THE ONE EDGE FUNCTION (LGMF PLAN 2e.2, 2026-09-27; RUNNING_LOG §409 … §411 the design · §449 the build).
//
// The screen's edge rule (2c, his §340): a stamp whose ink reaches left of the page's first moment x(t0) is PUSHED RIGHT by the
// difference, as one unit; a go-time indicator is never moved; a long graphic is cut like paper. His word on the animated devices
// (§410 · §411): "one system, not a separate one" — so the static page (render.js, per unit at layout) and the animation layer
// (animobj.js, per frame at the now) push through THIS function, and the classes of both live in page_rules.json `edge` (an animated
// kind as `anim:<kind>`, print `none`). A pushed device "waits at the edge" and slides back as the cursor advances (§411).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationEdgeRules = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const EPS_PX = 1e-6;
  // how far a unit whose ink starts at leftPx is pushed right to clear x0Px (0 = not pushed)
  function clampShift(leftPx, x0Px) { return leftPx < x0Px - EPS_PX ? x0Px - leftPx : 0; }
  // every unit's push: lefts = Map(key → the unit's leftmost ink px) → Map(key → shift), the pushed ones only
  function unitShifts(lefts, x0Px) {
    const out = new Map();
    for (const [k, l] of lefts) { const s = clampShift(l, x0Px); if (s) out.set(k, s); }
    return out;
  }
  // the screen class of a kind: a static kind by its own name, an animated one as `anim:<kind>`; null = no rule (the caller draws as before)
  function screenClassOf(edge, kind, animated) {
    const row = edge && edge[animated ? 'anim:' + kind : kind];
    return row && row.screen ? row.screen : null;
  }
  return { clampShift, unitShifts, screenClassOf };
}));
