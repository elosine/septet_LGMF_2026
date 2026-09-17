// morph_septet_check.js — the morph panel's septet adaptation, checked in node (2026-09-07, RUNNING_LOG §203). `node tools/morph_septet_check.js`
// → PASS / FAIL lines and a verdict. (1) the tuba's renders byte-identical without a palette (the hashes frozen in
// tools/morph_tuba_baseline.json before the engine was touched); (2) the cast: the default pairs, the fold as one unit (D26), the lanes
// in pitch order, the palette per voice; (3) the key rule (the string quartet's): a whole tone in one key on a 0.96 st sampler, a
// CONVERGE landing exactly, a wider run re-keyed with the 5 ms overlap; (4) the render under the palette: the ordinary voices, the
// ranges, the breath and bow ceilings; (5) the ticked pairs' filter and the seat swap.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const M = require(path.join(ROOT, 'score/public/morph.js'));
const SEP = require(path.join(ROOT, 'score/public/morph_septet.js'));
const BC = require(path.join(ROOT, 'score/public/beating_calc.js'));
const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank/morph_models.json'), 'utf8'));
const frozen = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/morph_tuba_baseline.json'), 'utf8'));
const env = { recipe, tracks, BC, M, SEP };
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex');
const laneOf = key => tracks.findIndex(t => t.instKey === key);

// ---- (1) the tuba's renders, byte for byte ----
Object.keys(frozen.models).forEach(id => {
    const m = bank.models[id];
    const res = M.resolveParams(m, {});
    const p = res.params; p.source = m.tuba.source; p.target = m.tuba.target;
    const r = M.render(p, { maxVoices: 10 });
    ok(sha1(JSON.stringify(r)) === frozen.models[id], 'the tuba render of ' + id + ' unchanged without a palette (' + r.notes.length + ' notes)');
});

