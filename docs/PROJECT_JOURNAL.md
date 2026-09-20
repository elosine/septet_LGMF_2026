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

### SESSION 11 — 2026-09-20 (Opus → Fable → Opus) — **THE SEQUENCE PANEL FLOATS; THEN HIS EAR FOUND THE WAVES SILENT, AND THAT OPENED PLAN 1e, THE VOLUME FIX**

*The session began as a postclear into two small UI asks and turned into the piece's dynamics law. Nothing of PLAN 1d was built;
its feature list grew and went ON DECK.*

- **The floating panel (RUNNING_LOG §132).** At his word (1b · 2a): the sequence strip is a WINDOW — dragged by its head, sized by the
  corner, its place remembered across reloads; the boxes row grows with it; the strikes drawer keeps the bottom of the screen. Every
  font in that panel up 4, from **one constant `FS = 15`**, with all 41 laid-out widths converted px → em so they follow it.
  `strike_drawer.js` untouched (his 2a). **Three bugs of the AI's own, found by verifying:** a hidden element measures 0 × 0 (the
  window came up at its minimum in the corner and saved `{0,0,0,0}`) · `parseFloat('0px') || was` throws away a legitimate zero ·
  a `ResizeObserver` with no reference of its own is collected — and RO is not delivered at all in a pane that is not painting, so
  the grip's `pointerup` saves too.
- **Then the conversation moved to the breaths and the waves** — his briefs LG-43 … LG-49, and a FEATURE LIST collected at his word
  (LG-44: *"let's just collect these features … Just make a list for now"*).
- **HIS EAR, twice, and both times he was right.** *"it sounds Like the whole sequence is just sitting at the high dynamic. No
  waves."* → §137: Hear streams the fader on MAIN ch 1, where his rack takes no moving controller (D11). Then *"inserted in score …
  the audio still is one dynamic"* → §139: a SECOND bug of the §75 kind — `insert()` never dropped the CACHED curve-channel map, so
  once the score had been played every inserted note fell back to MAIN. **Fixed, one line, verified in the running app.**
- **THE MEASUREMENT THAT SETTLED IT (§140).** He recorded the playback as MIDI in the rack; a new read-only bridge job,
  **`reaper/bridge/jobs/cc7_by_channel.lua`**, read it back per track and channel. Routing right, fader streaming on the curve
  channels, MAIN empty — **and every note struck at the velocity of its shape's TOP (127) with CC7 moving only 63 … 127 = about
  12 dB.** *"between two high dynamic levels"* is exactly what was sent. *(The older `dump_recorded_midi.lua` took `MIDI_CountEvts`'
  returns one place off and walked only as many CCs as there were notes; fixed.)*
- **HIS DIAGNOSIS, and it was the heart of it (§141):** *"in the tuba piece and in the last piece, we always made crescendos from
  zero … CC7 zero to CC7 max … a normalized one."* **And the machinery for that is ALREADY IN THE SCORE, per note, built by piece #5
  eleven days ago for this very problem** (its §316 · §346 · §349): `wc.cc7Abs { lo, hi }` maps a drawn height straight onto a CC7
  range, bypassing the 12 dB ladder; `wc.velAbs` sets the strike velocity. **So nothing in `composer.html` changes — the fix is what
  the TOOLS WRITE.** PLAN **1e** written (§142).
