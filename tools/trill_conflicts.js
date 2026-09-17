#!/usr/bin/env node
// trill_conflicts.js — RUNNING_LOG §452 (2026-09-13). Where a trill column's ink meets (a) another note's ink or (b) a GC arc in
// its own lane, measured in PIXELS on the video frame (1920 × 1080, 12 s pages, the app's lane math — test_trills 2f.4 /
// notation.html). Report-only, like protrusion_detect: it files nothing and fixes nothing.
//
//   node tools/trill_conflicts.js [<ir-id>] [--list] [--left]
//
//   <ir-id>   default piece-lgmf (the MAIN file, D41)
//   --list    one line per trill that meets something: its time, part, and each pair (← the other note is before it, → after)
//   --left    lay the trills out LEFT of the go line (the pre-§452 rule) to compare
//
// What is measured: the trill column's glyphs (head · accidental · parens · neighbour head · tr · sfz), ledgers and ottava sign as
// bounding boxes, against every other note's glyphs, ledgers, ottava signs and stems within 1 s in the same part, and against every GC
// arc (gc.js trajectory, its own lane geometry, the stroke's half width) within 1 s. Bounding boxes are conservative: an arc through a
// glyph's empty corner counts. Text items (instructions) are not boxed.
// §452 numbers: left of the go line 28 of 69 trills met something (ink × ink 9, × GC arc 27); right of it 3 (ink × ink 0, × arc 3).
const path = require('path');
const ROOT = path.join(__dirname, '..');
const J = p => require(path.join(ROOT, p));
const L = n => require(path.join(ROOT, 'notation/lib', n));
const Layout = L('layout.js'), Coords = L('coords.js'), GC = L('gc.js');
const glyphs = J('notation/lib/glyphs.json');
const IR_ID = process.argv.slice(2).find(a => !a.startsWith('--')) || 'piece-lgmf';
const ir = JSON.parse(JSON.stringify(J('notation/ir/' + IR_ID + '.ir.json')));
const ens = J('notation/registry/ensemble.json'), tech = J('notation/registry/techniques.json');
const C = JSON.parse(JSON.stringify(J('notation/registry/container.json')));
const LEFT = process.argv.includes('--left'), LIST = process.argv.includes('--list');
if (LEFT) delete C.engraving.layout.devices.byEnv.trill.nhAnchor;
const parts = ens.parts.map(p => p.part);
const model = Layout.layoutSection(ir, glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, C.engraving.layout));

// the app's lane math (test_trills 2f.4 / notation.html)
const W = 1920, H = 1080, lanes = C.realizations['video-jury'].lanes;
const topPad = lanes.padTopPx / H, botPad = lanes.padBotPx / H, gap = lanes.gapPx / H;
const weights = parts.map(p => ens.parts.find(q => q.part === p).weight || 1);
const unit = ((1 - topPad - botPad - gap * (parts.length - 1)) / weights.reduce((a, b) => a + b, 0)) * H;
let systems = Coords.systemsForParts(parts, { topPad, botPad, gap, weights });
const ssPer = unit / (C.staff.staffHeightPx / 4);
systems.forEach((s, i) => { s.ssPerSystem = ssPer * weights[i]; });
systems = Coords.withStaves(systems, p => { const e = ens.parts.find(q => q.part === p); return (e.staves && e.staves.length) || 1; });
const pageSec = (C.timeScale && C.timeScale.defaults && C.timeScale.defaults.trance) || 12;
const viewAt = t => Coords.makeView({ widthPx: W, heightPx: H, window: [t - pageSec / 2, t + pageSec / 2], gutterPx: C.prefatory.gutterPx, systems, ssPerSystem: ssPer });

const O = glyphs.standards.ottava, LF = glyphs.standards.ledgerLine.lengthFraction;
const G = n => n === 'notehead-open' ? glyphs.notehead.open : n === 'notehead' ? glyphs.notehead.filled : n.startsWith('accidental-') ? glyphs.accidental[n.slice(11)]
  : n.startsWith('artic-') ? glyphs.articulation[n.slice(6)] : n.startsWith('dyn-') ? glyphs.dynamic[n.slice(4)] : null;
