> **Provenance (septet LGMF 2026, 2026-09-17):** copied from piece #5 `septet_2026/docs/HOW_WE_WORK.md` with everything the Tempus septet added (THE RHYTHM, the planning method, the panel idiom, one round per sitting). One change: the **Pushes** paragraph. Section numbers cited as `RUNNING_LOG §N` are the TEMPUS lab journal's. Lineage: piece #3's card → #4 unchanged → #5 → here. `AI_METHODOLOGY.md` wins where they conflict.

# How We Work — Reference Card

> Cheat sheet for piece #3. Adapted from piece #2's version, trimmed to what carries forward.
> Piece-2-specific machinery (servers/ports, glyph registry, notation workflows) stays in that
> repo; equivalents get added here only when the corresponding system exists in this repo.

---

## Session routines

| Routine | When | How |
|---|---|---|
| **Session Start** | Beginning of every work session | `/session-start` |
| **Session End** | Done for the day | `/session-end` |
| **Pre-compaction checkpoint** | Context running low mid-session, or say *"checkpoint"* | see `SESSION_PROTOCOL.md` |

Canonical procedures: `docs/SESSION_PROTOCOL.md`. The journal remembers so you don't have to.

**THE RHYTHM (standing, restored 2026-09-10 — CLAUDE.md § THE RHYTHM):** at every juncture the AI
states the next 2–4 steps with **model + clear** per step and announces switch/clear points without
being asked; the running thread is journal §2 → **NEXT STEPS · MODEL · CLEAR**. The rules for the
recommendation, and the Fable-credit rules that go with them (fewest round trips · no screenshots
unless they are the proof · never a subagent on Fable · wrap on Opus · a lean `Resume reads`), are in
CLAUDE.md and `docs/SESSION_HYGIENE.md` § Model strategy.

---

## The plan (`docs/PLAN.md`)

The single living plan. Stable IDs (`1c` stays `1c` forever), statuses, one-line whys.

**Building a plan item, or analyzing an issue that ends up in the plan: `docs/PLANNING_METHOD.md`** (2026-09-06) — state and
restate until the understanding is shared · the top line · one step at a time: the goal, then the sub-steps, then into the plan.

**Talk to it in plain language:**
- *"show me the plan for 1"* · *"what's left in 0?"*
- *"what did we decide about X, and why?"* (→ journal §4)
- *"mark 1b done"* · *"move 1c after 1d"* · *"drop 2a"* · *"defer 3b"*
- *"break 1e down further"* — expands sub-steps in place

---

## Working Style

> User preferences, not iron rules — if one blocks the work, **surface it for discussion**
> rather than silently routing around it. The list is expected to evolve.

**Cadence**
- **Conceptual proposal before any code edit.** Describe in plain language what would change and why; wait for approval.
- **Discuss chunks, not individual files.** Once a chunk is approved, execute without re-asking per file; narrate briefly so the user can interrupt.
- **Wrap each chunk before moving on:** update docs (plan statuses, journal), commit if a natural checkpoint, report what actually happened vs proposed, propose the next chunk.
- **Piecemeal by design.** One thing at a time; don't chase the perfect architecture. Shore up as we go.

