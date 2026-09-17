// chord_column.js — [PLAN 2a.4, the septet — 2026-09-11] A CHORD's noteheads
// and accidentals: which heads step aside, and how the accidentals pack.
//
// The rules are piece #2's engine, ported VERBATIM in logic (its own doc
// names them canonical and its older constants superseded —
// composition_for_two_pianos_and_two_percussion/docs/CHORD_SPACING_RULES.md §0):
//   · noteColumn  = tools/notation_studio/engine/note_column.js
//                   (D.8.1, locked from the LilyPond cluster matrix)
//   · accidentalColumn = tools/notation_studio/engine/accidental_column.js
//                   (D.8.2 + the D.9.x per-column anchor + the H.4c.3 ledger
//                   clearance, locked from the LilyPond accidental matrix)
// Numbers come from the caller (container.json engraving.layout.chordColumn,
// which carries #2's dimensions_table values and provenance) — none here.
//
// COORDINATES: this engine's ySs grows UP the page; #2's staffY grows DOWN.
// Every function below takes and returns this engine's convention; the flip
// is done once, at the top of each.
// Pure, dual-load, no state.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationChordColumn = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // notes: [{ ySs }] in any order. stemDir 'up' | 'down' (a stemless chord
  // reads as 'up': its displaced heads go right, LilyPond's default side).
  // Walk from the stem-attach end (bottom for up, top for down); a note
  // within `thresholdSteps` staff positions of the previous one flips to the
  // other side of the column, a wider interval resets to the default side.
  // Returns [{ side: 'default'|'displaced', xOffsetSs }] in INPUT order:
  // default 0, displaced +headW (up) / −headW (down).
  function noteColumn(notes, stemDir, headW, thresholdSteps) {
    if (stemDir !== 'up' && stemDir !== 'down') throw new Error('noteColumn: stemDir must be up or down');
    const th = thresholdSteps != null ? thresholdSteps : 1;
    const ordered = notes.map((n, i) => ({ staffY: -n.ySs, i }))
      .sort((a, b) => {
        const dy = stemDir === 'up' ? b.staffY - a.staffY : a.staffY - b.staffY;
        return dy !== 0 ? dy : a.i - b.i;
      });
    const side = new Array(notes.length);
    let prevSide = null, prevY = null;
    for (const it of ordered) {
      let s;
      if (prevY === null) s = 'default';
      else s = (Math.abs(it.staffY - prevY) / 0.5 <= th + 1e-9) ? (prevSide === 'default' ? 'displaced' : 'default') : 'default';
      side[it.i] = s; prevSide = s; prevY = it.staffY;
    }
    return side.map(s => ({ side: s, xOffsetSs: s === 'default' ? 0 : (stemDir === 'up' ? headW : -headW) }));
  }

  // accs: [{ w, topExt, botExt, ySs }] — the glyph's width, its extent above
  // and below the notehead centre it belongs to, and that centre.
  // heads: [{ xLeft, ySs, hSs }] — every notehead of the chord (xLeft in ss,
  // any origin). ledgers: [{ ySs, xLeft }] — each ledger's left end.
  // P: { gapToNotehead, minLateralGap, yTol }.
  // Returns, in INPUT order, [{ rightEdge, leftEdge, slotIndex }] in the SAME
  // x frame as heads[].xLeft.
  function accidentalColumn(accs, heads, ledgers, P) {
    const gap = P.gapToNotehead, yTol = P.yTol != null ? P.yTol : 0.05;
    // #2's frame: staffY down; an accidental spans [anchor − top, anchor + bottom]
    const items = accs.map((a, i) => ({ i, w: a.w, anchorY: -a.ySs, yTop: -a.ySs - a.topExt, yBot: -a.ySs + a.botExt }));
    const nh = heads.map(h => ({ xLeft: h.xLeft, yTop: -h.ySs - h.hSs / 2, yBot: -h.ySs + h.hSs / 2 }));
    const chordLeft = nh.length ? Math.min(...nh.map(n => n.xLeft)) : 0;
    // D.9.x: an accidental anchors to the leftmost head its own glyph overlaps
    const anchorOf = it => {
      let best = Infinity;
      for (const n of nh) if (!(it.yBot < n.yTop - yTol || it.yTop > n.yBot + yTol) && n.xLeft < best) best = n.xLeft;
      return Number.isFinite(best) ? best : chordLeft;
    };
    // H.4c.3: the leftmost ledger end at this accidental's own y
    const ledgerLeftAt = y => {
      let m = null;
      for (const L of ledgers || []) if (Math.abs(-L.ySs - y) <= yTol + 1e-9 && (m === null || L.xLeft < m)) m = L.xLeft;
      return m;
    };
    const placed = [];
    const out = new Array(accs.length);
    let slot = 0;
    for (const it of items.slice().sort((a, b) => a.anchorY - b.anchorY)) {   // top to bottom
      let collidingLeft = null;
      for (const p of placed) {
        if (!(it.yBot < p.yTop - yTol || it.yTop > p.yBot + yTol) && (collidingLeft === null || p.leftEdge < collidingLeft)) collidingLeft = p.leftEdge;
      }
      // a colliding accidental takes the next full slot left; a clear one
      // sits against its own head (the D.9.x rule, heads supplied)
      let right = collidingLeft !== null ? collidingLeft : anchorOf(it) - gap;
      const lx = ledgerLeftAt(it.anchorY);
      if (lx !== null && lx - gap < right) right = lx - gap;
      const p = Object.assign({}, it, { rightEdge: right, leftEdge: right - it.w, slotIndex: slot++ });
      placed.push(p);
      out[it.i] = { rightEdge: p.rightEdge, leftEdge: p.leftEdge, slotIndex: p.slotIndex };
    }
    return out;
  }

  return { noteColumn, accidentalColumn };
});
