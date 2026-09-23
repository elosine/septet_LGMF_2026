# THE DYNAMICS LAW — read this FIRST, before any work on the sound path

*Written 2026-09-20 as PLAN 1e V7, amended the same day by PLAN 1d.10 (§3 Rule 2) and by PLAN 1g and PLAN 1h H3 (§3 Rule 3 — a
sequence, then a morph). His reason, in his own words:*
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
| the fader | static, 127 (or the register's own) | **the CC7 of its own two written dynamics** — `ppp–mp` is not `pp–mf` |
| the channel | **MAIN**, ch 1 | **a CURVE channel** — never MAIN |
| what carries it | `recVel`, `sonifyMode: 'plain'` | `cc7Abs { lo: T(low), hi: T(high) }` · `velAbs` |

**The one sentence:** *a dynamic you can SEE MOVING is the fader, not the velocity.*

**And in a SEQUENCE — and, since PLAN 1h, in a MORPH — a third case (§3 Rule 3):** a sustained note whose level does NOT
move is written the shaped way all the same — struck at mf, on a curve channel, its fader held at its table value.

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

### Rule 2 — THE TWO WRITTEN DYNAMICS ARE THE FADER RANGE *(1d.10, 2026-09-20, amending 1e)*

```js
const T = DynTable;                                 // score/public/dyn_table.js — the table, UMD, node-loadable
lo, hi = the lowest and highest LEVEL among the note's own breakpoints
cc7Abs = T.range(bank, instKey, lo, hi)             // the fader runs between their two table values
h      = T.height(bank, instKey, level, lo, hi)     // EVERY breakpoint on its own table value, not only the two ends
```

**THE TABLE.** `fff` = CC7 127. Each written step below it is **`STEP_DB` = 4 dB**, taken through
that instrument's **measured** fader curve (`bank/velocity_remap.json` `cc7Curve`, measured by 0d
on the curve channels). ONE constant, so his ear retunes the whole ladder by changing one number.
`ppp` is 28 dB under the ceiling — a SOUNDING level, not silence; true silence is still the edges'
niente, and `cc7Fade` multiplies in on top of the table's answer.

|  | ppp | pp | p | mp | mf | f | ff | fff |
|---|---|---|---|---|---|---|---|---|
| **cello** (Kontakt, 60·log10) | 43 | 51 | 59 | 69 | 81 | 94 | 109 | 127 |
| **bassoon** (UVI, 40·log10) | 24 | 32 | 40 | 50 | 62 | 79 | 100 | 127 |

Two different CC7 ladders, **the same dB** — which is the point: the law is in decibels, and each
instrument's own fader curve converts it. `mp → ff` on a Kontakt instrument is **69 → 109**, which
is his own guess (*"say 65 to 111 … not up to the full 127"*) to within four steps of CC7.

**HIS PRINCIPLE, and it is the reason (LG-51):** *a STATED dynamic range is what sounds, for the
whole curve* — drawn full for the notation, performed between the two values.

**What it replaced.** 1e mapped every shape onto 0 → 127 with its top re-based to full, so only a
shape's **DEPTH** was heard: `ppp–mp` and `pp–mf` are both three steps deep and both played about
CC7 73 → 127. On the cello they are now **43…69** and **51…81** — verified in the running app,
2026-09-20. 1e needed ONE `top` per note so a player's several breaths would JOIN rather than each
climb to full; the table is **absolute**, so they join by construction and no shared top exists.

Nodes are still written at `y = 10 · h`, never under 0.05.

**→ HEARD 2026-09-20, AND ANSWERED FOR THE SEQUENCE DRAWER BY RULE 3 BELOW.** *(What this paragraph said, and it is still true
of any struck note set beside any shaped one OUTSIDE a sequence:)* a shaped note sits QUIETER than a struck note of the same name — the
ceiling is a struck **mf** at CC7 127 and the table counts down from `fff`, so a shaped `mf` is
about 12 dB under a struck `mf`, and more toward the quiet end. A waved box and a straight box
beside it do not share a calibrated level. That is his model; `STEP_DB` is the one number that
tunes it.

### Rule 3 — IN A SEQUENCE, AND IN A MORPH, ONE SCALE *(PLAN 1g · PLAN 1h H3, 2026-09-20)*

