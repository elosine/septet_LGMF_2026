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

// 2d.1 (d) THE LABELS — exactly (mp) 25.0 · (pp) 30.9
ok(v.labels.length >= 2 && v.labels[0].mark === 'mp' && near(v.labels[0].t, 25.0, 0.05) && v.labels[1].mark === 'pp' && near(v.labels[1].t, 30.9, 0.05),
  'the labels are exactly (mp) 25.0 · (pp) 30.9 — got ' + v.labels.map(l => '(' + l.mark + ') ' + l.t).join(' · '));

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
  const oN = at0.find(x => x.k === 'niente' && x.seq === 'openNiente'), oA = at0.find(x => x.k === 'dynarrow' && x.seq === 'openArrow');
  ok(v.entry.fadeFrom === 'niente' && oN && oA && Math.abs(oA.dx1Ss + GAP) < 1e-9 && Math.abs(oA.ySs - SGN.row) < 1e-9 && oN.ySs === oA.ySs && oN.dxSs < oA.dx0Ss && oN.diaSs === SGN.circleDiaSs,
    'the opening sign ○ ——< on the sign row (' + SGN.row + ') under the legend, the arrow ending at the spacer (§457 · §459) — got ' + JSON.stringify([v.entry.fadeFrom, oA && oA.dx1Ss, oA && oA.ySs]));
  const lastB = v.breaths[v.breaths.length - 1], atL = sys.items.filter(x => Math.abs(x.t - lastB.onset) < 1e-9);
  const cM = atL.find(x => x.seq === 'closeMark'), cA = atL.find(x => x.seq === 'closeArrow');
  ok(v.exit && v.exit.fades && v.exit.fadeTo === 'ppp' && near(v.exit.t, 149.0, 0.01) && cM && cM.g === 'dyn-ppp' && cA && cA.ySs === SGN.row && Math.abs(cM.dxSs + G.dynamic.ppp.wSs / 2 + C.engraving.layout.nhGapSs) < 1e-9 && cA.dx1Ss < cM.dxSs,
    'the closing sign ——> ppp on the LAST breath’s unit (' + (lastB && lastB.onset) + ' s), right-justified to its go line; the line ends at 149.0 s falling to ppp (his (i), §459) — got ' + JSON.stringify(v.exit) + ' ' + JSON.stringify(cM && [cM.g, cM.dxSs, cM.ySs]));
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
  // 2d.5 THE LABELS — (mp) 25.0 · (pp) 30.9 on dynY, centred on x(t); nothing else on the row in 0 … 36 s but the block's chain
  const LB = C.engraving.layout.devices.byEnv.sequence.label, dynY = C.engraving.layout.dynY;
  for (const [tt, mk] of [[v.labels[0].t, 'mp'], [v.labels[1].t, 'pp']]) {
    const g3 = sys.items.filter(x => x.t === tt && (x.seq === 'label' || x.seq === 'labelParen'));
    const d = g3.find(x => x.seq === 'label'), L = g3.find(x => x.g === 'accidental-leftParen'), R = g3.find(x => x.g === 'accidental-rightParen');
    ok(d && d.g === 'dyn-' + mk && d.dxSs === 0 && d.ySs === dynY && d.scale === LB.scale && L && R && Math.abs(L.dxSs + R.dxSs) < 1e-9 && L.ySs === dynY,
      '(' + mk + ') at ' + tt + ' s: the dynamic at ' + LB.scale + ' centred on x(t) between its parentheses, on dynY');
  }
  const row = sys.items.filter(x => x.ySs === dynY && x.t <= 36);
  ok(row.every(x => (x.t === 0 && /rangeHi|rangeLo|rangeArrow/.test(x.seq || '')) || /label/.test(x.seq || '')), 'nothing else on the dynamic row in 0 … 36 s but the block’s chain — got ' + row.map(x => x.t + ':' + (x.g || x.k)).join(' '));
}

console.log((fail ? 'FAILED ' : 'ALL PASS ') + pass + ' / ' + (pass + fail));
process.exit(fail ? 1 : 0);
