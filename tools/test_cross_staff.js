#!/usr/bin/env node
// test_cross_staff.js — PLAN 2i.4, the cross-staff group (NOTATION_STANDARDS §2; RUNNING_LOG §463, §521).
//   node tools/test_cross_staff.js
// A beamed cluster with members on BOTH staves of the piano's grand staff is laid out whole in the treble system: one beam above
// the treble staff, every stem up to it, the lower staff's ink moved by the staves' middle-to-middle distance (4 + 6 ss), the
// accent row on the beam side, the pair's rests on the treble staff, nothing in the bass system. A cluster on one staff (the bass
// four at 620.3) is unchanged. Runs on the MAIN notation file as built.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };

const glyphs = rd('notation/lib/glyphs.json'), C = rd('notation/registry/container.json');
const ens = rd('notation/registry/ensemble.json'), T = rd('notation/registry/techniques.json');
const ir = rd('notation/ir/piece-septet.ir.json');
const model = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: ens.parts.map(p => p.part), ensemble: ens, techniques: T }, C.engraving.layout));
const sys = k => model.systems.find(s => s.key === k);
const TRE = sys('2:0'), BAS = sys('2:1');
const clusterOf = new Map();
for (const ov of ir.overlays) if (ov.kind === 'engraving' && ov.value && ov.value.device && ov.value.device.clusterId) clusterOf.set(ov.target.event, ov.value.device.clusterId);
const members = cl => [...clusterOf].filter(([, c]) => c === cl).map(([ev]) => ir.events.find(e => e.id === ev)).sort((a, b) => a.onset - b.onset);
// the group whose first member is the piano's note at t (ids renumber with every build; the times do not)
const partOfEv = new Map(); for (const c of ir.chunks) for (const id of c.events || []) partOfEv.set(id, c.part);
const clusterAt = t => { const e = ir.events.find(x => partOfEv.get(x.id) === 2 && Math.abs(x.onset - t) < 0.002); return e ? clusterOf.get(e.id) : null; };
const C2C = 4 + C.engraving.layout.grandStaff.interStaffGapSs;

