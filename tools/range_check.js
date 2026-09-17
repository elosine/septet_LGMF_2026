#!/usr/bin/env node
// range_check.js — PLAN 0d (2026-09-06): the notes and trills of a score that fall outside their technique's range as the recipe
// now knows it (the measured ranges applied by tools/apply_ranges.js) — the ones that play silent, or on a key with no sample.
//
//   node tools/range_check.js scores/piece-septet-work.json
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2]; if (!file) { console.error('usage: node tools/range_check.js <score.json>'); process.exit(1); }
const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const S = JSON.parse(fs.readFileSync(path.resolve(ROOT, file), 'utf8'));
const tracks = S.tracks || [];
const N = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; const nm = m => N[m % 12] + (Math.floor(m / 12) - 1);
const techOf = (layer, key) => { const tr = tracks[layer]; const I = tr && INSTRUMENTS[tr.instKey]; if (!I) return null; return { I, q: (I.techniques || []).find(x => x.key === key) || null }; };
const check = (layer, key, midi) => {
    const t = techOf(layer, key); if (!t) return { ok: true, why: 'no recipe' };
    if (!t.q) return { ok: false, why: 'no such technique on this instrument' };
    const lo = t.q.rangeLow != null ? t.q.rangeLow : t.I.rangeLow, hi = t.q.rangeHigh != null ? t.q.rangeHigh : t.I.rangeHigh;
    if (midi < lo) return { ok: false, why: 'below the ' + (t.q.measured ? 'measured' : 'zone') + ' bottom ' + nm(lo) + ' (' + lo + ')' };
    if (midi > hi) return { ok: false, why: 'above the ' + (t.q.measured ? 'measured' : 'zone') + ' top ' + nm(hi) + ' (' + hi + ')' };
    if (t.q.silentKeys && t.q.silentKeys.includes(midi)) return { ok: false, why: 'a silent key inside the range' };
    return { ok: true, why: t.q.measured ? 'measured' : 'unmeasured zone' };
};
const out = [];
let notes = 0, trills = 0, unmeasured = 0;
for (const o of S.objects || []) {
    if (o.type === 'waveCurve' && o.sonifyNote != null && o.layer < tracks.length) {
        notes++; const r = check(o.layer, o.technique, o.sonifyNote);
        if (!r.ok) out.push({ kind: 'note', t: o.startSeconds, layer: o.layer, id: o.id, group: o.groupId, key: o.technique, midi: o.sonifyNote, why: r.why });
        else if (r.why === 'unmeasured zone') unmeasured++;
    }
    if (o.type === 'zone' && o.midiModel === 'trill' && o.trill) {
        trills++; const t = o.trill;
        // the app folds the pair into the trill technique's range by octaves at playback (trillPitchInRange): say where it lands
        const tq = techOf(o.layer, t.technique); let p = t.pitch, q2 = p + (t.interval || 2);
        if (tq && tq.q) { const lo = tq.q.rangeLow != null ? tq.q.rangeLow : tq.I.rangeLow, hi = tq.q.rangeHigh != null ? tq.q.rangeHigh : tq.I.rangeHigh;
            if (lo != null && hi != null) { while (Math.min(p, q2) < lo) { p += 12; q2 += 12; } while (Math.max(p, q2) > hi && Math.min(p, q2) - 12 >= lo) { p -= 12; q2 -= 12; } } }
        if (p !== t.pitch) out.push({ kind: 'trill', t: o.startTime, layer: o.layer, id: o.id, key: t.technique, midi: t.pitch, why: 'folded at playback to ' + nm(p) + ' (' + p + ') — the label says ' + nm(t.pitch) });
        for (const [what, key, m] of [['trill', t.technique, p], ['trill', t.technique, q2], ['attack', t.attackTech || t.technique, p]]) {
            const r = check(o.layer, key, m);
            if (!r.ok) out.push({ kind: what, t: o.startTime, layer: o.layer, id: o.id, key, midi: m, why: r.why });
        }
    }
}
out.sort((a, b) => a.t - b.t);
console.log(path.basename(file) + ': ' + notes + ' notes, ' + trills + ' trills checked' + (unmeasured ? ' (' + unmeasured + ' notes on techniques still unmeasured)' : ''));
if (!out.length) console.log('every note and trill sits inside its technique range');
else {
    console.log(out.length + ' outside their technique range — these play silent or on a key with no sample:');
    for (const r of out) console.log('  ' + r.t.toFixed(2).padStart(7) + ' s  ' + ((tracks[r.layer] || {}).short || r.layer).padEnd(4) + ' ' + r.kind.padEnd(6) + ' ' + nm(r.midi).padEnd(4) + '(' + r.midi + ')  ' + String(r.key).padEnd(18) + ' ' + r.why + (r.group ? '   [' + r.group + ']' : '') + '  ' + r.id);
}
