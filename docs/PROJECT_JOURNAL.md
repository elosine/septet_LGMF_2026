# PROJECT JOURNAL — septet LGMF 2026 (the Lake George septet)

> One file. Seven sections. Everything important lives here.
> §2 is read at every session start — keep it ~40 lines; trim old sessions to one line each.
> The lab journal (`RUNNING_LOG.md`) is the raw trail underneath; this is the curated state.

---

## §1 Quick-Start

- **The piece:** english horn + bassoon · horn + trumpet · cello + double bass · percussion
  (D1) — three pairs and a percussionist, for the **Lake George Music Festival 2026 call**.
  **The call is unread at the composer's word** — deadline, duration cap, score format unknown.
- **Lineage:** composition #6. Follows #5 `septet_2026` (the Tempus septet, submission
  complete 2026-09-17), which was ported from #4 `for_seven_tubas`.
- **The stack:** piece #5's, by copy-forward, palette rewritten (D3) — **ported 2026-09-17 and
  running** (0b · 0g · 0i; RUNNING_LOG §12–§18). Same delivery format as #4 and #5 (D2).
  `node score/server.js` → **:5400**/composer.html · `node sandbox/serve.js` → **:4900**.
  **It does not sound yet** — placeholder recipes, no rack (0c + 0e, next).
- **Libraries (D6):** SI2 bassoon · horn · trumpet — Xsample cello (#5's recipe, carried whole,
  the only one ever heard) + double bass — Spitfire ARO percussion — english horn being
  acquired — a bowed vibraphone still to acquire.
- **Phases (#5's shape):** 0 setup → 1 compose → 2 notate (2a engine · 2b presentation
  score) → 3 performance score → 4 submission.
- **The sketch pad** `docs/COMPOSITION_NOTES.md` opens with **LG-1 … LG-8**, the eight Lake
  George notes he made while writing piece #5, verbatim: pairs · delicate and quiet ·
  animated conductions · multitempo pointillism · a rondo with the morph as refrain · the
  pattern / thinning tool · a counterpoint of timbres after Sciarrino · morph to a held beating.
- **Reference repos** (read-only, additional working dirs): #5 · #4 · #3 · #2 · #1. #3 was
  attached mid-session 2026-09-17 by a folder request — it holds the extracted sampler
  manuals; if a later session does not list it, request it again. Consult per named question only.
  **#5 has the composer's own uncommitted files — never touch anything there.**

### Where the record of the last port lives (all in `C:\Users\jwloy\GitHub\septet_2026`)

- `docs/RUNNING_LOG.md` §1–§13 — the port as it happened: §2 the coupling survey · §3 his
  plan in his words · §4 what was rejected · §7 the kit · **§9 PLAN 0b, the composer
  module** · §10 the day-one stub · **§12 PLAN 0g, the notation/IR stack** · §13 PLAN 0i.
- `docs/PROJECT_JOURNAL.md` §1 "Map of piece #4 — what the port inherits" · §4 D1 · D2 · D3 ·
  D5 · D9.
- `docs/PLAN.md` § 0 — the item list 0a–0k, each with its why.
- This repo's `RUNNING_LOG.md` §2 is the digest of all three.

---

## §2 Resume Here

