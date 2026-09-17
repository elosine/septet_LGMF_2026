\version "2.24.0"
% PLAN 2f.1 (2026-09-13, RUNNING_LOG §435): the pitched trill at the house notehead size.
% LilyPond's own defaults for every TrillPitch* grob and the TrillSpanner; only NoteHead.font-size = #-2
% (piece #2 D.3). Each grob reports its extents relative to the system, in staff spaces.
#(define (report name)
   (lambda (grob)
     (let* ((sys (ly:grob-system grob))
            (x (ly:grob-extent grob sys X))
            (y (ly:grob-extent grob sys Y)))
       (ly:message "PROBE ~a x ~a ~a y ~a ~a" name (car x) (cdr x) (car y) (cdr y)))))
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f }
\score {
  \new Staff \with {
    \remove "Time_signature_engraver"
    \override StaffSymbol.thickness = #1
    \override StaffSymbol.after-line-breaking = #(report "staff")
    \override NoteHead.after-line-breaking = #(report "head")
    \override Accidental.after-line-breaking = #(report "acc")
    \override TrillPitchHead.after-line-breaking = #(report "tpHead")
    \override TrillPitchAccidental.after-line-breaking = #(report "tpAcc")
    \override TrillPitchParentheses.after-line-breaking = #(report "tpParens")
    \override TrillPitchGroup.after-line-breaking = #(report "tpGroup")
    \override TrillSpanner.after-line-breaking = #(report "trSpan")
  } {
    \clef bass
    \override NoteHead.font-size = #-2
    % 1. the piano's first trill: C2, whole tone (d), two ledgers below the bass staff
    \pitchedTrill c,2 \startTrillSpan d, r2 \stopTrillSpan
    % 2. a semitone with an accidental on the neighbour: C3 -> D-flat3, in the staff
    \pitchedTrill c2 \startTrillSpan des r2 \stopTrillSpan
    % 3. a note with its own accidental and a natural neighbour: F#3 -> G3, top of the staff
    \pitchedTrill fis2 \startTrillSpan g r2 \stopTrillSpan
  }
  \layout { }
}