const CROSS = [
  // [E1, §527] re-pinned: 581.21 is a single since the piano's time cuts (§526) — the first cross-staff pair with no ottava after 587.32
  { cl: clusterAt(588.762), what: 'the pair at 588.76 (E6 → G3)', n: 2, rests: 2 },
  { cl: clusterAt(623.547), what: 'the last four, 623.39–623.85 (D♭3 · G2 · G♯5 · B1; the run\'s last note 624.00 stands alone, §545)', n: 4, rests: 0 },
];
for (const X of CROSS) {
  const ms = members(X.cl), ids = new Set(ms.map(e => e.id));
  ok(ms.length === X.n, X.what + ': ' + X.n + ' members in the build (got ' + ms.length + ')');
  const staves = new Set(ms.map(e => e.pitch.midi >= 60 ? 0 : 1));
  ok(staves.size === 2, X.what + ': members on both staves');
  ok(!BAS.items.some(it => ids.has(it.ev) || (it.t != null && ms.some(e => Math.abs(it.t - e.onset) < 1e-6))), X.what + ': nothing of the group in the bass system');
  const stems = TRE.items.filter(it => it.k === 'stem' && ids.has(it.ev));
  const beams = TRE.items.filter(it => it.k === 'beam' && it.tips.some(p => ms.some(e => Math.abs(p.t - e.onset) < 1e-6)));
  ok(beams.length === 2 && beams.every(b => b.dir === 'up'), X.what + ': ONE group, two beam levels, up (got ' + beams.length + ')');
  const level = beams.length ? Math.max(...beams.map(b => b.tips[0].ySs)) : NaN;
  ok(level > 2 && beams.every(b => b.tips.every(p => Math.abs(p.ySs - b.tips[0].ySs) < 1e-9)), X.what + ': the beam level and above the treble staff (' + (+level).toFixed(2) + ' ss)');
  ok(stems.length === X.n && stems.every(s => s.attach === 'up' && Math.abs(s.yB - level) < 1e-6), X.what + ': every stem up, ending on the beam');
  for (const e of ms) {
    const st = stems.find(s => s.ev === e.id), bass = e.pitch.midi < 60;
    ok(st && (bass ? st.yA < -2 - 6 + 1e-9 : st.yA > -2 - 1e-9), X.what + ': ' + e.id + ' stem starts on its ' + (bass ? 'bass' : 'treble') + ' staff (yA ' + (st && st.yA.toFixed(2)) + ')');
    const head = TRE.items.find(it => it.k === 'glyph' && /^notehead/.test(it.g) && Math.abs(it.t - e.onset) < 1e-6);
    ok(head && Math.abs(head.dxSs - glyphs.notehead.filled.wSs * 0.844 / 2) < 1e-6, X.what + ': ' + e.id + ' head left edge on its go time');
    if (bass && head) {
      const yBass = head.ySs + C2C;   // back on the bass staff's own coordinates
      ok(yBass >= -8 && yBass <= 8, X.what + ': ' + e.id + ' drawn ' + head.ySs.toFixed(2) + ' ss = ' + yBass.toFixed(2) + ' on the bass staff');
    }
  }
  const accents = TRE.items.filter(it => it.k === 'glyph' && it.g === 'artic-accent' && ms.some(e => Math.abs(it.t - e.onset) < 1e-6));
  ok(accents.length === X.n && accents.every(a => a.ySs > level && Math.abs(a.ySs - accents[0].ySs) < 1e-9), X.what + ': the accents on one row above the beam');
  ok(TRE.items.filter(it => it.k === 'gc' && ids.has(it.ev)).length === 1 && TRE.items.some(it => it.k === 'gc' && it.ev === ms[0].id), X.what + ': the GC on the first note only');
  ok(!TRE.items.some(it => it.k === 'goline' && ids.has(it.ev)), X.what + ': no go line');
  ok(TRE.items.filter(it => it.k === 'rest' && it.cluster === X.cl).length === X.rests, X.what + ': ' + X.rests + ' rests on the treble staff');
}
// one staff = as normal: [2j.4, §545] under the 611.50 cut no four lies wholly on the bass staff (the old bass four at 620.3 is now split
// across two fours); the one all-treble four, 618.73 (E7 · C8 · C6 · C♯7), stays in the treble system with its stems down
{
  const e0 = ir.events.find(x => partOfEv.get(x.id) === 2 && Math.abs(x.onset - 618.73) < 0.01);
  const ms = e0 ? members(clusterOf.get(e0.id)) : [], ids = new Set(ms.map(e => e.id));
  const stems = TRE.items.filter(it => it.k === 'stem' && ids.has(it.ev));
  ok(ms.length === 4 && ms.every(e => e.pitch.midi >= 60) && stems.length === 4 && stems.every(s => s.attach === 'down'), 'the treble four at 618.73: four stems down in the treble system, as normal (got ' + ms.length + ' members, ' + stems.filter(s => s.attach === 'down').length + ' stems down)');
  ok(ms.length === 4 && !BAS.items.some(it => ids.has(it.ev)), 'the treble four at 618.73: nothing in the bass system');
}
ok(!model.warnings.some(w => /beam group /.test(w)), 'no beam-group warnings anywhere');

