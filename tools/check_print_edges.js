#!/usr/bin/env node
// check_print_edges.js — PLAN 2b.7.5: THE PAGE EDGES, PROVEN, NOT LOOKED FOR.
//
// The composer, on the first whole 66-page PDF: "what can we do about these edge
// cases … lets find a solution that will resolve them all, try to find robust
// solution that will fix all and not result in continuous reprinting and
// reviewing and redoing". D59 is the rule that resolves them; THIS is the part
// that keeps them resolved. An edge case is now a red line in the build, not
// something found by paging through 68 sheets.
//
//   node tools/check_print_edges.js [--ir piece-lgmf] [--verbose]
//
// TWO PASSES, because the two faults live in different places.
//
//   A. THE PLAN (arithmetic, instant). From export_print's own --planJson, so
//      the reserves and the A3 block are never re-derived here — a checker that
//      recomputes the geometry checks its own arithmetic, not the exporter's.
//        · the pages TILE the source window: no gap, no overlap, every cut
//          advancing. A page owns [cut, next cut); the last owns its end.
//        · every point item is owned by EXACTLY ONE page — the 129 doubled
//          onsets of §613 were this test failing.
//        · no page owns nothing, and no beam is severed by a cut.
//        · no LONG item (curve, ring bar) is drawn on a page it does not CROSS — the
//          trill stubs he found in a right reserve on piano p7 and cello p14.
//
//   B. THE INK (measured in Chrome, ~2 min). The rendered pages themselves:
//        · nothing TIMED in the clef gutter. Anything reaching left of the
//          gutter must lie ENTIRELY left of it — that is furniture (the clef,
//          the part label). An arc that straddles the gutter edge is the fault.
//        · no ink right of the SYSTEM END (the cut + the right reserve, 2b.7.4).
//        · every GC arc is WHOLE: the arcs and impact dots a page draws equal
//          the strikes it owns, and each arc lies inside [gutter, system end].
//
// Exit 1 on any failure. It is a build gate in print/score/build.sh.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-lgmf');
const verbose = process.argv.includes('--verbose');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'printedges-'));
const planFile = path.join(tmp, 'plan.json');
const html = path.join(tmp, 'all.html');
let failures = 0;
const fail = m => { failures++; console.log('  FAIL  ' + m); };

// ---------------------------------------------------------------- A. the plan
const pj = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'),
  '--ir', irId, '--quiet', '--planJson', planFile], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (!fs.existsSync(planFile)) { console.error(pj.stdout || ''); console.error(pj.stderr || ''); process.exit(1); }
const P = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const pages = P.pages;

console.log('A. THE PLAN — ' + pages.length + ' pages, ' + P.pointTotal + ' point items, ' +
  'reserves ' + P.leftReserve.toFixed(3) + ' / ' + P.rightReserve.toFixed(3) + ' s');

// the pages tile the source window
if (Math.abs(pages[0].t0 - P.srcStart) > 1e-6) fail('page 1 starts at ' + pages[0].t0.toFixed(3) + ', not the source start ' + P.srcStart.toFixed(3));
if (Math.abs(pages[pages.length - 1].t1 - P.srcEnd) > 1e-6) fail('the last page ends at ' + pages[pages.length - 1].t1.toFixed(3) + ', not the source end ' + P.srcEnd.toFixed(3));
for (let i = 0; i < pages.length; i++) {
  const p = pages[i];
  if (!(p.t1 > p.t0 + 1e-9)) fail('page ' + p.n + ' owns nothing: [' + p.t0 + ', ' + p.t1 + ')');
  if (i && Math.abs(p.t0 - pages[i - 1].t1) > 1e-6) fail('page ' + p.n + ' starts at ' + p.t0.toFixed(3) +
    ' but page ' + pages[i - 1].n + ' ended at ' + pages[i - 1].t1.toFixed(3) + ' — a gap or an overlap');
  if (p.severed) fail('page ' + p.n + "'s cut severs " + p.severed + ' beamable pair(s)');
  // the drawn ink must never run past the window, and the window must hold the reserves
  if (p.inkEnd > p.w1 + 1e-6) fail('page ' + p.n + ' draws to ' + p.inkEnd.toFixed(3) + ', past its window end ' + p.w1.toFixed(3));
  if (p.t0 - p.w0 < P.leftReserve - 1e-6 && p.w0 > P.srcStart + 1e-9)
    fail('page ' + p.n + ' opens only ' + (p.t0 - p.w0).toFixed(3) + ' s before its cut (reserve ' + P.leftReserve.toFixed(3) + ')');
}
// EXACTLY ONCE: the owned counts must add up to the whole census
const owned = pages.reduce((a, p) => a + p.points, 0);
if (owned !== P.pointTotal) fail('the pages own ' + owned + ' point items but the score has ' + P.pointTotal +
  ' — ' + Math.abs(owned - P.pointTotal) + ' drawn twice or not at all');
