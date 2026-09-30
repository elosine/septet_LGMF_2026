#!/usr/bin/env node
// THE LOCK ON THE EH'S OPENING FIGURE (RUNNING_LOG §560 — his "let's make sure there's some clamp on that or lock on that so we don't
// lose our decisions here"): every decision of §547 … §573 on the first two figures at 289 … 298 s of piece-lgmf (§573: the second figure's values), asserted from the LAYOUT
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
  ok(names === 'pp mf - - mp - - -', '(§559 · §573) the names: pp · mf on the grace (his §573, f before) · mp on p5, nothing else — got: ' + names);
  ok(glyphAt(P.p3, /^artic-accent$/) && glyphAt(P.p6, /^artic-accent$/) && !glyphAt(P.p4, /^artic-/), '(§559) accents on p3 and p6 only');
  const a6 = glyphAt(P.p6, /^artic-accent$/), h6 = glyphAt(P.p6, /^notehead$/); ok(a6 && h6 && a6.ySs > h6.ySs, '(§559) p6\'s accent on the head side, above');
  const tx = items.find(it => it.k === 'text' && it.seq === 'instruction' && Math.abs(it.t - P.p1) < 1e-6), st1 = at('stem', P.p1); ok(tx && st1 && near(tx.ySs, Math.max(3, st1.yB + C.engraving.layout.instructionAbove.gapSs), 0.02), '(§561) the section\'s "ord." ' + C.engraving.layout.instructionAbove.gapSs + ' ss above p1\'s top ink');
  const hp = items.find(it => it.k === 'hairpin-timed' && Math.abs(it.t0 - P.p1) < 1e-6); ok(hp && near(hp.t1, 289.25, 1e-6) && hp.dir === 'cresc' && near(hp.ySs, -4.6, 0.01), '(§559) p1\'s crescendo hairpin on the dynamic row to 289.25'); }
// §573 — the second figure's VALUES (his LG-151): 1 + 2 an eighth pair beamed · 3 + 4 an eighth pair beamed · 5 and 6 single flagged
// eighths · mf on 1, on the dynamic row (dynAboveBeam false — the section's names stay on the row) · accents on 2 and 6 on the head side
// (2 sent there by articSide: a beam member hands its accent to the group's beam-side row) · note 3 (A5 sounding, E6 written in F) UNDER
// the ottava threshold on this page — no sign, the auto rule kept
{ const F2 = { n1: 295.456, n2: 295.665, n3: 295.974, n4: 296.315, n5: 296.632, n6: 297.306 }, tOf = it => (it.t != null ? it.t : it.t0);
  const bmAt = t => items.filter(it => it.k === 'beam' && it.tips && it.tips.some(p => Math.abs(p.t - t) < 1e-6));
  const b12 = bmAt(F2.n1), b34 = bmAt(F2.n3);
  ok(b12.length === 1 && b12[0].tips.length === 2 && Math.abs(b12[0].tips[1].t - F2.n2) < 1e-6, '(§573) notes 1 + 2 one beam, one level — an eighth pair');
  ok(b34.length === 1 && b34[0].tips.length === 2 && Math.abs(b34[0].tips[1].t - F2.n4) < 1e-6, '(§573) notes 3 + 4 one beam, one level — an eighth pair');
  const s = [F2.n1, F2.n2, F2.n3, F2.n4].map(t => at('stem', t));
  ok(s.every(Boolean) && near(s[0].yB, s[1].yB, 1e-6) && near(s[2].yB, s[3].yB, 1e-6), '(§573) each pair\'s stems reach one beam');
  [F2.n5, F2.n6].forEach((t, i) => { const st = at('stem', t), fl = glyphAt(t, /^flag-(up|down)8$/); ok(st && fl && !bmAt(t).length, '(§573) note ' + (i + 5) + ' a single flagged eighth'); });
  const names = Object.values(F2).map(t => { const g = glyphAt(t, /^dyn-/); return g ? g.g.replace('dyn-', '') : '-'; }).join(' ');
  ok(names === 'mf - - - - -', '(§573) mf on note 1 alone — got: ' + names);
  const mf = glyphAt(F2.n1, /^dyn-mf$/); ok(mf && near(mf.ySs, -4.6, 0.01), '(§573) the mf on the dynamic row (−4.6), not above the beam');
  ok(glyphAt(F2.n2, /^artic-accent$/) && glyphAt(F2.n6, /^artic-accent$/) && [F2.n1, F2.n3, F2.n4, F2.n5].every(t => !glyphAt(t, /^artic-/)), '(§573) accents on notes 2 and 6 only');
  [[F2.n2, 2], [F2.n6, 6]].forEach(([t, k]) => { const a = glyphAt(t, /^artic-accent$/), h = glyphAt(t, /^notehead$/), st = at('stem', t), up = st && st.yB > st.yA; ok(a && h && st && (up ? a.ySs < h.ySs : a.ySs > h.ySs), '(§573) note ' + k + '\'s accent on the head side (stem ' + (up ? 'up → below' : 'down → above') + ')'); });
  ok(!items.some(it => it.k === 'ottava' && tOf(it) >= 289 && tOf(it) <= 303), '(§573) no ottava on the EH 289 … 303 on this page — note 3 (A5 sounding) under the threshold, the auto rule kept'); }
