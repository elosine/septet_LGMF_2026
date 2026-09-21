-- read-only (PLAN 1m.1, RUNNING_LOG §221): every track that takes LGPerc, or is named Percussion / ARO — its state (mute, armed,
-- monitoring, the MIDI input's device and channel), its instruments, and what his RECORDING holds on it: the notes by channel and key,
-- and every controller by channel and number. Written to find why a claves note sounds as a triangle. Nothing is changed.
local out = {}
for ti = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, ti)
  local _, name = reaper.GetTrackName(tr)
  local inp = math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECINPUT'))
  local isMidi = inp >= 4096
  local dev, ch = -1, -1
  if isMidi then dev = ((inp - 4096) >> 5) & 63; ch = (inp - 4096) & 31 end
  local lname = name:lower()
  if lname:find('aro') or lname:find('perc') then
    local notes, ccs, items = {}, {}, 0
    for ii = 0, reaper.CountTrackMediaItems(tr) - 1 do
      local take = reaper.GetActiveTake(reaper.GetTrackMediaItem(tr, ii))
      if take and reaper.TakeIsMIDI(take) then
        items = items + 1
        local _, nNotes, nCC = reaper.MIDI_CountEvts(take)
        for n = 0, nNotes - 1 do
          local ok, _, _, _, _, chan, pitch, vel = reaper.MIDI_GetNote(take, n)
          if ok then local k = 'ch' .. (chan + 1) .. ' key' .. pitch; local c = notes[k] or { n = 0, velMin = 127, velMax = 0 }; notes[k] = c
            c.n = c.n + 1; if vel < c.velMin then c.velMin = vel end; if vel > c.velMax then c.velMax = vel end end
        end
        for i = 0, nCC - 1 do
          local ok, _, _, _, msg, chan, m2, m3 = reaper.MIDI_GetCC(take, i)
          if ok then local k = 'ch' .. (chan + 1) .. ' msg' .. msg .. ' #' .. m2; local c = ccs[k] or { n = 0, min = 127, max = 0 }; ccs[k] = c
            c.n = c.n + 1; if m3 < c.min then c.min = m3 end; if m3 > c.max then c.max = m3 end end
        end
      end
    end
    local fx = {}
    for f = 0, reaper.TrackFX_GetCount(tr) - 1 do
      local _, fxn = reaper.TrackFX_GetFXName(tr, f, '')
      local _, pre = reaper.TrackFX_GetPreset(tr, f, '')
      fx[#fx + 1] = { name = fxn, preset = pre, enabled = reaper.TrackFX_GetEnabled(tr, f), offline = reaper.TrackFX_GetOffline(tr, f) }
    end
    out[#out + 1] = { n = ti + 1, name = name, mute = reaper.GetMediaTrackInfo_Value(tr, 'B_MUTE'), armed = reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM'),
      monitor = reaper.GetMediaTrackInfo_Value(tr, 'I_RECMON'), inputDevice = dev, inputChannel = ch, items = items, notes = notes, ccs = ccs, fx = fx }
  end
end
return out
