#!/usr/bin/env node
// protrusion_detect.js — V3 [A21]: the geometric auto-filer. Lays out an
// IR in the VIDEO container geometry and files every place ink leaves its
// lane band — through the inter-lane gap into a neighbor, or off the
// frame — to docs/NOTATION_POLISH.md. Detection is automatic and silent
// (D18: the composer is never asked about micro-layout mid-notation);
// FIXES are tier-3 work via the data channels.
//
//   node tools/protrusion_detect.js <ir-id> [<ir-id>...] [--dry]
//
// [LGMF PLAN 2e.4, 2026-09-27 — RUNNING_LOG §451] THE GEOMETRY IS notation/lib/fit.js — the same function the layout's ladder runs:
// the frame's own lane boxes (the ensemble's weighted lanes, the joined lane's split, the inter-lane gap) and every unit's ink,
// where this tool once carried the tuba's ten equal lanes and its own extents. A unit is filed when it fails rung 0 AFTER the ladder
// (past the gap, or touching the neighbour's ink) — the worst per part per second, one line per real spot.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js'));
const G = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'lib', 'glyphs.json'), 'utf8'));
const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
const ens = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'ensemble.json'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'techniques.json'), 'utf8'));

const ids = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dry = process.argv.includes('--dry');
if (!ids.length) { console.error('usage: protrusion_detect.js <ir-id> [...] [--dry]'); process.exit(2); }

const ENS = Layout.ensembleFor(ens, (C.realizations || {})['video-jury']);
const parts = ENS.parts.map(p => p.part);
const boxes = Fit.boxesFor(C, ENS, parts);
const ssPx = C.staff.staffHeightPx / 4;

let filed = 0;
const lines = [];
for (const id of ids) {
  const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', id + '.ir.json'), 'utf8'));
  const model = Layout.layoutSection(ir, G, Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques: T, fitBoxes: boxes }, (C.engraving && C.engraving.layout) || {}));
  const worst = new Map();   // part|second -> the worst failing unit
  for (const u of Fit.measureModel(model, boxes, G, 1.3)) {
    if (!u.reasons.length) continue;
    const over = Math.max(u.over.top, u.over.bot), k = u.key + '|' + Math.floor(u.t);
    const prev = worst.get(k);
    if (!prev || over > prev.over) worst.set(k, { key: u.key, t: u.t, over, dir: u.over.top >= u.over.bot ? 'top' : 'bottom', why: u.reasons[0],
      kind: [...new Set(u.items.filter(Fit.isMark).map(it => it.seq || it.g || it.k))].join(' ') || 'the note' });
  }
  for (const w of [...worst.values()].sort((a, b) => a.t - b.t)) {
    const nm = (ENS.parts.find(p => String(p.part) === String(w.key).split(':')[0]) || {}).short || 'part ' + w.key;
    lines.push('- `' + id + '` · ' + nm + ' @ ' + w.t.toFixed(2) + ' s — ' + w.kind + ' crosses the ' + w.dir + ' lane edge by ~' + (w.over * ssPx).toFixed(1) + ' px (' + w.why + ')');
    filed++;
  }
}

if (dry) {
  console.log(lines.join('\n') || '(clean)');
} else if (filed) {
  const LEDGER = path.join(ROOT, 'docs', 'NOTATION_POLISH.md');
  const stamp = '\n### ' + new Date().toISOString().slice(0, 10) + ' — ' + ids.join(', ') + '\n\n';
  fs.appendFileSync(LEDGER, stamp + lines.join('\n') + '\n');
}
console.log('protrusion_detect: ' + filed + ' item(s) ' + (dry ? '(dry run)' : filed ? 'filed to docs/NOTATION_POLISH.md' : '— clean, nothing filed'));
