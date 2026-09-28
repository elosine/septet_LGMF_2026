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
  ok(j1 && T(j1) === 'mp > p' && j1.cross && j1.restart && j2 && j2.startName === 'p' && VM.stepsAt(S.objects.find(o => o.id === j2.id), j2.t0, L) < 1.5,
    'THE CARRY at the join 42.65 → 48.89 s: "' + (j1 && T(j1)) + ' | ' + (j2 && T(j2)) + '" — the second bow starts on the carried p although its level ' + (j2 ? j2.startSteps.toFixed(2) : '?') + ' rounds to pp (§463 wrinkle 2)');
  const b33 = at(R01, 33.16);
  ok(b33 && T(b33) === '< p' && b33.startName === 'pp', 'rule 1\'s second tier: the 33.16 s bow rises ' + (b33 ? (b33.endSteps - b33.startSteps).toFixed(2) : '?') + ' step onto a new name — "' + (b33 && T(b33)) + '" from the carried ' + (b33 && b33.startName) + ' (2h.8: the start name not restated)');
  const b56 = at(R01, 56.12, 84);
  ok(b56 && T(b56) === '> pp < p' && b56.startName === 'p', 'the turn inside a bow is named — 56.12 s "' + (b56 && T(b56)) + '" from the carried ' + (b56 && b56.startName));
  const firsts = [0, 1].map(c => B.filter(b => b.group === R01 && b.chain === c)[0]);
  ok(firsts.every(b => b && T(b) === '○ < pp' && b.restart), 'the fade from niente, timed: both chains\' first bows open "○ < pp" — ' +
    firsts.map(b => b.t0.toFixed(2) + ' s "' + T(b) + '" pp at ' + b.marks.find(m => m.name === 'pp').t.toFixed(2) + ' s (the bow\'s end — the fade runs 2 … 8 s)').join(' · '));
  const lasts = [0, 1].map(c => B.filter(b => b.group === R01 && b.chain === c).slice(-1)[0]);
  ok(lasts.every(b => b && /(^| )> ppp$/.test(T(b))), 'the fade-out to the level reached: R01c\'s last bows end "> ppp" (its save falls to ppp) — ' + lasts.map(b => b.t0.toFixed(2) + ' s "' + T(b) + '"').join(' · '));
  // the R01c stretch of §463's rendering, seat 1 (the chain of the 33.16 s bow), 33 … 95 s — pinned under the rules. §463's reading was the
  // --his probe before rules 1 · 2 · 7 and in the probe's level mapping; where the rules change it: the carry (48.89 starts on p) · rule 1's
  // second tier (48.89's first dip p > pp, 0.34 step) · writtenAt's mapping (48.89 and 79.00 end on p, the probe's on mp) · [2h.8, §480]
  // the start name only at a restart (2h.8) — and under 2i.2's rows by SEAT no voice switch ever: every name here is one reached, every
  // hairpin departs from its row's carried name ("pp < p" → "< p", "p > pp < mp > p" → "> pp < mp > p", the bare bows bare)
  const seat = at(R01, 33.16).chain;
  const got = B.filter(b => b.group === R01 && b.chain === seat && b.t0 >= 33 && b.t0 <= 95).map(b => T(b) || '·').join(' | ');
  // [§496] the crosses at 42.65 and 72.32 s restart both rows: "mp > p" and "pp < mp" carry their start names again
  const WANT = '< p | < mp | mp > p | > pp < mp > p | > pp < p | < mp > p | > pp | pp < mp | > p | > pp | · | ·';
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
    ok(!restated.length && b79 && T(b79) === '> p' && b72 && T(b72) === 'pp < mp' && b72.cross && !R.vibMarks.startOnMove && R.vibMarks.startOnVoiceSwitch === true,
      'THE START NAME (2h.8 · §496): only at a restart (' + B.filter(b => b.restart && b.marks[0] && b.marks[0].start).length + ' — ' + B.filter(b => b.restart && !b.cross && b.marks[0] && b.marks[0].start).length + ' first bows or rests, ' + B.filter(b => b.cross && b.marks[0] && b.marks[0].start).length + ' at the crosses) or a voice switch (' + B.filter(b => b.switched && !b.restart && b.marks[0] && b.marks[0].start).length + ') — ' + starts.length + ' of 156; 72.32 s is a cross ("' + (b72 && T(b72)) + '", the row begins again) and 79.00 s reads "' + (b79 && T(b79)) + '" (his "mp mp" gone)' + (restated.length ? ' — restated: ' + restated.slice(0, 4).map(b => b.t0).join(' ') : ''));
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