- **Decided:** **mf for ALL instruments** on a shaped note, not just the brass — from the bank, the level lost against a struck fff is
  4.2 · 4.3 · 4.9 · 4.9 · 5.4 · 3.9 · 3.9 dB, uniform because 1b made it so, so one rule keeps the balance. *(An earlier "the brass
  lose a decibel or two" was the AI quoting D13's state of 2026-09-18, before §85's Dynamic fix — corrected to him with the numbers.)*
- **Step 1 of his top line is DONE and found nothing:** the trills carry volume as SEPARATE STRUCK NOTES by velocity, CC7 at 127 —
  the septet's design, and `trill_engine.js` differs here in 6 lines, all of them which instrument's timing row stands in.

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| ✓ | **PLAN 1e, THE VOLUME FIX — BUILT, V1 → V7** (RUNNING_LOG §143). Every SHAPED note a tool writes carries `cc7Abs {0,127}` and `velAbs` = its instrument's MF velocity **for that pitch**, its heights re-based so the shape's top is the full fader, and it sounds on a CURVE channel in Hear as in the score. `sequence_ui.js` (Insert · Hear · the marker-seat route, `D.routeFor` wrapped from outside so `strike_drawer.js` is untouched) · one `curveDirty()` line in `strike_drawer.js` and all FOUR of `morph_panel.js`'s inserts · `swell_ui.js` takes the mf strike · `note_card.js` gains a **`full fader`** checkbox · **`docs/DYNAMICS_LAW.md`** written and named in CLAUDE.md as the FIRST read for any sound-path work. V5 (the morph) is method-only by the plan. `sequence_check` still **126** — `sequence.js` was not touched. | Opus | — |
| ✓ | **HIS RACK TEST — PLAN 1e PASSES (RUNNING_LOG §144).** He recorded the playback as MIDI and `cc7_by_channel.lua` read it back per track and channel. **MAIN ch 1 empty on all eighteen tracks** · every shaped note on a **curve channel**, three per player in rotation, the SI2 three on their **`b` ports** and nothing at all on the non-`b` tracks · **every strike an mf velocity**, checked against the bank over each instrument's whole range (EH 81·102·110 · Bsn 104·107 · Hn 81·83·85 · Tpt 66·77 · Vib 99 · Vc 107·108·127 · Db 55·60·68 — all inside their own bands; the cello's 127 and the bass's 55 are the register curve, not strays) · **CC7 reaching 0** on the first channel of every player. The floor of **56** elsewhere is `ppp` under an `mf` top, to the digit. | — | — |
| 3 | **`docs/DYNAMICS_LAW.md`** (1e V7) — one page, then named in CLAUDE.md's "Orient from docs" as the FIRST read for any sound-path work. His reason: *"There's some fundamental misunderstanding or AI forgets what we established before"* | Opus | with the build |
| ✓ | **THE DESIGN TALK — CLOSED 2026-09-20 (RUNNING_LOG §145–§147 · COMPOSITION_NOTES LG-50).** (a) THE LIBRARY: a file of its own · an untitled rolling stack of 50 · naming MOVES it and it autosaves to the name · `save` marks a keeper, `revert` returns to it, two states per name · (b) the waves' range is a FIXED `low`–`high` for the sequence, and a SELECTION of boxes can carry its own · players rest at `low` (LG-49's water line REVERSED) · (c) `save preset` yes · (d) a selection takes waves · `dyn` · `enter` · (e) **THE DYNAMICS TABLE** — each written dynamic gets a CC7 value of its own, read by every shaped note; AMENDS 1e's Rule 2 ("top = full fader"); the numbers are the AI's to work out, he does not need to see them; `DYNAMICS_LAW.md` §3 is rewritten when it is built. **NEXT: PLAN the feature add under the planning method — the top line, then one step at a time.** | Fable | — |
| ✓ | **THE FEATURE ADD IS PLANNED AND APPROVED (RUNNING_LOG §148; his word: *"the sequence plan is good, approved. So go ahead and write that"*).** `docs/PLAN.md` § 1d, THE FEATURE ADD. He asked for the whole plan as ONE conceptual summary and approved it whole, so the sub-steps are the AI's, written to be executed cold. **His principle, LG-51, made the table the COMPOSER's:** a STATED dynamic range is what sounds for the whole curve — drawn full for notation, performed between the two values — and the CC7 reflects it (`mp → ff` ≈ 69 → 109, *"not up to the full 127"*). | Fable | — |
| **►** | **BUILD THE FEATURE ADD, ONE STEP AT A TIME, IN THE RUNNING ORDER — 1d.10 THE DYNAMICS TABLE FIRST** (it AMENDS 1e's Rule 2; the mf strike stands; `score/public/dyn_table.js`, 4 dB a written step through each instrument's measured fader curve; CHECK FIRST that every `cc7Curve` in the bank reaches −28 dB; rewrite `DYNAMICS_LAW.md` §3 and remove its banner) → **1d.11** the library (`bank/sequences.json`, a file of its own) → **1d.12** select a range → **1d.13** the waves by preset → **1d.9 + 1d.14** the breath's lengths → **1d.15** the clock and the cursor → **1d.6** his listen. **Each step ends on HIS test; 1d.10's is the rack recording read back by `cc7_by_channel.lua`.** Two questions are his, asked when 1d.9 / 1d.14 is reached and not before: `of max` on a new sequence, on or blank · `±` in seconds under `of max`, one number for all or a share of each player's own aim. | **Opus** — executing a written plan | **yes** — checkpoint, clear, build cold |
| N0 | **PLAN `1f`, `todo` — THE CRESCENDO TOOL IS STILL ON THE PRE-1e LAW** (found 2026-09-20 when he asked whether anything needed going back to; read in the code, not captured): `cresc*.js` write no `cc7Abs` and no `velAbs`, so a crescendo strikes at its top's velocity and its fader moves only inside the 12 dB ladder. After 1d.10 — it reads the same table. To be laid out when he calls it. | Fable to lay out · Opus to build | — |
| — | *(the record of how it came off deck)* **THE SEQUENCE FEATURE ADD COMES OFF DECK — 1e is closed, so this is the work in hand** — `docs/PLAN.md` § 1d, THE NEXT FEATURE ADD (items 1–8; item 9 moved into 1e) and **1d.9** (`of max` · `outlier`, planned in full). **THE DESIGN TALK IS DONE — the row above. What follows is the record of what was asked:** the LIBRARY look (LG-47 — he asked to be shown how it would look before it is planned; the AI's sketch is in the chat: name it and it autosaves to that name, unnamed autosaves generically, a `library` menu, `duplicate`, `×`) · **(b)** the waves' `up` / `down` in STEPS from the box's own dynamic (recommended) vs a fixed `low` / `high` · a **`save preset`** button so he can refine the five waves presets while composing (*"probably need to refine all presets while composing"*) · does a SELECTED RANGE of boxes also take `dyn` and `enter`, or only waves | **Fable** — design and verdicts | **yes** — a clear and a design conversation |
| 5 | **Known and accepted, to be re-thought when item 4 is built:** under 1e a shaped note tops out at mf loudness, so the waves' `low` / `high` become a DEPTH below that top — "waves by preset" (item 8: `up` / `down` round the box's dynamic) needs re-framing as depths | Fable | with 4 |
| N1 | **HIS, still outstanding behind all of it:** the listen in the strikes drawer (PLAN 1c, built and unheard) · **the six scores** (`lgmf-ref` · the four transitions · `lgmf-all`), unheard since the rack was calibrated · his tests of 1d.7 and 1d.8 — **which 1e will change the sound of, so they are better done AFTER the build** | — | — |
| N2 | **After that: the rest of phase 1** — the tools he has named (multitempo LG-5/11/12 · the pattern tool LG-7 · the morph to a held beating LG-8 · animated conductions LG-3), **the morph's own revision** (`MORPH_NOTES.md`, now carrying 1e's method), and **how the six chords are used in time**. And the LGMF call, when he says | Fable to design | yes |
| N3 | **Small, deferred, in NITS:** `beating_calc_check.js` and `morph_septet_check.js` are still piece #5's cast and crash · the model_bank validator does not know `provenance.palette` | Opus | — |

