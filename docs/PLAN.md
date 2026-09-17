# PLAN — septet LGMF 2026

> **Rules:** IDs are stable — never renumber, only append. Status: `todo` / `doing` /
> `done` / `deferred` / `dropped`. Position = order. Every item keeps a one-line ***why***.
> Same conventions as pieces #3, #4 and #5.
>
> **How an item gets its sub-steps:** `docs/PLANNING_METHOD.md` — with the composer, one
> step at a time: the goal, then the sub-steps, then written here at once. An item he has
> not yet discussed carries one line: *to be laid out when we discuss it.* The phase-0 IDs
> below mirror piece #5's on purpose, so its record (`septet_2026/docs/PLAN.md` § 0 and
> `RUNNING_LOG.md` §1–§63) reads as the precedent item by item.

## The piece in one line

English horn + bassoon · horn + trumpet · cello + double bass · percussion — three pairs
and a percussionist (D1), for the Lake George Music Festival 2026 call. Animated score, the
format of pieces #4 and #5 (D2). Delicate and quiet; a rondo whose refrain is a morph
(COMPOSITION_NOTES LG-1 … LG-8).

## The timeline that binds everything

| | |
|---|---|
| 2026-09-17 | project opened, kit installed (0a) |
| **unknown** | **the call's deadline, duration limit and score format — not read yet, at his word (journal Q2).** This table is filled in the day the call is read. |

---

## 0. Setup — `doing`

- **0a — PM kit** — `done 2026-09-17` *(RUNNING_LOG §6)* — CLAUDE.md · README · journal ·
  plan · planner · RUNNING_LOG (lab journal) · COMPOSITION_NOTES (sketch pad, opened with
  LG-1 … LG-8) · NITS · AI_METHODOLOGY + SESSION_HYGIENE + PLANNING_METHOD + MORPH_NOTES
  (copied whole from #5) · HOW_WE_WORK + SESSION_PROTOCOL (from #5, the push lines adapted)
  · checkpoint/postclear commands · .gitignore · .gitattributes.
  *Why:* the session skills are wired to it; decisions survive clears from minute one; and
  the standing rules arrive whole this time (the #4 → #5 port dropped THE RHYTHM).

- **0b — Composer module port, from piece #5** — `todo` — *to be laid out when we discuss it.*
  The precedent: #5's 0b (byte-exact copy → one patch script that asserts every match count
  before it writes → verified in the running app). **What differs this time:** the source is
  already seven instrument-keyed lanes + META, so the lane count does not change — the
  palette does (six of seven instruments are new), and piece #5 ADDED tools to the app that
  #4 never had (the strikes drawer, the trills tool, the beating panel, the crescendo suite,
  `time_containers.js`, the note card) — each is a carry / leave decision.
  *Why:* the app is the composing surface from day one; he will use the same structures.

- **0c — Instrument recipes (`sandbox/instruments.js`)** — `todo` — *to be laid out when we
  discuss it.* One entry per track. **Only the cello carries over from #5.** English horn,
  bassoon, horn, trumpet, double bass and percussion are new: which library for each is
  journal Q1b; the percussion instruments themselves are his to name.
  *Why:* the recipes ARE how the AI and the app produce the right MIDI for each sound.

- **0d — The samples' true ranges and lengths, per technique in use** — `todo` — *to be laid
  out when we discuss it.* *Why:* a range or a length read from a manual was wrong often
  enough in #5 to be measured instead.

- **0e — loopMIDI + Reaper rack** — `todo` — *to be laid out when we discuss it.* A new rack
  for seven new tracks. The Reaper bridge from #5's 0k was built machine-level "for the next
  piece" — this is that piece. *Why:* nothing sounds without it.

- **0f — The AI's MIDI generation path** — `todo` — *to be laid out when we discuss it.*
  *Why:* the AI must be able to make the right MIDI for every instrument, live and offline.

- **0g — Notation/IR infrastructure carried over now, adapted later** — `todo` — *to be laid
  out when we discuss it.* The precedent: #5's 0g (97 files byte-exact, proven by their own
  batteries). **What differs:** #5's engine already does seven parts, several clefs, A3 print
  and video — this piece inherits that, and its adaptation list is about NEW instruments
  (transposing horn, trumpet and english horn · percussion staves · double bass) rather than
  about leaving the tuba behind. *Why:* copying costs nothing now; adapting waits for real
  material.

- **0h — Gate: phase 0 closed** — `todo` — every track sounds from the score app through its
  own port with the right technique switching; a save round-trips; 0i's extraction passes;
  RUNNING_LOG has the numbers. *Why:* one verified gate instead of seven confidence claims.

- **0i — The save → IR contract, proved on a test save of this piece** — `todo` — *to be laid
  out when we discuss it.* *Why:* the IR is derived from the save, so the save's shape is the
  only thing that can bite later (#5's D9).

*(#5's 0j ensemble balance and 0k the Reaper bridge were added as the need appeared. They
are not pre-listed here; they enter when this piece asks for them, with the next free ID.)*

## 1. Compose — `todo`

*To be laid out when we discuss it.* Tools built per need (the #3/#4/#5 way). Already named
in the sketch pad as wanted tools: the multitempo / phase machinery abstracted, with figures
per beat (LG-5) · the pattern tool with thinning algorithms, weighting, harmony on a clock
and codified harmony transitions (LG-7) · the morph that arrives at a beating and holds
(LG-8; MORPH_NOTES §3, 2026-09-14) · animated conductions (LG-3).

## 2. Notate — `todo`

*To be laid out when we discuss it.* 2a engine adaptation · 2b presentation score (video +
print) — #5's shape.

## 3. Performance score — `todo`

*To be laid out when we discuss it.* Piece #5's own PLAN 3 is not built yet (its N6); this
item follows whatever that produces.

## 4. Submission package — `todo`

*To be laid out when the call is read.*
