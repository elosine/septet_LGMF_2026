-- make_rec_track.lua — the REC track of the LGMF rack (PLAN 0d.1, 2026-09-18), idempotent, self-reporting.
--
-- The balance probe (0d) measures LOUDNESS, not peak (RUNNING_LOG §44): a finger cymbal peaks high and is
-- quiet, so a peak match would bury it — which is the washing-out the composer named. Loudness has to be
-- measured from a RECORDING, so the rack needs one track that captures the whole ensemble to disk.
--
-- WHAT IT MAKES: one track named "REC" at the END of the rack —
--   · a RECEIVE from every track that feeds the master (post-fader, unity), so it captures the same sum he hears
--   · its own master send OFF, so nothing is heard twice
--   · record mode "output (stereo, latency compensated)" and RECORD-ARMED
-- #5 used a folder parent for this (its §115). A receive bus is used here instead because a folder would
-- REPARENT his 26 tracks; receives add nothing to his structure and can be removed without a trace.
--
-- IDEMPOTENT: re-running rebuilds REC's receive list from the rack as it stands (a track he has added since
-- is picked up). It touches nothing but the REC track, and it NEVER saves — his CTRL+S is his.
-- ⚠ It rebuilds the receives of a track named exactly "REC"; if he ever makes his own REC track for something
-- else, rename it first.
--
-- Run it (and parse-check it first — §28's rule for everything sent to the bridge):
--   node tools/reaper_job.js -e "loadfile('reaper/bridge/jobs/make_rec_track.lua')"
--   node tools/reaper_job.js run reaper/bridge/jobs/make_rec_track.lua
local NAME = "REC"
local RECMODE_OUTPUT_STEREO_LATCOMP = 3

local function findTrack(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, n = reaper.GetTrackName(tr)
    if n == name then return tr, i end
  end
  return nil
end

-- every track whose audio reaches the master directly: a top-level track, or a child that still has its own
-- master send on. A folder PARENT is included and its children are not (the parent already sums them), so the
-- sum is captured exactly once. Today the rack is flat — all 26 top-level, every master send on — but this
-- keeps the job correct if he groups anything later.
local function feedsMaster(tr)
  if reaper.GetMediaTrackInfo_Value(tr, 'B_MAINSEND') < 0.5 then return false end
  local parent = reaper.GetParentTrack(tr)
  if parent == nil then return true end
  return reaper.GetMediaTrackInfo_Value(parent, 'B_MAINSEND') < 0.5
end

local rec, recIdx = findTrack(NAME)
local created = false
if not rec then
  local n = reaper.CountTracks(0)
  reaper.InsertTrackAtIndex(n, true)
  rec = reaper.GetTrack(0, n)
  reaper.GetSetMediaTrackInfo_String(rec, 'P_NAME', NAME, true)
  recIdx = n
  created = true
end

-- clear REC's own receives, then rebuild from the rack as it stands
local removed = 0
for i = reaper.GetTrackNumSends(rec, -1) - 1, 0, -1 do
  reaper.RemoveTrackSend(rec, -1, i)
  removed = removed + 1
end

local sources, skipped = {}, {}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i)
  local _, n = reaper.GetTrackName(tr)
  if tr ~= rec then
    if feedsMaster(tr) then
      reaper.CreateTrackSend(tr, rec)
      sources[#sources + 1] = n
    else
      skipped[#skipped + 1] = n
    end
  end
end

reaper.SetMediaTrackInfo_Value(rec, 'B_MAINSEND', 0)                              -- no doubling: he hears the 26, not REC
reaper.SetMediaTrackInfo_Value(rec, 'I_RECMODE', RECMODE_OUTPUT_STEREO_LATCOMP)
reaper.SetMediaTrackInfo_Value(rec, 'I_RECARM', 1)
reaper.SetMediaTrackInfo_Value(rec, 'D_VOL', 1)                                    -- unity: the recording is the sum, untrimmed
reaper.SetMediaTrackInfo_Value(rec, 'B_MUTE', 0)

-- read it all back — nothing is claimed that the rack did not confirm (§28: never trust a silent job)
local back = {
  name = (select(2, reaper.GetTrackName(rec))),
  index = math.floor(reaper.GetMediaTrackInfo_Value(rec, 'IP_TRACKNUMBER')),
  receives = reaper.GetTrackNumSends(rec, -1),
  recmode = reaper.GetMediaTrackInfo_Value(rec, 'I_RECMODE'),
  recarm = reaper.GetMediaTrackInfo_Value(rec, 'I_RECARM'),
  mainsend = reaper.GetMediaTrackInfo_Value(rec, 'B_MAINSEND'),
  volDb = 20 * math.log(math.max(reaper.GetMediaTrackInfo_Value(rec, 'D_VOL'), 1e-9), 10),
  muted = reaper.GetMediaTrackInfo_Value(rec, 'B_MUTE'),
}

return {
  ok = back.receives == #sources and back.recarm == 1 and back.recmode == RECMODE_OUTPUT_STEREO_LATCOMP and back.mainsend == 0,
  created = created, receivesRemovedFirst = removed,
  trackCount = reaper.CountTracks(0), sourcesWired = #sources, sources = sources,
  skippedAsChildren = skipped, readBack = back,
  note = 'not saved — his CTRL+S. Recording is started and stopped with the transport when the probe runs.',
}
