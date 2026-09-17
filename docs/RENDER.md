> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/RENDER.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated. **Nothing in it runs yet:** it describes capturing the composer's playback through the Reaper bridge, and this piece has no rack (0e).

# The audio render — the composer's playback, recorded in Reaper, linked to the notation score

*RUNNING_LOG §453 (2026-09-13). The composer: "Let's prep the recording and sort out the trill midi and then generate the midi file and
do a record and then link it to the notation score … can you look at … the specs for the tuba piece? because there was clipping, and we
had to redo it a couple times and reduce the volume."*

## §1 The route — three commands

```
node tools/capture_composer_midi.js          # ~13 min · the composer's own playback, message by message → midi/piece-septet.capture.json
node tools/export_midi.js --capture midi/piece-septet.capture.json   # seconds · checked, laid out as the rack → midi/
node tools/render_reaper.js                  # minutes · Reaper renders through the bridge → notation/audio/piece-septet.wav
```

Needs: the score server on :5300 (`node score/server.js`), Reaper open with the bridge alive, the rack SAVED (the render copies the file).
Then: the notation page (CTRL+SHIFT+R) → the MAIN file → **♪ render** → the page's clock follows the WAV.

**Re-render whenever the score is saved again** — the WAV is the playback of `scores/piece-septet.json` at the moment of the capture
(`notation/audio/raw/piece-septet-render.json` records when). The export warns if the file was saved after the capture.

## §2 The rules, and where each one lives

