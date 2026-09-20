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
// CLOSED AT **12 dB**, his call (2026-09-19), and the reasoning is worth keeping because the obvious number
// was wrong. The limit is not an instrument's total range but what is LEFT of it once the register
// correction is paid for: the range at its tightest pitch, minus its register spread. That leaves 23.1 dB on
// the bassoon, 23.9 on the horn and 19.4 on the trumpet - but only **5.6 on the english horn, 5.4 on the
// cello and 6.6 on the double bass**, whose registers vary 11-12 dB. So 17 and 12 do not separate the cases:
// three instruments are comfortable at either and three run out of room at both. Narrowing makes the
// shortfall SMALLER, not absent, and it keeps the quiet end from clamping. 12 dB is still a large gain on
// the ~10 the app had before today, and where it falls short is the extreme LOUD end - while the scores sit
// at mf, where every instrument has room. His words: "it's realistic that it's going to vary a bit."
//
// CC7 CARRIES THE REGISTER ON THE VIBRAPHONE ONLY, also his call. CC7's other job is the CRESCENDO - the
// drawn curve's shape within a note - and he wants it left alone for that on everything else. The
// vibraphone is the exception because bowing barely changes level with velocity, so CC7 is its only lever.
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
const SPAN = +arg('span', 12);   // HIS CALL, 2026-09-19 - see the header
const OUT = path.join(ROOT, arg('out', 'bank/velocity_remap.json'));
const LO = 65, HI = 127;                    // composer.html HELD_LO / HELD_HI

const CARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'instrument_card.json'), 'utf8'));
const TRIMS = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'trims.json'), 'utf8'));
const TOP = TRIMS.target.perVoiceCardDb;    // each voice at fff, on the card's scale (1b.3)

