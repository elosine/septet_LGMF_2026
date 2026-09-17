-- proof_write.lua — the Kontakt Lua API proof, step 2 of 3 (PLAN 0k.2; RUNNING_LOG §55).
-- Run inside the Piano Kontakt instance (KONTAKT ▾ menu → Run Lua script…). Reversible:
-- sets the Plucked Piano slot's volume to -6 dB, reads it back, restores the original value,
-- reads it back again, and writes both readings to reaper/kontakt/out/write_<time>.json.

local OUT_DIR = 'C:/Users/jwloy/GitHub/septet_2026/reaper/kontakt/out/'
assert(Kontakt, 'run this inside Kontakt (developer features enabled)')

local target = nil
for _, idx in ipairs(Kontakt.get_instrument_indices()) do
  if Kontakt.get_instrument_name(idx) == 'Plucked Piano' then target = idx end
end
assert(target, 'no slot named "Plucked Piano" in this multi')

local before = Kontakt.get_instrument_volume(target)
Kontakt.set_instrument_volume(target, -6.0)
local during = Kontakt.get_instrument_volume(target)
Kontakt.set_instrument_volume(target, before)
local after = Kontakt.get_instrument_volume(target)

local text = string.format('{\n "time": "%s",\n "idx": %d,\n "name": "Plucked Piano",\n "volume_before_dB": %s,\n "volume_set_to_dB": -6.0,\n "volume_read_back_dB": %s,\n "volume_restored_dB": %s,\n "ok": %s\n}\n',
  os.date('!%Y-%m-%dT%H:%M:%SZ'), target, tostring(before), tostring(during), tostring(after), tostring(math.abs(during + 6.0) < 0.01 and math.abs(after - before) < 0.01))
local path = OUT_DIR .. 'write_' .. os.date('%Y%m%d_%H%M%S') .. '.json'
local f = assert(io.open(path, 'wb')); f:write(text); f:close()
print('[proof] ' .. text)