// (4) the rows — by SEAT (2i.2, §487; his B): a chain keeps one row through its sequence — chain 0 the top when its first bow of the
// sequence sounds at or above chain 1's first (a tie → chain 0 top) — EXCEPT at a CROSS (§496, one player two bows): at a rhythmic
// unison with a clear top and bottom the higher note takes the top row from there, both bows restart; no voice switch otherwise
{
  const groups = [...new Set(B.map(b => b.group))]; let wrong = 0, switches = 0, crosses = 0; const sites = [];
  const staffStep = m => { const s = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][m % 12]; return (Math.floor(m / 12) - 1) * 7 + s; };
  for (const g of groups) {
    const bows = B.filter(b => b.group === g).sort((a, b) => a.t0 - b.t0);
    const f0 = bows.find(b => b.chain === 0), f1 = bows.find(b => b.chain === 1);
    let top = !f0 ? 1 : !f1 ? 0 : f0.midi >= f1.midi ? 0 : 1;
    for (const b of bows) {
      const mate = bows.find(x => x.chain !== b.chain && Math.abs(x.t0 - b.t0) <= R.vibMarks.crossS + 1e-9);
      if (mate && b.chain === 0 && Math.abs(staffStep(b.midi) - staffStep(mate.midi)) >= R.vibMarks.crossSteps) { top = b.midi >= mate.midi ? 0 : 1; crosses++; sites.push(b.t0.toFixed(2)); if (!b.cross || !mate.cross || !b.restart || !mate.restart) wrong++; }
      if ((b.voice === 'upper') !== (b.chain === top)) wrong++; if (b.switched) switches++;
    }
  }
  ok(!wrong && !switches && R.vibMarks.rows === 'seat' && R.vibMarks.crossAtUnison === true && crosses === 9, 'THE ROWS BY SEAT, CROSSING AT A RHYTHMIC UNISON (2i.2 · §496): every bow in its chain\'s row as of the last cross; ' + crosses + ' rhythmic unisons with a clear top and bottom across ' + groups.length + ' sequences, each a restart of both rows (' + sites.slice(0, 9).join(' · ') + '); no voice switch (' + switches + ')' + (wrong ? ' — ' + wrong + ' wrong' : ''));
}

