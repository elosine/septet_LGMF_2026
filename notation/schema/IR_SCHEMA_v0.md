# NOTATION IR — SCHEMA v0

> **Status: A2 draft, 2026-08-19 (Phase A step 2).** The stratum-3 notation
> IR as data (NOTATION_ARCHITECTURE.md §1 S3, amendments 1–2). **v0 is meant
> to be broken by A3–A5** — three chunks worked BY HAND from real piece data
> (trance bar · morph window · density apex) before any extractor code;
> schema flaws found by hand are cheap, by code expensive. Version bumps by
> amendment; IDs stable, never renumbered.
>
> Machine contract: `ir_v0.schema.json` (same directory). Validator:
> `tools/ir_validate.js` (schema + referential integrity + against-source).

## 1. The two technical picks (decision §8 rows 5–6, resolved here)

**Locations & naming** — notation is a stratum, so it gets its own root:

```
notation/
  schema/     IR_SCHEMA_v0.md · ir_v0.schema.json · examples/
  ir/         one JSON per worked span: <slug>.ir.json  (A3: trance-bar-01.ir.json)
  registry/   classes.json (A1 §2 entry shape) · accommodations.json (A1 §3 bucket)
```

S1 stays `scores/` · S2 stays `analysis/` (+ `bank/` tables) · S4 code comes
with slice 1. *Rejected:* filing under `docs/plans/` (this is data, not a
plan) and under `bank/` (banked material is compositional, not notational).

**Identity** — three rules:

1. Every IR node has a string `id`, unique within its file; global reference
   is `<file-slug>#<id>`.
2. **Derived node ids are deterministic functions of their source ids** —
   an event extracted 1:1 from S1 object `wc-4386` is ALWAYS `ev-wc-4386`,
   in every regeneration. This is what makes the amendment-1 survival law
   mechanical: authored overlays re-attach by id, and the id cannot drift.
   **Derived CHUNKS too**: a derived chunk's id is
   `ch-<part>-<sourceObjectId of its earliest member event>` (e.g.
   `ch-4-wc-4386`). If regeneration moves a chunk's start, its id CHANGES —
   so an authored strategy overlay targeting the old chunk **orphans
   loudly** instead of silently re-binding to the wrong chunk. Enforced by
   the validator for both.
3. Nodes with no single source (authored events, aggregates) get hand ids
   (`ev-a-001`); once assigned, never renumbered.

**The vertical-unit question EXITS A2.** The IR is semantic: it contains no
layout units of any kind — no staff-spaces, no lane fractions, and (per the
coordinate contract) a pixel anywhere in an IR file is a bug the validator
rejects. Positions here are TIME (seconds; optional metric) and PITCH
(semantic). The staff-space-vs-lane-fraction choice belongs to the
coordinate module and is made when that module is built (slice 1).

## 2. Design laws (from the architecture doc; enforced by the validator)

