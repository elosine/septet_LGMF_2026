#!/usr/bin/env node
// tools/vib_close_probe.js — THE CLOSE-VOICE PROBE PAGE (LGMF PLAN 2h.4, 2026-09-28; RUNNING_LOG §477). Writes
// notation/ir/lgmf-vib-close-probe.ir.json — four pairs of vibraphone bows sounding together, 4 s each, from a synthetic IR built on
// the proto's own events (lgmf-vib-proto, ev-wc-3179 · ev-wc-3180 = the 56.123 s pair): the lower bow C6 (84) under C♯6 (85, the SAME
// staff line, the chord column's displacement) · D6 (86, a second) · E6 (88, a third) · F6 (89, a fourth) — so his eye sees the close
// rule's two looks side by side under ONE threshold (rules.json objects.ringBar.closeRule.withinSs): flush bars where the heads are
// within it, centred bars beyond it. Bare bows (no marks): the page is about the bars. Registers the page in notation/ir/index.json.
//   node tools/vib_close_probe.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const proto = rd('notation/ir/lgmf-vib-proto.ir.json');
const tA = proto.events.find(e => e.id === 'ev-wc-3180'), tB = proto.events.find(e => e.id === 'ev-wc-3179');
if (!tA || !tB) { console.error('the proto has no 56.123 s pair (ev-wc-3179 · ev-wc-3180) — STOP'); process.exit(1); }
const chunkOf = id => proto.chunks.find(c => (c.events || []).includes(id));
const ovProto = proto.overlays.find(o => o.kind === 'vibBows');
// the pairs stand on G5 (79) — high enough for the bowed vibraphone's line, low enough that no head folds under an 8va (F6 would,
// ottavaLedgerThreshold 3): G5 · G♯5 (one line, the chord column's displacement — the 56.123 s figure) · A5 · B5 · C6
const SP = { 79: ['G', 0, 5], 80: ['G', 1, 5], 81: ['A', 0, 5], 83: ['B', 0, 5], 84: ['C', 0, 6] };
const PAIRS = [[79, 80, 'the same line (G5 · G♯5)'], [79, 81, 'a second (G5 · A5)'], [79, 83, 'a third (G5 · B5)'], [79, 84, 'a fourth (G5 · C6)']];
const DUR = 4, GAP = 2, T0 = 2;
const events = [], chunks = [], bows = [];
PAIRS.forEach(([lo, hi, what], i) => {
  const t = T0 + i * (DUR + GAP);
  const ids = [];
  [[lo, 'a', tA, 0, 'lower'], [hi, 'b', tB, 1, 'upper']].forEach(([midi, tag, tpl, chain, voice]) => {
    const id = 'ev-probe-' + i + tag, [step, alter, octave] = SP[midi];
    ids.push(id);
    events.push(Object.assign({}, JSON.parse(JSON.stringify(tpl)), { id, source: { score: proto.source.score, objectId: 'probe-' + i + tag }, onset: t, duration: DUR,
      pitch: { midi, spelled: { step, alter, octave } } }));
    bows.push({ event: id, chain, voice, t0: t, t1: t + DUR, midi, restart: true, startName: 'mp', marks: [], what });
  });
  // ONE chunk for the pair: the chord column runs over the notes of one chunk at one onset (layout.js chordGeometry)
  const ch = JSON.parse(JSON.stringify(chunkOf(tA.id)));
  chunks.push(Object.assign(ch, { id: 'ch-5-probe-' + i, span: [t, t + DUR], events: ids }));
});
const W = [0, T0 + PAIRS.length * (DUR + GAP)];
const ir = {
  irVersion: proto.irVersion, id: 'lgmf-vib-close-probe',
  source: { score: proto.source.score, window: W, parts: [5] },
  provenance: { createdBy: 'tools/vib_close_probe.js', date: new Date().toISOString().slice(0, 10), tool: 'vib_close_probe',
    notes: 'PLAN 2h.4 (§477): four pairs of bows sounding together — the same line · a second · a third · a fourth — for his eye on the close rule; synthetic, built on lgmf-vib-proto\'s 56.123 s pair', build: 'node tools/vib_close_probe.js' },
  events, chunks,
  overlays: [{ id: 'ov-vib-probe-p5', kind: 'vibBows', target: { part: 5, span: W }, value: { group: 'probe', name: 'close-voice probe', ladder: ovProto.value.ladder, bows }, provenance: 'authored' }],
};
fs.writeFileSync(path.join(ROOT, 'notation/ir/lgmf-vib-close-probe.ir.json'), JSON.stringify(ir, null, 1) + '\n');
const idx = rd('notation/ir/index.json');
if (!idx.irs.some(x => x.id === ir.id)) {
  const at = idx.irs.findIndex(x => x.id === 'lgmf-vib-proto');
  idx.irs.splice(at >= 0 ? at + 1 : idx.irs.length, 0, { id: ir.id, label: 'lgmf-vib-close-probe · the two bars at the same line · a second · a third · a fourth — the close rule for his eye (2h.4)', score: proto.source.score, window: W, profile: 'trance' });
  fs.writeFileSync(path.join(ROOT, 'notation/ir/index.json'), JSON.stringify(idx, null, 1) + '\n');
}
console.log('wrote notation/ir/lgmf-vib-close-probe.ir.json — ' + events.length + ' events, ' + bows.length + ' bows, window ' + W.join(' … ') + ' s; index.json ' + (idx.irs.some(x => x.id === ir.id) ? 'has it' : '?'));
