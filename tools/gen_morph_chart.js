#!/usr/bin/env node
// gen_morph_chart.js — the morph sequence chart for the Performance Instructions
// (session 14, 2026-09-16, RUNNING_LOG §576; the composer's spec on the tuba's
// beating chart: "2 sections side by side. Bloom is the same format, 3 rows, the
// three pairs, the curves with max hz, keep the timeline at bottom; 2nd column
// SPECTRAL heading then 6 rows, Fl, Bcl … flute bcl straight lines then the other
// 4 parts … lines for each part represent the entire m2 and correspond to the
// timeline plotted underneath … heading: Bb Harmonics, then in each row p5 D4(-14c)").
//
// BLOOM (left): the tuba chart's form — one row per pair, |f1 − f2| in Hz over the
// morph, the peak marked with its rate. SPECTRAL (right): one row per part, its
// pitch over the morph in cents from where it starts (flat where it holds), a
// B♭ HARMONICS column with the destination's partial class and D45 spelling.
// Data measured from the save's morphBend curves — nothing typed in by hand.
// Look: piece #4's gen_beating_chart.js (Georgia, ink / muted / grid, one accent).
//
//   node tools/gen_morph_chart.js [--score piece-septet] [--root 46]
//        [--out docs/notation_instructions/images/morph_sequence_chart.svg]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const scoreId = arg('score', 'piece-septet');
const out = arg('out', 'docs/notation_instructions/images/morph_sequence_chart.svg');
const FUND = parseInt(arg('root', '46'), 10);          // the panel's root for M2: A♯2 (RUNNING_LOG §465)
const save = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores', scoreId + '.json'), 'utf8'));
const SHORT = ['Fl', 'Bcl', 'Pno', 'Vn1', 'Vn2', 'Va', 'Vc'];
const PC = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// ---- the morphs: the save's waveCurves with morphBend, grouped, in time order ----
const morphs = (save.objects || []).filter(o => o.type === 'waveCurve' && o.morphBend);
const byGroup = {};
for (const o of morphs) (byGroup[o.groupId || o.id] = byGroup[o.groupId || o.id] || []).push(o);
const G = Object.values(byGroup).map(list => ({
  list, t0: Math.min(...list.map(o => o.startSeconds)), t1: Math.max(...list.map(o => o.endSeconds)),
})).sort((a, b) => a.t0 - b.t0);
if (G.length < 2) { console.error('gen_morph_chart: expected two morph groups, found ' + G.length); process.exit(1); }
const BLOOM = G[0], SPEC = G[1];
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

// pitch at t for one part inside a group (the tuba's trajFor): the span covering t,
// its bend interpolated; before the first span its start, after the last its end
const trajFor = (list, part) => {
  const spans = list.filter(o => o.layer === part).sort((a, b) => a.startSeconds - b.startSeconds);
  return t => {
    let best = null;
    for (const o of spans) {
      if (t >= o.startSeconds - 1e-9 && t <= o.endSeconds + 1e-9) { best = o; break; }
      if (o.startSeconds <= t) best = o;
    }
    if (!best) best = spans[0];
    const rel = Math.min(Math.max(t - best.startSeconds, 0), best.endSeconds - best.startSeconds);
    const nb = best.morphBend;
    let bend = nb[nb.length - 1][1];
    for (let i = 0; i < nb.length - 1; i++)
      if (rel >= nb[i][0] && rel <= nb[i + 1][0]) {
        const f = (rel - nb[i][0]) / Math.max(1e-9, nb[i + 1][0] - nb[i][0]);
        bend = nb[i][1] + (nb[i + 1][1] - nb[i][1]) * f; break;
      }
    if (rel <= nb[0][0]) bend = nb[0][1];
    return best.sonifyNote + bend / 100;
  };
};
const spanOf = (list, parts) => {
  const s = list.filter(o => parts.includes(o.layer));
  return [Math.min(...s.map(o => o.startSeconds)), Math.max(...s.map(o => o.endSeconds))];
};

