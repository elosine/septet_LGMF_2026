#!/usr/bin/env node
// build_reference_chords.js — PLAN 1a.3 (2026-09-19): the composer's six reference harmonies as DATA.
//
// The source is COMPOSITION_NOTES LG-18 … LG-27 (the six chords, scored voice by voice) plus LG-30/LG-31
// (Converge) and decisions 6 and 7 of RUNNING_LOG §66 (Spectral's sets and Bloom's targets, both RULE-BASED
// so they can be recomputed and overridden by ear). Nothing here is typed twice: the VOICING is typed once —
// instrument, MIDI pitch, which partial, what part it plays — and every cents value, every Bloom target and
// every Spectral pick is COMPUTED from the fundamental's own harmonic series.
//
// THE ONE RULE THAT GOVERNS THE CENTS (LG-27, his: "only the bsn, tpt horn are just all rest tempered"):
// a voice carries its partial's deviation ONLY if it is the horn, the trumpet, or the bassoon on a chord
// whose root it can finger (1, 3, 5). Every other voice sounds the tempered pitch — cents 0 — and the
// beating IS that difference. The `partial` field still records which partial a tempered voice is placed on,
// because Bloom and Converge need to know.
//
//   node tools/build_reference_chords.js            # writes bank/reference_chords.json and prints the tables
//   node tools/build_reference_chords.js --dry      # print only
//   node tools/build_reference_chords.js --seed N   # another Spectral draw (the seed is recorded in the bank)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const DRY = args.includes('--dry');
const SEED = Number(opt('seed', 20260919));
const OUT = path.join(ROOT, 'bank', 'reference_chords.json');

const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});

// ---------------------------------------------------------------- pitch helpers
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// HIS SPELLING, read off LG-18 … LG-26: C sharp and F sharp are always written sharp (C♯3/4/5, F♯1/2/4),
// D sharp, G sharp and A sharp always flat (E♭4/5, A♭3/4, B♭1/4/5). The one exception is the ROOT of chord 4,
// which he named G♯1 while spelling its own partials A♭ — kept as he wrote it.
const SPELL = { 'C#': 'C#', 'D#': 'Eb', 'F#': 'F#', 'G#': 'Ab', 'A#': 'Bb' };
const FUND_NAME = { 32: 'G#1' };
const nm = m => { const p = NAMES[((m % 12) + 12) % 12]; return (SPELL[p] || p) + (Math.floor(m / 12) - 1); };
const fundName = m => FUND_NAME[m] || nm(m);
const r1 = x => Math.round(x * 10) / 10;

// a partial of a fundamental, as a tempered key plus its deviation in cents (negative = flat of the key)
function partialOf(fundMidi, n) {
    const exact = fundMidi + 12 * Math.log2(n);
    const midi = Math.round(exact);
    return { partial: n, midi, cents: Math.round((exact - midi) * 100), exact };
}
// every partial up to MAXP, indexed
const MAXP = 64;
const seriesOf = fund => Array.from({ length: MAXP }, (_, i) => partialOf(fund, i + 1));

function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------------------------------------------------------------- the ensemble
// lane = the composer score's layer = the IR's part (notation/registry/ensemble.json)
const PART = {
    english_horn: { lane: 0, short: 'EH' }, bassoon: { lane: 1, short: 'Bsn' },
    horn: { lane: 2, short: 'Hn' }, trumpet: { lane: 3, short: 'Tpt' },
    bowed_vibraphone: { lane: 5, short: 'Vib' }, cello: { lane: 6, short: 'Vc' },
    double_bass: { lane: 7, short: 'Db' },
};
const rangeOf = k => [recipe[k].rangeLow, recipe[k].rangeHigh];
const inRange = (k, m) => m >= recipe[k].rangeLow && m <= recipe[k].rangeHigh;

// LG-27: who actually bends to the just value. The bassoon only where it can finger the root (chords 1, 3, 5).
const JUST_ON = { horn: [1, 2, 3, 4, 5, 6], trumpet: [1, 2, 3, 4, 5, 6], bassoon: [1, 3, 5] };
const playsJust = (inst, chord) => !!(JUST_ON[inst] && JUST_ON[inst].indexOf(chord) >= 0);