- **Reference, don't copy, the continuous.** Envelopes, bends, curve shapes
  stay in S1; the IR points at them (`source`). A second copy could only
  drift (D33's corollary). The IR copies ONLY the minimal sounding facts it
  notates — onset, duration, pitch, technique — and the validator's
  `--against-source` mode asserts the copies still match the source score
  (Principle 5: two ends checked against each other, not against a shared
  helper). Checked: onset, pitch, technique, and part-vs-source-layer.
  **Duration is exempt by design**: one-shots carry sample-true length,
  which diverges from the drawn block (D9).
- **Provenance kinds on every fact** (amendment 1), split by node kind:
  structural nodes (events, chunks, groups, devices) are `derived` or
  `authored`; **overrides live ONLY in overlays** (`authored` /
  `authored-override`, the latter with `contradicts` recording what the S1
  evidence suggested — overlays are the authored channel, so an override is
  always an overlay, never an edit to a derived node). Corollary: **derived
  MARKS are never stored** — a per-material rule's proposals are translator
  output, regenerated every run (P6); stored derived facts are limited to
  STRUCTURE (events, chunks, groups, metric, devices).
- **Overlays live apart from chunks.** All authored notational content sits
  in the `overlays` array, targeting nodes by id — so regeneration of
  derived content structurally cannot touch it. An overlay whose target no
  longer resolves is flagged `orphaned: true`, never dropped. **Flag
  ownership:** the future re-attachment maintenance pass sets and clears
  the flag; the validator is READ-ONLY — it errors on unresolved targets
  (unless flagged) and on stale flags (`orphaned: true` whose target
  resolves).
- **Concert pitch, spelled; transposition is a load-time rule** (M2). The
  IR stores concert `midi` + a concert `spelled` form; family adaptation
  re-derives spelling through a per-family rule at load. Nothing in the IR
  is pre-transposed. `alter` is a float — quartertones are `±0.5`.
- **Fixed one-shots carry their TRUE length** (D9): `duration` for
  staccato/fp/cuivre events is the sample-true sounding length, not the
  drawn block.
- **Every chunk has a `strategy`, and `unresolved` is a legal value.** An
  unresolved chunk renders as its class's graphic fallback (the parachute,
  A1 §6) — so a score ships at any moment, mixed-fidelity by construction.

## 3. Document shape

One IR document = one worked span of one or more parts:

```jsonc
{
  "irVersion": "0.1",
  "id": "trance-bar-01",                       // file slug
  "source": {                                   // the S1 window this document notates
    "score": "tranceA002f",                     // scores/<score>.json
    "window": [0.0, 4.8],                       // absolute seconds
    "parts": [4, 5]                             // S1 layer indices (players)
  },
  "provenance": { "createdBy": "hand",          // "hand" | tool name
                  "date": "2026-08-19",
                  "notes": "",
                  "build": "node tools/notate_section.js ..." },   // amendment 6: the command that made it (the decisions ARE the argv)
  "events":   [ /* §4 */ ],
  "chunks":   [ /* §5 */ ],
  "overlays": [ /* §6 */ ]
}
```

## 4. Events — the sounding facts being notated

```jsonc
{
  "id": "ev-wc-4386",                           // deterministic (rule §1.2)
  "source": { "score": "tranceA002f",           // omitted only on authored events
              "objectId": "wc-4386" },
  "onset": 0.0,                                 // absolute seconds (canonical clock)
  "duration": 0.42,                             // seconds; sample-true for one-shots (D9)
  "pitch": { "midi": 31,                        // concert
             "spelled": { "step": "G", "alter": 0, "octave": 1 } },
  "technique": "staccato",                      // S1 technique name
  "metric": { "chunk": "ch-4-wc-4386",          // optional: position(s) on the chunk grid
              "grid": [0] },
  "provenance": "derived"                       // derived | authored (overrides = overlays)
}
```

- `spelled` is S3 content (a decision). v0 default: derived by a naive rule
  (sharps ascending, flats descending — placeholder), overridable per event
  by a `spelling` overlay. Real spelling rules are per-material, harvested.
- Sustained/continuous events (ord with envelope, morph notes): same shape;
  the envelope and any `morphBend` are NOT copied — display and audio read
  them from S1 via `source`, through the optional per-material transform
  slot (amendment 2).

**Amendment 8 — trill events (septet PLAN 2f.3, 2026-09-13; RUNNING_LOG §437).** With the extractor's
`options.trills` (`notate_section --trills`), a composer-score trill ZONE (`type: 'zone'`,
`midiModel: 'trill'`) becomes an event whose `source.objectId` is the zone — the one sounding event
that does not source a waveCurve:

```jsonc
{
  "id": "ev-zn-953", "source": { "score": "piece-septet", "objectId": "zn-953" },
  "onset": 63.72, "duration": 1.73,             // the zone's startTime, endTime − startTime
  "pitch": { "midi": 36, "spelled": { "step": "C", "alter": 0, "octave": 2 } },   // trill.pitch
  "technique": "main", "provenance": "derived",
  "env": "trill",
  "trill": { "interval": 2,                     // trill.interval — the upper neighbour (1 semitone, 2 whole tone)
             "neighbour": { "midi": 38, "spelled": { "step": "D", "alter": 0, "octave": 2 } },  // the next letter up
             "curve": "auto:A" },               // the reference its level was read from
  "level": { "samples": [1, 1, ...] }           // 101 samples over the span — composer.html's own curve math
}
```

A note stamped `mutedBy` (eaten by a trill in the same score) is NOT extracted when trills are: its attack is the
trill's. Each trill is its own chunk, class `trill` (registry), strategy `unresolved`, never part of a chord. The
validator checks a trill event against its zone (onset, span, pitch, interval, technique, part), and `--complete` on
a document holding trills requires every trill zone in window × parts and excuses the notes they ate. Without the
option nothing changes: the extraction is byte-identical (8 runs, septet and tuba scores, both profiles). The sounding
neighbour is stored; the WRITTEN neighbour (a transposing part) is the layout's to spell from the written main note.

## 5. Chunks — the atom of the strip

A chunk is a contiguous span of ONE part with a class and a strategy
(the M5 grouping-that-behaves-together, generalized: a morph window or a
swell is also a chunk — one without a tempo).

```jsonc
{
  "id": "ch-4-wc-4386",                         // deterministic (rule §1.2)
  "part": 4,
  "span": [0.0, 1.9],                           // absolute seconds
  "class": "trance-stream",                     // MUST exist in registry/classes.json
  "strategy": "simple-bar",                     // simple-bar | tuplet-bar | proportional
                                                //  | device | fallback | unresolved
  "tempo": {                                    // OPTIONAL — the two-clocks mapping
    "anchorSeconds": 0.0,                       //  re-anchor point (the GC's job, D43)
    "unitSeconds": 0.31520,                     //  the grid unit — REPORT UNITS (D43 iii)
    "beatSeconds": 0.31520,                     //  the counted beat
    "subdivision": 1,                           //  units per beat (integer); beatSeconds
                                                //   = subdivision × unitSeconds, checked
    "maxErrSeconds": 0.0062,                    //  worst onset error of the fit (E1)
    "label": "8ths @ 190"                       //  human label; never load-bearing
  },
  "events": ["ev-wc-4386", "ev-wc-4387"],       // refs into events[]
  "groups": [                                   // perceptual grouping (Mists baseline)
    { "id": "bg-1", "kind": "beam",
      "events": ["ev-wc-4386", "ev-wc-4387"],
      "provenance": "derived" }
  ],
  "devices": [                                  // S4 device instances anchored here
    { "id": "dev-1", "kind": "gc",
      "mode": "landing", "at": 0.0,             //  "at" = absolute seconds, within span
      "provenance": "derived" }
  ],
  "provenance": "derived"
}
```

**Exclusivity (validator-enforced):** an event belongs to at most ONE chunk,
and same-part chunk spans are disjoint — the chunk is the atom of the strip,
so double membership would notate a note twice.

**A3 amendments (2026-08-19, found by hand-working `trance-bar-01`):**
- **A chunk's span is ONSET OWNERSHIP, not sounding time.** Disjointness
  applies to onsets only; sounding overlap across a boundary is legal and
  expected — in the real seam, the octave-figure's last B1 (sample-true
  0.37 s, D9) is still ringing when the BASE stream starts 0.136 s later.
- **Boundary convention for adjacent same-part chunks:** the boundary sits
  at the NEXT chunk's first onset (span half-open `[start, next-start)`),
  so every instant belongs to exactly one chunk and no gap needs inventing.

**Tempo grain is the finest (per chunk), by design** — per-part or shared
tempi are then special cases (equal maps across chunks/parts), so the open
musical choice (§8 row 8) forks nothing here.