// BLOOM's pairs: the parts that start on the same note, high to low
const firstNote = {};
for (const o of BLOOM.list.slice().sort((a, b) => a.startSeconds - b.startSeconds)) if (firstNote[o.layer] == null) firstNote[o.layer] = o.sonifyNote;
const pairMap = {};
for (const [p, n] of Object.entries(firstNote)) (pairMap[n] = pairMap[n] || []).push(parseInt(p, 10));
const PAIRS = Object.keys(pairMap).map(Number).sort((a, b) => b - a).map(n => pairMap[n].sort((a, b) => a - b));
// SPECTRAL's rows: the parts in score order, winds then strings
const SPARTS = [...new Set(SPEC.list.map(o => o.layer))].sort((a, b) => a - b);

// ---- the destination's partial class of FUND and its D45 spelling ----
const partialOf = m => {
  let best = null;
  for (let n = 1; n <= 32; n++) {
    const exact = FUND + 12 * Math.log2(n);
    const k = Math.round((m - exact) / 12);
    const d = Math.abs(m - (exact + 12 * k));
    if (d < 0.3 && (!best || d < best.d - 1e-6)) best = { n, d, exact: exact + 12 * k };   // ties → the smallest n (the class)
  }
  return best;
};
// the destination each row is labelled with is the one the NOTATION states — the MAIN IR's D45 header
// (the header's q is the sounding midi × 2; the spelling can be the written form) — because the drawn
// morph is a wave toward it and back (RUNNING_LOG §576): its end pitch is its start pitch
const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', scoreId + '.ir.json'), 'utf8'));
const HDR = {};
for (const o of (ir.overlays || []).filter(o => o.kind === 'header' && o.target.t >= SPEC.t0 - 1 && o.target.t <= SPEC.t1)) {
  const v = o.value;
  HDR[o.target.part] = { dest: v.q[0] / 2 + (v.dir || 1) * v.travelC / 100, travelC: v.travelC };
}
const d45 = exact => {
  const et = Math.round(exact), dev = Math.round((exact - et) * 100);
  const q = Math.round(dev / 50) * 50, res = dev - q;
  const base = PC[((et % 12) + 12) % 12], oct = Math.floor(et / 12) - 1;
  const sign = q === 0 ? '' : q < 0 ? ' half-flat' : ' half-sharp';
  return base + (sign ? sign + ' ' : '') + oct + (Math.abs(res) >= 2 ? ' (' + (res > 0 ? '+' : '−') + Math.abs(res) + ' c)' : '');
};
// plain = no cents: a voice that does not gliss (its travel under D44's 20 c — the flute, the bass clarinet) is labelled by its pitch alone (his ask, RUNNING_LOG §579)
const harmLabel = (m, plain) => { const p = partialOf(m); const sp = p ? d45(p.exact) : d45(m); const name = plain ? sp.replace(/ \([^)]*\)$/, '') : sp; return p ? 'p' + p.n + ' · ' + name : name + ' · off the series'; };
const fmt = t => Math.floor(t / 60) + ':' + String(Math.round(t % 60)).padStart(2, '0');

// ---- geometry (the tuba chart's idiom) ----
const W = 860, TOP = 46, BOT = 34;
const BL0 = 78, BL1 = 392;                 // BLOOM panel
const SP0 = 452, SP1 = 690, RC = 704, RE = 848;   // SPECTRAL panel · the harmonics column
const SROWH = 36, SGAP = 12;
const NS = SPARTS.length, NB = PAIRS.length;
const CONTENT = NS * SROWH + (NS - 1) * SGAP;
const BROWH = (CONTENT - (NB - 1) * SGAP) / NB;
const HGT = TOP + CONTENT + BOT;
const INK = '#222', MUT = '#777', GRID = '#d8d8d0', ACC = '#F04B00';
const Xb = t => BL0 + (t - BLOOM.t0) / (BLOOM.t1 - BLOOM.t0) * (BL1 - BL0);
const Xs = t => SP0 + (t - SPEC.t0) / (SPEC.t1 - SPEC.t0) * (SP1 - SP0);
let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + HGT + '" viewBox="0 0 ' + W + ' ' + HGT + '" font-family="Georgia, serif">';

