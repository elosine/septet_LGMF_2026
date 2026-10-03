# HARVEST — what _Recombination_ hands to the next piece

> The protocol's step 1 (`docs/plans/NEW_PIECE_PROTOCOL.md` § 1), run for the first time 2026-10-03 (Fable; RUNNING_LOG §787).
> **Sources read (1.1):** `NITS.md` whole (its § HELD and every open bullet) · `MORPH_NOTES.md` §4 (the digest for the revision) ·
> journal §2's Learned lists (sessions 16 … 18, 10-01 … 10-03, the STILL BINDING block) · its "offered, not taken up" and "the AI's
> calls, his to reverse" rows · PLAN items left `todo`.
> **One line per item:** the item — kind · its source → the container it goes to. **The verdicts are the AI's proposals (1.2); his read
> is the triage (1.3) — answer by number (`H-7 later`); silence = as proposed.**
>
> Kinds: **fix** a tool or code fix · **rule** an engraving / layout rule · **method** a way of working · **lesson** a thing learned about
> the stack · **doc** a document's state · **arch** an architecture item · **feature** a wish.

## TAKE NOW — becomes a step in its container at the next start (35)

### → 2 the repo and its kit
- **H-1** The kit carries a MACHINE LESSONS block (the 8 KB Bash limit · backticks go to a file · line endings counted at byte level ·
  `\uXXXX` written literal · a parallel session appending) and THE VERIFICATION RECIPE (the throwaway server, the stubs, the shield's
  before / after) as a doc, not a journal block — method · journal §2 STILL BINDING
- **H-2** His times read 0.05 … 0.2 s early — take the nearest event; "partial" in dictation = a note · a rule he states may be superseded
  two turns later — log each, build the last · in an eye pass he COLLECTS, then fixes at once · "nothing happens" after a build = the TAB
  first — method · §2 Learned 16 · 17 · 18 → HOW_WE_WORK
- **H-3** A pasted image has a file behind it only when the AI is idle — method · §775 · §776
- **H-4** A `<prev>-<port>` launch.json entry runs the previous piece's server side by side while it is unfinished; removed when it is —
  method · NITS (`tempus-5300`)
- **H-5** `SWEEP_LIST.md` is per piece, started empty · a `his` test row never reported is closed at the next start — method · NITS · §2 table
- **H-6** A gate that counts PRESENCE does not judge the LOOK: at a medium's first run, look at each furniture element for what it means
  there — method · §772

### → 3 the engine copied forward
- **H-7** The batteries bound to the SOURCE piece's pages or cast (`test_septet_notation` · `test_trills` · `test_morph_notation` ·
  `beating_calc_check` · `strike_chords_check` · `piano_*_check` · `harm_source_check` · the `_snapshot` fixtures) are classified AT THE
  COPY — re-pointed or retired — not carried red a fourth time; the ones red in the source too (`test_coords` · `cresc_check` ·
  `test_extract_played` · `ir_extract_golden` · `test_notate_block` · `test_playability` · `test_midiplayer` · `test_sonify_core`)
  retired — method · NITS § From the port · § test_morph_notation
