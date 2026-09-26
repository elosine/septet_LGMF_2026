#!/usr/bin/env node
// sequence_notation_check.js — THE SEQUENCE DEVICE's numbers on the prototype page (LGMF PLAN 2d; RUNNING_LOG §382 …).
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
ok(b2 && b2.pitch === 'new' && b2.centsText === '+2' && b2.partialText === '12°/C2', 'the breath at 28.71 s is `new` with +2 · 12°/C2 — got ' + JSON.stringify(b2 && [b2.pitch, b2.centsText, b2.partialText]));
ok(b2 && b2.midi === 79, 'the new pitch is G5 (midi 79)');

// 2d.1 (d) THE LABELS — exactly (mp) 25.0 · (pp) 30.9
ok(v.labels.length === 2 && v.labels[0].mark === 'mp' && near(v.labels[0].t, 25.0, 0.05) && v.labels[1].mark === 'pp' && near(v.labels[1].t, 30.9, 0.05),
  'the labels are exactly (mp) 25.0 · (pp) 30.9 — got ' + v.labels.map(l => '(' + l.mark + ') ' + l.t).join(' · '));

// 2d.1 (e) THE ENTRY
const e = v.entry;
ok(e.midi === 80 && e.centsText === '+41' && e.partialText === '26°/C1', 'the entry is G♯5 +41 · 26°/C1 — got ' + [e.midi, e.centsText, e.partialText].join(' '));
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

// 2d.2 THE BLOCK — the bands (just_partials_notation §1a) and the block in the layout MODEL, as export_video builds it (video-jury, in C)
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
{
  const J = Layout.justAccOf, c = n => 1200 * Math.log2(n) % 100 > 50 ? 1200 * Math.log2(n) % 100 - 100 : 1200 * Math.log2(n) % 100;
  // the partials' own cents against the nearest key (C1's series): plain · arrowed · quarter
  for (const n of [3, 5, 9, 15, 17, 19]) ok(J(0, c(n)) === null && J(1, c(n)) === 'sharp', 'partial ' + n + ' (' + c(n).toFixed(1) + ' c) plain');
  ok(J(0, c(7)) === 'naturalArrowDown' && J(0, c(21)) === 'naturalArrowDown' && J(0, c(23)) === 'naturalArrowUp' && J(1, c(23)) === 'sharpArrowUp' && J(-1, c(7)) === 'flatArrowDown',
    'partials 7 · 21 ↓, 23 ↑ (' + [7, 21, 23].map(n => c(n).toFixed(1)).join(' · ') + ' c)');
  ok(J(0, c(11)) === 'quarterFlat' && J(0, c(13)) === 'quarterSharp', 'partials 11 ¼♭ · 13 ¼♯ on a natural');
  ok(J(1, -49) === 'quarterSharp' && J(1, 41) === 'threeQuarterSharp' && J(-1, 49) === 'quarterFlat' && J(-1, -41) === 'threeQuarterFlat', 'on a ♯ note −49 = ¼♯, +41 = ¾♯; on a ♭ the mirror');
}
{
  const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'container.json'), 'utf8'));
  const ens = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'ensemble.json'), 'utf8'));
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'techniques.json'), 'utf8'));
  const ENS = Layout.ensembleFor(ens, (C.realizations || {})['video-jury']);
  const model = Layout.layoutSection(ir, G, Object.assign({ m4AttackLines: false, frameParts: ENS.parts.map(p => p.part), ensemble: ENS, techniques: T }, C.engraving.layout));
  const sys = model.systems.find(s => s.part === 0 && !(s.staff > 0));
  const at0 = sys.items.filter(x => x.t === 0);
  const head = at0.find(x => x.g === 'notehead-open'), acc = at0.find(x => x.k === 'glyph' && /^accidental-/.test(x.g));
  const hw = G.notehead.open.wSs, B = C.engraving.layout.devices.byEnv.sequence.block;
  ok(head && head.ySs === 2.5 && Math.abs(head.dxSs + hw / 2 + B.headGapSs) < 1e-9, 'the block’s head: G♯5 (ySs 2.5), its right edge ' + B.headGapSs + ' ss before the go line');
  ok(acc && acc.g === 'accidental-threeQuarterSharp', 'the head’s accidental ¾♯ (G♯ +41) — got ' + (acc && acc.g));
  const cents = at0.find(x => x.seq === 'cents'), part = at0.find(x => x.seq === 'partial');
  ok(cents && cents.text === '+41' && Math.abs(cents.ySs - (Math.max(head.ySs + G.notehead.open.hSs / 2, 2) + B.centsGapSs)) < 1e-9, 'the cents +41 at D45’s height');
  ok(part && part.text === '26°/C1' && Math.abs(part.ySs - cents.ySs - B.rowSs) < 1e-9, 'the partial 26°/C1 one row above');
  ok(cents.anchor === 'end' && Math.abs(cents.dxSs - (head.dxSs + hw / 2)) < 1e-9 && part.dxSs === cents.dxSs, 'the column (wider than the head) right-aligned to the head’s right edge');
  const tx = at0.find(x => x.seq === 'techText'), TG = G.text['senza vib.'];
  ok(tx && Math.abs((tx.ySs - TG.hSs / 2) - (part.ySs + B.slashTopEm * B.numEmSs + B.textGapSs)) < 1e-9 && Math.abs((tx.dxSs - TG.wSs / 2) - (head.dxSs - hw / 2)) < 1e-9,
    '"senza vib." ' + B.textGapSs + ' ss above the column’s ink, from the head’s left edge');
  const hi = at0.find(x => x.seq === 'rangeHi'), ar = at0.find(x => x.seq === 'rangeArrow'), lo = at0.find(x => x.seq === 'rangeLo');
  const A = C.engraving.layout.dynArrow || { gapSs: 0.45, lenSs: 2 };
  ok(hi && hi.g === 'dyn-mp' && lo && lo.g === 'dyn-pp' && ar && hi.ySs === C.engraving.layout.dynY && Math.abs(hi.dxSs + G.dynamic.mp.wSs / 2 + A.gapSs) < 1e-9
    && Math.abs(ar.dx1Ss - (hi.dxSs - G.dynamic.mp.wSs / 2 - A.gapSs)) < 1e-9 && Math.abs(lo.dxSs + G.dynamic.pp.wSs / 2 - (ar.dx0Ss - A.gapSs)) < 1e-9,
    'pp → mp on dynY, right to left mp · spacer · arrow · spacer · pp, ending one spacer before the go line');
  ok(!at0.some(x => x.k === 'niente'), 'no niente sign in the block (§376 (a))');
  ok(!model.warnings.length, 'no layout warnings — got ' + JSON.stringify(model.warnings));
}

console.log((fail ? 'FAILED ' : 'ALL PASS ') + pass + ' / ' + (pass + fail));
process.exit(fail ? 1 : 0);
