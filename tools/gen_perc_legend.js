#!/usr/bin/env node
// gen_perc_legend.js — the Percussion Legend's image for the Performance Instructions
// (docs/notation_instructions/; RUNNING_LOG §746, 2026-10-02 — his word: "the image of the
// percussion staff with the full names of the instruments spelled out in the header").
//
// The staff is THE SCORE'S OWN: tools/capture_lane.js cuts an empty stretch of the percussion
// lane from the zoomed presentation score, with its gutter (the short names as the score shows
// them). Then, here: the brace is removed (it joins the vibraphone's staff, which is not in the
// picture), the crop is tightened to the seven lines, and the FULL names are written left of the
// short ones — so the legend reads  full name · short name · the instrument's line.
// The only beater named is the temple bowl's brush (his word); the rest are the player's choice.
//
//   node tools/gen_perc_legend.js        → docs/notation_instructions/images/percussion_legend.svg
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = 'docs/notation_instructions/images/percussion_legend.svg';
const FULL = { SlBl: 'Sleigh bells', Cast: 'Castanets', Tamb: 'Tambourine', TemBwl: 'Temple bowl (brush)', WB: 'Wood block', BrDr: 'Brake drum', BD: 'Bass drum' };
const PAD_L = 170, PAD_Y = 34;   // px of the zoomed frame: room for the full names · air above and below the staff

execFileSync(process.execPath, [path.join(__dirname, 'capture_lane.js'), '--part', 'perc', '--t', '294',
  '--span', '299.02:299.95', '--gutter', '--padTop', '14', '--padBot', '14', '--out', OUT], { stdio: 'inherit' });
let s = fs.readFileSync(path.join(ROOT, OUT), 'utf8');

// the brace group holds its path inside a nested <g transform>: take the nested groups with it
const braceRe = /<g class="sysgrp sysgrp-brace"[^>]*>\s*(?:<g[^>]*>[\s\S]*?<\/g>\s*)*<\/g>/;
if (!braceRe.test(s)) { console.error('gen_perc_legend: the brace group was not found'); process.exit(1); }
s = s.replace(braceRe, '');
const names = [...s.matchAll(/<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"([^>]*)>([^<]+)<\/text>/g)]
  .filter(m => FULL[m[5]]);
if (names.length !== Object.keys(FULL).length) { console.error('gen_perc_legend: found ' + names.length + ' of the 7 short names'); process.exit(1); }
const vb = /<svg[^>]*viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"[^>]*>/.exec(s);
const x0 = +vb[1], w = +vb[3];
const ys = names.map(m => +m[2]), fs0 = +names[0][3];
const ny0 = Math.min(...ys) - fs0 * 0.35 - PAD_Y, nh = Math.max(...ys) - Math.min(...ys) + 2 * PAD_Y;
const nx0 = x0 - PAD_L, nw = w + PAD_L;
const full = names.map(m => '<text x="' + (x0 - 14) + '" y="' + m[2] + '" text-anchor="end" font-size="' + (fs0 * 1.08).toFixed(1) +
  '" font-family="\'Crimson Pro Light\', serif" fill="#222">' + FULL[m[5]] + '</text>').join('\n');
s = s.replace(vb[0], '<svg xmlns="http://www.w3.org/2000/svg" width="' + nw.toFixed(0) + '" height="' + nh.toFixed(0) +
  '" viewBox="' + nx0.toFixed(1) + ' ' + ny0.toFixed(1) + ' ' + nw.toFixed(1) + ' ' + nh.toFixed(1) + '">' +
  '<rect x="' + nx0.toFixed(1) + '" y="' + ny0.toFixed(1) + '" width="' + nw.toFixed(1) + '" height="' + nh.toFixed(1) + '" fill="#fff"/>');
s = s.replace('</svg>', '<rect x="' + nx0.toFixed(1) + '" y="' + ny0.toFixed(1) + '" width="' + PAD_L + '" height="' + nh.toFixed(1) +
  '" fill="#fff"/>\n<g class="legend-names">\n' + full + '\n</g></svg>');
fs.writeFileSync(path.join(ROOT, OUT), s);
console.log('wrote ' + OUT + '  (' + nw.toFixed(0) + 'x' + nh.toFixed(0) + ' · --w ' + nw.toFixed(0) + ' = ' + (100 * nw / 1920).toFixed(1) + ' % of the frame)');
