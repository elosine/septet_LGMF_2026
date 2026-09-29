#!/usr/bin/env node
// THE LOCK ON THE EH'S OPENING FIGURE (RUNNING_LOG §560 — his "let's make sure there's some clamp on that or lock on that so we don't
// lose our decisions here"): every decision of §547 … §560 on the eight notes at 289 … 294 s of piece-lgmf, asserted from the LAYOUT
// (the same call the app and the shield make). Run after ANY change to the notation's look; a red line names the decision that moved.
//   node tools/eh_figure_check.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js')), Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js'));
const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
const glyphs = rd(path.join(ROOT, 'notation', 'lib', 'glyphs.json')), techniques = rd(path.join(ROOT, 'notation', 'registry', 'techniques.json'));
const ENS = Layout.ensembleFor(rd(path.join(ROOT, 'notation', 'registry', 'ensemble.json')), C.realizations['video-jury']), parts = ENS.parts.map(p => p.part);
const ir = rd(path.join(ROOT, 'notation', 'ir', 'piece-lgmf.ir.json'));
const m = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques, fitBoxes: Fit.boxesFor(C, ENS, parts) }, C.engraving.layout));
const s0 = m.systems.find(s => s.part === 0), items = s0.items;
let n = 0, bad = 0;
const ok = (cond, what) => { n++; if (!cond) bad++; console.log((cond ? '   ok  ' : '  FAIL ') + what); };
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 0.02 : tol);
const at = (k, t, pred) => items.find(it => it.k === k && Math.abs((it.t != null ? it.t : it.t0) - t) < 1e-6 && (!pred || pred(it)));
const glyphAt = (t, re) => items.find(it => it.k === 'glyph' && re.test(it.g || '') && Math.abs(it.t - t) < 1e-6);
const P = { p1: 289, p2: 291.385, p3: 291.479, p4: 292.191, p5: 292.79, p6: 293.235, p7: 293.58, p8: 293.815 };
const BT = glyphs.standards.beam.thickness;

console.log('THE EH\'S OPENING FIGURE — the decisions of §547 … §560 (part 0, 289 … 294 s)');
// §547 · §554 · §556 — the plain note: a filled head on its time, a plain stem of a tenth
{ const hd = glyphAt(P.p1, /^notehead$/), st = at('stem', P.p1); ok(hd && near(hd.dxSs - glyphs.notehead.filled.wSs / 2, 0, 0.03), '(§547) p1 a filled head, its left edge on its time'); ok(st && near(Math.abs(st.yB - st.yA), 4.5), '(§556) p1 the plain stem a tenth, 4.5 ss'); }
// §553 · §554 — the flag-clear law with its max
{ const st4 = at('stem', P.p4), fl4 = glyphAt(P.p4, /^flag-down8$/); ok(st4 && fl4 && near(st4.yB + glyphs.flag.down8.hSs, -2 - C.engraving.layout.flagClearanceSs, 0.03), '(§553) p4 flagged eighth, stem down: the flag\'s near edge clears the bottom line by ' + C.engraving.layout.flagClearanceSs); ok(st4 && near(Math.abs(st4.yB - st4.yA), 6.54, 0.05), '(§553) p4 stem 6.54 ss'); const st3 = at('stem', P.p3), fl3 = glyphAt(P.p3, /^flag-up8$/); ok(st3 && fl3 && near(st3.yB - glyphs.flag.up8.hSs, 2 + C.engraving.layout.flagClearanceSs, 0.03), '(§561) p3 flagged eighth one ledger below, stem up: 9.25 just under the max 9.5, its flag clears the top line by ' + C.engraving.layout.flagClearanceSs); }
// §550 — the grace and its slash
{ const hd = glyphAt(P.p2, /^notehead$/), fl = glyphAt(P.p2, /^flag-up8$/), sl = at('slash', P.p2), acc = glyphAt(P.p2, /^accidental-sharp$/); ok(hd && near(hd.scale || 1, C.engraving.layout.grace.headScale, 0.001), '(§550) the grace head at ' + C.engraving.layout.grace.headScale); ok(fl && near(fl.scale || 1, C.engraving.layout.grace.headScale, 0.001) && sl, '(§550) the grace flag scaled, the slash on it'); ok(acc && near(acc.scale || 1, C.engraving.layout.grace.headScale, 0.001), '(§550) the grace\'s sharp at the grace scale'); }
// §555 — the slur standard
{ const sl = items.find(it => it.k === 'slur' && Math.abs(it.t0 - P.p2) < 1e-6); ok(sl && sl.dir === 'below' && Math.abs(sl.t1 - P.p3) < 1e-6, '(§555) the grace\'s slur to p3, below (both stems up)'); ok(sl && near(sl.heightSs, 0.48, 0.03) && near(sl.thickSs, 0.12, 1e-6) && near(sl.endThickSs, 0.08, 1e-6), '(§555) its height a quarter of its length (0.48), tapered 0.12 → 0.08'); }
// §560 — the slur in the vertical clearance
{ const sl = items.find(it => it.k === 'slur'), ac = glyphAt(P.p3, /^artic-accent$/); ok(sl && ac && (sl.y1Ss - (ac.ySs + glyphs.articulation.accent.hSs / 2)) >= 0.8 - 0.01, '(§560) p3\'s accent clears the slur by free-slur-distance 0.8'); }
// §557 · §558 · §559 — the uneven-group sign
{ const stubs = [P.p5, P.p6, P.p7, P.p8].map(t => at('stem', t)); const bm = items.filter(it => it.k === 'beam' && it.tips && it.tips.some(p => Math.abs(p.t - P.p5) < 1e-6)); const ys = bm.map(b => b.tips[0].ySs); const inner = Math.max(...ys) + BT / 2;
  ok(stubs.every(Boolean) && bm.length === 2, '(§557) the four stubs and a two-level beam (16th speed)');
  ok(stubs.every(st => st && near(st.yA, inner + C.engraving.layout.groupStub.protrudeSs, 0.02)), '(§559) the stubs protrude ' + C.engraving.layout.groupStub.protrudeSs + ' ss beyond the beam stack');
  const h5 = glyphAt(P.p5, /^notehead$/), h8 = glyphAt(P.p8, /^notehead$/), hw = glyphs.notehead.filled.wSs / 2;
  ok(stubs[0] && h5 && near(stubs[0].dxSs, h5.dxSs - hw) && stubs[3] && h8 && near(stubs[3].dxSs, h8.dxSs + hw), '(§558) the first stub at the first head\'s left edge, the last at the last head\'s right edge');
  ok(bm.every(b => near(b.tips[0].dxSs, stubs[0].dxSs) && near(b.tips[b.tips.length - 1].dxSs, stubs[3].dxSs)), '(§558) the beam\'s ends with them');
  [P.p5, P.p6, P.p7, P.p8].forEach((t, i) => { const hd = glyphAt(t, /^notehead$/), st = stubs[i]; ok(hd && st && Math.abs(hd.ySs - st.yA) > glyphs.notehead.filled.hSs / 2, '(§557) the stub of note ' + (i + 5) + ' never reaches its head (its tip beyond the head\'s edge)'); });
  const sq = at('squiggle', P.p5); ok(sq && sq.y0Ss > sq.y1Ss && near(sq.dx1Ss - sq.dx0Ss, 2 * C.engraving.layout.groupStub.squiggleReachSs) && sq.hand, '(§559) the stroke falls to the right, ' + (2 * C.engraving.layout.groupStub.squiggleReachSs) + ' ss long, hand-drawn'); const outer = Math.min(...ys) - BT / 2, kIn = C.engraving.layout.groupStub.squiggleInsetSs / Math.SQRT2; ok(sq && near((sq.y0Ss + sq.y1Ss) / 2, (inner + outer) / 2 + kIn, 0.02) && near((sq.dx0Ss + sq.dx1Ss) / 2, stubs[0].dxSs + kIn, 0.02), '(§562) the stroke centred on the beam stack at the first stub, slid ' + C.engraving.layout.groupStub.squiggleInsetSs + ' ss along its perpendicular toward the heads'); }
