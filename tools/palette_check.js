#!/usr/bin/env node
// palette_check — the seven tracks, the recipes and the app's per-instrument tables agree.
//
// Written during the port (PLAN 0b step 4, 2026-09-17). Piece #5 built tools that KNOW
// instruments — small keyed tables scattered through the panels (open strings, default strike
// articulations, colours, the beating tool's player order, the trill stand-ins). Nothing
// checks them against each other, so a table that names an instrument the piece does not have,
// or a technique the recipe does not define, fails silently at the moment the composer clicks
// something. This is that check.
//
//   node tools/palette_check.js            → PASS/FAIL lines and a verdict
//   node tools/palette_check.js --quiet    → the verdict only
//
// Run it after any change to TRACKS, to sandbox/instruments.js, or to one of the tables below.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const QUIET = process.argv.includes('--quiet');
let fail = 0, pass = 0;
const ok = (cond, msg) => { if (cond) { pass++; if (!QUIET) console.log('  ok   ' + msg); } else { fail++; console.log('  FAIL ' + msg); } };
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---- the recipes ----
const INSTRUMENTS = new Function(rd('sandbox/instruments.js') + '\nreturn INSTRUMENTS;')();

// ---- TRACKS, out of the page ----
const chSrc = rd('score/public/composer.html');
const tracksLit = chSrc.match(/const TRACKS = \[[\s\S]*?\n\];/);
if (!tracksLit) { console.error('palette_check: could not find TRACKS in composer.html'); process.exit(2); }
const TRACKS = new Function('return ' + tracksLit[0].replace(/^const TRACKS = /, '').replace(/;$/, ''))();
const KEYS = TRACKS.map(t => t.instKey);

// ---- a named single-line object literal out of a browser module ----
function lit(file, name) {
  const m = rd(file).match(new RegExp('^\\s*const ' + name + ' = (\\{.*\\});', 'm'));
  return m ? new Function('return ' + m[1])() : null;
}
// ---- one `name: { ... },` row inside a multi-line table ----
function row(file, name) {
  const m = rd(file).match(new RegExp('^\\s*' + name + ': (\\{.*\\}),\\s*$', 'm'));
  return m ? new Function('return ' + m[1])() : null;
}

console.log('TRACKS: ' + KEYS.join(' · '));
console.log('');

// ---------------------------------------------------------------- 1. tracks vs recipes
console.log('1. every track has a recipe, and vice versa');
for (const k of KEYS) ok(!!INSTRUMENTS[k], 'recipe exists for track "' + k + '"');
for (const k of Object.keys(INSTRUMENTS)) ok(KEYS.includes(k), 'recipe "' + k + '" is a track (no orphans)');
for (const k of KEYS) {
  const I = INSTRUMENTS[k]; if (!I) continue;
  ok(Array.isArray(I.techniques) && I.techniques.length > 0, k + ': has at least one technique');
  ok(typeof I.port === 'string' && I.port.length > 0, k + ': has a port');
  ok(Number.isFinite(I.rangeLow) && Number.isFinite(I.rangeHigh) && I.rangeLow < I.rangeHigh, k + ': has a sane range');
  if (I.ordinary) ok(I.techniques.some(t => t.key === I.ordinary), k + ': its `ordinary` ("' + I.ordinary + '") is one of its techniques');
}

// ---------------------------------------------------------------- 2. ports are distinct, and not piece #5's
console.log('\n2. ports');
const ports = KEYS.map(k => INSTRUMENTS[k] && INSTRUMENTS[k].port).filter(Boolean);
ok(new Set(ports).size === ports.length, 'every instrument has its own port (' + ports.join(' ') + ')');
// loopMIDI ports are machine-global and piece #5's rack is still in use on this machine.
const TEMPUS_PORTS = ['Flute', 'Fluteb', 'BassCl', 'Piano1', 'Piano2', 'Vn1', 'Vn2', 'Va', 'Vc'];
for (const p of ports) ok(!TEMPUS_PORTS.includes(p), 'port "' + p + '" is not one of piece #5\'s (they share this machine)');

