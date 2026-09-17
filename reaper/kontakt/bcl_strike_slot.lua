-- bcl_strike_slot.lua — the bass clarinet's STRIKE slot (PLAN 0k.4, B; RUNNING_LOG §47, §56).
-- Run inside the "Bass Clarinet XS" Kontakt instance (KONTAKT ▾ menu → Run Lua script…).
-- Loads a second copy of the bass clarinet instrument into a free slot, on MIDI channel [A] 5,
-- audio output st.2 (plugin pins 3/4), volume 0 dB, named "Bass Clarinet STRIKE"; the app sends
-- the slap tongue (recipe `slap.channel = 5`) there, so it gets its own Reaper lane and gain.
-- Idempotent: if a slot named "Bass Clarinet STRIKE" exists it is re-configured, not duplicated.
-- Writes reaper/kontakt/out/bcl_strike_<time>.json with the read-back.

local OUT_DIR = 'C:/Users/jwloy/GitHub/septet_2026/reaper/kontakt/out/'
local NKI = {
  plain = 'C:/Users/jwloy/Documents/Xsample Sample Library/Xsample_Collection/Instruments Elastic/Woodwinds/Bass Clarinet.nki',
  bcha  = 'C:/Users/jwloy/Documents/Xsample Sample Library/Xsample_Collection/Instruments Elastic/Woodwinds/Bass Clarinet BCHA.nki',
}
local STRIKE_NAME, MIDI_CH, OUTPUT, VOL_DB = 'Bass Clarinet STRIKE', 5, 1, 0.0   -- output 1 = st.2
assert(Kontakt, 'run this inside Kontakt (developer features enabled)')

local log = {}
local function q(s) return '"' .. tostring(s):gsub('[%c"\\]', ' ') .. '"' end
local function note(k, v) log[#log + 1] = ' ' .. q(k) .. ': ' .. (type(v) == 'string' and q(v) or tostring(v)) end

-- which bass clarinet is loaded in slot 1? the same file goes into the strike slot
local idxs = Kontakt.get_instrument_indices()
note('instruments_before', #idxs)
local first = idxs[1]; assert(first, 'the multi is empty')
local firstName = Kontakt.get_instrument_name(first)
note('slot1_name', firstName)
local path = firstName:find('BCHA') and NKI.bcha or NKI.plain
note('nki', path)

local strike = nil
for _, i in ipairs(idxs) do if Kontakt.get_instrument_name(i) == STRIKE_NAME then strike = i end end
if not strike then
  local ok, idx = pcall(Kontakt.load_instrument, path, Kontakt.get_free_instrument_index and Kontakt.get_free_instrument_index() or 128)
  note('load_ok', ok); note('load_result', idx)
  assert(ok and type(idx) == 'number', 'load failed: ' .. tostring(idx))
  strike = idx
  pcall(Kontakt.set_instrument_name, strike, STRIKE_NAME)
else
  note('reused_existing_slot', strike)
end
local ok1, e1 = pcall(Kontakt.set_instrument_midi_channel, strike, MIDI_CH); note('set_midi_channel_ok', ok1); if not ok1 then note('midi_err', e1) end
local ok2, e2 = pcall(Kontakt.set_instrument_output_channel, strike, OUTPUT); note('set_output_ok', ok2); if not ok2 then note('output_err', e2) end
pcall(Kontakt.set_instrument_volume, strike, VOL_DB)

note('strike_idx', strike)
note('strike_name', Kontakt.get_instrument_name(strike))
note('strike_midi_channel', Kontakt.get_instrument_midi_channel(strike))
note('strike_output_channel', Kontakt.get_instrument_output_channel(strike))
note('strike_volume_dB', Kontakt.get_instrument_volume(strike))
note('slot1_midi_channel', Kontakt.get_instrument_midi_channel(first))
note('slot1_output_channel', Kontakt.get_instrument_output_channel(first))
note('instruments_after', #Kontakt.get_instrument_indices())
note('time', os.date('!%Y-%m-%dT%H:%M:%SZ'))

local text = '{\n' .. table.concat(log, ',\n') .. '\n}\n'
local f = assert(io.open(OUT_DIR .. 'bcl_strike_' .. os.date('%Y%m%d_%H%M%S') .. '.json', 'wb')); f:write(text); f:close()
print('[bcl strike] ' .. text)
