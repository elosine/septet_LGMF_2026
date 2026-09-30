#!/usr/bin/env node
// A COMPATIBLE TEMPO FOR A FIGURE — the first tool of N-4 THE SHOWN BEAT (RUNNING_LOG §563; his LG-141: "measure and see if you can give
// me a close-ish tempo that those notes might fall around … what are some methods of coming up with an overlay tempo?").
// Three methods over one part's onsets in a window, each a candidate grid: (A) PHASE COHERENCE — the period whose beat the onsets cluster on
// (the comb of beat tracking; the phase free); (B) THE GRID FIT — the tuba pages' cluster idea: the subdivision unit whose multiples land
// nearest the onsets (a 16th of some tempo); (C) THE IOI — the mean and the median inter-onset interval as a pulse.
// (D) THE BETWEEN PHASE (T10, §572): for each shown beat the phase that keeps every note farthest from a beat — the hand to paste.
//   node tools/tempo_fit.js --ir piece-lgmf --part 0 --from 295 --to 297.31 [--unit 0.108 --every 6] [--free 1,2] [--html notation/research/x.html] [--json out.json]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', arg('ir', 'piece-lgmf') + '.ir.json'), 'utf8'));
const PART = +arg('part', 0), T0 = +arg('from', 0), T1 = +arg('to', 1e9);
const partOf = {}; for (const c of ir.chunks) for (const id of c.events) partOf[id] = c.part;
const nm = p => p.spelled.step + (p.spelled.alter > 0 ? '#' : p.spelled.alter < 0 ? 'b' : '') + p.spelled.octave;
const ev = ir.events.filter(e => partOf[e.id] === PART && e.pitch && e.onset >= T0 && e.onset <= T1).sort((a, b) => a.onset - b.onset);
const on = ev.map(e => e.onset), N = on.length;
if (N < 3) { console.error('fewer than 3 onsets in the window'); process.exit(2); }
const ioi = on.slice(1).map((t, i) => t - on[i]);
const f3 = x => x.toFixed(3), ms = x => Math.round(x * 1000);
console.log('THE FIGURE — part ' + PART + ', ' + f3(T0) + ' … ' + f3(T1) + ' s: ' + N + ' onsets');
ev.forEach((e, i) => console.log('  ' + (i + 1) + '  ' + f3(e.onset) + '  ' + nm(e.pitch).padEnd(4) + (i < N - 1 ? '  → ' + f3(ioi[i]) : '')));
console.log('  IOI mean ' + f3(ioi.reduce((a, b) => a + b) / ioi.length) + ' · median ' + f3([...ioi].sort((a, b) => a - b)[Math.floor(ioi.length / 2)]) + ' · min ' + f3(Math.min(...ioi)) + ' · max ' + f3(Math.max(...ioi)));

// the deviation of each onset from a grid (period T, phase φ): the nearest grid point
const devs = (T, phi) => on.map(t => { const k = Math.round((t - phi) / T); return t - (phi + k * T); });
const rms = d => Math.sqrt(d.reduce((a, x) => a + x * x, 0) / d.length);
const localMax = (xs, ys) => { const out = []; for (let i = 1; i < ys.length - 1; i++) if (ys[i] > ys[i - 1] && ys[i] >= ys[i + 1]) out.push({ x: xs[i], y: ys[i] }); return out; };

// (A) PHASE COHERENCE: R(T) = |Σ e^{2πi t/T}| / N — 1 when every onset sits on one beat of period T; the phase from the sum's angle
const A = [];
for (let T = 0.15; T <= 1.2; T += 0.001) { let re = 0, im = 0; for (const t of on) { re += Math.cos(2 * Math.PI * t / T); im += Math.sin(2 * Math.PI * t / T); } A.push({ T: +T.toFixed(3), R: Math.hypot(re, im) / N, phi: (Math.atan2(im, re) / (2 * Math.PI)) * T }); }
const aPeaks = localMax(A.map(a => a.T), A.map(a => a.R)).map(p => A.find(a => a.T === p.x)).sort((p, q) => q.R - p.R).filter(p => p.T >= 0.2).slice(0, 4);
console.log('\n(A) PHASE COHERENCE — the beat the onsets cluster on (period · bpm · coherence 0…1 · each onset\'s offset from its nearest beat, ms):');
for (const p of aPeaks) { const phi = ((p.phi % p.T) + p.T) % p.T; const d = devs(p.T, phi); console.log('  T ' + f3(p.T) + ' s = ' + Math.round(60 / p.T) + ' bpm · R ' + p.R.toFixed(2) + ' · offsets ' + d.map(ms).join(' ') + ' · rms ' + ms(rms(d)) + ' ms'); p.dev = d; p.phase = phi; }

