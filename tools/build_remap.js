#!/usr/bin/env node
// build_remap.js — PLAN 0d.5: the VELOCITY REMAP for this piece, from bank/balance.json (RUNNING_LOG §60).
//
// WHAT IT IS. The trim (0d.4) made every instrument equally loud at ONE velocity. Away from it they drift,
// because each sampler gets louder at its own rate (velocity 64 → 127: the horn gains 8 dB, the vibraphone
// 14). The remap closes that: per instrument and register, the velocity to send so that a written dynamic is
// the same loudness on everyone at EVERY level. The score stays on one scale; each instrument translates on
// the way out.
//
// D13 (2026-09-18): this is #5's mechanism, unchanged — VELOCITY is the dynamic. CC7 is left at 127 here and
// keeps its one job, shaping a held note. That is a departure from #5's own hybrid, which trimmed the layered
// samplers with CC7: here CC7 on the main channel would fight the held-note shaping, and nothing in this rack
// is deterministic enough for a 0.3 dB trim to mean anything (the measured note-to-note scatter is ±1.7 to
// ±6.0 dB — see `scatterSd`). Velocity alone, clamped where it cannot reach, and the clamps counted.
//
// THE REFERENCE SCALE is the ensemble's MEDIAN, not one instrument's. #5 anchored on the violins; doing that
// here would elevate one sampler's quirks (the SI2 curves flatten at the top, the vibraphone's scatter is
// ±6 dB) into the scale every other instrument must follow. At each anchor velocity the target is the median
// of the pitched instruments' own levels there, so the scale is the ensemble's own behaviour and no single
// instrument has to be trusted. The absolute value is arbitrary (the trims already set the level).
//
// PERCUSSION IS NOT REMAPPED. A one-shot's velocity IS its dynamic and it has no sustained reference to match;
// its balance is the fff = fff trim of 0d.4. It is listed under `notRemapped` with that reason.
//
//   node tools/build_remap.js [--in bank/balance.json] [--out bank/velocity_remap.json] [--lo 24] [--hi 127]
//
// The output shape is the one score/public/velocity_remap.js already reads (#5's, unchanged): per instrument,
// `pitches[]` sorted by pitch, each with `table[anchorVel - lo]` = the velocity to send, and `cc7[]` beside it.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };

const IN = path.resolve(ROOT, opt('in', 'bank/balance.json'));
const OUT = path.resolve(ROOT, opt('out', 'bank/velocity_remap.json'));
const LO = +opt('lo', 24), HI = +opt('hi', 127);

const B = JSON.parse(fs.readFileSync(IN, 'utf8'));
const pitched = B.instruments.filter(i => i.kind === 'pitched' && i.velocity && Object.keys(i.velocity).length);
if (!pitched.length) { console.error('no pitched instruments with velocity tables in ' + IN); process.exit(1); }

// ── each instrument's measured curve per pitch, with the instrument's TRIM applied ──────────────────
// the trim is a constant dB on the track, so it belongs in the level the remap reasons about: what the
// ensemble hears is level + trim.
function curvesOf(inst) {
    const out = [];
    for (const [p, tab] of Object.entries(inst.velocity)) {
        const rows = Object.entries(tab)
            .map(([v, db]) => ({ v: +v, db: db == null ? null : +(db + (inst.trimDb || 0)).toFixed(2) }))
            .filter(r => r.db != null)
            .sort((a, b) => a.v - b.v);
        if (rows.length >= 2) out.push({ pitch: +p, measured: rows });
    }
    return out.sort((a, b) => a.pitch - b.pitch);
}

// pool-adjacent-violators: the smallest change that makes the curve non-decreasing in velocity (#5's §119).
// A sampler's measured curve dips where a layer boundary or a round robin fell the wrong way; inverting a
// non-monotone curve is ambiguous, so it is pooled first and the pooling is reported.
function monotone(rows) {
    const v = rows.map(r => r.v), y = rows.map(r => r.db), w = rows.map(() => 1);
    const blocks = y.map((val, i) => ({ sum: val, n: 1, from: i, to: i }));
    let i = 0;
    while (i < blocks.length - 1) {
        const a = blocks[i], b = blocks[i + 1];
        if (a.sum / a.n <= b.sum / b.n) { i++; continue; }
        blocks.splice(i, 2, { sum: a.sum + b.sum, n: a.n + b.n, from: a.from, to: b.to });
        if (i > 0) i--;
    }
    const fit = [];
    for (const bl of blocks) { const mean = bl.sum / bl.n; for (let k = bl.from; k <= bl.to; k++) fit.push({ v: v[k], db: +mean.toFixed(2) }); }
    const pooled = blocks.filter(b => b.n > 1).map(b => v.slice(b.from, b.to + 1)).flat();
    return { fit, pooled };
}

