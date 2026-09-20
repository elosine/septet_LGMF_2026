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

**State of the piece (keep this line current):** **► PLAN `1h`, THE BLOOM ON A TAKE, IS PLANNED AND APPROVED, NOTHING BUILT (RUNNING_LOG §162–§166; `docs/PLAN.md` § 1h, written to be executed cold):** a TAKE from the strikes drawer chosen in the morph's PITCHES pulldown · read AS ASSIGNED — each pair on its JUST pitch, cents kept, the line showing note · partial · cents (the drawer already doubles a note and is where he hears and resolves; nothing is built there) · the morph's dynamics brought under the law, EVERY sustained morph note shaped so a bloom sits on the sequence's scale · then his listen. His method from here: small builds, one MODEL at a time, by compositional need. **And LG-53: part two of the piece is a sequence underneath (harmony + orchestration) with the multitempo / phase shift on top.** *(Before it:)* **► HIS TESTS ARE CLOSED AT HIS WORD (RUNNING_LOG §162 — *"mark everything else as complete"*; he is composing with the sequence tool). THE WORK IN HAND: THE MORPH PANEL, IN SMALL BUILDS, ONE MODEL AT A TIME, BY COMPOSITIONAL NEED — first a BLOOM on a TAKE from the strikes drawer (the morph's PITCHES pulldown listing the takes as the sequence drawer does), the morph's dynamics built in the same build (`MORPH_NOTES.md` 2026-09-20). Under the planning method; nothing built yet.** *(What follows is the state before it.)* **► PLAN `1g` BUILT, HIS RACK TEST OUTSTANDING (RUNNING_LOG §156–§158): IN A SEQUENCE, ONE SCALE.** His ear on the first listen — *"the attacks are very loud"* — and his recording read back showed the MIDI on the law and the LAW with two scales: a struck `pp` ≈ −10 dB, a shaped `pp` ≈ −28 dB, so a straight box after a waves box was a +10 … +18 dB step. His call: **every SUSTAINED note a sequence writes is shaped — mf strike, curve channel, the fader held at its table value — moving or not** (`isShaped` in `sequence_ui.js`; `DYNAMICS_LAW.md` §3 Rule 3; `SEQUENCE_TOOL.md` §21). A strike is not reached. The two vibraphones sharing one fader channel was found and fixed on the way. **And THE TAKES MENU (§159):** the box line's `take` is a list of our own — a `▸` beside every take HEARS it without choosing it, the name chooses, a filter over the 216 names (`SEQUENCE_TOOL.md` §22). **HE HAS BEGUN COMPOSING — `scores/piece-LGMF-Sec01` and its first named version `-v1.1-1stSequence` appeared in the tree on 2026-09-20 (his, untracked).** *(What follows is the state before it.)* **PHASE 1 · SESSION 11 (2026-09-20): THE DYNAMICS LAW IS BUILT AND PROVEN IN HIS RACK. PLAN 1e IS CLOSED (RUNNING_LOG §143 · §144).** His recording, read back per track and channel by `cc7_by_channel.lua`: **MAIN ch 1 empty on all eighteen tracks** · every shaped note on a **curve channel**, three per player in rotation, the SI2 three on their `b` ports and nothing on the non-`b` ones · **every strike an mf velocity for its own pitch**, checked against the bank · **CC7 reaching 0** on the first channel of every player (the floor of **56** elsewhere is `ppp` under an `mf` top, to the digit). Where §140 found every note struck at 127 with CC7 moving 63 … 127 on MAIN, the rack now receives every note at its own mf velocity with CC7 moving **0 … 127 on the curve channels**. **► THE SEQUENCE FEATURE ADD IS BUILT, END TO END, AND NONE OF IT HAS BEEN HEARD (RUNNING_LOG §150–§155, SEQUENCE_TOOL §16–§20).** At his word (*"try to move through the whole plan independently, the whole build, please. And I'll test at the end."*), the whole running order was built in one sitting: **1d.10** the dynamics table · **1d.11** THE LIBRARY — every sequence on disk in `bank/sequences.json`, a store of its own with a two-name whitelist on `/api/snapshots`, an untitled rolling stack of 50, named keepers, `save` · `revert` · `•` · `duplicate` · `×` · **1d.12** a RANGE of boxes (click, SHIFT+click) taking `dyn` · `enter` · and a **waves range of its own**, the stream now a 0…1 height mapped late and GLIDING across a line · **1d.13** the waves by PRESET (five behaviours, lengths between two numbers with a `tilt`, a named shape, a HOLD, density in words, `save preset`) · **1d.9 + 1d.14** the breath round each player's OWN maximum, one breath in ten an OUTLIER, and `±` in SECONDS · **1d.15** the clock and the CURSOR. Each was verified in the running app with no MIDI and committed on its own. `sequence_check` **126 → 180**; `dyn_table_check` **51** and `test_snapshots` **26** are new. **WHAT IS LEFT IS HIS EAR — the test at the foot of each PLAN item, and 1d.6, the listen.** *(The account of 1d.10 alone follows.)* **`1d.10`, THE DYNAMICS TABLE (RUNNING_LOG §150).** Every WRITTEN DYNAMIC now has a CC7 value of its own — `fff` = 127 and **4 dB a written step** through each instrument's MEASURED fader curve (`score/public/dyn_table.js`): cello `ppp … fff` = 43 · 51 · 59 · 69 · 81 · 94 · 109 · 127, bassoon 24 · 32 · 40 · 50 · 62 · 79 · 100 · 127 — two CC7 ladders, the same decibels, and `mp → ff` = 69 → 109, his own *"say 65 to 111"* (LG-51: a STATED range is what sounds, for the whole curve). Where 1e gave every shape 0 … 127 so only its DEPTH was heard, `ppp–mp` is now **43…69** against `pp–mf` **51…81**. **The CHECK FIRST found three curves short** — vibraphone · cello · double bass stopped at ≈ −27.5 dB, below the noise floor at CC7 24 in 0d — and they were extended in the BUILDER by each instrument's own fitted law. `dyn_table_check` **51** · `sequence_check` still **126** · `composer.html` one script tag. **HIS RACK TEST OF 1d.10 IS OUTSTANDING; the running order continues at 1d.11 the library** → 1d.12 select a range → 1d.13 the waves by preset → 1d.9 + 1d.14 the breath's lengths → 1d.15 the clock and the cursor → 1d.6 his listen (`docs/PLAN.md` § 1d, THE FEATURE ADD; the design talk is RUNNING_LOG §145–§148 · LG-50 · LG-51). **And `1f`, `todo`: the crescendo tool was never brought under 1e — it still strikes at its top's velocity with the fader inside the 12 dB ladder.** *(What follows describes 1e, which 1d.10 amends at Rule 2 only.)* Every SHAPED note a tool writes — waved, ramped to or from a dynamic, swelled, or drawn by hand with the note card's new **`full fader`** box — now carries `cc7Abs {0,127}` and `velAbs` = its instrument's **MF velocity for that pitch**, has its heights re-based so the shape's TOP is the full fader, and sounds on a **CURVE channel** in Hear as in the score. `composer.html` did not change: the machinery was piece #5's, per note, all along. **`docs/DYNAMICS_LAW.md` is the page, and CLAUDE.md now names it as the FIRST read for any sound-path work.** `sequence_check` still **126**. *(Below is the account written before the build; read it through this.)* **PLAN 1e IS WRITTEN AND NOT YET BUILT.** His ear found every SHAPED note — the waves, a drawn swell, a morph's level — sounding *"between two high dynamic levels"*: struck at the velocity of its shape's TOP, with the fader moving only inside the ladder's 12 dB. **Two routing bugs were found and fixed on the way** (RUNNING_LOG §137: Hear streams the fader on MAIN ch 1, where his rack takes no moving controller · **§139**: `insert()` never dropped the CACHED curve-channel map, so an inserted sequence fell back to MAIN once the score had been played — §75's bug by another door, one line), and then **HIS RECORDING, read back per track and channel** (`reaper/bridge/jobs/cc7_by_channel.lua`, new and read-only; §140) showed the routing right and named the real fault. **HIS DIAGNOSIS closed it (§141):** *"in the tuba piece and in the last piece, we always made crescendos from zero … CC7 zero to CC7 max … a normalized one."* **And the machinery is ALREADY IN THE SCORE, per note, built by piece #5 eleven days ago for this same problem** — `wc.cc7Abs {lo,hi}` maps a drawn height straight onto the fader, bypassing the 12 dB ladder, and `wc.velAbs` sets the strike velocity — **so `composer.html` does not change; the fix is what the TOOLS WRITE.** ► **`docs/PLAN.md` § 1e, THE VOLUME FIX (V1 … V7), written to be executed cold:** every shaped note carries `cc7Abs {0,127}` and `velAbs` = its instrument's **MF** velocity (decided for ALL SEVEN, not just the brass — the level lost against a struck fff is 3.9 … 5.4 dB, uniform since 1b, so the balance holds), the heights re-based so the shape's top is the full fader, and Hear moves onto the CURVE CHANNELS. **The trills were checked and need nothing** — they carry volume as separate STRUCK notes by velocity, the septet's design. **ON DECK, DEFERRED at his word:** the sequence FEATURE ADD — § 1d, THE NEXT FEATURE ADD (a clock · click-to-cursor · `±` in seconds · a sequence LIBRARY · a RANGE of boxes · the waves by PRESET) and **1d.9** (`of max` · `outlier`), a short design talk owed first. **The sequence panel now FLOATS and every font in it is up 4 from one constant** (§132). **PLAN 1d is built to its end, but his tests of 1d.7 · 1d.8 and his listen (1d.6) are better done AFTER 1e, which changes how they sound.** *(The paragraph below is session 10's and still describes PLAN 1d itself.)* **PHASE 1: THE HARMONY IS BUILT, THE RACK IS CALIBRATED, AND NONE OF IT HAS BEEN HEARD.** Phase 0 is closed. **PLAN 1a is DONE end to end** (RUNNING_LOG §67–§73): `bank/reference_chords.json` holds the six chords as computed data, `bank/actuals/` the 24 transitions under four models, and **six scores exist** — `lgmf-ref` (6:50), `lgmf-spectral · lgmf-balance · lgmf-bloom · lgmf-converge` (9:50 each) and `lgmf-all` (all 24 chord-major, 39:50). **PLAN 1b is DONE too** (§76–§91), and it had to be: he found the rack 7–21 dB hot and clipping. It is now calibrated to an ABSOLUTE standard — K-20, BS.1770 — with a proven meter and a −20 dBFS reference living in the rack (`bank/reference.json`), every instrument measured on the channels the piece actually plays (`bank/instrument_card.json`), trims to a derived target (`bank/trims.json`) and a rebuilt velocity remap at a **12 dB written span** (`bank/velocity_remap.json`). Final measured: tutti fff **−19.1 LUFS**, true peak **−9.7 dBTP**, per-part spread **7.71 dB** — the tutti passes, the ±1 dB per-part target does not, and that is HIS decision (§91), not an oversight. **Six bugs were found on the way, each of which would have outlived the piece:** a per-object-id channel map that made every score after the first in a tab play on the previous score’s ROUTING (§75) · round robin ON for four instruments, up to 13.8 dB between members (§79–§89) · the SI2 Dynamic fix of §56 reaching only the parts the piece never plays (§85) · two `Horn SI2 high` tracks that had never been trimmed (§84) · the sleigh bells peaking **+10.6 dBFS on one note** (§83) · and the 3-pitch measurement grid, far too coarse for a piece using 13–40 pitches per instrument (§90). **`docs/RACK_SETTINGS.md` now records every hand-set plugin value and how to revert it.** **Since then (2026-09-19): PLAN 1c — the strikes drawer adapted for this piece, six stages (§92–§101: the eight players · `ordinario` · hear strike | long tone · Hear through 1b’s remap with a `dyn ppp … fff` · two vibraphone seats · the HARMONIC SERIES banner, four selections, cents through Hear and Insert) — is BUILT AND UNHEARD; and PLAN 1d — THE SEQUENCE DRAWER, the first tool of the design phase (saved takes held as sustained chords in a row of time containers, typed or ROLLED by piece #5’s `time_containers.js`, the morph’s breaths laid over them, a new chord ATTACKED or taken SEAMLESSLY at each player’s next breath, one dynamic per container OR a layer of dealt per-player WAVES (1d.7); a sequence is a RECIPE saved in the score file and the notes are derived) — is PLANNED IN FULL under the planning method (§102–§111, LG-35 · LG-36 · LG-38 · LG-39); 1d.1, THE GENERATOR, IS BUILT (§114 — `score/public/sequence.js`, a recipe in and every player’s notes out, `sequence_check` 49, `docs/SEQUENCE_TOOL.md`) AND SO IS 1d.2, THE DRAWER (§115 — `score/public/sequence_ui.js`: a `Sequence` button beside `Strikes`, a strip UNDER the strikes drawer, boxes of take · seconds · dyn, Hear through the strikes drawer’s own player, Insert as one group + one META bar + the recipe into `databases.sequences`; `strike_drawer.js` unchanged; verified in the running app with no MIDI) — BUILT AND UNHEARD; AND 1d.3, THE ROUND TRIP (§116 — `sequences in this score` lists `databases.sequences`, pick one and the recipe is back in the row; a placed sequence is RE-INSERTED IN PLACE from where its META bar sits now, the status counting what was changed by hand; `move to playhead` apart). AND 1d.4, THE ROLL (§117 — piece #5’s `time_containers.js`, unchanged, lays out the row from a `roll` line of its own dials plus `tilt`; an empty box is a REST, `chord: null`, which the generator needed no new machinery for; the recipe keeps the dials; a roll over chords KEEPS them by position — the AI changed the plan there, his to reverse). **HIS TESTS of 1d.2 · 1d.3 · 1d.4 PASSED** (2026-09-19, his word: *"tests all good"*). AND 1d.5, THE BREATH DIALS (§118, SEQUENCE_TOOL §12 — a `breath` line: `together` from never to always with BLANK = free, the morph's way · `apart` · a pool of `lengths` · `re-breathe`; the shortest breath leads; untouched dials give 1d.1's notes, gated by `tools/sequence_baseline.json`; `sequence_check` 88). **HIS TEST of 1d.5 PASSED**; `count` on the roll line and a PREVIEW on every box added at his word (§119–§120). **AND 1d.7, THE WAVES, IS BUILT (§128, SEQUENCE_TOOL §13; `sequence_check` 107; niente option A — between two WRITTEN dynamics) — — HIS TEST OUTSTANDING. **A seventh bug of the 1b kind, found on the way (§128–§130): the fader curve that SHAPES A HELD NOTE (D13) was measured for all seven pitched instruments in 0d and this morning's `tools/build_remap_card.js` wrote only the vibraphone's into the bank, so every DRAWN dynamic played flat on the other six; the builder now writes all seven (UVI on 40·log10, Kontakt on 60·log10), the rest of the bank byte-identical — every drawn note in the six scores now follows its height.** **AND 1d.8, THE EDGES, IS BUILT (§131, SEQUENCE_TOOL §14; `sequence_check` 126 — `enter [attack | seamless]` on every box, box 1's being how the sequence BEGINS · `edges`: fade in / fade out from and to niente or a dynamic · `exit` together or one by one, the fade following the shape · one opt-in in `morph.js`, `fadeWeight` takes `to`, done without asking, his to reverse) — HIS TEST OUTSTANDING. Only 1d.6, his listen, is left in PLAN 1d.** Was next: **1d.8, THE EDGES** (written into the plan at his word, §123, LG-40 · LG-41: attack or seamless PER BOX · fade in / fade out · `exit`), then his listen (on Fable, his call). The transitions talk is CLOSED (§124–§125, LG-42): a sequence is joined to a morph BY HAND, no linkage is built; the ENDING gets four shapes in 1d.8 (fade out or just end × at different times or together). Still his, behind it: the listen in the strikes drawer and the six scores — nothing since §75 has been heard.**

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