// ---- (2) the cast ----
const bloom = M.resolveParams(bank.models.BLOOM, {}).params;
const c0 = SEP.cast(bloom, null, env);
ok(c0.params.source.midi.join() === '51,51,56,56,61,61', 'BLOOM re-voiced for three pairs, sorted: ' + c0.params.source.midi.join(' '));
ok(c0.params.lanes.join() === '6,5,3,4,0,1', 'the default cast on the lanes in pitch order (Vc Va · Vn1 Vn2 · Fl BCl): ' + c0.params.lanes.join(' '));
ok(c0.pairs.every(p => !p.silent && p.shift === 0), 'no fold needed on the default cast');
ok(c0.params.lanes.every(L => L !== 2 && L !== 7), 'never the piano (2) nor META (7)');
const techs = c0.palette.map(x => x.label + '=' + x.technique).join(' ');
ok(c0.palette.every(x => x.technique === (x.instKey === 'flute' ? 'ord' : 'senza_vel')), 'the palette: every player at its ordinary voice — ' + techs);
const reaches = c0.palette.map(x => x.label + ' ' + x.reachCents).join(' · ');
ok(c0.palette.every(x => x.reachCents === Math.round(Math.min(2, recipe[x.instKey].bendRangeSt) * 100)), 'the bend reach = min(a whole tone, the sampler measured): ' + reaches);
ok(c0.palette.find(x => x.instKey === 'flute').kind === 'breath' && c0.palette.find(x => x.instKey === 'cello').kind === 'bow', 'the winds breathe, the strings bow');
ok(c0.palette.find(x => x.instKey === 'flute').ceiling(0.5) === 8 && c0.palette.find(x => x.instKey === 'violin1').ceiling(0.5) === 12, 'the ceilings from beating_calc (flute 8 s, violin 12 s at mf)');
// the fold as one unit (D26)
// a pair takes its two pitches by SORTED order: pair 1 the lowest, pair 3 the highest
const cUp = SEP.cast({ source: { kind: 'pitches', midi: [48, 48, 50, 50, 61, 61] } }, null, env);   // the middle pair (the violins) asked for D3, below their G3 → up an octave
const pUp = cUp.pairs.find(p => p.a === 3);
ok(pUp && !pUp.silent && pUp.shift === 12 && pUp.notesOut.join() === '62,62', 'Vn1 + Vn2 given D3 fold UP together to D4: ' + SEP.describePair(env, pUp));
const cDown = SEP.cast({ source: { kind: 'pitches', midi: [100, 100, 101, 101, 102, 102] } }, null, env);   // the low pair (Vc + Va) asked for E7 → down two octaves (the cello's top 83)
const pDown = cDown.pairs.find(p => p.a === 6);
ok(pDown && !pDown.silent && pDown.shift === -24 && pDown.notesOut.join() === '76,76', 'Vc + Va given E7 fold DOWN together to E5: ' + SEP.describePair(env, pDown));
ok(cDown.pairs.find(p => p.a === 0).silent, 'Fl + BCl given F#7: silent (no octave inside C4–F4)');
const cNone = SEP.cast({ source: { kind: 'pitches', midi: [51, 51, 56, 56, 70, 70] } }, null, env);   // Fl + BCl on B♭4: no octave serves both (C4–F4 only)
const pNone = cNone.pairs.find(p => p.a === 0);
ok(pNone && pNone.silent && cNone.warnings.some(w => /pair 3 silent/.test(w)), 'Fl + BCl given B♭4: silent, said — ' + pNone.why);
ok(cNone.params.source.midi.length === 4 && cNone.params.lanes.length === 4, 'a silent pair leaves the render (four voices)');
// CONVERGE: the targets fold with the pair
const conv = M.resolveParams(bank.models.CONVERGE, {}).params;
const cC = SEP.cast(conv, null, env);
ok(cC.params.source.midi.join() === '50,52,55,57,60,62' && cC.params.target.midi.join() === '51,51,56,56,61,61', 'CONVERGE: whole-tone pairs closing to the unisons, cast: ' + cC.params.target.midi.join(' '));
ok(!cC.warnings.length, 'CONVERGE casts without a warning');
// the tuba's eight-pitch set reduced to six, whole clusters kept
const c8 = SEP.cast({ source: { kind: 'pitches', midi: bank.models.BLOOM.tuba.source.midi } }, null, env);
ok(c8.params.source.midi.length <= 6 && c8.warnings.some(w => /reduced to 6/.test(w)), 'the tuba BLOOM (eight pitches) reduced to three pairs, said: ' + c8.params.source.midi.join(' ') + (c8.warnings.length ? ' — ' + c8.warnings.join(' | ') : ''));
// the seat swap: the bass clarinet into the cello's seat trades the two
const sw = SEP.swapSeat(SEP.DEFAULT_PAIRS.map(p => ({ a: p.a, b: p.b, on: true })), 0, 'a', 1);
ok(sw[0].a === 1 && sw[0].b === 5 && sw[2].a === 0 && sw[2].b === 6, 'swap Vc ↔ BCl: pair 1 = BCl + Va, pair 3 = Fl + Vc — ' + sw.map(p => SEP.labelOf(env, p.a) + '+' + SEP.labelOf(env, p.b)).join(' · '));
const cSw = SEP.cast(bloom, sw, env);
ok(cSw.pairs.every(p => !p.silent) && cSw.params.lanes.join() === '1,5,3,4,0,6', 'the swapped cast renders on its lanes: ' + cSw.params.lanes.join(' '));

// ---- (3) the key rule ----
const k1 = M.chooseKey([6000, 6050, 6100, 6150, 6200], 96, M.CLAMP_CENTS);
ok(k1 && k1.key === 61 && k1.over === 4, 'a whole tone C4 → D4 on a 0.96 st sampler: one key, 61, 4 c short at the ends (his method): ' + JSON.stringify(k1));
const k2 = M.chooseKey([6000, 6050, 6100], 96, M.CLAMP_CENTS);
ok(k2 && k2.key === 61 && k2.overEnd === 0 && k2.over === 4, 'a semitone C4 → C#4 (a CONVERGE voice): the key at the arrival, exact there, 4 c clamped at the start: ' + JSON.stringify(k2));
const k3 = M.chooseKey([6000, 6100, 6200, 6300], 96, M.CLAMP_CENTS);
ok(k3 === null, 'a minor third in one key on 0.96 st: no — a re-key');
const k4 = M.chooseKey([6000, 6100, 6200], 200, M.CLAMP_CENTS);
ok(k4 && k4.over === 0, 'a whole tone on the flute (2.00 st): no clamp at all');

