#!/usr/bin/env node
// build_transition_models.js — PLAN 1a.5 (2026-09-19): the four transition types as morph models,
// filed as 24 ACTUALs — one per type per chord.
//
// WHERE THEY GO, and why not where the plan said. The item asks for "a JSON of dial settings in
// bank/transitions/ that the panel can load". It was written before 1a.0 (ii) found that the panel
// ALREADY has a model↔actual store (tools/model_bank.js, /api/actuals): filing an actual keeps the
// model id, the recipe settings, the seed, the resolved params, the cast and the pitches beside the
// rendered notes, `recallActual` reopens the card on those dials, and `insertActual` places the notes
// verbatim. A parallel folder the panel cannot read would be a worse version of it. So the 24 live in
// **bank/actuals/** as ACT-LGSPECTRAL-01 … ACT-LGCONVERGE-06, and the four MODELS they descend from
// are written into bank/morph_models.json beside piece #5's six.
//
// THE SHAPE OF ALL FOUR (his decision 9): 90 s at 30 · 30 · 30 — out, rest, back. That is one
// three-station M3 with `target.mid` and `target.dwell = 1/3`; the dwell and the span are the dials.
//   SPECTRAL  start set  → the reference → a DIFFERENT set   (1a.3's seeded picks)
//   BLOOM     reference  → nearest non-deviant partials → reference
//   CONVERGE  reference  → the unisons of LG-31 → reference
//   BALANCE   the reference held, nothing moving but the balance (M6); pp → mf swells, staggered entries
//
// WHO DOES NOT MOVE (LG-29, LG-30): the vibraphone holds its bars in every moving type — in BLOOM that
// leaves its doubling bar 14–49¢ off the bloomed series, which he accepted as the fixed point. The bass
// moves in SPECTRAL, swells in BALANCE, holds in BLOOM, and in CONVERGE leaves the root altogether to
// mirror the lowest voice above it.
//
//   node tools/build_transition_models.js          # writes the models and the 24 actuals
//   node tools/build_transition_models.js --dry    # print the plan only
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const M = require(path.join(ROOT, 'score', 'public', 'morph.js'));
const MB = require(path.join(ROOT, 'tools', 'model_bank.js'));
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const BANK = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'reference_chords.json'), 'utf8'));

// ---------------------------------------------------------------- the dials, named once
const SPAN_S = 90;          // the whole transition (decision 9)
const DWELL = 1 / 3;        // 30 · 30 · 30 — the middle third is spent ON the far station
const FADE_IN_S = 6;        // dal niente → mf (all but BALANCE)
const FADE_OUT_S = 5;       // "a 5 s fade to niente at the end (a dial)"
const SEG_S = 12;           // the carrier's target breath; each voice's own ceiling still splits it
const MF = 4 / 7;           // ensemble_dyn's eight steps: ppp…fff, mf = index 4 → level 5.714
const PP = 1 / 7;           // …and pp = index 1 → level 1.43
const SPREAD = 0.15;        // a little stagger in when each voice sets off; 0 = lockstep
const SEED = 19;

const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const clone = o => JSON.parse(JSON.stringify(o));
const voiceOf = v => ({ midi: v.midi, cents: v.cents || 0 });

