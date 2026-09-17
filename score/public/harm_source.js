// harm_source.js — A HARMONY AS A STRIKE, AND A RHYTHM FROM ANOTHER STRIKE (PLAN 1d, the drawer's step; CN-57; RUNNING_LOG §324).
//
// His picture (2026-09-09, session 7): *"essentially, the way the strikes drawer is, but with all the other harmonies and have the same
// behavior. So I click, say, a blast or a chord shape from that same strikes menu … and it has the collapsible banners. and then
// everything else behaves the same."* — and then: *"can we separate out the strikes rhythms? … I select a strike and its rhythm gets
// stored somewhere, or I have another pull down where I have zero through forty five for the strikes rhythms."*
//
// The drawer's own model (STRIKES_TOOL §L, his words of 2026-09-03) is THREE INDEPENDENT LISTS — the pitches, the onsets, the players —
// and the only thing not free until now was that the pitches and the onsets always came from the SAME strike. This module is the pure
// arithmetic that frees them; it knows nothing of the drawer, the DOM, the morph panel or MIDI. It takes lists and gives back lists.
//
//   · makeStrike(entry)        a sonority (a blast, a chord shape, a stack from a root, a kept set …) becomes a strike object with every
//                              field the drawer's select() reads — one simultaneity, all its notes at 0 ms, the drawer's default velocity
//                              and length. "As played" for a harmony = together. Everything downstream is a strike like any other.
//   · lay(items, rhythm, mode) the pitches laid on another strike's onsets. THE TWO RULES AGREED 2026-09-09:
//                              rule 1 — counts differ: the notes go on the onsets in order and WRAP. `stack`: note n+1 lands ON onset 1,
//                                       sounding with note 1 (the gesture keeps its played length). `repeat`: a second pass, the rhythm
//                                       played through again, starting one LAST GAP after the last onset (the tempo continues). Fewer
//                                       notes than onsets: the last onsets stay empty, and the readout says so.
//                              rule 2 — the accents: velocities and lengths travel WITH THE RHYTHM (the played gesture); the pitches come
//                                       from the harmony.
//   · groupsFor(groups, sonorityOf, root)  the morph panel's own pitch menu (MorphPanel.pitchOptionGroups — CN-53's one list, reused by the
//                              crescendo bar too) turned into banners of rows: id · name · n · range · pitches. The stacks and the modes
//                              are built from the root given.
//
// `node tools/harm_source_check.js` checks all of it.
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.HarmSource = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const DEFAULTS = { vel: 100, durMs: 100 };          // what select() gives a note that carries no velocity or length (the drawer's own defaults)
const ID_PREFIX = 'hs:';                            // a harmony's strike id: hs:<root>:<menu value> — the root is empty unless the value is a family

