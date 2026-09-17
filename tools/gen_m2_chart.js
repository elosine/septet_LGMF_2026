#!/usr/bin/env node
// gen_m2_chart.js — the SPECTRAL morph (M2) figure for the Performance Instructions:
// the start chord (left) glissing onto the B♭ harmonic series (right), one arrow
// per voice, the voices already on the series holding. Session 14, 2026-09-16
// (RUNNING_LOG §571–§574).
//
// DATA: the MAIN IR's D45 morph headers (notation/ir/piece-lgmf.ir.json), i.e.
// the save's truth through the extractor — nothing typed in by hand. The sounding
// pitch is the header's q (midi × 2; the spelling can be the written, transposed
// form), the travel its travelC and dir. The partial numbers are found against
// the fundamental the panel's root box held for M2 (A♯2 = 46, RUNNING_LOG §465).
// LOOK: the tuba's beating chart (gen_beating_chart.js): Georgia, ink / muted /
// grid greys, letter-spaced headers, one orange accent.
//
//   node tools/gen_m2_chart.js [--ir piece-lgmf] [--root 46]
//        [--out docs/notation_instructions/images/m2_spectral_chart.svg]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const irId = arg('ir', 'piece-lgmf');
const out = arg('out', 'docs/notation_instructions/images/m2_spectral_chart.svg');
const FUND = parseInt(arg('root', '46'), 10);
const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', irId + '.ir.json'), 'utf8'));
const NAMES = ['flute', 'bass clarinet', 'piano', 'violin 1', 'violin 2', 'viola', 'cello'];
const PC = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// ---- the voices, from the second morph's headers (t > 300 s) ----
const heads = ir.overlays.filter(o => o.kind === 'header' && o.target.t > 300);
if (!heads.length) { console.error('gen_m2_chart: no morph headers after 300 s in ' + irId); process.exit(1); }
let voices = heads.map(o => {
  const v = o.value;
  const m0 = v.q[0] / 2;
  const m1 = m0 + (v.dir || 1) * v.travelC / 100;
  return { part: o.target.part, name: NAMES[o.target.part], m0, m1, holds: !!v.oneHead };
}).sort((a, b) => a.m0 - b.m0 || a.part - b.part);

// voices that travel together (same start, same end within 2 c) share one arrow
const merged = [];
for (const v of voices) {
  const m = merged.find(g => Math.abs(g.m0 - v.m0) < 0.01 && Math.abs(g.m1 - v.m1) < 0.02 && g.holds === v.holds);
  if (m) m.names.push(v.name); else merged.push(Object.assign({ names: [v.name] }, v));
}

// ---- pitch naming: ET name; the destination as its partial of FUND, spelled per D45 (nearest quarter-tone sign + cents) ----
const etName = m => PC[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1);
const partialOf = m => {
  let best = null;
  for (let n = 1; n <= 32; n++) {
    const exact = FUND + 12 * Math.log2(n);
    const k = Math.round((m - exact) / 12);
    const d = Math.abs(m - (exact + 12 * k));
    if (d < 0.3 && (!best || d < best.d)) best = { n, d, exact: exact + 12 * k };
  }
  return best;
};
const ordinal = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
const isOctave = n => (n & (n - 1)) === 0;
const d45 = exact => {
  const et = Math.round(exact), dev = Math.round((exact - et) * 100);
  const q = Math.round(dev / 50) * 50, res = dev - q;
  const base = PC[((et % 12) + 12) % 12], oct = Math.floor(et / 12) - 1;
  const sign = q === 0 ? '' : q < 0 ? ' half-flat' : ' half-sharp';
  return base + (sign ? sign + ' ' : '') + oct + (Math.abs(res) >= 2 ? ' (' + (res > 0 ? '+' : '−') + Math.abs(res) + ' c)' : '');
};
const destLabel = g => {
  const p = partialOf(g.m1);
  if (!p) return d45(g.m1) + ' · not on the series';
  return d45(p.exact) + ' · ' + (isOctave(p.n) ? 'the fundamental' : ordinal(p.n) + ' partial');
};

