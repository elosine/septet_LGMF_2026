> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/CRESCENDO.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated.

# CRESCENDO — the shape, the object, the rule (PLAN 1l)

*The reference 1m (the C key), 1n (the sequence filler) and 1o (crescendo strikes) cite instead of repeating. Built 2026-09-08 at the
composer's word; the talk is RUNNING_LOG §252–263, his words are CN-48.*

---

## 1 · The survey — his own vocabulary, read from his own pieces

The crescendo was not designed here. It was already his, in the tuba piece (`for_seven_tubas/docs/CRESCENDO_TAXONOMY.md`,
`CURVE_DATABASE.md`, `CRESCENDO_EXPERIMENTS.md`, `DYNAMICS_FRAMEWORK.md`, 2026-08-10 on).

- **The families.** **BLOOM** front-loaded · **SURGE** back-loaded · **linear** between them. A full spec reads *"8 seconds, surge 5×"*.
- **The threshold** is the half-loudness moment — *"surge 5×, threshold at two-thirds"*. About 10:1 is each family's working boundary.
- **The standard he used there:** **surge 5×**. His standing mix was *surge .7 / sine .3*, and *"longs always surge"* (COMPOSER_LOG,
  2026-08-12).
- **The time scales:** gesture < 2 s · breath 2–12 s · phrase 12–60 s · formal > 1 min.
- **The peak behaviours:** cliff · tail · hold · handoff · overshoot. His own research pillar P2 says the peak is what the listener
  remembers, more than the interior shape.

**The ratio ↔ slope ladder** (his `CURVE_DATABASE.md`, and this app draws these by name already):

| family | model | 2× | 5× (standard) | 11× | 25× |
|---|---|---|---|---|---|
| surge | `exponential` | 0.17 | **0.40** | 0.60 | 0.80 |
| bloom | `logarithmic` | −0.18 | **−0.29** | −0.37 | −0.46 |
| linear | `power` | — | 0 | — | — |

**Two findings that made the build cheap.** (i) The ladder maps straight onto this score's own curve segments, so a crescendo needs no
new machinery — the app's presets are literally `surge` exponential 0.40, `bloom` logarithmic −0.29, `line` power 0. (ii) 1g's measured
law already makes a curve's height the same loudness on every instrument, and a held note already takes its velocity from the curve's
top with CC7 following (§120). Only the SHAPE was open.

---

## 2 · The listening test — a score file, not a rack probe

His ask (§256): *"can you put the probe in the main score as and experimental save file? this way you can add all the tests for all the
players and I can solo"*. The earlier probes measured machines; this one asks his ear, so it belongs in the instrument he listens with.

`node tools/cresc_test.js` writes **`scores/cresc-test.json`**: three shapes × three durations = 9 columns, **the same times on all
seven lanes** (his "a", §257), 63 crescendos over 73.5 s, a marker naming each column, each on the player's ordinary voice at the middle
of its range, ppp … fff, a cliff at the top, the morph orange.

| | Fl | BCl | Pno | Vn1 | Vn2 | Va | Vc |
|---|---|---|---|---|---|---|---|
| pitch | F#5 | D3 | F4 | F#5 | F#5 | B4 | C4 |
| voice | ord | senza_vel | main | senza_vel | senza_vel | senza_vel | senza_vel |

**How he uses it:** open it, press **S** in a lane to solo (ALT-click = exclusive), play, loop; bend a curve by hand to hear a variant;
the file is his to mark up. `--durations`, `--shapes`, `--ratio` and `--gap` regenerate a different grid in one command.

**What the shapes do to the sound** (measured through the score's own law, Vn1 F#5, the 5 s column):

| shape | CC7 at 0 · ¼ · ½ · ¾ · 1 |
|---|---|
| surge | 88 · 93 · 100 · 109 · 127 |
| line | 88 · 98 · 107 · 114 · 127 |
| bloom | 88 · 103 · 111 · 121 · 127 |

**Caveat named at the build:** the piano cannot really swell. Its column is a CC7 fade on a decaying note. It is in the file because he
asked for all the players; judge it as what it is.

**His verdict (2026-09-08, §263):** *"the surge is the default, we can keep the others as options, the bloom needs to be revisited but
defer til first use"*. So **surge 5× is the standard** — what every build makes unless told otherwise; **line and bloom stay in the
menus**; **bloom's ladder is revisited when a piece first asks for one** (its 5× reads front-loaded here, and whether that is the bloom
he wants is a question for the music, not for a grid).

---

## 3 · The object — a crescendo is a held note whose curve rises

Decided §254 (his (a)). No new object type: the score's own drag, stretch, delete, undo and save already work on it, the tick already
plays it, the extractor already reads it.

