#!/usr/bin/env node
// test_surge_run.js — PLAN 2i.8 (RUNNING_LOG §530, D54): the crescendo run's 78 swells as the tuba's surge device.
//   node tools/test_surge_run.js
// The 78 swells (526.8–559.4 s; Fl 12 · BCl 14 · Vn1 13 · Vn2 12 · Va 14 · Vc 13; the piano out) carry env 'surge' + secco in the IR
// (derived from the save's properties.cresc, D9); the page draws them with the STANDARD surge as a template — the crescendo tool's
// ratio-5 exponential (cresc.js segmentFor), sampled through sonify_core.evalWaveCurve at 100/s never fewer than 101, from 0, the
// 90° cut on the note end — NOT the save's sampler-bent curve, which stays in the IR untouched; ppp → fff + arrow on each; "sempre
// secco" once per part at the cut edge of its first swell; the meter rides the same function (drawnOf, D50); nothing outside the
// run moved, item by item, but the §529 on-change knock-on (a band mark re-stated after a written fff), counted. The template is
// held against the tuba's db1 surges within tolerance. Runs on the MAIN notation file as built; red on the old engine.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const SC = require(path.join(ROOT, 'score', 'public', 'sonify_core.js'));
const Cresc = require(path.join(ROOT, 'score', 'public', 'cresc.js'));
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };

const glyphs = rd('notation/lib/glyphs.json'), C = rd('notation/registry/container.json');
const ens = rd('notation/registry/ensemble.json'), T = rd('notation/registry/techniques.json');
const ir = rd('notation/ir/piece-septet.ir.json');
const OPTS = Object.assign({ m4AttackLines: false, frameParts: ens.parts.map(p => p.part), ensemble: ens, techniques: T }, C.engraving.layout);
const lay = J => Layout.layoutSection(J, glyphs, OPTS);
const model = lay(ir);
const partOfEv = new Map(); for (const c of ir.chunks) for (const id of c.events || []) partOfEv.set(id, c.part);
const itemsOf = (M, p) => M.systems.filter(S => String(S.key).split(':')[0] === String(p)).flatMap(S => S.items);
const near = (a, b) => Math.abs(a - b) < 1e-6;
const RUN = [526, 560], PARTS = [0, 1, 3, 4, 5, 6];

// ---- the 78, found by what they ARE in the save (curve-mode events in the six parts inside the run), not by the tag under test ----
const swells = ir.events.filter(e => PARTS.includes(partOfEv.get(e.id)) && e.onset >= RUN[0] && e.onset < RUN[1]
  && e.level && e.level.samples && e.level.samples.length >= 2 && e.env !== 'strike' && e.env !== 'trill').sort((a, b) => a.onset - b.onset);
const perPart = PARTS.map(p => swells.filter(e => partOfEv.get(e.id) === p).length);
ok(swells.length === 78 && perPart.join() === '12,14,13,12,14,13', 'the 78 swells, Fl 12 · BCl 14 · Vn1 13 · Vn2 12 · Va 14 · Vc 13 (got ' + swells.length + ': ' + perPart.join(' · ') + ')');
const lastEnd = swells[swells.length - 1].onset + swells[swells.length - 1].duration;
ok(near(swells[0].onset, 526.79) && lastEnd < 559.5, 'the run 526.79 → ' + lastEnd.toFixed(2));
const durs = swells.map(e => e.duration);
ok(Math.min(...durs) >= 0.29 && Math.max(...durs) <= 1.3, 'durations 0.30–1.28 s (got ' + Math.min(...durs).toFixed(2) + '–' + Math.max(...durs).toFixed(2) + ')');

// ---- [8.1] the tag: env 'surge' + secco, derived from the save; nothing else tagged secco ----
ok(swells.every(e => e.env === 'surge'), '78 events env: surge (got ' + swells.filter(e => e.env === 'surge').length + ')');
ok(swells.every(e => e.secco === true), '78 events secco: true (got ' + swells.filter(e => e.secco === true).length + ')');
ok(ir.events.filter(e => e.secco).length === 78, 'no other event carries secco (' + ir.events.filter(e => e.secco).length + ')');
ok(!ir.events.some(e => e.env === 'surge' && !swells.includes(e)), 'no other event is env surge (the tuba inheritance is the run\'s alone here)');

