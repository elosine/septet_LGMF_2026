# RUNNING LOG — the lab journal

> **Why this exists** (composer, 2026-09-03, said at the opening of piece #5 and standing
> since): *"I'd like to keep a running journal like lab notes, so I can look back on
> decisions or comments, theory, philosophy, etcetera, or how we actually made something —
> if I wanted to write a paper later about this. And I would expect the AI agent to do this
> automatically as a habit."*
>
> Rules (from `live-electronics-engine`, piece #5's D4, carried here): written **as the work
> happens**, at the end of any exchange that produced a decision, a result, a rejection, a
> measurement, or a theoretical point — never at session end. Each entry: what prompted
> it, in the composer's words; what was tried, in order; the numbers; what was rejected
> and why; what was decided and why that rather than the alternative. **Append-only;
> corrections are new entries.** Entries are numbered §N and never renumbered.
> Current state lives in `PROJECT_JOURNAL.md` §2 and `PLAN.md`; this is the trail.
>
> **A `§N` in this file is THIS piece's.** The Tempus septet's lab journal
> (`septet_2026/docs/RUNNING_LOG.md`, §1–§619) is cited as `#5 §N`.

---

# 2026-09-17 — session 1 (Claude Code / Fable 5.1)

## §1. The project opens

The composer, dictated, the first message in the new repo (`septet_LGMF_2026`, one commit:
README + LICENSE):

> *"Lake George Music Festival Septet. I want to start a new piece. I just finished the
> Tempus Septet, and this was ported from the tuba piece. So we did the port recently. This
> was a few weeks ago. So look in that folder and see if there's any notes about how the
> port was made. And then let's prep, to begin the Lake George composition."*

The same day piece #5's submission was completed (#5 journal §2, session 15: the print
score approved, 71 pages A3; the application compiled). So this piece opens on the day the
last one closed, exactly as #5 opened on the day the tuba piece's last commit landed.

The session ran under the user-level `/session-start` skill. The repo had no journal, so the
skill's bootstrap applied: a skeleton `docs/PROJECT_JOURNAL.md` was written first, before
any work, and filled with what the reading found.

## §2. The record of the last port — found, and where

Method: a grep for `port|ported|porting` over #5's markdown (289 hits in 19 files), then the
earliest 40 of #5's 610 commits, then targeted reads — no code opened.

The record is complete and is in three places in `septet_2026`:

| where | what it holds |
|---|---|
| `docs/RUNNING_LOG.md` §1–§13 | the port as it happened — §2 the coupling survey (the tuba-mention count per file: the palette was the whole coupling) · §3 the composer's plan in his own words · §4 the three seeding methods and why two were rejected · §7 the kit · **§9 PLAN 0b** (byte-exact copy → one patch script asserting every match count → verified in the running app: 36/36 routes, a save round trip, zero console errors; **two defects only RUNNING found** — a literal eleven-lane table, the server dying on a missing-file stream) · §10 the day-one stub · **§12 PLAN 0g** (97 notation files byte-exact, 11 batteries green) · §13 PLAN 0i |
| `docs/PROJECT_JOURNAL.md` | §1 "Map of piece #4 — what the port inherits" · §4 D1 (method) · D2 (format) · D3 (phases) · D5 (ports) · D9 (the IR contract) |
| `docs/PLAN.md` § 0 | the item list 0a–0k, each with its why |

Both halves of that port — the composer module (0b) and the notation/IR stack (0g) — were
done and verified on its first day, 2026-09-03.

