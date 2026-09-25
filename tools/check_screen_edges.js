#!/usr/bin/env node
// check_screen_edges.js — LGMF PLAN 2c.4: THE SCREEN'S PAGE EDGES, PROVEN, NOT LOOKED FOR.
//
// The composer, 2026-09-25 (RUNNING_LOG §340), on a whole note drawn with its sharp over the clef at 300 s: "the priority here is
// consistant end/begining of page … nothing in gutter … all of the notation gets pushed right so its beginning, left side, clears
// the left starting point … it all depends on go time indicators … this has to be pixel/time accurate". check_print_edges.js is the
// print's gate (D59); this is the screen's, built the same way:
//
//   node tools/check_screen_edges.js [--ir piece-lgmf] [--view video|zoom] [--verbose]
//
//   A. THE PLAN (arithmetic, instant) — from export_video's own --screenJson, so no geometry is re-derived here:
//        · the pages TILE the source window: the first opens at the source start, the last closes at its end, every seam
//          abuts to the bit, every window is the same span, t0 and tω at the same x on every page (the constant sweep).
//        · every drawn KIND carries an edge class (page_rules.edge) — the PLAN header's standing rule: a new notated class
//          with no entry is a red line here.
//        · the clamp report: how many units were clamped, the widest shift, and every FLAG — a clamped unit that lands on
//          its neighbour (his word: resolved case by case, never by a rule) or that has no go-time indicator of its own.
//          Flags are listed, not failures.
//
//   B. THE INK (measured in Chrome) — every page's SVG as the film draws it:
//        · nothing timed left of x(t0): every leaf in a system either lies right of x(t0), or is the gutter's furniture (a
//          label, the clef) lying ENTIRELY left of it. A cut kind lies in a clip whose rect is exactly [x(t0), x(tω)].
//        · nothing right of the FRAME (ink may enter the right margin, never leave the frame).
//        · every go-time indicator (go line · attack line · tick · GC impact) at x(t) to the pixel, and owned by its page.
//
// Exit 1 on any failure. A build gate.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const irId = arg('ir', 'piece-lgmf');
const viewMode = arg('view', 'video');
const verbose = process.argv.includes('--verbose');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'screenedges-'));
const planFile = path.join(tmp, 'screen.json'), html = path.join(tmp, 'pages.html');
let failures = 0;
const fail = m => { failures++; console.log('  FAIL  ' + m); };

// ---------------------------------------------------------------- A. the plan
const pj = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_video.js'), '--ir', irId, '--view', viewMode,
  '--screenJson', planFile, '--screenHtml', html], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (!fs.existsSync(planFile)) { console.error(pj.stdout || ''); console.error(pj.stderr || ''); process.exit(1); }
const P = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const pages = P.pages;
console.log('A. THE PLAN — ' + irId + ' · ' + viewMode + ' · ' + pages.length + ' pages' + (P.tile ? ', tiled' : '') +
  ' · music x ' + pages[0].x0 + ' → ' + pages[0].x1 + ' of ' + pages[0].widthPx);
if (!P.tile) fail('page_rules.screenPlan is not "tile" — the screen is still on the planned overlap');

const E6 = 1e-6;
if (Math.abs(pages[0].t0 - P.srcStart) > E6) fail('page 1 opens at ' + pages[0].t0 + ', not the source start ' + P.srcStart);
if (Math.abs(pages[pages.length - 1].t1 - P.srcEnd) > E6) fail('the last page closes at ' + pages[pages.length - 1].t1 + ', not the source end ' + P.srcEnd);
const span0 = pages[0].w1 - pages[0].w0;
for (let i = 0; i < pages.length; i++) {
  const p = pages[i];
  if (!(p.t1 > p.t0)) fail('page ' + p.n + ' holds nothing');
  if (i && p.t0 !== pages[i - 1].t1) fail('page ' + p.n + ' opens at ' + p.t0 + ' but page ' + pages[i - 1].n + ' closed at ' + pages[i - 1].t1 + ' — the seam does not abut');
  if (Math.abs(p.w0 - p.t0) > E6) fail('page ' + p.n + "'s window opens at " + p.w0 + ', not at its t0 ' + p.t0 + ' — a buffer or an overlap');
  if (Math.abs((p.w1 - p.w0) - span0) > E6) fail('page ' + p.n + ' spans ' + (p.w1 - p.w0) + ' s, page 1 ' + span0 + ' — the sweep is not constant');
  if (Math.abs(p.x0 - pages[0].x0) > E6 || Math.abs(p.x1 - pages[0].x1) > E6) fail('page ' + p.n + ' maps time onto ' + p.x0 + ' → ' + p.x1 + ', not page 1\'s');
}
if (!failures) console.log('   ok  the pages tile ' + P.srcStart + ' → ' + P.srcEnd + ' s: every seam abuts, every window ' + span0 + ' s, t0 and tω at the same x on every page');

