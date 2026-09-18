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

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| **HIS** | **Look at it:** `node score/server.js` → http://localhost:5400/composer.html — his seven lanes. And the notation page: `/notation/app/notation.html` → `lgmf-0i` | — | — |
| **► N1** | **0c + 0e — IN PROGRESS, him at the machine.** DONE: ten ports · ten tracks · the three SI2 instruments complete as text (§20–§25). **NEXT: the Kontakt three** — English Horn XS · Cello XS · Bass XS: (1) he loads the first `.nki` in each Kontakt instance (or runs a `proof_load`-style script), (2) runs `reaper/kontakt/curve_slots.lua` inside each (its NKI table needs the three new names) — one click each, the AI checks the JSON read-back, (3) the Xsample recipes: the english horn roster (#3's Xsample manual, `for_bass_clarinet_harp_and_accordion/docs/manuals/extracted/`), the double bass's CC#0 from its own Preset Menu (NITS), (4) the REC track, (5) first sound from the SANDBOX per track (his Chrome), the keyswitch read on the red keys. Percussion when he chooses instruments. Then 0d · 0h | **Fable to walk him** · Opus for the scripts | **yes — a different mechanism (Kontakt), and the context is long** |
| N2 | **0d** the samples' true ranges and lengths, then **0h**, the phase-0 gate: every track sounds from the app through its own port | Opus | yes |
| N3 | **Phase 1, composing.** The tools he has already named: the multitempo machinery abstracted with figures per beat (LG-5) · the pattern tool with thinning (LG-7) · the morph that arrives at a beating and holds (LG-8) · animated conductions (LG-3) | Fable to design · Opus to build | yes |
| N4 | **Read the LGMF call** — when he says. It fills the plan's empty timeline table | Fable | no |

**Open at session end — (mid-session checkpoint, 2026-09-17, before the clear):**

- **The task:** phase 0. **The PORT chunk of it is COMPLETE** — 0a · 0b · 0g · 0i closed, six
  commits, all pushed, working tree clean. **State: the app runs on the seven tracks and does
  not sound.** Phase 0 is NOT finished: 0c · 0d · 0e · 0f · 0h remain.
- **Latest deliverables:** `score/` + `sandbox/` + `notation/` + `tools/` (the engine, running on
  :5400 / :4900) · `sandbox/instruments.js` (the seven recipes, every value marked provisional
  except the cello's) · `notation/registry/ensemble.json` (the seven parts) · `scores/lgmf.json`
  (the day-one stub) · `scores/0i-test.json` → `notation/ir/lgmf-0i.ir.json` (the 0i proof) ·
  `tools/palette_check.js` (159) · `tools/test_written_pitch.js` (8 + a control) · **0c scaffolding (§19):** `bank/aro_percussion_catalog.json` · `bank/perc_selection.json` · `tools/apply_perc.js`. **0e/0c the rack (§20–§25):** `reaper/LGMF_rack.rpp` (ten tracks) · `reaper/bridge/jobs/make_tracks.lua` · `peakwatch_lgmf.lua` · `tools/uvi_state.js` (header fixed) · `tools/uvi_edit.js` · `tools/apply_uvi_parts.js` · the SI2 recipes with `preset`/`ks` and the `UVI_PARTS` block.
- **THE NEXT CONCRETE STEP — an instruction, not a topic:** **Do not start building.** Open
  `docs/PLANNING_METHOD.md`'s three phases and lay out **PLAN 0c + 0e together** with him — the
  instrument recipes and the Reaper rack, one sitting, **him at the machine**. Begin by putting
  these four to him, one at a time: (1) which ARO percussion volumes are installed and **which
  percussion instruments the piece uses** (he has named only the bowed vibraphone, LG-9, and has
  still to acquire a library for it); (2) which library the **english horn** turned out to be;
  (3) confirm the **double bass** goes to Xsample beside the cello; (4) whether to build the rack
  now for the five instruments that ARE installed and extend it as the other two arrive. Write
  each step into `docs/PLAN.md` as it is agreed, per the method.
- **`Resume reads:`**
  - `docs/NITS.md` — the section **"Open work this port created or uncovered"** only. It is the
    list of what 0c must settle.
  - `sandbox/instruments.js` — **the header comment block only** (down to `const INSTRUMENTS`).
    It states exactly what is provisional and why.
  - **For the Kontakt three (the next step):** `docs/SAMPLER_QUIRKS.md` §Kontakt 8 + §Xsample · `reaper/bridge/README.md`
    § "The samplers, as code" · the headers of `reaper/kontakt/curve_slots.lua` and `proof_load.lua` · the `english_horn`,
    `cello`, `double_bass` entries of `sandbox/instruments.js` · RUNNING_LOG §22 (what a push is, and the hand-over protocol).
- **Decisions pending him:** which percussion instruments (only the bowed vibraphone named) · the english horn's library — (3) Db→Xsample and (4) build-with-five were answered after the clear · **the LGMF call is still unread at his
  word** (Q2) · who, if anyone, inherits the piano's struck role (PLANNER) · the presentation
  score's pitch form, at 2b.
- **Deliberately uncommitted: NOTHING.** His `reaper/LGMF_rack.rpp` is committed at each of his saves ("yes commit the rpp"). The only ignored thing on
  disk is `node_modules/` (`npm install` regenerates it). **No servers of the AI's are left
  running**; his 5300 / 4800 were never bound at any point.

**Open questions:**
- **Q1b — libraries.** The english horn's library (he is acquiring it) · **a bowed vibraphone,
  still to acquire** (LG-9) · which ARO volumes are installed · the other percussion instruments.
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