// ---------------------------------------------------------------- the four stations, per chord
// Each returns { source, mid, target } as ordered voice lists in the chord's own voice order.
function stationsFor(type, C) {
    const ref = C.voices.map(voiceOf);
    const byId = {};
    C.voices.forEach((v, i) => { byId[v.id] = i; });

    if (type === 'BALANCE') return { source: ref, mid: null, target: null };

    if (type === 'BLOOM') {
        const mid = clone(ref);
        C.bloom.forEach(b => {                       // the bass and the vibraphone are not in this list
            const i = byId[b.voice];
            mid[i] = { midi: b.toMidi, cents: b.toCents };
        });
        return { source: ref, mid, target: clone(ref) };
    }

    if (type === 'SPECTRAL') {
        const src = clone(ref), tgt = clone(ref);    // the vibraphone is not in the spectral list: it holds
        C.spectral.forEach(s => {
            const i = byId[s.voice];
            src[i] = { midi: s.startMidi, cents: s.startCents };
            tgt[i] = { midi: s.endMidi, cents: s.endCents };
        });
        return { source: src, mid: clone(ref), target: tgt };
    }

    // CONVERGE — LG-31's table. The movers glide onto their partner; the bass LEAVES the root and
    // enters on the lowest voice above it, its own start offset below, and comes up onto it.
    const src = clone(ref), mid = clone(ref);
    C.converge.movers.forEach(m => {
        const i = byId[m.voice];
        mid[i] = { midi: m.midi, cents: m.toCents };
    });
    const b = C.converge.bass, bi = byId.db;
    src[bi] = { midi: b.midi, cents: b.startCents };
    mid[bi] = { midi: b.midi, cents: b.targetCents };
    return { source: src, mid, target: clone(src) };
}

// ---------------------------------------------------------------- params
function paramsFor(type, C) {
    const st = stationsFor(type, C);
    const lanes = C.voices.map(v => v.part);
    const p = {
        model: type === 'BALANCE' ? 'M6' : 'M3',
        label: 'LG ' + type.toLowerCase() + ' — chord ' + C.n + ' on ' + C.fundamental.name,
        lanes,
        source: { kind: 'voices', voices: st.source },
        target: null,
        dials: { bias: 0, spread: SPREAD, depth: 1 },
        carrier: { span: SPAN_S, segLen: SEG_S, segVar: 0.3, striation: 'staggered',
                   duration: null, release: null },
        dyn: type === 'BALANCE'
            // pp → mf: an arch between the two, so base is their midpoint and amount their half-distance
            ? { base: (PP + MF) / 2, shape: 'swell', amount: (MF - PP) / 2, turns: 1, spread: 0.6 }
            // everyone else holds mf; the entrance and the exit are the shape's job, not the layer's
            : { base: MF, shape: 'flat', amount: 0, turns: 1, spread: 0.5 },
        shape: type === 'BALANCE'
            ? { attack: { len: 8, entry: 'ramp', order: 'low-first', curve: 'linear' },
                release: { len: FADE_OUT_S, to: 0, exit: 'together', curve: 'expo' } }
            : { attack: { len: FADE_IN_S, mode: 'fade', from: 0, entry: 'together', curve: 'linear' },
                release: { len: FADE_OUT_S, to: 0, exit: 'together', curve: 'expo' } },
        seed: SEED + C.n,
    };
    if (st.target) {
        p.target = { kind: 'voices', voices: st.target, dwell: DWELL, mid: { voices: st.mid } };
    }
    return p;
}

// ---------------------------------------------------------------- the model entries
const TYPES = [
    { id: 'LGSPECTRAL', name: 'LGMF spectral — a set of partials through the reference to another',
      modelType: 'M3', tags: ['lgmf', 'spectral', 'three-station'],
      character: 'The chord begins on partials of the fundamental that are NOT the reference harmony, focuses onto the reference, rests there, and moves away to a different set. The vibraphone holds its bars throughout; the bass moves like everyone else (LG-30).' },
    { id: 'LGBALANCE', name: 'LGMF balance — the reference held, only the weighting moving',
      modelType: 'M6', tags: ['lgmf', 'balance', 'volume-only'],
      character: 'No pitch motion at all. Staggered entries and swells pp → mf, so the beating pairs of the reference harmony surface and recede against each other. Decision 4: this is the volume-only model, not a new one.' },
    { id: 'LGBLOOM', name: 'LGMF bloom — the deviations resolving onto clean partials and back',
      modelType: 'M3', tags: ['lgmf', 'bloom', 'three-station'],
      character: 'Every voice that sits on a deviant partial, or on no partial at all, glides to the nearest partial of the same fundamental with almost no deviation, rests there, and comes back. The vibraphone CANNOT follow — its doubling bar stays sounding 14–49¢ off the bloomed series, which the composer accepted as the fixed point (LG-30) — and the bass holds partial 1.' },
    { id: 'LGCONVERGE', name: 'LGMF converge — the beating pairs closing into unison and reopening',
      modelType: 'M3', tags: ['lgmf', 'converge', 'three-station'],
      character: 'His subject: "lots of friction and kinetic energy moving into something very clean and pure" (LG-31). The tempered double glides 14 / 31 / 49 cents onto the just partial; where the partner is a vibraphone bar the just voice goes to the bar instead and the unison lands off the series. The bass leaves the root altogether and mirrors the lowest voice above it.' },
];

