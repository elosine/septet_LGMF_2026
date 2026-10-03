# THE NEW-PIECE PROTOCOL — a regular, expandable, flexible start

> Drafted 2026-10-03 on Fable WITH the composer, under `docs/PLANNING_METHOD.md` — phase 1 (RUNNING_LOG §786),
> the top line agreed, then one container at a time. His to-do for it: `composition-planning-and-notes/docs/things/
> create-a-methodology-for-starting-a-new-piece.md` (► 1 Draw Up the Plan · 2 Set Up the Decibel Piece · 3 Set Up
> the Switch~ Piece). This file lives here, beside the last port's record (`PORT_FROM_TEMPUS.md`), until the protocol
> has a home that is not a piece — that home is his call, later.
>
> **His intention (§786, his words):** *"a regular protocol for starting a new piece … expandable and flexible"* —
> expandable: *"as we're doing it, we took lessons from the last build and are adding some things"* · flexible:
> *"being able to incorporate and adjust to new requirements of the new piece"* · modest enhancements welcome now,
> *"maybe not doing giant projects"* · and a COLLATION: *"gather some things up and collate them somewhat so that the
> next piece can just move forward without having to do a full search and retrieval."*

**The rules of this file:** stable IDs (a container keeps its number; its steps are `N.m`) · one container laid out at
a time, with him, and written here as agreed · the steps a cold model could run · a container reads `top line only`
until it is laid out · what is one-time (this plan's work) is kept apart from what is recurring (the protocol's).

**The kinds of start the protocol must hold** (§786 · §789) — a piece's PROFILE, step 2.1: **copy-forward** — the six
pieces so far: the stack copied byte-exact, the palette rewritten · **from a sandbox** — the live-electronics kind: a
sandbox repo (`live-electronics-engine`) stays alive for experiments, a piece repo takes the BASIC MACHINERY and grows
piece-specific tools (his note, for the improvisation with live electronics for TENOR) · **fresh** — a new kind of
score with its own ground truth (the Decibel piece may be one). The UNIVERSAL layer (1 · 2 · 9 · 10) is common to all;
the other two layers are taken in part, whole or not at all — the top line below.

---

## The top line — the ten containers, in THREE LAYERS (his (a), 2026-10-03, §789)

*(the IDs in brackets: where this piece did it — PLAN § 0 … § 4; "new" = not in the last port. The numbers are stable; the
layers group them. A piece takes the UNIVERSAL layer always, and then some, all or none of the other two — its PROFILE,
step 2.1. Within a layer the order is the order things happen.)*

**UNIVERSAL — every piece, whatever it is**

1. **The harvest** — what the last piece hands to the next. *(new)* — **► laid out below**
2. **The repo and its kit** — the profile, the new repo, the names (title · session · piece chain · package · Reaper
   guard · ports), the docs kit, the git rules. *(0a)* — **► laid out below**
9. **The collation** — the cross-piece reference kit with an index: colours · engraving rules · device sheets · the
   laws · the manuals · the maps · the MODULE MANIFEST (below). Not exhaustive. *(new — his point)* — `top line only`
10. **The protocol's upkeep** — the last step of every start: what the run taught goes back into the protocol.
    *(new; the other end of 1)* — `top line only`

**THE INSTRUMENT — the sound side**

3. **The engine copied forward** — composer app · sandbox · notation engine · print · video · tools · probes · the
   Reaper bridge: byte-exact, proven whole, then the re-palette. *(0b)* — `top line only`
4. **The instruments** — the instrumentation → the libraries (acquire · manuals · maps · key switches) → the recipes
   → loopMIDI ports → the Reaper rack. *(0c · 0e)* — `top line only`
5. **The calibration** — balance · velocity remap · fader curves · bend and technique ranges · sample lengths; the
   dynamics law applied. *(0d; reworked as 1b here — six bugs that outlived the first pass)* — `top line only`
7. **The composing tools made the piece's** — which tools, and the per-instrument data each one needs; adapted as
   compositional need arises, not all up front. *(phase 1 here, 1c … 1u)* — `top line only`

**THE SCORE — the score type and its deliverables, laid out PER SCORE TYPE**

6. **The notation set-up** — the ensemble registry (clefs · transposition · staves · groups), the rules registry
   carried + what the new ensemble needs (a new staff type), the batteries, the exporters run, save → IR proved.
   *(0g · 0i · 2a · 2c)* — `top line only`
8. **The deliverables pipeline** — audio render · film · print (the gates; the cover and instructions templates) · the
   notes page · archive + tags · the submission package. *(2b · 3 · 4)* — `top line only`

