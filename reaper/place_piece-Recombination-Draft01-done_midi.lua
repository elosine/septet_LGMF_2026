-- place_piece-Recombination-Draft01-done_midi.lua — written by tools/export_midi.js (2026-09-27T00:40; RUNNING_LOG §453).
-- Run INSIDE the render project (a copy of the rack): Actions → Show action list → New action → Load ReaScript → this file → Run.
-- Sets the tempo to 60 BPM (the files are 60 BPM / 960 PPQ), then builds each part's MIDI item on the track of the SAME NAME at 0:00 —
-- by name, never by position (piece #4's trap: a duplicated track shifts a positional drop) — directly, with no MIDI import and so
-- no import prompt (tools/reaper_midi_place.js). Undo reverses all of it. tools/render_reaper.js does the same through the bridge.
local function place(tr, name, evt, itemEnd)
  local item = reaper.CreateNewMIDIItemInProj(tr, 0, itemEnd, false)
  local take = reaper.GetActiveTake(item)
  reaper.GetSetMediaItemTakeInfo_String(take, 'P_NAME', name, true)
  local parts, last = {}, 0
  for line in io.lines(evt) do
    local t, st, a, b = line:match('^(%d+) (%d+) (%d+) (%d+)$')
    if t then
      st, a, b = tonumber(st), tonumber(a), tonumber(b)
      local ppq = math.floor(reaper.MIDI_GetPPQPosFromProjTime(take, tonumber(t) / 960) + 0.5)
      local hi = st & 0xF0
      local msg = (hi == 0xC0 or hi == 0xD0) and string.char(st, a) or string.char(st, a, b)
      parts[#parts + 1] = string.pack('<i4Bi4', ppq - last, 0, #msg) .. msg
      last = ppq
    end
  end
  local endppq = math.floor(reaper.MIDI_GetPPQPosFromProjTime(take, itemEnd) + 0.5)
  parts[#parts + 1] = string.pack('<i4Bi4', math.max(0, endppq - last), 0, 3) .. string.char(0xB0, 123, 0)
  reaper.MIDI_SetAllEvts(take, table.concat(parts))
  reaper.MIDI_Sort(take)
  local _, notes, ccs = reaper.MIDI_CountEvts(take)
  return notes, ccs
end
local files = {
  { [[English Horn XS]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\01 English Horn XS.evt]], 193 },
  { [[Bassoon SI2]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\02 Bassoon SI2.evt]], 46 },
  { [[Bassoon SI2 b]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\03 Bassoon SI2 b.evt]], 56 },
  { [[Horn SI2]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\04 Horn SI2.evt]], 34 },
  { [[Horn SI2 high]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\05 Horn SI2 high.evt]], 34 },
  { [[Horn SI2 b]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\06 Horn SI2 b.evt]], 64 },
  { [[Horn SI2 b high]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\07 Horn SI2 b high.evt]], 64 },
  { [[Trumpet SI2]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\08 Trumpet SI2.evt]], 37 },
  { [[Trumpet SI2 b]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\09 Trumpet SI2 b.evt]], 80 },
  { [[Percussion]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\10 Percussion.evt]], 98 },
  { [[Template]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\11 Template.evt]], 98 },
  { [[Finger Cymbals ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\12 Finger Cymbals ARO.evt]], 0 },
  { [[Bell Tree ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\13 Bell Tree ARO.evt]], 0 },
  { [[Sleigh Bells ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\14 Sleigh Bells ARO.evt]], 13 },
  { [[Triangles ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\15 Triangles ARO.evt]], 0 },
  { [[Tambourines ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\16 Tambourines ARO.evt]], 14 },
  { [[Castanets ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\17 Castanets ARO.evt]], 19 },
  { [[Claves ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\18 Claves ARO.evt]], 0 },
  { [[Shakers ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\19 Shakers ARO.evt]], 0 },
  { [[Brake Drums ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\20 Brake Drums ARO.evt]], 13 },
  { [[Crashers and Stack ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\21 Crashers and Stack ARO.evt]], 0 },
  { [[Wood Blocks ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\22 Wood Blocks ARO.evt]], 12 },
  { [[Bass Drum ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\23 Bass Drum ARO.evt]], 16 },
  { [[Bass Drum Alt ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\24 Bass Drum Alt ARO.evt]], 16 },
  { [[Temple Bowls ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\25 Temple Bowls ARO.evt]], 11 },
  { [[Tam Tams ARO]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\26 Tam Tams ARO.evt]], 0 },
  { [[Cello XS]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\27 Cello XS.evt]], 87 },
  { [[Bass XS]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\28 Bass XS.evt]], 119 },
  { [[Vibraphone XS]], [[C:\Users\jwloy\GitHub\septet_LGMF_2026\midi\piece-Recombination-Draft01-done\29 Vibraphone XS.evt]], 262 },
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
    local okp, notes = pcall(place, target, f[1], f[2], 889.667)
    if okp and reaper.CountTrackMediaItems(target) == before + 1 and notes == f[3] then report[#report + 1] = "ok  " .. f[1] .. "  (" .. notes .. " notes)"
    else bad = bad + 1; report[#report + 1] = "FAILED  " .. f[1] .. "  " .. tostring(notes) .. " of " .. f[3] .. " notes" end
  end
end
reaper.SetEditCurPos(0, false, false)
reaper.PreventUIRefresh(-1)
reaper.UpdateArrange()
reaper.Undo_EndBlock("Place piece-Recombination-Draft01-done MIDI (60 BPM, by track name)", -1)
reaper.ShowMessageBox((bad == 0 and "All parts placed at 0:00, tempo 60 BPM.\n\n" or (bad .. " PROBLEM(S) — see below.\n\n")) .. table.concat(report, "\n"), "piece-Recombination-Draft01-done MIDI", 0)
