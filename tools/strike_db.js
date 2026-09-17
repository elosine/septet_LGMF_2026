#!/usr/bin/env node
// strike_db.js — PLAN 1c.1: the SCATTERED-STRIKE DATABASE, captured from a composer save.
//
//   node tools/strike_db.js --score ScatteredStrikes01 [--w0 0 --w1 999] [--gap 500] [--sim 60]
//                           [--label "text"] [--dry] [--out bank/scattered_strikes.json]
//
// In the mould of piece #2's ostinato timing DB (bank/ostinato_timing_db_2p2p.json): ingestions
// with provenance, per-sample stats, two thresholds — but pitch-AWARE, because the composer
// wants the harmony of every strike (RUNNING_LOG §33, his words):
//
//   "capture all the onsets for each scattered strike and their relationship … absolute rhythmic
//    displacement, but also some sort of normalized version that can be transformed, multiplied,
//    or stretched … capture the harmony in each one, that's with all the notes … for the rhythms,
//    if there are any that are essentially simultaneous … a threshold, maybe fifty, maybe sixty
//    milliseconds … redact the ones that fall too close … the harmonies, capture everything …
//    the gaps between the strikes as well — the timing of the whole sequence."
//
// A STRIKE = a cluster of note onsets separated from the next by more than --gap ms (default
// 500, the ostinato DB's burst gap). Per strike:
//   notes    every note (nothing redacted): object id, layer → instKey, midi, technique, velocity,
//            and its displacement from the strike's first onset three ways — dtMs (absolute),
//            dtNorm (0–1 over the strike's span), dtUnits (in units of the strike's median KEPT gap)
//   harmony  the pitch content of all notes: sorted midis, pitch classes, instruments
//   rhythm   the onsets that survive the simultaneity redaction (--sim ms, default 60): the first
//            onset is kept; a later onset is kept only if it is >= sim after the last KEPT one;
//            the redacted notes are listed under the onset they merged into (rhythm.groups)
// The SEQUENCE = the strikes in order: inter-strike distances first-onset to first-onset,
// absolute and normalized (by the sequence span, and in units of the median inter-strike gap),
// plus the gap from each strike's last onset to the next strike's first.
//
// Ids are deterministic functions of the source (D9): a strike is ss-<score>-<firstObjectId>,
// a sequence seq-<score>-<w0>-<w1>. Re-ingesting the same score/window REPLACES its entries.
// Dependency-free node, like every tool here.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] != null && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
}
const flag = name => process.argv.includes('--' + name);

const scoreName = arg('score', null);
if (!scoreName) {
  console.error('usage: node tools/strike_db.js --score <name> [--w0 s --w1 s] [--gap ms] [--sim ms] [--label text] [--dry] [--out file]');
  process.exit(2);
}
const w0 = +arg('w0', 0), w1 = +arg('w1', 1e9);
const gapMs = +arg('gap', 500), simMs = +arg('sim', 60);
const outPath = path.join(ROOT, arg('out', 'bank/scattered_strikes.json'));
const label = arg('label', '');
const dry = flag('dry');

const scorePath = path.join(ROOT, 'scores', scoreName + '.json');
if (!fs.existsSync(scorePath)) { console.error('no such score: ' + scorePath); process.exit(2); }
const score = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
const tracks = score.tracks || [];
const instKeyOf = layer => (tracks[layer] && tracks[layer].instKey) || ('layer' + layer);

const notes = (score.objects || [])
  .filter(o => o.type === 'waveCurve' && o.sonifyNote != null && o.startSeconds >= w0 && o.startSeconds < w1)
  .sort((a, b) => a.startSeconds - b.startSeconds || a.sonifyNote - b.sonifyNote);
if (!notes.length) { console.error('no sounding notes in the window'); process.exit(1); }

// ---- cluster into strikes
const strikesRaw = [];
let cur = [notes[0]];
for (let i = 1; i < notes.length; i++) {
  if ((notes[i].startSeconds - notes[i - 1].startSeconds) * 1000 > gapMs) { strikesRaw.push(cur); cur = [notes[i]]; }
  else cur.push(notes[i]);
}
strikesRaw.push(cur);

