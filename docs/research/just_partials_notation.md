# Notating a just partial — the standard for this piece

**Status: DECIDED by the composer, 2026-09-19** — *"Okay, this is good I'll pursue the recommendation."* (RUNNING_LOG §113; his question
LG-37; the research behind it RUNNING_LOG §108.) **Read this before notating any just-intoned note** — presentation score, performance
score, parts, the legend. This file is CURRENT STATE and is rewritten freely; the log is the history.
Pointers to it: `CLAUDE.md` (Orient from docs) · `docs/NOTATION_STANDARDS.md` §4.

**Nothing here is built.** It is a notation decision, waiting for the day the piece is notated. §9 lists what is still unverified.

---

## 1. The standard

A just note carries up to three LAYERS. Two are for everyone; the third only where the instrument has one.

| Layer | The mark | Who gets it |
|---|---|---|
| **WHERE**, at a glance | the accidental — quarter-flat, small arrow | everyone |
| **WHERE**, exact | the cents — `−49` | everyone |
| **WHAT** | the partial — `11°` | everyone |
| **HOW** | the valve combination — `T23` | brass |
| **HOW** | the harmonic circle + the string numeral | strings — natural harmonics only |
| **HOW** | nothing — the fingering is the player's | double reeds · stopped strings |

**The rules.**

