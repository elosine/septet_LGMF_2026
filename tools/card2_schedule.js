#!/usr/bin/env node
// card2_schedule.js — PLAN 1b.3a (2026-09-19): the second card run — ALL FOURTEEN PERCUSSION, and the
// VIBRAPHONE ACROSS ITS RANGE.
//
//   node tools/card2_schedule.js [--out probes/card2_schedule.json] [--print]
//
// WHY THERE IS A SECOND RUN, at his word (*"yes to both, per register and re-measure all fourteen"*):
//
// THE PERCUSSION. 1b.2 spot-checked four of the fourteen against `0d + 12 + trim`. Two carried over
// within 0.9 dB and two — the triangles and the castanets, the ones with the largest JS Volume boosts —
// read ~3 dB under it (§78, NITS). Rather than trim twelve instruments on a carry-over that is known to
// fail for two of them, all fourteen are measured on the same absolute footing the pitched seven now have.
// 0d's OWN KEYS are reused, so every row is comparable with the old one.
//
// THE VIBRAPHONE. 1b.2 measured three pitches and found a 16.3 dB spread — and, more awkwardly, a
// NON-MONOTONE one: at velocity 127, D4 −13.6 · B4 −20.7 · G♯5 −5.2. The middle is the quiet one. Three
// points cannot tell a smooth trend from a sample-zone STEP, and the two candidate mechanisms answer to
// different shapes: a per-register FADER (a note filter and a second track, the horn-high path of 1a.1)
// fits steps; the velocity remap, which is already per instrument AND per register, fits a smooth trend.
// So nine pitches across its whole range, at two velocities, BEFORE the mechanism is chosen.
//
// Percussion is measured at FULL and at 64: the trim is set at full (*"fff = fff"*, §57 — a tambourine at
// full is as loud as a horn at full), and the second point gives the slope. Percussion never receives CC7:
// Spitfire binds it to the plugin's global gain (§42), so a probe that sent it would rewrite his mix.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.join(ROOT, arg('out', 'probes/card2_schedule.json'));
const PRINT = process.argv.includes('--print');
// --mode repeat (1b.3a, second pass): the vibraphone only, a few pitches struck several times at one
// velocity. THE QUESTION IT ANSWERS, and it decides the mechanism: the nine-pitch pass found a 16 dB
// SAWTOOTH rather than a trend, and the two runs disagreed by up to 4.4 dB at the SAME pitch and velocity.
// If repeats of one note scatter as widely as neighbouring pitches do, the unevenness is round robin and
// no static per-pitch correction can touch it; if they are tight, the sawtooth is a fixed property of each
// bar and a per-pitch table will hold. Four repeats on four pitches is two minutes and settles it.
const MODE = arg('mode', 'full');
const REPEATS = +arg('repeats', 4);
const REPEAT_PITCHES = [62, 71, 76, 80];
const REPEAT_VEL = 127;

const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const OLD = JSON.parse(fs.readFileSync(path.join(ROOT, 'probes', 'balance_schedule.json'), 'utf8'));

// the vibraphone across its whole range (53–89), nine pitches — every fourth or fifth semitone, so a
// sample zone two or three semitones wide cannot hide between two of them
const VIB_PITCHES = [53, 58, 62, 67, 71, 76, 80, 85, 89];
const VIB_VELS = [64, 127];
const PERC_VELS = [127, 64];

const LEAD_IN = 3000, PRE = 300, INST_GAP = 1500;
const VIB_HOLD = 4000, VIB_TAIL = 4000;
const PERC_HOLD = 200, PERC_TAIL = 3800;

// 0d's own percussion notes: instrument → its keys, with the channel and technique it used
const perc = {};
for (const n of OLD.notes) {
    if (n.role !== 'perc') continue;
    const d = perc[n.inst] = perc[n.inst] || { label: n.label, port: n.port, ch: n.ch, keys: [] };
    if (!d.keys.some(k => k.pitch === n.pitch)) d.keys.push({ pitch: n.pitch, tech: n.tech, techLabel: n.techLabel, cc0: n.cc0, ks: n.ks });
}

const notes = [];
let t = LEAD_IN;
const push = (o, hold, tail) => { notes.push(Object.assign({ i: notes.length, tPreMs: t - PRE, tOnMs: t, tOffMs: t + hold }, o)); t += hold + tail; };

// ---- the vibraphone, across its range ----
const V = INSTRUMENTS.bowed_vibraphone;
const vTech = V.techniques.find(x => x.key === V.ordinary);
const vBase = { inst: 'bowed_vibraphone', label: V.label, tech: vTech.key, techLabel: vTech.label,
                port: vTech.port || V.port, ch: vTech.channel || 1,
                cc0: vTech.cc0 != null ? vTech.cc0 : null, ks: vTech.ks != null ? vTech.ks : null, cc7: 127 };
