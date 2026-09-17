// piano_harmonics.js — the CLI of the piano's harmonics at a morph's re-breaths (PLAN 1i, the first pass; RUNNING_LOG §218).
//
//   node tools/piano_harmonics.js <score name | path> [--group grp-morph-01] [--at 200] [--octave 0|1] [--level 7|source]
//                                 [--max-dur S] [--write] [--strip] [--force]
//
// Reads the score (scores/<name>.json unless a path is given), finds the morph (--group, or the one at --at seconds, or the only one),
// prints the part as a table and its summary. --write replaces that morph's piano harmonics in the file (the piece file only with
// --force); --strip removes them instead. The generator is score/public/piano_harmonics.js; the button on the morph panel does the
// same in the app (morph_panel.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const PH = require(path.join(ROOT, 'score/public/piano_harmonics.js'));
const USAGE = 'usage: node tools/piano_harmonics.js <score name | path> [--group gid] [--at sec] [--octave 0|1] [--level 7|source] [--max-dur S] [--write] [--strip] [--force]';

const args = process.argv.slice(2);
if (!args.length || /^--/.test(args[0])) { console.log(USAGE); process.exit(1); }
const flag = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; return (v != null && !/^--/.test(v)) ? v : true; };
const has = k => args.indexOf(k) >= 0;
const file = (/\.json$/i.test(args[0]) || /[\\/]/.test(args[0])) ? path.resolve(args[0]) : path.join(ROOT, 'scores', args[0] + '.json');

const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const META_LAYER = +html.match(/const META_LAYER = (\d+);/)[1];
const pianoLane = tracks.findIndex(t => t.instKey === 'piano');
const harm = recipe.piano.techniques.find(t => t.key === 'harmonics');
const lv = flag('--level', '7');
const O = { keyLo: harm.rangeLow, keyHi: harm.rangeHigh, pianoLane: pianoLane, metaLayer: META_LAYER, laneLabels: tracks.map(t => t.short),
            octave: (+flag('--octave', 0)) | 0, level: lv === 'source' ? null : +lv, maxDurS: has('--max-dur') ? +flag('--max-dur') : null };

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
    const m = raw.match(/^\{\r?\n( +)"/), indent = m ? m[1].length : 0;   // the app saves compact JSON; a pretty file stays pretty
    fs.writeFileSync(file, indent ? JSON.stringify(score, null, indent) : JSON.stringify(score));
}

if (has('--strip')) {
    const before = score.objects.length;
    score.objects = PH.stripped(score.objects, g.groupId);
    console.log('stripped ' + (before - score.objects.length) + ' piano harmonics of ' + g.groupId + (has('--write') ? '' : ' (dry — add --write)'));
    if (has('--write')) { writeBack(); console.log('wrote ' + file); }
    process.exit(0);
}

const gen = PH.generate(score.objects, g.groupId, O);
console.log(g.groupId + ' "' + g.label + '" ' + g.start.toFixed(3) + '–' + g.end.toFixed(3) + ' s · ' + g.notes + ' morph notes' + (g.harmonics ? ' · ' + g.harmonics + ' piano harmonics already' : ''));
console.log(['t', 'dur', 'src', 'pitch', 'key', 'sounds', 'detune', 'fold', 'merged'].join('\t'));
gen.notes.forEach(n => console.log([
    n.t.toFixed(3), n.dur.toFixed(2), (O.laneLabels[n.srcLane] || n.srcLane),
    PH.nm(n.srcMidi) + (n.srcCents ? (n.srcCents > 0 ? '+' : '') + n.srcCents + 'c' : ''),
    PH.nm(n.key), PH.nm(n.sounds), (n.detuneCents > 0 ? '+' : '') + n.detuneCents + ' c', n.fold || '', n.merged.length || '',
].join('\t')));
gen.skipped.forEach(s => console.log('skipped\t' + s.t.toFixed(3) + '\t' + s.lane + '\t' + s.pitch + '\t' + s.why));
console.log('\n' + PH.describe(gen));

if (has('--write')) {
    const had = PH.ownedBy(score.objects, g.groupId).length;
    score.objects = PH.stripped(score.objects, g.groupId);
    const objs = PH.toScoreObjects(gen, Object.assign({}, O, { startId: score.nextId || 1 }));
    score.objects = score.objects.concat(objs);
    score.nextId = (score.nextId || 1) + objs.length;
    writeBack();
    console.log('wrote ' + objs.length + ' piano harmonics into ' + file + (had ? ' (replacing ' + had + ')' : ''));
}