// ---- [2i.5–2i.6] --groups 444-624.1: the rule as built (RUNNING_LOG §522) ----
{
  const S3 = [...new Set(clusterOf.values())].map(cl => members(cl)).filter(ms => ms[0].onset >= 444);
  const byPart = p => S3.filter(ms => partOfEv.get(ms[0].id) === p);
  const sizes = p => byPart(p).map(ms => ms.length);
  // re-pinned 2026-09-14 after his 17 note moves in two rounds, 488-623 s (RUNNING_LOG §523-§524): Fl 2 pairs · Vn1 5 + a triple · Vn2 8 · Va 4 + 2 · Vc 4 + 1
  // [2j.4, §545 — his verdicts 2026-09-16] every three is 2 + 1 (--threes 2+1): Vn1 620.56 · Va 622.01 · Va 623.20 · Vc 488.51 each a pair + a single;
  // the piano cut at 611.50 (--groupCuts 2@587.32,611.50): 42 pairs · 17 fours · the last note 624.00 its own GC
  const want = { 0: [2, 0, 0], 1: [7, 0, 0], 3: [6, 0, 0], 4: [8, 0, 0], 5: [6, 0, 0], 6: [5, 0, 0], 2: [42, 0, 17] };
  for (const p of Object.keys(want).map(Number)) {
    const s = sizes(p), got = [2, 3, 4].map(n => s.filter(x => x === n).length);
    ok(got.join() === want[p].join(), 'part ' + p + ': pairs · triples · fours = ' + want[p].join(' · ') + ' (got ' + got.join(' · ') + ')');
  }
  const pno = byPart(2).sort((a, b) => a[0].onset - b[0].onset);
  ok(pno.map(ms => ms.length).join('') === '2'.repeat(42) + '4'.repeat(17), 'the piano run (§526 · §545): 42 pairs from 587.32, then 17 fours from 611.50 — no triple');
  ok(pno.flat().length === 152 && Math.abs(pno[0][0].onset - 587.32) < 0.006 && Math.abs(pno[pno.length - 1][3].onset - 623.85) < 0.006, 'the piano run: 152 grouped notes, 587.32 → 623.85');
  const four1 = pno.find(ms => ms.length === 4);
  ok(!pno.some(ms => ms.length === 3) && four1 && Math.abs(four1[0].onset - 611.50) < 0.006, 'the piano run: the fours start at 611.50 (the old triple\'s third note)');
  const lastPno = ir.events.filter(e => e.env === 'strike' && partOfEv.get(e.id) === 2).sort((a, b) => b.onset - a.onset)[0];
  ok(lastPno && Math.abs(lastPno.onset - 624) < 0.002 && !clusterOf.has(lastPno.id), 'the piano\'s last note (624.00) stands alone with its own GC (his "2s then 4s then last one single")');
  ok(/ --groupCuts 2@587\.32,611\.5( |$)/.test(ir.provenance.build) && / --threes 2\+1( |$)/.test(ir.provenance.build), 'the recorded build carries --groupCuts 2@587.32,611.5 and --threes 2+1');
  {
    // [2j.4] the four other threes as 2 + 1: the pair's first two notes grouped, the third a single
    const S21 = [[3, 620.56, 621.30], [5, 622.01, 622.70], [5, 623.20, 623.84], [6, 488.51, 489.18]];
    let good = 0, flush = 0;
    const devOf2 = id => { const ov = ir.overlays.find(o => o.kind === 'engraving' && o.target.event === id); return ov ? ov.value.device : {}; };
    for (const [p, t0, t3] of S21) {
      const a = ir.events.find(e => partOfEv.get(e.id) === p && Math.abs(e.onset - t0) < 0.006), c = ir.events.find(e => partOfEv.get(e.id) === p && Math.abs(e.onset - t3) < 0.006);
      if (a && c && clusterOf.has(a.id) && members(clusterOf.get(a.id)).length === 2 && !clusterOf.has(c.id)) good++;
      // [2j.9, his 2026-09-16] the closing pair is 16th · 16th rest · 16th: no trailing rest, the beam flush on the last note (no run-on)
      if (a && clusterOf.has(a.id)) { const ms = members(clusterOf.get(a.id)); if (ms.length === 2 && ms.every(e => !devOf2(e.id).restAfter && !devOf2(e.id).beamOverRest) && devOf2(ms[1].id).rest16Before) flush++; }
    }
    ok(good === 4, 'the four threes are 2 + 1 — Vn1 620.56 · Va 622.01 · Va 623.20 · Vc 488.51: a pair and a single GC (got ' + good + ')');
    ok(flush === 4, 'each closing pair written 16th · 16th rest · 16th, the beam flush on the last note — no trailing rest, no run-on beam (got ' + flush + ')');
    const otherPairs = S3.filter(ms => ms.length === 2 && !S21.some(([p, t0]) => partOfEv.get(ms[0].id) === p && Math.abs(ms[0].onset - t0) < 0.006));
    ok(otherPairs.length === 72 && otherPairs.every(ms => devOf2(ms[1].id).restAfter === 1 && devOf2(ms[1].id).beamOverRest), 'every other pair keeps D61\'s writing — the rest after, the beam over it (' + otherPairs.length + ' of 76 pairs)');
  }
  const pSingles = ir.events.filter(e => e.env === 'strike' && partOfEv.get(e.id) === 2 && e.onset >= 581.2 && e.onset < 587.3);
  ok(pSingles.length === 16 && pSingles.every(e => !clusterOf.has(e.id)), 'the piano run: the 16 notes 581.21 → 586.96 are singles, no beam (his "a", §526) (got ' + pSingles.filter(e => !clusterOf.has(e.id)).length + ' of ' + pSingles.length + ')');
  ok(pno.filter(ms => ms.length === 4).every(ms => ms.slice(1).every((e, i) => e.onset - ms[i].onset < 0.25)), 'every four: every gap under 0.25 s');
  const triples = S3.filter(ms => ms.length === 3 && partOfEv.get(ms[0].id) !== 2).map(ms => partOfEv.get(ms[0].id) + '@' + ms[0].onset.toFixed(2)).sort();
  ok(triples.join() === '', 'no group of three anywhere (his 2026-09-16, §545: every three is 2 + 1 — D51\'s triple writing retired) (got ' + (triples.join(' ') || 'none') + ')');
  ok(S3.every(ms => ms.slice(1).every((e, i) => e.onset - ms[i].onset < 0.4)), 'every group: every gap under 0.4 s');
  const dyn = new Set([...ir.overlays].filter(ov => ov.kind === 'engraving' && ov.value.device && ov.value.device.clusterId && ov.value.device.dynMark).map(ov => ov.target.event));
  // [§529] superseded by the page rule (2i.7): a group carries no --dyn mark of its own — its members are on --dynOnChange (below)
  ok(S3.every(ms => ms.every(e => !dyn.has(e.id) || ir.overlays.find(ov => ov.kind === 'engraving' && ov.target.event === e.id).value.device.dynOnChange)), 'no cluster-written dynamic on a section-3 group — only the page rule\'s (D52 · 2i.7)');
  ok(S3.every(ms => { const acc = ms.map(e => ir.overlays.find(ov => ov.kind === 'engraving' && ov.target.event === e.id).value.device.nhArtic); return acc.every(a => a === 'accent'); }), 'every head in a group keeps its accent');
}

