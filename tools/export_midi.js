#!/usr/bin/env node
// export_midi.js — the septet's MIDI for the Reaper render (RUNNING_LOG §453, 2026-09-13; replaces piece #4's version, which compiled
// the save through sonify_core onto the TUBA ports and so dropped every septet event).
//
// The events are the COMPOSER'S OWN PLAYBACK, captured (tools/capture_composer_midi.js): trills, eaten notes, the measured velocity
// and CC7, every rule his ▶ plays. This tool checks the capture against the composer's objects, lays it out in the RACK'S track order,
// writes the file, reads it back, and writes the Reaper script that places each part on its track BY NAME.
//
//   node tools/export_midi.js [--score piece-lgmf] [--capture midi/<score>.capture.json] [--server http://localhost:5400]
//        [--rack reaper/lgmf_rack.rpp]
//
// Out:
//   midi/<score>.mid                    one file, the rack's tracks in order (named) — for a drag onto the first instrument track
//   midi/<score>/NN <track name>.mid    one file per rack track — for the script
//   reaper/place_<score>_midi.lua       Actions → Load ReaScript → run: tempo 60, each file on the track of the same name at 0:00
//
// THE TRACK LAYOUT is the rack's, read from the .rpp at export time: every track from the first one with a MIDI input to the last.
// A track receives exactly what its LIVE input receives — the whole port (all channels) unless its input names a channel — so the
// four piano tracks each get the piano port and the two bass clarinet tracks each get the BassCl port, as they do when he plays.
// A track with no MIDI input (the strike buses) gets one inert message (CC 110 = 0 on channel 16) so a drag cannot skip it.
// 60 BPM / 960 PPQ: one beat = one second, one tick ≈ 1.04 ms. SET THE REAPER PROJECT TO 60 BPM (the script does).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { writeMidi, PPQ } = require('./midi_out.js');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const score = arg('score', 'piece-lgmf');
const capFile = arg('capture', null);
const rackFile = arg('rack', 'reaper/lgmf_rack.rpp');

// the rack's track NAME → the loopMIDI port it plays (the names are his; a new or renamed track must be added here)
const RACK_PORT = {
  'Flute SI2': 'Flute', 'Fluteb SI2': 'Fluteb', 'Bass Clarinet XS': 'BassCl',
  'Piano Kontakt': 'Piano', 'PianoPlucked Kontakt': 'Piano', 'PianoMute PP2': 'Piano', 'PianoHarm PP2': 'Piano',
  'Vn1 XS': 'Vn1', 'Vn2 XS': 'Vn2', 'Va XS': 'Va', 'Vc XS': 'Vc',
};

function readRack(file) {
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
  const tracks = []; let depth = 0, cur = null, at = 0;
  for (const raw of lines) {
    const l = raw.trim();
    if (l.startsWith('<TRACK')) { cur = { name: '', rec: null }; tracks.push(cur); at = depth + 1; }
    if (l.startsWith('<')) depth++;
    if (cur && depth === at) {
      if (l.startsWith('NAME ')) cur.name = l.slice(5).replace(/^"(.*)"$/, '$1');
      if (l.startsWith('REC ')) { const f = l.split(/\s+/).map(Number); cur.rec = { armed: f[1], input: f[2] }; }
    }
    if (l === '>') { depth--; if (cur && depth < at) cur = null; }
  }
  // REC input: 4096 + device × 32 + channel (0 = all) for a MIDI input; anything below 4096 is audio
  for (const t of tracks) {
    const inp = t.rec ? t.rec.input : -1;
    t.midi = inp >= 4096 ? { device: (inp - 4096) >> 5, channel: (inp - 4096) & 31 } : null;
  }
  return tracks;
}

