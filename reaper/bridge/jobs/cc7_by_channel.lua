-- read-only: per track, per MIDI channel — the notes (count, velocity range) and the CC7 traffic (count, min, max) in his recording
local out = {}
for ti = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, ti)
  local _, name = reaper.GetTrackName(tr)
  local chans, any = {}, false
  for ii = 0, reaper.CountTrackMediaItems(tr) - 1 do
    local take = reaper.GetActiveTake(reaper.GetTrackMediaItem(tr, ii))
    if take and reaper.TakeIsMIDI(take) then
      local _, nNotes, nCC = reaper.MIDI_CountEvts(take)
      for n = 0, nNotes - 1 do
        local ok, _, _, _, _, chan, _, vel = reaper.MIDI_GetNote(take, n)
        if ok then local k = tostring(chan + 1); local c = chans[k] or { notes = 0, velMin = 127, velMax = 0, cc7 = 0, cc7Min = 127, cc7Max = 0 }; chans[k] = c
          c.notes = c.notes + 1; if vel < c.velMin then c.velMin = vel end; if vel > c.velMax then c.velMax = vel end; any = true end
      end
      for i = 0, nCC - 1 do
        local ok, _, _, _, msg, chan, m2, m3 = reaper.MIDI_GetCC(take, i)
        if ok and msg == 176 and m2 == 7 then local k = tostring(chan + 1); local c = chans[k] or { notes = 0, velMin = 127, velMax = 0, cc7 = 0, cc7Min = 127, cc7Max = 0 }; chans[k] = c
          c.cc7 = c.cc7 + 1; if m3 < c.cc7Min then c.cc7Min = m3 end; if m3 > c.cc7Max then c.cc7Max = m3 end; any = true end
      end
    end
  end
  if any then out[#out + 1] = { name = name, chans = chans } end
end
return out
