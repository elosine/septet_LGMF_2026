// vibes_pitch.js — PLAN 1u (LGMF, 2026-09-26): THE VIBRAPHONES' PITCHES ON THE STRIP. His brief, COMPOSITION_NOTES LG-114: *"let them
// play other notes as well. We'll keep the same breathing or bowing, but they'll just switch their pitches"* — and *"make sure I can get
// back, in case I don't like it."* The talk: RUNNING_LOG §388; the item: §389 · PLAN § `1u`.
//
// The two bowed vibraphones in a placed sequence or morph hold ONE note each the whole way. Each breath is its own object in the score,
// so a change of pitch at a breath is a change of that note's pitch — ON THE NOTES, `1q`'s way: the harmony strip, `back`, CTRL+Z.
//
//   1u.1 THE POOL — for every selected vibraphone breath: its TAKE (resolved from the note: `hq.take` · the sequence's recipe · the
//        placed morph's actual · the `performanceNotes` fragment), the take's harmonic SERIES (`HarmonySel.pool`, as the shuffle reads
//        it), inside the vibraphone's RANGE for the note's own technique, under its TOLERANCE (`StrikeDrawer.mayTake`: ±5 ¢, a player who
//        cannot bend), the two SEATS as the lane's two chains by overlap, and what the OTHER players hold at the breath's start — then
//        one of three rules: `neighbours` (the partial one above and one below each partial the others hold) · `within a tone` (every
//        member inside a whole tone of another player's pitch) · `any` (the whole series in range).
//   1u.2 THE DRAW — the breaths of both seats walked in time: a seat holds its note until a change; the anchors (the first breath of
//        each seat, the first of a new take) as dealt; `change` the chance of a new pitch at a breath; `random` · `exhaust` · `walk` ·
//        `shadow` on one seeded stream; the other seat kept clear over the whole breath. The write through the strip's own `remember` ·
//        `writeNote` · `stamp` (+ `hq.seat`), one undo — so `back` and CTRL+Z are the way back.
//   1u.3 THE ROW — `vibes ▾` on the strip (shown when vibraphone notes are selected) opens a second line: pool · change · draw · seed ·
//        the tolerance shown · go; the status on the strip; the dials remembered in the browser.
//
// The CORE below is pure and loads in node (`tools/vibes_pitch_check.js`); the browser part is a mixin on `HarmonySel`, as
// `texture_cols.js` is on the strikes drawer. No engine file is touched: `morph.js` · `sequence.js` never see this.
(function (root) {
'use strict';

const TONE = 200;   // cents — `within a tone`
const NEAR = 20;    // cents — an unstamped player's partial: the series' nearest within this [the AI's call, PLAN 1u]
const EPS = 0.01;   // seconds — a breath that starts this close after its chain's last end still follows it
const startOf = o => (o.startSeconds != null ? +o.startSeconds : (o.startTime != null ? +o.startTime : 0));
const endOf = o => (o.endSeconds != null ? +o.endSeconds : (o.endTime != null ? +o.endTime : startOf(o)));

// ================================================================ THE CORE — pure; nothing here reads the page
const Core = {
    TONE, NEAR, EPS, startOf, endOf,
    RULES: ['neighbours', 'tone', 'any'],
    RULE_NAMES: { neighbours: 'neighbours', tone: 'within a tone', any: 'any' },

    // ------------------------------------------------------------ the take of a breath
    // the fragment the sequence's Insert writes (sequence_ui.js insert): `NAME · box N · TAKE · partial n · ±c¢ just · waves lo…hi`
    parseFragment(text) {
        const segs = String(text || '').split(' · ');
        const k = segs.findIndex(s => /^box \d+$/.test(s));
        if (k < 0) return { box: null, take: null };
        const nx = segs[k + 1];
        const take = (nx && !/^partial \d+$/.test(nx) && !/¢ just$/.test(nx) && !/^waves /.test(nx) && !/^← take /.test(nx)) ? nx : null;
        return { box: +segs[k].slice(4), take };
    },
    sequenceOf(o, sequences) {
        if (!o || !o.groupId || !/^grp-seq-/.test(o.groupId)) return null;
        return (sequences || []).find(e => e && e.recipe && (e.group === o.groupId || ('grp-seq-' + e.id) === o.groupId)) || null;
    },
    placedAt(entry, objects, meta) {   // the sequence drawer's own rule (`placedAt`): its META bar's start, else the recipe's t0
        let bar = null;
        (objects || []).forEach(o => { if (o.groupId !== entry.group && o.groupId !== 'grp-seq-' + entry.id) return; if (o.layer === meta && o.sonifyNote == null && isFinite(+o.startSeconds) && (bar == null || +o.startSeconds < bar)) bar = +o.startSeconds; });
        return bar != null ? bar : (+entry.recipe.t0 || 0);
    },
    boxAt(entry, t0, t) {   // the box a moment falls in, by the recipe's durations from where the sequence sits
        const C = entry.recipe.containers || []; let a = t0;
        for (let k = 0; k < C.length; k++) { const b = a + (+C[k].dur || 0); if (t < b - 1e-9) return k; a = b; }
        return C.length - 1;
    },
    actualOf(o, objects) {   // a placed actual: its group's marker reads `ENTITY — label` (morph_panel.js insertActual)
        if (!o || !o.groupId) return null;
        const mk = (objects || []).find(x => x && x.type === 'marker' && x.groupId === o.groupId && typeof x.label === 'string');
        const m = mk && mk.label.match(/^([A-Z0-9][A-Z0-9-]*) — /);
        return m ? m[1] : null;
    },
    // in the plan's order: a 1q write (`hq.take`, or its `← take "…"` fragment) · the sequence's recipe (the note's box) · a placed
    // morph's actual (`provenance.pitch.takeName`; `toName` after a TAKE → TAKE switch) · the fragment's take · none
    takeOf(o, ctx) {
        const i = ctx.info ? ctx.info(o) : null;
        if (i && i.take) return { take: i.take, how: 'hq' };
        const fr = this.parseFragment(o.performanceNotes);
        const e = this.sequenceOf(o, ctx.sequences);
        if (e) {
            const k = fr.box != null ? fr.box - 1 : this.boxAt(e, this.placedAt(e, ctx.objects, ctx.meta), startOf(o));
            const box = (e.recipe.containers || [])[k];
            if (box && box.take) return { take: box.take, how: 'sequence', seq: e.name || e.id, box: k + 1 };
        }
        const ent = this.actualOf(o, ctx.objects);
        if (ent) {
            const a = ctx.actuals && ctx.actuals[ent], p = a && a.provenance && a.provenance.pitch;
            if (p && p.takeName) return { take: p.takeName, to: p.toName || null, how: 'actual', entity: ent };
        }
        if (fr.take) return { take: fr.take, how: 'fragment' };
        return null;
    },

    // ------------------------------------------------------------ pitch
    bendAt(bp, dt) {   // composer.html `morphBendAt`: note-relative cents, linear between breakpoints
        if (!Array.isArray(bp) || !bp.length) return 0;
        if (dt <= bp[0][0]) return +bp[0][1] || 0;
        for (let i = 1; i < bp.length; i++) if (dt <= bp[i][0]) { const a = bp[i - 1], b = bp[i]; return a[1] + ((dt - a[0]) / Math.max(1e-6, b[0] - a[0])) * (b[1] - a[1]); }
        return +bp[bp.length - 1][1] || 0;
    },
    pitchAt(o, t) {   // a sounding pitch in MIDI units with its cents: the key plus the bend at t; a trill its written pitch
        if (o.type === 'zone') return (o.trill && o.trill.pitch != null) ? +o.trill.pitch : null;
        if (o.sonifyNote == null) return null;
        return +o.sonifyNote + this.bendAt(o.morphBend, t - startOf(o)) / 100;
    },
    partialNear(voices, p, tol) {   // the series' partial nearest a pitch, within `tol` cents — else null
        let best = null, d = Infinity;
        (voices || []).forEach(v => { if (v.partial == null) return; const x = Math.abs((+v.pitch + (+v.cents || 0) / 100) - p) * 100; if (x < d) { d = x; best = v.partial; } });
        return d <= (tol != null ? tol : NEAR) ? best : null;
    },

    // ------------------------------------------------------------ the two seats — the lane's two chains by overlap
    // A score object carries no seat (RUNNING_LOG §389). Sorted by start, each breath follows a chain that has ended: the one `hq.seat`
    // names (a 1u write), else the one whose last note was this pitch (a seat holds its note through a box), else the one that ended
    // last; a third voice sounding over both is put on the chain that ends first and counted.
    seatChains(notes) {
        const L = notes.slice().sort((a, b) => startOf(a) - startOf(b) || endOf(a) - endOf(b));
        const chains = [], seat = new Map(); let crowded = 0;
        L.forEach(o => {
            const s = startOf(o), q = o.hq || {}, stamped = (q.seat === 0 || q.seat === 2) ? q.seat : null;
            const free = chains.filter(c => c.end <= s + EPS);
            let c = null;
            if (stamped != null) {
                c = free.find(x => x.seat === stamped) || null;
                if (!c && !chains.some(x => x.seat === stamped)) { c = { seat: stamped, end: -Infinity, midi: null }; chains.push(c); }
            }
            if (!c && free.length) c = free.find(x => x.midi === +o.sonifyNote) || free.slice().sort((a, b) => b.end - a.end)[0];
            if (!c && chains.length < 2) { c = { seat: chains.some(x => x.seat === 0) ? 2 : 0, end: -Infinity, midi: null }; chains.push(c); }
            if (!c) { c = chains.slice().sort((a, b) => a.end - b.end)[0]; crowded++; }
            c.end = Math.max(c.end, endOf(o)); c.midi = +o.sonifyNote; seat.set(o, c.seat);
        });
        return { seat, crowded };
    },

    // ------------------------------------------------------------ the pool
    members(voices, lo, hi, may) {   // the series inside the range and under the tolerance, one per key (the vibraphone plays the key)
        const by = new Map();
        (voices || []).forEach(v => {
            const m = Math.round(+v.pitch); if (!isFinite(m) || m < lo || m > hi) return;
            if (may && !may(v)) return;
            const k = by.get(m), part = v.partial != null ? v.partial : null;
            if (!k || (part != null && (k.partial == null || part < k.partial))) by.set(m, { midi: m, partial: part, cents: +v.cents || 0 });
        });
        return Array.from(by.values()).sort((a, b) => a.midi - b.midi);
    },
    // what the OTHER players hold at t — every pitched object on another player's lane sounding at t: its pitch there, and its partial
    // of THIS take (the note's own when it came from this take, else the series' nearest within NEAR cents, else none)
    othersAt(t, objects, o) {
        const out = [];
        (objects || []).forEach(x => {
            if (!x || !o.lanes.has(x.layer) || !o.isPitched(x)) return;
            if (!(startOf(x) <= t + 1e-9 && endOf(x) > t + 1e-9)) return;
            const p = this.pitchAt(x, t); if (p == null) return;
            let partial = null;
            const tk = o.takeOf ? o.takeOf(x) : null, i = o.info ? o.info(x) : null;
            if (tk && tk.take === o.take && i && i.partial != null) partial = i.partial;
            if (partial == null) partial = this.partialNear(o.voices, p, NEAR);
            out.push({ lane: x.layer, pitch: p, partial });
        });
        return out;
    },
    poolAt(rule, mem, others) {
        if (rule === 'any') return mem.slice();
        if (rule === 'neighbours') {
            const want = new Set(); others.forEach(x => { if (x.partial != null) { want.add(x.partial - 1); want.add(x.partial + 1); } });
            return mem.filter(m => m.partial != null && want.has(m.partial));
        }
        if (rule === 'tone') return mem.filter(m => others.some(x => x.pitch != null && Math.abs(m.midi - x.pitch) * 100 <= TONE + 1e-6));
        return [];
    },
    without(pool, keys) { const k = new Set((keys || []).filter(x => x != null).map(Number)); return pool.filter(m => !k.has(m.midi)); },

    // ------------------------------------------------------------ the breaths of a selection, each with its take, seat and pool
    // ctx: { rule, takeOf(o), voicesOf(take), rangeOf(o), may(v), objects, otherLanes: Set, isPitched(o), info(o) }
    plan(notes, ctx) {
        const { seat, crowded } = this.seatChains(notes);
        const L = notes.slice().sort((a, b) => startOf(a) - startOf(b) || seat.get(a) - seat.get(b));
        const first = {}, switched = {}, breaths = [], noTake = [];
        L.forEach(o => {
            const s = seat.get(o), tk = ctx.takeOf(o);
            if (!tk || !tk.take) { noTake.push(o); return; }
            let take = tk.take;
            if (tk.to) {   // a TAKE → TAKE actual: the seat plays "from" until its note first changes (the switch, one re-strike — PLAN 1t.3), "to" after
                const key = s + '|' + (tk.entity || ''), orig = (o.hq && o.hq.was && o.hq.was.sonifyNote != null) ? +o.hq.was.sonifyNote : +o.sonifyNote;
                if (first[key] == null) first[key] = orig; else if (orig !== first[key]) switched[key] = true;
                if (switched[key]) take = tk.to;
            }
            breaths.push({ o, seat: s, start: startOf(o), end: endOf(o), midi: +o.sonifyNote, take, how: tk.how });
        });
        breaths.forEach(b => {
            const voices = ctx.voicesOf(b.take) || [], r = ctx.rangeOf(b.o);
            b.members = this.members(voices, r[0], r[1], ctx.may);
            b.others = this.othersAt(b.start, ctx.objects, { lanes: ctx.otherLanes, isPitched: ctx.isPitched, takeOf: ctx.takeOf, take: b.take, voices, info: ctx.info });
            b.pool = this.poolAt(ctx.rule, b.members, b.others);
        });
        return { breaths, noTake, crowded };
    },

    // ------------------------------------------------------------ 1u.2 THE DRAW — the breaths walked in time, both seats together
    // A seat HOLDS its pitch from breath to breath until a change (the AI's reading of "change never … always": the chance of a new pitch
    // at a breath; `never` holds the first note throughout). THE ANCHORS are left as they stand: the first selected breath of each seat,
    // and a breath whose take is not its seat's previous breath's (a box of another take, a TAKE → TAKE switch) — the take's own deal
    // [call]. At every other breath one draw of the seeded stream against the chance; on a change the pool of that moment minus the
    // seat's own pitch minus what the OTHER SEAT holds over the breath (its notes overlapping it: a drawn one as drawn, an anchor as it
    // stands — a later one that is not an anchor keeps clear of this one when its turn comes). A breath that holds a pitch the other seat
    // now sounds is made to change (`forced`). An empty pool = no change (`empty`).
    //   random   a uniform draw
    //   exhaust  a cycle per seat: none of the pool again until all of it has sounded (a member the other seat holds is skipped, kept)
    //   walk     the pool by pitch, one step up or down from where the seat is, the direction by the stream, a bounce at the ends, a step
    //            over the other seat's pitch
    //   shadow   the member nearest in cents to another player's pitch at that moment, ties by the stream
    CHANGE: { never: 0, rarely: 0.2, half: 0.5, often: 0.8, always: 1 },
    DRAWS: ['random', 'exhaust', 'walk', 'shadow'],
    mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
    draw(breaths, opts) {
        const p = Math.max(0, Math.min(1, +opts.change || 0)), mode = opts.draw || 'random';
        const rnd = this.mulberry32(Math.round(+opts.seed || 0) * 7919 + 17);
        const B = breaths.slice().sort((a, b) => a.start - b.start || a.seat - b.seat);
        const prev = {}, anchor = new Set();
        B.forEach(b => { const q = prev[b.seat]; if (!q || q.take !== b.take) anchor.add(b); prev[b.seat] = b; });
        const res = new Map(), cur = {}, used = {};
        let changed = 0, forced = 0, empty = 0, clash = 0;
        const overlap = (a, b) => a.start < b.end - 1e-9 && b.start < a.end - 1e-9;
        const otherHeld = b => B.filter(x => x.seat !== b.seat && overlap(x, b) && (res.has(x) || anchor.has(x))).map(x => res.has(x) ? res.get(x).midi : x.midi);
        const pick = (b, want, r) => {
            const held = otherHeld(b), from = cur[b.seat];
            const cands = this.without(b.pool, held.concat([from]));
            if (!cands.length) return null;
            if (mode === 'exhaust') {
                const u = used[b.seat] || (used[b.seat] = new Set());
                let c2 = cands.filter(m => !u.has(m.midi)); if (!c2.length) { u.clear(); if (from != null) u.add(from); c2 = cands; }
                const m = c2[Math.floor(r * c2.length)]; u.add(m.midi); return m;
            }
            if (mode === 'walk') {
                const S = b.pool, heldS = new Set(held), dir0 = r < 0.5 ? 1 : -1;
                const stepFrom = dir => {
                    let i = S.findIndex(m => m.midi === from), j;
                    if (i >= 0) j = i + dir; else { j = -1; if (dir > 0) j = S.findIndex(m => m.midi > from); else for (let k = S.length - 1; k >= 0; k--) if (S[k].midi < from) { j = k; break; } }
                    while (j >= 0 && j < S.length && heldS.has(S[j].midi)) j += dir;
                    return (j >= 0 && j < S.length && S[j].midi !== from) ? S[j] : null;
                };
                return stepFrom(dir0) || stepFrom(-dir0);
            }
            if (mode === 'shadow') {
                if (!b.others.length) return cands[Math.floor(r * cands.length)];
                const d = m => Math.min.apply(null, b.others.map(o => Math.abs(m.midi - o.pitch) * 100));
                const lo = Math.min.apply(null, cands.map(d)), ties = cands.filter(m => d(m) <= lo + 0.5);
                return ties[Math.floor(r * ties.length)];
            }
            return cands[Math.floor(r * cands.length)];
        };
        B.forEach(b => {
            if (anchor.has(b)) {
                const m = b.pool.find(x => x.midi === b.midi) || b.members.find(x => x.midi === b.midi) || null;
                res.set(b, { midi: b.midi, partial: m ? m.partial : null, anchor: true }); cur[b.seat] = b.midi;
                if (used[b.seat]) used[b.seat].clear(); (used[b.seat] = used[b.seat] || new Set()).add(b.midi);
                return;
            }
            const u = rnd(), r = rnd();   // two draws per breath, always: the stream stays in step whatever each breath decides
            let want = u < p, f = false;
            if (!want && otherHeld(b).includes(cur[b.seat])) { want = true; f = true; }
            if (want) {
                const m = pick(b, true, r);
                if (m) { res.set(b, { midi: m.midi, partial: m.partial, changed: true, forced: f }); cur[b.seat] = m.midi; changed++; if (f) forced++; return; }
                empty++; if (f) clash++;
            }
            const held = b.members.find(x => x.midi === cur[b.seat]) || b.pool.find(x => x.midi === cur[b.seat]) || null;
            res.set(b, { midi: cur[b.seat], partial: held ? held.partial : null, held: true });
        });
        return { res, anchors: anchor.size, changed, forced, empty, clash, breaths: B };
    },
};

if (typeof module === 'object' && module.exports) { module.exports = Core; return; }
root.VibesPitch = Core;

// ================================================================ THE STRIP'S SIDE — a mixin on HarmonySel
const H = root.HarmonySel;
if (!H) { console.warn('[vibes_pitch] the harmony strip is not loaded'); return; }
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const D_ = () => root.StrikeDrawer || null;
const META = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : 8);
const TR = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const VIB_KEY = 'bowed_vibraphone', PERC_KEY = 'percussion';
const BTN = 'font:inherit;padding:1px 7px;border:1px solid #b9b4a6;border-radius:3px;background:#fbfaf6;color:#333;cursor:pointer';   // the strip's own
const SEL = 'font:inherit;padding:0 2px;border:1px solid #b9b4a6;border-radius:3px;background:#fff;color:#333';
const NNU = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const pnU = m => NNU[((Math.round(+m) % 12) + 12) % 12] + (Math.floor(Math.round(+m) / 12) - 1);
const LS = 'lgmf.vibesPitch.v1', PREF0 = { open: false, pool: 'any', change: 'always', draw: 'exhaust' };
const loadPrefs = () => { try { const p = JSON.parse(localStorage.getItem(LS) || '{}') || {}; const o = Object.assign({}, PREF0, p);
    if (!Core.RULES.includes(o.pool)) o.pool = PREF0.pool; if (Core.CHANGE[o.change] == null) o.change = PREF0.change; if (!Core.DRAWS.includes(o.draw)) o.draw = PREF0.draw; return o; } catch (e) { return Object.assign({}, PREF0); } };
const savePrefs = p => { try { localStorage.setItem(LS, JSON.stringify(p)); } catch (e) {} };

Object.assign(H, {
    vibRow: null, vibPrefs: null, vibSeed: 0, vibSeeds: [],   // 1u.3: the row, its dials, the seed in force and the last five
    vibLane() { return TR().findIndex(t => t && t.instKey === VIB_KEY && t.seatOf == null); },
    vibOthers() { const T = TR(), v = this.vibLane(), s = new Set(); T.forEach((t, i) => { if (t && t.seatOf == null && i !== v && t.instKey !== PERC_KEY && i < META()) s.add(i); }); return s; },
    vibNotes() { const L = this.vibLane(); return L < 0 ? [] : this.pitched().filter(o => this.isNote(o) && o.layer === L); },
    // the actuals the selected breaths were placed from, each read once from the store (the morph's own route)
    async vibActuals(notes) {
        const C = C_(), out = this._vibActuals = this._vibActuals || {};
        const ents = Array.from(new Set(notes.map(o => Core.actualOf(o, C.objects)).filter(Boolean)));
        for (const e of ents) {
            if (out[e]) continue;
            try { const r = await fetch('/api/actuals/' + encodeURIComponent(e), { cache: 'no-store' }); if (r.ok) out[e] = await r.json(); } catch (err) { console.warn('[vibes_pitch] actual ' + e + ':', err); }
        }
        return out;
    },
    // 1u.1: the selected breaths, each with its take, seat and pool under `rule` — { breaths, noTake, crowded, takes, missing }
    async vibPlan(rule) {
        const C = C_(), D = D_(); if (!C || !D) return null;
        const notes = this.vibNotes(); if (!notes.length) return { breaths: [], noTake: [], crowded: 0, takes: {}, missing: [] };
        const actuals = await this.vibActuals(notes);
        const tctx = { info: o => this.info(o), sequences: (C.databases && C.databases.sequences) || [], objects: C.objects, meta: META(), actuals };
        const takeOf = o => Core.takeOf(o, tctx);
        const names = new Set();
        notes.forEach(o => { const t = takeOf(o); if (t && t.take) { names.add(t.take); if (t.to) names.add(t.to); } });
        const takes = {}, missing = [];
        for (const name of names) {   // each take loaded once, as the shuffle loads it
            let p = null; try { p = await this.pool(name); } catch (e) { p = null; }
            if (p && p.voices.length) takes[name] = p.voices; else missing.push(name);
        }
        const L = this.vibLane();
        const P = Core.plan(notes, {
            rule, takeOf, voicesOf: name => takes[name] || null, rangeOf: o => this.rangeOf(D, L, o),
            may: v => (D.mayTake ? D.mayTake(v, L) : Math.abs(+v.cents || 0) <= 5),
            objects: C.objects, otherLanes: this.vibOthers(), isPitched: o => this.isNote(o) || this.isTrill(o), info: o => this.info(o),
        });
        P.takes = takes; P.missing = missing;
        return P;
    },
    // 1u.2: the draw written onto the notes — the strip's own path (`remember` · `writeNote` · `stamp`), so `back`, CTRL+Z and the note
    // card work as they do for a take. The tempered key, cents 0: a channel bent before is brought back to centre by writeNote's rule.
    // opts { pool, change ('never' … 'always'), draw, seed } → { P, R, written } (null when nothing could be done; the status says why)
    async vibGo(opts) {
        const C = C_(); if (!C) return null;
        const P = await this.vibPlan(opts.pool);
        if (!P) { this.say('vibes: the strikes drawer is not on the page', true); return null; }
        if (!P.breaths.length) { this.say(P.noTake.length ? 'vibes: no take on these notes — pick one with take ▾' : 'vibes: no vibraphone notes selected', true); this.refresh(); return null; }
        const R = Core.draw(P.breaths, { change: Core.CHANGE[opts.change] != null ? Core.CHANGE[opts.change] : +opts.change, draw: opts.draw, seed: opts.seed });
        C.pushUndoState();
        let written = 0;
        R.breaths.forEach(b => {
            const r = R.res.get(b), o = b.o; if (!r || r.midi === +o.sonifyNote) return;
            const before = this.info(o) || {};
            this.remember(o);
            const q = o.hq; if (!q.dealt) q.dealt = { midi: q.was && q.was.sonifyNote != null ? +q.was.sonifyNote : +o.sonifyNote, partial: before.partial != null ? before.partial : null };   // the take's own deal: what `shuffle` means by another
            const n = { midi: r.midi, cents: 0, partial: r.partial };
            this.writeNote(o, n, b.take);
            this.stamp(o, b.take, n, Math.round(+opts.seed || 0));
            o.hq.seat = b.seat;
            this.rerender(o); written++;
        });
        if (typeof C.curveDirty === 'function') C.curveDirty();   // a morph note's bend re-centred changes nothing of its route, but the map is cheap to drop (§75)
        C.markDirty();
        this._vibLast = { P, R, written, opts };
        return { P, R, written };
    },

    // ------------------------------------------------------------ 1u.3 THE ROW — `vibes ▾` on the strip opens a second line under it
    // pool · change · draw · seed (ENTER = go; the last five as chips) · the tolerance shown · go. The dials remembered in the browser.
    // A fixed line placed under the strip (its own DOM, so the strip's first line is untouched but for the one toggle before its status).
    vibEnsure() {
        const el = this.ensure(); if (this.vibRow) return this.vibRow;
        this.vibPrefs = loadPrefs();
        const tg = document.createElement('button'); tg.type = 'button'; tg.id = 'hqVibes'; tg.style.cssText = BTN; tg.textContent = 'vibes ▾';
        tg.title = 'PLAN 1u: the two vibraphones change pitch at their breaths — the bowing untouched — from their take\'s own harmonic series. Opens a line of dials under the strip; back and CTRL+Z undo it';
        tg.addEventListener('click', () => { this.vibPrefs.open = !this.vibPrefs.open; savePrefs(this.vibPrefs); this.vibRefresh(); });
        el.insertBefore(tg, el.querySelector('#hqStatus'));
        const row = document.createElement('div'); row.id = 'hqVibRow';
        row.style.cssText = 'position:fixed;z-index:60;display:none;align-items:center;gap:8px;padding:3px 8px;border:1px solid #cfcabc;border-radius:4px;' +
            'background:rgba(247,245,239,0.96);color:#333;font:11px/1.5 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.15);user-select:none;white-space:nowrap';
        const sel = (id, list, names, tip) => '<select id="' + id + '" style="' + SEL + '" title="' + tip + '">' + list.map(k => '<option value="' + k + '">' + (names ? names[k] : k) + '</option>').join('') + '</select>';
        row.innerHTML = '<span style="color:#6a6a60">vibes ·</span><span id="hvTake" style="color:#555"></span>' +
            '<label style="color:#6a6a60">pool ' + sel('hvPool', Core.RULES, Core.RULE_NAMES, 'which partials of the take may come: neighbours = one above or one below a partial another player holds at that breath · within a tone = within 200 ¢ of another player\'s pitch · any = the whole series in the vibraphone\'s range — never the pitch the other vibraphone holds') + '</label>' +
            '<label style="color:#6a6a60">change ' + sel('hvChange', Object.keys(Core.CHANGE), null, 'the chance of a new pitch at each breath — never · rarely (1 in 5) · half · often (4 in 5) · always. Between changes a vibraphone holds its note; the first breath of each (and the first of a new take) stays as the take dealt it') + '</label>' +
            '<label style="color:#6a6a60">draw ' + sel('hvDraw', Core.DRAWS, null, 'how the new pitch is chosen — random · exhaust (none again until all have sounded) · walk (one step up or down the pool) · shadow (the pitch nearest another player\'s)') + '</label>' +
            '<label style="color:#6a6a60">seed <input id="hvSeed" type="number" min="1" step="1" style="width:52px;' + SEL + '" title="the seed of the next go — ENTER goes"></label>' +
            '<span id="hvSeeds" style="display:inline-flex;gap:3px" title="the last five seeds — a chip goes again with that seed: the same result on the same notes"></span>' +
            '<span id="hvTol" style="color:#6a6a60"></span>' +
            '<button type="button" id="hvGo" style="' + BTN + ';font-weight:600" title="walk the selected vibraphone breaths in time and change their pitches by the dials — one undo">go</button>';
        ['mousedown', 'mouseup', 'click', 'dblclick', 'wheel', 'keydown'].forEach(ev => row.addEventListener(ev, e => e.stopPropagation()));
        ['hvPool', 'hvChange', 'hvDraw'].forEach((id, i) => row.querySelector('#' + id).addEventListener('change', e => { this.vibPrefs[['pool', 'change', 'draw'][i]] = e.target.value; savePrefs(this.vibPrefs); }));
        row.querySelector('#hvSeed').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.vibGoNext(); } });
        row.querySelector('#hvGo').addEventListener('click', () => { this.vibGoNext(); });
        document.body.appendChild(row); this.vibRow = row;
        return row;
    },
    vibRefresh() {
        const el = this.el; if (!el) return;
        const row = this.vibEnsure(), tg = el.querySelector('#hqVibes');
        const vn = el.style.display !== 'none' ? this.vibNotes() : [];
        tg.style.display = vn.length ? '' : 'none';
        tg.textContent = 'vibes ' + (this.vibPrefs.open ? '▴' : '▾');
        if (!vn.length || !this.vibPrefs.open) { row.style.display = 'none'; return; }
        const t = this.vibTakeText(vn), tk = row.querySelector('#hvTake'); tk.textContent = t.text; tk.title = t.title; tk.style.color = t.one || t.n ? '#555' : '#a33';
        [['hvPool', 'pool'], ['hvChange', 'change'], ['hvDraw', 'draw']].forEach(([id, k]) => { const s = row.querySelector('#' + id); if (document.activeElement !== s) s.value = this.vibPrefs[k]; });
        const sb = row.querySelector('#hvSeed'); if (document.activeElement !== sb) sb.value = this.vibSeed || '';
        const D = D_(), tol = D && D.specTol ? D.specTol() : 5, tl = row.querySelector('#hvTol');
        tl.textContent = '±' + tol + '¢'; tl.title = 'the tolerance: a vibraphone takes only the partials within ±' + tol + ' ¢ of a key (the strikes drawer\'s rule for a player who cannot bend) — shown, not a dial';
        const sc = row.querySelector('#hvSeeds'); sc.innerHTML = '';
        this.vibSeeds.slice(0, 5).forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.className = 'hvSeedChip';
            b.title = 'seed ' + s + ' again — the same result on the same notes'; b.style.cssText = BTN + ';padding:0 4px' + (s === this.vibSeed ? ';background:#e8dcc0;font-weight:600' : ''); b.addEventListener('click', () => { this.vibGoSeed(s); }); sc.appendChild(b); });
        row.style.display = 'flex'; this.vibPlace();
    },
    vibPlace() {
        const row = this.vibRow; if (!row || !this.el) return;
        const r = this.el.getBoundingClientRect();
        row.style.top = Math.round(r.bottom + 3) + 'px'; row.style.right = this.el.style.right || '8px';
    },
    vibTakeText(vn) {   // the take(s) the selected breaths come from — an actual not yet read is fetched once, then the line repaints
        const C = C_(), acts = this._vibActuals || {}, tried = this._vibTried = this._vibTried || new Set();
        const tctx = { info: o => this.info(o), sequences: (C.databases && C.databases.sequences) || [], objects: C.objects, meta: META(), actuals: acts };
        const names = []; let none = 0, fetch = false;
        vn.forEach(o => { const t = Core.takeOf(o, tctx); if (t && t.take) { [t.take, t.to].forEach(n => { if (n && !names.includes(n)) names.push(n); }); return; }
            none++; const e = Core.actualOf(o, C.objects); if (e && !acts[e] && !tried.has(e)) { tried.add(e); fetch = true; } });
        if (fetch) this.vibActuals(vn).then(() => { try { this.vibRefresh(); } catch (e) {} });
        const n = names.length, one = n === 1 ? names[0] : '';
        const text = n ? ((one ? 'take "' + one + '"' : n + ' takes') + (none ? ' on ' + (vn.length - none) + ' of ' + vn.length : '')) : 'no take on these notes — pick one with take ▾';
        return { text, title: names.join('\n'), one, n };
    },
    vibGoNext() {   // the box's seed when he typed another, else the next after the seed in force (the shuffle's idiom)
        const sb = this.vibRow && this.vibRow.querySelector('#hvSeed'), typed = sb ? Math.round(+sb.value) : 0;
        return this.vibGoSeed((typed > 0 && typed !== this.vibSeed) ? typed : (this.vibSeed || 0) + 1);
    },
    async vibGoSeed(seed) {
        if (this._vibBusy) return null; this._vibBusy = true;
        const pr = this.vibPrefs || loadPrefs();
        let out = null;
        try {
            this.say('vibes: reading the takes …', false);
            out = await this.vibGo({ pool: pr.pool, change: pr.change, draw: pr.draw, seed });
            if (out) { this.vibSeed = seed; this.vibSeeds = [seed].concat(this.vibSeeds.filter(s => s !== seed)).slice(0, 5); this.say(this.vibStatus(out, pr, seed), false); }
        } catch (e) { console.warn('[vibes_pitch] go:', e); this.say('vibes: ' + (e && e.message || e), true); }
        finally { this._vibBusy = false; this.refresh(); }
        return out;
    },
    vibStatus(out, pr, seed) {   // `vibes · take "…" · pool neighbours (4) · change half · draw exhaust · seed 17 → 12 of 19 breaths changed · seat 1: B5 → C6 → B5 … · …`
        const { P, R, written } = out;
        const names = []; R.breaths.forEach(b => { if (!names.includes(b.take)) names.push(b.take); });
        const post = R.breaths.filter(b => !R.res.get(b).anchor).map(b => b.pool.length);
        const lo = post.length ? Math.min.apply(null, post) : 0, hi = post.length ? Math.max.apply(null, post) : 0;
        const parts = ['vibes · ' + (names.length === 1 ? 'take "' + names[0] + '"' : names.length + ' takes'), 'pool ' + Core.RULE_NAMES[pr.pool] + ' (' + (lo === hi ? lo : lo + '…' + hi) + ')',
            'change ' + pr.change, 'draw ' + pr.draw, 'seed ' + seed + ' → ' + R.changed + ' of ' + R.breaths.length + ' breaths changed'];
        [0, 2].forEach(s => {
            const q = []; R.breaths.filter(b => b.seat === s).forEach(b => { const m = R.res.get(b).midi; if (q[q.length - 1] !== m) q.push(m); });
            if (q.length) parts.push('seat ' + (s ? 2 : 1) + ': ' + q.slice(0, 6).map(pnU).join(' → ') + (q.length > 6 ? ' …' : ''));
        });
        if (R.empty) parts.push(R.empty + (R.empty === 1 ? ' empty pool' : ' empty pools'));
        if (R.forced) parts.push(R.forced + ' made to change off the other seat\'s note');
        if (R.clash) parts.push(R.clash + ' still on the other seat\'s note — nothing else in the pool');
        if (P.crowded) parts.push(P.crowded + ' crowded (a third voice on the lane)');
        if (P.noTake.length) parts.push(P.noTake.length + ' without a take, left as they are');
        if (P.missing.length) parts.push('not loaded: ' + P.missing.join(', '));
        if (!written) parts.push('nothing to write — every breath already holds it');
        return parts.join(' · ');
    },
});

// the strip's refresh and place carry the row with them
const _refresh = H.refresh;
H.refresh = function () { const r = _refresh.apply(this, arguments); try { this.vibRefresh(); } catch (e) { console.warn('[vibes_pitch] refresh:', e); } return r; };
const _place = H.place;
H.place = function () { const r = _place.apply(this, arguments); try { if (this.vibRow && this.vibRow.style.display !== 'none') this.vibPlace(); } catch (e) {} return r; };
}(typeof self !== 'undefined' ? self : this));
