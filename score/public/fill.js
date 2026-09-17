// fill.js — THE SEQUENCE FILLER (PLAN 1n step 1; CN-48 · CN-54 · CN-55; RUNNING_LOG §285–297).
//
// HIS UNIT (CN-54): *"the unit is the accent and the prolongued thing eg trill, crescendo, longtone; so the accent kicks off the long as
// if they were one unit"* — and *"two players, the accent prolonged by another instrument … for each attack in an instrument the long
// will start simultaneously in another instrument"*. So: a strike pattern goes in, and ONE LONG PER ATTACK comes out, each on a player
// that is not striking that attack.
//
// MEASURED FROM HIS OWN TEXTURE FIRST (§285, the trills at 135.78 s over `grp-strike-40-1357`, 46 attacks in 13 s): every trill starts
// at an attack of ANOTHER instrument (44/44), every one ends before its own player's next attack (44/44, median gap 171 ms = 1l's
// 0.17 s, arrived at independently), no instrument takes two in a row (0/43), and the lengths run 1.33 → 0.15 s as the run accelerates.
// **The length is derived, never chosen.** His stated selection rule ("the shortest available space") was measured and dropped: it gives
// a median long of 0.13 s with 40 of 46 under 0.4 s, the very thing he wanted to avoid.
//
// THE ANCHORS, NOT MODES (§288, §293). Each long holds two references — `launchedBy` and `cutBy`, each the ID OF AN ATTACK, never a
// position in the sequence, so he can re-point either at any other attack (*"how about if I wanted to extend it to a different strike to
// cut?"*). Launched: the accent starts it, the room ends it. Cut: the accent ends it AT THE END OF THE ACCENT NOTE (they overlap by the
// accent's own ~84 ms — free, because they are two players), and the room decides how early it began. Both: accent to accent. The two
// directions are one rule: measured as mirror images on his run, 43 longs and 3 aborts either way.
//
// Pure: no DOM, no MIDI, no pitches (those are step 2, pitch strategies). The page (window.Fill) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Fill = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const KINDS = [['cresc', 'crescendo'], ['trill', 'trill'], ['tone', 'long tone']];
// the floor per kind: a crescendo below 1l's `minS` is not a crescendo; a trill needs a few oscillations to read as one; the long tone's
// seat is here but nothing generates it until he asks (his "eventually long tone", §289)
const FLOORS = { cresc: 0.3, trill: 0.5, tone: 0.3 };

const DEFAULTS = {
    anchor: 'launch',       // 'launch' · 'cut' · 'both'
    kind: 'cresc',          // the pass's kind — ONE KIND by default (his "lungs will generally be homogeneous")
    kindRule: 'one',        // 'one' · 'proportion' · 'byRoom'
    kindB: 'trill',         // the second kind, for 'proportion' and 'byRoom'
    kindMix: 0.35,          // 'proportion': the share that takes kindB
    roomThresholdS: 2.5,    // 'byRoom': under it kindB (the trill), over it kind (the crescendo). His own trills stopped at 2.60 s.
    floors: null,           // per-kind overrides; null = FLOORS
    endGapS: 0.17,          // 1l: a long stops this long before the next sound on its player
    restMs: 150,            // 1l step 3: a player is free this long after its last sound ENDS
    // THE RE-ENTRY GAP, and it is a piece-specific loosening of that rule, measured (§298). A long BEGINS where its own player has just
    // been playing, inside one continuous texture — which is a re-articulation, not a new attack out of silence. His own 44 trills at
    // 135.78 s went down to **49 ms** there, and 16 of the 44 were under 150 ms; holding them to the full rest refuses 7 of his 46
    // attacks instead of 3. So the rest BEFORE a long is its own number, defaulting to the rule and loosened by him when the texture is
    // this dense. The room at the far end is untouched: `endGapS` still keeps a long clear of its player's next attack.
    startRestMs: null,      // null = use restMs
    fallbackS: 5,           // the cap, forwards AND backwards, when that player has nothing on the other side
    keepInside: false,      // clip the pass to the pattern's own span (a cut long may otherwise begin before the first attack, §293)
    cutAfter: 0,            // 'both': how many attacks later the cutting accent is (0 = this same attack is only valid for 'cut')
    seed: 1,
};

