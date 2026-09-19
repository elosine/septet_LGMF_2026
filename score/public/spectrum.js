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
// THE TEMPERED SETS (his third and fourth selections, 2026-09-19 — "the third one will be the well-tempered version. And then the fourth
// one will be the well-tempered version plus transpositions"): the same partials on their nearest keys, no cents — so every player,
// bending or not, plays the key; and the tempered classes are the pitch classes alone (C2's series reaches all twelve by partial 27).
function temperedOf(fundMidi, top) { return partialsOf(fundMidi, top).map(n => ({ partial: n.partial, midi: n.midi, cents: 0, above: n.above })); }
function transposedOf(fundMidi, lo, hi, top, tempered) {
    const L = lo != null ? lo : LOW, H = hi != null ? hi : TOP, C = classesOf(tempered ? temperedOf(fundMidi, top) : partialsOf(fundMidi, top)), out = [];
    for (const c of C) for (let m = L; m <= H; m++) if (((m % 12) + 12) % 12 === c.pc) out.push({ partial: c.partial, midi: m, cents: c.cents });
    return out.sort((a, b) => a.midi - b.midi || a.partial - b.partial);
}
// the ids: sp:<fund>:just · sp:<fund>:just+8ve · sp:<fund>:temp · sp:<fund>:temp+8ve — the sets in the id, so a take rebuilds exactly
// what was loaded. Each is its own selection in the drawer (his 2026-09-19: "there's no reason to have them all on the same selection").
const SETS = ['just', '8ve', 'temp', 'temp8ve'];
function idFor(fundName, sets) { const s = SETS.filter(x => (sets || ['just']).indexOf(x) >= 0); return 'sp:' + fundName + ':' + (s.length ? s.join('+') : 'just'); }
function parseId(id) { const m = /^sp:([^:]+):((?:just|8ve|temp|temp8ve)(?:\+(?:just|8ve|temp|temp8ve))*)$/.exec(String(id || '')); return m ? { fund: m[1], sets: m[2].split('+') } : null; }
const SET_NAMES = { just: 'just', '8ve': 'just / 8ve', temp: 'tempered', temp8ve: 'tempered / 8ve' };
// the selection's name: `just` · `just + 8ve` · `tempered` · `tempered + 8ve` (the four rows of the banner)
function setLabel(sets) {
    const s = SETS.filter(x => (sets || []).indexOf(x) >= 0);
    if (s.join('+') === 'just+8ve') return 'just + 8ve';
    if (s.join('+') === 'temp+temp8ve') return 'tempered + 8ve';
    return s.map(x => SET_NAMES[x] || x).join(' + ') || 'just';
}
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
    if (sets.indexOf('temp') >= 0) temperedOf(f, opts.top).forEach(n => notes.push(mk(n, 'temp')));
    if (sets.indexOf('temp8ve') >= 0) transposedOf(f, opts.lo, opts.hi, opts.top, true).forEach(n => notes.push(mk(n, 'temp8ve')));
    const midis = notes.map(n => n.midi).sort((a, b) => a - b);
    const pcs = [...new Set(midis.map(m => ((m % 12) + 12) % 12))].sort((a, b) => a - b);
    const setName = setLabel(sets);
    const name = 'partials of ' + nm(f) + ' · ' + setName, index = 'series@' + nm(f) + ':' + SETS.filter(x => sets.indexOf(x) >= 0).join('+');
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
return { TOP, LOW, TOL, MAX_PARTIAL, SETS, SET_NAMES, nm, partialsOf, temperedOf, classesOf, transposedOf, idFor, parseId, setLabel, isTempered, centsText, label, makeStrike };
}));
