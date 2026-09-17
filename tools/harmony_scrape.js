#!/usr/bin/env node
// harmony_scrape.js — PLAN 1d's first pass (2026-09-07, for the beating drawer's banners; CN-35 / CN-36): the harmonies of the earlier
// pieces gathered into bank/harmonies.json —
//   · the tuba piece's BLASTS: for_seven_tubas/bank/blast_taxonomy.json — the sonorities' DISTINCT pitch sets (138 sonorities → 39),
//     each named by its first S-number and its chord · voicing, the sonorities that share the set listed as aliases; the harmony
//     families' own voicings (V1 …) where they add a set; the customLists kept as tags (INT2 blasts · unisons · more chords);
//   · the two-piano piece's CHORD SHAPES: every composer save's databases.chordShapes (the keyboard module), the union by interval set
//     (the ids differ per save), each with the MIDI it was captured from, the saves it appears in counted;
//   · the septet's STRIKES stay live in bank/scattered_strikes.json (the panel reads them there).
// Read-only on the other repos. Re-run when they change.
//   node tools/harmony_scrape.js [--tuba <repo>] [--pp <repo>] [--out bank/harmonies.json]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const TUBA = opt('tuba', 'C:/Users/jwloy/GitHub/for_seven_tubas'), PP = opt('pp', 'C:/Users/jwloy/GitHub/composition_for_two_pianos_and_two_percussion');
const OUT = path.resolve(ROOT, opt('out', 'bank/harmonies.json'));
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nn = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const setKey = ps => ps.slice().sort((a, b) => a - b).join(',');

// ---- the tuba's blasts ----
const tax = JSON.parse(fs.readFileSync(path.join(TUBA, 'bank', 'blast_taxonomy.json'), 'utf8'));
const lists = tax.customLists || {};
const tagOf = id => Object.entries(lists).filter(([, ids]) => ids.includes(id)).map(([k]) => k);
const blastSets = new Map();
for (const [id, s] of Object.entries(tax.sonorities || {})) {
    if (!s.pitches || !s.pitches.length) continue;
    const k = setKey(s.pitches);
    if (!blastSets.has(k)) blastSets.set(k, { id, name: (s.chord || '?') + (s.voicing ? ' ' + s.voicing : ''), pitches: s.pitches.slice().sort((a, b) => a - b), aliases: [], tags: new Set(tagOf(id)), cuivre: s.cuivreConverted || [], note: s.note || '' });
    else { const e = blastSets.get(k); e.aliases.push(id); tagOf(id).forEach(t => e.tags.add(t)); }
}
for (const [hid, h] of Object.entries(tax.harmonies || {})) {   // a family's voicing not sounded as a sonority still counts as a set
    for (const [v, vo] of Object.entries(h.voicings || {})) {
        if (!vo.pitches || !vo.pitches.length) continue;
        const k = setKey(vo.pitches);
        if (!blastSets.has(k)) blastSets.set(k, { id: hid + '/' + v, name: hid + ' ' + v, pitches: vo.pitches.slice().sort((a, b) => a - b), aliases: [], tags: new Set(['voicing']), cuivre: [], note: vo.desc || '' });
    }
}
const blasts = [...blastSets.values()].map(e => ({ id: e.id, name: e.name, pitches: e.pitches, n: e.pitches.length, lo: e.pitches[0], hi: e.pitches[e.pitches.length - 1], range: nn(e.pitches[0]) + '–' + nn(e.pitches[e.pitches.length - 1]), aliases: e.aliases, tags: [...e.tags], cuivre: e.cuivre, note: e.note }));
blasts.sort((a, b) => { const na = parseInt((a.id.match(/\d+/) || ['0'])[0], 10), nb = parseInt((b.id.match(/\d+/) || ['0'])[0], 10); return (b.id[0] === 'S') - (a.id[0] === 'S') || na - nb || a.id.localeCompare(b.id); });
const familiesWithoutPitches = Object.entries(tax.harmonies || {}).filter(([, h]) => !Object.keys(h.voicings || {}).length).map(([id]) => id);

