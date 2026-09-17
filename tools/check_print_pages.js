#!/usr/bin/env node
// check_print_pages.js — PLAN 2b.5.5: EVERY PAGE, NOT THE FOUR THAT WERE LOOKED AT.
//
// The frame check proves four moments match the film. That is the right check for
// the frame, and the wrong one for a 63-page score: a page that lost its clef, or
// a lane that went missing where the material is thin, would sit between the
// samples and reach the jury unseen. This walks the whole render and asserts the
// same handful of things about each page, then reports the outliers.
//
//   node tools/check_print_pages.js [--ir piece-septet] [--verbose]
//
// Per page: seven part labels · eight system groups (the piano is two staves) ·
// two brackets and one brace · a time ruler with ticks · a folio · nothing
// block-level outside the sheet. Across the score: exactly ONE terminal barline,
// on the last page, because `edgeBar:false` means the bar draws only where the
// piece actually ends (the composer's ask on #4: no bar at the right of every page).
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-septet');
const verbose = process.argv.includes('--verbose');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'printpages-'));
const html = path.join(tmp, 'all.html');

console.log('rendering the whole score to HTML …');
const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), '--ir', irId,
  '--cover', 'on', '--instructions', 'on', '--htmlOnly', '--quiet', '--out', html], { encoding: 'utf8', maxBuffer: 1 << 28 });
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
    const labels=[...mus.querySelectorAll('text')].filter(t=>parseFloat(t.getAttribute('x'))<=6&&/[A-Za-z]/.test(t.textContent)).map(t=>t.textContent).join(',');
    const brackets=mus.querySelectorAll('g[class*="sysgrp-bracket"]').length;
    const braces=mus.querySelectorAll('g[class*="sysgrp-brace"]').length;
    const hdr=pg.querySelector('.hdr svg');
    const ticks=hdr?hdr.querySelectorAll('line').length:0;
    const clock=hdr?[...hdr.querySelectorAll('text')].length:0;
    const folio=(pg.querySelector('.fol')||{textContent:''}).textContent.trim().replace(/\\s+/g,' ');
    // the terminal barline: static_page draws it as the only full-height <rect> with opacity
    const endbar=[...mus.querySelectorAll('rect[opacity]')].filter(x=>parseFloat(x.getAttribute('height'))>0.7*mus.getBoundingClientRect().height).length;
    let outside=0;
    for (const el of pg.querySelectorAll('.hdr,.mus,.fol')) {
      const b=el.getBoundingClientRect();
      if (b.left<pr.left-0.5||b.top<pr.top-0.5||b.right>pr.right+0.5||b.bottom>pr.bottom+0.5) outside++;
    }
    return [i+1,kind,sys,labels,brackets+'/'+braces,ticks+'/'+clock,folio,endbar,outside].join('|');
  });
  document.body.setAttribute('data-m', rows.join(' ;; '));
});</script>`;
fs.writeFileSync(html, fs.readFileSync(html, 'utf8') + probe);
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!chrome) { console.error('Chrome not found (set CHROME_PATH)'); process.exit(1); }
const c = spawnSync(chrome, ['--headless', '--disable-gpu', '--virtual-time-budget=120000', '--dump-dom',
  'file:///' + html.split(path.sep).join('/')], { encoding: 'utf8', maxBuffer: 1 << 30 });
const m = /data-m="([^"]*)"/.exec(c.stdout || '');
if (!m) { console.error('no measurement came back from Chrome'); process.exit(1); }

const LABELS = 'Fl,BCl,Pno,Vn1,Vn2,Va,Vc';
const rows = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').split(' ;; ').map(s => s.split('|'));
const music = rows.filter(r => r[1] === 'music');
let bad = 0, endbars = [];
for (const [n, kind, sys, labels, brbr, ruler, folio, endbar, outside] of rows) {
  if (kind !== 'music') { if (verbose) console.log('  --   page ' + n + '  ' + kind); continue; }
  const problems = [];
  if (+sys !== 8) problems.push('systems ' + sys + ', expected 8');
  if (labels !== LABELS) problems.push('labels "' + labels + '" != "' + LABELS + '"');
  if (brbr !== '2/1') problems.push('brackets/brace ' + brbr + ', expected 2/1');
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
console.log('  seven labels, 8 systems, 2 brackets + 1 brace, a ruler and a folio on every one: ' + (bad ? 'NO' : 'yes'));
console.log('  terminal barline on   ' + (endbars.length ? 'page(s) ' + endbars.join(',') : 'NO PAGE'));
if (endbars.length !== 1 || endbars[0] !== lastMusic) { bad++; console.log('  FAIL  the terminal barline must appear once, on the last page (' + lastMusic + ')'); }
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(bad ? 'FAIL — ' + bad + ' problem(s)' : 'PASS — all ' + music.length + ' music pages carry the full frame; the piece ends once');
process.exit(bad ? 1 : 0);
