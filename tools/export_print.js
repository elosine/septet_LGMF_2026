#!/usr/bin/env node
// export_print.js — THE PRINT SCORE. Paginated, static, vector PDF.
//
// Day 37. The print score was parked on day 36 with its format decided
// (`docs/PRINT_AND_COVER.md`: TABLOID LANDSCAPE 17 x 11) and nothing built.
//
// WHY THIS IS SMALL: the notation engine is already resolution-independent.
// `Layout.layoutSection` returns a model in STAFF-SPACE units and
// `Coords.makeView` maps it onto a canvas, so a print page is the same model
// at a different view — not a second engine. The page itself comes from
// `notation/lib/static_page.js`, the SAME module the video exporter draws
// through, so the printed page and the approved film cannot drift.
//
// WHAT PRINT ADDS that the video does not have:
//   1. a TIME RULER. The video has a moving cursor; paper does not. This is a
//      proportional score, so without a time reference the page cannot be read
//      in time at all. Ticks every second, numbered every five.
//   2. SECTION MARKS. Derived from the score's own ACT- markers, never from the
//      raw working marks (which is what ir.hideMarkers exists to suppress).
//   3. FOLIOS, and an optional cover page from print/cover/.
//
// PDF: Chrome headless --print-to-pdf. Measured day 37 — MediaBox [0 0 1224
// 792] exactly, fonts embedded as FontFile2, ZERO raster images, real path
// operators. No new dependency; the repo still has exactly one (resvg, D77).
//
// usage:
//   node tools/export_print.js --ir db1 --out print/score/BCB-score.pdf
//   node tools/export_print.js --sec 15 --pages 1-4 --out proof.pdf
//   node tools/export_print.js --htmlOnly --out proof.html
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const Coords = require(path.join(ROOT, 'notation', 'lib', 'coords.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Splice = require(path.join(ROOT, 'notation', 'lib', 'splice.js'));
const GC = require(path.join(ROOT, 'notation', 'lib', 'gc.js'));   // [2b.7.3] the arc's own pre/post — the reserves are derived, never typed
const StaticPage = require(path.join(ROOT, 'notation', 'lib', 'static_page.js'));
const Render = require(path.join(ROOT, 'notation', 'lib', 'render.js'));   // [2b.7.5] its own kind census, for --planJson

// ---------------------------------------------------------------- args
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
function flag(name) { return process.argv.indexOf('--' + name) >= 0; }
const irId = arg('ir', 'db1');
const outFile = arg('out', null);
// [PLAN 2b.2.1 — 2026-09-17] A3 LANDSCAPE IS THE DEFAULT (piece #5's call fixed it; here it is kept at his word, LGMF LG-328).
// [LGMF 2b-P.2 — 2026-10-03] THE SHEETS LIVE IN print/formats.json — ONE source for this exporter and the cover generator
// (print/cover/make_cover.ps1), so a cover is drawn at exactly the sheet that is printed; the default format is that file's.
const SHEETS = JSON.parse(fs.readFileSync(path.join(ROOT, 'print', 'formats.json'), 'utf8'));
const formatName = arg('format', SHEETS.default);
// [2c.1] the page margin is REGISTRY DATA (container.json print.marginIn, 12.7 mm all round); --margin overrides it
const marginArg = arg('margin', null);
const secArg = arg('sec', null);
const pagesArg = arg('pages', null);
const atArg = arg('at', null);        // select the page(s) CONTAINING this second — a comma list makes a proof PDF (2b.3)
const wantRuler = arg('ruler', 'on') !== 'off';
const wantCover = arg('cover', 'off') !== 'off';
const wantInstructions = arg('instructions', 'off') !== 'off';
const htmlOnly = flag('htmlOnly');
const planJson = arg('planJson', null);   // [2b.7.5] dump the page plan and its owned census, then stop — what check_print_edges measures against
const quiet = flag('quiet');
// [LGMF 2b-P.1, 2026-10-03] --plan screen: THE FRAME CHECK'S COMMON GROUND (tools/check_print_frame.js), never a deliverable. Since
// 2c the two media cut the same model by different rules (the screen tiles, paper places its cut by the objects), so a moment no
// longer lands on the same window in both and the element census could not be compared. With this switch the PRINT's own frame —
// its parts, its lanes, its block, its model — is drawn on the SCREEN's pages under the screen's edge rules; HTML only.
const SCREEN_PLAN = arg('plan', null) === 'screen';
if (arg('plan', null) != null && !SCREEN_PLAN) { console.error('--plan takes "screen" only (the frame check\'s switch)'); process.exit(2); }
if (SCREEN_PLAN && !htmlOnly) { console.error('--plan screen is a check, not a score: it writes HTML only (--htmlOnly)'); process.exit(2); }

if (!outFile && !planJson) {   // [2b.7.5] --planJson needs no output file: it dumps the plan and stops
  console.error('usage: export_print.js --out <file.pdf> [--ir db1] [--sec N] [--pages a-b] [--at SEC]');
  console.error('       [--format a3-landscape|tabloid-landscape|letter-landscape] [--margin IN (default: registry print.marginIn)]');
  console.error('       [--ruler on|off] [--cover on|off] [--instructions on|off] [--htmlOnly]');
  process.exit(2);
}

// UNIT BASIS = CSS PIXELS AT 96/inch, not points.
// An SVG's width/height attributes are UNITLESS, which means CSS px. Page
// geometry in pt therefore rendered the music at 72/96 = 75 % of the block
// while pt-measured furniture (the folio) spanned it fully — caught on the
// first screenshot, not by reading. @page still carries the physical size in
// inches, so the PDF is a true 17 x 11 regardless.
const PX = 96;
// `css` is what @page gets: A3 is a metric sheet and 420 mm is exact where
// 16.5354 in is a rounding — Chrome sizes the MediaBox from this string.
//
// A3 IS A CEILING, NOT A TARGET (the call: "a maximum size of DIN A3"), and
// Chrome does not honour the box exactly: `size:420mm 297mm` measured out as
// MediaBox 1191.12 x 841.92 pt = 420.2 x 297.0 mm — two tenths of a millimetre
// OVER the sheet it is meant to be. A checker that reads the box would call that
// a bigger-than-A3 score. So the drawn sheet is a fifth of a millimetre under the
// ceiling and Chrome's rounding lands inside it. (Shrinking @page alone does not
// work: the page DIV keeps its old height and every page spills onto a second —
// measured, 8 pages for 4. Both come from these numbers, which is why they live in one place: print/formats.json.)
// w x h in INCHES, landscape; `css` is the file's own numbers in its own unit.
const FORMATS = Object.fromEntries(Object.entries(SHEETS.formats).map(([name, f]) => {
  const perIn = f.unit === 'mm' ? 25.4 : 1;
  return [name, { w: f.w / perIn, h: f.h / perIn, css: f.w + f.unit + ' ' + f.h + f.unit, label: f.label }];
}));
const FMT = FORMATS[formatName];
if (!FMT) { console.error('unknown --format ' + formatName + '; have: ' + Object.keys(FORMATS).join(', ')); process.exit(2); }

// ---------------------------------------------------------------- load
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const glyphs = rd('notation/lib/glyphs.json');
const pageRules = rd('notation/registry/page_rules.json');
const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
// [PLAN 2k, D55 / M5 — 2026-09-16] the ensemble, REALIZED: this export is the presentation score (a full score read together), so the
// bass clarinet is in C on a bass clef (registry realizations.video-jury.ensemble); the working page keeps the default B♭ treble.
const ens = rd('notation/registry/ensemble.json');
const T = rd('notation/registry/techniques.json');
const ir = rd(path.join('notation', 'ir', irId + '.ir.json'));

// [PLAN 2b.1.1 — 2026-09-17] THE FRAME'S PARTS COME FROM THE REALIZED ENSEMBLE, exactly as the video's do. They came from
// `ir.source.parts` — the parts the IR happens to carry — which is why the print drew six systems and no piano: the grand
// staff's systems are keyed '2:0' / '2:1' and no part number 2 was ever in the frame (RUNNING_LOG §552).
const ENS = Layout.ensembleFor(ens, (C.realizations || {})['video-jury']);
const ensPart = p => (ENS && ENS.parts.find(q => q.part === p)) || null;
const FRAME_PARTS = ENS ? ENS.parts.map(p => p.part) : ir.source.parts.slice();
// [2e.4] the ladder's fit: the frame's lane boxes in ss — the printed lane is the video lane scaled, so the same boxes
const Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js'));
const model = Layout.layoutSection(ir, glyphs, Object.assign(
  { m4AttackLines: false, frameParts: FRAME_PARTS, ensemble: ENS, techniques: T, fitBoxes: Fit.boxesFor(C, ENS, FRAME_PARTS) },
  (C.engraving && C.engraving.layout) || {}));
const srcEnd = ir.source.window[1];

// ------------------------------------------------- geometry
// The lane proportions come from the SAME registry block the video uses, so a
// printed lane is the video lane scaled — not a second set of numbers to keep
// in sync. Verified day 37: this derivation reproduces PRINT_AND_COVER's
// measured 26.7 mm lane and ~8 mm staff without either being typed in here.
const rz = (C.realizations || {})['video-jury'] || {};
const lanes = rz.lanes || { padTopPx: 8, padBotPx: 8, gapPx: 4 };
const VH = (C.frame && C.frame.heightPx) || 1080;
const VW = (C.frame && C.frame.widthPx) || 1920;
const staffHeightPx = (C.staff && C.staff.staffHeightPx) || 31.6;
const videoPageSeconds = (C.timeScale && C.timeScale.defaults && C.timeScale.defaults.trance) || 12;

const pageW = FMT.w * PX, pageH = FMT.h * PX;
const marginIn = marginArg != null ? parseFloat(marginArg) : ((C.print && C.print.marginIn > 0) ? C.print.marginIn : 0.5);
const margin = marginIn * PX;
const headerPx = wantRuler ? 32 : 0;                   // the time-ruler strip
const footerPx = 19;                                   // folio
const blockW = pageW - 2 * margin;
const blockH = pageH - 2 * margin - headerPx - footerPx;
if (!(blockW > 0 && blockH > 0)) { console.error('margins leave no room for music'); process.exit(2); }

// [PLAN 2b.1.2 / 2b.1.4 — 2026-09-17] THE BAND: the same function the video calls (Coords.ensembleFrame) — weighted lanes
// (the piano 1.576), each lane's staff scale by its weight, the grand staff's two staves at the registry's gap. It is computed
// in the VIDEO's frame height and used here at the print block's, which is sound because a lane is a FRACTION and ssPerSystem
// is a RATIO (lane height / one staff space) — this is what keeps the printed staff proportional to the filmed one.
const N = FRAME_PARTS.length;
const FRAME = Coords.ensembleFrame(FRAME_PARTS, {
  heightPx: VH, lanes, staffHeightPx,
  grandStaff: ((C.engraving || {}).layout || {}).grandStaff,
  weightOf: ENS ? (p => (ensPart(p) && ensPart(p).weight) || 1) : undefined,
  stavesOf: p => (ensPart(p) && ensPart(p).staves && ensPart(p).staves.length) || 1,
  ensemble: ENS,   // [2a] the joined lane (the percussionist's brace) is read from it
});
const systems = FRAME.systems, ssPerSystem = FRAME.ssPerSystem;
const laneFrac = FRAME.lanePx / VH;              // ONE WEIGHT UNIT — a player's lane
const lanePx = laneFrac * blockH;
const ssPx = lanePx / ssPerSystem;
// [2c.1] THE RIGHT MARGIN HOLDS THE OVERHANG at the print's own staff size (registry prefatory.overhangSs; absent = no check)
const overhangSs = C.prefatory && C.prefatory.overhangSs;
if (overhangSs > 0 && margin < overhangSs * ssPx) {
  console.error('margin ' + (margin / PX * 25.4).toFixed(1) + ' mm cannot hold the ' + overhangSs + ' ss overhang (' +
    (overhangSs * ssPx / PX * 25.4).toFixed(1) + ' mm at this staff)'); process.exit(2);
}
const staffPx = 4 * ssPx;
const mm = px => px / PX * 25.4;

// SECONDS PER PAGE. Default = the density the composer approved on screen:
// the video lays down (pxPerSecond / ssPx) staff-spaces per second, and we hold
// that constant so a printed bar looks like the filmed bar, only larger.
const videoDensitySsPerSec = (VW / videoPageSeconds) / ((laneFrac * VH) / ssPerSystem);
const defaultSec = blockW / (videoDensitySsPerSec * ssPx);
const pageSeconds = secArg != null ? parseFloat(secArg) : defaultSec;
if (!(pageSeconds > 0)) { console.error('--sec must be positive'); process.exit(2); }

// [PLAN 2b.7.2 / 2b.7.3, D59 — 2026-09-17] THE RESERVES. A PAGE OWNS [cut, next cut), and an owned strike's ink reaches
// BOTH WAYS out of its onset: back along the GC arc's approach (0.36 s = 7.3 ss) and the notehead unit that hangs left of
// the go line (§404, 4.2 ss), forward through the rebound (0.24 s) and the marks beside the head. So the page's WINDOW is
// deliberately wider than what it owns — it opens leftReserve BEFORE the cut and the plan advances only
// pageSeconds minus the two reserves, which puts both ends of every owned strike inside the drawn area.
// THE SCALE NEVER CHANGES: the window is still exactly pageSeconds wide on every page (distance is time — his own
// correction on the film, "in page two the cursor speeds up significantly"). The cost is pages, and only pages.
const bufSs = pageRules.musicStartBufferSs || 0;
const pxPerSecPage = (blockW - ((C.prefatory && C.prefatory.gutterPx) || 0)) / pageSeconds;
const secOfSs = ss => (ssPerSystem > 0 && pxPerSecPage > 0) ? ss * ssPx / pxPerSecPage : 0;
const bufSec = secOfSs(bufSs);
const gcP = GC.params((((C.engraving && C.engraving.render) || {}).gc || {}).preset || {});
const edgeMarginSec = secOfSs(pageRules.edgeReserveMarginSs != null ? pageRules.edgeReserveMarginSs : 1.2);
// [2c.6, LGMF 2026-09-25 — NOTATION_STANDARDS §5] page_rules.printPlan 'objects': THE CUT PLACED BY THE OBJECTS — the reserves
// retire (0 · 0), the plan targets the whole window, and every page opens where its first object's ink begins. Absent = D59 as above.
const OBJ = pageRules.printPlan === 'objects';
const leftReserve = OBJ ? 0 : Math.max(bufSec, gcP.pre + edgeMarginSec);
const rightReserve = OBJ ? 0 : gcP.post + edgeMarginSec;
const advanceSeconds = pageSeconds - leftReserve - rightReserve;
if (!(advanceSeconds > 0)) { console.error('--sec ' + pageSeconds.toFixed(2) + ' leaves no music after the edge reserves'); process.exit(2); }

// ------------------------------------------------- IR-vs-score staleness HINT
// The print score is drawn from the IR, not from the save file. So editing the
// score and re-running THIS tool renders the OLD notation, silently. That is the
// failure this notice exists to prevent.
//
// It is a HINT, not a verdict, and deliberately so: D75 records that a save
// file's timestamp is NOT evidence of its currency (a `-work` copy was three
// days NEWER than the archive and missing an entire playability pass). A newer
// mtime here means "check", never "stale".
try {
  const irPath = path.join(ROOT, 'notation', 'ir', irId + '.ir.json');
  const scPath = path.join(ROOT, 'scores', ir.source.score + '.json');
  if (fs.existsSync(scPath)) {
    const irM = fs.statSync(irPath).mtimeMs, scM = fs.statSync(scPath).mtimeMs;
    if (scM > irM) {
      console.log('  ! NOTE  ' + ir.source.score + '.json is NEWER than ' + irId + '.ir.json.');
      console.log('          The print score is drawn from the IR, so score edits do not appear');
      console.log('          until the IR is rebuilt:   bash print/score/build.sh --rebuild-ir');
      console.log('          (a timestamp is a hint, not proof — D75. Rebuild to be sure.)');
    }
  }
} catch (e) { /* a missing score is not an error; marks just go quiet */ }

// ---------------------------------------------------------------- pages
// [2b.7.3] planned at the ADVANCE, not the window width: page i owns [pages[i].t0, pages[i].t1).
// [2c.6] under 'objects': the forbidden intervals of every drawn object (Splice.edgeIntervals — the unit's ink from Render.inkSpanSs,
// the GC's reach and its dot, the duration line's head + stub, the beam and the tuplet), then Splice.planObjectPages
const ER = (C.engraving && C.engraving.render) || {};
const gcLook = Object.assign({}, GC.LOOK, (ER.gc && ER.gc.look) || {});
const gcPadSec = ((gcLook.impactRadiusPx || 4) + (gcLook.arcStrokePx || 1.5) / 2) * (blockH / (gcLook.frameHeightPx || 1080)) / pxPerSecPage;
// [2b-P.1] --plan screen: the screen's own pages (export_video's two lines) — the tiling from the lead-in, or the old overlap
const SCREEN_T0 = Splice.screenStartOf(ir, pageRules, rz);
const pages = SCREEN_PLAN
  ? (pageRules.screenPlan === 'tile' ? Splice.tilePages(ir, pageRules, pageSeconds, SCREEN_T0) : Splice.planPages(ir, pageRules, pageSeconds))
  : OBJ
  ? Splice.planObjectPages(ir, pageRules, pageSeconds, Splice.edgeIntervals(ir, model, {
      edge: pageRules.edge, inkSpanSs: it => Render.inkSpanSs(it, glyphs, ER), secPerSs: secOfSs(1),
      gcPrePost: it => Render.gcPrePost(it, ER), gcPadSec, stubSec: secOfSs(pageRules.durationStubSs != null ? pageRules.durationStubSs : 2),
      hideBricks: true,   // the print page draws no bricks (static_page, D4)
    }), { firstByObjects: Splice.leadInOf(pageRules, rz) > 0 })   // [2e.2, §409] with a lead-in, page 1 is placed by its objects too
  : Splice.planPages(ir, pageRules, advanceSeconds);
let sel = pages.map((_, i) => i);
if (atArg != null) {
  // the page containing a given second — the page plan changes with --sec, so
  // a fixed --pages number does NOT show the same music at two densities.
  // [2b.3] a COMMA LIST gives one PDF of those pages — the proof sheet, one
  // page per section, which is what the composer is asked to look at.
  const pageAt = t => { let best = 0; for (let i = 0; i < pages.length; i++) if (pages[i].t0 <= t) best = i; else break; return best; };
  sel = [...new Set(String(atArg).split(',').filter(s => s.trim() !== '').map(s => pageAt(parseFloat(s))))].sort((a, b) => a - b);
}
if (pagesArg) {
  const m = /^(\d+)(?:-(\d+))?$/.exec(pagesArg.trim());
  if (!m) { console.error('--pages wants N or A-B (1-indexed)'); process.exit(2); }
  const a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a;
  sel = sel.filter(i => i + 1 >= a && i + 1 <= b);
  if (!sel.length) { console.error('--pages ' + pagesArg + ' selects nothing (have 1-' + pages.length + ')'); process.exit(2); }
}

// [PLAN 2b.1.5, then 2b.7.2] THE WINDOW OPENS BEFORE THE CUT. §404 (the composer, on a viola note sitting on the alto clef:
// "in the tuba score we had a buffer zone after the clef") bought the notehead unit 4.2 ss of room; the GC arc's approach is
// 7.3 ss and was never counted, which is how arcs came to be drawn over the clefs. leftReserve is now the larger of the two.
const pageT0Of = i => SCREEN_PLAN ? pages[i].t0 : OBJ ? pages[i].w0 : Math.max(ir.source.window[0], pages[i].t0 - leftReserve);   // [2c.6] the page's first ink
// THE OWNED SPAN and THE INK END (2b.7.1 / 2b.7.4). The page draws only the events it owns; the right reserve past its cut is
// where the last owned strike's rebound goes, and the system STOPS there — a ragged right edge on a page whose cut fell early,
// which in a proportional score is the honest reading (blank staff reads as silence).
const ownedOf = i => [pages[i].t0, pages[i].t1];
const inkEndOf = (i, view) => SCREEN_PLAN ? view.window[1] : Math.min(view.window[1], OBJ ? pages[i].inkEnd : pages[i].t1 + rightReserve);   // [2c.6] the system ends AT the cut

function viewFor(i) {
  // THE LAST PAGE REACHES THE PIECE'S END. Measured day 37: with the default
  // density the last window ended at 752.92 against srcEnd 753, so the true
  // final barline fell 0.08 s outside the page and the score would have ended
  // with no final bar once the right-edge bar was removed. The last page's
  // window is therefore stretched to srcEnd — 11.49 s instead of 11.41, a 0.7 %
  // spacing difference on one page, in exchange for a correct final barline.
  const isLast = i === pages.length - 1;
  const t0 = pageT0Of(i);
  const w1 = (isLast && !SCREEN_PLAN) ? Math.max(t0 + pageSeconds, srcEnd) : t0 + pageSeconds;   // a screen page is one span, always
  return Coords.makeView({
    widthPx: blockW, heightPx: blockH,
    window: [t0, w1],
    gutterPx: (C.prefatory && C.prefatory.gutterPx) || 0,
    systems, ssPerSystem,
  });
}

// ------------------------------------------------- [PLAN 2b.7.5] THE PAGE PLAN, DUMPED
// ONE source for the geometry. The checker could re-derive the lane weights, the A3 block and the
// reserves — and then be checking its own arithmetic instead of the exporter's. It reads this instead.
if (planJson) {
  const POINT = new Set(Render.POINT_KINDS), LONG = new Set(Render.LONG_KINDS);
  const items = [];
  for (const sys of model.systems) for (const it of (sys.items || [])) {
    if (POINT.has(it.k)) items.push({ k: it.k, t: it.t, part: sys.part });
    else if (LONG.has(it.k)) items.push({ k: it.k, t0: it.t0, t1: it.t1, part: sys.part, long: true });
  }
  const pts = items.filter(x => !x.long && isFinite(x.t));
  const longs = items.filter(x => x.long && isFinite(x.t0) && isFinite(x.t1));
  const CURVE = ((C.engraving && C.engraving.render) || {});
  const out = {
    ir: irId, printPlan: OBJ ? 'objects' : 'reserves',
    // the two D42 curve colours, read from the registry so the checker never hard-codes them
    curveColorGreen: (CURVE.envCurve || {}).color, curveColorOrange: (CURVE.glissCurve || {}).color, format: formatName, pageSeconds, advanceSeconds, leftReserve, rightReserve,
    gutterPx: (C.prefatory && C.prefatory.gutterPx) || 0, blockW, srcStart: ir.source.window[0], srcEnd,
    pointKinds: Render.POINT_KINDS, longKinds: Render.LONG_KINDS,
    pointTotal: pts.length, longTotal: longs.length,
    // a long item with no bounds would be invisible to the ownership census AND still drawn — the one way this check could lie
    longMalformed: items.filter(x => x.long && !(isFinite(x.t0) && isFinite(x.t1))).map(x => x.k + "@part" + x.part),
    longByKind: Object.fromEntries(Render.LONG_KINDS.map(k => [k, longs.filter(x => x.k === k).length])),
    pages: pages.map((p, i) => {
      const view = viewFor(i);
      const inkEnd = inkEndOf(i, view);
      const last = i === pages.length - 1;
      const ownsT = t => t >= p.t0 - 1e-9 && (last ? t <= p.t1 + 1e-9 : t < p.t1 - 1e-9);
      const mine = pts.filter(x => ownsT(x.t));
      const crossesOwned = x => x.t1 > p.t0 + 1e-9 && (last ? x.t0 <= p.t1 + 1e-9 : x.t0 < p.t1 - 1e-9);
      const inDrawn = x => !(x.t1 < view.window[0] || x.t0 > inkEnd);
      return {
        n: i + 1, t0: p.t0, t1: p.t1, kind: p.kind, severed: p.severed,
        // [2c.6] the objects plan: the blank a push left at the right, what was pushed, and a forced page's broken objects
        blank: p.blank != null ? p.blank : null, pushed: p.pushed ? p.pushed.length : 0, forced: p.forced || [],
        w0: view.window[0], w1: view.window[1], inkEnd,
        xInk: view.xOfSeconds(inkEnd), xMusic0: view.musicX0Px,
        points: mine.length, gc: mine.filter(x => x.k === 'gc').length,
        golines: mine.filter(x => x.k === 'goline').length,
        // LONG ITEMS (his eye, 2026-09-17: "pg 2 in piano, extra from next page trill ; vc pg 14").
        // A long item belongs to the pages it CROSSES — crosses what the page OWNS.
        //   longs        what the page should draw
        //   curvesGreen  of those, the ones that ink as a D42 limeGreen path (env + cresc), ONE path each
        //   curvesOrange the same for the morph glissando's brightOrange
        // check_print_edges counts the paths on the rendered page and must find these numbers.
        //   inReserveOnly  long items lying in a RESERVE without crossing the owned span — what the
        //   first 2b.7 build drew as stubs (19 on 9 pages). Information, not a fault: it is a fact
        //   about where the music falls, and the test is that none of them reaches the ink.
        longs: longs.filter(crossesOwned).length,
        curvesGreen: longs.filter(x => crossesOwned(x) && (x.k === 'envcurve' || x.k === 'cresccurve')).length,
        curvesOrange: longs.filter(x => crossesOwned(x) && x.k === 'glisscurve').length,
        inReserveOnly: longs.filter(x => inDrawn(x) && !crossesOwned(x)).length,
        inReserveOnlyDetail: longs.filter(x => inDrawn(x) && !crossesOwned(x)).map(x => x.k + " part" + x.part + " @" + x.t0.toFixed(2) + "-" + x.t1.toFixed(2)),
      };
    }),
  };
  fs.writeFileSync(planJson, JSON.stringify(out, null, 1));
  if (!quiet) console.log('  plan -> ' + planJson + '  (' + out.pages.length + ' pages, ' + out.pointTotal + ' point items)');
  process.exit(0);
}

// ------------------------------------------------- section marks: NONE
// [PLAN 2b.2.3, D58 — 2026-09-17] The composer, asked what the marks above the
// music should say: "no marks". So there are none, and the derivation that made
// them is GONE rather than switched off — it was the tuba's (its ACT- markers
// and the trance's numeric marks), it found nothing in this score anyway
// ("marks NONE FOUND", §606), and a dead derivation in a live tool is a trap.
// The strip above the music now carries the time ruler alone.

// ------------------------------------------------- furniture
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clock = t => {
  const s = Math.round(t);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
// The ruler is drawn in its own strip but shares the music view's x mapping, so
// a tick and the note under it cannot disagree.
function rulerSvg(view, inkEnd) {
  const [t0, t1W] = view.window;
  // [2b.7.4] the ruler ends with the system: on a page whose cut fell early the
  // last seconds are not this page's music, and a ruler over them would lie.
  const t1 = inkEnd != null ? Math.min(t1W, inkEnd) : t1W;
  const xInk = view.xOfSeconds(t1);
  const p = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + blockW.toFixed(2) + '" height="' + headerPx +
    '" viewBox="0 0 ' + blockW.toFixed(2) + ' ' + headerPx + '">'];
  const yBase = headerPx - 0.5;
  if (wantRuler) {
    p.push('<line x1="0" y1="' + yBase + '" x2="' + Math.min(blockW, xInk).toFixed(2) + '" y2="' + yBase + '" stroke="#8a8a8a" stroke-width="0.4"/>');
    const first = Math.ceil(t0), last = Math.floor(Math.min(t1, srcEnd));
    for (let t = first; t <= last; t++) {
      const x = view.xOfSeconds(t);
      if (x < 0 || x > Math.min(blockW, xInk) + 0.01) continue;
      const five = t % 5 === 0;
      p.push('<line x1="' + x.toFixed(2) + '" y1="' + (yBase - (five ? 5 : 2.5)).toFixed(2) + '" x2="' + x.toFixed(2) +
        '" y2="' + yBase + '" stroke="#8a8a8a" stroke-width="' + (five ? 0.6 : 0.35) + '"/>');
      if (five) p.push('<text x="' + x.toFixed(2) + '" y="' + (yBase - 7).toFixed(2) +
        '" font-size="6.5" font-family="\'Crimson Pro Light\', serif" fill="#8a8a8a" text-anchor="middle">' + clock(t) + '</text>');
    }
  }
  p.push('</svg>');
  return p.join('');
}

// ---------------------------------------------------------------- html
const fontB64 = f => fs.readFileSync(path.join(ROOT, 'notation', 'app', 'fonts', f)).toString('base64');
const faces = [
  { file: 'CrimsonPro-Light.ttf', style: 'normal' },
  { file: 'CrimsonPro-LightItalic.ttf', style: 'italic' },
].map(f => "@font-face{font-family:'Crimson Pro Light';font-style:" + f.style +
  ";src:url(data:font/ttf;base64," + fontB64(f.file) + ") format('truetype');}").join('\n');

// [PLAN 2b.4.1 — 2026-09-17] THE COVER, PER FORMAT. A cover drawn for a DIFFERENT
// sheet is not an option: it would be scaled by the browser and the type would no
// longer be the measured size, so this refuses rather than guesses.
// [LGMF 2b-P.2 — 2026-10-03] THE COVER IS A TEMPLATE'S: `print/cover/cover-<format>.svg`, drawn by print/cover/make_cover.ps1 from
// the words in print/cover/cover.json at the sheet print/formats.json names — no piece's name in the path, nothing to edit here.
function coverSvg() {
  if (!wantCover) return null;
  const p = path.join(ROOT, 'print', 'cover', 'cover-' + formatName + '.svg');
  if (!fs.existsSync(p)) {
    console.error('  ! --cover on but ' + path.relative(ROOT, p) + ' is missing.');
    console.error('    draw it first:  powershell -ExecutionPolicy Bypass -File print/cover/make_cover.ps1 -Format ' + formatName);
    process.exit(4);
  }
  return fs.readFileSync(p, 'utf8');
}

// ------------------------------------------------- performance instructions
// Page 2 of the print score (day 40, composer: "separate the performance
// instructions into two columns and lay them out as a second page of the
// print score"). ONE SOURCE: docs/notation_instructions/index.html — the
// dictation mock page IS the front matter; this function only re-dresses it
// for paper (two CSS columns, the score's Crimson faces, images inlined so
// the SVGs' own 'Crimson Pro Light' <text> resolves against the embedded
// fonts — an <img> would isolate them and fall back).
// [PLAN 2b.4.2 — 2026-09-17] TWO PAGES, NOT ONE. Measured on the septet's page:
// the content is 2322 px of a 1536 px two-column frame — exactly ONE COLUMN over,
// and `.page{overflow:hidden}` was CLIPPING it with no message of any kind (the
// third column simply did not print). This piece's front matter carries what the
// tuba's did not: the morph sequence chart, the legend and the instrumentation.
// So it breaks at a SECTION (never mid-paragraph) and prints as two spreads.
// The type is not shrunk to fit: 10.4 px is already the floor for a player
// reading at a stand.
// [LGMF 2b-P.3 — 2026-10-03] THE INSTRUCTIONS AS A TEMPLATE: THE PRINT READS THE PAGE'S OWN FORMAT. Nothing below names an image
// or a heading of one piece. What was here: a table of image names with a width each (`FIGW` — the tuba's, then the septet's; on
// this piece's page not one key matched and, worse, the tag pattern wanted `src` FIRST, so nine of the twelve images were not
// inlined at all) and a default break at piece #5's "Acoustic Beating". Now:
//   · AN IMAGE'S WIDTH IS THE PAGE'S: `<img class="zoomed" style="--w: N">` keeps its --w and the page's one rule
//     (styles.css: width = --w / --frame of the column — RUNNING_LOG §704's ONE SCALE) is applied to the PRINT column, --frame read
//     from the page's stylesheet. A `<figure class="zoomed">` carries the width for its image. A plain <img>: the full column, and a note.
//   · THE ROWS ARE THE PAGE'S: `.zoomed-row` (images side by side) and `.entry-row` (a picture and its text) stay rows, each
//     unbreakable; their gaps are read from the stylesheet.
//   · THE BREAK: --insBreak names the <h3> that opens page 2. Not given, it is MEASURED — the page is laid out once in Chrome and
//     the break goes before the first <h3> whose section would not fit; one page if all fits, and again for a third if it must.
//   · KEPT: 10.4 px, column-fill:auto, a heading never ends a column, a figure never leaves the line that introduces it (§610 · §611).
const INS_BREAK = arg('insBreak', null);   // the <h3> that opens page 2; absent = measured
const INS_DIR = path.join(ROOT, 'docs', 'notation_instructions');
// the page's own knobs, from its stylesheet — the defaults are styles.css's values of 2026-10-03, used only if a rule is gone
const INS_CSS = (() => {
  const p = path.join(INS_DIR, 'styles.css');
  const css = fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '') : '';
  const pick = (re, def, what) => { const m = re.exec(css); if (!m && wantInstructions) console.error('  ! styles.css has no ' + what + ' — the print uses ' + def); return m ? m[1].trim() : def; };
  return {
    frame: pick(/:root\s*\{[^}]*--frame\s*:\s*([\d.]+)/, '1920', ':root --frame'),
    rowGap: pick(/\.zoomed-row\s*\{[^}]*\bgap\s*:\s*([^;}]+)/, '2%', '.zoomed-row gap'),
    entryGap: pick(/\.entry-row\s*\{[^}]*\bgap\s*:\s*([^;}]+)/, '3%', '.entry-row gap'),
  };
})();
let INS_REPORT = '';
let _insPages;   // built once — the measured break costs a Chrome run, and the page count is asked for twice
function instructionsPages() {
  if (!wantInstructions) return null;
  if (_insPages !== undefined) return _insPages;
  const src = path.join(INS_DIR, 'index.html');
  if (!fs.existsSync(src)) { console.error('  ! --instructions on but docs/notation_instructions/index.html is missing; skipping'); return (_insPages = null); }
  let body = /<body>([\s\S]*)<\/body>/.exec(fs.readFileSync(src, 'utf8'))[1];
  body = body.replace(/<!--[\s\S]*?-->/g, '');            // regen-command comments
  // title block spans both columns; the rest flows
  const tm = /<h1>([\s\S]*?)<\/h1>\s*<p class="subtitle">([\s\S]*?)<\/p>/.exec(body);
  const title = tm ? tm[1] : 'Performance Instructions';
  const subtitle = tm ? tm[2] : '';
  if (tm) body = body.replace(tm[0], '');
  // INLINE EVERY IMAGE (an SVG scales by CSS width; inlined, its own 'Crimson Pro Light' <text> resolves against the embedded
  // faces — an <img> would isolate it and fall back). The attributes are read in ANY order.
  const missing = [], plain = [];
  body = body.replace(/<img\b([^>]*)>/g, (tag, attrs, off, whole) => {
    const A = {};
    for (const m of attrs.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)) A[m[1]] = m[2];
    if (!A.src) return '';
    const p = path.join(INS_DIR, A.src);
    if (!fs.existsSync(p)) { missing.push(A.src); return ''; }
    const inner = /\.svg$/i.test(A.src) ? fs.readFileSync(p, 'utf8').replace(/^<\?xml[^>]*\?>\s*/, '')
      : '<img src="file:///' + p.replace(/\\/g, '/') + '" style="display:block;width:100%;height:auto">';   // a raster image: check_print_pdf will say so
    const w = /--w\s*:\s*([\d.]+)/.exec(A.style || '');
    if (/\bzoomed\b/.test(A.class || '') && w) return '<div class="figwrap zoomed" style="--w:' + w[1] + '">' + inner + '</div>';
    // inside <figure class="zoomed"> the FIGURE carries the width and its image fills it (styles.css, §706)
    const before = whole.slice(0, off), fo = before.lastIndexOf('<figure'), fc = before.lastIndexOf('</figure>');
    const inZoomedFigure = fo > fc && /\bclass="[^"]*\bzoomed\b/.test(before.slice(fo, before.indexOf('>', fo) + 1));
    if (!inZoomedFigure) plain.push(path.basename(A.src));
    return '<div class="figwrap">' + inner + '</div>';
  });
  if (missing.length) { console.error('  ! instructions images MISSING: ' + missing.join(', ')); process.exit(5); }
  if (plain.length) console.error('  ! instructions image(s) with no width of their own (no class "zoomed" + --w): ' + plain.join(', ') + ' — drawn at the full column width');

  const page = (html, i) => '<div class="page ins"><div class="insframe">' +
    '<div class="institle"><span class="t">' + title + '</span><span class="s">' +
    (i === 0 ? subtitle : 'continued') + '</span></div>' +
    '<div class="cols">' + html + '</div></div></div>';

  // THE SECTIONS: what stands before the first <h3>, then one per <h3>. A break falls between sections, never inside one.
  const sections = body.split(/(?=<h3[\s>])/);
  const headOf = s => { const m = /^<h3[^>]*>\s*([\s\S]*?)<\/h3>/.exec(s); return m ? m[1].replace(/<[^>]+>/g, '').trim() : null; };
  let groups;
  if (INS_BREAK != null) {
    const k = sections.findIndex(s => (headOf(s) || '').startsWith(INS_BREAK));
    if (k < 0) {
      console.error('  ! --insBreak "' + INS_BREAK + '" matches no <h3> in the instructions page; it has: ' + sections.map(headOf).filter(Boolean).join(' · '));
      process.exit(5);
    }
    groups = k > 0 ? [sections.slice(0, k), sections.slice(k)] : [sections];
    INS_REPORT = groups.length + ' page(s), the break before "' + headOf(sections[k]) + '" (--insBreak)';
  } else {
    groups = [];
    let rest = sections.slice(), measured = true;
    for (let guard = 0; rest.length && guard < 8; guard++) {
      const k = insFirstOverflow(rest, page);
      if (k == null) { measured = false; groups.push(rest); rest = []; break; }
      if (k < 0) { groups.push(rest); rest = []; break; }
      // k === 0: the page's FIRST section does not fit by itself — no break can go before it; it takes the page, and
      // check_print_front reports what is clipped (the type is not shrunk: 10.4 px is the floor)
      const n = Math.max(1, k);
      groups.push(rest.slice(0, n)); rest = rest.slice(n);
    }
    if (rest.length) groups.push(rest);
    if (!measured) console.error('  ! the instructions\' break could not be measured (Chrome not found) — printed as one page; name the break with --insBreak "<heading>"');
    INS_REPORT = groups.length + ' page(s)' + (groups.length > 1 ? ', the break' + (groups.length > 2 ? 's' : '') + ' before ' +
      groups.slice(1).map(g => '"' + (headOf(g[0]) || '?') + '"').join(' · ') + (measured ? ' (measured: the first section that would not fit)' : '') : (measured ? ' (measured: everything fits)' : ''));
  }
  return (_insPages = groups.map((g, i) => page(g.join(''), i)));
}
// THE MEASURED BREAK. The exporter cannot see its own layout (Chrome does the columns), so it asks: the sections are laid out in
// ONE page of the real dress and Chrome reports, per <h3>, the furthest column its section reaches. A page holds columns 0 and 1;
// the first section reaching column 2 is where the next page begins. Returns its index, -1 when all fits, null without Chrome.
// Only HTML boxes are measured: an inlined SVG's own children reach past its viewport (a crop of a larger page) and would lie.
function insFirstOverflow(sections, page) {
  const chrome = findChrome();
  if (!chrome) return null;
  const tagged = sections.map((s, i) => s.replace(/^<h3/, '<h3 data-sec="' + i + '"'));
  const probe = '<script>addEventListener("load",()=>{' +
    'const c=document.querySelector(".cols"),cr=c.getBoundingClientRect(),gap=parseFloat(getComputedStyle(c).columnGap)||0,colW=(cr.width-gap)/2;' +
    'const out=[...c.querySelectorAll(":scope > h3[data-sec]")].map(h=>{let right=-1e9,el=h;' +
    'while(el&&(el===h||!(el.matches&&el.matches("h3[data-sec]")))){' +
    'for(const e of [el,...el.querySelectorAll("*")]){if(e.ownerSVGElement)continue;const r=e.getBoundingClientRect();if(r.width>0||r.height>0)right=Math.max(right,r.right);}' +
    'el=el.nextElementSibling;}' +
    'return h.getAttribute("data-sec")+":"+Math.floor((right-cr.left-0.5)/(colW+gap));});' +
    'document.body.setAttribute("data-b","["+out.join(",")+"]");});</script>';
  const tmp = path.join(os.tmpdir(), 'printins-' + process.pid + '-' + Date.now() + '.html');
  fs.writeFileSync(tmp, '<!doctype html><meta charset="utf-8">' + styleBlock() + page(tagged.join(''), 0) + probe);
  const c = spawnSync(chrome, ['--headless', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom',
    'file:///' + tmp.replace(/\\/g, '/')], { encoding: 'utf8', maxBuffer: 1 << 28 });
  try { fs.unlinkSync(tmp); } catch (e) { }
  const m = /data-b="\[([^"\]]*)\]"/.exec(c.stdout || '');
  if (!m) return null;
  const over = (m[1] ? m[1].split(',') : []).map(x => x.split(':').map(Number)).find(x => x[1] >= 2);
  return over ? over[0] : -1;
}