**⚠ LATER THE SAME SESSION (2026-09-20, Fable): the checkpoint below is SUPERSEDED IN PART — the design talk it names as the next
step is DONE and the feature add is PLANNED AND APPROVED. Read the ► row of the table above and RUNNING_LOG §145–§148 first. Its
uncommitted list, its verification recipe and its "learned the hard way" notes all still hold — and one more of those: a script
with BACKTICKS in it goes to a FILE (the Write tool, or a quoted heredoc), never into `node -e "…"` (§146).**

**Open at session end — (MID-SESSION CHECKPOINT #2, 2026-09-20, Opus — PLAN 1e IS CLOSED; the session carries on into the DESIGN TALK
that opens the sequence feature add. The first checkpoint of this session, written before 1e was built, is superseded by this one):**

- **THE TASK: PLAN 1e, THE VOLUME FIX — DONE AND PROVEN IN HIS RACK (RUNNING_LOG §143 · §144).** All six of his top line:
  **1 ✓** the trills (nothing to fix) · **2 ✓** the plan written · **3 ✓ BUILT, V1 → V7** · **4 ✓ HIS RACK TEST PASSES** —
  MAIN empty, every note on a curve channel at an mf velocity, the fader reaching 0 · **5 ✓** `docs/DYNAMICS_LAW.md`, named in
  CLAUDE.md as the first read for any sound-path work · **6 ►** the sequence feature plan now comes off deck.
