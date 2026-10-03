#!/usr/bin/env node
// check_print_pages.js — PLAN 2b.5.5: EVERY PAGE, NOT THE FOUR THAT WERE LOOKED AT.
//
// The frame check proves four moments match the film. That is the right check for
// the frame, and the wrong one for a 63-page score: a page that lost its clef, or
// a lane that went missing where the material is thin, would sit between the
// samples and reach the jury unseen. This walks the whole render and asserts the
// same handful of things about each page, then reports the outliers.
//
//   node tools/check_print_pages.js [--ir piece-lgmf] [--verbose] [anything else goes through to the exporter: --sec, --margin …]
//
// Per page: the ensemble's part labels · its system groups (one per staff) ·
// its brackets and its brace · a time ruler with ticks · a folio · nothing
// block-level outside the sheet. Across the score: exactly ONE terminal barline,
// on the last page, because `edgeBar:false` means the bar draws only where the
// piece actually ends (the composer's ask on #4: no bar at the right of every page).
//
// [LGMF 2b-P.1, 2026-10-03] THE CAST COMES FROM THE ENSEMBLE (registry ensemble.json through the video-jury realization), as
// check_print_frame's does — it was piece #5's by name ("Fl,BCl,Pno,Vn1,Vn2,Va,Vc", 8 systems, 2 brackets + 1 brace). A part with a
// lined staff is labelled by its line names (the percussionist's seven), which are drawn on every page whether the staff is or not.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-lgmf');
const verbose = process.argv.includes('--verbose');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'printpages-'));
const html = path.join(tmp, 'all.html');
// anything else on the command line goes through to the exporter, so this walks the very build being argued about
const pass = [];
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--ir') { i++; continue; }
  if (process.argv[i] === '--verbose') continue;
  pass.push(process.argv[i]);
}
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
const ENS = require(path.join(ROOT, 'notation', 'lib', 'layout.js')).ensembleFor(rd('notation/registry/ensemble.json'), (C.realizations || {})['video-jury']);
const WANT = {
  systems: ENS.parts.reduce((a, p) => a + ((p.staves && p.staves.length) || 1), 0),
  labels: ENS.parts.flatMap(p => (p.staff && p.staff.lines) ? p.staff.lines.map(l => l.short) : [p.short]).join(','),
  brbr: (ENS.groups || []).filter(g => g.kind === 'bracket').length + '/' + (ENS.groups || []).filter(g => g.kind === 'brace').length,
};
const LABEL_X = ((((C.engraving || {}).render || {}).partLabel || {}).xPx != null) ? C.engraving.render.partLabel.xPx : 4;

console.log('rendering the whole score to HTML …');
const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), '--ir', irId,
  '--cover', 'on', '--instructions', 'on', '--htmlOnly', '--quiet', '--out', html, ...pass], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (!fs.existsSync(html)) { console.error(r.stdout || ''); console.error(r.stderr || ''); process.exit(1); }
console.log('  ' + (fs.statSync(html).size / 1024 / 1024).toFixed(1) + ' MB of HTML; measuring in Chrome …');