const r3 = x => Math.round(x * 1000) / 1000;
const EPS = 1e-9;
// the drawer's own generator, so a seed means the same thing in the strikes, the harmony bar and here
function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// THE PATTERN: the attacks of one strike group, read from the SCORE (never the strikes database — a group he has dragged or stretched
// must fill where it actually sits, §295).
function attacksOf(objects, groupId) {
    return (objects || [])
        .filter(o => o && o.groupId === groupId && o.type === 'waveCurve' && o.sonifyNote != null)
        .map(o => ({ id: o.id, t: +o.startSeconds, dur: Math.max(0, +o.endSeconds - +o.startSeconds), lane: o.layer, midi: o.sonifyNote }))
        .filter(a => isFinite(a.t))
        .sort((a, b) => a.t - b.t || a.lane - b.lane);
}

// ---------------------------------------------------------------- THE ROOM, one rule, two directions
// `events` is what the score already sounds, in spacing.js's shape { lane, t0, t1, group, kind } — the pattern's own attacks INCLUDED,
// because a player's own attacks are exactly what bound its long.
function laneEvents(events, lane) {
    return (events || []).filter(e => e && e.lane === lane && isFinite(e.t0) && isFinite(e.t1)).sort((a, b) => a.t0 - b.t0);
}

// FORWARDS: the long starts at `at` and runs to endGapS before that player's next sound, or the fallback.
function roomForward(lane, at, events, o) {
    const O = Object.assign({}, DEFAULTS, o || {});   // callable on its own: the card's flip and the re-point pass bare options
    const ev = laneEvents(events, lane);
    if (ev.some(e => e.t0 <= at + EPS && e.t1 > at + EPS)) return null;                     // sounding right now
    const rest = (O.startRestMs != null ? +O.startRestMs : O.restMs) / 1000;
    let restsUntil = -Infinity;
    ev.forEach(e => { if (e.t1 <= at + EPS) restsUntil = Math.max(restsUntil, e.t1 + rest); });
    if (restsUntil > at + EPS) return null;                                                 // still inside its 150 ms rest
    const nx = ev.find(e => e.t0 > at + EPS);
    const end = nx ? Math.min(nx.t0 - O.endGapS, at + O.fallbackS) : at + O.fallbackS;
    return end > at + EPS ? { t0: r3(at), t1: r3(end), boundedBy: nx ? 'nextSound' : 'fallback' } : null;
}

// BACKWARDS: the long ENDS at `endAt` (the end of the accent note) and reaches back to that player's last sound end + the rest, or the
// fallback. Reaching back before the pattern is the SHAPE of cut mode, not an edge case (§293) — `keepInside` is what clips it.
function roomBackward(lane, endAt, events, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const ev = laneEvents(events, lane);
    if (ev.some(e => e.t0 < endAt - EPS && e.t1 > endAt + EPS)) return null;                // sounding through the end
    let prev = -Infinity;
    ev.forEach(e => { if (e.t1 <= endAt + EPS && e.t1 > prev) prev = e.t1; });
    const floorT = endAt - O.fallbackS;
    const rest = (O.startRestMs != null ? +O.startRestMs : O.restMs) / 1000;
    const start = Math.max(prev > -Infinity ? prev + rest : floorT, floorT);
    return endAt > start + EPS ? { t0: r3(start), t1: r3(endAt), boundedBy: prev > -Infinity ? 'prevSound' : 'fallback' } : null;
}

// a named window, for 'both' and for a hand re-pointed anchor (step 4)
function windowFree(lane, t0, t1, events, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    if (!(t1 > t0 + EPS)) return false;
    const ev = laneEvents(events, lane);
    if (ev.some(e => e.t0 < t1 - EPS && e.t1 > t0 + EPS)) return false;                     // overlaps something
    const rest = (O.startRestMs != null ? +O.startRestMs : O.restMs) / 1000;
    if (ev.some(e => e.t1 <= t0 + EPS && e.t1 + rest > t0 + EPS)) return false;             // inside the rest after the last sound
    if (ev.some(e => e.t0 >= t1 - EPS && e.t0 - O.endGapS < t1 - EPS)) return false;        // too close to the next sound
    return true;
}

