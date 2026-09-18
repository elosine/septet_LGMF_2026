-- clip_watch.lua — watch EVERY track's live meter for a while and report the maxima (PLAN 0d.2, the
-- clipping pre-flight). His ask, 2026-09-18: "the only issue is with clipping, I believe the last time
-- we had to rerun the probe several times because of clipping, whats the best way to amileroate this?"
--
-- WHY EVERY TRACK and not just REC. Two different faults look the same in a recording and only the
-- per-track peaks tell them apart:
--   · REC near 0 dB          → not enough fader margin; lower REC's trim (make_rec_track.lua REC_TRIM_DB)
--   · a SOURCE track at 0.0 while REC sits low → THAT PLUGIN is clipping internally, and no Reaper fader
--     can fix it. It is fixed inside the instrument (#5's flute, at the UVI master, −2 dB).
-- Track_GetPeakInfo is POST-fader on the track it is asked about, which is exactly what both tests want.
--
-- Started by probes/clip_preflight.ps1, which then plays the pre-flight schedule INSIDE the window — the
-- watch and the notes must be launched from one process, because a tool round trip cannot be timed
-- against a defer loop (RUNNING_LOG §50: two runs read −144 dB everywhere for that reason alone).
--
-- Duration: probes/clip_watch_s.txt if it exists (one number, seconds), else DEFAULT_S.
-- Result:   probes/clip_watch.json — in the REPO, not the bridge's own outbox, which lives under AppData.
--   node tools/reaper_job.js run reaper/bridge/jobs/clip_watch.lua
local REPO = 'C:/Users/jwloy/GitHub/septet_LGMF_2026/'
local DEFAULT_S = 150.0
local CLIP_DB = -0.10        -- at or above this a track counts as clipped
local NEAR_DB = -3.00        -- at or above this it is close enough to warn about

local watch_s = DEFAULT_S
local cf = io.open(REPO .. 'probes/clip_watch_s.txt', 'rb')
if cf then
  local v = tonumber((cf:read('*a') or ''):match('[%d%.]+') or '')
  cf:close()
  if v and v > 0 then watch_s = v end
end

local tracks = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i)
  local _, nm = reaper.GetTrackName(tr)
  tracks[#tracks + 1] = { name = nm, tr = tr, max = { 0, 0 } }
end
tracks[#tracks + 1] = { name = 'MASTER', tr = reaper.GetMasterTrack(0), max = { 0, 0 } }

local t0 = reaper.time_precise()
local ticks = 0

local function db(x) if x <= 1e-9 then return -144.0 end return 20 * math.log(x, 10) end
local function q(s) return '"' .. tostring(s):gsub('[%c"\\]', ' ') .. '"' end

local function finish()
  local rows, clipped, near = {}, {}, {}
  for _, t in ipairs(tracks) do
    local l, r = db(t.max[1]), db(t.max[2])
    local peak = math.max(l, r)
    local verdict = peak >= CLIP_DB and 'CLIPPED' or peak >= NEAR_DB and 'near' or peak <= -143 and 'silent' or 'ok'
    if verdict == 'CLIPPED' then clipped[#clipped + 1] = t.name elseif verdict == 'near' then near[#near + 1] = t.name end
    rows[#rows + 1] = string.format('  {"track":%s,"peakL_dB":%.2f,"peakR_dB":%.2f,"peak_dB":%.2f,"verdict":%s}',
      q(t.name), l, r, peak, q(verdict))
  end
  local names = function(t) local o = {} for _, n in ipairs(t) do o[#o + 1] = q(n) end return table.concat(o, ', ') end
  local body = string.format(
    '{\n "watchS": %.1f,\n "ticks": %d,\n "tracks": %d,\n "clipDb": %.2f,\n "nearDb": %.2f,\n "clipped": [%s],\n "near": [%s],\n "peaks": [\n%s\n ]\n}\n',
    watch_s, ticks, #tracks, CLIP_DB, NEAR_DB, names(clipped), names(near), table.concat(rows, ',\n'))
  local f = assert(io.open(REPO .. 'probes/clip_watch.json', 'wb'))
  f:write(body); f:close()
end

local function tick()
  ticks = ticks + 1
  for _, t in ipairs(tracks) do
    for ch = 0, 1 do
      local v = reaper.Track_GetPeakInfo(t.tr, ch)
      if v > t.max[ch + 1] then t.max[ch + 1] = v end
    end
  end
  if reaper.time_precise() - t0 < watch_s then reaper.defer(tick) else finish() end
end
reaper.defer(tick)

return { started = true, watching = #tracks, watchS = watch_s, clipDb = CLIP_DB, nearDb = NEAR_DB,
         out = 'probes/clip_watch.json' }
