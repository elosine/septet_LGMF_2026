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

- **1a — The six reference harmonies and their 24 transitions, heard** — `built 2026-09-19, awaiting HIS LISTENS` (1a.0–1a.7 all done; his listens close 1a.4 and 1a.6) — written 2026-09-18 by Fable from the
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

  - **1a.5 — The four transition types as morph models** (LG-28 · LG-29 · LG-31; decisions 4, 6–9). `done 2026-09-19` — RUNNING_LOG §72. Four models (LGSPECTRAL · LGBALANCE · LGBLOOM · LGCONVERGE) and **24 ACTUALs** — in `bank/actuals/`, not `bank/transitions/`, because 1a.0 (ii) found the panel's own model↔actual store. The engine gained two opt-in, byte-identical additions: `source/target.kind: 'voices'` (per-voice cents, unsorted — the chord I/O was integer semitones) and `target.mid` + `target.dwell` (a third station with a rest — 30·30·30 is dwell 1/3). MORPH_NOTES §3.
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
    `lgmf-converge.json` (decision 5). `built 2026-09-19, awaiting HIS LISTEN` — RUNNING_LOG §73. 590 s each, the gestures PLACED verbatim from their actuals. **`tools/check_ceilings.js` is the required check as a runnable gate** and all five scores are green — it caught 18 over-long notes in BALANCE on the first run. Three panel fixes were needed before a recalled model came back whole; the round trip is verified (recall → 8 voices, 75 notes; change the entrance → 75 notes, new fade, same pitches).
    - Each: six transitions in his order **B♭1 · A1 · C2 · G♯1 · B1 · F♯1**, 90 s each, 10 s gaps (590 s). Built by
      **`tools/build_lgmf_transitions.js`** from the bank and the morph tool’s own emit — headless if `morph.js` can be
      required the way the notation tools require the engine; if the morph only runs in the browser, drive HIS tab through
      the panel with the loaded model and Save (principle 9 either way).
    - Each transition saved both ways: the emitted notes in the lanes AND the model object in the save (1a.0.ii).
    - **Required check:** the ceiling assertion of 1a.4 on every score.
    - RESULT: each score opens, plays end to end in his rack; the card for any transition reopens with its dials; changing
      the fade-in and re-emitting replaces its notes. **His listen closes the step.**
    *Why:* “I want to be able to just hear them, but then I can load it into the model and change like the fade in or the duration.”

  - **1a.7 — Record.** `done 2026-09-19` — RUNNING_LOG §67–§73 written as each sub-step landed · MORPH_NOTES §3 carries what the tool lacked (three stations · a voice list with cents · the panel's three set-shaped assumptions · the carrier's start-level ceiling) · the vibraphone's measured sustain is §69 · committed and pushed at every wrap. — RUNNING_LOG entries as each sub-step lands (the standing practice, not at the end) · the bank
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