// ---- the two-piano piece's chord shapes: the union over every composer save, by interval set ----
const ppDir = path.join(PP, 'composer_data');
const shapeSets = new Map(); let saves = 0;
for (const f of fs.readdirSync(ppDir).filter(x => x.endsWith('.json')).sort()) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(ppDir, f), 'utf8')); } catch (e) { continue; }
    const cs = (j.databases && j.databases.chordShapes) || []; if (!cs.length) continue; saves++;
    for (const s of cs) {
        if (!Array.isArray(s.intervals) || !s.intervals.length) continue;
        const k = s.intervals.join(',');
        const from = Array.isArray(s.capturedFrom) && s.capturedFrom.length ? s.capturedFrom.slice().sort((a, b) => a - b) : s.intervals.map(i => 60 + i);
        if (!shapeSets.has(k)) shapeSets.set(k, { intervals: s.intervals.slice(), name: s.structuredName || k, pitches: from, createdAt: s.createdAt || '', firstSeen: f, ids: new Set([s.id]), saves: new Set([f]) });
        else { const e = shapeSets.get(k); e.ids.add(s.id); e.saves.add(f); if (s.createdAt && (!e.createdAt || s.createdAt < e.createdAt)) e.createdAt = s.createdAt; }
    }
}
const shapes = [...shapeSets.values()].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '') || a.name.localeCompare(b.name))
    .map((e, i) => ({ id: 'cs-' + String(i + 1).padStart(3, '0'), name: e.name, intervals: e.intervals, pitches: e.pitches, n: e.pitches.length, lo: e.pitches[0], hi: e.pitches[e.pitches.length - 1], range: nn(e.pitches[0]) + '–' + nn(e.pitches[e.pitches.length - 1]), createdAt: e.createdAt, firstSeen: e.firstSeen, saveIds: [...e.ids].slice(0, 6), inSaves: e.saves.size }));

const out = {
    _contract: 'PLAN 1d, first pass (CN-35 / CN-36, 2026-09-07): the harmonies of the earlier pieces for the beating drawer\'s banners — DATA, generated by tools/harmony_scrape.js from the reference repos (read-only); re-run when they change. The septet\'s strikes are read live from bank/scattered_strikes.json. A full harmony module (the strikes drawer\'s facility over every collection; the Messiaen modes, clusters, tone rows, octaves, stacked fifths still to scrape) is PLAN 1d, to be planned.',
    generatedAt: new Date().toISOString(),
    banks: {
        strikes: { label: 'strikes', source: 'bank/scattered_strikes.json (live)', live: true },
        blasts: { label: 'blasts (the tuba piece)', source: path.relative(ROOT, path.join(TUBA, 'bank', 'blast_taxonomy.json')).replace(/\\/g, '/'), sonorities: Object.keys(tax.sonorities || {}).length, distinct: blasts.length, familiesWithoutPitches, entries: blasts },
        chordShapes: { label: 'chord shapes (2 pianos 2 percussion)', source: path.relative(ROOT, ppDir).replace(/\\/g, '/') + '/*.json → databases.chordShapes', saves, distinct: shapes.length, entries: shapes },
    },
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('harmonies → ' + path.relative(ROOT, OUT));
console.log('  blasts: ' + blasts.length + ' distinct pitch sets from ' + out.banks.blasts.sonorities + ' sonorities (+ the families\' voicings); ' + familiesWithoutPitches.length + ' families without pitches in the taxonomy: ' + familiesWithoutPitches.join(' '));
console.log('  chord shapes: ' + shapes.length + ' distinct interval sets over ' + saves + ' saves');
console.log('  first blasts: ' + blasts.slice(0, 3).map(b => b.id + ' ' + b.name + ' (' + b.n + 'n ' + b.range + (b.aliases.length ? ', +' + b.aliases.length : '') + ')').join(' · '));
console.log('  first shapes: ' + shapes.slice(0, 3).map(s => s.id + ' ' + s.name + ' (' + s.n + 'n ' + s.range + ', in ' + s.inSaves + ' saves)').join(' · '));
