#!/usr/bin/env node
// tools/gen_engraving_rules.js — docs/ENGRAVING_RULES.md, GENERATED from notation/registry/rules.json (LGMF PLAN 2e.1; RUNNING_LOG §448).
//   node tools/gen_engraving_rules.js            write the page
//   node tools/gen_engraving_rules.js --check    exit 1 if the page on disk is not what the tables generate (check_rules runs this)
// One section per layer, one line per row with its basis and its §; where each registry pointer lands; the overrides in force (the
// IRs' `engraving` overlays); the decisions needed (the table's open rows + the ladder's report once 2e.4 writes it). Never hand-edit
// the page: change the row, regenerate, commit both.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Rules = require(path.join(ROOT, 'notation', 'lib', 'rules.js'));
const OUT = path.join(ROOT, 'docs', 'ENGRAVING_RULES.md');
const R = Rules.loadRules(ROOT);
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'container.json'), 'utf8'));
const pageRules = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'page_rules.json'), 'utf8'));

const refs = Rules.refsOf(raw);
// row path ("objects.cueHead.size") → the registry keys it is compiled into
const landsAt = new Map();
for (const { path: p, ref } of refs) {
  const k = ref.slice(1);
  if (!landsAt.has(k)) landsAt.set(k, []);
  landsAt.get(k).push(p.replace(/^engraving\./, ''));
}
const usedRows = new Set([...landsAt.keys()].map(k => k.split('.').slice(0, 2).join('.')));
const fmt = v => typeof v === 'string' ? (/^@colours\.\w+\.value$/.test(v) ? v.split('.')[1] + ' ' + ((R.colours[v.split('.')[1]] || {}).value || '?')
  : Rules.REF.test(v) && Rules.resolve(R, v) !== undefined ? fmt(Rules.resolve(R, v)) + ' (= ' + v.slice(1).replace(/^objects\./, '') + ')' : v)   // [2g.1] a row that inherits: its value and whence
  : JSON.stringify(v).replace(/"/g, '').replace(/,/g, ', ').replace(/:/g, ': ');
const META = new Set(['basis', 'ref', 'draws', 'variantOf', 'in', 'note', 'seed', 'name', 'furniture', 'animated']);
const lands = (table, row, field) => {
  const l = landsAt.get(table + '.' + row + '.' + field);
  return l ? ' → `' + l.slice(0, 3).join('` · `') + '`' + (l.length > 3 ? ' +' + (l.length - 3) : '') : '';
};
// the devices on each anchor, from the registry's own pointers
const devOn = {};
const D = raw.engraving.layout.devices;
const eachDevice = [];
for (const g of ['byEnv', 'byTechnique']) for (const [k, v] of Object.entries(D[g] || {})) if (!k.startsWith('_') && v && typeof v === 'object') eachDevice.push([g + '.' + k, v]);
if (D.byPairBeam) eachDevice.push(['byPairBeam', D.byPairBeam]);
for (const [k, v] of Object.entries(raw.engraving.layout.figures || {})) if (!k.startsWith('_')) eachDevice.push(['figures.' + k, v]);
{ const TQ = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'techniques.json'), 'utf8'));   // [2e.3] the family looks
  for (const [k, v] of Object.entries(TQ.familyDevice || {})) if (!k.startsWith('_') && v && typeof v === 'object') eachDevice.push(['familyDevice.' + k + (v.provisional ? ' (provisional — DN-5)' : ''), v]); }
for (const [name, v] of eachDevice) if (v.anchorRow) (devOn[v.anchorRow] = devOn[v.anchorRow] || []).push(name);