| # | Rule | Why | Where |
|---|---|---|---|
| 1 | **The events are the composer's own playback** — composer.html run headless under a virtual clock, its MIDI sends recorded | the shared computation (`sonify_core`) never learned the septet's rules: trills, eaten notes, the measured velocity and CC7, the secco cut, the late switch beside a trill (§441–§443). A second copy drifts; the composer IS the engine | `tools/capture_composer_midi.js` |
| 2 | **The capture cannot write** — every non-GET request refused; the score is loaded from its FILE, never the working copy | a second composer tab clobbers the working copy (PLAN 2d.5.8) | same |
| 3 | **Checked against the score before a file is written** — every trill note at its time (±3 ms), every sounding note once, the eaten notes silent, nothing unexplained, nothing left hanging, the file read back | a render of a wrong stream costs a render | `tools/export_midi.js` |
| 4 | **Each track gets what its live input gets** — the whole port, all channels (four piano tracks = the Piano port each; two bass clarinet tracks = the BassCl port each); a track with no MIDI input gets one inert message | the rack is calibrated on live input; the file must reproduce it, not reinterpret it | same (`RACK_PORT`, read from the .rpp) |
| 5 | **60 BPM / 960 PPQ; the project set to 60** — one beat = one second | piece #4: the rack sat at 120 and would have halved every duration | the files · `render_reaper.js` |
| 6 | **Placed BY TRACK NAME, never by position** (the n-th file of a name on the n-th track of that name) | piece #4: a duplicated Tuba8 pair shifted a positional drop one pair low | `render_reaper.js` · `reaper/place_piece-septet_midi.lua` (by hand) |
| 7 | **The REC folder is NOT muted** | in this rack REC is the folder every part sums through; piece #4's REC was a second send (+6 dB on two tubas) and had to be muted | `render_reaper.js` |
| 8 | **The render is 32-bit FLOAT; the peak is measured on the FILE** (ebur128 true peak), then ONE plain gain brings it to −1 dBTP (never up), written as 24-bit | piece #4's first render clipped at +4.2 dBFS because the pre-flight measured a SUSTAINED loud passage while the peaks were SIMULTANEOUS ATTACKS, 11.6 dB higher; the fix was the master −6 → −13.5 and a second render. Float cannot clip, so there is no second render | `render_reaper.js` |
| 9 | **No limiter, no normalize** | the loudness range is the composition (piece #4: LRA 19.8) | same |
| 10 | **Proved off the file** — the length from the sample count, the first sound against the first onset | piece #4: 762.000 s exactly; the first sound 32 ms after the first onset (the sampler's attack, constant, not drift) | same |
| 11 | **The WAV's name = the IR's `source.score`** (`notation/audio/piece-septet.wav`) | the page's `detectRender` matches `<source.score>.*` | same |
| 12 | **The rack is never written** — the render is a COPY in its own tab (`reaper/piece-septet_render.rpp`), closed afterwards | the rack is the composer's | same |

## §3 By hand, if the bridge is not running

1. In Reaper: File → Save project as… `reaper/piece-septet_render.rpp` (a copy of the rack). Project settings → tempo **60**.
2. Actions → Show action list → New action → Load ReaScript → `reaper/place_piece-septet_midi.lua` → Run. It sets 60 BPM and places every
   part by name, building each item directly (no import prompt); its message lists each track with its note count. (Or drag
   `midi/piece-septet.mid` onto **Flute SI2** at 0:00 — its 14 tracks are the rack's order — answer Reaper's "Import 16-channel MIDI as…"
   with **Multichannel item on a single track**, and check each item landed on the track of its name.)
3. File → Render: master mix · bounds custom 0 → the last note + 6 s · WAV **32-bit float** · 48 kHz · stereo · no normalize.
4. Then the measure-and-gain step: `node tools/render_reaper.js --skip-render`.

## §4 Register

*(append-only)*

- **2026-09-13 — the first septet render** (RUNNING_LOG §453). `piece-septet.json` as saved 02:12. Capture: 37 627 frames, 20 565 messages,
  0 writes. Checks: trill notes 2066/2066, notes 1739/1739, 11 eaten silent, 0 unexplained, 0 hanging. Reaper: 14 items by name, counts
  equal. Render: 150 s · 630.100 s · float true peak **+2.0 dBTP** (would have clipped at 24-bit) · −22.7 LUFS · LRA 14.1 · gain **−3.0 dB** →
  **−1.0 dBTP** · first sound 3.7 ms after the first onset. The first attempt stopped on Reaper's MIDI-import prompt → items now built
  directly (`tools/reaper_midi_place.js`). Linked: ♪ render ✓ on the MAIN file. His ear on the sync: pending.
- **2026-09-16 — the re-render, PLAN 2i.9** (RUNNING_LOG §553–§554). `piece-septet.json` as saved 16:03. Capture: 37 627 frames, 20 789
  messages, 0 writes. Checks: trill notes 2066/2066, notes 1737/1737, 11 eaten silent, 0 hanging, **bend (e): 183 bent notes, every bend in
  place, none on a bent channel** (the check now reads each instrument's measured range — the Xsample parts bend ~1 st). Reaper: 14 items by
  name, counts equal. Render: 141 s · 630.100 s · float true peak **+1.9 dBTP** · −21.8 LUFS · LRA 13.8 · gain **−2.9 dB** → **−1.0 dBTP** ·
  first sound 3.7 ms after the first onset. The first attempt refused on the bridge guard's heartbeat race → the tool now waits for the
  heartbeat to name the render tab. His ear: pending.
- **2026-09-17 — the Bloom practice videos' renders, PLAN 2h.7** (RUNNING_LOG §599–§600; not the piece's WAV — `render_reaper.js --dir/--only/--out/
  --end/--gainWindow`, refused without an `--out` of another name). Pair recordings, 0 → 312 s, gain read in the used window and allowed UP (demo files
  only): `demo-bloom-bclvc.wav` +13.3 dB · `demo-bloom-vn1va.wav` +13.4 · `demo-bloom-flvn2.wav` +16.2. Held dyads `demo-bloom-heldmax` (six takes a
  pair, 0 → 660 s, 69 s). **Found:** every Xsample note-on lands ±1–2 c from its bend (the SI2 flute is exact) — one strike is a draw; the takes
  are picked by `tools/pick_bloom_takes.js`. `piece-septet.wav` sha unchanged throughout.