// ---- geometry (the tuba chart's idiom) ----
const W = 860, LX = 250, RX = 560, TOP = 46, BOT = 30, PX = 12;
const all = merged.flatMap(g => [g.m0, g.m1]);
const maxM = Math.ceil(Math.max(...all)) + 2, minM = Math.floor(Math.min(...all)) - 2;
const Y = m => TOP + (maxM - m) * PX;
const HGT = Y(minM) + BOT;
const INK = '#222', MUT = '#777', GRID = '#d8d8d0', ACC = '#F04B00';
let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + HGT + '" viewBox="0 0 ' + W + ' ' + HGT + '" font-family="Georgia, serif">';
s += '<defs>' +
  '<marker id="ta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" fill="' + ACC + '"/></marker>' +
  '<marker id="tm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" fill="' + MUT + '"/></marker>' +
  '</defs>';

// the octave grid (C lines) and the axis label
for (let m = Math.ceil(minM / 12) * 12; m <= maxM; m += 12) {
  s += '<line x1="60" y1="' + Y(m).toFixed(1) + '" x2="' + (W - 12) + '" y2="' + Y(m).toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
  s += '<text x="52" y="' + (Y(m) + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="' + MUT + '">' + etName(m) + '</text>';
}
s += '<text x="14" y="16" text-anchor="start" font-size="11" font-style="italic" fill="' + MUT + '">sounding pitch</text>';

// column headers
s += '<text x="' + LX + '" y="16" text-anchor="middle" font-size="13" letter-spacing="2" fill="' + INK + '">START CHORD</text>';
s += '<text x="' + RX + '" y="16" text-anchor="middle" font-size="13" letter-spacing="2" fill="' + INK + '">B♭ HARMONIC SERIES</text>';

// arrows first (under the heads), then heads and labels
for (const g of merged) {
  const y0 = Y(g.m0), y1 = Y(g.m1);
  const x0 = LX + 8, x1 = RX - 9;
  s += '<line x1="' + x0 + '" y1="' + y0.toFixed(1) + '" x2="' + x1 + '" y2="' + y1.toFixed(1) + '" stroke="' + (g.holds ? MUT : ACC) +
    '" stroke-width="' + (g.holds ? 1.2 : 1.6) + '" marker-end="url(#' + (g.holds ? 'tm' : 'ta') + ')"/>';
  const f = g.holds ? 0.65 : 0.35;
  const lx = x0 + (x1 - x0) * f, ly = y0 + (y1 - y0) * f + (g.holds ? 15 : -7);
  s += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" font-size="11"' +
    (g.holds ? ' font-style="italic" fill="' + MUT + '">' + g.names.join(', ') + ' holds' : ' fill="' + INK + '">' + g.names.join(', ')) + '</text>';
}
// the start chord: one head per pitch, the pair named
const starts = new Map();
for (const v of voices) { const k = Math.round(v.m0 * 100); if (!starts.has(k)) starts.set(k, { m: v.m0, names: [] }); starts.get(k).names.push(v.name); }
for (const st of starts.values()) {
  s += '<circle cx="' + LX + '" cy="' + Y(st.m).toFixed(1) + '" r="5" fill="' + INK + '"/>';
  s += '<text x="' + (LX - 14) + '" y="' + (Y(st.m) + 4).toFixed(1) + '" text-anchor="end" font-size="13" fill="' + INK + '">' + etName(st.m) + ' · ' + st.names.join(', ') + '</text>';
}
// the series: one head per destination
for (const g of merged) {
  s += '<circle cx="' + RX + '" cy="' + Y(g.m1).toFixed(1) + '" r="5" fill="' + ACC + '"/>';
  s += '<text x="' + (RX + 14) + '" y="' + (Y(g.m1) + 4).toFixed(1) + '" font-size="13" fill="' + INK + '">' + destLabel(g) + '</text>';
}
s += '</svg>';
fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
fs.writeFileSync(path.join(ROOT, out), s);
console.log('wrote ' + out + ' (' + s.length + ' bytes · ' + merged.length + ' arrows · ' + W + 'x' + HGT + ')');
for (const g of merged) console.log('  ' + g.names.join(' + ').padEnd(22) + etName(g.m0) + ' -> ' + destLabel(g) + (g.holds ? '  (holds)' : '  travel ' + Math.round((g.m1 - g.m0) * 100) + ' c'));
