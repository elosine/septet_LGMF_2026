#!/usr/bin/env node
// tools/vib_marks_check.js — THE VIBRAPHONE'S MARKS, READ (LGMF PLAN 2g.2; RUNNING_LOG §463 the goldens · §468 the build). Exit 1 on a failure.
//   node tools/vib_marks_check.js [--score <file>] [--print <group> <t0> <t1>]
// notation/lib/vib_marks.js on the vibraphone's 156 sequence bows of Draft 01 (scores/piece-Recombination-Draft01-done.json, read-only),
// under rules.json vibMarks: the seats · the carry · rule 1's two tiers · the turn · the fades · the bare flat bows · no name without a
// hairpin · every hairpin inside its bow · a monotone run named at its ends · the R01c stretch §463 rendered, pinned.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const VM = require(path.join(ROOT, 'notation', 'lib', 'vib_marks.js'));
const R = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadRules(ROOT);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const SCORE = arg('score', path.join(ROOT, 'scores', 'piece-Recombination-Draft01-done.json'));
const S = JSON.parse(fs.readFileSync(SCORE, 'utf8'));
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'velocity_remap.json'), 'utf8'));
const LANE = 5;
const r = VM.read(S.objects, LANE, { bank, instKey: 'bowed_vibraphone', rules: R.vibMarks });
const B = r.bows, T = b => VM.text(b);
let failures = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (cond) console.log('   ok  ' + msg); else { failures++; console.log('  FAIL  ' + msg); } return cond; };
const seqOf = name => ((S.databases || {}).sequences || []).find(q => q.name === name) || {};
const R01 = seqOf('LGMF-R01c').group, S03 = seqOf('lgmf-s03-seqb').group;
const at = (g, t, midi) => B.find(b => b.group === g && Math.abs(b.t0 - t) < 0.02 && (midi == null || b.midi === midi));
const nextIn = b => B.filter(x => x.chain === b.chain && x.t0 > b.t0).sort((x, y) => x.t0 - y.t0)[0];
const L = r.ladder;

if (process.argv.includes('--print')) {
  const i = process.argv.indexOf('--print'), g = process.argv[i + 1], a = +process.argv[i + 2], z = +process.argv[i + 3];
  for (const b of B.filter(b => b.group === g && b.t0 >= a && b.t0 <= z))
    console.log(b.chain + ' ' + b.voice.padEnd(5) + ' ' + b.t0.toFixed(2).padStart(7) + ' … ' + b.t1.toFixed(2).padStart(7) + '  m' + b.midi + (b.restart ? ' R ' : '   ') + T(b).padEnd(18) + ' (' + b.startSteps.toFixed(2) + ' → ' + b.endSteps.toFixed(2) + ')');
  process.exit(0);
}

console.log('THE READING — ' + path.basename(SCORE) + ', lane ' + LANE + ' — the ladder ' + L.join('/'));
// (1) the bows and the seats
ok(B.length === 156 && !r.unplaced.length, '156 bows, every bow on a seat (§463) — ' + B.length + ' bows, chains ' + B.filter(b => b.chain === 0).length + ' · ' + B.filter(b => b.chain === 1).length + ', ' + r.unplaced.length + ' unplaced');
{
  // each seat's curve is continuous (§463: the step at a join ≤ 0.24): a chain's abutting bows of one sequence meet at one level
  let worst = 0, where = '';
  const objById = new Map(S.objects.map(o => [o.id, o]));
  for (const c of [0, 1]) {
    const ch = B.filter(b => b.chain === c).sort((x, y) => x.t0 - y.t0);
    for (let i = 1; i < ch.length; i++) {
      const p = ch[i - 1], b = ch[i];
      if (p.group !== b.group || b.t0 - p.t1 >= R.vibMarks.restS) continue;
      const d = Math.abs(VM.stepsAt(objById.get(b.id), objById.get(b.id).startSeconds, L) - VM.stepsAt(objById.get(p.id), objById.get(p.id).endSeconds, L));
      if (d > worst) { worst = d; where = p.t1.toFixed(2) + ' s'; }
    }
  }
  ok(worst <= 0.25, 'each seat\'s level is continuous at its joins (§463: ≤ 0.24; the seats that change bow TOGETHER told apart by the level) — worst ' + worst.toFixed(3) + ' step at ' + where);
}
ok(!r.warnings.length, 'no name against its hairpin\'s direction (the drift warning) — ' + r.warnings.length + (r.warnings.length ? ': ' + r.warnings.slice(0, 3).join(' · ') : ''));

