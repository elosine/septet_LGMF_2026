> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/REAPER_CONTROL.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated. The bridge itself is machine-level and already installed — piece #5 built it that way deliberately, "the foundation for additional reaper projects" (its 0k.5). This piece is one of those projects; its rack is 0e.

# Controlling Reaper and the samplers from the AI — the survey and the plan (PLAN 0k)

> Composer, 2026-09-04, after choosing B for the strikes (separate channels with their own
> gain): *"can we figure out how you can handle reaper instruments? lets discuss and make a plan
> first? what capabilities does ai have and what are the mechanisms, co-work? mcp? custom reaper
> scripts lua? lets do a comprehensive survey and find the best, fast and reliable and most
> functions, solutions"*. This file is the survey, the finding that decides where trims can
> live, and the plan. RUNNING_LOG §48 has the discussion.

## 1 · What the AI reaches today (proven this week)

| Reach | How | Proven |
|---|---|---|
| The rack file `reaper/septet_rack.rpp` — every track, routing, record mode, FX chain | read and edit the text, the composer reloads | §45 (the silent REC diagnosed from the file) |
| The samplers, by MIDI — notes, CC0 presets, keyswitches, CC7, program change | PowerShell → winmm → the loopMIDI ports | the probes (§31, §46) |
| What the rack sounds like — levels, peaks, clipping, ranges that do not sound | REC recording → numpy analysis | §46 |
| The screen — Reaper and the sampler GUIs | the composer's screenshots; the AI's own desktop automation (screenshot, click, type), not yet used on Reaper | — |

## 2 · The mechanisms, surveyed

