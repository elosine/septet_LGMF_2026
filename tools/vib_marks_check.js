#!/usr/bin/env node
// tools/vib_marks_check.js — THE VIBRAPHONE'S MARKS, READ (LGMF PLAN 2g.2; RUNNING_LOG §463 the goldens · §468 the build). Exit 1 on a failure.
//   node tools/vib_marks_check.js [--score <file>] [--print <group> <t0> <t1>]   (THE PAGE: the proto lgmf-vib-proto, when it exists, PLAN 2g.5)
// notation/lib/vib_marks.js on the vibraphone's 156 sequence bows of Draft 01 (scores/piece-Recombination-Draft01-done.json, read-only),
// under rules.json vibMarks: the seats · the carry · rule 1's two tiers · the turn · the fades · the bare flat bows · no name without a
// hairpin · every hairpin inside its bow · a monotone run named at its ends · the R01c stretch §463 rendered, pinned.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const VM = require(path.join(ROOT, 'notation', 'lib', 'vib_marks.js'));
const R = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadRules(ROOT);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const SCORE = arg('score', path.join(ROOT, 'scores', 'piece-Recombination-Draft01-done.json'));
const S = JSON.parse(fs.readFileSync(SCORE, 'utf8'));
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'velocity_remap.json'), 'utf8'));
const LANE = 5;
const r = VM.read(S.objects, LANE, { bank, instKey: 'bowed_vibraphone', rules: R.vibMarks });
const B = r.bows, T = b => VM.text(b);
let failures = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (cond) console.log('   ok  ' + msg); else { failures++; console.log('  FAIL  ' + msg); } return cond; };
const seqOf = name => ((S.databases || {}).sequences || []).find(q => q.name === name) || {};
const R01 = seqOf('LGMF-R01c').group, S03 = seqOf('lgmf-s03-seqb').group;
const at = (g, t, midi) => B.find(b => b.group === g && Math.abs(b.t0 - t) < 0.02 && (midi == null || b.midi === midi));
const nextIn = b => B.filter(x => x.chain === b.chain && x.t0 > b.t0).sort((x, y) => x.t0 - y.t0)[0];
const L = r.ladder;

if (process.argv.includes('--print')) {
  const i = process.argv.indexOf('--print'), g = process.argv[i + 1], a = +process.argv[i + 2], z = +process.argv[i + 3];
  for (const b of B.filter(b => b.group === g && b.t0 >= a && b.t0 <= z))
    console.log(b.chain + ' ' + b.voice.padEnd(5) + ' ' + b.t0.toFixed(2).padStart(7) + ' … ' + b.t1.toFixed(2).padStart(7) + '  m' + b.midi + (b.restart ? ' R ' : '   ') + T(b).padEnd(18) + ' (' + b.startSteps.toFixed(2) + ' → ' + b.endSteps.toFixed(2) + ')');
  process.exit(0);
}

console.log('THE READING — ' + path.basename(SCORE) + ', lane ' + LANE + ' — the ladder ' + L.join('/'));
// (1) the bows and the seats
ok(B.length === 156 && !r.unplaced.length, '156 bows, every bow on a seat (§463) — ' + B.length + ' bows, chains ' + B.filter(b => b.chain === 0).length + ' · ' + B.filter(b => b.chain === 1).length + ', ' + r.unplaced.length + ' unplaced');
{
  // each seat's curve is continuous (§463: the step at a join ≤ 0.24): a chain's abutting bows of one sequence meet at one level
  let worst = 0, where = '';
  const objById = new Map(S.objects.map(o => [o.id, o]));
  for (const c of [0, 1]) {
    const ch = B.filter(b => b.chain === c).sort((x, y) => x.t0 - y.t0);
    for (let i = 1; i < ch.length; i++) {
      const p = ch[i - 1], b = ch[i];
      if (p.group !== b.group || b.t0 - p.t1 >= R.vibMarks.restS) continue;
      const d = Math.abs(VM.stepsAt(objById.get(b.id), objById.get(b.id).startSeconds, L) - VM.stepsAt(objById.get(p.id), objById.get(p.id).endSeconds, L));
      if (d > worst) { worst = d; where = p.t1.toFixed(2) + ' s'; }
    }
  }
  ok(worst <= 0.25, 'each seat\'s level is continuous at its joins (§463: ≤ 0.24; the seats that change bow TOGETHER told apart by the level) — worst ' + worst.toFixed(3) + ' step at ' + where);
}
ok(!r.warnings.length, 'no name against its hairpin\'s direction (the drift warning) — ' + r.warnings.length + (r.warnings.length ? ': ' + r.warnings.slice(0, 3).join(' · ') : ''));

