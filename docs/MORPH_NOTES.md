> **Provenance (septet LGMF 2026, 2026-09-17):** copied WHOLE from piece #5 `septet_2026/docs/MORPH_NOTES.md` — the composer's central notes for the morph tool, kept "for this piece and the next piece" (CN-29); Lake George is the next piece. §3 stays append-only and continues here. "This piece" in §1–§2 means the Tempus septet; the code it describes arrives in this repo with PLAN 0b. The Lake George entry is §3, 2026-09-14.

# MORPH_NOTES — the central notes for the morph tool (this piece → the eventual revision)

> **Why this file (composer, 2026-09-06, CN-29):** *"I'm going to be using the morph textures a lot in the future for this piece
> and the next piece. I'd like to eventually make it an easier to use all purpose tool. But for now and maybe for the next piece,
> will adjust it for the current use, but I want to institute a process where we're taking notes in a central document that will
> inform the eventual revision."*

**The process (standing, from 2026-09-06; also in CLAUDE.md):** every remark about the morph tool — an awkwardness, a wish, a
piece-specific adjustment made, what an all-purpose tool would need — goes into §3 the moment it is said, dated, his words
verbatim, the AI's reading marked. The tool is adjusted for the current use in the app; this file is the memory for its revision
into an easy all-purpose tool, after this piece or the next. §3 is append-only, like the lab journal; §4 is the digest, rewritten
freely.

## 1 · What exists (2026-09-07 — the beating tool built, PLAN 1f steps 1–7; `docs/BEATING_TOOL.md` is its document)

- **The beating tool is this piece's morph tool** (the requirements talk 2026-09-06, RUNNING_LOG §145–166; built overnight
  2026-09-07 at his word, §167–174). The object is a *beating* — one pair of players on one pitch, both bending around it by
  mirrored curves, the gap beating — and a *pattern* is up to three of them under one META shape. What exists:
  - **the math** — `score/public/beating_calc.js` (page and tools): the palette (the six bending players, the ordinary voices'
    measured ranges, the bend limits, the pairing rule at unison and at the intervals), the conversion (a rate in beats per second
    ↔ cents against the centre on the interval's coincident partial; the register law inside), the heard beating from the two
    players' cents, the shapes, the mirror and the slide, the three breath modes and the seeded deal with a ceiling table, the
    re-key past the sampler's range, `renderPair` → each player's chain of notes with bend and level breakpoints, `renderPattern`
    (offsets, the META contour), `stretch`; `tools/beating_calc_check.js` (77 checks);
  - **the palette's numbers** — the recipe's `playerBendSt` (his semitone) · `bendRangeSt` measured by the bend probe run in the
    rack (SI2 flute ±2.00 st, the Xsample five ±0.96–0.99 — set to a semitone in Kontakt; RPN 0 ignored on all six; the residue
    real on all six) · `beating: false` on the piano; the probe kit `balance_schedule.js --bend` → `balance_probe.ps1` →
    `probe_run.sh` → `analyze_bend.py` (self-tested) → `bank/bend_ranges.json` → `apply_bend_ranges.js`;
  - **the object** — a zone `midiModel: 'beating'` with its `beating` block, on the launching lane, its partner's lane carried (a
    dashed bracket there); its notes generated at every play start into the zone's snippet — per-event routing for the partner,
    `_bend` events for the pitch bend through the measured range, CC7 through 1g's remap; the tick's bend branch, the centre after
    the end and on stop; B on a strike note makes one; the label; NAMING §2.10;
  - **the panel** — `score/public/beating_panel.js`: rows, the mirrored rate curves with handles on rails, the band tinted by zone,
    shapes and draw, the mirror lock and ALT-drag, the body slide, the crescendo lane, the breath lane with sliders / the ceiling /
    shuffle, the offset rail, the length box, SPACE (the pattern through the tick's event path), takes (`beatings` in
    `bank/panel_snapshots.json`); **the pitch side** — the strike menu from the bank, the keyboard with the chord lit and the
    unplayable keys dimmed, a note armed and clicked or dragged onto a pair, the relations from a root dealt and folded;
    **insertion** — insert @ playhead as one group with a META shape (the crescendo's mean), the shape's drag / stretch / delete
    carrying the beatings, re-insert replacing at the same time, select + P loading the group; nothing around it touched (§160).
- **The tuba piece's morph engine, still carried by the port and untouched:** `score/public/morph.js` · `morph_emit.js` ·
  `morph_panel.js`; a morph note's `morphBend` on the plain-note tick (its 1.99 st constant at `composer.html` ~10112 is the tuba's —
  the beating does not use that path); `resetMorphBend` (kept, now shared: the beating registers its slots there). Its documentation
  in #4 (`for_seven_tubas/docs`): `MORPH_FINDINGS.md`, `MORPH_NOTATION.md` (the notation form the beating will take at 2a),
  `CURVE_DATABASE.md`. The word-recipe panel is the tuba's; nothing of it was reused but the ideas (the carrier's breath rule, the
  bend hygiene, the timeline's pinning).
- **Not yet:** the notation (phase 2a, BEATING_TOOL §10); item 8's four held things (the shuffle as a writer, cycles for section 3,
  the training material, the notation); his listening at steps 3–7.

- **The dynamics are solved for any curve-driven object (2026-09-06, PLAN 1g, RUNNING_LOG §115–120):** `score/public/velocity_remap.js` gives
  a morph event its loudness in the ensemble's one scale — `velocityFor / cc7For` per note (attacks, trills), `heldNote / cc7ForHeight`
  for a sustained sound (the velocity for the top of its curve, CC7 following the height), measured per instrument and register
  (`bank/velocity_remap.json`). The morph's pitch bend rides on top; its loudness need not be designed again.

- **The morph panel on the septet (2026-09-07 late; RUNNING_LOG §197–204):** the tuba's panel and engine kept, the working mode too
  (the word-recipe sliders, the seed, the scratch file, Save as ACTUAL); `score/public/morph_septet.js` casts three PAIRS — Vc + Va ·
  Vn1 + Vn2 · Fl + BCl by default, a seat pull-down each — onto the model's pitches, folds each pair as one unit (D26) and hands the
  engine a PALETTE per voice (the ordinary voice, the measured range, the bend reach = min(a whole tone, the sampler's measured
  range), the breath or bow ceiling); the engine keeps one key per run by the string quartet's rule and re-keys with a 5 ms overlap;
  Play and Insert take the ticked pairs of the one render; the audition and the score play each instrument through its own range and
  the remap; the META shape on the septet's META layer. The six stock models re-voiced for three pairs; other pitches by his word
  into a model or the scratch file. 38 checks: `tools/morph_septet_check.js`; the tuba's renders byte-identical without a palette
  (`tools/morph_tuba_baseline.json`). **Not for this piece:** the beating drawer's pitch side, takes, the notation (2a).

- **The pitch source (2026-09-07 late; RUNNING_LOG §205–208; CN-38):** the PITCHES row — a sonority from a pull-down (kept sets ·
  starters · the models' sets · stacks and Messiaen's modes from a typed root · the harmony list: strikes, blasts, chord shapes, the
  notes spelled) reduced to the pairs' notes by a named take rule (by register · lowest · highest · spread · consecutive from k · every
  other · random by seed), one note per pair doubled or two per pair; keep / remove by name (the takes file's `morphPitches` bucket);
  the root box is also SPECTRAL's fundamental; CONVERGE opens each note a whole tone and closes onto it. No keyboard: the note names
  are text. `bank/morph_pitches.json` holds the starters.

- **The piano's harmonics at a morph's re-breaths (2026-09-08; PLAN 1i first pass; RUNNING_LOG §217–218; CN-40):** a button on the
  panel, **♪ piano harmonics**, with a switch (sounds *at the pitch* · *an octave above*) and a level box — reads the placed morph
  under the playhead (or the selected morph shape's, or the score's only one) and writes one piano note per re-breath on the piano
  lane at the `harmonics` technique: the nearest key whose sampled octave harmonic sounds the player's pitch at that re-breath (the
  rounding is the detune he asked for, within ±25 c on the BLOOM), the coincident same-key re-breaths merged, a key beyond F5 folded
  an octave; the notes join the morph's group (they travel with its shape), carry their provenance (NAMING §2.12), are replaced by
  a re-run and undone by CTRL+Z. `score/public/piano_harmonics.js` (pure), `tools/piano_harmonics.js` (the CLI: the table, --write,
  --strip), `tools/piano_harmonics_check.js` (38 checks). **The first derived voice of a morph** — for the all-purpose tool, a morph
  could carry such rules and re-derive them when it changes. **Not yet:** the CC21 partial shift (the chain, an exact detune), the
  piano's `harmonics` loudness in the velocity remap (1g measured `main`; a harmonic at level 7 goes out at velocity ≈ 109).

- **The lines — the piano's articulation points from a morph (2026-09-08; PLAN 1j built; RUNNING_LOG §229–233; CN-43):** *lines → piano*
  on the morph panel writes, for every note of every player of the morph under the playhead, its onset (the re-breath), its peak (the
  score's dot rule) and its end as EMPTY NOTES on the piano lane — a line is an empty note: no sound note, a `cue` provenance (NAMING
  §2.13) — drawn as thin lines in the player's colour with a head by kind; the bar at the left end of the piano lane shows them by
  kind AND player (the browser's setting) and clears the unused; a click on a line opens THE PICKER CARD — the vertical keyboard with
  the ensemble's sounding pitches at that instant (a mid-glide one with its cents, the source ringed, the piano's own notes), the four
  voices, ppp … fff, the duration presets and box, ▶ in context, a key click that sets and sounds — ENTER makes the note (the same
  object, the provenance kept), a made note reopens with its values, a re-run keeps the made notes. `score/public/piano_cues.js`
  (pure) · `cue_picker.js` · the hooks in `composer.html` · the CLI `tools/piano_cues.js` · 32 checks. **For the all-purpose tool:** a
  morph exposes its event grid (onsets · peaks · ends, per voice) to any lane as lines; a pitch picker shows the context — what
  sounds at t — on its keyboard; a filter is a view, never the data. **Not yet:** the notation of a cue-born note (2a); moments from
  trills and beatings (only a morph's notes give them); the piano's `harmonics` and `muted` voices in the velocity remap (NITS §218).

## 2 · For this piece — "morph events" (CN-28 · CN-29)

His picture: **single morph events** — e.g. unison → maximum beating, "like in convergence", over a set time — then **longer
ones**; **strikes with morph chords**, "freeze frames or old time slide show" (CN-28): each strike a slide, the morph the dissolve.

**The four elements, his:** (1) **the expansion of pitch to expand beating** — the glissando apart; (2) **the re-breath / re-bow**
("rebreath, so to speak, or rebo[w]") — the re-articulation; (3) **the crescendo**; (4) **the multiple pairs** — each pair with its
own glissando / beating pattern, not all following one curve. *"So those four things, how to arrange them in short events and over
longer events."* Short events: one breath, no re-breath, the pairs' glissando patterns differing. Long events: the same elements
with re-breaths.

**Open, for the requirements talk (PLAN 1f), when reached:** how a morph event is launched from a strike (the strike's chord → the
pairs?) · which pairs (fixed by instrument, or by the chord's voicing) · the per-pair curve (drawn? the curve windows A / B / C, as
the trills read them?) · the crescendo — CC7, velocity, or the samples' own dynamics · the re-breath rule (where, how often, staggered
between pairs?) · the beating measure (Hz from the cents apart, per register) · notation.

## 3 · Log (append-only; his words verbatim, the AI's reading marked)

### 2026-09-06 — CN-29, the note that made this file

> *"A to do note for later when we get to the morph section. I'd like to... I'm going to be using the morph textures a lot in the
> future for this piece and the next piece. I'd like to eventually make it an easier to use all purpose tool. But for now and maybe
> for the next piece, will adjust it for the current use, but I want to institute a process where we're taking notes in a central
> document that will inform the eventual revision. For this one, this piece. I want to create single morph events. Like, for
> example, going from Unison to max beating, beating, like in convergence. over a certain amount of time. And then longer ones. So
> I see the elements as the expansion of pitch to expand beating, the rebreath, so to speak, or rebo. and the Crescendo So a way to
> think about these three things in the short events or also the multiple pairs. So each pair might not be following the same
> glissando or beating glissando. So those four things, how to arrange them in short events and over longer events. I'm imagining
> shorter events. It's no rebreath, just one breath, but ways to work in different patterns of glissando for different pairs. Like I
> said, this is just a note. We'll tackle this in earnest when we get to the section."*
> *(2026-09-06, session 4, mid-session; speech-to-text, content untouched — "rebo" read as "rebow")*

