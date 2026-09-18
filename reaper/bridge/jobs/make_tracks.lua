-- make_tracks.lua — the instrument tracks of the LGMF rack (PLAN 0e, 2026-09-17), idempotent.
-- One track per SPEC row: name · MIDI input = its LG port, ALL channels · input monitoring ON
-- (principle 1) · armed · fader 0 dB · the sampler inserted by name. A track of the same name
-- is re-configured, never duplicated; new tracks are appended in SPEC order. Never saves.
-- Returns a read-back of every track it touched and the track order of the project.
--   node tools/reaper_job.js run reaper/bridge/jobs/make_tracks.lua
local SPEC = {
  { name = "Horn SI2",    port = "LGHorn",    fx = { "VST3i: UVIWorkstation (UVI)" } },
  { name = "Trumpet SI2", port = "LGTrumpet", fx = { "VST3i: UVIWorkstation (UVI)" } },
  { name = "Percussion",  port = "LGPerc",    fx = nil },   -- one Spitfire instance PER INSTRUMENT, on its own track, when chosen (bank/perc_selection.json)
  { name = "Cello XS",    port = "LGCello",   fx = { "VST3i: Kontakt 8 (Native Instruments) (64 out)", "VST3i: Kontakt 8 (Native Instruments)" } },
  { name = "Bass XS",     port = "LGBass",    fx = { "VST3i: Kontakt 8 (Native Instruments) (64 out)", "VST3i: Kontakt 8 (Native Instruments)" } },
  -- the second UVI instances (the flute's `Fluteb` pattern): SI2 has more presets than one instance's 16 parts, before the
  -- Ordinario curve copies. Each sits right after its sibling (RUNNING_LOG §21–§23).
  { name = "Bassoon SI2 b", port = "LGBassoonb", fx = { "VST3i: UVIWorkstation (UVI)" }, after = "Bassoon SI2" },
  { name = "Horn SI2 b",    port = "LGHornb",    fx = { "VST3i: UVIWorkstation (UVI)" }, after = "Horn SI2" },
  { name = "Trumpet SI2 b", port = "LGTrumpetb", fx = { "VST3i: UVIWorkstation (UVI)" }, after = "Trumpet SI2" },
}
local function devIndex(port)
  for d = 0, reaper.GetNumMIDIInputs() - 1 do
    local ok, n = reaper.GetMIDIInputName(d, '')
    if ok and n == port then return d end
  end
  return nil
end
local function findTrack(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, n = reaper.GetTrackName(tr)
    if n == name then return tr, i end
  end
  return nil
end
local log = {}
local at = reaper.CountTracks(0)   -- append after the last track, in SPEC order
for _, s in ipairs(SPEC) do
  local tr = findTrack(s.name)
  local made = false
  if not tr then
    local pos = at
    if s.after then local _, ai = findTrack(s.after); if ai then pos = ai + 1 end end
    reaper.InsertTrackAtIndex(pos, true)
    tr = reaper.GetTrack(0, pos)
    reaper.GetSetMediaTrackInfo_String(tr, 'P_NAME', s.name, true)
    if pos >= at then at = pos + 1 else at = at + 1 end
    made = true
  end
  local entry = { name = s.name, made = made, port = s.port }
  local dev = devIndex(s.port)
  entry.dev = dev
  if dev then
    reaper.SetMediaTrackInfo_Value(tr, 'I_RECINPUT', 4096 + dev * 32 + 0)   -- MIDI · this device · all channels
  else
    entry.error = 'port not found among Reaper MIDI inputs'
  end
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECMON', 1)
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECARM', 1)
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECMODE', 0)
  reaper.SetMediaTrackInfo_Value(tr, 'D_VOL', 1.0)
  if s.fx then
    local have = -1
    for _, fxname in ipairs(s.fx) do
      have = reaper.TrackFX_GetByName(tr, fxname, false)
      if have >= 0 then break end
    end
    if have < 0 then
      for _, fxname in ipairs(s.fx) do
        have = reaper.TrackFX_AddByName(tr, fxname, false, -1)
        if have >= 0 then entry.fxAdded = fxname; break end
      end
    end
    entry.fxIndex = have
  end
  -- read-back
  local inp = reaper.GetMediaTrackInfo_Value(tr, 'I_RECINPUT')
  local d = (inp >= 4096) and math.floor((inp - 4096) / 32) or -1
  local _, dn = reaper.GetMIDIInputName(d, '')
  local fx = {}
  for f = 0, reaper.TrackFX_GetCount(tr) - 1 do
    local _, fn = reaper.TrackFX_GetFXName(tr, f, '')
    fx[#fx + 1] = fn
  end
  entry.readback = {
    input = inp, devName = dn, channel = (inp >= 4096) and ((inp - 4096) % 32) or -1,
    monitor = reaper.GetMediaTrackInfo_Value(tr, 'I_RECMON'),
    armed = reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM'),
    faderDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(tr, 'D_VOL'), 10),
    fx = fx,
  }
  log[#log + 1] = entry
end
reaper.TrackList_AdjustWindows(false)
reaper.UpdateArrange()
local order = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
  order[#order + 1] = (i + 1) .. ' ' .. n
end
return { tracks = log, order = order }
