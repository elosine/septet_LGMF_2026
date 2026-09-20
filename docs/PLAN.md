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
    score) — **BUILT 2026-09-19 (session 9, RUNNING_LOG §115), HIS TEST OUTSTANDING** — his "good", 2026-09-19.
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
  - **1d.3 — The round trip** (reopen a placed sequence, change anything, re-Insert replaces it in place) — **BUILT 2026-09-19 (session 9, RUNNING_LOG §116; SEQUENCE_TOOL §10), HIS TEST OUTSTANDING** — *as built:* all in `sequence_ui.js`; the list · the start read from the META bar · re-insert IN PLACE (this CHANGES 1d.2's "Insert again moves it" — kept as a separate `move to playhead` button, his to reverse) · the status counts notes changed or deleted by hand · an orphan stays in the list, marked · a dirty row asks before it is replaced · verified in the running app with no MIDI; NOT verified: sound, and a real canvas drag of the META bar — his "good",
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
    **BUILT 2026-09-19 (session 9, RUNNING_LOG §117; SEQUENCE_TOOL §11), HIS TEST OUTSTANDING** — *as built:* the generator takes `chord: null` as a rest with NO new machinery (the absent-player rule, for everyone; `sequence_check` 49 → 60) · the roll line in `sequence_ui.js`, `time_containers.js` unchanged, the dials and defaults `containers_ui.js`'s · `tilt` fills the weights box · the recipe keeps `roll { … }` · the strip's height is its content's. **ONE CALL CHANGED WHILE BUILDING, his to reverse: a roll over a row that holds chords KEEPS them, by position** (it still asks first, and says how many are kept or dropped) — the plan below says the row is replaced; a re-roll is a re-timing, and losing every chosen take to try another seed would make the roll unusable. Verified in the running app with no MIDI; not verified: sound — written at his word without review (*"go ahead and write up the rest of the plan, I don't need to see the rest"*,
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
    **BUILT 2026-09-19 (session 10, RUNNING_LOG §128; SEQUENCE_TOOL §13; `sequence_check` 107) — **HIS TEST OUTSTANDING.** *(RESOLVED the same day, §130: the six fader curves had been MEASURED in 0d — `bank/balance.json` `cc7` — and this morning's `build_remap_card.js` wrote only the vibraphone's into the bank; the builder now writes all seven, the rest of the bank byte-identical, and Hear moves every player. What follows is the record of the finding as first made.)* ⚠ AS FIRST FOUND, THE WAVE SOUNDED ON THE VIBRAPHONE ONLY: `bank/velocity_remap.json` has a measured CC7 curve (`cc7Curve`) for the bowed vibraphone alone, and without one the score's law answers CC7 127 — for the other six a drawn height moves nothing. §121's "the score already has the law" was true of the code and false of this rack; caught by capturing what Hear sends. HIS DECISION, put to him: measure the six (the vibraphone's probe) · borrow the vibraphone's curve, labelled, and measure later. Nothing in the generator or the drawer changes either way — only the bank. It bites 1d.8's fades-to-a-dynamic the same way.** — before it: **READ RUNNING_LOG §121–§123 BEFORE BUILDING (session 10): his answer is option A — NO niente inside the waves, `low` and `high` are two WRITTEN dynamics (`ppp` … `fff`); true silence belongs to the EDGES (1d.8). Three sentences below are superseded: `swell_ui.js` is NOT reused and the strikes drawer's player is NOT changed — it cannot ramp, so the sequence drawer sends the CC7 ramp itself after `playNotes`, on the same routes and timers · the law is the score's own (`heldCc7`, every waved note stamped `velRef` = `high` and written DRAWN), which already carries the vibraphone's register · the sentence on `niente` is WRONG (the drawn bottom is ppp, 12 dB under fff, not silence; `lgmf-ref` reaches silence with `cc7Fade`, a one-way window).** — AMENDED INTO THE ITEM 2026-09-19, the same day the item was written (RUNNING_LOG §109–§111; his words verbatim in
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
    to nothing; the end together or one by one) — **BUILT 2026-09-19 (session 10, RUNNING_LOG §131; SEQUENCE_TOOL §14; `sequence_check` 126), HIS TEST OUTSTANDING** — *as built:* the generator's two change rules became ONE walk (every earlier check and the baseline gate passed untouched); `exit` one by one = a `landAt` of each player's own; niente = the note's `fade`, a dynamic = a ramp in its level. **One thing the text below said to put to him first was done WITHOUT asking, his to reverse:** a fade OUT was not expressible — `Morph.fadeWeight` could only arrive at 1 — so it took an opt-in `to` (absent = 1, the identity; two lines in `morph.js`). — written 2026-09-19 (session 10) at his word WITHOUT the planning protocol
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
    from the rest) — `todo` — **PLANNED 2026-09-20 at his word** (*"lets write this in to a plan, no need for the planning protocol"*);
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
      on a new sequence — on at 0.65, or blank: PUT TO HIM, not answered.**
    - **Verification.** `sequence_check` gains: both blank = the baseline · under `of max` every player's mean breath sits at their
      ceiling × the share (within the jitter) and none passes the ceiling · the outliers' share over a long deal is the dial's · no
      short one under the floor · every long one above the normal top and at or under the ceiling · a player with no room gets short
      ones only · a pool overrides both · the recipe round trip. In the running app, no MIDI: the line paints and greys, the status
      counts, a reopened sequence breathes as it was dealt.
    - **His test:** reload → `Sequence` → `new` → three boxes → `breath` → `of max` 0.65 → SPACE (the winds hold longer than the bass
      and the vibes) → `outlier` 0.1 → SPACE (now and then one very short or very long breath) → `re-breathe` → SPACE.
    - **Not in this step unless he says:** `±` in seconds (item 5 below — the same formula; under `of max`, is `±` still one number
      of seconds for every player?) · an `of max` per player.
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
    7. **SELECT A RANGE OF BOXES** (LG-48): *"if I have 30 boxes I can select 15-30 and make waves"*. *Today it is one box or ALL boxes.
       To settle when planned: click + SHIFT-click for the range; the range takes `waves | straight` — and `dyn` and `enter` too?*


## 2. Notate — `todo`

*To be laid out when we discuss it.* 2a engine adaptation · 2b presentation score (video +
print) — #5's shape.

## 3. Performance score — `todo`

*To be laid out when we discuss it.* Piece #5's own PLAN 3 is not built yet (its N6); this
item follows whatever that produces.

## 4. Submission package — `todo`

*To be laid out when the call is read.*