// a format-0 file: one track holding the 60 BPM tempo, the name and the events (ranked off · cc · bend · on at a tick, as midi_out.js)
function writeType0(abs, name, events) {
  const vlq = n => { const o = [n & 0x7f]; n >>= 7; while (n > 0) { o.unshift((n & 0x7f) | 0x80); n >>= 7; } return o; };
  const rank = k => (k === 'off' ? 0 : k === 'cc' ? 1 : k === 'bend' ? 2 : 3);
  const ev = events.map(e => ({ tick: Math.round(e.t * PPQ), kind: e.kind, bytes: e.bytes })).sort((x, y) => x.tick - y.tick || rank(x.kind) - rank(y.kind));
  const data = [0x00, 0xff, 0x51, 0x03, 0x0f, 0x42, 0x40, 0x00, 0xff, 0x03, ...vlq(name.length), ...Buffer.from(name, 'ascii')];
  let last = 0;
  for (const e of ev) { data.push(...vlq(Math.max(0, e.tick - last)), ...e.bytes); last = e.tick; }
  data.push(0x00, 0xff, 0x2f, 0x00);
  const u32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  fs.writeFileSync(abs, Buffer.concat([Buffer.from('MThd'), Buffer.from([0, 0, 0, 6, 0, 0, 0, 1, (PPQ >> 8) & 255, PPQ & 255]), Buffer.from('MTrk'), Buffer.from(u32(data.length)), Buffer.from(data)]));
}