- **The note:** a `waveCurve` with a `sonifyNote`, two nodes (the dynamic range) and one segment whose `model` and `slope` carry the
  shape; `technique` the player's ordinary voice.
- **The provenance** `properties.cresc`: `{ shape, ratio, slope, threshold, dynLo, dynHi, end, gapTo, endGapS, peak }`.
- **Drawn** filled and transparent in the morph **orange** `#C2410C` — the colour the tuba piece's morph section wears, and curve
  window A's.
- **Edited** the newest way, his correction (§254): the three curve-lane overlays, **no slope diamond — the LINE is dragged to bend**.
- **The end** (§255): the peak is a **CLIFF**; it runs to **0.17 s** before that player's next note; with no later note, **5 s** (a
  trill's fallback moved to **3 s** at the same time). A typed duration overrides both and says so.
- **No room** is an answer: when the next note is closer than 0.3 s the maker returns nothing rather than drawing a crescendo over it.

`score/public/cresc.js` — pure, on the page and in node. `make(at, pitch, player, notes, opts)`, `endFor`, `segmentFor`, `heightAt`,
`thresholdOf`, `describe`, `dynHeight` / `dynName`.

---

## 4 · The rule — a player is free 150 ms after its last sound ENDS

His rule (CN-48), generalised at his word (§256) to every sound in the app, with one clause the measurement forced (§260).

- **From the END, not the attack.** Once an event occupies time — a crescendo, a trill, a beating — measuring from its start says
  nothing about whether the player is busy.
- **THE GESTURE CLAUSE:** the rest applies **between gestures, never inside one**. Notes sharing a group (a morph's `grp-morph-NN`, a
  beating's zone, a strike's group) are one continuous sound and never block each other.
- **Why the clause exists.** Measured on his piece: the plain rule would newly block **33** pairs — **18** of them the morph's own
  re-breaths (a string holding 6–10 s and re-bowing 50 ms later, in the BLOOM at 183 s). A re-breath is not a new articulation.
- **What it does to his strikes: nothing.** 517 of the piece's 549 notes are ≤ 200 ms and the median is **63 ms**, so 63 + 150 = 213 ms
  is looser than the 250 ms attack-to-attack the run used.
- **The other 15** of the 33 are existing trill → strike transitions already 110–148 ms apart. They stand exactly as he wrote them: the
  rule governs new generation and never rewrites the score.

`score/public/spacing.js` — pure. `eventsOf(objects)`, `free(t, events, { restMs, group, dur })`, `freePlayers`, `tightest`.
The strikes drawer's chord engine asks it in spirit: its box now reads **"rest after the end ≥ ___ ms"**, default 150, and it tracks
each player's END (`soundMs` is how long one dealt sound lasts, so 1o will pass a crescendo's own length).

---

## 5 · Secco — the cut, and the rotation that lets the sampler survive it

His ask (CN-49): *"I would like a secco setting, maybe a checkbox, secco on by default … strings would damp the string with a finger
or bow pressure at the end of the crescendo to give an abrupt cut; for the sampler a cc7 cut so nothing rings after the end"*. It is
the cliff's performing technique.

**In the notation (2a):** the word *secco* under the note for everyone — for the strings it names the action, for the winds it tells
them the shape the strings will make. The string quartet does the same, as text beside "Non-Vib".

**In the sound:** `Composer.seccoCut` sends **CC7 0 on the crescendo's own slot 10 ms before its note-off**, so the sample stops
rather than decaying. **The guard:** never while another sound of that player is still running on the same port and channel.

**Why a rotation is needed at all.** This rack pins **CC7 = 127 before every event** (REAPER_CONTROL §3, D11) and gives each
instrument **one slot** — the strings run all 88 articulations through channel 1 by CC0. So the next note on that player re-pins the
slot the cut was made on, and if that happens too soon the cut note's tail comes back (his memory of the quartet, §264; the quartet
solved it with three instances). **The tolerance is unmeasured on this kit** — `scores/cresc-secco-test.json` asks his ear for it.

**The pool.** `pool[instKey]` is a list of channels — extra Kontakt slots holding the same instrument. `Cresc.assignSlots` walks a
player's crescendos in time order and gives each the least-recently-cut slot that has rested the tolerance; `applySlots` writes it
into `properties.cresc.slot`, and the tick sends on it. **Empty pool = no rotation**, the ordinary voice's own channel, as today.

**How many slots.** With a pool of N a slot returns every N crescendos, 0.17 s apart, so the rotation holds when
`N × 0.17 + (the N−1 crescendo lengths between) ≥ tolerance`:

| pool | shortest average crescendo that holds, T = 2 s | T = 3 s |
|---|---|---|
| 3 slots | 0.75 s | 1.25 s |
| 4 slots | 0.44 s | 0.78 s |

