-- dump_recorded_midi.lua — RUNNING_LOG §75 (2026-09-19): what each track actually RECEIVED, read out of his recording.
-- Principle 12: measure the layer that reaches the INSTRUMENT. He records the app's playback into the rack (record
-- input MIDI); this job walks every track's items and returns, per track: its live MIDI input (port name + channel)
-- and, per item, the notes (sec, chan, pitch, vel, dur) and the CC / bend traffic per channel. Read-only; never saves.
--   node tools/reaper_job.js run reaper/bridge/jobs/dump_recorded_midi.lua
local out = {}
local MAXN = 400
for ti = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, ti)
  local _, name = reaper.GetTrackName(tr)
  local rec = reaper.GetMediaTrackInfo_Value(tr, 'I_RECINPUT')
  local input = nil
  if rec >= 4096 then
    local dev = math.floor((rec - 4096) / 32)
    local ch = (rec - 4096) % 32
    local ok, dname = reaper.GetMIDIInputName(dev, '')
    input = { dev = dev, ch = ch, port = (ok and dname) or ('dev ' .. dev), all = (dev == 63) }
  end
  local items = {}
  for ii = 0, reaper.CountTrackMediaItems(tr) - 1 do
    local it = reaper.GetTrackMediaItem(tr, ii)
    local take = reaper.GetActiveTake(it)
    if take and reaper.TakeIsMIDI(take) then
      local pos = reaper.GetMediaItemInfo_Value(it, 'D_POSITION')
      local len = reaper.GetMediaItemInfo_Value(it, 'D_LENGTH')
      local nN, nCC = reaper.MIDI_CountEvts(take)
      local notes = {}
      for n = 0, nN - 1 do
        local ok, sel, muted, s, e, chan, pitch, vel = reaper.MIDI_GetNote(take, n)
        if ok and #notes < MAXN then
          local ts = reaper.MIDI_GetProjTimeFromPPQPos(take, s)
          local te = reaper.MIDI_GetProjTimeFromPPQPos(take, e)
          notes[#notes + 1] = { math.floor(ts * 1000) / 1000, chan + 1, pitch, vel, math.floor((te - ts) * 1000) / 1000 }
        end
      end
      local cc = {}
      for c = 0, nCC - 1 do
        local ok, sel, muted, ppq, msg, chan, m2, m3 = reaper.MIDI_GetCC(take, c)
        if ok then
          local k = tostring(chan + 1)
          cc[k] = cc[k] or { cc0 = {}, cc7 = 0, bend = 0, other = 0, otherCC = {} }
          if msg == 176 and m2 == 0 then
            local seen = false
            for _, v in ipairs(cc[k].cc0) do if v == m3 then seen = true end end
            if not seen then cc[k].cc0[#cc[k].cc0 + 1] = m3 end
          elseif msg == 176 and m2 == 7 then cc[k].cc7 = cc[k].cc7 + 1
          elseif msg == 224 then cc[k].bend = cc[k].bend + 1
          else
            cc[k].other = cc[k].other + 1
            if msg == 176 then cc[k].otherCC[tostring(m2)] = (cc[k].otherCC[tostring(m2)] or 0) + 1 end
          end
        end
      end
      items[#items + 1] = { pos = math.floor(pos * 1000) / 1000, len = math.floor(len * 1000) / 1000,
                            noteCount = nN, ccCount = nCC, notes = notes, cc = cc }
    end
  end
  out[#out + 1] = { index = ti + 1, name = name, input = input, items = items }
end
return out