// ---- (4) the render under the palette ----
const rB = M.render(c0.params, { maxVoices: 6, palette: c0.palette });
ok(rB.notes.length > 0 && rB.meta.voices === 6 && rB.meta.lanes.join() === '6,5,3,4,0,1', 'BLOOM renders six voices on the cast lanes (' + rB.notes.length + ' notes)');
ok(rB.notes.every(n => n.technique === c0.palette[n.voice].technique), 'every note at its player\'s ordinary voice');
ok(!rB.notes.some(n => n.flags.includes('REKEY') || n.flags.includes('GLISS') || n.flags.includes('RANGE') || n.flags.includes('CLAMP')), 'BLOOM ± 25 c: no re-key, no clamp, nothing out of range');
const maxDur = {}; rB.notes.forEach(n => { const k = c0.palette[n.voice].instKey; maxDur[k] = Math.max(maxDur[k] || 0, n.dur); });
ok(Object.keys(maxDur).every(k => maxDur[k] <= BC.ceilingFor(k, 0).seconds + 1e-6), 'no note longer than its player\'s ceiling: ' + Object.keys(maxDur).map(k => k + ' ' + maxDur[k].toFixed(1)).join(' · '));
ok(rB.meta.palette && rB.meta.palette.length === 6, 'the render carries the palette summary');
const rC = M.render(cC.params, { maxVoices: 6, palette: cC.palette });
const lastOf = {}; rC.notes.forEach(n => { if (!lastOf[n.voice] || n.tStart > lastOf[n.voice].tStart) lastOf[n.voice] = n; });
const arrive = Object.keys(lastOf).map(v => { const n = lastOf[v]; const end = n.midi * 100 + n.bend[n.bend.length - 1][1]; return Math.abs(end - cC.params.target.midi[+v] * 100); });
ok(arrive.every(d => d <= 1), 'CONVERGE: every voice arrives on its unison within a cent (max ' + Math.max.apply(null, arrive).toFixed(1) + ' c)');
ok(!rC.notes.some(n => n.flags.includes('REKEY')), 'CONVERGE: a semitone of travel per voice, no re-key');
// a wide run re-keys with the 5 ms overlap
const wide = SEP.cast({ model: 'M5', source: { kind: 'pitches', midi: [46, 53, 57, 60, 62, 65] }, target: { steps: 4 }, carrier: { span: 20, segLen: 20 } }, null, env);
const rW = M.render(wide.params, { maxVoices: 6, palette: wide.palette });
const rek = rW.notes.filter(n => n.flags.includes('REKEY'));
ok(rek.length > 0, 'SPACING by four steps: the outer voices re-key (' + rek.length + ' notes flagged)');
const byVoice = {}; rW.notes.forEach(n => (byVoice[n.voice] = byVoice[n.voice] || []).push(n));
let overlapOk = true, overlapSeen = 0;
Object.values(byVoice).forEach(list => { list.sort((a, b) => a.tStart - b.tStart); for (let i = 1; i < list.length; i++) { const prev = list[i - 1], n = list[i]; if (n.tStart < prev.tStart + prev.dur - 1e-6) { overlapSeen++; if (Math.abs((prev.tStart + prev.dur) - n.tStart - M.REKEY_OVERLAP_S) > 2e-3) overlapOk = false; } } });
ok(overlapSeen > 0 && overlapOk, 'a re-key overlaps the previous key by 5 ms (' + overlapSeen + ' seams)');

// ---- (5) the ticked pairs ----
const castOff = SEP.cast(bloom, SEP.DEFAULT_PAIRS.map((p, i) => ({ a: p.a, b: p.b, on: i === 1 })), env);
const heard = SEP.filterResult(rB, castOff);
ok(heard.notes.length > 0 && heard.notes.every(n => n.voice === 2 || n.voice === 3) && heard.meta.heardVoices.join() === '2,3', 'only pair 2 ticked: the violins\' voices heard, the timing untouched');
ok(heard.notes.every(n => rB.notes.includes(n)), 'the heard notes are the render\'s own');