// §574 — the four at 301.556 (his LG-152): beamed together as 16ths · ff on the first with a decrescendo hairpin over the rest · staccato
// dots on all four · a GC on the first whose impact is the head's LEFT EDGE (the go time — nhAnchor leftEdge), no go line
{ const F4 = [301.556, 301.742, 301.917, 302.106], hw = glyphs.notehead.filled.wSs / 2;
  const bm = items.filter(it => it.k === 'beam' && it.tips && it.tips.some(p => Math.abs(p.t - F4[0]) < 1e-6));
  ok(bm.length === 2 && bm.every(b => b.tips.length === 4), '(§574) the four beamed together, two levels — 16ths');
  const st = F4.map(t => at('stem', t)); ok(st.every(Boolean) && st.every(s => near(s.yB, st[0].yB, 1e-6)), '(§574) the four stems reach one beam');
  F4.forEach((t, i) => { const d = at('dot', t), h = glyphAt(t, /^notehead$/), s = st[i], up = s && s.yB > s.yA;
    const lines = [-2, -1, 0, 1, 2].concat(items.filter(x => x.k === 'ledger' && Math.abs(x.t - t) < 1e-9).map(x => x.ySs));   // check_rules (5)'s criterion
    ok(d && h && (up ? d.ySs < h.ySs - 0.4 : d.ySs > h.ySs + 0.4) && !lines.some(L => Math.abs(d.ySs - L) < 0.25 - 1e-9), '(§574) note ' + (i + 1) + '\'s staccato dot on the head side, clear of every line (y ' + (d ? d.ySs.toFixed(2) : '-') + ')'); });
  const names = F4.map(t => { const g = glyphAt(t, /^dyn-/); return g ? g.g.replace('dyn-', '') : '-'; }).join(' ');
  ok(names === 'ff - - -', '(§574) ff on the first alone — got: ' + names);
  const ff = glyphAt(F4[0], /^dyn-ff$/); ok(ff && near(ff.ySs, -4.6, 0.01), '(§574) the ff on the dynamic row');
  const hp = items.find(it => it.k === 'hairpin-timed' && Math.abs(it.t0 - F4[0]) < 1e-6); ok(hp && hp.dir === 'decresc' && near(hp.t1, 302.17, 1e-6) && near(hp.ySs, -4.6, 0.01), '(§574) a decrescendo hairpin on the row from the ff over the rest, to 302.17');
  ok(F4.every(t => !glyphAt(t, /^artic-/)), '(§574) no accents on the four');
  ok(!items.some(it => it.k === 'gc' && F4.some(t => Math.abs(it.t - t) < 1e-6)), '(§583) no GC on the four — removed at his word (the first note carried one, §574)');
  ok(!items.some(it => it.k === 'goline' && F4.some(t => Math.abs((it.t != null ? it.t : it.t0) - t) < 1e-6)), '(§574) no go line on the four');
  const h1 = glyphAt(F4[0], /^notehead$/); ok(h1 && near(h1.dxSs - hw, 0, 0.03), '(§574) the first head\'s LEFT EDGE on its time — the GC\'s impact point (nhAnchor leftEdge)'); }
