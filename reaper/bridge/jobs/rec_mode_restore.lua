-- rec_mode_restore.lua — put every track's I_RECMODE back to what rec_mode_solo.lua saved
-- (PLAN 0d.3, 2026-09-18), self-reporting. Matches by track NAME, so a track added since is left alone
-- and is reported. Never saves.
--   node tools/reaper_job.js run reaper/bridge/jobs/rec_mode_restore.lua
local REPO = 'C:/Users/jwloy/GitHub/septet_LGMF_2026/'

local f = io.open(REPO .. 'probes/rec_modes_before.json', 'rb')
if not f then return { error = 'no probes/rec_modes_before.json — nothing to restore from' } end
local body = f:read('*a'); f:close()

-- the file is this job pair's own, one flat object per line: parse the three fields we need by pattern
-- rather than pulling in a JSON reader (the bridge has none)
local want = {}
for line in body:gmatch('[^\n]+') do
  local nm, before = line:match('"track":"([^"]*)".-"recmodeBefore":(-?%d+)')
  if nm then want[nm] = tonumber(before) end
end

local restored, unchanged, notInFile = {}, 0, {}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i)
  local _, nm = reaper.GetTrackName(tr)
  local w = want[nm]
  if w == nil then notInFile[#notInFile + 1] = nm
  else
    local now = math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECMODE'))
    if now ~= w then
      reaper.SetMediaTrackInfo_Value(tr, 'I_RECMODE', w)
      restored[#restored + 1] = nm .. ': ' .. now .. ' -> ' .. math.floor(reaper.GetMediaTrackInfo_Value(tr, 'I_RECMODE'))
    else unchanged = unchanged + 1 end
  end
end

return { ok = true, restored = restored, restoredCount = #restored, alreadyCorrect = unchanged,
         notInSavedFile = notInFile, note = 'not saved — his CTRL+S' }
