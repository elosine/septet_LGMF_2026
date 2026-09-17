#!/usr/bin/env bash
# THE PRINT SCORE, END TO END — the answer to "how do I re-render after I change
# the score?" (composer, piece #4 day 37; rewritten for the septet 2026-09-17, PLAN 2b.5.2).
#
# THE CHAIN, and the step that is easy to miss:
#
#     scores/piece-septet.json --(notate_section)--> notation/ir/piece-septet.ir.json --(export_print)--> PDF
#                                                            ^^^^^^^^^^^^^^^^^^^^^^^^
#     The print score is drawn from the IR, NOT from the save file. Edit the
#     score, re-run export_print alone, and you render the OLD notation with no
#     error of any kind. That is why --rebuild-ir exists.
#
#   bash print/score/build.sh                 # render the PDF from the IR as it stands
#   bash print/score/build.sh --rebuild-ir    # rebuild the IR from the score FIRST, then render
#   bash print/score/build.sh --proof         # the four proof pages only (one per section), fast
#
# The IR rebuild uses the IR's OWN recorded build command (`provenance.build`),
# which is the method the journal's tool table specifies — so it cannot drift
# from how the page was actually made.
#
# Density, margins, the instructions' break: pass through, e.g.
#   bash print/score/build.sh --sec 12
#   bash print/score/build.sh --margin 0.4
#   bash print/score/build.sh --insBreak "Notation Legend"
#
# THE SHEET IS A3 LANDSCAPE, which the call fixes: "The score as an Adobe PDF
# document with a maximum size of DIN A3 (297 x 420 mm)". It is the exporter's
# default; do not pass --format for the submission.
set -e
cd "$(dirname "$0")/../.."
OUT=print/score/Scattered-Substance-score-JYang.pdf
IR=piece-septet

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
  echo "=== REBUILDING $IR FROM ITS OWN provenance.build ==="
  # snapshot first: the IR schema is a GATE and a rejected build DELETES the page
  # (PROJECT_JOURNAL, "THE TRAPS THIS DAY FOUND" #1).
  cp "notation/ir/$IR.ir.json" "notation/ir/$IR.ir.json.bak"
  echo "  snapshot: notation/ir/$IR.ir.json.bak"
  CMD=$(node -e "process.stdout.write(require('./notation/ir/$IR.ir.json').provenance.build)")
  echo "  $ ${CMD:0:120}..."
  eval "$CMD"
  echo "=== IR rebuilt ==="
fi

# THE TWO CHECKS THAT MUST PASS BEFORE A PAGE IS BELIEVED (2b.1.6, 2b.4):
#   the frame  — the printed page is the filmed page (systems, labels, brackets, brace, census)
#   the front  — the cover's face resolved, and no column is being clipped
echo "=== CHECKS ==="
node tools/check_print_frame.js --ir "$IR"
node tools/check_print_front.js --ir "$IR"

if [ "$PROOF" = "1" ]; then
  echo "=== THE PROOF PAGES (one per section) ==="
  node tools/export_print.js --ir "$IR" --at 100,250,380,530 --out print/score/PROOF-A3-frame.pdf
  node tools/export_print.js --ir "$IR" --cover on --instructions on --pages 1 --out print/score/PROOF-front-matter.pdf
  echo "=== DONE (proofs) ==="
  exit 0
fi

echo "=== RENDERING THE PRINT SCORE ==="
node tools/export_print.js --ir "$IR" --cover on --instructions on --out "$OUT" "${PASS[@]}"
echo "=== CHECKING THE PDF ==="
node tools/check_print_pdf.js --pdf "$OUT"
echo "=== WALKING EVERY PAGE ==="
node tools/check_print_pages.js --ir "$IR"
echo "=== THE PAGE EDGES (PLAN 2b.7, D59) ==="
node tools/check_print_edges.js --ir "$IR"
echo "=== DONE ==="
ls -la "$OUT"
