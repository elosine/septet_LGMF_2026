// render.js — Phase B5: layout model + coords view → SVG string (pass 5).
// Pure, dual-load. The ONLY place pixels exist. Ink is black-on-paper; the
// parachute bricks and read-through labels use muted color so mixed
// fidelity is visible at a glance.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./stamps.js'), require('./gc.js'));
  } else {
    root.NotationRender = factory(root.NotationStamps, root.NotationGC);
  }
})(typeof self !== 'undefined' ? self : this, function (Stamps, GC) {

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // [D42, RUNNING_LOG §447] THE CURVE LOOK, from the two-piano piece's final performance score (builds/performance, renderCurve):
  // ONE closed path — fill = the colour at fillOpacity, a stroke of the same colour and strokeWPx ROUND THE WHOLE SHAPE (top, sides and
  // baseline), and pathOpacity on the path itself. With #2's numbers (0.3 · 2 px · 0.3) the interior shows at 0.3 × 0.3 = 9 % and the
  // outline at 30 % — the border he saw. The composer, 2026-09-13: the standard for these curves, across the board.
  function curvePathD42(C, d) {
    return '<path d="' + d + '" fill="' + C.color + '" fill-opacity="' + (C.fillOpacity != null ? C.fillOpacity : 0.3) +
      '" stroke="' + (C.strokeColor || C.color) + '" stroke-width="' + (C.strokeWPx != null ? C.strokeWPx : 2) +
      '" stroke-opacity="' + (C.strokeOpacity != null ? C.strokeOpacity : 1) + '" stroke-linejoin="round" opacity="' + C.pathOpacity + '"/>';
  }

  function renderSection(model, view, glyphs, opts) {
    const o = Object.assign({ ink: '#111', brick: '#4E7A9B', muted: '#8a8a8a', paper: '#fff' }, opts || {});
    // engraving registry (V0.10/V1): every look number in one mergeable
    // block; code defaults = the census values, so a caller without opts
    // renders identically. The shell passes container.json engraving.render.
    const E = Object.assign({
      fontFamily: 'sans-serif',
      partLabel: { xPx: 4, yOffsetSs: 0.9, sizeSs: 1.1 },
      textScale: 1.3,
      clefInsetSs: 0.6, clefGutterGapSs: 0.75,
      attackLine: { wSs: 0.18, hSs: 2.2, offsetSs: 1.1 },
      tick: { wSs: 0.12, hSs: 0.8 },
      brickOpacity: 0.45,
      reshow: { xSs: 4.2, sizeSs: 0.75 },
      // the env-curve device (day 22, retuned same day by composer verdicts:
      // "no outline to curve" -> fill-only, opacity raised to read alone;
      // "go line not visible" -> thicker/darker dashes, AI-intuited numbers).
      // Green = this piece's surge color (#2E7D32).
      envCurve: { strokeWPx: 0, strokeOpacity: 0, fillOpacity: 0.3, color: '#2E7D32' },
      // the morph glissando (day 35): brightOrange, TOP HALF of the lane, filled
      // to the half-lane baseline. Code default = the census value, so the live
      // view (which does not pass opts.engraving) and the export agree.
      glissCurve: { strokeWPx: 0, strokeOpacity: 0, fillOpacity: 0.22, color: '#F04B00' },
      // the trance bar line + tempo mark (day 35)
      barLine: { thickSs: 0.13, tempoYSs: 4.4, tempoSizeSs: 1.0, tempoHeadScale: 0.7, tempoStemSs: 2.1, tempoGapSs: 0.85 },
      // the crescendo: the glissando's twin in the bottom half, limeGreen
      // (#99FF00 — piece #1's crescendo colour, and p2's staff-1 green)
      crescCurve: { strokeWPx: 0, strokeOpacity: 0, fillOpacity: 0.22, color: '#99FF00' },
      // the morph SECTION HEADER (day 35). circleDiaSs = the measured height of
      // the `m` in mf (0.4695 ss — mp and mf agree); spacer = the 0.45 house
      // standard; medium = gapMediumSs. dynBelowSs mirrors dynY's 2.6 ss
      // distance from the staff, on the under side.
      sectionHead: { spacerSs: 0.45, mediumSs: 0.3, circleDiaSs: 0.4695,
                     arrowLenSs: 2, headSs: 0.45, thickSs: 0.13, dynBelowSs: 4.6 },
      // go line: near-black (composer, day 22 second note: "always black
      // gray" — the surge green was never meant for it); width/opacity/dash
      // = the retuned numbers, untouched
      goLine: { wPx: 1.5, opacity: 0.85, dash: '5,4', color: '#333' },
      // the ring bar (wc-23 element 2): 2/3 of the brick height, always black
      ringBar: { hSs: 0.667, color: '#111', opacity: 1 },
    }, (opts && opts.engraving) || {});
    const FONT = esc0 => String(esc0).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const fontAttr = ' font-family="' + FONT(E.fontFamily).replace(/"/g, '&quot;') + '"';
    const S = Stamps.makeStamps(glyphs);
    const boxFor = g => {
      if (g === 'notehead') return S.notehead();
      if (g === 'notehead-open') return S.noteheadOpen();
      if (g.startsWith('dyn-')) return S.dynamic(g.slice(4));
      if (/^flag-(up|down)\d+$/.test(g)) { const m = g.match(/^flag-(up|down)(\d+)$/); return S.flagN(+m[2], m[1]); }
      if (g.startsWith('artic-')) return S.articulation(g.slice('artic-'.length));
      if (g.startsWith('accidental-')) return S.accidental(g.slice('accidental-'.length));
      if (g.startsWith('text-')) return S.text(g.slice('text-'.length));       // [2h.5] piece #2's baked 'pizz.'
      if (g.startsWith('pedal-')) return S.pedal(g.slice('pedal-'.length));    // [2h.5] piece #2's 'Ped.'
      throw new Error('render: unknown glyph item "' + g + '"');
    };
    const stds = glyphs.standards;
    // [2a, the septet] the ensemble registry (notation/registry/ensemble.json)
    // — labels, brackets, the brace. Absent = the tuba page exactly.
    const ENS = (opts && opts.ensemble) || null;
    // [2c.1] THE MARGINS: the label block starts at the left margin, the clef column and the reshow at the music's start
    // (margin + gutter). A view without margins has ML 0 and MX0 = gutterPx — the page exactly as before.
    const ML = view.marginLeftPx || 0;
    const MX0 = view.musicX0Px != null ? view.musicX0Px : (view.gutterPx || 0);
    const CLEF_AT ={ bass: { line: 1, anchor: 'fLine' }, treble: { line: -1, anchor: 'gLine' }, alto: { line: 0, anchor: 'cLine' } };
    const parts = [];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + view.widthPx + '" height="' + view.heightPx +
      '" viewBox="0 0 ' + view.widthPx + ' ' + view.heightPx + '" style="background:' + o.paper + '">');
    parts.push('<rect x="0" y="0" width="' + view.widthPx + '" height="' + view.heightPx + '" fill="' + o.paper + '"/>');

    const [w0, w1] = view.window;
    // Page ownership is HALF-OPEN at the right edge (an event exactly on a
    // cut belongs to the NEXT page — review finding: it inked on both).
    // The final page of a tiling (or a standalone window) owns its end:
    // pass opts.ownsEnd = true.
    const ownsEnd = !opts || opts.ownsEnd !== false;
    const inWin = t => t >= w0 - 1e-9 && (ownsEnd ? t <= w1 + 1e-9 : t < w1 - 1e-9);
    // [PLAN 2b.7.1, D59] A PRINTED PAGE OWNS [cut, next cut). A POINT EVENT — a
    // strike and everything attached to it — draws only on the page that owns
    // its ONSET, and draws WHOLE; a LONG ITEM draws on every page it crosses,
    // clipped to the drawn span. opts.owned carries the two cuts; the page's
    // WINDOW is wider than what it owns, and the reserves it gains (2b.7.2/.3)
    // are where the overflowing ink goes. ABSENT = today's behaviour exactly —
    // the film keeps its overlap on purpose (the ball needs its approach), so
    // with no owned span the approved video renders byte-identical.
    const OWN = (opts && opts.owned) || null;
    const owns = OWN
      ? (t => t >= OWN[0] - 1e-9 && (ownsEnd ? t <= OWN[1] + 1e-9 : t < OWN[1] - 1e-9))
      : inWin;
    // [2c.2, LGMF 2026-09-25 — RUNNING_LOG §340] A TILED SCREEN PAGE (page_rules.screenPlan 'tile'): opts.screenEdges =
    // { edge: page_rules.edge, first }. The window IS the page, so a point item is owned half-open as above; a kind whose edge
    // entry says boundary 'before' is owned (t0, tω] instead — at exactly tω on this page, at exactly t0 on the page before
    // (the first page keeps its t0). ABSENT = today's behaviour exactly.
    const SCR = (opts && opts.screenEdges) || null;
    const EDGE = SCR ? (SCR.edge || {}) : null;
    const boundaryBefore = k => !!(EDGE && EDGE[k] && EDGE[k].boundary === 'before');
    const ownsBefore = t => (t > w0 + 1e-9 || !!SCR.first) && t <= w1 + 1e-9;
    // [2c.3] THE MATISSE CUT (the composer: "arc starts on p1, ends 1/2 way down at page cut so 1/2 of a descending magenta line, p2
    // picks up the line 1/2 way on descent, but nothing in gutter"): a kind whose edge entry says screen 'cut' is drawn on every page
    // it crosses — WHOLE, not sampled to the window — inside a clip to [x(t0), x(tω)], so the shape keeps its identity and the
    // remainder starts on the next page at x(t0) at the same height by construction. Point items are never clipped (2c.4).
    const cutKind = k => !!(EDGE && EDGE[k] && EDGE[k].screen === 'cut');
    const CLIP_ID = SCR ? ('twclip-' + Math.round(w0 * 1000)) : null;
    const clipOpen = CLIP_ID ? '<g class="tw-cut" clip-path="url(#' + CLIP_ID + ')">' : '';
    if (CLIP_ID) {
      const cx0 = view.xOfSeconds(w0), cx1 = view.xOfSeconds(w1);
      parts.push('<defs><clipPath id="' + CLIP_ID + '"><rect x="' + cx0.toFixed(2) + '" y="0" width="' + (cx1 - cx0).toFixed(2) +
        '" height="' + view.heightPx + '"/></clipPath></defs>');
    }
    // [2b.7.4] THE SYSTEM ENDS WHERE THE PAGE'S MUSIC ENDS: staff, ruler and
    // long items stop at the cut + the right reserve rather than at the window
    // edge — the ragged right edge of a page whose cut fell early. In a
    // proportional score blank staff reads as SILENCE, and the scale may never
    // change page to page (distance is time). Absent = the window edge.
    const wInk = (opts && opts.inkEnd != null) ? Math.min(opts.inkEnd, w1) : w1;
    // WHICH PAGES A LONG ITEM APPEARS ON (his eye on the first 2b.7 render, 2026-09-17:
    // "pg 2 in piano, extra from next page trill"). D59: a long item draws on every page
    // it CROSSES — crosses what the page OWNS, not what the page draws. The first build
    // tested it against the drawn span, so a trill starting just AFTER the cut left a
    // 0.3 s stub of its curve in the right reserve: next page's music, on this page.
    // HOW FAR it is then drawn is a separate question and unchanged — out to wInk, so a
    // sound continuing over the page turn still reaches the edge of the system.
    const crosses = OWN
      ? ((t0, t1) => t1 > OWN[0] + 1e-9 && (ownsEnd ? t0 <= OWN[1] + 1e-9 : t0 < OWN[1] - 1e-9))
      : ((t0, t1) => !(t1 < w0 || t0 > wInk));

    // [2a, LGMF 2026-09-25] a system's staff lines come from its model (a lined staff: registry part.staff); five at 1 ss otherwise
    const modelByKey = new Map(model.systems.map(sm => [sm.key !== undefined ? sm.key : sm.part, sm]));
    const linesOf = sm => (sm && sm.staffLines) || [-2, -1, 0, 1, 2];
    for (const sysModel of model.systems) {
      let sys;
      // [2a.1] a staff of a multi-staff part is its own system ('<part>:<i>')
      try { sys = view.system(sysModel.key !== undefined ? sysModel.key : sysModel.part); } catch (e) { continue; } // part not in this view
      const ssPx = sys.ssPx;
      // §401d: a staff of a multi-staff part is its own system, but the GO LINE and the GC belong to the
      // PART's whole lane — the ball (animobj) already lands on the lane edge; the composer, on seeing the
      // piano's arc on one staff: 'the arc and the go line need to span entire staff'. laneOf = the first
      // staff's top to the last staff's bottom; a single-staff part is its own lane, unchanged.
      const laneOf = (sm, sy) => {
        if (sm.key === undefined || typeof sm.part !== 'number') return sy;
        const pc = o.ensemble && o.ensemble.parts && o.ensemble.parts.find(q => q.part === sm.part);
        const nSt = (pc && pc.staves && pc.staves.length) || 1;
        if (nSt < 2) return sy;
        try {
          const a = view.system(sm.part + ':0'), b = view.system(sm.part + ':' + (nSt - 1));
          return { yTopPx: a.yTopPx, yBotPx: b.yBotPx, heightPx: b.yBotPx - a.yTopPx, ssPx: sy.ssPx };
        } catch (e) { return sy; }
      };
      const lane = laneOf(sysModel, sys);
      const hasGc = new Set((sysModel.items || []).filter(x => x.k === 'gc' && x.ev).map(x => x.ev));   // §401h
      const X = (t, dxSs) => view.xOfSeconds(t) + (dxSs || 0) * ssPx;
      const Y = ss => sys.yOfSs(ss);
      // [§495] an item placed against ANOTHER staff of the same part (the beamed
      // pair's bass stem reaching the treble beam, its pizz. on the treble row)
      const sysYOf = key => { try { const s2 = view.system(key); return ss => s2.yOfSs(ss); } catch (e) { return Y; } };
      // class carries the part so a caller can restyle ONE lane without a
      // re-render — the per-part solo dim (day 24). Presentation-neutral:
      // a class attribute adds no ink and no geometry.
      parts.push('<g class="sys sys-p' + sysModel.part + '" fill="' + o.ink + '">');
      // part label at the left edge (inside the gutter when one exists) —
      // [2a.1] the ensemble's short name (the score's tracks[].short), once
      // per part: a grand staff is labelled on its top staff only
      const pcfg = ENS && ENS.parts && ENS.parts.find(p => p.part === sysModel.part);
      // VERTICALLY (composer, 2026-09-11: "center them on the appropriate
      // staff, so centered on the middle staff line"): with the ensemble the
      // label's visual middle sits ON the staff's middle line — for a grand
      // staff on the lane's middle, between its two staves. baselineBelowEm
      // (registry partLabel) is where the baseline goes below that line, as a
      // fraction of the font size: an explicit number, so Chrome and the
      // export rasterizer agree (no dominant-baseline). Without the ensemble:
      // the tuba's top-of-lane label, unchanged.
      if (sysModel.lineLabels && sysModel.staffLines) {
        // [2a] a lined staff names its LINES in the gutter (his short names, top to bottom), centred on each line as a part label is
        const sz = E.partLabel.sizeSs * (E.partLabel.lineLabelScale || 0.85) * ssPx;
        const below = (E.partLabel.baselineBelowEm != null ? E.partLabel.baselineBelowEm : 0.32) * sz;
        sysModel.lineLabels.forEach((lab, i) => {
          if (!lab || sysModel.staffLines[i] === undefined) return;
          parts.push('<text x="' + (ML + E.partLabel.xPx) + '" y="' + (Y(sysModel.staffLines[i]) + below).toFixed(1) + '" font-size="' + sz.toFixed(1) + '"' + fontAttr + ' fill="' + o.muted + '">' + esc(lab) + '</text>');
        });
      } else if (!(sysModel.staff > 0)) {
        let ly = sys.yTopPx + E.partLabel.yOffsetSs * ssPx;
        if (ENS) {
          let lane = sys;
          try { lane = view.system(sysModel.part); } catch (e) { /* no lane entry: the staff itself */ }
          ly = lane.yMidPx + (E.partLabel.baselineBelowEm != null ? E.partLabel.baselineBelowEm : 0.32) * E.partLabel.sizeSs * ssPx;
        }
        parts.push('<text x="' + (ML + E.partLabel.xPx) + '" y="' + ly.toFixed(1) + '" font-size="' + (E.partLabel.sizeSs * ssPx).toFixed(1) +
          '"' + fontAttr + ' fill="' + o.muted + '">' + (pcfg ? esc(pcfg.short) : 'T' + (sysModel.part + 1)) + '</text>');
      }
      // page-edge rule: a chunk continuing across the cut re-shows its tempo
      // label at the page start (splice.js planPages -> page.reshow)
      for (const rs of (opts && opts.reshow) || []) {
        if (rs.part !== sysModel.part) continue;
        parts.push('<text x="' + (MX0 + E.reshow.xSs * ssPx).toFixed(1) + '" y="' + Y(4.6).toFixed(1) + '" font-size="' +
          (E.reshow.sizeSs * ssPx * E.textScale).toFixed(1) + '"' + fontAttr + ' fill="' + o.muted + '">' + esc(rs.text) + '</text>');
      }

      // DRAWING LAYERS (day 22, composer): notation ink first, the env
      // curve OVER the notation, the go line over the curve. (The animation
      // overlay is its own SVG above everything; within a layer, push order
      // holds — stable sort.)
      const LAYER = k => (k === 'envcurve' ? 1 : k === 'goline' ? 2 : 0);
      const itemsInLayers = [...sysModel.items].sort((a, b) => LAYER(a.k) - LAYER(b.k));
      for (const it of itemsInLayers) {
        // [2c.3] a cut kind's ink goes inside the page's clip — wrapped in `finally`, so every branch's `continue` is honoured
        const cutMark = (cutKind(it.k) && it.k !== 'gc') ? parts.length : -1;   // the GC wraps its arc alone (its impact is a point)
        try {
        if (it.k === 'staff') {
          // staff is FURNITURE: in a free window wider than the material
          // (opts.staffFull, notation-view window mode) the outer segments
          // extend to the view edges instead of stopping where the section
          // ends — "staff lines cut short" verdict, day 22. Interior
          // staff-off spans keep their authored extents.
          const mw = model.window || [it.t0, it.t1];
          // §401b (the composer: 'put the staff lines to the end of the page'): registry
          // engraving.render.staffFull makes every view draw the staff to the page edges
          const full = (opts && opts.staffFull) || !!E.staffFull;
          const t0 = (full && it.t0 <= mw[0] + 1e-9) ? w0 : Math.max(it.t0, w0);
          const t1 = (full && it.t1 >= mw[1] - 1e-9) ? wInk : Math.min(it.t1, wInk);
          const x0 = view.xOfSeconds(t0), x1 = view.xOfSeconds(t1);
          for (const line of linesOf(sysModel)) {
            const y = Y(line) - (stds.staff.lineThickness * ssPx) / 2;
            parts.push('<rect x="' + x0.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + (x1 - x0).toFixed(2) +
              '" height="' + (stds.staff.lineThickness * ssPx).toFixed(2) + '"/>');
          }
        } else if (it.k === 'clef') {
          // with a prefatory gutter the clef lives IN the dead space,
          // right-aligned toward the music start (A21c — it must never sit
          // over the first notes); without one it pins to the view's left
          // edge as before (staff furniture, always shown)
          // [2a.2] the system's own clef, sat on the line it names: bass on
          // F3 (+1 ss), treble on G4 (−1), alto on C4 (the middle line)
          const ck = sysModel.clef || 'bass';
          const CL = CLEF_AT[ck] || CLEF_AT.bass;
          const cStamp = ck === 'bass' ? S.clefBass() : S.clef(ck);
          if (view.gutterPx > 0) {
            // clamp at the left edge: a clef too big for the gutter pokes
            // VISIBLY into the music (protrusion-detector territory) rather
            // than vanishing off-screen — invisible failure is worse
            const cw = glyphs.clef[ck].wSs * ssPx;
            const cx = Math.max(ML + 2, MX0 - cw - E.clefGutterGapSs * ssPx);
            parts.push(Stamps.toSvg(cStamp, { xPx: cx, yPx: Y(CL.line), ssPx, align: CL.anchor }));
          } else {
            const cx = Math.max(view.xOfSeconds(it.t), ML);
            parts.push(Stamps.toSvg(cStamp, { xPx: cx + E.clefInsetSs * ssPx, yPx: Y(CL.line), ssPx, align: CL.anchor }));
          }
        } else if (it.k === 'glyph') {
          if (!owns(it.t)) continue;
          parts.push(Stamps.toSvg((it.scale || it.scaleY) ? Stamps.scaled(boxFor(it.g), it.scale || 1, it.scaleY != null ? it.scaleY : (it.scale || 1)) : boxFor(it.g), { xPx: X(it.t, it.dxSs), yPx: (it.sys ? sysYOf(it.sys) : Y)(it.ySs), ssPx, align: it.align }));
        } else if (it.k === 'rest') {
          // day 23: a rest at LP's own vertical placement — the glyph's topSs
          // is where its bbox top sits above the staff middle line, so the
          // rest lands exactly where LilyPond would put it.
          if (!owns(it.t)) continue;
          const rg = glyphs.rest['rest' + it.dur];
          // LEFT EDGE on the rest's time (day 24): a rest is placed like a note
          // of its value, and noteheads in this piece put their left edge on the
          // moment. The old half-width subtraction centred the glyph, hanging
          // half of it back into the sounding note before it.
          const rx = X(it.t, it.dxSs);
          parts.push(Stamps.toSvg(S.rest(it.dur), { xPx: rx, yPx: Y(it.ySs != null ? it.ySs : rg.topSs), ssPx, align: 'topLeft' }));
          // AUGMENTATION DOT (day 24): a dotted rest is the glyph plus a dot to
          // its right, vertically on the rest's own middle. Same diameter as the
          // staccato dot (glyphs.standards) — one dot size in the piece.
          if (it.dotted) {
            const dd = ((glyphs.standards.augmentationDot || glyphs.standards.staccatoDot).diameter) * ssPx;
            const gap = ((E.restDotGapSs != null) ? E.restDotGapSs : 0.28) * ssPx;
            parts.push('<circle cx="' + (rx + rg.wSs * ssPx + gap + dd / 2).toFixed(2) + '" cy="' +
              (Y(it.ySs != null ? it.ySs : rg.topSs) + (rg.hSs / 2) * ssPx).toFixed(2) + '" r="' + (dd / 2).toFixed(2) + '"/>');
          }
        } else if (it.k === 'stem') {
          if (!owns(it.t)) continue;
          const x = X(it.t, it.dxSs) - (stds.stem.thickness * ssPx) / 2;
          const YB = it.sysB ? sysYOf(it.sysB) : Y;   // [§495] the cross-staff stem's far end
          const yTop = Math.min(Y(it.yA), YB(it.yB)), h = Math.abs(Y(it.yA) - YB(it.yB));
          parts.push('<rect x="' + x.toFixed(2) + '" y="' + yTop.toFixed(2) + '" width="' + (stds.stem.thickness * ssPx).toFixed(2) + '" height="' + h.toFixed(2) + '"/>');
        } else if (it.k === 'dot') {
          if (!owns(it.t)) continue;
          parts.push('<circle cx="' + X(it.t, it.dxSs).toFixed(2) + '" cy="' + Y(it.ySs).toFixed(2) + '" r="' + (glyphs.standards.staccatoDot.diameter / 2 * ssPx).toFixed(2) + '"/>');
        } else if (it.k === 'ledger') {
          if (!owns(it.t)) continue;
          // day 22: honor the item's dxSs (was silently dropped — a shifted
          // head left its ledgers behind) and its own head width (the open
          // head is wider than filled)
          const w = (it.wSs || glyphs.notehead.filled.wSs) * (1 + 2 * stds.ledgerLine.lengthFraction) * ssPx;
          parts.push('<rect x="' + (X(it.t, it.dxSs) - w / 2).toFixed(2) + '" y="' + (Y(it.ySs) - stds.ledgerLine.thickness * ssPx / 2).toFixed(2) +
            '" width="' + w.toFixed(2) + '" height="' + (stds.ledgerLine.thickness * ssPx).toFixed(2) + '"/>');
        } else if (it.k === 'beam') {
          // [2c.3] cut: every tip, on each page the beam crosses — the clip ends it at the page's edge like paper
          const tips = cutKind('beam') ? it.tips : it.tips.filter(p => owns(p.t));
          if (tips.length < 2) continue;
          if (cutKind('beam') && !crosses(Math.min(...tips.map(p => p.t)), Math.max(...tips.map(p => p.t)))) continue;
          // beam thickness extends TOWARD the noteheads: down the page for
          // up-stems, up the page for down-stems (review finding: down-stem
          // beams hung beyond the tips)
          const t = stds.beam.thickness * ssPx * (it.dir === 'down' ? -1 : 1);
          const fwd = tips.map(p => X(p.t, p.dxSs).toFixed(2) + ',' + Y(p.ySs).toFixed(2));
          const back = tips.slice().reverse().map(p => X(p.t, p.dxSs).toFixed(2) + ',' + (Y(p.ySs) + t).toFixed(2));
          parts.push('<polygon points="' + fwd.concat(back).join(' ') + '"/>');
        } else if (it.k === 'text') {
          if (!owns(it.t)) continue;
          // [2j.2, §540] yAt 'top': the text's TOP on the system's top edge — where a surge curve's cut edge peaks (the envcurve
          // is drawn to sys.yTopPx) — through the hanging baseline; "sempre secco" is the one user so far
          const yTxt = it.yAt === 'top' ? sys.yTopPx : Y(it.ySs);
          parts.push('<text x="' + X(it.t, it.dxSs).toFixed(1) + '" y="' + yTxt.toFixed(1) + '" font-size="' + ((it.size || 1) * ssPx * E.textScale).toFixed(1) +
            '"' + fontAttr + (it.anchor && it.anchor !== 'start' ? ' text-anchor="' + it.anchor + '"' : '') + (it.italic ? ' font-style="italic"' : '') + (it.yAt === 'top' ? ' dominant-baseline="hanging"' : '') + ' xml:space="preserve" fill="' + (it.color || o.muted) + '">' + esc(it.text) + '</text>');
        } else if (it.k === 'attackline') {
          if (!owns(it.t)) continue;
          // M4: a vertical stroke straddling the pitch position
          parts.push('<rect x="' + (X(it.t, 0) - E.attackLine.wSs / 2 * ssPx).toFixed(2) + '" y="' + (Y(it.ySs + E.attackLine.offsetSs)).toFixed(2) +
            '" width="' + (E.attackLine.wSs * ssPx).toFixed(2) + '" height="' + (E.attackLine.hSs * ssPx).toFixed(2) + '"/>');
        } else if (it.k === 'tick') {
          if (!owns(it.t)) continue;
          parts.push('<rect x="' + (X(it.t, 0) - E.tick.wSs / 2 * ssPx).toFixed(2) + '" y="' + (Y(it.ySs) - E.tick.hSs * ssPx).toFixed(2) +
            '" width="' + (E.tick.wSs * ssPx).toFixed(2) + '" height="' + (E.tick.hSs * ssPx).toFixed(2) + '"/>');
        } else if (it.k === 'envcurve') {
          // the drawn level curve over the FULL lane band (piece #1: value
          // 0..1 maps bottom -> top of the track), clipped to the window
          if (!crosses(it.t0, it.t1)) continue;
          const EC = E.envCurve;
          // [2f.4] band 'lane': a multi-staff part's curve spans its whole lane (the piano's trills), as its go line does
          const yT = it.band === 'lane' ? lane.yTopPx : sys.yTopPx, yB = it.band === 'lane' ? lane.yBotPx : sys.yBotPx;
          // cut (surge): the RISE, truncated at its peak sample, is mapped
          // over the FULL note span so it meets the note end at full height —
          // a SHARP top-right corner, then the 90° vertical back edge (the
          // fill closure). Round 2 verdict: the first build held a 2% shelf
          // at the peak ("why it isn't a sharp right top corner"); the shelf
          // was the drawn cut-ramp's honest x — legibility wins, the <=2%
          // time stretch of the rise is accepted. Sounding data untouched.
          // day 40: the truncation moved to layout.drawnLevelSamples — the
          // samples arrive FINAL (one source for the page and the meters);
          // the stretch over the full note span is implicit in n-over-[t0,t1].
          const samples = it.samples;
          const n = samples.length;
          const pts = [];
          const whole = cutKind('envcurve');   // [2c.3] cut like paper: every sample, the clip trims it at the page's edges
          for (let i = 0; i < n; i++) {
            const t = it.t0 + (it.t1 - it.t0) * (i / (n - 1));
            if (!whole && (t < w0 - 1e-9 || t > wInk + 1e-9)) continue;
            pts.push([view.xOfSeconds(t), yB - samples[i] * (yB - yT)]);
          }
          if (pts.length >= 2) {
            const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
            if (EC.pathOpacity != null) {   // [D42] the two-piano look: one closed path, stroked round, opacity on the whole
              parts.push(curvePathD42(EC, line + ' L' + pts[pts.length - 1][0].toFixed(1) + ',' + yB.toFixed(1) + ' L' + pts[0][0].toFixed(1) + ',' + yB.toFixed(1) + ' Z'));
            } else if (EC.fillOpacity > 0) {
              parts.push('<path d="' + line + ' L' + pts[pts.length - 1][0].toFixed(1) + ',' + yB.toFixed(1) +
                ' L' + pts[0][0].toFixed(1) + ',' + yB.toFixed(1) + ' Z" fill="' + EC.color +
                '" fill-opacity="' + EC.fillOpacity + '" stroke="none"/>');
            }
            if (EC.pathOpacity == null && EC.strokeWPx > 0 && EC.strokeOpacity > 0) {
              parts.push('<path d="' + line + '" fill="none" stroke="' + EC.color + '" stroke-width="' + EC.strokeWPx +
                '" stroke-opacity="' + EC.strokeOpacity + '"/>');
            }
          }
        } else if (it.k === 'barline') {
          // THE TRANCE BAR LINE (day 35, composer): one at every new tempo,
          // sitting a MEDIUM space left of the bar's leftmost ink so it never
          // crowds the downbeat. Full staff height, stem thickness.
          if (!owns(it.t)) continue;
          const BL = E.barLine;
          const x = X(it.t, it.dxSs) - (BL.thickSs * ssPx) / 2;
          parts.push('<rect x="' + x.toFixed(2) + '" y="' + Y(2).toFixed(2) +
            '" width="' + (BL.thickSs * ssPx).toFixed(2) +
            '" height="' + (Math.abs(Y(-2) - Y(2))).toFixed(2) + '"/>');
        } else if (it.k === 'tempotext') {
          // the tempo, stated once at the top of the system, one decimal place.
          // The quarter note is DRAWN (small notehead + stem) rather than typed —
          // Crimson has no musical glyph, and everything else on this page comes
          // from the glyph set, so a typed character would be the odd one out.
          if (!owns(it.t)) continue;
          const BL = E.barLine;
          const tx = X(it.t, it.dxSs), ty = Y(BL.tempoYSs);
          const ns = ssPx * BL.tempoHeadScale;
          const nhq = glyphs.notehead.filled;
          parts.push(Stamps.toSvg(Stamps.scaled(S.notehead(), BL.tempoHeadScale, BL.tempoHeadScale),
            { xPx: tx, yPx: ty, ssPx, align: 'center' }));
          const stemX = tx + (nhq.anchors.stemAttachUp.x - nhq.anchors.center.x) * ns;
          parts.push('<rect x="' + (stemX - (BL.thickSs * ssPx) / 2).toFixed(2) + '" y="' + (ty - BL.tempoStemSs * ssPx).toFixed(2) +
            '" width="' + (BL.thickSs * ssPx).toFixed(2) + '" height="' + (BL.tempoStemSs * ssPx).toFixed(2) + '"/>');
          parts.push('<text x="' + (tx + BL.tempoGapSs * ssPx).toFixed(2) + '" y="' + ty.toFixed(2) +
            '" font-size="' + (BL.tempoSizeSs * ssPx).toFixed(2) + '" font-family="' + E.fontFamily +
            // ONE DECIMAL WHERE FRACTIONAL (day 36): the per-part map holds
            // both kinds — 150, 80, 120 are whole, 93.8 and 45.8 are not — and
            // "150.0" states a precision the number does not have.
            '" font-style="italic">= ' + esc(Math.abs(it.bpm - Math.round(it.bpm)) < 0.05
              ? String(Math.round(it.bpm)) : it.bpm.toFixed(1)) + '</text>');
        } else if (it.k === 'glissline') {
          // the gliss line between the section's two pitches (day 35): a plain
          // rule at stem thickness, its length the diameter of TWO regular
          // half-note heads, a standard spacer clear of each head
          if (!owns(it.t)) continue;
          const gy = Y(it.ySs), gt = it.thickSs * ssPx;
          if (it.y1Ss != null && it.y1Ss !== it.ySs) {
            // [PLAN 2h.2] D45: the start and the destination on different lines — the rule slants
            // from head to head, the same vertical thickness as the level one
            const xa = X(it.t, it.dx0Ss), xb = X(it.t, it.dx1Ss), gy1 = Y(it.y1Ss);
            parts.push('<polygon points="' + [[xa, gy - gt / 2], [xb, gy1 - gt / 2], [xb, gy1 + gt / 2], [xa, gy + gt / 2]]
              .map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ') + '"/>');
          } else
          parts.push('<rect x="' + X(it.t, it.dx0Ss).toFixed(2) + '" y="' + (gy - gt / 2).toFixed(2) +
            '" width="' + ((it.dx1Ss - it.dx0Ss) * ssPx).toFixed(2) + '" height="' + gt.toFixed(2) + '"/>');
        } else if (it.k === 'niente') {
          // the NIENTE CIRCLE (day 35). No LilyPond glyph exists for it — in
          // LilyPond the circled tip is DRAWN — so it is drawn here: an open
          // circle the diameter of the `m` in mf (measured 0.4695 ss), stroked
          // at the arrow's own thickness, sitting on the dynamic row.
          if (!owns(it.t)) continue;
          // centred ON the arrow's axis, so the two read as one gesture
          // (the composer's reference image: circle then hairpin, one line)
          const r = it.diaSs * ssPx / 2;
          parts.push('<circle cx="' + X(it.t, it.dxSs).toFixed(2) + '" cy="' + Y(it.ySs).toFixed(2) +
            '" r="' + r.toFixed(2) + '" fill="none" stroke="' + o.ink +
            '" stroke-width="' + (it.thickSs * ssPx).toFixed(2) + '"/>');
        } else if (it.k === 'cresccurve') {
          // THE CRESCENDO (day 35, composer): the glissando's twin — one
          // interpolated curve for the whole section, limeGreen, taking the
          // BOTTOM HALF of the lane. Filled, no border, like its twin.
          // `full` (day 36, composer: "the curve only reaches half track
          // height, can you make the curve full track height"): the half-lane
          // above exists because on a MORPH page the glissando owns the top
          // half. The trance section has no glissando, so its final crescendo
          // takes the whole lane. Opt-in per overlay — morph pages unchanged.
          if (!crosses(it.t0, it.t1)) continue;
          const CC = E.crescCurve;
          const yB = sys.yBotPx;
          const yCeil = it.full ? sys.yTopPx : (sys.yTopPx + sys.yBotPx) / 2;
          const n2 = it.samples.length, cp = [];
          const whole = cutKind('cresccurve');   // [2c.3]
          for (let i = 0; i < n2; i++) {
            const t = it.t0 + (it.t1 - it.t0) * (i / (n2 - 1));
            if (!whole && (t < w0 - 1e-9 || t > wInk + 1e-9)) continue;
            cp.push([view.xOfSeconds(t), yB - it.samples[i] * (yB - yCeil)]);
          }
          if (cp.length >= 2) {
            const cline = cp.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
            if (CC.pathOpacity != null) {   // [D42]
              parts.push(curvePathD42(CC, cline + ' L' + cp[cp.length - 1][0].toFixed(1) + ',' + yB.toFixed(1) + ' L' + cp[0][0].toFixed(1) + ',' + yB.toFixed(1) + ' Z'));
            } else if (CC.fillOpacity > 0) {
              parts.push('<path d="' + cline + ' L' + cp[cp.length - 1][0].toFixed(1) + ',' + yB.toFixed(1) +
                ' L' + cp[0][0].toFixed(1) + ',' + yB.toFixed(1) + ' Z" fill="' + CC.color +
                '" fill-opacity="' + CC.fillOpacity + '" stroke="none"/>');
            }
            if (CC.pathOpacity == null && CC.strokeWPx > 0 && CC.strokeOpacity > 0) {
              parts.push('<path d="' + cline + '" fill="none" stroke="' + CC.color +
                '" stroke-width="' + CC.strokeWPx + '" stroke-opacity="' + CC.strokeOpacity + '"/>');
            }
          }
        } else if (it.k === 'glisscurve') {
          // THE MORPH GLISSANDO (day 35, composer): one smooth interpolated
          // line for the whole section, brightOrange, taking PRECISELY the TOP
          // HALF of the lane. The bottom half belongs to the crescendo.
          if (!crosses(it.t0, it.t1)) continue;
          const GC2 = E.glissCurve;
          const yT = sys.yTopPx, yMid = (sys.yTopPx + sys.yBotPx) / 2;
          const n = it.samples.length, gp = [];
          const whole = cutKind('glisscurve');   // [2c.3]
          for (let i = 0; i < n; i++) {
            const t = it.t0 + (it.t1 - it.t0) * (i / (n - 1));
            if (!whole && (t < w0 - 1e-9 || t > wInk + 1e-9)) continue;
            gp.push([view.xOfSeconds(t), yMid - it.samples[i] * (yMid - yT)]);
          }
          if (gp.length >= 2) {
            const line = gp.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
            // the fill closes on the HALF-LANE baseline, not the lane floor —
            // the glissando owns the top half only
            if (GC2.pathOpacity != null) {   // [D42]
              parts.push(curvePathD42(GC2, line + ' L' + gp[gp.length - 1][0].toFixed(1) + ',' + yMid.toFixed(1) + ' L' + gp[0][0].toFixed(1) + ',' + yMid.toFixed(1) + ' Z'));
            } else if (GC2.fillOpacity > 0) {
              parts.push('<path d="' + line +
                ' L' + gp[gp.length - 1][0].toFixed(1) + ',' + yMid.toFixed(1) +
                ' L' + gp[0][0].toFixed(1) + ',' + yMid.toFixed(1) + ' Z" fill="' + GC2.color +
                '" fill-opacity="' + GC2.fillOpacity + '" stroke="none"/>');
            }
            // no border on top: fill-only unless a stroke is explicitly asked for
            // (composer, day 35 — the same verdict the env curve got on day 22)
            if (GC2.pathOpacity == null && GC2.strokeWPx > 0 && GC2.strokeOpacity > 0) {
              parts.push('<path d="' + line +
                '" fill="none" stroke="' + GC2.color + '" stroke-width="' + GC2.strokeWPx +
                '" stroke-opacity="' + GC2.strokeOpacity + '" stroke-linecap="round"/>');
            }
          }
        } else if (it.k === 'dynarrow') {
          // the surge's hairpin replacement: a short rightward arrow between
          // the two marks — line + solid triangular head, stem-thickness
          if (!owns(it.t)) continue;
          const x0 = X(it.t, it.dx0Ss), x1 = X(it.t, it.dx1Ss);
          const yA = Y(it.ySs);
          const headL = (it.headSs || 0.45) * ssPx, thick = (it.thickSs || 0.13) * ssPx;
          parts.push('<line x1="' + x0.toFixed(2) + '" y1="' + yA.toFixed(2) + '" x2="' + (x1 - headL).toFixed(2) +
            '" y2="' + yA.toFixed(2) + '" stroke="#111" stroke-width="' + thick.toFixed(2) + '"/>');
          parts.push('<path d="M' + x1.toFixed(2) + ',' + yA.toFixed(2) +
            ' L' + (x1 - headL).toFixed(2) + ',' + (yA - headL * 0.45).toFixed(2) +
            ' L' + (x1 - headL).toFixed(2) + ',' + (yA + headL * 0.45).toFixed(2) + ' Z"/>');
        } else if (it.k === 'tuplet') {
          // THE TUPLET BRACKET (day 23) — the composer's LilyPond standard,
          // measured: a FLAT bracket (their own flatten-tuplet-bracket), hooks
          // descending toward the notes, the horizontal in TWO segments with a
          // gap for the numeral, which straddles the line. Geometry:
          // engraving.layout.tuplet.
          if (cutKind('tuplet') && !crosses(it.t0, it.t1)) continue;   // [2c.3] a bracket off this page is not drawn at all (it had no gate)
          const TP = E.tuplet || {};
          const th = (TP.thicknessSs || 0.16) * ssPx, hook = (TP.hookLengthSs || 0.7) * ssPx;
          const yL = Y(it.ySs);
          // day 29 (composer): adjacent groups' brackets abutted edge to edge
          // and read as one line — each end pulls in by hGapSs so neighbours
          // show daylight. Registry: engraving.layout.tuplet.hGapSs.
          const hIn = (TP.hGapSs != null ? TP.hGapSs : 0.35) * ssPx;
          // dx1Ss: layout anchored the right end to the bracket's own trailing
          // rest glyph (day 29) — use it instead of the symmetric inset
          const x0 = view.xOfSeconds(it.t0) + hIn;
          const x1 = it.dx1Ss != null ? view.xOfSeconds(it.t1) + it.dx1Ss * ssPx : view.xOfSeconds(it.t1) - hIn;
          const size = (TP.numeralSizeSs || 1.2348) * ssPx;
          const gap = (it.text || '3:2').length * (TP.numeralGapPerCharSs || 0.88) * ssPx;
          const gMid = (x0 + x1) / 2, gA = gMid - gap / 2, gB = gMid + gap / 2;
          const dir = it.dir === 'down' ? -1 : 1;      // hooks point toward the notes
          const seg = (a, b) => '<rect x="' + Math.min(a, b).toFixed(2) + '" y="' + (yL - th / 2).toFixed(2) +
            '" width="' + Math.abs(b - a).toFixed(2) + '" height="' + th.toFixed(2) + '"/>';
          const vert = x => '<rect x="' + (x - th / 2).toFixed(2) + '" y="' + (dir > 0 ? yL : yL - hook).toFixed(2) +
            '" width="' + th.toFixed(2) + '" height="' + hook.toFixed(2) + '"/>';
          parts.push(seg(x0, gA), seg(gB, x1), vert(x0), vert(x1));
          const baseY = yL + (TP.numeralBaselineBelowSs || 0.41) * ssPx;
          parts.push('<text x="' + gMid.toFixed(1) + '" y="' + baseY.toFixed(1) + '" font-size="' + size.toFixed(1) +
            '" text-anchor="middle" font-style="italic"' + fontAttr + ' fill="' + o.ink + '">' + esc(it.text || '3:2') + '</text>');
        } else if (it.k === 'ottava') {
          // piece #2 session-57 bracket over the NOTEHEAD ONLY (round 2):
          // label · dashes RIGHT-ALIGNED stepping back from the hook (p2's
          // emitDashes — the connecting dash meets the hook, forming the L),
          // hook at the head's right edge. Geometry: glyphs.standards.ottava.
          if (!owns(it.t)) continue;
          const O = stds.ottava || {};
          const lg = glyphs.ottavaText && glyphs.ottavaText[it.label];
          const yLine = Y(it.ySs);
          let xLabel = X(it.t, it.dx0Ss || 0);
          const xHook = X(it.t, it.dx1Ss || 0);
          // a too-narrow unit widens the bracket leftward to its minimum span
          const minSpan = (O.minBracketSpanSs || 1.37) * ssPx;
          const lgW = lg ? (lg.wSs + (O.textGapBeforeLineSs || 0.1)) * ssPx : 0;
          if (xHook - (xLabel + lgW) < minSpan) xLabel = xHook - minSpan - lgW;
          let xDashStart = xLabel;
          if (lg) {
            // text baseline straddles the line (lineAttachAboveBaselineSs)
            const ty = yLine + (O.lineAttachAboveBaselineSs || 0.32) * ssPx - lg.hSs * ssPx;
            parts.push('<g transform="translate(' + xLabel.toFixed(2) + ',' + ty.toFixed(2) + ') scale(' + ssPx + ')">' +
              '<path d="' + lg.path + '"/></g>');
            xDashStart = xLabel + lgW;
          }
          const thick = (O.lineThicknessSs || 0.067) * ssPx;
          const dashLen = (O.dashLengthSs || 0.3) * ssPx, dashGap = (O.gapBetweenDashesSs || 0.7) * ssPx;
          let xEnd = xHook;
          while (xEnd - dashLen >= xDashStart - 1e-6) {
            parts.push('<line x1="' + (xEnd - dashLen).toFixed(2) + '" y1="' + yLine.toFixed(2) + '" x2="' + xEnd.toFixed(2) +
              '" y2="' + yLine.toFixed(2) + '" stroke="#111" stroke-width="' + thick.toFixed(2) + '"/>');
            xEnd -= dashLen + dashGap;
          }
          // hook extends from the line BACK TOWARD the staff
          const hook = (O.hookLengthSs || 0.8) * ssPx * (it.dir === 'above' ? 1 : -1);
          parts.push('<line x1="' + xHook.toFixed(2) + '" y1="' + yLine.toFixed(2) + '" x2="' + xHook.toFixed(2) +
            '" y2="' + (yLine + hook).toFixed(2) + '" stroke="#111" stroke-width="' + thick.toFixed(2) + '"/>');
        } else if (it.k === 'lvslur') {
          // [2h.5] the let-ring slur (§486): piece #2's baked l.v. crescent —
          // a filled outline with LilyPond's 0.1 ss stroke. The attachment
          // line sits at ySs; the crescent rises away from the head ('above')
          // or is mirrored about that line ('below').
          if (!owns(it.t)) continue;
          const LV = glyphs.letRing;
          if (!LV) continue;
          const ax = X(it.t, it.dxSs), ay = Y(it.ySs), ky = it.dir === 'below' ? -1 : 1;
          parts.push('<g transform="translate(' + ax.toFixed(2) + ',' + (ay - ky * LV.anchors.leftAttach.y * ssPx).toFixed(2) +
            ') scale(' + ssPx + ',' + (ky * ssPx) + ')"><path d="' + LV.path + '" fill="#111" stroke="#111" stroke-width="' + LV.strokeSs +
            '" stroke-linejoin="round"/></g>');
        } else if (it.k === 'goline') {
          // dotted vertical at go time, full lane band (piece #1's go-time
          // marker: 0.5 @ 0.4, dasharray 2,2)
          if (!owns(it.t)) continue;
          const GL = E.goLine;
          const gx = view.xOfSeconds(it.t).toFixed(2);
          // §401h: the top at the GC arc's top when this note carries a GC and the registry says so; a
          // multi-staff part's bottom trimmed by multiStaffBottomTrimPx (at the 1080 frame, scaled)
          let gy1 = lane.yTopPx, gy2 = lane.yBotPx;
          if (GL.topAtGcArc && (hasGc.has(it.ev) || it.topAsGc)) {   // [2f.4] topAsGc: a trill's go line, the strikes' length
            const Gg = GC.laneGeom(GC.systemOf(view, sysModel.part), view, E.gc && E.gc.look);
            gy1 = Math.max(gy1, Gg.impactY - Gg.h);
          }
          // §401i (the composer: 'make it the same amount below bottom staff as currently above top staff'):
          // on a multi-staff part the go line ends below the LAST staff's bottom line by exactly the distance
          // its top sits above the FIRST staff's top line — a mirror, not a pixel count
          if (lane !== sys && GL.multiStaffBottomMirrorsTop) {
            try {
              const pc = o.ensemble.parts.find(q => q.part === sysModel.part);
              const a = view.system(sysModel.part + ':0'), b = view.system(sysModel.part + ':' + (pc.staves.length - 1));
              gy2 = b.yOfSs(-2) + (a.yOfSs(2) - gy1);
            } catch (e) { /* no ensemble or staves: the lane bottom stands */ }
          }
          parts.push('<line x1="' + gx + '" y1="' + gy1.toFixed(1) + '" x2="' + gx + '" y2="' + gy2.toFixed(1) +
            '" stroke="' + GL.color + '" stroke-width="' + GL.wPx + '" stroke-opacity="' + GL.opacity +
            '" stroke-dasharray="' + GL.dash + '"/>');
        } else if (it.k === 'gc') {
          // THE GC OBJECT's static ink (day 23, piece #1's renderGC verbatim):
          // the trajectory polyline across TIME, stroke = the GC color at
          // 1.5 px, no fill; the impact marker r 4 px on the go line, 5 px
          // above the lane bottom. Sizes at the 1080 frame × magnification.
          // Clipped to the page like the ring bar (an arc may cross a cut).
          const P = GC.params(Object.assign({}, (E.gc && E.gc.preset) || {}, it.preset || {}));
          // [2b.7.1] the arc follows ITS STRIKE: owned = drawn whole, unowned =
          // not drawn at all. That is what kills the ghost arc over the clef —
          // the note gated on inWin and the arc on range intersection, so a
          // strike just BEFORE the window left its arc behind. With no owned
          // span the old range test stands: the film's approach is deliberate.
          if (OWN) { if (!owns(it.t)) continue; }
          else if (it.t + P.post < w0 || it.t - P.pre > w1) continue;
          // §401e: the GC's own system (the first staff of a multi-staff part) — a single lane's height, the
          // impact between the piano's staves; the go line above keeps the whole lane
          const G = GC.laneGeom(GC.systemOf(view, sysModel.part), view, E.gc && E.gc.look);
          const color = (E.gc && E.gc.color) || G.look.color;
          const d = GC.trajectory(P).map((p, i) =>
            (i ? 'L' : 'M') + view.xOfSeconds(it.t + p.dt).toFixed(2) + ' ' + (G.impactY - p.frac * G.h).toFixed(2)).join(' ');
          const arc = '<path class="gc-arc" d="' + d + '" stroke="' + color + '" stroke-width="' + (G.look.arcStrokePx * G.k).toFixed(2) + '" fill="none"/>';
          parts.push(cutKind('gc') ? clipOpen + arc + '</g>' : arc);   // [2c.3] the arc cut like paper; the impact below is a point
          if (OWN || (boundaryBefore('gc') ? ownsBefore(it.t) : inWin(it.t))) parts.push('<circle class="gc-impact" cx="' + view.xOfSeconds(it.t).toFixed(2) + '" cy="' + G.impactY.toFixed(2) +
            '" r="' + (G.look.impactRadiusPx * G.k).toFixed(2) + '" fill="' + color + '"/>');
        } else if (it.k === 'ringbar') {
          // the sounding-length bar: left edge flush with the go line,
          // right edge at onset + sounding length, centered on the written
          // head; clipped to the page like a brick
          if (!crosses(it.t0, it.t1)) continue;
          const RB = E.ringBar;
          // dx0Ss (day 24): the bar begins after the nh-unit's ink, not at the
          // go line — layout computes it from the unit's own right edge.
          const x0 = X(Math.max(it.t0, w0), it.t0 >= w0 ? it.dx0Ss : 0), x1 = view.xOfSeconds(Math.min(it.t1, wInk));
          const h = RB.hSs * ssPx;
          parts.push('<rect x="' + x0.toFixed(2) + '" y="' + (Y(it.ySs) - h / 2).toFixed(2) + '" width="' + Math.max(1, x1 - x0).toFixed(2) +
            '" height="' + h.toFixed(2) + '" fill="' + RB.color + '" opacity="' + RB.opacity + '"/>');
        } else if (it.k === 'brick') {
          if (o.hideBricks) continue;   // day 22: the bricks toggle
          if (!crosses(it.t0, it.t1)) continue;
          const x0 = view.xOfSeconds(Math.max(it.t0, w0)), x1 = view.xOfSeconds(Math.min(it.t1, wInk));
          // native tooltip (day 22): hover a brick to see what it is; the
          // brick must opt back into pointer events — the sheet SVG is
          // otherwise passive and the anim overlay above is pointer-inert.
          const tip = it.tip ? '<title>' + esc(it.tip) + '</title>' : '';
          parts.push('<rect x="' + x0.toFixed(2) + '" y="' + (Y(it.ySs) - 0.5 * ssPx).toFixed(2) + '" width="' + Math.max(1, x1 - x0).toFixed(2) +
            '" height="' + (1 * ssPx).toFixed(2) + '" fill="' + o.brick + '" opacity="' + E.brickOpacity + '"' +
            (tip ? ' pointer-events="all">' + tip + '</rect>' : '/>'));
        }
        } finally {
          if (cutMark >= 0 && parts.length > cutMark) { parts.splice(cutMark, 0, clipOpen); parts.push('</g>'); }
        }
      }
      parts.push('</g>');
    }

    // [2a.1] THE SYSTEM-START GROUPS (D10: winds bracket · piano brace ·
    // strings bracket), in the gutter left of the clefs. LilyPond's own
    // glyphs: a bracket is a thick line from the first staff's top line to
    // the last staff's bottom line, a brackettip at each end; the brace is
    // the emmentaler-brace glyph nearest the span, scaled the last few
    // percent to fit it exactly. Geometry: engraving.render.systemStart.
    if (ENS && ENS.groups && view.gutterPx > 0) {
      const SS = Object.assign({ bracketThickSs: 0.45, gapSs: 0.5, braceGapSs: 0.3 }, E.systemStart || {});
      const keysOf = p => {
        const pc = ENS.parts.find(q => q.part === p);
        const n = (pc && pc.staves && pc.staves.length) || 1;
        return n > 1 ? [p + ':0', p + ':' + (n - 1)] : [p, p];
      };
      // the clef column: its left edge is the widest clef's, so every group
      // sits clear of every clef whatever the parts
      const clefW = Math.max(...Object.keys(CLEF_AT).map(k => (glyphs.clef[k] || { wSs: 0 }).wSs));
      for (const g of ENS.groups) {
        let top, bot;
        try { top = view.system(keysOf(g.parts[0])[0]); bot = view.system(keysOf(g.parts[g.parts.length - 1])[1]); }
        catch (e) { continue; }   // a group whose parts are not all in this view
        const ss = top.ssPx;
        const kT = keysOf(g.parts[0])[0], kB = keysOf(g.parts[g.parts.length - 1])[1];
        const yT = top.yOfSs(Math.max(...linesOf(modelByKey.get(kT)))), yB = bot.yOfSs(Math.min(...linesOf(modelByKey.get(kB))));   // [2a] a lined staff's outer lines
        const clefLeft = MX0 - (clefW + E.clefGutterGapSs) * ss;
        const tipW = ((glyphs.bracketTip && glyphs.bracketTip.up) || { wSs: 0 }).wSs;
        const xL = clefLeft - (SS.gapSs + tipW) * ss;       // the bracket line's left edge
        const cls = ' class="sysgrp sysgrp-' + g.kind + '"';
        if (g.kind === 'bracket') {
          const th = SS.bracketThickSs * ss;
          parts.push('<g' + cls + ' fill="' + o.ink + '">');
          parts.push('<rect x="' + xL.toFixed(2) + '" y="' + yT.toFixed(2) + '" width="' + th.toFixed(2) + '" height="' + (yB - yT).toFixed(2) + '"/>');
          if (glyphs.bracketTip) {
            parts.push(Stamps.toSvg(S.bracketTip('up'), { xPx: xL, yPx: yT, ssPx: ss, align: 'origin' }));
            parts.push(Stamps.toSvg(S.bracketTip('down'), { xPx: xL, yPx: yB, ssPx: ss, align: 'origin' }));
          }
          parts.push('</g>');
        } else if (g.kind === 'brace' && glyphs.brace) {
          const spanSs = (yB - yT) / ss;
          const keys = Object.keys(glyphs.brace).filter(k => k[0] !== '_');
          const key = keys.reduce((a, b) => Math.abs(glyphs.brace[b].hSs - spanSs) < Math.abs(glyphs.brace[a].hSs - spanSs) ? b : a);
          const bg = glyphs.brace[key], k = spanSs / bg.hSs;
          // right edge a small gap left of the clef column, like the
          // bracket's tips
          const xR = clefLeft - SS.braceGapSs * ss;
          parts.push('<g' + cls + ' fill="' + o.ink + '">' +
            Stamps.toSvg(Stamps.scaled(S.brace(key), k, k), { xPx: xR - bg.wSs * k * ss, yPx: yT, ssPx: ss, align: 'topLeft' }) + '</g>');
        }
      }
    }

    // read-through marker labels along the top (S1, not IR — passed in opts)
    for (const mk of ((model && model.hideMarkers) ? [] : ((opts && opts.markers) || []))) {
      if (!owns(mk.time)) continue;
      parts.push('<text x="' + view.xOfSeconds(mk.time).toFixed(1) + '" y="12" font-size="10" font-family="sans-serif" fill="' + o.muted + '">' + esc(mk.label) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('\n');
  }

  // [PLAN 2b.7.5] THE CENSUS, stated where the gates are. A POINT kind is drawn
  // once, on the page that owns its `t`; a LONG kind is drawn on every page it
  // crosses and clipped to the drawn span; FURNITURE is neither (it belongs to
  // the page, not to the music). check_print_edges reads these rather than
  // keeping a second list that could quietly disagree with the loop above.
  const POINT_KINDS = ['glyph', 'rest', 'stem', 'dot', 'ledger', 'beam', 'text', 'attackline', 'tick',
    'barline', 'tempotext', 'glissline', 'niente', 'dynarrow', 'ottava', 'lvslur', 'goline', 'gc'];
  const LONG_KINDS = ['envcurve', 'cresccurve', 'glisscurve', 'ringbar', 'brick'];
  const FURNITURE_KINDS = ['staff', 'clef'];
  // 'tuplet' is neither: it has no window gate at all, because a tuplet bracket
  // belongs to a beam group and the splicer is stamp-atomic — no cut severs a
  // beam (measured 0 of 63 on this score), so a bracket never crosses a cut.

  return { renderSection, POINT_KINDS, LONG_KINDS, FURNITURE_KINDS };
});
