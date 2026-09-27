#!/usr/bin/env node
// tools/check_rules.js — THE GATES OF THE ENGRAVING RULES (LGMF PLAN 2e; RUNNING_LOG §448 …). Exit 1 on any failure.
//   node tools/check_rules.js
// (0) the tables are whole: every registry pointer names a row · every row carries a basis and a ref · every device names its anchor
//     row and its member rows, each an existing row · docs/ENGRAVING_RULES.md is what the tables generate
// (1) every drawn kind has an edge row (page_rules.edge) — the renderer's kinds + every kind in a laid-out page
//     [2e.2: + every ANIMATED kind (animobj.kinds())]
// (2) every object the layout draws has an objects row — every item of every notation file laid out, and every kind and glyph the
//     renderer and the animation layer know, matched against the rows' `draws`
// (3) no colour or size literal for a music mark in layout.js / render.js — a colour literal only on a RULES MIRROR line (the code
//     fallbacks for a caller without the registry); `muted` only at the page-furniture sites; a numeric size on a pushed item only on
//     a RULES MIRROR line
// (6) the anchor principle — the head ON its time ↔ no go line: an anchor-A device draws no go line, a B · C · D device draws one
// [2e.3: (8) the fundamental and the cents at sounding pitch in a transposed realization · 2e.4: (4) the fit test · (5) the dot in a
//  space · 2e.5: (7) every device carries `sheet: '§N'`]
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const Rules = require(path.join(ROOT, 'notation', 'lib', 'rules.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Render = require(path.join(ROOT, 'notation', 'lib', 'render.js'));
const AnimObj = require(path.join(ROOT, 'notation', 'lib', 'animobj.js'));
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const R = Rules.loadRules(ROOT);
const raw = rd('notation/registry/container.json');
const pageRules = rd('notation/registry/page_rules.json');
const glyphs = rd('notation/lib/glyphs.json');
let failures = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (cond) console.log('   ok  ' + msg); else { failures++; console.log('  FAIL  ' + msg); } return cond; };
const ANIMATED_EDGES = process.argv.includes('--animated') || (pageRules.edge && Object.keys(pageRules.edge).some(k => k.startsWith('anim:')));

// ---------------------------------------------------------------- (0) the tables are whole
console.log('(0) THE TABLES');
let C = null;
try { C = Rules.compile(raw, R); ok(true, 'every registry pointer names a row (' + Rules.refsOf(raw).length + ' pointers compiled)'); }
catch (e) { ok(false, e.message); }
const noBasis = [];
for (const t of ['anchors', 'objects', 'colours', 'faces']) for (const [k, v] of Object.entries(R[t] || {})) {
  if (k.startsWith('_')) continue;
  if (!v.basis || !v.ref) noBasis.push(t + '.' + k);
}
ok(!noBasis.length, 'every row carries its basis and its ref' + (noBasis.length ? ' — missing on ' + noBasis.join(' · ') : ''));
const D = raw.engraving.layout.devices;
const devices = [];
for (const g of ['byEnv', 'byTechnique']) for (const [k, v] of Object.entries(D[g] || {})) if (!k.startsWith('_') && v && typeof v === 'object') devices.push([g + '.' + k, v]);
if (D.byPairBeam) devices.push(['byPairBeam', D.byPairBeam]);
for (const [k, v] of Object.entries(raw.engraving.layout.figures || {})) if (!k.startsWith('_') && v && typeof v === 'object') devices.push(['figures.' + k, v]);
// [2e.3] the technique table's family looks (techniques.json familyDevice) are devices too — the layout falls back to them
const TQ = rd('notation/registry/techniques.json');
for (const [k, v] of Object.entries(TQ.familyDevice || {})) if (!k.startsWith('_') && v && typeof v === 'object') devices.push(['familyDevice.' + k, v]);
const noAnchor = devices.filter(([, v]) => !v.anchorRow || !R.anchors[v.anchorRow]).map(([n]) => n);
ok(!noAnchor.length, 'every device (' + devices.length + ') names an anchor row' + (noAnchor.length ? ' — not: ' + noAnchor.join(' · ') : ''));
const badMember = [];
for (const [n, v] of devices) for (const m of v.memberRows || []) if (!R.objects[m]) badMember.push(n + ' → ' + m);
ok(devices.every(([, v]) => Array.isArray(v.memberRows) && v.memberRows.length) && !badMember.length,
  'every device lists its member rows, each an objects row' + (badMember.length ? ' — unknown: ' + badMember.join(' · ') : ''));
// (7) [2e.5] every device carries its SHEET — the § of the device sheet (or the decision that stands for one) that made it
const noSheet = devices.filter(([, v]) => !(typeof v.sheet === 'string' && v.sheet.trim())).map(([n]) => n);
ok(!noSheet.length, '(7) every device carries `sheet` — the § that decided it (' + devices.length + ')' + (noSheet.length ? ' — none on ' + noSheet.join(' · ') : ''));
const gen = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'gen_engraving_rules.js'), '--check'], { encoding: 'utf8' });
ok(gen.status === 0, 'docs/ENGRAVING_RULES.md is what the tables generate' + (gen.status ? ' — run node tools/gen_engraving_rules.js' : ''));

