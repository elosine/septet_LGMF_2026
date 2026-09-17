#!/usr/bin/env node
// velocity_remap.js — PLAN 1g item 1, to-do 4 (2026-09-06; the hybrid 2026-09-06 evening, RUNNING_LOG §119): from the sweep
// (bank/velocity_map.json), the velocity — and, where velocity alone cannot land, the CC7 trim — each instrument must be sent
// so that a curve height sounds as loud as it does on the violins.
//
//   The ensemble's one scale is the violins': a curve height h (0 … 1) means velocity 65 + 62·h ON THE VIOLINS, and the
//   loudness the violins make there (the mean of violin 1 and violin 2, mean of their three registers) is the TARGET for
//   everyone, at every anchor velocity from --lo to --hi.
//
//   Two kinds of sampler (the proof of §118 told them apart):
//   • DETERMINISTIC (the flute, the piano — one note is exact): the measured level at each velocity is taken as it is; the
//     velocity chosen is the softest measured one whose level is at or above the target (the layer just above), and CC7
//     trims the rest down — Kontakt's and UVI's CC7 is a plain gain, measured in the first sweep's CC7 role. So the piano's
//     8.5 dB layer steps and its too-loud bottom both land on the target.
//   • ROUND-ROBIN (the strings, the bass clarinet — a note scatters by ±1 … 3.5 dB): the repeats are averaged, the curve made
//     monotone (pool-adjacent-violators) and inverted by interpolation; CC7 stays 127 (a trim cannot beat random scatter),
//     except below the softest measured velocity, where CC7 takes the target down.
//
//   node tools/velocity_remap.js [--in bank/velocity_map.json] [--cc7bank bank/velocity_map_sweep1.json]
//                                [--out bank/velocity_remap.json] [--lo 20] [--hi 127]
//
// Output: per instrument, per measured pitch, two tables indexed by the anchor velocity (lo … hi): the velocity to send and the
// CC7 to send before the note (127 = none); the app interpolates between the nearest measured pitches (velocity_remap.js).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const IN = path.resolve(ROOT, opt('in', 'bank/velocity_map.json')), OUT = path.resolve(ROOT, opt('out', 'bank/velocity_remap.json'));
const CC7IN = path.resolve(ROOT, opt('cc7bank', 'bank/velocity_map_sweep1.json'));
const LO = +opt('lo', 20), HI = +opt('hi', 127);
const ANCHORS = ['violin1', 'violin2'];
const DETERMINISTIC = new Set(['flute', 'piano']);   // §118: sd 0.00 … 0.06 over five repeats
const TRIM_MIN_DB = 0.3;                              // a residual under this is not worth a CC7 event

const V = JSON.parse(fs.readFileSync(IN, 'utf8'));
const key = V.weighting === 'k' ? 'dbK' : 'dbFlat';
let VC = null; try { VC = JSON.parse(fs.readFileSync(CC7IN, 'utf8')); } catch (e) { VC = null; }