His ear: *"the attacks are very loud"* — a straight `pp` box entered after a `pp`–`mp` waves box. His recording read back
(RUNNING_LOG §157) showed both sides ON the law and the law at fault: a struck `pp` is about **10 dB** under a struck `fff` (1b's
12 dB ladder), a shaped `pp` about **28 dB** under it (the table, under an mf strike). One NAME, two levels 18 dB apart, and the
line between the boxes was a +10 … +18 dB step.

**So inside a sequence every SUSTAINED note is written the shaped way, moving or not:**

```js
isShaped(n) = n.kind !== 'fixed'          // a breath or a bow — anything that is not a fixed-length sound
flat note:  velAbs = the mf velocity · cc7Abs = { lo: T(level), hi: T(level) } · drawn at its WRITTEN height
```

`heldCc7` answers `lo + (hi − lo) · h`, which is `lo` whatever the height — so a flat note holds its table value and is still
drawn where a straight note always was. A straight `pp` **is** the waves' `low`, by construction. An `attack` is an mf attack
played down by the fader (LG-14).

**AND THE SAME RULE IN A MORPH (PLAN 1h H3, 2026-09-20).** The piece's second object is a BLOOM following the first sequence on
the SAME take (LG-52), so the two must stand on one scale or the join is the +10 … +18 dB step all over again — a still `pp` left
on the struck ladder would sit about 18 dB over the sequence's `pp`. **Every sustained note the morph writes is shaped, moving or
not, for EVERY pitch source and not only a take.** The helper both sides read is `score/public/morph_dyn.js` — `shapeLevels(bank,
instKey, midi, level)` → `velAbs` · `cc7Abs` · `heights`, the morph's 0 … 10 levels onto the same table — so the panel's Hear
(`morph_emit.js`) and the inserted score (`morph_panel.js`) cannot drift apart. It REPLACES the sentence of `MORPH_NOTES.md`
2026-09-20, *"a morph note whose level does NOT move stays a struck note"*.

