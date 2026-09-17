> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/NOTATION_IDENTITY.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated.

# Notation identity — the contract (PLAN 2d.1)

*Written 2026-09-11 (RUNNING_LOG §391). The rule that the sidecar (2d.2), the refresh (2d.3) and the orphan list (2d.4)
stand on. The test: `node tools/test_identity.js`.*

---

## The rule

1. **A note's id is assigned once, when the note is made, and never changes.** `wc-N`, from the composer's one counter
   `nextId` (`composer.html` `generateId`). Every object type shares that counter (`wc` · `mk` · `lw` · `zn` · `cd` · `mo` · `cm`).
2. **An id is never reused.** The counter only grows — through undo, redo, Reload, and a load whose `nextId` is missing or
   behind (NAMING.md §1 rule 4). A gap is harmless. A reused id is not: a choice made on the old note would land on the
   new one, silently.
3. **The IR event id is `ev-` + the note id.** `extract_core.js` writes `id: 'ev-' + o.id`; `tools/ir_validate.js` refuses
   anything else. One note, one event — a chord is several events in one chunk, each note keeping its own id.
4. **A notation choice targets the SET of note ids it applies to — never a chunk id.** A chunk is named after its earliest
   note (`ch-<part>-wc-N`); move that note and the chunk renames. (PLAN 2d.1, decision B.)

---

## Which edits keep the id

The same object, changed in place. Read from the code 2026-09-11 (2d.1.2).

| Edit | Where |
|---|---|
| note card: voice · pitch (and ▲▼) · dynamic / level · start · length | `note_card.js` `commit(fn)` — every field goes through it, on `this.wc` |
| a note moved to another part — the note card's **part** (PLAN 2d.5), `moveNote()`, the properties panel's `layer` field | `note_card.js` `moveToPart` · `composer.html` `obj.layer = newLayer` |
| *(correction, 2d.5.1, 2026-09-11: the lane DRAG does not move a note between lanes — every sonified note is a "grain", and grains move in time only)* | `composer.html` `startWCBodyDrag` |
| undo / redo | the notes come back from the snapshot with their own ids |
| Save · Name version · Reload · the working copy (D17) | objects are written and read as they are |

## Which edits make a new id

A new object. Any choice on the old note orphans — loudly, never dropped (2d.4).

| Edit | Where |
|---|---|
| duplicate — CTRL+drag, and the card's `duplicate` | `duplicateNote` → `generateId('wc')` |
| delete, then draw again | a new object |
| a passage inserted | `passages.js` `unpack` — `generateId` per object |
| a crescendo made from a note (the original greyed, `mutedBy`) | `createCrescendo` |
| every generator: strikes drawer · chordRun · crescRun · fill · swell · beating · morph / texture / piano cues / harmonics apply | `nextId++` per object |
| a group regenerated (a morph or texture re-applied) | its old notes go, new ones come |
| the ladder (`compiler.js` `generateLadder`) | writes NEW scores from 1 — never an existing one |

---

## Found and fixed by 2d.1

- **Undo and redo put the counter back** (`nextId = prev.nextId`). After an undo, the next note drawn could take the id of a
  note that had already been saved. Now `Math.max` — the counter never goes back.
- **A load trusted `nextId || 1`.** A save with no counter, or one behind its ids, would re-issue ids already in the score.
  Now floored at the highest id in the score + 1 (`maxIdNumber`).
- Measured before the fix: no score in `scores/` had a duplicate id or a counter behind its ids. Both were latent.

## Where this is enforced

- `tools/test_identity.js` — the contract, in seconds: the minting, undo, the load floor, duplicate, and re-extraction.
- `tools/ir_validate.js` — `ev-` + object id, and no duplicate ids in an IR.
