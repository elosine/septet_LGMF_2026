// check_cresc_deck.js — PLAN 1m step 4: the pure parts of the C key and the harmony bar.
// Run: node score/tools/check_cresc_deck.js
const C = require('../public/cresc.js');
let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? '  ok   ' : '  FAIL ') + name + (detail ? '  — ' + detail : '')); if (!cond) fail++; };
const H = t => console.log('\n' + t);

const SET = [41, 48, 53, 57, 60, 64, 67];   // F2 … G4, seven notes

// ---------------------------------------------------------------- 1 · the deck deals, exhausts and starts a new lap
H('1 · the deck: in turn — deals every note once, then a new lap');
{
    let st = { order: 'turn', seed: 1, drawn: 0, lap: 0 };
    const got = [], lefts = [], laps = [];
    for (let i = 0; i < 10; i++) { const d = C.deckNext(SET, st); st = d.state; got.push(d.pitch); lefts.push(d.left); laps.push(d.lap); }
    ok('the first lap is the sonority in its own order', JSON.stringify(got.slice(0, 7)) === JSON.stringify(SET), got.slice(0, 7).join(' '));
    ok('the count runs 6 … 0', JSON.stringify(lefts.slice(0, 7)) === JSON.stringify([6, 5, 4, 3, 2, 1, 0]), lefts.slice(0, 7).join(' '));
    ok('the eighth draw starts lap 2 with the first note again', got[7] === SET[0] && laps[7] === 1, 'got ' + got[7] + ' lap ' + laps[7]);
    ok('the eighth draw is flagged as a new lap', C.deckNext(SET, { order: 'turn', seed: 1, drawn: 7, lap: 0 }).reshuffled === true);
}

H('2 · the deck: shuffled — every note once a lap, a different order each lap, the same order from the same seed');
{
    const lap = (seed, l) => {
        let st = { order: 'shuffled', seed, drawn: l * SET.length, lap: l }, out = [];
        // deal a whole lap from a fresh state so the lap boundary is exercised
        st = { order: 'shuffled', seed, drawn: SET.length, lap: l - 1 };
        for (let i = 0; i < SET.length; i++) { const d = C.deckNext(SET, st); st = d.state; out.push(d.pitch); }
        return out;
    };
    const a1 = lap(1, 1), a2 = lap(1, 2), b1 = lap(1, 1), c1 = lap(9, 1);
    ok('a lap holds every note exactly once', JSON.stringify(a1.slice().sort((x, y) => x - y)) === JSON.stringify(SET), a1.join(' '));
    ok('lap 2 is a different order from lap 1', JSON.stringify(a1) !== JSON.stringify(a2), a1.join(' ') + '  vs  ' + a2.join(' '));
    ok('the same seed repeats the same lap exactly', JSON.stringify(a1) === JSON.stringify(b1));
    ok('another seed gives another order', JSON.stringify(a1) !== JSON.stringify(c1), c1.join(' '));
    ok('the order is not the sonority order', JSON.stringify(a1) !== JSON.stringify(SET));
}

H('3 · the deck: random — never runs out, repeats exactly from the same seed');
{
    const run = seed => { let st = { order: 'random', seed, drawn: 0, lap: 0 }, out = []; for (let i = 0; i < 12; i++) { const d = C.deckNext(SET, st); st = d.state; out.push(d.pitch); } return out; };
    const r1 = run(3), r2 = run(3), r3 = run(4);
    ok('the same seed repeats the sequence', JSON.stringify(r1) === JSON.stringify(r2), r1.join(' '));
    ok('another seed differs', JSON.stringify(r1) !== JSON.stringify(r3));
    ok('every drawn pitch is in the sonority', r1.every(p => SET.includes(p)));
    ok('12 draws from 7 notes still deal (no exhaustion)', r1.length === 12);
    ok('what is left reads as random, not a count', C.deckLeft(SET, { order: 'random', drawn: 5 }) === null);
    ok('an empty sonority deals nothing', C.deckNext([], { order: 'turn' }) === null);
}

