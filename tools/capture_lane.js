#!/usr/bin/env node
// capture_lane.js — render ONE part's lane at one instant as a standalone SVG,
// for the Performance Instructions images (docs/notation_instructions/).
//
// Ported from piece #4's tools/capture_lane.js (day 40, v3.2) on 2026-09-16
// (session 14, RUNNING_LOG §566). The tuba's rule kept: render THE FRAME ITSELF
// — the exact geometry the composer approves in the app and the video — and
// then CROP the SVG to the requested lane and time span via the viewBox.
// Nothing is re-scaled by hand, so the image cannot look different from the app.
// The septet's differences, all taken from export_video.js (PLAN 2i.10.1, §558):
// the REALIZED ensemble (video-jury: the bass clarinet in C on a bass clef —
// the presentation form the instructions accompany), the techniques registry,
// lanes WEIGHTED by the ensemble with the piano's two staves, and the zoom
// geometry from Coords.zoomCfg (the app's own) rather than a hand-made one.
//
//   node tools/capture_lane.js --part vn1 --t 20.34 --span 20.05-20.95 \
//        --out docs/notation_instructions/images/x.svg [--zoom 2] [--ir piece-septet]
//
//   --part   an index 0–6 or a name: fl bcl pno vn1 vn2 va vc
//   --toPart crop a contiguous RANGE of lanes, --part through --toPart
//            (multi-lane shots); default = the single --part lane
//   --span   the time range the image shows (the crop)
//   --t      the instant of the animated layer (cursor, balls, meters)
//   --zoom   Z, the app's zoom factor (default: the registry's zoom-working, 2).
//            The render window is the zoom window centred on the span; a span
//            wider than that window lowers Z until the span fits.
//   --keepNeighbors  draw the other lanes too (default: only the target lanes
//            are drawn; the geometry keeps all seven, so nothing moves)
//   --onlyOnsets a-b  draw ONLY the events whose onset lies in [a, b] (every part) — the rest of the IR is dropped
//            before layout, so a neighbour's notation or GC arc cannot leak into the crop (session 15, RUNNING_LOG §592)
//   --padTop / --padBot  px of headroom above / below the lane in the crop
//            (30 / 6: GC arc apexes legitimately overflow the lane band)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Coords = require(path.join(ROOT, 'notation', 'lib', 'coords.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const AnimObj = require(path.join(ROOT, 'notation', 'lib', 'animobj.js'));
const StaticPage = require(path.join(ROOT, 'notation', 'lib', 'static_page.js'));

const arg = (name, dflt) => {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : dflt;
};
const NAMES = ['fl', 'bcl', 'pno', 'vn1', 'vn2', 'va', 'vc'];
const partArg = v => { const i = NAMES.indexOf(String(v).toLowerCase()); return i >= 0 ? i : parseInt(v, 10); };
const part = partArg(arg('part', '0'));
const toPart = partArg(arg('toPart', String(part)));
const t = parseFloat(arg('t', '0'));
const [s0, s1] = arg('span', '0-10').split('-').map(Number);
const irId = arg('ir', 'piece-septet');
const out = arg('out', null);
if (!out) { console.error('capture_lane: --out is required'); process.exit(1); }

const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const C = rd('notation/registry/container.json');
const glyphs = rd('notation/lib/glyphs.json');
const ens = rd('notation/registry/ensemble.json');
const T = rd('notation/registry/techniques.json');
const ir = rd(path.join('notation', 'ir', irId + '.ir.json'));
// [§592] --onlyOnsets: keep the events with onset in [a, b]; their chunks, engraving overlays, and the span / t overlays that touch the range
const onlyArg = arg('onlyOnsets', null);
if (onlyArg) {
  const [oa, ob] = onlyArg.split('-').map(Number);
  const keep = new Set(ir.events.filter(e => e.onset >= oa - 1e-6 && e.onset <= ob + 1e-6).map(e => e.id));
  ir.events = ir.events.filter(e => keep.has(e.id));
  ir.chunks = (ir.chunks || []).map(c => Object.assign({}, c, { events: c.events.filter(id => keep.has(id)) })).filter(c => c.events.length);
  ir.overlays = (ir.overlays || []).filter(o => {
    const t = o.target || {};
    if (t.event != null) return keep.has(t.event);
    if (Array.isArray(t.span)) return t.span[1] >= oa && t.span[0] <= ob;
    if (t.t != null) return t.t >= oa - 1e-6 && t.t <= ob + 1e-6;
    return true;
  });
  console.log('onlyOnsets ' + oa + '-' + ob + ': ' + ir.events.length + ' events kept');
}
let score = null;
try { score = rd(path.join('scores', ir.source.score + '.json')); } catch (e) { score = null; }

// ---- THE SEPTET FRAME, exactly as export_video.js builds it ----
const ENS = Layout.ensembleFor(ens, (C.realizations || {})['video-jury']);
const ensPart = p => (ENS && ENS.parts.find(q => q.part === p)) || null;
const FRAME_PARTS = ENS ? ENS.parts.map(p => p.part) : ir.source.parts.slice();
const model = Layout.layoutSection(ir, glyphs, Object.assign(
  { m4AttackLines: false, frameParts: FRAME_PARTS, ensemble: ENS, techniques: T },
  (C.engraving && C.engraving.layout) || {}));

