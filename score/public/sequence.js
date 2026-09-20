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
//     waves:      { lengths { values, weights }, low, high, density, peak, seed }   — PLAN 1d.7, below; read only by a box whose dyn is 'waves'
//     edges:      { fadeIn, fadeInFrom, fadeOut, fadeOutTo, exit }                  — PLAN 1d.8, below: 0 s · 'niente' · 0 s · 'niente' · 'together'
//   }
//   and a container may carry its own `change` — how THAT box is entered; absent, the sequence's.
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
// A NOTE'S LEVEL IS BREAKPOINTS from the first day — `levels: [[0, level], [dur, level]]`, flat in a straight box — so the waves layer
// or a drawn curve later changes the numbers, not the shape of what this file returns.
//
// THE WAVES (PLAN 1d.7, RUNNING_LOG §109–§111 · §121–§122 · §128; his words LG-38 · LG-39). A box's dyn is a straight dynamic OR
// `'waves'`. Every player has a STREAM of swells of their own — dealt, seeded, out of step with the others from the first second —
// and a waves box READS it: a note there takes its level breakpoints from its player's stream over its own span.
//   the stream  a function of TIME ALONE, in seconds from the sequence's start (so a sequence moved in the score keeps its waves),
//               running under the whole sequence whether or not a box reads it — a box that steps out to a straight dynamic does
//               not restart it, and the next waves box picks each player's wave up where it has got to. Slots of lengths drawn
//               from the pool (time_containers.js, a third use); each slot a swell with probability `density`, else flat at
//               `low`; a swell is three points — `low` → `high` at `peak` of its length (± a little seeded jitter) → `low`.
//               The first slot began a random part of its length BEFORE the sequence did: nobody starts a swell on the downbeat.
//   low · high  two WRITTEN dynamics (ppp … fff). There is no niente inside the waves — his call, option A: the law has nothing
//               below ppp, and silence belongs to the sequence's EDGES (PLAN 1d.8).
//   the breath  owns the level (§103): a breath takes the MODE of the box it starts in and keeps it across a line.
//   the order   streams first (time alone), then breaths — a ceiling is read at the LOUDEST level the stream reaches anywhere the
//               note could extend to, so a wave can shorten a breath and never the reverse.
//   percussion  a fixed-length sound takes the wave's level at its strike; no ramp.
// With every box straight the notes are exactly what they were — the baseline gate again. The waves have a seed of their own.
//
// THE EDGES, AND A CHANGE RULE PER BOX (PLAN 1d.8, RUNNING_LOG §122–§127 · §131; his words LG-40 · LG-41 · LG-42).
//   per box     a container's `change` says how that box is ENTERED: 'attack' = everyone lands a breath before its line and starts AT
//               it, together · 'seamless' = each player takes it at their next breath. The two old rules are the two ends of ONE walk:
//               a player's SPAN begins where the player comes in — at an `attack` box (entry together, the striation moved into the
//               first breath's length) or after an absence or a rest (staggered) — and runs to the next `attack` line, a drop-out or
//               the end. Box 1's tag IS the beginning: "start together, then seamless" is box 1 flipped to `attack`.
//   exit        'together' = every last breath lands on the end (as always) · 'one by one' = each player lands on an end of their OWN,
//               the ends spread over the last stretch BEFORE the line (the fade-out's length, else one breath's) in score order, the
//               latest ON the line — his "everyone finishing their last breath … they'll end at different times".
//   the fades   `fadeIn` seconds from `fadeInFrom`, `fadeOut` seconds to `fadeOutTo` — each 'niente' or a written dynamic. THE FADE
//               FOLLOWS THE SHAPE: entries together (box 1 `attack`) or ends together → ONE window for everyone; staggered entries or
//               ends one by one → each player fades on THEIR OWN entry or ending. Two mechanisms, because the law has nothing below ppp:
//               NIENTE is the fader multiplied to zero — a note in the window carries `fade { start, end, from, to, curve }` (absolute
//               seconds; the score's cc7Fade, true silence) · a WRITTEN DYNAMIC is a ramp in the note's own LEVEL breakpoints,
//               `level = far + (what lies under it − far) · u` — over a straight box or a wave alike, and the far end may be LOUDER
//               than the box (the ceiling is read there). A strike cannot ramp: it takes the fade's weight at its strike.
//   Only the players of the first sounding box fade in, and only those of the last fade out or leave one by one.
// With no box flipped, no fades and `exit` together, the notes are exactly what they were — the gate, once more.
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
const WAVES = 'waves';   // a box's dyn: read the player's stream of swells instead of holding a straight dynamic (1d.7)
const DEFAULT_WAVES = { lengths: { values: [6, 10, 16], weights: null }, low: 'pp', high: 'mf', density: 0.7, peak: 0.5, seed: 1 };   // §109's recommendation
const WAVE_PEAK_JITTER = 0.1;    // a swell's top wanders this far (of its length) round `peak`, seeded
const NIENTE = 'niente', EXITS = ['together', 'one by one'];   // the edges (1d.8)
const DEFAULT_EDGES = { fadeIn: 0, fadeInFrom: NIENTE, fadeOut: 0, fadeOutTo: NIENTE, exit: 'together' };
const FADE_CURVE = 'linear';     // the niente fade's weight, start to end (morph.js curveEase) — a number for his ear
const RAMP_STEP_S = 0.5;         // a fade to a dynamic over a WAVE is two lines multiplied: sampled this often inside the window

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
        if (c && c.change != null && CHANGES.indexOf(c.change) < 0) msgs.push(at + 'change must be "attack" or "seamless" — got ' + JSON.stringify(c.change));
        if (c && c.chord === null) return;   // PLAN 1d.4: a REST — deliberate silence for its duration; nothing else to check
        if (!c || !Array.isArray(c.chord) || !c.chord.length) { msgs.push(at + 'an empty chord — choose a take for it, or make it a rest (chord: null)'); return; }
        const dyn = c.dyn == null ? AS_DEALT : c.dyn, named = dyn !== AS_DEALT && dyn !== WAVES;
        if (named && !ladder) msgs.push(at + 'dyn "' + dyn + '" needs the drawer\'s ladder (dyn_ui.js StrikeDyn) and it is not loaded');
        else if (named && ladder.NAMES.indexOf(dyn) < 0) msgs.push(at + 'dyn "' + dyn + '" is not on the ladder ' + ladder.NAMES.join(' '));
        c.chord.forEach((n, j) => {
            const nat = at + 'note ' + (j + 1) + ': ';
            if (!n || !Number.isInteger(n.lane) || n.lane < 0) { msgs.push(nat + 'no lane'); return; }
            if (!isFinite(+n.midi)) msgs.push(nat + 'no pitch');
            if (!n.inst) msgs.push(nat + 'no instrument key (inst)');
            if (dyn === AS_DEALT && n.level == null && (n.vel == null || !ladder)) msgs.push(nat + '"as dealt" needs the note\'s own level (level 0–1, or vel with the ladder loaded)');
        });
    });
    if (C.every(c => c && c.chord === null)) msgs.push('every container is a rest — give one a chord');
    // 1d.8: the edges
    if (R.edges != null) {
        const E = Object.assign({}, DEFAULT_EDGES, R.edges);
        if (EXITS.indexOf(E.exit) < 0) msgs.push('edges.exit must be "together" or "one by one" — got ' + JSON.stringify(E.exit));
        [['fadeIn', 'fadeInFrom'], ['fadeOut', 'fadeOutTo']].forEach(k => {
            if (!(+E[k[0]] >= 0) || !isFinite(+E[k[0]])) msgs.push('edges.' + k[0] + ' must be 0 s or more');
            else if (+E[k[0]] > 0 && E[k[1]] !== NIENTE && !(ladder && ladder.NAMES.indexOf(E[k[1]]) >= 0)) msgs.push('edges.' + k[1] + ' must be "niente" or a dynamic on the ladder' + (ladder ? ' ' + ladder.NAMES.join(' ') : ' (dyn_ui.js is not loaded)') + ' — got ' + JSON.stringify(E[k[1]]));
        });
    }
    // 1d.7: the waves' dials are read only when a box reads the waves
    if (C.some(c => c && c.dyn === WAVES && c.chord !== null)) {
        const W = Object.assign({}, DEFAULT_WAVES, R.waves || {}), L = W.lengths || {};
        if (!ladder) msgs.push('waves need the drawer\'s ladder (dyn_ui.js StrikeDyn) for `low` and `high`, and it is not loaded');
        else if (ladder.NAMES.indexOf(W.low) < 0 || ladder.NAMES.indexOf(W.high) < 0) msgs.push('waves.low and waves.high must be on the ladder ' + ladder.NAMES.join(' ') + ' — got ' + JSON.stringify(W.low) + ' and ' + JSON.stringify(W.high));
        else if (!(ladder.ANCHOR[W.low] < ladder.ANCHOR[W.high])) msgs.push('waves.low (' + W.low + ') must be below waves.high (' + W.high + ')');
        if (!Array.isArray(L.values) || !L.values.length || !L.values.every(x => isFinite(+x) && +x > 0)) msgs.push('waves.lengths needs values — seconds, each more than 0');
        else if (L.weights != null && (!Array.isArray(L.weights) || L.weights.length > L.values.length)) msgs.push('waves.lengths.weights must be one weight per value, or none');
        if (!(+W.density >= 0 && +W.density <= 1)) msgs.push('waves.density must be 0 … 1');
        if (!(+W.peak >= 0 && +W.peak <= 1)) msgs.push('waves.peak must be 0 … 1');
        if (!poolOf(ctx)) msgs.push('waves need time_containers.js and it is not loaded');
    }
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
// a stream of lengths out of a pool — the time container generator, rolled a stretch at a time. `tag` names whose stream it is
// (a player's breaths in one span · a player's swells), so every stream is its own and all come from the one seed handed in
function poolStream(TCm, pool, seed, tag) {
    const base = ((hashStr(tag) ^ Math.imul((seed | 0) + 1, 2654435761)) >>> 0) % 2000000000;
    const total = Math.max(POOL_ROLL_S, 40 * Math.max.apply(null, pool.values));
    let buf = [], k = 0, n = 0;
    return function () {
        if (k >= buf.length) { buf = TCm.roll({ values: pool.values, weights: pool.weights, unit: 1, total: total, seed: 1 + base + n++ }).seq; k = 0; }
        return buf.length ? buf[k++] : null;
    };
}

