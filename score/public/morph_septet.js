// morph_septet.js — THE MORPH PANEL'S CAST AND PITCH SOURCE FOR THE SEPTET (2026-09-07, RUNNING_LOG §197–207; MORPH_NOTES §3; CN-37, CN-38).
//
// The tuba piece's morph engine (morph.js) maps voices 1:1 onto lanes 0 … n−1 and carries the tuba's constants; this module puts
// the septet in front of it without touching how it schedules: PAIRS. A pair is two seats (lanes) — the default cast Vc + Va low,
// Vn1 + Vn2 in the middle, Fl + BCl on top (his word; the piano out, CN-34) — and takes two adjacent pitches of the model's set
// (a doubled pitch in BLOOM, two that close to one in CONVERGE, two chord notes in BALANCE). From the cast it derives what the
// engine needs: the source (and target) pitches FOLDED so both players of a pair hold theirs (D26: the pair moves by octaves as one
// unit, a tie down; no octave serving both → the pair is silent and says so), the `lanes` list in pitch order, and the PALETTE per
// voice (the player's ordinary voice, its measured range, its bend reach = the smaller of a whole tone — his word, §199 — and the
// sampler's measured range, the breath or bow ceiling) that morph.js takes as `opts.palette`.
//
// THE PITCH SOURCE (§205–207): a sonority (the harmony list, a kept set, a model's set, a stack or a Messiaen mode from a root) is
// reduced to the pairs' notes by a named TAKE rule — lowest · highest · spread · by register · consecutive from k · every other ·
// random (seed) — doubled (one note per pair) or two per pair (adjacent or spread pairs); then `deriveParams` writes them into the
// model's params (CONVERGE opens each note a whole tone and closes onto it; SPECTRAL's fundamental is the root).
// Pure: no DOM, no MIDI; loads on the page (window.MorphSeptet) and in node (module.exports) for tools/morph_septet_check.js.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.MorphSeptet = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const MORPH_PLAYER_ST = 2;                        // a whole tone: "well within the range for any player … with their embouchure" (§199)
const SHIFTS = [0, -12, 12, -24, 24, -36, 36];    // the fold's tries: as written, then a tie DOWN (§180), by octaves
const DEFAULT_PAIRS = [{ a: 6, b: 5 }, { a: 3, b: 4 }, { a: 0, b: 1 }];   // Vc + Va · Vn1 + Vn2 · Fl + BCl (CN-37)
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const FLATS = { 'DB': 1, 'EB': 3, 'GB': 6, 'AB': 8, 'BB': 10, 'CB': 11, 'FB': 4 };
// a note name ('F2', 'C#4', 'Db4', 'bb3') or a number → MIDI; null when unreadable. A bare pitch class ('D#') takes the octave
// nearest `ref` (his "D#" in the root box, 2026-09-07 late — the octave he did not type is the one the model already sits in)
function parseNote(s, ref) {
    if (s == null) return null;
    if (typeof s === 'number') return isFinite(s) ? Math.round(s) : null;
    const t = String(s).trim();
    if (!t) return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Math.round(+t);
    const m = t.toUpperCase().match(/^([A-G])([#B]?)(-?\d)?$/);
    if (!m) return null;
    let pc = NAMES.indexOf(m[1]);
    if (m[2] === '#') pc += 1;
    else if (m[2] === 'B') pc -= 1;
    pc = ((pc % 12) + 12) % 12;
    if (m[3] != null) return (Number(m[3]) + 1) * 12 + pc;
    const r = (ref != null && isFinite(ref)) ? ref : 48;
    let best = null;
    for (let k = 0; k <= 10; k++) { const midi = k * 12 + pc; if (best === null || Math.abs(midi - r) < Math.abs(best - r)) best = midi; }
    return best;
}

// the lanes that may hold a morph voice: every track whose recipe bends (the piano's `beating: false` keeps it out)
function bendingLanes(env) {
    const out = [];
    (env.tracks || []).forEach((t, i) => { const I = env.recipe[t.instKey]; if (I && I.beating !== false && (I.playerBendSt == null || I.playerBendSt > 0)) out.push(i); });
    return out;
}
function instOf(env, lane) { const t = env.tracks[lane]; return t ? t.instKey : null; }
function labelOf(env, lane) { const t = env.tracks[lane]; return t ? (t.short || t.label || String(lane)) : String(lane); }

// one voice's palette entry for a lane
function paletteFor(env, lane) {
    const BC = env.BC, key = instOf(env, lane), I = key && env.recipe[key];
    if (!I) return null;
    const voice = BC.ordinaryVoice(env.recipe, key), range = BC.ordinaryRange(env.recipe, key) || [I.rangeLow, I.rangeHigh];
    const samplerSt = I.bendRangeSt || 2;
    return {
        lane: lane, instKey: key, label: labelOf(env, lane),
        technique: voice ? voice.key : (I.ordinary || 'ord'),
        lo: range[0], hi: range[1],
        reachCents: Math.round(Math.min(MORPH_PLAYER_ST, samplerSt) * 100),
        samplerSt: samplerSt,
        ceiling: level01 => BC.ceilingFor(key, level01).seconds,
        gapS: BC.ceilingFor(key, 0.5).gapS,
        kind: BC.ceilingFor(key, 0.5).kind,
    };
}

// the range both players of a pair hold (their ordinary ranges' overlap), or null
function pairRange(env, a, b) {
    const BC = env.BC, ra = BC.ordinaryRange(env.recipe, instOf(env, a)), rb = BC.ordinaryRange(env.recipe, instOf(env, b));
    if (!ra || !rb) return null;
    const lo = Math.max(ra[0], rb[0]), hi = Math.min(ra[1], rb[1]);
    return lo <= hi ? [lo, hi] : null;
}

// D26: the fold of a pair as ONE unit — the octave shift under which seat a holds every note in notesA and seat b every note in
// notesB (the pair's notes, and for CONVERGE their targets); as written first, then down, then up; null when no octave serves both
function foldPair(env, instA, instB, notesA, notesB) {
    const BC = env.BC;
    for (const sh of SHIFTS) {
        const okA = notesA.every(n => BC.holds(env.recipe, instA, n + sh));
        const okB = notesB.every(n => BC.holds(env.recipe, instB, n + sh));
        if (okA && okB) return sh;
    }
    return null;
}

// THE CAST: params (the model's, resolved and nudged) + pairs [{ a, b, on }] → the engine's params and palette, and the pairs' story
function cast(params, pairsIn, env) {
    const M = env.M, warnings = [];
    const pairs = (pairsIn && pairsIn.length ? pairsIn : DEFAULT_PAIRS).map((p, i) => ({ i: i, a: p.a, b: p.b, on: p.on !== false }));
    const P = JSON.parse(JSON.stringify(params || {}));
    const src0 = (P.source && P.source.kind !== 'vert' && Array.isArray(P.source.midi)) ? P.source.midi.slice().sort((x, y) => x - y) : [];
    if (P.source && P.source.kind === 'vert') warnings.push('CAST: a chord by id (source.kind vert) is not resolved by the panel — give pitches');
    const want = pairs.length * 2;
    const src = (src0.length > want && M && M.reduceSource) ? M.reduceSource(src0, want) : src0;   // the tuba's eight → six, whole clusters kept
    if (src0.length > want) warnings.push('CAST: ' + src0.length + ' pitches for ' + pairs.length + ' pairs — reduced to ' + src.length + ' (whole clusters kept)');
    const tgt = (P.target && Array.isArray(P.target.midi)) ? P.target.midi.slice().sort((x, y) => x - y) : null;
    const voices = [];
    pairs.forEach(p => {
        const nA = src[2 * p.i], nB = src[2 * p.i + 1];
        p.notesIn = [nA, nB]; p.shift = null; p.silent = true; p.why = '';
        const iA = instOf(env, p.a), iB = instOf(env, p.b);
        if (nA == null || nB == null) { p.why = 'no pitches for this pair in the set'; return; }
        if (!iA || !iB) { p.why = 'a seat without a player'; return; }
        const tA = tgt ? tgt[2 * p.i] : null, tB = tgt ? tgt[2 * p.i + 1] : null;
        const sh = foldPair(env, iA, iB, tA != null ? [nA, tA] : [nA], tB != null ? [nB, tB] : [nB]);
        if (sh == null) { p.why = 'no octave serves ' + labelOf(env, p.a) + ' + ' + labelOf(env, p.b) + ' for ' + nm(nA) + ' · ' + nm(nB); warnings.push('CAST: pair ' + (p.i + 1) + ' silent — ' + p.why); return; }
        p.shift = sh; p.silent = false;
        p.notesOut = [nA + sh, nB + sh];
        p.targetsOut = tgt ? [tA + sh, tB + sh] : null;
        voices.push({ pitch: nA + sh, lane: p.a, pair: p.i, tgt: tA != null ? tA + sh : null });
        voices.push({ pitch: nB + sh, lane: p.b, pair: p.i, tgt: tB != null ? tB + sh : null });
    });
    voices.sort((x, y) => x.pitch - y.pitch);           // the engine's voice order is by pitch; the lanes follow it
    voices.forEach((v, k) => { v.voice = k; });
    pairs.forEach(p => { p.voices = voices.filter(v => v.pair === p.i).map(v => v.voice); });
    // pairs that interleave in pitch confuse a model that pairs by sorted order (CONVERGE's targets) — said, not fixed
    for (let k = 0; k + 1 < voices.length; k++) {
        const a = voices[k], b = voices[k + 1];
        if (a.pair !== b.pair) {
            const pa = pairs[a.pair], pb = pairs[b.pair];
            const inside = (pa.notesOut[0] < pb.notesOut[1] && pb.notesOut[0] < pa.notesOut[1]);
            if (inside) warnings.push('CAST: pairs ' + (a.pair + 1) + ' and ' + (b.pair + 1) + ' interleave in pitch (' + pa.notesOut.map(nm).join('·') + ' / ' + pb.notesOut.map(nm).join('·') + ') — the model pairs by pitch order');
        }
    }
    P.source = { kind: 'pitches', midi: voices.map(v => v.pitch) };
    if (tgt) P.target = Object.assign({}, P.target, { midi: voices.map(v => v.tgt).filter(t => t != null) });
    P.lanes = voices.map(v => v.lane);
    P.voices = voices.length;
    const palette = voices.map(v => paletteFor(env, v.lane));
    return { params: P, pairs: pairs, voices: voices, palette: palette, warnings: warnings };
}

// the render heard or inserted: only the voices of the ticked pairs (the render itself is of every pair — a pair alone is heard in
// its place, and an inserted pair keeps its timing)
function filterResult(result, castInfo) {
    if (!result || !castInfo) return result;
    const keep = new Set();
    castInfo.pairs.forEach(p => { if (p.on && !p.silent) p.voices.forEach(v => keep.add(v)); });
    const notes = result.notes.filter(n => keep.has(n.voice));
    return Object.assign({}, result, { notes: notes, meta: Object.assign({}, result.meta, { heardVoices: Array.from(keep).sort((a, b) => a - b) }) });
}

// a seat changed: the player chosen takes the seat, and whoever sat there takes the player's old seat (every player sits once)
function swapSeat(pairs, k, seat, lane) {
    const P = pairs.map(p => ({ a: p.a, b: p.b, on: p.on !== false }));
    const was = P[k][seat];
    if (was === lane) return P;
    let other = null;
    P.forEach((p, i) => { ['a', 'b'].forEach(s => { if (p[s] === lane) other = { i: i, s: s }; }); });
    P[k][seat] = lane;
    if (other) P[other.i][other.s] = was;
    return P;
}

function describePair(env, p) {
    const seats = labelOf(env, p.a) + ' + ' + labelOf(env, p.b);
    if (p.silent) return seats + ' · ✕ ' + (p.why || 'silent');
    const asIn = p.notesIn.map(nm).join(' · ');
    const mark = p.shift ? ' → ' + p.notesOut.map(nm).join(' · ') + (p.shift > 0 ? ' ↑' : ' ↓') : '';
    return seats + ' · ' + asIn + mark;
}

// ===========================================================================================================================
// THE PITCH SOURCE (§205–207)
// ===========================================================================================================================

// the families from a root: stacks of one interval (six notes up from the root) and Messiaen's seven modes of limited
// transposition (their degrees up from the root over two octaves, so every pair's register holds some of them)
const STACKS = [
    { id: 'stack-p5', name: 'stack of 5ths', step: 7 }, { id: 'stack-p4', name: 'stack of 4ths', step: 5 },
    { id: 'stack-M3', name: 'stack of major 3rds', step: 4 }, { id: 'stack-m3', name: 'stack of minor 3rds', step: 3 },
    { id: 'stack-M2', name: 'stack of whole tones', step: 2 }, { id: 'stack-m2', name: 'stack of semitones', step: 1 },
];
const MODES = [
    { id: 'mode-1', name: 'Messiaen mode 1 (whole-tone)', steps: [2, 2, 2, 2, 2, 2] },
    { id: 'mode-2', name: 'Messiaen mode 2 (octatonic)', steps: [1, 2, 1, 2, 1, 2, 1, 2] },
    { id: 'mode-3', name: 'Messiaen mode 3', steps: [2, 1, 1, 2, 1, 1, 2, 1, 1] },
    { id: 'mode-4', name: 'Messiaen mode 4', steps: [1, 1, 3, 1, 1, 1, 3, 1] },
    { id: 'mode-5', name: 'Messiaen mode 5', steps: [1, 4, 1, 1, 4, 1] },
    { id: 'mode-6', name: 'Messiaen mode 6', steps: [2, 2, 1, 1, 2, 2, 1, 1] },
    { id: 'mode-7', name: 'Messiaen mode 7', steps: [1, 1, 1, 2, 1, 1, 1, 1, 2, 1] },
];
function stackNotes(step, rootMidi, count) { const out = []; for (let k = 0; k < (count || 6); k++) out.push(rootMidi + k * step); return out; }
function modeNotes(steps, rootMidi, octaves) {
    const out = [rootMidi]; let m = rootMidi;
    for (let o = 0; o < (octaves || 2); o++) steps.forEach(s => { m += s; out.push(m); });
    return out;
}
// a family id + a root → the sonority
function familyNotes(id, rootMidi) {
    const st = STACKS.find(s => s.id === id); if (st) return stackNotes(st.step, rootMidi);
    const md = MODES.find(s => s.id === id); if (md) return modeNotes(md.steps, rootMidi);
    return null;
}

// THE TAKE RULES: a sorted sonority → the indices taken (n = 3 for one note per pair, 6 for two per pair)
const TAKES = [
    { id: 'byRegister', name: 'by register' }, { id: 'lowest', name: 'lowest' }, { id: 'highest', name: 'highest' },
    { id: 'spread', name: 'spread' }, { id: 'fromK', name: 'consecutive from k' }, { id: 'everyOther', name: 'every other' },
    { id: 'random', name: 'random (seed)' },
];
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function takeIndices(sorted, n, rule, opts) {
    const N = sorted.length, o = opts || {};
    if (!N) return [];
    if (N <= n) return sorted.map((x, i) => i);
    const clampI = i => Math.max(0, Math.min(N - 1, i));
    switch (rule) {
        case 'lowest': return Array.from({ length: n }, (x, i) => i);
        case 'highest': return Array.from({ length: n }, (x, i) => N - n + i);
        case 'spread': { const idx = []; for (let k = 0; k < n; k++) idx.push(clampI(Math.round((k * (N - 1)) / (n - 1)))); return Array.from(new Set(idx)); }
        case 'fromK': { const k0 = clampI((o.k || 1) - 1); const idx = []; for (let k = 0; k < n; k++) idx.push(clampI(k0 + k)); return Array.from(new Set(idx)); }
        case 'everyOther': { const k0 = clampI((o.k || 1) - 1); const idx = []; for (let k = 0; k < n; k++) idx.push(clampI(k0 + 2 * k)); return Array.from(new Set(idx)); }
        case 'random': {
            const rnd = mulberry32((o.seed || 1) * 2654435761 >>> 0); const pool = sorted.map((x, i) => i); const idx = [];
            while (idx.length < n && pool.length) idx.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
            return idx.sort((a, b) => a - b);
        }
        case 'byRegister':
        default: {
            // the set in n bands by index (low … high); from each band the note held as written by the band's pair when one is
            // (o.holds(bandIndex, midi) says), else the band's middle
            const idx = [];
            for (let k = 0; k < n; k++) {
                const lo = Math.floor((k * N) / n), hi = Math.max(lo, Math.floor(((k + 1) * N) / n) - 1);
                let pick = null;
                if (o.holds) { const mid = (lo + hi) / 2; let best = null; for (let i = lo; i <= hi; i++) { if (o.holds(k, sorted[i])) { const d = Math.abs(i - mid); if (best === null || d < best.d) best = { i: i, d: d }; } } if (best) pick = best.i; }
                if (pick === null) pick = Math.round((lo + hi) / 2);
                idx.push(pick);
            }
            return idx;
        }
    }
}
// the sonority → the pairs' notes: perPair 1 = one note per pair, doubled; 2 = two per pair — adjacent (1-2 · 3-4 · 5-6) or spread
// (1-4 · 2-5 · 3-6). Returns { notes (the six for the engine, in pair order low → high), taken (the indices), dropped (the notes not taken) }
function takeForPairs(sonority, nPairs, rule, opts) {
    const o = opts || {}, perPair = o.perPair === 2 ? 2 : 1;
    const sorted = sonority.slice().sort((a, b) => a - b);
    const n = nPairs * perPair;
    const idx = takeIndices(sorted, n, rule, o);
    const chosen = idx.map(i => sorted[i]);
    const dropped = sorted.filter((x, i) => idx.indexOf(i) < 0);
    let notes = [];
    if (perPair === 1) chosen.forEach(m => notes.push(m, m));
    else if (o.pairing === 'spread') { const half = Math.ceil(chosen.length / 2); for (let k = 0; k < half; k++) { notes.push(chosen[k]); if (chosen[k + half] != null) notes.push(chosen[k + half]); } }
    else notes = chosen.slice();
    return { notes: notes, taken: chosen, dropped: dropped, sorted: sorted };
}

// the notes into the model's params: the source (and, for CONVERGE, the opening a whole tone around each note closing onto it;
// for SPECTRAL the fundamental = the root). `notes` is the pair-ordered list from takeForPairs (pairs of two).
function deriveParams(params, notes, opts) {
    const o = opts || {}, P = JSON.parse(JSON.stringify(params || {}));
    const model = P.model;
    if (model === 'M3' && P.target && (o.perPair || 1) === 1) {
        // each pair opens a whole tone apart and closes onto its note (the tuba's CONVERGE: 45,47 → 46,46). The engine pairs voices
        // by SORTED pitch, so two pairs closer than a minor third would interleave when both open a semitone each way: such a pair
        // opens on ONE side only (the side with room), or stays a unison when it has none — said in opts.warnings
        const src = [], tgt = [], ms = [];
        for (let k = 0; k + 1 < notes.length; k += 2) ms.push(notes[k]);
        ms.forEach((m, i) => {
            const below = i > 0 ? m - ms[i - 1] : Infinity, above = i + 1 < ms.length ? ms[i + 1] - m : Infinity;
            let lo = m - 1, hi = m + 1;
            if (below < 3 || above < 3) {
                if (below >= 2 && (above < 2 || below >= above)) { lo = m - 1; hi = m; }
                else if (above >= 2) { lo = m; hi = m + 1; }
                else { lo = m; hi = m; }
                if (o.warnings) o.warnings.push('PITCH: pair ' + (i + 1) + ' on ' + nm(m) + ' is within a whole tone of its neighbour — CONVERGE opens it ' + (lo === hi ? 'not at all (a held unison)' : 'on one side only'));
            }
            src.push(lo, hi); tgt.push(m, m);
        });
        P.source = { kind: 'pitches', midi: src }; P.target = Object.assign({}, P.target, { midi: tgt });
    } else if (model === 'M3' && P.target) {
        // two per pair: the pair's two notes close onto their mean
        const src = [], tgt = [];
        for (let k = 0; k + 1 < notes.length; k += 2) { const a = notes[k], b = notes[k + 1], mid = Math.round((a + b) / 2); src.push(a, b); tgt.push(mid, mid); }
        P.source = { kind: 'pitches', midi: src }; P.target = Object.assign({}, P.target, { midi: tgt });
    } else {
        P.source = { kind: 'pitches', midi: notes.slice() };
    }
    if (model === 'M2' && o.root != null) P.target = Object.assign({}, P.target || {}, { fundamental: o.root });
    return P;
}

return { MORPH_PLAYER_ST, SHIFTS, DEFAULT_PAIRS, NAMES, nm, parseNote, bendingLanes, instOf, labelOf, paletteFor, pairRange, foldPair, cast, filterResult, swapSeat, describePair,
         STACKS, MODES, TAKES, stackNotes, modeNotes, familyNotes, takeIndices, takeForPairs, deriveParams };
}));
