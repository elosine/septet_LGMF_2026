// strike_sounds.js — THE SOUND AT AN ONSET: a note (as always), or a CHORD dealt over the players free there (the overnight revision of
// 2026-09-10, his commission — STRIKES_TOOL §AD; RUNNING_LOG §333–334).
//
// His words: *"All I really want to do too with the enhancements were to replace those individual notes with different things. So one
// would be... instead of a single note, multiple notes. So more than one instrument playing that that rhythmic position. A chord. …
// maybe the best way is that I use the regular strikes to create the rhythm. And let's see. I generate thirteen onsets and maybe for
// each onset, I could click it and then choose something from the drawer, a harmony. and then the algorithm will orchestrate it for me.
// so that it knows the available musicians for that particular one. In any case, try to simplify it."*
//
// So, in NOTES mode, with the rhythm column untouched:
//   · double-click (or ALT-click) an onset dot on the rhythm strip → a small card for THAT onset;
//   · while the card is open, a click on any row of the left column (a strike, a blast, a chord shape, a stack …) makes that harmony the
//     sound at the onset: its notes dealt over the players FREE at that moment (the re-attack rule against the pattern's real onsets, the
//     notes by register, folded into each player's range, on that player's current row voice), the onset's own note replaced;
//   · `all onsets ← this harmony` and `all onsets ← the banner in turn` do the whole pattern at once; `note` puts an onset back;
//   · Hear and Insert see the chords through the drawer's own notesFor — nothing new in the score's file format (ordinary strike notes);
//     with the sound switch on `crescendo`, a chord's notes become swells like any other note at that onset.
//
// 2026-09-12 (§405, AH1–AH4): the deal now takes the players who SAT OUT LONGEST first (his alternation, 4 → 3 → 3 → 5, out of `max`
// alone), and an onset may carry its own piano count (0 = none here, n = a target topped up from the harmony, doubling allowed — CN-66)
// and its own ±8va for the piano.
//
// The sounds ride in cfg (so in takes and in the browser). REVERT: the git tag pre-revision-2026-09-10, or
// localStorage.setItem('septet.strikes.classic', '1') + reload, which makes this file do nothing.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[strike_sounds] the strikes drawer is not loaded'); return; }
let CLASSIC = false; try { CLASSIC = !!localStorage.getItem('septet.strikes.classic'); } catch (e) {}
if (CLASSIC) { console.log('[strike_sounds] classic mode — the sound-at-an-onset revision is off'); return; }

const SC = () => root.StrikeChords || null;
const HS = () => root.HarmSource || null;
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : (root.TRACKS || []);
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const LIT = 'background:#4a3a12;color:#e8cf9a;border:1px solid #C9A05A;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const HIT_MS = 140;