**One lesson the record states about itself** (#5 CLAUDE.md § THE RHYTHM): the copy-forward
from #4 dropped a standing rule from CLAUDE.md, *"so it loaded in no septet session and the
advice came only sometimes"* — his verdict a week later: *"This was happening for a while,
but then is inconsistent."* The consequence for this port: the standing practices are
carried WHOLE, from the first commit (§6).

## §3. The Lake George notes, surfaced from the Tempus sketch pad

The composer: *"Can you surface my Lake George notes from the Tempest? The instrumentation
should be there."* ("Tempest" = Tempus, speech-to-text.)

A case-insensitive grep for `Lake George|LGMF` over `septet_2026` (node_modules excluded):
eight notes of his in `COMPOSITION_NOTES.md`, dated 2026-09-04 → 2026-09-14, one of them
doubled in `MORPH_NOTES.md` §3; plus the parking-lot line in #5's journal §7 and **#5's D31**
(a technique used across pieces is built standalone from the first line — `time_containers.js`
— *because* "the next piece (Lake George) will want it").

All eight were copied VERBATIM, with their source line numbers, into this repo's
`docs/COMPOSITION_NOTES.md` as **LG-1 … LG-8**. The long AI readings stayed in the source;
one line each was kept.

The instrumentation was the first of them (2026-09-04): *"pairs, eng horn/bassoon,
horn/trumpet, cello/bass + percussion. start with morph section"*.

**Noticed while copying, put to him, not resolved:** LG-2 (09-04) says *"continuous, not
sparce"*; LG-4, LG-5 and LG-8 (09-06, 09-14) say *"lots of rests … sparse pointillistic"*,
*"Sparse figures"*. Both are his words. The rondo of LG-6 may hold both (a continuous
refrain, sparse episodes) — or the later thought replaced the earlier. His to say; filed in
PLANNER's open musical questions. Likewise LG-1 *"start with morph section"* against LG-6
*"a bespoke section beginning, then a morph."*

## §4. The composer's answers — D1, D2, and the call parked

Four questions had been put: the instrumentation · the call · the delivery format · the port
source and method. His reply, typed:

> *"LGMF 2026 call but don't need to look it up now, lets focus on getting started; same
> format as others 4? I think so but not sure what copy-forward method is? yes the
> instrumentation correct"*

Read as: Q2 — the LGMF 2026 call, **not to be looked up now**. Q3 — same format as the
others. Q4 — *"I think so but not sure what copy-forward method is?"* Q1 — confirmed.
*(The "4?" is read as the question number, not as "the other four pieces". If that reading
is wrong, D2's wording changes, not its content.)*

- **D1** — the instrumentation: three pairs plus percussion. The percussion instruments are
  not named.
- **D2** — the delivery format of pieces #4 and #5.
- **The call is parked at his word.** Consequence, stated once so it does not surprise
  later: the plan's timeline table is blank. Deadline, duration cap and page format bound
  everything in #5 (12:00, A3, 2026-10-15); here they are unknown until the call is read.
  Nothing in phase 0 depends on them.

## §5. Copy-forward explained, and chosen — D3

He asked what the method is. The answer given, in full:

- **Copy over, exactly as they are:** the composer score app · the sandbox · the notation/IR
  stack · the print and video tools · the working-method docs.
- **Leave behind everything that is the Tempus PIECE:** its scores and passage banks · its
  lab journal · its 610 commits of history.
- **One change:** the instrument list is rewritten — seven new tracks.
- **Then prove it:** run the app; every panel opens; a save round-trips.
- **The alternative, rejected last time:** clone the whole repo and delete what is not
  needed — the old piece's history and research would sit in the way of every session
  (#5 D1: "857 commits of tuba research in every cold session's way").

His reply: *"yes go with copy-forward, start the PM kit"* → **D3.**

Not re-opened, and recorded so it is not lost: #5's D1 also rejected *extracting a shared
engine package* — "right shape, wrong six weeks — after the septet." This is after the
septet. It was not raised today because he asked to get started, and copy-forward does not
close that door; it is a question for a quiet day, not for phase 0.

## §6. PLAN 0a — the kit installed; what was carried, what changed, what was not done

**Carried WHOLE from #5, one provenance line prepended, nothing else touched:**
`AI_METHODOLOGY.md` · `SESSION_HYGIENE.md` · `PLANNING_METHOD.md` (*"the canonical text,
copied forward to each new piece"*) · **`MORPH_NOTES.md`** (1127 lines — he started it
2026-09-06 *"for this piece and the next piece"*; this is the next piece, and its form is a
rondo whose refrain is a morph) · `.gitignore` · `.gitattributes`.

**Carried with named changes:** `HOW_WE_WORK.md` (the Pushes paragraph) ·
`SESSION_PROTOCOL.md` (Session End step 6: the push line; `unsaved_check` waits for 0b) ·
`.claude/commands/checkpoint.md` (the push line) · `postclear.md` (the provenance line only —
his check-in rule of 2026-09-11 is in it, untouched).

**Written fresh:** `CLAUDE.md` · `README.md` · `PROJECT_JOURNAL.md` (rebuilt in #5's seven
sections; §3 carries #5's eighteen principles, one line each) · `PLAN.md` · `PLANNER.md` ·
this file · `NITS.md` · `COMPOSITION_NOTES.md` (§3).

**The standing practices in CLAUDE.md, checked against #5's CLAUDE.md heading by heading:**
the lab journal · the sketch pad · the morph notes · THE RHYTHM with all five Fable-credit
rules · orient from docs · the postclear check-in rule · reference repos · git. All present.

**D4 — ports 5400 (score) / 4900 (sandbox).** By the lineage's own rule (#3 5100/4600 ·
#4 5200/4700 · #5 5300/4800; #5 D5). The reason is live, not ceremonial: #5's performance
score (its PLAN 3, N6) is still to be built, so both repos' servers will run together.
Made by the AI on precedent, not asked — minutiae (AI_METHODOLOGY).

**The plan's shape.** Phase-0 IDs mirror #5's (0a–0i) so its record reads as the precedent
item by item. Per PLANNING_METHOD, no item was given sub-steps he has not discussed: each
carries *"to be laid out when we discuss it"* plus what is already KNOWN to differ from
last time (0b: the lane count does not change, the palette does, and #5 added tools #4
never had — each a carry / leave decision; 0g: #5's engine already does seven parts, several
clefs, A3 and video).

**Deliberately NOT done:**
- **No code copied.** 0b waits for its plan and his go — as #5's did.
- **The call not read** — his word.
- **No push policy assumed.** #4 (D30) and #5 (D8) pushed after every commit at his word.
  That word was given per repo, and pushing is outward-facing, so it is asked here (Q5)
  rather than inherited; the inherited *"push now?"* text is in force until he answers.
- **Nothing committed yet** — asked together with Q5.
- **`.claude/launch.json` not carried** — it names servers that do not exist here until 0b.
- **#5's tool docs not carried** (`STRIKES_TOOL`, `TRILLS_TOOL`, `BEATING_TOOL`, `CRESCENDO`,
  `NAMING`, `RENDER`, `REAPER_CONTROL`, `SAMPLER_QUIRKS`, the `NOTATION_*` set) — a doc that
  describes code travels with the code, at 0b / 0g. `MORPH_NOTES` is the one exception,
  because it is a standing PRACTICE, not a description.

## §7. Flags raised, none resolved

1. **The call is unread**, so no deadline binds the plan yet (§4).
2. **Six of seven instruments are new to the stack.** Only the cello's recipe carries from
   #5. Horn, trumpet and bassoon are probably in IRCAM Solo Instruments 2 and the english
   horn probably is not — **from memory, NOT verified**; the extracted manuals are in piece
   #3's repo, which is not attached to this project. Percussion is mapped in piece #2.
3. **The percussion instruments are unnamed.** They decide a recipe, a rack track, and —
   in phase 2 — what a percussion part looks like in an engine that has only drawn pitched
   staves.
4. **Transposing instruments** (english horn, horn, possibly trumpet; the double bass at
   the octave). Whether #5's engine already carries written pitch per part (its bass
   clarinet needed it) is a question for 0g — not checked today.
5. **Two live repos.** #5 has uncommitted files that are the composer's own (his scores,
   his rack, his passage bank) and work still ahead (PLAN 3). Nothing there is touched from
   here; the port READS it.
6. **The sparse / continuous question and the opening** (§3) — musical, his, not urgent.

## §8. Git — D5: push after every commit

Put to him as two lettered options: (a) the Tempus rule — commit the kit now, push, and push
after every commit from here on; (b) commit at each wrap but ask "push now?" each time. The
AI recommended (a): his established rule in two pieces, and it keeps the record off this
machine. His reply: *"a"* → **D5.** The four places that carried the "pending" wording were
rewritten to cite D5 (CLAUDE.md § Git · HOW_WE_WORK § Pushes · SESSION_PROTOCOL step 6 ·
`.claude/commands/checkpoint.md` step 3). Then the kit was committed — explicit paths — and
pushed: the first commit of this piece after the repo's own "Initial commit".

## §9. Piece #3's repo attached; flag 2 of §7 answered from the manuals

He asked: *"how to attach bcl/harp repo?"* Answer: the AI requests the folder and he approves
the prompt — done in the same turn. `C:\Users\jwloy\GitHub\for_bass_clarinet_harp_and_accordion`
is now an additional working directory of this session. *(A folder granted this way belongs
to the session; if a later session does not list it, it is requested again the same way.)*

With the manuals in reach, §7's flag 2 — written "from memory, NOT verified" — was checked
at once, one grep each, in `docs/manuals/extracted/`:

| instrument | IRCAM Solo Instruments 2 (manual, instrument list ll. 1423–1457) | Xsample (`Xsample_Library_en.txt`) |
|---|---|---|
| english horn | **not in SI2** (OBOE and OBOE WITH MUTE only) | **listed** — l. 149; range line l. 752 |
| bassoon | **BASSOON** · BASSOON WITH MUTE | not checked |
| horn | **FRENCH HORN in F** · WITH MUTE | not checked |
| trumpet | **TRUMPET in C** · cup · harmon · straight · wawa mutes | not checked |
| double bass | **CONTRABASS** · WITH MUTE | not checked |
| cello | VIOLONCELLO (+ mutes) — but #5's recipe is the Xsample cello (#5 D7) | carried from #5 |

So the memory was right on all five, and it is now on record from the source. **What this
does NOT settle:** a catalog line is not ownership (the same caution #5 recorded about the
Xsample piccolo) — whether the Xsample english horn is installed is his to say; and whether
the double bass follows the cello into Xsample Contemporary Solo Strings (one string model
for the pair) or goes to SI2's contrabass is a PLAN 0c decision, not today's. SI2 is the
library the tuba piece was written on, so its brass behaviour (channel-per-technique,
keyswitched presets, CC7 → dB measured) is already mapped in #4.
