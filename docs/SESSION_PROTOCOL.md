> **Provenance (septet LGMF 2026, 2026-09-17):** copied from piece #5 `septet_2026/docs/SESSION_PROTOCOL.md` (lineage: piece #3 → #5 → here). Two changes: Session End step 6 — the push line cites this repo's D5, and the `unsaved_check` step waits for the tool to arrive with PLAN 0b. The journal here has the same seven sections.

# Session Protocol

> Canonical Session Start / Session End procedures for this repo.
> Invoked via `/session-start` and `/session-end`; tool-agnostic — any AI can follow this file.
> Adapted from piece #2's protocol, trimmed; notation-system-specific steps removed
> (they return if/when equivalent systems exist here).

---

## Session Start

1. **Read `docs/HOW_WE_WORK.md`** (if not already loaded this session) — especially **Working Style**.
2. **Read `docs/PLAN.md`** — the living plan; note what's `doing`.
3. **Read `docs/PROJECT_JOURNAL.md`** — focus §2 Resume Here (including any **Open at session end** entries) and §7 Human Notes.
4. Present to the user, briefly:
   - **Last session:** what was done (with AI-tool attribution per the journal)
   - **Next up:** what was planned
   - **Open at session end:** in-flight findings from the previous session, if any
   - **Open questions / Blockers**
   - **Your notes:** active §7 items
5. Ask: *"What would you like to work on today?"*
6. **Propose a session agenda:** 2–3 concrete deliverables with "done" criteria; get approval. Mid-session surprises get named as a 5-minute detour or deferred explicitly.
7. Begin work.

**Do not read the codebase during Session Start.** Orientation comes from the three docs above; code gets read when a named task requires it.

### Rules during work

- **One mode of work at a time.** Finish or explicitly pause before switching.
- **Capture critical decisions immediately.** Test: *"If forgotten in 20 minutes, would the AI contradict this?"* If yes → one-line bullet in journal §2 now (promoted to §4 at session end). If no → defer to session end.
- **Keep PLAN.md current as statuses change** — marking `1b` `done` happens when it's done, not at session end.
- **Surface friction with the working style** rather than silently routing around it.
- Quick pre-check before building anything new: what exists / what changes / what could break / how do we verify.

---

## Pre-Compaction Checkpoint

> Invoke when context is running low (~25% remaining), before any large context-burning operation, or when the user says *"checkpoint"*. Purpose: move everything important from chat-state to durable state before context dies. A save-point, not a closure — skip all wrap-up steps.

1. **Doc-currency sweep.** Anything decided this session still floating in chat only? → journal §2/§4, PLAN.md statuses, now.
2. **Commit the working tree.** Message captures intent (*"session N mid: [task] — [state]"*). Never skip — uncommitted work + dead context is unrecoverable.
3. **Journal §2 checkpoint entry.** Under **Open at session end**: current task + state · latest deliverable · next concrete step · pending decisions. Mark `(mid-session checkpoint)`.
4. **Optional push** — ask; declining is fine, Session End asks again.

---

## Session End

1. **Summarize** the session (3–5 bullets), noting which AI tool drove it.
2. **Ask:** *"Any lessons learned or gotchas to capture?"* → §3 Principles (general) or the relevant §5 Playbook → Gotchas (mode-specific).
3. **Update journal §2 Resume Here:**
   - **Last session:** date + tool + 3–5 bullets (what was built/decided, not implementation detail)
   - **Next up** · **Open at session end** (in-flight findings, written for the next AI cold; empty is fine) · **Open questions** · **Blockers**
   - **Trim:** compress older sessions to one line each; §2 target ~40 lines.
4. **Promote & sync:** mid-session decisions from §2 → **§4 Decisions** (with why + rejected); **PLAN.md** statuses current, new items added with IDs and whys; **§6 Done** if a milestone shipped; **§5 Playbooks** if process steps/gotchas emerged.
5. **Review §7 Human Notes with the user:** add / update / mark complete.
6. **Unsaved edits first (#5's D17):** `node tools/unsaved_check.js` — a working copy that holds edits its file does not is the composer's to Save or Reload in the app before anything is committed. *(The tool arrives with PLAN 0b; skip this step until it exists.)* Then **commit** (stage explicit paths — never `git add -A` — with a descriptive message referencing plan IDs), then **push** — this repo pushes after every commit (D5, composer 2026-09-17; the inherited "ask push now?" is superseded). Show `git log origin/main..HEAD --oneline` if anything was left unpushed.
7. **If a milestone completed:** suggest a git tag.

### What makes a good §2 update

- Written for an AI that has never seen this conversation (possibly a different tool).
- Specific enough to resume without re-reading chat history.
- Includes decisions discussed but not yet formalized, and the state of partially-complete work.
- Tags attribution: `(session N, Claude Code)` etc.
