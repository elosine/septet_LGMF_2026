#!/usr/bin/env node
// compute_trims.js — PLAN 1b.3 (2026-09-19): the trims, to an ABSOLUTE target.
//
//   node tools/compute_trims.js [--voices 9] [--tutti -20] [--out bank/trims.json] [--dry]
//
// WHAT IS DIFFERENT FROM 0d, and it is the whole point of PLAN 1b (RUNNING_LOG §76). 0d balanced the
// ensemble RELATIVELY — every instrument to the median sampler at one velocity, the percussion raised to
// meet the winds at full — and measured it through a REC bus trimmed 12 dB down. Nothing in it said how
// loud the ensemble should BE, so it came out ~12 dB hotter than piece #5 and clipped. Here the target is
// an absolute one, derived from the standard 1b.0 adopted:
//
//   K-20 (Katz; SMPTE RP 200):  a loud passage sits at −20 LUFS-S, peaks reach −1 dBTP.
//   N voices summing incoherently to −20 LUFS-S ⇒ each voice at −20 − 10·log10(N).
//
// and every level it reads is absolute dBFS AT THE MASTER, because REC has been at unity since 1b.0 and
// 1b.1 proved the chain to three decimals (bank/reference.json).
//
// THE UNIT CONVERSION IS MEASURED, NOT ASSUMED. The card's figures are K-weighted RMS in dBFS (the core
// carried from #5); the target is in LUFS. bank/reference.json holds both readings of the SAME 1 kHz tone
// — K-weighted RMS −19.30 dBFS and BS.1770 −17.0 LUFS — so the offset between the two scales is read from
// the reference rather than derived from the standard's algebra: it is whatever this rig measures it to be.
//
// WHICH FIGURE EACH FAMILY IS JUDGED ON — the decision of 1b.2, and the reason his vibraphone was "quiet":
//   pitched (sustained)  the INTEGRATED figure: K-weighted RMS over the whole sounding note, i.e. HOW LOUD
//                        THE NOTE IS. 0d used the loudest 400 ms, which on the bowed vibraphone describes
//                        its first half-second of a bow that is 20 dB down 7.4 s later (§69).
//   percussion (one-shot) the MAX-MOMENTARY figure, as 0d used: a one-shot's identity is its stroke, and
//                        its integrated value would depend on how long it happens to ring — a castanet
//                        (0.5 s) and a tam tam (3.6 s) are not comparable that way.
// Both figures are carried per instrument in the output so the choice can be revisited against his ear.
//
// THE VIBRAPHONE IS SPLIT IN TWO, because one fader cannot say what it needs (§82): its nine pitches span
// 15.5 dB, the shape reproduces at both velocities within 0.3 dB per step, and its velocity response is
// uniform (13.5–14.0 dB from velocity 64 to 127 at every pitch). So the register offset is a CONSTANT PER
// PITCH, independent of velocity: the fader carries the mean, and the per-pitch residuals are written out
// for the velocity remap (1b.4), which is already per instrument and per register.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes('--dry');
const N_VOICES = +arg('voices', 9);          // the reference chords are 8–9 voices; the loudest case governs
const TUTTI_LUFS = +arg('tutti', -20);       // K-20's loud-passage level
const OUT = path.join(ROOT, arg('out', 'bank/trims.json'));
const FADER_MAX_DB = 12;                     // Reaper's fader ceiling; the remainder goes to a JS Volume FX (§58)

const CARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'instrument_card.json'), 'utf8'));
const REF = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'reference.json'), 'utf8'));
const PERC = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'perc_rack.json'), 'utf8'));
const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});

// the K-weighted-dBFS → LUFS offset, READ off the proven reference tone
const tone = REF.regions.find(r => r.kind === 'tone');
if (!tone || tone.lufs == null || tone.kWeightedRmsDbfs == null) throw new Error('bank/reference.json has no usable tone region — run 1b.1');
const K_TO_LUFS = tone.lufs - tone.kWeightedRmsDbfs;
if (!REF.pass) console.warn('WARNING: bank/reference.json does not say PASS — the scale under these numbers is not proven');

