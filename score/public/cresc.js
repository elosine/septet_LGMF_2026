// cresc.js — THE CRESCENDO, once, for the whole app (PLAN 1l step 2; CN-48; RUNNING_LOG §252–262).
//
// His words (CN-48): "a crescendo appears on that pitch -> .15 before next note, use standard curve … we'll have a default dynamic
// range ppp-fff and I can reassign individually, also can assign a manual duration".
//
// WHAT A CRESCENDO IS (decided §254, his (a)): an ORDINARY HELD NOTE whose curve rises — a `waveCurve` with a `sonifyNote`, two nodes
// and one segment whose model and slope carry the shape — plus `properties.cresc`, its provenance: the family, the ratio, the dynamic
// range, and how its end was set. No new object type: the score's own drag, stretch, delete, undo and save already work on it, the tick
// already plays it (1g item 5: the velocity from the curve's top, CC7 following the height, through the measured per-instrument law),
// and the extractor already reads it. Two riders from him:
//   · it is EDITED the newest way — the three curve-lane overlays, no slope diamond, the LINE dragged to bend (§254);
//   · it is DRAWN in the score filled and transparent in the morph ORANGE (#C2410C, the colour the tuba piece's morph section wears).
//
// THE SHAPES are his own, and this app already draws them by name (composer.html's curve presets): SURGE back-loaded (exponential,
// slope 0.40 at the standard 5×), BLOOM front-loaded (logarithmic, −0.29 at 5×), LINE even (power, 0). The ladders come from the tuba
// piece's CURVE_DATABASE.md; the standard is settled by his listening test (step 1) and lives in STANDARD below.
//
// THE END (decided §255): the peak is a CLIFF — up to the top and stop; the crescendo runs to 0.17 s before that player's next note;
// with no later note on that player, 5 s. A manual duration overrides both and says so in the provenance.
//
// Pure: no DOM, no MIDI. The page (window.Cresc) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Cresc = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

// the three families, with the ratio ladders of for_seven_tubas/docs/CURVE_DATABASE.md (ratio = e^(4·slope) on the surge side,
// cosh²(5·|slope|) on the bloom side; the threshold is the half-loudness moment)
const SHAPES = {
    surge: { label: 'surge', model: 'exponential', ratios: { 2: 0.17, 5: 0.40, 11: 0.60, 25: 0.80 }, thresholds: { 2: 0.59, 5: 0.68, 11: 0.75, 25: 0.80 } },
    line:  { label: 'linear', model: 'power',       ratios: { 1: 0 },                                  thresholds: { 1: 0.5 } },
    bloom: { label: 'bloom', model: 'logarithmic', ratios: { 2: -0.18, 5: -0.29, 11: -0.37, 25: -0.46 }, thresholds: { 2: 0.42, 5: 0.33, 11: 0.28, 25: 0.24 } },
};
// THE STANDARD, named by him after the listening test (2026-09-08, §263): "the surge is the default, we can keep the others as
// options, the bloom needs to be revisited but defer til first use". So: surge 5× is what every build makes unless told otherwise;
// line and bloom stay in the menus; bloom's own ladder is revisited when a piece first asks for one.
const STANDARD = { shape: 'surge', ratio: 5, provisional: false, named: '2026-09-08',
                   why: 'his listening test (scores/cresc-test.json): the surge is the default; line and bloom stay as options; bloom to be revisited at first use' };

const DEFAULTS = {
    dynLo: 0, dynHi: 10,          // ppp … fff on the score's curve scale (NAMING §2.9), the full measured span
    endGapS: 0.17,                // to this much before that player's next note (the trill's measured number, both, §255)
    fallbackS: 5,                 // no later note on that player: a crescendo's own length (his breath scale)
    trillFallbackS: 3,            // the trill's fallback moves 2 → 3 s at the same time (§255)
    color: '#C2410C',             // the morph orange (curve window A wears it; MORPH_NOTATION "the orange curve")
    opacity: 0.45,                // filled and transparent in the score
    minS: 0.3,                    // shorter than this is not a crescendo
    // SECCO (CN-49, his "secco on by default"): the cliff's performing technique — the strings damp the string with a finger or bow
    // pressure at the end, the winds get the word so they hear the shape; in the sound a CC7 cut so nothing rings past the end
    // (composer.html `seccoCut`). The sampler survives the cut because crescendos rotate through a pool of slots (CN-50, the pool below).
    secco: true,
    // THE POOL IS D11's CURVE CHANNELS — not a new idea (§270). The composer decided this on 2026-09-03, in these words: "there's
    // going to be events that happen right after a crescendo much sooner than two seconds … a crescendo in the violin that goes to
    // secco … the next event might come in in a hundred and fifty milliseconds … So probably better to continue using multiple
    // channels." Every Kontakt port carries ch 1 MAIN (plain notes, never a continuous controller) and ch 2/3/4 CURVE A/B/C, used
    // round-robin by any event that writes one — and his rack has held those four slots since. `pool` is therefore read from the
    // recipe's `channels.curve`, and is only ever set here for a test. EMPTY = the ordinary voice's own channel, as the app does today.
    pool: {},
    toleranceS: 2,                // provisional, from his memory of the quartet; scores/cresc-secco-test.json measures it
};

