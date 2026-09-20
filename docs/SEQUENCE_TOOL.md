# The SEQUENCE tool — sustained chords in time containers

*PLAN 1d. Opened 2026-09-19 with 1d.1, the generator. His brief: COMPOSITION_NOTES LG-35
(the dynamics LG-36, the waves LG-38 · LG-39). The reasoning: RUNNING_LOG §102–§111, §114.*

**What exists today:**
- the generator — `score/public/sequence.js` — and its check, `node tools/sequence_check.js` (**88**) · 1d.1 (+ the rest, 1d.4 · the breath dials, 1d.5)
- the drawer — `score/public/sequence_ui.js` — §9 below · 1d.2, built 2026-09-19, **not yet heard**
- the round trip — reopen a placed sequence, change it, re-insert in place — §10 below · 1d.3, built 2026-09-19
- the roll — piece #5's time containers lay out the row; an empty box is a REST — §11 below · 1d.4, built 2026-09-19
- the breath dials — `together` from never to always · `apart` · a pool of lengths · `re-breathe` — §12 below · 1d.5, built 2026-09-19
- not yet: the waves (1d.7)

---

## 1 · The idea

- A sequence is a **RECIPE**. It is saved in the score file (`databases.sequences`, from 1d.2).
- The notes are **DERIVED** from the recipe. Change the recipe, re-derive, the notes follow.
- The generator is the derivation and nothing else. It knows nothing of the drawer, the canvas or MIDI.

## 2 · The recipe

```
{
  t0:         seconds — where the sequence starts in the score
  containers: [ { dur, chord, dyn } … ]
  change:     'attack' | 'seamless'
  breath:     { striation, length, jitter, seed, together, apart, lengths }
}
```

- **`dur`** — seconds, more than 0.
- **`chord`** — the notes as a take deals them:
  `{ lane, seat, inst, tech, midi, cents, level }` (+ `partial`, `fixedLen` carried if present).
  - `seat` — 0 or absent = the lane's own player · 1 = the second vibraphone bow.
  - `inst` — the palette's instrument key (`english_horn` … `double_bass`).
  - `level` — the dealt level as a drawn HEIGHT 0–1. A dealt anchor velocity (`vel`, 65–127) is read through the ladder instead.
  - Two notes for ONE seat = a **double stop**: one player, one bow, every breath shared.
- **`chord: null`** — a REST (1d.4): silence for the container's duration. Every player is absent from it, so under both change
  rules every chain lands at its start and begins again at its end (staggered under `seamless`, together under `attack`).
  `chord: []` is still refused — a malformed box; a rest is `null` and deliberate.
- **`dyn`** — `'as dealt'` (each note keeps its own level) or `'ppp'` … `'fff'`.
- **`roll`** *(beside the containers, only on a rolled row — 1d.4)* — the dials that made the durations. The generator ignores it.
- **`breath`** — the morph's defaults: `staggered` · `length` 8 s · `jitter` 0.35 · `seed` 1 —
  and 1d.5's: `together` null (free) · `apart` 0.5 s · `lengths` null, or a pool `{ values, weights }`. §12.

## 3 · The two change rules

**`attack`** — a new chord is attacked by everyone.
- Every player's chain is cut at each boundary and restarted.
- Everyone starts AT the line, together.
- A player who also plays the next chord lands one gap BEFORE the line — the breath before the attack.
- The striation lives in the FIRST breath's length (shortened by the player's phase).
  So the entries are together and the re-breaths are spread.

**`seamless`** — a new chord is taken at each player's next breath.
- One chain per player across the sequence.
- Each breath takes the pitch AND the level of the container it STARTS in.
- A breath across a line keeps the old chord (flag `ACROSS`).
- First entries are staggered, as the morph's are.

**Either way:**
- The final breaths are **dealt to land** on the end — never chopped, never a runt left over.
- A player absent from a chord rests through it. Its chain lands where its last container ends,
  and re-enters where it returns (staggered under `seamless`).

## 4 · The breath rules — the morph's, borrowed as numbers

`morph.js` is not touched and no code is shared (it is byte-gated against the tuba baseline).

| Rule | Number |
|---|---|
| staggered first entry | `phase · length · 0.5` — never more than a quarter of a short span |
| striation phases | `staggered` i/n · `grouped` (i mod 3)/3 · `aligned` 0 · `converging` i/n · `diverging` 0 — first-entry phase only, as the morph |
| a breath | `length · (1 ± jitter)`, never under 0.5 s |
| the gap after a breath | the palette's (`gapS`: winds 0.75 s, bows 0), jittered by half the jitter, never under 50 ms |
| the ceiling | `beating_calc.js` `ceilingFor(inst, level)` — read at the note's LOUDEST level; capped at 30 s |
| over the ceiling | SPLIT, never truncated (flag `CEILING`) |
| the landing | what is left ≤ the breath → it takes it all · a would-be runt (< 1.5 s) is folded in, or the rest is shared by two even breaths |
| a fixed-length sound | an instrument with NO ceiling in the palette (the percussion): struck once per breath, its length is the sample's (`fixedLen`, else 1 s) |

