// sequence.js — THE SEQUENCE GENERATOR: a recipe in, every player's notes out (PLAN 1d.1, 2026-09-19; RUNNING_LOG §102–§111).
//
// His brief is COMPOSITION_NOTES LG-35 (the dynamics LG-36, the waves LG-38 · LG-39): saved takes from the strikes drawer held as
// SUSTAINED CHORDS, each for a duration, in a row of time containers, the morph's breaths laid over the whole; a new chord ATTACKED by
// everyone or taken SEAMLESSLY at each player's next breath. The architecture he approved: a sequence is a RECIPE saved in the score
// file and the notes are DERIVED from it. This file is the derivation and nothing else — it knows nothing of the drawer, the canvas
// or MIDI. docs/SEQUENCE_TOOL.md carries the rules and the numbers in prose.
//
// THE RECIPE — one JSON shape:
//   {
//     t0:         seconds — where the sequence starts in the score
//     containers: [ { dur, chord, dyn } … ]
//                   dur    seconds, > 0
//                   chord  the notes as a take deals them — one per player, or several for ONE player (a double stop: one bow, one chain):
//                          { lane, seat, inst, tech, midi, cents, level }        (+ partial · fixedLen, carried if present)
//                            lane   the score's lane            seat   0 / absent = the lane's own player, 1 = the second vibraphone bow
//                            inst   the palette's instrument key (english_horn … double_bass)
//                            level  the dealt level as a drawn HEIGHT 0–1 (or `vel`, the dealt anchor 65–127, read through the ladder)
//                   dyn    'as dealt' (each note keeps its own level) or 'ppp' … 'fff' (the drawer's written scale, dyn_ui.js)
//     change:     'attack' | 'seamless'
//     breath:     { striation, length, jitter, seed,      — the morph's defaults: staggered · 8 s · 0.35 · seed 1
//                   together, apart, lengths }            — the dials of PLAN 1d.5, below: null (free) · 0.5 s · null (no pool)
//   }
//
// THE TWO CHANGE RULES.
//   attack    every player's chain is cut at each container boundary and restarted: everyone starts AT the line, together. A player
//             who also plays the next chord lands one gap BEFORE the line — the breath before the attack. Inside a container the
//             striation lives in the FIRST breath's length (shortened by the player's phase), so the re-breaths are spread although
//             the entries are not.
//   seamless  one chain per player across the sequence. Each breath takes the pitch and the level of the container it STARTS in; a
//             breath across a line keeps the old chord (flag ACROSS). First entries are staggered, as the morph's are.
//   Either way the final breaths are DEALT TO LAND on the end — never chopped there, never a runt left over. A player absent from a
//   chord rests through it; its chain lands where its last container ends and re-enters (staggered under seamless) where it returns.
//   A REST (PLAN 1d.4): a container whose chord is `null` is silence for its duration — EVERY player is absent from it, so under both
//   rules every chain lands at the rest's start and begins again at its end. No new machinery: it is the absent-player rule, for all.
//   (`chord: []` is still refused — a malformed box; a rest is `null` and deliberate.)
//
// THE BREATH RULES are the morph's, borrowed as NUMBERS, not as shared code (morph.js §5 is byte-gated against the tuba baseline and
// is not touched): the staggered first entry `phase · length · 0.5` · the five striation phases · the palette's gap after a breath,
// jittered by half the jitter, never under 50 ms so two notes of one player never touch · SPLIT, NEVER TRUNCATE at the ceiling.
// The ceilings are beating_calc.js CEILINGS / ceilingFor — the source the six reference scores used and check_ceilings.js reads —
// taken at the note's LOUDEST level (the palette's ceiling shortens as the level rises; MORPH_NOTES §3 has the bug on record where a
// swelling note outgrew a ceiling read at its quiet start). An instrument with no ceiling (the percussion) is a FIXED-LENGTH sound:
// struck once per breath, and the sample decides its length.
//
// THE BREATH DIALS (PLAN 1d.5, RUNNING_LOG §118). With none of them touched the notes are 1d.1's, note for note —
// tools/sequence_baseline.json, frozen before they went in, is the gate.
//   together  null = FREE, the morph's way: two players begin a breath together only by chance. A number 0 … 1 is a probability:
//             each RE-ENTRY snaps, with that probability, onto another player's re-entry (flag SNAP); the ones that do not snap are
//             kept at least `apart` seconds from every other player's start (flag APART). 0 = never together · 1 = everyone together.
//             A start is moved by the breath BEFORE it: shortened (never to less than half of itself, nor under RUNT_S) or held longer within its ceiling; only when
//             the ceiling is in the way is the gap widened, and by no more than WAIT_MAX_S. No room at all: flag CROWDED, left alone.
//             An `attack` line is everyone, by design, and stands outside the rule. A seamless first entry is never snapped — the
//             striation owns it — but is kept apart (moved later) while together < 1.
//             THE SHORTEST BREATH LEADS: the players are dealt in order of ceiling, shortest first, each moving or snapping to the
//             ones dealt before — anyone can match a shorter breath, no one can outlast their own ceiling. At 1 every player takes
//             the leader's NEXT re-entry. The dial has a random stream of its own, so turning it re-deals no length.
//   lengths   null, or a POOL { values, weights }: each breath's wanted length is drawn from the pool — short with long — by the time
//             container generator (time_containers.js, NOT changed; its order dials at their defaults), one stream per (player, span)
//             from the one seed. A pool value is played as written: no jitter on it; the ceiling still binds, and flags. `length`
//             then only spaces the first entries. The landing breaths still take what is left, so they are not pool values.
//
// A NOTE'S LEVEL IS BREAKPOINTS from the first day — `levels: [[0, level], [dur, level]]`, flat today — so the waves layer (1d.7) or
// a drawn curve later changes the numbers, not the shape of what this file returns.
//
// Chains are keyed by SEAT, not lane: the two vibraphone bows stay two players. Two notes dealt to ONE seat are a double stop — they
// share every breath (chord 5's cello holds E♭4 and A4 on one bow); the ceiling is read at the louder of the two.
// Pure and deterministic: one seed; the same recipe and seed give the same notes. Each (player, span) has its own random stream, so
// re-timing one box under `attack` leaves the breaths of every other box where they were (with `together` FREE — a set `together`
// ties the players to each other, which is its whole point).
// The page (window.Sequence) and node (module.exports).
(function (root, factory) {
    const api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Sequence = api;
}(typeof self !== 'undefined' ? self : this, function (root) {
'use strict';

const STRIATIONS = ['staggered', 'grouped', 'aligned', 'converging', 'diverging'];
const CHANGES = ['attack', 'seamless'];
const AS_DEALT = 'as dealt';
// morph.js DEFAULTS.carrier: segLen 8 · segVar 0.35 · striation 'staggered'. together · apart · lengths are this file's own (1d.5)
const DEFAULT_BREATH = { striation: 'staggered', length: 8, jitter: 0.35, seed: 1, together: null, apart: 0.5, lengths: null };

const MIN_GAP_S = 0.05;          // two notes of one player never touch (the morph's 50 ms)
const MAX_SEG_HARD_S = 30;       // the morph's absolute ceiling, a safety net over the palette
const MIN_BREATH_S = 0.5;        // the jitter may not deal a breath shorter than this
const RUNT_S = 1.5;              // if what a breath leaves of its span is shorter than this, the landing takes it in
const FIXED_LEN_S = 1;           // a fixed-length sound that names no length of its own
const MAX_NOTES_PER_SPAN = 2048; // never exits silently: flagged SEGCAP
const WAIT_MAX_S = 1;            // `together`: a start moved later may widen the gap before it by no more than this
const POOL_ROLL_S = 600;         // `lengths`: the pool is rolled this many seconds at a time (or 40 of its longest value), and again when used up

const r3 = v => Math.round(v * 1000) / 1000;
const clamp01 = v => Math.max(0, Math.min(1, v));

// ---- the random streams: one per (seed, player, span), so nothing a neighbour does moves them ----
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const rngFor = (seed, key, spanIdx) => mulberry32((hashStr(key + '@' + spanIdx) ^ Math.imul((seed | 0) + 1, 2654435761)) >>> 0);

// Phase offset (0..1) for a voice under each named pattern — the morph's numbers (morph.js striationPhase). As there, only the
// FIRST-entry phase (segIdx 0) is used, so `diverging` starts aligned and `converging` starts staggered. 1d.5 kept it so, at his
// word (*"I might not want to design too much there"*): the five names are the morph's and do what the morph's do.
function striationPhase(pattern, vi, nVoices, segIdx) {
    switch (pattern) {
        case 'aligned':    return 0;
        case 'grouped':    return (vi % 3) / 3;
        case 'diverging':  return (vi / Math.max(1, nVoices)) * Math.min(1, segIdx / 4);
        case 'converging': return (vi / Math.max(1, nVoices)) * Math.max(0, 1 - segIdx / 4);
        case 'staggered':
        default:           return vi / Math.max(1, nVoices);
    }
}

// ---- the context: the palette's ceilings and the drawer's dynamic ladder, handed in or found ----
function ceilingsOf(ctx) {
    if (ctx && ctx.ceilings) return ctx.ceilings;
    if (root && root.BeatingCalc) return root.BeatingCalc;
    if (typeof module === 'object' && module.exports && typeof require === 'function') return require('./beating_calc.js');
    return null;
}
const ladderOf = ctx => (ctx && ctx.ladder) || (root && root.StrikeDyn) || null;   // dyn_ui.js's { NAMES, ANCHOR, LO, HI } — THAT ladder, not a copy
// the time container generator — piece #5's, the one the drawer's roll uses — asked for only when the recipe carries a pool of lengths
function poolOf(ctx) {
    if (ctx && ctx.containers) return ctx.containers;
    if (root && root.TimeContainers) return root.TimeContainers;
    if (typeof module === 'object' && module.exports && typeof require === 'function') return require('./time_containers.js');
    return null;
}

// what the palette says of one instrument at one level: a breath or a bow with its ceiling and gap — or a fixed-length sound
function noteInfo(BC, inst, level01) {
    if (!BC.CEILINGS[inst]) return { fixed: true, ceiling: Infinity, gapS: 0, kind: 'fixed' };   // check_ceilings.js's own test
    const c = BC.ceilingFor(inst, level01);
    return { fixed: false, ceiling: Math.min(c.seconds, MAX_SEG_HARD_S), gapS: c.gapS || 0, kind: c.kind };
}

// the level of a note in a container: the container's dynamic through the drawer's ladder, or the note's own
function levelOf(note, dyn, ladder) {
    if (dyn && dyn !== AS_DEALT) return clamp01((ladder.ANCHOR[dyn] - ladder.LO) / (ladder.HI - ladder.LO));
    if (note.level != null) return clamp01(+note.level);
    return clamp01((+note.vel - ladder.LO) / (ladder.HI - ladder.LO));
}
const peakOf = levels => levels.reduce((m, p) => Math.max(m, p[1]), 0);   // the LOUDEST level — where the ceiling is read

// ---- the players: one key per seat, holding every note the chord deals that seat (one, or a double stop) ----
function keyChord(chord) {
    const out = {};
    (chord || []).forEach(n => { const k = n.lane + ':' + (n.seat || 0); (out[k] || (out[k] = [])).push(n); });
    return out;
}

// ---- the recipe read: every reason it cannot be played, as messages ----
function validate(recipe, ctx) {
    const msgs = [], R = recipe || {};
    if (!isFinite(+R.t0) || +R.t0 < 0) msgs.push('t0 must be a time in seconds, 0 or later');
    if (CHANGES.indexOf(R.change) < 0) msgs.push('change must be "attack" or "seamless" — got ' + JSON.stringify(R.change));
    const B = R.breath || {};
    if (B.striation != null && STRIATIONS.indexOf(B.striation) < 0) msgs.push('breath.striation must be one of ' + STRIATIONS.join(' · '));
    if (B.length != null && !(+B.length > 0)) msgs.push('breath.length must be more than 0 s');
    if (B.jitter != null && !(+B.jitter >= 0 && +B.jitter <= 1)) msgs.push('breath.jitter must be 0 … 1');
    if (B.together != null && B.together !== '' && !(+B.together >= 0 && +B.together <= 1)) msgs.push('breath.together must be blank (free) or 0 … 1 — got ' + JSON.stringify(B.together));
    if (B.apart != null && !(+B.apart > 0)) msgs.push('breath.apart must be more than 0 s');
    if (B.lengths != null) {
        const v = B.lengths.values, w = B.lengths.weights;
        if (!Array.isArray(v) || !v.length || !v.every(x => isFinite(+x) && +x > 0)) msgs.push('breath.lengths needs values — seconds, each more than 0');
        else if (w != null && (!Array.isArray(w) || w.length > v.length)) msgs.push('breath.lengths.weights must be one weight per value, or none');
        if (!poolOf(ctx)) msgs.push('breath.lengths needs time_containers.js and it is not loaded');
    }
    const BC = ceilingsOf(ctx), ladder = ladderOf(ctx);
    if (!BC || !BC.CEILINGS || !BC.ceilingFor) msgs.push('no palette — beating_calc.js (CEILINGS · ceilingFor) is not loaded');
    const C = R.containers;
    if (!Array.isArray(C) || !C.length) { msgs.push('a sequence needs at least one container'); return msgs; }
    C.forEach((c, i) => {
        const at = 'container ' + (i + 1) + ': ';
        if (!c || !(+c.dur > 0) || !isFinite(+c.dur)) msgs.push(at + 'a duration of ' + (c && c.dur) + ' s — a container must last more than 0 s');
        if (c && c.chord === null) return;   // PLAN 1d.4: a REST — deliberate silence for its duration; nothing else to check
        if (!c || !Array.isArray(c.chord) || !c.chord.length) { msgs.push(at + 'an empty chord — choose a take for it, or make it a rest (chord: null)'); return; }
        const dyn = c.dyn == null ? AS_DEALT : c.dyn, named = dyn !== AS_DEALT;
        if (named && !ladder) msgs.push(at + 'dyn "' + dyn + '" needs the drawer\'s ladder (dyn_ui.js StrikeDyn) and it is not loaded');
        else if (named && ladder.NAMES.indexOf(dyn) < 0) msgs.push(at + 'dyn "' + dyn + '" is not on the ladder ' + ladder.NAMES.join(' '));
        c.chord.forEach((n, j) => {
            const nat = at + 'note ' + (j + 1) + ': ';
            if (!n || !Number.isInteger(n.lane) || n.lane < 0) { msgs.push(nat + 'no lane'); return; }
            if (!isFinite(+n.midi)) msgs.push(nat + 'no pitch');
            if (!n.inst) msgs.push(nat + 'no instrument key (inst)');
            if (!named && n.level == null && (n.vel == null || !ladder)) msgs.push(nat + '"as dealt" needs the note\'s own level (level 0–1, or vel with the ladder loaded)');
        });
    });
    if (C.every(c => c && c.chord === null)) msgs.push('every container is a rest — give one a chord');
    return msgs;
}

// ---- the breath dials' tools (PLAN 1d.5) ----
// the members of a SORTED list inside [lo, hi]
function between(sorted, lo, hi) {
    let a = 0, b = sorted.length;
    while (a < b) { const m = (a + b) >> 1; if (sorted[m] < lo - 1e-9) a = m + 1; else b = m; }
    const out = []; for (let i = a; i < sorted.length && sorted[i] <= hi + 1e-9; i++) out.push(sorted[i]);
    return out;
}
// where a start may fall: `want` itself if it is at least `apart` from every start in `all`, else the free place nearest to it
// inside [lo, hi] — the edge of a taken start's neighbourhood, earlier or later. null = no room
function freeNear(want, lo, hi, all, apart) {
    const near = between(all, Math.min(want, lo) - apart, Math.max(want, hi) + apart);
    const clear = x => !near.some(s => Math.abs(s - x) < apart - 1e-9);
    if (clear(want)) return want;
    let best = null;
    near.forEach(s => [r3(s - apart), r3(s + apart)].forEach(x => {
        if (x < lo - 1e-9 || x > hi + 1e-9 || !clear(x)) return;
        if (best == null || Math.abs(x - want) < Math.abs(best - want) - 1e-9) best = x;
    }));
    return best;
}
// a player's own stream of wanted lengths out of the pool: the time container generator, rolled a stretch at a time
function poolStream(S, key, spanIdx) {
    const base = ((hashStr(key + '@' + spanIdx + '~lengths') ^ Math.imul((S.seed | 0) + 1, 2654435761)) >>> 0) % 2000000000;
    const total = Math.max(POOL_ROLL_S, 40 * Math.max.apply(null, S.pool.values));
    let buf = [], k = 0, n = 0;
    return function () {
        if (k >= buf.length) { buf = S.TC.roll({ values: S.pool.values, weights: S.pool.weights, unit: 1, total: total, seed: 1 + base + n++ }).seq; k = 0; }
        return buf.length ? buf[k++] : null;
    };
}

// ---- one span of one player's chain: breaths dealt from `from`, landing on `landAt` ----
// span = { from, to, landAt, entry: 'together' | 'staggered', idx }; `noteAt(t)` gives the container index and the player's note there.
// T is the `together` dial's state — null while the dial is FREE, and then nothing below differs from 1d.1.
function dealSpan(P, span, S, T) {
    const rng = rngFor(S.seed, P.key, span.idx), out = [];
    const draw = S.pool ? poolStream(S, P.key, span.idx) : null;
    const phase0 = striationPhase(S.striation, P.index, S.nPlayers, 0);
    let t = span.from, first = true, moved = null;
    if (span.entry === 'staggered') t += Math.min(phase0 * S.length * 0.5, 0.25 * (span.to - span.from));   // a POSITIVE offset, and never past a short span
    if (T && T.p < 1 && span.entry === 'staggered') {   // a seamless first entry is the striation's: never snapped, but kept apart — moved LATER only
        const f = freeNear(t, t, Math.max(t, Math.min(span.from + 0.5 * (span.to - span.from), span.landAt - RUNT_S)), T.all, T.apart);
        if (f == null) moved = 'CROWDED'; else if (f > t + 1e-9) { t = f; moved = 'APART'; }
    }
    while (t < span.landAt - 0.02) {
        const ci = S.containerAt(t), srcs = S.plan[ci][P.key];
        const lvls = srcs.map(s => levelOf(s, S.dyns[ci], S.ladder));
        const info = noteInfo(S.BC, srcs[0].inst, Math.max.apply(null, lvls));   // the ceiling at the LOUDEST level (flat today, so a note's level is its loudest)
        const jit = 1 + (rng() * 2 - 1) * S.jitter, gapJit = 1 + (rng() * 2 - 1) * S.jitter * 0.5;   // always two draws a breath
        const flags = [];
        const drawn = draw ? draw() : null;                                                                     // 1d.5: a pool value is played as written — no jitter on it
        let want = Math.max(MIN_BREATH_S, drawn != null ? drawn : S.length * jit);
        if (first && span.entry === 'together') want = Math.max(0.25 * want, want - phase0 * S.length * 0.5);   // the striation, moved into the first breath
        if (want > info.ceiling) { want = info.ceiling; flags.push('CEILING'); }                                // split, never truncate
        let gap = info.fixed ? 0 : Math.max(MIN_GAP_S, info.gapS * gapJit);
        // dealt to land: the last breath takes what is left; a would-be runt is folded in, or the rest is shared by two even breaths
        const remaining = span.landAt - t;
        let period;
        if (remaining <= want) period = remaining;
        else if (remaining - want - gap < RUNT_S) period = remaining <= info.ceiling ? remaining : (remaining - gap) / 2;
        else period = want;
        period = Math.min(period, info.ceiling);
        if (period <= 0.02) break;
        // 1d.5 — `together`: where this player's NEXT start falls is this breath's business — it is shortened, held longer, or (last) its gap widened
        const startFlag = moved; let to = null; moved = null;
        if (T && t + period + gap < span.landAt - 0.02) {
            const next = t + period + gap;
            // the room it has: the breath now is never cut to less than HALF of what it would have been, nor under RUNT_S; never held past its ceiling (+ a short wait)
            const lo = t + Math.max(Math.min(period, RUNT_S), 0.5 * period) + gap, hi = Math.min(t + info.ceiling + gap + WAIT_MAX_S, span.landAt - RUNT_S);
            const snap = T.rng() < T.p;   // always one draw a breath, on the dial's own stream
            let flag = null;
            if (snap && hi >= lo) {
                const c = between(T.re, lo, hi);   // at 1 everyone takes the leader's NEXT re-entry; below 1, the re-entry nearest to where this one would have fallen
                if (c.length) { to = T.p >= 1 ? c[0] : c.reduce((a, b) => (Math.abs(b - next) < Math.abs(a - next) ? b : a)); flag = 'SNAP'; }
            }
            if (to == null && T.p < 1) {
                const f = freeNear(next, lo, hi, T.all, T.apart);
                if (f == null) moved = 'CROWDED'; else if (Math.abs(f - next) > 1e-9) { to = f; flag = 'APART'; }
            }
            if (to != null) {
                period = to - t - gap;
                if (period > info.ceiling) { period = info.ceiling; gap = to - t - period; }   // the ceiling is in the way: the gap widens, by no more than WAIT_MAX_S
                moved = flag;
                const k = flags.indexOf('CEILING'), atCeil = !info.fixed && period >= info.ceiling - 1e-9;
                if (k >= 0 && !atCeil) flags.splice(k, 1); else if (k < 0 && atCeil) flags.push('CEILING');
            }
        }
        if (startFlag) flags.push(startFlag);
        if (T) T.mine.push({ t: r3(t), entry: first, line: first && span.entry === 'together' });
        srcs.forEach((src, k) => {
            const dur = info.fixed ? (+src.fixedLen > 0 ? +src.fixedLen : FIXED_LEN_S) : period;   // the sample decides a fixed sound's length
            const f = flags.slice();
            if (info.fixed && t + dur > span.to + 1e-9) f.push('RINGS');                        // it rings past the line, and says so
            if (!info.fixed && t + dur > S.bounds[ci + 1] + 1e-9) f.push('ACROSS');             // seamless: the old chord held across a line
            if (!info.fixed && dur < RUNT_S - 1e-6) f.push('RUNT');                             // (the 1e-6: a breath moved to EXACTLY the floor is not a runt — 1d.5)
            const levels = [[0, lvls[k]], [r3(dur), lvls[k]]];
            out.push({
                player: P.key, lane: src.lane, seat: src.seat || 0, inst: src.inst, tech: src.tech, midi: src.midi, cents: src.cents || 0,
                partial: src.partial, container: ci, start: r3(t), end: r3(t + dur), dur: r3(dur), level: peakOf(levels), levels: levels,
                kind: info.kind, ceiling: isFinite(info.ceiling) ? info.ceiling : null, flags: f,
            });
        });
        if (out.length >= MAX_NOTES_PER_SPAN) { out[out.length - 1].flags.push('SEGCAP'); break; }
        t = to != null ? to : t + period + gap; first = false;
    }
    return out;
}

// ---- the generator ----
function generate(recipe, ctx) {
    const msgs = validate(recipe, ctx);
    if (msgs.length) throw new Error('sequence: ' + msgs.join(' · '));
    const R = recipe, B = Object.assign({}, DEFAULT_BREATH, R.breath || {});
    const BC = ceilingsOf(ctx), ladder = ladderOf(ctx);
    const bounds = [r3(+R.t0)];
    R.containers.forEach(c => bounds.push(r3(bounds[bounds.length - 1] + +c.dur)));
    const last = R.containers.length - 1, end = bounds[bounds.length - 1];
    const plan = R.containers.map(c => keyChord(c.chord));
    const dyns = R.containers.map(c => c.dyn == null ? AS_DEALT : c.dyn);

    // the players: everyone who has a note anywhere, in score order — a player's phase is the same in every box
    const byKey = {};
    plan.forEach(m => Object.keys(m).forEach(k => { if (!byKey[k]) byKey[k] = { key: k, lane: m[k][0].lane, seat: m[k][0].seat || 0, inst: m[k][0].inst }; }));
    const players = Object.keys(byKey).map(k => byKey[k]).sort((a, b) => a.lane - b.lane || a.seat - b.seat || (a.key < b.key ? -1 : 1));
    players.forEach((p, i) => { p.index = i; });

    const pool = B.lengths ? { values: B.lengths.values.map(Number), weights: B.lengths.weights || null } : null;
    const S = {
        seed: B.seed | 0, striation: B.striation, length: +B.length, jitter: clamp01(+B.jitter), nPlayers: players.length,
        BC: BC, ladder: ladder, plan: plan, dyns: dyns, bounds: bounds, pool: pool, TC: pool ? poolOf(ctx) : null,
        containerAt: t => { let i = 0; while (i < last && bounds[i + 1] <= t + 1e-9) i++; return i; },
    };
    const gapOf = (p, ci) => { const info = noteInfo(BC, plan[ci][p.key][0].inst, 0.5); return info.fixed ? 0 : Math.max(MIN_GAP_S, info.gapS); };   // the palette's gap does not move with the level

    // 1d.5 — `together`. FREE (null): every player is dealt alone, in score order, as 1d.1 dealt them. A number: THE SHORTEST BREATH
    // LEADS — dealt in order of ceiling (each player's shortest, at the levels it plays), every player moving or snapping to the ones before
    const tog = (B.together == null || B.together === '') ? null : clamp01(+B.together);
    const T = tog == null ? null : { p: tog, apart: Math.max(MIN_GAP_S, +B.apart || DEFAULT_BREATH.apart), all: [], re: [], mine: null, rng: null };
    let order = players;
    if (T) {
        players.forEach(p => {
            p.ceil = Infinity;
            plan.forEach((m, ci) => { const s = m[p.key]; if (s) p.ceil = Math.min(p.ceil, noteInfo(BC, s[0].inst, Math.max.apply(null, s.map(x => levelOf(x, dyns[ci], ladder)))).ceiling); });
        });
        order = players.slice().sort((a, b) => (a.ceil - b.ceil) || (a.index - b.index));   // ∞ − ∞ is NaN, which falls through to the score order
    }

    const notes = [];
    order.forEach(p => {
        const has = i => i >= 0 && i <= last && !!plan[i][p.key];
        if (T) { T.mine = []; T.rng = rngFor(S.seed, p.key + '~together', 0); }
        if (R.change === 'attack') {
            // every container the player is in is its own span; it lands a gap before the line when it attacks the next chord too
            for (let i = 0; i <= last; i++) {
                if (!has(i)) continue;
                const landAt = has(i + 1) ? bounds[i + 1] - gapOf(p, i) : bounds[i + 1];
                dealSpan(p, { from: bounds[i], to: bounds[i + 1], landAt: landAt, entry: 'together', idx: i }, S, T).forEach(n => notes.push(n));
            }
        } else {
            // every unbroken run of containers the player is in is one chain
            for (let i = 0; i <= last; i++) {
                if (!has(i)) continue;
                let j = i; while (has(j + 1)) j++;
                dealSpan(p, { from: bounds[i], to: bounds[j + 1], landAt: bounds[j + 1], entry: 'staggered', idx: i }, S, T).forEach(n => notes.push(n));
                i = j;
            }
        }
        if (T) {   // what this player did is what the next ones move around: every start but an attack line's keeps them apart; a re-entry may be snapped onto
            T.mine.forEach(m => { if (!m.line) T.all.push(m.t); if (!m.entry) T.re.push(m.t); });
            T.all.sort((a, b) => a - b); T.re.sort((a, b) => a - b);
        }
    });
    notes.sort((a, b) => a.start - b.start || a.lane - b.lane || a.seat - b.seat);
    const out = { t0: bounds[0], end: end, total: r3(end - bounds[0]), bounds: bounds, change: R.change, breath: B, players: players, notes: notes };
    if (T) out.dealt = order.map(p => p.key);   // the order of the deal — the first is the leader
    return out;
}

return { generate, validate, keyChord, striationPhase, STRIATIONS, CHANGES, AS_DEALT, DEFAULT_BREATH,
         NUMBERS: { MIN_GAP_S, MAX_SEG_HARD_S, MIN_BREATH_S, RUNT_S, FIXED_LEN_S, WAIT_MAX_S } };
}));
