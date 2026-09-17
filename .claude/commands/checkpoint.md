---
description: Save-point before clearing mid-chunk — commit, capture state, keep the same task alive across the clear
---

# Checkpoint (preclear)

*(Inherited from piece #4 by way of piece #5, 2026-09-17; the push line follows this repo's policy.)*

**Use when the work is NOT finished but the chat is.** Context running low, a large
context-burning operation coming, a Fable block about to start, or you simply want to
clear and keep going on the same thing. This is a **save-point, not a closure** — skip
every Session End wrap-up step (no lessons-learned pass, no promotion to §4, no §7
review, no tag).

**If the chunk is actually done — the subject is about to change — run `/session-end`
instead.** See `docs/SESSION_HYGIENE.md` § The two boundaries.

**The economics this serves: spend tokens on the DYING session, save them on the FRESH
one.** If the next block is Fable and you are not already on Opus, run this wrap on Opus,
then `/clear`, switch to Fable, `/postclear`.

Do these in order, then say plainly that it is safe to `/clear`.

1. **Doc sweep + NOW ►.** Anything decided this session that still lives only in chat →
   `docs/PROJECT_JOURNAL.md` §2 (or §4 if it is a real decision), `docs/PLAN.md` statuses,
   `docs/RUNNING_LOG.md` (the lab journal — it should already be current, the standing
   rule), `docs/COMPOSITION_NOTES.md` (any musical idea voiced). Then refresh
   `docs/PLANNER.md`'s **`NOW ►`** line — one line: where the piece stands and what is
   immediately next.

2. **Write the §2 checkpoint entry**, under **Open at session end**, marked
   `(mid-session checkpoint)`. Written for an AI that has never seen this conversation:
   - the current task and its state
   - the latest deliverable, by name/path
   - **the next concrete step, phrased as an instruction**
   - **`Resume reads:` — the exact docs/sections the next session must read beyond
     journal §2** (or `Resume reads: nothing beyond §2`). **Name what the NEXT STEP
     needs, not what this session wrote** — every line on the list is re-read in every
     turn of the session that follows, and on Fable that lands on the allotment he
     watches (2026-09-10). A session resuming to "wait for his ear" needs almost nothing;
     the history is in RUNNING_LOG and stays there until a question sends someone to it.
   - decisions pending the composer
   - **the deliberately-uncommitted list:** run `git status --short` and name every
     untracked or modified path being left alone **and why** — composer scores mid-edit,
     Reaper saves, loose files at a folder root.

3. **Commit + push.** Stage **explicit paths only, never `git add -A`**. Message captures
   intent: `session N mid: [task] — [state]`. Never skip the commit: uncommitted work plus
   a dead context is unrecoverable. **Push follows the commit automatically** (D5).

4. **Say it plainly:** what was committed, what was left, that it is safe to `/clear` and
   then `/postclear` — and **which model to resume on** (THE RHYTHM, CLAUDE.md).
