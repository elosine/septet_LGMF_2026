# The SEQUENCE tool — sustained chords in time containers

*PLAN 1d. Opened 2026-09-19 with 1d.1, the generator. His brief: COMPOSITION_NOTES LG-35
(the dynamics LG-36, the waves LG-38 · LG-39). The reasoning: RUNNING_LOG §102–§111, §114.*

**What exists today:**
- the generator — `score/public/sequence.js` — and its check, `node tools/sequence_check.js` (**180**) · 1d.1 (+ the rest, 1d.4 · the breath dials, 1d.5 · the waves, 1d.7 · the edges, 1d.8)
- the drawer — `score/public/sequence_ui.js` — §9 below · 1d.2, built 2026-09-19, **not yet heard**
- the round trip — reopen a placed sequence, change it, re-insert in place — §10 below · 1d.3, built 2026-09-19
- the roll — piece #5's time containers lay out the row; an empty box is a REST — §11 below · 1d.4, built 2026-09-19
- the breath dials — `together` from never to always · `apart` · a pool of lengths · `re-breathe` — §12 below · 1d.5, built 2026-09-19
- the waves — a box is a straight dynamic OR reads its players' streams of swells — §13 below · 1d.7, built 2026-09-19
- the edges, and a change rule per box — `enter` on every box · fade in / fade out, from and to niente or a dynamic · `exit` together or one by one — §14 below · 1d.8, built 2026-09-19
- the dynamics table — every written dynamic has a CC7 value of its own, 4 dB a step through the instrument's measured fader curve — **`docs/DYNAMICS_LAW.md` §3**, and §13 · §14 below · 1d.10, built 2026-09-20
- the library — every sequence on disk in `bank/sequences.json`: an untitled rolling stack, named keepers, `save` · `revert` · `duplicate` · `×` — §16 below · 1d.11, built 2026-09-20
- a RANGE of boxes — click, SHIFT+click; the selection takes `dyn` · `enter` · and a waves `range` of its own — §17 below · 1d.12, built 2026-09-20
- the breath's lengths — `of max` · `outlier` · `±` in seconds — §19 below · 1d.9 + 1d.14, built 2026-09-20
- the waves by PRESET — one menu fills every dial: lengths between two numbers with a `tilt`, a named shape, a HOLD at the top, density in words; `save preset` keeps his own — §18 below · 1d.13, built 2026-09-20
- the clock and the CURSOR — click the time strip and SPACE plays from that second, entering a sounding note with what is left of it - §20 below · 1d.15, built 2026-09-20
- not yet: his listen (1d.6) — nothing in this drawer has been heard by the AI, and the waves and the edges not yet by him

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