// §564 · §565 · §566 — the beat grid he picked for the second figure: a 16th of 0.108 from 295.348, the beat every 3, over 295.348 … 297.4;
// his template: the beats only, each a line through the staff overhanging 0.4 ss, the duration line's colour and opacity (the render's)
{ const ticks = items.filter(it => it.k === 'tick' && it.grid && it.t >= 293 && it.t <= 298); const beats = ticks.filter(it => it.grid === 'beat');   // [§575] the window ends before the third figure's frame (298.133 …)
  const OV = C.engraving.layout.beatGrid.overhangSs;
  ok(ticks.length === 6 && beats.length === 6 && near(beats[0].t, 294.538, 1e-6) && near(beats[5].t, 297.778, 1e-6) && near(beats[1].t - beats[0].t, 0.648, 1e-6) && beats.every(b => near(b.ySs, -2 - OV, 1e-6) && near(b.hSs, 4 + 2 * OV, 1e-6)),
    '(§564 … §569) the second figure\'s beat grid: ONE LINE PER BEAT at 93 bpm (6 units = 0.648 s), 6 lines 294.538 … 297.778 — the phase a quarter beat EARLIER than the on-beat one (§571: every note between beats), one line before the figure, one after, each a line through the staff overhanging ' + OV + ' ss');
  const AnimObj = require(path.join(ROOT, 'notation', 'lib', 'animobj.js'));
  let balls = null; try { balls = AnimObj.collect(ir, { objects: [] }, C.animated, { parts: [0], meta: false }).filter(a => a.kind === 'beatBall' && a.at >= 293 && a.at <= 298); } catch (e) { balls = null; }
  ok(balls && balls.length === 6 && balls.every(b => b.preset && near(b.preset.duration, 0.648, 1e-6)) && beats.every(b => balls.some(x => near(x.at, b.t, 1e-6))), '(§567 · §569) the beat ball: one ball per grid beat (6), each a beat long (0.648), on only over the grid' + (balls ? '' : ' — collect threw'));
  const gapMin = Math.min(...[295.456, 295.665, 295.974, 296.315, 296.632, 297.306].map(t => Math.min(...beats.map(b => Math.abs(b.t - t))))); ok(gapMin >= 0.13, '(§571) every note at least 0.13 s from any beat — between the beats, none just before or after (nearest ' + Math.round(gapMin * 1000) + ' ms)'); }