function box(i, view, sys) {
  const s = sys.ssPx, X = (t, dx) => view.xOfSeconds(t) + (dx || 0) * s, Y = ss => sys.yOfSs(ss);
  if (i.k === 'ledger') { const w = i.wSs * (1 + 2 * LF); return { n: 'ledger', l: X(i.t, i.dxSs - w / 2), r: X(i.t, i.dxSs + w / 2), u: Y(i.ySs) - 0.6, b: Y(i.ySs) + 0.6 }; }
  if (i.k === 'ottava') {
    const lg = glyphs.ottavaText[i.label], lgW = lg ? lg.wSs + (O.textGapBeforeLineSs || 0.1) : 0;
    let a = i.dx0Ss; if (i.dx1Ss - (a + lgW) < (O.minBracketSpanSs || 1.37)) a = i.dx1Ss - (O.minBracketSpanSs || 1.37) - lgW;
    return { n: 'ottava', l: X(i.t, a), r: X(i.t, i.dx1Ss), u: Y(i.ySs) - 0.6 * s, b: Y(i.ySs) + 0.6 * s };
  }
  if (i.k === 'stem') return { n: 'stem', l: X(i.t, i.dxSs) - 0.5, r: X(i.t, i.dxSs) + 0.5, u: Math.min(Y(i.yA), Y(i.yB)), b: Math.max(Y(i.yA), Y(i.yB)) };
  if (i.k !== 'glyph') return null;
  const g = G(i.g); if (!g) return null;
  const k = (i.scale || 1) * s, a = (i.align && g.anchors && g.anchors[i.align]) || { x: g.wSs / 2, y: g.hSs / 2 };
  const l = X(i.t, i.dxSs) - a.x * k, u = Y(i.ySs) - a.y * k;
  return { n: i.g, l, r: l + g.wSs * k, u, b: u + g.hSs * k };
}
const short = n => n.replace(/^(accidental|artic|dyn)-/, '').replace('notehead-open', 'head').replace('notehead', 'head');
const trills = ir.events.filter(e => e.env === 'trill').sort((a, b) => a.onset - b.onset);
const rows = [];
for (const e of trills) {
  const view = viewAt(e.onset);
  const partOf = key => +String(key).split(':')[0];
  const mySys = model.systems.find(s => s.items.some(i => i.k === 'envcurve' && i.ev === e.id));
  const part = partOf(mySys.key != null ? mySys.key : mySys.part);
  const laneSystems = model.systems.filter(s => partOf(s.key != null ? s.key : s.part) === part);
  const mine = [], others = [], arcs = [];
  for (const s of laneSystems) {
    const vs = view.system(s.key != null ? s.key : s.part);
    for (const i of s.items) {
      if (i.t == null) continue;
      if (Math.abs(i.t - e.onset) < 1e-9) { const b = box(i, view, vs); if (b) mine.push(b); continue; }
      if (Math.abs(i.t - e.onset) > 1.0) continue;
      if (i.k === 'gc') {
        const P = GC.params(Object.assign({}, (C.engraving.render.gc && C.engraving.render.gc.preset) || {}, i.preset || {}));
        const Gm = GC.laneGeom(GC.systemOf(view, part), view, C.engraving.render.gc && C.engraving.render.gc.look);
        arcs.push({ t: i.t, pts: GC.trajectory(P).map(p => [view.xOfSeconds(i.t + p.dt), Gm.impactY - p.frac * Gm.h]), half: (Gm.look.arcStrokePx * Gm.k) / 2 });
      } else { const b = box(i, view, vs); if (b) others.push([i, b]); }
    }
  }
  const pairs = new Set();
  for (const m of mine) {
    for (const [oi, o] of others) if (m.l < o.r && o.l < m.r && m.u < o.b && o.u < m.b) pairs.add(short(m.n) + '×' + short(o.n) + (oi.t < e.onset ? ' ←' : ' →'));
    for (const a of arcs) if (a.pts.some(([x, y]) => x > m.l - a.half && x < m.r + a.half && y > m.u - a.half && y < m.b + a.half)) pairs.add(short(m.n) + '×GC arc' + (a.t < e.onset ? ' ←' : ' →'));
  }
  if (pairs.size) rows.push({ t: e.onset, part, pairs: [...pairs] });
}
const partName = p => (ens.parts.find(q => q.part === p) || {}).abbr || (ens.parts.find(q => q.part === p) || {}).name || p;
const ink = rows.filter(r => r.pairs.some(p => !/GC arc/.test(p))).length, arc = rows.filter(r => r.pairs.some(p => /GC arc/.test(p))).length;
console.log(IR_ID + ' · the trill column ' + (LEFT ? 'LEFT' : (C.engraving.layout.devices.byEnv.trill.nhAnchor === 'afterGo' ? 'RIGHT' : 'LEFT')) + ' of the go line · trills meeting ink or an arc: ' + rows.length + ' of ' + trills.length + ' · ink × ink: ' + ink + ' · × GC arc: ' + arc);
if (LIST) for (const r of rows) console.log('  ' + r.t.toFixed(2) + ' s  ' + partName(r.part) + '  ' + r.pairs.join(', '));
