# PROJECT JOURNAL — septet LGMF 2026 (the Lake George septet)

> One file. Seven sections. Everything important lives here.
> §2 is read at every session start — keep it ~40 lines; trim old sessions to one line each.
> The lab journal (`RUNNING_LOG.md`) is the raw trail underneath; this is the curated state.

---

## §1 Quick-Start

- **The piece:** english horn + bassoon · horn + trumpet · cello + double bass · percussion
  (D1) — three pairs and a percussionist, for the **Lake George Music Festival 2026 call**.
  **The call is unread at the composer's word** — deadline, duration cap, score format unknown.
- **Lineage:** composition #6. Follows #5 `septet_2026` (the Tempus septet, submission
  complete 2026-09-17), which was ported from #4 `for_seven_tubas`.
- **The stack:** piece #5's, by copy-forward, palette rewritten (D3) — **ported 2026-09-17 and
  running** (0b · 0g · 0i; RUNNING_LOG §12–§18). Same delivery format as #4 and #5 (D2).
  `node score/server.js` → **:5400**/composer.html · `node sandbox/serve.js` → **:4900**.
  **It does not sound yet** — placeholder recipes, no rack (0c + 0e, next).
- **Libraries (D6):** SI2 bassoon · horn · trumpet — Xsample cello (#5's recipe, carried whole,
  the only one ever heard) + double bass — Spitfire ARO percussion — english horn being
  acquired — a bowed vibraphone still to acquire.
- **Phases (#5's shape):** 0 setup → 1 compose → 2 notate (2a engine · 2b presentation
  score) → 3 performance score → 4 submission.
- **The sketch pad** `docs/COMPOSITION_NOTES.md` opens with **LG-1 … LG-8**, the eight Lake
  George notes he made while writing piece #5, verbatim: pairs · delicate and quiet ·
  animated conductions · multitempo pointillism · a rondo with the morph as refrain · the
  pattern / thinning tool · a counterpoint of timbres after Sciarrino · morph to a held beating.
- **Reference repos** (read-only, additional working dirs): #5 · #4 · #3 · #2 · #1. #3 was
  attached mid-session 2026-09-17 by a folder request — it holds the extracted sampler
  manuals; if a later session does not list it, request it again. Consult per named question only.
  **#5 has the composer's own uncommitted files — never touch anything there.**

### Where the record of the last port lives (all in `C:\Users\jwloy\GitHub\septet_2026`)

- `docs/RUNNING_LOG.md` §1–§13 — the port as it happened: §2 the coupling survey · §3 his
  plan in his words · §4 what was rejected · §7 the kit · **§9 PLAN 0b, the composer
  module** · §10 the day-one stub · **§12 PLAN 0g, the notation/IR stack** · §13 PLAN 0i.
- `docs/PROJECT_JOURNAL.md` §1 "Map of piece #4 — what the port inherits" · §4 D1 · D2 · D3 ·
  D5 · D9.
- `docs/PLAN.md` § 0 — the item list 0a–0k, each with its why.
- This repo's `RUNNING_LOG.md` §2 is the digest of all three.

---

## §2 Resume Here