// §575 — THE THIRD FIGURE'S BEAT FRAME (his pick, LG-153: "lets try the purple 86, tools phase is fine"): the tool's (D) candidate at 86 bpm —
// 6 × 0.1165 = 0.699 s on the phase 298.133 (notes 1 · 2 free of the objective, S15), fitted to the seven notes 298.815 … 300.695 by the
// frame's clamps; the template figure 2's (S13)
// §576 — his second pick, "lets try 90 orange machine phase": the orange candidate, 6 × 0.111 = 0.666 s on the tool's phase 298.216
// §579 — his third, "lets try c 86 purple and move 1/4 beat to the right so that p2 is ~onbeat and p6 ~onbeat": 6 × 0.1165 = 0.699 s on
// 298.133 + a quarter beat = 298.308 — notes 2 and 6 each ≈ 60 ms before a line, the others between
// §580 — his "so lets move those 61 ms over to be on beat": the phase 298.247 — notes 2 and 6 ON their lines (1 ms), the rest between
{ const beat = 6 * 0.1165, ph = 298.247, g = items.filter(it => it.k === 'tick' && it.grid === 'beat' && it.t >= 298 && it.t <= 302);   // [§582] the window takes the kept tail (301.742)
  const ref = items.find(it => it.k === 'tick' && it.grid === 'beat' && it.t > 294 && it.t < 298);
  ok(g.length >= 4 && g.every(b => near((b.t - ph) / beat - Math.round((b.t - ph) / beat), 0, 1e-3)), '(§580) the third figure\'s grid: one line per beat at 86 bpm (0.699 s) on the phase 298.247 (notes 2 and 6 on their lines) — ' + g.length + ' lines' + (g.length ? ' ' + g[0].t.toFixed(3) + ' … ' + g[g.length - 1].t.toFixed(3) : ''));
  ok(ref && g.every(b => near(b.ySs, ref.ySs, 1e-6) && near(b.hSs, ref.hSs, 1e-6)), '(§575) each line the beat frame\'s (figure 2\'s geometry through the staff)');
  const GW = C.engraving.layout.beatGrid.wSs; ok(GW === 0.3 && g.every(b => near(b.wSs, GW, 1e-6)) && ref && near(ref.wSs, GW, 1e-6), '(§581) every frame line a band ' + GW + ' ss wide (a stem hides only its middle) — figure 2\'s and 3\'s alike');
  // [§582] the tail beat KEPT by hand (keepTail — his "one more olive line near where the gc is") sits on the burst's second note, inside the clamp's 0.1 s
  const ovF = (ir.overlays || []).find(o => o.kind === 'beatGrid' && o.value && Math.abs(o.value.phase - ph) < 1e-6), keepT = !!(ovF && ovF.value.fit && ovF.value.fit.keepTail);
  ok(g.length && g[0].t < 298.815 && g[g.length - 1].t > 300.695 && g[0].t > 297.375 + 0.1 - 1e-6 && (keepT ? near(g[g.length - 1].t, 301.742, 1e-3) : g[g.length - 1].t < 301.556 - 0.1 + 1e-6), '(§575 · §582) the frame spans the seven notes, 0.1 s clear of the notation before (ends 297.375)' + (keepT ? '; the tail beat KEPT by hand at 301.742, on the burst\'s second note' : ' and after (301.556)'));
  let balls = null; try { balls = require(path.join(ROOT, 'notation', 'lib', 'animobj.js')).collect(ir, { objects: [] }, C.animated, { parts: [0], meta: false }).filter(a => a.kind === 'beatBall' && a.at >= 298 && a.at <= 302); } catch (e) { balls = null; }
  ok(balls && balls.length === g.length && g.every(b => balls.some(x => near(x.at, b.t, 1e-6))) && balls.every(b => b.preset && near(b.preset.duration, beat, 1e-6)), '(§579) one ball per line, each a beat long (0.699)' + (balls ? '' : ' — collect threw'));
  const near1 = t => g.length ? Math.min(...g.map(b => Math.abs(b.t - t))) : Infinity;
  const on = [298.947, 300.343].map(near1), between = [299.139, 299.418, 300.050, 300.695].map(near1);
  ok(g.length && Math.max(...on) <= 0.005, '(§580) notes 2 and 6 ON their lines, his word (' + on.map(x => Math.round(x * 1000)).join(' · ') + ' ms off)');
  ok(g.length && Math.min(...between) >= 0.11, '(§579) notes 3 · 4 · 5 · 7 between the lines, ≥ 0.11 s from any (nearest ' + (g.length ? Math.round(Math.min(...between) * 1000) : '-') + ' ms)'); }
