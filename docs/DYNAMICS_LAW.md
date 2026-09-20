# THE DYNAMICS LAW — read this FIRST, before any work on the sound path

*Written 2026-09-20 as PLAN 1e V7. His reason, in his own words:*
> *"There's some fundamental misunderstanding or AI forgets what we established before."*

*Twice in two days his ear caught a fault that "by construction" had said was impossible
(RUNNING_LOG §137 · §139 · §140). This page exists so the next agent does not have to
rediscover it. It is short on purpose.*

---

## 1 · There are exactly TWO kinds of sounding note

| | **A STRUCK note** | **A SHAPED note** |
|---|---|---|
| what it is | a strike, a plain note, a long tone, a trill's steps | a wave, a drawn swell, a ramp to or from a dynamic, a hand-drawn shape |
| the dynamic is | **the VELOCITY** | **the FADER (CC7)** |
| the velocity | the ladder's anchor for that dynamic, remapped per instrument | **always MF**, remapped per instrument — one rule for all seven |
| the fader | static, 127 (or the register's own) | **normalized: CC7 0 → 127**, the shape's top at full |
| the channel | **MAIN**, ch 1 | **a CURVE channel** — never MAIN |
| what carries it | `recVel`, `sonifyMode: 'plain'` | `cc7Abs { lo: 0, hi: 127 }` · `velAbs` |

**The one sentence:** *a dynamic you can SEE MOVING is the fader, not the velocity.*

---

## 2 · Why a shaped note is struck at MF

The written ladder is a scale of **anchor velocities, 65 … 127**, eight dynamic names spread
evenly — and after PLAN 1b it spans exactly **12 dB** for every instrument alike. That is the
right law for *written* music: a note should not fall below the ensemble's floor.

It is the **wrong** law for a shape. A note struck at the velocity of its shape's TOP has the
**timbre of that top** for its whole length, and the fader can then only move it inside those
12 dB. That is what he heard, twice:

> *"it sounds Like the whole sequence is just sitting at the high dynamic. No waves."*

His recording, read back per track and channel, is the proof (RUNNING_LOG §140): every note
struck at **127**, CC7 moving only **63 … 127**. *"Between two high dynamic levels"* is
exactly what was sent.

**His diagnosis (§141), and it is the law:**
> *"in the tuba piece and in the last piece, we always made crescendos from zero … CC7 zero
> to CC7 max … a normalized one."*

**MF, for all seven, not just the brass.** The level a shaped note loses against a struck fff
is **3.9 · 4.2 · 4.3 · 4.9 · 4.9 · 5.4 · 3.9 dB** — uniform, because 1b made it so. One rule
therefore keeps the balance. That cost is *accepted*, and it is his decision, not an oversight.

---

## 3 · The two rules a tool must write

### Rule 1 — the MF strike

```js
velAbs = VelocityRemap.heldNote(Composer._velRemap, instKey, midi, 100).vel   // 100 = mf on the ladder
```

`velAbs` pins the note-on velocity; without it the score would strike at the curve's top.
**The number is PER PITCH, not per instrument** — the remap carries each instrument's register.
Averaged over pitch it lands near EH 96 · Bsn 98 · Hn 81 · Tpt 70 · Vib 99 · Vc 95 · Db 87,
but a single low note can sit well below its own average (the double bass at C1: 60). That is
the register curve working, not a fault. No bank loaded → 100 passes through.

### Rule 2 — the top of the shape is the full fader

```js
cc7Abs = { lo: 0, hi: 127 }                 // the drawn height maps STRAIGHT onto CC7, bypassing the ladder
h' = clamp(1 - (top - level), 0, 1)         // and the heights are re-based against the shape's top
```

`top` is **ONE number for the whole note** — the waves' `high` where it read them, else the
note's own loudest. One top, so a note's several breaths all measure from the same ceiling and
**join**, instead of each one climbing to full.

Each written step under the top is then **one seventh of the fader** (the ladder has eight
names), so **ppp under an fff top is CC7 0**. Nodes are written at `y = 10 · h'`, never under
0.05.

**A consequence, known and accepted:** a shape's `low` / `high` now set a **DEPTH below a top
that always sounds at mf**. A waved box and a straight box beside it no longer share a
calibrated level. Re-framing "the waves by preset" as depths is parked in PLAN 1d.

---

## 4 · Moving CC7 lives on the CURVE CHANNELS only

D11: **MAIN ch 1 takes no moving controller** — his rack is built that way. Plain notes,
dynamics by velocity, articulation by CC0, nothing that streams. Every Kontakt port carries
ch 2/3/4 as CURVE A/B/C; the three IRCAM SI2 instruments carry theirs on a second UVI instance
on the `b` ports (`LGBassoonb` · `LGHornb` · `LGTrumpetb`).

- In the **score**: `Composer.curveChannelMap()` assigns them, round robin per player in time
  order, from `curveChannelsOf(lane, technique)`.
- In a **tool's Hear**: the tool must route them itself. The sequence drawer does it by
  marking a shaped note's `seat` `'c0'`, `'c1'`, … and wrapping `D.routeFor` from outside.
- A technique with **no curve copy** stays on MAIN — and the tool's status must SAY SO, because
  such a note's fader will not move and nothing else will tell you.

### ⚠ THE MAP IS CACHED — `curveDirty()` after writing

`curveChannelMap()` caches by object id. Once the score has been played, a note that is not in
the cache **falls back to MAIN** and plays flat. This bug has now been found twice by two
different doors (RUNNING_LOG §75, then §139) and cost most of a session each time.

> **Any tool that writes a curve event calls `Composer.curveDirty()` before `renderAll()`.**

Who does, as of 2026-09-20: `sequence_ui` · `strike_drawer` · `morph_panel` (all four inserts)
· `swell_ui` · `fill_ui` · `cresc_*` · `note_card`.

---

## 5 · What is NOT touched by any of this

Flat notes · plain notes · strikes · long tones · **trills** (the septet's trills carry volume
as separate STRUCK notes by velocity — checked 2026-09-20, nothing to fix) · the crescendo
tool's own ranges · niente fades (`cc7Fade` still multiplies in **on top of** the answer
`cc7Abs` gives).

The drawn swell keeps its own `lo: 65` — a swell rises **from a sounding level**, not from
nothing. One number if he ever wants it from zero.

**Nothing in `composer.html` changes.** `cc7Abs` and `velAbs` were built in piece #5 for this
exact problem (its §316 · §346 · §349) and have been in the score, per note, ever since. The
fix is always **what the TOOL writes**.

---

## 6 · How a claim about this is proved

**A claim about ROUTING is a claim about STATE, not about the code.** Twice in two days
"by construction" was wrong and his ear caught it both times.

**The one test — his, in the rack, not a probe:**

1. he records a waved sequence as MIDI in Reaper (the instrument tracks armed
   `Record: input`, not monitor-only);
2. ```bash
   node tools/reaper_job.js run reaper/bridge/jobs/cc7_by_channel.lua
   ```
3. **Expected:** every shaped note on a curve channel · struck at its instrument's mf velocity
   for that pitch · CC7 reaching down toward 0 under a deep shape · **MAIN ch 1 empty**.

`reaper/bridge/jobs/cc7_by_channel.lua` is read-only and reads the recording back per track and
per channel. It is the instrument that settled this, and it is the instrument that re-settles it.

---

*Source: RUNNING_LOG §137 · §139 · §140 · §141 · §142 · §143 — PLAN 1e (V1 … V7) —
`docs/MORPH_NOTES.md` 2026-09-20 for the morph's part, which is method only until the morph is
revised.*