// (5) THE PAGE — the proto `lgmf-vib-proto` (PLAN 2g.5 → 2h → 2i) as export_video lays it out, re-runnable
const PROTO = path.join(ROOT, 'notation', 'ir', 'lgmf-vib-proto.ir.json');
if (fs.existsSync(PROTO) && !process.argv.includes('--score')) {
  console.log('THE PAGE — lgmf-vib-proto (the video realization)');
  const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js')), Fit = require(path.join(ROOT, 'notation', 'lib', 'fit.js')), AnimObj = require(path.join(ROOT, 'notation', 'lib', 'animobj.js'));
  const C = require(path.join(ROOT, 'notation', 'lib', 'rules.js')).loadContainer(ROOT);
  const ENS = Layout.ensembleFor(rd('notation/registry/ensemble.json'), C.realizations['video-jury']), parts = ENS.parts.map(p => p.part);
  const boxes = Fit.boxesFor(C, ENS, parts), sps = boxes.ssPerSec, BOX = boxes.byKey[String(LANE)];
  const G = rd('notation/lib/glyphs.json'), TQ = rd('notation/registry/techniques.json');
  const lay = ir => Layout.layoutSection(ir, G, Object.assign({ m4AttackLines: false, frameParts: parts, ensemble: ENS, techniques: TQ, fitBoxes: boxes }, C.engraving.layout));
  const ir = rd('notation/ir/lgmf-vib-proto.ir.json'), m = lay(ir);
  const it5 = m.systems.filter(s => s.part === LANE).flatMap(s => s.items);
  const ov = ir.overlays.find(o => o.kind === 'vibBows'), PB = ov ? ov.value.bows : [], ev = new Map(ir.events.map(e => [e.id, e]));
  const barOf = id => it5.filter(i => i.k === 'ringbar' && i.ev === id);
  ok(PB.length === 55 && PB.every(b => { const e = ev.get(b.event), br = barOf(b.event), end = e.onset + e.duration; return br.length === 1 && br[0].t1 <= end + 1e-9 && Math.abs((br[0].t1Bow != null ? br[0].t1Bow : br[0].t1) - end) < 1e-9 && br[0].dx0Ss === 0 &&
    it5.some(i => i.k === 'glyph' && i.g === 'notehead-open' && Math.abs(i.t - e.onset) < 0.041); }), 'every bow a head at its time and ONE bar from x(t) to x(t1) on its track — or cut short of its successor (2h.1, kept on the tracks at §490) — ' + PB.length + ' bows (R01c)');
  // [2h.1 · §490] THE CLEARANCE on the tracked bars: a bar ends `after` before the leftmost ink of the lane's next unit at or after its end
  // — the accidental, the ledger, the head or the 8va label — whatever the bar's height; his eye at 11.76 s: "the duration line should end.
  // There should be whatever gap was meant to be and then the accidental"
  {
    const VB = C.engraving.layout.devices.byEnv.vibBow, AF = VB.after, AB = VB.afterAbutS, tsX = C.engraving.layout.textEmScale != null ? C.engraving.layout.textEmScale : 1.3;
    const INKY = i => i.k === 'ledger' || i.k === 'ottava' || (i.k === 'glyph' && /^(notehead|accidental-)/.test(i.g || ''));
    const leftAt = new Map();
    for (const i of it5) { if (i.t === undefined || !INKY(i)) continue; const e2 = Fit.inkOf(i, G, tsX); if (!e2) continue; const k = Math.round(i.t * 1e6); leftAt.set(k, Math.min(leftAt.has(k) ? leftAt.get(k) : Infinity, e2.l)); }
    const heads = [...leftAt.entries()].map(([k, l]) => ({ t: k / 1e6, l })).sort((a, b) => a.t - b.t);
    const bars0 = it5.filter(i => i.k === 'ringbar'), cut = bars0.filter(i => i.t1Bow != null);
    let worst = Infinity, through = 0;
    for (const bar of bars0) {
      const nx = heads.find(h => h.t > bar.t0 + 1e-6 && h.t >= (bar.t1Bow != null ? bar.t1Bow : bar.t1) - AB);
      if (!nx) continue;
      const gap = nx.t * sps + nx.l - bar.t1 * sps;
      worst = Math.min(worst, gap); if (gap < AF - 1e-4) through++;
    }
    const b1176 = bars0.find(i => i.t1Bow != null && Math.abs(i.t1Bow - 11.76) < 0.1), ot79 = it5.find(i => i.k === 'ottava' && Math.abs(i.t - 78.997) < 0.02), b79 = bars0.find(i => (i.t1Bow != null ? i.t1Bow : i.t1) > 78.9 && (i.t1Bow != null ? i.t1Bow : i.t1) < 78.96);
    ok(AF === 0.25 && !through && cut.length > 0 && !!b1176 && b79 && b79.t1Bow != null && ot79 && Math.abs((ot79.t * sps + ot79.dx0Ss) - b79.t1 * sps - AF) < 1e-4,
      'THE CLEARANCE (2h.1 · §490, on the tracks): every bar ends ≥ ' + AF + ' ss before its successor\'s leftmost ink — ' + cut.length + ' of ' + bars0.length + ' bars cut, the tightest gap ' + (isFinite(worst) ? worst.toFixed(3) : '—') + '; the bar before 11.76 s cut ' + (b1176 ? ((b1176.t1Bow - b1176.t1) * sps).toFixed(2) + ' ss' : 'NOT') + '; the bar before the 79.00 s 8va label cut 0.25 short of the label');
  }
  ok(!it5.some(i => i.k === 'goline' || i.k === 'stem' || /curve$/.test(i.k)), 'no go line, no stem, no level curve on the lane (anchor A; §464)');
  ok(!m.warnings.length, 'no layout warnings' + (m.warnings.length ? ' — ' + m.warnings.slice(0, 2).join(' · ') : ''));
  // [2i.3, §487] THE PINS: every top mark and hairpin on ONE axis — the hairpin's top on the lane's top edge + the lift (the percussion
  // staff off over the proto); every bottom one on ONE axis — its bottom on the lane's bottom edge; the names on the axis; exempt from the fit
  const MKc = C.engraving.layout.devices.byEnv.vibBow.marks, H = MKc.heightSs;
  const hps = it5.filter(i => i.k === 'hairpin-timed'), names = it5.filter(i => i.seq === 'vibMark'), bars = it5.filter(i => i.k === 'ringbar');
  const topAxis = +(BOX.top + MKc.liftSs - H / 2).toFixed(4), botAxis = +(-BOX.bot + H / 2).toFixed(4);
  const axes = a => [...new Set(a.map(x => x.ySs))].join();
  ok(MKc.pin === 'lane' && MKc.rows === 'seat' && axes(hps.concat(names).filter(x => x.ySs > 0)) === String(topAxis) && axes(hps.concat(names).filter(x => x.ySs < 0)) === String(botAxis) && hps.every(h => h.hSs === H) && hps.concat(names).every(x => x.pinned),
    'THE PINS (2i.3): every top mark and hairpin on ONE axis ' + topAxis + ' (the hairpin\'s top on the lane\'s top ' + BOX.top.toFixed(3) + ' + the lift ' + MKc.liftSs + ' — the percussion staff off here), every bottom one on ' + botAxis + ' (its bottom on the lane\'s bottom −' + BOX.bot.toFixed(3) + '); ' + hps.length + ' hairpins ' + H + ' tall, ' + names.length + ' names and circles, all exempt from the fit');
  // [2i.3] THE TRACKS: every bar whole on its seat's track, trackGapSs beyond the hairpin's inner edge; no flush, no side
  const RBH = C.engraving.render.ringBar.hSs, topTrack = +(topAxis - H / 2 - MKc.trackGapSs - RBH / 2).toFixed(4), botTrack = +(botAxis + H / 2 + MKc.trackGapSs + RBH / 2).toFixed(4);
  const voiceOf = id => (PB.find(q => q.event === id) || {}).voice;
  ok(MKc.barTrack === true && bars.length === PB.length && bars.every(b => (b.track === 'top' && b.ySs === topTrack && voiceOf(b.ev) === 'upper') || (b.track === 'bottom' && b.ySs === botTrack && voiceOf(b.ev) === 'lower')) && bars.every(b => b.offSs == null && !b.segs && b.seat === (voiceOf(b.ev) === 'upper' ? 0 : 1)),
    'THE TRACKS (2i.3): every bar on its seat\'s track — navy (the top row, seat 0) at ' + topTrack + ', olive (the bottom, seat 1) at ' + botTrack + ' (' + MKc.trackGapSs + ' beyond the hairpin); ' + bars.filter(b => b.track === 'top').length + ' · ' + bars.filter(b => b.track === 'bottom').length + '; no flush, no side');
  // [2i, §486] NO HEAD under a hairpin's band or the other seat's bar — 24 · 29 of 156 without the lift, in today's lane
  {
    let hit = 0, barHit = 0;
    for (const b of PB) {
      const u = it5.filter(i => i.t !== undefined && Math.abs(i.t - b.t0) < 0.02 && (i.k === 'ledger' || (i.k === 'glyph' && /^(notehead|accidental-)/.test(i.g || '')))).map(i => Fit.inkOf(i, G, 1.3)).filter(Boolean);
      if (!u.length) continue;
      const hi = Math.max(...u.map(e => e.hi)), lo = Math.min(...u.map(e => e.lo)), xl = b.t0 * sps + Math.min(...u.map(e => e.l)), xr = b.t0 * sps + Math.max(...u.map(e => e.r));
      for (const h of hps) { const xa = h.t0 * sps + (h.dx0Ss || 0), xb = h.t1 * sps + (h.dx1Ss || 0); if (xb < xl || xa > xr) continue; if (hi > h.ySs - h.hSs / 2 && lo < h.ySs + h.hSs / 2) hit++; }
      for (const bar of bars) { if (bar.ev === b.event) continue; if (bar.t0 < b.t0 - 1e-6 && bar.t1 > b.t0 + 1e-6 && hi > bar.ySs - RBH / 2 && lo < bar.ySs + RBH / 2) barHit++; }
    }
    ok(!hit && !barHit, 'NO HEAD UNDER A HAIRPIN OR THE OTHER SEAT\'S BAR (2i, §486): ' + hit + ' · ' + barHit + ' of ' + PB.length + ' bows (24 · 29 in today\'s lane without the lift)');
  }
  const heads = t => it5.filter(i => i.k === 'glyph' && i.g === 'notehead-open' && Math.abs(i.t - t) < 0.02).map(i => +i.dxSs.toFixed(3));
  ok([56.12, 141.38].every(t => { const h = heads(t); return h.length === 2 && Math.abs(Math.abs(h[1] - h[0]) - 1.107) < 0.01; }), 'the shared attacks on one line are displaced by the chord column (#2 D.6) — 56.12 s ' + heads(56.12).join(' · ') + ' · 141.38 s ' + heads(141.38).join(' · '));
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
  ok(!wrongSide, 'every mark in its seat\'s row — seat 0 above the staff, seat 1 below');
  // [2h.5, §478] THE CLOSING MARK right-justified to the bar's end when it would run past it
  {
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
  }
  // [2h.7, §479 · §482] THE NATURAL IN THE COLUMN and the gap between the two signs
  {
    const accAt = t => it5.filter(i => i.k === 'glyph' && /^accidental-/.test(i.g) && Math.abs(i.t - t) < 0.02).map(i => i.g.replace('accidental-', '') + '@' + i.ySs).sort();
    const a56 = accAt(56.123), a141 = accAt(141.38);
    ok(C.engraving.layout.accNaturalInColumn === true && a56.join(' ') === 'natural@4 sharp@4', 'THE NATURAL IN THE COLUMN (2h.7): 56.123 s ♯ and ♮ on the one line — ' + a56.join(' · ') + ' · 141.38 s ' + (a141.join(' · ') || 'no sign'));
    const BT = C.engraving.layout.chordColumn.minLateralGap;
    const gapAt = t => { const s = it5.filter(i => i.k === 'glyph' && /^accidental-/.test(i.g) && Math.abs(i.t - t) < 0.02).map(i => { const g = G.accidental[i.g.replace('accidental-', '')], ax = i.align === 'noteY' && g.anchors && g.anchors.noteY ? g.anchors.noteY.x : g.wSs / 2; return { l: i.dxSs - ax, r: i.dxSs + g.wSs - ax }; }).sort((a, b) => a.l - b.l); return s.length === 2 ? s[1].l - s[0].r : NaN; };
    ok(BT === 0.2 && Math.abs(gapAt(56.123) - BT) < 1e-6 && Math.abs(gapAt(141.38) - BT) < 1e-6, 'THE GAP BETWEEN THE SIGNS (§482): ' + BT + ' ss (accidental.betweenSs → chordColumn.minLateralGap) — 56.123 s ' + gapAt(56.123).toFixed(3) + ' · 141.38 s ' + gapAt(141.38).toFixed(3));
  }
  const dev = Layout.deviceResolver(ir, C.engraving.layout);
  const anim = AnimObj.collect(ir, null, C.animated, { parts, meta: false, deviceOf: dev, drawnOf: e => Layout.drawnLevelSamples(e, dev(e) || {}) })
    .filter(i => i.part === LANE && (i.t0 != null ? i.t0 : i.at || 0) < ov.target.span[1] && (i.t1 != null ? i.t1 : Infinity) > ov.target.span[0]);
  ok(!anim.length, 'no meter, follower or pie on the lane over the bows (the marks are the level, §464) — ' + anim.length + ' animated device(s)');
  // [2i.3, §486 · §487] THE PERCUSSION STAFF on the main file: its lines only over the opening snippet and the pages of its section
  {
    const P = rd('notation/ir/piece-lgmf.ir.json'), mp = lay(P);
    const st = mp.systems.filter(s => s.part === 4).flatMap(s => s.items.filter(i => i.k === 'staff')).map(s => [s.t0, s.t1]);
    const SH = C.engraving.layout.staffShown, PR = rd('notation/registry/page_rules.json');
    ok(SH && SH.part === 4 && SH.pageLeadInS === PR.leadInS && JSON.stringify(st.slice().sort((a, b) => a[0] - b[0])) === JSON.stringify([[-4, -3.75], [284, 416]]), 'THE PERCUSSION STAFF (2i.3, §486 · §488 · §489): on piece-lgmf its seven lines are drawn over ' + JSON.stringify(st) + ' — the 0.25 s snippet at the first page\'s start (−' + PR.leadInS + ' … −3.75) and the whole pages 284 … 416 (the pages start at −' + PR.leadInS + ' + k · 12; the section from 288.91, its last note 406.86); the vibraphone silent on them');
  }
}