const targetTuttiK = TUTTI_LUFS - K_TO_LUFS;
const perVoiceLufs = TUTTI_LUFS - 10 * Math.log10(N_VOICES);
const perVoiceK = perVoiceLufs - K_TO_LUFS;

// current trims: pitched from the recipe's balanceDb, percussion from the rack store
const percByCatalog = {};
for (const t of PERC.tracks) if (t.catalog) percByCatalog[t.catalog] = t;
const PITCHED = new Set(['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass']);

const rows = [];
for (const [key, I] of Object.entries(CARD.instruments)) {
    const v = I.byVelocity && I.byVelocity['127'];
    if (!v) { rows.push({ inst: key, label: I.label, skipped: 'no velocity-127 measurement' }); continue; }
    const isPitched = PITCHED.has(key);
    const measure = isPitched ? 'integrated' : 'maxMomentary';
    const measured = isPitched ? v.integratedDb : v.maxMomentaryDb;
    const current = isPitched
        ? (INSTRUMENTS[key] && INSTRUMENTS[key].balanceDb != null ? INSTRUMENTS[key].balanceDb : 0)
        : (percByCatalog[key] ? percByCatalog[key].trimDb : 0);
    const delta = perVoiceK - measured;               // what the fader must move by
    const proposed = current + delta;                 // the trim the track should carry
    const fader = Math.min(proposed, FADER_MAX_DB);
    const js = Math.round((proposed - fader) * 100) / 100;
    const r = {
        inst: key, label: I.label, family: isPitched ? 'pitched' : 'percussion', measure,
        measuredDb: measured, maxMomentaryDb: v.maxMomentaryDb, integratedDb: v.integratedDb,
        momentaryMinusIntegratedDb: Math.round((v.maxMomentaryDb - v.integratedDb) * 100) / 100,
        currentTrimDb: Math.round(current * 100) / 100,
        deltaDb: Math.round(delta * 100) / 100,
        proposedTrimDb: Math.round(proposed * 100) / 100,
        faderDb: Math.round(fader * 100) / 100, jsVolumeDb: js,
        soundingS: v.soundingS, nPitches: Object.keys(v.perPitch || {}).length,
    };
    // the vibraphone: the fader takes the mean, the per-pitch residuals go to the remap (1b.4)
    if (key === 'bowed_vibraphone' && v.perPitch) {
        const per = Object.entries(v.perPitch).map(([p, d]) => [+p, d.integratedDb]).sort((a, b) => a[0] - b[0]);
        const mean = per.reduce((s, [, d]) => s + d, 0) / per.length;
        r.register = {
            note: 'one constant offset per pitch, velocity-independent (§82). The fader carries the mean; '
                + 'these residuals are what the velocity remap must flatten in 1b.4.',
            meanIntegratedDb: Math.round(mean * 100) / 100,
            spreadDb: Math.round((Math.max(...per.map(x => x[1])) - Math.min(...per.map(x => x[1]))) * 100) / 100,
            offsetsDb: Object.fromEntries(per.map(([p, d]) => [p, Math.round((d - mean) * 100) / 100])),
        };
    }
    rows.push(r);
}

const ok = rows.filter(r => !r.skipped);
const pitched = ok.filter(r => r.family === 'pitched');
const perc = ok.filter(r => r.family === 'percussion');

console.log('PLAN 1b.3 — THE TRIMS, TO AN ABSOLUTE TARGET\n');
console.log('  standard        ' + (REF.standard || 'K-20; BS.1770'));
console.log('  the scale       REC at unity since 1b.0; the chain proven in bank/reference.json'
    + (REF.pass ? ' (PASS)' : ' (NOT PASSING — see 1b.1)'));
