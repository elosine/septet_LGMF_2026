#!/usr/bin/env node
// tools/decisions_needed.js — THE DECISIONS-NEEDED REPORT of the ladder (LGMF PLAN 2e.4; RUNNING_LOG §426 the design · §451 the build).
//   node tools/decisions_needed.js [--ir <id> ...] [--write]
// Lays out each notation page as the presentation draws it (video-jury, the ladder ON, the frame's lane boxes) and prints every unit
// that LEFT RUNG 0: the screen page · the time · the part · its members · what failed · each rung tried and its result · two or
// three concrete manual moves, each written as the override it would be (rung 8: the object · the property · the value — on the
// event, with his § and date). --write keeps the list in notation/registry/decisions_needed.json, which docs/ENGRAVING_RULES.md shows.
// Without --ir: every page in notation/ir/index.json. notate_section prints the same report for the page it builds (reportFor).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Rules = require(path.join(ROOT, 'notation', 'lib', 'rules.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js'));
const Splice = require(path.join(ROOT, 'notation', 'lib', 'splice.js'));
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// the moves a composer can make on a unit the ladder could not place — as the overrides they would be
function movesFor(u) {
  const out = [], by = u.over || { top: 0, bot: 0 }, side = by.bot >= by.top ? 'bot' : 'top', amt = +(Math.max(by.top, by.bot) + 0.05).toFixed(2);
  const outer = (u.members || []).find(m => /^dyn-|range|label/.test(m)) ? 'dynamic' : (u.members || []).some(m => /techText|instruction|cents|partial/.test(m)) ? 'instruction' : null;
  if (outer) out.push('{ rung: 8, object: \'' + outer + '\', property: \'dySs\', value: ' + (side === 'bot' ? '+' : '−') + amt + ' } — the ' + outer + ' in by the spill');
  if (outer) out.push('{ rung: 8, object: \'' + outer + '\', property: \'size\', value: 0.6 } — two size steps down');
  out.push('the octave device on the passage, or a lane rebalance on the page (rungs 6 · 5 — his, on the page)');
  return out.slice(0, 3);
}

// the report of one IR document: [{ ir, page, t, part, members, failed, rung, tried, moves, override }]
function reportFor(ir, opts) {
  const C = (opts && opts.C) || Rules.loadContainer(ROOT);
  const G = (opts && opts.glyphs) || rd('notation/lib/glyphs.json'), ens = rd('notation/registry/ensemble.json'), T = rd('notation/registry/techniques.json');
  const pr = rd('notation/registry/page_rules.json');
  const rz = (C.realizations || {})['video-jury'];
  const ENS = Layout.ensembleFor(ens, rz), parts = ENS.parts.map(p => p.part);
  const m = Layout.layoutSection(ir, G, Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques: T, fitBoxes: Fit.boxesFor(C, ENS, parts) },
    C.engraving.layout));
  const S = (C.timeScale && C.timeScale.defaults && C.timeScale.defaults.trance) || 12, S0 = Splice.screenStartOf(ir, pr, rz);
  return (m.fit || []).map(u => ({ ir: ir.id, page: Math.floor((u.t - S0) / S + 1e-9) + 1, t: u.t, part: u.part, members: u.members, failed: u.failed, rung: u.rung, by: u.by,
    tried: (u.tried || []).map(x => 'rung ' + x.rung + ': ' + x.result), moves: u.rung === 8 && !u.override ? movesFor(Object.assign({ over: parseOver(u.by) }, u)) : [], override: u.override }));
}
const parseOver = s => { const t = /([\d.]+) ss past the top/.exec(s || ''), b = /([\d.]+) ss past the bottom/.exec(s || ''); return { top: t ? +t[1] : 0, bot: b ? +b[1] : 0 }; };

function print(rows) {
  for (const r of rows) {
    console.log('  ' + r.ir + ' · p' + r.page + ' · ' + r.t.toFixed(2) + ' s · part ' + r.part + ' · ' + r.members.join(' ') + ' — ' + (r.failed.join('; ') || r.by) + ' → RUNG ' + r.rung + (r.override ? ' (his override: ' + r.override + ')' : ''));
    for (const x of r.tried) console.log('       ' + x);
    for (const mv of r.moves) console.log('       move: ' + mv);
  }
}

if (require.main === module) {
  const ids = [];
  for (let i = 2; i < process.argv.length; i++) if (process.argv[i] === '--ir') ids.push(process.argv[++i]);
  const list = ids.length ? ids : (() => { try { return rd('notation/ir/index.json').irs.map(e => e.id); } catch (e) { return []; } })();
  const C = Rules.loadContainer(ROOT);
  const all = [];
  for (const id of list) {
    const f = path.join('notation', 'ir', id + '.ir.json');
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const rows = reportFor(rd(f), { C });
    console.log(id + ': ' + rows.length + ' unit(s) left rung 0' + (rows.length ? ' — ' + ['1', '2', '3', '8'].map(r => rows.filter(x => String(x.rung) === r).length + ' at ' + r).join(' · ') : ''));
    print(rows);
    all.push(...rows);
  }
  if (process.argv.includes('--write')) {
    const out = { generated: new Date().toISOString().slice(0, 10) + ' (tools/decisions_needed.js)', units: all.filter(r => r.rung === 8 && !r.override).map(r => ({ ir: r.ir, page: r.page, t: +r.t.toFixed(3), part: r.part,
      member: r.members.join(' '), failed: r.failed.join('; ') || r.by, rung: r.rung, moves: r.moves })) };
    fs.writeFileSync(path.join(ROOT, 'notation', 'registry', 'decisions_needed.json'), JSON.stringify(out, null, 1) + '\n');
    console.log('wrote notation/registry/decisions_needed.json — ' + out.units.length + ' unit(s) at rung 8');
  }
}
module.exports = { reportFor, movesFor, print };