// every drawn kind names its edge class
const CLASSES = new Set(['cut', 'clamp', 'atomic', 'furniture']);
const kinds = [...new Set([].concat(P.kinds.point, P.kinds.long, P.kinds.furniture, P.kinds.other, P.kindsInModel))].sort();
const noEdge = kinds.filter(k => !(P.edge && P.edge[k] && CLASSES.has(P.edge[k].screen)));
if (noEdge.length) fail(noEdge.length + ' drawn kind(s) carry no edge class in page_rules.edge: ' + noEdge.join(' · '));
else console.log('   ok  every drawn kind (' + kinds.length + ') carries its edge class');

// the clamp report
const clamps = pages.flatMap(p => p.clamps.map(c => Object.assign({ page: p.n }, c)));
const collide = clamps.filter(c => c.collidesPx > 0), noGo = clamps.filter(c => !c.goLine);
console.log('   ok  ' + clamps.length + ' unit(s) clamped' + (clamps.length ? ', the widest shift ' + Math.max(...clamps.map(c => c.shiftPx)).toFixed(1) + ' px' : ''));
for (const c of collide) console.log('  FLAG  page ' + c.page + ' part ' + c.part + ' @' + c.t.toFixed(3) + ' s: the clamped unit (+' + c.shiftPx + ' px) reaches its neighbour by ' + c.collidesPx + ' px');
if (noGo.length) console.log('  FLAG  ' + noGo.length + ' clamped unit(s) have no go-time indicator of their own — the shift moves where the eye reads the time: ' +
  noGo.slice(0, 8).map(c => 'p' + c.page + ' part ' + c.part + ' @' + c.t.toFixed(2) + ' +' + c.shiftPx).join(' · ') + (noGo.length > 8 ? ' …' : ''));

// ---------------------------------------------------------------- B. the ink
console.log('B. THE INK — measuring ' + pages.length + ' pages in Chrome (' + (fs.statSync(html).size / 1024 / 1024).toFixed(1) + ' MB) …');
const probe = `
<script>addEventListener('load',()=>{
  const rows=[...document.querySelectorAll('.page')].map((pg,i)=>{
    const P=PAGES[i], svg=pg.querySelector('svg');
    if(!svg) return JSON.stringify({n:i+1,missing:1});
    const R=svg.getBoundingClientRect(), k=svg.viewBox.baseVal.width/R.width;
    const box=el=>{const b=el.getBoundingClientRect();return [(b.left-R.left)*k,(b.right-R.left)*k,b.width*k,b.height*k];};
    const X0=P.x0, W=P.widthPx, T=0.5;
    const res={n:i+1,leaves:0,cut:0,furn:0,straddle:[],gutter:[],pastFrame:[],go:0,goOff:[],goUnowned:[],clip:null,maxRight:-1e9};
    const cr=svg.querySelector('clipPath rect');
    if(cr) res.clip=[+cr.getAttribute('x'),+cr.getAttribute('x')+(+cr.getAttribute('width'))];
    const xOf=t=>P.x0+(t-P.w0)*P.pps;
    for(const sys of svg.querySelectorAll('g[class^="sys sys-"]')){
      for(const el of sys.querySelectorAll('*')){
        if(el.children.length) continue;
        const [L,Rt,Wd,Ht]=box(el);
        if(Wd<=0&&Ht<=0) continue;
        res.leaves++;
        const go=el.getAttribute('data-go');
        if(go!==null){
          res.go++;
          const t=+go, tag=el.tagName;
          const x= tag==='line' ? +el.getAttribute('x1') : tag==='circle' ? +el.getAttribute('cx') : (+el.getAttribute('x'))+(+el.getAttribute('width'))/2;
          if(Math.abs(x-xOf(t))>0.01) res.goOff.push(t.toFixed(3)+':'+(x-xOf(t)).toFixed(3));
          const isGc=el.getAttribute('class')==='gc-impact';
          const own= isGc ? ((t>P.w0+1e-9||P.first) && t<=P.w1+1e-9) : (t>=P.w0-1e-9 && (P.ownsEnd ? t<=P.w1+1e-9 : t<P.w1-1e-9));
          if(!own) res.goUnowned.push(t.toFixed(3));
          if(Rt>res.maxRight) res.maxRight=Rt;
          if(Rt>W+T) res.pastFrame.push('go@'+t.toFixed(2));
          continue;
        }
        if(el.closest('.tw-cut')){ res.cut++; continue; }   // clipped to [x(t0), x(tω)] — the clip rect is checked once below
        if(Rt>res.maxRight) res.maxRight=Rt;
        if(Rt>W+T) res.pastFrame.push(el.tagName+'@'+Rt.toFixed(1));
        const furniture = el.closest('.clef') || el.tagName==='text';
        if(L<X0-T){
          if(furniture && Rt<=X0+T){ res.furn++; continue; }
          if(Rt>X0+T) res.straddle.push(el.tagName+(furniture?'(furniture)':'')+' '+L.toFixed(1)+'→'+Rt.toFixed(1));
          else res.gutter.push(el.tagName+' '+L.toFixed(1)+'→'+Rt.toFixed(1));
        }
      }
    }
    return JSON.stringify(res);
  });
  document.body.setAttribute('data-e', encodeURIComponent('['+rows.join(',')+']'));
});</script>`;
const inject = '<script>const PAGES=' + JSON.stringify(pages.map(p => ({ x0: p.x0, x1: p.x1, w0: p.w0, w1: p.w1, pps: p.pps, widthPx: p.widthPx, first: p.first, ownsEnd: p.ownsEnd }))) + ';</script>';
fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('</body>', inject + probe + '</body>'));
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null]
  .filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!chrome) { console.error('Chrome not found (set CHROME_PATH)'); process.exit(1); }
