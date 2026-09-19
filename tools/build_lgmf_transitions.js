#!/usr/bin/env node
// build_lgmf_transitions.js — PLAN 1a.6 (2026-09-19): the four transition scores.
//
//   scores/lgmf-spectral.json · lgmf-balance.json · lgmf-bloom.json · lgmf-converge.json
//
// Each is the six transitions of one type in HIS order of fundamentals — B♭1 · A1 · C2 · G♯1 · B1 ·
// F♯1 — ninety seconds each with a ten-second gap: 590 s, 9:50. Decision 5: one score per type.
//
// HEADLESS, AND IT PLACES RATHER THAN RE-RENDERS. The item allowed either the morph tool's own emit in
// node or driving his tab; morph.js requires cleanly in node, so 1a.5 already rendered each transition
// once and filed it as an actual. This tool does what the panel's `insertActual` does, in the same
// shape and for the same reason — **a stored actual's identity is frozen; a later engine change must
// never re-render what is already placed** — so each transition arrives here as:
//   · its notes, VERBATIM from bank/actuals/, offset in time and given a groupId;
//   · a MARKER naming the entity, so the score says which model made it (principle 4: markers are
//     objects, never data.markers);
//   · a band on the META lane spanning it, which is the panel's own visual handle.
// That marker + groupId IS the link back to the model: `ACT-LGCONVERGE-03` in the score names the
// actual, whose provenance carries the model id, the dials, the seed and the cast, and the panel's
// "recall" reopens the card on exactly those (1a.0 ii).
//
//   node tools/build_lgmf_transitions.js          # writes all four
//   node tools/build_lgmf_transitions.js --dry    # print the plan only
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const BANK = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'reference_chords.json'), 'utf8'));
const ACTUALS = path.join(ROOT, 'bank', 'actuals');
const SCORES = path.join(ROOT, 'scores');

const TRANSITION_S = 90;   // decision 9
const GAP_S = 10;          // decision 2, as the reference score
const META_LAYER = 8;      // notation/registry/ensemble.json metaLayer — this piece's META lane
const TYPES = [
    { type: 'SPECTRAL', file: 'lgmf-spectral', color: '#3F7CAC' },
    { type: 'BALANCE',  file: 'lgmf-balance',  color: '#4F7942' },
    { type: 'BLOOM',    file: 'lgmf-bloom',    color: '#C77D3A' },
    { type: 'CONVERGE', file: 'lgmf-converge', color: '#B5495B' },
];

// the app's TRACKS, in lane order (composer.html; layoutVersion 7)
const vm = require('vm');
const html = fs.readFileSync(path.join(ROOT, 'score', 'public', 'composer.html'), 'utf8');
const TRACKS = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});

const r3 = x => Math.round(x * 1000) / 1000;