Object.assign(D, {

    // ------------------------------------------------------------ the sounds, keyed by onset
    snd() { if (!this.cfg.sounds || typeof this.cfg.sounds !== 'object') this.cfg.sounds = {}; return this.cfg.sounds; },
    sndSelection() { return this.cfg.sndSelection || 'spread'; },
    // the onsets of the pattern as it stands: the run's events, or one per voice (time order); each with a stable key
    onsetList() {
        if (!this.strike) return [];
        if (this.cfg.shape === 'accel') {
            const A = this.accelSeq();
            return (A.events || []).map((ev, pos) => ({ key: 'a' + pos, pos, onMs: ev.onMs, pitch: ev.pitch, voice: ev.unit && ev.unit.v ? ev.unit.v.i : null }));
        }
        const timed = this.timed().slice().sort((a, b) => a.onMs - b.onMs || a.v.i - b.v.i);
        return timed.map((q, pos) => ({ key: 'v' + q.v.i, pos, onMs: q.onMs, pitch: q.v.pitch, voice: q.v.i }));
    },
    onsetByKey(key) { return this.onsetList().find(o => o.key === key) || null; },

    // ------------------------------------------------------------ the deal at one onset
    // which lanes take part: every lane the pattern already uses (the players with rows), the piano when it is in the pattern
    sndLanes(notes) { const s = new Set(notes.map(n => n.lane)); return [...s].filter(l => l >= 0).sort((a, b) => a - b); },
    sndTechOf(lane, notes) {
        const mine = notes.find(n => n.lane === lane && n.tech); if (mine) return mine.tech;
        return this.strikeTechOf ? this.strikeTechOf(lane) : null;
    },
    // the chord's notes over the players free at t: free = no other sound of that lane inside t ± (hit + rest); the onset's own notes are
    // the ones being replaced and do not count. Pitches by register onto players by register (1k's rule), folded; the row's own voice.
    // §377: the rest is the run's `re-attack ≥` box — and 0 is a real value (it used to read as 250)
    sndRest() { const v = this.cfg.aMin; return (v === '' || v == null || !isFinite(+v)) ? 250 : Math.max(0, +v); },
    // §377 · CN-61 — the piano's share of a chord, one setting for the pattern; defaults when a take or the browser has none
    pnoCfg() { const c = this.cfg, num = (v, d) => (v === '' || v == null || !isFinite(+v)) ? d : +v;
        return { share: ['none', 'one', 'n', 'rest'].indexOf(c.pnoShare) >= 0 ? c.pnoShare : 'rest', n: Math.max(1, Math.round(num(c.pnoN, 2))),
                 reach: Math.max(1, Math.round(num(c.pnoReach, 14))), perHand: Math.max(1, Math.round(num(c.pnoPerHand, 5))), ms: Math.max(0, num(c.pnoMs, 100)), hands: c.pnoHands === 'one' ? 'one' : 'two' }; },
    pianoLane() { return TRK().findIndex(t => t.instKey === 'piano'); },
    // CN-61, his (a): the remainder fitted to two hands — the left from the bottom up and the right from the top down, each within its reach
    // and its count; what neither hand can hold is the MIDDLE, and it is dropped. Taken alternately (LH, RH, LH …) so `one` is the lowest
    // note and `up to n` keeps the outer voices first.
    handFit(rem, P) {
        const s = rem.slice().sort((a, b) => a - b); if (!s.length) return [];
        const lh = [], rh = [];
        for (const p of s) { if (lh.length < P.perHand && p - s[0] <= P.reach) lh.push(p); else break; }
        const top = s[s.length - 1];
        for (let i = s.length - 1; i >= 0; i--) { const p = s[i]; if (lh.indexOf(p) >= 0) break; if (rh.length < P.perHand && top - p <= P.reach) rh.push(p); else break; }
        const out = []; for (let i = 0; i < Math.max(lh.length, rh.length); i++) { if (i < lh.length) out.push(lh[i]); if (i < rh.length) out.push(rh[i]); }
        const lim = P.share === 'one' ? 1 : P.share === 'n' ? P.n : Infinity;
        return out.slice(0, lim);
    },
    // CN-67 (2026-09-12): ONE HAND per onset, the hands alternating. The piano's n notes (n ≤ notes/hand) are folded by octave into a
    // window one reach wide; the window sits wholly ABOVE or wholly BELOW the previous chord's (never over its ground — crossing is
    // fine), the side alternating from chord to chord (the first with a predecessor goes to the side the raw pitches lean to). The
    // pool is the leftovers first, then the ensemble's pitches (doubled), then — his word — a pitch already in the chord again at the
    // octave, when the reach allows it. `piano 8va` nudges where the window is aimed; the no-overlap rule wins. Short = what would not fit.
    oneHandFit(pool, n, P, oct, prev) {
        const KLO = 21, KHI = 108, R = Math.max(1, P.reach);
        const raw = pool.slice(0, Math.max(1, n)).map(x => x.p).sort((a, b) => a - b);
        const mid = raw.length ? raw[Math.floor(raw.length / 2)] + 12 * (oct || 0) : 60;
        const ideal = Math.round(mid - R / 2);
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        let dir = 0, noRoom = false, rlo = KLO, rhi = KHI - R;
        if (prev) {
            dir = prev.dir ? -prev.dir : (mid > (prev.lo + prev.hi) / 2 ? 1 : -1);
            const room = d => d > 0 ? [prev.hi + 1, KHI - R] : [KLO, prev.lo - 1 - R];
            let rg = room(dir); if (rg[0] > rg[1]) { dir = -dir; rg = room(dir); }
            if (rg[0] > rg[1]) { dir = 0; noRoom = true; } else { rlo = rg[0]; rhi = rg[1]; }
        }
        // the window is aimed at the raw pitches, then slid (nearest first, within the room) until n notes fit — an octave
        // duplicate needs its pitch in the bottom (reach − 12) of the window, so the slide is what makes his "duplicate at the octave" land
        const fill = base => {
            const top = base + R, set = [], src = { left: 0, dbl: 0, dup: 0 };
            for (const x of pool) { if (set.length >= n) break; const q = base + (((x.p - base) % 12) + 12) % 12; if (q > top || set.indexOf(q) >= 0) continue; set.push(q); src[x.src]++; }
            for (const q of set.slice().sort((a, b) => a - b)) { if (set.length >= n) break; if (q + 12 <= top && set.indexOf(q + 12) < 0) { set.push(q + 12); src.dup++; } }
            set.sort((a, b) => a - b); return { base, set, src };
        };
        const c0 = clamp(ideal, rlo, rhi); let best = fill(c0);
        for (let d = 1; best.set.length < n && d <= 12; d++) {
            for (const b of [c0 - d, c0 + d]) { if (b < rlo || b > rhi) continue; const t = fill(b); if (t.set.length > best.set.length) best = t; if (best.set.length >= n) break; }
        }
        const base = best.base, set = best.set, src = best.src;
        return { set, dir, lo: set.length ? set[0] : base, hi: set.length ? set[set.length - 1] : top, fromLeft: src.left, fromChosen: src.dbl, dup: src.dup, short: Math.max(0, n - set.length), noRoom };
    },
    dealChordAt(onset, harm, notes, sound) {
        const S = SC(); const restMs = this.sndRest(), t = onset.onMs; sound = sound || {};
        const own = notes.filter(n => Math.abs(n.onMs - t) < 1.5);
        const others = notes.filter(n => !own.includes(n));
        const pl = this.pianoLane();
        const lanes = this.sndLanes(notes).filter(l => l !== pl);   // CN-61: the piano never takes a note an ensemble player could — it takes the rest
        const busy = lane => others.some(n => n.lane === lane && (n.onMs + (n.durMs || HIT_MS) + restMs > t) && (n.onMs - restMs - HIT_MS < t));
        const free = lanes.filter(l => !busy(l)).map(lane => {
            const tech = this.sndTechOf(lane, notes); const inst = this.instOf(lane);
            const tq = inst && (inst.techniques || []).find(x => x.key === tech);
            const lo = tq && tq.rangeLow != null ? tq.rangeLow : (inst ? inst.rangeLow : 21), hi = tq && tq.rangeHigh != null ? tq.rangeHigh : (inst ? inst.rangeHigh : 108);
            return { lane, tech, lo, hi, centre: (lo + hi) / 2 };
        });
        const pitches = (harm.pitches || []).slice().sort((a, b) => a - b);
        // §377: a cap per onset, else the cap for every onset, else as many as are free. Found on the walk (§378): at 130 ms gaps a full
        // chord leaves NOBODY for the next onset (a 140 ms note cannot re-attack 130 ms later) — `every onset: max 3` makes them alternate.
        const mx = +sound.max > 0 ? +sound.max : (+this.cfg.sndMax > 0 ? +this.cfg.sndMax : 0);
        const max = mx ? Math.round(mx) : Infinity;
        const k = Math.min(pitches.length, free.length, max);
        const out = { lane: null, notes: [], wanted: pitches.length, free: free.length, taken: 0, folds: 0, skipped: 0, pno: 0, pnoWhy: '' };
        // §377: `reshuffle` per onset moves its seed; `deal: random` lets any free player take any note (by register otherwise)
        const rnd = (S && S.mulberry32) ? S.mulberry32(((+this.cfg.vSeed || 1) * 977) + onset.pos * 31 + 3 + (+sound.seed || 0) * 7919) : Math.random;
        const chosen = k ? ((S && S.select) ? S.select(pitches, k, this.sndSelection(), rnd) : pitches.slice(0, k)) : [];
        // §405 · AH1 (CN-65) THE RESTED PLAY FIRST. `others` is the pattern as it stands (the earlier deals already in it), so a lane's
        // latest onset before t gives its rest; a lane that has not played at all is Infinity and heads the queue. The COUNT is still
        // `max` — only WHO changes: the k longest-rested free players. Ties keep the order underneath (register, or shuffled under
        // `deal: random`), which holds because V8's sort is stable. His 4 → 3 → 3 → 5 then falls out of `max` alone.
        let pool = free.slice().sort((a, b) => a.centre - b.centre);
        if (sound.deal === 'random') for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        const lastOn = lane => { let best = -Infinity; for (const x of others) if (x.lane === lane && x.onMs < t && x.onMs > best) best = x.onMs; return best; };
        pool.forEach(p => { const L = lastOn(p.lane); p.rest = (L === -Infinity) ? Infinity : (t - L); });
        pool.sort((a, b) => (a.rest === b.rest ? 0 : b.rest > a.rest ? 1 : -1));
        // the players are CHOSEN by rest; the pitches still land on them by register (1k's rule) unless the deal is random
        let ps = pool.slice(0, k);
        if (sound.deal !== 'random') ps.sort((a, b) => a.centre - b.centre);
        const durMs = own.length ? own[0].durMs : HIT_MS, vel = own.length ? own[0].vel : 100;
        chosen.slice().sort((a, b) => a - b).forEach((P, j) => {
            const p = ps[j]; if (!p) return;
            const rz = this.realize(P, { lane: p.lane, tech: p.tech });
            if (!rz) { out.skipped++; return; }
            if (rz.fold) out.folds++;
            out.notes.push({ lane: p.lane, tech: p.tech, midi: rz.midi, standIn: !!rz.standIn, pitch: P, onMs: t, durMs, vel });
        });
        out.taken = out.notes.length;
        // CN-61: the piano — the chord's REMAINDER (never a doubling), fitted to two hands, on its own attack-to-attack clock (a pianist
        // repeats faster than the ensemble's rest allows). Not under a crescendo: a piano cannot swell (CN-34, §343).
        // §405 · AH2 · AH3 · the ±8va (CN-65 · CN-66). The pattern's setting still rules, but an onset may carry its OWN COUNT:
        // blank = the pattern's · 0 = the piano sits this one out · n = a TARGET of n notes — the leftovers first and then, when they do
        // not reach n, pitches the ensemble is already playing (CN-66 relaxes CN-61 (a)'s no-doubling, for the top-up only), drawn with
        // this onset's own `rnd` so `reshuffle` re-draws them. `piano 8va` moves the piano's pitches before realize (which folds at the
        // keyboard's ends); the two-hand guard runs after, unchanged.
        const P = this.pnoCfg();
        const perOnset = (sound.pno === '' || sound.pno == null || !isFinite(+sound.pno)) ? null : Math.max(0, Math.round(+sound.pno));
        const blk = this.pianoBlock({
            lane: pl, pitches, chosen, perOnset, oct: +sound.pno8va || 0,
            hand: (sound.pnoHand === 'one' || sound.pnoHand === 'two') ? sound.pnoHand : null,
            prev: this._pnoPrev || null,
            pBusy: pl >= 0 && others.some(n => n.lane === pl && Math.abs(n.onMs - t) < P.ms),
            noSwell: !!(this.isSwell && this.isSwell()),
            tech: this.sndTechOf(pl, notes), t, durMs, vel, rnd,
        });
        blk.notes.forEach(n => out.notes.push(n));
        out.pno = blk.pno; out.pnoWhy = blk.pnoWhy; if (blk.pnoWin) out.pnoWin = blk.pnoWin;
        return out;
    },

    // ---------------------------------------------------------------- THE PIANO BLOCK, once (PLAN 1t step 5)
    // (pitches, chosen, count, 8va, hands, prev) -> the piano's notes + the readout. Lifted out of `dealChordAt` unchanged, so that
    // the CHORD deal (§405 · §409, its behaviour untouched) and the PLAIN deal at the piano's own shuffled onset call the SAME rule.
    // PLAN 1q-PRINCIPLE: the defect history of this drawer is one rule wired into one path and not its sibling.
    //   a.pitches   the harmony as it stands · a.chosen what the ensemble takes (the top-up's bag, CN-66)
    //   a.perOnset  null = the pattern's setting · 0 = the piano sits this one out · n = a TARGET of n notes
    //   a.oct       `piano 8va`, ±4 · a.hand 'one' | 'two' | null = the pattern's · a.prev the last piano chord's window (CN-67)
    //   a.seed      a pitch that LEADS the leftovers — the plain deal's own note, which the piano is already holding
    pianoBlock(a) {
        const out = { notes: [], pno: 0, pnoWin: null, pnoWhy: '' };
        const P = this.pnoCfg(), pl = a.lane;
        const oct = Math.max(-4, Math.min(4, Math.round(+a.oct || 0)));
        const perOnset = (a.perOnset === '' || a.perOnset == null || !isFinite(+a.perOnset)) ? null : Math.max(0, Math.round(+a.perOnset));
        const rnd = a.rnd || Math.random, tech = a.tech, t = a.t, durMs = a.durMs, vel = a.vel;
        const pitches = (a.pitches || []).slice(), chosen = (a.chosen || []).slice();
        if (pl < 0) return out;
        if (perOnset === 0) { out.pnoWhy = 'off here'; return out; }
        if (!(perOnset > 0 || P.share !== 'none') || a.noSwell) return out;   // CN-34: a piano cannot swell (§343)
        const left = pitches.slice(); chosen.forEach(c => { const i = left.indexOf(c); if (i >= 0) left.splice(i, 1); });
        if (a.seed != null) { const i = left.indexOf(a.seed); if (i >= 0) left.splice(i, 1); left.unshift(a.seed); }
        const pBusy = !!a.pBusy;
        let set = left.slice(), doubled = 0, why = '';
        if (perOnset > 0) {
            if (set.length < perOnset && chosen.length) {           // the top-up, drawn in this onset's own shuffle
                const bag = chosen.slice();
                for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
                while (set.length < perOnset && bag.length) { set.push(bag.shift()); doubled++; }
            }
            why = Math.min(left.length, perOnset) + ' left over' + (doubled ? ' + ' + doubled + ' doubled' : '')
                + (set.length < perOnset ? ' — ' + perOnset + ' asked, the harmony has ' + pitches.length : '');
        }
        const hand = (a.hand === 'one' || a.hand === 'two') ? a.hand : P.hands;
        if (hand === 'one' && !pBusy && (left.length || chosen.length)) {   // CN-67
            const n0 = perOnset > 0 ? perOnset : P.share === 'one' ? 1 : P.share === 'n' ? P.n : left.length;
            if (!n0) { out.pnoWhy = 'nothing left'; return out; }
            const n = Math.min(n0, P.perHand);
            const bag = chosen.slice();
            for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
            const pool = left.slice().sort((a, b) => a - b).map(p => ({ p, src: 'left' })).concat(bag.map(p => ({ p, src: 'dbl' })));
            const fit = this.oneHandFit(pool, n, P, oct, a.prev || null);
            fit.set.forEach(p => { const rz = this.realize(p, { lane: pl, tech }); if (!rz) return; out.notes.push({ lane: pl, tech, midi: rz.midi, standIn: !!rz.standIn, pitch: p, onMs: t, durMs, vel }); out.pno++; });
            out.pnoWin = { lo: fit.lo, hi: fit.hi, dir: fit.dir };
            const bits = ['one hand' + (fit.dir > 0 ? ' \u2191' : fit.dir < 0 ? ' \u2193' : '')];
            bits.push(fit.fromLeft + ' left over' + (fit.fromChosen ? ' + ' + fit.fromChosen + ' doubled' : '') + (fit.dup ? ' + ' + fit.dup + ' at the 8ve' : ''));
            if (fit.short) bits.push(fit.short + ' short of ' + n);
            if (n < n0) bits.push(P.perHand + '/hand caps ' + n0);
            if (fit.noRoom) bits.push('no room beside the last chord');
            if (oct) bits.push((oct > 0 ? '+' : '') + oct + ' 8va');
            out.pnoWhy = bits.join(' \u00b7 ');
            return out;
        }
        const want = perOnset > 0 ? Math.min(set.length, perOnset) : set.length;
        if (!want) out.pnoWhy = perOnset > 0 ? 'nothing to take' : 'nothing left';
        else if (pBusy) out.pnoWhy = 'too soon';
        else {
            const lim = perOnset > 0 ? { share: 'n', n: perOnset, reach: P.reach, perHand: P.perHand, ms: P.ms } : P;
            this.handFit(set.map(p => p + 12 * oct), lim).forEach(p => { const rz = this.realize(p, { lane: pl, tech }); if (!rz) return; out.notes.push({ lane: pl, tech, midi: rz.midi, standIn: !!rz.standIn, pitch: p, onMs: t, durMs, vel }); out.pno++; });
            if (out.pno) { const ps = out.notes.map(n => n.midi); out.pnoWin = { lo: Math.min.apply(null, ps), hi: Math.max.apply(null, ps), dir: 0 }; }
            const drop = want - out.pno;
            const bits = []; if (why) bits.push(why); if (drop > 0) bits.push(drop + ' dropped'); if (oct) bits.push((oct > 0 ? '+' : '') + oct + ' 8va');
            out.pnoWhy = bits.join(' · ');
        }
        return out;
    },
    // ---------------------------------------------------------------- PLAN 1t step 5: the block on the PLAIN strike
    // The piano row's own three controls, read once. Blank count = today exactly: the piano's ONE note at its own shuffled onset.
    plainPnoCfg() {
        const c = this.cfg, blank = v => v === '' || v == null || !isFinite(+v);
        return { count: blank(c.pnoRowN) ? null : Math.max(0, Math.round(+c.pnoRowN)),
                 oct: blank(c.pnoRow8va) ? 0 : Math.max(-4, Math.min(4, Math.round(+c.pnoRow8va))),
                 hands: c.pnoRowHands === 'one' ? 'one' : c.pnoRowHands === 'two' ? 'two' : null };
    },
    // the piano's one note becomes a chord of `count` — the SAME `pianoBlock` the chord deal calls, so CN-61 · CN-66 · CN-67 and the
    // ±4 8va hold on both paths. An onset the CHORD deal already handled keeps its own piano chord: one rule per onset, never both.
    applyPlainPiano(notes, mode) {
        const R = this.plainPnoCfg();
        if (mode === 'piano' || !(R.count > 0)) { this._pnoRowWhy = ''; return notes; }
        if ((this.isChords && this.isChords()) || (this.isFill && this.isFill())) return notes;
        const pl = this.pianoLane(); if (pl < 0) return notes;
        const S = SC();
        const map = this.snd();
        const chordT = new Set();
        this.onsetList().forEach(o => { if (map[o.key] && map[o.key].kind === 'chord') chordT.add(Math.round(o.onMs)); });
        // the harmony as it stands, and what the ensemble plays (the top-up's bag) — from the VOICES, so neither is a folded pitch
        const all = [...new Set(this.voices.map(v => v.pitch))].sort((a, b) => a - b);
        const ens = [...new Set(this.voices.filter(v => this.reals(v).some(r => !r.skip && r.lane !== pl)).map(v => v.pitch))].sort((a, b) => a - b);
        const byKey = {}; this.timed().forEach(q => { byKey[Math.round(q.onMs) + ':' + q.v.pitch] = q.v; });
        const report = (this._sndReport || []).slice();
        const out = []; const why = []; let prev = null;
        notes.slice().sort((a, b) => a.onMs - b.onMs).forEach(n => {
            if (n.lane !== pl || chordT.has(Math.round(n.onMs))) { out.push(n); return; }
            const rnd = (S && S.mulberry32) ? S.mulberry32(((+this.cfg.vSeed || 1) * 977) + Math.round(n.onMs) * 31 + 5) : Math.random;
            const blk = this.pianoBlock({ lane: pl, pitches: all, chosen: ens, perOnset: R.count, oct: R.oct, hand: R.hands,
                prev, pBusy: false, noSwell: !!(this.isSwell && this.isSwell()),
                tech: n.tech, t: n.onMs, durMs: n.durMs, vel: n.vel, rnd, seed: n.midi });
            if (!blk.notes.length) { out.push(n); if (blk.pnoWhy) why.push(blk.pnoWhy); return; }
            blk.notes.forEach(x => out.push(x));
            if (blk.pnoWin) prev = blk.pnoWin;
            if (blk.pnoWhy) why.push(blk.pnoWhy);
            const v = byKey[Math.round(n.onMs) + ':' + n.midi];
            if (v) report.push({ key: 'v' + v.i, taken: 0, wanted: R.count, free: 0, folds: 0, skipped: 0,
                                 pno: blk.pno, pnoWhy: blk.pnoWhy, notes: blk.notes });
        });
        this._sndReport = report;
        this._pnoRowWhy = why.length ? (R.count + ' per onset · ' + why[0]) : '';
        return out;
    },

    // the piano row's three boxes and their readout, refreshed with the strip (PLAN 1t step 5)
    paintPnoRow() {
        const el = this.el; if (!el) return;
        const R = this.plainPnoCfg();
        const set = (id, v) => { const b = el.querySelector(id); if (b && document.activeElement !== b) b.value = v; };
        set('#skPnoRowN', this.cfg.pnoRowN == null ? '' : this.cfg.pnoRowN);
        set('#skPnoRow8va', R.oct || 0);
        set('#skPnoRowHands', this.cfg.pnoRowHands || '');
        const why = el.querySelector('#skPnoRowWhy');
        if (why) why.textContent = (R.count > 0 && this._pnoRowWhy) ? this._pnoRowWhy : '';
    },

    // the pattern's notes with the chords in: the onset's own note(s) replaced by the deal — the hook under notesFor (Hear and Insert)
    applySounds(notes, mode) {
        const map = this.snd(); const keys = Object.keys(map).filter(k => map[k] && map[k].kind === 'chord');
        if (!keys.length) this._sndReport = [];   // §378: `clear all` left the last report behind, so its hollow dots stayed on the strip
        if (!keys.length || mode === 'piano' || (this.isChords && this.isChords()) || (this.isFill && this.isFill())) return notes;
        const onsets = this.onsetList(); let out = notes.slice(); const report = []; this._pnoPrev = null;   // CN-67: the last piano chord's window
        // deal in time order, each deal seeing the pattern as it stands with the earlier deals in it (so a big chord early leaves fewer free)
        onsets.filter(o => keys.includes(o.key)).sort((a, b) => a.onMs - b.onMs).forEach(o => {
            const harm = map[o.key].harm; if (!harm || !harm.pitches || !harm.pitches.length) return;
            const r = this.dealChordAt(o, harm, out, map[o.key]); if (r.pno > 0 && r.pnoWin) this._pnoPrev = r.pnoWin;
            out = out.filter(n => Math.abs(n.onMs - o.onMs) >= 1.5).concat(r.notes.map(n => ({ lane: n.lane, tech: n.tech, midi: n.midi, vel: n.vel, onMs: n.onMs, durMs: n.durMs, chord: harm.name || harm.id })));
            report.push({ key: o.key, pos: o.pos, taken: r.taken, wanted: r.wanted, free: r.free, folds: r.folds, pno: r.pno, pnoWhy: r.pnoWhy, notes: r.notes });
        });
        this._sndReport = report;
        return out.sort((a, b) => a.onMs - b.onMs || a.lane - b.lane);
    },
    sndReadout() {
        const rep = this._sndReport || []; if (!rep.length) return '';
        const T = TRK();
        return rep.map(r => 'onset ' + (r.pos + 1) + ': ' + r.taken + ' of ' + r.wanted + (r.free < r.wanted ? ' (' + r.free + ' free)' : '') + (r.folds ? ', ' + r.folds + ' folded' : '') + ' + pno ' + r.pno + (r.pnoWhy ? ' (' + r.pnoWhy + ')' : '') + ' — ' + r.notes.map(n => (T[n.lane] || {}).short + ':' + nm(n.midi)).join(' ')).join(' · ');
    },
    // §377: ♪ on the card — this onset alone, now, through the drawer's own Hear (the notes it would play, moved to time 0)
    async hearSndOnset(key) {
        const o = this.onsetByKey(key); if (!o) return;
        this._onlyAt = o.onMs;
        try { await this.play('orch'); } finally { this._onlyAt = null; }
    },

    pnoSummary() { const P = this.pnoCfg(); return ({ none: 'none', one: 'one note', n: 'up to ' + P.n, rest: 'the rest' })[P.share] + ' · reach ' + P.reach + ' · ' + P.perHand + '/hand · ≥ ' + P.ms + ' ms' + (P.hands === 'one' ? ' · one hand, alternating' : ''); },

    // ------------------------------------------------------------ setting a sound
    setSoundAt(key, sound) {
        const map = this.snd();
        if (!sound || sound.kind === 'note') delete map[key]; else map[key] = sound;
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render(); this.paintSoundCard();
    },
    harmFromId(id) {
        if (!id) return null;
        const s = this.strikeById ? this.strikeById(id) : (this.db && this.db.strikes[id]);
        if (!s) return null;
        const pitches = [...new Set((s.notes || []).map(n => n.midi))].sort((a, b) => a - b);
        return { id, name: s.synthetic ? (s.harm.id + ' · ' + s.harm.name) : ('#' + s.index), pitches };
    },
    assignSoundHarm(id) {
        const card = this._sndCard; if (!card) return false;
        const harm = this.harmFromId(id); if (!harm) return false;
        this.snapshot();
        this.setSoundAt(card.key, Object.assign({}, this.snd()[card.key] || {}, { kind: 'chord', harm }));   // §377: a new harmony keeps the onset's max / deal / seed
        this.setStatus('onset ' + (card.pos + 1) + ' → ' + harm.name + ' (' + harm.pitches.length + ' notes) · ' + this.sndReadout().split(' · ').filter(x => x.indexOf('onset ' + (card.pos + 1) + ':') === 0).join(''));
        return true;
    },
    allOnsetsHarm(harm) {
        if (!harm) return;
        this.snapshot(); const map = this.snd();
        this.onsetList().forEach(o => { map[o.key] = Object.assign({}, map[o.key] || {}, { kind: 'chord', harm }); });
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render(); this.paintSoundCard();
        this.setStatus('every onset → ' + harm.name + ' · ' + this.sndReadout());
    },
    allOnsetsBannerInTurn(bankKey) {
        const groups = this.harmGroups ? this.harmGroups() : null; if (!groups) { this.setStatus('the harmonies are not read yet — open the morph panel once', true); return; }
        const H = HS(); let items = [];
        if (bankKey === 'strikes') {
            const ids = this.seq ? this.seq.strikeIds : [];
            const from = Math.max(0, ids.indexOf(this.cfg.strikeId));   // 2026-09-12: the walk starts at the HIGHLIGHTED strike (#14 on → #14, #15 …), #0 when none
            items = ids.slice(from).concat(ids.slice(0, from)).map(id => this.harmFromId(id)).filter(Boolean);
        }
        else { const g = groups.find(x => x.key === bankKey); if (g) items = g.items.map(e => this.harmFromId(H.harmId(e.value, e.root))).filter(Boolean); }
        if (!items.length) { this.setStatus('nothing in that banner', true); return; }
        this.snapshot(); const map = this.snd();
        this.onsetList().forEach((o, i) => { map[o.key] = Object.assign({}, map[o.key] || {}, { kind: 'chord', harm: items[i % items.length] }); });
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render(); this.paintSoundCard();
        this.setStatus('every onset ← ' + bankKey + ' in turn from ' + (items[0] && items[0].name || 'the top') + ' (' + items.length + ') · ' + this.sndReadout());
    },
    clearSounds() { this.snapshot(); this.cfg.sounds = {}; if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.paintSoundCard(); this.setStatus('every onset back to a note'); },

    // ------------------------------------------------------------ the card
    openSoundCard(key, ev) {
        const o = this.onsetByKey(key); if (!o) return;
        this.closeSoundCard();
        const box = document.createElement('div');
        box.id = 'skSndCard';
        box.style.cssText = 'position:fixed;z-index:9650;width:350px;background:#26262e;color:#ddd;border:1px solid #C9A05A;border-radius:6px;font:11px/1.5 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);user-select:none';
        const x0 = ev && ev.clientX != null ? ev.clientX : 400, y0 = ev && ev.clientY != null ? ev.clientY : 300;
        box.style.left = Math.max(4, Math.min(window.innerWidth - 360, x0 + 14)) + 'px';
        box.style.top = Math.max(4, Math.min(window.innerHeight - 330, y0 - 40)) + 'px';
        box.innerHTML = '<div id="skSndDrag" style="display:flex;justify-content:space-between;align-items:center;padding:4px 7px;background:#3a2f12;border-bottom:1px solid #C9A05A;cursor:move;border-radius:6px 6px 0 0">'
            + '<b style="color:#e8cf9a">onset <span id="skSndN"></span></b><span id="skSndT" style="color:#9a9"></span><span id="skSndX" style="cursor:pointer;color:#aaa;font-size:13px">&#10005;</span></div>'
            + '<div style="padding:6px 7px;display:flex;flex-direction:column;gap:5px">'
            + '<div style="display:flex;gap:4px;align-items:center"><span style="color:#888">sound</span><button id="skSndNote" style="' + BTN + '">note</button><button id="skSndChord" style="' + BTN + '">chord</button>'
            + '<label style="margin-left:auto;color:#888" title="which notes of the chord are taken when there are more notes than free players — 1k\'s vocabulary">take <select id="skSndSel" style="' + INP + '"><option value="spread">spread</option><option value="shuffle">shuffle</option><option value="high">high</option><option value="low">low</option><option value="played">as played</option></select></label></div>'
            // §377: this onset's own controls — a cap on the players, the dealer, a fresh draw, and ♪ for this onset alone
            + '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
            + '<label title="at most this many ensemble players on this chord; blank = as many as are free">max <input id="skSndMax" type="number" min="1" max="7" step="1" placeholder="all" style="' + INP + ';width:40px"></label>'
            + '<label title="by register: the lowest note to the lowest-sitting free player and up · random: any free player takes any note (folded into range)">deal <select id="skSndDealBy" style="' + INP + '"><option value="register">by register</option><option value="random">random</option></select></label>'
            + '<button id="skSndRe" style="' + BTN + '" title="a different draw for this onset only (the notes taken under take: shuffle, the players under deal: random)">reshuffle</button>'
            + '<button id="skSndHear" style="' + BTN + ';color:#e8cf9a" title="hear this onset alone">&#9834;</button></div>'
            + '<div id="skSndHarm" style="color:#e8cf9a"></div>'
            + '<div id="skSndDeal" style="color:#9a9;white-space:normal"></div>'
            // §377: the rest the deal uses, shown where it bites (it was only in the run's block, as `re-attack ≥`, default 250)
            + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
            + '<label title="a player is free again this long after its note ends — the same number as the run\'s re-attack ≥. At 130 ms gaps use ~20–50">rest <input id="skSndRest" type="number" min="0" step="10" style="' + INP + ';width:48px"> ms <span style="color:#666">(= re-attack &ge;)</span></label>'
            + '<label title="the cap for every onset without its own max. At 130 ms gaps with six players a full chord leaves nobody for the next onset — 3 lets the chords alternate">every onset: max <input id="skSndMaxAll" type="number" min="1" max="7" step="1" placeholder="all" style="' + INP + ';width:40px"></label></div>'
            // §377 · CN-61: the piano, one setting for the whole pattern
            + '<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;border-top:1px solid #3a3a44;padding-top:5px" title="CN-61: the piano takes what the ensemble did not (never a doubling), fitted to two hands — the left from the bottom, the right from the top, the middle dropped">'
            + '<span style="color:#e8cf9a">piano</span><select id="skSndPno" style="' + INP + '"><option value="none">none</option><option value="one">one note</option><option value="n">up to n</option><option value="rest">the rest</option></select>'
            + '<label>n <input id="skSndPnoN" type="number" min="1" max="10" step="1" style="' + INP + ';width:34px"></label>'
            + '<label title="one hand\'s reach in semitones (14 = a ninth)">reach <input id="skSndReach" type="number" min="1" max="24" step="1" style="' + INP + ';width:34px"></label>'
            + '<label title="notes per hand">/hand <input id="skSndHand" type="number" min="1" max="5" step="1" style="' + INP + ';width:30px"></label>'
            + '<label title="CN-67: one = each chord in ONE hand (n &le; notes/hand, folded into one reach), wholly above or below the last chord, the side alternating — the hands alternate by construction">hands <select id="skSndHands" style="' + INP + '"><option value="two">two</option><option value="one">one, alternating</option></select></label>'
            + '<label title="the piano\'s own clock, attack to attack: it skips a chord that comes sooner than this after its last one (the ensemble\'s rest does not apply to it)">&ge; <input id="skSndPnoMs" type="number" min="0" step="10" style="' + INP + ';width:42px"> ms</label></div>'
            // §405 · AH2 · AH3: this onset's own piano count and octave — the way `max` overrides `every onset: max`
            + '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
            + '<span style="color:#e8cf9a">this onset</span>'
            + '<label title="how many notes the piano takes AT THIS ONSET — blank = whatever the pattern says above &middot; 0 = the piano sits this one out &middot; n = a TARGET of n notes: the leftovers first, then pitches the ensemble is already playing, until n (CN-66)">piano count <input id="skSndPnoAt" type="number" min="0" max="10" step="1" placeholder="patt" style="' + INP + ';width:42px"></label>'
            + '<label title="the piano&#39;s pitches at this onset moved by whole octaves before the keyboard folds them; the two-hand guard runs after, unchanged">piano 8va <input id="skSndPno8va" type="number" min="-4" max="4" step="1" style="' + INP + ';width:38px"></label>'
            + '<label title="this onset&#39;s hands — blank = the pattern&#39;s setting &middot; one = this chord in one hand, clear of the last &middot; two = both hands">hand <select id="skSndPnoHandAt" style="' + INP + '"><option value="">patt</option><option value="one">one</option><option value="two">two</option></select></label></div>'
            + '<div style="display:flex;gap:4px;flex-wrap:wrap;border-top:1px solid #3a3a44;padding-top:5px">'
            + '<button id="skSndAll" style="' + BTN + '" title="this harmony on every onset of the pattern">all onsets &larr; this harmony</button>'
            + '<select id="skSndBank" style="' + INP + '" title="every onset gets the next row of a banner, in turn"></select><button id="skSndAllBank" style="' + BTN + '">all onsets &larr; banner in turn</button>'
            + '<button id="skSndClear" style="' + BTN + '" title="every onset back to a single note">clear all</button></div>'
            + '<div style="color:#666">click a row in the left column to choose the harmony for this onset &middot; ESC closes</div></div>';
        document.body.appendChild(box);
        ['mousedown', 'click', 'dblclick', 'mouseup', 'wheel'].forEach(t => box.addEventListener(t, x => x.stopPropagation()));
        this._sndCard = { key, pos: o.pos, el: box };
        const q = id => box.querySelector(id);
        q('#skSndX').addEventListener('click', () => this.closeSoundCard());
        q('#skSndNote').addEventListener('click', () => { this.snapshot(); this.setSoundAt(key, null); });
        q('#skSndChord').addEventListener('click', () => { const cur = this.snd()[key]; if (!cur) this.setStatus('click a row in the left column — that harmony becomes this onset\'s chord'); });
        q('#skSndSel').value = this.sndSelection();
        q('#skSndSel').addEventListener('change', e => { this.cfg.sndSelection = e.target.value; if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.paintSoundCard(); });
        q('#skSndAll').addEventListener('click', () => { const cur = this.snd()[key]; if (cur && cur.harm) this.allOnsetsHarm(cur.harm); else this.setStatus('choose a harmony for this onset first', true); });
        const groups = this.harmGroups ? (this.harmGroups() || []) : [];
        q('#skSndBank').innerHTML = '<option value="strikes">strikes</option>' + groups.map(g => '<option value="' + esc(g.key) + '">' + esc(g.title.split(' · ')[0].toLowerCase()) + '</option>').join('');
        q('#skSndAllBank').addEventListener('click', () => this.allOnsetsBannerInTurn(q('#skSndBank').value));
        q('#skSndClear').addEventListener('click', () => this.clearSounds());
        // §377: this onset's own settings live on its sound; they need a chord there first
        const onThis = (fn, msg) => { const cur = this.snd()[key]; if (!cur) { this.setStatus('choose a harmony for this onset first — click a row in the left column', true); this.paintSoundCard(); return; } this.snapshot(); fn(cur); if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.paintSoundCard(); if (msg) this.setStatus('onset ' + (this._sndCard ? this._sndCard.pos + 1 : '') + ': ' + msg(cur)); };
        q('#skSndMax').addEventListener('change', e => onThis(cur => { const v = Math.round(+e.target.value); if (v > 0) cur.max = v; else delete cur.max; }, cur => cur.max ? 'at most ' + cur.max + ' players' : 'as many players as are free'));
        q('#skSndDealBy').addEventListener('change', e => onThis(cur => { if (e.target.value === 'random') cur.deal = 'random'; else delete cur.deal; }, cur => 'dealt ' + (cur.deal === 'random' ? 'at random' : 'by register')));
        q('#skSndRe').addEventListener('click', () => onThis(cur => { cur.seed = (+cur.seed || 0) + 1; }, cur => 'draw ' + (cur.seed + 1)));
        q('#skSndHear').addEventListener('click', () => this.hearSndOnset(key));
        q('#skSndRest').addEventListener('change', e => { this.snapshot(); this.cfg.aMin = Math.max(0, Math.min(5000, +e.target.value || 0)); if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.setStatus('rest ' + this.cfg.aMin + ' ms — the chords re-dealt, and the run\'s re-attack ≥ moved with it'); });
        q('#skSndMaxAll').addEventListener('change', e => { const v = Math.round(+e.target.value); this.snapshot(); this.cfg.sndMax = v > 0 ? v : ''; if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.setStatus(v > 0 ? 'every onset: at most ' + v + ' players (an onset\'s own max wins) · ' + this.sndReadout() : 'every onset: as many players as are free'); });
        const pno = (field, val) => { this.snapshot(); this.cfg[field] = val; if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.setStatus('piano: ' + this.pnoSummary()); };
        q('#skSndPno').addEventListener('change', e => pno('pnoShare', e.target.value));
        q('#skSndPnoN').addEventListener('change', e => pno('pnoN', Math.max(1, Math.round(+e.target.value || 1))));
        q('#skSndReach').addEventListener('change', e => pno('pnoReach', Math.max(1, Math.round(+e.target.value || 14))));
        q('#skSndHand').addEventListener('change', e => pno('pnoPerHand', Math.max(1, Math.min(5, Math.round(+e.target.value || 5)))));
        q('#skSndPnoMs').addEventListener('change', e => pno('pnoMs', Math.max(0, +e.target.value || 0)));
        q('#skSndHands').addEventListener('change', e => pno('pnoHands', e.target.value === 'one' ? 'one' : 'two'));   // CN-67
        // §405: these two ride on the ONSET's sound (so a take carries them), not on the pattern — hence onThis, which wants a chord first
        q('#skSndPnoAt').addEventListener('change', e => onThis(cur => { const v = e.target.value; if (v === '' || v == null || !isFinite(+v)) delete cur.pno; else cur.pno = Math.max(0, Math.min(10, Math.round(+v))); },
            cur => 'piano ' + (cur.pno == null ? 'as the pattern says (' + this.pnoSummary() + ')' : cur.pno === 0 ? 'off at this onset' : 'a target of ' + cur.pno + ' notes here')));
        q('#skSndPno8va').addEventListener('change', e => onThis(cur => { const v = Math.max(-4, Math.min(4, Math.round(+e.target.value || 0))); if (v) cur.pno8va = v; else delete cur.pno8va; },
            cur => 'piano ' + (cur.pno8va ? (cur.pno8va > 0 ? '+' : '') + cur.pno8va + ' octave' + (Math.abs(cur.pno8va) > 1 ? 's' : '') + ' here' : 'at pitch')));
        q('#skSndPnoHandAt').addEventListener('change', e => onThis(cur => { const v = e.target.value; if (v === 'one' || v === 'two') cur.pnoHand = v; else delete cur.pnoHand; },
            cur => 'piano ' + (cur.pnoHand ? (cur.pnoHand === 'one' ? 'in one hand here, clear of the last chord' : 'in two hands here') : 'hands as the pattern says')));   // CN-67
        this._sndKey = k => { if (this._sndCard && k.key === 'Escape') { k.preventDefault(); k.stopPropagation(); this.closeSoundCard(); } };
        document.addEventListener('keydown', this._sndKey, true);
        // drag by the head
        const head = q('#skSndDrag'); let drag = null;
        head.addEventListener('mousedown', e => { drag = { dx: e.clientX - box.offsetLeft, dy: e.clientY - box.offsetTop }; e.preventDefault(); });
        const mv = e => { if (!drag) return; box.style.left = (e.clientX - drag.dx) + 'px'; box.style.top = (e.clientY - drag.dy) + 'px'; };
        const up = () => { drag = null; };
        // §348 THE CARD STUCK TO THE MOUSE: line ~182 stops `mouseup` from propagating off the box, and a drag by the head
        // ALWAYS ends with the cursor over the box — so this listener never fired, `drag` was never cleared, and the card
        // followed the mouse for ever. CAPTURE runs before the target, so stopPropagation cannot eat it.
        document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up, true);
        this._sndCard.off = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up, true); };
        this.paintSoundCard();
    },
    closeSoundCard() {
        const c = this._sndCard; if (!c) return;
        if (c.off) c.off(); if (c.el) c.el.remove();
        if (this._sndKey) { document.removeEventListener('keydown', this._sndKey, true); this._sndKey = null; }
        this._sndCard = null;
        this.paintSoundMarks();
    },
    paintSoundCard() {
        const c = this._sndCard; if (!c || !c.el) return;
        const o = this.onsetByKey(c.key); const q = id => c.el.querySelector(id);
        if (!o) { this.closeSoundCard(); return; }
        c.pos = o.pos;
        q('#skSndN').textContent = (o.pos + 1) + ' of ' + this.onsetList().length;
        q('#skSndT').textContent = (o.onMs / 1000).toFixed(3) + ' s';
        const cur = this.snd()[c.key];
        q('#skSndNote').style.cssText = cur ? BTN : LIT; q('#skSndChord').style.cssText = cur ? LIT : BTN;
        q('#skSndHarm').textContent = cur && cur.harm ? cur.harm.name + ' · ' + cur.harm.pitches.length + ' notes · ' + cur.harm.pitches.map(nm).join(' ') : 'a single note (as always) — click a row in the left column for a chord';
        const rep = (this._sndReport || []).find(r => r.key === c.key);
        q('#skSndDeal').textContent = rep ? ('dealt: ' + rep.taken + ' of ' + rep.wanted + (rep.free < rep.wanted ? ' (' + rep.free + ' players free here)' : '') + (rep.folds ? ' · ' + rep.folds + ' folded' : '') + ' · piano ' + rep.pno + (rep.pnoWhy ? ' (' + rep.pnoWhy + ')' : '') + ' — ' + rep.notes.map(n => (TRK()[n.lane] || {}).short + ':' + nm(n.midi)).join('  ')) : '';
        // §377: the boxes show what is in force (a focused box is left alone so a typed value is not overwritten mid-entry)
        const setv = (id, v) => { const el = q(id); if (el && document.activeElement !== el) el.value = v; };
        setv('#skSndMaxAll', +this.cfg.sndMax > 0 ? this.cfg.sndMax : ''); q('#skSndMax').placeholder = +this.cfg.sndMax > 0 ? String(this.cfg.sndMax) : 'all';
        setv('#skSndMax', cur && cur.max ? cur.max : ''); setv('#skSndDealBy', cur && cur.deal === 'random' ? 'random' : 'register'); setv('#skSndRest', this.sndRest());
        setv('#skSndPnoAt', cur && cur.pno != null ? cur.pno : ''); setv('#skSndPno8va', cur && cur.pno8va ? cur.pno8va : 0);
        const P = this.pnoCfg(); setv('#skSndPno', P.share); setv('#skSndPnoN', P.n); setv('#skSndReach', P.reach); setv('#skSndHand', P.perHand); setv('#skSndPnoMs', P.ms);
        q('#skSndPnoN').disabled = P.share !== 'n';
        setv('#skSndHands', P.hands); setv('#skSndPnoHandAt', cur && cur.pnoHand ? cur.pnoHand : '');
        q('#skSndRe').textContent = cur && cur.seed ? 'reshuffle (' + (cur.seed + 1) + ')' : 'reshuffle';
        this.paintSoundMarks();
    },
    // the chord's notes on the strip: hollow dots in a column at the onset, the onset with the card ringed
    paintSoundMarks() {
        const svg = this.el && this.el.querySelector('#skRhy'); if (!svg || !this.strike) return;
        svg.querySelectorAll('.skSndMark').forEach(x => x.remove());
        if (this.isChords && this.isChords()) return;
        const map = this.snd(); const keys = Object.keys(map).filter(k => map[k] && map[k].kind === 'chord');
        try { this.notesFor('orch'); } catch (e) { }   // refreshes _sndReport — before the guard, so PLAN 1t's plain piano paints too
        const rep = this._sndReport || [];
        if (!keys.length && !this._sndCard && !rep.length) return;
        const h = this.rh(), R = this.range(), r = Math.max(2.5, h * 0.42);
        const dotX = key => {
            if (key[0] === 'a') { const dots = svg.querySelectorAll('.skADot'); const d = dots[+key.slice(1)]; return d ? +d.getAttribute('cx') : null; }
            const d = svg.querySelector('.skRDot[data-i="' + key.slice(1) + '"]'); return d ? +d.getAttribute('cx') : null;
        };
        let s = '';
        (this._sndReport || rep).forEach(rp => {
            const x = dotX(rp.key); if (x == null) return;
            const pl = this.pianoLane();   // 2026-09-12, his ask: the piano's notes told apart — solid blue rings; the ensemble's stay dashed gold
            rp.notes.forEach(n => { if (n.midi < R.lo || n.midi > R.hi) return; const cy = this.keyY(n.midi) + h / 2; const isP = n.lane === pl; s += '<circle class="skSndMark" cx="' + x + '" cy="' + cy + '" r="' + (r + 1) + '" fill="none" stroke="' + (isP ? '#8fc8ff' : '#e8cf9a') + '" stroke-width="1.5"' + (isP ? '' : ' stroke-dasharray="2 2"') + '><title>' + esc((TRK()[n.lane] || {}).label + ' ' + nm(n.midi)) + '</title></circle>'; });
            s += '<text class="skSndMark" x="' + (x + 4) + '" y="' + (H_(svg) - 4) + '" font-size="9" fill="#e8cf9a">' + esc(String(rp.taken) + (rp.pno ? '+' + rp.pno : '')) + '</text>';
        });
        if (this._sndCard) { const x = dotX(this._sndCard.key); if (x != null) s += '<line class="skSndMark" x1="' + x + '" y1="0" x2="' + x + '" y2="' + H_(svg) + '" stroke="#e8cf9a" stroke-width="1" stroke-dasharray="3 3" opacity="0.8"/>'; }
        svg.insertAdjacentHTML('beforeend', s);
    },
});
function H_(svg) { return +svg.getAttribute('height') || 0; }