// (2) the goldens of §463
{
  const j1 = at(R01, 42.65, 67), j2 = j1 && nextIn(j1);
  ok(j1 && T(j1) === 'mp > p' && j2 && j2.startName === 'p' && VM.stepsAt(S.objects.find(o => o.id === j2.id), j2.t0, L) < 1.5,
    'THE CARRY at the join 42.65 → 48.89 s: "' + (j1 && T(j1)) + ' | ' + (j2 && T(j2)) + '" — the second bow starts on the carried p although its level ' + (j2 ? j2.startSteps.toFixed(2) : '?') + ' rounds to pp (§463 wrinkle 2)');
  const b33 = at(R01, 33.16);
  ok(b33 && T(b33) === '< p' && b33.startName === 'pp', 'rule 1\'s second tier: the 33.16 s bow rises ' + (b33 ? (b33.endSteps - b33.startSteps).toFixed(2) : '?') + ' step onto a new name — "' + (b33 && T(b33)) + '" from the carried ' + (b33 && b33.startName) + ' (2h.8: the start name not restated)');
  const b56 = at(R01, 56.12, 84);
  ok(b56 && T(b56) === 'p > pp < p', 'the turn inside a bow is named — 56.12 s "' + (b56 && T(b56)) + '"');
  const firsts = [0, 1].map(c => B.filter(b => b.group === R01 && b.chain === c)[0]);
  ok(firsts.every(b => b && T(b) === '○ < pp' && b.restart), 'the fade from niente, timed: both chains\' first bows open "○ < pp" — ' +
    firsts.map(b => b.t0.toFixed(2) + ' s "' + T(b) + '" pp at ' + b.marks.find(m => m.name === 'pp').t.toFixed(2) + ' s (the bow\'s end — the fade runs 2 … 8 s)').join(' · '));
  const lasts = [0, 1].map(c => B.filter(b => b.group === R01 && b.chain === c).slice(-1)[0]);
  ok(lasts.every(b => b && /(^| )> ppp$/.test(T(b))), 'the fade-out to the level reached: R01c\'s last bows end "> ppp" (its save falls to ppp) — ' + lasts.map(b => b.t0.toFixed(2) + ' s "' + T(b) + '"').join(' · '));
  // the R01c stretch of §463's rendering, seat 1 (the chain of the 33.16 s bow), 33 … 95 s — pinned under the rules. §463's reading was the
  // --his probe before rules 1 · 2 · 7 and in the probe's level mapping; where the rules change it: the carry (48.89 starts on p) · rule 1's
  // second tier (48.89's first dip p > pp, 0.34 step) · writtenAt's mapping (48.89 and 79.00 end on p, the probe's on mp) · [2h.8, §480]
  // the start name only at a restart or a voice switch: "pp < p" → "< p" (the pp carried), "p > pp < mp > p" → "> pp < mp > p", the bare
  // last bow "pp" — its chain switched rows there (the row's story begins again); the "p < mp" · "mp > p" that keep a name are switches
  const seat = at(R01, 33.16).chain;
  const got = B.filter(b => b.group === R01 && b.chain === seat && b.t0 >= 33 && b.t0 <= 95).map(b => T(b) || '·').join(' | ');
  const WANT = '< p | p < mp | mp > p | > pp < mp > p | p > pp < p | p < mp > p | > pp | < mp | > p | > pp | · | pp';
  ok(got === WANT, 'the R01c stretch 33 … 95 s, seat ' + seat + ' (§463 rendered under the rules): ' + got + (got === WANT ? '' : '  — want ' + WANT));
}