// A recipe is a DIAL, not a preset: {min,max,default} plus waypoints the engine interpolates between
// (model_bank's validator is the spec, and it refuses anything else). These four are the dials PLAN 1a.5
// promises him — "I can load it into the model and change like the fade in or the duration".
const RECIPES = [
    { recipe: 'longer / shorter',
      description: 'the whole transition. 90 s is his 30 · 30 · 30; the dwell keeps its proportion, so a longer one rests longer too.',
      dial: { min: 0, max: 1, default: 0.5 },
      waypoints: [{ at: 0, patch: { 'carrier.span': 45 } }, { at: 1, patch: { 'carrier.span': 180 } }],
      boundsFrom: 'decision 9 (90 s) at the middle of a range that still reads as one gesture' },
    { recipe: 'rest at the far station',
      description: 'the middle third. 0 is a straight out-and-back with no repose; 0.6 is more than half the transition spent on the far harmony.',
      dial: { min: 0, max: 1, default: 1 / 3 },
      waypoints: [{ at: 0, patch: { 'target.dwell': 0 } }, { at: 1, patch: { 'target.dwell': 0.6 } }],
      boundsFrom: 'decision 9; the default IS 30 · 30 · 30' },
    { recipe: 'the entrance',
      description: 'how long dal niente takes to reach mf. It is a CC7 ramp under a constant velocity (§315), so it fades from true silence.',
      dial: { min: 0, max: 1, default: 0.25 },
      waypoints: [{ at: 0, patch: { 'shape.attack.len': 2 } }, { at: 1, patch: { 'shape.attack.len': 20 } }],
      boundsFrom: '1a.4 used 3 s on the reference score; 6 s is the default here for a 90 s gesture' },
    { recipe: 'together / spread',
      description: 'whether the voices set off as one or fan out. 0 is lockstep — every beat closes at the same instant.',
      dial: { min: 0, max: 1, default: 0.15 },
      waypoints: [{ at: 0, patch: { 'dials.spread': 0 } }, { at: 1, patch: { 'dials.spread': 0.8 } }],
      boundsFrom: 'the engine caps the stagger at 80 % of the span' },
];

function writeModels(store) {
    TYPES.forEach(T => {
        const first = paramsFor(T.id.replace('LG', ''), BANK.chords[0]);
        store.models[T.id] = {
            name: T.name, id: T.id, status: 'draft', modelType: T.modelType,
            character: T.character,
            verdict: 'built 2026-09-19 by tools/build_transition_models.js (PLAN 1a.5) — NOT YET HEARD.',
            tags: T.tags,
            notes: 'One model per transition TYPE; the six chords are its six actuals (ACT-' + T.id + '-01…06). '
                 + 'The pitch data is bank/reference_chords.json and nothing here is typed by hand — re-run the tool. '
                 + 'The 30 · 30 · 30 profile is target.dwell = 1/3 against carrier.span 90; both are dials.',
            actuals: [],
            baseParams: first,
            // BALANCE has no far station, so the dwell dial would do nothing — left off rather than left dead
            recipes: T.id === 'LGBALANCE' ? RECIPES.filter(r => !/rest/.test(r.recipe)) : RECIPES,
        };
    });
    store.rev = (store.rev || 0) + 1;
    return store;
}

// ---------------------------------------------------------------- build
const ORDER = ['SPECTRAL', 'BALANCE', 'BLOOM', 'CONVERGE'];
const storePath = MB.MODELS_PATH;
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

