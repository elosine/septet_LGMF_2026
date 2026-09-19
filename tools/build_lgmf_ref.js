#!/usr/bin/env node
// build_lgmf_ref.js — PLAN 1a.4 (2026-09-19): `scores/lgmf-ref.json`, the six reference harmonies
// as a score he can open and play — one minute of each, a ten-second gap between them.
//
// His brief (LG-29): *"one minute of each of the six reference harmonies, a bit of a gap … striated …
// never exceeding the max."* Decisions 2 and 3 (RUNNING_LOG §66b): the gap is 10 s, and the striation is
// the piece's own breath machinery, not a new one.
//
// WRITTEN, NEVER DRAWN. The file is the composer app's own save shape (layoutVersion 7, eight lanes) and
// is produced from bank/reference_chords.json — principle 9: the AI never saves from its own browser pane.
//
//   node tools/build_lgmf_ref.js            # writes scores/lgmf-ref.json
//   node tools/build_lgmf_ref.js --dry      # print the plan only
//   node tools/build_lgmf_ref.js --seed N   # another breath deal
//
// THE FOUR THINGS THAT MAKE IT SOUND AS HE ASKED
//  1 · dal niente → mf. `cc7Fade` — the morph tool's own field, read by the composer's playback, the
//      notation player, ensemble_dyn and the overlays: CC7 is multiplied by a weight rising 0 → 1 over the
//      first FADE_S seconds of each voice's first segment. The written dynamic stays mf throughout, which
//      is what D13 wants (velocity is the dynamic; CC7 shapes a held note).
//  2 · mf is a NUMBER here, not a word: ensemble_dyn's scale is eight equal steps, ppp…fff, so mf = 4/7 of
//      full height = **y 5.71**. That is also the level the 1a.2 ceilings are quoted at.
//  3 · The striation is `BC.dealBreaths` + `BC.breathSpans` — the breath dealer of beating_calc.js, which
//      reads the SAME `ceilingFor` the morph carrier reads (1a.2), takes a per-voice PHASE so no two
//      voices re-articulate together, is seeded, and never lets a span exceed the ceiling. The morph's own
//      buildCarrier is welded to a morph render (progress, models, bends) and this score is not a morph.
//      Target 80 % of the ceiling with ±25 % jitter = the item's "60–100 %".
//  4 · Cents. A just voice carries a flat `morphBend` for its whole note — [[0, c], [dur, c]] — so the note
//      STARTS at its partial (the bend is pre-armed at note-on) instead of scooping into it. Tempered
//      voices carry none at all, which is what makes the beating.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const BC = require(path.join(ROOT, 'score', 'public', 'beating_calc.js'));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const DRY = args.includes('--dry');
// SEED 71 is CHOSEN, not arbitrary: the two vibraphone bows share one ceiling (7.4 s) and so lay down
// nearly the same breath grid, and their boundaries wander across each other as the jitter drifts. No
// phase prevents that — only a scheduler would — so the seed was swept and 71 is the one that leaves the
// fewest instants where the player would have to re-seat BOTH bows at once (1, against 3–9 elsewhere).
const SEED = Number(opt('seed', 71));
const OUT = path.join(ROOT, 'scores', 'lgmf-ref.json');

const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const BANK = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'reference_chords.json'), 'utf8'));

// the app's TRACKS, in lane order (composer.html; layoutVersion 7)
const TRACKS = [
    { id: 'english_horn', label: 'Eng. Horn', short: 'EH', instKey: 'english_horn' },
    { id: 'bassoon', label: 'Bassoon', short: 'Bsn', instKey: 'bassoon' },
    { id: 'horn', label: 'Horn', short: 'Hn', instKey: 'horn' },
    { id: 'trumpet', label: 'Trumpet', short: 'Tpt', instKey: 'trumpet' },
    { id: 'percussion', label: 'Percussion', short: 'Perc', instKey: 'percussion' },
    { id: 'vibraphone', label: 'Vibraphone', short: 'Vib', instKey: 'bowed_vibraphone' },
    { id: 'cello', label: 'Cello', short: 'Vc', instKey: 'cello' },
    { id: 'double_bass', label: 'D. Bass', short: 'Db', instKey: 'double_bass' },
];

const HOLD_S = 60;        // decision: one minute of each chord
const GAP_S = 10;         // decision 2 ("2 10s")
const FADE_S = 3;         // the item's "fade 3 s"
const MF_Y = 40 / 7;      // 5.714 — ensemble_dyn's eight equal steps, mf = index 4 of 0..7
const MF_LEVEL = 4 / 7;   // the same number as a 0..1 level, for ceilingFor
const TARGET_FRAC = 0.8;  // 80 % of the ceiling …
const JITTER = 0.25;      // … ±25 % → the item's 60–100 %
const COLORS = ['#5E8C7A', '#7E57C2', '#C77D3A', '#3F7CAC', '#B5495B', '#4F7942'];

