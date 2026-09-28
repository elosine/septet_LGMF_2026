// vib_marks.js — THE VIBRAPHONE'S MARKS IN A SEQUENCE (LGMF PLAN 2g.2, 2026-09-27; RUNNING_LOG §463 · §465 · §466 · §468).
//
// The two bowed vibraphones in a sequence are two staggered lines of strokes: each seat is a player of its own in the waves stream,
// so each carries its OWN continuous level curve, and each bow is a slice of it — the next bow begins where the last ended (§463:
// 156 bows measured, the step at a join ≤ 0.24). His conception (LG-116): "hairpins describe dynamic movement and direction. The
// dynamic markings describe a relative level." This file reads, per bow, the marks the page writes under its head — pure, from the
// save (D9), once; the extractor puts them in the part's `vibBows` overlay and the layout draws them.
//
//   the level   sequence_overlays.js writtenAt — the body through the part's ladder × the fade weight (§462 · §465: the marks read
//               the level WITH the fade) — in written STEPS: 0 ppp … 7 fff, −1 niente
//   the seats   the lane's two OVERLAP CHAINS in time order (the record's rule: a bow joins the first chain whose last bow has ended)
//   the voice   by REGISTER (rules.json vibMarks.voice): upper when the bow's pitch is ≥ the other chain's sounding pitch at its start;
//               a silent partner → the nearer of its previous and next bow in the same sequence; a tie / no partner → chain 0 upper
//   the marks   rules.json vibMarks — a LEG is a monotone run between turning points (a flat carries the run): ≥ hairpinSteps → a
//               hairpin from where the motion begins to where the extreme is first reached; nameSteps … hairpinSteps → one only when
//               its rounded end name differs from the current name; a name at the leg's end where the rounded level differs from the
//               current name. THE CARRY: a bow's start name is its chain's current name — re-read from the level only at a RESTART (the
//               chain's first bow in a sequence, or after a rest ≥ restS); a restart at silence opens with the niente circle. A bow
//               with no hairpin draws nothing unless it restarts (`repeatName` false). A name against its hairpin's direction (the
//               level drifted under the thresholds) is not written — the hairpin stands open.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./sequence_overlays.js'), require('../../score/public/dyn_table.js'));
  else root.VibMarks = factory(root.SequenceOverlays, root.DynTable);
}(typeof self !== 'undefined' ? self : this, function (SeqOv, DynTable) {
  const NAMES = SeqOv.NAMES;   // ppp … fff
  const DEFAULTS = {   // RULES MIRROR (rules.json vibMarks) — the caller passes the table
    hairpinSteps: 0.5, nameSteps: 0.25, flatSteps: 0.25, carry: true, repeatName: false, restS: 0.5,
    sps: 100,          // samples per second over a bow (the sequence overlay's density)
    eps: 1e-6,         // a step between two samples smaller than this is flat
  };
  const nameOf = idx => (idx < 0 ? 'niente' : NAMES[idx]);
  const idxOf = s => Math.max(-1, Math.min(7, Math.round(s)));
  const r3 = x => +(+x).toFixed(3);

  // the lane's sequence bows (the sequence drawer's notes), optionally one or more groups, inside a window, in time order
  function notesOf(objects, lane, opts) {
    const O = opts || {}, [w0, w1] = O.window || [-Infinity, Infinity], groups = O.groups || null;
    return (objects || []).filter(o => o.type === 'waveCurve' && o.layer === lane && o.srcKind === 'sequence'
      && (!groups || groups.includes(o.groupId)) && o.startSeconds >= w0 && o.startSeconds < w1)
      .sort((a, b) => a.startSeconds - b.startSeconds || a.endSeconds - b.endSeconds);
  }

  // the two overlap chains: a bow joins the first chain whose last bow has ended (within 1 µs); none free → chain −1 (reported).
  // [§468] BOTH free, and both last bows of this sequence ended within `restS` of the bow — the two seats changed bow together (the
  // save does not name the seat): the bow continues the chain whose last bow ENDED AT ITS LEVEL (each seat's curve is continuous,
  // §463: the step at a join ≤ 0.24; the two curves differ by up to two steps there). `levelAt(o, t)` gives the level; absent → the first.
  function chainsOf(notes, levelAt, restS) {
    const last = [null, null], chainOf = new Map();
    for (const o of notes) {
      const free = [0, 1].filter(c => !last[c] || last[c].endSeconds <= o.startSeconds + 1e-6);
      let c = free.length ? free[0] : -1;
      if (free.length === 2 && levelAt && last.every(p => p && p.groupId === o.groupId && o.startSeconds - p.endSeconds < (restS || 0.5))) {
        const s = levelAt(o, o.startSeconds), d = last.map(p => Math.abs(levelAt(p, p.endSeconds) - s));
        if (d[1] < d[0] - 1e-6) c = 1;
      }
      chainOf.set(o.id, c);
      if (c >= 0) last[c] = o;
    }
    return chainOf;
  }

  // the level in written steps at t (0 ppp … 7 fff; −1 niente)
  const stepsAt = (o, t, L) => SeqOv.writtenAt(o, t, L) * 8 - 1;

  // a bow's LEGS over its samples: [{ dir, a, b }] — a = the last sample before the motion (a plateau's END), b = the first sample at
  // the extreme (the plateau's START); a flat sample carries the run
  function legsOf(v, eps) {
    const legs = [];
    let dir = 0, a = 0, b = 0;
    for (let i = 1; i < v.length; i++) {
      const d = v[i] - v[i - 1], s = Math.abs(d) < eps ? 0 : Math.sign(d);
      if (!s) continue;
      if (dir === 0) { dir = s; a = i - 1; b = i; continue; }
      if (s === dir) { b = i; continue; }
      legs.push({ dir, a, b });
      dir = s; a = i - 1; b = i;
    }
    if (dir) legs.push({ dir, a, b });
    return legs;
  }

  // Read every bow of one vibraphone lane.
  //   objects : the score's objects   lane : the vibraphone's layer
  //   opts    : { bank, instKey, groups, window, rules (rules.json vibMarks), sps }
  // → { bows: [{ id, event, group, chain, voice, t0, t1, midi, restart, startName, startSteps, endSteps, marks }], ladder, warnings }
  //   marks  : [{ kind: 'name' | 'niente' | 'hairpin', t, tEnd?, name?, dir? ('cresc' | 'decresc'), start? }] in time order
  function read(objects, lane, opts) {
    const O = Object.assign({}, DEFAULTS, (opts || {}).rules || {}, opts || {});
    const warnings = [];
    const L = NAMES.map((n, i) => DynTable.cc7(O.bank, O.instKey, i / 7));
    const notes = notesOf(objects, lane, O);
    const chainOf = chainsOf(notes, (o, t) => stepsAt(o, t, L), O.restS);
    const unplaced = notes.filter(o => chainOf.get(o.id) < 0);
    if (unplaced.length) warnings.push(unplaced.length + ' bow(s) with no free chain (a third bow sounding): ' + unplaced.map(o => o.id).join(' '));
    const chains = [[], []];
    for (const o of notes) { const c = chainOf.get(o.id); if (c >= 0) chains[c].push(o); }

    // the voice: the other chain's sounding bow at t0 — else the nearer of its previous and next bow in the same sequence
    const voiceOf = (o, c) => {
      const other = chains[1 - c].filter(x => x.groupId === o.groupId);
      if (!other.length) return c === 0 ? 'upper' : 'lower';
      let p = other.find(x => x.startSeconds <= o.startSeconds + 1e-6 && x.endSeconds > o.startSeconds + 1e-6);
      if (!p) {
        const prev = other.filter(x => x.endSeconds <= o.startSeconds + 1e-6).pop(), next = other.find(x => x.startSeconds > o.startSeconds);
        p = !prev ? next : !next ? prev : (o.startSeconds - prev.endSeconds <= next.startSeconds - o.startSeconds ? prev : next);
      }
      if (o.sonifyNote !== p.sonifyNote) return o.sonifyNote > p.sonifyNote ? 'upper' : 'lower';
      return c === 0 ? 'upper' : 'lower';
    };

    const out = [];
    for (let c = 0; c < 2; c++) {
      let cur = null, prev = null;
      for (const o of chains[c]) {
        const t0 = o.startSeconds, t1 = o.endSeconds;
        const n = Math.max(2, Math.round((t1 - t0) * O.sps));
        const ts = [], v = [];
        for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; ts.push(t); v.push(stepsAt(o, t, L)); }
        const restart = !O.carry || !prev || prev.groupId !== o.groupId || t0 - prev.endSeconds >= O.restS - 1e-9;
        if (restart) cur = idxOf(v[0]);
        const startName = nameOf(cur);
        const marks = [];
        for (const g of legsOf(v, O.eps)) {
          const span = Math.abs(v[g.b] - v[g.a]);
          if (span < O.flatSteps) continue;
          let end = idxOf(v[g.b]);
          if (g.dir > 0 ? end < cur : end > cur) {   // the level drifted under the thresholds: a name against the motion is not written
            warnings.push(o.id + ' at ' + r3(ts[g.b]) + ' s: the ' + (g.dir > 0 ? 'rise' : 'fall') + ' ends on ' + nameOf(end) + ', the current name is ' + nameOf(cur) + ' — the hairpin left open');
            end = cur;
          }
          if (span < O.hairpinSteps && end === cur) continue;
          marks.push({ kind: 'hairpin', t: r3(ts[g.a]), tEnd: r3(ts[g.b]), dir: g.dir > 0 ? 'cresc' : 'decresc', from: r3(v[g.a]), to: r3(v[g.b]) });
          if (end !== cur) { marks.push(end < 0 ? { kind: 'niente', t: r3(ts[g.b]) } : { kind: 'name', t: r3(ts[g.b]), name: nameOf(end) }); cur = end; }
        }
        // the start mark: at a restart always; else only when the bow moves (repeatName false — a flat bow at the carried level is bare)
        if (restart || marks.length || O.repeatName) marks.unshift(startName === 'niente' ? { kind: 'niente', t: r3(t0), start: true } : { kind: 'name', t: r3(t0), name: startName, start: true });
        out.push({ id: o.id, event: 'ev-' + o.id, group: o.groupId, chain: c, voice: voiceOf(o, c), t0: r3(t0), t1: r3(t1), midi: o.sonifyNote,
          restart, startName, startSteps: r3(v[0]), endSteps: r3(v[v.length - 1]), marks });
        prev = o;
      }
    }
    out.sort((a, b) => a.t0 - b.t0 || a.chain - b.chain);
    return { bows: out, ladder: L, warnings, unplaced: unplaced.map(o => o.id) };
  }

  // the marks of one bow as a line of text: "○ < pp" · "p > pp < p" · "" (bare)
  function text(bow) {
    return bow.marks.map(m => m.kind === 'hairpin' ? (m.dir === 'cresc' ? '<' : '>') : m.kind === 'niente' ? '○' : m.name).join(' ');
  }

  return { read, text, notesOf, chainsOf, legsOf, stepsAt, DEFAULTS };
}));
