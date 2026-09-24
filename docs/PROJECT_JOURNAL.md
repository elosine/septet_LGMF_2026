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

### THE SESSIONS BEFORE THIS ONE — one line each; the lab journal has them whole

- **S1 · 2026-09-17 (Fable + Opus)** — **THE PORT.** Piece #5's whole stack carried across and re-paletted onto the seven
  instruments (0a · 0b · 0g · 0i), verified in the running app, nothing sounding by design; then the rack begun — ten `LG`
  ports, the SI2 three complete as text, the Kontakt three's four curve slots. D1–D9. RUNNING_LOG §1–§36.
- **S2 · 2026-09-18 (Fable → Opus)** — **THE PERCUSSION BUILT:** fourteen `LGPerc` tracks, all fourteen key maps, eight (C)
  preset states banked. **His scope call: volume normalization is the only pre-composition item.** LG-10 … LG-15, NX-1 … NX-6.
  RUNNING_LOG §37–§46.
- **S3 · 2026-09-18 (Opus)** — **PHASE 1 OPENED: THE SIX CHORDS.** No engineering. The harmonic spine, the two categories of
  instrument, the six fundamentals (= the semi-cluster), all six chords scored voice by voice with their cents. **The lab
  journal extended to the composing itself, at his word.** COMPOSITION_NOTES LG-16 … LG-26, RUNNING_LOG §62–§65.
- **S4 · 2026-09-19 (Opus)** — **PLAN 1a BUILT:** `bank/reference_chords.json`, four models × 24 actuals, **six scores**
  (`lgmf-ref` · four transition types · `lgmf-all`). Three things were broken and fixed, none in the plan — the double bass an
  octave out, the app not booting, a recalled morph coming back a stranger. RUNNING_LOG §66–§74.
- **S5 · 2026-09-19 (Fable + Opus)** — **PLAN 1b: THE RACK CALIBRATED** to an absolute standard (K-20, BS.1770): a proven meter,
  a −20 dBFS reference, every instrument measured on the channels the piece plays, trims and a 12 dB written span. **Six bugs
  that would have outlived the piece**, including a per-object channel map that made every score after the first play on the
  previous score's routing. Final: tutti fff −19.1 LUFS, −9.7 dBTP. RUNNING_LOG §75–§91.
- **S6 · 2026-09-19 (Fable + Opus)** — **PLAN 1c: THE STRIKES DRAWER** adapted for this piece, six stages — the eight players ·
  `ordinario` · hear strike | long tone · the remap's dynamics · two vibraphone seats · the HARMONIC SERIES banner with four
  selections and cents. Built and unheard. RUNNING_LOG §92–§101.
- **S7 · 2026-09-19 (Fable)** — **PLAN 1d PLANNED IN FULL** under the planning method (his brief LG-35 · LG-36; the waves
  amended in the same day, LG-38 · LG-39). RUNNING_LOG §102–§113.
- **S8 · 2026-09-19 (Fable)** — **1d.1 THE GENERATOR** — `score/public/sequence.js`, pure, a recipe in and every player's notes
  out; `tools/sequence_check.js`. RUNNING_LOG §114.
- **S9 · 2026-09-19 (Fable)** — **1d.2 THE DRAWER · 1d.3 THE ROUND TRIP · 1d.4 THE ROLL** — `score/public/sequence_ui.js`;
  `strike_drawer.js` untouched. RUNNING_LOG §115–§117.

- **S10 · 2026-09-19 (Fable)** — **PLAN 1d BUILT TO ITS END** — 1d.5 the breath dials · 1d.7 the waves · 1d.8 the edges; his tests of
  1d.2 · 1d.3 · 1d.4 · 1d.5 PASSED. **A seventh 1b-class bug:** the bank's fader curves, measured in 0d for all seven, written by that
  morning's builder for the vibraphone alone — restored (he had to point at the record twice). RUNNING_LOG §118–§131.

- **S11 · 2026-09-20/21 (Opus → Fable → Opus)** — **THE DYNAMICS LAW, THE SEQUENCE DRAWER IN USE, THE BLOOM — AND SECTION 1
  COMPOSED.** 1e the volume fix, proven in his rack · 1d's feature add + 1g one scale, closed at his word and in use · 1h the bloom
  on a take · 1i the vibraphones in it, held still · 1j the morph's breaths · the server's stale-engine fault fixed · the composer's
  eight lanes. **He named `piece-LGMF-Sec01-v1.3-sec01-done`.** D18–D23. RUNNING_LOG §132–§184.

