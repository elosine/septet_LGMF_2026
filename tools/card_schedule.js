#!/usr/bin/env node
// card_schedule.js — PLAN 1b.2 (2026-09-19): the INSTRUMENT CARD's timetable.
//
//   node tools/card_schedule.js [--out probes/card_schedule.json] [--print]
//
// WHAT THE CARD IS FOR, and how it differs from 0d's balance run (RUNNING_LOG §76, §77). 0d measured every
// note for **1.2 seconds** and took the loudest 400 ms inside it. That is right for a one-shot and wrong for
// anything that lives longer than its attack: the bowed vibraphone peaks at −20.7 dBFS and is 20 dB down
// 7.4 s later (§69), so a 400 ms window at its onset described its first half-second and the trim computed
// from it made the ONSET match while the rest of the note vanished — which is his *"vibraphone is quiet"*.
// So every note here is **held 4 s and given its full tail**, and the analyzer reports it TWO ways:
// the loudest 400 ms (how it speaks) and the K-weighted RMS over the whole sounding note (how loud it IS).
// The difference between them is the instrument's decay profile, and it is the number a sustained
// instrument has to be balanced on.
//
// And it is measured in ABSOLUTE dBFS at the master: REC has been at unity since 1b.0 and the chain is
// proven to three decimals (1b.1, bank/reference.json), so a number here is comparable with any other
// studio's — which 0d's, taken through a −12 dB trim, was not.
//
// THE PITCHES ARE 0d's OWN (bank/balance.json anchorByPitch), so every row is directly comparable with the
// old one — the expectation being +12.0 dB from the REC trim alone, and the analyzer says where that fails.
//
// FOUR ROLES
//   card   3 pitches x 4 velocities (24 · 64 · 100 · 127) per pitched instrument — the card itself
//   high   THE HORN ONLY, a fourth pitch at 72: above the SI2 library's F4, so it sounds through the
//          ReaPitch "Horn SI2 high" path of 1a.1, which no measurement has ever covered. §68 proved the
//          split is level-neutral by meter; this says what it is in dBFS.
//   bend   one note per pitched instrument, mid pitch at velocity 100, with +50 % pitch bend — its cents
//          against the unbent note of the same pitch and velocity (already in the run) fills
//          bank/bend_ranges.json for the five instruments that have never been measured. §74's open
//          question; the english horn and double bass carry an INFERRED 1 st today.
//   perc   a SPOT CHECK, not a re-measurement: four instruments spanning 0d's range (finger cymbals ·
//          tam tams · triangles · castanets, +15 to +32 dB of trim) on their own anchor keys. 0d's
//          percussion numbers are DIFFERENCES and survive the REC change as a constant +12.0 dB; these
//          four say whether that carry-over is true before 1b.3 leans on it for all fourteen.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.join(ROOT, arg('out', 'probes/card_schedule.json'));
const PRINT = process.argv.includes('--print');
// --channels curve  (PLAN 1b.4, 2026-09-19): measure on the CHANNELS THE PIECE PLAYS, not on main 1.
// A drawn note is a curve event and routes to the CURVE BANK - the SI2 three to their `b` instance, the
// Xsample four to channels 2-4 of their own port; only a plain or keyswitched note uses main channel 1.
// This flag exists because that distinction turned out to matter: RUNNING_LOG §56's UVI "Dynamic Amount"
// fix reached PART 1 OF THE MAIN INSTANCE ONLY, so the horn's and trumpet's 26 dB velocity range sat on a
// part the piece never plays, while every drawn note went through curve copies still at the factory 0.70
// (about 8 dB). A card measured on main channel 1 therefore described something the music does not use.
// --only key,key   limit to named instruments.   --pitches mid   the middle pitch alone (a spot check).
const CHANNELS = arg('channels', 'main');
const ONLY = (arg('only', '') || '').split(',').filter(Boolean);
const PITCHES = arg('pitches', 'all');

const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const BAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'balance.json'), 'utf8'));
const BRASS = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'balance_brass.json'), 'utf8'));
const OLD = JSON.parse(fs.readFileSync(path.join(ROOT, 'probes', 'balance_schedule.json'), 'utf8'));

const PITCHED = ['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass'];
const VELS = [24, 64, 100, 127];          // pp · mp · f · fff — four points carry a monotone fit for 1b.4
const BEND_VEL = 100;
const HORN_HIGH_PITCH = 72;               // sounding C5: above F4, so it can only arrive through ReaPitch
const PERC_SPOT = ['small_metals_finger_cymbals', 'tam_tams_a', 'small_metals_triangles', 'toys_castanets'];
const PERC_VELS = [127, 64];

// timing, in ms — the whole point of the run is that a note gets its life
const LEAD_IN = 3000;                     // the analyzer finds the schedule by the first onset; 3 s of room
const PRE = 300;                          // CC7 / CC0 / keyswitch / bend, ahead of the note
const HOLD = 4000;
const TAIL = 3000;                        // after note-off, for a release that rings
const TAIL_VIB = 8000;                    // the bowed vibraphone is 20 dB down 7.4 s after its peak (§69)
const PERC_HOLD = 200;
const PERC_TAIL = 3800;
const INST_GAP = 1500;

// 0d's pitches, so the two runs are row-for-row comparable
const pitchesOf = {};
for (const src of [BAL, BRASS]) for (const I of src.instruments) {
    if (I.anchorByPitch) pitchesOf[I.inst] = Object.keys(I.anchorByPitch).map(Number).sort((a, b) => a - b);
}

// the percussion spot check reuses the OLD schedule's own notes, so key, channel and technique are identical
const percNote = {};
for (const n of OLD.notes) if (n.role === 'perc' && n.anchor && !percNote[n.inst]) percNote[n.inst] = n;

