#!/usr/bin/env node
// sequence_notation_check.js — THE SEQUENCE DEVICE's numbers on the prototype page (LGMF PLAN 2d; RUNNING_LOG §382 … — the block re-checked on the engraving rules of PLAN 2e.3, §450: the pitch picture, anchor B right-justified at 0.45, 26 (C1), the live word, no reminder head, the ledger clearance).
//
// Reads notation/ir/lgmf-eh-proto.ir.json as the page reads it and checks what PLAN § 2d's REQUIRED CHECKS name in node:
// 2d.1 the IR (the level on the fixed scale, the breaths, the labels, the entry) and the glyphs it needs. The DOM checks of
// 2d.2 … 2d.5 run in the app (RUNNING_LOG). Exit 1 on a failure.
//
// Usage: node tools/sequence_notation_check.js [--ir lgmf-eh-proto]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const i = process.argv.indexOf('--ir');
const IRID = i >= 0 ? process.argv[i + 1] : 'lgmf-eh-proto';
const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', IRID + '.ir.json'), 'utf8'));
const G = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'lib', 'glyphs.json'), 'utf8'));
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('FAIL ' + msg); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const RulesRaw = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadRules(ROOT);   // [2l.4] the label rule
const SeqOv = require(path.join(ROOT, 'notation', 'lib', 'sequence_overlays.js'));

const ov = ir.overlays.filter(o => o.kind === 'sequence');
ok(ov.length === 1, 'one sequence overlay (got ' + ov.length + ')');
const v = ov[0].value, L = v.scale.ladder;
// ONE CC7 step on the fixed scale at a level: an eighth over the ladder's gap there
const stepAt = w => { const k = Math.max(0, Math.min(6, Math.floor(w * 8) - 1)); return (1 / 8) / (L[k + 1] - L[k]); };
const at = t => v.level.samples[Math.round((t - v.level.t0) * v.level.sps)];
console.log('ladder ' + L.join('/') + ' · ' + v.level.samples.length + ' samples at ' + v.level.sps + '/s over ' + v.level.t0 + ' … ' + v.level.t1 + ' s');

// 2d.1 (b) THE LEVEL on the fixed scale
ok(at(0) === 0, 'level at 0 s = 0 (niente) — got ' + at(0));
ok(near(at(6), 2 / 8, stepAt(2 / 8)), 'level at 6.0 s = pp 2/8 ± 1 CC7 step — got ' + at(6));
ok(near(at(3), 1 / 8, 0.003) && near(at(1.5), 1 / 16, 0.003) && near(at(4.5), 3 / 16, 0.003), 'the fade is ONE STRAIGHT LINE from nothing to pp — at 1.5 · 3.0 · 4.5 s a quarter, a half, three quarters of pp (§462, his (a)) — got ' + [at(1.5), at(3), at(4.5)].join(' · '));
const w36 = v.level.samples.slice(0, Math.round((36 - v.level.t0) * v.level.sps) + 1);
const mx = Math.max(...w36), mxT = v.level.t0 + w36.indexOf(mx) / v.level.sps;
ok(near(mxT, 25.0, 0.1), 'the maximum in 0 … 36 s at 25.0 s — got ' + mxT.toFixed(2));
ok(near(mx, 4 / 8, stepAt(4 / 8) * 1.01), 'the maximum ≈ mp 4/8 (the note\'s hi 69 against the table\'s ' + L[3] + ') — got ' + mx);
ok(near(at(30.9), 2 / 8, stepAt(2 / 8)), 'level at 30.9 s = pp 2/8 ± 1 CC7 step — got ' + at(30.9));
ok(v.level.samples.every(x => x >= 0 && x <= 1), 'every sample in 0 … 1');

// 2d.1 (c) THE BREATHS
const b1 = v.breaths.find(b => near(b.onset, 13.71, 0.01)), b2 = v.breaths.find(b => near(b.onset, 28.71, 0.01));
ok(b1 && b1.pitch === 'same', 'the breath at 13.71 s is `same`');
ok(b2 && b2.pitch === 'new' && b2.centsText === '+2' && b2.partial === 12 && b2.fundamental === 'C2', 'the breath at 28.71 s is `new` with +2 · partial 12 of C2 — got ' + JSON.stringify(b2 && [b2.pitch, b2.centsText, b2.partial, b2.fundamental]));
ok(b2 && b2.midi === 79, 'the new pitch is G5 (midi 79)');