// the document's one <style> — a function because the instructions' measured break lays a page out in the same dress (2b-P.3)
function styleBlock() {
  return '<style>' + faces + '\n' +
    '@page{size:' + FMT.css + ';margin:0;}\n' +
    'html,body{margin:0;padding:0;background:#fff;}\n' +
    '.page{position:relative;width:' + pageW + 'px;height:' + pageH + 'px;overflow:hidden;break-after:page;page-break-after:always;background:#fff;}\n' +
    '.page:last-child{break-after:auto;page-break-after:auto;}\n' +
    '.hdr{position:absolute;left:' + margin + 'px;top:' + margin + 'px;}\n' +
    '.mus{position:absolute;left:' + margin + 'px;top:' + (margin + headerPx) + 'px;}\n' +
    '.fol{position:absolute;left:' + margin + 'px;width:' + blockW + 'px;top:' + (pageH - margin - footerPx + 3) + 'px;' +
    'font:11px "Crimson Pro Light",serif;color:#8a8a8a;display:flex;justify-content:space-between;}\n' +
    '.cov svg{display:block;}\n' +
    // ---- the performance-instructions pages ----
    '.insframe{position:absolute;left:' + margin + 'px;top:' + margin + 'px;width:' + blockW + 'px;height:' + (pageH - 2 * margin) + 'px;' +
    "font-family:'Crimson Pro Light',serif;color:#111;}\n" +
    '.institle{display:flex;align-items:baseline;gap:18px;border-bottom:0.75px solid #111;padding-bottom:4px;margin-bottom:9px;}\n' +
    '.institle .t{font-size:21px;letter-spacing:3px;}\n' +
    '.institle .s{font-size:12px;font-style:italic;color:#444;}\n' +
    // column-fill:auto FILLS the first column before starting the second, which is
    // what a fixed-height printed page wants. Balanced (the default) it chose a
    // target height, found the crescendo figure would not fit under it, and threw
    // the figure into column 2 while column 1 stood half empty — his screenshot.
    // --frame: the page's ONE SCALE (styles.css :root) — a score image is --w / --frame of the column, on paper as on screen.
    '.cols{column-count:2;column-fill:auto;column-gap:36px;height:' + (pageH - 2 * margin - 46) + 'px;font-size:10.4px;line-height:1.36;--frame:' + INS_CSS.frame + ';}\n' +
    '.cols h3{font-size:12.5px;letter-spacing:1.5px;margin:7px 0 3px;}\n' +
    '.cols p{margin:0 0 5px;}\n' +
    '.cols ul{margin:0 0 5px 16px;padding:0;}\n' +
    '.cols li{break-inside:avoid;}\n' +
    '.cols a{color:inherit;text-decoration:none;}\n' +
    '.cols figure{margin:0;break-inside:avoid;}\n' +
    '.cols figcaption{font-size:0.85em;font-style:italic;color:#555;margin:2px 0 0;}\n' +
    '.cols .pair{display:flex;gap:8px;margin:2px 0 5px;width:92%;}\n' +
    '.figwrap{break-inside:avoid;margin:2px 0 5px;}\n' +
    '.figwrap svg{display:block;width:100%;height:auto;}\n' +
    // THE PAGE'S OWN VOCABULARY (docs/notation_instructions/styles.css): a score image at the one scale · a row of them · a
    // picture-and-text entry · a bold lead in place of a heading. The widths are the page's (--w), the gaps the stylesheet's.
    '.cols .figwrap.zoomed,.cols figure.zoomed{width:calc(var(--w) / var(--frame) * 100%);}\n' +
    '.cols figure .figwrap{margin:0;}\n' +
    '.cols .zoomed-row{display:flex;gap:' + INS_CSS.rowGap + ';align-items:flex-start;break-inside:avoid;margin:2px 0 5px;}\n' +
    '.cols .zoomed-row > *{flex:none;margin:0;}\n' +
    '.cols .entry-row{display:flex;gap:' + INS_CSS.entryGap + ';align-items:center;break-inside:avoid;margin:6px 0 5px;}\n' +
    '.cols .entry-row > .figwrap{flex:none;margin:0;}\n' +
    '.cols .entry-row .entry-text{flex:1;min-width:0;}\n' +
    '.cols .entry-row .entry-text p{margin:0;}\n' +
    '.cols .entry-lead{margin:7px 0 3px;}\n' +
    // [his notes, 2026-09-17] A HEADING NEVER ENDS A COLUMN, AND A FIGURE NEVER
    // LEAVES WHAT INTRODUCES IT BEHIND. "trills heading to column 2 · notation
    // legend heading + ped to column 2": both were headings stranded at the foot
    // of column 1 with their picture at the top of column 2. break-after on the
    // headings carries them over; break-before on a figure pulls the line above
    // it along. [2b-P.3] And the sentence that EXPLAINS a figure stays under it ("crescendos
    // image and bottom text … fit in column 1") — by adjacency, not by a block built around one page's markup.
    '.cols h3,.cols h4,.cols .entry-lead{break-after:avoid;}\n' +
    '.cols > .figwrap,.cols .notation-section > .figwrap,.cols .zoomed-row,.cols .pair{break-before:avoid;}\n' +
    '.cols :is(.figwrap,.zoomed-row,.pair) + .description{break-before:avoid;break-inside:avoid;}\n' +
    '</style>';
}