`node tools/sequence_check.js` — **180**, on the six reference chords (`bank/reference_chords.json`):
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
  The width follows the seconds (never under 96 px).
  **A `▸` on every box that holds a chord is its PREVIEW** (RUNNING_LOG §120): that box's frozen chord on its own — everyone
  together, 5 s (or the box's own seconds, if shorter), at the box's dyn, through the same player as Hear. It lights while it
  plays; click it again, Stop or SPACE to cut it short. A rest has none. An empty box is a REST, drawn quiet — dashed, dim (1d.4; 1d.2 edged it red).
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
- presets, sorted by spread · `values` · `weights` · `tilt` · `× unit` · `fill` (the total) · `count` · `stick` · `interrupt` ·
  the contour (+ `turn` · `bow` · `depth` when not flat) · `seed` · `roll` · `re-roll` (the next seed).
- Weights: `20` · `20%` · `0.2` all mean a fifth; a dash means "share what is left".
- Defaults are the module's own: `2 5 7 15` · 60 s · stick 0.8 · interrupt 0.10 · flat · seed 1.

**`tilt [short ◂ ▸ long]`** — his *"weight the higher ones or low ones"*.
- A slider, −3 … +3. It FILLS the weights box: weight ∝ value^k, as percentages. The middle = no weights.
- The box stays the truth. A typed weight stands, and puts the slider back to the middle.
- In the drawer only. The module is not changed.

**`count`** — how many containers *(his request, RUNNING_LOG §119–§120)*. The roll fills a SPAN; this says how many come out.
- Blank = a readout: the grey number is what the dials and the seed give now.
- A number FILLS the `×` box: the seconds per unit that makes that many fit the span — searched by rolling, for the seed in hand.
- A count that is set holds: move any other dial, or `re-roll`, and `×` is solved again. A typed `×` clears it — `×` stays the truth.
- In the drawer only. The module is not changed. The recipe keeps it with the other dials.

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
| `together` | **0.2 on a NEW sequence** (his call, 2026-09-20 — RUNNING_LOG §133 · §134); blank = `free`, and `free` is still the GENERATOR's default, so an older recipe breathes as it was dealt | this tool |
| `apart` | **0.6 s on a NEW sequence** (§134); 0.5 s in the generator | this tool — a number for his ear |
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

## 13 · The waves (1d.7)

**The fader law it rides on — READ `docs/DYNAMICS_LAW.md` FIRST.** A wave is carried by CC7 through the instrument's measured
curve (`cc7Curve` in `bank/velocity_remap.json`, measured by 0d on the curve channels). Since **PLAN 1e** a waved note is
**struck at MF** — per pitch, from the bank — and the fader carries the whole shape; since **PLAN 1d.10** that fader runs between
the **CC7 values of the waves' own `low` and `high`** (`score/public/dyn_table.js`, 4 dB a written step), not 0 … 127. So
`ppp–mp` sounds audibly below `pp–mf` where before both played the same range at the same depth.
*(When 1d.7 was built the bank held the fader curve for the vibraphone alone — the builder dropped the other six — and the
waves moved two seats of eight. Found by capturing what Hear sends; fixed in `tools/build_remap_card.js`. RUNNING_LOG §128–§130.
1d.10 extended three of those curves down to −28 dB, where 0d could not measure: RUNNING_LOG §150.)*
In the score a waved note is a DRAWN note, so it takes the curve channels round robin (D11) by itself.

**A box's dyn is a straight dynamic OR `waves`** (his swap, LG-39). The head's `waves` button opens the line; `all boxes → waves | straight`
sets every box at once; any box can be flipped on its own line. A waves box wears `∿ waves`; a box remembers the straight dyn it had.

**The dials:** `lengths` `6 10 16` (a pool — values, weights) · `low` `pp` · `high` `mf` · `density` 0.7 · `peak` 0.5 · `seed` 1 · `re-wave`.
- `low` and `high` are two WRITTEN dynamics. **No niente inside the waves** (his call, option A): the law has nothing below ppp.
  Silence belongs to the sequence's edges (PLAN 1d.8).

**The stream** — one per player, a function of time alone, in seconds from the sequence's start.
- It runs under the whole sequence whether or not a box reads it. A box that steps out does not restart it.
- Slots of lengths from the pool; each a swell with probability `density`, else flat at `low`.
- A swell is three points: `low` → `high` at `peak` of its length (± 0.1, seeded) → `low`.
- The first slot began a random part of its length BEFORE the sequence did — nobody starts a swell on the downbeat.
- A sequence moved in the score keeps its waves.

**Reading it**
- A note in a waves box takes its breakpoints from its player's stream over its own span; `level` is the loudest of them.
- The BREATH owns the level: it takes the mode of the box it starts in, and keeps it across a line.
- The ceiling is read at the loudest level the stream reaches anywhere the note could extend to — a wave can shorten a breath,
  never the reverse.
- A strike (the percussion) takes the wave's level at the strike. No ramp.

**How it sounds — one velocity, the fader moving (the morph's way)**
- Every waved note is struck at **MF** (1e, per pitch); CC7 follows the curve through `Composer.heldCc7`, between the table
  values of `low` and `high` (1d.10). A breath re-entering mid-wave does not lurch — the table is absolute, so two notes of one
  player meet at the same level. A quiet moment still has a loud attack played down: the LG-14 colour, now from the mf strike.
- **SPACE carries it, and the strikes drawer's player is not changed:** that player sends one CC7 a note, so this drawer sends
  the ramp itself after `playNotes` — the same routes, the same timers (Stop and SPACE cut it), a point every 50 ms where the value
  changes, the first 15 ms before the note-on.
- **Insert:** a waved note is written DRAWN — its breakpoints as nodes, `velAbs` = the mf velocity for its pitch,
  `cc7Abs` = `{ T(low), T(high) }`, and each node's height placed so it lands on its own table value. A straight note is
  written as it always was. The status says the fader span it actually sent, and names any instrument with no measured curve.

**The recipe:** `waves { lengths, low, high, density, peak, seed }` — when a box reads them, or the dials were moved · `containers[i].dyn = 'waves'`
(+ `dynWas`). `re-wave` re-deals the streams; a wave passing a louder top may shorten a breath.

**Verified in the running app, no MIDI (RUNNING_LOG §128 has every number). `sequence_check` 107. Not verified: sound.**

## 14 · The edges, and a change rule per box (1d.8)

**Attack or seamless, PER BOX** *(his words, LG-41)*
- Every box's line has `enter [attack | seamless]` — how THAT box is entered.
  - `attack`: everyone lands a breath before its line and starts AT it, together.
  - `seamless`: each player takes it at their next breath.
- The head's `change` sets every box (it asks before it overwrites flipped ones). A box that differs wears `▶| attack` or `≈ seamless`.
- After an `attack` box the next line is crossed seamlessly again.
- **Box 1's `enter` IS the beginning:** "start together, then seamless" = box 1 flipped to `attack`.
- In the generator it is ONE walk: a player's span begins at an `attack` box (together) or after an absence or a rest (staggered),
  and runs to the next `attack` line, a drop-out or the end. All-`attack` and all-`seamless` are its two ends — to the note.

**The `edges` line** — the `edges` button opens it.

| | together | at different times |
|---|---|---|
| **fade in** `[s] from [niente | ppp … fff]` | box 1 `attack` — one fade for everyone | box 1 `seamless` — each player on their own entry |
| **fade out** `[s] to [niente | ppp … fff]` | `exit` together — one fade | `exit` one by one — each player on their own ending |

- 0 s = it just starts, or just ends.
- **`exit: one by one`** — each player finishes a last breath of their own: the ends spread over the last stretch BEFORE the line
  (the fade out's length, else one breath), in score order, the latest ON the line. No runt, nothing past the end.
- **niente** = true silence: the fader multiplied to zero (the score's `cc7Fade`, which multiplies in **on top of** the table's
  answer). **A dynamic** = a calibrated ramp in the note's own level, through the table (1d.10) — over a straight box or a wave
  alike; the far end may be LOUDER than the box (an entry that settles), and the note's fader range simply widens to hold it.
- A strike (the percussion) cannot ramp: it takes the fade's weight at its strike.
- Only the players of the first sounding box fade in; only those of the last fade out or leave one by one.

**The recipe:** `containers[i].change` (only where it differs) · `edges { fadeIn, fadeInFrom, fadeOut, fadeOutTo, exit }` (only when
set). With nothing set the notes are the frozen baseline's.

**In the score:** a note under a fade or a ramp is DRAWN, struck at **mf** (`velAbs`), its CC7 following between its own two
written dynamics (`cc7Abs`, 1d.10); a niente fade is
the note's `cc7Fade` in SCORE seconds — so **a faded sequence dragged in the score keeps its old windows until it is re-inserted
in place.** The fade OUT needed an opt-in `to` in `Morph.fadeWeight` (absent = 1, the line it always was) — RUNNING_LOG §131.

**Verified in the running app, no MIDI (RUNNING_LOG §131 has every number). `sequence_check` 126. Not verified: sound.**

---

## 15 · The window — floating, sized, remembered (2026-09-20)

His words: *"can I get the sequence panel floating and can you increase all the fonts by 4pt"* — RUNNING_LOG §132.

**It floats.** The strip is no longer docked along the bottom: it is a window with its own place and size.

- **Drag it by the head** — anywhere on the head that is not a control. A control under the pointer keeps the pointer, so the name
  box, the selects and the buttons all still work; the head shows `move` and they do not.
- **Size it by the bottom-right corner** (the browser's own grip). It will not go below **560 × 220**. Making it TALLER makes the
  boxes taller — the row grows with the window.
- **It comes back where you left it**, across a close, a reopen and a reload. The geometry is the browser's: it lives in
  `localStorage` beside the row, **never in the score file and never in a recipe**, so it does not travel with a sequence and two
  machines can place it differently.
- **The strikes drawer keeps the bottom of the screen.** It used to be pushed up by the strip's height and capped; it is not any
  more, and the sequence window floats over it.

**The type.** Every size in the strip is **one constant, `FS` at the head of `sequence_ui.js`** — 15, which is the old 11 plus the
4 he asked for. One injected rule gives it to every input, select and button (form controls do not inherit type), and every width
and height in the strip is written in `em`, so they are proportions and follow `FS` on their own. **To change the size again,
change that one number** — nothing clips.

**Nothing in `strike_drawer.js` was touched** (his answer 2a: this panel only), and `sequence.js` was not touched either, so the
1d gate stands untouched at `sequence_check` **126**.

---

## 16 · The library (1d.11) — a sequence is a document

**Every sequence you make is on disk.** The row used to live in `localStorage` under ONE key: it survived a refresh, a server
restart and a computer restart, but there was only one, `new` wiped a row that had never been inserted, and git could not see it.

**The store is `bank/sequences.json`, a file of its own** — not a panel in `bank/panel_snapshots.json`, which is 3.1 MB of his
takes and is rewritten WHOLE on every save; an autosave every couple of seconds must not touch it. `/api/snapshots` now takes a
`store` field that is a **key into a whitelist of two**, never a path (`score/snapshots.js` `storeFor`, pinned by
`tools/test_snapshots.js`); an absent `store` is the takes file, so everything written before 1d.11 works untouched. The store is
written **temp file + rename**, because it is written often.

**Its panels:** `library` (named) · `untitled` (the rolling stack) · `wavePresets` (1d.13) · `defaults` (1d.14). An entry's state
is the row and **`kept`** — the state at his last `save`, or null.

| | |
|---|---|
| **autosave** | `localStorage` on every change, instantly, as before · the DISK about **2 s** after the last change, and on `pagehide` (by `sendBeacon`, the one write a closing tab is guaranteed to make) |
| **unnamed** | a row takes a timestamp name at its FIRST change — `untitled 2026-09-20 14.32.05`, sortable, and dots not colons because the store's name rule refuses a colon. The stack keeps the newest **50**; the oldest go at save |
| **`new`** | starts a fresh untitled. **It destroys nothing** — the row you leave is already on disk — so it no longer asks |
| **naming** | a name + ENTER **MOVES** it: saved under the name, the entry it came from deleted. A name already in the library asks first. Clearing a name moves it back to the untitled stack (it asks) — nothing is lost, because `kept` travels with the entry |
| **`save` / `revert`** | `save` marks a keeper; `revert` comes back to it, asked once; a **`•`** beside the name while they differ (the RECIPE is compared, not which lines are open). **Two states per name and never more** — no cascade of versions. A variant is a second name |
| **`duplicate`** | asks for a name and makes a copy — **with a new sequence id**, so Insert writes it BESIDE the original and not over it |
| **`×`** | deletes the one chosen in the list, asked once. Delete the row's own entry and the row stays on screen; the next change saves it again as a new untitled |

**Separate from the score.** Insert still copies the recipe into the score file's `databases.sequences`, and `sequences in this
score` (§10) is untouched: that list is what is IN the open score, this one is what EXISTS. A placed sequence opened from the
score is a row like any other — untitled until you name it.

**Migration:** the one row in `localStorage` becomes the first untitled entry at the first load.

## 17 · A range of boxes, and a waves range of its own (1d.12)

**Between ONE box and ALL boxes there was nothing**, and a rolled row can be thirty boxes long.

- **Click** = one box, as ever. **SHIFT+click** = from the selected box to this one. The selection is painted; **ESC**, a plain
  click, or `one box` returns to one.
- **What the edit line sets then goes on every box of the selection:** `dyn` (which is also `waves | straight`) · `enter` ·
  **`range`**. `take` and `seconds` stay per box — they are what makes a box itself.
- `all boxes →` in the head is unchanged: it is select-all-and-apply.

**`range [low] [high]`** — the boxes read the SAME dealt waves through two other dynamics. Blank, or `sequence range`, is the
sequence's own (the `waves` line). A box with one of its own wears it as a small tag (`ppp–mp`). Both ends together: half a range
is refused, not guessed at.

**In the generator.** The stream became a **0 … 1 swell height** (1d.7 wrote it in written levels), mapped to a level LATE, per
box — so the deal, the seeds and the swells are untouched by any range and only the map at the end of them changes. Two
consequences worth knowing:

- **Where two ranges meet the level GLIDES across the line over 0.5 s, never a step.** It is the RANGE that glides, not the
  level, so a player at rest and a player at a peak cross together and neither is bent out of shape.
- **A box that does not READ the waves has no opinion about their range and carries the last one forward.** So a range set on a
  straight box changes nothing (it is kept, for when you flip that box to `waves`), and a breath that crosses a straight box
  still reading the waves keeps the range it began in.

**A quieter range may lengthen a breath.** The ceiling is read at the loudest level a note reaches, and the palette gives a quiet
note a longer bow — so lowering a range's `high` can let a breath run longer. That is the palette working, not the deal being
re-run: with the `high` unchanged, not one onset or length moves.

## 18 · The waves by preset (1d.13)

*"A sort of presets situation … a way to easily generate a behavior"* — and *"probably need to refine all presets while
composing"*, so a preset is cheap to change and cheap to keep.

**THE SWELL** (LG-50, which reverses §138's water line): rest at `low` → **rise** → **HOLD** at `high` → **fall** → rest at
`low`. The range is the sequence's `low`–`high`, or a box's own (§17).

**The dials one menu fills**

| dial | what it is |
|---|---|
| `short` · `long` | the seconds a swell may last. Every swell is drawn somewhere between them |
| `tilt` | −1 all short · 0 even · +1 all long — which end of that span the draws lean toward |
| `shape` | the RISE as a share of the MOVING time (the length less the hold): **`golden` 0.618** (his default) · `reverse golden` 0.382 · `even` 0.5 · `surge` 0.25 · `bloom` 0.8 |
| `hold` | how long a swell SITS at its top, as a share of its own length — 0.2 means a 10 s swell holds 2 s |
| `density` | in words: `constant` 1 · `busy` 0.8 · **`breathing` 0.6** · `occasional` 0.35 · `rare` 0.15 |
| `low` · `high` · `seed` | as before; the seed is not part of a behaviour, so a preset never re-deals |

**The five**, all `pp–mf`, all the AI's starting points and PROVISIONAL:

| | lengths | shape | hold | density |
|---|---|---|---|---|
| **`breathing`** *(a new sequence's own)* | 8–20 s | golden | 0.2 | breathing |
| `tides` | 20–45 s | even | 0.1 | constant |
| `ripples` | 3–8 s | even | — | busy |
| `surges` | 6–14 s | surge | 0.1 | occasional |
| `blooms` | 12–30 s | bloom | 0.35 | rare |

**`save preset`** keeps the whole line under a name, in `bank/sequences.json` panel `wavePresets` (§16's store), so it rides in
the repo. One saved under a **built-in's** name overrides it — the menu says `(yours, over the built-in)` — and **`×`** on your
own brings the built-in back.

**The shape is exact.** 1d.7 wobbled the top by ±0.1 of the slot; a named shape does not. The second random draw a slot is still
made, so turning `density` re-deals no length, exactly as before. The character comes from the lengths, the density and the hold.

**An old sequence keeps its notes.** A waves line with a typed pool and a `peak` and **no `shape`** takes 1d.7's path in the
generator, to the byte. The drawer shows the preset dials it WOULD take, greyed, with *made before the presets* beside them —
**and converts it only when you turn a dial**, saying so when it does. Nothing converts by being opened.

## 19 · The breath's lengths: `of max` · `outlier` · `±` in seconds (1d.9 · 1d.14)

Every player used to aim at the ONE `length`, and the ceilings table only **capped** — so at 8 s the english horn, with 18 s of
air, breathed as often as the trumpet. And every breath fell in one range, so turning `±` up to get a surprise made EVERY breath
erratic.

| dial | what it does |
|---|---|
| **`of max`** | the breath is built round **that player's own maximum** at the level it is playing: `ceiling × of max × (1 ± the jitter)`. At **0.65** the english horn and bassoon aim at about 12 s, horn and cello 10, trumpet 8, double bass 6.5, the vibraphone 5. Blank = the old way. With a number in it, `length` only spaces the first entries |
| **`±` in seconds** | `8 ± 2` is **6 … 10 s** — the way a musician reads it. ONE number for everyone, under `of max` too (at `± 2` the english horn is 10 … 14 s and the vibraphone 3 … 7 s): the floor and each player's ceiling already protect the short-breathed |
| **`outlier` · `short` · `floor`** | one breath in ten far from the rest, on a coin toss. **SHORT:** that player's own aim × `short` (0.4), never under `floor` (2 s, and it may not be typed under 1.5 — an outlier is never a RUNT). **LONG:** drawn evenly between the top of that player's normal range and their maximum, so the long ones DIFFER instead of all sitting at the cap. A player with under a second of room takes short ones only |

**What stands outside them:** a **POOL** (`lengths`) is his own list, played as written — it overrides `of max` and takes no
outliers · the **landing breath** still takes what is left · `together` / `apart` still move a start afterwards.

**An outlier the landing rule or `together` then re-cut loses the flag** — it is a breath dealt to land, or moved, and the flag
must not claim a length the note does not have.

**The outlier draws on a stream of its own**, as `together` does, so turning the dial re-deals no other breath's length — though
their places move, as they must when one breath among them changes. The status counts them: `11 OUTLIER (9 short · 2 long)`.

**A new sequence starts at** `of max 0.65 · ± 1.3 s · outlier 0.1 · short 0.4 · floor 2 · together 0.2 · apart 0.6`, and
**`save as default`** keeps HIS line instead (panel `defaults` in §16's store); `×` beside it brings the built-in back.

**Nothing of this is in the generator's own defaults.** `ofMax`, `outlier` and `jitterS` are ABSENT there, and absent means the
notes are exactly what 1d.5 dealt — which is what `tools/sequence_baseline.json` gates. A recipe made before 1d.14 carries only
the morph's SHARE; the box shows it **converted** (share × length) and writes real seconds the moment he touches it.

## 20 · The clock and the cursor (1d.15)

Hear used to start at the beginning or at a box's LEFT EDGE, and a rolled row can run for minutes.

- **The time strip** sits above the boxes. **Click anywhere along it** and the cursor goes there: a line down the boxes, with
  the second and `box N +M` beside it. Click the same place again and it is gone.
- **SPACE then plays from the cursor** — the `hear` menu shows `from the cursor` beside `from the start` and `from the box`,
  which both remain.
- **A note already sounding at the cursor starts AT the cursor**, with what is left of it, **and its fader at the curve's value
  there** — not at the note's own beginning. Hear's ramp already carried a skip for `from the box`; the cursor is the same path
  at any second. *(Measured: 8 notes sounding at the cursor, all 8 entering mid-note, the first CC7 sent being 51 — the same
  value the whole note's ramp has at that instant.)*
- **The clock** in the head reads `elapsed / total` in `m:ss.s` while Hear plays, and **stops where Hear stops**.

**Insert is untouched.** The cursor is for the ear, not for the score.

## 21 · One scale: a straight box sits on the table too (1g)

**What he heard:** *"the attacks are very loud"* — box 5, straight `pp`, entered by `attack`, after four boxes of `pp`–`mp` waves.
The MIDI was right and the LAW had two scales: a straight box's notes were STRUCK (velocity = the dynamic, 12 dB from `ppp` to
`fff`), a waves box's were SHAPED (struck at mf, the fader on the 4 dB table). The same `pp` was two levels about 18 dB apart.

**Now every SUSTAINED note in a sequence is shaped** — waved, ramped, faded or simply held:

| | |
|---|---|
| the strike | mf, per pitch, for everyone — as the waves always were |
| the fader | the table value of the note's own dynamic: a `pp` box holds cello 51 · bassoon 32 · vibraphone 52, flat |
| the channel | a curve channel, in Hear, in a box's preview and in the score. MAIN carries no sustained note of a sequence |
| in the score | drawn at its WRITTEN height, as a straight note always was — `cc7Abs` lo = hi holds the fader whatever the height |

- **A straight `pp` is the waves' `low`.** Stepping a box out of the waves no longer changes its level, only whether it moves.
- **An `attack` is an mf attack played down by the fader** — the LG-14 colour — not a `pp` strike at the full fader.
- **`as dealt` works the same way:** each note holds the table value of its own level from the take.
- **A strike is not reached.** A fixed-length sound (no breath, no bow) still takes its velocity, on the old 12 dB ladder.

**The two vibraphones no longer share a fader.** The second vibraphone is a real seat on the lane's first curve channel, and the
first vibraphone's round robin used to be dealt that same channel — two players, one CC7. The round robin now skips it.

**Verified in the running app, no MIDI (RUNNING_LOG §158 has every number):** 49 of 49 notes shaped, none on MAIN · Hear, Insert
and the score's own playback captured at the `pp` line — curve channels, mf velocities, CC7 at the table's `pp`.
**Not verified: sound.** His test is the 1e one — record it in the rack, `cc7_by_channel.lua`, MAIN empty.