// (B) THE GRID FIT: the unit u whose multiples (from the first onset) land nearest the onsets; the tempo if u is a 16th (4 u) or an 8th (2 u)
const B = [];
for (let u = 0.06; u <= 0.45; u += 0.0005) { const d = on.map(t => { const k = Math.round((t - on[0]) / u); return t - (on[0] + k * u); }); B.push({ u: +u.toFixed(4), rms: rms(d), d }); }
const bMins = []; for (let i = 1; i < B.length - 1; i++) if (B[i].rms < B[i - 1].rms && B[i].rms <= B[i + 1].rms) bMins.push(B[i]);
const bTop = bMins.filter(b => b.u >= 0.09).sort((p, q) => p.rms - q.rms).slice(0, 6);
const MAXBPM = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'rules.json'), 'utf8')).objects.tick.gridMaxBpm || 110; } catch (e) { return 110; } })();
console.log('\n(B) THE GRID FIT — the subdivision unit whose multiples land nearest the onsets, from the first (unit · rms ms · the slots each onset takes · as a 16th → bpm · as an 8th → bpm · THE SHOWN BEAT: the smallest grouping of the unit under ' + MAXBPM + ' bpm, §569):');
for (const b of bTop) { const slots = on.map(t => Math.round((t - on[0]) / b.u)); let g = 1; while (60 / (g * b.u) > MAXBPM) g++; console.log('  u ' + f3(b.u) + ' s · rms ' + ms(b.rms) + ' ms · slots ' + slots.join(' ') + ' · 16th → ' + Math.round(60 / (4 * b.u)) + ' bpm · 8th → ' + Math.round(60 / (2 * b.u)) + ' bpm · shown beat every ' + g + ' units = ' + f3(g * b.u) + ' s = ' + Math.round(60 / (g * b.u)) + ' bpm'); }

// (C) THE IOI as a pulse
const mean = ioi.reduce((a, b) => a + b) / ioi.length, median = [...ioi].sort((a, b) => a - b)[Math.floor(ioi.length / 2)];
console.log('\n(C) THE IOI AS A PULSE: mean ' + f3(mean) + ' s = ' + Math.round(60 / mean) + ' bpm (offsets ' + devs(mean, on[0]).map(ms).join(' ') + ') · median ' + f3(median) + ' s = ' + Math.round(60 / median) + ' bpm (offsets ' + devs(median, on[0]).map(ms).join(' ') + ')');