const L = [];
const P = s => L.push(s);
P('# ENGRAVING RULES — GENERATED');
P('');
P('> **GENERATED from `notation/registry/rules.json` by `node tools/gen_engraving_rules.js` — never edit this page.** Change the ROW');
P('> (with its basis and its §), regenerate, commit both. `node tools/check_rules.js` fails when the page and the tables disagree.');
P('> The rules for a NEW notation begin with a DEVICE SHEET (`docs/PLANNING_METHOD.md`); `docs/NOTATION_STANDARDS.md` is the history.');
P('');
P('LGMF PLAN § `2e` (RUNNING_LOG §408 … §447 the design · §448 … the build). ' + refs.length + ' registry pointers compile from these tables.');
P('');
P('**How to read a row:** the value · `→` the registry key(s) it is compiled into (what the layout and the renderer read) · the basis');
P('(`lilypond` · `gould` · `composer` · `AI` · `census` = what drew when the tables were built) · the ref (the § or the day). A field');
P('with no `→` is the rule\'s record but is not compiled — its `in` says where the drawing reads it today.');
P('');
P('---');
P('');
// [LGMF PLAN 2l.1 — §513 … §522] THE PRINCIPLES: what a class of marks is FOR, before its numbers
if (R.principles) {
  P('## 0 · THE PRINCIPLES');
  P('');
  P(R.principles._doc);
  P('');
  for (const [k, o] of Object.entries(R.principles)) if (!k.startsWith('_')) P('- **' + k + '** — ' + o.rule + ' · *' + o.basis + '* · ' + o.ref);
  P('');
  P('---');
  P('');
}
P('## 1 · THE ANCHOR');
P('');
P(R.anchors._doc);
P('');
for (const [k, a] of Object.entries(R.anchors)) {
  if (k.startsWith('_')) continue;
  const f = Object.entries(a).filter(([n]) => !META.has(n)).map(([n, v]) => n + ' **' + fmt(v) + '**' + lands('anchors', k, n)).join(' · ');
  P('- **' + k + ' — ' + a.name + '** — ' + f + ' · *' + a.basis + '* · ' + a.ref + (a.note ? ' · NOTE: ' + a.note : ''));
  P('  - devices on it: ' + ((devOn[k] || []).join(' · ') || '—'));
}
P('');
P('---');
P('');
P('### The devices and their sheets');
P('');
P('Every device of the registry (container.json engraving.layout.devices · figures) and of the technique table (techniques.json familyDevice), its anchor row, its members, and the § that decided it (`sheet` — gate 7). A NEW device begins with a device sheet (`docs/PLANNING_METHOD.md`).');
P('');
for (const [name, v] of eachDevice) P('- **' + name + '** — anchor **' + (v.anchorRow || '?') + '**' + (v.anchorRowGc ? ' (its GC member ' + v.anchorRowGc + ')' : '') + ' · members ' + (v.memberRows || []).join(' · ') + ' · sheet: ' + (v.sheet || '—'));
P('');
P('---');
P('');
P('## 2 · THE COLUMN');
P('');
P(R.column._doc);
P('');
for (const [k, v] of Object.entries(R.column)) {
  if (k.startsWith('_') || /Ref$/.test(k)) continue;
  const ref = R.column[k + 'Ref'];
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    P('- **' + k + '** — ' + Object.entries(v).map(([n, x]) => n + ' **' + fmt(x) + '**' + lands('column', k, n)).join(' · ') + (ref ? ' · ' + ref : ''));
  } else P('- **' + k + '** — **' + fmt(v) + '**' + lands('column', k, '').replace(/→ ``/, '') + (landsAt.get('column.' + k) ? ' → `' + landsAt.get('column.' + k).join('` · `') + '`' : '') + (ref ? ' · ' + ref : ''));
}
P('');
P('---');
P('');
P('## 3 · THE OBJECTS');
P('');
P(R.objects._doc);
P('');
const objRows = Object.entries(R.objects).filter(([k]) => !k.startsWith('_'));
const group = (title, pred) => {
  P('### ' + title);
  P('');
  for (const [k, o] of objRows.filter(([, o]) => pred(o))) {
    const f = Object.entries(o).filter(([n]) => !META.has(n)).map(([n, v]) => n + ' **' + fmt(v) + '**' + lands('objects', k, n)).join(' · ');
    P('- **' + k + '**' + (o.variantOf ? ' *(a variant of ' + o.variantOf + ')*' : '') + ' — ' + (f || '—') + ' · *' + o.basis + '* · ' + o.ref);
    const extra = [];
    if (o.draws) extra.push('draws `' + o.draws.join('` `') + '`');
    if (o.in) extra.push('in: ' + o.in);
    if (o.seed) extra.push('seed: ' + fmt(o.seed));
    if (extra.length) P('  - ' + extra.join(' · '));
  }
  P('');
};
group('Music marks', o => !o.furniture && !o.animated);
group('Page furniture', o => o.furniture);
group('Animated (anchor F)', o => o.animated);
// [2g.1] the vibraphone's marks — the reader's rules as a table (rules.json vibMarks; notation/lib/vib_marks.js)
if (R.vibMarks) {
  P('### The vibraphone\'s marks in a sequence (`vibMarks`)');
  P('');
  P(R.vibMarks._doc);
  P('');
  P('- ' + Object.entries(R.vibMarks).filter(([n]) => !n.startsWith('_') && !META.has(n)).map(([n, v]) => n + ' **' + fmt(v) + '**' + (landsAt.get('vibMarks.' + n) ? ' → `' + landsAt.get('vibMarks.' + n).join('` · `') + '`' : '')).join(' · ') + ' · *' + R.vibMarks.basis + '* · ' + R.vibMarks.ref);
  P('');
}
// [2i.1] a lined staff's visibility (rules.json staffLines)
if (R.staffLines) {
  P('### A lined staff\'s visibility (`staffLines`)');
  P('');
  P(R.staffLines._doc);
  P('');
  for (const [k, v] of Object.entries(R.staffLines)) if (!k.startsWith('_'))
    P('- **' + k + '** — ' + Object.entries(v).filter(([n]) => !META.has(n)).map(([n, x]) => n + ' **' + fmt(x) + '**').join(' · ') + ' · *' + v.basis + '* · ' + v.ref);
  P('');
}
P('---');
P('');
P('## 4 · THE COLOURS AND THE FACES');
P('');
P(R.colours._doc);
P('');
for (const [k, c] of Object.entries(R.colours)) if (!k.startsWith('_'))
  P('- **' + k + '** `' + c.value + '`' + lands('colours', k, 'value') + ' — ' + c.use + ' · *' + c.basis + '* · ' + c.ref);
