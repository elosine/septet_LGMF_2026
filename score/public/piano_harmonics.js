// piano_harmonics.js — THE PIANO'S HARMONICS AT A MORPH'S RE-BREATHS (PLAN 1i, the first pass; CN-40; RUNNING_LOG §210, §217).
//
// His note: "for the piano part, for the morph section, use harmonics … detect the onsets where the re-breaths happen for the
// morph and what pitches they are, and then figure out the harmonic to play … even better if it's a little detuned from what's
// being played in the ensemble … the closest one that has the strongest harmonic … the octave or the fifth. And if that note
// isn't available, then move down the harmonic chain."
//
// THE MODEL (read back and confirmed, §217): at every re-breath of a placed morph — every sounding note of the group on a player's
// lane; its start IS the re-breath, its pitch the player's key plus the bend's first point — the piano sounds ONE harmonic of that
// pitch. THE FIRST PASS IS UN-SHIFTED: the IRCAM Prepared Piano 2 "Harmonics" preparation samples the 2nd partial, so key K sounds
// K + 12 (the two-piano piece's instrument map); the harmonic that sounds the player's pitch p is the octave harmonic of the string
// an octave below it — the key round(p) − 12 — or, by the switch, an octave above (the key round(p)). The rounding IS the detune he
// asked for (the player is mid-glide at a re-breath; the piano lands on the nearest key). A key outside the technique's range folds
// by octaves (the pitch class kept) and says so. The chain (the 3rd partial of the string a twelfth below, and on) and an exact
// detune need CC21 — the second pass (PLAN 1i item 2).
//
// Pure: no DOM, no MIDI. Loads on the page (window.PianoHarmonics) and in node (module.exports) for tools/piano_harmonics_check.js
// and the CLI tools/piano_harmonics.js. The panel's button is in morph_panel.js.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.PianoHarmonics = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const DEFAULTS = {
    keyLo: 21, keyHi: 77,       // the `harmonics` technique's keys (sandbox/instruments.js: channel 3, 21–77)
    offsetSt: 12,               // the sampled harmonic is the 2nd partial: key K sounds K + 12
    ceiling: 101,               // the top sounding pitch (F7 = key 77 + 12 + CC21's 12) — a guard, never reached un-shifted
    octave: 0,                  // 0 = the harmonic sounds AT the player's pitch · 1 = an octave above (the switch, §217)
    level: 7,                   // the piano note's curve height 0–10 (NAMING §2.9); null = each source note's own peak
    mergeMs: 30,                // two re-breaths landing on one key within this window = one piano note
    maxDurS: null,              // a cap on the note's length in seconds; null = the source note's own length
    pianoLane: 2,               // the piano's lane (TRACKS)
    metaLayer: 7,               // the META layer (the group's shape lives there)
    technique: 'harmonics',     // the piano technique the notes are written at
    laneLabels: null,           // ['Fl', 'BCl', 'Pno', …] for the performance notes; lane numbers when absent
    color: '#B39DDB',           // a lighter tint of the morph's purple: derived from it
};

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const r3 = x => Math.round(x * 1000) / 1000;

// the player's pitch at the re-breath: the written key plus the bend's first point (note-relative cents at dt = 0)
function pitchAtOnset(o) {
    const c = (o.morphBend && o.morphBend.length && isFinite(+o.morphBend[0][1])) ? +o.morphBend[0][1] : 0;
    return o.sonifyNote + c / 100;
}
// the source note's peak level (its curve's top, 0–10)
function peakOf(o) {
    const ys = (o.nodes || []).map(n => +n.y).filter(y => isFinite(y));
    return ys.length ? Math.max.apply(null, ys) : 10;
}
function isMorphGroupId(gid) { return /^grp-morph-/.test(gid || ''); }
function isPianoHarmonic(o) { return !!(o && o.properties && o.properties.pianoHarmonics); }