// §559 — the second layer's hands
{ const r = items.find(it => it.k === 'rest'); ok(r && r.dur === 4 && near(r.t, 290.2, 1e-6), '(§559) a quarter rest at 290.2');
  const names = [P.p1, P.p2, P.p3, P.p4, P.p5, P.p6, P.p7, P.p8].map(t => { const g = glyphAt(t, /^dyn-/); return g ? g.g.replace('dyn-', '') : '-'; }).join(' ');
  ok(names === 'pp f - - mp - - -', '(§559) the names: pp · f (the grace) · mp on p5, nothing else — got: ' + names);
  ok(glyphAt(P.p3, /^artic-accent$/) && glyphAt(P.p6, /^artic-accent$/) && !glyphAt(P.p4, /^artic-/), '(§559) accents on p3 and p6 only');
  const a6 = glyphAt(P.p6, /^artic-accent$/), h6 = glyphAt(P.p6, /^notehead$/); ok(a6 && h6 && a6.ySs > h6.ySs, '(§559) p6\'s accent on the head side, above');
  const tx = items.find(it => it.k === 'text' && it.seq === 'instruction' && Math.abs(it.t - P.p1) < 1e-6), st1 = at('stem', P.p1); ok(tx && st1 && near(tx.ySs, Math.max(3, st1.yB + C.engraving.layout.instructionAbove.gapSs), 0.02), '(§561) the section\'s "ord." ' + C.engraving.layout.instructionAbove.gapSs + ' ss above p1\'s top ink');
  const hp = items.find(it => it.k === 'hairpin-timed' && Math.abs(it.t0 - P.p1) < 1e-6); ok(hp && near(hp.t1, 289.25, 1e-6) && hp.dir === 'cresc' && near(hp.ySs, -4.6, 0.01), '(§559) p1\'s crescendo hairpin on the dynamic row to 289.25'); }
console.log(bad ? ('\nEH FIGURE: ' + bad + ' of ' + n + ' decisions MOVED') : ('\nEH FIGURE GREEN: ' + n + ' decisions hold'));
process.exit(bad ? 1 : 0);