- **What 1e was, in one line, now that it is closed:** a note whose volume is SHAPED used to be struck at the velocity of its shape's
  TOP, with the fader then moving it only inside the ladder's 12 dB — so every shape sounded *"between two high dynamic levels"*. It is
  now struck at **mf** with the fader **normalized 0 → 127**, on the **curve channels**. His own diagnosis; the machinery was piece #5's
  and already in the score, so `composer.html` never changed. **The law is `docs/DYNAMICS_LAW.md` and CLAUDE.md names it as the FIRST
  read for any sound-path work.** Do not re-derive it and do not re-prove it.
- **Latest deliverable:** **`docs/DYNAMICS_LAW.md`** (new — the two kinds of note, the curve channels, the cached map, and how a claim
  about any of it is proved) · the five edited files `score/public/sequence_ui.js` · `swell_ui.js` · `note_card.js` ·
  `strike_drawer.js` · `morph_panel.js` · `docs/PLAN.md` § **1e** (now `done`) · `docs/MORPH_NOTES.md` 2026-09-20 (the morph's part,
  method only) · `reaper/bridge/jobs/cc7_by_channel.lua` (read-only — the one test) · RUNNING_LOG **§143** (the build) and **§144**
  (his rack test). Commits `5ad4fce` and `95e3675`, both pushed.
- **THE NEXT CONCRETE STEP — a DESIGN TALK, his to answer, on Fable after a clear:** the sequence FEATURE ADD comes off deck.
  `docs/PLAN.md` § 1d, THE NEXT FEATURE ADD (items 1–8; item 9 was built inside 1e) and **1d.9** (`of max` · `outlier`). **Four
  questions, all his:** (a) the LIBRARY look — he asked to be shown it before it is planned · (b) the waves' `up`/`down` in STEPS
  from the box's own dynamic (recommended) vs a fixed `low`/`high` · (c) a **`save preset`** button, so he can refine the five wave
  presets while composing · (d) does a SELECTED RANGE of boxes take `dyn` and `enter` too, or only waves. **And one that 1e has now
  made concrete:** a shape's low/high are DEPTHS below a top that always sounds at mf — one seventh of the fader per written step,
  so ppp under an mf top is CC7 56 and only a niente fade reaches 0. "Waves by preset" has to be re-framed as depths.
- **`Resume reads:`** *(what the NEXT step needs, nothing more)*
  - `docs/PLAN.md` § **1d, THE NEXT FEATURE ADD** and **1d.9** — the items themselves.
  - `docs/COMPOSITION_NOTES.md` **LG-43 … LG-49** — his briefs, in his own words, that the feature list came from.
  - **`docs/DYNAMICS_LAW.md`** — only because question (b) and the depth re-framing depend on it. Do NOT re-prove 1e: §143 is the
    build, §144 is his rack test, and it passed.
- **Decisions pending him — these ARE the next step, so nothing can start without them:** the four design questions (a)…(d) above,
  plus the depth re-framing 1e made concrete. **Show, don't ask, for (a)** — his word, LG-47: he wants to SEE how the library would
  look before it is planned. **One question at a time, the planning method** (`docs/PLANNING_METHOD.md`): state and restate, then the
  top line, then one step at a time. Do not answer a planning question with everything at once.
- **DELIBERATELY UNCOMMITTED — five paths, all his:**
  - `bank/panel_snapshots.json` (modified) — the takes he saves from his own tab. His data, mid-use.
  - `reaper/LGMF_rack.rpp` (modified) — HIS project file. **It carries BOTH of this session's MIDI recordings** — §140's, which found
    the fault, and §144's, which proved it fixed. Every hand-set plugin value in it is written down in `docs/RACK_SETTINGS.md`.
  - `scores/cresTest.json` · `scores/seqTests01.json` · `scores/Piece-LGMF.json` (untracked) — scores he saved from his own tab.
    `seqTests01` is the one whose waves he could not hear. Leave all three alone.
