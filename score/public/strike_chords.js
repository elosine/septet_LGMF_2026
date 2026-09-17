// strike_chords.js — THE CHORD ENGINE OF THE STRIKES DRAWER (PLAN 1k step 1; CN-44 … CN-47; RUNNING_LOG §234–249).
//
// His idea: "use the rhythms that are generated usually for one strike individual notes … but I'd like to make those onsets carry a
// cord or part of a cord … I want four players on this one or two players on that one and then the algorithm would shuffle so that no
// player has another impulse … 200 milliseconds"; and (CN-45) "me to put in the menu … the machine can solve how many players to put
// on each onset and how to scramble that".
//
// WHAT THIS MODULE IS: the onsets are given (the drawer's rhythm strip and its run make them, unchanged). This turns SETTINGS into a
// DEALT SEQUENCE — for every onset: the chord in play, the notes it takes, the players who take them (each note folded into that
// player's range by the caller's `realize`), and the flags. Two axes decided in the talk (CN-46):
//   · the SELECTION — which notes of the chord an onset takes: the drawer's voicing vocabulary (played · shuffle · high · low · spread)
//   · the ADVANCE  — when the next chord comes: exhaust it · stay n times (n a range) · a fresh chord every onset
// The PLAYERS PER ONSET is a range; the machine draws a count, then LOWERS it inside the range when too few players are free and flags
// only when even the minimum cannot be met (his (a), §237). A manual onset is pinned and flagged, never lowered (§238, step 3).
// The re-attack rule (his 200 ms) is checked against the real onset times — a guarantee, as the run's rule is today (§136).
//
// Pure: no DOM, no MIDI, no recipe. The caller injects `players` (each with its lane, technique and sounding range) and `realize`.
// Deterministic from the seed (mulberry32, the drawer's own). Loads on the page (window.StrikeChords) and in node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.StrikeChords = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const SELECTIONS = [
    ['played', 'as played'], ['shuffle', 'shuffle'], ['high', 'high cluster'], ['low', 'low cluster'], ['spread', 'spread'],
];
const ADVANCES = [
    ['exhaust', 'exhaust the chord'], ['times', 'n times each'], ['each', 'a fresh chord every onset'],
];
const ORDERS = [['turn', 'in turn'], ['shuffled', 'shuffled']];
const DEALERS = [['robin', 'round robin'], ['free', 'free']];

const DEFAULTS = {
    order: 'turn',            // the chord list in turn, or shuffled to completion and reshuffled
    advance: 'exhaust',       // exhaust · times · each
    timesMin: 2, timesMax: 4, // "cycle through each cord two to four times before moving on"
    selection: 'shuffle',     // which notes of the chord an onset takes
    countMin: 2, countMax: 4, // "two to four players each strike"
    // PLAN 1l step 3 (§256, §260): the rest is measured from the END of the player's last sound, not from its attack — the one rule
    // in the app. `soundMs` is how long one dealt sound lasts (a strike is short; a crescendo of 1o will pass its own length).
    reattackMs: 150,          // "next articulation for any one instrument will be 150ms after end"
    soundMs: 140,             // the length of one dealt sound (the drawer's own strike length)
    dealer: 'free',           // which free players are picked when more are free than needed
    seed: 1,
};

// the drawer's own generator (strike_drawer.js), so a seed means the same thing in both
function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function shuffled(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
}
const intIn = (rnd, lo, hi) => (hi <= lo ? lo : lo + Math.floor(rnd() * (hi - lo + 1)));
const centreOf = p => ((p.lo != null && p.hi != null) ? (p.lo + p.hi) / 2 : 60);

// THE SELECTION: k notes out of `avail` (already sorted ascending), by the drawer's voicing vocabulary
function select(avail, k, mode, rnd) {
    const n = avail.length;
    if (k >= n) return avail.slice();
    if (k <= 0) return [];
    switch (mode) {
        case 'played': return avail.slice(0, k);                                   // the chord's own order (what is left of it)
        case 'high': return avail.slice(n - k);
        case 'low': return avail.slice(0, k);
        case 'spread': {
            const out = [];
            for (let i = 0; i < k; i++) out.push(avail[Math.round((i * (n - 1)) / (k - 1 || 1))]);
            return Array.from(new Set(out)).slice(0, k);
        }
        default: return shuffled(avail, rnd).slice(0, k).sort((a, b) => a - b);     // 'shuffle'
    }
}

