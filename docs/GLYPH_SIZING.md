> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/GLYPH_SIZING.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated.

# Glyph sizing — the standards, how each was found, and what to compare a new glyph to

*Opened 2026-09-13 at the composer's word (RUNNING_LOG §430), for this piece and the ones after it. Carry it forward with the engine.
Its sibling for filled curves (colour, fill, outline): `docs/CURVE_LOOK.md` (D42).
The sizes themselves live in `notation/lib/glyphs.json` (each with `_provenance`); the tweakable factors are registry data
(`container.json → engraving`, per `notation/GLYPH_EXTENSION_CONTRACT.md`). This file is the WHY and the compare table.*

> *"as I work through this piece and in future pieces, we'll need to work a lot of this spacing and sizing types of things out ...
> when we come across new things to capture or in future pieces, new things to make, we understand what sizing analysis has been
> done already and what types of things to compare it to."* (composer, 2026-09-13)

---

## §0 The one rule

- Every glyph's size is recorded in **staff spaces (ss)**, with a provenance saying how it was measured.
- A new glyph joins a **family** (§2). The family gives the scale factor. Nothing is sized by eye alone.
- If it fits no family, it starts one: measure stock, measure what it will sit beside, choose a factor, write down why (§4).
- The factor is **data**, never a code constant — so it can be adjusted after the first look on the page.

---

## §1 The frame — where the numbers come from

- **The unit:** 1 ss = the gap between two staff lines. The staff is 4 ss tall. Pixels exist only at render.
- **The font:** LilyPond 2.24.4's Emmentaler (`emmentaler-20.otf`; the piano brace from `emmentaler-brace.otf`).
  In the font, 1 ss = unitsPerEm / 4. Reading a glyph's box from the font at that scale gives its **stock** size.
- **Two ways a size was found:**
  - **A LilyPond probe.** A tiny `.ly` file rendered at a chosen `font-size`; the SVG measured. This is how #2 did it
    (its `oracle/probes/`, the 10-step Just-In-Time Glyph Capture Workflow) and how the tuba's `lp_probes` fixtures did it.
    Needed whenever LilyPond ASSEMBLES the glyph (dynamics are composites of letters; `Ped.` is P + e + d + dot; text with ligatures).
  - **Straight from the font.** fontTools reads the outline and box at stock size; a factor is applied as data.
    `tools/glyph_scripts.py` (scripts, ornaments) and `tools/glyph_emmentaler.py` (clefs, bracket tips, the brace). Since 2026-09-11.
- **LilyPond's font-size arithmetic** — the key to the numbers below. A `font-size` of *n* scales the glyph by **2^(n/6)**:

  | font-size | factor vs stock |
  |---|---|
  | 0 | 1.00 (stock) |
  | −2 | 0.794 |
  | −3 | 0.707 |
  | −6 | 0.50 |
  | −8.5 | 0.374 |

---

## §2 The families — the current standards and what to compare to

