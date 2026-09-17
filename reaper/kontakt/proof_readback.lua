-- proof_readback.lua — the Kontakt Lua API proof, step 1 of 3 (PLAN 0k.2; RUNNING_LOG §51).
-- Run INSIDE the Kontakt instance on the "Piano Kontakt" track: Options → Developer → "Enable
-- developer features" once, then drag this file from Explorer onto the Kontakt rack (or F11).
-- Reads every instrument slot and writes reaper/kontakt/out/readback_<time>.json; changes nothing.

local OUT_DIR = 'C:/Users/jwloy/GitHub/septet_2026/reaper/kontakt/out/'
assert(Kontakt, 'run this inside Kontakt (developer features enabled)')

local function q(s) return '"' .. tostring(s):gsub('[%c"\\]', function(c) return ({ ['"'] = '\\"', ['\\'] = '\\\\' })[c] or ' ' end) .. '"' end
local rows = {}
for _, idx in ipairs(Kontakt.get_instrument_indices()) do
  local r = { idx = idx, slot = math.floor(idx / 128) + 1 }
  for _, f in ipairs({ 'name', 'midi_channel', 'output_channel', 'volume', 'pan', 'mute', 'solo', 'polyphony', 'tune' }) do
    local ok, v = pcall(Kontakt['get_instrument_' .. f], idx)
    if ok then r[f] = v else r[f] = 'ERR ' .. tostring(v) end
  end
  rows[#rows + 1] = r
end
local parts = {}
for _, r in ipairs(rows) do
  parts[#parts + 1] = string.format('  {"slot":%d,"idx":%d,"name":%s,"midi_channel":%s,"output_channel":%s,"volume_dB":%s,"pan":%s,"mute":%s,"solo":%s,"polyphony":%s,"tune":%s}',
    r.slot, r.idx, q(r.name), tostring(r.midi_channel), tostring(r.output_channel), tostring(r.volume), tostring(r.pan), tostring(r.mute), tostring(r.solo), tostring(r.polyphony), tostring(r.tune))
end
local okname, multi = pcall(Kontakt.get_multi_name)
local text = '{\n "multi": ' .. q(okname and multi or '?') .. ',\n "time": ' .. q(os.date('!%Y-%m-%dT%H:%M:%SZ')) .. ',\n "num_instruments": ' .. tostring(#rows) .. ',\n "instruments": [\n' .. table.concat(parts, ',\n') .. '\n ]\n}\n'
local path = OUT_DIR .. 'readback_' .. os.date('%Y%m%d_%H%M%S') .. '.json'
local f = assert(io.open(path, 'wb'), 'cannot write ' .. path .. ' (does the out folder exist?)')
f:write(text); f:close()
print('[proof] wrote ' .. path)
print(text)