// ---- [2i E1] the ottava on the beam side · the chain clears the group's accent (RUNNING_LOG §527) ----
{
  const OT = glyphs.standards.ottava, GAP = C.engraving.layout.stackGapSs, aH = glyphs.articulation.accent.hSs;
  const symH = glyphs.articulation.snappizz.hSs * 0.707;
  const beamOf = (S, t) => S.items.filter(it => it.k === 'beam' && it.tips.some(p => Math.abs(p.t - t) < 1e-6));
  const at = (S, pred, t) => S.items.find(it => pred(it) && Math.abs(it.t - t) < 1e-6);
  // the pair at 592.89 (C8 under 15ma → D♭3): the accents below their own notes, the 15ma past the beam by the house gap
  {
    const ms = members(clusterAt(592.887));
    const bm = beamOf(TRE, ms[0].onset), level = Math.max(...bm.map(b => b.tips[0].ySs));
    const ott = TRE.items.find(it => it.k === 'ottava' && it.ev === ms[0].id);
    ok(ott && ott.dir === 'above' && ott.ySs - OT.hookLengthSs >= level + OT.standardGapSs - 1e-6, 'the pair at 592.89: the 15ma hook clears the beam by ' + OT.standardGapSs + ' (hook ' + (ott && (ott.ySs - OT.hookLengthSs).toFixed(2)) + ', beam ' + level.toFixed(2) + ')');
    for (const e of ms) {
      const head = at(TRE, it => it.k === 'glyph' && /^notehead/.test(it.g), e.onset), acc = at(TRE, it => it.k === 'glyph' && it.g === 'artic-accent', e.onset);
      ok(head && acc && acc.ySs < head.ySs && acc.ySs < level, 'the pair at 592.89: ' + e.id + ' accent below its note (' + (acc && acc.ySs.toFixed(2)) + ' under ' + (head && head.ySs.toFixed(2)) + ')');
    }
  }
  // the pair at 602.02 (8va above · 8vb below): the 8vb, on the accent's side, stacks outside the accent
  {
    const ms = members(clusterAt(602.018)), low = ms.find(e => e.pitch.midi < 60);
    const acc = at(TRE, it => it.k === 'glyph' && it.g === 'artic-accent', low.onset), ott = TRE.items.find(it => it.k === 'ottava' && it.ev === low.id);
    ok(acc && ott && ott.dir === 'below' && ott.ySs + OT.hookLengthSs <= acc.ySs - aH / 2 - GAP + 1e-6, 'the pair at 602.02: the 8vb hook outside the low note\'s accent by the house gap (hook ' + (ott && (ott.ySs + OT.hookLengthSs).toFixed(2)) + ', accent ' + (acc && acc.ySs.toFixed(2)) + ')');
  }
  // section 3, every group: a beam-side ottava clears its beam and leaves no accent past it
  let nOtt = 0, badOtt = 0;
  for (const S of model.systems) for (const o of S.items.filter(it => it.k === 'ottava' && it.t >= 444)) {
    const bm = beamOf(S, o.t); if (!bm.length) continue;
    const up = bm[0].dir === 'up'; if ((o.dir === 'above') !== up) continue;
    nOtt++;
    const edge = up ? Math.max(...bm.map(b => b.tips[0].ySs)) : Math.min(...bm.map(b => b.tips[0].ySs));
    const hookOk = up ? o.ySs - OT.hookLengthSs >= edge + OT.standardGapSs - 1e-6 : o.ySs + OT.hookLengthSs <= edge - OT.standardGapSs + 1e-6;
    const accPast = S.items.some(it => it.k === 'glyph' && it.g === 'artic-accent' && bm[0].tips.some(p => Math.abs(p.t - it.t) < 1e-6) && (up ? it.ySs > edge : it.ySs < edge));
    if (!hookOk || accPast) badOtt++;
  }
  ok(nOtt >= 20 && badOtt === 0, 'section 3: every beam-side ottava in a group clears its beam, no accent past that beam (' + nOtt + ' ottavas, ' + badOtt + ' not)');
  // Vn2's pair at 520.32 (his screenshot): the accent nearest each note, the snap-pizz sign past it by the house gap
  const VN2 = sys(4);
  for (const t of [520.316, 520.653]) {
    const head = at(VN2, it => it.k === 'glyph' && it.g === 'notehead', t), acc = at(VN2, it => it.k === 'glyph' && it.g === 'artic-accent', t), sg = at(VN2, it => it.k === 'glyph' && it.g === 'artic-snappizz', t);
    ok(head && acc && sg && Math.abs(acc.ySs - head.ySs) < Math.abs(sg.ySs - head.ySs) && Math.abs(sg.ySs - acc.ySs) - symH / 2 - aH / 2 >= GAP - 1e-6,
      'Vn2 ' + t.toFixed(2) + ': accent nearest the note, the sign past it by ' + GAP + ' (gap ' + (acc && sg ? (Math.abs(sg.ySs - acc.ySs) - symH / 2 - aH / 2).toFixed(2) : '?') + ')');
  }
  // section 3, every column with a technique symbol and an accent on the same side: that order and that gap
  let nCol = 0, badCol = 0;
  for (const S of model.systems) {
    for (const sg of S.items.filter(it => it.k === 'glyph' && /^artic-(snappizz|plus)$/.test(it.g) && it.t >= 444)) {
      const acc = S.items.find(it => it.k === 'glyph' && it.g === 'artic-accent' && Math.abs(it.t - sg.t) < 1e-6 && Math.abs(it.dxSs - sg.dxSs) < 1e-6);
      const head = S.items.find(it => it.k === 'glyph' && /^notehead/.test(it.g) && Math.abs(it.t - sg.t) < 1e-6 && Math.abs(it.dxSs - sg.dxSs) < 1e-6);
      if (!acc || !head || Math.sign(acc.ySs - head.ySs) !== Math.sign(sg.ySs - head.ySs)) continue;
      nCol++;
      const h = glyphs.articulation[sg.g.slice(6)].hSs * 0.707;
      if (!(Math.abs(acc.ySs - head.ySs) < Math.abs(sg.ySs - head.ySs) && Math.abs(sg.ySs - acc.ySs) - h / 2 - aH / 2 >= GAP - 1e-6)) badCol++;
    }
  }
  ok(nCol >= 200 && badCol === 0, 'section 3: every technique symbol on its accent\'s side sits past the accent by the house gap (' + nCol + ' columns, ' + badCol + ' not)');
}