// ---------------------------------------------------------------- THE VOICINGS, typed once
// COMPOSITION_NOTES LG-21 (chord 1) · LG-22 (2) · LG-23 (3) · LG-24 (4) · LG-25 (5) · LG-26 (6), each
// "RESOLVED" table, and the consolidated table at the end of LG-26. `p` = the partial the pitch stands on
// (null where the voice is a tempered unison with another voice — a DOUBLE, which has no partial of its own).
// `of` names the voice a double is doubling. `note` is his own description where he gave one.
const CHORDS = [
    { n: 1, fund: 34, voices: [   // B♭1
        { id: 'db',   inst: 'double_bass',      midi: 34, p: 1,    role: 'root' },
        { id: 'bsn',  inst: 'bassoon',          midi: 62, p: 5,    role: 'just' },
        { id: 'vc',   inst: 'cello',            midi: 62, p: null, role: 'double', of: 'bsn' },
        { id: 'hn',   inst: 'horn',             midi: 68, p: 7,    role: 'just' },
        { id: 'eh',   inst: 'english_horn',     midi: 68, p: null, role: 'double', of: 'hn' },
        { id: 'tpt',  inst: 'trumpet',          midi: 74, p: 10,   role: 'just' },
        { id: 'vib1', inst: 'bowed_vibraphone', midi: 74, p: null, role: 'double', of: 'tpt', bow: 1 },
        { id: 'vib2', inst: 'bowed_vibraphone', midi: 83, p: 17,   role: 'series', bow: 2,
          note: 'a NEUTRAL THIRD above the horn\'s A♭ — 336¢, 36 cents from both thirds' },
    ] },
    { n: 2, fund: 33, voices: [   // A1
        { id: 'db',   inst: 'double_bass',      midi: 33, p: 1,    role: 'root' },
        { id: 'hn',   inst: 'horn',             midi: 61, p: 5,    role: 'just' },
        { id: 'bsn',  inst: 'bassoon',          midi: 61, p: null, role: 'double', of: 'hn' },
        { id: 'tpt',  inst: 'trumpet',          midi: 73, p: 10,   role: 'just' },
        { id: 'eh',   inst: 'english_horn',     midi: 73, p: null, role: 'double', of: 'tpt' },
        { id: 'vc',   inst: 'cello',            midi: 71, p: 9,    role: 'series', note: '9/5 against the C♯ — the wolf seventh' },
        { id: 'vib1', inst: 'bowed_vibraphone', midi: 82, p: 17,   role: 'series', bow: 1, note: '17/10 against the C♯' },
        { id: 'vib2', inst: 'bowed_vibraphone', midi: 83, p: 18,   role: 'series', bow: 2, note: '9/5 again, an octave above the cello' },
    ] },
    { n: 3, fund: 36, voices: [   // C2
        { id: 'db',   inst: 'double_bass',      midi: 36, p: 1,    role: 'root' },
        { id: 'bsn',  inst: 'bassoon',          midi: 64, p: 5,    role: 'just' },
        { id: 'eh',   inst: 'english_horn',     midi: 64, p: null, role: 'double', of: 'bsn' },
        { id: 'vib2', inst: 'bowed_vibraphone', midi: 67, p: 6,    role: 'series', bow: 2,
          note: '12/7 against the horn\'s B♭ — a supermajor sixth, +33¢ off ET' },
        { id: 'hn',   inst: 'horn',             midi: 70, p: 7,    role: 'just' },
        { id: 'vc',   inst: 'cello',            midi: 70, p: null, role: 'double', of: 'hn' },
        { id: 'tpt',  inst: 'trumpet',          midi: 76, p: 10,   role: 'just' },
        { id: 'vib1', inst: 'bowed_vibraphone', midi: 76, p: null, role: 'double', of: 'tpt', bow: 1 },
    ] },
    { n: 4, fund: 32, voices: [   // G♯1
        { id: 'db',   inst: 'double_bass',      midi: 32, p: 1,    role: 'root' },
        { id: 'vib2', inst: 'bowed_vibraphone', midi: 56, p: 4,    role: 'series', bow: 2,
          note: '7/4 against the horn (8/7 reduced); CHANGED from A♭5 at his word, for bowing safety' },
        { id: 'hn',   inst: 'horn',             midi: 66, p: 7,    role: 'just' },
        { id: 'vib1', inst: 'bowed_vibraphone', midi: 66, p: null, role: 'double', of: 'hn', bow: 1 },
        { id: 'eh',   inst: 'english_horn',     midi: 70, p: 9,    role: 'series', note: '9/7 against the horn — a supermajor third' },
        { id: 'tpt',  inst: 'trumpet',          midi: 72, p: 10,   role: 'just' },
        { id: 'bsn',  inst: 'bassoon',          midi: 72, p: null, role: 'double', of: 'tpt' },
        { id: 'vc',   inst: 'cello',            midi: 74, p: 11,   role: 'series',
          note: 'the 11th — placed as the first near-quarter-tone of the set (LG-24), then made TEMPERED by LG-27; Converge gives it back (49¢ down)' },
    ] },
    { n: 5, fund: 35, voices: [   // B1
        { id: 'db',      inst: 'double_bass',      midi: 35, p: 1,    role: 'root' },
        { id: 'bsn',     inst: 'bassoon',          midi: 63, p: 5,    role: 'just' },
        { id: 'vc_low',  inst: 'cello',            midi: 63, p: null, role: 'double', of: 'bsn', stop: 'lower' },
        { id: 'hn',      inst: 'horn',             midi: 69, p: 7,    role: 'just' },
        { id: 'vc_high', inst: 'cello',            midi: 69, p: null, role: 'double', of: 'hn', stop: 'upper' },
        { id: 'vib1',    inst: 'bowed_vibraphone', midi: 73, p: 9,    role: 'series', bow: 1, note: '9/7 against the horn — supermajor third' },
        { id: 'tpt',     inst: 'trumpet',          midi: 75, p: 10,   role: 'just' },
        { id: 'eh',      inst: 'english_horn',     midi: 75, p: null, role: 'double', of: 'tpt' },
        { id: 'vib2',    inst: 'bowed_vibraphone', midi: 86, p: 19,   role: 'series', bow: 2, note: '19/14 against the horn — the last unused ratio in the set' },
    ] },
    { n: 6, fund: 30, voices: [   // F♯1
        { id: 'db',   inst: 'double_bass',      midi: 30, p: 1,    role: 'root' },
        { id: 'vc',   inst: 'cello',            midi: 42, p: 2,    role: 'series', note: '16/11 against the horn, +49¢ off ET — C string' },
        { id: 'bsn',  inst: 'bassoon',          midi: 49, p: 3,    role: 'series', note: '12/11 against the horn, −49¢ off ET' },
        { id: 'eh',   inst: 'english_horn',     midi: 68, p: 9,    role: 'series', note: '18/11 against the horn, −47¢ off ET' },
        { id: 'hn',   inst: 'horn',             midi: 72, p: 11,   role: 'just' },
        { id: 'vib1', inst: 'bowed_vibraphone', midi: 72, p: null, role: 'double', of: 'hn', bow: 1 },
        { id: 'tpt',  inst: 'trumpet',          midi: 76, p: 14,   role: 'just' },
        { id: 'vib2', inst: 'bowed_vibraphone', midi: 76, p: null, role: 'double', of: 'tpt', bow: 2 },
    ] },
];

