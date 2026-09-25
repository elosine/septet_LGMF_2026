// coords.js — THE coordinate module (Phase B2, plan DB-2; architecture §5).
// ONE module owns every translation between units; every other module CALLS
// it; nothing duplicates the math; mirrors are a smell (piece #2
// COORDINATE_SYSTEM_VISION §5). Pure, dual-load, no state, no DOM.
//
// The three-layer stack (architecture §5):
//   1. score time in SECONDS   — canonical, persistent (the strip)
//   2. lane-relative units     — persistent, viewport-invariant:
//        · lane FRACTION places SYSTEMS (the meta-structure level)
//        · STAFF-SPACE (ss) is the unit inside a system (glyph metrics)
//   3. pixels                  — exist only through a View, stored nowhere
//
// SZ-7 lesson adopted: ss is LANE-RELATIVE — ssPx derives from the system
// band's height (ssPerSystem vertical ss per band), so a resize rescales
// everything coherently and no absolute-pixel calibration can break.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationCoords = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const DEFAULTS = {
    ssPerSystem: 12,   // vertical ss a system band spans (staff 4ss + air above/below)
  };

  // Band meta-structure: N parts stacked top to bottom with fractional
  // padding and gaps. Returns [{part, laneFrac0, laneFrac1}] — laneFrac 0 is
  // the TOP of the viewport, 1 the bottom (screen convention, stated once).
  // [A21/V1] opts.weights: per-part height weights (heights proportional;
  // equal bands when omitted) — irregular track heights are a lane-config
  // edit, never a layout change.
  function systemsForParts(parts, opts) {
    const o = Object.assign({ topPad: 0.02, botPad: 0.02, gap: 0.01 }, opts || {});
    const n = parts.length;
    const usable = 1 - o.topPad - o.botPad - o.gap * (n - 1);
    if (usable <= 0) throw new Error('coords: padding/gaps leave no room for ' + n + ' systems');
    const w = o.weights;
    if (w) {
      if (w.length !== n) throw new Error('coords: weights length ' + w.length + ' != parts length ' + n);
      if (w.some(x => !(x > 0))) throw new Error('coords: weights must be positive');
    }
    const total = w ? w.reduce((a, b) => a + b, 0) : n;
    let f = o.topPad;
    return parts.map((part, i) => {
      const h = usable * (w ? w[i] : 1) / total;
      const s = { part, laneFrac0: f, laneFrac1: f + h };
      f += h + o.gap;
      return s;
    });
  }

  // [2a.1, the septet — 2026-09-11] A part of TWO OR MORE STAVES (the
  // piano's grand staff) is ONE lane: one label, one solo, one brace. The
  // lane entry stays as it is (whole-lane consumers — the GC's landing,
  // the followers, the solo dim — keep finding it by its part number), and
  // each staff is added as a sub-system keyed '<part>:<i>', an equal slice
  // of the lane from the top, with its share of the lane's staff scale, so
  // every staff in the frame is the same size. stavesOf(part) -> count.
  // [§401k, 2026-09-11] opts.interStaffGapSs (or centreToCentreFrac): the distance between the middle lines of
  // adjacent staves of ONE part, as a fraction of the frame height — the grand staff's
  // inter-staff gap made data (registry engraving.layout.grandStaff.interStaffGapSs, 6 ss =
  // piece #2's locked LilyPond measurement; LilyPond's own PianoStaff default is 5). The
  // staves are placed at that distance, CENTRED IN THE LANE; each keeps its half-lane band
  // (the GC's impact stays at the gap's middle) and gets a `midFrac` the view honours for
  // its middle line. Without opts: each staff centred in its own share, as before.
  // [2a, LGMF 2026-09-25 — RUNNING_LOG §332 · §337] A JOINED GROUP (registry groups[].joined): several PARTS in ONE lane
  // of the frame — the percussionist's seven-line staff over the vibraphone's treble staff, 6 ss apart, under one brace.
  // Piece #5's grand staff was one part with two staves; here the IR's part is the composer lane, so the join is a
  // property of the GROUP: the lead part (the first) carries the lane's weight, every member keeps its own part number as
  // its system key (every consumer keeps finding parts 4 and 5), the staves sit at their centre-to-centre distances
  // (half + gap + half), centred in the lane, and each member's band is its share of the lane at ONE ssPx. A staff's
  // half-height comes from the part's staff entry ({ lines: [...] | n, gapSs }) — five lines at 1 ss = 2 when absent.
  function staffHalfSs(pc) {
    const st = pc && pc.staff;
    const n = st && st.lines ? (Array.isArray(st.lines) ? st.lines.length : st.lines) : 5;
    return (n - 1) / 2 * ((st && st.gapSs > 0) ? st.gapSs : 1);
  }
  // { leadPart: { members: [{ key, halfSs }...], gapSs } } — empty when the ensemble has no joined group
  function joinedOf(ens) {
    const out = {};
    for (const g of (ens && ens.groups) || []) {
      if (!g.joined || !Array.isArray(g.parts) || g.parts.length < 2) continue;
      const members = g.parts.map(p => ({ key: p, halfSs: staffHalfSs((ens.parts || []).find(q => q.part === p)) }));
      out[g.parts[0]] = { members, gapSs: g.gapSs > 0 ? g.gapSs : 6 };
    }
    return out;
  }
  // the frame's LANES from its parts: a joined group's members after the lead drop out (they ride the lead's lane)
  function laneParts(parts, joined) {
    const drop = new Set();
    for (const lead of Object.keys(joined || {})) for (const m of joined[lead].members.slice(1)) drop.add(m.key);
    return parts.filter(p => !drop.has(p));
  }
  // one joined lane -> its members' systems (the lane entry itself is keyed '<lead>+<members>' so no part key is ambiguous)
  function joinedSystems(s, j) {
    const out = [Object.assign({}, s, { part: j.members.map(m => m.key).join('+'), joinedLane: true })];
    const laneSs = s.laneFrac1 - s.laneFrac0, fracPerSs = s.ssPerSystem > 0 ? laneSs / s.ssPerSystem : 0;
    if (!(fracPerSs > 0)) return out.concat(j.members.map((m, i) => Object.assign({}, s, { part: m.key, lane: s.part, staff: i })));
    // staff middles, ss below the first staff's middle: p0 = 0, p_i = p_(i-1) + half_(i-1) + gap + half_i
    const pos = [];
    j.members.forEach((m, i) => { pos.push(i === 0 ? 0 : pos[i - 1] + j.members[i - 1].halfSs + j.gapSs + m.halfSs); });
    const last = j.members.length - 1;
    const centre = (pos[last] + j.members[last].halfSs - j.members[0].halfSs) / 2;   // the block of staves, centred in the lane
    const laneMid = (s.laneFrac0 + s.laneFrac1) / 2;
    j.members.forEach((m, i) => {
      const midFrac = laneMid + (pos[i] - centre) * fracPerSs;
      // the member's band: from the middle of the gap above to the middle of the gap below (the lane's edges at the ends)
      const f0 = i === 0 ? s.laneFrac0 : laneMid + (pos[i] - centre - m.halfSs - j.gapSs / 2) * fracPerSs;
      const f1 = i === last ? s.laneFrac1 : laneMid + (pos[i] - centre + m.halfSs + j.gapSs / 2) * fracPerSs;
      out.push(Object.assign({}, s, { part: m.key, lane: s.part, staff: i, laneFrac0: f0, laneFrac1: f1,
        ssPerSystem: (f1 - f0) / fracPerSs, midFrac }));
    });
    return out;
  }

  function withStaves(systems, stavesOf, opts) {
    const out = [];
    for (const s of systems) {
      const J = opts && opts.joined && typeof s.part === 'number' ? opts.joined[s.part] : null;
      if (J) { for (const x of joinedSystems(s, J)) out.push(x); continue; }
      out.push(s);
      const n = (typeof s.part === 'number' && stavesOf(s.part)) || 1;
      if (n < 2) continue;
      const h = (s.laneFrac1 - s.laneFrac0) / n;
      for (let i = 0; i < n; i++) {
        // the gap in ss becomes a frame fraction through THIS lane's own scale (ss per lane
        // height), so the same number holds in the video frame, the zoom and any export
        const c2c = opts && opts.interStaffGapSs > 0 && s.ssPerSystem > 0
          ? (opts.interStaffGapSs + 4) * (s.laneFrac1 - s.laneFrac0) / s.ssPerSystem
          : (opts && opts.centreToCentreFrac > 0 ? opts.centreToCentreFrac : null);
        const laneMid = (s.laneFrac0 + s.laneFrac1) / 2;
        out.push(Object.assign({}, s, {
          part: s.part + ':' + i, lane: s.part, staff: i,
          laneFrac0: s.laneFrac0 + i * h, laneFrac1: s.laneFrac0 + (i + 1) * h,
          ssPerSystem: s.ssPerSystem ? s.ssPerSystem / n : undefined,
        }, c2c ? { midFrac: laneMid + (i - (n - 1) / 2) * c2c } : {}));
      }
    }
    return out;
  }

  // [PLAN 2b.1.2, the septet — 2026-09-17] THE ENSEMBLE'S LANE BAND, ONCE.
  // Weighted lanes + the per-lane staff scale + the grand staff were three
  // copies of the same fifteen lines: notation.html renderContainerView,
  // export_video.js, export_print.js. The print copy was the OLDEST — it never
  // got 2a.1's weights or 2i.10.1's staves, which is exactly why the print
  // score drew six equal lanes and no piano (RUNNING_LOG §552). NITS had named
  // the three copies; PLAN 3's performance score would have been a fourth.
  // The video and print exporters now call this; the app keeps its own copy
  // until it is next opened (a running page is not worth the risk today).
  //
  //   parts             the frame's part numbers, top to bottom
  //   o.heightPx        the frame height the pads/gaps/cap are expressed in
  //   o.lanes           realization lanes {padTopPx, padBotPx, gapPx, sparseCapPx, weights}
  //   o.staffHeightPx   registry staff.staffHeightPx (the absolute staff size)
  //   o.weightOf(part)  lane weight — ABSENT means NO ENSEMBLE: equal lanes and
  //                     the registry's own weights, i.e. the tuba frame, untouched
  //   o.stavesOf(part)  staves in a part (the piano's 2)
  //   o.grandStaff      registry engraving.layout.grandStaff
  //
  // Returns { systems, ssPerSystem, lanePx, weights, units, topPad, botPad, gap }.
  // lanePx is ONE WEIGHT UNIT — a player's lane — in the frame's own pixels;
  // ssPerSystem is a RATIO (lane height / one staff space), so a consumer at a
  // different size (the printed page) reuses both untouched.
  function ensembleFrame(partsIn, o) {
    const H = o.heightPx, lanes = o.lanes || {};
    const ens = typeof o.weightOf === 'function';
    // [2a] the frame's LANES: a joined group is one lane (o.joined, or read from o.ensemble); without either, parts = lanes
    const joined = o.joined || (ens && o.ensemble ? joinedOf(o.ensemble) : {});
    const parts = ens ? laneParts(partsIn, joined) : partsIn;
    let topPad = (lanes.padTopPx || 0) / H, botPad = (lanes.padBotPx || 0) / H;
    const gap = (lanes.gapPx || 0) / H;
    const weights = ens ? parts.map(o.weightOf) : lanes.weights;
    const units = ens ? weights.reduce((a, b) => a + b, 0) : parts.length;
    let lanePx = ((1 - topPad - botPad - gap * (parts.length - 1)) / units) * H;
    // sparse-part IRs: cap the lane and centre the band, so a one-part
    // experiment stops inflating a lane to the whole frame (app fix B, day 22)
    if (lanes.sparseCapPx && lanePx > lanes.sparseCapPx) {
      lanePx = lanes.sparseCapPx;
      const content = (lanePx * units + (lanes.gapPx || 0) * (parts.length - 1)) / H;
      topPad = botPad = Math.max(0, (1 - content) / 2);
    }
    let systems = systemsForParts(parts, { topPad, botPad, gap, weights });
    const ssPerSystem = lanePx / ((o.staffHeightPx || 31.6) / 4);
    if (ens) {
      systems.forEach((s, i) => { s.ssPerSystem = ssPerSystem * weights[i]; });
      const gs = o.grandStaff;
      systems = withStaves(systems, o.stavesOf || (() => 1),
        Object.assign(gs && gs.interStaffGapSs > 0 ? { interStaffGapSs: gs.interStaffGapSs } : {}, { joined }));
    }
    return { systems, ssPerSystem, lanePx, weights, units, topPad, botPad, gap, lanes: parts };
  }

  // A View binds the persistent layers to one viewport. All px appear here
  // and only here.
  //   cfg: { widthPx, heightPx, window: [t0, t1], systems, ssPerSystem?,
  //          gutterPx? }
  // [A21c/V1] gutterPx: UNTIMED prefatory space at the left edge — time
  // maps onto [gutterPx, widthPx]; x < gutterPx is dead space (clef, part
  // labels; the cursor enters at xOfSeconds(t0) = gutterPx).
  // [A21/V1] a systems entry may carry its own ssPerSystem — lane height
  // and staff scale are independent ("taller lane, same staff, more air").
  function makeView(cfg) {
    const { widthPx, heightPx } = cfg;
    const [t0, t1] = cfg.window;
    if (!(t1 > t0)) throw new Error('coords: window must increase');
    if (!(widthPx > 0 && heightPx > 0)) throw new Error('coords: viewport must be positive');
    const ssPerSystem = cfg.ssPerSystem || DEFAULTS.ssPerSystem;
    const gutterPx = cfg.gutterPx || 0;
    if (!(gutterPx >= 0 && gutterPx < widthPx)) throw new Error('coords: gutter must leave music room');
    const pxPerSecond = (widthPx - gutterPx) / (t1 - t0);

    const xOfSeconds = t => gutterPx + (t - t0) * pxPerSecond;
    const secondsOfX = x => t0 + (x - gutterPx) / pxPerSecond;
    const yOfLaneFrac = f => f * heightPx;
    const laneFracOfY = y => y / heightPx;

    const systems = cfg.systems.map(s => {
      const yTopPx = yOfLaneFrac(s.laneFrac0);
      const yBotPx = yOfLaneFrac(s.laneFrac1);
      const hPx = yBotPx - yTopPx;
      const ssSys = s.ssPerSystem || ssPerSystem;     // per-lane staff scale
      const ssPx = hPx / ssSys;                       // SZ-7: lane-relative
      const yMidPx = s.midFrac != null ? yOfLaneFrac(s.midFrac) : (yTopPx + yBotPx) / 2;   // staff middle line ([§401k] a staff of a grand staff sits where its part's gap puts it)
      return {
        part: s.part,
        yTopPx, yBotPx, heightPx: hPx, ssPx, yMidPx, ssPerSystem: ssSys,
        // vertical position from a ss offset relative to the staff middle
        // line; +ss goes UP on the page (musical convention), so px go down.
        yOfSs: ss => yMidPx - ss * ssPx,
        ssOfY: y => (yMidPx - y) / ssPx,
        pxOfSs: ss => ss * ssPx,                      // lengths (unsigned)
      };
    });
    const byPart = new Map(systems.map(s => [s.part, s]));

    return {
      widthPx, heightPx, window: [t0, t1], pxPerSecond, ssPerSystem, gutterPx,
      xOfSeconds, secondsOfX, yOfLaneFrac, laneFracOfY,
      systems,
      system: part => {
        const s = byPart.get(part);
        if (!s) throw new Error('coords: no system for part ' + part);
        return s;
      },
    };
  }

  // [V1] The PP-6 zoom, encoded ONCE: a uniform ×Z magnification of the
  // SAME geometry. Every scale doubles — ssPx (via heightPx×Z), pxPerSecond
  // and the gutter — so every drawn coordinate is exactly ×Z, provable.
  // The window RE-CUTS to what still fits full-width: span' =
  // (widthPx − Z·gutter) / (Z·pxPerSecond). (Naive span/Z is exact only at
  // gutter 0.) Vertical overflow is the zoom shell's scroll, by design.
  function zoomCfg(cfg, Z, t0) {
    if (!(Z > 0)) throw new Error('coords: zoom factor must be positive');
    const [b0, b1] = cfg.window;
    const G = cfg.gutterPx || 0;
    const basePps = (cfg.widthPx - G) / (b1 - b0);
    const start = t0 === undefined ? b0 : t0;
    const span = (cfg.widthPx - Z * G) / (Z * basePps);
    if (!(span > 0)) throw new Error('coords: zoom leaves no music width');
    return Object.assign({}, cfg, {
      heightPx: cfg.heightPx * Z,
      gutterPx: G * Z,
      window: [start, start + span],
    });
  }

  return { makeView, systemsForParts, withStaves, ensembleFrame, zoomCfg, DEFAULTS, joinedOf, laneParts, staffHalfSs };
});