// THE CHORD SOURCE: the list in turn or shuffled (to completion, then reshuffled), with the advance policy and, for 'exhaust', the
// notes of the chord still unsounded
function chordSource(chords, o, rnd) {
    const list = chords.slice();
    let deck = [], idx = -1, cur = null, left = [], usesLeft = 0;
    const nextChord = () => {
        if (o.order === 'shuffled') { if (!deck.length) deck = shuffled(list.map((c, i) => i), rnd); idx = deck.pop(); }
        else idx = (idx + 1) % list.length;
        cur = list[idx];
        left = (cur.pitches || []).slice().sort((a, b) => a - b);
        usesLeft = o.advance === 'times' ? Math.max(1, intIn(rnd, o.timesMin, o.timesMax)) : 1;
    };
    nextChord();
    return {
        get chord() { return cur; },
        get index() { return idx; },
        // what this onset may choose from
        avail() { return o.advance === 'exhaust' ? left.slice() : (cur.pitches || []).slice().sort((a, b) => a - b); },
        // what the onset actually took, and the move to the next chord
        took(notes) {
            if (o.advance === 'exhaust') {
                const gone = new Set(notes);
                left = left.filter(p => !gone.has(p));
                if (!left.length) nextChord();
            } else if (o.advance === 'times') {
                usesLeft--;
                if (usesLeft <= 0) nextChord();
            } else nextChord();   // 'each'
        },
        exhaustedNow() { return o.advance === 'exhaust' && left.length === 0; },
    };
}

// THE DEAL — the heart. `onsets` in ms (any spacing); `chords` [{ id, name, pitches[] }]; `players` [{ lane, tech, lo, hi, label }];
// `realize(pitch, player)` → { midi, fold, standIn } (the caller's, the drawer's `realize`); `manual` { [onsetIndex]: { count?,
// chordId?, pitches?, players?[lane] } } pinned and flagged, never lowered.
function deal(onsets, chords, players, o, realize, manual) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const out = { events: [], summary: null, warnings: [] };
    const times = (onsets || []).map(Number).filter(t => isFinite(t)).sort((a, b) => a - b);
    if (!times.length) { out.summary = summarize(out.events, O, 'no onsets'); return out; }
    if (!chords || !chords.length) { out.summary = summarize(out.events, O, 'no chords in the list'); return out; }
    if (!players || !players.length) { out.summary = summarize(out.events, O, 'no players ticked'); return out; }

    const rnd = mulberry32((+O.seed || 1) * 7727 + 29);
    const src = chordSource(chords, O, rnd);
    const last = new Map();                         // lane → the ms at which its last sound ENDED (PLAN 1l step 3)
    const wait = (p, t) => (last.has(p.lane) ? t - last.get(p.lane) : Infinity);
    const soundMs = Math.max(0, +O.soundMs || 0);
    const markEnd = (lane, t) => last.set(lane, t + soundMs);
    const byLane = {}; players.forEach(p => { byLane[p.lane] = p; });
    const man = manual || {};

    times.forEach((t, i) => {
        const m = man[i] || man[String(i)] || null;
        const chord = (m && m.chordId != null) ? (chords.find(c => c.id === m.chordId) || src.chord) : src.chord;
        const ev = { i, t: Math.round(t * 1000) / 1000, chordId: chord ? chord.id : null, chordName: chord ? chord.name : '',
                     notes: [], wanted: 0, count: 0, lowered: false, flagged: false, manual: !!m, folds: 0, short: false };

        if (m) {
            // ---- a hand onset: pinned, checked, flagged, never lowered (§238) ----
            const pitches = (m.pitches && m.pitches.length) ? m.pitches.slice().sort((a, b) => a - b)
                          : select((chord && chord.pitches || []).slice().sort((a, b) => a - b), Math.max(1, +m.count || 1), O.selection, rnd);
            let chosen = (m.players && m.players.length) ? m.players.map(l => byLane[l]).filter(Boolean) : null;
            if (!chosen || !chosen.length) {
                const freeNow = players.filter(p => wait(p, t) >= O.reattackMs);
                chosen = pickPlayers(freeNow.length >= pitches.length ? freeNow : players, pitches.length, t, O, rnd, wait);
            }
            ev.wanted = pitches.length; ev.count = Math.min(pitches.length, chosen.length);
            ev.flagged = chosen.some(p => wait(p, t) < O.reattackMs) || chosen.length < pitches.length;
            assign(ev, pitches.slice(0, ev.count), chosen.slice(0, ev.count), realize);
            ev.notes.forEach(n => markEnd(n.lane, t));
            out.events.push(ev);
            if (!m.chordId) src.took(ev.notes.map(n => n.pitch));
            return;
        }

        // ---- the machine's onset ----
        const wanted = intIn(rnd, O.countMin, O.countMax);
        const free = players.filter(p => wait(p, t) >= O.reattackMs);
        let count = Math.min(wanted, free.length);
        if (free.length < O.countMin) { ev.flagged = true; count = free.length; }        // even the minimum cannot be met
        else if (count < wanted) ev.lowered = true;                                       // lowered inside his range (§237)
        const avail = src.avail();
        if (count > avail.length) { count = avail.length; ev.short = true; }               // the chord has less left than the count
        ev.wanted = wanted; ev.count = count;
        if (!count) { out.events.push(ev); if (!avail.length) src.took([]); return; }
        const notes = select(avail, count, O.selection, rnd);
        const chosen = pickPlayers(free, notes.length, t, O, rnd, wait);
        assign(ev, notes, chosen, realize);
        ev.notes.forEach(n => markEnd(n.lane, t));
        out.events.push(ev);
        src.took(notes);
    });

    out.summary = summarize(out.events, O, '');
    if (out.summary.flagged) out.warnings.push(out.summary.flagged + ' onset(s) could not keep the ' + O.reattackMs + ' ms rest — widen the gaps, lower the minimum, or add a player');
    return out;
}