// LG-27's deviation table — the assertion this build has to satisfy
const LG27 = [
    { n: 1, horn: -31, trumpet: -14, bassoon: -14 },
    { n: 2, horn: -14, trumpet: -14, bassoon: null },
    { n: 3, horn: -31, trumpet: -14, bassoon: -14 },
    { n: 4, horn: -31, trumpet: -14, bassoon: null },
    { n: 5, horn: -31, trumpet: -14, bassoon: -14 },
    { n: 6, horn: -49, trumpet: -31, bassoon: null },
];

// ---------------------------------------------------------------- CONVERGE (LG-31's final table, LG-30's rule)
// mover = the voice that glides; to = the voice it lands on; the DISTANCE is computed from the two cents values,
// so the table below only has to say who goes to whom. The bass leaves the root and mirrors the lowest voice
// above it — 28¢ under a JUST target (the mirror of the tempered about the just), ~50¢ under a FIXED one.
const CONVERGE = [
    { n: 1, pairs: [['vc', 'bsn'], ['eh', 'hn'], ['tpt', 'vib1']], bass: 'bsn',  statics: ['vib2'] },
    { n: 2, pairs: [['bsn', 'hn'], ['eh', 'tpt']],                 bass: 'hn',   statics: ['vc', 'vib1', 'vib2'] },
    { n: 3, pairs: [['eh', 'bsn'], ['vc', 'hn'], ['tpt', 'vib1']], bass: 'bsn',  statics: ['vib2'] },
    { n: 4, pairs: [['hn', 'vib1'], ['bsn', 'tpt']],               bass: 'vib2', statics: ['eh'],
      extra: [{ voice: 'vc', toPartial: 11, why: 'the true 11th — 49¢ down, the near-quarter-tone LG-27 took away' }] },
    { n: 5, pairs: [['vc_low', 'bsn'], ['vc_high', 'hn'], ['eh', 'tpt']], bass: 'bsn', statics: ['vib1', 'vib2'] },
    { n: 6, pairs: [['hn', 'vib1'], ['tpt', 'vib2']],              bass: 'vc',   statics: ['vc', 'bsn', 'eh'] },
];

