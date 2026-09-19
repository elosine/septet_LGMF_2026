-- bass_octave_fx.lua — PLAN 1a.0 (2026-09-19): the double bass's octave, fixed on the REAPER side.
--
-- WHY. The Xsample double bass is keyed an OCTAVE ABOVE its sounding pitch: probed 2026-09-19,
-- key 34 (sounding B♭1) silent, key 46 audible at −19.9 dB, and the library's 40–81 is exactly
-- the bass's sounding E1–A4 written up an octave. The composer score and the IR are always
-- SOUNDING pitch (ensemble.json _transposeConvention, #5's D9) and the app sends `sonifyNote`
-- raw to the port — so without this the bass is silent on every note of the piece.
--
-- The fix is decision 0's pattern (the horn's ReaPitch path, RUNNING_LOG §66): Reaper-side, no
-- app change. A stock `midi_transpose` at the HEAD of the Bass XS chain, +12 semitones, so the
-- sampler receives what it is keyed for while everything upstream stays sounding.
--
-- Idempotent: if the transpose is already at slot 0 with +12 it is left alone.
--   node tools/reaper_job.js run reaper/bridge/jobs/bass_octave_fx.lua
local TRACK, FX, SEMIS = 'Bass XS', 'midi_transpose', 12

local function find(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, nm = reaper.GetTrackName(tr)
    if nm == name then return tr, i + 1 end
  end
end

local tr, idx = find(TRACK)
if not tr then return { ok = false, err = TRACK .. ' not found' } end

-- is it already there?
local at = nil
for i = 0, reaper.TrackFX_GetCount(tr) - 1 do
  local _, nm = reaper.TrackFX_GetFXName(tr, i, '')
  if nm:lower():find('transpose') then at = i break end
end

local added = false
if not at then
  at = reaper.TrackFX_AddByName(tr, FX, false, 1)
  if at < 0 then return { ok = false, err = 'could not add ' .. FX } end
  added = true
end
if at ~= 0 then reaper.TrackFX_CopyToTrack(tr, at, tr, 0, true); at = 0 end
reaper.TrackFX_SetParam(tr, at, 0, SEMIS)            -- slider1 = Transpose Semitones
reaper.TrackFX_SetEnabled(tr, at, true)

-- read back
local chain = {}
for i = 0, reaper.TrackFX_GetCount(tr) - 1 do
  local _, nm = reaper.TrackFX_GetFXName(tr, i, '')
  chain[#chain + 1] = nm
end
local _, shown = reaper.TrackFX_GetFormattedParamValue(tr, 0, 0, '')
return { ok = true, track = TRACK, trackIndex = idx, added = added,
         slot = at, semitones = reaper.TrackFX_GetParam(tr, 0, 0), shown = shown, chain = chain }
