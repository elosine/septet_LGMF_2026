#!/usr/bin/env node
// bake_text.js — bake an instruction text into notation/lib/glyphs.json `text` (LGMF PLAN 2d.1, 2026-09-25; RUNNING_LOG §382).
//
// Piece #2's recipe, verbatim (composition_for_two_pianos_and_two_percussion/tools/notation_studio/engine/glyphs/text_baker.js
// `bakeText`): opentype.js, each glyph at the cursor with the font's kerning, the path translated so the bbox's top-left is the
// origin; `anchors.baselineLeft` = the baseline at the left bearing. The font: Crimson Pro Light Italic at the project's locked
// 1.0998 ss (`notation/app/fonts/CrimsonPro-LightItalic.ttf`, the same file piece #2 ships). THE SHAPE CHECK FIRST: "pizz." is
// re-baked and must equal the entry the table already holds, or nothing is written.
//
// Usage: node tools/bake_text.js "senza vib." [more texts…]
// A NEW text is inserted as text at the end of the group, so the rest of the file stays byte for byte; an existing one is left.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
// this repo does not install opentype.js; piece #2's copy (the one its text_baker ran on) is read in place, never modified
const opentype = (() => {
  try { return require('opentype.js'); } catch (e) {
    return require(path.join(ROOT, '..', 'composition_for_two_pianos_and_two_percussion', 'node_modules', 'opentype.js'));
  }
})();
const GLYPHS = path.join(ROOT, 'notation', 'lib', 'glyphs.json');
const FONT = path.join(ROOT, 'notation', 'app', 'fonts', 'CrimsonPro-LightItalic.ttf');
const SIZE = 1.0998;

const font = opentype.parse(fs.readFileSync(FONT).buffer.slice(0));
function translatePath(d, dx, dy) {            // text_baker.js _translatePath, verbatim
  const cmdRe = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let out = '', m;
  while ((m = cmdRe.exec(d)) !== null) {
    const cmd = m[1];
    const args = (m[2].match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || []).map(parseFloat);
    const isRel = cmd === cmd.toLowerCase() && cmd !== 'z';
    let tr;
    if (cmd === 'Z' || cmd === 'z') tr = [];
    else if (isRel) tr = args;
    else if (cmd === 'H') tr = args.map(v => v + dx);
    else if (cmd === 'V') tr = args.map(v => v + dy);
    else if (cmd === 'A') { tr = []; for (let i = 0; i + 6 < args.length; i += 7) tr.push(args[i], args[i + 1], args[i + 2], args[i + 3], args[i + 4], args[i + 5] + dx, args[i + 6] + dy); }
    else tr = args.map((v, i) => v + (i % 2 === 0 ? dx : dy));
    out += cmd + tr.map(v => parseFloat(v.toFixed(6)).toString()).join(' ');
  }
  return out;
}
function bake(text) {                           // text_baker.js bakeText, the same arithmetic
  const p = new opentype.Path();
  let x = 0, prev = null;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) x += font.getKerningValue(prev, g) * (SIZE / font.unitsPerEm);
    p.extend(g.getPath(x, 0, SIZE));
    x += g.advanceWidth * (SIZE / font.unitsPerEm);
    prev = g;
  }
  const bb = p.getBoundingBox(), dx = -bb.x1, dy = -bb.y1;
  const r4 = v => +v.toFixed(4);
  return { path: translatePath(p.toPathData(6), dx, dy), wSs: r4(bb.x2 - bb.x1), hSs: r4(bb.y2 - bb.y1),
    anchors: { baselineLeft: { x: r4(dx), y: r4(dy) } }, font: 'Crimson Pro Light italic ' + SIZE + ' ss' };
}

const txt0 = fs.readFileSync(GLYPHS, 'utf8');
const G = JSON.parse(txt0);
const ref = G.text && G.text['pizz.'];
const chk = bake('pizz.');
if (!ref || chk.path !== ref.path || chk.wSs !== ref.wSs || chk.hSs !== ref.hSs
    || chk.anchors.baselineLeft.x !== ref.anchors.baselineLeft.x || chk.anchors.baselineLeft.y !== ref.anchors.baselineLeft.y) {
  console.error('bake_text: the shape check FAILED — "pizz." re-baked does not equal the stored entry; nothing written');
  process.exit(1);
}
console.log('shape check: "pizz." re-baked = the stored entry (path, box, anchor)');
let txt = txt0;
const out = [];
for (const text of process.argv.slice(2)) {
  if (G.text[text]) { out.push('"' + text + '" already held — left'); continue; }
  const e = Object.assign(bake(text), { _provenance: { by: 'tools/bake_text.js', baked: new Date().toLocaleDateString('sv'), recipe: 'piece #2 text_baker.js bakeText; CrimsonPro-LightItalic.ttf at ' + SIZE + ' ss' } });
  G.text[text] = e;
  const head = '\n "text": {', a = txt.indexOf(head);
  const close = txt.indexOf('\n }', a + head.length);            // the group's own closing brace (depth 1)
  const block = JSON.stringify({ [text]: e }, null, 1).slice(2, -2).split('\n').map(l => ' ' + l).join('\n');
  txt = txt.slice(0, close) + ',\n' + block + txt.slice(close);
  out.push('"' + text + '" ' + e.wSs + ' x ' + e.hSs + ' ss');
}
if (txt !== txt0) {
  if (JSON.stringify(JSON.parse(txt)) !== JSON.stringify(G)) { console.error('bake_text: the inserted text does not parse to the new table — nothing written'); process.exit(1); }
  fs.writeFileSync(GLYPHS, txt);
}
console.log(out.join(' · '));
