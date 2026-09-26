#!/usr/bin/env node
// vibes_pitch_check — PLAN 1u: the vibraphones' pitches on the strip (score/public/vibes_pitch.js), its pure core.
//   1u.1 THE POOL — the B1 series with his screenshot's assignment (EH 11 · Bsn 1 · Hn 6 · Tpt 15 · Vc 10 · Db 4 · Vib 16 · 9):
//        `any` · `neighbours` · `within a tone`, the other seat taken out, a pool of one · the seats by overlap · the take of a breath
//        resolved on a 1q note, a sequence note, a placed morph's note and a TAKE → TAKE switch.
// The series, the tolerance and the parser are the app's OWN files run in node (spectrum.js · spectrum_ui.js `mayTake` against a stub
// drawer · harmony_sel.js `info`), not copies — the sequence_check idiom.
//   node tools/vibes_pitch_check.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'score', 'public');
const V = require(path.join(PUB, 'vibes_pitch.js'));
const SP = require(path.join(PUB, 'spectrum.js'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- the app's own files
const html = fs.readFileSync(path.join(PUB, 'composer.html'), 'utf8');
const TRACKS = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const INST = (() => { const b = { console, window: {}, self: {} }; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + ';this.__I = INSTRUMENTS;', b); return b.__I; })();
const D = (() => {   // the strikes drawer as far as the pool asks it: instOf, and spectrum_ui.js's own mayTake · fixedPitch mixed in
    const d = { instOf(lane) { const t = TRACKS[lane]; return lane >= 0 && t ? INST[t.instKey] : null; } };
    const b = { self: { StrikeDrawer: d, Spectrum: SP }, console };
    vm.runInNewContext(fs.readFileSync(path.join(PUB, 'spectrum_ui.js'), 'utf8'), b);
    return d;
})();
const H = (() => { const b = { self: {}, document: { readyState: 'complete', addEventListener() {} }, setTimeout() {}, console }; vm.runInNewContext(fs.readFileSync(path.join(PUB, 'harmony_sel.js'), 'utf8'), b); return b.self.HarmonySel; })();
const VIB = TRACKS.findIndex(t => t.instKey === 'bowed_vibraphone');
const lane = k => TRACKS.findIndex(t => t.short === k);
ok(VIB >= 0 && typeof D.mayTake === 'function' && typeof H.info === 'function', 'the app\'s own files loaded: TRACKS (the vibraphone lane ' + VIB + ') · spectrum_ui.js mayTake · harmony_sel.js info');

// ---------------------------------------------------------------- the B1 series, the range, the tolerance
const B1 = SP.makeStrike(35, null, { sets: ['just'] });
const voices = B1.notes.map(n => ({ pitch: n.midi, cents: n.cents, partial: n.partial }));   // as HarmonySel.pool reads D.voices
const pOf = k => { const v = voices.find(x => x.partial === k); return v.pitch + v.cents / 100; };
const range = H.rangeOf(D, VIB, { technique: 'bowed_vel' });
const may = v => D.mayTake(v, VIB);
ok(eq(range, [53, 89]), 'the vibraphone\'s range for bowed_vel, read by the strip\'s own rangeOf: ' + range.join('…'));
ok(may({ cents: 5 }) && !may({ cents: 5.01 }) && !may({ cents: -14 }), 'mayTake on the vibraphone: ±5 ¢ in, 5.01 out, −14 out');
const mem = V.members(voices, range[0], range[1], may);
const parts = m => m.map(x => x.partial);
console.log('  ·    any on B1: ' + mem.map(m => m.partial + '=' + SP.nm(m.midi) + (Math.round(m.cents) ? (m.cents > 0 ? '+' : '') + Math.round(m.cents) : '')).join(' · '));
ok(eq(parts(mem), [3, 4, 6, 8, 9, 12, 16, 17, 18, 19]), '`any` = every partial of B1 under ±5 ¢ inside F3…F6: 3 · 4 · 6 · 8 · 9 · 12 · 16 · 17 · 18 · 19');
ok([8, 9, 16, 17].every(k => parts(mem).includes(k)) && ![10, 13].some(k => parts(mem).includes(k)), 'his examples: 8 · 9 · 16 · 17 in, 10 (−14) and 13 (+41) out');
ok(mem.every(m => Number.isInteger(m.midi)), 'every member a key — the vibraphone plays the tempered note');

// ---------------------------------------------------------------- his screenshot's assignment: the others at one moment
// each other player a note of a placed sequence of this take (box 1), as the sequence's Insert writes it
const TAKE = 'Just-B1-seed193';
const SEQS = [{ id: 'b1test', name: 'S', group: 'grp-seq-b1test', recipe: { t0: 0, containers: [{ dur: 30, take: TAKE }, { dur: 30, take: 'Other-take' }] } }];
const seqNote = (lk, k, t0, t1, id) => { const v = voices.find(x => x.partial === k), c = +v.cents.toFixed(2);
    return Object.assign({ id, type: 'waveCurve', layer: lane(lk), groupId: 'grp-seq-b1test', startSeconds: t0, endSeconds: t1, sonifyNote: v.pitch, technique: 'ordinario',
        performanceNotes: 'S · box 1 · ' + TAKE + ' · partial ' + k + (Math.round(c) ? ' · ' + (c > 0 ? '+' : '') + Math.round(c) + '¢ just' : '') }, c ? { morphBend: [[0, c], [t1 - t0, c]] } : {}); };
const ASSIGN = { EH: 11, Bsn: 1, Hn: 6, Tpt: 15, Vc: 10, Db: 4 };
const others = Object.keys(ASSIGN).map((k, i) => seqNote(k, ASSIGN[k], 0, 20, 'wc-o' + i));
const otherLanes = new Set(TRACKS.map((t, i) => i).filter(i => i !== VIB && TRACKS[i].instKey !== 'percussion'));
const isPitched = o => o.type === 'waveCurve' && o.sonifyNote != null;
const tctx = objs => ({ info: o => H.info(o), sequences: SEQS, objects: objs, meta: 7, actuals: {} });
const oth = V.othersAt(5, others, { lanes: otherLanes, isPitched, takeOf: o => V.takeOf(o, tctx(others)), take: TAKE, voices, info: o => H.info(o) });
ok(eq(oth.map(x => x.partial).sort((a, b) => a - b), [1, 4, 6, 10, 11, 15]), 'the others at 5 s, each by the partial its note carries: ' + oth.map(x => TRACKS[x.lane].short + ' ' + x.partial).join(' · '));
ok(oth.every(x => Math.abs(x.pitch - pOf(x.partial)) < 1e-6), 'each other\'s pitch = its key + its bend (the just pitch)');
const nb = V.poolAt('neighbours', mem, oth), tn = V.poolAt('tone', mem, oth), an = V.poolAt('any', mem, oth);
console.log('  ·    neighbours: ' + parts(nb).join(' · ') + '   within a tone: ' + parts(tn).join(' · ') + '   any: ' + parts(an).length);
ok(eq(parts(nb), [3, 9, 12, 16]), '`neighbours` = the partials one above and one below the others\' 11 · 1 · 6 · 15 · 10 · 4, in the pool: 3 · 9 · 12 · 16');
ok(eq(parts(tn), [4, 6, 9, 12, 16]), '`within a tone` = the members ≤ 200 ¢ from another player\'s pitch: 4 (Db) · 6 (Hn) · 9 (Vc) · 12 (EH) · 16 (Tpt)');
ok(eq(parts(an), parts(mem)), '`any` = the whole pool, whatever the others hold');
// the other seat taken out: the vibraphones hold 16 (B5) and 9 (C♯5)
const mid = k => mem.find(m => m.partial === k).midi;
ok(eq(parts(V.without(nb, [mid(9)])), [3, 12, 16]), 'seat 1 (on 16): the other seat\'s 9 taken out → 3 · 12 · 16; its own 16 goes at a change');
ok(eq(parts(V.without(V.without(nb, [mid(9)]), [mid(16)])), [3, 12]), 'a change from 16 → 3 · 12');
const one = [mem.find(m => m.partial === 12)];
ok(V.without(one, [mid(12)]).length === 0, 'a pool of one held by the first seat leaves the second seat nothing — it waits');
// an unstamped player (a morph's note: no partial on it) → the series' nearest within 20 ¢
const morphish = [{ id: 'wc-m', type: 'waveCurve', layer: lane('Vc'), groupId: 'grp-morph-01', startSeconds: 0, endSeconds: 10, sonifyNote: 75, morphBend: [[0, -14], [10, -14]], performanceNotes: 'x bowed' }];
const om = V.othersAt(1, morphish, { lanes: otherLanes, isPitched, takeOf: () => null, take: TAKE, voices, info: o => H.info(o) });
ok(om.length === 1 && om[0].partial === 10, 'a morph\'s cello at D♯5 −14 ¢, no partial on the note → partial 10 by the nearest within 20 ¢');
const om2 = V.othersAt(1, [Object.assign({}, morphish[0], { morphBend: [[0, 30], [10, 30]] })], { lanes: otherLanes, isPitched, takeOf: () => null, take: TAKE, voices, info: o => H.info(o) });
ok(om2.length === 1 && om2[0].partial === null, 'the same at +30 ¢ (44 ¢ from partial 10) → no partial: counted as a pitch, not a partial');
ok(V.othersAt(25, others, { lanes: otherLanes, isPitched, take: TAKE, voices }).length === 0, 'nothing sounding at 25 s → no others');

// ---------------------------------------------------------------- the seats — the lane's two chains by overlap (his LGMF-R01c's shape)
const vn = (id, t0, t1, n, extra) => Object.assign({ id, type: 'waveCurve', layer: VIB, startSeconds: t0, endSeconds: t1, sonifyNote: n, technique: 'bowed_vel' }, extra || {});
const chainIn = [vn('a1', 2.00, 6.84, 87), vn('b1', 2.60, 8.48, 84), vn('a2', 6.89, 11.76, 87), vn('b2', 8.53, 14.26, 84), vn('a3', 11.81, 16.34, 87), vn('b3', 14.31, 16.94, 84),
                 vn('a4', 16.39, 20.88, 87), vn('b4', 16.99, 22.64, 84), vn('a5', 20.93, 26.86, 84), vn('b5', 22.70, 27.46, 86)];
const sc = V.seatChains(chainIn), seatOf = id => sc.seat.get(chainIn.find(o => o.id === id));
ok(['a1', 'a2', 'a3', 'a4', 'a5'].every(i => seatOf(i) === 0) && ['b1', 'b2', 'b3', 'b4', 'b5'].every(i => seatOf(i) === 2) && sc.crowded === 0,
   'his sequence\'s two chains (0.05 s between a seat\'s breaths, the box change at 20.9 s) → seat 0 · seat 2, none crowded');
const sw = [vn('x1', 0, 5, 80), vn('y1', 0, 5, 77), vn('x2', 5, 10, 80), vn('y2', 5, 10, 77)];
const s2 = V.seatChains(sw);
ok(s2.seat.get(sw[2]) === s2.seat.get(sw[0]) && s2.seat.get(sw[3]) === s2.seat.get(sw[1]), 'both chains free at once → each follows the chain that held its pitch');
const st = [vn('p1', 0, 5, 80, { hq: { seat: 2 } }), vn('q1', 0, 5, 77, { hq: { seat: 0 } }), vn('p2', 5, 10, 70, { hq: { seat: 2 } }), vn('q2', 5, 10, 71, { hq: { seat: 0 } })];
const s3 = V.seatChains(st);
ok(s3.seat.get(st[0]) === 2 && s3.seat.get(st[2]) === 2 && s3.seat.get(st[1]) === 0 && s3.seat.get(st[3]) === 0, 'a 1u write\'s `hq.seat` names its chain, whatever the pitches');
const s4 = V.seatChains([vn('c1', 0, 10, 80), vn('c2', 1, 10, 81), vn('c3', 2, 10, 82)]);
ok(s4.crowded === 1, 'a third voice over both chains is counted as crowded');

// ---------------------------------------------------------------- the take of a breath
const q1 = vn('h1', 0, 5, 83, { hq: { take: 'T-hq', midi: 83, cents: 0, partial: 16 } });
const q2 = vn('h2', 0, 5, 83, { performanceNotes: 'x · ← take "T-frag" · partial 16' });
const s1 = vn('s1', 31, 35, 83, { groupId: 'grp-seq-b1test', performanceNotes: 'S · box 2 · Other-take · partial 16' });
const s1b = vn('s1b', 31, 35, 83, { groupId: 'grp-seq-b1test', performanceNotes: 'no fragment' });
const mk = { id: 'mk-act-bloom-06-1', type: 'marker', layer: 0, groupId: 'grp-act-bloom-06-01', time: 155, label: 'ACT-BLOOM-06 — lgmf-s01-bloom08' };
const m1 = vn('m1', 155, 164, 81, { groupId: 'grp-act-bloom-06-01', morphBend: [[0, 0], [9, 0]], performanceNotes: 'lgmf-s01-bloom08 bowed_vel' });
const fr = vn('f1', 0, 5, 83, { performanceNotes: 'gone · box 3 · T-fragment-only · partial 16' });
const none = vn('n1', 0, 5, 83, { performanceNotes: 'played by hand' });
const ACT = { 'ACT-BLOOM-06': { provenance: { pitch: { src: 'dtake:Blm01c-wVibes-Just-A1-seed131mod', takeName: 'Blm01c-wVibes-Just-A1-seed131mod' } } } };
const all = [q1, q2, s1, s1b, mk, m1, fr, none, { id: 'meta', type: 'waveCurve', layer: 7, groupId: 'grp-seq-b1test', startSeconds: 0, endSeconds: 60 }];
const tc = { info: o => H.info(o), sequences: SEQS, objects: all, meta: 7, actuals: ACT };
const T = o => { const r = V.takeOf(o, tc); return r ? r.take + ' (' + r.how + ')' : null; };
ok(T(q1) === 'T-hq (hq)', 'a 1q note → its `hq.take`');
ok(T(q2) === 'T-frag (hq)', 'a 1q note written before 1q.5 → its `← take "…"` fragment');
ok(T(s1) === 'Other-take (sequence)', 'a sequence note → the recipe\'s box its fragment names (box 2)');
ok(T(s1b) === 'Other-take (sequence)', 'a sequence note with no fragment → the recipe\'s box at its start (31 s: box 2, the META bar at 0)');
ok(T(m1) === 'Blm01c-wVibes-Just-A1-seed131mod (actual)', 'a placed morph\'s note → its actual\'s take, by the group\'s marker (ACT-BLOOM-06)');
ok(T(fr) === 'T-fragment-only (fragment)', 'a sequence note whose recipe is gone → the take its fragment names');
ok(T(none) === null, 'a note from no take → none (the strip says: pick one)');
ok(eq(V.parseFragment('LGMF-R01c · box 1 · Just-C1-seed90 · partial 38 · waves pp…mp'), { box: 1, take: 'Just-C1-seed90' }) && eq(V.parseFragment('S · box 4 · partial 3'), { box: 4, take: null }),
   'the fragment\'s box and take, as his LGMF-R01c writes them; a box with no take');

// ---------------------------------------------------------------- the plan: a TAKE → TAKE actual's vibraphone switches take at its re-strike
const mkT = { id: 'mk-t', type: 'marker', layer: 0, groupId: 'grp-act-takes-01-01', time: 0, label: 'ACT-TAKES-01 — x' };
const tk = [vn('t1', 0, 5, 81), vn('t2', 5, 10, 81), vn('t3', 10, 15, 83), vn('t4', 15, 20, 83)].map(o => Object.assign(o, { groupId: 'grp-act-takes-01-01' }));
const ACT2 = { 'ACT-TAKES-01': { provenance: { pitch: { takeName: TAKE, toName: 'Just-C1-seed90' } } } };
const C1 = SP.makeStrike(24, null, { sets: ['just'] }).notes.map(n => ({ pitch: n.midi, cents: n.cents, partial: n.partial }));
const tctx2 = { info: o => H.info(o), sequences: [], objects: [mkT].concat(tk), meta: 7, actuals: ACT2 };
const P = V.plan(tk, { rule: 'any', takeOf: o => V.takeOf(o, tctx2), voicesOf: n => n === TAKE ? voices : (n === 'Just-C1-seed90' ? C1 : null),
    rangeOf: () => range, may, objects: [mkT].concat(tk), otherLanes, isPitched, info: o => H.info(o) });
ok(eq(P.breaths.map(b => b.take === TAKE ? 'A' : 'B'), ['A', 'A', 'B', 'B']), 'a TAKE → TAKE actual: the seat reads "from" until its re-strike on a new bar, "to" after it');
ok(P.breaths[2].members.length && P.breaths[2].members.every(m => C1.some(v => v.partial === m.partial)), 'after the switch the pool is "to"\'s series (C1)');

// ---------------------------------------------------------------- 1u.2 THE DRAW — a passage of two seats over his screenshot's chord
console.log('\n  1u.2 the draw');
const vibSeq = (id, t0, t1, k) => { const v = voices.find(x => x.partial === k); return { id, type: 'waveCurve', layer: VIB, groupId: 'grp-seq-b1test', startSeconds: t0, endSeconds: t1, sonifyNote: v.pitch, technique: 'bowed_vel', performanceNotes: 'S · box 1 · ' + TAKE + ' · partial ' + k }; };
const PASS = [], LONG = Object.keys(ASSIGN).map((k, i) => seqNote(k, ASSIGN[k], 0, 29, 'wc-L' + i));
for (let i = 0; i < 10; i++) { PASS.push(vibSeq('va' + i, +(i * 2.8).toFixed(2), +(i * 2.8 + 2.75).toFixed(2), 16)); PASS.push(vibSeq('vb' + i, +(i * 2.8 + 1.3).toFixed(2), +(Math.min(29, i * 2.8 + 4.05)).toFixed(2), 9)); }
const pctx = rule => { const objs = LONG.concat(PASS); const tcx = { info: o => H.info(o), sequences: SEQS, objects: objs, meta: 7, actuals: {} };
    return { rule, takeOf: o => V.takeOf(o, tcx), voicesOf: n => n === TAKE ? voices : null, rangeOf: () => range, may, objects: objs, otherLanes, isPitched, info: o => H.info(o) }; };
const planOf = rule => V.plan(PASS, pctx(rule));
const seq = (R, s) => R.breaths.filter(b => b.seat === s).map(b => R.res.get(b).midi);
const clashFree = R => R.breaths.every(a => R.breaths.every(b => a.seat === b.seat || !(a.start < b.end - 1e-9 && b.start < a.end - 1e-9) || R.res.get(a).midi !== R.res.get(b).midi));
const nm = m => SP.nm(m);
{
    const P1 = planOf('any'); ok(P1.breaths.length === 20 && P1.crowded === 0 && P1.breaths.filter(b => b.seat === 0).every(b => b.midi === 83), 'the passage: 20 breaths, two seats found (B5 · C♯5), the take of each from the sequence');
    const R = V.draw(P1.breaths, { change: 1, draw: 'exhaust', seed: 17 });
    console.log('  ·    always · any · exhaust · seed 17 — seat 0: ' + seq(R, 0).map(nm).join(' ') + '  seat 2: ' + seq(R, 2).map(nm).join(' '));
    ok(R.anchors === 2 && R.changed === 18 && R.empty === 0 && R.forced === 0, '`always`: the first breath of each seat kept, every other breath changed (18 of 20)');
    ok(R.breaths.every(b => R.res.get(b).anchor ? R.res.get(b).midi === b.midi : true), 'the anchors hold what the take dealt (B5 · C♯5)');
    ok(R.breaths.every(b => mem.some(m => m.midi === R.res.get(b).midi)), 'every pitch a member: a partial of B1 under ±5 ¢ in F3 … F6');
    ok(clashFree(R), 'no two seats on one pitch wherever they overlap');
    ok([0, 2].every(s => { const q = seq(R, s); for (let i = 1; i < q.length; i++) if (q[i] === q[i - 1]) return false; return true; }), 'a change is always a different pitch');
    ok([0, 2].every(s => new Set(seq(R, s).slice(0, 7)).size === 7), '`exhaust`: the first seven pitches of each seat all different (the pool is ten)');
    const R2 = V.draw(P1.breaths, { change: 1, draw: 'exhaust', seed: 17 }), R3 = V.draw(P1.breaths, { change: 1, draw: 'exhaust', seed: 18 });
    ok(eq(seq(R2, 0).concat(seq(R2, 2)), seq(R, 0).concat(seq(R, 2))), 'the same seed → the same result');
    ok(!eq(seq(R3, 0).concat(seq(R3, 2)), seq(R, 0).concat(seq(R, 2))), 'another seed → another result');
    const R0 = V.draw(P1.breaths, { change: 0, draw: 'random', seed: 17 });
    ok(R0.changed === 0 && R0.breaths.every(b => R0.res.get(b).midi === b.midi), '`never`: every breath as it stands');
    const RA = V.draw(P1.breaths, { change: 1, draw: 'random', seed: 3 });
    ok(RA.changed === 18 && clashFree(RA) && RA.breaths.every(b => mem.some(m => m.midi === RA.res.get(b).midi)), '`random` · `always`: 18 changed, members, clear of the other seat');
}
{   // half · neighbours · walk
    const P2 = planOf('neighbours');
    ok(P2.breaths.every(b => eq(parts(b.pool), [3, 9, 12, 16])), '`neighbours` at every breath of the passage (the chord holds): 3 · 9 · 12 · 16');
    const R = V.draw(P2.breaths, { change: 0.5, draw: 'walk', seed: 5 });
    console.log('  ·    half · neighbours · walk · seed 5 — seat 0: ' + seq(R, 0).map(nm).join(' ') + '  seat 2: ' + seq(R, 2).map(nm).join(' ') + ' · ' + R.changed + ' changed · ' + R.empty + ' empty');
    ok(R.changed >= 5 && R.changed <= 13, '`half`: ' + R.changed + ' of the 18 breaths after the anchors changed (about half)');
    ok(clashFree(R), 'no two seats on one pitch wherever they overlap');
    const stepOk = R.breaths.every((b, i) => {
        const r = R.res.get(b); if (!r.changed) return true;
        const before = R.breaths.slice(0, i).filter(x => x.seat === b.seat).map(x => R.res.get(x).midi).pop();
        const held = R.breaths.filter(x => x.seat !== b.seat && x.start < b.end && b.start < x.end && R.breaths.indexOf(x) < i).map(x => R.res.get(x).midi);
        const lo = Math.min(before, r.midi), hi = Math.max(before, r.midi);
        return b.pool.filter(m => m.midi > lo && m.midi < hi).every(m => held.includes(m.midi));   // nothing skipped but the other seat's pitch
    });
    ok(stepOk, '`walk`: every change one step along the pool from where the seat was — only the other seat\'s pitch stepped over');
}
{   // shadow
    const P3 = planOf('any');
    const R = V.draw(P3.breaths, { change: 1, draw: 'shadow', seed: 9 });
    const pitches = LONG.map(o => V.pitchAt(o, 1));
    const ok3 = R.breaths.every((b, i) => {
        const r = R.res.get(b); if (!r.changed) return true;
        const from = R.breaths.slice(0, i).filter(x => x.seat === b.seat).map(x => R.res.get(x).midi).pop();
        const held = R.breaths.filter(x => x.seat !== b.seat && x.start < b.end && b.start < x.end && R.breaths.indexOf(x) < i).map(x => R.res.get(x).midi).concat(R.breaths.filter(x => x.seat !== b.seat && R.res.get(x).anchor && x.start < b.end && b.start < x.end).map(x => x.midi));
        const d = m => Math.min.apply(null, pitches.map(p => Math.abs(m - p) * 100));
        const c = b.pool.filter(m => m.midi !== from && !held.includes(m.midi));
        return d(r.midi) <= Math.min.apply(null, c.map(m => d(m.midi))) + 0.5;
    });
    console.log('  ·    always · any · shadow · seed 9 — seat 0: ' + seq(R, 0).map(nm).join(' ') + '  seat 2: ' + seq(R, 2).map(nm).join(' '));
    ok(ok3 && clashFree(R), '`shadow`: every change the member nearest another player\'s pitch (of those left), clear of the other seat');
}
{   // a pool of one: the second seat waits
    const mb = (seat, t0, t1, k, pool) => { const v = mem.find(m => m.partial === k); return { o: {}, seat, start: t0, end: t1, midi: v.midi, take: TAKE, members: mem, pool, others: [] }; };
    const one12 = mem.filter(m => m.partial === 12);
    const Bs = [mb(0, 0, 5, 16, one12), mb(2, 1, 6, 9, one12), mb(0, 5.05, 10, 16, one12), mb(2, 6.05, 11, 9, one12), mb(0, 10.05, 15, 16, one12), mb(2, 11.05, 16, 9, one12)];
    const R = V.draw(Bs, { change: 1, draw: 'random', seed: 1 });
    ok(eq(seq(R, 0), [83, 78, 78]) && eq(seq(R, 2), [73, 73, 73]) && R.empty >= 2 && clashFree(R), 'a pool of one (12, F♯5): the first seat takes it and holds it; the second waits on C♯5, its empty pools counted (' + R.empty + ')');
}
{   // an anchor at a take's change, and a held breath made to change
    const mb = (seat, t0, t1, midi, take) => ({ o: {}, seat, start: t0, end: t1, midi, take, members: mem, pool: mem, others: [] });
    const Bs = [mb(0, 0, 4, 83, TAKE), mb(2, 0, 5, 73, TAKE), mb(2, 5, 9, 83, 'T2'), mb(0, 6, 10, 83, TAKE)];
    const R = V.draw(Bs, { change: 0, draw: 'random', seed: 1 });
    ok(R.res.get(Bs[2]).anchor && R.res.get(Bs[2]).midi === 83, 'a breath of another take (a new box) is an anchor: kept as dealt (B5)');
    ok(R.forced === 1 && R.res.get(Bs[3]).midi !== 83 && clashFree(R), 'at `never`, a seat that would hold B5 over the other seat\'s new B5 is made to change (forced 1)');
}

// ---------------------------------------------------------------- his save, read only — told, not gated (his file moves as he composes)
const his = path.join(ROOT, 'scores', 'piece-LGMF-Sec01-Sec02.json');
if (fs.existsSync(his)) {
    const S = JSON.parse(fs.readFileSync(his, 'utf8')), objs = S.objects || [], acts = {};
    const vib = objs.filter(o => o.layer === VIB && o.sonifyNote != null && o.type === 'waveCurve');
    vib.forEach(o => { const e = V.actualOf(o, objs); if (e && !acts[e]) { const f = path.join(ROOT, 'bank', 'actuals', e + '.json'); if (fs.existsSync(f)) acts[e] = JSON.parse(fs.readFileSync(f, 'utf8')); } });
    const how = {}; vib.forEach(o => { const r = V.takeOf(o, { info: x => H.info(x), sequences: (S.databases || {}).sequences || [], objects: objs, meta: 7, actuals: acts }); const k = r ? r.how : 'none'; how[k] = (how[k] || 0) + 1; });
    const ch = V.seatChains(vib);
    console.log('  ·    his piece-LGMF-Sec01-Sec02 (read only): ' + vib.length + ' vibraphone breaths · the take by ' + Object.keys(how).map(k => k + ' ' + how[k]).join(' · ') + ' · ' + ch.crowded + ' crowded');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
