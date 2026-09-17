# THE PORT — piece #5's stack into this repo (PLAN 0b · 0g · 0i)

> Written 2026-09-17 on Fable, from a measured survey of `septet_2026` at commit **`ba318e1`**
> (RUNNING_LOG §10). Written to be **executed cold by Opus** after a clear. The composer's
> instruction: *"just make careful plan, write it through independantly, let me know when
> time to switch model and build with opus, and check in with topline plan."*
>
> The precedent is piece #5's own port from #4 — `septet_2026/docs/RUNNING_LOG.md` §9 (0b),
> §12 (0g), §13 (0i). Read those three sections before starting; this plan follows their
> method and names only what DIFFERS.

`S` = `C:\Users\jwloy\GitHub\septet_2026` (the source — **READ-ONLY, never write there**).
`D` = `C:\Users\jwloy\GitHub\septet_LGMF_2026` (this repo).

---

## The top line

1. **Copy the whole engine, byte-exact** — app, sandbox, notation, print, video, tools, probes, the Reaper bridge. One commit.
2. **Prove the copy whole** — with Tempus's palette still in place: the app boots, the batteries run. Nothing committed.
3. **Re-palette** — seven new tracks, new ports, new names. One asserted patch script. One commit.
4. **Skeleton banks and recipes** — placeholders so every panel opens; the cello's measured data kept. One commit.
5. **Verify in the running app** on 5400 / 4900 — routes, save round trip, zero console errors, every panel.
6. **Notation half** — new ensemble registry; batteries on staged goldens; the exporters run.
7. **Prove save → IR** on a Lake George test save (0i).
8. **Docs + NITS + journal; commit; push.** Then report to the composer.

---

## What the survey found (the numbers this plan rests on)

- Source: 460 tracked files. Engine ≈ 12 MB; **piece data ≈ 38 MB and stays behind** (scores 14.7 MB · the rack 13.6 MB · actuals + takes 8 MB · the main IR page 5.4 MB).
- **The coupling is wider than last time.** In #4 the palette was the whole coupling. Piece #5 built tools that know instruments. Three kinds:
  - **A — the palette proper:** `sandbox/instruments.js` (123 mentions) · `composer.html` TRACKS, lane labels, the track `<select>`, the curve-button titles, the abbreviation map at l. 9777 · `notation/registry/ensemble.json` · ports in `server.js` l. 23, `sandbox/serve.js` l. 10, `start_score_server.bat`, `.claude/launch.json`.
  - **B — small per-instrument tables inside #5's tools:** `strike_drawer.js` l. 61 `OPEN_STRINGS`, l. 65 `STRIKE_DEFAULT`, l. 70–71 the articulation map · `cresc_card.js` l. 27 `STRIKE_DEFAULT` · `beating_calc.js` l. 25 `ORDER`, l. 283–284 breath / bow table · `INST_COL` in `beating_panel.js` l. 56, `strike_chords_ui.js` l. 25, `fill_ui.js` l. 29 (`COL`) · `trill_engine.js` l. 13 `STAND_IN` · `chord_run.js` l. 55 alias table.
  - **C — the piano as a ROLE** (`instKey === 'piano'`): `strike_sounds.js` · `strike_drawer.js` · `chord_run.js` · `strike_chords_ui.js` · `swell_ui.js` · `cresc_panel.js` · `morph_panel.js` (piano harmonics, lines → piano) · `cue_picker.js` · `piano_cues.js` · `piano_harmonics.js` · `cresc_strikes.js` · composer.html `cueLane()`. **This piece has no piano.** Every one of them looks the lane up with `findIndex` and gets −1.
