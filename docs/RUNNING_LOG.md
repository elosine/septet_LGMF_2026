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

## §10. The port planned — a measured survey of piece #5, and what it changed

**Prompted by:** the AI had proposed laying 0b out by PLANNING_METHOD, one step at a time.
The composer:

> *"no need for formal planning protocol, it sounds like things are clear from last port,
> just make careful plan, write it through independantly, let me know when time to switch
> model and build with opus, and check in with topline plan"*

So the method was set aside for this item, at his word; the plan was written alone and the
top line put to him. Result: **`docs/plans/PORT_FROM_TEMPUS.md`** — eight steps, written to
be executed cold by Opus.

**The survey** (read-only on `septet_2026` @ `ba318e1`; `git ls-files`, sizes, greps — about
ten commands, no whole-file reads of code):

| what | number |
|---|---|
| tracked files | 460 |
| by folder (files · MB) | score 55 · 2.6 — sandbox 3 · 0.1 — tools 114 · 1.4 — notation 55 · 6.7 (5.4 of it ONE IR page) — print 10 · 0.1 — probes 35 · 1.1 — reaper 13 · 13.6 (the rack) — bank 45 · 9.4 — scores 47 · 14.7 — midi 29 · 0.3 — docs 43 · 3.2 |
| engine vs piece data | ≈ 12 MB vs ≈ 38 MB |
| `composer.html` | 1 015 KB (810 KB when #5 took it from #4) |
| modules in `score/public` | 53 — #4's panels plus #5's: strike drawer / sounds / chords, beating calc / panel, cresc ×6, fill ×3, harm source ×2, note card, cue picker, piano cues, piano harmonics, passages, containers, time containers, trill engine, velocity remap, accel calc, chord run, sounding, spacing, swell |
| source files naming an instrument | about 70; 124 name none |

**The finding that shaped the plan.** #5's own survey of #4 concluded *"the engine is
instrument-agnostic by construction; the palette is the whole coupling"* — the tubas were
interchangeable, so nothing in the code needed to know one from another. **That is no longer
true of the source.** Piece #5 had seven DIFFERENT instruments and built tools that know
them. The instrument mentions, split code from comment, fall into three kinds:

- **A — the palette proper.** `sandbox/instruments.js` 123 · `composer.html` 144 (TRACKS, lane
  labels, the select, curve-button titles, an abbreviation map; most of the rest is piece
  #2's legacy piano-keyboard tool, inert since #4) · `notation/registry/ensemble.json` ·
  four port sites.
- **B — small keyed tables inside #5's tools:** open strings · the default strike technique
  per instrument (twice) · an articulation map · the beating tool's player order and its
  breath / bow lengths · three copies of an instrument-colour table · a trill stand-in ·
  an alias table. About a dozen sites, each a one-line object literal.
- **C — the piano as a ROLE.** Twelve modules ask `TRACKS.findIndex(t => t.instKey ===
  'piano')`: the piano is the struck voice — it takes the strikes the ensemble cannot, it
  strikes at the end of a crescendo, it cannot swell, it gets harmonics at a morph's
  re-breaths and the articulation lines. **Lake George has no piano.** Most of these sites
  already handle −1 (`'no piano lane in TRACKS'` is a status line in `morph_panel.js`), but
  that is a claim from reading, and the plan treats it as one: each is exercised in the
  running app (step 5).

The measurement banks are keyed by instrument (`balance` · `technique_ranges` ·
`velocity_remap.instruments` …) — so the cello's rows can be carried and the rest dropped,
file by file. The notation engine takes its instruments from ONE file,
`notation/registry/ensemble.json` — *"the engine knows clefs, transpositions and staves, not
flutes"* (its own `_doc`) — and already carries written pitch per part (the bass clarinet,
`transpose: 14`). That is the work of #5's PLAN 2a, and this piece inherits it whole.

**Decisions (the plan's P1–P7), and what was rejected:**

- **P1 — carry ALL of #5's tools.** *Rejected:* a carry / leave pass per tool, which is what
  the AI had proposed to him an hour earlier as "the one real question inside 0b." The survey
  answered it: the tools are 1.4 MB, `composer.html` loads them by `<script src>`, a missing
  one is a 404 and a broken page, and his rule is *"not leave out things now that might bite
  later."* The strikes drawer is LG-7's named model; the beating panel and the morph are the
  refrain; `time_containers.js` was built FOR this piece (#5 D31).
- **P2 — the piano-role features go quiet; they are not cut out.** *Rejected:* removing
  them (a fragile edit across twelve modules, and it forecloses a choice that is his) ·
  renaming the role to percussion now (a musical decision dressed as a port step). The
  question went to PLANNER instead: who, if anyone, inherits the struck role?
- **P3 — lane order = score order** (#5 D10): EH · Bsn · Hn · Tpt · Perc · Vc · Db — which
  also keeps his three pairs adjacent, percussion between the brass and the strings.
- **P4 — the percussionist is ONE lane,** instrument-in-hand as a technique (#5 D6).
- **P5 — placeholder recipes; nothing sounds until 0c / 0e.** The cello verbatim.
- **P6 — names** `lgmf` · `piece-lgmf` · `lgmf_rack`. **P7 —** `layoutVersion` 6 and a warn
  keyed to the track IDS, because a #5 save has seven lanes too and the lane count — what
  #5's warn tested — cannot tell them apart.

**The one structural addition over #5's method: prove the copy whole BEFORE the re-palette
(step 2).** #5 copied, patched, then verified — so a red test could be the copy or the
patch. Here the byte-exact copy is committed first with Tempus's palette intact, its data
staged (never committed), the app booted on 5400 by environment, every battery run; a RED is
re-run in the source read-only, as #5 §12 did for `test_extract_played`. Then the re-palette
is its own commit, and its diff IS the port. Cost: one staging pass. Gain: every later red
has one possible cause.

**Also one copy, not two.** #5 ported the composer module (0b) and the notation stack (0g)
separately because his question that day was whether notation was needed at all before
composing. It is one integrated stack now (the server serves `/notation/`, Save feeds the
IR); so the files arrive together in step 1, and 0g is what remains: the ensemble registry,
the batteries classified, the exporters run. The IDs 0b / 0g / 0i are kept so #5's record
still reads as the precedent.

**Not checked, said so in the plan:** the transposition sign convention (the plan's table
assumes positive = written above sounding, from the bass clarinet's note; step 6 checks it
before trusting it) · whether every kind-C site really handles −1 · whether a Tempus take in
`panel_snapshots.json` loads against a new palette (step 4 tries one per panel and has a
fallback either way).

## §11. The libraries — D6; and Reaper: not in the build, right after it

The top line was put to him. His reply did not comment on it; it answered the open library
questions instead:

> *"english horn, getting now, use xsample double bass, the same percussion lib as
> 2piano2perc; I need to acquire a bowed vibraphone library; and are we setting up reaper
> in this build or later"*

**D6, and what was looked up to make it exact** (two targeted reads, nothing else):

- *"the same percussion lib as 2piano2perc"* → piece #2's journal, decision 4 (2026-03-26):
  **Spitfire Abbey Road Orchestra (ARO) Percussion** — three volumes (Metal 58 instruments ·
  High 62 · Low 20), *"built-in extended techniques (bowed, scraped, superball) … no Kontakt
  dependency"* — Spitfire's own plugin. **No tuned mallets in any of the three** — which is
  why the vibraphone needs another library. #2's `docs/instrument_map.json` holds the maps.
  Which volumes were bought is not recorded there in a line the grep found → 0c.
- *"I need to acquire a bowed vibraphone library"* → one grep of the Xsample catalog he
  already has in piece #3's manuals (`Xsample_Library_en.txt` ll. 250–253): *"Vibraphone —
  240 Samples — Standard mallets, xylophone mallets, triangle mallets, harmonics, bowed
  (with double bass bow)"*; the marimba and the crotales are listed bowed too. Offered to him
  as a LEAD only: same maker as the english horn and the bass he is getting, the same
  controller model the stack already speaks (CC0 presets, MW dynamics). Not heard, not
  compared — a catalog line.
- The double bass to Xsample: his word. The AI's reading of why it is right is in D6 (one
  string model for the pair); SI2's CONTRABASS is the road not taken.
- The english horn: *"getting now"* — he did not say which library. Not assumed.

**Reaper — his question, the answer given: later, as the very next step.** Reasons, as put
to him: (1) the port is unattended code work for Opus; the rack needs HIM at the machine —
in #5 it was thirteen hand-steps (R1–R13: the loopMIDI ports, a track per instrument, the
presets read from his screenshots); (2) a rack track is tested by playing it FROM the app,
so the app must exist first; (3) two of the libraries are not on the machine yet. So 0c (the
recipes) and 0e (the rack) are one sitting, straight after the build — and it can start with
the five instruments whose libraries are installed and take the english horn and the
vibraphone as they arrive. The port plan's step 4 now names each library in its placeholder,
and its "does not do" section says NO REAPER in so many words.

**The bowed vibraphone went to the sketch pad as LG-9** — the first percussion instrument he
has named, and a SUSTAINING one: that bears on the planner's open question (who inherits the
piano's struck role?) — perhaps nobody.

---

# 2026-09-17 — session 1 continued, the build (Claude Code / Opus 5)

**His go:** *"no clear go for build"* — read as: no clear, go for the build. The model was
switched to Opus 5 in place, and the port plan executed with the whole conversation still in
context, so the cold-execution path (`/clear` → `/postclear` → the `Resume reads:` list)
was never needed. The plan is followed step for step regardless; it is the record.

## §12. PORT step 1 — the engine copied, 265 / 265 byte-identical

**The guard, first** (the plan's opening instruction): `git -C septet_2026 status --short`.
Modified: `bank/panel_snapshots.json` · `reaper/septet_rack.rpp` · `scores/piece-septet.json`
— **exactly the three the plan named as known-modified and HIS**, unchanged since #5's
journal §2 recorded them. Untracked: his passage bank, his scores, his application files —
none of them on the copy list. Nothing to stop for.

**The list** — built with `git ls-files` so no loose or ignored file could come along, then
every entry checked tracked before anything was copied: **265 paths, 7 MB.** By area:
score 55 · tools 108 · notation 43 · probes 22 · bank 15 · reaper 11 · sandbox 3 · print 3 ·
`.claude/launch.json` · `docs/instrument_map.json` · `package.json` · `package-lock.json` ·
`start_score_server.bat`.

**The copy:** one `tar` pipe from the source's working tree, then **`cmp` on every file
against its source — 265 identical, 0 differ.**

**The one file taken from HEAD instead of the working tree:** `bank/panel_snapshots.json`
(his takes of 2026-09-17 are uncommitted there, and they are his). Copied with
`git show HEAD:bank/panel_snapshots.json` and `cmp`-ed against that blob — identical.
So this repo starts from #5's last COMMITTED takes, and his uncommitted ones stay his.

**Left behind by name, as planned:** all of `scores/` · `midi/` · `bank/actuals/` ·
`bank/scattered_strikes.json` (the piano's recorded strikes) · `bank/passages/*.json` · the
seven instrument-measurement banks (staged in step 2, skeletoned in step 4) ·
`probes/*_schedule.json` + `ping_ch*.json` (generated from #5's recipe — 7 000+ instrument
mentions between them) · `reaper/septet_rack.rpp` + `place_piece-septet_midi.lua` ·
`notation/ir/*` · `notation/video/` · the cover SVGs and `print/score/approved/` ·
`tools/oneoff/` + the four Bloom-demo tools + `morph_tuba_baseline.json` ·
`docs/notation_instructions/` · `docs/plans/` · `docs/images/` · the Tempus call PDF and
his application. That is the ≈ 38 MB of piece data the survey measured.

`npm install` → 3 packages, 0 vulnerabilities (resvg 2.6.2 + the optional pngjs).

**Note for step 3, written down so it is not forgotten:** `.claude/launch.json` came across
byte-exact and its `score` entry declares **5300** with a relative `score/server.js` — so
starting it from this repo before the re-palette would bind HIS port with THIS repo's
server. It is inert unless invoked; nothing invokes it, and step 2 boots the server by
environment (`PORT=5400`) instead. Principle 9.

## §13. PORT step 2 — the copy proven whole BEFORE anything changed

This is the step this port added over #5's method (§10): with Tempus's palette still in
place, everything that can be run is run, so that any red AFTER the re-palette has exactly
one possible cause. **151 files staged, never committed, all 151 deleted at the end** — the
list was written to the scratchpad before the first one was copied, and the deletion used
that list, not a pattern. Staged: #5's own data (125 — the measurement banks, the actuals,
the recorded strikes, its scores, its IR pages, its probe schedules) taken from **HEAD**, not
the working tree, so his uncommitted saves were never read; and from piece #4 the 17 tuba
golden pages + 9 tuba scores its batteries name (the recipe in #5's `notation/ir/README.md`).

**The server:** `PORT=5400 node score/server.js` — booted first time. **41 of 41 routes 200**
(the page, every panel script, the banks, the probes, `/notation/*`, `/docs/*`, every
`/api/*` the server declares). **His 5300 was never bound** — checked, nothing listening;
the environment variable was used exactly so the inherited `launch.json` could stay untouched
until step 3 (principle 9).

**The batteries — 22 green, 8 red, and every red accounted for:**

| battery | result | reading |
|---|---|---|
| test_render · test_layout · test_animobj · test_splice · test_graphic · test_stamps | GREEN | census, clipping, staff math, A3 census, beaming, parachute, snapshots stable |
| test_pattern_fit | GREEN (85) | |
| ir_validate_battery | GREEN (36: 30 red + 6 green cases) | |
| **test_septet_notation** | **GREEN (101)** | clefs · written pitch · grand staff · D10 groups · chord columns — **the whole of #5's PLAN 2a, working in this repo** |
| **test_morph_notation** | **GREEN (178)** | |
| test_trills | GREEN (92) | |
| test_cross_staff 79 · test_surge_run 30 · test_step_dynamics 13 · test_identity | GREEN | |
| morph_septet_check | GREEN after a fix — see below | |
| trill_conflicts --list | GREEN (the 3 accepted conflicts, as in #5) | |
| check_cresc_panel · check_fill · check_containers · check_cresc_deck | GREEN | |
| accel_calc_check · beating_calc_check · harm_source_check · strike_chords_check · piano_cues_check · piano_harmonics_check | GREEN | the pure math |
| test_coords | RED | **RED in the source too, identically** (`px boundary: layout.js is pixel-free`) — re-run there read-only. The source's, not the copy's → NITS |
| cresc_check | RED (2) | **RED in the source too, identically.** Its two "FAIL" lines are prose describing behaviour #5 accepted; the check reports them as failures → NITS |
| test_extract_played | RED | snapshot drift — #5 recorded this red at its own 0g, and red in #4 itself → NITS |
| test_playability | RED | ENOENT `docs/SI2_staccato_lengths.md`, the tuba doc — #5 recorded the same; this piece's tables come at 0c / 0d |
| test_midiplayer · test_sonify_core | RED | a tuba score's lanes resolve to recipe keys #5's `instruments.js` does not carry (`r.port` null) — #5 recorded exactly this |
| ir_extract_golden | RED (19 differences) | **NEW, and explained:** the golden `trance-bar-01` is #4's, frozen 2026-09-03; `notation/lib/extract_core.js` is NOT the same file in #4 and #5 (md5 `203ae308` vs `23415181`). #5's extractor moved on for two weeks. Green at #5's 0g because the file was then byte-identical to #4's |
| test_notate_block | RED (3 of 65) | **NEW, and explained**, three assertions: two are *"identical to the approved db1"* and *"the layout warnings match exactly (27)"* — `layout.js` also differs between #4 and #5 (`75c68c50` vs `90e0445d`), same cause; the third is *"on cuivre the flag CHANGES an existing bar"* — **`cuivre` is a tuba technique and is not in `bank/sample_lengths.json`**, which is the septet's table (its keys: staccato · pizzicato · tongue_ram · slap · stac_vel · secco · harmonics · bartok_vel · gettato_vel · marcato_stac_vel · spicc_vel). The archived `sample_lengths_tuba_20260810.json` does have it. Data, not code |

**Method note on the two NEW reds.** They could not be re-run in the source for comparison:
#5 deleted its staged tuba goldens after its own 0g, and writing into `septet_2026` to stage
them again is forbidden. So they were settled by a different proof — **the copy is
byte-identical to #5 (cmp, §12), therefore any behaviour difference must come from the
inputs.** Comparing the tools against piece #4, where the goldens live natively, showed
`extract_core.js`, `layout.js` and `classify.js` all differ between #4 and #5 while
`ir_extract_golden.js` and `notate_block.js` are unchanged: the tests are #4's, the engine
under them is #5's, two weeks further on. Nothing points at the copy.

**The one real defect the step found — a file the PLAN told me to leave behind.**
`morph_septet_check.js` died with ENOENT on `tools/morph_tuba_baseline.json`, which step 1's
leave-list had named as a tuba artefact. It is not: 692 bytes of frozen sha1s — *"for each
stock model with its TUBA pitch set … frozen 2026-09-07 before the septet palette went into
the engine"* — the regression baseline that proves the morph engine still renders what it
rendered. **The morph is this piece's refrain (LG-6, LG-8); the baseline is exactly the file
this piece wants.** Copied, `cmp` identical, added to the copy list (266), the check re-run:
**ALL PASS.** Filed as a correction to §12 rather than an edit to it.

*This is what step 2 is for.* A missing test dependency is invisible to `cmp` — the copy was
266/266 faithful to a list that was wrong by one — and after the re-palette it would have
looked like a palette bug.

**Left clean:** all 151 staged files deleted, empty directories pruned, `git status` showing
exactly one addition: `tools/morph_tuba_baseline.json`. **Pruned as empty and needed back in
step 4:** `scores/` · `notation/ir/` · `sandbox/motives/`.


## §14. PORT step 3 — the re-palette: 44 asserted edits, then 19 files of stragglers

**The patch script refused to run, twice — which is the point of it.** It asserts the match
count of every edit before it writes a byte (piece #5's own port script did the same, its
§9). First run: *"REFUSED — 6 of 44 edits did not match. NOTHING WRITTEN."* Five of the six
were multi-line blocks: **the working tree is CRLF** (git checked it out that way, and the
tar copy carried the source's own endings), while the script's blocks were written with `
`.
The sixth was a real miscount — `Violin 2, Viola, Cello` occurs twice, not once. Fixed by
translating each find/replace to the file's own endings (never the file to the script's), and
by correcting the count. Second run: **44 edits, every count matched, 14 files written.**

**Kind A — the palette proper.** `TRACKS` = the seven, in orchestral score order (P3), which
also keeps the composer's three pairs adjacent — double reeds, brass, strings, with the
percussionist between the brass and the strings. The seven lane labels, the track `<select>`,
the three curve-window button titles (each replaced as ONE block: swapping label by label,
Viola→Cello would then be found again by Cello→D. Bass), the abbreviation map
(`eh · bsn · hn · tpt · perc · vc · db`), the title, the session default `septet` → `lgmf`
(5 sites: the input, `sessionName`, `boundName`, three fallbacks), the comments that say which
lane each curve window sits on (a comment that names a lane is a factual claim, not provenance
— those had to move; comments that merely remember #5's instruments stayed).

**P7, the warn — written because the lane COUNT cannot catch it.** #5's save is also seven
lanes + META, so `layoutVersion` alone would let a Tempus score open here silently, every
object one lane off into a different instrument. `restoreData` now compares the save's track
IDS with this piece's and says so loudly. `layoutVersion` 5 → **6**.

**Kind B — the per-instrument tables inside #5's tools**, all seven rewritten:
`OPEN_STRINGS` (cello 36·43·50·57; double bass 28·33·38·43, sounding) · `STRIKE_DEFAULT` in two
files · the `ART_SETS` spiccato / staccato maps · `beating_calc`'s `ORDER` and its breath / bow
ceilings (the four winds breathe, the two strings bow, **percussion has neither and cannot
bend — not a beating partner**, 0c to confirm) · three copies of the instrument-colour table,
now one hue-family per PAIR (double reeds gold · brass blue · strings green · percussion
neutral; the cello keeps #5's exact green) · `trill_engine`'s `STAND_IN` — every instrument
stands in on the CELLO, because the trill-timing db carried from #5 holds violin1 · viola ·
cello and the cello is this piece's only own row · `chord_run`'s alias table.

**The straggler audit, and the rule it needed.** Grepping `5300 · 4800 · septet_rack · 'septet'
· piece-septet` found three classes. Two were coincidence and left alone (`48000` sample rates;
an SVG path in `glyphs.json` containing the digits 5300). The rest split on a rule worth
writing down:

> **A `piece-septet` that is a DEFAULT ARGUMENT or a WRITE GUARD becomes this piece's name —
> it is a parameter. A `piece-septet` that is the FIXTURE a test reads stays, and goes to NITS.**

The guards are why this matters: `cc7_ramp_test`, `cresc_test`, `piano_cues` and
`piano_harmonics` each carry `if (/piece-septet/i.test(name) && !has('--force')) → refusing to
write the piece file`. Left alone they would have guarded **#5's** file name and stood wide
open over this piece's. 19 files rewritten: the four guards, the print checkers' `--ir`
defaults, `build.sh`'s `IR=`, the capture / export / render defaults, the rack file name
(`septet_rack.rpp` → `lgmf_rack.rpp`, 6 sites), and one user-facing error string in
`morph_emit.js` that named the wrong port to unblock.

**Afterwards:** `5300` outside the launch config — **0**. `septet_rack` — **0**. `'septet'` —
**0**. `piece-septet` — only the eight test fixtures and two comments, by the rule above.
Every changed file passes `node --check`.

`.claude/launch.json` rewritten (it was the one config copied byte-exact, and its `score`
entry still declared 5300 against a relative path — §12's note): `score` 5400 · `sandbox` 4900
· `score-5401` for throwaway verification · **`tempus-5300`, which runs piece #5's server from
its own folder**, so his two apps can sit side by side while that piece's performance score is
still to come (D4's reason, now real).


## §15. PORT steps 4 and 5 — the recipes, the skeleton banks, and the app RUNNING on the seven

**Step 4, the recipes.** `sandbox/instruments.js` rebuilt by a script that keeps piece #5's
helper block (`xsStringTechs`, the 88-preset Xsample roster) and the cello's measured rows
**verbatim**, and replaces the header and the table. It refused once, correctly: the first
run dropped the `const MEASURED_RANGES = {` opening line and produced a file that would not
parse — caught by `node --check` before anything was committed, the file restored from HEAD,
the generator fixed, re-run.

| instrument | port | range | techniques | source |
|---|---|---|---|---|
| english_horn | LGEngHorn | 52–81 | 2 | **no library yet** (D6, "getting now") — ord + staccato so the lane is real |
| bassoon | LGBassoon | 34–75 | 19 | SI2, the manual's own roster; Bb1–Eb5, written at actual pitch |
| horn | LGHorn | 35–65 | 20 | SI2; B1–F4, **"to be written a perfect fifth higher"** — the source for step 6's transpose |
| trumpet | LGTrumpet | 54–82 | 21 | SI2 in C; F#3–Bb5, written at actual pitch |
| percussion | LGPerc | 21–108 | 1 | Spitfire ARO + a bowed vibraphone to acquire; ONE placeholder voice |
| cello | LGCello | 36–83 | 88 | **piece #5's entry, verbatim** — with its measurements |
| double_bass | LGBass | 28–67 | 88 | the cello's model (D6): one string mechanism for the pair |

**The port names carry an `LG` prefix, and that is not cosmetic.** loopMIDI ports are
machine-global and piece #5's rack is still on this machine with its PLAN 3 unbuilt. A bare
`Vc` — the obvious name — is the TEMPUS cello's port: the two pieces would have played into
each other the first time both racks were open. `palette_check` now asserts that no port of
this piece is one of #5's.

**What is honest about the cello, and only the cello.** It carries `measured: true` on its
techniques, its measured spans (gettato 36–76 inside a 36–83 zone) and its measured bend
range (0.97 st). The double bass, generated by the same helper, carries **none** of that:
`bendMeasured` false, `bendRangeSt` the provisional 2. Checked explicitly, because the easy
mistake here is to let the pair share a measurement made on one of them. **Its CC#0 preset
numbers are the cello's and are flagged to be verified at 0c** — the Xsample double bass's
own Preset Menu has not been read.

**The technique keys are the notation registry's names** (`notation/registry/techniques.json`)
wherever one exists — `flz` not `flatterzunge`, `vib_vel` not `vibrato`, `trill_m2` / `trill_M2`,
`dur_0_5s` / `dur_1s` — so a key that reaches the IR is already drawable. **The percussion's
voice is `main`, not a new `hit`:** inventing a notation kind for an instrument he has not
chosen would have meant editing the registry (principle 3) to describe nothing. `main` is the
registry's own plain struck voice, as #5's piano used it. 18 roster keys of the brass and the
bassoon (cuivré, stopped, pedal tone, the half-valve gliss …) are NOT in the registry and are
listed by `palette_check` on every run: a roster entry is not yet a notation kind, and they
must be registered before any material uses them (2a).

**Step 4b, the skeleton banks.** Six files, each keeping its SHAPE and its metadata so every
loader still works, and of the measurements **only the cello's**: `balance` · `technique_ranges`
· `bend_ranges` · `velocity_remap` (all keyed by an `instruments` object — one clean rule) ·
`sample_lengths` (keyed by TECHNIQUE instead, so the rule became "keep the rows that are the
cello's": `stac_vel` `bartok_vel` `gettato_vel` `marcato_stac_vel` `spicc_vel`; **`staccato` was
dropped deliberately — it was measured on piece #5's FLUTE and must not silently become the
bassoon's staccato length**) · `scattered_strikes`, emptied: it held the composer's own recorded
piano strikes, the seed of #5's opening, and this piece has neither a piano nor a recording.
Each file carries a `_provenance` line saying so, and lists the dropped names inside it.

**`tools/palette_check.js` — new, and a keeper.** #5 scattered instrument knowledge through the
panels and nothing checked the pieces against each other. This asserts: every track has a recipe
and every recipe a track · each instrument's `ordinary` is one of its own techniques · ports are
distinct and are not #5's · **every instrument named in the nine app tables is a track of this
piece, and every technique they name exists in the recipe** · the beating ORDER is TRACKS order
exactly · an instrument marked `beating: false` has no breath/bow ceiling and every other has one
· the registry count. **PALETTE GREEN: 157 checks.**

## §16. Step 5 — verified in the RUNNING app, not by reading (AI_METHODOLOGY rule 4)

Both servers up, **`score` on 5400 and `sandbox` on 4900; his 5300 was checked and never bound.**

- **Routes: 71 × 200** — every `<script src>` the page loads, every `/api/*` the server declares,
  the banks, the probes, `/notation/*`, `/docs/*`. Six GETs 404 and **that is correct**: they are
  POST-only endpoints (`save` · `discard` · `restore` · `ingest` · `generate-ostinato` ·
  `actualplacement`), verified as POST-only in `server.js` rather than assumed.
- **Save API round trip** on a throwaway name: save → `versioned:false`; save with
  `makeVersion:true` → `versioned:true` and the snapshot on disk; list · load · versions · mtime
  all correct; both files deleted after. *(A first reading called `versioned:false` a defect — it
  is not: versioning is a flag the CLIENT sends, and the first request did not send it. Read the
  handler before believing the symptom.)*
- **The page:** `Composer initialized`, **zero console errors**. The only warning is Web MIDI
  permission denied — the in-app browser's policy, as in #5; every MIDI path is verified on his
  Chrome at 0e. `TRACKS` = the seven ids · `META_LAYER` 7 · 11 lanes (7 + META + curve A/B/C) ·
  the select and the record panel both list the seven by their new labels · session `lgmf`.
- **`laneCanPlay`, #5's one design addition, works on the new palette** — six probes: the english
  horn cannot take MIDI 30 (below its 52) but the double bass can; the trumpet takes 80 and the
  horn cannot (above its 65); percussion takes anything; the cello cannot take 100.
- **Every panel opens with no error:** morph · texture · pulse · multitempo · beating · strikes ·
  blasts · trills · crescendo · fill · zones · record · points · draw · stamp · META · curve A/B/C.
- **P2 — the piano-role features are QUIET, and this was tested, not assumed.** `cueLane()` and
  `CrescPanel.pianoLane()` both return −1. The three piano buttons that survive in the UI —
  *Hear piano*, *♪ piano harmonics*, *lines → piano* — were each **clicked**: no synchronous
  throw, no async error (caught through `window.onerror`), and no object created.
- **P7 proven, with its control.** A piece #5-shaped save was pushed through `restoreData`:
  **the lane count is identical (7 = 7)**, so `layoutVersion` alone could never have caught it,
  and the id check fired — *"THIS SAVE WAS WRITTEN FOR A DIFFERENT ENSEMBLE — its tracks are
  [flute, bass_clarinet, piano, violin1, violin2, viola, cello], this piece is [english_horn,
  bassoon, horn, trumpet, percussion, cello, double_bass]."* Our own save warns nothing.
- **The trill stand-in works:** `pickTable(db, 'english_horn')` returns the CELLO's measured table,
  flagged as a stand-in — the carried timing db holds violin1 · viola · cello, and the cello is
  this piece's only own row.
- **The sandbox on 4900:** the instrument menu is the seven; choosing the english horn shows its
  two provisional techniques; `/motives` 200.
- **`scores/lgmf.json`, the day-one stub, written by the APP** — its own `collectData()` through
  the server's own save path, never by hand (#5 §10 and §13). 1 098 bytes, `layoutVersion` 6,
  the seven tracks, zero objects, with a note inside saying what it is. A cold reload opens on
  `lgmf-work`, the D17 working copy, with no "Score not found".

**Five checks that were GREEN in step 2 are RED after the re-palette — every one classified,
none a port defect.** This is exactly what step 2's baseline was built to make legible:

| check | why it went red |
|---|---|
| `beating_calc_check` | asserts piece #5's six bending players **by name** and then indexes them — its first lines now read `english_horn bassoon horn trumpet cello double_bass`, which is the right six for this piece |
| `strike_chords_check` | asserts #5's seven players and their ordinary ranges |
| `piano_harmonics_check` | reads `INSTRUMENTS.piano.techniques` — **this piece has no piano.** The FEATURE is quiet in the app (proven above); its CHECK cannot run at all |
| `harm_source_check` | needs strikes #24 and #26 from `bank/scattered_strikes.json` — the composer's own recorded piano strikes, deliberately left behind |
| `piano_cues_check` | ENOENT `scores/piano-harmonics-test.json` — one of #5's scores |

All five are #5's tests bound to #5's palette or #5's recording, the same class as the
`piece-septet` fixtures of §14. They are rewritten against this piece's material at 0c — filed
in NITS with that instruction, not left as unexplained red.


## §17. PORT step 6 — the notation half: the ensemble registry, and a defect that would have killed the print

**The sign convention was checked in the CODE before the table was written**, as the plan
required rather than trusted: `layout.js` line 75 — *"written = sounding + transpose semitones;
the IR stays sounding"* — and it is applied at line 965, `e.pitch.midi + pc.transpose + tw.transpose`.
Piece #5's bass clarinet (`transpose: 14`, "written a major ninth above sounding") fixes the sign.
So **positive = written above sounding**, and the table follows:

| part | id | short | clef | transpose | authority |
|---|---|---|---|---|---|
| 0 | english_horn | EH | treble | **+7** | in F, sounds a fifth below written |
| 1 | bassoon | Bsn | bass | — | SI2 manual: "written at actual pitch" |
| 2 | horn | Hn | treble | **+7** | SI2 manual, verbatim: *"Instrument part to be written a perfect fifth higher"* |
| 3 | trumpet | Tpt | treble | — | SI2's is in C, "written at actual pitch" |
| 4 | percussion | Perc | treble | — | **placeholder** — the instruments are not chosen |
| 5 | cello | Vc | bass | — | as #5 |
| 6 | double_bass | Db | bass | **+12** | sounds an octave below written |

**Groups: three brackets — [EH, Bsn] · [Hn, Tpt] · [Vc, Db] — which is the composer's own
pairing (LG-1) drawn on the page.** The percussionist sits between the brass and the strings,
unbracketed: one player is not a group. No brace — this piece has no grand staff.
`notate_section` refuses to extract if a part's `id` or `short` differs from the score's
`tracks[part]`; both match `TRACKS` exactly, checked.

### The defect: a realization override that THROWS

`layout.js` `ensembleFor()`:

```js
if (!pc) throw new Error('realization override for an unknown part "' + id + '"');
```

`container.json`'s **`video-jury` realization — which the print score borrows** — carried
`ensemble.parts.bass_clarinet` (#5's D55: its presentation score is in C, the bass clarinet at
sounding pitch on a bass clef). **That part does not exist in this piece, so print and the jury
video would have thrown on their first layout.** Not a warning, not a wrong-looking page: a
throw, in the two exporters that make the submission.

Found by reading how the registry is consumed, not by running — nothing in the batteries
exercises that path, because the tuba goldens pass no ensemble at all.

**Fixed by emptying the override**, not by inventing a replacement: the pitch form is a property
of the REALIZATION and #5's D55 was a decision the composer made about *his* bass clarinet.
**For this piece it is an open question for 2b** — is the presentation score in C, or at written
pitch (english horn and horn a fifth up, the double bass an octave up)? The note in
`container.json` now says exactly that. An empty override means "no override": the ensemble
default is used, untouched. No other realization carried part overrides — checked.

### The batteries, and the exporters

Re-run on the staged tuba goldens **after** the re-palette: **identical to step 2** — eight
engine batteries GREEN (render · layout · animobj · splice · graphic · pattern_fit · stamps ·
ir_validate_battery), and the same two RED with the same two known causes (`test_coords`, red in
the source too; `test_notate_block`, 62/65, the three assertions of §13). **The new ensemble
registry disturbed nothing**, because a caller that passes no ensemble still gets the tuba
behaviour — which is what that mechanism is for.

**The exporters run, and they report this piece back:**

- `export_print --ir db1 --format a3-landscape --pages 1-2` → a 2-page A3 PDF, and its own
  frame line reads **`frame  EH · Bsn · Hn · Tpt · Perc · Vc · Db`** — 7 lanes, lane 35.5 mm,
  staff 7.55 mm, 10.32 s/page.
- `export_video --probe 5` → one frame rasterized through resvg and **looked at**: seven staves
  labelled EH · Bsn · Hn · Tpt · Perc · Vc · Db, the clefs right (treble · bass · treble ·
  treble · treble · bass · bass), **the three pair-brackets drawn and the percussionist standing
  alone between them**, with the GC arcs, the swells, the cursor, the dynamics and the ottava
  marks all rendering. Piece #4's material, laid out on this piece's ensemble — which is exactly
  what a staged-golden run should look like, and the proof that the registry reaches the video
  layer as well as the print one.

Both outputs are gitignored and were deleted. `notation/ir/README.md` rewritten for this repo:
what lives there, the staging recipe for BOTH golden sets (#4's tuba pages and #5's septet
pages, always from `HEAD` so his uncommitted saves are never read), the rule to delete from a
list written before copying, and where the batteries stood at the port.

### The 2a adaptation list for THIS piece, recorded so it does not bite

**tenor clef** (bassoon and cello upper registers — the engine draws treble, alto and bass
today) · **percussion notation proper**: a percussion clef, one-line and five-line staff types,
unpitched noteheads — none of which exists, and none of which can be designed until he names the
instruments · **mute marks** (con sord. / senza; SI2 has four trumpet mutes as separate
instruments) · **a B♭ trumpet part** if he wants one (transpose 2; the library is unaffected) ·
**technique marks for every new instrument**, and the 18 roster keys that are not yet in
`techniques.json` (cuivré, stopped, pedal tone, the half-valve gliss …) · **animated conductions**
(LG-3) as a new animated-object kind · **the bouncing balls per player in their own tempo**
(LG-5 — the GC arcs exist and are the starting point) · **the presentation score's pitch form**
(above).


## §18. PORT step 7 — PLAN 0i: the save → IR contract, proved on a Lake George save

**The first attempt failed, and the failure is the finding.** A 30-second test save was built in
the running app with an object shape written from memory — `{ t0, t1, nodes: [{t, v}] }` — and
`notate_section` rejected every one of its eleven objects:

```
--complete: S1 object wc-1 (layer 0, t=undefined) has no event in this document
```

**`t=undefined` eleven times.** The extractor could not see a single note. This is exactly what
0i exists to catch: the IR is DERIVED from the save, so the save's shape is the only thing that
can bite later, and a shape that looks plausible is worth nothing.

**Fixed by reading the ground truth instead of guessing again** — piece #5's own proof save
(`scores/0i-test-b.json`, from its HEAD, read-only). The app's real insert-time shape:

```json
{"id":"wc-2","type":"waveCurve","layer":0,"startSeconds":1,"endSeconds":3,
 "nodes":[{"pos":0,"y":6,"smooth":0.25},{"pos":1,"y":6,"smooth":0.25}],
 "segments":[{"model":"power","slope":0}],"color":"#5E8C7A","fillMode":"bottom",
 "opacity":0.55,"srcKind":"blast","sonifyNote":72,"technique":"ord",
 "sonifyMode":"plain","recVel":100}
```

`startSeconds` / `endSeconds`, not `t0`/`t1`; nodes are **normalized** — `pos` 0…1 across the
object and `y` the value — with one `segment` per gap; a marker is
`{type:'marker', time, label}`. Rebuilt in that shape and saved through the app's own
`collectData()` and the server's own save path (never a hand-written file — #5 §10 and §13).

**`scores/0i-test.json`** — 12 objects over 30 s on four lanes + META: the **english horn**
(an `ord` at E4, an `ord` at G4 carrying a three-node crescendo envelope, a `staccato` at C5) ·
the **trumpet** (five staccati at 12.00 / 12.25 / 12.50 / 12.75 / 13.00 s under one `groupId`,
with the gesture's META shape on layer 7) · the **double bass** (a seven-second `ord` on
sounding E2, a short `staccato` on A1) · the **cello** (a three-second `ord`) · a marker
`ACT-lgmf-0i`.

**The extraction:**

```
GEOMETRY: clean (brackets, dynamics, accents, stem sides)
READY: lgmf-0i — 11 events, 7 chunks {"unresolved":6,"simple-bar":1} · VALID vs source · in the picker
```

and then, as an independent process, `ir_validate.js notation/ir/lgmf-0i.ir.json
--against-source --complete` → **`VALID (11 events, 7 chunks, 0 overlays; against-source
checked; completeness checked)`**. *(The validator takes a PATH, not an id — #5's §12 correction,
which held.)*

**The five-note trumpet run was promoted and fitted as ONE `simple-bar`** — the same
segmentation-by-behaviour that fitted #5's five-note violin run at its own 0i, working unchanged
on this piece's material. The IR holds **sounding** pitch throughout (64 · 67 · 72 · 67 · 69 ·
71 · 72 · 74 · 40 · 48 · 33), as the contract requires.

**Seven warnings, every one expected and correct:** `no staccato sample length for midi 72 …
using drawn length`. `staccato` is precisely the row dropped at step 4 because it had been
measured on piece #5's FLUTE. The extractor falls back to the drawn length and says so — the
designed behaviour, and the same shape of warning #5 saw at its own 0i.

### The written pitch, proved through the engine's own resolver

Looking at the page is not proof that a transposition is applied; it is proof that something was
drawn. So the check went through `Layout.positionResolver(ens)` — **the same mechanism piece #5's
`test_septet_notation` uses for its bass clarinet** — which returns the staff position in
staff-spaces:

| part | sounding | ySs | reads as |
|---|---|---|---|
| english horn | E4 (64) | **0** | written B4, the treble middle line |
| english horn | G4 (67) | **1** | written D5 |
| horn | C4 (60) | **−1** | written G4 — the manual's "a perfect fifth higher" |
| double bass | E2 (40) | **0.5** | written E3, a space above the bass middle line |
| double bass | E1 (28) | **−3** | its lowest string, written E2 |
| bassoon | D3 (50) | **0** | untransposed, the bass middle line |
| trumpet in C | B4 (71) | **0** | untransposed, the treble middle line |
| cello | D3 (50) | **0** | untransposed |

**And the control, which is what makes it a proof:** with the english horn's `transpose` deleted
from a copy of the registry, sounding E4 falls to ySs **−2** instead of 0 — so the shift is
really being applied, not merely declared.

**One case failed first, and it was mine, not the engine's.** I expected the double bass's E1 at
−2.5; the engine said −3. The engine is right: the bass staff's bottom line is G2 at −2, so F2 is
−2.5 and E2 is −3. Corrected after checking the engine's answer independently, not by moving the
expectation to fit. *(Principle 15's cousin: when a measurement and an assertion disagree,
find out which one is wrong before editing either.)*

**Kept as this piece's first own battery: `tools/test_written_pitch.js`** — eight cases and the
control. Piece #5's `test_septet_notation` asserts ITS ensemble (a B♭ bass clarinet, a grand
staff) and cannot be carried; this keeps the one part of it that is about THIS ensemble, by the
same method. The rest of that battery is rewritten at 2a.

**In the notation app:** `notation/ir/index.json` lists the page (written by `notate_section`),
the picker shows `lgmf-0i (trance)`, the parts menu reads **EH · Bsn · Hn · Tpt · Perc · Vc · Db**,
and the page renders on seven staves with the english horn's three notes and its crescendo,
no errors beyond the in-app browser's Web MIDI denial.

**Kept as evidence** (as #5 kept its own): `scores/0i-test.json` and
`notation/ir/lgmf-0i.ir.json`.

---

## §19. 0c begins — the percussion scaffolding: piece #2's ARO map carried as a catalog, a selection and a generator

**What prompted it.** After the clear, on Fable, he set the mode: *"no need for planning protocol,
let's just dig in. What's first?"* The answer given was the seven loopMIDI ports (nothing routes
without them), then the rack, then the recipes heard one by one. He answered the one yes/no put
to him — *"yes double bass xsample"* — and redirected the first move to the percussion:

> *"I don't know if you had a chance to look at the two piano, two percussion piece, but that's
> where you're going to find all the percussion definitions. That patch might become large, but I
> haven't decided which percussion instruments to use yet. And I know we were using multiple ports
> there, but are probably changing the design here. But have a look and bring over any of the
> Spitfire instrument definitions. I know we went through and got ranges and MIDI keys, etc., for
> that piece. And then maybe we can set up some scaffolding. And then when the time comes, put in
> the actual instruments."*

Mid-way he added: *"empty reaper session here: reaper/LGMF_rack.rpp"* — his file, created by him,
the rack's home for step 2.

**What piece #2 has (one search, one read — `docs/instrument_map.json`, 146 KB).** 84 entries:
**78 ARO percussion** (35 `verified` — dictated key by key from the lit keys of the plugin's
keyboard; 2 `partial`; 2 `predicted`; **39 `skeleton`** — name and beaters from the manual, no
keys) and 4 pianos. Each mapped entry carries its **All-in-One** preset as `allInOne[]`:
`{ note, midi, beater, pitch, articulation }` per lit key — the brake drums are six Poly Beater
keys 36–43 and six Rubber Mallet keys 60–67; the suspended cymbals five blocks (felt · brush ·
stick · scrape · **bow**) 36–93; the triangles 48 keys. Plus per-volume CC maps (dynamics CC1 ·
expression CC11 · reverb CC19 · release CC17 on Low · tightness CC18 on Metal), the octave
convention (Spitfire C3 = 60; Reaper agrees), the `patternRules` #2 observed across verified
instruments, and the walkthrough by which an instrument is mapped (load All-in-One, hover each
lit key from the lowest, dictate). **The two facts that shape the design:** Spitfire's plugin
**cannot switch instruments by MIDI** (#2's decision 5 — one plugin instance per instrument),
and All-in-One is **byNote**: the key IS the articulation, loudness is velocity, no keyswitch, no
CC prelude. Piece #2 answered the first fact with **eight loopMIDI ports** (three per
percussionist, channels 1–5 / 6–10 / 11–16) and per-event channel→port routing, for two
percussionists and snippets that address several ports at once.

**The design here (D7).** One player, so **one port, `LGPerc`, one channel per instrument** —
one Spitfire instance = one Reaper track filtering on its channel; sixteen per port, and the
recipe schema's per-technique `port` gives a second (`LGPerc2`) if he ever needs it. **One
technique per instrument × beater** (`brake_drums_poly_beater`, ch 1, 36–43) — the technique's
range is that beater's block of keys, exactly as the SI2 rosters make a technique a playable
region, and each technique carries a `keys` table saying what every key is ("Low · Hit L").
**Nothing typed by hand:** the definitions are a catalog, the choice is a selection, and a tool
writes the recipe.

- **`bank/aro_percussion_catalog.json`** — the 78 ARO entries carried verbatim (123 KB), with
  #2's rack routing (`Perc1-A/B/C`, channels, `sourceCh`) and the pianos stripped; `_meta` says
  the source, the octave convention, what each status means, and the walkthrough for mapping a
  skeleton entry.
- **`bank/perc_selection.json`** — `{ port: "LGPerc", instruments: [ { slug, channel, beaters? } ] }`
  — **empty.** Channels pinned explicitly rather than by list order, so a rack built by hand in
  Reaper does not shift under a reorder.
- **`tools/apply_perc.js`** — `apply_ranges.js`'s idiom: a generated block `ARO_PERC` in
  `sandbox/instruments.js`, applied at load by `applyAroPerc()`, placed BEFORE the measured
  blocks so a later 0d measurement lands on top of the generated techniques. It refuses a slug
  the catalog has no keys for, a channel outside 1–16, and a channel used twice on a port. With
  the selection empty the block is inert and the `main` placeholder stays; with a selection it
  REPLACES the placeholder voice, sets `ordinary` to the first technique, the lane's range to the
  union of the key blocks, and `channels.curve` to `[]` — a crescendo curve voice on another
  channel would be another instrument (cresc.js documents empty = the voice's own channel).

**Proved, not read.** A two-instrument proof selection (brake drums ch 1; suspended cymbals dark
ch 2, beaters Bow + Scrape only) → **4 techniques, range 36–93**, each block's keys counted
(6 · 6 · 8 · 9). A skeleton entry (waterphone) → **refused** with the status and the walkthrough
named. Back to the empty selection → the placeholder, 21–108, `curve [2,3,4]` untouched.
`palette_check` **GREEN 157** and `test_written_pitch` **8 + the control** with the empty
selection.

**What the proof found — the finding, again, is in the RED.** With the two instruments applied,
`palette_check` went **RED 4**: `strike_drawer.js STRIKE_DEFAULT` · `ART_SETS.spiccato` ·
`ART_SETS.staccato` · `cresc_card.js STRIKE_DEFAULT` all name `percussion → main`, which no
longer exists once real instruments replace it. That is exactly the check doing its job: the
four tables are on the list for the day the first instrument is chosen (NITS). A sixth check
was added — the selection ↔ what the recipe carries — so an edited selection with the tool not
re-run is RED, not silent (**159** now).

**Found in passing, not fixed:** `tools/apply_ranges.js`'s BEGIN marker no longer matches the
carried block's header (`MEASURED RANGES — piece #5's, for the CELLO ONLY`); a re-run would
insert a SECOND `const MEASURED_RANGES` and the recipe would not evaluate. To NITS, for 0d.

**Rejected.** Hand-transcribing key maps into the recipe per instrument (35 instruments, up to 48
keys each — the one fragile build) · one technique per instrument spanning all its keys (the
beater is what the composer chooses; the technique should be it) · #2's multi-port design (built
for two players and cross-port snippets) · embedding the whole catalog in `instruments.js` (146 KB
in a browser script the sandbox loads whole).

**Not done, on purpose:** no instrument chosen (his: *"haven't decided"*); no percussion notation
kind registered (nothing uses one yet — principle 3 gates the file, not the roster); the sandbox
does not show the `keys` labels (NITS).

---

## §20. 0e begins — the bridge answers on his rack; the seven ports verified; what the AI can do alone (read from the septet, then proved live)

**What prompted it.** *"yes commit the rpp, ports are in and how much of this can you do
independently? Did you get all the information from the septet? … That includes the Reaper
bridge, the XML for UVI and the contact developer tools. I believe you can make tracks and set
parameters yourself. Tell me what you know about the capabilities that we developed for AI
control."* Answered from the record, not from memory: `docs/REAPER_CONTROL.md` (carried whole —
the survey, §3 the CC7 finding, §3b UVI's insides are text, §4 the bridge plan), the bridge's
`README.md` / `install.md`, the headers of `tools/reaper_job.js` · `uvi_state.js` ·
`render_reaper.js` · `reaper_midi_place.js` · `reaper/bridge/jobs/*.lua` · `reaper/kontakt/*.lua`,
piece #5's PLAN 0e (the R1–R13 walk) and 0k (0k.1–0k.4 all proven 2026-09-04), and
`SAMPLER_QUIRKS.md`.

**Verified live, in order.**
- `%APPDATA%\REAPER\Scripts\__startup.lua` still points at `septet_2026/reaper/bridge/bridge.lua`
  — machine-level, as #5 built it. **Heartbeat: bridge 0.2.1, Reaper 7.72/x64, project
  `septet_LGMF_2026/reaper/LGMF_rack.rpp`, 2 tracks, 1 s old.** Alive on this piece's rack.
- **`tracks` REFUSED:** *"Reaper has LGMF_rack.rpp open, this repo expects lgmf_rack."* The port
  set the guard's default to the lower-case stem and he named the file `LGMF_rack`. Fixed in one
  line — the comparison is case-insensitive now (`tools/reaper_job.js`). Then **34 ms round trip.**
- **His two tracks, read through the bridge** (`inputs.lua`, a read-only job): **1 English Horn XS**
  — Kontakt 8 · input `LGEngHorn` (Reaper device 44) all channels · monitor ON · armed · 0 dB.
  **2 Bassoon SI2** — UVIWorkstation · input device 45 · armed. *The file on disk said
  otherwise* — a Kontakt beside the UVI on the bassoon track, and monitoring 0 on both — because
  the file is his last CTRL+S and he was still working: **the live read is the truth, the file
  is the record** (SAMPLER_QUIRKS's own rule, now seen).
- **The UVI's parts, as text** (`uvi_state.js info`): Part 1 ch 1 *Bassoon Ordinario* · Part 2
  ch 2 *Bassoon Blow Without Reed* · … — he is loading the SI2 presets into parts by hand, one
  per channel, the flute/tuba pattern. The roster order is compared to the recipe in the next entry.
- **The seven ports, via winmm, case-exact: all present, out AND in** — `LGEngHorn · LGBassoon ·
  LGHorn · LGTrumpet · LGPerc · LGCello · LGBass`; 48 MIDI outs on the machine; Reaper has the
  seven enabled as inputs 44–50 (beside the tuba, Tempus and 2p2p ports — the `LG` prefix earning
  its keep).

**A fact the rack told before he did:** the first track is named **"English Horn XS"** — the
english horn's library is **Xsample** (D6 had it "being acquired, to be named"). To confirm in
words; the recipe's english_horn entry follows.

**What the AI can do alone on this rack (proven mechanisms, #5 0k.1–0k.4):** create and name
tracks · set each track's MIDI input to its `LG` port, all channels, monitoring ON, arm · insert a
plugin instance by name (Kontakt 8, UVIWorkstation — Spitfire's plugin by the same call, never
tried) · faders, sends, child tracks, routing · read everything back as JSON · play MIDI into any
port from PowerShell (the probes) and measure what sounds through REC · **UVI setup as text** —
parts, channels, outputs, gains, insert bypasses, proven; **a preset loaded by `ProgramPath` is
the same text edit and is NOT yet proven** (0k.3 proved the round trip and one output change) ·
**render** the composer's playback through the bridge.
**What takes one click of his per instance:** the Kontakt Lua scripts (they run from Kontakt's
own ▾ menu — `curve_slots.lua` makes the ×4 channel-bank slots, the `proof_load` pattern loads an
`.nki` by path; the AI checks the JSON read-back) · mic positions · the sampler masters (GUI-only).
**Never:** CTRL+S (`save` is a job he asks for); the plugin blobs by hand.
**Unexplored:** Spitfire's plugin — insert by name should work; whether its state is text like
UVI's is an experiment for the day the first percussion instrument is chosen.

*Committed with this entry: his `reaper/LGMF_rack.rpp` at his last save ("yes commit the rpp").*
