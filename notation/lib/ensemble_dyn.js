// ensemble_dyn.js — D50 (2026-09-14, the composer; RUNNING_LOG §501–§503): a part's written dynamic taken
// from the ENSEMBLE at each of its onsets, not from its own velocity.
//
// The composer's rule, for the piano in the morph section: "if there are three or more at that top dynamic,
// then the piano will match that top dynamic. If not, then the piano will come in at one under the top
// dynamic" — and, in a beamed pair whose two notes had different dynamics, "make the 2nd note 1 level more
// than the 1st one". The other parts' dynamic at an instant = the level of the breath sounding then
// (evalWaveCurve × the D32 CC7 fade weight — the morph tool's own reading) as a D23 mark: 0 = ppp … 1 = fff,
// eight equal steps. PAGE ONLY: the save's velocities are not touched (his choice, §503).
//
// ONE copy of the rule: tools/notate_section.js --ensembleDyn writes its result into the IR, and
// tools/test_morph_notation.js checks the IR against it and against the frozen table.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../score/public/sonify_core.js'), require('../../score/public/morph.js'));
  else root.EnsembleDyn = factory(root.SonifyCore, root.Morph);
}(typeof self !== 'undefined' ? self : this, function (Core, Morph) {
  const MARKS = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];

  // the loudest breath sounding on `layer` at t, as a mark; null when nothing sounds
  function levelMark(objects, layer, t) {
    let best = null;
    for (const o of objects) {
      if (o.layer !== layer || o.type !== 'waveCurve' || t < o.startSeconds || t > o.endSeconds) continue;
      const frac = Math.max(0, Math.min(1, (t - o.startSeconds) / (o.endSeconds - o.startSeconds)));
      const eff = Core.evalWaveCurve(o, frac) * (o.cc7Fade ? Morph.fadeWeight(o.cc7Fade, t) : 1);
      if (best == null || eff > best) best = eff;
    }
    return best == null ? null : MARKS[Math.max(0, Math.min(7, Math.round(best * 7)))];
  }

  // three or more at the top → the top; otherwise one step under it; never under ppp
  function ruleOf(marks) {
    const idx = marks.map(m => MARKS.indexOf(m)).filter(i => i >= 0);
    if (!idx.length) return null;
    const top = Math.max(...idx), n = idx.filter(i => i === top).length;
    return { mark: MARKS[n >= 3 ? top : Math.max(0, top - 1)], top: MARKS[top], n };
  }

  // opts: { part, t0, t1, others: [layers], bands: [{max, mark}], groupSeconds (0.3), chordSeconds (0.05) }
  // → { marks: Map objectId -> mark, rows: [{ t, mark, top, n, others: {layer: mark|null} }] }
  function marksFor(objects, opts) {
    const gS = opts.groupSeconds != null ? opts.groupSeconds : 0.3;
    const cS = opts.chordSeconds != null ? opts.chordSeconds : 0.05;
    const bandOf = v => (opts.bands.find(b => v <= b.max) || opts.bands[opts.bands.length - 1]).mark;
    const notes = objects.filter(o => o.layer === opts.part && o.type === 'waveCurve' && o.startSeconds >= opts.t0 && o.startSeconds <= opts.t1)
      .sort((a, b) => a.startSeconds - b.startSeconds);
    const marks = new Map(), rows = [];
    for (let i = 0; i < notes.length;) {
      let j = i;
      while (j + 1 < notes.length && notes[j + 1].startSeconds - notes[i].startSeconds <= gS) j++;
      const g = notes.slice(i, j + 1), t = g[0].startSeconds;
      const others = {};
      for (const L of opts.others) others[L] = levelMark(objects, L, t);
      const r = ruleOf(Object.values(others));
      if (r) {
        const first = g.filter(o => o.startSeconds - t <= cS);
        const firstBand = bandOf(Math.max(...first.map(o => o.recVel)));
        for (const o of g) {
          const later = o.startSeconds - t > cS;
          // a later onset of the group (the beamed pair's second note) whose own band differed: one level more
          marks.set(o.id, later && bandOf(o.recVel) !== firstBand ? MARKS[Math.min(7, MARKS.indexOf(r.mark) + 1)] : r.mark);
        }
        rows.push({ t, mark: r.mark, top: r.top, n: r.n, others });
      }
      i = j + 1;
    }
    return { marks, rows };
  }

  return { MARKS, levelMark, ruleOf, marksFor };
}));
