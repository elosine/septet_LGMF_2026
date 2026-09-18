-- curve_slots.lua — the channel-bank slots of D11 (piece #5's PLAN 0k.5 / 0c.7; here PLAN 0e,
-- the Kontakt three, 2026-09-17): the instrument in slot 1 copied into three more slots on MIDI
-- channels [A] 2, 3, 4 (the curve banks A / B / C), same output, same volume, named
-- "<name> curve A|B|C". Slot 1 itself is pinned to [A] 1 (a slot left on Omni sounds on every
-- channel — SAMPLER_QUIRKS §Kontakt 8). Run inside ANY Kontakt instance of the rack (KONTAKT ▾
-- menu → Run Lua script…). Idempotent: existing "curve" slots are re-configured. Nothing is removed.
--
-- SELF-REPORTING (2026-09-17, after a run that "did nothing" and left no file): the script writes
-- reaper/kontakt/out/curve_slots_START_<time>.json before it touches Kontakt (proof it ran, and
-- whether the Kontakt API exists), then runs everything under pcall and ALWAYS writes
-- curve_slots_<time>.json with the read-back — or the error and the slot-1 name it saw.
--
-- The .nki for each instrument is chosen by the NAME of slot 1 (the API has no "file of this
-- slot"); add a line to NKI when a new instrument joins the rack. Names are matched loosely
-- (case, spacing).

local OUT_DIR = 'C:/Users/jwloy/GitHub/septet_LGMF_2026/reaper/kontakt/out/'
local XS = 'C:/Users/jwloy/Documents/Xsample Sample Library/'
-- This rack's three Kontakt instances (D8: the english horn is Xsample too). The English Horn
-- arrived 2026-09-17 as the XL_Woodwinds_English_Horn add-on; its .nki sits in the AIL
-- installer's copy of the collection, not in the root Xsample_Collection (RUNNING_LOG §26).
local NKI = {
  ['English Horn']             = XS .. 'Xsample_AIL_Installer_Windows/Xsample_Collection/Instruments Elastic/Woodwinds/English Horn.nki',
  ['Contemporary Violoncello'] = XS .. 'Xsample_Contemporary_Solo_Strings/Contemporary Violoncello.nki',
  ['Contemporary Doublebass']  = XS .. 'Xsample_Contemporary_Solo_Strings/Contemporary Doublebass.nki',
  -- the bowed vibraphone, 2026-09-18 (LG-9 acquired; LG-15 makes it the opening's reference). The
  -- ELASTIC copy, as the other three are; the library also ships an "Instruments Fixed" Vibraphone.nki
  -- with the same slot-1 name, so if the curve copies come up wrong that is the line to change.
  ['Vibraphone']               = XS .. 'Xsample_AIL_Installer_Windows/Xsample_Collection/Instruments Elastic/Mallets/Vibraphone.nki',
}
local CURVES = { { ch = 2, tag = 'curve A' }, { ch = 3, tag = 'curve B' }, { ch = 4, tag = 'curve C' } }

local log, made = {}, {}
local BS = string.char(92)   -- no backslash in this source: a heredoc write flattened one once (RUNNING_LOG §28)
local function q(s) return '"' .. tostring(s):gsub('[%c"' .. BS .. ']', ' ') .. '"' end
local function note(k, v) log[#log + 1] = ' ' .. q(k) .. ': ' .. (type(v) == 'string' and q(v) or tostring(v)) end
local function norm(s) return (tostring(s):lower():gsub('^%s+', ''):gsub('%s+$', ''):gsub('%s+', ' ')) end
local function write_out(name, body) local f = assert(io.open(OUT_DIR .. name, 'wb')); f:write(body); f:close() end
local stamp = os.date('%Y%m%d_%H%M%S')

-- 1. Proof the script ran at all, before Kontakt is touched.
write_out('curve_slots_START_' .. stamp .. '.json', '{ "kontakt_api": ' .. tostring(Kontakt ~= nil) .. ', "lua": ' .. q(_VERSION) .. ' }\n')

-- 2. The work, under pcall so any failure lands in the read-back file.
local function main()
  assert(Kontakt, 'no Kontakt API - developer features off, or not run inside Kontakt')
  local NKI_N = {}; for k, v in pairs(NKI) do NKI_N[norm(k)] = v end
  local idxs = Kontakt.get_instrument_indices()
  assert(idxs[1], 'the multi is empty')
  local first = idxs[1]
  local base = Kontakt.get_instrument_name(first)
  note('slot1_name', base); note('instruments_before', #idxs)
  local path = NKI[base] or NKI_N[norm(base)]
  assert(path, 'no .nki known for slot-1 name "' .. tostring(base) .. '" - add it to NKI in curve_slots.lua')
  note('nki', path)
  pcall(Kontakt.set_instrument_midi_channel, first, 1)
  note('slot1_midi_channel', Kontakt.get_instrument_midi_channel(first))
  local out_ch, vol = Kontakt.get_instrument_output_channel(first), Kontakt.get_instrument_volume(first)
  note('slot1_output_channel', out_ch); note('slot1_volume_dB', vol)
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
end

local ok, err = pcall(main)
note('ok', ok); if not ok then note('error', err) end
note('time', os.date('!%Y-%m-%dT%H:%M:%SZ'))
local text = '{\n' .. table.concat(log, ',\n') .. ',\n "curve_slots": [\n' .. table.concat(made, ',\n') .. '\n ]\n}\n'
write_out('curve_slots_' .. stamp .. '.json', text)
print('[curve slots] ' .. text)
if not ok then error(err) end
