// check_fill.js — PLAN 1n: the pure parts, checked against HIS OWN texture wherever a number exists for it.
// Run: node score/tools/check_fill.js
const path = require('path');
const F = require('../public/fill.js');
const Sp = require('../public/spacing.js');
const fs = require('fs');

let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? '  ok   ' : '  FAIL ') + name + (detail ? '  — ' + detail : '')); if (!cond) fail++; };
const H = t => console.log('\n' + t);

// ---------------------------------------------------------------- his own pattern
const SCORE = path.join(__dirname, '..', '..', 'scores', 'piano-harmonics-test.json');
const GROUP = 'grp-strike-40-1357';
const score = JSON.parse(fs.readFileSync(SCORE, 'utf8'));
const A = F.attacksOf(score.objects, GROUP);
const EV = Sp.eventsOf(score.objects.filter(o => o.type === 'waveCurve' && o.sonifyNote != null && o.layer < 7));
const P = [0, 1, 2, 3, 4, 5, 6];

H('1 · the pattern is read from the SCORE, not the database');
ok('his accelerating run is 46 attacks', A.length === 46, A.length + ' attacks');
ok('exactly one player per attack', A.every((a, i) => i === 0 || a.t - A[i - 1].t > 0.03), 'no two within 30 ms');
ok('it runs 135.78 → 148.78 s', Math.abs(A[0].t - 135.78) < 0.01 && Math.abs(A[A.length - 1].t - 148.78) < 0.01,
   A[0].t.toFixed(2) + ' → ' + A[A.length - 1].t.toFixed(2));
ok('the accents are short (his "though these are short")', A.every(a => a.dur < 0.15), 'median ' +
   A.map(a => a.dur).sort((x, y) => x - y)[Math.floor(A.length / 2)].toFixed(3) + ' s');

// ---------------------------------------------------------------- the invariants, on every pass
function invariants(label, res, O) {
    const L = res.longs;
    const byAttack = {}; A.forEach(a => byAttack[a.id] = a);
    ok(label + ': never the player striking that attack',
        L.every(x => { const a = byAttack[x.attackId]; return !a || a.lane !== x.lane; }));
    ok(label + ': no two longs overlap on one player', (() => {
        const by = {}; L.forEach(x => (by[x.lane] = by[x.lane] || []).push(x));
        return Object.values(by).every(list => list.sort((p, q) => p.t0 - q.t0)
            .every((x, i) => i === 0 || x.t0 >= list[i - 1].t1 - 1e-9));
    })());
    ok(label + ': every long clears its own floor', L.every(x => x.len >= F.floorOf(x.kind, O || {}) - 1e-9),
        'shortest ' + (L.length ? Math.min.apply(null, L.map(x => x.len)).toFixed(2) : '-') + ' s');
    ok(label + ': every abort carries a reason', res.aborts.every(x => !!x.why),
        res.aborts.length + ' aborts: ' + [...new Set(res.aborts.map(x => x.why))].join(', '));
    ok(label + ': made + aborted = every attack', L.length + res.aborts.length === A.length,
        L.length + ' + ' + res.aborts.length + ' = ' + A.length);
    ok(label + ': no long runs through one of its own player\'s attacks', L.every(x =>
        !A.some(a => a.lane === x.lane && a.t > x.t0 + 1e-9 && a.t < x.t1 - 1e-9)));
}

H('2 · LAUNCH — the accent kicks it off, the room ends it');
const launch = F.deal(A, EV, P, { anchor: 'launch', kind: 'cresc', seed: 1 });
const sl = F.summarize(launch, P);
console.log('     ' + sl.text);
invariants('launch', launch, {});
ok('every long starts exactly at its attack', launch.longs.every(x => {
    const a = A.find(y => y.id === x.attackId); return a && Math.abs(a.t - x.t0) < 1e-6; }));
ok('every long names the attack that launched it', launch.longs.every(x => x.launchedBy === x.attackId && x.cutBy === null));

H('3 · CUT — the accent ends it, at the END of the accent note');
const cut = F.deal(A, EV, P, { anchor: 'cut', kind: 'cresc', seed: 1 });
const sc = F.summarize(cut, P);
console.log('     ' + sc.text);
invariants('cut', cut, {});
ok('every long ends at the end of its accent note', cut.longs.every(x => {
    const a = A.find(y => y.id === x.attackId); return a && Math.abs((a.t + a.dur) - x.t1) < 1e-3; }));
