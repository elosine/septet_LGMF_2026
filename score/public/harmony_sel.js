// harmony_sel.js — PLAN 1q (LGMF, 2026-09-24): A TAKE'S HARMONY ONTO A SELECTION of the composer score · the marquee · the stack.
// His brief, COMPOSITION_NOTES LG-103: *"select a range of bricks … have a takes menu just like in the sequences drawer and then be
// able to assign that take harmony to that group of notes. But I also like to keep a back to original."* The talk: RUNNING_LOG §306 … §311.
//
//   1q.1 THE HARMONY STRIP — a small fixed strip at the top right of the score, shown whenever the selection holds a PITCHED object on
//        a player lane: a note (a waveCurve with `sonifyNote`, `layer < META_LAYER`) or a trill zone. `take ▾` opens the SEQUENCE
//        DRAWER'S takes menu (SEQUENCE_TOOL §22 — the ▸ hears a take without choosing it, the name chooses, a filter) through its new
//        optional `opts` argument; the chosen take is dealt by `SequenceDrawer.dealTake` (the strikes drawer loads it, as a box does)
//        and written onto the selection: a note on lane L takes the chord's pitch for L (`sonifyNote`), its cents as `morphBend` and
//        the note DRAWN (1c.3 · 1c.4 — a bent note leaves MAIN), a trill takes it on `trill.pitch` with its interval kept (cents
//        dropped, his "a", §307); length · dynamic · articulation · velAbs · cc7Abs untouched. Before the FIRST write an object
//        remembers its original ON ITSELF (`hq.was`, saved with the score, never overwritten by a later take — his A, §307) and
//        `back` restores it. The property panel is on demand only (P), which is why the strip exists (§311).
//   1q.2 · 1q.3 arrive in their own commits (the marquee on CTRL+drag; the stack).
//   1q.5 · 1q.6 · 1q.7 (2026-09-24, his `1q.4` test — RUNNING_LOG §316, LG-104): the strip NAMES the take a selection came from,
//        read from the note (`hq.take` · `midi` · `cents` · `partial`, or the `performanceNotes` fragment of a note written before —
//        one parser, `info`), the menu's blue name the selection's own; the note card's line (note_card.js reads `info`); and a
//        SHUFFLE — his pool b: each selected note dealt ANOTHER partial of ITS take's harmonic series (the take loaded into the strikes
//        drawer as `dealTake` loads it, `D.voices` the series with cents and partials), in the player's range for the note's own
//        technique, folded when the take's `mayFold` says so, a fixed-pitch player within its tolerance (`D.mayTake`), one seeded stream
//        (the drawer's `mulberry32`), a seed box and the last five seeds as chips. `back` restores the original as before.
//
// A mixin: it wraps `Composer.selectObject` and `Composer.deselectAll` to repaint the strip; composer.html carries its script tag alone.
(function (root) {
'use strict';

const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const D_ = () => root.StrikeDrawer || null;
const S_ = () => root.SequenceDrawer || null;
const META = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : 8);
const TR = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const RECENTRE = 1e-6;   // cents — the sequence's rule (sequence_ui.js): a channel bent before is brought back to centre by a bend that rounds to 0
const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const pn = m => (m == null || !isFinite(+m)) ? '?' : NN[((Math.round(+m) % 12) + 12) % 12] + (Math.floor(Math.round(+m) / 12) - 1);
const centsTxt = c => { const r = Math.round(+c || 0); return r ? ((r > 0 ? '+' : '−') + Math.abs(r) + '¢') : ''; };
const shortOf = L => { const t = TR()[L]; return t ? (t.short || t.label || t.id) : ('lane ' + L); };
const startOf = o => (o.startSeconds != null ? +o.startSeconds : (o.startTime != null ? +o.startTime : 0));
const endOf = o => (o.endSeconds != null ? +o.endSeconds : (o.endTime != null ? +o.endTime : startOf(o)));
const BTN = 'font:inherit;padding:1px 7px;border:1px solid #b9b4a6;border-radius:3px;background:#fbfaf6;color:#333;cursor:pointer';
// 1q.7 — the strikes drawer's own two helpers, copied (strike_drawer.js: `foldInto` · `mulberry32`), so the strip's shuffle draws as the drawer's does
function foldInto(pitch, lo, hi) { let p = pitch, n = 0; while (p < lo && n < 8) { p += 12; n++; } while (p > hi && n > -8) { p -= 12; n--; } return (p >= lo && p <= hi) ? { pitch: p, oct: n } : null; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const H = {
    el: null, status: '', bad: false, lastTake: '',
    seed: 0, seeds: [],   // 1q.7: the seed in force and the last five, newest first

    // ---------------------------------------------------------------- what the strip serves
    isNote(o) {   // the composer's own `isGrain`: a pitched waveCurve on a player lane IS a note (composer.html ~2508); a cue line is an empty one
        const C = C_();
        return !!(o && o.type === 'waveCurve' && o.sonifyNote != null && o.layer < META() && !(C && C.isCueLine && C.isCueLine(o)));
    },
    isTrill(o) { return !!(o && o.type === 'zone' && o.midiModel === 'trill' && o.trill && o.layer < META()); },
    pitched() {   // only objects still IN the score: an undo replaces them and the selection can hold the old ones
        const C = C_(), live = (C && C.objects) || [];
        return ((C && C.selectedObjects) || []).filter(o => (this.isNote(o) || this.isTrill(o)) && live.includes(o));
    },
    rerender(o) { const C = C_(); if (!C) return; try { if (o.type === 'waveCurve') C.renderWaveCurve(o); else C.renderZone(o); } catch (e) { console.warn('[harmony_sel] render:', e); } },

    // ---------------------------------------------------------------- the strip
    ensure() {
        if (this.el) return this.el;
        const el = document.createElement('div'); el.id = 'hqStrip';
        el.style.cssText = 'position:fixed;z-index:60;display:none;align-items:center;gap:8px;padding:3px 8px;border:1px solid #cfcabc;border-radius:4px;' +
            'background:rgba(247,245,239,0.96);color:#333;font:11px/1.5 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.15);user-select:none;white-space:nowrap;max-width:min(70vw,900px)';
        el.title = 'PLAN 1q: the selected notes take their pitches from a harmony take — each its own player\'s; length, dynamic and articulation stay. back = the pitches before the first take.';
        el.innerHTML = '<span style="color:#6a6a60">harmony ·</span><span id="hqCount"></span>' +
            '<button type="button" id="hqTake" style="' + BTN + '" title="the takes menu of the sequence drawer: ▸ hears a take without choosing it, the name re-pitches the selection">take ▾</button>' +
            '<button type="button" id="hqBack" style="' + BTN + '" title="back to the pitches these notes had before their first take">back</button>' +
            '<button type="button" id="hqShuffle" style="' + BTN + '" title="1q.7: each selected note dealt ANOTHER partial of its own take\'s harmonic series, in its player\'s range, with its cents — the strikes drawer\'s shuffle; the next seed, or the one typed">shuffle</button>' +
            '<label style="color:#6a6a60">seed <input id="hqSeed" type="number" min="1" step="1" style="width:52px;font:inherit;padding:0 3px;border:1px solid #b9b4a6;border-radius:3px;background:#fff;color:#333" title="the seed of the next shuffle — ENTER shuffles"></label>' +
            '<span id="hqSeeds" style="display:inline-flex;gap:3px" title="the last five seeds — a chip deals that seed again, the same result on the same selection"></span>' +
            '<span id="hqStatus" style="color:#555;overflow:hidden;text-overflow:ellipsis;min-width:0"></span>';
        ['mousedown', 'mouseup', 'click', 'dblclick', 'wheel', 'keydown'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));   // the score's own handlers stay out of the strip
        el.querySelector('#hqTake').addEventListener('click', e => { this.openMenu(e.currentTarget); });
        el.querySelector('#hqBack').addEventListener('click', () => { this.back(); });
        el.querySelector('#hqShuffle').addEventListener('click', () => { this.shuffleNext(); });
        el.querySelector('#hqSeed').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.shuffleNext(); } });
        document.body.appendChild(el); this.el = el;
        window.addEventListener('resize', () => { try { this.place(); } catch (e) {} });
        return el;
    },
    place() {   // the top right of the score — BELOW the top bar's lowest control: a wrapped bar line hangs over the lanes, at the right end
        const lc = document.getElementById('laneContainer'); if (!lc || !this.el) return;
        const r = lc.getBoundingClientRect(), bar = document.getElementById('topBar');
        const barBottom = bar ? Math.max(0, ...Array.from(bar.children).map(c => { const b = c.getBoundingClientRect(); return b.height ? b.bottom : 0; })) : 0;
        this.el.style.top = Math.max(0, r.top, barBottom) + 6 + 'px';
        this.el.style.right = Math.max(8, window.innerWidth - r.right + 8) + 'px';
    },
    say(msg, bad) {
        this.status = msg || ''; this.bad = !!bad;
        const C = C_(); if (C && C.saveStatus) C.saveStatus.textContent = msg || '';
        if (this.el) { const s = this.el.querySelector('#hqStatus'); s.textContent = this.status; s.style.color = bad ? '#a33' : '#555'; }
    },
    refresh() {
        const el = this.ensure();
        const P = this.pitched();
        if (!P.length) { el.style.display = 'none'; return; }
        const notes = P.filter(o => this.isNote(o)).length, trills = P.length - notes, lanes = new Set(P.map(o => o.layer)).size;
        const withOrig = P.filter(o => o.hq && o.hq.was).length;
        const place = this.stackPlace();   // 1q.3: the place in a stack, beside the counts
        const tk = this.takeText(P);       // 1q.5: the take these notes came from, read from the notes
        const cnt = el.querySelector('#hqCount');
        cnt.textContent = [notes ? notes + (notes === 1 ? ' note' : ' notes') : '', trills ? trills + (trills === 1 ? ' trill' : ' trills') : '',
            lanes + (lanes === 1 ? ' player' : ' players'), tk.text, place].filter(Boolean).join(' · ');
        cnt.title = tk.title;
        const sb = el.querySelector('#hqSeed'); if (document.activeElement !== sb) sb.value = this.seed || '';
        const sc = el.querySelector('#hqSeeds'); sc.innerHTML = '';
        this.seeds.slice(0, 5).forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.className = 'hqSeedChip';
            b.title = 'seed ' + s + ' again — the same result on the same selection'; b.style.cssText = BTN + ';padding:0 4px' + (s === this.seed ? ';background:#e8dcc0;font-weight:600' : ''); b.addEventListener('click', () => { this.shuffle(s); }); sc.appendChild(b); });
        const b = el.querySelector('#hqBack'); b.textContent = 'back' + (withOrig ? ' (' + withOrig + ')' : ''); b.disabled = !withOrig; b.style.opacity = withOrig ? '1' : '.45';
        const s = el.querySelector('#hqStatus'); s.textContent = this.status; s.style.color = this.bad ? '#a33' : '#555';
        el.style.display = 'flex'; this.place();
    },

    // ---------------------------------------------------------------- the takes menu — the sequence drawer's, through its `opts`
    async openMenu(anchor) {
        const S = S_(), D = D_();
        if (!S || typeof S.openTakeMenu !== 'function') { this.say('the sequence drawer is not on the page — no takes menu', true); return; }
        if (!this.pitched().length) return;
        if (S._takeMenu) { S.closeTakeMenu(); return; }
        try { if (D && D.refreshTakes && !Object.keys(D.takeList || {}).length) await D.refreshTakes(); } catch (e) {}
        S.openTakeMenu(-1, anchor, { current: this.takeText(this.pitched()).one, onChoose: name => { this.apply(name); } });   // 1q.5: the blue name is what THESE notes came from, or none
    },

    // ---------------------------------------------------------------- 1q.5 what a take left on a note — read from the object, one parser
    info(o) {   // { take, midi, cents, partial, seed } — `hq` first (1q.5+), else the `performanceNotes` fragment (§312: ` · ← take "NAME" · partial n · +c¢ just`; a drawer's own insert carries the last two in the same words)
        if (!o) return null;
        const q = o.hq || {}, t = String(o.performanceNotes || '');
        const mT = t.match(/← take "([^"]*)"/), mP = t.match(/ · partial (\d+)/), mC = t.match(/ · ([+−-]?\d+)¢ just/);
        const take = q.take != null ? q.take : (mT ? mT[1] : null);
        const partial = q.partial != null ? q.partial : (mP ? +mP[1] : null);
        const cents = q.cents != null ? q.cents : (mC ? +mC[1].replace('−', '-') : null);
        if (take == null && partial == null && cents == null) return null;
        return { take, midi: q.midi != null ? q.midi : null, cents, partial, seed: q.seed != null ? q.seed : null };
    },
    stamp(o, name, n, seed) {   // what was written, on the object beside `was` — the strip and the card read it back
        const q = o.hq = o.hq || {}; q.take = name; q.midi = Math.round(+n.midi); q.cents = +(+n.cents || 0).toFixed(2);
        if (n.partial != null) q.partial = n.partial; else delete q.partial;
        if (seed != null) q.seed = seed; else { delete q.seed; q.dealt = { midi: q.midi, partial: q.partial != null ? q.partial : null }; }   // a take's own deal, kept through every shuffle: what 'another' means, and what makes a seed reproducible
    },
    takeText(P) {   // the strip's words for where the selection came from: `take "X"` · `2 takes` (the names in the title) · `on 3 of 5` when not all
        const names = []; let k = 0;
        P.forEach(o => { const i = this.info(o); if (i && i.take) { k++; if (!names.includes(i.take)) names.push(i.take); } });
        if (!k) return { text: '', title: '', one: '' };
        const one = names.length === 1 ? names[0] : '';
        return { text: (one ? 'take "' + one + '"' : names.length + ' takes') + (k < P.length ? ' on ' + k + ' of ' + P.length : ''), title: names.join('\n'), one };
    },
    rangeOf(D, L, o) {   // 1q.7: the note's OWN technique's range when the instrument has it, else the lane's default — the drawer's `fits`
        const inst = D && D.instOf ? D.instOf(L) : null; if (!inst) return [0, 127];
        const techs = inst.techniques || [], dk = D.defaultTech ? D.defaultTech(L) : null;
        const tech = techs.find(t => t.key === o.technique) || techs.find(t => t.key === dk) || null;
        return [(tech && tech.rangeLow != null) ? tech.rangeLow : (inst.rangeLow != null ? inst.rangeLow : 0), (tech && tech.rangeHigh != null) ? tech.rangeHigh : (inst.rangeHigh != null ? inst.rangeHigh : 127)];
    },
    async pool(name) {   // 1q.7: the take's HARMONY — loaded into the strikes drawer exactly as `dealTake` loads it; `D.voices` = every partial of the series with its cents and partial number (spectrum_ui.js §2)
        const D = D_(); if (!D) return null;
        if (!D.db && D.loadDb) await D.loadDb(false);
        if (!D.takeList || !D.takeList[name]) await D.refreshTakes();
        const t = D.takeList && D.takeList[name]; if (!t) return null;
        await D.loadTake(name);
        const want = t.state && t.state.strikeId;
        if (!D.strike || (want && D.strike.id !== want)) return null;
        const voices = (D.voices || []).map(v => ({ pitch: Math.round(+v.pitch), cents: +v.cents || 0, partial: v.partial != null ? v.partial : null })).filter(v => isFinite(v.pitch));
        return { voices, mayFold: !!(D.cfg && D.cfg.mayFold) };
    },

    // ---------------------------------------------------------------- the take onto the selection
    remember(o) {   // the original, ONCE — a later take never overwrites it (his A, §307)
        if (o.hq && o.hq.was) return;
        o.hq = { was: this.isTrill(o) ? { trillPitch: o.trill.pitch } : {
            sonifyNote: o.sonifyNote,
            morphBend: o.morphBend ? JSON.parse(JSON.stringify(o.morphBend)) : null,
            sonifyMode: o.sonifyMode != null ? o.sonifyMode : null,
            velAbs: o.velAbs != null ? o.velAbs : null, cc7Abs: o.cc7Abs ? JSON.parse(JSON.stringify(o.cc7Abs)) : null,   // §318: a struck note's pin, restored by back
            performanceNotes: o.performanceNotes != null ? o.performanceNotes : null } };
    },
    writeNote(o, n, name) {
        const wasStruck = o.sonifyMode === 'plain';   // §318: a captured note — the velocity IS its dynamic (DYNAMICS_LAW §3)
        o.sonifyNote = Math.round(+n.midi);
        const dur = Math.max(0.001, endOf(o) - startOf(o)), c = +(+n.cents || 0).toFixed(2);
        if (c) { o.morphBend = [[0, c], [dur, c]]; delete o.sonifyMode; }                     // a bent note is DRAWN — its own curve channel (1c.3 · 1c.4)
        else if (o.morphBend) { o.morphBend = [[0, RECENTRE], [dur, RECENTRE]]; }               // bent before, straight now: the channel brought back to centre
        if (n.seat) delete o.sonifyMode;                                                        // a seat's note (the vibraphone's second) is DRAWN too, as every drawer writes it
        // §318 (his ear: 'it seems louder'): un-plained for a bend or a seat, a STRUCK note would be struck from the drawn anchor scale
        // (65 … 127 by its tile's height, composer.html 1453 · 9748) instead of its own recVel — a note played at 45 lifted to ≈ 87 — with
        // the fader dropped from 127 to the ladder's. So it keeps its sound: velAbs = its recVel, cc7Abs pinned full, on a curve channel
        // with its bend (1n.1's B2 shape). A note that already carries its own velAbs · cc7Abs (a sequence's, a texture's) is left alone.
        if (wasStruck && o.sonifyMode == null && o.velAbs == null && o.cc7Abs == null) { o.velAbs = o.recVel != null ? Math.round(+o.recVel) : 100; o.cc7Abs = { lo: 127, hi: 127 }; }
        let t = String(o.performanceNotes || '').replace(/ · ← take "[^"]*"/g, '').replace(/ · [+−-]?\d+¢ just/g, '').replace(/ · partial \d+/g, '');
        t += ' · ← take "' + name + '"' + (n.partial != null ? ' · partial ' + n.partial : '') + (c ? ' · ' + (c > 0 ? '+' : '') + Math.round(c) + '¢ just' : '');
        o.performanceNotes = t.replace(/^ · /, '');
    },
    async apply(name) {
        const C = C_(), S = S_(); if (!C || !S) return;
        const P = this.pitched(); if (!P.length) { this.say('nothing pitched is selected', true); return; }
        let chord = null;
        try { chord = await S.dealTake(name); } catch (e) { this.say('take not read: ' + (e && e.message || e), true); this.refresh(); return; }
        if (!chord || !chord.length) { this.say('"' + name + '" dealt no notes — open the strikes drawer and look', true); this.refresh(); return; }
        const byLane = {};
        chord.forEach(n => { const L = +n.lane; if (!isFinite(L)) return; (byLane[L] = byLane[L] || []).push(n); });
        Object.keys(byLane).forEach(L => byLane[L].sort((a, b) => (a.seat || 0) - (b.seat || 0)));   // the vibraphone: seat 0 then seat 2
        C.pushUndoState();
        const next = {}, left = new Set(), touched = new Set(), pitches = [];
        let notes = 0, trills = 0, trillCents = 0;
        P.slice().sort((a, b) => startOf(a) - startOf(b) || (a.yOffset || 0) - (b.yOffset || 0)).forEach(o => {   // time order: the round robin over a player's two seats
            const L = o.layer, cand = byLane[L];
            if (!cand || !cand.length) { left.add(L); return; }
            const k = next[L] || 0, n = cand[k % cand.length]; next[L] = k + 1;
            this.remember(o);
            if (this.isTrill(o)) { o.trill.pitch = Math.round(+n.midi); if (n.cents) trillCents++; try { C.regenerateTrill(o); } catch (e) {} trills++; }
            else { this.writeNote(o, n, name); notes++; }
            this.stamp(o, name, n, null);   // 1q.5
            touched.add(L); pitches.push(shortOf(L) + ' ' + pn(n.midi) + centsTxt(n.cents));
            this.rerender(o);
        });
        if (typeof C.curveDirty === 'function') C.curveDirty();   // a note that gained or lost a bend changed its route (§75)
        C.markDirty();
        this.lastTake = name;
        const skipped = ((C.selectedObjects || []).length - P.length);
        const parts = ['take "' + name + '" → ' + notes + (notes === 1 ? ' note' : ' notes') + (trills ? ' · ' + trills + (trills === 1 ? ' trill' : ' trills') + (trillCents ? ' (no cents on a trill)' : '') : '') + ' on ' + touched.size + (touched.size === 1 ? ' player' : ' players')];
        if (left.size) parts.push(Array.from(left).map(shortOf).join(', ') + ' left as ' + (left.size === 1 ? 'is' : 'they are') + ' (not in the take)');
        if (skipped > 0) parts.push(skipped + ' unpitched skipped');
        const uniq = Array.from(new Set(pitches)); if (uniq.length) parts.push(uniq.join(' · '));
        this.say(parts.join(' · '), false);
        this.refresh();
    },
    // ---------------------------------------------------------------- 1q.7 THE SHUFFLE — his pool b: another partial of the note's OWN take's series
    shuffleNext() {   // the box's seed when he typed one, else the next after the seed in force
        const sb = this.el && this.el.querySelector('#hqSeed'); const typed = sb ? Math.round(+sb.value) : 0;
        this.shuffle((typed > 0 && typed !== this.seed) ? typed : (this.seed || 0) + 1);
    },
    async shuffle(seed) {
        const C = C_(), D = D_(); if (!C || !D) { this.say('the strikes drawer is not on the page — no shuffle', true); return; }
        const P = this.pitched(); if (!P.length) { this.say('nothing pitched is selected', true); return; }
        const withTake = [], noTake = [];
        P.forEach(o => { const i = this.info(o); if (i && i.take) withTake.push({ o, take: i.take, partial: i.partial }); else noTake.push(o); });
        if (!withTake.length) { this.say('shuffle: none of the selected notes came from a take — choose a take first', true); return; }
        const pools = {};
        for (const name of Array.from(new Set(withTake.map(w => w.take)))) {   // each take loaded once
            let p = null; try { p = await this.pool(name); } catch (e) { this.say('shuffle: take "' + name + '" not read: ' + (e && e.message || e), true); return; }
            if (!p || !p.voices.length) { this.say('shuffle: take "' + name + '" could not be loaded in the strikes drawer — its harmony was not found', true); return; }
            pools[name] = p;
        }
        C.pushUndoState();
        const rnd = mulberry32(seed * 104729 + 3), given = {}, pitches = [], touched = new Set();
        let notes = 0, trills = 0, trillCents = 0, stuck = 0, folded = 0;
        withTake.sort((a, b) => startOf(a.o) - startOf(b.o) || (a.o.yOffset || 0) - (b.o.yOffset || 0)).forEach(w => {
            const o = w.o, L = o.layer, pool = pools[w.take], fixed = !!(D.fixedPitch && D.fixedPitch(L)), [lo, hi] = this.rangeOf(D, L, o);
            let cands = [];
            pool.voices.forEach(v => {
                if (D.mayTake && !D.mayTake(v, L)) return;                                                     // a fixed-pitch player: within the tolerance only
                const f = pool.mayFold ? foldInto(v.pitch, lo, hi) : ((v.pitch >= lo && v.pitch <= hi) ? { pitch: v.pitch, oct: 0 } : null);
                if (f) cands.push({ midi: f.pitch, oct: f.oct, cents: fixed ? 0 : v.cents, partial: v.partial });   // its cents dropped on a fixed-pitch player, as notesFor drops them
            });
            if (!cands.length) { stuck++; return; }
            const key = c => (c.partial != null ? 'p' + c.partial : 'm' + c.midi);
            if (!o.hq) o.hq = {}; if (!o.hq.dealt) o.hq.dealt = { midi: o.hq.midi != null ? o.hq.midi : (this.isTrill(o) ? o.trill.pitch : o.sonifyNote), partial: w.partial != null ? w.partial : null };   // a note written before 1q.5: its take's deal is what it holds now
            const dl = o.hq.dealt;
            let c2 = cands.filter(c => (c.partial != null && dl.partial != null) ? c.partial !== dl.partial : c.midi !== dl.midi); if (c2.length) cands = c2;   // ANOTHER note than the take's own — a stable rule, so the same seed on the same selection deals the same
            const g = given[L] || (given[L] = new Set());
            c2 = cands.filter(c => !g.has(key(c))); if (c2.length) cands = c2;                                     // apart from this player's other notes of this shuffle
            const n = cands[Math.floor(rnd() * cands.length)]; g.add(key(n));
            this.remember(o);
            if (this.isTrill(o)) { o.trill.pitch = n.midi; if (n.cents) trillCents++; try { C.regenerateTrill(o); } catch (e) {} trills++; }
            else { this.writeNote(o, n, w.take); notes++; }
            this.stamp(o, w.take, n, seed); if (n.oct) folded++;
            touched.add(L); pitches.push(shortOf(L) + ' ' + pn(n.midi) + centsTxt(n.cents) + (n.partial != null ? ' (' + n.partial + ')' : ''));
            this.rerender(o);
        });
        if (typeof C.curveDirty === 'function') C.curveDirty();
        C.markDirty();
        this.seed = seed; this.seeds = [seed].concat(this.seeds.filter(s => s !== seed)).slice(0, 5);
        const parts = ['shuffle ' + seed + ' → ' + notes + (notes === 1 ? ' note' : ' notes') + (trills ? ' · ' + trills + (trills === 1 ? ' trill' : ' trills') + (trillCents ? ' (no cents on a trill)' : '') : '') + ' on ' + touched.size + (touched.size === 1 ? ' player' : ' players')];
        if (folded) parts.push(folded + ' folded by octave');
        if (stuck) parts.push(stuck + ' with no partial in range, left as ' + (stuck === 1 ? 'is' : 'they are'));
        if (noTake.length) parts.push(noTake.length + ' without a take skipped — choose a take first');
        const uniq = Array.from(new Set(pitches)); if (uniq.length) parts.push(uniq.join(' · '));
        this.say(parts.join(' · '), false);
        this.refresh();
    },

    // ---------------------------------------------------------------- 1q.2 THE MARQUEE — CTRL+drag on empty lane space (his "a", §308)
    // A fixed rectangle follows the mouse; on mouseup every object on a PLAYER lane whose drawn box TOUCHES it is selected, as SHIFT+click
    // selects (selectObject additive: pushed, lit, the last the primary); SHIFT held at the start ADDS to the selection; ESC cancels; under
    // 4 px it is a click and nothing happens. The click the browser fires after the mouseup is swallowed once, so the container's own
    // click cannot deselect what was just selected. Called from composer.html's container mousedown (one line); returns true when it took the press.
    beginMarquee(e) {
        const C = C_(); if (!C || C.drawMode || C.pointsMode || this._mq) return false;
        const x0 = e.clientX, y0 = e.clientY, add = !!e.shiftKey;
        const box = document.createElement('div'); box.id = 'hqMarquee';
        box.style.cssText = 'position:fixed;z-index:70;left:' + x0 + 'px;top:' + y0 + 'px;width:0;height:0;border:1px dashed #5E8C7A;background:rgba(94,140,122,0.14);pointer-events:none';
        document.body.appendChild(box);
        let last = { x: x0, y: y0 }, done = false;
        const rect = () => ({ l: Math.min(x0, last.x), t: Math.min(y0, last.y), r: Math.max(x0, last.x), b: Math.max(y0, last.y) });
        const paint = () => { const R = rect(); box.style.left = R.l + 'px'; box.style.top = R.t + 'px'; box.style.width = (R.r - R.l) + 'px'; box.style.height = (R.b - R.t) + 'px'; };
        const onMove = ev => { last = { x: ev.clientX, y: ev.clientY }; paint(); };
        const finish = cancel => {
            if (done) return; done = true; this._mq = null;
            window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('keydown', onKey, true);
            box.remove();
            const R = rect(), small = (R.r - R.l) < 4 && (R.b - R.t) < 4;
            if (cancel) { this.say('marquee cancelled', false); return; }
            if (small) return;   // a click: the container's own click does what it always did
            const eat = ev => { ev.stopPropagation(); ev.preventDefault(); };   // the click that follows this mouseup, once
            window.addEventListener('click', eat, true); setTimeout(() => window.removeEventListener('click', eat, true), 0);
            this.selectTouched(R, add);
        };
        const onUp = () => finish(false);
        const onKey = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); ev.preventDefault(); finish(true); } };
        this._mq = { box };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); window.addEventListener('keydown', onKey, true);
        return true;
    },
    selectTouched(R, add) {
        const C = C_(); if (!C) return;
        const touched = (C.objects || []).filter(o => o && o.layer < META() && o.type !== 'marker' && o.type !== 'curveDot' && o._els && o._els.group && o._els.group.isConnected)
            .filter(o => { const b = o._els.group.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.left <= R.r && b.right >= R.l && b.top <= R.b && b.bottom >= R.t; });
        if (!add) C.deselectAll();
        const list = touched.filter(o => !(C.selectedObjects || []).includes(o));
        list.forEach(o => C.selectObject(o, { additive: true }));   // exactly SHIFT+click's path: pushed, lit, the handles, the last the primary
        const lanes = new Set(list.map(o => o.layer)).size;
        this.say(list.length ? ('marquee: ' + list.length + (list.length === 1 ? ' object' : ' objects') + (add ? ' added' : ' selected') + ' on ' + lanes + (lanes === 1 ? ' player' : ' players')) : (add ? 'marquee: nothing new inside it' : 'marquee: nothing inside it'), false);
        this.refresh();
    },

    // ---------------------------------------------------------------- 1q.3 THE STACK — ALT+click = the list of what is stacked here, on every player lane
    // (the cycling by repeated clicks is the composer's own, `pickFromStack`, 2026-09-09 — RUNNING_LOG §311; META keeps its own picker)
    closeStackPicker() {
        const p = this._stackPick; if (!p) return; this._stackPick = null;
        document.removeEventListener('mousedown', p._out, true); document.removeEventListener('keydown', p._key, true); p.remove();
    },
    openStackPicker(e, layer) {
        const C = C_(); if (!C || typeof C.stackAt !== 'function') return; this.closeStackPicker();
        const stack = C.stackAt(C.clientXToTime(e.clientX), layer); if (!stack.length) return;
        const box = document.createElement('div'); box.id = 'hqStackPicker';
        box.style.cssText = 'position:fixed;z-index:9999;background:#222;border:1px solid #5E8C7A;border-radius:6px;padding:6px;box-shadow:0 4px 16px rgba(0,0,0,.5);min-width:190px;' +
            'left:' + Math.min(e.clientX, window.innerWidth - 240) + 'px;top:' + Math.max(4, Math.min(e.clientY + 10, window.innerHeight - 30 - stack.length * 24)) + 'px;font:11px system-ui,sans-serif;color:#ddd';
        const head = document.createElement('div'); head.textContent = stack.length + ' stacked here — ' + shortOf(layer); head.style.cssText = 'color:#8fb3a5;font-size:10px;margin:0 0 4px 2px'; box.appendChild(head);
        stack.forEach((s, i) => {
            const row = document.createElement('div'); const cur = C.selectedObject === s;
            row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 6px;cursor:pointer;border-radius:4px;background:' + (cur ? '#33473f' : 'none');
            const sw = document.createElement('span'); sw.style.cssText = 'width:10px;height:10px;border-radius:2px;flex:none;background:' + (s.color || '#888');
            const tx = document.createElement('span'); tx.textContent = C.stackLabel(s) + '  ' + (endOf(s) - startOf(s)).toFixed(1) + ' s';
            row.appendChild(sw); row.appendChild(tx);
            row.addEventListener('mouseenter', () => { row.style.background = '#33473f'; });
            row.addEventListener('mouseleave', () => { row.style.background = cur ? '#33473f' : 'none'; });
            row.addEventListener('mousedown', ev => {
                ev.stopPropagation(); ev.preventDefault(); this.closeStackPicker();
                C._metaCycle = { x: e.clientX, idx: i, ids: stack.map(q => q.id).join(',') };   // the cycle continues from here
                C.selectObject(s); this.say('selected ' + C.stackLabel(s) + ' — ' + (i + 1) + ' of ' + stack.length + ' in this stack', false); this.refresh();
            });
            box.appendChild(row);
        });
        document.body.appendChild(box); this._stackPick = box;
        box._out = ev => { if (!box.contains(ev.target)) this.closeStackPicker(); };
        box._key = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); this.closeStackPicker(); } };
        setTimeout(() => { if (this._stackPick === box) { document.addEventListener('mousedown', box._out, true); document.addEventListener('keydown', box._key, true); } }, 0);
    },
    stackPlace() {   // the primary's place in the stack it was picked from (`pickFromStack` keeps it in `_metaCycle`), for the strip
        const C = C_(), cyc = C && C._metaCycle, prim = C && C.selectedObject; if (!cyc || !cyc.ids || !prim) return '';
        const ids = cyc.ids.split(','); return ids[cyc.idx] === prim.id && ids.length > 1 ? ((cyc.idx + 1) + ' of ' + ids.length + ' in this stack — click again for the next, ALT+click for the list') : '';
    },

    back() {
        const C = C_(); if (!C) return;
        const P = this.pitched().filter(o => o.hq && o.hq.was); if (!P.length) return;
        C.pushUndoState();
        P.forEach(o => {
            const w = o.hq.was;
            if (this.isTrill(o)) { if (w.trillPitch != null) o.trill.pitch = w.trillPitch; try { C.regenerateTrill(o); } catch (e) {} }
            else {
                o.sonifyNote = w.sonifyNote;
                if (w.morphBend) o.morphBend = JSON.parse(JSON.stringify(w.morphBend)); else delete o.morphBend;
                if (w.sonifyMode != null) o.sonifyMode = w.sonifyMode; else delete o.sonifyMode;
                if ('velAbs' in w) { if (w.velAbs != null) o.velAbs = w.velAbs; else delete o.velAbs; }              // §318: the pin, only when this back knows it
                if ('cc7Abs' in w) { if (w.cc7Abs) o.cc7Abs = JSON.parse(JSON.stringify(w.cc7Abs)); else delete o.cc7Abs; }
                if (w.performanceNotes != null) o.performanceNotes = w.performanceNotes; else delete o.performanceNotes;
            }
            delete o.hq;
            this.rerender(o);
        });
        if (typeof C.curveDirty === 'function') C.curveDirty();
        C.markDirty();
        this.say('back: ' + P.length + (P.length === 1 ? ' object' : ' objects') + ' restored to the pitches before their first take', false);
        this.refresh();
    }
};

// ---------------------------------------------------------------- the two hooks: the strip follows the selection
function install() {
    const C = C_(); if (!C || C._hqInstalled) return; C._hqInstalled = true;
    const _sel = C.selectObject;
    C.selectObject = function () { const r = _sel.apply(this, arguments); try { H.refresh(); } catch (e) { console.warn('[harmony_sel] refresh:', e); } return r; };
    const _des = C.deselectAll;
    C.deselectAll = function () { const r = _des.apply(this, arguments); try { H.status = ''; H.bad = false; H.refresh(); } catch (e) {} return r; };
    ['undo', 'redo'].forEach(k => { const f = C[k]; if (typeof f !== 'function') return; C[k] = function () { const r = f.apply(this, arguments); try { H.refresh(); } catch (e) {} return r; }; });   // the objects are replaced: the strip follows
}
if (C_()) install();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(install, 0));
else setTimeout(install, 0);

root.HarmonySel = H;
}(typeof self !== 'undefined' ? self : this));