const r3 = x => Math.round(x * 1000) / 1000;

function build() {
    const objects = [];
    const rows = [];
    let nid = 1;
    const id = () => 'wc-' + (nid++);

    BANK.chords.forEach((C, ci) => {
        const t0 = ci * (HOLD_S + GAP_S);
        const gid = 'grp-lgmf-ref-' + C.n;
        const color = COLORS[ci % COLORS.length];
        objects.push({
            id: 'mk-ref-' + C.n, type: 'marker', layer: 0, time: t0,
            label: 'CHORD ' + C.n + ' · ' + C.fundamental.name,
            color: color, groupId: gid, performanceNotes: '', properties: {},
        });
        C.voices.forEach((v, vi) => {
            const inst = v.instrument;
            const ceil = BC.ceilingFor(inst, MF_LEVEL);
            const target = Math.min(ceil.seconds, ceil.seconds * TARGET_FRAC);
            // A PHASE PER VOICE, spread evenly round the deal so no two re-articulate together — over
            // 0…0.6 of the target, NOT dealBreaths' full 0…0.95. At 0.95 the shortened first segment hits
            // that function's own floor (25 % of the target) and several voices COLLAPSE onto the same
            // first re-articulation: the two vibraphone bows did exactly that, which is the worst case —
            // one player changing both bows at the same instant. At 0.6 the floor is never reached, every
            // voice's first segment is distinct, and the spread is still seconds wide.
            const phase = (vi / C.voices.length) * 0.6;
            const marks = BC.dealBreaths({ inst, level: MF_LEVEL, length: HOLD_S, target,
                                           jitter: JITTER, phase, seed: SEED + C.n * 97 + vi });
            const spans = BC.breathSpans('designated', marks, HOLD_S, ceil.gapS);
            const ord = recipe[inst].ordinary;
            spans.forEach((sp, si) => {
                const s = r3(t0 + sp[0]), e = r3(t0 + sp[1]);
                const dur = r3(e - s);
                const o = {
                    id: id(), type: 'waveCurve', layer: v.part, groupId: gid,
                    startSeconds: s, endSeconds: e,
                    nodes: [{ pos: 0, y: MF_Y, smooth: 0.25 }, { pos: 1, y: MF_Y, smooth: 0.25 }],
                    segments: [{ model: 'power', slope: 0 }],
                    color, fillMode: 'bottom', opacity: 0.55,
                    performanceNotes: 'chord ' + C.n + ' · ' + v.short + (v.bow ? ' bow ' + v.bow : '')
                        + (v.stop ? ' (' + v.stop + ')' : '') + ' · ' + v.name
                        + (v.partial != null ? ' · partial ' + v.partial : ' · doubles ' + (v.doubles || ''))
                        + ' · ' + (v.cents ? v.cents + '¢ just' : 'tempered'),
                    properties: {},
                    sonifyNote: v.midi,
                    technique: ord,
                };
                // the just voices carry their partial's deviation, flat for the whole note
                if (v.cents) o.morphBend = [[0, v.cents], [dur, v.cents]];
                // dal niente on the voice's FIRST segment only; it holds at mf from there
                if (si === 0) o.cc7Fade = { start: s, end: r3(s + FADE_S), from: 0, curve: 'held' };
                objects.push(o);
                rows.push({ chord: C.n, voice: v.id, inst, short: v.short, seg: si + 1, of: spans.length,
                            start: s, end: e, dur, ceiling: ceil.seconds, kind: ceil.kind,
                            midi: v.midi, cents: v.cents });
            });
        });
    });
    return { objects, rows, nextId: nid };
}

const { objects, rows, nextId } = build();
const spanS = 5 * (HOLD_S + GAP_S) + HOLD_S;

// ---- the required check: no segment longer than its instrument's ceiling at mf
const over = rows.filter(r => r.dur > r.ceiling + 1e-6);
const byInst = {};
rows.forEach(r => {
    const b = byInst[r.inst] || (byInst[r.inst] = { n: 0, min: Infinity, max: 0, midMin: Infinity, ceiling: r.ceiling, kind: r.kind });
    b.n++; b.min = Math.min(b.min, r.dur); b.max = Math.max(b.max, r.dur);
    // THE 60–100 % RULE GOVERNS THE MIDDLE. A voice's FIRST segment is deliberately cut short by its phase
    // (that is the stagger) and its LAST is whatever is left of the minute, so neither can be held to it.
    if (r.seg > 1 && r.seg < r.of) b.midMin = Math.min(b.midMin, r.dur);
});

// how close do two voices of the same chord come to re-articulating together?
const coincid = [];
BANK.chords.forEach(C => {
    const ends = rows.filter(r => r.chord === C.n && r.seg < r.of).map(r => ({ t: r.end, v: r.voice }));
    ends.sort((a, b) => a.t - b.t);
    for (let i = 1; i < ends.length; i++) {
        if (ends[i].t - ends[i - 1].t < 0.3 && ends[i].v !== ends[i - 1].v) {
            coincid.push('chord ' + C.n + ': ' + ends[i - 1].v + ' and ' + ends[i].v + ' within '
                + r3(ends[i].t - ends[i - 1].t) + ' s at ' + r3(ends[i].t));
        }
    }
});