// ---------------------------------------------------------------- the kind
// byRoom uses the RAW length (before the floor), because the floor depends on the kind — his own trills stopped at 2.60 s, so a
// threshold near there hands the long ones to crescendos and leaves the short ones as trills (§291).
function kindFor(rawLen, i, O, rnd) {
    if (O.kindRule === 'byRoom') return rawLen < O.roomThresholdS ? O.kindB : O.kind;
    if (O.kindRule === 'proportion') return rnd() < O.kindMix ? O.kindB : O.kind;
    return O.kind;
}
function floorOf(kind, O) {
    const F = Object.assign({}, FLOORS, O.floors || {});
    return F[kind] != null ? F[kind] : FLOORS.cresc;
}

// ---------------------------------------------------------------- THE DEAL
// One long per attack. `players` is the lane indices that may take a long (the whole ensemble by default).
// Returns { longs, aborts, settings }. Deterministic from the seed.
function deal(attacks, events, players, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const A = (attacks || []).slice().sort((a, b) => a.t - b.t);
    const P = (players && players.length) ? players.slice() : [];
    const live = (events || []).map(e => ({ lane: e.lane, t0: +e.t0, t1: +e.t1, group: e.group || null, kind: e.kind || 'note' }));
    const rnd = mulberry32(Math.max(1, +O.seed || 1) * 7727 + 977);
    const first = A.length ? A[0].t : 0;
    const lastLong = {};                      // lane → the order number of its last long (for least-recently-long)
    const longs = [], aborts = [];
    // cut runs BACKWARDS in time so a long's room is judged against the longs already placed after it
    const order = O.anchor === 'cut' ? A.map((a, i) => i).reverse() : A.map((a, i) => i);
    let n = 0;

    order.forEach(k => {
        const a = A[k];
        n++;
        // the cutting accent, when there is one: 'cut' uses this attack; 'both' uses the one `cutAfter` later
        let cutAt = null;
        if (O.anchor === 'cut') cutAt = a;
        else if (O.anchor === 'both') {
            const j = k + Math.max(1, +O.cutAfter || 1);
            if (j >= A.length) { aborts.push({ attackId: a.id, k, t: a.t, why: 'noCuttingAccent' }); return; }
            cutAt = A[j];
        }
        const cands = [];
        P.forEach(lane => {
            if (lane === a.lane) return;                                   // never the player striking it — two players, always (§287)
            if (cutAt && lane === cutAt.lane) return;                      // nor the one that cuts it: it cannot strike while sustaining
            let span = null;
            if (O.anchor === 'launch') span = roomForward(lane, a.t, live, O);
            else if (O.anchor === 'cut') span = roomBackward(lane, r3(a.t + a.dur), live, O);
            else {
                const t0 = a.t, t1 = r3(cutAt.t + cutAt.dur);
                span = windowFree(lane, t0, t1, live, O) ? { t0: r3(t0), t1, boundedBy: 'bothAccents' } : null;
            }
            if (!span) return;
            if (O.keepInside && span.t0 < first - EPS) {                   // clip to the pattern's own span (§293)
                span = { t0: r3(first), t1: span.t1, boundedBy: 'clipped' };
            }
            cands.push(Object.assign({ lane }, span, { len: r3(span.t1 - span.t0) }));
        });
        if (!cands.length) { aborts.push({ attackId: a.id, k, t: a.t, why: 'noFreePlayer' }); return; }

        // the kind is decided from the roomiest raw length, then each candidate is tested against THAT kind's floor
        const raw = cands.reduce((m, c) => Math.max(m, c.len), 0);
        const kind = kindFor(raw, k, O, rnd);
        const floor = floorOf(kind, O);
        const fit = cands.filter(c => c.len >= floor - EPS);
        if (!fit.length) {
            aborts.push({ attackId: a.id, k, t: a.t, why: 'underFloor', kind, floor, best: raw });
            return;
        }
        // least-recently-long, the roomiest breaking the tie (§286: on an even pattern the two agree; on an uneven one the rotation is
        // what keeps the colour moving)
        fit.sort((x, y) => ((lastLong[x.lane] == null ? -1e9 : lastLong[x.lane]) - (lastLong[y.lane] == null ? -1e9 : lastLong[y.lane]))
                        || (y.len - x.len) || (x.lane - y.lane));
        const c = fit[0];
        const long = {
            attackId: a.id, lane: c.lane, t0: c.t0, t1: c.t1, len: r3(c.t1 - c.t0), kind, floor,
            launchedBy: (O.anchor === 'launch' || O.anchor === 'both') ? a.id : null,
            cutBy: cutAt ? cutAt.id : null,
            boundedBy: c.boundedBy, order: n,
        };
        longs.push(long);
        lastLong[c.lane] = n;
        live.push({ lane: c.lane, t0: c.t0, t1: c.t1, group: '(fill)', kind: 'fill' });   // later attacks see it
    });

    longs.sort((x, y) => x.t0 - y.t0 || x.lane - y.lane);
    aborts.sort((x, y) => x.t - y.t);
    return { longs, aborts, settings: O };
}

