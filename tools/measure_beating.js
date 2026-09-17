#!/usr/bin/env node
// measure_beating.js — the beat rate and the hold of a rendered dyad, read off the FILE (PLAN 2h.7.2, 2026-09-17).
// The Bloom practice videos label each held dyad with the chart's rate; no label goes on a sound that does not match it.
//
//   node tools/measure_beating.js --wav notation/audio/raw/demo-bloom-heldmax-float.wav --from 10 --to 42 --f0 880 [--json]
//   node tools/measure_beating.js --slots midi/demo-bloom-heldmax/slots.json --wav <the render>     (every slot, with its verdict)
//
// Three readings, each independent of the others:
//   HOLD      — the level (RMS dBFS) in each second of the slot; the drop from the loudest second to the last is reported
//   SPECTRUM  — the two strongest peaks within f0 ± 60 Hz of a Hann-windowed FFT over the held part (2^20 samples ≈ 21.8 s, 0.046 Hz
//               a bin, parabolic interpolation); the rate = their distance
//   ENVELOPE  — the RMS envelope at 200 Hz, its own FFT, the strongest component in 1–40 Hz: the beating as heard, as a check on the spectrum
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FF = (() => { try { return execFileSync('where', ['ffmpeg'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim(); } catch (e) { return 'ffmpeg'; } })();
const SR = 48000;

function readMono(wav, from, to) {
  const r = spawnSync(FF, ['-v', 'error', '-ss', String(from), '-to', String(to), '-i', path.resolve(ROOT, wav), '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr.toString());
  const b = r.stdout; return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
}
function fftMag(x) {   // in-place radix FFT of a power-of-two real signal → magnitudes of the first half
  const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
  const m = new Float64Array(n / 2); for (let i = 0; i < n / 2; i++) m[i] = Math.hypot(re[i], im[i]); return m;
}
const interp = (m, i) => { const a = m[i - 1], b = m[i], c = m[i + 1]; const d = (a - 2 * b + c); return d ? i + 0.5 * (a - c) / d : i; };

// --n 18 --skip 0: a short window (2^18 = 5.5 s, 0.18 Hz a bin) — the music's own rate around an instant, where it glides
const LOG2N = +arg('n', 20), SKIP = +arg('skip', 2);
function measure(wav, from, to, f0) {
  const x = readMono(wav, from, to);
  const hold = [];
  for (let s = 0; s + SR <= x.length; s += SR) { let e = 0; for (let i = s; i < s + SR; i++) e += x[i] * x[i]; hold.push(+(10 * Math.log10(e / SR + 1e-20)).toFixed(1)); }
  // the held part: skip the attack (2 s), take 2^20 samples
  const N = 1 << LOG2N, start = Math.round(SKIP * SR);
  if (x.length < start + N) throw new Error('the span ' + from + '–' + to + ' is shorter than ' + SKIP + ' s + ' + (N / SR).toFixed(1) + ' s');
  const seg = new Float64Array(N);
  for (let i = 0; i < N; i++) seg[i] = x[start + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
  const mag = fftMag(seg), binHz = SR / N;
  const lo = Math.max(2, Math.floor((f0 - 60) / binHz)), hi = Math.ceil((f0 + 60) / binHz);
  const peaks = [];
  for (let i = lo; i <= hi; i++) if (mag[i] > mag[i - 1] && mag[i] >= mag[i + 1]) peaks.push([i, mag[i]]);
  peaks.sort((a, b) => b[1] - a[1]);
  const p1 = peaks[0], p2 = peaks.find(p => Math.abs(p[0] - p1[0]) * binHz > 1.0);
  const f1 = interp(mag, p1[0]) * binHz, f2 = p2 ? interp(mag, p2[0]) * binHz : null;
  const spectrum = { f1: +f1.toFixed(2), f2: f2 && +f2.toFixed(2), rate: f2 && +Math.abs(f1 - f2).toFixed(2), balanceDb: p2 && +(20 * Math.log10(p2[1] / p1[1])).toFixed(1) };
  // the same two-peak reading at the 2nd and 3rd harmonics (a part with a weak fundamental can still beat audibly higher up)
  const harmonics = [2, 3].map(h => {
    const hl = Math.max(2, Math.floor((h * f0 - 60 * h) / binHz)), hh = Math.ceil((h * f0 + 60 * h) / binHz), pk = [];
    for (let i = hl; i <= hh; i++) if (mag[i] > mag[i - 1] && mag[i] >= mag[i + 1]) pk.push([i, mag[i]]);
    pk.sort((x, y) => y[1] - x[1]);
    const q1 = pk[0], q2 = pk.find(p => Math.abs(p[0] - q1[0]) * binHz > h * 1.0);
    return { h, f1: +(interp(mag, q1[0]) * binHz).toFixed(2), f2: q2 && +(interp(mag, q2[0]) * binHz).toFixed(2),
      balanceDb: q2 && +(20 * Math.log10(q2[1] / q1[1])).toFixed(1), levelDb: +(20 * Math.log10(q1[1] / p1[1])).toFixed(1) };
  });
  // the envelope: RMS in 5 ms hops (200 Hz), mean removed, Hann, FFT
  const hop = SR / 200, M = Math.floor(N / hop), env = new Float64Array(M);
  for (let k = 0; k < M; k++) { let e = 0; for (let i = 0; i < hop; i++) { const v = x[start + k * hop + i]; e += v * v; } env[k] = Math.sqrt(e / hop); }
  const mean = env.reduce((a, b) => a + b, 0) / M;
  const EN = 1 << 15, e2 = new Float64Array(EN);
  for (let k = 0; k < M; k++) e2[k] = (env[k] - mean) * (0.5 - 0.5 * Math.cos(2 * Math.PI * k / (M - 1)));
  const em = fftMag(e2), ebin = 200 / EN;
  let best = -1; for (let i = Math.ceil(1 / ebin); i <= Math.floor(40 / ebin); i++) if (best < 0 || em[i] > em[best]) best = i;
  const epk = []; for (let i = Math.ceil(1 / ebin); i <= Math.floor(40 / ebin); i++) if (em[i] > em[i - 1] && em[i] >= em[i + 1]) epk.push([i, em[i]]);
  epk.sort((a, b) => b[1] - a[1]);
  const envelope = { rate: +(interp(em, best) * ebin).toFixed(2), depth: +(Math.max(...env) / Math.max(1e-9, Math.min(...env.filter(v => v > 0)))).toFixed(1),
    top: epk.slice(0, 3).map(p => (interp(em, p[0]) * ebin).toFixed(2) + ' Hz ' + (20 * Math.log10(p[1] / epk[0][1])).toFixed(1) + ' dB') };
  const loud = Math.max(...hold);
  return { from, to, f0, harmonics, hold, holdDropDb: +(loud - hold[hold.length - 1]).toFixed(1), minAfterAttackDb: +(Math.min(...hold.slice(1)) - loud).toFixed(1), spectrum, envelope };
}

module.exports = { measure, readMono, fftMag };
if (require.main !== module) return;
const wav = arg('wav');
if (!wav) { console.error('usage: measure_beating.js --wav <file> (--from S --to S --f0 Hz | --slots slots.json)'); process.exit(2); }
const results = [];
if (arg('slots')) {
  const S = JSON.parse(fs.readFileSync(path.resolve(ROOT, arg('slots')), 'utf8'));
  for (const s of S.slots) {
    const f0 = (s.parts[0].hz + s.parts[1].hz) / 2;
    const r = measure(wav, s.slot, s.slot + s.hold, f0);
    r.id = s.id; r.take = s.take; r.slot = s.slot;
    const off = (rate, ref) => Math.abs(rate - ref) / ref * 100;
    r.label = s.label + (s.take ? " · take " + s.take : ""); r.chartHz = s.chartHz; r.frozenHz = s.frozenHz;
    r.verdict = { spectrumOffPct: r.spectrum.rate ? +off(r.spectrum.rate, s.chartHz).toFixed(1) : null, envelopeOffPct: +off(r.envelope.rate, s.chartHz).toFixed(1) };
    // the envelope agrees when it sits at 1, 2 or 3 times the spectrum's rate (a part whose fundamental is weak beats audibly on its 2nd harmonic)
    r.verdict.envelopeHarmonic = r.spectrum.rate ? [1, 2, 3].find(h => Math.abs(r.envelope.rate - h * r.spectrum.rate) / (h * r.spectrum.rate) <= 0.05) || null : null;
    r.verdict.rateOk = r.verdict.spectrumOffPct != null && r.verdict.spectrumOffPct <= 5 && r.verdict.envelopeHarmonic != null;
    r.verdict.holdOk = r.minAfterAttackDb > -12;
    results.push(r);
  }
} else results.push(measure(wav, +arg('from'), +arg('to'), +arg('f0')));
if (process.argv.includes('--json')) { console.log(JSON.stringify(results, null, 1)); process.exit(0); }
for (const r of results) {
  console.log((r.label || 'span') + ' · ' + r.from + '–' + r.to + ' s' + (r.chartHz ? ' · the chart ' + r.chartHz + ' Hz · the frozen bends ' + r.frozenHz + ' Hz' : ''));
  console.log('   SPECTRUM  ' + r.spectrum.f1 + ' Hz + ' + r.spectrum.f2 + ' Hz (the weaker ' + r.spectrum.balanceDb + ' dB) → ' + r.spectrum.rate + ' Hz');
  for (const h of r.harmonics) console.log('   HARM ' + h.h + '    ' + h.f1 + ' + ' + h.f2 + ' Hz (the weaker ' + h.balanceDb + ' dB · ' + h.levelDb + ' dB against the fundamental) → '
    + (h.f2 ? (Math.abs(h.f1 - h.f2) / h.h).toFixed(2) : '–') + ' Hz');
  console.log('   ENVELOPE  ' + r.envelope.rate + ' Hz (max/min ' + r.envelope.depth + '×) · strongest: ' + r.envelope.top.join(' · '));
  console.log('   HOLD      per second dBFS: ' + r.hold.join(' ') + ' · lowest after the attack ' + r.minAfterAttackDb + ' dB · last second ' + (-r.holdDropDb) + ' dB');
  if (r.verdict) console.log('   VERDICT   rate ' + (r.verdict.rateOk ? 'OK' : 'OFF') + ' (spectrum ' + r.verdict.spectrumOffPct + ' % from the chart · envelope at ' + (r.verdict.envelopeHarmonic ? r.verdict.envelopeHarmonic + '× the rate' : 'no multiple of the rate') + ') · hold ' + (r.verdict.holdOk ? 'OK' : 'DIES'));
}