**FIRST — HIS STANDING RULE (2026-09-11, carried from #5):** after `/clear` + `/postclear`:
play back, then **STOP and ask**. No edits, no builds, no tool calls beyond the resume
reads. Start only on his word. *(At `/session-start`: orient, agree the agenda, then work.)*

### RUNNING ORDER (2026-09-28, the second) — NOTATED THROUGH THE FIRST MORPH, 0 → 279 s (his ask at 2l.6, RUNNING_LOG §527 · §528: *"the goal being completely notated until the end of the first morph"*)

**HOW THIS LIST WORKS:** one step at a time — ► marks the active step, ☑ marks done; update the marks the moment a step wraps, not later. At
every wrap the AI states: what finished · what's next · where we are in the order. The AI proposes reorganizations when useful; changes
land only on user approval. A post-clear model reads this block and announces the position before doing anything.

**What the fold is (his question, §528):** a PROTO is a one-part test page cut from the draft (`lgmf-eh-proto` the sequence's curve, `lgmf-hn-morph-proto` the morph);
the MAIN PAGE `piece-lgmf` is the whole piece. 2l changed the code and redrew the two protos only; the main page was last drawn at 2j — its sequence curves are the old trace,
its morph 151 … 279 s is 115 plain notes. THE FOLD = the extractor rerun on Draft 01 with every accepted device: the new curves on the six parts of the four
sequences AND the morph device (block · gliss line · arc · the vibraphone's bows) on every part of the three morphs — ONE step. The first morph ends at 279.4 s
(the horn's own part at 269.9).

1. ☑ **The ottava fix** — DONE 2026-09-28 (§528: `objects.ottava.hookIsInk`, the head and its column moved left by `endBeside`, the hook on the spacer; `check_rules` 30, the bite proven; the shield the two pages; no re-extraction, he reloads). *(As it stood:)* **The ottava fix** (Fable) — his finding (§527, verbatim): *"the ottava bracket should have a gap before the go line, and looks like the whole column needs to
   move left, I believe this happens several times, make sure in the rules"* — a rules row on `objects.ottava`, the block's head and its column moved left so the
   hook ends at anchor B's spacer, `check_rules` holding it over every page, the two protos redrawn. Done when: the row is in, the protos redrawn, the checks
   green, pushed.
2. ☑ **The fold** — DONE 2026-09-28 (Opus, §530; `piece-lgmf` from Draft 01 with `--sequence` × 4 + `--morph` × 3: 72 overlays, 151 … 280 s now 71 morph notes + 44 bows; every check green; §529 the breath pie's arc fixed on the way — the screen gate's one failure, on HEAD too). *(As it stood:)* **The fold** — PLAN 2l.7 (Opus; a model switch — checkpoint, clear, `/postclear` on Opus, then build): `piece-lgmf` redrawn from a COPY of Draft 01 with `--sequence` × 4 + `--morph` × 3 (2j's discipline) — the new curves, the
   morph device on every part, "ord." at 289 s; the shield naming `piece-lgmf` alone; `check_rules` · `decisions_needed --ir piece-lgmf` · the edges. Done
   when: pushed, his tab reloaded.
3. ► **SECTION 2, ALL OF IT, BY HAND — session 18 went on from the long tone to every part (the block SESSION 19 OPENS ON THIS); ► HIS EYE on section 2, part by part.** *(As it stood, the long tone alone:)* **2m THE LONG TONE — SECTION 2's note unit** — **2m.1 … 2m.3 BUILT 2026-09-29 (Opus, §532 … §534; `piece-lgmf` carries 120 long tones in 36 groups, every gate green). ► 2m.4 HIS EYE:** reload the notation tab (no restart) → `piece-lgmf` → the video view → `303.5` (the first chord, four players) · `312.98` (the EH's v16 — `pp`) · `328.24` (six players) · `331.38` · `333.36` (the EH's low F3 on three ledgers — the name ABOVE the staff, the chain's side-with-room rule) · `361.04` · `370.34` (six) · `367.98` (the trumpet's single — still the old look, the tuba `ord`'s go line) · `383.35` (the EH's single — still the family look) · `407.05` (13 s, three players, into the sequence-2 entries at 427) · `z`. *(As it stood:)* (his pivot 2026-09-29, §531: *"let's address section two, one notation type at a time"*; PLAN § `2m`) — Opus
   builds 2m.1 → 2m.3 (the rule rows · `--longTones` · `piece-lgmf` re-extracted), one commit each, THE SHIELD in each; STOP for 2m.4 his eye (`303.5` · `312.98` ·
   `370.34` · `407.05`). Done when: 2m.3 pushed and his word at 2m.4.
4. **His eye on the main page, 0 → 279** (Fable; HELD at his pivot, still his) — reload the notation tab → `piece-lgmf` → the video view. THE STOPS: `-4` … `6` the six sequence entries (the fade from nothing, eased) · `40.26` (2j.4's) · `102.3` (the Vc breath the ladder flips) · `140` … `156` the sequence's closes `> ppp` · `151.35` · `152.1` · `152.78` · `156.4` · `156.9` · `158.4` the six morph blocks · `200` the arcs' peaks · `222.6` · `226.4` the vibraphone's two open hairpins · `265` … `279` the ends (`> ppp` on Hn · Tpt only; EH · Bsn · Vc · Db no fall, §530) · `z`. What he sees: the six sequence lines · the five other parts' morph pages (EH · Bsn · Tpt · Vc · Db: the block, the gliss line, the
   arc) · the vibraphone's bows in the morph (the first order's 5) · 2j.4's `40.26`. Collect in the RUNNING_LOG, then fix at once (a look → Fable; a fault →
   Opus). Done when: his word.
5. **His call, inside the range:** 2a.6 the clefs by register (Bsn · Vc · Db) · the orange pitch line's corners (the same ease as the green line, held at §513 D) ·
   2k's AI's calls (the first order's 7). Done when: each named yes or no.
— beyond 279, not in this order: the middle section (the percussion staff, the patterns, the "ord." entries — the first order's 6 — come with the fold, proofed later).

### SECTION 2 — HIS TODO (verbatim, 2026-09-29, RUNNING_LOG §535) — NOT PLANNED, NO ANALYSIS at his word

*"please take some verbatim notes/todo for sec 2, no need for analysis at this time"* — his list, in his order:

1. *"normalize long tone chords"*
2. *"temporal phrases/fast notation in eh"*
3. *"fast clusters in rest"*
4. *"percussion notation"*
5. *"temporal notation: how to show duration for short notes, for longer notes, use/not use tuplets, define their purpose in temporal notation"*
6. *"actual name for temporal notation and research/references"*
7. *"how much of ferneyhough like detail"*
8. *"decide on glyph vocabulary and make them"*
9. *"purpose/ use of gc"*

Each item goes through the planning method (`/plan-item`) when he picks it up; none is ordered or scoped yet.

**Items 5 · 6 OPENED 2026-09-29 (Fable) as a RESEARCH PROJECT — `docs/research/temporal_notation.md`** (LG-120 · RUNNING_LOG §536 …
§539): the term kept ("temporal notation", defined once as horizontal distance = time) · the reference scores (his R1 … R4, the AI's
S1 … S10 to confirm) · the concepts about short notes C1 … C9 · six questions · §5 the EH's decisions, empty. ► THE TALK, one concept
at a time (phase 1), then the practical decisions for the EH's section 2. 2m.4 his eye still stands.
**§6 THE DISSECTION (§540 · §541):** the frame (placement · span · shape · flow + moments; where the clock lives; Karkoschka's kinds) ·
the precedents dissected (preliminary research, kept) · his models M1 … M3 · **THE PHRASE IN LAYERS — anchor · shape · flow · moments —
HIS WORD: the starting conceptual framework**, §6c-plain the plain-words version. **HELD at his word: the first design choice** (both
carriers vs the anchor alone) — he addresses it after the plain version is digested. **§7 FLOW EXPANDED (§542, LG-122):** the count an
address space · learning vs cueing · Peirce's symbol / icon / index (the GC accel) · THE REHEARSAL MODEL and animation in two modes ·
multitasking = independent streams, a gesture fuses them · layer 3 = the line · the motion · the model. His to answer, not urgent:
is the model part of what the score delivers. **§8 THE WORKING MODEL (§543, LG-123):** §7's conclusion for the performers · THE SCORE IS
A PICTURE OF THE SOUND · **W1 = proportional + TN details, "Ferneyhough without the count"** (top of mind, not settled) · the
viability test V1 … V8 for a local performance animation (the sul pont arc) · the alternatives A1 … A6 per phrase type · THE CURSOR
WINDOW (the GC cues, the line suppressed for the phrase's span — Lutosławski's conductor). His to answer: the window's scope. HELD:
values written or not. **§10 FRAMEWORK DECISIONS T1 … T7 (§545, LG-125):** A1 THE DEFAULT, the menu on the device sheet (PLANNING_METHOD
line 1a) · the viability test standing · tuplets a NOTCH OF SPEED · THE INTENTION — energy and flow with detail, the failure casualness
not imprecision (PERFORMANCE_NOTES #16 · #17). §9 H1 the intensity curve held. **LEFT IN THE CONCEPTUAL TALK:** values written or not
(leans written-as-pace) · the GC's purpose (TODO 9) + the window's scope · a short note's duration (TODO 5) · the burst (TODO 3, A4 / A5) ·
the glyph vocabulary (TODO 8) + H1 · how much detail (TODO 7 — mostly answered by W1 + T7) · the model as a deliverable (the performers).
**THEN THE PRACTICAL for the EH's section 2:** Q1's measurement · the device sheet for "the phrase" · the fit (values + brackets from the
draft's timing) · the per-note detail · the window if wanted.
**THE SURVEY (§546, LG-126):** the framework re-organized as an INSTRUMENT, not rules — `docs/research/sound_to_notation_survey.md` v0: eight
scales A … H (the unit · the intention · time · motion · moments · sign and carrier · the picture · the model), a profile of leanings, his
single-note case worked. Before the device sheet. ► HIS TO REFINE in future sessions; the "left" list above is now the survey's items.
**THE PRACTICAL BEGUN — §547 (2026-09-29, Fable), at his word:** the EH's first 25 notes of section 2 (289 … 302 s) drawn as THE PLAIN
NOTE — `byEnv.plainNote`, a filled head with a plain stem ON its time, no go line, the band name on the dynamic row (his (b)); the
extractor's `--plainNotes 0:288:303` in `piece-lgmf`'s build; `check_rules` 32; the shield `piece-lgmf` alone; the ladder the fold's 7.
► HIS EYE: reload the notation tab (no restart) → `piece-lgmf` → the video view → `289` · `291.4` · `295.5` · `301.5`. The AI's
calls, his to reverse (§547): a name on EVERY note (vs only where the band changes) · the stem by the house rule · anchor A.
**THE FIRST NOTE THROUGH THE SURVEY → HIS DECISION T8 → THE OPENING FIGURE DRAWN BY HAND (§548 … §550, 2026-09-29, Fable):** the survey's
second run (§548 — the end of a single held note the one missing thing; the lean the bar) met his decision (LG-128, T8: VALUES WRITTEN,
the TN way — flags and beams, relative, no bar or meter; the duration line "incongruous" here); the figure decided note by note (LG-129,
§549: p1 a quarter · an eighth rest midway · the grace the classical way · p3 · p4 flagged eighths · p5 … p8 beamed 16ths — BESPOKE,
hands not rules); BUILT here at his word (§550): the grace note (`graceHead` · `graceSlash` · `slur` — two new drawn kinds), the free
rest, `--hand` · `--rest` in the extractor; `piece-lgmf` re-extracted; `check_rules` 32 · the shield `piece-lgmf` alone · the screen
gate PASS. ► HIS EYE: reload the tab → `piece-lgmf` → `289` · `290.5` · `291.4` · `292.8`. THEN THE SECOND LAYER at his word —
dynamics · hairpins · slurs · accents, as hands on the same notes. Held: the survey's new item (the neighbours' system), his refine.

### SECTION 2 — THE NOTATION PLANNINGS (his todos for session 19, organized 2026-09-29 — RUNNING_LOG §551 · §552; LG-130 · LG-131)

**HOW:** each through the planning method (`docs/PLANNING_METHOD.md`), ONE AT A TIME at his order — phase 1 (state and restate; the data first) →
the top line → the steps → into PLAN. Fable for the talk; a build on Opus or here at his word. **STATE AT CHECKPOINT #5 (2026-09-29):** N-1
slurs BUILT (§555 · §560) · N-2 stems DECIDED for the section's plain notes (§553 … §561; the generalization list open) · N-3 the uneven
group BUILT, his sign (§557 … §562) · N-4 the shown beat BUILT on figure 2 (§563 … §571; the phase his eye owed) · N-5 held · N-6 begun
on figure 1 (§559).

- **N-1 · SLURS — a standard, "so most slurs look good everywhere"** (LG-130). The data (§551): his LilyPond 2.24.4 — height 0.25 × length
  capped at 2 ss · minimum length 1.5 · tapered 1.2 → 0.8 · the side with the stems · the ends and collisions from `default-slur-details`
  (to read at the build); v1 (§550) is centre-to-centre with a fixed 1 ss bulge — why the grace's looks odd. **HIS ANSWERS OWED:** LilyPond's
  slur + Gould's ends (at the heads on the head side, at the stem tips on the stem side) as the standard? · which slurs the piece draws
  (the grace's · the phrase slurs of the second layer · ties?). Then the requirements: side · ends · height by length · taper · clearance
  (accidentals, ledgers, flags, beams) · the edge class of a long slur (a LONG kind) · the ladder. **HIS ANSWERS (LG-133) AND BUILT (§555):**
  LilyPond's slur (his install's numbers) with Gould's ends, the side with the stems; the grace's and the phrase slurs, maybe others, no
  ties. A long kind, cut · never-sever; the screen gate PASS; the grace's slur 0.48 ss high. Not enforced yet: the slope limit, the
  accidental and dynamic collisions, the staff-line gaps — the rest of N-1 when a phrase slur asks for it.
- **N-2 · STEM LENGTHS — "surface and revise all stem length rules, w/beams w/flags"** (LG-130). The data (§551): the code — 3.5 everywhere,
  to the middle line from outside the staff, the flag-clear law (0.38 ss) only where a device asks (the tuba's staccato · strike), the
  §550 flags without it; LilyPond — quarter · 8th · 16th all 3.5, 32nd 4.25, beamed 3.26 · 3.5 · 3.6 with minimum free 1.83 · 1.5 · 1.25,
  forced-direction shortening 1.0 · 0.5 · 0.25, beam thickness 0.48 (ours 0.4). **HIS ANSWERS OWED:** which drawn stems looked wrong (p3's
  flag inside the staff · p4's long stem to the middle line · p1's quarter) · the flag-clear law as the house rule for every flagged note,
  its exceptions named, over LilyPond's plain 3.5? **HIS ANSWERS (LG-132, §553, 2026-09-29):** longer stems in general; the flag's near edge
  clears the outer line by some space, both directions, flags and beams, for this snippet and the section — APPLIED: `byEnv.plainNote
  nhStemRule 'flagClear'`, the grace exempt (p3 now 9.25 ss, p4 6.54); not everything ironed out now — TO GENERALIZE at the item's top line:
  the fallback when additional notation at the stem's end does not fit (the chain lifts, exists) · a MAX so a far note is not stretched (p3
  the case; the AI's 7 ss proposed) · the quarter's standard "a little longer" with a logic — the AI's proposal a NINTH, 4.0 ss, the tip on
  a line or space (LilyPond's own lengthening to 4.25 · 5.0 the precedent); his pick 4.0 · 4.25 · 4.5 owed · the beam's clearance the same
  law · the forced-direction shortening · the minimum free length under a beam · the ladder's lane test. **§554 (his "Let me see c … your
  flag proposal good"):** 4.5 APPLIED to see (`objects.stem.lengthLongSs` → `byEnv.plainNote.stemLenSs`; the tuba pages keep 3.5) and THE MAX 7
  APPLIED (`objects.flag.clearMaxSs` → `flagClearMaxSs`): p1 4.5 · p4 6.54 · p3 falls back to 4.5, its flag inside the staff. CONFIRMED 4.5
  at his word (§556, "4.5 to see and confirm"); the grace's stem grows with the base (3.18) — for the list.
- **N-3 · THE LAST FOUR 16THS — "they belong to the same phrase, relatively fast but slightly uneven"** (LG-131): the survey run on p5 … p8
  (spaced 0.445 · 0.345 · 0.235 s — an accelerando the equal beam does not show, the space does); the candidates to weigh: the beam as
  drawn (space carries the unevenness) · a bracket as a notch of speed (T6) · a feathered beam (an accel written) · the gesture-glyph (A4) ·
  the shown beat (A7). **TALKED AND BUILT 2026-09-29 (§557; LG-134 · LG-135):** the proposals (a feathered beam the AI's lean) met HIS SIGN —
  the heads stemless where played, a beam floating on the stem side on 1 ss stubs, a squiggle through the first = "about a 16th, unevenly"
  (PERFORMANCE_NOTES #18); built as a hand `beamStub` on a `--beam` group's members, the squiggle a new drawn kind; the screen gate PASS.
  **§558 at his eye (LG-136):** the stubs 1.5 ss beyond the beam stack whatever the beam count · the beam the group's width (the first stub
  at the first head's left edge, the last at the last head's right edge) · the stroke longer, across the corner, hand-drawn · the rest to 290.2.
  **§559 (LG-137):** the stubs 2 ss · the stroke turned (falling) and 25% longer · a QUARTER rest · THE SECOND LAYER BEGUN by hand: p1 pp + a
  cresc hairpin to 289.25 (a new hand `hairpinTo`) · p3 and p6 accents (p6's on the head side by `articSide`) · p5 mp · the other names off.
  ► His eye: reload → `piece-lgmf` → `289` · `290.2` · `292.8`. **§560 (LG-138):** the sign KEPT as a device (his wording in PN #18) ·
  the slur in the vertical clearance (the marks under a slur 0.8 clear) · THE STANDARDS S1 … S12 in `temporal_notation.md` §12, surfaced at
  the next similar notation (CLAUDE.md READ FIRST) · THE LOCK `tools/eh_figure_check.js` GREEN. His page showed a stale `layout.js` — a HARD
  reload; if the stroke still rises or p4 is short after it, a fault to find. **§561 (LG-139):** p3's flag was the §554 max at work, not a
  reversion — the max raised to 9.5 at his word (p3's 9.25 just under; the AI's head-distance measure tried and dropped) · the stroke centred on
  the beam stack (equal juts) · THE SECTION'S WORD 0.45 above its note's top ink, never under 1 ss above the staff (was the tempo row + 1.4);
  the lock 27 GREEN. **§562 (LG-140):** the stroke slid 0.6 ss along its perpendicular into the beams and the stub.
- **N-4 · THE SHOWN BEAT (A7) — "the good one in certain parts here … I'd like to develop it"** (LG-130 · LG-131): the tuba piece's bouncing
  ball marking a steady tempo on the pole / the cursor; the onsets as go lines (one version) or as heads with count-accurate values and
  tuplets; the beat shown, the system counts, the rhythm felt by space. TO WORK OUT: **a method for a compatible tempo / time signature**
  (*"how?"* — the AI's seed: the grid unit whose multiples land on the figure's onsets within a tolerance, searched over a range, as the tuba
  pages' `--cluster` fitter did per cluster; the signature from the figure's length in units) · where it applies ("certain parts") · the
  viability test V1 … V8 on the ball · a device sheet (line 1a: A7). He wants it BUILT as an option to see. **§563 (LG-141): the tempo
  method begun on the second figure (295.45 … 297.3) — `tools/tempo_fit.js`, three methods (phase coherence · the grid fit · the IOI); the
  finding one family, a beat of ≈ 0.32 s (185 … 190 bpm), the first note an upbeat; three grids shown him as a picture, his pick owed.**
  **§564 (LG-142): THE PROCESS decided — candidates, his eye, his pick and phase, recorded as a `--beatGrid` hand; HIS PICK for the second
  figure B shifted a 16th (a 16th of 0.108, the beat every 3 from 295.348); THE TICKS on the page from the tuba's look (`beatGrid` overlay,
  the tick row, beats full · subdivisions 0.4); the lock 29. **§565 HIS TEMPLATE (LG-143): the duration line's blue-grey at 0.3, hung from
  the lane's top edge, the main beats only, 0.4 ss — applied; **§566 (LG-144): then as LINES through the staff, 0.4 beyond each outer line.**
  **§567 (LG-145): the span two beats after · about two seconds before, rounded out (16 lines 293.08 … 297.94); THE BOUNCING BALL — the
  tuba's GC ball in the lines' colour at 0.3, one per beat, in flight only over the grid (`beatBall`, a new animated kind); the lock 30;
  the screen gate PASS with the balls.** **§568 (LG-146): the ball lands at the LANE'S BOTTOM (the tuba's); HELD: the grid's clamp to its
  cluster (three beats before, two after, never past a neighbour's note); A MAX TEMPO — 185 bpm here is far too fast; the AI's proposal a
  provisional 120 and THE GROUPING RULE (the shown beat = the smallest multiple of the unit ≤ the max → 6 units = 93 bpm here); his pick
  owed: the grouping on the lines and the ball together, or the ball alone.** **§569 (LG-147): ONE LINE PER BEAT — the device an
  orientation aid beside the cursor, not a tempo; 93 here (6 units); the max a soft 110 per figure (`gridMaxBpm`; the tool proposes the
  grouping); the grid FITTED to its cluster with the clamps (`--beatGridFit`: 3 before · 2 after · 0.1 s clear of the neighbours — here 2
  before, the third would cross the first figure): 8 lines 294.052 … 298.588, 8 balls. ► His eye (play from 293.5).** **§570 (LG-148): the
  max 100; the ball from the line's top to its bottom (the tuba's spans the lane — told him); PERFORMANCE_NOTES #19 — the shown beat an
  aid to onset accuracy, the head's left edge the time, just left of a line = just before the beat.** **§571 (LG-149): one line before; the
  ball from 2 ss higher; HIS CONCEPT — the beats BETWEEN the notes (the beat orients, is not played on) — the phase a quarter beat earlier
  (295.186): every note 22 … 74 % of a beat from the lines; the AI's feedback in the entry (agrees; the "between" phase a tool candidate).**
  ► His eye (play from `294`); open: the fourth candidate "between" in the tool · a number or dot on a beat · the device sheet.
- **N-5 · THE MICRO COUNTERPOINT — the notation evaluation for the texture** (LG-130: the figures after the first; onsets a small interval
  apart across instruments): the survey on the texture; the candidates he named — more GCs · the ball on the cursor · highlight the notes as
  the cursor passes · different beaming · count-accurate TN with tuplets · shadows of other performers' notes · lines. Rhythmic accuracy the
  aim. Held for later, in his words.
- **N-6 · THE SECOND LAYER on the opening figure** — dynamics · hairpins · slurs · accents as hands on the eight notes (§550); after N-1 (the
  slur standard) so the phrase slurs draw right. His eye on the first layer still owed: reload the tab → `piece-lgmf` → `289` … `292.8`.

**Still standing behind these:** 2m.4 his eye on the long tones · the running order's step 4 (his eye 0 → 279) · the survey to refine (its new
item: the neighbours' system, §548) · the checkpoint-#4 held items (the window's scope · the model as a deliverable · H1).

### THE PERFORMANCE NOTES — WHERE HE PICKS UP (2026-10-01, Fable, after checkpoint #12; RUNNING_LOG §703 … §711; LG-268 … LG-276)

*His words at the stop: "go ahead and just commit and push. And I'll just pick up here next session." No `/session-end` was run — this
block is the handoff; everything is committed and pushed.*

- **The page:** `docs/notation_instructions/index.html` (+ `styles.css`, `images/`) — begun as a copy of piece #5's performance
  instructions (§703), served by his server at `http://localhost:5400/docs/notation_instructions/index.html` (give him that link).
- **How he works on it:** he DICTATES, one section at a time; the AI puts his words in verbatim with spelling, capitals and
  punctuation repaired, swaps the images, and FLAGS a moved fact in chat without changing his sentence. Each change: a RUNNING_LOG §
  (**§737 next**) · an LG with his words whole (**LG-302 next**); EVERY REPLY ENDS WITH THE WHOLE PAGE'S CURRENT TEXT IN THE CHAT (his ask 2026-10-02: "let me get the full performance notes at the end with each reply"; first the section alone, §714) — he is on his phone: short items, no tables · the state lines · commit + push.
- **The images' rule (§704):** every score image is a crop of the ZOOMED presentation score (Z 2) at ONE scale —
  `node tools/capture_lane.js --part eh|bsn|hn|tpt|perc|vib|vc|db --t T --span A-B [--gutter] [--padBot N] --out
  docs/notation_instructions/images/X.svg` (a span over 5.77 s is refused; `--gutter` puts the lane's clef in), then
  `<img class="zoomed" style="--w: N">` or `<figure class="zoomed" style="--w: N">` + `<figcaption>`, N = the `--w` the tool
  prints; the one knob is `--frame` in `styles.css`. Each image's command sits in a comment beside it. To LOOK at one: resvg to a
  scratch PNG (the scratch script `rast.js` of this session is gone with the scratchpad — `export_video.js`'s font options).
- **The page, section by section, as it stands after §734 (2026-10-02 — he worked from his PHONE; checked against the chat: every
  dictated change is in the file):**
  1. *Title · subtitle · opening sentence* — this piece's ("… served from the cloud and displayed in a web browser, like an online
     video game.").
  2. *Demo Recording* — STILL PIECE #5's YouTube link (the only thing of piece #5 left on the page).
  3. *Instrumentation* — this piece's; the percussion line is the AI's wording (§705).
  4. *Animated Conduction Tools* — all his: the cursor paragraph · "Bouncing-ball conductors aid with rhythmic precision. The dotted
     vertical line marks the go-time for events." ("the go-line" taken out, §724) · two captioned images · **Tempo frame** — "To
     assist with rhythmic accuracy, some sections are overlaid with a conducted pulse in the form of vertical lines and a bouncing
     ball." + the EH's frame, the ball on a line. ASKED, unanswered: "Tempo frame" or "Temporal frame".
  5. *Gradient Curves* — his paragraph (§707) + piece #5's sentence put in to see: "An animated curve follower appears alongside the
     cursor …" (§726 — **the word is wrong for this piece: the device is the METER; his to change**) · a ROW of three images (the
     bassoon at 726.88 with its clef · a fade-in header, the bassoon at 5.3 s · a fade-out header, the EH at 141.98 s) · his closing
     paragraph on the header's dynamic range (§731). **OPEN — A FACT FLAGGED, his word owed (§707 · §716):** his sentence has the pitch
     curve's bottom = B quarter-flat and top = G-sharp; the curve is PITCH HEIGHT, so top = B quarter-flat, bottom = G-sharp.
  6. *Timbral Glissando* — all his, three paragraphs (§711 … §733): the micro-glissandos as timbre · the string-tuning analogy ·
     "During the gradient curves, the dotted vertical go-lines are rearticulation points — … An animated dial counts down the time to
     the next rearticulation." The bold "Notation" and the two horn morph images that stood under them were REMOVED at §736.
     MEASURED for him (§716 · §717): only the bloom is written in pairs by instrument group; morph 2 — EH + Vc meet on B4, the DB falls
     onto the bassoon's held A2; morph 3 — octaves only.
  7. *Tuning* (§736, in place of the Notation Legend, whose heading is gone) — his settled TUNING text under a heading, the three-quarter-sharp as the score's own glyph inline, and a row of two snips: the EH's entry at 0 s (+41 · 26 (C1)) · the horn's at 1.0 s (−49 · 11 (C1)). FLAGGED: the text's example names D♯ (the EH's written note); the image, the score in C, shows G three-quarter-sharp.
  8. *At the page's foot* — a boxed, screen-only **Remaining items (working list — not part of the notes)** (§734).
- **THE WORKING LIST — his grouping (§720 … §723), in `docs/PERFORMANCE_NOTES.md` § THE WORKING LIST and mirrored at the page's foot;
  the item numbers are the first list's and DO NOT SHIFT:** S1 tuning ON THE PAGE (§736) · settled text not yet on the page — S2 transposing · S3 vibrato ·
  S4 the uneven group · to settle — THE MORPH AND MORPH HEADER (1 … 7) · THE VIBRAPHONE (8 … 10) · 14 the percussion legend · 16 the
  long tone · 20 the percussion staff's conventions · set aside — 11 · 12 · 13 · 15 · 17 · 18 · 19 · 21. Keep the tracker's list and
  the page's box in step when either moves.
- **Offered, not taken:** embedding the score's font in the images (their small text draws in the system serif).
- **Not looked at:** the narrow fade-out snip (`header_fade_out_eh_142.svg`) crashed the scratch rasterizer (resvg) — seen only in a
  wider cut; Chrome draws it from the same SVG. His eye at the desktop.
- **`Resume reads:`** this block · the page itself (`docs/notation_instructions/index.html`) · `docs/PERFORMANCE_NOTES.md` when he
  reaches a topic it covers. Nothing else.
- **Deliberately uncommitted:** unchanged from checkpoint #12's list below (5 modified, 25 untracked — all his).

### SESSION 18 · CHECKPOINT #12 (2026-10-01, Fable) — DRAFT 01: THE NOTATION LOCKED · THE FILM APPROVED AND ARCHIVED · ► THE PERFORMANCE NOTES (mid-session checkpoint)

- **The task:** Draft 01's presentation score. Since checkpoint #11, in one sitting (RUNNING_LOG §672 … §701; LG-237 … LG-267):
  his proof of the notation (§672 … §686) → **THE NOTATION LOCKED** and tagged (§687 · §688) → **THE FILM** planned in seven steps
  (PLAN § `2b-F`) and built (§689 … §694) → his watch-through, four faults fixed (§695 the curves · §696 the sync · §697 · §698 a late
  trumpet, the audio and the film re-made · §699 the ♭) → **his "that video is good"**, the archive and the tag (§700) → four small
  offers HELD for the next piece or the postmortem (§701, `docs/NITS.md`'s last section — **do not raise them in this piece**).
- **The deliverables, all agreeing:**
  - the page: `notation/ir/piece-lgmf.ir.json` — 1075 events, from `scores/piece-Recombination-Draft01-done.json` as saved 21:33 UTC
  - the audio: `notation/audio/piece-Recombination-Draft01-done.wav` — 886.664 s · −5.0 dBTP · −22.8 LUFS (+6 dB, his cap; RENDER.md §4)
  - the film: `notation/video/approved/2026-10-01-draft01/V-CUT.mp4` (= `renders/…-seed7-r4.mp4`; 890.66 s, the cut seed 7; its README
    says what made it) — on this machine, not in git
  - the tags: `Recombination-notationLock_1.0` (before §697's trumpet) · `Recombination-Draft01-film_1.0` (page · audio · film agree)
- **State:** nothing being built. PLAN § `2b-F` steps 1 … 6 ☑; step 7 (the completion) = the performance notes · the print score · the
  cover; **the call and the submission package are HIS — no AI work on them, not to be raised** (LG-255).
- **► THE NEXT STEP — after `/clear`, on FABLE, `/postclear`: check in, then on his word THE PERFORMANCE NOTES** (his words: *"after the
  clear, I want to work on the performance notes"*). They are HIS to write (PLAN § 2b: the performance instructions — web + two print
  pages); the AI's part is whatever he asks. To be ready, with no edits before his word:
  1. read `docs/PERFORMANCE_NOTES.md` (the tracker: 20 rows — what the notes must cover, the decision behind each, where wording exists);
  2. play it back to him as the notes' contents, grouped (tuning · the scrolling score's devices · dynamics and curves · the morph ·
     the vibraphone · section 2's temporal notation · the percussion), and NAME WHAT THE TRACKER LACKS against the locked page — section 2
     was notated after most rows were written: the long tone and its navy bar (2m) · one name per chord · the one-off / the GC's purpose
     (S24, his TODO 9) · the grace family · the percussion staff's conventions (S25 … S33: a lone strike a bare head, the pairs, the
     dynamic row) · the vibraphone's ○ at the end of a fall (§677);
  3. ASK how he wants to work (he drafts and the AI edits · the AI drafts from the tracker for him to rewrite · section by section) —
     the planning method if it becomes a plan item. One topic at a time.
- **`Resume reads:`** `docs/PERFORMANCE_NOTES.md` (whole — it is one table) · `docs/research/just_partials_notation.md` §1b (his TUNING
  legend, settled; the transposing lines). Nothing else beyond §2. *(For a section-2 wording: `docs/research/temporal_notation.md` §12
  — only when a row sends you there.)*
- **Pending him:** the print score (A3 — `export_print.js` and `print/score/build.sh`'s gates have never been run on this piece's pages)
  · the cover · the tag's name `Recombination-Draft01-film_1.0` is the AI's (his to rename) · his older `his` rows in the table below.
- **IF THE SCORE MOVES AGAIN** (the whole loop, ≈ 20 min, proven twice today): he Saves in the composer → R in the notation tab (or
  `node tools/reextract.js ""`) → the gates (`check_rules` **34** · `eh_figure_check` **106** · `vib_marks_check` **34** ·
  `sequence_notation_check` **79** · the shield `--expect piece-lgmf`) → the audio (`capture_composer_midi.js --score
  piece-Recombination-Draft01-done` → `export_midi.js --score … --capture midi/….capture.json` → `render_reaper.js --score … --up
  --maxUp 6`; Reaper open on the SAVED rack) → the film (the README's command, **a NEW file name `-r5`** — every render keeps its own
  file) → his watch-through → a new archive folder and tag. An AI edit of his save: §697's guards (the file's hash, no `-work` copy,
  one field), then HE presses the composer's **Reload** button.
- **What this session added to the method** (beside the block below, HOW A CHANGE IS MADE): the hands `--labelDy P:T:DY` (one curve
  label off its row) · `dynDySs` (one name off its place) · the rules `objects.glissLine.onStaffLine` · `vibMarks.nienteAtEnd` ·
  `vibMarks.crossAtUnison` FALSE + `crossedLead` (the rows are the two voices) · `objects.number.destPartial` · `objects.slur.dotInside`
  · `render.js`: a cut curve drawn over its page · `export_video.js`: `adelay` for the lead-in, the symbol font by file.
  **A film fault can pass every gate: the gates use Chrome, the film uses resvg** (NITS, held).
- **Deliberately uncommitted** (`git status --short` at this checkpoint — all his, never stage them): 5 modified —
  `bank/morph_models.json` · `bank/panel_snapshots.json` · `bank/sequences.json` (his libraries and his actuals' index) ·
  `reaper/LGMF_rack.rpp` (his rack; the renders read a COPY) · `scores/piece-Recombination-Draft01-done.json` (his save — with the AI's
  edits at his word: §669's 82 onsets, §697's trumpet); 25 untracked — `bank/actuals/ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` ·
  `-03` · `bank/passages/lgmf-sec2.json` · `bank/patterns.json` · `bank/rhythm_sequences.json` · `bank/rhythm_takes.json` · his fifteen
  named saves in `scores/` · `notation/video/renders/` (the films `…-seed7.mp4` · `-r4.mp4` are gitignored; its two render LOGS are
  the untracked files — scratch, safe to delete).
- **Checkpoint #11's block and this session's thirty bullets** are whole in git: `git show e5a3604:docs/PROJECT_JOURNAL.md`.

### SESSION 19 OPENS ON THIS — *(its NEXT STEP is SUPERSEDED by checkpoint #12 above: the notation is LOCKED, his eye on section 2 is done; kept for HOW A CHANGE IS MADE)* — session 18 closed 2026-10-01, Fable

- **The piece:** _Recombination_ (D32). `scores/piece-Recombination-Draft01-done.json` is the ONE source of notation (D43). **His save moved
  in session 18** (the EH's 343.12 lengthened · 389.8 D6 → D5; the DB's A5 at 329.26 → A4 · C♯5 at 309.96 → C♯4) — the page carries them,
  the audio render was RE-MADE with them (2026-10-01, §671: +6 dB, his cap → −4.9 dBTP).
- **Session 18** (2026-09-29 … 10-01 — Fable; Opus wrapped checkpoints #1 … #3 · #5; RUNNING_LOG §531 … §668; LG-119 … LG-235; D47 … D53):
  **SECTION 2 (289 … 427 s) NOTATED BY HAND, PART BY PART, AT HIS DICTATION** — the work now is the notation's detail, his eye on every note:
  - **the long tone** (PLAN 2m): every held tone a navy bar, tempered — 129 of them (`--longTones 289:427:all`); the chords' dynamics ONE
    name each on the page (`--chordDyn` × 38; the save keeps the played velocities)
  - **temporal notation:** the research (`docs/research/temporal_notation.md`, the survey v0) → T8 VALUES WRITTEN, the TN way → the EH's
    figures by hand to 398.4 (the beat frame · the uneven group · the grace family) → **the standards S1 … S33** (its §12)
  - **the one-off** (the GC unit of #4 / #5, `byEnv.oneOff`) → the bassoon to 399 · the horn · the trumpet (its frame at 344) · the cello ·
    the double bass: every short note of the six pitched parts on a device
  - **THE PERCUSSION STAFF's own rule set** (D51, PLAN 2o): a lone strike a bare head · the pair (beamed eighths) · the grace into a 16th ·
    the stem 5.85 · beams at the standard clearance ±9.39 · the dynamic row under the staff · accents by the head · the steep slur; figures
    and dynamics from 297.4 to 406
  - **tools:** `tools/reextract.js` (the runner) · `tools/tempo_fit.js` (`--free` · `--pin` · `--html`) · `tools/eh_figure_check.js` (THE
    LOCK, 106) · the app's video page in C (§587) · the app's R route repaired (§632 — **live only after he RESTARTS the score server**)
- **AFTER THE CLOSE (2026-10-01, RUNNING_LOG §669; LG-236) — HIS ORDER FROM HERE:** the 36 long-tone chords are IN UNISON, written into
  his save at his word (82 notes' `startSeconds`, 1 … 65 ms, the ends kept; the way back is his own snapshot
  `scores/versions/…_v2026-10-01T12-36-30-269Z.json`; **his composer tab must be RELOADED before any edit there**) · the server RESTARTED
  (§632's R live) · **he is PROOFING the notation — revisions may come** → `/checkpoint` → clear → **A NEW AUDIO RENDER of Draft 01**
  (`docs/RENDER.md` §4 — his own ▶ playback captured, rendered through a copy of his rack, `render_reaper.js --up`) — ☑ MADE 2026-10-01 (§671; checkpoint #11).
- **► THE NEXT STEP — HIS, ask first:** his eye on section 2 (a HARD reload of the notation tab → `piece-lgmf`): the EH `289` … `398` ·
  the bassoon `296` … `398.5` · the horn `296.3` … `387.6` · the trumpet `295.5` … `387.7` · the cello and the double bass `295.8` … `387.5`
  · the long-tone chords `303.5` … `407` · the percussion `297.5` … `405.4`. Then, in HIS order: the percussion's remaining lone strikes
  (still the fold's look) and its dynamics after 375 · the held items below.
- **HOW A CHANGE IS MADE (the method of session 18 — everything a cold model needs):**
  - `node tools/reextract.js "" <args>` — re-runs the IR's whole `provenance.build` on a fresh copy of his save and APPENDS the args
    (`@replace:OLD=>NEW` · `@drop:ARG`); a long list goes through a scratch runner with an args ARRAY (no shell quoting). Then
    `node tools/gen_engraving_rules.js` → `check_rules` (**34**) → `eh_figure_check` (**106**) → the shield (`layout_shield --write` on HEAD
    FIRST, `--diff --expect piece-lgmf` after; **a lined-staff rule also moves some tuba pages' part 4** — the shield lays them out under
    THIS ensemble; name them in `--expect`, a per-part hash proves nothing else moved) → a RUNNING_LOG § (**§702 next free**) · an LG
    (**LG-268 next**) · the journal · the state lines → commit + push. `check_screen_edges --ir piece-lgmf` after a `render.js` change.
  - **the parts live in the IR's chunks** (`ch-<part>-…`; the events carry none): EH 0 · Bsn 1 · Hn 2 · Tpt 3 · Perc 4 · Vib 5 · Vc 6 · DB 7.
    **His times read 0.05 … 0.2 s EARLY** — the nearest note is the one; "partial" in his dictation = a note.
  - **the flags:** `--plainNotes P:T0:T1` · `--oneOffs P:T0:T1` · `--beam t0-t1@P[:8|:16][:up|:down]` or `ids:wc-a,wc-b` ·
    `--beatGridFit P:unit:every:phase:first:last[:keepLead,noTail,olive…]` · `--cueLines P:t1,t2` · `--chordDyn T0:T1:mark` ·
    `--longToneAlso id` · `--rest P:t:dur` · `--labelDy P:T:DY` (§673: ONE curve label `(dyn)` off the dynamic row, ss, negative = down). **The hands** (`--hand 'wc-N:{…}'`, merged, `null` unsets): `dynMark` (a name · `false` ·
    `"band"`) · `nhStem` (`flag8` · `flag16` · `beam` · `false`) · `stemDir` · `grace` · `slurTo` · `nhArtic` + `articSide` · `hairpinTo`
    (+ `hairpinDir`) · `gc` + `gcGeom` (`lane` · `beatBall` · `staffTop`) · `gcImpact` (`lineBelow` · `spaceBelow`) · `gcSpread` ·
    `noteBeams` · `beamYSs` · `dynSide` (`above`, the lined row's exception) · `slurHeightSs` · `dynDySs` (§683: ONE name off its place, ss, negative = down).
  - **limits:** the build is ≈ 26 KB of Windows' 32.7 KB command line — say a figure on its SPAN, not per note; a Bash command over 8 KB
    dies with a false quote error — write scripts with the Write tool.
- **`Resume reads:`** for the render `docs/RENDER.md` §4 · for a notation revision `docs/research/temporal_notation.md` §12 (S1 … S33 — SURFACE them at each figure; S33: the normal staff's standards
  first) · `tools/reextract.js`'s header. Nothing else beyond §2. Session 18's nine checkpoint blocks and its bullets §573 … §667 are whole
  in git: `git show bd438e4:docs/PROJECT_JOURNAL.md`.

### THE SESSIONS BEFORE THIS ONE — one line each; the lab journal has them whole

- **S1 · 2026-09-17 (Fable + Opus)** — **THE PORT.** Piece #5's whole stack carried across and re-paletted onto the seven
  instruments (0a · 0b · 0g · 0i), verified in the running app, nothing sounding by design; then the rack begun — ten `LG`
  ports, the SI2 three complete as text, the Kontakt three's four curve slots. D1–D9. RUNNING_LOG §1–§36.
- **S2 · 2026-09-18 (Fable → Opus)** — **THE PERCUSSION BUILT:** fourteen `LGPerc` tracks, all fourteen key maps, eight (C)
  preset states banked. **His scope call: volume normalization is the only pre-composition item.** LG-10 … LG-15, NX-1 … NX-6.
  RUNNING_LOG §37–§46.
- **S3 · 2026-09-18 (Opus)** — **PHASE 1 OPENED: THE SIX CHORDS.** No engineering. The harmonic spine, the two categories of
  instrument, the six fundamentals (= the semi-cluster), all six chords scored voice by voice with their cents. **The lab
  journal extended to the composing itself, at his word.** COMPOSITION_NOTES LG-16 … LG-26, RUNNING_LOG §62–§65.
- **S4 · 2026-09-19 (Opus)** — **PLAN 1a BUILT:** `bank/reference_chords.json`, four models × 24 actuals, **six scores**
  (`lgmf-ref` · four transition types · `lgmf-all`). Three things were broken and fixed, none in the plan — the double bass an
  octave out, the app not booting, a recalled morph coming back a stranger. RUNNING_LOG §66–§74.
- **S5 · 2026-09-19 (Fable + Opus)** — **PLAN 1b: THE RACK CALIBRATED** to an absolute standard (K-20, BS.1770): a proven meter,
  a −20 dBFS reference, every instrument measured on the channels the piece plays, trims and a 12 dB written span. **Six bugs
  that would have outlived the piece**, including a per-object channel map that made every score after the first play on the
  previous score's routing. Final: tutti fff −19.1 LUFS, −9.7 dBTP. RUNNING_LOG §75–§91.
- **S6 · 2026-09-19 (Fable + Opus)** — **PLAN 1c: THE STRIKES DRAWER** adapted for this piece, six stages — the eight players ·
  `ordinario` · hear strike | long tone · the remap's dynamics · two vibraphone seats · the HARMONIC SERIES banner with four
  selections and cents. Built and unheard. RUNNING_LOG §92–§101.
- **S7 · 2026-09-19 (Fable)** — **PLAN 1d PLANNED IN FULL** under the planning method (his brief LG-35 · LG-36; the waves
  amended in the same day, LG-38 · LG-39). RUNNING_LOG §102–§113.
- **S8 · 2026-09-19 (Fable)** — **1d.1 THE GENERATOR** — `score/public/sequence.js`, pure, a recipe in and every player's notes
  out; `tools/sequence_check.js`. RUNNING_LOG §114.
- **S9 · 2026-09-19 (Fable)** — **1d.2 THE DRAWER · 1d.3 THE ROUND TRIP · 1d.4 THE ROLL** — `score/public/sequence_ui.js`;
  `strike_drawer.js` untouched. RUNNING_LOG §115–§117.

- **S10 · 2026-09-19 (Fable)** — **PLAN 1d BUILT TO ITS END** — 1d.5 the breath dials · 1d.7 the waves · 1d.8 the edges; his tests of
  1d.2 · 1d.3 · 1d.4 · 1d.5 PASSED. **A seventh 1b-class bug:** the bank's fader curves, measured in 0d for all seven, written by that
  morning's builder for the vibraphone alone — restored (he had to point at the record twice). RUNNING_LOG §118–§131.

- **S11 · 2026-09-20/21 (Opus → Fable → Opus)** — **THE DYNAMICS LAW, THE SEQUENCE DRAWER IN USE, THE BLOOM — AND SECTION 1
  COMPOSED.** 1e the volume fix, proven in his rack · 1d's feature add + 1g one scale, closed at his word and in use · 1h the bloom
  on a take · 1i the vibraphones in it, held still · 1j the morph's breaths · the server's stale-engine fault fixed · the composer's
  eight lanes. **He named `piece-LGMF-Sec01-v1.3-sec01-done`.** D18–D23. RUNNING_LOG §132–§184.

- **S12 · 2026-09-21 (Fable → Opus → Fable → Opus)** — **THE COUNTERPOINT ROUTE, BUILT AND SET ASIDE; A TEXTURE TAKE IN THE STRIKES
  DRAWER, BEGUN.** `1l` planned in full, built end to end (`1l.1` … `1l.7`: Texture plays this ensemble and saves rhythm takes · the
  Rhythm sequence panel) and composed with (`LGMF-Rseq-01`) — then his verdict in use, *"this tool is not working the way I expected
  it"*, and `1m`: the strikes drawer's rhythm area takes a texture take, BUILT ONE STEP AT A TIME, each used by him first — `1m.1` the
  row · `1m.2` the columns (third form: a column's players are its ticks) · `1m.3` duration. D24–D26. RUNNING_LOG §185–§239.

- **S13 · 2026-09-21/24 (Fable builds, Opus wraps)** — **FIVE TOOLS BUILT END TO END, ALL IN HIS HANDS, HIS TESTS OWED.** `1m.4`
  articulation (every voice knows itself · THE LENS · the passive column) · `1o` the save structure (a pattern a document, `bank/patterns.json`,
  Insert) · `1n` dynamics in the texture take (one scale, B2 · flat · ramp · pointillistic · waves) · `1p` the end time and the cursor's clock ·
  `1q` a take's harmony onto a selection in the score (the strip · the marquee · the stack · the take named · the shuffle · the dyn box) · the
  volume fix (DYNAMICS_LAW Rule 5). He uses `1o` already and composes in `pointilistic01a`. D27 … D31. RUNNING_LOG §240 … §321.

- **S14 · 2026-09-24/25 (Fable builds, Opus wraps)** — **THE MORPH READS THE TAKE AND THE WRITTEN DYNAMICS:** `1r` CONVERGE on a take
  (the take is the arrival; each player opens a semitone away from their partner) · `1s` `min` · `max` in written dynamics in place of
  `dyn amount`. D33. RUNNING_LOG §322 … §329.

- **S15 · 2026-09-25 (Fable plans, Opus builds)** — **THE NOTATION LAYER OPENED, AND THE MORPH BETWEEN TAKES.** `2a` the staves
  (`piece-lgmf` the main notation file · the percussion's seven-line staff · the presentation score in C) · `2c` the page edges (his two
  rule-sets) · `1t` take A → take B · `2d` the english horn's sequence notation prototype (`lgmf-eh-proto`; the just marks decided) · the
  working title _Recombination_. D32 · D34 … D37. RUNNING_LOG §330 … §387.

- **S16 · 2026-09-26 (Fable plans + fixes, Opus builds + wraps)** — **`1u` THE VIBRAPHONES' PITCHES ON THE STRIP**, built and in his
  hands; four fixes from his own tests; the last chord's fade read and left. D38. RUNNING_LOG §388 … §404.

- **S17 · 2026-09-27/28 (Fable plans + looks, Opus builds + wraps)** — **THE NOTATION, FROM ONE PROTOTYPE TO THE FIRST MORPH.** The
  audio of Draft 01 (2b) · the engraving rules as data (2e) · the fade signs (2f) · the vibraphone's sequence notation (2g … 2i) · the
  main file and its discipline (2j) · the morph's notation (2k) · the volume curve protocol (2l) · the fold (2l.7): `piece-lgmf`
  carries every accepted device. D39 … D46. RUNNING_LOG §405 … §530.

- **S18 · 2026-09-29 … 10-01 (Fable; Opus wrapped four checkpoints)** — **SECTION 2 NOTATED BY HAND, PART BY PART.** The long tone (2m) ·
  the temporal-notation research and T8 values written · the EH's figures (the beat frame, the uneven group, the grace family; S1 … S33) ·
  the one-off, then the bassoon, horn, trumpet, cello, double bass · the chords' dynamics one name each · the percussion staff's rule set
  and its figures to 406 · the runner, the lock, the R route. D47 … D53. RUNNING_LOG §531 … §668.

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current. The ✓ rows of sessions 13 … 17 were cut at
the closes — whole in git: `git show 22da087:docs/PROJECT_JOURNAL.md` (… 16) · `git show 26c8c10:docs/PROJECT_JOURNAL.md` (17).)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| **►►►►►►►** | **THE PAGE'S IMAGES (§704, LG-269):** one scale — each a crop of the zoomed presentation score (Z 2), shown at crop width / 1920 of the column (`styles.css` `img.zoomed`; ONE KNOB `--frame`); `tools/capture_lane.js --part eh|bsn|hn|tpt|perc|vib|vc|db --t T --span A-B --out …` (a span over 5.77 s is refused), then `<img class="zoomed" style="--w: N">` with the `--w` it prints. Five are this piece's; **the trill image, the morph chart and the two let-ring piano images are still piece #5's — his to look at.** ► HIS EYE on the page, then his revisions | **Fable** | — |
| **►►►►►►** | **THE PERFORMANCE NOTES — BEGUN (§703, 2026-10-01; LG-268):** piece #5's page carried as the starting point — `docs/notation_instructions/index.html`, served at `http://localhost:5400/docs/notation_instructions/`; the title changed, nothing else (the prose is his; every example and image still piece #5's). The tracker's list given him grouped, the six section-2 gaps named, HELD — not merged, not added to the tracker. ► HIS READ of the page, then he updates it to this piece section by section: the AI inserts his dictation verbatim, swaps the images (`tools/capture_lane.js`), flags moved facts in chat | **Fable** | — |
| **►►►►►** | **THE PERFORMANCE NOTES — HIS NEXT** (checkpoint #12, 2026-10-01; LG-266): after the clear, `/postclear`, check in; then the tracker `docs/PERFORMANCE_NOTES.md` played back as the notes' contents, what it lacks against the locked page named, and HIS way of working asked. The notes are his to write (PLAN § 2b) | **Fable** | **yes — `/checkpoint` done, `/clear`, `/postclear`** |
| ►► | **THE PRINT SCORE (A3)** — `export_print.js` · `print/score/build.sh`'s gates, never run on this piece's pages; after the notes (they print with it), laid out with him (PLAN § 2b-F step 7) | Fable to lay out · Opus to build | yes |
| ►► | **THE COVER** — PLAN § 2b-F step 7; `print/cover/` holds piece #5's two scripts | Fable · Opus | — |
| ☑ | **THE FILM OF DRAFT 01** (PLAN § 2b-F steps 1 … 6, §687 … §700): approved, archived `notation/video/approved/2026-10-01-draft01/`, tagged `Recombination-Draft01-film_1.0` | — | — |
| ☑ | **THE NOTATION OF DRAFT 01 LOCKED** (§687, his word 2026-10-01) — **the rows below about his eye on section 2, the percussion's rest and the lock's blocks are CLOSED by it unless he reopens the notation** | — | — |
| **►►►►** | **HIS EYE ON SECTION 2** — a HARD reload of the notation tab → `piece-lgmf` → part by part (the stops in the block SESSION 19 OPENS ON THIS). Collect, then fix at his word — a hand through `tools/reextract.js`, a look through a rules row. The percussion staff's standards S25 … S33 are a day old: expect his eye to move them | Fable | yes — `/session-start` |
| **►►►** | **THE PERCUSSION, the rest** (PLAN 2o) — the lone strikes not yet named (they still draw as the fold left them; one `--plainNotes 4:…` window each makes a bare head) · its dynamics after 375 · the ball's higher arc (§654, a · b · c) · a let-ring mark (the brake drum's rings) · `sub.` beside a dynamic (§658) · the beam-vs-standard-stem question at 378.5 · 405.3 (§665) | Fable | — |
| ☑ | **A NEW AUDIO RENDER OF DRAFT 01 — MADE 2026-10-01 (§671):** +6 dB (the cap; +9.9 to −1) → −4.9 dBTP · −22.8 LUFS; ► his ear on the ♪ render. *(As it stood:)* his ask (2026-10-01, LG-236), AFTER his proof, a `/checkpoint` and a clear: `docs/RENDER.md` §4 (his ▶ playback captured from HIS tab, rendered through a copy of his rack, `render_reaper.js --up --maxUp 6` — the boost at most +6 dB, his word §670), then the ♪ link on `piece-lgmf`. The save now carries the chords' unison (§669), the EH's and the DB's changed pitches, the EH's lengthened 343.12 — **he RELOADS the composer tab first** | Opus | yes — after the checkpoint |
| ☑ | **THE LONG-TONE CHORDS' ONSETS IN UNISON** (§638 held → §669 done, 2026-10-01): all 36 chords on their earliest member, in his save (82 notes, ≤ 65 ms); the page re-extracted, the gates green | — | — |
| **►►►** | **THE LOCK'S BLOCKS** — `tools/eh_figure_check.js` asserts the EH's figures 1 … 4, the 317 frame and the 324.6 figure only: NOTHING of the EH from 337, the bassoon, the horn, the trumpet, the strings, the chords' names or the percussion is locked yet (the §589 · §590 block is the pattern) — after his eye, so what is locked is what he approved | Opus | yes |
| ☑ | **THE SERVER RESTARTED by him** (2026-10-01) — §632's R route is live; never exercised by the AI: his first R after a composer Save is its test (a failed refresh now puts the IR back) | his | — |
| **►►** | **SECTION 2 — THE NOTATION PLANNINGS, as they stand** (the journal block above): N-1 slurs BUILT (+ the steep slur on the lined staff, §663) · N-2 stems DECIDED for section 2 (the generalization list open) · N-3 the uneven group BUILT · N-4 the beat frame BUILT and in use on four parts · N-5 the micro counterpoint HELD · N-6 the second layer done figure by figure | Fable | — |
| **►►►** | **TEMPORAL NOTATION — THE SURVEY v0, HIS TO REFINE** (`docs/research/sound_to_notation_survey.md`; the framework `docs/research/temporal_notation.md` §1 … §11; RUNNING_LOG §536 … §546; LG-120 … LG-126): the conceptual talk continues on the instrument — items · poles · the profile rows; then the practical for the EH's section 2 (the survey run on one EH phrase → a device sheet, line 1a → Opus). HELD: values written or not · the window's scope · the model as a deliverable · H1 | Fable (the talk) · Opus (a build) | yes — checkpoint first |
| **►►** | **THE RUNNING ORDER's step 3 — 2m.4 HIS EYE on section 2's long tones** (PLAN § `2m`; BUILT 2026-09-29, §532 … §534): reload the notation tab → `piece-lgmf` → the video view → the stops in the running order's step 3. Collect, then fix at once (§527) | Fable (a look → a rule row) · Opus (a fault) | yes — checkpoint on Opus first |
| **►►** | **SECTION 2 — HIS TODO, nine items, verbatim** (journal §2 block · RUNNING_LOG §535): normalize the long-tone chords · the EH's temporal phrases · the fast clusters · the percussion · temporal notation (short · long · tuplets · purpose) · its name + references · how much Ferneyhough-like detail · the glyph vocabulary · the GC. Not planned; each through `/plan-item` when he picks it | Fable (planning) | yes |
| **►►** | **THE RUNNING ORDER's step 4 (held at his pivot) — HIS EYE on `piece-lgmf`, 0 → 279** (journal §2 top: the stops; PLAN 2l.7 BUILT 2026-09-28, §530). Reload the notation tab, no restart. His frame (§527): collect the findings in the RUNNING_LOG, then fix them at once | Fable (a look → a rule row) · Opus (a fault) | yes — `/session-start` |
| **►►** | **The RUNNING ORDER's step 4 — his calls in the range:** 2a.6 the clefs by register (Bsn · Vc · Db) · the orange pitch line's corners · 2k's AI's calls (§507 `eligible` · §509 the gliss line not in `inkOf` · §512 the per-breath overlays dropped) | his · Fable | — |
| **►►** | **2j.4 HIS EYE — the rest of the main page BEYOND 279: `427` · `655` · `800`** (paused 2026-09-28 at his pivot to the morph; his first findings fixed, §502 · §503; `40.26` is in the running order's step 3) | his eye | — |
| **►►** | **(still his — not taken up at checkpoint #5)** **HIS EYE ON THE PROTO — `lgmf-eh-proto` IS NOW THE EH'S WHOLE FIRST LINE, 0 … 149 s** (session 17, 2026-09-27, Fable at 2e.7; RUNNING_LOG §454 … §462; `dfd63e3` … `6dfb038`, all pushed). **Reload the notation tab** (page files + the IR; no restart) → `lgmf-eh-proto` → the video view → `0` (the opening `○—<` before `pp → mp` on the dynamic row; the fade ONE straight line to pp at 6 s) · `141.98` (the last breath: G5 −31 · `14 (A1)`, `—> ppp` before its go line) · the working page (⚙ off the video view, the EH in F): `+41` · `26 (C1)` over the head, "senza vib." under the dynamic row. **Then his open answers:** (1) the closing sign's mark — the save falls to **ppp** (`fadeOutTo: ppp`), his words said "niente": keep `—> ppp` (the notation follows the save) or re-insert the sequence with `fade out … to niente` (§460) · (2) the breaths' top **CC7 69 vs the table's mp 68** (§456) · (3) **DN-1 … DN-5** on the generated page (`docs/ENGRAVING_RULES.md` § 8) · (4) the AI's calls of §458 · §459 · §460 (the sign row −5.95 · the fall test · the room rule · the hairpin 0.667). Revise on his word — a look question on Fable, a fault on Opus. *(What 2e.7 built, each in its §:)* the curve follower OFF (§454) · the pie go line to go line (§455) · the level verified to the page (§456) · THE FLIP BY CLASS — `leaves` on the mark rows, the annotation flips before the pitch data (§458, DN-6 closed) · `2f` THE FADE SIGNS — restored (§457), built (§459), hairpins before the legend (§460, a new drawn kind `hairpin`), the fade drawn as a multiplier on the WRITTEN height (§461 · §462). `check_rules` 23 · `sequence_notation_check` 64 | his eye · then Fable (a look) / Opus (a fault) | — |
| **►►►►** | **THE AUDIO OF DRAFT 01 — HIS EAR** (session 17, RUNNING_LOG §405 … §407): the WAV `notation/audio/piece-Recombination-Draft01-done.wav` — RE-RENDERED 2026-10-01 (§671: +6 dB plain at his cap → −4.9 dBTP · −22.8 LUFS; was −1 dBTP, +10 dB at his "b") · the notation tab reloaded → `piece-lgmf · Draft 01` → `♪ render`. Re-render recipe in the checkpoint block above | his ear · then Opus (a fault) | — |
| **►►** | **`1u.6` HIS — IN USE** (not closed by his word). Built 2026-09-26 (1u.1 … 1u.5, §390 … §394); four fixes from his tests, each verified in the page on his own score (§395 … §401; `0d36216` · `240a0c0` · `268fe04` · `b3a23dd`; `vibes_pitch_check` 50 → **65**): the take of a morph the panel's Insert placed (on the marker; those placed before matched by the KEYS of the other players to a saved actual, the match written onto the marker) · the first breath of each seat draws · the row blurs its buttons · `neighbours` on a morph mostly empty (by the rule — `within a tone` · `any` there). **Offered, not taken up:** the strip's own buttons (`shuffle` · `back` · `take ▾` · `dyn ▾`) blurred the same way (a `shuffle` then SPACE re-shuffles) · a status that leads with WHY when nothing changed · `neighbours` in a morph read from the others' "to" notes (§396 (c), a design talk first). **The AI's calls, his to reverse:** a seat holds its note until a change · a breath of another take kept as dealt · the other seat clear over the whole breath · the match written onto his marker (§401) | his ear · then Fable (a reading) / Opus (a fault) | — |
| **►►** | **`1t.5` HIS LISTEN — RESTART the server (`morph.js` changed) and reload the tab.** MORPH → `TAKES` → `from` a take · `to ▾` a take → `duration` 60 → Generate → the line → Play → the far voices' seams · the vibraphones at the default (1: the first 3 s before the arrival, the second ON it — never heard on its new bar unless `release` is set; the line says so) then at 0.5 → a `release` (8) — the fade on B → Insert after a sequence ending `one by one`. BUILT 2026-09-25 on Opus, 1t.1 … 1t.4 (RUNNING_LOG §364 … §367; `a7ae62c` · `dc7c76c` · `312d88f` · 1t.4). Found: the switch needed a CUT (§366); the release returned every player to A — `carrier.releaseHolds` on TAKES (§367); the red "hard" count is the re-key seams (§367, NITS). *(The build's row, done:)* **BUILD `1t` THE MORPH BETWEEN TAKES — PLAN § `1t`, 1t.1 → 1t.4, one commit per step, THE SHIELD in each; STOP before 1t.1 for his word.** PLANNED IN FULL 2026-09-25 (Fable, session 15; RUNNING_LOG §350 … §363; LG-106 … LG-110): take A → take B by player, one duration, the scatter, the re-key, the vibraphones' switch dial, the joins by hand. He pivoted here from the notation at his word (*"I want to work on the morph drawer"*); the notation's pick (the row below) waits | Opus | yes — checkpoint first |
| his | **`2a.5` HIS EYE — no restart.** The notation app → `piece-lgmf` → the video view → 300 s → the brace, the seven lines, the names, the heads on their lines; `z` the zoom. BUILT AND VERIFIED 2026-09-25 (RUNNING_LOG §338). **IN PROGRESS — the names decided and in (§339: no periods · `DB` · `SlBl · Cast · Tamb · TemBwl · WB · BrDr · BD`; `TemBwl` 4.6 px clear of the brace, the gutter 72 untouched; #5's three gutter fixes carried, the print-edge checker not yet run here — 2b); his a/b/c on the E.H. sharp over the clef at 300 s pending.** Revise on his word — a look question on Fable, a fault on Opus | his eye | — |
| N-2a | **`2a.6` the clefs by register** — a TENOR clef in the engine (the C clef on line 4; the engine draws treble · alto · bass) and an automatic clef per stretch: Bsn bass · tenor, Vc and Db bass · tenor · treble (§335's numbers; `ev-wc-3489`, the bass's A5, clamps at 15ma today). One line in PLAN § `2a` — lay out its sub-steps (thresholds · where a change may fall · the clef glyph at a change) and THE SHIELD before building. Re-extract `piece-lgmf` after | Opus (the thresholds the AI's, his to reverse) | yes |
| N-2b | **THE SPECIFIC NOTATION — deferred at his word (§335):** the note unit (stem · flag · GC · the dynamic's place) — the percussion first, then each technique; and the cents (`docs/research/just_partials_notation.md`, decided, nothing built). A design talk, one topic at a time, the planning method | Fable | yes |
| **►►** | **`1s.6` HIS ONE TEST — RELOAD the tab (page files only, NO restart: `morph.js` untouched).** MORPH → CONVERGE or BLOOM on his take → `min` · `max` in place of `dyn amount` (a recalled dial reads `≈ pp` · `≈ ff`) → `pp` · `ff` → Generate → the status ends *· min pp · max ff* → Play → Insert. BUILT AND VERIFIED 2026-09-24 on Fable (RUNNING_LOG §329; §326 … §328 the design). **His call, found on the way (§329):** a model's own dips (CONVERGE's soft entries) go UNDER `min`, as they went under `base − amount` before — one clamp in `morph.js` if he wants `min` a hard floor, and every stored render moves. Revise on his word | his ear · then Fable | — |
| **►►** | **`1r.6` HIS ONE TEST — RELOAD the tab (page files only, NO restart: `morph.js` untouched).** CONVERGE · `Just-c2-seed143` on the pulldown · Generate → the line *as assigned — the arrival* · Play → Vc F4 → E4 −14 ¢ · Db B2 → C3 · Tpt G5 → F♯5 −49 ¢ · Hn B4 → C5 · EH C♯4 → C4 · Bsn B1 → C2, the vibraphones still on D6 · C♯6 · Save as ACTUAL if he keeps it. BUILT AND VERIFIED 2026-09-24 on Fable (RUNNING_LOG §325; §322 … §324 the design). Revise on his word | his ear · then Fable | — |
| **►►** | **`1q.8` HIS ONE TEST — RELOAD the tab (page files only).** FIRST the level: `pointilistic01a` 15.64 s, `Just-b1-seed208` onto the chord — no louder than his playing (§319). Then one re-pitched note selected → the strip names its take, the menu lights it → P → the card's line (note · cents · partial · take), `+8va` keeps the cents → a chord passage with several notes on one part → `take ▾` → `shuffle`, again, a chip back, `back` → a marquee → `dyn ▾` → `ff` → play → CTRL+Z (§317 · §320). Revise on his word | his ear · then Fable | — |
| **►►** | **THE PERCUSSION OVERDUB — his try (§321).** `Rec` lane `Percussion` → technique e.g. `Wood Blocks — Hard Mallets` (keys 36–44) → arm, play, disarm → the technique to another instrument (e.g. `Tam Tams A — Tam Tam Mallet`, 36–44) → playhead back → arm, play over it → play the score: each pass on its own `LGPerc` channel. A switch of the Rec LANE menu resets the technique to `main` — re-pick the voice. If a triangle sounds under every pass, it is §221's track 10. Read in the code, never heard | his ear | — |
| his | **`1q.4`** — the REAL CTRL+drag (the pane cannot hold CTRL, §313) · SHIFT+CTRL adds · a chord on one part clicked three times, ALT+click the list · a trill in a selection · the English horn's solo clickable at his window width (§315) | his ear · then Fable | — |
| his | **`1p`** — three columns selected, a row's menu to `end`, one time typed → the three end together; another row left on `len`; the clock while SPACE runs (§303 · §304) | his ear · then Opus | — |
| his | **`1n.6`** — in his rack, on a texture pattern: `flat pp` · `ramp ↑ pp → ff` · `pointillistic · Webern` · `waves · breathing`, `who moves: each player` on four stretches; `mp-f-mp` typed on one row with a length; SPACE, Insert, play the score, record; `node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua` → every short note at its ladder velocity with a CC7 before it on a curve channel, MAIN ch 1 empty of the pitched rows, every `follow` at mf with CC7 moving. **His ear: a short `pp` beside a held `pp`**, and a brass `staccato` `pp` beside an `ord` one (D27) (§296 … §301) | his ear · then Opus (Fable if the one scale is in question) | — |
| his | **`1o.6`** — he uses it already (`Sec2_01a`); his word on it: `texture ▾` · name · deal · reopen the tab · `pattern ▾` · Insert at a playhead · play = SPACE · `new` (§291 … §295) | his ear | — |
| his | **`1m.4`** — the menus by name and key · the lens on a selection · click / SHIFT / CTRL for a stretch · the `len` box per row (§279 … §285) | his ear | — |
| — | **`1m.4.7 deal: repeat \| spread`** — written, built only on his word · **`1m.4.2`** — 21 by-key voices pending, each picked up when he uses it (§290) | Opus | — |
| N0 | **the rest of `1m`, in the order he names:** the percussion row · re-attack (PLAN § `1m`, *Held*; Insert and dynamics are built as `1o` · `1n`) | Fable to lay out · Opus to build | — |
| N0a | **the Rhythm sequence panel and `1l.8`** — not decided since his verdict (§214); its three collected items (§207) wait on it | his | — |
| N0b | **MULTITEMPO AS A RHYTHM SOURCE** (LG-61; §208 · §209) — `1m`'s `source` menu reserves `multitempo — later` | Fable | yes |
| N1 | **`1k` the morph's peaks against the sequence** — `todo`, BEFORE his next morph: *"fine for this section but I'd like to look into it before I do the next one"* | Fable to look · Opus to build | — |
| N2 | **`1f` the crescendo tool under the dynamics law** — `todo`: `cresc*.js` write no `cc7Abs` / `velAbs` (read in the code, not captured) | Fable to lay out · Opus to build | — |
| his | **his listens, never reported** — `1h` H4 · `1i` VB6 · `1j` BR4; he composes with all three. If he reports a fault, the first reads are §171 · §176 · §181 | his ear | — |
| N3 | **the rest of phase 1** — the pattern tool LG-7 · the morph to a held beating LG-8 · conductions LG-3 · the morph's revision (`MORPH_NOTES.md`) · how the six chords are used in time · the LGMF call (Q2) | Fable | yes |
| N4 | **small, in NITS** — `beating_calc_check.js` · `morph_septet_check.js` still piece #5's cast · the validator does not know `provenance.palette` · re-derivation drift on nine LG actuals · an uncaught `TypeError` at `sequence_ui.js:1652` on a bare load · `heard()` empty for an LGMF model · the strikes drawer's plain inserts may play `recVel` unremapped | Opus | — |

**Open at session end — (mid-session checkpoint) SESSION 18 · CHECKPOINT #12 (2026-10-01, Fable):** the notation LOCKED, the film
APPROVED and archived, two tags · ► THE PERFORMANCE NOTES after the clear (Fable) — the block CHECKPOINT #12 at the top of §2; the print
score and the cover after them; the call is his.

**Open at session end — (mid-session checkpoint) SESSION 18 · CHECKPOINT #11 (2026-10-01, Opus) — SUPERSEDED by #12:** the new audio render of Draft 01
MADE (§671: +6 dB at his cap → −4.9 dBTP · −22.8 LUFS) · ► his ear on the ♪ render, then his eye on section 2 — the block CHECKPOINT #11 at
the top of §2.

**Open at session end — SESSION 18 CLOSED (2026-10-01, Fable):**
- **THE STATE:** nothing is being built; everything committed and pushed. The notation tab needs a HARD reload (`layout.js` · `render.js` ·
  `animobj.js` · `gc.js` · `notation.html` changed); the score server was RESTARTED by him on 2026-10-01 (§632's R live, his first R its test). **After §669 his composer tab holds the OLD onsets — a RELOAD there before any edit.**
- **Pending him — session 18** (each written out in the § cited):
  - his eye on every part of section 2 (none of the hand notation has had a full pass) · the EH's AI-called values (§577 figure 3 · the
    slurs into the graces at 340.1 · 342.65) · the frames' lead and tail lines (`noLead` · `noTail`)
  - the chords' unison DONE (§669, in his save) · the chords' names are on the page only — the velocities
    in the save still differ (his 2m plan: `dyn ▾` in the composer, then re-extract)
  - the percussion: the beam's clearance against "the shorter stem the standard" at 378.5 · 405.3 (§665) · the down-beams 0.39 under the
    lane's bottom · the 16th at 336.79 (the standard 5.85, he read it as short, §663) · the wood block grace's 10.4 ss stem (§663) · the
    ball's higher arc (§654) · the GC's impact a space below the staff (§656) · the frame was tried three ways on the opening and set aside
    (§643 … §655) — the opening figure now carries one GC, no frame · "olive = an actual tempo" (§651): do the winds' frames turn all-olive
  - the one-off's and the pairs' calls on the winds (§611 … §635: the lane GC on the burst pairs · the hand-window exception in `:all`) ·
    the horn's 301.96 pair two octaves under one beam · the trumpet frame's tail line 346.548
  - the audio render of Draft 01 RE-MADE 2026-10-01 with his pitch / length changes and §669's unison (§671) — his ear · the research docs' citations are from memory (§546) and so
    are the percussion-notation answers of §639 · §642 · §647 · §648 · §658 — a verification pass offered, not run
- **Learned in session 18:** HIS TIMES READ EARLY (0.05 … 0.2 s) — list the part's events and take the nearest · a hand's `stemDir` belongs
  to the overlay's VALUE, not its device (§643) · a hand's `dynMark: null` draws no name — `"band"` restores the device's (§645) · the app's
  R re-runs the recorded build AS IT STANDS — a `--scoreFile` copy recorded by the runner was the OLD score, and a failed refresh removed
  the IR (§632) · every vertical rule in `layout.js` assumes a five-line staff ±2 whose positions are pitches — a lined staff needs each
  rule read against its OWN outer lines (§646: stems, the flag law, the dynamic row, the frame, the group's accent row and lane clamp) ·
  THE SHIELD lays the tuba IRs out under THIS ensemble — their part 4 is the seven-line staff (§656) · THE LOCK earns its keep: it caught
  a slur rule leaking onto the English horn (§663) · on a new staff the existing standards come FIRST (his word, §666) — three of the
  percussion's invented rules were taken back to the standard by his eye within a day · the beam device gives a group's first note a GC
  unasked — twice (§607 · §629); on a lined part it is now off · a rule he states may be superseded two turns later (the beam's floor:
  §662 → §663 → §665) — log each, build the last.
- **DELIBERATELY UNCOMMITTED — all his, the AI touches none of it** (`git status --short` at this close — the same 29 paths as every
  checkpoint of session 18: 5 modified + 24 untracked): his actuals `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index
  `bank/morph_models.json` · his libraries (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` ·
  `rhythm_takes.json`) · `bank/passages/lgmf-sec2.json` · `reaper/LGMF_rack.rpp` · his named saves in `scores/` · and
  **`scores/piece-Recombination-Draft01-done.json`** (his tab's saves of session 18 — pitches and lengths changed; every extraction reads a COPY;
  ONE edit by the AI at his word, §669: the chords' 82 `startSeconds`).
- **Unsaved working copies** (`node tools/unsaved_check.js`): the four old ones since session 11 (`cresTest` · `lgmf-all` · `lgmf-bloom` ·
  `longToneTest`), none the piece.


**Open at session end — SESSION 17 CLOSED (2026-09-28, Opus) — the pending list of sessions 14 … 17 in one place:**
- **THE STATE:** nothing is being built; everything committed and pushed. The notation tab needs a RELOAD (`piece-lgmf` changed);
  no restart owed but `1t.5`'s.
- **Pending him — the decisions** (each written out in the § cited):
  - **Session 17** (D39 … D46): the running order's steps 3 · 4 · 2j.4 beyond 279 · his ear on the WAV (D39) · the EH proto's answers
    since checkpoint #4 — the closing mark ppp vs niente (§460) · CC7 69 vs 68 (§456) · DN-1 … DN-5 · the AI's calls at the foot of
    PLAN § 2e … § 2l. Held by name: anchor G metric (§416) · the hand-drawn style · the live name at the tube · the micro-motion flag ·
    the pitch line's corners. Parked: the paper score's lead-in and the percussion snippet on paper (§489). Beyond 279, for later:
    the middle section's page, morphs 2 · 3's alerts (§530).
  - **DECIDED 2026-09-27 — (a) a 4 s lead-in for the presentation score (§409; PLAN 2e.2); `2d.7` superseded by `2e.7`.** *(As it stood:)* **`2d` THE PAGE-START CLASH** (§383 · §387): the EH's block at 0 s has no room left of x(0) — the screen clamps it right of its go
    line; paper draws it into the clef gutter and `check_print_edges --ir lgmf-eh-proto` FAILS page 1. (a) a LEAD-IN [recommended] ·
    (b) the clamp on both · (c) as they are. If (a): one PLAN item first (the lead-in's length; both media; THE SHIELD by data absence).
    Then **`2d.7` his eye:** reload the notation tab → `lgmf-eh-proto` → the video view (the working page, the EH in F: the block reads
    D♯6) → `0` · `20` · `28.7` · `z`. The AI's calls of `2d` are listed in §387.
  - **`1t`** (§366 · §367): a default `release` for TAKES (without one the last mover is barely heard on B, and at switch 1 the second
    vibraphone never sounds its new bar) · the red "N hard" = the re-key seams (NITS 2026-09-25) · `min` as a hard floor (§329, also
    `1s`'s). **`1t.5` his listen:** RESTART the server + reload.
  - **`2c`** (§347): every specific value deferred to when the notation is in — the margins 40 · 40 px / 12.7 mm · the 2 ss stub · the
    go-line switch · NOTATION_STANDARDS §5's calls. **`2a`:** `TemBwl` 1 mm from the brace on paper (`TBwl` the fallback) · the A3 staff
    size (`staffHeightPx` 31.6 → 28) · the percussion as metric figures (`--bricks` today).
  - **`1u`:** the offers and the calls on its ►► row above · `neighbours` on a morph (§396).
  - **Housekeeping, his:** his actuals `ACT-TAKES-01` · `-02` · `-03` · `ACT-BLOOM-07` · `-08` and their index in
    `bank/morph_models.json` — commit only at his word (once he saves, the §401 match lives on his markers, so `-02` · `-03` are no
    longer needed for it) · whether `bank/patterns.json` goes into git (§278) · THE TRIANGLE — track 10 `Percussion` takes `LGPerc` on
    ALL channels (§221) · `ACT-BLOOM-03` · `-04` in the store · a `sec01-done` tag.
- **Where the earlier record lives:** session 13's tool table (`1m.4` · `1o` · `1n` · `1p` · `1q` · the volume fix · the percussion menu)
  and every checkpoint block of sessions 14 … 16 — with their SHIELD recipes (`1t` §365 · `2c` §344 · `2d` §387 · `1u` §394) — are
  whole in git: `git show 22da087:docs/PROJECT_JOURNAL.md`.
- **Session 17's checkpoints #1 … #14** and its two closed running orders are whole in git: `git show 26c8c10:docs/PROJECT_JOURNAL.md`.
- **Learned in session 17:** in an eye pass he COLLECTS, then everything is fixed at once (§527) · a gate that fails after a step is
  run on HEAD's file first — the pie's failure was older than the fold (§529) · an SVG arc takes its circle from its END POINTS: a
  near-full or near-half arc with rounded ends drifts by pixels, draw it in pieces ≤ 90° (§529) · a long Bash command dies near 8 KB
  with a false quote error — splice from scratch files.
- **Learned in session 16:** a report of "nothing happens" after a build is first a question of the TAB — ask for a reload before
  reading the code (§398 · §402) · a content match on a placed object must survive the edits the strip itself makes (§401: `go` ate a
  time match) · a clicked `<button>` keeps the focus and takes SPACE as its own click — a row with buttons blurs them (§400).
- **DELIBERATELY UNCOMMITTED — all his, the AI touches none of it** (`git status --short` at this close — 29 paths):
  - `bank/actuals/ACT-TAKES-01.json` · `-02` · `-03` · `ACT-BLOOM-07` · `-08` — his actuals · `bank/morph_models.json` — their index
  - `bank/panel_snapshots.json` · `bank/sequences.json` · `bank/patterns.json` · `bank/rhythm_sequences.json` · `bank/rhythm_takes.json`
    — his libraries, autosaved by his tab · `bank/passages/lgmf-sec2.json` — his passage · `reaper/LGMF_rack.rpp` — his rack
  - `scores/` — `piece-LGMF-Sec01-Sec02*` (five) · `piece-LGMF-Sec03-Try01` · `-Try02` · `-Try02p1a` … `-Try02p4a` · `-Try02p5` ·
    `piece-LGMF-draft01-preVibesFix` · `piece-LGMF-draft01-VibesFix` · **`piece-Recombination-Draft01-done`** (committed at his word in session 16; MODIFIED since by his tab's save of 2026-09-26
    20:28 — `metadata` · `viewport` only, no object changed; every extraction read a COPY) ·
    `pointilistic01a` — his named saves
- **Unsaved working copies** (`node tools/unsaved_check.js`, at the session-17 close): the four old ones since session 11 (`cresTest` ·
  `lgmf-all` · `lgmf-bloom` · `longToneTest`), none the piece.

### STILL BINDING — carried whole from session 11's checkpoint #4

- **HOW TO VERIFY WITHOUT TOUCHING HIS WORK — unchanged, and every session since §132 has used it:** `preview_start` **`score-5401`**
  (a throwaway server on the SAME scores folder) → `composer.html` → **before anything else**
  `Composer.autosave = async () => {}; clearTimeout(Composer.autoSaveTimer)` — the page reopens HIS last working copy and would
  autosave into it 5 s after any change · **never Save** · `window.confirm` stubbed · the playhead set by
  `Composer.scrollOffset = T * Composer.pixelsPerSecond` · **`resize_window` 1280 × 860 FIRST — a hidden pane has a 0 × 0 viewport** ·
  **the pane does not PAINT, so `requestAnimationFrame` never fires and `ResizeObserver` is never delivered**: to drive the score's
  transport, replace rAF with a 16 ms timer and set `Composer._zoneMidiInited = true` · to capture MIDI, stub
  `Composer._zoneMidiOutputs[port.toLowerCase()] = { send: b => log(b) }` for every port · verify note lists, objects and ROUTES by
  `javascript_tool`, never a screenshot · reset the viewport and `preview_stop` at the end.
- **AND SINCE (session 12):** stub every non-GET `fetch` and `navigator.sendBeacon` too (§220), and the Rhythm panel's
  `RhythmSequence.save` · `libTouch` · `libFlush` · `libFlushBeacon` when it is open (§213) · **a mouse GESTURE is verified with the
  pane's REAL input** (`computer` double_click · type · key), not with events dispatched by script — a dispatched `dblclick` hid that
  Chrome sends NONE when the pressed element is re-drawn under the mouse (§238); the pane's `Return` arrives nameless, send `Enter`.
- **AND SINCE (session 13, §312 … §315): the pane's `left_click_drag` CANNOT HOLD CTRL** (its `modifiers` serve clicks; a CTRL+drag reaches the page as a plain drag) — dispatch the gesture, say so, and leave the real one to his test · **`Composer.isGrain(wc)` is TRUE for every pitched note on a player lane** — "grain" is this code's word for a note; never exclude by it · **one gesture per `javascript_tool` call when a click must be observed** — a `setTimeout(0)` removal runs after the whole script, so a one-shot click swallow eats every later synthetic click in the same call · **a page variable dies with a reload** (`window.__x` → undefined → a null deal that looks like a real refusal) · **the pane delivers no ResizeObserver: call `Composer.fitTopBar()`** before measuring the lanes' top.
- **AND SINCE (session 13, §316 … §320): `Composer.openScore(name)` RE-ARMS the autosave — stub `Composer.autosave` and clear its timer AGAIN after it** (that is how a throwaway opens a score other than the one its localStorage names) · **a capture of the score's own playback:** `window.requestAnimationFrame = f => setTimeout(f, 16)` in the navigation batch, then `Composer.scrollOffset = T * pixelsPerSecond; applyScroll(); startPlay()`, a wait, `stopPlay()`, the stubbed ports' log read for note-ons · **`find` returns at most 20 matches** — a control whose word is common ("shuffle") needs a title phrase of its own to be found · **a failed `javascript_tool` call leaves its partial work** (a `selectObject(undefined)` put a hole in `selectedObjects`) — clean it before the next gesture · **a seeded draw reproduces only if every filter before the rng depends on the seed and the selection alone** (§317's `hq.dealt`).
- **AND SINCE (session 13, §296): THE STUBS GO IN THE SAME BATCH AS THE NAVIGATION, BEFORE ANY SLEEP** — the throwaway page writes HIS bank files at boot on its own: the sequence drawer POSTs the row its localStorage holds 2 s after load (`libLoad`), the pattern library migrates and writes its untitled documents; a stub installed after a sleep is too late (that was §295's "writer not pinned": the throwaway itself). **At the session's end clear the throwaway's `lgmf.sequenceDrawer.v1` · `lgmf.rhythmSequence.v1` · `lgmf.textureRow.v1`**, so the next first load has nothing to save; delete a `bank/patterns.json` the throwaway created. **A `find` ref goes stale at every re-render of the drawer's rows** (a typed value re-renders them) — fetch the refs again before each typing batch. **Stub EVERY port before a claim about curve seats** — a marker seat on a port with no output resolves to the base route and the note reads as "velocity alone". **`SequenceDrawer.setActive(false)` before capturing the strike's Hear** — its wrap of `play('orch')` takes SPACE while it is active. **THE SHIELD's BEFORE is captured on HEAD's files:** `git stash push -- <the changed paths>`, reload, capture, `git stash pop`, reload (the throwaway serves from disk). **AND (§303): THE SHIELD's two captures need a DETERMINISTIC deal** — `shuffleOrch` is seeded but the deal is not persisted across a reload and the seed moves, so a BEFORE on one shuffle and an AFTER on another differ in velocity for no reason of the build: `select('hs::starter:0')` then `assign(voice, lane)` the same lanes both sides; and a texture take REPLACES the drawer's strike, so re-select it after `txSetMode('strike')`.
- **Five things learned the hard way — all still true:**
  - **A Bash command longer than about 8 KB FAILS on this machine** with `unexpected EOF while looking for matching quote`. **Write
    any large text with the Write tool into the scratchpad, then splice it in with a short `node` script** that asserts each
    replacement lands exactly once.
  - **A script with BACKTICKS in it goes to a FILE** (the Write tool, or a quoted `<<'EOF'` heredoc) — **never into `node -e "…"`**.
    In a double-quoted bash string the backticks are command substitution: on 2026-09-20 that made bash try to EXECUTE
    `bank/panel_snapshots.json`, his 3 MB takes file, as a shell script (§146). Nothing ran, but it is the closest this project has
    come to losing his data.
  - **THE LINE ENDINGS ARE MIXED IN THIS REPO, and `docs/PLAN.md` is mixed WITHIN ITSELF** (797 CRLF, 59 lone LF). A splice script
    must **never normalize a whole file** — detect the file's DOMINANT ending and convert the search strings and the inserted text
    to it instead (`const crlf = nCRLF >= nLF, fix = t => crlf ? t.replace(/\r?\n/g, '\r\n') : t`). LF search strings match **zero**
    times in a CRLF file and report "not found", which reads like a missing anchor and is not. **CORRECTED 2026-09-28 (§501, measured at
    BYTE level):** `core.autocrlf` is true, so every committed blob is LF; the working copies of PLAN · CLAUDE.md · this journal · the
    RUNNING_LOG are ALL LF, `PLANNER.md` and `rules.json` ALL CRLF — the 797 / 59 above is stale, and **`grep -c $'\r$'` MISREPORTS here**
    (it counted every line of an LF file as CRLF). Count with node over the bytes (`b[i] === 10 && b[i-1] === 13`); a splice converts its
    text to the file's own ending and refuses a mixed file.
  - **The Write and Edit tools turn a typed `\uXXXX` into the literal character**, so `sequence_ui.js` holds `—` and `·`, not escapes.
  - **A PARALLEL SESSION of his may be appending to `RUNNING_LOG.md` and `COMPOSITION_NOTES.md`.** Append only; **read the last
    heading number immediately before writing** and take the next free one; explicit paths, never `git add -A`.
- **Standing warnings still true:** the in-app browser has no Web MIDI, so **every listen that matters is his Chrome** · one composer
  tab per score · `apply_trims.lua` and the remap are GENERATED — edit the bank, not the file · **the curve-channel map is CACHED:
  any tool that writes a curve event must call `Composer.curveDirty()`** (§75, then §139 — found twice by two different doors) ·
  **a claim about ROUTING is a claim about STATE, not about the code** — twice in two days "by construction" was wrong and his ear
  caught it both times.

**Open questions:**
- **Q1b — libraries. CLOSED 2026-09-18.**
- **Q2 — the call.** LGMF 2026, unread at his word: *"don't need to look it up now."*
- **Musical, his, not urgent** (PLANNER): "continuous, not sparse" (LG-2) against "lots of rests" (LG-4/5/8) · does the piece open
  with a morph (LG-1) or a bespoke section (LG-6) · **who, if anyone, inherits the piano's struck role** · the presentation score's
  pitch form (in C, or transposed?) at 2b.

**Blockers:** none.

**Standing warnings for this repo:** ⚠ `export_print` and `export_video` share `Coords.ensembleFrame` — a change to the frame math
moves BOTH · never bind **5300** or **4800**, they are piece #5's · the loopMIDI ports are `LG`-prefixed for the same reason · the AI
never saves from its own browser pane (principle 9) · the in-app browser has no Web MIDI · **the composer's lanes are laid out by CSS `nth-child` rules in `composer.html`, the curve windows A · B · C over the last three — a lane added to `TRACKS` needs its rule, and `palette_check` does not look** (RUNNING_LOG §183) · **a server route that `require`s engine code keeps the copy it started with** — after a build that changes `morph.js` or `model_bank.js`, say "restart the server" as well as "reload the tab" (§181).

**Checks this piece owns:** `node tools/sequence_check.js` (**180**) · `node tools/dyn_table_check.js` (**51**) · `node tools/test_snapshots.js` (**30**) · `node tools/palette_check.js` (**198**) · `node tools/roster_check.js` (**3** over **339** voices, **26** pending — 1m.4.1) ·
`node tools/test_written_pitch.js` (**10** + a control) · `node tools/spectrum_check.js` (**35**) · `node tools/sequence_notation_check.js` (**64**, 2d · 2e.3 · 2f · §462) · `node tools/check_rules.js` (**33**, 2e · 2k.1 · §502's (9)) · `node tools/decisions_needed.js` (2e.4) · `node tools/vibes_pitch_check.js` (**65**, 1u) · `node tools/vib_marks_check.js` (**33**, 2g · 2h · 2i · 2k.5) · `node tools/eh_figure_check.js` (THE LOCK, **106**, §560) · `node tools/layout_shield.js --write` on HEAD / `--diff --expect` after (THE SHIELD for any layout change, 2h.1) ·
`node tools/check_screen_edges.js --ir piece-lgmf` · `node tools/check_print_edges.js --ir piece-lgmf` (2c, Chrome, ~1 min each) ·
`node tools/check_ceilings.js --all` · `node tools/model_bank.js --validate`. Run the palette ones after any change to `TRACKS`,
`sandbox/instruments.js` or `notation/registry/ensemble.json`. **Every other battery's status, and why, is in `docs/NITS.md`.**

---

## §3 Principles

*(Lessons never to repeat. Numbered, append-only. **1–18 are inherited from piece #5's §3**
— one line each here; the full text, dates and lab-journal sections are in
`septet_2026/docs/PROJECT_JOURNAL.md` §3. Most bite only once the code is here. Verified in
this repo only when they bite.)*

1. Check Reaper input monitoring before blaming the instrument (#3 P1).
2. When a working reference exists, diff the files; don't iterate guesses (#3 P2).
3. The IR schema is a gate on the file — a new overlay kind enters the schema in the same
   commit or the page is rejected and deleted. Snapshot first (#4).
4. Never `git add -A` — stage explicit paths (#4 D30).
5. Only delete IDs you created in the same breath (#4).
6. MIDI thru must never listen to the loopMIDI output ports (#4).
7. Schedule playback with a ~150 ms lead (#4).
8. Object ids are per save — never delete or replace by id alone (#5).
9. Verify against the composer's running server; never hold his port, never save from the
   AI's pane; a hidden pane never fires `requestAnimationFrame` (#5).
10. When downstream meters freeze at identical values, dump mute / solo / routing first (#5).
11. Learn a plugin's vocabulary by diffing the GUI's change, not by guessing from strings (#5).
12. Measure the layer that reaches the INSTRUMENT, not the layer you built. Print the MIDI (#5).
13. Never queue what cannot be un-queued; Chrome does not implement `MIDIOutput.clear()` (#5).
14. Where a note is started by one piece of routing, it is stopped by the same one (#5).
15. Write the assertion after the number, never before it (#5).
16. Build on a `zz-ai-` copy from the FIRST command, not the second (#5).
17. The notehead's left edge is the moment; the go line marks displacement (#5 D49).
18. A checker that tests one half of a rule is worse than no checker. When a rule names two
    classes, the gate tests both or says in writing which it does not (#5).

*This piece's own:*

19. **A copy-forward carries the standing RULES whole, not only the code** (2026-09-17; the
    lesson of #5's dropped RHYTHM, RUNNING_LOG §2). At every port, check the new CLAUDE.md
    against the source's heading by heading.
20. **Prove the copy whole BEFORE changing it** (2026-09-17, RUNNING_LOG §13). Piece #5 copied,
    patched, then verified — so a red test could be the copy or the patch. Committing the
    byte-exact copy first and running everything against it costs one staging pass and buys a
    baseline: after that, every red has exactly one possible cause. It paid the same day —
21. **The file, the app's intent and the rack's layout are each necessary; only the RECORDING of the rack is the proof**
    (2026-09-19, RUNNING_LOG §75). Three text layers were green — the score data, the headless MIDI capture, the UVI parts —
    and the sound was wrong, because the fault lived in a cache between a load and a play that no fresh reading exercises.
    His one recording of the rack, read back by `dump_recorded_midi.lua`, found it in minutes. When he says it sounds wrong
    and the text says it is right, record the rack before arguing with the text.
    five checks went red at the re-palette and each was classified in minutes.
21. **`cmp` proves a file was copied; it cannot prove the LIST was right** (2026-09-17, §13).
    266 of 266 files were byte-identical to a leave-list that was wrong by one, and the missing
    file was a test's dependency — invisible until the test ran. **Run what you copied.**
22. **A rule that names a part by ID must be checked against the parts that EXIST** (2026-09-17,
    §17). `layout.js ensembleFor()` throws on an override for an unknown part; the inherited
    `video-jury` realization named the previous piece's bass clarinet, and print and the jury
    video would have died on their first layout. No battery touched it. **When a palette
    changes, grep the registries for the old instrument names, not just the code.**
23. **When a measurement and an assertion disagree, find out which is wrong before editing
    either** (2026-09-17, §18). The engine put the double bass's low E at ySs −3 and the test
    expected −2.5; the engine was right. The reflex to move the expectation is how a wrong
    number becomes a green test — principle 15's cousin.

---

## §4 Decisions

*(Append-only: ID, date, decision, why, what was rejected.)*

- **D1** *(2026-09-17, composer: "yes the instrumentation correct")* — **Instrumentation =
  three pairs plus percussion:** english horn + bassoon · horn + trumpet · cello + double
  bass · percussion. Seven players. Source: his note of 2026-09-04 (COMPOSITION_NOTES LG-1).
  The percussion instruments are not yet named.
- **D2** *(2026-09-17, composer: "same format as others")* — **Same delivery format as
  pieces #4 and #5:** animated scrolling score with the same animated devices; presentation
  score (video + print); performance score later.
- **D3** *(2026-09-17, composer: "yes go with copy-forward, start the PM kit")* — **Base =
  piece #5's stack, ported by copy-forward of selected folders with the instrument palette
  rewritten.** *Why:* it is how #5 was made from #4 (its D1), both halves verified in a day;
  this repo starts clean, with only what Lake George needs. *Rejected:* clone-and-prune —
  610 commits of Tempus history and research in every cold session's way. *Not re-opened
  today:* a shared engine package (#5's D1 put it "after the septet"); copy-forward does not
  close that door (RUNNING_LOG §5).
- **D4** *(2026-09-17, AI, on the lineage's precedent — #5 D5)* — **Ports 5400 (score) /
  4900 (sandbox)**, distinct from #5's 5300/4800, #4's 5200/4700, #3's 5100/4600. *Why:* #5's
  performance score is still to be built, so both repos' servers will run together.
- **D5** *(2026-09-17, composer: "a")* — **Commit at the natural wrap of an approved chunk;
  push automatically after every commit**, staging explicit paths only. The rule of pieces
  #4 (D30) and #5 (D8), adopted here at his word. *Why (as put to him):* it is his
  established rule, and it keeps the record safe off this machine. *Rejected:* (b) commit at
  each wrap but ask "push now?" every time. *Not assumed from the earlier pieces:* that word
  was given per repo and a push is outward-facing, so it was asked once here.
- **D6** *(2026-09-17, composer: "english horn, getting now, use xsample double bass, the
  same percussion lib as 2piano2perc; I need to acquire a bowed vibraphone library")* —
  **The libraries:** bassoon · horn · trumpet = **IRCAM Solo Instruments 2** (read from the
  manual, RUNNING_LOG §9; the library of piece #4) · cello = **Xsample**, #5's recipe ·
  double bass = **Xsample** · percussion = **Spitfire Abbey Road Orchestra Percussion**,
  piece #2's library (its journal decision 4) · english horn = **being acquired**, library to
  be named · **a bowed vibraphone = still to acquire.** *Why Xsample for the bass (AI
  reading, his word was only "use xsample"):* one string model for the cello + bass PAIR —
  the same mechanism, the same controller behaviour, and the pair is a unit of the piece
  (LG-1). *Not chosen:* SI2's CONTRABASS.
- **D7** *(2026-09-17, composer: "I know we were using multiple ports there, but are probably
  changing the design here … bring over any of the Spitfire instrument definitions … set up some
  scaffolding … when the time comes, put in the actual instruments")* — **Percussion = ONE port
  (`LGPerc`), one channel per instrument; one Spitfire instance per instrument as one Reaper track
  filtering on its channel; techniques = instrument × beater, GENERATED from a catalog
  (`bank/aro_percussion_catalog.json`) + a selection (`bank/perc_selection.json`) by
  `tools/apply_perc.js`, never typed by hand.** *Why:* Spitfire cannot switch instruments by MIDI
  (#2's decision 5), so the channel IS the instrument; one player, so one port carries sixteen,
  and the schema's per-technique `port` gives a second when needed; All-in-One is byNote, so a
  beater's block of keys is a technique with a range, like an SI2 roster entry. *Rejected:* #2's
  eight-port per-event channel→port routing (built for two percussionists and cross-port
  snippets) · hand transcription of the key maps (35 instruments, up to 48 keys each — the one
  fragile build). *Also at his word:* the double bass → Xsample, confirmed ("yes double bass
  xsample"). RUNNING_LOG §19.
- **D8** *(2026-09-17, composer: "y xs")* — **The english horn = Xsample** (the track he made is named
  "English Horn XS"; D6 had it "being acquired, to be named"). Its roster comes from #3's Xsample woodwind
  map at 0c. RUNNING_LOG §20–21.
- **D9** *(2026-09-17, AI, on the count — "bsn 18" — and #5's `Fluteb` precedent; he made the ports)* — **The rack layout:** ten
  tracks in score order; each SI2 instrument TWO UVI instances on two ports (`LGBassoon` + `LGBassoonb` …), instance 1 = Ordinario
  then the browser's order to 16 parts, `b` = the overflow + three Ordinario copies as the curve parts; Kontakt 8 for the Xsample
  three; one Spitfire track per percussion instrument when chosen. *Why:* 18–20 presets do not fit 16 parts, and on UVI a channel
  IS a preset, so a curve channel must be a COPY (#5 §274). *Rejected:* fewer presets per instrument (he loaded them all); curve
  channels on other presets (wrong sounds). RUNNING_LOG §23.

---

- **D12** *(2026-09-18, composer: "a yes vibes gets its own lane", and on the engraving "confirmed" — one staff, treble clef, non-transposing)* — **THE BOWED VIBRAPHONE HAS ITS OWN LANE: eight instrument lanes, `layoutVersion` 7.**
  It took lane **5**, between Percussion and Cello, so META moved 7 → 8 and the curve windows A/B/C 8·9·10 → 9·10·11;
  everything from lane 5 up shifted one down and `restoreData` migrates a v6 save (one uniform `layer >= 5` step).
  *Why:* the opening sustains it continuously — it holds two overlapping pitches while individual instruments come in
  and beat against each one (LG-15) — so it is a **voice**, not a technique on the percussion track, and a lane is what
  makes it writable. *Rejected:* keeping it inside the Percussion lane (no layout change, but one lane cannot carry both
  the small metals and a sustaining pitched instrument, and the opening needs the vibraphone held while the metals stay
  free). *The cost, accepted:* `Coords.ensembleFrame` reflows, which moves **print and video together** (the standing
  warning) — the eight parts come from `notation/registry/ensemble.json`, so both exporters follow it without an edit.
  **It is the same PLAYER as Percussion** (the septet has one percussionist), so parts 4 and 5 are joined by a **BRACE**,
  the standard mark for several staves belonging to one player — not a bracket, which would mean a section.
  **Engraving, his confirmation:** a single treble staff, non-transposing, F3–F6 sounding (53–89); a grand staff belongs
  to the marimba, and LG-15's two pitches read better as a dyad on one staff than split across two.
  RUNNING_LOG §48.

- **D13** *(2026-09-18, composer: "ok lets record this as a decision and prevent flipping to cc7 for everything")* — **THE DYNAMIC
  MECHANISM IS #5's, UNCHANGED: VELOCITY IS THE DYNAMIC; CC7 SHAPES A HELD NOTE; THE TRIM LIVES ON THE FADER.** The AI had
  proposed, after the 0d run, to make CC7 the dynamic for every pitched instrument (RUNNING_LOG §54). He interrogated it —
  *"is this what was happening in piece 5? … or am I mistaken"* — and he was not mistaken: #5 built a VELOCITY remap
  (velocity per curve height per instrument), used CC7 only for the drawn curve of a held note and as a small trim on layered
  samplers, and never as the ensemble's dynamic. **Standing rule: no flip to CC7-for-everything.** *Why:* the proposal was
  forced by two instruments, not by the ensemble — every other instrument responds to velocity as #5's did (english horn 18 dB
  · cello 18 · vibraphone 28 · double bass 17 · bassoon 12, the flute's case). *The open exception:* **horn and trumpet**, whose
  loaded SI2 ordinario gives 4–5 dB across the whole velocity range. **He is looking into it** — a velocity-layered SI2 preset
  would close it with a swap; failing that, those two alone would take CC7. RUNNING_LOG §55.

- **D14** *(2026-09-18, composer: "lets assume this works, will reveal itself in composition")* — **PHASE 0 IS CLOSED WITHOUT
  RUNNING 0h.** The gate — every track sounding **from the score app through its own port** — is not performed; it becomes a
  phase-1 expectation, proved by the first note he plays while composing. Also skipped at his word: the remap's four-height
  audition, and the percussion heard against the winds (**its fff = fff trims stand unjudged by his ear**). *Why:* every
  segment after the port is measured and one chord is approved (§49–§59); the only untested link is the browser's Web MIDI,
  exercised for two pieces on this machine, and a failure there is loud and immediate — a wrong `LG` port name shows as one
  silent instrument, an unreadable remap bank as unremapped velocities. *Rejected:* a ceremonial gate run, on his standing
  rule against verification that a plan does not name. RUNNING_LOG §61.

- **D15** *(2026-09-19, composer: "for Niente, I think A is fine inside, but I would like to have the option of starting the
  sequence from nothing and then ending the sequence to nothing")* — **NO NIENTE INSIDE A SEQUENCE'S WAVES; SILENCE BELONGS TO
  ITS EDGES.** The waves swell between two WRITTEN dynamics (ppp … fff); a fade in or out reaches true silence. *Why:* the
  calibrated law has nothing below ppp — the drawn bottom is the ensemble's floor, not zero — so true niente inside a wave
  would mean a note whose drawn height is a fader position and no longer its written dynamic, for the whole piece. At the edges
  it is a one-way window (the morph's own `cc7Fade`) laid over whatever is underneath, and costs the notation nothing.
  *Rejected:* niente inside the waves now (option B) — offered and declined; the AI recommended A. RUNNING_LOG §121–§122, §127.
- **D16** *(2026-09-19, composer: "the transition probably doesn't need to be overthought … I'll just have to extend the first
  things or shorten whatever so that the morph starts on their next breath")* — **A SEQUENCE IS JOINED TO A MORPH BY HAND. NO
  LINKAGE IS BUILT.** What the tools owe him instead is an ENDING he can join to: fade out or just end × the players ending at
  different times or together, the fade following the shape (PLAN 1d.8; the morph gets the same four when he revises it).
  *Why:* a player is one line, so every transition reduces to when each player switches — and moving a few first notes does
  that exactly, with his ear in the loop. *Rejected:* a hand-over item where the morph is told each player's pitch and where in
  a breath it stands (§124, written and then not written); and the cheap version — matching the orders and warning on a
  collision. **His word governs: "I don't think this impacts our build."** COMPOSITION_NOTES LG-40 · LG-42, RUNNING_LOG §124–§125.
- **D17** *(2026-09-19, composer: "There is the curve crescendo that we have been using for several pieces now … what's the
  issue with using this mechanism?" and "there should be some solid documentation about this")* — **THE BANK CARRIES EVERY
  PITCHED INSTRUMENT'S MEASURED FADER CURVE.** `tools/build_remap_card.js` wrote `cc7Curve` only for the instrument whose
  REGISTER rides on CC7 (the vibraphone), so `cc7ForHeight` answered 127 for the other six and **no drawn dynamic in the piece
  moved them** — D13's "CC7 shapes a held note" could not happen. The builder now writes all seven from `bank/balance.json`,
  which 0d had measured on the curve channels all along; the rest of the bank is byte-identical. Two laws, one per sampler:
  UVI 40·log10, Kontakt 60·log10. *Why that source:* it is this rack's own measurement, per instrument. *Rejected:* borrowing
  the vibraphone's curve for the six (6 dB wrong on the UVI three), falling back to the long-used `probes/cc7_map.json` (6 dB
  wrong on the Kontakt three), a new probe, and stepping the level by velocity per breath — all four proposed by the AI before
  it read the record, which is why the rule now stands in its memory. **Consequence: every drawn note in the six scores now
  follows its drawn height, and none of them has been heard since.** RUNNING_LOG §128–§130.
- **D18** *(2026-09-20, PLAN 1e; composer: "in the tuba piece and in the last piece, we always made crescendos from zero … CC7
  zero to CC7 max … a normalized one")* — **THE DYNAMICS LAW: TWO KINDS OF NOTE.** A STRUCK note — the velocity is the dynamic.
  A SHAPED note — struck at its instrument's **mf velocity for that pitch**, its level carried by the fader (CC7) on a **curve
  channel**; MAIN ch 1 never carries a moving CC7. *Why:* his recording read back showed every shaped note struck at its top's
  velocity (127) with CC7 moving only 63 … 127, about 12 dB — *"between two high dynamic levels"*. mf for ALL seven: the level
  lost against a struck fff is 3.9 … 5.4 dB, uniform since 1b, so one rule keeps the balance. *Rejected:* mf for the brass alone.
  The machinery was piece #5's, per note (`wc.cc7Abs` · `wc.velAbs`); only what the tools write changed. `docs/DYNAMICS_LAW.md` ·
  RUNNING_LOG §137–§144.
- **D19** *(2026-09-20, PLAN 1d.10; composer, LG-51: "not up to the full 127")* — **THE DYNAMICS TABLE: A STATED RANGE IS WHAT
  SOUNDS.** Every written dynamic has a CC7 value of its own, `fff` = 127 and **4 dB a written step** through each instrument's
  MEASURED fader curve; a curve drawn full for notation is performed between its two written values (`mp → ff` ≈ 69 → 109).
  Amends D18's "the shape's top is the full fader". *Why:* under D18 two ranges of equal depth sounded the same. RUNNING_LOG
  §145–§150.
- **D20** *(2026-09-20, PLAN 1g; composer: "the attacks are very loud")* — **IN A SEQUENCE, ONE SCALE:** every SUSTAINED note a
  sequence writes is shaped — mf strike, curve channel, the fader held at its table value — moving or not. *Why:* a struck `pp`
  sat ≈ −10 dB and a shaped `pp` ≈ −28 dB, so a straight box after a waves box stepped up 10 … 18 dB. *Rejected:* a straight box
  struck at its written velocity (two scales in one sequence). A STRIKE is not reached by it. RUNNING_LOG §157–§158.
- **D21** *(2026-09-20, PLAN 1h; composer, RUNNING_LOG §163 · §168)* — **THE BLOOM ON A TAKE, READ AS ASSIGNED, ON THE JUST
  PITCH:** a take chosen in the morph's PITCHES pulldown is dealt once and frozen; both players of a pair hold a note → two voices
  on their own just pitches, cents kept · one alone → the partner doubles it where it can. **The strikes drawer is where the
  pitches are heard and range conflicts resolved**; the panel only reads. The actuals keep the pitches through recall → vary →
  save → insert. The morph is on D18 · D19 (H3, `morph_dyn.js`). *Rejected:* choosing the pitches in the morph panel · the
  tempered pitch. RUNNING_LOG §162–§171.
- **D22** *(2026-09-20, PLAN 1i; composer: "a, as assigned in the take, held still" · "a")* — **THE VIBRAPHONES ARE THE BLOOM'S
  FOURTH ROW, HELD STILL:** one note each, as assigned, never doubled, never bending, FOLLOWING the bloom's one shape; an arc of
  their own = a second bloom with only their row ticked. One lane, TWO SEATS: the take is read by `lane:seat`. RUNNING_LOG
  §172–§176.
- **D23** *(2026-09-20, PLAN 1j; composer: the note lengths "seem regular, predictable")* — **THE MORPH BREATHES ROUND EACH
  PLAYER'S OWN MAXIMUM**, ON from the start: `of max` 0.65 · `±` 1.3 s · `outlier` 0.1, the sequence drawer's three length dials;
  an actual filed before keeps its breaths. The engine has its OWN copy of the rule, the twin of `sequence.js` `dealSpan` — tune
  one, tune the other. *Rejected, for now:* one shared breath module for both tools — the morph's revision. RUNNING_LOG §177–§181.
- **D24** *(2026-09-21, PLAN 1l; composer, LG-56 … LG-60)* — **THE COUNTERPOINT SECTION'S FIRST ROUTE: RHYTHM TAKES MADE IN TEXTURE,
  ASSEMBLED IN A CLONE OF THE SEQUENCE DRAWER** — the Rhythm sequence panel: a SILENT harmony row (the map: pitch + the intended written
  dynamic) under a rhythm row of boxes, each an excerpt of a rhythm take; every dot reads its player's pitch and level from beneath; a
  dot takes the INTENDED WRITTEN LEVEL, struck at the remap's velocity; onsets on different players are never quantized. Built end to
  end (`1l.1` … `1l.7`) and composed with (`LGMF-Rseq-01`). *Rejected:* a layer on the sequence drawer (his call, "reviewed after this
  version") · `MT` as the rhythm machine (Texture, his correction). **Then his verdict in use — *"this tool is not working the way I
  expected it"* — and D25.** What becomes of the panel is not decided. RUNNING_LOG §185–§214.
- **D25** *(2026-09-21, PLAN 1m; composer, LG-63 … LG-72: "as an alternate module to the rhythm one")* — **A TEXTURE TAKE IN THE
  STRIKES DRAWER, BUILT ONE STEP AT A TIME, EACH USED BY HIM BEFORE THE NEXT IS LAID OUT.** A `source` switch in the rhythm area (the
  strike · a texture take); a take's attacks as a top row of marks, switched on; under every ON mark a COLUMN orchestrated with the
  drawer's left side. **A column's players ARE its ticks** — tick = on = dealt = sounds; a fresh column is empty; the drawer is a VIEW of
  one column, the others dealt offline by the drawer's own code; no order of operations. `strike_drawer.js` unchanged — mixins.
  *Rejected, by his tests:* the circles as the drawer's one set of ticks (§227) · who sounds apart from the ticks (§228 · §231).
  RUNNING_LOG §214–§233.
- **D26** *(2026-09-21, PLAN 1m.3; composer, LG-73: "120 ms is fine, and yes, hear strike follows it")* — **DURATION: A STANDARD
  SHORT OF 120 ms**, in the bar and kept with the pattern — every column note, the claves, and `hear: strike` on a texture take; a
  `length` per column in seconds (his A of §235), shared by a multi-selection; a player's own by a double-click on their circle; the
  lengths drawn as bars. STRUCK notes held N seconds (DYNAMICS_LAW §1). RUNNING_LOG §234–§238.
- **D27** *(2026-09-23, PLAN 1n.1; composer, "b" to the two ways put in RUNNING_LOG §301)* — **A VOICE WITH NO CURVE COPY TAKES ITS SET
  FADER ON ITS OWN CHANNEL.** A sampled short note is a fader set once, not a moving controller, so it goes out on instance 1's part for
  the voice with its residual pre-armed before it — where a plain note gets its 127 today; every voice of every instrument reaches the
  one scale (B2, §264) without a rack change. A `follow` on such a voice still needs a curve copy and stays velocity alone, struck on the
  ladder, the status saying so. *Rejected:* copies of each short voice on the `b` instances (his rack work; only the copied voices reached).
  DYNAMICS_LAW §3 Rule 4.
- **D28** *(2026-09-22, PLAN 1m.4; composer, LG-81 · LG-82 · LG-83)* — **THE LENS: THE COLUMN OWNS ITS ORCHESTRATION, THE PANEL EDITS
  THE SELECTION.** Every voice knows itself as DATA — `kind` (pitched · key · fixed), `loud` (velocity · mod wheel), `keys` where by key
  (`tools/roster_check.js`); the orchestration panel shows and edits the selected column(s) and keeps only a DEFAULTS memory; THE ONE RULE
  for a take (§251); the column a PASSIVE indicator — one gesture, select: click · SHIFT+click the range · CTRL+click one. **BINDING
  since: THE SHIELD** — the strike mode (strikes · rhythm · long tone) behaves exactly as before `1m`; a required verification of every
  step of `1m` · `1n` · `1o` · `1p`. His standard for the rest (LG-82): the expedient rule, functionality preserved, troubleshooting
  avoided. *Rejected:* mother → child · templates (§248) · controls on the column itself, the double-click of `1m.3` (§252).
  RUNNING_LOG §240 … §261 · §279 … §283.
- **D29** *(2026-09-22, PLAN 1o; composer, LG-84 · LG-85, his three decisions §277)* — **A TEXTURE PATTERN IS A DOCUMENT OF ITS OWN,
  CARRYING A COPY OF ITS ONSETS.** Named, several per texture; a texture load is always EMPTY; on disk in `bank/patterns.json`, the
  FIFTH store, on the sequence library's rules; `texture ▾` starts one, `pattern ▾` recalls; the drawer's own Insert writes it the
  sequence's way (the range, one group + one META bar, the document into `databases.patterns`, in place from its META bar). *Rejected:*
  one pattern per texture name brought back on load (the code before) · a save protection on Texture (§254 — dropped once the pattern
  carries its own onsets). RUNNING_LOG §254 · §255 · §276 … §278 · §291 … §295.
- **D30** *(2026-09-22, PLAN 1n; composer, LG-86 … LG-99)* — **ONE SCALE FOR SHORT AND HELD IN THE TEXTURE TAKE (B2).** A short note
  keeps its LADDER velocity and goes out on a curve channel with its fader set once from the RESIDUAL beside `STEP_DB` (1.71 + 2.29 =
  4 dB a name); a held note `sample | follow | auto`, auto = follow when the level moves a written step; levels absolute, a generate
  overwrites; a range is the selection — `flat` · `ramp` · `pointillistic` · `waves`; the mod wheel untouched; `1f` OUT. One helper,
  `texture_dyn.js`, read by SPACE, the preview and Insert. *Rejected:* B1, a wider velocity ladder (the english horn, the cello and the
  double bass left five to seven decibels short, §263) · B3, mf on every short note (the attack timbre his piece-1 ear moved away from —
  kept as the fallback if B2's set fader misbehaves in his rack). RUNNING_LOG §262 … §275 · §296 … §301. DYNAMICS_LAW §3 Rule 4.
- **D31** *(2026-09-24, PLAN 1q; composer, LG-103 · LG-104 · LG-105; his ear, §318)* — **A TAKE'S HARMONY ONTO A SELECTION IN THE
  SCORE — AND A STRUCK NOTE KEEPS ITS VELOCITY THROUGH IT.** The harmony strip at the top right whenever pitched notes are selected: a
  take from the sequence drawer's own menu dealt onto the selection (each note its own player's note and cents), `back`, the take named
  on the note and on the card, `shuffle` · `seed` within the note's own take's series, the dyn box through the card's one rule; CTRL+drag
  the marquee, ALT+click the stack. **DYNAMICS_LAW §3 Rule 5:** a note's level lives in its KIND as much as in its fields — un-plaining a
  struck note for a bend or a seat pins `velAbs = recVel` · `cc7Abs {127,127}`. *Rejected:* a clone of the drawer's takes menu (its
  `opts` instead, §312) · a bent note simply DRAWN (§318 — the drawn scale's floor lifted his velocity 45 to ≈ 87; his ear: *"it seems
  louder"*). RUNNING_LOG §306 … §320.

- **D32** *(2026-09-25, composer: "working title Recombination")* — **THE WORKING TITLE: _Recombination_.** Recorded at his word with
  checkpoint #6 of session 15; no reason given, none inferred. The repo, the folders and the ports keep their names (`septet_LGMF_2026`,
  the `LG` ports) — a title is not a rename. COMPOSITION_NOTES LG-113 · RUNNING_LOG §381.

- **D33** *(2026-09-24, PLAN 1r · 1s; composer, his "a" §323 · "away from the partner" §324 · his "A" §328)* — **THE MORPH READS THE
  TAKE AND THE WRITTEN DYNAMICS.** Under CONVERGE a take is the ARRIVAL: each player opens a semitone AWAY FROM THEIR PARTNER (the higher
  up, the lower down) and closes onto their own just note, cents kept; the vibraphones held still. The morph's level is set by `min` ·
  `max` in written dynamics, the engine's `dyn.base` · `dyn.amount` derived and hidden, so every stored render stays byte-identical.
  *Rejected:* the take refused under M3 (the panel before, §322) · `dyn amount`, the half-swing round a hidden `base` — why the top never
  came down (§326). Open: `min` as a hard floor (§329). RUNNING_LOG §322 … §329.
- **D34** *(2026-09-25, PLAN 2a; composer, §332 … §337)* — **THE STAVES.** `notation/ir/piece-lgmf.ir.json` is the MAIN notation file
  (NAMING §1); the percussionist's brace is a JOINED lane — a SEVEN-LINE unpitched staff in his order (sleigh bells … bass drum), no clef,
  a note ON its instrument's line, over the vibraphone's treble staff; the presentation score IN C (`video-jury`), the parts transposed;
  a fixed frame on every print page. *Rejected (deferred, his to reverse):* the percussion as metric figures — without `--bricks` the
  extractor promotes the strikes to 156 beamed `trance-stream` chunks, the tuba's notation, before the note unit is decided (§338).
  RUNNING_LOG §330 … §339.
- **D35** *(2026-09-25, PLAN 2c; composer, his design §340 verbatim · his deferral §347)* — **THE PAGE EDGES: TWO RULE-SETS.** SCREEN —
  the constant sweep: every page tiles one span, t0 and tω at the same x every page, long graphics cut like paper, a stamp clamped right
  but a go-time indicator NEVER moved, ink may enter the right margin, never the gutter. PRINT — the cut placed by the objects, as late
  as the rules allow (a GC whole, a duration line's 2 ss stub, beams never). The margins a rule on both; **every drawn kind names its edge
  class, or the screen gate fails.** Every specific value deferred to when the notation is in. *Rejected:* print's D59 ownership + fixed
  reserves (*"quite a bit of space in right margin"*) · the screen's §404 buffer (a 0.22 s dead zone before each cut). RUNNING_LOG §340
  … §349; NOTATION_STANDARDS §5.
- **D36** *(2026-09-25, PLAN 1t; composer, LG-106 … LG-110)* — **THE MORPH BETWEEN TAKES.** Take A → take B, each player from their own
  note to their own note by lane:seat, cents kept; ONE `duration` box = `carrier.span`, the starts scattered, no two together; the
  engine's re-key for a distant pitch; the vibraphones a switch dial — one re-strike, the breath CUT at the moment, the seats 3 s apart;
  the release HOLDS B (`carrier.releaseHolds`); a missing player flagged; the joins with the sequences BY HAND. *Rejected:* a pacer · the
  fold box (a body longer than the gliss folds everyone back toward A — hidden) · the engine's release as it was (it sent every player
  back to A under the fade, §367) · the switch as a pitch step alone (it struck a stray note between the bars, §366). RUNNING_LOG §350 …
  §367; MORPH_NOTES §3.
- **D37** *(2026-09-25, PLAN 2d; composer, LG-111 · LG-112; `just_partials_notation.md` §1a)* — **THE SEQUENCE'S NOTATION, BEGUN ON THE
  ENGLISH HORN.** The tuba/#5 two-part form: a BLOCK at the entry (the open head LEFT of the go line, its column cents over partial/
  fundamental, the technique, the dynamic span) and the LANE — the level on ONE FIXED SCALE (niente … fff, the whole piece, every
  realization) + the follower · a pie counting each breath down · `(dyn)` labels at the turning points · a parenthesised cue at a
  same-pitch breath, a column at a new one. The just marks: |c| < 20 plain · 20 … 37 an arrowed accidental · ≥ 37 the quarter sign; the
  numbers Crimson Pro Light, the true minus, no ¢. *Rejected:* a GC at the entry · a per-block scale legend (the presentation fallback
  only) · opening/closing signs (the curve draws both fades) · ticks. Open: the page-start clash (§387). RUNNING_LOG §368 … §387.
- **D38** *(2026-09-26, PLAN 1u; composer, LG-114, his answers §388 · his word §397)* — **THE VIBRAPHONES CHANGE PITCH AT THEIR BREATHS,
  ON THE NOTES.** `1q`'s way: the breaths selected, `vibes ▾` on the harmony strip — `pool` (neighbours · within a tone · any: the take's
  own series, in range, under the ±5 ¢ tolerance) · `change` (never … always) · `draw` (random · exhaust · walk · shadow) · a seed ·
  `go`; the two seats one pool, kept apart; `back` + CTRL+Z the way back; one module for a sequence, a morph, any held passage — no
  engine file touched. A placed morph names its take on its MARKER (Insert writes it; an older one matched to its saved actual by the KEYS
  of the other players, the match written there, §395 · §401). *Rejected:* the change in the RECIPE (a sequence's / morph's own dial —
  reproducible, surviving a re-insert; the caveat of the notes accepted: a re-insert regenerates and the change is gone) · the first
  breath of each seat kept as dealt (the plan's call, reversed at his word *"the first pair selected does not change"*, §397) · a content
  match by time (eaten by `go` and by his hand, §401). RUNNING_LOG §388 … §401.
- **D39** *(2026-09-27, PLAN 2b; composer §405 · his "b" §407)* — **THE AUDIO OF THE PRESENTATION SCORE.** ONE WAV of the NAMED
  draft as saved, through his rack, as ▶ plays it (his own playback captured, 1076 / 1076 notes), raised by plain gain to −1 dBTP
  (+10 dB for Draft 01, `render_reaper.js --up`); re-rendered whenever a new draft is named, and the main notation file with it.
  *Rejected:* rendering from a working save · §407's other level options. RUNNING_LOG §405 … §407 · RENDER.md §4.
- **D40** *(2026-09-27, PLAN 2e; composer §408 — "nothing decided is decided twice")* — **THE ENGRAVING RULES ARE DATA.** Every
  placement, size, colour, face and the ladder is a ROW of `notation/registry/rules.json` with a `basis` and a §; the devices point at
  rows; `docs/ENGRAVING_RULES.md` is GENERATED; `tools/check_rules.js` holds them; a new notation begins with a DEVICE SHEET; a
  presentation score opens on a 4 s lead-in. *Rejected:* a value in code (change a ROW, never a code number) · re-deciding by eye what
  an earlier piece decided · the page-start clamp in place of the lead-in (§409). RUNNING_LOG §408 … §453.
- **D41** *(2026-09-27, PLAN 2f; composer §457 · §459 · §460)* — **THE FADE SIGNS.** `○—<` before the legend when a part enters from
  nothing · `—> ppp` on the last breath when it leaves · a new drawn kind `hairpin`. The line of the fade itself became D45's law.
  RUNNING_LOG §457 … §462.
- **D42** *(2026-09-27/28, PLAN 2g · 2h · 2i and the running order; composer §463 … §500)* — **THE VIBRAPHONE IN A SEQUENCE.** Every
  bow an open head at anchor A with its ring bar, two voices on one staff; the marks tied to the BOW (a name = the level, a timed
  hairpin = movement, `○` at the fades); two rows by SEAT, navy top · olive bottom, pinned to the lane's edges; the bars on two tracks;
  a dotted bow lead in the seat's hue and a swatch behind the head; the rows CROSS at a rhythmic unison; the percussion staff drawn only
  where it plays; no general courtesy natural. *Rejected:* a level curve, meter, follower, pie or header on the lane · a coloured head
  outline (§495) · the seat written at deal time (moot, §496) · a `♮` across time (§500). RUNNING_LOG §463 … §500.
- **D43** *(2026-09-28, PLAN 2j; composer's question §501)* — **THE FILE DISCIPLINE.** (1) one source, the named draft · (2) the main
  file `piece-lgmf` carries every device the moment his eye accepts it · (3) a new device is born on a PROTO page cut from a copy of
  the draft, then folded in by its flag · (4) no IR is ever hand-edited · (5) every extraction's command in its `provenance.build`.
  *Rejected:* a second page for a finished thing · his working saves feeding notation. RUNNING_LOG §501 · PLAN § 2j.
- **D44** *(2026-09-28, PLAN 2k; composer §504 … §506)* — **THE MORPH IS A SEQUENCE WHOSE PITCH MOVES.** The sequence's block plus a
  destination head and the gliss line, the orange curve to each part's travel; the vibrato word by SECTION KIND — "senza vib." carries
  through the sequences and the morphs, "ord." at the middle section's first note on every eligible part. *Rejected:* the tuba's
  separate header · the word keyed on the sample's technique (§503) or on the device alone. RUNNING_LOG §504 … §512.
- **D45** *(2026-09-28, PLAN 2l; composer §513 … §522, the arc accepted at his eye §527)* — **THE CURVE DRAWS THE INTENTION, NOT THE
  FADER.** A performer reads a shape in real time and makes eight dynamics and continuous change between two of them. A sequence's
  line comes from its RECIPE in written height, straight name to name, the fades by the same law, an ease at every corner; a morph's
  line is ONE ARC per part through its breath peaks (piece #5's D47); a name in brackets wherever the line reaches a dynamic; the
  closing sign by the recipe or the arc. *Rejected:* the fader trace (its 12-dot grid, the ladder's bends, a second law for the fades)
  · 2k.4's "no arc" (reversed, §516) · ticks on the level tube (twice, §521). Held: the hand-drawn style · the pitch line's corners.
  RUNNING_LOG §513 … §530.
- **D46** *(2026-09-28; composer §502 · §528)* — **THE OTTAVA.** Every head folds under the threshold (3 ledger lines) and takes the
  sign, the sequence block and its breaths included; the sign never flips; its hook is INK and ends on anchor B's spacer, the head and
  its column moved left to make room (`objects.ottava.hookIsInk`). RUNNING_LOG §502 · §528.
- **D47** *(2026-09-29, PLAN 2m; composer §531 · §622 · §637)* — **THE LONG TONE.** A held note of section 2 is an open head on its time,
  no go line, a navy bar its full length, tempered. EVERY held tone takes it "unless I say otherwise" (three quarter-second singles were
  said otherwise — one-offs). A chord carries ONE dynamic name on every part (`--chordDyn`): the page says the chord's dynamic, the save
  keeps the played velocities. *Rejected:* one name per note from its velocity (his "for now", closed §637). The chords' onsets are unisons too — each on its
  earliest member, written into the save (§638 held · §669 done).
- **D48** *(2026-09-29, composer LG-128 · LG-129; §548 · §549)* — **T8: VALUES WRITTEN, THE TN WAY, BY HAND.** In section 2 a short note
  carries a flag or a beam as PACE — relative, no bar, no meter, no count; the duration line is "incongruous" there. Every figure is
  dictated note by note — hands on the notes, never a rule about WHEN; a look his eye finds missing is built as a RULE, never as a hand
  (§577). The standards live in `docs/research/temporal_notation.md` §12 (S1 … S33) and are surfaced at each similar notation.
  *Rejected:* a duration line on short notes · a fitted meter and tuplets (kept as a "notch of speed" only) · automatic figure-building.
- **D49** *(2026-09-29, composer LG-147 · LG-149 · LG-150; §563 … §572)* — **THE BEAT FRAME.** A figure may carry a shown beat — one band
  per beat through the staff and a ball that drops on each — as an orientation aid beside the cursor, NOT a tempo to play in: its phase
  keeps the notes BETWEEN the beats (T10) unless he places notes on them; candidates from `tools/tempo_fit.js` drawn as a picture, his
  pick; a part's frames alternate navy · olive. *Rejected:* subdivisions on the page · a tempo above 100 a figure (soft; 108 taken once
  at his word) · the frame as the percussion's cue (tried three ways, set aside, §643 … §655).
- **D50** *(2026-09-30, composer LG-185 · LG-186; §611 · §612)* — **THE ONE-OFF.** A short struck note standing alone is the GC unit of
  pieces #4 and #5, field for field, a registered model (`byEnv.oneOff`): the go line at the GC's impact, the cue head, a flagged stem,
  the staccato dot, its own dynamic name, the section's word in the head's column. The cut is his (`--oneOffs`). Two quick notes are a
  beamed pair under ONE GC with no go line, the name on the first. *Rejected:* a hand-built GC on a plain note (the first try, withdrawn).
- **D51** *(2026-09-30 … 10-01, composer LG-215 … LG-235; §646 … §667)* — **THE PERCUSSION STAFF HAS ITS OWN RULE SET, THE NORMAL STAFF'S
  STANDARDS FIRST.** The seven-line staff's positions are instruments and its inside is not free: a lone strike is a BARE HEAD, unnamed;
  a stem only binds a figure (the pair — beamed eighths; the grace into a 16th); the stem 5.85 ss whatever the line; beams and flags
  clear the staff by the standard amount (the English horn's, ±9.39); ONE dynamic row under the staff, nothing dodges, a conflict is
  reported; an accent by its own head; the frame's lines between the second and second-to-last line; a GC may land a space below the
  staff. Where a standard of the five-line staff applies it is used before anything is invented (§666). *Rejected along the way:* the
  frame as the cue · the cue line · GC style 3 from the lane's top (registered, unused) · "just clear" beams · full-height grace stems.
- **D52** *(2026-09-30, composer §585 · §587)* — **THE APP'S VIDEO PAGE IS IN C.** The in-C decision (§336) had reached only the exports
  and the checks; the app's video and zoom views now lay out on the realized ensemble, the ⚙ working views keep the written pitch.
  His page and the lock are the same page.
- **D53** *(2026-09-30, composer §632)* — **A REFRESH READS THE LAST SAVE AND NEVER LOSES THE PAGE.** The app's R re-points a recorded
  `--scoreFile` at a fresh copy of the save and puts the IR back if the run fails. Until his server restart, a composer change is carried
  by the AI (`tools/reextract.js`).

## §5 Playbooks

*(Mode-specific procedures and gotchas. Piece #5's §5 holds the engine's playbooks; bring one
across when its system lands here and is first used.)*

---

## §6 Done

- 2026-09-17 — **0a** the PM kit installed (RUNNING_LOG §6).
- 2026-09-17 — **0b · 0g · 0i — THE PORT.** Piece #5's engine carried across and made this
  piece's: 266 files byte-exact, proven whole before anything changed, re-paletted by one
  asserted patch script, provisional recipes with the cello carried whole, the notation
  registry rewritten for seven new parts, and a save proved through to a notation page with
  the transposing parts at written pitch. Verified in the running app. RUNNING_LOG §12–§18.
- 2026-09-20 — **1e THE VOLUME FIX**, proven in his rack: MAIN ch 1 empty, every shaped note on a curve channel at an mf
  strike, CC7 reaching 0 (RUNNING_LOG §143 · §144).
- 2026-09-20 — **THE SEQUENCE DRAWER** (1d, its feature add, 1g) closed at his word and in use · **the bloom on a take**
  (1h · 1i · 1j) built and in use — his listens unreported (RUNNING_LOG §150–§182).
- 2026-09-21 — **SECTION 1 COMPOSED:** `scores/piece-LGMF-Sec01-v1.3-sec01-done.json`, named by him (commit `e6070fb`).
- 2026-09-21 — **`1l`, THE COUNTERPOINT ROUTE, built end to end** (`1l.1` … `1l.7`) and composed with — then set aside at his verdict for
  **`1m`**, whose first three steps are built and in his hands (RUNNING_LOG §199–§238).
- 2026-09-24 — **SESSION 13: FIVE TOOLS BUILT END TO END** — `1m.4` articulation · `1o` the save structure · `1n` dynamics in the
  texture take · `1p` the end time · `1q` a take's harmony onto a selection — each verified in the running app, his tests owed; he uses
  `1o` already and composes in `pointilistic01a` (RUNNING_LOG §279 … §321).
- 2026-09-25 — **THE NOTATION LAYER OPENED:** `piece-lgmf` the main notation file (`2a` the staves) · `2c` the page edges · `2d` the
  english horn's sequence notation prototype (`lgmf-eh-proto`) — and the morph grew: `1r` · `1s` · `1t` take A → take B (RUNNING_LOG §322 … §387).
- 2026-09-26 — **DRAFT 01 DONE:** `scores/piece-Recombination-Draft01-done.json` (1,086 objects), named by him, committed at his word.
- 2026-09-26 — **`1u` THE VIBRAPHONES' PITCHES ON THE STRIP built, and in use in section 3** (RUNNING_LOG §388 … §401).

---
- 2026-09-28 — **THE MAIN NOTATION PAGE CARRIES EVERY ACCEPTED DEVICE** — `piece-lgmf` from Draft 01: the sequences, the vibraphone's
  bows, the three morphs, the curve protocol (2d … 2l, folded at 2l.7; RUNNING_LOG §530). His eye on 0 → 279 owed.
- 2026-10-01 — **SECTION 2 NOTATED BY HAND** — the long tones and their chords, the English horn's figures to 398.4, every short note of
  the bassoon · horn · trumpet · cello · double bass, the percussion staff's rule set and its figures to 406 (`piece-lgmf`; session 18,
  RUNNING_LOG §531 … §667). His eye on each part owed; the percussion's lone strikes not yet named.

## §7 Human Notes

*(The composer's own to-dos and reminders. Reviewed at session end.)*

- **From piece #5, still live:** one required checkbox on the Tempus application's
  declarations page was an empty ☐ on 2026-09-17 — his to tick — then send the print score
  + the application. **Deadline 2026-10-15 23:59 CET.** *(Carried here only as a reminder;
  the record is #5's journal §2.)*
- **Read the LGMF 2026 call** — when he chooses (Q2). Drop the PDF in `docs/` as in #5.
- ✓ 2026-09-22 — **Name the percussion instruments** — fourteen Spitfire ARO instruments (`bank/perc_selection.json`), all in every
  menu (RUNNING_LOG §212 · §321); the bowed vibraphone on its own lane (D12).
- ✓ **Install the english horn library** — Xsample's `English Horn.nki` (D8, RUNNING_LOG §26).
- ✓ 2026-09-18 — **Acquire a bowed vibraphone library** — Xsample Mallets Extended (LG-9).
