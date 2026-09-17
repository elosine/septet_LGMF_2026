// piano_cues.js — THE PIANO'S ARTICULATION POINTS FROM A MORPH (PLAN 1j; CN-43; RUNNING_LOG §219–228).
//
// His idea: "just articulation points. These can maybe appear as lines in the piano part, but initially with nothing attached. And
// the line should come from any of the morph onsets, the rebreath, the peak point, those dots, and the end of a breath. And then …
// click on any of those lines. and assigned a pitch and an articulation … duration and dynamic."
//
// THE MODEL (decided §220–222): a LINE IS AN EMPTY NOTE — a waveCurve on the piano lane with no `sonifyNote`, a nominal span, and its
// provenance under `properties.cue` (the kind, the morph's group, the source note, its player, its pitch and level at that instant;
// NAMING §2.13). The score already treats a shape without a sound note as silent and invisible to the extractor; this module only
// makes them from a placed morph — for every note of every player its ONSET (the re-breath), its PEAK where the score's apex rule finds
// one (composer.html's dot: the loudest interior node, at least as loud as both ends) and its END; a seamless re-key (the engine's
// 5 ms overlap) gives no line. The picker (cue_picker.js) turns a line into an ordinary piano note with `cueToNote`; the bar on the
// piano lane shows lines by kind AND player (`shown`). Pure: no DOM, no MIDI; the page (window.PianoCues) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.PianoCues = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const KINDS = ['onset', 'peak', 'end'];
const KIND_MARK = { onset: '●', peak: '◆', end: '○' };
const KIND_LABEL = { onset: 'onset', peak: 'peak', end: 'end' };
const DYN = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];           // NAMING §2.9: the level 0 … 1 in eight equal steps
const PRESETS = [0.25, 0.5, 1, 2, 4];                                     // the duration presets, seconds; 'next' = to the next line
const INST_COL = { flute: '#ffd479', bass_clarinet: '#e08a8a', violin1: '#8ea9c9', violin2: '#69b7c9', viola: '#b58ec9', cello: '#7ec9a8', piano: '#e8cf9a' };
const DEFAULTS = {
    pianoLane: 2, metaLayer: 7,
    span: 0.05,               // a line's nominal length in the file (drawn at its start)
    rekeyGapS: 0.012,         // two notes of one player closer than this are one breath re-keyed (the engine's 5 ms overlap): no line
    defaultHeight: 5,         // an empty line's stored height (mf) — the dynamic the picker starts from
    defaultDur: 1,            // the picker's default duration, seconds
    laneLabels: null,         // ['Fl', 'BCl', …] for the texts; lane numbers when absent
    instKeys: null,           // ['flute', 'bass_clarinet', …] for the colours; grey when absent
};

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const r3 = x => Math.round(x * 1000) / 1000;
const opt = o => Object.assign({}, DEFAULTS, o || {});

// the dynamics ↔ the curve height (0 … 10)
const dynLevel = name => { const i = DYN.indexOf(name); return i < 0 ? null : i / 7; };
const dynHeight = name => { const l = dynLevel(name); return l == null ? null : Math.round(l * 100) / 10; };
const dynName = h => DYN[Math.max(0, Math.min(7, Math.round((Math.max(0, Math.min(10, +h || 0)) / 10) * 7)))];