// (D) THE BETWEEN PHASE — T10 (RUNNING_LOG §571 · §572; his LG-149 · LG-150: the beats BETWEEN the notes — the beat orients, it is not
// played on): for a shown beat, the phase that MAXIMIZES the smallest distance of any onset from a beat, searched continuously over one
// beat (1 ms steps). Printed as --beatGridFit takes it — an absolute beat time at or before the first onset — with the nearest note's
// distance (the cap is half a beat) and each note's place as a % of the beat after the line before it. --unit u --every n names a
// grouping of your own; otherwise every (B) candidate's shown beat. Figure 2's check: u 0.108 · every 6 → a phase near 295.186 (§571).
// [§574] --free 1,2 — onsets (1-based) the objective IGNORES: his "if the beat falls on either of the first two, that's okay because they can
// still time the other one" — two notes close together need no beat between them; the search spaces the REST. They are still listed.
const FREE = new Set(String(arg('free', '')).split(',').map(s => parseInt(s, 10)).filter(k => k >= 1 && k <= N));
if (FREE.size >= N) FREE.clear();
const between = beat => {
  let best = { phi: 0, dmin: -1 };
  const steps = Math.max(200, Math.round(beat / 0.001));
  for (let i = 0; i < steps; i++) {
    const phi = i * beat / steps; let dmin = Infinity;
    on.forEach((t, k) => { if (FREE.has(k + 1)) return; const r = (((t - phi) % beat) + beat) % beat; dmin = Math.min(dmin, r, beat - r); });
    if (dmin > best.dmin) best = { phi, dmin };
  }
  const phAbs = on[0] - ((((on[0] - best.phi) % beat) + beat) % beat);     // the beat at or before the first onset
  const pos = on.map(t => ((((t - phAbs) % beat) + beat) % beat) / beat * 100);
  return { beat, phase: +phAbs.toFixed(3), dmin: best.dmin, cap: beat / 2, pos };
};
const groupings = [];
if (arg('unit', null) && arg('every', null)) groupings.push({ u: +arg('unit'), g: +arg('every'), from: 'named' });
else for (const b of bTop) { let g = 1; while (60 / (g * b.u) > MAXBPM) g++; groupings.push({ u: b.u, g, from: 'B' }); }
const D = groupings.map(gr => Object.assign({ u: gr.u, g: gr.g }, between(gr.u * gr.g)));
console.log('\n(D) THE BETWEEN PHASE (T10) — for each shown beat, the phase that keeps every note farthest from a beat' + (FREE.size ? ' (notes ' + [...FREE].join(', ') + ' FREE — not in the objective)' : '') + ' (the nearest note\'s distance; the cap half a beat; each note\'s place as a % of the beat after its line; the hand as --beatGridFit takes it):');
for (const d of D) console.log('  beat ' + f3(d.beat) + ' s = ' + Math.round(60 / d.beat) + ' bpm (' + d.g + ' × ' + f3(d.u) + ') · phase ' + f3(d.phase) + ' · nearest ' + ms(d.dmin) + ' ms of ' + ms(d.cap) + ' · at ' + d.pos.map((p, k) => Math.round(p) + (FREE.has(k + 1) ? '*' : '')).join(' ') + ' % · --beatGridFit ' + PART + ':' + d.u + ':' + d.g + ':' + d.phase + ':' + on[0] + ':' + on[N - 1]);