// [2k.5] A MORPH'S BOWS (PLAN 2k.5, §506): the bloom `ACT-BLOOM-06` read with its group alone (a morph's notes carry no srcKind) — its
// 44 bows, every one on a seat and a voice; without `groupOnly` the sequence's reader sees none of them
{
  const g = 'grp-act-bloom-06-01', o = { bank, instKey: 'bowed_vibraphone', rules: R.vibMarks, groups: [g] };
  const rb = VM.read(S.objects, LANE, Object.assign({ groupOnly: true }, o)), r0 = VM.read(S.objects, LANE, o);
  ok(rb.bows.length === 44 && !rb.unplaced.length && rb.bows.every(b => b.chain >= 0 && (b.voice === 'upper' || b.voice === 'lower')) && !r0.bows.length,
    'A MORPH\'S BOWS (2k.5): the bloom ' + g + ' read with the group alone — ' + rb.bows.length + ' bows, chains ' + rb.bows.filter(b => b.chain === 0).length + ' · ' +
    rb.bows.filter(b => b.chain === 1).length + ', ' + rb.unplaced.length + ' unplaced; the sequence\'s filter alone reads ' + r0.bows.length);
}

// the totals, for the record
const starts =B.filter(b => b.marks.some(m => m.start)).length, ends = B.reduce((a, b) => a + b.marks.filter(m => m.kind !== 'hairpin' && !m.start).length, 0);
console.log('   --  ' + B.filter(b => b.marks.some(m => m.kind === 'hairpin')).length + ' bows move · ' + B.filter(b => b.marks.filter(m => m.kind === 'hairpin').length > 1).length +
  ' turn inside · ' + B.filter(b => !b.marks.length).length + ' bare · ' + starts + ' start names or circles (§463 rule 7: ≈ 90 where one a bow would be 156) · ' + ends + ' names reached');
console.log('');
console.log(failures ? 'VIB MARKS RED: ' + failures + ' of ' + checks + ' checks failed' : 'VIB MARKS GREEN: ' + checks + ' checks');
process.exit(failures ? 1 : 0);