// §572 — THE BEAT FRAME, named and locked at his word (LG-150): the template every figure takes, asserted from the compiled tables
{ const RR = require(path.join(ROOT, "notation", "lib", "rules.js")).loadRules(ROOT).objects, T = RR.tick, BB = C.animated.beatBall || {}, BG = C.engraving.layout.beatGrid || {};
  ok(T.gridMaxBpm === 100 && T.gridLeadBeats === 1 && T.gridTailBeats === 1 && T.gridClampGapS === 0.1, "(§572) the beat frame: the max 100 bpm, one line before the figure, one after, 0.1 s clear of the neighbours");
  ok(BG.at === "staff" && BG.overhangSs === 0.4 && BG.beatsOnly === true, "(§572) the beat frame: one line per beat, through the staff, 0.4 ss beyond each outer line");
  ok(BB.enabled !== false && BB.land === "lineBottom" && BB.riseSs === 2 && BB.opacity === RR.ringBar.opacity && BB.look && BB.look.ballRadiusPx === 5 && JSON.stringify(BB.preset) === JSON.stringify(C.animated.gc.preset), "(§572) the beat frame ball: the tuba GC ball (its preset, 5 px), the duration line opacity, from 2 ss above the line top to its foot"); }
// §576 — THE SPAN RULE, asserted where it bites: on the WORKING page (the EH in F — his page; stems down at the burst, the marks above) the
// burst's ff and its hairpin sit the standard stack clear above every staccato dot they span; on the video page the row already clears them
{ let good = null, why = '';
  try {
    const ENSW = Layout.ensembleFor(rd(path.join(ROOT, 'notation', 'registry', 'ensemble.json')), null), pw = ENSW.parts.map(p => p.part);
    const mw = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: pw, ensemble: ENSW, techniques, fitBoxes: Fit.boxesFor(C, ENSW, pw) }, C.engraving.layout));
    const iw = mw.systems.find(s => s.part === 0).items;
    const hp = iw.find(it => it.k === 'hairpin-timed' && Math.abs(it.t0 - 301.556) < 1e-6), ff = iw.find(it => it.k === 'glyph' && it.g === 'dyn-ff' && Math.abs(it.t - 301.556) < 1e-6);
    const dots = iw.filter(it => it.k === 'dot' && it.t >= 301.556 - 1e-6 && it.t <= 302.17 + 1e-6);
    const HH = C.engraving.layout.hairpinHand || {}, clear = HH.spanClearSs != null ? HH.spanClearSs : 0.45;
    good = !!(hp && ff && dots.length === 4 && hp.ySs > 0 && dots.every(d => hp.ySs - hp.hSs / 2 >= d.ySs + 0.2 + clear - 0.01) && near(ff.ySs, hp.ySs, 0.01));
    why = hp ? ' (the hairpin at ' + hp.ySs.toFixed(2) + ', the highest dot ' + Math.max(...dots.map(d => d.ySs)).toFixed(2) + ')' : ' (no hairpin found)';
  } catch (e) { good = false; why = ' — the working layout threw: ' + e.message; }
  ok(good, '(§576) THE SPAN RULE on the working page (in F): the burst\'s ff and hairpin, above, clear all four staccato dots by the standard stack, the name at the hairpin\'s height' + why); }
