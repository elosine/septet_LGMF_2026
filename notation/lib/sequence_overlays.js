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
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../score/public/sonify_core.js'), require('../../score/public/morph.js'), require('../../score/public/dyn_table.js'), require('./morph_overlays.js'));
  else root.SequenceOverlays = factory(root.SonifyCore, root.Morph, root.DynTable, root.MorphOverlays);
}(typeof self !== 'undefined' ? self : this, function (Core, Morph, DynTable, MorphOv) {
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
    const pm = partialMarks(c.partial, pitchX, take, formOf, w => warnings.push(o.id + ': ' + w));
    return Object.assign(out, { partial: pm.partial, fundamental: pm.fundamental, fundamentalMidi: pm.fundamentalMidi, box: boxN, take, partialText: pm.partialText });
  }

  // [RUNNING_LOG §680] THE PARTIAL'S NAME, one copy — the start head's (marksOf) and a morph's destination on its arrival take (the
  // extractor): the fundamental COMPUTED from the pitch (in keys, fractional) and the partial, spelled from the take's name when the name
  // agrees (`Just-Eb1-seed100` → E♭1), else by sharps; the text by the rule's form.
  function partialMarks(partial, pitchX, take, formOf, warn) {
    const fMidiX = pitchX - 12 * Math.log2(partial), fMidi = Math.round(fMidiX);
    if (Math.abs(fMidiX - fMidi) > 0.05 && warn) warn('partial ' + partial + ' puts the fundamental ' + ((fMidiX - fMidi) * 100).toFixed(1) + ' c off a key');
    let fName = STEP_NAMES[((fMidi % 12) + 12) % 12] + (Math.floor(fMidi / 12) - 1);
    const tm = /-([A-Ga-g])(b|#|♭|♯)?(-?\d)-/.exec('-' + (take || '') + '-');
    if (tm) {
      const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, L = tm[1].toUpperCase();
      const alt = tm[2] === 'b' || tm[2] === '♭' ? -1 : tm[2] === '#' || tm[2] === '♯' ? 1 : 0;
      const nm = PC[L] + alt + 12 * (+tm[3] + 1);
      if (nm === fMidi) fName = L + (alt < 0 ? '♭' : alt > 0 ? '♯' : '') + tm[3];
    }
    return { partial, fundamental: fName, fundamentalMidi: fMidi,
      partialText: String(formOf || '{n} ({f})').replace('{n}', partial).replace('{f}', fName) };   // [2e.3 (5), §438] 26 (C1) — rules.json objects.number.partialForm
  }

  // ─── LGMF PLAN 2l — THE VOLUME CURVE PROTOCOL (§513 … §522): the performance curve drawn from the intention, not the fader. ───
  // OPT-IN: a caller that passes no `law` / `labels` gets the trace above, to the byte (the vibraphone's reader, vib_marks.js, reads
  // `writtenAt` — the trace — and is untouched).
  //
  // [2l.2 — §517, his "yes"] THE LINE IN WRITTEN HEIGHT (rules.json objects.crescCurve.law "written"): a FADER-FIRST line redrawn
  // from what the generator wrote — each note's two fader ends (`cc7Abs lo · hi`) READ through the part's ladder (the ladder reads,
  // it draws nothing; the ends are not always names — 39 of 894 in Draft 01 sit more than 2 CC7 off one, so none is imposed), the
  // note's own shape mapped LINEARLY between the two, a fade (`cc7Fade`) a STRAIGHT line from its start to its end — from 0 or to 0,
  // the body inside it not drawn — and the bridge across a breath gap straight. The result is a polyline, its vertices in time;
  // two vertices at one time are a jump (a note cut by the next note's onset).
  function writtenVertices(notes, T0, T1, L) {
    const V = [];
    const push = (t, h) => { const p = V[V.length - 1]; if (p && Math.abs(p[0] - t) < 1e-6 && Math.abs(p[1] - h) < 1e-9) return; V.push([t, h]); };
    notes.forEach((o, k) => {
      const nx = notes[k + 1], ts = o.startSeconds, dur = o.endSeconds - o.startSeconds;
      let te = Math.min(o.endSeconds, T1);
      if (nx && nx.startSeconds < te) te = nx.startSeconds;
      if (!(te > ts)) return;
      const abs = o.cc7Abs || { lo: 0, hi: 127 };
      const wLo = writtenOf(abs.lo != null ? abs.lo : 0, L), wHi = writtenOf(abs.hi != null ? abs.hi : 127, L);
      const hb = t => wLo + (wHi - wLo) * Math.max(0, Math.min(1, Core.evalWaveCurve(o, dur > 0 ? (t - ts) / dur : 0)));
      const F = o.cc7Fade && o.cc7Fade.end > o.cc7Fade.start ? o.cc7Fade : null;
      const fFrom = F ? (F.from != null ? F.from : 0) : 1, fTo = F ? (F.to != null ? F.to : 1) : 1;
      const A = F ? [F.start, fFrom * hb(F.start)] : null, B = F ? [F.end, fTo * hb(F.end)] : null;
      const h = t => !F ? hb(t) : t <= F.start ? fFrom * hb(t) : t >= F.end ? fTo * hb(t) : A[1] + (B[1] - A[1]) * (t - A[0]) / (B[0] - A[0]);
      const at = [ts, te];
      const inFade = t => F && t > F.start && t < F.end;
      (o.nodes || []).forEach((nd, i) => {
        const t = ts + nd.pos * dur;
        if (t > ts && t < te && !inFade(t)) at.push(t);
        // a segment that is not a straight line (every sequence segment is power/0 today): its shape kept at 10 points a second
        const sg = (o.segments || [])[i], nx2 = (o.nodes || [])[i + 1];
        if (sg && nx2 && !((sg.model === 'power' || sg.model === 'bezier' || !sg.model) && !(+sg.slope))) {
          const t2 = ts + nx2.pos * dur;
          for (let u = t + 0.1; u < t2; u += 0.1) if (u > ts && u < te && !inFade(u)) at.push(u);
        }
      });
      if (F) { if (F.start > ts && F.start < te) at.push(F.start); if (F.end > ts && F.end < te) at.push(F.end); }
      at.sort((a, b) => a - b).forEach(t => push(t, h(t)));
    });
    return V;
  }
  // [2l.2 — §519, his "b"] THE EASE (rules.json objects.crescCurve.easeS · easeCap): at every corner of the polyline (the slope
  // changes) a cubic Hermite on each side over w = min(easeS, easeCap × each neighbouring segment) — the corner's own height KEPT (the
  // level reached, D46), its tangent 0 where the line TURNS and the harmonic mean of the two slopes where it bends the same way
  // (Fritsch–Butland: never an overshoot), C¹ where the ease meets the straight line. A jump and the line's two ends are not eased.
  function sampleLine(V, T0, T1, n, O) {
    const E = V.map(() => null);
    for (let j = 1; j < V.length - 1; j++) {
      const dl = V[j][0] - V[j - 1][0], dr = V[j + 1][0] - V[j][0];
      if (dl < 1e-6 || dr < 1e-6) continue;
      const mL = (V[j][1] - V[j - 1][1]) / dl, mR = (V[j + 1][1] - V[j][1]) / dr;
      if (Math.abs(mR - mL) < 1e-9) continue;
      const w = Math.min(O.easeS, O.easeCap * dl, O.easeCap * dr);
      if (w > 1e-4) E[j] = { w, mL, mR, m: mL * mR <= 0 ? 0 : 2 * mL * mR / (mL + mR) };
    }
    const herm = (u, p0, m0, p1, m1, w) => { const u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * w * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * w * m1; };
    const out = [];
    let j = 0;
    for (let i = 0; i <= n; i++) {
      const t = T0 + i * (T1 - T0) / n;
      while (j + 1 < V.length - 1 && V[j + 1][0] <= t) j++;
      const a = V[j], b = V[Math.min(j + 1, V.length - 1)], d = b[0] - a[0];
      let h = d > 1e-9 ? a[1] + (b[1] - a[1]) * Math.max(0, Math.min(1, (t - a[0]) / d)) : b[1];
      const ea = E[j], eb = E[j + 1];
      if (ea && t >= a[0] && t - a[0] < ea.w) h = herm((t - a[0]) / ea.w, a[1], ea.m, a[1] + ea.mR * ea.w, ea.mR, ea.w);
      else if (eb && t <= b[0] && b[0] - t < eb.w) h = herm((t - (b[0] - eb.w)) / eb.w, b[1] - eb.mL * eb.w, eb.mL, b[1], eb.m, eb.w);
      out.push(+Math.max(0, Math.min(1, h)).toFixed(5));
    }
    return out;
  }
  // [2l.4 — §522, his "ok this is good"] THE LABELS WHERE THE LINE REACHES A NAME (rules.json objects.dynamicLabel): the candidates —
  // every CROSSING of a name's height, up or down, at its interpolated time, and every TURN (a crest or a trough — the level reached,
  // placed where its plateau begins, named by the nearest name) — in time order; a candidate within `minGapS` of the last kept is
  // dropped, unless it is a turn and the last kept a crossing (`turnWins`: the turn replaces it); a candidate with the last kept's
  // name is dropped (`noRepeat`); niente is never a label (the fade signs say it). "You are here": the brackets are a reading.
  function labelsReached(samples, T0, T1, n, LB, eps) {
    const dt = (T1 - T0) / n, C = [];
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1], b = samples[i];
      if (a === b) continue;
      for (let k = 1; k <= 8; k++) {
        const y = k / 8;
        if ((a < y && y <= b) || (a > y && y >= b)) C.push({ t: T0 + (i - 1 + (y - a) / (b - a)) * dt, mark: NAMES[k - 1], kind: 'cross', level: y });
      }
    }
    let dir = 0, ext = 0;
    for (let i = 1; i < samples.length; i++) {
      const d = samples[i] - samples[i - 1], s = Math.abs(d) < eps ? 0 : Math.sign(d);
      if (s === 0) continue;
      if (dir !== 0 && s !== dir) { const mark = nameOf(samples[ext]); if (mark !== 'niente') C.push({ t: T0 + ext * dt, mark, kind: dir > 0 ? 'crest' : 'trough', level: samples[ext] }); }
      dir = s; ext = i;
    }
    C.sort((x, y) => x.t - y.t || (x.kind === 'cross' ? 0 : 1) - (y.kind === 'cross' ? 0 : 1));
    const K = [];
    for (const c of C) {
      const save = K.slice();
      let drop = false;
      while (K.length && c.t - K[K.length - 1].t < LB.minGapS) {
        if (LB.turnWins && c.kind !== 'cross' && K[K.length - 1].kind === 'cross') { K.pop(); continue; }
        drop = true; break;
      }
      if (!drop && LB.noRepeat && K.length && K[K.length - 1].mark === c.mark) drop = true;
      if (drop) { K.length = 0; K.push(...save); continue; }
      K.push(c);
    }
    return K.map(x => ({ t: +x.t.toFixed(3), mark: x.mark, kind: x.kind, level: +x.level.toFixed(5) }));
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
    // [2l.2] the line in written height, eased — or the trace (no `law`: the caller's line as it always was)
    const written = O.law === 'written' && O.level !== 'arc';
    // [2l.3 — §516 · §518, his "a" · "a"] a MORPH's line is ONE ARC through its breath peaks — #5's D47 builder (morph_overlays.js
    // breathPeakAnchors · arcThrough, the code shared), each anchor's height the breath's level READ through the part's ladder (the
    // trace's `writtenAt`, the fade weight in: since `1s` every breath carries its own cc7Abs, so #5's "0 … 1 is the level" no longer
    // holds); the ladder reads the anchors and draws nothing; no bridge — the arc is continuous
    const arc = O.level === 'arc' && MorphOv ? MorphOv.breathPeakAnchors(notes, T0, T1, (o, t) => writtenAt(o, t, L), O.arc && O.arc.entryDropS) : null;
    const samples = written ? sampleLine(writtenVertices(notes, T0, T1, L), T0, T1, n, O) : arc ? MorphOv.arcThrough(arc, T0, T1, n) : [];
    let k = 0;
    for (let i = 0; !written && !arc && i <= n; i++) {
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
    // [2l.4] where the line reaches a name, when the caller passes the rule (rules.json objects.dynamicLabel); else the turns
    const labels = O.labels ? labelsReached(samples, T0, T1, n, O.labels, O.eps) : [];
    let dir = 0, extremeAt = 0;
    for (let i = 1; !O.labels && i < samples.length; i++) {
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
    let exit = { event: 'ev-' + last.id, t: +T1.toFixed(4), level: lastLv, fadeTo: nameOf(lastLv), fades: peakOut - lastLv >= 1 / 8 - 1e-6 };
    // [2l.2 — §517] under the written law the closing sign follows the RECIPE, not a measured drop: the recipe fades out (`edges.fadeOut`
    // > 0) and this part is one that leaves on it — its last note carries the fade to nothing (`cc7Fade` to 0) or ends ON the recipe's
    // written dynamic (1d.8's ramp in the note's own level) — and the line's end is inside the window
    if (O.law === 'written' && O.recipe) {
      const E = O.recipe.edges || {}, to = E.fadeOutTo || 'niente', F = last.cc7Fade;
      const leaves = +E.fadeOut > 0 && last.endSeconds <= T1 + 1e-6
        && (to === 'niente' ? !!(F && F.end > F.start && F.to === 0 && (F.from == null || F.from > 0)) : nameOf(writtenAt(last, last.endSeconds, L)) === to);
      exit = { event: 'ev-' + last.id, t: +T1.toFixed(4), level: lastLv, fadeTo: to, fades: leaves, by: 'recipe' };
    }
    // [2l.3] on the ARC: the end at least one written step (⅛) under the last breath's peak → the closing sign to the end's name
    // [the AI's call — a morph has no recipe fade; 2f's rule on the arc]
    if (arc) {
      const lastPeak = arc.length > 1 && Math.abs(arc[arc.length - 1][0] - T1) < 1e-6 ? arc[arc.length - 2] : arc[arc.length - 1];
      exit = { event: 'ev-' + last.id, t: +T1.toFixed(4), level: lastLv, fadeTo: nameOf(lastLv), fades: lastPeak[1] - lastLv >= 1 / 8 - 1e-6, by: 'arc' };
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
          level: Object.assign({ sps: O.sps, t0: +T0.toFixed(4), t1: +T1.toFixed(4), samples }, arc ? { anchors: arc.map(p => [+p[0].toFixed(3), +p[1].toFixed(5)]) } : {}),
          breaths, exit, labels,
        },
        provenance: 'authored',
      },
    };
  }

  return { forPart, writtenOf, nameOf, baseCc7At, fadeAt, writtenAt, centsText, marksOf, partialMarks, NAMES, DEFAULTS };
}));