1. **Cents are measured from the plain tempered note** — the written letter-name with its ordinary sharp or flat, the note a tuner shows.
   NEVER from the microtonal accidental. The accidental and the cents say the same thing twice, a picture and a number; they do not add.
   (It is Sabat's convention: his horn table carries values like +63.0, +80.5 and −110.8, which only make sense from the letter-name note.)
   **The score's legend says it in one sentence:** *"Cents are from the tempered note. The accidental is a picture of the same deviation,
   not an addition to it."*
2. **The fundamental is named once per chord** (per time container), not on every note — each note then carries only `11°`. This holds
   while a container's chord sits on one fundamental; a note from another fundamental carries its own: `11°/F♯`.
3. **Under about 20 cents, no special accidental** — partials 3 · 5 · 9 · 15 · 17: a plain notehead, the cents, the partial.
   *(The AI's rule of thumb, not a sourced standard — his to move.)*
4. **Spell the note so the cents stay within ±50.**
5. **Brass — the HOW is the valve combination,** and the instruction is "natural harmonic, do not correct". The lookup is §4.
6. **Strings — the HOW exists only for a natural harmonic:** the SOUNDING note with the harmonic circle, the string numeral, the partial.
   **No diamond** — for high partials there are several nodes, players have their own, and the touch-points are themselves microtonal, so a
   diamond is hard to read. The player picks the node. Every other string note is stopped: accidental · cents · partial, tuned by ear.
7. **Double reeds — no HOW.** Small deviations are lipped — what they do on every major third. The near-quarter-tones (11th · 13th) want a
   special fingering, and it stays the player's. The charts are in §8.

## 1a. The engraving — DECIDED 2026-09-25 (RUNNING_LOG §377 … §380; laid out on the english horn, section 1)

**The accidental's bands** (rule 3 made precise): **|c| < 20 → plain · 20 … 37 → an arrow on the note's own accidental (alone on a
natural) · ≥ 37 → the quarter-tone sign.** Over this piece's partials: 3 · 5 · 9 · 15 · 17 · 19 plain · 7 · 21 ↓ · 23 ↑ · 11 ¼♭ · 13 ¼♯.
On a ♯ note −49 = ¼♯, +41 = ¾♯; on a ♭ note the mirror; on a natural ¼♯ / ¼♭. The picture is computed from the tempered spelling
**in the realization's written pitch** (the video in C, the part transposed); the cents and the partial never change with it.

**Glyphs and fonts.** Music signs: Emmentaler (`notation/lib/glyphs.json`) — the quarter and three-quarter signs and the parens exist;
**six arrowed accidentals are NEW** (♯↑ ♯↓ ♭↑ ♭↓ ♮↑ ♮↓, baked from `emmentaler-20.otf` as the parens were). Numbers: **Crimson Pro Light
upright, 0.75 ss** (the cents' own size, `TS.instruction`) — the cents always signed with the true minus, no `¢` (`+41` · `−49`); the
partial `n°` with the fundamental after a slash, `26°/C1`, **always written on a part's line** (the player never sees the chord — this
piece's call against rule 2's "once per chord", which still holds on a score page). Instructions ("senza vib.") in Crimson Pro Light
Italic 1.0998 ss, baked on the `pizz.` recipe.

**Placement.** Over a new-pitch head, a column of two rows centred on the head: **the cents nearest the head** at D45's height (≥ 0.6 ss
over the head's ink, never inside the staff), **the partial one row above** (1.0 ss). A low head keeps its column above the staff. The
column never crosses a go line — wider than the head, it is right-aligned to the head's right edge. A reminder head (the same pitch,
parenthesised, cue size) carries no column. An instruction text sits 0.45 ss above the column's top, from the head's left edge.

## 2. What each mark is for — the why

Each mark serves a different MOMENT, which is why none of them is redundant.

- **The accidental — reading.** The eye finds the note at a glance; a bare number cannot do that.
- **The cents — the practice room.** Alone with a tuner, the player learns where the note sits.
- **The partial — rehearsal and performance.** A player told `−49` has a number and no sound to aim at. A player told `11°` of F♯ knows
  what to LISTEN DOWN to (the F♯), what colour to expect, and that the note locks when someone holds the 8 or the 4 (§6).
  **It also survives drift:** over a long chord the winds warm and the pitch moves; the cents are then wrong in absolute terms, the ratio
  is still right.
- **The valve combination — brass.** It turns the partial from a description into a physical instruction: the tube makes the ratio.

**Why this and not the alternatives (put to him as A · B · C).** *B, cents only* — Tenney's way: clean and exact, but it says nothing of
function and it is the mark that breaks under drift. *C, the partial for brass and cents for the rest* — each family its own language, but
the ear's cue (what to lock to) is wanted by every player, not only the brass. **A as decided** is two layers for everyone and the third
where it exists. Clutter is affordable here because the piece is sustained chords in time containers (LG-35) — few notes, long ones.
In fast music it would be too much.

## 3. Worked examples

**Horn — the 11th partial of F♯1, sounding C5 −49** (his own example, LG-37):

```
  11°       what
  −49       where, exact   — from tempered G5 as written; a concert-pitch tuner shows C5 −49
  G5 𝄳      where, at a glance — written G5, a quarter-tone flat (horn in F sounds a fifth below)
  T23       how — thumb + 2 + 3: the B♭ side lowered four semitones IS a horn on F♯1
```

**Bassoon — a 7th partial:** the note with a small down-arrow · `−31` · `7°`. No fourth line.

**Cello — the 7th partial of C2, a natural harmonic, sounding B♭4 −31:**

```
  7°        what
  −31       where, exact
  B♭4 ↓ °   where — the SOUNDING note, with the harmonic circle
  IV        how — the C string
```

## 4. Brass lookup — a fundamental for every valve combination *(AI arithmetic — NOT checked with a player)*

**Double horn, sounding fundamentals.** `T` = the thumb valve = the B♭ side on the usual set-up (some horns are reversed — ask).

| Valves | F side | B♭ side (T) |
|---|---|---|
| 0 | F1 | B♭1 |
| 2 | E1 | A1 |
| 1 | E♭1 | A♭1 |
| 12 (or 3) | D1 | G1 |
| 23 | D♭1 | **F♯1** |
| 13 | C1 | F1 |
| 123 | B0 | E1 |

**Every pitch class has a fundamental** (B0 … B♭1), so any chord's partials are reachable as natural harmonics — where the chord's
fundamental sits an octave below the horn's, only the even partials are (the horn's partial *m* = the chord's 2*m*).

**Trumpets, sounding fundamentals.** B♭ trumpet: 0 B♭2 · 2 A2 · 1 A♭2 · 12 G2 · 23 F♯2 · 13 F2 · 123 E2. C trumpet: 0 C3 · 2 B2 · 1 B♭2 ·
12 A2 · 23 A♭2 · 13 G2 · 123 F♯2. Between them E2 … C3 — **no fundamental on C♯ · D · E♭.** A trumpet fundamental is usually one or two
octaves above the chord's, so it gives the chord's even partials only. Usable to about partial 8–10 **[memory]**.

**The partials, in cents from the tempered note:**

| 3 | 5 | 7 | 9 | 11 | 13 | 15 | 17 | 19 | 21 | 23 |
|---|---|---|---|---|---|---|---|---|---|---|
| +2.0 | −13.7 | −31.2 | +3.9 | −48.7 | +40.5 | −11.7 | +5.0 | −2.5 | −29.2 | +28.3 |

(1 · 2 · 4 · 8 · 16 are 0; an even partial has the cents of its odd half — 6 = +2.0, 10 = −13.7, 14 = −31.2.)

**How exact the tube is — two views, both read.** Sabat & Hayward measured it (valve sensors, ring modulation against sine overtone rows):
*"naturally occurring inharmonicities demand that the players sometimes make fine corrections with their lips. However, once measured, the
valve-slide positions can be set before playing and the results remain consistent once the instruments have been warmed up."* The
Contemporary Horn is sceptical: *"each instrument … is different, and the placement of the harmonics remains quite variable"*; and short
tubes run flat, long ones (F side 23 · 13 · 123) sharp. **Reading: the tube gives the SLOT and the COLOUR; the ear gives the last few
cents** — which is §6. Ligeti's Hamburg Concerto asks for hands OUT of the bell so the harmonics sound exact; whether that is wanted here is
a question for the hornist.

## 5. Strings — when a natural harmonic is available, and what it costs

- **The open string is the fundamental;** a light touch at a node sounds partial *n*; the string makes the ratio, as the horn's tube does.
- **So the chord's fundamental has to BE an open string** — cello C2 · G2 · D3 · A3; bass E1 · A1 · D2 · G2; bass in SOLO tuning (solo
  strings) **F♯1 · B1 · E2 · A2**, an open F♯1. Or the open string is a low partial of the fundamental: a string that is partial *k* gives
  partials *k·m* — the cello's G string is partial 3 of C1, so its harmonics are C's 3 · 6 · 9 · 12 · 15.
