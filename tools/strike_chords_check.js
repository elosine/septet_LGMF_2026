// strike_chords_check.js — the strikes drawer's chord engine, checked in node (PLAN 1k step 1; RUNNING_LOG §249).
// `node tools/strike_chords_check.js` → PASS / FAIL lines and a verdict. (1) the pure parts: the selection modes, the seeded draw;
// (2) the deal on a real chord from bank/harmonies.json with the septet's players and their measured ranges: determinism, the 200 ms
// rule as a guarantee, the counts inside his range, the notes by register, the octave folds; (3) the three advance modes and the two
// orders; (4) the lowering and the flag (a run too fast to satisfy); (5) the manual onset, pinned and flagged, never lowered.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SC = require(path.join(ROOT, 'score/public/strike_chords.js'));
const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const banks = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank/harmonies.json'), 'utf8')).banks;
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };

// the septet's six bending players plus the piano, with the ordinary voice's measured range (the drawer's own source)
const players = tracks.map((t, lane) => {
    const inst = recipe[t.instKey]; if (!inst) return null;
    const key = inst.ordinary || (inst.techniques[0] || {}).key;
    const tech = (inst.techniques || []).find(x => x.key === key) || inst.techniques[0];
    return { lane, tech: tech.key, label: t.short, lo: tech.rangeLow != null ? tech.rangeLow : inst.rangeLow, hi: tech.rangeHigh != null ? tech.rangeHigh : inst.rangeHigh };
}).filter(Boolean);
// the caller's realize: fold by octave into the player's range (the drawer's rule), null when no octave fits
const realize = (pitch, p) => {
    let m = pitch, oct = 0;
    while (m > p.hi && m - 12 >= p.lo) { m -= 12; oct--; }
    while (m < p.lo && m + 12 <= p.hi) { m += 12; oct++; }
    return (m < p.lo || m > p.hi) ? null : { midi: m, fold: oct, standIn: false };
};
// only chords big enough to fill his range, so "short" (the chord ran out) is tested on purpose, not by accident
const chordsFrom = (bank, n, minN) => (banks[bank].entries || []).filter(c => c.pitches.length >= (minN || 1)).slice(0, n)
    .map(c => ({ id: c.id, name: c.name, pitches: c.pitches.slice() }));
const evenOnsets = (n, gap, t0) => Array.from({ length: n }, (_, i) => (t0 || 0) + i * gap);

// ---- (1) the pure parts ----
ok(players.length === 7 && players[2].label === 'Pno' && players[6].label === 'Vc', 'the seven players read from the recipe with their ordinary ranges');
const av = [40, 44, 47, 52, 55, 60];
ok(JSON.stringify(SC.select(av, 3, 'low')) === JSON.stringify([40, 44, 47]), 'low cluster takes the bottom');
ok(JSON.stringify(SC.select(av, 3, 'high')) === JSON.stringify([52, 55, 60]), 'high cluster takes the top');
ok(JSON.stringify(SC.select(av, 3, 'played')) === JSON.stringify([40, 44, 47]), 'as played takes the chord in its own order');
ok(JSON.stringify(SC.select(av, 3, 'spread')) === JSON.stringify([40, 52, 60]), 'spread takes them evenly across the chord');
ok(JSON.stringify(SC.select(av, 9, 'shuffle')) === JSON.stringify(av) && SC.select(av, 0, 'low').length === 0, 'asking for more than the chord holds gives the chord; asking for none gives none');
{
    const r1 = SC.mulberry32(5), r2 = SC.mulberry32(5);
    ok(SC.shuffled(av, r1).join() === SC.shuffled(av, r2).join(), 'the seeded shuffle is the drawer\'s: the same seed, the same order');
}

