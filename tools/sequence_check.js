#!/usr/bin/env node
// sequence_check — the sequence generator (score/public/sequence.js) on the six reference chords (PLAN 1d.1, 2026-09-19).
// The container arithmetic · both change rules · the dynamic carry · the ceilings · the same seed giving the same result · the refusals ·
// a REST (1d.4) · THE GATE — untouched breath dials give the notes frozen in tools/sequence_baseline.json (1d.5, §12) · the breath dials (§13).
//   node tools/sequence_check.js --freeze     writes the baseline; refuses to overwrite one
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

// ---------------------------------------------------------------- 12 · THE GATE (PLAN 1d.5): with no breath dial touched, the notes are 1d.4's
// tools/sequence_baseline.json was frozen from the generator as it stood at 6115f52, BEFORE the breath dials went in. It holds a
// sha256 of { bounds, notes } for each case below. `--freeze` writes it and refuses to overwrite: re-freezing is how a gate is lost.
const crypto = require('crypto');
const BASE_FILE = path.join(__dirname, 'sequence_baseline.json');
const restAt2 = change => { const R = recipe(change); R.containers[2].chord = null; return R; };
const BASE_CASES = {
    'attack': () => recipe('attack'),
    'seamless': () => recipe('seamless'),
    'attack + dynamics': () => withDyn(recipe('attack')),
    'seamless + dynamics': () => withDyn(recipe('seamless')),
    'attack + percussion': () => RP('attack'),
    'seamless + percussion': () => RP('seamless'),
    'attack + a rest': () => restAt2('attack'),
    'seamless + a rest': () => restAt2('seamless'),
    'seamless, a 40 s breath at fff': () => recipe('seamless', long('fff')),
    'seamless, grouped · 6 s · 0.5 · seed 3': () => recipe('seamless', { breath: { striation: 'grouped', length: 6, jitter: 0.5, seed: 3 } }),
};
const hashOf = R => { const G = SEQ.generate(R, ctx); return { notes: G.notes.length, sha256: crypto.createHash('sha256').update(JSON.stringify({ bounds: G.bounds, notes: G.notes })).digest('hex') }; };
if (process.argv.includes('--freeze')) {
    if (fs.existsSync(BASE_FILE)) { console.log('\nREFUSED: ' + BASE_FILE + ' exists. A baseline is frozen once; delete it by hand if the generator is MEANT to change.'); process.exit(1); }
    const cases = {}; Object.keys(BASE_CASES).forEach(k => { cases[k] = hashOf(BASE_CASES[k]()); });
    fs.writeFileSync(BASE_FILE, JSON.stringify({ what: 'sequence.js, every breath dial at its default: sha256 of { bounds, notes } per case (tools/sequence_check.js §12)', frozen: new Date().toISOString(), cases }, null, 2) + '\n');
    console.log('\nfrozen: ' + Object.keys(cases).length + ' cases → ' + BASE_FILE); process.exit(0);
}
const BASE = fs.existsSync(BASE_FILE) ? JSON.parse(fs.readFileSync(BASE_FILE, 'utf8')) : null;
ok(!!BASE, 'the baseline is there: tools/sequence_baseline.json' + (BASE ? ' (frozen ' + BASE.frozen.slice(0, 10) + ')' : ' — MISSING'));
if (BASE) Object.keys(BASE_CASES).forEach(k => { const h = hashOf(BASE_CASES[k]()), b = BASE.cases[k] || {}; ok(h.sha256 === b.sha256, 'untouched dials = the frozen notes — ' + k + ' (' + h.notes + ' notes' + (h.sha256 === b.sha256 ? '' : ', the baseline has ' + b.notes) + ')'); });

// ---------------------------------------------------------------- 13 · the breath dials (PLAN 1d.5): together · apart · lengths
const dial = (change, breath, R) => { const X = R || recipe(change); X.change = change; X.breath = Object.assign({ striation: 'staggered', length: 8, jitter: 0.35, seed: 7 }, breath); return SEQ.generate(X, ctx); };
const box40 = () => ({ t0: 0, change: 'seamless', containers: [{ dur: 40, chord: CHORDS[0], dyn: 'as dealt' }] });
// every start of every player, once (a double stop is one start); `re` = not the first of its span; an attack line is marked
const startsOf = G => {
    const seen = {}, out = [], firstOf = {};
    G.notes.forEach(n => {
        const k = n.player + '@' + n.start; if (seen[k]) return; seen[k] = 1;
        const line = G.change === 'attack' && G.bounds.indexOf(n.start) >= 0;
        const spanKey = n.player + '#' + (G.change === 'attack' ? n.container : 'run');
        const entry = line || firstOf[spanKey] == null; if (firstOf[spanKey] == null) firstOf[spanKey] = n.start;
        out.push({ t: n.start, p: n.player, line: line, re: !entry, flags: n.flags });
    });
    return out;
};
const closest = G => { const s = startsOf(G).filter(x => !x.line); let m = Infinity; s.forEach((a, i) => s.forEach((b, k) => { if (k > i && a.p !== b.p) m = Math.min(m, Math.abs(a.t - b.t)); })); return m; };
const sharedRe = G => { const s = startsOf(G); return s.filter(a => a.re && s.some(b => b.p !== a.p && Math.abs(b.t - a.t) < 0.0015)).length; };
const countFlag = (G, f) => startsOf(G).filter(x => x.flags.includes(f)).length;
ok(j(dial('attack', { together: null, apart: 0.5, lengths: null }).notes) === j(A.notes) && j(dial('seamless', { together: null, apart: 0.5, lengths: null }).notes) === j(Sm.notes),
    'the new dials spelled out at their defaults (together free · apart 0.5 · no pool) change nothing, both rules');
