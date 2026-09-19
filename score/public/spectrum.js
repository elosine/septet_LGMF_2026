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
// THE TRANSPOSED COLUMN (his second column, 2026-09-19 — "the transposed column still all harmonic partials"): every distinct pitch
// class the series holds, with its cents, placed on every key of the 88 that has that pitch class. A class is named by the LOWEST partial
// that produces it (3 stands for 3 · 6 · 12 · 24 · 48 — its octaves); two partials on one pitch class with different cents (7 at −31¢
// and 57 at 0¢, both A♯) are two classes.
const LOW = 21;
function classesOf(P) {
    const seen = new Set(), out = [];
    for (const n of P) { const pc = ((n.midi % 12) + 12) % 12, key = pc + '@' + Math.round(n.cents * 10); if (seen.has(key)) continue; seen.add(key); out.push({ partial: n.partial, pc, cents: n.cents }); }
    return out;
}
function transposedOf(fundMidi, lo, hi, top) {
    const L = lo != null ? lo : LOW, H = hi != null ? hi : TOP, C = classesOf(partialsOf(fundMidi, top)), out = [];
    for (const c of C) for (let m = L; m <= H; m++) if (((m % 12) + 12) % 12 === c.pc) out.push({ partial: c.partial, midi: m, cents: c.cents });
    return out.sort((a, b) => a.midi - b.midi || a.partial - b.partial);
}
// the ids: sp:<fund>:just · sp:<fund>:just+8ve — the sets in the id, so a take rebuilds exactly what was loaded
const SETS = ['just', '8ve'];
function idFor(fundName, sets) { const s = SETS.filter(x => (sets || ['just']).indexOf(x) >= 0); return 'sp:' + fundName + ':' + (s.length ? s.join('+') : 'just'); }
function parseId(id) { const m = /^sp:([^:]+):((?:just|8ve)(?:\+(?:just|8ve))*)$/.exec(String(id || '')); return m ? { fund: m[1], sets: m[2].split('+') } : null; }
function isTempered(cents, tol) { return Math.abs(+cents || 0) <= (tol != null ? tol : TOL); }
function centsText(c) { const r = Math.round(c); return (r > 0 ? '+' : r < 0 ? '−' : '±') + Math.abs(r) + '¢'; }
function label(n, tol) { return String(n.partial) + (isTempered(n.cents, tol) && Math.round(n.cents) === 0 ? '' : ' · ' + centsText(n.cents)); }

// the strike object — the same shape HarmSource.makeStrike gives a harmony, so everything downstream treats it as one
function makeStrike(fundMidi, id, opts) {
    opts = opts || {};
    const f = Math.round(+fundMidi), sets = (opts.sets && opts.sets.length) ? opts.sets : ['just'];
    const vel = opts.vel != null ? opts.vel : 100, durMs = opts.durMs != null ? opts.durMs : 100;
    const mk = (n, set) => ({ objectId: 'sp-' + f + '-' + set + '-' + n.partial + '-' + n.midi, layer: 2, instKey: 'piano', midi: n.midi, technique: 'main',
                              vel, durMs, dtMs: 0, dtNorm: 0, dtUnits: null, partial: n.partial, cents: n.cents, set });
    const notes = [];
    if (sets.indexOf('just') >= 0) partialsOf(f, opts.top).forEach(n => notes.push(mk(n, 'just')));
    if (sets.indexOf('8ve') >= 0) transposedOf(f, opts.lo, opts.hi, opts.top).forEach(n => notes.push(mk(n, '8ve')));
    const midis = notes.map(n => n.midi).sort((a, b) => a - b);
    const pcs = [...new Set(midis.map(m => ((m % 12) + 12) % 12))].sort((a, b) => a - b);
    const setName = sets.indexOf('8ve') >= 0 ? (sets.indexOf('just') >= 0 ? 'just + 8ve' : '8ve') : 'just';
    const name = 'partials of ' + nm(f) + ' · ' + setName, index = 'series@' + nm(f) + (setName === 'just' ? '' : '+8ve');
    return {
        id: id || idFor(nm(f), sets), synthetic: true, spectrum: true, fundamental: f, sets: sets.slice(),
        harm: { value: 'spectrum:' + sets.join('+'), root: nm(f), id: index, name, group: 'HARMONIC SERIES' },
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
return { TOP, LOW, TOL, MAX_PARTIAL, SETS, nm, partialsOf, classesOf, transposedOf, idFor, parseId, isTempered, centsText, label, makeStrike };
}));
