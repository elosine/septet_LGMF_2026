# PLAN — septet LGMF 2026

> **Rules:** IDs are stable — never renumber, only append. Status: `todo` / `doing` /
> `done` / `deferred` / `dropped`. Position = order. Every item keeps a one-line ***why***.
> Same conventions as pieces #3, #4 and #5.
>
> **How an item gets its sub-steps:** `docs/PLANNING_METHOD.md` — with the composer, one
> step at a time: the goal, then the sub-steps, then written here at once. An item he has
> not yet discussed carries one line: *to be laid out when we discuss it.* The phase-0 IDs
> below mirror piece #5's on purpose, so its record (`septet_2026/docs/PLAN.md` § 0 and
> `RUNNING_LOG.md` §1–§63) reads as the precedent item by item.

## The piece in one line

English horn + bassoon · horn + trumpet · cello + double bass · percussion — three pairs
and a percussionist (D1), for the Lake George Music Festival 2026 call. Animated score, the
format of pieces #4 and #5 (D2). Delicate and quiet; a rondo whose refrain is a morph
(COMPOSITION_NOTES LG-1 … LG-8).

## The timeline that binds everything

| | |
|---|---|
| 2026-09-17 | project opened, kit installed (0a) |
| **unknown** | **the call's deadline, duration limit and score format — not read yet, at his word (journal Q2).** This table is filled in the day the call is read. |

---

## 0. Setup — `doing`

