-- sustain_watch.lua — PLAN 1a.2 (2026-09-19): how long a held sample actually sustains.
-- Samples one named track's peak meter every tick for WATCH_S seconds and writes the whole
-- series (10 Hz, both channels maxed) to the outbox, so a decay can be read, not just a maximum
-- (peakwatch.lua records only the max). Fire the note from outside right after launching it.
--   node tools/reaper_job.js run reaper/bridge/jobs/sustain_watch.lua
local NAME, WATCH_S, STEP_S = 'Vibraphone XS', 30.0, 0.1

local tr
for i = 0, reaper.CountTracks(0) - 1 do
  local t = reaper.GetTrack(0, i)
  local _, nm = reaper.GetTrackName(t)
  if nm == NAME then tr = t end
end
if not tr then return { ok = false, err = NAME .. ' not found' } end

local sep = package.config:sub(1, 1)
local outpath = job.root .. sep .. 'outbox' .. sep .. 'sustain.json'
os.remove(outpath)

local t0 = reaper.time_precise()
local nextAt, series, cur = 0, {}, 0
local function dB(v) if v > 0 then return math.floor(20 * math.log(v, 10) * 10 + 0.5) / 10 end return -150 end
local function loop()
  local el = reaper.time_precise() - t0
  local v = math.max(reaper.Track_GetPeakInfo(tr, 0), reaper.Track_GetPeakInfo(tr, 1))
  if v > cur then cur = v end
  if el >= nextAt then
    series[#series + 1] = string.format('[%.1f,%s]', nextAt, dB(cur))
    nextAt = nextAt + STEP_S
    cur = 0
  end
  if el < WATCH_S then reaper.defer(loop); return end
  local f = io.open(outpath, 'wb')
  if f then
    f:write('{\n "track": "' .. NAME .. '",\n "stepS": ' .. STEP_S .. ',\n "series": [\n  '
            .. table.concat(series, ',\n  ') .. '\n ]\n}\n')
    f:close()
  end
end
reaper.defer(loop)
return { ok = true, track = NAME, seconds = WATCH_S, stepS = STEP_S, file = outpath }