// ---- [§528] --max16: no written value shorter than a 16th, anywhere in the MAIN file ----
{
  ok(/ --max16( |$)/.test(ir.provenance.build), 'the recorded build carries --max16 (R keeps the rule)');
  const devs = ir.overlays.filter(ov => ov.kind === 'engraving' && ov.value && ov.value.device).map(ov => ov.value.device);
  const short = devs.filter(d => (d.noteBeams || 0) > 2 || (d.beamLevels || 0) > 2 || (d.beamSubdivision || 0) > 4);
  ok(short.length === 0, 'no 32nds: no device with more than 2 beams or a subdivision over 4 (' + short.length + ')');
  const all = model.systems.flatMap(S => S.items);
  const rest32 = all.filter(it => it.k === 'rest' && it.dur > 16), beam3 = all.filter(it => it.k === 'beam' && /-b3/.test(String(it.group)));
  ok(rest32.length === 0 && beam3.length === 0, 'no 32nds on the page: no rest shorter than a 16th, no third beam level (' + rest32.length + ' rests, ' + beam3.length + ' beams)');
  // the piano's pairs at 607.27–611.50 (his "the notes turned into 30-second notes"): 16ths
  const pn = [...new Set(clusterOf.values())].map(cl => members(cl)).filter(ms => partOfEv.get(ms[0].id) === 2 && ms[0].onset >= 607.2 && ms[0].onset < 611.6 && ms.length <= 3);
  const devOf = id => ir.overlays.find(ov => ov.kind === 'engraving' && ov.target.event === id).value.device;
  ok(pn.length === 9 && pn.every(ms => ms.every(e => devOf(e.id).noteBeams === 2 && devOf(e.id).beamSubdivision === 4)), 'the piano pairs 607.27–611.50: 9 groups, every note a 16th (' + pn.length + ' groups)');
}

