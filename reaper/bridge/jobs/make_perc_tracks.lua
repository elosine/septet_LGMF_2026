-- make_perc_tracks.lua — the percussion instrument tracks of the LGMF rack (PLAN 0c/0e, 2026-09-18), idempotent.
-- D7: one Spitfire instance per instrument = one track per SPEC row, all on the one port, each filtering on ITS channel.
-- Each track: name · MIDI input = LGPerc, the row's channel · input monitoring ON · armed · fader 0 dB · an EMPTY
-- Abbey Road Orchestra instance (the composer loads the instrument in the plugin's own browser — the only loader, §36).
-- A track of the same name is re-configured, never duplicated; new tracks go after the last percussion track, in SPEC
-- order. Never saves. Add a row and re-run to add an instrument.
--   node tools/reaper_job.js run reaper/bridge/jobs/make_perc_tracks.lua
local PORT, AFTER = "LGPerc", "Percussion"
local FX = "VST3i: Abbey Road Orchestra (Spitfire Audio)"
local SPEC = {   -- slug = the key in bank/aro_percussion_catalog.json
  { name = "Finger Cymbals ARO", channel = 1, slug = "small_metals_finger_cymbals" },
  { name = "Bell Tree ARO",      channel = 2, slug = "small_metals_bell_tree" },
  { name = "Sleigh Bells ARO",   channel = 3, slug = "small_metals_sleigh_bells" },
  { name = "Triangles ARO",      channel = 4, slug = "small_metals_triangles" },
  { name = "Tambourines ARO",    channel = 5, slug = "small_metals_tambourines" },
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
local dev = devIndex(PORT)
if not dev then return { error = PORT .. ' not found among Reaper MIDI inputs' } end
local _, ai = findTrack(AFTER)
if not ai then return { error = 'no track named ' .. AFTER } end
local at = ai + 1   -- the next free place after the last percussion track
for _, s in ipairs(SPEC) do local _, i = findTrack(s.name); if i and i + 1 > at then at = i + 1 end end
local log = {}
for _, s in ipairs(SPEC) do
  local tr = findTrack(s.name)
  local made = false
  if not tr then
    reaper.InsertTrackAtIndex(at, true)
    tr = reaper.GetTrack(0, at)
    reaper.GetSetMediaTrackInfo_String(tr, 'P_NAME', s.name, true)
    at = at + 1
    made = true
  end
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECINPUT', 4096 + dev * 32 + s.channel)   -- MIDI · this device · this channel
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECMON', 1)
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECARM', 1)
  reaper.SetMediaTrackInfo_Value(tr, 'I_RECMODE', 0)
  reaper.SetMediaTrackInfo_Value(tr, 'D_VOL', 1.0)
  local have = reaper.TrackFX_GetByName(tr, FX, false)
  local added = false
  if have < 0 then have = reaper.TrackFX_AddByName(tr, FX, false, -1); added = have >= 0 end
  -- read-back
  local inp = reaper.GetMediaTrackInfo_Value(tr, 'I_RECINPUT')
  local d = (inp >= 4096) and math.floor((inp - 4096) / 32) or -1
  local _, dn = reaper.GetMIDIInputName(d, '')
  local fx = {}
  for f = 0, reaper.TrackFX_GetCount(tr) - 1 do
    local _, fn = reaper.TrackFX_GetFXName(tr, f, '')
    fx[#fx + 1] = fn
  end
  log[#log + 1] = { name = s.name, slug = s.slug, made = made, fxAdded = added, fxIndex = have,
    readback = { input = inp, devName = dn, channel = (inp >= 4096) and ((inp - 4096) % 32) or -1,
      monitor = reaper.GetMediaTrackInfo_Value(tr, 'I_RECMON'), armed = reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM'),
      faderDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(tr, 'D_VOL'), 10), fx = fx } }
end
reaper.TrackList_AdjustWindows(false)
reaper.UpdateArrange()
local order = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
  order[#order + 1] = (i + 1) .. ' ' .. n
end
return { tracks = log, order = order }
