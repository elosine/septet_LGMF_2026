// accel_calc_check.js — the calculator's self-check (PLAN 1h): the drawer's geometric run of U13 reproduced exactly, then every
// shape's contract — the two ends exact, monotone gaps, the length honoured whichever way it is given, both directions, the
// hold, the jitter (seeded), the mirror, the levels. `node tools/accel_calc_check.js` → PASS lines and a verdict.
'use strict';
const AC = require('../score/public/accel_calc.js');
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);

// 1. the drawer's own formula (strike_drawer.js accelSeq, as built 2026-09-05, §91), verbatim
function oldRun(aFirst, aRatio, aFloor) {
  const g1 = Math.max(1, +aFirst || 1), floor = Math.max(1, +aFloor || 45), r0 = Math.max(0.5, Math.min(0.99, +aRatio || 0.85));
  let k = g1 <= floor ? 1 : Math.floor(Math.log(floor / g1) / Math.log(r0)) + 1; k = Math.max(1, k);
  const r = (k > 1 && g1 > floor) ? Math.pow(floor / g1, 1 / (k - 1)) : 1;
  const on = [0]; for (let i = 0; i < k; i++) on.push(on[on.length - 1] + g1 * Math.pow(r, i));
  return { on, k, r };
}
for (const [g1, notes, ms, steep] of [[107.2, 7, 435, 0.841], [241, 12, 1314, null], [542, 17, 3296, null]]) {
  const r = AC.run({ gapStart: g1, gapEnd: 45, length: { ratio: 0.85 }, shape: 'geometric' });
  ok(r.notes === notes && Math.round(r.duration) === ms && (steep == null || near(r.ratio, steep, 5e-4)),
     '§91 reproduced: first ' + g1 + ' → ' + r.notes + ' notes · ' + Math.round(r.duration) + ' ms · steep ' + r.ratio.toFixed(3) + ' (expected ' + notes + ' · ' + ms + ')');
}
let maxd = 0, n = 0, countMismatch = 0;
for (const g1 of [46, 60, 107.2, 150, 241, 400, 542, 1000, 2000]) for (const r0 of [0.5, 0.7, 0.85, 0.9, 0.95, 0.99]) for (const fl of [20, 45, 100]) {
  if (g1 <= fl) continue;
  const o = oldRun(g1, r0, fl), m = AC.run({ gapStart: g1, gapEnd: fl, length: { ratio: r0 }, shape: 'geometric' });
  if (o.on.length !== m.onsets.length) { countMismatch++; continue; }
  o.on.forEach((t, i) => { maxd = Math.max(maxd, Math.abs(t - m.onsets[i])); }); n++;
}
ok(countMismatch === 0 && maxd < 1e-6, 'the current run reproduced on ' + n + ' settings: max onset difference ' + maxd.toExponential(2) + ' ms, count mismatches ' + countMismatch);

