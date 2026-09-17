#!/usr/bin/env node
// test_written_pitch — this piece's transposing parts land where a player expects.
//
// Written at the port (PLAN 0i, 2026-09-17). It is the SEED of this piece's own notation
// battery: piece #5's test_septet_notation asserts ITS ensemble (a B-flat bass clarinet, a grand
// staff) and cannot be kept; this keeps the one part of it that is about THIS ensemble.
// Method and resolver are #5's exactly (Layout.positionResolver).
//
//   node tools/test_written_pitch.js
// ySs = the staff position in staff-spaces:
// treble lines are E4 = -2, G4 = -1, B4 = 0, D5 = 1, F5 = 2; bass lines G2 = -2, B2 = -1,
// D3 = 0, F3 = 1, A3 = 2. A half-step of ySs is one scale degree (a line-to-space move).
const path = require('path');
const ROOT = 'C:/Users/jwloy/GitHub/septet_LGMF_2026';
const Layout = require(path.join(ROOT, 'notation/lib/layout.js'));
const ens = require(path.join(ROOT, 'notation/registry/ensemble.json'));
const pos = Layout.positionResolver(ens);

const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

const CASES = [
  // part, sounding midi, expected ySs, what it proves
  [0, 64, 0,    'ENGLISH HORN +7: sounding E4 is written B4 — the treble MIDDLE LINE'],
  [0, 67, 1,    'ENGLISH HORN +7: sounding G4 is written D5'],
  [2, 60, -1,   'HORN +7: sounding C4 is written G4 (the manual: "a perfect fifth higher")'],
  [6, 40, 0.5,  'DOUBLE BASS +12: sounding E2 is written E3, a space above the bass middle line'],
  [6, 28, -3,   'DOUBLE BASS +12: its lowest string, sounding E1, is written E2 (bass bottom line G2 = -2, so F2 = -2.5 and E2 = -3)'],
  [1, 50, 0,    'BASSOON (no transposition): sounding D3 on the bass middle line'],
  [3, 71, 0,    'TRUMPET in C (no transposition): sounding B4 on the treble middle line'],
  [5, 50, 0,    'CELLO (no transposition): sounding D3 on the bass middle line'],
];

let fail = 0;
console.log('part  sounding    ySs      expected   verdict');
for (const [part, midi, want, why] of CASES) {
  const r = pos(part, midi);
  const good = Math.abs(r.ySs - want) < 1e-9;
  if (!good) fail++;
  console.log(
    String(part).padEnd(6) + (nm(midi) + ' (' + midi + ')').padEnd(12) +
    String(r.ySs).padEnd(9) + String(want).padEnd(11) + (good ? 'ok' : 'FAIL') + '   ' + why
  );
}
// the control: with the transposition removed, the english horn must land somewhere ELSE
const ens0 = JSON.parse(JSON.stringify(ens));
delete ens0.parts[0].transpose;
const pos0 = Layout.positionResolver(ens0);
const moved = pos0(0, 64).ySs !== pos(0, 64).ySs;
console.log('\ncontrol: with english_horn transpose removed, sounding E4 sits at ySs ' + pos0(0, 64).ySs +
            ' instead of ' + pos(0, 64).ySs + ' — the transposition is REALLY being applied: ' + (moved ? 'yes' : 'NO'));
if (!moved) fail++;
console.log(fail ? '\nWRITTEN-PITCH RED: ' + fail : '\nWRITTEN-PITCH GREEN: ' + CASES.length + ' cases + the control');
process.exit(fail ? 1 : 0);