// linear interpolation on a monotone curve
const dbAt = (fit, vel) => {
    if (vel <= fit[0].v) return fit[0].db;
    if (vel >= fit[fit.length - 1].v) return fit[fit.length - 1].db;
    for (let k = 0; k < fit.length - 1; k++) {
        if (vel >= fit[k].v && vel <= fit[k + 1].v) {
            const s = fit[k + 1].v - fit[k].v;
            return fit[k].db + (fit[k + 1].db - fit[k].db) * (s > 0 ? (vel - fit[k].v) / s : 0);
        }
    }
    return fit[fit.length - 1].db;
};
// the inverse: the velocity whose level is closest to `target`, interpolated; clamped to the measured ends
function velFor(fit, target) {
    const lo = fit[0], hi = fit[fit.length - 1];
    if (target <= lo.db) return { vel: lo.v, clamp: -1 };
    if (target >= hi.db) return { vel: hi.v, clamp: 1 };
    for (let k = 0; k < fit.length - 1; k++) {
        const a = fit[k], b = fit[k + 1];
        if (target >= a.db && target <= b.db) {
            const s = b.db - a.db;
            return { vel: a.v + (b.v - a.v) * (s > 0 ? (target - a.db) / s : 0), clamp: 0 };
        }
    }
    return { vel: hi.v, clamp: 1 };
}

// A DEAD register is dropped, not remapped. The double bass's pitch 38 measured −74 to −78 dB at every
// velocity — that is the previous note's tail, not the note: the recipe's range said 28 and the library's
// samples start at 40 (§54, §57). Such a register can never reach the ensemble target, so every anchor
// clamps at its loudest velocity and the table becomes nonsense. The rule: a register whose loudest
// measured level is more than --deadgap dB below the instrument's best register is dropped and named.
const DEAD_GAP = +opt('deadgap', 15);
const dropped = [];
const prepared = pitched.map(i => {
    let curves = curvesOf(i).map(c => Object.assign(c, monotone(c.measured)));
    if (curves.length > 1) {
        const top = c => c.fit[c.fit.length - 1].db;
        const best = Math.max.apply(null, curves.map(top));
        const keep = curves.filter(c => best - top(c) <= DEAD_GAP);
        for (const c of curves) if (!keep.includes(c)) dropped.push({ inst: i.inst, label: i.label, pitch: c.pitch, topDb: top(c), bestDb: best, why: 'dead register: ' + (best - top(c)).toFixed(1) + ' dB below this instrument\'s best, so nothing sounded there' });
        if (keep.length) curves = keep;
    }
    return { inst: i, curves };
}).filter(p => p.curves.length);

