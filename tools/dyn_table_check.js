#!/usr/bin/env node
// dyn_table_check — THE DYNAMICS TABLE (score/public/dyn_table.js) against its law (PLAN 1d.10, 2026-09-20).
//   node tools/dyn_table_check.js
//
// The law: `fff` = CC7 127, and each written step below it is STEP_DB = 4 dB taken through the instrument's MEASURED
// fader curve (bank/velocity_remap.json `cc7Curve`). So the test is not "is the number this" — it is: read each CC7
// the table gives BACK through the same curve, and the eight written names must land 4 dB apart, on every instrument.
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const T = require(path.join(ROOT, 'score', 'public', 'dyn_table.js'));
const BANK = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'velocity_remap.json'), 'utf8'));
const PITCHED = ['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass'];
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const L = n => T.levelOfName(n);
// the dB a CC7 sounds at on a curve — the table's inverse, interpolated the way cc7ForDelta walks it
const dbAt = (curve, cc) => {
    if (cc <= curve[0].cc7) return curve[0].delta;
    for (let i = 0; i < curve.length - 1; i++) if (cc >= curve[i].cc7 && cc <= curve[i + 1].cc7) {
        const s = curve[i + 1].cc7 - curve[i].cc7;
        return curve[i].delta + (curve[i + 1].delta - curve[i].delta) * (s ? (cc - curve[i].cc7) / s : 0);
    }
    return 0;
};

console.log('THE DYNAMICS TABLE — ' + T.NAMES.join(' ') + ', ' + T.STEP_DB + ' dB a step\n');
console.log('  instrument         ' + T.NAMES.map(n => n.padStart(4)).join('') + '     reach');
for (const k of PITCHED) {
    const row = T.NAMES.map(n => T.cc7(BANK, k, L(n)));
    const c = T.curveOf(BANK, k);
    console.log('  ' + k.padEnd(18) + row.map(v => String(v).padStart(4)).join('') + '   ' + (c ? c[0].delta.toFixed(2) + ' dB' : 'NO CURVE'));
}
console.log('');

