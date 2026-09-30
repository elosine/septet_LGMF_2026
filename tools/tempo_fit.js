#!/usr/bin/env node
// A COMPATIBLE TEMPO FOR A FIGURE — the first tool of N-4 THE SHOWN BEAT (RUNNING_LOG §563; his LG-141: "measure and see if you can give
// me a close-ish tempo that those notes might fall around … what are some methods of coming up with an overlay tempo?").
// Three methods over one part's onsets in a window, each a candidate grid: (A) PHASE COHERENCE — the period whose beat the onsets cluster on
// (the comb of beat tracking; the phase free); (B) THE GRID FIT — the tuba pages' cluster idea: the subdivision unit whose multiples land
// nearest the onsets (a 16th of some tempo); (C) THE IOI — the mean and the median inter-onset interval as a pulse.
//   node tools/tempo_fit.js --ir piece-lgmf --part 0 --from 295 --to 297.31 [--json out.json]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', arg('ir', 'piece-lgmf') + '.ir.json'), 'utf8'));
const PART = +arg('part', 0), T0 = +arg('from', 0), T1 = +arg('to', 1e9);
const partOf = {}; for (const c of ir.chunks) for (const id of c.events) partOf[id] = c.part;
const nm = p => p.spelled.step + (p.spelled.alter > 0 ? '#' : p.spelled.alter < 0 ? 'b' : '') + p.spelled.octave;
const ev = ir.events.filter(e => partOf[e.id] === PART && e.pitch && e.onset >= T0 && e.onset <= T1).sort((a, b) => a.onset - b.onset);
const on = ev.map(e => e.onset), N = on.length;
if (N < 3) { console.error('fewer than 3 onsets in the window'); process.exit(2); }
const ioi = on.slice(1).map((t, i) => t - on[i]);
const f3 = x => x.toFixed(3), ms = x => Math.round(x * 1000);
console.log('THE FIGURE — part ' + PART + ', ' + f3(T0) + ' … ' + f3(T1) + ' s: ' + N + ' onsets');
ev.forEach((e, i) => console.log('  ' + (i + 1) + '  ' + f3(e.onset) + '  ' + nm(e.pitch).padEnd(4) + (i < N - 1 ? '  → ' + f3(ioi[i]) : '')));
console.log('  IOI mean ' + f3(ioi.reduce((a, b) => a + b) / ioi.length) + ' · median ' + f3([...ioi].sort((a, b) => a - b)[Math.floor(ioi.length / 2)]) + ' · min ' + f3(Math.min(...ioi)) + ' · max ' + f3(Math.max(...ioi)));

// the deviation of each onset from a grid (period T, phase φ): the nearest grid point
const devs = (T, phi) => on.map(t => { const k = Math.round((t - phi) / T); return t - (phi + k * T); });
const rms = d => Math.sqrt(d.reduce((a, x) => a + x * x, 0) / d.length);
const localMax = (xs, ys) => { const out = []; for (let i = 1; i < ys.length - 1; i++) if (ys[i] > ys[i - 1] && ys[i] >= ys[i + 1]) out.push({ x: xs[i], y: ys[i] }); return out; };

// (A) PHASE COHERENCE: R(T) = |Σ e^{2πi t/T}| / N — 1 when every onset sits on one beat of period T; the phase from the sum's angle
const A = [];
for (let T = 0.15; T <= 1.2; T += 0.001) { let re = 0, im = 0; for (const t of on) { re += Math.cos(2 * Math.PI * t / T); im += Math.sin(2 * Math.PI * t / T); } A.push({ T: +T.toFixed(3), R: Math.hypot(re, im) / N, phi: (Math.atan2(im, re) / (2 * Math.PI)) * T }); }
const aPeaks = localMax(A.map(a => a.T), A.map(a => a.R)).map(p => A.find(a => a.T === p.x)).sort((p, q) => q.R - p.R).filter(p => p.T >= 0.2).slice(0, 4);
console.log('\n(A) PHASE COHERENCE — the beat the onsets cluster on (period · bpm · coherence 0…1 · each onset\'s offset from its nearest beat, ms):');
for (const p of aPeaks) { const phi = ((p.phi % p.T) + p.T) % p.T; const d = devs(p.T, phi); console.log('  T ' + f3(p.T) + ' s = ' + Math.round(60 / p.T) + ' bpm · R ' + p.R.toFixed(2) + ' · offsets ' + d.map(ms).join(' ') + ' · rms ' + ms(rms(d)) + ' ms'); p.dev = d; p.phase = phi; }

// (B) THE GRID FIT: the unit u whose multiples (from the first onset) land nearest the onsets; the tempo if u is a 16th (4 u) or an 8th (2 u)
const B = [];
for (let u = 0.06; u <= 0.45; u += 0.0005) { const d = on.map(t => { const k = Math.round((t - on[0]) / u); return t - (on[0] + k * u); }); B.push({ u: +u.toFixed(4), rms: rms(d), d }); }
const bMins = []; for (let i = 1; i < B.length - 1; i++) if (B[i].rms < B[i - 1].rms && B[i].rms <= B[i + 1].rms) bMins.push(B[i]);
const bTop = bMins.filter(b => b.u >= 0.09).sort((p, q) => p.rms - q.rms).slice(0, 6);
const MAXBPM = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'rules.json'), 'utf8')).objects.tick.gridMaxBpm || 110; } catch (e) { return 110; } })();
console.log('\n(B) THE GRID FIT — the subdivision unit whose multiples land nearest the onsets, from the first (unit · rms ms · the slots each onset takes · as a 16th → bpm · as an 8th → bpm · THE SHOWN BEAT: the smallest grouping of the unit under ' + MAXBPM + ' bpm, §569):');
for (const b of bTop) { const slots = on.map(t => Math.round((t - on[0]) / b.u)); let g = 1; while (60 / (g * b.u) > MAXBPM) g++; console.log('  u ' + f3(b.u) + ' s · rms ' + ms(b.rms) + ' ms · slots ' + slots.join(' ') + ' · 16th → ' + Math.round(60 / (4 * b.u)) + ' bpm · 8th → ' + Math.round(60 / (2 * b.u)) + ' bpm · shown beat every ' + g + ' units = ' + f3(g * b.u) + ' s = ' + Math.round(60 / (g * b.u)) + ' bpm'); }

// (C) THE IOI as a pulse
const mean = ioi.reduce((a, b) => a + b) / ioi.length, median = [...ioi].sort((a, b) => a - b)[Math.floor(ioi.length / 2)];
console.log('\n(C) THE IOI AS A PULSE: mean ' + f3(mean) + ' s = ' + Math.round(60 / mean) + ' bpm (offsets ' + devs(mean, on[0]).map(ms).join(' ') + ') · median ' + f3(median) + ' s = ' + Math.round(60 / median) + ' bpm (offsets ' + devs(median, on[0]).map(ms).join(' ') + ')');

const out = arg('json', null);
if (out) fs.writeFileSync(out, JSON.stringify({ part: PART, from: T0, to: T1, onsets: ev.map(e => ({ t: e.onset, pitch: nm(e.pitch), midi: e.pitch.midi })), ioi, A: aPeaks.map(p => ({ T: p.T, bpm: 60 / p.T, R: p.R, phase: p.phase, dev: p.dev })), B: bTop.map(b => ({ u: b.u, rms: b.rms, slots: on.map(t => Math.round((t - on[0]) / b.u)), dev: b.d })), C: { mean, median } }, null, 1));