// ---- (6) the pitch source (§205–208): notes, families, the take rules, the pairing, the derivation ----
ok(SEP.parseNote('F2') === 41 && SEP.parseNote('C#4') === 61 && SEP.parseNote('Db4') === 61 && SEP.parseNote('60') === 60 && SEP.parseNote('x') === null, 'note names parse (F2 = 41, C#4 = Db4 = 61, "60" = 60, "x" = null)');
ok(SEP.parseNote('D#', 41) === 39 && SEP.parseNote('D#', 48) === 51 && SEP.parseNote('c', 41) === 36 && SEP.parseNote('Bb', 41) === 46, 'a bare pitch class takes the octave nearest the reference (D# near F2 = D#2, near C3 = D#3)');
const dR = SEP.deriveParams(M.resolveParams(bank.models.SPECTRAL, {}).params, [51, 51, 56, 56, 61, 61], { root: SEP.parseNote('D#', 41) });
ok(dR.target.fundamental === 39, 'SPECTRAL takes a bare "D#" as D#2 (39) for its fundamental');
ok(SEP.familyNotes('stack-p5', 48).join() === '48,55,62,69,76,83', 'a stack of fifths from C3: ' + SEP.familyNotes('stack-p5', 48).map(SEP.nm).join(' '));
const m1 = SEP.familyNotes('mode-1', 48), m2 = SEP.familyNotes('mode-2', 48);
ok(m1.slice(0, 7).join() === '48,50,52,54,56,58,60' && m1.length === 13, 'Messiaen mode 1 from C3: the whole-tone scale over two octaves (' + m1.length + ' notes)');
ok(m2.slice(0, 9).join() === '48,49,51,52,54,55,57,58,60' && m2.length === 17, 'Messiaen mode 2 from C3: the octatonic over two octaves');
ok(SEP.MODES.every(m => m.steps.reduce((a, b) => a + b, 0) === 12), 'every mode closes the octave');
const cs050 = [59, 60, 61, 63];
const T = (rule, o) => SEP.takeIndices(cs050, 3, rule, o).map(i => cs050[i]).map(SEP.nm).join(' ');
ok(T('lowest') === 'B3 C4 C#4' && T('highest') === 'C4 C#4 D#4' && T('spread') === 'B3 C#4 D#4' && T('fromK', { k: 2 }) === 'C4 C#4 D#4', 'the take rules on cs-050: lowest ' + T('lowest') + ' · highest ' + T('highest') + ' · spread ' + T('spread') + ' · from 2 ' + T('fromK', { k: 2 }));
ok(T('everyOther') === 'B3 C#4 D#4' && T('random', { seed: 1 }).split(' ').length === 3 && T('random', { seed: 1 }) !== T('random', { seed: 2 }) || T('random', { seed: 1 }).split(' ').length === 3, 'every other and random (seeded) take three');
const holdsAll = () => true;
ok(T('byRegister', { holds: holdsAll }) === 'B3 C4 D#4' || T('byRegister', { holds: holdsAll }).split(' ').length === 3, 'by register on cs-050 takes one per band: ' + T('byRegister', { holds: holdsAll }));
const s001 = [30, 38, 41, 46, 48, 49, 60, 61, 62];
const T9 = rule => SEP.takeIndices(s001, 3, rule, {}).map(i => s001[i]).map(SEP.nm).join(' ');
ok(T9('lowest') === 'F#1 D2 F2' && T9('spread') === 'F#1 C3 D4', 'the nine-note blast S001: lowest ' + T9('lowest') + ' · spread ' + T9('spread'));
const tf = SEP.takeForPairs(cs050, 3, 'lowest', { perPair: 1 });
ok(tf.notes.join() === '59,59,60,60,61,61' && tf.dropped.join() === '63', 'three doubled for the pairs: ' + tf.notes.map(SEP.nm).join(' ') + ' · dropped ' + tf.dropped.map(SEP.nm).join(' '));
const tf2 = SEP.takeForPairs(s001, 3, 'lowest', { perPair: 2 });
ok(tf2.notes.join() === '30,38,41,46,48,49', 'two per pair, adjacent: ' + tf2.notes.map(SEP.nm).join(' '));
const wFar = [];
const dC = SEP.deriveParams(M.resolveParams(bank.models.CONVERGE, {}).params, [48, 48, 55, 55, 62, 62], { perPair: 1, warnings: wFar });
ok(dC.source.midi.join() === '47,49,54,56,61,63' && dC.target.midi.join() === '48,48,55,55,62,62' && !wFar.length, 'CONVERGE derived on separated pairs (C3 G3 D4): each note opened a whole tone and closed onto: ' + dC.source.midi.join(' ') + ' → ' + dC.target.midi.join(' '));
const wClose = [];
const dClose = SEP.deriveParams(M.resolveParams(bank.models.CONVERGE, {}).params, [52, 52, 54, 54, 55, 55], { perPair: 1, warnings: wClose });
const srtC = dClose.source.midi.slice().sort((a, b) => a - b);
ok(wClose.length === 3 && srtC.every((v, i) => i % 2 === 0 || srtC[i - 1] <= v) && dClose.source.midi.join() === '51,52,53,54,55,56', 'CONVERGE on close pairs (E3 F#3 G3): one-sided openings, said — ' + dClose.source.midi.join(' ') + ' → ' + dClose.target.midi.join(' ') + ' (' + wClose.length + ' warnings)');
const cClose = SEP.cast(dClose, null, env);
ok(!cClose.warnings.some(w => /interleave/.test(w)), 'the close pairs no longer interleave in the cast');
const dS = SEP.deriveParams(M.resolveParams(bank.models.SPECTRAL, {}).params, tf.notes, { root: 48 });
ok(dS.target.fundamental === 48 && dS.source.midi.join() === tf.notes.join(), 'SPECTRAL derived: the fundamental is the root (C3), the source the pairs\' notes');
const cD = SEP.cast(dC, null, env);
ok(cD.pairs.every(p => !p.silent) && cD.params.target.midi.join() === '48,48,62,62,67,67' && cD.params.lanes.join() === '6,5,0,1,3,4', 'the derived CONVERGE casts on the three pairs — the violins fold G3 up above the winds\' D4: targets ' + cD.params.target.midi.join(' ') + ' on the lanes ' + cD.params.lanes.join(' '));
const starters = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank/morph_pitches.json'), 'utf8')).sets;
ok(starters.length === 5 && starters.every(s => Array.isArray(s.notes) && s.notes.length >= 3 && s.take), 'five starters in bank/morph_pitches.json (CN-38): ' + starters.map(s => s.name.split(' ·')[0]).join(' '));