// ---- (2) the deal on a real chord ----
const chords = chordsFrom('blasts', 4, 6);       // 45 blasts of 3–10 notes: four with at least six, so the counts are never starved
const small = chordsFrom('chordShapes', 3, 2);   // the two- and three-note shapes, for the "short" case
const onsets = evenOnsets(24, 320);
const base = { countMin: 2, countMax: 4, reattackMs: 200, seed: 7, selection: 'shuffle', advance: 'exhaust', order: 'turn', dealer: 'free' };
const A = SC.deal(onsets, chords, players, base, realize, null);
const B = SC.deal(onsets, chords, players, base, realize, null);
ok(JSON.stringify(A.events) === JSON.stringify(B.events), 'the same seed gives the same sequence, note for note');
ok(JSON.stringify(SC.deal(onsets, chords, players, Object.assign({}, base, { seed: 8 }), realize, null).events) !== JSON.stringify(A.events), 'a different seed gives a different sequence');
ok(A.events.length === 24 && A.summary.notes > 40, 'every onset dealt (' + A.events.length + ' onsets, ' + A.summary.notes + ' notes)');
{
    const t = SC.tightest(A.events);
    ok(t.ms == null || t.ms >= 200, 'no player plays again until 200 ms after its last sound ENDS — PLAN 1l\'s rule (the tightest rest is ' + (t.ms == null ? 'n/a' : t.ms + ' ms') + ')');
}
ok(A.events.every(e => e.count <= 4 && (e.count >= 2 || e.short)) && A.summary.flagged === 0, 'every count inside his range 2–4 except a chord\'s own tail, and nothing flagged at this speed');
ok(A.events.filter(e => e.short).every(e => e.count > 0 && e.count < e.wanted), 'a chord\'s TAIL is the only onset below the wanted count — what the chord had left, marked short (' + A.summary.short + ' of 24; "exhaust" makes one at the end of each chord)');
{
    const sh = SC.deal(evenOnsets(12, 400), small, players, Object.assign({}, base, { countMin: 3, countMax: 4 }), realize, null);
    ok(sh.summary.short > 0 && sh.events.filter(e => e.short).every(e => e.count > 0 && e.count < e.wanted && e.count <= 3), 'a two- or three-note chord caps the count: the onset takes what the chord holds (' + sh.summary.short + ' of 12 short)');
}
ok(A.events.every(e => { const ls = e.notes.map(n => n.lane); return new Set(ls).size === ls.length; }), 'no player takes two notes of one onset');
ok(A.events.every(e => {
    const pitchOrder = e.notes.map(n => n.pitch), centre = e.notes.map(n => { const p = players.find(x => x.lane === n.lane); return (p.lo + p.hi) / 2; });
    return pitchOrder.every((v, i) => i === 0 || v >= pitchOrder[i - 1]) && centre.every((v, i) => i === 0 || v >= centre[i - 1]);
}), 'the notes go to the players BY REGISTER: both the pitches and the players rise together');
ok(A.events.every(e => e.notes.every(n => { const p = players.find(x => x.lane === n.lane); return n.midi >= p.lo && n.midi <= p.hi && (n.midi - n.pitch) % 12 === 0; })), 'every note sounds inside its player\'s range, folded by whole octaves');
ok(A.summary.folds > 0 && A.events.some(e => e.notes.some(n => n.fold !== 0)), 'the octave folds are counted (' + A.summary.folds + ')');
ok(/24 onsets · \d+ notes · \d+ chords · 2–4 players, rest 200 ms/.test(SC.describe(A)), 'describe: ' + SC.describe(A));

