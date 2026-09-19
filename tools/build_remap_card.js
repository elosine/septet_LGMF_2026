#!/usr/bin/env node
// build_remap_card.js — PLAN 1b.4 (2026-09-19): the VELOCITY REMAP, from the instrument card.
//
//   node tools/build_remap_card.js [--span 17] [--out bank/velocity_remap.json] [--dry]
//
// It supersedes tools/build_remap.js, which read 0d's bank/balance.json — relative levels measured through
// a REC bus 12 dB down, on main channel 1, with the SI2 curve copies still at the factory Dynamic 0.70
// (RUNNING_LOG §76, §85). This reads bank/instrument_card.json, measured on the channels the piece plays.
//
// WHAT A REMAP IS FOR. The 1b.3 trims made every instrument equally loud at ONE velocity (127). Away from
// it they diverge, because each sampler climbs at its own rate — across velocity 24→127 the cello moves
// 17.7 dB and the bassoon 31.9. The remap closes that: for a drawn dynamic height, the velocity to send so
// the note lands on the ENSEMBLE's level for that height, whatever instrument and whatever register.
// The score keeps one scale; each instrument translates on the way out.
//
// THE WRITTEN SPAN — his decision, option C (2026-09-19). Until today it was **10 dB** from a written pp to
// a written fff, because the app's drawn height maps to anchor velocities 65–127 and 0d's target curve
// spanned only that. A real ensemble is far wider, and §44 set the goal as "realistic aural feedback during
// the composing phase". The constraint was the narrowest instrument: the bassoon at 11.7 dB — until §85
// found its curve copies had been on Dynamic 0.70 all along and fixing them took it to 31.9. The narrowest
// is now the **cello at 17.7 dB**, so the span is set to **17 dB**, which every instrument clears without
// clamping. Change it with --span; the tool prints what clamps.
//
// THE SCALE IS INDEXED 65–127, not 24–127 as 0d's was. The app only ever asks for anchor velocities in that
// range (`HELD_LO`/`HELD_HI` in composer.html; morph_emit uses the same two), so the rest of the old table
// was dead weight and the part that was used carried the whole span in 62 steps of index.
//
// AND EVERY CURVE IS NORMALISED PER INSTRUMENT to its own velocity-127 mean before it is inverted. That is
// what makes the bank immune to the card's mixed provenance (§85: the SI2 three re-measured post-trim on
// their curve channels, the other five still pre-trim on main 1 — same SHAPE, one trim of offset). It is
// also what flattens the **vibraphone's register**: its nine pitches span 15.4 dB, so normalising to the
// instrument's mean and then solving per pitch sends a LOWER velocity to its loud bars and a higher one to
// its quiet ones. The fader carries the mean (1b.3); this carries the rest.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes('--dry');
const SPAN = +arg('span', 17);
const OUT = path.join(ROOT, arg('out', 'bank/velocity_remap.json'));
const LO = 65, HI = 127;                    // composer.html HELD_LO / HELD_HI

const CARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'instrument_card.json'), 'utf8'));
const TRIMS = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'trims.json'), 'utf8'));
const TOP = TRIMS.target.perVoiceCardDb;    // each voice at fff, on the card's scale (1b.3)

const PITCHED = ['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass'];

// the ensemble's target level at each anchor velocity: linear in dB, because equal steps of drawn height
// should be equal steps of loudness, and loudness in dB is what the ear reads as a dynamic level
const targetDb = [];
for (let a = LO; a <= HI; a++) targetDb.push(Math.round((TOP - SPAN * (1 - (a - LO) / (HI - LO))) * 100) / 100);

// pool adjacent violators: the least change that makes a curve non-decreasing. The trumpet needs it —
// its velocity 127 reads 1.5 dB UNDER its 100 (§78) — and an inverted curve must be monotone or the
// solver can return two velocities for one level.
function monotone(points) {
    const v = points.map(p => p.db), w = points.map(() => 1), out = [];
    for (let i = 0; i < v.length; i++) {
        let val = v[i], wt = w[i];
        while (out.length && out[out.length - 1].val > val) {
            const last = out.pop();
            val = (last.val * last.wt + val * wt) / (last.wt + wt); wt += last.wt;
        }
        out.push({ val, wt });
    }
    const flat = [];
    for (const s of out) for (let i = 0; i < s.wt; i++) flat.push(Math.round(s.val * 100) / 100);
    return points.map((p, i) => ({ v: p.v, db: flat[i] }));
}

