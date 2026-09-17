#!/usr/bin/env node
// tools/trill_ingest.js — TRILLS_TOOL: the speed-indexed timing table from the composer's own trill playing
// (option A of RUNNING_LOG §100, chosen 2026-09-05). Piece #2's ostinato timing model, with one change: an attack is
// indexed by the SPEED the composer was playing at (a local mean over ±3 gaps, mapped 0–1 across the instrument's
// played range, rate-linear), not by its time on a linear ramp — so long, wavy takes are usable as they are.
//
//   node tools/trill_ingest.js [--db bank/trill_timing_db.json] [--mode new|append] score.json [score2.json …]
//   (no files → the three trill_playing_samples files)
//
// Reads capture files (plain waveCurve notes with recVel and the real key-down length), splits bursts at silences over
// BURST_GAP ms, and writes per instrument: rateRange [slowest, fastest] (2nd–98th percentile of the local rates) and the
// samples (one per burst) whose attacks carry curvePosition (= speed level), gapToNextMs, avgVelocity, noteDurationsMs,
// role ('lo' / 'hi': which note of the pair). Pitch-agnostic beyond the role.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const BURST_GAP = 500, WINDOW = 3, MIN_NOTES = 8, P_LO = 0.02, P_HI = 0.98;
const args = process.argv.slice(2);
let dbPath = path.join(ROOT, 'bank', 'trill_timing_db.json'), mode = 'new';
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--db') dbPath = path.resolve(args[++i]);
  else if (args[i] === '--mode') mode = args[++i];
  else files.push(path.resolve(args[i]));
}
if (!files.length) ['trill_playing_samples', 'trill_playing_samples-viola', 'trill_playing_samples-cello']
  .forEach(n => files.push(path.join(ROOT, 'scores', n + '.json')));

const pct = (arr, p) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))))]; };
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const r2 = x => Math.round(x * 100) / 100;

let db;
if (mode === 'append' && fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
else db = { type: 'trill_timing_db', version: 1, created: new Date().toISOString(), updated: null,
  description: "The composer's own trill playing, indexed by speed: curvePosition = local rate mapped 0-1 over the instrument's played range (rate-linear). Pitch-agnostic beyond role lo/hi.",
  indexing: 'speed', burstGapThresholdMs: BURST_GAP, windowGaps: WINDOW, ingestions: [], instruments: {} };

for (const file of files) {
  const s = JSON.parse(fs.readFileSync(file, 'utf8'));
  const notes = s.objects.filter(o => o.type === 'waveCurve' && o.sonifyNote != null).sort((a, b) => a.startSeconds - b.startSeconds);
  const byLayer = {}; notes.forEach(o => (byLayer[o.layer] = byLayer[o.layer] || []).push(o));
  for (const L of Object.keys(byLayer)) {
    const all = byLayer[L], instKey = s.tracks[L].instKey, tech = all[0].technique;
    const bursts = [[all[0]]];
    for (let i = 1; i < all.length; i++) { if (all[i].startSeconds - all[i - 1].startSeconds > BURST_GAP / 1000) bursts.push([]); bursts[bursts.length - 1].push(all[i]); }
    const kept = bursts.filter(b => b.length >= MIN_NOTES);
    // local rate per note (the last note takes the mean of its window of preceding gaps)
    const rec = kept.map(b => {
      const gaps = b.slice(1).map((o, k) => (o.startSeconds - b[k].startSeconds) * 1000);
      const lo = Math.min(...b.map(o => o.sonifyNote));
      return b.map((o, i) => {
        const w = gaps.slice(Math.max(0, i - WINDOW), Math.min(gaps.length, i + WINDOW + 1));
        return { o, gap: i < gaps.length ? gaps[i] : null, rate: 1000 / mean(w), role: o.sonifyNote === lo ? 'lo' : 'hi' };
      });
    });
    const rates = rec.flat().map(r => r.rate);
    const rMin = pct(rates, P_LO), rMax = pct(rates, P_HI);
    const level = r => Math.max(0, Math.min(1, (r - rMin) / (rMax - rMin)));
    const inst = db.instruments[instKey] = db.instruments[instKey] || { technique: tech, rateRange: null, samples: [] };
    inst.technique = tech;
    inst.rateRange = inst.rateRange ? [Math.min(inst.rateRange[0], rMin), Math.max(inst.rateRange[1], rMax)] : [r2(rMin), r2(rMax)];
    const start = inst.samples.length;
    rec.forEach((b, bi) => {
      const attacks = b.map(r => ({ curvePosition: Math.round(level(r.rate) * 10000) / 10000, gapToNextMs: r.gap == null ? null : r2(r.gap),
        avgVelocity: r.o.recVel != null ? r.o.recVel : 100, noteCount: 1, noteDurationsMs: [r2((r.o.endSeconds - r.o.startSeconds) * 1000)],
        role: r.role, localRate: r2(r.rate), t: r.o.startSeconds }));
      const g = attacks.filter(a => a.gapToNextMs != null).map(a => a.gapToNextMs), v = attacks.map(a => a.avgVelocity);
      inst.samples.push({ sampleIndex: start + bi, source: path.basename(file, '.json'), layer: +L, pitches: [...new Set(b.map(r => r.o.sonifyNote))].sort((x, y) => x - y),
        attackCount: attacks.length, totalDurationMs: r2((b[b.length - 1].o.startSeconds - b[0].o.startSeconds) * 1000),
        stats: { gap: { avgMs: r2(mean(g)), minMs: r2(Math.min(...g)), maxMs: r2(Math.max(...g)) }, velocity: { avg: Math.round(mean(v)), min: Math.min(...v), max: Math.max(...v) } },
        attacks });
    });
    db.ingestions.push({ timestamp: new Date().toISOString(), inputFile: path.relative(ROOT, file), instrument: instKey, technique: tech,
      notes: all.length, burstsDetected: bursts.length, samplesAdded: kept.length, sampleIndexRange: [start, start + kept.length - 1] });
    // report
    const fl = rec.flat();
    console.log(`${path.basename(file)} → ${instKey} (${tech}): ${all.length} notes, ${kept.length} bursts kept of ${bursts.length}; rate range ${r2(rMin)} → ${r2(rMax)} per second`);
    console.log('  level | n | gap ms | vel | len ms');
    for (let q = 0; q < 5; q++) { const d = fl.filter(r => r.gap != null && Math.min(4, Math.floor(level(r.rate) * 5)) === q);
      if (d.length) console.log(`  ${(q / 5).toFixed(1)}–${((q + 1) / 5).toFixed(1)} | ${d.length} | ${Math.round(mean(d.map(r => r.gap)))} | ${Math.round(mean(d.map(r => r.o.recVel)))} | ${Math.round(mean(d.map(r => (r.o.endSeconds - r.o.startSeconds) * 1000)))}`); }
  }
}
db.updated = new Date().toISOString();
fs.writeFileSync(dbPath, JSON.stringify(db, null, 1));
console.log('wrote', path.relative(ROOT, dbPath), '— instruments:', Object.keys(db.instruments).join(', '));