- Measurement banks are keyed by instrument: `balance` · `technique_ranges` · `velocity_remap.instruments` · `bend_ranges` · `sample_lengths` (by technique → midi). Only the **cello's** rows mean anything here.
- The notation engine takes its instruments from **one file**, `notation/registry/ensemble.json` (clef · `transpose` · staves · groups). `notate_section` refuses to extract if it disagrees with the score's tracks. The engine already does treble / alto / bass, written pitch per part (the bass clarinet), a grand staff, A3 print, video.
- The notation batteries still read **tuba** pages by name (staged from #4 — `notation/ir/README.md`); #5's own tests read **#5's** pages (`piece-septet`, `strike1`, `trill1`, `0i-test-b`).
- `server.js` requires only `./snapshots.js` and `../tools/model_bank.js`; it honours `PORT` from the environment. `sandbox/serve.js` hard-codes 4800.
- `composer.html` is at **`layoutVersion: 5`** (l. 2433), migrations at l. 2455–2470. Default session `septet` (l. 342, 1434–1435, 3133, 3173, 3339).

---

## Decisions taken in this plan (each reversible; each in RUNNING_LOG §10)

- **P1 — Carry ALL of #5's tools. Remove nothing.** His rule: *"not leave out things now that might bite later."* The strikes drawer is the model for LG-7's pattern tool; the beating panel and the morph are the refrain (LG-6, LG-8); `time_containers.js` was built for this piece (#5 D31). *Rejected:* a carry / leave pass per tool — nothing is gained by leaving 1.4 MB of working code behind, and a missing module is a 404 in a page that loads 40 scripts.
- **P2 — The piano-role features go QUIET, they are not cut out.** With no piano lane they must do nothing and throw nothing. Verified per feature (step 5). Whether the percussionist inherits the struck role is a musical question for the composer (PLANNER) — not a port decision.
- **P3 — Lane order = orchestral score order** (#5 D10), which also keeps his pairs adjacent:

  | lane | `id` = `instKey` | label | short |
  |---|---|---|---|
  | 0 | `english_horn` | Eng. Horn | EH |
  | 1 | `bassoon` | Bassoon | Bsn |
  | 2 | `horn` | Horn | Hn |
  | 3 | `trumpet` | Trumpet | Tpt |
  | 4 | `percussion` | Percussion | Perc |
  | 5 | `cello` | Cello | Vc |
  | 6 | `double_bass` | D. Bass | Db |

  `META_LAYER` stays **7**; the curve windows stay layers **8 / 9 / 10** over lanes 4 / 5 / 6 (now Perc · Vc · Db) — lane-indexed already; only the button titles and comments name instruments.
- **P4 — The percussionist is ONE lane.** The instrument in hand is a technique on that track — #5's D6 (the flute doubling), reused.
- **P5 — Recipes are placeholders at 0b.** Every instrument gets at least `ord` so the panels and the placement engines run. **Nothing will sound until 0c / 0e** (libraries, the rack). The cello's recipe is #5's, verbatim.
- **P6 — Names:** default session and day-one stub **`lgmf`** (`scores/lgmf.json`); the piece chain **`piece-lgmf`**; `package.json` name `septet-lgmf-2026`; Reaper project guard `lgmf_rack` (the rack itself is 0e). Version labels and take names stay his.
- **P7 — `layoutVersion` → 6**, with a loud `console.warn` when a save's `tracks[].id` list differs from `TRACKS` (a #5 save opened here has seven lanes too — the lane COUNT cannot catch it). Never a silent drop (#5 §9).

---

## Step 1 — the copy, byte-exact (one commit)

**Guard first.** `git -C S status --short` — none of the paths below may be modified. Known-modified in `S` and **his**: `bank/panel_snapshots.json` · `scores/piece-septet.json` · `reaper/septet_rack.rpp`. If any OTHER path to be copied is modified or untracked: **stop and tell him.**

**Method (#5 §12):** list with `git -C S ls-files -- <paths>` (so loose and ignored files cannot come along) → tar pipe from `S`'s working tree → **`cmp` every file against its source; report N / N identical.** For `bank/panel_snapshots.json` alone use `git -C S show HEAD:bank/panel_snapshots.json` (his uncommitted takes stay his).

**Copy:**
- `score/` — all of it (`server.js` · `snapshots.js` · `palette.json` · `public/*` · `tools/*`)
- `sandbox/` — all three files
- `tools/` — **all, except the leave-list below**
- `notation/lib/` · `notation/registry/` · `notation/schema/` · `notation/app/` · `notation/glyph_sources/` · `notation/GLYPH_EXTENSION_CONTRACT.md` · `notation/audio/.gitignore`
- `print/score/build.sh` · `print/cover/make_cover.ps1` · `print/cover/make_cover_septet.ps1`
- `probes/` — the senders (`*.ps1`), the analyzers and self-tests (`*.py`), `cc7_map.json`
- `reaper/bridge/` (README, `bridge.lua`, `install.md`, `jobs/`) · `reaper/kontakt/*.lua`
- `bank/` **models and presets only:** `morph_models` · `morph_params` · `morph_pitches` · `morph_recipes` · `shape_presets` · `texture_models` · `texture_params` · `pulse_palette` · `blast_taxonomy` · `cluster_bank` · `harmonies` · `ostinato_timing_db_2p2p` · `trill_timing_db` (recorded human trill timings — performance data, not an instrument measurement) · `panel_snapshots` (HEAD) · `passages/README.md`
- `package.json` · `package-lock.json` · `start_score_server.bat` · `.claude/launch.json` · `docs/instrument_map.json`

**Leave behind, by name:**
- all of `scores/` · `midi/` · `bank/actuals/` · `bank/scattered_strikes.json` (the piano's recorded strikes) · `bank/passages/*.json`
- the instrument-measurement banks — `balance*.json` · `bend_ranges` · `sample_lengths*` · `technique_ranges` · `velocity_map*` · `velocity_proof*` · `velocity_remap` — **staged in step 2, skeletoned in step 4**
- `probes/*_schedule.json` · `probes/ping_ch*.json` (generated from #5's recipe — 7 000+ instrument mentions)
- `reaper/septet_rack.rpp` · `reaper/place_piece-septet_midi.lua`
- `notation/ir/*` pages and `index.json` · `notation/video/` · `print/cover/*.svg` + `contact-sheet.png` · `print/score/approved/`
- `tools/oneoff/` · `tools/gen_bloom_heldmax.js` · `tools/pick_bloom_takes.js` · `tools/check_bloom_demos.js` · `tools/morph_tuba_baseline.json`
- `docs/notation_instructions/` · `docs/plans/` · `docs/images/` · the Tempus call PDF · `docs/application/` — the instructions page comes across at phase 2b, as #5 took the tuba's.

`npm install` (resvg + optional pngjs). `node_modules/` is ignored already.

**Commit:** `0b.1: the engine copied byte-exact from piece #5 @ ba318e1 — N/N identical`. Push.

## Step 2 — prove the copy whole, before changing anything (nothing committed)

Tempus's palette is still in place, so the code should behave exactly as it does in `S`.

1. **Stage, do not commit:** the measurement banks left behind in step 1 · #5's pages `notation/ir/{piece-septet,strike1,trill1,0i-test-b}.ir.json` + `index.json` · the scores those pages name (read `source.score` in each; take `piece-septet.json` with `git show HEAD:`) · the tuba goldens from #4, by the recipe in `S/notation/ir/README.md`. **Write the staged list to the scratchpad; step 2 ends by deleting exactly that list and showing `git status`.**
2. **Boot the score server on 5400 by environment** (`PORT=5400`; add the `.claude/launch.json` entry early if needed). **Never 5300, never 4800 — those are his.** Do not start the sandbox yet (4800 is hard-coded until step 3).
3. **Run:** the tuba battery (`notation/ir/README.md`) · #5's tests (journal §2 "Tests": `test_morph_notation` 178 · `test_cross_staff` 79 · `test_surge_run` 30 · `test_step_dynamics --save` 15 · `test_septet_notation` 101 · `test_trills` 92 · `test_identity` 20 · `score/tools/check_cresc_panel` 35 · `morph_septet_check` · `check_fill` · `check_containers` · `check_cresc_deck`) · the pure-math checks (`accel_calc_check` · `beating_calc_check` · `cresc_check` · `harm_source_check` · `strike_chords_check` · `piano_cues_check` · `piano_harmonics_check`). **Never pass `--update` or `--save` flags that write fixtures**, except where the test's own name requires it and it writes only inside `D`.
4. **Any RED: run the same test in `S`, read-only.** Red there too = the source's, not the copy's → NITS. Red only here = a missing file → fix the copy list, amend step 1.
5. Table of results into RUNNING_LOG. Unstage. `git status` clean.

## Step 3 — the re-palette (one patch script, one commit)

**One script, in the scratchpad, that asserts every match count before it writes anything** (#5 §9: it refused to run once, rightly). Keep the script's text in RUNNING_LOG.

- **Kind A:** `composer.html` — title · `TRACKS` (P3) · seven lane `<div>` labels · the track `<select>` · curve-button titles · the abbreviation map (`eh` · `bsn` · `hn` · `tpt` · `perc` · `vc` · `db`) · the session default `septet` → `lgmf` at every site listed above · `layoutVersion` 6 + the P7 warn. `server.js` 5300 → **5400** · `sandbox/serve.js` 4800 → **4900** · `start_score_server.bat` (path + port) · `.claude/launch.json` → `score` 5400 · `sandbox` 4900 · `score-5401` · `tempus-5300` (his source app, for side-by-side) · `package.json` name + description · `tools/reaper_job.js` project guard → `lgmf_rack`.
- **Kind B:** every table gets the seven new keys. `OPEN_STRINGS`: cello `[36,43,50,57]` · double_bass `[28,33,38,43]`. `ORDER` = P3's order. Breath / bow: the four winds `breathS` (english horn 8 · bassoon 10 · horn 8 · trumpet 8 — provisional) · the two strings `bowS` (cello 10 as in #5 · double bass 8) · percussion neither. `INST_COL`: seven distinct colours, the pairs as near-hues (one family per pair, percussion neutral) — the same seven in all three files. `STAND_IN`: `{}`. Aliases: the new shorts. **`STRIKE_DEFAULT` and the articulation map may only name technique keys that EXIST in step 4's recipes** — write a ten-line check that asserts it, and keep it as `tools/palette_check.js`.
- **Kind C:** no edits expected. If step 5 finds a throw on a missing piano lane, the fix is a guard at that one call site (return early, status line "no piano lane in this piece"), in the same commit as its proof.
- **Comments that name #5's instruments stay** unless they would mislead about behaviour — honest provenance, as #5 kept "10 tubas".
- **Grep audit for stragglers:** `5300` · `4800` · `septet_rack` · `'septet'` · `piece-septet` · `flute` · `bass_clarinet` · `violin1` · `violin2` · `viola` · `'piano'`. Each remaining hit is classified in RUNNING_LOG: comment · kind-C role (quiet) · a tool that reads #5's piece by name (→ NITS) · **a miss (fix)**.

**Commit:** `0b.2: re-palette — seven Lake George tracks, ports 5400/4900, layoutVersion 6`. Push.

## Step 4 — recipes and skeleton banks (one commit)

- **`sandbox/instruments.js`** rewritten in #5's exact shape (`{label, port, rangeLow, rangeHigh, techniques:[{key, label, channel, port?, cc0?, ks?, range}]}` plus whatever flags #5's consumers read — `beating`, `playerBendSt`, `curveTechniques`, `balanceDb`; read #5's file for the full set). **Every value marked `PROVISIONAL — 0c / 0e` in a comment.**
  - `cello` — **#5's entry verbatim.**
  - `bassoon` · `horn` · `trumpet` — SI2. Technique keys seeded from the SI2 manual's lists (`for_bass_clarinet_harp_and_accordion/docs/manuals/extracted/IRCAM_Solo_Instruments_2_manual.txt`, the instrument sections from l. 1555 · 1587 · 1673), in the shape of #5's SI2 flute entry and #4's tuba entry. Channels provisional. Ranges from the manual, sounding pitch.
  - `double_bass` — **Xsample** (journal D6, composer 2026-09-17). The cello's entry is the model: same mechanism (CC0 articulation select, the channel bank of #5's D11), its own port, range 28–67 sounding. **Copy the cello's technique list as the placeholder and mark every CC0 value `VERIFY at 0c`** — the double bass's preset numbers are not known to be the cello's.
  - `english_horn` — **being acquired by the composer now** (D6; he did not name the library — the Xsample catalog lists one, `Xsample_Library_en.txt` l. 149). Placeholder: `ord`, range 52–84. If it is Xsample, the model at 0c is #5's bass clarinet entry (CC0 presets, CC1 MW dynamics).
  - `percussion` — **Spitfire Abbey Road Orchestra (ARO) Percussion**, the library of piece #2 (D6; #2's journal decision 4: Metal · High · Low volumes, Spitfire's own plugin — NOT Kontakt, NOT UVI; its maps are in `composition_for_two_pianos_and_two_percussion/docs/instrument_map.json`). **Plus a bowed vibraphone — a library he has still to acquire** (ARO has no tuned mallets). Placeholder: one technique `hit`, `beating: false`, range 21–108 so `laneCanPlay` never blocks it; a comment naming both libraries. The real entry is 0c's, built from #2's map.
  - Port names provisional, one per instrument, loopMIDI-style, distinct from #5's.
- **Skeleton banks — empty but valid, the key sets of #5's files:** `balance` · `bend_ranges` · `technique_ranges` · `velocity_remap` · `sample_lengths` · `scattered_strikes`. **Where a file is keyed by instrument, keep #5's `cello` rows** and drop the rest; put a `_provenance` line in each. Then confirm each loader accepts it: `composer.html` · `strike_drawer.js` · `velocity_remap.js` · `texture_engine.js` · `trill_engine.js` · `tools/model_bank.js` · `tools/notate_section.js`.
- **`bank/panel_snapshots.json`:** open each panel's take list and load one Tempus take per panel. If a take throws against the new palette, move the file to `bank/reference/panel_snapshots_tempus.json` and start an empty valid one. Either way RUNNING_LOG says which.
- **`scores/lgmf.json`** — the day-one stub, **written by the running app** (not by hand), as #5 §10.
- `node tools/palette_check.js` green.

**Commit:** `0b.3: provisional recipes (cello carried), skeleton banks, the day-one stub`. Push.

## Step 5 — verified in the running app (AI_METHODOLOGY rule 4)

Servers from `.claude/launch.json` (`score` 5400 · `sandbox` 4900). **Principles 8, 9, 16:** never his ports · never save from the AI's pane into a real score — session `untitled` or a `zz-ai-` copy from the FIRST command · the in-app browser has no Web MIDI and a hidden pane never fires `requestAnimationFrame`.

- **Route battery:** every `<script src>` and every `/api/*` the page fetches, the static `/docs` `/bank` `/probes` `/notation` `/sandbox/instruments.js` — all 200. Count them.
- **Save API round trip** on a throwaway name: save → `versioned:false` · save → `versioned:true` · list · load · versions · discard. Files seen on disk, then deleted.
- **The page:** `Composer initialized`, **zero console errors** on a fresh tab · `TRACKS` = the seven ids · `META_LAYER` 7 · lanes = 7 + META · the select = 7 + META · the record panel follows the lane's instrument · ranges as written · `laneCanPlay`: english horn cannot take MIDI 30, double bass can; trumpet can take 80.
- **Every panel opens, no errors:** Morph · Texture · Pulse · MT · Beating · the strikes drawer (all its columns) · Crescendo · the note card · Fill · Containers · the curve windows A / B / C.
- **P2, feature by feature:** with no piano lane — the drawer's *Hear piano* · *piano harmonics* · *lines → piano* · the crescendo panel's piano row · `chord_run` with `piano:true` · the cue bar. Each: **no throw, a plain status or nothing.**
- **P7:** open a staged copy of a #5 save → the warn fires; nothing is silently dropped. Unstage.
- **Sandbox** on 4900: the instrument menu = the seven; `/motives` 200.

Results as a table in RUNNING_LOG. **Defects that only running found get their own paragraph** — last time there were two.

## Step 6 — the notation half (PLAN 0g; one commit)

- **`notation/registry/ensemble.json` rewritten** — `metaLayer` 7 · `curveLayers` [8,9,10] · parts:

  | part | id | short | clef | transpose | note |
  |---|---|---|---|---|---|
  | 0 | english_horn | EH | treble | **+7** | in F: written a fifth above sounding |
  | 1 | bassoon | Bsn | bass | — | tenor clef → the 2a list |
  | 2 | horn | Hn | treble | **+7** | in F |
  | 3 | trumpet | Tpt | treble | — | SI2's is in C; a B♭ part is his call → Q for 2a |
  | 4 | percussion | Perc | treble *(placeholder)* | — | percussion clef / staff → the 2a list |
  | 5 | cello | Vc | bass | — | as #5 |
  | 6 | double_bass | Db | bass | **+12** | written an octave above sounding |

  Groups: bracket [0,1] · bracket [2,3] · bracket [5,6]. No grand staff, all weights 1. **Check the sign convention against #5's bass clarinet (`transpose: 14`, written ABOVE sounding) before trusting this table.**
- `notation/registry/techniques.json` — **leave as is**; its keys are technique names. Marks for new techniques come with 0c.
- `notation/ir/README.md` — rewritten for this repo: what lives there · the staging recipe for BOTH sets of goldens (#4's tuba pages, #5's pages) · step 2's results.
- **Batteries on staged goldens, after the re-palette.** Expected: whatever was green in step 2 and does not name #5's instruments stays green. **Every new RED is classified** — *needs this piece's pages / recipes* (→ NITS, regenerate with `--update` at 2a) or *a port defect* (→ fix).
- **The exporters run:** `export_print --pages 1-2` on a staged page · `export_video --probe` one frame through resvg, looked at.
- **The 2a adaptation list for THIS piece, recorded in PLAN 0g so it does not bite:** tenor clef (bassoon, high cello) · a percussion clef, staff types (one-line / five-line) and unpitched noteheads · mute marks (con sord. / senza; four trumpet mutes) · a B♭ trumpet part if he wants one · technique marks for every new instrument · **animated conductions (LG-3) — a new animated-object kind** · the bouncing balls per player in their own tempo (LG-5 — the GC arcs exist) · the bracket groups.

**Commit:** `0g: the notation/IR stack — ensemble registry for seven new parts, batteries classified, exporters run`. Push.

## Step 7 — save → IR proved on a Lake George save (PLAN 0i; one commit)

#5 §13, step for step. A 30-second test save **written by the app's own insert paths and `saveSession()`**: three lanes + META — english horn (`ord` notes, one with a three-node crescendo) · trumpet (a five-note run under one `groupId`, its META shape on layer 7) · double bass (`ord` long · `pizz`) · one marker. → `node tools/notate_section.js --score 0i-test --w0 0 --w1 30 --parts 0-6` → `node tools/ir_validate.js notation/ir/0i-test.ir.json --against-source --complete` (**a PATH, not an id**) → the page in the notation app's picker, rendering: **the english horn and the horn a fifth up, the double bass an octave up, the right clefs, the three brackets.** Read every failure; fix the save side now; file classifier work under 2a. Keep the save and the page as evidence.

**Commit:** `0i: the save → IR contract proved on an LGMF save`. Push.

## Step 8 — docs, NITS, journal

- **Docs that travel with the code**, one provenance line prepended each (*"describes the tool as built for piece #5; the instrument names are #5's"*): `NAMING` · `STRIKES_TOOL` · `TRILLS_TOOL` · `BEATING_TOOL` · `CRESCENDO` · `CURVE_LOOK` · `PANEL_CAPTURES` · `RENDER` · `REAPER_CONTROL` · `SAMPLER_QUIRKS` · `NOTATION_STANDARDS` · `NOTATION_IDENTITY` · `NOTATION_WORKFLOW` · `GLYPH_SIZING` · `TRILL_NOTATION_SPEC` · `SWEEP_LIST`. `NAMING.md` §1 gets this piece's names (P6) — the one doc edited beyond its provenance line.
- **NITS:** for every copied file, grep `S/docs/NITS.md` for its name and bring the live bullets, dated. Add this port's: the kind-C features are quiet, not removed · comments naming #5's instruments · tools that read #5's piece by name · every classified RED.
- **CLAUDE.md:** the "State of the port" line · **§ Apps rewritten from #5's**, with its warnings. **PLAN.md:** 0b · 0g · 0i `done` with their RUNNING_LOG sections. **Journal:** §2 · §6 Done · principles that bit. **PLANNER:** NOW ►. **RUNNING_LOG:** one section per step, written as each step ends — not at the end.
- **Report to the composer:** what runs · what is quiet and why · what is provisional · what he needs to do next (name the percussion; libraries; the rack — 0c / 0e).

---

## What this plan deliberately does not do

- **No sound, and NO REAPER SETUP** — he asked (2026-09-17: *"are we setting up reaper in this build or later"*); the answer given was **later, as the very next step** (0c + 0e together, with him at the machine). No rack, no loopMIDI ports (0c · 0d · 0e). The bridge's CODE arrives in step 1 and the project guard is renamed in step 3; nothing talks to Reaper. After this port the app opens and saves and notates; it does not play.
- **No new tools** (LG-5's abstraction, LG-7's pattern tool, LG-3's conductions, LG-8's arrive-and-hold). Phase 1, at his word.
- **No shared engine package.** Parked in RUNNING_LOG §5.
- **Nothing in `S` is written, staged, moved or saved — ever.**

## When to stop and ask him

- A path to be copied is modified or untracked in `S`.
- A battery is red here and green in `S`, and the cause is not a missing file.
- A kind-C feature cannot be made quiet with a one-line guard.
- Anything that would need a decision about the music.