**FIRST — HIS STANDING RULE (2026-09-11, carried from #5):** after `/clear` + `/postclear`:
play back, then **STOP and ask**. No edits, no builds, no tool calls beyond the resume
reads. Start only on his word. *(At `/session-start`: orient, agree the agenda, then work.)*

### LAST SESSION — 2026-09-17 (session 1; Fable to plan, Opus to build, no clear) — **THE PORT IS DONE**

- **0a the PM kit**, the standing practices carried whole (`fe9f8e5`).
- **D1** instrumentation · **D2** format · **D3** copy-forward from #5 · **D4** ports 5400/4900 ·
  **D5** push after every commit · **D6** the libraries.
- His eight Lake George notes surfaced from #5's sketch pad → `COMPOSITION_NOTES.md` **LG-1 … LG-8**,
  plus **LG-9**, the bowed vibraphone.
- **The port planned** (`docs/plans/PORT_FROM_TEMPUS.md`) from a measured survey, then **executed
  in full: 0b · 0g · 0i all closed** — RUNNING_LOG §12–§18, six commits, all pushed.

**What exists now:** the composer app on **5400**, the sandbox on **4900**, the notation/IR stack,
print and video — all on the seven tracks **EH · Bsn · Hn · Tpt · Perc · Vc · Db**, verified in the
running app (71/71 routes, zero console errors, every panel, a save round trip). A save has been
proved through to a notation page (`lgmf-0i`) with the transposing parts at written pitch.
**Nothing sounds, by design** — the recipes are placeholders and there is no rack.

**Two things the port found that reading would not have:**
1. **A missing test dependency** (`tools/morph_tuba_baseline.json`) — the plan's own leave-list
   was wrong by one file, and `cmp` cannot see that. Found because the copy was run before it was
   changed (§13).
2. **A realization override that would have THROWN** in print and the jury video: `layout.js`
   `ensembleFor()` raises on an override for a part that does not exist, and the inherited
   `video-jury` realization named `bass_clarinet` (§17).

### THIS SESSION, after the clear — 2026-09-17 (session 1 cont., Fable) — **0c BEGUN: the percussion scaffolding**

- His word: *"no need for planning protocol, let's just dig in"* — the three-phase method was NOT run for 0c/0e.
- **Db → Xsample confirmed** (*"yes double bass xsample"*). The other three checkpoint questions: percussion
  instruments still unchosen (*"haven't decided"*); english horn's library still unnamed; build with the five now.
- **D7 — the percussion design:** one port `LGPerc`, one channel per instrument (one Spitfire instance = one Reaper
  track), techniques = instrument × beater, GENERATED from a catalog + a selection. RUNNING_LOG §19.
- **Delivered:** `bank/aro_percussion_catalog.json` (piece #2's ARO map carried: 78 instruments, 35 verified · 39
  skeleton) · `bank/perc_selection.json` (EMPTY) · `tools/apply_perc.js` (proved: 2 instruments → 4 techniques
  36–93; a skeleton refused; the empty selection leaves the placeholder) · `palette_check` check 6 (159).
- **He created `reaper/LGMF_rack.rpp`** — an empty Reaper session, the rack's home. Untracked; his.
- **The loopMIDI ports were asked for and not yet confirmed** — `LGEngHorn · LGBassoon · LGHorn · LGTrumpet ·
  LGPerc · LGCello · LGBass`, case-exact.

### LATER, THE SAME SITTING — 0e/0c: the rack built, the three SI2 instruments complete as text (RUNNING_LOG §20–§25)

- **Ten `LG` ports** (the seven + `LGBassoonb · LGHornb · LGTrumpetb`), verified by name · **ten tracks** in score order,
  made by `reaper/bridge/jobs/make_tracks.lua` — input, monitoring, arm, sampler, all read back.
- **The bridge is alive on this rack** (the project guard's case fixed). **`tools/uvi_state.js` had a real bug** — the state
  header on this machine is 496 bytes with big-endian size fields; nothing it pushed ever applied. Fixed, proven (§22).
- **UVI, settled:** a `<Program>` is the program itself; a path alone loads nothing. He loaded **56 presets once each**
  (bassoon 18 · horn 18 · trumpet 20); everything after was text — nine Ordinario curve copies cloned across instances,
  65 parts baselined (Convolver on · EQ off · Maximizer off · +6 dB), each proven with the meters.
- **The recipes from the rack:** `tools/apply_uvi_parts.js` — the recipe names the preset (+ ks), the rack gives the part;
  bassoon 22 · horn 25 · trumpet 35 techniques placed; `channels.curve` = the copies on the `b` port. **KS notes and the
  mutes' KS order are provisional** (the flute's pattern / the manual's alphabet) until read on the red keys.
- **D8** the english horn = Xsample · **D9** the rack layout (§23).
- **Protocol learned:** a push replaces an instance's whole state — "done loading" / "yours again" before any push.

### THEN — the Kontakt three's curve slots (RUNNING_LOG §26–§29)

- His three `.nki` loads (English Horn XS · Cello XS · Bass XS) — the Kontakt state is opaque as text (§26), so the names came from the script's read-back.
- `curve_slots.lua` rewritten for this rack and made SELF-REPORTING (a START file, everything under pcall, a result file always). Its first run "did nothing": a flattened backslash → a Lua 5.4 parse error — found by **parse-checking through the bridge** (`reaper_job.js -e loadfile`), now the rule for every Kontakt script (§28, bridge README).
- **Four slots [A] 1–4 in each of the three, proven by read-back; his CTRL+S 22:30** (§29). The saved states are four nki bodies each.
- His "for after" questions answered from the record (§27): the extra Xsample instances = D11's four slots (done now) · percussion = D7 (no multi; one ARO instance per instrument; his list is what is missing) · the strikes track = a level lane for a quiet strike, not needed yet, decide at 0d.
- Verified at his word: #5's bass clarinet and strings had four slots for CC7 — D11, §60, §1168 (§28).

### THEN — the Xsample recipes real; Spitfire read and pushed as text (RUNNING_LOG §30–§36)

- **LG-10 — the percussion named:** small metals — finger cymbals · bell tree · sleigh/indian bells · triangles · tambourines. All three ARO volumes are installed; the library is `C:/Users/jwloy/Spitfire/Spitfire Audio - Abbey Road Orchestra/` (Patches · Presets · Samples); its patch files are ENCRYPTED, so key maps cannot be read from disk (§33).
- **The Xsample recipes are real (§32):** the english horn's 36 presets from his own Preset Menu (`xsEnglishHornTechs`, 13 NEW keys marked) · the double bass's 88 verified identical to the cello's from its own menu · four strike tables pointed at real keys · palette 159 / written-pitch 8 green.
- **Spitfire's state is XML (§34):** a (C) preset holds its family's instruments as ARTICULATIONS with keyswitch triggers (Small Metals (C) = 14, keyswitches 0–13, his five inside it). **`tools/aro_state.js` (§35):** info · decode · encode --push · roundtrip · edit · clone; every push read back. **Cloning a loaded preset to a new track: PROVEN.** Changing to a family never loaded: **refused four ways** — the plugin restores only what it has loaded; the host offers 0 presets (§36). **Rule, as UVI's: one GUI load per family, then text.** The state bank: `bank/aro_states/` — `small_metals_C.aro.xml` captured.
- His three "for after" questions answered from the record (§27); the loopMIDI-ports note in NITS; the joined-base64 decoder bug found and fixed (§34 — Kontakt byte counts in §26/§29 are approximate).

### SESSION 2 — 2026-09-18 (Fable, then Opus; one clear at the start) — **THE PERCUSSION IS BUILT**

- **Fourteen percussion tracks**, `LGPerc` ch 1–14 (RUNNING_LOG §37–§38). The first five made empty by
  `reaper/bridge/jobs/make_perc_tracks.lua`; the next nine **duplicated from his own `Template` track** at his word
  (*"please use the track called Template to duplicate"*). He selected every instrument in the plugin; the AI read all
  fourteen back and **banked eight (C) preset states** — any of them is now reproducible as text.
  `bank/perc_rack.json` records the rack as read.
- **All fourteen key maps done** (§41–§42) — Finger Cymbals (36 · 38, +24) measured; Bell Tree (six glisses, white keys
  36–45, +24) and Shakers Pairs (**the only black-key one**: A 36–39, B 48–51, both +24, four samples in all) from his
  hover. **The catalog's first entries not carried from piece #2**; verified 35 → 38. The bass drum counted as mapped —
  Gran Cassa is his piece-#2 Bass Drum (§40).
- **A probe lied and was caught** (§42): a BOM in the watch chunk made the bridge's `loadfile` fail silently, so every note
  read the PREVIOUS note's stale outbox file. §41's "sweeps fail on long sounds" is withdrawn as stated. Then his word:
  *"we killed the sweeps... no more sweeps."*
- **His scope call (§43): volume normalization is the ONLY pre-composition item.** Ranges, lengths, the REC track, the
  percussion port's last two channels and first-sound-from-the-app are all picked up during composing. And it is a
  **probe job** — Reaper-side, no browser and no recipe (he corrected the AI on this; the AI had read a phase-0 GATE as a
  precondition).
- **Two working-method additions, his words, now in `~/.claude/CLAUDE.md` + this repo's CLAUDE.md § THE RHYTHM + memory:**
  the **shape of a working reply** (goal heading · ✓ trail · the one thing · footnotes quarantined · no "what's next"
  unless asked · model/clear advice only at a real switch point) and **no unasked verification** (*"avoid unnessary extra
  work unless asked for... unless we write these into a plan as necessary verifications and qc"*).
- **Five composition notes captured verbatim** — **LG-11** (multitempo: connect patterns by accelerating / decelerating
  some parts) · **LG-12** (the strikes drawer takes the multitempo patterns; click a note to mute or re-orchestrate;
  reshuffle) · and for the NEXT piece, **NX-1 … NX-6**: "overdrive" is for the **Switch ensemble** (NX-4 names the
  instrumentation), accented long tones beating against generated sines, rapid one-bow string arpeggios, ostinatos on a
  pitch cell, and **a new notation writing the glissando as BEATING SPEED or timbre rather than pitch deviation** (NX-6).

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| **HIS** | **Look at it:** `node score/server.js` → http://localhost:5400/composer.html — his seven lanes. And the notation page: `/notation/app/notation.html` → `lgmf-0i` | — | — |
| **► N1** | **0c + 0e — IN PROGRESS, him at the machine.** DONE: ten ports · ten tracks · the three SI2 instruments complete as text (§20–§25). **The Kontakt three:** (1) the three `.nki` loaded · (2) `curve_slots.lua` run in each — four slots [A] 1–4 in EH · Vc · Db, proven by read-back, rack saved (§26–§29). (3) the Xsample recipes DONE — the english horn's 36 presets from his own Preset Menu, the double bass's 88 verified identical to the cello's, both checks green (§32). Spitfire read and pushed as text, the small metals loaded once and banked (§30–§36). **2026-09-18, session 2 (§37–§39): the clone-and-change experiments were DROPPED at his word — the script makes the tracks, he selects. The percussion rack stands: fourteen instrument tracks on `LGPerc` ch 1–14 (`make_perc_tracks.lua`; new rows duplicate his `Template`), his loads read, eight (C) presets banked, the rack as read in `bank/perc_rack.json`. All fourteen key maps DONE (§40–§42).** What remains of 0c/0e is picked up during composing at his call (§43): the percussion recipe (`perc_selection.json` — one script run when he picks the selection) · the REC track · the port's last two channels · **first sound from the APP (browser → port, never run for this piece; must be HIS Chrome — the AI's browser has no Web MIDI)** | — | — |
| **► N2** | **0d — ensemble balance. The ONLY pre-composition item (his call, §43).** **DESIGNED and BUILT 2026-09-18 (§44–§47).** His restatement: the goal is *"realistic arual feedback … if I'm listening to a chord needs to be balanced in ensemble so I can hear the harmony realisticly"*, the piece *"mostly quiet with potentially some loud parts"* (LG-13), a **baseline** now and refinement when he designs the sounds. **Three levers (§46):** the fader (one dB per track) · velocity (picks the sample, carries the dynamic) · CC7 (the fine trim, and a held note's shape) — never CC7 on Spitfire percussion (§42). **Both layers at his word** (§45): the **trim** (layer 1) and the **remap** (layer 2) from ONE run, anchored at the **QUIET level** (his A). **Built:** `tools/balance_schedule.js` (652 notes / 23.6 min; four roles; three representative keys per percussion instrument; the bowed vibraphone wired in for when it arrives, LG-15) · `reaper/bridge/jobs/make_rec_track.lua` (a receive bus, not a folder — it must not reparent his 26 tracks) · `probes/analyze_lgmf_balance.py` (#5's loudness core; a 150 ms window for one-shots; the spread at full after the trims). **NEXT, and it needs him at the machine:** 0d.1 — **parse-check the Lua through the bridge, then run it** (§28's rule; there is no Lua on this machine) · then the run: record on, `probes/balance_probe.ps1`, record off, ~24 min untouched · then 0d.3 analyze → 0d.4 trims on the faders → 0d.5 the remap into the app → **0d.6 his ear on a chord** (the one verification the plan names as required) | Opus to build; **his ear to judge** | no |
| N3 | **Phase 1, composing.** The tools he has already named: the multitempo machinery abstracted with figures per beat (LG-5), **with patterns connected by accelerating / decelerating some parts (LG-11, 2026-09-18)** and **offered as a rhythm choice in the strikes drawer, the final pattern editable by click — mute / re-orchestrate a note — and reshuffled (LG-12, 2026-09-18)** · the pattern tool with thinning (LG-7) · the morph that arrives at a beating and holds (LG-8) · animated conductions (LG-3) | Fable to design · Opus to build | yes |
| N4 | **Read the LGMF call** — when he says. It fills the plan's empty timeline table | Fable | no |

**Open at session end — (mid-session checkpoint, 2026-09-18, before the clear):**

- **The task:** phase 0. **The machine is BUILT** — ten instrument tracks + fourteen percussion tracks, every instrument
  configured as text, all fourteen percussion key maps done (§37–§42). **His scope call (§43): volume normalization (0d) is
  the ONLY pre-composition item**; everything else in 0c/0e is picked up during composing. **Nothing has been heard by him
  yet** — the AI's probes have metered individual tracks, but no balanced listening has happened.
- **Latest deliverables:** `reaper/bridge/jobs/make_perc_tracks.lua` (fourteen rows; a new row DUPLICATES his `Template`
  track, existing tracks are read-back only) · `bank/perc_rack.json` (the rack as read: track · channel · preset · selected
  articulation · banked state · catalog entry) · `bank/aro_states/` (eight (C) preset states) ·
  `bank/aro_percussion_catalog.json` (Finger Cymbals · Bell Tree · Shakers Pairs now `verified`) · RUNNING_LOG §37–§43.
- **THE NEXT CONCRETE STEP — 0d.1, the REC track, and it needs his Reaper.** The probe is designed (§44–§46) and built
  (§47): the schedule, the REC-track job and the analyzer all exist and the first two were checked locally (652 notes,
  23.6 min; `balance_probe.ps1 -DryRun` resolves all ten ports; the percussion carries no CC7). What is left is the part
  that cannot be done without him:
  1. **Parse-check `reaper/bridge/jobs/make_rec_track.lua` through the bridge, THEN run it** —
     `node tools/reaper_job.js -e "loadfile('reaper/bridge/jobs/make_rec_track.lua')"` first. **There is no Lua on this
     machine**, so the script has never been parsed; §28's rule exists because of exactly this, and §42 is what a silent
     failure costs. The job is self-reporting — read `ok` and the read-back, do not assume.
  2. **Run it:** record on, `probes/balance_probe.ps1`, record off. ~24 minutes in which the rack must not be touched.
     Then `python probes/analyze_lgmf_balance.py <the wav>` → `bank/balance.json`.
  3. **Then 0d.4 / 0d.5 / 0d.6** — the trims onto the faders and into `sandbox/instruments.js` as `balanceDb` (⚠ the cello
     still carries #5's `-1` there, a copy-forward leftover), the remap computed and wired into the app, and **his ear on a
     chord at the quiet level.** His ear settles it; the numbers do not.
  **Two traps still paid for and honoured in the built tools:** any Lua sent to the bridge is written with
  `UTF8Encoding($false)` — a BOM makes `loadfile` fail silently and every read then returns the PREVIOUS note's stale file
  (§42) · **CC7 is never sent to `LGPerc`** (Spitfire binds it to global gain), and `probes/port_note_probe.ps1` must not be
  reused as-is because it sends CC7 as a residue guard.
- **`Resume reads:`**
  - `docs/PLAN.md` **0d** — the six-step running order, and what moved to phase 1.
  - RUNNING_LOG **§44–§47** — the design (§44 the two layers and why loudness not peak · §45 the anchor · §46 the three
    levers, and the Ferneyhough footnote · §47 what was built and what is unchecked).
  - `docs/COMPOSITION_NOTES.md` **LG-13 · LG-14 · LG-15** — the piece's dynamic, the parenthesized-dynamics device, and
    **the opening** (instruments beating against the bowed vibraphone, which is not installed yet and must join the probe).

**Open questions:**
- **Q1b — libraries.** Closed but one: english horn = Xsample (D8) · all three ARO volumes installed (§33) · the
  percussion named (LG-10) · **a bowed vibraphone, still to acquire (LG-9).**
- **Q2 — the call.** LGMF 2026, unread at his word: *"don't need to look it up now."*
- **Musical, his, not urgent** (PLANNER): "continuous, not sparse" (LG-2) against "lots of rests"
  (LG-4/5/8) · does the piece open with a morph (LG-1) or a bespoke section (LG-6) · **who, if
  anyone, inherits the piano's struck role** — the port left those features quiet, not removed ·
  the presentation score's pitch form (in C, or transposed?) at 2b.

**Blockers:** none.

**Deliberately uncommitted:** nothing.

**Standing warnings for this repo:** ⚠ `export_print` and `export_video` share
`Coords.ensembleFrame` — a change to the frame math moves BOTH · never bind **5300** or **4800**,
they are piece #5's · the loopMIDI ports are `LG`-prefixed for the same reason · the AI never
saves from its own browser pane (principle 9) · the in-app browser has no Web MIDI.

**Checks this piece owns:** `node tools/palette_check.js` (159) · `node tools/test_written_pitch.js`
(8 + a control). Run both after any change to `TRACKS`, `sandbox/instruments.js` or
`notation/registry/ensemble.json`. **Every other battery's status, and why, is in `docs/NITS.md`.**

---

## §3 Principles

*(Lessons never to repeat. Numbered, append-only. **1–18 are inherited from piece #5's §3**
— one line each here; the full text, dates and lab-journal sections are in
`septet_2026/docs/PROJECT_JOURNAL.md` §3. Most bite only once the code is here. Verified in
this repo only when they bite.)*

1. Check Reaper input monitoring before blaming the instrument (#3 P1).
2. When a working reference exists, diff the files; don't iterate guesses (#3 P2).
3. The IR schema is a gate on the file — a new overlay kind enters the schema in the same
   commit or the page is rejected and deleted. Snapshot first (#4).
4. Never `git add -A` — stage explicit paths (#4 D30).
5. Only delete IDs you created in the same breath (#4).
6. MIDI thru must never listen to the loopMIDI output ports (#4).
7. Schedule playback with a ~150 ms lead (#4).
8. Object ids are per save — never delete or replace by id alone (#5).
9. Verify against the composer's running server; never hold his port, never save from the
   AI's pane; a hidden pane never fires `requestAnimationFrame` (#5).
10. When downstream meters freeze at identical values, dump mute / solo / routing first (#5).
11. Learn a plugin's vocabulary by diffing the GUI's change, not by guessing from strings (#5).
12. Measure the layer that reaches the INSTRUMENT, not the layer you built. Print the MIDI (#5).
13. Never queue what cannot be un-queued; Chrome does not implement `MIDIOutput.clear()` (#5).
14. Where a note is started by one piece of routing, it is stopped by the same one (#5).
15. Write the assertion after the number, never before it (#5).
16. Build on a `zz-ai-` copy from the FIRST command, not the second (#5).
17. The notehead's left edge is the moment; the go line marks displacement (#5 D49).
18. A checker that tests one half of a rule is worse than no checker. When a rule names two
    classes, the gate tests both or says in writing which it does not (#5).

*This piece's own:*

19. **A copy-forward carries the standing RULES whole, not only the code** (2026-09-17; the
    lesson of #5's dropped RHYTHM, RUNNING_LOG §2). At every port, check the new CLAUDE.md
    against the source's heading by heading.
20. **Prove the copy whole BEFORE changing it** (2026-09-17, RUNNING_LOG §13). Piece #5 copied,
    patched, then verified — so a red test could be the copy or the patch. Committing the
    byte-exact copy first and running everything against it costs one staging pass and buys a
    baseline: after that, every red has exactly one possible cause. It paid the same day —
    five checks went red at the re-palette and each was classified in minutes.
21. **`cmp` proves a file was copied; it cannot prove the LIST was right** (2026-09-17, §13).
    266 of 266 files were byte-identical to a leave-list that was wrong by one, and the missing
    file was a test's dependency — invisible until the test ran. **Run what you copied.**
22. **A rule that names a part by ID must be checked against the parts that EXIST** (2026-09-17,
    §17). `layout.js ensembleFor()` throws on an override for an unknown part; the inherited
    `video-jury` realization named the previous piece's bass clarinet, and print and the jury
    video would have died on their first layout. No battery touched it. **When a palette
    changes, grep the registries for the old instrument names, not just the code.**
23. **When a measurement and an assertion disagree, find out which is wrong before editing
    either** (2026-09-17, §18). The engine put the double bass's low E at ySs −3 and the test
    expected −2.5; the engine was right. The reflex to move the expectation is how a wrong
    number becomes a green test — principle 15's cousin.

---

## §4 Decisions

*(Append-only: ID, date, decision, why, what was rejected.)*

- **D1** *(2026-09-17, composer: "yes the instrumentation correct")* — **Instrumentation =
  three pairs plus percussion:** english horn + bassoon · horn + trumpet · cello + double
  bass · percussion. Seven players. Source: his note of 2026-09-04 (COMPOSITION_NOTES LG-1).
  The percussion instruments are not yet named.
- **D2** *(2026-09-17, composer: "same format as others")* — **Same delivery format as
  pieces #4 and #5:** animated scrolling score with the same animated devices; presentation
  score (video + print); performance score later.
- **D3** *(2026-09-17, composer: "yes go with copy-forward, start the PM kit")* — **Base =
  piece #5's stack, ported by copy-forward of selected folders with the instrument palette
  rewritten.** *Why:* it is how #5 was made from #4 (its D1), both halves verified in a day;
  this repo starts clean, with only what Lake George needs. *Rejected:* clone-and-prune —
  610 commits of Tempus history and research in every cold session's way. *Not re-opened
  today:* a shared engine package (#5's D1 put it "after the septet"); copy-forward does not
  close that door (RUNNING_LOG §5).
- **D4** *(2026-09-17, AI, on the lineage's precedent — #5 D5)* — **Ports 5400 (score) /
  4900 (sandbox)**, distinct from #5's 5300/4800, #4's 5200/4700, #3's 5100/4600. *Why:* #5's
  performance score is still to be built, so both repos' servers will run together.
- **D5** *(2026-09-17, composer: "a")* — **Commit at the natural wrap of an approved chunk;
  push automatically after every commit**, staging explicit paths only. The rule of pieces
  #4 (D30) and #5 (D8), adopted here at his word. *Why (as put to him):* it is his
  established rule, and it keeps the record safe off this machine. *Rejected:* (b) commit at
  each wrap but ask "push now?" every time. *Not assumed from the earlier pieces:* that word
  was given per repo and a push is outward-facing, so it was asked once here.
- **D6** *(2026-09-17, composer: "english horn, getting now, use xsample double bass, the
  same percussion lib as 2piano2perc; I need to acquire a bowed vibraphone library")* —
  **The libraries:** bassoon · horn · trumpet = **IRCAM Solo Instruments 2** (read from the
  manual, RUNNING_LOG §9; the library of piece #4) · cello = **Xsample**, #5's recipe ·
  double bass = **Xsample** · percussion = **Spitfire Abbey Road Orchestra Percussion**,
  piece #2's library (its journal decision 4) · english horn = **being acquired**, library to
  be named · **a bowed vibraphone = still to acquire.** *Why Xsample for the bass (AI
  reading, his word was only "use xsample"):* one string model for the cello + bass PAIR —
  the same mechanism, the same controller behaviour, and the pair is a unit of the piece
  (LG-1). *Not chosen:* SI2's CONTRABASS.
- **D7** *(2026-09-17, composer: "I know we were using multiple ports there, but are probably
  changing the design here … bring over any of the Spitfire instrument definitions … set up some
  scaffolding … when the time comes, put in the actual instruments")* — **Percussion = ONE port
  (`LGPerc`), one channel per instrument; one Spitfire instance per instrument as one Reaper track
  filtering on its channel; techniques = instrument × beater, GENERATED from a catalog
  (`bank/aro_percussion_catalog.json`) + a selection (`bank/perc_selection.json`) by
  `tools/apply_perc.js`, never typed by hand.** *Why:* Spitfire cannot switch instruments by MIDI
  (#2's decision 5), so the channel IS the instrument; one player, so one port carries sixteen,
  and the schema's per-technique `port` gives a second when needed; All-in-One is byNote, so a
  beater's block of keys is a technique with a range, like an SI2 roster entry. *Rejected:* #2's
  eight-port per-event channel→port routing (built for two percussionists and cross-port
  snippets) · hand transcription of the key maps (35 instruments, up to 48 keys each — the one
  fragile build). *Also at his word:* the double bass → Xsample, confirmed ("yes double bass
  xsample"). RUNNING_LOG §19.
- **D8** *(2026-09-17, composer: "y xs")* — **The english horn = Xsample** (the track he made is named
  "English Horn XS"; D6 had it "being acquired, to be named"). Its roster comes from #3's Xsample woodwind
  map at 0c. RUNNING_LOG §20–21.
- **D9** *(2026-09-17, AI, on the count — "bsn 18" — and #5's `Fluteb` precedent; he made the ports)* — **The rack layout:** ten
  tracks in score order; each SI2 instrument TWO UVI instances on two ports (`LGBassoon` + `LGBassoonb` …), instance 1 = Ordinario
  then the browser's order to 16 parts, `b` = the overflow + three Ordinario copies as the curve parts; Kontakt 8 for the Xsample
  three; one Spitfire track per percussion instrument when chosen. *Why:* 18–20 presets do not fit 16 parts, and on UVI a channel
  IS a preset, so a curve channel must be a COPY (#5 §274). *Rejected:* fewer presets per instrument (he loaded them all); curve
  channels on other presets (wrong sounds). RUNNING_LOG §23.

---

## §5 Playbooks

*(Mode-specific procedures and gotchas. Piece #5's §5 holds the engine's playbooks; bring one
across when its system lands here and is first used.)*

---

## §6 Done

- 2026-09-17 — **0a** the PM kit installed (RUNNING_LOG §6).
- 2026-09-17 — **0b · 0g · 0i — THE PORT.** Piece #5's engine carried across and made this
  piece's: 266 files byte-exact, proven whole before anything changed, re-paletted by one
  asserted patch script, provisional recipes with the cello carried whole, the notation
  registry rewritten for seven new parts, and a save proved through to a notation page with
  the transposing parts at written pitch. Verified in the running app. RUNNING_LOG §12–§18.

---

## §7 Human Notes

*(The composer's own to-dos and reminders. Reviewed at session end.)*

- **From piece #5, still live:** one required checkbox on the Tempus application's
  declarations page was an empty ☐ on 2026-09-17 — his to tick — then send the print score
  + the application. **Deadline 2026-10-15 23:59 CET.** *(Carried here only as a reminder;
  the record is #5's journal §2.)*
- **Read the LGMF 2026 call** — when he chooses (Q2). Drop the PDF in `docs/` as in #5.
- **Name the percussion instruments** — bowed vibraphone is the first (LG-9).
- **Install the english horn library** (arriving 2026-09-17) and tell the AI which one it is.
- **Acquire a bowed vibraphone library.**
