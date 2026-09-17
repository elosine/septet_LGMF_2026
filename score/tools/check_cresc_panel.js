// check_cresc_panel.js — PLAN 1t step 1: the crescendo panel's DEAL, checked headlessly on a synthetic score.
// The check_fill.js idiom. Run: node score/tools/check_cresc_panel.js
const D = require('../public/cresc_deal.js');
const Sp = require('../public/spacing.js');
const Sn = require('../public/sounding.js');
const Cr = require('../public/cresc.js');

let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? '  ok   ' : '  FAIL ') + name + (detail ? '  — ' + detail : '')); if (!cond) fail++; };
const H = t => console.log('\n' + t);

// ---------------------------------------------------------------- the synthetic score
// seven lanes as the septet's: 0 fl · 1 bcl · 2 PIANO · 3 vn1 · 4 vn2 · 5 va · 6 vc
const PIANO = 2;
const RANGES = { 0: [60, 96], 1: [34, 75], 2: [21, 108], 3: [55, 96], 4: [55, 96], 5: [48, 88], 6: [36, 76] };
const STRIKE_T = [1, 3, 5, 7];
let nid = 0;
const note = (lane, t, midi, dur, group) => ({ id: 'wc-' + (nid++), type: 'waveCurve', layer: lane, groupId: group || null,
    startSeconds: t, endSeconds: t + (dur == null ? 0.14 : dur), sonifyNote: midi });

// the selection: four single-note strikes on the flute, one group
const SEL_OBJ = STRIKE_T.map((t, i) => note(0, t, 72 + i, 0.14, 'grp-strike-1'));
// a second strike group later — three onsets, for `ends: next strike` and `harmony: next strike`
const NEXT_OBJ = [10, 11, 12].map((t, i) => note(1, t, 50 + i, 0.14, 'grp-strike-2'));
const base = SEL_OBJ.concat(NEXT_OBJ);
const evOf = objs => Sp.eventsOf(objs);
const sel = SEL_OBJ.map(o => ({ id: o.id, lane: o.layer, midi: o.sonifyNote, startSeconds: o.startSeconds, groupId: o.groupId }));
const ONS = D.onsetsOf(sel);
const NEXT = D.onsetsOf(NEXT_OBJ.map(o => ({ id: o.id, lane: o.layer, midi: o.sonifyNote, startSeconds: o.startSeconds, groupId: o.groupId })));
const OPT = o => Object.assign({ selectionLanes: [0], piano: PIANO, endGapS: Cr.DEFAULTS.endGapS, minS: Cr.DEFAULTS.minS }, o || {});

H('0 · the selection reads as onsets');
ok('four notes on one lane = four onsets', ONS.length === 4, ONS.map(x => x.t).join(' · '));
ok('each onset keeps its group', ONS.every(x => x.groupId === 'grp-strike-1'));
ok('the next strike group has three onsets', NEXT.length === 3, NEXT.map(x => x.t).join(' · '));

H('1 · one per onset — 4 strikes, 3 ticked players');
const r1 = D.deal(ONS, evOf(base), [3, 4, 5], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 3, harmony: 'these' }));
console.log('     ' + D.summarize(r1));
ok('three crescendos', r1.crescs.length === 3, r1.crescs.map(c => c.lane).join(', '));
ok('the fourth onset is NAMED without one', r1.aborts.length === 1 && r1.aborts[0].why === 'ticksRanOut' && r1.aborts[0].t === 7,
   JSON.stringify(r1.aborts));
ok('each starts exactly at its onset', r1.crescs.every((c, i) => c.t0 === STRIKE_T[i]));
ok('no player takes two', new Set(r1.crescs.map(c => c.lane)).size === 3);
ok('each carries the strike\'s group', r1.crescs.every(c => c.groupId === 'grp-strike-1'));
ok('`these notes`: each takes its own strike\'s pitch', r1.crescs.every((c, i) => c.raw === 72 + i),
   r1.crescs.map(c => c.raw).join(', '));