const rz = (C.realizations || {})['video-jury'] || {};
const lanes = rz.lanes || { padTopPx: 8, padBotPx: 8, gapPx: 4 };
const W = (C.frame && C.frame.widthPx) || 1920;
const H = (C.frame && C.frame.heightPx) || 1080;
const pageSeconds = (C.timeScale && C.timeScale.defaults && C.timeScale.defaults.trance) || 12;
let topPad = lanes.padTopPx / H, botPad = lanes.padBotPx / H;
const gap = lanes.gapPx / H;
const weights = ENS ? FRAME_PARTS.map(p => (ensPart(p) && ensPart(p).weight) || 1) : lanes.weights;
const units = ENS ? weights.reduce((a, b) => a + b, 0) : FRAME_PARTS.length;
let lanePx = ((1 - topPad - botPad - gap * (FRAME_PARTS.length - 1)) / units) * H;
if (lanes.sparseCapPx && lanePx > lanes.sparseCapPx) {
  lanePx = lanes.sparseCapPx;
  const content = (lanePx * units + lanes.gapPx * (FRAME_PARTS.length - 1)) / H;
  topPad = botPad = Math.max(0, (1 - content) / 2);
}
let systems = Coords.systemsForParts(FRAME_PARTS, { topPad, botPad, gap, weights });
const ssPerSystem = lanePx / (((C.staff && C.staff.staffHeightPx) || 31.6) / 4);
if (ENS) {
  systems.forEach((s, i) => { s.ssPerSystem = ssPerSystem * weights[i]; });
  const gs = ((C.engraving || {}).layout || {}).grandStaff;
  systems = Coords.withStaves(systems, p => (ensPart(p) && ensPart(p).staves && ensPart(p).staves.length) || 1,
    gs && gs.interStaffGapSs > 0 ? { interStaffGapSs: gs.interStaffGapSs } : undefined);
}
const gutterPx = (C.prefatory && C.prefatory.gutterPx) || 0;

// ---- the window: the app's zoom window (Coords.zoomCfg), centred on the span ----
const zoomDefault = ((C.realizations || {})['zoom-working'] || {}).zoomZ || 2;
let Z = parseFloat(arg('zoom', String(zoomDefault)));
const baseCfg = { widthPx: W, heightPx: H, window: [0, pageSeconds], gutterPx, systems, ssPerSystem };
const basePps = (W - gutterPx) / pageSeconds;
const spanOf = z => (W - z * gutterPx) / (z * basePps);
if (s1 - s0 > spanOf(Z)) Z = W / (basePps * (s1 - s0) + gutterPx);   // the wide span wins: Z drops until it fits
const winSpan = spanOf(Z);
const mid = (s0 + s1) / 2;
const w0 = mid - winSpan / 2;
const cfg = Coords.zoomCfg(baseCfg, Z, w0);

const iA = FRAME_PARTS.indexOf(part), iB = FRAME_PARTS.indexOf(toPart);
if (iA < 0 || iB < 0) { console.error('capture_lane: unknown part ' + arg('part') + ' / ' + arg('toPart')); process.exit(1); }
const KEEP = new Set(FRAME_PARTS.slice(Math.min(iA, iB), Math.max(iA, iB) + 1));
const ONLY = process.argv.indexOf('--keepNeighbors') < 0;
if (ONLY && Array.isArray(model.systems)) model.systems = model.systems.filter(sy => KEEP.has(sy.part));
const view = Coords.makeView(cfg);

// ---- static page (the shared module: the labels, brackets and brace sit in the gutter, outside the crop) ----
let svg = StaticPage.staticPageSvg({
  model, view, glyphs, C, ensemble: ENS,
  srcEnd: ir.source.window[1], ownsEnd: false, edgeBar: false,
});

// ---- the animated layer at instant t — the exporter's wiring verbatim ----
const dev = Layout.deviceResolver(ir, (C.engraving || {}).layout || {});
const inst = AnimObj.collect(ir, score, C.animated, {
  parts: FRAME_PARTS, meta: false,
  deviceOf: dev, drawnOf: e => Layout.drawnLevelSamples(e, dev(e) || {}),
}).filter(i => i.part === undefined || FRAME_PARTS.includes(i.part));
const overlay = AnimObj.frameSvg(ONLY ? inst.filter(i => i.part === undefined || KEEP.has(i.part)) : inst, view, t, C.animated);
svg = svg.replace('</svg>', '<g class="anim">' + overlay + '</g></svg>');

// ---- crop to the lane + span, via the viewBox — no rescaling ----
const sysA = view.system(part), sysB = view.system(toPart);
const padTop = parseFloat(arg('padTop', '30'));
const padBot = parseFloat(arg('padBot', '6'));
const yTop = Math.min(sysA.yTopPx, sysB.yTopPx), yBot = Math.max(sysA.yBotPx, sysB.yBotPx);
const y0 = yTop - padTop, hCrop = (yBot - yTop) + padTop + padBot;
const x0 = view.xOfSeconds(s0), x1 = view.xOfSeconds(s1);
const wCrop = x1 - x0;
svg = svg
  .replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" width="' + wCrop.toFixed(0) +
    '" height="' + hCrop.toFixed(0) + '" viewBox="' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' +
    wCrop.toFixed(1) + ' ' + hCrop.toFixed(1) + '">' +
    '<rect x="' + x0.toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + wCrop.toFixed(1) +
    '" height="' + hCrop.toFixed(1) + '" fill="#fff"/>');

fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
fs.writeFileSync(path.join(ROOT, out), svg);
console.log('wrote ' + out + '  (' + svg.length + ' bytes · ' + NAMES[part] +
  (toPart !== part ? '-' + NAMES[toPart] : '') + ' @ ' + t +
  ' s · span ' + s0 + '-' + s1 + ' · Z ' + Z.toFixed(2) + ' · window ' + cfg.window[0].toFixed(2) + '-' + cfg.window[1].toFixed(2) +
  ' · crop ' + wCrop.toFixed(0) + 'x' + hCrop.toFixed(0) + ')');