function buildScore(T) {
    const objects = [];
    const rows = [];
    let nid = 1;
    BANK.chords.forEach((C, ci) => {
        const entity = 'ACT-LG' + T.type + '-' + String(C.n).padStart(2, '0');
        const a = JSON.parse(fs.readFileSync(path.join(ACTUALS, entity + '.json'), 'utf8'));
        const at = ci * (TRANSITION_S + GAP_S);
        const slug = entity.toLowerCase();
        const gid = 'grp-' + slug;
        const notes = a.objects.filter(o => o.morphBend);
        const t0 = Math.min.apply(null, notes.map(o => o.startSeconds));

        objects.push({ id: 'mk-' + slug, type: 'marker', layer: 0, time: r3(at),
            label: entity + ' — ' + (a.label || ''), color: T.color, groupId: gid,
            performanceNotes: 'chord ' + C.n + ' on ' + C.fundamental.name + ' · recall this entity in the morph panel to reopen its dials',
            properties: {} });

        a.objects.forEach(o => {
            objects.push(Object.assign(JSON.parse(JSON.stringify(o)), {
                id: 'wc-' + (nid++), groupId: gid, color: T.color,
                startSeconds: r3(o.startSeconds - t0 + at),
                endSeconds: r3(o.endSeconds - t0 + at),
                cc7Fade: o.cc7Fade ? { start: r3(o.cc7Fade.start - t0 + at), end: r3(o.cc7Fade.end - t0 + at),
                                       from: o.cc7Fade.from, curve: o.cc7Fade.curve } : undefined,
            }));
        });
        // the META band, the panel's own handle on a placed gesture
        objects.push({ id: 'wc-' + (nid++), type: 'waveCurve', layer: META_LAYER, groupId: gid,
            startSeconds: r3(at), endSeconds: r3(at + a.spanSec),
            nodes: [{ pos: 0, y: 5, smooth: 0.35 }, { pos: 1, y: 5, smooth: 0.35 }],
            segments: [{ model: 'bezier', slope: 0 }],
            color: T.color, fillMode: 'bottom', opacity: 0.45,
            performanceNotes: entity + ' (drag = move, edge/box = stretch)', properties: {} });

        rows.push({ chord: C.n, fund: C.fundamental.name, entity, at, notes: notes.length, span: a.spanSec });
    });
    return { objects, rows, nextId: nid + 2 };
}

const spanS = 5 * (TRANSITION_S + GAP_S) + TRANSITION_S;
console.log('THE FOUR TRANSITION SCORES — six transitions each, ' + TRANSITION_S + ' s with ' + GAP_S + ' s gaps ('
    + Math.floor(spanS / 60) + ':' + String(spanS % 60).padStart(2, '0') + ')\n');

const written = [];
TYPES.forEach(T => {
    const { objects, rows, nextId } = buildScore(T);
    const notes = objects.filter(o => o.type === 'waveCurve' && o.sonifyNote != null).length;
    console.log('  ' + (T.file + '.json').padEnd(22) + String(notes).padStart(4) + ' notes · '
        + rows.length + ' transitions · ' + rows.map(r => r.fund).join(' '));
    if (DRY) return;
    const now = new Date().toISOString();
    const save = {
        version: 1, layoutVersion: 7, tracks: TRACKS, assets: {},
        metadata: {
            created: now, modified: now,
            note: 'PLAN 1a.6 — the six ' + T.type.toLowerCase() + ' transitions of COMPOSITION_NOTES LG-28, in his order of '
                + 'fundamentals, ' + TRANSITION_S + ' s each with ' + GAP_S + ' s gaps. GENERATED by '
                + 'tools/build_lgmf_transitions.js: each gesture is PLACED VERBATIM from its actual in bank/actuals/ '
                + '(ACT-LG' + T.type + '-01…06), never re-rendered. The marker at the head of each group names the actual; '
                + 'recall it in the morph panel to reopen the model on its own dials, change one, and re-emit.',
        },
        objects, markers: [],
        databases: { chordShapes: [], sets: [], cells: [] },
        nextId,
        viewport: { pixelsPerSecond: 9, scrollOffset: 0 },
    };
    fs.writeFileSync(path.join(SCORES, T.file + '.json'), JSON.stringify(save, null, 1) + '\n');
    written.push(T.file);
    // the placement log the panel keeps (2y §5): "where have I used this"
    rows.forEach(r => {
        const p = path.join(ACTUALS, r.entity + '.json');
        const a = JSON.parse(fs.readFileSync(p, 'utf8'));
        a.placements = (a.placements || []).filter(x => x.score !== T.file);
        a.placements.push({ score: T.file, at: r.at, group: 'grp-' + r.entity.toLowerCase(),
                            when: new Date().toISOString().slice(0, 10) });
        fs.writeFileSync(p, JSON.stringify(a, null, 2) + '\n');
    });
});

if (!DRY) {
    console.log('\nwrote ' + written.map(f => 'scores/' + f + '.json').join(' · '));
    console.log('and logged the placement of all 24 actuals.');
}
