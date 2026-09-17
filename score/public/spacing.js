// spacing.js — ONE SPACING RULE FOR THE WHOLE APP (PLAN 1l step 3; CN-48; RUNNING_LOG §256, §260).
//
// His rule (CN-48): "next articulation for any one instrument will be 150ms after end of crescendo" — generalised at his word (§256)
// to every sound: **A PLAYER IS FREE 150 ms AFTER ITS LAST SOUND ENDS.** Measured from the END, because once an event occupies time
// (a crescendo, a trill, a beating) measuring from its start says nothing about whether the player is busy.
//
// THE GESTURE CLAUSE (§260, decided after the piece was measured): the rest applies BETWEEN GESTURES, never INSIDE one. Notes that
// share a group — a morph's `grp-morph-NN`, a beating's zone, a strike's group — are one continuous sound and never block each other.
// Without it the rule outlaws the morph's own breathing: 18 pairs in the BLOOM at 183 s are a string holding 6–10 s and re-bowing
// 50 ms later, which is a re-breath, not a new articulation.
//
// WHAT IT REPLACES: PLAN 1k's chord engine counted attack to attack (200 ms there). His piece measured: 515 of its 549 notes are
// ≤ 200 ms and the median is 63 ms, so 63 + 150 = 213 ms is LOOSER than the old 250 ms — the strikes do not move.
//
// Pure: no DOM. The page (window.Spacing) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Spacing = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const DEFAULT_REST_MS = 150;

// one sounding thing on a lane: { lane, t0, t1, group } in SECONDS (t1 = when it stops sounding; a point attack has t1 = t0 + its length)
// A score object → that shape. Handles a note (waveCurve with sonifyNote), a zone (a trill, a beating) and a plain span.
function eventOf(o) {
    if (!o) return null;
    if (o.type === 'zone') return { lane: o.layer, t0: +o.startTime, t1: +o.endTime, group: o.groupId || o.id || null, kind: o.midiModel || 'zone' };
    if (o.type === 'waveCurve' && o.sonifyNote != null) return { lane: o.layer, t0: +o.startSeconds, t1: +o.endSeconds, group: o.groupId || null, kind: (o.properties && o.properties.cresc) ? 'cresc' : 'note' };
    return null;
}
function eventsOf(objects, lane) {
    return (objects || []).map(eventOf).filter(e => e && isFinite(e.t0) && isFinite(e.t1) && (lane == null || e.lane === lane))
        .sort((a, b) => a.t0 - b.t0);
}

// IS THIS PLAYER FREE at `t` (seconds)? `events` = what that player already sounds. `group` = the gesture the new sound belongs to
// (null = its own); a sound in the same group never blocks it.
function free(t, events, o) {
    const O = Object.assign({ restMs: DEFAULT_REST_MS, group: null, dur: 0 }, o || {});
    const rest = Math.max(0, +O.restMs) / 1000;
    let blockedBy = null, freeAt = -Infinity;
    (events || []).forEach(e => {
        if (O.group != null && e.group != null && e.group === O.group) return;    // the gesture clause: one continuous sound
        const until = e.t1 + rest;
        if (t < until - 1e-9 && e.t0 <= t + (+O.dur || 0) + 1e-9) { if (until > freeAt) { freeAt = until; blockedBy = e; } }
        else if (t >= until && e.t0 > t + (+O.dur || 0)) { /* it starts later than this sound ends: not a block backwards */ }
    });
    // a sound that STARTS during the new one also collides (the new sound would run over it)
    (events || []).forEach(e => {
        if (O.group != null && e.group != null && e.group === O.group) return;
        if (+O.dur > 0 && e.t0 > t && e.t0 < t + (+O.dur) - 1e-9) { const until = e.t1 + rest; if (until > freeAt) { freeAt = until; blockedBy = e; } }
    });
    return blockedBy ? { free: false, freeAt: Math.round(freeAt * 1000) / 1000, blockedBy } : { free: true, freeAt: Math.round(t * 1000) / 1000, blockedBy: null };
}

// the smallest rest actually left between two SEPARATE gestures of one player — the rule as a fact, for a readout or a check
function tightest(events) {
    const by = {};
    (events || []).forEach(e => (by[e.lane] = by[e.lane] || []).push(e));
    let min = Infinity, where = null;
    Object.keys(by).forEach(lane => {
        const list = by[lane].slice().sort((a, b) => a.t0 - b.t0);
        for (let i = 1; i < list.length; i++) {
            const prev = list[i - 1], cur = list[i];
            if (prev.group != null && cur.group != null && prev.group === cur.group) continue;   // inside one gesture
            const gap = (cur.t0 - prev.t1) * 1000;
            if (gap < min) { min = gap; where = { lane: +lane, t: cur.t0, gapMs: Math.round(gap) }; }
        }
    });
    return { ms: min === Infinity ? null : Math.round(min), where };
}

// every player free at t, from a list of players and everything the score sounds
function freePlayers(t, players, events, o) {
    return (players || []).filter(p => free(t, (events || []).filter(e => e.lane === p.lane), o).free);
}

return { DEFAULT_REST_MS, eventOf, eventsOf, free, tightest, freePlayers };
}));