## 5 · The dynamic

- `'as dealt'` keeps each note's own level.
- `'ppp'` … `'fff'` goes through the drawer's own ladder — `dyn_ui.js` `StrikeDyn` (65 … 127, 12 dB). Not a copy.
  - On the page the generator finds `window.StrikeDyn`.
  - In node the check runs `dyn_ui.js` itself against a stub drawer and hands the ladder in.
- **A note's level is BREAKPOINTS from the first day:** `levels: [[0, level], [dur, level]]`. Flat today.
  The waves layer (1d.7) or a drawn curve changes the numbers, not the shape.

## 6 · What comes out

`generate(recipe, ctx)` → `{ t0, end, total, bounds, change, breath, players, notes }`.

Each note: `player` (`lane:seat`) · `lane` · `seat` · `inst` · `tech` · `midi` · `cents` · `partial` ·
`container` (the one it starts in) · `start` · `end` · `dur` · `level` · `levels` · `kind` (`breath` | `bow` | `fixed`) ·
`ceiling` · `flags`.

**Flags:** `CEILING` (the ceiling decided the length, not the dial) · `ACROSS` (holds the old chord across a line) ·
`RUNT` (shorter than 1.5 s) · `RINGS` (a fixed sound ringing past its span) · `SEGCAP` (2048 notes in one span — never silent).

**Refused, with a message:** no containers · a container of 0 s · an empty chord (`[]`) · nothing but rests · an unknown change rule ·
a dynamic not on the ladder · a named dynamic with no ladder loaded · a note with no lane, pitch, instrument or level.

## 7 · One seed

- The same recipe and seed give the same notes.
- Each (player, span) has its own random stream.
  So under `attack`, re-timing one box leaves the breaths of every other box where they were
  (with `together` free — a set `together` ties the players to each other, which is its point).

## 8 · The check