function buildHtml() {
  const out = [];
  out.push('<!doctype html><meta charset="utf-8"><title>' + esc(irId) + ' — print score</title>');
  out.push(styleBlock());

  // the order, as #4: cover · performance instructions · the score
  const cov = coverSvg();
  if (cov) out.push('<div class="page cov">' + cov + '</div>');
  const ins = instructionsPages();
  if (ins) out.push(...ins);

  sel.forEach((i, n) => {
    const view = viewFor(i);
    // [2b-P.1] --plan screen: the page as export_video's staticSvg draws it — the screen's edge rules, nothing of paper's
    const svg = SCREEN_PLAN ? StaticPage.staticPageSvg({
      model, view, glyphs, C, srcEnd, reshow: pages[i].reshow, ownsEnd: i === pages.length - 1, ensemble: ENS,
      screenEdges: pageRules.screenPlan === 'tile'
        ? { edge: pageRules.edge || {}, first: pages[i].t0 <= SCREEN_T0 + 1e-9, clampGoLine: pageRules.clampGoLine } : undefined,
    }) : StaticPage.staticPageSvg({
      model, view, glyphs, C, srcEnd,
      reshow: pages[i].reshow, ownsEnd: i === pages.length - 1,
      owned: ownedOf(i), inkEnd: inkEndOf(i, view),   // [2b.7.1/.4] a page owns [cut, next cut); its ink stops at the cut + the right reserve
      ensemble: ENS,        // [PLAN 2b.1.4] the part labels, the winds' and strings' brackets, the piano's brace (§558)
      printEdges: OBJ ? (pageRules.edge || {}) : undefined,   // [2c.6] the objects plan's print page (absent under D59)
      // composer, day 37: no bar line at the right of every page. On paper the
      // page edge is not a musical event; the bar draws only at the true end.
      edgeBar: false,
    });
    // [2b.7.1] the folio reads what the page OWNS — with ownership that is exactly the music on it, reserves excluded.
    const t0 = ownedOf(i)[0], t1 = Math.min(ownedOf(i)[1], srcEnd);
    out.push('<div class="page">');
    if (headerPx) out.push('<div class="hdr">' + rulerSvg(view, inkEndOf(i, view)) + '</div>');
    out.push('<div class="mus">' + svg + '</div>');
    out.push('<div class="fol"><span>' + esc(clock(t0)) + ' – ' + esc(clock(t1)) + '</span>' +
      '<span>' + (i + 1) + '</span></div>');
    out.push('</div>');
  });
  return out.join('\n');
}