// the velocity at which a monotone curve reaches `want`; linear between measured points, and the ends
// report a clamp rather than pretending
function velocityAt(curve, want) {
    if (want <= curve[0].db) return { vel: curve[0].v, clamp: want < curve[0].db - 0.05 ? 'low' : null };
    const last = curve[curve.length - 1];
    if (want >= last.db) return { vel: last.v, clamp: want > last.db + 0.05 ? 'high' : null };
    for (let i = 1; i < curve.length; i++) {
        if (want <= curve[i].db) {
            const a = curve[i - 1], b = curve[i];
            const t = (want - a.db) / Math.max(1e-9, b.db - a.db);
            return { vel: Math.round(a.v + (b.v - a.v) * t), clamp: null };
        }
    }
    return { vel: last.v, clamp: null };
}

const out = { generatedAt: new Date().toISOString(), planItem: '1b.4', piece: 'lgmf',
    source: 'bank/instrument_card.json', cardGeneratedAt: CARD.generatedAt,
    supersedes: 'tools/build_remap.js from bank/balance.json (0d) — see RUNNING_LOG §76, §85',
    standard: TRIMS.standard,
    method: 'Per instrument and register: the measured velocity→loudness curve (the INTEGRATED figure, K-weighted '
          + 'RMS over the whole sounding note), normalised to that instrument’s own velocity-127 mean, made '
          + 'non-decreasing by pooling adjacent violators, then inverted against the ensemble target. D13 stands: '
          + 'VELOCITY is the dynamic; CC7 is left at 127 and keeps its one job, shaping a held note.',
    anchor: { kind: 'absolute', note: 'the target is the 1b.3 figure — a ' + TRIMS.target.voices + '-voice tutti at '
        + TRIMS.target.tuttiLufs + ' LUFS-S, so each voice at ' + TOP + ' dB on the card’s scale at fff. 0d anchored on '
        + 'the ensemble MEDIAN because it had no absolute reference; 1b.1 gave it one.' },
    scale: { lo: LO, hi: HI, spanDb: SPAN,
        note: 'a drawn height h means anchor velocity ' + LO + ' + ' + (HI - LO) + '·h, and the tables are indexed by '
            + '(anchorVel − lo). The whole written range pp→fff spans ' + SPAN + ' dB — widened from ~10 at his word '
            + '(option C, 2026-09-19); the narrowest instrument, the cello, has 17.7 dB to give.' },
    targetDb, instruments: {}, notRemapped: {}, clamps: [] };

