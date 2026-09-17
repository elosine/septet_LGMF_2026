> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/CURVE_LOOK.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated.

# The curve look — the standard for every curve drawn on a score

*D42, the composer, 2026-09-13 (RUNNING_LOG §446–§447). Carry it forward with the engine: this piece, piece #4's rehearsal and
performance scores when they are made, and every piece after. Sizes of glyphs are in `docs/GLYPH_SIZING.md`; this is its sibling
for the filled curves.*

> *"Okay. Let's record this as the standard. for these curves. We're also using it in the morph section of the tuba piece. So I need...
> when I actually make... it's too late for the presentation score, and that's fine. But when I actually make the rehearsal scores and the
> final performance score, I want these standards in there as well and across the board here. So for the morph section. while we're at
> it, can we look up the bright orange In the two piano two percussion score as well. and let's use that standard for the morph section in
> this piece and then moving forward in the tuba, this piece, and other pieces."* (composer, 2026-09-13)

---

## §1 Where it comes from

Piece #2 (*composition for two pianos and two percussion*), its final performance score: `builds/performance/index.html` +
`builds/performance/score.json` (built 2026-05-28, served by `scripts/performance_server.js` on :3001). Its curves —
`score.databases.curves.curves`, 148 of them — are drawn by `renderCurve`. Every one of them uses the same form; only the colour differs.

## §2 The form — ONE closed path

| attribute | value | note |
|---|---|---|
| shape | the curve's line, down its end edge, along the band's baseline, up its start edge — closed (`Z`) | `fillMode: bottom` in #2 |
| `fill` | the colour | |
| `fill-opacity` | **0.3** | |
| `stroke` | the same colour | the outline goes round the WHOLE shape — top, both ends, baseline |
| `stroke-width` | **2 px** | at the video frame (1920 × 1080); scales with the page |
| `opacity` (on the path) | **0.3** | applied to fill AND stroke together |

**What the eye sees:** the interior at **0.3 × 0.3 = 9 %**, the outline at **30 %** — a faint body with a clear edge. The "border" is
the stroke, three times as strong as the fill, because the path opacity multiplies a fill that is already at 0.3.

### §2a The density and the floor (2f.7, 2026-09-13 — the trills; RUNNING_LOG §450–§451)

- **Density: 100 samples per second**, never fewer than 101 — piece #2's own number (`generateCurveDataArray` bakes every curve at 100/s;
  the page joins them with straight segments). A fixed count per curve is the fault: 101 over a 17 s trill drew 28 px corners at the video's
  160 px/s. In the septet: `notate_section --trillRate 100`.
- **The floor: 1 of 10.** Level v is drawn at **0.1 + v × 0.9** — zero never blanks out, a low stretch keeps a body, the top stays at the top.
  Drawing only; the meters ride the same samples. NO earlier piece drew one (#2's curves leave 0 at once; the tuba's swells never sound
  below 0.2). In the septet: `devices.byEnv.trill.curveFloor: 0.1`. **Provisional until the composer's eye on the page.**

## §3 The colours, by role

