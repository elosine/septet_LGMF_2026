// time_containers.js — A SET OF TIME CONTAINERS, ROLLED (PLAN 1o step 2; CN-56; RUNNING_LOG §305–309).
//
// His ask (CN-56): *"I think I also want a facility for rolling and generating a set of time containers too … maybe it's like a random
// choose from a set. Maybe I give numbers like two five seven fifteen … you can have random waiting. So twenty percent fifteen and spread
// the eighty percent out among the rest … something like a duration maybe then overall, and then we roll for a set of time containers to
// fill that duration."* — and, in the same breath, *"it'd be worth abstracting it into its own module because this is a type of technique
// I do a lot of."* **So it is its own module from the first line**: it knows nothing of the drawer, the score, crescendos or MIDI. It
// takes numbers and gives back numbers.
//
// THREE INDEPENDENT AXES, which is what the talk established (§307, §308):
//
//   · THE POOL   — which values are available. Numbers, optional weights, a unit. **What is audible about a pool is its SPREAD**
//                  (max ÷ min), which is why the presets are sorted by it rather than by name or by source: an even set gives the same
//                  count whatever the seed, while powers of two gives anywhere from 6 to 16 containers over the same span.
//   · THE ORDER  — how they come out. `stick` (how much the next value stays near the last: his *periodic*) and `jump` (how often it
//                  deliberately leaps: his *interrupted*). **Two controls, not one, because stickiness alone LOCKS UP** — at 2.5 the roll
//                  stops leaving the value it found and gives `7 7 7 7 7 7 7 7` (§307). They are also two different musical decisions.
//   · THE CONTOUR — the size the roll is pulled toward across the span. His **accordion**: `grow · shrink · openClose · closeOpen`, with
//                  `turn` (where the reversal sits — the asymmetry), `bow` (broad or sharp at the turn) and `depth`. **`depth` decides
//                  whether the large-scale form is the subject or the background** (§308), because the contour and the interruptions pull
//                  against each other.
//
// The roll FILLS a total and **stops short**, reporting the shortfall — his own choice (§306), because the numbers he typed are the point
// and stretching them to land exactly would lose them.
//
// Pure and deterministic from the seed. The page (window.TimeContainers) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.TimeContainers = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const CONTOURS = [
    ['flat', 'no contour'],
    ['grow', 'small → large'],
    ['shrink', 'large → small'],
    ['openClose', 'open then close (the bellows)'],
    ['closeOpen', 'close then open'],
];

// THE PRESETS, sorted by SPREAD — the list itself reads as a scale from even to extreme (§306, §307). Each carries its source, because a
// set with a pedigree is easier to reach for than a row of numbers; but the spread is what he will actually hear, and the honest part is
// that a proportion system's known effects are ARCHITECTURAL — seen all at once — while these are heard one after another. What they
// reliably give is their spread and their lack of a common factor.
const PRESETS = [
    { key: 'even',        label: 'even',                    note: 'a pulse',                                   values: [4] },
    { key: 'gentle',      label: 'gently uneven',           note: 'close together, breathing',                 values: [3, 4, 5] },
    { key: 'pythag',      label: 'Pythagorean 6:8:9:12',    note: "the string ratios 4:3, 3:2, 2:1 — Palladio's room proportions", values: [6, 8, 9, 12] },
    { key: 'root2',       label: '√2 · ad quadratum', note: 'DIN paper and Gothic design',            values: [10, 14, 20, 28] },
    { key: 'longShort',   label: 'long and short',          note: 'two speeds, no middle',                     values: [2, 7] },
    { key: 'harmonic',    label: 'harmonic series',         note: 'halving — 12 6 4 3',                    values: [3, 4, 6, 12] },
    { key: 'golden',      label: 'golden section φ',    note: '1 : 1.618, each the last times φ',      values: [10, 16, 26, 42] },
    { key: 'root3',       label: '√3 · ad triangulum', note: 'the Gothic triangle',                   values: [10, 17, 30, 52] },
    { key: 'silver',      label: 'silver ratio',            note: '1 : 2.414 — Japanese temple proportion', values: [10, 24, 58] },
    { key: 'primes',      label: 'primes',                  note: 'no common factor anywhere',                 values: [2, 3, 5, 7, 11, 13] },
    { key: 'oneRareLong', label: 'one rare long',           note: 'his own set — mostly quick, 15 at 20 %', values: [2, 5, 7, 15], weights: [null, null, null, 0.20] },
    { key: 'fibonacci',   label: 'Fibonacci',               note: 'each the sum of the two before',            values: [1, 2, 3, 5, 8, 13] },
    { key: 'jagged',      label: 'jagged',                  note: 'extremes, no middle',                       values: [1, 2, 8, 13] },
    { key: 'triangular',  label: 'triangular',              note: '1, 1+2, 1+2+3, …',                      values: [1, 3, 6, 10, 15] },
    { key: 'modulor',     label: 'Modulor-ish φ series', note: "Le Corbusier's series, roughly",           values: [3, 4, 6, 10, 16, 27] },
    { key: 'pow2',        label: 'powers of two',           note: 'doubling',                                  values: [1, 2, 4, 8, 16] },
];

