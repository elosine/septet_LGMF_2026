#!/usr/bin/env node
// build_fine_schedule.js — PLAN 1b.5 remeasure (2026-09-19): the two things §88 said the card lacked.
//
//   node tools/build_fine_schedule.js [--out probes/card_fine_schedule.json]
//
// 1 · THE VIBRAPHONE, EVERY SEMITONE. §86 sampled its register every four or five semitones on the stated
//     reasoning that "a sample zone two or three semitones wide cannot hide between two of them". §88 found
//     one that did: pitch 74 measures about 11.5 dB above BOTH its measured neighbours, 71 and 76, so the
//     interpolation between them was wrong by that much — and most of the piece's vibraphone writing falls
//     between measured points. Its round robin is off (§82) and its velocity response is uniform across the
//     range (13.5–14.0 dB at all nine pitches, §86), so ONE velocity at EVERY semitone settles the register
//     completely: 37 notes.
//
// 2 · IS THE OTHER XSAMPLE SCATTER A ROUND ROBIN TOO? §88's second fault is that the curves are single
//     strikes on instruments 0d measured at 2.2–3.2 dB SD — the cello reads LOUDER at velocity 100 than at
//     127, which is one sample beating another. The obvious cure is repeats, but repeats only average a
//     problem the vibraphone turned out not to have: ITS scatter was a deterministic three-sample round
//     robin, and switching it off took the spread from 13.8 dB to 0.0 (§82). The english horn, cello and
//     double bass are the SAME library with the same Round Robin menu, so before measuring 108 notes to
//     average a cycle, this asks the cheaper question: strike one note four times and see whether the
//     readings CYCLE. If they do, the fix is his panel, not arithmetic — and the piece stops lurching
//     between samples on three more instruments.
//
// Everything is on the CURVE CHANNEL, which is what the piece plays (§85).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.join(ROOT, arg('out', 'probes/card_fine_schedule.json'));

const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const BAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'balance.json'), 'utf8'));
const pitchesOf = {};
for (const I of BAL.instruments) if (I.anchorByPitch) pitchesOf[I.inst] = Object.keys(I.anchorByPitch).map(Number).sort((a, b) => a - b);

const LEAD_IN = 3000, PRE = 300, INST_GAP = 1500;
const HOLD = 4000, TAIL = 3000, VIB_TAIL = 4000;
const RR_PROBE = ['english_horn', 'cello', 'double_bass'];
const RR_REPEATS = 4, VEL = 127;

function route(R, tech) {
    if (R.channels && Array.isArray(R.channels.curve) && R.channels.curve.length) {
        const e = R.channels.curve[0];
        if (e && typeof e === 'object') return { port: e.port, ch: e.ch };
        return { port: R.port, ch: e };
    }
    return { port: tech.port || R.port, ch: tech.channel || 1 };
}

const notes = [];
let t = LEAD_IN;
const push = (o, hold, tail) => { notes.push(Object.assign({ i: notes.length, tPreMs: t - PRE, tOnMs: t, tOffMs: t + hold }, o)); t += hold + tail; };

// ---- 1: the vibraphone, every semitone ----
const V = INSTRUMENTS.bowed_vibraphone;
const vTech = V.techniques.find(x => x.key === V.ordinary);
const vR = route(V, vTech);
t += INST_GAP;
for (let p = V.rangeLow; p <= V.rangeHigh; p++) {
    push({ role: 'vibfine', inst: 'bowed_vibraphone', label: V.label, tech: vTech.key, techLabel: vTech.label,
           port: vR.port, ch: vR.ch, cc0: vTech.cc0 != null ? vTech.cc0 : null, ks: vTech.ks != null ? vTech.ks : null,
           pitch: p, vel: VEL, cc7: 127, anchor: p === V.rangeLow }, HOLD, VIB_TAIL);
}

// ---- 2: does the other Xsample scatter cycle? ----
for (const key of RR_PROBE) {
    const R = INSTRUMENTS[key];
    const tech = R.techniques.find(x => x.key === R.ordinary);
    const r = route(R, tech);
    const pitch = pitchesOf[key][1];
    t += INST_GAP;
    for (let k = 0; k < RR_REPEATS; k++) {
        push({ role: 'rrprobe', inst: key, label: R.label, tech: tech.key, techLabel: tech.label,
               port: r.port, ch: r.ch, cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null,
               pitch, vel: VEL, cc7: 127, rpt: k, anchor: k === 0 }, HOLD, TAIL);
    }
}

const totalMs = t + 2000;
fs.writeFileSync(OUT, JSON.stringify({
    generatedAt: new Date().toISOString(), planItem: '1b.5-remeasure', piece: 'lgmf',
    what: 'the vibraphone at every semitone, and a four-strike round-robin probe on the other three Xsample instruments',
    vibPitches: [V.rangeLow, V.rangeHigh], rrProbe: RR_PROBE, repeats: RR_REPEATS, vel: VEL,
    timing: { leadInMs: LEAD_IN, preMs: PRE, holdMs: HOLD, tailMs: TAIL, vibTailMs: VIB_TAIL, instGapMs: INST_GAP },
    totalMs, notes,
}, null, 1) + '\n');

const mm = Math.floor(totalMs / 60000), ss = Math.round((totalMs % 60000) / 1000);
console.log('THE 1b.5 REMEASURE — ' + notes.length + ' notes · ' + mm + ':' + String(ss).padStart(2, '0') + '\n');
console.log('  vibraphone  every semitone ' + V.rangeLow + '–' + V.rangeHigh + ' at velocity ' + VEL
    + '  (' + (V.rangeHigh - V.rangeLow + 1) + ' notes, on ' + vR.port + ' ch' + vR.ch + ')');
console.log('  round-robin probe  ' + RR_PROBE.map(k => INSTRUMENTS[k].label + ' ' + pitchesOf[k][1]).join(' · ')
    + '  × ' + RR_REPEATS + ' strikes each');
console.log('\nwrote ' + path.relative(ROOT, OUT));
