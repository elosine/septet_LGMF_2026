# APPROVED 2026-10-03 — _Recombination_, Draft 01: the print score

**Composer, 2026-10-03, on the last page with the final barline:** *"That looks good. … And actually the proofread is good. So this is the
keeper score with the final bar line. So go ahead and make the final print score."*

The print score of the Lake George septet (_Recombination_, Draft 01) — the cover, one page of performance instructions, 86 pages of music.
PLAN § `2b-P` (steps 1 … 6), RUNNING_LOG §764 … §773.

## The file

**`Recombination-score-JYang.pdf`** — **88 pages** (cover + 1 + 86) · A3 landscape (1189.92 × 840.96 pt, inside DIN A3) · 5 248 893 bytes (5.01 MB).
`cmp`-verified byte-identical to `print/score/Recombination-score-JYang.pdf` at archive time.
sha256 `5fb06ae14aa0368257140c245ebe05414478e8cd7152049560edb44a0f0181e0`.
**Not in git** (`print/score/**/*.pdf` is ignored) — this README and `cover.json` are; the PDF lives on this machine. Back it up.

## What made it

| | |
|---|---|
| the page | MAIN `notation/ir/piece-lgmf.ir.json` at `2d9a5fc` — 1075 events, window 0 … 881 s, sha256 `942815d9…3f6a184e` — **the filmed page**: identical to the file at the tag `Recombination-Draft01-film_1.0` (`git diff` empty). The IR was NOT rebuilt |
| the save behind it | `scores/piece-Recombination-Draft01-done.json` as saved 2026-10-01 21:33 UTC (his save) |
| the sheet | A3 landscape, the house format of pieces #4 and #5, kept at his word (LG-328) · margin 12.7 mm · music 394 × 258 mm · staff 7.55 mm |
| the density | 10.32 s of music per page — the film's own (his "Bb", LG-331) → 86 pages for 881 s |
| the frame | the ensemble realized `video-jury` (in C): EH · Bsn · Hn · Tpt · Perc · Vib · Vc · DB — 8 systems, 14 labels, 3 brackets, 1 brace |
| page 1 | as it prints: opens at −0.49 s, no 4 s lead-in on paper (his "Ca") |
| the cover | `cover.json` (a copy is beside this file): **Recombination** / *for English horn, bassoon, horn, trumpet,* / *percussion, cello and double bass* (two rows, his "Ab") / **Justin Yang** — `print/cover/make_cover.ps1`, face EngraversGothic BT (a system font — machine-dependent) |
| the instructions | `docs/notation_instructions/index.html`, one page (his "Da"; measured: col 1 936 · col 2 795 of 980) · the demo link `https://youtu.be/xPOLvA6BEsk` kept as a PDF annotation |
| the ending | **the final barline** — thin 0.19 · gap 0.30 · thick 0.60 ss (LilyPond 2.24.4's `"|."`: hair 1.9 · kern 3.0 · thick 6.0 × a line-thickness of 0.1 ss), ink, opaque, from the top staff's top line to the bottom staff's bottom line (`rules.json` `objects.finalBarLine`, §772) |

**Command:** `bash print/score/build.sh` (≈ 7 min; no `--rebuild-ir`) — the two checks before, `node tools/export_print.js --ir piece-lgmf --cover on
--instructions on --out print/score/Recombination-score-JYang.pdf`, the three checks after.

## Measured, not asserted — the five gates, all green on this file

- **frame** (`check_print_frame --at 100,300,600,870`): the print frame is the video frame at 4 moments — 8/8 systems, the 14 labels, 3 brackets,
  1 brace; the census identical in every system (250 · 462 · 227 · 184 elements).
- **front** (`check_print_front`): the cover's title 527 pt drawn / 530.3 measured, 4 lines, the widest 1077 of 1190 pt, drift 1.7 %; the
  instructions' columns fit; nothing clipped.
- **pdf** (`check_print_pdf`): 88 pages · the sheet inside DIN A3 · 5 font programs embedded + 4 as outlines, 0 not embedded · 0 raster images · 1 link.
- **pages** (`check_print_pages`): 86 music pages (3 … 88), the full frame, a ruler and a folio on every one; the final barline (thin + thick,
  opaque) once, on page 88.
- **edges** (`check_print_edges`): 5293 point items each owned once · 772 long items · 68 pages full, 17 pushed (68 objects moved whole), 0 forced ·
  2 pages end more than 0.5 s early, at most 0.73 s · no timed ink in the clef gutter, none past the system end · 60 GC arcs = 60 strikes · 629
  curve paths, none from a neighbouring page.
- **his eye: the proofread good; "this is the keeper score with the final bar line".**

## What his eye found on the way (all fixed before this file)

1. the proofs (step 4, LG-331): the cover's ensemble line on two rows · the film's density · page 1 kept · the instructions on one page
2. the whole file (step 5, LG-332): the ending was the screen's grey page-edge bar — now the final barline (§772)

And the gates, at the exporter's first run on this piece (step 1, §766): a beat frame's band in the gutter and a grace severed from its note —
both fixed in the plan of the cut.
