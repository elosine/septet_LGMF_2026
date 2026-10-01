# APPROVED 2026-10-01 — _Recombination_, Draft 01: the film of the presentation score

**Composer, 2026-10-01, on the render `-r4`:** *"Okay, that video is good."*

The animated presentation score of the Lake George septet (_Recombination_, Draft 01) — the wide shot with close-ups.
PLAN § `2b-F` (steps 1 … 6), RUNNING_LOG §687 … §700.

## The file

**`V-CUT.mp4`** — 1920 × 1080 · 30 fps · h264 crf 16 + AAC 256 k · **890.664 s** (the 4 s lead-in + the WAV's 886.664) · 65 233 541 bytes.
`cmp`-verified byte-identical to `notation/video/renders/Recombination-Draft01-V-CUT-seed7-r4.mp4` at archive time.
sha256 `ee501e8643c1bef28c9d11cd53caf08fe4828cd53c31c46ae4a01970cd675c84`.
**Not in git** (`notation/video/**/*.mp4` is ignored) — this README and the cut list are; the video lives on this machine. Back it up.

## What made it

| | |
|---|---|
| score | `scores/piece-Recombination-Draft01-done.json` as saved 2026-10-01 21:33 UTC (his save; the trumpet at 367.80 in unison, §697) → MAIN `notation/ir/piece-lgmf.ir.json` at `2d9a5fc` (1075 events) |
| audio | `notation/audio/piece-Recombination-Draft01-done.wav` — the render of 2026-10-01 (RENDER.md §4, RUNNING_LOG §698): 886.664 s · −5.0 dBTP · −22.8 LUFS · LRA 20 (+6 dB plain, his cap) · sha256 `d4906fefeffbed8a7f27ad8e1c12c13659f54af9d6da7d31ef3dff509ded0738` |
| frame | the ensemble realized `video-jury` (in C) · 74 tiled pages of 12 s · music x 112 → 1880 of 1920 (PLAN 2c) |
| the opening | the 4 s lead-in on the first page, no title card (his "Aa", §692) — the sound delayed by 4 s of real silence (§696) |
| the ending | the last page held from 881 s while the WAV's tail rings to 886.66 (his "Ba") |
| close-ups | groups at **1.85×** (registry `realizations.video-cut`): V-TOP = EH · Bsn · Hn · Tpt, V-BOT = Perc · Vib · Vc · DB (§693) |
| cut | **seed 7** (`cut-list-seed7.json`, a copy of `notation/video/cut-list.json`) — 11 close-ups, 30.4 % of the piece, 6 of the winds and 5 of the lower group; piece #5's recipe (`--frac 0.29 --min 20 --max 30 --lead 40 --tail 45 --gap 25`) |
| transitions | `--fade 5 --fadeMode cross` |
| fonts | Crimson Pro Light · Light Italic (the repo's) + `C:/Windows/Fonts/seguisym.ttf` as the fallback for ♭ ♯ ♮ (§699 — machine-dependent) |

**Command:** `node tools/export_video.js --ir piece-lgmf --view video --fps 30 --cut notation/video/cut-list.json --fade 5 --fadeMode
cross --t1 886.7 --audio notation/audio/piece-Recombination-Draft01-done.wav --out <out>.mp4` (~9 min).

## Measured, not asserted

- video and audio streams both start at 0.000; 890.664 s.
- the sync: the opening silence ends at 2.4975 s in the WAV and 6.4975 s in the film — the 4.000 s lead-in.
- the curves: a frame each minute — green in every sequence, green and orange in every morph, none in section 2 (§695's fault gone).
- against the render before the font fix at 16 moments: identical at 14, ≈ 700 pixels at the two with a ♭ in a label.
- **his eye and ear: "that video is good".**

## What the watch-through found on the way (all fixed before this file)

1. no curves after ≈ 30 s — the rasterizer dropped the long curve paths (§695)
2. the sound 4 s ahead of the picture — the lead-in's delay was a timestamp, not silence (§696)
3. a late trumpet at 367.8 — fixed in the save (§697), the audio and the film re-made (§698)
4. a box for ♭ in 40 labels — no font with the sign in the film (§699)
