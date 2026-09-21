// texture_cols.js — THE COLUMNS: every ON mark of the top row orchestrated with the drawer's left side (LGMF PLAN 1m.2, 2026-09-21;
// RUNNING_LOG §224 … §226; COMPOSITION_NOTES LG-66 · LG-67 · LG-68).
//
// His words: *"for every X at top, like the column heading, I have a full column of all the instruments … select a column and use the
// left side to orchestrate that column"* · *"each column when selected will just be mirror the orchestration drawer … I can do my
// selection and whatnot in the orchestration drawer and reshuffle, etc., and use the seeds. That will work just as long as it's linked
// and there's recall as I click a different column."* · the answer is A: every shuffle lands in the selected column at once.
//
// A mixin on texture_row.js (which is a mixin on the strikes drawer); `strike_drawer.js` is not changed:
//   · under every ON mark a COLUMN of the drawer's own player rows (TRK order — eight players and the vibraphone's second seat, the
//     percussion's row kept but not addressed here), lined up with the players list; a circle per row.
//   · A COLUMN IS A DRAWER TAKE: `state()` (the harmony, the cfg, the voices) + its ticks (`laneOff`) + its dealt notes. Select a
//     column → `applyState` (the take machinery). LINKED (A): after every render of the drawer, the selected column(s) take its state.
//   · the circles ARE the ticks: unticked = a dim dot · ticked, no note = hollow · ticked with a note = filled.
//   · the column preview is the drawer's own Hear (`Hear orchestrated` · `♪ as dealt`); SPACE is THE RHYTHM PREVIEW — every ON mark's
//     notes at its time, the claves under it while the bar's `claves` toggle is on.
//   · remembered with the pattern (localStorage, as 1m.1); the strike mode's ticks are kept apart from the columns'.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D || typeof D.txRender !== 'function') { console.warn('[texture_cols] texture_row.js is not loaded'); return; }
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const TRK = () => (typeof D.tracks === 'function' ? D.tracks() : (typeof TRACKS !== 'undefined' ? TRACKS : [])) || [];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const nm = m => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ROW_TOP = 24, MARK_H = 18, COL_TOP = ROW_TOP + MARK_H + 6, CIRC_R = 4.5, BAND_MIN = 10, PICK_PX = 6;
const CLAVES_MS = 150, ANCHOR_MF = 100;
const ON_COL = '#E8CF9A', HOLLOW = '#8a8a96', OFF_DOT = '#3a3a44', SEL_BG = 'rgba(201,160,90,.16)', SEL_LINE = '#C9A05A';
const rowOf = n => (n.row != null ? n.row : n.lane);

