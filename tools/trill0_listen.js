#!/usr/bin/env node
// tools/trill0_listen.js — TRILLS_TOOL step 0: the listening file (2026-09-05).
//
// Writes scores/trill0-listen.json: one lane at a time, a row of trill passages, one per
// candidate articulation. Each passage = two alternating pitches (the upper chromatic
// neighbour), the rate ramping from the instrument's slow trill to its fast one (the table
// in TRILLS_TOOL §2), held at the fast rate, the first note at 127 and the rest at DROP
// (§8, attack option 1). Plain notes with a technique, exactly what the strikes write —
// no zone, no build: the app's ostinato zone routes through piece #2's registry, which
// has zero instruments here (NITS; RUNNING_LOG §99). Edit the tables, re-run, reload.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'scores', 'trill0-listen.json');
const stub = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores', 'septet.json'), 'utf8'));

const DROP = 60;          // velocity after the attack (the attack is 127)
const RAMP = 3.0;         // seconds from the slow rate to the fast one
const HOLD = 1.0;         // seconds held at the fast rate
const GAP = 1.5;          // silence between passages
const BLOCK_GAP = 3.0;    // silence between instruments
const OVERLAP = 0.010;    // sustained articulations: a note ends 10 ms after the next begins
const SHORT_CUT = 0.005;  // short ones: 5 ms before the next
const LAST = 0.12;        // the last note's length

// [technique key, label, sustained?, (optional) a second note at the attack on this technique]
const STR = [
  ['senza_vel', 'senza vib #6', true], ['vib_vel', 'vibrato #2', true], ['stac_vel', 'staccato #19', false],
  ['marcato_stac_vel', 'marcato stac #13', false], ['marcato_sfz_vel', 'marcato sfz #12', true], ['spicc_vel', 'spiccato #16', false]];
const BLOCKS = [   // layer · lane · the lower pitch of the pair · rate slow→fast (per second) · colour · candidates
  { layer: 3, name: 'Vn1', pitch: 69, rate: [6, 14], color: '#387ED3', techs: STR },
  { layer: 5, name: 'Va',  pitch: 62, rate: [6, 14], color: '#00935C', techs: STR },
  { layer: 6, name: 'Vc',  pitch: 55, rate: [5, 12], color: '#522C55', techs: STR },
  { layer: 0, name: 'Fl',  pitch: 76, rate: [6, 13], color: '#F4B600', techs: [
    ['ord', 'ordinario', true], ['staccato', 'staccato (Fluteb)', false], ['sforzando', 'sforzando', false],
    ['fortepiano', 'fortepiano', true], ['ord', 'ordinario + tongue ram at the attack', true, 'pizzicato']] },
  { layer: 1, name: 'BCl', pitch: 50, rate: [5, 11], color: '#E52A19', techs: [
    ['senza_vel', 'senza vib #13', true], ['stac_vel', 'staccato #19', false], ['accent_vel', 'with accent #20', true],
    ['secco', 'secco #27', false], ['portato', 'portato #28', true]] },
  { layer: 2, name: 'Pno', pitch: 72, rate: [5, 12], color: '#C9A05A', techs: [['main', 'piano', true]] },
];

const r3 = x => Math.round(x * 1000) / 1000;
let id = 1, t = 0;
const objects = [], rows = [];
const note = (o) => Object.assign({ id: 'wc-' + (id++), type: 'waveCurve',
  nodes: [{ pos: 0, y: 10, smooth: 0.25 }, { pos: 1, y: 10, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
  fillMode: 'bottom', opacity: 0.55, properties: {}, srcKind: 'trill0', sonifyMode: 'plain' }, o);

for (const b of BLOCKS) {
  b.techs.forEach(([tech, label, sustained, attackTech], i) => {
    const [r0, r1] = b.rate, t0 = t;
    const onsets = [];
    for (let u = 0; u < RAMP + HOLD;) { onsets.push(u); u += 1 / (r0 + (r1 - r0) * Math.min(1, u / RAMP)); }
    const groupId = 'grp-trill0-' + b.name.toLowerCase() + '-' + i;
    const text = 'trill0 · ' + b.name + ' · ' + label + ' · ' + r0 + '→' + r1 + '/s · fp 127→' + DROP;
    objects.push({ id: 'mk-' + (id++), type: 'marker', layer: b.layer, time: r3(t0), label: b.name + ' · ' + label + ' · ' + r0 + '→' + r1 + '/s',
      color: b.color, groupId, performanceNotes: text, properties: {} });
    let shortest = 9;
    onsets.forEach((u, k) => {
      const next = k + 1 < onsets.length ? onsets[k + 1] : null;
      const end = next == null ? u + LAST : (sustained ? next + OVERLAP : next - SHORT_CUT);
      shortest = Math.min(shortest, end - u);
      objects.push(note({ layer: b.layer, groupId, startSeconds: r3(t0 + u), endSeconds: r3(t0 + end), color: b.color,
        performanceNotes: text, sonifyNote: b.pitch + (k % 2), technique: tech, recVel: k === 0 ? 127 : DROP }));
    });
    if (attackTech) objects.push(note({ layer: b.layer, groupId, startSeconds: r3(t0), endSeconds: r3(t0 + 0.1), color: b.color,
      performanceNotes: text + ' · the attack note', sonifyNote: b.pitch, technique: attackTech, recVel: 127 }));
    rows.push([b.name, label, r3(t0), onsets.length, Math.round(shortest * 1000) + ' ms']);
    t = t0 + onsets[onsets.length - 1] + LAST + GAP;
  });
  t += BLOCK_GAP - GAP;
}

const now = new Date().toISOString();
const out = { version: stub.version, layoutVersion: stub.layoutVersion, tracks: stub.tracks, assets: stub.assets,
  metadata: { created: now, modified: now }, objects, markers: [], databases: stub.databases, nextId: id,
  viewport: { pixelsPerSecond: 50, scrollOffset: 0 } };
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('wrote', path.relative(ROOT, OUT), '—', objects.length, 'objects, ends at', r3(t - GAP), 's; DROP', DROP);
console.log('lane · passage · start s · notes · shortest note');
rows.forEach(r => console.log(r.join(' · ')));