// linear interpolation over note-relative [[dtSec, cents], …] (composer.html's morphBendAt)
function bendAt(bp, dt) {
    if (!bp || !bp.length) return 0;
    if (dt <= bp[0][0]) return bp[0][1];
    for (let i = 1; i < bp.length; i++) {
        if (dt <= bp[i][0]) { const a = bp[i - 1], b = bp[i], f = (dt - a[0]) / Math.max(1e-9, b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; }
    }
    return bp[bp.length - 1][1];
}
// the player's pitch at an instant: the key plus the bend there (a float; cents / 100)
function pitchAt(o, t) { return o.sonifyNote + bendAt(o.morphBend, t - o.startSeconds) / 100; }
// the level curve at an instant (0 … 10), a straight line between nodes — near enough for "the level there"
function levelAt(o, t) {
    const nodes = o.nodes || []; if (!nodes.length) return 10;
    const dur = Math.max(1e-9, o.endSeconds - o.startSeconds), pos = Math.max(0, Math.min(1, (t - o.startSeconds) / dur));
    if (pos <= nodes[0].pos) return +nodes[0].y;
    for (let i = 1; i < nodes.length; i++) {
        if (pos <= nodes[i].pos) { const a = nodes[i - 1], b = nodes[i], f = (pos - a.pos) / Math.max(1e-9, b.pos - a.pos); return r3(+a.y + (+b.y - +a.y) * f); }
    }
    return +nodes[nodes.length - 1].y;
}
// the score's apex rule (composer.html, the dot of 2026-08-10): the loudest interior node, at least as loud as both ends; 2-node ramps none
function apexOf(o) {
    const n = o.nodes || []; if (n.length < 3) return null;
    let idx = -1, y = -Infinity;
    for (let i = 1; i < n.length - 1; i++) if (+n[i].y > y) { y = +n[i].y; idx = i; }
    if (idx < 0 || y < +n[0].y || y < +n[n.length - 1].y) return null;
    return { idx, pos: +n[idx].pos, y };
}

function isCueBorn(o) { return !!(o && o.type === 'waveCurve' && o.properties && o.properties.cue); }
function isCueLine(o) { return isCueBorn(o) && o.sonifyNote == null; }
function isCueNote(o) { return isCueBorn(o) && o.sonifyNote != null; }
function isMorphGroupId(gid) { return /^grp-morph-/.test(gid || ''); }

// the morph's sounding notes on the players' lanes (never the piano's lane, the META shape, a line or a piano harmonic), per lane in time order
function morphNotes(objects, groupId, o) {
    const O = opt(o);
    return (objects || []).filter(x => x.groupId === groupId && x.type === 'waveCurve' && x.sonifyNote != null && x.layer !== O.pianoLane && x.layer !== O.metaLayer &&
                                       !(x.properties && (x.properties.cue || x.properties.pianoHarmonics)))
        .sort((a, b) => a.layer - b.layer || a.startSeconds - b.startSeconds);
}

// THE MOMENTS of one morph: onset · peak · end per note; a re-key boundary (the next note within rekeyGapS of this one's end) gives
// neither the end nor the next onset
function moments(objects, groupId, o) {
    const O = opt(o), notes = morphNotes(objects, groupId, O), out = [];
    // a moment that already has a note made from its line is used: no fresh line for it (a re-run keeps the notes made)
    const made = O.skipMade === false ? new Set() : new Set(ownedNotes(objects, groupId).map(x => x.properties.cue.kind + '|' + x.properties.cue.srcId));
    const byLane = {};
    notes.forEach(x => (byLane[x.layer] = byLane[x.layer] || []).push(x));
    Object.keys(byLane).forEach(k => {
        const ns = byLane[k];
        ns.forEach((x, i) => {
            const prev = ns[i - 1], next = ns[i + 1];
            const rekeyIn = !!(prev && x.startSeconds - prev.endSeconds <= O.rekeyGapS);
            const rekeyOut = !!(next && next.startSeconds - x.endSeconds <= O.rekeyGapS);
            const mk = (kind, t, level) => {
                if (made.has(kind + '|' + x.id)) return;
                const p = pitchAt(x, t);
                out.push({ kind, t: r3(t), lane: x.layer, srcId: x.id, srcMidi: x.sonifyNote, srcCents: Math.round((p - x.sonifyNote) * 100),
                           srcPitch: r3(p), level: level != null ? level : levelAt(x, t), technique: x.technique });
            };
            if (!rekeyIn) mk('onset', x.startSeconds);
            const ap = apexOf(x);
            if (ap) mk('peak', x.startSeconds + ap.pos * (x.endSeconds - x.startSeconds), ap.y);   // the apex's own level
            if (!rekeyOut) mk('end', x.endSeconds);
        });
    });
    return out.sort((a, b) => a.t - b.t || a.lane - b.lane || KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind));
}

function colorOf(lane, O) { const k = O.instKeys && O.instKeys[lane]; return (k && INST_COL[k]) || '#999'; }
function labelOf(lane, O) { return (O.laneLabels && O.laneLabels[lane]) || ('lane ' + lane); }
function sourceText(cue, O) {
    return labelOf(cue.srcLane, O) + ' ' + nm(cue.srcMidi) + (cue.srcCents ? ' ' + (cue.srcCents > 0 ? '+' : '') + cue.srcCents + ' c' : '') + ' · ' + KIND_LABEL[cue.kind] + ' · ' + (+cue.t).toFixed(2) + ' s';
}

// the score objects: empty notes on the piano lane in the morph's group, the provenance under properties.cue
function toScoreObjects(ms, groupId, o) {
    const O = opt(o);
    let nid = O.startId != null ? O.startId : 1;
    return ms.map(m => {
        const cue = { kind: m.kind, of: groupId, srcId: m.srcId, srcLane: m.lane, srcMidi: m.srcMidi, srcCents: m.srcCents, srcPitch: m.srcPitch, level: m.level, t: m.t };
        return {
            id: 'wc-' + (nid++), type: 'waveCurve', layer: O.pianoLane, groupId: groupId,
            startSeconds: r3(m.t), endSeconds: r3(m.t + O.span),
            nodes: [{ pos: 0, y: O.defaultHeight, smooth: 0.25 }, { pos: 1, y: O.defaultHeight, smooth: 0.25 }],
            segments: [{ model: 'bezier', slope: 0 }],
            color: colorOf(m.lane, O), fillMode: 'bottom', opacity: 0.55,
            performanceNotes: 'cue ' + KIND_MARK[m.kind] + ' ' + sourceText(cue, O),
            properties: { cue },
            sonifyNote: null,
        };
    });
}