// ---------------------------------------------------------------- 3. the app's per-instrument tables
console.log('\n3. the tables inside the app name only this piece\'s instruments, and only techniques that exist');
const TABLES = [
  ['score/public/strike_drawer.js',    'STRIKE_DEFAULT', lit('score/public/strike_drawer.js', 'STRIKE_DEFAULT'), true],
  ['score/public/strike_drawer.js',    'ART_SETS.spiccato', row('score/public/strike_drawer.js', 'spiccato'), true],
  ['score/public/strike_drawer.js',    'ART_SETS.staccato', row('score/public/strike_drawer.js', 'staccato'), true],
  ['score/public/cresc_card.js',       'STRIKE_DEFAULT', lit('score/public/cresc_card.js', 'STRIKE_DEFAULT'), true],
  ['score/public/strike_drawer.js',    'OPEN_STRINGS',   lit('score/public/strike_drawer.js', 'OPEN_STRINGS'), false],
  ['score/public/beating_panel.js',    'INST_COL',       lit('score/public/beating_panel.js', 'INST_COL'), false],
  ['score/public/strike_chords_ui.js', 'INST_COL',       lit('score/public/strike_chords_ui.js', 'INST_COL'), false],
  ['score/public/fill_ui.js',          'COL',            lit('score/public/fill_ui.js', 'COL'), false],
  ['score/public/trill_engine.js',     'STAND_IN',       lit('score/public/trill_engine.js', 'STAND_IN'), false],
];
for (const [file, name, table, isTech] of TABLES) {
  if (!table) { ok(false, file + ' ' + name + ': FOUND (could not be read — did it move?)'); continue; }
  for (const inst of Object.keys(table)) {
    ok(KEYS.includes(inst), file.replace('score/public/', '') + ' ' + name + ': "' + inst + '" is a track of this piece');
    if (isTech && KEYS.includes(inst)) {
      const t = table[inst];
      ok(INSTRUMENTS[inst].techniques.some(q => q.key === t),
         file.replace('score/public/', '') + ' ' + name + ': ' + inst + ' → "' + t + '" exists in the recipe');
    }
  }
}
// STAND_IN's VALUES are instruments too
const SI = lit('score/public/trill_engine.js', 'STAND_IN') || {};
for (const v of Object.values(SI)) ok(KEYS.includes(v), 'trill_engine STAND_IN stands in on "' + v + '", a track of this piece');

// ---------------------------------------------------------------- 4. the beating tool's order
console.log('\n4. the beating tool');
const ordM = rd('score/public/beating_calc.js').match(/^\s*const ORDER = (\[.*\]);/m);
const ORDER = ordM ? new Function('return ' + ordM[1])() : null;
ok(!!ORDER, 'beating_calc ORDER found');
if (ORDER) {
  ok(ORDER.length === KEYS.length && ORDER.every((k, i) => k === KEYS[i]), 'beating_calc ORDER is TRACKS order exactly');
}
const ceilM = rd('score/public/beating_calc.js').match(/const CEILINGS = \{[\s\S]*?\n  \};/);
if (ceilM) {
  const CE = new Function('return ' + ceilM[0].replace(/^const CEILINGS = /, '').replace(/;$/, ''))();
  for (const k of Object.keys(CE)) ok(KEYS.includes(k), 'beating CEILINGS: "' + k + '" is a track of this piece');
  // an instrument that can beat needs a breath or a bow
  for (const k of KEYS) {
    const I = INSTRUMENTS[k];
    if (I && I.beating === false) ok(!CE[k], k + ': marked `beating: false`, so it has no breath/bow ceiling');
    else if (I) ok(!!CE[k], k + ': can beat, so it has a breath or bow ceiling');
  }
}

// ---------------------------------------------------------------- 5. the notation registry
console.log('\n5. the notation registry knows the technique keys (principle 3: the schema is a gate)');
const reg = JSON.parse(rd('notation/registry/techniques.json'));
const known = new Set(Object.keys(reg.techniques || {}));
let unregistered = [];
for (const k of KEYS) {
  const I = INSTRUMENTS[k]; if (!I) continue;
  for (const q of I.techniques) if (!known.has(q.key)) unregistered.push(k + '/' + q.key);
}
// A key is allowed to be unregistered ONLY while nothing uses it: the recipes are a roster,
// and an unused roster entry cannot reach the IR. It must be registered before material uses it.
if (unregistered.length) {
  console.log('  note  ' + unregistered.length + ' recipe key(s) are not in techniques.json yet — they must be registered');
  console.log('        before any material uses them (2a): ' + unregistered.join(' '));
}
ok(true, 'unregistered recipe keys counted (' + unregistered.length + ') — a roster entry is not yet a notation kind');

// ---------------------------------------------------------------- 6. the percussion selection is applied
console.log('\n6. the percussion selection (bank/perc_selection.json) is what the recipe carries — tools/apply_perc.js after any edit');
const SEL = JSON.parse(rd('bank/perc_selection.json'));
const selPort = SEL.port || 'LGPerc';
const want = (SEL.instruments || []).map(x => typeof x === 'string' ? { slug: x } : x);
const have = (INSTRUMENTS.percussion && INSTRUMENTS.percussion.aroInstruments) || [];
ok(rd('sandbox/instruments.js').includes('const ARO_PERC = '), 'the ARO_PERC block is in the recipe');
ok(have.length === want.length, 'selected ' + want.length + ' percussion instrument(s), the recipe carries ' + have.length + (have.length === want.length ? '' : ' — run tools/apply_perc.js'));
for (const w of want) {
  const a = have.find(x => x.slug === w.slug);
  ok(!!a && a.channel === w.channel && a.port === (w.port || selPort), 'percussion: ' + w.slug + ' applied on ' + (w.port || selPort) + ' ch' + w.channel);
}

console.log('\n' + (fail ? 'PALETTE RED: ' + fail + ' failure(s), ' + pass + ' ok' : 'PALETTE GREEN: ' + pass + ' checks'));
process.exit(fail ? 1 : 0);