['seamless', 'attack'].forEach(chg => {
    const G0 = dial(chg, { together: 0 }), c = closest(G0);
    ok(c >= 0.5 - 0.0015 && !countFlag(G0, 'CROWDED') && countFlag(G0, 'APART') > 0, 'together 0, ' + chg + ', the six chords: no two players begin a breath within 0.5 s of each other' + (chg === 'attack' ? ' (the lines excepted — that is everyone, by design)' : '') + ' — closest ' + c.toFixed(3) + ' s, ' + countFlag(G0, 'APART') + ' starts moved; free, the closest were ' + closest(chg === 'attack' ? A : Sm).toFixed(3) + ' s');
});
const wide = dial('seamless', { together: 0, apart: 0.75 }, box40());
ok(closest(wide) >= 0.75 - 0.0015 && !countFlag(wide, 'CROWDED'), 'apart 0.75 s on one 40 s box: the staggered ENTRIES (0.5 s apart as dealt) are moved later too — ' + startsOf(wide).filter(x => !x.re).map(x => x.t.toFixed(2)).sort((a, b) => a - b).join(' ') + ' · closest ' + closest(wide).toFixed(3) + ' s');
// eight players breathing every ~8 s have room for about 0.75 s each way and no more: past it the rule cannot hold, and SAYS so
const tooWide = dial('seamless', { together: 0, apart: 1.25 }, box40());
ok(countFlag(tooWide, 'CROWDED') > 0 && !over(tooWide).length, 'apart 1.25 s is more room than eight players have: ' + countFlag(tooWide, 'CROWDED') + ' starts are flagged CROWDED and left where they fell — never silently broken');
['seamless', 'attack'].forEach(chg => {
    const G1 = dial(chg, { together: 1 }), s = startsOf(G1), re = s.filter(x => x.re), lead = G1.dealt[0];
    const onLeader = re.filter(x => x.p === lead || s.some(y => y.p === lead && Math.abs(y.t - x.t) < 0.0015)).length;
    ok(re.length > 20 && sharedRe(G1) === re.length && onLeader === re.length, 'together 1, ' + chg + ': every re-entry is shared, and every one is the leader\'s (' + lead + ') — ' + re.length + ' re-entries at ' + new Set(re.map(x => x.t)).size + ' moments; free, ' + sharedRe(chg === 'attack' ? A : Sm) + ' were shared');
});
const G0s = dial('seamless', { together: 0 }), Gh = dial('seamless', { together: 0.5 }), G1s = dial('seamless', { together: 1 });
ok(sharedRe(G0s) === 0 && sharedRe(Gh) > 0 && sharedRe(Gh) < sharedRe(G1s) && countFlag(Gh, 'SNAP') > 0, 'together is one dial from never to always: shared re-entries ' + sharedRe(G0s) + ' at 0 · ' + sharedRe(Gh) + ' at 0.5 · ' + sharedRe(G1s) + ' at 1 (at 0.5: ' + countFlag(Gh, 'SNAP') + ' snapped, ' + countFlag(Gh, 'APART') + ' kept apart)');
const unsnapped = startsOf(Gh).filter(a => !a.line && !startsOf(Gh).some(b => b.p !== a.p && Math.abs(b.t - a.t) < 0.0015));
ok(unsnapped.every(a => startsOf(Gh).every(b => b.p === a.p || b.line || Math.abs(b.t - a.t) >= 0.5 - 0.0015)), 'together 0.5: a start that is not shared is still kept 0.5 s from every other player\'s (' + unsnapped.length + ' of them)');
ok(G0s.dealt[0] === '5:0' && ['5:0'].every(k => [G0s, Gh, G1s].every(G => j(G.notes.filter(n => n.player === k)) === j(Sm.notes.filter(n => n.player === k)))),
    'THE SHORTEST BREATH LEADS: the bowed vibraphone (ceiling ' + BC.ceilingFor('bowed_vibraphone', 0.5).seconds + ' s at mf) is dealt first, and its breaths are the free deal\'s at every setting — the dial re-deals no length. The order: ' + G0s.dealt.join(' '));
let sound = true, maxWait = 0;
[0, 0.5, 1].forEach(tg => ['attack', 'seamless'].forEach(chg => [null, { values: [3, 9], weights: null }].forEach(pl => {
    const G = dial(chg, { together: tg, lengths: pl }), ch = chains(G);
    if (over(G).length || !G.notes.every(n => n.start >= T0 - EPS && n.end <= G.end + EPS && n.dur > 0)) sound = false;
    Object.keys(ch).forEach(k => ch[k].forEach((n, i) => { if (!i || n.start === ch[k][i - 1].start || ch[k][i - 1].kind === 'fixed') return; const g = n.start - ch[k][i - 1].end; if (g < SEQ.NUMBERS.MIN_GAP_S - 0.0015) sound = false; if (n.container === ch[k][i - 1].container || chg === 'seamless') maxWait = Math.max(maxWait, g); }));
    if (!Object.keys(SEQ.keyChord(CHORDS[5])).every(k => Math.abs(ch[k][ch[k].length - 1].end - G.end) < 0.0015)) sound = false;
})));
ok(sound && maxWait <= 0.75 * (1 + 0.35 * 0.5) + SEQ.NUMBERS.WAIT_MAX_S + 0.0015, 'under every setting (together 0 · 0.5 · 1 × both rules × with and without a pool): no note over its ceiling, no two notes of a player touching, everyone still lands on the end — and the longest silence a moved start cost a player is ' + maxWait.toFixed(3) + ' s (the gap + at most ' + SEQ.NUMBERS.WAIT_MAX_S + ' s)');
const PL = dial('seamless', { lengths: { values: [3, 9], weights: null } }), chP = chains(PL);
let poolOk = true, n3 = 0, n9 = 0, nCeil = 0;
Object.keys(chP).forEach(k => { const L = chP[k].filter((n, i) => !i || n.start !== chP[k][i - 1].start); L.slice(0, -2).forEach(n => { if (Math.abs(n.dur - 3) < 0.0015) n3++; else if (Math.abs(n.dur - 9) < 0.0015) n9++; else if (n.flags.includes('CEILING') && Math.abs(n.dur - ceilOf(n)) < 0.0015) nCeil++; else poolOk = false; }); });
ok(poolOk && n3 > 0 && n9 > 0, 'a pool `3 9`, seamless: every breath but a chain\'s last two (the landing) is 3 s, 9 s, or its ceiling — ' + n3 + ' of 3 s · ' + n9 + ' of 9 s · ' + nCeil + ' at a ceiling under 9 s');
const count = (G, v) => G.notes.filter(n => Math.abs(n.dur - v) < 0.0015).length;
const PW = dial('seamless', { lengths: { values: [3, 9], weights: [0.9, null] } });
ok(count(PW, 3) > 4 * count(PW, 9) && count(PW, 9) >= 0, 'a weighted pool (3 at 90%): ' + count(PW, 3) + ' breaths of 3 s against ' + count(PW, 9) + ' of 9 s — unweighted it was ' + count(PL, 3) + ' against ' + count(PL, 9));
ok(j(dial('seamless', { together: 0.5, lengths: { values: [3, 9], weights: null } }).notes) === j(dial('seamless', { together: 0.5, lengths: { values: [3, 9], weights: null } }).notes) && j(dial('seamless', { together: 0.5, seed: 8 }).notes) !== j(Gh.notes),
    'with the dials set: the same seed gives the same notes, another seed gives others (that is `re-breathe`)');