else console.log('   ok  every point item owned exactly once (' + owned + ')');

// A LONG ITEM BELONGS TO THE PAGES IT CROSSES — crosses what the page OWNS, not what the
// page draws. His eye on the first 2b.7 render, 2026-09-17: "pg 2 in piano, extra from next
// page trill ; vc pg 14" — a trill beginning on the cut left a stub of its curve in the
// previous page's right reserve, and one ending in a left reserve left a stub there. 19 of
// them on 9 pages. The first checker did not look for this, which is why he had to.
if (P.longMalformed && P.longMalformed.length)
  fail(P.longMalformed.length + ' long item(s) have no bounds, so the ownership census cannot see them: ' + P.longMalformed.slice(0, 6).join(' · '));
// The FAULT is not that curves fall in a reserve — that is just where the music is. The
// fault is drawing them. So the plan states what each page SHOULD carry and pass B counts
// the paths actually on it; the number below is only how much there was to get wrong.
const inReserve = pages.reduce((a, p) => a + p.inReserveOnly, 0);
console.log('   ok  ' + P.longTotal + ' long items (' + JSON.stringify(P.longByKind).replace(/[{}"]/g, '').replace(/,/g, ' ') +
  ');  ' + inReserve + ' lie in a reserve without crossing the page that draws it — pass B proves none of them inks');

const ragged = pages.slice(0, -1).map(p => p.w1 - p.inkEnd);
console.log('   ok  ' + ragged.filter(g => g > 0.5).length + ' pages end more than 0.5 s early, at most ' +
  Math.max(...ragged).toFixed(2) + ' s (' + (100 * Math.max(...ragged) / P.pageSeconds).toFixed(0) + '% of the width)' +
  '   [2b.7.4, his "a"]');

// ---------------------------------------------------------------- B. the ink
console.log('B. THE INK — rendering ' + pages.length + ' pages …');
const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), '--ir', irId,
  '--htmlOnly', '--quiet', '--out', html], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (!fs.existsSync(html)) { console.error(r.stdout || ''); console.error(r.stderr || ''); process.exit(1); }
console.log('  ' + (fs.statSync(html).size / 1024 / 1024).toFixed(1) + ' MB of HTML; measuring in Chrome …');

// The probe measures in the SVG's OWN units (the viewBox), so the numbers can be
// compared with the plan's gutterPx and xInk directly.
const probe = `
<script>addEventListener('load',()=>{
  const rows=[...document.querySelectorAll('.page')].map((pg,i)=>{
    const mus=pg.querySelector('.mus svg');
    if(!mus) return [i+1,'','','','',''].join('|');
    const R=mus.getBoundingClientRect();
    const k=mus.viewBox.baseVal.width/R.width;
    const box=el=>{const b=el.getBoundingClientRect();return [(b.left-R.left)*k,(b.right-R.left)*k,b.width*k];};
    let arcs=0,dots=0,maxRight=-1e9,straddle=0,gutterOnly=0,arcOut=0,cGreen=0,cOrange=0;
    for(const sys of mus.querySelectorAll('g[class^="sys sys-"]')){
      // LEAVES only: a nested <g> would be counted twice, and its box is its children's union anyway
      for(const el of sys.querySelectorAll('*')){
        if(el.children.length) continue;
        const cls=el.getAttribute('class')||'';
        if(cls==='gc-arc') arcs++;
        if(cls==='gc-impact') dots++;
        // a D42 curve is ONE path, filled in its own colour (render.js curvePathD42)
        const f=el.getAttribute('fill');
        if(el.tagName==='path'&&f===CGREEN) cGreen++;
        if(el.tagName==='path'&&f===CORANGE) cOrange++;
        const [L,Rt,W]=box(el);
        if(W<=0&&Rt<=0) continue;                  // nothing drawn
        if(Rt>maxRight) maxRight=Rt;
        if(L<GUT-0.5){ if(Rt>GUT+0.5) straddle++; else gutterOnly++; }
        if(cls==='gc-arc'&&(L<GUT-0.5||Rt>XINK+1.5)) arcOut++;
      }
    }
    return [i+1,arcs,dots,maxRight.toFixed(2),straddle,gutterOnly,arcOut,cGreen,cOrange].join('|');
  });
  document.body.setAttribute('data-e', rows.join(' ;; '));
});</script>`;
const GUT = P.gutterPx;
// xInk differs per page (the ragged edge), so it is injected as a lookup the probe reads by index
const inject = '<script>const GUT=' + GUT + ';const XINKS=' + JSON.stringify(pages.map(p => +p.xInk.toFixed(3))) +
  ';const CGREEN=' + JSON.stringify(P.curveColorGreen) + ';const CORANGE=' + JSON.stringify(P.curveColorOrange) + ';</script>';
