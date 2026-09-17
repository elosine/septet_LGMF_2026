-- curve_slots.lua — the channel-bank slots of D11 (PLAN 0k.5 / 0c.7): the instrument in slot 1
-- copied into three more slots on MIDI channels [A] 2, 3, 4 (the curve banks A / B / C), same
-- output, same volume, named "<name> curve A|B|C". Run inside ANY Kontakt instance of the rack
-- (KONTAKT ▾ menu → Run Lua script…). Idempotent: existing "curve" slots are re-configured.
-- Writes reaper/kontakt/out/curve_slots_<time>.json with the read-back. Nothing is removed.
--
-- The .nki for each instrument is chosen by the NAME of slot 1 (the API has no "file of this
-- slot"); add a line to NKI when a new instrument joins the rack.

local OUT_DIR = 'C:/Users/jwloy/GitHub/septet_2026/reaper/kontakt/out/'
local XS = 'C:/Users/jwloy/Documents/Xsample Sample Library/'
local NKI = {
  ['Bass Clarinet']         = XS .. 'Xsample_Collection/Instruments Elastic/Woodwinds/Bass Clarinet.nki',
  ['Bass Clarinet BCHA']    = XS .. 'Xsample_Collection/Instruments Elastic/Woodwinds/Bass Clarinet BCHA.nki',
  ['Contemporary Violin']   = XS .. 'Xsample_Contemporary_Solo_Strings/Contemporary Violin.nki',
  ['Contemporary Viola']    = XS .. 'Xsample_Contemporary_Solo_Strings/Contemporary Viola.nki',
  ['Contemporary Violoncello'] = XS .. 'Xsample_Contemporary_Solo_Strings/Contemporary Violoncello.nki',
  ['8DIO_1969_Legacy_Piano'] = 'H:/8Dio - 1969 Steinway Legacy Grand Piano (Kontakt)/Instrument/8DIO_1969_Legacy_Piano.nki',
  ['Plucked Piano']         = 'H:/Spitfire Audio Plucked Piano KONTAKT-iPirateU/Instruments/Plucked Piano.nki',
}
local CURVES = { { ch = 2, tag = 'curve A' }, { ch = 3, tag = 'curve B' }, { ch = 4, tag = 'curve C' } }
assert(Kontakt, 'run this inside Kontakt (developer features enabled)')

local log = {}
local function q(s) return '"' .. tostring(s):gsub('[%c"\\]', ' ') .. '"' end
local function note(k, v) log[#log + 1] = ' ' .. q(k) .. ': ' .. (type(v) == 'string' and q(v) or tostring(v)) end

local idxs = Kontakt.get_instrument_indices()
assert(idxs[1], 'the multi is empty')
local first = idxs[1]
local base = Kontakt.get_instrument_name(first)
local path = NKI[base]
note('slot1_name', base); note('instruments_before', #idxs)
assert(path, 'no .nki known for "' .. base .. '" — add it to NKI in this script')
local out_ch, vol = Kontakt.get_instrument_output_channel(first), Kontakt.get_instrument_volume(first)

local made = {}
for _, c in ipairs(CURVES) do
  local want = base .. ' ' .. c.tag
  local idx = nil
  for _, i in ipairs(Kontakt.get_instrument_indices()) do if Kontakt.get_instrument_name(i) == want then idx = i end end
  if not idx then
    local ok, r = pcall(Kontakt.load_instrument, path, Kontakt.get_free_instrument_index and Kontakt.get_free_instrument_index() or (#Kontakt.get_instrument_indices() * 128))
    assert(ok and type(r) == 'number', 'load failed for ' .. want .. ': ' .. tostring(r))
    idx = r
    pcall(Kontakt.set_instrument_name, idx, want)
  end
  pcall(Kontakt.set_instrument_midi_channel, idx, c.ch)
  pcall(Kontakt.set_instrument_output_channel, idx, out_ch)
  pcall(Kontakt.set_instrument_volume, idx, vol)
  made[#made + 1] = string.format('  {"name":%s,"idx":%d,"midi_channel":%s,"output_channel":%s,"volume_dB":%s}',
    q(Kontakt.get_instrument_name(idx)), idx, tostring(Kontakt.get_instrument_midi_channel(idx)), tostring(Kontakt.get_instrument_output_channel(idx)), tostring(Kontakt.get_instrument_volume(idx)))
end
note('instruments_after', #Kontakt.get_instrument_indices())
note('time', os.date('!%Y-%m-%dT%H:%M:%SZ'))
local text = '{\n' .. table.concat(log, ',\n') .. ',\n "curve_slots": [\n' .. table.concat(made, ',\n') .. '\n ]\n}\n'
local f = assert(io.open(OUT_DIR .. 'curve_slots_' .. os.date('%Y%m%d_%H%M%S') .. '.json', 'wb')); f:write(text); f:close()
print('[curve slots] ' .. text)