// the lines (still without a pitch) a morph already has; the score without them; the notes born of its lines
function ownedLines(objects, groupId) { return (objects || []).filter(x => isCueLine(x) && x.properties.cue.of === groupId); }
function ownedNotes(objects, groupId) { return (objects || []).filter(x => isCueNote(x) && x.properties.cue.of === groupId); }
function strippedLines(objects, groupId) { return (objects || []).filter(x => !(isCueLine(x) && x.properties.cue.of === groupId)); }
function allLines(objects, lane) { return (objects || []).filter(x => isCueLine(x) && (lane == null || x.layer === lane)); }

function describe(ms, o) {
    const O = opt(o), byKind = {}, byLane = {};
    ms.forEach(m => { byKind[m.kind] = (byKind[m.kind] || 0) + 1; byLane[m.lane] = (byLane[m.lane] || 0) + 1; });
    return ms.length + ' lines — ' + KINDS.map(k => (byKind[k] || 0) + ' ' + k + (byKind[k] === 1 ? '' : 's')).join(' · ') +
        ' — ' + Object.keys(byLane).sort((a, b) => a - b).map(l => labelOf(+l, O) + ' ' + byLane[l]).join(' · ');
}

// THE VIEW FILTER (step 4): a line is shown when its kind is ticked AND its player is ticked
function defaultFilter(lanes) {
    const players = {}; (lanes || []).forEach(l => { players[l] = true; });
    return { kinds: { onset: true, peak: true, end: true }, players };
}
function shown(o, filter) {
    if (!isCueLine(o)) return true;
    if (!filter) return true;
    const c = o.properties.cue;
    const k = filter.kinds ? filter.kinds[c.kind] : true, p = filter.players ? filter.players[c.srcLane] : true;
    return (k !== false) && (p !== false);
}

// THE ENSEMBLE AT AN INSTANT (step 3): every sounding note on a lane below META at t, with its pitch there
function ensembleAt(objects, t, o) {
    const O = opt(o);
    return (objects || []).filter(x => x.type === 'waveCurve' && x.sonifyNote != null && x.layer < O.metaLayer && x.startSeconds <= t + 1e-9 && t < x.endSeconds - 1e-9)
        .map(x => { const p = pitchAt(x, t); return { lane: x.layer, id: x.id, midi: x.sonifyNote, pitch: r3(p), cents: Math.round((p - x.sonifyNote) * 100), technique: x.technique, level: levelAt(x, t), cue: !!(x.properties && x.properties.cue) }; })
        .sort((a, b) => a.lane - b.lane || a.pitch - b.pitch);
}

// the next line (or note) on the piano lane after t: the duration preset "to the next line" — a line within minGap (50 ms: the
// pairs breathing together, a peak beside an onset) is the same moment, not the next
function nextAfter(objects, t, o) {
    const O = opt(o), gap = O.minGap != null ? O.minGap : 0.05;
    const ts = (objects || []).filter(x => x.type === 'waveCurve' && x.layer === O.pianoLane && x.startSeconds > t + gap).map(x => x.startSeconds);
    return ts.length ? r3(Math.min.apply(null, ts)) : null;
}

// THE TURN INTO A NOTE (and the edit of a made note): the same object, the provenance kept
function cueToNote(o, v, O_) {
    const O = opt(O_);
    if (!isCueBorn(o)) throw new Error('not a cue-born object');
    const height = v.height != null ? Math.max(0, Math.min(10, +v.height)) : (o.nodes && o.nodes.length ? +o.nodes[0].y : O.defaultHeight);
    const dur = v.dur != null ? Math.max(0.02, +v.dur) : Math.max(0.02, o.endSeconds - o.startSeconds);
    o.sonifyNote = Math.max(0, Math.min(127, Math.round(+v.pitch)));
    if (v.technique) o.technique = v.technique;
    o.nodes = [{ pos: 0, y: height, smooth: 0.25 }, { pos: 1, y: height, smooth: 0.25 }];
    o.segments = [{ model: 'bezier', slope: 0 }];
    o.endSeconds = r3(o.startSeconds + dur);
    o.opacity = 0.55;
    const c = o.properties.cue;
    o.performanceNotes = 'pno ' + (o.technique || 'main') + ' ' + nm(o.sonifyNote) + ' ' + dynName(height) + ' ' + dur.toFixed(2) + ' s ← ' + sourceText(c, O);
    return o;
}

return { KINDS, KIND_MARK, KIND_LABEL, DYN, PRESETS, INST_COL, DEFAULTS, nm, bendAt, pitchAt, levelAt, apexOf, dynLevel, dynHeight, dynName,
         isCueBorn, isCueLine, isCueNote, isMorphGroupId, morphNotes, moments, colorOf, labelOf, sourceText, toScoreObjects,
         ownedLines, ownedNotes, strippedLines, allLines, describe, defaultFilter, shown, ensembleAt, nextAfter, cueToNote };
}));
