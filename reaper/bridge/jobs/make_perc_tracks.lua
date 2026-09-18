-- make_perc_tracks.lua — the percussion instrument tracks of the LGMF rack (PLAN 0c/0e, 2026-09-18), idempotent.
-- D7: one Spitfire instance per instrument = one track per SPEC row, all on the one port, each filtering on ITS channel.
-- A NEW row's track is a DUPLICATE of the composer's track "Template" (his word, 2026-09-18: "please use the track called
-- Template to duplicate") — Reaper's own Track: Duplicate (fresh GUIDs, his plugin state, fader, monitoring, arm all
-- carried), then renamed, put on the row's channel and moved to the end of the percussion block. With no Template in the
-- rack a new row gets an EMPTY Abbey Road Orchestra instance instead (the first five were made that way, §37).
-- The composer loads / selects the instrument in the plugin's own browser — the only loader (§36).
-- A track that already exists is READ BACK ONLY — never re-configured (he is working in the rack). Never saves.
-- Add a row and re-run to add an instrument.
--   BRIDGE_TIMEOUT_MS=120000 node tools/reaper_job.js run reaper/bridge/jobs/make_perc_tracks.lua
local PORT, AFTER, TEMPLATE = "LGPerc", "Percussion", "Template"
local FX = "VST3i: Abbey Road Orchestra (Spitfire Audio)"
local SPEC = {   -- slug = the key in bank/aro_percussion_catalog.json ('?' = which of several is settled by what he loads)
  { name = "Finger Cymbals ARO",    channel = 1,  slug = "small_metals_finger_cymbals" },
  { name = "Bell Tree ARO",         channel = 2,  slug = "small_metals_bell_tree" },
  { name = "Sleigh Bells ARO",      channel = 3,  slug = "small_metals_sleigh_bells" },
  { name = "Triangles ARO",         channel = 4,  slug = "small_metals_triangles" },
  { name = "Tambourines ARO",       channel = 5,  slug = "small_metals_tambourines" },
  { name = "Castanets ARO",         channel = 6,  slug = "toys_castanets" },
  { name = "Claves ARO",            channel = 7,  slug = "toys_claves" },
  { name = "Shakers ARO",           channel = 8,  slug = "toys_shakers" },
  { name = "Brake Drums ARO",       channel = 9,  slug = "brake_drums" },
  { name = "Crashers and Stack ARO", channel = 10, slug = "crashes_and_stack" },   -- the library's spelling (and his); the catalog's slug is piece #2's
  { name = "Wood Blocks ARO",       channel = 11, slug = "wood_blocks" },
  { name = "Bass Drum ARO",         channel = 12, slug = "bass_drum ?" },
  { name = "Temple Bowls ARO",      channel = 13, slug = "temple_bowls" },
  { name = "Tam Tams ARO",          channel = 14, slug = "tam_tams ?" },
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
local function indexOf(tr) return math.floor(reaper.GetMediaTrackInfo_Value(tr, 'IP_TRACKNUMBER')) - 1 end
local inSpec = {}
for _, s in ipairs(SPEC) do inSpec[s.name] = true end
local function blockEnd()   -- the index just after the last percussion track (Percussion · Template · any SPEC track)
  local last = -1
  for i = 0, reaper.CountTracks(0) - 1 do
    local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
    if n == AFTER or n == TEMPLATE or inSpec[n] then last = i end
  end
  return last + 1
end
local dev = devIndex(PORT)
if not dev then return { error = PORT .. ' not found among Reaper MIDI inputs' } end
if not findTrack(AFTER) then return { error = 'no track named ' .. AFTER } end
local tpl = findTrack(TEMPLATE)

-- his selection, restored at the end (the duplicate action works on the selection)
local sel = {}
for i = 0, reaper.CountSelectedTracks(0) - 1 do sel[#sel + 1] = reaper.GetSelectedTrack(0, i) end

reaper.Undo_BeginBlock()
reaper.PreventUIRefresh(1)
local log = {}
for _, s in ipairs(SPEC) do
  local tr = findTrack(s.name)
  local made, how = false, nil
  if not tr then
    if tpl then
      local n0 = reaper.CountTracks(0)
      reaper.SetOnlyTrackSelected(tpl)
      reaper.Main_OnCommand(40062, 0)   -- Track: Duplicate tracks — the copy lands right after the Template
      if reaper.CountTracks(0) == n0 + 1 then
        tr = reaper.GetTrack(0, indexOf(tpl) + 1)
        reaper.GetSetMediaTrackInfo_String(tr, 'P_NAME', '__dup__', true)   -- a name outside the block while it is moved
        reaper.SetOnlyTrackSelected(tr)
        reaper.ReorderSelectedTracks(blockEnd(), 0)
        reaper.GetSetMediaTrackInfo_String(tr, 'P_NAME', s.name, true)
        how = 'duplicate of ' .. TEMPLATE
      end
    else
      local at = blockEnd()
      reaper.InsertTrackAtIndex(at, true)
      tr = reaper.GetTrack(0, at)
      reaper.GetSetMediaTrackInfo_String(tr, 'P_NAME', s.name, true)
      reaper.SetMediaTrackInfo_Value(tr, 'I_RECMON', 1)
      reaper.SetMediaTrackInfo_Value(tr, 'I_RECARM', 1)
      reaper.SetMediaTrackInfo_Value(tr, 'I_RECMODE', 0)
      reaper.SetMediaTrackInfo_Value(tr, 'D_VOL', 1.0)
      reaper.TrackFX_AddByName(tr, FX, false, -1)
      how = 'empty instance'
    end
    if tr then
      reaper.SetMediaTrackInfo_Value(tr, 'I_RECINPUT', 4096 + dev * 32 + s.channel)   -- MIDI · this device · this channel
      made = true
    end
  end
  if not tr then
    log[#log + 1] = { name = s.name, error = 'the duplicate did not appear' }
  else
    local inp = reaper.GetMediaTrackInfo_Value(tr, 'I_RECINPUT')
    local d = (inp >= 4096) and math.floor((inp - 4096) / 32) or -1
    local _, dn = reaper.GetMIDIInputName(d, '')
    local fx = {}
    for f = 0, reaper.TrackFX_GetCount(tr) - 1 do
      local _, fn = reaper.TrackFX_GetFXName(tr, f, '')
      fx[#fx + 1] = fn
    end
    local ch = (inp >= 4096) and math.floor((inp - 4096) % 32) or -1
    log[#log + 1] = { name = s.name, slug = s.slug, made = made, how = how, index = indexOf(tr) + 1,
      channelOk = (ch == s.channel and dn == PORT),
      readback = { input = inp, devName = dn, channel = ch,
        monitor = reaper.GetMediaTrackInfo_Value(tr, 'I_RECMON'), armed = reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM'),
        faderDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(tr, 'D_VOL'), 10), fx = fx } }
  end
end
-- his selection back
reaper.Main_OnCommand(40297, 0)   -- Track: Unselect all tracks
for _, t in ipairs(sel) do if reaper.ValidatePtr(t, 'MediaTrack*') then reaper.SetTrackSelected(t, true) end end
reaper.PreventUIRefresh(-1)
reaper.Undo_EndBlock('LGMF: percussion tracks from the Template', -1)
reaper.TrackList_AdjustWindows(false)
reaper.UpdateArrange()
local order = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
  order[#order + 1] = (i + 1) .. ' ' .. n
end
return { template = tpl and TEMPLATE or 'none — empty instances', tracks = log, order = order }
