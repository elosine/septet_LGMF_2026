#!/usr/bin/env node
// balance_schedule.js — the ENSEMBLE BALANCE probe's timetable, generated from the recipe file.
// (composer, 2026-09-04: "an easy but data based way to normalize the volume between
// instruments … a 127 flute is same perceived loudness as 127 violin" — RUNNING_LOG §41.)
//
// For every track in score order, the instrument's PLAIN technique (the first of
// ord · main · senza_vel · senza_mw · staccato that it has) at three pitches — 25 / 50 / 75 %
// of that technique's range — at velocity 127 and 64; then (composer, 2026-09-04: "add above
// articulations against each other") the STRIKE articulation of each instrument the same way:
// flute pizzicato · bass clarinet slap tongue · violins Bartók pizz · viola/cello gettato; the
// piano has none (its main is its strike). One note at a time, a fixed timetable,
// so the recording can be sliced by the same file:
//
//   node tools/balance_schedule.js [--note 1500] [--gap 1000] [--lead 3000] [--vels 127,64]
//                                  [--only violin1,cello] [--nostrike] [--strike flute=pizzicato,cello=gettato_vel]
//                                  [--out probes/balance_schedule.json]
//
// Then: probes/balance_probe.ps1 plays it into the rack (record the REC track meanwhile) and
// probes/analyze_balance.py measures the recording → bank/balance.json + the trims.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
// --sweep (2026-09-06, PLAN 1g item 1 + item 5): the VELOCITY / CC7 sweep — role 'ref' = the balance run's own notes (plain
// technique, three pitches, 127: the consistency check against bank/balance.json), role 'vel' = the same at eight velocities,
// role 'cc7' = the same at velocity 100 under eight CC7 values; every note carries cc7 (127 unless swept).
const sweep2 = args.includes('--sweep2');   // the second sweep (RUNNING_LOG §118): dense steps where the sampler is deterministic, repeats where it scatters
const sweep = args.includes('--sweep') || sweep2;
const seq = (hi, lo, step) => { const a = []; for (let v = hi; v >= lo; v -= step) a.push(v); if (a[a.length - 1] !== lo) a.push(lo); return a; };
// per instrument: [velocities, repeats] — the piano's velocity layers form a staircase (every 2), the flute is smooth (every 8), both
// deterministic (one note is exact); the strings and the bass clarinet scatter by round robin (three notes per point, averaged)
const SWEEP2 = { flute: [seq(127, 20, 8), 1], piano: [seq(127, 21, 2).concat([20]), 1], bass_clarinet: [null, 3], violin1: [null, 3], violin2: [null, 3], viola: [null, 3], cello: [null, 3] };
// --proof (PLAN 1g item 1, to-do 6): every instrument's ordinary voice at its middle measured register, at the bottom, the
// middle and the top of a curve (anchor velocity 65 · 96 · 127) — each sent the velocity bank/velocity_remap.json prescribes;
// the recording must show the seven at one level per height (within about 1.5 dB).
// --ranges (PLAN 0d re-scoped, 2026-09-06): the samples' TRUE ranges and the one-shots' lengths — every semitone of each one-shot in
// use, every second semitone of the rest, across the technique's keyboard zone at 127, each note left to ring; the analyzer
// (--ranges) reads per key whether it sounded and how long it rang. [key, step, class]: 'one' = a one-shot (rings on its own),
// 'sus' = sustained (held, the range only).
const ranges = args.includes('--ranges');
const STRING_ROWS = [['bartok_vel', 1, 'one'], ['gettato_vel', 1, 'one'], ['senza_vel', 2, 'sus'], ['accent_senza_vel', 2, 'sus'], ['marcato_sfz_vel', 2, 'sus'], ['marcato_stac_vel', 2, 'one'], ['spicc_vel', 2, 'one'], ['stac_vel', 2, 'one']];
const RANGES_PLAN = {
    flute: [['pizzicato', 1, 'one'], ['tongue_ram', 1, 'one'], ['staccato', 1, 'one'], ['ord', 2, 'sus'], ['sforzando', 2, 'sus'], ['fortepiano', 2, 'sus']],
    bass_clarinet: [['slap', 1, 'one'], ['stac_vel', 1, 'one'], ['secco', 1, 'one'], ['senza_vel', 2, 'sus'], ['accent_vel', 2, 'sus'], ['portato', 2, 'sus']],
    piano: [['main', 2, 'sus'], ['plucked', 2, 'one'], ['harmonics', 2, 'one']],
    violin1: STRING_ROWS, violin2: STRING_ROWS, viola: STRING_ROWS, cello: STRING_ROWS,
};
const RANGE_TIMING = { one: { holdMs: +opt('onehold', 200), gapMs: +opt('onegap', 1300) }, sus: { holdMs: +opt('sushold', 600), gapMs: +opt('susgap', 500) } };
const held = args.includes('--held');   // 1g item 5's proof: a held note at three heights — the velocity for the top, CC7 for the height
const proof = args.includes('--proof') || held;
// --bend (PLAN 1f step 1, 2026-09-07 — the palette): the PITCH-BEND probe of the six bending players (the piano is out of the
// beating, CN-34) on their ordinary voices (`ordinary`), each at the middle of the voice's measured range, velocity 100, held 2 s
// with 2 s of settle (the tuba's probes/bend_probe.ps1, adapted to this kit). Per player eight slots: an unbent REFERENCE ·
// +50 % · +100 % · −100 % of full bend (the sampler's range in semitones = the measured cents ÷ the fraction) · a bent note
// left UNRESET and the plain note after it (the residue the tick's resetMorphBend guards against) · RPN 0 asked for 12
// semitones then +100 % (can MIDI change the range?) · RPN 0 back to 2 and +100 % again (did the range come back?). The bend is
// sent with the prelude (preMs before the note, after CC7 / CC0 / the keyswitch) and centred `bendResetMs` after the note-off.
// Played by probes/balance_probe.ps1 (the bend / rpn / reset events), read by probes/analyze_bend.py → bank/bend_ranges.json.
const bend = args.includes('--bend');
const BEND_CENTRE = 8192;
const bendValue = f => Math.max(0, Math.min(16383, Math.round(BEND_CENTRE + f * (f >= 0 ? 8191 : 8192))));   // full up = +8191, full down = −8192
const bendFraction = v => (v - BEND_CENTRE) / (v >= BEND_CENTRE ? 8191 : 8192);                             // the exact fraction the value is
const BEND_SLOTS = [   // [step, fraction | null (no bend message), reset after the note?, RPN 0 value | null, what the analyzer reads]
    ['ref',   0.0,  true,  null, 'the unbent baseline every cents figure is measured against'],
    ['+50',   0.5,  true,  null, 'half of full bend up'],
    ['+100',  1.0,  true,  null, 'full bend up'],
    ['-100', -1.0,  true,  null, 'full bend down'],
    ['res_a', 0.5,  false, null, 'bent +50 %, NOT reset after — the residue trap set'],
    ['res_b', null, true,  null, 'the next note with no bend message — sharp = the residue is real'],
    ['rpn12', 1.0,  true,  12,   'RPN 0 asked for 12 semitones, then full bend up — wider than +100 = RPN honoured'],
    ['rest',  1.0,  true,  2,    'RPN 0 back to 2, full bend up — the same as +100 = restored'],
];
const BEND_HOLD_MS = +opt('bendhold', 2000), BEND_SETTLE_MS = +opt('bendsettle', 2000), BEND_VEL = +opt('bendvel', 100), BEND_RESET_AFTER_MS = +opt('bendreset', 400);
if (ranges && (sweep || proof)) { console.error('--ranges stands alone'); process.exit(1); }
if (bend && (sweep || proof || ranges)) { console.error('--bend stands alone'); process.exit(1); }
const PROOF_H = opt('proofh', '0,0.5,1').split(',').map(Number);
const PROOF_LO = +opt('prooflo', 65), PROOF_HI = +opt('proofhi', 127);
const REPEAT = Math.max(1, +opt('repeat', 1));   // each proof note played this many times in a row: the sampler's note-to-note scatter (round robins) averages out
let VelocityRemap = null, remapBank = null;
if (proof) { VelocityRemap = require(path.join(ROOT, 'score', 'public', 'velocity_remap.js')); remapBank = JSON.parse(fs.readFileSync(path.resolve(ROOT, opt('remap', 'bank/velocity_remap.json')), 'utf8')); }
const SWEEP_VELS = opt('sweepvels', '127,112,96,80,64,48,32,20').split(',').map(Number);
const SWEEP_CC7S = opt('sweepcc7', '127,112,96,80,64,48,32,16').split(',').map(Number);
const cc7Vel = +opt('cc7vel', 100);
// --nocc7 (composer 2026-09-10, RUNNING_LOG §373): send NO CC7 at all. CC7 is MIDI Volume, and Kontakt's instrument volume knob
// and UVI Workstation's part volume are bound to it — so the probe's CC7 127 before every note SLAMS THEM TO FULL and wipes any
// per-voice trim he has dialled in. He found it himself: *"anything I do even a shut reaper down reopen keeps the volume settings
// but after your probe they reset."* Every measurement before this flag existed was taken with every volume knob forced to
// maximum, which is why no trim ever showed in a re-run.
const noCc7 = args.includes('--nocc7');