// headers, panel edges, the timeline
const hdr = (x, name) => '<text x="' + x.toFixed(1) + '" y="' + (TOP - 30) + '" text-anchor="middle" font-size="13" letter-spacing="2" fill="' + INK + '">' + name + '</text>';
s += hdr((BL0 + BL1) / 2, 'BLOOM') + hdr((SP0 + SP1) / 2, 'SPECTRAL');
s += '<text x="' + ((RC + RE) / 2).toFixed(1) + '" y="' + (TOP - 30) + '" text-anchor="middle" font-size="11" letter-spacing="1.5" fill="' + INK + '">B♭ HARMONICS</text>';
s += '<text x="' + BL0 + '" y="' + (TOP - 30) + '" text-anchor="end" font-size="11" font-style="italic" fill="' + MUT + '">beating (Hz)&#160;&#160;</text>';
for (const x of [BL0, BL1, SP0, SP1])
  s += '<line x1="' + x + '" y1="' + (TOP - 24) + '" x2="' + x + '" y2="' + (HGT - BOT + 8) + '" stroke="' + GRID + '" stroke-width="1"/>';
for (const [x, t] of [[BL0, BLOOM.t0], [BL1, BLOOM.t1], [SP0, SPEC.t0], [SP1, SPEC.t1]])
  s += '<text x="' + x + '" y="' + (HGT - BOT + 24) + '" text-anchor="middle" font-size="11" fill="' + MUT + '">' + fmt(t) + '</text>';

