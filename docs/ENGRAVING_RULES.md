# ENGRAVING RULES — GENERATED

> **GENERATED from `notation/registry/rules.json` by `node tools/gen_engraving_rules.js` — never edit this page.** Change the ROW
> (with its basis and its §), regenerate, commit both. `node tools/check_rules.js` fails when the page and the tables disagree.
> The rules for a NEW notation begin with a DEVICE SHEET (`docs/PLANNING_METHOD.md`); `docs/NOTATION_STANDARDS.md` is the history.

LGMF PLAN § `2e` (RUNNING_LOG §408 … §447 the design · §448 … the build). 137 registry pointers compile from these tables.

**How to read a row:** the value · `→` the registry key(s) it is compiled into (what the layout and the renderer read) · the basis
(`lilypond` · `gould` · `composer` · `AI` · `census` = what drew when the tables were built) · the ref (the § or the day). A field
with no `→` is the rule's record but is not compiled — its `in` says where the drawing reads it today.

---

## 1 · THE ANCHOR

LAYER 1 — THE ANCHOR (§414 · §416 · §418): which point of a unit sits on x(t). The principle, gated (check_rules 6): the head ON its time ↔ no go line; a go line ↔ the head off its time. G metric (a passage not spaced by time) is a HELD candidate (§416), not a row. `gapSs` = the distance from x(t) to the unit's near ink edge; `justify` the side of x(t) the unit sits on; `regime` the column's regime (HUG — every member on the head side, mirrored with the stem · ROWS — the dynamic on the dynamic row, text above); `columnAlign` how the column rows align on the unit.

- **A — on time** — atX **the head's left edge** · justify **right-of** · gapSs **0** · goLine **false** · regime **HUG** · columnAlign **centre** · *composer* · #4 day 22 (nhAnchor leftEdge) · §414
  - devices on it: byTechnique.main · byTechnique.plucked · byPairBeam · figures.cluster · figures.beam
