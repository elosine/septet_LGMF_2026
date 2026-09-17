-- strike_lane.lua — a STRIKE lane: a child track fed by a sampler's second output pair (PLAN 0k.4, B).
-- Generalizes flute_strikes_track.lua. Edit the three values below (or generate a copy per lane).
-- Idempotent: an existing child is re-routed, not duplicated. Returns a read-back.
local SRC, CHILD, GAIN_DB = 'Bass Clarinet XS', 'BassCl strikes', 0

local function find(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
    if n == name then return tr, i end
  end
end
local src, si = find(SRC); assert(src, 'no track ' .. SRC)
local child = find(CHILD)
if not child then
  reaper.InsertTrackAtIndex(si + 1, true)
  child = reaper.GetTrack(0, si + 1)
  reaper.GetSetMediaTrackInfo_String(child, 'P_NAME', CHILD, true)
end
reaper.SetMediaTrackInfo_Value(src, 'I_NCHAN', 4)            -- plugin pins 3/4 become track channels 3/4
local sendIdx = nil
for s = 0, reaper.GetTrackNumSends(src, 0) - 1 do
  if reaper.GetTrackSendInfo_Value(src, 0, s, 'P_DESTTRACK') == child then sendIdx = s end
end
if not sendIdx then sendIdx = reaper.CreateTrackSend(src, child) end
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'I_SRCCHAN', 2)   -- channels 3/4
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'I_DSTCHAN', 0)
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'I_SENDMODE', 3)  -- post-FX, pre-fader: the source's trim never touches the lane
reaper.SetTrackSendInfo_Value(src, 0, sendIdx, 'D_VOL', 1.0)
reaper.SetMediaTrackInfo_Value(child, 'D_VOL', 10 ^ (GAIN_DB / 20))
reaper.SetMediaTrackInfo_Value(child, 'I_RECARM', 0)
reaper.SetMediaTrackInfo_Value(child, 'B_MAINSEND', 1)
reaper.TrackList_AdjustWindows(false)
local _, cn = reaper.GetTrackName(child)
return { lane = cn, index = reaper.GetMediaTrackInfo_Value(child, 'IP_TRACKNUMBER'), dB = 20 * math.log(reaper.GetMediaTrackInfo_Value(child, 'D_VOL'), 10),
  srcChannels = reaper.GetMediaTrackInfo_Value(src, 'I_NCHAN'),
  send = { srcchan = reaper.GetTrackSendInfo_Value(src, 0, sendIdx, 'I_SRCCHAN'), mode = reaper.GetTrackSendInfo_Value(src, 0, sendIdx, 'I_SENDMODE') } }
