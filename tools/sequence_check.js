#!/usr/bin/env node
// sequence_check — the sequence generator (score/public/sequence.js) on the six reference chords (PLAN 1d.1, 2026-09-19).
// The container arithmetic · both change rules · the dynamic carry · the ceilings · the same seed giving the same result · the refusals.
//   node tools/sequence_check.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SEQ = require(path.join(ROOT, 'score', 'public', 'sequence.js'));
const BC = require(path.join(ROOT, 'score', 'public', 'beating_calc.js'));
const REF = require(path.join(ROOT, 'bank', 'reference_chords.json'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const EPS = 1e-6;

// THE LADDER IS dyn_ui.js's OWN — the file run as it stands against a stub drawer, the way check_ceilings.js reads TRACKS out of
// composer.html. Not a copy: if the drawer's scale moves, this check moves with it.
function loadLadder() {
    const src = fs.readFileSync(path.join(ROOT, 'score', 'public', 'dyn_ui.js'), 'utf8');
    const box = { self: { StrikeDrawer: { cfg: {}, el: null, notesFor() { return []; }, writeFields() {} } },
                  document: { readyState: 'complete', addEventListener() {} }, setTimeout() {}, console };
    vm.runInNewContext(src, box);
    return box.self.StrikeDyn;
}
const ladder = loadLadder();
const ctx = { ceilings: BC, ladder };
ok(ladder && ladder.NAMES.length === 8 && ladder.ANCHOR.ppp === ladder.LO && ladder.ANCHOR.fff === ladder.HI, 'the ladder read from dyn_ui.js itself: ' + ladder.NAMES.map(n => n + ' ' + ladder.ANCHOR[n]).join(' · '));

// the six reference chords as a take would deal them: lane · seat · inst · tech · pitch · cents · level (mf's height, 0.5)
const chordOf = c => c.voices.map(v => ({ lane: v.part, seat: v.bow === 2 ? 1 : 0, inst: v.instrument, tech: 'ordinario', midi: v.midi, cents: v.cents || 0, partial: v.partial, level: 0.5 }));
const CHORDS = REF.chords.map(chordOf);
const DURS = [20, 12, 30, 8, 45, 17], T0 = 10, TOTAL = DURS.reduce((a, b) => a + b, 0);
const recipe = (change, over) => Object.assign({ t0: T0, change, containers: CHORDS.map((ch, i) => ({ dur: DURS[i], chord: ch, dyn: 'as dealt' })), breath: { striation: 'staggered', length: 8, jitter: 0.35, seed: 7 } }, over || {});
const same = (s, n) => s.midi === n.midi && (s.cents || 0) === n.cents;
const srcOf = (R, n) => (SEQ.keyChord(R.containers[n.container].chord)[n.player] || []).find(s => same(s, n));
const ceilOf = n => BC.CEILINGS[n.inst] ? BC.ceilingFor(n.inst, n.level).seconds : Infinity;
const chains = out => { const m = {}; out.notes.forEach(n => (m[n.player] || (m[n.player] = [])).push(n)); return m; };
const held = out => out.notes.filter(n => n.kind !== 'fixed');
console.log('six chords, ' + CHORDS.map(c => c.length).join(' · ') + ' voices; containers ' + DURS.join(' · ') + ' s from ' + T0 + ' s');

// ---------------------------------------------------------------- 1 · the container arithmetic
const RA = recipe('attack'), A = SEQ.generate(RA, ctx);
ok(A.bounds.length === 7 && A.bounds[0] === T0 && A.bounds.every((b, i) => i === 0 || Math.abs(b - A.bounds[i - 1] - DURS[i - 1]) < EPS), 'the boundaries add up: ' + A.bounds.join(' · '));
ok(A.end === T0 + TOTAL && A.total === TOTAL, 'the sequence ends where the last container ends: ' + A.end + ' s (' + A.total + ' s long)');
ok(A.notes.every(n => n.start >= T0 - EPS && n.end <= A.end + EPS && n.dur > 0 && Math.abs(n.end - n.start - n.dur) < 0.0015), 'every note lies inside the sequence, start + dur = end (' + A.notes.length + ' notes)');

// ---------------------------------------------------------------- 2 · attack
let everyone = true, within = true, pitches = true;
RA.containers.forEach((c, i) => Object.keys(SEQ.keyChord(c.chord)).forEach(k => { if (!A.notes.some(n => n.player === k && n.container === i && n.start === A.bounds[i])) everyone = false; }));
ok(everyone, 'attack: every player of every chord starts AT its boundary, together');
A.notes.forEach(n => { if (n.end > A.bounds[n.container + 1] + EPS) within = false; if (!srcOf(RA, n)) pitches = false; });
ok(within && !A.notes.some(n => n.flags.includes('ACROSS')), 'attack: every chain is cut at the boundary — no note crosses a line');
ok(pitches, 'attack: every note carries the pitch and cents of its own container\'s chord');
let breathBefore = true, landed = true;
const chA = chains(A);
Object.keys(chA).forEach(k => RA.containers.forEach((c, i) => {
    const mine = chA[k].filter(n => n.container === i); if (!mine.length) return;
    const lastN = mine[mine.length - 1], playsNext = i < 5 && !!SEQ.keyChord(RA.containers[i + 1].chord)[k];
    if (playsNext && lastN.end > A.bounds[i + 1] - SEQ.NUMBERS.MIN_GAP_S + EPS) breathBefore = false;
    if (!playsNext && Math.abs(lastN.end - A.bounds[i + 1]) > 0.0015) landed = false;
}));
ok(breathBefore, 'attack: a player who attacks the next chord lands a gap BEFORE the line — the breath before the attack');
ok(landed, 'attack: a player with nothing next lands ON the line — the final breaths are dealt to land, not chopped');
ok(!held(A).some(n => n.flags.includes('RUNT')), 'attack: the landing leaves no runt (nothing held is shorter than ' + SEQ.NUMBERS.RUNT_S + ' s)');
const reb = Object.keys(chA).map(k => chA[k].filter(n => n.container === 4 && n.start > A.bounds[4])[0]).filter(Boolean).map(n => n.start);   // past the line, so a double stop's second note is not mistaken for a re-breath
ok(new Set(reb).size === reb.length && reb.length >= 6, 'attack: the entries are together and the RE-BREATHS are spread (container 5, second breaths): ' + reb.map(x => x.toFixed(1)).join(' '));

// ---------------------------------------------------------------- 3 · seamless
const RS = recipe('seamless'), Sm = SEQ.generate(RS, ctx);
const inBox = (out, t) => { let i = 0; while (i < 5 && out.bounds[i + 1] <= t + 1e-9) i++; return i; };
ok(Sm.notes.every(n => n.container === inBox(Sm, n.start)), 'seamless: every note belongs to the container it STARTS in');
ok(Sm.notes.every(n => !!srcOf(RS, n)), 'seamless: a pitch changes only at a breath start — each note holds its starting container\'s pitch to its end');
const across = Sm.notes.filter(n => n.flags.includes('ACROSS'));
const keptOld = across.filter(n => { const nx = SEQ.keyChord(RS.containers[inBox(Sm, n.end - 0.001)].chord)[n.player]; return nx && !nx.some(s => same(s, n)); });
ok(across.length > 0 && keptOld.length > 0, 'seamless: a breath across a line keeps the OLD chord — ' + across.length + ' notes cross a line, ' + keptOld.length + ' of them while the new chord asks that player for another pitch');
const chS = chains(Sm);
ok(Object.keys(chS).every(k => chS[k].every((n, i) => i === 0 || n.start === chS[k][i - 1].start || n.start >= chS[k][i - 1].end + SEQ.NUMBERS.MIN_GAP_S - 0.0015 || chS[k][i - 1].kind === 'fixed')), 'seamless: one chain per player — no two notes of a player touch (≥ 50 ms apart)');
const stopsA = chA['6:0'].filter(n => n.container === 4), stopsS = chS['6:0'].filter(n => n.container === 4);
const paired = L => L.length >= 2 && L.length % 2 === 0 && L.every((n, i) => i % 2 ? (n.start === L[i - 1].start && n.end === L[i - 1].end && n.midi !== L[i - 1].midi) : true);
ok(paired(stopsA) && paired(stopsS), 'chord 5\'s cello DOUBLE STOP is one player on one bow: E♭4 and A4 share every start and end (' + stopsA.length / 2 + ' bows under attack, ' + stopsS.length / 2 + ' under seamless)');
const firsts = Object.keys(chS).map(k => chS[k][0].start);
ok(new Set(firsts).size === firsts.length && Math.max.apply(null, firsts) - T0 < 8 * 0.5 && Math.min.apply(null, firsts) === T0, 'seamless: the first entries are staggered inside half a breath: ' + firsts.map(x => (x - T0).toFixed(2)).join(' '));
const lastKeys = Object.keys(SEQ.keyChord(RS.containers[5].chord));
ok(lastKeys.every(k => Math.abs(chS[k][chS[k].length - 1].end - Sm.end) < 0.0015), 'seamless: everyone in the last chord lands on the end, ' + Sm.end + ' s');
ok(Sm.notes.length < A.notes.length, 'seamless deals fewer notes than attack on the same row (' + Sm.notes.length + ' against ' + A.notes.length + ') — nothing restarts at a line');

// ---------------------------------------------------------------- 4 · a player absent from a chord rests through it
const all = {}; RS.containers.forEach(c => Object.keys(SEQ.keyChord(c.chord)).forEach(k => { all[k] = 1; }));
const partTimer = Object.keys(all).find(k => RS.containers.some(c => !SEQ.keyChord(c.chord)[k]));
if (partTimer) {
    const off = RS.containers.map((c, i) => SEQ.keyChord(c.chord)[partTimer] ? -1 : i).filter(i => i >= 0);
    ok(off.every(i => !A.notes.some(n => n.player === partTimer && n.container === i)) && off.every(i => !Sm.notes.some(n => n.player === partTimer && n.start >= Sm.bounds[i] - EPS && n.start < Sm.bounds[i + 1] - EPS)),
        'player ' + partTimer + ' is absent from chord' + (off.length > 1 ? 's ' : ' ') + off.map(i => i + 1).join(', ') + ' and starts nothing there, under either rule');
    ok(off.every(i => !Sm.notes.some(n => n.player === partTimer && n.start < Sm.bounds[i] && n.end > Sm.bounds[i] + EPS)), 'seamless: its chain LANDS on the line where it drops out — it does not hold into a chord it is not in');
} else ok(true, 'every player is in all six chords — the rest case is covered by the synthetic row below');
const Rrest = { t0: 0, change: 'seamless', containers: [{ dur: 20, chord: CHORDS[0] }, { dur: 20, chord: CHORDS[0].filter(n => n.lane !== 2) }, { dur: 20, chord: CHORDS[0] }], breath: { seed: 3 } };
const rest = SEQ.generate(Rrest, ctx).notes.filter(n => n.lane === 2);   // (every player is in all six reference chords, so the rest is proved on this row)
ok(rest.length >= 2 && !rest.some(n => n.start < 40 - EPS && n.end > 20 + EPS) && rest.some(n => Math.abs(n.end - 20) < 0.0015) && rest.some(n => n.start >= 40 - EPS), 'a synthetic row (the horn out of box 2): it lands on 20 s, rests, and re-enters after 40 s — ' + rest.map(n => n.start + '–' + n.end).join(' '));

// ---------------------------------------------------------------- 5 · the dynamic carry
const DYNS = ['ppp', 'as dealt', 'fff', 'mf', 'as dealt', 'pp'];
const hOf = name => (ladder.ANCHOR[name] - ladder.LO) / (ladder.HI - ladder.LO);
const withDyn = R => { R.containers.forEach((c, i) => { c.dyn = DYNS[i]; }); return R; };
const AD = SEQ.generate(withDyn(recipe('attack')), ctx), SD = SEQ.generate(withDyn(recipe('seamless')), ctx);
const wantLv = n => DYNS[n.container] === 'as dealt' ? 0.5 : hOf(DYNS[n.container]);
ok(AD.notes.every(n => Math.abs(n.level - wantLv(n)) < EPS), 'attack: a box\'s dynamic is the level of every note in it (ppp ' + hOf('ppp') + ' · as dealt 0.5 · fff ' + hOf('fff') + ' · mf ' + hOf('mf').toFixed(3) + ')');
ok(SD.notes.every(n => Math.abs(n.level - wantLv(n)) < EPS), 'seamless: the level carries as the pitch does — each breath takes the level of the container it starts in');
const loudAcross = SD.notes.filter(n => n.flags.includes('ACROSS') && Math.abs(wantLv(n) - wantLv({ container: inBox(SD, n.end - 0.001) })) > EPS);
ok(loudAcross.length > 0, 'seamless: a breath across a line keeps the OLD level too (' + loudAcross.length + ' notes)');
ok(AD.notes.concat(SD.notes).every(n => n.levels.length === 2 && n.levels[0][0] === 0 && n.levels[1][0] === n.dur && n.levels[0][1] === n.level && n.levels[1][1] === n.level), 'a note\'s level is BREAKPOINTS from the first day — [[0, level], [dur, level]], flat today');
const viaVel = SEQ.generate({ t0: 0, change: 'attack', containers: [{ dur: 10, chord: CHORDS[0].map(n => Object.assign({}, n, { level: undefined, vel: 100 })) }] }, ctx);
ok(viaVel.notes.every(n => Math.abs(n.level - (100 - ladder.LO) / (ladder.HI - ladder.LO)) < EPS), '"as dealt" also reads a dealt anchor velocity through the ladder: vel 100 → height ' + ((100 - ladder.LO) / (ladder.HI - ladder.LO)).toFixed(3));

// ---------------------------------------------------------------- 6 · the ceilings
const over = out => held(out).filter(n => n.dur > ceilOf(n) + EPS);
ok(!over(A).length && !over(Sm).length && !over(AD).length && !over(SD).length, 'no note longer than its ceiling at its own level — attack, seamless, with and without dynamics');
const long = o => ({ breath: { striation: 'staggered', length: 40, jitter: 0.2, seed: 11 }, containers: CHORDS.map((ch, i) => ({ dur: 60, chord: ch, dyn: o })) });
['ppp', 'mf', 'fff'].forEach(d => ['attack', 'seamless'].forEach(chg => {
    const out = SEQ.generate(recipe(chg, long(d)), ctx), h = held(out), capped = h.filter(n => n.flags.includes('CEILING'));
    ok(!over(out).length && capped.length > 0, 'a 40 s breath dial at ' + d + ', ' + chg + ': the ceiling SPLITS, never truncates — ' + capped.length + ' of ' + h.length + ' notes at their ceiling, none over');
}));
const vibF = SEQ.generate(recipe('attack', long('fff')), ctx).notes.filter(n => n.inst === 'bowed_vibraphone'), vibP = SEQ.generate(recipe('attack', long('ppp')), ctx).notes.filter(n => n.inst === 'bowed_vibraphone');
ok(Math.max.apply(null, vibF.map(n => n.dur)) <= BC.ceilingFor('bowed_vibraphone', 1).seconds + EPS && Math.max.apply(null, vibP.map(n => n.dur)) > BC.ceilingFor('bowed_vibraphone', 1).seconds,
    'the ceiling is read at the note\'s level: the vibraphone\'s longest bow is ' + Math.max.apply(null, vibF.map(n => n.dur)) + ' s at fff, ' + Math.max.apply(null, vibP.map(n => n.dur)) + ' s at ppp');
const windGaps = []; Object.keys(chS).forEach(k => chS[k].forEach((n, i) => { if (i && n.kind === 'breath' && n.start !== chS[k][i - 1].start) windGaps.push(n.start - chS[k][i - 1].end); }));
ok(windGaps.length > 0 && Math.min.apply(null, windGaps) >= 0.75 * (1 - 0.35 * 0.5) - 0.0015, 'the winds re-enter after the palette\'s gap (0.75 s, jittered by half the jitter): shortest ' + Math.min.apply(null, windGaps).toFixed(3) + ' s');

// ---------------------------------------------------------------- 7 · the seats, and a fixed-length sound
ok(A.players.some(p => p.key === '5:0') && A.players.some(p => p.key === '5:1') && chA['5:0'].every(n => n.lane === 5 && n.seat === 0) && chA['5:1'].every(n => n.lane === 5 && n.seat === 1), 'chains are keyed by SEAT: the two vibraphone bows are two players on one lane');
const bell = { lane: 4, seat: 0, inst: 'percussion', tech: 'bell_tree', midi: 60, cents: 0, level: 0.5, fixedLen: 2.5 };
const RP = r => recipe(r, { containers: CHORDS.map((ch, i) => ({ dur: DURS[i], chord: ch.concat([bell]), dyn: 'as dealt' })) });
const PA = SEQ.generate(RP('attack'), ctx), PS = SEQ.generate(RP('seamless'), ctx);
const strikesA = PA.notes.filter(n => n.lane === 4), strikesS = PS.notes.filter(n => n.lane === 4);
ok(strikesA.length > 6 && strikesA.concat(strikesS).every(n => n.kind === 'fixed' && n.dur === 2.5 && !n.flags.includes('CEILING')), 'a fixed-length sound is struck once per breath and the sample decides its length: ' + strikesA.length + ' strikes (attack) · ' + strikesS.length + ' (seamless), each 2.5 s');
ok(PA.bounds.slice(0, 6).every(b => strikesA.some(n => n.start === b)), 'attack: the percussion strikes at every boundary with everyone else');

// ---------------------------------------------------------------- 8 · one seed
const j = x => JSON.stringify(x);
ok(j(SEQ.generate(recipe('attack'), ctx)) === j(A) && j(SEQ.generate(recipe('seamless'), ctx)) === j(Sm), 'the same recipe and seed give the same notes, both rules');
ok(j(SEQ.generate(recipe('seamless', { breath: { striation: 'staggered', length: 8, jitter: 0.35, seed: 8 } }), ctx).notes) !== j(Sm.notes), 'another seed gives other breaths');
const retimed = recipe('attack'); retimed.containers[3].dur = 25;
const RT = SEQ.generate(retimed, ctx);
ok(j(RT.notes.filter(n => n.container < 3)) === j(A.notes.filter(n => n.container < 3)) && j(RT.notes.filter(n => n.container === 4).map(n => r3(n.start - RT.bounds[4]))) === j(A.notes.filter(n => n.container === 4).map(n => r3(n.start - A.bounds[4]))),
    'attack: re-timing box 4 leaves every other box\'s breaths where they were (each box has its own random stream)');
function r3(v) { return Math.round(v * 1000) / 1000; }

// ---------------------------------------------------------------- 9 · the refusals
const refuses = (R, re, what) => { let msg = null; try { SEQ.generate(R, ctx); } catch (e) { msg = e.message; } ok(msg != null && re.test(msg), 'refused — ' + what + ': "' + (msg || 'NOT REFUSED').slice(0, 110) + '"'); };
const zero = recipe('attack'); zero.containers[1].dur = 0; refuses(zero, /container 2: a duration of 0 s/, 'a 0 s container');
const empty = recipe('seamless'); empty.containers[2].chord = []; refuses(empty, /container 3: an empty chord/, 'an empty chord');
refuses(recipe('crossfade'), /change must be/, 'an unknown change rule');
const badDyn = recipe('attack'); badDyn.containers[0].dyn = 'ffff'; refuses(badDyn, /not on the ladder/, 'a dynamic that is not on the ladder');
refuses({ t0: 0, change: 'attack', containers: [] }, /at least one container/, 'no containers');
let noLadder = null; try { SEQ.generate(withDyn(recipe('attack')), { ceilings: BC }); } catch (e) { noLadder = e.message; }
ok(/needs the drawer's ladder/.test(noLadder || ''), 'a named dynamic with no ladder loaded is refused, never guessed');

// ---------------------------------------------------------------- 10 · a very short box
const tiny = recipe('attack'); tiny.containers[2].dur = 1;
const TN = SEQ.generate(tiny, ctx), in3 = TN.notes.filter(n => n.container === 2);
ok(in3.length === CHORDS[2].length && in3.every(n => n.start === TN.bounds[2] && n.end <= TN.bounds[3] + EPS), 'a 1 s box under attack: everyone plays it once, from the line, inside it');
const tinyS = recipe('seamless'); tinyS.containers.forEach(c => { c.dur = 2; });
ok(SEQ.generate(tinyS, ctx).notes.length >= CHORDS[0].length, 'six 2 s boxes under seamless: the stagger never pushes a player past a short span');

// ---------------------------------------------------------------- 11 · a REST (PLAN 1d.4): `chord: null` is silence for its duration
// container 3 (30 s, from 42 to 72 s) becomes a rest between chords 2 and 4
['attack', 'seamless'].forEach(change => {
    const R = recipe(change); R.containers[2].chord = null;
    const G = SEQ.generate(R, ctx), a = G.bounds[2], b = G.bounds[3];
    const heldG = G.notes.filter(n => n.kind !== 'fixed');
    ok(G.bounds.length === 7 && G.end === T0 + TOTAL, change + ' + a rest: the boundaries still add up — the rest keeps its ' + DURS[2] + ' s (' + a + ' → ' + b + ')');
    ok(!G.notes.some(n => n.container === 2) && !heldG.some(n => n.start < b - EPS && n.end > a + EPS), change + ' + a rest: no note starts in it and no held note sounds inside it');
    const before = Object.keys(SEQ.keyChord(R.containers[1].chord)), after = Object.keys(SEQ.keyChord(R.containers[3].chord));
    const landed = before.every(k => { const last = heldG.filter(n => n.player === k && n.end <= a + EPS).pop(); return !last || Math.abs(last.end - a) < 0.0015 || BC.CEILINGS[last.inst] == null; });
    ok(landed, change + ' + a rest: every chain LANDS on the rest\'s start (' + before.length + ' players)');
    const back = after.every(k => G.notes.some(n => n.player === k && n.container === 3 && n.start >= b - EPS));
    const together = after.every(k => G.notes.some(n => n.player === k && n.container === 3 && n.start === b));
    ok(back && (change === 'seamless' || together), change + ' + a rest: everyone re-enters after it' + (change === 'attack' ? ', together AT its end' : ', staggered as a first entry is'));
});
const lead = recipe('attack'); lead.containers[0].chord = null; lead.containers[5].chord = null;
const LG = SEQ.generate(lead, ctx);
ok(LG.notes.length > 0 && LG.notes.every(n => n.start >= LG.bounds[1] - EPS) && LG.notes.filter(n => n.kind !== 'fixed').every(n => n.end <= LG.bounds[5] + EPS) && LG.end === T0 + TOTAL, 'a rest first and a rest last: nothing sounds in either, and the sequence keeps its whole length');
const allRest = recipe('attack'); allRest.containers.forEach(c => { c.chord = null; });
refuses(allRest, /every container is a rest/, 'a sequence of nothing but rests');
const stillEmpty = recipe('attack'); stillEmpty.containers[1].chord = [];
refuses(stillEmpty, /container 2: an empty chord/, 'an empty chord object is still malformed — a rest is null, and deliberate');

console.log('\n' + (fail ? 'SEQUENCE RED: ' + fail + ' failed' : 'SEQUENCE GREEN: ' + pass + ' checks'));
process.exit(fail ? 1 : 0);