const DYN = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
const dynHeight = name => { const i = DYN.indexOf(name); return i < 0 ? null : Math.round((i / 7) * 100) / 10; };
const dynName = h => DYN[Math.max(0, Math.min(7, Math.round((Math.max(0, Math.min(10, +h || 0)) / 10) * 7)))];
const r3 = x => Math.round(x * 1000) / 1000;
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

// the segment for a family at a ratio: the model and the slope this score draws it with
function segmentFor(shape, ratio) {
    const S = SHAPES[shape] || SHAPES[STANDARD.shape];
    const keys = Object.keys(S.ratios).map(Number).sort((a, b) => a - b);
    const r = ratio != null ? +ratio : (shape === 'line' ? 1 : STANDARD.ratio);
    let best = keys[0];
    keys.forEach(k => { if (Math.abs(k - r) < Math.abs(best - r)) best = k; });
    return { model: S.model, slope: S.ratios[best], ratio: best, threshold: S.thresholds[best] };
}
function shapeList() { return Object.keys(SHAPES).map(k => [k, SHAPES[k].label]); }

// THE END: to endGapS before that player's next sounding note after `start`; else the fallback. `notes` is everything on that lane.
function endFor(start, notes, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    if (O.durS != null) return { end: r3(start + Math.max(O.minS, +O.durS)), how: 'manual', gapTo: null };
    let next = null;
    (notes || []).forEach(n => {
        const t = +n.startSeconds; if (!isFinite(t) || t <= start + 1e-6) return;
        if (next == null || t < next) next = t;
    });
    if (next == null) return { end: r3(start + O.fallbackS), how: 'fallback', gapTo: null };
    const end = next - O.endGapS;
    // no room: the next note is closer than a crescendo can be. Say so — never draw one over the note that crowds it.
    if (end < start + O.minS) return { end: null, how: 'noRoom', gapTo: r3(next), room: r3(next - start - O.endGapS) };
    return { end: r3(end), how: 'toNextNote', gapTo: r3(next) };
}

// MAKE ONE. `at` seconds, `pitch` MIDI, `player` { lane, tech, label }, `notes` what that lane already sounds (for the end rule).
function make(at, pitch, player, notes, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const shape = O.shape || STANDARD.shape, ratio = O.ratio != null ? O.ratio : (shape === 'line' ? 1 : STANDARD.ratio);
    const seg = segmentFor(shape, ratio);
    const e = endFor(at, notes, O);
    if (e.how === 'noRoom') return null;   // the caller says "no room for a crescendo here" (the next note is e.room s away)
    const lo = O.dynLo != null ? +O.dynLo : DEFAULTS.dynLo, hi = O.dynHi != null ? +O.dynHi : DEFAULTS.dynHi;
    return {
        id: O.id || null, type: 'waveCurve', layer: player.lane,
        startSeconds: r3(at), endSeconds: e.end,
        nodes: [{ pos: 0, y: Math.max(0, Math.min(10, lo)), smooth: 0.25 }, { pos: 1, y: Math.max(0, Math.min(10, hi)), smooth: 0.25 }],
        segments: [{ model: seg.model, slope: seg.slope }],
        color: O.color || DEFAULTS.color, fillMode: 'bottom', opacity: O.opacity != null ? O.opacity : DEFAULTS.opacity,
        performanceNotes: 'cresc ' + shape + (shape === 'line' ? '' : ' ' + seg.ratio + '×') + ' ' + dynName(lo) + '→' + dynName(hi) +
            ' ' + (e.end - at).toFixed(2) + ' s' + (e.how === 'manual' ? ' (typed)' : e.how === 'fallback' ? ' (no next note)' : ''),
        properties: { cresc: { shape, ratio: seg.ratio, slope: seg.slope, threshold: seg.threshold, dynLo: lo, dynHi: hi,
                               end: e.how, gapTo: e.gapTo, endGapS: O.endGapS != null ? O.endGapS : DEFAULTS.endGapS, peak: 'cliff',
                               secco: O.secco !== false } },
        sonifyNote: pitch, technique: player.tech,
    };
}

