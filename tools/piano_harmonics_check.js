// piano_harmonics_check.js — the piano's harmonics at a morph's re-breaths, checked in node (PLAN 1i, the first pass; RUNNING_LOG §218).
// `node tools/piano_harmonics_check.js` → PASS / FAIL lines and a verdict. (1) one harmonic for one pitch: at the pitch, an octave
// above, the rounding as the detune, the fold at both ends, the ceiling never reached un-shifted; (2) the whole part on his test
// score's BEATING BLOOM (scores/piano-harmonics-test.json, grp-morph-01): a note per re-breath, the coincident same-key merge, every
// key within the technique, every detune within a quarter-tone, the levels; (3) the score objects' fields; (4) ownedBy / stripped and
// a re-run that does not feed on its own output; (5) the morph found at the playhead.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const PH = require(path.join(ROOT, 'score/public/piano_harmonics.js'));
const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const META_LAYER = +html.match(/const META_LAYER = (\d+);/)[1];
const pianoLane = tracks.findIndex(t => t.instKey === 'piano');
const harm = recipe.piano.techniques.find(t => t.key === 'harmonics');
const O = { keyLo: harm.rangeLow, keyHi: harm.rangeHigh, pianoLane: pianoLane, metaLayer: META_LAYER, laneLabels: tracks.map(t => t.short) };
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };

// ---- (1) one harmonic for one pitch ----
ok(pianoLane === 2 && harm.channel === 3 && harm.rangeLow === 21 && harm.rangeHigh === 77, 'the recipe: the piano on lane 2, harmonics on channel 3, keys 21–77');
let h = PH.harmonicFor(44, O);
ok(h.ok && h.key === 32 && h.sounds === 44 && h.detuneCents === 0 && h.fold === 0 && h.partial === 2 && h.string === 32, 'G#2 at the pitch → the key G#1, its octave harmonic sounds G#2 exactly');
h = PH.harmonicFor(44.17, O);
ok(h.ok && h.key === 32 && h.detuneCents === -17, 'G#2 +17 c → the same key; the piano 17 c flat of the player (the detune he asked for)');
h = PH.harmonicFor(44.6, O);
ok(h.ok && h.key === 33 && h.sounds === 45 && h.detuneCents === 40, 'G#2 +60 c → the nearest key A1 (sounds A2), 40 c sharp');
h = PH.harmonicFor(44, Object.assign({}, O, { octave: 1 }));
ok(h.ok && h.key === 44 && h.sounds === 56 && h.detuneCents === 0 && h.fold === 0, 'G#2 an octave above → the key G#2, sounds G#3');
h = PH.harmonicFor(95, O);
ok(h.ok && h.key === 71 && h.sounds === 83 && h.fold === -1 && h.detuneCents === 0, 'B6 at the pitch: the key B5 is past F5 → folded an octave down (B4 sounds B5), the pitch class kept');
h = PH.harmonicFor(80, Object.assign({}, O, { octave: 1 }));
ok(h.ok && h.key === 68 && h.sounds === 80 && h.fold === -1, 'G#5 an octave above: no key for G#6 → folded down onto the pitch itself');
h = PH.harmonicFor(30, O);
ok(h.ok && h.key === 30 && h.sounds === 42 && h.fold === 1, 'F#1 at the pitch: the key F#0 is below A0 → folded up (sounds F#2)');
ok(!PH.harmonicFor(NaN, O).ok, 'no pitch → no harmonic, said so');
let above = 0; for (let k = O.keyLo; k <= O.keyHi; k++) if (k + 12 > 101) above++;
ok(above === 0, 'un-shifted, no key sounds above the ceiling F7 (101)');
ok(PH.nm(44) === 'G#2' && PH.nm(21) === 'A0' && PH.nm(77) === 'F5' && PH.nm(101) === 'F7', 'the note names');