**SCORE TYPES — a category of their own (§789).** The first member is THE ANIMATED SCROLLING SCORE: the IR · the rules
registry · the layout and render · the film · the print (pieces #4 … #6). A new kind of score — the Decibel piece may want
one — is a second member, in one of two shapes, and only that piece's design says which: a new RENDERING of the same
composed material, reading the IR (built as "the single source for every downstream score", D9; cheap to add) · or a new
way of composing and notating with its own ground truth — its own module, the sound side used in part or not at all.
Containers 6 and 8 are laid out once per type; a piece names its type(s) in its profile.

**MODULES — "port the useful ones" (§789).** Today the unit of port is the whole engine, byte-exact: the modules are
coupled (one page loads forty scripts; a missing one is a 404), carrying all costs nothing, excising costs a lot. The rule
for now: **CARRY ALL, USE SOME.** A module-level port needs the boundary named — a MANIFEST of modules, what each needs
and what depends on it — on container 9's list as the modest architecture enhancement he is open to. Not built now.

**What the AI added at phase 1, agreed (§786):** the protocol needs a HOME that is not a piece · THE HARVEST already
exists per piece and is step 1 · NAME THE BOUNDARY system vs. piece (the collation's spine; the quiet first step toward
one shared engine, parked in RUNNING_LOG §5, without committing to it) · TWO RUNS are coming — the first writes the
protocol, the second tests it.

**Never done in this piece, to be placed when their container is laid out:** 0f the AI's MIDI generation path · 0h the
gate that closes phase 0 (skipped at his word, D14).

---

## 1. The harvest — `written 2026-10-03` (agreed with him, RUNNING_LOG §786 · §787)

**Result when done:** one short, dated list in the finished piece — *what this piece hands to the next* — each item
with its source §, its kind (a tool fix · a rule · a method · a lesson · a doc), and a verdict: take now · later ·
leave. The protocol reads it before anything is copied; the "take now" items become steps inside the other containers.

**The data (2026-10-03):** pieces #1 … #3 have nothing to harvest from (no NITS, no lessons file; what they hold is
material — the collation's job, 9) · the kit that makes a harvest possible is a product of #4 … #6 (#4: NITS 45
bullets, SHAPE_LESSONS · #5: NITS 112, MORPH_NOTES, AI_METHODOLOGY · #6: NITS 65, MORPH_NOTES, five Learned lists) ·
only this piece has a NAMED harvest (NITS § HELD FOR THE NEXT PIECE OR THE POSTMORTEM, four items at his word) · one
harvest file already travels (MORPH_NOTES, carried whole from #5) · a harvest is a SELECTION, not a carry — the
copy-forward already carries everything.

**Recurring — the protocol's step 1, run at the START of each new piece on the piece just finished:**

- **1.1 The sources, named once.** NITS (its § HELD and its open bullets) · MORPH_NOTES §4 (the digest; §3 is the
  verbatim log behind it) · the journal §2's Learned lists · the journal's "offered, not taken up" and "the AI's
  calls, his to reverse" rows · PLAN items left `todo`. No model searches for them again.
- **1.2 The collect.** One pass over the sources into one file in the finished piece — `docs/HARVEST.md` — one line
  per item: the item · its source § · its kind · the proposed verdict. The AI does it; he gets one read.
- **1.3 The triage, his read.** take now · later · leave. A "take now" becomes a step in its container (a rule → 6 the
  notation set-up; a tool fix → 3 the engine or 7 the tools; a method → 2 the kit, or the protocol itself). A
  "later" stays in the file, dated. A "leave" is struck with its reason.
- **1.4 The old pieces.** No pass of their own. When the collation (9) sends us to one, the same line shape goes into
  the same file.

**Two calls, his to reverse (agreed 2026-10-03):** the AI triages and proposes the verdicts, he reads the list — not a
decision per bullet · older pieces are harvested only where the collation sends us.

**The feeder, during a piece (already a standing practice here):** NITS § HELD (his word *"hold on to these for the
next piece or postmortem"*, §701) · MORPH_NOTES §3 → §4 · the journal's Learned list at each close. The protocol names
them as what step 1 reads; nothing new to do during the piece.

**One-time — this plan's work, not the protocol's:**

- **1.5 Written into the protocol** — this section. ☑ 2026-10-03.
- **1.6 The first run, on _Recombination_** — 1.2 and 1.3 run now, as the test of the step and as the real harvest
  the Decibel piece will read: `docs/HARVEST.md` in this repo. ☑ 1.2 done 2026-10-03 (§787) · 1.3 his read 2026-10-03, *"All as
  proposed"* — 35 take now · 12 later · 9 leave stand (§788).
- **1.7 The backfill of the old pieces** — only as 1.4 says; nothing scheduled.

---

## 2. The repo and its kit — `written 2026-10-03` (agreed with him, RUNNING_LOG §788 · §789)

**What this is:** the first thing done for a new piece, before any code is copied — a new repo with its names fixed and
its working documents in place, so the session skills work from minute one and every decision survives a clear.

**Result when done:** a new repo exists, named, with the kit installed and the names fixed. The AI can `/session-start`
in it and find everything it needs. No code yet.

**The data (2026-10-03, §788):** what the kit was here (PLAN 0a, RUNNING_LOG §6): carried WHOLE with one provenance line
— AI_METHODOLOGY · SESSION_HYGIENE · PLANNING_METHOD · MORPH_NOTES · .gitignore · .gitattributes · carried with a named
change — HOW_WE_WORK · SESSION_PROTOCOL · the checkpoint / postclear commands · written FRESH — CLAUDE.md · README · the
journal (seven sections, §3's principles carried) · PLAN · PLANNER · RUNNING_LOG · NITS · COMPOSITION_NOTES · the
standing practices checked HEADING BY HEADING against the last piece's CLAUDE.md (the port before had silently dropped
THE RHYTHM) · the ports by the lineage's rule · NOT in the kit: launch.json and the tool docs — they travel with the code
(3). The names of the last port (P6): the session default · the piece chain · the package name · the Reaper guard · the
ports · the loopMIDI prefix; the title came a week later. `docs/` here today: 33 files + 4 dirs of three kinds — the
standing method docs · the piece's own record · the tool docs that describe the code.

**Three calls, his to reverse (agreed 2026-10-03):** the kit is a TEMPLATE, not a copy of the last piece's docs — the
method docs carried whole, the record docs started empty from skeletons · THE PROTOCOL ITSELF BECOMES THE NEW PIECE'S
PLAN § 0 — containers 2 … 8, for the piece's profile; one document, not two · the AI's memory notes are PER REPO and a
new repo starts with none — the cross-piece ones move to his user-level CLAUDE.md (2.8).

**Recurring — the protocol's step 2, at every start:**

- **2.1 The profile.** The kind of start (copy-forward · from a sandbox · fresh) · which layers (the instrument · the
  score · both · neither) · which score type(s) (the animated scrolling score · a new type · none). Written at the top of
  the new repo's CLAUDE.md and PLAN; it decides which of 3 … 8 the piece runs.
- **2.2 The repo.** Under `github.com/elosine`; public or private his call (public → the gitignore for personal things —
  the call's screenshots, the fonts); LICENSE and .gitattributes carried; the push rule ASKED, per repo (D5's precedent —
  pushing is outward-facing, never inherited).
- **2.3 The names.** The working title (may come later) · the session default · the piece chain · the package name · the
  Reaper project guard · the two ports, the next pair in the lineage (#3 5100/4600 · #4 5200/4700 · #5 5300/4800 · #6
  5400/4900) · the loopMIDI prefix · the folder name under `C:\Users\jwloy\GitHub`. One table in NAMING.md §1.
- **2.4 The method docs carried whole,** one provenance line each: AI_METHODOLOGY · SESSION_HYGIENE · PLANNING_METHOD ·
  HOW_WE_WORK · SESSION_PROTOCOL · MORPH_NOTES while the morph tool lives · the checkpoint and postclear commands ·
  .gitignore · .gitattributes — with the harvest's lines in them: H-1 the MACHINE LESSONS block and THE VERIFICATION
  RECIPE as a doc · H-2 his reading and working habits · H-3 the pasted-image rule · H-6 "a gate counts presence, not the
  look" — into HOW_WE_WORK.
- **2.5 The record docs from skeletons,** empty but shaped: CLAUDE.md (the state line; the standing practices checked
  heading by heading against the last piece's) · README · PROJECT_JOURNAL (seven sections, §3's principles carried) ·
  PLAN (its § 0 = this protocol, for the profile) · PLANNER · RUNNING_LOG (§1) · COMPOSITION_NOTES · NITS · SWEEP_LIST
  (H-5; the `his` test rows of the last piece closed, never carried) · PERFORMANCE_NOTES.
- **2.6 Outside the repo:** a `<prev>-<port>` entry in `.claude/launch.json` for the unfinished previous piece, removed
  when it is finished (H-4) · the planning repo (`composition-planning-and-notes`): the piece in "pieces in play", its
  dates in `next.md` / `plan.md` at his word — only his dates.
- **Done when:** `/session-start` runs in the new repo and finds the state line, the plan's § 0 and the names. Nothing of
  code yet.

**One-time — this plan's work, not the protocol's:**

- **2.7 The skeletons made once** from this repo's docs, emptied — they do not exist yet. Where they live is the protocol's
  home question (parked). `todo`.
- **2.8 The AI's memory notes:** the cross-piece ones (how he reads · the machine limits · the planning repo pointer) moved
  to his user-level CLAUDE.md, so a new repo does not start without them. `todo`.

---

## 3 … 10 — `top line only`

Each is laid out with him when reached: the goal ("Result when done"), the data, then the sub-steps, written here as
agreed. Next in the order: 3 the engine copied forward (the data: `PORT_FROM_TEMPUS.md` steps 1 … 3 and 5 · RUNNING_LOG
§12 … §16 · the harvest's H-7 … H-14). The order is the AI's recommendation (each container feeds the next); his to change.
