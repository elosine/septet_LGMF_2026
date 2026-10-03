// static_page.js — ONE definition of "the notation page with no animated layer".
//
// Why this exists (day 37): the video exporter and the print exporter must draw
// the same page. They had drifted before they even shipped — export_video.js
// carried `staticSvg()` as a private function, so the print score would have
// been a SECOND hand-copy of the same six decisions (D4 bricks off, D4 META
// off, the terminal barline, the engraving registry). The precedent is
// `notation/lib/morph_overlays.js`, shared by notate_morph and notate_section
// for exactly this reason: two tools that must agree share the code that makes
// them agree, rather than agreeing by inspection.
//
// The page is resolution-independent by construction: `model` is in staff-space
// units and `view` maps it to a canvas, so the SAME model draws a 1920x1080
// video frame and a 1224x792 pt tabloid page with no branch in here.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./render.js'));
  } else {
    root.NotationStaticPage = factory(root.NotationRender);
  }
})(typeof self !== 'undefined' ? self : this, function (Render) {

  // The static notation page: everything the composer approved, minus the
  // cursor/meters/ball. Returns an SVG string.
  //
  //   model    layout model from Layout.layoutSection
  //   view     Coords.makeView(cfg) — carries widthPx/heightPx/window/systems
  //   glyphs   glyphs.json
  //   C        container.json (registry)
  //   srcEnd   ir.source.window[1] — where the terminal barline goes
  //   reshow   page.reshow (tempo-label continuations)
  //   ownsEnd  true if this page carries the end of the piece
  //   markers  optional read-through labels; omit for the video (D4: META off)
  //   append   optional SVG injected just before </svg> (print furniture)
  //   edgeBar  default TRUE = the video's behaviour: when the piece's end is not
  //            in this window, the terminal bar still draws at the RIGHT EDGE,
  //            because in the film that edge IS the end of the visible system.
  //            PRINT passes false (day 37, composer: "there is what looks like a
  //            bar line at the right of every page, can we get rid of it?") — on
  //            paper a page edge is not a musical event, and a bar there reads
  //            as a real double bar. With it false the bar draws ONLY where the
  //            piece actually ends.
  function staticPageSvg(o) {
    const C = o.C || {};
    const view = o.view;
    const opts = {
      reshow: o.reshow, ownsEnd: o.ownsEnd,
      engraving: (C.engraving && C.engraving.render) || {},
      hideBricks: true,          // D4: bricks off
    };
    // render.js reads `(opts && opts.markers) || []`, so an absent key and an
    // undefined one are the same thing — the video path stays byte-identical.
    if (o.markers) opts.markers = o.markers;
    // [septet 2i.10.1] the ensemble registry (labels, brackets, the grand staff brace) — absent = the tuba page, byte-identical
    if (o.ensemble) opts.ensemble = o.ensemble;
    // [PLAN 2b.7.1] the page's OWNED span [cut, next cut) and the right end of
    // its drawn ink. Absent on the video path — an absent key and an undefined
    // one are the same to render.js, so the film stays byte-identical.
    if (o.owned) opts.owned = o.owned;
    if (o.inkEnd != null) opts.inkEnd = o.inkEnd;
    // [2c.2] a tiled SCREEN page's edge rules (page_rules.edge + whether it is the first page) — absent on every other path
    if (o.screenEdges) opts.screenEdges = o.screenEdges;
    if (o.edgeReport) opts.edgeReport = o.edgeReport;
    if (o.printEdges) opts.printEdges = o.printEdges;   // [2c.6] a print page of the objects plan   // [2c.4] the clamp's report sink (tools/check_screen_edges.js)
    const svg = Render.renderSection(o.model, view, o.glyphs, opts);

    // the system TERMINAL barline, exactly as notation.html appends it
    const eb = ((C.engraving && C.engraving.render) || {}).systemEndBar;
    const edgeBar = o.edgeBar !== false;
    let endBar = '';
    const endInWindow = o.srcEnd > view.window[0] && o.srcEnd <= view.window[1];
    // [2b-P step 5, §772 — his eye on the print: "let's do a final bar line … the double line … the proper thick and thin line
    // measurements … solid black, 100% opaque … over the staff lines"] THE PRINT'S FINAL BARLINE — LilyPond's "|." (his 2.24.4:
    // bar-line.scm · define-grobs.scm BarLine hair-thickness 1.9 · kern 3.0 · thick-thickness 6.0, × line-thickness = 0.1 ss at the
    // 20 pt staff, paper.scm) → thin 0.19 · gap 0.30 · thick 0.60 ss, the thick bar's right edge ON the end; from the CENTRE of the
    // top staff's top line to the centre of the bottom staff's bottom line (ly:bar-line::calc-bar-extent), one bar through the
    // system; ink, opaque, appended LAST so it lies over the staff lines. The numbers: rules.json objects.finalBarLine, read through
    // container engraving.render.systemEndBar.final. Only when the caller asks (`finalBar` — export_print): the screen and the film
    // keep their edge bar byte for byte.
    const fb = eb && eb.final;
    if (o.finalBar && fb && view.systems.length && endInWindow) {
      const sysTop = view.systems[0], sysBot = view.systems[view.systems.length - 1];
      const linesOf = sys => { const sm = ((o.model && o.model.systems) || []).find(m => (m.key !== undefined ? m.key : m.part) === sys.part); return (sm && sm.staffLines) || [-2, -1, 0, 1, 2]; };
      const ys = sysTop.yOfSs(Math.max(...linesOf(sysTop))), ye = sysBot.yOfSs(Math.min(...linesOf(sysBot)));
      const ss = sysTop.ssPx, xEnd = view.xOfSeconds(o.srcEnd);
      const thin = fb.thinSs * ss, gap = fb.gapSs * ss, thick = fb.thickSs * ss;
      const bar = (x, w) => '<rect x="' + x.toFixed(2) + '" y="' + ys.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + (ye - ys).toFixed(2) + '" fill="' + fb.colour + '"/>';
      endBar = '<g class="final-barline">' + bar(xEnd - thick - gap - thin, thin) + bar(xEnd - thick, thick) + '</g>';
    } else if (eb && view.systems.length && (endInWindow || edgeBar)) {
      const ys = view.systems[0].yTopPx, ye = view.systems[view.systems.length - 1].yBotPx;
      // [2c.1] the right edge of the SYSTEM — the frame less its right margin (no margin: the frame's edge, as before)
      const xEnd = endInWindow ? view.xOfSeconds(o.srcEnd) : (view.musicX1Px != null ? view.musicX1Px : view.widthPx);
      endBar = '<rect x="' + (xEnd - eb.wPx).toFixed(2) + '" y="' + ys.toFixed(1) +
        '" width="' + eb.wPx + '" height="' + (ye - ys).toFixed(1) + '" fill="#111" opacity="' + (eb.opacity || 0.55) + '"/>';
    }
    // NO metaOverlaySvg: D4 says META off, and the app returns '' for it then.
    return svg.replace('</svg>', endBar + (o.append || '') + '</svg>');
  }

  return { staticPageSvg };
});