- **H-8** Dead viewers and tables dropped from the copy list: `clusterview.html` · `chordview.html` (#4's tuba ports) ·
  `docs/instrument_map.json` (loads 0) — fix · NITS
- **H-9** One uncaught `TypeError` on every bare load (`sequence_ui.js:1652`, `stop()` before its DOM) — fixed at the copy — fix · NITS §169
- **H-10** `model_bank --validate` warns on `provenance.palette` (the writer is right; one line in the validator) — fix · NITS §213
- **H-11** `test_animobj.js` red since §454 (the curve follower's dot off by rule) — the battery's case fixed — fix · NITS §467
- **H-12** `palette_check` looks at the composer's lane CSS (`nth-child` rules; a lane added to `TRACKS` needs its rule, §183) — fix · §2
  standing warnings
- **H-13** A bundled open-licence font for ♭ ♯ ♮ in `notation/app/fonts/`, in the page's stack, so the app, the film and the print draw
  the same sign — fix · § HELD §699
- **H-14** The piano as a ROLE in twelve modules (`instKey === 'piano'`): quiet when absent; decided at the copy whether the next piece
  has the role and on which lane — arch · NITS P2 *(→ 9 if generalized: a role is a palette property, not a lane name)*

### → 4 the instruments
- **H-15** Automate the loopMIDI ports (his ask 2026-09-17: each percussion instrument its own port) — find whether loopMIDI can be
  driven, before the next rack — feature · NITS §34 · §35

### → 5 the calibration
- **H-16** `apply_ranges.js` / `apply_bend_ranges.js`: the BEGIN marker must match the carried block's header or the recipe breaks —
  checked before the first probe — fix · NITS §19
- **H-17** `instrument_card.json` rows carry `trimAtMeasurementDb` (written by `analyze_card.py`), so a re-run cannot apply a correction
  twice — fix · NITS §87
- **H-18** A technique brought into the piece has its UVI `Dynamic` checked on the main part AND its curve copies — method · NITS §85
- **H-19** `probes/*.ps1` default `$Port` is the previous piece's — a parameter at the first probe — fix · NITS

### → 6 the notation set-up
- **H-20** A curve label clears the ink at its x (a flipped column, a low head) by the standard gap — the five `--labelDy` hands become a
  rule; and the mark-vs-slur pass tests the arc across the mark's WIDTH, not the head's x alone — rule · § HELD §673 · §683
- **H-21** Every vertical rule in `layout.js` assumes a five-line staff ±2 whose positions are pitches; a new staff type reads each rule
  against its OWN outer lines (stems · the flag law · the dynamic row · the frame · the accent row · the lane clamp) — lesson · §646
- **H-22** On a new staff the existing standards come FIRST; a bespoke rule only where one cannot apply (his word §666) — rule principle
  · §2 Learned 18
- **H-23** THE LOCK per approved figure, written as he approves — nothing of the EH from 337, the other parts, the chords or the
  percussion was ever locked here — method · §2 table THE LOCK'S BLOCKS
- **H-24** The shield lays the carried IRs out under THIS ensemble (a lined-staff rule moves tuba pages' part 4): name them in
  `--expect`, a per-part hash proves the rest — method · §656
- **H-25** Technique keys are registered in `techniques.json` as material uses them; `palette_check` lists the unregistered (83 here) —
  method · NITS
- **H-26** The presentation score's pitch form (in C / transposed) is decided at the registry, not later — method · NITS (closed §336)
- **H-27** The clefs by register (a tenor clef; Bsn · Vc · Db) were never built — the ottava carried the piece; the next ensemble
  decides — rule · PLAN 2a.6

### → 7 the composing tools
- **H-28** A tool is brought under the dynamics law BEFORE its first use in the piece — the crescendo tool (`1f`) still writes no
  `cc7Abs` / `velAbs` — method + fix · PLAN 1f · DYNAMICS_LAW

### → 8 the deliverables pipeline
- **H-29** A film gate: rasterize sample pages the film's way (resvg) and compare with Chrome's — a kind present in one and absent in
  the other fails — fix · § HELD §695 · §699
- **H-30** A test stretch of a film contains every kind the film draws · every render keeps its own file name (`-r4`, `-r5`) · a rendered
  file's hash goes in its README — method · §699 · §2 Learned
- **H-31** The two print templates made here for the next piece — the cover (`print/cover/cover.json` + `make_cover.ps1`) and the
  instructions (the page's own `--w` / `--frame`, the break measured) — carried as the pipeline's own — doc · PLAN 2b-P
- **H-32** The film's lead-in is real silence in the stream (`adelay`), never a timestamp offset — lesson (in the exporter already) · §696

### → 9 the collation
- **H-33** The carried tool docs describe the tools as built for the Tempus septet (instrument names, measurements, `§N` into #5's log) ·
  `HOW_WE_WORK` cites #5's §s · `MORPH_NOTES` §1 … §2 say "this piece" and mean Tempus — ONE canonical, piece-neutral home for the tool
  docs, the rules' sources piece-qualified (`#5 §182`) — doc · NITS
- **H-34** THE LAWS written once, as the collation's spine: a chord is a list of VOICES, not a set of pitches · a player is (lane, seat),
  not a lane · a placed object carries its whole provenance on its marker · the dynamics asked of ONE module (`dyn_table` +
  `morph_dyn`) · ONE breath generator (two copies today: `sequence.js dealSpan` · `morph.js buildCarrier`) · an actual rendered in ONE
  place (the server's engine went stale, §181) — arch · MORPH_NOTES §4
- **H-35** The measurement that outlives the piece: piece #5 measured all five Xsample instruments at ±1 st (the ground for
  `bendRangeSt: 1` here) — a line on the collation's instrument sheet — lesson · NITS (`beating_calc_check`)

## LATER — kept here, dated 2026-10-03 (12)

- **H-36** THE MORPH TOOL'S REVISION — `MORPH_NOTES.md` §4 is its spec (the cycles stated as a duration and a count · a take as a
  first-class source for every model · `min` as a hard floor · the ceiling read at the loudest level · the transition into a morph on
  the panel · `fadeWeight.to` for the release · a destination as a PARTIAL number · per-pair dials · the red "N hard" seams · `heard()`
  empty on a model that names its voices · `1k` the peaks against the sequence · *"something is off there"*) — his: *"after the last
  piece or this one"* — arch · MORPH_NOTES §4 · PLAN 1k · 1s · 1t
- **H-37** A GLOBAL volume normalization of the whole composer by the texture's split (B2) — *"if I ever want to tackle"* — arch ·
  NITS §264 · LG-88
- **H-38** The strikes drawer's INSERTED plain strikes may strike louder than Hear (read in the code, never captured; one field
  `velAbs`) — a capture first — fix · NITS §204
- **H-39** A curve channel freed 0.05 s after a note's end does not cover a release tail (one constant) — flag if a tail is heard to
  duck — fix · NITS §91
- **H-40** The partial checkboxes in the HARMONIC SERIES banner (1c.7, his MAYBE) — feature · NITS · LG-32
- **H-41** Texture's LIVE section hidden, not ported (the tubas' lanes and presets) — feature · NITS §199
- **H-42** `multitempo.js` LO / HI still the tuba bank's range — per-lane ranges when MT is first used — fix · NITS
- **H-43** The rest of phase 1 never reached: the rest of `1m` (the percussion row · re-attack) · the Rhythm sequence panel and `1l.8` ·
  multitempo as a rhythm source (LG-61) · the pattern tool LG-7 · the morph to a held beating LG-8 · conductions LG-3 — feature · §2
  table N0 … N3
- **H-44** `1u`'s offers: the strip's buttons blurred · a status that leads with WHY · `neighbours` in a morph from the others' "to"
  notes — feature · §396 · §400
- **H-45** The orange pitch line's corners eased like the green line (held at §513 D) · the percussion's rest (the ball's higher arc · a
  let-ring mark · `sub.` · the beam-vs-standard-stem at 378.5) — rule · §2 table — *if the devices return*
- **H-46** The generated scores share one object-id space (`wc-1 …` across scores) — a per-score prefix when convenient — arch · NITS §75
- **H-47** In Hear, CC7 127 pre-arms a channel 16 ms before its fader value — *"do not raise again unless heard"* — fix · NITS §158 · §162

## LEAVE — struck, with the reason (9)

- **H-48** Housekeeping on this machine's disk (the superseded render, the test clips, the logs) — this piece's; delete at his word —
  § HELD §700
- **H-49** `capture_lane.js` keeps #5's band / part names — DONE here at §704 · §747 — NITS
- **H-50** The percussion recipe a placeholder · the english horn's library unnamed · the pitch form undecided · the DB's CC0 presets —
  all CLOSED in this piece — NITS
- **H-51** Bank presets carry "10 tubas" labels — honest provenance — NITS
- **H-52** This piece's data: the nine drifting LG actuals · `ACT-BLOOM-03` · `-04` filed bending · the triangles 3 dB under trim · his
  uncommitted actuals and libraries · THE TRIANGLE on track 10 — his files, this rack — NITS · §2
- **H-53** `uvi_state.js`'s header fix carried back to #5 — that repo's own session — NITS §22
- **H-54** The notation's AI calls now LOCKED (2k's `eligible` · the gliss line not in `inkOf` · the per-breath overlays dropped · the
  winds' frames' colour · `noLead` / `noTail`) — stand with Draft 01 — §2 table
- **H-55** PLAN items with a stale status: 0c · 1b read `todo` and are done; 4 the submission package done by him; 0f the AI's MIDI
  generation path superseded by the capture route (`RENDER.md` §4); 3 the performance score his, not planned — PLAN
- **H-56** The musical open questions of this piece (continuous vs sparse · who inherits the piano's struck role) — this piece's —
  journal §2