// ---------------------------------------------------------------- lay out every notation file once (the gates below read the items)
const ens = rd('notation/registry/ensemble.json'), T = rd('notation/registry/techniques.json');
const ENS = Layout.ensembleFor(ens, ((C || raw).realizations || {})['video-jury']);
const irFiles = fs.readdirSync(path.join(ROOT, 'notation', 'ir')).filter(f => f.endsWith('.ir.json')).sort();
const sigs = new Map();         // signature → first place seen
const kindsSeen = new Set();
for (const f of irFiles) {
  let m;
  try {
    const ir = rd(path.join('notation', 'ir', f));
    m = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: ENS ? ENS.parts.map(p => p.part) : undefined, ensemble: ENS, techniques: T },
      ((C || raw).engraving || {}).layout || {}));
  } catch (e) { ok(false, f + ' does not lay out: ' + e.message); continue; }
  for (const s of m.systems) for (const it of s.items || []) {
    kindsSeen.add(it.k);
    const sig = it.k === 'glyph' ? 'glyph:' + it.g : it.k + (it.seq ? '[' + it.seq + ']' : '');
    if (!sigs.has(sig)) sigs.set(sig, f.replace('.ir.json', ''));
  }
}

// ---------------------------------------------------------------- (1) every drawn kind has an edge row
console.log('(1) THE EDGES');
const CLASSES = new Set(['cut', 'clamp', 'atomic', 'furniture']);
const drawnKinds = [...new Set([].concat(Render.POINT_KINDS, Render.LONG_KINDS, Render.FURNITURE_KINDS, ['tuplet'], [...kindsSeen]))].sort();
const noEdge = drawnKinds.filter(k => !(pageRules.edge && pageRules.edge[k] && CLASSES.has(pageRules.edge[k].screen)));
ok(!noEdge.length, 'every drawn kind (' + drawnKinds.length + ') carries its edge class' + (noEdge.length ? ' — not: ' + noEdge.join(' · ') : ''));
if (ANIMATED_EDGES) {
  const noAnim = AnimObj.kinds().concat(['cursor']).filter(k => !(pageRules.edge['anim:' + k] && CLASSES.has(pageRules.edge['anim:' + k].screen) && pageRules.edge['anim:' + k].print === 'none'));
  ok(!noAnim.length, 'every ANIMATED kind (' + (AnimObj.kinds().length + 1) + ') carries its edge class, print none' + (noAnim.length ? ' — not: ' + noAnim.join(' · ') : ''));
} else console.log('   --  the animated kinds\' edge rows arrive at 2e.2');

