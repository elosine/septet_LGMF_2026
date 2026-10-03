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

**His process note, 2026-10-03 (LG-346):** for the three electronics pieces the order is — the three repos set up with the
UNIVERSAL layer first, then ONE live-electronics engine with its notation and graphics designed for all three, then put into
each. Two questions for this plan, open: WHERE that shared engine lives (the home question; §5 one shared engine, its first
member) and HOW it is ported into three pieces (the module boundary, 9; the from-a-sandbox kind, 2.1). Taken up when he reaches them.

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
   laws · the manuals · the maps · the MODULE MANIFEST (below) · THE INSTRUMENT KNOWLEDGE BASE (4.9, his flag, LG-344). Not exhaustive. *(new — his point)* — `top line only`
10. **The protocol's upkeep** — the last step of every start: what the run taught goes back into the protocol.
    *(new; the other end of 1)* — `top line only`

**THE INSTRUMENT — the sound side**

3. **The engine copied forward** — composer app · sandbox · notation engine · print · video · tools · probes · the
   Reaper bridge: byte-exact, proven whole, then the re-palette. *(0b)* — **► laid out below**
4. **The instruments** — the instrumentation → the libraries (acquire · manuals · maps · key switches) → the recipes
   → loopMIDI ports → the Reaper rack. *(0c · 0e)* — **► laid out below**
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

## 3. The engine copied forward — `written 2026-10-03` (agreed with him, RUNNING_LOG §791)

**What this is:** the first container of THE INSTRUMENT layer, for a COPY-FORWARD start (a from-a-sandbox or fresh start skips
it or takes a part). The new repo takes the WHOLE working engine from the piece just finished — the composer app · the sandbox ·
the notation engine · print · video · the tools · the probes · the Reaper bridge — copied byte for byte, proven to work before
one line changes, then turned to the new ensemble (the re-palette), then given empty-but-valid data files so every panel opens.

**Result when done:** the new repo's app boots on its own two ports; every panel opens with zero console errors; the save
round-trips; every test battery is green or CLASSIFIED (re-pointed · retired · "needs this piece's pages"). Nothing sounds yet
(4 the instruments · 5 the calibration). Nothing notates the new ensemble yet (6).

**The data (2026-10-03):** what the last port did — `PORT_FROM_TEMPUS.md` (2026-09-17), RUNNING_LOG §12 … §16, one day on Opus:
a measured SURVEY first (460 files; the engine 12 MB, the piece data 38 MB left behind; the coupling in three kinds — A the
palette proper · B small per-instrument tables inside the tools, wider every piece because each piece builds tools that know
instruments · C the piano as a ROLE in twelve modules) · step 1 the copy, 265 / 265 byte-identical by `cmp`, his uncommitted
source files taken from HEAD · step 2 the copy proven whole with the OLD palette in (151 files staged and deleted by list; 22
green, 8 red, every red accounted for; the one real defect a test dependency the leave list had named as a tuba artefact —
`morph_tuba_baseline.json`) · step 3 the re-palette by ONE script asserting 44 match counts (it refused twice, rightly: CRLF, a
miscount), then 19 files of stragglers by a rule · step 4 the recipes and six skeleton banks, the cello verbatim, `palette_check`
born (157) · step 5 the running app (71 routes · the panels · the quiet piano features CLICKED · the ensemble warn with a
control); five checks green at step 2 red after the re-palette, all #5's tests bound to #5's palette. Its steps 6 · 7 belong to
container 6, its step 8 to 2 and 10. What bit later, now the harvest's eight items H-7 … H-14: batteries carried red a third
time · two dead viewers copied · a `TypeError` on every bare load · a validator warning · one red battery case · the lane CSS
unchecked (lane 8 landed on the English horn, §183) · no bundled font for ♭ ♯ ♮ (a box in the film, §699) · the piano role
decided per module.

