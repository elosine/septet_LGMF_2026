-- proof_load.lua — the Kontakt Lua API proof, step 3 of 3 (PLAN 0k.2; RUNNING_LOG §56).
-- Run inside the Piano Kontakt instance (KONTAKT ▾ menu → Run Lua script…). Reversible:
-- loads a second Spitfire Plucked Piano into the EMPTY slot 1, puts it on MIDI channel [A] 5,
-- tries audio output 2 (st.2), sets its volume to -3 dB, reads everything back, then REMOVES it
-- again and reads the multi back. Writes reaper/kontakt/out/load_<time>.json. The strike-slot
-- pattern for the bass clarinet (0k.4), rehearsed on the piano.

local OUT_DIR = 'C:/Users/jwloy/GitHub/septet_2026/reaper/kontakt/out/'
local NKI = 'H:/Spitfire Audio Plucked Piano KONTAKT-iPirateU/Instruments/Plucked Piano.nki'
assert(Kontakt, 'run this inside Kontakt (developer features enabled)')

local function q(s) return '"' .. tostring(s):gsub('[%c"\\]', ' ') .. '"' end
local log = {}
local function note(k, v) log[#log + 1] = ' ' .. q(k) .. ': ' .. (type(v) == 'string' and q(v) or tostring(v)) end

local before = Kontakt.get_instrument_indices()
note('instruments_before', #before)

local ok, idx = pcall(Kontakt.load_instrument, NKI, 0)
note('load_ok', ok); note('load_result', idx)
if ok and type(idx) == 'number' then
  local ok_ch, e_ch = pcall(Kontakt.set_instrument_midi_channel, idx, 5)
  note('set_midi_channel_5_ok', ok_ch); if not ok_ch then note('set_midi_channel_err', e_ch) end
  local ok_out, e_out = pcall(Kontakt.set_instrument_output_channel, idx, 1)
  note('set_output_1_ok', ok_out); if not ok_out then note('set_output_err', e_out) end
  pcall(Kontakt.set_instrument_volume, idx, -3.0)
  note('name', Kontakt.get_instrument_name(idx))
  note('midi_channel', Kontakt.get_instrument_midi_channel(idx))
  note('output_channel', Kontakt.get_instrument_output_channel(idx))
  note('volume_dB', Kontakt.get_instrument_volume(idx))
  note('instruments_during', #Kontakt.get_instrument_indices())
  local ok_rm, e_rm = pcall(Kontakt.remove_instrument, idx)
  note('remove_ok', ok_rm); if not ok_rm then note('remove_err', e_rm) end
end
note('instruments_after', #Kontakt.get_instrument_indices())
note('time', os.date('!%Y-%m-%dT%H:%M:%SZ'))

local text = '{\n' .. table.concat(log, ',\n') .. '\n}\n'
local path = OUT_DIR .. 'load_' .. os.date('%Y%m%d_%H%M%S') .. '.json'
local f = assert(io.open(path, 'wb')); f:write(text); f:close()
print('[proof] ' .. text)