H('2 · all others from ONE onset (his "all begin on the same point")');
const one = [ONS[0]];
const r2 = D.deal(one, evOf(base), [1, 3, 4, 5, 6], RANGES, OPT({ mode: 'all', ends: 'even', endsS: 2, harmony: 'these' }));
console.log('     ' + D.summarize(r2));
ok('one crescendo on every free ticked player', r2.crescs.length === 5, r2.crescs.map(c => c.lane).join(', '));
ok('all begin at the same point', r2.crescs.every(c => c.t0 === 1));
ok('the piano is not among them even when ticked', (() => {
    const r = D.deal(one, evOf(base), [1, PIANO, 3, 4, 5, 6], RANGES, OPT({ mode: 'all', ends: 'even', endsS: 2 }));
    return !r.crescs.some(c => c.lane === PIANO) && r.crescs.length === 5;
})(), 'CN-34: the piano never swells');
ok('a player in the selection is never offered', !r2.crescs.some(c => c.lane === 0));

H('3 · ends: next strike — each ends at the next ATTACK after its onset (§424); the abort when nothing follows');
// the panel passes `attacks` = every attack after the first selected onset — the selection's own later onsets (3, 5, 7) and the next group (10, 11, 12)
const AT3 = D.onsetsOf(SEL_OBJ.slice(1).concat(NEXT_OBJ).map(o => ({ id: o.id, lane: o.layer, midi: o.sonifyNote, startSeconds: o.startSeconds, groupId: o.groupId })));
const r3 = D.deal(ONS, evOf(base), [3, 4, 5, 6], RANGES, OPT({ mode: 'one', ends: 'next', harmony: 'these', nextOnsets: NEXT, attacks: AT3 }));
console.log('     ' + D.summarize(r3));
ok('four crescendos, each to the next attack after its onset: 1→3 · 3→5 · 5→7 · 7→10',
   r3.crescs.length === 4 && r3.crescs.map(c => c.t1).join(',') === '3,5,7,10', r3.crescs.map(c => c.t0 + '→' + c.t1).join(' · '));
const r3n = D.deal(ONS, evOf(base), [3, 4, 5, 6], RANGES, OPT({ mode: 'one', ends: 'next', harmony: 'these', nextOnsets: [], attacks: [] }));
ok('nothing after them: all four NAMED, not silently dropped', r3n.crescs.length === 0 && r3n.aborts.length === 4 && r3n.aborts.every(x => x.why === 'noNextOnset'), JSON.stringify(r3n.aborts.map(x => x.why)));
const r3h = D.deal([ONS[0]], evOf(base), [3, 4, 5], RANGES, OPT({ mode: 'all', ends: 'even', endsS: 2, harmony: 'next', nextOnsets: NEXT }));
ok('harmony: next strike deals that group\'s pitches in order', r3h.crescs.map(c => c.raw).join(',') === '50,51,52',
   r3h.crescs.map(c => c.raw).join(','));

H('4 · the busy exclusion — a player mid-crescendo is not free');
const busy = base.concat([Object.assign(note(3, 0.5, 67, 3.5), { properties: { cresc: { shape: 'surge' } } })]);
const r4 = D.deal(ONS, evOf(busy), [3], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 0.5, harmony: 'these' }));
console.log('     ' + D.summarize(r4));
ok('vn1 is refused at 1 s and at 3 s (it is sounding)', r4.aborts.filter(a => a.t === 1 || a.t === 3).length === 2,
   JSON.stringify(r4.aborts.map(a => a.t + ':' + a.why)));
ok('vn1 is free at 5 s — the crescendo ended at 4 s', r4.crescs.length === 1 && r4.crescs[0].t0 === 5, JSON.stringify(r4.crescs.map(c => c.t0)));
const endsAt1 = base.concat([Object.assign(note(4, 0.2, 67, 0.8), { properties: { cresc: { shape: 'surge' } } })]);   // ends EXACTLY at 1.0
const r4b = D.deal([ONS[0]], evOf(endsAt1), [4], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 1, harmony: 'these' }));
ok('AN END EXACTLY AT THE ONSET COUNTS AS FREE (the secco cut)', r4b.crescs.length === 1 && r4b.crescs[0].lane === 4,
   D.summarize(r4b));

