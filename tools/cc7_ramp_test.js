// cc7_ramp_test.js — A PLAIN CC7 RAMP, AS A SCORE FILE (2026-09-09; his ask after the fade was still wrong in his ear:
// "What is the easiest way to generate a ramp using CC seven so I can listen to it? … Let's do a smooth CC7 ramp from zero to full
// volume over ten seconds").
//
//   node tools/cc7_ramp_test.js [--out cc7-ramp-test] [--len 10] [--gap 3] [--breaths 3] [--force]
//
// WHY THIS FILE EXISTS. Every measurement so far has been of the morph, which is four mechanisms at once — carrier, re-breaths, the
// remap and the shape. So none of them could answer the one question the fade turns on: DOES A CC7 RAMP UNDER A CONSTANT VELOCITY
// ACTUALLY SOUND LIKE A FADE ON THESE SAMPLERS? This file asks exactly that and nothing else, on all seven players at the same times,
// so soloing a lane (S in the lane, ALT-click = exclusive) swaps the instrument without moving the playhead.
//
// Each object is an ORDINARY drawn held note — `properties: {}`, no crescendo block, no morph — so it plays through the score's own
// held-note law and nothing else: the velocity from the TOP of its curve, CC7 following the height, both through the measured remap
// (composer.html `heldDyn` / `heldCc7`, 1g item 5). That law is the thing under test.
//
// THE FIVE COLUMNS, and 4 against 5 is the whole point:
//
//   1  ONE NOTE, ramp 0 → 10          the ask. One strike at the top velocity, CC7 doing every bit of the fade.
//   2  ONE NOTE, ramp 0.4 → 10        the same with the bottom of the range cut off — is the very bottom of CC7 the unusable part?
//   3  ONE NOTE, flat at 10           the reference. What "full" is, so column 1 can be judged for whether it ARRIVES.
//   4  N NOTES sharing one ramp       the morph's real situation: the ramp is continuous but each breath is a fresh note-on, so each
//                                     one is struck for ITS OWN top — rising velocities. This is what the fade sounded like before.
//   5  the same N notes, velRef 10    identical curves, one velocity for all of them (the `velRef` stamp the fade now writes).
//
// If 5 is smooth and 4 lurches, the fade's design is right and the problem is upstream of the ear. If 5 ALSO lurches, then a CC7 ramp
// under a re-attack is not a fade on this sampler and the whole approach has to change — which is worth one listen to find out.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; return (v != null && !/^--/.test(v)) ? v : true; };
const has = k => args.indexOf(k) >= 0;
const name = String(flag('--out', 'cc7-ramp-test'));
const LEN = +flag('--len', 10);                 // the ramp, seconds
const GAP = +flag('--gap', 3);                  // silence between columns, longer than any tail
const NB = Math.max(2, +flag('--breaths', 3));  // how many notes share the ramp in columns 4 and 5
const out = path.join(ROOT, 'scores', name + '.json');
if (/piece-septet/i.test(name) && !has('--force')) { console.error('refusing to write the piece file'); process.exit(2); }

// the seven players, read from the app itself so this cannot drift from the score
const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const layoutVersion = +(html.match(/layoutVersion: (\d+)/) || [0, 5])[1];
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

const players = tracks.map((t, lane) => {
    const inst = recipe[t.instKey]; if (!inst) return null;
    const key = inst.ordinary || (inst.techniques[0] || {}).key;
    const tech = (inst.techniques || []).find(x => x.key === key) || inst.techniques[0];
    const lo = tech.rangeLow != null ? tech.rangeLow : inst.rangeLow;
    const hi = tech.rangeHigh != null ? tech.rangeHigh : inst.rangeHigh;
    return { lane, tech: tech.key, label: t.short, instKey: t.instKey, lo, hi, pitch: Math.round((lo + hi) / 2) };
}).filter(Boolean);

const ORANGE = '#C2410C';
const objects = [];
let id = 1;

// a plain drawn held note. `nodes` are the DRAWN CURVE — pos 0..1 across the note, y 0..10 — which is exactly what CC7 follows.
// 24 breakpoints so the ramp is a ramp and not four straight segments; `smooth` 0.25 is the score's own default.
function held(p, t0, dur, y0, y1, velRef, notes, cc7Abs) {
    const N = 24, nodes = [];
    for (let i = 0; i <= N; i++) nodes.push({ pos: +(i / N).toFixed(4), y: +(y0 + (y1 - y0) * (i / N)).toFixed(3), smooth: 0.25 });
    const o = {
        id: 'wc-' + (id++), type: 'waveCurve', layer: p.lane,
        startSeconds: +t0.toFixed(3), endSeconds: +(t0 + dur).toFixed(3),
        nodes: nodes,
        segments: nodes.slice(1).map(() => ({ model: 'bezier', slope: 0 })),
        color: ORANGE, fillMode: 'bottom', opacity: 0.45,
        performanceNotes: notes + ' — ' + p.label + ' ' + nm(p.pitch) + ' ' + p.tech,
        properties: {}, sonifyNote: p.pitch, technique: p.tech,
    };
    // THE STAMP THE FADE WRITES (RUNNING_LOG §315): one velocity for the whole gesture, CC7 alone moving. `Composer.curveTop` reads it
    // in place of the top of the drawn curve, so a note that RISES to 3.3 is still struck as if it were going to reach 10.
    if (velRef != null) o.velRef = velRef;
    // AND CC7 DRIVEN DIRECTLY (§316). The drawn scale bottoms out at CC7 88 because it is a scale of anchor velocities 65…127 — only
    // 9.96 dB end to end — so no drawn curve can start from silence. `cc7Abs` maps the height straight onto a CC7 range instead.
    if (cc7Abs) o.cc7Abs = cc7Abs;
    return o;
}
const marker = (t, label) => objects.push({ id: 'mk-' + (id++), type: 'marker', layer: 0, time: +t.toFixed(3),
                                            label: label, color: ORANGE, performanceNotes: '', properties: {} });