ok('every long names the attack that cut it', cut.longs.every(x => x.cutBy === x.attackId && x.launchedBy === null));
ok('a cut long OVERLAPS its accent (two players, so it is free)', cut.longs.every(x => {
    const a = A.find(y => y.id === x.attackId); return a && x.t0 < a.t && x.t1 > a.t; }));

H('4 · the two directions are mirror images on his own run');
ok('similar density', Math.abs(launch.longs.length - cut.longs.length) <= 4,
   'launch ' + launch.longs.length + ' · cut ' + cut.longs.length);
ok('similar median length', Math.abs(sl.median - sc.median) < 0.25, sl.median.toFixed(2) + ' s vs ' + sc.median.toFixed(2) + ' s');
ok('both spread over the whole ensemble', sl.perPlayer.every(n => n >= 3) && sc.perPlayer.every(n => n >= 3),
   sl.perPlayer.join('/') + '  and  ' + sc.perPlayer.join('/'));

H('5 · reaching back before the pattern is the SHAPE of cut mode (§293)');
{
    const before = cut.longs.filter(x => x.t0 < A[0].t - 1e-9);
    ok('some cut longs begin before the first attack', before.length > 0, before.length + ' of ' + cut.longs.length);
    ok('and they are held by what those players were already playing, not by nothing',
        before.every(x => A[0].t - x.t0 < 1.5), 'the earliest is ' + (A[0].t - Math.min.apply(null, before.map(x => x.t0))).toFixed(2) + ' s before');
    const inside = F.deal(A, EV, P, { anchor: 'cut', kind: 'cresc', seed: 1, keepInside: true });
    ok('keepInside clips them to the pattern', inside.longs.every(x => x.t0 >= A[0].t - 1e-9),
        inside.longs.length + ' longs, none before ' + A[0].t.toFixed(2) + ' s');
}

H('6 · the seed');
{
    const a1 = F.deal(A, EV, P, { anchor: 'launch', seed: 7 });
    const a2 = F.deal(A, EV, P, { anchor: 'launch', seed: 7 });
    ok('the same seed repeats a pass exactly', JSON.stringify(a1.longs) === JSON.stringify(a2.longs));
    const b = F.deal(A, EV, P, { anchor: 'launch', seed: 7, kindRule: 'proportion', kindB: 'trill' });
    const c = F.deal(A, EV, P, { anchor: 'launch', seed: 8, kindRule: 'proportion', kindB: 'trill' });
    ok('a mixed pass repeats from its seed', JSON.stringify(b.longs) === JSON.stringify(F.deal(A, EV, P, { anchor: 'launch', seed: 7, kindRule: 'proportion', kindB: 'trill' }).longs));
    ok('another seed gives another mix', JSON.stringify(b.longs) !== JSON.stringify(c.longs));
}

H('7 · the kind');
{
    const one = F.deal(A, EV, P, { anchor: 'launch', kind: 'cresc', seed: 1 });
    ok('one kind per pass is the default', Object.keys(F.summarize(one, P).byKind).join() === 'cresc');
    const mix = F.deal(A, EV, P, { anchor: 'launch', kindRule: 'proportion', kind: 'cresc', kindB: 'trill', kindMix: 0.4, seed: 3 });
    const bk = F.summarize(mix, P).byKind;
    ok('a proportion gives both kinds', (bk.cresc || 0) > 0 && (bk.trill || 0) > 0, JSON.stringify(bk));
    const room = F.deal(A, EV, P, { anchor: 'launch', kindRule: 'byRoom', kind: 'cresc', kindB: 'trill', roomThresholdS: 2.5, seed: 1 });
    const long = room.longs.filter(x => x.len >= 2.5), short = room.longs.filter(x => x.len < 2.5);
    ok('by room: the long ones are crescendos', long.length > 0 && long.every(x => x.kind === 'cresc'), long.length + ' over 2.5 s');
    ok('by room: the short ones are trills', short.length > 0 && short.every(x => x.kind === 'trill'), short.length + ' under 2.5 s');
    ok('a trill\'s floor is higher than a crescendo\'s', F.floorOf('trill', {}) > F.floorOf('cresc', {}),
       F.floorOf('trill', {}) + ' s vs ' + F.floorOf('cresc', {}) + ' s');
}