// §577 — THE THIRD FIGURE'S VALUES (his LG-155): 1 + 2 beamed (16ths, S4) with a slur · 3 and 4 single flagged eighths with staccato dots ·
// 5 + 6 beamed (eighths, S4) · 7 a flagged eighth · mf and an accent on 1, no other name until the burst's ff — and THE COLUMN on note 1
// (accent · dynamic · ottava · the slur under them) stacked by THE COLUMN PASS, the system's, never a hand
{ const F3 = { n1: 298.815, n2: 298.947, n3: 299.139, n4: 299.418, n5: 300.050, n6: 300.343, n7: 300.695 };
  const bmAt = t => items.filter(it => it.k === 'beam' && it.tips && it.tips.some(p => Math.abs(p.t - t) < 1e-6));
  const hOf = it => { const key = (it.g || '').replace(/^dyn-/, '').replace(/^artic-/, ''); const G = /^dyn-/.test(it.g || '') ? (glyphs.dynamic || {})[key] : (glyphs.articulation || {})[key]; return (G && G.hSs) || 0.8; };
  ok(bmAt(F3.n1).length === 2 && bmAt(F3.n1).every(b => b.tips.length === 2 && Math.abs(b.tips[1].t - F3.n2) < 1e-6), '(§577) notes 1 + 2 one beam, two levels — 16ths (132 ms apart, S4)');
  ok(bmAt(F3.n5).length === 1 && bmAt(F3.n5)[0].tips.length === 2 && Math.abs(bmAt(F3.n5)[0].tips[1].t - F3.n6) < 1e-6, '(§577) notes 5 + 6 one beam, one level — an eighth pair (293 ms, S4)');
  ok([F3.n3, F3.n4, F3.n7].every(t => at('stem', t) && glyphAt(t, /^flag-(up|down)8$/) && !bmAt(t).length), '(§577) notes 3, 4 and 7 single flagged eighths');
  const sl = items.find(it => it.k === 'slur' && Math.abs(it.t0 - F3.n1) < 1e-6); ok(sl && Math.abs(sl.t1 - F3.n2) < 1e-6 && sl.dir === 'above', '(§577) the slur 1 → 2, above (both stems down)');
  const names = Object.values(F3).map(t => { const g = glyphAt(t, /^dyn-/); return g ? g.g.replace('dyn-', '') : '-'; }).join(' ');
  ok(names === 'mf - - - - - -', '(§577) mf on note 1 alone, nothing else until the burst\'s ff — got: ' + names);
  ok(glyphAt(F3.n1, /^artic-accent$/) && Object.values(F3).slice(1).every(t => !glyphAt(t, /^artic-/)), '(§577) the accent on note 1 only');
  ok(at('dot', F3.n3) && at('dot', F3.n4) && [F3.n1, F3.n2, F3.n5, F3.n6, F3.n7].every(t => !at('dot', t)), '(§577) staccato dots on 3 and 4 only');
  const h1 = glyphAt(F3.n1, /^notehead$/), a1 = glyphAt(F3.n1, /^artic-accent$/), m1 = glyphAt(F3.n1, /^dyn-mf$/);
  ok(h1 && a1 && m1 && a1.ySs > h1.ySs && m1.ySs - hOf(m1) / 2 >= a1.ySs + hOf(a1) / 2 + 0.45 - 0.01, '(§577) THE COLUMN on note 1 (this page): the accent on the head side above, the mf BEYOND it by the standard stack — got accent ' + (a1 ? a1.ySs.toFixed(2) : '-') + ' · mf ' + (m1 ? m1.ySs.toFixed(2) : '-'));
  ok(sl && a1 && a1.ySs - hOf(a1) / 2 >= sl.y0Ss + 0.8 - 0.02, '(§577) the column\'s marks clear the slur by free-slur-distance 0.8');
  // the WORKING page (in F — his page): the same column with the OTTAVA (F♯6 written folds to F♯5 + 8va): accent · mf · the sign's hook, in order
  let w = null, why = '';
  try {
    const ENSW = Layout.ensembleFor(rd(path.join(ROOT, 'notation', 'registry', 'ensemble.json')), null), pw = ENSW.parts.map(p => p.part);
    const mw = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: pw, ensemble: ENSW, techniques, fitBoxes: Fit.boxesFor(C, ENSW, pw) }, C.engraving.layout));
    const iw = mw.systems.find(s => s.part === 0).items, gw = (t, re) => iw.find(it => it.k === 'glyph' && re.test(it.g || '') && Math.abs(it.t - t) < 1e-6);
    const hw = gw(F3.n1, /^notehead$/), aw = gw(F3.n1, /^artic-accent$/), mwf = gw(F3.n1, /^dyn-mf$/), ow = iw.find(it => it.k === 'ottava' && Math.abs(it.t - F3.n1) < 1e-6), sw = iw.find(it => it.k === 'slur' && Math.abs(it.t0 - F3.n1) < 1e-6);
    const hook = 0.8;   // RULES MIRROR (glyphs.json standards.ottava.hookLengthSs)
    // the stack at the unit's LADDER rung: on this page the column (8va · accent · mf) runs 0.01 ss past the lane's top at rung 0, so the
    // ladder takes rung 1 and the stack tightens to 0.3 (ladder.compressStack) — the page is right; the test reads the rung
    const fr = (mw.fit || []).find(u => String(u.key) === '0' && Math.abs(u.t - F3.n1) < 1e-3), rung = fr ? fr.rung : 0;
    const stk = rung ? (((C.engraving.layout.ladder || {}).compressStack) || [0.45, 0.3, 0.2])[rung] : 0.45;
    w = !!(hw && aw && mwf && ow && sw && ow.dir === 'above' && aw.ySs > hw.ySs && mwf.ySs - hOf(mwf) / 2 >= aw.ySs + hOf(aw) / 2 + stk - 0.01 && ow.ySs - hook >= mwf.ySs + hOf(mwf) / 2 + stk - 0.06 && aw.ySs - hOf(aw) / 2 >= sw.y0Ss + 0.8 - 0.02);
    why = ' (rung ' + rung + ', the stack ' + stk + '; accent ' + (aw ? aw.ySs.toFixed(2) : '-') + ' · mf ' + (mwf ? mwf.ySs.toFixed(2) : '-') + ' · the 8va line ' + (ow ? ow.ySs.toFixed(2) : '-') + ')';
  } catch (e) { w = false; why = ' — the working layout threw: ' + e.message; }
  ok(w, '(§577) THE COLUMN on the working page (in F): head → accent → mf → the 8va sign, each the standard stack beyond the last, the slur under them' + why); }