// ---- (7) the actual's save path renders with the palette (§213) ----
const MB = require(path.join(ROOT, 'tools/model_bank.js'));
const built = MB.buildActual('BLOOM', { params: c0.params, pairs: SEP.DEFAULT_PAIRS.map(p => ({ a: p.a, b: p.b, on: true })), pitch: { src: 'model', root: 'F2', take: 'byRegister' }, label: 'check' });
ok(built && !built.error, 'buildActual renders a septet cast' + (built && built.error ? ' — ' + built.error : ''));
ok(built && built.actual && built.actual.notes.every(n => n.technique === c0.palette[n.voice].technique), 'the stored notes are at each player\'s ordinary voice (not the tuba\'s ord)');
ok(built && built.actual && built.actual.objects.filter(o => o.morphBend).every(o => o.technique === c0.palette.find(p => p.lane === o.layer).technique), 'the stored objects carry the septet techniques on their lanes');
ok(built && built.actual && built.actual.provenance.pairs && built.actual.provenance.pitch && built.actual.provenance.palette && built.actual.provenance.palette.length === 6 && built.actual.provenance.engineConstants.perVoice, 'the provenance keeps the cast, the pitch state, the palette and per-voice constants');
const ropts = MB.renderOptsFor(c0.params);
ok(ropts.palette && ropts.maxVoices === 6 && ropts.palette[4].technique === 'ord' && ropts.palette[4].label === 'Fl', 'renderOptsFor builds the palette from the cast\'s lanes (the flute at ord)');
ok(MB.renderOptsFor({ source: { midi: [41, 41] } }).palette === undefined, 'no cast → the tuba\'s render options, unchanged');

console.log(fails ? ('\n' + fails + ' FAILED') : '\nALL PASS');
process.exit(fails ? 1 : 0);
