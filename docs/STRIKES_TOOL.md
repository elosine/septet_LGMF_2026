> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/STRIKES_TOOL.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated. The composer named this drawer as the model for the pattern tool he wants here (COMPOSITION_NOTES LG-7).

# STRIKES TOOL — requirements, gathered piece by piece (PLAN 1c.2)

> Opened 2026-09-03. The composer builds this tool WITH the AI, one requirement at a time:
> *"gather these requirements and organize them for now, and I'll give some more, piece by
> piece."* This file is the organized list — the composer's words verbatim in quotes, the
> AI's reading and implementation notes marked as such — and it grows as the tool does.
> Status per item: `wanted` → `built` → `seen by the composer` → `accepted`.
> The database behind it: `bank/scattered_strikes.json` (tools/strike_db.js, RUNNING_LOG §36).
> **The build: `score/public/strike_drawer.js`** (2026-09-03 night, RUNNING_LOG §39) — the full-width
> drawer in the composer score; the v1 panel (§37) is gone. Open the score, press `Strikes`.

## A · The keyboard view — `built 2026-09-03 — the drawer, for the composer's test`

> *"Let's start with the keyboard like image one. This will show the notes as I played them
> on the piano, in each of the scattered strikes … I should see one at a time."*

- A vertical piano keyboard (the tuba Blast Sandbox's `chordview.html` keyboard is the
  picture: vertical keys, `C3` / `C4` octave labels, every sounding note a coloured dot on
  its key with its name beside it; pitch-class colours, octave doublings in the same colour).
- Shows ONE strike at a time — the notes as played, from the database.
- *AI notes:* reuse `chordview.html`'s keyboard drawing and pitch-class palette; range = the
  ensemble's (cello C1 36 to flute C7 96, with the piano's 21–108 available); a strike picker
  sits above it (the v1 picker). Open, deferred by the composer ("we'll come back to these
  things"): whether the keyboard can also show all strikes; how the keyboard and the v1 note
  table relate (the table may become the per-note assignment view under the keyboard).

## B · Voicing presets — `built 2026-09-03 (six presets + reshuffle; cluster = smallest chromatic span, ± octave)`

> *"Then I want some preset buttons. I'll give you a few choices now, but I want the ability
> to just add while I'm working with the tool — I can just tell you I want more of these."*

The starting set:
1. **original** — *"one the original"*: the notes exactly as played.
2. **spread out** — *"one spread out. Try to achieve an even spread."*: the same pitch
   classes displaced by octaves to fill the register as evenly as possible.
3. **cluster together** — *"one cluster together, and then I'll be able to move that cluster
   to different octaves"*: the notes packed as tightly as possible, with an octave position
   the composer chooses.
4. **cluster low** and 5. **cluster high** — *"one that's clustered low and clustered high"*:
   the tight cluster placed at the bottom / the top of the register.
6. … *more added on request while working.*

**Clarified by the composer (2026-09-03):** **cluster together** = everything collapsed into the
smallest chromatic span, the same octave if possible, and that tight cluster can be MOVED
around the octaves (a high tight cluster, a low one …) · **high and low clusters** = two tight
clusters, one high, one low · **spread out** = as much even pitch space between the notes as
possible — *"you don't have to optimize it, but try to have the notes spread out"* · the menu
is extensible: *"when I'm listening I'll say, oh, I want to hear it like this."*

- *AI notes:* a preset = a VOICING transform on the strike's pitch-class content (D11 of the
  tuba piece: a voicing is the pitch set only; articulation and dynamics are a separate
  layer) — the harmony stays, the octaves move. "Spread" has a precedent in
  `tools/vert_bank.js` v2 (octave displacements, max–min spread greedy). "Cluster together"
  needs one decision (asked below): chromatic packing (semitone-adjacent within an octave)
  or the played intervals compressed. Presets are data (a small table of named transforms),
  so adding one is a line, not a build.

## C · Reshuffle — `built 2026-09-03`

> *"I want the ability to reshuffle any of these. So if it's a cluster high, then I can just
> hit reshuffle, and I'll just reshuffle the notes into a different high cluster."*

- One button: re-randomize the current preset's realization under its own constraint (a
  different high cluster, a different even spread …); the harmony never changes.
- *AI notes:* each preset exposes a random seed / a "variant" counter; reshuffle advances it;
  the keyboard redraws. The seed is kept with the strike so a liked shuffle can be inserted
  and recalled.

## D · Carried over from the first ask (RUNNING_LOG §33) — `re-fitted into the drawer 2026-09-03 (v1 panel removed)`

- Per-note instrument / octave / technique assignment; Hear through the rack; Insert at the
  playhead as a gesture (groupId + META shape); time × / warp / rhythm-only; the redaction
  groups. All in the v1 panel; their place in the new layout is decided as A–C land.

## E · The orchestration panel — `built 2026-09-03 (shuffle · may fold · top/bottom locks · articulation per row · dotted lines)`

> *"To the right of the keyboard will be the orchestration panel. Let's just have the seven
> instruments in their order from top to bottom. And then I'll be able to shuffle with a
> button, and there'll be dotted lines drawn from the keyboard keys to the instruments — which
> notes are playing them. I don't necessarily want the flute to always be on top. I want to
> hear a shuffle."*

- Right of the keyboard: the seven instruments, score order top to bottom (D10).
- **Shuffle**: a random assignment of the strike's notes to instruments. Dotted lines from
  each key to its instrument show the assignment.
- *AI notes:* the lines are SVG over both panels; each instrument row also lists its note(s)
  and technique (the v1 selects move here).

## F · Ranges — `built 2026-09-03 (adopted; the shuffle never misfits, hand choices fold ↑↓ or ✕)` · `hand assign 2026-09-04 (U7 → U10): a plain click on a row gives it the armed note — what the row had goes to nobody, the note stays wherever else it is (a doubling); shift-click keeps the row's note; click a note in a row to take it off; each realization takes its row's current technique`

> *"What happens when the ranges don't fit? … I don't want things to be too fiddly."* — the
> AI's proposal, adopted by the composer ("Those are good suggestions. Let's adopt those."):

1. **The shuffle never produces a misfit**: it draws only assignments with every note inside
   its instrument's range.
2. **A hand assignment that doesn't fit gets one click:** **fold** (default — the note moves
   by octaves into the range; its line shows ↑ / ↓) or **skip** (nobody plays it; greyed).
3. **One switch, "shuffle may fold":** off = played registers only (a low strike stays with
   cello, bass clarinet, piano); on = the shuffle may fold pitch classes by octave, so any
   instrument can take any pitch class.
4. **Top / bottom locks:** "top → instrument", "bottom → instrument"; the shuffle respects
   them and moves everything else.

## G · Audition modes — `built 2026-09-03 (Hear piano · Hear orchestrated · Stop)`

> *"I want to be able to hear the chord, audition it, and then if I want to reorchestrate.
> And same with the piano part too — let's have that just be piano, and I can listen to the
> harmony as a piano, or I can listen to orchestrated."*

- Two Hear modes: **piano** (every note of the strike on the piano lane, the harmony alone)
  and **orchestrated** (the current assignment through the rack). Both from the same button
  row; the timing transforms apply to both.

## H · The piano's part — `built 2026-09-03 (flags per note, ring, click-to-toggle, quick buttons; a shuffle starts the piano on one note)`

> *"Sometimes I'll want it to double — play more than the one note — or just play one note."*
> and, on the four-way switch first proposed: *"I may want it to play all the above … It might
> just be one note. It might be some of the notes, like the top and the bottom note, or three
> notes, whatever. It might be all, and I like the rest too. But is there a different
> organization or logic we should try here?"*