- **S12 · 2026-09-21 (Fable → Opus → Fable → Opus)** — **THE COUNTERPOINT ROUTE, BUILT AND SET ASIDE; A TEXTURE TAKE IN THE STRIKES
  DRAWER, BEGUN.** `1l` planned in full, built end to end (`1l.1` … `1l.7`: Texture plays this ensemble and saves rhythm takes · the
  Rhythm sequence panel) and composed with (`LGMF-Rseq-01`) — then his verdict in use, *"this tool is not working the way I expected
  it"*, and `1m`: the strikes drawer's rhythm area takes a texture take, BUILT ONE STEP AT A TIME, each used by him first — `1m.1` the
  row · `1m.2` the columns (third form: a column's players are its ticks) · `1m.3` duration. D24–D26. RUNNING_LOG §185–§239.

### SESSION 13 OPENS ON THIS — TYPES OF ARTICULATION (his word at the close, 2026-09-21)

*Run `/session-start` on **Fable** (design). `1m` is built by HIS METHOD: one step laid out with him (the planning method), built,
USED by him before the next — so nothing of articulation is planned yet.*

- **His words:** *"Next session will start with types of articulation."* It is item (3) of his `1m` scenario — *"articulation and
  percussion — not yet talked through"* (PLAN § `1m`, the scenario gathered; RUNNING_LOG §215 … §217).
- **Where it stands in the code (read, not heard):** a column's notes are the drawer's deal (`texture_cols.js` `txColNotes`, taken from
  `notesFor('orch')`), each keeping the `tech` the drawer gave it — the drawer's articulation per player. Nothing in the texture take
  chooses an articulation of its own yet.
- **The ground behind it:** his default SHORT articulations, chosen for Texture in `1l.1` (RUNNING_LOG §190 — english horn `stac_vel`,
  bassoon · horn · trumpet `staccato`, cello · double bass `spicc_vel`, the percussion from the take, else `claves pair 2 high`) · the
  strikes drawer's articulation per player (PLAN 1c, `ordinario`) · the Rhythm panel's dot card, which set an articulation per dot (`1l.6`,
  §205 · §213) · the standard short, 120 ms, and the lengths of `1m.3` (§236 · §237).
- **Also his, behind it, in the order he names:** Insert · the percussion row · dynamics · re-attack (PLAN § `1m`, *Held*).
- **`Resume reads:`** `docs/PLANNING_METHOD.md` · PLAN § `1m` (the header, the scenario, *Held*; `1m.3` for the latest form) ·
  RUNNING_LOG §190 · §217. Code only when a question names it: `score/public/texture_cols.js` · the drawer's articulation roster in
  `strike_drawer.js`.

### SESSION 13 · RUNNING ORDER — TWO PLANS DESIGNED, `1m.4` THEN `1n` (2026-09-22, Fable; his word: *"as long as you are keeping track and pls keep the overall organization"*)

*Phase 1 of the planning method, one issue at a time; nothing built. Position is announced at every wrap. Reorder only on his approval.*

**Part I — WHAT AN ARTICULATION IS** (RUNNING_LOG §243 · §244) — **agreed:** one named voice of one instrument; every entry carries as DATA its
kind (pitched · by key · fixed) · its loudness source (velocity · mod wheel) · its keys where by key. The by-key maps must be read from his rack.
Presets set aside; a saved set of his own noted (LG-79).

**Part II — THE ORCHESTRATION PANEL versus THE COLUMNS** (RUNNING_LOG §245; the terms there):
- ✓ 0. THE ARCHITECTURE — **DECIDED: THE LENS** (LG-81, RUNNING_LOG §248 · §249): the column owns its orchestration; the panel shows and edits the selection and keeps only a DEFAULTS memory. Rejected: mother → child · templates. *(promote to §4 at the close)*
- **BINDING from here (his, LG-81): THE SHIELD** — the strike mode (strikes · rhythm · long tone) behaves exactly as before `1m`; a required verification of every `1m` step.
- ✓ **DECIDED (LG-83, RUNNING_LOG §252): THE COLUMN IS A PASSIVE INDICATOR** — one gesture (select); every control in the OP, in two kinds kept apart: what a take carries (harmony · deal · articulations) and what the column alone carries (plays · length · dynamic, per row and per column). The double-click of 1m.3 goes. Closes D and H. *(promote to §4 at the close)*
- ✓ **CONFIRMED (LG-83): THE ONE RULE for a take** (§251) · **J** a mark switched off keeps its column
- **► A … H under the lens** — restated one line each (§249); B walked by scenario (§250 · §251) — **THE ONE RULE for a take** (§251) put to him; **E (the pattern changes) is the one still open**
- ✓ **I · J · K decided (§251 · §257):** I (b) click, SHIFT+click = the range, CTRL+click = one · J a mark off keeps its column · K (b) `deal: repeat | spread`, the plan's last step, built only on his word
- **✓ PHASES 1 · 2 · 3 CLOSED — `1m.4 articulation` WRITTEN INTO PLAN (§260), phase 3 skipped at his word; the calls made alone are marked [call] there. HIS ORDER (§261): DESIGN EVERY PLAN NOW — ► NEXT: vet `1n dynamics` (Fable, after `/postclear`) → vet `1o the save structure` — THEN BUILD AND TEST ONE AT A TIME, LATER, `1m.4` first (Opus)**
- ✓ **E RESOLVED (LG-84 → LG-85, §254 · §255): a texture load is always EMPTY; a pattern is a document of its own, saved under its own name, several per texture, and it CARRIES A COPY of the onsets** — so Texture needs no save protection (§254's decision 1 dropped). Today's code (one pattern per texture name, brought back on load) is the opposite and changes in the separate plan.
- **SEPARATE PLAN, noted at his word (LG-84): WHAT IS SAVED FROM THIS BUILD** — the pattern as a named document, what it holds, where it lives (today: the browser only, one store per tab — L). No answer now.
- **✓ `1n dynamics` DESIGNED AND WRITTEN (2026-09-22, later the same day — RUNNING_LOG §262 … §275, LG-86 … LG-99; PLAN § `1n`, 1n.1 … 1n.6): short samples · B2 one scale · `sample | follow | auto` · levels absolute, no base layer, a generate overwrites · flat · ramp · pointillistic · waves · `enter` · the `dyn` box · mod wheel on the fader · `1f` OUT. ► NEXT: `1o the save structure`.**
- **✓ `1o the save structure` DESIGNED BY THE AI AT HIS WORD, VETTED, AND WRITTEN (2026-09-22, Fable, after checkpoint #2 — RUNNING_LOG §276 … §278; PLAN § `1o`, 1o.1 … 1o.6): a pattern a named document with a COPY of its onsets · `texture ▾` starts one empty, `pattern ▾` recalls · `bank/patterns.json` a fifth store, the sequence library's rules · Insert the sequence's idiom, the range written, the document into the score. His three decisions (§277): A the range · B the two rules on one player's notes → `1n.1` · C Insert inside `1o`. ► ALL THREE PLANS WRITTEN, NOTHING BUILT. NEXT: checkpoint on Opus + clear → BUILD `1m.4`.**
- **✓ `1m.4 articulation` BUILT (2026-09-22, Fable — his word after `/postclear`: *"build 1m.4 articulation all the way thru independantly as much as possible"*): 1m.4.1 · .3 · .4 · .5 · .6, ONE COMMIT EACH, THE SHIELD verified in each (RUNNING_LOG §279 … §283) — every voice knows itself (`kind` · `loud` · `keys`, `roster_check`) · a by-key voice a ROW VOICE (`rowKeys`) · THE LENS (`texture_lens.js`: the broadcast, THE ONE RULE for a take, `rowTechs`, mixed marks, grey + the defaults) · the passive column with a `len` box per row · the stretch. `1m.4.2` waits on his rack (26 pending) · `1m.4.7` on his word. ► NEXT: HIS ONE TEST (reload the tab) → then `1n dynamics` on Opus.**
- **HIS STANDARD for the rest of 1m.4 (LG-82):** the expedient rule, functionality preserved, troubleshooting avoided, convenience second
- B. Primary-only versus shared actions
- C. A fresh column
- D. The panel with nothing selected
- E. The pattern changes — what becomes of the columns
- F. Reload and source switch — what the panel shows on return
- G. Two defaults for a column's articulation (A's twin)
- H. The players list in a multi-selection

**Then:** the top line of `1m.4` (phase 2) → the steps (phase 3) → written into PLAN → **plan 2, DYNAMICS with hairpins and crescendos** (his agenda item 2, LG-74).

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| ✓ | **`1n dynamics` WRITTEN INTO PLAN 2026-09-22** — PLAN § `1n`, six steps 1n.1 … 1n.6, phase 3 skipped at his word; RUNNING_LOG §262 … §275, LG-86 … LG-99; `1f` stays OUT, its own `todo` (§274) | Fable | — |
| ✓ | **`1o the save structure` WRITTEN INTO PLAN 2026-09-22** — PLAN § `1o`, six steps 1o.1 … 1o.6, designed by the AI at his word and vetted (§276), his three decisions (§277), phase 3 written whole at his word (§278); the two rules on one player's notes went into `1n.1` | Fable | — |
| ✓ | **`1m.4 articulation` BUILT 2026-09-22** — 1m.4.1 · .3 · .4 · .5 · .6, five commits, THE SHIELD in each (RUNNING_LOG §279 … §283); the calls made alone listed in §283 | Fable | — |
| ✓ | **`1o.1 the document` BUILT 2026-09-22** (Fable, RUNNING_LOG §291) — the pattern a document of its own in `texture_row.js`, the dots copied once, every named check run, THE SHIELD byte-identical; his one test of `1m.4` (§284 · §285) still owed | Fable | — |
| ✓ | **`1o.2` · `1o.3` · `1o.4` · `1o.5` BUILT 2026-09-22** (Fable, at his word *"move through the whole 1o plan independantly"* — RUNNING_LOG §292 … §295; commits `ee3a172` · `abbf901` · `416bfa6` · the fifth): documents by id → on disk in `bank/patterns.json` (the FIFTH store, `test_snapshots` 30) → the library controls on the pattern line → Insert the sequence's idiom; THE SHIELD byte-identical in each | Fable | — |
| **►►** | **`1n.6` HIS ONE TEST — RELOAD his tab (page files only; `1o.6`'s RESTART for the fifth store still stands if not yet done).** In his rack, on a texture pattern: select a stretch of columns, `dynamics` on the panel → `flat pp` · generate; another stretch → `ramp ↑ pp → ff`; another → `pointillistic · Webern`; another → `waves · breathing`, `who moves: each player`; one hand swell typed in a row's `dyn` box (`mp-f-mp` on a row with a length); SPACE to hear, Insert, play the score; record; `node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua` — every short note at its ladder velocity with a CC7 before it on a curve channel, MAIN ch 1 empty of the pitched rows (the percussion and the mallets there by design), every follow at mf with CC7 moving; **his ear on the one scale: a short `pp` beside a held `pp`**. Revise on his word; old tests not carried forward. his call B (2026-09-23, §301 · D27): a brass short on ANY voice takes its set fader on its own channel — one `staccato` column in the test too, beside an `ord` one | his ear · then Opus for the revisions (Fable only if his ear puts the one scale itself in question) | yes — this is checkpoint #7; `/postclear` on Opus |
| ✓ | **`1q.1` THE TAKE ONTO A SELECTION — BUILT AND VERIFIED 2026-09-24** (Fable, RUNNING_LOG §312; PLAN § `1q`, planned the same day at his word — §306 … §311, LG-103): `score/public/harmony_sel.js` new — the HARMONY STRIP at the top right of the score whenever pitched notes or trills are selected · `take ▾` = the sequence drawer's takes menu through its new optional `opts` (`sequence_ui.js`, five lines) · the take dealt onto the selection (each note its own player's pitch and cents, a trill its lower note, the vibraphone's two seats in time order) · the original remembered ON the object (`hq.was`, once) · `back (n)`; `composer.html` one script tag. Verified end to end on `score-5401` with real clicks; THE SHIELD (a box's own menu) held; all 254 objects identical at the end, 0 POSTs | Fable | — |
| ✓ | **`1q.2` THE MARQUEE — BUILT AND VERIFIED 2026-09-24** (Fable, RUNNING_LOG §313): CTRL+drag on empty lane space (one block in the container's mousedown, BEFORE the SHIFT-span branch — found and fixed: SHIFT+CTRL had been taken as a span), `HarmonySel.beginMarquee` · `selectTouched`; touched objects on player lanes selected by `selectObject` additive, SHIFT+CTRL adds, the after-click swallowed, ESC cancels, under 4 px a click. The pane's drag tool cannot hold CTRL, so the CTRL path was verified with dispatched events and the plain drag (scroll) with real input; **the real CTRL+drag is his 1q.4** | Fable | — |
| ► | **BUILD `1q.3` THE STACK** (PLAN § `1q.3`): verify the existing cycling (`pickFromStack`) with real clicks on a stack · the ALT+click list on every player lane (`openStackPicker` on `stackAt` · `stackLabel`, the META picker unchanged) · the place in the stack on the strip · the trill's press (`bodyHit`) joins `pickFromStack` → then `1q.4` his one test (reload the tab: a real CTRL+drag, `take ▾`, `back`, a stack) | Fable, at his word | — |
| ✓ | **`1p` THE END TIME AND THE CURSOR'S CLOCK — BUILT AND VERIFIED 2026-09-24** (Fable, RUNNING_LOG §303, one commit; planned the same day, §302, LG-102): `length \| end` on the length line — an end on the pattern's clock, the length written behind it, three columns released at one end, the switch a browser preference — AMENDED at his word (§304): a `len \| end` menu ON EVERY ROW of the orchestration panel beside its box, the bar's for the column's box alone · the cursor's time after `]`, running while it plays; THE SHIELD byte-identical in both. **HIS ONE TEST:** reload the tab; on a pattern, `end` on the length line, one end typed over three selected columns, heard; the readout while SPACE runs | his ear | — |
| ✓ | **`1n.4` THE POINTILLISTIC MODEL and `1n.5` THE WAVES MODEL — BUILT 2026-09-22** (Fable, RUNNING_LOG §299 · §300, one commit): the dials in words, five presets, one stream in time order · the sequence's waves whole, `who moves`, one library; THE SHIELD | Fable | — |
| *(was)* | **BUILD `1n.4` THE POINTILLISTIC MODEL** (PLAN § `1n.4`): three dials in words on the `dynamics` line when the model is `pointillistic` — `rate` (every note · every few · every many · twice a passage) · `distribution` (even · few then many · many then few) · `contrast` (small steps · any · extremes only) — five provisional presets (`Webern` · `accents` · `drift` · `terraced` · `wild`), a moved dial reads `custom`, `save preset` beside the wave presets in the sequence store [call]; ONE seeded stream over the range's notes in TIME ORDER across the chosen rows, every level a written name between `low` and `high`, a held note by `auto`; its REQUIRED VERIFICATION and THE SHIELD — then `1n.5` the waves model; 1n.6 his | Fable | — |
| ✓ | **`1n.3` RANGES `flat` AND `ramp` — BUILT 2026-09-22** (Fable, RUNNING_LOG §298): the `dynamics` line · generate · `who` · `enter: fade` · the bands (a real click) · undo; THE SHIELD | Fable | — |
| *(was)* | **BUILD `1n.3` RANGES: `flat` AND `ramp`** (PLAN § `1n.3`): the range IS the selection; a `dynamics` line in the panel — `low` · `high` (`n` for niente at a ramp's low end) · `who` · `model` (`flat` · `ramp ↑` · `ramp ↓` · `pointillistic` · `waves`, the last two arriving with 1n.4 · 1n.5) · `enter` (`abrupt` · `fade N s`) · `seed` ↻ · `generate`; a generate writes every note's level in the selected columns for the chosen rows as `{ pts }` (the hand-set ones overwritten and counted, §267); `ramp` by TIME, a held note by `auto`; `enter: fade N s` from the level before the range; remembered on the document as `ranges` (the undo snapshot grows), drawn as a BAND under the marks, a click re-selects; its REQUIRED VERIFICATION and THE SHIELD on `score-5401` — then 1n.4 → 1n.5; 1n.6 his | Fable | — |
| ✓ | **`1n.2` THE SINGLE NOTE BY HAND — BUILT 2026-09-22** (Fable, RUNNING_LOG §297): the `dyn` box and the switch per row, the lens, the mark, undo — verified with the pane's real input; THE SHIELD | Fable | — |
| ✓ | **`1n.1` ONE SCALE FOR SHORT AND HELD — BUILT 2026-09-22** (Fable, RUNNING_LOG §296): the residual (`dyn_table.js`, `dyn_table_check` 68) · `score/public/texture_dyn.js` the one helper (B2 · `sample \| follow \| auto` · the curve seats · the faders after `playNotes`) · the cut and the flag in `texture_cols.js` · Insert re-pointed (`texture_insert.js`); THE SHIELD byte-identical on four captures. FOUND: the SI2 brass carry a curve copy for `ord` alone — his call | Fable | — |
| his | **`1o.6` HIS ONE TEST — FIRST RESTART `node score/server.js` (the fifth store) AND RELOAD the tab.** In his rack: `texture ▾` starts a pattern, name it (ENTER), deal a few columns, close and reopen the tab, `pattern ▾` brings it back, Insert at a playhead (the drawer's own button; the range's left line on the playhead), play the score — the same notes as SPACE, struck (until `1n`); a second pattern on the same texture (`new`). His existing patterns come over untitled. Revise on his word; old tests not carried forward → then **BUILD `1n dynamics`** (PLAN § `1n`, 1n.1 first — its READ `docs/DYNAMICS_LAW.md`; `1n.1` re-points SPACE and Insert at one helper) | his ear · then Opus | yes before `1n` — checkpoint, clear, `/postclear` on Opus |
| *(was)* | **HIS ONE TEST of `1m.4`** — reload the tab (no restart); the texture take: the menus by name and key, the lens on a selection, a click selects a column, SHIFT / CTRL for a stretch, the `len` box per row, the sets leaving the percussion; duration vetted in it (§259). Then revise if needed → **BUILD `1o` (one-oh) THE SAVE STRUCTURE** (PLAN § `1o`, 1o.1 → 1o.5 one commit each, 1o.6 his; Insert writes today's notes until `1n.1` re-points it — his order, RUNNING_LOG §288) → then `1n dynamics` | his ear · then Opus | yes before `1o` — checkpoint, clear, `/postclear` on Opus |
| ✓ | **`1m.4.2` the by-key maps** — CLOSED AT HIS WORD 2026-09-22 (RUNNING_LOG §290): five written (§287 · §289), 21 pending, each picked up when he uses it — its name and the Preset Designer's `low · high`, typed | his word | — |
| — | **`1m.4.7 deal: repeat \| spread`** — written, built only on his word | Opus | — |
| ✓ | **plan 2 — DYNAMICS** — written 2026-09-22 as PLAN § `1n` (see above); `1f` does NOT belong to it (§274) | — | — |
| ► | **the builds, one per clear, his listen between:** `1m.4` → dynamics → the save structure + Insert. His tests of `1m.1` · `1m.2` · `1m.3` still owed — what matters from them now is the SOUND and the row (step 5 of `1m.4` replaces the column's gestures) | Opus | yes |
| ✓ phase 1 | **TYPES OF ARTICULATION in the texture take — his word; `1m`'s scenario item (3).** The planning method's phase 1 with him, then his method for this tool: one step laid out, built, used by him (the block above) | Fable | yes — a new session |
| N0 | **the rest of `1m`, in the order he names:** Insert · the percussion row · dynamics · re-attack (PLAN § `1m`, *Held*) | Fable to lay out · Opus to build | — |
| N0a | **the Rhythm sequence panel and `1l.8`** — not decided since his verdict (§214); he composed `LGMF-Rseq-01` with it. The three items collected in it (§207: triangles where the claves should be · Texture resizable · SPACE stays Texture's) wait on that decision | his | — |
| N0b | **MULTITEMPO AS A RHYTHM SOURCE** (LG-61; RUNNING_LOG §208 · §209) — planning phase 1 closed for Texture: ratios · BPM · length, steady first, accel / decel later; `1m`'s `source` menu already reserves `multitempo — later` | Fable | yes |
| N1 | **`1k` the morph's peaks against the sequence** — `todo`, BEFORE his next morph: *"fine for this section but I'd like to look into it before I do the next one"* | Fable to look · Opus to build | — |
| N2 | **`1f` the crescendo tool under the dynamics law** — `todo`: `cresc*.js` write no `cc7Abs` / `velAbs` (read in the code, not captured) | Fable to lay out · Opus to build | — |
| his | **his listens, never reported** — `1h` H4 · `1i` VB6 · `1j` BR4; he composes with all three. If he reports a fault, the first reads are RUNNING_LOG §171 · §176 · §181 | his ear | — |
| N3 | **the rest of phase 1** — the pattern tool LG-7 · the morph to a held beating LG-8 · conductions LG-3 · the morph's revision (`MORPH_NOTES.md`) · how the six chords are used in time · the LGMF call (Q2) | Fable | yes |
| N4 | **small, in NITS** — `beating_calc_check.js` · `morph_septet_check.js` still piece #5's cast · the validator does not know `provenance.palette` · re-derivation drift on nine LG actuals · an uncaught `TypeError` at `sequence_ui.js:1652` on a bare load · `heard()` empty for an LGMF model · the strikes drawer's plain inserts may play `recVel` unremapped | Opus | — |

**Open at session end — CHECKPOINT #8 (2026-09-24, session 13 — `1p` planned and built on Fable, the tabs and the wrap on Opus) *(mid-session checkpoint — READ THIS ONE; #7 below still holds for `1n.6`)*:**
- **THE TASK: HIS TESTS — nothing is being built.** Three builds wait on his ear, all in his tab: **`1p` the end time and the cursor's
  clock** (new today) · `1n.6` dynamics (checkpoint #7 below) · `1o.6` the save structure (he is using it already).
- **WHAT TODAY PUT IN HIS HANDS (all committed, pushed):**
  - **`1p` (PLAN § `1p`; RUNNING_LOG §302 the talk · §303 the build · §304 his correction; LG-102):** on EVERY ROW of the orchestration
    panel a `len | end` menu just before the row's box — `end` shows `onset + len` and a typed end writes the length behind it, each selected
    column from its own onset (one end over several columns = a release together); per row, in the browser (`_txS.endRows`), never in the
    pattern. The bar's `length | end` menu means the COLUMN's box alone. The cursor's time `#txClock` after `]`, running while SPACE plays.
    Code: `score/public/texture_cols.js` · `texture_row.js`. Commits `def7369` · `30c71dc`.
  - **The panel tabs off the composer's bottom bar (§305, commit `d71eb02`):** RHYTHM · SEQUENCE · BEATING · STRIKES at `bottom: 34px`,
    side by side — one CSS block in `score/public/composer.html`. All 28 bar controls reachable at a width where the bar fits.
  - **Answered, nothing built:** a whole column's length = the bar's `length` box (a row's own stands over it) · a whole column's dynamic
    = the `dynamics` line, `flat`, `low` = `high`, all `who` · recording captures every held key (poly) whatever the lane — `onHwMidi`
    tracks each key · a brick moves to another part by a vertical drag (SHIFT locks the axis).
- **THE NEXT CONCRETE STEP IS HIS. Tell him, then wait:** reload the tab (page files only) → `1p`: select three columns, a row's menu to
  `end`, one time typed → the three notes end together; another row left on `len`; the clock while SPACE runs. `1n.6` as in checkpoint #7
  below. Revise on his word, on Opus.
- **`Resume reads:`** only for his feedback — on `1p`: RUNNING_LOG §303 · §304 and PLAN § `1p`; on `1n`: as checkpoint #7 names; journal §2
  STILL BINDING before any verification. Code: `score/public/texture_cols.js` first. **Nothing else.**
- **Decisions pending him (new today):** a column `dyn` box beside the column's `length` (offered, not taken up) · the bottom bar scrolling
  sideways on a narrow window (its controls need ~2,140 px; offered) · a brick dragged to another lane KEEPS its old articulation — the drop
  does not re-pick it (`composer.html` ~5707, read, not heard; seen, not changed) · the calls of §303 · §304 (the preference per row in the
  browser · two decimals · the menu before the box · the bar's menu kept for the column box). **Carried from #7:** his word on `1n.6` ·
  `1o.6` · `1m.4` (§284 · §285) · the calls of §296 … §301 · whether `bank/patterns.json` goes into git · the triangle on track 10 (§221) ·
  `ACT-BLOOM-03` · `-04` · a `sec01-done` tag.
- **DELIBERATELY UNCOMMITTED — all his, none of it mine to touch** (`git status --short`): `bank/panel_snapshots.json` (his harmony takes,
  written by the app) · `bank/sequences.json` (his sequence library) · `reaper/LGMF_rack.rpp` (his rack, saved by Reaper) · untracked
  `bank/rhythm_takes.json` · `bank/rhythm_sequences.json` (the Texture stores of `1l`) · untracked `bank/patterns.json` (his patterns —
  `Sec2_01a` and two untitled; git is his call, §278) · **untracked `scores/pointilistic01a.json` — HIS new score, saved by his tab today; no
  score is committed here.** The throwaway `score-5401` wrote nothing: every POST caught by the stub, its three localStorage keys cleared,
  the server stopped. **Unsaved working copies** (`node tools/unsaved_check.js`): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` —
  the same four as checkpoints #2 … #7, none the piece; his to Save or Reload.

**Open at session end — CHECKPOINT #7 (2026-09-22/23, amended 2026-09-24 — session 13, the builds on Fable, the wraps on Opus) *(mid-session checkpoint — READ THIS ONE)*:**
- **SINCE THE FIRST WRITING OF THIS BLOCK — THE BRASS SET UP (2026-09-23, his *"lets set up the brass"* then *"b"*; D27, RUNNING_LOG §301,
  commit `16680c3`):** a short note on a voice with NO curve copy (the SI2 three have one for `ord` alone) takes its set fader on its OWN
  channel — instance 1's part — no rack change; verified through the score's own playback (the bassoon on `staccato`: CC7 57 pre-armed
  85 ms before the note-on v67 on `lgbassoon` ch 14). A `follow` on such a voice stays velocity alone, struck on the ladder, the status
  saying so. Only `score/public/texture_dyn.js` (`txDynOwn`) and two words of `texture_insert.js` changed.
- **HE IS USING `1o` ALREADY:** `bank/patterns.json` was written by HIS tab on 2026-09-24, 11:26 … 11:52 — two untitled patterns and a
  NAMED one, `Sec2_01a` on `LGMF-S2-R01a` (7 on, 7 columns, no ranges). So he has restarted the server (the fifth store). His word on
  `1o.6` is not in; do not claim it passed.
- **THE TASK: `1n` (one-en) DYNAMICS IN THE TEXTURE TAKE — BUILT END TO END, NOTHING OF IT HEARD.** His word after `/postclear`: *"go for
  the 1n dynamics build, try to build as much as possible independantly"* (built on Fable at his word, over checkpoint #6's Opus).
  `1n.1` … `1n.5` in four commits, THE SHIELD verified in each on `score-5401` (RUNNING_LOG §296 … §300): `1eb43f7` one scale for short and
  held · `c9a64c0` the single note by hand · `4fae1fe` ranges `flat` and `ramp` · `19865eb` the pointillistic and the waves models.
- **WHAT EACH STEP PUT IN HIS HANDS, one line each:** `1n.1` — B2: a short note keeps its LADDER velocity and goes out on a curve channel
  with its fader set once from THE RESIDUAL (`dyn_table.js residual`, 1.71 + 2.29 = 4 dB a name); a held note `sample | follow | auto` (auto
  = follow when the level moves a written step); the one helper `score/public/texture_dyn.js`, read by SPACE, the column preview and
  Insert; a length CUT at that player's next onset; too-close ATTACKS on one player FLAGGED, never moved; Insert writes what Hear sends ·
  `1n.2` — on every row of the players list (texture mode only) a `dyn` box (`mp` · `mp-f` · `mp-f-mp`, `n` at an end) and the `auto |
  sample | follow` switch, the lens, a mark beside each lit circle (at a zoom where they can be read) · `1n.3` — a `dynamics` line at the
  head of the panel: `low` · `high` · `who` · `model` · `enter: abrupt | fade N s` · `seed` · generate over the selected columns; a range
  remembered on the pattern and drawn as a band (a click re-selects it) · `1n.4` — `pointillistic`: `rate` · `distribution` · `contrast` in
  words, five provisional presets (Webern · accents · drift · terraced · wild), `save preset` · `1n.5` — `waves`: the sequence drawer's own
  generator, dials and preset menu (one library both ways), `who moves: each player · together · groups`.
- **THE NEXT CONCRETE STEP IS HIS: `1n.6`, HIS ONE TEST.** Tell him, then wait: **RELOAD his tab** (page files only — no restart for `1n`;
  `1o.6`'s server RESTART for the fifth store still stands if he has not done it). In his rack, on a texture pattern: select a stretch of
  columns → `dynamics` → `flat pp` → generate; another stretch → `ramp ↑ pp → ff`; another → `pointillistic · Webern`; another → `waves ·
  breathing`, `who moves: each player`; one row with a length → type `mp-f-mp` in its `dyn` box; SPACE to hear; Insert; play the score;
  record; `node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua` → every short note at its ladder velocity with a CC7 before
  it on a curve channel · MAIN ch 1 empty of the pitched rows (the percussion and the vibraphone's mallets are there by design) · every
  `follow` at mf with CC7 moving. **His ear on the one point: a short `pp` beside a held `pp`** — and, for D27, **a brass short at `pp` on
  `staccato` beside one on `ord`** (his rack's answer to a CC7 under 127 on an instance-1 part is the one thing not verified). Revise on his word; old tests are not
  carried forward.
- **Latest deliverables:** `score/public/texture_dyn.js` (new — the helper and all five steps' UI) · `score/public/dyn_table.js` (the
  residual) · `tools/dyn_table_check.js` (**68**) · `score/public/texture_cols.js` (the cut, the flag, SPACE dressed) ·
  `score/public/texture_insert.js` (Insert on the helper) · `score/public/sequence.js` (exports `buildStream` · `rngFor`; `generate`
  untouched, `sequence_check` 180) · `composer.html` (one script tag) · `docs/DYNAMICS_LAW.md` §3 **Rule 4** (the texture's one scale).
- **`Resume reads:`** for his test's feedback — the RUNNING_LOG entry of the step he faults (§296 `1n.1` · §297 `1n.2` · §298 `1n.3` ·
  §299 `1n.4` · §300 `1n.5`) and PLAN § that step; `docs/DYNAMICS_LAW.md` §3 Rule 4 if the SOUND is at fault; journal §2 STILL BINDING
  before any verification. Code: `score/public/texture_dyn.js` first. **Nothing else.**
- **Decisions pending him:** *(the SI2 brass — DECIDED 2026-09-23, his "b": D27, RUNNING_LOG §301 — a set fader on the note's own
  channel, no rack change; a moving fader on such a voice still needs a copy, the status says so; his rack's answer to a CC7 under 127 on an
  instance-1 part is what his `1n.6` test hears)* · the calls made alone in §296 … §300 (the flag on attacks alone · the vibraphone's
  bowed voices the measured ones · the deal's velocity as a note's default level · the marks hidden under 22 px a gap · the band's place ·
  the fade's "level before" read where the row's last note ended · the dials' meanings and the presets' settings · `extremes only` as
  single-note accents · `pointPresets` in the sequence store) · his one test of `1o` (`1o.6`) and of `1m.4` (§284 · §285) · whether
  `bank/patterns.json` goes into git · the calls of §295 · the triangle on track 10 (§221) · `ACT-BLOOM-03` · `-04` · a `sec01-done` tag.
- **THE METHOD, learned this build (in STILL BINDING now):** the throwaway page writes HIS bank files at boot on its own — the fetch and
  beacon stubs go in the SAME batch as the navigation, before any sleep; clear its `lgmf.sequenceDrawer.v1` · `lgmf.rhythmSequence.v1` ·
  `lgmf.textureRow.v1` at the end (done); THE SHIELD's BEFORE is captured on HEAD's files (`git stash push -- <paths>`, reload, capture,
  `git stash pop`); a `find` ref goes stale at every re-render of the drawer's rows; stub EVERY port before a claim about curve seats.
- **DELIBERATELY UNCOMMITTED — all his, none of it mine to touch** (`git status --short` at this checkpoint): `bank/panel_snapshots.json`
  (his harmony takes, written by the app) · `bank/sequences.json` (his sequence library — re-stamped once more at 2026-09-22 21:38:55 by the
  THROWAWAY page's boot save, `LGMF-R01c`'s row unchanged; his to commit) · `reaper/LGMF_rack.rpp` (his rack, saved by Reaper) · untracked
  `bank/rhythm_takes.json` · `bank/rhythm_sequences.json` (the Texture stores of `1l`; his takes) · **untracked `bank/patterns.json` —
  HIS, written by his own tab 2026-09-24 (`Sec2_01a` and two untitled); whether it goes into git is his call (§278).** **Unsaved working copies** (`node
  tools/unsaved_check.js`, run at this checkpoint): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the same four as checkpoints
  #2 … #6, none the piece; his to Save or Reload. No score is committed here.
**Open at session end — CHECKPOINT #6 (2026-09-22, session 13, Fable's build, the wrap on Opus) *(before it)*:**

- **`1o` (one-oh) THE SAVE STRUCTURE IS BUILT — 1o.1 … 1o.5, ONE COMMIT EACH, THE SHIELD verified in each (RUNNING_LOG §291 … §295;
  commits `4eecec5` · `ee3a172` · `abbf901` · `416bfa6` · `9681a78`).** At his word: *"go ahead and move through the whole 1o plan
  independantly as much as possible"*. A texture pattern is now A DOCUMENT OF ITS OWN carrying a copy of its onsets · kept on disk in
  `bank/patterns.json`, THE FIFTH STORE · `texture ▾` starts an empty one, `pattern ▾` recalls, several per texture · name · save ·
  revert · • · duplicate · × · new on the pattern line · the drawer's own Insert writes it into the score, the sequence's idiom.
  **Not built, by the plan: `1o.6` — HIS ONE TEST.**
- **THE NEXT CONCRETE STEP IS HIS, AND IT NEEDS A SERVER RESTART: `1o.6`.** Tell him, then wait: **restart `node score/server.js`** (a
  fifth store — a running server keeps the module it started with) **and reload the tab.** Then in his rack: `texture ▾` starts a
  pattern on a texture · name it + ENTER · deal a few columns · close and reopen the tab · `pattern ▾` brings it back · Insert at a
  playhead (the drawer's OWN `Insert @ playhead`; the range's left line lands there) · play the score — the same notes as SPACE, struck
  on MAIN until `1n` · then `new` for a second pattern on the same texture. His existing patterns come over as untitled entries at the
  first load. Old tests are not carried forward.
- **THE STEP AFTER, as an instruction:** on **Opus**, after his word on `1o.6` — **build `1n.1`**, the first step of PLAN § `1n`'s build
  order (its READ is `docs/DYNAMICS_LAW.md`; one helper `texture_dyn.js` that SPACE *and* Insert both read — `1o.5` writes today's notes
  until it lands, §288; the two rules on one player's notes are in `1n.1`, §277). One commit per step, the step's REQUIRED VERIFICATION
  and THE SHIELD run in each on `score-5401`. Do not start until he says go (his standing postclear rule).
- **Latest deliverables:** `score/public/texture_insert.js` (new — Insert) · `score/public/texture_lib.js` (new — the store and the
  library controls) · `score/public/texture_row.js` (the document, the two-line bar, `pattern ▾`) · `score/public/texture_cols.js`
  (`txNotesBetween`, ONE list for SPACE and Insert) · `score/snapshots.js` + `tools/test_snapshots.js` (the fifth store, **30**) ·
  `score/public/composer.html` (two script tags).
- **`Resume reads:`** journal §2 **STILL BINDING** (the verification method, `score-5401`) · RUNNING_LOG **§295** (what `1o.5` writes and
  what it does not — the next question about Insert is answered there). **For his test's feedback:** PLAN § `1o` (the step he faults).
  **For the `1n` build:** PLAN § `1n` (the header and 1n.1 only; the rest as its step comes) · `docs/DYNAMICS_LAW.md` · §283's last
  paragraph (the pane's frame scaling, the screenshot prerequisite, the timer clamping). **Not needed:** RUNNING_LOG §291 … §294 (open
  one only when a question sends you there).
- **Decisions pending him:** his one test of `1o` (`1o.6`) · his one test of `1m.4` and the two fixes in it (§284 · §285), still owed ·
  whether `bank/patterns.json` goes into git once his first pattern creates it (§278) · **the calls made alone in this build, his to
  reverse** (§295 lists all seven: a pre-1o.1 pattern upgraded in place · the texture and the id in an untitled name · a blank pattern is
  not a document · the row grows to its bar lines on a texture take · the `•` ignores `sel` and `cursor` · the drawer's own Insert button
  taken over and the strike's other two inserts refused on a texture take · the pattern's colour) · the [call]s in PLAN § `1n` (§275) ·
  the triangle on track 10 (§221) · `ACT-BLOOM-03` · `-04` · a `sec01-done` tag.
- **ONE THING NOT ESTABLISHED, in §295:** `bank/sequences.json` was byte-identical at 1o.3's check and had been re-saved at **21:12** by
  the wrap, its one named entry `LGMF-R01c` re-stamped with its row BYTE-IDENTICAL. The throwaway tab's non-pattern POSTs and its beacon
  were stubbed in every load and a forced flush from it reached no disk, so the writer was most likely his own tab at :5400. Nothing in
  the library changed but the stamp; the file is his to commit either way.
- **DELIBERATELY UNCOMMITTED — all his, none of it mine to touch** (`git status --short`): `bank/panel_snapshots.json` (his harmony
  takes, written by the app) · `bank/sequences.json` (his sequence library — see the line above) · `reaper/LGMF_rack.rpp` (his rack,
  saved by Reaper) · **untracked** `bank/rhythm_takes.json` · `bank/rhythm_sequences.json` (the Texture stores of `1l`; his takes).
  **`bank/patterns.json` is NOT here:** the throwaway server created it with five test entries during `1o.3`'s check and it was
  DELETED at the end of the build, so his first real pattern creates it clean. **Unsaved working copies** (`node tools/unsaved_check.js`):
  `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the same four as checkpoints #2 … #5, none the piece; his to Save or Reload.
  No score is committed here.

**Open at session end — CHECKPOINT #5 (2026-09-22, session 13, Fable) *(before it)*:**

- **THE TASK IN HAND: BUILD `1o` (one-oh) THE SAVE STRUCTURE — nothing of it built.** His word: *"ok lets do the save next 1o"*. It goes
  BEFORE `1n` (one-en) dynamics, decided at his word (RUNNING_LOG §288): Insert is what lets him EXTEND the sequence (LG-101). `1m.4
  articulation` is built and closed; `1m.4.2` closed at his word with 21 voices pending (§290).
- **`1o` IS BUILT — 1o.1 … 1o.5 (2026-09-22, Fable, RUNNING_LOG §291 … §295), five commits, THE SHIELD in each. THE NEXT CONCRETE STEP IS HIS: `1o.6`, his one test — RESTART the server (the fifth store, `patterns`) and RELOAD the tab (the ►► row above says what to try). Then `1n dynamics` on Opus after a checkpoint + clear. The instruction below is history.**
- **THE NEXT CONCRETE STEP, as an instruction:** on **Opus**, after `/clear` + `/postclear` and HIS GO — **build `1o.1 the document`**: PLAN §
  `1o`, its first step — today's `pats[name]` becomes THE DOCUMENT `{ v, id, name, texture: { name, n, span, gap10, dots }, on, range, cursor,
  short, cols, sel }`, the dots copied ONCE at the start, `txPat()` returning the open one, the "take has changed" reset gone; its REQUIRED
  VERIFICATION and THE SHIELD run on `score-5401` (no MIDI, the POSTs stubbed), then ONE COMMIT. Then 1o.2 → 1o.3 (**restart the server after
  it** — a fifth store) → 1o.4 → 1o.5, one commit each; 1o.6 his. **`1o.5` Insert writes TODAY's notes** (the deal's velocity, 1m.3's lengths
  uncut, no `follow`) — `1n.1` re-points it later (§288). The calls made alone go in the log, marked, his to reverse.
- **Latest deliverables (this checkpoint's commit):** `score/public/texture_cols.js` — two fixes from his one test of `1m.4`: a length bar
  drawn when its circle is off the left edge (§284) · a play from mid-way sounds the notes still sounding at the cursor (§285) — **his reload
  and word on them still owed**; `sandbox/instruments.js` `BY_KEY_MAPS` (§287 · §289; commit `d882f30`).
- **`Resume reads:`** PLAN § `1o` (whole — the six steps, each with its REQUIRED VERIFICATION and THE SHIELD) · RUNNING_LOG §288 (the order,
  what Insert writes now) · journal §2 STILL BINDING and §283's last paragraph (the pane's verification method) · SEQUENCE_TOOL §10 · §16
  (the sequence's Insert and library, the idiom `1o.4` · `1o.5` copy). Code only as each step names it: `score/public/texture_row.js`
  (`txLoad`, `realize`, the browser key) · `texture_cols.js` (`txCols`, `txPersist`) · `sequence_ui.js` (`insert`, the library) ·
  `score/snapshots.js` (`STORES`).
- **Decisions pending him:** his one test of `1m.4` (reload; §284 · §285 in it) · the [call]s in PLAN § `1o` (§278) and § `1n` (§275) · whether
  `bank/patterns.json` goes into git when `1o.3` creates it · the five calls of §283 · the triangle on track 10 (§221) · `ACT-BLOOM-03` · `-04`
  · a `sec01-done` tag.
- **DELIBERATELY UNCOMMITTED — all his, none of it mine to touch** (`git status --short`): `bank/panel_snapshots.json` (his harmony takes,
  written by the app) · `bank/sequences.json` (his sequence library) · `reaper/LGMF_rack.rpp` (his rack, saved by Reaper) · **untracked**
  `bank/rhythm_takes.json` · `bank/rhythm_sequences.json` (the Texture stores of `1l`; his takes). **Unsaved working copies** (`node
  tools/unsaved_check.js`): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the same four as checkpoints #2 … #4, none the piece;
  his to Save or Reload. No score is committed here.

**Open at session end — CHECKPOINT #4 (2026-09-22, session 13, Fable's build, the wrap on Opus) *(mid-session checkpoint — READ THIS ONE)*:**

- **`1m.4 articulation` IS BUILT — 1m.4.1 · .3 · .4 · .5 · .6, one commit each (`485842c` · `383b5a2` · `6290d36` · `85f0847` · the sixth), THE SHIELD
  verified in each on `score-5401` with no MIDI (RUNNING_LOG §279 … §283). Not built, by the plan: `1m.4.2` (his rack, 26 pending) · `1m.4.7` (his word).**
- **THE NEXT CONCRETE STEP: HIS ONE TEST** — he reloads his tab (no server restart: page files and the recipe only). What to try, in the texture take:
  the row menus (a `key` voice a heading, its keys under it; `mw` greyed) · a key chosen on the percussion → its note the key, no pitch dealt · a
  column selected by a click (not a tick any more), the panel editing it · SHIFT+click a stretch, CTRL+click one · a set, a voice, a tick, `len` on
  a row with several selected → all of them · a take onto a dealt column (its pitches only) and onto an empty one (its players too) · ESC → the
  defaults. Old feedback is not carried forward (§259). Then `1n dynamics` on Opus after a checkpoint + clear.
- **Latest deliverables:** `sandbox/instruments.js` (kind · loud · keys) · `tools/roster_check.js` · `score/public/strike_drawer.js` (KINDS, `rowKeys`,
  `chooseTech`, the menus and the picker) · `score/public/texture_cols.js` (the passive column, `len` per row, the stretch) · `score/public/texture_lens.js`
  (new) · `tools/apply_perc.js` (writes `kind` · `loud`).
- **`Resume reads:` for his test's feedback** — RUNNING_LOG §279 … §283 (one per step) · PLAN § `1m.4`. **For the `1n` build:** PLAN § `1n` (1n.1 first;
  its READ is `docs/DYNAMICS_LAW.md`) · journal §2 STILL BINDING · §283's last paragraph (the pane's frame scaling, the screenshot prerequisite, the
  timer clamping) · the code as each step names it.
- **Decisions pending him from this build** (the calls made alone, §283): the strike mode's menu group `key` · a pending voice's note names in the picker
  only · a fresh column from the defaults' harmony · a by-key voice in the strike mode sounding at the first onset · the drawer's `back` in a texture take. **Carried from checkpoint #3, still his:** the [call]s in PLAN § `1n` (§275) and § `1o` (§278) · the triangle on track 10 (§221) · `ACT-BLOOM-03` · `-04` · a `sec01-done` tag · whether `bank/patterns.json` goes into git when `1o` creates it.
- **DELIBERATELY UNCOMMITTED — all his, none of it mine to touch** (`git status --short` at this checkpoint): `bank/panel_snapshots.json` (his harmony takes, written by the app as he works) · `bank/sequences.json` (his sequence library) · `reaper/LGMF_rack.rpp` (his rack, saved by Reaper) · **untracked** `bank/rhythm_takes.json` and `bank/rhythm_sequences.json` (the Texture stores of `1l`; his takes, never committed). **Unsaved working copies** (`node tools/unsaved_check.js`): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the same four as checkpoints #2 and #3, none of them the piece; his to Save or Reload. No score is committed here.
- **The verification method this build added, for whoever builds next** (RUNNING_LOG §283's last paragraph, beside journal §2 STILL BINDING): the pane is SCALED to its frame, so a DOM rectangle must be multiplied by frame/viewport before a `computer` click · the click tool refuses coordinates until one screenshot of the loaded document exists · `browser_batch` puts clicks, typing, keys and reads in one round trip · a hidden pane clamps its timers, so compare a burst of MIDI as a SET and check per note that its prelude precedes its note-on.

**Open at session end — CHECKPOINT #3 (2026-09-22, session 13, Opus) *(before it)*:**

- **ALL THREE PLANS ARE DESIGNED AND WRITTEN, NOTHING IS BUILT — by his order (LG-82 · RUNNING_LOG §258 · §261):** `1m.4 articulation`
  ✓ · `1n dynamics` ✓ · `1o the save structure` ✓. **The design phase of session 13 is CLOSED. The task in hand is now THE BUILDS, one at a
  time, his one test after each.**
- **THE NEXT CONCRETE STEP, as an instruction:** on **Opus**, after `/clear` + `/postclear` — **build `1m.4.1` (Every voice knows itself)**, the
  first step of PLAN § `1m.4`'s build order (its last bullet: 1m.4.1 → .3 → .4 → .5 → .6, ONE COMMIT EACH, the step's REQUIRED VERIFICATION and
  THE SHIELD run in each; **1m.4.2 waits on his rack**; 1m.4.7 `spread` only on his word). `1m.4.1` is data in `sandbox/instruments.js` — `kind`
  (`pitched` · `key` · `fixed`) and `loud` (`vel` · `mw`) on every technique entry, the by-key entries' keys, and a check that names what is
  missing. **His ONE test comes after 1m.4.6, not before.** Do not start any of it until he says go (his standing postclear rule).
- **Latest deliverable:** `docs/PLAN.md` § `1o` — *The save structure: a pattern is a document of its own, in a library of its own, placed in the
  score by Insert* — six steps 1o.1 … 1o.6, each with its REQUIRED VERIFICATION and THE SHIELD, the build order its last bullet, the [call]s
  marked; commit `10d2df7`. Its record: RUNNING_LOG §276 … §278, COMPOSITION_NOTES LG-100. Before it, PLAN § `1n` (`b7aa818`) and § `1m.4`
  (`98f1d2b`).
- **WHAT `1o` DECIDED, in one breath** (so nothing is re-litigated): a pattern is a NAMED DOCUMENT carrying a COPY of its onsets, the texture only
  a label — so a take re-saved or deleted in Texture can never reach it and Texture needs no save protection · `texture ▾` STARTS a new empty
  pattern (the spine, LG-85), `pattern ▾` recalls one by its own name, several per texture · `bank/patterns.json`, a FIFTH store (`test_snapshots`
  28 → 30, **the server must be restarted**), named keepers + an untitled stack of 50, autosaved as the sequence library is, today's browser
  patterns migrated ONCE · the library controls are the sequence library's rules verbatim, in a CLONE mixin `texture_lib.js` (`sequence_ui.js`
  untouched) · **Insert is the sequence's idiom exactly** — at the playhead or re-inserted in place from its META bar, one group `grp-pat-<id>`,
  the document copied WHOLE into `databases.patterns`, `patterns in this score`, `curveDirty()`, a note under a trill skipped — and **it writes
  THE RANGE**, its left line at the playhead (his A, §277).
- **Decided this session and NOT in `1o`** (his B, §277 · LG-100): two rules on ONE player's notes, written into **PLAN § `1n.1`** — a length that
  runs into that player's next onset is **CUT** there (the bar drawn to it, the typed length kept in the document) · two attacks closer than the
  instrument's minimum gap are **FLAGGED and counted, never moved** (LG-58's rule, Texture's `collisions`). Different players are never checked
  against each other. `1m` *Held* points there.
- **`Resume reads:` for the `1m.4.1` build** — PLAN § `1m.4` (the header and 1m.4.1 only; the rest as its step comes) · journal §2 **STILL BINDING**
  (the verification method, `score-5401`) · `sandbox/instruments.js` and the drawer's `kindOf` in `strike_drawer.js`, when the build starts.
  **Not needed:** `docs/DYNAMICS_LAW.md` (it is `1n.1`'s, not `1m.4.1`'s) · PLAN § `1n` · § `1o` · RUNNING_LOG §240 … §278 (open one only when a
  question sends you there).
- **Decisions pending him:** the [call]s in PLAN § `1m.4` (§260 lists them) · § `1n` (§275) · § `1o` (§278: the texture in an untitled name · a
  migrated pattern whose take is gone · a clone mixin rather than an extraction · the `•` ignoring `sel` and `cursor`) · the triangle on track 10
  (§221) · `ACT-BLOOM-03` · `-04` in the store · a `sec01-done` tag · whether `bank/patterns.json` goes into git when it exists.
- **His tests of `1m.1` · `1m.2` · `1m.3`: CLOSED at his word, untested (§259).** ONE test after the `1m.4` build; old feedback is not carried forward.
- **The morphs:** his aside, *"morphs need to be revisited, something is off there"* — MORPH_NOTES §3, 2026-09-22, undiagnosed, beside `1k`.
- **Unsaved working copies** (`node tools/unsaved_check.js`, run at this checkpoint): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the
  same four as checkpoint #2, none of them the piece; his to Save or Reload. No score is committed here.
- **DELIBERATELY UNCOMMITTED — five paths, all his, none written by this session** (`git status --short` at this checkpoint):
  `bank/panel_snapshots.json` (his harmony takes, 3 MB, autosaved by his tab) · `bank/sequences.json` (his sequence library, autosaved every 2 s —
  committing mid-use races his tab) · `reaper/LGMF_rack.rpp` (his REAPER project, saved by REAPER) · `bank/rhythm_sequences.json` and
  `bank/rhythm_takes.json` (untracked — his rhythm sequences and takes; whether they go into git is his call).

*(Superseded — the plain open block written before this checkpoint; its content is above.)*

- **`1o the save structure` IS WRITTEN** (PLAN § `1o`; RUNNING_LOG §276 … §278). **ALL THREE PLANS ARE DESIGNED AND WRITTEN, NOTHING BUILT, BY HIS
  ORDER (§261).** Commit `f04c5d1` (the decisions) and the one after it (the item).
- **The task in hand is now THE BUILDS, one at a time: `1m.4 articulation` first** — on Opus, after a checkpoint and a clear. Its build order is PLAN
  § `1m.4`'s last bullet (1m.4.1 → .3 → .4 → .5 → .6, one commit each, THE SHIELD in each; 1m.4.2 at his rack; 1m.4.7 on his word); his ONE test after.
- **`Resume reads:` for the `1m.4` build:** PLAN § `1m.4` whole · `docs/DYNAMICS_LAW.md` · journal §2 STILL BINDING (the verification method) · the code
  it names: `score/public/texture_cols.js` · `texture_row.js` · `strike_drawer.js` (the articulation roster, read not changed) · `sandbox/instruments.js`.
  RUNNING_LOG §240 … §260 only where a step's reasoning is needed.
- **Decisions pending him:** the [call]s in PLAN § `1m.4` (§260) · § `1n` (§275) · § `1o` (§278) · the triangle on track 10 (§221) · `ACT-BLOOM-03` · `-04` ·
  a `sec01-done` tag · whether `bank/patterns.json` (not yet existing) goes into git, as `bank/sequences.json`'s policy.
- **The tree:** the same five uncommitted paths as checkpoint #2, all his, none written by this session.

*(Superseded — CHECKPOINT #2, the same day: its task, `1o the save structure`, is written. Kept for the record; do not resume from it.)*

**CHECKPOINT #2 (2026-09-22, session 13, Opus) *(mid-session checkpoint)*:**

- **THE ORDER OF WORK, HIS (LG-82 · RUNNING_LOG §258 · §261):** while his listening is limited he is DESIGNING EVERY PLAN FIRST and will BUILD AND TEST
  THEM ONE AT A TIME afterwards. **`1m.4 articulation` ✓ written · `1n dynamics` ✓ written · `1o the save structure` NEXT.** Nothing has been built in
  this session, by design.
- **The task in hand:** plan 3 of 3, **`1o the save structure`** — under the planning method, **phase 1: HIS WORDS FIRST**, then the data. Nothing of it
  has been said beyond LG-84 · LG-85. What it must settle: the orchestrated PATTERN as a document of its own with a name (several per texture), carrying
  A COPY of its onsets · where it lives (today: the browser only, one store per tab, key `lgmf.textureRow.v1`) · a library · how Insert reads it · and now
  also the RANGES and by-hand `dyn` values of `1n`, which live with the pattern, never with a take.
- **The next concrete step, after `/postclear` on Fable:** say the position (plan 3 of 3; `1m.4` and `1n` written, not built), then ask for his words on
  the save structure. Read back in his terms; the data first where it is about the state of things. **Do not start until he answers.**
- **Latest deliverable:** `docs/PLAN.md` § `1n` — *Dynamics in the texture take: one scale for short and held, a note by hand, ranges generated by four
  models* — six steps 1n.1 … 1n.6, each with its REQUIRED VERIFICATION and THE SHIELD, the build order its last bullet, the [call]s marked; commit
  `b7aa818`. Its record: RUNNING_LOG §262 … §275, COMPOSITION_NOTES LG-86 … LG-99. Before it, `docs/PLAN.md` § `1m.4` (commit `98f1d2b`).
- **WHAT `1n` DECIDED, in one breath** (so nothing is re-litigated): a SHORT note samples the level at its onset, a HELD note takes `sample | follow |
  auto` and `auto` follows when the level moves ONE WRITTEN STEP across its span · **B2, the one scale:** a short note keeps its ladder velocity for the
  timbre and gets a fader SET ONCE from a new RESIDUAL table (≈ 2.29 dB a step) so velocity + fader = the table's 4 dB a step — no rack change, no probe,
  nothing else touched · a pattern's levels are ABSOLUTE and there is NO base layer (a sub-section is a range with low = high) · a generate OVERWRITES
  everything in its range, hand-set notes last · four range models: `flat` · `ramp` (niente allowed) · `pointillistic` (three dials in words, five
  presets, the dials always shown) · `waves` (the sequence's reused whole, `who moves`: each player · together · custom groups) · `enter: abrupt | fade
  N s` on every range · one typed `dyn` box per row (`mp` · `mp-f` · `mp-f-mp`, a dash or a space) · the mod-wheel voices on the fader like the rest,
  CC1 untouched · **`1f` the score's crescendo tool is OUT of `1n`**, still its own `todo` (§274).
- **The morphs:** his aside, *"morphs need to be revisited, something is off there"* — MORPH_NOTES §3, 2026-09-22, undiagnosed, beside `1k`. Nothing was
  looked at.
- **`Resume reads:`** `docs/PLANNING_METHOD.md` · COMPOSITION_NOTES **LG-84 · LG-85** · RUNNING_LOG **§254 · §255** · PLAN § `1m` (the header and *Held*
  only). Code only when a question names it (`score/public/texture_row.js` · `texture_cols.js`). **Not needed for `1o`:** `docs/DYNAMICS_LAW.md` and PLAN
  § `1n` — open them only if a question sends you there.
- **Decisions pending him:** the [call]s in PLAN § `1m.4` (§260 lists them) and in PLAN § `1n` (§275 lists them) · the triangle on track 10 (§221) ·
  `ACT-BLOOM-03` · `-04` in the store · a `sec01-done` tag.
- **His tests of `1m.1` · `1m.2` · `1m.3`: CLOSED at his word, untested (§259).** Old tests and feedback are not carried forward; ONE test after the
  `1m.4` build.
- **Unsaved working copies** (`node tools/unsaved_check.js`, run at this checkpoint): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the same
  four as session 12's close, none of them the piece; his to Save or Reload. No score is committed here.
- **DELIBERATELY UNCOMMITTED — five paths, all his, none written by this session:** `bank/panel_snapshots.json` (his harmony takes, autosaved) ·
  `bank/sequences.json` (his sequence library, autosaved every 2 s — committing mid-use races his tab) · `reaper/LGMF_rack.rpp` (his REAPER project) ·
  `bank/rhythm_sequences.json` and `bank/rhythm_takes.json` (untracked — his rhythm sequences and takes; whether they go into git is his call).

*(Superseded — CHECKPOINT #1, the same day: its task, `1n dynamics`, is the deliverable above. Kept for the record; do not resume from it.)*

- **WAS: `1n dynamics` IS WRITTEN** — PLAN § `1n`, RUNNING_LOG §262 … §275, COMPOSITION_NOTES LG-86 … LG-99. **The task in hand is now plan 3 of 3, `1o the save structure`** (LG-84 · LG-85: the pattern as a named document with a copy of its onsets, several per texture, a library, where it lives, how Insert reads it — and now the ranges and `dyn` values of `1n`, which live with the pattern). `1f` stays its own `todo`. The morphs: *"something is off there"* — MORPH_NOTES §3, undiagnosed. **`Resume reads:` for `1o`:** `docs/PLANNING_METHOD.md` · COMPOSITION_NOTES LG-84 · LG-85 · RUNNING_LOG §254 · §255 · PLAN § `1m.4` (the header) · PLAN § `1n` (the header). Code only when a question names it (`score/public/texture_row.js` · `texture_cols.js` · `strike_drawer.js`'s takes store, `bank/panel_snapshots.json`).

- **THE ORDER OF WORK, HIS (LG-82 · RUNNING_LOG §258 · §261):** while his listening is limited he is DESIGNING EVERY PLAN NOW — `1m.4 articulation`
  ✓ written · **`1n dynamics` NEXT** · `1o the save structure` after it — and will LATER BUILD AND TEST THEM ONE AT A TIME: `1m.4 articulation`
  first (build → his one test → revise if needed), then `1n dynamics`, then `1o`. **Nothing is built in this session.**
- **The task in hand:** plan 2, **`1n dynamics`** — hairpins and crescendos included (his brief, COMPOSITION_NOTES LG-74). Under the planning
  method, phase 1: HIS WORDS FIRST, then the data. Nothing of it has been said yet beyond LG-74.
- **Latest deliverable:** `docs/PLAN.md` § `1m.4` — *Types of articulation, and the orchestration panel as a LENS on the columns* — seven steps
  1m.4.1 … 1m.4.7, each with its REQUIRED VERIFICATION, the build order, the [call]s marked; commit `98f1d2b`. Its record: RUNNING_LOG §240 … §260,
  COMPOSITION_NOTES LG-74 … LG-85. **WHEN IT IS TIME TO BUILD IT:** open PLAN § `1m.4` — the build order is its last bullet (1m.4.1 → .3 → .4 → .5
  → .6, one commit each, THE SHIELD verified in each; 1m.4.2 at his rack; 1m.4.7 on his word); on Opus, after a clear; his ONE test after 1m.4.6.
- **The next concrete step, after `/postclear` on Fable:** say the position (plan 2 of 3; `1m.4` written, not built), then ask for his words on
  dynamics in the texture take — what he wants a dynamic to be (per column · per player · a hairpin across columns), and how hairpins and
  crescendos relate to the score's crescendo tool `1f`. Read back; the data first where it is about the state of things.
- **What the dynamics plan already has to honour (decided in `1m.4`):** a dynamic is a COLUMN property, never a take's (the one rule, §251 ·
  §252) · set in the orchestration panel per row and per column, shown on the column as a mark (1m.4.5 reserves it) · under the DYNAMICS LAW
  (a struck note: velocity IS the dynamic; a shaped note: struck at mf, the fader normalized on a curve channel) · `1f` the crescendo tool is
  still on the old law (no `cc7Abs` / `velAbs`) and belongs to this plan.
- **`Resume reads:`** `docs/PLANNING_METHOD.md` · `docs/DYNAMICS_LAW.md` · PLAN § `1f` · PLAN § `1m.4` (the header and 1m.4.4 · 1m.4.5 only) ·
  COMPOSITION_NOTES LG-74. Code only when a question names it.
- **Decisions pending him:** the [call]s in PLAN § `1m.4` (§260 lists them) · the triangle on track 10 (§221) · `ACT-BLOOM-03` · `-04` in the
  store · a `sec01-done` tag.
- **His tests of `1m.1` · `1m.2` · `1m.3`: CLOSED at his word, untested (§259).** Old tests and feedback are not carried forward.
- **Unsaved working copies** (`node tools/unsaved_check.js` at this checkpoint): `cresTest` · `lgmf-all` · `lgmf-bloom` · `longToneTest` — the same
  four as session 12's close, none the piece; his to Save or Reload; no score is committed here.
- **DELIBERATELY UNCOMMITTED — five paths, all his, none written by this session:** `bank/panel_snapshots.json` (his harmony takes, autosaved) ·
  `bank/sequences.json` (his sequence library, autosaved every 2 s — committing mid-use races his tab) · `reaper/LGMF_rack.rpp` (his REAPER
  project) · `bank/rhythm_sequences.json` and `bank/rhythm_takes.json` (untracked — his rhythm sequences and takes; whether they go into git is his call).

**Open at session end (2026-09-21, session 12, Opus):**

- **His tests of `1m.1 the row` · `1m.2 the columns` · `1m.3 duration` — CLOSED at his word, untested (2026-09-22, RUNNING_LOG §259): one test after the `1m.4 articulation` build, duration vetted in it.** All of `1m` lives in the browser's storage, key `lgmf.textureRow.v1` — nothing on disk or in a score yet (Insert is not built).
- **THE TRIANGLE:** track 10 `Percussion` in his rack takes `LGPerc` on ALL channels (§221) — his to mute, or give its input a channel
  nothing uses; then `docs/RACK_SETTINGS.md`.
- **The AI's calls, his to reverse:** `1l`'s build — the claves at key 41 · models fitted to seven · 7.5 → `f` · cents kept in Texture ·
  a two-note player plays both · LIVE hidden · wave presets shared · the claves at the chord's mean level · a niente fade scales the
  strike · a vibraphone dot on Standard Mallets · a line past the seventh wraps (§200–§206) · `main` beside the fourteen percussion
  instruments, a card articulation skipped where the roster lacks it (§212 · §213) · `1m.2`'s third form (§233) · `1m.3` (§237).
- **Still his from session 11:** `ACT-BLOOM-03` · `-04` in the store · a `sec01-done` tag.
- **Unsaved working copies** (`node tools/unsaved_check.js`, run at this close): `cresTest` · `lgmf-all` · `lgmf-bloom` ·
  `longToneTest` — the same four as session 11's close, none of them the piece; his to Save or Reload.
- **DELIBERATELY UNCOMMITTED — five paths, all his:** `bank/panel_snapshots.json` (his harmony takes, autosaved) · `bank/sequences.json`
  (his sequence library, autosaved every 2 s — committing mid-use races his tab) · `reaper/LGMF_rack.rpp` (his REAPER project) ·
  `bank/rhythm_sequences.json` and `bank/rhythm_takes.json` (untracked — his rhythm sequences, `LGMF-Rseq-01` among them, and his rhythm
  takes; whether they go into git is his call). None was written by this session's tests.
- *(The long §2 of session 12 — its opening brief, the `1l` discussion and build, checkpoints #1 … #4 — was cut at this close. It is
  whole in git: `git show 0f1d58f:docs/PROJECT_JOURNAL.md`.)*

### STILL BINDING — carried whole from session 11's checkpoint #4

- **HOW TO VERIFY WITHOUT TOUCHING HIS WORK — unchanged, and every session since §132 has used it:** `preview_start` **`score-5401`**
  (a throwaway server on the SAME scores folder) → `composer.html` → **before anything else**
  `Composer.autosave = async () => {}; clearTimeout(Composer.autoSaveTimer)` — the page reopens HIS last working copy and would
  autosave into it 5 s after any change · **never Save** · `window.confirm` stubbed · the playhead set by
  `Composer.scrollOffset = T * Composer.pixelsPerSecond` · **`resize_window` 1280 × 860 FIRST — a hidden pane has a 0 × 0 viewport** ·
  **the pane does not PAINT, so `requestAnimationFrame` never fires and `ResizeObserver` is never delivered**: to drive the score's
  transport, replace rAF with a 16 ms timer and set `Composer._zoneMidiInited = true` · to capture MIDI, stub
  `Composer._zoneMidiOutputs[port.toLowerCase()] = { send: b => log(b) }` for every port · verify note lists, objects and ROUTES by
  `javascript_tool`, never a screenshot · reset the viewport and `preview_stop` at the end.
- **AND SINCE (session 12):** stub every non-GET `fetch` and `navigator.sendBeacon` too (§220), and the Rhythm panel's
  `RhythmSequence.save` · `libTouch` · `libFlush` · `libFlushBeacon` when it is open (§213) · **a mouse GESTURE is verified with the
  pane's REAL input** (`computer` double_click · type · key), not with events dispatched by script — a dispatched `dblclick` hid that
  Chrome sends NONE when the pressed element is re-drawn under the mouse (§238); the pane's `Return` arrives nameless, send `Enter`.
- **AND SINCE (session 13, §296): THE STUBS GO IN THE SAME BATCH AS THE NAVIGATION, BEFORE ANY SLEEP** — the throwaway page writes HIS bank files at boot on its own: the sequence drawer POSTs the row its localStorage holds 2 s after load (`libLoad`), the pattern library migrates and writes its untitled documents; a stub installed after a sleep is too late (that was §295's "writer not pinned": the throwaway itself). **At the session's end clear the throwaway's `lgmf.sequenceDrawer.v1` · `lgmf.rhythmSequence.v1` · `lgmf.textureRow.v1`**, so the next first load has nothing to save; delete a `bank/patterns.json` the throwaway created. **A `find` ref goes stale at every re-render of the drawer's rows** (a typed value re-renders them) — fetch the refs again before each typing batch. **Stub EVERY port before a claim about curve seats** — a marker seat on a port with no output resolves to the base route and the note reads as "velocity alone". **`SequenceDrawer.setActive(false)` before capturing the strike's Hear** — its wrap of `play('orch')` takes SPACE while it is active. **THE SHIELD's BEFORE is captured on HEAD's files:** `git stash push -- <the changed paths>`, reload, capture, `git stash pop`, reload (the throwaway serves from disk). **AND (§303): THE SHIELD's two captures need a DETERMINISTIC deal** — `shuffleOrch` is seeded but the deal is not persisted across a reload and the seed moves, so a BEFORE on one shuffle and an AFTER on another differ in velocity for no reason of the build: `select('hs::starter:0')` then `assign(voice, lane)` the same lanes both sides; and a texture take REPLACES the drawer's strike, so re-select it after `txSetMode('strike')`.
- **Five things learned the hard way — all still true:**
  - **A Bash command longer than about 8 KB FAILS on this machine** with `unexpected EOF while looking for matching quote`. **Write
    any large text with the Write tool into the scratchpad, then splice it in with a short `node` script** that asserts each
    replacement lands exactly once.
  - **A script with BACKTICKS in it goes to a FILE** (the Write tool, or a quoted `<<'EOF'` heredoc) — **never into `node -e "…"`**.
    In a double-quoted bash string the backticks are command substitution: on 2026-09-20 that made bash try to EXECUTE
    `bank/panel_snapshots.json`, his 3 MB takes file, as a shell script (§146). Nothing ran, but it is the closest this project has
    come to losing his data.
  - **THE LINE ENDINGS ARE MIXED IN THIS REPO, and `docs/PLAN.md` is mixed WITHIN ITSELF** (797 CRLF, 59 lone LF). A splice script
    must **never normalize a whole file** — detect the file's DOMINANT ending and convert the search strings and the inserted text
    to it instead (`const crlf = nCRLF >= nLF, fix = t => crlf ? t.replace(/\r?\n/g, '\r\n') : t`). LF search strings match **zero**
    times in a CRLF file and report "not found", which reads like a missing anchor and is not.
  - **The Write and Edit tools turn a typed `\uXXXX` into the literal character**, so `sequence_ui.js` holds `—` and `·`, not escapes.
  - **A PARALLEL SESSION of his may be appending to `RUNNING_LOG.md` and `COMPOSITION_NOTES.md`.** Append only; **read the last
    heading number immediately before writing** and take the next free one; explicit paths, never `git add -A`.
- **Standing warnings still true:** the in-app browser has no Web MIDI, so **every listen that matters is his Chrome** · one composer
  tab per score · `apply_trims.lua` and the remap are GENERATED — edit the bank, not the file · **the curve-channel map is CACHED:
  any tool that writes a curve event must call `Composer.curveDirty()`** (§75, then §139 — found twice by two different doors) ·
  **a claim about ROUTING is a claim about STATE, not about the code** — twice in two days "by construction" was wrong and his ear
  caught it both times.

**Open questions:**
- **Q1b — libraries. CLOSED 2026-09-18.**
- **Q2 — the call.** LGMF 2026, unread at his word: *"don't need to look it up now."*
- **Musical, his, not urgent** (PLANNER): "continuous, not sparse" (LG-2) against "lots of rests" (LG-4/5/8) · does the piece open
  with a morph (LG-1) or a bespoke section (LG-6) · **who, if anyone, inherits the piano's struck role** · the presentation score's
  pitch form (in C, or transposed?) at 2b.

**Blockers:** none.

**Standing warnings for this repo:** ⚠ `export_print` and `export_video` share `Coords.ensembleFrame` — a change to the frame math
moves BOTH · never bind **5300** or **4800**, they are piece #5's · the loopMIDI ports are `LG`-prefixed for the same reason · the AI
never saves from its own browser pane (principle 9) · the in-app browser has no Web MIDI · **the composer's lanes are laid out by CSS `nth-child` rules in `composer.html`, the curve windows A · B · C over the last three — a lane added to `TRACKS` needs its rule, and `palette_check` does not look** (RUNNING_LOG §183) · **a server route that `require`s engine code keeps the copy it started with** — after a build that changes `morph.js` or `model_bank.js`, say "restart the server" as well as "reload the tab" (§181).

**Checks this piece owns:** `node tools/sequence_check.js` (**180**) · `node tools/dyn_table_check.js` (**51**) · `node tools/test_snapshots.js` (**28**) · `node tools/palette_check.js` (**198**) · `node tools/roster_check.js` (**3** over **339** voices, **26** pending — 1m.4.1) ·
`node tools/test_written_pitch.js` (**10** + a control) · `node tools/spectrum_check.js` (**35**) ·
`node tools/check_ceilings.js --all` · `node tools/model_bank.js --validate`. Run the palette ones after any change to `TRACKS`,
`sandbox/instruments.js` or `notation/registry/ensemble.json`. **Every other battery's status, and why, is in `docs/NITS.md`.**

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

- **D15** *(2026-09-19, composer: "for Niente, I think A is fine inside, but I would like to have the option of starting the
  sequence from nothing and then ending the sequence to nothing")* — **NO NIENTE INSIDE A SEQUENCE'S WAVES; SILENCE BELONGS TO
  ITS EDGES.** The waves swell between two WRITTEN dynamics (ppp … fff); a fade in or out reaches true silence. *Why:* the
  calibrated law has nothing below ppp — the drawn bottom is the ensemble's floor, not zero — so true niente inside a wave
  would mean a note whose drawn height is a fader position and no longer its written dynamic, for the whole piece. At the edges
  it is a one-way window (the morph's own `cc7Fade`) laid over whatever is underneath, and costs the notation nothing.
  *Rejected:* niente inside the waves now (option B) — offered and declined; the AI recommended A. RUNNING_LOG §121–§122, §127.
- **D16** *(2026-09-19, composer: "the transition probably doesn't need to be overthought … I'll just have to extend the first
  things or shorten whatever so that the morph starts on their next breath")* — **A SEQUENCE IS JOINED TO A MORPH BY HAND. NO
  LINKAGE IS BUILT.** What the tools owe him instead is an ENDING he can join to: fade out or just end × the players ending at
  different times or together, the fade following the shape (PLAN 1d.8; the morph gets the same four when he revises it).
  *Why:* a player is one line, so every transition reduces to when each player switches — and moving a few first notes does
  that exactly, with his ear in the loop. *Rejected:* a hand-over item where the morph is told each player's pitch and where in
  a breath it stands (§124, written and then not written); and the cheap version — matching the orders and warning on a
  collision. **His word governs: "I don't think this impacts our build."** COMPOSITION_NOTES LG-40 · LG-42, RUNNING_LOG §124–§125.
- **D17** *(2026-09-19, composer: "There is the curve crescendo that we have been using for several pieces now … what's the
  issue with using this mechanism?" and "there should be some solid documentation about this")* — **THE BANK CARRIES EVERY
  PITCHED INSTRUMENT'S MEASURED FADER CURVE.** `tools/build_remap_card.js` wrote `cc7Curve` only for the instrument whose
  REGISTER rides on CC7 (the vibraphone), so `cc7ForHeight` answered 127 for the other six and **no drawn dynamic in the piece
  moved them** — D13's "CC7 shapes a held note" could not happen. The builder now writes all seven from `bank/balance.json`,
  which 0d had measured on the curve channels all along; the rest of the bank is byte-identical. Two laws, one per sampler:
  UVI 40·log10, Kontakt 60·log10. *Why that source:* it is this rack's own measurement, per instrument. *Rejected:* borrowing
  the vibraphone's curve for the six (6 dB wrong on the UVI three), falling back to the long-used `probes/cc7_map.json` (6 dB
  wrong on the Kontakt three), a new probe, and stepping the level by velocity per breath — all four proposed by the AI before
  it read the record, which is why the rule now stands in its memory. **Consequence: every drawn note in the six scores now
  follows its drawn height, and none of them has been heard since.** RUNNING_LOG §128–§130.
- **D18** *(2026-09-20, PLAN 1e; composer: "in the tuba piece and in the last piece, we always made crescendos from zero … CC7
  zero to CC7 max … a normalized one")* — **THE DYNAMICS LAW: TWO KINDS OF NOTE.** A STRUCK note — the velocity is the dynamic.
  A SHAPED note — struck at its instrument's **mf velocity for that pitch**, its level carried by the fader (CC7) on a **curve
  channel**; MAIN ch 1 never carries a moving CC7. *Why:* his recording read back showed every shaped note struck at its top's
  velocity (127) with CC7 moving only 63 … 127, about 12 dB — *"between two high dynamic levels"*. mf for ALL seven: the level
  lost against a struck fff is 3.9 … 5.4 dB, uniform since 1b, so one rule keeps the balance. *Rejected:* mf for the brass alone.
  The machinery was piece #5's, per note (`wc.cc7Abs` · `wc.velAbs`); only what the tools write changed. `docs/DYNAMICS_LAW.md` ·
  RUNNING_LOG §137–§144.
- **D19** *(2026-09-20, PLAN 1d.10; composer, LG-51: "not up to the full 127")* — **THE DYNAMICS TABLE: A STATED RANGE IS WHAT
  SOUNDS.** Every written dynamic has a CC7 value of its own, `fff` = 127 and **4 dB a written step** through each instrument's
  MEASURED fader curve; a curve drawn full for notation is performed between its two written values (`mp → ff` ≈ 69 → 109).
  Amends D18's "the shape's top is the full fader". *Why:* under D18 two ranges of equal depth sounded the same. RUNNING_LOG
  §145–§150.
- **D20** *(2026-09-20, PLAN 1g; composer: "the attacks are very loud")* — **IN A SEQUENCE, ONE SCALE:** every SUSTAINED note a
  sequence writes is shaped — mf strike, curve channel, the fader held at its table value — moving or not. *Why:* a struck `pp`
  sat ≈ −10 dB and a shaped `pp` ≈ −28 dB, so a straight box after a waves box stepped up 10 … 18 dB. *Rejected:* a straight box
  struck at its written velocity (two scales in one sequence). A STRIKE is not reached by it. RUNNING_LOG §157–§158.
- **D21** *(2026-09-20, PLAN 1h; composer, RUNNING_LOG §163 · §168)* — **THE BLOOM ON A TAKE, READ AS ASSIGNED, ON THE JUST
  PITCH:** a take chosen in the morph's PITCHES pulldown is dealt once and frozen; both players of a pair hold a note → two voices
  on their own just pitches, cents kept · one alone → the partner doubles it where it can. **The strikes drawer is where the
  pitches are heard and range conflicts resolved**; the panel only reads. The actuals keep the pitches through recall → vary →
  save → insert. The morph is on D18 · D19 (H3, `morph_dyn.js`). *Rejected:* choosing the pitches in the morph panel · the
  tempered pitch. RUNNING_LOG §162–§171.
- **D22** *(2026-09-20, PLAN 1i; composer: "a, as assigned in the take, held still" · "a")* — **THE VIBRAPHONES ARE THE BLOOM'S
  FOURTH ROW, HELD STILL:** one note each, as assigned, never doubled, never bending, FOLLOWING the bloom's one shape; an arc of
  their own = a second bloom with only their row ticked. One lane, TWO SEATS: the take is read by `lane:seat`. RUNNING_LOG
  §172–§176.
- **D23** *(2026-09-20, PLAN 1j; composer: the note lengths "seem regular, predictable")* — **THE MORPH BREATHES ROUND EACH
  PLAYER'S OWN MAXIMUM**, ON from the start: `of max` 0.65 · `±` 1.3 s · `outlier` 0.1, the sequence drawer's three length dials;
  an actual filed before keeps its breaths. The engine has its OWN copy of the rule, the twin of `sequence.js` `dealSpan` — tune
  one, tune the other. *Rejected, for now:* one shared breath module for both tools — the morph's revision. RUNNING_LOG §177–§181.
- **D24** *(2026-09-21, PLAN 1l; composer, LG-56 … LG-60)* — **THE COUNTERPOINT SECTION'S FIRST ROUTE: RHYTHM TAKES MADE IN TEXTURE,
  ASSEMBLED IN A CLONE OF THE SEQUENCE DRAWER** — the Rhythm sequence panel: a SILENT harmony row (the map: pitch + the intended written
  dynamic) under a rhythm row of boxes, each an excerpt of a rhythm take; every dot reads its player's pitch and level from beneath; a
  dot takes the INTENDED WRITTEN LEVEL, struck at the remap's velocity; onsets on different players are never quantized. Built end to
  end (`1l.1` … `1l.7`) and composed with (`LGMF-Rseq-01`). *Rejected:* a layer on the sequence drawer (his call, "reviewed after this
  version") · `MT` as the rhythm machine (Texture, his correction). **Then his verdict in use — *"this tool is not working the way I
  expected it"* — and D25.** What becomes of the panel is not decided. RUNNING_LOG §185–§214.
- **D25** *(2026-09-21, PLAN 1m; composer, LG-63 … LG-72: "as an alternate module to the rhythm one")* — **A TEXTURE TAKE IN THE
  STRIKES DRAWER, BUILT ONE STEP AT A TIME, EACH USED BY HIM BEFORE THE NEXT IS LAID OUT.** A `source` switch in the rhythm area (the
  strike · a texture take); a take's attacks as a top row of marks, switched on; under every ON mark a COLUMN orchestrated with the
  drawer's left side. **A column's players ARE its ticks** — tick = on = dealt = sounds; a fresh column is empty; the drawer is a VIEW of
  one column, the others dealt offline by the drawer's own code; no order of operations. `strike_drawer.js` unchanged — mixins.
  *Rejected, by his tests:* the circles as the drawer's one set of ticks (§227) · who sounds apart from the ticks (§228 · §231).
  RUNNING_LOG §214–§233.
- **D26** *(2026-09-21, PLAN 1m.3; composer, LG-73: "120 ms is fine, and yes, hear strike follows it")* — **DURATION: A STANDARD
  SHORT OF 120 ms**, in the bar and kept with the pattern — every column note, the claves, and `hear: strike` on a texture take; a
  `length` per column in seconds (his A of §235), shared by a multi-selection; a player's own by a double-click on their circle; the
  lengths drawn as bars. STRUCK notes held N seconds (DYNAMICS_LAW §1). RUNNING_LOG §234–§238.
- **D27** *(2026-09-23, PLAN 1n.1; composer, "b" to the two ways put in RUNNING_LOG §301)* — **A VOICE WITH NO CURVE COPY TAKES ITS SET
  FADER ON ITS OWN CHANNEL.** A sampled short note is a fader set once, not a moving controller, so it goes out on instance 1's part for
  the voice with its residual pre-armed before it — where a plain note gets its 127 today; every voice of every instrument reaches the
  one scale (B2, §264) without a rack change. A `follow` on such a voice still needs a curve copy and stays velocity alone, struck on the
  ladder, the status saying so. *Rejected:* copies of each short voice on the `b` instances (his rack work; only the copied voices reached).
  DYNAMICS_LAW §3 Rule 4.

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
- 2026-09-20 — **1e THE VOLUME FIX**, proven in his rack: MAIN ch 1 empty, every shaped note on a curve channel at an mf
  strike, CC7 reaching 0 (RUNNING_LOG §143 · §144).
- 2026-09-20 — **THE SEQUENCE DRAWER** (1d, its feature add, 1g) closed at his word and in use · **the bloom on a take**
  (1h · 1i · 1j) built and in use — his listens unreported (RUNNING_LOG §150–§182).
- 2026-09-21 — **SECTION 1 COMPOSED:** `scores/piece-LGMF-Sec01-v1.3-sec01-done.json`, named by him (commit `e6070fb`).
- 2026-09-21 — **`1l`, THE COUNTERPOINT ROUTE, built end to end** (`1l.1` … `1l.7`) and composed with — then set aside at his verdict for
  **`1m`**, whose first three steps are built and in his hands (RUNNING_LOG §199–§238).

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
