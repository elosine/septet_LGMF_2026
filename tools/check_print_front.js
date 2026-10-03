#!/usr/bin/env node
// check_print_front.js — PLAN 2b.4: THE FRONT MATTER FITS, AND NOTHING IS CLIPPED.
//
// Why this exists. The performance-instructions page printed as ONE two-column
// sheet and the content was three columns long, so `.page{overflow:hidden}` threw
// the third away — silently, in a PDF nobody would diff (RUNNING_LOG §606). A
// page that loses a section without a word is the worst failure mode this tool
// has. The exporter cannot see its own layout (Chrome does the columns), so the
// check lives here and the build runs it.
//
//   node tools/check_print_front.js [--ir piece-lgmf] [--format a3-landscape]
//
// It renders the front matter through the exporter, measures every page in
// headless Chrome, and FAILS on: a column overflow, an element outside the sheet,
// a cover whose display font fell back, or an empty page.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-lgmf');
const format = arg('format', JSON.parse(fs.readFileSync(path.join(ROOT, 'print', 'formats.json'), 'utf8')).default);   // [2b-P.2] the sheets' one file
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'printfront-'));
const html = path.join(tmp, 'front.html');

// anything else on the command line goes through to the exporter (--insBreak, --margin …),
// so this check measures the very build being argued about
const MINE = new Set(['--ir', '--format']);
const pass = [];
for (let i = 2; i < process.argv.length; i++) {
  if (MINE.has(process.argv[i])) { i++; continue; }
  pass.push(process.argv[i]);
}
const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), '--ir', irId, '--format', format,
  '--cover', 'on', '--instructions', 'on', '--pages', '1', '--htmlOnly', '--quiet', '--out', html, ...pass], { encoding: 'utf8' });
if (!fs.existsSync(html)) { console.error(r.stdout || ''); console.error(r.stderr || ''); process.exit(1); }

const probe = `
<script>addEventListener('load',()=>{
  const rows=[...document.querySelectorAll('.page')].map((pg,i)=>{
    const pr=pg.getBoundingClientRect(), kind=pg.className.replace('page','').trim()||'music';
    const c=pg.querySelector('.cols');
    let over='', fill='';
    if(c){ // a third column, or a column taller than its box, means content is being thrown away
      over=Math.max(c.scrollWidth-c.clientWidth, c.scrollHeight-c.clientHeight)+'px';
      // how full each column is, measured on the LEAF blocks — the container div
      // spans both columns, so asking it where it ends always answers "the bottom"
      const cr=c.getBoundingClientRect();
      const deep=[...c.querySelectorAll('h3, h4, p, .figwrap, figcaption, .pair, ul, table')];   // [2b-P.3] every leaf block of the page's vocabulary
      const low=n=>Math.round(Math.max(0,...deep.filter(e=>{const r=e.getBoundingClientRect();
        return n===1 ? (r.left-cr.left)<cr.width/2 : (r.left-cr.left)>=cr.width/2;})
        .map(e=>e.getBoundingClientRect().bottom-cr.top-(n===1?0:0))));
      fill='col1 '+low(1)+' · col2 '+low(2)+' of '+Math.round(cr.height);
    }
    // Anything sticking out of the SHEET. Block-level boxes only: an SVG's own
    // children routinely reach past their viewport (a conduction arc runs off the
    // page edge in the film too) and are clipped by it, so counting them called
    // 111 elements "outside" on a page where every block was in place.
    let outside=0;
    for (const el of pg.querySelectorAll('.cols > *, .figwrap, .institle, .cov > svg, .hdr, .mus, .fol')) {
      const r=el.getBoundingClientRect();
      if (r.width===0&&r.height===0) continue;
      if (r.left<pr.left-0.5||r.top<pr.top-0.5||r.right>pr.right+0.5||r.bottom>pr.bottom+0.5) outside++;
    }
    // the cover's type: every line's DRAWN width against the width the generator measured with the real face (data-w, pt).
    // [LGMF 2b-P.2] the first form of this test read getComputedStyle().fontFamily — the family ASKED FOR, which is the same
    // string whether the face resolved or fell back: a check that could not fail. A fallback face draws a different width.
    let cover='';
    const ts=[...pg.querySelectorAll('.cov text')];
    if(ts.length){
      const worst=ts.map(t=>{const w=t.getBBox().width, w0=parseFloat(t.getAttribute('data-w'));return isFinite(w0)&&w0>0?Math.abs(w-w0)/w0:NaN;});
      const fam=getComputedStyle(ts[0]).fontFamily.replace(/"/g,'');
      const svgW=pg.querySelector('.cov svg').viewBox.baseVal.width, wide=Math.max(...ts.map(t=>t.getBBox().width));
      cover=' title "'+ts[0].textContent+'" '+ts[0].getBBox().width.toFixed(0)+'pt drawn / '+ts[0].getAttribute('data-w')+' measured · '+ts.length+
        ' lines, the widest '+wide.toFixed(0)+' of '+svgW.toFixed(0)+'pt (side margins '+((svgW-wide)/2/72).toFixed(2)+' in), widest drift '+(100*Math.max(...worst.map(x=>isNaN(x)?9:x))).toFixed(1)+'% face='+fam+'@@'+Math.max(...worst.map(x=>isNaN(x)?9:x)).toFixed(4);
    }
    const ink=pg.textContent.trim().length;
    return [kind,i+1,Math.round(pr.width)+'x'+Math.round(pr.height),over,fill,outside,ink,cover].join('|');
  });
  document.body.setAttribute('data-m', rows.join(' ;; '));
});</script>`;
fs.writeFileSync(html, fs.readFileSync(html, 'utf8') + probe);
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!chrome) { console.error('Chrome not found (set CHROME_PATH)'); process.exit(1); }
const c = spawnSync(chrome, ['--headless', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom',
  'file:///' + html.split(path.sep).join('/')], { encoding: 'utf8', maxBuffer: 1 << 28 });