(async () => {
  // 1. the capture
  let cap;
  if (capFile) cap = JSON.parse(fs.readFileSync(path.join(ROOT, capFile), 'utf8'));
  else {
    const { capture } = require('./capture_composer_midi.js');
    cap = await capture({ score, server: arg('server', 'http://localhost:5400') });
    fs.writeFileSync(path.join(ROOT, 'midi', score + '.capture.json'), JSON.stringify(cap));
  }
  const { meta, events, expect } = cap;
  const nowMtime = fs.statSync(path.join(ROOT, 'scores', score + '.json')).mtime.toISOString();
  if (meta.scoreMtime !== nowMtime) console.warn('WARN: ' + score + '.json was saved again after the capture (' + meta.scoreMtime + ' → ' + nowMtime + ') — re-run without --capture');
  const fails = [];

  // 2. THE CHECKS — the stream against the composer's own objects
  const lc = s => String(s || '').toLowerCase();
  const ons = events.filter(e => (e[2][0] & 0xF0) === 0x90 && e[2][2] > 0).map((e, i) => ({ port: lc(e[0]), ch: e[2][0] & 15, pitch: e[2][1], t: e[1], used: false }));
  const index = new Map();
  for (const o of ons) { const k = o.port + '|' + o.ch + '|' + o.pitch; (index.get(k) || index.set(k, []).get(k)).push(o); }
  const take = (port, ch, pitch, t, tol) => {
    const L = index.get(lc(port) + '|' + ch + '|' + pitch) || [];
    const hit = L.find(o => !o.used && Math.abs(o.t - t) <= tol);
    if (hit) hit.used = true;
    return !!hit;
  };
  const TOL = 0.003;
  // (a) every snippet note (trills, beatings) sounds, at its own time
  let snipWant = 0, snipGot = 0; const snipBad = [];
  for (const s of expect.snippets) {
    let got = 0;
    for (const [p, c, n, ms] of s.notes) if (take(p, c - 1, n, s.start + ms / 1000, TOL)) got++;
    snipWant += s.notes.length; snipGot += got;
    if (got !== s.notes.length) snipBad.push(s.id + ' ' + got + '/' + s.notes.length);
  }
  if (snipBad.length) fails.push('snippet notes missing: ' + snipBad.slice(0, 6).join(', '));
  // (b) every sounding note starts once, on its route, at its onset
  const noteBad = [];
  for (const n of expect.notes) if (!take(n.port, n.ch, n.pitch, n.t0, TOL)) noteBad.push(n.id + '@' + n.t0.toFixed(3));
  if (noteBad.length) fails.push(noteBad.length + ' notes missing: ' + noteBad.slice(0, 6).join(', '));
  // (c) the rest are keyswitch latches only — an eaten note leaves no attack of its own
  const ksKeys = new Set(expect.notes.filter(n => n.ks != null).map(n => lc(n.port) + '|' + n.ch + '|' + n.ks));
  const extra = ons.filter(o => !o.used && !ksKeys.has(o.port + '|' + o.ch + '|' + o.pitch));
  const eatenHits = expect.eaten.filter(n => extra.some(o => o.port === lc(n.port) && o.ch === n.ch && o.pitch === n.pitch && Math.abs(o.t - n.t0) <= 0.07));
  if (eatenHits.length) fails.push(eatenHits.length + ' eaten notes still sound: ' + eatenHits.slice(0, 5).map(n => n.id).join(', '));
  if (extra.length) fails.push(extra.length + ' note-ons nothing explains, e.g. ' + extra.slice(0, 4).map(o => o.port + ' ch' + (o.ch + 1) + ' ' + o.pitch + '@' + o.t.toFixed(3)).join(', '));
  // (d) no hanging note: every on is closed later on its slot
  const open = new Map(); let hanging = 0;
  for (const e of events.slice().sort((a, b) => a[1] - b[1])) {
    const st = e[2][0] & 0xF0, k = lc(e[0]) + '|' + (e[2][0] & 15) + '|' + e[2][1];
    if (st === 0x90 && e[2][2] > 0) open.set(k, (open.get(k) || 0) + 1);
    else if (st === 0x80 || (st === 0x90 && e[2][2] === 0)) { if (open.get(k) > 0) open.set(k, open.get(k) - 1); }
  }
  for (const v of open.values()) hanging += v;
  if (hanging) fails.push(hanging + ' notes never closed');
  // (e) [PLAN 2j.7–2j.8, RUNNING_LOG §548–§549] THE PITCH BEND: no note-on lands on a channel left bent by an earlier note (a bent
  //     note's channel is centred again at its exit), and a morph note's own bend is in place BEFORE its note-on (pre-armed). The
  //     first render started 45 of the 78 surge swells on bent channels (Va +84 c) and 62 morph notes at the written key.
  //     Each port's bend range is its instrument's MEASURED one (sandbox/instruments.js MEASURED_BEND, the composer's bend14Of): the
  //     Xsample parts bend ~1 st, the flute 2 — a fixed 199 c flagged 122 correct pre-arms as late at the 2026-09-16 re-render.
  {
    const vm = require('vm');
    const INST = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
    const rangeOfPort = new Map();
    for (const I of Object.values(INST)) {
      const ports = [I.port].concat(((I.channels && I.channels.curve) || []).map(c => c && c.port));
      for (const p of ports) if (p && !rangeOfPort.has(lc(p))) rangeOfPort.set(lc(p), I.bendRangeSt || 1.99);
    }
    const bentNotes = expect.notes.filter(n => n.bend0 != null);
    const findBent = (port, ch, pitch, t) => bentNotes.find(n => lc(n.port) === port && n.ch === ch && n.pitch === pitch && Math.abs(n.t0 - t) <= 0.01);
    const lastBend = new Map(); const onBent = [], lateBend = [];
    for (const e of events.slice().sort((a, b) => a[1] - b[1])) {
      const st = e[2][0] & 0xF0, port = lc(e[0]), ch = e[2][0] & 15, k = port + '|' + ch;
      if (st === 0xE0) { lastBend.set(k, (e[2][2] << 7) | e[2][1]); continue; }
      if (st !== 0x90 || e[2][2] === 0) continue;
      const b = lastBend.get(k), bn = findBent(port, ch, e[2][1], e[1]);
      if (!bn) { if (b != null && b !== 8192) onBent.push(port + ' ch' + (ch + 1) + ' ' + e[2][1] + '@' + e[1].toFixed(3) + ' bend ' + b); continue; }
      if (Math.abs(bn.bend0) < 1) continue;   // a bend of nothing needs no message
      const want = Math.max(0, Math.min(16383, Math.round(8192 + (Math.round(bn.bend0) / (100 * (rangeOfPort.get(port) || 1.99))) * 8192)));   // ±40 units ≈ ±½ c at 1 st, ±1 c at 2
      if (b == null || Math.abs(b - want) > 40) lateBend.push(bn.id + '@' + bn.t0.toFixed(3) + ' bend ' + (b == null ? 'none' : b) + ' wanted ' + want);
    }
    if (onBent.length) fails.push(onBent.length + ' note-ons on a channel still bent by an earlier note, e.g. ' + onBent.slice(0, 4).join(', '));
    if (lateBend.length) fails.push(lateBend.length + ' morph notes whose bend is not in place at the note-on, e.g. ' + lateBend.slice(0, 4).join(', '));
    console.log('  bend: ' + bentNotes.length + ' bent notes checked — ' + (lateBend.length ? lateBend.length + ' late' : 'every bend in place at the note-on') + ' · ' + (onBent.length ? onBent.length + ' note-ons on a bent channel' : 'no note-on on a bent channel'));
  }
  if (meta.blockedN) console.log('  note: the page tried ' + meta.blockedN + ' write(s), all refused — ' + meta.blocked.slice(0, 3).join(' · '));

  // 3. the rack's layout
  const rack = readRack(rackFile);
  const first = rack.findIndex(t => t.midi), last = rack.length - 1 - [...rack].reverse().findIndex(t => t.midi);
  const layout = rack.slice(first, last + 1);
  const devPort = new Map();
  for (const t of layout) {
    if (!t.midi) continue;
    const p = RACK_PORT[t.name];
    if (!p) { fails.push('rack track "' + t.name + '" has a MIDI input but no port in RACK_PORT'); continue; }
    if (devPort.has(t.midi.device) && devPort.get(t.midi.device) !== p) fails.push('rack: MIDI device ' + t.midi.device + ' feeds "' + t.name + '" (' + p + ') and a ' + devPort.get(t.midi.device) + ' track');
    devPort.set(t.midi.device, p);
  }
  const byPort = new Map();
  for (const e of events) { const k = lc(e[0]); (byPort.get(k) || byPort.set(k, []).get(k)).push(e); }
  const fed = new Set(layout.filter(t => t.midi && RACK_PORT[t.name]).map(t => lc(RACK_PORT[t.name])));
  for (const p of byPort.keys()) if (!fed.has(p)) fails.push('port ' + p + ' carries ' + byPort.get(p).length + ' messages but no rack track plays it');

  const kind = b => { const s = b[0] & 0xF0; return s === 0x80 || (s === 0x90 && b[2] === 0) ? 'off' : s === 0x90 ? 'on' : s === 0xE0 ? 'bend' : 'cc'; };
  const tracks = layout.map((t, i) => {
    const port = t.midi ? RACK_PORT[t.name] : null;
    let ev = port ? (byPort.get(lc(port)) || []) : [];
    if (port && t.midi.channel > 0) ev = ev.filter(e => (e[2][0] & 15) === t.midi.channel - 1);
    const out = ev.map(e => ({ t: e[1], kind: kind(e[2]), bytes: e[2] }));
    if (!out.length) out.push({ t: 0, kind: 'cc', bytes: [0xBF, 110, 0] });   // an inert message, so the track is not skipped
    return { n: i + 1, name: t.name, port, events: out };
  });

  if (fails.length) { console.error('EXPORT REFUSED — the capture does not match the score:\n  ' + fails.join('\n  ')); process.exit(1); }

  // 4. write: the combined file, one file per track, the script
  const combined = 'midi/' + score + '.mid';
  const res = writeMidi(combined, { bpm: 60, tracks: tracks.map(t => ({ name: t.name, events: t.events })) });
  const dir = path.join(ROOT, 'midi', score);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const fileOf = t => String(t.n).padStart(2, '0') + ' ' + t.name.replace(/[\\/:*?"<>|]/g, '_') + '.mid';
  for (const t of tracks) writeType0(path.join(dir, fileOf(t)), t.name, t.events);   // ONE track (tempo inside it): Reaper's multi-track import dialog can never appear

  // 5. read the combined file back: per track, the note-ons and every event's tick
  const buf = fs.readFileSync(path.join(ROOT, combined));
  const ntr = buf.readUInt16BE(10), ppq = buf.readUInt16BE(12);
  let p = 14; const back = [];
  for (let k = 0; k < ntr; k++) {
    const len = buf.readUInt32BE(p + 4), d = buf.subarray(p + 8, p + 8 + len); p += 8 + len;
    let i = 0, tick = 0, run = 0, n = 0, on = 0;
    const vlq = () => { let v = 0, c; do { c = d[i++]; v = (v << 7) | (c & 0x7f); } while (c & 0x80); return v; };
    while (i < d.length) {
      tick += vlq(); let st = d[i];
      if (st & 0x80) { i++; if (st < 0xF0) run = st; } else st = run;
      if (st === 0xFF) { i++; const l = vlq(); i += l; continue; }
      const hi = st & 0xF0; const b1 = d[i], b2 = d[i + 1]; i += (hi === 0xC0 || hi === 0xD0) ? 1 : 2; n++;
      if (hi === 0x90 && b2 > 0) on++;
    }
    back.push({ n, on, end: tick });
  }
  const want = tracks.map(t => ({ n: t.events.length, on: t.events.filter(e => e.kind === 'on').length }));
  const rbBad = want.map((w, k) => (back[k + 1].n !== w.n || back[k + 1].on !== w.on) ? tracks[k].name : null).filter(Boolean);
  if (ppq !== PPQ || ntr !== tracks.length + 1 || rbBad.length) { console.error('READ-BACK FAILED: ' + (rbBad.join(', ') || 'header')); process.exit(1); }

  // 6. the Reaper script — by NAME, the n-th file of a name onto the n-th track of that name
  const luaStr = s => '[[' + s + ']]';
  const { PLACE_LUA, writeEvt } = require('./reaper_midi_place.js');   // the one copy of how a part reaches a track
  const evts = tracks.map(t => writeEvt(path.join(dir, fileOf(t))));
  const itemEnd = +(Math.max(...tracks.flatMap(t => t.events.map(e => e.t))) + 6).toFixed(3);
  const lua = `-- place_${score}_midi.lua — written by tools/export_midi.js (${new Date().toISOString().slice(0, 16)}; RUNNING_LOG §453).
-- Run INSIDE the render project (a copy of the rack): Actions → Show action list → New action → Load ReaScript → this file → Run.
-- Sets the tempo to 60 BPM (the files are 60 BPM / 960 PPQ), then builds each part's MIDI item on the track of the SAME NAME at 0:00 —
-- by name, never by position (piece #4's trap: a duplicated track shifts a positional drop) — directly, with no MIDI import and so
-- no import prompt (tools/reaper_midi_place.js). Undo reverses all of it. tools/render_reaper.js does the same through the bridge.
${PLACE_LUA}
local files = {
${tracks.map((t, k) => '  { ' + luaStr(t.name) + ', ' + luaStr(evts[k].file) + ', ' + t.events.filter(e => e.kind === 'on').length + ' },').join('\n')}
}
reaper.Undo_BeginBlock()
reaper.PreventUIRefresh(1)
reaper.SetCurrentBPM(0, 60, true)
local used, report, bad = {}, {}, 0
for _, f in ipairs(files) do
  local target, targetIdx = nil, nil
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, name = reaper.GetTrackName(tr)
    if name == f[1] and not used[i] then target = tr; targetIdx = i; used[i] = true; break end
  end
  if not target then
    bad = bad + 1; report[#report + 1] = "NO TRACK named " .. f[1]
  else
    local before = reaper.CountTrackMediaItems(target)
    local okp, notes = pcall(place, target, f[1], f[2], ${itemEnd})
    if okp and reaper.CountTrackMediaItems(target) == before + 1 and notes == f[3] then report[#report + 1] = "ok  " .. f[1] .. "  (" .. notes .. " notes)"
    else bad = bad + 1; report[#report + 1] = "FAILED  " .. f[1] .. "  " .. tostring(notes) .. " of " .. f[3] .. " notes" end
  end
end
reaper.SetEditCurPos(0, false, false)
reaper.PreventUIRefresh(-1)
reaper.UpdateArrange()
reaper.Undo_EndBlock("Place ${score} MIDI (60 BPM, by track name)", -1)
reaper.ShowMessageBox((bad == 0 and "All parts placed at 0:00, tempo 60 BPM.\\n\\n" or (bad .. " PROBLEM(S) — see below.\\n\\n")) .. table.concat(report, "\\n"), "${score} MIDI", 0)
`;
  const luaFile = path.join('reaper', 'place_' + score + '_midi.lua');
  fs.writeFileSync(path.join(ROOT, luaFile), lua);

  // 7. report
  const notesAll = tracks.reduce((a, t) => a + t.events.filter(e => e.kind === 'on').length, 0);
  console.log('EXPORTED ' + score + ' — the composer\'s own playback, ' + meta.fps + ' fps, captured ' + meta.capturedAt.slice(0, 16));
  console.log('  checks: snippet notes ' + snipGot + '/' + snipWant + ' (' + expect.snippets.length + ' zones) · notes ' + (expect.notes.length - noteBad.length) + '/' + expect.notes.length +
    ' · eaten silent ' + expect.eaten.length + ' · keyswitch latches ' + ons.filter(o => !o.used).length + ' · hanging 0 · read-back ok');
  console.log('  ' + combined + ' — ' + tracks.length + ' tracks + tempo · ' + res.seconds + ' s · 60 BPM / ' + PPQ + ' PPQ');
  for (const t of tracks) console.log('    ' + String(t.n).padStart(2) + '. ' + t.name.padEnd(22) + (t.port ? t.port.padEnd(7) + String(t.events.filter(e => e.kind === 'on').length).padStart(6) + ' notes · ' + t.events.length + ' messages' : '(no MIDI input — one inert message)'));
  console.log('  midi/' + score + '/ — one file per track · ' + luaFile + ' — places them by name');
})().catch(e => { console.error('export failed: ' + e.stack); process.exit(1); });