| family | setting / factor | members here (w × h ss) | decided | compare a NEW glyph to |
|---|---|---|---|---|
| **Noteheads** | `NoteHead.font-size = #-2` → 0.794 | filled 1.04 × 0.88 · open 1.11 × 0.88 | #2 D.3, 2026-05-02: corpus survey (−2 in 567 LilyPond files), then a visual compare; −2 chosen | anything that behaves as a note: cue heads, the trill's neighbour head, cluster boxes |
| **Rests** | `Rest.font-size = #-2` (the notehead size) | rest4 0.86 × 2.30 · rest8 0.81 × 1.49 · rest16 1.05 × 2.29 · rest32 1.22 × 3.09 | tuba port 2026-08-22, LP fixture | any rest |
| **Flags** | drawn at the notehead size | up8 0.89 × 3.01 · down8 1.13 × 2.80 · up16 0.89 × 3.51 · down16 1.13 × 3.01 | #2 s49 | any flag; stem length 10 ss + 1.0 ss flag clearance go with them |
| **Accidentals** | `Accidental.font-size = #-6` → 0.50 | sharp 0.55 × 1.50 · flat 0.47 × 1.25 · natural 0.37 × 1.53 · quarter / three-quarter variants | #2 D.6, 2026-05-04: corpus −4 vs −7; −6 chosen by side-by-side compare | any accidental; **parentheses round a notehead take LilyPond's TrillPitchParentheses size, font-size −4 = × 0.63 of stock** (= × 0.794 of the house head — they scale with the head, not the accidental; measured by `tools/fixtures/lp_probes/trill.ly`, §435) |
| **Dynamics** | `DynamicText.font-size = #-8.5` → 0.374 | ppp 1.82 × 0.66 · p 0.73 × 0.66 · f 0.81 × 0.97 · fff 1.63 × 0.97 · sfz 1.18 × 0.97 · fp · sfp · sfzp | #2 s49, 2026-05-10: corpus −8.5 in 450 of 792 files; locked | any letter dynamic (ffff, sffz …): same LilyPond probe, same −8.5. All f-family marks are 0.97 tall; p-family 0.66 |
| **Scripts (articulations)** | **stock** — no `Script.font-size` override | accent 1.50 × 0.84 · marcato 1.00 × 1.10 · snap-pizz 1.06 × 1.40 · `+` 1.10 × 1.10 | #2 s76, 2026-05-22 (stock, on a −2 notehead); septet §400, 2026-09-11 | marks that sit ON a note: tenuto, staccatissimo, harmonic circle, fermata → stock, beside the accent |
| **Ornaments** | **× 0.57** (first 0.70, the pedal's factor; then halfway to the sfz's height on the page) | `tr` stock 2.40 × 2.20 → **1.37 × 1.26** | septet §429–§430, 2026-09-13: stock `tr` is 2.6× the accent's height and taller than the stock `Ped`; #2 met the same with the pedal and chose 0.70. §439, the same day, on the page: "too big … halfway between what it currently is now and the sforzando size" — height 1.54 → 1.26 | mordent, turn, any sign that hangs OVER a note → measure against `tr` and `Ped.` |
| **Pedal** *(in #2, not here yet)* | × 0.70 at extract time (LilyPond's `SustainPedal.font-size` does not scale the glyph) | `Ped.` 2.43 × 1.40 · `*` 1.09 (stock `Ped` 3.20 × 2.00) | #2 s49 (composer's factor); s66 bbox fix | if the septet needs `Ped.`, take #2's paths and factor unchanged |
| **Text instructions** | Crimson Pro Light Italic at **1.0998 ss** | 8va 1.42 × 0.65 · 8vb 1.39 × 0.75 · 15ma 2.10 × 0.65 · 15mb 2.06 × 0.75 | #2 s49 (pizz.), s57 (ottava text) — the text baker | arco, con sord., jeté, slap, any word → the same baker, the same size |
| **Clefs** | **stock** (clef size follows the STAFF size, never the notehead size) | treble 2.57 × 7.32 · bass 2.69 × 3.10 · alto 2.72 × 4.00 | #2 s66; septet 2a (alto, treble from the font) | any clef, incl. small change-clefs → decide a factor then |
| **Bracket tips · brace** | stock | tips 1.86 × 1.56; the brace picks the nearest of LilyPond's own ladder (7.97 … 59.9 ss tall) | septet 2a, 2026-09-11 | — |
| **Procedural (no font)** | measured standards, not glyphs | staff lines · ledger lines · stems (LP default thickness, length 10 ss) · beams · the staccato dot · the GC arc · hairpins · the ottava bracket | #2 dimensions_table (with LP provenance); tuba NOTATION_STANDARDS | geometry drawn by the engine: take the thicknesses from `standards` in glyphs.json |

**Why the families differ so much** (the composer's question, 2026-09-13): LilyPond itself draws dynamics, scripts and clefs at
independent sizes; #2 then chose a reduced notehead (−2), a smaller accidental (−6) and a much smaller dynamic letter (−8.5) by
side-by-side compares against his own corpus of LilyPond scores, and left scripts and clefs stock. Every later glyph was sized by
asking "which of these does it belong with?" — the tuba port kept all of it unchanged, and the septet has added only scripts (stock)
and, today, the first ornament (0.70).

---

## §3 The spacing standards that go with the sizes

| standard | value | origin | where it lives here |
|---|---|---|---|
| vertical clearance between stacked elements above / below the staff | **0.45 ss** | #2 s49: LilyPond's own gap measured at 0.451 ss on a real page; locked | `stackGapSs 0.45` in the strike chain (NOTATION_STANDARDS §1) |
| accidental → notehead gap | **0.10 ss** | #2 D.6: LilyPond's 0.35 tightened by compare | `standards.accidental` in glyphs.json |
| clef → first content | 0.45 ss (leftmost-ink-aware) | #2 dims `clef.toContentGapSs` | engraving |
| stem length · flag clearance | 10 ss · 1.0 ss | #2 s49, five-way visual compare | `standards.stem` |
| the strike's dot | 0.15 | tuba staccato device | `devices.byTechnique.staccato` |

A new glyph inherits these: it stacks at 0.45 ss from its neighbour and takes its fine offset through `dxSs` (the contract).

---

## §4 The procedure for a new glyph — what to do, in order

1. **Name it.** The Emmentaler glyph name (`scripts.trill`, `pedal.Ped` …) or the text string.
2. **Pick the family** from §2. That gives the factor. Say which row it joins and why.
3. **No family?** Then: read the stock size from the font · read the sizes of the two or three things it will sit next to
   (a notehead, the accent, the fff, the pedal) · state the ratios · choose a factor · write the reason. That is a new row in §2.
4. **Extract** — from the font with `tools/glyph_scripts.py` when it is a single glyph at a factor; with a LilyPond probe
   (#2's 10-step workflow) when LilyPond assembles it.
5. **Record** — `wSs`, `hSs`, anchors and `_provenance` in `glyphs.json`; the factor in the registry, not in code.
6. **Judge it on the page** — the first instance in the running app, beside its neighbours. Adjust the factor as data.
7. **Log** — a RUNNING_LOG entry with the numbers, and a line in §5 below.

---

## §5 The register of sizing decisions (append-only)

- **#2 D.3 (2026-05-02)** — noteheads at −2 (0.794), from a corpus survey + compare.
- **#2 D.6 (2026-05-04)** — accidentals at −6 (0.50); the 0.10 ss gap.
- **#2 s49 (2026-05-10)** — dynamics at −8.5 (0.374) · pedal × 0.70 · stem 10 ss · flag clearance 1.0 · the 0.45 ss stack gap · pizz. text at 1.0998 ss.
- **#2 s57** — ottava text as baked text glyphs; the bracket procedural.
- **#2 s66 (2026-05-18)** — clefs stock (clef follows staff size); the pedal bbox corrected to the true ink.
- **#2 s76 (2026-05-22)** — scripts stock, on a −2 notehead.
- **tuba port (2026-08-22)** — the whole set carried over unchanged; fp · sfp · sfzp added at −8.5; rests at −2 (`tools/port_glyphs.js`, `glyph_probe_dyn_extra.js`).
- **septet §400 (2026-09-11)** — snap-pizz and `+` from the font at stock (`tools/glyph_scripts.py`). *Note:* the tool's own header
  records that #2 and the quartet drew the snap-pizz at −3 (0.707); here it is stock. On the page since 2026-09-11 — if it reads heavy
  beside the accent, the factor is the fix, as data.
- **septet 2a (2026-09-11)** — treble and alto clefs, bracket tips and the brace ladder from the font, stock.
- **septet §429–§430 (2026-09-13)** — the first ornament: `tr` at × 0.70 = 1.68 × 1.54 ss (composer: option A, the pedal's factor).
  Parentheses for the trill's neighbour head to scale with the head (0.794) — provisional until the first trill is seen.
- **septet §435 (2026-09-13)** — the pitched-trill group measured from LilyPond (probe `trill.ly`): parens and neighbour head at font-size −4
  (× 0.63 of stock; the neighbour head = the house head × 0.794), group padding 0.30, paren inner 0.42, neighbour accidental gap 0.20.
  **Corrects §429–§430:** the parens are × 0.63 of stock, not × 0.794 of stock. LilyPond's natural on every trill pitch not taken (the house prints no naturals).
- **septet §439 (2026-09-13)** — `tr` 0.70 → **0.57** at the composer's eye on the first trill: its drawn height halfway between 0.70's (1.54 ss) and
  the sfz's (0.97 ss) → 1.37 × 1.26 ss. The lesson for the next ornament: the pedal's factor was a good START, and the page decided — compare a
  sign that hangs over a note with the dynamic under it, not only with the pedal.