console.log('  K → LUFS        ' + K_TO_LUFS.toFixed(2) + ' dB, read off the 1 kHz tone ('
    + tone.kWeightedRmsDbfs + ' dBFS K-weighted = ' + tone.lufs + ' LUFS)');
console.log('  the target      a tutti of ' + N_VOICES + ' voices at ' + TUTTI_LUFS + ' LUFS-S'
    + '  ⇒  each voice at ' + perVoiceLufs.toFixed(2) + ' LUFS = ' + perVoiceK.toFixed(2) + ' dB on the card’s scale');
console.log('  judged on       pitched → the INTEGRATED figure · percussion → the loudest 400 ms\n');

const show = (list, title) => {
    console.log(title);
    console.log('  ' + 'instrument'.padEnd(20) + 'measured'.padStart(9) + 'M−I'.padStart(6) + 'current'.padStart(9)
        + 'change'.padStart(8) + 'new trim'.padStart(10) + '   fader + JS');
    for (const r of list.sort((a, b) => a.deltaDb - b.deltaDb)) {
        const split = r.jsVolumeDb > 0.005 ? `${r.faderDb.toFixed(2)} + ${r.jsVolumeDb.toFixed(2)}` : r.faderDb.toFixed(2);
        console.log('  ' + r.label.padEnd(20) + r.measuredDb.toFixed(2).padStart(9)
            + r.momentaryMinusIntegratedDb.toFixed(1).padStart(6) + r.currentTrimDb.toFixed(2).padStart(9)
            + (r.deltaDb >= 0 ? '+' : '') + r.deltaDb.toFixed(2).padStart(7) + r.proposedTrimDb.toFixed(2).padStart(10)
            + '   ' + split);
    }
    console.log('');
};
show(pitched, 'PITCHED — judged on the integrated figure');
show(perc, 'PERCUSSION — judged on the loudest 400 ms');

const vib = ok.find(r => r.inst === 'bowed_vibraphone');
if (vib && vib.register) {
    console.log('THE VIBRAPHONE’S REGISTER — the fader carries the mean (' + vib.register.meanIntegratedDb.toFixed(2)
        + ' dB); these are what 1b.4’s remap must flatten (' + vib.register.spreadDb.toFixed(1) + ' dB spread):');
    console.log('  ' + Object.entries(vib.register.offsetsDb).map(([p, d]) => p + ': ' + (d >= 0 ? '+' : '') + d.toFixed(1)).join('   ') + '\n');
}

// ---- HEADROOM, because a target that still clips is not a target ----
// The peak a voice reaches after its trim is its measured peak plus the change. Peaks of independent
// sources add in power, not amplitude, so the estimate is a power sum — pessimistic for real music, where
// they rarely coincide, and the honest upper bound here.
const powerSum = arr => 10 * Math.log10(arr.reduce((s, x) => s + Math.pow(10, x / 10), 0));
const peakAfter = {};
for (const r of ok) {
    const rs = CARD.notes.filter(n => n.inst === r.inst && n.vel === 127 && n.found && n.peakDbfs != null);
    if (rs.length) peakAfter[r.inst] = Math.round((Math.max(...rs.map(n => n.peakDbfs)) + r.deltaDb) * 100) / 100;
}
// the piece's own tutti is the CHORD: the seven players, with the vibraphone taking two bows (LG-30)
const chordVoices = ['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass', 'bowed_vibraphone']
    .map(k => peakAfter[k]).filter(v => v != null);
const chordPeak = powerSum(chordVoices);
const allPeak = powerSum(Object.values(peakAfter));
// what is over the ceiling TODAY, on one instrument alone — his "sometimes clipping in reaper"
const clippingNow = ok.map(r => {
    const rs = CARD.notes.filter(n => n.inst === r.inst && n.vel === 127 && n.found && n.peakDbfs != null);
    const p = rs.length ? Math.max(...rs.map(n => n.peakDbfs)) : null;
    return p != null && p > -1 ? { label: r.label, peakDbfs: p, afterTrimDbfs: peakAfter[r.inst] } : null;
}).filter(Boolean);