// ---------------------------------------------------------------- 4 · the fold into a player's range (1k's rule)
H('4 · the fold: by octave into the player\'s range, and null when it does not reach');
{
    const f1 = C.foldInto(41, 60, 96);          // F2 into a high range
    ok('a low pitch folds up by whole octaves', f1 && f1.pitch === 65 && f1.fold === 2, f1 ? f1.pitch + ' (+' + f1.fold + ')' : 'null');
    const f2 = C.foldInto(100, 36, 72);
    ok('a high pitch folds down', f2 && f2.pitch === 64 && f2.fold === -3, f2 ? f2.pitch + ' (' + f2.fold + ')' : 'null');
    const f3 = C.foldInto(60, 55, 75);
    ok('a pitch already in range does not move', f3 && f3.pitch === 60 && f3.fold === 0);
    const f4 = C.foldInto(61, 60, 60);          // a one-note range that no octave of 61 reaches
    ok('a pitch no octave reaches gives null', f4 === null);
}

// ---------------------------------------------------------------- 5 · the end rule through the C key's own path
H('5 · the end rule, as the C key uses it');
{
    const notes = [{ startSeconds: 10 }, { startSeconds: 14 }, { startSeconds: 40 }];
    const e1 = C.endFor(10, notes, {});
    ok('to 0.17 s before the next note on that player', e1.how === 'toNextNote' && Math.abs(e1.end - 13.83) < 1e-6, e1.end + ' s');
    const e2 = C.endFor(40, notes, {});
    ok('no later note: the 5 s fallback', e2.how === 'fallback' && Math.abs(e2.end - 45) < 1e-6, e2.end + ' s');
    const e3 = C.endFor(13.9, notes, {});
    ok('a crowded start says noRoom, and makes nothing', e3.how === 'noRoom' && C.make(13.9, 60, { lane: 0 }, notes, {}) === null);
    const e4 = C.endFor(10, notes, { durS: 2.5 });
    ok('a typed duration overrides and says so', e4.how === 'manual' && Math.abs(e4.end - 12.5) < 1e-6);
}

// ---------------------------------------------------------------- 6 · the object the C key makes
H('6 · the crescendo the C key makes');
{
    const wc = C.make(10, 60, { lane: 3, tech: 'senza_vel', label: 'vn1' }, [{ startSeconds: 14 }], {});
    ok('it is a plain waveCurve with a sounding note', wc.type === 'waveCurve' && wc.sonifyNote === 60);
    ok('it wears the morph orange, filled and transparent', wc.color === '#C2410C' && wc.fillMode === 'bottom' && wc.opacity === 0.45);
    ok('the standard shape: surge 5x', wc.properties.cresc.shape === 'surge' && wc.properties.cresc.ratio === 5);
    ok('the full dynamic range ppp to fff', wc.nodes[0].y === 0 && wc.nodes[1].y === 10 && C.dynName(0) === 'ppp' && C.dynName(10) === 'fff');
    ok('secco is on by default', wc.properties.cresc.secco === true);
    ok('isCresc knows it', C.isCresc(wc) === true);
    ok('a plain note is not a crescendo', C.isCresc({ type: 'waveCurve', sonifyNote: 60, properties: {} }) === false);
    ok('the curve rises back-loaded (half height comes late)', C.heightAt(wc, 0.5) < 3.5 && C.thresholdOf(wc) > 0.6, 'half at ' + C.thresholdOf(wc));
    const wc2 = C.make(10, 60, { lane: 3 }, [{ startSeconds: 14 }], { dynLo: C.dynHeight('mp'), dynHi: C.dynHeight('ff') });
    ok('the card\'s range reaches the object', C.dynName(wc2.nodes[0].y) === 'mp' && C.dynName(wc2.nodes[1].y) === 'ff', wc2.performanceNotes);
}

console.log('\n' + (fail ? fail + ' FAILED' : 'all checks passed'));
process.exit(fail ? 1 : 0);
