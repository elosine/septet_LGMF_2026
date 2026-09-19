#!/usr/bin/env node
// build_register_schedule.js — PLAN 1b.5 (2026-09-19): the REGISTER GRID, over the pitches the piece uses.
//
//   node tools/build_register_schedule.js [--out probes/card_register_schedule.json] [--step 3]
//
// WHY. The card measures three pitches per instrument — 0d's grid, carried forward — and RUNNING_LOG §90
// found that the piece uses thirteen to forty, most of them OUTSIDE those three, where `velocityFor` and
// `levelFor` clamp to the nearest measured pitch. The horn is the plainest case: it measures 43 · 50 · 58
// and plays 56–73, so all fourteen pitches above 58 run on pitch 58's data — including every note above F4,
// which sounds through an entirely different signal chain (the ReaPitch path of 1a.1).
//
// The vibraphone is the proof that resolution is the cure: it is the one instrument whose used pitches all
// lie inside its measured set, and it is the one that lands within 0.9 dB of target.
//
// WHAT IT BUILDS. Per instrument, a grid across the range the SCORES actually use — read from the scores,
// not guessed — at one velocity (127), on the CURVE CHANNEL the piece plays. The register is what needs
// resolution; the velocity SHAPE keeps coming from the existing three-pitch × four-velocity data,
// interpolated by register, which is the part that varies least (the cello spans 17.6–20.5 dB across its
// three registers, the double bass 17.4–18.1; the english horn is the exception at 16.7–22.8, which is why
// the shape is interpolated rather than averaged).
//
// The horn's grid always includes **65 and 66**: that is the seam of its note filter, the last pitch the
// SI2 library plays and the first that arrives through ReaPitch, and a grid that stepped over it would
// describe neither side.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.join(ROOT, arg('out', 'probes/card_register_schedule.json'));
const DEFAULT_STEP = +arg('step', 3);

const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score', 'public', 'composer.html'), 'utf8');
const TRACKS = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});

// a narrower grid where the register is known to move fast, or the span is short
const STEP = { horn: 2, trumpet: 2 };
const MUST = { horn: [65, 66] };            // the ReaPitch seam
const SKIP = new Set(['bowed_vibraphone', 'percussion']);   // already measured every semitone (§89)
const SCORES = ['lgmf-ref', 'lgmf-spectral', 'lgmf-balance', 'lgmf-bloom', 'lgmf-converge'];

// the pitches the piece actually writes, per instrument
const used = {};
for (const f of SCORES) {
    const s = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores', f + '.json'), 'utf8'));
    for (const o of s.objects) {
        if (o.sonifyNote == null) continue;
        const t = TRACKS[o.layer];
        if (!t || !t.instKey) continue;
        (used[t.instKey] = used[t.instKey] || new Set()).add(o.sonifyNote);
    }
}

function route(R, tech) {
    if (R.channels && Array.isArray(R.channels.curve) && R.channels.curve.length) {
        const e = R.channels.curve[0];
        if (e && typeof e === 'object') return { port: e.port, ch: e.ch };
        return { port: R.port, ch: e };
    }
    return { port: tech.port || R.port, ch: tech.channel || 1 };
}

const LEAD_IN = 3000, PRE = 300, INST_GAP = 1500, HOLD = 4000, TAIL = 3000, VEL = 127;
const notes = [];
let t = LEAD_IN;
const rows = [];

for (const [key, set] of Object.entries(used)) {
    if (SKIP.has(key)) continue;
    const R = INSTRUMENTS[key];
    if (!R) continue;
    const tech = R.techniques.find(x => x.key === R.ordinary);
    const r = route(R, tech);
    const ps = [...set].sort((a, b) => a - b);
    const lo = Math.max(ps[0], R.rangeLow), hi = Math.min(ps[ps.length - 1], R.rangeHigh);
    const step = STEP[key] || DEFAULT_STEP;
    const grid = new Set([lo, hi, ...(MUST[key] || []).filter(p => p >= lo && p <= hi)]);
    for (let p = lo; p <= hi; p += step) grid.add(p);
    const pitches = [...grid].sort((a, b) => a - b);
    t += INST_GAP;
    for (const pitch of pitches) {
        notes.push({ i: notes.length, role: 'regfine', inst: key, label: R.label, tech: tech.key, techLabel: tech.label,
                     port: r.port, ch: r.ch, cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null,
                     pitch, vel: VEL, cc7: 127, anchor: pitch === lo,
                     tPreMs: t - PRE, tOnMs: t, tOffMs: t + HOLD });
        t += HOLD + TAIL;
    }
    rows.push({ key, label: R.label, port: r.port, ch: r.ch, step, lo, hi, n: pitches.length, pitches });
}

const totalMs = t + 2000;
fs.writeFileSync(OUT, JSON.stringify({
    generatedAt: new Date().toISOString(), planItem: '1b.5-register', piece: 'lgmf',
    what: 'a register grid at velocity 127 over the pitches each instrument actually plays, on its curve channel',
    why: 'the 3-pitch grid is 0d’s and the piece uses 13–40 pitches per instrument, most outside it (RUNNING_LOG §90)',
    defaultStep: DEFAULT_STEP, perInstrumentStep: STEP, mustInclude: MUST, skipped: [...SKIP], vel: VEL,
    timing: { leadInMs: LEAD_IN, preMs: PRE, holdMs: HOLD, tailMs: TAIL, instGapMs: INST_GAP },
    grids: rows, totalMs, notes,
}, null, 1) + '\n');

const mm = Math.floor(totalMs / 60000), ss = Math.round((totalMs % 60000) / 1000);
console.log('THE REGISTER GRID — ' + notes.length + ' notes · ' + mm + ':' + String(ss).padStart(2, '0') + '\n');
for (const r of rows) {
    console.log('  ' + r.label.padEnd(15) + 'step ' + r.step + '  ' + String(r.n).padStart(2) + ' pitches  '
        + r.lo + '–' + r.hi + '  on ' + r.port + ' ch' + r.ch);
    console.log('  '.padEnd(17) + r.pitches.join(' '));
}
console.log('\n  the vibraphone is skipped — already measured at every semitone (§89)');
console.log('\nwrote ' + path.relative(ROOT, OUT));