// ---------------------------------------------------------------- re-pointing an anchor by hand (step 4)
// Moving `launchedBy` or `cutBy` to another attack re-derives the long and REFUSES WITH A REASON rather than shrinking it (§293).
function repoint(long, which, attack, events, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    if (!long || !attack) return { ok: false, why: 'nothing to point at' };
    if (attack.lane === long.lane) return { ok: false, why: 'that attack is on this player — it cannot strike while sustaining' };
    const t0 = which === 'launchedBy' ? r3(attack.t) : long.t0;
    const t1 = which === 'cutBy' ? r3(attack.t + attack.dur) : long.t1;
    if (!(t1 > t0 + EPS)) return { ok: false, why: 'that attack is on the wrong side of this long' };
    const others = (events || []).filter(e => !(e.kind === 'fill' && e.lane === long.lane && Math.abs(e.t0 - long.t0) < 1e-6));
    if (!windowFree(long.lane, t0, t1, others, O)) return { ok: false, why: 'that player is not free over that span' };
    const len = r3(t1 - t0), floor = floorOf(long.kind, O);
    if (len < floor - EPS) return { ok: false, why: len.toFixed(2) + ' s is under the ' + floor.toFixed(2) + ' s floor for a ' + long.kind };
    const out = Object.assign({}, long, { t0, t1, len, boundedBy: 'byHand', pinned: true });
    out[which] = attack.id;
    return { ok: true, long: out };
}

// ---------------------------------------------------------------- the readout
function summarize(res, players) {
    const L = (res && res.longs) || [], A = (res && res.aborts) || [];
    const lens = L.map(x => x.len).sort((a, b) => a - b);
    const per = {}; L.forEach(x => { per[x.lane] = (per[x.lane] || 0) + 1; });
    const byKind = {}; L.forEach(x => { byKind[x.kind] = (byKind[x.kind] || 0) + 1; });
    const why = {}; A.forEach(x => { why[x.why] = (why[x.why] || 0) + 1; });
    const q = p => lens.length ? lens[Math.min(lens.length - 1, Math.floor(p * lens.length))] : null;
    return {
        made: L.length, aborted: A.length,
        min: lens.length ? lens[0] : null, median: q(0.5), max: lens.length ? lens[lens.length - 1] : null,
        perPlayer: (players || []).map(l => per[l] || 0), byKind, why,
        text: L.length
            ? L.length + ' longs' + (A.length ? ' · ' + A.length + ' aborted (' + Object.keys(why).map(k => why[k] + ' ' + k).join(', ') + ')' : '')
              + ' · ' + (lens[0]).toFixed(2) + '–' + (lens[lens.length - 1]).toFixed(2) + ' s, median ' + q(0.5).toFixed(2) + ' s'
              + ' · ' + Object.keys(byKind).map(k => byKind[k] + ' ' + k).join(' + ')
            : 'nothing placed' + (A.length ? ' — ' + A.length + ' attacks aborted (' + Object.keys(why).map(k => why[k] + ' ' + k).join(', ') + ')' : ''),
    };
}

return { KINDS, FLOORS, DEFAULTS, mulberry32, attacksOf, laneEvents, roomForward, roomBackward, windowFree, kindFor, floorOf, deal, repoint, summarize };
}));
