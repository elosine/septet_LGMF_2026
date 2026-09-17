#!/usr/bin/env node
// tools/trill_curve_gen.js — the curve test (RUNNING_LOG §101, 2026-09-05): a trill written under a curve from the
// composer's own timing table (bank/trill_timing_db.json ← tools/trill_ingest.js), by piece #2's lookup: at each moment
// the curve's height (0–10 → 0–1) is a speed level; the attacks he played within ±WINDOW of that level are cycled in turn
// (same role — lo or hi note of the pair — as the note being placed, unless --roles off); stretch (anchored at his
// fastest gap) → smooth (toward the local mean) → speed; the note length is his, capped at 1.8 × gap; the velocity his.
// Plain notes with the table's technique, no app change: reload, open the file, SPACE.
//
//   node tools/trill_curve_gen.js --out scores/trill-curve-test.json [--layer 3] [--pitch 69] [--start 2] [--dur 45]
//        [--from scores/x.json [--id wc-12]]   (a curve already drawn there; else the built-in long smooth curve)
//        [--smooth 0.7] [--stretch 1] [--speed 1] [--seed 1] [--roles on|off]
'use strict';
const fs = require('fs'), path = require('path'), CE = require('./curve_eval.js');
const ROOT = path.join(__dirname, '..');
const A = {}, av = process.argv.slice(2);
for (let i = 0; i < av.length; i++) if (av[i].startsWith('--')) A[av[i].slice(2)] = (av[i + 1] != null && !av[i + 1].startsWith('--')) ? av[++i] : true;
const layer = +(A.layer || 3), pitch = +(A.pitch || 69), start = +(A.start || 2), dur = +(A.dur || 45);
const smooth = A.smooth != null ? +A.smooth : 0.7, stretch = +(A.stretch || 1), speed = +(A.speed || 1), roles = A.roles !== 'off', WINDOW = 0.05;
let seed = +(A.seed || 1); const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const stub = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores', 'septet.json'), 'utf8'));
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'trill_timing_db.json'), 'utf8'));
const instKey = stub.tracks[layer].instKey, inst = db.instruments[instKey];
if (!inst) { console.error('no timing table for ' + instKey + ' — run tools/trill_ingest.js first'); process.exit(1); }
const [r0, r1] = inst.rateRange;

// the curve: from a score, or the built-in one — a slow opening, a swell, an easing, the rush to the top, the long relaxation
let score = null, curve;
if (A.from) {
  score = JSON.parse(fs.readFileSync(A.from, 'utf8'));
  curve = score.objects.find(o => o.type === 'waveCurve' && o.sonifyNote == null && (A.id ? o.id === A.id : o.layer === layer));
  if (!curve) { console.error('no curve on layer ' + layer + (A.id ? ' with id ' + A.id : '')); process.exit(1); }
} else {
  curve = { type: 'waveCurve', layer, startSeconds: start, endSeconds: start + dur, fillMode: 'line', color: '#F04B00', opacity: 0.9,
    nodes: [[0, 1], [0.3, 8], [0.5, 4.5], [0.75, 10], [1, 1.5]].map(([pos, y]) => ({ pos, y, smooth: 0.6 })),
    segments: [0.5, 0.5, 0.5, 0.5].map(slope => ({ model: 'sigmoid', slope })),
    performanceNotes: 'trill curve · long smooth (the speed: 0 = his slowest, 10 = his fastest)', properties: {} };
}

// the walk — the same engine the score page runs (score/public/trill_engine.js; RUNNING_LOG §104)
const TE = require('../score/public/trill_engine.js');
const interval = A.interval != null ? +A.interval : 2;   // semitones; the upper whole step by default (CN-22)
const notes = TE.generate({ table: inst, levelAt: sec => CE.getYAtTime(curve, sec) / 10, start: curve.startSeconds, end: curve.endSeconds,
  pitch, interval, smooth, stretch, speed, seed: +(A.seed || 1), roles, accent: A.accent !== 'off', attackVel: 127 }).notes;