// ---- [8.2] the template: a registry switch on the device; the drawn samples are the STANDARD surge; the IR's samples untouched ----
const DEV = (C.engraving.layout.devices || {}).byEnv || {};
ok(DEV.surge && DEV.surge.curveTemplate === 'surge', 'registry byEnv.surge carries curveTemplate: surge (a device rule, not a build flag)');
ok(!/--surge|--template/.test(ir.provenance.build), 'the recorded build is unchanged — no template flag (R re-runs it)');
const seg = Cresc.segmentFor('surge');
ok(seg.model === 'exponential' && Math.abs(seg.slope - 0.40) < 1e-9 && seg.ratio === 5, 'the STANDARD surge = cresc.js segmentFor(surge): exponential, slope 0.40, ratio 5');
const tpl = { nodes: [{ pos: 0, y: 0 }, { pos: 1, y: 10 }], segments: [{ model: seg.model, slope: seg.slope }] };
const tplAt = x => SC.evalWaveCurve(tpl, x);
const devOf = Layout.deviceResolver(ir, OPTS);
let curves = 0, lenOk = 0, fromZero = 0, toPeak = 0, shapeOk = 0, spanOk = 0, meterOk = 0, irBent = 0;
for (const e of swells) {
  const p = partOfEv.get(e.id);
  const it = itemsOf(model, p).find(x => x.k === 'envcurve' && x.ev === e.id);
  if (!it) continue;
  curves++;
  const s = it.samples, n = s.length;
  if (n === Math.max(101, Math.round(e.duration * 100) + 1)) lenOk++;
  if (s[0] === 0) fromZero++;
  if (Math.abs(s[n - 1] - 1) < 1e-9 && s.every((v, i) => i === 0 || v >= s[i - 1])) toPeak++;   // rising to the peak at the END: the cut kept every sample
  if (s.every((v, i) => Math.abs(v - tplAt(i / (n - 1))) < 2e-4)) shapeOk++;
  if (near(it.t0, e.onset) && near(it.t1, e.onset + e.duration) && it.cut === true) spanOk++;
  const drawn = Layout.drawnLevelSamples(e, devOf(e) || {});
  if (drawn.length === n && drawn.every((v, i) => v === s[i])) meterOk++;
  if (e.level.samples.length === 101 && e.level.samples[30] < 0.02 && e.level.samples[100] > 0.99) irBent++;   // the save's bent curve, as extracted
}
ok(curves === 78, '78 envcurve items on the page (got ' + curves + ')');
ok(lenOk === 78, 'every curve at 100/s, never fewer than 101 samples (got ' + lenOk + ')');
ok(fromZero === 78, 'every curve starts at 0 — no floor, no curveZero (got ' + fromZero + ')');
ok(toPeak === 78, 'every curve rises to its peak at the last sample — the cut lands on the note end (got ' + toPeak + ')');
ok(shapeOk === 78, 'every curve IS the STANDARD surge through sonify_core.evalWaveCurve (|d| < 2e-4 at every sample) (got ' + shapeOk + ')');
ok(spanOk === 78, 'every curve spans onset → note end with the cut (got ' + spanOk + ')');
ok(meterOk === 78, 'the meter path: drawnLevelSamples(e, device) = the page\'s samples, one source (got ' + meterOk + ')');
ok(irBent === 78, 'the IR untouched: every event still carries the save\'s bent curve (sample 30 < 0.02) (got ' + irBent + ')');
ok(!(DEV.surge && DEV.surge.curveZero) && !(DEV.surge && DEV.surge.curveFloor > 0), 'the surge device carries no curveZero and no curveFloor');
// the template against the tuba's drawn surges (db1: 27 surges): the cut-normalised curve at tenths within 0.05
{
  const cands = [path.join('C:', 'Users', 'jwloy', 'GitHub', 'for_seven_tubas', 'notation', 'ir', 'db1.ir.json'), path.join(ROOT, 'notation', 'ir', 'db1.ir.json')];
  const f = cands.find(x => fs.existsSync(x));
  if (!f) console.log('  (db1.ir.json not found — the tuba comparison skipped)');
  else {
    const db = JSON.parse(fs.readFileSync(f, 'utf8'));
    const sg = db.events.filter(e => e.env === 'surge' && e.level && e.level.samples);
    let worst = 0;
    for (const e of sg) {
      const s = e.level.samples; let iMax = 0; for (let i = 1; i < s.length; i++) if (s[i] > s[iMax]) iMax = i;
      const cut = s.slice(0, iMax + 1), m = cut.length - 1;
      for (let k = 0; k <= 10; k++) worst = Math.max(worst, Math.abs(cut[Math.round(k * m / 10)] / cut[m] - tplAt(k / 10)));
    }
    ok(sg.length === 27 && worst <= 0.05, 'the template matches the tuba\'s 27 db1 surges at tenths within 0.05 (worst ' + worst.toFixed(4) + ')');
  }
}