const badT = recipe('attack'); badT.breath.together = 2; refuses(badT, /breath\.together must be blank/, 'together 2');
const badA = recipe('attack'); badA.breath.apart = 0; refuses(badA, /breath\.apart must be more than 0/, 'apart 0');
const badL = recipe('attack'); badL.breath.lengths = { values: [] }; refuses(badL, /breath\.lengths needs values/, 'a pool with no values');

// ---------------------------------------------------------------- 14 · the waves (PLAN 1d.7): a box is a straight dynamic OR reads its players' streams of swells
const WV = { lengths: { values: [6, 10, 16], weights: null }, low: 'pp', high: 'mf', density: 0.7, peak: 0.5, seed: 1 };
const wavesRow = (change, dynsW, wOver, bOver) => { const R = recipe(change); if (bOver) R.breath = Object.assign({}, R.breath, bOver); R.containers.forEach((c, i) => { c.dyn = dynsW[i % dynsW.length]; }); R.waves = Object.assign({}, WV, wOver || {}); return R; };
const LO = hOf('pp'), HI = hOf('mf'), LEPS = 1e-4;   // a waved level is carried to four decimals
['attack', 'seamless'].forEach(chg => {
    const R0 = recipe(chg); R0.waves = Object.assign({}, WV);
    ok(hashOf(R0).sha256 === BASE.cases[chg].sha256, 'THE GATE again — the waves\' dials in the recipe and EVERY BOX STRAIGHT: the frozen notes, ' + chg);
});
const WA = SEQ.generate(wavesRow('attack', ['waves']), ctx), WS = SEQ.generate(wavesRow('seamless', ['waves']), ctx);
[['attack', WA], ['seamless', WS]].forEach(([chg, G]) => {
    const h = held(G), inRange = h.every(n => n.levels.every(p => p[1] >= LO - LEPS && p[1] <= HI + LEPS));
    const shaped = h.every(n => n.waves === true && n.levels.length >= 2 && n.levels[0][0] === 0 && Math.abs(n.levels[n.levels.length - 1][0] - n.dur) < 0.0015 && Math.abs(n.level - Math.max.apply(null, n.levels.map(p => p[1]))) < EPS && n.levels.every((p, i) => !i || p[0] > n.levels[i - 1][0]));
    const moving = h.filter(n => new Set(n.levels.map(p => p[1])).size > 1).length, tops = h.filter(n => n.levels.length > 2).length;
    ok(inRange && shaped && moving > h.length / 2 && tops > 0, 'all boxes waves, ' + chg + ': every level lies within pp … mf (' + LO.toFixed(3) + ' … ' + HI.toFixed(3) + '), breakpoints run 0 → dur, `level` is the loudest — ' + moving + ' of ' + h.length + ' notes move, ' + tops + ' hold a swell\'s top or foot inside them');
    ok(!over(G).length, 'all boxes waves, ' + chg + ': no note longer than the ceiling at its LOUDEST level');
});
const keysW = Object.keys(WS.streams), slotsOf = k => WS.streams[k].points.map((p, i, a) => (i ? r3(p[0] - a[i - 1][0]) : 0)).slice(1).join(' ');
ok(keysW.length === 8 && new Set(keysW.map(slotsOf)).size === 8 && new Set(keysW.map(k => r3(SEQ.levelAt(WS.streams[k].points, 0)))).size >= 4,
    'every player has a stream of their own — eight, no two with the same run of lengths (not phase copies of one wave), and out of step from the first second: the levels at 0 s are ' + keysW.map(k => SEQ.levelAt(WS.streams[k].points, 0).toFixed(2)).join(' '));
ok(j(SEQ.generate(wavesRow('seamless', ['waves']), ctx)) === j(WS) && j(SEQ.generate(wavesRow('seamless', ['waves'], { seed: 2 }), ctx).streams) !== j(WS.streams) && j(SEQ.generate(wavesRow('seamless', ['waves'], { seed: 2 }), ctx).bounds) === j(WS.bounds),
    'the waves have a seed of their own: the same seed repeats; another (`re-wave`) deals other streams and leaves the boxes where they were');
const mix = ['waves', 'mf', 'waves', 'waves', 'waves', 'waves'];
const MA = SEQ.generate(wavesRow('attack', mix), ctx), MS = SEQ.generate(wavesRow('seamless', mix), ctx);
const flatMf = n => !n.waves && n.levels.length === 2 && Math.abs(n.levels[0][1] - hOf('mf')) < EPS && Math.abs(n.levels[1][1] - hOf('mf')) < EPS;
ok(MA.notes.filter(n => n.container === 1).every(flatMf) && j(MA.notes.filter(n => n.container === 2)) === j(WA.notes.filter(n => n.container === 2)),
    'THE SWAP, attack: box 2 steps out to `mf` — flat inside it — and box 3\'s notes EQUAL the all-waves deal\'s box 3: the streams were not restarted');