// the file — two forms (RUNNING_LOG §102):
//   --as zone  (default): ONE zone object with the trill EMBEDDED as a MIDI snippet ({onsetMs, notes, velocity, durations},
//              port, channel; CC7 127 + the technique's CC0 200 ms ahead of the first note). The transport's zone tick
//              (tickZoneMidiPlayback — piece #2's) schedules every event with a Web MIDI timestamp and a 100 ms lookahead:
//              millisecond timing, independent of the animation frame. Nothing is read from the registry.
//   --as notes: plain waveCurve notes, one per trill note — drawn individually, but played by the frame-polled path
//              (tickCurvePlayback), which quantizes every onset to the next animation frame: audibly jumpy for a trill.
const vm = require('vm');
const INSTR = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS', { console });
const ins = INSTR[instKey], tq = (ins.techniques || []).find(t => t.key === inst.technique) || ins.techniques[0];
const port = tq.port || ins.port, channel = tq.channel || 1, cc0 = tq.cc0;
const form = A.as || 'zone', PRE = 0.2;   // seconds of lead for the CC messages before the first note
const out = score || Object.assign({}, stub, { objects: [], metadata: { created: new Date().toISOString(), modified: new Date().toISOString() }, viewport: { pixelsPerSecond: 50, scrollOffset: 0 } });
let id = out.nextId || 1; const r3 = x => Math.round(x * 1000) / 1000, rd1 = x => Math.round(x * 10) / 10;
const groupId = 'grp-trill-curve-' + stub.tracks[layer].short.toLowerCase() + '-' + Math.round(curve.startSeconds * 10);
const label = 'trill · ' + stub.tracks[layer].short + ' · ' + inst.technique + ' · smooth ' + smooth + ' · stretch ' + stretch + ' · speed ' + speed + ' · seed ' + (A.seed || 1) + ' · ' + form;
if (!curve.id) { curve.id = 'wc-' + (id++); curve.groupId = groupId; out.objects.push(curve); }
out.objects.push({ id: 'mk-' + (id++), type: 'marker', layer, time: r3(curve.startSeconds), label, color: '#F04B00', groupId, performanceNotes: label, properties: {} });
if (form === 'zone') {
  // the zone starts where the curve starts; the snippet declares its CC lead (leadMs) and the zone tick starts that early
  const events = TE.snippetEvents(notes, curve.startSeconds - PRE, cc0);
  out.objects.push({ id: 'zn-' + (id++), type: 'zone', layer, groupId, startTime: r3(curve.startSeconds), endTime: r3(curve.endSeconds + 0.5),
    player: '', instrument: '', zoneFunction: 'midiPreview', midiModel: '', ostinatoParams: { smooth, speed, stretch }, chordMarkers: [], ratioMarkers: [],
    ratioSourceZoneId: '', ratioGroup: '', responseDelayMs: 0, jitterMs: 0, driftFactor: 0,
    midiSnippet: { port, channel, leadMs: PRE * 1000, events, technique: inst.technique, source: 'tools/trill_curve_gen.js', count: notes.length, generatedAt: new Date().toISOString() },
    color: '#387ED3', opacity: 0.35, yOffset: 0.5, zoneHeight: 0.3, performanceNotes: label, properties: {} });
} else {
  for (const n of notes) out.objects.push({ id: 'wc-' + (id++), type: 'waveCurve', layer, groupId, startSeconds: r3(n.t), endSeconds: r3(n.t + n.len),
    nodes: [{ pos: 0, y: 10, smooth: 0.25 }, { pos: 1, y: 10, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }], color: '#387ED3', fillMode: 'bottom', opacity: 0.55,
    performanceNotes: label, properties: {}, srcKind: 'trill', sonifyNote: n.pitch, technique: inst.technique, sonifyMode: 'plain', recVel: n.vel });
}
out.nextId = id;
const outPath = path.resolve(A.out || path.join(ROOT, 'scores', 'trill-curve-test.json'));
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));

// the report: per 5 s, the curve's level, the rate his table implies, the rate written, the mean velocity and length
console.log('wrote', path.relative(ROOT, outPath), '—', notes.length, 'notes,', r3(curve.startSeconds), '→', r3(curve.endSeconds), 's on', stub.tracks[layer].label, '(' + inst.technique + '), pitches', pitch + '/' + (pitch + interval), '— table rate', r0, '→', r1, 'per second');
console.log(' window s | level | rate implied | rate written | vel | len ms');
for (let w = curve.startSeconds; w < curve.endSeconds; w += 5) {
  const d = notes.filter(n => n.t >= w && n.t < w + 5); if (!d.length) continue; const m = f => d.reduce((s, n) => s + f(n), 0) / d.length;
  console.log(' ', r3(w), '–', r3(Math.min(w + 5, curve.endSeconds)), '|', m(n => n.level).toFixed(2), '|', (r0 + m(n => n.level) * (r1 - r0)).toFixed(1), '|', (1000 / m(n => n.gap)).toFixed(1), '|', Math.round(m(n => n.vel)), '|', Math.round(m(n => n.len * 1000)));
}
console.log(' shortest note', Math.round(Math.min(...notes.map(n => n.len)) * 1000), 'ms · smallest gap', Math.round(Math.min(...notes.map(n => n.gap))), 'ms');