| colour | hex | #2's use | the standard's use |
|---|---|---|---|
| **limeGreen** | `#99FF00` (#2 ColorMap `rgb(153,255,0)`) | 67 curves — the zone-dynamics swells (the opening piano tremolo, `pcrv-wc9-zn25-p1`) | **dynamics**: trills (the septet), surges and swells, the morph crescendo |
| **brightOrange** | `#F04B00` (#2 ColorMap `rgba(240,75,0)`) | 81 curves, 369–566 s (around 6:37 among them) — the accel / decel zones; all 81 identical, `opacity: 0.3` | **the morph glissando** (pitch) — the septet's and forward |

Piece #1 (the string quartet) is where both colours were named: limeGreen its crescendo colour, brightOrange its glissando colour.

## §4 In this engine (the septet's notation layer, ported from piece #4)

- **Registry** `notation/registry/container.json → engraving.render`: `envCurve` (trills, surges), `crescCurve` (the morph crescendo),
  `glissCurve` (the morph glissando) each carry `color`, `fillOpacity 0.3`, `strokeWPx 2`, `strokeOpacity 1`, `pathOpacity 0.3`.
- **Render** `notation/lib/render.js → curvePathD42()`: a curve entry that has `pathOpacity` is drawn as the one closed path above; an entry
  without it keeps the old fill-only drawing (so piece #4's staged batteries, which render with the code defaults, are unchanged).
- **The app**: the video and zoom views pass the whole render registry; the notation (window) view passes these three entries.
- **Proof**: `tools/test_trills.js` (the D42 block) — the registry values, the path's attributes, and the code-default look untouched.

## §5 For piece #4 and the pieces after

Piece #4 (`for_seven_tubas`) is read-only from this repo. When its rehearsal and performance scores are built: port `curvePathD42` and the
three registry entries (its morph section already uses these two colours, at fill 0.22 with no outline — D42 replaces that). Its
presentation score (the Penn State submission) stays as delivered — *"it's too late for the presentation score, and that's fine."*
A new piece starts with this file.

## §6 The meters — the curve follower at the cursor (APPLIED, D42 · RUNNING_LOG §448)

Piece #2's `_drawCurveFollower` (`builds/performance/index.html`), per lane, while a curve covers the cursor time:

| attribute | value |
|---|---|
| width | **8 px** |
| position | its RIGHT edge **3 px left of the cursor's centre** (#2: `meterX = cursorX − 11`, width 8) |
| outline | the full lane height (the "tube" — the top is max loudness), the curve's colour, **1.5 px**, alpha **0.8** |
| fill | from the lane bottom up to the current level, the curve's colour, alpha **0.3** |
| order | the FILL first, the outline drawn over it |
| colour | the colour of the curve it rides — limeGreen for dynamics, brightOrange for the glissando |

In this engine: `animated.curveMeter` (full lane — the trills), `crescMeter` (the morph crescendo), `glissMeter` (the morph glissando) —
`wPx 8 · gapPx 3 · outlineWPx 1.5 · outlineOpacity 0.8 · fillOpacity 0.3`; `notation/lib/animobj.js` draws fill, then outline.
*Superseded:* piece #4's fill 0.6 (its day-36/39 raise, so the staff lines would not read through a 30 % fill).
The cursor itself was already #2's: 3 px, neon magenta `#FF15A0`, the whole track height (`animated.cursor`).

## §7 The motive pie and the line-wedge meter — the spec from piece #2 (RECORDED, not used in the septet)

*The composer, 2026-09-13: "you can grab the pie wedge spec as well even though we aren't using it in this piece". In the septet both
stay OFF (`animated.motivePie.enabled` / `lineWedge.enabled` false, §401m). Piece #4's ports differ from #2 — use THIS spec when either
device is wanted.* Both are drawn per lane at the cursor, from `builds/performance/index.html`.

**The motive pie** (`_drawMotivePie`) — a clock counting down the active item (a motive in the lane, else the curve covering the time):
- box: a square of side **staffHeight / 4**; x = cursorX − 11 − side − 2 (just left of the meter, 2 px gap); y = the lane top
- circle: centred in the box, radius **side / 2 − 1**
- the REMAINING part filled: the sector from the progress angle round to 12 o'clock, clockwise; **the item's colour at alpha 0.3**; full
  circle at the start, empty at the end
- the clock hand: centre → the progress angle (12 o'clock = 0), **black, 1 px, round cap**
- a **black 1 px square border** round the box
- progress = (t − start) / (end − start)

**The line-wedge meter** (`_drawLineWedgeMeter`) — a donut ring counting down a line-wedge's span:
- box: a square of side **staffHeight / 3**; x = cursorX − side (touching the cursor); y = the lane top
- border: **#555, 0.5 px**, round the box
- the ring: outer radius **side / 2 − 1**; ring width **0.35 × outer radius**, drawn at mid radius; **black at alpha 0.7**, butt caps; the
  REMAINING arc from the progress angle round to 12 o'clock, clockwise
- the wedges it counts (#2's `databases.lineWedges`, 38) carry their own colour and opacity on the page (navyBlue 0.3 · black 0.4 ·
  brightGreen 0.7 · lavander 0.7); the meter itself is always black

## §8 Register (append-only)

- **2026-09-13 — D42** — the standard adopted from piece #2's final performance score; applied in the septet to `envCurve` (the trills;
  was the tuba's `#2E7D32`, fill 0.3, no stroke), `crescCurve` and `glissCurve` (were fill 0.22, no stroke). RUNNING_LOG §446–§447.
- **2026-09-13 — D42, the meters** — `curveMeter` · `crescMeter` · `glissMeter` to #2's follower: fill 0.6 → 0.3, the fill drawn before
  the outline. The motive pie and the line-wedge meter recorded as #2's spec (§7), not enabled. RUNNING_LOG §448.
- **2026-09-13 — 2f.7** — the density (100 samples per second) and the drawn floor at 1 of 10, on the septet's trills (§2a). The morph
  crescendo not yet — his word. RUNNING_LOG §450–§451.