const r3 = x => Math.round(x * 1000) / 1000;
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const strikes = strikesRaw.map((ns, index) => {
  const t0 = ns[0].startSeconds;
  const tLast = ns[ns.length - 1].startSeconds;
  const spanMs = (tLast - t0) * 1000;
  // rhythm: redaction at the simultaneity threshold, against the last KEPT onset
  const groups = [];
  let lastKept = -Infinity;
  for (const n of ns) {
    const dtMs = (n.startSeconds - t0) * 1000;
    if (dtMs - lastKept >= simMs || groups.length === 0) { groups.push({ dtMs: r3(dtMs), objectIds: [n.id] }); lastKept = dtMs; }
    else groups[groups.length - 1].objectIds.push(n.id);
  }
  const onsetsMs = groups.map(g => g.dtMs);
  const gapsMs = onsetsMs.slice(1).map((t, i) => r3(t - onsetsMs[i]));
  const medianGapMs = median(gapsMs);
  const noteRows = ns.map(n => {
    const dtMs = (n.startSeconds - t0) * 1000;
    return {
      objectId: n.id, layer: n.layer, instKey: instKeyOf(n.layer), midi: n.sonifyNote,
      technique: n.technique || null, vel: n.recVel != null ? n.recVel : null,
      durMs: r3((n.endSeconds - n.startSeconds) * 1000),
      dtMs: r3(dtMs),
      dtNorm: spanMs > 0 ? r3(dtMs / spanMs) : 0,
      dtUnits: medianGapMs ? r3(dtMs / medianGapMs) : null,
    };
  });
  const midis = [...new Set(ns.map(n => n.sonifyNote))].sort((a, b) => a - b);
  const vels = ns.map(n => n.recVel).filter(v => v != null);
  return {
    id: 'ss-' + scoreName + '-' + ns[0].id,
    source: scoreName, index, t0: r3(t0), tLast: r3(tLast), spanMs: r3(spanMs),
    label: label || null,
    notes: noteRows,
    harmony: {
      count: ns.length, midis,
      pcs: [...new Set(midis.map(m => m % 12))].sort((a, b) => a - b),
      instKeys: [...new Set(ns.map(n => instKeyOf(n.layer)))],
    },
    rhythm: {
      simultaneityMs: simMs,
      onsetsMs, onsetsNorm: onsetsMs.map(t => spanMs > 0 ? r3(t / spanMs) : 0),
      onsetsUnits: medianGapMs ? onsetsMs.map(t => r3(t / medianGapMs)) : onsetsMs.map(() => null),
      gapsMs, medianGapMs: medianGapMs != null ? r3(medianGapMs) : null,
      groups,
    },
    stats: {
      noteCount: ns.length, keptCount: groups.length, redactedCount: ns.length - groups.length,
      midi: { min: midis[0], max: midis[midis.length - 1] },
      vel: vels.length ? { avg: Math.round(vels.reduce((a, b) => a + b, 0) / vels.length), min: Math.min(...vels), max: Math.max(...vels) } : null,
    },
  };
});

// ---- the sequence
const t0s = strikes.map(s => s.t0);
const interMs = t0s.slice(1).map((t, i) => r3((t - t0s[i]) * 1000));
const seqSpanMs = r3((t0s[t0s.length - 1] - t0s[0]) * 1000);
const medInter = median(interMs);
const sequence = {
  id: 'seq-' + scoreName + '-' + w0 + '-' + (w1 >= 1e9 ? 'end' : w1),
  source: scoreName, window: [w0, w1 >= 1e9 ? null : w1], label: label || null,
  strikeIds: strikes.map(s => s.id),
  t0: t0s,
  interStrike: {
    absMs: interMs,
    normSpan: interMs.map(g => seqSpanMs > 0 ? r3(g / seqSpanMs) : 0),
    unitsMedian: medInter ? interMs.map(g => r3(g / medInter)) : interMs.map(() => null),
    medianMs: medInter != null ? r3(medInter) : null,
  },
  gapPrevEndMs: strikes.slice(1).map((s, i) => r3((s.t0 - strikes[i].tLast) * 1000)),
  spanMs: seqSpanMs,
};

