// piano_cues_check.js — the piano's articulation points from a morph, checked in node (PLAN 1j; RUNNING_LOG §230). `node tools/piano_cues_check.js`
// → PASS / FAIL lines and a verdict. (1) the pure parts: the bend and the level at an instant, the apex rule as the score's, the
// dynamics ↔ height; (2) the moments of his BLOOM at 183 s (scores/piano-harmonics-test.json, grp-morph-01): 89 onsets · 54 peaks ·
// 89 ends, their pitches and levels; the re-key rule on a synthetic pair; (3) the score objects (the line as an empty note with its
// provenance); (4) ownedLines / strippedLines and a re-run that keeps a made note; (5) the view filter kind AND player; (6) the
// ensemble at an instant; the next line; the turn into a note.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const PC = require(path.join(ROOT, 'score/public/piano_cues.js'));
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const META_LAYER = +html.match(/const META_LAYER = (\d+);/)[1];
const pianoLane = tracks.findIndex(t => t.instKey === 'piano');
const O = { pianoLane, metaLayer: META_LAYER, laneLabels: tracks.map(t => t.short), instKeys: tracks.map(t => t.instKey) };
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const eq = (a, b, e) => Math.abs(a - b) <= (e || 1e-6);

// ---- (1) the pure parts ----
ok(PC.bendAt([[0, 0], [1, 100], [2, 0]], 0.5) === 50 && PC.bendAt([[0, 0], [1, 100]], 5) === 100 && PC.bendAt(null, 1) === 0, 'the bend at an instant: a straight line between points, held past the last');
const n1 = { sonifyNote: 60, startSeconds: 10, endSeconds: 12, morphBend: [[0, 0], [2, 100]], nodes: [{ pos: 0, y: 0 }, { pos: 0.5, y: 8 }, { pos: 1, y: 4 }] };
ok(eq(PC.pitchAt(n1, 11), 60.5) && eq(PC.levelAt(n1, 11), 8) && eq(PC.levelAt(n1, 10.5), 4), 'the pitch and the level at an instant');
ok(PC.apexOf(n1) && PC.apexOf(n1).idx === 1 && PC.apexOf(n1).pos === 0.5, 'the apex rule: the loudest interior node, at least as loud as both ends');
ok(PC.apexOf({ nodes: [{ pos: 0, y: 0 }, { pos: 1, y: 8 }] }) === null && PC.apexOf({ nodes: [{ pos: 0, y: 0 }, { pos: 0.5, y: 4 }, { pos: 1, y: 8 }] }) === null, 'a two-node ramp and a curve still rising at its end have no apex (the score\'s rule)');
ok(PC.dynHeight('ppp') === 0 && PC.dynHeight('fff') === 10 && eq(PC.dynHeight('mf'), 5.7) && PC.dynName(0) === 'ppp' && PC.dynName(10) === 'fff' && PC.dynName(4.3) === 'mp' && PC.dynName(5.7) === 'mf', 'ppp … fff ↔ the height in eight equal steps (NAMING §2.9)');
ok(PC.nm(21) === 'A0' && PC.nm(108) === 'C8' && PC.nm(44) === 'G#2', 'the note names');

