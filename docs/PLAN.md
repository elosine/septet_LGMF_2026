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
    bows."* — `done 2026-09-19 at his "just go ahead", awaiting HIS LISTEN` — RUNNING_LOG §96. A second SEAT, not a ninth lane:
    `Vibraphone 2` is a ninth row in the drawer on the vibraphone's lane (`EXTRA_SEATS`, the drawer's own `TRK()`); `seats_ui.js`
    (loaded last) sends a seat's notes out on the score lane with `seat: 2`; Hear routes them to the first curve channel, Insert writes
    them as drawn notes so the score's pool separates the bows; a seat is busy when its lane is. Verified in the running app: nine
    rows, the vibraphone dealt two notes, the departing notes on lane 5 as main + seat 2, the routes channel 1 and 2.
  - **1c.4 — The natural harmonic series as a source: the JUST column** (type a fundamental → every partial up the 88 keys, each dot
    with its partial and its ± cents; Hear bends, Insert writes the bend; fixed-pitch players never take a note more than 5 ¢ off) —
    `done 2026-09-19, awaiting HIS LISTEN` — RUNNING_LOG §97: `spectrum.js` (pure; `tools/spectrum_check.js` GREEN 23 — it caught a
    stray `/100` on its first run) · `spectrum_ui.js` (the banner, the labels, `mayTake`) · four additive lines in the core (notesFor's
    `cents`/`partial`, playNotes' bend, insert's `morphBend` + drawn, the `mayTake` hook in the shuffle's fit test and `fitReal`).
    Verified in the running app: 65 partials of C2 with the textbook cents, no fixed-pitch violation after a shuffle over nine rows,
    partial 7 refused by the vibraphone and taken by the horn, the take rebuilding `sp:C2:just`.
    *Result when done:* a banner `HARMONIC SERIES · from the fundamental` in the left column with a fundamental box and one row; the
    row loads like any harmony (its id rebuilds it, so a take restores it); the keyboard shows every partial to the top of the 88 in
    one column at the right, `p · ±c¢` beside each dot; SPACE plays the just pitches (a bend per note), Insert writes `morphBend`
    as `lgmf-ref` carries it; the vibraphone, its second seat and the percussion are never dealt a note more than 5 ¢ off.
    - A new banner `HARMONIC SERIES · from the fundamental` with a fundamental box (note name or MIDI, like the STACKS root) and one
      row *partials of C2 · n notes*; id `sp:<fund>:just`; the `88` view switches on when it loads.
    - The pure arithmetic in `score/public/spectrum.js` (UMD, `node tools/spectrum_check.js`): partial p → 1200·log₂ p above the
      fundamental → nearest key + deviation; every partial whose key is ≤ 108. Each note carries `partial` and `cents`.
    - The keyboard: the dots in one column at the right, `p · ±c¢` beside each (a partial within tolerance shows `p` alone); the wrap
      widened so the three later columns have room to the left.
    - Cents through the drawer — additive changes to the core: a voice keeps `cents` and `partial` (set on select); every note leaving
      `notesFor` carries them (a stand-in carries 0); `playNotes` sends the bend before the note through MorphEmit.sendBend (the
      instrument's measured range), panic re-centres; Insert writes `morphBend [[0, c], [dur, c]]` and the note as drawn (no `plain`),
      with the partial in its performance note.
    - The fixed-pitch rule: `mayTake(voice, lane)` — a hook the shuffle's fit test and `fitReal` both ask; false when |cents| > 5 and
      the player's `playerBendSt` is 0 (vibraphone, its seat, percussion). Within 5 ¢: the tempered note, cents dropped.
    - Verify in the running app: C2 → the partials, keys and cents against the table (3 · +2¢, 5 · −14¢, 7 · −31¢, 11 · −49¢); the
      departing notes carry cents; no fixed-pitch player holds a > 5 ¢ note after a shuffle; the take round trip. palette_check;
      RUNNING_LOG, STRIKES_TOOL, this plan; commit; push.
  - **1c.5 — the range lines · the JUST / 8ve column · labels in pink and green** — `done 2026-09-19 at his word, awaiting HIS LISTEN`
    — RUNNING_LOG §99. One thin range line per instrument in a 30 px strip at the left of the keyboard (always; the hovered row's
    brightens); the partials transposed into every octave of the 88 (each pitch class with its cents, named by its lowest partial —
    C2: 33 classes, 244 notes) as a second column left of the JUST one, the same fixed-pitch rule; the banner's second row `just +
    8ve`; labels and chips coloured by set (JUST pink, 8ve green). `spectrum_check` 29. Verified in the running app: 8 range lines
    with the right extents, 88 green and 40 pink dots and labels, no fixed-pitch violation, the hover, a plain harmony unaffected.
    *Revised the same evening at his word (§100):* the keyboard much wider — the columns measured and pushed apart to the right of the
    keys (no overlap even for G0), the range lines on the keys in a colour per instrument with a swatch on each row.
  - **1c.6 — the two TEMPERED selections** — `done 2026-09-19 at his word, awaiting HIS LISTEN` — RUNNING_LOG §101. Four rows in the
    banner, each its own harmony: `just` · `just + 8ve` · `tempered` · `tempered + 8ve`; the tempered sets = the partials on their
    keys, no cents; the tempered classes = the twelve pitch classes named by their lowest partial. Colours: blue and amber beside the
    pink and green. `spectrum_check` 35. Verified in the running app: 153 voices all at 0 ¢, the columns, the chips, a take round trip.
  - **1c.7 — the partial checkboxes** — `deferred 2026-09-19 at his word` (*"let's just make a note to maybe add the partial
    checkboxes as a feature"*): the last item of LG-32 — *"if I only want to see partials one, three, and five, I can have a checkbox
    for those"*. A MAYBE, not a commitment; the four selections cover what he needed. Also in `docs/NITS.md`.
    *Why it can wait:* the shuffle deals from whatever the selection holds, and a hand assignment already picks any single partial. (a fundamental → the four columns just · just per octave ·
    tempered · tempered per octave, the partial number on everything, ± cents on the just, partial checkboxes, set toggles) · range
    lines beside the keyboard · takes restoring every checkbox — *to be laid out when we discuss it* (the top line first). Two
    questions open for him: does the long tone reach Insert (§AC-2: Hear plays what Insert writes) · "transposed into each octave"
    = every octave of the keyboard, or the octave above the fundamental only.


- **1d — The SEQUENCE drawer: sustained chords in time containers** — `doing` — opened 2026-09-19 under the planning method
  (RUNNING_LOG §102–§104; his brief verbatim in COMPOSITION_NOTES LG-35, the dynamics LG-36). Phase 1 settled: a sequence is a
  RECIPE saved in the score file and the notes are DERIVED from it; a container's chord is FROZEN when chosen (with a refresh); edit
  in the drawer, the score shows the result (his A); one dynamic per container now. Phase 2 confirmed as given (§104).
  **Amended the same day (§109–§111; LG-38 · LG-39): a WAVES layer — 1d.7, placed before his listen — and a box is a straight dynamic
  OR reads the waves; 1d.1 gained two to-dos so the generator is ready for it.**
  *Why:* the first tool of the design phase — the six chords exist as data and as scores but nothing yet says how a chord is used in
  TIME; he asked for *"music structures in my score"*: chords held for durations, swappable, with the morph's breaths laid over them.
  - **1d.1 — The generator** (a recipe in, every player's notes out — pure, proven in node) — `done` 2026-09-19, session 8 (RUNNING_LOG
    §114; `node tools/sequence_check.js` **49**; `docs/SEQUENCE_TOOL.md`). The calls made alone, his to reverse (§114): under `attack`
    the striation lives in the first breath's length · a player attacking the next chord lands one gap before the line · a would-be
    runt is folded into the landing · an absent player lands on the line and re-enters · a double stop is one player on one bow ·
    one random stream per (player, box).
    *Result when done:* `score/public/sequence.js` exists — pure, loaded by the page and by node, knowing nothing of the drawer or
    MIDI. Given a recipe — a start time; a list of containers, each with a duration, a chord (the notes a take deals: lane ·
    technique · pitch · cents · the dealt level) and a dynamic (`as dealt` or `ppp … fff`); the change rule (`attack` | `seamless`);
    and the breath dials at the morph's defaults — it returns every player's chain of notes in absolute time, each with its lane,
    pitch, cents, technique, start, end, level and flags. Under `attack` every player's chain restarts at each container boundary;
    under `seamless` one chain runs across the whole sequence and each breath takes the pitch and the level of the container it
    starts in. No breath exceeds its player's ceiling from the palette — the breath or the bow, and the gap after it, the same source
    the six reference scores used — split, never truncated; a fixed-length sound (the percussion) is struck once per breath and the
    sample decides its length. `tools/sequence_check.js` proves it from the command line on the six reference chords: the container
    arithmetic, both change rules, the dynamic carry, the ceilings, the same seed giving the same result. Nothing sounds yet and
    nothing is in the drawer — that is 1d.2.
    - Fix the recipe as one JSON shape, written in the file's header: `t0` · `containers [{ dur, chord, dyn }]` · `change` ·
      `breath { striation, length, jitter, seed }` — the chord being the notes as a take deals them (lane · technique · pitch · cents
      · level · seat).
    - Write `score/public/sequence.js` with the morph's breath rules as numbers, not shared code: the staggered first entries, the
      striation phases, the gap after a breath (almost none after a bow), split-never-truncate at the ceiling. `morph.js` untouched.
    - The ceilings from the same source the six reference scores used — the palette's breath or bow per instrument and level; in
      node, the way `check_ceilings.js` already reads them.
    - `attack`: every chain cut at each boundary and restarted. `seamless`: one chain per player; each breath takes the pitch and
      level of the container it starts in. The sequence ends where the last container ends — the final breaths dealt to land there.
    - The dynamic: `as dealt` keeps each note's own level; a chosen `ppp … fff` maps through the written scale the drawer's `dyn`
      already uses — the same function, not a copy.
    - Chains keyed by seat, not lane — the two vibraphone bows stay two players; a fixed-length sound (the percussion) is struck once
      per breath.
    - One seed; the same recipe and seed give the same notes.
    - *(Amended 2026-09-19, §111 — for 1d.7 and the held drawn-curve feature.)* A note's level is carried as BREAKPOINTS from the
      first day — `[[0, level], [dur, level]]`, flat today — so a wave or a curve later changes the numbers, not the generator's shape.
    - *(Amended likewise.)* The breath ceiling is read at a note's LOUDEST level, not its starting one — the palette's ceiling
      shortens as the level rises, and the morph has the bug on record (MORPH_NOTES §3, 1a.6: a swelling note outgrows a ceiling read
      at its quiet start). Flat today, so the two are the same number; the rule is in place for 1d.7.
    - `tools/sequence_check.js` on the six reference chords: durations and boundaries add up · under `attack` everyone starts at
      every boundary · under `seamless` a pitch changes only at a breath start and a breath across a line keeps the old chord · the
      level carries the same way · no note longer than its ceiling · same seed, same result · a 0 s container or an empty chord
      refused with a message. Registered in CLAUDE.md's checks line.
    - `docs/SEQUENCE_TOOL.md` opened — the recipe, the rules, the numbers; RUNNING_LOG; commit, push.
  - **1d.2 — The drawer, one container at a time** (a row of boxes — take · seconds · dyn — Hear, Insert, the recipe saved with the
    score) — **BUILT 2026-09-19 (session 9, RUNNING_LOG §115), HIS TEST OUTSTANDING → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — his "good", 2026-09-19.
    *As built:* `score/public/sequence_ui.js` + two script tags; `strike_drawer.js` unchanged; verified in the running app with no
    MIDI (§115 has every number); `docs/SEQUENCE_TOOL.md` §9. Three calls made alone, shown him in the proposal, his to reverse:
    **SPACE goes to what he clicked last** (strip · strikes drawer · score) · **one row = one sequence = one place in the score**
    (Insert again MOVES it; `new` takes a fresh id) · **the strip sits UNDER the strikes drawer**, not beside it (that drawer is
    full-height). Found on the way: `playNotes` never takes a bend back — handled from outside (§115).
    *Result when done:* a `SEQUENCE` drawer opens beside the strikes drawer. It shows a row of boxes, each one container, its width
    its duration; `+` adds a box, `×` removes it, `◂ ▸` moves it. Click a box to give it a take (a pull-down of the strikes takes),
    its seconds and its dyn (`as dealt` or `ppp … fff`); a `change` menu, `attack | seamless`. SPACE plays the whole sequence through
    the strikes drawer's own player, so it sounds at the levels and bends the drawer already sounds. Insert @ playhead writes the
    generator's notes onto the lanes as one group with one META bar over the span, and the recipe into the score file, so the working
    copy and every named version carry it. Nothing can be reopened or re-rolled yet — that is 1d.3 and 1d.4.
    - `score/public/sequence_ui.js`, loaded last, opened from where `Strikes` opens; nothing in the strikes drawer changed.
    - The row: `+ container` · a box shows its take, seconds and dyn · `×` · `◂ ▸` · the width follows the seconds · `change
      [attack | seamless]`.
    - Choosing a take LOADS it in the strikes drawer — so he sees what he chose — and the sequence takes its notes as `long tone`
      deals them (each seat once, cents, the dealt level) and freezes them in the box; `refresh from take` re-reads. *(The consequence,
      told him: choosing a take replaces whatever is undealt in the strikes drawer — save it as a take first. Dealing a take silently
      off-screen would mean changing the drawer's core, which his constraint forbids unless necessary.)*
    - SPACE / Hear: the generator's notes through the strikes drawer's player — the remap of 1c.2b, the bends of 1c.4 — from the
      start, or from a clicked box; stop as the drawer stops.
    - Insert @ playhead: drawn notes on their lanes, cents as `morphBend`, height = the anchor — the same objects the strikes drawer
      writes — as `grp-seq-<id>`, plus one META bar over the span; the recipe into the score's `databases.sequences` under that id.
    - The drawer's own state (the row being built) remembered across a reload, as the strikes drawer's is.
    - Verify in the running app, no MIDI: three containers of reference chords → the boxes, the frozen notes, Hear's note list
      against the generator, the inserted objects (count, lanes, `morphBend`, heights), the META bar, the recipe in the saved score, a
      reload. `palette_check`. SEQUENCE_TOOL, RUNNING_LOG, this plan; commit; push.
    - **His test:** reload → `Sequence` → `+` → a take · 8 s · mf → `+` → another · 13 s → SPACE → Insert → play the score.
  - **1d.3 — The round trip** (reopen a placed sequence, change anything, re-Insert replaces it in place) — **BUILT 2026-09-19 (session 9, RUNNING_LOG §116; SEQUENCE_TOOL §10), HIS TEST OUTSTANDING → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — *as built:* all in `sequence_ui.js`; the list · the start read from the META bar · re-insert IN PLACE (this CHANGES 1d.2's "Insert again moves it" — kept as a separate `move to playhead` button, his to reverse) · the status counts notes changed or deleted by hand · an orphan stays in the list, marked · a dirty row asks before it is replaced · verified in the running app with no MIDI; NOT verified: sound, and a real canvas drag of the META bar — his "good",
    2026-09-19.
    *Result when done:* a placed sequence can be reopened and changed. The drawer lists the sequences in the open score; pick one and
    it comes back as it was — the boxes, the frozen chords, the seconds, the dyns, attack or seamless — with its start read from where
    the group now sits in the score, so a sequence he dragged reopens where he moved it. Change a duration, swap a chord, change a
    dyn, remove or reorder a box, and Insert REPLACES IN PLACE: the old notes go, the new ones are written from the same start, the
    META bar is redrawn, the recipe updated under the same id. The recipe is the truth: notes hand-edited in the score are overwritten
    by a re-Insert, and the status says so.
    - A `sequences in this score` pull-down in the drawer, read from the score file's `databases.sequences`; pick one → the recipe
      back in the row, every control of 1d.2 live on it.
    - The start read from the group's current position in the score (its META bar), not from the recipe — a dragged sequence reopens
      where it was moved to.
    - Swap = choose another take on the box; the seconds, the dyn, `×`, `◂ ▸` as in 1d.2.
    - Insert on a reopened sequence replaces in place: the old group's objects removed by their id, the new written from the same
      start, one META bar, the recipe updated under the same id; the status counts what was replaced.
    - The recipe is the truth: a note dragged or edited by hand inside a sequence's group is overwritten by re-Insert; the status
      says so. Stretching the META bar does not change the containers — re-Insert restores them.
    - *Not built, told him:* reopening by CLICKING the META bar in the score — it needs a hook in the score's canvas, which his
      constraint keeps untouched unless necessary. His to ask for; it becomes a checked change.
    - Verify in the running app, no MIDI: insert three containers → reopen from the list → change the second's seconds, swap the
      third's take, change a dyn → Insert → the old objects gone, the new count, positions and pitches right, one META bar, the recipe
      updated; move the group in the score model → reopen reads the new start. SEQUENCE_TOOL, RUNNING_LOG, this plan; commit; push.
    - **His test:** reload → `Sequence` → pick a placed sequence → the second box to 20 s → Insert → play.
  - **1d.4 — The roll** (the time container generator in the drawer: a pool, an order, a contour → a row of empty boxes to fill) —
    **BUILT 2026-09-19 (session 9, RUNNING_LOG §117; SEQUENCE_TOOL §11), HIS TEST OUTSTANDING → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — *as built:* the generator takes `chord: null` as a rest with NO new machinery (the absent-player rule, for everyone; `sequence_check` 49 → 60) · the roll line in `sequence_ui.js`, `time_containers.js` unchanged, the dials and defaults `containers_ui.js`'s · `tilt` fills the weights box · the recipe keeps `roll { … }` · the strip's height is its content's. **ONE CALL CHANGED WHILE BUILDING, his to reverse: a roll over a row that holds chords KEEPS them, by position** (it still asks first, and says how many are kept or dropped) — the plan below says the row is replaced; a re-roll is a re-timing, and losing every chosen take to try another seed would make the roll unusable. Verified in the running app with no MIDI; not verified: sound — written at his word without review (*"go ahead and write up the rest of the plan, I don't need to see the rest"*,
    2026-09-19; RUNNING_LOG §107).
    *Result when done:* a `roll` strip in the drawer carries the generator's own dials — the values he types, their weights, the unit,
    the total to fill, stick and jump, the contour with its turn · bow · depth, the seed, the presets — the same module the strikes
    drawer's `containers` shape uses (`time_containers.js`, piece #5's, untouched). `roll` lays the rolled durations out as a row of
    EMPTY boxes; he clicks each and gives it a chord and a dyn as in 1d.2, and any box's seconds can still be typed over. The status
    says how many containers came out and by how much the roll stopped short of the total. An empty box is a REST: silence for its
    duration, every player stopping at its start and beginning again after it.
    - The strip: `values` · `weights` · `unit` · `total` · `stick` · `jump` · `contour` (+ `turn` · `bow` · `depth` when not flat) ·
      `seed` with a `re-roll` (the next seed) · the presets pull-down sorted by spread, filling the boxes as it does in the strikes
      drawer. The dials and their defaults are `containers_ui.js`'s, so one habit serves both drawers.
    - `tilt [short ◂ ▸ long]` — his *"weight the higher ones or low ones"*: one control that FILLS the weights boxes toward the long
      or the short values (weight ∝ value^k); a typed weight still stands. In the drawer only; the generator is not changed.
    - `roll` on an empty row → n empty boxes. `roll` on a row that holds chords → asks first (the row is replaced). A rolled box is an
      ordinary box afterwards: seconds typed over, removed, moved.
    - The recipe keeps the roll's dials (`roll { … }`) beside the containers, so a reopened sequence shows how its durations were
      made and `re-roll` works on it; the containers, once rolled, are the truth — hand changes are not re-derived.
    - An empty box is a REST: the generator takes `chord: null` as silence — under both change rules every chain ends at the rest's
      start and begins again at its end. `sequence_check.js` gains the case. *(1d.1's "an empty chord refused" stands for a chord
      object with no notes — a malformed box; a rest is `null` and deliberate.)* **His to reverse — he has not seen this.**
    - The shortfall in the status: `rolled 7 · 57 of 60 s · 3 s short` — the generator's own report; nothing stretched to fit.
    - Verify in the running app, no MIDI: his own set (`3 9 7 8`), a weighted value, the tilt both ways (the weights boxes filled, the
      roll's mean moving with it), a preset, the same seed twice, a roll over a filled row asking first, a rest between two chords
      (no note inside it, everyone re-entering after it), a rolled sequence inserted, reopened, re-rolled. SEQUENCE_TOOL, RUNNING_LOG,
      this plan; commit; push.
    - **His test:** reload → `Sequence` → `roll` with `3 9 7 8` → click each box, a take and a dyn → leave one empty → SPACE → Insert.
  - **1d.5 — The breath layer's dials** (striation · length ± jitter · `together` · a pool of short and long lengths — the morph's
    numbers as the default) — **BUILT 2026-09-19 (session 10, RUNNING_LOG §118; SEQUENCE_TOOL §12), HIS TEST PASSED 2026-09-19 (*"test good"*, §121)** — *as built:* his *"go"* on a five-call proposal (blank `together` = free, because the plan asked 0 to be both strict and the untouched default · one dial, the unsnapped kept apart · the shortest breath leads · a pool value played as written · converging / diverging left the morph's). **Changed from the text below while building, his to reverse:** a start is moved to the NEAREST free place, earlier or later (below: "moved later") · a snap goes to the re-entry nearest to where the start would have fallen, and at 1 to the leader's next (below: "the nearest coming start") · `CROWDED` — eight players have room for `apart` ≈ 0.75 s, past it the rule says so · no `defaults` button · the strip's head WRAPS (it was 61 px too long at 1280 px before this step). The gate is `tools/sequence_baseline.json`. `sequence_check` 88 — written at his word without review (2026-09-19; RUNNING_LOG §107). His brief (LG-35): *"strictly
    striated, never together, or … some probability where sometimes they're together … short ones combined with long ones … the default
    should be similar to what's in the morphs … I might not want to design too much there, but just have the possibilities or at least
    the architecture there."*
    *Result when done:* a `breath` strip in the drawer: `striation` (the morph's five — staggered · grouped · aligned · converging ·
    diverging) · `length` and `jitter` · `together` 0 … 1 · `lengths`, an optional pool of values and weights · a seed with
    `re-breathe`. With nothing touched the sequence breathes exactly as 1d.1 made it breathe — the morph's numbers. At `together` 0 no
    two players ever begin a breath within a set distance of each other (a container's `attack` excepted — that is everyone, by
    design); toward 1, more and more re-entries are shared, and at 1 everyone breathes together. With a pool of lengths each breath's
    wanted length is drawn from the pool instead of `length ± jitter` — short with long — and the ceiling still binds every one.
    - The strip and its defaults: the carrier's numbers as the morph panel ships them, read at build time and written into
      SEQUENCE_TOOL with their source. The five striations by the morph's names.
    - `together` 0 = STRICT: after the deal, any breath start closer than `apart` seconds to another player's is moved later (the
      breath before it held longer within its ceiling, else its gap widened); `apart` a number his ear decides, default 0.5 s, in the
      strip. Between 0 and 1: each breath start snaps, with that probability, to the nearest other player's coming start. 1 = all
      shared. Seeded.
    - `lengths`: values + weights, the time container generator a second time (each player its own stream from the one seed; stick
      and jump at the generator's defaults, not exposed). Empty = `length ± jitter`. A drawn length above the ceiling becomes the
      ceiling and is flagged, as 1d.1 flags it.
    - The breath dials live in the recipe (`breath { … }`), so a reopened sequence breathes as it was dealt and `re-breathe` re-deals
      it without touching the chords or the durations.
    - `sequence_check.js` gains: the defaults give output IDENTICAL to 1d.1's (the gate that keeps step 1's results from drifting) ·
      `together` 0 → no two starts within `apart` outside attack boundaries · `together` 1 → every start shared · a pool → every
      breath's length is a pool value or its ceiling · same seed, same result.
    - Nothing further designed, at his word: no per-player breath dials, no breath contour, no drawn breath marks. The recipe's
      `breath` object is where they would go.
    - Verify in the running app, no MIDI: the strip's defaults against the morph's · `together` 0 / 0.5 / 1 on a 40 s container (the
      starts listed per player) · a pool `3 9` · `re-breathe` changing the deal and nothing else · a reopened sequence keeping its
      breath. SEQUENCE_TOOL, RUNNING_LOG, MORPH_NOTES §3 (what the all-purpose carrier would take from this), this plan; commit; push.
    - **His test:** reload → `Sequence` → one long container (40 s) → `together` 0, SPACE → `together` 0.5, SPACE → `lengths 3 9`,
      SPACE → `seamless` across two chords, SPACE.
  - **1d.7 — The waves layer** (each player on their own dealt stream of swells; a box is a straight dynamic OR reads the waves) —
    **BUILT 2026-09-19 (session 10, RUNNING_LOG §128; SEQUENCE_TOOL §13; `sequence_check` 107) — **HIS TEST OUTSTANDING → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162).** *(RESOLVED the same day, §130: the six fader curves had been MEASURED in 0d — `bank/balance.json` `cc7` — and this morning's `build_remap_card.js` wrote only the vibraphone's into the bank; the builder now writes all seven, the rest of the bank byte-identical, and Hear moves every player. What follows is the record of the finding as first made.)* ⚠ AS FIRST FOUND, THE WAVE SOUNDED ON THE VIBRAPHONE ONLY: `bank/velocity_remap.json` has a measured CC7 curve (`cc7Curve`) for the bowed vibraphone alone, and without one the score's law answers CC7 127 — for the other six a drawn height moves nothing. §121's "the score already has the law" was true of the code and false of this rack; caught by capturing what Hear sends. HIS DECISION, put to him: measure the six (the vibraphone's probe) · borrow the vibraphone's curve, labelled, and measure later. Nothing in the generator or the drawer changes either way — only the bank. It bites 1d.8's fades-to-a-dynamic the same way.** — before it: **READ RUNNING_LOG §121–§123 BEFORE BUILDING (session 10): his answer is option A — NO niente inside the waves, `low` and `high` are two WRITTEN dynamics (`ppp` … `fff`); true silence belongs to the EDGES (1d.8). Three sentences below are superseded: `swell_ui.js` is NOT reused and the strikes drawer's player is NOT changed — it cannot ramp, so the sequence drawer sends the CC7 ramp itself after `playNotes`, on the same routes and timers · the law is the score's own (`heldCc7`, every waved note stamped `velRef` = `high` and written DRAWN), which already carries the vibraphone's register · the sentence on `niente` is WRONG (the drawn bottom is ppp, 12 dB under fff, not silence; `lgmf-ref` reaches silence with `cc7Fade`, a one-way window).** — AMENDED INTO THE ITEM 2026-09-19, the same day the item was written (RUNNING_LOG §109–§111; his words verbatim in
    COMPOSITION_NOTES LG-38 and LG-39). **Position: after 1d.5, before his listen (1d.6)** — the id is the next free one, the place is
    the build order. Written at his word without review (*"go ahead and write in the plan and then check in before go"*), from the
    read-back he approved (*"thats good"*): the six dials, the swap, the three touches.
    *Why:* the morph's dynamics are ONE wave copied to every voice and phase-shifted — nothing in it is random (§109) — and he asked
    for *"randomized crescendos. Not everyone is crescendoing at the same time … individual waves"* without deciding *"every swell and
    length"*.
    *Result when done:* a `waves` strip in the drawer: `lengths` (a pool of swell lengths, values and weights) · `low` and `high` (two
    dynamics, `niente` allowed as `low`) · `density` 0 … 1 · `peak` 0 … 1 · a seed with `re-wave`. Each box's `dyn` pull-down has
    `waves` beside `as dealt` and `ppp … fff`, and one control sets every box at once. In a waves box every player rises and falls
    on a stream of swells of their own — dealt, seeded, out of step with the others — between `low` and `high`; a straight box holds
    its dynamic as before. The streams run on under the whole sequence, so a box that steps out to a straight dynamic does not
    restart them: the next waves box picks each player's wave up where it has got to. The score shows a wave as the note's drawn
    curve and plays it the way it already plays a drawn crescendo — one CC7 ramp under a constant velocity, the morph's way, so a
    breath re-entering mid-wave does not lurch. With every box straight the output is exactly what it was before this step.
    - The stream, pure, in `sequence.js`: per player (seat), from the one seed — swell lengths drawn from the pool through
      `time_containers.js` (the third use of it; stick and jump at its defaults, not exposed); each slot a swell with probability
      `density`, otherwise a flat stretch at `low`; a swell rises from `low` to `high` and returns, its top at `peak` of its length
      with a little seeded jitter; defined over the whole sequence in absolute time, whether or not a box reads it.
    - Reading it: a note in a waves box takes its level breakpoints from its player's stream over its own span (1d.1's breakpoints,
      no longer flat); a note in a straight box is flat as before. The level belongs to the BREATH (§103): under `seamless` a breath
      keeps the mode of the box it started in across the line; under `attack` the change is at the line.
    - The order of the deal: the streams first (they depend on time alone), then the breaths — each ceiling read at the LOUDEST level
      the stream reaches inside the candidate note (1d.1's amended rule), so a wave can shorten a breath and never the reverse.
    - `low` · `high` on the written scale (1b's anchors, the pull-down of 1c.2b); `niente` = the bottom of the drawn height, as
      `lgmf-ref`'s dal niente entries write it. `low` at or above `high` refused with a message.
    - Two players that are not like the rest: **the vibraphone** — its CC7 already carries the register (1b, §91), so the wave
      multiplies into it rather than replacing it; do what `lgmf-ref`'s dal niente does for it. **The percussion** — a fixed-length
      sound takes the wave's level at its strike as its level; no ramp.
    - The strip and the box: `waves` in each box's `dyn`; `all boxes → [straight | waves]`; a waves box wears a small mark. The
      recipe: `waves { lengths, weights, low, high, density, peak, seed }`, and `containers[i].dyn = 'waves'`. A reopened sequence
      keeps its waves; `re-wave` re-deals the streams and nothing else.
    - Hear: the wave must be audible on SPACE, not only after Insert. First read how `swell_ui.js` (piece #5's PLAN 1o — the strikes
      drawer's swells) ramps CC7 through the drawer's player, and reuse it. **If the drawer's player needs a change, it is put to him
      before it is made** (LG-32: nothing existing changed unless necessary and checked with him).
    - `sequence_check.js` gains: every box straight → output IDENTICAL to before this step (the gate) · in a waves box every level
      within `low … high` · two players' streams differ and are not phase copies of one another; the same seed repeats · a straight
      box between two waves boxes: flat inside it, and the third box's waves EQUAL the all-waves deal's third box (the stream was
      not restarted) · `seamless`: a breath across the line keeps its box's mode · `density` 0 → flat at `low`, 1 → swells back to
      back · no note longer than the ceiling at its loudest level.
    - Not designed, at his word: per-player wave dials and a drawn curve (the held features below) · `lock to breath` — each breath
      one swell — offered in §109 and not taken up; the waves run FREE of the breaths, his "a layer … like the time containers".
    - Verify in the running app, no MIDI: three boxes all waves → the inserted notes' curves differ per player and stay within
      `low … high`; the middle box flipped to `mf` → flat there, the third box unchanged against the all-waves deal; `re-wave`
      changes the curves and nothing else; a reopened sequence keeps its waves; Hear's messages carry the ramp. SEQUENCE_TOOL,
      RUNNING_LOG, MORPH_NOTES §3 (what the all-purpose dynamics layer would take from this), this plan; commit; push.
    - **His test:** reload → `Sequence` → three boxes → `all boxes → waves` → SPACE → flip the middle box to `mp` → SPACE →
      `re-wave` → SPACE → Insert → play the score.
  - **1d.8 — The edges, and a change rule per box** (each box ENTERED by attack or seamless; the sequence faded in from nothing and out
    to nothing; the end together or one by one) — **BUILT 2026-09-19 (session 10, RUNNING_LOG §131; SEQUENCE_TOOL §14; `sequence_check` 126), HIS TEST OUTSTANDING → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — *as built:* the generator's two change rules became ONE walk (every earlier check and the baseline gate passed untouched); `exit` one by one = a `landAt` of each player's own; niente = the note's `fade`, a dynamic = a ramp in its level. **One thing the text below said to put to him first was done WITHOUT asking, his to reverse:** a fade OUT was not expressible — `Morph.fadeWeight` could only arrive at 1 — so it took an opt-in `to` (absent = 1, the identity; two lines in `morph.js`). — written 2026-09-19 (session 10) at his word WITHOUT the planning protocol
    (*"no need for formal planning protocol"*); his brief COMPOSITION_NOTES LG-40 · LG-41, the reasoning RUNNING_LOG §122–§123.
    **Position: after 1d.7** (the fades reuse the drawn notes and the Hear ramp 1d.7 builds), **before his listen (1d.6).**
    *Why:* today how a sequence BEGINS is tied to how its chords CHANGE (`attack` = together, `seamless` = staggered), the rule is one
    for the whole sequence, and a sequence can neither come from nothing nor go to nothing. He asked for all three: *"start together,
    but then seamless within"* · *"one particular time container play together in unison … swap it to attack. But the seamless for the
    rest would continue"* · *"starting the sequence from nothing and then ending the sequence to nothing, a bit like we did with the morphs"*.
    *Result when done:* every box carries how it is ENTERED — `attack` (everyone lands a breath before its line and starts AT it,
    together) or `seamless` (each player takes it at their next breath). The head's `change` sets every box at once and any box can be
    flipped, as the waves' swap works. Box 1's tag IS the beginning — so "start together, then seamless" is box 1 flipped to `attack`.
    An `edges` group in the strip: `fade in [s]` · `fade out [s]` · `exit [together | one by one]`. A faded sequence comes from
    silence over its first seconds and goes to silence over its last, whatever lies under the fade — a straight dynamic or a wave;
    with `exit` one by one the players leave at the ends of breaths spread across the last stretch instead of landing together. With
    every box on the sequence's rule, no fades and `exit` together, the output is exactly what it was before this step.
    - The generator: a player's span begins where the player comes in — at a box tagged `attack` (entry together, the striation moved
      into the first breath's length, the player landing one gap before that line if it was playing) or after an absence or a rest
      (staggered, as today) — and runs to the next `attack` line, a drop-out or the end. All-`attack` and all-`seamless` fall out as
      today's two rules, and the random stream stays keyed by the span's first box, so the baseline gate holds. Recipe:
      `containers[i].change`, absent = the sequence's.
    - **The ending — two choices, four shapes (his words, LG-42, RUNNING_LOG §125):** `fade out` or just end × the players ending AT
      DIFFERENT TIMES (`exit: 'one by one'` — *"everyone finishing their last breath … the scene that I'm going to use often"*) or
      TOGETHER (today's landing). One by one: each player's chain is dealt to land on an end of its own, the ends spread over the last
      stretch before the line (the fade-out's length, or one breath's length when there is no fade) in the striation's order, the
      latest ON the line, never a runt — so the container keeps its length. *(How the ends are spread is the AI's call; his to reverse,
      and he can drag a note.)*
    - **The fade has a level at its far end (his word, §127: *"we can start end to different volumes yes?"*):** `fade in [s] from
      [niente | ppp … fff]` · `fade out [s] to [niente | ppp … fff]`. TWO mechanisms under one dial, because the law has nothing
      below ppp: **niente** = the fader multiplied to zero (`cc7Fade`, true silence) · **a written dynamic** = a ramp in the note's OWN
      LEVEL, through the calibrated law — the waves' machinery (1d.7's breakpoints): `level(t) = from + (what lies under it − from) · u`,
      u running 0 → 1 over the window, so it works over a straight box and over a waves box alike, and `from` may be LOUDER than the
      box (an entry that settles). `cc7Fade`'s own `from` field is a fader fraction, not a dynamic, and is not used for this.
    - **The fade follows the shape.** Ends together → ONE fade-out window for everyone, the last seconds before the line. Ends one by
      one → each player fades on THEIR OWN last seconds. The fade IN is the mirror, **asked for by him (§126: *"fade in can be together too from niente? also staggered from niente"*)** — from true NIENTE in both shapes, and it follows box 1's tag: `seamless`
      (staggered entries) → each player fades in on their own entry; `attack` → one window.
    - The fades are the morph's own field, `cc7Fade` — a one-way window in score seconds, CC7 multiplied 0 → 1 (in) or 1 → 0 (out) —
      stamped on every note that sounds inside a window, with `velRef` so the window is struck at one velocity; such a note is written
      DRAWN. The score's `heldCc7` applies the fade before the law, so it multiplies a straight level or a wave alike. Hear: the ramp
      1d.7 sends, computed with `heldCc7` and the note's fade. **Check first that a fade OUT is expressible with the field as the
      score reads it** (1a's transitions end on one) — if it is not, that is put to him before anything in the score's playback is
      touched (LG-32).
    - His doubt is on record and undiagnosed (MORPH_NOTES §3: *"not 100% sure that was working perfectly"*). The first faded sequence
      he hears is also the test of the morph's fade; anything wrong there is looked at in `heldCc7` / `fadeWeight`, once, for both tools.
    - The drawer: `enter [attack | seamless]` on the box's line · a mark on a box that differs from the sequence's rule · the head's
      `change` becomes "set every box" and asks before it overwrites flipped boxes · the `edges` dials. The recipe keeps
      `edges { fadeIn, fadeOut, exit }`.
    - `sequence_check.js` gains: the gate · a lone `attack` box inside a seamless row — everyone starts AT its line, lands a gap
      before it, and the NEXT line is crossed seamlessly · box 1 `attack` + the rest seamless = together at the start, no line cut
      after · `exit` one by one: the last ends spread, none a runt, none past the end · notes inside a fade window carry the fade
      and the rest do not · the same seed repeats.
    - **The join with a morph or another sequence is NOT a tool** (his word, LG-42, §125: *"doesn't need to be overthought"*). He
      inserts the morph and moves its first notes by hand so that it starts on each player's next breath; the ending's four shapes are
      what he joins TO. §124's hand-over item is not written. The morph's revision gets the same endings (MORPH_NOTES §3).
    - Verify in the running app, no MIDI: three boxes seamless, the middle flipped to `attack`; box 1 flipped; a 6 s fade in and out
      over a straight box and over a waves box (the inserted notes' fields; Hear's ramp); `exit` one by one; a reopened sequence keeps
      all of it. SEQUENCE_TOOL, RUNNING_LOG, MORPH_NOTES §3, this plan; commit; push.
    - **His test:** reload → `Sequence` → three boxes, `seamless` → box 1 `enter attack` → SPACE → box 2 `enter attack` → SPACE →
      `fade in` '6', `fade out` '6' → SPACE → `exit` one by one → SPACE → Insert → play the score.
  - **1d.6 — His listen** (a sequence of the six chords; the item closes on his verdict) — `todo`.
    *Result when done:* he has heard, on his Chrome, a sequence built one box at a time and one rolled, under `attack` and under
    `seamless`, with the default breaths and with `together` and a pool of lengths changed, with the waves on and one box stepped out to a straight dynamic (1d.7), and has reopened one and changed it. His
    verdict closes 1d; whatever he wants changed becomes ordinary chunks under this item, and the held features below are his to call.
    - Every listen and every Insert is his Chrome — the in-app browser has no Web MIDI; the AI verifies the note lists, never the sound.
    - The six reference chords want six takes in the strikes drawer first (his, by the drawer: HARMONIC SERIES or a harmony →
      `ordinario` → shuffle → `save take`).
  - **Held as features, at his word (LG-36: *"let's save these as features for now"*), not built:** a drawn curve attached to the
    whole sequence (the trills' pattern — a META curve A · B · C read live over the span) · a dynamic per player per container · a
    curve per player. *(The waves of 1d.7 are NOT in lieu of the curve — his own correction, LG-38: "that might be an added feature
    later".)*
  - **1d.9 — The breath's lengths: `of max` and `outlier`** (each player's breath built round THEIR OWN maximum; one breath in ten far
    from the rest) — **BUILT 2026-09-20 with 1d.14 — RUNNING_LOG §154, SEQUENCE_TOOL §19; his test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — **PLANNED 2026-09-20 at his word** (*"lets write this in to a plan, no need for the planning protocol"*);
    his brief COMPOSITION_NOTES LG-43 · LG-46, the reasoning RUNNING_LOG §133–§135.
    *Why:* today every player aims at the ONE `length` and the ceilings table only CAPS. At 8 s ± 0.35 the english horn, with 18 s of
    air, breathes as often as the trumpet; the table touches only the vibraphone (about half its breaths) and the double bass. And
    every breath falls in one range — turning `±` up to get a surprise makes EVERY breath erratic (his `8 ± 1`: 8 RUNT · 5 CEILING).
    *Result when done:* two groups on the `breath` line. **`of max`** — a breath aims at that share of the PLAYER's own maximum, so
    long-breathed players breathe long: at 0.65 the english horn and bassoon aim at about 12 s, horn and cello 10, trumpet 8, double
    bass 6.5, vibraphone 5 — the jitter still on top. **`outlier`** — one breath in ten is far from the rest: significantly SHORTER
    (never under a floor) or LONGER (up to the player's maximum), on a coin toss. With both blank the output is exactly what it was
    before this step.
    - **`of max [share]`** — breath = ceiling × `of max` × (1 + `±` × r). The ceiling is the one the generator already reads for every
      note: the player's, at the LOUDEST level the note reaches (so a quiet player aims longer than a loud one — the table's 1.18 · 1 ·
      0.82). ONE number for the ensemble. With a number in it, `length` is greyed: it then only spaces the first entries, as it does
      under a pool. Recipe: `breath.ofMax`, absent or null = today.
    - **`outlier [how often] · short [×] · floor [s]`** — his words (LG-46): *"one in 10 is fine. One in 10 will be significantly
      shorter. And then, or longer, up to max. And also, the shorter one should have a floor too."*
      - **How often:** the share of breaths that are outliers — `0.1`. Each is a coin toss, SHORT or LONG.
      - **SHORT:** the player's own normal aim × `short` (`0.4`), never under `floor` (`2` s). The floor may not be typed under 1.5 s,
        so an outlier is never a RUNT.
      - **LONG:** drawn evenly between the TOP of the player's normal range (aim × (1 + `±`)) and the player's maximum. No number to
        type — *"up to max"* is the rule. It is NOT flagged `CEILING`: it was meant. **With under 1 s of room between the two** (the
        vibraphone at `length` 8) **the toss goes SHORT** — that player's outliers are all short ones.
      - **Rejected — one "how far" factor used both ways** (× 0.4 and × 2.5): a long one would nearly always pass the maximum and be
        capped AT it, so every long outlier of a player would be the same length. Drawn up to the maximum they differ.
      - The status counts them: `… 6 OUTLIER (3 short · 3 long)`. Recipe: `breath.outlier { share, short, floor }`, absent = none.
    - **What stands outside both:** a POOL (`lengths`) is his own list, played as written — it overrides `of max` and takes no
      outliers · the LANDING breath still takes what is left · `together` / `apart` still move a start afterwards, by the rules of
      1d.5 (never under half of itself, nor under 1.5 s).
    - **The outlier has a random stream of its own**, as `together` has: turning it re-deals no other breath's length (their places
      move, as they must when one breath among them changes).
    - **THE GATE.** Both are null in the generator's `DEFAULT_BREATH`, so every dial at its default still gives the notes frozen in
      `tools/sequence_baseline.json`. The DRAWER's defaults for a NEW sequence (`NEW_BREATH` in `sequence_ui.js`, where `together 0.2 ·
      apart 0.6` already live — RUNNING_LOG §133–§134): `outlier 0.1 · short 0.4 · floor 2` (his *"one in 10 is fine"*). **`of max`
      on a new sequence — on at 0.65, or blank: PUT TO HIM, not answered.** **→ ANSWERED 2026-09-20 (RUNNING_LOG §149): ON, at 0.65.**
    - **Verification.** `sequence_check` gains: both blank = the baseline · under `of max` every player's mean breath sits at their
      ceiling × the share (within the jitter) and none passes the ceiling · the outliers' share over a long deal is the dial's · no
      short one under the floor · every long one above the normal top and at or under the ceiling · a player with no room gets short
      ones only · a pool overrides both · the recipe round trip. In the running app, no MIDI: the line paints and greys, the status
      counts, a reopened sequence breathes as it was dealt.
    - **His test:** reload → `Sequence` → `new` → three boxes → `breath` → `of max` 0.65 → SPACE (the winds hold longer than the bass
      and the vibes) → `outlier` 0.1 → SPACE (now and then one very short or very long breath) → `re-breathe` → SPACE.
    - **Not in this step unless he says:** `±` in seconds (item 5 below — the same formula; under `of max`, is `±` still one number
      of seconds for every player?) · an `of max` per player.
  - **ON DECK, DEFERRED (his call 2026-09-20, RUNNING_LOG §141): THE VOLUME FIX comes first, as a plan of its own; this list waits, whole.**
  - **→ THE LIST BELOW IS NOW PLANNED (2026-09-20) — see "THE FEATURE ADD", after it: 1d.10 … 1d.15, with 1d.9. The list is kept
    as the record of how the asks arrived. Where it and the plan differ — item 8's water line and `up` / `down`, reversed by
    LG-50 — THE PLAN WINS.**
  - **THE NEXT FEATURE ADD — a list being COLLECTED at his word (LG-44, 2026-09-20: *"let's just collect these features and the next
    build our feature add will slot these in. Just make a list for now."*). Not built, not yet planned — each goes through the
    planning method when he calls the build:**
    1. **A CLOCK during playback** in the sequence drawer (LG-44).
    2. **CLICK TO PLACE THE CURSOR anywhere in the sequence and play from there** (LG-44). *Today Hear starts `from the start` or
       `from the box` — a box's left edge; this is any point inside a box.*
    3. **→ PLANNED as 1d.9, above.** **`of max` — each player's breath built round THEIR OWN maximum** (LG-43): breath = the player's ceiling × `of max` × (1 + ± × r).
       Blank = today's notes. *The AI's proposal, put to him, not yet answered: one number for the ensemble, or one per player?*
    4. **→ PLANNED as 1d.9, above.** **`outlier` — an occasional breath far from the rest** (LG-43): how often · how far. Blank = today's notes. *The AI's proposal,
       put to him, not yet answered: short only, long only, or either? (A long outlier can never pass the ceiling.)*
    5. **`±` IN SECONDS, not a share** (LG-45): `8 ± 2` = 6 … 10 s. *Today it is the morph's `segVar`, a share of the length — `± 1` deals
       0 … 16 s (his re-breathe: 8 RUNT · 5 CEILING). To settle when planned: the recipe keeps a share today (the 1d gate reads it);
       and under `of max`, is `±` still one number of seconds for every player?*
    6. **A SEQUENCE LIBRARY** (LG-47): keep a sequence WITHOUT placing it in the score — *"probably something like the takes in the strikes
       drawer, where I give it a name. And then it just auto saves to that name. But also can auto save generically if I haven't named
       it yet."* *Today the row lives in the browser only, ONE at a time, and `new` wipes a row that was never inserted.* **HIS INSTRUCTION
       FOR THE PLANNING: explain how this would LOOK first, and talk it through with him, before it is planned.**
       **→ TALKED THROUGH AND SETTLED 2026-09-20 (RUNNING_LOG §145):** the takes' store (`bank/panel_snapshots.json`, a panel of its own) · an untitled rolling stack of 50 · naming MOVES it and it autosaves to the name · `save` marks a keeper, `revert` returns to it, two states per name and never more. Not yet planned.
    7. **SELECT A RANGE OF BOXES** (LG-48): *"if I have 30 boxes I can select 15-30 and make waves"*. *Today it is one box or ALL boxes.
       To settle when planned: click + SHIFT-click for the range; the range takes `waves | straight` — and `dyn` and `enter` too?*
    8. **THE WAVES BY PRESET** (LG-49) — UNDER DISCUSSION, the AI's recommendations put to him: swell lengths automated (no typed
       seconds) with a tilt and a jitter · the shape by preset, his default a golden-section rise against fall, with a HOLD at the top ·
       between swells a player rests at THE BOX'S OWN DYNAMIC, not at `low` — so a box has a dynamic AND waves · presets for the whole
       line, and a default.
    9. **→ MOVED INTO PLAN 1e (V2b), built there.** **THE WAVES FIX — HEAR ON THE CURVE CHANNELS** (RUNNING_LOG §137; his call 2026-09-20: *"waves fix to feature build"*). A BUG, not a
       feature: Hear sends every ramped note and its CC7 on MAIN ch 1, where his rack takes no moving controller (D11), so by SPACE the
       waves, the fades and the ramps of 1d.7 / 1d.8 are inaudible. In `sequence_ui.js` alone: a ramped note is heard on a curve route
       (`Composer.curveChannelsOf` / `curveRoute`, round robin per player, the ramp on the same route), `D.routeFor` wrapped from
       outside; `strike_drawer.js` untouched. **BUILD IT FIRST — nothing else about dynamics can be judged by ear until it is in.**


  - **THE FEATURE ADD — PLANNED AND APPROVED 2026-09-20** (his word: *"the sequence plan is good, approved. So go ahead and write
    that"*). The design talk is RUNNING_LOG §145–§148; his briefs are COMPOSITION_NOTES LG-43 … LG-51. He asked for the whole plan
    in one conceptual summary and approved it whole, so the sub-steps below are the AI's, written to be executed cold; **anything
    marked PUT TO HIM is asked when its step is reached, not before.** *(The two that were — `of max` on a new sequence · `±` under
    `of max` — were answered the same day, §149. None is left.)*
    **RUNNING ORDER (position = order of building, the ids are only the next free ones):**
    ~~**1d.10** the dynamics table~~ → ~~**1d.11** the library~~ → ~~**1d.12** select a range~~ → ~~**1d.13** the waves by preset~~ — **ALL BUILT 2026-09-20** →
    ~~**1d.9 + 1d.14** the breath's lengths~~ → ~~**1d.15** the clock and the cursor~~ — **BUILT TOO** → **► 1d.6** his listen, and his test of every step above.
    *Why this order:* the table first, because every listen after it is judged through it · the library second, so nothing he makes
    while testing the rest is lost · the selection before the presets, because the per-selection range rides on it.
    **Each step ends on HIS test in his Chrome** (the in-app browser has no Web MIDI); the AI verifies note lists, objects and
    routes in `score-5401`, never the sound, and never saves from its own pane.
  - **1d.10 — THE DYNAMICS TABLE** (each WRITTEN dynamic has a CC7 value of its own, read by every shaped note the drawer writes) —
    **BUILT 2026-09-20 — RUNNING_LOG §150; his rack test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — **AMENDS PLAN 1e's Rule 2** (*"the top of the shape is the full fader"*); Rule 1 (the mf strike), the curve channels
    and `curveDirty()` all stand. RUNNING_LOG §146–§148 · LG-50 · LG-51.
    *Why:* under 1e only a shape's DEPTH is heard — `pp–mf` and `ppp–mp` are both three steps deep and both play about CC7 73 → 127,
    so the range he now sets per selection of boxes (1d.12) would be inaudible. And his principle (LG-51): a STATED range is what
    sounds, for the whole curve — *"a curve going from MP to FF should go … say 65 to 111 in CC7, not up to the full 127."*
    *Result when done:* one function for the whole composer — the CC7 value of a written dynamic on a given instrument — and every
    shaped note the SEQUENCE drawer writes (a wave · a ramp to or from a dynamic · an edge's fade to or from a dynamic) reads it, in
    Hear as in the score. A wave `ppp–mp` sits audibly below a wave `pp–mf`.
    - **THE LAW.** `fff` = CC7 127. Each written step below it is **`STEP_DB` = 4 dB**, taken through the instrument's MEASURED fader
      curve: `VelocityRemap.cc7ForDelta(bank.instruments[instKey].cc7Curve, -(7 - level) * STEP_DB)` — `level` 0 … 7 = `ppp` … `fff`,
      fractions allowed. **ONE constant**, so his ear retunes the whole table by changing one number. *Why 4:* 1e as built gives
      three steps ≈ 9.6 dB on a UVI instrument and 14.4 dB on a Kontakt one (inferred from the two laws, not measured) — about 4 dB a
      step — so the depth he has is kept, but is now THE SAME in dB on every instrument; and it lands his own guess — `mp → ff` is CC7 69 → 109 on a Kontakt
      instrument. `ppp` is 28 dB under the ceiling: a SOUNDING level. True silence stays the edges' niente — `cc7Fade` multiplies in
      on top, unchanged.
    - **WHERE.** A small shared module, **`score/public/dyn_table.js`** (UMD, as `velocity_remap.js` is, so a node check can load it)
      — NOT inside `sequence_ui.js`: `1f` (the crescendo tool) and the morph's revision read the same table. No bank loaded → the
      UVI law, 127 × 10^(−dB / 40), and the status SAYS SO.
    - **CHECK FIRST:** every instrument's `cc7Curve` in `bank/velocity_remap.json` reaches −28 dB. `cc7ForDelta` CLAMPS at the curve's
      first point; if one stops short, extend it in the BUILDER (`tools/build_remap_card.js`, by the family's law — UVI 40·log10 ·
      Kontakt 60·log10), never in the app. The rest of the bank stays byte-identical.
    - **IN `sequence_ui.js`.** `rebased(n, top)` and the constant `CC7_FULL` are replaced. For each shaped note: `lo` / `hi` = the
      lowest and highest LEVEL among its breakpoints · `cc7Abs = { lo: T(lo), hi: T(hi) }` · every breakpoint's height
      `h = (T(level) − T(lo)) / (T(hi) − T(lo))`, so EVERY breakpoint lands exactly on its table value, not only the two ends · a
      shaped note that is flat (`lo` = `hi`): `cc7Abs { T, T }`, h = 1. Nodes at `y = 10 · h` as now. The Hear stand-in already
      copies the note's `cc7Abs` (~969), so Hear and the score stay one law. A note that crosses from a box with one range into a
      box with another is still ONE note with ONE `cc7Abs` — the breakpoints carry the levels, nothing special is needed.
      `velAbs` = the mf strike, per pitch, untouched.
    - **`sequence.js` is not touched** if the levels already travel in written-dynamic units — CHECK; `sequence_check` stays **126**
      and the gate against `tools/sequence_baseline.json` holds.
    - **NOT touched:** the drawn swell (CC7 65 → 127, a gesture with no names) · the note card's `full fader` (0 → 127, by hand) ·
      trills · strikes · plain notes · `composer.html`. **The crescendo tool is `1f`.**
    - **`docs/DYNAMICS_LAW.md` §3 Rule 2 is REWRITTEN and the banner at its head removed; `docs/SEQUENCE_TOOL.md` §13 · §14 follow.**
    - **Verification.** A new `tools/dyn_table_check.js`: monotone per instrument · `fff` = 127 · equal dB steps on the measured
      curve, within rounding · `mp → ff` on a Kontakt instrument ≈ 69 → 109. `sequence_check` gains: two ranges of EQUAL depth give
      DIFFERENT `cc7Abs` · every breakpoint lands on its table value. In the running app, no MIDI: capture what Hear sends for
      `pp–mf` against `ppp–mp`.
    - **His test — the 1e way:** a waved sequence with two ranges, recorded as MIDI in the rack →
      `node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua` → two different CC7 spans, neither topping at 127 unless
      its `high` is `fff` · MAIN ch 1 empty · every strike an mf velocity.
    - **KNOWN, AND SAID TO HIM:** a shaped note now sits QUIETER than a struck note of the same name — a shaped `mf` is 12 dB under a
      struck `mf`, because the ceiling (mf strike, CC7 127) IS a struck mf and the table counts down from `fff` — and more so toward
      the quiet end. That is his model (*"not up to the full 127"*) and DYNAMICS_LAW already accepts that a waved box and a straight
      box do not share a calibrated level. `STEP_DB` is the one number that tunes it; his ear decides at the listen.
    - **AS BUILT, 2026-09-20 (RUNNING_LOG §150) — three things the plan did not know.** (a) **The CHECK FIRST found three curves
      short:** the vibraphone, the cello and the double bass were BELOW THE NOISE FLOOR at CC7 24 in 0d (`null` in
      `bank/balance.json`), so their measurements stopped at CC7 44 ≈ −27.5 dB and `ppp` would have clamped there. Extended in the
      BUILDER as the plan directs, by each instrument's OWN law fitted through its measured points — which came out at the two
      family laws to the digit (UVI **38.7**, residuals ±0.02 dB · Kontakt **59.8 … 60.1**) — down to CC7 24, the point marked
      `n: 0` with its fitted `law` so it can never be read as a measurement. The rest of the bank is unchanged.
      (b) **The two new assertions live in `tools/dyn_table_check.js`, not in `sequence_check`:** they are properties of the TABLE
      and of `sequence_ui.js`, which is a DOM module node cannot load. `sequence_check` stays **126**, `sequence.js` untouched as
      planned; `dyn_table_check` is **51**. The end-to-end proof — `ppp–mp` 43…69 against `pp–mf` 51…81 on the cello, and every
      breakpoint of a three-dynamic shape on its own table value — was taken in the RUNNING APP, from `SequenceDrawer.shape()`
      with the real bank loaded. (c) **The status lines now state the claim:** Hear and Insert say the fader span they actually
      sent, and name any instrument with no measured curve (the percussion lane has none and never shapes a note — a strike is
      `fixed` — so it is not reported as a fault).
  - **1d.11 — THE LIBRARY** (a sequence is a DOCUMENT: it has a name, it autosaves, many coexist, and they ride in the repo) — **BUILT 2026-09-20 — RUNNING_LOG §151, SEQUENCE_TOOL §16; his test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** —
    LG-47 · RUNNING_LOG §145 · §146.
    *Why:* today the row lives in `localStorage`, ONE key — it survives a refresh, a server restart and a computer restart, but
    there is only ONE, `new` wipes a row that was never inserted, and git cannot see it.
    *Result when done:* an unnamed sequence is always on disk in a rolling stack · a named one autosaves to its name · `save` marks a
    keeper and `revert` returns to it · a `library` menu opens, duplicates and deletes · all of it in one tracked file, committed at
    the wrap.
    - **THE STORE: `bank/sequences.json`, a file of its own** — NOT a panel in `bank/panel_snapshots.json` (3.1 MB, 216 takes,
      rewritten WHOLE on every save; an autosave every few seconds must not touch it). The `/api/snapshots` route takes a `store`
      field checked against a WHITELIST of two names — never a path from the client. `score/snapshots.js`'s merge rules are reused
      unchanged; `tools/test_snapshots.js` gains the second store. This store is written **temp file + rename**, because it is
      written often.
    - **Its panels:** `library` (named) · `untitled` (the stack) · `wavePresets` (1d.13). An entry's `state` = the recipe, the dials
      and **`kept`** — the state at his last `save`, or null.
    - **Autosave:** `localStorage` on every change, as today (instant; the window's geometry stays there, it is the browser's) ·
      the DISK about 2 s after the last change, and on `pagehide`.
    - **Unnamed:** a row takes a timestamp name at its first change (`untitled 2026-09-20 14.32.05` — sortable, and inside the
      store's name rule, which refuses a colon). The stack keeps the newest **50** (his: *"make the auto save number large these are
      small files"*; the number is the AI's, his to change), the oldest dropped at save. **`new` starts a fresh untitled — the old
      one is already on disk, so `new` destroys nothing.**
    - **Name + ENTER** (the takes' way): it MOVES — saved under the name, the untitled entry deleted. A name that exists asks
      before it replaces. Rename is the same move, from a named one.
    - **`save`** → `kept` = the current state · **`revert`** → the current state = `kept`, asked once · a **`•`** beside the name
      when they differ (the RECIPE compared, not the panel's open lines). **Two states per name and never more — no versions**
      (his: *"without creating a cascade of new versions"*). A variant is a second name: `duplicate`.
    - **The `library` menu:** named first, by name; then untitled, newest first. Pick → it loads; no prompt, because the row being
      left is already safe on disk. `duplicate` asks for a name · `×` asks, then deletes.
    - **SEPARATE FROM THE SCORE.** Insert still copies the recipe into the score file's `databases.sequences`; `sequences in this
      score` (1d.3) is untouched. A placed sequence opened from the score is a row like any other — untitled until he names it.
    - **Migration:** the one row in `localStorage` today becomes the first untitled at first load.
    - **Verification.** `test_snapshots` on the second store. In the running app: the autosave lands on disk after 2 s and survives
      a reload AND a server restart · the stack caps at 50 · naming moves · `save` / `revert` / `•` · `duplicate` · `×` ·
      `bank/panel_snapshots.json` byte-identical throughout.
    - **His test:** reload → `Sequence` → three boxes → wait → reload (still there) → restart the server → reload (still there) →
      `new` → `library` (the first is in the list) → open it → name it, ENTER → change a dial → `save` → change another (`•`) →
      `revert` → `duplicate` → `×` on the copy.
  - **1d.12 — SELECT A RANGE OF BOXES** (click, SHIFT+click; the selection takes waves · `dyn` · `enter` · and a range of its own) —
    **BUILT 2026-09-20 — RUNNING_LOG §152, SEQUENCE_TOOL §17; his test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — LG-48 · LG-50 · RUNNING_LOG §146.
    - **AS BUILT — two things the plan asked to be CHECKED, and both needed the answer written down.** (a) *"CHECK how 1d.7
      carries the stream (it wants to be a 0 … 1 swell height that is mapped late)"* — it did NOT: 1d.7 wrote written LEVELS into
      the stream. It is a height now, mapped per box at the end, so the deal, the seeds and the swells are untouched by any
      range. (b) **A box that does not READ the waves has no opinion about their range and carries the last one forward** — it
      was the only way to make "a range on a straight box is kept and ignored" true, and it also keeps a breath that crosses a
      straight box still reading the waves in the range it began in. **And one consequence to know:** lowering a range's `high`
      may LENGTHEN a breath, because the ceiling is read at the loudest level a note reaches. With the `high` unchanged not one
      onset or length moves — which is what `sequence_check` asserts. `sequence_check` **126 → 139**.
    *Why:* between ONE box and ALL boxes there is nothing, and a rolled row can be thirty boxes long; and he wants part of a
    sequence to read the SAME waves through a DIFFERENT range.
    *Result when done:* click box 15, SHIFT+click box 30, and whatever the head sets goes on all sixteen.
    - Click = one box, as today · SHIFT+click = from the selected box to this one · the selection painted · ESC or a plain click
      returns to one. `all boxes →` stays: it is select-all and apply.
    - **The selection takes all three (his: *"d all 3"*):** `waves | straight` · `dyn` · `enter [attack | seamless]` — **and
      `range [low] [high]`, its own waves range.** Take and seconds stay per box.
    - **Recipe:** a box may carry `range { low, high }`; absent = the sequence's. `sequence range` clears it on the selection. A
      box with a range of its own shows it as a small tag (`ppp–mp`).
    - **The generator:** the dealt waves and their timing are UNTOUCHED — a box only changes the `low`–`high` its stretch of each
      player's stream is read through (CHECK how 1d.7 carries the stream; it wants to be a 0 … 1 swell height that is mapped late).
      **Where two ranges meet, the level GLIDES across the boundary over 0.5 s — never a step.**
    - **THE GATE:** no box carries a range → the notes frozen in `tools/sequence_baseline.json`.
    - **Verification.** `sequence_check` gains: a box range changes levels and no onset or length · the boundary is a glide · the
      recipe round trip · a range on a `straight` box is kept and ignored. In the running app: the selection paints, each of the
      four controls lands on every selected box and on no other.
    - **His test:** roll twelve boxes → click 5, SHIFT+click 9 → `waves` → `range ppp mp` → SPACE → `dyn p` on 1–4 → `enter
      seamless` on 5–9 → SPACE.
  - **1d.13 — THE WAVES BY PRESET** (one menu fills every dial; `breathing` is the default; `save preset` keeps his own) — **BUILT 2026-09-20 — RUNNING_LOG §153, SEQUENCE_TOOL §18; his test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** —
    LG-49 · RUNNING_LOG §138, **as amended by LG-50 (§146).**
    *Why:* he does not want to type seconds, weights or a peak — *"a sort of presets situation … a way to easily generate a
    behavior"* — and *"probably need to refine all presets while composing"*, so a preset must be cheap to change and keep.
    *Result when done:* pick `breathing` and the whole `waves` line is set; turn any dial; `save preset` keeps it under a name.
    - **THE SWELL (LG-50 — this REVERSES §138's water line, and `up` / `down` with it):** rest at `low` → rise to `high` → HOLD →
      fall to `low` → rest at `low`. The range is the sequence's fixed `low`–`high` (a box's own under 1d.12). A box is waves OR
      straight, as today.
    - **The dials a preset fills:** swell lengths as `shortest` · `longest`, each swell drawn anywhere between, with a **`tilt`**
      slider short ↔ long (no typed pool, no weights) · the SHAPE by name — **`golden`** (the rise 0.618 of the moving time, the
      fall 0.382; his default) · `reverse golden` · `even` · `surge` · `bloom` · **`hold`** at the top as a share of the swell
      (0.2: a 10 s swell sits 2 s) · DENSITY as words — `constant` 1 · `busy` 0.8 · `breathing` 0.6 · `occasional` 0.35 · `rare`
      0.15 · the range, `pp–mf` by default (three steps, §138's depth).
    - **The five:** **`breathing`** (default) · `tides` · `ripples` · `surges` · `blooms`. Their dial values are the AI's and
      PROVISIONAL — starting points, written into `docs/SEQUENCE_TOOL.md` when built: `breathing` 8–20 s · golden · hold 0.2 ·
      breathing · `tides` 20–45 s · even · hold 0.1 · constant · `ripples` 3–8 s · even · no hold · busy · `surges` 6–14 s · surge
      · hold 0.1 · occasional · `blooms` 12–30 s · bloom · hold 0.35 · rare.
    - **`save preset`** (approved, §145): a name + ENTER stores the whole `waves` line in `bank/sequences.json`, panel `wavePresets`
      — so 1d.11 comes first. His presets list with the five; one saved under a BUILT-IN's name overrides it, so he can refine
      `breathing` itself; `×` on his own brings the built-in back.
    - **The generator** gains the hold and the named shapes (CHECK 1d.7's swell: it has a `peak` position and no hold). **Old
      recipes — a typed pool, weights, `peak` — still load and still give their notes: THE GATE.**
    - **Verification.** `sequence_check` gains: every swell's length inside `shortest` … `longest` · the tilt moves the mean · the
      golden rise is 0.618 of the moving time · the hold's share · the density's share over a long deal · a preset fills every dial
      · an old recipe is unchanged. In the running app: the menu sets the line, `save preset` lands in the store and returns after
      a reload.
    - **His test:** `waves` → `breathing` → SPACE → `tides` → SPACE → turn `hold` up → `save preset` 'mine' → reload → 'mine' is in
      the menu.
  - **1d.14 — THE BREATH'S `±` IN SECONDS** (`8 ± 2` means 6 … 10 s) — **BUILT 2026-09-20 with 1d.9 — RUNNING_LOG §154, SEQUENCE_TOOL §19; his test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — LG-45. **Built WITH 1d.9** (`of max` · `outlier`,
    planned in full above), in one go.
    *Why:* `±` is the morph's `segVar`, a SHARE of the length — `± 1` reads as one second and deals 0 … 16 s (his re-breathe: 8
    RUNT · 5 CEILING).
    *Result when done:* the number beside `±` is seconds, and a musician reads it right.
    - The recipe KEEPS the share for every recipe that has one (the gate reads it); a new field in seconds wins where it is present.
      The drawer writes seconds from now on and shows an old recipe's share converted.
    - **ANSWERED 2026-09-20 (RUNNING_LOG §149; his: *"1 a, 2 a"*):** under `of max` the `±` is still **ONE number of seconds for
      everyone** (at `± 2`: english horn 10 … 14 s · vibraphone 3 … 7 s) — NOT a share of each player's own aim. It reads the way he
      reads it; the floor (1.5 s) and each player's ceiling already protect the short-breathed. Accepted with it: the same seconds
      are a bigger wobble for the vibraphone than for the english horn. · **`of max` is ON, at 0.65, on a NEW sequence.**
    - **THE DEFAULT, AND A DEFAULT OF HIS OWN** (his: *"lets have a preset/default for this like everything else If I establish that
      earlier, then we'll go with that. Otherwise, something like one point two seconds or one point three seconds"*). The record
      holds no seconds value of his — only the morph's share, 0.35, and his example `8 ± 2` — so the built-in is **`± 1.3` s**
      (the AI's pick inside his range). A NEW sequence's `breath` line is then: `of max 0.65 · ± 1.3 s · outlier 0.1 · short 0.4 ·
      floor 2 · together 0.2 · apart 0.6` (`NEW_BREATH` in `sequence_ui.js`). **`save as default`** on the `breath` line keeps HIS
      line in `bank/sequences.json` (panel `defaults`, so 1d.11 comes first); a new sequence takes his if there is one, else the
      built-in. *The AI's reading of "if I establish that earlier" — a default he can set himself; his to correct.* The generator's
      own `DEFAULT_BREATH` does NOT change — it is what THE GATE reads.
    - **Verification.** `sequence_check`: `8 ± 2` deals only 6 … 10 s · an old recipe is unchanged · the round trip.
  - **1d.15 — THE CLOCK AND THE CURSOR** (a clock while it plays · click anywhere in the row and play from there) — **BUILT 2026-09-20 — RUNNING_LOG §155, SEQUENCE_TOOL §20; his test outstanding → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162)** — LG-44.
    - **AS BUILT:** the CHECK the item asked for is answered — `from the box` DID already enter mid-note (`w.skipS`), so the
      cursor is that same path at any second, and no new machinery was needed for it. The strip is a bar of its own above the
      boxes; the times are read off the boxes' own layout, so the cursor and the playing line agree by construction.
    *Why:* Hear starts `from the start` or `from the box` — a box's left edge — and a rolled row can run for minutes.
    *Result when done:* a running clock in the drawer's head, and a cursor he can put at any second of the sequence.
    - **The clock:** elapsed / total, `m:ss.s`, while Hear plays; it stops where Hear stops.
    - **The cursor:** a click in the row's time strip sets it — a thin line, the box and the seconds into it shown. SPACE plays
      from the cursor. `from the start` and `from the box` remain.
    - **Entering mid-note:** a note already sounding at the cursor starts AT the cursor with what is left of it, its fader at the
      curve's value there. Hear's ramp already takes a skip (`w.skipS`, `sequence_ui.js` ~974) — CHECK that `from the box` enters
      mid-note today; the cursor is the same path at any second.
    - Insert is untouched — the cursor is for the ear, not for the score.
    - **Verification**, no MIDI: the notes and the first CC7 value Hear sends from a cursor inside a box, against the same notes
      from the start.
    - **His test:** a four-box sequence → click inside box 3 → SPACE (it enters there, the clock reading that second) → click
      earlier → SPACE.


- **1e — THE VOLUME FIX** (a shape in volume is THE NORMALIZED FADER, 0 → 1, on the curve channels, struck at mf) — **`done` 2026-09-20,
  session 11 (RUNNING_LOG §143) — V1 · V2 · V3 · V4 · V7 BUILT, V5 method-only by the plan, V6 checked in the app; HIS RACK TEST
  PASSED (RUNNING_LOG §144).** `sequence_check` still **126**. The law now has a page of its own: **`docs/DYNAMICS_LAW.md`**, named in CLAUDE.md as
  the first read for any sound-path work. *Read on for how it works — the item below is the built design, not a proposal.*
  **PLANNED 2026-09-20 at his word, built in ONE go** (RUNNING_LOG §137–§142). **It came BEFORE the sequence feature add, which
  is on deck.** Written to be executed cold.
  *Why:* his recording read back (§140) — every waved note struck at the velocity of its TOP (127) with the fader moving only inside
  the 12 dB ladder (CC7 63 … 127): *"between two high dynamic levels"*. His diagnosis (§141): in the tuba piece and the septet a
  crescendo ran the fader from ZERO to max. **The machinery for that is ALREADY IN THE SCORE, per note, built in piece #5 for this very
  reason (its §316 · §346 · §349): `wc.cc7Abs { lo, hi }` — `heldCc7` maps the drawn height 0 … 1 straight onto that CC7 range,
  bypassing the ladder — and `wc.velAbs` — the playback strikes the note at exactly that velocity (`composer.html` ~11277,
  `sonify_core.js` ~238). NOTHING IN `composer.html` CHANGES. The fix is what the TOOLS WRITE on their notes.**
  *Result when done:* every SHAPED note a tool writes — waved, ramped to or from a dynamic, swelled — carries `cc7Abs { lo: 0, hi: 127 }`
  and `velAbs` = its instrument's MF velocity, sounds on a curve channel in Hear as in the score, and its shape's TOP sits at the full
  fader. Flat notes, plain notes, strikes, long tones, trills, the crescendo tool and niente fades are untouched.
  - **THE TWO RULES (his decisions, §141–§142).**
    - **mf for ALL instruments:** `velAbs = VelocityRemap.heldNote(Composer._velRemap, instKey, midi, 100).vel` — anchor 100 is mf on
      the ladder (65 … 127, eight names evenly). From the bank: EH ≈ 96 · Bsn 98 · Hn 81 · Tpt 70 · Vib 99 · Vc 95 · Db 87 (averages
      over pitch). No remap loaded → 100. The cost, accepted: a shape tops out at mf loudness, 4–5 dB under a struck fff, the same
      for every instrument (3.9 … 5.4 dB), so the balance holds.
    - **the top of the shape is the full fader:** a shaped note's drawn height becomes `h' = 1 − (top − level)`, floored at 0, where
      `level` is 0 … 1 on the ladder and `top` is what `topOf(n, hiLevel)` gives today (the waves' `high` for a waved note — ONE top
      for all its breaths, so they join — else the note's own loudest). So each dynamic step under the top is one seventh of the
      fader, and ppp under an fff top is CC7 0. Nodes are written at `y = 10 · h'` (never under 0.05, as `yOf` does).
  - **V1 · `sequence_ui.js` — INSERT.** For a `ramped` note (the flag that exists: waves · fade · ramp, `kind !== 'fixed'`): nodes from
    `h'`; add `cc7Abs: { lo: 0, hi: 127 }` and `velAbs` (rule 1); keep `velRef` (the hybrid ignores it once `velAbs` is there, and a
    note that loses `cc7Abs` by hand falls back sanely). A niente `cc7Fade` stays — `heldCc7` multiplies it in, before `cc7Abs` is
    read. A straight, un-ramped note is written exactly as today.
  - **V2 · `sequence_ui.js` — HEAR.** (a) the stand-in `wc` in `rampPoints` carries the same `cc7Abs`, and the levels it is asked
    for are `h'`; the note handed to `D.playNotes` is struck at the mf velocity. `D.playNotes` remaps `n.vel` through `remapVel`, so
    hand it the ANCHOR 100 for a ramped note, not an instrument velocity. (b) **THE ROUTE — this is feature-list item 9, moved here:**
    a ramped note and its ramp go to a CURVE route. Wrap `D.routeFor` from outside (as `D.play` is wrapped; `strike_drawer.js`
    untouched): a ramped note is given a marker seat (`'c0'`, `'c1'`, … — `playNotes` keys its route cache on `n.seat`, so a marked
    note gets a route of its own); the wrapper resolves a marker to `Composer.curveRoute(lane, Composer.curveChannelsOf(lane, tech)[i])`
    — an entry may be a NUMBER (a channel on the instrument's port) or `{ port, ch }` (the SI2 `b` ports): take the port's output from
    `MorphEmit.outputFor(port)`; round robin per player in time order; a real seat (the second vibraphone) keeps its own route; a
    technique with no curve copy stays on MAIN and the status says so. `scheduleRamps` uses the SAME marker.
  - **V3 · the stale map, one line each** (§139's bug in two more places): `strike_drawer.js` `insert` and `morph_panel.js`'s inserts
    call `C.curveDirty()` before `renderAll()` / `markDirty()`. *(Files outside the sequence's own — named to him, and his
    instruction covers them: "making sure we're using the CC7 channel or path for all sorts of continuous swells in volume".)*
  - **V4 · drawn swells.** `swell_ui.js` ALREADY writes `cc7Abs` and `velAbs` (§349) — it is on the proper path. One change:
    `velAbs` = the mf velocity (rule 1) where it is the strike's own today. Its fader range stays its own (`lo: 65`) — a swell
    rises from a sounding level, not from nothing; ONE number if he wants it from zero. **A shape drawn BY HAND on a note:** the note
    card (`note_card.js`) gets one checkbox, `full fader` — on: `cc7Abs { 0, 127 }` + `velAbs` (mf); off: both removed.
  - **V5 · the morph — METHOD ONLY, built when he revises the morph** (`docs/MORPH_NOTES.md` §3, 2026-09-20). It plugs into the same
    two fields; nothing here is built for it except V3's one line.
  - **V6 · ONE check, and no probe:** he records a waved sequence as MIDI in Reaper; `node tools/reaper_job.js run
    reaper/bridge/jobs/cc7_by_channel.lua`. Expected: every note on a curve channel · struck at the mf velocities above · CC7 reaching
    toward 0 under a deep wave · MAIN ch 1 empty. Before that, in the running app with no MIDI (`score-5401`, the verify recipe of
    journal §2): Insert after a playthrough → the notes carry both fields and route to curve channels; Hear captured → the same.
    `node tools/sequence_check.js` must still say **126** — `sequence.js` is NOT touched by any of this.
  - **V7 · `docs/DYNAMICS_LAW.md`** — one page, named in CLAUDE.md's "Orient from docs" as the FIRST read for any sound-path work:
    the two kinds of note (a STRUCK note: velocity is the dynamic, the ladder is 12 dB and the rest is timbre · a SHAPED note: struck
    at mf, the fader 0 → 1, `cc7Abs` + `velAbs`) · moving CC7 lives on the curve channels only, MAIN takes none · the map is cached —
    `curveDirty()` after writing · the first test is V6's, not a probe.
  - **Known, accepted, for the feature plan on deck:** under this the waves' `low` / `high` set a DEPTH below a top that always sounds
    at mf — so a waved box and a straight box beside it no longer share a calibrated level, and "waves by preset" (item 8: `up` /
    `down` in steps round the box's dynamic) must be re-thought as depths below the top.
  - **→ AMENDED 2026-09-20 by 1d.10, THE DYNAMICS TABLE** (RUNNING_LOG §147 · §148, LG-51): Rule 2 — *"the top of the shape is
    the full fader"* — gives way to a table in which every WRITTEN dynamic has a CC7 value of its own, so a range is HEARD and not
    only its depth. Rule 1, the mf strike, stands. NOT YET BUILT — until it is, 1e above is what the score plays. **And `1f`: the
    crescendo tool was never brought under 1e at all.**


- **1f — THE CRESCENDO TOOL UNDER THE DYNAMICS LAW** (a crescendo `mp → ff` runs the fader between the table's `mp` and the table's
  `ff` for the whole curve, struck at mf) — `todo` — **added to the list at his word 2026-09-20** (*"add it to the to-do list if we
  do need to go back and update the crescendo tool in this score"*). COMPOSITION_NOTES LG-51 · RUNNING_LOG §148. **After 1d.10** —
  it reads `score/public/dyn_table.js`.
  *Why:* his principle — a STATED range is what sounds, for the whole duration of the curve, as the performer will play it, and the
  CC7 values reflect it. **The finding (§148), read in the code and NOT captured from what it sends:** `cresc.js` · `cresc_run.js` ·
  `cresc_card.js` · `cresc_panel.js` write NO `cc7Abs` and NO `velAbs`. A dynamic name becomes a drawn height (`Cr.dynHeight`,
  i / 7 × 10) and the score's OLD law plays it: struck at the velocity of the curve's TOP, the fader moving only inside the 12 dB
  ladder. That is the very fault 1e fixed for the sequence drawer; 1e did not reach the crescendo tool (`docs/DYNAMICS_LAW.md` §5
  lists it as *"not touched"*), and `docs/CRESCENDO.md` has carried it as an open item since piece #5: *"a crescendo attacks at its
  loudest velocity and CC7 shapes it down … worth his ear on a ppp start."*
  *Result when done:* every crescendo the tool writes carries `velAbs` = its instrument's mf velocity for that pitch and
  `cc7Abs` = { the table's `from`, the table's `to` }, sounds on a curve channel, and the card's and the panel's Hear play the same
  (`cresc_card.js` ~255 and `cresc_panel.js` ~367 already stream through `heldCc7`, which reads `cc7Abs`).
  - *To be laid out when he calls it.* Known already: the crescendo STRIKES (`cresc_strikes.js`, 1o) are STRUCK notes — the velocity
    is the dynamic — check that they need nothing · the secco cut (CC7 0 ten ms before the note-off) stands · crescendi already in
    a score are NOT rewritten (`scores/cresTest.json` is HIS) — a re-deal or the card's re-apply picks the law up.
  - **For the same talk:** the drawn SWELL (CC7 65 → 127) and the note card's `full fader` (0 → 127) have no stated range today. The
    NOTATION will state one at the head of every curve (LG-51); when it does, they read the same table.


- **1g — IN A SEQUENCE, ONE SCALE** (a straight box sits on the dynamics table too: every SUSTAINED note a sequence writes is
  struck at mf on a curve channel, its fader on the table — flat if its level does not move) — **`built` 2026-09-20, session 11
  (RUNNING_LOG §157 · §158); HIS RACK TEST OUTSTANDING → CLOSED AT HIS WORD 2026-09-20 (RUNNING_LOG §162).** Planned and built in one go at his word (*"a If no questions or
  clarifications, just go ahead and plan it, and build it."*).
  *Why:* his ear — *"the attacks are very loud"* — on a straight `pp` box entered by `attack` after a `pp`–`mp` waves box. His
  recording read back (§157) showed BOTH sides on the law and the law itself at fault: a STRUCK note lives on 1b's ladder (12 dB
  from `ppp` to `fff`, a struck `pp` ≈ −10 dB) and a SHAPED one on 1d.10's table under an mf strike (a shaped `pp` ≈ −28 dB). The
  same NAME was two levels about 18 dB apart, and the line between the boxes was a +10 … +18 dB step. `DYNAMICS_LAW.md` §3 had
  carried it as *"known, and said to him"*; this was the first seam at which it was heard.
  *Result when done:* inside a sequence a written dynamic is ONE level whichever kind of box carries it — a straight `pp` IS the
  waves' `low` — in Hear, in a box's preview and in the inserted score alike. An `attack` is a full (mf) attack played down by the
  fader: the LG-14 colour.
  - **G1 · ONE predicate, `isShaped(n)`**, replaces `(waves | fade | ramp) && kind !== 'fixed'` in `hearNotes` and `insert`: every
    note that is not a FIXED-length sound is shaped. `shape(n)` already answers a flat note — `levelsOf` gives it two equal
    breakpoints, `DynTable.range` gives `lo === hi`, and `Composer.heldCc7` answers `lo` whatever the height — so NOTHING in
    `dyn_table.js`, `sequence.js` or `composer.html` changes. No `dyn_table.js` on the page → the old predicate, as it was.
  - **G2 · Insert draws a flat note at its WRITTEN height** (`shape` returns `flat`), as a straight note always was — the fader
    does not read the height when `lo === hi`, so the eye keeps the dynamic. It carries `velAbs` (mf, per pitch) and
    `cc7Abs { T, T }`, and no `sonifyMode: 'plain'`, so the score gives it a curve channel by itself.
  - **G3 · the box PREVIEW on the same scale** — or a box auditioned at `pp` would sound 18 dB over the same box in the sequence.
    Sustained = the instrument has breath / bow ceilings (`BeatingCalc.CEILINGS`, `sequence.js` `noteInfo`'s own test).
  - **G4 · a REAL seat's channel is taken** (found by the verification, not planned): the second vibraphone sits on its lane's
    first curve channel, and the marker round robin dealt that same channel to the first — two players' faders on ONE CC7. It is
    in his own recording (both vibraphones' waved notes on ch 2 at 4.9 s). `curveSeats` now skips a channel a real seat holds.
  - **NOT in this step:** a FIXED-length sound (a strike: no breath, no bow, no measured fader curve) still takes its velocity, on
    the 12 dB ladder · everything OUTSIDE a sequence (the strikes drawer's own notes, plain notes, trills) is a STRUCK note as
    before · the score's own `curveChannelMap` and its handling of seats was not opened.
  - **REQUIRED VERIFICATION (done, `score-5401`, no MIDI — §158 has every number):** `hearNotes` on waves · waves · `pp` attack ·
    `mf` → 49 of 49 shaped, 0 on MAIN · Hear captured at the `pp` line → each player on a curve channel, struck at its mf velocity,
    CC7 at the table's `pp` (EH 51 · Bsn 32 · Hn 32 · Tpt 32 · Vib 52 · Vc 51 · Db 51) · Insert → 49 notes, none `plain`, all with
    `cc7Abs` and `velAbs`, the `pp` box drawn at y 1.5 · THE SCORE'S OWN PLAYBACK across the line captured → the same channels,
    velocities and CC7, MAIN silent. `sequence_check` **180** · `dyn_table_check` **51** · `palette_check` **184**.
  - **His test (the 1e way):** the same five-box sequence, recorded as MIDI in the rack → `node tools/reaper_job.js run
    reaper/bridge/jobs/cc7_by_channel.lua`. **Expected:** MAIN ch 1 EMPTY for every sustained player · box 5's notes on curve
    channels at mf velocities (the v55 · v79 · v61 · v53 · v91 · v49 of §157 gone) · their CC7 at the table's `pp`. And his ear: the
    attack into box 5 no louder than the waves at rest.


- **1h — THE BLOOM ON A TAKE** (a TAKE from the strikes drawer chosen in the morph's PITCHES pulldown and read AS ASSIGNED — each
  pair on its JUST pitch — and the morph's dynamics brought under the law) — **`planned` 2026-09-20, session 11 (RUNNING_LOG
  §162–§166 · COMPOSITION_NOTES LG-52 · MORPH_NOTES 2026-09-20); the top line and the four steps approved as ONE summary
  (*"yes good"*), the sub-steps the AI's, written to be executed cold.**
  **► `doing` 2026-09-20 — H1, H2 AND H3 ARE BUILT AND VERIFIED (RUNNING_LOG §169 · §170 · §171), AND EVERY NAMED CHECK OF THE
  REQUIRED VERIFICATION HAS RUN. WHAT IS LEFT IS H4, HIS LISTEN — nothing here has been HEARD, the in-app browser has no Web MIDI.**
  **AS BUILT (H1 + H2.1…H2.5): the two steps went into ONE commit.** H1 alone would leave the line claiming *as assigned* while the
  bloom still played the model's own set, and the REQUIRED VERIFICATION's own check (1) — the pulldown lists it first-group AND the
  line shows pair · note · cents · partial — cannot be run on the chooser alone. Everything is in `morph_panel.js`; `morph.js`,
  `morph_septet.js`, `strike_drawer.js`, `sequence_ui.js` and `composer.html` are untouched, as §165 predicted.
  **One call the plan did not make:** the take branch sits **BEFORE** the named-voices branch in `applyPitch`, not after it — a
  recalled bloom-on-a-take (H2.6) arrives with `source.kind: 'voices'` already on its params, and the older branch would pass it
  through with no rows to draw.
  *Why:* his words — *"I want to make a bloom and then I want to be able to use one of the … TAKES from the [strikes] drawer, just
  like the sequences do … make sure I'm choosing the notes from the take that are comfortable in both the instruments' ranges. And
  then being able to see the partial number … I don't want to build a whole bunch of additional infrastructure."* The piece's second
  object is a bloom FOLLOWING the first sequence on one of the same takes (LG-52). His method from here is small builds, one MODEL
  at a time, by compositional need (§162) — and he must HEAR these pitches before anything else about the morph drawer is rethought
  (§163: *"I need to hear those particular bloom pitches. So let's build this part first, along with the dynamics."*).
  *Result when done:* in his Chrome, a take made and heard in the strikes drawer — a pair's note put on both of its players — is
  chosen in the morph's PITCHES pulldown; BLOOM generates with each pair on the take's exact pitch, cents kept, the line showing
  note · cents · partial pair by pair; and Hear and the inserted score sound alike, on the sequence's scale.
  *What the code already gives (read 2026-09-20, §165 — do not re-derive it):*
  **(a)** the strikes drawer ALREADY doubles a note (`strike_drawer.js` ~1000–1030, his own U10: arm a note by double-clicking its
  dot, click a row, click a second row — `v.also`), takes a note off a player (click it in the row) and marks a note a player
  cannot reach (`fitReal` → `skip`). **Nothing is built in the drawer; `strike_drawer.js` is his 2a and is not touched.**
  **(b)** `SequenceDrawer.dealTake(name)` (`sequence_ui.js` ~1335) returns a saved take's chord — per player `{ lane, seat, inst,
  tech, midi, cents, level, vel, partial? }` — and LOADS the take in the strikes drawer on the way, so he sees it there.
  **(c)** the engine's `source.kind: 'voices'` door is GENERAL (`morph.js` ~1262–1300: read before any model runs, the order kept,
  `lanes[i]` the voice's player) and `cast()` passes a voice list through with `P.lanes` (`morph_septet.js` ~103–115). M1 opens
  voice `vi` by `vi % 2 === 0 ? + : −` (`morph.js` ~1515) — so voices ordered PAIR BY PAIR, a then b, open each pair APART.
  **(d)** the morph's level is 0 … 10, and `level / 10` is the same 0 … 1 written-dynamic height the sequence drawer hands
  `DynTable` (`morph_emit.js` ~336 maps `h / 10` onto the anchors). The sequence's `mfVel` · `isShaped` · `shape`
  (`sequence_ui.js` ~1500–1535) are the pattern. `DynTable` exports `cc7 · range · height · hasCurve`; the score has
  `curveChannelsOf(lane, tech)` · `curveRoute(lane, entry)` · `curveChannelMap()` · `heldCc7` (`composer.html` ~11393–11430 · ~9692).
  - **H1 · A take chosen in the morph's PITCHES pulldown.** — **`done` 2026-09-20 (RUNNING_LOG §169).** *Result when done:* his takes are listed there under a heading of
    their own; choosing one makes it the bloom's pitches; the rule boxes beside it (`take · k · seed · per pair`) go grey and the
    line says *as assigned*; the two meanings of "take" get two different words.
    - H1.1 · `drawPitch` (`morph_panel.js` ~1420): a new optgroup **`takes · the strikes drawer`**, the FIRST group of
      `#morphPitchSrc`, newest first, value `dtake:<name>`, text = the name (and the take's comment when it has one). The names
      come with `loadPitchSources` — `/api/snapshots` → `panels.strikes` (the drawer's `TAKES_PANEL`).
    - H1.2 · choosing one DEALS IT ONCE — `await SequenceDrawer.dealTake(name)`: ONE reader of a take, not two. No
      `SequenceDrawer` on the page → the status says so and the model's own set plays. The dealt chord is FROZEN into the pitch
      state — `p.takeName`, `p.takeAt`, `p.takeChord = [{ lane, inst, midi, cents, partial }]` — and saved by `savePitch()`, so
      every later Generate (a nudged dial, a poll) reads the frozen chord and NEVER reloads the drawer. The sequence box's
      `freeze` is the model.
    - H1.3 · a **`↻`** button beside the pulldown, live only for a take source: deals the take again — for when he has changed it in
      the drawer and saved it under the same name.
    - H1.4 · with a take source the reduction rule · `k` · `seed` · `per pair` · `keep` · `✕` are DISABLED at 0.45 opacity; `root`
      is left alone.
    - H1.5 · TWO WORDS. The strikes drawer's is a **take**; the panel's reduction rule is relabelled **`pick`** — the label and
      the head line ONLY (`p.take`, `SEP.TAKES`, the ids and every stored key stay as they are). Head: *PITCHES · a sonority and a
      pick (three notes doubled, or two per pair) — or a TAKE from the strikes drawer, as assigned*.
    - H1.6 · ONE MODEL AT A TIME: `TAKE_MODELS = ['M1']`. Under any other model a take source is refused in the line (*"a take is
      read by BLOOM only so far — the model's own set plays"*) and `applyPitch` returns the params untouched. The next small build
      adds to the list.
  - **H2 · The take read as assigned.** — **`done` 2026-09-20, H2.1 … H2.6 (RUNNING_LOG §169 · §170).**
    **AS BUILT (H2.1):** a DOUBLED pair goes out in PAIR order, a then b — not held-then-partner. Corrected while building H2.6,
    which showed that held-then-partner comes back from an actual with the two lanes swapped; it also makes seat `a` always the
    even voice, so it always opens ABOVE, which is what this item's check (3) assumes.
    **AS BUILT (H2.6):** a recall that does NOT take the take branch now CLEARS any frozen chord, so the pitch state can never name
    one actual in `src` and a different one in `takeName`. `bank/` was restored from a scratchpad PRE-IMAGE rather than by
    `git checkout` — his own :5400 server was running and a checkout could have clobbered a concurrent write of his. *Result when done:* each pair plays exactly what the take gave its two players, on the
    just pitch with the cents kept — both players on one note is a doubled pair; one alone, the partner doubles it; neither, the
    pair sits out. The line shows each pair's note · partial · cents; a note on a player outside the pairs is left out and said
    so; a partner that cannot hold a doubled note is a WARNING — a net only, the drawer is where he resolves it (§163).
    - H2.1 · `applyPitch` (~1366): a new branch BEFORE the sonority path — the source is `dtake:` and the model is in
      `TAKE_MODELS` → build the voice list from `p.takeChord` and `this.pairs` (`{ a, b, on }`, lanes), pair by pair in the
      panel's order, **a then b**: both hold a note → two voices, each its OWN pitch · one holds a note → the partner DOUBLES it
      (same `midi` + `cents`) if `env.BC.holds(env.recipe, partnerInst, midi)`, and if it cannot the pair plays as ONE voice and
      the line says so in the warning colour · neither → the pair sits out · an un-ticked pair is skipped as today · a player
      holding MORE than one note (a shift-click in the drawer) gives its lowest, and the line says so.
    - H2.2 · the params: `out.source = { kind: 'voices', voices: [{ midi, cents }] }` · `out.lanes` in the same order ·
      `out.voices = n`. **`morph.js` and `morph_septet.js` are NOT changed — if the build finds it must change either, STOP and
      say so** (the tuba baseline and the six LGMF scores ride on them).
    - H2.3 · THE PAIR ROWS. `cast()`'s voice-list branch marks every pair silent (*"this model names its own voices"*) — right
      for the LGMF models, wrong here, where the pairs DO own the voices. In the PANEL, after `cast()` returns, re-attach each
      voice to its pair (`voices[i].pair`, `pairs[k].voices`, `silent = false`, `why = ''`) so the rows draw and the ticks
      (`heard()`) still hear one pair alone. If that cannot be done from the panel's side, leave the rows inert for a take source,
      SAY SO in the row, and note it in `MORPH_NOTES.md`.
    - H2.4 · `_pitchInfo = { take: true, name, pairs: […], leftOut: […] }` and the line in `drawPitch`, pair by pair:
      **`EH + Bsn · G3 −31.2 c · partial 7 · doubled`** — cents signed, one decimal; `partial` omitted when the take's harmony
      carries none — then *left out:* every note of the take on a player that is in no pair (the vibraphones, the percussion).
    - H2.5 · NOT kept from the take: its technique and its level — the model's own technique dial and shape govern a morph.
    - H2.6 · **THE ACTUALS KEEP THE PITCHES** (his word, RUNNING_LOG §168: *"I can recall the actual and then change it and save it
      as a different actual, etc., or insert it into the score. It'll preserve the pitch changes, all of that."*). SAVING needs
      nothing new — `resolvedParams` already carries `source.kind: 'voices'` and `lanes`, as the 24 LGMF actuals prove — but each
      voice ALSO carries its `partial` (`{ midi, cents, partial }`; the engine reads only `midi` and `cents` — CHECK that nothing
      validates a voice's keys). RECALLING is the fix (`morph_panel.js` ~905–940): when the recalled `rp.source.kind === 'voices'`
      AND `rp.model` is in `TAKE_MODELS`, do NOT flatten the voices into a sonority — rebuild the FROZEN CHORD from them
      (`p.takeChord = voices.map((v, i) => ({ lane: rp.lanes[i], midi, cents, partial }))`, `p.takeName = entity`,
      `p.src = 'actual:' + entity`) so the recalled bloom re-enters the SAME as-assigned branch a take uses (H2.1 reads
      `p.takeChord` for a `dtake:` source and for an `actual:` source that has one). Every later Generate, `Save as ACTUAL` and
      Insert then keeps the cents. `↻` is dead for it — there is nothing to re-read. After a page reload the `actual:` option must
      still exist in the pulldown: re-seed `recalledSets[p.takeName]` from the stored `p.takeChord`. The LGMF models (M3 · M6,
      voices in their BASE params) and a recalled actual WITHOUT voices go exactly as they do today.
  - **H3 · The morph's dynamics on the law.** — **`done` 2026-09-20 (RUNNING_LOG §171).**
    **AS BUILT:** the helper is applied at INSERT, not at save — `model_bank.js` validates that `toScoreObjects(notes)`
    reproduces a stored actual's `objects`, so shaping at save would break the validator, and shaping at insert means an actual
    filed BEFORE this build still comes out on the law when it is placed. `insertActual` therefore shapes the PLACED copies.
    **(6b) as seen:** the attack modes the panel actually offers are `fade` (a weight, reaches CC7 0) and `multiply` (no weight;
    the LEVEL is shaped, so the fall bottoms at the table's value — measured CC7 43 on the english horn). `ceiling` is the same
    code path as `multiply` and no preset offers it. **There is no weight-based fade OUT in the morph at all** — `fadeWeight`'s
    `to` is written only by the sequence drawer (1d.8) — so a morph's ending falls by LEVEL, and that fall is now on the table. *Result when done:* a bloom sounds on the same scale as a sequence — every
    sustained note struck at mf, on a curve channel, its fader between the table values of its written dynamics; Hear and the
    inserted score behave the same. **THE RULE: EVERY sustained note the morph writes is shaped, moving or not** — DYNAMICS_LAW §3
    Rule 3 carried to the morph (the AI's call, flagged to him in §165 and approved with the rest). It REPLACES the sentence of
    MORPH_NOTES 2026-09-20, *"a morph note whose level does NOT move stays a struck note"*: this bloom follows a sequence on the
    same take, and a still `pp` left on the struck ladder would stand ≈ 18 dB over the sequence's `pp` (§157). It holds for EVERY
    pitch source, not only a take.
    - H3.1 · ONE helper both files call — a tiny UMD beside `dyn_table.js` (`score/public/morph_dyn.js`, one script tag in
      `composer.html`): `shapeLevels(bank, instKey, midi, level /* [[dt, 0…10]] */)` → `{ velAbs, cc7Abs: { lo, hi }, heights,
      flat, measured }` — `velAbs = VelocityRemap.heldNote(bank, instKey, midi, 100).vel` (per PITCH; no bank → 100) · `lo` / `hi`
      = the lowest and highest `level / 10` · `cc7Abs = DynTable.range(bank, instKey, lo, hi)` · each height =
      `DynTable.height(bank, instKey, l / 10, lo, hi)`. No `DynTable` on the page → null, and everything below behaves as today.
    - H3.2 · INSERT — both morph inserts (`insert` ~1196 · `insertActual` ~946): AFTER `M.toScoreObjects(...)`, on every note
      object: `cc7Abs` · `velAbs` · `nodes[].y = max(0.05, 10 · height)` — a FLAT note keeps its WRITTEN height (`heldCc7` answers
      `lo` whatever the height when `lo === hi`; 1g's G2) — and no `sonifyMode: 'plain'`, so the score gives it a curve channel by
      itself. `velRef` and `cc7Fade` stay exactly as the engine wrote them: the niente fade multiplies in on top of `cc7Abs`.
      `C.curveDirty()` is already there (1e V3).
    - H3.3 · HEAR — `morph_emit.js` `play` (~286–400), when the helper answers: **(a)** the strike is `velAbs`, and `velFor`'s
      softening below level 0.4 is skipped — the fader does that work now · **(b)** `ccOf(h)` =
      `DynTable.cc7(bank, route.instKey, h / 10)`, still multiplied by `fadeAt` · **(c)** THE ROUTE — a shaped note plays on a
      CURVE channel: `Composer.curveChannelsOf(lane, technique)` / `curveRoute`, round robin per player in time order, as
      `curveChannelMap()` does it and as the sequence drawer's `curveSeats` does it for its own Hear; the bends AND the CC7 go to
      that channel. A technique with NO curve copy stays on MAIN and the status says how many.
    - H3.4 · the status after Generate / Hear states the fader span that went out (*the fader CC7 lo…hi*, as the sequence's
      `rangeText`) and says when an instrument has no measured curve.
    - H3.5 · DOCS at the build: `DYNAMICS_LAW.md` — §1's third case and §3 Rule 3 now read *in a sequence AND in a morph*; §4's
      "in a tool's Hear" gains the morph · `MORPH_NOTES.md` §3 — an AS BUILT entry naming the sentence it replaces ·
      `RUNNING_LOG.md` as it happens.
  - **► H4 · His listen — THE ONLY THING LEFT IN `1h`, AND IT IS HIS.** *Result when done:* he has made a bloom take in the drawer and heard it there, pulled it into a bloom,
    heard the bloom, and inserted it after the sequence. His ear is the verdict; a recording read back proves the routing, as
    with 1e.
  - **NOT in this step:** anything in the strikes drawer · `morph.js` · `morph_septet.js` · `composer.html` beyond one script tag ·
    any model but BLOOM reading a take · the sequence's takes menu (filter · `▸`) lifted into the morph — if 216 names in a pulldown prove unwieldy, that
    is the next small build · `1f`, the crescendo tool · his *"another pass at the actual way the morph drawer works"* —
    announced, his, NOT to be anticipated (§163).
  - **REQUIRED VERIFICATION (`score-5401`, no MIDI — journal §2's recipe; the AI never Saves and never touches his tab; NOTHING
    is written to `bank/panel_snapshots.json`, his 3 MB of takes — no take is saved or deleted by the verification):** (1) the
    real `dealTake` on ONE OF HIS OWN takes, read-only → the pulldown lists it first-group, the line shows pair · note · cents ·
    partial, the drawer shows the take · (2) a HAND-BUILT chord injected as `p.takeChord` for the cases his takes may not hold: a
    note on both players of a pair with cents ≠ 0 · one player only (the partner doubles) · a partner that cannot hold it (one
    voice + the warning) · a vibraphone note (left out) · (3) the engine's `result.notes` open at the take's cents — voice a
    above, voice b below, the pair's centre = `midi·100 + cents` · (3b) THE ACTUALS (H2.6): `Save as ACTUAL` → recall it → nudge a dial (length,
    smoothness) → the voices' `midi` + `cents` + lanes UNCHANGED and the line still pair · note · cents · partial → `Save as
    ACTUAL` again → the second file's `resolvedParams.source.voices` equal the first's → `insertActual` → the same cents in the
    score. **`bank/` must be left EXACTLY as it was found** — file the test actuals under a `zz-1h-` label, remove them by the
    bank's own means at the end, and `git status` must show nothing new under `bank/`; if that cannot be done cleanly, verify the
    recall branch on a hand-built actual in memory instead and SAY which was done · (4) Insert → every note object has `cc7Abs` (from the table,
    lo ≤ hi) and `velAbs` (the mf velocity for ITS pitch), none `plain` · (5) Hear captured (stub the emitter's own `outputFor`) →
    MAIN ch 1 silent, each voice on a curve channel — the SI2 three on their `b` ports — struck at `velAbs`, CC7 on the table ·
    (6) THE SCORE'S OWN PLAYBACK of the inserted bloom captured → the same channels, velocities and CC7 as (5) · (6b) THE FADES (his question, RUNNING_LOG §167): a bloom with a fade IN and a fade OUT, Hear and the score's own playback
    both captured → the strike constant at the mf velocity all through the fade, CC7 rising from 0 to the note's table value over
    the fade-in and falling back to 0 over the fade-out — the fade still a WEIGHT ON TOP of the table value (`cc7Fade`, piece #5's
    §315–§317), not rewritten. In whichever attack modes the panel offers (`fade` · `multiply` · `ceiling` in the engine): `fade`
    reaches silence; the other two shape the LEVEL and so bottom at the table's `ppp`, a sounding level — SAY which was seen ·
    (7) the four
    LGMF models still generate and their line still says *names its own voices*; a plain sonority source still works, and is now
    on the law too · (8) `sequence_check` 180 · `dyn_table_check` 51 · `palette_check` 184 · `test_snapshots` 26.
  - **His test:** RELOAD the tab · in the strikes drawer, load or build a chord, take the notes off everyone but the three he
    wants, put each of the three on BOTH players of a pair (double-click the dot, click a row, click the partner's row), Hear it
    (`long tone`), save it under a new name · morph panel → BLOOM → the PITCHES pulldown, the take at the top → the line gives
    each pair's note · cents · partial → Play → Insert after the sequence → play the score. **By ear:** each pair opens from ITS
    just pitch; the bloom's `pp` sits where the sequence's `pp` sat; no loud attack. **The proof of the routing, the 1e way:** the
    inserted bloom recorded as MIDI in the rack → `node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua` → MAIN
    ch 1 empty · every note on a curve channel · mf velocities · CC7 on the table's values.


- **1i — THE VIBRAPHONES IN THE BLOOM** (the two vibraphones as a FOURTH PAIR of a bloom on a take — as assigned, ONE note each,
  HELD STILL — following the bloom's one shape) — **`planned` 2026-09-20, session 11 (RUNNING_LOG §172–§174 · COMPOSITION_NOTES
  LG-54 · MORPH_NOTES 2026-09-20 ×2); the top line approved (*"top line is good good to write plan and build"*), the sub-steps the
  AI's, written to be executed cold.**
  *Why:* his words — *"is there a way to include the vibraphones in the morph as an extra pair, but that don't bend pitch at all. I
  want them to be able to follow or have a, a curve and do the fade and everything. as one of the other pairs would, or, you know,
  its own trajectory, but it just wouldn't do the pitch bend."* Three answers of his closed phase 1: what they hold — *"a, as assigned
  in the take, held still"* · follow or own — *"a"*, they FOLLOW · how many notes — *"one each is right"*.
  *Result when done:* in his Chrome, a take with a note on Vibraphone 1 and / or Vibraphone 2 is chosen in the morph's PITCHES
  pulldown; BLOOM generates with the three bending pairs exactly as today AND the vibraphones as a fourth row — each on its own note,
  never bending, entering, re-bowing, swelling and fading with the bloom; ticking only that row gives a vibraphone-only bloom (his
  *"its own trajectory"*, as a second object); Hear and the inserted score sound alike, on the dynamics law; an actual keeps them.
  *What the code already gives (read 2026-09-20, §172–§174 — do not re-derive it):*
  **(a) THE TWO VIBRAPHONES ARE ONE SCORE LANE AND TWO SEATS.** `beating_calc.js` ~25 `ORDER`: lane 5 is `bowed_vibraphone`.
  `strike_drawer.js` ~37–49 `EXTRA_SEATS`: *Vibraphone 2* is a second SEAT on that lane (`seatOf`), its notes carrying `seat`; both
  seats' notes leave the drawer on lane 5. `SequenceDrawer.dealTake` returns `{ lane, seat, inst, tech, midi, cents, … }`
  (`sequence_ui.js` ~1347). So the fourth pair is *lane 5 seat 0 + lane 5 second seat* — READ the drawer's value for the second
  seat, do not assume it.
  **(b)** `takeVoices()` (`morph_panel.js` ~1494) walks `this.pairs`, keys the chord `byLane`, DOUBLES a note held by one player of
  a pair, and computes `leftOut` as *in no pair*. **The FROZEN chord DROPS `seat` today** (`dealTakeInto`, ~1470). The recall branch
  (~924–978) rebuilds the frozen chord from an actual's `source.voices` + `lanes`.
  **(c)** `PAIRS_KEY 'septet.morphPairs.v1'` · `loadPairs()` ~1342 returns the stored list, else `DEFAULT_PAIRS` · `drawPairs()`
  ~1370 draws a row per pair with two `<select>`s listing `SEP.bendingLanes(env)` — the vibraphone is not one (`playerBendSt: 0`).
  His browser has THREE rows stored.
  **(d) THE ENGINE SCHEDULES PER VOICE, NOT PER LANE** — `lanes[i]` only tags a voice with its player (`morph.js` ~966–970 · ~1842 ·
  ~2118), so two voices on lane 5 are fine. Pitch reaches a voice from three places, all keyed on the voice INDEX: `modelFn` (M1's
  ±50 c) in `stateAt` ~1592 · the attack's motion and the release's motion (~1496–1525: `converge` by `(vi − half) / half`,
  `disperse` by `vi % 2`, `to-unison`). `bending` is read from the state (~1627, `|Δcents| > 5`); **a BOW pays no air for a bend**
  (~520), and the vibraphone's ceiling is `bowS: 7.4, gapS: 0`, kind `bow` (`beating_calc.js` ~286–310).
  **(e)** in the score both vibraphones' notes live on lane 5 as curve events and the curve-channel map deals them round robin in
  time order — what a SEQUENCE's two vibraphones already do (`sequence_ui.js` ~1552–1579 `curveSeats`, its Insert ~1784–1795).
  The morph's Hear has the same deal in `morph_emit.js` ~116 `curveSeatsFor` (called ~416). `morph_dyn.js`
  `shapeLevels(bank, instKey, midi, level)` is per instrument; the vibraphone has a measured curve and a table.
  - **VB1 · The vibraphone pair in the panel.** *Result when done:* the PAIRS block has a fourth row — the two vibraphones, labelled
    as the sequence drawer prints them — with its tick and NO seat menus; it appears in a panel that stored three rows yesterday; the
    three bending rows behave exactly as before.
    - VB1.1 · a pair may name a SEAT and may be STILL: `{ a, b, sa, sb, still: true, on }` — `sa` / `sb` absent = 0, so the three
      stored rows need no migration. The lane comes from `TRACKS` by `instKey === 'bowed_vibraphone'`, the second seat's value from
      the strikes drawer's own seat list — never a hard-coded 5 or 1. A piece without the instrument gets no fourth row.
    - VB1.2 · `loadPairs()`: after reading the stored list, APPEND the still pair when the list has none, ticked ON. **The still pair
      is ALWAYS THE LAST ROW** — VB1.4 and VB2.4 lean on it; assert it.
    - VB1.3 · `drawPairs()`: a still pair draws two plain labels in place of the `<select>`s (title: *does not bend — held still*).
      The seat menus list `bendingLanes` only, so `swapSeat` can never take or give a vibraphone seat; confirm, do not build.
    - VB1.4 · **THE VIBRAPHONES ARE IN A BLOOM ON A TAKE ONLY.** Everything that walks `this.pairs` for the SONORITY path gets
      `this.pairs.filter(p => !p.still)` — `pairOrder()` · `takeForPairs(son.notes, this.pairs.length, …)` (~1642) · the
      `cast(params, this.pairs, env)` call (~1361, whose `want = pairs.length * 2`). With the still pair last, `cast.pairs[k]` still
      lines up with rows 0 … 2. For any source but a take, row 4 reads *a take only*. **All of this from the PANEL — if it cannot be
      done without editing `morph_septet.js`, STOP and say so.**
  - **VB2 · The take gives them their notes.** *Result when done:* each vibraphone's note is read as assigned — two notes → two
    voices · one → ONE voice, no doubling, no warning · none → the row sits out; the line shows the fourth row with note · cents ·
    partial like any other; `left out` names only what is truly in no pair (the percussion).
    - VB2.1 · the FROZEN chord keeps `seat` (`dealTakeInto` ~1470: `seat: n.seat || 0`). A chord frozen BEFORE this build has no
      seats, so two vibraphone notes would both read seat 0 and give the lane's lowest to Vibraphone 1: SAY so in the status
      (*re-deal with ↻*), do not migrate.
    - VB2.2 · `takeVoices()`: key the chord by `lane:seat`; a row's seats read `(pr.a, pr.sa || 0)` and `(pr.b, pr.sb || 0)`;
      `inPair` keyed the same way. The `multi` rule (a player holding several notes gives its LOWEST — his *"one each is right"*) is
      per `lane:seat`.
    - VB2.3 · a still pair NEVER DOUBLES: both → both · one → that one, `why = 'one vibraphone'`, no warning · none →
      `no note in the take`. The doubling exists so a bending pair can open apart from a unison; here it would only thicken.
    - VB2.4 · each voice of a still pair goes out as `{ midi, cents, partial?, seat, still: true }`, **and the still voices go LAST
      in `voices[]` / `lanes[]`** — the six bending voices keep their indices and their a-above / b-below parity (`vi % 2`).
    - VB2.5 · the cents of a vibraphone note are KEPT as the take gives them, as the sequence does. A bar is tempered, so this is 0
      unless he has set otherwise in the drawer; do not zero it silently.
    - VB2.6 · H2.3's re-attachment of voices to rows (what the tick filter reads) includes row 4: *tick row 4 only* = a
      vibraphone-only bloom; untick it = the six, as today.
  - **VB3 · The engine holds a voice still.** *Result when done:* a voice marked `still` in `source.voices` keeps its start cents
    from the first sample to the last — through the model, the attack's motion and the release's motion — while its level, its bows,
    its technique and its fades are any voice's; **without the mark not one byte of any render changes.**
    - VB3.0 · **THE GATE, FIRST:** before touching `morph.js`, render in node the `resolvedParams` of his two stored actuals
      (`bank/actuals/ACT-BLOOM-01.json` · `-02.json`, READ-ONLY) and of two LGMF actuals, and keep the JSON in the scratchpad. After
      the change the same four renders are byte-identical. (`tools/morph_septet_check.js` is still piece #5's cast and crashes —
      NITS N3; not repaired here.)
    - VB3.1 · `morph.js`, beside the `VOICES` door (~1276): `const STILL = VOICES ? VOICES.map(v => v.still === true) : []`. In
      `stateAt` a still voice's cents stay `startCents[vi]` — the model's `moved.cents` is not applied; its technique and level ARE.
      In the motion function (~1496) a still voice returns 0. **Read both functions whole first** and look for a third place
      (a `target` / `mid` station); M1 has none, and no other model is built for — `TAKE_MODELS` stays `['M1']`.
    - VB3.2 · the emitted notes of a still voice carry the form a voice with constant cents has today — read how a voice with
      cents ≠ 0 and no motion is emitted and keep exactly that; no bend MOTION. `bending` (~1627) is then false by itself.
    - VB3.3 · a comment beside `kind: 'voices'`'s own: ADDITIVE AND OPT-IN. The third such door (1a.5 `voices` · 1d.8 `fadeWeight`'s
      `to`).
    - *Known, said to him, not fixed here:* `staggerOrder(nVoices, seed)` and `dynLevel(…, vi, nVoices, …)` are dealt from the
      voice COUNT, so a take regenerated with its vibraphone notes in is not the six-voice bloom of the same seed plus two. His
      stored actuals carry their own six voices and do not move. (MORPH_NOTES: pitch geometry over the MOVING voices is the
      revision's.)
  - **VB4 · They sound on the dynamics law.** *Result when done:* Hear and the score's own playback agree note for note — both
    vibraphones on the vibraphone's CURVE channels, never sharing one at the same moment, an mf strike for the pitch, CC7 on the
    table, the fades a weight on top, and no pitch-bend motion for them.
    - VB4.1 · Insert (`morph_panel.js`): a still voice's objects land on lane 5 carrying what a SEQUENCE writes for a vibraphone
      note (`sequence_ui.js` ~1784–1795 — read it and write the same, `seat` where the sequence writes it). `morph_dyn.shapeLevels`
      already serves the instrument; check `hasCurve`.
    - VB4.2 · Hear (`morph_emit.js` `curveSeatsFor`): two voices on ONE lane overlap all the time — the round robin must give them
      different curve channels at every moment. VERIFY by capture, do not assume; and read how PLAN 1g kept the real second seat's
      held channel out of the pool (`sequence_ui.js` ~1560–1564) — the same collision must not come back by this door.
    - VB4.3 · the technique: the palette's ordinary voice for `bowed_vibraphone` (`BC.ordinaryVoice`) must be the BOWED long tone
      the sequence sustains with, not a strike. If it is not, the still voice takes the take note's own `tech`.
    - VB4.4 · `Composer.curveDirty()` after Insert is already there for all four inserts (1e) — confirm, do not re-add.
  - **VB5 · The actuals keep them.** *Result when done:* `Save as ACTUAL` on a bloom with vibraphones → recall → nudge a dial → the
    vibraphone voices are back on the same notes, the same seats, still → `Save as ACTUAL` again → Insert: all the same. His two
    existing actuals recall exactly as they did.
    - VB5.1 · the recall branch (~924–978) carries `seat` back from the voice into the rebuilt chord (absent = 0). `still` rides in
      the stored params too, so the bank's node-side re-derivation reproduces the notes.
    - VB5.2 · `node tools/model_bank.js --validate` stays VALID with a vibraphone actual filed; then the test actual (label
      `zz-1i-`) is removed by the bank's own means and **`bank/` is left EXACTLY as found** — §170's method, the pre-image of
      `bank/morph_models.json` kept in the scratchpad, `git status` showing nothing new under `bank/`.
  - **► VB6 · His listen.** *Result when done:* he has made a take with the vibraphones in it, heard the bloom with them, heard them
    alone, and inserted it. His ear is the verdict; a recording read back proves the routing, as with 1e.
  - **NOT in this step:** dials of a pair's own (MORPH_NOTES — the revision's) · any model but BLOOM · a SONORITY source casting the
    vibraphones · more than one note per vibraphone · the percussion · `strike_drawer.js` · `sequence_ui.js` · `morph_septet.js` ·
    `composer.html` · dealing the stagger over the moving voices only.
  - **REQUIRED VERIFICATION (`score-5401`, no MIDI — journal §2's recipe; the AI never Saves and never touches his tab; NOTHING is
    written to `bank/panel_snapshots.json`):** (1) a HAND-BUILT chord injected as `p.takeChord` — three doubled pairs + Vibraphone 1
    and Vibraphone 2 on two different notes → 8 voices, the last two `still`, both on the vibraphone's lane, four rows on the line,
    `left out` empty · (2) one vibraphone only → 7 voices, no doubling, no warning · none → 6 voices and the render byte-identical
    to the same chord's before the build · (3) every note of a still voice sits at `midi·100 + cents`, no bend motion; the six
    bending voices open a-above / b-below as before · (4) THE GATE of VB3.0 byte-identical · (5) tick row 4 only → `heard()` holds
    only vibraphone notes; untick it → only the six · (6) Insert → the vibraphone objects on their lane with `cc7Abs` + `velAbs`,
    none `plain`; THE SCORE'S OWN PLAYBACK captured → both vibraphones on curve channels, never the same channel at the same
    moment, mf velocities, CC7 on the table, no pitch-bend motion there · (7) Hear captured → the same as (6) · (7b) a fade in and a
    fade out → the vibraphones' CC7 rises from 0 and falls to 0 with the others, the strike constant · (8) one of HIS takes that
    holds a vibraphone note, read-only through the real `dealTake` → row 4 shows it · (9) THE ACTUALS (VB5), `bank/` left exactly
    as found; `ACT-BLOOM-01` · `-02` recall unchanged · (10) `sequence_check` 180 · `dyn_table_check` 51 · `palette_check` 184 ·
    `test_snapshots` 26 · `model_bank --validate` VALID.
  - **His test:** RELOAD the tab · strikes drawer: a bloom take with a note on Vibraphone 1 and another on Vibraphone 2, Hear it
    (`long tone`), save it under a new name · morph panel → BLOOM → PITCHES → that take → four rows on the line → **Play** → tick
    ONLY the vibraphone row → **Play** → tick all → **Insert** → play the score. **By ear:** the vibraphones enter, re-bow and fade
    with the bloom and never bend. **The proof of the routing, the 1e way:** record the inserted bloom as MIDI in the rack →
    `node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua` → MAIN ch 1 empty · every note on a curve channel · the two
    vibraphones on different channels · mf velocities · CC7 on the table's values.


## 2. Notate — `todo`

*To be laid out when we discuss it.* 2a engine adaptation · 2b presentation score (video +
print) — #5's shape.

## 3. Performance score — `todo`

*To be laid out when we discuss it.* Piece #5's own PLAN 3 is not built yet (its N6); this
item follows whatever that produces.

## 4. Submission package — `todo`

*To be laid out when the call is read.*