// ---------------------------------------------------------------- ids and labels
function isHarmId(id) { return typeof id === 'string' && id.slice(0, ID_PREFIX.length) === ID_PREFIX; }
function harmId(value, rootStr) { return ID_PREFIX + (rootStr || '') + ':' + value; }
function parseHarmId(id) {
    if (!isHarmId(id)) return null;
    const m = /^hs:([^:]*):(.*)$/.exec(id); if (!m) return null;
    return { root: m[1] || null, value: m[2] };
}
function isFamily(value) { return /^fam:/.test(String(value || '')); }
// a short index for the strike — it goes into group ids (grp-strike-<index>-…) and status lines, as #24 does for a played strike
function shortIndex(value, rootStr) {
    const v = String(value || ''), i = v.indexOf(':'), kind = i < 0 ? v : v.slice(0, i), key = i < 0 ? '' : v.slice(i + 1);
    let out;
    switch (kind) {
        case 'harm': { const j = key.indexOf(':'); out = j < 0 ? key : key.slice(j + 1); break; }        // harm:blasts:S001 → S001
        case 'fam': out = key + (rootStr ? '@' + rootStr : ''); break;                                       // fam:stack-p5 → stack-p5@F2
        case 'starter': out = 'starter-' + key; break;
        case 'model': out = key; break;
        case 'tuba': out = 'tuba-' + key; break;
        case 'kept': out = 'kept-' + key; break;
        case 'actual': out = 'actual-' + key; break;
        default: out = v;
    }
    return out.replace(/[^A-Za-z0-9._@#-]+/g, '-');
}
const PITCH_LIST = /^([A-G]#?-?\d+\s*)+(…)?$/;
// the row's name from the menu's text: `S001 · VERT01-28 V4 · D1 D2 …` → `VERT01-28 V4` (the id and the pitch list are shown on their own)
function rowName(text, id, fallback) {
    const segs = String(text || '').split(' · ').map(s => s.trim()).filter(Boolean);
    const keep = segs.filter(s => s !== id && !PITCH_LIST.test(s));
    return keep.join(' · ') || fallback || id;
}
const BANK_KEYS = [
    [/^recalled from an actual/i, 'actual', 'RECALLED · from an ACTUAL'],
    [/^kept/i, 'kept', 'KEPT · yours'],
    [/^starters/i, 'starters', 'STARTERS'],
    [/^the models/i, 'models', 'THE MODELS\' SETS'],
    [/^stacks/i, 'stacks', 'STACKS · from the root'],
    [/^messiaen/i, 'modes', 'MESSIAEN\'S MODES · from the root'],
    [/^strikes/i, 'strikes', 'STRIKES'],
    [/^blasts/i, 'blasts', 'BLASTS · the tuba piece'],
    [/^chord shapes/i, 'chordShapes', 'CHORD SHAPES · 2 pianos 2 percussion'],
];
function bankOf(label) {
    for (const [re, key, title] of BANK_KEYS) if (re.test(String(label || ''))) return { key, title };
    const key = String(label || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';
    return { key, title: String(label || 'other').toUpperCase() };
}

// ---------------------------------------------------------------- rule 1: the notes on the onsets
// ticks: the rhythm's onsets in ms (one per recorded note, sorted); m: how many notes to lay; mode: 'stack' | 'repeat'
function layOnTicks(ticks, m, mode) {
    const T = (ticks || []).slice().sort((a, b) => a - b), n = T.length;
    const dts = [], idx = [];
    if (!n) { for (let i = 0; i < m; i++) { dts.push(0); idx.push(-1); } return { dts, idx, n: 0, m, stacked: 0, passes: 1, empty: 0, lastGap: 0, stride: 0, mode: 'stack', degenerate: false }; }
    const t0 = T[0], span = T[n - 1] - t0;
    let lastGap = 0; for (let i = n - 1; i > 0; i--) { const g = T[i] - T[i - 1]; if (g > 0) { lastGap = g; break; } }
    const stride = span + lastGap;
    const wantRepeat = mode === 'repeat', rep = wantRepeat && stride > 0;
    for (let i = 0; i < m; i++) { const k = i % n, pass = Math.floor(i / n); dts.push((T[k] - t0) + (rep ? pass * stride : 0)); idx.push(k); }
    return { dts, idx, n, m, stacked: rep ? 0 : Math.max(0, m - n), passes: m > n ? Math.ceil(m / n) : 1, empty: Math.max(0, n - m),
             lastGap, stride: rep ? stride : 0, mode: rep ? 'repeat' : 'stack', degenerate: wantRepeat && !rep };
}

// the rhythm of a strike as the drawer keeps it: one onset per recorded note, with that note's accent — rule 2 travels here
function rhythmOf(strike) {
    if (!strike || !strike.notes || !strike.notes.length) return null;
    const ticks = strike.notes.map(n => ({ dtMs: +n.dtMs || 0, vel: n.vel, durMs: n.durMs })).sort((a, b) => a.dtMs - b.dtMs);
    return { id: strike.id, label: '#' + strike.index, ticks };
}

// items: [{midi, dtMs?, vel?, durMs?}] — the pitches (with their own played timing and accents when they have them)
// rhythm: rhythmOf(otherStrike) or null (= its own: nothing is moved)
function lay(items, rhythm, mode, def) {
    def = Object.assign({}, DEFAULTS, def || {});
    const own = it => ({ midi: it.midi, dtMs: it.dtMs != null ? +it.dtMs : 0, vel: it.vel != null ? it.vel : def.vel, durMs: it.durMs != null ? it.durMs : def.durMs, tick: -1 });
    if (!rhythm || !rhythm.ticks || !rhythm.ticks.length) return { notes: items.map(own), info: { own: true, n: items.length, m: items.length } };
    const T = rhythm.ticks.slice().sort((a, b) => a.dtMs - b.dtMs);
    const L = layOnTicks(T.map(t => t.dtMs), items.length, mode);
    const notes = items.map((it, i) => {
        const t = T[L.idx[i]] || {};
        return { midi: it.midi, dtMs: L.dts[i], tick: L.idx[i],
                 vel: t.vel != null ? t.vel : (it.vel != null ? it.vel : def.vel),
                 durMs: t.durMs != null ? t.durMs : (it.durMs != null ? it.durMs : def.durMs) };
    });
    return { notes, info: Object.assign({ own: false, from: rhythm.label, fromId: rhythm.id }, L) };
}

function describe(info) {
    if (!info || info.own) return '';
    const bits = [info.m + ' note' + (info.m === 1 ? '' : 's') + ' on ' + info.n + ' onset' + (info.n === 1 ? '' : 's')];
    if (info.stacked) bits.push(info.stacked + ' stacked');
    if (info.mode === 'repeat' && info.passes > 1) bits.push(info.passes + ' passes, +' + Math.round(info.lastGap) + ' ms between');
    if (info.empty) bits.push(info.empty + ' onset' + (info.empty === 1 ? '' : 's') + ' empty');
    if (info.degenerate) bits.push('one onset only — repeat = stack');
    return bits.join(' · ');
}

// ---------------------------------------------------------------- a harmony as a strike
// entry: { value, root?, id (short), name, pitches, source (the banner's title) }
function makeStrike(entry, def) {
    def = Object.assign({}, DEFAULTS, def || {});
    const pitches = (entry.pitches || []).map(Number).filter(m => isFinite(m));
    const root = isFamily(entry.value) ? (entry.root || null) : null;
    const index = entry.id || shortIndex(entry.value, root);
    const notes = pitches.map((m, i) => ({ objectId: 'hs-' + index + '-' + i, layer: 2, instKey: 'piano', midi: m, technique: 'main',
                                           vel: def.vel, durMs: def.durMs, dtMs: 0, dtNorm: 0, dtUnits: null }));
    const midis = pitches.slice().sort((a, b) => a - b);
    const pcs = [...new Set(midis.map(m => ((m % 12) + 12) % 12))].sort((a, b) => a - b);
    return {
        id: harmId(entry.value, root), synthetic: true,
        harm: { value: entry.value, root, id: index, name: entry.name || index, group: entry.source || '' },
        source: entry.source || 'harmony', index, t0: 0, tLast: 0, spanMs: 0,
        label: (entry.source ? entry.source + ' · ' : '') + (entry.name || index),
        notes,
        harmony: { count: midis.length, midis, pcs, instKeys: ['piano'] },
        rhythm: { simultaneityMs: 60, onsetsMs: [0], onsetsNorm: [0], onsetsUnits: [null], gapsMs: [], medianGapMs: null,
                  groups: [{ dtMs: 0, objectIds: notes.map(n => n.objectId) }] },
        stats: { noteCount: midis.length, keptCount: midis.length ? 1 : 0, redactedCount: Math.max(0, midis.length - 1),
                 midi: { min: midis.length ? midis[0] : 0, max: midis.length ? midis[midis.length - 1] : 0 },
                 vel: { avg: def.vel, min: def.vel, max: def.vel } },
    };
}

// ---------------------------------------------------------------- the banners from the morph panel's menu
// groups: MorphPanel.pitchOptionGroups() → [{label, items:[{value, text}]}]; sonorityOf(value, root) → {notes, from} | null
// The morph menu's own 'strikes' group is skipped: the drawer's STRIKES banner is the db's, with the richer rows.
function groupsFor(groups, sonorityOf, rootStr, opts) {
    opts = opts || {};
    const out = [];
    (groups || []).forEach(g => {
        const b = bankOf(g.label);
        if (b.key === 'strikes' && !opts.keepStrikes) return;
        const items = (g.items || []).map(it => {
            const fam = isFamily(it.value), root = fam ? (rootStr || null) : null;
            let son = null; try { son = sonorityOf(it.value, fam ? rootStr : undefined); } catch (e) { son = null; }
            if (!son || !son.notes || !son.notes.length) return null;
            const p = son.notes.map(Number).filter(m => isFinite(m)); if (!p.length) return null;
            const id = shortIndex(it.value, root);
            const lo = Math.min.apply(null, p), hi = Math.max.apply(null, p);
            return { value: it.value, root, id, name: rowName(it.text, id, son.from), pitches: p, n: p.length, lo, hi, range: nm(lo) + '–' + nm(hi), source: b.title };
        }).filter(Boolean);
        out.push({ key: b.key, title: b.title, label: g.label, family: /stacks|modes/.test(b.key), items });
    });
    return out;
}

return { DEFAULTS, ID_PREFIX, nm, isHarmId, harmId, parseHarmId, isFamily, shortIndex, rowName, bankOf, layOnTicks, rhythmOf, lay, describe, makeStrike, groupsFor };
}));