const rows = [];
for (const key of PITCHED) {
    const I = CARD.instruments[key];
    if (!I) { out.notRemapped[key] = 'not in the card'; continue; }
    // gather the measured points per pitch
    const byPitch = {};
    for (const v of Object.keys(I.byVelocity)) {
        const pp = I.byVelocity[v].perPitch || {};
        for (const p of Object.keys(pp)) {
            if (pp[p].integratedDb == null) continue;
            (byPitch[p] = byPitch[p] || []).push({ v: +v, db: pp[p].integratedDb });
        }
    }
    const pitches = Object.keys(byPitch).map(Number).sort((a, b) => a - b)
        .filter(p => byPitch[p].length >= 2);
    if (!pitches.length) { out.notRemapped[key] = 'fewer than two velocity points at any pitch'; continue; }

    const at127 = pitches.map(p => (byPitch[p].find(q => q.v === 127) || {}).db).filter(d => d != null);
    const ref = at127.reduce((s, d) => s + d, 0) / at127.length;      // this instrument's own fff mean
    const offset = TOP - ref;                                          // what normalisation shifts it by

    const entry = { label: I.label, port: I.port, trimDb: (TRIMS.instruments.find(r => r.inst === key) || {}).proposedTrimDb,
        referenceDb: Math.round(ref * 100) / 100, offsetAppliedDb: Math.round(offset * 100) / 100,
        measuredSpanDb: null, pitches: [] };

    let lo127 = Infinity, hi127 = -Infinity, clampLow = 0, clampHigh = 0;
    for (const p of pitches) {
        const raw = byPitch[p].sort((a, b) => a.v - b.v);
        const norm = raw.map(q => ({ v: q.v, db: Math.round((q.db + offset) * 100) / 100 }));
        const mono = monotone(norm);
        const table = [];
        let cl = 0, ch = 0;
        for (let a = LO; a <= HI; a++) {
            const r = velocityAt(mono, targetDb[a - LO]);
            table.push(Math.max(1, Math.min(127, r.vel)));
            if (r.clamp === 'low') cl++; if (r.clamp === 'high') ch++;
        }
        clampLow += cl; clampHigh += ch;
        const d127 = (norm.find(q => q.v === 127) || {}).db;
        if (d127 != null) { lo127 = Math.min(lo127, d127); hi127 = Math.max(hi127, d127); }
        entry.pitches.push({ pitch: p, measured: raw, normalised: norm, monotone: mono,
                             table, clampedLow: cl, clampedHigh: ch,
                             spanDb: Math.round((mono[mono.length - 1].db - mono[0].db) * 100) / 100 });
    }
    entry.measuredSpanDb = Math.round(Math.max(...entry.pitches.map(p => p.spanDb)) * 100) / 100;
    entry.registerSpreadAtFffDb = isFinite(hi127 - lo127) ? Math.round((hi127 - lo127) * 100) / 100 : null;
    entry.clampedLow = clampLow; entry.clampedHigh = clampHigh;
    out.instruments[key] = entry;
    rows.push({ key, entry });
    if (clampLow || clampHigh) out.clamps.push({ inst: key, label: I.label, low: clampLow, high: clampHigh });
}
for (const [k, I] of Object.entries(CARD.instruments)) {
    if (!PITCHED.includes(k)) out.notRemapped[k] = 'percussion — a one-shot’s velocity IS its dynamic and it has no '
        + 'sustained reference to match; its balance is the fff = fff trim of 1b.3';
}

console.log('PLAN 1b.4 — THE VELOCITY REMAP, from the instrument card\n');
console.log('  span            ' + SPAN + ' dB from a written pp to a written fff  (was ~10)');
console.log('  the scale       anchor velocity ' + LO + '–' + HI + ', target ' + targetDb[0].toFixed(2)
    + ' → ' + targetDb[targetDb.length - 1].toFixed(2) + ' dB, linear in dB');
console.log('  judged on       the INTEGRATED figure, normalised per instrument to its own fff mean\n');
console.log('  instrument        pitches  own span  register@fff  normalised by   vel at pp → fff   clamps');
for (const { key, entry } of rows) {
    const mid = entry.pitches[Math.floor(entry.pitches.length / 2)];
    const vLo = mid.table[0], vHi = mid.table[mid.table.length - 1];
    console.log('  ' + entry.label.padEnd(17) + String(entry.pitches.length).padStart(6)
        + entry.measuredSpanDb.toFixed(1).padStart(10) + String(entry.registerSpreadAtFffDb ?? '—').padStart(14)
        + (entry.offsetAppliedDb >= 0 ? '+' : '') + entry.offsetAppliedDb.toFixed(2).padStart(15)
        + ('  ' + vLo + ' → ' + vHi).padStart(18)
        + ((entry.clampedLow || entry.clampedHigh) ? ('  ' + entry.clampedLow + ' low / ' + entry.clampedHigh + ' high') : '   none'));
}
const vib = out.instruments.bowed_vibraphone;
if (vib) {
    console.log('\n  THE VIBRAPHONE’S REGISTER, flattened by the table — the velocity each pitch gets at a written fff:');
    console.log('   ' + vib.pitches.map(p => p.pitch + ': ' + p.table[p.table.length - 1]).join('   '));
    console.log('   (its bars differ by ' + vib.registerSpreadAtFffDb + ' dB, so the loud ones are sent a lower velocity)');
}
if (out.clamps.length) {
    console.log('\n  CLAMPED — the span asks for more than the instrument has, at some register:');
    for (const c of out.clamps) console.log('    ' + c.label.padEnd(17) + c.low + ' anchor steps at the quiet end, ' + c.high + ' at the loud end');
} else console.log('\n  NOTHING CLAMPS — every instrument covers the full ' + SPAN + ' dB at every measured register.');

if (DRY) { console.log('\ndry run — nothing written'); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log('\nwrote ' + path.relative(ROOT, OUT));
