// sequence_overlays.js — THE SEQUENCE DEVICE, as one overlay per part (LGMF PLAN 2d.1, 2026-09-25; RUNNING_LOG §382).
//
// A SEQUENCE (the sequence drawer's notes, score `srcKind: 'sequence'`, one `grp-seq-*` group) is a device of the notation like
// the surge and the morph, drawn PER PART: one part's notes inside the group are ONE LINE with breaths (LG-111 · LG-112). This file
// derives what the page draws, once, from the save (D9 — the engine draws what the IR says, nothing is computed twice):
//   entry   the block at the part's first note — its pitch and marks, the written range in words, the technique's text
//   level   the WRITTEN LEVEL at 100 samples/s on THE FIXED SCALE (his decision, §374 · §375): eight equal steps from niente (0)
//           to fff (1) — ppp 1/8 … mp 4/8 … fff 8/8 — linear in CC7 between two names through the part's own ladder
//           (`DynTable.cc7`), under ppp linear to CC7 0 = niente. One scale for the whole piece, every player, every realization.
//           A FADE (`cc7Fade`, the multiplier on the fader) multiplies the WRITTEN height, not the CC7 (§462, his (a)): one straight
//           line from nothing to the note's level — the body between names untouched.
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
  // [§502, his "if there are no actual cents deviation no need for the 0"] a rounded 0 is nothing written (rules.json number.centsZero);
  // the layout treats '' and an older IR's '0' alike
  const centsText = c => { const r = Math.round(c); return r === 0 ? '' : (r > 0 ? '+' : '−') + Math.abs(r); };

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
  // the CC7 a note's BODY sounds at score time t — heldCc7's rule before the fade, unrounded
  function baseCc7At(o, t) {
    const dur = o.endSeconds - o.startSeconds;
    const h = Core.evalWaveCurve(o, dur > 0 ? (t - o.startSeconds) / dur : 0);
    const abs = o.cc7Abs || { lo: 0, hi: 127 };
    const lo = abs.lo != null ? abs.lo : 0, hi = abs.hi != null ? abs.hi : 127;
    return Math.max(0, Math.min(127, lo + (hi - lo) * Math.max(0, Math.min(1, h))));
  }
  // the fade weight at t (cc7Fade, the multiplier on the fader — 1d.8's fade from / to nothing); 1 without one
  const fadeAt = (o, t) => (o.cc7Fade ? Morph.fadeWeight(o.cc7Fade, t) : 1);
  // [§462, his (a)] THE WRITTEN LEVEL at t: the body through the ladder (CC7-linear between two names — the drawer's own convention,
  // DynTable.height), TIMES the fade weight — a fade is drawn as the multiplier on the WRITTEN height, one straight line from nothing
  // to the note's level. Before §462 the weight multiplied the CC7 and the picture bent at ppp (43 CC7 per eighth under it, 8 above).
  const writtenAt = (o, t, L) => writtenOf(baseCc7At(o, t), L) * fadeAt(o, t);
  const bendOf = o => (Array.isArray(o.morphBend) && o.morphBend.length ? +o.morphBend[0][1] : 0);

  // the partial and the fundamental from the sequence's recipe: the box named in the note's `performanceNotes` (`box N`), the
  // chord member on the note's lane with the note's key (else the lane's first); the fundamental is COMPUTED from the note's
  // pitch and partial and spelled from the take's name when the name agrees (`Just-Eb1-seed100` → E♭1), else by sharps
  // [LGMF PLAN 2k.2] `memberOf(o)` in place of the recipe: a MORPH's start head reads its partial from the placed actual's take by
  // `lane:seat` (1h; the marker's take, 1u §395) — `{ member: { midi, cents, partial }, take }`, or `{ why }` when it cannot be read;
  // the fundamental is then computed from the TAKE's pitch (the note may already lean off it at its onset — said, the note written)
  function marksOf(o, recipe, warnings, formOf, memberOf) {
    let midi = o.sonifyNote, cents = bendOf(o);
    // [2k.2] a morph's note may start re-keyed (the engine keeps the bend inside ±199 c by re-spelling — midi 38 −100 is D♭2): the
    // start head is the pitch itself, the nearest tempered key and the cents from it
    if (memberOf) { const x = midi * 100 + cents; midi = Math.round(x / 100); cents = x - midi * 100; }
    const out = { midi, cents: +cents.toFixed(2), centsText: centsText(cents) };
    let c, take, boxN, pitchX;
    if (memberOf) {
      const r = memberOf(o) || {};
      if (!r.member || !(r.member.partial > 0)) { warnings.push(o.id + ': ' + (r.why || 'no take to read') + ' — no partial written'); return out; }
      c = r.member; take = r.take || null; boxN = null;
      // the note against its take, to the written resolution (half a cent): a morph may already lean off its take at its onset
      if (c.midi !== midi || Math.abs((+c.cents || 0) - cents) >= 0.5) warnings.push(o.id + ': the take "' + (take || '?') + '" says midi ' + c.midi + ' ' + c.cents + ' c, the note starts midi ' + midi + ' ' + (+cents.toFixed(2)) + ' c — the note written, the take\'s partial');
      pitchX = c.midi + (+c.cents || 0) / 100;
    } else {
      const m = /box (\d+)/.exec(o.performanceNotes || '');
      const box = m && recipe && recipe.containers ? recipe.containers[+m[1] - 1] : null;
      if (!box) { warnings.push(o.id + ': no box in the recipe for "' + (o.performanceNotes || '') + '" — no partial written'); return out; }
      const lane = (box.chord || []).filter(x => x.lane === o.layer);
      c = lane.find(x => x.midi === o.sonifyNote) || lane[0];
      if (!c || !(c.partial > 0)) { warnings.push(o.id + ': box ' + m[1] + ' holds no partial for lane ' + o.layer); return out; }
      if (Math.abs((+c.cents || 0) - cents) > 0.05) warnings.push(o.id + ': the recipe says ' + c.cents + ' c, the note bends ' + cents + ' c — the note written');
      take = box.take || null; boxN = +m[1]; pitchX = o.sonifyNote + cents / 100;
    }
    const fMidiX = pitchX - 12 * Math.log2(c.partial), fMidi = Math.round(fMidiX);
    if (Math.abs(fMidiX - fMidi) > 0.05) warnings.push(o.id + ': partial ' + c.partial + ' puts the fundamental ' + ((fMidiX - fMidi) * 100).toFixed(1) + ' c off a key');
    let fName = STEP_NAMES[((fMidi % 12) + 12) % 12] + (Math.floor(fMidi / 12) - 1);
    const tm = /-([A-Ga-g])(b|#|♭|♯)?(-?\d)-/.exec('-' + (take || '') + '-');
    if (tm) {
      const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, L = tm[1].toUpperCase();
      const alt = tm[2] === 'b' || tm[2] === '♭' ? -1 : tm[2] === '#' || tm[2] === '♯' ? 1 : 0;
      const nm = PC[L] + alt + 12 * (+tm[3] + 1);
      if (nm === fMidi) fName = L + (alt < 0 ? '♭' : alt > 0 ? '♯' : '') + tm[3];
    }
    return Object.assign(out, { partial: c.partial, fundamental: fName, fundamentalMidi: fMidi, box: boxN, take,
      partialText: String(formOf || '{n} ({f})').replace('{n}', c.partial).replace('{f}', fName) });   // [2e.3 (5), §438] 26 (C1) — rules.json objects.number.partialForm
  }

  // Build the overlay one part of one sequence group needs.
  //   objects : the score's objects (any superset)   groupId : 'grp-seq-…'   part : the lane
  //   opts    : { window: [w0, w1], bank, instKey, recipe, name, techTexts, techTextOf(note), partialForm, sps, dwellS }
  //   [LGMF PLAN 2k.2 — a MORPH written as a sequence whose pitch moves, §506] + { groupOnly: the group alone makes the line (a
  //   morph's notes carry no srcKind) · memberOf(note): the start head's take member (marksOf) · pitchMoves: every breath a GLIDE (no
  //   head: in a morph no breath keeps or changes a pitch in the sequence's sense) · range: the written range in names (the morph's
  //   own `low → high`) · fadeFromUnder: the opening sign when the first sample lies under this written level (ppp = 1/8) }
  function forPart(objects, groupId, part, opts) {
    const O = Object.assign({}, DEFAULTS, opts || {});
    const [w0, w1] = O.window || [0, Infinity];
    const warnings = [];
    const notes = objects.filter(o => o.type === 'waveCurve' && o.groupId === groupId && o.layer === part && (O.groupOnly || o.srcKind === 'sequence')
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
      let w;
      if (t <= o.endSeconds || k + 1 >= notes.length) w = writtenAt(o, Math.min(t, o.endSeconds), L);
      else {   // the bridge through a breath gap: linear in the WRITTEN level from the release to the next onset
        const nx = notes[k + 1], a = writtenAt(o, o.endSeconds, L), b = writtenAt(nx, nx.startSeconds, L);
        w = a + (b - a) * (t - o.endSeconds) / Math.max(1e-9, nx.startSeconds - o.endSeconds);
      }
      samples.push(+w.toFixed(5));
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
    const box1 = O.recipe && O.recipe.containers ? O.recipe.containers[(marksOf(first, O.recipe, [], O.partialForm).box || 1) - 1] : null;
    const W = O.recipe && O.recipe.waves;
    const range = Array.isArray(O.range) ? O.range.slice()
      : box1 && box1.dyn === 'waves' && W ? [W.low, W.high] : (box1 && typeof box1.dyn === 'string' ? [box1.dyn] : null);
    // [2e.3 (8)] the block's word: the caller's change-of-technique rule (techTextOf) when it passes one, else the technique's word
    const techText = O.techTextOf ? O.techTextOf(first) : ((O.techTexts || {})[first.technique] || null);
    // [2f, §457 · §459] the line enters from nothing: the first note's cc7Fade from 0 (1d.8's 'fade in … from niente') — the opening sign
    // [2k.2] or, for a morph, its first sample under ppp (the bloom's first breath rises from under the scale's first name)
    const fadeFrom = ((first.cc7Fade && first.cc7Fade.from === 0) || (O.fadeFromUnder != null && samples[0] < O.fadeFromUnder - O.eps)) ? 'niente' : null;
    const entry = Object.assign({ event: 'ev-' + first.id, t: first.startSeconds, release: first.endSeconds, technique: first.technique,
      techText, range, rangeText: range ? range.join(' → ') : null, fadeFrom }, marksOf(first, O.recipe, warnings, O.partialForm, O.memberOf));
    const breaths = [];
    for (let i = 1; i < notes.length; i++) {
      const o = notes[i], p = notes[i - 1];
      if (O.pitchMoves) { breaths.push({ event: 'ev-' + o.id, onset: o.startSeconds, release: o.endSeconds, pitch: 'glide' }); continue; }
      const same = o.sonifyNote === p.sonifyNote && Math.abs(bendOf(o) - bendOf(p)) < 0.01;
      const b = { event: 'ev-' + o.id, onset: o.startSeconds, release: o.endSeconds, pitch: same ? 'same' : 'new' };
      if (!same) Object.assign(b, marksOf(o, O.recipe, warnings, O.partialForm));
      else b.midi = o.sonifyNote;
      breaths.push(b);
    }
    // [2f, §457 · §459] THE EXIT — where the line ends and whether it falls: the last sample's name, and the fall over the recipe's
    // fade-out span (8 s when the recipe names none) of at least one written step [the AI's rule, his to reverse]
    const last = notes[notes.length - 1];
    const spanOut = (O.recipe && O.recipe.edges && +O.recipe.edges.fadeOut) || 8;
    const iEnd = samples.length - 1, iOut = Math.max(0, iEnd - Math.round(spanOut * O.sps));
    const peakOut = Math.max(...samples.slice(iOut, iEnd + 1)), lastLv = samples[iEnd];
    const exit = { event: 'ev-' + last.id, t: +T1.toFixed(4), level: lastLv, fadeTo: nameOf(lastLv), fades: peakOut - lastLv >= 1 / 8 - 1e-6 };

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
          breaths, exit, labels,
        },
        provenance: 'authored',
      },
    };
  }

  return { forPart, writtenOf, nameOf, baseCc7At, fadeAt, writtenAt, centsText, marksOf, NAMES, DEFAULTS };
}));
