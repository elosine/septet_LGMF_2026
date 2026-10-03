#!/usr/bin/env node
// check_print_frame.js — PLAN 2b.1.6: THE PRINTED PAGE AND THE FILMED PAGE ARE THE SAME PAGE.
//
// Why this exists. The print exporter drew a frame of its own — the parts the IR
// happened to carry, equal lanes, no grand staff, no labels — and nobody noticed
// until a page was looked at (RUNNING_LOG §552). The video's frame was fixed in
// 2i.10.1 and proven against the composer's own page; print now calls the same
// Coords.ensembleFrame. This check is what keeps them from drifting again.
//
// It is NOT a byte compare: the two views differ in scale by construction (a
// 1920x1080 frame against a 1491x976 print block), so every coordinate differs.
// What must agree is the FRAME — which systems are drawn, and how much ink is in
// each. So: same system list, same element census per system, same furniture.
//
//   node tools/check_print_frame.js [--ir piece-lgmf] [--at 100,300,600,870] [--sec 12]
//
// [LGMF 2b-P.1, 2026-10-03 — RE-POINTED TO THE DATA, not relaxed]
//   · THE CAST COMES FROM THE ENSEMBLE (registry ensemble.json through the video-jury realization): the systems (one per staff),
//     the labels (a part's `short`, or its staff's line names — the percussionist's seven), the brackets and the brace. It was
//     piece #5's by number (8 systems, "7 parts and a piano").
//   · THE SAME WINDOW IN BOTH. Since 2c the screen TILES its pages (from the lead-in) and paper places its cut BY THE OBJECTS, so
//     a moment no longer lands on the same window and a census across the two meant nothing (the first run here: print 95.43–107.43
//     against video 92.00–104.00, every system "different"). export_print --plan screen draws the PRINT's own frame — its parts,
//     lanes, block and model — on the SCREEN's pages, and the video page is found by the VIDEO's plan (this check used a third one).
//     With the window identical the census is no longer "expected small": ANY difference fails.
//   · A LABEL IS A TEXT AT THE LABEL'S x — the registry's partLabel.xPx past the view's left margin (40 px on this screen, none on
//     the print block, whose margin is the sheet's). "x < 6" found no label at all in the film's page and said so only as "".
//   What the paper's own cut does to a page is check_print_edges' question, not this one's.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const Splice = require(path.join(ROOT, 'notation', 'lib', 'splice.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Coords = require(path.join(ROOT, 'notation', 'lib', 'coords.js'));

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-lgmf');
const sec = arg('sec', '12');
const ats = (arg('at', '100,300,600,870') || '').split(',').filter(Boolean).map(Number);
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'printframe-'));

const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const ir = rd(path.join('notation', 'ir', irId + '.ir.json'));
const pageRules = rd('notation/registry/page_rules.json');
const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
const rz = (C.realizations || {})['video-jury'];
const ENS = Layout.ensembleFor(rd('notation/registry/ensemble.json'), rz);

// THE EXPECTED FRAME, from the ensemble
const WANT = {
  systems: ENS.parts.reduce((a, p) => a + ((p.staves && p.staves.length) || 1), 0),
  labels: ENS.parts.flatMap(p => (p.staff && p.staff.lines) ? p.staff.lines.map(l => l.short) : [p.short]).join(','),
  brackets: (ENS.groups || []).filter(g => g.kind === 'bracket').length,
  braces: (ENS.groups || []).filter(g => g.kind === 'brace').length,
};

// THE VIDEO'S OWN PLAN (export_video's two lines): the tiling from the lead-in, or the old overlap
const TILE = pageRules.screenPlan === 'tile';
const pages = TILE ? Splice.tilePages(ir, pageRules, parseFloat(sec), Splice.screenStartOf(ir, pageRules, rz))
  : Splice.planPages(ir, pageRules, parseFloat(sec));
const pageContaining = t => { let b = 0; for (let i = 0; i < pages.length; i++) if (pages[i].t0 <= t) b = i; else break; return b; };

