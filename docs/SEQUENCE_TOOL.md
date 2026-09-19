# The SEQUENCE tool — sustained chords in time containers

*PLAN 1d. Opened 2026-09-19 with 1d.1, the generator. His brief: COMPOSITION_NOTES LG-35
(the dynamics LG-36, the waves LG-38 · LG-39). The reasoning: RUNNING_LOG §102–§111, §114.*

**What exists today:** the generator only — `score/public/sequence.js` — and its check,
`node tools/sequence_check.js` (**49**). No drawer, no sound. Those are 1d.2 onward.

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
  breath:     { striation, length, jitter, seed }
}
```

- **`dur`** — seconds, more than 0.
- **`chord`** — the notes as a take deals them:
  `{ lane, seat, inst, tech, midi, cents, level }` (+ `partial`, `fixedLen` carried if present).
  - `seat` — 0 or absent = the lane's own player · 1 = the second vibraphone bow.
  - `inst` — the palette's instrument key (`english_horn` … `double_bass`).
  - `level` — the dealt level as a drawn HEIGHT 0–1. A dealt anchor velocity (`vel`, 65–127) is read through the ladder instead.
  - Two notes for ONE seat = a **double stop**: one player, one bow, every breath shared.
- **`dyn`** — `'as dealt'` (each note keeps its own level) or `'ppp'` … `'fff'`.
- **`breath`** — the morph's defaults: `staggered` · `length` 8 s · `jitter` 0.35 · `seed` 1.

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

**Refused, with a message:** no containers · a container of 0 s · an empty chord · an unknown change rule ·
a dynamic not on the ladder · a named dynamic with no ladder loaded · a note with no lane, pitch, instrument or level.

## 7 · One seed

- The same recipe and seed give the same notes.
- Each (player, span) has its own random stream.
  So under `attack`, re-timing one box leaves the breaths of every other box where they were.

## 8 · The check

`node tools/sequence_check.js` — **49**, on the six reference chords (`bank/reference_chords.json`):
the container arithmetic · both change rules · the double stop · the rest · the dynamic carry ·
the ceilings at ppp / mf / fff · the seats · a fixed-length sound · one seed · the refusals · very short boxes.
