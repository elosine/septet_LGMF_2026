# PROJECT PLANNER — septet LGMF 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-19 (session 8, Fable) — **THE DESIGN PHASE HAS OPENED: PLAN 1d, THE SEQUENCE DRAWER, IS PLANNED IN FULL; 1d.1 THE GENERATOR IS BUILT, THE DRAWER IS NOT.** His brief (COMPOSITION_NOTES LG-35, the dynamics LG-36; RUNNING_LOG §102–§107): *"music structures in my score"* — saved takes from the strikes drawer held as sustained chords, each for a duration, in a row of time containers he can re-time or swap at any moment; the durations typed one by one or ROLLED (the time container generator of piece #5, PLAN 1o — already here as `score/public/time_containers.js`); the morph's breaths laid over the whole, with a `together` dial and a pool of short and long lengths; a new chord either ATTACKED by everyone or taken SEAMLESSLY at each player's next breath; one dynamic per container. **The architecture:** a sequence is a RECIPE saved in the score file, the notes DERIVED from it; a box's chord frozen when chosen; edit in the drawer, the score shows the result. **Six build steps in `docs/PLAN.md` § 1d, each with its result-when-done, to-dos, verification and his test: 1d.1 the generator (pure, node-checked) · 1d.2 the drawer, one container at a time · 1d.3 the round trip · 1d.4 the roll · 1d.5 the breath dials · 1d.7 the WAVES layer (amended in the same day — LG-38 · LG-39, RUNNING_LOG §109–§111: each player on a dealt stream of swells, `lengths · low · high · density · peak · seed`; a box is a straight dynamic OR reads the waves, and one can step out and back in) · then 1d.6 his listen.** Held as features at his word: a curve attached to the sequence · a dynamic per player per container · a curve per player. **1d.1 IS BUILT (session 8, RUNNING_LOG §114): `score/public/sequence.js` + `node tools/sequence_check.js` (49) + `docs/SEQUENCE_TOOL.md` — pure, loaded by no page, nothing sounding. ► THE NEXT STEP: BUILD 1d.2, the drawer, one container at a time — ON FABLE at his word (2026-09-19); it needs takes to exist, and his test stands after it.** Three calls in 1d.4 were made without him and are his to reverse (§107): an empty box is a REST · a roll over a filled row asks first and replaces it · once rolled, the containers are the truth. **Still outstanding behind it, all HIS:** the listen in the strikes drawer (PLAN 1c.1 → 1c.6, built and unheard — reload the tab, `Strikes` → `HARMONIC SERIES` → a fundamental → a row → `ordinario` → shuffle → `dyn` → `hear: long tone` → SPACE) · the six scores, unheard since the rack was calibrated (`lgmf-ref` · the four transitions · `lgmf-all`). PLAN 1a and 1b are closed. The LGMF call is still unread at his word.

## The piece — outline (v0 — folded from LG-1 … LG-8 by the AI; **his to confirm, none of it discussed yet**)

**Forces:** english horn + bassoon · horn + trumpet · cello + double bass · percussion (D1).
**Duration cap:** unknown (the call is unread).

**Character (LG-2):** delicate, quiet; the interest in texture and timbre. A counterpoint of
timbres, after Sciarrino (LG-7). Reference to study: Sciarrino, *Raffigurar Narciso al fonte* (LG-8).

**Form (LG-6): a rondo whose refrain is a MORPH.**

1. **Opening.** Two notes pull two ways — *his to settle:* LG-1 says *"start with morph
   section"*; LG-6 says *"a bespoke section beginning, then a morph."*
2. **MORPH (the refrain).** A morph that travels TO a beating pattern and HOLDS; sparse
   figures played inside the hold that still evoke the beating (LG-8).
3. **Bespoke episode.** Candidate material: the pointillistic multitempo / phase-shifted
   section — quiet, many rests, each player in their own pulsed tempo shown by the bouncing
   balls (LG-4, LG-5).
4. **MORPH.**
5. **A different bespoke episode.** Candidate material: patterns from the pattern tool,
   orchestrated by weighting and thinned by algorithm, the harmony changing on a clock with
   codified transitions (LG-7).
6. **MORPH** … *(the rest: open)*

**Across the piece:** animated conductions for the delicate, quiet material — the first
gesture: pinch → slight lift → open (LG-3).

## Open musical questions (for the composer — none urgent, none blocks the port)

- **"Continuous, not sparse" (LG-2) and "lots of rests … sparse pointillistic" (LG-4, LG-5,
  LG-8).** Both are his words, two days apart. Is the rondo the answer — a continuous morph
  refrain, sparse episodes — or did the second thought replace the first?
- **The opening:** a morph (LG-1) or a bespoke section (LG-6)?
- **The pairs:** are they the morph's beating pairs (one pair of players on one pitch — the
  beating tool's own object), or a timbral grouping, or both?
- **Percussion:** which instruments — and is the percussionist the seventh voice of the
  counterpoint of timbres, or the one who marks the form?
- **Who inherits the piano's role?** In piece #5 the piano was the STRUCK voice — the recorded
  strikes, the strike at the end of a crescendo, the harmonics at a morph's re-breaths, the
  articulation lines. This piece has no piano, so those tools arrive quiet (the port's P2).
  Does the percussionist take that role, or does it simply not exist here?