- **B — before the line** — atX **the go line** · justify **left-of** · gapSs **0.45** → `layout.nhGapSs` · `layout.devices.byEnv.sequence.block.headGapSs` · goLine **true** · regime **ROWS** · columnAlign **right** → `layout.devices.byEnv.sequence.block.columnAlign` · *composer* · §417 F1 (his 'F1 0.45': ONE number, the house spacer — was 0.25, #4 day 22's '2 px', for the nh-unit and 2d's breath heads; 0.45 for 2d's block) · §418 F2 (his 'yes, right-justified': every member of the column ends at the spacer) · §414
  - devices on it: byEnv.surge · byEnv.sequence · byTechnique.ord · familyDevice.oneshot (provisional — DN-5) · familyDevice.sustained (provisional — DN-5)
- **C — the strike** — atX **the go line = the GC's impact** · justify **left-of** · gapSs **0.6** → `layout.devices.byEnv.strike.nhGapSs` · `layout.devices.byTechnique.staccato.nhGapSs` · `layout.devices.byTechnique.gettato_vel.nhGapSs` +3 · houseGapSs **0.25** → `layout.devices.byTechnique.fortepiano.nhGapSs` · `layout.devices.byTechnique.cuivre.nhGapSs` · goLine **true** · regime **HUG** · columnAlign **centre** · *composer* · #4 day 23 option B (clears the impact marker, r 0.51) · #5 §400 · §414 · houseGapSs: #4 day 22 · day 24 · NOTE: houseGapSs — fortepiano · cuivré: the old house gap 0.25 + the conditional push clear of the impact marker (#4 day 24), kept where it was when B's gap became 0.45 (2e.3 (1)); DN-2 asks whether every GC unit takes 0.6
  - devices on it: byEnv.strike · byTechnique.fortepiano · byTechnique.cuivre · byTechnique.staccato · byTechnique.gettato_vel · byTechnique.bartok_vel · byTechnique.slap · byTechnique.pizzicato
- **D — after the line** — atX **the go line** · justify **right-of** · gapSs **0.25** → `layout.devices.byEnv.trill.afterGoGapSs` · goLine **true** · regime **HUG** · columnAlign **centre** · *composer* · #5 §445 (the trill column right of its go line, nhAnchor afterGo) · §414
  - devices on it: byEnv.trill
- **E — continuous** — atX **the graphic is the time axis** · justify **span** · gapSs **0** · goLine **null** · regime **null** · columnAlign **null** · *composer* · #4 day 22 (the surge curve) · D42 · §414
  - devices on it: —
- **F — animated** — atX **x(now)** · justify **at** · gapSs **0** · goLine **null** · regime **null** · columnAlign **null** · *composer* · §409 · §411 (pushed right at a page start, nothing on paper — 2e.2)
  - devices on it: —

---

## 2 · THE COLUMN

LAYER 2 — THE COLUMN (§419 … §425): what stacks on a unit, in what order, on which side, how far apart. `order` is what draws today (compiled into engraving.layout.stackBelow); `orderDecided` is §420 · §421's order — LilyPond's outside-staff-priority with the ottava INSIDE the text, the one change from #5 — applied at 2e.3 (9). HUG keeps the strike chain's head-side departure (his §401f, kept §424). The floor tiers (§424 · §425): the staccato dot and the tenuto line may sit inside the staff, in a SPACE, never on a line; every other mark outside the staff by its own `staff` distance. `rows` are the fixed rows in ss from the middle line (+ up).

- **order** — **[articulation, dynamic, ottava, instruction]** → `layout.stackBelow` · §420 · §421 (LilyPond's outside-staff-priority, verified on his 2.24.4: the ottava INSIDE the text — the one change from #4 day 22's articulation · dynamic · instruction · ottava) — 2e.3 (9). In the layout's slot names: `articulation` = the accent and the technique symbol (LilyPond's Script), `instruction` = every word
- **orderLilypond** — **[accent, techSymbol, dynamic, ottava, text]** · §420 · §421 — the same order in the objects' names
- **sides** — HUG **every member on the head side, mirrored with the stem** · ROWS **the dynamic below on its row · text above · articulation on the head side** · pinned **the piano's chain pinned below — an override on the part** · §419 · §424 (his §401f kept)
- **floorTiers** — inside **[staccatoDot, tenuto]** · insideRule **in a space, never on a line** · outside **every other mark, by its own `staff` distance** · §424 · §425
- **stack** — standard **0.45** → `layout.stackGapSs` · `render.sectionHead.spacerSs` · medium **0.3** → `layout.gapMediumSs` · `render.sectionHead.mediumSs` · tight **0.15** → `layout.tightGapSs` · underFlag **0.3** → `layout.chainAboveGapSs` · standard: #2 session 77 (the house 0.45) · medium: #4 day 31 (his 'a medium one too') · tight: #4 day 23 (the staccato-dot gap) · underFlag: #4 day 23 (the chain between staff and flag) · §422
- **rows** — dynamic **-4.6** → `layout.dynY` · tag **3.5** → `layout.tagY` · tempo **4.6** → `layout.tempoY` · tick **3** → `layout.tickY` · #4 day 22 (dynY · tagY · tempoY · tickY — his approved rows) · §421

---

## 3 · THE OBJECTS

LAYER 3 — THE OBJECTS (§421 · §422 · §427 · §428): one row per drawn object type. FOUR DISTANCES in ss — `parent` to what it hangs on · `staff` the floor from the staff edge · `stack` to the next stacked mark · `beside` horizontal. `face` · `size` (ss for text, a scale for a glyph) · `colour` (a key of `colours`). `draws` names the layout's item kinds this row covers (`kind` or `glyph:<name pattern>` or `anim:<kind>` or `kind[seq]`) — gate (2): a drawn kind with no row fails the build. `variantOf` marks a row that draws with another row's glyph at its own size. His approved numbers are kept; anything undecided is seeded from LilyPond 2.24.4's define-grobs.scm on his machine (§422) — a seed is marked basis lilypond. New sizes are chosen on LilyPond's step 2^(1/6) (§428). `in` names where a value that is not compiled still lives (glyphs.json standards, a code literal) — the census of §448.

### Music marks

- **head** — face **music** · glyph **notehead.open · notehead.filled** · size **1** · colour **ink #111** · *lilypond* · #2 (Emmentaler) · §428
  - draws `glyph:notehead` `glyph:notehead-open`
