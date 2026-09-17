# bank/passages — the passage collection

A **passage** is a captured stretch of score, insertable at the playhead into any score
(composer 2026-09-10, RUNNING_LOG §360–361). One JSON file per passage; the composer
names them, the app writes them, git keeps them.

**They live here and not under `scores/` on purpose.** His condition was *"once I put one
that's committed, it's put into the committed files"* — and `.gitignore` excludes
`scores/*-work.json` and `scores/versions/`, while `bank/` is committed whole.

**What a file holds:** `name` · `capturedAt` · `capturedFrom` (the score it came out of) ·
`span` in seconds · `lanes` · `objects`. Every object is stored exactly as the score holds
it, with three substitutions and nothing else: `id` → `o<n>`, `groupId` → `g<n>`, and the
times made relative to the passage start. Nothing in a file refers to the score it came
from, so a passage is portable between scores and between machines.

**The guarantee is tested, not asserted:** `node tools/passage_roundtrip.js [score]` captures
a real score, inserts it at an awkward offset into an empty one, and diffs the result against
the original field by field at any depth — then does it twice over to prove two copies in one
score share no id and no group. It runs the app's own pack/unpack, not a copy of them.