// ---------------------------------------------------------------- build
const NON_DEVIANT = 10;     // decision 7: "without cents deviation" = |cents| < 10
const SPECTRAL_REACH = 12;  // decision 6: within ±12 semitones of the reference pitch

function build() {
    const rng = mulberry32(SEED);
    const problems = [];
    const out = CHORDS.map(C => {
        const series = seriesOf(C.fund);
        const byId = {};
        const voices = C.voices.map(v => {
            const just = v.role === 'just' && playsJust(v.inst, C.n);
            const pd = v.p != null ? partialOf(C.fund, v.p) : null;
            if (pd && pd.midi !== v.midi) problems.push('chord ' + C.n + ' ' + v.id + ': partial ' + v.p + ' of ' + nm(C.fund) + ' is ' + nm(pd.midi) + ', the voicing says ' + nm(v.midi));
            if (!inRange(v.inst, v.midi)) problems.push('chord ' + C.n + ' ' + v.id + ': ' + nm(v.midi) + ' is outside ' + v.inst + ' ' + rangeOf(v.inst).join('–'));
            const o = {
                id: v.id, part: PART[v.inst].lane, short: PART[v.inst].short, instrument: v.inst,
                midi: v.midi, name: nm(v.midi), partial: v.p,
                cents: just ? pd.cents : 0,
                partialCents: pd ? pd.cents : null,       // what the partial IS, whether or not this voice bends to it
                role: v.role, tuning: just ? 'just' : 'tempered',
            };
            if (v.of) o.doubles = v.of;
            if (v.bow) o.bow = v.bow;
            if (v.stop) o.stop = v.stop;
            if (v.note) o.note = v.note;
            byId[v.id] = o;
            return o;
        });

        // ---- BLOOM (decision 7): every voice but the bass and the vibraphone to its nearest non-deviant partial
        const bloom = voices.filter(v => v.instrument !== 'double_bass' && v.instrument !== 'bowed_vibraphone').map(v => {
            const from = v.midi + v.cents / 100;
            const cand = series.filter(s => Math.abs(s.cents) < NON_DEVIANT && inRange(v.instrument, s.midi));
            let best = null;
            cand.forEach(s => {
                const d = Math.abs((s.midi + s.cents / 100) - from);
                if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) <= 1e-9 && Math.abs(s.cents) < Math.abs(best.s.cents))) best = { s, d };
            });
            if (!best) { problems.push('chord ' + C.n + ' ' + v.id + ': no non-deviant partial in range for Bloom'); return null; }
            return { voice: v.id, fromMidi: v.midi, fromCents: v.cents,
                     toMidi: best.s.midi, toName: nm(best.s.midi), toPartial: best.s.partial, toCents: best.s.cents,
                     moveSemitones: r1((best.s.midi + best.s.cents / 100) - from), holds: Math.abs(best.d) < 1e-9 };
        }).filter(Boolean);

        // ---- SPECTRAL (decision 6): a start and an end partial per voice, the vibraphone excepted
        const spectral = voices.filter(v => v.instrument !== 'bowed_vibraphone').map(v => {
            const draw = reach => series.filter(s => Math.abs(s.cents) < NON_DEVIANT && inRange(v.instrument, s.midi)
                && Math.abs(s.midi - v.midi) <= reach && s.midi !== v.midi);
            // THE REACH WIDENS BY OCTAVES WHERE ONE IS NOT ENOUGH, and the widening is recorded per voice.
            // Decision 6 says "within an octave of the reference note". That is fine for everyone except the
            // DOUBLE BASS, which sits on partial 1: inside one octave its only non-deviant partial is the
            // octave itself, so it would have a start or an end but never both — and LG-30 says the bass
            // MOVES in Spectral. Widening to two octaves gives it partials 2, 3 and 4. Anyone else who needs
            // it is flagged in the printout, because it means that voice is cornered.
            let reach = SPECTRAL_REACH, pool = draw(reach);
            while (pool.length < 2 && reach < 48) { reach += 12; pool = draw(reach); }
            if (pool.length < 2) { problems.push('chord ' + C.n + ' ' + v.id + ': only ' + pool.length + ' spectral candidate(s) within ' + reach + ' st — it cannot move'); return null; }
            const a = pool[Math.floor(rng() * pool.length)];
            const rest = pool.filter(s => s.midi !== a.midi);
            const b = rest[Math.floor(rng() * rest.length)];
            return { voice: v.id,
                     startPartial: a.partial, startMidi: a.midi, startName: nm(a.midi), startCents: a.cents,
                     refMidi: v.midi, refCents: v.cents,
                     endPartial: b.partial, endMidi: b.midi, endName: nm(b.midi), endCents: b.cents,
                     candidates: pool.length, reachSemitones: reach };
        }).filter(Boolean);

        // ---- CONVERGE (LG-30/LG-31)
        const CV = CONVERGE.find(x => x.n === C.n);
        const movers = CV.pairs.map(([mv, tg]) => {
            const m = byId[mv], t = byId[tg];
            return { voice: mv, to: tg, midi: m.midi, name: nm(m.midi),
                     fromCents: m.cents, toCents: t.cents, distanceCents: Math.round(t.cents - m.cents) };
        });
        (CV.extra || []).forEach(e => {
            const m = byId[e.voice], p = partialOf(C.fund, e.toPartial);
            movers.push({ voice: e.voice, to: 'partial ' + e.toPartial, midi: m.midi, name: nm(m.midi),
                          fromCents: m.cents, toCents: p.cents, distanceCents: Math.round(p.cents - m.cents), why: e.why });
        });
        // THE BASS LEAVES THE ROOT (LG-30, corrected: 28 CENTS not semitones). It mirrors the lowest voice above it.
        // Onto a JUST anchor: the just partial sits at c, the tempered double at 0, and the bass starts at the MIRROR
        // of the tempered ABOUT the just — 2c — so the double comes down |c| and the bass comes up |c| and all three
        // meet on the partial. Onto a FIXED (tempered) anchor there is nothing to mirror: ~50¢ below, his number,
        // which is 6 beats a second at that register — "fast but still clean beating".
        const anchor = byId[CV.bass];
        const fixed = anchor.cents === 0;
        const bass = { voice: 'db', leavesRoot: true, onto: CV.bass, midi: anchor.midi, name: nm(anchor.midi),
                       startCents: fixed ? anchor.cents - 50 : 2 * anchor.cents, targetCents: anchor.cents,
                       why: fixed ? 'the anchor is fixed (tempered) — ~50¢ below it, LG-30'
                                  : 'the mirror of the tempered about the just — the bass comes up as far as the double comes down' };
        bass.distanceCents = Math.round(bass.targetCents - bass.startCents);
        if (!inRange('double_bass', bass.midi)) problems.push('chord ' + C.n + ' converge: the bass cannot reach ' + nm(bass.midi));

        return { n: C.n, fundamental: { midi: C.fund, name: fundName(C.fund) }, voices,
                 converge: { movers, bass, statics: CV.statics }, bloom, spectral };
    });

    // LG-27's assertion
    out.forEach(C => {
        const want = LG27.find(x => x.n === C.n);
        ['horn', 'trumpet', 'bassoon'].forEach(k => {
            const v = C.voices.find(x => x.instrument === k);
            const got = v ? (v.tuning === 'just' ? v.cents : null) : undefined;
            if (got !== want[k]) problems.push('chord ' + C.n + ' ' + k + ': LG-27 says ' + want[k] + ', the build says ' + got);
        });
    });
    return { chords: out, problems };
}

