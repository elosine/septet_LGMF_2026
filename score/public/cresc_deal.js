// cresc_deal.js — THE CRESCENDO PANEL'S DEAL, pure (PLAN 1t step 1; CN-68 · CN-69 · CN-70 · CN-71; RUNNING_LOG §411–§418).
//
// HIS ASK (CN-68): *"create a series of strikes, just single note ones that alternate with crescendos … I need to figure out a way
// to treat the piano so they can only be on the strikes"*. The shape he settled on (CN-69–71): **the drawer makes only the strikes;
// every crescendo is made in the SCORE from the strike that launches it, by selection** — nothing added to every note, the placements
// as clicks rather than numbers.
//
// So this file answers one question: given the onsets he has SELECTED, who crescendos, from when to when, on what pitch. The panel
// (cresc_panel.js) is the chassis around it and `Cresc.make` writes the object; nothing new in the sound.
//
// WHY PURE AND ITS OWN FILE: `check_cresc_panel.js` tests the deal headlessly, as `check_fill.js` tests fill's, and PLAN 1q-PRINCIPLE
// wants the rule in ONE function called from both the panel and the check — never the panel's own copy beside the check's.
//
// THE RULES, as agreed:
//   · the piano NEVER crescendos (CN-34) — it is refused here, not only greyed in the panel;
//   · a player in the selection never crescendos — it is striking;
//   · a player must be FREE at the onset (sounding.js: an end exactly there is free — the secco cut);
//   · every end is capped by 1l's rule (0.17 s before that player's next sound) and floored at 1l's `minS` (0.3 s); what was
//     capped or floored is reported, never silent;
//   · every pitch is folded into the player's ordinary-voice range by 1k's own fold; a pitch no octave reaches aborts that
//     crescendo, named.
//
// Pure: no DOM, no MIDI. The page (window.CrescDeal) and node (module.exports).
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.CrescDeal = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const EPS = 1e-9;
const r3 = x => Math.round(x * 1000) / 1000;
function SND() {
    if (typeof module === 'object' && module.exports) return require('./sounding.js');
    return (typeof self !== 'undefined' ? self.Sounding : null) || (typeof window !== 'undefined' ? window.Sounding : null);
}
function CR() {
    if (typeof module === 'object' && module.exports) return require('./cresc.js');
    return (typeof self !== 'undefined' ? self.Cresc : null) || (typeof window !== 'undefined' ? window.Cresc : null);
}

const MODES = [['one', 'one per onset'], ['all', 'all others from each onset']];
const ENDS = [['even', 'even'], ['together', 'together'], ['next', 'next strike']];
const HARMONY = [['these', 'these notes'], ['next', 'next strike'], ['drawer', 'the drawer'], ['typed', 'typed pitches']];   // §423: typed = his own list, dealt by register like the drawer's

const DEFAULTS = {
    mode: 'one',
    ends: 'even',
    endsS: 3,               // 'even' and 'together': the typed seconds
    harmony: 'these',
    endGapS: 0.17,          // 1l's end rule — the number lives in Cresc.DEFAULTS; this is the fallback when it is not loaded
    minS: 0.3,              // 1l's floor: shorter than this is not a crescendo
    piano: null,            // the piano's lane index — never offered (CN-34)
};

// ---------------------------------------------------------------- the onsets
// The selection, grouped into onsets. `notes` = { id, lane, midi, startSeconds, groupId }. Notes within `tolS` of each other are
// ONE onset (a chord's notes carry the same start, but a dragged one may sit a millisecond off).
function onsetsOf(notes, tolS) {
    const tol = tolS != null ? +tolS : 0.02;
    const N = (notes || []).filter(n => n && isFinite(+n.startSeconds)).slice().sort((a, b) => +a.startSeconds - +b.startSeconds);
    const out = [];
    N.forEach(n => {
        const last = out[out.length - 1];
        if (last && +n.startSeconds - last.t <= tol + EPS) { last.notes.push(n); return; }
        out.push({ t: r3(+n.startSeconds), notes: [n] });
    });
    out.forEach(o => {
        o.notes.sort((a, b) => a.lane - b.lane);
        o.lanes = [...new Set(o.notes.map(n => n.lane))];
        o.groupId = (o.notes.find(n => n.groupId) || {}).groupId || null;
    });
    return out;
}