- **ANY WORK ON THE SOUND PATH — READ THIS FIRST:** `docs/DYNAMICS_LAW.md` — the two kinds of
  note (a STRUCK note: the velocity IS the dynamic · a SHAPED note: struck at mf, the fader
  normalized 0 → 127), moving CC7 on the curve channels only, and the cached map that must be
  dropped. His reason, 2026-09-20: *"There's some fundamental misunderstanding or AI forgets
  what we established before."*
- **What now / what next:** `docs/PLANNER.md` — the **NOW ►** line, then the outline
- **Living plan:** `docs/PLAN.md` — stable IDs; rules in its header
- **Session state, decisions:** `docs/PROJECT_JOURNAL.md` — §2 Resume Here first
- **The lab journal:** `docs/RUNNING_LOG.md` — append-only, written as the work happens
- **The sketch pad:** `docs/COMPOSITION_NOTES.md` — the composer's musical ideas, verbatim
  (opens with LG-1 … LG-8, the Lake George notes he made while writing piece #5)
- **Building a plan item / analyzing an issue for the plan:** `docs/PLANNING_METHOD.md` — three phases, fixed formats
- **The settings that live only in his plugins** (hand-set, nothing can rebuild them, how to
  revert each): `docs/RACK_SETTINGS.md`
- **Notating a just-intoned note** (DECIDED 2026-09-19, nothing built — accidental · cents · partial for everyone, the valve
  combination or the string where the instrument has one): `docs/research/just_partials_notation.md` — **read it before notating**
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
**EXTENDED TO THE COMPOSING ITSELF (composer, 2026-09-18, at the start of phase 1):** *"could you remember to take
journal notes during the comp process and remind somehow future agents to do the same, lab notes so if I want to come back
and write a paper on how I wrote this piece."* The lab journal does not pause when the building stops and the WRITING
starts. Every compositional exchange that settles something goes into `RUNNING_LOG.md` as it happens — the material chosen
and why, what was tried and rejected, what he heard, the numbers behind a harmonic or rhythmic decision, the theory or the
reference behind a move. His musical ideas still go to `COMPOSITION_NOTES.md` verbatim; the RUNNING_LOG is where the
REASONING and the process live. **The test: could someone write the paper "how this piece was written" from the log alone?**
Future agents: this is not optional and he will not ask for it.

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

**REFINED by him, 2026-09-18 (guidelines, not hard rules — his user-level CLAUDE.md, "The shape of a working reply"):**
*"the next model clear dialog is good, but lets keep that more focused and local, only when we are moving on to something
that needs a model change or clear"* — and *"no more things left to do, or left pending or even whats next unless I
specifically ask."* So **in the CHAT:** model / clear advice only at a real switch point, one or two lines; no next-steps
list unless he asks; replies are a goal heading, a short ✓ trail, the one thing in hand with a brief why per step, and ONE
compact notes section at the bottom for the honest side-matter. **And (2026-09-18, after the key-mapping sweeps):**
*"avoid unnessary extra work unless asked for, so like verifications and such unless we write these into a plan as necessary
verifications and qc"* — no probe, no cross-check, no QC pass that he did not ask for or that the plan does not name as a
required step; if something looks worth checking, ONE line offering it, and he decides. This does not relax
`AI_METHODOLOGY`'s rule that a confidence CLAIM must be verified in the running app — unverified simply means unclaimed.
**In the DOCS nothing changes:** journal §2's NEXT STEPS ·
MODEL · CLEAR table is still kept current — it is the handoff, and it is what makes the chat free to stay on one thing.
The paragraph below is the 2026-08-23 original; read it through this.

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
- **Ports** (loopMIDI, case-sensitive) are prefixed `LG` — `LGEngHorn` · `LGBassoon` · `LGBassoonb` · `LGHorn` ·
  `LGHornb` · `LGTrumpet` · `LGTrumpetb` · `LGPerc` · `LGCello` · `LGBass` — ten, all verified 2026-09-17. The `b`
  ports carry each SI2 instrument's second UVI instance (D9).
  The prefix is not cosmetic: loopMIDI ports are machine-global and piece #5's rack is still
  live, so a bare `Vc` would be ITS cello.

⚠ **Standing warnings, inherited and still true:** `export_print` and `export_video` share
`Coords.ensembleFrame` — **a change to the frame math moves BOTH** · the AI never holds his
port and never saves from its own browser pane (principle 9) · the in-app browser has no Web
MIDI, so every MIDI path is verified on his Chrome.

**Checks this piece owns:** `node tools/check_ceilings.js --all` (no note longer than its instrument's ceiling, all five scores) · `node tools/model_bank.js --validate` (the model↔actual store) · `node tools/palette_check.js` (**184** — tracks vs recipes, ports, every
per-instrument table in the app, the percussion selection applied) · `node tools/test_written_pitch.js` (**10** + a control) · `node tools/spectrum_check.js` (**35** — the harmonic series arithmetic behind the strikes drawer's HARMONIC SERIES banner, PLAN 1c.4) · `node tools/sequence_check.js` (**180** — the sequence generator on the six reference chords: both change rules, the dynamic carry, the ceilings, one seed, the refusals, a REST under both rules, THE GATE against `tools/sequence_baseline.json`, the breath dials, the waves, the edges and the change rule per box; PLAN 1d.1 · 1d.4 · 1d.5 · 1d.7 · 1d.8) · `node tools/dyn_table_check.js` (**51** — THE DYNAMICS TABLE: every curve reaches `ppp`, `fff` = 127, monotone, and each CC7 read BACK through the same curve lands its eight names 4 dB apart on every instrument; PLAN 1d.10). `node tools/test_snapshots.js` (**26** — `score/snapshots.js`: the merge rules and the TWO-STORE whitelist, PLAN 1d.11). Run the first three
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
