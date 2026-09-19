// spectrum.js — THE NATURAL HARMONIC SERIES AS A HARMONY (PLAN 1c.4, 2026-09-19; RUNNING_LOG §97). Pure: no DOM, no MIDI.
//
// His words (COMPOSITION_NOTES LG-32 / LG-34): *"I want to start with just the natural harmonic series. So I can type in a root and then
// the harmonics will appear in the keyboard … the notes for all the partials up here all the way up the keyboard from the bottom all 88
// keys and then where the notes are they should also indicate if their cents are added or not."*
//
//   partialsOf(fundMidi)      every partial p = 1, 2, 3 … whose nearest key is ≤ 108: { partial, midi (the nearest key), cents (the
//                             deviation from that key, −50 … +50), above (cents above the fundamental) }
//   isTempered(cents, tol)    |cents| ≤ tol — his tolerance: "let's say like five cents. Then that could be treated as a well-tempered
//                             note and still assigned to fixed pitch instruments"
//   label(note, tol)          "7 · −31¢", or "8" when the partial is tempered (the fundamental and its octaves are always exact)
//   makeStrike(fundMidi, id)  the harmony as a strike object with every field the drawer's select() reads (HarmSource.makeStrike's shape)
//                             — one simultaneity, the notes in partial order, each carrying `partial` and `cents`; `spectrum: true`
//
// `node tools/spectrum_check.js` checks the arithmetic against the textbook deviations.
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.Spectrum = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';
const TOP = 108, MAX_PARTIAL = 256, TOL = 5;
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

function partialsOf(fundMidi, top) {
    const f = Math.round(+fundMidi), T = top != null ? top : TOP, out = [];
    if (!isFinite(f)) return out;
    for (let p = 1; p <= MAX_PARTIAL; p++) {
        const above = 1200 * Math.log2(p);                  // cents above the fundamental
        const exact = f + above / 100;                       // in keys, fractional
        const midi = Math.round(exact);
        if (midi > T) break;
        const cents = Math.round((exact - midi) * 100 * 100) / 100;   // the fraction of a key × 100 = cents, −50 … +50, two decimals
        out.push({ partial: p, midi, cents, above: Math.round(above * 100) / 100 });
    }
    return out;
}
function isTempered(cents, tol) { return Math.abs(+cents || 0) <= (tol != null ? tol : TOL); }
function centsText(c) { const r = Math.round(c); return (r > 0 ? '+' : r < 0 ? '−' : '±') + Math.abs(r) + '¢'; }
function label(n, tol) { return String(n.partial) + (isTempered(n.cents, tol) && Math.round(n.cents) === 0 ? '' : ' · ' + centsText(n.cents)); }

// the strike object — the same shape HarmSource.makeStrike gives a harmony, so everything downstream treats it as one
function makeStrike(fundMidi, id, opts) {
    opts = opts || {};
    const f = Math.round(+fundMidi), P = partialsOf(f, opts.top);
    const vel = opts.vel != null ? opts.vel : 100, durMs = opts.durMs != null ? opts.durMs : 100;
    const notes = P.map((n, i) => ({ objectId: 'sp-' + f + '-' + n.partial, layer: 2, instKey: 'piano', midi: n.midi, technique: 'main',
                                     vel, durMs, dtMs: 0, dtNorm: 0, dtUnits: null, partial: n.partial, cents: n.cents }));
    const midis = P.map(n => n.midi).sort((a, b) => a - b);
    const pcs = [...new Set(midis.map(m => ((m % 12) + 12) % 12))].sort((a, b) => a - b);
    const name = 'partials of ' + nm(f), index = 'series@' + nm(f);
    return {
        id: id || ('sp:' + nm(f) + ':just'), synthetic: true, spectrum: true, fundamental: f,
        harm: { value: 'spectrum:just', root: nm(f), id: index, name, group: 'HARMONIC SERIES' },
        source: 'HARMONIC SERIES', index, t0: 0, tLast: 0, spanMs: 0, label: 'HARMONIC SERIES · ' + name,
        notes,
        harmony: { count: midis.length, midis, pcs, instKeys: ['piano'] },
        rhythm: { simultaneityMs: 60, onsetsMs: [0], onsetsNorm: [0], onsetsUnits: [null], gapsMs: [], medianGapMs: null,
                  groups: [{ dtMs: 0, objectIds: notes.map(n => n.objectId) }] },
        stats: { noteCount: midis.length, keptCount: midis.length ? 1 : 0, redactedCount: Math.max(0, midis.length - 1),
                 midi: { min: midis.length ? midis[0] : 0, max: midis.length ? midis[midis.length - 1] : 0 },
                 vel: { avg: vel, min: vel, max: vel } },
    };
}
return { TOP, TOL, MAX_PARTIAL, nm, partialsOf, isTempered, centsText, label, makeStrike };
}));