// ---------------------------------------------------------------- (2) every drawn object has an objects row
console.log('(2) THE OBJECTS');
const pats = [];
for (const [k, o] of Object.entries(R.objects)) if (!k.startsWith('_')) for (const d of o.draws || []) pats.push({ row: k, re: new RegExp('^' + d.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '$') });
const rowOf = sig => { const hit = pats.find(p => p.re.test(sig)); if (hit) return hit.row; const bare = sig.replace(/\[.*\]$/, ''); const h2 = bare !== sig && pats.find(p => p.re.test(bare)); return h2 ? h2.row : null; };
// the universe the code can draw, whether or not a page draws it today
const universe = new Map(sigs);
for (const k of drawnKinds) if (k !== 'glyph' && !universe.has(k)) universe.set(k, 'the renderer');
universe.set('glyph:notehead', universe.get('glyph:notehead') || 'the renderer'); universe.set('glyph:notehead-open', universe.get('glyph:notehead-open') || 'the renderer');
const fam = { dynamic: 'dyn-', articulation: 'artic-', accidental: 'accidental-', text: 'text-', pedal: 'pedal-' };
for (const [f, pre] of Object.entries(fam)) for (const n of Object.keys(glyphs[f] || {})) if (!n.startsWith('_')) { const s = 'glyph:' + pre + n; if (!universe.has(s)) universe.set(s, 'glyphs.json'); }
for (const n of Object.keys(glyphs.flag || {})) if (!n.startsWith('_')) { const s = 'glyph:flag-' + n; if (!universe.has(s)) universe.set(s, 'glyphs.json'); }
for (const k of AnimObj.kinds().concat(['cursor'])) universe.set('anim:' + k, 'animobj');
const noRow = [...universe].filter(([s]) => !rowOf(s));
ok(!noRow.length, 'every drawable object (' + universe.size + ' kinds and glyphs; ' + sigs.size + ' drawn on ' + irFiles.length + ' pages) has an objects row' +
  (noRow.length ? ' — not: ' + noRow.map(([s, w]) => s + ' (' + w + ')').join(' · ') : ''));

