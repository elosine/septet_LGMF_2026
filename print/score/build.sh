#!/usr/bin/env bash
# THE PRINT SCORE, END TO END — the answer to "how do I re-render after I change
# the score?" (composer, piece #4 day 37; the septet's 2026-09-17; made THIS piece's
# 2026-10-03, PLAN 2b-P step 1).
#
# THE CHAIN, and the step that is easy to miss:
#
#     scores/piece-Recombination-Draft01-done.json --(notate_section)--> notation/ir/piece-lgmf.ir.json --(export_print)--> PDF
#                                                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#     The print score is drawn from the IR, NOT from the save file. Edit the
#     score, re-run export_print alone, and you render the OLD notation with no
#     error of any kind. That is why --rebuild-ir exists.
#
#   bash print/score/build.sh                 # render the PDF from the IR as it stands
#   bash print/score/build.sh --proof         # the proof PDFs only (one page per section · the front matter · the density trio), fast
#   bash print/score/build.sh --rebuild-ir    # rebuild the IR from the score FIRST, then render
#
# DRAFT 01 IS PRINTED WITHOUT --rebuild-ir (PLAN 2b-P): the print is OF the page that was locked and filmed
# (the tag Recombination-Draft01-film_1.0). A rebuild moves the page under the film and the audio — if the score
# moves, the whole loop is journal §2 "IF THE SCORE MOVES AGAIN" (the gates, the audio, the film, then this).
# The rebuild goes through this piece's runner, tools/reextract.js, which re-runs the IR's OWN recorded build
# (`provenance.build`) on a fresh copy of the save — the record is ~26 KB of command line, which a shell `eval`
# does not survive here. [That line was re-pointed on 2026-10-03 and has NOT been run from this script.]
#
# Density, margins, the instructions' break: pass through, e.g.
#   bash print/score/build.sh --sec 12
#   bash print/score/build.sh --margin 0.4
#   bash print/score/build.sh --insBreak "Gradient Curves"
#
# THE SHEET IS A3 LANDSCAPE, kept at his word (LG-328, 2026-10-03): the Lake George call names no sheet
# ("professional standards"), so the house format of pieces #4 and #5 stands — 419.7 x 296.8 mm drawn, inside
# DIN A3. It is the exporter's default; Tabloid (11 x 17 in) is the US near-equivalent: --format tabloid-landscape,
# and a cover for that sheet first (print/cover/make_cover.ps1 -Format tabloid-landscape).
set -e
cd "$(dirname "$0")/../.."
OUT=print/score/Recombination-score-JYang.pdf
IR=piece-lgmf
# one moment per section: the first sequence · section 2 · the second take -> take morph · the last chord
AT=100,300,600,870

REBUILD=0
PROOF=0
PASS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --rebuild-ir) REBUILD=1; shift;;
    --proof) PROOF=1; shift;;
    *) PASS+=("$1"); shift;;
  esac
done

if [ "$REBUILD" = "1" ]; then
  echo "=== REBUILDING $IR FROM ITS OWN provenance.build (tools/reextract.js) ==="
  # snapshot first: the IR schema is a GATE and a rejected build DELETES the page
  # (PROJECT_JOURNAL, "THE TRAPS THIS DAY FOUND" #1; this piece's §632).
  cp "notation/ir/$IR.ir.json" "notation/ir/$IR.ir.json.bak"
  echo "  snapshot: notation/ir/$IR.ir.json.bak"
  IR="$IR" node tools/reextract.js ""
  echo "=== IR rebuilt — the film and the audio are now of an OLDER page (journal §2, IF THE SCORE MOVES AGAIN) ==="
fi

# THE TWO CHECKS THAT MUST PASS BEFORE A PAGE IS BELIEVED:
#   the frame  — the printed page is the filmed page (systems, labels, brackets, brace, census — from the ensemble)
#   the front  — the cover's face resolved, and no column is being clipped
echo "=== CHECKS ==="
node tools/check_print_frame.js --ir "$IR" --at "$AT"
node tools/check_print_front.js --ir "$IR" "${PASS[@]}"

if [ "$PROOF" = "1" ]; then
  echo "=== THE PROOF PAGES (one per section) ==="
  node tools/export_print.js --ir "$IR" --at "$AT" --out print/score/PROOF-A3-frame.pdf "${PASS[@]}"
  node tools/export_print.js --ir "$IR" --cover on --instructions on --pages 1 --out print/score/PROOF-front-matter.pdf "${PASS[@]}"
  echo "=== THE DENSITY TRIO (the same moment at three densities — the staff never changes, only the time a page holds) ==="
  node tools/export_print.js --ir "$IR" --sec 8.5 --at 300 --out print/score/PROOF-density-8.5.pdf
  node tools/export_print.js --ir "$IR"           --at 300 --out print/score/PROOF-density-10.3.pdf   # the default = the film's own density
  node tools/export_print.js --ir "$IR" --sec 12  --at 300 --out print/score/PROOF-density-12.pdf
  echo "=== CHECKING THE PROOF FILES ==="
  for F in print/score/PROOF-A3-frame.pdf print/score/PROOF-front-matter.pdf; do node tools/check_print_pdf.js --pdf "$F"; done
  echo "=== DONE (proofs) ==="
  exit 0
fi

echo "=== RENDERING THE PRINT SCORE ==="
node tools/export_print.js --ir "$IR" --cover on --instructions on --out "$OUT" "${PASS[@]}"
echo "=== CHECKING THE PDF ==="
node tools/check_print_pdf.js --pdf "$OUT"
echo "=== WALKING EVERY PAGE ==="
node tools/check_print_pages.js --ir "$IR" "${PASS[@]}"
echo "=== THE PAGE EDGES (PLAN 2c — the cut placed by the objects) ==="
node tools/check_print_edges.js --ir "$IR" "${PASS[@]}"
echo "=== DONE ==="
ls -la "$OUT"
