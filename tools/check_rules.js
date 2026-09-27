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
const noAnchor = devices.filter(([, v]) => !v.anchorRow || !R.anchors[v.anchorRow]).map(([n]) => n);
ok(!noAnchor.length, 'every device (' + devices.length + ') names an anchor row' + (noAnchor.length ? ' — not: ' + noAnchor.join(' · ') : ''));
const badMember = [];
for (const [n, v] of devices) for (const m of v.memberRows || []) if (!R.objects[m]) badMember.push(n + ' → ' + m);
ok(devices.every(([, v]) => Array.isArray(v.memberRows) && v.memberRows.length) && !badMember.length,
  'every device lists its member rows, each an objects row' + (badMember.length ? ' — unknown: ' + badMember.join(' · ') : ''));
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
const A5_UNTIL_2E3 = /\(it\.color \|\| o\.muted\)/;   // the grey default of a text item (§427 A5) — ended at 2e.3 (3)
for (const f of ['notation/lib/layout.js', 'notation/lib/render.js']) {
  const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split(/\r?\n/);
  const col = [], mut = [], size = [];
  lines.forEach((ln, i) => {
    const code = ln.replace(/\/\/.*$/, '');
    if (/#[0-9a-fA-F]{3,6}\b|rgba?\(\s*\d/.test(code) && !MIRROR.test(ln)) col.push(i + 1);
    if (/\bo\.muted\b/.test(code) && !FURNITURE_MUTED.some(r => r.test(ln)) && !A5_UNTIL_2E3.test(ln) && !MIRROR.test(ln)) mut.push(i + 1);
    if (f.endsWith('layout.js') && /[{,]\s*(size|scale)\s*:\s*[0-9.]+/.test(code) && !MIRROR.test(ln)) size.push(i + 1);   // a key, not a ternary's `: 1`
    if (f.endsWith('render.js') && /font-size="[0-9]/.test(code) && !/mk\.label/.test(ln)) size.push(i + 1);
  });
  ok(!col.length, f + ': no colour literal outside a RULES MIRROR line' + (col.length ? ' — lines ' + col.join(', ') : ''));
  ok(!mut.length, f + ': `muted` only at the page-furniture sites' + (mut.length ? ' — lines ' + mut.join(', ') : ''));
  ok(!size.length, f + ': no numeric size literal on a music item outside a RULES MIRROR line' + (size.length ? ' — lines ' + size.join(', ') : ''));
}
{
  const rn = fs.readFileSync(path.join(ROOT, 'notation', 'lib', 'render.js'), 'utf8');
  if (A5_UNTIL_2E3.test(rn)) console.log('  NOTE  render.js still colours an uncoloured text item `muted` (§427 A5) — ends at 2e.3 (3)');
}

// ---------------------------------------------------------------- (6) the anchor principle
console.log('(6) THE ANCHOR PRINCIPLE');
const CD = C ? C.engraving.layout.devices : D;
const compiledOf = n => { const [g, k] = n.split('.'); return g === 'byPairBeam' ? CD.byPairBeam : g === 'figures' ? (C || raw).engraving.layout.figures[k] : CD[g][k]; };
const bad6 = [];
for (const [n, v] of devices) {
  const d = compiledOf(n), a = v.anchorRow, row = R.anchors[a];
  if (!row || row.goLine === null) continue;
  const gl = d.goLine;
  if (row.goLine === false && gl === 'gc' && v.anchorRowGc && R.anchors[v.anchorRowGc] && R.anchors[v.anchorRowGc].goLine === true) continue;   // a figure: the GC member alone takes C
  if (row.goLine === false && gl) bad6.push(n + ' is on ' + a + ' (the head on its time) but draws a go line');
  if (row.goLine === true && !gl) bad6.push(n + ' is on ' + a + ' (a go line) but draws none');
}
ok(!bad6.length, 'every device obeys its anchor: the head on its time ↔ no go line (' + devices.length + ' devices)' + (bad6.length ? ' — ' + bad6.join(' · ') : ''));

console.log('');
console.log(failures ? 'RULES RED: ' + failures + ' of ' + checks + ' checks failed' : 'RULES GREEN: ' + checks + ' checks');
process.exit(failures ? 1 : 0);