H('5 · the cap and the floor');
const crowd = base.concat([note(3, 2.0, 67)]);                       // vn1 sounds at 2.0 s
const r5 = D.deal([ONS[0]], evOf(crowd), [3], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 3, harmony: 'these' }));
ok('3 s is CAPPED to 0.17 s before the next sound', r5.crescs.length === 1 && Math.abs(r5.crescs[0].t1 - 1.83) < 1e-6 && r5.crescs[0].capped,
   r5.crescs.map(c => c.t1 + ' (' + c.len + ' s)').join());
ok('the cap is said, never silent', /capped/.test(D.summarize(r5)), D.summarize(r5));
const r5b = D.deal([ONS[0]], evOf(base), [3], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 0.1, harmony: 'these' }));
ok('0.1 s is raised to the 0.3 s floor', r5b.crescs.length === 1 && Math.abs(r5b.crescs[0].len - 0.3) < 1e-6 && r5b.crescs[0].floored,
   D.summarize(r5b));
const tight = base.concat([note(3, 1.2, 67)]);                       // 1.03 s of room: under the floor
const r5c = D.deal([ONS[0]], evOf(tight), [3], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 3, harmony: 'these' }));
ok('no room at all aborts, named', !r5c.crescs.length && r5c.aborts.length === 1 && r5c.aborts[0].why === 'noRoom', JSON.stringify(r5c.aborts));

H('6 · together — every one ends at one time');
const r6 = D.deal(ONS, evOf(base), [3, 4, 5, 6], RANGES, OPT({ mode: 'one', ends: 'together', endsS: 1.5, harmony: 'these' }));
console.log('     ' + D.summarize(r6));
ok('four crescendos, one end', r6.crescs.length === 4 && new Set(r6.crescs.map(c => c.t1)).size === 1,
   r6.crescs.map(c => c.t0 + '→' + c.t1).join(' · '));
ok('the end is the last onset + the seconds', r6.crescs[0].t1 === 8.5, String(r6.crescs[0].t1));

H('7 · the fold, and the pitch no octave reaches');
const high = D.onsetsOf([{ id: 'x', lane: 0, midi: 103, startSeconds: 1, groupId: 'grp-strike-1' }]);   // above the cello
const r7 = D.deal(high, evOf(base), [6], RANGES, OPT({ mode: 'one', ends: 'even', endsS: 1, harmony: 'these' }));
ok('a pitch out of range is FOLDED by octave into the ordinary voice', r7.crescs.length === 1 && r7.crescs[0].midi === 67 && r7.crescs[0].fold === -3,
   r7.crescs.map(c => c.raw + ' → ' + c.midi + ' (' + c.fold + ' 8ve)').join());
const narrow = D.deal(high, evOf(base), [6], { 6: [40, 41] }, OPT({ mode: 'one', ends: 'even', endsS: 1, harmony: 'these' }));
ok('a pitch no octave reaches aborts, NAMED', !narrow.crescs.length && narrow.aborts[0].why === 'noOctave', JSON.stringify(narrow.aborts));

H('8 · harmony: the drawer, dealt by register');
const r8 = D.deal([ONS[0]], evOf(base), [1, 3, 6], RANGES, OPT({ mode: 'all', ends: 'even', endsS: 1, harmony: 'drawer',
    drawerPitches: [48, 60, 79] }));
const byLane = {}; r8.crescs.forEach(c => byLane[c.lane] = c.raw);
ok('the low pitch to the low player, the high to the high', byLane[1] === 48 && byLane[6] === 60 && byLane[3] === 79,
   JSON.stringify(byLane) + '  (bcl centre ' + ((34 + 75) / 2) + ' · vc ' + ((36 + 76) / 2) + ' · vn1 ' + ((55 + 96) / 2) + ')');