// a curve = [{ v, db, n }] sorted by v, found only, repeats at one velocity averaged
function curveOf(rows) {
    const byV = {}; rows.filter(q => q.found && q[key] != null).forEach(q => { (byV[q.vel] = byV[q.vel] || []).push(q[key]); });
    return Object.keys(byV).map(v => ({ v: +v, db: byV[v].reduce((a, b) => a + b, 0) / byV[v].length, n: byV[v].length })).sort((a, b) => a.v - b.v);
}
// pool adjacent violators: db non-decreasing with v
function monotone(c) {
    const blocks = c.map(p => ({ sum: p.db, n: 1, vs: [p.v] }));
    let i = 0;
    while (i < blocks.length - 1) {
        if (blocks[i].sum / blocks[i].n > blocks[i + 1].sum / blocks[i + 1].n) {
            blocks[i] = { sum: blocks[i].sum + blocks[i + 1].sum, n: blocks[i].n + blocks[i + 1].n, vs: blocks[i].vs.concat(blocks[i + 1].vs) };
            blocks.splice(i + 1, 1); i = Math.max(0, i - 1);
        } else i++;
    }
    const out = [];
    blocks.forEach(b => b.vs.forEach(v => out.push({ v, db: b.sum / b.n })));
    return out;
}
const lerp = (a, b, t) => a + (b - a) * t;
function dbAt(c, v) {   // linear in dB between the measured velocities, held flat beyond the ends
    if (v <= c[0].v) return c[0].db; if (v >= c[c.length - 1].v) return c[c.length - 1].db;
    for (let i = 0; i < c.length - 1; i++) if (v >= c[i].v && v <= c[i + 1].v) return lerp(c[i].db, c[i + 1].db, (v - c[i].v) / (c[i + 1].v - c[i].v));
    return c[c.length - 1].db;
}
function velFor(c, target) {   // the lowest velocity that reaches the target on a monotone curve; clamped at the ends
    if (target <= c[0].db) return { v: c[0].v, clamp: target < c[0].db - 0.05 ? -1 : 0, db: c[0].db };
    if (target >= c[c.length - 1].db) return { v: c[c.length - 1].v, clamp: target > c[c.length - 1].db + 0.05 ? 1 : 0, db: c[c.length - 1].db };
    for (let i = 0; i < c.length - 1; i++) {
        if (target >= c[i].db && target <= c[i + 1].db) {
            const span = c[i + 1].db - c[i].db;
            const t = span > 1e-9 ? (target - c[i].db) / span : 0;
            return { v: lerp(c[i].v, c[i + 1].v, t), clamp: 0, db: target };
        }
    }
    return { v: c[c.length - 1].v, clamp: 0, db: c[c.length - 1].db };
}
// deterministic: the softest measured velocity whose level is at or above the target (the layer just above)
function velAbove(raw, target) {
    const above = raw.filter(p => p.db >= target - 0.05);
    if (!above.length) { const top = raw.reduce((b, p) => p.db > b.db ? p : b, raw[0]); return { v: top.v, db: top.db, clamp: 1 }; }
    const best = above.reduce((b, p) => p.db < b.db ? p : b, above[0]);
    return { v: best.v, db: best.db, clamp: 0 };
}
// the CC7 attenuation curve per instrument: [{ cc7, delta }] with delta = level(cc7) − level(127), mean over the registers
function cc7CurveOf(instKey) {
    const src = (V.instruments[instKey] && V.instruments[instKey].cc7 && Object.keys(V.instruments[instKey].cc7).length) ? V : VC;
    const d = src && src.instruments && src.instruments[instKey]; if (!d || !d.cc7) return null;
    const k2 = src.weighting === 'k' ? 'dbK' : 'dbFlat';
    const deltas = {};
    for (const rows of Object.values(d.cc7)) {
        const top = rows.find(q => q.cc7 === 127 && q.found); if (!top) continue;
        rows.forEach(q => { if (q.found) (deltas[q.cc7] = deltas[q.cc7] || []).push(q[k2] - top[k2]); });
    }
    const curve = Object.keys(deltas).map(c => ({ cc7: +c, delta: deltas[c].reduce((a, b) => a + b, 0) / deltas[c].length })).sort((a, b) => a.cc7 - b.cc7);
    return curve.length >= 3 ? curve : null;
}
function cc7ForDelta(curve, wantDelta) {   // the CC7 whose attenuation is wantDelta (≤ 0); interpolated; clamped to the measured span
    if (!curve || wantDelta >= -TRIM_MIN_DB) return 127;
    if (wantDelta <= curve[0].delta) return curve[0].cc7;
    for (let i = 0; i < curve.length - 1; i++) {
        if (wantDelta >= curve[i].delta && wantDelta <= curve[i + 1].delta) {
            const span = curve[i + 1].delta - curve[i].delta;
            return Math.round(lerp(curve[i].cc7, curve[i + 1].cc7, span > 1e-9 ? (wantDelta - curve[i].delta) / span : 0));
        }
    }
    return 127;
}
function deltaOfCc7(curve, cc7) { if (!curve || cc7 >= 127) return 0; if (cc7 <= curve[0].cc7) return curve[0].delta; for (let i = 0; i < curve.length - 1; i++) if (cc7 >= curve[i].cc7 && cc7 <= curve[i + 1].cc7) return lerp(curve[i].delta, curve[i + 1].delta, (cc7 - curve[i].cc7) / (curve[i + 1].cc7 - curve[i].cc7)); return 0; }

// the anchor: the violins' mean curve (repeats and registers averaged, then the two violins)
const anchorRows = [];
for (const k of ANCHORS) { const d = V.instruments[k]; if (!d) throw new Error('no ' + k + ' in the bank'); Object.values(d.vel).forEach(rows => anchorRows.push(...rows)); }
const byV = {}; anchorRows.filter(q => q.found).forEach(q => { (byV[q.vel] = byV[q.vel] || []).push(q[key]); });
const anchor = monotone(Object.keys(byV).map(v => ({ v: +v, db: byV[v].reduce((a, b) => a + b, 0) / byV[v].length })).sort((a, b) => a.v - b.v));
const steps = []; for (let v = LO; v <= HI; v++) steps.push(v);
const targetDb = steps.map(v => dbAt(anchor, v));