// ---------------------------------------------------------------- chrome
function findChrome() {
  const envd = process.env.CHROME_PATH;
  const cands = [envd,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null,
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (e) { } }
  return null;
}

// ---------------------------------------------------------------- go
const outAbs = path.isAbsolute(outFile) ? outFile : path.join(ROOT, outFile);
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
const html = buildHtml();

if (!quiet) {
  console.log('export_print: ' + irId + ' · ' + FMT.label);
  console.log('  page      ' + mm(pageW).toFixed(0) + ' x ' + mm(pageH).toFixed(0) + ' mm · margin ' + mm(margin).toFixed(1) + ' mm');
  console.log('  music     ' + mm(blockW).toFixed(0) + ' x ' + mm(blockH).toFixed(0) + ' mm');
  console.log('  ' + (FRAME.lanes ? FRAME.lanes.length : N) + ' lanes  lane ' + mm(lanePx).toFixed(1) + ' mm  STAFF ' + mm(staffPx).toFixed(2) + ' mm');
  console.log('  reserves  left ' + leftReserve.toFixed(3) + ' s  right ' + rightReserve.toFixed(3) +
    ' s  -> ' + advanceSeconds.toFixed(2) + ' s of music per page   [2b.7]');
  console.log('  ' + pageSeconds.toFixed(2) + ' s/page' + (secArg == null ? '  [default = the video\'s approved density]' : '') +
    ' → ' + pages.length + ' pages for ' + srcEnd + ' s');
  console.log('  frame     ' + (ENS ? FRAME_PARTS.map(p => (ensPart(p) || {}).short || p).join(' · ') + '   buffer ' + bufSec.toFixed(3) + ' s'
    : FRAME_PARTS.length + ' parts, NO ENSEMBLE'));
  if (wantInstructions && INS_REPORT) console.log('  instructions  ' + INS_REPORT + '   images at --w / ' + INS_CSS.frame + ' of the column');
  if (sel.length !== pages.length) {
    const w = viewFor(sel[0]).window;
    console.log('  writing   pages ' + (sel[0] + 1) + '-' + (sel[sel.length - 1] + 1) + ' only (' + sel.length + ')' +
      '   first window ' + w[0].toFixed(2) + '–' + w[1].toFixed(2) + ' s');
  }
}