P('');
P(R.faces._doc);
P('');
for (const [k, c] of Object.entries(R.faces)) if (!k.startsWith('_'))
  P('- **' + k + '** — ' + Object.entries(c).filter(([n]) => !META.has(n)).map(([n, v]) => n + ' **' + fmt(v) + '**' + lands('faces', k, n)).join(' · ') + ' · *' + c.basis + '* · ' + c.ref);
P('');
P('---');
P('');
P('## 5 · THE PAGE — the edge classes (`notation/registry/page_rules.json` `edge`)');
P('');
P('Every drawn kind names what happens at a page edge: on SCREEN `cut` (clipped like paper) · `clamp` (moved right of the edge) · `atomic`');
P('(a go-time indicator, never moved) · `furniture`; on PAPER `whole` · `stub` · `continue` · `never-sever` · `furniture` · `none` (animated).');
P('');
P('| kind | screen | print |');
P('|---|---|---|');
for (const [k, e] of Object.entries(pageRules.edge || {})) if (!k.startsWith('_') && e && typeof e === 'object') P('| `' + k + '` | ' + e.screen + ' | ' + e.print + (e.boundary ? ' (' + e.boundary + ')' : '') + ' |');
P('');
P('---');
P('');
P('## 6 · THE LADDER (the exceptions)' + (R.ladder.built ? '' : ' — the table; the behaviour is built at 2e.4'));
P('');
P(R.ladder._doc);
P('');
for (const r of R.ladder.rungs) P('- **' + r.n + ' ' + r.name + '** — ' + r.do + (r.floor ? ' · floor: ' + r.floor : ''));
P('');
P('The size step: ×' + R.ladder.sizeStep + ' (' + R.ladder.sizeStepRef + ') · the compressed stack: ' + R.ladder.compressStack.join(' → ') + ' · ' + R.ladder.ref);
P('');
P('---');
P('');
P('## 7 · OVERRIDES IN FORCE');
P('');
P('Every `engraving` overlay on an event (the per-event hands: `stemDir` · `dxSs` · `dySs` · `beamBreak` · `device` …) in the notation');
P('files the picker lists. A rung-8 override carries five fields (the object · the property · the value · the rung · his § and date).');
P('');
const idx = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', 'index.json'), 'utf8')); } catch (e) { return null; } })();
const irIds = idx && Array.isArray(idx.irs) ? idx.irs.map(e => e.id) : fs.readdirSync(path.join(ROOT, 'notation', 'ir')).filter(f => f.endsWith('.ir.json')).map(f => f.replace('.ir.json', ''));
let anyOv = false;
for (const id of irIds) {
  const f = path.join(ROOT, 'notation', 'ir', id + '.ir.json');
  if (!fs.existsSync(f)) continue;
  const ir = JSON.parse(fs.readFileSync(f, 'utf8'));
  const ovs = (ir.overlays || []).filter(o => o.kind === 'engraving');
  if (!ovs.length) continue;
  anyOv = true;
  const fields = {};
  for (const o of ovs) for (const k of Object.keys(o.value || {})) fields[k] = (fields[k] || 0) + 1;
  const r8 = ovs.filter(o => o.value && o.value.rung === 8);
  P('- `' + id + '` — ' + ovs.length + ' override(s): ' + Object.entries(fields).map(([k, n]) => k + ' ×' + n).join(' · ') + (r8.length ? ' · **rung 8: ' + r8.length + '**' : ''));
}
if (!anyOv) P('- none');
P('');
P('---');
P('');
P('## 8 · DECISIONS NEEDED');
P('');
P('The open rows of the tables (two candidate values, a rule that is not yet the drawing) and — from 2e.4 — the ladder\'s per-page report');
P('(`node tools/decisions_needed.js`). Each is brought to him as a question with its options; his pick becomes the row (or a rung-8');
P('override) and the entry leaves the list (§426).');
P('');
const open = (R.decisionsNeeded || []).filter(d => d.status !== 'decided');
if (!open.length) P('- none open');
for (const d of open) P('- **' + d.id + '** — ' + d.what + (d.options ? ' · options: ' + d.options.join(' · ') : '') + ' · ' + d.ref);
const dnFile = path.join(ROOT, 'notation', 'registry', 'decisions_needed.json');
if (fs.existsSync(dnFile)) {
  const dn = JSON.parse(fs.readFileSync(dnFile, 'utf8'));
  P('');
  P('**The ladder\'s report** (' + (dn.generated || '') + '): ' + (dn.units || []).length + ' unit(s) left rung 0.');
  for (const u of (dn.units || []).slice(0, 60)) P('- `' + u.ir + '` p' + u.page + ' · ' + u.t.toFixed(2) + ' s · part ' + u.part + ' · ' + u.member + ' — ' + u.failed + ' · rung ' + u.rung + (u.moves ? ' · moves: ' + u.moves.join(' / ') : ''));
}
P('');
const md = L.join('\n') + '\n';
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (cur !== md) { console.log('ENGRAVING_RULES.md is NOT what rules.json generates — run node tools/gen_engraving_rules.js'); process.exit(1); }
  console.log('ENGRAVING_RULES.md matches the tables'); process.exit(0);
}
fs.writeFileSync(OUT, md);
console.log('wrote ' + path.relative(ROOT, OUT) + ' — ' + L.length + ' lines, ' + refs.length + ' pointers');
