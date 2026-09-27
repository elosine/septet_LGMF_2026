// notation/lib/rules.js — THE ENGRAVING RULES, compiled into the registry (LGMF PLAN 2e.1, 2026-09-27; RUNNING_LOG §448).
//
// The rules live in DATA: notation/registry/rules.json holds five tables (the anchors · the column · the objects · the colours and
// faces · the ladder), every row with its `basis` and its §. The devices and the look blocks of container.json do not carry numbers
// of their own any more: they POINT at a row with a string "@table.row.field" (e.g. "nhHeadScale": "@objects.cueHead.size").
// compile() resolves every pointer, so the layout and the renderer read the registry exactly as before — the tables are the source,
// the registry keys a derived view. A pointer that names no row THROWS: a rule cannot silently fall back to a code default.
//
// Every reader of container.json goes through here: the exporters and the tools by loadContainer(ROOT), the notation app by
// compile(container, rules) after its two fetches. docs/ENGRAVING_RULES.md is generated from rules.json (tools/gen_engraving_rules.js);
// tools/check_rules.js holds the gates.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationRules = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const REF = /^@([A-Za-z_][\w]*(?:\.[\w-]+)+)$/;

  // the value a pointer names, or undefined
  function resolve(rules, ref) {
    const m = REF.exec(ref);
    if (!m) return undefined;
    let v = rules;
    for (const k of m[1].split('.')) { if (v == null || typeof v !== 'object' || !(k in v)) return undefined; v = v[k]; }
    return v;
  }
  const clone = v => (v == null || typeof v !== 'object') ? v : JSON.parse(JSON.stringify(v));

  // every pointer in a tree: [{ path, ref }]
  function refsOf(tree) {
    const out = [];
    const walk = (v, p) => {
      if (typeof v === 'string') { if (REF.test(v)) out.push({ path: p.join('.'), ref: v }); return; }
      if (Array.isArray(v)) { v.forEach((x, i) => walk(x, p.concat(i))); return; }
      if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], p.concat(k));
    };
    walk(tree, []);
    return out;
  }

  // the registry with every pointer replaced by its row's value (a fresh copy; the input untouched). Throws on a pointer with no row.
  function compile(container, rules) {
    if (!rules) return container;
    const missing = [];
    const walk = (v, p) => {
      if (typeof v === 'string' && REF.test(v)) {
        const r = resolve(rules, v);
        if (r === undefined) { missing.push(p.join('.') + ' → ' + v); return v; }
        return clone(r);
      }
      if (Array.isArray(v)) return v.map((x, i) => walk(x, p.concat(i)));
      if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = walk(v[k], p.concat(k)); return o; }
      return v;
    };
    const out = walk(container, []);
    if (missing.length) throw new Error('rules.js: ' + missing.length + ' pointer(s) name no row in rules.json: ' + missing.join(' · '));
    return out;
  }

  // Node: the compiled registry from a repo root (container.json + rules.json)
  function loadContainer(rootDir) {
    const fs = require('fs'), path = require('path');
    const rd = p => JSON.parse(fs.readFileSync(path.join(rootDir, p), 'utf8'));
    const rulesPath = path.join(rootDir, 'notation', 'registry', 'rules.json');
    return compile(rd(path.join('notation', 'registry', 'container.json')), fs.existsSync(rulesPath) ? rd(path.join('notation', 'registry', 'rules.json')) : null);
  }
  function loadRules(rootDir) {
    const fs = require('fs'), path = require('path');
    return JSON.parse(fs.readFileSync(path.join(rootDir, 'notation', 'registry', 'rules.json'), 'utf8'));
  }

  return { compile, resolve, refsOf, loadContainer, loadRules, REF };
}));