- **The set is sparse.** A harmonic sounds in one fixed octave on one string. His horn's C5 −49 has no cello equivalent — no string is an F♯.
- **It changes the sound** — thin, glassy, quiet, no vibrato. Choosing one is a COLOUR decision as well as a tuning aid.
- **How high they speak [memory]:** cello good to about partial 8–10, fragile at 11–13; the bass higher, its strings being long.
- **The cellist tunes the open string to the ensemble's fundamental** — a cello tuned in pure fifths has a C about 6 cents under tempered.
- **The way round all of it is Radulescu's spectral scordatura** — retune the open strings to partials (*Lux Animae*: 3 · 4 · 7 · 11 of a
  low E). Not proposed; recorded in case a home fundamental ever wants it.

## 6. The scaffold that is not notation — tuneable intervals, and an orchestration rule

Sabat & Hayward: a *tuneable interval* can be found **by ear alone** — the beating slows and is *"replaced by a phenomenon of spectral
fusion"* — as against intervals merely memorised and approximated (their examples: 16/15 · 9/8 · 16/9, and tempered pitches). Their tested
*"least generative tuneable interval"* for each prime: **2/1 · 3/2 · 5/4 · 7/4 · 11/8 · 13/8 · 17/4 · 19/8 · 23/8**.

**What it means for the writing:** the horn's 11 locks by ear IF an 8 — or a 4, a 2, the 1 — of the same fundamental is sounding where the
player can hear it. So precision is partly an ORCHESTRATION rule: **low partials first · high partials entering a chord that already
sounds · long enough to settle.** The strikes drawer's HARMONIC SERIES banner already models exactly this — a fundamental and its ranks.