if (htmlOnly || /\.html?$/i.test(outAbs)) {
  fs.writeFileSync(outAbs, html);
  console.log('wrote ' + path.relative(ROOT, outAbs) + '  (' + (fs.statSync(outAbs).size / 1024).toFixed(0) + ' KB)');
  process.exit(0);
}

const chrome = findChrome();
if (!chrome) {
  const alt = outAbs.replace(/\.pdf$/i, '.html');
  fs.writeFileSync(alt, html);
  console.error('Chrome not found (set CHROME_PATH). Wrote HTML instead: ' + path.relative(ROOT, alt));
  console.error('Open it and print to PDF, or install Chrome and re-run.');
  process.exit(3);
}
const tmpHtml = outAbs.replace(/\.pdf$/i, '') + '.__print.html';
fs.writeFileSync(tmpHtml, html);
const r = spawnSync(chrome, ['--headless', '--disable-gpu', '--no-pdf-header-footer',
  '--print-to-pdf=' + outAbs, 'file:///' + tmpHtml.replace(/\\/g, '/')], { encoding: 'utf8' });
try { fs.unlinkSync(tmpHtml); } catch (e) { }
if (!fs.existsSync(outAbs)) {
  console.error('chrome did not write a pdf');
  console.error((r.stderr || '').split('\n').slice(-6).join('\n'));
  process.exit(1);
}
const frontPages = (wantCover && coverSvg() ? 1 : 0) + (wantInstructions ? (instructionsPages() || []).length : 0);
console.log('wrote ' + path.relative(ROOT, outAbs) + '  (' + (fs.statSync(outAbs).size / 1024 / 1024).toFixed(1) + ' MB, ' +
  (sel.length + frontPages) + ' pages: ' + frontPages + ' front matter + ' + sel.length + ' of music)');