| # | Mechanism | Reach | Speed | Reliability | Setup | Verdict |
|---|---|---|---|---|---|---|
| 1 | **`.rpp` edit + reload** | structure, routing, faders, FX chains (plugin state = opaque blobs) | slow: a reload each time | high; blind to unsaved state | none | keep for bulk structure and for reading |
| 2 | **ReaScript (Lua) through a FILE BRIDGE** — a defer loop started by `Scripts/__startup.lua` polls `reaper/bridge/inbox/`, runs each job, writes JSON to `outbox/` | the whole ReaScript API (~1000 functions): tracks, items, MIDI, FX add / params / presets, sends, sub-outputs, faders, arm / record / transport, markers, envelopes, render, save; live state | ~30 ticks/s; a job answers in well under a second | high: `pcall` per job, no network, results read back through the same API | once: one file + one line, restart Reaper | **the workhorse** |
| 3 | Reaper's **web interface** (HTTP `GET /_/<action id>`) | runs actions, transport, markers; thin on data | fast | high | enable in Preferences | optional trigger, not needed with #2 |
| 4 | OSC | control-surface reach | fast | high | enable | not needed |
| 5 | Command line (`reaper.exe -renderproject`, `-batchconvert`) | offline renders in a new instance | — | high | none | niche: batch renders |
| 6 | **Community MCP servers** ([TwelveTake reaper-mcp](https://github.com/TwelveTake-Studios/reaper-mcp): file bridge, 176 tools; [bonfire reaper-mcp](https://github.com/bonfire-systems/reaper-mcp): python-reapy socket bridge, 58 tools; [xDarkzx Reaper-MCP](https://github.com/xDarkzx/Reaper-MCP): 172 tools; [total-reaper-mcp](https://github.com/shiehn/total-reaper-mcp): "100 % ReaScript coverage"; [yeeking](https://github.com/yeeking/reaper-mcp-server), [mthines](https://github.com/mthines/reaper-mcp), [wegitor](https://github.com/wegitor/reaper-reapy-mcp); the pattern described at [Reaper Daemon](https://www.deadpixeldesign.com/workflows/reaper-daemon/)) | the same bridge as #2 with a fixed tool vocabulary on top | fast | varies: Python stacks, maintenance, trust | install + config | **not needed** — every one of them is #2 underneath; our own bridge is ~100 lines of Lua with nothing between the AI and the API. Revisit only for a specific ready-made tool set (metering, spectrum) |
| 7 | **MIDI to the samplers** | what each sampler maps: notes · Xsample CC0 presets · UVI keyswitches · CC7 = slot / part volume by default · program change | instant | high | none | playing and preset selection, not configuration |
| 8 | **Sampler internals** — Kontakt slots and outputs, UVI parts and outputs, loading instruments, instance masters | NOT in ReaScript (plugins expose only the parameters they choose; Kontakt none by default). Reach: desktop automation with the composer watching, or the composer's hands on the AI's exact instruction | slow | medium (GUI) | approval per use | **co-work**: the AI names the click, the composer's screenshot verifies; automation when a step repeats |
| 8b | **Host automation parameters** (Kontakt 8: #000 … #511; UVI: its automation slots) | any knob inside the sampler once it is assigned to a slot (one GUI drag per knob); then `TrackFX_SetParam` by the bridge, saved as numbers | fast | high once assigned | one drag per knob | static trims on CC7-free knobs (8Dio GAIN, Xsample volume, Kontakt output faders); never the slot Volume (CC7's) |
| 8c | **Kontakt Lua API** (Options → Developer → enable; the [manual](https://docs.native-instruments.com/pdf-guides/kontakt/Kontakt_8_API_Reference-en_260924.pdf)) | the multi as code: `load_instrument(nki, slot)`, `set_instrument_midi_channel` (1…64 = ch 1–16 × ports A–D), `set_instrument_output_channel`, `set_instrument_volume` (dB), pan / mute / solo / options / names, `save_multi` / `load_multi`, getters for read-back; instrument building below that | seconds | high (read-back by the getters) | one drag of the script onto the rack per instance (F11 / Files browser / Explorer drag); standalone Kontakt takes it on the command line | **the Kontakt setup, scripted** — RUNNING_LOG §51 |
| 9 | The plugin state blob in the track chunk | opaque base64 | — | fragile | — | never |

## 3 · The finding that decides where a trim can live

- **CC7 cannot hold a static trim.** Kontakt maps CC7 to the instrument slot's volume and UVI to
  the part's volume by default, and the composer app PINS CC7 = 127 before every event (the
  tuba stack's per-event ownership, kept in D11). A slot / part fader set by hand is reset at
  the first note.
- **The instance masters** (Kontakt's master, UVI's master) are not CC7 — piece #4 calibrated
  there — but they are **GUI-only**: not a plugin parameter, not in ReaScript, not in the file
  as a number.
- **Reaper faders and gain plugins** are exact (dB), settable and readable by the bridge,
  saved in the `.rpp` as numbers, and out of CC7's reach.

**Therefore, for this rack:** instrument trims on the **Reaper track faders**; a strike technique
that needs its own gain goes to a **child track fed by a sampler sub-output** (UVI part → outs
3/4; a second Kontakt slot of the same instrument on the strike channel → output st.2), the
sub-output set once in the sampler GUI. Piece #4's gain-staging rule (calibrate at the
sampler master) is amended for this rack for the reason above. Recorded in RUNNING_LOG §48.

## 3b · Amendment (same day, RUNNING_LOG §49): UVI Workstation's insides are text

The UVI VST block in the rack file decodes to a 312-byte header and a zlib stream of XML
(`<UVI4>`; 3.5 MB for the flute): sixteen `<Part MidiChannel= Gain= OutputName= Mute=>`, each
`<Program ProgramPath="…uvip" BypassInsertFX=>`, every insert effect's `Bypass`, and the
instance master (`<Synth DisplayName="Master" Gain=>` — the composer's −2 dB read back as
0.794). The header carries two lengths (the block size = 12 + compressed bytes at offset
296; the XML length at 308), so a write-back is header + new lengths + `zlib(xml)`. **UVI
setup — parts, channels, presets by path, outputs, gains, bypasses — is therefore a text
edit**, live through the bridge (`SetTrackStateChunk`) or in the file. **Proven with audio 2026-09-04 (§59): a part's output pair is `OutputName="$Engine/Out n"` (a path; n = 2…17), `tools/uvi_state.js set-output`.** To prove before use:
the unchanged round trip, then one visible edit. Kontakt's block is the NKI binary: its setup
stays GUI (once) + duplication by chunk copy for identical instruments + desktop automation
for repeated clicks; a KSP multi-script for runtime settings is unexplored. The instance-master
sentence in §3 holds for Kontakt only.

## 4 · The plan — PLAN 0k, the Reaper bridge

1. **The bridge** — `reaper/bridge/bridge.lua`: a defer loop; picks the oldest `inbox/*.lua`,
   runs it under `pcall` with a small API (`job.result(table)`), writes `outbox/<name>.json`
   (result or error + traceback), moves the job to `done/`; a heartbeat file every second so
   the AI knows Reaper is alive; a hard rule of no loops longer than a tick budget.
   Install: `reaper/bridge/install.md` — copy one line into `Scripts/__startup.lua`
   (created if absent), restart Reaper. Verified by the first job (`list_tracks`).
2. **The jobs** — `tools/reaper_job.js <name> [args]` writes a job and waits for its result:
   `tracks` (names, faders, arm, folder depth, FX list) · `fader <track> <dB>` · `child
   <parent> <name> --receive | --input "plugin out 3/4"` · `fx add <track> "JS: Volume"` ·
   `param` · `arm / record / stop` · `save` · `render <t0> <t1>` · later `midi-import` (a
   composer save → MIDI items, for renders and the performance score).
3. **Apply B** (§47): faders flute −21 · bcl −9 · piano +7 · vn 0 · va −3.5 · vc −1; the
   flute Pizzicato part and a second bass-clarinet slot to sub-outputs → `Flute strikes` /
   `BassCl strikes` child tracks with their gains (+21 / +13 targets); the recipe carries the
   channel and the `balanceDb`; re-run the balance probe (`-Only flute,bass_clarinet`) and
   read the strike table again.
4. **The co-work protocol** for sampler internals: the AI writes the exact steps, one at a
   time; the composer clicks and screenshots; the AI reads back through the bridge where it
   can (a sub-output appears as a new plugin output pin in the track's routing).

**Risks and their answers:** a job that errors — reported, the rest untouched · a job that
would hang — no loops, `pcall`, the tick budget · Reaper not running — no heartbeat, the AI
says so · the composer's unsaved edits — jobs mark the project dirty and never save unless
the job is `save`; the composer keeps CTRL+S as the truth.
