// fill_pitch.js — THE PITCH STRATEGIES OF THE FILLER (PLAN 1n step 2; CN-55; RUNNING_LOG §290, §294).
//
// His ask (CN-55): *"best different strategies and efficient access. So it could be [pitches] from the same strike harmony in order or
// shuffled or each a minor second offset from the previous [or] a fifth offset, etcetera, etcetera. or from a totally different pitch
// set. I just want to be able to choose from a variety of options and a variety of shuffles."*
//
// So the pitch is a STRATEGY, not a rule — and the point of the step is how many are within reach, not which one is right. Four families
// over one seeded order menu. **Almost all of it is reuse**: the sonority family IS 1m's harmony bar (`MorphPanel.pitchOptionGroups` /
// `sonorityOf`, 163 sets), the order IS 1k's deck (`Cresc.deckNext`), the octave fold IS 1k's rule (`Cresc.foldInto`). Genuinely new
// here: reading a named accent's pitch, the interval chain, and the vertical filter.
//
// A pitch that no octave of the player's range reaches ABORTS that long and is counted, never dropped in silence.
//
// The strategy gives a trill's LOWER note only; the interval stays the trill tool's own setting (CN-22's upper whole step by default).
// Worth knowing when he hears it: his own 44 trills at 135.78 s were every one a semitone.
//
// Pure: no DOM, no MIDI. The page (window.FillPitch) and node (module.exports).
(function (root, factory) {
    const api = factory(typeof require === 'function' && typeof module === 'object' ? require('./cresc.js') : root.Cresc);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.FillPitch = api;
}(typeof self !== 'undefined' ? self : this, function (Cresc) {
'use strict';

const FAMILIES = [
    ['accent',     'the accent\'s own pitch'],
    ['prevAccent', 'the attack before it'],
    ['nextAccent', 'the attack after it'],
    ['patternDeck','the pattern\'s pitches, dealt'],
    ['sonority',   'a harmony, dealt'],
    ['chain',      'an interval from the previous long'],
    ['vertical',   'the note the sounding longs are missing'],
];
const DIRECTIONS = [['up', 'up'], ['down', 'down'], ['alt', 'alternating']];

const DEFAULTS = {
    family: 'accent',
    order: 'turn',          // 'turn' · 'shuffled' · 'random' — 1k's deck, for any family that deals from a collection
    seed: 1,
    notes: [],              // the sonority: for 'sonority' and 'vertical' (from 1m's harmony bar; MorphPanel.sonorityOf gives it)
    from: '',               // that sonority's own name, for the provenance
    intervalSt: 1,          // 'chain': his minor second; 7 for the fifth
    direction: 'up',        // 'up' · 'down' · 'alt'
    startPitch: null,       // 'chain': null = the first accent's pitch
    // THE CHAIN'S BAND, and it is what makes a chain musical rather than a runaway (§299). Adding an interval over and over walks off the
    // keyboard — a fifth chain over 39 longs covers 273 semitones — and the octave fold cannot rescue it beyond eight octaves. So the
    // chain's running pitch is WRAPPED BY OCTAVES into a band CENTRED on its start, which is exactly what makes it a SPIRAL: the interval
    // is preserved in pitch class, and the register is then the player's own through the fold. Centred, not above, so a downward or an
    // alternating chain has room below the starting pitch.
    bandSt: 24,             // two octaves above the starting pitch
};

const r = x => Math.round(x);
const pc = m => ((m % 12) + 12) % 12;

// the player's sounding range, as the caller measured it: { [lane]: [lo, hi] }
function foldFor(raw, lane, ranges) {
    const R = (ranges || {})[lane];
    if (!R) return { pitch: r(raw), fold: 0 };
    return Cresc.foldInto(r(raw), R[0], R[1]);   // null when no octave reaches
}

// ASSIGN. `longs` from Fill.deal (in time order), `attacks` from Fill.attacksOf, `ranges` { lane: [lo, hi] }.
// Returns { longs (each with midi + pitch provenance), aborts } — the longs that could not be voiced are removed and counted.
function assign(longs, attacks, ranges, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const A = (attacks || []).slice().sort((a, b) => a.t - b.t);
    const byId = {}; A.forEach((a, i) => { byId[a.id] = { a, i }; });
    const L = (longs || []).slice().sort((x, y) => x.t0 - y.t0);
    const out = [], aborts = [];

    // the decks, for the families that deal
    let deck = { order: O.order, seed: Math.max(1, +O.seed || 1), drawn: 0, lap: 0 };
    const patternNotes = [...new Set(A.map(a => a.midi))].sort((a, b) => a - b);
    const sonority = (O.notes || []).slice();
    // the chain's running pitch, unfolded, so it walks: a minor-second chain over 43 longs covers three and a half octaves
    let chainAt = O.startPitch != null ? +O.startPitch : (A.length ? A[0].midi : 60);
    const chainBand = Math.max(12, +O.bandSt || 24);
    const chainLo = chainAt - Math.floor(chainBand / 2);   // CENTRED on the start, so a downward or alternating chain has room below it
    let chainStep = 0;
    // the vertical filter's memory: what is still sounding at this long's start
    const placed = [];

    L.forEach(x => {
        const src = byId[x.attackId];
        let raw = null, why = '', lap = deck.lap;
        switch (O.family) {
            case 'accent':     raw = src ? src.a.midi : null; why = 'its own accent'; break;
            case 'prevAccent': { const p = src && A[src.i - 1]; raw = p ? p.midi : (src ? src.a.midi : null); why = p ? 'the attack before' : 'its own accent (none before)'; break; }
            case 'nextAccent': { const n = src && A[src.i + 1]; raw = n ? n.midi : (src ? src.a.midi : null); why = n ? 'the attack after' : 'its own accent (none after)'; break; }
            case 'patternDeck': {
                const d = Cresc.deckNext(patternNotes, deck);
                if (!d) { aborts.push({ attackId: x.attackId, t: x.t0, why: 'noPitchSource' }); return; }
                deck = d.state; lap = d.lap; raw = d.pitch; why = 'the pattern\'s pitches'; break;
            }
            case 'sonority': {
                const d = Cresc.deckNext(sonority, deck);
                if (!d) { aborts.push({ attackId: x.attackId, t: x.t0, why: 'noPitchSource' }); return; }
                deck = d.state; lap = d.lap; raw = d.pitch; why = O.from || 'the harmony'; break;
            }
            case 'chain': {
                if (chainStep > 0) {
                    const dir = O.direction === 'down' ? -1 : O.direction === 'alt' ? (chainStep % 2 ? -1 : 1) : 1;
                    chainAt = chainAt + dir * Math.abs(+O.intervalSt || 1);
                    while (chainAt >= chainLo + chainBand) chainAt -= 12;   // the spiral: the interval kept, the register wrapped
                    while (chainAt < chainLo) chainAt += 12;
                }
                chainStep++;
                raw = chainAt;
                why = Math.abs(+O.intervalSt || 1) + ' st ' + O.direction + ' from the one before';
                break;
            }
            case 'vertical': {
                if (!sonority.length) { aborts.push({ attackId: x.attackId, t: x.t0, why: 'noPitchSource' }); return; }
                // what this long will sound WITH: everything placed that is still going at its start
                const sounding = new Set(placed.filter(p => p.t1 > x.t0 + 1e-9).map(p => pc(p.raw)));
                const missing = sonority.filter(n => !sounding.has(pc(n)));
                const pool = missing.length ? missing : sonority;      // the chord is complete: take any of it
                const d = Cresc.deckNext(pool, deck);
                if (!d) { aborts.push({ attackId: x.attackId, t: x.t0, why: 'noPitchSource' }); return; }
                deck = { order: deck.order, seed: deck.seed, drawn: 0, lap: deck.lap };   // the pool changes each time: never a stale index
                lap = d.lap; raw = d.pitch;
                why = (O.from || 'the harmony') + (missing.length ? ' — the note the chord was missing' : ' — the chord was complete');
                break;
            }
            default: raw = src ? src.a.midi : null; why = 'its own accent';
        }
        if (raw == null) { aborts.push({ attackId: x.attackId, t: x.t0, why: 'noPitchSource' }); return; }
        const f = foldFor(raw, x.lane, ranges);
        if (!f) { aborts.push({ attackId: x.attackId, t: x.t0, why: 'outOfRange', raw: r(raw) }); return; }
        out.push(Object.assign({}, x, {
            midi: f.pitch,
            pitch: { family: O.family, source: why, raw: r(raw), fold: f.fold, order: O.order, seed: O.seed, lap },
        }));
        placed.push({ t0: x.t0, t1: x.t1, raw: r(raw), midi: f.pitch });
    });
    return { longs: out, aborts };
}

// the readout for the drawer
function describe(o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const name = (FAMILIES.find(f => f[0] === O.family) || [O.family, O.family])[1];
    if (O.family === 'chain') return name + ' · ' + Math.abs(+O.intervalSt || 1) + ' st ' + O.direction + ' · wrapped inside ' + Math.max(12, +O.bandSt || 24) + ' st';
    if (O.family === 'sonority' || O.family === 'vertical') return name + ' · ' + (O.from || 'no harmony chosen') + ' · ' + O.order + ' (seed ' + O.seed + ')';
    if (O.family === 'patternDeck') return name + ' · ' + O.order + ' (seed ' + O.seed + ')';
    return name;
}

return { FAMILIES, DIRECTIONS, DEFAULTS, assign, describe, foldFor };
}));
