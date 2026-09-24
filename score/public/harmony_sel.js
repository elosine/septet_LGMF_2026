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

const H = {
    el: null, status: '', bad: false, lastTake: '',

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
            '<span id="hqStatus" style="color:#555;overflow:hidden;text-overflow:ellipsis;min-width:0"></span>';
        ['mousedown', 'mouseup', 'click', 'dblclick', 'wheel', 'keydown'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));   // the score's own handlers stay out of the strip
        el.querySelector('#hqTake').addEventListener('click', e => { this.openMenu(e.currentTarget); });
        el.querySelector('#hqBack').addEventListener('click', () => { this.back(); });
        document.body.appendChild(el); this.el = el;
        window.addEventListener('resize', () => { try { this.place(); } catch (e) {} });
        return el;
    },
    place() {
        const lc = document.getElementById('laneContainer'); if (!lc || !this.el) return;
        const r = lc.getBoundingClientRect();
        this.el.style.top = Math.max(0, r.top + 6) + 'px';
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
        el.querySelector('#hqCount').textContent = notes + (notes === 1 ? ' note' : ' notes') + (trills ? ' · ' + trills + (trills === 1 ? ' trill' : ' trills') : '') +
            ' · ' + lanes + (lanes === 1 ? ' player' : ' players');
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
        S.openTakeMenu(-1, anchor, { current: this.lastTake, onChoose: name => { this.apply(name); } });
    },

    // ---------------------------------------------------------------- the take onto the selection
    remember(o) {   // the original, ONCE — a later take never overwrites it (his A, §307)
        if (o.hq && o.hq.was) return;
        o.hq = { was: this.isTrill(o) ? { trillPitch: o.trill.pitch } : {
            sonifyNote: o.sonifyNote,
            morphBend: o.morphBend ? JSON.parse(JSON.stringify(o.morphBend)) : null,
            sonifyMode: o.sonifyMode != null ? o.sonifyMode : null,
            performanceNotes: o.performanceNotes != null ? o.performanceNotes : null } };
    },
    writeNote(o, n, name) {
        o.sonifyNote = Math.round(+n.midi);
        const dur = Math.max(0.001, endOf(o) - startOf(o)), c = +(+n.cents || 0).toFixed(2);
        if (c) { o.morphBend = [[0, c], [dur, c]]; delete o.sonifyMode; }                     // a bent note is DRAWN — its own curve channel (1c.3 · 1c.4)
        else if (o.morphBend) { o.morphBend = [[0, RECENTRE], [dur, RECENTRE]]; }               // bent before, straight now: the channel brought back to centre
        if (n.seat) delete o.sonifyMode;                                                        // a seat's note (the vibraphone's second) is DRAWN too, as every drawer writes it
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