`node tools/sequence_check.js` — **88**, on the six reference chords (`bank/reference_chords.json`):
the container arithmetic · both change rules · the double stop · the rest · the dynamic carry ·
the ceilings at ppp / mf / fff · the seats · a fixed-length sound · one seed · the refusals · very short boxes ·
a REST under both rules (nothing sounds in it, every chain lands on its start, everyone re-enters) · a rest first and last ·
**THE GATE** (1d.5): ten recipes hashed against `tools/sequence_baseline.json`, frozen BEFORE the breath dials went in —
untouched dials must give those notes. `--freeze` writes it and refuses to overwrite ·
the breath dials: `together` 0 (no two starts within `apart`, both rules) · 1 (every re-entry shared, all the leader's) ·
0.5 (between) · the leader unchanged by the dial · `CROWDED` said, never silent · the pool · weights · the refusals.

## 9 · The drawer (1d.2)

`score/public/sequence_ui.js`, loaded after every strikes-drawer mixin. **`strike_drawer.js` is not changed.**

**Where:** a `Sequence` button beside `Strikes` (and a `SEQUENCE ▴` tab, bottom right).
It opens a strip along the bottom. The strikes drawer, when open, stands ON the strip — both visible.

**The strip**
- Head: name · `change [attack | seamless]` · `+ container` · `hear [from the start | from the box]` ·
  `Hear` · `Stop` · `Insert @ playhead` · `new` · the `SPACE` light · total · status.
- The row: one box per container — its number, take, `seconds · dyn`, and **how many players it froze**.
  The width follows the seconds (never under 96 px). An empty box is a REST, drawn quiet — dashed, dim (1d.4; 1d.2 edged it red).
- The line under the row belongs to the clicked box: take · seconds · dyn (`as dealt` | `ppp … fff`) ·
  `refresh from take` · `◂ ▸` · `×` · the frozen chord spelled out (`Bsn C3 · Vc B♭4 −31¢ …`).

**Choosing a take**
- The take is LOADED in the strikes drawer (`loadTake`) — so he sees it; whatever was undealt there is replaced.
- The box reads the notes as `long tone` deals them — `longNotes(notesFor('orch'))`: each player·pitch once,
  its cents, its seat, the take's own dyn as the level.
- The chord is FROZEN in the box. `refresh from take` reads it again.
- The players count is the guard: the free/busy rule (PLAN 1t, §93) can deal fewer players than expected.

**Hear**
- The generator's notes through the strikes drawer's own player (`playNotes`): the remap, the bends, the seat's channel.
- `from the box`: from the selected box's line; a note already sounding there is picked up at the line.
- A white line crosses the boxes while it plays.
- **The bend taken back:** `playNotes` sends a bend only for a note WITH cents. A sequence gives one player a just
  note and then a tempered one on the same channel. So a tempered note of a player who bends anywhere in the sequence
  leaves with a millionth of a cent — the player then sends the centre. Players who never bend are sent nothing.

**SPACE goes to what he clicked last** *(a call made alone — his to reverse, RUNNING_LOG §115)*
- this strip → the sequence · the strikes drawer → the take · the score → the transport (strikes drawer closed).
- The `SPACE` light and the bright top border say when the strip has it.
- How: the strikes drawer's own listener owns SPACE while it is open and calls `play('orch')`; this file wraps `play`.
  With the strikes drawer closed, this file's own listener answers.

**Insert @ playhead**
- The objects the strikes drawer's Insert writes: a `waveCurve` per note · height = the anchor (`y = level × 10`) ·
  `recVel` · cents as a constant `morphBend` · a seat's note or a bent note DRAWN, the rest `sonifyMode: 'plain'` ·
  nodes built from the note's `levels` breakpoints (flat today). `srcKind: 'sequence'`.
- ONE group `grp-seq-<id>` · ONE META bar over the span.
- The recipe into the score file: `databases.sequences` — an ARRAY, as its sibling databases are —
  `{ id, name, group, inserted, notes, recipe }`. The recipe is complete: `t0 · change · breath · containers[{ dur, dyn, take, chord }]`.
  The working copy and every named version carry it (`collectData` saves `databases` whole; the server passes it through).
- A player who is trilling at that moment is skipped, as the strikes drawer does.

**One row = one sequence = one place in the score** *(a call made alone — his to reverse, §115)*
- The row carries an id. An insert always removes the earlier insert of THAT id first — two would double every note.
- *(1d.2 then wrote at the playhead, so Insert again MOVED it. 1d.3 changed that: a placed sequence is replaced IN PLACE — §10.)*
- `new` clears the row and takes a fresh id; a sequence already in the score stays there.

**Remembered:** the row, the selected box and the hear menu — in the browser (`lgmf.sequenceDrawer.v1`).

**Verified in the running app, no MIDI (a throwaway :5401 tab, 2026-09-19):** three of his takes (8 · 13 · 6 s) →
8 players frozen in each, cents and both vibraphone seats carried · widths 439 : 706 : 333 px for 8 : 13 : 6 ·
Hear's list = the generator's, note for note (37) · `as dealt` kept the takes' own dyn (92, 83), the `mf` box 100 ·
4 notes re-centred · from the box: 25 notes, 8 at the line · seamless: 28 notes, 14 `ACROSS` ·
SPACE to the strip, the strikes drawer, the transport, each in turn · the two drawers stacked with no overlap ·
Insert: 37 notes + 1 META on lane 8, 22 `morphBend`, 27 drawn / 10 plain, heights 2.9 · 4.4 · 5.6 = 83 · 92 · 100 ·
Insert again: the same object count, one database entry · saved under a throwaway name and loaded back: the recipe
byte-identical · a reload: the row back, chords kept. `palette_check` 184 · `sequence_check` 49.
**Not verified: sound.** The in-app browser has no Web MIDI — every listen is his Chrome.

## 10 · The round trip (1d.3)

**The list** — `sequences in this score`, in the strip's head. Read from the open score's `databases.sequences`.
- Each line: name · boxes · seconds · `@ 12.5 s` — or **`NOT in the score`**.
- Pick one → the recipe is back in the row: boxes, frozen chords, seconds, dyns, attack or seamless, breath.
- A dirty row (boxes never inserted, or changed since) asks before it is replaced.
- The list is rebuilt only when something changed, checked on every click inside the strip.

**Where a sequence sits** — read from the SCORE, never from the recipe.
- Its META bar's start. A group he dragged is found where he left it.
- No bar left in the group → the recipe's own `t0`. No objects at all → it is not in the score.

**Re-insert in place**
- In the score → the button reads `Re-insert in place @ 12.50 s`. The playhead is not consulted.
- The old group's objects go · the new are written from the same start · one META bar · the entry updated under the same id.
- Not in the score → `Insert @ playhead`, as 1d.2.
- `move to playhead` — shown only while the sequence is in the score — is the one way Insert still moves it.

**The recipe is the truth**
- A note moved, stretched or re-pitched by hand inside the group is overwritten by a re-insert.
- The status counts them: the old notes against what the SAVED recipe generates at that start
  (lane · pitch · start and end within 10 ms). Deleted notes are counted apart.
- Stretching the META bar does not change the containers — a re-insert restores them.

**An orphan** — an entry whose notes are gone (an undo, a hand delete) stays in the list, marked. Reopen it, Insert:
it is written at the playhead. Nothing deletes an entry yet.

**Not built, told him:** reopening by clicking the META bar in the score — it needs a hook in the score's canvas.

**Verified in the running app, no MIDI (a throwaway :5401 tab, 2026-09-19; RUNNING_LOG §116 has every number):**
insert at 12.5 s → `new` → reopen from the list: the same id, the recipe byte-identical · box 2 → 20 s, box 3's take swapped,
box 1 → ff → re-insert with the playhead elsewhere: written at 12.5, the 38 old objects gone, 45 notes = the generator's,
one META bar, one entry updated · the group moved +30 s in the score model → the list and the reopen read 42.5 → re-insert there ·
hand edits counted (2 changed, 2 deleted) · `move to playhead` · an orphan marked · 1280 px: no overflow.
**Not verified: sound, and a real drag of the META bar on the canvas** (the move was made in the score's model).

## 11 · The roll (1d.4)

**What it is:** piece #5's time container generator — `score/public/time_containers.js`, **not changed** — driving the row.
The same module the strikes drawer's `containers` shape uses; the same dials, order, tooltips and defaults (`containers_ui.js`).

**The roll line** — the `roll` button in the head opens it.
- presets, sorted by spread · `values` · `weights` · `tilt` · `× unit` · `fill` (the total) · `stick` · `interrupt` ·
  the contour (+ `turn` · `bow` · `depth` when not flat) · `seed` · `roll` · `re-roll` (the next seed).
- Weights: `20` · `20%` · `0.2` all mean a fifth; a dash means "share what is left".
- Defaults are the module's own: `2 5 7 15` · 60 s · stick 0.8 · interrupt 0.10 · flat · seed 1.

**`tilt [short ◂ ▸ long]`** — his *"weight the higher ones or low ones"*.
- A slider, −3 … +3. It FILLS the weights box: weight ∝ value^k, as percentages. The middle = no weights.
- The box stays the truth. A typed weight stands, and puts the slider back to the middle.
- In the drawer only. The module is not changed.

**`roll`** — the durations become the row's boxes.
- The status is the module's report: `rolled 10 · 59 of 60 s · 1 s short → 7 7 8 9 7 9 3 3 3 3 · seed 1 · spread 3×`.
  Nothing is stretched to fit.
- A rolled box is an ordinary box: seconds typed over, removed, moved. A box may be as short as 0.1 s.
- **Rolling over chords KEEPS them, by position** *(the AI changed the plan here — RUNNING_LOG §117; his to reverse)*.
  Box *i* keeps its chord and dyn · extra boxes are rests · chords beyond the new count are dropped.
  It asks first and says how many are kept and dropped. Cancel leaves the row and the seed alone. A clean start is `new`.

**An empty box is a REST** *(a call of §107 — his to reverse)*
- Silence for its duration. Every player stops at its start and begins again after it.
- Drawn quiet: dashed, dim — `rest · 7 s · silence`.
- The recipe carries `chord: null`; the generator needed no new machinery — it is the absent-player rule, for everyone.
- A row of nothing but rests is refused: *"every container is a rest — give one a chord"*.

**The recipe keeps the dials** — `roll { … }` beside the containers, once a row was rolled.
- A reopened rolled sequence opens the roll line with its dials, and `re-roll` works on it.
- **The containers are the truth.** A typed-over duration is never re-derived from the dials.

**The strip's height is its content's** — the roll line wraps with the width. The strikes drawer is re-fitted
when the line opens, when a contour's dials appear, and on a window resize.

**Verified in the running app, no MIDI (a throwaway :5401 tab, 2026-09-19; RUNNING_LOG §117 has every number):**
his set `3 9 7 8` · the same seed twice · `re-roll` · a weighted value · the tilt both ways (mean 6.54 → 7.71 long, 4.42 short) ·
a typed weight standing · two presets · a chord · a rest · a chord: nothing in the rest, 8 land, 8 re-enter, under both rules ·
a roll over a filled row: cancel, then accept with the chords kept · inserted, reopened with its dials, re-rolled, re-inserted in place ·
the layout at 1280 px with the roll line on one line and wrapped to two. `sequence_check` 60 · `palette_check` 184.
**Not verified: sound.**

## 12 · The breath dials (1d.5)

**With nothing touched the sequence breathes exactly as 1d.1 made it breathe.**
The gate: `tools/sequence_baseline.json`, frozen before the dials went in (§8).

**The `breath` line** — the `breath` button in the head opens it. Built as the roll line is.
- `striation` · `length` · `±` · `together` · `apart` · `lengths` · `weights` · `seed` · `re-breathe`.
- A dot on the button = a dial is off the morph's numbers.
- Every change re-deals the row. The status says what came of it: `… → 40 notes · 17 SNAP · 3 APART · led by Vib`.
- The dials live in the recipe (`breath { … }`). A reopened sequence breathes as it was dealt, and opens the line.

**The defaults, and where they come from**

| Dial | Default | Source |
|---|---|---|
| `striation` | `staggered` | `morph.js` `DEFAULTS.carrier.striation` |
| `length` | 8 s | `morph.js` `DEFAULTS.carrier.segLen` |
| `±` (jitter) | 0.35 | `morph.js` `DEFAULTS.carrier.segVar` |
| `together` | blank = `free` | this tool |
| `apart` | 0.5 s | this tool — a number for his ear |
| `lengths` | none | this tool |
| `seed` | 1 | — |

**`striation`** — the morph's five, by the morph's names, doing what the morph's do: they set the FIRST entry only.
So `converging` starts as `staggered` and `diverging` as `aligned`. Not deepened, at his word.

**`together`**
- **blank = free.** The morph's way: two players begin a breath together only by chance.
- **0 = never.** Every start is kept at least `apart` seconds from every other player's.
- **between.** That share of the re-entries snaps onto another player's re-entry (`SNAP`). The rest are kept apart (`APART`).
- **1 = always.** Every player takes the leader's next re-entry.
- An `attack` line is everyone, by design — outside the rule.
- A seamless first entry belongs to the striation: never snapped, but kept apart (moved later) while `together` is under 1.

**How a start is moved** — by the breath BEFORE it.
- Earlier: that breath is shortened. Never to less than half of itself, nor under 1.5 s.
- Later: that breath is held longer, within its ceiling.
- Only when the ceiling is in the way does the gap widen — by no more than 1 s. Measured worst case: 0.879 s of silence.
- A kept-apart start goes to the NEAREST free place. A snap goes to the re-entry nearest to where the start would have fallen.

**The shortest breath leads**
- Players are dealt in order of ceiling, shortest first — each player's shortest, at the levels it plays.
- Each moves or snaps to the ones dealt before. Anyone can match a shorter breath; no one can outlast their own ceiling.
- With the bowed vibraphone in the chord it leads (8.73 s at mf, 7.4 s at fff). The status names the leader.
- The dial has a random stream of its own: turning it re-deals no length. The leader's breaths never change with it.

**`apart` has a limit — `CROWDED`**
- Eight players on 8 s breaths have room for about **0.75 s**. Measured: 0 crowded at 0.75 · 5 of 40 starts at 0.9 · 10 of 37 at 1.25.
- A start with no room is left where it fell and flagged. The status turns red and says so.

**`lengths` — a pool**
- Values in seconds, e.g. `3 9`. Weights as the roll's: `20` · `20%` · `0.2` · a dash.
- Each breath's wanted length is drawn from the pool — `time_containers.js`, not changed, its order dials at their defaults.
- One stream per (player, span), all from the one seed.
- A pool value is played as written: no jitter. The ceiling still binds, and flags (`CEILING`).
- `length` then only spaces the first entries. The landing breaths still take what is left.
- **The pool is sticky** (the generator's `stick` 0.8): a player stays on short or on long for a while.
  Across the ensemble it is still short against long. `stick` is not on the line — his ear decides if it should be.

**`re-breathe`** — the next seed. The chords and the durations are not touched. The old seed typed back gives the old breaths.

**The head wraps** (found here): at 1280 px a placed sequence's head was 61 px too long before `breath` was added, and its `×`
was cut off. It wraps now, as the roll line does; the strikes drawer is re-fitted when the strip's height moves.

**Verified in the running app, no MIDI (a throwaway :5401 tab, 2026-09-19; RUNNING_LOG §118 has every number):**
the strip's defaults = the page's own `Morph.DEFAULTS.carrier` · `together` 0 / 0.5 / 1 on a 40 s box, the starts listed per player ·
blank again = the free notes, byte for byte · a pool `3 9` · weights · `re-breathe` changing the deal and nothing else ·
inserted, `new`, reopened with its breath · a page reload · the layout at 1280 px. `sequence_check` 88 · `palette_check` 184.
**Not verified: sound.**