const notes = [];
let t = LEAD_IN;
const push = (o, hold, tail) => {
    notes.push(Object.assign({ i: notes.length, tPreMs: t - PRE, tOnMs: t, tOffMs: t + hold }, o));
    t += hold + tail;
};

for (const key of PITCHED) {
    if (ONLY.length && !ONLY.includes(key)) continue;
    const R = INSTRUMENTS[key];
    const tech = R.techniques.find(x => x.key === R.ordinary);
    if (!tech) throw new Error('no ordinary technique for ' + key);
    let port, ch;
    if (CHANNELS === 'curve' && R.channels && Array.isArray(R.channels.curve) && R.channels.curve.length) {
        const e = R.channels.curve[0];                       // the first slot of the bank; the three are copies
        if (e && typeof e === 'object') { port = e.port; ch = e.ch; } else { port = R.port; ch = e; }
    } else {
        port = tech.port || R.port;
        ch = tech.channel || (R.channels && R.channels.main) || 1;
    }
    const tail = key === 'bowed_vibraphone' ? TAIL_VIB : TAIL;
    const base = { inst: key, label: R.label, tech: tech.key, techLabel: tech.label, port, ch,
                   cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null, cc7: 127 };
    let pitches = pitchesOf[key].slice();
    if (PITCHES === 'mid') pitches = [pitchesOf[key][1]];
    if (key === 'horn') pitches.push(HORN_HIGH_PITCH);
    t += INST_GAP;
    for (const pitch of pitches) {
        for (const vel of VELS) {
            push(Object.assign({}, base, { role: (key === 'horn' && pitch === HORN_HIGH_PITCH) ? 'high' : 'card',
                                           pitch, vel, anchor: vel === 64 }), HOLD, tail);
        }
    }
    // the bend note: mid pitch, +50 % of full bend, centred again after the note
    const mid = pitchesOf[key][1];
    const bendVal = 8192 + Math.round(0.5 * 8191);
    push(Object.assign({}, base, { role: 'bend', pitch: mid, vel: BEND_VEL, bend: bendVal, fraction: 0.5,
                                   bendResetMs: t + HOLD + 400 }), HOLD, tail);
}

for (const key of (ONLY.length ? [] : PERC_SPOT)) {
    const n = percNote[key];
    if (!n) { console.error('no 0d anchor note for ' + key + ' — skipped'); continue; }
    t += INST_GAP;
    for (const vel of PERC_VELS) {
        push({ role: 'perc', inst: key, label: n.label, tech: n.tech, techLabel: n.techLabel,
               port: n.port, ch: n.ch, cc0: n.cc0, ks: n.ks, pitch: n.pitch, vel, cc7: null, anchor: vel === 127 },
             PERC_HOLD, PERC_TAIL);
    }
}

const totalMs = t + 2000;
const out = {
    generatedAt: new Date().toISOString(), planItem: '1b.2', piece: 'lgmf',
    what: 'the instrument card: absolute loudness per instrument, pitch and velocity, measured two ways',
    standard: 'K-20 (Katz / SMPTE RP 200); loudness ITU-R BS.1770. REC is at unity since 1b.0, so every level '
            + 'is dBFS AT THE MASTER (bank/reference.json proves the chain to three decimals).',
    vels: VELS, percVels: PERC_VELS, pitched: PITCHED, pitches: pitchesOf, hornHighPitch: HORN_HIGH_PITCH,
    percSpot: PERC_SPOT,
    timing: { leadInMs: LEAD_IN, preMs: PRE, holdMs: HOLD, tailMs: TAIL, tailVibMs: TAIL_VIB,
              percHoldMs: PERC_HOLD, percTailMs: PERC_TAIL, instGapMs: INST_GAP },
    comparison: { to: 'bank/balance.json (0d)', expectedOffsetDb: 12.0,
                  why: 'the only deliberate change to the chain is REC −12 dB → unity; anything else is a finding' },
    totalMs, notes,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
const mm = Math.floor(totalMs / 60000), ss = Math.round((totalMs % 60000) / 1000);
console.log('THE INSTRUMENT CARD — ' + notes.length + ' notes · ' + mm + ':' + String(ss).padStart(2, '0') + '\n');
const byRole = {};
for (const n of notes) byRole[n.role] = (byRole[n.role] || 0) + 1;
console.log('  roles: ' + Object.entries(byRole).map(([k, v]) => k + ' ' + v).join(' · '));
console.log('  pitched: ' + PITCHED.map(k => INSTRUMENTS[k].label + ' ' + pitchesOf[k].join('/')).join(' · '));
console.log('  velocities ' + VELS.join(' · ') + '   notes held ' + (HOLD / 1000) + ' s, tail ' + (TAIL / 1000)
    + ' s (' + (TAIL_VIB / 1000) + ' s for the vibraphone)');
console.log('  the horn also at ' + HORN_HIGH_PITCH + ' (through ReaPitch) · a bend note per instrument · '
    + PERC_SPOT.length + ' percussion spot checks');
console.log('\nwrote ' + path.relpath_ ? '' : path.relative(ROOT, OUT));
if (PRINT) for (const n of notes) console.log(('  ' + (n.tOnMs / 1000).toFixed(1)).padStart(9) + ' s  '
    + String(n.label).padEnd(17) + String(n.port).padEnd(11) + 'ch' + String(n.ch).padEnd(3)
    + 'note ' + String(n.pitch).padStart(3) + ' vel ' + String(n.vel).padStart(3) + '  ' + n.role
    + (n.bend != null ? '  bend ' + n.bend : ''));