const out = { generatedAt: new Date().toISOString(), source: path.relative(ROOT, IN).replace(/\\/g, '/'), cc7Source: VC ? path.relative(ROOT, CC7IN).replace(/\\/g, '/') : null,
    measuredAt: V.measuredAt, weighting: V.weighting, windowS: V.windowS, method: 'deterministic: the layer just above the target + a CC7 trim; round-robin: averaged, monotone, interpolated (RUNNING_LOG §119)',
    anchor: { instruments: ANCHORS, curve: anchor.map(p => ({ v: p.v, db: +p.db.toFixed(2) })) }, scale: { lo: LO, hi: HI, note: 'a curve height h means anchor velocity lo + (hi - lo) * h; the tables are indexed by that anchor velocity' },
    targetDb: targetDb.map(x => +x.toFixed(2)), instruments: {} };
const report = [];
for (const [k, d] of Object.entries(V.instruments)) {
    const det = DETERMINISTIC.has(k), cc7Curve = cc7CurveOf(k);
    const inst = { label: d.label, tech: d.tech, deterministic: det, cc7Curve: cc7Curve ? cc7Curve.map(p => ({ cc7: p.cc7, delta: +p.delta.toFixed(2) })) : null, pitches: [] };
    for (const [pitch, rows] of Object.entries(d.vel)) {
        const raw = curveOf(rows); if (raw.length < 3) continue;
        const c = det ? raw : monotone(raw);
        const table = [], cc7s = [], flags = { low: 0, high: 0, trimmed: 0 };
        for (const target of targetDb) {
            let r = det ? velAbove(raw, target) : velFor(c, target);
            let cc7 = 127;
            const residual = target - r.db;   // ≤ 0 when the chosen velocity is louder than the target
            if (residual < -TRIM_MIN_DB && cc7Curve && (det || r.clamp < 0)) { cc7 = cc7ForDelta(cc7Curve, residual); if (cc7 < 127) flags.trimmed++; }
            if (r.clamp > 0) flags.high++;
            if (r.clamp < 0 && cc7 === 127) flags.low++;
            table.push(+r.v.toFixed(1)); cc7s.push(cc7);
        }
        const pooled = det ? [] : raw.filter((p, i) => Math.abs(p.db - c[i].db) > 0.05).map(p => p.v);
        inst.pitches.push({ pitch: +pitch, measured: raw.map(p => ({ v: p.v, db: +p.db.toFixed(2), n: p.n })), monotone: det ? null : c.map(p => ({ v: p.v, db: +p.db.toFixed(2) })), pooledVelocities: pooled, table, cc7: cc7s, clampedLow: flags.low, clampedHigh: flags.high, trimmed: flags.trimmed });
        // the check at h = 0, ½, 1 of the DEFAULT trill scale (anchor 65 … 127): the level this register makes
        const chk = [65, 96, 127].map(a => { const i = Math.max(0, Math.min(steps.length - 1, a - LO)); const v = table[i], cc7 = cc7s[i]; const lvl = (det ? dbAt(raw, v) : dbAt(c, v)) + deltaOfCc7(cc7Curve, cc7); return { a, v, cc7, db: lvl, target: targetDb[i] }; });
        report.push({ inst: d.label, pitch: +pitch, chk, flags, det });
    }
    inst.pitches.sort((a, b) => a.pitch - b.pitch);
    out.instruments[k] = inst;
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

console.log('anchor (the violins, ' + key + '): ' + anchor.map(p => p.v + ':' + p.db.toFixed(1)).join('  '));
console.log('the default trill scale: anchor 65 → ' + dbAt(anchor, 65).toFixed(1) + ' dB · 96 → ' + dbAt(anchor, 96).toFixed(1) + ' · 127 → ' + dbAt(anchor, 127).toFixed(1));
console.log('\ninstrument       pitch   anchor 65: send v/cc7 -> level (target)   anchor 96: send v/cc7 -> level (target)   anchor 127: send v/cc7 -> level (target)   clamped / trimmed');
let worst = 0;
for (const r of report) {
    const cell = c => { const err = c.db - c.target; if (!(r.flags.high && c.a === 127)) worst = Math.max(worst, Math.abs(err)); return String(c.v.toFixed(0)).padStart(4) + '/' + String(c.cc7).padStart(3) + ' -> ' + c.db.toFixed(1) + ' (' + c.target.toFixed(1) + ')'; };
    console.log(r.inst.padEnd(16) + String(r.pitch).padStart(4) + (r.det ? ' D ' : '   ') + r.chk.map(cell).join('   ') + '   ' + (r.flags.low ? 'low ' + r.flags.low + ' ' : '') + (r.flags.high ? 'high ' + r.flags.high + ' ' : '') + (r.flags.trimmed ? 'cc7-trimmed ' + r.flags.trimmed : '') + (!r.flags.low && !r.flags.high && !r.flags.trimmed ? '-' : ''));
}
console.log('\nworst predicted error at the trill scale checkpoints (unclamped): ' + worst.toFixed(2) + ' dB');
console.log('-> ' + path.relative(ROOT, OUT));
