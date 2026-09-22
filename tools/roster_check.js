#!/usr/bin/env node
// roster_check — EVERY VOICE KNOWS ITSELF (LGMF PLAN 1m.4.1, 2026-09-22; RUNNING_LOG §243 · §244).
//
// Every technique entry of sandbox/instruments.js, as it stands AT LOAD (the generated blocks applied — the UVI parts, the ARO
// percussion, the SI2 kinds), carries `kind` (pitched · key · fixed) and `loud` (vel · mw); every `key` entry carries its
// `keys` [{ midi, label }] or the word `pending` (1m.4.2 fills those from his rack). The drawer's name rule is only a FALLBACK:
// an entry this check names is one the drawer would have to guess at.
//
//   node tools/roster_check.js            → a line per instrument, the pending list, PASS/FAIL, a verdict
//   node tools/roster_check.js --quiet    → the verdict only
//
// Joins the palette battery (CLAUDE.md): run it after any change to sandbox/instruments.js, tools/apply_perc.js or the catalog.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const QUIET = process.argv.includes('--quiet');
let fail = 0, pass = 0;
const ok = (cond, msg) => { if (cond) { pass++; if (!QUIET) console.log('  ok   ' + msg); } else { fail++; console.log('  FAIL ' + msg); } };

const INSTRUMENTS = new Function(fs.readFileSync(path.join(ROOT, 'sandbox/instruments.js'), 'utf8') + '\nreturn INSTRUMENTS;')();
const KINDS = ['pitched', 'key', 'fixed'], LOUDS = ['vel', 'mw'];
const missing = [], pending = [], badKeys = [];
let total = 0;
if (!QUIET) console.log('instrument            voices  pitched  key  fixed  |  vel  mw  shaped  |  keyed  pending');
for (const [inst, I] of Object.entries(INSTRUMENTS)) {
  const c = { n: 0, pitched: 0, key: 0, fixed: 0, vel: 0, mw: 0, shape: 0, keyed: 0, pending: 0 };
  for (const q of I.techniques || []) {
    c.n++; total++;
    if (KINDS.includes(q.kind)) c[q.kind]++; else missing.push(inst + '/' + q.key + ' — kind ' + JSON.stringify(q.kind));
    if (LOUDS.includes(q.loud)) c[q.loud]++; else missing.push(inst + '/' + q.key + ' — loud ' + JSON.stringify(q.loud));
    if (q.shape === 'mw') c.shape++;
    else if (q.shape != null) badKeys.push(inst + '/' + q.key + ' — shape ' + JSON.stringify(q.shape) + ' (only "mw" is a shape)');
    if (q.kind === 'key') {
      if (q.keys === 'pending') { c.pending++; pending.push(inst + '/' + q.key); }
      else if (Array.isArray(q.keys) && q.keys.length && q.keys.every(k => k && Number.isInteger(k.midi) && k.midi >= 0 && k.midi <= 127 && typeof k.label === 'string')) c.keyed++;
      else badKeys.push(inst + '/' + q.key + ' — a key voice with no keys (an array of { midi, label }, or "pending")');
    } else if (q.keys != null) badKeys.push(inst + '/' + q.key + ' — keys on a ' + q.kind + ' voice');
  }
  if (!QUIET) console.log(inst.padEnd(20) + String(c.n).padStart(8) + String(c.pitched).padStart(9) + String(c.key).padStart(5) + String(c.fixed).padStart(7) + '  |' + String(c.vel).padStart(5) + String(c.mw).padStart(4) + String(c.shape).padStart(8) + '  |' + String(c.keyed).padStart(7) + String(c.pending).padStart(9));
}
if (!QUIET) console.log('');
ok(!missing.length, 'every voice has a kind and a loudness source (' + total + ' voices)' + (missing.length ? ' — MISSING: ' + missing.join(' · ') : ''));
ok(!badKeys.length, 'every key voice has its keys or is pending; no other voice has keys' + (badKeys.length ? ' — ' + badKeys.join(' · ') : ''));
ok(Object.values(INSTRUMENTS).every(I => (I.techniques || []).some(t => t.key === I.ordinary && t.kind === 'pitched')), 'every instrument\'s ordinary voice is pitched');
if (pending.length) console.log('  note  ' + pending.length + ' by-key voice(s) PENDING — their keys are read from his rack at 1m.4.2: ' + pending.join(' · '));
else console.log('  note  no voice pending — 1m.4.2 is done');
console.log('\n' + (fail ? 'ROSTER RED: ' + fail + ' failure(s), ' + pass + ' ok' : 'ROSTER GREEN: ' + pass + ' checks, ' + total + ' voices, ' + pending.length + ' pending'));
process.exit(fail ? 1 : 0);