// 2d.1 (d) THE LABELS — [2l.4, §522] a name wherever the line REACHES a dynamic. From the recipe (R01c: `fadeIn 6` from niente, the
// waves pp … mp): the fade passes ppp at 3.0 s (half of its 6 s to pp, one straight line) and arrives at pp at 6.0; in 0 … 36 s the
// dealt wave's (p) · (mp) 25.0 its crest · (pp) 30.9 its trough · (p). Over the whole line: never two names closer than minGapS,
// never the same name twice running, never niente, a crossing AT its name's height, a turn named by its nearest name.
const DLR = RulesRaw.objects.dynamicLabel, lb36 = v.labels.filter(l => l.t <= 36);
ok(lb36.map(l => l.mark).join(' ') === 'ppp pp p mp pp p' && near(lb36[0].t, 3.0, 0.02) && near(lb36[1].t, 6.0, 0.02) && near(lb36[3].t, 25.0, 0.05) && near(lb36[4].t, 30.9, 0.05)
  && lb36[0].kind === 'cross' && lb36[1].kind === 'cross' && lb36[3].kind === 'crest' && lb36[4].kind === 'trough',
  'the labels in 0 … 36 s are (ppp) 3.0 · (pp) 6.0 · (p) · (mp) 25.0 the crest · (pp) 30.9 the trough · (p) — got ' + lb36.map(l => '(' + l.mark + ') ' + l.t + ' ' + l.kind).join(' · '));
ok(v.labels.every((l, i) => i === 0 || l.t - v.labels[i - 1].t >= DLR.minGapS - 1e-6), 'never two names closer than ' + DLR.minGapS + ' s (' + v.labels.length + ' labels)');
ok(v.labels.every((l, i) => i === 0 || l.mark !== v.labels[i - 1].mark), 'never the same name twice running');
ok(v.labels.every(l => l.mark !== 'niente' && SeqOv.NAMES.includes(l.mark)), 'never niente — every label a written name');
ok(v.labels.every(l => l.kind === 'cross' ? near(l.level, (SeqOv.NAMES.indexOf(l.mark) + 1) / 8, 1e-6) : SeqOv.nameOf(l.level) === l.mark),
  'a crossing sits AT its name\'s height, a turn is named by its nearest name');
// [2l.2 — §519] NO CORNER: the eased line's largest second difference under 5e-4 of the scale per sample² (HEAD's trace: 1.34e-3 at
// 104.69 s — the check fails on it); the ease keeps the level reached: pp EXACTLY at the fade's end (6.0 s)
{ const S = v.level.samples; let mx = 0, i2 = 0;
  for (let i = 1; i + 1 < S.length; i++) { const d2 = Math.abs(S[i + 1] - 2 * S[i] + S[i - 1]); if (d2 > mx) { mx = d2; i2 = i; } }
  ok(mx < 5e-4, 'no corner: the largest second difference ' + mx.toExponential(2) + ' at ' + (v.level.t0 + i2 / v.level.sps).toFixed(2) + ' s (< 5e-4)'); }
ok(at(6) === 0.25 && at(5.4) === +(5.4 / 6 * 0.25).toFixed(5), 'the ease keeps the level reached (pp exactly at 6.0 s) and leaves the fade straight until 0.5 s before it — got ' + at(5.4) + ' · ' + at(6));

// 2d.1 (e) THE ENTRY
const e = v.entry;
ok(e.midi === 80 && e.centsText === '+41' && e.partial === 26 && e.fundamental === 'C1', 'the entry is G♯5 +41 · partial 26 of C1 — got ' + [e.midi, e.centsText, e.partial, e.fundamental].join(' '));
ok(e.rangeText === 'pp → mp', 'the entry\'s range pp → mp — got ' + e.rangeText);
ok(e.techText === 'senza vib.', 'the entry\'s text "senza vib." — got ' + e.techText);

// the events: every breath an env 'sequence' event
const evs = new Map(ir.events.map(x => [x.id, x]));
ok([e.event].concat(v.breaths.map(b => b.event)).every(id => evs.get(id) && evs.get(id).env === 'sequence'), 'the entry and every breath are env \'sequence\' events');