// [§574] --html <path> — THE PICTURE, generated (the §563 page was drawn by hand for one figure): the heads on a time axis, each shown beat's
// lines in its own colour (heavy = a beat, light = its unit) at its between phase, a table of every note's distance from the nearest beat
// and its place in the beat. Served by his score server from notation/research/.
const html = arg('html', null);
if (html) {
  const COL = ['red', 'blue', 'green', 'orange', 'purple'];
  const PAD = 0.4, T0v = +(on[0] - PAD).toFixed(3), T1v = +(on[N - 1] + PAD).toFixed(3);
  const mids = ev.map(e => e.pitch.midi), names = ev.map(e => nm(e.pitch));
  const cands = D.slice(0, COL.length).map((d, i) => ({ name: Math.round(60 / d.beat) + ' bpm — the beat ' + f3(d.beat) + ' s = ' + d.g + ' × ' + f3(d.u) + ', phase ' + f3(d.phase) + ', the nearest note ' + ms(d.dmin) + ' ms', colour: COL[i], beat: d.beat, unit: d.u, g: d.g, phase: d.phase }));
  // [§586] THE CANVAS FOLLOWS THE FIGURE: 480 px a second from one beat before --from to one beat after --to (the slowest candidate's), the
  // page scrolling sideways past the window — a 6 s figure was cut at 2.5 s by the fixed 1200-unit canvas (his eye, 2026-09-30)
  const PICPAD = cands.length ? Math.max(...cands.map(c => c.beat)) : 0.75, PW = Math.round(40 + (T1v - T0v + 2 * PICPAD) * 480);
  const page = '<!doctype html>\n<html><head><meta charset="utf-8"><title>Tempo Candidates</title>\n<style>\n'
    + ' :root{--bg:#fff;--ink:#111;--muted:#777;--rule:#ddd;--axis:#888;--red:#c8102e;--blue:#1c4879;--green:#2e7d32;--orange:#d9700a;--purple:#7b3fa0}\n'
    + ' @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#141414;--ink:#eee;--muted:#999;--rule:#333;--axis:#777;--red:#ff5c6e;--blue:#7aa6e0;--green:#6fcf7a;--orange:#ffb060;--purple:#c79bff}}\n'
    + ' :root[data-theme="dark"]{--bg:#141414;--ink:#eee;--muted:#999;--rule:#333;--axis:#777;--red:#ff5c6e;--blue:#7aa6e0;--green:#6fcf7a;--orange:#ffb060;--purple:#c79bff}\n'
    + ' body{font:14px/1.4 system-ui,sans-serif;margin:0;padding:16px;color:var(--ink);background:var(--bg);overflow-x:auto}\n'
    + ' h1{font-size:16px;margin:0 0 6px} .k{display:inline-block;width:14px;height:3px;vertical-align:middle;margin-right:6px}\n'
    + ' svg{height:auto;display:block} table{border-collapse:collapse;margin-top:10px;max-width:100%} td,th{padding:2px 10px;text-align:right;font-variant-numeric:tabular-nums} th{text-align:left}\n'
    + ' .note{color:var(--muted);font-size:13px;margin-top:8px}\n</style></head><body>\n'
    + '<h1>The ' + N + ' notes, ' + f3(on[0]) + ' … ' + f3(on[N - 1]) + ' s — ' + cands.length + ' shown beats, each at its between phase (T10' + (FREE.size ? '; notes ' + [...FREE].join(', ') + ' free) — grey heads are the free ones' : ')') + '</h1>\n'
    + '<svg id="g" width="' + PW + '" viewBox="0 0 ' + PW + ' ' + (60 + cands.length * 44 + 230) + '" xmlns="http://www.w3.org/2000/svg"></svg>\n<div id="legend"></div>\n<table id="tbl"></table>\n'
    + '<div class="note">x = time, 480 px per second, the window one beat beyond the range each side (scroll sideways for a long figure). Dots = the heads at their onsets (height by pitch), the faint bar from each its length. Each candidate is one shown beat: the heavy lines are its beats (one line per beat — the beat frame), the light ones its unit; the beats run down through the heads faintly. Every candidate stands at the phase that keeps the (non-free) notes farthest from its beats. The table: each note\'s distance from the nearest beat, and where it sits in the beat (0 % = on the line, 50 % = midway).</div>\n'
    + '<script>\n'
    + 'const on=' + JSON.stringify(on) + ',dur=' + JSON.stringify(ev.map(e => +(e.duration || 0).toFixed(3))) + ',midi=' + JSON.stringify(mids) + ',names=' + JSON.stringify(names) + ',free=' + JSON.stringify([...FREE]) + ';\n'
    + 'const cands=' + JSON.stringify(cands) + ';\n'
    + 'const T0=' + (T0v - PICPAD) + ',T1=' + (T1v + PICPAD) + ',W=' + PW + ',PPS=480,LO=' + Math.min(...mids) + ',HI=' + Math.max(...mids) + ',NB=cands.length,YS=60+NB*44,YAX=YS+200;\n'
    + 'const svg=document.getElementById("g");const el=(n,a)=>{const e=document.createElementNS("http://www.w3.org/2000/svg",n);for(const k in a)e.setAttribute(k,a[k]);svg.appendChild(e);return e;};\n'
    + 'const X=t=>20+(t-T0)*PPS,Y=m=>YAX-20-(m-LO)*(150/Math.max(1,HI-LO)),css=v=>getComputedStyle(document.documentElement).getPropertyValue("--"+v).trim();\n'
    + 'cands.forEach((c,i)=>{const ya=20+i*44,yb=ya+36,col=css(c.colour);const k0=Math.ceil((T0-c.phase)/c.unit-1e-9),k1=Math.floor((T1-c.phase)/c.unit+1e-9);\n'
    + ' for(let k=k0;k<=k1;k++){const t=c.phase+k*c.unit,beat=((k%c.g)+c.g)%c.g===0;if(beat){el("line",{x1:X(t),y1:ya,x2:X(t),y2:yb,stroke:col,"stroke-width":2.5});el("line",{x1:X(t),y1:yb,x2:X(t),y2:YAX,stroke:col,"stroke-width":1.5,opacity:0.3});}else el("line",{x1:X(t),y1:ya+16,x2:X(t),y2:yb,stroke:col,"stroke-width":1,opacity:0.45});}\n'
    + ' const tx=el("text",{x:24,y:ya+12,fill:col,"font-size":"12"});tx.textContent=c.name;});\n'
    + 'for(let m=LO;m<=HI;m+=4)el("line",{x1:20,y1:Y(m),x2:W-20,y2:Y(m),stroke:"var(--rule)"});\n'
    + 'on.forEach((t,i)=>el("rect",{x:X(t),y:Y(midi[i])-3,width:Math.max(2,dur[i]*PPS),height:6,fill:free.includes(i+1)?"var(--muted)":"var(--ink)",opacity:0.22}));\n'   // [§588] each note's length as a bar from its head — a long note reads as long
    + 'on.forEach((t,i)=>{const fr=free.includes(i+1);el("circle",{cx:X(t),cy:Y(midi[i]),r:6,fill:fr?"var(--muted)":"var(--ink)"});const tx=el("text",{x:X(t)+9,y:Y(midi[i])+4,"font-size":"12",fill:fr?"var(--muted)":"var(--ink)"});tx.textContent=names[i]+" "+t.toFixed(3)+(fr?" (free)":"");});\n'
    + 'el("line",{x1:20,y1:YAX,x2:W-20,y2:YAX,stroke:"var(--axis)"});for(let t=Math.ceil(T0*2)/2;t<=T1+1e-9;t+=0.5){el("line",{x1:X(t),y1:YAX-4,x2:X(t),y2:YAX+4,stroke:"var(--axis)"});const tx=el("text",{x:X(t)-14,y:YAX+18,"font-size":"11",fill:"var(--muted)"});tx.textContent=t.toFixed(1);}\n'
    + 'document.getElementById("legend").innerHTML=cands.map(c=>"<div><span class=\\"k\\" style=\\"background:"+css(c.colour)+"\\"></span>"+c.name+"</div>").join("");\n'
    + 'const near=(c,t)=>{const r=(((t-c.phase)%c.beat)+c.beat)%c.beat;return [Math.round(Math.min(r,c.beat-r)*1000),Math.round(r/c.beat*100)];};\n'
    + 'document.getElementById("tbl").innerHTML="<tr><th>note</th>"+cands.map(c=>"<th style=\\"color:"+css(c.colour)+"\\">"+c.name.split(" ")[0]+" bpm: ms · % of beat</th>").join("")+"</tr>"+on.map((t,i)=>"<tr><th>"+names[i]+" "+t.toFixed(3)+(free.includes(i+1)?" (free)":"")+"</th>"+cands.map(c=>{const [m,p]=near(c,t);return "<td>"+m+" · "+p+" %</td>";}).join("")+"</tr>").join("");\n'
    + '</script>\n</body></html>\n';
  fs.writeFileSync(html, page);
  console.log('\nthe picture → ' + html);
}

const out = arg('json', null);
if (out) fs.writeFileSync(out, JSON.stringify({ part: PART, from: T0, to: T1, onsets: ev.map(e => ({ t: e.onset, pitch: nm(e.pitch), midi: e.pitch.midi })), ioi, A: aPeaks.map(p => ({ T: p.T, bpm: 60 / p.T, R: p.R, phase: p.phase, dev: p.dev })), B: bTop.map(b => ({ u: b.u, rms: b.rms, slots: on.map(t => Math.round((t - on[0]) / b.u)), dev: b.d })), C: { mean, median }, D }, null, 1));