const m = /data-m="([^"]*)"/.exec(c.stdout || '');
if (!m) { console.error('no measurement came back from Chrome'); process.exit(1); }

let bad = 0;
for (const row of m[1].split(' ;; ')) {
  const [kind, n, size, over, fill, outside, ink, coverRaw] = row.replace(/&quot;/g, '"').split('|');
  const [cover, driftStr] = (coverRaw || '').split('@@');
  const drift = driftStr != null ? parseFloat(driftStr) : null;
  const problems = [];
  if (over && parseFloat(over) > 0.5) problems.push('COLUMNS OVERFLOW by ' + over + ' — content is being CLIPPED (break the page earlier)');
  if (+outside > 0) problems.push(outside + ' element(s) outside the sheet');
  if (+ink < 40 && kind !== 'music') problems.push('page is effectively EMPTY (' + ink + ' characters)');
  // 3 %: the generator measures with GDI+, the page is shaped by Chrome — the same face agrees to about a percent; another face does not
  if (kind === 'cov' && !cover) problems.push('the cover page has no text');
  if (cover && !(drift <= 0.03)) problems.push('the cover\'s face did NOT resolve (or the cover was not drawn by print/cover/make_cover.ps1): a line is drawn ' +
    (drift >= 9 ? 'with no measured width (data-w)' : (100 * drift).toFixed(1) + '% off the width the generator measured'));
  if (problems.length) bad++;
  console.log((problems.length ? '  FAIL ' : '  OK   ') + 'page ' + n + '  ' + kind + '  ' + size + 'px' +
    (fill ? '  columns ' + fill : '') + '  text ' + ink + ' chars' + (cover || ''));
  problems.forEach(p => console.log('       ' + p));
}
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(bad ? 'FAIL — ' + bad + ' page(s)' : 'PASS — the front matter fits, nothing clipped');
process.exit(bad ? 1 : 0);