**Reading & analysis (this piece's addition)**
- **Orient from docs, never by scanning the codebase.** Name the specific question first, then read only what answers it.
- **High bar for subagents / background processes.** Default to doing the work directly; one fast targeted command beats an exhaustive audit.
- Prior repos are reference material, consulted per named question only.
- **Go/no-go before ANY time-consuming process** — disk searches, large codebase reads, extensive web research, long analyses. State conceptually what's needed and pause; the composer either supplies the shortcut (a path, a doc, an answer) or says *"go."* Single targeted checks of known things are always free. *(Added 2026-08-01; generalized from the disk-search case, where AI drive-crawled for libraries the composer could have pointed to instantly.)*
- **Cite IDs with names, never bare.** Decision and plan IDs in chat always carry their short name: *"D6 (Reaper session storage & backups)"*, *"S3 (MIDI out)"* — a bare "D6" forces the composer to look it up. *(Added 2026-08-01.)*

**Language**
- Plain, conversational language first; file paths and code references as anchors, not substance.
- *"Tell me in plain language"* / *"tighten it"* = calibration, not failure.

**Choices**
- **Plain-text lettered options in the message body — never a multiple-choice UI picker.** Reasoning visible next to the options. Wait for a free-text reply.

**Commits**
- Commit at the natural wrap of an approved chunk, or when asked. Never speculatively.
- Reference active plan IDs (e.g. `1c`) and decision IDs (e.g. `D2`) in messages.

**Pushes**
- ~~**AI never pushes automatically.**~~ **Superseded in this repo by D5 (composer 2026-09-17): push automatically after every commit, explicit paths only** — the rule of pieces #4 (D30) and #5 (D8), adopted here at his word. *(Inherited text: after commits, surface the unpushed count; at Session End, always ask "push now?".)*

**Before building anything new — quick pre-check**
1. What exists? 2. What changes? 3. What could break? 4. How do we verify?

**A panel borrows the score's idiom (composer, 2026-09-07 — RUNNING_LOG §182–183; the beating drawer's lesson)**
- Anything a panel needs that the score already has — curves with slope handles, zones on tracks that drag and stretch, takes, seeds,
  SPACE playing what is looked at — the panel takes AS IS, the score's behaviour and its look. No panel-only invention of the same thing.
- **A tool is planned against how the composer WORKS, not against a feature list:** before a build, his walk-through in his own words
  (first click to the result in the score) is written back as a numbered script, each line marked works · awkward · missing; the
  misses are built in ONE pass on a copy and verified by walking the script with real events; he tests once against the same script.
  The script is the unit, not the ticket (strategy A, §183).
- **His ear early:** the smallest thing that sounds comes first and is heard before the rest is built.

**Small issues, one round per sitting (composer, 2026-09-07 night — "this working process is not working … several hours … to get this
one thing right"; RUNNING_LOG §188)**
- He collects what he sees — a screenshot and one line each — and sends them together; the fix comes back as ONE commit with a
  walk of every item, not a fix per message.
- A gesture is tested as a real mouse sequence (mousedown · move · up; click then double-click, with the re-render between them),
  never only as a state call — the double-click that never fired was invisible to a state test.
- Anything that is a MODEL (how a lane, a region, a node behaves), not a control, is stated in one line and agreed before it is built;
  a control is just built.
- The tool carries its own memory of what is taken (a gesture card); the AI never asks him to remember a modifier.
- **Save, don't build (composer, 2026-09-07 night — "save all unless I say otherwise"):** a remark about the drawer is saved — the
  request in NITS, his words in MORPH_NOTES §3 — and built only when he says so; what he marks "fix now" is fixed now.
- **The takes and the ACTUALs are committed at every wrap (composer, 2026-09-07 late — "yes pls"; RUNNING_LOG §209):** `bank/panel_snapshots.json`
  and `bank/actuals/*.json` are the AI's to stage and commit at each wrap and whenever he asks — they are data with provenance, as the
  tuba piece kept them. **The SCORE files too, from 2026-09-07 late (§216):** the piece file and the named versions are committed at every wrap
  by NAMING §1's rule (no audio inside; 26 versions = 7 MB); the working copies never. Only what he NAMES is his: the versions' labels, the takes' names.

---

## If it feels like we lost the thread

1. **Correct + cite:** "We decided X — check journal §4, D-N."
2. **Re-read:** "Re-read §2 — we covered this."
3. **Override:** "The plan is X. Don't re-derive."

The journal is the recovery anchor. If a decision matters enough to survive context loss, it belongs in §2 or §4 *at the moment it's made*.

---

## You don't need to worry about…

- Forgetting the plan or its motivations — `PLAN.md` keeps both, per item.
- Forgetting decisions — journal §4, with the why and the rejected alternatives.
- Forgetting your own to-dos — journal §7, reviewed at session end.
- Losing context between sessions — §2 Resume Here, updated every session end.
- The AI not knowing what's going on — it reads the plan + journal at session start, not the codebase.