// the morph groups of a score with their spans (the META shape's, widened by the notes') and their marker labels
function morphGroups(objects, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const by = {};
    (objects || []).forEach(x => {
        if (!isMorphGroupId(x.groupId)) return;
        const g = by[x.groupId] || (by[x.groupId] = { groupId: x.groupId, label: '', start: Infinity, end: -Infinity, notes: 0, harmonics: 0 });
        if (x.type === 'marker') {
            g.label = x.label || '';
            if (isFinite(+x.time)) { g.start = Math.min(g.start, +x.time); g.end = Math.max(g.end, +x.time); }
            return;
        }
        if (x.type !== 'waveCurve') return;
        if (isFinite(+x.startSeconds)) g.start = Math.min(g.start, +x.startSeconds);
        if (isFinite(+x.endSeconds)) g.end = Math.max(g.end, +x.endSeconds);
        if (isPianoHarmonic(x)) g.harmonics++;
        else if (x.layer !== O.metaLayer && x.sonifyNote != null) g.notes++;
    });
    return Object.keys(by).sort().map(k => by[k]);
}
// the morph whose span contains t (the earliest when two overlap), else null
function findMorphAt(objects, t, o) {
    const gs = morphGroups(objects, o).filter(g => g.start <= t && t <= g.end);
    return gs.length ? gs.sort((a, b) => a.start - b.start)[0] : null;
}

// the re-breaths of one morph: every sounding note of the group on a player's lane, in time order — never the piano's lane, never
// the META shape, never the piano harmonics themselves (a re-run does not feed on its own output)
function reBreaths(objects, groupId, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    return (objects || [])
        .filter(x => x.groupId === groupId && x.type === 'waveCurve' && x.sonifyNote != null &&
                     x.layer !== O.pianoLane && x.layer !== O.metaLayer && !isPianoHarmonic(x))
        .map(x => ({ id: x.id, lane: x.layer, t: +x.startSeconds, dur: Math.max(0.05, +x.endSeconds - +x.startSeconds), midi: x.sonifyNote,
                     cents: Math.round((pitchAtOnset(x) - x.sonifyNote) * 100), pitch: pitchAtOnset(x), peak: peakOf(x), technique: x.technique }))
        .sort((a, b) => a.t - b.t || a.lane - b.lane);
}

// ONE harmonic for ONE pitch, un-shifted: the target sound (the pitch, or an octave above), the nearest key whose octave harmonic
// sounds it, folded by octaves into the technique's keys. detuneCents = the piano's sound minus the (folded) target: + = the piano
// sharp of the player.
function harmonicFor(pitch, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    if (!isFinite(pitch)) return { ok: false, why: 'no pitch' };
    const target = pitch + 12 * (O.octave | 0);
    let key = Math.round(target) - O.offsetSt, fold = 0;
    while (key > O.keyHi && key - 12 >= O.keyLo) { key -= 12; fold--; }
    while (key < O.keyLo && key + 12 <= O.keyHi) { key += 12; fold++; }
    if (key < O.keyLo || key > O.keyHi) return { ok: false, why: 'no key for ' + nm(Math.round(target)) + ' within ' + nm(O.keyLo) + '–' + nm(O.keyHi), target: r3(target) };
    const sounds = key + O.offsetSt;
    if (sounds > O.ceiling) return { ok: false, why: 'sounds above the ceiling', target: r3(target) };
    return { ok: true, key, string: key, partial: 2, sounds, target: r3(target), fold,
             detuneCents: Math.round((sounds - (target + 12 * fold)) * 100) };
}

// the whole part for one morph: a note per re-breath, the coincident same-key notes merged
function generate(objects, groupId, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const rb = reBreaths(objects, groupId, O), notes = [], skipped = [];
    rb.forEach(b => {
        const h = harmonicFor(b.pitch, O);
        if (!h.ok) { skipped.push({ srcId: b.id, lane: b.lane, t: b.t, pitch: b.pitch, why: h.why }); return; }
        const dur = O.maxDurS != null ? Math.min(b.dur, +O.maxDurS) : b.dur;
        notes.push({ t: r3(b.t), dur: r3(dur), key: h.key, sounds: h.sounds, string: h.string, partial: h.partial, detuneCents: h.detuneCents, fold: h.fold,
                     octave: O.octave | 0, level: O.level != null ? +O.level : b.peak,
                     srcId: b.id, srcLane: b.lane, srcMidi: b.midi, srcCents: b.cents, srcPitch: r3(b.pitch), merged: [] });
    });
    // the merge: a second re-breath on the same key within the window joins the first (the longer end, the higher level)
    const kept = [];
    notes.forEach(n => {
        const m = kept.find(k => k.key === n.key && Math.abs(n.t - k.t) <= O.mergeMs / 1000);
        if (!m) { kept.push(n); return; }
        m.dur = r3(Math.max(m.t + m.dur, n.t + n.dur) - m.t);
        if (O.maxDurS != null) m.dur = Math.min(m.dur, +O.maxDurS);
        m.level = Math.max(m.level, n.level);
        m.merged.push(n.srcId);
    });
    const det = kept.map(n => Math.abs(n.detuneCents));
    const summary = {
        reBreaths: rb.length, notes: kept.length, merged: notes.length - kept.length, skipped: skipped.length,
        folded: kept.filter(n => n.fold).length, octave: O.octave | 0, level: O.level,
        keyLo: kept.length ? Math.min.apply(null, kept.map(n => n.key)) : null,
        keyHi: kept.length ? Math.max.apply(null, kept.map(n => n.key)) : null,
        detuneMax: det.length ? Math.max.apply(null, det) : 0,
        detuneMean: det.length ? Math.round(det.reduce((s, x) => s + x, 0) / det.length) : 0,
        span: kept.length ? [kept[0].t, r3(Math.max.apply(null, kept.map(n => n.t + n.dur)))] : null,
    };
    return { groupId, notes: kept, skipped, summary };
}