// ---- the waves (PLAN 1d.7): one stream of swells per player — breakpoints [seconds from the sequence's start, level 0–1] ----
function buildStream(TCm, W, key, until) {
    const rng = rngFor(W.seed, key + '~waves', 0), draw = poolStream(TCm, W.pool, W.seed, key + '~swells');
    let len = draw(), swells = 0, flats = 0;
    if (len == null) return { points: [[0, W.lo], [r3(until), W.lo]], swells: 0, flats: 0 };
    let t = -rng() * len;   // out of step from the first second: the first slot began before the sequence did
    const pts = [[t, W.lo]];
    while (t < until && len != null) {
        const isSwell = rng() < W.density, pj = rng();   // always two draws a slot
        if (isSwell) { const pk = Math.max(0.1, Math.min(0.9, W.peak + (pj * 2 - 1) * WAVE_PEAK_JITTER)); pts.push([t + pk * len, W.hi]); swells++; } else flats++;
        t += len; pts.push([t, W.lo]);
        len = draw();
    }
    return { points: pts.map(p => [r3(p[0]), p[1]]), swells: swells, flats: flats };
}
function levelAt(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    const last = pts[pts.length - 1]; if (x >= last[0]) return last[1];
    let a = 0, b = pts.length - 1; while (b - a > 1) { const m = (a + b) >> 1; if (pts[m][0] <= x) a = m; else b = m; }
    const p = pts[a], q = pts[b]; return p[1] + (q[1] - p[1]) * ((x - p[0]) / Math.max(1e-9, q[0] - p[0]));
}
const r4 = v => Math.round(v * 10000) / 10000;
// the LOUDEST the stream gets inside [x0, x1] — where a ceiling is read
function peakOver(pts, x0, x1) { let m = Math.max(levelAt(pts, x0), levelAt(pts, x1)); pts.forEach(p => { if (p[0] > x0 && p[0] < x1 && p[1] > m) m = p[1]; }); return m; }
// a note's own breakpoints: the stream over [x0, x0 + dur], in seconds from the note's start
function sliceLevels(pts, x0, dur) {
    const out = [[0, r4(levelAt(pts, x0))]];
    pts.forEach(p => { if (p[0] > x0 + 0.001 && p[0] < x0 + dur - 0.001) out.push([r3(p[0] - x0), r4(p[1])]); });
    out.push([r3(dur), r4(levelAt(pts, x0 + dur))]);
    return out;
}