const c = spawnSync(chrome, ['--headless', '--disable-gpu', '--virtual-time-budget=240000', '--dump-dom',
  'file:///' + html.split(path.sep).join('/')], { encoding: 'utf8', maxBuffer: 1 << 30 });
const m = /data-e="([^"]*)"/.exec(c.stdout || '');
if (!m) { console.error('no measurement came back from Chrome'); console.error((c.stderr || '').slice(0, 800)); process.exit(1); }
const rows = JSON.parse(decodeURIComponent(m[1]));
if (rows.length !== pages.length) fail('measured ' + rows.length + ' pages, the plan has ' + pages.length);
let leaves = 0, cut = 0, go = 0, furn = 0, maxRight = -1e9;
for (const r of rows) {
  const p = pages[r.n - 1];
  if (r.missing) { fail('page ' + r.n + ' has no SVG'); continue; }
  leaves += r.leaves; cut += r.cut; go += r.go; furn += r.furn; maxRight = Math.max(maxRight, r.maxRight);
  const bad = [];
  if (r.cut && !r.clip) bad.push(r.cut + ' cut leaves but no clip');
  if (r.clip && (Math.abs(r.clip[0] - p.x0) > 0.01 || Math.abs(r.clip[1] - p.x1) > 0.01)) bad.push('the clip is ' + r.clip.join(' → ') + ', not [x(t0), x(tω)] ' + p.x0 + ' → ' + p.x1);
  if (r.straddle.length) bad.push(r.straddle.length + ' element(s) straddle x(t0): ' + r.straddle.slice(0, 4).join(' · '));
  if (r.gutter.length) bad.push(r.gutter.length + ' timed element(s) in the gutter: ' + r.gutter.slice(0, 4).join(' · '));
  if (r.pastFrame.length) bad.push(r.pastFrame.length + ' element(s) past the frame: ' + r.pastFrame.slice(0, 4).join(' · '));
  if (r.goOff.length) bad.push(r.goOff.length + ' go-time indicator(s) off x(t): ' + r.goOff.slice(0, 4).join(' · '));
  if (r.goUnowned.length) bad.push(r.goUnowned.length + ' go-time indicator(s) not owned by this page: ' + r.goUnowned.slice(0, 4).join(' · '));
  if (bad.length) fail('page ' + r.n + ' [' + p.w0.toFixed(2) + ' – ' + p.w1.toFixed(2) + ' s]  ' + bad.join(' · '));
  else if (verbose) console.log('   ok  page ' + r.n + '  leaves ' + r.leaves + ' · cut ' + r.cut + ' · go ' + r.go + ' · furniture ' + r.furn + ' · right ' + r.maxRight.toFixed(1));
}
if (!failures) {
  console.log('   ok  ' + leaves + ' leaves measured: nothing timed left of x(t0) on any page (' + furn + ' furniture leaves in the gutter), ' + cut + ' inside the page clip');
  console.log('   ok  nothing past the frame — the rightmost ink at x ' + maxRight.toFixed(1) + ' of ' + pages[0].widthPx + ' (the staff ends at ' + pages[0].x1 + ')');
  console.log('   ok  ' + go + ' go-time indicators, every one at x(t) to the pixel and on the page that owns it');
}
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* the temp dir is not the point */ }
console.log(failures ? '\ncheck_screen_edges: ' + failures + ' FAILURE(S)' : '\ncheck_screen_edges: PASS');
process.exit(failures ? 1 : 0);
