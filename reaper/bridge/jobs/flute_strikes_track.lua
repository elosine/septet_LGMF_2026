-- flute_strikes_track.lua — build the "Flute strikes" child track fed by UVI outputs 3/4 (PLAN 0k.4, B).
-- Idempotent: if the track exists, only the routing and gain are (re)applied. Returns a read-back.
local SRC, CHILD, GAIN_DB = 'Flute SI2', 'Flute strikes', 21

local function find(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
    if n == name then return tr, i end
  end
end
local src, si = find(SRC); assert(src, 'no track ' .. SRC)
local child = find(CHILD)
if not child then
  reaper.InsertTrackAtIndex(si + 1, true)        -- right after the flute, inside the REC folder
  child = reaper.GetTrack(0, si + 1)
  reaper.GetSetMediaTrackInfo_String(child, 'P_NAME', CHILD, true)
end
-- the flute track carries 4 channels so the plugin's outputs 3/4 exist as track channels 3/4;
-- its master/parent send stays channels 1/2 only
reaper.SetMediaTrackInfo_Value(src, 'I_NCHAN', 4)
reaper.SetMediaTrackInfo_Value(src, 'C_MAINSEND_OFFS', 0)
reaper.SetMediaTrackInfo_Value(src, 'C_MAINSEND_NCH', 2)
-- one send flute(3/4) → child(1/2), post-FX pre-fader (the flute's own trim must not touch the strikes)
local sendIdx = nil
for s = 0, reaper.GetTrackNumSends(src, 0) - 1 do
  local dest = reaper.GetTrackSendInfo_Value(src, 0, s, 'P_DESTTRACK')
  if dest == child then sendIdx = s end
end
if not sendIdx then sendIdx = reaper.CreateTrackSend(src, child) end
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'I_SRCCHAN', 2)      -- source channels 3/4 (0-based offset 2, stereo)
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'I_DSTCHAN', 0)      -- dest 1/2
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'I_SENDMODE', 3)     -- post-FX, pre-fader
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'D_VOL', 1.0)
reaper.SetMediaTrackInfo_Value(child, 'D_VOL', 10 ^ (GAIN_DB / 20))
reaper.SetMediaTrackInfo_Value(child, 'I_RECARM', 0)
reaper.SetMediaTrackInfo_Value(child, 'B_MAINSEND', 1)
reaper.TrackList_AdjustWindows(false)
local _, cn = reaper.GetTrackName(child)
return {
  child = cn, childIndex = reaper.GetMediaTrackInfo_Value(child, 'IP_TRACKNUMBER'),
  childDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(child, 'D_VOL'), 10),
  childFolderDepth = reaper.GetMediaTrackInfo_Value(child, 'I_FOLDERDEPTH'),
  srcChannels = reaper.GetMediaTrackInfo_Value(src, 'I_NCHAN'),
  srcMainSendNch = reaper.GetMediaTrackInfo_Value(src, 'C_MAINSEND_NCH'),
  send = { srcchan = reaper.GetTrackSendInfo_Value(src, 0, sendIdx, 'I_SRCCHAN'), dstchan = reaper.GetTrackSendInfo_Value(src, 0, sendIdx, 'I_DSTCHAN'), mode = reaper.GetTrackSendInfo_Value(src, 0, sendIdx, 'I_SENDMODE'), vol = reaper.GetTrackSendInfo_Value(src, 0, sendIdx, 'D_VOL') },
}