// ---- one span of one player's chain: breaths dealt from `from`, landing on `landAt` ----
// span = { from, to, landAt, entry: 'together' | 'staggered', idx }; `noteAt(t)` gives the container index and the player's note there.
// T is the `together` dial's state — null while the dial is FREE, and then nothing below differs from 1d.1.
function dealSpan(P, span, S, T) {
    const rng = rngFor(S.seed, P.key, span.idx), out = [];
    const draw = S.pool ? poolStream(S.TC, S.pool, S.seed, P.key + '@' + span.idx + '~lengths') : null;
    const phase0 = striationPhase(S.striation, P.index, S.nPlayers, 0);
    let t = span.from, first = true, moved = null;
    if (span.entry === 'staggered') t += Math.min(phase0 * S.length * 0.5, 0.25 * (span.to - span.from));   // a POSITIVE offset, and never past a short span
    if (T && T.p < 1 && span.entry === 'staggered') {   // a seamless first entry is the striation's: never snapped, but kept apart — moved LATER only
        const f = freeNear(t, t, Math.max(t, Math.min(span.from + 0.5 * (span.to - span.from), span.landAt - RUNT_S)), T.all, T.apart);
        if (f == null) moved = 'CROWDED'; else if (f > t + 1e-9) { t = f; moved = 'APART'; }
    }
    while (t < span.landAt - 0.02) {
        const ci = S.containerAt(t), srcs = S.plan[ci][P.key];
        // 1d.7: the breath takes the MODE of the box it starts in — a straight dynamic, or the player's stream of swells
        const waved = S.dyns[ci] === WAVES, stream = waved ? S.streams[P.key].points : null, x = t - S.bounds[0];
        const lvls = waved ? srcs.map(() => levelAt(stream, x)) : srcs.map(s => levelOf(s, S.dyns[ci], S.ladder));
        let loudest = Math.max.apply(null, lvls);   // the ceiling at the LOUDEST level: a straight note's own; under the waves, the most
        if (waved) { const far = noteInfo(S.BC, srcs[0].inst, loudest); if (!far.fixed) loudest = peakOver(stream, x, x + far.ceiling); }   // the stream reaches anywhere the note could extend to
        if (span.loud) { const far = noteInfo(S.BC, srcs[0].inst, loudest); span.loud.forEach(z => { if (!far.fixed && t < z.end && t + far.ceiling > z.start && z.level > loudest) loudest = z.level; }); }   // 1d.8: a fade whose far end is LOUDER than the box
        const info = noteInfo(S.BC, srcs[0].inst, loudest);
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
            const levels = (waved && !info.fixed) ? sliceLevels(stream, x, dur) : [[0, lvls[k]], [r3(dur), lvls[k]]];   // a fixed sound: the wave's level at its strike, no ramp
            const note = {
                player: P.key, lane: src.lane, seat: src.seat || 0, inst: src.inst, tech: src.tech, midi: src.midi, cents: src.cents || 0,
                partial: src.partial, container: ci, start: r3(t), end: r3(t + dur), dur: r3(dur), level: peakOf(levels), levels: levels,
                kind: info.kind, ceiling: isFinite(info.ceiling) ? info.ceiling : null, flags: f,
            };
            if (waved) note.waves = true;   // only on a note that read the waves — a straight note is byte for byte what it was
            out.push(note);
        });
        if (out.length >= MAX_NOTES_PER_SPAN) { out[out.length - 1].flags.push('SEGCAP'); break; }
        t = to != null ? to : t + period + gap; first = false;
    }
    return out;
}