H('8 · BOTH — accent to accent, and it aborts rather than shrink');
{
    const both = F.deal(A, EV, P, { anchor: 'both', kind: 'cresc', cutAfter: 3, seed: 1 });
    const sb = F.summarize(both, P);
    console.log('     ' + sb.text);
    invariants('both', both, {});
    ok('every long names BOTH its accents', both.longs.every(x => x.launchedBy && x.cutBy && x.launchedBy !== x.cutBy));
    ok('it spans from one accent to the end of the other', both.longs.every(x => {
        const a = A.find(y => y.id === x.launchedBy), b = A.find(y => y.id === x.cutBy);
        return a && b && Math.abs(x.t0 - a.t) < 1e-6 && Math.abs(x.t1 - (b.t + b.dur)) < 1e-3; }));
    ok('the last attacks abort for want of a cutting accent',
        both.aborts.some(x => x.why === 'noCuttingAccent'), both.aborts.filter(x => x.why === 'noCuttingAccent').length + ' of them');
}

H('9 · re-pointing an anchor refuses with a reason rather than shrinking (§293)');
{
    const wc = launch.longs[5];
    const live = EV.concat(launch.longs.map(x => ({ lane: x.lane, t0: x.t0, t1: x.t1, group: '(fill)', kind: 'fill' })));
    const own = A.find(a => a.lane === wc.lane && a.t > wc.t1);
    ok('an attack on the long\'s own player is refused',
        own ? F.repoint(wc, 'cutBy', own, live, {}).ok === false : true,
        own ? F.repoint(wc, 'cutBy', own, live, {}).why : 'none to try');
    const far = A.find(a => a.lane !== wc.lane && a.t > wc.t1 + 0.5);
    const r = F.repoint(wc, 'cutBy', far, live, {});
    ok('a re-point that does not fit says why', r.ok === false ? !!r.why : true, r.ok ? 'it fitted: ' + r.long.len.toFixed(2) + ' s' : r.why);
    const near = A.filter(a => a.lane !== wc.lane && a.t > wc.t0 + 0.4 && a.t + a.dur <= wc.t1 + 1e-9).pop();
    if (near) {
        const g = F.repoint(wc, 'cutBy', near, live, {});
        ok('a re-point inside the room succeeds and re-derives the length', g.ok && g.long.len < wc.len && g.long.cutBy === near.id,
            g.ok ? wc.len.toFixed(2) + ' → ' + g.long.len.toFixed(2) + ' s' : g.why);
        ok('and it is marked pinned, so a re-generate leaves it', g.ok && g.long.pinned === true);
    }
}

H('10 · the re-entry gap, measured against his own hand (§298)');
{
    const rows = [150, 100, 50, 0].map(v => {
        const L = F.deal(A, EV, P, { anchor: 'launch', seed: 1, startRestMs: v });
        return { v, made: L.longs.length, ab: L.aborts.length };
    });
    rows.forEach(r => console.log('     ' + String(r.v + ' ms').padStart(7) + ' → ' + r.made + ' longs, ' + r.ab + ' aborted'));
    ok('the rule (150 ms) is the strictest and still fills most of the pattern', rows[0].made >= A.length * 0.8,
       rows[0].made + ' of ' + A.length);
    ok('loosening it recovers the attacks his own hand filled', rows[3].made > rows[0].made,
       '0 ms gives ' + rows[3].made + ', 150 ms gives ' + rows[0].made);
}

// ================================================================ STEP 2 · THE PITCH STRATEGIES
const FP = require('../public/fill_pitch.js');
const vm = require('vm');
const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', '..', 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const RANGES = {};
(score.tracks || []).forEach((t, i) => {
    const inst = INSTRUMENTS[t.instKey];
    if (!inst) return;
    const ord = (inst.techniques || []).find(q => q.key === inst.ordinary) || (inst.techniques || [])[0] || {};
    RANGES[i] = [ord.rangeLow != null ? ord.rangeLow : inst.rangeLow, ord.rangeHigh != null ? ord.rangeHigh : inst.rangeHigh];
});
const NM = m => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const SON = [41, 42, 44, 45, 47, 48, 50, 51, 53, 54, 56, 57, 59, 60, 62, 63, 65];   // Messiaen mode 2 from F2, his own bar's set
const base = launch.longs;

