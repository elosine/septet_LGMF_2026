-- ref_track.lua — PLAN 1b.1 (2026-09-19): the REF track, the one thing in the rack whose level is KNOWN.
--
-- WHAT IT MAKES: a track named "REF" at the END of the rack, unity fader, centre pan, feeding the master,
-- holding the two generated calibration files (tools/make_reference_audio.js):
--     600 s  probes/reference/pink-20dBFS.wav     30 s, −20.00 dBFS RMS — the K-20 monitor reference
--     635 s  probes/reference/tone1k-20dBFS.wav   30 s, −20.00 dBFS RMS — the meter's proof
--
-- WHY 600 SECONDS AND NOT ZERO. His own recording of the balance score sits at 0–94 s on every track of
-- this rack (RUNNING_LOG §75 read it back), and rolling the transport from 0 would play those MIDI items
-- into the samplers — the reference would be recorded with the septet on top of it. Ten minutes in, the
-- timeline is empty. Nothing of his is moved or deleted to make room.
--
-- IDEMPOTENT AND NARROW. It deletes items ONLY on a track named exactly "REF" — items this job created
-- (principle 5: only delete what you made in the same breath) — and re-adds them. It never touches another
-- track, and it NEVER saves: his CTRL+S is his.
--
-- Parse-check first, then run (§28's rule for everything sent to the bridge):
--   node tools/reaper_job.js -e "loadfile('reaper/bridge/jobs/ref_track.lua')"
--   node tools/reaper_job.js run reaper/bridge/jobs/ref_track.lua
local NAME = 'REF'
local ROOT = 'C:/Users/jwloy/GitHub/septet_LGMF_2026/'
local ITEMS = {
  { at = 600.0, file = ROOT .. 'probes/reference/pink-20dBFS.wav',   what = 'pink noise −20.00 dBFS RMS — the K-20 monitor reference' },
  { at = 635.0, file = ROOT .. 'probes/reference/tone1k-20dBFS.wav', what = '1 kHz −20.00 dBFS RMS — the meter\'s proof' },
}

local function findTrack(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, n = reaper.GetTrackName(tr)
    if n == name then return tr, i end
  end
end

local out = { made = false, items = {}, missing = {} }

for _, I in ipairs(ITEMS) do
  local f = io.open(I.file, 'rb')
  if f then f:close() else out.missing[#out.missing + 1] = I.file end
end
if #out.missing > 0 then
  out.ok = false
  out.error = 'the reference files are not on disk — run: node tools/make_reference_audio.js'
  return out
end

local tr = findTrack(NAME)
if not tr then
  local n = reaper.CountTracks(0)
  reaper.InsertTrackAtIndex(n, true)
  tr = reaper.GetTrack(0, n)
  reaper.GetSetMediaTrackInfo_String(tr, 'P_NAME', NAME, true)
  out.made = true
end

-- unity, centre, audible, feeding the master, and never a recorder
reaper.SetMediaTrackInfo_Value(tr, 'D_VOL', 1.0)
reaper.SetMediaTrackInfo_Value(tr, 'D_PAN', 0.0)
reaper.SetMediaTrackInfo_Value(tr, 'B_MUTE', 0)
reaper.SetMediaTrackInfo_Value(tr, 'B_MAINSEND', 1)
reaper.SetMediaTrackInfo_Value(tr, 'I_RECARM', 0)
reaper.SetMediaTrackInfo_Value(tr, 'I_RECMODE', 2)      -- "do not record": REF is a source, never a destination

-- ours to remove: every item on REF
for i = reaper.CountTrackMediaItems(tr) - 1, 0, -1 do
  reaper.DeleteTrackMediaItem(tr, reaper.GetTrackMediaItem(tr, i))
end

for _, I in ipairs(ITEMS) do
  local src = reaper.PCM_Source_CreateFromFile(I.file)
  if not src then
    out.ok = false; out.error = 'Reaper could not open ' .. I.file
    return out
  end
  local it = reaper.AddMediaItemToTrack(tr)
  local tk = reaper.AddTakeToMediaItem(it)
  reaper.SetMediaItemTake_Source(tk, src)
  reaper.SetMediaItemInfo_Value(it, 'D_POSITION', I.at)
  reaper.SetMediaItemInfo_Value(it, 'D_LENGTH', reaper.GetMediaSourceLength(src))
  reaper.SetMediaItemInfo_Value(it, 'D_VOL', 1.0)
  reaper.SetMediaItemInfo_Value(it, 'D_FADEINLEN', 0.0)
  reaper.SetMediaItemInfo_Value(it, 'D_FADEOUTLEN', 0.0)   -- a fade would change the very level being proven
  reaper.GetSetMediaItemTakeInfo_String(tk, 'P_NAME', I.what, true)
end
reaper.UpdateArrange()

-- read back what is actually there
local _, nm = reaper.GetTrackName(tr)
for i = 0, reaper.CountTrackMediaItems(tr) - 1 do
  local it = reaper.GetTrackMediaItem(tr, i)
  local tk = reaper.GetActiveTake(it)
  local src = tk and reaper.GetMediaItemTake_Source(tk)
  local fn = ''
  if src then fn = reaper.GetMediaSourceFileName(src, '') or '' end   -- Lua returns the name itself, not (ok, name)
  out.items[#out.items + 1] = {
    pos = reaper.GetMediaItemInfo_Value(it, 'D_POSITION'),
    len = math.floor(reaper.GetMediaItemInfo_Value(it, 'D_LENGTH') * 1000) / 1000,
    vol = reaper.GetMediaItemInfo_Value(it, 'D_VOL'),
    fadeIn = reaper.GetMediaItemInfo_Value(it, 'D_FADEINLEN'),
    fadeOut = reaper.GetMediaItemInfo_Value(it, 'D_FADEOUTLEN'),
    file = fn,
  }
end
out.track = nm
out.index = (select(2, findTrack(NAME)) or -1) + 1
out.faderDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(tr, 'D_VOL'), 10)
out.pan = reaper.GetMediaTrackInfo_Value(tr, 'D_PAN')
out.mute = reaper.GetMediaTrackInfo_Value(tr, 'B_MUTE')
out.mainSend = reaper.GetMediaTrackInfo_Value(tr, 'B_MAINSEND')
out.ok = (#out.items == #ITEMS) and (math.abs(out.faderDb) < 0.01) and (out.mainSend == 1) and (out.mute == 0)
out.note = 'NOT SAVED — his CTRL+S. The reference plays at 600 s and 635 s; nothing of his was moved.'
return out
