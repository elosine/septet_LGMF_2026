> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/PANEL_CAPTURES.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated.

# PANEL CAPTURES

Settings the composer asked to have kept, read off the panel and written down verbatim. **Append-only**, newest last.

**What this file is and is not.** It is a written record — enough to dial the panel back by hand, and enough for the AI to reconstruct
a render. It is NOT the panel's own save: **`Save as ACTUAL` in the morph panel** captures the resolved parameters, the engine
constants and every rendered object, which no transcription can. When a setting matters enough to return to, press that; use this file
for the ones caught in passing, and for anything you want a human to be able to read.

---

## 2026-09-09 · BLOOM + fade-in-slow, at 183 s

> *"and then just capture these settings for me pls"*

Caught from three screenshots of the MORPH panel while the fade was being tested (RUNNING_LOG §319). The panel read **playing 93
notes**; the score behind it stood at **183.00 s**.

### The model and the take

| | |
|---|---|
| **mode / model** | MODELS · **BLOOM** (ACTUALs shows 11 kept) |
| **sonority** | `#29 · 44.77 s` — C5 G6 A5 C#5 D5 A#5 F#6 G#4 |
| **root** | A#2 |
| **take** | random (seed) · **k 1** · **seed 20** · per pair **one, doubled** |
| **taken** | **C#5 · A5 · G6** |
| **dropped** | G#4 · C5 · D5 · A#5 · F#6 |

**BEATING BLOOM · stock**, with **slower / longer ✔ at 0.64**:

> Unison pairs splitting apart. Beating grows from zero; faster in the higher pairs (2.6 / 3.5 / 4.6 / 6.2 Hz at full separation), so
> the texture opens upward.

### The dials

| | | | |
|---|---|---|---|
| pace: gliss (s) | **42** | bias −1…+1 | **0.3** |
| duration (s) | **100** | spread 0…1 | **0.35** |
| release (s) | **12** | depth 0…1 | **1** |
| segment (s) | **8** | dyn amount | **0.42** |
| | | dyn shape | **swell** |
| | | seed | **33** |

### The cast

| pair | players | pitches |
|---|---|---|
| 1 | Vc + BCl | C#5 · C#5 → C#4 · C#4 ↓ |
| 2 | Vn1 + Va | A5 · A5 |
| 3 | Fl + Vn2 | G6 · G6 |

### The shape — `fade-in-slow`

| | |
|---|---|
| len (s) | **25.2** — resolved, `0.6 × 42` |
| len % of span | **0.6** |
| how | **fade** |
| entry | **together** |
| order | low-first |
| curve | **linear** |
| from 0…1 | **0** |
| peak ≥1 | 1 |
| release block | none |

```json
{
  "model": "BLOOM",
  "shapePreset": "fade-in-slow",
  "carrier": { "span": 42, "duration": 100, "release": 12, "segLen": 8 },
  "dials": { "bias": 0.3, "spread": 0.35, "depth": 1 },
  "dyn": { "amount": 0.42, "shape": "swell" },
  "seed": 33,
  "pitch": {
    "sonority": "strikes #29 · 44.77 s",
    "notes": ["G#4", "C5", "C#5", "D5", "A5", "A#5", "F#6", "G6"],
    "root": "A#2", "take": "random (seed)", "k": 1, "seed": 20, "perPair": "one, doubled",
    "took": ["C#5", "A5", "G6"], "dropped": ["G#4", "C5", "D5", "A#5", "F#6"]
  },
  "beating": { "model": "BLOOM", "variant": "stock", "slowerLonger": 0.64 },
  "pairs": [
    { "n": 1, "a": "Vc", "b": "BCl", "pitch": "C#5·C#5 → C#4·C#4 ↓" },
    { "n": 2, "a": "Vn1", "b": "Va", "pitch": "A5·A5" },
    { "n": 3, "a": "Fl", "b": "Vn2", "pitch": "G6·G6" }
  ],
  "shape": { "attack": { "lenPct": 0.6, "len": 25.2, "mode": "fade", "entry": "together",
                         "order": "low-first", "curve": "linear", "from": 0, "peak": 1 } }
}
```

**Not visible in the screenshots, and therefore not captured:** any PAIRS beyond the third (the list was cut off at "pair 3"), the
beating panel's per-pair detail, and anything below the SHAPE · release heading. The pairs' seat assignments are the panel's live
cast, which a re-deal would change.