// ---- (2) the moments of his BLOOM ----
const score = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores/piano-harmonics-test.json'), 'utf8'));
const gid = 'grp-morph-01';
const ms = PC.moments(score.objects, gid, O);
const count = k => ms.filter(m => m.kind === k).length;
ok(count('onset') === 89 && count('peak') === 54 && count('end') === 89, 'the BLOOM: 89 onsets · 54 peaks · 89 ends (' + count('onset') + ' · ' + count('peak') + ' · ' + count('end') + ')');
ok(ms.every((m, i) => i === 0 || m.t >= ms[i - 1].t) && new Set(ms.map(m => m.lane)).size === 6 && ms.every(m => m.lane !== pianoLane && m.lane !== META_LAYER), 'in time order, the six players, never the piano\'s lane');
const srcOf = m => score.objects.find(o => o.id === m.srcId);
ok(ms.filter(m => m.kind === 'onset').every(m => eq(m.t, srcOf(m).startSeconds)) && ms.filter(m => m.kind === 'end').every(m => eq(m.t, srcOf(m).endSeconds)), 'an onset is its note\'s start, an end its end');
ok(ms.filter(m => m.kind === 'peak').every(m => { const s = srcOf(m), ap = PC.apexOf(s); return ap && eq(m.t, s.startSeconds + ap.pos * (s.endSeconds - s.startSeconds), 0.0006) && eq(m.level, ap.y); }), 'a peak sits at its note\'s apex (to a thousandth), its level the apex\'s');
ok(ms.every(m => eq(m.srcPitch, PC.pitchAt(srcOf(m), m.t), 0.0006) && Math.abs(m.srcCents) <= 30 && m.srcMidi === srcOf(m).sonifyNote), 'each moment carries the player\'s pitch at that instant (the key plus the bend there, to a thousandth)');
ok(/^232 lines — 89 onsets · 54 peaks · 89 ends — Fl \d+/.test(PC.describe(ms, O)), 'describe: ' + PC.describe(ms, O));
// the re-key rule on a synthetic pair
const rk = [{ id: 'a', type: 'waveCurve', layer: 6, groupId: 'grp-morph-09', sonifyNote: 40, startSeconds: 0, endSeconds: 2.005, nodes: [{ pos: 0, y: 5 }, { pos: 1, y: 5 }] },
            { id: 'b', type: 'waveCurve', layer: 6, groupId: 'grp-morph-09', sonifyNote: 42, startSeconds: 2, endSeconds: 4, nodes: [{ pos: 0, y: 5 }, { pos: 1, y: 5 }] },
            { id: 'c', type: 'waveCurve', layer: 6, groupId: 'grp-morph-09', sonifyNote: 42, startSeconds: 4.5, endSeconds: 6, nodes: [{ pos: 0, y: 5 }, { pos: 1, y: 5 }] }];
const rm = PC.moments(rk, 'grp-morph-09', O);
ok(rm.length === 4 && rm.map(m => m.kind + '@' + m.t).join(' ') === 'onset@0 end@4 onset@4.5 end@6', 'a seamless re-key (the 5 ms overlap) gives neither an end nor an onset; a breath does: ' + rm.map(m => m.kind + '@' + m.t).join(' '));

// ---- (3) the score objects ----
const lines = PC.toScoreObjects(ms, gid, Object.assign({}, O, { startId: 7000 }));
ok(lines.length === 232 && lines.every(l => l.type === 'waveCurve' && l.layer === pianoLane && l.groupId === gid && l.sonifyNote === null && l.properties.cue && l.properties.cue.of === gid), 'the lines: empty notes on the piano lane in the morph\'s group, the provenance under properties.cue');
ok(lines.every(l => eq(l.endSeconds - l.startSeconds, 0.05) && l.nodes[0].y === 5 && l.nodes.length === 2), 'a nominal span, the stored height mf');
ok(lines.every(l => PC.isCueLine(l) && !PC.isCueNote(l) && PC.isCueBorn(l)), 'isCueLine / isCueNote / isCueBorn');
ok(lines[0].id === 'wc-7000' && lines[231].id === 'wc-7231' && lines.every(l => /^cue [●◆○] /.test(l.performanceNotes)), 'ids from startId; the performance note names the kind and the source');
ok(lines.some(l => l.color === PC.INST_COL.cello) && lines.some(l => l.color === PC.INST_COL.flute) && new Set(lines.map(l => l.color)).size === 6, 'the source player\'s colour on each line');
ok(lines.every(l => l.properties.cue.srcLane === (score.objects.find(o => o.id === l.properties.cue.srcId) || {}).layer), 'the provenance names the source note and its lane');

