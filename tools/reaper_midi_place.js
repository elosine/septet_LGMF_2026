// reaper_midi_place.js — ONE copy of how a part's MIDI reaches a Reaper track (RUNNING_LOG §453, 2026-09-13).
// Used by tools/render_reaper.js (through the bridge) and tools/export_midi.js (the by-hand script).
//
// THE ITEM IS BUILT DIRECTLY — no import, so no prompt: Reaper's "Import 16-channel MIDI and meta-events as…" dialog stopped the first
// render. A MIDI item from 0 to the given end on the track, its events set in one MIDI_SetAllEvts call; the buffer is
// { int32 delta-ppq, flag byte, int32 length, message } per event; a file tick is 1/960 s at 60 BPM, converted through the take's own
// time map; it ends with an all-notes-off at the item's end (Reaper's own terminator). Proven 2026-09-13 in an empty tab: the Vn1 part
// read back 487 notes, the first at 0.755208 s (the capture: 0.755), pitch 82, vel 127, the last at 624 s.
'use strict';
const fs = require('fs');

const PLACE_LUA = [
  'local function place(tr, name, evt, itemEnd)',
  '  local item = reaper.CreateNewMIDIItemInProj(tr, 0, itemEnd, false)',
  '  local take = reaper.GetActiveTake(item)',
  "  reaper.GetSetMediaItemTakeInfo_String(take, 'P_NAME', name, true)",
  '  local parts, last = {}, 0',
  '  for line in io.lines(evt) do',
  "    local t, st, a, b = line:match('^(%d+) (%d+) (%d+) (%d+)$')",
  '    if t then',
  '      st, a, b = tonumber(st), tonumber(a), tonumber(b)',
  '      local ppq = math.floor(reaper.MIDI_GetPPQPosFromProjTime(take, tonumber(t) / 960) + 0.5)',
  '      local hi = st & 0xF0',
  '      local msg = (hi == 0xC0 or hi == 0xD0) and string.char(st, a) or string.char(st, a, b)',
  "      parts[#parts + 1] = string.pack('<i4Bi4', ppq - last, 0, #msg) .. msg",
  '      last = ppq',
  '    end',
  '  end',
  '  local endppq = math.floor(reaper.MIDI_GetPPQPosFromProjTime(take, itemEnd) + 0.5)',
  "  parts[#parts + 1] = string.pack('<i4Bi4', math.max(0, endppq - last), 0, 3) .. string.char(0xB0, 123, 0)",
  '  reaper.MIDI_SetAllEvts(take, table.concat(parts))',
  '  reaper.MIDI_Sort(take)',
  '  local _, notes, ccs = reaper.MIDI_CountEvts(take)',
  '  return notes, ccs',
  'end',
].join('\n');

// a part's events as text lines "tick status data1 data2", parsed from its format-0 .mid (written next to it as .evt)
function writeEvt(midFile) {
  const b = fs.readFileSync(midFile); const len = b.readUInt32BE(18), d = b.subarray(22, 22 + len);
  let i = 0, tick = 0, run = 0; const lines = [];
  const vlq = () => { let v = 0, c; do { c = d[i++]; v = (v << 7) | (c & 0x7f); } while (c & 0x80); return v; };
  while (i < d.length) {
    tick += vlq(); let st = d[i];
    if (st & 0x80) { i++; if (st < 0xF0) run = st; } else st = run;
    if (st === 0xFF) { i++; const l = vlq(); i += l; continue; }
    const two = (st & 0xF0) === 0xC0 || (st & 0xF0) === 0xD0;
    lines.push(tick + ' ' + st + ' ' + d[i] + ' ' + (two ? 0 : d[i + 1])); i += two ? 1 : 2;
  }
  const out = midFile.replace(/\.mid$/, '.evt');
  fs.writeFileSync(out, lines.join('\n') + '\n');
  return { file: out, n: lines.length, on: lines.filter(l => { const f = l.split(' ').map(Number); return (f[1] & 0xF0) === 0x90 && f[3] > 0; }).length };
}

module.exports = { PLACE_LUA, writeEvt };