H('11 \u00b7 the ordinary voices\' ranges are read from the recipe');
ok('all seven players have a range', Object.keys(RANGES).length === 7,
   (score.tracks || []).map((t, i) => t.short + ' ' + (RANGES[i] ? NM(RANGES[i][0]) + '\u2013' + NM(RANGES[i][1]) : '?')).join(' \u00b7 '));

H('12 \u00b7 every family voices the pass, and every pitch lands in its player\'s range');
FP.FAMILIES.forEach(([f, label]) => {
    const r = FP.assign(base, A, RANGES, { family: f, seed: 1, order: 'turn', notes: SON, from: 'mode 2 from F2', intervalSt: 1, direction: 'up' });
    const inRange = r.longs.every(x => x.midi >= RANGES[x.lane][0] && x.midi <= RANGES[x.lane][1]);
    ok(label, r.longs.length + r.aborts.length === base.length && inRange,
       r.longs.length + ' voiced' + (r.aborts.length ? ', ' + r.aborts.length + ' out of range' : '') + '  \u2192 ' + r.longs.slice(0, 8).map(x => NM(x.midi)).join(' '));
});

H('13 \u00b7 from the pattern: the three references say what they should');
{
    const own = FP.assign(base, A, RANGES, { family: 'accent' });
    ok('the accent family takes each long\'s own attack', own.longs.every(x => {
        const a = A.find(y => y.id === x.attackId); return a && (x.pitch.raw === a.midi); }));
    const prv = FP.assign(base, A, RANGES, { family: 'prevAccent' });
    ok('the previous family takes the attack before it', prv.longs.every(x => {
        const i = A.findIndex(y => y.id === x.attackId); return x.pitch.raw === (i > 0 ? A[i - 1].midi : A[i].midi); }));
    const nxt = FP.assign(base, A, RANGES, { family: 'nextAccent' });
    ok('the next family takes the attack after it', nxt.longs.every(x => {
        const i = A.findIndex(y => y.id === x.attackId); return x.pitch.raw === (i < A.length - 1 ? A[i + 1].midi : A[i].midi); }));
    ok('the fold is recorded whenever a pitch moved', own.longs.every(x => x.midi === x.pitch.raw + 12 * x.pitch.fold),
       own.longs.filter(x => x.pitch.fold).length + ' of ' + own.longs.length + ' folded');
}

H('14 \u00b7 a sonority is dealt by 1k\'s deck, and the seed repeats it');
{
    const o = { family: 'sonority', notes: SON, from: 'mode 2 from F2', order: 'turn', seed: 1 };
    const a = FP.assign(base, A, RANGES, o), b = FP.assign(base, A, RANGES, o);
    ok('in turn deals the sonority in its own order', a.longs.slice(0, 6).every((x, i) => x.pitch.raw === SON[i]),
       a.longs.slice(0, 6).map(x => NM(x.pitch.raw)).join(' '));
    ok('the same seed repeats it exactly', JSON.stringify(a.longs.map(x => x.midi)) === JSON.stringify(b.longs.map(x => x.midi)));
    const sh1 = FP.assign(base, A, RANGES, Object.assign({}, o, { order: 'shuffled', seed: 4 }));
    const sh2 = FP.assign(base, A, RANGES, Object.assign({}, o, { order: 'shuffled', seed: 4 }));
    const sh3 = FP.assign(base, A, RANGES, Object.assign({}, o, { order: 'shuffled', seed: 5 }));
    ok('shuffled repeats from its seed', JSON.stringify(sh1.longs.map(x => x.pitch.raw)) === JSON.stringify(sh2.longs.map(x => x.pitch.raw)));
    ok('and another seed shuffles differently', JSON.stringify(sh1.longs.map(x => x.pitch.raw)) !== JSON.stringify(sh3.longs.map(x => x.pitch.raw)));
    ok('the deck laps over a pass longer than the set', a.longs.some(x => x.pitch.lap > 0),
       SON.length + ' notes over ' + base.length + ' longs');
    ok('the provenance names the source', a.longs.every(x => x.pitch.family === 'sonority' && x.pitch.source === 'mode 2 from F2'));
}

