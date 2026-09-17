// extract_core.js — pure S1 → IR extraction (Phase B1, plan DB-6).
// Dual-load (node + browser). No filesystem access: caller supplies the
// parsed score, the registry, and the sample-length bank.
//
// Trance-scope segmentation (DB-6): per part, staccato/cuivre events form a
// STREAM while consecutive inter-onset intervals are integer multiples of a
// shared pulse unit (approx-GCD refined, least-squares fitted). Runs of >= 2
// promote to class trance-stream; singletons stay fixed-oneshot. ord/fp
// material chunks singly, strategy unresolved (realization is material-time,
// amendment 1). Derived ids are deterministic (spec §1): ev-<objectId>,
// ch-<part>-<firstEventObjectId>; per-chunk group/device ids derive from the
// chunk's source id so they stay unique and stable.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./classify.js'), require('../../score/public/sonify_core.js'));
  } else {
    root.NotationExtract = factory(root.NotationClassify, root.SonifyCore);
  }
})(typeof self !== 'undefined' ? self : this, function (Classify, SonifyCore) {

  const DEFAULTS = {
    TOL: 0.015,        // s — onset tolerance for grid membership (trance is near-exact)
    GAPMAX: 4.0,       // s — a gap beyond this always breaks a run (section break)
    KMAX: 12,          // max grid multiples a single gap may span inside a run
    MAXUNIT: 2.0,      // s — a first-IOI above this starts no stream
    PLAYABLE: 0.09,    // s — D43 playable-unit floor: below it, strategy=proportional;
                       //     ALSO the rebase floor (see segment) — a rebased unit finer
                       //     than a playable pulse is a fabricated grid, the E1
                       //     false-positive one level down
    BEAT_MIN: 0.3,     // s — countable-beat floor for the subdivision choice
    // --- 'section1' profile (played material; E1's frame, D43's constraints) ---
    SEG_K: 2.0,        // split when a gap exceeds SEG_K × the local median IOI…
    SEG_FLOOR: 0.35,   // …with this absolute floor on the split threshold (s)
    MINRUN: 6,         // a group below this is residue, not a bar (D43: "a chunk of 3 notes is useless")
    EPS: 0.02,         // s — per-onset tolerance for a metric fit (THE open ε dial, A1 §8 row 3)
    UNIT_MAX: 1.0,     // s — no pulse slower than this inside a fitted bar
    // [2a.4, the septet] with options.chords: notes of one player within this
    // of a group's FIRST onset are one chord. Its own number, not TOL (the
    // tuba's grid tolerance): a played chord spreads 10-30 ms — measured on
    // piece-septet's piano, a triad at 432.337 / .345 / .353 s (16 ms), whose
    // third note a 15 ms window split off into a collision a step away
    // (RUNNING_LOG §384) — while the fastest written rhythm here is 130 ms.
    CHORD_TOL: 0.04,
    // [PLAN 2f.3, 2026-09-13] with options.trills: the composer score's trill ZONES
    // (midiModel 'trill') become events of env 'trill', and a note a trill has eaten
    // (stamped mutedBy) is not extracted — its attack is the trill's. Off = every
    // page extracts exactly as before (docs/TRILL_NOTATION_SPEC.md §1).
    trills: false,
    // [2f.7, 2026-09-13, RUNNING_LOG §450-§451] with options.trillRate (samples per second): a trill's drawn level is
    // sampled by TIME, never fewer than 101 — the two-piano piece's pre-baked curves (100/s). 0 = the fixed 101 of
    // piece #4's swells, which a 17 s trill spread 28 px apart at the video scale (the corners the composer saw).
    trillRate: 0,
    // the curve windows a trill reads by name — composer.html CURVE_LAYERS / CURVE_NAMES
    CURVE_WINDOWS: { A: 8, B: 9, C: 10 },
  };

  const PC = { 0: ['C', 0], 1: ['C', 1], 2: ['D', 0], 3: ['D', 1], 4: ['E', 0], 5: ['F', 0], 6: ['F', 1], 7: ['G', 0], 8: ['G', 1], 9: ['A', 0], 10: ['A', 1], 11: ['B', 0] };
  function naiveSpell(midi) {
    const pc = ((midi % 12) + 12) % 12;
    const [step, alter] = PC[pc];
    return { step, alter, octave: Math.floor(midi / 12) - 1 };
  }

  // ---- [PLAN 2f.3] trills ----
  // THE NEIGHBOUR'S SPELLING (TRILL_NOTATION_SPEC §1): a trill is a SECOND, so the
  // neighbour takes the next letter name up from the main note's spelling (C + 1 =
  // D-flat, never C-sharp); a double sharp or flat falls back to the plain speller.
  const STEPS = 'CDEFGAB', NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function spellNeighbour(main, midi) {
    const si = STEPS.indexOf(main.step);
    const step = STEPS[(si + 1) % 7];
    const octave = main.octave + (main.step === 'B' ? 1 : 0);
    const alter = midi - ((octave + 1) * 12 + NAT[step]);
    return Math.abs(alter) > 1 ? naiveSpell(midi) : { step, alter, octave };
  }
  // THE CURVE A TRILL READS — composer.html's own math, ported line for line so the
  // page draws what playback follows: trillRefResolved (auto = the A window if a curve
  // there overlaps the span, else the lane's own drawn curve, else flat), refCurvesOn
  // (drawn curves only — never a note, a META shape or a container), curvesLevelAt (the
  // covering curve, else the nearest one's nearer edge, else the trill's flat level) and
  // getYAtPos (WITH its smooth blend, which sonify_core.evalWaveCurve does not have).
  function curveYAtPos(wc, pos) {
    const nodes = wc.nodes, segments = wc.segments || [];
    if (!nodes || nodes.length < 2) return 0;
    const seg = SonifyCore.computeSegY;
    pos = Math.max(0, Math.min(1, pos));
    for (let i = 1; i < nodes.length - 1; i++) {
      const s = nodes[i].smooth != null ? nodes[i].smooth : 0;
      if (s <= 0) continue;
      const leftLen = nodes[i].pos - nodes[i - 1].pos, rightLen = nodes[i + 1].pos - nodes[i].pos;
      const radius = s * Math.min(leftLen, rightLen) * 0.5;
      if (radius <= 0) continue;
      const lb = nodes[i].pos - radius, rb = nodes[i].pos + radius;
      if (pos < lb || pos > rb) continue;
      const zw = rb - lb;
      if (zw <= 0) continue;
      const u = (pos - lb) / zw;
      const lSeg = segments[i - 1] || { model: 'bezier', slope: 0 };
      const rSeg = segments[i] || { model: 'bezier', slope: 0 };
      const lT = leftLen > 0 ? Math.min(1, (lb - nodes[i - 1].pos) / leftLen) : 0;
      const rT = rightLen > 0 ? Math.min(1, (rb - nodes[i].pos) / rightLen) : 0;
      const yL = seg(lSeg, nodes[i - 1].y / 10, nodes[i].y / 10, lT) * 10;
      const yR = seg(rSeg, nodes[i].y / 10, nodes[i + 1].y / 10, rT) * 10;
      const eps = Math.max(radius * 0.01, 1e-6);
      const lTe = leftLen > 0 ? Math.min(1, (lb + eps - nodes[i - 1].pos) / leftLen) : 0;
      const yLp = seg(lSeg, nodes[i - 1].y / 10, nodes[i].y / 10, lTe) * 10;
      const slopeL = (yLp - yL) / eps;
      const rTe = rightLen > 0 ? Math.max(0, (rb - eps - nodes[i].pos) / rightLen) : 0;
      const yRm = seg(rSeg, nodes[i].y / 10, nodes[i + 1].y / 10, rTe) * 10;
      const slopeR = (yR - yRm) / eps;
      const m0 = slopeL * zw, m1 = slopeR * zw;
      const u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * yL + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * yR + (u3 - u2) * m1;
    }
    for (let i = 0; i < nodes.length - 1; i++) {
      if (pos >= nodes[i].pos && pos <= nodes[i + 1].pos) {
        const segLen = nodes[i + 1].pos - nodes[i].pos;
        const segT = segLen > 0 ? (pos - nodes[i].pos) / segLen : 0;
        return seg(segments[i] || { model: 'bezier', slope: 0 }, nodes[i].y / 10, nodes[i + 1].y / 10, segT) * 10;
      }
    }
    return nodes[nodes.length - 1].y;
  }
  function curveYAtTime(wc, sec) {
    if (!wc.nodes || wc.nodes.length < 2) return 0;
    const dur = wc.endSeconds - wc.startSeconds;
    if (dur <= 0) return wc.nodes[0].y;
    return curveYAtPos(wc, Math.max(0, Math.min(1, (sec - wc.startSeconds) / dur)));
  }
  function trillReference(score, z, windows) {
    const t = z.trill || {}, ref = t.curveRef || 'auto';
    const on = L => (score.objects || []).filter(o => o.type === 'waveCurve' && o.layer === L && !o.groupId && o.sonifyNote == null && !o.isContainer
      && o.endSeconds > z.startTime && o.startSeconds < z.endTime).sort((a, b) => a.startSeconds - b.startSeconds);
    const meta = name => windows[name] == null ? null : { kind: 'meta', name, curves: on(windows[name]) };
    const lane = () => { const all = on(z.layer); const pick = (t.curveId && all.find(o => o.id === t.curveId)) || all[0]; return { kind: 'lane', name: 'lane', curves: pick ? [pick] : [] }; };
    if (ref === 'flat') return { kind: 'flat', name: 'flat', curves: [] };
    if (ref === 'lane') return lane();
    if (ref === 'A' || ref === 'B' || ref === 'C') return meta(ref) || { kind: 'flat', name: 'flat', curves: [] };
    const a = meta('A'); if (a && a.curves.length) return Object.assign(a, { auto: true });
    const l = lane(); if (l.curves.length) return Object.assign(l, { auto: true });
    return { kind: 'flat', name: 'flat', curves: [], auto: true };
  }
  function trillLevelSamples(r, z, rate) {
    const lv = Math.max(0, Math.min(1, z.trill && z.trill.level != null ? +z.trill.level : 0.5));
    const at = sec => {
      if (r.kind === 'flat' || !r.curves.length) return lv;
      const c = r.curves.find(o => sec >= o.startSeconds && sec <= o.endSeconds);
      if (c) return curveYAtTime(c, sec) / 10;
      let best = null, bd = Infinity;
      for (const o of r.curves) { const d = sec < o.startSeconds ? o.startSeconds - sec : sec - o.endSeconds; if (d < bd) { bd = d; best = o; } }
      return best ? curveYAtTime(best, sec < best.startSeconds ? best.startSeconds : best.endSeconds) / 10 : lv;
    };
    const span = z.endTime - z.startTime;
    // clamped to the schema's 0-1: a ctrl segment may overshoot (cy up to 1.4)
    const n = rate > 0 ? Math.max(101, Math.ceil(span * rate) + 1) : 101;
    return Array.from({ length: n }, (_, i) => +Math.max(0, Math.min(1, at(z.startTime + span * (i / (n - 1))))).toFixed(4));
  }

  function approxGcd(a, b, tol) {
    // Euclid with tolerance; a,b > 0.
    let x = Math.max(a, b), y = Math.min(a, b);
    while (y > tol) {
      const r = x - Math.round(x / y) * y;
      x = y; y = Math.abs(r);
    }
    return x;
  }

  // Least-squares unit through the anchor: rel_i ≈ n_i · u.
  function fitUnit(rels, u0, TOL) {
    let u = u0;
    for (let pass = 0; pass < 3; pass++) {
      const ns = rels.map(r => Math.max(0, Math.round(r / u)));
      let num = 0, den = 0;
      for (let i = 0; i < rels.length; i++) { num += ns[i] * rels[i]; den += ns[i] * ns[i]; }
      if (den === 0) return null;
      u = num / den;
    }
    const ns = rels.map(r => Math.round(r / u));
    let maxErr = 0;
    for (let i = 0; i < rels.length; i++) maxErr = Math.max(maxErr, Math.abs(rels[i] - ns[i] * u));
    // grid must be strictly increasing (two notes may not share a slot)
    for (let i = 1; i < ns.length; i++) if (ns[i] <= ns[i - 1]) return null;
    if (maxErr > TOL) return null;
    return { u, ns, maxErr };
  }

  // Classes that may JOIN a pulse stream as woven accent/pulse events (the
  // trance fabric: staccato pulses + VERT chord hits + short plain ords, all
  // on the player's grid). Multi-node material (drawn crescendos, morphs)
  // always SPLITS a stream — its realization is its own chunk.
  const STREAM_JOINABLE = new Set(['fixed-oneshot', 'ord-sustained']);

  // Segment one part's time-sorted {ev, cls} items: joinable items form
  // pulse runs; splitter items flush the run and stand alone.
  function segment(items, opt) {
    const runs = [];      // {events: [ev], unit} — joinable runs (unit null if single)
    const splitters = []; // {ev, cls} — always their own chunk
    let run = [];
    let unit = null;
    const flush = () => { if (run.length) runs.push({ events: run, unit }); run = []; unit = null; };
    for (const item of items) {
      if (!STREAM_JOINABLE.has(item.cls)) { flush(); splitters.push(item); continue; }
      const e = item.ev;
      if (!run.length) { run.push(e); continue; }
      const d = e.onset - run[run.length - 1].onset;
      if (d <= opt.TOL) {
        // (near-)same onset as the previous stream note — a stacked dyad or
        // coinciding accent. It can never occupy a grid slot of its own
        // (grids are strictly increasing), and letting it into the run used
        // to fail the whole fit and demote EVERY note to a parachute brick
        // (review finding, proven by run). Sideline it; the run survives.
        splitters.push(item);
        continue;
      }
      if (d > opt.GAPMAX) { flush(); run.push(e); continue; }
      if (unit === null) {
        if (d <= opt.MAXUNIT && d > 0) { unit = d; run.push(e); }
        else { flush(); run.push(e); }
        continue;
      }
      let k = Math.round(d / unit);
      if (k < 1 || Math.abs(d - k * unit) > opt.TOL) {
        // Try rebasing on a finer common unit — ONLY when the finer unit is
        // itself a plausible pulse: at least the PLAYABLE floor, and a
        // near-integer subdivision of the current unit. Without both guards
        // the approx-GCD will glue two unrelated streams on a fabricated
        // fine grid (measured live at the A3 seam: gcd(0.75, 0.136) "found"
        // a 0.068 s unit that fit everything — D43's false positive).
        const g = approxGcd(unit, d, opt.TOL / 2);
        const div = unit / g;
        const ok = g >= opt.PLAYABLE && g <= opt.MAXUNIT &&
          Math.abs(div - Math.round(div)) <= 0.05 &&
          run.slice(1).every((_, i) => {
            const dd = run[i + 1].onset - run[i].onset;
            return Math.abs(dd - Math.round(dd / g) * g) <= opt.TOL;
          }) && Math.abs(d - Math.round(d / g) * g) <= opt.TOL && Math.round(d / g) <= opt.KMAX;
        if (ok) { unit = g; k = Math.round(d / g); }
        else { flush(); run.push(e); continue; }
      }
      if (k > opt.KMAX) { flush(); run.push(e); continue; }
      run.push(e);
    }
    flush();
    return { runs, splitters };
  }

  // [2a.4] collapse one part's time-sorted items into simultaneities: a run of
  // items whose onsets fall within tol of the group's FIRST onset. A group of
  // one passes through; a group of two or more becomes one item of class
  // 'chord' (never stream-joinable, so segment()/segmentPlayed() treat it as
  // a splitter) carrying its members in `chord`.
  function groupChords(items, tol) {
    const out = [];
    for (let i = 0; i < items.length;) {
      let j = i + 1;
      // [2f.3] a trill stands alone — it is a sustained event, never a chord member
      if (items[i].cls !== 'trill') while (j < items.length && items[j].cls !== 'trill' && items[j].ev.onset - items[i].ev.onset <= tol) j++;
      if (j - i === 1) out.push(items[i]);
      else out.push({ ev: items[i].ev, cls: 'chord', chord: items.slice(i, j) });
      i = j;
    }
    return out;
  }

  // ---- 'section1' profile: played material (Phase D, slice 2) ----
  // Segmentation by E1's perceptual-gap rule; per-group least-squares fit
  // constrained to PLAYABLE units (>= the D43 floor); fit within EPS ->
  // simple-bar, else the group is proportional RESIDUE (fit-as-data where a
  // best fit exists but misses tolerance — the A5 pattern). Groups shorter
  // than MINRUN are residue by definition.
  function segmentPlayed(items, opt) {
    const runs = [];
    const splitters = [];
    let run = [];
    const flush = () => { if (run.length) runs.push(run); run = []; };
    const iois = [];
    for (const item of items) {
      if (!STREAM_JOINABLE.has(item.cls)) { flush(); splitters.push(item); continue; }
      const e = item.ev;
      if (!run.length) { run.push(e); continue; }
      const d = e.onset - run[run.length - 1].onset;
      if (d <= opt.TOL / 2) { splitters.push(item); continue; } // stacked duplicate
      const recent = iois.slice(-6).sort((a, b) => a - b);
      // First IOI of a run has no local median to compare against — using
      // the gap itself as its own reference (the day-21 code) made the
      // second note join UNCONDITIONALLY (2·d ≥ d always; wc-23 → wc-29 at
      // 3.2 s became a two-note "cloud", day 23). Mirror segment()'s guard:
      // a first IOI above MAXUNIT starts no group.
      const threshold = recent.length
        ? Math.max(opt.SEG_K * recent[Math.floor(recent.length / 2)], opt.SEG_FLOOR)
        : opt.MAXUNIT;
      if (d > threshold) { flush(); run.push(e); iois.length = 0; }
      else { run.push(e); iois.push(d); }
    }
    flush();
    return { runs, splitters };
  }

  function fitPlayed(evs, opt) {
    const anchor = evs[0].onset;
    const rels = evs.map(e => e.onset - anchor);
    const iois = [];
    for (let i = 1; i < evs.length; i++) iois.push(evs[i].onset - evs[i - 1].onset);
    const sorted = iois.slice().sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    const cands = new Set();
    for (const base of [med, sorted[0], sorted[sorted.length - 1]]) {
      for (let k = 1; k <= 10; k++) {
        const u = base / k;
        if (u >= opt.PLAYABLE - 1e-9 && u <= opt.UNIT_MAX + 1e-9) cands.add(+u.toFixed(6));
      }
    }
    let best = null;
    for (const u0 of cands) {
      const f = fitUnit(rels, u0, opt.EPS);
      if (!f || f.u < opt.PLAYABLE - 1e-9 || f.u > opt.UNIT_MAX + 1e-9) continue;
      if (!best || f.maxErr < best.maxErr - 1e-9 || (Math.abs(f.maxErr - best.maxErr) <= 1e-9 && f.u > best.u)) best = f;
    }
    return best; // null => no playable fit within EPS
  }

  // Claim MAXIMAL fitting sub-runs inside a perceptual group (E1's frame —
  // one outlier must not condemn the whole segment). Left-to-right: extend
  // each candidate start as far as a fit survives; claim the longest;
  // leftovers between claims become proportional residue.
  function fitSubruns(evs, opt) {
    const n = evs.length;
    const claims = [];
    let i = 0;
    while (i <= n - opt.MINRUN) {
      let best = null, fails = 0;
      for (let j = i + opt.MINRUN - 1; j < n; j++) {
        const f = fitPlayed(evs.slice(i, j + 1), opt);
        if (f) { best = { j, f }; fails = 0; }
        else if (best && ++fails >= 3) break; // adding notes only degrades past here
      }
      if (best) { claims.push({ i, j: best.j, fit: best.f }); i = best.j + 1; }
      else i++;
    }
    const leftovers = [];
    let prev = 0;
    for (const c of claims) {
      if (c.i > prev) leftovers.push([prev, c.i]);
      prev = c.j + 1;
    }
    if (prev < n) leftovers.push([prev, n]);
    return { claims, leftovers };
  }

  function extract(score, params) {
    const opt = Object.assign({}, DEFAULTS, params.options || {});
    const profile = params.profile || 'trance';
    const { scoreName, window: [w0, w1], parts, id, registry, sampleLengths, date, toolName } = params;
    Classify.assertRegistry(registry);
    const warnings = [];

    // HALF-OPEN window (A3 span-ownership law; matches render.js's page
    // rule): an onset exactly at w1 belongs to the NEXT window. Was
    // inclusive both ends — surfaced day 21 when a piece extraction hit
    // an onset at exactly the cut and the chunk-span validator refused it.
    const inWin = o => o.type === 'waveCurve' && o.startSeconds >= w0 && o.startSeconds < w1 && parts.includes(o.layer);
    // [2f.3] with options.trills: the trill zones in the window, and the notes they ate left out
    const trillIds = new Set();
    const zones = opt.trills ? (score.objects || []).filter(o => o.type === 'zone' && o.midiModel === 'trill' && o.trill
      && o.startTime >= w0 && o.startTime < w1 && parts.includes(o.layer)) : [];
    if (opt.trills) for (const o of score.objects || []) if (o.type === 'zone' && o.midiModel === 'trill') trillIds.add(o.id);
    let eatenN = 0;
    const objs = score.objects.filter(o => {
      if (!inWin(o)) return false;
      if (opt.trills && o.mutedBy) {
        if (trillIds.has(o.mutedBy)) { eatenN++; return false; }
        warnings.push(o.id + ': mutedBy ' + o.mutedBy + ', which is not a trill in this score — extracted as a note (a stale stamp; a Save refreshes it)');
      }
      return true;
    }).map(o => ({ o, t: o.startSeconds }))
      .concat(zones.map(z => ({ z, o: z, t: z.startTime })))
      .sort((a, b) => a.t - b.t || a.o.layer - b.o.layer);

    const events = [];
    const perPart = new Map(parts.map(p => [p, []]));
    let flatN = 0;
    for (const { o: o0, z } of objs) {
      if (z) {
        const T = z.trill;
        if (!(z.endTime > z.startTime)) { warnings.push(z.id + ': trill with no duration — skipped'); continue; }
        const midi = Math.round(T.pitch);
        const spelled = naiveSpell(midi);
        const nMidi = midi + T.interval;
        const r = trillReference(score, z, opt.CURVE_WINDOWS);
        if (r.kind === 'flat') flatN++;
        const ev = {
          id: 'ev-' + z.id,
          source: { score: scoreName, objectId: z.id },
          onset: z.startTime,
          duration: z.endTime - z.startTime,
          pitch: { midi, spelled },
          technique: T.technique,
          provenance: 'derived',
          env: 'trill',
          trill: { interval: T.interval, neighbour: { midi: nMidi, spelled: spellNeighbour(spelled, nMidi) }, curve: r.auto ? 'auto:' + r.name : r.name },
          level: { samples: trillLevelSamples(r, z, opt.trillRate) },
        };
        events.push(ev);
        perPart.get(z.layer).push({ ev, cls: 'trill', obj: z });
        continue;
      }
      const o = o0;
      // [2a] the piece's META layer and technique table (both optional;
      // absent = the tuba rules — classify.js)
      const cls = Classify.classify(o, { metaLayer: params.metaLayer, techniques: params.techniques });
      if (cls === 'meta-shape' || cls === 'marker-label') continue; // S1 read-through
      if (o.sonifyNote === undefined) throw new Error('extract: ' + o.id + ' (' + cls + ') has no sonifyNote');
      let duration;
      if (cls === 'fixed-oneshot') {
        const table = sampleLengths[o.technique];
        const len = table && table[String(o.sonifyNote)];
        if (len) duration = len;
        else { duration = o.endSeconds - o.startSeconds; warnings.push(o.id + ': no ' + o.technique + ' sample length for midi ' + o.sonifyNote + '; using drawn length'); }
      } else {
        duration = o.endSeconds - o.startSeconds; // ORD family: real duration (D9)
      }
      const ev = {
        id: 'ev-' + o.id,
        source: { score: scoreName, objectId: o.id },
        onset: o.startSeconds,
        duration,
        pitch: { midi: o.sonifyNote, spelled: naiveSpell(o.sonifyNote) },
        technique: o.technique,
        provenance: 'derived',
      };
      // envelope identity (day 22, schema amendment 3): the species the
      // composer drew (surge/sine/expodec...) and the non-default sonify
      // mode ('plain' = captured note, 'ks' = keyswitched sample; curve
      // mode = omitted default). Notation devices + tooltips consume these.
      if (o.envShape) ev.env = o.envShape;
      // [PLAN 2i.8, RUNNING_LOG §530, D54 — 2026-09-15] a CRESCENDO-TOOL swell: the
      // save's `properties.cresc` names the family (shape 'surge' = the STANDARD,
      // cresc.js) and the object carries no envShape. Its env is the family name,
      // so the registry's byEnv.surge (the tuba's surge device) reaches it; `secco`
      // is the cliff's performing technique (CN-49: the strings damp at the cut,
      // the winds take the word) — IR amendment 9. Both derived from the save (D9).
      // The level samples below stay the save's own sampler-bent curve: the
      // STANDARD shape the page draws is the device's rule (layout.js
      // drawnLevelSamples curveTemplate), not the IR's. Tuba saves carry envShape
      // and no cresc: nothing moves there (the else-if order).
      else if (o.properties && o.properties.cresc && o.properties.cresc.shape) {
        ev.env = o.properties.cresc.shape;
        if (o.properties.cresc.secco) ev.secco = true;
      }
      // [§400, 2026-09-11] a note the STRIKES tool wrote (composer.html srcKind
      // 'strike') is a strike whatever its technique — the piano's `main` is
      // a strike here and a long note elsewhere. The registry's byEnv.strike
      // gives every strike the section's strike look; a long `main` keeps its
      // family look. Tuba saves carry no srcKind: nothing changes there.
      else if (o.srcKind === 'strike') ev.env = 'strike';
      if (o.sonifyMode === 'plain' || o.sonifyMode === 'ks') ev.mode = o.sonifyMode;
      // the captured velocity (day 23, amendment 5): plain-mode notes play at
      // recVel (sonify_core), so the one-shot dynamic derives from it
      // (DYNAMICS_FRAMEWORK.md — five wide bands, registry dynamicBands)
      if (o.sonifyMode === 'plain' && Number.isFinite(o.recVel)) ev.vel = Math.max(1, Math.min(127, Math.round(o.recVel)));
      // the drawn level curve (day 22, amendment 4): curve-mode events carry
      // their shape as 101 normalized samples — the piece #1 curve-library
      // precedent (frozen at extract; re-extract refreshes). Sampled through
      // sonify_core.evalWaveCurve = the SAME math playback follows, so the
      // drawn shape, the heard shape and the notated shape are one function.
      // segments must exist as an array — golden finding: some generated
      // curve-less objects carry nodes only, and playback itself would
      // throw on them in curve mode, so they are de facto non-curve
      if (!ev.mode && SonifyCore && o.nodes && o.nodes.length >= 2 && Array.isArray(o.segments)) {
        ev.level = {
          samples: Array.from({ length: 101 }, (_, i) =>
            +SonifyCore.evalWaveCurve(o, i / 100).toFixed(4)),
        };
      }
      events.push(ev);
      perPart.get(o.layer).push({ ev, cls, obj: o });
    }

    const chunks = [];
    for (const part of parts) {
      const list = perPart.get(part);
      if (!list.length) continue;
      const partChunks = []; // {firstOnset, make(spanEnd) -> chunk}
      const clsOf = new Map(list.map(x => [x.ev.id, x.cls]));
      let items = list.map(x => ({ ev: x.ev, cls: x.cls }));
      // [2a.4, the septet — 2026-09-11] CHORDS (opt.chords): a player may
      // sound several notes at ONE onset — the piano's chords, a string's
      // double stop. Notes within CHORD_TOL of a group's first onset are one
      // SIMULTANEITY: one chunk holding all of them, which ends any run it
      // meets. Without this the tuba rule ("a stacked dyad is sidelined, the
      // run survives") let a run's span be cut at the chord's onset while the
      // run went on — events outside their own chunk's span, measured on
      // piece-septet's piano (9 validator findings, RUNNING_LOG §384). Opt-in,
      // so the tuba pages extract exactly as before.
      if (opt.chords) items = groupChords(items, opt.CHORD_TOL);

      if (profile === 'section1') {
        // played material: perceptual groups, playable fits, honest residue
        const seg = segmentPlayed(items, opt);
        const mkSingle = e => partChunks.push({
          firstOnset: e.onset,
          make: end => ({
            id: 'ch-' + part + '-' + e.source.objectId, part, span: [e.onset, end],
            class: clsOf.get(e.id), strategy: 'unresolved',
            events: [e.id], provenance: 'derived',
          }),
        });
        const mkProportional = evsRun => {
          const srcId = evsRun[0].source.objectId;
          const anchor = evsRun[0].onset;
          partChunks.push({
            firstOnset: anchor,
            make: end => ({
              id: 'ch-' + part + '-' + srcId, part, span: [anchor, end], class: 'density-cloud-note',
              strategy: 'proportional',
              events: evsRun.map(e => e.id),
              devices: [{ id: 'dev-' + srcId, kind: 'gc', mode: 'landing', at: anchor, provenance: 'derived' }],
              provenance: 'derived',
            }),
          });
        };
        const mkBar = (evsRun, fit) => {
          const srcId = evsRun[0].source.objectId;
          const chId = 'ch-' + part + '-' + srcId;
          const anchor = evsRun[0].onset;
          const m = Math.max(1, Math.ceil(opt.BEAT_MIN / fit.u - 1e-9));
          const beat = fit.u * m;
          evsRun.forEach((e, i) => { e.metric = { chunk: chId, grid: [fit.ns[i]] }; });
          partChunks.push({
            firstOnset: anchor,
            make: end => ({
              id: chId, part, span: [anchor, end], class: 'density-cloud-note',
              strategy: 'simple-bar',
              tempo: {
                anchorSeconds: anchor, unitSeconds: fit.u, beatSeconds: beat,
                subdivision: m, maxErrSeconds: fit.maxErr,
                label: 'unit ' + (fit.u * 1000).toFixed(1) + ' ms · beat ' + beat.toFixed(3) + ' s (' + (60 / beat).toFixed(0) + ' bpm) × ' + m,
              },
              events: evsRun.map(e => e.id),
              groups: [{ id: 'bg-' + srcId, kind: 'beam', events: evsRun.map(e => e.id), provenance: 'derived' }],
              devices: [{ id: 'dev-' + srcId, kind: 'gc', mode: 'landing', at: anchor, provenance: 'derived' }],
              provenance: 'derived',
            }),
          });
        };
        for (const r of seg.runs) {
          if (r.length === 1) { mkSingle(r[0]); continue; }
          const { claims, leftovers } = fitSubruns(r, opt);
          for (const c of claims) mkBar(r.slice(c.i, c.j + 1), c.fit);
          for (const [a, b] of leftovers) {
            const piece = r.slice(a, b);
            if (piece.length === 1) mkSingle(piece[0]);
            else mkProportional(piece);
          }
        }
        for (const x of seg.splitters) {
          partChunks.push({
            firstOnset: x.ev.onset,
            make: end => ({
              id: 'ch-' + part + '-' + x.ev.source.objectId, part, span: [x.ev.onset, end],
              class: x.chord ? x.chord[0].cls : x.cls, strategy: 'unresolved',
              events: x.chord ? x.chord.map(m => m.ev.id) : [x.ev.id], provenance: 'derived',
            }),
          });
        }
        partChunks.sort((a, b) => a.firstOnset - b.firstOnset);
        for (let i = 0; i < partChunks.length; i++) {
          const end = i + 1 < partChunks.length ? partChunks[i + 1].firstOnset : w1;
          chunks.push(partChunks[i].make(end));
        }
        continue;
      }

      const { runs, splitters } = segment(items, opt);
      for (const r of runs) {
        if (r.events.length >= 2 && r.unit !== null) {
          const anchor = r.events[0].onset;
          const rels = r.events.map(e => e.onset - anchor);
          const fit = fitUnit(rels, r.unit, opt.TOL);
          if (fit) {
            const srcId = r.events[0].source.objectId;
            const chId = 'ch-' + part + '-' + srcId;
            const m = Math.max(1, Math.ceil(opt.BEAT_MIN / fit.u - 1e-9));
            const beat = fit.u * m;
            r.events.forEach((e, i) => { e.metric = { chunk: chId, grid: [fit.ns[i]] }; });
            partChunks.push({
              firstOnset: anchor,
              make: end => ({
                id: chId, part, span: [anchor, end], class: 'trance-stream',
                strategy: fit.u >= opt.PLAYABLE ? 'simple-bar' : 'proportional',
                tempo: {
                  anchorSeconds: anchor, unitSeconds: fit.u, beatSeconds: beat,
                  subdivision: m, maxErrSeconds: fit.maxErr,
                  label: 'unit ' + (fit.u * 1000).toFixed(1) + ' ms · beat ' + beat.toFixed(3) + ' s (' + (60 / beat).toFixed(0) + ' bpm) × ' + m,
                },
                events: r.events.map(e => e.id),
                groups: [{ id: 'bg-' + srcId, kind: 'beam', events: r.events.map(e => e.id), provenance: 'derived' }],
                devices: [{ id: 'dev-' + srcId, kind: 'gc', mode: 'landing', at: anchor, provenance: 'derived' }],
                provenance: 'derived',
              }),
            });
            continue;
          }
        }
        // singleton or unfittable: one chunk per event, keeps its own class
        for (const e of r.events) {
          partChunks.push({
            firstOnset: e.onset,
            make: end => ({
              id: 'ch-' + part + '-' + e.source.objectId, part, span: [e.onset, end],
              class: clsOf.get(e.id), strategy: 'unresolved',
              events: [e.id], provenance: 'derived',
            }),
          });
        }
      }
      for (const x of splitters) {
        partChunks.push({
          firstOnset: x.ev.onset,
          make: end => ({
            id: 'ch-' + part + '-' + x.ev.source.objectId, part, span: [x.ev.onset, end],
            class: x.chord ? x.chord[0].cls : x.cls, strategy: 'unresolved',
            events: x.chord ? x.chord.map(m => m.ev.id) : [x.ev.id], provenance: 'derived',
          }),
        });
      }
      partChunks.sort((a, b) => a.firstOnset - b.firstOnset);
      // boundary convention: span end = next chunk's first onset; last = window end
      for (let i = 0; i < partChunks.length; i++) {
        const end = i + 1 < partChunks.length ? partChunks[i + 1].firstOnset : w1;
        chunks.push(partChunks[i].make(end));
      }
    }

    return {
      doc: {
        irVersion: '0.1',
        id,
        source: { score: scoreName, window: [w0, w1], parts },
        provenance: {
          createdBy: toolName || 'extract_core',
          date: date || 'undated',
          tool: toolName || 'extract_core',
          notes: 'Derived extraction (B1). Segmentation: DB-6 greedy IOI runs, TOL ' + opt.TOL + ' s. Regenerable; authored content belongs in overlays only.'
            + (opt.trills ? ' TRILLS (PLAN 2f.3): ' + zones.length + ' trill zone(s) as env trill; ' + eatenN + ' eaten note(s) (mutedBy) not extracted; ' + flatN + ' trill(s) read a flat level.' : ''),
        },
        events,
        chunks,
        overlays: [],
      },
      warnings,
    };
  }

  return { extract, segment, segmentPlayed, fitPlayed, fitUnit, approxGcd, naiveSpell, spellNeighbour, curveYAtPos, trillReference, DEFAULTS };
});