// ---------------------------------------------------------------- (3) no colour or size literal for a music mark
console.log('(3) THE LITERALS');
const MIRROR = /RULES MIRROR/;
const FURNITURE_MUTED = [/E\.partLabel/, /E\.reshow/, /mk\.label/, /pcfg \? esc\(pcfg\.short\)/];
for (const f of ['notation/lib/layout.js', 'notation/lib/render.js']) {
  const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split(/\r?\n/);
  const col = [], mut = [], size = [];
  lines.forEach((ln, i) => {
    const code = ln.replace(/\/\/.*$/, '');
    if (/#[0-9a-fA-F]{3,6}\b|rgba?\(\s*\d/.test(code) && !MIRROR.test(ln)) col.push(i + 1);
    if (/\bo\.muted\b/.test(code) && !FURNITURE_MUTED.some(r => r.test(ln)) && !MIRROR.test(ln)) mut.push(i + 1);
    if (f.endsWith('layout.js') && /[{,]\s*(size|scale)\s*:\s*[0-9.]+/.test(code) && !MIRROR.test(ln)) size.push(i + 1);   // a key, not a ternary's `: 1`
    if (f.endsWith('render.js') && /font-size="[0-9]/.test(code) && !/mk\.label/.test(ln)) size.push(i + 1);
  });
  ok(!col.length, f + ': no colour literal outside a RULES MIRROR line' + (col.length ? ' — lines ' + col.join(', ') : ''));
  ok(!mut.length, f + ': `muted` only at the page-furniture sites' + (mut.length ? ' — lines ' + mut.join(', ') : ''));
  ok(!size.length, f + ': no numeric size literal on a music item outside a RULES MIRROR line' + (size.length ? ' — lines ' + size.join(', ') : ''));
}

// ---------------------------------------------------------------- (6) the anchor principle
console.log('(6) THE ANCHOR PRINCIPLE');
const CD = C ? C.engraving.layout.devices : D;
const compiledOf = n => { const [g, k] = n.split('.'); return g === 'byPairBeam' ? CD.byPairBeam : g === 'figures' ? (C || raw).engraving.layout.figures[k] : g === 'familyDevice' ? TQ.familyDevice[k] : CD[g][k]; };
const bad6 = [], prov6 = [];
for (const [n, v] of devices) {
  const d = compiledOf(n), a = v.anchorRow, row = R.anchors[a];
  if (!row || row.goLine === null) continue;
  const gl = d.goLine;
  // a PROVISIONAL look (2a's family devices) is reported by name, and must stand on the decisions-needed list — not failed
  if (v.provisional && !!gl !== row.goLine) { prov6.push(n); continue; }
  if (row.goLine === false && gl === 'gc' && v.anchorRowGc && R.anchors[v.anchorRowGc] && R.anchors[v.anchorRowGc].goLine === true) continue;   // a figure: the GC member alone takes C
  if (row.goLine === false && gl) bad6.push(n + ' is on ' + a + ' (the head on its time) but draws a go line');
  if (row.goLine === true && !gl) bad6.push(n + ' is on ' + a + ' (a go line) but draws none');
}
ok(!bad6.length, 'every device obeys its anchor: the head on its time ↔ no go line (' + devices.length + ' devices)' + (bad6.length ? ' — ' + bad6.join(' · ') : ''));
if (prov6.length) {
  const listed = (R.decisionsNeeded || []).some(d => d.status !== 'decided' && prov6.every(n => (d.what || '').includes(n.split('.')[1])));
  ok(listed, prov6.length + ' PROVISIONAL device(s) break the principle and stand on the decisions-needed list: ' + prov6.join(' · '));
}

// ---------------------------------------------------------------- (4) THE FIT TEST · (5) the staccato dot in a space
console.log('(4) THE FIT · (5) THE DOT');
{
  const Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js'));
  const LO = ((C || raw).engraving || {}).layout || {};
  const boxes = Fit.boxesFor(C || raw, ENS, ENS.parts.map(p => p.part));
  let pages = 0, left = 0, unreported = [], dots = 0, onLine = [];
  const lined = new Set((ens.parts || []).filter(p => p.staff && Array.isArray(p.staff.lines)).map(p => p.part));   // a lined staff (the percussion's seven) has its own spaces
  for (const f of irFiles) {
    const ir = rd(path.join('notation', 'ir', f));
    const m = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: ENS.parts.map(p => p.part), ensemble: ENS, techniques: T, fitBoxes: boxes }, LO));
    pages++;
    // (4) after the ladder, every unit still failing rung 0 is on the model's report at rung 8 — nothing touches unreported
    const rest = Fit.measureModel(m, boxes, glyphs, 1.3).filter(x => x.reasons.length);
    const rep = new Set((m.fit || []).filter(u => u.rung === 8).map(u => u.key + '|' + u.t.toFixed(6)));
    left += (m.fit || []).length;
    for (const x of rest) if (!rep.has(x.key + '|' + x.t.toFixed(6))) unreported.push(f.replace('.ir.json', '') + ' p' + x.key + '@' + x.t.toFixed(2));
    // (5) a staccato dot sits in a SPACE of a five-line staff (a half-integer staff position), never on a line
    for (const s of m.systems) if (!lined.has(s.part)) for (const it of s.items || []) if (it.k === 'dot') {
      dots++;
      const unitLines = [-2, -1, 0, 1, 2].concat((s.items || []).filter(x => x.k === 'ledger' && Math.abs(x.t - it.t) < 1e-9).map(x => x.ySs));   // the staff's lines and the unit's ledgers
      if (unitLines.some(Lx => Math.abs(it.ySs - Lx) < 0.25 - 1e-9)) onLine.push(f.replace('.ir.json', '') + ' p' + s.part + '@' + it.t.toFixed(2) + ' y ' + it.ySs);
    }
  }
  ok(LO.ladder && LO.ladder.on === true, 'the ladder is ON (rules.json ladder.built, compiled into engraving.layout.ladder)');
  ok(!unreported.length, 'the fit test over ' + pages + ' page(s): every unit that fails rung 0 after the ladder is on the report at rung 8 (' + left + ' left rung 0)' + (unreported.length ? ' — unreported: ' + unreported.slice(0, 6).join(' · ') : ''));
  ok(!onLine.length, 'no staccato dot touches a line — the staff’s or a ledger (' + dots + ' dots)' + (onLine.length ? ' — on a line: ' + onLine.slice(0, 6).join(' · ') : ''));
  // the ladder's walk, forced: the proto's block with its lane shrunk 2 ss under it and no room above — rungs 1 · 2 · 3 tried, reported at 8, marked red
  const proto = irFiles.includes('lgmf-eh-proto.ir.json') ? rd('notation/ir/lgmf-eh-proto.ir.json') : null;
  if (proto) {
    const B2 = Fit.boxesFor(C || raw, ENS, ENS.parts.map(p => p.part)); B2.byKey['0'] = Object.assign({}, B2.byKey['0'], { top: 7.0, bot: 2.94 });
    const mf = Layout.layoutSection(JSON.parse(JSON.stringify(proto)), glyphs, Object.assign({ m4AttackLines: false, frameParts: ENS.parts.map(p => p.part), ensemble: ENS, techniques: T, fitBoxes: B2 }, LO));
    const u = (mf.fit || []).find(x => x.part === 0 && x.t === 0), red = mf.systems.find(s => s.part === 0).items.some(i => i.seq === 'alert' && i.t === 0);
    const walked = u ? [...new Set(u.tried.map(x => String(x.rung)))].join(',') : '';
    ok(u && u.rung === 8 && walked === '1,2,3,4-7' && red, 'a unit forced 2 ss past its lane walks rungs 1 → 2 → 3 and is reported at 8, marked red — walked ' + walked + ', rung ' + (u && u.rung));
    B2.byKey['0'] = Object.assign({}, B2.byKey['0'], { top: 8.12 });
    const mf3 = Layout.layoutSection(JSON.parse(JSON.stringify(proto)), glyphs, Object.assign({ m4AttackLines: false, frameParts: ENS.parts.map(p => p.part), ensemble: ENS, techniques: T, fitBoxes: B2 }, LO));
    const u3 = (mf3.fit || []).find(x => x.part === 0 && x.t === 0);
    ok(u3 && u3.rung === 3, 'the same unit with room above is placed by rung 3 (the flip) — rung ' + (u3 && u3.rung));
  }
}