**Three is the plan**, since his gesture scale starts near 1.5 s. The tool **warns** when the rotation cannot keep the tolerance,
naming the moment — that warning, not a guess, is the signal to add a fourth.

**This is D11, not a new idea (§270–271).** He decided it on 2026-09-03 in these words: *"there's going to be events that happen
right after a crescendo much sooner than two seconds … a crescendo in the violin that goes to secco … the next event might come in
in a hundred and fifty milliseconds … So probably better to continue using multiple channels."* Every Kontakt port carries **ch 1
MAIN** (plain notes; no moving controller) and **ch 2 / 3 / 4 CURVE A/B/C**, round robin. His rack has held those four slots since;
the app had never read them, which is the only reason a cut was revivable.

**Wired 2026-09-08 (PLAN 0f / 0c.7, §271):** the recipe's `channels: { main, curve }` (the four strings had it; the bass clarinet
was added), `Composer.curveChannelsOf` · `isCurveEvent` · `curveChannelMap` · `channelFor`, and `resetCC7All` sweeping the curve
channels too. **Proved by the decoded MIDI:** violin 1 cuts its crescendo on channel 2 and re-pins the next note on channel 3 — the
tail cannot come back; the flute does both on channel 12, because it has no bank.

| player | curve bank | the secco cut |
|---|---|---|
| Vn1 · Vn2 · Va · Vc · BCl | ch 2 · 3 · 4 | safe by architecture — the next event is on another channel |
| Flute | `Fluteb` ch 4 · 5 · 6 (three Ordinario copies) | safe by architecture, once those copies are loaded |
| Piano | none | a piano cannot swell; main only |

**The flute is decided (2026-09-08, his "use the kontakt standard and the appropriate number of addl instances").** On UVI a channel
IS a technique — 26 of them over 16 channels on `Flute`, 4 more on `Fluteb` — so a curve channel must be a curve COPY, not the same
instrument again. `ord` is the only flute technique a crescendo, a morph note or a drawn swell uses, and `Fluteb` has thirteen free
slots, so **three copies of Flute Ordinario on `Fluteb` channels 4 · 5 · 6** give the flute the Kontakt standard for the least work.
The recipe carries it (`curve` entries may name their own port; `curveTechniques` says which keys the bank serves), and the router
follows: the flute's crescendos route to `Fluteb` 4 · 6 · 4 · 6 · 5, cutting on one channel and re-pinning on another.

**DONE, 2026-09-08 (§275):** he loaded **Flute Ordinario three times into the `Fluteb` UVI instance on MIDI channels 4, 5 and 6**, and
the copies were then corrected through the UVI text path — their gain raised 0 → **+6 dB** to match every other flute part, and the
DigitalEq and Maximizer bypassed with the Grain Hall convolver left on, his own convention on the three older parts. **All seven
players are now protected by architecture, in the rack as well as in the app.**
**Still on MAIN and still to do:** trills and beatings carry precomputed snippets with explicit channels, so they have not moved yet
— the next piece of PLAN 0f.
**His standing principle beside it (CN-50):** *"the rotation happens in the back-end … so we don't have to think about it on the
front end"* — the playback architecture absorbs the sampler's limits; the demo must not be shoddy; no long chase after intractable
playback problems.

---

## 6 · The C key, the card and the harmony bar (PLAN 1m — built 2026-09-08)

His picture (CN-48): *"c key, little panel, default dynamic range and duration (til next note or if no note a standard duration), and
articulation, but I can change any of them there in the mini panel"*; and (§278) *"so maybe I'm working with something from the harmony
drawer … I choose the harmony, and then it just goes down the line, one at a time, as I press C"*.

### The key

**C on a selected note** makes a crescendo on that pitch AT ONCE, with everything section 4 settled: the standard curve (surge 5×),
ppp → fff, the cliff, secco on, and the end 0.17 s before that player's next sound. The card opens on it, so every change is heard —
his (a) at §276. **The source note is greyed, never destroyed**: it is stamped `mutedBy` exactly as a trill stamps the notes it eats,
and it comes back the moment the crescendo is deleted (§277 — *"the same grey original which can come back with delete of cres as
trills"*). Several notes selected give **one crescendo each under ONE undo**; a note the rule cannot fit is skipped and counted, never
crowded.

**Two refusals, both spoken:**

| the case | what it says |
|---|---|
| the next sound is closer than 0.47 s | *no room for a crescendo there — the next note on that player is too close* |
| the player is still sounding at that instant | *Va is still sounding at 12.70 s — free at 12.94 s (the 150 ms rest after its last sound ends)* |

The second refusal is section 4's rule doing its work: the end rule only looks FORWARD, so without it a C at a playhead inside a held
note would lay a crescendo on top of a player already busy (§284). **What counts as "still sounding" is every event class** — another
crescendo, a trill zone, a beating zone, and any plain note not already greyed — read through `spacing.js`, with the gesture clause, so
a morph's own re-breaths never block it.

**Measured against his piece** (`piano-harmonics-test.json`, 593 sounding notes, every one inside a gesture):

| | notes |
|---|---|
| C would make a crescendo | 526 |
| refused — the next sound is too close | 52 |
| refused — the player is still sounding | 15 |

### The card

Four controls, each opening on 1l's default, each written onto the LIVE crescendo so a turn of any of them is audible at once:

- **the dynamic range** — two dynamics, ppp … fff;
- **the duration** — what the end rule gave it, typed to anything else, with *by the rule* to put it back (the readout says which);
- **the articulation** — that player's own techniques, opening on its **ordinary voice** (Ordinario on the flute; Senza Vibrato
  Velocity on the strings and the bass clarinet — confirmed with him 2026-09-08);