// ---- (2) the whole part on his test score ----
const score = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores/piano-harmonics-test.json'), 'utf8'));
const gid = 'grp-morph-01';
const rb = PH.reBreaths(score.objects, gid, O);
ok(rb.length === 89, 'the BEATING BLOOM at 183 s: 89 re-breaths read from the six players\' lanes (' + rb.length + ')');
ok(rb.every(b => b.lane !== pianoLane && b.lane !== META_LAYER) && new Set(rb.map(b => b.lane)).size === 6, 'none on the piano\'s lane or the META layer; all six players present');
ok(rb.every((b, i) => i === 0 || b.t >= rb[i - 1].t), 'in time order');
ok(Math.abs(rb[0].t - 182.996) < 1e-6 && rb.some(b => b.cents !== 0), 'the first re-breath is the placement; the pitches carry the bend\'s first point (some re-breaths mid-glide)');
const gen = PH.generate(score.objects, gid, O);
const S = gen.summary;
ok(gen.notes.length + S.merged === 89 && S.skipped === 0, 'a note per re-breath, the coincident same-key ones merged: ' + gen.notes.length + ' notes, ' + S.merged + ' merged, none skipped');
ok(S.merged >= 3, 'the opening chord: the pairs\' doubled pitches re-breathe together → merged (' + S.merged + ')');
ok(gen.notes.every(n => n.key >= O.keyLo && n.key <= O.keyHi), 'every key within the technique');
ok(gen.notes.every(n => Math.abs(n.detuneCents) <= 50) && S.detuneMax <= 50, 'every detune within a quarter-tone (max ' + S.detuneMax + ' c, mean ' + S.detuneMean + ')');
ok(gen.notes.every(n => n.level === 7), 'the level 7 by default');
ok(PH.generate(score.objects, gid, Object.assign({}, O, { level: null })).notes.every(n => n.level > 0 && n.level <= 10), 'level null → each source note\'s own peak');
ok(gen.notes.every(n => n.dur > 0.05 && n.dur <= 12), 'the durations are the source notes\' own');
ok(PH.generate(score.objects, gid, Object.assign({}, O, { maxDurS: 2 })).notes.every(n => n.dur <= 2), 'maxDurS caps them');
const gen1 = PH.generate(score.objects, gid, Object.assign({}, O, { octave: 1 }));
ok(gen1.notes.length === gen.notes.length && gen1.notes.every((n, i) => n.sounds === gen.notes[i].sounds + 12 || n.fold !== 0), 'an octave above: the same notes, each sounding an octave higher (or folded when no key)');
ok(/89 re-breaths → \d+ piano harmonics/.test(PH.describe(gen)) && /at the pitch/.test(PH.describe(gen)), 'describe: ' + PH.describe(gen));

// ---- (3) the score objects ----
const objs = PH.toScoreObjects(gen, Object.assign({}, O, { startId: 5000 }));
ok(objs.length === gen.notes.length && objs.every(o => o.type === 'waveCurve' && o.layer === pianoLane && o.groupId === gid && o.technique === 'harmonics' && o.sonifyNote >= 21 && o.sonifyNote <= 77), 'plain notes on the piano lane at harmonics, in the morph\'s group');
ok(objs.every(o => o.nodes.length === 2 && o.nodes[0].y === 7 && o.nodes[1].y === 7 && o.segments.length === 1), 'a flat curve at the level');
ok(objs.every(o => o.properties.pianoHarmonics && o.properties.pianoHarmonics.of === gid && o.properties.pianoHarmonics.partial === 2 && o.properties.pianoHarmonics.sounds === o.sonifyNote + 12), 'each carries its provenance (of, string, partial, sounds, detune, fold)');
ok(objs[0].id === 'wc-5000' && objs[objs.length - 1].id === 'wc-' + (5000 + objs.length - 1), 'ids from startId, sequential');
ok(objs.every(o => o.startSeconds >= 182.996 && o.endSeconds > o.startSeconds && o.performanceNotes.indexOf('pno harmonic') === 0), 'placed at the re-breaths, the performance note says what it is');
ok(objs.some(o => /Vc G#2/.test(o.performanceNotes)), 'the performance note names the player and the pitch (Vc G#2 …)');

// ---- (4) ownedBy / stripped / a re-run ----
const withThem = score.objects.concat(objs);
ok(PH.ownedBy(withThem, gid).length === objs.length && PH.ownedBy(score.objects, gid).length === 0, 'ownedBy finds exactly the piano harmonics of the group');
ok(PH.stripped(withThem, gid).length === score.objects.length && PH.stripped(withThem, gid).every(o => !PH.isPianoHarmonic(o)), 'stripped removes exactly them');
const again = PH.generate(withThem, gid, O);
ok(again.notes.length === gen.notes.length && JSON.stringify(again.notes) === JSON.stringify(gen.notes), 'a re-run on a score that already has them gives the same part (never feeds on its own output)');
ok(PH.morphGroups(withThem, O)[0].harmonics === objs.length && PH.morphGroups(withThem, O)[0].notes === 89, 'morphGroups counts the notes and the harmonics apart');

// ---- (5) the morph at the playhead ----
const gs = PH.morphGroups(score.objects, O);
ok(gs.length === 1 && gs[0].groupId === gid && /BEATING BLOOM/.test(gs[0].label), 'one morph in the score, labelled from its marker');
ok(PH.findMorphAt(score.objects, 200, O) && PH.findMorphAt(score.objects, 200, O).groupId === gid, 'the playhead at 200 s is inside it');
ok(PH.findMorphAt(score.objects, 100, O) === null && PH.findMorphAt(score.objects, 400, O) === null, 'at 100 s and 400 s, nothing');

console.log(fails ? ('\n' + fails + ' FAILED') : '\nALL PASS');
process.exit(fails ? 1 : 0);