if (MODE === 'repeat') {
    t += INST_GAP;
    for (const pitch of REPEAT_PITCHES) {
        for (let r = 0; r < REPEATS; r++) {
            push(Object.assign({}, vBase, { role: 'vibrepeat', pitch, vel: REPEAT_VEL, rpt: r, anchor: r === 0 }), VIB_HOLD, VIB_TAIL);
        }
    }
} else {
t += INST_GAP;
for (const pitch of VIB_PITCHES) {
    if (pitch < V.rangeLow || pitch > V.rangeHigh) throw new Error('vibraphone pitch ' + pitch + ' is outside ' + V.rangeLow + '–' + V.rangeHigh);
    for (const vel of VIB_VELS) {
        push({ role: 'vibreg', inst: 'bowed_vibraphone', label: V.label, tech: vTech.key, techLabel: vTech.label,
               port: vTech.port || V.port, ch: vTech.channel || 1, cc0: vTech.cc0 != null ? vTech.cc0 : null,
               ks: vTech.ks != null ? vTech.ks : null, pitch, vel, cc7: 127, anchor: vel === 127 }, VIB_HOLD, VIB_TAIL);
    }
}
}

// ---- all fourteen percussion, on 0d's keys ----
for (const [key, d] of Object.entries(perc)) {
    if (MODE === 'repeat') break;
    t += INST_GAP;
    for (const k of d.keys) {
        for (const vel of PERC_VELS) {
            push({ role: 'perc', inst: key, label: d.label, tech: k.tech, techLabel: k.techLabel,
                   port: d.port, ch: d.ch, cc0: k.cc0, ks: k.ks, pitch: k.pitch, vel, cc7: null,
                   anchor: vel === 127 && k === d.keys[0] }, PERC_HOLD, PERC_TAIL);
        }
    }
}

const totalMs = t + 2000;
const out = {
    generatedAt: new Date().toISOString(), planItem: '1b.3a', piece: 'lgmf',
    what: 'all fourteen percussion on 0d’s own keys, and the vibraphone across its range — the two things 1b.2 left open',
    standard: OLD.standard || 'K-20; loudness ITU-R BS.1770. REC at unity since 1b.0, so every level is dBFS at the master.',
    vibPitches: VIB_PITCHES, vibVels: VIB_VELS, percVels: PERC_VELS,
    percussion: Object.fromEntries(Object.entries(perc).map(([k, d]) => [k, { label: d.label, ch: d.ch, keys: d.keys.map(x => x.pitch) }])),
    timing: { leadInMs: LEAD_IN, preMs: PRE, vibHoldMs: VIB_HOLD, vibTailMs: VIB_TAIL,
              percHoldMs: PERC_HOLD, percTailMs: PERC_TAIL, instGapMs: INST_GAP },
    comparison: { to: 'bank/balance.json (0d)', expectedOffsetDb: 12.0,
                  why: 'the only deliberate change to the chain is REC −12 dB → unity; the trim applied after 0d measured is added on top' },
    totalMs, notes,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');

const mm = Math.floor(totalMs / 60000), ss = Math.round((totalMs % 60000) / 1000);
const byRole = {};
for (const n of notes) byRole[n.role] = (byRole[n.role] || 0) + 1;
console.log('THE SECOND CARD RUN — ' + notes.length + ' notes · ' + mm + ':' + String(ss).padStart(2, '0') + '\n');
console.log('  roles: ' + Object.entries(byRole).map(([k, v]) => k + ' ' + v).join(' · '));
console.log('  vibraphone ' + VIB_PITCHES.join(' ') + '  at velocities ' + VIB_VELS.join(' · '));
console.log('  percussion ' + Object.keys(perc).length + ' instruments, ' + Object.values(perc).reduce((s, d) => s + d.keys.length, 0)
    + ' keys, at velocities ' + PERC_VELS.join(' · '));
console.log('\nwrote ' + path.relative(ROOT, OUT));
if (PRINT) for (const n of notes) console.log(('  ' + (n.tOnMs / 1000).toFixed(1)).padStart(9) + ' s  '
    + String(n.label).padEnd(20) + String(n.port).padEnd(10) + 'ch' + String(n.ch).padEnd(3)
    + 'note ' + String(n.pitch).padStart(3) + ' vel ' + String(n.vel).padStart(3) + '  ' + n.role);
