# PROJECT PLANNER — septet LGMF 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-20 (session 11, Opus → Fable → Opus) — **► BUILD PLAN 1e, THE VOLUME FIX: a note whose volume is SHAPED takes THE NORMALIZED FADER (CC7 0 → 127, `cc7Abs`), struck at MF (`velAbs`), on the CURVE CHANNELS.** *Why:* his ear, twice — *"it sounds Like the whole sequence is just sitting at the high dynamic. No waves."* Two bugs were found and fixed on the way (§137 Hear streams the fader on MAIN ch 1; **§139** `insert()` never dropped the CACHED curve-channel map, so an inserted sequence fell back to MAIN once the score had been played — §75's bug by another door), and then **his recording, read back per track and channel** (`reaper/bridge/jobs/cc7_by_channel.lua`, new; RUNNING_LOG **§140**) showed the routing right and the real fault: every shaped note struck at the velocity of its shape's TOP with CC7 moving 63 … 127 — about **12 dB, at the timbre of the top**. **HIS DIAGNOSIS closed it (§141):** *"in the tuba piece and in the last piece, we always made crescendos from zero … CC7 zero to CC7 max … a normalized one."* **And the machinery is ALREADY IN THE SCORE, per note, built by piece #5 eleven days ago for this same problem** (`wc.cc7Abs {lo,hi}` bypasses the 12 dB ladder; `wc.velAbs` sets the strike) — **so nothing in `composer.html` changes; the fix is what the TOOLS WRITE.** `docs/PLAN.md` § **1e** (V1 … V7) is written to be executed cold: **V1** the sequence's Insert · **V2** its Hear, ramped notes onto a curve route · **V3** one `curveDirty()` line in the strikes drawer's and the morph panel's inserts · **V4** `swell_ui.js` + a `full fader` checkbox on the note card · **V5** the morph — NOTHING BUILT, its method written into `MORPH_NOTES.md` for its revision · **V6** one check, no probes · **V7** `docs/DYNAMICS_LAW.md`. **Decided: mf for ALL seven** (the level lost against a struck fff is 3.9 … 5.4 dB, uniform since 1b, so the balance holds). **Step 1 of his top line found nothing to fix:** the trills carry volume as separate STRUCK notes by velocity, the septet's design. **`sequence.js` is not touched — `sequence_check` stays 126.** *Before it, the same session:* **the sequence panel FLOATS** (dragged by the head, sized by the corner, its place remembered) and every font in it is up 4 from one constant `FS = 15`, all 41 widths px → em (RUNNING_LOG §132; three bugs of the AI's own on the way — a hidden element measures 0 × 0 · `parseFloat('0px') || was` · a `ResizeObserver` with no reference is collected). **ON DECK, DEFERRED at his word:** the sequence FEATURE ADD — `docs/PLAN.md` § 1d, THE NEXT FEATURE ADD (a clock · click-to-cursor · `±` in seconds · a sequence LIBRARY · a RANGE of boxes · the waves by PRESET) and **1d.9** (`of max` · `outlier`), with a short design talk owed first. **PLAN 1d is built to its end; his tests of 1d.7 · 1d.8 and his listen (1d.6) are better done AFTER 1e, which changes how they sound.** PLAN 1a · 1b · 1c are closed or built. The LGMF call is still unread at his word.

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