// 1d.12 made the stream a 0 … 1 SWELL HEIGHT, mapped to a written level late, per box — so a stream value is read through the range
const thru = (G, k, x) => LO + (HI - LO) * SEQ.levelAt(G.streams[k].points, x);
ok(j(MS.streams) === j(WS.streams) && held(MS).filter(n => n.waves).every(n => Math.abs(n.levels[0][1] - thru(MS, n.player, n.start - T0)) < 0.0002 && Math.abs(n.levels[n.levels.length - 1][1] - thru(MS, n.player, n.end - T0)) < 0.0002),
    'THE SWAP, seamless: the streams are the all-waves deal\'s, untouched by the straight box, and every waved note reads its player\'s stream at its own start and end');
const outOf = MS.notes.filter(n => n.flags.includes('ACROSS') && n.container === 0), into = MS.notes.filter(n => n.flags.includes('ACROSS') && n.container === 1);
ok(outOf.length > 0 && outOf.every(n => n.waves) && into.length > 0 && into.every(flatMf), 'seamless: the level belongs to the BREATH — ' + outOf.length + ' breaths begun in the waves keep reading them across the line into the `mf` box, ' + into.length + ' begun in the `mf` box stay flat into the waves');
const D0 = SEQ.generate(wavesRow('seamless', ['waves'], { density: 0 }), ctx), D1 = SEQ.generate(wavesRow('seamless', ['waves'], { density: 1 }), ctx);
ok(held(D0).every(n => n.levels.every(p => Math.abs(p[1] - LO) < LEPS)) && keysW.every(k => D0.streams[k].swells === 0) && keysW.every(k => D1.streams[k].flats === 0 && D1.streams[k].swells > 5),
    'density 0 = flat at `low` (' + LO.toFixed(3) + ') · density 1 = swells back to back (no flat slot; ' + keysW.map(k => D1.streams[k].swells).join(' ') + ' swells) — at 0.7: ' + keysW.map(k => WS.streams[k].swells + '/' + (WS.streams[k].swells + WS.streams[k].flats)).join(' '));
const loudW = { low: 'ppp', high: 'fff' };
const LW = SEQ.generate(wavesRow('seamless', ['waves'], loudW, { length: 20, jitter: 0.2 }), ctx), vibW = LW.notes.filter(n => n.inst === 'bowed_vibraphone');
ok(!over(LW).length && held(LW).some(n => n.flags.includes('CEILING')) && Math.max.apply(null, vibW.map(n => n.dur)) > BC.ceilingFor('bowed_vibraphone', 1).seconds && vibW.some(n => n.level > 0.75 && n.dur <= BC.ceilingFor('bowed_vibraphone', 1).seconds + EPS),
    'a wave can SHORTEN a breath and never the reverse (ppp … fff, a 20 s breath dial): nothing over its ceiling; the vibraphone bows ' + Math.max.apply(null, vibW.map(n => n.dur)) + ' s through a quiet stretch and no more than ' + BC.ceilingFor('bowed_vibraphone', 1).seconds + ' s where the wave passes its top');
const RPW = RP('attack'); RPW.containers.forEach(c => { c.dyn = 'waves'; }); RPW.waves = Object.assign({}, WV);
const PW2 = SEQ.generate(RPW, ctx), strikesW = PW2.notes.filter(n => n.lane === 4);
ok(strikesW.length > 6 && strikesW.every(n => n.kind === 'fixed' && n.waves && n.levels.length === 2 && n.levels[0][1] === n.levels[1][1] && n.level >= LO - LEPS && n.level <= HI + LEPS) && new Set(strikesW.map(n => n.level)).size > 2,
    'the percussion in a waves box: each strike takes the wave\'s level AT the strike, no ramp — ' + strikesW.length + ' strikes at ' + new Set(strikesW.map(n => n.level)).size + ' different levels');