// (3) the rules over all 156
{
  const bad = [], inside = [], order = [], barePlusName = [];
  for (const b of B) {
    const pins = b.marks.filter(m => m.kind === 'hairpin');
    for (const m of pins) if (!(m.t < m.tEnd && m.t >= b.t0 - 1e-6 && m.tEnd <= b.t1 + 1e-6)) bad.push(b.id + '@' + m.t);
    // a name (not the start's) only at the end of the hairpin just before it
    b.marks.forEach((m, i) => { if (m.kind !== 'hairpin' && !m.start) { const p = b.marks[i - 1]; if (!(p && p.kind === 'hairpin' && Math.abs(p.tEnd - m.t) < 1e-6)) order.push(b.id + '@' + m.t); } });
    // no mark strictly inside a hairpin's span (a monotone run names only its two ends)
    for (const m of pins) for (const x of b.marks) if (x !== m && x.kind !== 'hairpin' && x.t > m.t + 1e-6 && x.t < m.tEnd - 1e-6) inside.push(b.id + '@' + x.t);
    if (!b.restart && !b.switched && !pins.length && b.marks.length) barePlusName.push(b.id);
  }
  // [2h.8, §480] no start name on a moving bow at the carried name — only at a restart or a voice switch; the 79.00 s bow reads "> p"
  {
    const restated = B.filter(b => b.marks[0] && b.marks[0].start && !b.restart && !b.switched), starts = B.filter(b => b.marks[0] && b.marks[0].start);
    const b79 = at(R01, 79.00, 89), b72 = at(R01, 72.32, 75);
    ok(!restated.length && b79 && T(b79) === '> p' && b72 && T(b72) === '< mp' && !R.vibMarks.startOnMove && R.vibMarks.startOnVoiceSwitch === true,
      'THE START NAME (2h.8): only at a restart (' + B.filter(b => b.restart && b.marks[0] && b.marks[0].start).length + ') or a voice switch (' + B.filter(b => b.switched && !b.restart && b.marks[0] && b.marks[0].start).length + ') — ' + starts.length + ' of 156; the 72.32 → 79.00 s bows read "' + (b72 && T(b72)) + ' | ' + (b79 && T(b79)) + '" (his "mp mp" gone)' + (restated.length ? ' — restated: ' + restated.slice(0, 4).map(b => b.t0).join(' ') : ''));
  }
  ok(!bad.length, 'every hairpin runs forward and lies inside its bow (' + B.reduce((a, b) => a + b.marks.filter(m => m.kind === 'hairpin').length, 0) + ' hairpins)' + (bad.length ? ' — ' + bad.slice(0, 5).join(' ') : ''));
  ok(!order.length, 'no name without a hairpin: every name after a bow\'s start closes the hairpin before it' + (order.length ? ' — ' + order.slice(0, 5).join(' ') : ''));
  ok(!barePlusName.length, 'a bow that does not move and does not restart draws nothing (repeatName false) — ' + B.filter(b => !b.marks.length).length + ' bare bows' + (barePlusName.length ? ' — named: ' + barePlusName.slice(0, 5).join(' ') : ''));
  ok(!inside.length, 'a monotone run names only its two ends — no mark inside a hairpin\'s span' + (inside.length ? ' — ' + inside.slice(0, 5).join(' ') : ''));
  const long = B.filter(b => b.group === S03).flatMap(b => b.marks.filter(m => m.kind === 'hairpin' && Math.abs(m.to - m.from) >= 2));
  ok(long.length >= 5, 's03-seqb\'s sweeps: ' + long.length + ' hairpins of two steps or more, each named only at its ends (' + long.slice(0, 4).map(m => m.from.toFixed(1) + '→' + m.to.toFixed(1)).join(' · ') + ' …)');
  const restarts = B.filter(b => b.restart);
  ok(restarts.every(b => b.marks.length && b.marks[0].start), 'every restart writes its start mark (a name, or ○ at silence) — ' + restarts.length + ' restarts');
}