// ---------------------------------------------------------------- the pitch strategies
// 'these'   — each crescendo takes its launching onset's pitch; an onset holding a chord deals its pitches in lane order, cycling
// 'next'    — the next strike group's pitches, dealt in time order over the crescendos (t0, then lane), cycling
// 'drawer'  — the drawer's keyboard pitches as they stand, DEALT BY REGISTER: the pitches low → high onto the players low → high
function pitchFor(c, i, ctx, O) {
    if (O.harmony === 'these') {
        const list = ctx.byOnset[c.onsetKey] || [];
        return list.length ? list[c.nAtOnset % list.length] : null;
    }
    if (O.harmony === 'next') {
        const list = ctx.nextPitches || [];
        return list.length ? list[i % list.length] : null;
    }
    const list = ctx.drawerPitches || [];
    if (!list.length) return null;
    return list[Math.min(list.length - 1, ctx.registerRank[c.lane] != null ? ctx.registerRank[c.lane] % list.length : i % list.length)];
}

// ---------------------------------------------------------------- THE DEAL
// onsets  : onsetsOf(...) — the selection, in time order
// events  : spacing-shape events of the whole score (the strikes INCLUDED — they are what bounds a crescendo)
// lanes   : the ticked candidate lanes, in the panel's order (score order)
// ranges  : { lane: [lo, hi] } the ordinary voice's range, for the fold
// o       : DEFAULTS above, plus { nextOnsets, drawerPitches, selectionLanes }
// → { crescs, aborts, notes }
function deal(onsets, events, lanes, ranges, o) {
    const O = Object.assign({}, DEFAULTS, o || {});
    const Cr = CR(), Sn = SND();
    const endGapS = O.endGapS != null ? +O.endGapS : (Cr ? Cr.DEFAULTS.endGapS : DEFAULTS.endGapS);
    const minS = O.minS != null ? +O.minS : (Cr ? Cr.DEFAULTS.minS : DEFAULTS.minS);
    const ON = (onsets || []).slice().sort((a, b) => a.t - b.t);
    const inSel = new Set(O.selectionLanes || [].concat.apply([], ON.map(x => x.lanes || [])));
    // the hard refusals, kept here and not only in the panel's ticks (1q-PRINCIPLE: the rule in one place)
    const P = (lanes || []).filter(l => l !== O.piano && !inSel.has(l));
    const live = (events || []).map(e => ({ lane: e.lane, t0: +e.t0, t1: +e.t1, group: e.group || null, kind: e.kind || 'note' }));
    const crescs = [], aborts = [], notes = [];
    if (!ON.length) return { crescs, aborts, notes: ['nothing selected'], settings: O };
    if (!P.length) return { crescs, aborts: ON.map(x => ({ t: x.t, why: 'noTickedPlayer' })), notes: ['no player is ticked'], settings: O };

    // 'together': one end for every crescendo — the latest start (the last selected onset) plus the seconds
    const lastOnsetT = ON[ON.length - 1].t;
    const togetherEnd = r3(lastOnsetT + Math.max(minS, +O.endsS || 0));

    // 'next strike' (§424, 2026-09-12 — his "from one onset to the next onset ... single notes, but using several instruments"):
    // every crescendo from an onset ends at the NEXT ATTACK after it — the first onset of any plain note later than it, the
    // selection's own later onsets included — all of them together, however many players. `attacks` is that list (the panel
    // reads the whole score after the selection's first onset); `nextOnsets` stays the next strike GROUP, for harmony: next.
    // (§421's landings — n notes at an onset = n crescendos, dealt round-robin — spread a run's onsets over the players and made
    // one note longer than the other; gone.)
    const nextOnsets = (O.nextOnsets || []).slice().sort((a, b) => a.t - b.t);
    const attacks = (O.attacks || nextOnsets).slice().sort((a, b) => a.t - b.t);
    const nextAttack = afterT => attacks.find(x => x.t > afterT + EPS) || null;

    // ---------------------------------------------------------- the pass: who, from when, to when — ONE walk, in time order
    // The end is decided at the moment a player is chosen, because the crescendo just placed is what makes that player busy at the
    // next onset. Deciding who first and how long afterwards would let two crescendos land on one player (found while writing this).
    const out = [];
    const used = new Set();
    const placed = () => live.concat(out.map(x => ({ lane: x.lane, t0: x.t0, t1: x.t1 })));
    ON.forEach(on => {
        const busyAt = Sn ? Sn.atIn(placed(), on.t, P) : { free: P.slice() };
        const free = (busyAt.free || []).filter(l => P.indexOf(l) >= 0);
        if (!free.length) { aborts.push({ t: on.t, why: 'noFreePlayer' }); return; }
        const take = O.mode === 'all' ? free.slice() : (() => { const l = free.find(x => !used.has(x)); return l == null ? [] : [l]; })();
        if (!take.length) { aborts.push({ t: on.t, why: 'ticksRanOut' }); return; }
        let nAtOnset = 0;
        take.forEach(lane => {
            used.add(lane);
            let t1 = null;
            if (O.ends === 'even') t1 = on.t + Math.max(0, +O.endsS || 0);
            else if (O.ends === 'together') t1 = togetherEnd;
            else {
                const nx = nextAttack(on.t);
                if (!nx) { aborts.push({ t: on.t, lane, why: 'noNextOnset' }); return; }
                t1 = nx.t;
            }
            // the floor, then the cap — in that order: a typed length under 0.3 s is raised to it, and the room may still refuse it
            let floored = false, capped = false;
            if (t1 < on.t + minS - EPS) { t1 = on.t + minS; floored = true; }
            const nx = Sn ? Sn.nextStart(placed(), lane, on.t) : null;
            if (nx != null) {
                const cap = nx - endGapS;
                if (t1 > cap + EPS) { t1 = cap; capped = true; }
            }
            if (t1 < on.t + minS - EPS) { aborts.push({ t: on.t, lane, why: 'noRoom', room: r3(Math.max(0, t1 - on.t)) }); return; }
            out.push({ lane, t0: on.t, t1: r3(t1), len: r3(t1 - on.t), onsetKey: on.t, groupId: on.groupId,
                       nAtOnset: nAtOnset++, how: O.ends, capped, floored });
        });
    });

    // ---------------------------------------------------------- pass 3: the pitch
    const ctx = { byOnset: {}, nextPitches: [], drawerPitches: (O.drawerPitches || []).slice().sort((a, b) => a - b), registerRank: {} };
    ON.forEach(on => { ctx.byOnset[on.t] = on.notes.map(n => +n.midi).filter(isFinite); });
    nextOnsets.forEach(on => (on.notes || []).forEach(n => { if (isFinite(+n.midi)) ctx.nextPitches.push(+n.midi); }));
    // the register rank: the ticked players ordered by the centre of their ordinary range, low → high
    P.slice().sort((a, b) => {
        const ra = ranges[a] || [0, 127], rb = ranges[b] || [0, 127];
        return ((ra[0] + ra[1]) / 2) - ((rb[0] + rb[1]) / 2) || a - b;
    }).forEach((lane, i) => { ctx.registerRank[lane] = i; });

    const made = [];
    out.forEach((c, i) => {
        const raw = pitchFor(c, i, ctx, O);
        if (raw == null) { aborts.push({ t: c.t0, lane: c.lane, why: 'noPitch' }); return; }
        const rg = ranges[c.lane] || [0, 127];
        const f = Cr ? Cr.foldInto(raw, rg[0], rg[1]) : { pitch: raw, fold: 0 };
        if (!f) { aborts.push({ t: c.t0, lane: c.lane, why: 'noOctave', raw }); return; }
        made.push(Object.assign({}, c, { midi: f.pitch, raw, fold: f.fold }));
    });

    if (aborts.some(a => a.why === 'noNextOnset')) notes.push('no attack after the selection');
    if (made.some(c => c.capped)) notes.push(made.filter(c => c.capped).length + ' capped by the next sound');
    if (made.some(c => c.floored)) notes.push(made.filter(c => c.floored).length + ' raised to the 0.3 s floor');
    if (made.some(c => c.fold)) notes.push(made.filter(c => c.fold).length + ' folded into range');
    return { crescs: made, aborts, notes, settings: O };
}

// the readout, one line — the panel's status and the check's console say the same thing
function summarize(res) {
    const n = res.crescs.length;
    const why = {};
    res.aborts.forEach(a => { why[a.why] = (why[a.why] || 0) + 1; });
    const WHY = { noFreePlayer: 'no free player', ticksRanOut: 'the ticks ran out', noNextOnset: 'no attack after it',
                  noRoom: 'no room', noPitch: 'no pitch', noOctave: 'no octave reaches', noTickedPlayer: 'nothing ticked' };
    const tail = Object.keys(why).map(k => why[k] + ' × ' + (WHY[k] || k)).join(' · ');
    return n + ' crescendo' + (n === 1 ? '' : 's')
        + (res.notes.length ? ' · ' + res.notes.join(' · ') : '')
        + (tail ? ' · none for: ' + tail : '');
}

return { MODES, ENDS, HARMONY, DEFAULTS, onsetsOf, deal, summarize };
}));