// ---- the pair + arrow on every swell: ppp → fff ----
{
  let pairs = 0, arrows = 0;
  for (const e of swells) {
    const L = itemsOf(model, partOfEv.get(e.id));
    const a = L.find(x => x.k === 'glyph' && x.g === 'dyn-ppp' && near(x.t, e.onset)), b = L.find(x => x.k === 'glyph' && x.g === 'dyn-fff' && near(x.t, e.onset));
    const ar = L.find(x => x.k === 'dynarrow' && near(x.t, e.onset));
    if (a && b && near(a.ySs, b.ySs) && a.dxSs < b.dxSs) pairs++;
    if (ar && a && b && near(ar.ySs, a.ySs) && ar.dx0Ss > a.dxSs && ar.dx1Ss < b.dxSs) arrows++;
  }
  ok(pairs === 78, '78 dynamic pairs ppp … fff on one row, the start mark on the head column (got ' + pairs + ')');
  ok(arrows === 78, '78 arrows between the marks (got ' + arrows + ')');
  ok(!swells.some(e => itemsOf(model, partOfEv.get(e.id)).some(x => x.k === 'gc' && x.ev === e.id)), 'no GC on a swell');
  ok(swells.every(e => itemsOf(model, partOfEv.get(e.id)).some(x => x.k === 'goline' && x.ev === e.id)), 'a go line on every swell');
}

// ---- [8.3] "sempre secco": six texts, one per part, at the cut edge of the part's FIRST swell ----
{
  const texts = model.systems.flatMap(S => S.items.filter(it => it.k === 'text' && it.text === 'sempre secco').map(it => Object.assign({ sys: S.key }, it)));
  ok(texts.length === 6, 'six "sempre secco" texts on the page (got ' + texts.length + ')');
  const firsts = PARTS.map(p => swells.find(e => partOfEv.get(e.id) === p));
  let placed = 0;
  const GAP = C.engraving.layout.seccoGapSs != null ? C.engraving.layout.seccoGapSs : 0.15;
  for (const e of firsts) {
    const p = partOfEv.get(e.id);
    const t = texts.find(x => String(x.sys).split(':')[0] === String(p));
    // [2j.2, §540] at the cut edge's TOP: top-justified on the curve's top (yAt 'top'), the "s" the staccato-dot gap right of the edge
    if (t && near(t.t, e.onset + e.duration) && t.anchor === 'start' && t.yAt === 'top' && Math.abs(t.dxSs - GAP) < 1e-9 && t.ySs == null) placed++;
  }
  ok(Math.abs(GAP - 0.15) < 1e-9, 'the gap is the staccato-dot gap, 0.15 ss (registry seccoGapSs = ' + GAP + ')');
  ok(placed === 6, 'each on its part\'s first swell, at the cut edge\'s top: top-justified on the curve\'s top, 0.15 ss right of the edge (got ' + placed + ')');
  console.log('  sempre secco at: ' + firsts.map(e => ens.parts[partOfEv.get(e.id)].short + ' ' + (e.onset + e.duration).toFixed(2)).join(' · '));
}

// ---- nothing outside the run moved, item by item: the same engine over the IR with the 78 untagged, versus as built ----
{
  const B = JSON.parse(JSON.stringify(ir));
  const ids = new Set(swells.map(e => e.id));
  for (const e of B.events) if (ids.has(e.id)) { delete e.env; delete e.secco; }
  const MB = lay(B);
  const edges = new Set(); for (const e of swells) { edges.add(e.onset.toFixed(6)); edges.add((e.onset + e.duration).toFixed(6)); }
  const isRunItem = (it, p) => PARTS.includes(p) && ((it.ev && ids.has(it.ev)) || (it.t != null && edges.has((+it.t).toFixed(6))) || (it.t0 != null && edges.has((+it.t0).toFixed(6))));
  const isKnockOn = (it, p) => PARTS.includes(p) && it.k === 'glyph' && /^dyn-/.test(it.g) && it.t >= RUN[0] && it.t <= 624.1;
  let same = 0, moved = [], knockA = 0, knockB = 0;
  for (const S of model.systems) {
    const p = +String(S.key).split(':')[0], SB = MB.systems.find(x => String(x.key) === String(S.key));
    const keep = L => L.filter(it => !isRunItem(it, p) && !isKnockOn(it, p)).map(it => JSON.stringify(it));
    const a = keep(S.items), b = keep(SB ? SB.items : []);
    knockA += S.items.filter(it => isKnockOn(it, p)).length; knockB += (SB ? SB.items : []).filter(it => isKnockOn(it, p)).length;
    if (a.length === b.length && a.every((s, i) => s === b[i])) same += a.length;
    else moved.push(S.key + ' (' + a.length + ' vs ' + b.length + ')');
  }
  ok(moved.length === 0, 'nothing outside the run moved, item by item, every system (' + same + ' items unchanged' + (moved.length ? '; moved: ' + moved.join(', ') : '') + ')');
  console.log('  the §529 on-change knock-on: band marks in 526–624.1 on the six parts ' + knockB + ' → ' + knockA);
  ok(knockA >= knockB, 'the knock-on adds marks, never removes one (' + knockB + ' → ' + knockA + ')');
}
ok(!model.warnings.some(w => /surge|secco|template|dynamic glyphs missing/.test(w)), 'no layout warning about the surge, the word or the template');

console.log((fail ? 'FAIL' : 'PASS') + ' — test_surge_run: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