const DEFAULTS = {
    values: [2, 5, 7, 15],
    weights: null,      // null, or one entry per value: a number is taken as given, null shares what is left equally
    unit: 1,            // seconds per unit — one number rescales a whole shape (his choice (c), §306)
    total: 60,          // the span to fill
    stick: 0.8,         // the ORDER: how much the next value stays near the last (0 = memoryless)
    jump: 0.10,         // how often it deliberately leaps far — his "interrupted"
    contour: 'flat',    // the CONTOUR: 'grow' · 'shrink' · 'openClose' · 'closeOpen'
    turn: 0.5,          // where the reversal sits (the asymmetry)
    bow: 1,             // broad (< 1) or sharp (> 1) at the turn
    depth: 1,           // how hard the contour pulls against the stickiness and the interruptions
    seed: 1,
    minCount: 1,        // never return fewer than this, if the pool allows it
};

const r3 = x => Math.round(x * 1000) / 1000;
function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// his weighting rule, exactly as he put it: *"twenty percent fifteen and spread the eighty percent out among the rest"*
function weightsFor(values, weights) {
    const n = values.length;
    if (!weights || !weights.length) return values.map(() => 1 / n);
    const given = values.map((v, i) => (weights[i] == null || !isFinite(weights[i])) ? null : Math.max(0, +weights[i]));
    const spoken = given.reduce((s, w) => s + (w || 0), 0);
    const rest = given.filter(w => w == null).length;
    const share = rest ? Math.max(0, 1 - spoken) / rest : 0;
    return given.map(w => (w == null ? share : w));
}

const spreadOf = values => {
    const v = (values || []).filter(x => isFinite(x) && x > 0);
    if (!v.length) return 1;
    return r3(Math.max.apply(null, v) / Math.min.apply(null, v));
};

// the presets are sorted HERE rather than by hand, so the list can never drift out of order as sets are added — and the order IS the
// point: the menu reads as a scale from even to extreme, because the spread is what he will actually hear (§306).
PRESETS.sort((a, b) => spreadOf(a.values) - spreadOf(b.values) || a.label.localeCompare(b.label));

// the contour at position u (0…1) through the span, as a fraction of the pool's range
function contourAt(kind, u, turn, bow) {
    const p = Math.max(0.02, Math.min(0.98, +turn));
    let v;
    if (kind === 'grow') v = u;
    else if (kind === 'shrink') v = 1 - u;
    else if (kind === 'openClose') v = u <= p ? u / p : 1 - (u - p) / (1 - p);
    else if (kind === 'closeOpen') v = u <= p ? 1 - u / p : (u - p) / (1 - p);
    else return null;                                              // 'flat': no pull at all
    return Math.pow(Math.max(0, Math.min(1, v)), Math.max(0.05, +bow || 1));
}