// 2d.1 (f) THE GLYPHS — nine, with sane boxes
const need = ['sharpArrowUp', 'sharpArrowDown', 'flatArrowUp', 'flatArrowDown', 'naturalArrowUp', 'naturalArrowDown', 'leftParen', 'rightParen'].map(k => ['accidental', k]).concat([['text', 'senza vib.']]);
for (const [g, k] of need) {
  const x = (G[g] || {})[k];
  const sane = x && typeof x.path === 'string' && x.path.length > 20 && x.wSs > 0.2 && x.wSs < 5 && x.hSs > 0.2 && x.hSs < 5
    && Object.values(x.anchors || {}).every(a => Number.isFinite(a.x) && Number.isFinite(a.y));
  ok(sane, 'glyph ' + g + '.' + k + ' present with a sane box — got ' + (x ? x.wSs + ' x ' + x.hSs : 'none'));
}
// the arrowed ones at the house set's size: the height of the plain accidental they carry, give or take the arrow
for (const [k, base] of [['sharpArrowUp', 'sharp'], ['flatArrowDown', 'flat'], ['naturalArrowUp', 'natural']]) {
  const a = G.accidental[k], p = G.accidental[base];
  ok(a.hSs > p.hSs && a.hSs < p.hSs * 1.6 && a.anchors.noteY, k + ' at the house size beside ' + base + ' (' + a.hSs + ' vs ' + p.hSs + ' ss) with a noteY anchor');
}

