#!/usr/bin/env node
// test_morph_notation.js — PLAN 2h.2, the morph section's septet rules (docs/NOTATION_STANDARDS.md §3), checked in node.
//   node tools/test_morph_notation.js      → PASS count, FAIL lines, exit 1 on any failure
// (A) THE TUBA UNCHANGED: the shared library with no options, and the layout of the tuba's morph pages, hash to the values
//     frozen BEFORE the change (tools/fixtures/morph_notation_baseline.json); the tuba files are read in place from
//     for_seven_tubas (read-only) and skipped, said, when that repo is absent.
// (B) THE SEPTET, one block per rule: parts under META (§464 flag 6) · 100 samples/s (D47, 2f.7) · the crescendo absolute
//     with the fade weight in (D46, D32) · no floor, through the breath peaks, never above or below them (D47) · D44's
//     crescendo-only voices, alerted · D45's pitch figure: the speller, the tie, the threshold, written pitch.
// (C) THE HEADER ON THE PAGE: the heads in time order on their own lines, ledgers, signs, the slanted gliss line, the
//     cents over the destination head, one head for D44, the dynamic figure unchanged.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const TUBA = path.resolve(ROOT, '..', 'for_seven_tubas');
const J = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const MorphOv = require(path.join(ROOT, 'notation', 'lib', 'morph_overlays.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Morph = require(path.join(ROOT, 'score', 'public', 'morph.js'));
const Core = require(path.join(ROOT, 'score', 'public', 'sonify_core.js'));

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex');
const glyphs = J('notation/lib/glyphs.json');
const ens = J('notation/registry/ensemble.json');
const C = J('notation/registry/container.json');
const tech = J('notation/registry/techniques.json');
const frozen = J('tools/fixtures/morph_notation_baseline.json');
const score = J('scores/piece-septet.json');
const M1 = 'grp-morph-01', M2 = 'grp-morph-03';
const PARTS = ens.parts.map(p => p.part);
const OPTS = { maxLayer: ens.metaLayer, transposeOf: p => (ens.parts.find(x => x.part === p) || {}).transpose || 0 };

// ---- (A) the tuba unchanged ----
const pick = b => ({ part: b.part, T0: b.T0, T1: b.T1, extent: b.extent, qSteps: b.qSteps, acc: b.acc, overlays: b.overlays });
for (const g of [M1, M2])
  ok(sha1(JSON.stringify(MorphOv.forGroup(score.objects, g, PARTS).map(pick))) === frozen.forGroup['piece-septet:' + g],
    'no options = the tuba rules, byte for byte, on the septet\'s ' + g);
if (fs.existsSync(path.join(TUBA, 'scores', 'piece-s27.json'))) {
  const s27 = JSON.parse(fs.readFileSync(path.join(TUBA, 'scores', 'piece-s27.json'), 'utf8'));
  for (const g of ['grp-act-bloom-01-01', 'grp-act-balance-01-01', 'grp-act-converge-01-01'])
    ok(sha1(JSON.stringify(MorphOv.forGroup(s27.objects, g, null).map(pick))) === frozen.forGroup['piece-s27:' + g],
      'the tuba\'s ' + g + ' (piece-s27) unchanged');
  for (const n of ['morph-bloom', 'morph-balance', 'morph-converge']) {
    const ir = JSON.parse(fs.readFileSync(path.join(TUBA, 'notation', 'ir', n + '.ir.json'), 'utf8'));
    ok(sha1(JSON.stringify(Layout.layoutSection(ir, glyphs).systems.map(s => s.items))) === frozen.layout[n],
      'the tuba\'s ' + n + ' page lays out unchanged');
  }
} else console.log('  (skipped: for_seven_tubas not found — the tuba\'s own groups and pages unchecked)');

// ---- (B) the septet ----
const B1 = MorphOv.forGroup(score.objects, M1, null, M1, OPTS), B2 = MorphOv.forGroup(score.objects, M2, null, M2, OPTS);
const byPart = (B, p) => B.find(b => b.part === p);

// §464 flag 6: META is layer 7 and both groups carry a META curve there
{
  let threw = false; try { MorphOv.forGroup(score.objects, M1, null); } catch (e) { threw = true; }
  ok(score.objects.some(o => o.groupId === M1 && o.type === 'waveCurve' && o.layer === 7) && threw,
    'the bug reproduced: the tuba\'s layer < 10 takes M1\'s META curve (layer 7) as a part and dies on it (no morphBend)');
}
ok(B1.map(b => b.part).join() === '0,1,3,4,5,6' && B2.map(b => b.part).join() === '0,1,3,4,5,6', 'parts under META: six each, no piano, no META');

// D47 / 2f.7: 100 samples per second on both curves
for (const b of B1.concat(B2)) {
  const want = Math.max(100, Math.ceil((b.T1 - b.T0) * 100)) + 1;
  const cr = b.overlays.find(o => o.kind === 'cresc'), gl = b.overlays.find(o => o.kind === 'gliss');
  ok(cr.value.samples.length === want && (!gl || gl.value.samples.length === want),
    'part ' + b.part + ' of ' + (B1.includes(b) ? 'M1' : 'M2') + ': ' + want + ' samples over ' + (b.T1 - b.T0).toFixed(1) + ' s');
}

// D46 + D32: absolute, the fade weight in
const peakOf = b => Math.max(...b.tones.map(o => {
  let m = 0; for (let k = 0; k <= 400; k++) { const t = o.startSeconds + k / 400 * (o.endSeconds - o.startSeconds);
    m = Math.max(m, Core.evalWaveCurve(o, k / 400) * Morph.fadeWeight(o.cc7Fade, t)); } return m; }));
for (const b of B1.concat(B2)) {
  const S = b.L.samples, top = Math.max(...S), peak = peakOf(b);
  ok(Math.abs(top - peak) < 0.005 && top < 0.95, 'part ' + b.part + ' of ' + (B1.includes(b) ? 'M1' : 'M2') + ': the arc tops at the level reached, ' + top.toFixed(3) + ' (peak ' + peak.toFixed(3) + '), not normalised to 1');
}
ok(B1.every(b => b.L.samples[0] === 0), 'M1: every crescendo starts from nothing — the 17 s CC7 fade (D32) is in the drawn level');
ok(B2.every(b => Math.abs(b.L.samples[0] - 0.15) < 0.005), 'M2: no fade — every crescendo starts where the sound does (0.15)');

// D47: no floor; through the breath peaks; never above or below its anchors
ok(B1.every(b => Math.min(...b.L.samples) === 0), 'M1: no floor — the arc touches the baseline');
for (const b of B1.concat(B2)) {
  const A = b.L.anchors, S = b.L.samples, n = S.length - 1, idx = t => (t - b.T0) / (b.T1 - b.T0) * n;
  let atA = 0, out = 0;
  for (const a of A) atA = Math.max(atA, Math.abs(S[Math.round(idx(a[0]))] - a[1]));
  for (let k = 0; k + 1 < A.length; k++) {
    const lo = Math.min(A[k][1], A[k + 1][1]), hi = Math.max(A[k][1], A[k + 1][1]);
    for (let i = Math.ceil(idx(A[k][0])); i <= Math.floor(idx(A[k + 1][0])); i++) out = Math.max(out, lo - S[i], S[i] - hi);
  }
  ok(A.length >= b.tones.length && atA < 0.003 && out < 0.001,
    'part ' + b.part + ' of ' + (B1.includes(b) ? 'M1' : 'M2') + ': ' + A.length + ' anchors for ' + b.tones.length + ' breaths, through each (' + atA.toFixed(4) + '), never past them (' + out.toFixed(4) + ')');
}
{
  const A = [[0, 0.8], [10, 0.23], [26, 0.23], [34, 0.9]], M = MorphOv.tangentsTimed(A);
  let m = 1; for (let t = 10; t <= 26; t += 0.1) m = Math.min(m, MorphOv.cromTimed(A, t, M));
  ok(m >= 0.23 - 1e-9, 'the limit: two equal troughs 16 s apart hold level (min ' + m.toFixed(4) + '; plain Catmull-Rom sagged to ≈ 0.15)');
}

// D44: under 20 c → crescendo-only, alerted every time
for (const p of [0, 1]) {
  const b = byPart(B2, p);
  ok(b.heads.length === 1 && !b.overlays.some(o => o.kind === 'gliss') && b.overlays.find(o => o.kind === 'header').value.oneHead,
    'M2 part ' + p + ' (' + b.extent.toFixed(1) + ' c): one head, no gliss curve');
  ok(b.alerts.length === 1 && /^D44: part /.test(b.alerts[0]), 'M2 part ' + p + ': the D44 alert said');
}
ok(B1.every(b => b.alerts.length === 0), 'M1: no alerts');
ok(B2.filter(b => b.part > 1).every(b => b.alerts.length === 0 && b.overlays.some(o => o.kind === 'gliss')), 'M2\'s travellers: gliss curves, no alerts');

// D45: the speller, the tie, the threshold
const Q = (step, alterQ, octave) => ((octave + 1) * 24 + { C: 0, D: 4, E: 8, F: 10, G: 14, A: 18, B: 22 }[step] + alterQ);
const spellStr = r => r.spelled.step + (r.acc || '') + r.spelled.octave;
ok(spellStr(MorphOv.spellQ(Q('D', 3, 4), 1)) === 'EquarterFlat4', 'never three-quarter: D¾♯4 is written E¼♭4');
ok(spellStr(MorphOv.spellQ(Q('A', 2, 3), 1)) === 'Bflat3' && spellStr(MorphOv.spellQ(Q('A', 2, 3), -1)) === 'Asharp3', 'equal signs: the letter of travel — rising B♭3, falling A♯3');
ok(spellStr(MorphOv.spellQ(Q('E', 1, 4), 1)) === 'FquarterFlat4' && spellStr(MorphOv.spellQ(Q('E', 1, 4), -1)) === 'EquarterSharp4', 'E¼♯ / F¼♭ by the direction of travel');
ok(spellStr(MorphOv.spellQ(Q('B', 1, 3), 1)) === 'CquarterFlat4', 'across the octave: B3 + 50 c rising is C¼♭4');
ok(spellStr(MorphOv.spellQ(Q('E', 2, 4), 1)) === 'F4', 'a natural beats any sign: E♯4 is F4');
{
  const g = MorphOv.nearestGrid;
  ok(g(6025, 6000).grid === 6000 && g(6025, 6000).residual === 25, 'the tie at 25 c spells toward the start: C +25');
  ok(g(5975, 6000).grid === 6000 && g(5975, 6000).residual === -25, 'the tie at 25 c spells toward the start: C −25');
  ok(g(6026, 6000).grid === 6050 && g(6026, 6000).residual === -24, 'past the tie, the nearest: C¼♯ −24');
}
const fig = b => b.heads.map(h => h.spelled.step + ({ flat: '♭', sharp: '♯', quarterFlat: '¼♭', quarterSharp: '¼♯', natural: '♮' }[h.acc] || '') + h.spelled.octave + (h.cents ? ' ' + h.cents : '')).join(' → ');
const want1 = { 0: 'A5 → A5 +25', 1: 'D5 → D5 −25', 3: 'D5 → D5 +25', 4: 'A5 → A5 −25', 5: 'D5 → D5 −25', 6: 'C4 → C4 +25' };
const want2 = { 0: 'C4', 1: 'E3', 3: 'A3 → B♭3', 4: 'C4 → D4 −14', 5: 'A3 → B♭3', 6: 'D2 → E¼♭2' };
for (const p of PARTS.filter(p => want1[p])) ok(fig(byPart(B1, p)) === want1[p], 'M1 part ' + p + ': ' + fig(byPart(B1, p)) + ' (§474: ' + want1[p] + ')');
for (const p of PARTS.filter(p => want2[p])) ok(fig(byPart(B2, p)) === want2[p], 'M2 part ' + p + ': ' + fig(byPart(B2, p)) + ' (§474: ' + want2[p] + ')');
ok(byPart(B1, 1).heads[0].spelled.octave === 5 && byPart(B2, 1).heads[0].spelled.step === 'E', 'the bass clarinet in written pitch (+M9): sounding C4 → D5, D2 → E3');
ok(byPart(B2, 6).dest.residual === -2 && byPart(B2, 6).heads[1].cents === null, 'under 7 c the residual is not written: the cello\'s E¼♭ −2');
{
  const b0 = MorphOv.forPart(score.objects, M2, 6, 'x', Object.assign({}, OPTS, { centsMin: 0 }));
  ok(b0.heads[1].cents === '−2', '--centsMin 0 writes it: E¼♭ −2 (his "a future piece may set 0")');
}

// ---- (C) the header on the page ----
{
  const overlays = B1.concat(B2).flatMap(b => b.overlays.filter(o => o.kind === 'header'));
  const doc = { irVersion: '0.1', id: 'morph-header-test', source: { score: 'piece-septet', window: [180, 440], parts: PARTS },
    events: [], chunks: [], overlays };
  const model = Layout.layoutSection(doc, glyphs, Object.assign({ frameParts: PARTS, ensemble: ens, techniques: tech }, C.engraving.layout));
  const clefOf = p => (ens.parts.find(x => x.part === p) || {}).clef;
  const at = (p, t) => { const s = model.systems.find(x => x.key === p || x.key === p + ':0'); return s.items.filter(i => i.t === t); };
  for (const b of B1.concat(B2)) {
    const tag = (B1.includes(b) ? 'M1' : 'M2') + ' part ' + b.part;
    const it = at(b.part, b.T0), heads = it.filter(i => i.g === 'notehead-open').sort((a, c) => a.dxSs - c.dxSs);
    const yWant = b.heads.map(h => Layout.staffPos(h.spelled, clefOf(b.part)));
    ok(heads.length === b.heads.length && heads.every((h, k) => h.ySs === yWant[k]), tag + ': ' + b.heads.length + ' head(s) on the written lines ' + yWant.join(' → ') + ' (' + clefOf(b.part) + ')');
    ok(heads.every(h => h.dxSs + glyphs.notehead.open.wSs / 2 <= -0.44), tag + ': the figure ends before the go line');
    const ledg = it.filter(i => i.k === 'ledger').length, wantLedg = yWant.reduce((n, y) => n + Layout.ledgersFor(y).length, 0);
    ok(ledg === wantLedg, tag + ': ' + wantLedg + ' ledger line(s)');
    const accs = it.filter(i => /^accidental-/.test(i.g || '')).map(i => i.g.replace('accidental-', '')).sort().join();
    ok(accs === b.heads.map(h => h.acc).filter(Boolean).sort().join(), tag + ': the signs ' + (accs || 'none'));
    const gl = it.filter(i => i.k === 'glissline'), txt = it.filter(i => i.k === 'text');
    if (b.heads.length === 2) {
      ok(gl.length === 1 && gl[0].ySs === yWant[0] && gl[0].y1Ss === yWant[1] && gl[0].dx0Ss > heads[0].dxSs && gl[0].dx1Ss < heads[1].dxSs,
        tag + ': the gliss line from the start head to the destination head');
      const cents = b.heads[1].cents;
      ok(cents ? (txt.length === 1 && txt[0].text === cents && txt[0].dxSs === heads[1].dxSs && txt[0].ySs > Math.max(yWant[1], 2)) : txt.length === 0,
        tag + ': ' + (cents ? 'the cents ' + cents + ' over the destination head, clear of the staff' : 'no cents'));
    } else ok(gl.length === 0 && txt.length === 0, tag + ': D44 — one head, no gliss line, no cents');
    ok(it.some(i => i.k === 'niente') && it.some(i => i.k === 'dynarrow') && it.some(i => i.g === 'dyn-fff'), tag + ': niente · arrow · fff (D46)');
    // §479: the dynamic figure never meets the heads — on the house row, or a standard spacer under the lowest head or ledger
    {
      const L = C.engraving.layout, gap = (L.dynArrow && L.dynArrow.gapSs) || 0.45, fffH = glyphs.dynamic.fff.hSs;
      const low = Math.min(...heads.map(h => h.ySs - glyphs.notehead.open.hSs / 2), ...it.filter(i => i.k === 'ledger').map(i => i.ySs));
      const dy = it.find(i => i.g === 'dyn-fff').ySs, same = it.filter(i => i.k === 'niente' || i.k === 'dynarrow').every(i => i.ySs === dy);
      ok(same && dy <= L.dynY + 1e-9 && dy + fffH / 2 <= low - gap + 1e-9 && (dy === L.dynY || Math.abs(dy + fffH / 2 - (low - gap)) < 1e-9),
        tag + ': the dynamic row at ' + dy.toFixed(2) + ' ss clears the heads\' lowest ink ' + low.toFixed(2) + ' (house row ' + L.dynY + ')');
    }
  }
  ok(!(model.warnings || []).some(w => /header/.test(w)), 'no header overlay unconsumed');
}

// ---- D50 (§503): the piano's written dynamics in the morph section come from the ENSEMBLE, page only ----
// Three guards, so the marks cannot silently go: (1) the MAIN file's recorded build carries the rule, so R
// recomputes it; (2) the IR's overlays equal the rule computed now from the save (one copy: ensemble_dyn.js);
// (3) the drawn marks equal the table the composer approved on 2026-09-14 — a save edit that moves any of
// them fails here and is looked at, never absorbed.
{
  const EDyn = require(path.join(ROOT, 'notation', 'lib', 'ensemble_dyn.js'));
  const ir = J('notation/ir/piece-septet.ir.json');
  ok(/--ensembleDyn 205-428@2/.test(ir.provenance.build || ''), 'D50: the MAIN build records --ensembleDyn 205-428@2');
  const res = EDyn.marksFor(score.objects, { part: 2, t0: 205, t1: 428, others: [0, 1, 3, 4, 5, 6], bands: C.engraving.layout.dynamicBands });
  const devOf = new Map(ir.overlays.filter(o => o.kind === 'engraving').map(o => [o.target.event, (o.value && o.value.device) || {}]));
  const pno = ir.events.filter(e => e.source && res.marks.has(e.source.objectId));
  ok(pno.length === 44, 'D50: all 44 piano notes of the morph section found in the IR (got ' + pno.length + ')');
  ok(pno.every(e => (devOf.get(e.id) || {}).dynFixed === res.marks.get(e.source.objectId)), 'D50: every IR dynFixed equals the rule computed from the save now');
  const model = Layout.layoutSection(ir, glyphs, Object.assign({ frameParts: PARTS, ensemble: ens, techniques: tech }, C.engraving.layout));
  const drawn = [];
  for (const s of model.systems) if (s.part === 2) for (const it of s.items) if (it.k === 'glyph' && /^dyn-/.test(it.g) && it.t >= 205 && it.t <= 428.5) drawn.push(it.t.toFixed(2) + ' ' + it.g.slice(4));
  drawn.sort();
  const FROZEN = ['205.85 f', '212.84 ff', '217.55 f', '222.29 f', '227.09 ff', '231.71 ff', '237.63 f', '242.65 mf', '250.29 pp', '256.55 mp',
    '269.13 f', '274.13 ff', '278.34 ff', '282.96 f', '286.68 mp', '291.34 pp', '294.07 ppp', '298.77 ppp', '318.48 pp', '327.27 f', '327.51 ff',
    '339.80 f', '345.48 f', '350.30 f', '359.00 f', '369.92 mf', '375.61 f', '384.92 f', '402.47 f', '407.97 mf', '416.66 mf', '427.75 ppp'];
  ok(JSON.stringify(drawn) === JSON.stringify(FROZEN), 'D50: the drawn piano marks equal the approved table (32: one per onset, the 327.51 ff, no mark on 345.67 / 385.14)' +
    (JSON.stringify(drawn) === JSON.stringify(FROZEN) ? '' : ' — got ' + drawn.join(' · ')));
}

console.log('test_morph_notation: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