const PITCHED = ['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass'];
// THE REGISTER BY CC7, NOT BY VELOCITY (his approval 2026-09-19; RUNNING_LOG §87). For these instruments
// velocity carries the DYNAMIC alone - one shared table, so every pitch is sent the same velocity at a
// given written height - and the per-pitch register offset is closed by CC7, which is a pure gain and does
// not change which sample plays. The bank's per-pitch `monotone` keeps each pitch's ACTUAL level, so the
// app's cc7ForHeight sees the residual (target - achieved) and asks cc7Curve to close it.
// Velocity alone could not do this: 29 dB per bar minus a 15.4 dB register spread leaves 13.7 dB common to
// every bar, under the 17 dB span (§86).
const REGISTER_BY_CC7 = new Set(['bowed_vibraphone']);
// CC7's attenuation law, MEASURED by 0d on the curve channels (bank/balance.json `cc7`: six CC7 values per
// pitch at velocity 100). On the vibraphone the three measured pitches agree within 0.1 dB and the whole
// set fits 60*log10(cc7/127) to 0.02 dB - a pure gain law, which is what makes it safe to use as a trim.
function cc7CurveFor(key) {
    let BAL; try { BAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'balance.json'), 'utf8')); } catch (e) { return null; }
    const row = (BAL.instruments || []).find(i => i.inst === key);
    if (!row || !row.cc7) return null;
    const byCc = {};
    for (const p of Object.keys(row.cc7)) {
        const ref = row.cc7[p]['127'];
        if (ref == null) continue;
        for (const c of Object.keys(row.cc7[p])) {
            const db = row.cc7[p][c];
            if (db == null) continue;
            (byCc[c] = byCc[c] || []).push(db - ref);
        }
    }
    const pts = Object.keys(byCc).map(Number).sort((a, b) => a - b)
        .map(c => ({ cc7: c, delta: Math.round((byCc[c].reduce((s, d) => s + d, 0) / byCc[c].length) * 100) / 100,
                     n: byCc[c].length }))
        .filter(q => q.n >= 1);
    // ascending by delta, most negative first - the order cc7ForDelta walks
    pts.sort((a, b) => a.delta - b.delta);
    return pts.length >= 2 ? extendToReach(pts) : null;
}
// PLAN 1d.10 - THE DYNAMICS TABLE NEEDS -28 dB. `ppp` is seven written steps of STEP_DB = 4 dB under `fff`,
// and cc7ForDelta CLAMPS at a curve's first point - so a curve that stops short would put ppp wherever its
// deepest MEASURED point happens to be. The vibraphone, the cello and the double bass were below the noise
// floor at CC7 24 in 0d (null in balance.json `cc7`), so their measurements stop at CC7 44 = about -27.5 dB.
// Extend those by the instrument's OWN law - delta = k*log10(cc7/127), fitted through its measured points,
// which is how a fader behaves and which every one of the seven obeys (UVI 38.7 with residuals +-0.02 dB;
// Kontakt 59.8-60.1) - down to CC7 24, the lowest the 0d grid used. The added point carries `n: 0` and the
// fitted `law`, so it can never be mistaken for a measurement.
const REACH_DB = -28, LAW_CC7 = 24;
function extendToReach(pts) {
    if (pts[0].delta <= REACH_DB) return pts;
    let num = 0, den = 0;
    for (const p of pts) { const x = Math.log10(p.cc7 / 127); num += x * p.delta; den += x * x; }
    if (!(den > 0)) return pts;
    const k = num / den, delta = Math.round(k * Math.log10(LAW_CC7 / 127) * 100) / 100;
    if (!(delta < pts[0].delta) || delta > REACH_DB) return pts;
    return [{ cc7: LAW_CC7, delta, n: 0, law: Math.round(k * 100) / 100 }, ...pts];
}

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
    let byPitch = {};
    let entry_note = null;
    for (const v of Object.keys(I.byVelocity)) {
        const pp = I.byVelocity[v].perPitch || {};
        for (const p of Object.keys(pp)) {
            if (pp[p].integratedDb == null) continue;
            (byPitch[p] = byPitch[p] || []).push({ v: +v, db: pp[p].integratedDb });
        }
    }
    // THE VIBRAPHONE IS BUILT FROM TWO PASSES, and it has to be, because its register turned out to be
    // PER BAR (RUNNING_LOG §89): every semitone differs, 76 → 77 by 14.7 dB in one step, so no grid coarser
    // than a semitone can describe it and no interpolation across pitch is safe.
    //   the REGISTER  comes from the every-semitone pass (role 'vibfine', 37 pitches at velocity 127)
    //   the SHAPE     comes from the nine-pitch pass (role 'vibreg', 4 velocities), taken RELATIVE to each
    //                 pitch's own 127 and averaged — justified because the velocity response was measured
    //                 uniform across the range, 13.5–14.0 dB at all nine pitches (§86)
    // Relative is also what makes the join sound: the two passes were recorded at different faders
    // (−6.62 and +2.81), and a shape expressed as a delta from its own top is immune to that.
    {
        const fine = CARD.notes.filter(n => n.inst === key && (n.role === 'vibfine' || n.role === 'regfine') && n.found && n.integratedDb != null);
        const reg = CARD.notes.filter(n => n.inst === key && (n.role === 'vibreg' || n.role === 'card') && n.found && n.integratedDb != null);
        if (fine.length >= 5 && reg.length >= 6) {
            const byP = {};
            for (const n of reg) (byP[n.pitch] = byP[n.pitch] || []).push(n);
            const deltas = {};
            for (const p of Object.keys(byP)) {
                const top = (byP[p].find(n => n.vel === 127) || {}).integratedDb;
                if (top == null) continue;
                for (const n of byP[p]) (deltas[n.vel] = deltas[n.vel] || []).push(n.integratedDb - top);
            }
            // THE SHAPE IS INTERPOLATED BY REGISTER, not averaged (RUNNING_LOG §90). Averaging is right where
            // the velocity response is uniform — the vibraphone measured 13.5–14.0 dB at all nine pitches, the
            // double bass 17.4–18.1 — but the english horn spans 16.7 dB low and 22.8 in its middle, and an
            // average would be 3 dB wrong at both ends. So each fine pitch takes the shape of the measured
            // pitches either side of it, blended by how far between them it sits.
            const shapeByPitch = {};
            for (const p of Object.keys(byP)) {
                const top = (byP[p].find(n => n.vel === 127) || {}).integratedDb;
                if (top == null) continue;
                const sh = {};
                for (const n of byP[p]) sh[n.vel] = n.integratedDb - top;
                shapeByPitch[+p] = sh;
            }
            const shapePitches = Object.keys(shapeByPitch).map(Number).sort((x, y) => x - y);
            const vels = [...new Set(reg.map(n => n.vel))].sort((x, y) => x - y);
            const shapeAt = (pitch, v) => {
                if (!shapePitches.length) return 0;
                if (pitch <= shapePitches[0]) return shapeByPitch[shapePitches[0]][v] ?? 0;
                const last = shapePitches[shapePitches.length - 1];
                if (pitch >= last) return shapeByPitch[last][v] ?? 0;
                for (let i = 1; i < shapePitches.length; i++) {
                    if (pitch <= shapePitches[i]) {
                        const a2 = shapePitches[i - 1], b2 = shapePitches[i];
                        const w = (pitch - a2) / (b2 - a2);
                        const da = shapeByPitch[a2][v], db2 = shapeByPitch[b2][v];
                        if (da == null || db2 == null) return da ?? db2 ?? 0;
                        return da + (db2 - da) * w;
                    }
                }
                return 0;
            };
            byPitch = {};
            for (const n of fine) {
                byPitch[n.pitch] = vels.map(v => ({ v, db: Math.round((n.integratedDb + shapeAt(n.pitch, v)) * 100) / 100 }))
                    .sort((x, y) => x.v - y.v);
            }
            entry_note = 'the register from ' + fine.length + ' measured pitches at velocity 127 (the grid the piece '
                + 'actually plays); the velocity shape from ' + Object.keys(byP).length + ' pitches, taken relative to '
                + 'each pitch\u2019s own 127 and INTERPOLATED BY REGISTER. Relative is what lets the two passes join: '
                + 'they were recorded at different times and, for the vibraphone, different faders.';
        }
    }
    const pitches = Object.keys(byPitch).map(Number).sort((a, b) => a - b)
        .filter(p => byPitch[p].length >= 2);
    if (!pitches.length) { out.notRemapped[key] = 'fewer than two velocity points at any pitch'; continue; }

    const at127 = pitches.map(p => (byPitch[p].find(q => q.v === 127) || {}).db).filter(d => d != null);
    const byCc7 = REGISTER_BY_CC7.has(key);
    // referenced to the QUIETEST bar when CC7 carries the register, so every other bar sits ABOVE the
    // target and the trim has something to take away; to the mean otherwise
    const ref = byCc7 ? Math.min.apply(null, at127) : at127.reduce((s, d) => s + d, 0) / at127.length;
    const offset = TOP - ref;                                          // what normalisation shifts it by

    const entry = { label: I.label, port: I.port, trimDb: (TRIMS.instruments.find(r => r.inst === key) || {}).proposedTrimDb,
        referenceDb: Math.round(ref * 100) / 100, offsetAppliedDb: Math.round(offset * 100) / 100,
        measuredSpanDb: null, pitches: [] };

    let lo127 = Infinity, hi127 = -Infinity, clampLow = 0, clampHigh = 0;
    // when CC7 carries the register, ONE table serves every pitch: it is built from the reference bar, so
    // a written height means one velocity for the whole instrument and the register never touches velocity
    let sharedTable = null;
    if (byCc7) {
        const refPitch = pitches.find(p => Math.abs((byPitch[p].find(q => q.v === 127) || {}).db - ref) < 1e-6);
        const rc = monotone(byPitch[refPitch].sort((a, b) => a.v - b.v)
            .map(q => ({ v: q.v, db: Math.round((q.db + offset) * 100) / 100 })));
        sharedTable = [];
        for (let a = LO; a <= HI; a++) sharedTable.push(Math.max(1, Math.min(127, velocityAt(rc, targetDb[a - LO]).vel)));
        entry.referencePitch = refPitch;
        entry.registerBy = 'cc7';
    }
    for (const p of pitches) {
        const raw = byPitch[p].sort((a, b) => a.v - b.v);
        const norm = raw.map(q => ({ v: q.v, db: Math.round((q.db + offset) * 100) / 100 }));
        const mono = monotone(norm);
        let table = [];
        let cl = 0, ch = 0;
        if (sharedTable) { table = sharedTable.slice(); }
        else for (let a = LO; a <= HI; a++) {
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
    if (entry_note) entry.builtFrom = entry_note;
    entry.measuredSpanDb = Math.round(Math.max(...entry.pitches.map(p => p.spanDb)) * 100) / 100;
    entry.registerSpreadAtFffDb = isFinite(hi127 - lo127) ? Math.round((hi127 - lo127) * 100) / 100 : null;
    entry.clampedLow = clampLow; entry.clampedHigh = clampHigh;
    // EVERY pitched instrument carries its measured fader law, not only the one whose REGISTER rides on it (2026-09-19, RUNNING_LOG
    // §128-§130). D13: "velocity is the dynamic; CC7 SHAPES A HELD NOTE" - and the app shapes it through this curve: heldCc7 ->
    // cc7ForHeight computes (target at the drawn height - the level the struck velocity makes) and asks cc7Curve for the CC7 that
    // closes it. WITH NO CURVE IT ANSWERS 127: this builder wrote one for the vibraphone alone (inside `if (byCc7)`), so on the other
    // six a drawn note's height moved nothing - every drawn crescendo in the piece played flat at the velocity of its top, and 1d.7's
    // waves sounded on two seats of eight. 0d had measured all seven, on the curve channels (bank/balance.json `cc7`).
    entry.cc7Curve = cc7CurveFor(key);
    if (!entry.cc7Curve) console.error('  NO CC7 CURVE for ' + key + ' - a drawn note\'s height will not move it' + (byCc7 ? ', and the register will not be corrected' : ''));
    else entry.cc7Note = (byCc7 ? 'the register is closed by CC7, measured by 0d and relative, so it survived every trim. ' : 'the fader law that SHAPES A HELD NOTE (D13), measured by 0d on the curve channel and relative to CC7 127, so it survived every trim. ')
            + 'The app already does this: heldCc7 -> cc7ForHeight computes (target - achieved) per note and asks '
            + 'this curve for the CC7 that closes it, then multiplies any cc7Fade on top.';
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
