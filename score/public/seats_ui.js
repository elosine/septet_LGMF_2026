// seats_ui.js — A SEAT'S NOTES LEAVE THE DRAWER ON THEIR INSTRUMENT'S LANE (PLAN 1c.3, 2026-09-19; RUNNING_LOG §96).
//
// His words: *"I want two vibraphone players, because they have two bows."* The drawer's rows are TRACKS plus the extra seats
// (strike_drawer.js EXTRA_SEATS / TRK — today one: `Vibraphone 2`, a second row on the vibraphone's lane). Inside the drawer a seat is
// a row like any other — the shuffle, the hand assignment, the ticks, the chips, the chords at onsets all see it by its row index.
// This file is the boundary: the LAST mixin, its wrap of `notesFor` is the outermost, and every note that leaves for Hear, ♪ as dealt,
// Insert @ playhead or the swell's insert carries its SCORE lane (`lane`) and `seat: 2`; `playNotes` routes a seat's note to the
// instrument's first curve channel, `insert` writes it as a drawn note so the score's own channel pool separates the two bows.
// With no extra seat in TRACKS this file changes nothing.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[seats_ui] the strikes drawer is not loaded'); return; }
const _notesFor = D.notesFor;
D.notesFor = function (mode) {
    const out = _notesFor.apply(this, arguments);
    if (!out || !out.length || !this.tracks) return out;
    const T = this.tracks();
    return out.map(n => { const t = T[n.lane]; return (t && t.seatOf != null) ? Object.assign({}, n, { lane: t.seatOf, seat: 2, row: n.lane }) : n; });
};
}(typeof self !== 'undefined' ? self : this));
