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

### SESSION 3 — 2026-09-18 (Opus; postclear) — **PHASE 1 OPENED: THE SIX CHORDS BUILT**

- **No engineering. All compositional.** The record is COMPOSITION_NOTES **LG-16 … LG-26** (his words + the tables) and
  RUNNING_LOG **§62–§65** (the reasoning). **The lab journal now explicitly continues through composing** at his word —
  written into CLAUDE.md and agent memory: *"lab notes so if I want to come back and write a paper on how I wrote this piece."*
- **LG-16 the harmonic spine:** **E1 A1 D2 G2 C2 G2 D2 A1 E1** as roots — the bass and cello open strings, an arch about C2.
- **The instrument analysis (§62–§64b):** brass are trained equal-tempered and adjust FOR the natural; a brass natural
  harmonic needs the TUBE to be the root; the bassoon fingers its own fundamental; **the strings can hold any deviation by
  ear**, which is what made the chords possible. **B♭1 is the only fundamental where horn, trumpet and bassoon can each hold
  a DIFFERENT deviation.**
- **LG-17 the two categories:** instruments that HOLD a harmonic (horn · trumpet · bassoon) and ones that BEAT against it
  (vibraphone · english horn); strings either way.
- **LG-18 the six fundamentals and the leitmotif:** **B♭1 · A1 · C2 · G♯1 · B1 · F♯1**, which ARE the **semi-cluster
  F♯–G♯–A♭–B♭–B–C, C on top, transposable to any octave** — a reference harmony.
- **LG-19…LG-26: all six chords scored**, eight or nine voices each. The bass holds the fundamental throughout; the just
  partials are doubled by tempered instruments so every doubling beats; the friction notes were chosen by **distance from
  the nearest tempered interval** (his refinement of “grind”), and **no ratio was used twice**.
- **The set rises in strangeness:** chord 2 has no 7th partial (mildest, 11–20¢ off) · chords 1 3 4 5 sit on the 7th
  (29–37¢) · **chord 6 sits on the 11th and reaches ±49¢, the maximum**, four near-quarter-tones at once.
- **Three constraints that did real work:** the bowed vibraphone’s two bows (span ≈ a twelfth; **close bars on the SAME row
  collide, opposite rows never do**) · the ensemble ceiling F6 · **the SI2 horn’s F4 ceiling — most of the horn writing here
  is playable but NOT auditionable in the mock-up.**
- **His chat preference sharpened:** a direct question gets the fact and nothing else; explanations quarantined to a notes
  section; **no widgets — plain markdown tables in chat**; the chord chart in row-per-chord form. In memory.

### SESSION 4 — 2026-09-19 (Opus; postclear, then "move thru plan as much as possible independantly") — **PLAN 1a IS BUILT, 1a.0 → 1a.7**

- **Five scores exist and none has been heard.** `lgmf-ref` (the six chords standing still, 6:50) and
  `lgmf-spectral · lgmf-balance · lgmf-bloom · lgmf-converge` (six transitions each, 9:50). RUNNING_LOG **§67–§73**.
  **His listens close 1a.4 and 1a.6 — that is the only thing left in the item.**