let t = 2;
const columns = [
    { label: '1. ONE note · CC7 ramp 0 → full over ' + LEN + ' s — THE TEST. One strike, CC7 does all of it.',
      build: p => [held(p, t, LEN, 0, 10, null, 'ramp 0→10 in one note')] },
    { label: '2. ONE note · ramp 0.4 → full — the same without the very bottom of CC7.',
      build: p => [held(p, t, LEN, 0.4, 10, null, 'ramp 0.4→10 in one note')] },
    { label: '3. ONE note · FLAT at full — the reference. Does column 1 arrive here?',
      build: p => [held(p, t, LEN, 10, 10, null, 'flat at 10')] },
    { label: '4. ' + NB + ' notes sharing ONE ramp, each struck for its own top — the morph before the fix.',
      build: p => { const d = LEN / NB, a = [];
          for (let k = 0; k < NB; k++) a.push(held(p, t + k * d, d, 10 * k / NB, 10 * (k + 1) / NB, null,
              'breath ' + (k + 1) + '/' + NB + ' of one ramp, own velocity'));
          return a; } },
    { label: '5. the same ' + NB + ' notes, ONE velocity (velRef) — the fade as built. CC7 still only 88 → 127.',
      build: p => { const d = LEN / NB, a = [];
          for (let k = 0; k < NB; k++) a.push(held(p, t + k * d, d, 10 * k / NB, 10 * (k + 1) / NB, 10,
              'breath ' + (k + 1) + '/' + NB + ' of one ramp, velRef 10'));
          return a; } },
    // 6 AND 7 ARE THE ONES THAT MATTER — 1 to 5 all live inside the drawn scale, which bottoms out at CC7 88.
    { label: '6. ONE note · CC7 driven 0 → 127 directly — what he actually asked for. Is CC7 0 silent?',
      build: p => [held(p, t, LEN, 0, 10, 10, 'CC7 0→127, one note, one velocity', { lo: 0, hi: 127 })] },
    { label: '7. ' + NB + ' notes sharing ONE CC7 0 → 127 ramp at ONE velocity — the fade as it should be.',
      build: p => { const d = LEN / NB, a = [];
          for (let k = 0; k < NB; k++) a.push(held(p, t + k * d, d, 10 * k / NB, 10 * (k + 1) / NB, 10,
              'breath ' + (k + 1) + '/' + NB + ' of one CC7 0→127 ramp', { lo: 0, hi: 127 }));
          return a; } },
];

columns.forEach(col => {
    marker(t, col.label);
    players.forEach(p => col.build(p).forEach(o => objects.push(o)));
    t += LEN + GAP;
});

const score = {
    version: 1, layoutVersion,
    tracks: tracks.map(x => ({ id: x.id, label: x.label, short: x.short, instKey: x.instKey })),
    assets: [],
    metadata: {
        title: name,
        note: 'A PLAIN CC7 RAMP, ISOLATED (2026-09-09, RUNNING_LOG §316). Five columns on all seven players at the same times — solo a ' +
              'lane (S, ALT-click = exclusive) to swap the instrument without moving. Every object is an ordinary drawn held note with ' +
              'no crescendo and no morph, so it plays through the score\'s held-note law alone: velocity from the top of the curve, CC7 ' +
              'following the height. 1 = one note, CC7 ramping the whole way. 2 = the same without the bottom of the range. 3 = flat at ' +
              'full, the reference. 4 = the ramp split across ' + NB + ' notes, each struck for its own top (the morph before the fix). ' +
              '5 = the same notes at ONE velocity (the fade\'s velRef stamp). 4 against 5 is the question: if 5 is smooth and 4 lurches, ' +
              'the design is right. Drag any curve to hear a variant — the file is yours to mark up.',
        generatedAt: new Date().toISOString(), generator: 'tools/cc7_ramp_test.js',
    },
    objects,
    markers: [], databases: {}, nextId: id + 1,
    viewport: { scrollOffset: 0, pixelsPerSecond: 28 },
};
fs.writeFileSync(out, JSON.stringify(score));
console.log('wrote ' + out);
console.log(columns.length + ' columns × ' + players.length + ' players · ramp ' + LEN + ' s · gap ' + GAP + ' s · ' +
            (t - GAP).toFixed(1) + ' s total · ' + objects.filter(o => o.type === 'waveCurve').length + ' notes');
players.forEach(p => console.log('  ' + p.label.padEnd(5) + nm(p.pitch).padEnd(5) + '(' + p.pitch + ') · ' + p.tech +
                                 ' · range ' + nm(p.lo) + '–' + nm(p.hi)));