const { chords, problems } = build();

// ---------------------------------------------------------------- print
const pad = (s, n) => String(s).padEnd(n);
console.log('THE SIX REFERENCE HARMONIES — bank/reference_chords.json (PLAN 1a.3)\n');
chords.forEach(C => {
    console.log('CHORD ' + C.n + ' on ' + C.fundamental.name + ' (' + C.fundamental.midi + ')');
    console.log('  ' + pad('voice', 8) + pad('pitch', 9) + pad('midi', 6) + pad('partial', 9) + pad('cents', 7) + pad('tuning', 10) + 'role');
    C.voices.forEach(v => console.log('  ' + pad(v.short + (v.bow ? ' ' + v.bow : '') + (v.stop ? ' ' + v.stop[0] : ''), 8)
        + pad(v.name, 9) + pad(v.midi, 6) + pad(v.partial == null ? '—' : v.partial, 9)
        + pad(v.cents === 0 ? '0' : (v.cents > 0 ? '+' : '') + v.cents, 7) + pad(v.tuning, 10)
        + v.role + (v.doubles ? ' of ' + v.doubles : '')));
    console.log('');
});
console.log('CONVERGE — who moves, and how far (LG-31)\n');
chords.forEach(C => {
    const b = C.converge.bass;
    console.log('  ' + C.n + '  ' + C.converge.movers.map(m => m.voice + '→' + m.to + ' ' + m.name + ' ' + Math.abs(m.distanceCents) + '¢ ' + (m.distanceCents > 0 ? 'up' : 'down')).join(' · '));
    console.log('     bass: ' + b.name + ' ' + (b.startCents > 0 ? '+' : '') + b.startCents + '¢ → ' + b.onto + ' (' + Math.abs(b.distanceCents) + '¢ up) · static: ' + C.converge.statics.join(' '));
});
console.log('\nBLOOM — the nearest non-deviant partial (decision 7)\n');
chords.forEach(C => console.log('  ' + C.n + '  ' + C.bloom.map(b => b.voice + ' ' + nm(b.fromMidi) + '→' + b.toName + ' p' + b.toPartial
    + (b.holds ? ' (holds)' : ' ' + (b.moveSemitones > 0 ? '+' : '') + b.moveSemitones + ' st')).join(' · ')));