- **The harmony as data:** `bank/reference_chords.json` (voicings typed once, every cents value / Bloom target / Spectral
  pick computed, LG-27's deviation table asserted) → the four types as **four models and 24 ACTUALs** in `bank/actuals/`,
  each reopenable in the morph panel on its own dials.
- **Three things were BROKEN and are fixed**, none of them in the plan, each would have stopped the piece:
  1. **The double bass was an octave out** — the Xsample library is keyed an octave ABOVE sounding, so every fundamental
     of the piece was silent. Fixed Reaper-side; recipe back to sounding 28–69. **He has saved the rack** (`755df22`).
  2. **The composer app had not booted since 2026-09-18** — D12 put the vibraphone in `TRACKS` and nobody added `lane8`.
  3. **A recalled morph model came back as a stranger** — three places in the panel assume a morph's pitches are a SET to
     be cast onto three pairs, which destroys the cents and the just/tempered doublings.
- **Two opt-in additions to morph.js**, both byte-identical against the frozen 2026-09-07 tuba baseline:
  `source/target.kind: 'voices'` (per-voice cents, unsorted — the engine's chord input was integer semitones, and this
  piece is made of cents) and `target.mid` + `target.dwell` (a third station with a rest; 30 · 30 · 30 is dwell 1/3).
  A `carrier.hold` fold-plateau was written first and **removed** — the dwell serves all four types where the fold serves
  two, and an unused dial on a shared engine is a trap for the next piece.
- **Measured, not assumed:** the bowed vibraphone sustains **7.4 s** (peak −20.7 dBFS, 20 dB down 7.4 s later, gone by
  ~10.5 s), replacing the assumed 12. It is the busiest voice in every score because of it.
- **New gates:** `node tools/check_ceilings.js --all` (1a.4's required check, all five scores green) and
  `node tools/model_bank.js --validate` is **VALID** again — 16 actual ids piece #5's carried models listed had never
  existed here.

### SESSION 8 — 2026-09-19 (Fable; postclear, his word in the command itself: *"good to start the build"*) — **PLAN 1d.1 BUILT: THE GENERATOR**

- `score/public/sequence.js` — a recipe in, every player's notes out. Pure; the page (`window.Sequence`) and node. **Loaded by NO page yet.**
- `node tools/sequence_check.js` — **49 green** on the six reference chords · `docs/SEQUENCE_TOOL.md` opened · RUNNING_LOG **§114**.
- **Nothing existing was changed** — `morph.js`, `dyn_ui.js`, `beating_calc.js` were read, not edited. The ladder is `dyn_ui.js` itself,
  run in node against a stub drawer (not a copy).
- **Calls made alone, his to reverse (§114):** under `attack` the striation lives in the first breath's length · a player attacking the
  next chord lands one gap before the line · a would-be runt is folded into the landing · a player absent from a chord lands on the line
  and re-enters · a double stop is one player on one bow (chord 5's cello taught this) · one random stream per (player, box), so
  re-timing a box moves no other box.

### SESSION 9 — 2026-09-19 (Fable; postclear, *"Next: 1d.2 starts a new chunk pls"* → proposal → *"go"*) — **PLAN 1d.2 BUILT: THE DRAWER**

- `score/public/sequence_ui.js` + two script tags in `composer.html` (`sequence.js` is loaded by the page now). **`strike_drawer.js` unchanged.**
- A `Sequence` button beside `Strikes` → a strip UNDER the strikes drawer: boxes of take · seconds · dyn, the width the duration,
  the players frozen shown on each · `change [attack | seamless]` · `hear [from the start | from the box]` · Hear through the strikes
  drawer's own player · Insert @ playhead = one group `grp-seq-<id>` + one META bar + the recipe into `databases.sequences` (an array).
- **Verified in the running app, no MIDI** (throwaway :5401 tab, autosave disabled first; RUNNING_LOG **§115** has every number) ·
  `palette_check` 184 · `sequence_check` 49 · `docs/SEQUENCE_TOOL.md` §9. **Not verified: sound — his Chrome.**
- **Calls made alone, shown him in the proposal, his to reverse (§115):** SPACE goes to what he clicked last (strip · strikes drawer ·
  score) · one row = one sequence = one place in the score (Insert again MOVES it; `new` = a fresh id) · the strip under, not beside.
- **Found by reading:** `playNotes` never takes a pitch bend back (one chord never needed it; a sequence does) — handled from outside:
  a tempered note of a player who bends anywhere leaves with `cents: 1e-6`, which the player rounds to the centre.

**Then, the same session, at his *"go 1d.3"* — PLAN 1d.3 BUILT: THE ROUND TRIP** (RUNNING_LOG **§116**, SEQUENCE_TOOL §10; all in `sequence_ui.js`)

- `sequences in this score` — a pull-down read from `databases.sequences`; pick one → the recipe back in the row.
- Where a sequence sits is read from its META bar in the SCORE, never from the recipe — a dragged group is found where he left it.
- **A placed sequence is RE-INSERTED IN PLACE** (the button says so, with the time). **This changes 1d.2's "Insert again moves it"** —
  the plan's own text and his test require it; `move to playhead` is kept as a separate button. His to reverse.
- The recipe is the truth: the status counts notes moved, re-pitched or deleted by hand before it overwrites them.
- An orphan (an undo, a hand delete) stays in the list, marked `NOT in the score` · a dirty row asks before it is replaced ·
  the status has a line of its own (the strip is 194 px).
- Verified in the running app, no MIDI. **NOT verified: sound, and a REAL canvas drag of the META bar** (the move was made in the model).

**Then, at his *"go 1d.4"* — PLAN 1d.4 BUILT: THE ROLL** (RUNNING_LOG **§117**, SEQUENCE_TOOL §11)

- **The generator takes a rest** — `chord: null` — with NO new machinery: it is 1d.1's absent-player rule, for everyone at once.
  `sequence_check` 49 → **60**.
- **The roll line** in the strip: piece #5's `time_containers.js` (unchanged), the dials and defaults `containers_ui.js`'s, plus
  `tilt` (fills the weights box toward the long or the short values). `roll` lays out the boxes; `re-roll` = the next seed.
- An empty box is a REST, drawn quiet · the recipe keeps `roll { … }` · the containers are the truth · the strip's height is its content's.
- **ONE CALL CHANGED WHILE BUILDING, his to reverse:** a roll over chords KEEPS them, by position (it still asks, and says how
  many are kept or dropped). The plan said the row is replaced. 1d.4 was written without his review — every call in it is his.
- Verified in the running app, no MIDI. Not verified: sound.

### SESSION 10 — 2026-09-19 (Fable; postclear, his word in the command: *"tests all good go for 1d.5."* → proposal → *"go"*) — **PLAN 1d.5 BUILT: THE BREATH DIALS**

- **His tests of 1d.2 · 1d.3 · 1d.4 PASSED** — *"tests all good"*. The first report from him on the sequence drawer.
- **A `breath` line in the strip** (RUNNING_LOG **§118**, SEQUENCE_TOOL **§12**): striation · length · ± · `together` · `apart` ·
  `lengths` · weights · seed · `re-breathe`. The dials are the generator's and travel in the recipe.
- **`together`:** BLANK = free (the morph's way) · 0 = never within `apart` · between = that share of re-entries snaps, the rest
  kept apart · 1 = everyone on the leader's re-entries. **The shortest breath leads** — the bowed vibraphone, when it plays.
- **`lengths`:** a pool (`3 9`), drawn by `time_containers.js` (unchanged), one stream per player; played as written.
- **The gate, made first:** `tools/sequence_baseline.json` — ten recipes hashed from the generator BEFORE the dials went in.
  Untouched dials = those notes. `sequence_check` 60 → **88**.
- **Changed from the plan while building, his to reverse (§118):** a start is moved to the NEAREST free place, earlier or later ·
  a snap goes to the nearest re-entry (at 1: the leader's next) · `CROWDED` — eight players have room for `apart` ≈ 0.75 s ·
  the strip's head WRAPS (a placed sequence's head was already 61 px too long at 1280 px, its `×` cut off).
- **For his ear, not decided:** the pool is STICKY (the generator's stick 0.8) — a player stays on short or long for a while.
- Verified in the running app, no MIDI. **Not verified: sound.**
- **Then, from inside the drawer, two things he asked for (RUNNING_LOG §119–§120):** *"how do I get more time containers"* → a
  **`count`** box on the roll line (blank = what the dials give now; a number FILLS `×`, searched for the seed, and holds through
  `re-roll`; a typed `×` clears it) · *"a preview button for each of the takes"* → a **`▸` PREVIEW on every box** that holds a chord
  (its frozen chord alone, 5 s, at the box's dyn). Read as per BOX — the AI's reading, told him. Both in `sequence_ui.js` only.

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| **► PLAN 1d — THE SEQUENCE DRAWER: planned in full; 1d.1 the generator BUILT (session 8, §114); 1d.2 the drawer BUILT (session 9, §115 — `sequence_ui.js`, SEQUENCE_TOOL §9); 1d.3 the round trip BUILT (session 9, §116 — SEQUENCE_TOOL §10). HIS TESTS of 1d.2 · 1d.3 · 1d.4 PASSED (2026-09-19, his word: *"tests all good"*). 1d.5 the breath dials BUILT (session 10, §118 — SEQUENCE_TOOL §12) and **HIS TEST PASSED** (*"test good"*, §121); `count` and the box PREVIEW added at his word (§120). **1d.7 is in hand: the proposal is with him (§121 — one question, niente now or after).** 1d.5's test was: reload → `Sequence` → one long container (40 s) → `breath` → `together` '0', SPACE → '0.5', SPACE → `lengths` '3 9', SPACE → `seamless` across two chords, SPACE. THEN BUILD 1d.7, the waves** | **Opened and planned 2026-09-19, session 7** (RUNNING_LOG §102–§107; his brief LG-35, the dynamics LG-36). Sustained chords in time containers: a sequence is a RECIPE saved in the score file (`databases.sequences`), the notes DERIVED; takes from the strikes drawer frozen into boxes; one dyn per box; `attack | seamless`; the morph's breath rules as the default. `docs/PLAN.md` § 1d carries every step in full — result when done, to-dos, verification, his test: **1d.1** the generator (`score/public/sequence.js`, pure; `tools/sequence_check.js`) · **1d.2** the drawer, one container at a time · **1d.3** the round trip (reopen from the drawer's list, re-Insert replaces in place) · **1d.4** the roll (`time_containers.js`, piece #5's, already here) · **1d.5** the breath dials (`together`, a pool of lengths) · **1d.7** the WAVES layer (amended in, §109–§111, LG-38 · LG-39: each player on a dealt stream of swells; a box is a straight dynamic OR reads the waves; built after 1d.5; 1d.1 carries two to-dos for it — levels as breakpoints, the ceiling read at the loudest level) · **1d.6** his listen, last. 1d.4–1d.7 were written at his word WITHOUT review (the calls made alone: §107 and §111); three calls in them are his to reverse (§107: an empty box is a REST · a roll over a filled row asks first · the containers are the truth once rolled). Held as features: a curve on the sequence · per-player dyn · per-player curve. **Reads for 1d.7, and nothing more:** PLAN § 1d.7 · `docs/SEQUENCE_TOOL.md` §5 (the dynamic) · §6 (what comes out) · §12 (the breath line as built — the pattern for a `waves` line) · `score/public/sequence.js` (`levelOf` · the `levels` breakpoints and the ceiling read at the LOUDEST level in `dealSpan` — 1d.7 changes the numbers there, so `sequence_check` and the baseline gate grow with it) · `score/public/sequence_ui.js` (the `dyn` pull-down in `renderEdit` · `buildBreath` / `paintBreath` as the pattern · `insert()`'s nodes from `levels`) · RUNNING_LOG §109–§111 (the waves' reasoning) | Fable — HIS CALL, 2026-09-19 (*"I'll clear but stay on fable for build"*); the Fable credit rules bind every turn: fewest round trips, no screenshots unless the screenshot is the proof, never a subagent; one step a chunk, his test between steps | yes — a clear; the plan is the handoff |
| **THE STRIKES DRAWER (PLAN 1c — built, HIS LISTEN outstanding) — stages 1 and 2 DONE, HIS LISTEN, then stage 3 (the SPECTRUM source) under the planning method** | **PLAN 1c opened 2026-09-19** (RUNNING_LOG §92; his request verbatim LG-32). **Stage 1** (§92): the harmony column draws with no strikes, the eight players, a fourth set `ordinario`. **His first listen worked** (§93: "only the cello" was PLAN 1t's free/busy rule reading the open score — the playhead, not the drawer). **Stage 2** (§94, PLAN 1c.2): `hear [strike \| long tone] [N] s` — SPACE holds the harmony as dealt N seconds, Insert follows the menu (his decision A), the vibraphone bowed in `ordinario`; `long_tone_ui.js`, loaded last. **Stage 2b** (§95, PLAN 1c.2b): his *"are they plugged in to the volume measurements"* — they were not; now `playNotes` sends each instrument its own velocity and CC7 for the level (the score's law), `dyn [ppp … fff]` replaces `dyn ×` / `flat 127` (default mf; the written scale, 65 … 127), Insert writes the height that means the anchor. **Stage 3** (§96, PLAN 1c.3): **two vibraphone players** — a second SEAT, `Vibraphone 2`, a ninth row in the drawer on the vibraphone's lane (the score's TRACKS untouched); Hear on the first curve channel, Insert as a drawn note on lane 5. **Stage 4** (§97, PLAN 1c.4): **the HARMONIC SERIES banner — the JUST column**: type a fundamental → every partial to the top key, `p · ±c¢` on each dot; Hear bends, Insert writes `morphBend`; a fixed-pitch player never takes a note > 5 ¢ off. **Stage 5** (§99–§100, PLAN 1c.5): the range lines ON the keys in a colour per instrument (a swatch on each row; hover a row to brighten its line) · the **JUST / 8ve column** (the partials in every octave, green) left of the JUST column (pink), the columns measured and pushed apart so no label overlaps · the banner's second row `just + 8ve`. **Stage 6** (§101, PLAN 1c.6): **four rows**, each its own harmony — `just` · `just + 8ve` · `tempered` · `tempered + 8ve` (blue and amber beside the pink and green). **His test: RELOAD the tab → Strikes → HARMONIC SERIES → a fundamental → any of the four rows → `ordinario` → shuffle → `hear: long tone` → SPACE — the just rows bend, the tempered rows do not; the vibraphone holds only tempered notes; hover a row to see its range line.** Then the one stage left of LG-32: **the partial checkboxes** (1c.7) (four columns, cents, partial checkboxes, set toggles) · range lines · takes. Two questions open: does the long tone reach Insert · "each octave" = the keyboard's octaves or the one above the fundamental. His constraints bind every step: nothing existing changed unless necessary and checked with him; only what he asks; robust | Fable — phase 2 (the top line), then Opus builds each stage | yes, after his listen |
| N0 | **PLAN 1b IS CLOSED — back to the music** — **1b closed at his instruction** (RUNNING_LOG §91): *"we actually need to start wrapping this up... I wanted a usable demo... it is realistic that it is going to vary a bit."* **Final: tutti fff −19.1 LUFS and −9.7 dBTP, both PASS; per-part spread 7.71 dB against a wanted ≤3 — not met, by decision.** Written span **12 dB** (was ~10); **CC7 carries the register on the VIBRAPHONE ONLY** — it is reserved for crescendos everywhere else, his call. This morning it was 18.8 dB spread and 5.7 dB hot. **What 1b bought:** a proven meter and a −20 dBFS reference · an absolute K-20 target · the clipping found (sleigh bells **+10.6 dBFS on one note**) · four round robins off · the SI2 Dynamic fix reaching the parts the piece plays · two never-trimmed tracks · `docs/RACK_SETTINGS.md`. **NEXT — the music: his listens.** Reload the composer tab, then `lgmf-ref`, the four transitions, `lgmf-all`. Everything since §75 has changed how they sound | Fable to design after the listens | yes, a clear |
| N1 | **HIS, after 1b.5 or whenever: hear the five scores again after the tab RELOAD** RUNNING_LOG **§75**: every score he opened after the first in a tab played on the PREVIOUS score's routing (a per-object-id channel map never cleared on load; the generated scores share ids) — notes landed on Chromatic Scale · Trills · Cresc programs and on other instruments' ports. Fixed in `composer.html` (four `curveDirty()` calls), verified by a two-load headless capture. **His tab runs the old page until reloaded.** `lgmf-ref` first, then the four transitions, then `lgmf-all` (all 24, chord-major, 39:50). Still worth listening for, now that the routing is right: the vibraphone re-bows 11× a minute (7.4 s) · the brass in SPECTRAL flips between partials · chord 6's BLOOM barely moves · **the double bass in SPECTRAL travels two octaves in 30 s** (§70's octave widening — a seed override if unwanted) | — | — |
| N2 | **His, by ear, whenever:** the seeded SPECTRAL sets and the BLOOM targets are all printed in RUNNING_LOG **§70** — override any and re-run `tools/build_reference_chords.js` then the two build tools. The dials on every transition are *longer/shorter · rest at the far station · the entrance · together/spread* | — | — |
| N3 | **After his listens: the rest of phase 1** — the tools he has named (multitempo LG-5/11/12 · the pattern tool LG-7 · the morph to a held beating LG-8 · animated conductions LG-3), and **how the six chords are used in time** (nothing yet says their order, their durations or what happens between them). And the LGMF call, when he says | Fable to design | yes — a clear and a design conversation |
| N4 | **Small, deferred, in NITS:** `beating_calc_check.js` and `morph_septet_check.js` are still piece #5's cast and crash · the model_bank validator does not know `provenance.palette`, which `buildActual` itself writes | Opus | with N2 |

**Open at session end — (MID-SESSION CHECKPOINT, 2026-09-19, session 9, Fable; the builds that follow stay on Fable, at his word):**

- **The task: PLAN 1d — the SEQUENCE drawer.** What he asked for (COMPOSITION_NOTES LG-35 · LG-36 · LG-38 · LG-39, verbatim): saved
  takes from the strikes drawer held as SUSTAINED CHORDS, each for a duration, in a row of time containers he can re-time or swap at
  any moment; the durations typed or ROLLED; the morph's breaths laid over the whole; a new chord ATTACKED by everyone or taken
  SEAMLESSLY at each player's next breath; per box a straight dynamic OR a layer of dealt per-player WAVES. **The architecture he
  approved:** a sequence is a RECIPE saved in the score file (`databases.sequences`) and the notes are DERIVED · a box's chord is
  FROZEN when chosen · he edits in the DRAWER, the score shows the result · `morph.js`, `time_containers.js`, `strike_drawer.js` and
  the score's canvas are NOT changed (LG-32's constraint: nothing existing changed unless necessary and checked with him first).
- **Where it stands (updated session 10): 1d.1 → 1d.5 are BUILT, each verified in the running app with NO MIDI.** His tests of
  1d.2 · 1d.3 · 1d.4 PASSED (*"tests all good"*). **His test of 1d.5 is outstanding** (written out in the running thread above and
  in PLAN § 1d.5). Whether any of it has been HEARD he has not said. Left to build: **1d.7 the waves → 1d.6 his listen.**
- **Latest deliverable:** `score/public/sequence_ui.js` (the drawer · the round trip · the roll — one file, ~560 lines) ·
  `score/public/sequence.js` (now takes `chord: null` as a REST) · `tools/sequence_check.js` (**88**) with `tools/sequence_baseline.json`, the gate · the breath dials in both files (§118, SEQUENCE_TOOL §12) · `docs/SEQUENCE_TOOL.md`
  §9–§11 · RUNNING_LOG **§115 · §116 · §117** (every number, every call made alone).
- **THE NEXT CONCRETE STEP (updated session 10) — his test of 1d.5; then build PLAN 1d.7, the waves, as the plan writes it.**
  If he reports on the test first, what he found comes before 1d.7. 1d.7 was written WITHOUT his review (§111), so: read PLAN
  § 1d.7, give a SHORT proposal that names every call the AI would make alone, build on his go. One step per chunk. **The gate
  stands: every box straight and every dial at its default must give the notes in `tools/sequence_baseline.json`.**
- **`Resume reads:`** *(what 1d.7 needs, nothing more)*
  - `docs/PLAN.md` § **1d.7 only** (from `- **1d.7`).
  - `docs/SEQUENCE_TOOL.md` — §5 (the dynamic) · §6 (what comes out) · §12 (the breath line as built — the pattern to copy).
  - `score/public/sequence.js` — whole (~330 lines): `levelOf`, and in `dealSpan` the `levels` breakpoints and the ceiling read at the loudest level.
  - `score/public/sequence_ui.js` — the `dyn` pull-down in `renderEdit` · `buildBreath` / `paintBreath` · `insert()`'s nodes from `levels`.
  - RUNNING_LOG §109–§111 — the waves' reasoning, his words.
- **HOW THIS SESSION VERIFIED WITHOUT TOUCHING HIS WORK — do the same:** `preview_start` **`score-5401`** (a throwaway server on the
  SAME scores folder) → `composer.html` → **before anything else** `Composer.autosave = async () => {}; clearTimeout(Composer.autoSaveTimer)`
  — the page reopens HIS last working copy (`lgmf-converge-work`) and would autosave into it 5 s after any change · never Save ·
  `window.confirm` stubbed (the drawer asks before it replaces a row) · the playhead stubbed with `Composer.getTimeAtPlayhead = () => N`
  · **`resize_window` 1280 × 860 first — a hidden pane has a 0 × 0 viewport and every width reads as its minimum** · a server round
  trip only under a throwaway name (`zz-verify-…`), deleted after, looked at before deleting · his takes (`Just-C1-seed90` ·
  `Just-A1-seed124` · `Just-e1-seed178` · `Just-G0-seed144` …) are in the snapshot store and reading them is harmless · verify NOTE
  LISTS and OBJECTS by `javascript_tool`, never a screenshot · reset the viewport and `preview_stop` at the end.
- **Decisions pending him:** none that block 1d.7. **§118** (1d.5) adds to the list below: a start moved to the NEAREST free place,
  earlier or later (the plan said later) · a snap to the nearest re-entry, at 1 the leader's next · the pool STICKY, `stick` not on
  the line · the head wraps. **His to reverse whenever — the calls made alone, all in RUNNING_LOG:**
  **§115** SPACE goes to what he clicked last · one row = one sequence = one place in the score · the strip sits UNDER the strikes
  drawer — **§116** a placed sequence is RE-INSERTED IN PLACE (this changed 1d.2's "Insert again moves it"; `move to playhead` is a
  separate button) · an orphan stays in the list, marked · a dirty row asks before it is replaced — **§117** **a roll over chords
  KEEPS them by position — the AI CHANGED the plan here** · an empty box is a REST · the containers are the truth once rolled —
  and §107 · §111 for the steps still to build. Held as features: a drawn curve on the sequence · a dynamic per player per box ·
  a curve per player · reopening by clicking the META bar (needs a hook in the score's canvas). Still unread at his word: the LGMF call (Q2).
- **Not verified by anyone yet:** SOUND, all of it · a REAL drag of a sequence's META bar on the canvas (the move was made in the
  score's model; that the canvas moves the whole `grp-seq-` group with its bar is inherited META behaviour, not exercised).
- **Known and deferred:** undo takes a sequence's notes back but not its `databases.sequences` entry — the entry shows in the list
  as `NOT in the score` · nothing deletes an entry yet · in Hear only, a bend is sent 30 ms before its note, so on a bow with a 50 ms
  gap the last 20 ms of the previous note's release is bent (noted, not measured).
- **Still outstanding behind all of it, and HIS:** the listen in the strikes drawer (PLAN 1c.1 → 1c.6, built and unheard) · the six
  scores, unheard since the rack was calibrated.
- **DELIBERATELY UNCOMMITTED — three paths, all his:**
  - `bank/panel_snapshots.json` (modified) — the takes he saves from his own tab. His data, mid-use; not committed without his
    word. The sequence drawer reads this store through `/api/snapshots`, committed or not.
  - `reaper/LGMF_rack.rpp` (modified) — HIS project file, carrying probe recordings that point at large WAVs in `reaper/Media/`;
    every hand-set plugin value in it is written down in `docs/RACK_SETTINGS.md`.
  - `scores/cresTest.json` (untracked) — a score he saved from his own tab. Leave it alone.
- **Three things learned the hard way:**
  - **A Bash command longer than about 8 KB FAILS on this machine** with `unexpected EOF while looking for matching quote` — it is
    cut short and nothing runs. It bit again this session. **Write any large text with the Write tool into the scratchpad, then
    splice it in with a short `node` script** that asserts each replacement lands exactly once.
  - **The Write and Edit tools turn a typed `\uXXXX` into the literal character**, so `sequence_ui.js` holds `—` and `·`, not
    escapes. Edit matches either way; a node script must match the LITERAL, or anchor on plain ASCII.
  - **A PARALLEL SESSION of his may be appending to `RUNNING_LOG.md` and `COMPOSITION_NOTES.md`.** Append only; **read the last
    heading number immediately before writing** and take the next free one; explicit paths, never `git add -A`.
- **Standing warnings still true:** the in-app browser has no Web MIDI, so **every listen and every Insert that matters is his
  Chrome** — the AI verifies note lists, objects and routes, never sound · one composer tab per score · `apply_trims.lua` and the
  remap are GENERATED — edit the bank, not the file · **on Fable: fewest round trips, no screenshots unless the screenshot is the
  proof, never a subagent.**

**Open questions:**
- **Q1b — libraries. CLOSED 2026-09-18:** english horn = Xsample (D8) · all three ARO volumes installed (§33) · the
  percussion named (LG-10) · **the bowed vibraphone acquired — Xsample Mallets Extended, its own lane (D12), recipe and
  probe done (§48); LG-9 closed.** Nothing is outstanding.
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

**Checks this piece owns:** `node tools/palette_check.js` (**168**) · `node tools/test_written_pitch.js`
(**10** + a control). Run both after any change to `TRACKS`, `sandbox/instruments.js` or
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
21. **The file, the app's intent and the rack's layout are each necessary; only the RECORDING of the rack is the proof**
    (2026-09-19, RUNNING_LOG §75). Three text layers were green — the score data, the headless MIDI capture, the UVI parts —
    and the sound was wrong, because the fault lived in a cache between a load and a play that no fresh reading exercises.
    His one recording of the rack, read back by `dump_recorded_midi.lua`, found it in minutes. When he says it sounds wrong
    and the text says it is right, record the rack before arguing with the text.
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

- **D12** *(2026-09-18, composer: "a yes vibes gets its own lane", and on the engraving "confirmed" — one staff, treble clef, non-transposing)* — **THE BOWED VIBRAPHONE HAS ITS OWN LANE: eight instrument lanes, `layoutVersion` 7.**
  It took lane **5**, between Percussion and Cello, so META moved 7 → 8 and the curve windows A/B/C 8·9·10 → 9·10·11;
  everything from lane 5 up shifted one down and `restoreData` migrates a v6 save (one uniform `layer >= 5` step).
  *Why:* the opening sustains it continuously — it holds two overlapping pitches while individual instruments come in
  and beat against each one (LG-15) — so it is a **voice**, not a technique on the percussion track, and a lane is what
  makes it writable. *Rejected:* keeping it inside the Percussion lane (no layout change, but one lane cannot carry both
  the small metals and a sustaining pitched instrument, and the opening needs the vibraphone held while the metals stay
  free). *The cost, accepted:* `Coords.ensembleFrame` reflows, which moves **print and video together** (the standing
  warning) — the eight parts come from `notation/registry/ensemble.json`, so both exporters follow it without an edit.
  **It is the same PLAYER as Percussion** (the septet has one percussionist), so parts 4 and 5 are joined by a **BRACE**,
  the standard mark for several staves belonging to one player — not a bracket, which would mean a section.
  **Engraving, his confirmation:** a single treble staff, non-transposing, F3–F6 sounding (53–89); a grand staff belongs
  to the marimba, and LG-15's two pitches read better as a dyad on one staff than split across two.
  RUNNING_LOG §48.

- **D13** *(2026-09-18, composer: "ok lets record this as a decision and prevent flipping to cc7 for everything")* — **THE DYNAMIC
  MECHANISM IS #5's, UNCHANGED: VELOCITY IS THE DYNAMIC; CC7 SHAPES A HELD NOTE; THE TRIM LIVES ON THE FADER.** The AI had
  proposed, after the 0d run, to make CC7 the dynamic for every pitched instrument (RUNNING_LOG §54). He interrogated it —
  *"is this what was happening in piece 5? … or am I mistaken"* — and he was not mistaken: #5 built a VELOCITY remap
  (velocity per curve height per instrument), used CC7 only for the drawn curve of a held note and as a small trim on layered
  samplers, and never as the ensemble's dynamic. **Standing rule: no flip to CC7-for-everything.** *Why:* the proposal was
  forced by two instruments, not by the ensemble — every other instrument responds to velocity as #5's did (english horn 18 dB
  · cello 18 · vibraphone 28 · double bass 17 · bassoon 12, the flute's case). *The open exception:* **horn and trumpet**, whose
  loaded SI2 ordinario gives 4–5 dB across the whole velocity range. **He is looking into it** — a velocity-layered SI2 preset
  would close it with a swap; failing that, those two alone would take CC7. RUNNING_LOG §55.

- **D14** *(2026-09-18, composer: "lets assume this works, will reveal itself in composition")* — **PHASE 0 IS CLOSED WITHOUT
  RUNNING 0h.** The gate — every track sounding **from the score app through its own port** — is not performed; it becomes a
  phase-1 expectation, proved by the first note he plays while composing. Also skipped at his word: the remap's four-height
  audition, and the percussion heard against the winds (**its fff = fff trims stand unjudged by his ear**). *Why:* every
  segment after the port is measured and one chord is approved (§49–§59); the only untested link is the browser's Web MIDI,
  exercised for two pieces on this machine, and a failure there is loud and immediate — a wrong `LG` port name shows as one
  silent instrument, an unreadable remap bank as unremapped velocities. *Rejected:* a ceremonial gate run, on his standing
  rule against verification that a plan does not name. RUNNING_LOG §61.

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