// ---- BLOOM: one row per pair, |f1 − f2| over the morph, the peak marked ----
PAIRS.forEach((pair, row) => {
  const [a, b] = pair;
  const y0 = TOP + row * (BROWH + SGAP), yB = y0 + BROWH;
  s += '<text x="' + (BL0 - 10) + '" y="' + (y0 + BROWH / 2 + 4).toFixed(1) + '" text-anchor="end" font-size="13" fill="' + INK + '">' + SHORT[a] + ' + ' + SHORT[b] + '</text>';
  s += '<line x1="' + BL0 + '" y1="' + yB.toFixed(1) + '" x2="' + BL1 + '" y2="' + yB.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
  const fa = trajFor(BLOOM.list, a), fb = trajFor(BLOOM.list, b);
  const [s0, s1] = spanOf(BLOOM.list, pair);
  const pts = [];
  let rowMax = 0;
  for (let t = s0; t <= s1 + 1e-9; t += 0.5) { const v = Math.abs(hz(fa(t)) - hz(fb(t))); pts.push([t, v]); if (v > rowMax) rowMax = v; }
  const Y = v => yB - Math.min(v / (rowMax * 1.12), 1) * (BROWH - 6);
  s += '<path d="' + pts.map((p, i) => (i ? 'L' : 'M') + Xb(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('') + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  let pk = pts[0]; pts.forEach(p => { if (p[1] > pk[1]) pk = p; });
  s += '<circle cx="' + Xb(pk[0]).toFixed(1) + '" cy="' + Y(pk[1]).toFixed(1) + '" r="3.5" fill="' + ACC + '"/>';
  s += '<text x="' + Xb(pk[0]).toFixed(1) + '" y="' + (Y(pk[1]) - 7).toFixed(1) + '" text-anchor="middle" font-size="11" fill="' + INK + '">&#8776; ' + pk[1].toFixed(1).replace(/\.0$/, '') + ' Hz</text>';
});

// ---- SPECTRAL: one row per part, its pitch in cents from its start; the harmonics column ----
const rows = SPARTS.map(p => {
  const f = trajFor(SPEC.list, p);
  const [s0, s1] = spanOf(SPEC.list, [p]);
  const m0 = f(s0);
  const pts = [];
  for (let t = s0; t <= s1 + 1e-9; t += 0.5) pts.push([t, (f(t) - m0) * 100]);
  if (pts[pts.length - 1][0] < s1) pts.push([s1, (f(s1) - m0) * 100]);
  return { p, pts, m0, m1: f(s1) };
});
const etName = m => PC[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1);
const maxTravel = Math.max(20, ...rows.flatMap(r => r.pts.map(q => Math.abs(q[1]))));
rows.forEach((r, row) => {
  const y0 = TOP + row * (SROWH + SGAP), yB = y0 + SROWH, base = yB - 6;
  s += '<text x="' + (SP0 - 10) + '" y="' + (y0 + SROWH / 2 + 4).toFixed(1) + '" text-anchor="end" font-size="13" fill="' + INK + '">' + SHORT[r.p] + '</text>';
  s += '<line x1="' + SP0 + '" y1="' + yB.toFixed(1) + '" x2="' + RE + '" y2="' + yB.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
  const Y = c => base - (c / maxTravel) * (SROWH - 10);
  // a voice that does not gliss (its header travel under D44's 20 c) is drawn as a straight line at its pitch, no dot (his ask, §580)
  const holds = HDR[r.p] && HDR[r.p].travelC < 20;
  const line = holds ? [r.pts[0], r.pts[r.pts.length - 1]].map(q => [q[0], 0]) : r.pts;
  s += '<path d="' + line.map((q, i) => (i ? 'L' : 'M') + Xs(q[0]).toFixed(1) + ',' + Y(q[1]).toFixed(1)).join('') + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  // the starting pitch, above the start of the line (his ask, RUNNING_LOG §577)
  s += '<text x="' + (Xs(r.pts[0][0]) + 2).toFixed(1) + '" y="' + (Y(0) - 6).toFixed(1) + '" font-size="11" fill="' + INK + '">' + etName(r.m0) + '</text>';
  // the dot marks where the voice reaches its partial — the farthest point from its start (the morph returns home after it)
  if (!holds) {
    let e = r.pts[0]; r.pts.forEach(q => { if (Math.abs(q[1]) > Math.abs(e[1])) e = q; });
    s += '<circle cx="' + Xs(e[0]).toFixed(1) + '" cy="' + Y(e[1]).toFixed(1) + '" r="3.5" fill="' + ACC + '"/>';
  }
  const h = HDR[r.p];
  s += '<text x="' + RC + '" y="' + (y0 + SROWH / 2 + 4).toFixed(1) + '" font-size="12" fill="' + INK + '">' + (h ? harmLabel(h.dest, h.travelC < 20) : '—') + '</text>';
});
s += '</svg>';

fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
fs.writeFileSync(path.join(ROOT, out), s);
console.log('wrote ' + out + ' (' + s.length + ' bytes · ' + W + 'x' + HGT + ')');
console.log('BLOOM ' + fmt(BLOOM.t0) + '–' + fmt(BLOOM.t1) + '  pairs: ' + PAIRS.map(pr => pr.map(p => SHORT[p]).join('+')).join(' · '));
console.log('SPECTRAL ' + fmt(SPEC.t0) + '–' + fmt(SPEC.t1) + '  rows (header destination · drawn extreme vs header travel):');
for (const r of rows) {
  const h = HDR[r.p] || {};
  let ext = r.pts[0]; r.pts.forEach(q => { if (Math.abs(q[1]) > Math.abs(ext[1])) ext = q; });
  console.log('  ' + SHORT[r.p].padEnd(4) + (h.dest != null ? harmLabel(h.dest) : '—').padEnd(24) + ' drawn ' + Math.round(ext[1]) + ' c at ' + fmt(ext[0]) + ' · header ' + (h.travelC != null ? Math.round(h.travelC) : '?') + ' c · ends ' + Math.round(r.pts[r.pts.length - 1][1]) + ' c');
}