**A rehearsal aid, offered 2026-09-19 and not taken up:** the rack can render a tuning track per player — the chord minus their note, at
exact cents (what the Kepler Quartet built by hand for Ben Johnston's quartets **[memory]**).

## 7. A grid worth knowing — twelfth-tones (72-ET) against the partials *(AI arithmetic)*

| Partial | Just | 72-ET | Off by |
|---|---|---|---|
| 11th | −48.7 | −50.0 | 1.3 |
| 7th | −31.2 | −33.3 | 2.2 |
| 5th | −13.7 | −16.7 | 3.0 |
| 13th | +40.5 | +33.3 or +50.0 | 7–9 |

It is why sixth-tones plus quarter-tones serve Haas: the 11-limit lands within about 3 cents. The 13th is the one that does not.

## 8. What the composers do, and where it was read

| Composer | Layers | What the player gets |
|---|---|---|
| Grisey · Murail · Saariaho | where | the nearest quarter-tone (Grisey sometimes eighth-tones); no partial numbers in the parts **[memory]**; the aim is fusion, not beatless tuning |
| Haas | where + what | sixth- and quarter-tones, with the instruction that an overtone chord is tuned by ear **[memory]**; fundamentals always tempered; *in vain*: trombones on 6–7 of F♯1, horns on 5–6 of A1 |
| Ligeti (Hamburg Concerto) | how | natural horns on different fundamentals, partials 2–16, hands out of the bell, no correcting |
| Tenney | where, exact | cents over the notehead, the tuner as practice tool; *In a Large Open Space*: a series on a bass F, ±5 cents |
| Radulescu | how, strings | spectral scordatura, then natural harmonics |
| Sabat · Schweinitz · Hayward | all three | Helmholtz-Ellis accidentals (one sign per prime) + cents + valve fingerings; tuneable intervals |

**Fingering charts for the players:** Heckel bassoon in quarter-tones (B♭1–E♭5), fifth-tones and eighth-tones, largely Johnny Reinhard's —
the IDRS Bassoon-Family Fingering Companion · oboe and english horn quarter-tones — the Woodwind Fingering Guide · Veale & Mahnkopf, *The
Techniques of Oboe Playing* · Gallois, *The Techniques of Bassoon Playing* **[memory]**.

**Sources (opened 2026-09-19 unless marked):**
- Sabat & Hayward, *Towards an Expanded Definition of Consonance: Tuneable Intervals on Horn, Tuba and Trombone* (Plainsound, 2006) — https://robinhayward.com/pdf/artTowardsExp.pdf
- The Contemporary Horn — https://thecontemporaryhorn.com/en/microtonality/ · https://thecontemporaryhorn.com/en/table-of-harmonics-and-fingerings/
- IDRS, Heckel bassoon microtonal fingerings — https://www.idrs.org/resources/BSNFING/FINGMICR.htm
- The Woodwind Fingering Guide, oboe / english horn — https://www.wfg.woodwind.org/oboe/
- Musikfabrik on Ligeti's Hamburg Concerto — https://www.musikfabrik.eu/en/blog/a-compact-jewel-of-a-piece-ligetis-hamburg-concerto/ · https://en.wikipedia.org/wiki/Hamburg_Concerto
- *Partiels* — https://en.wikipedia.org/wiki/Partiels · Rădulescu — https://en.wikipedia.org/wiki/Horatiu_Radulescu
- Tenney, *In a Large Open Space* — http://routesandmethods.org/pgs/7_10_06.html · Wannamaker on *Arbor Vitae* — https://www.tandfonline.com/doi/full/10.1080/07494460701671566
- Haas, *in vain* — https://www.universaledition.com/en/Works/in-vain/P0045214 · https://ressources.ircam.fr/en/composer/georg-friedrich-haas/workcourse
- **Would not load:** Hasegawa, "Clashing Harmonic Systems in Haas's *Blumenstück* and *in vain*" (404) · the *Tempo* article on pitch precision in Sabat's orchestral music (403).

## 9. Not verified — check before relying on it

- **The horn fingering (§3, §4) is arithmetic, not checked with a hornist or on an instrument** — nor is the thumb convention of HIS hornist.
- **Haas's notation is from memory;** so are Saariaho's and Murail's grids, the trumpet's usable partials, how high string harmonics speak.
- **The 20-cent threshold (rule 3) is the AI's rule of thumb.**
- **The 11th sits on a tuner's flip point** — C −49 reads as B +51 if the player is a hair flat. The players are told once.
- **CHECKED 2026-09-25 (RUNNING_LOG §377): the PARTIAL IS SAVED for a sequence note** — in its `performanceNotes` (`… · partial 26 ·
  +41¢ just …`) and in the recipe (`databases.sequences[].recipe.containers[].chord[].partial`, with `cents` and `inst`); the cents also
  as `morphBend`. **A morph note carries the cents only** — its partial is read from the take the actual was dealt on
  (`bank/panel_snapshots.json`) at extraction. Not yet in the IR: the extractor carries neither until the notation device is built.