function isCresc(o) { return !!(o && o.type === 'waveCurve' && o.sonifyNote != null && o.properties && o.properties.cresc); }

// THE SLOT POOL AND ITS ROTATION (PLAN 1l step 5; CN-50 — "the rotation happens in the back-end … so we don't have to think about it
// on the front end"). This rack pins CC7 = 127 before every event on one slot per instrument (REAPER_CONTROL §3, D11), so a secco cut
// is undone by the next event on that slot — and re-pinning too soon brings the cut tail back. The cure is the string quartet's: the
// crescendos rotate through a pool of slots (extra Kontakt slots of the same instrument on free channels), so a cut slot is left alone
// while others sound. `pool[instKey]` is a list of channels; EMPTY means no rotation — the ordinary voice's own channel, as today.
//
// Walks a player's crescendos in time order and gives each the least-recently-cut slot that has been free for `toleranceS`. Pure: it
// returns the assignments and the warnings; the caller writes `properties.cresc.slot` and the tick sends on it.
function assignSlots(crescs, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const out = { assigned: [], warnings: [] };
    const byLane = {};
    (crescs || []).filter(isCresc).forEach(c => (byLane[c.layer] = byLane[c.layer] || []).push(c));
    Object.keys(byLane).forEach(laneKey => {
        const lane = +laneKey;
        const list = byLane[lane].slice().sort((a, b) => a.startSeconds - b.startSeconds);
        const instKey = (O.instKeys && O.instKeys[lane]) || null;
        // D11's curve channels first (the recipe's own `channels.curve`), then an explicit pool for a test
        const rec = (O.recipe && instKey && O.recipe[instKey]) || null;
        const pool = (rec && rec.channels && rec.channels.curve) || (O.pool && instKey && O.pool[instKey]) || [];
        if (!pool.length) { list.forEach(c => out.assigned.push({ id: c.id, lane, slot: null, why: 'no pool for this player — its own channel, as today' })); return; }
        const freeAt = {};   // channel → the ms after which re-pinning it is safe
        pool.forEach(ch => { freeAt[ch] = -Infinity; });
        list.forEach(c => {
            if (c.properties.cresc.secco === false) { out.assigned.push({ id: c.id, lane, slot: pool[0], why: 'not secco — no cut, any slot' }); return; }
            const t = c.startSeconds;
            let pick = null, best = Infinity;
            pool.forEach(ch => { if (freeAt[ch] <= t + 1e-9 && freeAt[ch] < best) { best = freeAt[ch]; pick = ch; } });
            if (pick == null) {
                // nobody has rested long enough: take the one that will be free soonest and say so — the signal for another slot
                pick = pool.reduce((b, ch) => (freeAt[ch] < freeAt[b] ? ch : b), pool[0]);
                out.warnings.push('at ' + t.toFixed(2) + ' s the crescendo pool of ' + pool.length + ' cannot keep the ' + O.toleranceS +
                    ' s rest (slot ' + pick + ' was cut ' + ((t - (freeAt[pick] - O.toleranceS)) || 0).toFixed(2) + ' s ago) — add a slot, or lengthen the crescendos');
            }
            freeAt[pick] = c.endSeconds + O.toleranceS;
            out.assigned.push({ id: c.id, lane, slot: pick, why: 'rotated' });
        });
    });
    return out;
}
// apply what assignSlots decided (the one place that writes it)
function applySlots(crescs, assigned) {
    const by = {}; (assigned || []).forEach(a => { by[a.id] = a; });
    (crescs || []).filter(isCresc).forEach(c => { const a = by[c.id]; if (a && a.slot != null) c.properties.cresc.slot = a.slot; else delete c.properties.cresc.slot; });
    return crescs;
}
function describe(wc) {
    if (!isCresc(wc)) return 'not a crescendo';
    const c = wc.properties.cresc;
    return nm(wc.sonifyNote) + ' · ' + c.shape + (c.shape === 'line' ? '' : ' ' + c.ratio + '×') + ' · ' + dynName(c.dynLo) + ' → ' + dynName(c.dynHi) +
        ' · ' + (wc.endSeconds - wc.startSeconds).toFixed(2) + ' s · ' + (c.end === 'toNextNote' ? 'to ' + c.endGapS + ' s before the next note' : c.end === 'fallback' ? 'no next note' : c.end);
}
// the height the curve has reached at a fraction of its length — the shape as a number, for the checks and any readout
function heightAt(wc, u) {
    const lo = wc.nodes[0].y, hi = wc.nodes[1].y, seg = (wc.segments || [])[0] || { model: 'power', slope: 0 };
    const t = Math.max(0, Math.min(1, u));
    let f;
    if (seg.model === 'exponential') f = Math.pow(t, Math.exp(4 * Math.abs(seg.slope)));          // back-loaded: slow, then a rush
    else if (seg.model === 'logarithmic') f = Math.pow(t, 1 / Math.exp(4 * Math.abs(seg.slope))); // front-loaded: fast, then easing
    else f = t;
    return Math.round((lo + (hi - lo) * f) * 1000) / 1000;
}
// where half the loudness has arrived (his THRESHOLD), measured off the drawn curve
function thresholdOf(wc) {
    const lo = wc.nodes[0].y, hi = wc.nodes[1].y, half = lo + (hi - lo) / 2;
    let a = 0, b = 1;
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (heightAt(wc, m) < half) a = m; else b = m; }
    return Math.round(((a + b) / 2) * 100) / 100;
}