console.log('HEADROOM');
console.log('  the piece’s tutti (the chord: 7 players, the vibraphone on two bows) peaks at '
    + chordPeak.toFixed(1) + ' dBFS after trim → ' + (-1 - chordPeak).toFixed(1) + ' dB under the ceiling  '
    + (chordPeak <= -1 ? 'PASSES' : 'WOULD CLIP'));
console.log('  every instrument at once, all at fff (never happens in this piece): ' + allPeak.toFixed(1) + ' dBFS'
    + (allPeak > -1 ? ' — over, because a one-shot matched for LOUDNESS has a 17–23 dB crest' : ''));
if (clippingNow.length) {
    console.log('  OVER THE CEILING TODAY, on one note alone — his "sometimes clipping in reaper":');
    for (const c of clippingNow) console.log('    ' + c.label.padEnd(20) + 'peak ' + c.peakDbfs.toFixed(1)
        + ' dBFS  →  ' + c.afterTrimDbfs.toFixed(1) + ' after the trim');
}
console.log('');

// what the result should be, stated so 1b.5 can fail it
const worstBoost = ok.reduce((m, r) => Math.max(m, r.proposedTrimDb), -99);
const overFader = ok.filter(r => r.jsVolumeDb > 0.005);
console.log('AFTER THESE TRIMS, THE PREDICTION 1b.5 TESTS:');
console.log('  every instrument at velocity 127 measures ' + perVoiceK.toFixed(2) + ' ± 1 dB on its own,');
console.log('  and a ' + N_VOICES + '-voice tutti at fff sums to ' + TUTTI_LUFS.toFixed(1) + ' LUFS-S and stays under −1 dBTP.');
console.log('  largest trim ' + worstBoost.toFixed(2) + ' dB · ' + overFader.length + ' track(s) need a JS Volume beyond the +12 fader'
    + (overFader.length ? ': ' + overFader.map(r => r.label).join(', ') : ''));

const out = {
    generatedAt: new Date().toISOString(), planItem: '1b.3', piece: 'lgmf',
    standard: REF.standard, reference: 'bank/reference.json', card: 'bank/instrument_card.json',
    cardGeneratedAt: CARD.generatedAt,
    target: { tuttiLufs: TUTTI_LUFS, voices: N_VOICES, perVoiceLufs: Math.round(perVoiceLufs * 100) / 100,
              perVoiceCardDb: Math.round(perVoiceK * 100) / 100, tuttiCardDb: Math.round(targetTuttiK * 100) / 100,
              kToLufsOffsetDb: Math.round(K_TO_LUFS * 100) / 100, truePeakCeilingDbtp: -1 },
    rule: { pitched: 'the integrated figure — K-weighted RMS over the whole sounding note',
            percussion: 'the loudest 400 ms, K-weighted — 0d’s rule, because a one-shot’s integrated value follows its ring length',
            faderMaxDb: FADER_MAX_DB, remainder: 'a JS: Volume Adjustment FX, as 0d did (§58)' },
    instruments: rows,
    headroom: { chordTuttiPeakDbfs: Math.round(chordPeak * 100) / 100,
                allAtOncePeakDbfs: Math.round(allPeak * 100) / 100,
                ceilingDbtp: -1, peakAfterTrimDbfs: peakAfter,
                overTheCeilingToday: clippingNow,
                method: "each voice's measured sample peak at velocity 127 plus its change, summed in POWER — "
                      + "pessimistic, because independent peaks rarely coincide; 1b.5 measures the real thing" },
};
if (!DRY) {
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
    console.log('\nwrote ' + path.relative(ROOT, OUT));
} else {
    console.log('\ndry run — nothing written');
}