console.log('scores/lgmf-ref.json — the six reference harmonies, ' + HOLD_S + ' s each, ' + GAP_S + ' s gaps\n');
console.log('  span ' + spanS + ' s (' + Math.floor(spanS / 60) + ':' + String(spanS % 60).padStart(2, '0') + ') · '
    + objects.filter(o => o.type === 'waveCurve').length + ' notes · ' + objects.filter(o => o.type === 'marker').length + ' markers · breath seed ' + SEED + '\n');
// THE 60–100 % BAND IS A DESCRIPTION, NOT A GATE — the gate is the ceiling. Three kinds of segment sit
// under 60 % by construction and none of them is a fault: a voice's FIRST is cut short by its phase (that
// IS the stagger), its LAST is whatever is left of the minute, and dealBreaths squeezes the one before the
// last so the last keeps at least 40 % of the target. So the count is printed with WHERE they fall.
console.log('  ' + 'instrument'.padEnd(23) + 'ceiling  segs  shortest  longest   under 60 %');
Object.keys(byInst).forEach(k => {
    const b = byInst[k];
    const lo = b.ceiling * 0.6;
    const under = rows.filter(r => r.inst === k && r.dur < lo - 1e-6);
    const where = under.length ? '  (' + under.filter(r => r.seg === 1).length + ' first · '
        + under.filter(r => r.seg === r.of).length + ' last · '
        + under.filter(r => r.seg > 1 && r.seg < r.of).length + ' inner)' : '';
    console.log('  ' + (k + ' (' + b.kind + ')').padEnd(23) + String(b.ceiling).padEnd(9) + String(b.n).padEnd(6)
        + String(r3(b.min)).padEnd(10) + String(r3(b.max)).padEnd(10) + under.length + where);
});
// NEAR-COINCIDENCES. The phase guarantees every voice a DISTINCT first re-articulation; after that, with
// ~58 breaths a minute across eight voices the density is about one a second, so some will fall close by
// chance. That is not synchronisation and it is not worth scheduling away. The one pair that MATTERS is
// the two vibraphone bows, because they are one player's two hands on one instrument — reported alone.
const vibPair = coincid.filter(c => c.indexOf('vib1') >= 0 && c.indexOf('vib2') >= 0);
console.log('\n  re-articulations within 0.3 s of another voice: ' + coincid.length + ' of ' + rows.length
    + ' (~1 a second across 8 voices — chance, not synchronisation)');
console.log('  the two VIBRAPHONE bows within 0.3 s of each other: ' + vibPair.length
    + (vibPair.length ? '\n   ' + vibPair.join('\n   ') : ' — never; the player never changes both bows at once'));
console.log('\n  chord 1, who re-articulates when (the phase spread):');
rows.filter(r => r.chord === 1).forEach(r => {
    if (r.seg === 1) console.log('   ' + r.short.padEnd(5) + 'segments ' + String(r.of).padStart(2) + '  first ends at '
        + String(r3(r.end - 0)).padStart(7) + ' s');
});

if (over.length) {
    console.log('\nCEILING RED — ' + over.length + ' segment(s) exceed their instrument\'s ceiling at mf:');
    over.slice(0, 10).forEach(r => console.log('  ✗ chord ' + r.chord + ' ' + r.short + ' seg ' + r.seg + ': ' + r.dur + ' s > ' + r.ceiling));
} else {
    console.log('\nCEILING GREEN — all ' + rows.length + ' segments are inside their instrument\'s ceiling at mf.');
}

if (!DRY) {
    const now = new Date().toISOString();
    const save = {
        version: 1,
        layoutVersion: 7,
        tracks: TRACKS,
        assets: {},
        metadata: {
            created: now, modified: now,
            note: 'PLAN 1a.4 — the six reference harmonies (COMPOSITION_NOTES LG-18…LG-27), one minute each with '
                + GAP_S + ' s gaps, every voice dal niente → mf over ' + FADE_S + ' s and then striated by the breath '
                + 'ceilings of 1a.2. GENERATED by tools/build_lgmf_ref.js from bank/reference_chords.json, breath seed '
                + SEED + ' — re-run it rather than editing this file by hand.',
        },
        objects,
        markers: [],
        databases: { chordShapes: [], sets: [], cells: [] },
        nextId,
        viewport: { pixelsPerSecond: 12, scrollOffset: 0 },
    };
    fs.writeFileSync(OUT, JSON.stringify(save, null, 1) + '\n');
    console.log('\nwrote ' + path.relative(ROOT, OUT));
}
process.exit(over.length ? 1 : 0);
