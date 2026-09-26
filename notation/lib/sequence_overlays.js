// sequence_overlays.js — THE SEQUENCE DEVICE, as one overlay per part (LGMF PLAN 2d.1, 2026-09-25; RUNNING_LOG §382).
//
// A SEQUENCE (the sequence drawer's notes, score `srcKind: 'sequence'`, one `grp-seq-*` group) is a device of the notation like
// the surge and the morph, drawn PER PART: one part's notes inside the group are ONE LINE with breaths (LG-111 · LG-112). This file
// derives what the page draws, once, from the save (D9 — the engine draws what the IR says, nothing is computed twice):
//   entry   the block at the part's first note — its pitch and marks, the written range in words, the technique's text
//   level   the WRITTEN LEVEL at 100 samples/s on THE FIXED SCALE (his decision, §374 · §375): eight equal steps from niente (0)
//           to fff (1) — ppp 1/8 … mp 4/8 … fff 8/8 — linear in CC7 between two names through the part's own ladder
//           (`DynTable.cc7`), under ppp linear to CC7 0 = niente. One scale for the whole piece, every player, every realization.
//   breaths every note after the first: `same` (the same key and cents as the note before) or `new`, with the new pitch's marks
//   labels  the turning points of the level (a crest or a trough), each named by the nearest written name
//
// The CC7 at an instant is `composer.html heldCc7`'s rule, which playback follows: `cc7Abs {lo, hi}` on the drawn height
// (`sonify_core.evalWaveCurve`, the nodes' y / 10), `cc7Fade` multiplied in (`Morph.fadeWeight`) — taken before the fader's
// rounding to an integer, so the line is smooth; the same numbers to within half a CC7 step.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../score/public/sonify_core.js'), require('../../score/public/morph.js'), require('../../score/public/dyn_table.js'));
  else root.SequenceOverlays = factory(root.SonifyCore, root.Morph, root.DynTable);
}(typeof self !== 'undefined' ? self : this, function (Core, Morph, DynTable) {
  const NAMES = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
  const DEFAULTS = {
    sps: 100,            // samples per second (D47 / 2f.7 — the morph's and the trills' density)
    dwellS: 1,           // [call, PLAN 2d] a turning point within this of the previous label, carrying the same name, is dropped
    eps: 1e-6,           // a step smaller than this is flat
  };
  const STEP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  // the cents as written (just_partials_notation §1a): signed, the TRUE minus, no ¢
  const centsText = c => { const r = Math.round(c); return r === 0 ? '0' : (r > 0 ? '+' : '−') + Math.abs(r); };

  // CC7 → the written level on the fixed scale, through the part's ladder L (eight CC7 values, ppp … fff)
  function writtenOf(cc, L) {
    if (!(cc > 0)) return 0;
    if (cc <= L[0]) return (cc / L[0]) / 8;
    for (let i = 0; i < 7; i++) if (cc <= L[i + 1]) return ((i + 1) + (cc - L[i]) / Math.max(1e-9, L[i + 1] - L[i])) / 8;
    return 1;
  }
  // the nearest written name to a level (niente for a level nearer silence than ppp)
  function nameOf(w) {
    let best = 'niente', d = Math.abs(w);
    NAMES.forEach((n, i) => { const e = Math.abs(w - (i + 1) / 8); if (e < d - 1e-12) { d = e; best = n; } });
    return best;
  }
  // the CC7 a note sounds at score time t — heldCc7's rule, unrounded
  function cc7At(o, t) {
    const dur = o.endSeconds - o.startSeconds;
    const h = Core.evalWaveCurve(o, dur > 0 ? (t - o.startSeconds) / dur : 0);
    const abs = o.cc7Abs || { lo: 0, hi: 127 };
    const lo = abs.lo != null ? abs.lo : 0, hi = abs.hi != null ? abs.hi : 127;
    const base = Math.max(0, Math.min(127, lo + (hi - lo) * Math.max(0, Math.min(1, h))));
    return base * (o.cc7Fade ? Morph.fadeWeight(o.cc7Fade, t) : 1);
  }
  const bendOf = o => (Array.isArray(o.morphBend) && o.morphBend.length ? +o.morphBend[0][1] : 0);

  // the partial and the fundamental from the sequence's recipe: the box named in the note's `performanceNotes` (`box N`), the
  // chord member on the note's lane with the note's key (else the lane's first); the fundamental is COMPUTED from the note's
  // pitch and partial and spelled from the take's name when the name agrees (`Just-Eb1-seed100` → E♭1), else by sharps
  function marksOf(o, recipe, warnings) {
    const cents = bendOf(o);
    const out = { midi: o.sonifyNote, cents: +cents.toFixed(2), centsText: centsText(cents) };
    const m = /box (\d+)/.exec(o.performanceNotes || '');
    const box = m && recipe && recipe.containers ? recipe.containers[+m[1] - 1] : null;
    if (!box) { warnings.push(o.id + ': no box in the recipe for "' + (o.performanceNotes || '') + '" — no partial written'); return out; }
    const lane = (box.chord || []).filter(c => c.lane === o.layer);
    const c = lane.find(x => x.midi === o.sonifyNote) || lane[0];
    if (!c || !(c.partial > 0)) { warnings.push(o.id + ': box ' + m[1] + ' holds no partial for lane ' + o.layer); return out; }
    if (Math.abs((+c.cents || 0) - cents) > 0.05) warnings.push(o.id + ': the recipe says ' + c.cents + ' c, the note bends ' + cents + ' c — the note written');
    const fMidiX = o.sonifyNote + cents / 100 - 12 * Math.log2(c.partial), fMidi = Math.round(fMidiX);
    if (Math.abs(fMidiX - fMidi) > 0.05) warnings.push(o.id + ': partial ' + c.partial + ' puts the fundamental ' + ((fMidiX - fMidi) * 100).toFixed(1) + ' c off a key');
    let fName = STEP_NAMES[((fMidi % 12) + 12) % 12] + (Math.floor(fMidi / 12) - 1);
    const tm = /-([A-Ga-g])(b|#|♭|♯)?(-?\d)-/.exec('-' + (box.take || '') + '-');
    if (tm) {
      const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, L = tm[1].toUpperCase();
      const alt = tm[2] === 'b' || tm[2] === '♭' ? -1 : tm[2] === '#' || tm[2] === '♯' ? 1 : 0;
      const nm = PC[L] + alt + 12 * (+tm[3] + 1);
      if (nm === fMidi) fName = L + (alt < 0 ? '♭' : alt > 0 ? '♯' : '') + tm[3];
    }
    return Object.assign(out, { partial: c.partial, fundamental: fName, fundamentalMidi: fMidi, box: +m[1], take: box.take || null,
      partialText: c.partial + '°/' + fName });
  }

  // Build the overlay one part of one sequence group needs.
  //   objects : the score's objects (any superset)   groupId : 'grp-seq-…'   part : the lane
  //   opts    : { window: [w0, w1], bank, instKey, recipe, name, techTexts, sps, dwellS }
  function forPart(objects, groupId, part, opts) {
    const O = Object.assign({}, DEFAULTS, opts || {});
    const [w0, w1] = O.window || [0, Infinity];
    const warnings = [];
    const notes = objects.filter(o => o.type === 'waveCurve' && o.groupId === groupId && o.layer === part && o.srcKind === 'sequence'
      && o.startSeconds >= w0 && o.startSeconds < w1).sort((a, b) => a.startSeconds - b.startSeconds);
    if (!notes.length) return null;
    for (let i = 1; i < notes.length; i++) if (notes[i].startSeconds < notes[i - 1].endSeconds - 1e-6)
      warnings.push(notes[i].id + ' overlaps ' + notes[i - 1].id + ' — the line reads the later note from its onset');
    const L = NAMES.map((n, i) => DynTable.cc7(O.bank, O.instKey, i / 7));
    if (!DynTable.hasCurve(O.bank, O.instKey)) warnings.push('part ' + part + ' (' + O.instKey + '): no measured fader curve — the ladder is the UVI law\'s guess');
    const T0 = notes[0].startSeconds, T1 = Math.min(w1, notes[notes.length - 1].endSeconds);

    // THE LEVEL — 100/s from the entry to the last release (or the window's end); through a breath gap a LINEAR BRIDGE from the
    // last note's release to the next note's onset [call, PLAN 2d]
    const n = Math.max(1, Math.round((T1 - T0) * O.sps));
    const samples = [];
    let k = 0;
    for (let i = 0; i <= n; i++) {
      const t = T0 + i * (T1 - T0) / n;
      while (k + 1 < notes.length && t >= notes[k + 1].startSeconds) k++;
      const o = notes[k];
      let cc;
      if (t <= o.endSeconds || k + 1 >= notes.length) cc = cc7At(o, Math.min(t, o.endSeconds));
      else {
        const nx = notes[k + 1], a = cc7At(o, o.endSeconds), b = cc7At(nx, nx.startSeconds);
        cc = a + (b - a) * (t - o.endSeconds) / Math.max(1e-9, nx.startSeconds - o.endSeconds);
      }
      samples.push(+writtenOf(cc, L).toFixed(5));
    }

    // THE LABELS — the turning points: the direction's sign changes, flats carried; a crest or a trough is placed where its
    // plateau BEGINS (the level reached); named by the nearest name; one within dwellS of the previous label with the same name
    // is dropped [call]
    const labels = [];
    let dir = 0, extremeAt = 0;
    for (let i = 1; i < samples.length; i++) {
      const d = samples[i] - samples[i - 1];
      const s = Math.abs(d) < O.eps ? 0 : Math.sign(d);
      if (s === 0) continue;
      if (dir !== 0 && s !== dir) {
        const t = T0 + extremeAt * (T1 - T0) / n, mark = nameOf(samples[extremeAt]);
        const prev = labels[labels.length - 1];
        if (!(prev && prev.mark === mark && t - prev.t < O.dwellS)) labels.push({ t: +t.toFixed(3), mark, kind: dir > 0 ? 'crest' : 'trough', level: samples[extremeAt] });
      }
      dir = s; extremeAt = i;
    }

    // THE ENTRY and THE BREATHS
    const first = notes[0];
    const box1 = O.recipe && O.recipe.containers ? O.recipe.containers[(marksOf(first, O.recipe, []).box || 1) - 1] : null;
    const W = O.recipe && O.recipe.waves;
    const range = box1 && box1.dyn === 'waves' && W ? [W.low, W.high] : (box1 && typeof box1.dyn === 'string' ? [box1.dyn] : null);
    const techText = (O.techTexts || {})[first.technique] || null;
    const entry = Object.assign({ event: 'ev-' + first.id, t: first.startSeconds, release: first.endSeconds, technique: first.technique,
      techText, range, rangeText: range ? range.join(' → ') : null }, marksOf(first, O.recipe, warnings));
    const breaths = [];
    for (let i = 1; i < notes.length; i++) {
      const o = notes[i], p = notes[i - 1];
      const same = o.sonifyNote === p.sonifyNote && Math.abs(bendOf(o) - bendOf(p)) < 0.01;
      const b = { event: 'ev-' + o.id, onset: o.startSeconds, release: o.endSeconds, pitch: same ? 'same' : 'new' };
      if (!same) Object.assign(b, marksOf(o, O.recipe, warnings));
      else b.midi = o.sonifyNote;
      breaths.push(b);
    }

    return {
      part, T0, T1, notes, warnings, ladder: L,
      overlay: {
        id: 'ov-seq-' + String(groupId).replace(/^grp-/, '') + '-p' + part, kind: 'sequence',
        target: { part, span: [+T0.toFixed(4), +T1.toFixed(4)] },
        value: {
          group: groupId, name: O.name || null,
          scale: { kind: 'fixed', steps: 8, names: ['niente'].concat(NAMES), ladder: L, instKey: O.instKey },
          entry,
          level: { sps: O.sps, t0: +T0.toFixed(4), t1: +T1.toFixed(4), samples },
          breaths, labels,
        },
        provenance: 'authored',
      },
    };
  }

  return { forPart, writtenOf, nameOf, cc7At, centsText, marksOf, NAMES, DEFAULTS };
}));