**The fade is untouched, and that is the point of the layering** (his question, RUNNING_LOG §167): `velRef` and `cc7Fade` stay
exactly as the engine wrote them, and `fadeWeight` still MULTIPLIES in on top of the table's answer. Measured 2026-09-20 on a
`fade-in-slow` bloom: the strike held at the mf velocity through all five breaths of the 24 s window while CC7 climbed 0 · 1 · 2 ·
3 … — a floor the table alone could never reach (the english horn's own `lo` there is 47). In the other attack modes
(`multiply`, `ceiling`) there is no weight: the LEVEL is shaped, so the fall bottoms at the table's value — measured 43 on the
same note — which is a SOUNDING level, not silence. The morph engine writes no `to` on a fade, so a weight that falls to niente is
the sequence drawer's alone (1d.8).

**Not reached:** a FIXED-length sound (a strike) — no breath, no bow, no measured fader curve — still takes its velocity. And
nothing OUTSIDE a sequence or a morph changes: §1's table stands for every other tool.

**The check:** `node tools/dyn_table_check.js` — the CC7 the table gives is read BACK through the
same curve and the eight names must land 4 dB apart on every instrument (51 checks).

---

### Rule 4 — IN A TEXTURE, ONE SCALE FOR SHORT AND HELD *(PLAN 1n.1, 2026-09-22 — his B2, RUNNING_LOG §264 · §296)*

A texture has both kinds by nature: SHORT notes (the standard short of 1m.3) and HELD ones (a length). Rule 3's cure — shape every
sustained note — does not reach a short note, and a short `pp` on the struck ladder (1b's 12 dB span) beside a held `pp` on the table
(28 dB) is the +18 dB step of §157 all over again. A wider velocity ladder cannot close it (the english horn, the cello and the bass have
5–7 dB to give, §263). **His call, B2:**

```js
short or sampled:  velAbs = the LADDER velocity for its level, per pitch   · cc7Abs = { lo: R, hi: R }, R = DynTable.residual(level)
follow:            velAbs = the mf velocity (Rule 1)                        · cc7Abs = the table's two values of its own names (Rule 2)
```

**THE RESIDUAL** (`dyn_table.js residual`): each written step below `fff` is `STEP_DB − spanDb / 7` ≈ 2.29 dB through the instrument's
measured curve, `spanDb` the remap's written span (12). The ladder gives 1.71 dB a name, the set fader 2.29: together the table's 4 dB —
one scale for short and held on every instrument, whatever room its samples have. A short note therefore goes out on a CURVE channel
with one CC7 before its note-on and keeps the timbre of its own dynamic. Residual `pp`: cello 76 · bassoon 57 · english horn 75.

**A held note chooses** `sample | follow | auto` (§265): `follow` traces its level (a hairpin typed on it, or a generated level that
moves ONE WRITTEN STEP or more across its span); else it is sampled at its onset and held flat on the residual. No length dial.

**A voice with NO curve copy — his "b", D27 (2026-09-23, §301):** the SI2 three carry `ord` alone on their `b` ports
(`curveTechniques: ["ord"]`). A SAMPLED note there is a fader SET ONCE, not a moving controller, so it goes out on the note's OWN
channel — instance 1's part for the voice — with its residual pre-armed before it, exactly where a plain note gets its 127 today. The
score does this by itself: the note is a curve event, the map finds no pool, `preArm` sends `heldCc7` on the voice's channel. Only a
`follow` (a moving fader) still needs a copy: it stays velocity alone, struck on the LADDER at its first level, and the status says so.

**Not reached, and the status must say so:** no measured fader curve (the percussion; the vibraphone's mallet voices — the card
measured the bowed one) → velocity alone on MAIN, as before. The one helper is `score/public/texture_dyn.js`; SPACE, the column
preview and Insert all read it (§296 · §301).

## 4 · Moving CC7 lives on the CURVE CHANNELS only

D11: **MAIN ch 1 takes no moving controller** — his rack is built that way. Plain notes,
dynamics by velocity, articulation by CC0, nothing that streams. Every Kontakt port carries
ch 2/3/4 as CURVE A/B/C; the three IRCAM SI2 instruments carry theirs on a second UVI instance
on the `b` ports (`LGBassoonb` · `LGHornb` · `LGTrumpetb`).

- In the **score**: `Composer.curveChannelMap()` assigns them, round robin per player in time
  order, from `curveChannelsOf(lane, technique)`.
- In a **tool's Hear**: the tool must route them itself. The sequence drawer does it by
  marking a shaped note's `seat` `'c0'`, `'c1'`, … and wrapping `D.routeFor` from outside.
  The morph does it in `morph_emit.js` `curveSeatsFor` (PLAN 1h H3.3): the same round robin
  per player in time order, overriding each shaped note's route before a single message is
  built. The score needed nothing — an inserted morph note has always been a curve event.
- A technique with **no curve copy** stays on MAIN — and the tool's status must SAY SO, because
  such a note's fader will not move and nothing else will tell you.

### ⚠ THE MAP IS CACHED — `curveDirty()` after writing

`curveChannelMap()` caches by object id. Once the score has been played, a note that is not in
the cache **falls back to MAIN** and plays flat. This bug has now been found twice by two
different doors (RUNNING_LOG §75, then §139) and cost most of a session each time.

> **Any tool that writes a curve event calls `Composer.curveDirty()` before `renderAll()`.**

Who does, as of 2026-09-20: `sequence_ui` · `strike_drawer` · `morph_panel` (all four inserts)
· `swell_ui` · `fill_ui` · `cresc_*` · `note_card` · and since 2026-09-22 `texture_insert` (1o.5 · 1n.1).

---

## 5 · What is NOT touched by any of this

Flat notes **outside a sequence or a morph** (inside either, Rule 3) · plain notes · strikes · long tones · **trills** (the septet's trills carry volume
as separate STRUCK notes by velocity — checked 2026-09-20, nothing to fix) · niente fades
(`cc7Fade` still multiplies in **on top of** the answer `cc7Abs` gives).

**⚠ THE CRESCENDO TOOL WAS NEVER BROUGHT UNDER THIS LAW AT ALL.** `cresc*.js` writes no
`cc7Abs` and no `velAbs`, so a crescendo still strikes at its top's velocity with the fader
moving only inside the 12 dB ladder — the very fault 1e fixed everywhere else. That is PLAN
**`1f`**, `todo`: it reads the same table.

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

*Rule 3: RUNNING_LOG §157 · §158, PLAN 1g — and for the morph, RUNNING_LOG §171, PLAN 1h H3 (`score/public/morph_dyn.js`).*

*Source: RUNNING_LOG §137 · §139 · §140 · §141 · §142 · §143 — PLAN 1e (V1 … V7) — and for Rule 2 as it now
stands, RUNNING_LOG §147 · §148 · §150, COMPOSITION_NOTES LG-51, PLAN 1d.10 —
`docs/MORPH_NOTES.md` 2026-09-20 for the morph's part, which is method only until the morph is
revised.*