// ---- (4) ownedLines / strippedLines / a re-run keeps a made note ----
const withLines = score.objects.concat(lines);
ok(PC.ownedLines(withLines, gid).length === 232 && PC.ownedLines(score.objects, gid).length === 0, 'ownedLines finds exactly the morph\'s lines');
const made = JSON.parse(JSON.stringify(lines[10]));
PC.cueToNote(made, { pitch: 55, technique: 'harmonics', height: PC.dynHeight('p'), dur: 2 }, O);
ok(made.sonifyNote === 55 && made.technique === 'harmonics' && eq(made.nodes[0].y, 2.9) && eq(made.endSeconds - made.startSeconds, 2) && made.properties.cue.of === gid && PC.isCueNote(made), 'the turn into a note: the pitch, the voice, the height (p = 2.9), the length; the provenance kept');
ok(/^pno harmonics G3 p 2\.00 s ← /.test(made.performanceNotes), 'a made note\'s performance note: ' + made.performanceNotes);
const withMade = withLines.filter(l => l.id !== made.id).concat([made]);
ok(PC.ownedLines(withMade, gid).length === 231 && PC.ownedNotes(withMade, gid).length === 1 && PC.strippedLines(withMade, gid).length === score.objects.length + 1, 'a made note is not a line: stripping the lines keeps it');
const again = PC.moments(withMade, gid, O);
ok(again.length === 231 && !again.some(m => m.kind === made.properties.cue.kind && m.srcId === made.properties.cue.srcId), 'a re-run never feeds on the lines, and gives no fresh line for a moment whose note is made (231)');
ok(PC.moments(withMade, gid, Object.assign({}, O, { skipMade: false })).length === 232, 'skipMade: false → every moment again (232)');

// ---- (5) the filter ----
const F = PC.defaultFilter([0, 1, 3, 4, 5, 6]);
ok(lines.every(l => PC.shown(l, F)) && lines.every(l => PC.shown(l, null)), 'all shown at birth, and without a filter');
F.kinds.onset = false; F.kinds.end = false; Object.keys(F.players).forEach(k => { F.players[k] = (+k === 0); });
const vis = lines.filter(l => PC.shown(l, F));
ok(vis.length > 0 && vis.every(l => l.properties.cue.kind === 'peak' && l.properties.cue.srcLane === 0) && vis.length === ms.filter(m => m.kind === 'peak' && m.lane === 0).length, 'peaks + Fl alone → the flute\'s peaks only (' + vis.length + ')');
ok(PC.shown(made, F) && PC.shown(score.objects[0], F), 'a made note and an ordinary object are always shown');

// ---- (6) the ensemble at an instant · the next line · the piano\'s own ----
const ens = PC.ensembleAt(score.objects, 200, O);
ok(ens.length === 6 && new Set(ens.map(e => e.lane)).size === 6 && ens.every(e => e.pitch >= 40 && e.pitch <= 65 && Math.abs(e.cents) <= 30), 'at 200 s the six players sound, each with its pitch there (' + ens.map(e => O.laneLabels[e.lane] + ' ' + PC.nm(Math.round(e.pitch)) + (e.cents ? (e.cents > 0 ? '+' : '') + e.cents : '')).join(' ') + ')');
ok(PC.ensembleAt(score.objects, 182.9, O).length === 0, 'at 182.9 s, before the morph, nothing sounds there');
ok(PC.ensembleAt(withMade, made.startSeconds + 0.5, O).some(e => e.id === made.id && e.cue), 'a made note counts as the piano\'s own at its instant');
ok(eq(PC.nextAfter(withLines, 182.996, O), lines.find(l => l.startSeconds > 182.996 + 0.05).startSeconds) && PC.nextAfter(withLines, 182.996, O) > 183.04 && PC.nextAfter(score.objects, 999, O) === null, 'the next line after an instant skips the same moment (50 ms); none past the end');

console.log(fails ? ('\n' + fails + ' FAILED') : '\nALL PASS');
process.exit(fails ? 1 : 0);