// ── the reference scale: at each anchor velocity, the MEDIAN of the instruments' mid-register levels ──
const median = xs => { const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const midCurve = p => p.curves[Math.floor(p.curves.length / 2)].fit;      // the middle register represents the instrument
const target = [];
for (let a = LO; a <= HI; a++) target.push(+median(prepared.map(p => dbAt(midCurve(p), a))).toFixed(2));

// ── the tables ──────────────────────────────────────────────────────────────────────────────────────
const instruments = {};
for (const p of prepared) {
    const rows = p.curves.map(c => {
        const table = [], clamp = { low: 0, high: 0 };
        for (let a = LO; a <= HI; a++) {
            const r = velFor(c.fit, target[a - LO]);
            table.push(Math.max(1, Math.min(127, Math.round(r.vel))));
            if (r.clamp < 0) clamp.low++; else if (r.clamp > 0) clamp.high++;
        }
        return { pitch: c.pitch, measured: c.measured, monotone: c.fit, pooledVelocities: c.pooled,
                 table, cc7: table.map(() => 127), clampedLow: clamp.low, clampedHigh: clamp.high, trimmed: 0 };
    });
    instruments[p.inst.inst] = {
        label: p.inst.label, tech: p.inst.tech || null, trimDb: p.inst.trimDb,
        scatterSd: p.inst.scatterSd, deterministic: false, cc7Curve: false, pitches: rows,
    };
}

const notRemapped = B.instruments.filter(i => i.kind === 'perc')
    .map(i => ({ inst: i.inst, label: i.label, why: 'a one-shot: its velocity IS its dynamic and it has no sustained reference to match; balanced by the fff = fff trim of 0d.4', trimDb: i.trimDb }));

const out = {
    generatedAt: new Date().toISOString(), planItem: '0d.5', piece: 'lgmf',
    source: path.relative(ROOT, IN).replace(/\\/g, '/'), measuredAt: B.measuredAt, wav: B.wav,
    weighting: B.weighting, windowS: B.windowS,
    method: 'velocity only (D13: velocity is the dynamic, CC7 shapes a held note and is left at 127 here). Per instrument and register, the measured level + the track trim, made monotone by pool-adjacent-violators, then inverted against the ensemble target.',
    anchor: { kind: 'ensemble-median', note: 'at each anchor velocity the target is the MEDIAN of the pitched instruments\' mid-register levels — not one instrument\'s, so no sampler\'s quirks become the ensemble\'s scale (#5 anchored on its violins)' },
    scale: { lo: LO, hi: HI, note: 'a curve height h means anchor velocity lo + (hi - lo) * h; the tables are indexed by that anchor velocity' },
    targetDb: target, instruments, notRemapped, droppedRegisters: dropped, deadGapDb: DEAD_GAP,
    _provenance: 'bank/balance.json (' + (B.wav || '?') + '), the trims of 0d.4 folded in; percussion excluded by kind',
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

// ── the report ──────────────────────────────────────────────────────────────────────────────────────
console.log('remap → ' + path.relative(ROOT, OUT) + ' · anchor velocity ' + LO + '…' + HI +
            ' · target ' + target[0].toFixed(1) + ' … ' + target[target.length - 1].toFixed(1) + ' dB (ensemble median)');
console.log('  ' + 'instrument'.padEnd(16) + 'regs'.padStart(5) + 'scatter'.padStart(9) + '   ' +
            ['v' + LO, 'v64', 'v96', 'v' + HI].map(s => s.padStart(6)).join('') + '   clamped lo/hi   pooled');
for (const [k, i] of Object.entries(instruments)) {
    const mid = i.pitches[Math.floor(i.pitches.length / 2)];
    const at = a => mid.table[a - LO];
    const cl = i.pitches.reduce((s, p) => [s[0] + p.clampedLow, s[1] + p.clampedHigh], [0, 0]);
    console.log('  ' + i.label.padEnd(16) + String(i.pitches.length).padStart(5) +
                ('±' + (i.scatterSd == null ? '?' : i.scatterSd.toFixed(2))).padStart(9) + '   ' +
                [at(LO), at(64), at(96), at(HI)].map(v => String(v).padStart(6)).join('') +
                ('   ' + cl[0] + ' / ' + cl[1]).padEnd(16) +
                i.pitches.reduce((s, p) => s + p.pooledVelocities.length, 0));
}
// the COMMON RANGE: the anchor span in which no instrument clamps — inside it the balance is exact, outside
// it the saturated instruments can only sit at their loudest or softest. The honest headline number.
let cLo = LO, cHi = HI;
for (const i of Object.values(instruments)) for (const p of i.pitches) {
    for (let a = LO; a <= HI; a++) { const k = a - LO; if (p.table[k] === p.monotone[0].v && dbAt(p.monotone, p.table[k]) > target[k]) { if (a > cLo) cLo = a; } }
}
{
  const clampedAt = a => Object.values(instruments).some(i => i.pitches.some(p => {
      const r = velFor(p.monotone, target[a - LO]); return r.clamp !== 0; }));
  cLo = LO; while (cLo < HI && clampedAt(cLo)) cLo++;
  cHi = HI; while (cHi > cLo && clampedAt(cHi)) cHi--;
  out.commonRange = { lo: cLo, hi: cHi, note: 'the anchor-velocity span in which NO instrument clamps: inside it every instrument can reach the ensemble target exactly; outside it the saturated ones sit at their loudest or softest' };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('  COMMON RANGE (nobody clamps): anchor velocity ' + cLo + ' … ' + cHi + '  of ' + LO + ' … ' + HI +
              '  — inside it the balance is exact');
}
console.log('  not remapped: ' + notRemapped.length + ' percussion instruments (velocity is their dynamic; balanced by the 0d.4 trim)');
for (const d of dropped) console.log('  DROPPED  ' + d.label + ' pitch ' + d.pitch + ' — ' + d.why);