- **secco** — the tick, on by default (CN-49).

**♪** hears it alone; **▶ in context** plays a second either side of it and stops itself. **ENTER** keeps, **ESC** removes a crescendo
just born (and closes one merely reopened), **CTRL+Z** undoes. The card **remembers the range and the tick** between crescendos, so a
passage keeps one character without re-setting it; the duration does not carry, because the rule is per note. **A click on any existing
crescendo reopens the card on it** — the card is the editor as well as the maker.

Verified in the running app (a `zz-ai-` copy of his piece, real key and mouse events, the MIDI decoded): the ♪ of a bass-clarinet
crescendo sends on **channel 2 — CURVE A**, a CC7 ramp 86 → 127 under the measured loudness law, then the secco cut CC7 = 0 ten
milliseconds before the note-off. The crescendo draws filled in the morph orange `#C2410C` at 0.45; the greyed source draws in
`#C9A05A` at 0.15, the same faint the trills use.

### The harmony bar

A strip on the **active lane**. Pressing **C with nothing selected** takes the next pitch of a standing sonority, **folds it by octave
into that player's range** (1k's own rule), and puts a crescendo at the playhead.

- **the sonority** comes from the morph panel's OWN pitch menu — his kept sets, the starters, the models' sets, the stacks and
  Messiaen modes from a typed root, the strikes, the tuba piece's blasts, the 2-pianos chord shapes (163 sonorities on this piece).
  It is reused, not rebuilt: `MorphPanel.pitchOptionGroups()` and `MorphPanel.sonorityOf()` now serve both menus (CN-53).
- **the order** is 1k's deck: in turn · shuffled to completion then reshuffled · random — all seeded, so a sequence repeats exactly.
- **what is left** shows as a count, with the lap number once it has been round once.
- **change…** and **restart** are the two buttons; continuing is pressing C again.
- A refused press does **not** burn a pitch — the deck moves only when a crescendo is actually placed.
- Every crescendo born this way records its provenance in `properties.cresc.fromHarmony` (the source, the raw pitch, the fold, the
  order, the seed, the lap), and its performance note says the fold: *F2 folded +1 8ve*.

**The bar is the BROWSER'S, not the file's** — like the piano's lines bar. It lives in `localStorage` under `septet.crescBar.v1` and
says so in its own tooltip.

---

## 7 · What is not here yet

- **His verdict on the standard** (step 1's last to-do) and on the C key itself.
- ~~1n — the sequence filler~~ **BUILT 2026-09-08** (`docs/STRIKES_TOOL.md` §Y): fill mode in the strikes drawer lays a long on
  every attack of a pattern, each in another instrument — the anchors as attack ids, the seeded rotation, seven pitch strategies,
  the three scopes. A crescendo written by it is one of these objects with a `fill` block; a cut one ends at the END of the accent
  note rather than 0.17 s before it, which is the one place 1n departs from §4's rule.
- ~~1o — crescendo strikes~~ **BUILT 2026-09-08** (`docs/STRIKES_TOOL.md` §Z): a SOUND SWITCH in the strikes drawer turns every
  dealt sound into a swell — *chords + crescendo* is 1o — with the length a multiple of the local gap and the multiplier as the
  density dial. Three of his four asks for it were already built by 1g, 1l and 1k. The crescendo suite is complete but for his ear.
- **The notation of a crescendo** (2a).
- **The velocity of a crescendo's attack:** the app takes the note-on velocity from the curve's TOP, so a crescendo attacks at its
  loudest velocity and CC7 shapes it down. That is how every held note in this app has always played, trills included — but it is
  worth his ear on a ppp start.
- **Trills and beatings are still on MAIN:** they carry precomputed snippets with explicit channels, so they have not moved onto the
  curve banks yet. That is the rest of PLAN 0c.7, not a crescendo question.