console.log('\nSPECTRAL — start → reference → end, seed ' + SEED + ' (decision 6; HIS TO OVERRIDE BY EAR)\n');
chords.forEach(C => console.log('  ' + C.n + '  ' + C.spectral.map(s => s.voice + ' ' + s.startName + '(p' + s.startPartial + ')→'
    + nm(s.refMidi) + '→' + s.endName + '(p' + s.endPartial + ')' + (s.reachSemitones > SPECTRAL_REACH ? ' [reach ' + s.reachSemitones + ']' : '')).join(' · ')));

if (problems.length) {
    console.log('\nPROBLEMS (' + problems.length + '):');
    problems.forEach(p => console.log('  ✗ ' + p));
} else {
    console.log('\nGREEN — every partial matches its written pitch, every voice is in range, and the horn / trumpet / bassoon\n'
        + 'deviations are LG-27\'s exactly (−31/−14/−14 · −14/−14/temp · −31/−14/−14 · −31/−14/temp · −31/−14/−14 · −49/−31/temp).');
}

if (!DRY) {
    const doc = {
        _doc: 'THE SIX REFERENCE HARMONIES as data (PLAN 1a.3). GENERATED by tools/build_reference_chords.js — '
            + 'the voicings are typed there from COMPOSITION_NOTES LG-21…LG-26; every cents value, Bloom target and '
            + 'Spectral pick is computed from the fundamental\'s own series. Do not hand-edit: change the tool and re-run. '
            + 'Only the horn, the trumpet and the bassoon (chords 1, 3, 5) carry cents — LG-27.',
        _source: 'COMPOSITION_NOTES LG-18 … LG-31 · RUNNING_LOG §62–§66d (decisions 6, 7, 8, 9)',
        builtAt: new Date().toISOString(),
        builtBy: 'tools/build_reference_chords.js',
        spectralSeed: SEED,
        nonDeviantCents: NON_DEVIANT,
        spectralReachSemitones: SPECTRAL_REACH,
        order: chords.map(c => c.fundamental.name),
        chords,
    };
    fs.writeFileSync(OUT, JSON.stringify(doc, null, 1) + '\n');
    console.log('\nwrote ' + path.relative(ROOT, OUT));
}
process.exit(problems.length ? 1 : 0);