// (4) the voices
{
  let both = 0, wrong = 0;
  for (const b of B) {
    const p = B.find(x => x.chain !== b.chain && x.group === b.group && x.t0 <= b.t0 + 1e-6 && x.t1 > b.t0 + 1e-6);
    if (!p) continue;
    both++;
    if ((b.voice === 'upper') !== (b.midi > p.midi || (b.midi === p.midi && b.chain === 0))) wrong++;
  }
  ok(!wrong, 'the voice by register at each bow\'s start against the partner then sounding (' + both + ' bows with a partner)' + (wrong ? ' — ' + wrong + ' wrong' : ''));
}

// (5) THE PAGE — the proto `lgmf-vib-proto` (PLAN 2g.5) as export_video lays it out: 2g.3's bows and 2g.4's marks, re-runnable
const PROTO = path.join(ROOT, 'notation', 'ir', 'lgmf-vib-proto.ir.json');
if (fs.existsSync(PROTO) && !process.argv.includes('--score')) {
  console.log('THE PAGE — lgmf-vib-proto (the video realization)');
  const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js')), Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js')), AnimObj = require(path.join(ROOT, 'notation', 'lib', 'animobj.js'));
  const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
  const ENS = Layout.ensembleFor(rd('notation/registry/ensemble.json'), C.realizations['video-jury']), parts = ENS.parts.map(p => p.part);
  const boxes = Fit.boxesFor(C, ENS, parts), sps = boxes.ssPerSec;
  const ir = rd('notation/ir/lgmf-vib-proto.ir.json');
  const m = Layout.layoutSection(ir, rd('notation/lib/glyphs.json'), Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques: rd('notation/registry/techniques.json'), fitBoxes: boxes }, C.engraving.layout));
  const it5 = m.systems.filter(s => s.part === LANE).flatMap(s => s.items);
  const ov = ir.overlays.find(o => o.kind === 'vibBows'), PB = ov ? ov.value.bows : [], ev = new Map(ir.events.map(e => [e.id, e]));
  const barOf = id => it5.filter(i => i.k === 'ringbar' && i.ev === id);
  ok(PB.length === 55 && PB.every(b => { const e = ev.get(b.event), br = barOf(b.event), end = e.onset + e.duration; return br.length === 1 && br[0].t1 <= end + 1e-9 && Math.abs((br[0].t1Bow != null ? br[0].t1Bow : br[0].t1) - end) < 1e-9 &&
    it5.some(i => i.k === 'glyph' && i.g === 'notehead-open' && Math.abs(i.t - e.onset) < 0.041); }), 'every bow a head at its time and ONE bar to x(t1) — or cut short of its successor (2h.1) — ' + PB.length + ' bows (R01c)');
  // [2h.1, §474] THE CLEARANCE: a bar ends `after` before the leftmost ink of the lane's next unit at or after its end (the successor:
  // a head within afterAbutS before the bow's end, or later); the 6.84 s bar (his image, "6.78 … going into the accidental") is cut
  {
    const VB = C.engraving.layout.devices.byEnv.vibBow, AF = VB.after, AB = VB.afterAbutS, G = rd('notation/lib/glyphs.json'), tsX = C.engraving.layout.textEmScale != null ? C.engraving.layout.textEmScale : 1.3;
    const INKY = i => i.k === 'ledger' || i.k === 'ottava' || (i.k === 'glyph' && /^(notehead|accidental-)/.test(i.g || ''));
    const leftAt = new Map();
    for (const i of it5) { if (i.t === undefined || !INKY(i)) continue; const e2 = Fit.inkOf(i, G, tsX); if (!e2) continue; const k = Math.round(i.t * 1e6); leftAt.set(k, Math.min(leftAt.has(k) ? leftAt.get(k) : Infinity, e2.l)); }
    const heads = [...leftAt.entries()].map(([k, l]) => ({ t: k / 1e6, l })).sort((a, b) => a.t - b.t);
    const bars = it5.filter(i => i.k === 'ringbar'), cut = bars.filter(i => i.t1Bow != null);
    let worst = Infinity, through = 0;
    for (const bar of bars) {
      const nx = heads.find(h => h.t > bar.t0 + 1e-6 && h.t >= (bar.t1Bow != null ? bar.t1Bow : bar.t1) - AB);
      if (!nx) continue;
      const gap = nx.t * sps + nx.l - bar.t1 * sps;
      worst = Math.min(worst, gap); if (gap < AF - 1e-4) through++;   // the layout rounds t1 to 1 µs = 2e-5 ss at 18.65 ss/s
    }
    const b684 = bars.find(i => i.t1Bow != null && Math.abs(i.t1Bow - 6.84) < 0.05);
    // [§483] the 8va label is ink: the bar ending at 78.947 s stops `after` before the 79.00 s unit's label (which stands left of its head)
    const ot79 = it5.find(i => i.k === 'ottava' && Math.abs(i.t - 78.997) < 0.02), b79 = bars.find(i => (i.t1Bow != null ? i.t1Bow : i.t1) > 78.9 && (i.t1Bow != null ? i.t1Bow : i.t1) < 78.96);
    const lab79 = ot79 && b79 ? (ot79.t * sps + ot79.dx0Ss) - b79.t1 * sps : NaN;
    ok(ot79 && ot79.dx0Ss < -1 && b79 && b79.t1Bow != null && Math.abs(lab79 - AF) < 1e-4, 'THE 8va LABEL IS INK (§483): the 79.00 s unit\'s bracket starts at ' + (ot79 ? ot79.dx0Ss.toFixed(3) : '?') + ' ss (its label left of the head); the bar before it cut to ' + (isFinite(lab79) ? lab79.toFixed(3) : '—') + ' ss short of the label');
    ok(AF === 0.25 && !through && !!b684 && cut.length > 0, 'THE CLEARANCE (2h.1): every bar ends ≥ after (' + AF + ' ss) before its successor\'s leftmost ink — ' + cut.length + ' of ' + bars.length + ' bars cut, the tightest gap ' + (isFinite(worst) ? worst.toFixed(3) : '—') + ' ss; the 6.84 s bar cut by ' + (b684 ? ((b684.t1Bow - b684.t1) * sps).toFixed(2) + ' ss' : 'NOT CUT'));
  }
  ok(!it5.some(i => i.k === 'goline' || i.k === 'stem' || /curve$/.test(i.k)), 'no go line, no stem, no level curve on the lane (anchor A; §464)');
  const side = t => { const b = PB.find(q => Math.abs(q.t0 - t) < 0.02 && barOf(q.event)[0]); const x = barOf(b.event)[0]; return x.segs ? x.segs.map(s => s.side).join('→') : String(x.side || 0); };
  ok(side(16.99) === '-1' && side(20.93) === '1→-1' && side(22.70) === '1', 'the close rule\'s SIDES: the unison 20.93 … 22.64 (the sounding bar keeps its side, the entering one takes the other), then the second 22.70 … 26.86 (the 84 under the 86) — sides ' + [16.99, 20.93, 22.70].map(side).join(' | '));
  // [2h.4, §477] FLUSH: a close bar keeps its full height (no hFrac) and sits off its head by ±(head/2 + bar/2); a segment steps
  {
    const G = rd('notation/lib/glyphs.json'), OFF = G.notehead.open.hSs / 2 + C.engraving.render.ringBar.hSs / 2;
    const close = it5.filter(i => i.k === 'ringbar' && i.side), off = t => { const b = PB.find(q => Math.abs(q.t0 - t) < 0.02); const x = barOf(b.event)[0]; return x.segs ? x.segs.map(s => s.offSs).join('→') : String(x.offSs); };
    ok(close.length > 0 && close.every(i => i.hFrac == null && Math.abs(Math.abs(i.offSs) - OFF) < 1e-3 && (!i.segs || i.segs.every(s => Math.abs(Math.abs(s.offSs) - OFF) < 1e-3 && Math.sign(s.offSs) === s.side))),
      'FLUSH (2h.4): every close bar whole, off its head by ±' + OFF.toFixed(3) + ' ss (head ' + G.notehead.open.hSs + ' / 2 + bar ' + C.engraving.render.ringBar.hSs + ' / 2) — ' + close.length + ' close bars; 16.99 ' + off(16.99) + ' · 20.93 ' + off(20.93) + ' · 22.70 ' + off(22.70));
  }
  const heads = t => it5.filter(i => i.k === 'glyph' && i.g === 'notehead-open' && Math.abs(i.t - t) < 0.02).map(i => +i.dxSs.toFixed(3));
  ok([56.12, 141.38].every(t => { const h = heads(t); return h.length === 2 && Math.abs(Math.abs(h[1] - h[0]) - 1.107) < 0.01; }), 'the shared attacks a second apart are displaced by the chord column (#2 D.6) — 56.12 s ' + heads(56.12).join(' · ') + ' · 141.38 s ' + heads(141.38).join(' · '));
  // the drawn marks read off the page in x order = the reader's, bow by bow
  const xOf = (t, dx) => t * sps + (dx || 0);
  let same = 0, wrongSide = 0; const bad = [];
  for (const b of PB) {
    const mine = it5.filter(i => i.ev === b.event && (i.seq === 'vibMark' || i.seq === 'vibHairpin'));
    const txt = mine.map(i => ({ i, x: i.k === 'hairpin-timed' ? Math.max(xOf(i.t0, i.dx0Ss), i.after ? xOf(i.after.t, i.after.dxSs) : -Infinity) : xOf(i.t, i.dxSs) }))
      .sort((a, c) => a.x - c.x).map(q => q.i.k === 'hairpin-timed' ? (q.i.dir === 'cresc' ? '<' : '>') : q.i.k === 'niente' ? '○' : q.i.g.replace('dyn-', '')).join(' ');
    if (txt === VM.text(b)) same++; else bad.push(b.t0.toFixed(2) + ' "' + txt + '" ≠ "' + VM.text(b) + '"');
    wrongSide += mine.filter(i => (b.voice === 'upper') !== (i.ySs > 0)).length;
  }
  ok(same === PB.length, 'the drawn marks are the reader\'s, bow by bow (' + same + ' / ' + PB.length + ')' + (bad.length ? ' — ' + bad.slice(0, 3).join(' · ') : ''));
  ok(!wrongSide, 'every mark on its voice\'s side — the upper voice above the staff, the lower below');
  // [2h.5 · 2h.6, §478] THE CLOSING MARK right-justified to the bar's end when it would run past it; THE HAIRPIN 1.333 tall, its near edge
  // never nearer the staff than the row's edge floor, every name on its bow's axis
  {
    const MKc = C.engraving.layout.devices.byEnv.vibBow.marks, G = rd('notation/lib/glyphs.json');
    const hw = i => i.k === 'niente' ? i.diaSs / 2 : G.dynamic[i.g.replace('dyn-', '')].wSs / 2;
    let past = 0, snapped = 0, closes = 0; const missing = [];
    for (const b of PB) {
      const last = b.marks[b.marks.length - 1]; if (!last || last.kind === 'hairpin' || last.start) continue;
      closes++;
      const bar = barOf(b.event)[0];
      const it = it5.find(i => i.ev === b.event && i.seq === 'vibMark' && (Math.abs(i.t - last.t) < 1e-6 || Math.abs(i.t - bar.t1) < 1e-6) && (last.kind === 'niente' ? i.k === 'niente' : i.g === 'dyn-' + last.name));
      if (!it) { missing.push(b.t0.toFixed(2)); continue; }
      const right = (it.t - bar.t1) * sps + it.dxSs + hw(it);
      if (right > 1e-6) past++;
      if (Math.abs(it.t - bar.t1) < 1e-9 && Math.abs(right) < 1e-6) snapped++;
    }
    ok(!past && !missing.length && snapped > 0, 'THE CLOSING MARK (2h.5): no closing name past its bar\'s end; ' + snapped + ' of ' + closes + ' right-justified to it, the rest at their point' + (missing.length ? ' — not found at ' + missing.join(' ') : ''));
    const hps = it5.filter(i => i.k === 'hairpin-timed'), names = it5.filter(i => i.seq === 'vibMark');
    const edgeOk = hps.every(h => h.hSs === MKc.heightSs && (h.ySs > 0 ? h.ySs - h.hSs / 2 >= MKc.upperEdge - 1e-6 : h.ySs + h.hSs / 2 <= MKc.lowerEdge + 1e-6));
    const onAxis = names.every(n => { const h = hps.find(x => x.ev === n.ev); return !h || Math.abs(h.ySs - n.ySs) < 1e-6; });
    ok(MKc.heightSs === 1.333 && MKc.upperEdge === 4.267 && MKc.lowerEdge === -4.267 && hps.length > 0 && edgeOk && onAxis,
      'THE HAIRPIN DOUBLED (2h.6): ' + hps.length + ' timed hairpins ' + MKc.heightSs + ' ss tall, the near edge never nearer the staff than ±' + MKc.upperEdge + ' (2g\'s axis 4.6 − 0.333), every name on its bow\'s axis');
  }
  // [2h.7, §479] THE NATURAL IN THE COLUMN: 56.123 s — ♯ on the C♯6 (ev-wc-3179) and ♮ on the C6 (ev-wc-3180), the one staff line
  {
    const accAt = t => it5.filter(i => i.k === 'glyph' && /^accidental-/.test(i.g) && Math.abs(i.t - t) < 0.02).map(i => i.g.replace('accidental-', '') + '@' + i.ySs).sort();
    const a56 = accAt(56.123), a141 = accAt(141.38);
    ok(C.engraving.layout.accNaturalInColumn === true && a56.join(' ') === 'natural@4 sharp@4', 'THE NATURAL IN THE COLUMN (2h.7): 56.123 s ♯ and ♮ on the one line — ' + a56.join(' · ') + ' · 141.38 s ' + (a141.join(' · ') || 'no sign'));
    // [§482] the two signs keep objects.accidental.betweenSs between them (LilyPond's padding 0.2) — the port had them touching
    const G2 = rd('notation/lib/glyphs.json'), BT = C.engraving.layout.chordColumn.minLateralGap;
    const gapAt = t => { const s = it5.filter(i => i.k === 'glyph' && /^accidental-/.test(i.g) && Math.abs(i.t - t) < 0.02).map(i => { const g = G2.accidental[i.g.replace('accidental-', '')], ax = i.align === 'noteY' && g.anchors && g.anchors.noteY ? g.anchors.noteY.x : g.wSs / 2; return { l: i.dxSs - ax, r: i.dxSs + g.wSs - ax }; }).sort((a, b) => a.l - b.l); return s.length === 2 ? s[1].l - s[0].r : NaN; };
    ok(BT === 0.2 && Math.abs(gapAt(56.123) - BT) < 1e-6 && Math.abs(gapAt(141.38) - BT) < 1e-6, 'THE GAP BETWEEN THE SIGNS (§482): ' + BT + ' ss (accidental.betweenSs → chordColumn.minLateralGap) — 56.123 s ' + gapAt(56.123).toFixed(3) + ' · 141.38 s ' + gapAt(141.38).toFixed(3));
  }
  const dev = Layout.deviceResolver(ir, C.engraving.layout);
  const anim = AnimObj.collect(ir, null, C.animated, { parts, meta: false, deviceOf: dev, drawnOf: e => Layout.drawnLevelSamples(e, dev(e) || {}) })
    .filter(i => i.part === LANE && (i.t0 != null ? i.t0 : i.at || 0) < ov.target.span[1] && (i.t1 != null ? i.t1 : Infinity) > ov.target.span[0]);
  ok(!anim.length, 'no meter, follower or pie on the lane over the bows (the marks are the level, §464) — ' + anim.length + ' animated device(s)');
  // [2h.4, §477] THE PROBE PAGE lgmf-vib-close-probe (tools/vib_close_probe.js): four pairs sounding together — the same line · a second ·
  // a third · a fourth — under closeRule.withinSs; the pairs within it flush, the rest centred; every pair columned (no two heads at one x)
  const PROBE = path.join(ROOT, 'notation', 'ir', 'lgmf-vib-close-probe.ir.json');
  if (fs.existsSync(PROBE)) {
    const pr = rd('notation/ir/lgmf-vib-close-probe.ir.json');
    const mp = Layout.layoutSection(pr, rd('notation/lib/glyphs.json'), Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques: rd('notation/registry/techniques.json'), fitBoxes: boxes }, C.engraving.layout));
    const ip = mp.systems.filter(s => s.part === LANE).flatMap(s => s.items), W = C.engraving.layout.devices.byEnv.vibBow.closeRule.withinSs;
    const pairs = pr.overlays[0].value.bows.reduce((a, b) => { (a[b.t0] = a[b.t0] || []).push(b); return a; }, {});
    const rows = Object.values(pairs).map(([a, b]) => {
      const ba = ip.find(i => i.k === 'ringbar' && i.ev === a.event), bb = ip.find(i => i.k === 'ringbar' && i.ev === b.event);
      const hs = ip.filter(i => i.k === 'glyph' && /^notehead/.test(i.g) && Math.abs(i.t - a.t0) < 0.02);
      const d = Math.abs(bb.ySs - ba.ySs), flush = d < W - 1e-9;
      return { what: b.what, d, flush, okFlush: flush ? (ba.offSs < 0 && bb.offSs > 0 && ba.hFrac == null) : (ba.offSs == null && bb.offSs == null), columned: hs.length === 2 && (d > 0.5 + 1e-9 || Math.abs(hs[0].dxSs - hs[1].dxSs) > 0.5) };
    });
    ok(rows.length === 4 && rows.every(r => r.okFlush && r.columned) && !mp.warnings.length, 'THE PROBE PAGE: ' + rows.map(r => r.what.replace(/ \(.*$/, '') + ' Δ' + r.d.toFixed(2) + ' ' + (r.flush ? 'flush' : 'centred')).join(' · ') + ' (withinSs ' + W + '); the same-line and second pairs columned, no warnings' + (mp.warnings.length ? ' — ' + mp.warnings.slice(0, 2).join(' · ') : ''));
    const pa = ip.filter(i => i.k === 'glyph' && /^accidental-/.test(i.g) && Math.abs(i.t - 2) < 0.02).map(i => i.g.replace('accidental-', '')).sort().join(' ');
    ok(pa === 'natural sharp', 'THE PROBE PAGE (2h.7): the one-line pair G5 · G♯5 carries ♮ and ♯ — ' + (pa || 'no sign'));
  }
}

// the totals, for the record
const starts = B.filter(b => b.marks.some(m => m.start)).length, ends = B.reduce((a, b) => a + b.marks.filter(m => m.kind !== 'hairpin' && !m.start).length, 0);
console.log('   --  ' + B.filter(b => b.marks.some(m => m.kind === 'hairpin')).length + ' bows move · ' + B.filter(b => b.marks.filter(m => m.kind === 'hairpin').length > 1).length +
  ' turn inside · ' + B.filter(b => !b.marks.length).length + ' bare · ' + starts + ' start names or circles (§463 rule 7: ≈ 90 where one a bow would be 156) · ' + ends + ' names reached');
console.log('');
console.log(failures ? 'VIB MARKS RED: ' + failures + ' of ' + checks + ' checks failed' : 'VIB MARKS GREEN: ' + checks + ' checks');
process.exit(failures ? 1 : 0);