**Six calls, his to reverse (agreed 2026-10-03, "c3 good"):** CARRY ALL, USE SOME stands — only piece DATA stays behind (scores ·
actuals · the rack · IR pages · the measurement banks) · the last port's copy list and leave list become the TEMPLATE LISTS,
kept in the protocol and updated each run · the order copy → prove → re-palette → skeletons → verify is kept ("prove before
changing" is the rule that earned its keep) · the harvest's fixes go in AT the copy as steps, not carried broken · the piano
role is decided ONCE, in the profile (2.1), as a "roles" line every module reads · the container ends with an app that opens
and saves — not plays, not notates.

**Recurring — the protocol's step 3, at every copy-forward start** *(the survey on Fable; the rest Opus, from the written steps):*

- **3.0 The survey.** From the source's NAMED HEAD commit: the engine vs the piece data · the coupling in three kinds, each table
  BY FILE AND LINE — A the palette · B the per-instrument tables inside the tools (`palette_check`'s list is the seed; the survey
  re-finds what grew) · C the roles · what is modified or untracked in the source and HIS. Out of it: this run's copy list and
  leave list, from the template lists (3.7) plus the survey's differences — written into the new repo's PLAN § 0.3.
- **3.1 The copy, byte-exact** (one commit). The guard first: `git status` in the source — only the KNOWN-his paths may be
  modified; any other path on the copy list modified or untracked → stop and ask. The list by `git ls-files` (loose and ignored
  files cannot come along). One `tar` pipe; **`cmp` every file against its source, N / N identical.** His uncommitted source
  files taken from HEAD (`bank/panel_snapshots.json`). The copied `launch.json` is inert — the server runs by environment
  (`PORT=…`) until 3.3; the source's ports are NEVER bound. `npm install`.
- **3.2 Prove the copy whole, before one line changes** (nothing committed). Staged from the source's HEAD, never its working tree:
  its data (the banks · the actuals · its scores · its IR pages · its probe schedules) and the goldens its batteries name (the
  recipe in `notation/ir/README.md`); the staged list written to the scratchpad BEFORE the first copy, the deletion by that list.
  The server on the new port by environment. Every battery run on the OLD palette; a red re-run in the source, read-only.
  **Every battery CLASSIFIED once, into a table in RUNNING_LOG and the new NITS:** green · red in the source too → retired (off
  the copy, its reason) · bound to the source piece's pages or palette → re-pointed at 6 or retired · NEW red → explained
  (byte-identical copy ⇒ the inputs). Never carried red again (H-7). The lesson kept in the step: **a missing test dependency is
  invisible to `cmp`** — the copy was faithful to a list wrong by one. The staged list deleted exactly; `git status` clean.
- **3.3 The re-palette** (one asserted script, one commit; the script's text into RUNNING_LOG). The script asserts EVERY match
  count before it writes a byte; each find / replace translated to its file's OWN line endings, never the file to the script's.
  **Kind A:** `TRACKS` in orchestral score order · the lane `<div>`s · the track `<select>` · the curve-window titles (each
  replaced as one block) · the abbreviation map · the title · the session default at every site · `layoutVersion` + 1 with the
  loud "THIS SAVE WAS WRITTEN FOR A DIFFERENT ENSEMBLE" warn by track IDS (the lane count cannot catch it) · the ports — the
  server · the sandbox · the `.bat` · `.claude/launch.json` (the new pair · a throwaway `+1` · the unfinished previous piece's
  `<prev>-<port>` entry, 2.6) · `package.json` · the Reaper project guard · **the composer's lane CSS — the `nth-child` rules,
  one per lane, the count = `TRACKS` (H-12)**. **Kind B:** every table on the survey's list rewritten with the new keys — open
  strings · strike defaults · the articulation maps · the beating ORDER and breath / bow ceilings · the colour tables (one hue
  family per pair) · the trill stand-in · the alias table · what the survey added. **Kind C:** the roles from the profile's
  "roles" line (2.1), ONE lookup, not a test per module (H-14). **The straggler audit** — the old ports · the old guard · the old
  session · the old piece name · the old instruments — by the rule: *a default argument or a write guard is a PARAMETER and
  becomes this piece's name; a test fixture stays and goes to NITS; a coincidence is left.* `node --check` on every changed file;
  `palette_check` green (its asserts extended to the lane CSS). The source's instrument names may stay in comments as provenance
  unless they claim behaviour.
- **3.4 Recipes and skeleton banks** (one commit). `sandbox/instruments.js` rebuilt by a script that keeps the helper blocks and
  any CARRIED instrument's measured rows verbatim and replaces the header and the table; `node --check` before a commit. Every
  other value marked `PROVISIONAL — 4 / 5`; technique keys = the notation registry's names (a key that reaches the IR is already
  drawable; the roster keys not in the registry listed by `palette_check`); ports with the lineage's prefix, distinct from every
  live rack's. **A shared MECHANISM never shares a MEASUREMENT** (the double bass carried none of the cello's). The banks keyed by
  instrument skeletoned: shape and metadata kept, only the carried instrument's rows, a `_provenance` line naming what was
  dropped; a table keyed by TECHNIQUE keeps only the carried instrument's rows (a flute's `staccato` must not become the
  bassoon's). Recorded material of the old piece emptied. `bank/panel_snapshots.json`: one take loaded per panel, or the file
  moved to `bank/reference/` and an empty valid one started — RUNNING_LOG says which. The day-one stub written BY THE APP, never
  by hand. `palette_check` · `roster_check` green (pending voices listed).