// ---- [PLAN 2i.7, §529] section 3's dynamics: the eight-step bands, one mark per part where its band changes ----
{
  const BANDS = C.engraving.layout.dynamicBands;
  const bandOf = v => (BANDS.find(b => v <= b.max) || BANDS[BANDS.length - 1]).mark;
  ok(BANDS.map(b => b.mark).join() === 'ppp,pp,p,mp,mf,f,ff,fff' && [37, 55, 72, 90, 109, 127].map(bandOf).join() === 'p,mp,mf,f,ff,fff' && bandOf(0) === 'ppp' && bandOf(18) === 'pp',
    'dynamicBands = the eight-step scale: 37 p · 55 mp · 72 mf · 90 f · 109 ff · 127 fff (ppp 0 · pp 18)');
  ok(/ --dynOnChange 444-624\.1( |$)/.test(ir.provenance.build), 'the recorded build carries --dynOnChange 444-624.1');
  const devOf = id => { const ov = ir.overlays.find(o => o.kind === 'engraving' && o.target.event === id); return ov ? ov.value.device : {}; };
  const S3s = ir.events.filter(e => e.env === 'strike' && e.onset >= 444 && e.onset <= 624.1);
  ok(S3s.length === 932 && S3s.every(e => devOf(e.id).dynMark === 'band' && devOf(e.id).dynOnChange === true), 'all 932 section-3 strikes on the rule, group members included (' + S3s.filter(e => devOf(e.id).dynOnChange).length + ')');
  ok(!ir.events.some(e => (e.onset < 444 || e.onset > 624.1) && devOf(e.id).dynOnChange), 'no note outside section 3 on the rule (D52: section 1 keeps a mark on every strike)');
  const bandT = t => ['p', 'mp', 'mf', 'f', 'ff', 'fff'][Math.max(0, Math.min(5, Math.floor((t - 444 + 1e-6) / 30)))];
  let total = 0, onGroups = 0, badParts = [];
  // [2i.8, §531] the crescendo run's 78 swells each WRITE a pair (ppp → fff, the surge device) — those marks are the pair's, not the band rule's
  const surgeT = new Set(ir.events.filter(e => e.env === 'surge').map(e => e.onset.toFixed(6)));
  for (let p = 0; p < 7; p++) {
    const st = S3s.filter(e => partOfEv.get(e.id) === p).sort((a, b) => a.onset - b.onset);
    const want = []; let last = null;
    for (const e of st) { const b = bandOf(e.vel); if (b !== last) { want.push(e.onset.toFixed(2) + ' ' + b); last = b; } }
    const marks = model.systems.filter(S => String(S.key).split(':')[0] === String(p)).flatMap(S => S.items)
      .filter(it => it.k === 'glyph' && /^dyn-/.test(it.g) && it.t >= 444 && it.t <= 624.5 && !surgeT.has(it.t.toFixed(6))).map(it => it.t.toFixed(2) + ' ' + it.g.slice(4)).sort((a, b) => parseFloat(a) - parseFloat(b));
    total += marks.length;
    onGroups += marks.filter(mk => st.some(e => e.onset.toFixed(2) === mk.split(' ')[0] && clusterOf.has(e.id))).length;
    if (want.join('|') !== marks.join('|') || marks.map(mk => mk.split(' ')[1]).join() !== 'p,mp,mf,f,ff,fff') badParts.push(p + ': ' + marks.join(' · '));
  }
  ok(badParts.length === 0 && total === 42, 'every part: six marks, p mp mf f ff fff, each on its first strike in the band — 42 in all (' + total + (badParts.length ? '; ' + badParts.join(' | ') : '') + ')');
  ok(onGroups >= 1, 'the rule reaches group members: ' + onGroups + ' of the 42 marks on a beamed note');
  // the rule after a written dynamic (for 2i.8's surge): a crescendo note that WRITES a dynamic sets it in force. Va's next strike after its
  // LAST swell (557.95 — [2i.8, §531] every swell now writes its pair, so the last one is the dynamic in force) is 561.12, the first of the
  // f band: with nothing else written it shows f (the registry pair ends fff) · after a written ppp → fff it still shows f (the band changed)
  // · after a written ppp → f it shows nothing (f already in force)
  {
    const irX = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', 'piece-septet.ir.json'), 'utf8'));
    const partX = new Map(); for (const c of irX.chunks) for (const id of c.events || []) partX.set(id, c.part);
    const cres = irX.events.filter(e => e.env !== 'strike' && partX.get(e.id) === 5 && e.onset >= 520 && e.onset < 560).sort((a, b) => a.onset - b.onset).slice(-1)[0];
    const nextStrike = irX.events.filter(e => e.env === 'strike' && partX.get(e.id) === 5 && cres && e.onset > cres.onset).sort((a, b) => a.onset - b.onset)[0];
    const markAt = (M, e) => { const it = M.systems.find(S => String(S.key) === '5').items.find(x => x.k === 'glyph' && /^dyn-/.test(x.g) && Math.abs(x.t - e.onset) < 1e-6); return it ? it.g.slice(4) : null; };
    const withPair = pr => {
      const J = JSON.parse(JSON.stringify(irX));
      J.overlays.push({ id: 'ov-test-surge', kind: 'engraving', target: { event: cres.id }, value: { device: { dynPair: pr } }, provenance: 'authored' });
      return markAt(Layout.layoutSection(J, glyphs, Object.assign({ m4AttackLines: false, frameParts: ens.parts.map(p => p.part), ensemble: ens, techniques: T }, C.engraving.layout)), nextStrike);
    };
    const none = markAt(model, nextStrike), toFff = withPair(['ppp', 'fff']), toF = withPair(['ppp', 'f']);
    ok(cres && nextStrike && bandOf(nextStrike.vel) === 'f' && none === 'f' && toFff === 'f' && toF === null,
      'the dynamic in force after a written one (Va ' + (cres && cres.onset.toFixed(2)) + ' → ' + (nextStrike && nextStrike.onset.toFixed(2)) + '): nothing written → ' + none + ' · ppp→fff → ' + toFff + ' · ppp→f → ' + (toF || 'none'));
  }
}

console.log((fail ? 'FAIL' : 'PASS') + ' — test_cross_staff: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