// THE ROLL. Returns { seq (seconds), units (the raw numbers), filled, short, spread, count }.
function roll(o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const vals = (O.values || []).map(Number).filter(x => isFinite(x) && x > 0);
    if (!vals.length) return { seq: [], units: [], filled: 0, short: r3(O.total), spread: 1, count: 0, why: 'no numbers in the set' };
    const unit = Math.max(1e-6, +O.unit || 1), total = Math.max(0, +O.total || 0);
    const secs = vals.map(v => v * unit);
    if (Math.min.apply(null, secs) > total) {
        return { seq: [], units: [], filled: 0, short: r3(total), spread: spreadOf(vals), count: 0,
                 why: 'every container is longer than the span — lower the unit or raise the duration' };
    }
    const base = weightsFor(vals, O.weights);
    const lo = Math.min.apply(null, secs), hi = Math.max.apply(null, secs), span = Math.max(1e-6, hi - lo);
    const rnd = mulberry32(Math.max(1, Math.round(+O.seed || 1)) * 7727 + 29);
    const seq = [], units = [];
    let t = 0, last = null;
    while (t < total - 1e-9) {
        const u = total > 0 ? t / total : 0;
        const c = contourAt(O.contour, u, O.turn, O.bow);
        const target = c == null ? null : lo + span * c;
        const interrupt = rnd() < Math.max(0, Math.min(1, +O.jump || 0));
        const w = secs.map((v, i) => {
            let x = base[i];
            if (!interrupt && O.stick > 0 && last != null) x *= Math.exp(-O.stick * Math.abs(v - last) / span * 4);
            if (interrupt && last != null) x *= 1 + Math.abs(v - last) / span * 3;      // an interruption prefers a FAR value
            if (target != null) x *= Math.exp(-Math.abs(v - target) / span * (2.5 * Math.max(0, +O.depth)));
            return x > 0 ? x : 1e-12;
        });
        const sum = w.reduce((a, b) => a + b, 0);
        let pick = rnd() * sum, i = 0;
        while (i < w.length - 1 && pick > w[i]) { pick -= w[i]; i++; }
        const v = secs[i];
        if (t + v > total + 1e-9) {
            // it does not fit: take the largest that does, else stop short (his (a), §306)
            let best = -1;
            secs.forEach((s, k) => { if (t + s <= total + 1e-9 && (best < 0 || s > secs[best])) best = k; });
            if (best < 0) break;
            seq.push(r3(secs[best])); units.push(vals[best]); t += secs[best]; last = secs[best];
            continue;
        }
        seq.push(r3(v)); units.push(vals[i]); t += v; last = v;
    }
    return { seq, units, filled: r3(t), short: r3(total - t), spread: spreadOf(vals), count: seq.length,
             why: seq.length ? '' : 'nothing fitted the span' };
}

// the rolled containers as ONSET TIMES in ms from zero — what the drawer's rhythm wants
function onsetsMs(res, startMs) {
    const out = []; let t = +startMs || 0;
    (res && res.seq || []).forEach(v => { out.push(Math.round(t * 1000) / 1000); t += v * 1000; });
    return out;
}

function describe(o, res) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const c = (CONTOURS.find(x => x[0] === O.contour) || ['flat', 'no contour'])[1];
    const bits = [
        (O.values || []).join(' ') + (O.unit !== 1 ? ' × ' + O.unit + ' s' : ' s'),
        'spread ' + spreadOf(O.values) + '×',
        O.stick > 0 ? 'stick ' + O.stick : 'memoryless',
        'interrupt ' + Math.round((+O.jump || 0) * 100) + '%',
    ];
    if (O.contour !== 'flat') bits.push(c + ' (turn ' + O.turn + ', bow ' + O.bow + ', depth ' + O.depth + ')');
    if (res) bits.push(res.count + ' containers, ' + res.filled + ' of ' + O.total + ' s' + (res.short > 0.001 ? ' · ' + res.short + ' s short' : ''));
    return bits.join(' · ');
}

return { CONTOURS, PRESETS, DEFAULTS, mulberry32, weightsFor, spreadOf, contourAt, roll, onsetsMs, describe };
}));
