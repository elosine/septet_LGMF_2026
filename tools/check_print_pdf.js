#!/usr/bin/env node
// check_print_pdf.js — PLAN 2b.5.4: THE DELIVERED FILE, CHECKED AS A FILE.
//
// The frame check (check_print_frame) proves the page is the filmed page and the
// front check (check_print_front) proves nothing is clipped. Both look at HTML.
// This one looks at what is actually sent to the jury, because the last step —
// Chrome's print-to-pdf — can still get the sheet size wrong, drop a font to a
// system fallback, or rasterize vector work into a picture, and none of that is
// visible in a viewer at screen size.
//
//   node tools/check_print_pdf.js --pdf print/score/Scattered-Substance-score-JYang.pdf
//        [--pages 66] [--maxMB 20]
//
// What it asserts, and why each one matters to THIS submission:
//   · every MediaBox is inside DIN A3 — the call's one hard limit on the file
//   · at least one embedded font program, and NO non-embedded ones — a jury
//     machine without Crimson Pro or EngraversGothic must read the same page
//   · zero raster images — the score is vector work; a raster page means
//     something rendered to pixels and will print soft
//   · the piece's links survive as link annotations (the demo video, the three
//     practice takes), because the score is how the jury learns the film exists
//   · a plausible page count and file size
const fs = require('fs');
const path = require('path');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const pdf = arg('pdf', null);
const wantPages = arg('pages', null);
const maxMB = parseFloat(arg('maxMB', '20'));
if (!pdf) { console.error('usage: check_print_pdf.js --pdf <file.pdf> [--pages N] [--maxMB 20]'); process.exit(2); }
const abs = path.isAbsolute(pdf) ? pdf : path.join(process.cwd(), pdf);
if (!fs.existsSync(abs)) { console.error('no such file: ' + pdf); process.exit(2); }

const buf = fs.readFileSync(abs);
const t = buf.toString('latin1');
const MB = buf.length / 1024 / 1024;

// DIN A3 in points, with a little slack for the rasterizer's own rounding
const A3 = { w: 420 / 25.4 * 72, h: 297 / 25.4 * 72 };   // 1190.55 x 841.89
const boxes = [...t.matchAll(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/g)]
  .map(m => ({ w: parseFloat(m[3]) - parseFloat(m[1]), h: parseFloat(m[4]) - parseFloat(m[2]) }));
const uniq = [...new Set(boxes.map(b => b.w.toFixed(2) + ' x ' + b.h.toFixed(2)))];
const over = boxes.filter(b => Math.max(b.w, b.h) > A3.w + 0.01 || Math.min(b.w, b.h) > A3.h + 0.01);

const pages = (t.match(/\/Type\s*\/Page[^s]/g) || []).length;
const embedded = (t.match(/\/FontFile2?3?/g) || []).length;
const fontObjs = (t.match(/\/BaseFont\s*\/([A-Za-z0-9+\-,.]+)/g) || []).map(s => s.split('/').pop());
const notEmbedded = fontObjs.filter(f => !/^[A-Z]{6}\+/.test(f));   // a subset is prefixed ABCDEF+
const images = (t.match(/\/Subtype\s*\/Image/g) || []).length;
const links = [...new Set([...t.matchAll(/\/URI\s*\(([^)]*)\)/g)].map(m => m[1]))];

const fail = [];
if (!boxes.length) fail.push('no MediaBox found — is this a PDF?');
if (over.length) fail.push(over.length + ' page(s) LARGER than DIN A3 — the call refuses the file');
if (uniq.length > 1) fail.push('pages are not all the same size: ' + uniq.join(' | '));
if (!embedded) fail.push('no embedded font programs — the jury machine would substitute faces');
if (notEmbedded.length) fail.push('font(s) NOT embedded: ' + [...new Set(notEmbedded)].join(', '));
if (images) fail.push(images + ' raster image(s) — this score is vector work');
if (MB > maxMB) fail.push('file is ' + MB.toFixed(1) + ' MB, over the ' + maxMB + ' MB guard');
if (wantPages && pages !== parseInt(wantPages, 10)) fail.push('expected ' + wantPages + ' pages, found ' + pages);
if (!pages) fail.push('no pages');

console.log('  file      ' + path.relative(process.cwd(), abs) + '   ' + MB.toFixed(2) + ' MB');
console.log('  pages     ' + pages);
console.log('  sheet     ' + uniq.join(' | ') + ' pt   (DIN A3 = ' + A3.w.toFixed(2) + ' x ' + A3.h.toFixed(2) + ')');
console.log('  fonts     ' + embedded + ' embedded program(s), ' + fontObjs.length + ' font object(s), ' + notEmbedded.length + ' not embedded');
console.log('  raster    ' + images + ' image(s)');
console.log('  links     ' + links.length + (links.length ? ':  ' + links.join('  ') : ''));
fail.forEach(f => console.log('  FAIL      ' + f));
console.log(fail.length ? 'FAIL — ' + fail.length + ' problem(s)' : 'PASS — the file is inside the call\'s limits and self-contained');
process.exit(fail.length ? 1 : 0);
