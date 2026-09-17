// morph_overlays.js — the morph-section notation, as overlays.
//
// One place computes the vocabulary the composer settled on day 35, so that
// BOTH the standalone page builder (tools/notate_morph.js) and the main-draft
// builder (tools/notate_section.js --morph <groupId>) produce the same thing.
// Read docs/MORPH_NOTATION.md before changing any number here.
//
// THE SEPTET'S RULES (PLAN 2h.2, 2026-09-14; docs/NOTATION_STANDARDS.md §3) are
// OPT-IN through `opts`: a caller that passes none gets the tuba's pages byte for
// byte (tools/test_morph_notation.js holds the hashes frozen before the change).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../score/public/sonify_core.js'), require('../../score/public/morph.js'));
  else root.MorphOverlays = factory(root.SonifyCore, root.Morph);
}(typeof self !== 'undefined' ? self : this, function (Core, Morph) {

  // capped at 25 anchors: past that the curve stops interpolating the gesture
  // and starts tracing the sounding data, wobble included
  const LADDER = [9, 13, 17, 21, 25];
  const NS = 400;
  const STEPS = { 0: ['C', 0], 1: ['C', 1], 2: ['D', 0], 3: ['D', 1], 4: ['E', 0], 5: ['F', 0],
                  6: ['F', 1], 7: ['G', 0], 8: ['G', 1], 9: ['A', 0], 10: ['A', 1], 11: ['B', 0] };

  function crom(P, x) {
    const n = P.length - 1, f = x * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u
      + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  }

  function sample(tones, T0, T1, kind, n) {
    const out = []; let last = 0;
    for (let i = 0; i <= n; i++) {
      const t = T0 + (i / n) * (T1 - T0);
      const o = tones.find(x => t >= x.startSeconds && t <= x.endSeconds);
      // PITCH IS note + bend. morphBend is kept inside +/-199 c by RE-SPELLING:
      // a far-travelling voice shifts note number and the bend re-centres ~97 c
      // the other way. Fitting the bend alone gave a 90 c error on CONVERGE that
      // no number of anchors could fix. (day 35)
      if (o) last = kind === 'bend'
        ? o.sonifyNote * 100 + Core.morphBendAt(o.morphBend, t - o.startSeconds)
        : Core.evalWaveCurve(o, (t - o.startSeconds) / (o.endSeconds - o.startSeconds));
      out.push(last);
    }
    return out;
  }
  // the anchor count is MEASURED: smallest whose rms is within 25 % of the best
  function fit(tones, T0, T1, kind, ns) {
    const fine = sample(tones, T0, T1, kind, 1200);
    const trials = LADDER.map(n => {
      const P = []; for (let k = 0; k < n; k++) P.push(fine[Math.round(k / (n - 1) * (fine.length - 1))]);
      let m = 0, ss = 0;
      for (let i = 0; i < fine.length; i++) { const d = Math.abs(crom(P, i / (fine.length - 1)) - fine[i]); if (d > m) m = d; ss += d * d; }
      return { n, P, max: m, rms: Math.sqrt(ss / fine.length) };
    });
    const best = Math.min(...trials.map(t => t.rms));
    const pick = trials.find(t => t.rms <= best * 1.25);
    // normalise to the curve's OWN min..max — the composer's principle: the
    // bottom of the drawn curve is the lowest pitch reached in the section,
    // the top the highest, whatever the interval
    const lo = Math.min(...fine), hi = Math.max(...fine), spread = (hi - lo) || 1;
    const samples = [];
    for (let i = 0; i <= ns; i++) samples.push(+Math.max(0, Math.min(1, (crom(pick.P, i / ns) - lo) / spread)).toFixed(5));
    return { samples, anchors: pick.n, max: pick.max, rms: pick.rms, fine, lo, hi };
  }

  // ---- the septet's rules (NOTATION_STANDARDS §3) ----
  //   sps           D47 / 2f.7: samples per second on both curves (>= 101 samples)
  //   noGlissUnderC D44: a voice whose whole travel is under this is crescendo-only, and ALERTED
  //   centsMin      D45: the signed residual is written only from this many cents
  //   transposeOf   part -> semitones, written = sounding + that (the ensemble; the IR stays sounding, D9)
  //   maxLayer      parts are the layers under this (the septet's META is 7, not the tuba's 10)
  const SEPTET = { sps: 100, noGlissUnderC: 20, centsMin: 7, transposeOf: null, maxLayer: 10 };

  // THE PITCH FIGURE'S SPELLER — D45 (§474). q is an absolute quarter-tone index (cents / 50,
  // C-1 = 0). Quarter-tone signs only, never three-quarter: every letter within two quarter
  // tones of q is a candidate, a natural beats any sign, and between two equally simple
  // spellings (A♯ / B♭, E¼♯ / F¼♭) the letter lies in the direction of travel — a rising voice
  // takes the upper letter's flat, a falling one the lower letter's sharp (M2: A3 → B♭).
  const NAT_Q = { C: 0, D: 4, E: 8, F: 10, G: 14, A: 18, B: 22 };
  const ACC_Q = { '-2': 'flat', '-1': 'quarterFlat', '0': null, '1': 'quarterSharp', '2': 'sharp' };
  function spellQ(q, dir) {
    const pc = ((q % 24) + 24) % 24, cands = [];
    for (const step of Object.keys(NAT_Q)) for (const a of [pc - NAT_Q[step], pc - NAT_Q[step] - 24, pc - NAT_Q[step] + 24]) {
      if (Math.abs(a) > 2) continue;
      cands.push({ step, alterQ: a, octave: Math.floor((q - a) / 24) - 1 });
    }
    cands.sort((x, y) => ((x.alterQ !== 0) - (y.alterQ !== 0)) || (dir < 0 ? y.alterQ - x.alterQ : x.alterQ - y.alterQ));
    const c = cands[0];
    return { spelled: { step: c.step, alter: c.alterQ / 2, octave: c.octave }, acc: ACC_Q[String(c.alterQ)] };
  }
  // the destination on the quarter-tone grid: the NEAREST grid point, a tie at exactly 25 c
  // going TOWARD THE START (C +25 / C −25, §474 item 4); the residual is what is left
  function nearestGrid(destC, startC) {
    const D = Math.round(destC), lo = Math.floor(D / 50) * 50, hi = lo + 50, r = D - lo;
    const g = r < 25 ? lo : r > 25 ? hi : (Math.abs(startC - lo) <= Math.abs(startC - hi) ? lo : hi);
    return { grid: g, residual: D - g };
  }
  const signed = c => (c > 0 ? '+' : '−') + Math.abs(c);

  // Catmull-Rom through anchors at their own TIMES (the breath peaks are not evenly spaced):
  // cubic Hermite, each tangent the chord of its two neighbours — LIMITED (Fritsch–Carlson) so the
  // arc never passes above or below the anchors either side of it. Plain Catmull-Rom sagged 8.4 %
  // under two 0.23 breaths 16 s apart (M1's viola) and overshot the peaks by up to 2.7 %: D47's
  // "never sags", and D46's "the height is the level reached", both need the limit. Flat outside.
  function tangentsTimed(A) {
    const n = A.length, d = [], m = new Array(n).fill(0);
    for (let k = 0; k + 1 < n; k++) d.push((A[k + 1][1] - A[k][1]) / ((A[k + 1][0] - A[k][0]) || 1));
    for (let k = 0; k < n; k++) {
      if (k === 0) m[k] = d[0] || 0;
      else if (k === n - 1) m[k] = d[n - 2] || 0;
      else m[k] = d[k - 1] * d[k] <= 0 ? 0 : (A[k + 1][1] - A[k - 1][1]) / ((A[k + 1][0] - A[k - 1][0]) || 1);
    }
    for (let k = 0; k + 1 < n; k++) {
      if (d[k] === 0) { m[k] = 0; m[k + 1] = 0; continue; }
      if (Math.sign(m[k]) !== Math.sign(d[k])) m[k] = 0;
      if (Math.sign(m[k + 1]) !== Math.sign(d[k])) m[k + 1] = 0;
      const a = m[k] / d[k], b = m[k + 1] / d[k], s = a * a + b * b;
      if (s > 9) { const tau = 3 / Math.sqrt(s); m[k] = tau * a * d[k]; m[k + 1] = tau * b * d[k]; }
    }
    return m;
  }
  function cromTimed(A, t, M) {
    const n = A.length;
    if (n === 1 || t <= A[0][0]) return A[0][1];
    if (t >= A[n - 1][0]) return A[n - 1][1];
    const m = M || tangentsTimed(A);
    let i = 0; while (i < n - 2 && t > A[i + 1][0]) i++;
    const t1 = A[i][0], p1 = A[i][1], t2 = A[i + 1][0], p2 = A[i + 1][1], h = t2 - t1, u = (t - t1) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p1 + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * p2 + (u3 - u2) * h * m[i + 1];
  }

  // Build every overlay one part of one morph group needs.
  //   objects : the score's waveCurve objects (any superset)
  //   groupId : e.g. 'grp-act-bloom-01-01'
  //   part    : 0-9
  //   idBase  : prefix for overlay ids, so two callers cannot collide
  //   opts    : absent = the tuba's rules exactly; present = the septet's (SEPTET above)
  function forPart(objects, groupId, part, idBase, opts) {
    const tones = objects
      .filter(o => o.groupId === groupId && o.layer === part && o.type === 'waveCurve')
      .sort((a, b) => a.startSeconds - b.startSeconds);
    if (!tones.length) return null;
    const T0 = tones[0].startSeconds, T1 = tones[tones.length - 1].endSeconds;
    if (opts) return forPartSeptet(tones, part, idBase, Object.assign({}, SEPTET, opts), T0, T1);

    const G = fit(tones, T0, T1, 'bend', NS), L = fit(tones, T0, T1, 'level', NS);

    const baseMidi = tones[0].sonifyNote;
    const extent = G.hi - G.lo, startC = G.fine[0];
    const dir = (G.hi - startC) >= (startC - G.lo) ? 1 : -1;
    // a non-zero glissando is written as AT LEAST one quarter tone, in the
    // direction it travels — a choice to show the gesture, not a rounding
    const qSteps = Math.max(extent > 1 ? 1 : 0, Math.round(extent / 50));
    const acc = qSteps === 0 ? null : (dir > 0 ? 'quarterSharp' : 'quarterFlat');
    const accOn = qSteps === 0 ? null : (dir > 0 ? 'high' : 'low');
    const sp = STEPS[((baseMidi % 12) + 12) % 12];
    const spelled = { step: sp[0], alter: sp[1], octave: Math.floor(baseMidi / 12) - 1 };

    const pfx = idBase + '-p' + part;
    const overlays = [
      { id: 'ov-cresc-' + pfx, kind: 'cresc', target: { part, span: [T0, T1] },
        value: { samples: L.samples, fit: L.anchors + ' anchors; max ' + L.max.toFixed(3) },
        provenance: 'authored' },
      { id: 'ov-header-' + pfx, kind: 'header', target: { part, t: T0 },
        value: { endMark: 'fff', acc, accOn, oneHead: qSteps === 0 }, provenance: 'authored' },
    ];
    if (qSteps > 0) overlays.unshift(
      { id: 'ov-gliss-' + pfx, kind: 'gliss', target: { part, span: [T0, T1] },
        value: { samples: G.samples, fit: G.anchors + ' anchors; max ' + G.max.toFixed(2) + ' c' },
        provenance: 'authored' });

    tones.forEach((o, i) => {
      overlays.push({ id: 'ov-dev-' + pfx + '-' + (i + 1), kind: 'engraving',
        target: { event: 'ev-' + o.id },
        value: { device: {
          goLine: true,
          // NO onset heads anywhere on the curve — settled day 35. The go line is
          // the only per-breath mark. A beating-speed indicator may join it later.
          onsetHead: false, onsetAcc: null,
          brick: false, nhUnit: false, gc: false, ringBar: false,
          curve: false, cut: false, dynPair: false, dynMark: false, techText: false
        } }, provenance: 'authored' });
    });

    return { part, tones, T0, T1, G, L, baseMidi, spelled, extent, qSteps, acc, overlays };
  }

  // D45's two heads from the SOUNDING quarter-tone grid at a transposition (tq, in quarter tones): the start, and the destination,
  // whose plain spelling on the altered start's own line takes a natural. [PLAN 2k] shared with layout.js, which re-spells a header
  // for a realization written at another transposition.
  function spellHeads(startQ, destQ, dir, tq) {
    const h1 = spellQ(startQ + tq, dir);
    const heads = [{ spelled: h1.spelled, acc: h1.acc }];
    if (destQ != null) {
      const h2 = spellQ(destQ + tq, dir);
      const cancel = !h2.acc && h1.acc && h2.spelled.step === h1.spelled.step && h2.spelled.octave === h1.spelled.octave;
      heads.push({ spelled: h2.spelled, acc: cancel ? 'natural' : h2.acc, cents: null });
    }
    return heads;
  }

  // THE SEPTET'S PART (PLAN 2h.2). The events, the go lines and the overlay kinds are the
  // tuba's; what differs is decided in NOTATION_STANDARDS §3, one rule per block below.
  function forPartSeptet(tones, part, idBase, S, T0, T1) {
    const ns = Math.max(100, Math.ceil((T1 - T0) * S.sps));      // D47 / 2f.7: 100 per second, >= 101 samples
    const alerts = [];

    // THE GLISS CURVE stays the tuba's: the ladder fit of the pitch, normalised to its extremes
    const G = fit(tones, T0, T1, 'bend', ns);
    if (G.max > 25) alerts.push('part ' + part + ': the gliss fit misses by ' + G.max.toFixed(1) + ' c (over 25 = the wrong quarter tone) — the curve cannot say this voice (MORPH_NOTATION)');

    // THE TRAVEL, read every 10 ms so the written residual is the pitch reached, not a sample of it
    const dense = sample(tones, T0, T1, 'bend', Math.max(1200, Math.ceil((T1 - T0) * 100)));
    const startC = dense[0];
    let lo = Infinity, hi = -Infinity;
    for (const c of dense) { if (c < lo) lo = c; if (c > hi) hi = c; }
    const extent = hi - lo;
    const dir = (hi - startC) >= (startC - lo) ? 1 : -1;
    // D44: a voice that barely moves is crescendo-only — one written pitch, no gliss — and SAID
    const glissOn = extent >= S.noGlissUnderC;
    if (!glissOn) alerts.push('D44: part ' + part + ' travels ' + extent.toFixed(1) + ' c (under ' + S.noGlissUnderC + ') — written crescendo-only, one pitch; his to look at (NOTATION_STANDARDS §3)');

    // D45: the pitch figure in TIME order, spelled on the quarter-tone grid in WRITTEN pitch
    const trS = (S.transposeOf && S.transposeOf(part)) || 0, tq = 2 * trS;
    const start = nearestGrid(startC, startC);
    if (Math.abs(start.residual) >= S.centsMin) alerts.push('D45: part ' + part + ' starts ' + signed(start.residual) + ' c off the quarter-tone grid — the header writes no residual on the start');
    let dest = null;
    if (glissOn) dest = nearestGrid(dir > 0 ? hi : lo, startC);
    // [PLAN 2k, D55 — 2026-09-16] the heads are spelled from the SOUNDING grid through spellHeads — the function layout.js calls again
    // when a realization writes the part at another transposition (the presentation's bass clarinet in C); the header records the
    // sounding grid (q, in quarter tones), the direction and the transposition it was written at (writtenAt)
    const heads = spellHeads(start.grid / 50, dest ? dest.grid / 50 : null, dir, tq);
    if (dest) heads[1].cents = Math.abs(dest.residual) >= S.centsMin ? signed(dest.residual) : null;

    // D46 + D47: THE CRESCENDO — absolute (the level itself, 0-1, the D32 fade weight multiplied in),
    // drawn through ONE ANCHOR PER BREATH at its loudest point, the ends anchored where the sound
    // starts and stops; no floor, no normalisation
    const lvl = (o, t) => Core.evalWaveCurve(o, Math.max(0, Math.min(1, (t - o.startSeconds) / (o.endSeconds - o.startSeconds))))
      * Morph.fadeWeight(o.cc7Fade, t);
    const A = [[T0, lvl(tones[0], T0)]];
    for (const o of tones) {
      const n = Math.max(20, Math.ceil((o.endSeconds - o.startSeconds) * 100)), vs = [];
      for (let k = 0; k <= n; k++) { const t = o.startSeconds + (k / n) * (o.endSeconds - o.startSeconds); vs.push([t, lvl(o, t)]); }
      let top = 0, at = 0;
      vs.forEach((v, k) => { if (v[1] > top) { top = v[1]; at = k; } });
      // a held peak (a plateau) anchors at its middle, not its first sample
      let end = at; while (end + 1 < vs.length && vs[end + 1][1] >= top - 0.005) end++;
      A.push([(vs[at][0] + vs[end][0]) / 2, top]);
    }
    A.push([T1, lvl(tones[tones.length - 1], T1)]);
    if (A[1][0] - A[0][0] < 0.25) A.shift();                                   // a breath peaking at its entry
    if (A.length > 1 && A[A.length - 1][0] - A[A.length - 2][0] < 0.25) A.pop();
    const cresc = [], MT = tangentsTimed(A);
    for (let i = 0; i <= ns; i++) cresc.push(+Math.max(0, Math.min(1, cromTimed(A, T0 + (i / ns) * (T1 - T0), MT))).toFixed(5));

    const pfx = idBase + '-p' + part;
    const overlays = [
      { id: 'ov-cresc-' + pfx, kind: 'cresc', target: { part, span: [T0, T1] },
        value: { samples: cresc, fit: (A.length) + ' breath-peak anchors, absolute (D46, D47); ' + ns + ' intervals' },
        provenance: 'authored' },
      { id: 'ov-header-' + pfx, kind: 'header', target: { part, t: T0 },
        value: { figure: 'D45', endMark: 'fff', oneHead: !glissOn, heads, travelC: +extent.toFixed(1), q: [start.grid / 50, dest ? dest.grid / 50 : null], dir, writtenAt: trS }, provenance: 'authored' },
    ];
    if (glissOn) overlays.unshift(
      { id: 'ov-gliss-' + pfx, kind: 'gliss', target: { part, span: [T0, T1] },
        value: { samples: G.samples, fit: G.anchors + ' anchors; max ' + G.max.toFixed(2) + ' c; ' + ns + ' intervals' },
        provenance: 'authored' });
    tones.forEach((o, i) => {
      overlays.push({ id: 'ov-dev-' + pfx + '-' + (i + 1), kind: 'engraving',
        target: { event: 'ev-' + o.id },
        value: { device: {
          goLine: true, onsetHead: false, onsetAcc: null,
          brick: false, nhUnit: false, gc: false, ringBar: false,
          curve: false, cut: false, dynPair: false, dynMark: false, techText: false
        } }, provenance: 'authored' });
    });

    return { part, tones, T0, T1, G, L: { samples: cresc, anchors: A }, baseMidi: tones[0].sonifyNote,
      extent, startC, destC: glissOn ? (dir > 0 ? hi : lo) : null, dest, heads, qSteps: glissOn ? 1 : 0, acc: null, alerts, overlays };
  }

  // Every part of a group. `parts` optional; defaults to whatever the group has.
  function forGroup(objects, groupId, parts, idBase, opts) {
    const maxLayer = opts && opts.maxLayer != null ? opts.maxLayer : 10;
    const present = [...new Set(objects
      .filter(o => o.groupId === groupId && o.type === 'waveCurve' && o.layer < maxLayer)
      .map(o => o.layer))].sort((a, b) => a - b);
    const want = parts && parts.length ? present.filter(p => parts.indexOf(p) >= 0) : present;
    return want.map(p => forPart(objects, groupId, p, idBase || groupId, opts)).filter(Boolean);
  }

  return { forPart, forGroup, crom, cromTimed, tangentsTimed, spellQ, spellHeads, nearestGrid, SEPTET, LADDER };
}));