const ORDER = ['flute', 'bass_clarinet', 'piano', 'violin1', 'violin2', 'viola', 'cello'];   // D10 score order
const PLAIN_PREF = ['ord', 'main', 'senza_vel', 'senza_mw', 'staccato'];
const FRACS = [0.25, 0.5, 0.75];
// the strike articulations (composer, 2026-09-04 — the drawer's new defaults, "all fff=127")
const STRIKE_TECHS = { flute: 'pizzicato', bass_clarinet: 'slap', violin1: 'bartok_vel', violin2: 'bartok_vel', viola: 'gettato_vel', cello: 'gettato_vel' };

// sandbox/instruments.js is a browser script (`const INSTRUMENTS = …`, no exports) — evaluate it
const src = fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8');
const INSTRUMENTS = vm.runInNewContext(src + '\n;INSTRUMENTS;', {});

const noteMs = +opt('note', (sweep || proof) ? 1200 : 1500), gapMs = +opt('gap', (sweep || proof) ? 800 : 1000), leadMs = +opt('lead', 3000), instGapMs = +opt('instgap', (sweep || proof) ? 1500 : 2000);
const preMs = 300;                                                       // CC7 / CC0 / keyswitch lead before each note
const vels = opt('vels', '127,64').split(',').map(Number);
const only = opt('only', '').split(',').filter(Boolean);
const noStrike = args.includes('--nostrike');
// --strike takes ONE OR MORE extra techniques per instrument: `--strike piano=plucked+harmonics+muted,cello=gettato_vel`
// (composer 2026-09-10, RUNNING_LOG §366 — the piano has three alternate voices and one run should measure them all against the
// same reference in the same recording; §357 found none of them had ever been probed). Instruments are separated by commas,
// techniques within one instrument by `+`. The analyzer already keys its `techniques` map off each note's own tech name
// (probes/analyze_balance.py:322), so it needed no change.
opt('strike', '').split(',').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); STRIKE_TECHS[k] = v.split('+').filter(Boolean); });
const out = path.resolve(ROOT, opt('out', bend ? 'probes/bend_schedule.json' : ranges ? 'probes/ranges_schedule.json' : held ? 'probes/held_schedule.json' : proof ? 'probes/proof_schedule.json' : sweep2 ? 'probes/sweep2_schedule.json' : sweep ? 'probes/sweep_schedule.json' : 'probes/balance_schedule.json'));