// ===================== THE HARMONY DECK (PLAN 1m step 3; RUNNING_LOG §282; CN-53) =====================
// A standing sonority dealt ONE PITCH AT A TIME, so pressing C with nothing selected walks a harmony. Three orders, all SEEDED so a
// sequence repeats exactly: in turn · shuffled to completion then reshuffled · random. Pure and stateless — the caller keeps the little
// state { order, seed, drawn, lap } (the bar's, in the browser, never in the file) and this says what the next pitch is and what is
// left. 1k's deck in spirit and in seed arithmetic, one pitch wide.
const ORDERS = [['turn', 'in turn'], ['shuffled', 'shuffled, then reshuffled'], ['random', 'random']];
function deckRnd(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
// the order this lap deals in: 'turn' keeps the sonority's own order; 'shuffled' reshuffles from the seed AND the lap, so lap 2 is a
// different order from lap 1 and both come back the same next time
function lapOrder(notes, order, seed, lap) {
    const a = (notes || []).slice();
    if (order !== 'shuffled') return a;
    const rnd = deckRnd(((+seed || 1) * 7727 + (+lap || 0) * 613) | 0);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
}
// the next pitch. Returns { pitch, state, left, lap, reshuffled } — `left` is null for 'random' (it never runs out).
function deckNext(notes, st) {
    const list = (notes || []).slice();
    if (!list.length) return null;
    const o = (st && st.order) || 'turn', seed = Math.max(1, +(st && st.seed) || 1);
    let drawn = Math.max(0, +(st && st.drawn) || 0), lap = Math.max(0, +(st && st.lap) || 0);
    if (o === 'random') {
        const pitch = list[Math.floor(deckRnd(((seed * 7727 + drawn * 613) | 0))() * list.length)];
        return { pitch, state: { order: o, seed, drawn: drawn + 1, lap }, left: null, lap, reshuffled: false };
    }
    let reshuffled = false;
    if (drawn >= list.length) { drawn = 0; lap += 1; reshuffled = true; }   // exhausted: a new lap (reshuffled, when shuffled)
    const pitch = lapOrder(list, o, seed, lap)[drawn];
    return { pitch, state: { order: o, seed, drawn: drawn + 1, lap }, left: list.length - drawn - 1, lap, reshuffled };
}
// what is left in this lap, for the bar's count
function deckLeft(notes, st) {
    const n = (notes || []).length;
    if (!n) return 0;
    if (st && st.order === 'random') return null;
    const drawn = Math.max(0, +(st && st.drawn) || 0);
    return drawn >= n ? n : n - drawn;
}
// FOLD a sonority's pitch into a player's sounding range — 1k's own rule (strike_drawer.js foldInto), octave by octave; null when it
// does not reach in any octave. `fold` is how many octaves it moved, so the bar can say so.
function foldInto(pitch, lo, hi) {
    let p = pitch, n = 0;
    while (p < lo && n < 8) { p += 12; n++; }
    while (p > hi && n > -8) { p -= 12; n--; }
    return (p >= lo && p <= hi) ? { pitch: p, fold: n } : null;
}

return { SHAPES, STANDARD, DEFAULTS, DYN, dynHeight, dynName, nm, shapeList, segmentFor, endFor, make, isCresc, describe, heightAt, thresholdOf,
         assignSlots, applySlots, ORDERS, lapOrder, deckNext, deckLeft, foldInto };
}));
