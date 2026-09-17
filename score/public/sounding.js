// sounding.js — WHAT IS SOUNDING, once, for the whole app (PLAN 1t step 1; CN-69 · CN-72; RUNNING_LOG §411–§418).
//
// THE RULE: a player is busy at a moment when something of its own is sounding there — a note by its length, a crescendo by its
// span, a trill or a beating by its zone — and **AN END EXACTLY AT t COUNTS AS FREE.** That last clause is the secco cut (CN-49):
// a crescendo that stops at t leaves its player open for the strike at t, which is the whole shape of his chain. A sound that
// STARTS exactly at t does count as busy — the player is committed there.
//
// WHY IT IS ITS OWN FILE: PLAN 1q-PRINCIPLE. This one read is called from the crescendo panel's `who` ticks (1t step 1) and from
// the orchestration panel's free/busy ticks (1t step 4). The defect history of the strikes drawer is one rule wired into one path
// and not its sibling (§340–351); this is the sibling pair, so it is one function.
//
// WHAT IT IS NOT: spacing.js's 150 ms rest. That answers "may this player START a new gesture here"; this answers "is this player
// making a sound here". The panel's `who` wants the second — a crescendo may begin the instant another one ends (the cut). A
// caller that means the first adds Spacing's rest itself.
//
// Pure: no DOM. The page (window.Sounding) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Sounding = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const EPS = 1e-9;
// spacing.js owns the shape of "one sounding thing" — never a second copy of that rule here
function SP() {
    if (typeof module === 'object' && module.exports) return require('./spacing.js');
    return (typeof self !== 'undefined' ? self.Spacing : null) || (typeof window !== 'undefined' ? window.Spacing : null);
}

// objects → spacing-shape events, minus what the caller wants ignored
// o: { metaLayer, exceptGroup, exceptIds, extra } — `extra` is events already placed in this pass (the panel feeds its own
// crescendos back in as it deals them, so a lane that has just taken one is busy at the next onset).
function eventsOf(objects, o) {
    const O = o || {}, S = SP();
    const ML = O.metaLayer != null ? +O.metaLayer : Infinity;
    const skipIds = O.exceptIds ? new Set(O.exceptIds) : null;
    const on = (objects || []).filter(x => {
        if (!x || x.layer == null || x.layer >= ML) return false;
        if (skipIds && skipIds.has(x.id)) return false;
        if (O.exceptGroup && x.groupId === O.exceptGroup) return false;
        return true;
    });
    const ev = S ? S.eventsOf(on) : [];
    return ev.concat((O.extra || []).filter(e => e && isFinite(e.t0) && isFinite(e.t1)));
}

// SOUNDING AT A MOMENT. A sound ending exactly at t is free; one starting exactly at t is busy.
function atEvents(events, t, lanes) {
    const want = lanes ? new Set(lanes) : null;
    const byLane = {};
    (events || []).forEach(e => {
        if (want && !want.has(e.lane)) return;
        if (e.t0 <= t + EPS && e.t1 > t + EPS) (byLane[e.lane] = byLane[e.lane] || []).push(e);
    });
    return byLane;
}
// SOUNDING OVER A WINDOW [t0, t1]. Touching at either edge is free — the cut rule, both ways.
function overEvents(events, t0, t1, lanes) {
    const want = lanes ? new Set(lanes) : null;
    const byLane = {};
    (events || []).forEach(e => {
        if (want && !want.has(e.lane)) return;
        if (e.t0 < t1 - EPS && e.t1 > t0 + EPS) (byLane[e.lane] = byLane[e.lane] || []).push(e);
    });
    return byLane;
}

// the answer the callers actually want: who is busy, who is free, and until when
function report(byLane, lanes) {
    const busy = [], free = [], until = {};
    (lanes || Object.keys(byLane).map(Number)).forEach(lane => {
        const list = byLane[lane] || [];
        if (!list.length) { free.push(lane); return; }
        busy.push(lane);
        until[lane] = Math.round(list.reduce((m, e) => Math.max(m, e.t1), -Infinity) * 1000) / 1000;
    });
    return { byLane, busy, free, until };
}

// ---------------------------------------------------------------- the two entry points
// at(objects, t, { lanes, … }) → { byLane, busy, free, until }
function at(objects, t, o) {
    const O = o || {}, lanes = O.lanes || null;
    return report(atEvents(eventsOf(objects, O), +t, lanes), lanes);
}
// over(objects, t0, t1, { lanes, … }) → the same, for a span
function over(objects, t0, t1, o) {
    const O = o || {}, lanes = O.lanes || null;
    return report(overEvents(eventsOf(objects, O), +t0, +t1, lanes), lanes);
}
// the same two, when the caller already holds events (the dealer, mid-pass)
function atIn(events, t, lanes) { return report(atEvents(events, +t, lanes), lanes); }
function overIn(events, t0, t1, lanes) { return report(overEvents(events, +t0, +t1, lanes), lanes); }

// THE NEXT SOUND on a lane after t — what 1l's end rule is measured against (the cap). null = nothing later.
function nextStart(events, lane, t) {
    let best = null;
    (events || []).forEach(e => {
        if (e.lane !== lane) return;
        if (e.t0 > t + EPS && (best == null || e.t0 < best)) best = e.t0;
    });
    return best;
}

return { at, over, atIn, overIn, eventsOf, nextStart, EPS };
}));