const notes = [];
let t = leadMs, i = 0;
const add = (inst, I, tech, role, velList, cc7List, repeat) => {
    const lo = tech.rangeLow != null ? tech.rangeLow : I.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : I.rangeHigh;
    const pitches = FRACS.map(f => Math.round(lo + (hi - lo) * f));
    for (const cc7 of (cc7List || [127])) for (const vel of (velList || vels)) for (const pitch of pitches) for (let rpt = 0; rpt < (repeat || 1); rpt++) {
        notes.push({ i: i++, inst, label: I.label, role, rpt, tech: tech.key, techLabel: tech.label, port: tech.port || I.port, ch: tech.channel || 1,
                     cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null,
                     pitch, vel, cc7: noCc7 ? null : cc7, tPreMs: t - preMs, tOnMs: t, tOffMs: t + noteMs });
        t += noteMs + gapMs;
    }
    t += instGapMs;
};
const plan = [];
if (ranges) {
    for (const inst of ORDER) {
        if (only.length && !only.includes(inst)) continue;
        const I = INSTRUMENTS[inst]; if (!I) { console.error('no recipe for', inst); process.exit(1); }
        for (const [key, step, cls] of (RANGES_PLAN[inst] || [])) {
            const tech = I.techniques.find(q => q.key === key);
            if (!tech) { console.error('no technique ' + key + ' on ' + inst + ' — skipped'); continue; }
            const lo = tech.rangeLow != null ? tech.rangeLow : I.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : I.rangeHigh;
            if (lo == null || hi == null) { console.error('no zone for ' + inst + ':' + key + ' — skipped'); continue; }
            const tm = RANGE_TIMING[cls]; const keys = []; for (let p = lo; p <= hi; p += step) keys.push(p); if (keys[keys.length - 1] !== hi) keys.push(hi);
            plan.push({ inst, role: 'range', tech: key, cls, step, keys: keys.length });
            for (const pitch of keys) {
                notes.push({ i: i++, inst, label: I.label, role: 'range', cls, tech: tech.key, techLabel: tech.label, port: tech.port || I.port, ch: tech.channel || 1,
                             cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null, pitch, vel: 127, cc7: 127,
                             tPreMs: t - preMs, tOnMs: t, tOffMs: t + tm.holdMs, slotEndMs: t + tm.holdMs + tm.gapMs });
                t += tm.holdMs + tm.gapMs;
            }
            t += 700;
        }
        t += instGapMs;
    }
}
if (bend) {   // the six bending players, the ordinary voice, its middle measured pitch; eight slots each (BEND_SLOTS)
    for (const inst of ORDER) {
        if (only.length && !only.includes(inst)) continue;
        const I = INSTRUMENTS[inst]; if (!I) { console.error('no recipe for', inst); process.exit(1); }
        if (I.beating === false || inst === 'piano') continue;   // the piano is out of the beating (CN-34): an anchor only, never bent
        const tech = I.techniques.find(q => q.key === I.ordinary) || PLAIN_PREF.map(k => I.techniques.find(q => q.key === k)).find(Boolean);
        if (!tech) { console.error('no ordinary voice on ' + inst); process.exit(1); }
        const lo = tech.rangeLow != null ? tech.rangeLow : I.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : I.rangeHigh;
        const pitch = Math.round(lo + (hi - lo) * 0.5);
        plan.push({ inst, role: 'bend', tech: tech.key, pitch });
        for (const [step, frac, reset, rpn, what] of BEND_SLOTS) {
            const v = frac == null ? null : bendValue(frac);
            notes.push({ i: i++, inst, label: I.label, role: 'bend', step, what, tech: tech.key, techLabel: tech.label, port: tech.port || I.port, ch: tech.channel || 1,
                         cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null, pitch, vel: BEND_VEL, cc7: 127,
                         bend: v, bendFraction: v == null ? null : +bendFraction(v).toFixed(5), rpn, bendResetMs: reset ? t + BEND_HOLD_MS + BEND_RESET_AFTER_MS : null,
                         tPreMs: t - preMs, tOnMs: t, tOffMs: t + BEND_HOLD_MS });
            t += BEND_HOLD_MS + BEND_SETTLE_MS;
        }
        t += instGapMs;
    }
}
if (proof) {   // one note per height per instrument, the middle register, the remapped velocity
    for (const inst of ORDER) {
        if (only.length && !only.includes(inst)) continue;
        const I = INSTRUMENTS[inst]; if (!I) { console.error('no recipe for', inst); process.exit(1); }
        const tech = PLAIN_PREF.map(k => I.techniques.find(q => q.key === k)).find(Boolean) || I.techniques[0];
        const lo = tech.rangeLow != null ? tech.rangeLow : I.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : I.rangeHigh;
        const pitch = Math.round(lo + (hi - lo) * 0.5);
        plan.push({ inst, role: 'proof', tech: tech.key });
        for (const h of PROOF_H) {
            const anchorVel = Math.round(PROOF_LO + (PROOF_HI - PROOF_LO) * h);
            let vel = VelocityRemap.velocityFor(remapBank, inst, pitch, anchorVel);
            let cc7 = VelocityRemap.cc7For ? VelocityRemap.cc7For(remapBank, inst, pitch, anchorVel) : 127;   // the trim (§119)
            if (held) { const hn = VelocityRemap.heldNote(remapBank, inst, pitch, PROOF_HI); vel = hn.vel; cc7 = VelocityRemap.cc7ForHeight(remapBank, inst, pitch, vel, anchorVel); }   // §120
            for (let rpt = 0; rpt < REPEAT; rpt++) {
                notes.push({ i: i++, inst, label: I.label, role: held ? 'held' : 'proof', h, anchorVel, rpt, tech: tech.key, techLabel: tech.label, port: tech.port || I.port, ch: tech.channel || 1,
                             cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null, pitch, vel, cc7, tPreMs: t - preMs, tOnMs: t, tOffMs: t + noteMs });
                t += noteMs + gapMs;
            }
        }
        t += instGapMs;
    }
}
for (const role of ((proof || ranges || bend) ? [] : sweep2 ? ['ref', 'vel'] : sweep ? ['ref', 'vel', 'cc7'] : ['plain', 'strike'])) {
    if (role === 'strike' && noStrike) continue;
    for (const inst of ORDER) {
        if (only.length && !only.includes(inst)) continue;
        const I = INSTRUMENTS[inst];
        if (!I) { console.error('no recipe for', inst); process.exit(1); }
        let tech;
        if (role !== 'strike') tech = PLAIN_PREF.map(k => I.techniques.find(q => q.key === k)).find(Boolean) || I.techniques[0];
        // an instrument may carry SEVERAL extra voices; every other role has exactly one technique
        const techList = [];
        if (role !== 'strike') techList.push(tech);
        else {
            const ks = [].concat(STRIKE_TECHS[inst] || []);
            if (!ks.length) continue;
            for (const k of ks) {
                const t2 = I.techniques.find(q => q.key === k);
                if (!t2) { console.error('no technique ' + k + ' on ' + inst); process.exit(1); }
                techList.push(t2);
            }
        }
        for (const tq of techList) {
            plan.push({ inst, role, tech: tq.key });
            if (role === 'ref') add(inst, I, tq, role, [127], [127]);
            else if (role === 'vel' && sweep2) { const [vl, rp] = SWEEP2[inst] || [null, 1]; add(inst, I, tq, role, vl || SWEEP_VELS, [127], rp); }
            else if (role === 'vel') add(inst, I, tq, role, SWEEP_VELS, [127]);
            else if (role === 'cc7') add(inst, I, tq, role, [cc7Vel], SWEEP_CC7S);
            else add(inst, I, tq, role);
        }
    }
}
const schedule = { generatedAt: new Date().toISOString(), source: 'sandbox/instruments.js', order: ORDER.filter(k => !only.length || only.includes(k)),
                   strikeTechs: noStrike ? {} : STRIKE_TECHS, bend, bendPlan: bend ? { slots: BEND_SLOTS.map(s => ({ step: s[0], fraction: s[1], reset: s[2], rpn: s[3], what: s[4] })), holdMs: BEND_HOLD_MS, settleMs: BEND_SETTLE_MS, vel: BEND_VEL, resetAfterMs: BEND_RESET_AFTER_MS, bendLeadMs: preMs, players: plan.map(p => p.inst) } : null, ranges, rangesPlan: ranges ? plan : null, rangeTiming: ranges ? RANGE_TIMING : null, proof, proofH: proof ? PROOF_H : null, proofScale: proof ? { lo: PROOF_LO, hi: PROOF_HI } : null, proofRepeat: proof ? REPEAT : null, remapMeasuredAt: remapBank ? remapBank.measuredAt : null, trims: Object.fromEntries(ORDER.map(k => [k, INSTRUMENTS[k] && INSTRUMENTS[k].balanceDb != null ? INSTRUMENTS[k].balanceDb : 0])), sweep, sweepVels: sweep2 ? [...new Set(notes.filter(n => n.role === 'vel').map(n => n.vel))].sort((a, b) => b - a) : sweep ? SWEEP_VELS : null, sweep2, sweep2Plan: sweep2 ? Object.fromEntries(Object.entries(SWEEP2).map(([k, v]) => [k, { velocities: v[0] || SWEEP_VELS, repeats: v[1] }])) : null, sweepCc7s: sweep ? SWEEP_CC7S : null, cc7Vel: sweep ? cc7Vel : null, plan, leadInMs: leadMs, preMs, noteMs, gapMs, instGapMs, vels, fracs: FRACS, totalMs: t, notes };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(schedule, null, 1));
console.log('balance schedule → ' + path.relative(ROOT, out) + ' · ' + notes.length + ' notes · ' + (t / 1000).toFixed(1) + ' s');
for (const p of plan) {
    const n = notes.filter(q => q.inst === p.inst && q.tech === p.tech); if (!n.length) continue;
    console.log('  ' + p.role.padEnd(7) + n[0].label.padEnd(14) + n[0].port.padEnd(7) + ' ch' + String(n[0].ch).padEnd(3) + (n[0].cc0 != null ? 'cc0=' + n[0].cc0 : n[0].ks != null ? 'ks=' + n[0].ks : '      ').padEnd(8) +
                ' ' + n[0].techLabel.padEnd(34) + ' pitches ' + [...new Set(n.map(q => q.pitch))].join(' ') + '  t ' + (n[0].tOnMs / 1000).toFixed(1) + '-' + (n[n.length - 1].tOffMs / 1000).toFixed(1) + ' s');
}
