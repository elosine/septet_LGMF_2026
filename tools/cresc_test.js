// cresc_test.js — THE CRESCENDO LISTENING TEST, as a score file (PLAN 1l step 1; CN-48; RUNNING_LOG §256–258).
//
//   node tools/cresc_test.js [--out cresc-test] [--durations 1.5,5,12] [--shapes surge,line,bloom] [--ratio 5] [--gap 2] [--force]
//
// His ask (§256): "can you put the probe in the main score as and experimental save file? this way you can add all the tests for all
// the players and I can solo". So: a score he opens, not a timetable played through the bridge — the ear's test belongs in the
// instrument he listens with. The grid is laid at the SAME times on all seven lanes (his "a", §257), so soloing a part (S in the lane,
// ALT-click = exclusive) swaps the instrument without moving the playhead, and an unsoloed play gives all seven at once.
//
// Each crescendo: the player's ordinary voice, ppp … fff over the measured scale (1g), a CLIFF at the top, drawn filled and transparent
// in the morph orange — made by score/public/cresc.js, so what he hears is the object every later build will use. A marker at each
// column names the shape and the duration. The pitch is the middle of each player's ordinary range and is written in the file, so he
// can move it.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const Cresc = require(path.join(ROOT, 'score/public/cresc.js'));

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; return (v != null && !/^--/.test(v)) ? v : true; };
const has = k => args.indexOf(k) >= 0;
const name = String(flag('--out', 'cresc-test'));
const durations = String(flag('--durations', '1.5,5,12')).split(',').map(Number).filter(x => x > 0);
const shapes = String(flag('--shapes', 'surge,line,bloom')).split(',').map(s => s.trim()).filter(s => Cresc.SHAPES[s]);
const ratio = +flag('--ratio', 5);
const gap = +flag('--gap', 2);                    // the rest between columns, seconds (longer than nothing bleeds into the next)
const out = path.join(ROOT, 'scores', name + '.json');
if (/piece-septet/i.test(name) && !has('--force')) { console.error('refusing to write the piece file'); process.exit(2); }

const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const META_LAYER = +html.match(/const META_LAYER = (\d+);/)[1];
const layoutVersion = +(html.match(/layoutVersion: (\d+)/) || [0, 5])[1];

// each player: its ordinary voice and the middle of that voice's range
const players = tracks.map((t, lane) => {
    const inst = recipe[t.instKey]; if (!inst) return null;
    const key = inst.ordinary || (inst.techniques[0] || {}).key;
    const tech = (inst.techniques || []).find(x => x.key === key) || inst.techniques[0];
    const lo = tech.rangeLow != null ? tech.rangeLow : inst.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : inst.rangeHigh;
    return { lane, tech: tech.key, label: t.short, instKey: t.instKey, lo, hi, pitch: Math.round((lo + hi) / 2) };
}).filter(Boolean);

// the grid: shape × duration, in a fixed order, the same times on every lane
const columns = [];
durations.forEach(d => shapes.forEach(s => columns.push({ shape: s, dur: d })));
columns.sort((a, b) => a.dur - b.dur || shapes.indexOf(a.shape) - shapes.indexOf(b.shape));

const objects = [];
let id = 1, t = 2;
columns.forEach((col, k) => {
    const label = col.shape + (col.shape === 'line' ? '' : ' ' + ratio + '×') + ' · ' + col.dur + ' s';
    objects.push({ id: 'mk-' + (id++), type: 'marker', layer: 0, time: +t.toFixed(3), label: (k + 1) + '. ' + label,
                   color: Cresc.DEFAULTS.color, performanceNotes: '', properties: {} });
    players.forEach(p => {
        const wc = Cresc.make(t, p.pitch, p, [], { shape: col.shape, ratio: ratio, durS: col.dur });
        wc.id = 'wc-' + (id++);
        wc.performanceNotes = label + ' — ' + p.label + ' ' + Cresc.nm(p.pitch) + ' ' + p.tech;
        objects.push(wc);
    });
    t += col.dur + gap;
});

const score = {
    version: 1, layoutVersion,
    tracks: tracks.map(x => ({ id: x.id, label: x.label, short: x.short, instKey: x.instKey })),
    assets: [],
    metadata: { title: name, note: 'PLAN 1l step 1 — the crescendo listening test. ' + shapes.length + ' shapes × ' + durations.length +
        ' durations on all seven players at the same times: solo a part (S in its lane, ALT-click = exclusive) to swap the instrument ' +
        'without moving; play unsoloed for all seven at once. Every crescendo is the object of score/public/cresc.js: the ordinary ' +
        'voice, ppp … fff, a cliff at the top, the morph orange. Bend a curve by hand to hear a variant — the file is yours to mark up.',
        generatedAt: new Date().toISOString(), generator: 'tools/cresc_test.js' },
    objects,
    markers: [], databases: {}, nextId: id + 1,
    viewport: { scrollOffset: 0, pixelsPerSecond: 28 },
};
fs.writeFileSync(out, JSON.stringify(score));
const span = t - gap;
console.log('wrote ' + out);
console.log(columns.length + ' columns × ' + players.length + ' players = ' + (columns.length * players.length) + ' crescendos · ' +
    span.toFixed(1) + ' s · shapes ' + shapes.join(' ') + ' at ' + ratio + '× · durations ' + durations.join(' ') + ' s · gap ' + gap + ' s');
players.forEach(p => console.log('  ' + p.label.padEnd(4) + ' ' + Cresc.nm(p.pitch) + ' (' + p.pitch + ') · ' + p.tech + ' · range ' + Cresc.nm(p.lo) + '–' + Cresc.nm(p.hi)));