**E1 fold-in mapping** (`analysis/e1/*.e1.json` chunk record → IR chunk):

| E1 field | IR |
|---|---|
| `part` ("tuba9") | `part` = index of the track whose id matches in `score.tracks` — resolved by lookup, NEVER by parsing the numeral (`tuba9` is layer **8**) |
| `t0` | `tempo.anchorSeconds` (+ `span[0]`) |
| `uMs / 1000` | `tempo.unitSeconds` |
| `beat` | `tempo.beatSeconds` |
| `pq` | `tempo.subdivision` = **p** of p:q (p/q units per beat generally; integer only while q = 1 — every free-beat fullVocab fit is p:1; see §7's queued `subdivisionDen`); exact, unlike float recovery from `beat/uMs` |
| `cls` | strategy **DEFAULT PROPOSAL ONLY**: `binary`/`compound` → `simple-bar` · `tuplet-per-beat` → `tuplet-bar` — **overridden by the playable-floor judgment (D43)**: a fit whose unit sits below ~90 ms carries its tempo as FIT DATA with strategy `proportional` (A5, `density-apex-01`, is the worked case). The fit is data; the strategy is a judgment. |
| `ns[]` | each event's `metric.grid` |
| `maxErrMs / 1000` | `tempo.maxErrSeconds`; the tool + ε go in the document's `provenance` |

Fold-in rules: an IR document folds **exactly one ε variant** of the E1
record (name it in the document's provenance — `tool` or `notes`); only
`fullVocab` variants carry chunk lists — the others store bare counts and
are not foldable.

## 6. Overlays — the authored channel

```jsonc
{
  "id": "ov-001",
  "kind": "dynamic",                            // dynamic | articulation | instruction
                                                //  | spelling | grouping | strategy
  "target": { "event": "ev-wc-4386" },          // or { "chunk": "ch-4-wc-4386" }
                                                // or { "part": 4, "span": [t0, t1] }
                                                // or { "parts": [0,1,2], "span": [t0, t1] }
                                                //    (multi-part span — gesture-wide
                                                //     instructions; all real groupIds
                                                //     span multiple parts)
                                                // or { "span": [t0, t1] } = ALL
                                                //    source.parts in that window
  "value": "p",                                 // vocabulary is per-material (amendment 1)
  "provenance": "authored",                     // or "authored-override"
  "contradicts": null,                          // authored-override: what S1 suggested
  "orphaned": false                             // set/cleared by the re-attachment
                                                //  maintenance pass, never by hand;
                                                //  validator errors on stale flags
}
```

- `instruction` carries per-material verbal directives (*"crescendo in the
  beating"*) — amendment 2.
- A `strategy` overlay overrides a chunk's strategy — the composer's per-
  chunk call in D43's mixed strategy, expressed without editing derived
  data. Its `value` must be a member of the chunk strategy enum
  (validator-enforced; "vocabulary is per-material" covers marks, not
  strategies).

**Amendment 10 — the sequence device (LGMF PLAN 2d.1, 2026-09-25; RUNNING_LOG §382).** With
`notate_section --sequence <grp-seq-…>`, the notes the sequence drawer wrote in that group (`srcKind:
'sequence'`) are events of env `sequence` (the extractor's `options.sequences`, opt-in by group), and each
part's notes are ONE LINE — one `sequence` overlay per part, built by `notation/lib/sequence_overlays.js`:

```jsonc
{
  "id": "ov-seq-seq-smu90t537-p0", "kind": "sequence",
  "target": { "part": 0, "span": [0, 40] },       // the entry … the last release (or the window's end)
  "value": {
    "group": "grp-seq-smu90t537", "name": "LGMF-R01c",
    "scale": { "kind": "fixed", "steps": 8, "names": ["niente", "ppp", …, "fff"],
               "ladder": [43, 51, 59, 68, 80, 94, 109, 127], "instKey": "english_horn" },
    "entry": { "event": "ev-wc-3127", "t": 0, "release": 12.816, "technique": "senza_vel",
               "techText": "senza vib.", "range": ["pp", "mp"], "rangeText": "pp → mp",
               "midi": 80, "cents": 40.53, "centsText": "+41",
               "partial": 26, "fundamental": "C1", "fundamentalMidi": 24, "partialText": "26°/C1", "box": 1, "take": "Just-C1-seed90" },
    "level": { "sps": 100, "t0": 0, "t1": 40, "samples": [0, …] },   // the WRITTEN LEVEL on the fixed scale
    "breaths": [ { "event": "ev-wc-3140", "onset": 13.712, "release": 27.968, "pitch": "same", "midi": 80 },
                 { "event": "ev-wc-3156", "onset": 28.714, "release": 43.589, "pitch": "new", "midi": 79,
                   "cents": 1.96, "centsText": "+2", "partial": 12, "fundamental": "C2", "partialText": "12°/C2", … } ],
    "labels": [ { "t": 25.03, "mark": "mp", "kind": "crest", "level": 0.51 },
                { "t": 30.91, "mark": "pp", "kind": "trough", "level": 0.25 } ]
  },
  "provenance": "authored"
}
```

- **The fixed scale** (his decision, RUNNING_LOG §374 · §375): a sample is the written level — niente 0,
  ppp 1/8 … mp 4/8 … fff 8/8, linear in CC7 between two names through the part's own ladder (`DynTable.cc7`),
  under ppp linear to CC7 0. The CC7 is `composer.html heldCc7`'s rule (`cc7Abs` on the drawn height, `cc7Fade`
  multiplied in), taken before the fader's rounding; through a breath gap a linear bridge.
- **The breaths**: every note after the first; `same` = the same key and cents as the note before. The marks
  (cents, partial, fundamental) come from the save — the partial from the recipe's box
  (`databases.sequences[].recipe.containers[box − 1].chord[]` on the note's lane), the fundamental COMPUTED from
  the pitch and the partial and spelled from the take's name when it agrees.
- **The labels**: the level's turning points, each named by the nearest written name; one within 1 s of the
  previous label with the same name is dropped.
- Without `--sequence` nothing changes: the extraction is byte-identical (the save of 2026-09-25, all eight
  parts, trills on — HEAD's `extract_core` against the amended one).

## 6b. Choices — the notation app's sidecar (amendment 7; septet PLAN 2d.2, 2026-09-11)

The IR is derived and rebuilt at will (D9). A choice made ON THE PAGE — ink, not music: a beam, a forced clef, a break — must
survive every rebuild, so it lives beside the IR, not in it: `notation/choices/<score>.choices.json`, one file per score,
owned by the notation app. The extractor never reads or writes it; the composer score never holds it.

```jsonc
{
  "score": "piece-septet",                      // scores/<score>.json — the save the IR is derived from
  "version": 1,
  "nextId": 2,                                  // the next choice number (septet 2d.6): grows only, so a discarded id never returns
  "choices": [
    {
      "id": "c-1",                              // assigned by the app as "c-" + nextId; never reused in this file
      "kind": "beam",                           // beam — the only kind so far; others by amendment
      "target": { "notes": ["wc-1066", "wc-1070", "wc-1074", "wc-1080"] },
                                                // or { "part": 3, "span": [t0, t1] }
                                                // or { "span": [t0, t1] }
      "value": {},                              // per kind; beam: {} — the figure is the registry's
      "orphaned": false,                        // set/cleared by the refresh (2d.4), never by hand
      "note": ""                                // free text
    }
  ]
}
```

- **The target names the composer's NOTE ids (`wc-N`), not IR ids** — the one identity that survives a rebuild
  (`docs/NOTATION_IDENTITY.md`). A list of notes, never a chunk: a chunk is named after its earliest note and renames when it moves.
- **Three target forms, fixed now so the file never changes shape:** a list of notes — a set (beam · slur · tuplet bracket ·
  cluster grouping) or one note (spelling · stem direction · symbol variant · ottava) · `{part, span}` — a span in a part (clef
  change · ottava line · text) · `{span}` — a page place (system break · spacing).
- **Applied in memory, never merged into the IR file:** each choice becomes ordinary §6 `engraving` overlays on the IR the app
  loaded (`notation/lib/beam_choice.js`). Where no choice exists the engine's own result stands; an unknown kind is refused by the
  validator and drawn as nothing, never differently.
- **Resolution** (each time the IR is loaded): all notes present → applied · some → applied to those that remain (partial) ·
  none → orphaned: kept, listed, never dropped (#4's rule, §6) · a beam whose notes sit in two parts → refused, with the reason.
- **The `orphaned` flag** (septet PLAN 2d.4) is written by the app after R — a whole-score IR, so a missing note is really gone:
  set when none of the choice's notes is left, cleared when one is back (`BeamChoice.resolveFlags`); never at a plain load, where
  a window IR would read the notes outside it as lost. The bar's count and the O list read the report of every load; each line
  offers discard (the choice out of the file) and go there — never an id edit.
- **Validated by** `node tools/ir_validate.js notation/choices/<score>.choices.json [--against <file.ir.json>]`.

## 7. What v0 deliberately leaves out (A3–A5 decide if they force entry)

Ties/slurs across events · rests as first-class nodes (v0: rests are gaps —
verified sufficient on the real trance data: every layer-4/5 IOI is a
positive pulse multiple, zero overlaps) · single-part chords (zero
same-layer same-onset collisions in all three surveyed scores; enters by
amendment if material produces one) · multi-part chunks (v0: chunk = one
part; ensemble alignment lives in shared `anchorSeconds`) · release-device
notation (M3 — awaits the P3 session) · tremolo sine figures (2j — enter as
`devices` when notated) · page/system hints (layout strata, not IR). Each
enters by amendment when a hand-worked chunk actually needs it, not before.

**Not omissions — S1 read-through:** marker/label objects (rehearsal marks,
the trance pulse-count stream) and gesture labels (`groupId` +
`performanceNotes`) are S1 facts that renderers read directly from the
source score; they enter the IR only when a NOTATIONAL DECISION attaches to
them (reference-don't-copy, §2). A caution for A3: the classify layer must
still route them (registry classes `marker-label`, `grouped-gesture`), and
all 23 real groupIds span multiple parts — gesture-wide authored content
uses the `{parts, span}` overlay target.

**Vacuity note:** an empty document, or a chunk with zero events, validates
clean — `VALID` on a near-empty file certifies little; read the counts in
the success line.

**Queued amendment (A5 finding, not yet needed):** integer
`tempo.subdivision` cannot carry a p:q fit with q > 1 (beat/unit = 9/2 is
not an integer). Free-beat fullVocab fits only ever select p:1 (E1 finding
3), so every foldable chunk today fits — but E1b's fixed-beat records
(9:2, 7:2, 7:3, 8:3, 9:4, 5:2, on disk in `cloud02-10track.e1b.json`) will
need an optional `subdivisionDen` (default 1; check beat × q = p × unit).
Enters by amendment when the first fixed-beat fit is actually folded.
Also queued (A4 finding): a P6-style SCOPED SPELLING RULE (span ×
pitch-class → respell) as compression for per-event spelling overlays —
A4's six-overlay chord respell is the motivating case; enters when the
verbosity bites in production.

**Completeness note (A4 finding):** the validator never checks that every
S1 onset inside `source.window` × `source.parts` has an event — partial
coverage is legal and normal for hand-worked documents (`morph-window-01`
carries only the first breath-span of its gesture). A `--complete` mode
becomes necessary when the EXTRACTOR exists and claims full coverage;
queued for that build, not before.