Object.assign(D, {
    _txApplying: false, _txFromBtn: false, _txSavedOff: null, _txPersistT: null,

    // the pattern's columns and selection — backfilled on a pattern made before this build
    txCols() { const p = this.txPat(); if (!p) return null; if (!p.cols) p.cols = {}; if (!Array.isArray(p.sel)) p.sel = []; return p; },
    txSel() { const p = this.txCols(); return p ? p.sel : []; },
    txClavesOn() { return this._txS.claves !== false; },
    txPersistSoon() { clearTimeout(this._txPersistT); this._txPersistT = setTimeout(() => this.txPersist(), 150); },
    txH() {
        const view = this.el && this.el.querySelector('#txView');
        const rows = this.txRowsY();
        return Math.max(ROW_TOP + MARK_H + 14, (view && view.clientHeight) || 0, rows.length ? rows[rows.length - 1] + CIRC_R + 8 : 0);
    },
    // the players' rows, lined up with the drawer's list (`#skRows .skRow`, one per TRK row); evenly spaced when the list is not drawn
    txRowsY() {
        const T = TRK(), svg = this.el && this.el.querySelector('#txSvg'); if (!svg) return [];
        const rows = this.el.querySelectorAll('#skRows .skRow');
        if (rows.length === T.length) { const top = svg.getBoundingClientRect().top; return [...rows].map(r => { const b = r.getBoundingClientRect(); return b.top + b.height / 2 - top; }); }
        const view = this.el.querySelector('#txView'), H = Math.max(200, (view && view.clientHeight) || 0), step = (H - COL_TOP - 10) / Math.max(1, T.length);
        return T.map((t, i) => COL_TOP + step * (i + 0.5));
    },

    // ---------------------------------------------------------------- the drawer's state ↔ a column
    txColNotes() {   // the column's deal: each player · pitch once, no timing (the reading `♪ as dealt` uses)
        if (!this.strike) return [];
        const seen = new Set(), out = [];
        let ns = []; try { ns = this.notesFor('orch') || []; } catch (e) { ns = []; }
        ns.forEach(n => { const k = rowOf(n) + '|' + n.tech + '|' + n.midi; if (seen.has(k)) return; seen.add(k); out.push(Object.assign({}, n, { row: rowOf(n), onMs: 0, durMs: clamp(+n.durMs || 100, 60, 1500) })); });
        return out;
    },
    txOffNow() { return Object.keys(this.laneOff || {}).filter(l => this.laneOff[l]).map(Number); },
    // LINKED (A): the selected column(s) take the drawer as it stands
    txWriteBack(ticksOnly) {
        if (!this.txIsOn() || !this._tx || this._txApplying || !this.strike) return;
        const p = this.txCols(); if (!p || !p.sel.length) return;
        const off = this.txOffNow();
        if (ticksOnly) {
            let changed = false;
            p.sel.forEach(k => { const c = p.cols[k]; if (!c) return; if (JSON.stringify(c.off) !== JSON.stringify(off)) { c.off = off; changed = true; } });
            if (changed) { this.txPersistSoon(); this.txRender(); }
            return;
        }
        const st = this.state(), notes = this.txColNotes();
        p.sel.forEach(k => { p.cols[k] = { state: st, off, notes }; });
        this.txPersistSoon(); this.txRender();
    },
    // RECALL: a column's state into the drawer (the take machinery), its ticks with it
    txRecall(k) {
        const p = this.txCols(), c = p && p.cols[k]; if (!c) return false;
        if (!c.state || !this.strikeById(c.state.strikeId)) { this.setStatus('that column\'s harmony is no longer in this score\'s list — shuffle to deal it afresh', true); return false; }
        this._txApplying = true;
        try { this.snapshot(); this.laneOff = {}; (c.off || []).forEach(l => { this.laneOff[l] = true; }); this.applyState(c.state); }
        finally { this._txApplying = false; }
        this.txWriteBack();
        return true;
    },
    // SELECT: plain = this column alone, recalled · shift = added, and the drawer's deal copied into it
    txSelect(k, add) {
        const p = this.txCols(); if (!p) return;
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        if (add) {
            const at = p.sel.indexOf(k);
            if (at >= 0) { p.sel.splice(at, 1); this.txPersistSoon(); this.txRender(); this.setStatus('column at ' + this.txDot(k).t.toFixed(2) + ' s left the selection · ' + p.sel.length + ' selected'); return; }
            if (!p.sel.length && p.cols[k]) { p.sel = [k]; if (this.txRecall(k)) this.setStatus(this.txColLine()); return; }
            p.sel.push(k); this.txWriteBack(); this.setStatus(this.txColLine()); return;
        }
        p.sel = [k];
        if (p.cols[k]) { if (!this.txRecall(k)) { this.txRender(); } }
        else this.txWriteBack();   // a fresh column starts from what the drawer holds now
        this.txPersistSoon(); this.txRender(); this.setStatus(this.txColLine());
    },
    txClearSel() { const p = this.txCols(); if (!p || !p.sel.length) return; p.sel = []; this.txPersistSoon(); this.txRender(); this.setStatus('no column selected — the drawer is on its own'); },
    txDot(k) { return this._tx.dots.find(d => d.k === k); },
    txColLine() {
        const p = this.txCols(), T = TRK(); if (!p.sel.length) return 'no column selected';
        const c = p.cols[p.sel[0]], who = c ? (c.notes || []).filter(n => !(c.off || []).includes(n.row)).map(n => (T[n.row] ? T[n.row].short : '?') + ' ' + nm(n.midi)).join(' · ') : '';
        return (p.sel.length === 1 ? 'column at ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : p.sel.length + ' columns') + ' selected — the drawer is theirs' + (who ? ' · ' + who : ' · nobody plays yet: tick players and shuffle');
    },

    // ---------------------------------------------------------------- the drawing, over the row's
    txRenderCols() {
        const svg = this.el && this.el.querySelector('#txSvg'), run = svg && svg.querySelector('#txRun'); if (!svg || !run || !this._tx) return;
        const p = this.txCols(), T = TRK(), W = this.txW(), H = this.txH(), ys = this.txRowsY(), mw = this.txMarkW(), sel = new Set(p.sel), on = new Set(p.on);
        const bw = Math.max(mw, BAND_MIN); let s = '';
        this._tx.dots.forEach(d => {
            if (!on.has(d.k)) return;
            const x = this.txX(d.t), cx = x + mw / 2, x0 = cx - bw / 2; if (x0 > W + bw || x0 + bw < -bw) return;
            const c = p.cols[d.k], isSel = sel.has(d.k), off = new Set(c ? c.off : []);
            s += '<rect class="txCol" data-k="' + d.k + '" x="' + x0.toFixed(1) + '" y="' + COL_TOP + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, H - COL_TOP) + '" fill="' + (isSel ? SEL_BG : 'rgba(255,255,255,.02)') + '" stroke="' + (isSel ? SEL_LINE : 'none') + '" stroke-width="1"/>';
            ys.forEach((cy, lane) => {
                const t = T[lane], ticked = c ? !off.has(lane) : false;
                const mine = c ? (c.notes || []).filter(n => n.row === lane) : [];
                const title = (t ? t.label : 'row ' + lane) + ' · ' + d.t.toFixed(2) + ' s · ' + (!c ? 'not yet selected' : !ticked ? 'unticked' : mine.length ? mine.map(n => nm(n.midi) + (n.cents ? (n.cents > 0 ? ' +' : ' ') + Math.round(n.cents) + '¢' : '')).join(' ') : 'ticked — no note yet (shuffle or assign)');
                s += ticked
                    ? '<circle class="txCirc" data-k="' + d.k + '" data-lane="' + lane + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + CIRC_R + '" fill="' + (mine.length ? ON_COL : 'none') + '" stroke="' + (mine.length ? ON_COL : HOLLOW) + '" stroke-width="1.3" style="cursor:pointer"><title>' + escH(title) + '</title></circle>'
                    : '<circle class="txCirc" data-k="' + d.k + '" data-lane="' + lane + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="2" fill="' + OFF_DOT + '" style="cursor:pointer"><title>' + escH(title) + '</title></circle>';
            });
        });
        run.insertAdjacentHTML('beforebegin', s);
        const i = this.el.querySelector('#txI'); if (i && p.sel.length) i.title = this.txColLine() + String.fromCharCode(10) + i.title;
    },

    // ---------------------------------------------------------------- the hand
    // a click in the columns' area: on a circle = that row's tick · in a column's band = select (SHIFT: add) · else the row's own click
    txColDown(ev) {
        if (!this._tx || ev.button !== 0) return false;
        const svg = this.el.querySelector('#txSvg'), rect = svg.getBoundingClientRect(), x = ev.clientX - rect.left, y = ev.clientY - rect.top;
        if (y < COL_TOP) return false;
        const p = this.txCols(), mw = this.txMarkW(), bw = Math.max(mw, BAND_MIN), on = new Set(p.on);
        let best = null, bd = 1e9;
        this._tx.dots.forEach(d => { if (!on.has(d.k)) return; const dx = Math.abs(x - (this.txX(d.t) + mw / 2)); if (dx < bd) { bd = dx; best = d; } });
        if (!best || bd > Math.max(PICK_PX, bw / 2)) return false;
        ev.preventDefault();
        const ys = this.txRowsY(); let lane = -1; ys.forEach((cy, i) => { if (Math.abs(y - cy) <= CIRC_R + 3) lane = i; });
        if (lane >= 0) {
            if (!p.sel.includes(best.k)) this.txSelect(best.k, false);
            const cb = this.el.querySelector('.skTick[data-lane="' + lane + '"]');
            if (!cb) { this.setStatus('load a harmony first — the ticks live on the players list', true); return true; }
            if (cb.disabled) { this.setStatus((TRK()[lane] || {}).label + ' is busy at the playhead — its tick is not yours to set here', true); return true; }
            cb.click();   // the drawer's own tick handler: tick → eligible; untick → the player dropped now (FIX-NOW 5)
            this.txWriteBack(true);
            return true;
        }
        this.txSelect(best.k, !!ev.shiftKey);
        return true;
    },

    // ---------------------------------------------------------------- the ear: THE RHYTHM PREVIEW
    async txPlay() {
        if (!this._tx) { this.setStatus('choose a rhythm take first', true); return; }
        const p = this.txCols(), r = this.txRange(), on = new Set(p.on), lane = this.txPercLane(), claves = this.txClavesOn();
        const T = root.TexturePanel, cl = (T && T.CLAVES) || { tech: 'toys_claves', midi: 41 };
        const c0 = +p.cursor || 0, from = (c0 > r[0] && c0 < r[1]) ? c0 : r[0];
        const dots = this._tx.dots.filter(d => on.has(d.k) && d.t >= from - 1e-6 && d.t <= r[1] + 1e-6);
        if (!dots.length) { this.setStatus(p.on.length ? 'no ON mark between ' + from.toFixed(2) + ' s and ' + r[1].toFixed(2) + ' s — move the cursor or the range' : 'every mark is off — click some on (or all on)', true); return; }
        const notes = []; let pitched = 0, bare = 0;
        dots.forEach(d => {
            const onMs = Math.round((d.t - from) * 1000), c = p.cols[d.k], off = new Set(c ? c.off : []);
            const mine = c ? (c.notes || []).filter(n => !off.has(n.row)) : [];
            mine.forEach(n => notes.push(Object.assign({}, n, { onMs })));
            if (mine.length) pitched++; else bare++;
            if (claves && lane >= 0) notes.push({ lane, tech: cl.tech, midi: cl.midi, vel: ANCHOR_MF, cents: 0, onMs, durMs: CLAVES_MS });
        });
        if (!notes.length) { this.setStatus('nothing to hear: no column has a note and the claves are off', true); return; }
        await this.playNotes(notes, 'the rhythm · ' + pitched + ' marks with pitches · ' + bare + ' bare' + (claves ? ' · the claves under them' : '') + ' · from ' + from.toFixed(2) + ' s');
        const e = E_(); if (e && e._playing) this.txStartRun(from, r[1]);
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · the drawing: the columns over the row's, and the `claves` toggle in the bar
const _txRender = D.txRender;
D.txRender = function () { const r = _txRender.apply(this, arguments); try { this.txRenderCols(); } catch (e) { console.warn('[texture_cols] render:', e); } return r; };
const _txEnsureUI = D.txEnsureUI;
D.txEnsureUI = function () {
    const r = _txEnsureUI.apply(this, arguments);
    const bar = this.el && this.el.querySelector('#txBar');
    if (bar && !bar.querySelector('#txClaves')) {
        const lab = document.createElement('label'); lab.className = 'txOnly'; lab.style.cssText = 'display:inline-flex;align-items:center;gap:3px';
        lab.title = 'the claves under every ON mark in the rhythm preview (SPACE) — off once the rhythm is decided';
        lab.innerHTML = '<input id="txClaves" type="checkbox"' + (this.txClavesOn() ? ' checked' : '') + '> claves';
        const zoom = bar.querySelector('#txZoom'); bar.insertBefore(lab, zoom);
        lab.querySelector('#txClaves').addEventListener('change', e => { this._txS.claves = !!e.target.checked; this.txPersist(); this.setStatus(this._txS.claves ? 'claves under every ON mark' : 'claves off — the pitches alone'); });
        const hearO = this.el.querySelector('#skHearO'); if (hearO && !hearO._txBound) { hearO._txBound = true; hearO.addEventListener('click', () => { this._txFromBtn = true; }, true); }
    }
    return r;
};
// 2 · the hand: the columns first, then the row's own click
const _txDown = D.txDown;
D.txDown = function (ev) {
    try { if (this.txIsOn() && this.txColDown(ev)) return; } catch (e) { console.warn('[texture_cols] click:', e); }
    const p = this.txCols(), before = p ? p.on.slice() : null;
    const r = _txDown.apply(this, arguments);
    if (p && before) { const now = new Set(p.on); const left = p.sel.filter(k => !now.has(k)); if (left.length) { p.sel = p.sel.filter(k => now.has(k)); this.txPersistSoon(); this.txRender(); } }
    return r;
};
// 3 · LINKED: after every render of the drawer the selected column(s) take its state; after the players list alone, its ticks
const _render = D.render;
D.render = function () { const r = _render.apply(this, arguments); try { this.txWriteBack(); } catch (e) { console.warn('[texture_cols] link:', e); } return r; };
const _renderOrch = D.renderOrch;
D.renderOrch = function () { const r = _renderOrch.apply(this, arguments); try { this.txWriteBack(true); } catch (e) { console.warn('[texture_cols] ticks:', e); } return r; };
// 4 · Hear orchestrated is the COLUMN, as dealt (one onset, one strike — the reading `♪ as dealt` uses); SPACE is the rhythm. Both
//     reach play('orch'); the button's own capture listener says which
const _play = D.play;
D.play = async function (mode) {
    const fromBtn = this._txFromBtn; this._txFromBtn = false;
    if (mode === 'orch' && this.txIsOn() && fromBtn) { if (!this.strike) { this.setStatus('load a harmony first — a column is orchestrated from one', true); return; } return this.hearDealt(); }
    return _play.apply(this, arguments);   // texture_row's wrap: on a texture take → txPlay (the rhythm preview above)
};
// 4b · a take re-read: a selection that names marks the take no longer has is dropped
const _txLoad = D.txLoad;
D.txLoad = function () { const r = _txLoad.apply(this, arguments); try { const p = this.txCols(); if (p && this._tx) { const keys = new Set(this._tx.dots.map(d => d.k)); p.sel = p.sel.filter(k => keys.has(k)); } } catch (e) {} return r; };
// 5 · the strike mode keeps its own ticks: saved on the way into a texture take, restored on the way back
const _txSetMode = D.txSetMode;
D.txSetMode = function (m) {
    const was = this.txIsOn();
    if (m === 'texture' && !was) this._txSavedOff = Object.assign({}, this.laneOff || {});
    const r = _txSetMode.apply(this, arguments);
    if (m === 'strike' && was && this._txSavedOff) { this.laneOff = this._txSavedOff; this._txSavedOff = null; if (this.strike) this.renderOrch(); }
    return r;
};
// 6 · ESC clears the selection (the row's [ · ] keys live in texture_row.js)
window.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape' || !D.el || D.el.style.display === 'none' || !D.txIsOn() || !D._tx) return;
    const t = ev.target; if (t && t.matches && t.matches('textarea, input, select')) return;
    if (D.txSel().length) D.txClearSel();   // no stopPropagation: a sound card or a takes menu closes on the same key
}, true);

}(typeof self !== 'undefined' ? self : this));