fs.writeFileSync(html, fs.readFileSync(html, 'utf8') + inject +
  probe.replace('const R=mus.getBoundingClientRect();', 'const R=mus.getBoundingClientRect();const XINK=XINKS[i];'));

const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null]
  .filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!chrome) { console.error('Chrome not found (set CHROME_PATH)'); process.exit(1); }
const c = spawnSync(chrome, ['--headless', '--disable-gpu', '--virtual-time-budget=240000', '--dump-dom',
  'file:///' + html.split(path.sep).join('/')], { encoding: 'utf8', maxBuffer: 1 << 30 });
const m = /data-e="([^"]*)"/.exec(c.stdout || '');
if (!m) { console.error('no measurement came back from Chrome'); console.error((c.stderr || '').slice(0, 800)); process.exit(1); }

const rows = m[1].split(' ;; ').map(s => s.split('|'));
if (rows.length !== pages.length) fail('measured ' + rows.length + ' pages, the plan has ' + pages.length);
let arcTotal = 0, dotTotal = 0;
for (const row of rows) {
  const n = +row[0], p = pages[n - 1];
  if (!p) continue;
  const [arcs, dots, maxRight, straddle, gutterOnly, arcOut, cGreen, cOrange] =
    [+row[1], +row[2], +row[3], +row[4], +row[5], +row[6], +row[7], +row[8]];
  arcTotal += arcs; dotTotal += dots;
  const bad = [];
  if (straddle) bad.push(straddle + ' element(s) straddle the clef gutter');
  if (arcs !== p.gc) bad.push(arcs + ' arcs drawn, ' + p.gc + ' strikes owned');
  if (dots !== arcs) bad.push(arcs + ' arcs but ' + dots + ' impact dots — an arc is not whole');
  if (arcOut) bad.push(arcOut + ' arc(s) reach outside [gutter, system end]');
  // HIS EYE, 2026-09-17: a trill's curve drawn on the page BEFORE the one that owns it
  if (cGreen !== p.curvesGreen) bad.push(cGreen + ' limeGreen curves drawn, ' + p.curvesGreen + ' cross this page' +
    (p.inReserveOnly ? '  (' + p.inReserveOnlyDetail.join(' · ') + ' lie in a reserve)' : ''));
  if (cOrange !== p.curvesOrange) bad.push(cOrange + ' brightOrange curves drawn, ' + p.curvesOrange + ' cross this page');
  if (maxRight > p.xInk + 1.5) bad.push('ink to x=' + maxRight.toFixed(1) + ', past the system end ' + p.xInk.toFixed(1));
  if (bad.length) fail('page ' + n + '  ' + bad.join(' · '));
  else if (verbose) console.log('   ok  page ' + n + '  arcs ' + arcs + '  right edge ' + maxRight.toFixed(1) +
    '/' + p.xInk.toFixed(1) + '  gutter furniture ' + gutterOnly);
}
const gcPlan = pages.reduce((a, p) => a + p.gc, 0);
if (!failures) {
  console.log('   ok  no timed ink in the clef gutter, none past the system end, on all ' + pages.length + ' pages');
  console.log('   ok  ' + arcTotal + ' GC arcs and ' + dotTotal + ' impact dots = ' + gcPlan + ' owned strikes');
  console.log('   ok  every page draws exactly the curves that cross it — ' +
    pages.reduce((a, p) => a + p.curvesGreen + p.curvesOrange, 0) + ' curve paths, none from a neighbouring page');
}

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* the temp dir is not the point */ }
console.log(failures ? '\ncheck_print_edges: ' + failures + ' FAILURE(S)' : '\ncheck_print_edges: PASS');
process.exit(failures ? 1 : 0);
