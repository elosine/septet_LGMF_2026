// splice.js — Phase B6 (+ phase-review fixes): cutting the strip into pages
// with the first three accommodation strategies (architecture §3):
//   · bars-prefer-chunk-boundaries — cuts land at chunk starts wherever
//     possible; the M5 chunk is the atom of the strip
//   · stamp-atomic — no beam group may straddle a cut. Candidates are
//     scored against the BEAMABLE PAIRS of every interrupted sub-beat
//     chunk (all parts, not just the first — review finding): if any
//     candidate in the slack window severs zero pairs, one is chosen.
//     Any sub-beat chunk still left off its grid is RECORDED on the page
//     (offGrid) so a renderer can mark it, never silently.
//   · page-edge-rules — behavior from notation/registry/page_rules.json
//     (RULES as data, P6), incl. re-showing a continuing chunk's tempo
//     label after the cut.
// Interruption and continuation are judged by a chunk's MATERIAL extent
// (last member onset), not its span — spans run to the next chunk's start
// by convention and overstate the material by seconds (review finding:
// dead-span "(cont.)" labels on parts with nothing to play).
// Pure, dual-load.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationSplice = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const EPS = 1e-6;

  // material extent per chunk: [firstOnset, lastOnset] of member events
  function materialExtents(ir) {
    const on = new Map(ir.events.map(e => [e.id, e.onset]));
    const m = new Map();
    for (const c of ir.chunks) {
      const ts = c.events.map(id => on.get(id)).filter(t => t !== undefined);
      m.set(c.id, ts.length ? [Math.min(...ts), Math.max(...ts)] : [c.span[0], c.span[0]]);
    }
    return m;
  }

  function interruptedChunks(ir, ext, t) {
    return ir.chunks.filter(c => {
      const e = ext.get(c.id);
      return e[0] < t - EPS && t < e[1] - EPS;
    });
  }

  // beamable pairs of a sub-beat chunk: beat-adjacent grid neighbors
  // (exactly what layout beams); returns [t0, t1] onset pairs.
  function beamablePairs(ir, chunk) {
    const t = chunk.tempo;
    if (!t || t.subdivision < 2) return [];
    const evs = ir.events.filter(e => e.metric && e.metric.chunk === chunk.id)
      .sort((a, b) => a.metric.grid[0] - b.metric.grid[0]);
    const out = [];
    for (let i = 1; i < evs.length; i++) {
      const a = evs[i - 1].metric.grid[0], b = evs[i].metric.grid[0];
      if (b === a + 1 && Math.floor(a / t.subdivision) === Math.floor(b / t.subdivision))
        out.push([evs[i - 1].onset, evs[i].onset]);
    }
    return out;
  }

  function severedPairs(pairs, t) {
    return pairs.filter(p => p[0] < t - EPS && t < p[1] - EPS).length;
  }

  function offGridChunks(interrupted, t) {
    return interrupted.filter(c => {
      if (!c.tempo || c.tempo.subdivision < 2) return false;
      const b = c.tempo.beatSeconds, a = c.tempo.anchorSeconds;
      const k = (t - a) / b;
      return Math.abs(k - Math.round(k)) > 1e-6;
    }).map(c => c.id);
  }

  function chooseCut(ir, ext, allPairs, target, lo, hi) {
    // candidates: chunk material edges and every interrupted sub-beat
    // chunk's beat slots in [lo, hi], plus the target clamped INTO bounds
    // (an out-of-bounds target used to leak sub-minimum pages — review)
    const cands = new Set([Math.min(hi, Math.max(lo, target))]);
    for (const c of ir.chunks) for (const e of ext.get(c.id))
      if (e > lo + EPS && e < hi - EPS) cands.add(e);
    for (const c of interruptedChunks(ir, ext, Math.min(hi, Math.max(lo, target)))) {
      if (!c.tempo || c.tempo.subdivision < 2) continue;
      const b = c.tempo.beatSeconds, a = c.tempo.anchorSeconds;
      for (let k = Math.ceil((lo - a) / b); a + k * b <= hi + EPS; k++) {
        const s = a + k * b;
        if (s > lo - EPS) cands.add(s);
      }
    }
    let best = null;
    for (const t of cands) {
      const cut = interruptedChunks(ir, ext, t);
      let severed = 0;
      for (const c of cut) severed += severedPairs(allPairs.get(c.id) || [], t);
      const score = [severed, cut.length, Math.abs(t - target)];
      const better = !best || score[0] < best.score[0] ||
        (score[0] === best.score[0] && (score[1] < best.score[1] ||
          (score[1] === best.score[1] && score[2] < best.score[2])));
      if (better) best = { t, score, cut };
    }
    const { t, cut, score } = best;
    const offGrid = offGridChunks(cut, t);
    const kind = cut.length === 0 ? 'clean' : (offGrid.length < cut.filter(c => c.tempo && c.tempo.subdivision >= 2).length || score[0] === 0) && cut.some(c => c.tempo && c.tempo.subdivision >= 2) ? 'beat-snapped' : 'interrupting';
    return { t, kind, interrupted: cut.map(c => c.id), offGrid, severed: score[0] };
  }

  function planPages(ir, rules, pageSeconds) {
    if (!(isFinite(pageSeconds) && pageSeconds > 0)) throw new Error('splice: pageSeconds must be a finite number > 0');
    const [w0, w1] = ir.source.window;
    const slack = rules.cutSlackSeconds, minPage = rules.minPageSeconds;
    const ext = materialExtents(ir);
    const allPairs = new Map(ir.chunks.map(c => [c.id, beamablePairs(ir, c)]));
    const wantReshow = !rules.reshowAtCut || rules.reshowAtCut.includes('tempoLabelContinuation');
    const pages = [];
    let t = w0;
    let guard = 0;
    while (t < w1 - EPS) {
      if (++guard > 10000) throw new Error('splice: page planning did not converge');
      const target = t + pageSeconds;
      let cut, kind = 'end', interrupted = [], offGrid = [], severed = 0;
      if (target >= w1 - minPage) cut = w1;
      else {
        const lo = Math.max(t + minPage, target - slack);
        // NEVER LATER THAN THE PAGE END (day 24): the video page draws a
        // CONSTANT window [t0, t0 + pageSeconds] (day 22), so a cut chosen
        // past that edge leaves material on NO page — T2 32.0-33.1 vanished
        // between page 4 (shown to 32.0) and page 5 (starting 33.1). The slack
        // now reaches only backwards; an early cut merely overlaps the next
        // page, which loses nothing.
        const hi = Math.max(lo, Math.min(w1 - minPage, target));   // >= lo keeps the minPage guarantee when pageSeconds < minPage
        const r = chooseCut(ir, ext, allPairs, target, lo, hi);
        cut = r.t; kind = r.kind; interrupted = r.interrupted; offGrid = r.offGrid; severed = r.severed;
      }
      if (!(cut > t + EPS)) throw new Error('splice: cut did not advance past ' + t);
      const reshow = [];
      if (wantReshow) for (const c of ir.chunks) {
        const e = ext.get(c.id);
        if (c.tempo && e[0] < t - EPS && t < e[1] - EPS)
          reshow.push({ part: c.part, text: rules.continuationPrefix + c.tempo.label });
      }
      pages.push({ t0: t, t1: cut, kind, interrupted, offGrid, severed, reshow });
      t = cut;
    }
    return pages;
  }

  // [2c.2, LGMF 2026-09-25 — RUNNING_LOG §340] THE SCREEN PLAN: the constant sweep (the composer: "scrolling cursor starts each
  // screen at the same point and ends at the same point on the screen"). Page i is [w0 + i·S, w0 + (i+1)·S] — t0 and tω at the
  // same x on every page, nothing shown twice, the film turning AT tω; the last page is short, ending at the material's end (its
  // window stays S wide, the terminal barline where the music stops). No cut is CHOSEN and no beam protected: on screen a long
  // object is cut like paper at tω (2c.3) and a unit hanging over a page's start is clamped (2c.4). A chunk continuing over t0
  // re-shows its tempo label exactly as on a planned page; `interrupted` · `severed` · `offGrid` are recorded, never acted on.
  // Selected by page_rules.screenPlan: 'tile' — absent = planPages, the film's overlap.
  function tilePages(ir, rules, S) {
    if (!(isFinite(S) && S > 0)) throw new Error('splice: pageSeconds must be a finite number > 0');
    const [w0, w1] = ir.source.window;
    const ext = materialExtents(ir);
    const allPairs = new Map(ir.chunks.map(c => [c.id, beamablePairs(ir, c)]));
    const wantReshow = !rules.reshowAtCut || rules.reshowAtCut.includes('tempoLabelContinuation');
    const n = Math.max(1, Math.ceil((w1 - w0) / S - EPS));
    const pages = [];
    for (let i = 0; i < n; i++) {
      const t = w0 + i * S, last = i === n - 1;
      const cut = last ? w1 : w0 + (i + 1) * S;   // the SAME expression as the next page's t0, so the pages abut to the bit
      const inter = last ? [] : interruptedChunks(ir, ext, cut);
      let severed = 0;
      for (const c of inter) severed += severedPairs(allPairs.get(c.id) || [], cut);
      const reshow = [];
      if (wantReshow) for (const c of ir.chunks) {
        const e = ext.get(c.id);
        if (c.tempo && e[0] < t - EPS && t < e[1] - EPS)
          reshow.push({ part: c.part, text: rules.continuationPrefix + c.tempo.label });
      }
      pages.push({ t0: t, t1: cut, kind: last ? 'end' : 'tile', interrupted: inter.map(c => c.id), offGrid: offGridChunks(inter, cut), severed, reshow });
    }
    return pages;
  }

  // [2c.6, LGMF 2026-09-25 — RUNNING_LOG §340, NOTATION_STANDARDS §5] THE PRINT PLAN, PLACED BY THE OBJECTS (the composer: "fit in
  // as much as possible on the page before the page turn"). Every drawn object whose print rule forbids a cut inside it becomes an
  // OPEN interval (a, b) in seconds where no cut may fall, from the layout model and the print's own geometry:
  //   · a UNIT (the 'whole' point kinds of one system at one time — heads, accidentals, ledgers, marks, its go-time indicators): its
  //     ink, from Render.inkSpanSs — and never (…, t] when its ink ends at its own time, so a unit ON a cut is wholly the next page's
  //   · a GC ('whole'): t − pre … t + post, padded by the impact dot and the stroke
  //   · a duration line ('stub'): from its unit's ink to the head + durationStubSs of line — after that a cut may fall inside it; a
  //     line shorter than that is whole. A hidden brick (the print draws none, D4) is no object. And its TAIL: no cut in its last
  //     durationStubSs either, so what continues on the next page is at least a stub, never a sliver (the AI's call, 2c.6)
  //   · a beam and a tuplet ('never-sever'): first tip to last tip · and the IR's beamable pairs, the splicer's stamp-atomic rule
  //   · a 'continue' kind (the level and glissando curves) FOLLOWS ITS NOTE: the same head + stub and tail rule as a duration line —
  //     with the print's bricks hidden, the curve IS the note's visible length (db1 p52: a curve starting 0.01 s before a cut had no
  //     samples to draw on its first page)
  //   o = { edge, inkSpanSs(it) → [l, r] ss, secPerSs, gcPrePost(it) → [pre, post] s, gcPadSec, stubSec, hideBricks }
  function edgeIntervals(ir, model, o) {
    const out = [];
    const P = k => o.edge && o.edge[k] && o.edge[k].print;
    const sec = ss => ss * o.secPerSs, key = t => Math.round(t * 1e6);
    for (const sys of (model && model.systems) || []) {
      const items = sys.items || [];
      const units = new Map();
      for (const it of items) {
        if (it.t === undefined || it.k === 'gc' || P(it.k) !== 'whole') continue;
        const e = o.inkSpanSs(it);
        if (!e) continue;
        const u = units.get(key(it.t)) || { t: it.t, a: Infinity, b: -Infinity };
        u.a = Math.min(u.a, it.t + sec(e[0])); u.b = Math.max(u.b, it.t + sec(e[1]));
        units.set(key(it.t), u);
      }
      for (const u of units.values()) out.push({ a: u.a, b: Math.max(u.b, u.t + EPS), kind: 'unit', part: sys.part, t: u.t });
      for (const it of items) {
        const pv = P(it.k);
        if (it.k === 'gc' && pv === 'whole') {
          const [pre, post] = o.gcPrePost(it);
          out.push({ a: it.t - pre - o.gcPadSec, b: it.t + post + o.gcPadSec, kind: 'gc', part: sys.part, t: it.t });
        } else if (pv === 'never-sever') {
          if (it.k === 'beam' && it.tips && it.tips.length >= 2) {
            const ts = it.tips.map(p => p.t);
            out.push({ a: Math.min(...ts), b: Math.max(...ts), kind: 'beam', part: sys.part, t: Math.min(...ts) });
          } else if (isFinite(it.t0) && isFinite(it.t1)) out.push({ a: it.t0, b: it.t1, kind: it.k, part: sys.part, t: it.t0 });
        } else if ((pv === 'stub' || pv === 'continue') && isFinite(it.t0) && isFinite(it.t1)) {
          if (it.k === 'brick' && o.hideBricks) continue;
          const u = units.get(key(it.t0));
          const lineStart = it.t0 + (it.dx0Ss ? sec(it.dx0Ss) : 0);
          const need = Math.max(u ? u.b : it.t0, lineStart) + o.stubSec;
          out.push({ a: u ? Math.min(u.a, it.t0) : it.t0, b: Math.min(need, it.t1), kind: it.k + ' (head + stub)', part: sys.part, t: it.t0 });
          if (it.t1 - o.stubSec > need) out.push({ a: it.t1 - o.stubSec, b: it.t1, kind: it.k + ' (tail stub)', part: sys.part, t: it.t0 });
        }
      }
    }
    // the splicer's stamp-atomic rule, kept: no cut between two beam-adjacent onsets of the IR
    for (const c of ir.chunks || []) for (const p of beamablePairs(ir, c)) out.push({ a: p[0], b: p[1], kind: 'beamable', part: c.part, t: p[0] });
    return out.filter(x => x.b > x.a + EPS).sort((x, y) => x.a - y.a);
  }

  // The planner (page_rules.printPlan 'objects'; absent = planPages + D59's reserves). A page OWNS [t0, t1) — half-open, an event ON a
  // cut is the next page's — and its window is [w0, w0 + S] at the one time scale. From each page's window start the cut is the LATEST
  // time ≤ w0 + S outside every interval: when w0 + S falls inside a block of intervals the cut moves back to the block's start — the
  // objects are pushed whole, a pushed GC's block starting at the top of its descent — so the next page opens exactly where its first
  // object's ink begins, and the system ENDS at the cut (inkEnd = t1): the blank at a page's right is exactly what was pushed.
  // FORCED, the exception: a block longer than a page (a dense GC stream, a very long beam) has no clean cut. Then the cut is the
  // LATEST at which every object it crosses can still be drawn whole on the page that owns its onset — this page's ink runs on to its
  // end inside the window, the next page's window opens at its ink start (D59, locally) — severing the fewest beams (a beam cannot be
  // kept whole that way); the page is recorded 'forced' with what it crosses.
  function planObjectPages(ir, rules, S, intervals) {
    if (!(isFinite(S) && S > 0)) throw new Error('splice: pageSeconds must be a finite number > 0');
    const [w0, w1] = ir.source.window;
    const minPage = rules.minPageSeconds || 0;
    const ext = materialExtents(ir);
    const allPairs = new Map(ir.chunks.map(c => [c.id, beamablePairs(ir, c)]));
    const wantReshow = !rules.reshowAtCut || rules.reshowAtCut.includes('tempoLabelContinuation');
    const merged = [];
    for (const x of intervals) {
      const m = merged[merged.length - 1];
      if (m && x.a < m.b - EPS) { m.b = Math.max(m.b, x.b); m.objs.push(x); }
      else merged.push({ a: x.a, b: x.b, objs: [x] });
    }
    const blockAt = t => {   // the merged block with t strictly inside it, by bisection
      let lo = 0, hi = merged.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1, m = merged[mid];
        if (t <= m.a + EPS) hi = mid - 1; else if (t >= m.b - EPS) lo = mid + 1; else return m;
      }
      return null;
    };
    const straddling = c => intervals.filter(x => x.a < c - EPS && c < x.b - EPS);
    // an object is this page's when its onset is before the cut — by RENDER'S OWN tolerance (render.js owns: t < cut − 1e-9), not the
    // planner's EPS: db1 p3 cut at a unit's t + 1e-6, and a GC at that t was drawn on the page but not counted in its ink end
    const ownedBefore = (x, c) => x.t < c - 1e-9;
    const desc = x => x.kind + ' part ' + x.part + ' @' + x.t.toFixed(3);
    const pages = [];
    let t = w0, w = w0, guard = 0;
    while (t < w1 - EPS) {
      if (++guard > 100000) throw new Error('splice: object page planning did not converge');
      const target = w + S;
      let cut, inkEnd, nextW, kind, pushed = [], forced = [];
      if (target >= w1 - minPage) { cut = w1; inkEnd = w1; nextW = w1; kind = 'end'; }
      else {
        const lo = Math.max(t + minPage, w + minPage);
        const m = blockAt(target);
        if (!m) { cut = target; kind = 'full'; }
        else if (m.a >= lo - EPS) { cut = m.a; kind = 'pushed'; pushed = m.objs.filter(x => x.b > m.a + EPS && x.a < target - EPS); }
        else {
          const cands = new Set([target]);
          for (const x of m.objs) for (const e of [x.a, x.b, x.t]) if (e >= lo - EPS && e <= target + EPS) cands.add(e);
          const SEVER = new Set(['beam', 'beamable', 'tuplet']);
          let best = null;
          for (const c of cands) {
            const st = straddling(c);
            if (st.some(x => ownedBefore(x, c) && x.b > target + EPS)) continue;   // an owned object would run off the window
            const sev = st.filter(x => SEVER.has(x.kind)).length;
            if (!best || sev < best.sev || (sev === best.sev && c > best.c)) best = { c, sev };
          }
          cut = best ? best.c : target; kind = 'forced'; forced = straddling(cut);
        }
        const mine = forced.filter(x => ownedBefore(x, cut)), theirs = forced.filter(x => !ownedBefore(x, cut));
        inkEnd = Math.min(target, Math.max(cut, ...mine.map(x => x.b)));
        nextW = Math.min(cut, ...theirs.map(x => x.a));
      }
      if (!(cut > t + EPS)) throw new Error('splice: object cut did not advance past ' + t);
      const inter = cut >= w1 - EPS ? [] : interruptedChunks(ir, ext, cut);
      let severed = 0;
      for (const c of inter) severed += severedPairs(allPairs.get(c.id) || [], cut);
      const reshow = [];
      if (wantReshow) for (const c of ir.chunks) {
        const e = ext.get(c.id);
        if (c.tempo && e[0] < t - EPS && t < e[1] - EPS)
          reshow.push({ part: c.part, text: rules.continuationPrefix + c.tempo.label });
      }
      pages.push({ t0: t, t1: cut, w0: w, inkEnd, kind, blank: Math.max(0, target - cut), pushed: pushed.map(desc), forced: forced.map(desc),
        interrupted: inter.map(c => c.id), offGrid: offGridChunks(inter, cut), severed, reshow });
      t = cut; w = nextW;
    }
    return pages;
  }

  return { planPages, tilePages, planObjectPages, edgeIntervals, chooseCut, interruptedChunks, materialExtents, beamablePairs };
});
