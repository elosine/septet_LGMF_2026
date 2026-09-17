> **Provenance (septet LGMF 2026, 2026-09-17):** from piece #5 `septet_2026/docs/NAMING.md` (itself from piece #4) with the port. **This is the one carried doc edited beyond its provenance line**, because its §1 is a table of THIS repo's real file names: the stub is `lgmf`, the piece chain will be `piece-lgmf`, there is no MAIN notation file yet, and the trill / strike capture files listed further down are piece #5's, not this piece's — they are left in place as the shape to expect when this piece makes its own. §2, the S1 conventions the extractor depends on, is unchanged and still governs.

# NAMING — score files, and the S1 data conventions the IR depends on

> Opened 2026-09-03 at PLAN 0i, the proof of the IR contract (journal D9). Two things live
> here because both are "what a save file is allowed to look like": the file-naming system
> inherited from piece #4 (`for_seven_tubas/docs/NAMING.md`) and **the S1 conventions that
> the extractor reads** — D9 §5's list, each one stated as a rule the composer app already
> follows. Rewritten freely; the reasoning is in RUNNING_LOG §13.

## 1. Score files (`scores/`)

| Pattern | What it is |
|---|---|
| `lgmf` | the day-one canonical stub — the default session so a cold start opens without a 404 (this repo's RUNNING_LOG §16; piece #5 learned it the hard way at its §10). Not the piece. |
| `piece-<anything>` | **the piece** — any name starting `piece-` lives in the Piece menu (D17: no numbering chain any more; a milestone is a named version, e.g. `piece-septet-v1.5`) |
| `<name>-v<label>` | **a named version** — a frozen copy written by "Name version" beside its base file (`ScatteredStrikes01-v1.5`); never overwritten; committed; listed with its base in the menus |
| `<name>-work` | **the working copy** — every open goes through one; autosave writes here, never the file; gitignored; discarded on Save and on Reload, so one that differs from its file = unsaved edits |
| `cont-<family>-<nnn>` | a single shape / container, if the container way of working returns; families grow as needed |
| `0i-test` | the PLAN 0i proof save (this repo's RUNNING_LOG §18) — test material, kept as evidence; never part of the piece |
| `trill_playing_samples`, `-viola`, `-cello` | the composer's trill captures (2026-09-05, score-lane `Rec` on accent senza vib) — the source of `bank/trill_timing_db.json`; committed, never overwritten |
| `trill-*` | trill tests written by `tools/trill_curve_gen.js` (a curve + his timing under it); `trill0-listen` = the rejected formula file (RUNNING_LOG §99) |
| everything else | research archive — frozen experiment renders; never overwritten |

**Notation pages (`notation/ir/`, listed in `index.json` = the notation app's picker):** a page is DERIVED from a save by
`tools/notate_section.js` and is regenerable from its own `provenance.build` — never hand-edited. **This piece has no MAIN
notation file yet.** Piece #5 designated one (its D41: `piece-septet.ir.json`, the whole piece, first in the picker, kept current
by Save + R on the page) once it had a piece to notate; this repo will do the same, and the name will be `piece-lgmf.ir.json`.
Today the only page is `lgmf-0i` — the 0i proof, kept as evidence.


- **The save system (D17, composer 2026-09-04; RUNNING_LOG §67–68) — one rule for every score,
  piece or experiment:** open a score → you are in its working copy (autosave lives there; the file
  changes only on Save) · **Save / CTRL+S** when it's good · **Name version** when a chunk is done
  (saves the file AND freezes `<name>-v<label>`; the next label is suggested: 1.1, 1.2 … — a name with a suffix, `v1.10-preAccelNear105`, counts as its number, RUNNING_LOG §139; the AI's snapshots carry the current number with a suffix, never a new one) · **Reload**
  if it went wrong (drops the unsaved edits; asks once). The `?` button shows this line in the app.
  **One open composer tab per score** (PLAN 2d.5.8): the working copy lives in the open page, so a second tab of the same score
  clobbers it on Save. The AI drives HIS tab (the console lines — `moveNote`, `crescRun`, `chordRun`, `goTo`) or he closes it first.
  A throwaway :5301 tab opens its origin's last score, which can be his: check `Composer.sessionName` before touching anything.
  Piece #4's "Save as next" / "Variant" / "Restore" are gone; the Save snapshots in `scores/versions/`
  (cap 20, gitignored) remain as a silent net the AI can dig into on request.
- **Restore (D27, composer 2026-09-07 late — "be able to go back to the first try or the second try or the third try or back to nothing";
  RUNNING_LOG §215–216):** `Restore…` beside Reload makes a NAMED VERSION the file again — the file as it is now is frozen first as
  `<name>-v<next>-before-restore`, the unsaved edits are dropped, the app reopens on the restored file. Reload = back to the last Save;
  Restore = back to that one. The branching practice: Name version at the section's start, at each try, at each keeper.
- Everything in `scores/` **is committed** except `*-work.json` and `versions/` — autosave
  has eaten a score in every previous piece and git is the only net under it. At session end
  `node tools/unsaved_check.js` lists working copies that hold edits their file does not; the AI
  asks before the commit.
- **`midi/`** — Standard MIDI exports of captures (`tools/score_to_midi.js`: one named track per lane, channel 1, no CC0 /
  CC7), for auditioning articulations in Reaper. **`bank/trill_timing_db.json`** — the trill timing table
  (`tools/trill_ingest.js`), rebuilt from the capture files; committed (RUNNING_LOG §101).

## 2. The S1 conventions the IR reads (D9 §5, proved at 0i)

The extractor (`tools/notate_section.js` → `notation/lib/extract_core.js`, classifier
`notation/lib/classify.js`) reads a save file directly. These are the properties it relies
on; the composer app writes every one of them today. **Change the app and these together,
or not at all.**

1. **Tracks are instrument-keyed.** `tracks[i] = { id, label, short, instKey }`,
   `layoutVersion: 5` (v3 = META alone at 7; v4 = one evening's three META lanes; v5 = META + the curve windows 8–10 — RUNNING_LOG §107). `instKey` names the recipe in `sandbox/instruments.js`. Part
   numbers in the IR are the track indices 0–6 (flute 0 · bass clarinet 1 · piano 2 ·
   violin 1 3 · violin 2 4 · viola 5 · cello 6).
2. **One layer convention, fixed:** sounding objects sit on layers `0 … tracks.length-1`;
   **layers ≥ `tracks.length` are the META side — 7 = META (`META_LAYER`: the gestures' shapes, the stamps), 8 / 9 / 10 =
   the curve windows A / B / C (reference curves: `waveCurve` with `curveName`; their pending dots: `curveDot` — drawing
   state, never sound; TRILLS_TOOL §3b, RUNNING_LOG §107) — and none of them ever carries `sonifyNote`.** The app's own discriminator ("a lane curve without `sonifyNote` is not
   sound") is the rule. *Pipeline note (PLAN 2a):* `classify.js` still says META = layer
   10, the tuba layout; until it derives the META layer from `tracks.length`, run
   `notate_section.js --parts 0-6` — the default `0-9` sweeps layers 7–9 into the parts (and 10 is a curve window too) and
   the classifier throws on the META shape (RUNNING_LOG §13, run C).
3. **Every sounding object carries `sonifyNote` (MIDI) and `technique`.** The technique
   key is the recipe key from `sandbox/instruments.js` — the same string is the IR event's
   `technique`. A lane object without both is not a sound (a hand-drawn shape) and must
   not sit on a sounding layer.
4. **Ids are stable and never reused:** `wc-N` / `mk-N` from the app's `nextId`, which only
   grows. The IR's derived ids are functions of these (`ev-wc-N`, `ch-<part>-wc-N`), so a
   regenerated page re-attaches the composer's authored overlays by id. The contract and its test:
   `docs/NOTATION_IDENTITY.md` · `tools/test_identity.js` (PLAN 2d.1 — undo/redo and load were found re-issuing ids, fixed 2026-09-11).
5. **Gestures carry `groupId`** on every member note, and the gesture's META shape carries
   the same `groupId` on the META layer — the app's insert-time shape.
6. **Markers live in `objects` as `{ type: 'marker', layer, time, label, … }`.** The
   extractor skips them (`--complete` does not count them). ~~`export_print` reads them for
   section marks — a section mark is a marker whose label starts with `ACT-`~~ — **NO LONGER
   TRUE (2026-09-17, D58):** the composer asked for no marks on the printed page, so that
   derivation (piece #4's) was deleted from `tools/export_print.js` rather than switched off.
   The septet's own markers (`MORPH M1 — BEATING BLOOM` 183.00 · `MORPH M2 — SPECTRAL DRIFT`
   314.00) are read by the video cut list and the app, not by the print.
7. **The real sounding length of a one-shot** comes from `bank/sample_lengths.json`
   `[technique][midi]` (seconds) — the app's `techLength` and the extractor read the same
   table. The copied table is the tuba's (`staccato` / `cuivre` / `fortepiano`, a few
   pitches); **the septet's one-shot techniques (pizz, Bartók, slap, key click, staccato …)
   need their own measured rows — PLAN 0c/0d.** Until then the extractor warns and uses the
   drawn length. **Measured 2026-09-06 (RUNNING_LOG §122):** the septet's one-shots have their rows — pizzicato, tongue_ram,
   staccato (flute), slap, stac_vel, secco, bartok_vel, gettato_vel, marcato_stac_vel, spicc_vel, harmonics — keyed by technique
   (the strings share a key across the four instruments: the mean where their registers overlap); the tuba's rows are gone. A
   technique's true range lives in the recipe's `MEASURED_RANGES` (`rangeLow / rangeHigh` measured, `zoneLow / zoneHigh` the preset's zone).
8. **The flute's instrument in hand (D6)** is not a separate field: piccolo / bass flute
   enter as techniques of the flute track's recipe (their own port/channel/range now; clef
   + transposition metadata at 0c.5), so the technique key on the note says which
   instrument is in hand. Pending CN-2 (which of the two).
9. **A curve-driven object's dynamic is its curve's height — never its velocities (D23, 2026-09-06).** For a trill zone
   (`midiModel: 'trill'`) and every later object whose loudness a curve drives (the morph events, a crescendo on a held note),
   the height of the curve it reads — the trill's `curveRef` resolved as the app resolves it: A / B / C, the lane's own curve, or the
   flat `level` — IS the dynamic: 0 = ppp, 1 = fff, between them the eight marks ppp · pp · p · mp · mf · f · ff · fff at equal
   steps of height (index = round(7 × height); a curve rising two thirds of the way is f). The velocities and CC7 values in
   `midiSnippet` are the playback rendering — 65 → 127 in the ensemble's one scale, remapped per instrument through
   `bank/velocity_remap.json` (RUNNING_LOG §115–119) — and carry no notational meaning. **The extractor writes each such object's
   dynamic range as names**, `dynamicRange: { lo: 'p', hi: 'f' }`, from the curve's lowest and highest points over the object's
   span, beside the sampled curve, so the notation can draw the curve at its true heights or redraw it at full height with the
   range named at its start (NOTATION_WORKFLOW §7). The strikes' notes (`sonifyMode: 'plain'`, `recVel`) keep
   NOTATION_STANDARDS' velocity band: their velocities are as played, the composition's own.
10. **A beating (PLAN 1f, 2026-09-07; `docs/BEATING_TOOL.md`) is a zone with `midiModel: 'beating'`** on the launching player's
    lane, carrying its partner's lane in its `beating` block: `{ partnerLayer, pitch (the pair's LOWER note, MIDI), interval
    ('unison' | 'm3' | 'M3' | 'P4' | 'P5' | 'P8' — the partner above at the JUST interval, its bend carrying the just offset; at most
    an octave apart, RUNNING_LOG §180), **srcPitch** (the note as given — the sonority's or typed; `pitch` is what sounds after the
    pair's fold by octaves as one unit, BEATING_TOOL §12), **fold** (the octaves moved, `pitch − srcPitch` in octaves), **noteIndex**
    (which note of the panel's sonority the pair holds, or null — the take's `harmony` + `voicing` name that sonority), **skip** (true =
    nobody plays it: the snippet has no events and says `skipped`),
    rateFrom, rateTo, shape | beat (the heard-rate curve: breakpoints over normalised time, beats per second — a point may carry a
    third element for the segment after it: `[cx, cy]`, a quadratic Bézier CONTROL POINT in the curve's units (the score's curve
    windows' bend, BEATING_TOOL §14), or a number, the older power slope), adsr { attackS, releaseS } (the hold shape's attack and
    release in SECONDS — the hold absorbs the length), share (how the
    beating is split between the two, 0.5 = mirrored), rate { lower, upper } (two explicit rate curves when the mirror is
    unlocked), levelLo, levelHi | levelCurve (the crescendo, 0 → 1 = ppp → fff: one curve, or `{ lower, upper }` — one per player,
    2026-09-07), breath { mode: 'one' | 'continuous' | 'designated', seed, marks { lower, upper } (hand-placed marks, seconds), deal,
    phase (0 = unison breaths, 0.5 = staggered) }, slide { lower, upper } (seconds), noteIs ('lower' | 'upper': the note given is the
    pair's upper note — the fourth ↔ fifth inversion), launchedFrom (a record of the strike note it was born on — no link) }`. A pair
    may have **no note yet** (`pitch: null`, born empty in the panel): it makes no sound and is skipped at insert. **Its sounding notes are never loose score objects:** they are generated at every play
    start (`BeatingCalc.renderPair` in `score/public/beating_calc.js`) and embedded as the zone's `midiSnippet` — per player one
    sustained note per breath (`notes` events, the partner's with their own `port` / `channel`), each with a bend stream (`_bend`
    events, 14-bit through the recipe's measured `bendRangeSt`) and a level stream (`_cc: 7` through the remap). **The extractor at
    2a reads the block, not the snippet:** the two parts (the zone's layer and `partnerLayer`), the two written pitches (`pitch` and
    `pitch` + the interval's semitones), which player has the upper note (`renderPair(...).players`), the beat rate over the span
    (`.beat`), each player's cents over time (`.samples[].centsL / centsU`), the breaths (`.breaths.lower / upper.spans`) and the
    level (the curve height IS the dynamic, item 9). **A pattern is a group** (item 5): its beatings and a META shape share a
    `groupId` of the form `grp-beating-<t×10>-<n>`, the shape's contour the crescendo's mean across the pattern. **The panel's takes**
    (`bank/panel_snapshots.json`): the `beatings` bucket holds a sequence — `{ length, seqSpan, harmony, voicing, rows: [{ layer, offset,
    length, locked, levelLock, mute, solo, scale, b }] }` — the `beatingPairs` bucket one pair's settings — `{ layer, length, locked,
    levelLock, scale, b }` — and the `beatingShapes` bucket a shape — `{ curve (normalised, its maximum 1, slopes kept), from }` — all
    2026-09-07. The notation form
    (phase 2a): two curves per part — the glissando above, the crescendo below — the two written pitches at least a quarter tone
    apart, a go line at every breath, the beat rate at both ends of the glissando (the tuba's MORPH_NOTATION; BEATING_TOOL §10).

11. **A morph note (the tuba's morph panel on the septet, 2026-09-07; RUNNING_LOG §204)** is an ordinary sounding `waveCurve` —
    `sonifyNote` the played key, `technique` the player's ordinary voice (the recipe key), the level curve in 0–10 — plus `morphBend`
    (note-relative `[[dtSec, cents], …]` against the key; the tick sends it through the instrument's measured `bendRangeSt`) and
    `morphFlags`; a morph is a group `grp-morph-NN` with a marker `MORPH …` on layer 0 and a META contour on `META_LAYER`; the cast
    (which lanes, the pitches folded per pair) lives in the panel's params (`lanes`, `source`) and in an ACTUAL as saved. The
    extractor at 2a reads `morphBend` (the tuba's `tools/notate_morph.js`).
    **The pitch source (RUNNING_LOG §208):** a kept sonority lives in `bank/panel_snapshots.json` under the `morphPitches` bucket —
    `{ state: { notes (MIDI), from, take, k, seed, perPair }, comment }` — and the starters in `bank/morph_pitches.json` (`sets[]`, the
    same fields plus `name`); the panel's own state (the source chosen, the root, the take) is the browser's, never the score's.
    **An ACTUAL (§213):** `bank/actuals/ACT-<MODEL>-NN.json` — `{ entity, label, tags, spanSec, parts, register, objects (the placed
    form, t = 0), notes (the render), provenance: { model, recipeSettings, resolvedParams (the cast included: source, lanes, voices),
    seed, shapePreset?, palette (per voice: lane, label, technique, reachCents, lo, hi), pairs (the cast), pitch (the pitch source's
    state), engineConstants, captured, rebuilt? }, placements }` — rendered on the server with the cast's palette
    (`tools/model_bank.js renderOptsFor`); `node tools/model_bank.js --rebuild` re-renders every actual from its provenance.

12. **A piano harmonic (PLAN 1i, the first pass, 2026-09-08; RUNNING_LOG §217–218; CN-40)** is an ordinary sounding `waveCurve` on the
    piano lane at `technique: 'harmonics'` (the IRCAM Prepared Piano 2 preparation on channel 3, keys 21–77): `sonifyNote` the KEY
    struck (the string), a flat two-node level curve, `groupId` the morph's (`grp-morph-NN` — the note travels with the morph's
    META shape), and `properties.pianoHarmonics` its provenance: `{ of (the morph's group), pass ('unshifted'), octave (0 = the
    harmonic sounds at the player's pitch, 1 = an octave above), srcId · srcLane · srcMidi · srcCents (the re-breath it answers: the
    player's note, its key and the bend's first point), string, partial (2 — the sampled octave harmonic), sounds (= the key + 12),
    detuneCents (the piano's sound minus the player's pitch; + = the piano sharp), fold (octaves moved to reach a key), merged (the
    re-breaths that landed on the same key within 30 ms) }`. Generated by `score/public/piano_harmonics.js` (pure) from the placed
    morph's notes (every note's start is a re-breath; its pitch the key plus `morphBend[0]`); a re-run replaces the morph's earlier
    ones (found by `properties.pianoHarmonics.of`); never read back as a re-breath. The extractor at 2a reads the string, the partial
    and the sounding pitch from the provenance (the notation of a piano harmonic: the string, the node, the sound). The second pass
    (PLAN 1i item 2) adds the CC21 partial shift: `pass: 'shifted'`, `partial` > 2, the CC21 value and its lead.

13. **A cue line, and a note born of one (PLAN 1j, 2026-09-08; RUNNING_LOG §229–233; CN-43)** is a `waveCurve` on the piano lane in the
    morph's group (`grp-morph-NN`) carrying `properties.cue = { kind ('onset' | 'peak' | 'end'), of (the morph's group), srcId · srcLane
    · srcMidi · srcCents · srcPitch (the source note, its player, its key and the bend at that instant, the pitch as a float), level
    (the source's level there, 0–10), t (the moment) }`. **A line** has `sonifyNote: null`, a nominal span of 0.05 s, a flat two-node
    curve at the stored height 5 (mf, the picker's start), the source player's colour and `performanceNotes` "cue ● …"; it is silent
    and invisible to the extractor and every note filter (a shape without a sound note, the tuba lineage's rule), drawn as a thin line
    the lane's height with a head by kind (● onset · ◆ peak · ○ end, the line dashed for an end), hidden by the piano lane's bar when
    its kind or its player is unticked — a view state of the browser's, never the file's. **A note born of a line** is the same object
    with `sonifyNote`, `technique` (main · muted · harmonics · plucked), the flat curve at the dynamic's height (ppp … fff = 0 … 10 in
    eight equal steps, §2.9) and `endSeconds` = the start + the duration, `cue` kept — the notation at 2a may say whose moment it
    answers. Made by `PianoCues.cueToNote` (the picker card; `Composer.cueToNote`); *lines → piano* run again replaces the lines still
    without a pitch, never a note, and gives no fresh line for a moment whose note is made.

14. **A crescendo (PLAN 1l, 2026-09-08; RUNNING_LOG §252–262; CN-48; `docs/CRESCENDO.md`)** is an ordinary held note whose curve
    rises — a `waveCurve` with a `sonifyNote`, two nodes (the dynamic range, ppp … fff on the 0–10 scale of §2.9) and ONE segment
    whose `model` and `slope` carry the shape (surge `exponential` 0.40 at 5× · bloom `logarithmic` −0.29 · line `power` 0, his own
    ladder) — at the player's ordinary voice, drawn `fillMode: "bottom"` in the morph orange `#C2410C` at 0.45 opacity. Its
    provenance is `properties.cresc = { shape, ratio, slope, threshold, dynLo, dynHi, end ("toNextNote" | "fallback" | "manual"),
    gapTo, endGapS, peak ("cliff") }`. **No new object type:** the tick plays it as any held note (1g item 5 — the velocity from the
    curve's top, CC7 following the height), the extractor reads it, and drag, stretch, delete, undo and save need no case. It is
    EDITED the curve-lane way (the line dragged to bend, no slope diamond). Made by `score/public/cresc.js`; the notation at 2a reads
    the family and the range from the provenance.

15. **The spacing rule (PLAN 1l step 3; §256, §260)** is not a field but a law the tools obey: **a player is free 150 ms after its
    last sound ENDS**, and **the rest applies between gestures, never inside one** — two notes sharing a `groupId` (a morph's
    `grp-morph-NN`, a beating's zone, a strike's group) are one continuous sound. `score/public/spacing.js` is the one place it
    lives; anything that places sound asks it rather than counting for itself.

16. **`mutedBy` on a note now has two authors (PLAN 1m, 2026-09-08; RUNNING_LOG §277, §284).** It was the trill's stamp: a note whose
    start falls under a trill is greyed, silent and kept. A **crescendo made from a note by the C key stamps its own id there** for
    exactly the same reason — the note is the crescendo's origin, so it must not sound twice, and it must come back untouched when
    the crescendo is deleted. The stamp is therefore **read live, never trusted blind**: `Composer.mutedByLive(o)` asks whether the
    object named by `o.mutedBy` is still in the score, so deleting either author un-greys the note by itself. Downstream (the tick,
    the renderer, the end rule, the IR) a note with a LIVE `mutedBy` is silent and drawn faint at 0.15.

17. **A crescendo dealt by the harmony bar (PLAN 1m step 3)** carries one more block of provenance:
    `properties.cresc.fromHarmony = { src, from, raw, fold, order, seed, lap }` — the pitch menu value it came from, that source's
    own name, the sonority's pitch **before** the octave fold, how many octaves it moved, and the deck's order, seed and lap. The
    performance note repeats the fold in words (*F2 folded +1 8ve*). **The bar's own state is NOT in the file** — the chosen
    sonority, order and seed live in `localStorage` under `septet.crescBar.v1`, the piano lines bar's convention: a working setting
    of this browser, not a fact about the piece.


18. **A FILL (PLAN 1n, 2026-09-08; RUNNING_LOG §285–300; CN-54 · CN-55; `docs/STRIKES_TOOL.md` §Y)** is a pass of LONGS laid over a
    strike pattern — one per attack, each in ANOTHER instrument — written as **its own group `grp-fill-<strike index>-<t×10>`** with a
    META shape, never into the strike group (sharing it would let the gesture clause stop a player's own attacks from blocking its long,
    and the room rule would collapse). A long is an ordinary object of its kind: a crescendo is 1l's `waveCurve` (entry 14), a trill is
    the trill tool's zone — no new type. Its provenance is `properties.cresc.fill` on a crescendo and `zone.fill` on a trill:
    `{ attackId, launchedBy, cutBy, from, pitch, kind }`, where **`launchedBy` and `cutBy` each hold the ID OF AN ATTACK** (never a
    position), so either end can be re-pointed at any other attack; `from` is the strike group filled; and `pitch` is
    `{ family, source, raw, fold, order, seed, lap }`, the shape 1m's `fromHarmony` already uses.
    **`pinned: true`** on a long means he has edited it by hand: a re-Generate leaves it alone and still counts it as occupying its
    player — 1k's own idiom (*pinned and flagged, never lowered*), reused rather than reinvented.


19. **A SWELL STRIKE (PLAN 1o, 2026-09-08; RUNNING_LOG §301–310; CN-48 · CN-56; `docs/STRIKES_TOOL.md` §Z)** is what the strikes drawer
    deals when its SOUND SWITCH is set to *crescendo* instead of *attack*: the dealt notes themselves are 1l crescendos (entry 14) rather
    than short notes — **no accent, so the drawer's rhythm becomes a schedule of ENTRIES rather than a pulse**. A pass is written as its
    own group **`grp-swell-<ch|nt>-<strike index>-<t×10>`** with a META shape, replacing an earlier pass of the same rhythm at the same
    time. Each crescendo carries `properties.cresc.swell = { from, mode, lengthMode, lengthMul, onMs }`, and `properties.cresc.end` is
    `"swell"`. **The length is a MULTIPLE OF THE LOCAL GAP** of the rhythm, capped so it can never run into that player's own next dealt
    note (0.17 s before it) and floored at 1l's `minS`; the multiplier is also the density dial, and the drawer's readout gives the
    measured voices sounding and how many entries could not be met.

20. **TIME CONTAINERS (PLAN 1o step 2; `score/public/time_containers.js`)** are a rhythm, not a score object: a rolled sequence of
    durations from **a POOL** (numbers · optional weights, where a typed weight stands and the rest share what is left · a `unit` in
    seconds) **× an ORDER** (`stick`, `jump`) **× a CONTOUR** (`grow` · `shrink` · `openClose` · `closeOpen`, with `turn`, `bow`, `depth`),
    seeded, filling a total and **stopping short with the shortfall reported**. They live in the drawer's own `shape` menu, so they serve
    attacks and swells, notes and chords alike, and the settings ride in the drawer's config (`cfg.ct`) and its takes — not in the score.
    **The module is deliberately standalone** at his ask, knowing nothing of the drawer or the score, so the next piece can take it whole.

## 3. Not S1's business (where the piece-specific work goes)

- **Technique → notation class** is registry data + classifier rules
  (`notation/registry/classes.json`, `classify.js`) — the tuba vocabulary today (`ord`,
  `staccato`, `cuivre`, `fortepiano`, morph). Every septet key (pizz, arco, bartok, flz,
  slap, …) throws "no rule claims object" by design (CL-5, never a silent unknown). That is
  PLAN 2a's first job: a per-instrument technique → class map, data not code.
- **Part labels** in the notation app are still T1–T10; 2a takes them from
  `tracks[].short`.
