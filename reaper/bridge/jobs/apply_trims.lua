-- apply_trims.lua — the 0d.4 trims onto the rack (2026-09-18), GENERATED from bank/balance.json by the
-- step in RUNNING_LOG §58; idempotent, self-reporting, never saves.
-- Each row: the Reaper FADER carries up to +12 dB (its ceiling); any remainder goes into a stock
-- "JS: Volume Adjustment" (utility/volume) FX on the track — Reaper-side, no MIDI binding, so no CC7 can
-- ever overwrite it (ARO's own gain is bound to CC7 and tops out at unity — §58; #5's SI2 parts had the same
-- trap). A track with no remainder gets no FX; an existing one is set to 0 rather than removed.
-- The SI2 `b` instances carry their instrument's trim too — the same instrument, its curve copies.
--   node tools/reaper_job.js run reaper/bridge/jobs/apply_trims.lua
local JS_NAME = 'utility/volume'
local TRIMS = {
  { name = "English Horn XS", faderDb = 0.00, extraDb = 0.00 },   -- English Horn
  { name = "Bassoon SI2", faderDb = -7.79, extraDb = 0.00 },   -- Bassoon
  { name = "Bassoon SI2 b", faderDb = -7.79, extraDb = 0.00 },   -- Bassoon
  { name = "Horn SI2", faderDb = -0.01, extraDb = 0.00 },   -- Horn
  { name = "Horn SI2 b", faderDb = -0.01, extraDb = 0.00 },   -- Horn
  { name = "Trumpet SI2", faderDb = -0.17, extraDb = 0.00 },   -- Trumpet
  { name = "Trumpet SI2 b", faderDb = -0.17, extraDb = 0.00 },   -- Trumpet
  { name = "Vibraphone XS", faderDb = 9.30, extraDb = 0.00 },   -- Vibraphone
  { name = "Cello XS", faderDb = 10.29, extraDb = 0.00 },   -- Cello
  { name = "Bass XS", faderDb = 5.25, extraDb = 0.00 },   -- D. Bass
  { name = "Finger Cymbals ARO", faderDb = 12.00, extraDb = 3.29 },   -- Finger Cymbals
  { name = "Bell Tree ARO", faderDb = 12.00, extraDb = 9.26 },   -- Bell Tree
  { name = "Sleigh Bells ARO", faderDb = 12.00, extraDb = 5.81 },   -- Sleigh Bells
  { name = "Triangles ARO", faderDb = 12.00, extraDb = 10.23 },   -- Triangles
  { name = "Tambourines ARO", faderDb = 12.00, extraDb = 3.76 },   -- Tambourines
  { name = "Castanets ARO", faderDb = 12.00, extraDb = 20.02 },   -- Castanets
  { name = "Claves ARO", faderDb = 12.00, extraDb = 13.64 },   -- Claves
  { name = "Shakers ARO", faderDb = 12.00, extraDb = 17.82 },   -- Shakers
  { name = "Brake Drums ARO", faderDb = 12.00, extraDb = 1.03 },   -- Brake Drums
  { name = "Crashers and Stack ARO", faderDb = 12.00, extraDb = 4.12 },   -- Crashers and Stack
  { name = "Wood Blocks ARO", faderDb = 12.00, extraDb = 3.43 },   -- Wood Blocks
  { name = "Bass Drum Alt ARO", faderDb = 5.60, extraDb = 0.00 },   -- Bass Drum Alt
  { name = "Temple Bowls ARO", faderDb = 12.00, extraDb = 9.38 },   -- Temple Bowls
  { name = "Tam Tams ARO", faderDb = 11.32, extraDb = 0.00 },   -- Tam Tams
}
local function findTrack(name)
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
    if n == name then return tr end
  end
end
local function findFx(tr)
  for i = 0, reaper.TrackFX_GetCount(tr) - 1 do
    local _, nm = reaper.TrackFX_GetFXName(tr, i, '')
    if nm:lower():find('volume adjustment', 1, true) or nm:lower():find('utility/volume', 1, true) then return i end
  end
end
local done, missing = {}, {}
for _, r in ipairs(TRIMS) do
  local tr = findTrack(r.name)
  if not tr then missing[#missing + 1] = r.name
  else
    reaper.SetMediaTrackInfo_Value(tr, 'D_VOL', 10 ^ (r.faderDb / 20))
    local fx = findFx(tr)
    local fxDb, fxParam = nil, nil
    if r.extraDb ~= 0 or fx then
      if not fx then fx = reaper.TrackFX_AddByName(tr, JS_NAME, false, -1) end
      if fx and fx >= 0 then
        reaper.TrackFX_SetEnabled(tr, fx, true)
        reaper.TrackFX_SetParam(tr, fx, 0, r.extraDb)
        local _, pn = reaper.TrackFX_GetParamName(tr, fx, 0, '')
        fxDb, fxParam = reaper.TrackFX_GetParam(tr, fx, 0), pn
      else fx = nil end
    end
    local volDb = 20 * math.log(reaper.GetMediaTrackInfo_Value(tr, 'D_VOL'), 10)
    done[#done + 1] = { name = r.name, faderAsked = r.faderDb, faderDb = math.floor(volDb * 100 + 0.5) / 100,
                        extraAsked = r.extraDb, fxIndex = fx, fxDb = fxDb and math.floor(fxDb * 100 + 0.5) / 100 or nil, fxParam = fxParam,
                        ok = math.abs(volDb - r.faderDb) < 0.05 and (r.extraDb == 0 or (fxDb ~= nil and math.abs(fxDb - r.extraDb) < 0.05)) }
  end
end
local allOk = #missing == 0
for _, d in ipairs(done) do if not d.ok then allOk = false end end
return { ok = allOk, applied = #done, missingTracks = missing, tracks = done, note = 'not saved — his CTRL+S' }