// ---- (3) the advance modes and the orders ----
{
    const one = [chords[0]];
    const ex = SC.deal(evenOnsets(12, 400), one, players, Object.assign({}, base, { advance: 'exhaust', selection: 'low' }), realize, null);
    const first = one[0].pitches.slice().sort((a, b) => a - b);
    const sounded = [];
    for (const e of ex.events) { for (const n of e.notes) sounded.push(n.pitch); if (sounded.length >= first.length) break; }
    ok(JSON.stringify(sounded.slice(0, first.length).sort((a, b) => a - b)) === JSON.stringify(first), 'exhaust: every note of the chord sounds once before it comes round again');
    const each = SC.deal(evenOnsets(8, 400), chords, players, Object.assign({}, base, { advance: 'each' }), realize, null);
    ok(each.events.every((e, i) => i === 0 || e.chordId !== each.events[i - 1].chordId), 'a fresh chord every onset');
    const times = SC.deal(evenOnsets(24, 400), chords, players, Object.assign({}, base, { advance: 'times', timesMin: 3, timesMax: 3 }), realize, null);
    const runs = []; times.events.forEach(e => { const last = runs[runs.length - 1]; if (last && last.id === e.chordId) last.n++; else runs.push({ id: e.chordId, n: 1 }); });
    ok(runs.slice(0, -1).every(r => r.n === 3), 'n times each: every chord stays for exactly three onsets (' + runs.map(r => r.n).join(',') + ')');
    const turn = SC.deal(evenOnsets(8, 400), chords, players, Object.assign({}, base, { advance: 'each', order: 'turn' }), realize, null);
    ok(turn.events.map(e => e.chordId).join() === [0, 1, 2, 3, 0, 1, 2, 3].map(i => chords[i].id).join(), 'in turn: the list in its own order, wrapping');
    const sh = SC.deal(evenOnsets(8, 400), chords, players, Object.assign({}, base, { advance: 'each', order: 'shuffled', seed: 3 }), realize, null);
    const lap1 = sh.events.slice(0, 4).map(e => e.chordId);
    ok(new Set(lap1).size === 4, 'shuffled: every chord once before any repeats (shuffle to completion)');
}

// ---- (4) the lowering and the flag ----
{
    const fast = SC.deal(evenOnsets(20, 90), chords, players, Object.assign({}, base, { countMin: 2, countMax: 4 }), realize, null);
    const t = SC.tightest(fast.events);
    ok(fast.summary.lowered > 0, 'a fast run lowers counts inside the range (' + fast.summary.lowered + ' lowered)');
    ok(t.ms == null || t.ms >= 200, 'and still never breaks the 200 ms rest AFTER THE END');
    ok(fast.events.every(e => e.flagged || e.short || (e.count >= 2 && e.count <= 4)), 'an unflagged onset always holds at least his minimum, unless the chord itself ran out');
    const tooFast = SC.deal(evenOnsets(24, 40), chords, players, Object.assign({}, base, { countMin: 3, countMax: 4 }), realize, null);
    ok(tooFast.summary.flagged > 0 && tooFast.warnings.length === 1, 'too fast for the minimum: the onsets are flagged and the warning names the cure');
    ok(SC.tightest(tooFast.events).ms >= 200, 'even then the rule holds — the count gives way, never the rest');
}

// ---- (5) the manual onset ----
{
    const manual = { 3: { count: 4, chordId: chords[1].id, players: [0, 1, 5, 6] } };
    const M = SC.deal(onsets, chords, players, base, realize, manual);
    const e3 = M.events[3];
    ok(e3.manual && e3.chordId === chords[1].id && e3.notes.length === 4 && e3.notes.map(n => n.lane).sort().join() === '0,1,5,6', 'a hand onset keeps its chord, its count and its players');
    ok(e3.notes.every(n => chords[1].pitches.indexOf(n.pitch) >= 0), 'its notes come from the chord it was given');
    const M2 = SC.deal(onsets, chords, players, Object.assign({}, base, { seed: 99 }), realize, manual);
    ok(JSON.stringify(M2.events[3].notes.map(n => n.lane).sort()) === JSON.stringify(e3.notes.map(n => n.lane).sort()), 'a new seed re-deals the rest and leaves the hand onset alone');
    const tight = SC.deal(evenOnsets(6, 100), chords, players, base, realize, { 1: { count: 4, players: [0, 1, 5, 6] } });
    ok(tight.events[1].manual && tight.events[1].flagged && tight.events[1].notes.length === 4, 'a hand onset that breaks the rest is FLAGGED and left exactly as he set it (never lowered)');
    ok(JSON.stringify(SC.deal(onsets, chords, players, base, realize, null).events[3].notes) !== JSON.stringify(e3.notes), 'without the hand setting that onset is the machine\'s again');
    ok(SC.deal([], chords, players, base, realize, null).summary.info === 'no onsets' && SC.deal(onsets, [], players, base, realize, null).summary.info === 'no chords in the list', 'nothing to deal is said, not thrown');
}

console.log(fails ? ('\n' + fails + ' FAILED') : '\nALL PASS');
process.exit(fails ? 1 : 0);
