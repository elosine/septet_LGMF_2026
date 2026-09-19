#!/usr/bin/env node
// build_1b5_score.js — PLAN 1b.5 (2026-09-19): the ensemble verification score.
//
//   node tools/build_1b5_score.js [--out scores/lgmf-1b5.json]
//
// WHAT IT IS FOR. 1b.1 proved the meter, 1b.2 measured the instruments, 1b.3 trimmed them and 1b.4 built
// the remap — every step verified on its own terms, by a probe that sends MIDI directly. This score is the
// one thing none of them tested: **the app's own path.** It is played by composer.html, so the velocity and
// the CC7 of every note are chosen by `heldDyn` → `VelocityRemap.heldNote` and `heldCc7` → `cc7ForHeight`,
// exactly as they will be for the piece. If the calibration is right, it is right *here*.
//
// THE MATERIAL is reference chord 1 on B♭1 (COMPOSITION_NOTES LG-19, bank/reference_chords.json) — eight
// voices across all seven players, the vibraphone on two bows. Three passes:
//
//   SOLO fff   each voice alone at the top of the scale — the ±1 dB per-part test
//   SOLO mf    each voice alone where the piece actually sits — the same test off the top
//   TUTTI      all eight together at pp · mf · ff · fff — the spread, the LUFS and the true peak
//
// DELIBERATELY PLAIN NOTES: a flat curve, no `morphBend`, no `cc7Fade`, no keyswitch. The only thing under
// test is the calibration, so nothing else is allowed to move. The written height is carried by the curve's
// own y (0–10), which is what `heldDyn` reads, so pp · mf · ff · fff are 0 · 5.714 · 8 · 10 — and 5.714 is
// the 4/7 the five existing scores are written at.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.join(ROOT, arg('out', 'scores/lgmf-1b5.json'));

const BANK = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'reference_chords.json'), 'utf8'));
const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score', 'public', 'composer.html'), 'utf8');
const TRACKS = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const laneOf = {};
TRACKS.forEach((t, i) => { laneOf[t.instKey] = i; });

const CHORD = BANK.chords[0];
const HEIGHTS = [{ name: 'pp', y: 0 }, { name: 'mf', y: 5.714285714285714 }, { name: 'ff', y: 8 }, { name: 'fff', y: 10 }];
// 6 s. The bowed vibraphone ceiling is 7.4 s at mf (1a.2, measured in §69) but `ceilingFor` tightens it
// with level, and at fff it is 6.07 — check_ceilings enforces that on every score, this one included.
// Six seconds is still ample for a 400 ms momentary window and an honest integrated figure.
const SOLO_S = 6, SOLO_GAP = 3, TUTTI_S = 6, TUTTI_GAP = 5, PASS_GAP = 6;

const objects = [];
let nid = 1, t = 3;
const rows = [];

function note(v, at, dur, y, tag) {
    const lane = laneOf[v.instrument];
    if (lane == null) throw new Error('no lane for ' + v.instrument);
    const inst = INSTRUMENTS[v.instrument];
    const tech = inst.techniques.find(x => x.key === inst.ordinary);
    objects.push({
        id: 'wc-' + (nid++), type: 'waveCurve', layer: lane,
        startSeconds: Math.round(at * 1000) / 1000, endSeconds: Math.round((at + dur) * 1000) / 1000,
        nodes: [{ pos: 0, y, smooth: 0.25 }, { pos: 1, y, smooth: 0.25 }],
        segments: [{ model: 'bezier', slope: 0 }],
        color: '#4F7942', fillMode: 'bottom', opacity: 0.5,
        performanceNotes: tag + ' · ' + v.short + ' ' + v.name + (v.cents ? ' ' + v.cents + '¢' : ''),
        properties: {}, sonifyNote: v.midi, technique: tech.key,
        // the just voices keep their cents, as a flat bend — the chord is what it is; the level is what is
        // being measured, and a constant bend cannot change it
        morphBend: v.cents ? [[0, v.cents], [dur, v.cents]] : undefined,
    });
    rows.push({ tag, voice: v.id, inst: v.instrument, lane, midi: v.midi, at: Math.round(at * 100) / 100, dur, y });
}

// ---- pass 1 and 2: every voice alone, at fff then at mf ----
for (const H of [HEIGHTS[3], HEIGHTS[1]]) {
    for (const v of CHORD.voices) { note(v, t, SOLO_S, H.y, 'solo-' + H.name); t += SOLO_S + SOLO_GAP; }
    t += PASS_GAP;
}
// ---- pass 3: the whole chord, four dynamics ----
for (const H of HEIGHTS) {
    for (const v of CHORD.voices) note(v, t, TUTTI_S, H.y, 'tutti-' + H.name);
    t += TUTTI_S + TUTTI_GAP;
}

const now = new Date().toISOString();
const save = {
    version: 1, layoutVersion: 7, tracks: TRACKS, assets: {},
    metadata: { created: now, modified: now,
        note: 'PLAN 1b.5 — the ensemble verification. Reference chord 1 on B♭1: each of the eight voices ALONE '
            + 'at fff then at mf (the ±1 dB per-part test), then the whole chord at pp · mf · ff · fff (spread, '
            + 'LUFS, true peak). Plain notes — a flat curve, no cc7Fade, no keyswitch — so the only thing under '
            + 'test is the calibration. GENERATED by tools/build_1b5_score.js; do not hand-edit.' },
    objects, markers: [], databases: { chordShapes: [], sets: [], cells: [] },
    nextId: nid + 2, viewport: { pixelsPerSecond: 9, scrollOffset: 0 },
};
fs.writeFileSync(OUT, JSON.stringify(save, null, 1) + '\n');

const span = Math.round(t);
console.log('PLAN 1b.5 — the ensemble verification score\n');
console.log('  chord 1 on ' + CHORD.fundamental.name + ', ' + CHORD.voices.length + ' voices: '
    + CHORD.voices.map(v => v.short + ' ' + v.name).join(' · '));
console.log('  solo at fff, solo at mf, then the tutti at ' + HEIGHTS.map(h => h.name).join(' · '));
console.log('  ' + objects.length + ' notes · ' + Math.floor(span / 60) + ':' + String(span % 60).padStart(2, '0'));
console.log('\nwrote ' + path.relative(ROOT, OUT));