- **0a — PM kit** — `done 2026-09-17` *(RUNNING_LOG §6)* — CLAUDE.md · README · journal ·
  plan · planner · RUNNING_LOG (lab journal) · COMPOSITION_NOTES (sketch pad, opened with
  LG-1 … LG-8) · NITS · AI_METHODOLOGY + SESSION_HYGIENE + PLANNING_METHOD + MORPH_NOTES
  (copied whole from #5) · HOW_WE_WORK + SESSION_PROTOCOL (from #5, the push lines adapted)
  · checkpoint/postclear commands · .gitignore · .gitattributes.
  *Why:* the session skills are wired to it; decisions survive clears from minute one; and
  the standing rules arrive whole this time (the #4 → #5 port dropped THE RHYTHM).

- **0b — The engine ported from piece #5** — `done 2026-09-17` *(RUNNING_LOG §12–§16: 266 files byte-exact · the copy proven whole BEFORE the re-palette · 44 asserted edits + 19 files of stragglers · provisional recipes with the cello carried whole · verified in the running app: 71/71 routes, zero console errors, every panel, the piano-role features quiet, the foreign-save warn proven with its control)*
  — **the executable plan is `docs/plans/PORT_FROM_TEMPUS.md`** (steps 1–5 and 8; written at
  the composer's word — *"just make careful plan, write it through independantly"* — from a
  measured survey, RUNNING_LOG §10). The top line:
  - **0b.1 — Copy the whole engine, byte-exact,** from #5 @ `ba318e1`: app · sandbox ·
    notation · print · video · tools · probes · the Reaper bridge · the model and preset
    banks. `cmp` every file. Piece data (38 MB) stays behind.
  - **0b.2 — Prove the copy whole BEFORE changing anything:** Tempus's palette still in
    place, its data staged not committed, the app on 5400, every battery run; a RED is
    re-run in the source, read-only.
  - **0b.3 — Re-palette:** one asserted patch script — seven tracks in score order (EH · Bsn
    · Hn · Tpt · Perc · Vc · Db) · ports 5400 / 4900 · `layoutVersion` 6 with a loud warn on
    a foreign save · the per-instrument tables inside #5's tools.
  - **0b.4 — Provisional recipes and skeleton banks:** the cello's recipe and measured rows
    carried; every other instrument a placeholder; the day-one stub `scores/lgmf.json`.
  - **0b.5 — Verified in the running app:** routes · save round trip · zero console errors ·
    every panel · **the piano-role features quiet, not removed** (this piece has no piano).
  - **0b.6 — Docs that travel with the code, NITS, journal.**
  **What differs from last time:** in #4 the palette was the whole coupling; piece #5 built
  tools that KNOW instruments — small keyed tables (kind B) and the piano as a role (kind C).
  **Decided in the plan (P1–P7):** carry ALL of #5's tools · quiet, not cut · score order ·
  the percussionist is one lane · placeholders until 0c · the names `lgmf` / `piece-lgmf`.
  *Why:* the app is the composing surface from day one; he will use the same structures.

- **0c — Instrument recipes (`sandbox/instruments.js`)** — `todo` — **NEXT, with 0e, in one
  sitting with him at the machine** — *to be laid out when we discuss it.* One entry per track;
  the libraries are D6. **The placeholders are in place and every one is marked** (the port,
  RUNNING_LOG §15); what is missing is the machine. **The percussion scaffolding is in (2026-09-17, RUNNING_LOG §19, D7):** `bank/aro_percussion_catalog.json` (piece #2's ARO map, 78 instruments, 35 with keys) · `bank/perc_selection.json` (which the piece uses, on which channel — EMPTY) · `tools/apply_perc.js` (one technique per instrument × beater, written into the recipe as the `ARO_PERC` block; proved on two instruments, a skeleton refused). Choosing an instrument = one line in the selection + one Reaper track on its channel + the tool + `palette_check`. **The three SI2 instruments are DONE as recipes (2026-09-17, RUNNING_LOG §22–§25):** presets loaded once by him (18 · 18 · 20), the Ordinario curve copies cloned as text, the FX/gain baseline set as text, channels and ports derived from the running rack by `tools/apply_uvi_parts.js` (bassoon 22 · horn 25 · trumpet 35 techniques). Provisional: the KS notes, the mutes' KS order. **Remaining in 0c:** the Kontakt three (english horn · cello · bass — rosters, CC#0, the ×4 slots) · the percussion · the keyswitch read. *Known going in:* **Spitfire's own plugin
  (the percussion) has never been driven by this stack** — real work, not a transcription · the
  double bass's CC#0 numbers are the CELLO's and must be verified against its own Preset Menu ·
  the english horn's library is unnamed · the percussion instruments are unnamed but for the
  bowed vibraphone · only the cello's entry has ever been heard.
  *Why:* the recipes ARE how the AI and the app produce the right MIDI for each sound.

- **0d — The samples' true ranges and lengths, per technique in use** — `todo` — *to be laid
  out when we discuss it.* *Why:* a range or a length read from a manual was wrong often
  enough in #5 to be measured instead.

- **0e — loopMIDI + Reaper rack** — `doing 2026-09-17` *(RUNNING_LOG §20–§25: ten `LG` ports verified by name; ten tracks in score order made by `reaper/bridge/jobs/make_tracks.lua`; the six UVI instances configured as text — `uvi_state.js` header fixed, `uvi_edit.js` clone + baseline, proven with the meters; D9 the layout. Remaining: the three Kontakt instances' `.nki` + `curve_slots`, the percussion tracks when chosen, the REC track)* — A new rack
  for seven new tracks. The Reaper bridge from #5's 0k was built machine-level "for the next
  piece" — this is that piece. *Why:* nothing sounds without it.

- **0f — The AI's MIDI generation path** — `todo` — *to be laid out when we discuss it.*
  *Why:* the AI must be able to make the right MIDI for every instrument, live and offline.

- **0g — Notation/IR infrastructure carried over now, adapted later** — `done 2026-09-17` *(RUNNING_LOG §17: the ensemble registry for the seven parts, the transpose sign checked in the code first; a realization override that would have THROWN in print and video, found and fixed; batteries identical to the pre-palette baseline; both exporters run and report this piece back)* — **`docs/plans/PORT_FROM_TEMPUS.md` step 6.** The files arrive with 0b.1 (one
  copy for the whole engine — in #5 the two halves were separate only because "do we need
  notation now?" was still open). 0g itself is: `notation/registry/ensemble.json` rewritten
  for the seven parts (english horn and horn written a fifth up, double bass an octave up) ·
  the batteries on staged goldens, every new RED classified · the exporters run.
  **What differs:** #5's engine already does seven parts, three clefs, written pitch per
  part, A3 print and video — and takes its instruments from ONE file.
  **The 2a adaptation list for this piece (recorded so it does not bite):** tenor clef ·
  a percussion clef, staff types and unpitched noteheads · mute marks · a B♭ trumpet part if
  he wants one · technique marks for the new instruments · animated conductions (LG-3) as a
  new animated-object kind · the bouncing balls per player in their own tempo (LG-5).
  *Why:* copying costs nothing now; adapting waits for real material.

- **0h — Gate: phase 0 closed** — `todo` — every track sounds from the score app through its
  own port with the right technique switching; a save round-trips; 0i's extraction passes;
  RUNNING_LOG has the numbers. *Why:* one verified gate instead of seven confidence claims.

- **0i — The save → IR contract, proved on a test save of this piece** — `done 2026-09-17` *(RUNNING_LOG §18: `scores/0i-test.json` → `notation/ir/lgmf-0i.ir.json`, 11 events, 7 chunks, VALID against source and complete; the written pitch proved through the engine's own resolver with a control; `tools/test_written_pitch.js` kept)* — **`docs/plans/PORT_FROM_TEMPUS.md` step 7** (#5 §13, step for step): a
  30-second save written by the app's own insert paths → `notate_section` → `ir_validate
  --against-source --complete` → the page in the notation app, the transposing parts shown
  at written pitch. *Why:* the IR is derived from the save, so the save's shape is the
  only thing that can bite later (#5's D9).

*(#5's 0j ensemble balance and 0k the Reaper bridge were added as the need appeared. They
are not pre-listed here; they enter when this piece asks for them, with the next free ID.)*

## 1. Compose — `todo`

*To be laid out when we discuss it.* Tools built per need (the #3/#4/#5 way). Already named
in the sketch pad as wanted tools: the multitempo / phase machinery abstracted, with figures
per beat (LG-5) · the pattern tool with thinning algorithms, weighting, harmony on a clock
and codified harmony transitions (LG-7) · the morph that arrives at a beating and holds
(LG-8; MORPH_NOTES §3, 2026-09-14) · animated conductions (LG-3).

## 2. Notate — `todo`

*To be laid out when we discuss it.* 2a engine adaptation · 2b presentation score (video +
print) — #5's shape.

## 3. Performance score — `todo`

*To be laid out when we discuss it.* Piece #5's own PLAN 3 is not built yet (its N6); this
item follows whatever that produces.

## 4. Submission package — `todo`

*To be laid out when the call is read.*