- **1b — The rack calibrated to a standard, and a QC battery that keeps it there** — `todo` — written 2026-09-19 by Fable with the composer, the top line approved (*"good"*); RUNNING_LOG §76. *Why, his words:* *"these volume levels are significantly louder than previous pieces. my system volume is on 2 and for the tuba piece and septet it was on 10 and those were fff. lets devise a way to quickly and robustly recalibrate there must be some sort of midi reference or even recorded reference or noise or something that is done in audio engineering, then a reliable way to balance the parts, for example vibraphone is quiet. this implementation is a bit of a shambles, lets find a way to shore things up and verify that everything is sound accross the board. please develop a testing and qc verifying plan that is not too onerous but reliable"*

  **The state that made it (§76):** 0d balanced RELATIVELY — every pitched instrument to the median sampler at velocity 64, the percussion raised to meet the winds at full — never to an absolute level; and it measured with REC at −12 dB, so its −39.5 dB anchor is **−27.5 dB at the master for ONE instrument at velocity 64**, full ≈ −19. Piece #5's finished render is −24.7 LUFS integrated / −1 dBTP at its fff; #5's rule CUT to its quietest instrument where 0d RAISED to the median — same method, opposite direction. The vibraphone was measured on a 0.4 s window at the onset of a 7.4 s bow that decays 20 dB. Nothing in the chain proves the meter.

  **Decision 1b.0 — the standard:** the **K-20 gain structure** (Katz / SMPTE RP 200, the orchestral-film convention): pink noise at **−20 dBFS RMS** is the monitor reference; fff tutti peaks reach **−1 dBTP**; loud passages sit near −20 LUFS-S; loudness measured in **LUFS (ITU-R BS.1770)** — the K-weighting the analyzer already uses. One monitor setting for every piece, set once on the reference and never touched. **Not adopted:** a master trim alone (fixes the clip, calibrates nothing) · a limiter (hides clips) · balancing to the quietest or the median sampler (relative, which is how the two racks came to differ by ~12 dB).

  **The order matters — 1b.1 first (the meter must be proven before anything is measured), then 1b.2 → 1b.3 → 1b.4 → 1b.5; 1b.6 gathers what 1b.1–1b.5 built into one command.** Each step's sub-steps are laid out with him when it opens.

  - **1b.1 — A reference in the rack.** `built 2026-09-19, awaiting HIS VOLUME SETTING + CTRL+S` — RUNNING_LOG §77. The tone reads back **−20.000 dBFS flat / −17.0 LUFS / −17.0 dBTP**, all three exact: the chain is unity and the meter is right. `tools/make_reference_audio.js` (seeded, byte-identical on regeneration) · `reaper/bridge/jobs/ref_track.lua` (REF at 600 s / 635 s, clear of his 0–94 s recording) · REC to **unity** and rebuilt, which also caught **three tracks it had never captured — REF and the two `Horn SI2 high` tracks of 1a.1** · `probes/reference_run.ps1` · `probes/analyze_reference.py` → `bank/reference.json`. *Result when done:* a utility track `REF` at the end of the rack holding −20 dBFS RMS pink noise (BS.1770-weighted, i.e. ≈ −20 LUFS) and a 1 kHz tone at −20 dBFS, master and REC at 0 dB; REC records it; the analyzer reads the reference back at **−20.0 ± 0.1** — the chain and the meter are proven, and the analyzer's dB scale is anchored to dBFS at the master; he sets the system volume ONCE on the noise. Sub-steps: *to be laid out when we discuss it.*
  - **1b.2 — The instrument card.** `done 2026-09-19` — RUNNING_LOG §78, **`bank/instrument_card.json`** (103/103 notes measured). **What it settled:** the chain explains 0d — `new = 0d + 12 (REC) + the applied trim` within **0.9 dB for five of seven** · the **vibraphone spreads 16.3 dB across its three pitches** (its top is 15.5 dB over its middle), which no single fader can express, and its onset overstates it ~3 dB against a wind · **every bend range measured at last**, every earlier inference right within 0.1 st, so §74’s hypothesis is dead · every pitched note within **2 cents** of written, the double bass included · the horn’s ReaPitch path +1 dB and in tune · the **trumpet’s velocity curve is not monotone** at the top and the bassoon spans only 11.3 dB. *Original result line:* one ~3-minute run through 0d's harness (`balance_schedule.js` → REC → `analyze_lgmf_balance.py`): each pitched instrument at velocity 24 / 64 / 127 on three pitches, each percussion at full on its anchor key; per note the loudness TWO ways — max-momentary (400 ms) and integrated over the whole note (gated) — plus the f0 against the written pitch and a ±50 % bend in cents (the bend probe folded in, `bend_ranges.json` filled for every instrument at last). `bank/instrument_card.json`, one table, diffed at every rerun.
  - **1b.3a — all fourteen percussion, and the vibraphone across its range.** `done 2026-09-19` — RUNNING_LOG §79, merged into `bank/instrument_card.json` (209 notes). **The percussion is solid** (Spitfire scatters 0.12–0.77 dB, so one strike per key is a measurement) and its trims can be computed now. **The vibraphone is not:** its 16 dB "register spread" is largely a **three-sample ROUND ROBIN whose members differ by up to 13.8 dB at one pitch** — 0d had already recorded its scatter at **5.99 dB SD**, worst of the ensemble. A per-register trim would fit the round robin, and no trim can stop a 14 dB jump between consecutive notes. **Open, his: can that round robin be disabled or levelled in Kontakt, or is another preset wanted?**

  - **1b.3 — Trims to an absolute target.** `done 2026-09-19, awaiting HIS CTRL+S` — RUNNING_LOG §83, `tools/compute_trims.js` → **`bank/trims.json`**. Target: a nine-voice tutti at −20 LUFS-S ⇒ **each voice at −29.54 LUFS = −31.84 dB on the card’s scale**, with the K-weighted→LUFS offset (**+2.30 dB**) READ off the proven reference tone rather than assumed. **Every instrument comes DOWN, 6.6 to 21.3 dB — not one boost in the ensemble.** The vibraphone is split: the fader takes the mean (−6.62, from +9.30), the per-pitch residuals go to 1b.4. Headroom computed: the piece’s own tutti peaks **−9.6 dBFS, 8.6 dB under the ceiling**. **And the clipping is located** — sleigh bells peak **+10.6 dBFS** and tambourines **+0.6** on ONE note today, both pushed over by 0d’s relative boosts. **APPLIED** (§84): `tools/gen_apply_trims.js` regenerates the job from the bank; **26 tracks, ok: true**, every fader within 0.01 dB — including **`Horn SI2 high` and `Horn SI2 b high`, which 0d’s hand-typed table predated and which had never been trimmed at all** (without them the horn above F4 would have stayed 12 dB loud, where five of its six chord notes live). `balanceDb` and `bank/perc_rack.json` rewritten; gates 168 / 10 / 6-of-6 green. **His CTRL+S.** *Original result line:* *Result:* the single-voice target DERIVED from the tutti under 1b.0 — nine voices at fff → −20 LUFS-S and ≤ −1 dBTP, so one voice at fff ≈ −30 LUFS-S; each instrument's anchor follows from its measured span; sustained families (the bowed vibraphone above all) judged on integrated loudness, one-shots on max-momentary; trims applied as text (`apply_trims.lua`), read back, `balanceDb` rewritten in the recipes; his CTRL+S.
  - **1b.4 — The remap regenerated** `done 2026-09-19` — RUNNING_LOG §86, `tools/build_remap_card.js` → `bank/velocity_remap.json` (supersedes `build_remap.js`/0d). **His decision, option C: the written span goes ~10 dB → 17**, the narrowest instrument now being the cello at 17.7. Scale re-indexed to the app’s real 65–127 anchor range; every curve normalised per instrument to its own fff mean, which both immunises it against the card’s mixed provenance and flattens the vibraphone’s register. **Read back through the app’s own module: six of seven instruments land within 0.3 dB of target at every written height.** The vibraphone’s loud bars land exactly; its quiet bars are flat at mf (within 1.1 dB, where the scores sit) and fall 6–9 dB short at fff, because its per-bar range 29 dB minus its 15.4 dB register spread leaves only 13.7 dB common to every bar. **CLOSED the same day (§87), at his word** — *"ok for vibes but confirm it is not employed elsewhere yet?"*, confirmed inert everywhere: no bank has ever carried a `cc7Curve`, no score uses `cc7Abs`, and `cc7Fade` multiplies the base so it composes. The vibraphone’s fader is now referenced to its **quietest** bar (−6.62 → **+2.81**, CC7 can only attenuate), one shared velocity table carries the dynamic, and CC7 carries the 15.4 dB register. **Every used pitch lands within 0.2 dB of target at pp, mf and fff — no clamps.** D13 stands for the other six. *Original result line:* from 1b.2's velocity curves (`build_remap.js`, 0d.5's method). *Decision inside:* keep the mock-up's 10 dB written span pp → fff (piece #5's §316 law) or widen it — his call, with the numbers in front of him.
  - **1b.5 — Ensemble verification.** `CLOSED 2026-09-19 at his instruction — the tutti passes, the per-part spread does not` — RUNNING_LOG §88, `bank/verify_1b5.json`. Run through the app’s OWN path for the first time (`build_1b5_score.js` → `capture_composer_midi.js` → `play_capture.ps1` → REC), and the app’s choices arrive exactly as the bank prescribes — the vibraphone’s CC7 118 / 75 are in the capture. **What failed is what the bank BELIEVES about the instruments.** Per-part spread **18.8 dB** against a wanted 3; tutti fff **−14.3 LUFS** against −20 ± 2; **true peak −5.0 dBTP PASSES.** Two faults named: **(1)** the vibraphone’s register was sampled every 4–5 semitones and the zones are finer — pitch 74 sits **11.5 dB above both** its measured neighbours 71 and 76, and most of the piece’s vibraphone writing falls between samples; **(2)** the curves are **single strikes** on samplers that scatter 2.2–3.2 dB SD — the cello’s pitch 60 reads *louder at velocity 100 than at 127*, which skews the inversion and puts it 7.1 dB low. **Closed at 12 dB span, CC7 on the vibraphone only** (§91). Final: tutti fff **−19.1 LUFS PASS** · true peak **−9.7 dBTP PASS** · per-part spread **7.71 dB** against a wanted ≤3, which is NOT met and is a decision, not an oversight — his *"it is realistic that it is going to vary a bit"*. The residual is the method’s noise floor: one voice moved 2.5 dB between two builds, and a register sampled every 2–3 semitones on instruments jittering 3.2–3.3 dB note to note cannot be flattened further by interpolation. *Original result line:* *Result:* reference chord 1 at pp · mf · ff · fff through the app's OWN path (`capture_composer_midi.js` → the rack, recorded on REC): per-part loudness spread ≤ 3 dB at each dynamic, master ≤ −1 dBTP at fff, the tutti fff within ±2 dB of −20 LUFS-S; then his ear on the same four. **His listen closes the step.**
  - **1b.6 — The standing QC battery, one command.** *Result:* `node tools/qc_rack.js` → the reference tone read back (1b.1) · the instrument card diffed against the last (1b.2) · the routing diff, capture ↔ recording (§75's dump job) · every score's true peak and integrated loudness (a headless render where `render_reaper.js` is ported to this rack's track names, else his recording). ~5 minutes; a report in `docs/qc/`, each run diffed against the previous; **run after any change to the rack, the recipes or the remap.**
  - **1b.7 — Record.** RUNNING_LOG as each step lands (the standing practice) · the bank files · journal §2 and PLANNER current · commit and push at every wrap.

  **Model:** Opus builds 1b.1–1b.7 after a clear. Fable only if a design question comes back that 1b.0 does not answer.

- **1c — The strikes drawer for this piece** — `doing` — opened 2026-09-19 under the planning method: phase 1 (the shared
  understanding, RUNNING_LOG §92) done; the top line NOT yet agreed — he cut to a first stage at his word (*"let's just do this much
  and let me try it in the new piece"*). His principles, verbatim in COMPOSITION_NOTES LG-32: nothing in the drawer changed unless
  necessary, and every necessary change checked with him · only the features he asks for · robust, no post-build troubleshooting.
  *Why:* the drawer is LG-7's named model and his working instrument for hearing a harmony orchestrated; this piece's harmonies are
  spectra (LG-18 … LG-26), and the drawer has no way to make or hear one yet.
  - **1c.1 — Stage 1: the column draws with no strikes · the eight players · an `ordinario` set.** `done 2026-09-19, awaiting HIS
    LISTEN` — RUNNING_LOG §92. `fillSeq()` renders the banners when the bank has no sequences (the only change to an existing path,
    and only on that branch); `ART_SETS.ordinario` = each recipe's `ordinary`, the vibraphone on `std_mallets_vel` at his word;
    palette_check 184. Verified in the running app: six banners, a stack loads, eight rows, `ordinario` on every row, shuffle 6 of 6.
    **His test:** reload the tab → Strikes → a harmony → `ordinario` → shuffle → SPACE.
  - **1c.2 — Long tones on Hear** (a `hear` menu: strike | long tone, with a seconds box; SPACE plays or stops it; Insert follows
    the menu — his decision A, 2026-09-19; the vibraphone bowed in `ordinario`) — `done 2026-09-19, awaiting HIS LISTEN` — RUNNING_LOG
    §94: `score/public/long_tone_ui.js` (loaded last), `ART_SETS.ordinario` vib → `bowed_vel`; verified in the running app (six notes
    @0 / 4000 ms on `long tone`, 100 ms on `strike`, the take state carrying and restoring, the box surviving a reload).
    *Result when done:* with `long tone` chosen, SPACE (or Hear orchestrated) sounds the loaded harmony as dealt — every player its
    note, together, held N seconds — and Insert @ playhead writes that held chord; with `strike` chosen the drawer is exactly as it was.
    - The menu and the box in the foot, right of `Hear orchestrated`: `hear [strike | long tone] [6] s`. Both live in `cfg`
      (`hearMode`, `longS`) — remembered in the browser, saved and restored in takes; the box greyed on `strike`.
    - The hook: a new file `score/public/long_tone_ui.js`, loaded after every other drawer mixin, wrapping the notes Hear builds
      (`notesFor`): on `long tone` and mode `orch` → each player·pitch once, onset 0, held N s (the strike's velocity, dyn × and flat
      127 still apply). `piano` mode and `strike` untouched; with the menu on `strike` the wrapper returns the chain's notes unchanged.
    - SPACE: plays when idle, stops when playing — already so; not touched.
    - Insert @ playhead follows the menu (A): with `long tone` on it writes the held chord (N-second notes) as one strike group; the
      status says "long tones · N s".
    - `ordinario`: the vibraphone `std_mallets_vel` → `bowed_vel` (the reference scores' voice); palette_check asserts the key.
    - The status line while hearing: "hearing long tones · N s · k notes".
    - Verify in the running app: menu on `long tone` → the notes Hear would send = every voice once, onMs 0, durMs N × 1000, the
      eight lanes' voices; menu back on `strike` → identical to before the change; a take saved with `long tone` on restores the menu
      and the box after a reload. palette_check GREEN. RUNNING_LOG · STRIKES_TOOL · this plan; commit; push.
  - **1c.2b — Hear through the remap; a dynamic pull-down ppp … fff; Insert's height law** — `done 2026-09-19, awaiting HIS LISTEN` —
    RUNNING_LOG §95. His finding (*"they don't seem volume balanced"*): `playNotes` sent CC7 127 and the raw velocity to every
    instrument. Now every note's `vel` is the anchor on the written scale and `playNotes` sends each instrument its own velocity and
    CC7 for that level (the score's `heldNote` / `cc7ForHeight`). `dyn [ppp … fff]` replaces `dyn ×` and `flat 127` on the foot (his A),
    default `mf`, the ladder = the written scale evenly (65 … 127, ≈ 1.7 dB a step over 1b's 12 dB). Insert writes `(anchor − 65) / 62`
    as the height (was `vel / 127`, right only at fff). `dyn_ui.js`, loaded last. Verified in the running app: at mf Hn 83 · Db 81 ·
    Bsn 83 · Vib 99 / CC7 93 · Vc 109 · Perc 100; the select carried and restored by a take; the height law round-trips in node.
  - **1c.3 — two vibraphone players, one per bow** — his, 2026-09-19 (LG-33): *"I want two vibraphone players, because they have two
    bows. But let's do that after."* — *to be laid out when we discuss it.*
  - **1c.4 … — the later stages:** the SPECTRUM source (a fundamental → the four columns just · just per octave ·
    tempered · tempered per octave, the partial number on everything, ± cents on the just, partial checkboxes, set toggles) · range
    lines beside the keyboard · takes restoring every checkbox — *to be laid out when we discuss it* (the top line first). Two
    questions open for him: does the long tone reach Insert (§AC-2: Hear plays what Insert writes) · "transposed into each octave"
    = every octave of the keyboard, or the octave above the fundamental only.


## 2. Notate — `todo`

*To be laid out when we discuss it.* 2a engine adaptation · 2b presentation score (video +
print) — #5's shape.

## 3. Performance score — `todo`

*To be laid out when we discuss it.* Piece #5's own PLAN 3 is not built yet (its N6); this
item follows whatever that produces.

## 4. Submission package — `todo`

*To be laid out when the call is read.*
