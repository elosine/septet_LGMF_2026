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
3. ► **2m THE LONG TONE — SECTION 2's note unit** — **2m.1 … 2m.3 BUILT 2026-09-29 (Opus, §532 … §534; `piece-lgmf` carries 120 long tones in 36 groups, every gate green). ► 2m.4 HIS EYE:** reload the notation tab (no restart) → `piece-lgmf` → the video view → `303.5` (the first chord, four players) · `312.98` (the EH's v16 — `pp`) · `328.24` (six players) · `331.38` · `333.36` (the EH's low F3 on three ledgers — the name ABOVE the staff, the chain's side-with-room rule) · `361.04` · `370.34` (six) · `367.98` (the trumpet's single — still the old look, the tuba `ord`'s go line) · `383.35` (the EH's single — still the family look) · `407.05` (13 s, three players, into the sequence-2 entries at 427) · `z`. *(As it stood:)* (his pivot 2026-09-29, §531: *"let's address section two, one notation type at a time"*; PLAN § `2m`) — Opus
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

### SESSION 18 · CHECKPOINT #9 (mid-session checkpoint, 2026-09-30, Fable) — THE BASSOON'S SECTION 2 FROM 295 TO 399 BY HAND; THE ONE-OFF A REGISTERED MODEL; EVERY HELD TONE A LONG TONE; ► HIS EYE ON THE BASSOON, THEN THE BASSOON AFTER 399

- **The task:** the practical for section 2, part by part — the EH done to 398.4 (checkpoints #5 … #8); THE BASSOON begun at his word after
  checkpoint #8's `/postclear` and notated 295 … 399 at his dictation (RUNNING_LOG §611 … §622; LG-185 … LG-196), one commit each:
  - **THE ONE-OFF, a model** (§611 · §612; S24): `byEnv.oneOff` in `notation/registry/container.json` — piece #5's strike / #4's staccato unit
    field for field: anchor C (the go line at the GC's impact, the cue head 0.6 ss left of it), a 16th-flagged stem clearing the staff, the
    lane GC, the staccato dot, the band name on the head side; no accent · the section's word INTO the head's column after the name, centred
    (`instrPlace column` · `instrAlign middle` — the layout's nh-unit takes the change-rule word off the row) · every one-off its own name, a hand
    `dynMark` overrides · `--oneOffs P:T0:T1` in the extractor (the window his) · `check_rules` (7) holds the device equal to the strike — **33**.
  - **fourteen one-offs:** 295.971 mf (its "ord." in the column) · 300.497 mf · 301.878 mf · 336.926 f · 337.388 mp · 341.217 mf · 343.5 mf ·
    344.516 f · 376.136 f · 377.255 mf · 377.672 mf · 380.404 f · 380.828 f · 387.493 f (§612 · §618 … §621).
  - **the figures by hand** (§614 · §617 · §618): 322.836 · 323.328 plain dotted 16ths, f · mf on the row · 324.796 a flagged grace (mf) → 324.955 a
    flagged eighth with an accent → 325.25 a 16th with its beamlet beamed to 325.397 · 325.618, no names · 345.468 + 345.601 beamed 16ths with
    THE BURST'S GC at the first head's left edge, no go line (S14), mp — the lane GC, the AI's call.
  - **THE BASSOON'S FIRST FRAME** (§615 · §616): the green 93 (4 × 0.162) one tick back + 14.5 ms so p4 · p7 share 7.5 ms — the phase 322.3705,
    eight NAVY lines 321.723 … 326.259 over the pair and the figure (`tempo_candidates_bsn_322.html`).
  - **the long tones:** 393.277 · 398.443 by name at f (§621) — then **EVERY HELD TONE A LONG TONE** at his word (§622): `--longTones 289:427:all`
    (the five singles left took it; a held note inside a `--plainNotes` / `--oneOffs` window stays its hand figure's — the EH's quarters stand);
    **132** long tones; PLAN § 2m's held line DECIDED.
  - **the tools:** `--oneOffs` · `@drop:ARG` in `tools/reextract.js` (a hand or a window out of the build) · `--longTones T0:T1:all` ·
    `instrPlace` in `layout.js`. *(His times read ≈ 0.05 … 0.2 s earlier than the IR's onsets; the nearest note was always the one.)*
- **The deliverable:** `notation/ir/piece-lgmf.ir.json` — its whole build in `provenance.build` (the frames `--beatGridFit` × 7: the EH's six + the
  bassoon's 322). `check_rules` 33 (regenerate `ENGRAVING_RULES.md` FIRST) · the lock `tools/eh_figure_check.js` **106** (the EH's figures 1 … 4,
  the 317 frame, the 324.6 figure — NOTHING of the bassoon asserted yet) · the shield `piece-lgmf` alone (`layout_shield --write` on HEAD FIRST —
  the baseline dies with the scratchpad).
- **► The next concrete step — HIS EYE first, ask:** he reloads the notation tab (no restart) → `piece-lgmf` → the bassoon's stops `296` · `300.5`
  · `302` · `323` · `325` · `337` · `341.3` · `345.5` · `376.5` · `380.5` · `387.5` · `393.3` · `398.5` (play from `295`), and the five new
  long tones `337.3` · `343.2` · `368` · `395`. Collect; fix at his word — a hand via `node tools/reextract.js "" --hand 'wc-NNNN:{…}'`, a look via a
  rules row. THEN THE BASSOON AFTER 399: list its events (a node one-liner over the IR's chunks `ch-1-*` — the parts live in the chunks, the events
  carry none); he names each — a one-off: `--oneOffs 1:T0:T1` + `dynMark` hands · a figure: `--plainNotes 1:T0:T1` + `--beam t0-t1@1` + the hands
  in the EH's shapes (§596 · §607 · §614) · a frame: `node tools/tempo_fit.js --part 1 --from … --to … --html notation/research/tempo_candidates_bsn_<t>.html`
  → the link → his pick → `--beatGridFit 1:…`. After each change: `gen_engraving_rules` → `check_rules` → the lock → the shield → a RUNNING_LOG §
  (§623 next free) · an LG (LG-197) · the journal bullet · the state lines → commit + push.
- **`Resume reads:`** `docs/research/temporal_notation.md` §12 (S1 … S24 — surface them at each figure) · `tools/reextract.js`'s header
  (`@replace` · `@drop`). Nothing else beyond §2.
- **Pending him:** his eye on the bassoon 295 … 399 · the EH's eye at 376 … 398 (checkpoint #8) · the AI's calls: the 345.47 pair's GC at lane height
  (style 2 the alternative) · the one-off's 16th flag with no flag-clear max (the spec's) · the word after the name in the column · the 322.7 pair's
  names on the row with their dots above (§617) · the frame's lead and tail lines (`:noLead` · `:noTail`) · the hand-window exception in `:all` ·
  the 8va on the bassoon's D5s (2a.6 the clefs by register) · the sound side: take-notes without Rule 5's pin · the audio render (Draft 01's).
- **Deliberately uncommitted — the same 29 paths as checkpoint #8, all his, untouched** (`git status --short`: 5 modified + 24 untracked): his
  actuals `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index `bank/morph_models.json` · his libraries autosaved by his
  tab (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` · `rhythm_takes.json`) · his passage
  `bank/passages/lgmf-sec2.json` · his rack `reaper/LGMF_rack.rpp` · his named saves in `scores/` (five `piece-LGMF-Sec01-Sec02*`, seven
  `piece-LGMF-Sec03-Try*`, `piece-LGMF-draft01-preVibesFix` · `-VibesFix`, `pointilistic01a`) · `scores/piece-Recombination-Draft01-done.json`
  (his tab's save — every extraction reads a COPY). Resume on Fable.

### SESSION 18 · CHECKPOINT #8 (mid-session checkpoint, 2026-09-30, Fable) — THE EH'S SECTION 2 FROM 376 TO 398 BY HAND; THE FRAMES AT 376 · 384; FIVE SINGLES NAMED LONG TONES; `noTail` IN THE FIT; ► HIS EYE, THEN THE LOCK'S BLOCKS, THEN THE NEXT FIGURE AFTER 398.4

- **The task:** the practical for the EH's section 2, figure by figure — hands on the notes (LG-129), the looks his eye finds missing built as
  RULES (his §577 word). Built and pushed §605 … §610 (RUNNING_LOG; LG-179 … LG-184), one commit each, after checkpoint #7's `/postclear`:
  - **the frames:** 376 — the green 91 (7 × 0.0945) one tick forward, backed 1.5 ms so p4 · p8 share the shortfall (phase 375.768; eleven
    NAVY lines 375.107 … 381.722, §605) · 384 — the red 93 (7 × 0.092) 1.44 ticks back so p4 · p7 share (phase 383.760, §609), CUT at his word
    to **seven OLIVE lines 384.404 … 388.268** (§610); its lead beat dropped by the clamp inside the 383.35 long tone's bar — `keepLead` his
  - **the second layer at his dictation:** 379.88 rebeamed 1+2 · 3+4 · 5 a lone 16th, all staccato, f on 1, an accent on 4 on the head side,
    no GC on 3 (§606 · §607) · 375.77 f on 1 with a decrescendo through 2 · 3, mf on 4 with a decrescendo to 8's end, every other name off (§606)
  - **the new figures:** 384.3 (1 · 4 · 7 lone eighths, 2+3 · 5+6 16th pairs, 8+9 an eighth pair; mf on 1) · 387.23 (four beamed 16ths under
    one slur, a crescendo into f on 4, the fifth a lone staccato 16th) · 389.7 (a grace slurred into 2; 2 · 3 · 4 beamed with the beamlet; the
    p on 4 kept); every other name off (§607 · §608). The 389.7 figure stands OUTSIDE any frame (his cut, §610)
  - **five of 2m's 18 singles named long tones** — 383.35 G3 · 391.0 D4 · 393.0 F♯4 · 395.3 E5 · 398.1 G♯5 (`--longToneAlso`, the flag's first
    use, §607 · §608); 13 singles still draw the old way until he names them
  - **the tools:** the fit's 7th field a COMMA LIST — `keepTail` · `keepLead` · `keepBoth` · `noTail` · `noLead` (`tools/notate_section.js`,
    §610; S13 notes it; `fit.lead` · `fit.tail` record the effective count) · the runner's `null` unset used (§606) · THE PARTS LIVE IN THE
    IR's CHUNKS (`ch-<part>-<id>`), the events carry none — read them before a hand goes on a note (§607: the cello's E4 shares an onset
    with the EH's G5 at 387.494)
  - the pictures `notation/research/tempo_candidates_eh_{376,384}.html`
- **The deliverable:** `notation/ir/piece-lgmf.ir.json` — its whole build in `provenance.build` (the hands of every figure; the frames
  `--beatGridFit` × 6: 295 · 298 · 317 keepLead · 340 · 376 · 384 noTail). `check_rules` 32 (regenerate `ENGRAVING_RULES.md` FIRST) · the lock
  `tools/eh_figure_check.js` **106** (figures 1 … 4, the 317 frame, the 324.6 figure, every slurred grace vs its parent — NOTHING from 337 on
  is asserted yet) · the shield `piece-lgmf` alone (`layout_shield --write` on HEAD FIRST — the baseline dies with the scratchpad).
- **► The next concrete step — HIS EYE first, ask:** he reloads the notation tab (no restart) → `piece-lgmf` → `376` · `380` · `384` · `387.3`
  · `390` · `393` · `398` (play from `375`, then from `383.5`). Collect his findings; fix at his word — a hand via `node tools/reextract.js ""
  --hand 'wc-NNNN:{…}'`, a look via a rules row. THEN THE LOCK'S BLOCKS for 337 · 340.1 · 342.65 · 345.3 · 375.77 · 379.88 · 384.3 · 387.23 ·
  389.7 and the 340 · 376 · 384 frames (the §589 · §590 block's pattern in `tools/eh_figure_check.js`), then THE NEXT FIGURE after 398.4
  (`node tools/tempo_fit.js --part 0 --from … --to … --html notation/research/tempo_candidates_eh_<t>.html` → the link → his pick → a
  `--beatGridFit` → the values by hand). After each change: `gen_engraving_rules` → `check_rules` → the lock → the shield → a RUNNING_LOG §
  (§611 next free) · an LG (LG-185) · the journal bullet · the state lines → commit + push.
- **`Resume reads:`** `docs/research/temporal_notation.md` §12 (S1 … S23 — surface them at each figure) · `tools/reextract.js`'s header.
  Nothing else beyond §2. A rules change: the row in `notation/registry/rules.json` via `docs/ENGRAVING_RULES.md` (a NEW field needs its
  pointer in `container.json`'s layout block, §600).
- **Pending him:** his eye on 376 … 398 · the 384 frame's lead beat (`keepLead,noTail`) · the 389.7 figure without a frame · the AI's readings:
  "last one f" at 387.23 = the fourth, not the lone fifth · the two decrescendos at 375.77 reach the last spanned note's END · the accent and
  the dot stacked under 380.555 · the names flipped ABOVE the beam-below groups (344.2 · 375.77) · the sound side: take-notes without Rule 5's
  pin (`wc-3454` · `3459` + 15 more in section 2) · the audio render (Draft 01's) · 13 singles of 2m unnamed.
- **Deliberately uncommitted — the same 29 paths as checkpoint #7, all his, untouched** (`git status --short`: 5 modified + 24 untracked): his
  actuals `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index `bank/morph_models.json` · his libraries autosaved by his
  tab (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` · `rhythm_takes.json`) · his passage
  `bank/passages/lgmf-sec2.json` · his rack `reaper/LGMF_rack.rpp` · his named saves in `scores/` (five `piece-LGMF-Sec01-Sec02*`, seven
  `piece-LGMF-Sec03-Try*`, `piece-LGMF-draft01-preVibesFix` · `-VibesFix`, `pointilistic01a`) · `scores/piece-Recombination-Draft01-done.json`
  (his tab's save — every extraction reads a COPY). Resume on Fable.

### SESSION 18 · CHECKPOINT #7 (mid-session checkpoint, 2026-09-30, Fable) — THE EH'S SECTION 2 FROM 317 TO 380 BY HAND; THE APP'S VIDEO PAGE IN C; THE GRACE FAMILY'S RULES; ► HIS PICK FOR THE 376 FRAME, HIS DYNAMICS, THE LOCK'S BLOCKS

- **The task:** the practical for the EH's section 2, figure by figure — hands on the notes (LG-129), the rules his eye finds missing built as
  RULES (his §577 word). Built and pushed §584 … §604 (RUNNING_LOG; LG-162 … LG-178), one commit each:
  - **THE APP'S VIDEO PAGE IN C** (§585 · §587): his eye found the page in F — the in-C decision (§336) had reached only the exports and the
    checks; now the video · zoom views lay out on the realized ensemble, the ⚙ views keep the registry's F.
  - **the figures:** 317 (twelve notes; the frame the red 91 one unit forward at 317.048, the lead beat kept; the values §590; dots on 2+3
    §603) · 324.6 (six beamed graces under a slur, RAGGED STEMMING, the GC style 2 on 7, mp with a hairpin to 6, dots on 7+8) · 337 (a grace
    slurred to 2, the slur 1.4 by hand; f · — · ff) · 340.1 (three grace-and-note pairs; 6+7 a 16th to an eighth; the frame the purple 93 at
    340.061, olive) · 342.65 (grace → 16th pairs; the 344.2 ragged group of FIVE, stems down) · 345.3 (a 16th, two beamed graces slurred) · the
    names thinned over 340 … 346 (f · mf · f · mp; the accent at 343.12) · **375.77** (1-3 · 4-7 beamed 16ths, 8 alone — names SHOWN) · **379.88**
    (five beamed 16ths, dots on 1-3, tenutos on 4-5 — names SHOWN). His save at 389.8 (D6 → D5) carried.
  - **the rules, in `temporal_notation.md` §12:** S20 the hairpin into a name · S21 a plain note is a struck note (no meter) · S22 the grace
    group's beam at the heads' scale, the stroke at the beam's corner slid 0.5 and balanced · S23 the GC style 2 (the beat ball's flight, the
    aperture 0.7; `objects.gc.styles`) · S8a ragged stemming, the stubs 2 ss the standard, the stroke by the beam's side · S6 a grace's stem
    follows its parent, the stroke mirrors with the stem (read from his LilyPond) · S7 a slur never under 1 · S10 a stem-down lone note's
    accent above; the tenuto glyph · the flag-clear max 10.5.
  - **the tools:** `tempo_fit --html` (the canvas as wide as the figure, the lengths as bars) · **`tools/reextract.js`** — the runner (its
    header is the manual: re-runs `provenance.build` on a fresh copy of his save, appends args, `@replace:old=>new` swaps one).
- **The deliverable:** `notation/ir/piece-lgmf.ir.json` — its whole build in `provenance.build` (the hands of every figure; the frames
  `--beatGridFit` × 4: 295 · 298 · 317 keepLead · 340). `check_rules` 32 (regenerate `ENGRAVING_RULES.md` FIRST) · the lock
  `tools/eh_figure_check.js` **106** (figures 1 … 4, the 317 frame, the 324.6 figure, every slurred grace vs its parent) · the shield
  `piece-lgmf` alone (`layout_shield --write` on HEAD FIRST — the baseline dies with the scratchpad). The pictures
  `notation/research/tempo_candidates_eh_{317,340,376}.html`.
- **► The next concrete step — HIS PICK, ask first:** he opens `http://localhost:5400/notation/research/tempo_candidates_eh_376.html` and
  names the 376 frame (the extent · the grouping · the phase) → `node tools/reextract.js "" --beatGridFit 0:<unit>:<every>:<phase>:375.859:380.797`
  (the picture's own line) → `node tools/gen_engraving_rules.js` → `check_rules` → `eh_figure_check` → the shield → commit (a §605, LG-179).
  Then HIS DYNAMICS on 375.77 · 379.88 (hands `dynMark` / `false`), then THE LOCK'S BLOCKS for 337 · 340.1 · 342.65 · 345.3 · 375.77 · 379.88 and
  the 340 frame (the §589 · §590 block's pattern in `tools/eh_figure_check.js`), then the next figure after 380.8
  (`node tools/tempo_fit.js --part 0 --from … --to … --html notation/research/tempo_candidates_eh_<t>.html` → the link → his pick → the values by hand).
- **`Resume reads:`** `docs/research/temporal_notation.md` §12 (S1 … S23 — surface them at each figure) · `tools/reextract.js`'s header.
  Nothing else beyond §2. A rules change: the row in `notation/registry/rules.json` via `docs/ENGRAVING_RULES.md` (a NEW field needs its
  pointer in `container.json`'s layout block, §600).
- **Pending him:** the 376 frame · his dynamics at 375.77 · 379.88 · the names flipped ABOVE the beam-below groups (344.2 · 375.77 · 380.555)
  by the side-with-room rule — reads? · a slur over the 344.2 group · the sound side: take-notes without Rule 5's pin (`wc-3454` · `3459` +
  15 more in section 2) · the audio render (Draft 01's) · the AI's calls: the 8 graces' slurs into their notes at 340.1 · 342.65 (classical),
  the 344.2 group without a slur, the tenuto's width the head's.
- **Deliberately uncommitted — the same 29 paths as checkpoint #6, all his, untouched** (`git status --short`: 5 modified + 24 untracked): his
  actuals `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index `bank/morph_models.json` · his libraries autosaved by his
  tab (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` · `rhythm_takes.json`) · his passage
  `bank/passages/lgmf-sec2.json` · his rack `reaper/LGMF_rack.rpp` · his named saves in `scores/` (five `piece-LGMF-Sec01-Sec02*`, seven
  `piece-LGMF-Sec03-Try*`, `piece-LGMF-draft01-preVibesFix` · `-VibesFix`, `pointilistic01a`) · `scores/piece-Recombination-Draft01-done.json`
  (his tab's save — every extraction reads a COPY). Resume on Fable.

### SESSION 18 · CHECKPOINT #6 (mid-session checkpoint, 2026-09-29, Fable) — FIGURES 2 · 3 · 4 OF THE EH'S SECTION 2 IN; T10 AND THE PICTURE; THE COLUMN PASS, THE SPAN RULE, THE FRAMES AS BANDS IN TWO COLOURS; ► HIS EYE, THEN THE NEXT FIGURE FROM 302.1

- **The task:** the practical for the EH's section 2, figure by figure, bespoke — hands on the notes, not rules (LG-129) — with the RULES his
  eye found missing built as rules, never as hands (his §577 word). Built and pushed at his word, §573 … §583 (RUNNING_LOG; LG-151 … LG-161):
  - **figure 2** (295.456 … 297.306): the values — 1+2 · 3+4 eighth pairs, 5 · 6 flagged eighths, mf on 1, accents on 2 · 6 (§573); the grace's
    f → mf; THE BEAT FRAME 93 bpm at 295.186, navy (§564 … §572)
  - **figure 3** (298.815 … 300.695): the values — 1+2 beamed 16ths + a slur, 3 · 4 flagged eighths with staccato dots, 5+6 an eighth pair, 7 a
    flagged eighth, mf + an accent on 1 (§577; 1+2 · 5+6 · 7 the AI's by S4); the frame the purple 86 (0.699 s) at **298.247** — notes 2 and 6
    ON their lines, the rest between, the tail beat 301.742 kept by hand (§579 … §582) — six lines, olive
  - **figure 4, THE BURST** (301.556 … 302.106): beamed 16ths · ff + a decrescendo hairpin to 302.17 · staccato dots · no go line · the GC
    REMOVED at his word (§574 · §583)
  - **T10** in `tools/tempo_fit.js` — (D) THE BETWEEN PHASE (`--unit --every`, `--free 1,2` the notes that time each other, `--html` the picture:
    `notation/research/tempo_candidates_eh_298.html`, served by his score server) (§573 · §574)
  - **the rules:** THE SPAN RULE — a hand hairpin and its name clear what they span (`objects.hairpin.spanClearSs`, §576) · THE COLUMN PASS — a
    dynamic beyond an articulation in its column, the ottava and the word riding, the slur lifting the column whole (layout, §577) · THE FRAMES
    ALTERNATE navy · olive, lines and ball (`objects.tick.gridColours` · `objects.beatBall.colours`, §578) · THE BANDS 0.3 ss wide (`objects.tick.gridWSs`,
    §581) · the frame clamp reads a frame already placed (§576) · `--beatGridFit …:keepTail|keepLead|keepBoth` (§582)
  - the standards **S13a · S14 … S19** in `docs/research/temporal_notation.md` §12 · **THE LOCK** `tools/eh_figure_check.js` **75 GREEN** — figures
    1 … 4 on the video page; the span rule and figure 3's column asserted on the WORKING page (in F, his page) too, the ladder's rung read
- **The deliverable:** `notation/ir/piece-lgmf.ir.json` — its whole build command is its `provenance.build` (the fold's + `--longTones` +
  `--plainNotes` + `--beam` × 6 + the hands + `--rest` + `--beatGridFit` × 2); re-extract from a scratchpad COPY of Draft 01 (2j's discipline).
  `check_rules` 32 (regenerate `docs/ENGRAVING_RULES.md` after EVERY IR change — it carries the ladder's per-page report) · the shield
  `piece-lgmf` alone · the screen gate NOT run since §550 (no new drawn kind — the bands and the colours are fields on existing kinds; offer it).
- **► The next concrete step — HIS EYE first, ask:** he reloads the notation tab (no restart) → `piece-lgmf` → `301.5` (the burst without its GC)
  · `298.5` (figure 3's column, the olive bands, notes 2 · 6 on their lines). **Then THE NEXT FIGURE after the burst, from 302.1**, by the same
  method: `node tools/tempo_fit.js --part 0 --from 302.1 --to <the figure's end> [--free …] --html notation/research/tempo_candidates_eh_302.html`
  → the link → his pick → a `--beatGridFit` hand; then the values note by note at his word, as hands appended to the IR's build command (a
  scratchpad runner script with an args array — never a long Bash line). **SURFACE S1 … S19 at the first of these.** After each change: the
  lock · `check_rules` + `gen_engraving_rules` · the shield (`layout_shield --write` on HEAD FIRST — this session's baseline dies with its scratchpad).
- **`Resume reads:`** `docs/research/temporal_notation.md` §12 (S1 … S19) for the next figure; nothing else beyond §2. For a rules change: the
  row in `notation/registry/rules.json` via `docs/ENGRAVING_RULES.md`.
- **Pending him:** his eye at `301.5` · `298.5` · the tail line at 301.742 (keep or drop) · the band's width (0.3; 0.25 the fallback) · figure 3's
  AI-chosen values (1+2 16ths · 5+6 eighths · 7 a flagged eighth) · figure 2's wide pair 3+4 (the low stem 10 ss to the high note's beam — or two
  flags) · the burst's hairpin end 302.17 · **which page rules:** his eye is on the WORKING page (in F); the lock asserts the video page (in C) —
  where a mark's side depends on the stem the two differ (§573 note 6's accent · §574 the burst's marks above on F) · the screen gate offered.
- **Deliberately uncommitted — the same 29 paths as checkpoint #5, all his, untouched** (`git status --short` at this checkpoint: 5 modified +
  24 untracked): his actuals `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index `bank/morph_models.json` · his libraries
  autosaved by his tab (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` · `rhythm_takes.json`) · his
  passage `bank/passages/lgmf-sec2.json` · his rack `reaper/LGMF_rack.rpp` · his named saves in `scores/` (five `piece-LGMF-Sec01-Sec02*`, seven
  `piece-LGMF-Sec03-Try*`, `piece-LGMF-draft01-preVibesFix` · `-VibesFix`, `pointilistic01a`) · `scores/piece-Recombination-Draft01-done.json`
  (his tab's save — every extraction reads a COPY). Resume on Fable.
- **§584 … §587 (2026-09-30, Fable; LG-162 · LG-163) — DONE:** his choice of figure, 316.8 … 323.14 (twelve EH notes; the six between 302.1
  and 316.8 passed over): the tool's candidates 87 … 99 bpm (7 or 6 units of ≈ 0.09 … 0.10 s), the picture regenerated with a canvas as wide
  as the figure (§586: 480 px/s kept, one beat of room each side, sideways scroll) · HIS EYE FOUND THE APP'S VIDEO PAGE IN F (§585: the
  in-C decision reached only the exports and the checks; the record's "video page (in C)" was always the node layout) · FIXED (§587,
  `notation.html` alone: `ensForView()` — video · zoom in C, the ⚙ views in F; verified in the running app both ways). The "which page
  rules" pending item is CLOSED: his page and the lock are the same page. **► He reloads → `317`; HIS PICK for the frame (the extent — all
  6 s or the fast cluster 317.05 … 319.5 · the grouping · the phase; a `--free 1,2` run offered by S15); this frame NAVY by S19.**
- **§589 (2026-09-30, Fable; LG-164) — DONE:** HIS PICK — the red 91 bpm one unit forward, the phase 317.048 (notes 1 · 5 · 7 within 4 ms of a
  line, 12 on one): `--beatGridFit 0:0.0945:7:317.048:317.052:323.002`, eleven navy lines 317.048 … 323.663 · the twelve as PLAIN NOTES
  (`--plainNotes 0:316.8:323.14`: black heads on their time, the plain stem, a band name per note — S9's thinning his). The shield `piece-lgmf`
  alone · the lock 75 · `check_rules` 32 · the rules page regenerated. **► He reloads → `317`; then HIS STEMS AND BEAMS on the twelve — the
  values note by note as hands (S1 … S19 surfaced), the names thinned.**
- **§590 (2026-09-30, Fable; LG-165) — DONE:** the values at his dictation — 1 a grace (no slur, mf) · 2+3 · 5+6 beamed 16ths · 4 a quarter, p ·
  7+8 beamed eighths, a crescendo into 8's f · 9 a flagged eighth, mp · 10 a flagged 16th, mf + accent + dot · 11 · 12 flagged 16ths, dots, mp · f;
  the other names off. TWO RULES fell out: **S20 THE HAIRPIN INTO A NAME** (the tip stops `beside` before the name it reaches — layout) · **S21 A
  PLAIN NOTE IS A STRUCK NOTE** (his "the curve meter is just briefly sneaking in" on 11 · 12: take-re-pitched notes carried a level curve; the
  `--plainNotes` pass now takes recVel and drops the curve — extractor). The lock a §589 · §590 block, **92 GREEN** · `check_rules` 32 · the shield
  `piece-lgmf` alone. **► He reloads → `317` (play from `316.5`); HIS EYE — then the next figure.** For him: `wc-3454` · `wc-3459` carry no Rule-5
  pin (no `velAbs` · `cc7Abs`) — they SOUND as shaped notes at the drawn height in the composer; 15 more take-notes in section 2 the same.
- **§591 (2026-09-30, Fable; LG-166) — DONE:** p10's 16th flag was the max at work (10.39 needed) — the max **10.5** at his word, the flag above
  the staff · THE FIGURE AT 324.6 (eight notes, 324.677 … 325.956): six beamed grace 16ths (`grace` + `--beam`; the stroke on the first stem only
  by a new hand `slash false`) under one slur into 7 · 7+8 beamed eighths, a GC on 7 (the head's left edge on its time), the accent on the head
  side · every band name shown (1 mp · 2 ff · 3 mf · 4 f · 5 mf · 6 mf · 7 f · 8 f — his to decide). The lock 92 · `check_rules` 32 · the shield
  `piece-lgmf` alone. **► He reloads → `324.5` · `321`; HIS DYNAMICS for the eight + his eye on the grace beam (full size; a grace-scaled beam is a
  build, offered) · 8's f above the staff (the side-with-room rule) · the accent under the head against the slur's end; then the lock's block.**
- **§592 (2026-09-30, Fable; LG-167) — DONE:** THE GRACE GROUP'S BEAM at the heads' scale (S22: the thickness and the step × 0.707 — layout + render)
  · THE GC AT THE BEAT BALL'S HEIGHT (S23: `objects.gc.geom` 'lane' | 'beatBall'; the plain note's GC takes the beat ball's flight — gc.js one
  copy, the item and the instance carry `geom`) · the 324.6 figure: the slur 1 → 6 · 1 mp + a hairpin to 6 · the f on 7 alone (2 … 6 · 8 off) · the
  lock's block for 324.6 (102 GREEN). The shield caught a `grace: false` key on every tip (a tuba hash moved) — made conditional; `piece-lgmf`
  alone. **► He reloads → `324.5` (play from `325`); HIS EYE — then the next figure.**
- **§593 (2026-09-30, Fable; LG-168) — DONE:** THE GC'S APERTURE 70 % (`objects.gc.beatBall.spread` 0.7: the duration 0.6 → 0.42 on the beat-ball
  geometry — `gc.js presetFor`, one copy for the arc, the ball and the page-edge reach; on the page the arc 62 px wide, was 88) · RAGGED
  STEMMING on the 324.6 grace group (his name; S8a: `beamStub` on the six + `beamStubShortSs 1` on the first — the stubs 2.29 ss, one length,
  the first stopping a space above the F5; the squiggle for the slash) · the lock re-pointed, 104 GREEN · `check_rules` 32 · the shield
  `piece-lgmf` alone. **► He reloads → `324.5` (play from `325`); HIS EYE — then the next figure.**
- **§594 (2026-09-30, Fable; LG-169) — DONE:** the grace stroke's ORIENTATION BY THE BEAM'S SIDE (his "rotate 90deg … depending on down or up
  stemming": below → falls as at 292.75, above → rises; the inset slide follows) · THE GC REGISTERED AS STYLE 2 (`objects.gc.styles`: 1 lane · 2
  beatBall; the hand `gcStyle 1 | 2`, the plain note's default 2) · his schema question: it is §12 (S6 the grace · S8 the uneven group · S8a ragged
  stemming · S22 the grace beam), told him. The lock 105 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `324.5`; HIS EYE —
  then the next figure.**
- **§595 (2026-09-30, Fable; LG-170) — DONE:** the two ragged stubs measured from the beam stack's edge toward the heads — 292.75 **2.00** ss
  (`protrudeSs`), 324.6 **1.58** (the first stem 2.58 − 1): two laws, reported, his call · THE FIGURE AT 337 (337.006 A♯4 · 337.164 B3 · 337.792 G♯5):
  a grace slurred to 2, 2 a flagged eighth (stem 8.75 up), 3 a flagged 16th stem down with its dot; the names f · f · ff shown. The lock 105 ·
  `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `337`; HIS DYNAMICS for the three, then the lock's block and the next figure.**
- **§596 (2026-09-30, Fable; LG-171) — DONE:** the 317 frame's lead beat kept (`:keepLead` — inside the held note's bar, his "ok if in dur line";
  the runner's `@replace`) · the ragged stubs **2 ss the standard** for every group (S8a amended; 324.6's hand withdrawn) · the 337 slur by a hand
  `slurHeightSs` 1.4 (S7 notes it), the names f · — · ff · THE FIGURE AT 340.1 (seven notes 340.352 … 341.757: graces 1 · 3 · 5 each slurred to
  its note, 2 · 4 flagged 16ths, 6+7 a 16th beamed to an eighth with the beamlet; the names shown — 6 · 7's flipped above the beam-side row).
  The lock 105 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `316.5` · `324.5` · `337` · `340`; HIS EYE, his dynamics at
  340.1, then the lock's blocks (337 · 340.1) and the next figure.**
- **§597 (2026-09-30, Fable; LG-172) — DONE:** A GRACE'S STEM FOLLOWS ITS PARENT (S6 amended; `layout.js` before the unit's own rule; nine slurred
  graces on the page, three flipped — his "first one" at 340.1 was the mixed case; the lock asserts every pair) · the slur over a wide interval
  put to him (S7 already mirrors LilyPond: the head side, the ends at the heads, the height a quarter of the length to 2, the slope 1.1; options
  (a) as is · (b) a minimum height for short slurs · (c) the hand) · 343.12 (`wc-3532`) in range, clean, 50 ms at vel 61 — his to lengthen or
  raise · THE FIGURE AT 342.65 (eleven notes: pairs 1-2 · 4-5, 3 · 6 · 7 16ths alone, 8 a grace into the ragged group 9 … 11; names shown).
  The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `340` · `342.7`; HIS EYE, his slur call, his dynamics at
  340.1 · 342.65, then the lock's blocks and the next figure.**
- **§598 (2026-09-30, Fable; LG-173) — DONE:** the 344.2 ragged group of FIVE (the beam span replaced, 7 and 8 folded in, 8's slur unset, `stemDir
  down` on all five): the scaled beam below the staff at −5.39 / −4.82, the stubs 2, the squiggle falling; the names flipped above the staff (the
  side-with-room rule). The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `344`; HIS EYE — the names above, a slur
  over the group (his to add); then his dynamics at 340.1 · 342.65, the lock's blocks, the next figure.**
- **§599 (2026-09-30, Fable) — DONE:** his change at 343.12 (0.05 → 0.10 s, vel 61 → 90) carried into the IR by a re-extraction (the runner copies his save afresh); the name mp → f; every check green. The audio render untouched (not asked).
- **§600 (2026-09-30, Fable; LG-174) — DONE:** A SLUR NEVER UNDER 1 ss (his (b); `objects.slur.minHeightSs` + its container pointer — a new rules field
  needs one, found by the lock) · the section's names thinned to four marks (f · mf · f · mp), the rest off · THE ACCENT at 343.12 on the head side
  (S10 built for a stem-down lone note, scoped to the plain note) · THE FIGURE AT 345.3 (a 16th + two beamed grace 16ths). The lock 106 ·
  `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `340` … `346`; HIS EYE (a slur over the 344.2 group and the 345.6 pair, his
  to add), then the lock's blocks (337 · 340.1 · 342.65 · 345.3) and the next figure.**
- **§601 (2026-09-30, Fable; LG-175) — DONE:** THE SLASH on a beamed grace group pinned to the beam's corner (a post-pass after the beams are
  final; the flagged grace untouched) · the 345.6 pair slurred (below, 1.00) · THE TEMPO CANDIDATES 339.9 … 345.9 (21 onsets, the graces among
  them; 91 · 93 · 95 · 98 · 93 · 99 bpm; the picture `tempo_candidates_eh_340.html`). The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone.
  **► He reloads → `345.5`, opens the picture; HIS PICK for the frame — the extent (six seconds in one, or per cluster), the grouping, the phase,
  the free notes (the graces?) — then the frame by hand, the lock's blocks (337 · 340.1 · 342.65 · 345.3), the next figure.**
- **§602 (2026-09-30, Fable; LG-176) — DONE:** THE FRAME AT 340 his pick — the purple 93 (6 × 0.107 at the tool's phase 340.061; twelve olive
  lines) · the beamed grace's stroke slid 1 ss toward the heads (a rules field, the corner showing) · THE STROKE MIRRORS WITH THE STEM — looked up
  in his LilyPond install (the font's `flags.ugrace` rises, `flags.dgrace` falls; a render used each for its stem) and built (S6). The lock 106 ·
  `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `340` · `341.4` · `343.3` · `345.5`; HIS EYE, then the lock's blocks
  (337 · 340.1 · 342.65 · 345.3 · the 340 frame) and the next figure.**
- **§603 (2026-09-30, Fable; LG-177) — DONE:** dots on the 317.16 pair and the 325.6 eighths · the beamed stroke halfway (0.5) · equal protrusion
  above and below the beam = the stroke centred on the stack; the slide trades one for the other — put to him: (a) centred · (b) halfway as now
  · (c) centred + a longer reach. The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `317.2` · `325.6` · `345.5`;
  HIS CALL on the stroke; then the lock's blocks (337 … 345.3, the 340 frame) and the next figure.**
- **§604 (2026-09-30, Fable; LG-178) — DONE:** the stroke balanced (the far half + 2 × the inset — 0.67 above and below) · his save carried
  (`wc-3664` D6 → D5) · THE FIGURE AT 375.77 (1-3 · 4-7 beamed 16ths stem down, 8 a 16th alone; the names shown, flipped above the beams) ·
  THE FIVE AT 379.88 (beamed up; dots on 1-3; TENUTOS on 4-5 — `glyphs.json articulation.tenuto`, the articulation row's draws widened;
  head side by hand) · THE CANDIDATES 375.7 … 380.8 (13 onsets; 87 … 95 bpm; `tempo_candidates_eh_376.html`). The lock 106 · `check_rules` 32
  · the shield `piece-lgmf` alone. **► He reloads → `345.5` · `375.8` · `380`; HIS PICK for the 376 frame (the extent · the grouping · the phase),
  his dynamics on both figures, then the lock's blocks (337 · 340.1 · 342.65 · 345.3 · 375.77 · 379.88 · the frames) and the next figure.**
- **§605 (2026-09-30, Fable; LG-179) — DONE:** THE 376 FRAME his pick — the green 91 (7 × 0.0945) one tick forward, backed 1.5 ms so p4 and
  p8 share the shortfall (the two are 21.5 ms short of a beat apart): the phase **375.768**, p4 11 ms after its line, p8 10 ms before;
  `--beatGridFit 0:0.0945:7:375.768:375.859:380.797` — eleven navy lines 375.107 … 381.722 over both figures, nothing clamped. The lock 106 ·
  `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `376` (play from `375`); HIS EYE, his dynamics on 375.77 · 379.88, then
  the lock's blocks (337 · 340.1 · 342.65 · 345.3 · 375.77 · 379.88 · the 340 and 376 frames) and the next figure after 380.8.**
- **§606 (2026-09-30, Fable; LG-180) — DONE:** THE TWO FIGURES' SECOND LAYER at his dictation — 379.88 rebeamed 1+2 · 3+4, 5 a lone 16th (its
  `noteBeams` unset by `null`), the tenutos gone, dots on all five, f on 1, an accent on 4 (`articSide below`, the head side) · 375.77 the f on 1
  with a decrescendo through 2 · 3 (to 376.29), mf on 4 with a decrescendo to 8's end (377.81), every other name off. The lock 106 ·
  `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `376` · `380` (play from `375`); HIS EYE, then the lock's blocks
  (337 · 340.1 · 342.65 · 345.3 · 375.77 · 379.88 · the 340 and 376 frames) and the next figure after 380.8.**
- **§607 (2026-09-30, Fable; LG-181) — DONE:** THREE FIGURES AFTER 380.8 at his dictation — 384.3 (1 · 4 · 7 lone eighths, 2+3 · 5+6 16th
  pairs, 8+9 an eighth pair) · 387.23 (1 … 4 beamed 16ths under one slur, 5 a lone 16th with a dot) · 389.7 (a grace slurred into 2, 2 · 3 · 4
  beamed with the beamlet) · 383.25 A LONG TONE by name (`--longToneAlso wc-3640`, the flag's first use — 2m's single) · no GC at 380.39 (the
  split pair's first note took the beam device's cue; off by hand). The parts read from the IR's CHUNKS (the events carry none) — the cello's
  E4 at 387.494 left out. The names shown, his to thin. The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads →
  `383` · `384.5` · `387.3` · `389.8` (play from `382.5`); HIS EYE, his dynamics on the three figures, then the lock's blocks and the next
  figure after 390.5; the frame candidates for 384.3 … 390.5 offered.**
- **§608 (2026-09-30, Fable; LG-182) — DONE:** THE CANDIDATES 384.3 … 390.6 drawn (18 onsets; six shown beats 87 … 97 bpm; the picture
  `tempo_candidates_eh_384.html`; olive by S19) — his pick owed · the three figures' DYNAMICS at his dictation (384.3 mf on 1 · 387.23 a
  crescendo through the beamed four into f on 4, S20 · 389.7 the p on 4 kept; every other name off) · FOUR LONG TONES 390.7 … 398.4 by name
  (`--longToneAlso`; five singles named of 18). The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `384` ·
  `387.3` · `390` · `393` · `398`; the picture; HIS PICK for the 384 frame, HIS EYE, then the lock's blocks and the next figure after 398.4.**
- **§609 (2026-09-30, Fable; LG-183) — DONE:** THE 384 FRAME his pick — the red 93 (7 × 0.092) backed 1.44 ticks so p4 and p7 share the
  shortfall (29 ms short of a beat apart): the phase **383.760**, p4 14 ms after its line, p7 15 ms before; `--beatGridFit
  0:0.092:7:383.760:384.455:390.402` — eleven olive lines 384.404 … 390.844 over the three figures; THE LEAD BEAT DROPPED by the clamp (inside
  the 383.35 long tone's bar — `keepLead` his, as at 317). The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads →
  `384` · `387.3` · `390` (play from `383.5`); HIS EYE, then the lock's blocks and the next figure after 398.4.**
- **§610 (2026-09-30, Fable; LG-184) — DONE:** THE 384 FRAME CUT at his word — the last line 388.268, the four after it gone: the cluster's
  `last` 388.031 + a new `noTail` flag (the fit's 7th field a comma list now — `keepTail` · `keepLead` · `keepBoth` · `noTail` · `noLead`; the
  effective lead/tail recorded; S13 notes it) — seven olive lines 384.404 … 388.268, the 389.7 figure outside any frame; the lead beat still
  the clamp's. The lock 106 · `check_rules` 32 · the shield `piece-lgmf` alone. **► He reloads → `384` · `387.3` · `390` (play from `383.5`);
  HIS EYE, then the lock's blocks and the next figure after 398.4.**
- **§611 (2026-09-30, Fable; LG-185) — DONE:** THE BASSOON BEGUN — his one-off at 295.97 (`wc-3396`, B1, vel 73 → mf) as THE GC UNIT of pieces #4
  and #5 at his word (*"precisely that way … a model in our registry"*): **`byEnv.oneOff`** in the registry — #5's strike field for field without
  the dot and the accent (anchor C, the go line at the GC's impact, the cue head 0.6 left, a 16th-flagged stem, the lane GC, the band name on the
  head side) · `--oneOffs P:T0:T1` (the extractor; the window his) · `@drop:` in the runner (the first try — a hand on a plain note — withdrawn) ·
  `check_rules` (7) holds it equal to the strike, **33 GREEN** · the lock 106 · the shield `piece-lgmf` alone · S24. **► He reloads → `296` (play
  from `295`); HIS EYE — the flag16 · no clear max · the name under the head · the dot and the accent off, his to reverse; then the next one-off
  (a wider window, or the next note he names); the EH's eye at 376 … 398 still his.**
- **§612 (2026-09-30, Fable; LG-186) — DONE:** the one-off at his eye — THE DOT BACK (the strike's `nhDot`, not the accent) · THE SECTION'S WORD
  INTO THE HEAD'S COLUMN after the name, centred (`instrPlace column` · `instrAlign middle` = anchor C's columnAlign; the layout's nh-unit takes
  the change-rule word off the row) · EVERY GC ITS OWN NAME (`dynMark band`; a hand overrides — 300.497 mf over its ff) · the window to 302
  (300.497 · 301.878) · the gate (7) amended, `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads → `296` · `300.5` · `302`.**
- **§613 (2026-09-30, Fable; LG-187) — DONE:** THE PAIR AT 322.7 as one-offs (`--oneOffs 1:322.5:323.5`): 322.836 **f** · 323.328 **mf** by hand;
  D5, stems down, the column above with the ottava riding. **► He reloads → `323`.**
- **§614 (2026-09-30, Fable; LG-188) — DONE:** THE FIGURE AT 324.6 at his dictation — plain notes (`--plainNotes 1:324.7:325.7`), 1 a GRACE BEAMED
  to 2 (an eighth; the slash pinned at the beam's corner — S22 on a mixed group), 3 a 16th with ITS BEAMLET beamed to 4 · 5 (eighths); the names
  mp · mf · f · f · mp shown above (the beam below), his to thin; no slur (his word "beamed"). The lock 106 · `check_rules` 33 · the shield
  `piece-lgmf` alone. **► He reloads → `325` (play from `324.5`); HIS NAMES on the five, a slur his.**
- **§615 (2026-09-30, Fable; LG-189) — DONE:** THE CANDIDATES for the bassoon's 322 … 326 (seven onsets; 93 · 86 · 93 · 89 · 86 · 98 bpm at their
  between phases; `tempo_candidates_bsn_322.html`). **► HIS PICK — the extent (one frame or per cluster across the 1.47 s gap) · the grouping ·
  the phase · the free notes — then `--beatGridFit 1:…`, navy (the part's first, S19).**
- **§616 (2026-09-30, Fable; LG-190) — DONE:** THE BASSOON'S FIRST FRAME his pick — the green 93 (4 × 0.162) one tick back, then 14.5 ms forward so
  p4 · p7 share the 15 ms shortfall (the phase 322.3705: p4 7.5 ms before its line, p7 7.5 ms after); `--beatGridFit 1:0.162:4:322.3705:322.836:325.618`
  — one frame over the pair and the figure, eight NAVY lines 321.723 … 326.259, nothing clamped. The lock 106 · `check_rules` 33 · the shield
  `piece-lgmf` alone. **► He reloads → `323` (play from `321`); HIS EYE — the lead and tail lines his (`:noLead` · `:noTail`), his names on the
  five, then the next one-off or figure after 326.**
- **§617 (2026-09-30, Fable; LG-191) — DONE:** the bassoon at his eye — the grace UNBEAMED (1 · 2 flagged, `@drop` of the beam span) · the 322.7
  pair "standard but similar": PLAIN dotted 16ths (`--plainNotes 1:322.5:323.5` in place of the `--oneOffs` window; `nhStem flag16 · nhDot`), f · mf
  kept on the row · an ACCENT on the eighth at 324.955 (above, S10) · mf on the grace, the other four names off. The frame of §616 unchanged. The lock
  106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads → `323` · `325` (play from `321`); HIS EYE, then the next one-off or
  figure after 326.**
- **§618 (2026-09-30, Fable; LG-192) — DONE:** the bassoon 336.9 … 345.6 at his dictation — FIVE ONE-OFFS (`--oneOffs` × 2: 336.926 f · 337.388 mp
  their own; 341.217 · 343.5 · 344.516 at his mf · mf · f) · THE PAIR AT 345.47 as the burst shape (S14: plain 16ths beamed, the GC's impact at the
  first head's left edge, NO go line — `nhAnchor leftEdge`; the lane GC, the AI's call; mp on the first, the second unnamed). The lock 106 ·
  `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads → `337` · `341.3` · `343.5` · `345.5` (play from `336`); HIS EYE, then the
  next after 345.7.**
- **§619 (2026-09-30, Fable; LG-193) — DONE:** the bassoon's THREE AT 376 as one-offs (`--oneOffs 1:376:377.8`): 376.136 f (its own) · 377.255 ·
  377.672 mf by hand. The lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads → `376.5` (play from `375.5`); HIS EYE,
  then the next after 378.**
- **§620 (2026-09-30, Fable; LG-194) — DONE:** the bassoon's PAIR AT 380.25 as one-offs (`--oneOffs 1:380.3:380.9`), both **f** by hand. The lock
  106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads → `380.5` (play from `375.5`); HIS EYE, then the next after 381.**
- **§621 (2026-09-30, Fable; LG-195) — DONE:** the bassoon 387.5 … 398.4 — the ONE-OFF at 387.493 at f · the singles 393.277 · 398.443 NAMED LONG
  TONES (`--longToneAlso wc-3670,wc-3674`; seven of 18 named) at a single f each by hand. The lock 106 · `check_rules` 33 · the shield
  `piece-lgmf` alone. **► He reloads → `387.5` · `393.3` · `398.5`; HIS EYE, then the next after 399.**
- **§622 (2026-09-30, Fable; LG-196) — DONE:** EVERY HELD TONE IN SECTION 2 A LONG TONE, all instruments, at his word — the cut widened:
  `--longTones 289:427:all` (the five singles left — Db 337.18 · Vc 337.55 · 343.13 · Tpt 367.98 · Db 394.93 — take the device; a held note
  inside a `--plainNotes` / `--oneOffs` window stays its figure's, so the EH's quarters stand and the lock stays 106); the registry's sheet and
  PLAN § 2m's held line carry it. `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads → `337.3` · `343.2` · `368` · `395`; HIS
  EYE, then the bassoon after 399.**
- **§623 (2026-09-30, Fable, after checkpoint #9's `/postclear`; LG-197) — DONE:** THE HORN BEGUN at his dictation — TEN ONE-OFFS (`--oneOffs 2:…` × 6: 296.319 mf · 323.175 ff · 325.013 f · 336.966 f · 337.352 mp · 341.364 mf · 377.742 ff · 380.207 f · 386.168 f · 387.562 f) · THREE BURST PAIRS (S14 as the bassoon's 345.47: 16ths beamed, one lane GC at the first head's left edge, no go line — 301.962 ff + 302.162 fff · 344.189 f + 344.393 mf · 375.998 mf + 376.161 mf) · the CURRENT dynamics on every note (the band names, his to look at) · 345.486 not named, left as it draws; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`296.3` · `302` · `323.2` · `325` · `337` · `341.4` · `344.2` · `376` · `377.7` · `380.2` · `386.2` · `387.6`, play from `295.5`); HIS EYE and his dynamics, then the horn after 399 or the next part; the bassoon's eye (295 … 399) and the EH's (376 … 398) still his.** The AI's calls: the pairs' lane GC · both notes of a pair named · the 301.96 pair two octaves under one beam (C5 → C3, his eye).
- **§624 (2026-09-30, Fable; LG-198) — DONE:** THE HORN'S DYNAMICS AT HIS EYE — the three pairs ONE name each, on the first note (301.962 f · 344.189 f · 375.998 f; the seconds unnamed) · 323.175 f · 325.013 mf · 377.742 mf · 386.168 mf by hand · 345.486 A ONE-OFF at mp (`--oneOffs 2:345.4:345.6`; eleven horn one-offs, every short note of its section 2 on a device) · the bassoon's 301.878 f; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`302` · `323.2` · `325` · `344.2` · `345.5` · `376` · `377.7` · `386.2`); HIS EYE, then the horn after 399 or the next part; the bassoon's eye (295 … 399) and the EH's (376 … 398) still his.** The AI's reading: "377.6 MF" = the horn's 377.742 (the bassoon's 377.672 already mf).
- **§625 (2026-09-30, Fable; LG-199) — DONE:** THE TRUMPET BEGUN at his dictation — THIRTEEN ONE-OFFS (`--oneOffs 3:…` × 6: 302.090 mf · 322.363 f · 323.170 f · 325.269 ff · 341.370 mp · 343.128 mp · 375.949 mf · 377.416 f · 377.859 mp · 380.208 f · 384.687 mp · 385.298 mf · 387.741 p — the current names) · THE FIVE AT 344.19 plain 16ths beamed 3 + 2 (names shown, his to thin) · THE BURST PAIR at 385.95 (a GC on the first, no go line, the second unnamed) · THE FRAME CANDIDATES 343.1 … 345.7 drawn, the 343.13 GC included (`tempo_candidates_tpt_343.html`: six onsets, 86 … 98 bpm) · 295.477 not named, left; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`302.1` … `387.7`) and opens the picture; HIS PICK for the trumpet's first frame (navy by S19), his dynamics, then the trumpet after 399 or the next part; the horn's eye, the bassoon's (295 … 399) and the EH's (376 … 398) still his.** The AI's calls: the 385.95 pair in the no-go-line version, its second note unnamed · a one-off inside a frame (343.13), a first.
- **§626 (2026-09-30, Fable; LG-200) — DONE:** THE TRUMPET'S 295.48 A ONE-OFF TOO at his word (`--oneOffs 3:295.4:295.6`; `wc-3392` struck from recVel, f — fourteen trumpet one-offs, every short note of its section 2 on a device); the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`295.5`); HIS PICK for the trumpet's first frame (`tempo_candidates_tpt_343.html`, navy by S19), his dynamics, then the trumpet after 399 or the next part; the horn's eye, the bassoon's (295 … 399) and the EH's (376 … 398) still his.**
- **§627 (2026-09-30, Fable; LG-201) — DONE:** THE TRUMPET'S DYNAMICS at his eye (302.090 f · 322.363 mp · 325.269 mf · 341.370 mf · 343.128 mf, that one still a GC) · THE TRUMPET'S FIRST FRAME his pick — the green 98 (4 × 0.1525) at the tool's phase 342.888, from the line at 344.108 (`--beatGridFit 3:0.1525:4:342.888:344.189:345.71:noLead`): five NAVY lines 344.108 … 346.548 over the five, the 343.13 GC outside it; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`302.1` · `322.4` · `325.3` · `341.4` · `343.1` · `344.2`, play from `342.5`); HIS EYE — the tail line 346.548 his (`noTail`), his names on the five — then the trumpet after 399 or the next part; the horn's eye, the bassoon's (295 … 399) and the EH's (376 … 398) still his.** The AI's reading: the GC at 343.13 in the fit (six onsets), not under the lines.
- **§628 (2026-09-30, Fable; LG-202) — DONE (superseded at its ► by §629 below):** THE TRUMPET'S FIVE AT 344.19 — ONE NAME PER BEAM GROUP at his word: f on 344.189, mp on 345.438, the other three unnamed; the frame of §627 unchanged (five navy lines 344.108 … 346.548); the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`344.2` · `345.5`, play from `342.5`); HIS EYE — the tail line 346.548 his (`noTail`) — then the trumpet after 399 or the next part; the horn's eye, the bassoon's (295 … 399) and the EH's (376 … 398) still his.**
- **§629 (2026-09-30, Fable; LG-203) — DONE:** THE TRUMPET'S FIVE — THE TWO GCs OFF at his word (344.189 · 345.438: the beam device's own cue on each group's first note, unasked — `gc false · goLine false` by hand; a rule in its place offered, §629); the names f · mp (§628) and the frame (§627) unchanged; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`344.2` · `345.5`, play from `342.5`); HIS EYE — the tail line 346.548 his (`noTail`) — then the trumpet after 399 or the next part; the horn's eye, the bassoon's (295 … 399) and the EH's (376 … 398) still his.**
- **§630 (2026-09-30, Fable; LG-204) — DONE:** THE TRUMPET'S DYNAMICS 375.9 … 387.7 at his eye (375.949 f · 377.416 · 377.859 mf · 384.687 · 385.298 mf · the pair at 385.95 mf on its first note · 387.741 f; 380.208 f untouched); the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`376` · `377.5` · `384.7` · `385.3` · `386` · `387.7`); HIS EYE — the frame's tail line 346.548 his (`noTail`), the no-cue rule offered (§629) — then the trumpet after 399 or the next part; the horn's eye, the bassoon's (295 … 399) and the EH's (376 … 398) still his.**
- **§631 (2026-09-30, Fable; LG-205) — DONE:** THE CELLO BEGUN at his dictation — EIGHT ONE-OFFS (`--oneOffs 6:…` × 6: 300.342 mf · 301.722 mp · 322.191 mp · 323.172 mp · 377.406 ff · 387.494 ff, and the held singles 337.550 mp · 343.125 p TAKEN BACK FROM THE LONG TONE at his word — LG-196's "unless I say otherwise"; 130 long tones now) · the current names, no hand; every cello note of section 2 on a device; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He reloads (`300.4` · `301.7` · `322.2` · `323.2` · `337.6` · `343.2` · `377.4` · `387.5`); HIS EYE and his dynamics, then the double bass or the next part; the trumpet's eye, the horn's, the bassoon's (295 … 399) and the EH's (376 … 398) still his.**
- **§632 · §633 (2026-09-30, Fable; LG-206) — DONE:** HIS R AFTER A COMPOSER CHANGE FAILED AND REMOVED THE IR (the refresh re-read the runner's stale score copy: `ev-wc-3489` 81 vs his new 69) — the IR RESTORED, his change carried (the DB's A5 at 329.26 → A4), THE ROUTE FIXED in `score/server.js` (a fresh copy of the last Save; the IR put back on a failure) — **takes effect at his RESTART of the server, not exercised** (§632) · THE DOUBLE BASS BEGUN — FIVE ONE-OFFS (`--oneOffs 7:…` × 3: 295.772 mf · 299.686 mf · 300.421 ff · 302.147 ff · 322.873 mf, the last read from an unfinished sentence; §633); every short note of Hn · Tpt · Vc · DB on a device; the lock 106 · `check_rules` 33 · the shield `piece-lgmf` alone. **► He RESTARTS `node score/server.js`, reloads (`295.8` · `299.7` · `300.4` · `302.2` · `322.9` · `329.3`); HIS EYE and his dynamics on the double bass and the cello; the trumpet's eye, the horn's, the bassoon's (295 … 399) and the EH's (376 … 398) still his.** Learned: the app's R re-runs the recorded build AS IT STANDS — a `--scoreFile` copy recorded by the runner was the old score; a failed refresh removed the IR from disk.

### SESSION 18 · CHECKPOINT #5 (mid-session checkpoint, 2026-09-29, Fable built, Opus wraps) — THE EH'S FIRST TWO FIGURES OF SECTION 2 NOTATED BY HAND; THE SHOWN BEAT BUILT; ► HIS EYE ON THE BETWEEN-BEATS PHASE

- **The task:** the practical for the EH's section 2 (his pick at the `/postclear`), figure by figure, bespoke — hands, not rules (LG-129). Built
  and pushed at his word, §547 … §571 (RUNNING_LOG; LG-127 … LG-149):
  - **the plain note** (§547 · `byEnv.plainNote`, `--plainNotes`) · **T8 VALUES WRITTEN, the TN way** (§548: flags and beams, relative, no
    bar; the duration line "incongruous" here) · the stems (§553 · §554 · §556 · §561: the plain stem a tenth 4.5, flags clear the staff by 0.38,
    the max 9.5) · **the slur standard** (§555: LilyPond's from his install + Gould's ends; §560 the slur in the vertical clearance)
  - **figure 1 (289 … 293.9):** p1 a quarter pp + a cresc hairpin to 289.25 · a quarter rest at 290.2 · the grace (0.707, a slash, slurred)
    into p3 (an accent) · p4 a flagged eighth · p5 … p8 **HIS UNEVEN-GROUP SIGN** (§557 … §562: the heads stemless where played; a beam
    floating below on 2 ss stubs spanning the group; a hand-drawn stroke across the corner = "play the displayed notes in that much time as
    indicated by the beams, but slightly irregularly", PERFORMANCE_NOTES #18) · mp on p5, an accent on p6 · the section's "ord." 0.45 above
    p1's top ink (§561, a standard)
  - **figure 2 (295.456 … 297.306, six notes): THE SHOWN BEAT** (N-4, A7) — `tools/tempo_fit.js` (three candidate methods, §563); THE
    PROCESS his (§564: candidates → his eye → his pick and phase → a hand); the grid lines through the staff in the duration line's
    blue-grey at 0.3, one line per beat (§565 · §566 · §569); **the beat ball** (`beatBall`, a new animated kind — the tuba's GC ball,
    one per beat, in flight only over the grid, bouncing from 2 ss above the line's top to its foot, §567 … §571); the max 100 per figure
    (`gridMaxBpm`); the grid FITTED to its cluster (`--beatGridFit`: 1 line before, 1 after, never within 0.1 s of a neighbour); here
    **93 bpm (6 units of 0.108), the phase 295.186 — the beats BETWEEN the notes** (his concept, §571: the beat orients, it is not played
    on; every note 22 … 74 % of a beat from a line); PERFORMANCE_NOTES #19 (an aid to ONSET accuracy; the head's left edge the time)
  - the standards **S1 … S13** in `docs/research/temporal_notation.md` §12 (tentative; SURFACE them at the next similar notation — CLAUDE.md
    READ FIRST) · **THE LOCK** `tools/eh_figure_check.js` (30 decisions, GREEN — run after any change to the look) · clickable links are
    `http://localhost:5400/…` (HOW_WE_WORK; memory) — a `/docs/` route in `score/server.js`, live at his next server restart
- **The deliverable:** `notation/ir/piece-lgmf.ir.json` — its whole build command is its `provenance.build` (the fold's + `--longTones` +
  `--plainNotes` + `--beam` + eight `--hand` + `--rest` + `--beatGridFit 0:0.108:6:295.186:295.456:297.306`); re-extract from a
  scratchpad COPY of Draft 01 (2j's discipline). `check_rules` 32 · the shield `piece-lgmf` alone · `check_screen_edges` PASS.
- **► The next concrete step — HIS EYE, ask first:** he reloads the notation tab (no restart) → `piece-lgmf` → the video view → plays from
  `294` (the between-beats phase, the ball from higher, one line before). Then his word on the phase — keep, or try the other candidates
  the tool can now name. A look → a rules row or a hand (Fable, here); run `node tools/eh_figure_check.js` and the shield
  (`layout_shield --write` on HEAD FIRST — the baseline in the dead session's temp dir is gone) after any change.
- **`Resume reads:`** nothing beyond §2 for his eye. For the next figure or any similar notation: `docs/research/temporal_notation.md` §12
  (S1 … S13 — surface them). For a rules change: the row in `notation/registry/rules.json` via `docs/ENGRAVING_RULES.md`.
- **Pending him:** his eye on figure 2 (the phase) · the grace's f (a dynamic on a grace note — keep or drop) · N-4's rest: the fourth tempo
  candidate "between" in `tempo_fit.js` (the AI's suggestion, §571), a number or dot on a beat, the device sheet (line 1a: A7) · N-5 the
  micro counterpoint · N-6 the second layer continues on the next figures · the NOTATION PLANNINGS block above holds each item's state.
  **The AI's calls, his to reverse:** the grace 0.707 · the slur's ends at the head's centre · the stroke's geometry · the hairpin cresc ·
  the accent on the head side · the ball's rise 2 ss · the clamp gap 0.1 s.
- **Deliberately uncommitted — the same 29 paths as checkpoint #4, all his, untouched** (`git status --short` at this checkpoint): his actuals
  `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index `bank/morph_models.json` · his libraries autosaved by his tab
  (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` · `rhythm_takes.json`) · his passage
  `bank/passages/lgmf-sec2.json` · his rack `reaper/LGMF_rack.rpp` · his named saves in `scores/` (five `piece-LGMF-Sec01-Sec02*`, seven
  `piece-LGMF-Sec03-Try*`, `piece-LGMF-draft01-preVibesFix` · `-VibesFix`, `pointilistic01a`) · `scores/piece-Recombination-Draft01-done.json`
  (his tab's save — every extraction reads a COPY). `notation/ir/index.json` (the picker label, the extractor's) committed with this checkpoint.
- **APPENDIX — his word after the checkpoint (LG-150, §572):** *"what we have now is good … lock that in … call this the beat frame"* —
  figure 2's shown beat is **THE BEAT FRAME** (T9), locked: `tools/eh_figure_check.js` asserts its template too (33 GREEN). **The tool's
  phase MAXIMIZES THE NOTES' DISTANCE FROM THE BEATS** (T10, his agreement with §571). So **his eye on figure 2 is TAKEN** — the next
  concrete step becomes: **build T10 into `tools/tempo_fit.js`** — for the chosen grouping, search the phase (continuous, over one beat)
  that maximizes the smallest distance of any onset from a beat, print it beside the grid candidates (with each note's position as a % of
  a beat), and check it on figure 2 (expect a phase near 295.186; report, never re-extract without his word) — then the next figure by the
  same process (candidates → his eye → his pick → a `--beatGridFit` hand), the standards S1 … S13 surfaced. Resume on Fable.
- **§573 (2026-09-29, Fable, after the `/postclear`; LG-151) — DONE:** figure 2's VALUES by hand (1+2 · 3+4 eighth pairs beamed with `noteBeams 1`,
  5 · 6 single flagged eighths, mf on 1 on the row — `dynAboveBeam false`, accents on 2 and 6 on the head side — `articSide "below"` on 2) · the
  grace's f → mf · note 3's ottava checked (A5 sounding / E6 written ON the threshold — clears; the auto rule kept, it folds the next cluster's
  B5 on the working page) · **T10 BUILT** — `tools/tempo_fit.js` (D) THE BETWEEN PHASE (`--unit u --every n`, or every (B) candidate; the hand
  printed ready to paste); on figure 2 the tool says 295.172, his hand 295.186 (14 ms; the IR keeps his) · run on the cluster at 298.815 — the
  candidates in §573 (4 notes to 299.418 or 7 to 300.695; the unit ≈ 0.152 s either way; the shown beat 97 … 99 bpm at the cap 100, or 8 units
  ≈ 49). The lock 44 GREEN · `check_rules` 32 (ENGRAVING_RULES.md regenerated — stale on HEAD) · the shield `piece-lgmf` alone. **► HIS EYE**
  (reload → `piece-lgmf` → `295` · `291.4`) **and HIS PICK for the next cluster: the extent · the grouping · the phase** (the tool's or a hand);
  then figure 3's values by hand, S1 … S13 surfaced. His eye: the wide pair 3 + 4 (the low stem 10 ss to the high note's beam — or two flags).
- **§574 (2026-09-29, Fable; LG-152) — DONE:** the batch at 298.8 is ELEVEN notes; **the last four (301.556 … 302.106) by hand** — beamed as
  16ths · ff on 1 on the row + a decrescendo hairpin over the rest to 302.17 · staccato dots on all four (in a space, head side) · a GC on 1
  whose impact IS the head's left edge (`nhAnchor "leftEdge"`), no go line — S14 tentative · **the first seven REASSESSED** with notes 1 · 2
  FREE (`tempo_fit --free 1,2`, S15 — his: they time each other) · **THE PICTURE generated by the tool** (`--html`, S16):
  `http://localhost:5400/notation/research/tempo_candidates_eh_298.html` — five shown beats in colour at their between phases: 97 bpm
  (4 × 0.154, phase 298.661) · 97 (6 × 0.103) · 100 · 90 (298.216) · 86 (298.133); the 97 family keeps every non-free note ≥ 139 ms from a
  beat. The lock GREEN (§574's ten) · `check_rules` 32 · the shield `piece-lgmf` alone. **► HIS EYE** (reload → `piece-lgmf` → `301.5`) **and
  the picture; HIS PICK for the first seven: the grouping (97 … 100 at the cap 100, 90, 86 — or a line every two beats) · the phase (the
  tool's `--beatGridFit` line in §574, or a hand); then the seven's values by hand, S1 … S16 surfaced.** On the working page (in F) the ff and
  the dots go ABOVE (the chain on the head side with the stems down) — the video page is right; noted.
- **§575 (2026-09-29, Fable; LG-153) — DONE:** his pick *"the purple 86, tools phase is fine"* → `--beatGridFit 0:0.1165:6:298.133:298.815:300.695`
  in the build: **five lines 298.133 … 300.929, five balls** (the lead and tail beats dropped by the 0.1 s clamps — figure 2's last note ends
  297.375, the burst starts 301.556). The lock 62 GREEN (figure 2's grid assertions windowed to 293 … 298; a §575 block) · `check_rules` 32 ·
  the shield `piece-lgmf` alone. **► HIS EYE (reload → `piece-lgmf` → `298.5`); then THE SEVEN'S VALUES by hand — S1 … S16 surfaced at that
  step** (the burst's S14 is the last four's, already in).
- **§576 (2026-09-29, Fable; LG-154) — DONE:** his eye on the burst (a screenshot: the hairpin through two staccato dots on his page, the EH in F)
  → **THE SPAN RULE** (S17; `objects.hairpin.spanClearSs` 0.45): a hand hairpin and its name clear every unit they span on their side — on his
  page the ff + hairpin 2.79 → 3.78; the video page and figure 1's hairpin unchanged. There was no rule before (the hairpin took the name's
  height). **The frame moved to the orange 90** (*"lets try 90 orange machine phase"*): `--beatGridFit 0:0.111:6:298.216:298.815:300.695` —
  five lines 298.216 … 300.880; the first build interleaved with figure 2's frame (a lead beat at 297.550) → **the clamp reads the previous
  frame** (S13a, `notate_section.js`). The lock 62 GREEN · `check_rules` 32 · the shield `piece-lgmf` alone. **► HIS EYE (reload → `298.5` ·
  `301.5`); then THE SEVEN'S VALUES by hand, S1 … S17.** Note: his page is the WORKING page (in F, stems by the written pitch) — the lock
  asserts the video page (in C); where a mark's side depends on the stem the two differ (§573 · §574 noted note 6's accent and the burst's marks).
- **§577 · §578 (2026-09-29, Fable; LG-155 · LG-156) — DONE:** THE THIRD FIGURE'S VALUES by hand (1+2 beamed 16ths by S4 + a slur · 3 · 4
  flagged eighths with staccato dots · 5+6 an eighth pair by S4 · 7 a flagged eighth · mf + an accent on 1, no other name to the burst's ff;
  the AI's values his to reverse) and **THE COLUMN PASS** (S18 — his *"the spacing system picked up all those exceptions … rather than just
  manually fixing it each time"*): a dynamic and an articulation in one column stack in the column's order by the standard stack, the ottava
  and the word riding, the slur lifting the whole column (its riders too). On his page note 1's mf had sat ON the accent; now head → accent
  3.96 → mf 5.17 → the 8va line 6.85, the slur under them. A first try (the accent into the unit's chain) reverted — it dropped the accent to
  the chain's side and moved a tuba page. **THE FRAMES ALTERNATE** navy · olive (S19, `objects.tick.gridColours` · `objects.beatBall.colours`;
  layout stamps each line's frame, animobj each ball's, render draws it). The lock GREEN (a §577 block, the column on both pages) ·
  `check_rules` 32 · the shield `piece-lgmf` alone (the tuba goldens identical). **► HIS EYE (reload → `piece-lgmf` → `298.8`: the column,
  the olive frame · `295`); then the next figure, from 302.1, by the same method — S1 … S19 surfaced.**
- **§579 (2026-09-29, Fable; LG-157) — DONE:** his third pick for the third figure's frame, *"c 86 purple and move 1/4 beat to the right so that
  p2 is ~onbeat and p6 ~onbeat"* → `--beatGridFit 0:0.1165:6:298.308:298.815:300.695` (the tool's 298.133 + 0.175): five lines 298.308 …
  301.104, olive; notes 2 and 6 60 · 62 ms before a line, 3 · 4 · 5 · 7 between (nearest 132 ms). The principle bent by hand, his call. The
  lock 74 GREEN (the frame block re-pointed) · `check_rules` 32 · the shield `piece-lgmf` alone. **► HIS EYE (reload → `298.5`); then THE NEXT
  FIGURE from 302.1** (after the burst; the tool's candidates + the picture, then the values by hand — S1 … S19 surfaced).
- **§580 (2026-09-29, Fable; LG-158) — DONE:** *"so lets move those 61 ms over to be on beat"* → the phase **298.247**: notes 2 and 6 each 1 ms
  from a line (two beats apart to within 2 ms, one phase serves both); five lines 298.247 … 301.043, olive. The lock 74 GREEN · `check_rules`
  32 · the shield `piece-lgmf` alone. **► HIS EYE (reload → `298.5`); then THE NEXT FIGURE from 302.1.**
- **§581 (2026-09-29, Fable; LG-159) — DONE:** his eye on figure 3 — *"green line is hidden by stem"*: an on-beat note with its stem DOWN hangs
  the stem from the head's left edge, the line's x; the hairline vanished. Discussed at his ask (five options); his (a): **the frame's lines are
  BANDS 0.3 ss wide, still under the ink** (`objects.tick.gridWSs`; layout stamps, render draws) — a stem hides only the middle. The lock 75
  GREEN · `check_rules` 32 · the shield `piece-lgmf` alone. **► HIS EYE (reload, page files → `298.5`); 0.25 the fallback if heavy; then THE
  NEXT FIGURE from 302.1.**
- **§582 (2026-09-29, Fable; LG-160) — DONE:** *"draw one more olive line near where the gc is so I can see it"* → the frame's tail beat 301.742
  kept by hand (`--beatGridFit …:keepTail`, a new optional field; `keepLead` · `keepBoth` too) — it sits ON the burst's second note, inside the
  clamp's 0.1 s; six lines 298.247 … 301.742, six balls, olive. The lock GREEN (the window widened) · `check_rules` 32 · the shield `piece-lgmf`
  alone. **► HIS EYE (reload → `301`): the band beside the GC's ink; the tail line his to keep or drop; then THE NEXT FIGURE from 302.1.**
- **§583 (2026-09-29, Fable; LG-161) — DONE:** *"ok remove gc pls"* → the burst's first note loses its GC and its hand anchor; the head's left
  edge stays on its time by S1; S14 amended (the burst without a cue). The lock 75 GREEN · `check_rules` 32 · the shield `piece-lgmf` alone.
  **► The checkpoint at his word; then THE NEXT FIGURE from 302.1.**

### SESSION 18 · CHECKPOINT #4 (mid-session checkpoint, 2026-09-29, Fable) — TEMPORAL NOTATION: THE RESEARCH PROJECT AND THE SURVEY v0; ► HIS TO REFINE · 2m.4 HIS EYE STILL STANDS

- **The task:** SECTION 2's TODO items 5 · 6 (temporal notation; its name) opened as a RESEARCH PROJECT at his word — conceptual, nothing
  built (LG-120 … LG-126; RUNNING_LOG §536 … §546). Settled today, each at his word: the term kept as his ("temporal notation", defined
  once as horizontal distance = time) · the reference scores (his R1 … R4, the AI's S1 … S10 to confirm) · THE PHRASE IN LAYERS (anchor ·
  shape · flow · moments) the starting framework, adjustable · FLOW expanded (learning vs cueing; the rehearsal model; animation in two
  modes) · W1 THE WORKING MODEL — proportional + TN details, "Ferneyhough without the count" — A1 THE DEFAULT · the viability test
  V1 … V8 standing · the alternatives A1 … A6 surfaced on the device sheet (`docs/PLANNING_METHOD.md` line 1a) · the cursor window
  (a concept) · tuplets a NOTCH OF SPEED · THE INTENTION (energy and flow with detail; the failure casualness / misreading, not
  imprecision) · THE SCORE IS A PICTURE OF THE SOUND · seven framework decisions T1 … T7 (`temporal_notation.md` §10) · and, at his
  last word, THE FRAMEWORK AS AN INSTRUMENT, not rules — THE SURVEY v0.
- **The deliverables:** `docs/research/temporal_notation.md` (§1 … §11) · `docs/research/sound_to_notation_survey.md` (v0 — eight
  scales A … H, 44 items, the profile of leanings, his single-note case worked, §R the revision log) · PLANNING_METHOD's device
  sheet line 1a · PERFORMANCE_NOTES #16 · #17. All committed and pushed (`d5c2b96` … `6790f92`).
- **► The next concrete step — HIS PICK, ask first, start only on his word:**
  - **(a) refine the survey** (Fable): he reads `docs/research/sound_to_notation_survey.md` and names changes — items · poles · profile
    rows; the AI records each in its §R and a RUNNING_LOG § (§547 next free), commits, pushes.
  - **(b) 2m.4 his eye** on the long tones (the running order's step 3 above holds the stops; reload the notation tab, no restart).
  - **(c) the practical for the EH's section 2** — begins with the survey RUN on one EH fast phrase (the survey's §X, a second worked
    example — Fable), then a device sheet (line 1a names the model), then the build on Opus.
- **`Resume reads:`** for (a) `docs/research/sound_to_notation_survey.md` whole — it IS the tool · for (b) nothing beyond §2 · for (c)
  the survey + `docs/research/temporal_notation.md` §8 (the working model) and §10 (the decisions). Nothing else until the step names it.
- **Pending him — HELD at his word:** values written or not inside a phrase (leans written-as-pace after T6) · the cursor window's scope
  (*"only impact parts"*) · the model as a deliverable (for the performers) · H1 the intensity curve (`temporal_notation.md` §9).
  **The AI's unverified:** every precedent's notation and every citation in the two research docs is from memory — a verification pass
  offered, not run.
- **Deliberately uncommitted — the same 29 paths as checkpoint #3, all his, untouched** (`git status --short` at this checkpoint).

### SESSION 18 · CHECKPOINT #3 (mid-session checkpoint, 2026-09-29, Opus) — SECTION 2's TODO TAKEN DOWN; ► 2m.4 HIS EYE, unchanged

- **The task:** unchanged from checkpoint #2 (below) — SECTION 2 (289 … 427 s), one notation type at a time; THE LONG TONE is built and
  pushed (2m.1 … 2m.3). At the `/postclear` he gave his TODO for section 2, verbatim (the block above; RUNNING_LOG §535). Nothing built.
- **The deliverable:** unchanged — `notation/ir/piece-lgmf.ir.json` (120 long tones in 36 groups). New this checkpoint: the TODO block
  above · RUNNING_LOG §535.
- **► The next concrete step — HIS: 2m.4, his eye** (the running order's step 3 holds the stops). Ask whether he wants to take 2m.4 now or
  pick an item of the TODO first; start only on his word. For the eye: he reloads the notation tab (no restart) → `piece-lgmf` → the video
  view → the stops; the AI COLLECTS his findings in the RUNNING_LOG (§536 next free), then fixes them together on his go.
- **`Resume reads:`** nothing beyond §2 for his eye. For a TODO item he picks: `docs/PLANNING_METHOD.md` (the method) — nothing else until
  the item names it.
- **Pending him:** 2m.4 his eye · the TODO's nine items (his order to name) · everything on checkpoint #2's pending line.
- **Deliberately uncommitted — the same 29 paths as checkpoint #2, all his, untouched** (`git status --short` at this checkpoint).

### SESSION 18 · CHECKPOINT #2 (mid-session checkpoint, 2026-09-29, Opus) — 2m THE LONG TONE BUILT; ► 2m.4 HIS EYE

- **The task:** SECTION 2 (289 … 427 s), one notation type at a time (his pivot, §531). The first type, THE LONG TONE, is **BUILT and
  pushed** — 2m.1 … 2m.3, one commit each, THE SHIELD in each (RUNNING_LOG §532 · §533 · §534; `b3d33c9` · `20e3e46` · `69bde9c`).
- **The deliverable:** `notation/ir/piece-lgmf.ir.json` — 120 long tones in 36 groups (`env 'longTone'`, the registry's `byEnv.longTone`):
  the open head's left edge on its time, no go line · tempered, no column · the navy ring bar at 0.3 the note's full length, the
  clearance before the next unit · one band name per note ON the dynamic row (`dynOnRow`). Built by `--longTones 289:427` added to
  the fold's command (the IR's `provenance.build`). `check_rules` 31 · both edges PASS · the ladder 7 at rung 3, as the fold.
- **► The next concrete step — HIS: 2m.4, his eye** (the running order's step 3 above holds the stops). He reloads the notation tab
  (no restart) → `piece-lgmf` → the video view → the stops. The AI COLLECTS his findings in the RUNNING_LOG (§535 next free), then
  fixes them together on his go (§527's frame): a look → a rule row on Fable; a fault → Opus.
- **`Resume reads:`** nothing beyond §2 for his eye. For a fix: PLAN § `2m` · `docs/ENGRAVING_RULES.md` § 1's `byEnv.longTone` row.
  A re-extraction: the command in `piece-lgmf`'s `provenance.build` on a scratchpad COPY of Draft 01 (2j's discipline); the shield
  (`layout_shield --write` on HEAD first, `--diff --expect piece-lgmf` after). STILL BINDING (below).
- **Pending him (each in PLAN § `2m`'s last lines or §532 · §534):** his eye · the EH's low F3 at 331.38 · 333.36 — the name above the
  staff (no room below; the chain's `sideWithRoom`) · the 18 singles as they draw (the three brass singles keep the tuba `ord`'s go
  line) and `--longToneAlso` for any he names · the AI's calls: routed by env not technique · the name from the eight-step
  `dynamicBands` · the 0.1 s window · the 0.2 s floor · `--longToneAlso` an extractor flag · then his per-chord dynamics pass in the
  composer (`dyn ▾`), re-extract after · his eye on 0 → 279 (held, the running order's step 4).
- **Deliberately uncommitted — the same 29 paths as the session-17 close, all his, untouched** (`git status --short` at this
  checkpoint): his actuals `ACT-BLOOM-07` · `-08` · `ACT-TAKES-01` · `-02` · `-03` and their index `bank/morph_models.json` · his
  libraries autosaved by his tab (`bank/panel_snapshots.json` · `sequences.json` · `patterns.json` · `rhythm_sequences.json` ·
  `rhythm_takes.json`) · his passage `bank/passages/lgmf-sec2.json` · his rack `reaper/LGMF_rack.rpp` · his named saves in `scores/`
  (the five `piece-LGMF-Sec01-Sec02*`, the seven `piece-LGMF-Sec03-Try*`, `piece-LGMF-draft01-preVibesFix` · `-VibesFix`,
  `pointilistic01a`) · `scores/piece-Recombination-Draft01-done.json` (his tab's save of 2026-09-26 — `metadata` · `viewport`; every
  extraction reads a COPY).

### SESSION 18 · CHECKPOINT #1 (mid-session checkpoint, 2026-09-29, Fable planned, Opus builds) — 2m THE LONG TONE

- **The task:** SECTION 2 (289 … 427 s), one notation type at a time — his pivot at the `/postclear` (§531). The first type: THE LONG TONE.
  PLANNED IN FULL on Fable (PLAN § `2m` · RUNNING_LOG §531 · LG-119; `ef03f7d`): the device sheet answered —
  - **anchor A** — no go line, the head's left edge on its time (his *"No go lines alignment with left of notehead"*)
  - **(a) a1 tempered as written** — Draft 01 carries no cents / partial / `morphBend` / `hq` on any of the 138 held notes; no column
  - **(b) b1 one dynamic name per note on the dynamic row** (−4.6), from `recVel` (a STRUCK note — DYNAMICS_LAW); *"for now"* — he
    normalizes per chord later in the composer, then re-extract
  - **(c) THE CUT IS HIS:** a long tone = a held note ≥ 0.2 s that starts TOGETHER (onsets within 0.1 s) with another pitched part's
    held note — 36 groups · 120 notes; 18 singles draw as today until he names them (a per-event `engraving { device: 'longTone' }` hand)
  - the bar: `ringBar` navy `#1C4879` at 0.3, 0.667 ss, beside 0.25, after 0.25 (§472 · §473)
- **State:** NOT BUILT. At his word *"then build as much as possible independently no clear"* the build runs in this session on Opus.
- **UPDATE (same session, Opus): 2m.1 … 2m.3 BUILT and pushed** (§532 the rule rows — `byEnv.longTone` + `dynOnRow`, routed by env · §533 `--longTones` — 36 groups · 120 notes · 18 singles · §534 the page — the shield exactly `piece-lgmf`, `check_rules` 31, both edges PASS, the ladder 7 at rung 3 as before). ► 2m.4 his eye (the running order's step 3).
- **► The next concrete step:** PLAN § `2m` → 2m.1 the rule rows (`rules.json` a device row, anchor A, `sheet: '§531'`; the ensemble's
  `ord` · `senza_vel` routed to it for the six pitched parts; `byTechnique.ord` is the TUBA pages' — leave it) → 2m.2 `--longTones` in
  `tools/notate_section.js` → 2m.3 re-extract `piece-lgmf` from a scratchpad COPY of Draft 01 with its whole `provenance.build` + `--longTones`.
  `layout_shield --write` on HEAD FIRST; `--diff --expect piece-lgmf` after each step; `check_rules` after each; a RUNNING_LOG § per
  step (§532 next free); one commit per step, pushed. STOP at 2m.4 (his eye).
- **`Resume reads:`** PLAN § `2m` · `docs/ENGRAVING_RULES.md` § 1 (anchor A, the devices list) · the `ringBar` · `dynamic` · `number`
  rows of § 3 · DN-5 in § 8. STILL BINDING (below).
- **Pending him:** 2m.4 his eye · the AI's calls at the foot of PLAN § `2m` (the 0.1 s window · the 0.2 s floor · a single untouched) ·
  the per-chord dynamics (his composing pass) · his eye on 0 → 279 (held).
- **Deliberately uncommitted** — the same 29 paths as the session-17 close (below), all his; nothing new.

### SESSION 18 OPENS ON THIS — `/session-start`; nothing is being built (session 17 closed 2026-09-28, Opus)

- **The piece:** _Recombination_ (D32). The named draft `scores/piece-Recombination-Draft01-done.json` is the ONE source of notation
  (D43); its audio `notation/audio/piece-Recombination-Draft01-done.wav` (D39, his ear owed). The work now is the notation, not composing.
- **Session 17** (2026-09-27/28 — Fable planned and looked, Opus built and wrapped; RUNNING_LOG §405 … §530; D39 … D46) took the
  presentation score's notation from one prototype to the whole first morph:
  - the audio of Draft 01 (2b) · the engraving rules as DATA (2e) · the fade signs (2f)
  - the vibraphone's sequence notation (2g · 2h · 2i and the running order after them)
  - the main file carries every accepted device (2j) · the ottava on every head (§502) and its hook on the spacer (§528)
  - the morph as a sequence whose pitch moves (2k) · the volume curve protocol, the intention not the fader (2l)
  - THE FOLD (2l.7, §530): `piece-lgmf` carries all of it, 0 … 881 s · the breath pie's arc fixed on the way (§529)
- **► THE NEXT STEP — HIS: the RUNNING ORDER's step 3 (above) — his eye on `piece-lgmf`, 0 → 279, on Fable.** Reload the notation tab
  (no restart); the stops are in step 3. His frame (§527): during an eye pass collect the findings in the RUNNING_LOG, then fix them
  at once — a look → a rule row on Fable, a fault → Opus. Then step 4, his calls.
- **The re-render, when he names a new draft** (D43 (1); Reaper open, the bridge alive, the rack SAVED): `node tools/export_midi.js
  --score <name>` → `node tools/render_reaper.js --score <name> --up` (RENDER.md §1 · §4) → re-extract `piece-lgmf` from a scratchpad
  COPY with the command in its `provenance.build`, the four `--sequence` and three `--morph` group ids re-read from the new draft →
  the protos the same way → the checks. ≈ 4 min + 5 min + the checks.
- **`Resume reads:`** nothing beyond §2 for his eye. A rule change: `docs/ENGRAVING_RULES.md` (generated from `rules.json`) and the PLAN
  item that owns the device (2g … 2l). STILL BINDING (below) before any verification or splice.

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

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current. The ✓ rows of sessions 13 … 17 were cut at
the closes — whole in git: `git show 22da087:docs/PROJECT_JOURNAL.md` (… 16) · `git show 26c8c10:docs/PROJECT_JOURNAL.md` (17).)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| **►►►►** | **SESSION 18 · CHECKPOINT #9 — THE BASSOON'S SECTION 2 from 295 to 399 by hand (§611 … §622; the block above): THE ONE-OFF a registered model (`byEnv.oneOff` — the strike field for field, the dot, no accent; the section's word in the head's column; every GC its name; `--oneOffs`) · fourteen one-offs · the figures at 322.8 · 324.8 · 345.5 · the bassoon's first frame (navy, 321.72 … 326.26) · EVERY HELD TONE A LONG TONE (`--longTones 289:427:all`, 132) · the tools `@drop:` · `instrPlace`: ► HIS EYE (reload → the bassoon's stops `296` … `398.5`, the long tones `337.3` · `368` · `395`), then THE BASSOON AFTER 399 · **§623 THE HORN BEGUN — ten one-offs + three burst pairs (301.96 · 344.19 · 376.00), the current dynamics on every note; 345.486 not named → ► he reloads → `296.3` … `387.6`; HIS EYE and his dynamics** · **§624 the horn's dynamics at his eye — the pairs one name each (f on the first), 323.18 f · 325 mf · 377.74 mf · 386.17 mf, 345.49 a one-off at mp, the bassoon's 301.88 f → ► he reloads → `302` … `386.2`; then the horn after 399 or the next part** · **§625 THE TRUMPET BEGUN — thirteen one-offs, the five at 344.19 beamed 3 + 2, the burst pair at 385.95, THE FRAME CANDIDATES 343.1 … 345.7 (`tempo_candidates_tpt_343.html`, the 343.13 GC included); 295.477 not named → ► he reloads → `302.1` … `387.7`; HIS PICK for the trumpet's first frame, his dynamics** · **§626 the trumpet's 295.48 a one-off too (f) → ► he reloads → `295.5`; the frame pick still his** · **§627 the trumpet's dynamics (f · mp · mf · mf · mf) + ITS FIRST FRAME — the green 98 at the tool's phase, five navy lines 344.108 … 346.548, the 343.13 GC outside → ► he reloads → `302.1` … `344.2`; HIS EYE, his names on the five** · **§628 the five's names — f on 344.19, mp on 345.44, the rest unnamed → ► he reloads → `344.2` · `345.5`** · **§629 the five's two GCs off (the beam device's own cue; a rule offered) → ► he reloads → `344.2` · `345.5`; HIS EYE, then the trumpet after 399 or the next part** · **§630 the trumpet's dynamics 375.9 … 387.7 (f · mf · mf · mf · mf · the pair mf · f) → ► he reloads → `376` … `387.7`** · **§631 THE CELLO BEGUN — eight one-offs, the held 337.55 · 343.13 taken back from the long tone (130 long tones) → ► he reloads → `300.4` … `387.5`; HIS EYE and his dynamics, then the double bass** · **§632 his R failed and removed the IR (the stale score copy) — restored, his A5 → A4 carried, the route fixed: RESTART the server · §633 THE DOUBLE BASS BEGUN — five one-offs → ► he restarts, reloads → `295.8` … `329.3`; HIS EYE and his dynamics**** | Fable | no — the same task |
| **►►►** | **SESSION 18 · CHECKPOINT #8 — the EH's section 2 from 376 to 398 by hand: the frames at 376 (navy) · 384 (olive, cut to seven lines at 388.268), the second layer on 375.77 · 379.88, the figures at 384.3 · 387.23 · 389.7 with their dynamics, five singles named long tones, `noTail` · `noLead` in the fit (§605 … §610; the block above): ► HIS EYE (reload → `376` … `398`), then THE LOCK'S BLOCKS (337 … 389.7, the 340 · 376 · 384 frames), then the next figure after 398.4 · **§611 THE BASSOON BEGUN — the one-off at 295.97 as THE GC UNIT of #4 / #5, a model: `byEnv.oneOff` · `--oneOffs` · `@drop:`; `check_rules` 33 → ► he reloads → `296`; HIS EYE, then the next one-off** · **§612 … §615 — the dot back, the word into the column centred, every GC its name (300.5 mf by hand), the 322.7 pair f · mf, THE FIGURE AT 324.6 (a grace beamed to an eighth; a 16th with its beamlet + two eighths), THE CANDIDATES 322 … 326 drawn → ► he reloads → `296` · `300.5` · `302` · `323` · `325`; HIS PICK for the bassoon's first frame, his names on the five** · **§616 THE BASSOON'S FIRST FRAME IN — the green 93 (4 × 0.162), a tick back + 14.5 ms, p4 · p7 sharing 7.5 ms; eight navy lines 321.72 … 326.26 → ► he reloads → `323`; HIS EYE, his names on the five, then after 326** · **§617 at his eye — the grace unbeamed, the 322.7 pair plain dotted 16ths (f · mf kept), the accent on 324.96, mf on the grace alone → ► he reloads → `323` · `325`; then after 326** · **§618 the bassoon 336.9 … 345.6 — five one-offs (f · mp own; mf · mf · f his), the 345.47 pair beamed with the burst's GC (no go line, mp) → ► he reloads → `337` … `345.5`; then after 345.7** · **§619 the three at 376 — one-offs, f · mf · mf → ► he reloads → `376.5`; then after 378** · **§620 the pair at 380.25 — one-offs, both f → ► he reloads → `380.5`; then after 381** · **§621 387.5 a one-off at f; 393.28 · 398.44 long tones by name at f → ► he reloads → `387.5` · `393.3` · `398.5`; then after 399** · **§622 EVERY HELD TONE A LONG TONE (`--longTones 289:427:all`; the five singles left take it, the hand figures' windows excepted) → ► he reloads → `337.3` · `368` · `395`; then the bassoon after 399**** | Fable | no — the same task |
| **►►►** | **SESSION 18 · CHECKPOINT #7 — the EH's section 2 from 317 to 380 by hand, the app's video page in C, the grace family's rules (§584 … §610; the block above): §605 THE 376 FRAME IN · §606 THE TWO FIGURES' SECOND LAYER · §607 THREE FIGURES AFTER 380.8 + 383.25 A LONG TONE + no GC at 380.39 · §608 THE CANDIDATES 384.3 … 390.6 + the three figures' dynamics + FOUR LONG TONES 390.7 … 398.4 by name · §609 THE 384 FRAME IN at his pick (the red 93, 1.44 ticks back, p4 · p7 on the beat; the lead beat clamped by the long tone, `keepLead` his) · §610 the frame CUT to 388.268 at his word (seven olive lines; `noTail` · `noLead` built into the fit) → ► he reloads → `384` … `398`; HIS EYE, the lock's blocks, then the next figure after 398.4** | Fable | no — the same task |
| **►►►** | **SESSION 18 · CHECKPOINT #6 — figures 2 · 3 · 4 in, T10 + the picture, the span rule · the column pass · the frames as bands in two colours (§573 … §583; the block above): ► HIS EYE (reload → `piece-lgmf` → `301.5` · `298.5`); then THE NEXT FIGURE — HIS CHOICE 316.8 … 323.14 (§584 the candidates + the picture; §585 · §587 the app's video page now in C; §589 THE FRAME IN at his pick; §590 THE VALUES at his dictation + S20 · S21; §591 p10's max 10.5 + THE FIGURE AT 324.6; §592 the grace beam scaled (S22) · the GC at the beat ball's height (S23) · the figure's slur and names; §593 the GC's aperture 70 % · ragged stemming on the graces (S8a); §594 the stroke's orientation by the beam side · GC style 2 registered; §595 the stubs compared · THE FIGURE AT 337; §596 the lead beat back · the stubs 2 ss the standard · the 337 slur 1.4 + names · THE FIGURE AT 340.1; §597 a grace's stem with its parent · the slur talk · 343.12 read · THE FIGURE AT 342.65; §598 the 344.2 group of five; §599 his 343.12 change carried; §600 the slur minimum · the names thinned · the accent on the head side · THE FIGURE AT 345.3; §601 the slash at the beam's corner · the 345.6 pair slurred · THE CANDIDATES 339.9 … 345.9; §602 THE FRAME AT 340 (the purple 93) · the stroke slid · the stroke mirrors with the stem (LilyPond); §603 the dots · the stroke halfway; §604 the stroke balanced · his save carried · THE FIGURE AT 375.77 · THE FIVE AT 379.88 (tenutos) · THE CANDIDATES 375.7 … 380.8 — he reloads → `345.5` · `375.8` · `380`; HIS PICK for the 376 frame, his dynamics) — his decisions note by note, the standards S1 … S19 (`temporal_notation.md` §12) surfaced** | Fable | no — the same task |
| **►►►** | **SECTION 2 — THE NOTATION PLANNINGS N-1 … N-6** (journal §2 block above; RUNNING_LOG §551 · §552; LG-130 · LG-131): N-1 slurs and N-2 stem lengths at phase 1, HIS ANSWERS OWED (the questions in the block) · N-3 the four 16ths · N-4 the shown beat + the tempo / time-signature method · N-5 the micro counterpoint · N-6 the second layer on the figure. One at a time, at his order; the planning method. His eye on the drawn figure (§550: reload → `piece-lgmf` → `289` … `292.8`) | Fable (the talk) · Opus or here (a build) | yes — `/session-start` |
| **►►►** | **TEMPORAL NOTATION — THE SURVEY v0, HIS TO REFINE** (`docs/research/sound_to_notation_survey.md`; the framework `docs/research/temporal_notation.md` §1 … §11; RUNNING_LOG §536 … §546; LG-120 … LG-126): the conceptual talk continues on the instrument — items · poles · the profile rows; then the practical for the EH's section 2 (the survey run on one EH phrase → a device sheet, line 1a → Opus). HELD: values written or not · the window's scope · the model as a deliverable · H1 | Fable (the talk) · Opus (a build) | yes — checkpoint first |
| **►►** | **THE RUNNING ORDER's step 3 — 2m.4 HIS EYE on section 2's long tones** (PLAN § `2m`; BUILT 2026-09-29, §532 … §534): reload the notation tab → `piece-lgmf` → the video view → the stops in the running order's step 3. Collect, then fix at once (§527) | Fable (a look → a rule row) · Opus (a fault) | yes — checkpoint on Opus first |
| **►►** | **SECTION 2 — HIS TODO, nine items, verbatim** (journal §2 block · RUNNING_LOG §535): normalize the long-tone chords · the EH's temporal phrases · the fast clusters · the percussion · temporal notation (short · long · tuplets · purpose) · its name + references · how much Ferneyhough-like detail · the glyph vocabulary · the GC. Not planned; each through `/plan-item` when he picks it | Fable (planning) | yes |
| **►►** | **THE RUNNING ORDER's step 4 (held at his pivot) — HIS EYE on `piece-lgmf`, 0 → 279** (journal §2 top: the stops; PLAN 2l.7 BUILT 2026-09-28, §530). Reload the notation tab, no restart. His frame (§527): collect the findings in the RUNNING_LOG, then fix them at once | Fable (a look → a rule row) · Opus (a fault) | yes — `/session-start` |
| **►►** | **The RUNNING ORDER's step 4 — his calls in the range:** 2a.6 the clefs by register (Bsn · Vc · Db) · the orange pitch line's corners · 2k's AI's calls (§507 `eligible` · §509 the gliss line not in `inkOf` · §512 the per-breath overlays dropped) | his · Fable | — |
| **►►** | **2j.4 HIS EYE — the rest of the main page BEYOND 279: `427` · `655` · `800`** (paused 2026-09-28 at his pivot to the morph; his first findings fixed, §502 · §503; `40.26` is in the running order's step 3) | his eye | — |
| **►►** | **(still his — not taken up at checkpoint #5)** **HIS EYE ON THE PROTO — `lgmf-eh-proto` IS NOW THE EH'S WHOLE FIRST LINE, 0 … 149 s** (session 17, 2026-09-27, Fable at 2e.7; RUNNING_LOG §454 … §462; `dfd63e3` … `6dfb038`, all pushed). **Reload the notation tab** (page files + the IR; no restart) → `lgmf-eh-proto` → the video view → `0` (the opening `○—<` before `pp → mp` on the dynamic row; the fade ONE straight line to pp at 6 s) · `141.98` (the last breath: G5 −31 · `14 (A1)`, `—> ppp` before its go line) · the working page (⚙ off the video view, the EH in F): `+41` · `26 (C1)` over the head, "senza vib." under the dynamic row. **Then his open answers:** (1) the closing sign's mark — the save falls to **ppp** (`fadeOutTo: ppp`), his words said "niente": keep `—> ppp` (the notation follows the save) or re-insert the sequence with `fade out … to niente` (§460) · (2) the breaths' top **CC7 69 vs the table's mp 68** (§456) · (3) **DN-1 … DN-5** on the generated page (`docs/ENGRAVING_RULES.md` § 8) · (4) the AI's calls of §458 · §459 · §460 (the sign row −5.95 · the fall test · the room rule · the hairpin 0.667). Revise on his word — a look question on Fable, a fault on Opus. *(What 2e.7 built, each in its §:)* the curve follower OFF (§454) · the pie go line to go line (§455) · the level verified to the page (§456) · THE FLIP BY CLASS — `leaves` on the mark rows, the annotation flips before the pitch data (§458, DN-6 closed) · `2f` THE FADE SIGNS — restored (§457), built (§459), hairpins before the legend (§460, a new drawn kind `hairpin`), the fade drawn as a multiplier on the WRITTEN height (§461 · §462). `check_rules` 23 · `sequence_notation_check` 64 | his eye · then Fable (a look) / Opus (a fault) | — |
| **►►** | **THE AUDIO OF DRAFT 01 — HIS EAR** (session 17, RUNNING_LOG §405 … §407): the WAV `notation/audio/piece-Recombination-Draft01-done.wav` (−1 dBTP, +10 dB plain at his "b") · the notation tab reloaded → `piece-lgmf · Draft 01` → `♪ render`. Re-render recipe in the checkpoint block above | his ear · then Opus (a fault) | — |
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
`node tools/test_written_pitch.js` (**10** + a control) · `node tools/spectrum_check.js` (**35**) · `node tools/sequence_notation_check.js` (**64**, 2d · 2e.3 · 2f · §462) · `node tools/check_rules.js` (**29**, 2e · 2k.1 · §502's (9)) · `node tools/decisions_needed.js` (2e.4) · `node tools/vibes_pitch_check.js` (**65**, 1u) · `node tools/vib_marks_check.js` (**33**, 2g · 2h · 2i · 2k.5) · `node tools/layout_shield.js --write` on HEAD / `--diff --expect` after (THE SHIELD for any layout change, 2h.1) ·
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
