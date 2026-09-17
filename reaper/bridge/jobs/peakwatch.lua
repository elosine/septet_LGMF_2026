-- peakwatch.lua — watch the live meters of named tracks for a while and write the maxima (PLAN 0k).
-- A job may start its own defer loop: this one samples reaper.Track_GetPeakInfo every tick for
-- WATCH_S seconds and writes reaper/bridge/outbox/peakwatch.json when done. Fire the note from
-- outside right after launching it; read the file after WATCH_S seconds.
local WATCH_S = 3.0
local NAMES = { 'Flute SI2', 'Flute strikes', 'Bass Clarinet XS', 'BassCl strikes', 'REC' }

local tracks = {}
for _, n in ipairs(NAMES) do
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i); local _, nm = reaper.GetTrackName(tr)
    if nm == n then tracks[#tracks + 1] = { name = n, tr = tr, max = { 0, 0, 0, 0 } } end
  end
end
tracks[#tracks + 1] = { name = 'MASTER', tr = reaper.GetMasterTrack(0), max = { 0, 0, 0, 0 } }
local t0 = reaper.time_precise()
local ticks = 0
local outpath = job.root .. package.config:sub(1, 1) .. 'outbox' .. package.config:sub(1, 1) .. 'peakwatch.json'
os.remove(outpath)

local function dB(v) if v > 0 then return math.floor(20 * math.log(v, 10) * 10 + 0.5) / 10 end return -150 end
local function loop()
  ticks = ticks + 1
  for _, t in ipairs(tracks) do
    for c = 1, 4 do local v = reaper.Track_GetPeakInfo(t.tr, c - 1); if v > t.max[c] then t.max[c] = v end end
  end
  if reaper.time_precise() - t0 < WATCH_S then reaper.defer(loop); return end
  local parts = {}
  for _, t in ipairs(tracks) do
    parts[#parts + 1] = string.format('  "%s": {"ch1": %s, "ch2": %s, "ch3": %s, "ch4": %s}', t.name, dB(t.max[1]), dB(t.max[2]), dB(t.max[3]), dB(t.max[4]))
  end
  local f = io.open(outpath, 'wb')
  if f then f:write('{\n "ticks": ' .. ticks .. ',\n "seconds": ' .. WATCH_S .. ',\n "maxDb": {\n' .. table.concat(parts, ',\n') .. '\n }\n}\n'); f:close() end
end
reaper.defer(loop)
return { watching = #tracks, seconds = WATCH_S, file = outpath }
