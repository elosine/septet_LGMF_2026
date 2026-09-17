// piano_cues.js — the CLI of the piano's articulation points from a morph (PLAN 1j step 2; RUNNING_LOG §230).
//
//   node tools/piano_cues.js <score name | path> [--group grp-morph-01] [--at 200] [--write] [--strip] [--force]
//
// Reads the score (scores/<name>.json unless a path is given), finds the morph (--group, or the one at --at seconds, or the only
// one), prints its moments as a table (t · kind · player · pitch · level) and the summary. --write replaces that morph's lines still
// without a pitch in the file (the notes made from lines stay; the piece file only with --force); --strip removes them instead. The
// generator is score/public/piano_cues.js; the button *lines → piano* on the morph panel does the same in the app.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const PC = require(path.join(ROOT, 'score/public/piano_cues.js'));
const PH = require(path.join(ROOT, 'score/public/piano_harmonics.js'));   // morphGroups / findMorphAt: the same way of naming the morph
const USAGE = 'usage: node tools/piano_cues.js <score name | path> [--group gid] [--at sec] [--write] [--strip] [--force]';

const args = process.argv.slice(2);
if (!args.length || /^--/.test(args[0])) { console.log(USAGE); process.exit(1); }
const flag = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; return (v != null && !/^--/.test(v)) ? v : true; };
const has = k => args.indexOf(k) >= 0;
const file = (/\.json$/i.test(args[0]) || /[\\/]/.test(args[0])) ? path.resolve(args[0]) : path.join(ROOT, 'scores', args[0] + '.json');

const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const META_LAYER = +html.match(/const META_LAYER = (\d+);/)[1];
const pianoLane = tracks.findIndex(t => t.instKey === 'piano');
const O = { pianoLane, metaLayer: META_LAYER, laneLabels: tracks.map(t => t.short), instKeys: tracks.map(t => t.instKey) };

const raw = fs.readFileSync(file, 'utf8');
const score = JSON.parse(raw);
const groups = PH.morphGroups(score.objects, O);
let g = null;
if (has('--group')) g = groups.find(x => x.groupId === flag('--group')) || null;
else if (has('--at')) g = PH.findMorphAt(score.objects, +flag('--at'), O);
else if (groups.length === 1) g = groups[0];
if (!g) {
    console.error('no morph chosen — the score has: ' + (groups.map(x => x.groupId + ' "' + x.label + '" ' + x.start.toFixed(2) + '–' + x.end.toFixed(2) + ' s').join(' · ') || 'none'));
    console.error(USAGE); process.exit(1);
}

function writeBack() {
    if (/piece-septet/i.test(path.basename(file)) && !has('--force')) { console.error('refusing to write the piece file without --force'); process.exit(2); }
    const m = raw.match(/^\{\r?\n( +)"/), indent = m ? m[1].length : 0;
    fs.writeFileSync(file, indent ? JSON.stringify(score, null, indent) : JSON.stringify(score));
}

const had = PC.ownedLines(score.objects, g.groupId).length, kept = PC.ownedNotes(score.objects, g.groupId).length;
if (has('--strip')) {
    score.objects = PC.strippedLines(score.objects, g.groupId);
    console.log('stripped ' + had + ' lines of ' + g.groupId + (kept ? ' (' + kept + ' notes made from lines kept)' : '') + (has('--write') ? '' : ' (dry — add --write)'));
    if (has('--write')) { writeBack(); console.log('wrote ' + file); }
    process.exit(0);
}

const ms = PC.moments(score.objects, g.groupId, O);
console.log(g.groupId + ' "' + g.label + '" ' + g.start.toFixed(3) + '–' + g.end.toFixed(3) + ' s · ' + g.notes + ' morph notes' + (had ? ' · ' + had + ' lines already' : '') + (kept ? ' · ' + kept + ' notes made from lines' : ''));
console.log(['t', 'kind', 'player', 'pitch', 'level'].join('\t'));
ms.forEach(m => console.log([m.t.toFixed(3), PC.KIND_MARK[m.kind] + ' ' + m.kind, O.laneLabels[m.lane], PC.nm(m.srcMidi) + (m.srcCents ? (m.srcCents > 0 ? '+' : '') + m.srcCents + 'c' : ''), m.level.toFixed(1)].join('\t')));
console.log('\n' + PC.describe(ms, O));

if (has('--write')) {
    score.objects = PC.strippedLines(score.objects, g.groupId);
    const objs = PC.toScoreObjects(ms, g.groupId, Object.assign({}, O, { startId: score.nextId || 1 }));
    score.objects = score.objects.concat(objs);
    score.nextId = (score.nextId || 1) + objs.length;
    writeBack();
    console.log('wrote ' + objs.length + ' lines into ' + file + (had ? ' (replacing ' + had + ')' : '') + (kept ? ' — ' + kept + ' made notes kept' : ''));
}