if (!DRY) {
    writeModels(store);
    fs.writeFileSync(storePath, JSON.stringify(store, null, 1) + '\n');
    // idempotent: this tool owns every ACT-LG* file, so it clears its own before writing
    if (fs.existsSync(MB.ACTUALS_DIR)) {
        fs.readdirSync(MB.ACTUALS_DIR).filter(f => /^ACT-LG/.test(f))
            .forEach(f => fs.unlinkSync(path.join(MB.ACTUALS_DIR, f)));
    } else { fs.mkdirSync(MB.ACTUALS_DIR, { recursive: true }); }
}

const rows = [];
let problems = 0;
ORDER.forEach(type => {
    BANK.chords.forEach(C => {
        const p = paramsFor(type, C);
        if (DRY) {
            const r = M.render(p, MB.renderOptsFor(p));
            rows.push({ type, chord: C.n, notes: r.notes.length, span: r.meta.totalLength || r.meta.span,
                        warnings: r.warnings.length, entity: '(dry)' });
            (r.warnings || []).forEach(w => { if (!/unrecognised/.test(w)) { console.log('   ! ' + type + ' ' + C.n + ': ' + w); problems++; } });
            return;
        }
        const built = MB.buildActual('LG' + type, {
            params: p, seed: p.seed, label: p.label,
            tags: ['lgmf', type.toLowerCase(), 'chord' + C.n, C.fundamental.name],
        });
        if (built.error) { console.log('   ✗ ' + type + ' chord ' + C.n + ': ' + built.error); problems++; return; }
        MB.writeActual(built);
        const a = built.actual;
        rows.push({ type, chord: C.n, notes: a.notes.length, span: a.spanSec, entity: a.entity,
                    warnings: (built.warnings || []).length });
    });
});

// ---------------------------------------------------------------- report
const pad = (s, n) => String(s).padEnd(n);
console.log('\nTHE FOUR TRANSITION TYPES — ' + SPAN_S + ' s each, ' + Math.round(SPAN_S * (1 - DWELL) / 2) + ' · '
    + Math.round(SPAN_S * DWELL) + ' · ' + Math.round(SPAN_S * (1 - DWELL) / 2) + ' (PLAN 1a.5)\n');
console.log('  ' + pad('entity', 20) + pad('type', 11) + pad('chord', 7) + pad('notes', 8) + pad('span', 9) + 'warnings');
rows.forEach(r => console.log('  ' + pad(r.entity, 20) + pad(r.type.toLowerCase(), 11) + pad(r.chord, 7)
    + pad(r.notes, 8) + pad(r.span, 9) + (r.warnings || 0)));

// the pitch trajectory of one transition, as evidence the three stations land where they should
const probe = paramsFor('CONVERGE', BANK.chords[0]);
const pr = M.render(probe, MB.renderOptsFor(probe));
console.log('\n  CONVERGE chord 1 — where each voice is at 15 s (mid-glide), 45 s (the rest) and 90 s (home):');
BANK.chords[0].voices.forEach((v, i) => {
    const at = t => {
        const ns = pr.notes.filter(n => n.voice === i && n.tStart <= t && n.tStart + n.dur >= t);
        if (!ns.length) return '  (gap)';
        const n = ns[0], dt = t - n.tStart;
        let c = n.bend && n.bend.length ? n.bend[0][1] : 0;
        if (n.bend) for (const b of n.bend) { if (b[0] <= dt) c = b[1]; }
        const cs = Math.round(c);
        return (NOTE(n.midi) + (cs === 0 ? '' : (cs > 0 ? '+' : '') + cs)).padStart(9);
    };
    console.log('   ' + pad(v.short + (v.bow ? ' ' + v.bow : ''), 7) + pad('ref ' + v.name, 11)
        + '  15 s' + at(15) + '   45 s' + at(45) + '   89 s' + at(89));
});

console.log(problems ? '\n' + problems + ' PROBLEM(S)' : '\nno problems');
if (!DRY) console.log('wrote ' + rows.length + ' actuals to bank/actuals/ and 4 models to bank/morph_models.json');
process.exit(problems ? 1 : 0);
