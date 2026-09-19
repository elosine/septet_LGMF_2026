-- horn_high_path.lua — PLAN 1a.1 (2026-09-19): "Horn SI2 high", the path that makes the horn audible above F4.
--
-- WHY (decision 0, RUNNING_LOG §66, his "ok that will do"). The SI2 horn library stops at sounding F4 = MIDI 65,
-- and five of the six horn notes in the reference chords lie above it (§63f) — playable by a person, silent in
-- the mock-up. The fix is Reaper-side, no app change: the notes above F4 go to a SECOND track that plays them an
-- octave down in the library and shifts the audio back up.
--
--   the high track:  MIDI note filter (66..127)  →  MIDI transpose −12  →  UVI (state cloned)  →  ReaPitch +12 st
--   the main track:  MIDI note filter (0..65)    →  UVI                     (so nothing doubles)
--
-- BOTH UVI INSTANCES GET THE PATH (2026-09-19). The plan named only "Horn SI2"/`LGHorn`, written before the
-- routing was read: an ordinary DRAWN note is a curve event (composer.html isCurveEvent) and routes to the
-- instrument's curve bank, which for the horn is `LGHornb` channels 3–5 on the "Horn SI2 b" instance
-- (UVI_PARTS, sandbox/instruments.js). The reference score's horn notes therefore arrive on the b instance,
-- and a high path on `LGHorn` alone would never fire. Plain and keyswitched notes still use `LGHorn` ch 1,
-- so both instances need it.
--
-- The note filter's slider 3 MUST be Yes: the pitch bend and the CC7 stream have to reach both tracks, or the
-- just intonation and the dynamics die at the filter.
--
-- Idempotent: an existing high track is re-configured, never duplicated again. Never saves — his CTRL+S.
--   node tools/reaper_job.js run reaper/bridge/jobs/horn_high_path.lua
local PAIRS = { { src = 'Horn SI2', high = 'Horn SI2 high' }, { src = 'Horn SI2 b', high = 'Horn SI2 b high' } }
local SPLIT = 65            -- sounding F4: the top of the SI2 horn library
local SHIFT_FULL = 0.75     -- ReaPitch param 3 "Shift (full range)": 0.5 = 0 st, 1.0 = +24 st, so 0.75 = +12

local function findTrack(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, n = reaper.GetTrackName(tr)
    if n == name then return tr, i end
  end
end
local function fxIndex(tr, needle)
  for i = 0, reaper.TrackFX_GetCount(tr) - 1 do
    local _, nm = reaper.TrackFX_GetFXName(tr, i, '')
    if nm:lower():find(needle, 1, true) then return i, nm end
  end
end
-- the named FX at slot `want`, added if missing, moved if misplaced
local function ensureAt(tr, addName, needle, want)
  local at = fxIndex(tr, needle)
  local added = false
  if not at then
    at = reaper.TrackFX_AddByName(tr, addName, false, 1)
    if at < 0 then return nil, 'could not add ' .. addName end
    added = true
  end
  if at ~= want then reaper.TrackFX_CopyToTrack(tr, at, tr, want, true); at = want end
  reaper.TrackFX_SetEnabled(tr, at, true)
  return at, nil, added
end
local function chainOf(tr)
  local c = {}
  for i = 0, reaper.TrackFX_GetCount(tr) - 1 do
    local _, nm = reaper.TrackFX_GetFXName(tr, i, '')
    c[#c + 1] = nm
  end
  return c
end

local report = {}
for _, P in ipairs(PAIRS) do
  local src = findTrack(P.src)
  if not src then
    report[#report + 1] = { pair = P.src, ok = false, err = 'source track not found' }
  else
    -- 1 · the high track: his own Horn instance, duplicated (fresh GUIDs, the UVI state, fader, input, arm)
    local high = findTrack(P.high)
    local made = false
    if not high then
      reaper.SetOnlyTrackSelected(src)
      reaper.Main_OnCommand(40062, 0)          -- Track: Duplicate tracks — the copy lands right after
      high = reaper.GetSelectedTrack(0, 0)
      reaper.GetSetMediaTrackInfo_String(high, 'P_NAME', P.high, true)
      made = true
    end

    -- 2 · the high chain, in order
    local f1 = ensureAt(high, 'midi_note_filter', 'note filter', 0)
    reaper.TrackFX_SetParam(high, f1, 0, SPLIT + 1)     -- Lowest Key
    reaper.TrackFX_SetParam(high, f1, 1, 127)           -- Highest Key
    reaper.TrackFX_SetParam(high, f1, 2, 1)             -- other events (CC, bend) pass through: YES
    local f2 = ensureAt(high, 'midi_transpose', 'transpose', 1)
    reaper.TrackFX_SetParam(high, f2, 0, -12)           -- Transpose Semitones
    reaper.TrackFX_SetParam(high, f2, 2, 0)             -- Lowest Key
    reaper.TrackFX_SetParam(high, f2, 3, 127)           -- Highest Key
    local last = reaper.TrackFX_GetCount(high)
    local f3 = ensureAt(high, 'ReaPitch', 'reapitch', last - (fxIndex(high, 'reapitch') and 1 or 0))
    reaper.TrackFX_SetParam(high, f3, 3, SHIFT_FULL)    -- 1: Shift (full range) = +12 semitones
    reaper.TrackFX_SetParam(high, f3, 0, 1)             -- Wet  +0.0 dB
    reaper.TrackFX_SetParam(high, f3, 1, 0)             -- Dry  -inf
    reaper.TrackFX_SetParam(high, f3, 10, 1)            -- 1: Volume +0.0 dB

    -- 3 · the mirror filter on the main track, so nothing doubles
    local g1 = ensureAt(src, 'midi_note_filter', 'note filter', 0)
    reaper.TrackFX_SetParam(src, g1, 0, 0)
    reaper.TrackFX_SetParam(src, g1, 1, SPLIT)
    reaper.TrackFX_SetParam(src, g1, 2, 1)

    local _, shift = reaper.TrackFX_GetFormattedParamValue(high, f3, 3, '')
    local _, hiLo = reaper.TrackFX_GetFormattedParamValue(high, f1, 0, '')
    local _, srcHi = reaper.TrackFX_GetFormattedParamValue(src, g1, 1, '')
    local _, pass = reaper.TrackFX_GetFormattedParamValue(high, f1, 2, '')
    report[#report + 1] = {
      pair = P.src, ok = true, duplicated = made,
      highTrack = P.high, highInput = reaper.GetMediaTrackInfo_Value(high, 'I_RECINPUT'),
      srcInput = reaper.GetMediaTrackInfo_Value(src, 'I_RECINPUT'),
      highFaderDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(high, 'D_VOL'), 10),
      srcFaderDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(src, 'D_VOL'), 10),
      highChain = chainOf(high), srcChain = chainOf(src),
      reapitchShift = shift, highPassesFrom = hiLo, mainPassesTo = srcHi, ccPassThrough = pass,
    }
  end
end
return report