function describe(gen) {
    const s = gen.summary;
    return s.reBreaths + ' re-breaths → ' + s.notes + ' piano harmonic' + (s.notes === 1 ? '' : 's') + (s.merged ? ' (' + s.merged + ' merged)' : '') +
        (s.skipped ? ' · ' + s.skipped + ' skipped' : '') + ' · ' + (s.octave ? 'an octave above' : 'at the pitch') +
        (s.notes ? ' · keys ' + nm(s.keyLo) + '–' + nm(s.keyHi) + ' · detune ≤ ' + s.detuneMax + ' c (mean ' + s.detuneMean + ')' : '') +
        (s.folded ? ' · ' + s.folded + ' folded an octave' : '') + ' · level ' + (s.level != null ? s.level : 'as the source');
}

// the score objects: plain sounding notes on the piano lane at the `harmonics` technique, a flat curve at the level, joined to the
// morph's group (they travel with its shape), each carrying its provenance under properties.pianoHarmonics
function toScoreObjects(gen, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const labels = O.laneLabels || [];
    let nid = O.startId != null ? O.startId : 1;
    return gen.notes.map(n => {
        const src = (labels[n.srcLane] || ('lane ' + n.srcLane)) + ' ' + nm(n.srcMidi) + (n.srcCents ? ' ' + (n.srcCents > 0 ? '+' : '') + n.srcCents + ' c' : '');
        const y = Math.max(0, Math.min(10, Math.round(n.level * 10) / 10));
        return {
            id: 'wc-' + (nid++), type: 'waveCurve', layer: O.pianoLane, groupId: gen.groupId,
            startSeconds: r3(n.t), endSeconds: r3(n.t + n.dur),
            nodes: [{ pos: 0, y: y, smooth: 0.25 }, { pos: 1, y: y, smooth: 0.25 }],
            segments: [{ model: 'bezier', slope: 0 }],
            color: O.color, fillMode: 'bottom', opacity: 0.55,
            performanceNotes: 'pno harmonic ← ' + src + ' · string ' + nm(n.string) + ', partial 2 (the octave) sounds ' + nm(n.sounds) +
                (n.detuneCents ? ' (' + (n.detuneCents > 0 ? '+' : '') + n.detuneCents + ' c)' : '') + (n.fold ? ' · folded ' + n.fold + ' oct' : '') +
                (n.merged.length ? ' · ' + (n.merged.length + 1) + ' re-breaths' : ''),
            properties: { pianoHarmonics: { of: gen.groupId, pass: 'unshifted', octave: n.octave, srcId: n.srcId, srcLane: n.srcLane, srcMidi: n.srcMidi,
                                            srcCents: n.srcCents, string: n.string, partial: n.partial, sounds: n.sounds, detuneCents: n.detuneCents,
                                            fold: n.fold, merged: n.merged.slice() } },
            sonifyNote: n.key, technique: O.technique,
        };
    });
}

// the piano harmonics a morph already has, and the score without them
function ownedBy(objects, groupId) { return (objects || []).filter(x => isPianoHarmonic(x) && x.properties.pianoHarmonics.of === groupId); }
function stripped(objects, groupId) { return (objects || []).filter(x => !(isPianoHarmonic(x) && x.properties.pianoHarmonics.of === groupId)); }

return { DEFAULTS, NAMES, nm, pitchAtOnset, peakOf, isMorphGroupId, isPianoHarmonic, morphGroups, findMorphAt, reBreaths, harmonicFor,
         generate, describe, toScoreObjects, ownedBy, stripped };
}));