// 1 — the CHECK FIRST of 1d.10, frozen so it cannot regress: every curve reaches ppp's -28 dB, or cc7ForDelta CLAMPS
for (const k of PITCHED) {
    const c = T.curveOf(BANK, k);
    ok(c && c[0].delta <= -(T.NAMES.length - 1) * T.STEP_DB, k + ': the measured curve reaches ppp (' + (c ? c[0].delta : '—') + ' dB ≤ ' + -(T.NAMES.length - 1) * T.STEP_DB + ')');
}
// 2 — fff is the full fader, and the table only ever rises
for (const k of PITCHED) {
    const row = T.NAMES.map(n => T.cc7(BANK, k, L(n)));
    ok(row[row.length - 1] === 127, k + ': fff = 127');
    ok(row.every((v, i) => i === 0 || v > row[i - 1]), k + ': monotone, ' + row.join(' → '));
}
// 3 — THE LAW ITSELF: read each CC7 back through the curve and the names must be STEP_DB apart, every instrument alike
for (const k of PITCHED) {
    const c = T.curveOf(BANK, k);
    const errs = T.NAMES.map((n, i) => dbAt(c, T.cc7(BANK, k, L(n))) - (-(T.NAMES.length - 1 - i) * T.STEP_DB));
    const worst = Math.max(...errs.map(Math.abs));
    ok(worst <= 0.4, k + ': every name within 0.4 dB of its written step (worst ' + worst.toFixed(2) + ' dB — CC7 is an integer)');
}
// 4 — HIS OWN GUESS (LG-51): "a curve going from MP to FF should go … say 65 to 111 in CC7, not up to the full 127"
const mpff = [T.cc7(BANK, 'cello', L('mp')), T.cc7(BANK, 'cello', L('ff'))];
ok(mpff[0] === 69 && mpff[1] === 109, 'mp → ff on a Kontakt instrument (cello) = ' + mpff.join(' → ') + ' — his "say 65 to 111"');
ok(T.cc7(BANK, 'bassoon', L('mp')) === 50 && T.cc7(BANK, 'bassoon', L('ff')) === 100, 'mp → ff on a UVI instrument (bassoon) = 50 → 100 — a different CC7, the SAME dB (its fader law is 40·log10, not 60)');
// 5 — fractions: a level between two names sits between their values
for (const k of PITCHED) ok(T.cc7(BANK, k, (L('p') + L('mp')) / 2) > T.cc7(BANK, k, L('p')) && T.cc7(BANK, k, (L('p') + L('mp')) / 2) < T.cc7(BANK, k, L('mp')), k + ': a level between p and mp lands between them');
// 6 — THE POINT OF THE WHOLE STEP: two ranges of EQUAL DEPTH are no longer the same fader range
const a = T.range(BANK, 'cello', L('ppp'), L('mp')), b = T.range(BANK, 'cello', L('pp'), L('mf'));
ok(a.lo !== b.lo && a.hi !== b.hi && a.hi < b.hi && a.lo < b.lo, 'equal depths differ: ppp–mp ' + a.lo + '–' + a.hi + ' vs pp–mf ' + b.lo + '–' + b.hi);
ok(T.range(BANK, 'cello', L('ppp'), L('fff')).lo === T.cc7(BANK, 'cello', L('ppp')) && T.range(BANK, 'cello', L('ppp'), L('fff')).hi === 127, 'the widest range is the whole measured fader: ' + JSON.stringify(T.range(BANK, 'cello', L('ppp'), L('fff'))));
// 7 — EVERY BREAKPOINT lands on its own table value, not only the two ends (the ladder is not linear in CC7)
for (const k of PITCHED) {
    const lo = L('pp'), hi = L('ff'), bad = [];
    for (const n of ['pp', 'p', 'mp', 'mf', 'f', 'ff']) {
        const h = T.height(BANK, k, L(n), lo, hi), r = T.range(BANK, k, lo, hi);
        const got = Math.round(r.lo + (r.hi - r.lo) * h), want = T.cc7(BANK, k, L(n));
        if (Math.abs(got - want) > 1) bad.push(n + ' ' + got + '≠' + want);
    }
    ok(!bad.length, k + ': every breakpoint of a pp–ff shape lands on its table value' + (bad.length ? ' — ' + bad.join(', ') : ''));
}
// 8 — a FLAT shape: lo === hi, h = 1, and it holds at its own written level (it sounds; it simply does not move)
const flat = T.range(BANK, 'horn', L('p'), L('p'));
ok(flat.lo === flat.hi && flat.lo === T.cc7(BANK, 'horn', L('p')) && T.height(BANK, 'horn', L('p'), L('p'), L('p')) === 1, 'a flat shape: ' + JSON.stringify(flat) + ', h = 1');
// 9 — NO BANK: the UVI law, and the caller's status must be able to say so
ok(!T.hasCurve(null, 'cello') && !T.hasCurve(BANK, 'nonesuch') && T.hasCurve(BANK, 'cello'), 'hasCurve tells the status line which it got');
const nb = T.NAMES.map(n => T.cc7(null, null, L(n)));
ok(nb[nb.length - 1] === 127 && nb.every((v, i) => i === 0 || v > nb[i - 1]) && nb[0] === 25, 'no bank → the UVI law, monotone, fff 127, ppp ' + nb[0] + ': ' + nb.join(' '));
// 10 — the edges of the input
ok(T.levelOfName('mf') === 4 / 7 && T.levelOfName('nonesuch') === null, 'levelOfName: mf = 4/7, an unknown name is null');
ok(T.dbOf(1) === 0 && T.dbOf(0) === -28 && T.cc7(BANK, 'cello', 2) === 127 && T.cc7(BANK, 'cello', -1) === T.cc7(BANK, 'cello', 0), 'levels clamp to 0 … 1 (ppp … fff)');

console.log('\n' + (fail ? 'DYN TABLE RED: ' + fail + ' failed' : 'DYN TABLE GREEN: ' + pass + ' checks'));
process.exit(fail ? 1 : 0);
