# PROJECT PLANNER — septet LGMF 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-18 (session 2, Fable to design, Opus to build) — **0d, ensemble balance, is DESIGNED and BUILT; it is the ONLY pre-composition item (his scope call, §43).** His goal, restated: realistic aural feedback while composing — *"if I'm listening to a chord needs to be balanced in ensemble so I can hear the harmony realisticly"* — a mostly quiet piece where everything speaks and nothing washes the others out (LG-13); a **baseline** now, refined when he designs the sounds. **Both layers in one run** (§45): the fader **trim** and the velocity/CC7 **remap**, anchored at the **quiet** level, measured as **loudness not peak** (a finger cymbal peaks high and is quiet). **Built (§47–§48):** `tools/balance_schedule.js` (**747 notes / 26.8 min**, the vibraphone included) · `reaper/bridge/jobs/make_rec_track.lua` · `probes/analyze_lgmf_balance.py`. **Immediately next, and it needs him at the machine:** parse-check the Lua through the bridge, run it to make the REC track, then record the 24-minute run. **And the bowed vibraphone is IN (D12, §48):** acquired, `LGVibes`, its own lane 5 of eight (`layoutVersion` 7), the recipe from his thirteen presets, `ordinary` = #12 Bowed Velocity, single treble staff non-transposing, braced with Percussion (one player), already in the probe — it is the OPENING's reference (LG-15).
0a · 0b · 0g · 0i all closed in one day (RUNNING_LOG §12–§18): the composer app, the sandbox,
the notation/IR stack, print and video are here on **seven new tracks** — EH · Bsn · Hn · Tpt ·
Perc · Vc · Db — verified in the running app on **5400 / 4900**, and a save has been proved
through to a notation page with the transposing parts at written pitch. Decisions D1–D6.
**Nothing sounds yet, by design.** ► **NOW: 0c + 0e, in progress, him at the machine.** The rack has ten tracks on ten `LG` ports, and the three SI2
instruments are COMPLETE as recipes — 56 presets loaded once by him, everything else (copies, baseline, channels) done as
text through the bridge and proven with the meters (RUNNING_LOG §20–§25; D8 the english horn = Xsample; D9 the layout).
**Next: the Kontakt three** (English Horn XS · Cello XS · Bass XS — his one click per instance, the AI's scripts and
read-backs), then the percussion when he chooses it, then 0d and 0h. The call is still unread, at his word.

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