// 2. every shape, both directions, every way of giving the length: the ends exact, the gaps monotone, the length honoured
for (const sh of AC.SHAPES) for (const [g1, g2] of [[542, 45], [45, 542]]) for (const L of [{ ratio: 0.85 }, { count: 12 }, { duration: 3300 }]) {
  if (sh.flat && L.ratio != null) continue;   // an even run has no steepness
  const r = AC.run({ gapStart: g1, gapEnd: g2, length: L, shape: sh.key });
  const first = r.gaps[0], last = r.gaps[r.gaps.length - 1];
  const mono = r.gaps.every((g, i) => i === 0 || (g1 > g2 ? g <= r.gaps[i - 1] + 1e-9 : g >= r.gaps[i - 1] - 1e-9));
  const lenOk = L.count != null ? r.notes === 12 : (L.duration != null ? (r.gapCount <= 2 || near(r.duration, 3300, 1e-6)) : true);
  if (sh.flat) {   // even: every gap the same, T ÷ k by duration (the gap box the target), the gap itself by count
    const same = r.gaps.every(g => near(g, r.gaps[0], 1e-9)); const target = L.duration != null ? 3300 / Math.round(3300 / g1) : g1;
    ok(same && near(r.gaps[0], target, 1e-9) && lenOk, sh.key.padEnd(10) + 'gap ' + g1 + ' by ' + Object.keys(L)[0].padEnd(8) + ' → ' + String(r.notes).padStart(3) + ' notes · ' + String(Math.round(r.duration)).padStart(5) + ' ms · every gap ' + r.gaps[0].toFixed(2));
    continue;
  }
  ok(near(first, g1) && near(last, g2) && mono && lenOk && r.fit.iterations < 80,
     sh.key.padEnd(10) + (g1 > g2 ? 'accel' : 'decel') + ' by ' + Object.keys(L)[0].padEnd(8) + ' → ' + String(r.notes).padStart(3) + ' notes · ' + String(Math.round(r.duration)).padStart(5) + ' ms · ends ' + first.toFixed(2) + ' / ' + last.toFixed(2) + ' · monotone ' + mono + ' · fit ' + r.fit.iterations + ' it');
}
// 3. the curve dial at its extremes converges and orders as it should: surge keeps the head slow, bloom moves early
{
  const at = c => AC.run({ gapStart: 542, gapEnd: 45, length: { duration: 3300 }, shape: 'curve', curve: c });
  const mid = r => { const T = r.duration; let i = 0; while (r.onsets[i + 1] <= T / 2) i++; return r.gaps[i]; };
  const b = at(-1), e = at(0), s = at(1);
  ok(b.fit.iterations < 80 && e.fit.iterations < 80 && s.fit.iterations < 80 && mid(b) < mid(e) && mid(e) < mid(s),
     'curve dial: gap at half time bloom ' + mid(b).toFixed(0) + ' < even ' + mid(e).toFixed(0) + ' < surge ' + mid(s).toFixed(0) + ' ms (' + b.notes + ' / ' + e.notes + ' / ' + s.notes + ' notes)');
}
// 4. two-phase: the head flat at the first gap; late rush: the first half of the gaps near the first gap
{
  const r = AC.run({ gapStart: 542, gapEnd: 45, length: { count: 21 }, shape: 'twoPhase', knee: 0.5 });
  const head = r.gaps.slice(0, 10); ok(head.every(g => near(g, 542, 1e-9)), 'two-phase head 0.5: the first ' + head.length + ' gaps all ' + head[0].toFixed(0) + ' ms, then ' + r.gaps.slice(10, 13).map(g => g.toFixed(0)).join(' · ') + ' …');
  const p = AC.run({ gapStart: 542, gapEnd: 45, length: { count: 21 }, shape: 'lateRush', gamma: 3 });
  const g = AC.run({ gapStart: 542, gapEnd: 45, length: { count: 21 }, shape: 'geometric' });
  ok(p.gaps[10] > 2 * g.gaps[10], 'late rush power 3: the middle gap ' + p.gaps[10].toFixed(0) + ' ms against the geometric\'s ' + g.gaps[10].toFixed(0));
}
// 5. the hold, the jitter, the mirror, the levels
{
  const h = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, hold: { gaps: 4 } });
  ok(h.gapCount === 20 && h.holdGaps === 4 && h.gaps.slice(-4).every(g => near(g, 45)), 'hold 4 gaps: ' + h.gapCount + ' gaps, the last four ' + h.gaps.slice(-4).map(g => g.toFixed(0)).join(' · '));
  const h2 = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, hold: { ms: 200 } });
  ok(h2.holdGaps === 4, 'hold 200 ms at 45 → ' + h2.holdGaps + ' gaps');
  const j1 = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, jitter: { pct: 15, seed: 3 } }), j1b = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, jitter: { pct: 15, seed: 3 } }), j2 = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, jitter: { pct: 15, seed: 4 } });
  const plain = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 } });
  const dev = j1.gaps.map((g, i) => Math.abs(Math.log(g / plain.gaps[i]))); const meanDev = dev.reduce((a, b) => a + b, 0) / dev.length;
  ok(j1.gaps.every((g, i) => near(g, j1b.gaps[i])) && !j1.gaps.every((g, i) => near(g, j2.gaps[i])) && meanDev > 0.03 && meanDev < 0.4,
     'jitter 15 %: the same seed repeats, another seed differs, mean |log dev| ' + meanDev.toFixed(3) + ' (σ 0.15 → about 0.12)');
  const jr = AC.run({ gapStart: 542, gapEnd: 45, length: { count: 40 }, jitter: { pct: 0, pctEnd: 30, seed: 5 } });
  const early = jr.gaps.slice(0, 10).map((g, i) => Math.abs(Math.log(g / AC.run({ gapStart: 542, gapEnd: 45, length: { count: 40 } }).gaps[i]))).reduce((a, b) => a + b, 0) / 10;
  ok(early < 0.06, 'jitter ramped 0 → 30 %: the first ten gaps barely move (mean |log dev| ' + early.toFixed(3) + ')');
  const m = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, mirror: true });
  ok(near(m.gaps[0], 45) && near(m.gaps[m.gaps.length - 1], 542) && m.gaps.every((g, i) => near(g, plain.gaps[plain.gaps.length - 1 - i])), 'mirror: the gaps reversed, ' + m.gaps[0].toFixed(0) + ' … ' + m.gaps[m.gaps.length - 1].toFixed(0));
  const v = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, level: { start: 65, end: 127, curve: 0 } });
  const halfT = v.duration / 2; let iH = 0; while (v.onsets[iH + 1] <= halfT) iH++;
  ok(v.levels.length === v.notes && near(v.levels[0], 65) && near(v.levels[v.notes - 1], 127) && v.levels[iH] > 65 && v.levels[iH] < 127 && v.levels.every((l, i) => i === 0 || l >= v.levels[i - 1]),
     'levels 65 → 127: ' + v.levels[0] + ' … ' + v.levels[iH].toFixed(1) + ' at half time … ' + v.levels[v.notes - 1] + ', rising');
  const vs = AC.run({ gapStart: 542, gapEnd: 45, length: { ratio: 0.85 }, level: { start: 65, end: 127, curve: 1 } });
  ok(vs.levels[iH] < v.levels[iH], 'level curve +1 (surge): ' + vs.levels[iH].toFixed(1) + ' at half time, below the even ramp\'s ' + v.levels[iH].toFixed(1));
}
// 6. the raw route for the tools: the tuba compiler's own law reproduced (time domain, exp warp, the −0.4 zero)
{
  const r = AC.run({ gapStart: 542, gapEnd: 45, length: { duration: 3300 }, shape: 'raw', domain: 'time', warp: 'exp', interp: 'log', curve: 0, curveZero: -0.4 });
  ok(r.notes > 26 && near(r.duration, 3300, 1e-6), 'raw time/exp with the tuba zero −0.4: ' + r.notes + ' notes over ' + Math.round(r.duration) + ' ms (the "even" of §125: 35)');
  ok(AC.countForRatio(542, 45, 0.85) === 16 && AC.countForRatio(45, 542, 0.85) === 16 && AC.countForRatio(45, 542, 1 / 0.85) === 16 && AC.countForRatio(100, 100, 0.85) === 1,
     'countForRatio: 16 gaps either way, a ratio above 1 read as its inverse, equal ends → 1');
  console.log(AC.describe(AC.run({ gapStart: 542, gapEnd: 45, length: { duration: 3300 }, shape: 'curve', curve: 0.3, hold: { gaps: 2 } }), { curve: 0.3 }));
}
console.log(fails ? 'FAIL — ' + fails + ' check' + (fails > 1 ? 's' : '') + ' failed' : 'PASS — every check passed');
process.exit(fails ? 1 : 0);