H('9 · nothing selected, nothing ticked');
ok('nothing selected says so', D.deal([], evOf(base), [3], RANGES, OPT({})).notes[0] === 'nothing selected');
ok('nothing ticked says so', D.deal(ONS, evOf(base), [], RANGES, OPT({})).notes[0] === 'no player is ticked');

H('10 · sounding.js on its own');
const ev = evOf(base);
ok('nextStart finds the next sound on that lane', Sn.nextStart(ev, 0, 1) === 3, String(Sn.nextStart(ev, 0, 1)));
ok('nothing later = null', Sn.nextStart(ev, 0, 99) === null);
ok('at(): a sound starting exactly at t is BUSY', Sn.atIn(ev, 1, [0]).busy.length === 1);
ok('at(): a sound ending exactly at t is FREE', Sn.atIn(ev, 1.14, [0]).free.length === 1);
ok('over(): touching at either edge is free', Sn.overIn(ev, 1.14, 3, [0]).free.length === 1);
ok('over(): an overlap is busy, and says until when', Sn.overIn(ev, 1.05, 3, [0]).until[0] === 1.14,
   JSON.stringify(Sn.overIn(ev, 1.05, 3, [0]).until));

H('11 · §424: ends: next strike = the next ATTACK after the onset, for everyone');
// the next strike is a run: attacks at 10 (two notes), 10.5, 10.8 — on lanes no ticked player uses
{
    const N2 = [note(1, 10, 50, 0.14, 'grp-strike-2'), note(PIANO, 10.01, 60, 0.14, 'grp-strike-2'), note(PIANO, 10.5, 64, 0.14, 'grp-strike-2'), note(1, 10.8, 52, 0.14, 'grp-strike-2')];
    const AT = D.onsetsOf(N2.map(o => ({ id: o.id, lane: o.layer, midi: o.sonifyNote, startSeconds: o.startSeconds, groupId: o.groupId })));
    ok('two notes 10 ms apart are one attack · 3 attacks in all', AT.length === 3 && AT[0].notes.length === 2, AT.map(x => x.t + ':' + x.notes.length).join(' '));
    const ev2 = evOf(SEL_OBJ.concat(N2));
    const r = D.deal([ONS[0]], ev2, [3, 4, 5, 6], RANGES, OPT({ mode: 'all', ends: 'next', harmony: 'these', nextOnsets: AT, attacks: AT }));
    ok('4 players from one onset → 4 crescendos, none refused', r.crescs.length === 4, r.crescs.length + ' · ' + D.summarize(r));
    ok('all four end at the next attack, 10 — the same length', r.crescs.every(c => c.t1 === 10), r.crescs.map(c => c.t1).join());
    // several selected onsets: each ends at the attack after IT — the selection's own next onset counts (attacks = everything after the first)
    const selAll = ONS;   // 1, 3, 5, 7 on lane 0
    const AT2 = D.onsetsOf(SEL_OBJ.slice(1).concat(N2).map(o => ({ id: o.id, lane: o.layer, midi: o.sonifyNote, startSeconds: o.startSeconds, groupId: o.groupId })));
    const r2 = D.deal(selAll, ev2, [3, 4, 5, 6], RANGES, OPT({ mode: 'one', ends: 'next', harmony: 'these', nextOnsets: AT, attacks: AT2 }));
    const byT = {}; r2.crescs.forEach(c => { byT[c.t0] = c.t1; });
    ok('one per onset over 1·3·5·7: each ends at the next onset (3·5·7·10)', byT[1] === 3 && byT[3] === 5 && byT[5] === 7 && byT[7] === 10, JSON.stringify(byT));
    const r0 = D.deal([ONS[0]], ev2, [3], RANGES, OPT({ mode: 'all', ends: 'next', harmony: 'these', nextOnsets: [], attacks: [] }));
    ok('nothing after it: refused, and says so', r0.crescs.length === 0 && /no attack after/.test(D.summarize(r0)), D.summarize(r0));
}

console.log('\n' + (fail ? fail + ' FAILED' : 'all green'));
process.exit(fail ? 1 : 0);