**AI reading (not the composer's words):** two things at once — a process (this file) and the first requirements of the morph
event: four elements (pitch expansion → beating · re-breath / re-bow · crescendo · the pairs' own curves), arranged in short events
(one breath) and long ones (with re-breaths). Nothing built; the talk comes with the section (PLAN 1f).

### 2026-09-06 — the morph section opens: "spend some good time figuring out the requirements"

> *"ready to start the morph section, /plan-item 1f First, let's spend some good time figuring out the requirements. based on the
> things I want to do and our previous work in the morph section. So I'm gonna talk through this in some detail. But first, can you
> read up on the morph section from the tuba piece? Collect that data, understand how the panel works. And if you can look at some of
> the notes when we're building the panel and later how we used it, try to read some of the Journal And then when you've collected
> enough data or when you've collected that data, check back in, and we'll talk through some of the requirements. before we even
> enumerate a plan."*
> *(2026-09-06, session 4, evening; typed)*

**AI reading (not the composer's words):** the requirements talk comes first and in his detail; the AI's reading of #4's morph
material is its data (RUNNING_LOG §145). One fact from the read bears on the revision: #4's engine has no pair — voices are
scheduled one by one and a pair's gap, the audible thing, falls out (#4 day 13, finding 3; "cycling the pair's gap as a unit"
deferred there). His fourth element makes the pair the unit.

### 2026-09-06 — CN-33: the beating pairs in section 3's strike cycles; training the performers on the full beating curve

> *"composition note for third section cycles of strikes combined with crescendos using the beating pairs and then find a way to
> train performers the full curve of the beating So they'll know that the top of the curve or what the top of the curve sounds like."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — filed as CN-33)*

**AI reading (not the composer's words):** for the tool's revision, two consequences. The beating pairs are not only the morph
section's material — section 3's strike cycles carry them under crescendos, so a morph event must be placeable inside a strike
cycle, short, repeatable. And the tool's output is the source of a performer-training material: the full curve of the beating heard
as sound (bottom, middle, top), so that the written curve has a heard target. Neither is a build now; both are requirements to carry.

### 2026-09-06 — the anatomy, the name "beating", the scenario: the atom is a pair; a beating drawer

> *"Okay. Then let's discuss an anatomy of a morph event. and maybe come up with a different name. You can give me some
> recommendations. So as far as I understand it... so, actually, let's enumerate the elements, and you can help me. Just very simply.
> So as far as I understand, there's pairs, and they create beating between them. And then the second main element is the crescendo.
> That intensifies the beating or not. And then there is the the breaths or rearticulation. There's also the curvature. how... or
> what shape do players follow? they're in their glissando, their crescendo. And there's also the overlap. Well, there's overlap
> between players. So players on the same pair. I'm not sure if they always move together. or they were on different cycles. So did
> they achieve full beating at the same time? But there's definitely different cycles between different pairs. So if you have more
> than one pair, So I wanna talk about... no. Break it down. Figure out the elements, and then talk about how we can create shorter
> events and then what the dials are within those events. Like, if I create a six or seven second event, it could be something like
> start at a certain bidding rate more or less and then not move, or it can move the whole range, or it can move just a little bit,
> etcetera. Well, let's just start there. Let's break it down by elements and talk about what it might look like to build smaller
> events, and let's narrow down the name."*
>
> *"Okay. beating is good. Let's talk through the scenario. So in composing, when I'm using the beating machine, I want to try
> different things, and the atom will be a pair of players. MDI, the Adam could have various behaviors. So I could target a beating
> level, just a single one. So I suppose a analogy could be just simple crescendo so we can have the pair come in at a certain
> volume or beating level. It just maintained that or just burst it for a small duration. think of have the long arc like we did in
> the tube a piece or they can have shorter glissandos so move from one beating level to another. So like a convergence, move from
> unison to full maximum beating, but in a short duration. And then these atoms can interact so I could have, for example, in this
> piece, three pairs, and they could all come in together at their own beating levels, or they can overlap in different ways, or
> they can reach their full beating or back to unison in different arrangements. like, some sort of counterpoint. So, like, in the
> strikes, that turned out to be a useful drawer because I could assemble these patterns and do things like shuffle and then listen
> to it run away. and then create certain patterns and then listen to to that. So can we think about what this would look like for
> a beating drawer? And in a similar way that it's facile, I don't have to turn a lot of dials, and I can do shuffles and things
> like that. But it's just figuring out what the right thing to shuffle and what the right kind of order is. So help me organize
> this. tool just but talk about the architecture and try to build it one part at a time."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "bidding rate" = beating rate, "MDI, the Adam" = the atom,
> "tube a piece" = the tuba piece)*

**AI reading (not the composer's words):** the revision's shape, said by him: the object is a **beating** (the name decided), its
atom a **pair** with a behaviour (hold · burst · bloom · close · the long arc), the atoms arranged into patterns (entries together
or overlapping, the peaks and the returns to unison in arrangements — counterpoint), assembled in a **drawer** with few dials and
shuffles, as the strikes drawer. The seven elements and the architecture put to him are in RUNNING_LOG §146. For the all-purpose
tool: the tuba's six models become patterns of this atom (BLOOM = every pair blooms, staggered), which is the inversion #4's day 13
found missing — the pair as the unit.

### 2026-09-06 — the beating panel: pairs as mirrored curves with handles on rails; the shuffle parked

> *"Okay. Then maybe I have, like, a screen, a panel, and I can see the pair represented. by some sort of curve, for example, or if
> it's just on or off, it'll look like a square wave. And then between the pair, I can slide the waves. So if I want them to not be in
> sync, I can. And one will be... it'll be bipolar. So one... if it was a sound... sign wave, one will go up, and the other will go
> down. and that's how they reach max beating. So for example, if it was like the convergence, it would be a hump up and a hump down,
> and there would be in phase reaching the peak Nadir together. But I can slide one over so that they are out of phase. They reach the
> peak at different times. and then a similar layer, which represents the crescendo. And I guess we can just use the... to draw the
> initial ones. We can use the curve tool that we... I've been using for the trills. And then I can... there's three of these, so I
> can use all three or not, three pairs. but then I can slide once I've... I have established the pairs and their configuration. I can
> slide the whole pair. And then I can audition this at any time. And then maybe we should have some preset curve so I don't have to
> draw a curve every time. but I have the option of redrawing the curve. So maybe hold on the shuffle for now. This seems to be a
> different model, but we'll bring it back in if necessary. But, for example, there'll be some efficiency if I can select curve
> shapes. So, like, if they're just coming in at one level, it'll be, like, um, a square wave, and I can just grab the top and bring
> it to a different level. And then everything could be an easy slide, like on rails, and everything should have handles. So if I want
> to grab... if I'm working with one pair, I want to grab one curve. See, the bottom one, I move it over. I could just grab a handle.
> And same with the read breaths and same with the crescendo. So something like select the part, click on a curve shape. It pops in.
> I can re... easily resize it and reshape it, and then I could slide it, like, on a rail. And this will all be in real time so I can
> just hit space bar to play that configuration. And then if I find a configuration that I like, I can audition that configuration
> over different durations. relatively quick... quickly, like, type in iteration and then that same shape, whatever configuration I
> made will play over that duration. So give me your read on this and any additional insider input that you may have."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "sign wave" = sine wave, "read breaths" = re-breaths, "type
> in iteration" = type in a duration)*

**AI reading (not the composer's words):** the interface for the all-purpose tool, in one picture: a row per pair, the pair as two
mirrored curves slid against each other (the phase inside a pair a handle, not a number), a crescendo layer and a breath layer, shapes
from a menu with handles on rails, freehand redraw with the curve tool, a whole pair slid in time, the space bar, a typed duration.
The shuffle of §146 parked, to return as a writer into the same rows. The AI's insider input (RUNNING_LOG §147): show the derived beat
rate per pair (the difference is what is heard); draw in beats per second so the register law is the tool's; both players bend by the
picture, one flat = the anchor form; the pitch and the two players per row; breaths per player; the curves live in the object, edited
on P; the duration box = the trill's live curve.

### 2026-09-06 — pitch: the strikes menu → the keyboard → a pitch per pair; the sonority between pairs; intervals inside a pair; the axis in beats per second

> *"Okay. Good. So the one thing I didn't talk so much about is pitch. So we should have some sets of pitches that are easy enough to
> choose. So maybe something like, I think, um, strikes works well, or you have the menu of strikes, the one through forty five or
> whatever. And then if I click one of those, it appears on the keyboard. And then I can assign a pitch to a pet, and then they'll
> hover around that pair... or around that pitch. So it's more the cord or minority, the cord or minority, the c h o r d or s o n o r
> i t y. is between the three pairs. So let's include the ones we did for the tuba piece. the thirds, fifths, and just Unison. But
> then the relationship... let's say the relationship could be between the three, could be fifths, could be thirds, could be
> something else. And then internally, there's Unison, but I also would like to try fourths, fifths. and see how beating sounds at
> that interval as well. and showing the beating is good. Let's try to find an elegant way to do that. Sure. The access should be
> beach per second. That's fine. And then let's discuss what insertion would look like into the main score. Okay. This sounds pretty
> clear. let me know if there's anything else to think about. And then if you could organize the top line sections for plan, and
> we'll go through them one by one. So we... first, any questions or any additional things. The next, let me see the plan top line in
> order, and then we'll investigate them one by one."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "a pet" = a pair; "the access should be beach per second" =
> the axis should be beats per second)*

**AI reading (not the composer's words):** two decisions and a model. The axis is beats per second (the tool converts). The pitch
model: the strikes menu feeds the keyboard, a centre pitch per pair, the sonority between the pairs (unison, thirds, fifths, other),
the interval inside a pair (unison, fourths, fifths, thirds to try). For the all-purpose tool: a pair's interval is a parameter, and
the beating at an interval is between coincident partials (3× / 4× / 5× the unison's rate per cent at the fifth / fourth / major
third, fainter, timbre-dependent) — the arithmetic and the insertion picture are in RUNNING_LOG §148.

### 2026-09-06 — the pitch set holds the strikes' chords; the piano out of the beating; step 1 opens

> *"In the pitch set, let's include the forty five or forty six play courts for the strikes. In addition to those other
> similarities. sonorities; So the piano probably won't be used in the beating. I'll use it in the main score in other ways. And then
> good for step one."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "play courts" = played chords, "similarities" = sonorities)*

**AI reading (not the composer's words):** the pitch set = the strikes' played chords (the bank) + the relations; the piano is out
of the beating altogether (no anchor role), which leaves six players → up to three pairs; the top line of RUNNING_LOG §148 stands
and phase 3 begins at step 1, the palette.

### 2026-09-06 — the bend: as the string quartet did it; a real player's range, within a semitone

> *"So we did string probes for the string quartet, or we figured out how to use pitch bend and to reset it, etcetera. So if you
> could look there and figure out how we did pitch bend there. And then I imagine it's the same with UVI, but we should figure that
> out and then just use the realistic range for a real player. So it's embrachure bend, really. but we don't need much movement to...
> for the beating. usually within semitone at the most. then 1 good"*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched)*

**AI reading (not the composer's words):** for the all-purpose tool, the bend range is two numbers per instrument — the sampler's
(measured by a probe; #1's Xsample ran at ±1 semitone, #4's UVI at ±2) and the player's (his rule: within a semitone, the winds by
embouchure) — and the tool's ceiling is in beats per second with the cents shown. #1's convention (bend before the note-on, centre
after the note-off, re-key past the range) is the one to keep. RUNNING_LOG §150.

### 2026-09-06 — the breaths: single events on one bow; long events with the dotted go lines on sliders, a maximum-length warning, continuous or designated, a shuffle for the breaths

> *"So there'll be single events. We talked just on one bow or breath. There'll also be potentially longer events. And in that,
> let's bring in the indicator from the tuba piece. This was just the dotted go line, and then those should be on sliders two where
> we can just move when the breath happens. And there should be some sort of warning or indicator or something so we understand
> maximum breath length or bone length. So we can indicate continuous and just let the performer rebo when they will, or we can also
> designate when the bows should change, and those would be the dotted line. Oh, and this would be an opportunity for the shuffle.
> So I'm not sure how we determined read breaths and stagger in the tuba piece, but have something similar. So I don't have to
> actually place each breath, but I can have a shuffle where the breaths are staggered and the appropriate length, same with the
> bows. Otherwise, good to go."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "bone length" = bow length, "rebo" = re-bow, "read
> breaths" = re-breaths)*

**AI reading (not the composer's words):** the breath layer of the all-purpose tool: three modes per player (one breath ·
continuous, re-bow at will · designated, the marks as dotted go lines on sliders), a ceiling per instrument with a warning, and a
seeded shuffle that deals staggered breaths of the right length — the tuba carrier's rule (RUNNING_LOG §152) made visible and
movable. The shuffle returns here first, for the breaths, before any deal of pairs.

### 2026-09-06 — the beating out of the strike chain: its own thing

> *"Let's actually keep the beating out of the strike chain so unlike the trails. Trellis we'll just add accents manually, but it
> doesn't have to do things like avoid overlaps and gray out notes. I'll just... it'll just be its own thing."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "trails", "Trellis" = trills)*

**AI reading (not the composer's words):** a boundary for the all-purpose tool: the beating does not chain to the strikes as the
trill does (no mute rule, no eating, no exit at the next strike, no overlap avoidance); it is placed at the playhead and lives as
its own group; the accents are the composer's, by hand. The tool stays simple and general; the piece-specific links are left out
rather than adjusted. RUNNING_LOG §160.


### 2026-09-07 — the panel full page, the fonts up (his first remarks after the build)

> *"where is the panel?"* — then — *"lets make the panel full page like strikes and increase all fonts  if 12 then 14 if 14=18 10=12"*
> *(2026-09-07, morning, his check-in after the overnight build; typed)*

**AI reading (not the composer's words):** two things for the all-purpose tool. (1) A floating box at the top right was not found —
the working panels of this stack are full-width drawers from the bottom (the strikes drawer), and the composer expects the beating
panel where the strikes are; the panel becomes a full-page drawer with the same half / full toggle and a bottom tab. (2) The
fonts: his mapping 10 → 12, 12 → 14, 14 → 18 (the panel used 8–11 px; applied as 8 → 10, 9 → 11, 10 → 12, 11 → 13) — a readability
floor for every panel of the tool, with the row drawings widened to the page. RUNNING_LOG §175.

### 2026-09-07 — a trapped note

> *"midi note trapped won't stop playing"* *(2026-09-07, morning, testing the beating on his server; typed)*

**AI reading (not the composer's words):** the first long notes through the scheduled-ahead path: a stop cancelled their pending
note-offs (`clear()`), and the all-notes-off after it is ignored by the Xsample instruments. Fixed for every long note (remembered
and released on stop) and a ■ Panic button added; `probes/panic.ps1` for the rack alone. For the all-purpose tool: a sustained note
must always have its own release path — never rely on CC123. RUNNING_LOG §176. *Then* — *"i still have a trapped viola note
playing"* (§178): any audition's stop clears the same shared queue; so a long note's release is never queued ahead at all — the tick
sends it when due, an audition from a timer. The rule for the tool: **never queue a long note's release; send it when it is due,
from a tick or a timer, and keep a registry a stop can drain.**

### 2026-09-07 — the harmonies on the left, in banners; hear the chord on the piano; assign a note to a pair by hand

> *"For the beating drawer. I would like the harmonies in this format on the left. and I want forty six strikes in its own banner in
> the same scroll menu but its own banner that I can collapse. And then I'd like the blasts from the tube a piece in its own banner,
> and I'd like the chord shapes from the two piano, two percussion piece. in its own banner. And same functionality. I click it. I see
> the layout on the keyboard. be able to hear just the chord.  use the piano voice for play back of just the harmony there won't be
> any assignment with the dotted lines to instruments. Instead, I'll be able to assign any note in that harmony to a beating pair. and
> I'll do that manually using the same facility we have now in strikes. So I'll double click a note on the keyboard and then click  a
> node connected to a pair. And then this selection, just like with the strikes, the harmony selection and the assignment will save
> with the take."* *(2026-09-07, morning; typed — "the tube a piece" = the tuba piece; with screenshots of the strikes drawer; CN-36)*

**AI reading (not the composer's words):** the strikes drawer's left column is the model for every pitch source — a scroll list in
collapsible banners, one per collection; a click = the chord on the keyboard; ▶ = the chord alone on a neutral voice (the piano);
the assignment by hand, a note armed then dropped on a pair's node; the choice and the assignment inside the take. For the
all-purpose tool: the pitch side is a harmony BROWSER over every collection (CN-35's module), the assignment the tool's own. The
blasts and the chord shapes scraped from the earlier pieces for it (`bank/harmonies.json`). RUNNING_LOG §177.

### 2026-09-07 — the voicings, the octave box and range, the assignment lines, the range columns, the pair's range check (a discussion asked for)

> *"Can I have a version of the chord voicing options from the strikes drawer in the beating drawer: I want all the button options -
> original , spread out, cluster..., and I would like the octave number box to move the sonority to a different octave ,  I with also,
> like, an octave range. So the octave box transposes or moves the sonority up or down an octave. But then I'd like to be able to say
> the range would include one octave below or two octaves above or one octave below to one octave above. And then any reshuffling
> would include the octave in the octave box. So whatever octave I've chosen the sonority to be in originally plus whatever I say on
> the octave range. So if it's one octave low, one octave above, it could scatter between those three octaves. Then could I have the
> same seeded reshuffle voicing button. Also, I would like the keyboard-note-to-instrument assignment UI functionality/look-feel from
> the strikes drawer. So this is... I would double click a note on the keyboard and then click the pair node, and then I would see a
> line, dotted line drawn to that Node from the keyboard key. That means that pitch is assigned to that node. Then an additional
> visual on the keyboard. Show instrument ranges b. displaying columns on the keyboard. These could just be different colored lines
> showing me the ordinary range of the instruments in this piece, each in its own column on the keyboard. There's room to the left
> of the circle note indicators. Next let's come up with a better system for the range check on the beating pair. So there currently
> are pull downs for choosing the instruments for the pair. but they are self limiting. let's not have any checks in the menus
> themselves. So if I assign a note that one of the instruments can't play, currently they don't show up in the menu. Let's just have
> both menus display all the instruments available. and then let's do something like what is in the strikes drawer. see the image.
> once I assign a pitch to that pair or I choose an instrument in one of those pairs or one of the instruments in the pair, I get a
> reassignment indicator with the arrow just like in the strikes drawer. So if I assign f six to the base clarinet, it will show me
> the actual pitch it's using, like c5,  and then the downward arrow. And let's talk about this a bit first to figure this out because
> both pitches in the pair should be in the same octave for the beating. Usually, unison, and then sometimes if it's fifths  or 1
> octave apart, the beating pair should be max 1 octave apart. So let's figure out how to manage this in a similar way to the strikes.
> So I guess the scenarios are if one of the pair need to transpose to a pitch, and then if the other instrument of the pair can't hit
> that pitch. We have to figure a way to resolve that conflict I guess the octive transposition for the note from the original
> sonority should be one both of that pair can reach and then the instrument selection boxes for each instrument in that pair should
> have something like the strikes with the actual assigned pitch and the respective down or up arrow depending on which direction the
> note had to be transposed for that instrument. And then just a way to resolve if there's a pitch that only one instrument can reach.
> So let me hear your suggestions about that and discuss before making changes. please."*
> *(2026-09-07, late morning; typed, with three screenshots of the strikes drawer — the voicing buttons, the keyboard, the lines and
> the ↑ fold mark on Violin 1's E4)*

**AI reading (not the composer's words):** six asks, one to discuss first. (1) the strikes drawer's voicing buttons in the beating
drawer; (2) the octave box moves the whole sonority; an octave RANGE (below / above the box's octave) bounds where a reshuffle may
scatter each note; the seeded reshuffle button; (3) the assignment's look: double-click a key, click the pair's node, a dotted line
from the key to the node; (4) the players' ordinary ranges as coloured columns on the keyboard, left of the dots; (5) the pair's
player menus not self-limiting — every player listed, the actual pitch with a ↑ / ↓ fold mark shown afterwards, as the drawer does;
(6) to discuss: the pair's note must land in ONE octave for both players (unison usually; a fifth or an octave at most) — how to fold
and how to resolve a note only one of the pair can reach. Planning method, phase 1 (RUNNING_LOG §179).

### 2026-09-07 — the pair's range decided and the six asks built (RUNNING_LOG §180–181)

> *"Q1 yes, Q2 b, Q3 yes, Q4 a; and no need for the entire plan regime if this is clear what needs to be done. You can go ahead."*
> *(2026-09-07, early afternoon; his answers to the four questions of §179)*

**AI reading (not the composer's words):** at most an octave apart is the rule (the chips end at the octave); when no octave serves,
the tool offers and never applies; a pair follows its sonority note through voicings and octave moves; a tie folds down. Built as
`BEATING_TOOL.md` §12: the voicing bar (the strikes drawer's presets, the octave box, the octave range as the scatter window, the seeded
reshuffle with chips), the pair's fold as one unit with the ↑ / ↓ marks on both seats, the ladder of offers, every player in the
menus, the dotted lines from key to node, the players' ranges as columns, skip. **For the all-purpose tool:** the fold of a PAIR (not
of a note) and the offer-never-apply ladder are the two ideas worth keeping; the voicing engine is now a pure function shared by
name with the strikes drawer's presets — the harmony module (CN-35) should take it from `beating_calc.js` rather than copy it again.

### 2026-09-07 — his first hour with the drawer: the sequence, SPACE, the level scale, the slopes, a stutter, the level box, pair takes, the pointer, a sequence organizer — and a call for a different way of working

> *"should be duration per pair and audition per pair; So a length for the entire sequence and a play for the entire sequence. And there
> should be a way to move the spacebar. So somehow I listen to the entire sequence with space. And, otherwise, if I'm working with a
> pair, I just listen to the pair with space. And if I'm in the chord shapes, I just listen to the chord with space. Then for each pair,
> there should be a length, a duration, and then the play for just that pair.*
> *The num boxes are trapping space.*
> *what is the 0-1 volume scale? what is it based on db, velocity?*
> *Could I get the curve adjusting features like curves in main score. use mouse to change slope, like in logic pro, already implemented
> in main score*
> *in bigger intervals something in playback studders either flute or bcl, could it be the playback on animation clock like before? or
> something to do with the way pitch bend is implemented. sounds like bcl, check carefully in string quartet, we had it smooth there and
> the ai looked there for this build, but it sounds like it is implemented incorrectly.*
> *when I change the duration the pair. It snaps back to the original shape. Can I have the new beating level keep the custom shape and
> just change the duration?*
> *a save for individual pairs settings.*
> *hand mouse pointer for assigning a keyboard pitch to a pair. No good. Can we get something with a point so I can know which key I'm
> double clicking and... or dragging?*
> *I would like a sequence organizer. So, like, not too different than the way we're managing the trills in the main score . So let's just
> keep the pair panels for now. But then below everything or above , there is a track for every pair that I made. So two pairs gets two
> tracks, etcetera. And then pairs represented by zones, I can drag them like I can the trill zones. and they will maintain the pair shapes
> and settings dynamically in real time just like the trill zones refer to the curve. And if I change the curve the trill zone updates, and
> then I could shift those zones in the track so I create a different time relationship between the different pairs. And then I could
> extend the zones or shrink them in the zone tracks and change the duration dynamically of the pairs in the pair maker.*
> *go ahead and make these changes, but then afterwards, can we have a discussion about how to proceed? I wanted to avoid this sort of
> little detail by little detail troubleshooting. I don't wanna get bogged down in it. So maybe you can recommend some strategies. somehow
> there were some overall conceptual misses in the plan. maybe we trace what I actually want to do or how I like to work or something, not
> too onerous, but a straightforward plan that will get this panel working quickly so I can get back to composing and hearing things. make
> the changes above first. and put it in to the drawer so I can start using it, And then let's see if we can do a reorg that will sweep up
> any blockers and individual details. in one go"*
> *(2026-09-07, afternoon; typed, with a screenshot of pair 1 — Flute + Bass Cl. on D4, a hump to 7/s; the whole message in RUNNING_LOG
> §182 with what was found and built)*

**AI reading (not the composer's words):** nine asks and one process point. (1) a length and a play per pair, a length and a play for the
sequence, SPACE following where he works (the sequence · the pair · the chord); (2) the number boxes must not trap SPACE; (3) what the
0–1 level is; (4) the score's slope handles on the panel's curves; (5) a stutter heard on the bass clarinet at "bigger intervals" —
suspected the animation clock or the bend; (6) the level box popping a preset over a custom shape (the "duration snaps back" — it was the
LEVEL box: it re-popped the preset, a burst for a drawn shape); (7) pair takes; (8) a crosshair instead of the hand; (9) a track per pair
with the pair as a zone, dragged and stretched like the trill zones, the pair maker following live. **The process point:** the plan had
"overall conceptual misses" — the drawer was built to the requirements talk but not to how he works; he wants strategies, not
detail-by-detail troubleshooting. **For the all-purpose tool:** the sequence strip is the third time this family of tools has grown a
timeline inside a panel (the strikes' rhythm lane, the trills' zones, now the pairs' tracks) — the revision should have ONE timeline
widget; and "what SPACE plays follows the focus" is a rule every panel should share.

### 2026-09-07 — the workflow walk-through (strategy A): how he wants to work with the drawer, first click to the pair in the score

> *"ok lets do A, b into how we work, lets hold on c, it might emerge organically as I build the first beating sequence; First, I'll
> choose the overall harmony for the entire sequence. In this case, for example, I pulled up a number of cord shapes. and then played
> them to listen to what the harmony sounds like. So that part works pretty good except for the space bar playback. I click on a cord in
> the menu. Press space, listen to it. Visually see it on the keyboard. If I find one I like, then I could look and see where the ranges
> fall out. So either reshuffle or change the octave so that it fits into the ranges of the instruments I wanna use. I might try a shuffle
> and play to hear how it sounds in different voicings. then that's settled, and I know which pitches I'll use or which base pitches I'll
> use for the sequence, the beating sequence. Then I start working with a pair. I'll want to choose the instruments. So I'll probably want
> to listen to them. So I choose an initial set of instruments, and then maybe there's a default curve inside already. So I can just
> listen to them, see if they're the right instruments. Something like a... eight or nine second ramp or hump that holds at max speeding
> for a few seconds. and then comes back down. Can I choose my instruments, and then I look at the range? And if they're not fitting in
> the range or if I don't like the way they've been transposed, I can reassign a different note from the cord I chose to that pair. or
> leave it. with its initial choice. Actually, I haven't assigned yet. So I'm going to... before I choose my instruments, I'll assign a
> pitch, then I'll do the listening selection. I might change the instruments, might reassign the pitch. and I wanna hear it in context.
> so the the default. with at least a few seconds at max so I can hear what max beating sounds like. then I'll want to... once that's
> chosen, I'll want to establish what the maximum beating is. So maybe a quick number box. Let's relabel it too because forward slash s,
> it's near something else that has seconds as well. So that's confusing. Maybe HC for herbs. H e r t z. H z. then I dial it up or spin it
> up or spin it down or type in a number, and I can listen to a passage of max beating. So I establish that. Then the curve. I found the
> curve in the current drawer a little bit hard to work with. I think the idea of preset shapes is good, but I think it'll probably be too
> difficult to predict exactly what shapes I'll want to work with. So maybe the first few are custom, but then I can store those as preset
> shapes. I was for... so we have a scenario to work with. I was trying a burst shape, and I found that it didn't hold long enough at the
> peak. And then I had to adjust the max peak, but in this narration, it was already done. We've already established that. So it's just
> the three factors. I... want to see how... I want to adjust how quick it bursts to max, and that'll probably be somewhat instrument
> dependent. So I'll wanna listen to it with each adjustment. then there's the hold... how long it holds at peak, and then there's the...
> so this is, I guess, pretty classic ADSR. There's the decay to nothing, to end of pair. But, for example, I couldn't drag the final
> node. That would have been intuitive to change the duration visually. and then I had to add points. and I don't wanna spend too much
> time on the controls, but the turn on the draw button and the click off the draw button is a little bit awkward. Again, I don't wanna
> spend too much time getting a strike because I'm not sure what would work better. So we can keep it for now or if you have a quick,
> easy alternative. So getting the ADSR right, the duration of the curve right, but also being able to change the maximum easily. And then
> what I couldn't do there was change the ramps of the individual curves. So if I wanted the attack to have a different curve shape, I
> wanna be able to do that. Then once I get a burst shape that I like, I can store it. Then I'll attend to the volume and the crescendo. I
> haven't got that far to play with it. But similar to the glissando, I'll want fairly easy controls for the curve, ways to adjust the
> maximum quickly. If I want to draw in peaks and values for individual players, I can. And then I can shift the points together. So if
> it's just a classic hump, I guess, It wasn't. There was no plateau, so it was hard to or wasn't hard, but it wasn't intuitive how to
> have a plateau and then move that plateau around. But that's probably what I'll want to do. Have a timing of when an individual player
> reaches max, volume, And then be able to shift it around so maybe they reach max at different times or there's several humps, and then
> I can control how long they stay in max or admin or somewhere in between. Also, the volume wasn't that intuitive, zero to one, and it
> didn't quite sound like the tube a piece. The quiet wasn't quite enough. Ultimately, it will be a scale from PPP to FFF, so we should be
> able to extract that from this. But for playback, which isn't a priority, but it would be nice to get a good playback. should go
> from... I don't know what we're using for adjustment cc7 or velocity, but should go from quite quiet to max also based on the volume
> tests we did per instrument And then the breaths is pretty straightforward. I think all the warnings and whatnot are throwing me off.
> Maybe there's just a simple indicator in the crescendo part that shows me ideally a breath length. So if I have a twenty second pair,
> there'll just be some markers at whatever, eleven seconds or whatever is the optimal max duration. And then I can just click to have a
> read breath mark, which is just a simple dotted line, which should be distinguished from the ideal max breath indicator, and then I can
> just grab it and slide it if I want. Also have a simple randomizer for the whole pair where it can slot in breaths. And maybe just two
> choices, random and unison breaths. And I can save that pair construction. it probably should have already been in the sequence
> timeline as a zone already, maybe when I create the pair. And those should be dynamically linked. So then I see it in the timeline, and
> that timeline could have a independent duration. that I go ahead and make the additional pairs moving forward same same way. And then I
> see... let's say there's three pairs. I see the three zones in the sequence, the timeline. then I can drag those around. I can drag one
> of the n's to change duration, and that will update automatically the individual pair builder or vice versa. I can make changes in the
> pair builder and I would see changes in the zone or they would change. and I can playback the zone. And at any point, I can make easy
> adjustments for any stage. So, for example, this point, I decide I want a different harmony. So I choose another harmony from the list
> of cords, and I reshuffle, etcetera, do all that. And maybe there's an initial assignment automatic, but then, of course, I can change
> those assignments. And then an easy way to revert back to the original choice. then save as a combined sequence take. and the various
> options for insertion. I think in this case is probably just insert at cursor. I can't think of other ones that might be useful here.
> Let me know if there's any other scenarios I might have also considered, and I can try thinking about it and narrating through it here.
> are not alternate scenarios, but within my narration scenario, things I'm... parts I missed. potentially."*
> *(2026-09-07, late afternoon; typed)*

**AI reading (not the composer's words):** the decisions — A (this walk-through, one sweep), B into HOW_WE_WORK (the panel borrows the
score's idiom), C held. The narration written back as a script of 23 lines, each marked works / awkward / missing, in RUNNING_LOG §183;
the misses become the one sweep. What it says about the tool beyond the lines: he builds a pair as an instrument — assign the note,
choose the players by ear, set the maximum, then shape — so the birth default must already SOUND (a held maximum for a few seconds),
the maximum must be one box with its own audition, and the shape is ADSR before it is anything else. For the all-purpose tool: the
shape library should be his, saved from what he draws, not a menu guessed in advance.

### 2026-09-07 — his refinements to the script, and "go ahead"

> *"Sweep: a new pair is born empty, saying "assign a note". A new pair is born. Node disconnected. I double click on the keyboard key
> with a circle on it, one of the harmonies pitches. There's some sort of visual indicator that that's selected and ready to be
> assigned. and then click on the note. Pitch gets assigned. And also the big hand in the previous version. I can't see what I'm
> clicking on. So something with a pointer. And you can just get rid of the drag behavior. I'll just stick with double clicking and then
> clicking on the node. And then I can just use the pull downs to assign pitch one and pitch two or player one and player two
> instruments. And then we already discussed the transposition behavior and the indicators. But this all happens dynamically? So if I
> switch harmony, There's an auto assigned, but I can change it. And the transposition per instrument rejiggers.*
> *Different ramp shape per segment. Works now, the diamonds. no see main score curve lanes for trills, works like logic pro or daw,
> hover over curve line vert dlb arrow mouse, drag up.down, left/right to control curve amount and hump location (i think, howver daws
> work)*
> *Sweep: the lane reads ppp to fff, and the beating runs the whole measured scale. Also, make sure we're getting the already
> calibrated volumes per instrument. A through d, good. I'll have to play with d to get more specific. But I guess just make sure the
> active management is working here. So if I change it to a fifth and that pushes one of the players out of range, that it gets
> dropped, uh, octave or popped up, uh, noctive. fourths and fifths can be considered the same. then, if necessary, check-in with any
> additional clarifications. Otherwise, go ahead."*
> *(2026-09-07, late afternoon; typed)*

**AI reading (not the composer's words):** the diamonds were my invention where the score already had a gesture — hold the line —
exactly the miss rule B names; taken out, the line's gestures put in. "Fourths and fifths can be considered the same" is a rule about
the pair's identity: the two pitch classes, not the direction — the fold may turn the one into the other. Built as RUNNING_LOG §184,
BEATING_TOOL §14.

### 2026-09-07, evening — his first test of the sweep: the bend, the end handle, the hold shape's seconds

> *"shift + move node to clamp; the curve bend isnt working that great, different way to move the segment and I believe you need 2
> degrees of freedom to achieve the proper bend, whatever way it works for trill curves in the individual curve tracks in the main
> score; drag end point not working cant change duration; I want it to have short attack and short release, and medium sustain, the
> shape isn't changing if I adjust the len number"* · *"image for my reference so I can remember my settings so far"*
> *(2026-09-07, evening; typed, with two screenshots — his settings in RUNNING_LOG §185)*

**AI reading (not the composer's words):** three misses of the same kind — I reinvented what the score already had (a slope where the
score has a grab-and-pull control point), and I kept a design rule (curves over normalised time) past the point where his shape
needed seconds. Rule B again, and a corollary for the all-purpose tool: **an envelope's attack and release are seconds, its sustain is
what the length leaves** — the ADSR is the natural unit of a held gesture, and a tool that stretches it with the duration is wrong.
Fixed as §185.

### 2026-09-07, late evening — the end dot

> *"I'm meant to be able to move the final dot at the right horizontally. Correct? Alright. Am I missing something? I still can't move
> it. It doesn't shift horizontally."* *(typed, with two screenshots)*

**AI reading (not the composer's words):** the drag worked and the dot did not move — because the lanes drew the pair over the whole
width. The design rule "curves over normalised time" was invisible to him and wrong for his hands: **a lane is a piece of time**, the
gesture ends where it ends, the rest is empty. Fixed as RUNNING_LOG §186. For the all-purpose tool: every lane on a real time axis,
shared with the timeline.

### 2026-09-07, late evening — "I can't get the visual to look like the sound"

> *"I think the problem is I can't get the visual to look like the sound. Something to do with the length, number box, and the visual of
> the pair curve. So I wanted a short ramp up about a double the length sustained and then an equal short ramp down, a tach ramp down.
> And no matter how I tried to manipulate the image, it doesn't correspond with the sound. I seem to be guessing. where the image should
> feel intuitive. So I don't know if we need a absolute scale and, uh, sorry, horizontal scale and then just a Zoom. Maybe maybe that. Or
> if you have another suggestion. then: way to type in node amplitude, dbl-click or shift click or something? need undo;"* *(typed)*

**AI reading (not the composer's words):** the deepest remark of the day. A rate curve is not a picture of what is heard: a beating
near zero is inaudible as a rate, and the ear counts beats. **For the all-purpose tool:** the lane should show the beats (the marks)
as well as the rate; the envelope should be typed in seconds; every node should take a typed value; one time scale for every lane
with a zoom; and undo must answer from anywhere while the tool is open. Done as RUNNING_LOG §187.

### 2026-09-07, night — "this working process is not working"; the region model

> *"Okay. First of all, this working process is not working. I've already spent several hours trying to get this one thing right. So we
> need to figure out a way to cut to the chase and get these small issues sorted out. Too much time on things that aren't that
> consequential and should be easy enough to figure out and solve. Secondly, give me a concrete proposal for the pair visual and pair
> audio. Let's go with something like just what you've seen a doll. So a region. And then we just have to reconcile the window length
> and how to potentially change the window length or maybe a Zoom, like I said, and the region within, which is the pair curve length.
> But if I'm looking at a... a curve pair, and it lasts six seconds. and I have the attack for one third, sustained for one third, and
> release for one third. I wanna be able to drag the right end, make the duration four seconds, keep the proportions of the curve, but
> the entire shape, the region will look two seconds shorter. And then I want to be able to drag the points inside. Let's say I drag the
> attack to halfway, then that now lasts two seconds, etcetera. And then I need a Zoom just like in the main score. Alt. horizontal
> scroll and then the double click on the nodes isn't working. Don't we already have double click for adding a node or something like
> that? please be more thorough and sort this out. So we don't have to iterate many times. We have to use shift click. I think alt click
> is taken, but I don't have in my memory what things are taken. But I just wanna click on a note or shift click on a note and then type
> in a value."*
> *"I'm sorry. I think I misspoke about change of size. All the points should be independent on the timeline. So if I... if it's six
> seconds and I move the endpoint to four seconds, the curve notes stay where they are in their timeline. Same with the front point. I
> think that's the main thing that's going wrong. If I move the front point forward, nothing else changes. Everything stays anchored to
> their time in the timeline."* *(typed)*

**AI reading (not the composer's words):** the tool's second model in a day — and the right one: **a lane is the timeline; a region is a
cut of it; nodes belong to the timeline, not to the region.** The hours went on the wrong model (normalised curves) dressed in one
gesture after another. For the all-purpose tool this is the founding rule of every lane. The process point is in HOW_WE_WORK and
RUNNING_LOG §188.

### 2026-09-07, night — the zoom, and the column that jumped

> *"zoom scroll too sensitive; and zoom center point should be at mouse, I now have to zoom and scroll; if I enter a number in pair 2
> and hit enter , actually any change, even scroll auto scrolls up to pair 1; save these all as feature requests and we'll update them at
> a later time. but fix the auto scroll now, impossible to work with it"* *(typed, with a screenshot of the hold shape with its beats)*

**AI reading (not the composer's words):** the jump was every render rebuilding the rows column and losing its scroll — fixed at once
(RUNNING_LOG §189); the two zoom points are in NITS as feature requests at his word. For the all-purpose tool: a re-render must never
move what he is looking at.

### 2026-09-07, night — "zoom func for sequence, save all unless I say otherwise pls"

**AI reading (not the composer's words):** a zoom for the strip (NITS); and the standing rule — his remarks are saved as feature
requests by default, built only at his word (HOW_WE_WORK, RUNNING_LOG §190).

### 2026-09-07, night — the curves' controls, his expected behaviours (for later)

> *"visual controls for Her curves still not working. So I'll just give a list of things, behaviors I expect, and then we can work it out
> later. So I want when I shrink... I guess I'd need to unify The endpoint movement. So forgive about the vertical lines. Let's just have
> the endpoints control the duration. And if I move the first point, it moves the first node, the end of the attack and the beginning of
> the decay. And the endpoint on the right moves the second node with it. the beginning of the release. and the endpoint or the end of
> the release. And the sequence, the... moving the zone does the same thing. It acts as moving the endpoint."* *(typed)*

**AI reading (not the composer's words):** the third model in a day, and it reconciles the other two: the region's ends ARE the curve's
endpoints; the attack and the release are attached to them (they keep their seconds when an end moves — §185's rule, at the ends
only); the nodes between are free on the timeline (§188's rule, inside). Saved (NITS, RUNNING_LOG §193), to be agreed in one line
and built in one pass when he says so.

### 2026-09-07, late — "Just keep collecting the feature requests. We'll have a a rebuild session later"

> *"Just keep collecting the feature requests. We'll have a a rebuild session later. And in the strikes drawer, is there a way to just
> insert part of the strike? So if I just want to insert the portions of the strike for, say, two instruments and then explain to me
> how the dynamic works. If I wanted it quieter, do I have to do it per instrument or Do I just use the d y n times? How do... how
> should I do it? and how... what corresponds to the scale, PPP to FFF."* *(2026-09-07, late, after the clear; typed, with two
> screenshots of the strikes drawer)*

**AI reading (not the composer's words):** the endpoint model (§193) and everything after it wait for a REBUILD SESSION — the revision
event this file exists for; until then every remark is collected (NITS, and his words here), nothing built. The strikes questions,
answered from the code (RUNNING_LOG §196), show two loudness models living in one app: the strikes drawer scales PLAYED velocities
with one multiplier and plays them raw (no remap — the strikes are "as played", D23); the beating drawer's crescendo is ppp … fff by
height through the measured remap; and the strikes drawer has no per-player dynamic at all. **For the all-purpose tool:** one dynamic
scale for every panel — ppp … fff per player, rendered through the remap — with a dynamic per row, and a partial insert (solo) that
can be stacked with another at the same time.

### 2026-09-07, late — "lets go back to the morph panel": the morph tool for the septet — six players, three pairs, re-orchestrable, the fold, a pair or any combination inserted

> *"lets go back to the morph panel, can you adapt it for the current instrumentation, -piano, And then I'll create the morphs. with
> three pairs. the two violins, cello and viola, and flute and base clarinet by default. But they'd be able to reorchestrate the pairs.
> So in other words, I'll listen and create a morph with those defaults and then be able to save it and then be able to rearrange the
> orchestration of those three pairs. And then I'll need that facility from the beating drawer that will change the octaves of notes
> that are out of range for any of those instruments. And then I want a facility to insert just a single pair or any combination of
> those three pairs as well. no need to go through the whole plan protocol, but investigate first and collect the data, and then
> check-in and tell me what you think you need to do. And what the results will be? before doing it."*
> *(2026-09-07, late, after the clear; typed)*

**AI reading (not the composer's words):** the tuba's morph tool comes to the septet not as a port but as a RE-ORCHESTRATION: the
sound engine (the models, the carrier of breaths, the dynamics layer) is kept, and the pair becomes the orchestration unit — two
seats, one note, the fold — which is the beating drawer's row. Three things the tuba never had are asked in one breath: the players
chosen in the panel (FR-5), a saved morph re-orchestrated after the fact (an ACTUAL cannot be; a take of the params can), and a
partial insert. **For the all-purpose tool:** one pair-row widget (seats · note · fold · ladder · insert tick) serving every pair-based
sound — a beating, a morph pair; one harmony browser (CN-35); one takes model (params, never frozen renders); and the palette
(voice, range, bend reach, breath) supplied per player to a pure engine — the tuba's constants as the example, not the rule. The
data and the proposal in RUNNING_LOG §197.

### 2026-09-07, late — "keep it simple for now": the beating drawer left as it is; the morph panel the tuba way, two changes

> *"No. I think I want to keep it simple for now. The beating drawer has a lot of features, and I wanna leave it as is. I wasn't quite
> getting what I wanted, but I might revisit it later. For this piece, I basically just want to use the morph panel in a very similar
> way to the way I used it for the tube a piece, to be able to generate a whole sequence using those value based sliders. But then I
> want to have two changes one is I want to not use tubas, but these instruments for my septet. And then I want to maybe break the the
> texture, the ensemble texture up into their individual pairs in case I wanted to just insert one pair part of the ensemble or a
> second pair part of the ensemble. But, basically, I want to try the same way I did with the tube a piece to use the morph panel and
> generate an entire ensemble sequence with everything in place such as crescendos, crescendos, red breaths, just like I did with the
> tuber piece. talk to me about how this might look."* *(2026-09-07, late; typed — "red breaths" = re-breaths)*

**AI reading (not the composer's words):** the verdict on the beating drawer after one day: many features, and *"I wasn't quite
getting what I wanted"* — parked, not rejected. What he reaches for instead is the tuba panel's working mode: a few word-based
sliders, a seed, speech to the AI for everything else, and an ensemble sequence generated whole with its crescendos and re-breaths.
**For the all-purpose tool, the lesson of the day:** the number of controls is not the measure; a tool he can drive by ear with five
sliders beat a tool with every gesture built, because it answered *"generate the whole thing, let me listen"*. The two changes that
carry the septet — the players and their palette under the hood, the texture split into pairs at insert — are the tool's, not the
composer's, to know about. RUNNING_LOG §198.

### 2026-09-07, late — the voices, the swap among the pairs, the octave displacement, the whole tone

> *"Okay. Ordinary voice and or Sensa vibrato. for the voices. And then I want to add the ability to swap out instruments among the
> pairs. So you have the default pairing above. But if I wanted to change, for example, Trello and base clarinet. and then talk about
> the active displacement as well. For the glissando, I believe, uh, whole tone falls well within the range for a... any player of any
> of those instruments to reach with their ambrosure. So I think it's fine. I'm not sure if I'm answering the question, though. Anyways,
> react to this, and let's discuss some more."* *(2026-09-07, late; typed — "Sensa vibrato" = senza vibrato, "Trello" = cello, "active
> displacement" = octave displacement, "ambrosure" = embouchure)*

**AI reading (not the composer's words):** the "simple" morph panel grows its first two controls of the day beyond the tuba's — a seat
pull-down per pair (the cast), and a fold when the cast no longer fits the model's voicing — the same two ideas the beating drawer
carries (the seats and the pair's fold as a unit, §180), asked for again the moment the pairs became real. **For the all-purpose
tool:** the cast and the fold belong to the pair widget, whatever engine sits behind it; and the player's bend limit is a per-TOOL
number, not a per-instrument one — a semitone for a beating pair, a whole tone for a morph glissando, both his by ear. The sampler's
seam on a whole tone is a mock-up fact, not a notation fact. RUNNING_LOG §199.

### 2026-09-07, late — the scratch file, the tuba's pitches, the fold (a), the quartet's glissando method

> *"and what is this?: New pitch sets the tuba way: you say the words, I write the scratch variant, the panel picks it up, you listen.
> and how did the original morph choose the pitches? a for the octive displacement; for the sampler gliss, I think we worked it out for
> the string quartet piece, and I thought the AI who built the beating drawer also picked up on this. I think what we did was we pitch
> bent a note all the way in one direction, the opposite direction of where it needed to go. So, for example, let's say it's c four, midi
> sixty, then you would play sixty one but bent a semi tone down. And then glists all the way to the max pitch bend, which will be a
> whole tone glist up from c to d. let me know if you understand what I'm saying and if you have knowledge of the system. I may be
> getting some of the particulars wrong. I can't remember, for example, what the full pitch bend for the x sample instruments are, but I
> know it's recorded somewhere. One more pass in discussion."* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** two things for the revision. (1) In the tuba piece the pitches were never in the tool: they
were numbers the AI typed into a polled file at his word — the tool's memory was the conversation, which is why "how did it choose
the pitches" is a fair question a day later; the all-purpose tool should show its pitch set and where it came from, even when the
AI sets it. (2) The glissando rule he carries from the string quartet — the key one semitone into the travel, the bend from the far
end, a segment per two semitones with a 5 ms overlap — is the same rule the tuba engine holds ("the key centred on the excursion, a
re-key beyond") but the engine's split threshold was tuned for the tuba's ±2 st and is far too eager at ±1 st; the rule must read
the sampler's measured range and split by the real need. The measured ranges live in the recipe (MEASURED_BEND) and BEATING_TOOL
§3, not in anyone's memory. The fold decided as (a): the pair folds as one unit (D26). RUNNING_LOG §200.

### 2026-09-07, late — "ii good … pitch the old way … run the probe, then make the adjustments"

> *"ii good. We'll continue to do pitch the old way. I'll just ask you, and then we can try the new pitches. and then you're able to
> run the probe independently. Correct? So if you could run the probe, then make the adjustments to the morph panel. Just briefly
> check-in with me one more time and let me know how much you'll be able to do from now."* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** the working mode of the tuba piece confirmed for the septet's morphs — the pitches in the
conversation, the AI as the hands, the composer's ear as the judge — and the rack made to fit the tool (±2 st) rather than the tool
made to fit the rack. For the all-purpose tool: the sampler's bend range is a rack setting the tool should ASK FOR and then measure,
not a constant it carries; the probe is the tool's, the dial is the composer's. RUNNING_LOG §201.

### 2026-09-07, late — the bend range in Kontakt: "do I do that now?" · "make the panel bigger" · "even with this you cannot access the pitch bend range?"

> *"Can you give me instructions on the pitch bend range? And do I do that now?"* — then, with four screenshots of Kontakt (Options →
> Developer; the Xsample Bass Clarinet panel; Instrument Options → Controller; Instrument Options → Instrument): *"also if you are
> stepping the fonts up pls make the panel bigger; and previous ai looked into the developer features, even with this you cannot
> access the pitch bend range? look at other images pls and see where the pb range might be"* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** the tool's palette has one number it cannot set itself — the sampler's bend range — and
the composer is walked through a sampler's edit view to change it, with the tool's probe as the only trustworthy check. For the
all-purpose tool: keep the probe (measure, never assume), keep the "set the rack" step explicit in the setup docs with the exact
control per library once found, and note that Kontakt's Lua API reaches scripts, groups and zones but not the modulators. The
panel's size follows its fonts — a readability floor is a size floor too. RUNNING_LOG §202.

### 2026-09-07, late — "It's totally opaque to me … not worth my time. unless it's a blocker" — the Kontakt dial dropped; the engine adapts instead

> *"I can't figure it out. It's totally opaque to me. The number keeps changing, and it's difficult to know which instrument the
> keyboard controls. what was the other option and the pros and cons of it? this is probably not worth my time. unless it's a blocker.
> And then the... you mentioned the accept all notes off. Is that something you can do script? because there's too many instances.
> Otherwise, just either way, put it on the to do list, and we can maybe do that later. But even better if you can do yourself."* ·
> *"No. Just put it on the to do list. No need to do any lookup. I need to move this along, please. So quick, very quick answer on the
> the pitch bend Can we do it with what we have now? And then are we ready to move forward with the plan? Can you do the probe and
> run those steps independently? Let's try to move as quickly as possible to implementing this plan. so I can get back to the
> composing work."* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** the lesson of §202 in his words — a step inside the sampler's edit view is not the
composer's to take; the tool adapts to the rack as measured (the quartet's key rule inside the engine) and the rack stays as it is.
For the all-purpose tool: never make a sampler setting a precondition of a feature when the engine can absorb it; put rack changes on
a list with their gain named, and let the composer decide when. And: a lookup he did not ask for is a cost — the reply comes first,
the record after. RUNNING_LOG §203.

### 2026-09-07, late — "can we have a discussion about pitch? … Is there a facility where we try some pitches and then I can select them again?"

> *"So can we have a discussion about pitch? So I put some images of potential ones I want to try. Now you say you're just gonna put
> them in. Is there a facility where we try some pitches and then I can select them again? another time, put them into some kind of
> menu."* *(2026-09-07, late; typed, with five screenshots of the beating drawer's harmony list — cs-015, cs-019, cs-021, cs-050,
> S055 — each with its notes on the keyboard)*

**AI reading (not the composer's words):** the tuba way ("you say the words, I type them into the scratch file") has no memory he
can reach: a pitch set lived in a variant letter or a model and vanished when the next was typed. The ask is a MENU of pitch sets —
tried, kept by name, chosen again — and the sets he points at come from the beating drawer's harmony list (`bank/harmonies.json`):
the piece's own material, not the tuba's chords. **For the all-purpose tool:** a pitch set is a first-class object with a name and
a provenance (which harmony, which voicing), kept in a bank the panel lists, never only in the conversation; and the harmony
browser (CN-35) is the natural source for it in every panel — the morph panel included, even in the simple form of a pull-down.
RUNNING_LOG §205.

### 2026-09-07, late — the pitch menu grows: a root box, the Messiaen modes, the models' sets, stacks by transposition; and no keyboard

> *"please clarify, no keyboard display correct? then what will display the note names in the menu?"* — then — *"and then things like
> spectral, can i just have a box to type in root? and then can you add all the messiaen modes, all the pitch sets we currently have
> in the model, and the various transpositions, so like stack of 5ths + all transpositions, or 3rds + all transpositions? then a
> composition/todo note, come up for an animation/technique for piano to play scattared strikes solo"* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** the menu he wants is not a list of chords but a GENERATOR with a memory: named sets from
the harmony list, the models' own sets, and families made from a root — the seven modes of limited transposition, stacks of one
interval — with the transposition as a number he types (the root), and the kept ones by name. Note names as text are enough; the
keyboard is not asked for. For the all-purpose tool: a pitch source is (a family, a root, a voicing rule) with a name, and the same
root box should drive a spectral fundamental and a transposition alike. The piano's solo scattered strikes are a composition note
(CN-39), not the tool's. RUNNING_LOG §206.

### 2026-09-07, late — "let's talk about a strategy … most of the options have many more notes than three. What are the selection strategies?"

> *"You mentioned before a strategy for grabbing from any of the sonorities. let's talk about a strategy. So most of the options have
> many more notes than three. What are the selection strategies?"* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** the right question for a tool that casts a sonority onto a fixed number of pairs: the
selection is a RULE with a name (lowest, highest, outer + middle, spread, by register, a consecutive window, every other, a seeded
random), applied at the moment of picking, the result shown and keepable. For the all-purpose tool: the selection rule belongs
beside the voicing rule (the strikes drawer's presets, the beating drawer's octave range) as the third member of the pitch source —
family · root · voicing · selection — and "by register" (each pair takes the note nearest its home) is the one that respects the
players. RUNNING_LOG §207.


### 2026-09-07, late — a composition note: the piano's harmonics at the morph's re-breaths (CN-40)

> *"Composition note. for the piano part, for the morph section, use harmonics. So detect the onsets where the read breaths happen for
> the morph and what pitches they are, and then figure out the harmonic to play. if it's accessible or the nearest harmonic. It doesn't
> have to be the spot on pitch even better if it's a little detuned from what's being played in the ensemble. I'll book it the closest
> one that has the strongest harmonic. So I guess I would be the active or the fifth. And if that note isn't available, then move down
> the harmonic chain. develop a way to generate these? In two ways. So just to auto generate the midi, but also we have to figure out,
> just like with the piano percussion piece, how to fake fake harmonics using the earcom prepared piano sampler. does they just use, I
> believe, the fifth or the octave? Only one harmonic is available per key. But we did a version of this for that piece, and we could
> probably refine it here. maybe do a pass where we generate all the pitches from the onsets of the ensemble. We take off the ones that
> are playable by the... naturally by the sample library and then figure out how to achieve the other ones. either by using a different
> key Also, we can look into a different sample library that might have access to more harmonics."*
> *(2026-09-07, late; typed — "read breaths" = re-breaths, "the active" = the octave, "earcom" = IRCAM)*

**AI reading (not the composer's words):** the morph tool's first downstream consumer: a pass that reads a morph's RENDER (every
re-breath's onset and pitch per voice) and writes another instrument's part from it — the piano's harmonics, the nearest strong one,
a little detuned. For the all-purpose tool: a morph's render should be a queryable object (onsets, pitches, breaths per voice), not
only a bag of notes, so that resonances, doublings and accents can be derived from it; and a sampler's "what it can play" table (the
IRCAM harmonics' partials per string) is palette data of the same kind as the bending players' ranges. PLAN 1i; RUNNING_LOG §210.


- *(2026-09-07, late — "if I type a new root in the root box it continues to use F", RUNNING_LOG §211)* **A control must reach its target
  through every path, and read what a musician types:** the root box was wired through one path (a chosen sonority) and read only
  a note with an octave; he typed a pitch class with the model's own set. Fixed; the lesson for the tool: one box, one meaning,
  every route; a pitch class alone is a valid note, the octave inferred from context.

- *(2026-09-07, late — "the naming can it increment per model? because I lose track of which one", RUNNING_LOG §212)* **A saved thing
  must name itself:** the default label now carries the number, the length and the pitch source. For the tool: every take, actual or
  kept set gets a default name that reads back in a list a day later — number · what · from what — before the composer's words.

### 2026-09-07, late — "is there a way to recall an actual to modify it?"

> *"is there a way to recall an actual to modify it?"* *(2026-09-07, late; typed)*

**AI reading (not the composer's words):** the tuba's ACTUAL was a frozen render by design (placed verbatim); the septet asks it to be
a STARTING POINT as well — recalled into the model with its dials, seed, cast and pitches, edited, saved as a new one. Building it
uncovered that the server's save path rendered without the septet palette (the panel and the server had two renders); the fix makes
the actual's provenance carry everything the panel knew (the cast, the pitch source, the palette) and the server render with it. For
the all-purpose tool: ONE render path shared by the panel and the store, the provenance complete enough to recall, and "recall" a
first-class verb beside hear and place. RUNNING_LOG §213.


### 2026-09-09 — THE FADE-IN DOES NOT FADE: measured, analysed, NOT CHANGED (his ask); RUNNING_LOG §311

**His words, verbatim:**

> *"Can you look at the fade in mechanism? And I don't know how you might test this, but what I hear is it start quite soft for a second
> or two, and then the next entries jump in rather loud. So there's no real fade in there. I'm not sure if that's a bug. And the fade in
> doesn't seem to correspond with the amount I put where you set. So regardless of how much I dial in there, the initial entry is quiet,
> but soon thereafter, it's like a loud attack. So maybe the fade doesn't apply to the second attack. … Could you do the analysis and look
> at it and then check-in with me before changing anything?"*

> *"1st entry, flute in quiet, then all the others loud after"* — and, switching the entry mode: *"together quiet, then the second
> entries are loud."*

**MEASURED** by rendering BLOOM in node with his own settings (`len 8 · entry together · curve linear · from 0 · peak 1`) and reading the
level breakpoints the engine emits. **He is right, and it is worse than he thought.**

Voice 0's five notes, with the fade and without — **they diverge only in note 1:**

| note | starts | with the 8 s fade | with no shape at all |
|---|---|---|---|
| 1 | 0.00 s | 0 → **4.3** | 0.8 → **4.6** |
| 2 | 8.05 s | 2.6 → 9.0 | 2.6 → 9.0 |
| 3 | 16.28 s | 6.6 → 9.2 | 6.6 → 9.2 |
| 4 | 24.23 s | 0.8 → 6.0 | 0.8 → 6.0 |

And the peak of each successive note as the attack length grows (span 40 s, breaths 6–10 s):

| attack len | note 1 | note 2 | note 3 | note 4 |
|---|---|---|---|---|
| none | 4.6 | 9.0 | 9.2 | 6.0 |
| **3 s (the preset's own default)** | **4.6** | **9.0** | **9.2** | **6.0** |
| 8 s | 4.3 | 9.0 | 9.2 | 6.0 |
| 15 s | 2.3 | 9.0 | 9.2 | 6.0 |
| 20 s | 1.7 | 7.0 | 8.8 | 6.0 |
| 30 s | 1.1 | 4.7 | 5.9 | 4.9 |

**A 3 s fade on this morph is bit-identical to no fade at all.** An 8 s fade moves note 1's peak from 4.6 to 4.3 — six per cent — and
changes nothing else in the gesture.

**THE DIAGNOSIS (the AI's, marked as such).** `shapeGain(shape, t, span)` multiplies the dynamics layer and its `t` is **ABSOLUTE GESTURE
TIME**; past `len` the gain is exactly 1 and every later note is untouched. This model's breaths are 6–10 s (`carrier.segLen` 8), so any
fade shorter than one breath shapes the FIRST NOTE ONLY, and the second breath arrives at full level on a fresh note-on — which the
sampler articulates, so it is heard as an attack. **Not a coding error: a scaling error between two numbers chosen independently** — the
preset's 3 s (written for the tuba piece and marked *UNHEARD* in `bank/shape_presets.json`) against this model's 8 s breath.

**Two further findings.** (1) It reads as a JUMP rather than a plateau because the fade fights the dynamics swell and loses: note 1 ends
at 4.3 while note 2 climbs to 9.0, so when the window closes the swell does not merely reach the body, it overtakes where the fade left
off. (2) **`entry: ramp` cancels the fade by construction** — the entries are spread across the same window the gain is measured in, so
the last voice to enter begins at gain 1.00. That is his *"1st entry quiet, then all the others loud after"*.

**FOUR OPTIONS, none taken — his call when he comes back to it:**

- **(a) scale the attack as a FRACTION OF THE SPAN** rather than in seconds — immune to breath length, and the dial then means the same
  thing on every model;
- **(b) measure the gain from each voice's OWN entry** — fixes `ramp` cancelling itself; does not fix the second-breath cliff;
- **(c) make the fade a RISING CEILING** that caps the dynamics layer instead of multiplying it, so a swell cannot overtake it — the AI's
  reading is that this is the one that would actually sound like a fade-in;
- **(d) leave the engine alone and fix the PRESET's number** — the smallest change, no engine risk, and possibly all he wants.

### 2026-09-09 — the fade-in fix SIMULATED before recommending: a straight ceiling does nothing (RUNNING_LOG §312)

His question: *"and what is the recommend c + a?"* — so the options were simulated on the real render rather than reasoned about.
Voice 0-s five breath peaks (t = 0 · 8 · 16 · 24 · 34 s, span 40 s):

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| the morph on its own | 4.6 | 9.0 | 9.2 | 6.0 | 0.8 |
| multiplier, 8 s (what he has) | 4.2 | 9.0 | 9.2 | 6.0 | 0.8 |
| multiplier, 16 s | 2.1 | 8.8 | 9.2 | 6.0 | 0.8 |
| **ceiling, 16 s, straight** | **4.6** | **9.0** | **9.2** | 6.0 | 0.8 |
| **ceiling, 24 s, held back** | **0.9** | **4.2** | **8.0** | 6.0 | 0.8 |

**A straight ceiling does nothing** — a lid rising linearly to full sits above the swell at every moment. Only the HELD-BACK, LONG ceiling
grades the breaths. The reason is worth keeping: **a multiplier scales the swell, so a loud breath stays proportionally loud; a ceiling
flattens it, removing the peak.** And the curve dial has no held-back option — measured, `expo` is FRONT-loaded (0.35 at u = 0.1) and
runs the wrong way for a fade.

**Underneath all of it:** the morph-s own dynamics already DOUBLE from breath 1 to breath 2 (4.6 → 9.0) with no shape at all. A multiplier
on the first seconds therefore scales down the breath that was already quietest and leaves the loud one alone — it makes the contrast
worse. **The recommendation: (a) the length as a fraction of the span, about 60 % · (c) a ceiling not a multiplier · plus a held-back curve
in the dial. (d) alone is measurably not enough.** Not built.

### 2026-09-09 — the fade-in FIXED, all three pieces, at his *"build all 3"* (RUNNING_LOG §313)

**In the panel now:** SHAPE · attack gains **`len % of span`** and **`how`** (multiply · ceiling), and the curve menu gains **`held`**. A new
preset **`fade-in-slow`** (60 % · ceiling · held) is the one to reach for; **`fade-in-3s` is untouched** because his saved ACTUALs point at
it. The seconds box shows what a fraction resolved to, so the dial never reads 2 while the fade is running 24 s.

**Measured after the build** — voice 0's five breaths: the old 3 s preset gives 4.6 / 9.0 / 9.2 / 6.0 / 0.8, identical to no shape; the new
preset gives **0.9 / 4.2 / 8.0** / 6.0 / 0.8. **The old fade reached one breath, the new one reaches three.**

**And the build corrected the story again:** with identical settings both modes grade (multiply 0.4 / 3.8 / 6.5 · ceiling 0.9 / 4.2 / 8.0),
so the two REAL fixes are the length and the curve; the ceiling is a refinement whose value is that it **flattens the loud and leaves the
quiet alone**, where a multiplier scales down the breath that was already quietest. Two checks written to the old story failed on their
first run and were corrected to the numbers.

### 2026-09-09 — THE ACTUAL BUG: the emitter strikes every note for its PEAK (RUNNING_LOG §314)

His words: *"I would like to cut to what the actual problem is and avoid much more of this back and forth troubleshooting … are those at
different velocities? Or is the CC7 not being reset correctly? It's probably best to use the volume logic already inherent in the morph."*
**He was right on every count.**

**The engine's level curve was correct all along** — instrumented, it runs 0 → 0.32 → 1.12 → 2.43 → 4.60 → 6.84 → 10 and lands exactly on
the natural level, which is what he asked for. **The bug is in `morph_emit.js`:** the velocity for each note comes from that note's PEAK
level, and is only softened when the note opens below 0.4. So voice 0's five breaths were struck at **1 · 103 · 103 · 103 · 71 whatever the
fade said** — the fade shaped CC7 *within* each note and could never touch the attack that began it. CC7 was never the problem; it is
calibrated relative to each note's velocity, so the two compensate and the compensation is what lurches.

**Fixed:** inside the attack window the reference height is the level the note OPENS at, not its peak, with CC7 on the same reference.
Voice 0 now enters at **1 · 63 · 103 · 103 · 71**; no-shape renders are untouched.

**And the preset went back to his logic** — `fade-in-slow` is now **60 % · multiply · linear**, the morph's own volume scaled from silence to
its natural level. Both of the AI's §313 refinements were dropped: `ceiling` has a kink where `multiply` meets smoothly, and the `held`
curve hangs low then rushes — which was audibly his *"quiet for 300 ms then ramps up quickly"*.

**One number he should have before judging by ear:** the morph's own entries jump **3.3× then 2.5×** with no fade at all. That growth is the
gesture; a fade scales it and cannot remove it. A longer `lenPct` is the dial if he wants the entries flatter still.

### 2026-09-09 — THE FADE, HIS DESIGN: one velocity per part, CC7 doing the movement (RUNNING_LOG §315)

The question that solved it was his, and it was not about the fade: *"in the morphs without any fade in … the original bloom morph
fades in quite gradually … How do you achieve that fade in?"* **Measured: one velocity for every breath (103, 103, 103, 103) with CC7
alone climbing 76 → 86 → 109.** Both attack modes I had built did the opposite — they moved the velocity between breaths, which reads
as a series of differently-struck notes and not as a fade, and drove CC7 to 127 at both ends of the remap.

**His design, built as `attack.mode: 'fade'`:** per part, find the breath in progress at the end of the window; use THAT breath's
velocity for every breath before it; ramp the level from `from` to that part's natural level at the end of the window, in ABSOLUTE
time so the ramp is continuous across breath boundaries. The endpoint is read from the render, so the join is exact by construction —
**there is no number to calibrate**, which is what the three failed rounds before it were doing.

**FOR THE REVISION, the general lesson, and it is bigger than the fade.** *A dynamic instruction must be expressed in the mechanism the
instrument already uses for that dimension.* This sampler's loudness-over-time is CC7 under a fixed strike; a layer that also moves the
strike is not a refinement of it but a second, competing voice. Three rounds were spent tuning a correct level curve because the level
curve was the only layer I was looking at. **The tool should be able to show what it is SENDING, not only what it computed** — a
velocity/CC7 readout per breath would have ended this on day one, and its absence is the real finding here.

**Second, and specific to any renderer feeding a score app:** the engine's velocity law was duplicated in `Composer.heldDyn` — the same
"take the top of the curve" rule in two places. Fixing one silently left the other, so an inserted fade would have auditioned correctly
in the panel and jumped in the score. Anything that overrides the loudness law has to travel WITH the note (here `velRef`, into the
score object), or the two copies drift.

### 2026-09-09 — THE FLOOR: the drawn dynamic scale is 9.96 dB, so no drawn curve can fade from silence (RUNNING_LOG §316)

*"still not working. why? what is going on? any way to look at the file I'm actually generating"* — and the isolated test he asked for
found it at once. **A drawn held note running the full 0 → 10 sends CC7 88 → 127, not 0 → 127.** `HELD_LO = 65, HELD_HI = 127` makes the
drawn 0–10 a scale of anchor velocities, which on the measured remap is **−39.18 to −29.22 dB — 9.96 dB end to end**. Every fade so far
has been a ten-decibel swell whose bottom was already two thirds of the way up.

**And it means §315 did not do what he said.** His words were *"we start at the beginning zero CC7"* — CC7 zero. I ramped the LEVEL,
which passes through the anchor scale and cannot come out below 88.

**FOR THE REVISION.** The tool has two loudness vocabularies and they are not interchangeable: **level** (a musical scale, deliberately
floored at the ensemble's soft end) and **CC7** (the actual fader, 0 = off). Everything written for the score speaks the first; a fade
from nothing can only be said in the second. A future morph panel needs both, named apart, and needs to show which one a control is
speaking — `cc7Abs` is the seed of it here.

**Still open, and it is the question the whole design turns on:** is CC7 0 actually silent on these samplers, or does a struck note
speak through it? `scores/cc7-ramp-test.json` column 6 answers it in ten seconds.

### 2026-09-09 — THE FADE LIVES IN CC7, NOT IN LEVEL (RUNNING_LOG §317)

*"Never mind about the tests — if you think that's the problem, then what needs to be fixed in the system?"* **The units.** Level is a
musical scale spanning 9.96 dB whose floor is CC7 88; CC7 is the fader and reaches 0. A fade can only be said in the second.

So `attack.mode: 'fade'` now leaves every level untouched and stamps two things: `velRef` (one velocity across the window) and
`cc7Fade` (a weight CC7 is multiplied by, reaching exactly 1 at the window's end). **A faded render is byte-identical to the unfaded one
once the stamps are removed** — the players' written dynamics are the morph's own, and the fade sits over them.

**FOR THE REVISION, the general principle this arrived at:** the tool has TWO loudness vocabularies and they are not interchangeable.
**Level** is what the player reads — deliberately floored at the ensemble's soft end, because a written note should not fall below it.
**CC7** is the fader — 0 is off. Anything that shapes the SOUND rather than the notation belongs in the second: fades, mix gestures,
the electronics-facing side of a morph. A future panel should name the two apart and show which one a control speaks, because three
rounds were lost to a control that looked like loudness and was actually notation.

**And one API note worth keeping:** the weight function is exported and all three consumers — engine, emitter, score playback — call the
same one. Every earlier bug in this sequence came from a law that existed in two places (§315: the velocity rule in the emitter and again
in `Composer.heldDyn`). One formula, one fade.

### 2026-09-09 — NEVER QUEUE WHAT CANNOT BE UN-QUEUED (RUNNING_LOG §320)

*"midi is frozen now wont stop playing, panic doesnt work."* The morph panel had just been changed to hand its whole run to Web MIDI
in advance, cancelling on Stop with `out.clear()`. **`MIDIOutput.clear()` is in the spec and Chrome does not implement it** — the
prototype carries `send` and `constructor` — so Stop cancelled nothing and a hundred seconds of note-ons kept arriving.

**FOR THE REVISION, and it applies to any scheduler this tool ever grows:** timestamped scheduling needs a BOUND as much as it needs
timestamps. Hold at most a fraction of a second in the driver, top it up from a timer, and a stop is always within that fraction of
silence. The score has had a 100 ms bound since §103, which is why the identical missing `clear()` there has never once been felt.

**And the guard that caused it is a pattern to distrust:** `typeof out.clear === 'function'` reads as defensive code and was actually an
unverified assumption about the platform, with the rack on the other end. A capability check is only defensive if you have looked at
which way it falls.

### 2026-09-19 — LGMF: the rebreath layer wanted OUTSIDE the morph, and richer than the carrier (COMPOSITION_NOTES LG-35)

> *"one would be similar to the way the morphs' breaths work, rebreaths. I would be able to layer something like this, so I might choose some
> very long durations for sustaining a chord, and I'd like to be able to just impose a sequence of rebreaths. And let's develop that a little
> bit more than they are in the morphs. So I can have it strictly striated, never together, or I can have some probability where sometimes
> they're together. And kind of similar to the time containers, I can have short ones combined with long ones. But the default should be
> similar to what's in the morphs. That's pretty good. And I might not want to design too much there, but just have the possibilities or at
> least the architecture there."* (composer, 2026-09-19, for a sequence of sustained chords — not a morph)

*AI reading (not the composer's words):* the carrier (striation · segLen · segVar · the palette's breath and bow ceilings · split-never-
truncate) is wanted as a LAYER that can be laid over any held material, not only a morph — and with two dials the carrier lacks: a
TOGETHER probability (0 = strictly striated, never together, as today; 1 = everyone breathes together; between, each breath may snap to a
shared moment) and a POOL of breath lengths (short and long mixed, the time container generator's pool) in place of one length ± jitter.
For the all-purpose tool: the carrier should be its own module with those dials, and the morph one of its callers. For this piece it is
being built beside the morph (`sequence.js`), with the morph's numbers as its defaults and morph.js untouched (the tuba baseline).


### 2026-09-19 — LGMF: the morph's crescendos "not perfect" — he wants them RANDOMIZED and individual (COMPOSITION_NOTES LG-38)

> *"look into how the morphs does crescendos. I don't think it's perfect, but that's the idea — is that I have some sort of randomized
> crescendos. Not everyone is crescendoing at the same time … So I can get individual waves … I don't want to decide every swell and length
> … It'll probably be like the time containers, like max duration or short and then long or things like that."* (composer, 2026-09-19)

*AI reading (not the composer's words):* what the dynamics layer is today (morph.js `dynLevel`): ONE shape over the whole morph's progress —
`swell` (a single arch) · `rise` · `fall` · `rotate` (a sine, `turns` cycles) · `flat` — with `base`, `amount`, and `spread`, which shifts
each voice's PHASE by its index. So every voice rides the SAME wave, evenly fanned, the same length, periodic, and nothing in it is random
— "not everyone at the same time" is only a phase offset. What he is asking for is a different object: per-player STREAMS of swells, each
swell with a length dealt from a pool (short with long), a depth, a place for its peak, and stretches of rest between — seeded. For the
all-purpose tool: the dynamics layer should take a wave SOURCE — the present shapes as one, a dealt stream as another — and the stream
generator should be the time container generator's sibling. For this piece it is being designed for the SEQUENCE drawer (PLAN 1d), beside
the morph, morph.js untouched. One thing the morph already does right and the new layer keeps: a wave is carried by ONE CC7 ramp under a
constant velocity, so a breath that re-enters mid-wave does not lurch.


## 4 · For the eventual revision (the digest — rewritten freely)

- *(seed)* A morph event as ONE object: pairs · a glissando / beating curve per pair · a re-articulation pattern · a dynamic curve ·
  a duration — instead of the tuba piece's per-note bends assembled by hand.
- *(seed, from #4 day 13 finding 3, read 2026-09-06)* The PAIR as the scheduled unit — its gap (the beating) designed, not fallen out
  of two independent staggers; cycling the pair's gap as a unit = the true repeated bloom #4 deferred.
- *(seed)* The all-purpose form: instrument-agnostic pairs, the bend range from the recipe, the curves from the score's curve
  windows, the notation as a rate / beating curve (as the trill's `tr` + span).
- *(from the build, 2026-09-07 — what the all-purpose tool has now and what it still lacks)* **Has:** the pair as the unit, its gap
  designed (the mirrored curves, the phase slide); the axis in beats per second with the register law inside; the interval inside a
  pair on the coincident partial, the just interval as the zero; the palette from the recipe (the ranges and the bend limits
  measured, the pairing table computed, nothing instrument-specific in the tool); direct manipulation (handles on rails, shapes,
  draw, the mirror lock); the breaths as a model (one · continuous · designated; a seeded deal with hand marks kept; the ceilings
  as a table to tune by ear); the pattern as one gesture (the group with a META shape, the drawer's re-insert rule); takes.
  **Lacks, for "an easier to use all purpose tool":** more than three pairs (the six players is this piece's cap); a player in two
  pairs; a flat partner as a first-class row mode (it is `share` 0 / 1 — the panel has no button); the cycling of the pair's gap as a
  unit over a long event (the tuba's out-and-back at the timeline level — here a hump or a drawn curve does it once); the shuffle as
  a writer (item 8); the crescendo's own dynamics layer per pair with phase (the tuba's D24 — here the crescendo follows the beating
  or is drawn); the exit as a rule (a release to unison and the floor — here the curve's own end); the notation; a way to hear a
  pair's beating rate as a number while the score plays (the readout is the panel's, before playing); the ceilings by register and
  by loudness measured, not defaulted.
- *(2026-09-07, his first remarks)* **The panel is a drawer from the bottom, full page, like the strikes — not a floating box**; the
  composer looks for a tool where the strikes are. And a readability floor: no font under 10 px in a panel, the base 13, the
  buttons 12 (his mapping 10 → 12, 12 → 14, 14 → 18).

### 2026-09-08 — "good go please": PLAN 1i begun — the piano's harmonics at the morph's re-breaths, the first pass un-shifted

> *"good go please"* *(2026-09-08, after the clear — to the model read back in one line and to the un-shifted first pass; RUNNING_LOG §217)*

*AI reading (not the composer's words):* the piano's part in the morph section is DERIVED from what is placed: a button on the morph
panel reads the morph group at the playhead and writes the piano's harmonic notes into the score, one per re-breath (the player's
pitch at the re-breath → the nearest key whose octave harmonic sounds it, or an octave above by a switch), the notes joining the
morph's group so they travel with its shape, each carrying its provenance (the source lane and pitch, the string, the partial, the
detune, the fold); a re-run replaces them. For the all-purpose tool: a morph could carry derived "resonance" voices as a rule,
re-derived whenever the morph changes — the piano's harmonics are the first such rule.

### 2026-09-08 — CN-43: articulation points generated from the morph, the piano part composed by hand on them (a design discussion asked for)

> *"I'd like generated from the morph. just articulation points. These can maybe appear as lines in the piano part, but initially with
> nothing attached. And the line should come from any of the morph onsets, the rebreath, the peak point, those dots, and the end of a
> breath. And then I'd like to Be able to click on any of those lines. and assigned a pitch and an articulation … normal piano, muted
> piano, or harmonic. or Plucked. and then duration and dynamic … that vertical keyboard … the normal dynamics PPP to FFF … choose a
> duration or dial in a duration … Let's discuss how this should look first before building it."* *(2026-09-08; verbatim in CN-43)*

*AI reading (not the composer's words):* a second derived layer of a morph — after the piano harmonics (its notes generated), now its
MOMENTS generated (onset · apex · end per note) as empty lines on another lane, filled in by hand. For the all-purpose tool: a morph
exposes its event grid (onsets, apexes, ends, per voice) to any lane as cue lines; a cue line is a note-to-be — the score's own
"shape without a pitch" (`sonifyNote` null) — completed by a picker (pitch · voice · dynamic · length). Discussed before building
(HOW_WE_WORK: a model agreed in one line first); RUNNING_LOG §219.

### 2026-09-08 — CN-43, topic 1 decided: a line is an empty note; the kind checkboxes; the ensemble's notes on the keyboard

> *"Okay. And I should have, like, a check then somewhere maybe in the piano zone or the meta shape. In any case, there should be
> something like checkboxes somehow where I can choose to show the lines for the peaks, the onsets, or the offsets. So in other words, I
> can check just the peaks box and only see the lines for the peaks or the onsets and only see the lines for the onsets. And then, yes,
> a is good. And then another thought is when I click a line and the keyboard shows up, I would also like to see on the keyboard what
> notes are being played at that moment in the ensemble."* *(2026-09-08; RUNNING_LOG §220)*

*AI reading (not the composer's words):* (1) **decided: a line is an empty note** (the score's own shape without a sound note); (2) the
lines exist for all three kinds and are SHOWN by kind — checkboxes onsets · peaks · offsets (ends) somewhere on the piano lane or the
morph's shape — a view filter, held for topic 3; (3) the picker's keyboard shows the ENSEMBLE at the line's moment: each player's
sounding pitch (the key plus the bend at that instant) in the player's colour with its name — the piano chooses against what is
sounding. For the all-purpose tool: any pitch picker should show the context (what sounds at t) on its keyboard.

### 2026-09-08 — CN-43, step 4: the instrument checkboxes, the kind and the player combined

> *"can we add instrument checkboxes? so if I check only peaks and fl I'll only see flute peaks"* *(2026-09-08; RUNNING_LOG §227)*

*AI reading (not the composer's words):* the player ticks were in step 4's picture; his example fixes the RULE — a line is shown when
its kind is ticked AND its player is ticked — written into the step. For the all-purpose tool: a derived event grid is filtered by
kind × source, and the filter is a view, never the data.

### 2026-09-14 — re-casting a PLACED morph: a seat swapped, the other lines kept, one pair's breaths re-dealt (session 11, RUNNING_LOG §466–§467)

> *"tell me what it would look like to swap the base clarinet and the cello in this section. So swap it in the composer score and the IR,
> and then we'll notate that swap."* … *"i would like to do c … let's reassess what it would take to do the swap with the new set of
> breaths and bowing"* (composer, 2026-09-14)

*AI reading (not the composer's words):* what the tool cannot do today and the script did by hand — **re-cast a morph that is already in
the score**: swap one seat, re-deal that pair's breaths and bows for the new instruments, leave every other line untouched (the engine
renders them identically — `perVoice: true`), place the two new lines exactly where the old ones were. Two things the revision needs:
(1) **a placed morph remembers its dials** — M2's tail matched no saved take and no `duration` value, so the panel could not have re-made
it; the take must be written at Insert, not only at "Save as ACTUAL"; (2) **a per-pair re-render on the placed group** — the panel's seat
pull-downs act on the next Generate, not on what is placed. Also seen: the SPECTRAL model's "nearest free partial" makes a shared-pitch
pair asymmetric (one holds, one travels) — the tool could say which seat holds before the render (§465).

### 2026-09-14 — for Lake George: morph TO a beating pattern, then HOLD it and play sparse figures inside it (CN-86)

> *"Note for Lake George piece, use the morph to get to a certain beating pattern and then hold and play figures there. Sparse figures that
> still evoke the beating. see Salvatore Sciarrino - Raffigurar Narciso al fonte"* (composer, 2026-09-14)

*AI reading (not the composer's words):* what the all-purpose tool would need for this. (1) **A destination chosen by its BEATING** — the
target named as a beating pattern (the rates per pair, the beats per second already the beating panel's axis), not only as pitches, with the
morph solving the pitches that produce it. (2) **An arrive-and-hold shape** — the morph's end becomes a sustain of a chosen length with the
beating stable, its breaths and bows re-dealt across the hold (the septet's breaths are dealt over a moving morph). (3) **Room for figures over
the hold** — the held pattern exported as a reference (its rates and pitches) that a figure tool can read, so the figures can be written to
"evoke the beating": rhythms at or related to the beat rates, pitches from the beating pairs. The septet's morphs only travel; none of this
exists yet.

### 2026-09-18 — LGMF: four transition types designed on the six reference chords (COMPOSITION_NOTES LG-28)

> *"I would like to have a spectral style one for each of these that moves from some other partial … then moves towards these
> reference harmony and then moves away to a different set of partials … a version of the bloom where … the ones that are on
> a deviant partial will gliss to a partial that doesn’t have many cents deviation … and a converge one where the deviant,
> non-deviant pairs will move into unison and then back."* — composer, dictated

*AI reading:* three of the four (spectral · bloom · converge) are morphs between pitch STATIONS OF ONE FUNDAMENTAL —
every target is a partial of the same root, so the destination set is small, enumerable and just-intoned by construction.
What the all-purpose tool will need from this piece: (1) a destination chosen as a PARTIAL NUMBER, not a free pitch; (2) a
three-station morph (A → reference → B) for the spectral type; (3) a there-and-back (reference → X → reference) for bloom
and converge; (4) per-voice pairing so a beating pair can be driven to a unison as one object; (5) a voice that CANNOT gliss
(the bowed vibraphone) inside a morph — step or hold, to be decided. The balance type is not a morph.

### 2026-09-19 — LGMF: what the tool was actually missing when PLAN 1a.5 came to build those four types

*Nothing of his was said this day; this is the AI's record of what the engine could and could not do when the four types
of the note above were built, because that is what this file is for. The four are now `bank/morph_models.json` →
`LGSPECTRAL · LGBALANCE · LGBLOOM · LGCONVERGE`, twenty-four actuals in `bank/actuals/`, RUNNING_LOG §72.*

**Two gaps, both real, both filled by additions that leave every existing render byte-identical** (checked against the
frozen tuba baseline of 2026-09-07, all six models, after each change):

1. **The engine's chord I/O was semitone-quantised, and this piece is made of cents.** Everything BELOW the front door was
   already cents-accurate — M1 opens ±50 c, the carrier bends, `chooseKey` re-keys — but `source.midi` is a list of
   integers and `startCents` was literally `midi * 100`. So a chord could not be told that the bassoon's D4 is 14 cents
   flat, which is the entire subject of this piece (LG-27: the horn, the trumpet and the bassoon play just, everyone else
   tempered, and the BEATING IS THE DIFFERENCE). Sorting was the second half of it: a just voice and its tempered double
   sit on the same MIDI number, so a sorted pitch list cannot say which of the two carries the deviation.
   → **`source.kind: 'voices'`** takes `[{ midi, cents }, …]` in the given order — not sorted, not reduced, one voice per
   entry — and **`target.kind: 'voices'`** gives each of them a destination in the same order. This is the thing the
   all-purpose tool most needs from this piece: **a chord is a list of VOICES, not a set of pitches.**

2. **There was no three-station morph, and no way to rest at the far station.** `target` is one destination and progress is
   a monotone 0 → 1; the only "and back" was `carrier.duration > span`, which FOLDS the phase into a triangle — and a
   triangle arrives at the far station and leaves in the same instant. Converge must not do that: its subject is friction
   resolving into *"something very clean and pure"* (LG-31), and the purity needs a moment to be heard. Spectral could not
   be said at all, because its third station is a DIFFERENT set from its first.
   → **`target.mid` (a third voice list) and `target.dwell`**, read by M3: start → mid over `(1−dwell)/2` of the run, sit
   on mid for `dwell`, mid → target over the rest. His 30 · 30 · 30 is `dwell = 1/3` against `carrier.span 90`, and both
   are dials on the model. A `carrier.hold` plateau inside `foldPhase` was written first and then removed: the dwell
   serves all four types where the fold serves only the there-and-back two, and an unused dial on a shared engine is a
   trap for the next piece.

**What still is not there, for the revision:**
- **A destination named as a PARTIAL NUMBER.** Every target in this piece is "partial n of this fundamental"; the tool takes
  cents, so `tools/build_reference_chords.js` computes the cents and the engine never knows why they are what they are. The
  consequence is that the model cannot be re-dialled in the terms the music is written in — he can change the DWELL by ear
  but not "take the 7th instead of the 8th".
- **A voice that cannot gliss.** The bowed vibraphone is handled here by simply not listing it among the movers, which works
  and is what LG-29 asks for, but the engine has no idea a fixed-pitch instrument is in the cast. A morph that tried to move
  it would move it.
- **The beating pair as an object.** Converge is nine independent voices that happen to arrive on six unisons. Nothing in the
  params says "this pair closes"; the pairing lives in `bank/reference_chords.json` and is flattened before the engine sees
  it. `morph_septet.js` has a `pairs` cast for the panel, but it pairs LANES for pitch-picking, not for a destination.
- **`shape.release` cannot fade a three-station gesture asymmetrically.** The 5 s fade to niente is the shape's release, and
  its window is measured from the end of the timeline, which is right here only because the last station is where the
  gesture also ends.

### 2026-09-19 — LGMF 1a.6: the carrier's ceiling is read at a segment's START level, and a swelling note outgrows it

*AI, from building the four transition scores.* `check_ceilings.js` found 18 notes in the BALANCE score longer than their
instrument can hold: a 11.8 s double bass against a 10 s ceiling, a 14.2 s trumpet against 12, five vibraphone bows at 8.7
against 7.4. **`morph.js buildCarrier` asks `ctxForBreath(start)` for the ceiling — the level at the moment the segment
BEGINS** — and the palette gives a quiet note 1.18 × the mf ceiling. On the one type whose notes swell, a segment can begin
at pp, be granted pp's length, and reach mf inside it. A player has to hold the whole note at its loudest.

Worked around in data for this piece (BALANCE's carrier target 12 s → 6 s), not in the engine, because reading the level
across a segment instead of at its head would change every existing render and break the frozen baseline. **For the
revision: the ceiling should be read at the LOUDEST level the segment will reach, which the carrier already knows, since it
computes the level curve for the segment it is about to cut.**

### 2026-09-19 — LGMF 1a.6: the panel assumes a morph's pitches are a SET, in three separate places

*AI, from making a recalled actual come back whole.* A model that names its own voices — `source.kind: 'voices'`, with cents
and lanes — was flattened three times over on its way back into the panel: `recallActual` looked only for `source.midi`,
`applyPitch` ran it through the sonority → take → fold machinery, and `morph_septet.js cast()` reduced it to the three
pairs' six seats and sorted it by pitch, which destroys both the cents and the just/tempered doublings (a doubling being two
voices on one MIDI number). Each is now guarded. **For the revision, the general shape underneath:** the panel has ONE idea
of what a morph's pitches are — a sonority, taken by a rule, folded onto pairs — and a piece whose chords are composed voice
by voice needs the other idea, where the chord is given and the cast is fixed. Both should be first-class, and which one a
model uses should be a property of the model rather than something three call sites infer.

### 2026-09-19 — LGMF 1d.5: what an all-purpose carrier would take from the sequence tool's breath dials (RUNNING_LOG §118)

*The AI's reading — he has not heard these dials yet.* The sequence tool borrowed the carrier's breath rules as numbers (8 s ·
±0.35 · the five striations) and then had to add what the carrier has never had, because his brief asked for it (LG-35:
*"strictly striated, never together, or … some probability where sometimes they're together … short ones combined with long
ones"*). Four things the revision should lift from `score/public/sequence.js` rather than re-invent:

- **The carrier has no idea of ANOTHER voice.** Every morph voice is dealt alone; whether two re-entries coincide is chance, and
  the striation only sets the first entry. `together` is the missing dial: blank = today's behaviour · 0 = never within
  `apart` seconds · between = that share snaps onto another voice's re-entry · 1 = everyone. It needs voices dealt IN AN ORDER,
  each seeing the starts of the ones before — a real change of shape for `morph.js §5`, which deals each voice in isolation.
- **The shortest breath leads.** The order that makes it work: shortest ceiling first. Anyone can match a shorter breath; no one
  can outlast their own ceiling. In a mixed ensemble this is not optional — with the long-breathed voice leading, the
  short-ceilinged ones cannot follow and the rule fails silently.
- **A start is moved by the breath BEFORE it** — shortened (never below half of itself), held longer within its ceiling, and
  only last the gap widened (capped at 1 s). Measured worst case 0.879 s. And the rule can be asked for more than there is:
  eight voices on 8 s breaths have room for about 0.75 s each way — past it, say so (`CROWDED`), never break quietly.
- **A pool of lengths instead of length ± jitter**, from the time container generator, one stream per voice. The carrier's
  jitter is symmetric noise round one number; a pool is a CHOICE of numbers, and `3 9` is a different music from `6 ± 0.5`.
- **Small, but it bit:** the dial must have its OWN random stream, or turning it re-deals every length and nothing can be
  compared by ear. And `converging` / `diverging` are names that do nothing past the first entry in either tool — the
  revision should make them true or drop them.

### 2026-09-19 — LGMF: his remark on the morph's fade in and fade out, and a wish — a sequence going on INTO a morph (COMPOSITION_NOTES LG-40)

> *"a bit like we did with the morphs. We added on a fade in and a fade out. So I'm not 100% sure that was working perfectly, but it
> demonstrated the concept anyways."* — and — *"I'm gonna be working with the morph drawer, let's talk about how we could continue one of
> the time containers, the sequences, into something else. So for example, that last time container of a sequence would just naturally
> go into a morph and then adapt its breath patterns."* — composer, 2026-09-19, dictated

*AI reading (mine, marked):* two entries for the revision. **The fade:** he is not sure it worked perfectly and did not say what he heard;
nothing has been checked, so nothing is diagnosed — but the sequence tool is about to borrow the same field (`cc7Fade`), so whatever is
wrong with it will be inherited, and the first listen of a faded sequence is also a test of the morph's fade. **The join:** an
all-purpose morph tool should be able to START from the state another tool left the players in — each player's pitch and, harder,
each player's BREATH (where in a breath they are when the morph begins). The engine has half of this already: a source given voice by
voice (`source.kind: 'voices'`, 1a.5) and a per-voice start time in the carrier's schedule (`sched.startT`). What it lacks is any way
to be handed them from outside.

### 2026-09-19 — LGMF: the morph's revision gets the sequence's ENDINGS — and the join between the two is made by hand (COMPOSITION_NOTES LG-42)

> *"if I insert a morph, I'll just have to extend the first things or shorten whatever so that it, it's like the morph starts on their
> next breath. That's probably the scene that I'm going to use often … And then when I start redoing the morph, I'll just have similar
> options there as well."* — composer, 2026-09-19, dictated

*AI reading (mine, marked):* for the revision — a morph should END (and by symmetry begin) in the same four shapes the sequence gets in
PLAN 1d.8: **fade out or just end × each voice at its own time or everyone together**. Today the morph's fade is one window for every
voice and its voices are dealt to land together; "each voice finishes its own last breath" and "each voice fades on its own ending" do
not exist. **No linkage between the tools is wanted** — §124's hand-over of each player's breath from a sequence to a morph is NOT to
be built; he moves the first notes by hand so the morph "starts on their next breath". What would make that handwork easy is small:
first entries that are easy to grab and re-time without the engine re-dealing them.

### 2026-09-19 — LGMF 1d.8: the fade's weight can now FALL — and what the morph's own endings cannot do (RUNNING_LOG §131)

*The AI's reading.* **One opt-in was added to `morph.js`:** `fadeWeight` takes `to` — where the weight ARRIVES (absent = 1, the line
it always was). The sequence drawer writes `{ from: 1, to: 0 }` for a fade OUT to niente. Nothing in `morph.js` writes `to`.
**For the revision:** the morph fades IN with the fader (`attack.mode 'fade'` → `cc7Fade`, true silence) and OUT with the LEVEL
(`release { len, to, exit, curve }` tapers the drawn curve) — two mechanisms for one gesture, and the second cannot reach silence:
the level's floor is the law's ppp. With `to` in place the release could ride the fader exactly as the attack does, and the morph
would get the sequence's four endings (LG-42) with no new field: fade out or just end × `exit` together or staggered — the
`release` block already has `exit` and `order`. His doubt about the morph's fades (*"not 100% sure that was working perfectly"*)
has two candidate causes on record now, neither confirmed by ear: this one, and §130's — until today a drawn level moved the fader
on the vibraphone only.

### 2026-09-20 — LGMF 1e: THE VOLUME FIX — what the morph needs, written down for its revision (RUNNING_LOG §137–§142)

**His instruction:** *"I'm going to want to revise the morphs tool a little bit later. So let's just have the methodology if it's
morph tool specific or if it's a general machinery fix then the morph tool should just plug in … if it's specific to the morph tool
then we'll have exactly what needs to be done out of this practice or exercise but then we'll implement it when i revise the morph tool."*

*AI reading (mine, marked):* it is BOTH. The machinery is general and already in the score — per note, `cc7Abs { lo, hi }` (the
drawn height 0 … 1 mapped straight onto the fader, bypassing the 12 dB ladder) and `velAbs` (the strike velocity), both from piece #5
(§316 · §346 · §349). The morph plugs in by WRITING them. What is morph-specific, exactly:

1. **A morph note whose level MOVES** (a crossfade between levels, a fade to a dynamic) is written with `cc7Abs { lo: 0, hi: 127 }`,
   `velAbs` = the instrument's mf velocity (`VelocityRemap.heldNote(remap, instKey, midi, 100).vel`), and its heights re-based so
   the TOP of the voice's shape is the full fader: `h' = 1 − (top − level)`. One `top` per VOICE across its breaths, so they join —
   as the sequence uses one top per waved player. A morph note whose level does NOT move stays a struck note: velocity is its dynamic.
2. **`morph_emit.js`'s audition does not read `cc7Abs`.** Its `ccOf` calls `VelocityRemap.cc7ForHeight` directly (~line 336) — the
   ladder, 12 dB, bottoming out near CC7 88 (its own comment says so). It needs the branch `heldCc7` has: `cc7Abs` first. And the
   strike there must honour `velAbs`. Until then the panel's Hear and the inserted score would disagree.
3. **The audition's route:** it plays on `routeFor` — the technique's MAIN channel — and streams CC7 and bends there. His rack takes
   a moving controller on the CURVE channels only (D11; measured today: on MAIN ch 1 nothing is heard to move). The revision routes a
   moving morph note as the score does: `Composer.curveChannelsOf` / `curveRoute`, round robin.
4. **Built now, in 1e (V3), because it is one line and the bug is live:** the panel's inserts call `C.curveDirty()` — without it a
   morph inserted after a playthrough plays on MAIN until the tab is reloaded (RUNNING_LOG §139).
5. **The cost to say out loud when it is done:** a shaped morph voice tops out at mf loudness (4–5 dB under a struck fff, uniform
   across the seven), and its heights stop meaning calibrated dynamics — they mean fader positions under a top.

### 2026-09-20 — LGMF 1d.10: the method of 1e is AMENDED — a stated range is what sounds, and the morph reads the same table (RUNNING_LOG §147 · §148, COMPOSITION_NOTES LG-51)

His words, of curves in general (verbatim in LG-51): *"I would state a dynamic range at the beginning of a curve. And then for the
whole duration of the curve, it is meant to go between those two values … a curve going from MP to FF should go … say 65 to 111 in
CC7, not up to the full 127."*

*AI reading (mine, marked):* the entry above (1e) told the morph's revision to write every shaped level with `cc7Abs { 0, 127 }`,
the heights re-based against the shape's top. **That second half no longer holds.** The revision writes `cc7Abs` from THE DYNAMICS
TABLE — `score/public/dyn_table.js`, PLAN 1d.10: `fff` = CC7 127, 4 dB a written step through each instrument's measured fader
curve — between the morph level's lowest and highest WRITTEN dynamic, every breakpoint landing on its table value. The mf strike
(`velAbs`), the curve channels and `Composer.curveDirty()` stand as written. **What an all-purpose tool would take from it:** a
level in a morph is a position between two STATED dynamics, never a loudness of its own — the same sentence that now governs the
sequence drawer and, at PLAN 1f, the crescendo tool. Method only, as before: nothing in `morph_panel.js` changes until the revision.

### 2026-09-20 — LGMF: THE MORPH PANEL IN SMALL BUILDS — one model at a time; first a BLOOM on a TAKE from the strikes drawer; how the pitches reach the pairs (RUNNING_LOG §162)

His words (dictated — "ticks … T-A-K-E-S" is TAKES, the strikes drawer's; "the tape" is the take):

> *"then I want to adapt or uh, add things to the morph panel. We already have a plan for the dynamic curves. So let's take care
> of that at this build. And then I'm going to do small builds at a time. And of course we can carry over whatever changes to the
> next one, but I'm going to work one model at a time, depending on my current compositional need. So I want to make a bloom and
> then I want to be able to use one of the ticks, ticks, T-A-K-E-S from the ticks drawer, just like the sequences do. So in the
> image there, in the pitches pulled down. And then I want to talk about how the pitches end up in the pairs and if we can have
> some sort of shuffle there and understand maybe how to assign particular pitches from the tape or the chord to the pairs. Let's
> have something more flexible. But what I'm concerned with in this particular instance is to make sure I'm choosing the notes from
> the take that are comfortable in both the instruments' ranges. And then being able to see the partial number. So actually, like
> the strikes drawer, that would be nice, except I don't want to build a whole bunch of additional infrastructure. I'm wondering if
> I can't do something there. Bring up the take in the strikes drawer and then save it as a different take, perhaps, and then use
> it, uh, assign the three pitches, maybe to one of the instruments in the pair or something like that. and then be able to pull
> it up here and have those particular pitches already assigned."*

*AI reading (mine, marked):* four things for this file.
**(1) The way of working.** Not the revision this file is collecting for — small, piece-specific builds, one MODEL at a time as
the composing calls for it, each carried forward to the next. The revision inherits whatever these builds prove.
**(2) What an all-purpose tool should take from the ask.** The panel fuses two decisions that he thinks of separately: WHICH
pitches (the sonority) and WHO plays them (today a take rule and then a fold — the player is never named, and he never sees the
choice being made). He wants to make the second by eye and ear, with the partial numbers and both instruments' ranges in view —
and the tool that shows exactly that already exists: the strikes drawer. A take from it is a chord ALREADY CAST (player · MIDI ·
cents · partial), which is 1a.5's sentence again — *a chord is a list of VOICES, not a set of pitches.* An all-purpose morph would
take its pitches from a cast chord as the ORDINARY case, and offer its reduction rules only when it is handed a bare set.
**(3) A naming trap.** The PITCHES line already uses "take" for its reduction rule (`spread`, `lowest` …); the strikes drawer's
TAKE is a different thing. They are about to sit in one line and need two words.
**(4) The dynamics — the two entries above — are to be BUILT in this first small build**, no longer method-only, at his word:
*"We already have a plan for the dynamic curves. So let's take care of that at this build."*

### 2026-09-20 — LGMF: the bloom sits on the JUST pitch · the strikes drawer is where he hears and resolves · "another pass at the actual way the morph drawer works" comes AFTER he has heard it (RUNNING_LOG §163)

> *"I need to hear those particular bloom pitches. So let's build this part first, along with the dynamics. And then I'll have
> another pass at the actual way the morph drawer works. … I want to be able to preview how those notes sound in the strikes
> drawer. Drawer. And then the strikes drawer will be where I resolve any range conflicts. The bloom will sit on A, the just pitch.
> So the precise pitch with any sense [cents] deviation."*

*AI reading (mine, marked):* for the revision — **(1)** a morph's pitches arrive with their CENTS as the ordinary case; the
whole-MIDI sonority path is the exception, and this piece will now have used the `voices` door for every morph it makes.
**(2)** He does not want the morph panel to be a place where pitches are judged. Hearing a chord, seeing its partials, settling a
range conflict — that is the strikes drawer's work, and the morph is handed the result. An all-purpose tool should keep that
division: ONE place where a chord is made and heard, and every generator (sequence, morph, crescendo) a reader of it.
**(3)** *"Another pass at the actual way the morph drawer works"* is announced and deliberately NOT described — he will say what
it is after he has heard a bloom on his own pitches. Nothing is to be anticipated.

### 2026-09-20 — LGMF: the ACTUALS must keep a morph's pitches — recall, vary, save as another, insert (RUNNING_LOG §168)

> *"And then in addition, the actuals too. So the actuals will preserve the pitch. So I can recall the actual and then change it and
> save it as a different actual, etc., or insert it into the score. It'll preserve the pitch changes, all of that."*

*AI reading (mine, marked):* for the revision — an ACTUAL is not an archive, it is his WORKING UNIT: a morph is made, filed,
recalled, varied, filed again under another name, and one of the family goes into the score. So whatever a morph was MADE from has
to come back with it, whole — the players, the cents, the partial numbers — and stay through every later change. Today the recall
branch knows one kind of pitch source (a sonority and a pick) and flattens everything else into it; that has now bitten twice
(1a.6, RUNNING_LOG §74; and here). **The all-purpose tool stores the pitch source AS IT WAS GIVEN and recalls it as the same kind
of thing** — a cast chord comes back a cast chord. Built for BLOOM in PLAN 1h (H2.6); the general form is the revision's.

### 2026-09-20 — AS BUILT (PLAN 1h H3): every sustained morph note is SHAPED, moving or not — the sentence this replaces

**It replaces this file's own sentence of earlier today**, *"a morph note whose level does NOT move stays a struck note"*. That was
written when the morph stood alone. It cannot stand now: the piece's second object is a BLOOM following the first sequence **on the
same take** (LG-52), and a still `pp` left on the struck ladder sits about **18 dB** over that sequence's `pp` (RUNNING_LOG §157,
his *"the attacks are very loud"*). One scale, or the join between the two objects is the step his ear already caught once.

**As built:** `score/public/morph_dyn.js` — `shapeLevels(bank, instKey, midi, level)` → `velAbs` (the mf velocity for the note's
own PITCH) · `cc7Abs` (the table values of the note's own lowest and highest written dynamics) · `heights` (every breakpoint on its
own table value). ONE helper, read by `morph_panel.js` when it INSERTS and by `morph_emit.js` when it HEARS, so the audition and
the score cannot drift. In Hear, `curveSeatsFor` puts each shaped note on a CURVE channel, round robin per player in time order;
in the score nothing was needed, because an inserted morph note has always been a curve event. It holds for **every pitch source**,
not only a take.

*AI reading (mine, marked):* for the revision — this is the second tool brought under one law after the fact, and both times the
work was the same three lines (mf strike · the table · a curve channel) written into a DIFFERENT file. The all-purpose tool should
not have a dynamics path of its own at all: it should ask one shared module what a written dynamic sounds at, exactly as it asks
the engine what a pitch is. `dyn_table.js` + `morph_dyn.js` are that module in embryo; the crescendo tool (PLAN `1f`) is the third
caller waiting, and it is still on the pre-1e law today.

**And a second thing the revision must face, seen while verifying this (not fixed, NITS):** with an LGMF model selected, the panel's
`heard()` returns NO notes — `cast()`'s voice-list branch marks every pair silent, and `filterResult` then keeps nothing — so Play
and Insert do nothing for the four models that name their own voices. PLAN 1h H2.3 solves exactly this for a TAKE by re-attaching
the pairs to the voices; the general answer is that a model which names its own voices should be heard WHOLE, since there is no pair
to tick. Untouched here: `morph_septet.js` is not in 1h's scope.

### 2026-09-20 — LGMF: THE VIBRAPHONES AS A FOURTH PAIR THAT DOES NOT BEND — "can bend" is today the gate on being in a morph at all (RUNNING_LOG §172 · COMPOSITION_NOTES LG-54)

> *"is there a way to include the vibraphones in the morph as an extra pair, but that don't bend pitch at all. I want them to be
> able to follow or have a, a curve and do the fade and everything. as one of the other pairs would, or, you know, its own
> trajectory, but it just wouldn't do the pitch bend. lets discuss"*

And, asked what they hold: *"a, as assigned in the take, held still"*.

*AI reading (mine, marked):* for the revision — today **"can bend" is the GATE on being in a morph at all**: the seat menus list only
`bendingLanes()`, and PLAN 1h's take reading leaves a vibraphone note out. His wish pulls apart two things that gate fuses — being a
member of the object (its time, its level, its fades) and taking part in its PITCH motion. **The engine already keeps them apart:**
its header names three orthogonal objects (MORPH cents · technique · level — CARRIER when a voice sounds — RENDER), and a morph note
is *an ordinary score waveCurve plus one optional field, `bend`*. A voice that does not bend is therefore not a special case; it is
the engine's note without the optional field. **The all-purpose tool: any SUSTAINED player can sit in a pair; whether a seat bends is
a property of the SEAT (the recipe's `playerBendSt`), which the model reads as "this voice's cents stay where they began" — not a
condition of entry.**
**A second thing the same sentence shows:** every dial in the panel is GLOBAL to the morph — a pair owns its two seats and its tick,
nothing else. *"Its own trajectory"* has nowhere to live today, for ANY pair, bending or not.

### 2026-09-20 — LGMF: the vibraphone pair FOLLOWS the bloom (his *"a"*) — and per-pair dials are named as the revision's (RUNNING_LOG §173)

Asked whether the vibraphones follow the bloom's one shape, get their own arc as a second bloom with only their pair ticked, or
carry dials of their own inside one bloom — his word: *"a"*, follow.

*AI reading (mine, marked):* for the revision — his first sentence asked for *"its own trajectory"* as well, and the tool could only
offer it as a SECOND OBJECT (tick one pair, Insert again over the same stretch). That works, and it is how a pair's own arc will be
made for now; but it is two blooms to keep in step by hand. **The all-purpose tool wants the dials in two layers: the morph's, and a
pair's own that override them** — length inside the span, level curve, fades — for ANY pair, bending or not. Not built for one pair
now: it is exactly his *"another pass at the actual way the morph drawer works"* (RUNNING_LOG §163), announced, his, not anticipated.
**And one thing for the engine's revision:** pitch motion enters a voice from three places (the model · the attack's motion · the
release's motion), all keyed on the voice INDEX and the voice COUNT. A voice that stays put has to be excused in all three, and its
presence still moves the stagger of the others. The all-purpose engine should deal pitch geometry over the MOVING voices only.

### 2026-09-20 — AS BUILT (PLAN 1i): a voice that STAYS PUT, and a pair that names its SEATS — what the build taught (RUNNING_LOG §175 · §176)

**As built:** `morph.js` — a voice of a `voices` list marked `still: true` keeps its start cents through everything; ONE line, because
`stateAt` turned out to be the only source of a voice's cents. `morph_panel.js` — a fourth pair `{ a, b, sa, sb, still }`, always
last, read from a take by `lane:seat`, never doubled, its voices sent last. Insert and Hear needed nothing.

*AI reading (mine, marked):* for the revision, three things the build showed that the plan had not.
**(1) A PLAYER IS NOT A LANE.** The whole cast machinery — `cast()`, `swapSeat()`, `pairRange()`, the take reading, the frozen chord,
the recall — identifies a player by its score lane, and the two vibraphones are one lane. Every one of those had to be taught, or
kept away from, a second key (`seat`). `swapSeat()` would have silently destroyed the still row on the first seat swap, because it
rebuilds every row from `a`, `b` and `on` alone. **The all-purpose tool should cast PLAYERS — (lane, seat) — from the start, and a
row should survive any function that does not know one of its fields.**
**(2) The sound path was already general, and that is worth keeping.** Both channel deals are per lane, by time, with a free-at
clock; two voices on one lane fell out of that with no code. The dynamics are asked of one module by instrument. Nothing in Hear or
Insert knows what a vibraphone is.
**(3) "Can bend" is now a property of the ROW, not of the seat's instrument.** The plan meant to derive the mark from the recipe's
`playerBendSt`; as built it rides on the pair (`still`), because a pair is where the panel already keeps what it knows about two
players. The recipe still decides which instrument gets such a row (`STILL_INST`). If a second non-bending instrument ever wants in,
that constant becomes a list — and that is the moment to derive it from the recipe instead.

### 2026-09-20 — LGMF: the morph's note lengths *"seem regular, predictable"* — and a wish for the sequence's breath generator (RUNNING_LOG §177)

> *"the durations of the notes in the morph seem regular, predictable. Are they then the same length? And can we discuss what it
> would be like to introduce a similar breath generator like in the sequences?"*

*Measured on his own `ACT-BLOOM-02`:* 80 breaths, mean 8.03 s, sd 1.45, 5.65 … 10.40 — every player dealt `segLen × (1 ± segVar)`
round the SAME 8 s, the ceiling only a cap.

*AI reading (mine, marked):* for the revision — the sequence drawer took its breath rules FROM the morph (SEQUENCE_TOOL §4), then
grew them at his ear's word: a breath built round each player's OWN maximum (`of max`), `±` in seconds, one breath in ten an
OUTLIER, `together` / `apart`, a pool of lengths, `re-breathe`. The morph still has the seed they grew from. **The all-purpose tool
has ONE breath generator, and the sequence's is the grown one** — the same sentence this file wrote about the dynamics
(*"should not have a dynamics path of its own at all"*), now about the breath. The engine is built for it: its CARRIER is already a
separate object from the MORPH. What is particular to a morph and the shared generator must allow: the level — and so the ceiling —
moves DURING the span, and a breath's place matters to the beating (a pair's beating stops while one of them breathes).

### 2026-09-20 — AS BUILT (PLAN 1j): the morph breathes round each player's own maximum — and what the build taught (RUNNING_LOG §181)

**As built:** `morph.js` `buildCarrier` — `carrier.ofMax` · `carrier.jitterS` · `carrier.outlier { share, short, floor }`, the
sequence's rule in a copy of the engine's own, opt-in. `morph_panel.js` — three boxes after `segment (s)`, ON from the start at
0.65 · 1.3 · 0.1 (`BREATH_DEFAULTS`), blank for an actual filed before. Measured on his own bloom: EH 11.1 · Bsn 11.8 · Hn 10.2 ·
Vc 10.7 · Tpt 7.6 · Db 5.9 · Vib 4.6 s where everyone had been at 8.

*AI reading (mine, marked):* for the revision, three things.
**(1) TWO COPIES OF ONE RULE NOW EXIST** (`sequence.js` `dealSpan` · `morph.js` `buildCarrier`), each naming the other. The
all-purpose tool has ONE breath generator; what it must allow that the sequence's does not: the ceiling asked afresh at every breath
(a morph's level moves, and a bending wind has less air), and no landing rule (a morph's last breath runs out).
**(2) "The dial re-deals nothing else" is a weaker promise in a morph.** The draws are untouched, but a breath that moves is read at
a different level, so its aim shifts a little. If that ever matters to him, the aim would have to be fixed per breath INDEX, not per
moment — a design choice, not a bug.
**(3) THE PANEL'S DEFAULTS ARE NOT THE MODEL'S.** They are laid in by the panel, so they reach every model it renders and nothing
the tools build. When the models are revised, the breath belongs in a model's own params — or in one place above all models — and
not in a constant in the UI.
**And one thing about the WHOLE tool that this build uncovered (§181):** an ACTUAL is rendered by the SERVER, not stored from what
was heard. Two renderers — the browser's for the ear, node's for the file — can disagree whenever the engine changes under a
running server, and did. The all-purpose tool should either store what was heard, or render in ONE place.

### 2026-09-21 — LGMF: the morph's PEAKS are much louder than the sequence before it — fine for section 1, to look into before the next morph (RUNNING_LOG §184 · PLAN `1k`)

His words, at the close of session 11:

> *"can you add to todo later to look into the morph dynamics and how to adjust them, the peaks of the morph I just made/inserted
> are much louder than the preceeding sequence, its fine for this section but I'd like to look into it before I do the next one"*

*AI reading (mine, marked):* two things — an OBSERVATION (a bloom placed after a sequence peaks well above it) and a WISH (a way to
adjust a morph's dynamics). **Nothing is diagnosed and nothing was looked at** — he asked for a todo. Both tools have been on the
dynamics law since H3 (RUNNING_LOG §171): each shaped note's fader moves between the table values of its own written dynamics, the
fades a weight on top. So a look starts with WHICH written dynamics the bloom's peaks carry against the sequence's, in the placed
score, before anything about the mechanism. The wish — a control — belongs to the revision as much as to this piece.