- *AI proposal, the second (awaiting the composer's yes):* **the piano's part is a SELECTION
  of notes, not a mode.** Every note of the strike carries a piano flag — the piano plays it
  or not, independent of who else plays it; on the keyboard a ring around the dot means
  "piano too". **Click a key to toggle** its ring (top + bottom, any three, any subset — no
  menu). The former modes become **quick buttons** that set the flags: none · one · top+bottom
  · rest · all; "rest" recomputes after every shuffle. The shuffle assigns the six other
  players; the piano's flags persist unless a quick button is pressed. The same flag idea
  extends to double stops later (a second-note flag on a string player).
- **Adopted, with the composer's starting rule:** *"for the shuffles, let's initially start the
  piano with just one note, and then I could add more notes to the piano part as you suggest."*
  So a shuffle treats the piano as one player among seven (one note), and the flags / quick
  buttons add notes afterwards.
## I · Double stops — `wanted 2026-09-03 — not built yet, after the listening pass`

> *"And, yes, on the double stops."* (to the AI's note that the piano's per-note flag extends
> to a second-note flag on a string player)

- The four strings may take a second note: the same flag mechanism as the piano's — a
  string player's row accepts two notes; on the keyboard the second note's line goes to the
  same player. A shuffle starts every string on one note; the second is added by hand (click
  the key, then the player) or by a quick button later if wanted.
- *AI notes:* playability of the pair (an interval reachable on adjacent strings, both notes
  inside the range) is checked with the same fold / skip rule as F; the check itself is the
  string-writing knowledge from piece #1 (Xsample strings), to be written down when the
  first double stop is placed. Winds cannot take two; the bass clarinet's multiphonics are a
  technique, not a second note.

## J · The rhythm column — `built 2026-09-03 (span × · shape + amount · jitter · reverse · rotate · reshuffle; the bands re-derived live)` · `reset rhythm 2026-09-04 (U5): one button back to as played; span / amount / jitter undoable; a strike re-pick clears reverse and rotate` · `U11–U12 2026-09-04: = ms and gap ms boxes; drop rests (the sounding notes spaced by themselves)`

> *"A third column will be the rhythms. A relatively zoomed-in view where I should be able to
> control zoom to a certain extent. Something close to the piano keyboard, or they could just
> be distributed equally vertically, whichever works better. And then I can do some rhythmic
> transforms — make the rhythmic cluster looser or tighter; maybe you can suggest some
> transforms where the actual gaps spread out in different ways, not just equally. And I
> should be able to see this in the visual."*

- *AI recommendation:* aligned with the keyboard — each onset a dot at its key's height, time
  left→right, so pitch, onset and instrument line share a row; auto-fit the strike's span,
  a wheel / slider to zoom closer; the 60 ms redaction groups as faint bands behind the dots.
- *AI's proposed transforms* (note count kept; the span multiplier separate): **tighter /
  looser** (span ×) · **shape** — where the gaps go: even · front-loaded · back-loaded · centred
  · edges · as played · **amount** (0–1 blend between as-played and the shape) · **jitter** (± n
  ms per onset) · **reverse** / **rotate** (the gap sequence mirrored / cycled) · **reshuffle** (a
  new random scatter, same count and span). One menu, three sliders, two buttons; live redraw.
- Composer on the transforms: *"the transforms sound good. I think I have to hear them first. And
  just like with the pitch clustering or spread out, I might want to add more later once I hear
  things."* — so: build the set, listen, extend on request (as B). The bands were drawn for him
  (a diagram in chat, 2026-09-03): each band = the 60 ms after a kept tick; every dot inside
  merged into that tick — gone from the rhythm, kept in the harmony.
- **Rule (composer's question, 2026-09-03: *"what happens if I spread out the rhythm? Do the inner
  sixty-millisecond ones get their own attack?"*): the 60 ms grouping is DERIVED from the current
  timing after every transform, never frozen — spreading splits groups into their own ticks,
  tightening merges more; the audio always plays every note at its own onset; "rhythm only" snaps
  each note to its CURRENT tick. The database keeps the as-played grouping as a reference only.

## K · The order of the notes — `built 2026-09-03 (presets · shuffle · click two dots to swap; lock not yet)` · `2026-09-04: the two-dot swap FIXED — it had never held (every render re-derived the slots from as played); the menu now shows "by hand"; seeds + history per U8`

> *"I should be able to scatter the order. I think I'm mostly playing, in the original, down
> to up, but I can scatter which notes come first, in different orders. Again, a shuffle and
> then some sort of manual override where I can move things about."*

- The decomposition: **J is the onset PATTERN** (where the ticks fall), **K is the ORDER**
  (which note takes which tick). Each shuffles on its own.
- Presets: as played · low → high · high → low · outside-in · inside-out · random.
  **Shuffle** draws a new order; the ticks stay. **Manual:** drag a dot to another tick
  (snaps to slots) or click two dots to swap; a **lock** pins a dot's slot through shuffles
  (as the top / bottom locks do in the orchestration).

## L · The model in one sentence — `confirmed 2026-09-03 — coded as the three lists`

> Composer: *"Can we flatten both? So the pitches get distributed — there's eleven, and any
> pitch can go to any of the players — and then the scatter rhythm is the x axis: any of the
> rhythmic positions can go to any of the pitches, to any of the players, not necessarily the
> way they're shown here or the way I played them. Is that correct?"* — Yes.

- **Three independent lists:** the PITCHES (the strike's harmony), the ONSETS (its rhythmic
  positions, with the live 60 ms bands), the PLAYERS (seven). The tool pairs them; every
  pairing is free — pitch ↔ onset (K), pitch ↔ player (E), ranges permitting (F). "As played"
  is one pairing kept as a preset. The bands belong to the onset list alone; whatever pitch
  lands inside one lands on that attack.

## M · The harmony collection as a source — `wanted 2026-09-03 — not built yet (= PLAN 1d)`

> *"Then we'll collect all the harmonies … a drop-down and scrollable panel like the one in the
> blast sandbox, so I can drop that down, click on any of the harmonies, and play them. And
> when we collect the harmonies from the various pieces, let's give a better indexing system —
> numbers are okay, but consistent and simple and easy to understand. … the chord shapes from
> the two-piano piece, all of these blasts, and I believe some other ones scattered about the
> tuba piece — Messiaen, clusters, octaves, stacked fifths. This would be a view onto that
> harmony collection."*

- The strip from the tuba Blast Sandbox (mini vertical keyboards in a scrollable row, a
  drop-down, play, auto-hear) as the harmony picker; click = load the harmony into the tool.
- Sources inventoried 2026-09-03: tuba `blast_taxonomy.json` (20 harmonies, 138 sonorities,
  3 custom lists), `cluster_bank.json` (44 clusters), `pulse_palette.json` (29 sonorities,
  S008–S047), Messiaen mode 3 on F (26 pitches, PLAN #4); the two-pianos chord shapes (inside
  its saves' `databases.chordShapes`); the septet's own strikes (46 so far).
- **Index proposal:** one running number for the whole collection, `H001`, `H002` …, assigned
  once, never reused (append-only), plus a source tag and the original name in the label
  (`H042 · tuba vert 28 V4 · C4 C#4 D4`). Numbers are what gets said aloud; the tag says where
  it came from.

## N · Choosing a harmony: orchestrating it into the strike — `adopted 2026-09-03 — not built yet (needs M)`

> *"If I choose a harmony, it's got to be orchestrated into this scattered shape — what the
> piano keyboard represents. Similarly even the played version has to be reorchestrated so the
> ensemble can play it."*

- *AI proposal:* the orchestration and the order are stored **by voice rank**, not by pitch:
  voice 1 = the lowest note … voice n = the highest. A new harmony with n notes maps 1:1 onto
  the same ranks — the same players, the same onsets, the same piano flags — so the built
  arrangement survives the swap. Ranges then adapt by F's rule (fold, marked ↑ / ↓, or skip).
  A harmony with MORE notes: the extra voices go where the piano flags say (rest) or stay
  silent; with FEWER: the surplus players fall silent. Every harmony, the played one included,
  goes through the same path — there is no special case.

## O · Not losing work: takes — `built 2026-09-03 (v1: takes in the browser's localStorage + one-level back)` · `v2 2026-09-04: takes in bank/panel_snapshots.json (bucket strikes) through /api/snapshots, committed with the repo; the v1 browser takes migrated once on the next reload; × deletes the named take (asks first)` · `U9 2026-09-04: ENTER in the take box saves; the take controls wrap as one group`

> *"I don't want to lose work. Say I take the original, orchestrate, find a rhythm, listen —
> then I decide I want to listen to it in a different harmony. It may not fit the orchestration,
> but I don't want to lose what I built, and I want to easily hear my choices, and go back."*

- *AI proposal:* the tool's whole state — harmony, onset pattern, order, orchestration, piano
  and double-stop flags, transforms, seeds — is a **take**. `Save take` names it (the panels'
  snapshot loop, `bank/panel_snapshots.json`); the take list is a drop-down; `Load` restores
  one; switching the harmony is non-destructive (N) and an automatic `previous` step keeps the
  last state so `back` is one click. A take can be inserted into the score at any time.

## P · The Messiaen modes — `wanted 2026-09-03 — not built yet`

> *"Messiaen — and there's more than mode three. I think we end up using all the modes … it
> might have been in the multitempo parts where it was distributed across time, not in one
> chord. So those aren't really chords, but maybe we can add them: pull in all the Messiaen
> modes, and we can just use your attrition strategy, or the shuffle can randomly choose what
> to drop."*

- All seven modes of limited transposition in every transposition (2 + 3 + 4 + 6 + 6 + 6 + 6 =
  27 pitch sets) enter the collection as harmonies, tagged `messiaen m3/F` etc. More notes
  than players → N's attrition: the shuffle drops at random, or the piano's flags take the rest.

## Q · Linked to the score — `built 2026-09-03 (pick in the sequence, playhead follows, Insert @ playhead; delete not yet)` · `v2 2026-09-04: Insert @ original time — the strike carries its own time into WHATEVER score is open; originals replaced only where they truly exist (id + lane + pitch + onset), so the source save never has to be opened`

> *"In the tuba composer score there's the Insertion pull-down. Instead of this, integrate
> that into the sandbox somehow, and have the thing I'm working on in the sandbox linked to
> the rhythmic position in the score. I played a bunch of those chords directly into the
> score, and they have a go time. So in the sandbox I can identify which one I'm working with,
> and that gets linked back to the score at the time it comes from. So the first step of the
> tool would be to choose which step in the sequence of scattered strikes I'm working with,
> and that loads into the keyboard, harmony, etcetera."*

- **Step one of the tool: pick the strike by its place in the sequence** (index · go time);
  the database already carries its source save, object ids and `t0`, so the link is data.
- Operations from the Insertion strip, in the tool: **replace in place** (the take written
  back over the original strike at its time — the original notes replaced, ids kept where
  possible), **insert @ playhead**, delete. Selecting a strike may move the score's playhead
  to its `t0`; later the reverse (select in the score → select in the tool).
- The Insertion strip's mini-keyboard row is reused as the harmony picker (M).

**v3 2026-09-06 (RUNNING_LOG §113):** the pick no longer moves the playhead (his *"Insert @ playhead … back in its original
location"*, *"load a saved strike 32 moves the cursor to 49.42"*); `⌖ original` parks it on request; an insert replaces an earlier
insert of the strike only where it sits at the same time (within 100 ms) and keeps its copies elsewhere, in every mode — strikes
recur (CN-28); R's choice 3 ("replace on re-insert") narrowed to the same time.

## R · Decisions before the build — `decided 2026-09-03 — all six applied in the build`

1. **Where it lives — a FULL-WIDTH DRAWER inside the composer score.** Composer: *"if you can
   make it a full-size drawer, that's fine. The blast sandbox actually takes the whole screen
   width. So it's fine to be part of the composer score, that's probably what I prefer. But the
   other panels are small — if this could take the full page width, that would be best."*
   A drawer that pulls up from the bottom to the page's full width and a generous height, like
   the Insertion strip but tall; it edits the score's live objects (replace in place, insert,
   undo).
2. **Durations — a `duration ×` multiplier** beside the timing transforms. Composer: *"Sure, add
   the multiplier, but chances are in the notation these will reduce to just short notes. If I
   wanted something more heterogeneous in terms of duration, I could consider that with a
   multiplier."* Default = as played.
3. **Strike techniques per instrument** — became S (the articulation column + the stand-in rule).
4. **Dynamics** — decided: **as played** (default) or **flatten**; a `dyn ×` slider beside them.
5. **"Cluster together"** — decided: the smallest chromatic span (see B, clarified).
6. **Keyboard range** — decided: the ENSEMBLE SPAN on screen; the piano keeps the full 88
   available — composer: *"maybe we do the ensemble span, and for the additional notes for the
   piano we have the option of adding something from the eighty-eight keys."* AI's expedient:
   a small `88` toggle expands the keyboard to the full range when the piano needs it; notes
   beyond the visible span (piano only) show as arrows at the top / bottom edge.

## S · The articulation column and the stand-in rule — `built 2026-09-03 (menu per row · picker by kind · stand-ins; the `kind` field in instruments.js still pending — a name rule classifies until then)`

> *"After the instrumentation, before the rhythm panel, is column three; rhythm becomes column
> four. I'll click on the instrument, and then I'd have a choice of articulations — the strings
> could use the Bartók pizz or bow pressure. And just like with the cuivre in the tuba, I can
> have semi-pitched or non-pitched — multiphonics or things like that — just stand in for that
> pitch. There's a pluck behind the bridge, but only the open strings' pitches are available:
> that could stand in — you wouldn't reorchestrate that pitch, it would just be the noise part."*

- *Layout (AI proposal):* an articulation menu on every instrument row in column 2; click an
  instrument → column 3 opens its full list, grouped pitched · fixed-pitch · noise ·
  multiphonic; rhythm = column 4; `all strings → …` chord-level quick buttons (the blast
  sandbox's `all:` row).
- **The stand-in rule:** every voice keeps its harmony pitch (D11 of the tuba piece: an
  articulation never edits pitch content); the articulation's KIND decides what sounds —
  **pitched**: the pitch · **fixed-pitch** (behind the bridge, harmonics sul X): the nearest
  available pitch, behind-the-bridge = the closest open string · **noise** (body strokes, key
  clicks, slap, undefined sounds): stands in, the key only picks a variant · **multiphonic**
  (bass clarinet #10 / #22, flute Multiphonics Menu): stands in; default = the multiphonic whose
  content contains the voice's pitch class (from the 0c.8 walk). On the keyboard a stand-in
  voice is a hollow dot with a label of what sounds ("bb pizz · open D"). The harmony record
  never changes.
- *Needs underneath:* a `kind` field on every technique in `sandbox/instruments.js` (pitched /
  fixed / noise / multiphonic) and the open strings per string instrument (vn G D A E = 55 62
  69 76 · va C G D A = 48 55 62 69 · vc C G D A = 36 43 50 57). The 2a notation classifier
  needs the same field — written once, at 0c.
- Composer, confirming: grouped by kind, but **every articulation visible** in the full list;
  the menu on the instrument row, click exposes the full list. Adopted.

## T · Auditioning variants: the side panel — `built 2026-09-03 (variant list with ▶ hear / click select, for fixed · noise · multiphonic)`

> *"I don't necessarily want to overclutter things, but it would be good to have a quick way
> to audition the variation. For the multiphonics, they don't really have much to do with the
> keys — they're just triggers for a variety of multiphonics. So if I decide to put in a
> multiphonic, it'd be good to have a side panel where I can listen to the choices and select
> one of the multiphonics in the sample."*

- When a voice gets a noise / multiphonic / fixed-pitch articulation, a side panel lists that
  technique's variants (the multiphonic keys with their pitch content once 0c.8 has walked
  them; the noise technique's keys; the open strings) — click to hear, click to select; the
  choice is stored on the voice (the stand-in key). Out of the way until needed.

## U · Feature queue from the first test — `U1–U4 built 2026-09-04, awaiting the composer's test` (RUNNING_LOG §64) · `U5 built 2026-09-04` (RUNNING_LOG §73) · `U6 asked, not built` · `U7 built 2026-09-04` (RUNNING_LOG §74) · `U8 built 2026-09-04` (RUNNING_LOG §76) · `U9 built 2026-09-04` (RUNNING_LOG §77) · `U10 built 2026-09-04` (RUNNING_LOG §81) · `U11 built 2026-09-04` (RUNNING_LOG §87) · `U12 built 2026-09-04` (RUNNING_LOG §90) · `U13 built 2026-09-05` (RUNNING_LOG §91)

> Composer: *"collect these and I'll have you do a feature update all at once."* Each request
> verbatim, the AI's reading beneath; built together when the composer says so.

- **U1 — room between the keyboard and the players.** *"can there be a larger gap between piano
  keyboard and instruments, cant see where the lines are drawn to"* — *AI reading:* widen the
  keyboard column (or add a gutter column, ~120 px) so the dotted lines have length and a clear
  landing on each player's row; land them on a small marker at the row's left edge, and
  brighten the line of the row under the mouse.
- **U2 — staccato as the default articulation, except the piano.** *"can we make the default
  sound for all stacatto, no stac atto for piano so leave as is"* — *AI reading:* the drawer's
  plain-technique preference becomes staccato-first: flute `staccato` (the Fluteb port), bass
  clarinet `stac_vel` (Staccato Velocity #19), strings `stac_vel` (#19); the piano keeps `main`
  (8Dio). Applies to shuffle, hand assignment and the row menus' initial value; the strike's
  as-played state stays the piano's.
  **Revised the same morning:** *"new default: flute pizzicato (can you explain this technique,
  tongue ram?), violins-bartok pizz, vla/vc, gettato, bass clarinet slap tongue, all fff=127"* —
  *AI reading:* the defaults become flute `pizzicato` · bass clarinet `slap` · violins
  `bartok_vel` · viola/cello `gettato_vel` · piano `main`, at velocity 127 (the drawer's dyn ×
  and flatten still apply on top). These five are also measured against each other in the
  balance run (PLAN 0j, RUNNING_LOG §43).
- **U3 — solo a voice or a set of voices.** *"can we solo individual voices or a collection"* —
  *AI reading:* a solo flag per voice (a click with a modifier on a dot, or an `S` on the
  player's row), any number at once; Hear plays only the soloed voices while any are soloed;
  a `solo off` button clears them. Distinct from the piano flag and the future double-stop flag.

- **U4 — a narrower rhythm strip.** *"you can save horizontal space by reducing the rhythm
  zoom/width of bands"* — *AI reading:* the strip's default width fits the strike's span into
  ~40 % of the drawer instead of the whole remainder (a zoom slider keeps the wide view), the
  bands drawn at true 60 ms width (thin at that zoom); the space saved goes to U1's gap.

- **U5 — reset the rhythm in one click — `built 2026-09-04, verified on the throwaway server (RUNNING_LOG §73)`.** *Composer (2026-09-04 night): "strikes how to reset the
  rhythm"* — *AI finding, from the code:* no one-click reset exists. As played = shape `as played` ·
  span × 1 · jitter 0 · reverse off · rotate back at 0 (amount is moot under `as played`: the blend
  is between identical patterns). Two traps: (1) re-picking a strike in the sequence resets shape /
  order / span / amount / jitter but NOT reverse and rotate — a rotated strike #3 makes strike #5 come
  up rotated while its menu says "as played"; (2) span ×, amount and jitter changes take no snapshot,
  so `back` cannot undo them. *Proposed:* a `reset rhythm` button (the five values above), and
  `select()` clearing reverse / rotate with the rest. A page change only — a reload to take effect.
  *Built as proposed:* `reset rhythm` under reverse · rotate · reshuffle; `resetRhythm()` shared by the
  button and `select()`; `reverse: false, rotate: 0` in the defaults so the first click is undoable;
  span × / jitter snapshot on change, amount once per drag. Order and orchestration untouched.
- **U6 — a different pitch for an instrument already assigned.** *Composer (2026-09-04 night, while
  composing): "is there a way to reassign a different pitch to an already assigned instrument"* —
  *AI answer, from the code:* the drawer never changes a pitch CLASS — the harmony is the strike's own;
  pitches move by octave only (the voicing presets, all voices at once; the fold into a player's range,
  ↑↓). To give a player another note OF THE CHORD: double-click that note's dot on the keyboard ("voice X
  armed"), then click the player's row — the voice moves there and is ADDED to what the row already
  has; the note it had stays until it is armed and moved elsewhere. Gaps found: no hand "nobody plays
  this note" (skip is set only by a misfit); no per-voice octave nudge by hand; no free pitch edit (a new
  pitch class = a new harmony = M/N). *Not built — the composer's call which of the three, if any.*
  *→ U7 (below) makes the two-click assign replace instead of add.*
- **U7 — hand assign replaces, not adds — `built 2026-09-04, verified on the throwaway server (RUNNING_LOG §74)`.**
  *Composer (2026-09-04 night, having tried U6's two-click assign): "I tried this, but it added two lines
  to the instrument. The previous one didn't go away."* — *Built:* a plain click on a player row now
  REPLACES: the note(s) the row had go to the armed note's old player — or to nobody if it had none — so
  the chord stays whole and nothing is silently dropped; shift-click ADDS (the double-stop case, I). Each
  note takes the technique its new row already plays (before, a hand-assigned note always got the
  instrument's default, whatever the row's menu said). The status line says what moved where; `back`
  undoes it. The arm message states the rule. *Superseded by U10 (2026-09-04): the row's old note goes to
  nobody, not to the armed note's old player, and the armed note stays where it was — a doubling.*
- **U8 — the seed, visible and re-clickable — `built 2026-09-04, verified on the throwaway server (RUNNING_LOG §76)`.**
  *Composer (2026-09-04 night): "For the rhythm order. and the random shuffle order. Can I have the seed? And can I
  have a way to go back to previous seeds? So, for example, every time I hit shuffle order, maybe there's a row or a
  table of previous shuffles. It just collects, say, five or ten, and then I can click them instead of having to
  type it in. I can just click on previous seeds."* — *Built, the same way for all four random buttons* (shuffle
  order · reshuffle rhythm · shuffle orchestration · reshuffle voicing): `seed [n]` — the current seed in a small
  number box (a typed seed applies) — followed by the last eight seeds as chips, newest first, the current one
  lit; a chip click has that shuffle back exactly (same seed, same strike, same locks = same result); a new
  shuffle takes max(seen) + 1, so it never repeats a seed still in the row; `back` undoes a chip click. The
  histories live in the drawer's saved config and travel with takes. Cap 8 (the composer said five or ten).
- **U9 — ENTER saves a take; the take controls stay together — `built 2026-09-04, verified on the throwaway
  server (RUNNING_LOG §77)`.** *Composer (2026-09-04 night): "in the save take text box, can we make return save,
  the save take button drifted to the other end of the screen"* — *Cause:* U8's voicing seed row widened the
  footer and its wrap split the take box from its button. *Built:* the box, `save take`, `load take…` and `×` are
  one no-wrap group, so they move together; ENTER in the box saves (the same `saveTake()` as the button); the
  placeholder says so.
- **U10 — a note may be on several players; a player holds one note — `built 2026-09-04, verified on the
  throwaway server (RUNNING_LOG §81)`.** *Composer (2026-09-04 night): "if [an] instrument was assigned a note,
  and I want to assign a different note to it, it would replace. But that's just on the instrument side. So in
  other words, one instrument can't play two notes. However, it is on the notes side too. It's okay. We fix
  that. So in other words, two instruments can play the same note, but not the other way around. So I still
  want it so that one instrument isn't assigned to [two] notes, but I want to be able to assign the same note
  to multiple instruments."* — *Built:* a voice keeps its primary player and gains doublings (`v.also`, each
  with its own technique · fold · stand-in); arm a note, click a row → the row plays it (the note stays
  wherever else it is) and what the row had goes to NOBODY (never to another player — U7's swap-back is
  gone); shift-click keeps what the row had; click a note in a row to take it off that player; every player
  that has the note gets a line, a chip, its own articulation from its row's menu and its own fold (a G2 on
  the cello doubles onto the flute as G4↑); Hear and Insert emit one note per player; `back` and takes carry
  the doublings; a shuffle or a strike pick clears them.
- **U11 — the chain step: a duration in ms, and `Insert @ after previous` — `built 2026-09-04 (his choices: end =
  the last onset · anchor #17 · replace on re-insert), verified on the throwaway server (RUNNING_LOG §87)`.** *Composer: "we need a way to expand it to whatever the next duration
  is. So spread it out. And then a method to calculate the gap between seventeen and eighteen — let's just call
  it the onset gap … place that gap at the end of seventeen, and then that will be the new onset time for
  eighteen."* — *Proposed:* (1) in the rhythm column, `span ×` gains a twin `= ___ ms` (first onset → last onset;
  the two stay in sync; typing 190 sets the ratio; the ×20 cap goes — RUNNING_LOG §83); beside it `ratio [1.5]` and
  a `prev × ratio` button that reads the previous strike's duration from the open score and fills the box. (2) in
  the footer, `Insert @ after previous`: finds strike n−1's group in the open score (`grp-strike-<n−1>-…`), takes
  its end, adds the onset gap t0(n) − t0(n−1) from the database, inserts there; an earlier insert of the same
  strike is replaced, not doubled; the status line shows the arithmetic ("#18 → 28.302 = end of #17 27.280 +
  onset gap 1.022"); if n−1 is not in the score it says so and offers the original time. *Open (his):* "end" =
  the last onset (recommended — the ring is the sampler's) or the META shape's end (+109 ms at #17); the chain's
  anchor — #17 at 127 ms (→ #18 190) or #18 at 110 (→ #19 165); replace-on-reinsert (recommended).
  *Built:* `= ___ ms` beside span × — the real first→last onset of the pattern as shaped (shape, reverse, rotate,
  jitter included); typing sets span ×; the ×20 cap is gone (#22's 13 ms stretch to 5 s = ×385). `Insert @ after
  previous`: the previous strike's group in the open score → its last SOUNDING onset (an unassigned note does not
  count) + the recorded onset gap → the insert time; the status prints the sum. Every insert mode now replaces an
  earlier insert of the same strike (group prefix `grp-strike-<n>-`), so a strike exists once in a score; the
  group suffix says how it was placed (`r` original time · `a` after previous · none = playhead). The `prev × ratio`
  button was not built — the composer types the duration.
- **U12 — rests leave the rhythm; a gap box — `built 2026-09-04 (decision A, "a yes"), verified on the throwaway
  server (RUNNING_LOG §90)`.** *Composer (CN-17): "it's actually the gaps between the onsets that need to expand"*;
  on the three readings of "gap" put to him (between the notes heard · the recorded grid with rests · the piano
  takes the leftovers) he chose the first. — *Built:* `drop rests` (checked by default): a note nobody plays leaves
  the rhythm and the sounding notes are spaced by themselves — `pattern(keep)` builds the same shapes over the
  sounding slots only, the recorded span kept as the strike's length; unchecked = the recorded grid with rests, as
  before. `Hear piano` always plays the whole chord. A `gap = ___ ms` box beside the ms box shows the mean gap of
  the rhythm as it will sound and sets the duration from it (gap × (onsets − 1)). Reverse now mirrors within the
  pattern's own span. The strip's tooltip names a dot nobody plays. The mode lives in the drawer's config (takes,
  back); `reset rhythm` leaves it alone. *Not built:* a `gap = previous × ratio` button — the composer types it.
- **U13 — `accel · round robin`: the accelerating run with the players recycled — `built 2026-09-05 (CN-18), verified
  on the throwaway server (RUNNING_LOG §91)`.** *Composer: "each subsequent one … slower in the beginning, but I want
  the rush at the end to sound just as urgent each time … build a round robin cycle so we can recycle the players …
  two hundred and fifty milliseconds across the board … if we have to settle into the same loop, the player plays the
  shuffled note, in an octave displacement if necessary."* — *Built:* a shape `accel · round robin` in the shape menu.
  With it on, the gap box is the FIRST gap; `steep` (0.85) is the fraction each gap is of the one before; `→ last`
  (45 ms) is the landing; the count of notes follows (the last gap lands exactly on the floor, the fraction adjusted
  a little); the ms box shows the duration and is read-only. Cards = the sounding notes in slot order, pitch on
  player (a doubled note is one card with two players, the piano flag adds the piano). Cycle 1 = the composer's order;
  each later cycle = a shuffle that satisfies `re-attack ≥` (250 ms) against the known onset times — every order is
  tried for ≤ 7 cards — or, when none fits, the rotation of players in his order with the pitches shuffled and folded
  by octave into each player's range (noise / fixed techniques take their stand-in). A seed row for the cycle
  shuffles. The readout: notes · gaps · ms · steep · what each cycle did (⚠ where even the rotation re-attacks too
  soon) · the tail check (players × floor ≥ re-attack, or the floor to raise to). The strip draws the run (a
  fallback cycle dashed); Hear and Insert follow it; `Hear piano` stays the chord as played; `Insert @ after
  previous` measures the run's last onset as before. **U13b (2026-09-05, composer: "can we scramble the pitches after the
  round robin?"):** a switch `re-deal pitches after cycle 1`, on by default — from cycle 2 the pitch set is dealt afresh to
  the players (folded into range) whether the instrument order is shuffled or repeats; off = each player keeps its own
  pitch and only the order changes (the rotation fallback always re-deals, else it would loop).

## V · Processes across strikes — `wanted 2026-09-04 (CN-10) — not built; nothing blocks composing the first of each by hand`

> Composer (CN-10): *"climbing scales through the ensemble; or acceleration or deceleration as one
> unit but spread out across the ensemble; blocks of strikes that answer each other from
> sub-ensembles? … circular chord strikes in cycles, and a kind of Risset ladder throughout the
> ensemble."*

- *AI reading of the tool needs, in order:* (1) **a shuffle confined to a sub-ensemble** — pick the
  players (strings · winds + piano · high · low · any set); the shuffle assigns only within them, the
  rest stay empty or keep what they have. (2) **Chains across strikes** — from a chosen strike, generate
  the next N as a process: SPREAD (CN-12 — span × growing per strike, anchored at the first impact; the
  least design in it, the first to build — **CN-14 gives its spec:** from ONE strike, spacing evened; each
  re-strike's span grows, his example ×1.5 from 100 ms (100 · 150 · 225 …), the law open; even spacing until
  the span is long enough to hear, then accelerating toward the last impulse (`back-loaded`, graded by
  `amount`); open: the gap between re-strikes, the orchestration per re-strike, the dynamic; starts @ 27.76 s;
  *"take this as a note for now, and then we'll build it"*; **2026-09-05: the per-strike pieces exist — U11 (duration / gap,
  `Insert @ after previous`), U12 (rests drop), U13 (the accelerating run with the round robin); the law became the gap
  law (CN-17) and the run (CN-18); the chain across strikes is still driven by hand, one strike at a time — the chart
  in RUNNING_LOG §86 → decides whether a generator is built**) · SCALE (each strike one step higher, order low → high through the registers) ·
  ACCEL / DECEL (the strikes' onsets on a CN-3 ramp, each strike's own rhythm shaped to match) · LADDER
  (the same pitch classes re-voiced one step up per strike, the top voice wrapping to the bottom at the
  softest dynamic — the Shepard–Risset staircase in strikes). **SPREAD designed in detail 2026-09-04 (CN-16,
  RUNNING_LOG §85), awaiting the composer's go — a chain panel in the drawer:** anchor = a strike already in the
  score (#17) · members = a range (#18 → #24) · each member's material = the newest take of that strike (its
  orchestration, order and shape; a newer take changes it) · law = a menu: × ratio [1.5] · + step [ms] · Fibonacci ·
  custom list of ms · end rule = the last onset · `build chain` (re)generates every member into the open score in
  order — duration by the law, start = end(n−1) + the recorded onset gap, replace-on-reinsert per strike — and
  prints the table (member · ms · start) to the status and the log; switching the law and rebuilding is the A/B;
  D17 gives the archive (Save before a law, Reload to revert, Name version per law); `play chain` parks the
  playhead on the anchor and plays. U11's ms box and `Insert @ after previous` are its per-strike pieces and stay
  usable alone. (3) **Answering blocks** — a chain of
  strikes alternating two sub-ensembles. Within one strike, order (K) · shape (J) · voicing (B) · locks
  and assign (E, F) already do each of these by hand; a chain is a take per strike today.

*CN-28 (2026-09-06):* **"Patterned strikes. or call and response strikes. With Crescendos - section 3"** — the answering blocks (3)
and the chains (2) are section 3's material, each chain carrying a crescendo (a dynamic law per chain beside the time law); on his
call, as the chart decides (§86).

## W · The curves of the rush — `built 2026-09-06 as PLAN 1h (RUNNING_LOG §129): the acceleration calculator + the drawer's run dials` · *was: planned 2026-09-05, "just the curve … keep a note or a plan so that if we do another one of these, we can build the different curves, the feel of the rush"*

> The accel run (U13) has one curve: geometric — each gap a fixed fraction of the one before. When a strike wants a
> different feel, the `accel` block gains a `curve` menu; the first gap, the landing and the re-attack rule stay as
> they are, so every curve lands the same way and the round robin is untouched. The gap's progression between strikes
> (the chain law, ×1.5) stays manual — typed per strike (RUNNING_LOG §95).

- **geometric** (built) — a steady push; the gaps shrink by a constant ratio.
- **linear** — each gap shorter by the same milliseconds; a push that eases as it goes (the ratio grows toward the end).
- **late rush** — a flat head, a steep tail: the gaps stay near the first gap, then collapse (a power curve on the gap
  index, exponent > 1); the hesitation-then-fall.
- **S-curve** — even, then accelerating, then the last two or three gaps nearly equal: a roll that lands rather than
  crashes (an ease-in-out on the same first / last gaps).
- **two-phase** — an even head at the first gap for k gaps, then a fixed geometric rush to the landing (the "knee" of
  RUNNING_LOG §89).
- **jitter** — any curve above with performer jitter (CN-13): each gap randomized by ± a percentage, the amount fixed
  or growing toward one end; seeded like the other shuffles.
- **reverse** — the same curves run backwards (a ritardando opening out) — for the tremolo material later.
- *Implementation note:* one function `gapsFor(curve, g1, floor, k, params)` returning the k gaps; the count k for a
  curve = the smallest k that reaches the floor within the curve's own law (linear and S need k given, or a duration);
  the readout shows the curve's name; the strip and Hear follow as now.

> **Built 2026-09-06 as PLAN 1h (RUNNING_LOG §125–129; CN-30):** the math is a module, `score/public/accel_calc.js` (page and tools),
> and the drawer's accel block reads it. The list above maps onto its `run` menu: geometric (as built) · linear → `linear ms` · late
> rush → `late rush` (its dial: the power) · S-curve → `S-curve` (the ease) · two-phase → `two-phase` (the head's share) · jitter → the
> `jitter % → %` boxes (fixed, or ramped from the first gap to the last; the run's seed) · reverse → `mirror` (the run played backwards
> in time), or `→ last` above the gap for a run that slows in the shape's own direction. Added beyond the list: `curve` — the tuba
> compiler's one-dial family (the speed changes by a percentage per second; bloom ← even → surge; its calibrated zero left at 0 here,
> the composer's to set), the length by any one of steep / notes / ms (the one in charge outlined), a `hold` at the landing, and a
> level ramp `vel → vel` in the ensemble's scale through 1g's remap. The first gap, the landing and the re-attack rule stay as they
> were; the round robin is untouched. Added the same evening (§138, "c, build both pls"): a `deal` menu — round robin (as built) or free (no lap: each note to any player the
> re-attack rule allows, at random, never the one who just played while another is free, a lean toward whoever has waited longest; the
> rule stays a guarantee, a ✗ when nobody is free) — and a `pitches` menu — the cards, or every distinct pitch the strike holds, drawn to
> completion then reshuffled, each folded into the receiving player's range. And `even` at the top of the `run` menu (§142, "a spread out strike, evenly spread
> out … have it last a certain duration and have a return or loop like the acceleration"): one gap throughout — the gap box, `→ last`
> ignored, the length by ms (every gap exactly the length ÷ the count) or by notes — with the same dealing and pool as a run. The
> calibration of words to numbers waits for his go.

## X · Chords mode — `built 2026-09-08 (PLAN 1k; RUNNING_LOG §234–251; CN-44 · CN-45 · CN-46 · CN-47)` · **DEPRECATED 2026-09-12 at his word (RUNNING_LOG §413): left in the code, not offered again — notes mode + the onset card is the drawer**

> *"use the rhythms that are generated usually for one strike individual notes … but I'd like to make those onsets carry a cord or part
> of a cord … I want four players on this one or two players on that one and then the algorithm would shuffle so that no player has
> another impulse. let's lower it to 200 milliseconds"* (CN-44) · *"me to put in the menu … the machine can solve how many players to
> put on each onset and how to scramble that"* (CN-45)

**The idea.** The drawer's rhythm is the rhythm — the strike's onsets with its dials, shapes, jitter and the run, untouched. What changes
is what sits on an onset: a chord, or part of one, dealt over the players by rule. Nothing is assigned by hand; he sets menus and the
machine solves.

**The screen (§242) — his own screen with a cursor.** The keyboard and its dotted lines are unchanged in kind and show ONE ONSET, the
selected one; the rhythm strip is the selector, a column of dots per onset; notes mode is this screen with a sequence of one. The
articulation pull-downs keep their meaning: a player's voice for the whole sequence.

| where | notes mode | chords mode |
|---|---|---|
| the left column | the strikes of the source save | **the CHORDS list** — built from the banks (blasts · shapes · the strikes db) or typed; the order, the advance, the selection |
| the keyboard | the whole strike's notes | the chord in play, the selected onset's notes ringed, its sounding notes as dots |
| the orchestration | a row per player with its note | **the PLAYERS** — a tick and a voice per player, the count range, the rest in ms, the dealer, the seed, the readout |
| the rhythm strip | a dot per onset | **a COLUMN of dots per onset**, one per player; the selected column lit; ↓ lowered · ✗ flagged · · short |
| the foot | as always | + **Generate** · *whole* · *as it was* |

**The two axes (CN-46).** The SELECTION is which notes of the chord an onset takes — the drawer's own voicing vocabulary: as played ·
shuffle · high cluster · low cluster · spread. The ADVANCE is when the next chord comes — exhaust it (every note sounded once) · stay on
it n times (n drawn from a range) · a fresh chord every onset. The chord list runs in turn or shuffled to completion, seeded.

**The players.** A range per onset ("two to four"); the machine draws a count, and when too few players are free it LOWERS the count
inside the range, flagging only when even the minimum cannot be met (his (a), §237). The re-attack rule (his 200 ms) is a guarantee,
checked against the real onset times. The onset's notes go to the free players BY REGISTER — the lowest note to the lowest-sitting
player and up — each folded by octave into that player's measured range (`realize`), the folds counted. Round robin and free are the
tie-breakers when more players are free than needed.

**The chord's TAIL (§249).** With *exhaust*, the last onset of a chord takes whatever is left, which is usually fewer notes than the
count drawn. That is not a failure of the range: it is the chord's tail, marked `short` and counted in the readout. Small chords make
many tails — the 54 chord shapes average 3.8 notes, the 45 blasts 6.2 — so a 2–4 range reads better on the blasts.

**A manual onset (step 3).** A click on an onset opens a card there: its count, its chord, its notes, its players, ♪ to hear it. A hand
onset is pinned — kept through a re-generate and a new seed, the rest dealt around it — and flagged, never lowered. ✕ hands it back.

**The span and the partial insert (step 4).** A drag across the strip marks a span, and so does a click plus SHIFT-click; the foot says
how many of how many; *whole* clears it. Hear and both insert buttons then act on the marked onsets only; nothing marked = the whole
sequence, so they read exactly as they always did. **It serves notes mode too.**

**Saving (step 5).** A take carries the RESULT (every onset with its players, pitches and flags) and the RECIPE (the chord list, the
order, the advance, the selection, the player range, the rest, the dealer, the seed, the rhythm dials, the manual onsets). With a span
marked it saves that part on its own, remembering which span of which whole. The *as it was* tick decides the load: the stored sequence
back with nothing re-dealt, or the dials filled and dealt again. The 153 earlier takes still load.

**Where it lives.** `score/public/strike_chords.js` (the engine, pure, 35 checks in `tools/strike_chords_check.js`) ·
`score/public/strike_chords_ui.js` (chords mode as a mixin on the drawer) · five dispatch lines in `strike_drawer.js`. **Nothing new in
the score's file format:** an insert writes ordinary strike notes in an ordinary `grp-strike-…` group with its META shape.

**Not yet:** the notation of a chord strike (2a); a chord list saved on its own (a take carries one today); **the PIANO in the deal —
now a to-do with a shape (CN-52, PLAN 1k step 7): it sits out today, and the plan is to give it the ensemble's REMAINDER (the notes an
onset could not take) or several notes of the sonority freely, chosen by a per-strike rule rather than by hand**; his listening.

## Y · Fill mode — `built 2026-09-08 (PLAN 1n steps 1–4; RUNNING_LOG §285–300; CN-48 · CN-54 · CN-55)` · **DEPRECATED 2026-09-12 at his word (RUNNING_LOG §413): left in the code, not offered again — notes mode + the sound switch is the drawer**

His picture (CN-54): *"the unit is the accent and the prolongued thing eg trill, crescendo, longtone; so the accent kicks off the long as
if they were one unit"* — and *"two players, the accent prolonged by another instrument … the typical application would be to generate a
strikes pattern like an accel but not necessarily and then overlay crescendos on that pattern, so for each attack in an instrument the
long will start simultaneously in another instrument."*

So fill mode is a **SECOND PASS over a pattern that already exists**, never a generator of rhythm. Notes mode and chords mode build the
pattern; fill mode lays a long — a crescendo or a trill — on **every attack of it**, each in another instrument.

### It was measured before it was designed

His own texture at 135.78 s (`grp-strike-40-1357` in `scores/piano-harmonics-test.json`: 46 attacks over 13.0 s, one player per attack,
accelerating 800 → 130 ms, 44 trills over it) was read first (RUNNING_LOG §285, §287, §289, §291):

| | |
|---|---|
| trills starting at an attack of **another** instrument | 44 / 44 (median 3 ms) |
| trills ending before their own player's next attack | 44 / 44, median gap **171 ms** — 1l's own 0.17 s, arrived at independently |
| the same instrument twice running | 0 / 43 |
| trill length | 1.33 s at the head of the run → 0.15 s at its tail — **derived from the room, never chosen** |
| players sustaining at once | **5 or 6 of the 7, for 73 % of the passage** |

And his stated selection rule was measured and **dropped**: *"the empty instrument with the shortest available space"* gives a median
long of 0.13 s with 40 of 46 under 0.4 s — the very *"lot of short longs in a row"* he wanted to avoid, and not what his hand did (he
took the third-to-fifth roomiest, never the tightest).

### The rule

- **Which player**: least-recently-long, the roomiest breaking the tie, seeded. Never the player striking that attack; never one already
  inside a long; never the player whose attack cuts it. On his run the rotation and "always the roomiest" are indistinguishable, and the
  rotation is what protects an uneven pattern.
- **The room, one function, two directions**: forwards to 0.17 s before that player's next sound; backwards from the END of the accent
  note to that player's last sound end + the re-entry gap. Measured as mirror images: 43 longs and 3 aborts either way.
- **The floor per kind and the abort**: a crescendo needs 0.3 s (1l's `minS`), a trill 0.5 s. An attack with no candidate clearing the
  floor **gets no long and is counted with its reason** — never squeezed in.
- **The re-entry gap** is its own number (`rest`, 150 ms by default) and is a piece-specific loosening of the spacing rule: a long begins
  where its own player has just been playing, which is a re-articulation and not a new attack out of silence. **His hand went to 49 ms**,
  and 16 of his 44 trills were under 150 ms; at the rule the pass fills 39 of his 46 attacks, at 0 ms it fills 43. Lower it when the
  texture is this dense.

### The anchors, not modes

Each long holds two references — `launchedBy` and `cutBy` — and each is **the ID OF AN ATTACK**, never a position in the sequence:

| launched | cut | what it is |
|---|---|---|
| ✓ | — | the accent kicks it off, the room ends it |
| — | ✓ | the crescendo swells into the strike and stops **at the end of that accent note**, overlapping it by the accent's own ~84 ms (free: two players) |
| ✓ | ✓ | it spans accent to accent, and **aborts rather than shrink** below the floor |

Because the anchor is a reference, either end can be **re-pointed at any other attack** (his *"how about if I wanted to extend it to a
different strike to cut?"*) — and a move that does not fit is refused with its reason rather than silently shrunk.

**Reaching back before the pattern is the shape of cut mode, not an edge case.** On his run 4 of 43 cut longs begin 0.53–0.60 s before
the first attack, stopped by the previous strike group and its rest. *inside* clips them to the pattern's own span.

### The pitch is a strategy (CN-55)

Seven, over one seeded order menu — in turn · shuffled to completion then reshuffled · random:

| family | the pitch |
|---|---|
| the accent's own · the one before · the one after | read straight from the named attack |
| the pattern's pitches, dealt | the group's distinct pitches as a deck |
| a harmony, dealt | **1m's harmony bar whole** — 163 sonorities, no second menu built |
| a chain | a fixed interval from the previous long (his m2 and P5), up · down · alternating, **wrapped by octaves inside a band centred on its start** — which is what makes it a spiral rather than a runaway: a fifth chain over 39 longs would otherwise walk 273 semitones |
| vertical | the note the **currently sounding** longs are missing from a chosen sonority — with 5 or 6 in the air it usually has a real choice |

Every pitch is folded into the player's ordinary-voice range by 1k's own rule; one no octave reaches **aborts** that long and is counted.
A strategy gives a trill's LOWER note only — the interval stays the trill tool's setting (his own 44 trills were every one a semitone).

### The screen

A third mode button beside **notes** and **chords**. Two settings rows — the pattern (the strike groups **in the open score**, so a group
he has dragged fills where it actually sits), the anchor, the kind, the pitch strategy, the rest, the floors, *inside*, the seeds — then
a preview: one row per player, the attacks as ticks, the longs as bars, the readout, and the aborts named. The foot is
**Generate · Hear · Insert**; notes mode's own controls are put away while fill mode is on.

- **Generate** deals without writing (a new seed each press).
- **Hear** plays the pattern with its fill through the real routes; the crescendos get a CC7 ramp and their secco cut. Trills sound as
  held notes here — the real ones are heard once inserted.
- **Insert** writes the longs at the pattern's own time as **their own group** (`grp-fill-…` + a META shape), replacing an earlier fill
  of that pattern and **keeping any long he has edited by hand**. The group is separate from the strike group on purpose: sharing it
  would let the gesture clause stop a player's own attacks from blocking its long, and the room rule would collapse.

### The three scopes

Every property is set at **the whole pass · a selection · a single long**, from one menu:

- the pass: the drawer's settings;
- a selection: **F** flips the selected longs between launched and cut under one undo;
- a single long: **1m's crescendo card** grows a *fill* row — who launched it, who cuts it, **flip**, and **re-point…** (then click the
  attack you want).

A hand-edited long is **pinned**, reusing 1k's own idiom (*pinned and flagged, never lowered*): a re-Generate leaves it alone, still sees
it as occupying its player, and says how many it kept.

### What it is made of

`score/public/fill.js` (the engine, pure) · `score/public/fill_pitch.js` (the strategies, pure) · `score/public/fill_ui.js` (the mode, a
mixin on the drawer) · one dispatch line in `strike_drawer.js` · a row on `cresc_card.js` · `flipSelectedFills`, `finishRepoint`,
`crescRoomEvents` and the **F** key in `composer.html`. 81 checks in `score/tools/check_fill.js`.

### Found on the walk, and fixed

- A **chain ran off the keyboard** — a fifth chain over 39 longs walks 273 semitones — so it is wrapped into a band centred on its start.
- **`roomForward` / `roomBackward` / `windowFree` assumed merged options**: called directly by the card's flip and by a re-point they got
  a bare `{}`, every number became `NaN`, and every room came back `null`. They merge the defaults themselves now.
- A **re-Generate saw its own last pass** as busy players and produced almost nothing; the deal now ignores the fill group it is about to
  replace — **except its pinned longs**, which must still occupy their player or the new pass overlaps them.
- The performance note said *(typed)* because the length is passed in; it now says what actually ended it.

*(The pane used for the walk coalesces `setTimeout` into 1-second buckets, so Hear's firing could not be timed there — the SCHEDULE was
verified instead, and it is the same mechanism the drawer's own Hear has always used.)*

## Z · The sound switch and time containers — `built 2026-09-08 (PLAN 1o steps 1–3; RUNNING_LOG §301–310; CN-48 · CN-56)`

His words (CN-56): *"they would take the place of the strikes. And that's kind of what I originally set out to do … instead of a strike or
short note, it'd be the onset of the crescendos."*

### The sound switch

**Not a fourth mode — a switch beside the mode**, so the two are independent:

| | **attack** | **crescendo** |
|---|---|---|
| **notes** | the drawer as it always was | a single line of swells |
| **chords** | the chords of 1k | **1o — chords of swells** |
| **fill** | 1n (it already writes crescendos) | — |

Every rhythm shape, voicing, order, span, take and insert serves both, without being written twice.

**Three of his four CN-48 asks were already built when 1o opened.** The ordinary voice per player is the recipe's `ordinary` field; *"150 ms
after the end"* is 1l step 3, and the chord engine has measured its rest from the END since 1k (`soundMs` + `markEnd`); the crescendo is
1l's object. **So the switch changes exactly four things:**

1. **the length** — 140 ms becomes `lengthMul` × the local gap of the rhythm;
2. **what the deal assumes** a sound occupies — the same number, so the dealing already respects the swells;
3. **what is written** — a short `waveCurve` becomes a 1l crescendo at 1l/1m's defaults, in its own `grp-swell-…` group with a META shape;
4. **the readout** — the voices actually sounding, and what could not be met.

### Why the length has to be decided at all — and 1n's does not

His own question, and it improved the design (§302). **In 1n the pattern already exists**, so *"when is the viola next needed?"* is a fact to
look up and the length falls out of it. **In 1o the pattern does not exist yet — the deal is what creates it** — and the deal must know how
long a sound ties up a player in order to work out who is free:

```
who is free?   needs → how long a swell lasts
how long?      needs → when that player is next needed
when is that?  needs → the deal
```

So the length is an **INPUT**. It is given to the deal as the multiplier against the rhythm's median gap; each swell's own length is then
taken from its own local gap and **capped so it can never run into that player's own next dealt note** (0.17 s before it).

### The multiplier IS the density dial

Measured on the engine — six players, 2–4 voices per entry:

| length ÷ gap | voices sounding | |
|---|---|---|
| 0.5 | ~1.5 | sparse, real silence between |
| **1.2** | **~3** | comfortable |
| 2 | ~4 | thick, entries begin to thin |
| 3 | — | saturated; 12–23 of 40 entries fail |

The readout gives the **measured** voices, the peak, and the count that could not be met — the honest half, because the arithmetic
over-predicts once the ensemble saturates. And a rhythm can simply be too fast: an accel run of 100 ms gaps puts every swell on 1l's 0.30 s
floor, and the readout says so in those words.

### Time containers

A new entry in the drawer's own **shape** menu, beside *as played · even · … · accel* — so it makes a rhythm for **attacks and swells, notes
and chords alike**. `time_containers.js` is its own module and knows nothing of the drawer, because that is what he asked for: *"worth
abstracting it into its own module because this is a type of technique I do a lot of."*

**Three independent axes:**

- **the POOL** — the numbers he types, with optional weights (*a typed weight stands, the rest share what is left* — his own rule), in
  **units** defaulting to 1 second so one number rescales a whole shape. Rolled until an overall duration is filled, **stopping short and
  saying by how much**, because the numbers he typed are the point.
- **the ORDER** — `stick` (how much the next value stays near the last: his *periodic*) and `interrupt` (how often it deliberately leaps:
  his *interrupted*). **Two controls, not one, because stickiness alone LOCKS UP** — at 2.5 the roll never leaves the value it found.
- **the CONTOUR** — his **accordion**: *grow · shrink · open–close · close–open*, with **turn** (where the reversal sits — the asymmetry),
  **bow** (broad or sharp) and **depth**. **Depth decides whether the large-scale form is the subject or the background**, because the
  contour and the interruptions pull against each other.

**The presets are sorted by SPREAD** (largest ÷ smallest), not by name or source, because the spread is what is actually audible — it
governs both how much the seed changes the result and the range of swell lengths that follow:

| | spread | | | spread |
|---|---|---|---|---|
| even · 4 | 1× | | primes · 2 3 5 7 11 13 | 6.5× |
| gently uneven · 3 4 5 | 1.7× | | one rare long · 2 5 7 15 (15 at 20 %) | 7.5× |
| Pythagorean 6:8:9:12 (Palladio) | 2× | | Modulor-ish φ series | 9× |
| √2 · ad quadratum (DIN, Gothic) | 2.8× | | Fibonacci · 1 2 3 5 8 13 | 13× |
| long and short · 2 7 | 3.5× | | jagged · 1 2 8 13 | 13× |
| harmonic series · 3 4 6 12 | 4× | | triangular · 1 3 6 10 15 | 15× |
| golden section φ | 4.2× | | powers of two · 1 2 4 8 16 | 16× |
| √3 · ad triangulum | 5.2× | | | |
| silver ratio (Japanese temple) | 5.8× | | | |

**On the proportion systems, honestly:** in architecture these ratios are seen all at once and compared by the eye; in time they are heard
one after another and compared only by memory. There is no body of results saying a √2 time-set sounds a particular way. What they
reliably give is their spread and their lack of a common factor — which is what the table measures. They are also ratio sets, so turn the
unit down.

Picking a preset **fills the boxes**; it is a starting point he edits, not a mode he enters.

### What it is made of

`score/public/time_containers.js` (the generator, pure and standalone) · `score/public/swell_ui.js` (the sound switch, a mixin) ·
`score/public/containers_ui.js` (the shape, a mixin) · two lines in `strike_chords_ui.js` so the deal is told the sound's length · two
hooks in `strike_drawer.js`. 37 checks in `score/tools/check_containers.js`.

### Found on the walk, and fixed

- **The shape menu is rebuilt by every render**, so adding *containers* once at load was not enough — the entry is ensured after each render.
- **1l's 5 s fallback was being used as a length CEILING**, which silently crushed a long container: a 15 s container at 1.2× came out as a
  5 s swell instead of an 18 s one. The real ceiling is the player's own next dealt note; the 5 s bound is gone.
- **The last swell of a pass had no next onset**, so it took the sanity bound and came out 60 s long. It now takes the gap BEHIND it — the
  local tempo where it sits.

## AA · Every harmony in the column, and the rhythm as its own source — `built 2026-09-09 (PLAN 1d, the drawer's step; RUNNING_LOG §324; CN-57 · CN-58)`

His words: *"essentially, the way the strikes drawer is, but with all the other harmonies and have the same behavior. So I click, say, a blast or a
chord shape from that same strikes menu … and it has the collapsible banners. and then everything else behaves the same."* — and: *"can we
separate out the … strikes rhythms? … another pull down where I have zero through forty five for the strikes rhythms?"*

**The column** — banners, the beating drawer's idiom (CN-36), one scroll: **STRIKES** (the db's rows exactly as before) · **STARTERS** ·
**THE MODELS' SETS** · **STACKS** and **MESSIAEN'S MODES from the root** (a root box in the banner; ENTER applies, ESC restores) ·
**BLASTS · the tuba piece** · **CHORD SHAPES · 2 pianos 2 percussion** · **KEPT** · **RECALLED from an ACTUAL** — every group of the morph
panel's own pitch menu (`MorphPanel.pitchOptionGroups` / `sonorityOf`, CN-53's one list, the crescendo bar's too), so the three can never
disagree. Every banner but STRIKES starts folded; the fold state is remembered; only an OPEN banner sticks while its rows scroll.

**The model (agreed 2026-09-09):** a harmony clicked becomes the strike in play — its notes as one simultaneity, all at 0 ms, the drawer's
default velocity and length — and is a strike from there on: the keyboard, the voicings, the shuffle, the orchestration rows, articulations,
hear, the rhythm column, the run, chords / fill, the sound switch, takes, insert. **A harmony click behaves exactly like a strike click.**
The three time buttons (Insert @ original time · after previous · ⌖ original) grey out: a harmony has no time. An insert writes an ordinary
`grp-strike-<id>-…` group (`grp-strike-S001-…`), so fill mode reads it as a pattern like any other. "As played" for a harmony = together;
the shapes spread it over a nominal second (`spanFallback`), and the `= ms` box lands it.

**Rhythm from · extra notes** — under the rhythm column's controls. §L's three lists (pitches · onsets · players) with the onsets given a
second source: `own` (default — a strike clicked with `own` is byte-for-byte the drawer as it was) or any strike #0 … #45. Laid IN PLACE:
lanes, voicing, order and hand assignments untouched; only each voice's onset, velocity and length move. Two rules, his:
- **rule 1 — counts differ:** the notes go on the onsets in order and wrap. `stack`: note n+1 lands ON onset 1, sounding with note 1 (the
  gesture keeps its length). `repeat`: a second pass, one LAST GAP (the last non-zero one) after the last onset. Fewer notes than onsets: the
  last onsets stay empty. The readout says which: *9 notes on 6 onsets · 3 stacked* · *2 passes, +8 ms between* · *25 onsets empty*.
- **rule 2 — the accents:** velocities and lengths travel WITH THE RHYTHM; the pitches come from the harmony.
Takes carry the harmony's id and the source; a take from before this loads as `own`. Chords mode's bank menu gained the same groups.

**Where it lives.** `score/public/harm_source.js` (pure — `makeStrike` · `layOnTicks` · `lay` · `rhythmOf` · `describe` · `groupsFor`; 45 checks
in `tools/harm_source_check.js`) · `score/public/harm_source_ui.js` (the mixin) · four dispatch lines in `strike_drawer.js` (`strikeById` ·
`applySource` · `spanFallback` · `applyState`'s lookup).

**Not here yet:** the rhythm COLLECTION — his own played scattered rhythms ingested as #46 … (the db already keeps a `rhythm` block per
strike; the same ingest reads a new save) — waits until he has played them; the full 1d module (H-numbers, the re-scrape, one table) stays
for the planning method; ~~keeping the rhythm dials while browsing harmonies (a one-line addition, on his word)~~ — **built 2026-09-10 as `keep rhythm on a new pick`** (RUNNING_LOG §340): his word came as *"I created an acceleration. I had one harmony chosen. I want to hear that same acceleration in a different harmony."* A checkbox beside `reset rhythm`, **off by default** (off = the drawer exactly as it was, the original line kept verbatim in the else branch). On: a new strike or harmony keeps the shape, the run and every accel dial, span ×, jitter, reverse, rotate and the order menu (a by-hand order falls back to *as played* — its slots belonged to the old note count). The **voicing still resets** (a preset MOVES pitches) and the **players are always re-dealt** (a new harmony has new notes) — carrying the orchestration across a harmony change is the second half, undecided.

## AB · Feature queue, second collection — `collected 2026-09-09 evening` · `AB1-b, AB1-c and AB2 BUILT 2026-09-10 (§AG; RUNNING_LOG §377–378)` · AB3 not built · AB4 moot (chords mode is now "old"; the run drives notes mode's chords) (his rule: "I don't want to implement them now, but let's collect up a few, and then maybe we'll put them in")

> *"So one is the set of articulations. I'd like a a... some presets for that. So the current default would be one. I can have all of them be
> ordinary. That would be another one, etcetera, etcetera."*

- **AB1 · Articulation presets.** Named sets for the seven articulation pull-downs: *default* (what the drawer opens with today) · *all ordinary*
  (each player's `ordinary` voice — the recipe field 1o already reads) · more as he names them; his own sets keepable (a take carries the
  articulations already, so a preset is a take of the rows alone). *(AI reading, marked as such.)*
  **AB1-c · THE TWO SETS HE ACTUALLY WANTS** (composer, 2026-09-10, twice in one message): *"the sets for the articulations for the
  players. We're meant to be have two sets available, the original percussive one that I've been using for the notes, and then
  spiccato. and then I should be able to choose the full set easily"* · *"And then I want those two sets of players, the original
  with bar top pits and Chatato, etcetera. And then one where everyone's playing spiccato."* — **set 1 · PERCUSSIVE (his default,
  set 2026-09-04):** Fl tongue ram / pizzicato · BCl slap tongue · Vn1 · Vn2 Bartók pizz · Va · Vc gettato · Pno its one voice.
  **set 2 · SPICCATO:** every bowed player #16 Spiccato; the flute and the bass clarinet have none, so their ordinary voice (or a
  named stand-in — his call). **One click per set, on the articulation rows.** This is the first thing AB1 is actually FOR, and it
  is now a request, not a wish. *(He also has AB1-b's all-staccato set; three presets in all.)*

  **AB1-b · the "all staccato" preset** (composer, 2026-09-10 03:20, from his screenshot: *"lets have this as one of the presets, add to features list"*): Fl **Staccato** · BCl **Staccato Velocity (#19)** · Pno **8Dio 1969 Legacy Piano (Steinway 1969)** (its one voice) · Vn1 · Vn2 · Va · Vc **Staccato Velocity (#19)**. The first named set of AB1, exactly as the rows stood.

> *"Another feature is I'd like to be able to transpose the harmony in the keyboard step by step. There's seems to be an octave one. But, a,
> the octave one only seems to work when I've chosen, like, one of the cluster, cluster low, etcetera. And if I can move the whole shape up by
> semitone, that would be good."*

- **AB2 · Transpose the whole shape by semitone.** A ± step on the keyboard that moves EVERY voice's pitch by a semitone (and by an octave),
  in any voicing — the `oct` box today only serves the cluster presets (B: `clusterOct` is the tight cluster moved by octaves). The
  transposition is a property of the shape in play, kept by takes, undone by back; ranges then re-fit by F's rule (fold ↑↓ or ✕).
  *(AI reading. Where it touches: `applyVoicing` sets `v.pitch` from the preset — the transposition would be applied after it, once.)*

> *"and then how to play the pitches in order from top to bottom"* (2026-09-09 evening, in the accel run with the free dealer)

- **AB3 · An order that HOLDS through the run.** Today the `order` menu governs cycle 1 of the round robin only; every later cycle is a
  shuffle of the cards under the re-attack rule (U13), the pitches re-dealt when the tick is on; the free dealer draws pitches at random.
  Wanted: a way to keep `high → low` (or any order) on every cycle of a run — a descending ladder that accelerates — beyond the one-pass
  answer available now (notes = the card count → one cycle, in the menu's order). *(AI reading, marked as such; the re-attack rule would
  still have to hold, so the order could only be kept where the players' rests allow it, and flagged where they do not.)*

> *"where is run even"* (2026-09-10 03:50, in chords mode, shape set to accel — and the block never appeared)

- **AB4 · The run (accel · even) in CHORDS mode.** Chords mode takes its onsets from `pattern()` — the strike in play's slots under the shape menu — and never from the accel calculator: the accel block is drawn only by notes mode's `renderRhythm`, so `shape → accel` in chords mode shows nothing and changes nothing (the AI told him to use it; wrong). The onset COUNT in chords mode is the note count of the harmony on the keyboard. Wanted: the run (even · geometric · the rest) as a rhythm source for chords mode, with its own count — `notes 7 · gap 700` — independent of the harmony in play. *(AI reading, marked as such; the containers shape already feeds chords mode the whole roll, which is the pattern to copy.)*

- *(he will continue to give feature requests — they land here, verbatim, as they come)*

## AC · The revision — a sketch to keep the thread, NOT a plan — `2026-09-10, 03:00 (RUNNING_LOG §328; CN-59; PLAN 1q)`

His verdict on the night, verbatim, after the crescendo run had been made as a console line instead (§325–327):

> *"I struggled with trying to get the right pitches in order. So maybe this is just a matter of that transposition thing or being able to
> select manual pitches. I struggled with trying to get instruments in a certain order playing certain pitches, and then decoupling the
> two. So the pitches go up while the instruments rotate. And then I think we already realized that the swells weren't already in the
> drawer with the playback. And then just the controls are too unintuitive and hard to use. So I have to ask AI every time. How to make
> things a certain way. It's too... the turnaround's too slow. … at some point, I wanna revise this whole drawer and be able to do things
> like what we just did. … we can develop a more formal plan in a later time. But I just don't wanna lose this thread."*

**What the night showed** *(AI reading, marked as such — to be planned with the planning method when he says so):* the whole gesture was
made from **five independent choices**, each one line: the RHYTHM (a take, or four numbers) · WHO (an order of players, wrapping) · WHAT
PITCH (a rule: a climb from a note, a list, a harmony dealt) · WHAT SOUND (a swell of length × the gap, a strike, a trill) · WHERE (a time).
That is §L's three lists with two more — the sound and the place. The drawer binds them: a pitch belongs to a voice and a voice to a
player, the rhythm to the strike, the sound to a switch in another band, and the audition does not play the sound it writes.

**Things to consider, in his order of pain:**

1. **Decouple pitch from player.** The pitch rule is its own row, dealt per onset — a typed list · *transpose the whole shape* (AB2) · a
   climb from a note by an interval · a harmony from the banners dealt in turn or shuffled (1k's deck) · a chain (1n's) · the accent's own.
   The players' rotation is its own row — a typed order, wrapping (his *"bass clarinet cello viola violin two violin one flute"*), round
   robin or free, and an order that HOLDS every cycle (AB3). Chords mode already deals per onset; that engine generalises.
2. **Hear plays what Insert writes.** A swell auditions with its ramp (fill mode's hear path is the model — NITS 2026-09-09 evening); a
   trill as a trill. Until this holds, nothing else in the drawer can be judged by ear.
3. **One screen, five rows, one Generate, SPACE.** The rows are the five choices, each with a *source* menu and its few numbers; the
   turnaround is: change one number, SPACE. Everything else (the keyboard, the voicing presets, the seeds, the bands) is a second screen.
4. **Standing settings as profiles.** *"always five seventy five for this one. Always that order of instruments, always those pitches"* —
   a gesture's fixed choices are one click, not five controls; `crescRun.profiles.s3` is the first one.
5. **The console line stays** as the power path, and the drawer is a FACE on the same function: crescRun's options = the drawer's rows,
   so what he types and what he clicks never disagree. (§325's lesson: a handful of numbers was enough for the whole gesture.)
6. **Rhythms as a collection** (CN-58): a take's rhythm, or a played one, chosen by name — the *rhythm from* menu of §AA, extended to
   the takes and to new played sequences ingested as #46 ….
7. **A new drawer or the old one modified?** The engines exist and are pure — `accel_calc`, `strike_chords`, `cresc`, `harm_source`,
   `time_containers`, `fill`'s anchors — so a GESTURE drawer could be new and thin, with the strikes drawer kept for what it is good
   at (a played strike on the keyboard, voiced and orchestrated by hand). Which — the planning method decides, with his walk-through in
   his own words first (HOW_WE_WORK, 2026-09-07: *the script is the unit, not the ticket*).

## AD · The revision, commissioned — `built 2026-09-10 by 09:00 (RUNNING_LOG §333–334): the sound at an onset (strike_sounds.js), the crescendo's percentage and begin/end anchor and a Hear that ramps (swell_ui.js), accents on crescendos in the score's card (cresc_card.js); the rhythm part untouched; the revert point is the git tag pre-revision-2026-09-10 and the runtime flag septet.strikes.classic — his ear next`

> *"I would like to ask for a revision of the things that were built earlier. and we can dispense with the plan. I did careful planning, and it
> wasn't very fruitful. So I'm going to ask you to try to work independently and see if this makes things any better. If you could have some
> sort of copy or revert point so that if the changes you make aren't successful or made things worse, I can come back to where things are
> now. So fairly simply, I wanted the same functionality as the original strikes. Mostly the rhythmic functionality. So I could choose a
> harmony, then it would orchestrate the notes. and then spread these out over a rhythm. So I wanna keep all of that that's still there now.
> So, for example, I could create an acceleration with a single note on each onset or an even pattern over a certain amount of time or use
> the original played rhythm for that selected strike. and I could stretch that out, do other things to it. In other words, no changes right
> now to the rhythm part of the original strikes. All I really want to do too with the enhancements were to replace those individual notes
> with different things. So one would be... instead of a single note, multiple notes. So more than one instrument playing that that rhythmic
> position. A chord. And then another thing would be a crescendo. So at each rhythmic position, I could put a crescendo there. and we'll have
> a mode where the strikes pattern can represent the end of the crescendo or the beginning of the crescendo. Now the chord version, let's
> simplify that. Have some more simplified way of choosing the instruments for that particular chord. and the harmony for that particular
> chord. maybe the best way is that I use the regular strikes to create the rhythm. And let's see. I generate thirteen onsets and maybe for
> each onset, I could click it and then choose something from the drawer, a harmony. and then the algorithm will orchestrate it for me. so
> that it knows the available musicians for that particular one. In any case, try to simplify it. And for the crescendos, the only addition
> there would be the crescendos can actually overlap. they don't have to stop at the next onset. So maybe just a number box that will
> increase or decrease the length of the crescendo by a percentage. So maybe the default, the initial insert will be crescendos that last
> from one onset to the next. But then I can dial them longer or shorter. And then the accented crescendo is also a bit of a shambles too.
> it's not working at all like I wanted to do too. So what I propose is a reverse method. So I'll use your update to generate a sequence of
> crescendos based on the strikes rhythm. And then maybe just in the main score. we can do this. where I can select a Crescendo and then
> either add a beginning accent or ending accent and then choose the instrument to play it. So it might be something like this. I use the
> Strikes drawer to generate a series of crescendos in the rhythm I want. I insert that into the score. I select any given crescendo. And
> whether it's a panel or button, I'm not sure, you can decide, but then I can add a accent at the beginning or accent at the end, and I
> can choose the instrument that'll play that accent. because that I guess I'll need either once that accent is drawn in or part of this
> panel, I'll need a way to assign that accent, a pitch, and an articulation. Okay. So what I'd like to do now is if you could process this
> and give me a quick top line summary of your build. And then after that, let's document, commit, and push everything. You'll have the
> revert possibility, and then go ahead and try to build this. and I'll check-in in the morning."* (2026-09-10, 06:30)

**The reading, and the top line of the build** *(the AI's; the planning method dispensed with at his word — the record is here and in §333):*

- **The rhythm part of notes mode is untouched.** A strike or a harmony on the keyboard, orchestrated; the onsets as played · even · accel
  run · containers, stretched, jittered, reordered — everything of §J, §K, §W, §AA stays as it is.
- **What sits on an onset becomes a choice — the SOUND at that position:** a note (as now — the default, so nothing changes until he
  chooses), a CHORD, or a CRESCENDO.
  1. **A chord at an onset:** click an onset on the rhythm strip → a small card; click a harmony in the left column while the card is open
     → that harmony is dealt at that onset over the players FREE there (the re-attack rule against the real onsets, the notes by register,
     folded into range — 1k's engine); *all onsets ← this harmony* and *all onsets ← this banner in turn* for the whole pattern at once.
  2. **A crescendo at every onset** (1o's switch, kept): the length as a PERCENTAGE of the gap to the next onset — 100 % = one onset to the
     next (the new default), dialled longer or shorter, so they overlap or leave air; and an **anchor**: the pattern marks the BEGINNING of
     each crescendo (as now) or its END (each crescendo ends on its onset and starts one gap × the percentage earlier, the first reaching
     back before the pattern). **Hear plays the swells with their ramps** (the NIT of 2026-09-09 closed: fill mode's hear path reused).
  3. **Accents on crescendos, in the score:** click a crescendo → 1m's card gains an ACCENT row — *+ at the start* · *+ at the end* · the
     instrument · the pitch (default the crescendo's, folded into that instrument's range) · the articulation (default that instrument's
     strike voice: flute tongue ram / pizzicato, bass clarinet slap tongue, violins Bartók pizz, viola and cello gettato, the piano its
     voice) · ♪. The accent is a short strike note in its own right (140 ms) on that lane, at the crescendo's start or at its end (the cliff
     on the strike), in the crescendo's group.
- **Chords mode and fill mode stay** as they are, untouched; the new sound choices live in notes mode. **The revert:** the tag, or in the
  running app the flag `localStorage.setItem('septet.strikes.classic', '1')` + reload, which leaves the new files out.
- **Built on a copy, walked with real clicks and keys, committed at the wrap; his ear in the morning.** — done by 09:00; §334 has the numbers.

**How to use it (the morning's walk):**
1. Strikes drawer, mode `notes`, a strike or a harmony on the keyboard, the rhythm as always (as played · even · accel · `= ms`).
2. **A chord on an onset:** double-click a dot on the rhythm strip → the onset's card; click a row in the left column (a strike, a blast, a chord
   shape …) → the chord is dealt there over the players free at that moment, in their row voices; `all onsets ← this harmony` / `← banner in
   turn` for the whole pattern; `note` puts one back; `take` decides which notes when there are more than free players.
3. **Crescendos:** the head's `sound → crescendo`; the foot's swell group: `% of the gap` (100 = onset to onset), `starts on the onset` /
   `ends on the onset`, the dynamics, secco; **Hear orchestrated now swells**; `Insert swells`.
4. **An accent:** in the score, click a crescendo → the card → the ACCENT row: at start / at end · the player · the pitch · the articulation ·
   `+ add` · ♪ · ✕.
5. **If anything is worse:** console `localStorage.setItem('septet.strikes.classic', '1')` + reload = the drawer as it was; or the git tag.


## AE · The rhythm drawer remodel — `collected 2026-09-10, NOT built` (his rule again: collect the requests, update later)

> *"rhythm Drawer Remodel: Please collect these features feature requests, and then I'll have you do an update later.
> rhythm drawer or rhythm panel. 250% the width it is now. take the width from the the right, the dots and rhythm zone
> display. and then bump the fonts. So if I'm looking at ten, that should be around thirteen point. run pulldown at the
> top. then in vert order, gap, new label, like initial gap? if this is accurate, last, notes and steep, I'll give you
> more order later, but as a general rule put my order at the top and everything else keeps its order just moves down
> below the order I want at top"* (2026-09-10)

**AE1 · Width — 250 % of what it is now**, the extra taken from the right, where the dots and the rhythm-zone display are.

**AE2 · Fonts bumped ~×1.3** — his calibration: *"if I'm looking at ten, that should be around thirteen point."* Applies to the
panel's controls; the strip's own labels follow unless he says otherwise.

**AE3 · The control order, his, top-down:**

| | control | today's label |
|---|---|---|
| 1 | the **run** pulldown | `run` (`#skAShape`) |
| 2 | the first gap | the gap box (`#skAFirst`) |
| 3 | the landing | `→ last` (`#skAFloor`) |
| 4 | the count | `notes` (`#skACount`) |
| 5 | the steepness | `steep` (`#skASteep`) |

**AE4 · Relabel the gap box — and yes, "initial gap" is accurate.** Verified in §337 against `accel_calc`: the box IS the run's
FIRST gap, and every later gap is derived from it down to `→ last`. *(AI note, marked: if the first gap is renamed, `→ last`
reads oddly beside it — `initial gap` / `final gap` is the matching pair, his call.)*

**AE5 · THE STANDING ORDERING RULE (his, general — not only this panel):** *"as a general rule put my order at the top and
everything else keeps its order just moves down below the order I want at top."* A named order is a PREFIX. Everything he does not
name keeps its existing relative order and slides down beneath. No re-sorting of the remainder, ever. He will name more order later.

**Open, for him or for the build** *(AI reading, marked as such):*
- **AE1's direction.** *"take the width from the right, the dots and rhythm zone display"* reads two ways: the controls grow
  rightward and the dots/zone strip gives up that space (it narrows), **or** the panel as a whole widens rightward into the score
  area and the strip comes with it. The first shrinks his rhythm strip, which he may not want. To be settled before building.
- **Settled by evidence (§347, 2026-09-10):** the controls and the strip **already fight over the same pixels** — `#skRhyCtl` is
  absolutely positioned OVER the strip's left margin, and the strip reserved a hard-coded 130 px (chords mode: 10) against a panel
  that actually measures ~225 px with the run open. It covered his first onsets. Both now measure the panel. **So AE1 cannot simply
  widen the controls:** without giving the strip its own space the overlap gets worse. The remodel should give the controls a real
  column that the strip starts after, not a wider overlay.
- **The strip's own minimum.** If the controls take 250 % from the strip's side, the strip needs a floor below which the dots stop
  being readable — measure it before choosing.
- **What lands below the prefix** (AE5) in this panel: `= ms` / span · jitter % → % · hold · mirror · the level ramp · deal · pitches ·
  the shape's own dial (curve / ease / knee / gamma) — in the order they stand today.
- **`notes` and `steep` are two ways of typing one thing** (the run's length — §337): whichever is typed takes charge and the other
  follows. His order puts them adjacent, which suits that; the outline that marks the one in charge should survive the remodel.

## AF · Notes outside the harmony, and a player assignment that survives a shuffle — `collected 2026-09-10, NOT built`

> *"and can I assign non chord notes from the keyboard to instruments and have them survive shuffle etc"* (2026-09-10)

**Two requests, very different sizes. Neither exists today** — checked, not assumed:

**AF1 · Add a note that is NOT in the harmony, from the keyboard.** Today the keyboard shows only the notes the strike or harmony
holds; a click on a key toggles `v.piano` for the voices AT that pitch, and a key with no voice behind it does nothing. There is no path
to a pitch the harmony does not contain. (`extra` in the rhythm column is unrelated — it is *stack* vs *repeat* for notes beyond the
rhythm's ONSETS, not extra pitches.) **Size: real.** `this.voices` is derived from `s.notes` and every voice carries `v.i`, an index back
into the strike — takes, `state()`/`applyState`, `relay()` and `accelUnits()` all assume that. An added note means a synthetic voice with
no note behind it, so the honest build is a small "added notes" list on the strike in play, carried in cfg like the harmony's own id, and
folded in wherever `s.notes[v.i]` is read. *(AI reading, marked.)*

**AF2 · A player assignment that survives the shuffle.** Today only TWO assignments survive: `top →` and `bottom →`, which pin the
highest and lowest voice to a chosen lane. Everything else is cleared — `shuffleOrch()` opens by setting `v.lane = -1` on every voice.
**Size: small.** A per-voice `pin` flag, toggled where `solo` already is (a modifier-click on the dot), honoured in `shuffleOrch()` exactly
as the two locks are, kept by `state()`/`applyState` alongside `solo` and `skip`, and drawn on the dot so it is visible. It would also
make §341's automatic re-orchestration far more usable: pin the two or three placements that matter, let the rest re-deal on every new
harmony. *(AI reading, marked — this is the one worth doing first.)*

**Why they arrived together:** with `keep rhythm + orchestrate` on (§341), every new harmony re-deals every player, so anything he had
placed by hand is gone. AF2 is the answer to that; AF1 is a separate wish about the harmony's contents, not its orchestration.

## AG · The drawer unblocked: a chord on every onset of the rhythm, the articulation sets, the piano's share — `built 2026-09-10 (RUNNING_LOG §376–378; CN-61)`

> *"rebuild/fix just so I can use it, I want to get back to work asap … the goal is to be able to create a series of strikes in the rhythms
> I already can make strikes into, but instead of single notes, I want ensemble chords … I don't need to revise the whole drawer. I just
> need it so these things aren't blocking anymore."* (composer, 2026-09-10)

**The route — NOTES mode.** The chord at an onset (§AD) was always here; chords mode is the older 1k tool and is now labelled
`chords (old)`. Pick a harmony in the left column → shuffle → a SET → build the rhythm as ever (e.g. shape `accel · round robin`, run
`even`, gap 130, notes 9) → **double-click an onset dot** → the onset card → click any row of the left column: that harmony is the onset's
chord, dealt over the players free there. `all onsets ← this harmony` / `← banner in turn` do the pattern at once. The chords are keyed
by position in the run, so they hold through a change of gap, count or run shape; a take carries them (`cfg.sounds`).

**The articulation sets** (AB1-b/-c) — a `set` row above the players: **`percussive`** (the default = the U2 strike voices: Fl pizzicato ·
BCl slap · Vn Bartók · Va/Vc gettato · Pno main) · **`spiccato`** (strings #16 `spicc_vel`; flute and bass clarinet have no spiccato, so
their plain staccato) · **`staccato`** (AB1-b). One click fills every row, and every player dealt later — the shuffle and the chords read
the set in force (`cfg.artSet`). The lit button is the set the rows equal; none lit once a row is changed by hand.

**Transpose** (AB2) — `−8va · −½ · +½ · +8va` in the foot beside `oct`: every voice, in ANY preset (`oct` only ever moved the clusters);
the players re-fit their ranges; a new strike sets it back to 0. It moves the strike in play, not the chords set at onsets.

**The onset card, per onset:** `max` (at most n ensemble players; blank = as many as are free) · `deal` by register (default) / random ·
`reshuffle` (a fresh draw for this onset; it changes the players only under `random`, the notes only under `take: shuffle`) · **♪** (this
onset alone). **For the pattern:** `rest` — the SAME number as the run's `re-attack ≥` (a player is free again this long after its note
ends); **at 130 ms gaps use ~20–50**, at the old default 250 nobody is free after a big chord.

**The piano (CN-61, his (a))** — never in the ensemble's deal; it takes the chord's REMAINDER, never a doubling. `none · one note · up to n
· the rest` (default the rest). The notes must fit two hands: the left from the bottom up while within `reach` (14 semitones) and ≤ `/hand`
(5), the right from the top down the same; **what neither hand can hold is the middle, and it is dropped**. Taken alternately LH, RH, LH …
so `one` is the lowest note and `up to n` keeps the outer voices first. Its own clock, attack to attack: `≥ 100 ms` — it skips a chord
that comes sooner, the ensemble's rest does not apply to it. Off under a crescendo (a piano cannot swell).

**Not built:** the hand override per chord (a row per dealt note, pinned, the machine dealing around it — medium; say the word) · AB3.

**Where it lives:** `strike_drawer.js` (ART_SETS · setTech · applyArtSet · transpose in applyVoicing · the shape at the top) ·
`strike_sounds.js` (dealChordAt with max / deal / seed / the piano · handFit · the card's boxes · ♪ through a `_onlyAt` filter on notesFor) ·
`strike_chords_ui.js` (the onset card's drag released in the capture phase — §348's fix, never carried here — and the `(old)` label).

## AH · Chord to chord: who plays next, the piano off for one onset, the piano topped up — `collected 2026-09-12` · **AH1 · AH2 · AH3 and the ±8va BUILT 2026-09-12** (RUNNING_LOG §407) · AH5 deferred at his word

> *"And so what if I want to alternate? Cord to cord. So have four on the first. and sometimes include repeats. So four four on the first,
> three on the next, for example. So that would include the two missing plus one, and so on. Then the next one might be three, which would
> be all new three. The next one might be six, or let's say five, sorry, which would be all the ones not included in the three, but
> including two of the three, etcetera, etcetera. And what if I don't wanna include the piano on one? And how do I get the piano to take
> on, for example, the rest of the notes, but if they aren't enough, then some additional notes. Can I dial that in? So let's say I want
> the piano to take on five pitches. There's only two left over. So it takes those two plus three more random from the cord. And then what
> do I do when I'm done? Just close the panel and it's set, or do I have to set it somehow?"* (composer, 2026-09-12)
**What the drawer does today** *(read from `strike_sounds.js` `dealChordAt`, 2026-09-12):* the COUNT per onset is dialable (`max` on the
onset card); WHO is by register (the k lowest-register free players, pitches low→high onto players low→high) or `random`; a player is
free when no other note of theirs lies inside t ± (140 ms + `rest`). Nobody remembers who played the onset before. The piano's share is
ONE setting for the pattern (`pnoCfg`), never per onset; `up to n` is a cap, never a target, and CN-61 (a) forbids a doubling.

- **AH1 · "Prefer the rested" — the players who sat out the last onset are dealt first.** Then his 4 → 3 (the two missing + one repeat)
  → 3 all new → 5 (the three left out + two of the three) falls out of `max` alone, without `rest` having to exclude anyone. *(AI
  reading, marked as such: a rank by "onsets since last played" ahead of the register sort in `dealChordAt`; `random` breaks ties.)*
- **AH2 · The piano's share PER ONSET** — `none` on one onset, `the rest` on the others. *(AI reading: `pnoShare` on the onset card
  overriding the pattern's, the way `max` overrides `sndMax`.)*
- **AH3 · The piano topped up to a target** — "take the rest, and if fewer than n are left, add random notes from the chord until n."
  *(AI reading: a `target n` mode beside `up to n`; the top-up doubles ensemble notes, which CN-61 (a) forbids today — his rule to
  relax, per onset or for the pattern.)*
  **Decided 2026-09-12 (CN-66): yes — the piano may double when it tops up; leftovers first, then pitches the ensemble already plays.**
- **AH5 · The piano's own voicing per onset, behind a hands guard — DEFERRED at his word ("if this is too complicated a layer, we can
  defer it")** (composer, 2026-09-12, verbatim in CN-66): the piano's n notes at an onset re-voiced on their own — registers, the
  keyboard's presets (original · spread out · cluster …), the transpositions — with *"a standing guard that just knows no matter what the
  piano's playing … if it's within the playability for the two hands."* *(AI reading: the guard is `handFit` today — reach 14 · 5 per
  hand · the middle dropped, reported on the card; the re-voicing is the keyboard's voicing engine run on a second pitch set per onset,
  a new row on the card — medium. The cheap version, offered: a ±8va for the piano on the onset card.)*
- **AH4 · The passage he wants to try — the script the fixes are for** (composer, 2026-09-12, verbatim in COMPOSITION_NOTES **CN-65**):
  an even rhythm (his image: gap 200 · notes 14 · re-attack 250) · each onset a different strike harmony, **from strike #0 in order** ·
  the ensemble alternating — *3 then the other 3*, or *4 · 6 · 3 · 2* — **each turn taking the players who sat out last strike, plus any
  more it needs** (AH1) · the piano by NOTE COUNT per onset — *5 · none · 6 · 2* — the leftover pitches first, **topped up from the
  harmony, reshuffled, when there are not enough** (AH2 + AH3). *"If I don't make the gap large enough, then only the players left out
  last time were available, and that's okay too."*
**HOW IT WORKS NOW (built 2026-09-12, RUNNING_LOG §407 — `strike_sounds.js`):**

- **AH1 · the rested play first, always.** The free players are ranked by time since that lane last played (a lane that has not played
  is first), and an onset takes the longest-rested `max` of them; ties keep the old order (register, or shuffled under `deal: random`).
  The pitches still land on the chosen players BY REGISTER. Nothing to switch on: `max` alone gives his 4 → 3 → 3 → 5.
- **AH2 · `piano count` on the onset card** — blank = the pattern's piano row above · `0` = the piano sits this onset out
  (`off here`) · `n` = a target of n notes. Stored on the onset, so a take carries it.
- **AH3 · the top-up** — under a target, the leftovers come first and then pitches the ensemble is already playing, drawn with the
  onset's own seed (`reshuffle` re-draws them), until n. The readout says `6 left over + 2 doubled`. `handFit` still has the last word,
  and reports what it drops.
- **`piano 8va` on the onset card** (−2 … +2) — the cheap half of AH5: the piano's pitches moved by whole octaves, folded at the
  keyboard's ends, the two-hand guard unchanged after.
- **Walked in the app on a copy** (:5301, real clicks): the alternation on the page, `piano 8 (6 left over + 2 doubled)`, `-2 8va`
  folding 19 → 31, reshuffle re-drawing only the doubles, `0` silencing the piano for one onset. **Unheard by him.**

- **Answered, not a request:** the chords are written by **Insert**, not by closing the panel; a take keeps them by name.

- **AH6 · ONE HAND per onset, the hands alternating — BUILT 2026-09-12 (CN-67, RUNNING_LOG §409).** `hands` on the piano row
  (`two` · `one, alternating`) and `hand` on the onset card (`patt` · `one` · `two`). The piano's n notes (n ≤ /hand) folded into one
  reach, the window wholly above or below the previous piano chord and the side alternating; leftovers → doubles → the same pitch
  again at the octave (his word) when the reach allows. Readout `one hand ↑ · …`. Unwalked in the app at the build.

## AI · Strikes alternating with crescendos — a chain of links, the roles rotating, the piano on the strikes only — `collected 2026-09-12 (CN-68, verbatim there); planned RUNNING_LOG §411–§418; BUILT 2026-09-12 as PLAN 1t — RUNNING_LOG §419. How to use it is the first block below.`

### AI · HOW TO USE IT — built 2026-09-12 (PLAN 1t; RUNNING_LOG §419)

**The shape, his (CN-69 → CN-72): the drawer makes only the STRIKES; every crescendo is made in the SCORE, from the strike that
launches it, by selection.** Nothing is added to every note; the placements are clicks, not numbers.

**The loop, as walked:**

1. **A strike.** The drawer as always. Two new helps: the **tick per player row** in the orchestration panel (a row sounding at the
   playhead in the open score is dimmed and says `busy → t s`; `shuffle` deals onto the ticked rows only, so one ticked row gives a
   single-note strike) and **`unison`** in the rhythm column (every onset at the first; span × · = ms · gap grey out and say why).
   `Insert @ playhead`.
2. **Select the strike notes the crescendos launch from. SHIFT+C.** The panel:
   - **who** — a tick per player. Pre-ticked = not in the selection AND free at every selected onset. The piano is `✕` and disabled
     (CN-34: it cannot swell); a player in the selection shows `·`. Untick for a subset.
   - **the mode** — `one per onset` (the onsets in time order, each taking the first free ticked player not yet used; the onsets left
     over are named) · `all others from each onset` (every free ticked player launched from each onset — one onset selected = his
     "the other three begin a crescendo").
   - **ends** — `even` (typed seconds) · `together` (every one stops at one time: the last onset + the seconds) · `next strike` (the
     first strike group after the selection; its onsets dealt in order, so each crescendo ends ON one of them, and one with no onset
     left is named). Every end is still capped 0.17 s before that player's next sound and floored at 0.3 s; the readout says which.
   - **harmony** — `these notes` (each takes its launching strike's pitch) · `next strike` (that group's pitches in order) · `the
     drawer` (the keyboard's pitches as they stand, dealt low → high onto the players low → high). Every pitch folded into the
     player's ordinary voice; one that no octave reaches is named, never silently moved.
   - **dynamics · shape · secco** — ppp → fff and surge 5× by default, the crescendo card's own defaults; `preview` shows what `[go]`
     would write; **`[go]` is ONE undo step** — CTRL+Z removes the whole go. ESC closes. Each crescendo's own card edits it after.
3. **END** puts the playhead at the END of what is selected — the latest end among them — so `Insert @ playhead` lands the next strike
   exactly there. Nothing selected: it says so and does not move.
4. **The piano on a plain strike.** The orchestration panel's footer, beside the piano flags: `count` · `8va` · `hands`. Blank = as
   always, the piano's one note at its own shuffled onset. With a count that note becomes a chord of `count` — the harmony's leftovers
   first, then doubles of pitches the ensemble plays (CN-66), `hands: two` (CN-61) or `one, alt` (CN-67), the ±4 `8va`; the readout
   says `4 left over + 1 doubled · 5/hand caps 6`. Hear and Insert carry it; the strip rings the piano's notes in solid blue and the
   count reads `ensemble+piano`.

**Open, his call (RUNNING_LOG §419):** after `[go]` the selection stays on the STRIKE, so END goes to the strike's end and he must
click the crescendo before pressing it. Leaving the new crescendos selected would make the eight steps flow without that click — it
changes selection behaviour he did not ask for, so it was not done.

**Still deprecated (§413):** chords mode and fill mode. Nothing above is built on either; `sounding.js` is the lift of fill's read of
"what is sounding over a time", not a call into it.


**What the drawer does today** *(read 2026-09-12 from `strike_sounds.js` `dealChordAt`, `swell_ui.js`, `cresc_card.js`):*

- **The rhythm column is the only source of onsets** (§J · §W · §AA): as played · even · accel · containers · `= ms` · jitter. Nothing
  makes an onset out of where a crescendo ends.
- **At an onset, the sound is ONE KIND for the whole pattern's swell state:** a note or a chord (dealt over the free players, the
  longest-rested first, `max` the count — AH1), and the sound switch (§Z, §AD) turns EVERY onset's sound into a swell — length a
  percentage of the gap to the next onset or one typed length for the pass, anchored at the onset's start or its end. **No onset can
  hold a strike for some players and the start of a crescendo for the others.** That is the one gap.
- **The piano never swells** (CN-34, `!this.isSwell()` in the deal) and takes the remainder or a count under an attack — already his
  "piano on the strikes only", by construction.
- **A player's rest is measured from its last ONSET** (`lastOn`), which is right for strikes and wrong for a player coming off a
  crescendo: at the moment a swell ends, its player reads as rested since the swell BEGAN. `busy` does honour the swell's length.
- **In the score, a crescendo takes an accent — a short strike by another player — at its start or its end** (§AD 3, `cresc_card.js`
  ACCENT row), one crescendo at a time, by hand. That is his "each ending corresponds to a strike in some other instrument", built
  already but one at a time.
- **He has been at this by hand already:** the unsaved working copy `cres2strike` and the passage bank's `accentedcres01*.json`.

**The reading — a sketch to keep the thread, NOT a plan** *(the AI's, 2026-09-12; the plan follows the planning method when he says so):*

- **AI1 · The link as the unit of the deal.** The rhythm's onsets grouped into links by the strike sizes: UNEVEN — a link is s
  consecutive onsets, one striker each; EVEN — a link is one onset holding a chord of s strikers (the chord deal as it is). The
  strikers are the longest-rested free players (AH1 unchanged); the piano by its own count rule (AH2 · AH3 · AH6 unchanged).
- **AI2 · The crescendo set = the free non-piano players the link did not strike with**, each starting on one of the link's onsets
  (round-robin over them) and ending by the length rule: (1) start + the typed length; (3) on one of the NEXT link's onsets
  (round-robin). Pitches from the link's harmony, the strikers' notes first taken, the swell's the rest — `take` decides as now.
- **AI3 · Who: two modes.** `two ensembles` — his membership typed once, the roles swapping link by link; `rotation` — the sizes list
  (`3 2 4 1`, a floor of 2) with rested-first doing the shuffle. Rested-first with varying sizes rotates by itself; the two-ensemble
  mode is the sizes held constant with the membership pinned.
- **AI4 · The one real change: a per-note KIND (attack | swell) through the three sibling paths** — the deal, Hear, Insert (and the
  strip's marks) — where today the swell is a pattern-wide switch. PLAN 1q-PRINCIPLE's hazard exactly: one rule, four paths, each
  wired or the fault appears in the one that was not.
- **AI5 · Rest from the note's END for the chain** (`lastOn` → last end), so a player just off a crescendo is the least rested, not
  tied with everyone.
- **Deferred at the reading (to confirm with him):** a crescendo's END as a NEW onset (length-driven rhythm — the rhythm column stays
  the driver; under rule (3) he places the next strike where the crescendo should end) · his "one ending seeds the next strike group
  with its own rhythm" (the same: the rhythm column) · any crescendo pitch strategy beyond the harmony by register · the rotation as a
  strict shuffle rule beyond rested-first + sizes.


**CORRECTED the same day (RUNNING_LOG §412) — the "one gap" above was already closed by FILL MODE (§Y, 1n, 2026-09-08), which the first
reading did not open.** Fill mode is the second pass: a strike group in the score goes in, one crescendo per attack comes out on another
player, anchored launch · cut · both (attack to attack, `cut after` n), Generate · Hear · Insert, the card's flip and re-point per long.
It already writes attacks and crescendos together — AI4 is not a risk, and AI1–AI3 are two passes he can run today. What fill mode
lacks against CN-68, and the revised build (small, on fill mode, not a new generator):

- **AI6 · the piano must never take a crescendo in fill** — today `fill_ui.js` hands `deal` every lane; CN-34 is not applied there. One line.
- **AI7 · a typed length** (rule 1) beside the derived one, still capped by the room.
- **AI8 · `per attack: one | all free`** — "the other three begin a crescendo" needs everyone free, not one long per attack.
- **AI9 · `cut after` per link** when the sizes vary under rule 3 — or his hand on re-point until then.
- **AI10 · a `players` field for the fill pass** (two ensembles, the crescendo side; `deal` already takes the list). The strike side's
  pin stays with §AF.
- AI5 (rest from the end) is fill's already — "never one already inside a long". Deferred as before: ends as new onsets.
## Open questions for the composer (only what blocks the next piece)

*(Both answered 2026-09-03: cluster = the smallest chromatic span, movable by octave (R5); the
keyboard shows the ensemble's span with an `88` toggle (R6).)* **None open before the listening pass.**

## The build, as shipped for the morning test (2026-09-03 night)

Start: `cd C:\Users\jwloy\GitHub\septet_2026` → `node score\server.js` (restart it once — the
`rescan` route is new) → http://localhost:5300/composer.html → press **Strikes**.

- **In:** A–H, J, K (no lock), L, O (v1), Q (no delete), R, S (name-rule kinds), T. Verification
  numbers in RUNNING_LOG §39.
- **Not yet:** I double stops · K lock · M harmony collection + index · N harmony swap · P Messiaen
  · the `kind` field in `sandbox/instruments.js` (0c).
- **Rules worth knowing while testing:** `Insert @ 15.18 s (original)` writes the strike at its own
  time into whatever score is open and replaces its original notes only where they truly exist (the
  source save or a copy of it); `Insert @ playhead` goes to the playhead of whatever is open.
  SPACE while the drawer is open = hear / stop, wherever the focus is (the score's transport never gets
  it; a text box keeps its spaces). Takes live in `bank/panel_snapshots.json` (O v2) and are committed at
  each wrap; a take name is 1–64 letters, digits, dot, underscore, space or hyphen.

## Log

- 2026-09-03 — A, B, C stated by the composer; D exists as v1. Nothing built against A–C yet.
- 2026-09-03, later — E (orchestration panel) stated; F (ranges) proposed and adopted; G (audition modes) stated; H (the piano's role) raised, a four-way switch proposed, then replaced by the composer's push ("a different organization or logic?") with the SELECTION logic — flags per note, click-to-toggle, quick buttons — adopted; a shuffle starts the piano on one note. I (double stops on the strings) wanted, same flag mechanism.
- 2026-09-03, later — J (the rhythm column) stated; layout and a transform set proposed. Process change (composer): commits and pushes are batched every few exchanges, not per reply.
- 2026-09-03, later — K (order of the notes) stated; presets, shuffle, drag / swap, lock.
- 2026-09-03, later — J rule: the redaction grouping is live, re-derived after every transform.
- 2026-09-03, later — L: the three-list model confirmed by the composer.
- 2026-09-03, later — M (the harmony collection as a source; index proposal), N (harmony swap by voice rank), O (takes) recorded; N and O proposed.
- 2026-09-03, later — N, O adopted; P (all Messiaen modes) and Q (linked to the score; step one = pick the strike in the sequence) recorded.
- 2026-09-03, later — R: decisions 1 (full-width drawer in the score) and 2 (duration ×) taken; 3 (strike techniques) in discussion; 4–6 open.
- 2026-09-03, later — S: the articulation column and the stand-in rule recorded; layout proposed; `kind` metadata named as the 0c prerequisite.
- 2026-09-03, later — S adopted; T (variant side panel) recorded; B clarified (cluster = smallest chromatic span, movable; high+low clusters; spread out); R4 dynamics, R5, R6 (ensemble span + an 88 toggle for the piano) decided. All pre-build decisions taken.
- 2026-09-03, night — **built:** the drawer (`strike_drawer.js`) with A–H, J, K, L, O, Q, R, S, T as marked above; verified in the running app; the Replace-by-id hazard found and closed (source-save guard). RUNNING_LOG §39. Next: the composer's listening pass, then I, K lock, M/N/P.
- 2026-09-04, morning — the composer's first look: a `STRIKES ▴` tab at the page's bottom edge (the toolbar wraps on smaller screens), the drawer full page height by default with `↕ half`, keyboard rows fitted to the drawer. RUNNING_LOG §40.
- 2026-09-04, evening — **U1–U4 built** in one update (composer: "then build all 4 pls"): a gap column between keyboard and players with the lines landing on a marker per row and the hovered row's lines brightened (U1); the strike defaults flute pizzicato · bcl slap · violins Bartók · viola/cello gettato · piano main, and `flat 127` on by default (U2); solo — shift-click a dot (keyboard or rhythm), `S` per player row, `solo off` in the footer; while anything is soloed only the soloed voices sound (U3); the rhythm strip at 480 px by default with a width slider 320–1400, the saved space to the gap (U4). Verified in the running app, no console errors. RUNNING_LOG §64.
- 2026-09-04, session 3 — **O v2 + the SPACE bug** (composer: "yes lets keep those save files as well, also I've saved 2 already lets try to preserve them" · "I hit space to play, that was working But then at some point, it started playing the main score"): takes moved from the browser to `bank/panel_snapshots.json` through the panels' snapshot route (bucket `strikes`), with a one-time migration of the v1 localStorage takes, the server's name rule checked in the drawer, and a `×` delete; SPACE re-routed — a window capture-phase listener owns SPACE while the drawer is open, because the score's blur-every-select-on-change rule dropped the focus to the page body and the score's own SPACE handler took over. Reproduced, fixed and verified in the running app (RUNNING_LOG §65). Also answered: an instrument left out by the shuffle is hooked back in by hand — double-click the dot, click the player's row; the note folds by octave into range (↓ / ↑); nothing else moves (F, the two-click assign).
- 2026-09-04, session 3 — **Q v2** (composer: "have the time code carry with the strike … whatever save file's open, it can insert at that time code … rename the button, like, insert in original time"): `Replace in place` → `Insert @ 0.61 s (original)` — the label carries the strike's t0; it writes at t0 into whatever score is open, removing originals only where they truly exist (id + layer + pitch + onset within 25 ms), so the source guard is gone. Verified: into an empty score → 7 notes + META at 0.608 s, "no originals in this score"; into a copy of the committed ScatteredStrikes01 → "replaced 9 original notes". RUNNING_LOG §68. Built alongside D17 (the save system).
- 2026-09-09, session 7 — **§AA built:** the harmony banners and *rhythm from · extra notes* (composer: "update the strikes side panel there with everything" · "Can we have either" · "yes to rule 2, go"); walked with real clicks on a `zz-ai-harm` copy — RUNNING_LOG §324.

### AI · AFTER THE FIRST HOUR IN HIS HANDS — 2026-09-12 late (RUNNING_LOG §420–§424)

Six fixes at his word, then three rule changes as he composed. The controls as they stand:

**The strikes drawer**
- **A ♪ at the end of every harmony row** (left column): that harmony alone as a **piano block**, 600 ms — nothing loaded, nothing
  changed. **`♪ as dealt`** in the head: the LOADED harmony as it is orchestrated — every player its note, one strike, no rhythm.
  Both go through `playNotes(notes, label)`, which is Hear's body (`play(mode)` calls it too).
- **Unticking a player in the orchestration panel drops it AT ONCE** (`dropLane`): its doublings go, each of its own notes moves to
  a free TICKED player that fits, or falls silent with a word in the status. Ticking back changes nothing until a shuffle.
  *(Before this it only steered the next deal — his "unchecking does not take them out from hear orch".)*
- **Chords still saved per onset survive a mode switch.** `notes` mode does not clear them: `clear all` on the onset card does
  ("every onset back to a single note"). His "it's playing four courts for each strike ... notes mode isn't working" was this.
- The piano on a PLAIN strike: **`count` · `8va` · `hands`** on the bottom bar, right of `piano none|one|top+bottom|rest|all`.
- The run's length: the **`=` ms box** IS the run's length while the shape is `accel` (steep and notes follow). Gentler = `steep`
  toward 1. "All the notes, then shuffle, then all the notes again" = deal `round robin` · pitches **`the cards`** (not `the whole
  strike`, which draws at random from a pool) · **re-deal pitches after cycle 1** ticked.

**The crescendo panel (SHIFT+C)**
- **`▶ hear`** beside `preview`: plays the would-be crescendos — each on its own player's route with its CC7 ramp and the secco
  cut, timed from the first of them — and writes nothing. `preview` is still the TEXT list only.
- **`ends: next strike` = the NEXT ATTACK after the onset, for every player** (§424). Not a spread over the next strike's onsets:
  they all end together. Across a selection, each onset ends at the attack after IT — the selection's own later onsets included.
- **The "next strike" is any plain note**, not only one the drawer wrote (§422) — a note placed by hand counts.
- **`harmony: typed pitches`** (§423): a box appears under the select — note names (F2, C#3, Bb1) or MIDI numbers, space- or
  comma-separated, dealt low → high by register like the drawer's list. `harmony: the drawer` has no picker: it reads whatever is
  loaded in the strikes drawer.
- **`[go]` leaves what it made SELECTED**, so **END** parks the playhead at the crescendos' end and the next strike is one key away.
- The panel no longer sticks to the mouse (mouseup captured on `document` — §348's fix, which the panel never got).

---

## LGMF · the drawer adapted for this piece — stage 1 `built 2026-09-19 (RUNNING_LOG §92)` · stages 2+ `PLAN 1c, to be laid out`

His principles for the adaptation, verbatim in COMPOSITION_NOTES LG-32: *"I don't want to, as much as possible, interrupt or modify
current functionality … I want just the functions and features I'm asking for … I don't want to change anything in the drawer unless
necessary. And those you should check with me."*

**Stage 1 — what changed, and only this:**
- **The column draws with no strikes.** This piece's bank has no recorded strikes and no sequences; `fillSeq()` used to stop there with
  an error, before the banners were ever rendered. Now, with no sequences, it renders the banners (STARTERS · STACKS · MODES · BLASTS ·
  CHORD SHAPES · the models' sets) and, once the morph panel's lists are read, re-selects the last harmony only if nothing is loaded.
  With sequences present the code path is unchanged.
- **A fourth articulation set, `ordinario`:** EH senza_vel · Bsn / Hn / Tpt ord · Perc main · **Vib std_mallets_vel** (his word: "the
  number one standard mallets") · Vc / Db senza_vel — the voices the reference scores play. The three older sets are untouched and
  `percussive` is still the default; one click on `ordinario` sticks.
- `tools/palette_check.js` asserts the new set (184 checks).

**Not changed, at his word:** the keyboard span (`88` shows the bass's E1–B1) · the piano features (inert here — no piano lane) ·
Hear and Insert (no cents yet).

**Stage 2 — long tones on Hear (PLAN 1c.2, built 2026-09-19, RUNNING_LOG §94):** `hear [strike | long tone] [N] s` in the foot, right of
Stop. `long tone` = the harmony as dealt — every player its note, together, held N seconds — through SPACE or *Hear orchestrated*;
SPACE again stops it. **Insert follows the menu** (his decision A, §AC-2): with `long tone` on, Insert @ playhead writes the held chord.
Both settings ride in cfg, so they are remembered and restored by takes. One file, `long_tone_ui.js`, loaded last; on `strike` the
drawer is byte-identical. And `ordinario` now bows the vibraphone (`bowed_vel`, the reference scores' voice).

**Stage 2b — Hear through the remap, and a dynamic ppp … fff (PLAN 1c.2b, built 2026-09-19, RUNNING_LOG §95):** his *"are they plugged
in to the volume measurements"* — they were not: `playNotes` sent CC7 127 and the raw velocity to every instrument (piece #5's drawer
did too). Now a note's `vel` is the ANCHOR on the written scale and each note is sent as the score sends a held note — the instrument's
own velocity (`velocityFor`) and its CC7 (`cc7ForHeight`, the vibraphone's register). `dyn [ppp … fff]` on the foot REPLACES `dyn ×`
and `flat 127` (his A; the cfg fields stay); default `mf`; the ladder is the written scale, evenly — ppp 65 · pp 74 · p 83 · mp 92 ·
mf 100 · f 109 · ff 118 · fff 127, ≈ 1.7 dB a step over 1b's 12 dB. Insert now writes the height that means the anchor, so an
inserted note plays back at the level Hear played (it wrote `vel / 127`, right only at fff). `dyn_ui.js`, loaded last.

**Stage 3 — two vibraphone players, one per bow (PLAN 1c.3, built 2026-09-19, RUNNING_LOG §96):** a second SEAT — `Vibraphone 2`, a
ninth row in the drawer on the vibraphone's own lane (`EXTRA_SEATS` in strike_drawer.js; the drawer's `TRK()` = TRACKS + its seats).
The score's TRACKS are untouched. Inside the drawer a seat is a row like any other; at the boundary (`seats_ui.js`, the last mixin) a
seat's note leaves on the vibraphone's lane with `seat: 2` — Hear routes it to the instrument's first curve channel (D11's slot A),
Insert writes it as a drawn note so the score's channel pool separates the two bows. A seat is busy when its lane is.

**Stage 4 — the natural harmonic series, the JUST column (PLAN 1c.4, built 2026-09-19, RUNNING_LOG §97):** a banner **HARMONIC SERIES ·
from the fundamental** under STRIKES — a fundamental box (E1, C2, Bb1 or a MIDI number; ENTER) and one row, `just · partials of C2 ·
65 n`. It loads like any harmony (id `sp:C2:just`; a take rebuilds it); the `88` view switches on; every partial to the top key, each
dot labelled `p · ±c¢` (the JUST column, at the right — the other three come to its left). The arithmetic is `spectrum.js`
(`node tools/spectrum_check.js`, 23 checks against the textbook). **Cents through the drawer:** a voice keeps `partial` and `cents`;
every departing note carries them; Hear sends the bend before the note (the instrument's measured range); Insert writes `morphBend`
as `lgmf-ref` does, the note drawn (its own channel), `partial p · ±c¢ just` in its performance note. **The fixed-pitch rule:**
`mayTake(voice, lane)` — a player who cannot bend (`playerBendSt` 0: the vibraphone, its seat, the percussion) never takes a note more
than **5 ¢** off; the shuffle's fit test and `fitReal` (the hand) both ask it; within 5 ¢ the note is tempered, cents dropped.

*Made legible the same evening (RUNNING_LOG §98, his choice B):* **one dot per key** — the lowest partial keeps the dot, the others sit
on the same point (the lines still start from them); one label per key, `7 · −31¢` alone or `47 · 48 · 49` shared (cents on hover);
a double-click on a shared key arms its lowest partial. **The rows' chips carry the partial and cents** — `A#4 · 7 · −31¢`, or
`C6 · 16 (tempered)` on a player who cannot bend.

**Stage 5 — the range lines, the JUST / 8ve column, pink and green (PLAN 1c.5, built 2026-09-19, RUNNING_LOG §99):** a 30 px strip at
the LEFT of the keyboard with **one thin range line per instrument** (always; the hovered row's line brightens) — the core's drawing is
moved into a `<g transform>`, its coordinates untouched. **The second column:** the partials transposed into every octave of the 88 —
each distinct pitch class with its cents, named by its lowest partial (3 stands for 3 · 6 · 12 …; 7 at −31¢ and 57 at 0¢ are two
classes), C2 = 33 classes, 244 notes; to the left of the JUST column, the same fixed-pitch rule. The banner has two rows, `just` and
`just + 8ve` (the id carries the sets). **Labels by set:** JUST pink, 8ve green; the chips too (`55⁸ · +38¢`).

*Then, the same evening (RUNNING_LOG §100, his "let's make the keyboard much wider"):* the range lines moved **onto the keys** right of the
note names, **one colour per instrument** (a swatch before each row's name is the legend; the name on hover; the hovered row's line
brightens); the **columns measured** — each as wide as its longest label — and placed to the right of the keys, 8ve then JUST, the
keyboard's width following, so nothing overlaps even for G0 (partial 175, 827 voices).

**Stage 6 — the two TEMPERED selections (PLAN 1c.6, built 2026-09-19, RUNNING_LOG §101):** the banner has **four rows**, each its own
harmony (his word: "no reason to have them all on the same selection") — `just` · `just + 8ve` · `tempered` · `tempered + 8ve`. The
tempered sets are the same partials on their keys with no cents (every player plays the key); the tempered classes are the twelve
pitch classes, named by the lowest partial of each (1 3 5 7 9 11 13 15 17 19 21 27), so `tempered + 8ve` is one note on every key.
Colours by set: JUST pink · 8ve green · TEMPERED blue · TEMPERED / 8ve amber.

**Stage 7 (PLAN 1c):** the partial checkboxes — prune the series by choice — a fundamental, the four columns (just · just per octave ·
tempered · tempered per octave), the partial number on everything and ± cents on the just, partial checkboxes, set toggles — ·
range lines beside the keyboard · takes restoring every checkbox. The one new mechanism is **cents on a voice** (a bend before the
note in `playNotes`; `morphBend` on Insert as `lgmf-ref` carries it; fixed-pitch players on the tempered note).