- **cueHead** *(a variant of head)* — size **0.844** → `layout.devices.byEnv.strike.nhHeadScale` · `layout.devices.byTechnique.staccato.nhHeadScale` · `layout.devices.byTechnique.gettato_vel.nhHeadScale` +5 · colour **ink #111** · *composer* · #2 notehead.cellMotive.scaleFactor · #4 day 23 ('there was already a formulation for a small note head') — the sequence's reminder head retired, §443
- **smallHead** *(a variant of head)* — size **0.794** → `layout.devices.byEnv.trill.trillPitch.headScale` · `layout.devices.byEnv.trill.trillPitch.accScale` · colour **ink #111** · *composer* · #5 §438 (the trill's pitch head) · census
- **accidental** — face **music** · size **1** · colour **ink #111** · beside **0.25** → `layout.accGap` · besideUnit **0.1** → `layout.accGapColumn` · clears **the leftmost ink of the note — the head, or a ledger line inside the sign's own height (#2 H.4c.3; §419 F6)** · *composer* · beside: #4 day 22 (0.25 — the morph header, the sequence block, the onset head) · besideUnit: #2 D.6 (LP 0.35 tightened to 0.10 by eye — the nh-unit and the chord column; glyphs.json standards.accidental.gapToNotehead) · clears: #2 H.4c.3 on the nh-unit since #4 day 22, extended to the 0.25 sites at 2e.3 (7), §419 F6 (verified: the proto's ¾♯ on D♯6 overlapped its ledger by 0.027 ss)
  - draws `glyph:accidental-(?!leftParen|rightParen).*`
- **paren** — face **music** · glyph **accidental.leftParen · rightParen** · colour **ink #111** · sizeLabel **0.43** → `layout.devices.byEnv.sequence.label.parenScale` · besideLabel **0.1** → `layout.devices.byEnv.sequence.label.parenGapSs` · sizeTrill **0.63** → `layout.devices.byEnv.trill.trillPitch.parenScale` · *AI* · label §386 · trill #5 §438 (the AI's calls, his to reverse) · the reminder's parentheses retired with the reminder head, §443 (2e.3 (6))
  - draws `glyph:accidental-(leftParen|rightParen)`
- **ledger** — face **music** · colour **ink #111** · lengthFraction **0.25** · thicknessSs **0.1** · *lilypond* · #2 dimensions_table (LilyPond length-fraction 0.25)
  - draws `ledger` · in: glyphs.json standards.ledgerLine
- **stem** — face **music** · colour **ink #111** · lengthSs **3.5** → `layout.stemLen` · thicknessSs **0.13** · *lilypond* · #2 dimensions_table (one-octave stem) · #4 V0.10
  - draws `stem` · in: lengthSs compiled · thicknessSs glyphs.json standards.stem
- **flag** — face **music** · colour **ink #111** · staff **0.38** → `layout.flagClearanceSs` · scaleY **1** → `layout.flagScaleY` · *composer* · #4 day 23 wc-29 ('clear the staff, just like three pixels') · flagScaleY #4 day 23
  - draws `glyph:flag-.*`
- **staccatoDot** — face **music** · colour **ink #111** · parent **0.15** → `layout.devices.byEnv.strike.nhDotGapSs` · `layout.devices.byTechnique.staccato.nhDotGapSs` · `layout.devices.byTechnique.gettato_vel.nhDotGapSs` +4 · diameterSs **0.4** · floor **inside** · *composer* · #4 day 23 ('reduce 50% the gap' — the tight gap) · §424 (in a space, never on a line)
  - draws `dot` · in: diameterSs glyphs.json standards.staccatoDot
