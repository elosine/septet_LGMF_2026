#!/usr/bin/env node
// tools/layout_shield.js — THE SHIELD for a layout change (LGMF PLAN 2h, 2026-09-28; the recipe of §449 · §469 made a tool).
//   node tools/layout_shield.js --write <file.json>      lay out EVERY IR — this repo's notation/ir/*.ir.json and piece #4's seventeen
//                                                        tuba IRs (read in place, never staged) — under THIS registry, and write one
//                                                        hash per IR (the layout model's systems, JSON, warnings included)
//   node tools/layout_shield.js --diff <file.json>       the same now, against the file: prints IDENTICAL / MOVED per IR, exit 1 on a
//                                                        move outside --expect (a comma list of IR ids allowed to move)
// A step that moves only the vibraphone's page passes with --expect lgmf-vib-proto; a rule on a shared row names every page it moves.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const TUBAS = path.join(ROOT, '..', 'for_seven_tubas', 'notation', 'ir');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const rd = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js')), Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js'));
const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
const glyphs = rd(path.join(ROOT, 'notation', 'lib', 'glyphs.json')), techniques = rd(path.join(ROOT, 'notation', 'registry', 'techniques.json'));
const ENS = Layout.ensembleFor(rd(path.join(ROOT, 'notation', 'registry', 'ensemble.json')), C.realizations['video-jury']), parts = ENS.parts.map(p => p.part);
const boxes = Fit.boxesFor(C, ENS, parts);

const files = [];
for (const dir of [path.join(ROOT, 'notation', 'ir'), TUBAS]) {
  if (!fs.existsSync(dir)) { console.warn('  (no ' + dir + ')'); continue; }
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.ir.json')).sort()) files.push(path.join(dir, f));
}
const out = {};
for (const f of files) {
  const id = (f.startsWith(TUBAS) ? 'tuba:' : '') + path.basename(f).replace(/\.ir\.json$/, '');
  let ir; try { ir = rd(f); } catch (e) { out[id] = 'unreadable'; continue; }
  try {
    const m = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques, fitBoxes: boxes }, C.engraving.layout));
    out[id] = crypto.createHash('sha1').update(JSON.stringify({ systems: m.systems, warnings: m.warnings })).digest('hex').slice(0, 16);
  } catch (e) { out[id] = 'throws: ' + String(e.message).slice(0, 80); }
}
if (arg('write')) { fs.writeFileSync(arg('write'), JSON.stringify(out, null, 1)); console.log('wrote ' + Object.keys(out).length + ' layout hashes → ' + arg('write')); process.exit(0); }
if (arg('diff')) {
  const before = rd(arg('diff')), expect = new Set((arg('expect', '') || '').split(',').filter(Boolean));
  let moved = 0, bad = 0;
  for (const id of Object.keys(out)) {
    const same = before[id] === out[id];
    if (!same) { moved++; if (!expect.has(id)) bad++; }
    if (!same || expect.has(id)) console.log((same ? '   same  ' : expect.has(id) ? '  MOVED  ' : '  !!MOVED ') + id + (before[id] === undefined ? '  (new)' : ''));
  }
  console.log((bad ? 'SHIELD RED: ' : 'SHIELD GREEN: ') + (Object.keys(out).length - moved) + ' of ' + Object.keys(out).length + ' layouts identical' + (moved ? ', ' + moved + ' moved' + (expect.size ? ' (expected: ' + [...expect].join(', ') + ')' : '') : ''));
  process.exit(bad ? 1 : 0);
}
console.log('usage: --write <file> | --diff <file> [--expect a,b]');