// (2) the goldens of §463
{
  const j1 = at(R01, 42.65, 67), j2 = j1 && nextIn(j1);
  ok(j1 && T(j1) === 'mp > p' && j2 && j2.startName === 'p' && VM.stepsAt(S.objects.find(o => o.id === j2.id), j2.t0, L) < 1.5,
    'THE CARRY at the join 42.65 → 48.89 s: "' + (j1 && T(j1)) + ' | ' + (j2 && T(j2)) + '" — the second bow starts on the carried p although its level ' + (j2 ? j2.startSteps.toFixed(2) : '?') + ' rounds to pp (§463 wrinkle 2)');
  const b33 = at(R01, 33.16);
  ok(b33 && T(b33) === 'pp < p', 'rule 1\'s second tier: the 33.16 s bow rises ' + (b33 ? (b33.endSteps - b33.startSteps).toFixed(2) : '?') + ' step onto a new name — "' + (b33 && T(b33)) + '"');
  const b56 = at(R01, 56.12, 84);
  ok(b56 && T(b56) === 'p > pp < p', 'the turn inside a bow is named — 56.12 s "' + (b56 && T(b56)) + '"');
  const firsts = [0, 1].map(c => B.filter(b => b.group === R01 && b.chain === c)[0]);
  ok(firsts.every(b => b && T(b) === '○ < pp' && b.restart), 'the fade from niente, timed: both chains\' first bows open "○ < pp" — ' +
    firsts.map(b => b.t0.toFixed(2) + ' s "' + T(b) + '" pp at ' + b.marks.find(m => m.name === 'pp').t.toFixed(2) + ' s (the bow\'s end — the fade runs 2 … 8 s)').join(' · '));
  const lasts = [0, 1].map(c => B.filter(b => b.group === R01 && b.chain === c).slice(-1)[0]);
  ok(lasts.every(b => b && / > ppp$/.test(T(b))), 'the fade-out to the level reached: R01c\'s last bows end "> ppp" (its save falls to ppp) — ' + lasts.map(b => b.t0.toFixed(2) + ' s "' + T(b) + '"').join(' · '));
  // the R01c stretch of §463's rendering, seat 1 (the chain of the 33.16 s bow), 33 … 95 s — pinned under the rules. §463's reading was the
  // --his probe before rules 1 · 2 · 7 and in the probe's level mapping; where the rules change it: the carry (48.89 starts on p) · rule 1's
  // second tier (48.89's first dip p > pp, 0.34 step) · writtenAt's mapping (48.89 and 79.00 end on p, the probe's on mp)
  const seat = at(R01, 33.16).chain;
  const got = B.filter(b => b.group === R01 && b.chain === seat && b.t0 >= 33 && b.t0 <= 95).map(b => T(b) || '·').join(' | ');
  const WANT = 'pp < p | p < mp | mp > p | p > pp < mp > p | p > pp < p | p < mp > p | p > pp | pp < mp | mp > p | p > pp | · | ·';
  ok(got === WANT, 'the R01c stretch 33 … 95 s, seat ' + seat + ' (§463 rendered under the rules): ' + got + (got === WANT ? '' : '  — want ' + WANT));
}