- **accent** — face **music** · glyph **articulation.accent · marcato** · size **1** · colour **ink #111** · *composer* · #5 §400 (the strike's accent)
  - draws `glyph:artic-(accent|marcato)` · seed: {parent: 0.2, staff: 0.25, note: LilyPond Script padding · staff-padding (§422) — a SEED,  not yet read by the layout (the chain places the accent by the column's stack)}
- **techSymbol** — face **music** · glyph **articulation.snappizz · plus · trill** · size **0.707** → `layout.devices.byTechnique.bartok_vel.techSymbolScale` · `layout.devices.byTechnique.slap.techSymbolScale` · sizeTrill **0.57** → `layout.devices.byEnv.trill.techSymbolScale` · colour **ink #111** · *composer* · size: #5 (bartók · slap, 0.707 = 2^(-1/2)) · sizeTrill: #5 §438
  - draws `glyph:artic-(snappizz|plus|trill)`
- **trillPitch** *(a variant of smallHead)* — groupPadSs **0.3** → `layout.devices.byEnv.trill.trillPitch.groupPadSs` · parenInnerSs **0.42** → `layout.devices.byEnv.trill.trillPitch.parenInnerSs` · accPadSs **0.2** → `layout.devices.byEnv.trill.trillPitch.accPadSs` · *composer* · #5 §438 (TRILL_NOTATION_SPEC)
- **dynamic** — face **music** · glyph **dynamic.*** · size **1** · colour **ink #111** · besideStem **0.15** → `layout.dynStemGapSs` · row **column.rows.dynamic** · *composer* · #4 day 22 (the dynamic row) · besideStem #4 day 23 ('akin to the staccato gap') · LilyPond DynamicText padding 0.6 / 0.1 (the seed, §422 — not drawn)
  - draws `glyph:dyn-.*`
- **dynamicLabel** *(a variant of dynamic)* — size **0.75** → `layout.devices.byEnv.sequence.label.scale` · colour **ink #111** · *AI* · §386 (the (dyn) at a turning point — the AI's cue scale, his to reverse)
- **dynamicText** — face **text** · size **0.9** → `layout.textSizes.dynamic` · italic **false** · colour **ink #111** → `layout.colours.dynamicText` · *composer* · #4 V0.10 textSizes.dynamic (an authored `dynamic` overlay's text) · §427 (black — it was grey by the renderer's default)
  - draws `text[dynamic]`
- **dynArrow** — colour **ink #111** · lengthSs **2** → `layout.dynArrow.lenSs` · `render.sectionHead.arrowLenSs` · headSs **0.45** → `layout.dynArrow.headSs` · `render.sectionHead.headSs` · beside **0.45** → `layout.dynArrow.gapSs` · thickSs **0.13** → `layout.dynArrow.thickSs` · `render.sectionHead.thickSs` · *composer* · #4 day 22 ('this is new' — the hairpin replacement; gaps the 0.45 standard, thickness the stem's)
  - draws `dynarrow`
- **niente** — colour **ink #111** · diameterSs **0.4695** → `render.sectionHead.circleDiaSs` · thickSs **0.13** · *composer* · #4 day 35 (the measured height of the m in mf — LilyPond draws its circled tip)
  - draws `niente`
- **instruction** — face **text** · size **0.75** → `layout.textSizes.instruction` · italic **true** → `layout.italic.instruction` · colour **ink #111** → `layout.colours.instruction` · stack **0.45** → `layout.devices.byEnv.sequence.block.textGapSs` · besideCut **0.15** → `layout.seccoGapSs` · *composer* · §427 · §428 (every word on a note: instruction 0.75 italic, black — the technique size 0.7 and the 1.0998 "pizz." bake retired) · stack: the block's text 0.45 above the column §380 · besideCut: "sempre secco" #5 §540 · LilyPond TextScript padding 0.3 / 0.5 (the seed)
  - draws `text` `text[techText]` `text[instruction]`
- **number** — face **text** · size **0.75** · italic **false** → `layout.italic.number` · partialForm **{n} ({f})** → `layout.partialForm` · colour **ink #111** → `layout.colours.number` · parent **0.6** → `layout.devices.byEnv.sequence.block.centsGapSs` · stack **1** → `layout.devices.byEnv.sequence.block.rowSs` · emSs **0.975** → `layout.devices.byEnv.sequence.block.numEmSs` · *composer* · §427 A5 (black — they were grey by render.js's default) · §428 (upright, instruction size) · parent: D45's height (#5) · stack: one row §380 · emSs = 0.75 × 1.3 · always written §435 · the partial `26 (C1)` §438
  - draws `text[cents]` `text[partial]`
- **tempoText** — face **text** · size **0.75** → `layout.textSizes.tempo` · italic **false** · colour **ink #111** → `layout.colours.tempoText` · *composer* · #4 day 35 (the trance bar line + tempo mark) · textSizes.tempo · §427 (the label black)
  - draws `tempotext` `text[tempo]`
- **readThrough** — face **text** · size **0.75** · italic **false** · colour **muted #8a8a8a** → `layout.colours.readThrough` · *composer* · #4 V0.10 (render.js's header: "the parachute bricks and read-through labels use muted color so mixed fidelity is visible at a glance") — a working marker on an UN-notated event, not a music mark; the technique size 0.7 → 0.75 with the rest (§427)
  - draws `text[readThrough]`
- **alertText** — face **text** · size **0.75** · italic **false** · colour **alert #c00** → `layout.colours.alert` · *composer* · #5 §400 (the red "out of range" idiom — a warning, never a music mark)
  - draws `text[alert]`
- **textBaked** — face **text (baked outline)** · size **1.0998** · colour **ink #111** · *composer* · #2's baked "pizz." (#5 2h.5) · "senza vib." §380 — RETIRED FROM DRAWING at 2e.3 (4), §427: every word is a live `instruction`; the bakes stay in glyphs.json, no device draws them
  - draws `glyph:text-.*`
- **barLine** — colour **ink #111** · thickSs **0.13** · *composer* · #4 day 35
  - draws `barline` · in: render.js engravingDefaults().barLine
- **goLine** — colour **goLine #333** · wPx **1.5** → `render.goLine.wPx` · opacity **0.85** → `render.goLine.opacity` · dash **5,4** → `render.goLine.dash` · *composer* · #4 day 22 ('keep that go line always black gray') · #5 §401h (the trims)
  - draws `goline`
- **attackLine** — colour **ink #111** · look **{wSs: 0.18, hSs: 2.2, offsetSs: 1.1}** → `render.attackLine` · *census* · #4 V0.10 (M4)
  - draws `attackline`
- **tick** — colour **ink #111** · look **{wSs: 0.12, hSs: 0.8}** → `render.tick` · *census* · #4 V0.10
  - draws `tick`
- **gc** — colour **gc rgb(255, 21, 160)** · *composer* · #4 day 23 ('when I say GC, that is the whole thing')
  - draws `gc` · in: engraving.render.gc (the look in px at the 1080 frame — piece #1's object whole)
- **ringBar** — colour **ink #111** · hSs **0.667** → `render.ringBar.hSs` · opacity **0.65** → `render.ringBar.opacity` · beside **0.25** → `layout.ringBarGapSs` · *composer* · #4 day 22 wc-23 (2/3 of the brick) · beside #4 day 24 ('a little bit of space and then a duration bar')
  - draws `ringbar`
- **brick** — colour **brick #4E7A9B** · opacity **0.45** → `render.brickOpacity` · *census* · #4 V0.10
  - draws `brick`
- **beam** — face **music** · colour **ink #111** · thicknessSs **0.4** · stubSs **1** → `layout.beamStubSs` · *composer* · #2 dimensions_table · stubSs #4 day 23 (the beamlet — Gould)
  - draws `beam` · in: thicknessSs glyphs.json standards.beam
- **tuplet** — colour **ink #111** · look **{thicknessSs: 0.16, hookLengthSs: 0.7, paddingSs: 0.5, numeralSizeSs: 1.2348, numeralBaselineBelowSs: 0.41, numeralInsetSs: 0.4, numeralGapPerCharSs: 0.88, numeralCapFactor: 0.7}** → `layout.tuplet` · *composer* · #4 day 23 (his own LilyPond standard, surveyed from #2's 809 .ly files)
  - draws `tuplet`
- **ottava** — colour **ink #111** · ledgerThreshold **3** → `layout.ottavaLedgerThreshold` · endBeside **0.3** → `layout.ottavaEndGapSs` · stack **0.45** · *composer* · ledgerThreshold #5 §401j (Gould, #2's staff router) · endBeside #5 §401m · LilyPond OttavaBracket padding 0.5 / 2.0 (the seed, §422)
  - draws `ottava` · in: stack = glyphs.json standards.ottava.standardGapSs (and the bracket's numbers)
- **rest** — face **music** · colour **ink #111** · *lilypond* · #4 day 23
  - draws `rest`
- **lvSlur** — face **music** · colour **ink #111** · beside **0.15** · *composer* · #5 2h.5 (l.v. — the tight gap)
  - draws `lvslur` · in: engraving.layout.letRingGapSs (code default 0.15)
- **pedal** — face **music** · colour **ink #111** · *composer* · #5 2h.5 (#2's 'Ped.')
  - draws `glyph:pedal-.*`
- **glissLine** — colour **ink #111** · *census* · #4 day 35
  - draws `glissline`
- **curve** — strokeWPx **2** → `render.envCurve.strokeWPx` · `render.glissCurve.strokeWPx` · `render.crescCurve.strokeWPx` · strokeOpacity **1** → `render.envCurve.strokeOpacity` · `render.glissCurve.strokeOpacity` · `render.crescCurve.strokeOpacity` · fillOpacity **0.3** → `render.envCurve.fillOpacity` · `render.glissCurve.fillOpacity` · `render.crescCurve.fillOpacity` · pathOpacity **0.3** → `render.envCurve.pathOpacity` · `render.glissCurve.pathOpacity` · `render.crescCurve.pathOpacity` · *composer* · D42 (#2's curve look across the board: fill 0.3 · 2 px stroke · 0.3 on the path)
- **envCurve** *(a variant of curve)* — colour **limeGreen #99FF00** · *composer* · D42 · #4 day 22
  - draws `envcurve`
- **crescCurve** *(a variant of curve)* — colour **limeGreen #99FF00** · *composer* · D42 · #4 day 35 · LGMF 2d.3
  - draws `cresccurve` `cresccurve[level]`
- **glissCurve** *(a variant of curve)* — colour **brightOrange #F04B00** · *composer* · D42 · #4 day 35
  - draws `glisscurve`

### Page furniture

- **staff** — colour **ink #111** · interStaffSs **6** → `layout.grandStaff.interStaffGapSs` · lineThicknessSs **0.1** · *composer* · #5 2a.1 (the grand staff's gap) · #2 dimensions_table
  - draws `staff` · in: lineThicknessSs glyphs.json standards.staff
- **clef** — face **music** · colour **ink #111** · *lilypond* · #4 V0.10 · #5 2a.1
  - draws `clef`
- **partLabel** — face **text** · size **1.1** → `render.partLabel.sizeSs` · colour **muted #8a8a8a** · *composer* · #5 2026-09-11 (centred on the middle line)
- **reshow** — face **text** · size **0.75** → `render.reshow.sizeSs` · colour **muted #8a8a8a** · *census* · #4 V0.10 (the continuation label at a page start)

### Animated (anchor F)

- **cursor** — colour **cursor #FF15A0** · wPx **3** → `animated.cursor.wPx` · *composer* · #4 D48 (provisional, judged live)
  - draws `anim:cursor`
- **gcBall** — colour **gc rgb(255, 21, 160)** · *composer* · #4 day 23 (piece #1's ball, one copy with the arc)
  - draws `anim:gc`
- **meter** — colour **limeGreen · brightOrange** · wPx **8** · gapPx **3** · *composer* · #4 D48 · D42's colours
  - draws `anim:curveMeter` `anim:crescMeter` `anim:glissMeter`
- **pie** — colour **pie #607D8B** · radiusPx **9** → `animated.motivePie.radiusPx` · topPx **14** → `animated.motivePie.topPx` · *AI* · CURVE_LOOK §7 · LGMF 2d.4 (the AI's colour, his to reverse)
  - draws `anim:motivePie`
- **followerDot** — colour **brick · envFollower** · *composer* · #4 D48
  - draws `anim:curveFollower` `anim:envFollower`
- **lineWedge** — colour **lineWedge #8a6d3b** · *census* · #4 D48 (disabled)
  - draws `anim:lineWedge`

---

## 4 · THE COLOURS AND THE FACES

THE COLOURS (§427 · §428): ink #111 for every music mark; `muted` for PAGE FURNITURE only (labels, the reshow, the markers) — no colour may come from a code default (gate 3). `techText` and the grey of the numbers are what drew on 2026-09-27; §427 makes both ink at 2e.3 (3) · (4).

- **ink** `#111` → `render.ink` · `render.ringBar.color` — every music mark · *composer* · #4 V0.10 · §427
- **muted** `#8a8a8a` → `render.muted` — page furniture only (§427); today also the default of a text item with no colour (A5 — ended at 2e.3) · *composer* · #4 V0.10 · §427 A5
- **paper** `#fff` → `render.paper` — the page · *census* · #4 V0.10
- **brick** `#4E7A9B` → `render.brick` · `animated.curveFollower.color` — the brick · the curve follower · *composer* · #4 V0.10
- **alert** `#c00` — the red 'out of range' idiom (#5) — a warning, never a music mark · *composer* · #5 (the written-out range)
- **goLine** `#333` → `render.goLine.color` — the go line · *composer* · #4 day 22 ('always black gray')
- **gc** `rgb(255, 21, 160)` → `render.gc.color` · `animated.gc.color` — the GC's arc, impact and ball · *composer* · piece #1 ColorMap neonMagenta · #4 day 23
- **cursor** `#FF15A0` → `animated.cursor.color` — the cursor · *composer* · #4 D48
- **limeGreen** `#99FF00` → `render.envCurve.color` · `render.crescCurve.color` · `animated.curveMeter.color` +1 — the level: the env and cresc curves, their meters · *composer* · D42 (#2 ColorMap limeGreen)
- **brightOrange** `#F04B00` → `render.glissCurve.color` · `animated.glissMeter.color` — the glissando curve and its meter · *composer* · D42 (#2 ColorMap brightOrange)
- **envFollower** `#2E8B57` → `animated.envFollower.color` — the env follower · *census* · #4 D48
- **lineWedge** `#8a6d3b` → `animated.lineWedge.color` — the line wedge (disabled) · *census* · #4 D48
- **pie** `#607D8B` → `animated.motivePie.color` — the breath pie · *AI* · LGMF 2d.4 (the AI's call, his to reverse)

THE FACES (§428): Crimson Pro Light upright / Light Italic for words and numbers; Emmentaler (LilyPond 2.24.4) for music. `emPerSs` is the text's em in staff spaces (render's textScale): a text item's size × emPerSs = its em.

- **text** — family **'Crimson Pro Light', serif** → `render.fontFamily` · italic **Crimson Pro Light Italic** · emPerSs **1.3** → `render.textScale` · slashTopEm **0.711** → `layout.devices.byEnv.sequence.block.slashTopEm` · *composer* · #4 typography (LilyPond textFontName of #1 and #2) · slashTopEm: the '/' measured, §383
- **music** — family **Emmentaler (LilyPond 2.24.4, baked into glyphs.json)** · *lilypond* · #2 · #4 V0.10

---

## 5 · THE PAGE — the edge classes (`notation/registry/page_rules.json` `edge`)

Every drawn kind names what happens at a page edge: on SCREEN `cut` (clipped like paper) · `clamp` (moved right of the edge) · `atomic`
(a go-time indicator, never moved) · `furniture`; on PAPER `whole` · `stub` · `continue` · `never-sever` · `furniture` · `none` (animated).

| kind | screen | print |
|---|---|---|
| `glyph` | clamp | whole |
| `rest` | clamp | whole |
| `stem` | clamp | whole |
| `dot` | clamp | whole |
| `ledger` | clamp | whole |
| `text` | clamp | whole |
| `barline` | clamp | whole |
| `tempotext` | clamp | whole |
| `glissline` | clamp | whole |
| `niente` | clamp | whole |
| `dynarrow` | clamp | whole |
| `ottava` | clamp | whole |
| `lvslur` | clamp | whole |
| `attackline` | atomic | whole |
| `tick` | atomic | whole |
| `goline` | atomic | whole |
| `gc` | cut | whole (before) |
| `beam` | cut | never-sever |
| `tuplet` | cut | never-sever |
| `envcurve` | cut | continue |
| `cresccurve` | cut | continue |
| `glisscurve` | cut | continue |
| `ringbar` | cut | stub |
| `brick` | cut | stub |
| `staff` | furniture | furniture |
| `clef` | furniture | furniture |
| `anim:cursor` | atomic | none |
| `anim:gc` | cut | none |
| `anim:curveFollower` | clamp | none |
| `anim:envFollower` | clamp | none |
| `anim:curveMeter` | clamp | none |
| `anim:glissMeter` | clamp | none |
| `anim:crescMeter` | clamp | none |
| `anim:lineWedge` | clamp | none |
| `anim:motivePie` | clamp | none |

---

## 6 · THE LADDER (the exceptions) — the table; the behaviour is built at 2e.4

LAYER 5 — THE EXCEPTIONS: LADDER v2 (§422 · §423), run by the layout per unit; the rung reached is written on the item (`fit: { rung, by }`). Rung 8 is an override ON THE EVENT with five fields (the object · the property, one that exists in these tables · the value · the rung it failed at · his § and date) — never in code, never prose-only; the same override recurring is the promotion signal. BUILT at 2e.4 (until then: the table, not the behaviour).

- **0 standard** — the standard placement; a spill into the inter-lane gap accepted if nothing is touched
- **1 compress** — the stack 0.45 → 0.30 → 0.20 · floor: never under the mark's own `parent`
- **2 shrink** — one size step (÷ 1.122): text · dynamic · a cue head
- **3 flip** — to the free side
- **4 nudge** — the horizontal micro-nudge
- **5 rebalance** — the per-page lane rebalance
- **6 octave** — the octave device for a ledger tower
- **7 staffSize** — per-page staff size · the global C-switch
- **8 manual** — an override on the event, five fields; the page marks it red until the override exists

The size step: ×1.122462 (LilyPond's font-size step 2^(1/6) (§428)) · the compressed stack: 0.45 → 0.3 → 0.2 · §422 · §423 · §426 (the decisions-needed list)

---

## 7 · OVERRIDES IN FORCE

Every `engraving` overlay on an event (the per-event hands: `stemDir` · `dxSs` · `dySs` · `beamBreak` · `device` …) in the notation
files the picker lists. A rung-8 override carries five fields (the object · the property · the value · the rung · his § and date).

- none

---

## 8 · DECISIONS NEEDED

The open rows of the tables (two candidate values, a rule that is not yet the drawing) and — from 2e.4 — the ladder's per-page report
(`node tools/decisions_needed.js`). Each is brought to him as a question with its options; his pick becomes the row (or a rung-8
override) and the entry leaves the list (§426).

- **DN-1 the accidental's two gaps** — one object, two distances to its head: 0.25 (`beside` — the morph header, the sequence block, the onset head) and 0.10 (`besideUnit` — the nh-unit and the chord column, #2's D.6); both clear a ledger inside the sign's height since 2e.3 (7), and both draw today, so the row holds both (A7, §419); one value would move the ink of one family · options: keep both (a column packs tighter by design) · 0.25 everywhere · 0.10 everywhere · §419 A7 · census §448
- **DN-2 anchor C's gap** — the strike family (strike · staccato · jeté · bartók · slap · T. R.) hangs its head 0.6 before the go line; fortepiano and cuivré — also GC units — carry no gap of their own and take B's 0.25 plus a push clear of the impact marker only when the head reaches it (#4 day 24) · options: keep (the push is conditional on purpose) · 0.6 for every GC unit · #4 day 23 · day 24 · census §448
- **DN-3 the window view's looks** — the notation app's window view (⚙, not the video view) passes only the three curve looks to the renderer; every other look there is render.js's code default — the tuba's V0.10 numbers (the ring bar at opacity 1 against the table's 0.65, the env curve's default green against D42's where not passed …). The video view and both exporters read the table · options: the window view reads the whole table too · leave it (a working view) · notation.html (the window view, §447 D42's note) · census §448
- **DN-4 the clocks over the block at its go time** — at a block's go time the cursor stands on the go line, so the devices that trail it — the breath pie (lane top) and the level meter — sit over the block's column and its legend (on the proto at 0 s: the pie over "senza vib.", the meter over the mp) until the cursor has carried them clear, about half a second; found at 2e.3 in the exporter's own frame (RUNNING_LOG §450) · options: accept (a moment; the cursor moves on) · the pie and the meter wait RIGHT of the cursor until the block is passed · the pie moves to the lane top right of the cursor · §411 (the devices trail the cursor) · §418 (the block before the line) · 2e.3
- **DN-5 the provisional family look** — the technique table's two family devices (techniques.json familyDevice oneshot · sustained — 2a's page: every technique the registry does not name, the percussion's among them) put the head before x(t) at anchor B's spacer with NO go line: the head is off its time and nothing marks the time. check_rules (6) reports them by name. Each technique's own device sheet settles it (the percussion's note unit is next); until then the page is the bricks page · options: a go line on the family look (B whole) · the head on its time (anchor A, no line) · leave until each device sheet · §414 (the anchor principle) · 2a (the family look) · RUNNING_LOG §450

