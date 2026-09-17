# The Reaper bridge — install and use (PLAN 0k.1)

**What it is:** `bridge.lua` runs inside Reaper as a background loop. The AI drops a Lua job into
`inbox/`, the bridge runs it and answers in `outbox/`; `heartbeat.json` says Reaper is alive.
Design and the survey behind it: `docs/REAPER_CONTROL.md`.

**Install (once per machine):** `%APPDATA%\REAPER\Scripts\__startup.lua` carries one line:

    dofile("C:/Users/jwloy/GitHub/septet_2026/reaper/bridge/bridge.lua")

Reaper runs it at every launch. To start the bridge in an already running Reaper (no restart):
Actions → Show action list → **ReaScript: Load…** → pick `reaper/bridge/bridge.lua` → it runs
(and stays in the action list for next time). The Reaper console prints `[bridge] … watching …`.

**Use:** `node tools/reaper_job.js heartbeat | tracks | fader "<track>" <dB> | save | chunk "<track>"
| run job.lua | -e "<lua>"`. A job is any Lua chunk with `reaper` in scope that RETURNS its
result. Jobs must not loop for long (one job = one tick) and never save the project unless the
job is `save` — CTRL+S stays the composer's.

**Files:** `inbox/`, `outbox/`, `done/`, `heartbeat.json` are runtime and gitignored.