// ---------------------------------------------------------------- the hooks
// 1 · the plain notes gain the chords (under swell_ui's own hook, so a chord's notes become swells when the switch is on)
const _plain = D._notesForPlain || D.notesFor;
const plainHook = function (mode) {
    let notes = _plain.apply(this, arguments);
    if (this.applySounds) notes = this.applySounds(notes, mode);
    if (this.applyPlainPiano) notes = this.applyPlainPiano(notes, mode);   // PLAN 1t step 5: the piano row's count on the plain strike
    return notes;
};
if (D._notesForPlain) D._notesForPlain = plainHook; else D.notesFor = plainHook;
// 1b · §377: ♪ on the card — while `_onlyAt` is set, notesFor answers with that onset alone, moved to time 0 (Hear's own path plays it)
const _nfOuter = D.notesFor;
D.notesFor = function (mode) {
    const out = _nfOuter.apply(this, arguments); if (this._onlyAt == null) return out;
    const t = this._onlyAt; return out.filter(n => Math.abs(n.onMs - t) < 1.5).map(n => Object.assign({}, n, { onMs: 0 }));
};
// 2 · the rhythm strip: the gesture (double-click / ALT-click an onset dot) and the marks
const _renderRhythm = D.renderRhythm;
D.renderRhythm = function () {
    const r = _renderRhythm.apply(this, arguments);
    try {
        const svg = this.el && this.el.querySelector('#skRhy');
        if (svg) {
            svg.querySelectorAll('.skRDot').forEach(dd => {
                dd.addEventListener('dblclick', ev => { ev.stopPropagation(); ev.preventDefault(); this.openSoundCard('v' + dd.dataset.i, ev); });
                dd.addEventListener('click', ev => { if (ev.altKey) { ev.stopPropagation(); this.openSoundCard('v' + dd.dataset.i, ev); } }, true);
            });
            svg.querySelectorAll('.skADot').forEach((dd, pos) => {
                dd.style.cursor = 'pointer';
                dd.addEventListener('dblclick', ev => { ev.stopPropagation(); ev.preventDefault(); this.openSoundCard('a' + pos, ev); });
                dd.addEventListener('click', ev => { if (ev.altKey) { ev.stopPropagation(); this.openSoundCard('a' + pos, ev); } }, true);
            });
            svg.title = (svg.title || '');
        }
        this.paintSoundMarks(); this.paintSoundCard(); this.paintPnoRow();
    } catch (e) { console.warn('[strike_sounds] strip hooks:', e); }
    return r;
};
// 3 · a row clicked while the card is open chooses the harmony for that onset instead of changing the strike in play
const _select = D.select;
D.select = function (id) {
    if (this._sndCard && this.assignSoundHarm && this.strike && id !== this.strike.id) { if (this.assignSoundHarm(id)) return; }
    return _select.apply(this, arguments);
};
// 4 · a new strike in play, or a mode change, closes the card (the onsets are another pattern's)
const _selectSeq = D.selectSeq;
D.selectSeq = function () { this.closeSoundCard(); return _selectSeq.apply(this, arguments); };
if (D.setMode) { const _setMode = D.setMode; D.setMode = function () { this.closeSoundCard(); return _setMode.apply(this, arguments); }; }

}(typeof self !== 'undefined' ? self : this));
