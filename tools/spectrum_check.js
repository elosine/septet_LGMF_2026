#!/usr/bin/env node
// spectrum_check — the harmonic series arithmetic (score/public/spectrum.js) against the textbook (PLAN 1c.4, 2026-09-19).
//   node tools/spectrum_check.js
'use strict';
const path = require('path');
const S = require(path.join(__dirname, '..', 'score', 'public', 'spectrum.js'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

// the textbook deviations of the first sixteen partials from the tempered keys (cents, to the nearest whole cent)
const BOOK = { 1: 0, 2: 0, 3: 2, 4: 0, 5: -14, 6: 2, 7: -31, 8: 0, 9: 4, 10: -14, 11: -49, 12: 2, 13: 41, 14: -31, 15: -12, 16: 0 };
const P = S.partialsOf(36);   // C2
console.log('partials of C2: ' + P.length + ' (to key 108)');
for (const p of Object.keys(BOOK)) { const n = P[+p - 1]; ok(n && n.partial === +p && Math.round(n.cents) === BOOK[p], 'partial ' + p + ' → ' + (n ? S.nm(n.midi) + ' ' + S.centsText(n.cents) : '?') + ' (book ' + BOOK[p] + ')'); }
// the keys: partial 3 of C2 = G3 (55), 5 = E4 (64), 7 = A#4 (70), 11 = F#5 (78)
ok(P[2].midi === 55 && P[4].midi === 64 && P[6].midi === 70 && P[10].midi === 78, 'keys: 3 → G3 · 5 → E4 · 7 → A#4 · 11 → F#5');
ok(P[P.length - 1].midi <= 108 && S.partialsOf(36, 108).length === 65, 'C2 has 65 partials to the top key (64 lands on 108 exactly, 65 rounds down to it; 66 is over): ' + P.length);
ok(S.partialsOf(28).length >= 100, 'E1 reaches ~100 partials: ' + S.partialsOf(28).length);
ok(S.isTempered(4.9) && !S.isTempered(5.1) && S.isTempered(-5), 'the tolerance: |c| ≤ 5 is tempered');
ok(S.label(P[6]) === '7 · −31¢' && S.label(P[7]) === '8' && S.label(P[2]) === '3 · +2¢', 'labels: "' + S.label(P[6]) + '" · "' + S.label(P[7]) + '" · "' + S.label(P[2]) + '"');
const st = S.makeStrike(36);
ok(st.id === 'sp:C2:just' && st.spectrum && st.synthetic && st.notes.length === 65 && st.notes[6].cents === P[6].cents && st.notes[6].partial === 7, 'makeStrike: id ' + st.id + ', ' + st.notes.length + ' notes, partial 7 carries ' + st.notes[6].cents + '¢');
ok(st.stats.midi.min === 36 && st.stats.midi.max <= 108 && st.harm.group === 'HARMONIC SERIES', 'the strike shape: stats ' + st.stats.midi.min + '–' + st.stats.midi.max + ', group ' + st.harm.group);
// the transposed column: every distinct pitch class with its cents, named by its lowest partial, on every key of the 88
const C = S.classesOf(P);
ok(C.length >= 33 && C[0].partial === 1 && C[1].partial === 3 && C[2].partial === 5, 'classes of C2: ' + C.length + ' (the even partials fold into their odd roots: 1 · 3 · 5 …)');
ok(!C.some(c => c.partial % 2 === 0), 'no class is named by an even partial');
const T = S.transposedOf(36);
const gs = T.filter(n => n.partial === 3);
ok(gs.length === 7 && gs.map(n => n.midi).join(',') === '31,43,55,67,79,91,103' && gs.every(n => Math.round(n.cents) === 2), 'partial 3 (+2¢) on every G of the 88: ' + gs.map(n => S.nm(n.midi)).join(' '));
ok(T.every(n => n.midi >= 21 && n.midi <= 108) && T.length === C.reduce((a, c) => a + [...Array(88)].filter((_, i) => ((21 + i) % 12) === c.pc).length, 0), 'the transposed column spans the 88 and holds one note per class per key: ' + T.length);
ok(S.parseId('sp:C2:just').sets.join() === 'just' && S.parseId('sp:C2:just+8ve').sets.join() === 'just,8ve' && S.parseId('sp:C2:8ve').sets.join() === '8ve' && !S.parseId('sp:C2:x'), 'ids parse: just · just+8ve · 8ve, and nothing else');
const both = S.makeStrike(36, null, { sets: ['just', '8ve'] });
ok(both.id === 'sp:C2:just+8ve' && both.notes.length === P.length + T.length && both.notes.filter(n => n.set === '8ve').length === T.length, 'makeStrike just + 8ve: ' + both.id + ', ' + both.notes.length + ' notes (' + P.length + ' just + ' + T.length + ' transposed)');
console.log('\n' + (fail ? 'SPECTRUM RED: ' + fail + ' failed' : 'SPECTRUM GREEN: ' + pass + ' checks'));
process.exit(fail ? 1 : 0);