// 2e.3 THE BLOCK — the pitch picture (rules.json pitchPicture, just_partials_notation §1a REVISED) and the block in the layout MODEL, as
// export_video builds it (video-jury, in C): anchor B — every member right-justified to ONE spacer before the go line (§417 · §418)
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
{
  const J = (step, alter, c) => { const r = Layout.justPicture({ step, alter, octave: 4 }, c, { edgeCents: 25 }); return r.acc + (r.sp.step !== step ? '@' + r.sp.step : ''); };
  const c = n => 1200 * Math.log2(n) % 100 > 50 ? 1200 * Math.log2(n) % 100 - 100 : 1200 * Math.log2(n) % 100;
  // the partials' own cents against the nearest key (C1's series): plain under 25 c, the quarter-tone sign from 25 c — no arrows (§436)
  for (const n of [3, 5, 9, 15, 17, 19]) ok(J('C', 0, c(n)) === 'null' && J('C', 1, c(n)) === 'sharp', 'partial ' + n + ' (' + c(n).toFixed(1) + ' c) plain');
  ok(J('C', 0, c(7)) === 'quarterFlat' && J('C', 0, c(11)) === 'quarterFlat' && J('C', 0, c(21)) === 'quarterFlat', 'partials 7 · 11 · 21 on a natural: the reversed flat (' + [7, 11, 21].map(n => c(n).toFixed(1)).join(' · ') + ' c)');
  ok(J('C', 0, c(13)) === 'quarterSharp' && J('C', 0, c(23)) === 'quarterSharp', 'partials 13 · 23 on a natural: ½♯ (' + [13, 23].map(n => c(n).toFixed(1)).join(' · ') + ' c)');
  ok(J('D', 1, 41) === 'threeQuarterSharp' && J('D', 1, -41) === 'threeQuarterFlat@E' && J('E', -1, 41) === 'threeQuarterSharp@D' && J('E', -1, -41) === 'threeQuarterFlat',
    'the spelling rule (§433): D♯ +41 = D¾♯ · D♯ −41 = E¾♭ · E♭ +41 = D¾♯ · E♭ −41 = E¾♭');
  ok(J('G', 1, 24.9) === 'sharp' && J('G', 1, 25) === 'threeQuarterSharp', 'the edge at 25 c (rules.json pitchPicture.edgeCents)');
}
{
  const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
  const ens = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'ensemble.json'), 'utf8'));
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'techniques.json'), 'utf8'));
  const ENS = Layout.ensembleFor(ens, (C.realizations || {})['video-jury']);
  const model = Layout.layoutSection(ir, G, Object.assign({ m4AttackLines: false, frameParts: ENS.parts.map(p => p.part), ensemble: ENS, techniques: T }, C.engraving.layout));
  const sys = model.systems.find(s => s.part === 0 && !(s.staff > 0));
  const at0 = sys.items.filter(x => x.t === 0);
  const head = at0.find(x => x.g === 'notehead-open'), acc = at0.find(x => x.k === 'glyph' && /^accidental-/.test(x.g));
  const hw = G.notehead.open.wSs, B = C.engraving.layout.devices.byEnv.sequence.block, GAP = B.headGapSs;
  ok(GAP === 0.45 && B.columnAlign === 'right', 'anchor B: the spacer 0.45, the column right-justified (§417 · §418) — got ' + GAP + ' · ' + B.columnAlign);
  ok(head && head.ySs === 2.5 && Math.abs(head.dxSs + hw / 2 + GAP) < 1e-9, 'the block’s head: G♯5 (ySs 2.5), its right edge the spacer ' + GAP + ' ss before the go line');
  ok(acc && acc.g === 'accidental-threeQuarterSharp', 'the head’s accidental ¾♯ (G♯ +41, the nearest quarter-tone) — got ' + (acc && acc.g));
  const cents = at0.find(x => x.seq === 'cents'), part = at0.find(x => x.seq === 'partial');
  ok(cents && cents.text === '+41' && Math.abs(cents.ySs - (Math.max(head.ySs + G.notehead.open.hSs / 2, 2) + B.centsGapSs)) < 1e-9, 'the cents +41 at D45’s height');
  ok(part && part.text === '26 (C1)' && Math.abs(part.ySs - cents.ySs - B.rowSs) < 1e-9, 'the partial 26 (C1) one row above (§438)');
  ok(cents.anchor === 'end' && Math.abs(cents.dxSs + GAP) < 1e-9 && part.dxSs === cents.dxSs, 'the column right-justified to the spacer, x(t) − ' + GAP);
  const ink = C.engraving.layout.colours.number;
  ok(cents.color === ink && part.color === ink && ink === '#111' && !cents.italic && cents.size === C.engraving.layout.textSizes.instruction, 'the numbers black #111, upright, 0.75 (§427)');
  const tx = at0.find(x => x.seq === 'techText');
  ok(tx && tx.k === 'text' && tx.text === 'senza vib.' && tx.italic === true && tx.color === '#111' && tx.size === 0.75 && tx.anchor === 'end' && Math.abs(tx.dxSs + GAP) < 1e-9
    && Math.abs(tx.ySs - (part.ySs + B.slashTopEm * B.numEmSs + B.textGapSs)) < 1e-9, '"senza vib." a live instruction (0.75 italic black), ' + B.textGapSs + ' ss above the column, ending at the spacer');
  ok(!at0.some(x => x.k === 'glyph' && /^text-/.test(x.g)), 'no baked text glyph drawn');
  const hi = at0.find(x => x.seq === 'rangeHi'), ar = at0.find(x => x.seq === 'rangeArrow'), lo = at0.find(x => x.seq === 'rangeLo');
  const A = C.engraving.layout.dynArrow || { gapSs: 0.45, lenSs: 2 };
  ok(hi && hi.g === 'dyn-mp' && lo && lo.g === 'dyn-pp' && ar && hi.ySs === C.engraving.layout.dynY && Math.abs(hi.dxSs + G.dynamic.mp.wSs / 2 + GAP) < 1e-9
    && Math.abs(ar.dx1Ss - (hi.dxSs - G.dynamic.mp.wSs / 2 - A.gapSs)) < 1e-9 && Math.abs(lo.dxSs + G.dynamic.pp.wSs / 2 - (ar.dx0Ss - A.gapSs)) < 1e-9,
    'pp → mp on dynY, right to left mp · spacer · arrow · spacer · pp, ending at the spacer');
  // [2f, §457 his (a) · (i), §459] THE FADE SIGNS: the opening sign under the legend, right-justified to the spacer; the closing sign on the last breath's unit
  const SGN = C.engraving.layout.devices.byEnv.sequence.signs;
  // [§460 his hairpins] the opening ○—< BEFORE the legend on the DYNAMIC ROW (the space allows at 0 s): niente · hairpin · pp → mp, the circle at the tip
  const oN = at0.find(x => x.k === 'niente' && x.seq === 'openNiente'), oH = at0.find(x => x.k === 'hairpin' && x.seq === 'openHairpin');
  const ppLeft = lo.dxSs - G.dynamic.pp.wSs / 2;
  ok(v.entry.fadeFrom === 'niente' && oN && oH && oH.dir === 'cresc' && oH.ySs === C.engraving.layout.dynY && oN.ySs === oH.ySs && Math.abs(oH.dx1Ss - (ppLeft - SGN.gapSs)) < 1e-9
    && Math.abs(oH.dx1Ss - oH.dx0Ss - SGN.lengthSs) < 1e-9 && Math.abs(oN.dxSs + oN.diaSs / 2 + SGN.circleGapSs - oH.dx0Ss) < 1e-9 && oH.hSs === SGN.heightSs,
    'the opening sign ○—< on the DYNAMIC ROW before the legend (niente · hairpin · pp → mp), the hairpin ' + SGN.lengthSs + ' ss ending ' + SGN.gapSs + ' before pp, the circle at its tip (§460) — got ' + JSON.stringify([v.entry.fadeFrom, oH && [oH.dx0Ss, oH.dx1Ss, oH.ySs, oH.dir], oN && oN.dxSs, ppLeft]));
  const lastB = v.breaths[v.breaths.length - 1], atL = sys.items.filter(x => Math.abs(x.t - lastB.onset) < 1e-9);
  const cM = atL.find(x => x.seq === 'closeMark'), cH = atL.find(x => x.seq === 'closeHairpin');
  ok(v.exit && v.exit.fades && v.exit.fadeTo === 'ppp' && near(v.exit.t, 149.0, 0.01) && cM && cM.g === 'dyn-ppp' && cM.ySs === C.engraving.layout.dynY && Math.abs(cM.dxSs + G.dynamic.ppp.wSs / 2 + C.engraving.layout.nhGapSs) < 1e-9
    && cH && cH.dir === 'decresc' && cH.ySs === cM.ySs && Math.abs(cH.dx1Ss - (cM.dxSs - G.dynamic.ppp.wSs / 2 - SGN.gapSs)) < 1e-9 && Math.abs(cH.dx1Ss - cH.dx0Ss - SGN.lengthSs) < 1e-9,
    'the closing sign —> ppp (a decrescendo hairpin, then the dynamic) on the LAST breath’s unit (' + (lastB && lastB.onset) + ' s), on the dynamic row, right-justified to its go line; the line ends at 149.0 s falling to ppp (his (i), §459 · §460) — got ' + JSON.stringify(v.exit) + ' ' + JSON.stringify(cM && [cM.g, cM.dxSs, cM.ySs]) + ' ' + JSON.stringify(cH && [cH.dx0Ss, cH.dx1Ss, cH.dir]));
  ok(!model.warnings.length, 'no layout warnings — got ' + JSON.stringify(model.warnings));
  // 2d.3 THE CURVE AND THE FOLLOWER — the morph's crescendo kind, ABSOLUTE: the IR's samples are the height (no normalisation, no floor)
  const cc = sys.items.filter(x => x.k === 'cresccurve');
  ok(cc.length === 1 && cc[0].samples === v.level.samples && cc[0].t0 === v.level.t0 && cc[0].t1 === v.level.t1 && !cc[0].full,
    'one level curve (cresccurve, the bottom half-lane) carrying the IR’s samples over ' + v.level.t0 + ' … ' + v.level.t1 + ' s');
  ok(!sys.items.some(x => x.k === 'envcurve'), 'no per-note envcurve under the line');
  const A2 = require(path.join(ROOT, 'notation', 'lib', 'animobj.js'));
  const inst = A2.collect(ir, null, C.animated, { parts: [0] });
  const cm = inst.filter(x => x.kind === 'crescMeter');
  ok(cm.length === 1 && cm[0].samples === v.level.samples && cm[0].t0 === v.level.t0 && cm[0].t1 === v.level.t1, 'one follower (crescMeter) riding the same samples');
  ok(!inst.some(x => x.kind === 'curveMeter'), 'no per-note curveMeter (the line owns the lane)');
  // THE BREATHS — a same-pitch breath: the go line ALONE (§443); a new pitch: its head at the spacer, its column
  const at = tt => sys.items.filter(x => Math.abs(x.t - tt) < 1e-6);
  const s1 = at(v.breaths[0].onset), s2 = at(v.breaths[1].onset);
  ok(s1.some(x => x.k === 'goline') && !s1.some(x => x.k === 'glyph' || x.k === 'ledger' || x.k === 'text'), 'at 13.71 s: a go line and NO head (his "iii, no head")');
  const h2 = s2.find(x => x.g === 'notehead-open'), c2 = s2.filter(x => x.k === 'text');
  ok(s2.some(x => x.k === 'goline') && h2 && h2.scale === 1 && h2.ySs === 2.5 && Math.abs(h2.dxSs + hw / 2 + GAP) < 1e-9 && !s2.some(x => /^accidental-/.test(x.g || '')),
    'at 28.71 s: a go line, a full open head at G5 (plain: +2 c), its right edge the spacer ' + GAP + ' ss before the line');
  ok(c2.length === 2 && c2[0].text === '+2' && c2[1].text === '12 (C2)' && c2.every(x => x.anchor === 'end' && Math.abs(x.dxSs + GAP) < 1e-9 && x.color === '#111'), 'its column +2 · 12 (C2), black, right-justified to the spacer');
  // the pie — the breaths, re-pointed
  const pies = inst.filter(x => x.kind === 'motivePie');
  ok(pies.length === v.breaths.length + 1 && pies.every(x => x.countdown && x.part === 0) && pies[0].t1 === v.breaths[0].onset && pies[1].t0 === v.breaths[0].onset && pies[1].t1 === v.breaths[1].onset && pies[pies.length - 1].t1 === v.breaths[v.breaths.length - 1].release,
    (v.breaths.length + 1) + ' breath clocks (the entry and ' + v.breaths.length + ' breaths), each go line to go line, the last to its release (§455)');
  ok(C.animated.motivePie.enabled === true && C.animated.motivePie.source === 'breaths' && C.animated.motivePie.until === 'nextGo', 'the registry’s pie ON, re-pointed to the breaths, until the next go line (the pie row)');
  // [2e.3 (7), §419 F6] THE WORKING PAGE (the EH in F: D♯6 on two ledgers): the ¾♯ clears the ledger's left end by the gap
  {
    const EW = Layout.ensembleFor(ens, null);
    const mw = Layout.layoutSection(ir, G, Object.assign({ m4AttackLines: false, frameParts: EW.parts.map(p => p.part), ensemble: EW, techniques: T }, C.engraving.layout));
    const w0 = mw.systems.find(s => s.part === 0 && !(s.staff > 0)).items.filter(x => x.t === 0);
    const aw = w0.find(x => /^accidental-/.test(x.g || '')), lw = w0.filter(x => x.k === 'ledger'), ag = aw && G.accidental[aw.g.replace('accidental-', '')];
    const ax = ag && ag.anchors && ag.anchors.noteY ? ag.anchors.noteY.x : ag && ag.wSs / 2, lf = G.standards.ledgerLine.lengthFraction;
    const accR = aw ? aw.dxSs + (ag.wSs - ax) : NaN, ledL = lw.length ? Math.min(...lw.map(l => l.dxSs - l.wSs * (1 + 2 * lf) / 2)) : NaN;
    ok(aw && lw.length === 2 && Math.abs(ledL - accR - C.engraving.layout.accGap) < 1e-9, 'the working page: the ¾♯ (on D♯6, two ledgers) ends ' + C.engraving.layout.accGap + ' ss left of the ledger\'s left end — got ' + (ledL - accR).toFixed(3));
  }
  // 2d.5 THE LABELS — [2l.4] the crest (mp) 25.0 · the trough (pp) 30.9 on dynY, centred on x(t); nothing else on the row in 0 … 36 s
  // but the block's chain
  const LB = C.engraving.layout.devices.byEnv.sequence.label, dynY = C.engraving.layout.dynY;
  for (const [tt, mk] of [[lb36[3].t, 'mp'], [lb36[4].t, 'pp']]) {
    const g3 = sys.items.filter(x => x.t === tt && (x.seq === 'label' || x.seq === 'labelParen'));
    const d = g3.find(x => x.seq === 'label'), L = g3.find(x => x.g === 'accidental-leftParen'), R = g3.find(x => x.g === 'accidental-rightParen');
    ok(d && d.g === 'dyn-' + mk && d.dxSs === 0 && d.ySs === dynY && d.scale === LB.scale && L && R && Math.abs(L.dxSs + R.dxSs) < 1e-9 && L.ySs === dynY,
      '(' + mk + ') at ' + tt + ' s: the dynamic at ' + LB.scale + ' centred on x(t) between its parentheses, on dynY');
  }
  const row = sys.items.filter(x => x.ySs === dynY && x.t <= 36);
  ok(row.every(x => (x.t === 0 && /rangeHi|rangeLo|rangeArrow|openNiente|openHairpin/.test(x.seq || '')) || /label/.test(x.seq || '')), 'nothing else on the dynamic row in 0 … 36 s but the block’s chain and its opening sign — got ' + row.map(x => x.t + ':' + (x.g || x.k)).join(' '));
}