- **A note on his rack, from this session:** he set the instrument tracks to record MIDI (right-click the arm button →
  `Record: input`). They were on monitor-only. That is why the recording exists and it is how the §140 test is repeated.
- **HOW TO VERIFY WITHOUT TOUCHING HIS WORK — unchanged, and this session used it throughout:** `preview_start` **`score-5401`**
  (a throwaway server on the SAME scores folder) → `composer.html` → **before anything else**
  `Composer.autosave = async () => {}; clearTimeout(Composer.autoSaveTimer)` — the page reopens HIS last working copy and would
  autosave into it 5 s after any change · **never Save** · `window.confirm` stubbed · the playhead set by
  `Composer.scrollOffset = T * Composer.pixelsPerSecond` · **`resize_window` 1280 × 860 FIRST — a hidden pane has a 0 × 0 viewport** ·
  **the pane does not PAINT, so `requestAnimationFrame` never fires and `ResizeObserver` is never delivered**: to drive the score's
  transport, replace rAF with a 16 ms timer and set `Composer._zoneMidiInited = true` · to capture MIDI, stub
  `Composer._zoneMidiOutputs[port.toLowerCase()] = { send: b => log(b) }` for every port · verify note lists, objects and ROUTES by
  `javascript_tool`, never a screenshot · reset the viewport and `preview_stop` at the end.
- **Four things learned the hard way — still true:**
  - **A Bash command longer than about 8 KB FAILS on this machine** with `unexpected EOF while looking for matching quote`. **Write
    any large text with the Write tool into the scratchpad, then splice it in with a short `node` script** that asserts each
    replacement lands exactly once. Used all session.
  - **THE LINE ENDINGS ARE MIXED IN THIS REPO (new, 2026-09-20, §143).** `morph_panel.js` · `note_card.js` · the `docs/` markdown are
    **CRLF**; `sequence_ui.js` · `strike_drawer.js` · `swell_ui.js` are **LF**. A splice with LF search strings matches **zero** times
    in a CRLF file and reports "not found", which reads like a missing anchor and is not. **Every splice script must detect the file's
    own endings and convert the search AND the replacement:** `const crlf = s.indexOf('\r\n') >= 0, fix = t => crlf ? t.replace(/\n/g,
    '\r\n') : t;`. Cost two failed runs. And check indentation by printing the real lines — a 4-space guess against a 2-space file
    fails the same silent way.
  - **The Write and Edit tools turn a typed `\uXXXX` into the literal character**, so `sequence_ui.js` holds `—` and `·`, not escapes.
  - **A PARALLEL SESSION of his may be appending to `RUNNING_LOG.md` and `COMPOSITION_NOTES.md`.** Append only; **read the last
    heading number immediately before writing** and take the next free one; explicit paths, never `git add -A`.
- **Standing warnings still true:** the in-app browser has no Web MIDI, so **every listen that matters is his Chrome** · one composer
  tab per score · `apply_trims.lua` and the remap are GENERATED — edit the bank, not the file · **the curve-channel map is CACHED:
  any tool that writes a curve event must call `Composer.curveDirty()`** (this session's §139, and 1e V3 spreads the fix) ·
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
never saves from its own browser pane (principle 9) · the in-app browser has no Web MIDI.

**Checks this piece owns:** `node tools/sequence_check.js` (**126**) · `node tools/palette_check.js` (**184**) ·
`node tools/test_written_pitch.js` (**10** + a control) · `node tools/spectrum_check.js` (**35**) ·
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

---

## §7 Human Notes

*(The composer's own to-dos and reminders. Reviewed at session end.)*

- **From piece #5, still live:** one required checkbox on the Tempus application's
  declarations page was an empty ☐ on 2026-09-17 — his to tick — then send the print score
  + the application. **Deadline 2026-10-15 23:59 CET.** *(Carried here only as a reminder;
  the record is #5's journal §2.)*
- **Read the LGMF 2026 call** — when he chooses (Q2). Drop the PDF in `docs/` as in #5.
- **Name the percussion instruments** — bowed vibraphone is the first (LG-9).
- **Install the english horn library** (arriving 2026-09-17) and tell the AI which one it is.
- **Acquire a bowed vibraphone library.**
