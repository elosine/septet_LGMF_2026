# septet LGMF 2026 — the Lake George septet

Composition #6 in the custom-composition-system lineage
(#1 `string_quartet_no1-composer` → #2 `composition_for_two_pianos_and_two_percussion`
→ #3 `for_bass_clarinet_harp_and_accordion` → #4 `for_seven_tubas` → #5 `septet_2026`,
the Tempus septet → this).

Written for the **Lake George Music Festival 2026 call**. The call has NOT been read yet —
the composer, 2026-09-17: *"don't need to look it up now, lets focus on getting started."*
Deadline, duration limit and score format are unknown until he says to read it (journal Q2).

Instrumentation, fixed by the composer 2026-09-17 (journal D1) — **three pairs plus
percussion: english horn + bassoon · horn + trumpet · cello + double bass · percussion.**
The percussion instruments are not yet named.

This piece inherits piece #5's stack — composer score app, sandbox, notation IR + engine,
print, video — by **copy-forward with the instrument palette rewritten** (journal D3; the
method piece #5 used on piece #4, its D1). The delivery format is the same as #4's and #5's
(journal D2): an animated scrolling score with the same animated devices; a presentation
score (video + print); the performance score later.
**The IR contract (inherited, #5's D9):** the composer save is the ground truth; the IR is
derived from it by the extractor and is the single source for every downstream score.
Libraries (journal D6): **IRCAM Solo Instruments 2** bassoon · horn · trumpet —
**Xsample** cello (#5's recipe) + double bass — **Spitfire Abbey Road Orchestra Percussion**
(piece #2's library) — english horn **being acquired**, library to be named — **a bowed
vibraphone still to acquire.**

**State of the port (keep this line current):** **DONE — 0a · 0b · 0g · 0i all closed
2026-09-17** (RUNNING_LOG §12–§18). The app, the sandbox, the notation/IR stack, print and
video are here and verified running on the seven tracks. **Nothing sounds yet** — the recipes
are placeholders and there is no Reaper rack: that is **0c + 0e, together, with him at the
machine**, and it is the next step.

## READ FIRST — how to work here

**`docs/AI_METHODOLOGY.md`** is the composer's standing instruction on scoping, decisions,
and confidence (inherited unchanged from piece #4 by way of #5). It governs everything below
and outranks the working-preference docs where they conflict. In short: fix what blocks the
piece and flag the rest to `docs/NITS.md` · don't make the composer decide minutiae ·
prefer one robust build over a fragile one · **a confidence claim must be verified in the
running app** · no clear evidence means no diagnosis.

The composer's own rule for a port (said of the last one, 2026-09-03; it holds here):
*"I don't want to get too bogged down in technical details of porting and code and such,
but I want to do a good, solid job and not leave out things now that might bite later ...
leaving everything we can for when the time comes."* Keep the conversation at the
conceptual level; consult the code yourself.

**How he reads (his user-level CLAUDE.md, 2026-08-24):** mildly dyslexic — succinct
language, clear spatial division between chunks, short lines, one idea per chunk, bullets
first. A one-line TL;DR leads any reply over two paragraphs. One step at a time.

## Orient from docs, not from scanning

- **What now / what next:** `docs/PLANNER.md` — the **NOW ►** line, then the outline
- **Living plan:** `docs/PLAN.md` — stable IDs; rules in its header
- **Session state, decisions:** `docs/PROJECT_JOURNAL.md` — §2 Resume Here first
- **The lab journal:** `docs/RUNNING_LOG.md` — append-only, written as the work happens
- **The sketch pad:** `docs/COMPOSITION_NOTES.md` — the composer's musical ideas, verbatim
  (opens with LG-1 … LG-8, the Lake George notes he made while writing piece #5)
- **Building a plan item / analyzing an issue for the plan:** `docs/PLANNING_METHOD.md` — three phases, fixed formats
- **Deferred, real but not now:** `docs/NITS.md`
- **Working preferences & routines:** `docs/HOW_WE_WORK.md` · `docs/SESSION_PROTOCOL.md`
  · `docs/SESSION_HYGIENE.md` (clear between chunks; the docs are the handoff)

Do NOT scan or analyze the codebase unprompted. Name the question first, then read only
what answers it. High bar for subagents / background processes.

**After `/clear` + `/postclear` (his standing rule, 2026-09-11):** play back, then **STOP
and ask**. No edits, no builds, no tool calls beyond the resume reads. Start only on his
word. At `/session-start`: orient, agree the agenda, then work.

## Standing practice: the lab journal (composer, 2026-09-03 — not optional, never asked for)

> *"I'd like to keep a running journal like lab notes, so I can look back on decisions or
> comments, theory, philosophy, etcetera, or how we actually made something, if I wanted
> to write a paper later about this — and I would expect the AI agent to do this
> automatically as a habit."*

The rules, adopted from `live-electronics-engine` (its CLAUDE.md and `docs/journal/README.md`):

- **When:** at the end of any exchange that produced a decision, a result, a rejection, a
  measurement, a theoretical or philosophical point, or a question worth remembering.
  Not at session end — by then the reasoning has blurred.
- **What each entry carries:** what prompted it, in the composer's words, quoted not
  paraphrased · what was tried, in order · the numbers · what was rejected and why (dead
  ends at the same weight as successes) · what was decided, and why that rather than the
  alternative · corrections as NEW entries, never edits.
- **Append-only.** The journal is the record of how the thinking went; it is never tidied.
  Current state lives in the plan, the journal §2 and the READMEs, which are rewritten freely.
- **The sketch pad is the same habit for musical ideas:** every compositional idea the
  composer voices goes into `docs/COMPOSITION_NOTES.md` verbatim, dated, the moment it is
  said — with the AI's reading kept separate and marked as such.

## Standing practice: the morph notes (composer, 2026-09-06 — #5's CN-29)

> *"I want to institute a process where we're taking notes in a central document that will inform the eventual revision."*

Every remark about the morph tool — an awkwardness, a wish, a piece-specific adjustment made, what an all-purpose tool would
need — goes into **`docs/MORPH_NOTES.md`** §3 the moment it is said, dated, verbatim, the AI's reading marked. The tool is
adjusted for the current use now; the file is the memory for its revision into *"an easier to use all purpose tool"* after the
last piece or this one. Not optional, never asked for — the lab journal's rule, for one tool. The file was carried WHOLE from
piece #5 (he named "this piece and the next piece" when he started it); this piece's form is a rondo whose refrain is a morph
(LG-6), so the file matters more here than it did there.

## THE RHYTHM — next steps · model · clear (standing, composer 2026-08-23; carried whole 2026-09-17)

*(It was in piece #4's CLAUDE.md and the copy-forward to piece #5 dropped it, so it loaded
in no septet session for a week and the advice came only sometimes — his own verdict,
2026-09-10: "This was happening for a while, but then is inconsistent." It is carried here
from the first commit, deliberately.)*

At every juncture — a chunk wrap, a milestone, a mode change (execution ↔ conversation),
or when asked "where are we" — the AI **states the next 2–4 logical steps, each with a
recommended model and whether to clear before it**, and **says out loud when a good clear
or switch point has arrived** ("this is a good time to clear", "switch to Opus for this").
Not when asked — as a habit, like the lab journal. The rule for the recommendation is in
`docs/SESSION_HYGIENE.md` § Model strategy (Fable = judgment / verdicts / design;
Opus = executing a written plan; clear at milestones and mode changes; the cold-execution
test before any clear).

**The running thread lives in `docs/PROJECT_JOURNAL.md` §2 → "NEXT STEPS · MODEL · CLEAR".**
Keep it current as steps complete — it is the first thing a model reads after a clear, and
it must say what is next, with what model, right now.

**Fable's allotment is separate and is the one he watches** (composer, 2026-09-10). So the
routing advice is also credit advice, and these bind every Fable turn:
- **Fewest round trips.** Batch independent reads and tool calls into one response; no
  exploratory reads; name the question before opening anything.
- **No screenshots unless the screenshot IS the proof he asked for.** `read_page` otherwise.
- **Never spawn a subagent on Fable.** If one is ever justified, pass `model: "sonnet"`.
- **Wrap on Opus.** `/checkpoint` and `/session-end` are mechanical work at the long,
  expensive end of a session: switch to Opus, wrap, `/clear`, switch to Fable, `/postclear`.
- **A `Resume reads:` list names what the NEXT STEP needs, not what the last session wrote.**
  Every line on it is re-read in every turn of the session that follows.

## Apps

- **Composer score:** `node score/server.js` → http://localhost:5400/composer.html
  (7 instrument-keyed lanes + META; saving per #5's D17 — working copy · Save · Name version ·
  Reload; `docs/NAMING.md` §1). **One open composer tab per score** — a second tab clobbers the
  working copy on Save, so the AI drives HIS tab or he closes it first.
- **Sandbox:** `node sandbox/serve.js` → http://localhost:4900
- **`.claude/launch.json`** names them `score` (5400) and `sandbox` (4900), plus `score-5401`
  for throwaway verification and **`tempus-5300`, which runs piece #5's server from its own
  folder** so both pieces' apps can sit side by side (D4; remove it when #5 is finished).
- **The notation app:** :5400 → `/notation/app/notation.html`; the picker reads
  `notation/ir/index.json`. Today the only page is `lgmf-0i`, the 0i proof. **There is no MAIN
  notation file yet** — it arrives with the piece, as `piece-lgmf.ir.json` (NAMING §1).
- **Print / video:** `tools/export_print.js` (A3 landscape) and `tools/export_video.js` run and
  were proven at the port. `print/score/build.sh` runs #5's five gates — they need this piece's
  own pages before they mean anything.
- **Ports** (loopMIDI, case-sensitive) are prefixed `LG` — `LGEngHorn` · `LGBassoon` · `LGHorn`
  · `LGTrumpet` · `LGPerc` · `LGCello` · `LGBass`. **They do not exist yet** (0e creates them).
  The prefix is not cosmetic: loopMIDI ports are machine-global and piece #5's rack is still
  live, so a bare `Vc` would be ITS cello.

⚠ **Standing warnings, inherited and still true:** `export_print` and `export_video` share
`Coords.ensembleFrame` — **a change to the frame math moves BOTH** · the AI never holds his
port and never saves from its own browser pane (principle 9) · the in-app browser has no Web
MIDI, so every MIDI path is verified on his Chrome.

**Checks this piece owns:** `node tools/palette_check.js` (157 — tracks vs recipes, ports, every
per-instrument table in the app) · `node tools/test_written_pitch.js` (8 + a control). Run both
after any change to `TRACKS`, `sandbox/instruments.js` or `notation/registry/ensemble.json`.

## Reference repos (read-only context; registered as additional working dirs)

- **#5** `C:\Users\jwloy\GitHub\septet_2026` — **the source of the port.** Its docs are the
  richest and the most recent: `RUNNING_LOG.md` §1–§13 is the record of the LAST port (how
  to do this one); `PROJECT_JOURNAL.md` §3 Principles · §4 D1–D59 · §5 Playbooks; the tool
  docs (`STRIKES_TOOL` · `TRILLS_TOOL` · `BEATING_TOOL` · `CRESCENDO` · `NAMING` · `RENDER` ·
  `REAPER_CONTROL` · `SAMPLER_QUIRKS` · the `NOTATION_*` set). **It has uncommitted files
  that are the composer's own — never stage, move or edit anything there.**
- **#4** `C:\Users\jwloy\GitHub\for_seven_tubas` — the source of #5's port; SI2 brass (the
  tuba maps), notation standards, IR schema, the D-log
- **#2** `C:\Users\jwloy\GitHub\composition_for_two_pianos_and_two_percussion` — **the
  percussion** libraries and maps
- **#1** `C:\Users\jwloy\GitHub\string_quartet_no1-composer` — Xsample Contemporary Solo
  Strings (CC0 articulations, channel banks, gliss keyswitches), MIDI architecture standards
- **#3** `C:\Users\jwloy\GitHub\for_bass_clarinet_harp_and_accordion` — the extracted sampler
  manuals (`docs/manuals/extracted/`: IRCAM Solo Instruments 2 · Prepared Piano 2 · the
  Xsample library, AIL scripting, bass clarinet) and the Xsample woodwind deep map. **If a
  session does not list it as a working directory, request the folder** (the
  `request_directory` tool; the composer approves one prompt) — it was attached that way
  on 2026-09-17.

Consult only when a specific named question requires it. Never edit them.

## Git

- Commit at the natural wrap of an approved chunk; reference plan IDs in messages.
- Stage **explicit paths only, never `git add -A`**.
- **Push automatically after every commit** (D5, composer 2026-09-17 — the rule of pieces
  #4 (D30) and #5 (D8), adopted here at his word). Do not ask. The user-level skills' "ask
  push now?" is superseded in this repo.