const probe = `
<script>addEventListener('load',()=>{
  const rows=[...document.querySelectorAll('.page')].map((pg,i)=>{
    const kind=pg.className.replace('page','').trim()||'music';
    const pr=pg.getBoundingClientRect();
    const mus=pg.querySelector('.mus svg');
    if(!mus) return [i+1,kind,'','','','','',''].join('|');
    const sys=mus.querySelectorAll('g[class^="sys sys-"]').length;
    // A PART LABEL IS A TEXT AT x = 4 — render.js draws it at the registry's
    // engraving.partLabel.xPx and nothing else sits there. Anything "in the
    // gutter" is too loose a test: a technique word belonging to a note just
    // before the window ("(slap)", "jeté", "T. R.") lands left of x=72 and was
    // read as an eighth part label on 7 of the 63 pages.
    const labels=[...mus.querySelectorAll('text')].filter(t=>Math.abs(parseFloat(t.getAttribute('x'))-LABEL_X)<0.01&&/[A-Za-z]/.test(t.textContent)).map(t=>t.textContent).join(',');
    const brackets=mus.querySelectorAll('g[class*="sysgrp-bracket"]').length;
    const braces=mus.querySelectorAll('g[class*="sysgrp-brace"]').length;
    const hdr=pg.querySelector('.hdr svg');
    const ticks=hdr?hdr.querySelectorAll('line').length:0;
    const clock=hdr?[...hdr.querySelectorAll('text')].length:0;
    const folio=(pg.querySelector('.fol')||{textContent:''}).textContent.trim().replace(/\\s+/g,' ');
    // the terminal barline: static_page draws it as <g class="final-barline"> (the print's thin + thick, §772); before §772 the only full-height <rect> with opacity
    const endbar=mus.querySelectorAll('g.final-barline').length||[...mus.querySelectorAll('rect[opacity]')].filter(x=>parseFloat(x.getAttribute('height'))>0.7*mus.getBoundingClientRect().height).length;
    let outside=0;
    for (const el of pg.querySelectorAll('.hdr,.mus,.fol')) {
      const b=el.getBoundingClientRect();
      if (b.left<pr.left-0.5||b.top<pr.top-0.5||b.right>pr.right+0.5||b.bottom>pr.bottom+0.5) outside++;
    }
    return [i+1,kind,sys,labels,brackets+'/'+braces,ticks+'/'+clock,folio,endbar,outside].join('|');
  });
  document.body.setAttribute('data-m', rows.join(' ;; '));
});</script>`;
fs.writeFileSync(html, fs.readFileSync(html, 'utf8') + '<script>const LABEL_X=' + LABEL_X + ';</script>' + probe);
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!chrome) { console.error('Chrome not found (set CHROME_PATH)'); process.exit(1); }
const c = spawnSync(chrome, ['--headless', '--disable-gpu', '--virtual-time-budget=120000', '--dump-dom',
  'file:///' + html.split(path.sep).join('/')], { encoding: 'utf8', maxBuffer: 1 << 30 });
const m = /data-m="([^"]*)"/.exec(c.stdout || '');
if (!m) { console.error('no measurement came back from Chrome'); process.exit(1); }

const LABELS = WANT.labels;
const rows = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').split(' ;; ').map(s => s.split('|'));
const music = rows.filter(r => r[1] === 'music');
let bad = 0, endbars = [];
for (const [n, kind, sys, labels, brbr, ruler, folio, endbar, outside] of rows) {
  if (kind !== 'music') { if (verbose) console.log('  --   page ' + n + '  ' + kind); continue; }
  const problems = [];
  if (+sys !== WANT.systems) problems.push('systems ' + sys + ', expected ' + WANT.systems);
  if (labels !== LABELS) problems.push('labels "' + labels + '" != "' + LABELS + '"');
  if (brbr !== WANT.brbr) problems.push('brackets/brace ' + brbr + ', expected ' + WANT.brbr);
  const [ticks, clocks] = ruler.split('/').map(Number);
  if (!(ticks > 3)) problems.push('ruler has ' + ticks + ' lines');
  if (!(clocks >= 1)) problems.push('ruler has no clock numbers');
  if (!/\d+:\d\d\s+–\s+\d+:\d\d/.test(folio)) problems.push('folio reads "' + folio + '"');
  if (+outside) problems.push(outside + ' block(s) outside the sheet');
  if (+endbar) endbars.push(+n);
  if (problems.length) { bad++; console.log('  FAIL page ' + n + '  ' + problems.join(' · ')); }
  else if (verbose) console.log('  OK   page ' + n + '  ' + labels + '  ruler ' + ruler + '  folio ' + folio);
}
const lastMusic = music.length ? +music[music.length - 1][0] : 0;
console.log('  music pages           ' + music.length + '  (pages ' + (music.length ? music[0][0] : '-') + '–' + lastMusic + ')');
console.log('  the ensemble\'s frame (' + LABELS.split(',').length + ' labels · ' + WANT.systems + ' systems · ' + WANT.brbr +
  ' brackets/brace), a ruler and a folio on every one: ' + (bad ? 'NO' : 'yes'));
console.log('  terminal barline on   ' + (endbars.length ? 'page(s) ' + endbars.join(',') : 'NO PAGE'));
if (endbars.length !== 1 || endbars[0] !== lastMusic) { bad++; console.log('  FAIL  the terminal barline must appear once, on the last page (' + lastMusic + ')'); }
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(bad ? 'FAIL — ' + bad + ' problem(s)' : 'PASS — all ' + music.length + ' music pages carry the full frame; the piece ends once');
process.exit(bad ? 1 : 0);
