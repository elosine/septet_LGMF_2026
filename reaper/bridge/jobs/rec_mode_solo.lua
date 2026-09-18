-- rec_mode_solo.lua — make REC the only track that RECORDS, without touching arm or monitoring
-- (PLAN 0d.3, 2026-09-18), idempotent, self-reporting, reversible.
--
-- WHY. Every instrument track in this rack is armed with a MIDI input and monitoring on, which is what
-- makes it sound. Hitting record would therefore drop a MIDI item on all 27 of them beside REC's audio —
-- clutter in his project, and his to clean up afterwards. Setting I_RECMODE to 2 ("do not record") leaves
-- I_RECARM and I_RECMON exactly as they are, so the SOUND PATH IS UNCHANGED and nothing but REC writes a
-- file. That matters: a change that could silence the rack would risk a 27-minute run.
--
-- REVERSIBLE. Each track's previous recmode is written to probes/rec_modes_before.json, and
--   node tools/reaper_job.js run reaper/bridge/jobs/rec_mode_restore.lua
-- puts them back. Never saves.
--   node tools/reaper_job.js run reaper/bridge/jobs/rec_mode_solo.lua
local REPO = 'C:/Users/jwloy/GitHub/septet_LGMF_2026/'
local REC_NAME = 'REC'
local RECMODE_NONE = 2
local RECMODE_OUTPUT_STEREO_LATCOMP = 3

local function q(s) return '"' .. tostring(s):gsub('[%c"\\]', ' ') .. '"' end

local rows, changed, recFound = {}, 0, false
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i)
  local _, nm = reaper.GetTrackName(tr)
  local before = math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECMODE'))
  local want = (nm == REC_NAME) and RECMODE_OUTPUT_STEREO_LATCOMP or RECMODE_NONE
  if nm == REC_NAME then recFound = true end
  if before ~= want then reaper.SetMediaTrackInfo_Value(tr, 'I_RECMODE', want); changed = changed + 1 end
  rows[#rows + 1] = string.format('  {"index":%d,"track":%s,"recmodeBefore":%d,"recmodeNow":%d,"armed":%d,"monitor":%d}',
    i, q(nm), before, math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECMODE')),
    math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM')), math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECMON')))
end

local f = assert(io.open(REPO .. 'probes/rec_modes_before.json', 'wb'))
f:write('{\n "savedAt": ' .. q(os.date('%Y-%m-%dT%H:%M:%S')) .. ',\n "tracks": [\n' .. table.concat(rows, ',\n') .. '\n ]\n}\n')
f:close()

-- read back: how many tracks can still write a file?
local writers = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i)
  local _, nm = reaper.GetTrackName(tr)
  if math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECMODE')) ~= RECMODE_NONE
     and math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM')) == 1 then writers[#writers + 1] = nm end
end

return { ok = recFound and #writers == 1 and writers[1] == REC_NAME, changed = changed,
         recordingWriters = writers, tracks = reaper.CountTracks(0),
         saved = 'probes/rec_modes_before.json',
         note = 'arm and monitoring untouched, so the sound path is unchanged. Restore with rec_mode_restore.lua. Not saved.' }