- **3.5 Verified in the running app** (AI_METHODOLOGY rule 4). The servers from `launch.json` on the new ports; the previous
  piece's checked and never bound. The route battery, every `<script src>` and `/api/*` 200 (a POST-only 404 read in the handler,
  not called a defect) · the save API round trip on a throwaway name, the files seen and deleted · `Composer initialized`, zero
  console errors (Web MIDI denied is the pane's policy) · `TRACKS` · `META_LAYER` · the lane count ON THE PAGE · `laneCanPlay`
  probes above and below each range · every panel opens · **the quiet roles CLICKED, not assumed** · the ensemble warn fired on an
  old-ensemble save WITH A CONTROL (the own save warns nothing) · the sandbox's menu. Results as a table; **defects that only
  running found get their own paragraph**; the checks green at 3.2 and red after 3.3 classified into 3.2's table.
- **3.6 The record.** RUNNING_LOG one § per step, written as each step ends · NITS: for every copied file the source's live
  bullets, dated, plus this port's own (the quiet roles · the fixtures · every classified red) · the tool docs that travel with
  the code, one provenance line each; NAMING §1 the names (2.3) · CLAUDE.md § Apps rewritten from the source's, with the
  standing warnings (print and video share the frame math · the curve-channel map is cached · a server route keeps the engine it
  started with · the lane CSS) · PLAN § 0 container 3 `done` · the report to him: what runs · what is quiet and why · what is
  provisional · what he does next (4 · 5).
- **Stop and ask him:** a path to copy is modified or untracked in the source · a battery red here and green there, the cause
  not a missing file · a role that one line cannot make quiet · anything that needs a decision about the music.
- **Done when:** the app opens and saves on its own ports, every panel clean; the batteries' table has no unexplained red;
  everything pushed.

**One-time — this plan's work, not the protocol's:**

- **3.7 The template lists** — the last port's copy list and leave list (`PORT_FROM_TEMPUS.md` step 1), written into the
  protocol as THE TEMPLATE LISTS with the harvest's changes: `clusterview.html` · `chordview.html` · `docs/instrument_map.json`
  OFF the copy list (H-8) · the eight batteries red in the source too — `test_coords` · `cresc_check` · `test_extract_played` ·
  `ir_extract_golden` · `test_notate_block` · `test_playability` · `test_midiplayer` · `test_sonify_core` — onto the leave list
  (H-7) · `tools/morph_tuba_baseline.json` ON the copy list (§13's lesson). `todo`.
- **3.8 Four small engine fixes made HERE, before the copy** (Opus, one commit; none touches the layout, the shield stands): the
  bare-load `TypeError` at `sequence_ui.js:1652` (H-9) · `model_bank --validate`'s `provenance.palette` warn (H-10) ·
  `test_animobj.js`'s case since §454 (H-11) · `palette_check` reads the composer's lane CSS (H-12). `todo`.
- **3.9 The bundled font for ♭ ♯ ♮** (H-13) — an open-licence font in `notation/app/fonts/`, in the page's stack and the film's
  and print's font lists, so the app, the film and the print draw the same sign. At the FIRST copy, in the new repo: it changes
  the look of the film and the print, and this piece's are locked (D56). `todo`, placed in 3.3.
- **3.10 The roles helper** (H-14) — ONE lookup by the profile's "roles" line in place of twelve `instKey === 'piano'` tests. At
  the first copy, or on 9's list if a role becomes a palette property. `todo`.
- **3.11 Written into the protocol** — this section. ☑ 2026-10-03.

---

## 4. The instruments — `written 2026-10-03` (agreed with him, RUNNING_LOG §792; his flag LG-344 in 4.9)

**What this is:** the sound side made real — the second container of THE INSTRUMENT layer. Every instrument of the new piece
gets a library on the machine · a loopMIDI port · a Reaper track with its preset loaded · its plugin state set as text (curve
copies or slots, the FX baseline) · a recipe in `sandbox/instruments.js` derived FROM THE RACK. It ends with the first sound
from the app. Not yet balanced — that is 5.

**Result when done:** a note on every track plays from the composer app, on its own port, on the right channel · every
recipe's technique keys are the notation registry's; `palette_check` and `roster_check` green · what could not be derived
(keyswitch notes, mute order, CC0 numbers) is marked PROVISIONAL with the step that verifies it.

**The data (2026-10-03):** what the last run did — PLAN § 0c · 0e, RUNNING_LOG §11 · §19 … §42 · §48, 2026-09-17 … 18, two
days, him at the machine: the instrumentation first (D1), then the libraries named by him (D6), one looked-up fact each from
the record (piece #2's journal for ARO, piece #3's manuals for Xsample); one library arrived mid-build and became its own lane
(the bowed vibraphone, D12) · ten `LG` ports made BY HIM in loopMIDI, verified by name, the `b` ports for the SI2 second
instances (D9; the bassoon's need found only at the preset count) · the rack by the bridge — tracks by idempotent scripts in
score order (`make_tracks.lua` · `make_perc_tracks.lua`), HE loaded every preset in each plugin's own browser (the one step no
script can do, §36), the AI read each load back and set the rest as text, one method per plugin family: UVI (SI2) its XML
state — curve copies cloned, the FX baseline, channels and ports derived into the recipe (`apply_uvi_parts.js`) · Kontakt
(Xsample) by Lua through the bridge — the four curve slots (D11), the `.nki` names read back · Spitfire (ARO) its XML state —
the family preset holds the instruments as articulations, the selection read back and banked, the key maps from his hover and
a meter sweep · the recipes DERIVED, not typed — from the running rack, from his Preset Menu screenshots (Xsample: 39 · 88
entries), from piece #2's catalog through a generator (catalog · selection · `apply_perc.js`, D7) · dead ends kept: the
Spitfire patches encrypted (§33) · a base64 decoder that read only the header line (§34) · "cloning yes, a new family no"
(§35) · a BOM in the sweep (§42) · a flattened backslash in a Lua (§28) · what bit later: the ports cannot be automated (H-15,
the harvest's one item here; his ask — each percussion instrument its own port) · a track taking `LGPerc` on ALL channels
(§221) · the percussion menu missing thirteen instruments (§212).

**His word at the goal (LG-344):** *"Number four is good. We'll just keep it as is for now … if there's minor or easy to come
improvements at this port, let's take those on, but not a major overhaul at this time."* — and THE FLAG, 4.9 below.

**Five calls, his to reverse (agreed 2026-10-03):** the order instrumentation → libraries → ports → tracks → his loads → read
back → recipes derived → the first sound · the division of labour as the rule — he does the loads, the ports and the
screenshots, the AI everything that is text · one how-to per plugin family kept in the protocol; a new library of a known
family costs a load and a read-back, a new FAMILY is flagged in the profile as real work · H-15 looked into once, before the
next rack; if loopMIDI cannot be driven the ports stay his and the step says so · the catalog · selection · generator
pattern (D7) is the model for any multi-instrument lane.

**Recurring — the protocol's step 4, at every start with a sound side** *(him at the machine for three things — the ports ·
the loads · the screenshots; everything that is text is the AI's):*

- **4.0 The instrumentation and the libraries.** The instrumentation fixed first. Each instrument a LIBRARY named by him; one
  looked-up fact each from the record (the collation, 9), never a search. The plugin FAMILY per library named (UVI · Kontakt
  · Spitfire · new) — a new family is real work, flagged in the profile. A library still to acquire is flagged; the start runs
  on the installed ones and takes the rest as they arrive.
- **4.1 The ports.** From the STANDARD NAME SET (4.8) with the lineage's prefix (2.3), so nothing is renamed later. Made in
  loopMIDI — by the AI if H-15 finds a way, else by him. Verified by name from the app. A second instance (a `b` port) where a
  library's preset count needs one — ask the count BEFORE the tracks are made.
- **4.2 The tracks by the bridge.** Idempotent scripts, score order, one row per instrument or lane: input on its port and
  channel, armed, monitoring on, 0 dB, FX bypassed except the convolver (his rule, #5 §275). The rack file is his; committed at
  his word.
- **4.3 The loads — his.** Every preset in the plugin's own browser. He says "done loading"; the AI reads back, pushes nothing.
- **4.4 The state as text, one how-to per family.** UVI: the XML state — the curve copies cloned, the FX and gain baseline.
  Kontakt: Lua through the bridge — the four curve slots, the `.nki` names read back. Spitfire: the XML state — the family
  preset holds the instruments, the selection read and banked, the key maps from his hover and a meter sweep. Each how-to a
  page the protocol keeps (the first pages of the knowledge base, 4.9 · 4.10).
- **4.5 The recipes derived from the rack, never typed.** Channels, ports and presets read from the running rack; the Preset
  Menus from his screenshots where the plugin cannot be read; a multi-instrument lane by catalog → selection → generator (D7).
  Technique keys the registry's; the roster keys not in the registry listed. Everything not derivable marked PROVISIONAL with
  its verifying step. `palette_check` · `roster_check` green.
- **4.6 The first sound.** A note on every track from the app, in HIS Chrome (the pane has no Web MIDI); the capture read to
  confirm what the app sent.
- **4.7 The record.** RUNNING_LOG per step · RACK_SETTINGS.md (every hand-set value and how to revert it) · NITS · each
  library's lessons onto its page (4.9).
- **Stop and ask him:** a library not installed · a preset count · a new plugin family · a port name that clashes with a live
  rack.
- **Done when:** every track sounds from the app; the recipes green; the rack saved by him.

**One-time — this plan's work, not the protocol's:**

- **4.8 The standard port name set** — one table, role → port name, the prefix rule; and H-15 looked into once (can loopMIDI
  be driven by a script). The "minor and easy" improvement he allowed. `todo`.
- **4.9 THE FLAG — THE INSTRUMENT KNOWLEDGE BASE** (his words whole: LG-344). A bigger project, in six parts: a METHODOLOGY PER
  LIBRARY (how to collect the ranges · how to find the articulation switches · the idiosyncrasies, round robins first) · a
  PROFILE PER INSTRUMENT he owns, GROWING EVERY PIECE (the range · the CC numbers and what they switch · the volumes; each use
  adds something) · a ROLLING WORK LIST per instrument (a probe of every round-robin sample for volume and sound, the first
  entry) · AI AUTOMATION RESEARCH (the information gathered and confirmed by the AI; beyond Lua, perhaps MCP) · THE PORTS
  standardized and AI-made (4.8 · H-15) · THE DATA CONTAINERS (the JSON, how things are housed). **NOT NOW** — *"I have too much
  composition to do."* Taken up when he has time; its home the collation (9). `flag`.
- **4.10 The three how-tos written from the record** (RUNNING_LOG §20 … §42: UVI · Kontakt · Spitfire) as the first pages of
  4.9 — cheap, Opus, from what is already logged. `todo`.
- **4.11 Written into the protocol** — this section. ☑ 2026-10-03.

---

## 5 … 10 — `top line only`

Each is laid out with him when reached: the goal ("Result when done"), the data, then the sub-steps, written here as
agreed. Next in the order: 5 the calibration (the data: PLAN § 0d the balance probe and § 1b the rack calibrated to an absolute
standard — RUNNING_LOG §43 … §61 and §75 … §91, the six bugs that outlived the first pass; `docs/DYNAMICS_LAW.md`; the
harvest's items under "→ 5"). The order is the AI's recommendation (each container feeds the next); his to change.