// ---- census
const sizes = strikes.map(s => s.stats.noteCount), kept = strikes.map(s => s.stats.keptCount), spans = strikes.map(s => s.spanMs);
const mm = a => a.length ? Math.min(...a) + ' / ' + median(a) + ' / ' + Math.max(...a) : '-';
console.log('CENSUS  ' + scoreName + (w1 < 1e9 ? '  window ' + w0 + '-' + w1 + ' s' : '') + '  gap ' + gapMs + ' ms  sim ' + simMs + ' ms');
console.log('  notes ' + notes.length + ' · strikes ' + strikes.length + ' · notes/strike min/median/max ' + mm(sizes));
console.log('  rhythmic onsets kept ' + kept.reduce((a, b) => a + b, 0) + ' (per strike ' + mm(kept) + ') · redacted ' + (notes.length - kept.reduce((a, b) => a + b, 0)));
console.log('  strike span ms min/median/max ' + mm(spans.map(x => Math.round(x))) + ' · inter-strike ms ' + mm(interMs.map(x => Math.round(x))) + ' · sequence span ' + (seqSpanMs / 1000).toFixed(2) + ' s');
console.log('  pitch ' + Math.min(...notes.map(n => n.sonifyNote)) + '-' + Math.max(...notes.map(n => n.sonifyNote)) + ' · instruments ' + [...new Set(notes.map(n => instKeyOf(n.layer)))].join(','));
console.log('  #   t0(s)   notes kept  span(ms)  midi      pcs');
for (const s of strikes) console.log('  ' + String(s.index).padStart(2) + '  ' + s.t0.toFixed(3).padStart(7) + '   ' + String(s.stats.noteCount).padStart(3) + '  ' + String(s.stats.keptCount).padStart(3) + '   ' + String(Math.round(s.spanMs)).padStart(6) + '   ' + (s.stats.midi.min + '-' + s.stats.midi.max).padEnd(8) + '  ' + s.harmony.pcs.join(' '));
if (dry) { console.log('(dry — nothing written)'); process.exit(0); }

// ---- write / merge
let db = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {
  type: 'scattered_strike_db', version: 1, created: new Date().toISOString(),
  description: 'The scattered-strike database (PLAN 1c): per strike every note (harmony, nothing redacted) with its displacement absolute / normalized / in median-gap units, the rhythm after simultaneity redaction, and the sequence of inter-strike distances. Ids are functions of the source save (D9). tools/strike_db.js.',
  defaults: { strikeGapMs: 500, simultaneityMs: 60 },
  ingestions: [], sequences: {}, strikes: {},
};
db.updated = new Date().toISOString();
// replace this source+window's previous entries
const prev = db.sequences[sequence.id];
if (prev) for (const id of prev.strikeIds) delete db.strikes[id];
for (const s of strikes) db.strikes[s.id] = s;
db.sequences[sequence.id] = sequence;
db.ingestions = db.ingestions.filter(g => g.sequenceId !== sequence.id);
db.ingestions.push({
  timestamp: db.updated, source: scoreName, window: sequence.window, strikeGapMs: gapMs, simultaneityMs: simMs,
  notes: notes.length, strikes: strikes.length, redacted: notes.length - kept.reduce((a, b) => a + b, 0),
  sequenceId: sequence.id, strikeIds: strikes.map(s => s.id), label: label || null,
});
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(db, null, 1));
console.log('wrote ' + path.relative(ROOT, outPath) + ' — ' + Object.keys(db.strikes).length + ' strikes, ' + Object.keys(db.sequences).length + ' sequence(s), ' + db.ingestions.length + ' ingestion(s)');