// [LGMF PLAN 2l.3 — §516 · §518] THE MORPH'S ARC on `lgmf-hn-morph-proto` (the horn, 140 … 282 s): ONE ARC per part through the
// breath peaks (#5's D47 builder, the anchors read through the ladder), never above or below its two neighbouring anchors, smooth,
// its range what it draws, its closing sign by 2f's rule on the arc; the sequence's last breath before it closes on the RECIPE.
{
  const hn = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', 'lgmf-hn-morph-proto.ir.json'), 'utf8'));
  const sq = hn.overlays.filter(o => o.kind === 'sequence').map(o => o.value);
  const M = sq.find(x => x.level.anchors), Q = sq.find(x => !x.level.anchors);
  ok(M && Q, 'the horn page carries the sequence\'s last breath and the morph as two lines (got ' + sq.length + ')');
  if (M && Q) {
    const A = M.level.anchors, S = M.level.samples, nb = M.breaths.length + 1;
    ok(A.length === nb + 2 && near(A[0][0], M.level.t0, 1e-3) && near(A[A.length - 1][0], M.level.t1, 1e-3),
      'the arc has one anchor per breath (' + nb + ') + its two ends — got ' + A.length);
    let out = 0, worst = 0;
    S.forEach((y, i) => { const t = M.level.t0 + i / M.level.sps; let k = 0; while (k + 2 < A.length && A[k + 1][0] <= t) k++;
      const lo = Math.min(A[k][1], A[k + 1][1]), hi = Math.max(A[k][1], A[k + 1][1]), e = Math.max(lo - y, y - hi, 0); if (e > 1e-4) out++; worst = Math.max(worst, e); });
    ok(!out, 'the arc never above or below its two neighbouring anchors (D47) — ' + out + ' samples outside, the worst by ' + worst.toExponential(1));
    let mx = 0; for (let i = 1; i + 1 < S.length; i++) mx = Math.max(mx, Math.abs(S[i + 1] - 2 * S[i] + S[i - 1]));
    ok(mx < 5e-4, 'the arc is smooth: the largest second difference ' + mx.toExponential(2) + ' (< 5e-4)');
    const nm = A.map(p => SeqOv.nameOf(p[1])).filter(x => x !== 'niente'), ix = nm.map(x => SeqOv.NAMES.indexOf(x));
    ok(M.entry.rangeText === SeqOv.NAMES[Math.min(...ix)] + ' → ' + SeqOv.NAMES[Math.max(...ix)] && M.entry.rangeText === 'ppp → ff', 'the range is what the arc draws, its lowest and highest anchors — got ' + M.entry.rangeText);
    const lastPeak = A[A.length - 2][1], end = S[S.length - 1];
    ok(M.exit.by === 'arc' && M.exit.fades === (lastPeak - end >= 1 / 8 - 1e-6) && M.exit.fades && M.exit.fadeTo === SeqOv.nameOf(end) && M.exit.fadeTo === 'ppp',
      'the closing sign on the arc: the end ' + end + ' at least ⅛ under the last peak ' + lastPeak + ' → —> ' + M.exit.fadeTo);
    ok(M.labels.slice(0, 5).map(l => l.mark).join(' ') === 'p mp mf f ff' && M.labels[4].kind === 'crest', 'the arc\'s rise is signposted (p) (mp) (mf) (f) to its first crest (ff) — got ' + M.labels.map(l => '(' + l.mark + ') ' + l.t + ' ' + l.kind).join(' · '));
    ok(M.labels.every((l, i) => i === 0 || (l.t - M.labels[i - 1].t >= DLR.minGapS - 1e-6 && l.mark !== M.labels[i - 1].mark)), 'the arc\'s labels keep the spacing and never repeat a name');
    ok(Q.exit.by === 'recipe' && Q.exit.fades && Q.exit.fadeTo === 'ppp', 'the sequence\'s last breath closes on the RECIPE (fadeOut 8 → ppp): —> ppp — got ' + JSON.stringify(Q.exit) + ' (2k.7\'s finding 3: the ⅛ rule missed it at 0.1244)');
  }
}

console.log((fail ? 'FAILED ' : 'ALL PASS ') + pass + ' / ' + (pass + fail));
process.exit(fail ? 1 : 0);