H('15 \u00b7 the chain walks, and the fold is what keeps it playable (his m2 and P5)');
{
    const step = (a, b, st) => ((b - a) % 12 + 12) % 12 === ((st % 12) + 12) % 12;
    const m2 = FP.assign(base, A, RANGES, { family: 'chain', intervalSt: 1, direction: 'up' });
    const raws = m2.longs.map(x => x.pitch.raw);
    ok('a minor-second chain steps a semitone every time', raws.every((v, i) => i === 0 || step(raws[i - 1], v, 1)));
    ok('and it SPIRALS — wrapped by octaves inside its band, never off the keyboard',
       Math.max.apply(null, raws) - Math.min.apply(null, raws) <= 24 && m2.aborts.length === 0,
       NM(Math.min.apply(null, raws)) + ' … ' + NM(Math.max.apply(null, raws)) + ', all ' + m2.longs.length + ' voiced');
    ok('every sounding pitch is inside its player\'s range', m2.longs.every(x => x.midi >= RANGES[x.lane][0] && x.midi <= RANGES[x.lane][1]),
       m2.longs.filter(x => x.pitch.fold).length + ' of ' + m2.longs.length + ' folded to get there');
    const p5 = FP.assign(base, A, RANGES, { family: 'chain', intervalSt: 7, direction: 'up' });
    const r5 = p5.longs.map(x => x.pitch.raw);
    ok('a fifth chain steps a fifth every time, and loses none', r5.every((v, i) => i === 0 || step(r5[i - 1], v, 7)) && p5.aborts.length === 0,
       p5.longs.length + ' voiced, ' + p5.aborts.length + ' lost — ' + r5.slice(0, 8).map(NM).join(' '));
    const alt = FP.assign(base, A, RANGES, { family: 'chain', intervalSt: 5, direction: 'alt' });
    const ra = alt.longs.map(x => x.pitch.raw);
    ok('alternating goes down then up', ra.length > 3 && ra[1] === ra[0] - 5 && ra[2] === ra[1] + 5,
       ra.slice(0, 5).map(NM).join(' '));
    const st = FP.assign(base, A, RANGES, { family: 'chain', intervalSt: 1, startPitch: 60 });
    ok('a typed starting pitch is honoured', st.longs[0].pitch.raw === 60);
}

H('16 \u00b7 vertical: the note the sounding chord is missing');
{
    const v = FP.assign(base, A, RANGES, { family: 'vertical', notes: SON, from: 'mode 2 from F2', seed: 1 });
    ok('every long is voiced from the sonority', v.longs.every(x => SON.some(n => ((n % 12) + 12) % 12 === ((x.pitch.raw % 12) + 12) % 12)));
    // at each long's start, its pitch class should not already be sounding
    let clashes = 0;
    v.longs.forEach((x, i) => {
        const sounding = v.longs.slice(0, i).filter(p => p.t1 > x.t0 + 1e-9).map(p => ((p.pitch.raw % 12) + 12) % 12);
        if (sounding.includes(((x.pitch.raw % 12) + 12) % 12)) clashes++;
    });
    ok('it never doubles a pitch class already in the air', clashes === 0, clashes + ' clashes over ' + v.longs.length + ' longs');
    ok('the provenance says which note the chord was missing', v.longs.some(x => /missing/.test(x.pitch.source)));
}

H('17 \u00b7 a pitch no octave reaches ABORTS the long and is counted');
{
    const tiny = {}; Object.keys(RANGES).forEach(k => tiny[k] = [60, 60]);   // a one-note range nothing but C4 reaches
    const r = FP.assign(base, A, tiny, { family: 'chain', intervalSt: 1, startPitch: 61 });
    ok('the longs it cannot voice are removed', r.longs.length < base.length, r.longs.length + ' of ' + base.length + ' voiced');
    ok('and each is counted with its reason', r.aborts.length === base.length - r.longs.length && r.aborts.every(x => x.why === 'outOfRange'),
       r.aborts.length + ' aborted, all outOfRange');
}

H('18 \u00b7 the readout');
ok('describe names the strategy in words', /minor|1 st up/.test(FP.describe({ family: 'chain', intervalSt: 1, direction: 'up' })),
   FP.describe({ family: 'chain', intervalSt: 1, direction: 'up' }));
ok('and names the harmony and its order', /mode 2 from F2/.test(FP.describe({ family: 'sonority', from: 'mode 2 from F2', order: 'shuffled', seed: 3 })),
   FP.describe({ family: 'sonority', from: 'mode 2 from F2', order: 'shuffled', seed: 3 }));

console.log('\n' + (fail ? fail + ' FAILED' : 'all checks passed'));
process.exit(fail ? 1 : 0);
