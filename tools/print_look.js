#!/usr/bin/env node
// print_look.js — LOOK AT A PRINT PAGE (PLAN 2b-P, 2026-10-03). One PNG per page, through headless Chrome.
//
// Why: the print score is a PDF, and on this machine nothing rasterizes a PDF (no pdftoppm — the AI's Read tool cannot show one).
// The page is HTML before Chrome prints it, so this screenshots that HTML: the exporter's own pages, one .page per shot, at the
// sheet's own pixel size. It is how the proof pages of 2b-P were looked at before he was asked to (RUNNING_LOG §766 · §768).
//
//   node tools/print_look.js <outPrefix> [--scale 1.25] -- <export_print args that SELECT the pages>
//   node tools/print_look.js C:/tmp/p -- --ir piece-lgmf --at 0,300            -> C:/tmp/p-1.png, C:/tmp/p-2.png
//   node tools/print_look.js C:/tmp/f --scale 1.25 -- --ir piece-lgmf --cover on --instructions on --pages 1
//
// --htmlOnly, --quiet and --out are added here. Write the PNGs OUTSIDE the repository (a scratch folder): they are for looking.
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const dd = process.argv.indexOf('--');
const outPrefix = process.argv[2];
if (!outPrefix || dd < 0) { console.error('usage: print_look.js <outPrefix> [--scale N] -- <export_print args>'); process.exit(2); }
const si = process.argv.indexOf('--scale');
const scale = si > 0 && si < dd ? process.argv[si + 1] : '1';
const rest = process.argv.slice(dd + 1);
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null]
  .filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!chrome) { console.error('Chrome not found (set CHROME_PATH)'); process.exit(1); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'printlook-'));
const html = path.join(tmp, 'all.html');
const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'export_print.js'), ...rest, '--htmlOnly', '--quiet', '--out', html],
  { encoding: 'utf8', maxBuffer: 1 << 28 });
if (r.stderr && r.stderr.trim()) console.error(r.stderr.trim());
if (!fs.existsSync(html)) { console.error(r.stdout || ''); process.exit(1); }
const src = fs.readFileSync(html, 'utf8');
const at = src.indexOf('<div class="page');
const head = src.slice(0, at);
const pages = src.slice(at).split(/\n(?=<div class="page)/);
const m = /\.page\{position:relative;width:([\d.]+)px;height:([\d.]+)px/.exec(head);
const W = Math.ceil(parseFloat(m[1])), H = Math.ceil(parseFloat(m[2]));
pages.forEach((pg, i) => {
  const one = path.join(tmp, 'p' + i + '.html');
  fs.writeFileSync(one, head + pg);
  const png = outPrefix + '-' + (i + 1) + '.png';
  spawnSync(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=' + scale,
    '--window-size=' + W + ',' + H, '--screenshot=' + png, 'file:///' + one.split(path.sep).join('/')], { encoding: 'utf8' });
  console.log(png + (fs.existsSync(png) ? '  ' + (fs.statSync(png).size / 1024).toFixed(0) + ' KB' : '  FAILED'));
});
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