// ---- the edges (PLAN 1d.8): one fade window laid over the notes of one player's span ----
// w = { start, end, dir: 'in' | 'out', level }: level null = NIENTE (the fader's multiplier — the note carries `fade`), else the written
// dynamic at the fade's far end (a ramp in the note's own level breakpoints)
function applyEdge(notes, w) {
    const len = Math.max(1e-6, w.end - w.start), u = t => Math.max(0, Math.min(1, (t - w.start) / len));
    notes.forEach(n => {
        if (!(n.start < w.end - 1e-9 && n.end > w.start + 1e-9)) return;
        const fixed = n.kind === 'fixed';
        if (w.level == null) {
            if (fixed) { const g = w.dir === 'in' ? u(n.start) : 1 - u(n.start); n.levels = n.levels.map(p => [p[0], r4(p[1] * g)]); n.level = peakOf(n.levels); }   // a strike cannot ramp: the weight at the strike
            else if (!n.fade) n.fade = { start: r3(w.start), end: r3(w.end), from: w.dir === 'in' ? 0 : 1, to: w.dir === 'in' ? 1 : 0, curve: FADE_CURVE };
            return;
        }
        const L = n.levels, at = x => { if (x <= L[0][0]) return L[0][1]; for (let i = 1; i < L.length; i++) if (x <= L[i][0]) { const p = L[i - 1], q = L[i]; return p[1] + (q[1] - p[1]) * ((x - p[0]) / Math.max(1e-9, q[0] - p[0])); } return L[L.length - 1][1]; };
        const mix = x => { const a = at(x), k = u(n.start + x); return r4(w.dir === 'in' ? w.level + (a - w.level) * k : a + (w.level - a) * k); };
        if (fixed) { const v = mix(0); n.levels = [[0, v], [L[L.length - 1][0], v]]; n.level = v; n.ramp = true; return; }
        const xs = L.map(p => p[0]), flat = L.every(p => p[1] === L[0][1]);
        [w.start - n.start, w.end - n.start].forEach(x => { if (x > 0.001 && x < n.dur - 0.001) xs.push(r3(x)); });
        if (!flat) for (let x = Math.max(0, w.start - n.start); x < Math.min(n.dur, w.end - n.start); x += RAMP_STEP_S) if (x > 0.001) xs.push(r3(x));   // two lines multiplied bend: sample it
        const ts = Array.from(new Set(xs)).sort((a, b) => a - b);
        n.levels = ts.map(x => [x, mix(x)]); n.level = peakOf(n.levels); n.ramp = true;
    });
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
    // 1d.7 — the streams FIRST: they depend on time alone. Dealt only when a box reads them; one per player, under the whole sequence
    let Wd = null, W = null, streams = null;
    if (R.containers.some(c => c.dyn === WAVES && c.chord !== null)) {
        Wd = Object.assign({}, DEFAULT_WAVES, R.waves || {});
        const hOf = name => clamp01((ladder.ANCHOR[name] - ladder.LO) / (ladder.HI - ladder.LO));
        W = { pool: { values: Wd.lengths.values.map(Number), weights: Wd.lengths.weights || null }, lo: hOf(Wd.low), hi: hOf(Wd.high), density: clamp01(+Wd.density), peak: clamp01(+Wd.peak), seed: Wd.seed | 0 };
        streams = {}; const TCm = poolOf(ctx);
        players.forEach(p => { streams[p.key] = buildStream(TCm, W, p.key, (end - bounds[0]) + MAX_SEG_HARD_S); });
    }
    const S = {
        seed: B.seed | 0, striation: B.striation, length: +B.length, jitter: clamp01(+B.jitter), nPlayers: players.length,
        BC: BC, ladder: ladder, plan: plan, dyns: dyns, bounds: bounds, pool: pool, TC: pool ? poolOf(ctx) : null, streams: streams,
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
            plan.forEach((m, ci) => { const s = m[p.key]; if (s) p.ceil = Math.min(p.ceil, noteInfo(BC, s[0].inst, dyns[ci] === WAVES ? W.hi : Math.max.apply(null, s.map(x => levelOf(x, dyns[ci], ladder)))).ceiling); });   // a waves box: at `high`, the loudest it can get
        });
        order = players.slice().sort((a, b) => (a.ceil - b.ceil) || (a.index - b.index));   // ∞ − ∞ is NaN, which falls through to the score order
    }

    // 1d.8 — how each box is ENTERED (its own `change`, else the sequence's), and the edges
    const tags = R.containers.map(c => (c.change != null ? c.change : R.change));
    const E = Object.assign({}, DEFAULT_EDGES, R.edges || {});
    const fin = Math.max(0, +E.fadeIn || 0), fout = Math.max(0, +E.fadeOut || 0), oneByOne = E.exit === 'one by one';
    const hName = name => clamp01((ladder.ANCHOR[name] - ladder.LO) / (ladder.HI - ladder.LO));
    const inLevel = (fin > 0 && E.fadeInFrom !== NIENTE) ? hName(E.fadeInFrom) : null, outLevel = (fout > 0 && E.fadeOutTo !== NIENTE) ? hName(E.fadeOutTo) : null;
    let firstBox = 0; while (firstBox < last && R.containers[firstBox].chord === null) firstBox++;
    let lastBox = last; while (lastBox > 0 && R.containers[lastBox].chord === null) lastBox--;
    const leavers = players.filter(p => !!plan[lastBox][p.key]);   // `exit: one by one` — in score order, the last of them ON the line

    const notes = [];
    order.forEach(p => {
        const has = i => i >= 0 && i <= last && !!plan[i][p.key];
        if (T) { T.mine = []; T.rng = rngFor(S.seed, p.key + '~together', 0); }
        // ONE WALK (1d.8): a span begins where the player comes in — at a box entered by `attack` (together; it lands a gap before that
        // line if it was playing) or after an absence or a rest (staggered) — and runs to the next `attack` line, a drop-out or the end.
        // Every box `attack` = a span a box; every box `seamless` = a span a run: the two rules 1d.1 began with, to the note.
        for (let i = 0; i <= last; i++) {
            if (!has(i)) continue;
            let j = i; while (has(j + 1) && tags[j + 1] !== 'attack') j++;
            const span = { from: bounds[i], to: bounds[j + 1], landAt: has(j + 1) ? bounds[j + 1] - gapOf(p, j) : bounds[j + 1], entry: tags[i] === 'attack' ? 'together' : 'staggered', idx: i };
            const fadesIn = fin > 0 && i === firstBox, leaves = j === lastBox;
            if (leaves && oneByOne && leavers.length > 1) {   // an end of its own, before the line; never past the middle of a short span
                const r = leavers.indexOf(p), off = (fout > 0 ? fout : S.length) * (leavers.length - 1 - r) / leavers.length;
                span.landAt = Math.max(span.landAt - off, span.from + 0.5 * (span.to - span.from));
            }
            if ((fadesIn && inLevel != null) || (leaves && outLevel != null)) {   // a far end LOUDER than the box: the ceiling is read there
                span.loud = [];
                if (fadesIn && inLevel != null) span.loud.push({ start: span.from, end: span.from + fin + 0.5 * S.length, level: inLevel });
                if (leaves && outLevel != null) span.loud.push({ start: span.landAt - fout, end: span.landAt, level: outLevel });
            }
            const got = dealSpan(p, span, S, T);
            // THE FADE FOLLOWS THE SHAPE: entries together → one window from the line; staggered → from this player's own entry. Ends
            // together → one window to the line; one by one → to this player's own ending (landAt is theirs already)
            if (fadesIn && got.length) { const s0 = span.entry === 'together' ? span.from : got[0].start; applyEdge(got, { start: s0, end: s0 + fin, dir: 'in', level: inLevel }); }
            if (leaves && fout > 0 && got.length) applyEdge(got, { start: span.landAt - fout, end: span.landAt, dir: 'out', level: outLevel });
            got.forEach(n => notes.push(n));
            i = j;
        }
        if (T) {   // what this player did is what the next ones move around: every start but an attack line's keeps them apart; a re-entry may be snapped onto
            T.mine.forEach(m => { if (!m.line) T.all.push(m.t); if (!m.entry) T.re.push(m.t); });
            T.all.sort((a, b) => a - b); T.re.sort((a, b) => a - b);
        }
    });
    notes.sort((a, b) => a.start - b.start || a.lane - b.lane || a.seat - b.seat);
    const out = { t0: bounds[0], end: end, total: r3(end - bounds[0]), bounds: bounds, change: R.change, breath: B, players: players, notes: notes };
    if (T) out.dealt = order.map(p => p.key);   // the order of the deal — the first is the leader
    if (streams) { out.waves = Wd; out.streams = streams; }   // the dials as dealt, and every player's stream (seconds from t0) — for the drawer, the check, the curious
    if (R.edges != null || R.containers.some(c => c.change != null)) { out.changes = tags; out.edges = E; }   // 1d.8: how each box is entered, and the edges as dealt
    return out;
}

return { generate, validate, keyChord, striationPhase, levelAt, STRIATIONS, CHANGES, EXITS, NIENTE, AS_DEALT, WAVES, DEFAULT_BREATH, DEFAULT_WAVES, DEFAULT_EDGES,
         NUMBERS: { MIN_GAP_S, MAX_SEG_HARD_S, MIN_BREATH_S, RUNT_S, FIXED_LEN_S, WAIT_MAX_S } };
}));