// ---------------------------------------------------------------- (8) the numbers at sounding pitch in every realization
console.log('(8) SOUNDING PITCH');
{
  // [2e.3 (5), §440 · §441] a transposed part moves the HEADS and the accidental picture only: the cents and the partial's fundamental
  // are the same text, at the same time, in the working realization (the EH and the horn in F, the trumpet in B♭) and in the one in C
  const texts = E => {
    const out = new Map();
    for (const f of irFiles) {
      const ir = rd(path.join('notation', 'ir', f));
      if (!(ir.overlays || []).some(o => o.kind === 'sequence')) continue;
      const m = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: E.parts.map(p => p.part), ensemble: E, techniques: T },
        ((C || raw).engraving || {}).layout || {}));
      for (const s of m.systems) for (const it of s.items || []) if (it.k === 'text' && (it.seq === 'cents' || it.seq === 'partial'))
        out.set(f + '|' + s.part + '|' + it.t.toFixed(4) + '|' + it.seq, it.text);
    }
    return out;
  };
  const inC = texts(ENS), working = texts(Layout.ensembleFor(ens, null));
  const bad = [...inC].filter(([k, v]) => working.get(k) !== v).map(([k, v]) => k + ' ' + v + ' ≠ ' + working.get(k));
  const tr = (ens.parts || []).filter(p => p.transpose).map(p => p.short || p.part);
  ok(inC.size > 0 && inC.size === working.size && !bad.length, 'the cents and the partial read the same in C and in the transposed parts (' + tr.join(' · ') + '): ' + inC.size + ' texts' +
    (bad.length ? ' — differ: ' + bad.slice(0, 4).join(' · ') : '') + (!inC.size ? ' — no sequence page to compare' : ''));
}

console.log('');
console.log(failures ? 'RULES RED: ' + failures + ' of ' + checks + ' checks failed' : 'RULES GREEN: ' + checks + ' checks');
process.exit(failures ? 1 : 0);
