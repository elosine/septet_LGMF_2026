#!/usr/bin/env node
// tools/score_to_midi.js — a score file's plain notes as a Standard MIDI File (composer 2026-09-05: "give me a midi file
// from the trill_playing_samples file … I'll use the file to try some others" — other articulations, in Reaper).
//
//   node tools/score_to_midi.js scores/<name>.json [--layer N] [--out midi/<name>.mid] [--channel 1]
//
// Format 1, 480 ticks per beat, 120 bpm (1 beat = 500 ms), one track per lane that has notes (the lane's label as the
// track name), every note on the same channel (default 1) — no CC0, no CC7: the articulation is chosen in the sampler.
// Times are the score's own (the first note keeps its offset). Velocity = recVel (100 if absent); note-off at endSeconds.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
let layer = null, out = null, channel = 1, file = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--layer') layer = +args[++i]; else if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--channel') channel = +args[++i]; else file = args[i];
}
if (!file) { console.error('usage: node tools/score_to_midi.js scores/<name>.json [--layer N] [--out path] [--channel 1]'); process.exit(1); }
const PPQ = 480, USPB = 500000, ch = Math.max(0, Math.min(15, channel - 1));
const ticks = sec => Math.round(sec * 1000 * PPQ / (USPB / 1000));
const vlq = n => { const b = [n & 0x7F]; while ((n >>= 7) > 0) b.unshift((n & 0x7F) | 0x80); return b; };
const str = s => Array.from(Buffer.from(s, 'utf8'));
const track = bytes => { const d = Buffer.from(bytes); const h = Buffer.alloc(8); h.write('MTrk', 0); h.writeUInt32BE(d.length, 4); return Buffer.concat([h, d]); };

const s = JSON.parse(fs.readFileSync(file, 'utf8'));
const notes = s.objects.filter(o => o.type === 'waveCurve' && o.sonifyNote != null && (layer == null || o.layer === layer));
if (!notes.length) { console.error('no notes' + (layer != null ? ' on layer ' + layer : '')); process.exit(1); }
const layers = [...new Set(notes.map(o => o.layer))].sort((a, b) => a - b);
const tracks = [track([...vlq(0), 0xFF, 0x51, 0x03, (USPB >> 16) & 0xFF, (USPB >> 8) & 0xFF, USPB & 0xFF, ...vlq(0), 0xFF, 0x2F, 0x00])];
const report = [];
for (const L of layers) {
  const name = (s.tracks[L] && s.tracks[L].label) || ('lane ' + L);
  const ev = [];
  notes.filter(o => o.layer === L).forEach(o => {
    const on = ticks(o.startSeconds), off = Math.max(on + 1, ticks(o.endSeconds));
    ev.push({ t: on, p: 1, d: [0x90 | ch, o.sonifyNote, Math.max(1, Math.min(127, o.recVel != null ? o.recVel : 100))] });
    ev.push({ t: off, p: 0, d: [0x80 | ch, o.sonifyNote, 0] });
  });
  ev.sort((a, b) => a.t - b.t || a.p - b.p);
  const bytes = [...vlq(0), 0xFF, 0x03, ...vlq(str(name).length), ...str(name)];
  let prev = 0; for (const e of ev) { bytes.push(...vlq(e.t - prev), ...e.d); prev = e.t; }
  bytes.push(...vlq(0), 0xFF, 0x2F, 0x00);
  tracks.push(track(bytes));
  report.push(name + ': ' + (ev.length / 2) + ' notes');
}
const header = Buffer.alloc(14); header.write('MThd', 0); header.writeUInt32BE(6, 4); header.writeUInt16BE(1, 8); header.writeUInt16BE(tracks.length, 10); header.writeUInt16BE(PPQ, 12);
out = out || path.join(ROOT, 'midi', path.basename(file, '.json') + '.mid');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([header, ...tracks]));
console.log('wrote', path.relative(ROOT, out), '—', report.join('; '), '— channel', channel, '— last note ends', Math.max(...notes.map(o => o.endSeconds)).toFixed(2), 's');