// The systems of one page SVG, in the order they are drawn, each with a census
// of the elements inside it. The piano's two staves BOTH carry class "sys-p2"
// (they are one part), so the key is class + occurrence — a Map keyed on the
// class alone silently merges them, which is how a first draft of this check
// reported six systems for a seven-part frame and still said PASS.
// Depth-aware: a <g> inside a system closes before the system does.
function census(svg) {
  const out = [];
  const re = /<g class="sys (sys-[^" ]+)"[^>]*>/g;
  let m;
  while ((m = re.exec(svg))) {
    let i = re.lastIndex, depth = 1;
    const tag = /<(\/?)g[\s>]/g; tag.lastIndex = i;
    let t;
    while (depth > 0 && (t = tag.exec(svg))) { depth += t[1] ? -1 : 1; i = tag.lastIndex; }
    const body = svg.slice(re.lastIndex, i);
    const tags = {};
    for (const x of body.matchAll(/<([a-z]+)[\s>]/g)) tags[x[1]] = (tags[x[1]] || 0) + 1;
    out.push({ sys: m[1], tags });
  }
  return out;
}
// The furniture outside the systems, plus the part labels. A label is a <text> AT
// THE LABEL'S x (see the header) — its STRING is compared, not just its count. NOT
// "anything in the gutter": a technique word on a note just before the window's
// start also lands there, and read as a label on 7 of piece #5's 63 pages.
const LABEL_X = ((((C.engraving || {}).render || {}).partLabel || {}).xPx != null) ? C.engraving.render.partLabel.xPx : 4;
const furniture = (svg, marginLeft) => ({
  brackets: (svg.match(/class="[^"]*sysgrp-bracket/g) || []).length,
  braces: (svg.match(/class="[^"]*sysgrp-brace/g) || []).length,
  labels: [...svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]*)<\/text>/g)]
    .filter(m => Math.abs(parseFloat(m[1]) - (marginLeft + LABEL_X)) < 0.01 && /[A-Za-z]/.test(m[2])).map(m => m[2]).join(','),
});
const windowOf = line => { const m = /window (-?[\d.]+)–(-?[\d.]+)/.exec(line); return m ? m[1] + '–' + m[2] : '?'; };

console.log('the frame, from the ensemble: ' + WANT.systems + ' systems · labels ' + WANT.labels + ' · ' + WANT.brackets +
  ' brackets · ' + WANT.braces + ' brace' + (TILE ? '   (the screen tiles: both drawn on the screen\'s pages)' : ''));
let bad = 0;
for (const T of ats) {
  const i = pageContaining(T);
  const ph = path.join(tmp, 'p' + i + '.html'), vs = path.join(tmp, 'v' + i + '.svg');
  const p = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), '--ir', irId, '--sec', sec,
    '--plan', 'screen', '--at', String(T), '--htmlOnly', '--out', ph], { encoding: 'utf8' });
  const v = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_video.js'), '--ir', irId,
    '--dumpPage', String(i), '--dumpTo', vs], { encoding: 'utf8' });
  if (!fs.existsSync(ph) || !fs.existsSync(vs)) { console.log('t=' + T + '  EXPORT FAILED\n' + (p.stderr || '') + (v.stderr || '')); bad++; continue; }
  const pm = /<div class="mus">([\s\S]*?)<\/div>/.exec(fs.readFileSync(ph, 'utf8'));
  const P = census(pm[1]), V = census(fs.readFileSync(vs, 'utf8'));
  const pf = furniture(pm[1], 0), vf = furniture(fs.readFileSync(vs, 'utf8'), Coords.edgesOf(C).marginLeftPx);
  const pw = windowOf((p.stdout || '').split('\n').find(l => /window/.test(l)) || ''), vw = windowOf(v.stdout || '');

  const shape = c => c.map(s => s.sys).join(' ');
  const sameShape = shape(P) === shape(V);
  const diffs = [];
  if (sameShape) {
    for (let k = 0; k < P.length; k++) {
      const a = P[k].tags, b = V[k].tags;
      for (const tag of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const da = a[tag] || 0, db = b[tag] || 0;
        if (da !== db) diffs.push(P[k].sys + '#' + k + ' ' + tag + ' print ' + da + ' vs video ' + db);
      }
    }
  }
  const furnSame = JSON.stringify(pf) === JSON.stringify(vf);
  const asWanted = P.length === WANT.systems && pf.labels === WANT.labels && pf.brackets === WANT.brackets && pf.braces === WANT.braces;
  const sameWindow = pw !== '?' && pw === vw;
  const ok = sameShape && furnSame && asWanted && sameWindow && !diffs.length;
  if (!ok) bad++;
  console.log((ok ? '  OK   ' : '  FAIL ') + 't=' + T + '  page ' + i +
    '  systems ' + P.length + '/' + WANT.systems + ' [' + shape(P) + ']' +
    '  labels ' + pf.labels + '  brackets ' + pf.brackets + '  brace ' + pf.braces +
    '  print ' + pw + '  video ' + vw);
  if (!sameShape) console.log('       SYSTEMS DIFFER: print [' + shape(P) + ']  video [' + shape(V) + ']');
  if (!furnSame) console.log('       FURNITURE DIFFERS: print ' + JSON.stringify(pf) + '  video ' + JSON.stringify(vf));
  if (!asWanted) console.log('       NOT THE ENSEMBLE\'S FRAME: wanted ' + JSON.stringify(WANT));
  if (!sameWindow) console.log('       THE WINDOWS DIFFER — the census below compares two different stretches of music');
  if (diffs.length) console.log('       CENSUS DIFFERS: ' + diffs.join(' · '));
  else if (sameShape) console.log('       census identical in every system (' + P.reduce((a, s) => a + Object.values(s.tags).reduce((x, y) => x + y, 0), 0) + ' elements)');
}
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(bad ? 'FAIL — ' + bad + ' of ' + ats.length : 'PASS — ' + ats.length + ' moments, the print frame is the video frame');
process.exit(bad ? 1 : 0);
