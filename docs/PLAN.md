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

- **0d — Ensemble balance: the trim and the remap from one measured run** — `designed 2026-09-18
  (RUNNING_LOG §44–§46); measured, trimmed and judged 2026-09-18 (§47–§59); 0d.5 the remap open` — *(his restatement, 2026-09-18: "our goal is to produce a
  realistic demo and have realistic arual feedback for me during composing phase, so for example
  if I'm listening to a chord needs to be balanced in ensemble so I can hear the harmony
  realisticly and make choices, but this is not the #1 priority I don't want to overinvest but
  lets do the necessary to achieve most of what is possible with sample instruments … this will
  be a mostly quiet piece with potentially some loud parts, so I want everything to speak but no
  one part to dominate or wash the others out, particularly with percussion; also maybe we try to
  get a baseline here and a basic scaffolding and then refine when I design the actual sounds")*
  — **the ONE pre-composition item** (his scope call, §43). *Why:* he cannot judge a chord, an
  orchestration or a balance while composing if the samplers sit at arbitrary gains. LG-13 is the
  piece's dynamic; this is the machine that serves it.

  **The mechanism — three levers in series (§46):** the **fader** (one constant dB per track, set
  once) · **velocity** (per note; picks the sample, so it carries the dynamic) · **CC7** (the fine
  trim where velocity cannot land between layers, and the shape over a held note — velocity for the
  curve's top, CC7 for its height). NOT "127 then CC7 down": velocity chooses WHICH recording plays,
  so a 127 sample turned down is a quiet fff, not a p. **Percussion: fader + velocity only** —
  Spitfire binds CC7 to its global gain (§42), so CC7 must never be sent to `LGPerc`.

  **Both layers now, at his word** (*"lets do layer 2 now too"*, §45) — one sweep feeds both:
  1. **Layer 1 · the trim** — one dB per track on the Reaper fader so every instrument's ordinary
     sound is the same LOUDNESS at one dynamic. This is what makes a chord hear as harmony.
  2. **Layer 2 · the remap** — per instrument and register, `target → (velocity, CC7)`, so the same
     score dynamic is the same loudness on every instrument at EVERY level, not just the anchor.
     (#5's 1g; without it the instruments drift apart away from the anchor, because each sampler's
     velocity→loudness slope differs — #5's 0j measured 127 → 64 costing the flute 7.4 dB, the
     viola 5.6, the rest 9–12.)

  **Decided at the design (§44–§45):**
  - **The anchor is the QUIET level, not 127** (his A, recommended and taken) — the piece lives
     there, so that is where the match is exact and the residue goes to the loud end. #5 anchored
     at 127 because its own piece did not have this dynamic.
  - **Loudness, not peak.** The checkpoint's `Track_GetPeakInfo` shape (§43) is DISPLACED: a finger
     cymbal peaks high and is quiet, so a peak match would bury it — exactly the washing-out he
     named. Measured from a recording, K-weighted, with a short window for the one-shots.
  - **Non-standard effects are NOT normalized.** A key click is quiet because it is; its natural
     level is part of the realism. An unusably quiet one gets an offset in its own recipe when we
     hit it in phase 1.
  - **A baseline, not a final balance** (his "basic scaffolding … refine when I design the actual
     sounds"): the ordinary voice per instrument and a representative handful per percussion
     instrument — not all 261 mapped percussion keys.

  **The kit** — #5's four tools, carried by the port and rewritten for this palette:
  `tools/balance_schedule.js` (the timetable, from the recipes + `bank/perc_rack.json` +
  `bank/aro_percussion_catalog.json`) → `probes/balance_probe.ps1` (plays it into the `LG` ports
  while the REC track records) → `probes/analyze_balance.py` (loudness per note) →
  `bank/balance.json` (the trims) + `tools/velocity_remap.js` → `bank/velocity_remap.json` (the
  remap the app reads).

  **The running order** (► = active):
  1. ☑ **0d.1 — the REC track** (§49–§50, a receive bus; REC = MASTER to the decimal). `reaper/bridge/jobs/make_rec_track.lua`: one track at the end with
     a receive from all 26, its own master send off (no doubling), record mode output-stereo, armed.
     **Needs his Reaper open with the bridge alive**, and the script parse-checked through the
     bridge first (§28's rule).
  2. ☑ **0d.2 — the schedule** (§47–§48, 747 notes; the clipping pre-flight §51–§52) for this palette: the six pitched instruments' ordinary voice at three
     pitches × six velocities (CC7 full) and × six CC7 values (velocity fixed; on the `b` / curve
     channel where the recipe names one) — the Xsample three repeated, they scatter ±2–4 dB by round
     robin — plus, per percussion instrument, up to three representative keys × four velocities.
  3. ☑ **0d.3 — run it** (§53–§56: 26.8 min recorded; horn/trumpet re-measured after their Dynamic Amount knob) (his Reaper recording; ~600 notes, ~20 min) and **analyze** →
     `bank/balance.json`.
  4. ☑ **0d.4 — the trims onto the faders** (§57–§58: two anchors — pitched at the quiet level, percussion fff = fff; fader + JS Volume FX) (through the bridge) and into the recipes as `balanceDb`
     (the record only — the app sends nothing for them). ⚠ `sandbox/instruments.js` still carries
     #5's `balanceDb: -1` on the cello, a copy-forward leftover: it is replaced by measurement here.
  5. ☑ **0d.5 — the remap** (§60: `tools/build_remap.js` → `bank/velocity_remap.json`; velocity-only per D13, anchored on the ensemble median, percussion excluded; **the common range is anchor velocity 50–89** and outside it somebody saturates) computed and wired into the app (`score/public/velocity_remap.js`, shared
     by the page and the tools, as #5's §117).
  6. ☑ **0d.6 — his ear** (pitched) — *"sounds good"* on the velocity-64 chord, §59; **the percussion against the winds not yet heard.** A chord, at the quiet level, all seven. **He judges; the numbers do not.**
     *(The one verification this plan names as required — AI_METHODOLOGY's verified-claim rule.)*
  *Result when done:* the same written dynamic is the same loudness on every instrument, the
  percussion included; he can hear a chord as harmony while composing. Moved back to phase 1 at
  his scope call: the samples' true ranges and lengths per technique, the REC track's other uses,
  the percussion port's last two channels, and first sound FROM THE APP (browser → port, HIS
  Chrome — the in-app browser has no Web MIDI).

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

- **0h — Gate: phase 0 closed** — `NOT RUN, by his decision 2026-09-18 (D14): "lets assume this works,
  will reveal itself in composition"` — it would have been: every track sounds from the score app
  through its own port with the right technique switching; a save round-trips; 0i's extraction passes.
  **What it was going to test that nothing else has:** the app's own MIDI output, browser → port (HIS
  Chrome — the in-app browser has no Web MIDI). It is now a phase-1 expectation, proved by the first
  note he plays while composing; a wrong `LG` port name would show as one silent instrument, an
  unreadable remap bank as unremapped velocities. *Why the change:* every segment after the port is
  measured and a chord is approved (§49–§61), and his standing rule is against verification a plan does
  not name.

- **0i — The save → IR contract, proved on a test save of this piece** — `done 2026-09-17` *(RUNNING_LOG §18: `scores/0i-test.json` → `notation/ir/lgmf-0i.ir.json`, 11 events, 7 chunks, VALID against source and complete; the written pitch proved through the engine's own resolver with a control; `tools/test_written_pitch.js` kept)* — **`docs/plans/PORT_FROM_TEMPUS.md` step 7** (#5 §13, step for step): a
  30-second save written by the app's own insert paths → `notate_section` → `ir_validate
  --against-source --complete` → the page in the notation app, the transposing parts shown
  at written pitch. *Why:* the IR is derived from the save, so the save's shape is the
  only thing that can bite later (#5's D9).

*(#5's 0j ensemble balance and 0k the Reaper bridge were added as the need appeared. They
are not pre-listed here; they enter when this piece asks for them, with the next free ID.)*

## 1. Compose — `doing`

*Tools built per need (the #3/#4/#5 way). Already named in the sketch pad as wanted tools: the multitempo / phase machinery
abstracted, with figures per beat (LG-5, LG-11, LG-12) · the pattern tool with thinning (LG-7) · the morph that arrives at a
beating and holds (LG-8) · animated conductions (LG-3). None of those is 1a; 1a is the harmony heard.*

- **1a — The six reference harmonies and their 24 transitions, heard** — `doing` (1a.0–1a.4 done 2026-09-19; 1a.5–1a.6 next) — written 2026-09-18 by Fable from the
  decisions of COMPOSITION_NOTES LG-16 … LG-31 and RUNNING_LOG §62–§66c, **to be built by Opus after a clear, without
  reopening the decisions listed at the end of this item.** Planning protocol skipped at his word (§66).

  **Result when done:** five experimental scores exist and play in his rack from his Chrome — **`scores/lgmf-ref.json`**
  (the six reference chords, 60 s each, 10 s gaps, striated re-articulations, dal niente → mf) and **`lgmf-spectral` ·
  `lgmf-balance` · `lgmf-bloom` · `lgmf-converge`** (six 90 s transitions each, in his chord order, 10 s gaps) — every
  transition present both as its rendered notes (the actual) and as a re-openable morph model whose fade and duration dials he
  can change and re-emit. The horn is audible above F4. The maximum note durations are in the palette. Everything recorded.
  *Why:* the harmony of the piece exists on paper (LG-18–LG-31) and has never been heard; the four transition types are the
  morph refrain’s first candidates (LG-6, LG-8); and the durations are data the rest of phase 1 needs.

  **The order matters — 1a.0 first, then 1a.1–1a.2 (independent), then 1a.3 → 1a.4 → 1a.5 → 1a.6.**

  - **1a.0 — Verify the three mechanisms the item rests on; build only what is missing.** `done 2026-09-19` — RUNNING_LOG §67. (i) `morphBend` already carries cents end to end, nothing built · (ii) a model already persists as an ACTUAL (`/api/actuals`; `recallActual` reopens the dials), so `morphs[]` is not needed and 1a.5's 24 files ARE actuals · (iii) the SI2 three read `PitchBendMod Ratio="2"` in every program; the Xsample english horn and double bass went 2 → 1. **And a fourth, unasked: the double bass was an octave out and would have been silent in all six chords** — fixed Reaper-side, recipe back to sounding 28–69.
    - **(i) A score note carrying a cents offset that reaches the port as pitch bend.** The beating tool’s notes already carry
      `bend:` (`score/public/beating_calc.js` ≈ line 343) and are played; find that emit path (`morph_emit.js` / the play
      code) and confirm a note in an ordinary composer lane can carry `bend` (or `cents`) and that playback sends it on the
      note’s channel. If it cannot: add a `cents` field to the note — the smallest change — and bend emission; the IR
      extractor accepts or ignores it **in the same commit** (principle 3, the schema gate). RESULT: one Bassoon-lane D4 at
      −14¢ against a tempered cello D4 audibly beats, from his Chrome into his rack.
    - **(ii) How a morph MODEL persists.** Read `morph_panel.js` and the save format: does the save carry the card’s
      parameters so that reopening the score reopens the card with its dials? If yes, “model” = that object and “actual” =
      its emitted notes, already. If no: add `morphs[]` to the save (id · params · the emitted note ids) and a load-model
      action on the panel. RESULT: save → reload → the card shows the same dials → change the fade → re-emit replaces the notes.
    - **(iii) Bend range.** Each just instrument’s port/channel must cover ±49¢ (the horn needs −49 on chord 6): read
      `bendRangeSt` in the recipes and the beating tool’s `bendLimits`; SI2’s default; set what is short.
    *Why:* the whole item depends on just partials sounding just and on models being reloadable — find out first.

  - **1a.1 — The horn above F4: the “Horn SI2 high” path in Reaper** (decision 0, §66; his approved ReaPitch settings). `done 2026-09-19` — RUNNING_LOG §68, `reaper/bridge/jobs/horn_high_path.lua`. Built on BOTH UVI instances, not just `LGHorn`: a drawn note routes to the curve bank on `LGHornb`. Proven by meter — E♭5 sounds only from the high track, E♭4 only from the main, both −9.0 dB. The horn's recipe range went 65 → 77 as a consequence. **His: CTRL+S, and the élastique dropdown (not a parameter).**
    - Duplicate the Horn track through the bridge (as `make_perc_tracks.lua` duplicated his Template) → “Horn SI2 high”;
      input = `LGHorn`, the same channel as the Horn track; UVI state cloned from the Horn track (`tools/uvi_state.js`, §22).
    - FX on the high track, in order: JS note-range filter passing only notes **> 65 (F4)** — a ten-line JS if stock has
      none → JS MIDI transpose **−12** → UVI → **ReaPitch: shift +1 octave · élastique 3.3.3 SOLOIST / Monophonic · formant
      shift 0 · Wet 0 dB, Dry −inf.** On the existing Horn track: the mirror filter (**≤ 65**) before UVI, so nothing doubles.
    - The high track’s trim = the Horn track’s (`bank/balance.json`); ReaPitch Volume 0. Bend passes to both tracks unchanged.
    - He saves the rack (CTRL+S) and it is committed. **RESULT (probe by the bridge, meters read):** E♭5 to `LGHorn` sounds
      from the high track at E♭5; E♭4 sounds from the main track only.
    *Why:* five of the six horn notes in the reference chords lie above the SI2 library’s F4 (§63f); without this the chords
    cannot be heard at all.

  - **1a.2 — Maximum note durations into the palette, at mf** (decision 1). `done 2026-09-19` — RUNNING_LOG §69. The table lives in `score/public/beating_calc.js` `CEILINGS`, not `sandbox/instruments.js`; `ceilingFor`'s level factors re-based so the number in the table IS the mf ceiling. **The vibraphone measured at 7.4 s** (`sustain_watch.lua`), replacing the assumed 12.
    - `sandbox/instruments.js`: per instrument, the field the morph carrier already reads as the palette’s ceiling (find its
      name at `morph.js` ≈ line 191, `ceiling(level01)` / `ctxForBreath` — use THAT field, do not invent a parallel one):
      **EH 18 · Bsn 18 · Hn 15 · Tpt 12 · Vc 15 · Db 10 · Vib (bow) 10** seconds at mf; kind `breath` for the winds, `bow`
      for the strings and the vibraphone.
    - **Measure the bowed vibraphone sample’s sustain once** (bridge: hold a bowed note 20 s, read the meter until −20 dB;
      the number into RUNNING_LOG; the palette value = min(10, measured)). This replaces §48’s assumed 12 s.
    - **Required checks:** `node tools/palette_check.js` (159) and `node tools/test_written_pitch.js` (8 + control) green.
    - RESULT: a morph on the horn splits at 15 s with a BREATH flag, not at the table’s default.
    *Why:* the reference striation and every morph split at these ceilings — “never exceeding the max.”

  - **1a.3 — The chord data as a bank: `bank/reference_chords.json`, built by `tools/build_reference_chords.js`.** `done 2026-09-19` — RUNNING_LOG §70. Voicings typed once; cents, Bloom targets and Spectral sets computed; asserts LG-27's deviation table and every pitch against its own partial. Spectral's reach widens by octaves only for the double bass, which cannot move inside one.
    - The six chords exactly as **COMPOSITION_NOTES LG-27’s final table**: per chord the fundamental; per voice instrument ·
      MIDI pitch · partial (null for a tempered double) · cents (**only the just voices carry cents: bassoon on chords 1, 3, 5;
      horn and trumpet on all six — −14 / −31 / −49; every other voice 0**) · role (`root` | `just` | `double` | `series`) ·
      both vibraphone bows · the cello’s double stop in chord 5.
    - **Converge, per chord, from LG-31’s final table:** each mover’s target and cents distance; the bass’s start (28¢ under a
      just target, 50¢ under a fixed one — chords 4 and 6) and target; chord 4’s cello 49¢ down onto the true 11th; the statics.
    - **Bloom targets, computed (decision 7):** for every voice except the bass and the vibraphone, the nearest partial of the
      chord’s fundamental with |cents| < 10, by semitone distance, tie → the one closer to 0¢, inside the instrument’s range.
    - **Spectral sets, computed (decision 6):** seeded RNG (seed recorded in the bank); for every voice except the vibraphone,
      a START partial and an END partial of the same fundamental, each with |cents| < 10, within ±12 semitones of the
      reference pitch, inside range, end ≠ start ≠ reference; the bass included (it moves like the others). The picks printed
      in RUNNING_LOG for his override by ear.
    - RESULT: the bank exists; its chord table printed in RUNNING_LOG matches LG-27 pitch for pitch.
    *Why:* one source for the five scores — the composer’s tables become data once, checkable, never typed twice.

  - **1a.4 — `scores/lgmf-ref.json` — the six reference harmonies, 60 s each, 10 s gaps** (decisions 2, 3). `built 2026-09-19, awaiting HIS LISTEN` — RUNNING_LOG §71. 6:50 · 343 notes · the ceiling check GREEN. **And the composer app had to be fixed first: it had not booted since D12 added the vibraphone to `TRACKS` without a `lane8` in the HTML.**
    - Written by **`tools/build_lgmf_ref.js`** in the app’s own save format (layoutVersion ≥ 6, eight lanes — the shape of
      `scores/0i-test.json`, NAMING §1) — never by hand from the AI’s browser pane (principle 9).
    - Chord k starts at t = 70·(k−1) s. Every voice enters **dal niente → mf** over its first segment (fade 3 s, or the
      morph’s default fade-in), then holds at mf to t+60 with **striated re-articulations by the morph carrier’s breath
      machinery** (`morph.js` buildCarrier / maxBreath with the 1a.2 ceilings): each segment 60–100 % of the instrument’s
      ceiling, gap ¾ s, per-voice phase spread so no two voices re-articulate together; the vibraphone’s re-articulation is a
      bow change. Technique = each instrument’s `ordinary`. Just voices carry their cents; doubles 0.
    - **Required check:** a script asserts no segment exceeds its instrument’s ceiling.
    - RESULT: he opens it in composer.html (one tab per score), plays it into his rack: chord 1 beats at D4, A♭4, D5; the
      horn’s A♭4 sounds (1a.1). **His listen closes the step.**
    *Why:* “one minute of each of the six reference harmonies, a bit of a gap … striated … never exceeding the max.”

  - **1a.5 — The four transition types as morph models** (LG-28 · LG-29 · LG-31; decisions 4, 6–9). `todo`
    - Read `morph.js`’s six models and dials (progress · the dynamics layer · the `_|_` shape · the carrier · to-unison at ≈ line
      750) and map each type onto them; **the smaller change always wins**, and whatever the tool lacked goes to MORPH_NOTES §3:
      - **Spectral** — a pitch morph with THREE stations: start set → reference → end set (1a.3’s sets), 30 · 30 · 30 s. If the
        tool has only two-station morphs, chain two legs as one saved model, or add a three-station option.
      - **Balance** — the volume-only model: pitches held on the reference, per-voice staggered entries, swells **pp → mf** on
        the dynamics layer; 90 s; no pitch motion.
      - **Bloom** — reference → bloom targets → reference, 30 · 30 · 30; the just voices’ cents go to 0 at the target, the
        tempered voices glide to their target pitch; **the vibraphone holds its bars (its doubling bar stays sounding, 14–49¢
        off the bloomed series — accepted), the bass holds partial 1.**
      - **Converge** — the to-unison model driven by LG-31’s table: movers glide 14 / 31 / 49¢ onto their targets (the just
        voice holds; onto a vibraphone bar the just voice moves); the bass enters at its start offset and glides up onto the
        lowest voice above it; chord 4’s cello 49¢ down onto the true 11th; statics hold; 30 s converge · 30 s hold · 30 s back.
      - **Dynamics, all but Balance:** **dal niente → mf** over the fade-in, held, and a 5 s fade to niente at the end (a dial).
      - **The vibraphone holds its bars in every moving type** (LG-29). Bass: Spectral moves · Balance swells · Bloom holds ·
        Converge as above.
    - RESULT: per type per chord a JSON of dial settings in **`bank/transitions/`** that the panel can load — 24 files.
    *Why:* the model is what he edits afterwards; the dials are the deliverable as much as the sound.

  - **1a.6 — The four transition scores** — `scores/lgmf-spectral.json` · `lgmf-balance.json` · `lgmf-bloom.json` ·
    `lgmf-converge.json` (decision 5). `todo`
    - Each: six transitions in his order **B♭1 · A1 · C2 · G♯1 · B1 · F♯1**, 90 s each, 10 s gaps (590 s). Built by
      **`tools/build_lgmf_transitions.js`** from the bank and the morph tool’s own emit — headless if `morph.js` can be
      required the way the notation tools require the engine; if the morph only runs in the browser, drive HIS tab through
      the panel with the loaded model and Save (principle 9 either way).
    - Each transition saved both ways: the emitted notes in the lanes AND the model object in the save (1a.0.ii).
    - **Required check:** the ceiling assertion of 1a.4 on every score.
    - RESULT: each score opens, plays end to end in his rack; the card for any transition reopens with its dials; changing
      the fade-in and re-emitting replaces its notes. **His listen closes the step.**
    *Why:* “I want to be able to just hear them, but then I can load it into the model and change like the fade in or the duration.”

  - **1a.7 — Record.** `todo` — RUNNING_LOG entries as each sub-step lands (the standing practice, not at the end) · the bank
    and the 24 transition JSONs committed · the vibraphone’s measured sustain into the record beside §48 · MORPH_NOTES §3:
    what the tool needed (three stations · an offset start · voices that hold inside a morph) · journal §2 and PLANNER current
    · commit at each sub-step wrap, push.

  **Decisions this item carries — do not reopen (RUNNING_LOG §66–§66c, COMPOSITION_NOTES LG-29–LG-31):** 0 the ReaPitch
  path · 1 the ceilings at mf · 2 gaps 10 s · 3 the carrier’s striation · 4 Balance = the volume-only model, pp → mf · 5 one
  score per type · 6 spectral sets seeded by rule, listed for override · 7 bloom = nearest non-deviant partial · 8 Converge
  = LG-31’s final table · 9 = 30 · 30 · 30 · the vibraphone holds its bars in every moving type · the bass: Spectral moves,
  Balance swells, Bloom holds, Converge mirrors the lowest voice · all but Balance dal niente → mf · only bassoon (chords 1, 3,
  5), horn and trumpet are just; everyone else tempered (LG-27).

  **His, later, by ear:** the spectral sets (override any pick) · the bloom targets · the fade and duration dials.

  **Model:** Opus builds. Fable only if a design question comes back that the decisions above do not answer.

## 2. Notate — `todo`

*To be laid out when we discuss it.* 2a engine adaptation · 2b presentation score (video +
print) — #5's shape.

## 3. Performance score — `todo`

*To be laid out when we discuss it.* Piece #5's own PLAN 3 is not built yet (its N6); this
item follows whatever that produces.

## 4. Submission package — `todo`

*To be laid out when the call is read.*
