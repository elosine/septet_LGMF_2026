# The Reaper bridge — a foundation for any project (PLAN 0k.5)

> The composer, 2026-09-04: *"can we generalize or start the foundation for additional reaper
> projects, I'd like to do something similar for my live electronics project but it is mostly
> audio with me playing live and webbrowser or supercollider playback."* This folder is that
> foundation. The survey and the reasons: `docs/REAPER_CONTROL.md`; the day it was built:
> RUNNING_LOG §48–61.

## The shape

- **One bridge per machine.** `bridge.lua` runs inside Reaper (a background loop, started by
  `%APPDATA%\REAPER\Scripts\__startup.lua`). Its runtime — `inbox/`, `outbox/`, `done/`,
  `heartbeat.json` — lives in **Reaper's own resource folder, `%APPDATA%\REAPER\bridge\`**, not in
  any repo. Every project on the machine talks to the same bridge; the heartbeat says which
  project is open.
- **Per project:** a copy of `tools/reaper_job.js` (or a path to it), a `REAPER_PROJECT` guard
  (the job runner refuses to send while another project is open — this repo's default is
  `septet_rack`), and its own `jobs/` folder of Lua files. Jobs are plain ReaScript chunks that
  RETURN a result; nothing project-specific is inside the bridge.
- **Generic jobs already in the runner:** `heartbeat` · `tracks` · `fader` · `arm` · `transport
  play|stop|record|pause` · `marker` · `save` · `chunk` · `run <file>` · `-e "<lua>"` · `reload`
  (the bridge restarts from its file — after editing `bridge.lua`, no clicks).
- **Job files here:** `jobs/strike_lane.lua` (a child track fed by a plugin's outputs 3/4),
  `jobs/flute_strikes_track.lua`, `jobs/peakwatch.lua` (a job that starts its own defer loop and
  records each track's channel maxima for 3 s — the proof method for routing).

## The samplers, as code (this repo's `tools/` and `reaper/kontakt/`)

- **UVI Workstation:** `tools/uvi_state.js` — the plugin's state is XML inside the track chunk;
  `info · decode · encode --push · roundtrip · set-output`. A part's output pair is
  `OutputName="$Engine/Out n"`. Any UVI instance, any project.
- **Kontakt 8:** the Kontakt Lua API (Options → Developer → enable; run a script from the
  KONTAKT ▾ menu). `reaper/kontakt/*.lua`: `proof_readback` / `proof_write` / `proof_load` (the
  API proven), `bcl_strike_slot.lua` (a second slot on a strike channel), `curve_slots.lua`
  (the ×4 channel-bank slots of D11). Each writes a JSON read-back the AI checks.
- **Reaper faders, sends, lanes, arming, transport:** the bridge.

## Installing in another repo (the live-electronics project, or the next piece)

1. Reaper side: nothing — the bridge is already on this machine and starts with Reaper.
2. Copy `tools/reaper_job.js` into the repo (it has no dependencies) and set
   `REAPER_PROJECT` to that project's file stem (or `''` for no guard).
3. Add a `reaper/jobs/` folder for that project's Lua jobs; start with `tracks` to read the
   session and `peakwatch` to see routing.
4. If the repo edits UVI or Kontakt, copy `tools/uvi_state.js` / the Kontakt scripts too.

**What the live-electronics project would use** (mostly audio, the composer playing live, playback
from a browser or SuperCollider): `arm`, `transport record`/`stop`, `marker` at every cue,
`fader`, `tracks`, `peakwatch` on the inputs (a level check before a take), `chunk` for FX-chain
read-backs, `save`; the browser and SuperCollider stay outside Reaper — Reaper's OSC control
surface can receive their cues, and the bridge can mirror them as markers. A job that starts its
own defer loop (like `peakwatch`) is the pattern for anything that must follow the transport.

## Rules

- The bridge never saves the project on its own; `save` is a job the composer asks for. CTRL+S
  stays the composer's.
- No job may loop for long — one job, one tick; anything longer starts its own defer loop and
  writes its own result file.
- Read back after every write. A meter watch is the proof for routing; a JSON read-back for state.

## A job must be written, then RENAMED into the inbox (2026-09-08, RUNNING_LOG §269)

The bridge polls the inbox about thirty times a second, so a job written straight into it is read half-finished: `load()` compiles
a fragment, the chunk returns nothing, and the outbox says `ok: true` with no `result` — a silent, puzzling success. Write the job
to a temp name in the bridge folder and `rename` it into `inbox/` (rename is atomic). Two jobs were lost to this before the third
came back whole.