const TW = SEQ.generate(wavesRow('seamless', mix, null, { together: 0.5, lengths: { values: [3, 9], weights: null } }), ctx);
ok(!over(TW).length && TW.notes.some(n => n.waves) && countFlag(TW, 'SNAP') > 0, 'the waves under the breath dials (together 0.5, a pool 3 9): nothing over its ceiling, ' + countFlag(TW, 'SNAP') + ' starts snapped');
const wBad = (wOver, re, what) => refuses(wavesRow('attack', ['waves'], wOver), re, what);
wBad({ low: 'mf', high: 'pp' }, /waves\.low \(mf\) must be below waves\.high \(pp\)/, 'waves with low above high');
wBad({ low: 'niente' }, /must be on the ladder/, 'waves from niente — there is no niente inside the waves (option A)');
wBad({ density: 2 }, /waves\.density must be 0/, 'a density of 2');
let noLadW = null; try { SEQ.generate(wavesRow('attack', ['waves']), { ceilings: BC }); } catch (e) { noLadW = e.message; }
ok(/waves need the drawer's ladder/.test(noLadW || ''), 'waves with no ladder loaded are refused, never guessed');

// ---------------------------------------------------------------- 15 · the edges, and a change rule per box (PLAN 1d.8)
const edged = (change, edges, tagsOver, more) => { const R = recipe(change); if (edges) R.edges = edges; Object.keys(tagsOver || {}).forEach(i => { R.containers[+i].change = tagsOver[i]; }); return Object.assign(R, more || {}); };
['attack', 'seamless'].forEach(chg => {
    const R0 = edged(chg, { fadeIn: 0, fadeInFrom: 'niente', fadeOut: 0, fadeOutTo: 'niente', exit: 'together' }); R0.containers.forEach(c => { c.change = chg; });
    ok(hashOf(R0).sha256 === BASE.cases[chg].sha256, 'THE GATE once more — the edges spelled out at their defaults and every box on the sequence\'s own rule: the frozen notes, ' + chg);
});
const EPS3 = 0.0015, keysAt = i => Object.keys(SEQ.keyChord(CHORDS[i]));
// one box flipped to `attack` inside a seamless row (box 3, at 42 s): everyone together AT its line, a breath before it, and seamless again after
const LA = SEQ.generate(edged('seamless', null, { 2: 'attack' }), ctx), chLA = chains(LA), b2 = LA.bounds[2], b3 = LA.bounds[3];
ok(keysAt(2).every(k => chLA[k].some(n => n.start === b2)) && !held(LA).some(n => n.start < b2 - EPS && n.end > b2 + EPS) && keysAt(1).filter(k => keysAt(2).includes(k)).every(k => { const before = chLA[k].filter(n => n.end <= b2 + EPS && n.kind !== 'fixed').pop(); return before && before.end <= b2 - SEQ.NUMBERS.MIN_GAP_S + EPS3; }),
    'one box flipped to `attack` in a seamless row: every player of chord 3 starts AT its line (' + b2 + ' s), nothing sounds across it, and those who were playing land a breath before it');
ok(LA.notes.some(n => n.flags.includes('ACROSS') && n.start < LA.bounds[1] && n.end > LA.bounds[1]) && LA.notes.some(n => n.container === 2 && n.flags.includes('ACROSS') && n.end > b3),
    '… and "back into the separated": the line BEFORE it (box 1 → 2) and the line AFTER it (box 3 → 4, at ' + b3 + ' s) are both crossed seamlessly');
ok(j(LA.notes.filter(n => n.end <= LA.bounds[1] - 9)) === j(Sm.notes.filter(n => n.end <= Sm.bounds[1] - 9)) && LA.changes.join(' ') === 'seamless seamless attack seamless seamless seamless', 'the flip is local: the opening of the row is the all-seamless deal\'s, note for note · the tags as dealt: ' + LA.changes.join(' '));
// box 1 flipped: START TOGETHER, THEN SEAMLESS
const ST = SEQ.generate(edged('seamless', null, { 0: 'attack' }), ctx), chST = chains(ST);
ok(keysAt(0).every(k => chST[k][0].start === T0) && ST.notes.filter(n => n.flags.includes('ACROSS')).length > 10 && new Set(keysAt(0).map(k => (chST[k].find(n => n.start > T0) || {}).start)).size >= 6,
    'START TOGETHER, THEN SEAMLESS = box 1 flipped to `attack`: all ' + keysAt(0).length + ' enter at ' + T0 + ' s, the re-breaths are spread, and ' + ST.notes.filter(n => n.flags.includes('ACROSS')).length + ' notes cross lines seamlessly after');
// the ending: one by one
const lastEnds = G => keysAt(5).map(k => { const c = chains(G)[k].filter(n => n.kind !== 'fixed'); return c[c.length - 1].end; });
['attack', 'seamless'].forEach(chg => {
    const X = SEQ.generate(edged(chg, { exit: 'one by one' }), ctx), ends = lastEnds(X);
    ok(new Set(ends).size === ends.length && Math.max.apply(null, ends) === X.end && Math.min.apply(null, ends) > X.end - 8 - EPS && !held(X).some(n => n.flags.includes('RUNT')) && X.notes.every(n => n.kind === 'fixed' || n.end <= X.end + EPS),
        'exit ONE BY ONE, ' + chg + ': every player finishes a last breath of their own — the ends ' + ends.map(e => (e - X.end).toFixed(2)).join(' ') + ' s (spread over one breath, the latest ON the line, no runt, none past it)');
});
ok(lastEnds(SEQ.generate(edged('seamless', { exit: 'together' }), ctx)).every(e => Math.abs(e - Sm.end) < EPS3), 'exit TOGETHER is the landing it always was');
// the fades to and from NIENTE follow the shape
const FT = SEQ.generate(edged('seamless', { fadeIn: 6, fadeOut: 5 }, { 0: 'attack' }), ctx);
const inWin = FT.notes.filter(n => n.fade && n.fade.to === 1), outWin = FT.notes.filter(n => n.fade && n.fade.to === 0);
ok(inWin.length >= 8 && inWin.every(n => n.fade.start === T0 && n.fade.end === T0 + 6 && n.fade.from === 0 && n.start < T0 + 6) && held(FT).filter(n => n.start < T0 + 6 - EPS).every(n => n.fade) && outWin.length >= 8 && outWin.every(n => n.fade.start === FT.end - 5 && n.fade.end === FT.end && n.fade.from === 1) && held(FT).filter(n => n.start >= T0 + 6 && n.end <= FT.end - 5).every(n => !n.fade),
    'fades from and to NIENTE, entries and ends TOGETHER: ONE window each — ' + inWin.length + ' notes carry ' + T0 + ' → ' + (T0 + 6) + ' s (0 → 1), ' + outWin.length + ' carry ' + (FT.end - 5) + ' → ' + FT.end + ' s (1 → 0), and nothing between carries a fade');
const FS = SEQ.generate(edged('seamless', { fadeIn: 6, fadeOut: 5, exit: 'one by one' }), ctx), chFS = chains(FS);
ok(keysAt(0).every(k => { const f = chFS[k][0].fade; return f && f.start === chFS[k][0].start && Math.abs(f.end - f.start - 6) < EPS3; }) && new Set(keysAt(0).map(k => chFS[k][0].fade.start)).size === keysAt(0).length
    && keysAt(5).every(k => { const c = chFS[k].filter(n => n.kind !== 'fixed'), l = c[c.length - 1]; return l.fade && l.fade.to === 0 && Math.abs(l.fade.end - l.end) < EPS3; }) && new Set(lastEnds(FS)).size === keysAt(5).length,
    'THE FADE FOLLOWS THE SHAPE — staggered entries, ends one by one: each player fades in from their OWN entry (' + keysAt(0).map(k => (chFS[k][0].fade.start - T0).toFixed(1)).join(' ') + ') and out to their OWN ending (' + lastEnds(FS).map(e => (e - FS.end).toFixed(1)).join(' ') + ')');
// the fades to and from a WRITTEN DYNAMIC are ramps in the level, and the far end may be louder than the box
const FD = SEQ.generate(edged('seamless', { fadeIn: 6, fadeInFrom: 'ff', fadeOut: 5, fadeOutTo: 'pp' }, { 0: 'attack' }), ctx), firstFD = keysAt(0).map(k => chains(FD)[k][0]);
ok(firstFD.every(n => !n.fade && n.ramp && Math.abs(n.levels[0][1] - hOf('ff')) < 1e-4 && Math.abs(n.level - hOf('ff')) < 1e-4) && firstFD.every(n => { const p = n.levels.find(q => Math.abs(n.start + q[0] - (T0 + 6)) < 0.01); return !p || Math.abs(p[1] - 0.5) < 1e-4; }) && !over(FD).length
    && keysAt(5).every(k => { const c = chains(FD)[k].filter(n => n.kind !== 'fixed'), l = c[c.length - 1]; return l.ramp && !l.fade && Math.abs(l.levels[l.levels.length - 1][1] - hOf('pp')) < 1e-4; }),
    'fades from `ff` and to `pp` are RAMPS IN THE LEVEL (no fader multiplier): the entries start at ' + hOf('ff').toFixed(3) + ' and settle to the box\'s 0.5 by ' + (T0 + 6) + ' s, the last breaths arrive at ' + hOf('pp').toFixed(3) + ' — and the ceiling was read at the LOUD far end (nothing over)');
const FW = SEQ.generate(Object.assign(wavesRow('seamless', ['waves']), { edges: { fadeIn: 8, fadeInFrom: 'ppp', fadeOut: 0, fadeOutTo: 'niente', exit: 'together' } }), ctx);
ok(held(FW).filter(n => n.start < T0 + 0.01).every(n => n.waves && n.ramp && Math.abs(n.levels[0][1] - hOf('ppp')) < 1e-4) && !over(FW).length && held(FW).filter(n => n.start > T0 + 12).every(n => !n.ramp),   // staggered entries: the last player's window runs to 3.5 + 8 s
    'a fade from `ppp` over a WAVES box: the waves grow out of ppp (' + hOf('ppp').toFixed(3) + ') — ramped inside the window, the plain wave after it');
const PF = RP('attack'); PF.edges = { fadeIn: 6, fadeInFrom: 'niente', fadeOut: 0, fadeOutTo: 'niente', exit: 'together' };
const pfS = SEQ.generate(PF, ctx).notes.filter(n => n.lane === 4 && n.start < T0 + 6);
ok(pfS.length >= 1 && pfS.every(n => !n.fade && n.level <= 0.5 * ((n.start - T0) / 6) + 1e-4), 'a strike cannot ramp: inside a niente fade the percussion takes the fade\'s WEIGHT at its strike (' + pfS.map(n => (n.start - T0).toFixed(1) + ' s → ' + n.level.toFixed(2)).join(' · ') + '), and carries no fader move');
ok(j(SEQ.generate(edged('seamless', { fadeIn: 6, fadeOut: 5, exit: 'one by one' }, { 2: 'attack' }), ctx)) === j(SEQ.generate(edged('seamless', { fadeIn: 6, fadeOut: 5, exit: 'one by one' }, { 2: 'attack' }), ctx)), 'with everything set — a flipped box, both fades, ends one by one — the same seed gives the same notes');
const eBad = (e, tg, re, what) => refuses(edged('attack', e, tg), re, what);
eBad({ exit: 'fade' }, null, /edges\.exit must be/, 'an unknown exit');
eBad({ fadeIn: -1 }, null, /edges\.fadeIn must be 0 s or more/, 'a fade of −1 s');
eBad({ fadeIn: 4, fadeInFrom: 'loud' }, null, /edges\.fadeInFrom must be "niente" or a dynamic/, 'a fade from a dynamic that is not on the ladder');
eBad(null, { 1: 'crossfade' }, /container 2: change must be/, 'a box with an unknown change rule');


// ---------------------------------------------------------------- 16 · a RANGE of its own, box by box (PLAN 1d.12)
// The stream is dealt ONCE and is a 0 … 1 swell height; a box only changes the low–high it is READ through. So a range may not
// move a single onset or length — and where two ranges meet the level GLIDES across the line over 0.5 s, never a step.
const rngRow = (change, dynsW, ranges, wOver) => {
    const R = wavesRow(change, dynsW, wOver || {});
    Object.keys(ranges || {}).forEach(k => { R.containers[+k].range = ranges[k]; });
    return R;
};
const NO_R = SEQ.generate(rngRow('seamless', ['waves']), ctx);
const ONE_R = SEQ.generate(rngRow('seamless', ['waves'], { 2: { low: 'ppp', high: 'p' } }), ctx);
const shape = G => j(G.notes.map(n => [n.player, n.start, n.dur, n.container]));
// A range whose TOP is the sequence's own leaves even the lengths alone: the ceiling is read at the loudest the stream can
// reach, so only a change of `high` may move a breath — and when it does, that is the palette working, not the deal being re-run.
const SAME_TOP = SEQ.generate(rngRow('seamless', ['waves'], { 2: { low: 'ppp', high: 'mf' } }), ctx);
ok(shape(SAME_TOP) === shape(NO_R) && j(SAME_TOP.streams) === j(NO_R.streams) && j(SAME_TOP.notes) !== j(NO_R.notes),
   'a box range moves NO onset and NO length while its top is unchanged, and no stream ever — the deal is untouched, only the map at the end of it (' + NO_R.notes.length + ' notes)');
ok(j(ONE_R.streams) === j(NO_R.streams),
   'and a range that lowers the top leaves the streams alone too — the breaths may lengthen, because a quieter note has a longer ceiling');
// wholly inside box 3, clear of the 0.5 s glide at either line — a breath that crosses a line reads both ranges, by design
const inBox2 = G => held(G).filter(n => n.container === 2 && n.waves && n.start - T0 > G.bounds[2] - T0 + 0.26 && n.end - T0 < G.bounds[3] - T0 - 0.26);
const LOWR = hOf('ppp'), HIR = hOf('p');
ok(inBox2(ONE_R).length > 0 && inBox2(ONE_R).every(n => n.levels.every(p => p[1] >= LOWR - LEPS && p[1] <= HIR + LEPS)) &&
   inBox2(NO_R).some(n => n.levels.some(p => p[1] > HIR + LEPS)),
   'box 3 reads the same waves through ppp–p: ' + inBox2(ONE_R).length + ' notes all inside ' + LOWR.toFixed(3) + ' … ' + HIR.toFixed(3) + ', where the sequence\'s pp–mf took them higher');
ok(held(ONE_R).filter(n => n.container === 0).every(n => n.levels.every(p => p[1] >= LO - LEPS && p[1] <= HI + LEPS)),
   'and every other box still reads the sequence\'s own range');
// EQUAL DEPTHS, DIFFERENT HEIGHTS — the reason 1d.10 came first, now per box
const DEEP = SEQ.generate(rngRow('attack', ['waves'], { 0: { low: 'ppp', high: 'mp' }, 1: { low: 'pp', high: 'mf' } }), ctx);
const peakIn = (G, ci) => Math.max.apply(null, held(G).filter(n => n.container === ci && n.waves).map(n => n.level));
ok(Math.abs(peakIn(DEEP, 0) - hOf('mp')) < 0.02 && Math.abs(peakIn(DEEP, 1) - hOf('mf')) < 0.02 && peakIn(DEEP, 0) < peakIn(DEEP, 1),
   'two ranges of EQUAL DEPTH sit at different heights: box 1 peaks at ' + peakIn(DEEP, 0).toFixed(3) + ' (mp), box 2 at ' + peakIn(DEEP, 1).toFixed(3) + ' (mf)');
// THE GLIDE — a note crossing the line moves through the middle, and no breakpoint jumps by the whole difference
const GL = SEQ.generate(rngRow('seamless', ['waves'], { 0: { low: 'ppp', high: 'mp' }, 1: { low: 'pp', high: 'mf' } }), ctx);
const crossers = held(GL).filter(n => n.waves && n.start - T0 < GL.bounds[1] - T0 - 0.26 && n.end - T0 > GL.bounds[1] - T0 + 0.26);
const worstStep = ns => Math.max.apply(null, ns.map(n => Math.max.apply(null, n.levels.map((p, i) => i ? Math.abs(p[1] - n.levels[i - 1][1]) / Math.max(1e-6, p[0] - n.levels[i - 1][0]) : 0))));
ok(crossers.length > 0 && crossers.every(n => n.levels.filter(p => { const x = n.start - T0 + p[0], b = GL.bounds[1] - T0; return x > b - 0.26 && x < b + 0.26; }).length >= 2),
   crossers.length + ' notes cross the line between two ranges, and each carries breakpoints INSIDE the 0.5 s glide — the map bends, it does not step');
ok(isFinite(worstStep(crossers)) && worstStep(crossers) < 1.5,
   'no breakpoint jumps: the steepest move across those notes is ' + worstStep(crossers).toFixed(3) + ' of the ladder a second');
// a range on a STRAIGHT box is kept and ignored
const STR = SEQ.generate(rngRow('seamless', ['waves', 'mf'], { 1: { low: 'ppp', high: 'p' } }), ctx);
const STR0 = SEQ.generate(rngRow('seamless', ['waves', 'mf']), ctx);
ok(j(STR.notes) === j(STR0.notes), 'a range on a STRAIGHT box changes nothing — it is kept in the recipe so that flipping the box to `waves` gives it back');
// THE GATE, once more: no box carries a range and the notes are the frozen ones
['attack', 'seamless'].forEach(chg => {
    const R0 = recipe(chg); R0.waves = Object.assign({}, WV);
    R0.containers.forEach(c => { if (c.range != null) throw new Error('the case should carry no range'); });
    ok(hashOf(R0).sha256 === BASE.cases[chg].sha256, 'THE GATE, after the stream became a height: no range anywhere = the frozen notes, ' + chg);
});
// refusals
const rBad = (rng, re, what) => { const R = rngRow('seamless', ['waves'], { 1: rng }); const m = SEQ.validate(R, ctx); ok(m.some(x => re.test(x)), 'refused — ' + what + ': "' + (m.find(x => re.test(x)) || m[0] || 'NOTHING WAS REFUSED') + '"'); };
rBad({ low: 'pp', high: 'quiet' }, /range\.low and range\.high must be on the ladder/, 'a range end that is not a dynamic');
rBad({ low: 'ff', high: 'pp' }, /range\.low \(ff\) must be below range\.high/, 'a range upside down');
rBad('pp-mf', /range must be \{ low, high \}/, 'a range that is not two dynamics');


// ---------------------------------------------------------------- 17 · the waves by PRESET (PLAN 1d.13)
// The dials became a behaviour: lengths between `shortest` and `longest` bent by `tilt`, a named SHAPE, and a HOLD at the top.
// An old recipe — a typed pool and a `peak` — still takes the 1d.7 path, and `shape` is what tells them apart.
const PRE = { shortest: 8, longest: 20, tilt: 0, shape: 'golden', hold: 0.2, density: 0.6, low: 'pp', high: 'mf', seed: 1 };
const preRow = (over) => wavesRow('seamless', ['waves'], Object.assign({}, PRE, over || {}));
// every slot of a stream, read back off its points: { len, swell, rise, hold }
const slotsIn = (G, k) => {
    const p = G.streams[k].points, out = [];
    for (let i = 0; i < p.length - 1; i++) {
        if (p[i][1] !== 0) continue;
        let j = i + 1; const tops = [];
        while (j < p.length && p[j][1] !== 0) { tops.push(p[j][0]); j++; }
        if (j >= p.length) break;
        const len = p[j][0] - p[i][0];
        out.push({ len: len, swell: tops.length > 0, up: tops.length ? tops[0] - p[i][0] : null, hold: tops.length > 1 ? tops[1] - tops[0] : 0 });
        i = j - 1;
    }
    return out;
};
const allSlots = G => Object.keys(G.streams).reduce((a, k) => a.concat(slotsIn(G, k)), []);
const P1 = SEQ.generate(preRow(), ctx), S1 = allSlots(P1);
ok(S1.length > 20 && S1.every(s => s.len >= PRE.shortest - 0.002 && s.len <= PRE.longest + 0.002),
   S1.length + ' slots across the eight players, every one between `shortest` and `longest` (' + PRE.shortest + ' … ' + PRE.longest + ' s)');
const mean = ss => ss.reduce((a, s) => a + s.len, 0) / ss.length;
const MSHORT = mean(allSlots(SEQ.generate(preRow({ tilt: -1 }), ctx))), MEVEN = mean(S1), MLONG = mean(allSlots(SEQ.generate(preRow({ tilt: 1 }), ctx)));
ok(MSHORT < MEVEN - 1 && MEVEN < MLONG - 1,
   'the tilt moves the mean and nothing else: −1 → ' + MSHORT.toFixed(2) + ' s · 0 → ' + MEVEN.toFixed(2) + ' s · +1 → ' + MLONG.toFixed(2) + ' s');
// the named shapes: the RISE as a share of the MOVING time (the length less the hold)
Object.keys(SEQ.SHAPES).forEach(sh => {
    const G = SEQ.generate(preRow({ shape: sh }), ctx), sw = allSlots(G).filter(s => s.swell);
    const worst = Math.max.apply(null, sw.map(s => Math.abs(s.up / (s.len - s.hold) - SEQ.SHAPES[sh])));
    ok(sw.length > 5 && worst < 0.002, sh + ': every swell rises in ' + (SEQ.SHAPES[sh] * 100).toFixed(1) + '% of its moving time (' + sw.length + ' swells, worst ' + worst.toFixed(4) + ') — the shape is exact, no wobble');
});
// the hold, as a share of the swell's whole length
[0, 0.2, 0.5].forEach(h => {
    const sw = allSlots(SEQ.generate(preRow({ hold: h }), ctx)).filter(s => s.swell);
    const worst = Math.max.apply(null, sw.map(s => Math.abs(s.hold / s.len - h)));
    ok(sw.length > 5 && worst < 0.002, 'hold ' + h + ': every swell sits that share of its own length at the top (worst ' + worst.toFixed(4) + ')');
});
// density in the words the drawer offers, measured over a long deal
[['constant', 1], ['breathing', 0.6], ['rare', 0.15]].forEach(([word, d]) => {
    const ss = allSlots(SEQ.generate(preRow({ density: d }), ctx)), got = ss.filter(s => s.swell).length / ss.length;
    ok(ss.length > 20 && Math.abs(got - d) < 0.18, word + ' (' + d + '): ' + (got * 100).toFixed(0) + '% of ' + ss.length + ' slots are swells');
});
// the five built-in presets each give their own behaviour, and none is refused
const BUILTIN = { breathing: [8, 20, 'golden', 0.2, 0.6], tides: [20, 45, 'even', 0.1, 1], ripples: [3, 8, 'even', 0, 0.8], surges: [6, 14, 'surge', 0.1, 0.35], blooms: [12, 30, 'bloom', 0.35, 0.15] };
Object.keys(BUILTIN).forEach(nm => {
    const [lo, hi, sh, hold, den] = BUILTIN[nm];
    const R = preRow({ shortest: lo, longest: hi, shape: sh, hold: hold, density: den });
    const m = SEQ.validate(R, ctx), G = SEQ.generate(R, ctx), ss = allSlots(G), sw = ss.filter(s => s.swell);
    ok(!m.length && ss.every(s => s.len >= lo - 0.002 && s.len <= hi + 0.002) && (!sw.length || Math.abs(sw[0].up / (sw[0].len - sw[0].hold) - SEQ.SHAPES[sh]) < 0.002),
       'preset `' + nm + '` — ' + lo + '–' + hi + ' s · ' + sh + ' · hold ' + hold + ' · density ' + den + ': ' + ss.length + ' slots, ' + sw.length + ' swells, all in range');
});
// AN OLD RECIPE IS UNCHANGED — the pool and the `peak`, untouched by any of this
const OLD = SEQ.generate(wavesRow('seamless', ['waves']), ctx);
ok(j(OLD.notes) === j(WS.notes) && j(OLD.streams) === j(WS.streams),
   'an old waves line — a typed pool and a `peak`, no `shape` — gives the notes it always gave, to the byte');
const oldSlots = allSlots(OLD);
ok(oldSlots.every(s => WV.lengths.values.indexOf(r3(s.len)) >= 0) && oldSlots.filter(s => s.swell).every(s => s.hold === 0),
   'and it still draws its lengths from the pool ' + WV.lengths.values.join(' ') + ' s, with no hold at the top');
// refusals
const wvBad = (over, re, what) => { const m = SEQ.validate(preRow(over), ctx); ok(m.some(x => re.test(x)), 'refused — ' + what + ': "' + (m.find(x => re.test(x)) || m[0] || 'NOTHING WAS REFUSED') + '"'); };
wvBad({ shape: 'swoop' }, /waves\.shape must be one of/, 'a shape that is not one of the five');
wvBad({ shortest: 20, longest: 8 }, /waves\.shortest .* must not be longer than/, 'shortest longer than longest');
wvBad({ hold: 2 }, /waves\.hold is a share of the swell/, 'a hold of 2');
wvBad({ tilt: -3 }, /waves\.tilt runs/, 'a tilt of −3');

console.log('\n' + (fail ? 'SEQUENCE RED: ' + fail + ' failed' : 'SEQUENCE GREEN: ' + pass + ' checks'));
process.exit(fail ? 1 : 0);