// which free players take this onset: the dealer decides when more are free than needed (round robin = the longest idle first, the
// drawer's lap in spirit; free = a seeded random leaning toward whoever has waited longest, as the run's free dealer, §138)
function pickPlayers(free, k, t, O, rnd, wait) {
    if (free.length <= k) return free.slice();
    const pool = free.slice();
    const out = [];
    while (out.length < k && pool.length) {
        if (O.dealer === 'robin') {
            let best = 0;
            for (let j = 1; j < pool.length; j++) if (wait(pool[j], t) > wait(pool[best], t)) best = j;
            out.push(pool.splice(best, 1)[0]);
        } else {
            const ws = pool.map(p => { const w = wait(p, t); return (w === Infinity ? 1e6 : w) + 1; });
            const tot = ws.reduce((a, b) => a + b, 0);
            let r = rnd() * tot, pick = pool.length - 1;
            for (let j = 0; j < pool.length; j++) { r -= ws[j]; if (r <= 0) { pick = j; break; } }
            out.push(pool.splice(pick, 1)[0]);
        }
    }
    return out;
}

// the notes to the players BY REGISTER: the lowest note to the lowest-sitting player and up; each folded into its range by `realize`
function assign(ev, notes, chosen, realize) {
    const ns = notes.slice().sort((a, b) => a - b);
    const ps = chosen.slice().sort((a, b) => centreOf(a) - centreOf(b));
    ns.forEach((pitch, k) => {
        const p = ps[k]; if (!p) return;
        const rz = realize ? realize(pitch, p) : { midi: pitch, fold: 0, standIn: false };
        if (!rz) return;
        if (rz.fold) ev.folds++;
        ev.notes.push({ pitch: pitch, lane: p.lane, tech: p.tech, label: p.label || ('lane ' + p.lane), midi: rz.midi, fold: rz.fold || 0, standIn: !!rz.standIn });
    });
    ev.count = ev.notes.length;
}

function summarize(events, O, info) {
    const s = { onsets: events.length, notes: 0, lowered: 0, flagged: 0, manual: 0, short: 0, folds: 0, chords: 0, perPlayer: {}, info: info,
                countMin: O.countMin, countMax: O.countMax, reattackMs: O.reattackMs, seed: O.seed, selection: O.selection, advance: O.advance, order: O.order, dealer: O.dealer };
    const seen = new Set();
    events.forEach(e => {
        s.notes += e.notes.length;
        if (e.lowered) s.lowered++;
        if (e.flagged) s.flagged++;
        if (e.manual) s.manual++;
        if (e.short) s.short++;
        s.folds += e.folds;
        if (e.chordId != null) seen.add(e.chordId);
        e.notes.forEach(n => { s.perPlayer[n.lane] = (s.perPlayer[n.lane] || 0) + 1; });
    });
    s.chords = seen.size;
    return s;
}

// the rule as a fact, for the checks and the readout: the smallest REST of one player — from the end of its last sound to the next
// attack (PLAN 1l step 3; `soundMs` is how long one dealt sound lasts)
function tightest(events, soundMs) {
    const s = soundMs != null ? +soundMs : DEFAULTS.soundMs;
    const last = {}; let min = Infinity, where = null;
    events.forEach(e => e.notes.forEach(n => {
        if (last[n.lane] != null) { const g = e.t - last[n.lane]; if (g < min) { min = g; where = { lane: n.lane, t: e.t, gap: g }; } }
        last[n.lane] = e.t + s;
    }));
    return { ms: min === Infinity ? null : min, where: where };
}

function describe(res) {
    const s = res.summary;
    if (!s || !s.onsets) return (s && s.info) || 'nothing dealt';
    return s.onsets + ' onsets · ' + s.notes + ' notes · ' + s.chords + ' chord' + (s.chords === 1 ? '' : 's') +
        ' · ' + s.countMin + '–' + s.countMax + ' players, rest ' + s.reattackMs + ' ms' +
        (s.lowered ? ' · ' + s.lowered + ' lowered' : '') + (s.short ? ' · ' + s.short + ' short (the chord ran out)' : '') +
        (s.manual ? ' · ' + s.manual + ' by hand' : '') + (s.flagged ? ' · ✗ ' + s.flagged : '') + (s.folds ? ' · ' + s.folds + ' folded' : '');
}

return { SELECTIONS, ADVANCES, ORDERS, DEALERS, DEFAULTS, mulberry32, shuffled, select, chordSource, deal, pickPlayers, tightest, describe, summarize };
}));
