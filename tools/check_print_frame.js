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
//   node tools/check_print_frame.js [--ir piece-lgmf] [--at 100,250,380,530] [--sec 12]
//
// --sec 12 makes both tools plan the same pages (the video's page length), so a
// given moment lands on the same page index in both. The windows still differ by
// a few hundredths — each tool computes the §404 clef buffer in its OWN scale —
// so a small census difference at a page edge is expected and is printed, not hidden.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const Splice = require(path.join(ROOT, 'notation', 'lib', 'splice.js'));

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-lgmf');
const sec = arg('sec', '12');
const ats = (arg('at', '100,250,380,530') || '').split(',').filter(Boolean).map(Number);
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'printframe-'));

const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', irId + '.ir.json'), 'utf8'));
const pageRules = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'page_rules.json'), 'utf8'));
const pages = Splice.planPages(ir, pageRules, parseFloat(sec));
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
// The furniture outside the systems, plus the part labels. A label is a <text>
// at x = 4 (registry engraving.partLabel.xPx) — its STRING is compared, not just
// its count. NOT "anything in the gutter": a technique word on a note just before
// the window's start also lands there, and read as a label on 7 of the 63 pages.
const GUTTER = 6;
const furniture = svg => ({
  brackets: (svg.match(/class="[^"]*sysgrp-bracket/g) || []).length,
  braces: (svg.match(/class="[^"]*sysgrp-brace/g) || []).length,
  labels: [...svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]*)<\/text>/g)]
    .filter(m => parseFloat(m[1]) < GUTTER && /[A-Za-z]/.test(m[2])).map(m => m[2]).join(','),
});
const windowOf = line => { const m = /window ([\d.]+)–([\d.]+)/.exec(line); return m ? m[1] + '–' + m[2] : '?'; };

let bad = 0;
for (const T of ats) {
  const i = pageContaining(T);
  const ph = path.join(tmp, 'p' + i + '.html'), vs = path.join(tmp, 'v' + i + '.svg');
  const p = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), '--ir', irId, '--sec', sec,
    '--at', String(T), '--htmlOnly', '--out', ph], { encoding: 'utf8' });
  const v = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_video.js'), '--ir', irId,
    '--dumpPage', String(i), '--dumpTo', vs], { encoding: 'utf8' });
  if (!fs.existsSync(ph) || !fs.existsSync(vs)) { console.log('t=' + T + '  EXPORT FAILED\n' + (p.stderr || '') + (v.stderr || '')); bad++; continue; }
  const pm = /<div class="mus">([\s\S]*?)<\/div>/.exec(fs.readFileSync(ph, 'utf8'));
  const P = census(pm[1]), V = census(fs.readFileSync(vs, 'utf8'));
  const pf = furniture(pm[1]), vf = furniture(fs.readFileSync(vs, 'utf8'));

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
  // the septet's frame: seven parts, and the piano drawn as two staves = eight system groups
  const expected = 8;
  const ok = sameShape && furnSame && P.length === expected;
  if (!ok) bad++;
  console.log((ok ? '  OK   ' : '  FAIL ') + 't=' + T + '  page ' + i +
    '  systems ' + P.length + '/' + expected + ' [' + shape(P) + ']' +
    '  labels ' + pf.labels + '  brackets ' + pf.brackets + '  brace ' + pf.braces +
    '  print ' + windowOf((p.stdout || '').split('\n').find(l => /window/.test(l)) || '') +
    '  video ' + windowOf(v.stdout || ''));
  if (!sameShape) console.log('       SYSTEMS DIFFER: print [' + shape(P) + ']  video [' + shape(V) + ']');
  if (!furnSame) console.log('       FURNITURE DIFFERS: print ' + JSON.stringify(pf) + '  video ' + JSON.stringify(vf));
  if (diffs.length) console.log('       census differences (page-edge material, expected small): ' + diffs.join(' · '));
  else if (sameShape) console.log('       census identical in every system');
}
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(bad ? 'FAIL — ' + bad + ' of ' + ats.length : 'PASS — ' + ats.length + ' moments, the print frame is the video frame');
process.exit(bad ? 1 : 0);