// (3) the rules over all 156
{
  const bad = [], inside = [], order = [], barePlusName = [];
  for (const b of B) {
    const pins = b.marks.filter(m => m.kind === 'hairpin');
    for (const m of pins) if (!(m.t < m.tEnd && m.t >= b.t0 - 1e-6 && m.tEnd <= b.t1 + 1e-6)) bad.push(b.id + '@' + m.t);
    // a name (not the start's) only at the end of the hairpin just before it
    b.marks.forEach((m, i) => { if (m.kind !== 'hairpin' && !m.start) { const p = b.marks[i - 1]; if (!(p && p.kind === 'hairpin' && Math.abs(p.tEnd - m.t) < 1e-6)) order.push(b.id + '@' + m.t); } });
    // no mark strictly inside a hairpin's span (a monotone run names only its two ends)
    for (const m of pins) for (const x of b.marks) if (x !== m && x.kind !== 'hairpin' && x.t > m.t + 1e-6 && x.t < m.tEnd - 1e-6) inside.push(b.id + '@' + x.t);
    if (!b.restart && !pins.length && b.marks.length) barePlusName.push(b.id);
  }
  ok(!bad.length, 'every hairpin runs forward and lies inside its bow (' + B.reduce((a, b) => a + b.marks.filter(m => m.kind === 'hairpin').length, 0) + ' hairpins)' + (bad.length ? ' — ' + bad.slice(0, 5).join(' ') : ''));
  ok(!order.length, 'no name without a hairpin: every name after a bow\'s start closes the hairpin before it' + (order.length ? ' — ' + order.slice(0, 5).join(' ') : ''));
  ok(!barePlusName.length, 'a bow that does not move and does not restart draws nothing (repeatName false) — ' + B.filter(b => !b.marks.length).length + ' bare bows' + (barePlusName.length ? ' — named: ' + barePlusName.slice(0, 5).join(' ') : ''));
  ok(!inside.length, 'a monotone run names only its two ends — no mark inside a hairpin\'s span' + (inside.length ? ' — ' + inside.slice(0, 5).join(' ') : ''));
  const long = B.filter(b => b.group === S03).flatMap(b => b.marks.filter(m => m.kind === 'hairpin' && Math.abs(m.to - m.from) >= 2));
  ok(long.length >= 5, 's03-seqb\'s sweeps: ' + long.length + ' hairpins of two steps or more, each named only at its ends (' + long.slice(0, 4).map(m => m.from.toFixed(1) + '→' + m.to.toFixed(1)).join(' · ') + ' …)');
  const restarts = B.filter(b => b.restart);
  ok(restarts.every(b => b.marks.length && b.marks[0].start), 'every restart writes its start mark (a name, or ○ at silence) — ' + restarts.length + ' restarts');
}

// (4) the voices
{
  let both = 0, wrong = 0;
  for (const b of B) {
    const p = B.find(x => x.chain !== b.chain && x.group === b.group && x.t0 <= b.t0 + 1e-6 && x.t1 > b.t0 + 1e-6);
    if (!p) continue;
    both++;
    if ((b.voice === 'upper') !== (b.midi > p.midi || (b.midi === p.midi && b.chain === 0))) wrong++;
  }
  ok(!wrong, 'the voice by register at each bow\'s start against the partner then sounding (' + both + ' bows with a partner)' + (wrong ? ' — ' + wrong + ' wrong' : ''));
}

// the totals, for the record
const starts = B.filter(b => b.marks.some(m => m.start)).length, ends = B.reduce((a, b) => a + b.marks.filter(m => m.kind !== 'hairpin' && !m.start).length, 0);
console.log('   --  ' + B.filter(b => b.marks.some(m => m.kind === 'hairpin')).length + ' bows move · ' + B.filter(b => b.marks.filter(m => m.kind === 'hairpin').length > 1).length +
  ' turn inside · ' + B.filter(b => !b.marks.length).length + ' bare · ' + starts + ' start names or circles (§463 rule 7: ≈ 90 where one a bow would be 156) · ' + ends + ' names reached');
console.log('');
console.log(failures ? 'VIB MARKS RED: ' + failures + ' of ' + checks + ' checks failed' : 'VIB MARKS GREEN: ' + checks + ' checks');
process.exit(failures ? 1 : 0);