// ---- §589 · §590 THE FIGURE AT 317 (his LG-164 · LG-165): the frame at his pick, the values by hand, the hairpin into a name, the plain notes struck
{ const F4 = { n1: 317.052, n2: 317.164, n3: 317.339, n4: 317.535, n5: 318.367, n6: 318.569, n7: 319.032, n8: 319.503, n9: 320.372, n10: 321.031, n11: 322.090, n12: 323.002 };
  const HPB = 0.45;   // RULES MIRROR (rules.json objects.hairpin.beside)
  const tk = items.filter(it => it.k === 'tick' && it.t >= 316.3 && it.t <= 324);
  ok(tk.length === 11 && near(tk[0].t, 317.048, 1e-3) && near(tk[10].t, 323.663, 1e-3) && tk.every((x, i) => i === 0 || near(x.t - tk[i - 1].t, 0.6615, 0.002)), '(§589) THE FRAME AT 317: eleven lines 317.048 … 323.663, the beat 0.6615 (the red 91 bpm one unit forward) — got ' + tk.length);
  const navy = (items.find(it => it.k === 'tick' && it.t > 294 && it.t < 296) || {}).colour;
  ok(navy && tk.every(x => x.frame === 2 && x.colour === navy && near(x.wSs, 0.3)), '(§589 · S19) the third frame NAVY like the first, the bands 0.3');
  [[F4.n1, 1], [F4.n5, 5], [F4.n7, 7], [F4.n12, 12]].forEach(([t, k]) => ok(tk.some(x => Math.abs(x.t - t) <= 0.0045), '(§589) note ' + k + ' on a line within 4 ms — his pick'));
  { const hd = glyphAt(F4.n1, /^notehead$/), fl = glyphAt(F4.n1, /^flag-up8$/), sl = at('slash', F4.n1), slur = items.find(it => it.k === 'slur' && Math.abs(it.t0 - F4.n1) < 1e-6), mf = glyphAt(F4.n1, /^dyn-mf$/);
    ok(hd && near(hd.scale || 1, C.engraving.layout.grace.headScale, 0.001) && fl && sl && !slur && mf, '(§590) note 1 a GRACE — the head at the grace scale, the slashed flag, NO slur, mf under it'); }
  const beamsBetween = (a, b) => items.filter(it => it.k === 'beam' && it.tips && it.tips.length && Math.abs(it.tips[0].t - a) < 1e-6 && Math.abs(it.tips[it.tips.length - 1].t - b) < 1e-6).length;
  ok(beamsBetween(F4.n2, F4.n3) === 2 && beamsBetween(F4.n5, F4.n6) === 2, '(§590) 2+3 and 5+6 beamed 16ths — two beams each');
  ok(beamsBetween(F4.n7, F4.n8) === 1, '(§590) 7+8 beamed eighths — one beam');
  ok([F4.n2, F4.n3, F4.n5, F4.n6, F4.n7].every(t => !glyphAt(t, /^dyn-/)), '(§590 · S9) no name on 2 · 3 · 5 · 6 · 7');
  { const st = at('stem', F4.n4); ok(st && near(Math.abs(st.yB - st.yA), 4.5) && !glyphAt(F4.n4, /^flag-/) && glyphAt(F4.n4, /^dyn-p$/), '(§590) note 4 a QUARTER — the plain stem 4.5, no flag — p under it'); }
  { const hp = items.find(it => it.k === 'hairpin-timed' && Math.abs(it.t0 - F4.n7) < 1e-6), f8 = glyphAt(F4.n8, /^dyn-f$/), g = glyphs.dynamic && glyphs.dynamic.f;
    ok(hp && hp.dir === 'cresc' && near(hp.t1, F4.n8, 1e-6) && !glyphAt(F4.n7, /^dyn-/), '(§590) a crescendo hairpin from 7 (no name) to 8');
    ok(hp && f8 && g && near(hp.dx1Ss, f8.dxSs - g.wSs / 2 - HPB, 0.01) && near(hp.ySs, f8.ySs, 0.01), '(§590 · S20) THE HAIRPIN INTO A NAME: the tip stops ' + HPB + ' before the f\'s ink, on the f\'s row — got dx1 ' + (hp ? hp.dx1Ss : '-')); }
  ok(glyphAt(F4.n9, /^flag-down8$/) && glyphAt(F4.n9, /^dyn-mp$/), '(§590) note 9 a flagged eighth alone, mp');
  ok(glyphAt(F4.n10, /^flag-up16$/) && at('dot', F4.n10) && glyphAt(F4.n10, /^artic-accent$/) && glyphAt(F4.n10, /^dyn-mf$/), '(§590) note 10 a flagged 16th alone — a dot, an accent, mf');
  ok(glyphAt(F4.n11, /^flag-up16$/) && at('dot', F4.n11) && glyphAt(F4.n11, /^dyn-mp$/) && glyphAt(F4.n12, /^flag-up16$/) && at('dot', F4.n12) && glyphAt(F4.n12, /^dyn-f$/), '(§590) notes 11 · 12 flagged 16ths alone with dots — mp · f');
  { const ids = ['ev-wc-3444', 'ev-wc-3445', 'ev-wc-3446', 'ev-wc-3447', 'ev-wc-3448', 'ev-wc-3449', 'ev-wc-3450', 'ev-wc-3451', 'ev-wc-3452', 'ev-wc-3453', 'ev-wc-3454', 'ev-wc-3459'];
    const evs = ids.map(id => ir.events.find(e => e.id === id));
    ok(evs.every(e => e && e.env === 'plainNote' && Number.isFinite(e.vel) && !e.level), '(§590) the twelve are plain notes STRUCK — a velocity each, no level curve (nothing for a meter to follow)'); } }
console.log(bad ? ('\nEH FIGURE: ' + bad + ' of ' + n + ' decisions MOVED') : ('\nEH FIGURE GREEN: ' + n + ' decisions hold'));
process.exit(bad ? 1 : 0);
