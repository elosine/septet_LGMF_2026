// texture_cols.js — THE COLUMNS: every ON mark of the top row orchestrated with the drawer's left side (LGMF PLAN 1m.2, 2026-09-21;
// RUNNING_LOG §224 … §228; COMPOSITION_NOTES LG-66 · LG-67 · LG-68).
//
// His words: *"for every X at top, like the column heading, I have a full column of all the instruments … select a column and use the
// left side to orchestrate that column"* · *"each column when selected will just be mirror the orchestration drawer … I can do my
// selection and whatnot in the orchestration drawer and reshuffle, etc., and use the seeds. That will work just as long as it's linked
// and there's recall as I click a different column."* · the answer is A: every shuffle lands in the selected column at once.
// And from his first test (§228): *"I want to be able to assign the same harmony to multi-selects and to shuffle all of them, but still
// assign individual instruments per column"* — so WHO SOUNDS is the column's own, apart from the drawer's ticks.
//
// A mixin on texture_row.js (which is a mixin on the strikes drawer); `strike_drawer.js` is not changed:
//   · under every ON mark a COLUMN of the drawer's own player rows (TRK order — eight players and the vibraphone's second seat, the
//     percussion's row kept but not addressed here), lined up with the players list; a circle per row.
//   · A COLUMN IS A DRAWER TAKE: `state()` (the harmony, the cfg, the voices) + the drawer's ticks (`laneOff`) + its dealt notes —
//     THE DEAL — and, its own, WHO SOUNDS (`on`: rows). Select a column → `applyState` (the take machinery). LINKED (A): after every
//     render of the drawer, the selected column(s) take its deal; `on` is never touched by the drawer.
//   · the circles are WHO SOUNDS: gold = on, with a note in the deal · hollow gold = on, no note (tick the player and shuffle, or
//     assign) · gray, the same size = off. A click toggles that column's row alone — selected or not, one column or many.
//   · a fresh column starts from the drawer's deal with NOBODY on (§228: the last column's players must not carry over).
//   · the column preview is the drawer's own `Hear orchestrated` / `♪ as dealt`: the column's ON players as one strike (nobody on →
//     the whole deal, and the status says so). SPACE is THE RHYTHM PREVIEW — every ON mark's ON players at its time, the claves under
//     it while the bar's `claves` toggle is on.
//   · `hear` is STRIKE here (§228: "make strike the default for here"): set on the way into a texture take, kept across every recall
//     (a column's stored `hearMode` / `longS` are not applied), the strike mode's own setting restored on the way back.
//   · UNDO (§228): ↶ in the bar, CTRL+Z — the marks, the columns, the selection and the range, forty steps, this page only.
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
const ROW_TOP = 24, MARK_H = 18, COL_TOP = ROW_TOP + MARK_H + 6, CIRC_R = 4.5, BAND_MIN = 10, PICK_PX = 6, UNDO_MAX = 40;
const CLAVES_MS = 150, ANCHOR_MF = 100;
const ON_COL = '#E8CF9A', OFF_FILL = '#55555f', SEL_BG = 'rgba(201,160,90,.16)', SEL_LINE = '#C9A05A';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
const NOT_APPLIED = ['hearMode', 'longS'];   // the drawer's `hear` menu is the page's, not a column's
const rowOf = n => (n.row != null ? n.row : n.lane);

Object.assign(D, {
    _txApplying: false, _txFromBtn: false, _txSavedOff: null, _txSavedHear: null, _txPersistT: null, _txUndo: [],

    // the pattern's columns and selection — backfilled on a pattern made before this build; a column made before §228 gets `on` from
    // its ticks once, so nothing he had is lost
    txCols() {
        const p = this.txPat(); if (!p) return null;
        if (!p.cols) p.cols = {}; if (!Array.isArray(p.sel)) p.sel = [];
        Object.keys(p.cols).forEach(k => { const c = p.cols[k]; if (c && !Array.isArray(c.on)) { const off = new Set(c.off || []); c.on = TRK().map((t, i) => i).filter(i => !off.has(i) && (c.notes || []).some(n => n.row === i)); } });
        return p;
    },
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

    // ---------------------------------------------------------------- undo (§228)
    txUndoSnap() { const p = this.txCols(); return p ? JSON.stringify({ on: p.on, cols: p.cols, sel: p.sel, range: p.range }) : null; },
    txPushUndo() { const s = this.txUndoSnap(); if (s == null) return null; if (this._txUndo[this._txUndo.length - 1] !== s) { this._txUndo.push(s); if (this._txUndo.length > UNDO_MAX) this._txUndo.shift(); } return s; },
    txDropUndoIfSame(s) { if (s != null && this._txUndo.length && this._txUndo[this._txUndo.length - 1] === s && this.txUndoSnap() === s) this._txUndo.pop(); },
    txUndo() {
        const p = this.txCols(); if (!p) return;
        const now = this.txUndoSnap(); let s = this._txUndo.pop(); if (s === now) s = this._txUndo.pop();
        if (s == null) { this.setStatus('nothing to undo'); return; }
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        const o = JSON.parse(s); p.on = o.on; p.cols = o.cols; p.sel = o.sel; p.range = o.range;
        if (p.sel.length && p.cols[p.sel[0]]) this.txRecall(p.sel[0], true);
        this.txPersistSoon(); this.txRender(); this.setStatus('undone · ' + this._txUndo.length + ' more');
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
    txSounding(c) { const on = new Set((c && c.on) || []); return c ? (c.notes || []).filter(n => on.has(n.row)) : []; },
    // LINKED (A): the selected column(s) take the drawer's DEAL as it stands; `on` is theirs
    txWriteBack(ticksOnly) {
        if (!this.txIsOn() || !this._tx || this._txApplying || !this.strike) return;
        const p = this.txCols(); if (!p || !p.sel.length) return;
        const off = this.txOffNow();
        if (ticksOnly) {
            if (p.sel.every(k => !p.cols[k] || JSON.stringify(p.cols[k].off) === JSON.stringify(off))) return;
            this.txPushUndo(); p.sel.forEach(k => { if (p.cols[k]) p.cols[k].off = off; });
            this.txPersistSoon(); this.txRender(); return;
        }
        const st = this.state(), notes = this.txColNotes();
        const before = this.txUndoSnap();
        const next = {}; p.sel.forEach(k => { next[k] = Object.assign({}, p.cols[k] || { on: [] }, { state: st, off, notes }); });
        const same = p.sel.every(k => JSON.stringify(next[k]) === JSON.stringify(p.cols[k]));
        if (same) return;
        this._txUndo.push(before); if (this._txUndo.length > UNDO_MAX) this._txUndo.shift();
        p.sel.forEach(k => { p.cols[k] = next[k]; });
        this.txPersistSoon(); this.txRender();
    },
    // RECALL: a column's deal into the drawer (the take machinery), its ticks with it; the page's `hear` menu stays
    txRecall(k, quiet) {
        const p = this.txCols(), c = p && p.cols[k]; if (!c) return false;
        if (!c.state || !this.strikeById(c.state.strikeId)) { this.setStatus('that column\'s harmony is no longer in this score\'s list — shuffle to deal it afresh', true); return false; }
        const st = JSON.parse(JSON.stringify(c.state)); NOT_APPLIED.forEach(key => { if (this.cfg[key] != null) st.cfg[key] = this.cfg[key]; else delete st.cfg[key]; });
        this._txApplying = true;
        try { if (!quiet) this.snapshot(); this.laneOff = {}; (c.off || []).forEach(l => { this.laneOff[l] = true; }); this.applyState(st); }
        finally { this._txApplying = false; }
        if (!quiet) this.txWriteBack();
        return true;
    },
    // SELECT: plain = this column alone, recalled · shift = added, and the drawer's deal copied into it (its own `on` kept)
    txSelect(k, add) {
        const p = this.txCols(); if (!p) return;
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        this.txPushUndo();
        if (add) {
            const at = p.sel.indexOf(k);
            if (at >= 0) { p.sel.splice(at, 1); this.txPersistSoon(); this.txRender(); this.setStatus('column at ' + this.txDot(k).t.toFixed(2) + ' s left the selection · ' + p.sel.length + ' selected'); return; }
            if (!p.sel.length && p.cols[k]) { p.sel = [k]; if (this.txRecall(k)) this.setStatus(this.txColLine()); return; }
            p.sel.push(k); this.txWriteBack(); this.txRender(); this.setStatus(this.txColLine()); return;
        }
        p.sel = [k];
        if (p.cols[k]) { if (!this.txRecall(k)) this.txRender(); }
        else this.txWriteBack();   // a fresh column: the drawer's deal, nobody on
        this.txPersistSoon(); this.txRender(); this.setStatus(this.txColLine());
    },
    txClearSel() { const p = this.txCols(); if (!p || !p.sel.length) return; this.txPushUndo(); p.sel = []; this.txPersistSoon(); this.txRender(); this.setStatus('no column selected — the drawer is on its own'); },
    txDot(k) { return this._tx.dots.find(d => d.k === k) || { t: 0 }; },
    // WHO SOUNDS: a row of one column toggled — the selection untouched; a column not yet dealt takes the drawer's deal first
    txToggleRow(k, lane) {
        const p = this.txCols(); if (!p) return;
        this.txPushUndo();
        if (!p.cols[k]) { if (!this.strike) { this.setStatus('load a harmony first — a column is orchestrated from one', true); return; } p.cols[k] = { state: this.state(), off: this.txOffNow(), notes: this.txColNotes(), on: [] }; }
        const c = p.cols[k], at = c.on.indexOf(lane); if (at >= 0) c.on.splice(at, 1); else c.on.push(lane);
        this.txPersistSoon(); this.txRender();
        const t = TRK()[lane], note = (c.notes || []).filter(n => n.row === lane);
        this.setStatus((t ? t.label : 'row ' + lane) + (at >= 0 ? ' off' : ' on') + ' at ' + this.txDot(k).t.toFixed(2) + ' s' + (at < 0 && !note.length ? ' — no note in this column\'s deal yet: tick the player in the drawer and shuffle, or assign one' : ''));
    },
    txColLine() {
        const p = this.txCols(), T = TRK(); if (!p.sel.length) return 'no column selected';
        const c = p.cols[p.sel[0]], who = this.txSounding(c).map(n => (T[n.row] ? T[n.row].short : '?') + ' ' + nm(n.midi)).join(' · ');
        return (p.sel.length === 1 ? 'column at ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : p.sel.length + ' columns') + ' selected — the drawer is theirs' + (who ? ' · ' + who : ' · nobody on yet: click circles');
    },

    // ---------------------------------------------------------------- the drawing, over the row's
    txRenderCols() {
        const svg = this.el && this.el.querySelector('#txSvg'), run = svg && svg.querySelector('#txRun'); if (!svg || !run || !this._tx) return;
        const p = this.txCols(), T = TRK(), W = this.txW(), H = this.txH(), ys = this.txRowsY(), mw = this.txMarkW(), sel = new Set(p.sel), on = new Set(p.on);
        const bw = Math.max(mw, BAND_MIN); let s = '';
        this._tx.dots.forEach(d => {
            if (!on.has(d.k)) return;
            const x = this.txX(d.t), cx = x + mw / 2, x0 = cx - bw / 2; if (x0 > W + bw || x0 + bw < -bw) return;
            const c = p.cols[d.k], isSel = sel.has(d.k), cOn = new Set(c ? c.on : []);
            s += '<rect class="txCol" data-k="' + d.k + '" x="' + x0.toFixed(1) + '" y="' + COL_TOP + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, H - COL_TOP) + '" fill="' + (isSel ? SEL_BG : 'rgba(255,255,255,.02)') + '" stroke="' + (isSel ? SEL_LINE : 'none') + '" stroke-width="1"/>';
            ys.forEach((cy, lane) => {
                const t = T[lane], isOn = cOn.has(lane), mine = c ? (c.notes || []).filter(n => n.row === lane) : [];
                const title = (t ? t.label : 'row ' + lane) + ' · ' + d.t.toFixed(2) + ' s · ' + (isOn ? 'ON' : 'off') + (!c ? ' · no deal yet' : mine.length ? ' · ' + mine.map(n => nm(n.midi) + (n.cents ? (n.cents > 0 ? ' +' : ' ') + Math.round(n.cents) + '¢' : '')).join(' ') : ' · no note in the deal');
                s += '<circle class="txCirc" data-k="' + d.k + '" data-lane="' + lane + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + CIRC_R + '" fill="' + (isOn ? (mine.length ? ON_COL : 'none') : OFF_FILL) + '" stroke="' + (isOn ? ON_COL : OFF_FILL) + '" stroke-width="1.3" style="cursor:pointer"><title>' + escH(title) + '</title></circle>';
            });
        });
        run.insertAdjacentHTML('beforebegin', s);
        const i = this.el.querySelector('#txI'); if (i && p.sel.length) i.title = this.txColLine() + String.fromCharCode(10) + i.title;
    },

    // ---------------------------------------------------------------- the hand
    // a click in the columns' area: on a circle = that row of that column · in a column's band = select (SHIFT: add) · else the row's own
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
        if (lane >= 0) { this.txToggleRow(best.k, lane); return true; }
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
            const onMs = Math.round((d.t - from) * 1000), mine = this.txSounding(p.cols[d.k]);
            mine.forEach(n => notes.push(Object.assign({}, n, { onMs })));
            if (mine.length) pitched++; else bare++;
            if (claves && lane >= 0) notes.push({ lane, tech: cl.tech, midi: cl.midi, vel: ANCHOR_MF, cents: 0, onMs, durMs: CLAVES_MS });
        });
        if (!notes.length) { this.setStatus('nothing to hear: nobody is on in any column and the claves are off', true); return; }
        await this.playNotes(notes, 'the rhythm · ' + pitched + ' marks with players on · ' + bare + ' bare' + (claves ? ' · the claves under them' : '') + ' · from ' + from.toFixed(2) + ' s');
        const e = E_(); if (e && e._playing) this.txStartRun(from, r[1]);
    },
    // THE COLUMN PREVIEW: the selected column's ON players as one strike; nobody on → the whole deal
    async txHearColumn() {
        const p = this.txCols(), k = p && p.sel[0];
        if (!k) { if (!this.strike) { this.setStatus('load a harmony first — a column is orchestrated from one', true); return; } return this.hearDealt(); }
        const c = p.cols[k], mine = this.txSounding(c);
        if (!mine.length) { const r = await this.hearDealt(); this.setStatus('nobody is on in this column — hearing its whole deal'); return r; }
        return this.playNotes(mine.map(n => Object.assign({}, n, { onMs: 0, durMs: Math.max(600, +n.durMs || 0) })), 'the column at ' + this.txDot(k).t.toFixed(2) + ' s · ' + mine.length + ' on');
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · the drawing: the columns over the row's; the `claves` toggle and ↶ in the bar
const _txRender = D.txRender;
D.txRender = function () { const r = _txRender.apply(this, arguments); try { this.txRenderCols(); } catch (e) { console.warn('[texture_cols] render:', e); } return r; };
const _txEnsureUI = D.txEnsureUI;
D.txEnsureUI = function () {
    const r = _txEnsureUI.apply(this, arguments);
    const bar = this.el && this.el.querySelector('#txBar');
    if (bar && !bar.querySelector('#txClaves')) {
        const zoom = bar.querySelector('#txZoom');
        const undo = document.createElement('button'); undo.id = 'txUndoBtn'; undo.className = 'txOnly'; undo.style.cssText = BTN; undo.title = 'undo — the marks, the columns, the selection, the range (CTRL+Z)'; undo.innerHTML = '&#8630;';
        undo.addEventListener('click', () => this.txUndo()); bar.insertBefore(undo, zoom);
        const lab = document.createElement('label'); lab.className = 'txOnly'; lab.style.cssText = 'display:inline-flex;align-items:center;gap:3px';
        lab.title = 'the claves under every ON mark in the rhythm preview (SPACE) — off once the rhythm is decided';
        lab.innerHTML = '<input id="txClaves" type="checkbox"' + (this.txClavesOn() ? ' checked' : '') + '> claves';
        bar.insertBefore(lab, zoom);
        lab.querySelector('#txClaves').addEventListener('change', e => { this._txS.claves = !!e.target.checked; this.txPersist(); this.setStatus(this._txS.claves ? 'claves under every ON mark' : 'claves off — the pitches alone'); });
        const hearO = this.el.querySelector('#skHearO'); if (hearO && !hearO._txBound) { hearO._txBound = true; hearO.addEventListener('click', () => { this._txFromBtn = true; }, true); }
    }
    return r;
};
// 2 · the hand: the columns first, then the row's own click (one undo step, dropped if only the cursor moved)
const _txDown = D.txDown;
D.txDown = function (ev) {
    try { if (this.txIsOn() && this.txColDown(ev)) return; } catch (e) { console.warn('[texture_cols] click:', e); }
    const p = this.txCols(), snap = p ? this.txPushUndo() : null, before = p ? p.on.slice() : null;
    const r = _txDown.apply(this, arguments);
    if (p && before) { const now = new Set(p.on); const left = p.sel.filter(k => !now.has(k)); if (left.length) { p.sel = p.sel.filter(k => now.has(k)); this.txPersistSoon(); this.txRender(); } }
    this.txDropUndoIfSame(snap);
    return r;
};
['txAll', 'txCrop', 'txSnap'].forEach(name => { const orig = D[name]; if (typeof orig !== 'function') return; D[name] = function () { const s = this.txPushUndo(); const r = orig.apply(this, arguments); this.txDropUndoIfSame(s); return r; }; });
const _txDragGrip = D.txDragGrip;
D.txDragGrip = function () { this.txPushUndo(); return _txDragGrip.apply(this, arguments); };
// 3 · LINKED: after every render of the drawer the selected column(s) take its deal; after the players list alone, its ticks
const _render = D.render;
D.render = function () { const r = _render.apply(this, arguments); try { this.txWriteBack(); } catch (e) { console.warn('[texture_cols] link:', e); } return r; };
const _renderOrch = D.renderOrch;
D.renderOrch = function () { const r = _renderOrch.apply(this, arguments); try { this.txWriteBack(true); } catch (e) { console.warn('[texture_cols] ticks:', e); } return r; };
// 4 · Hear orchestrated is the COLUMN; SPACE is the rhythm. Both reach play('orch'); the button's own capture listener says which
const _play = D.play;
D.play = async function (mode) {
    const fromBtn = this._txFromBtn; this._txFromBtn = false;
    if (mode === 'orch' && this.txIsOn() && fromBtn) return this.txHearColumn();
    return _play.apply(this, arguments);   // texture_row's wrap: on a texture take → txPlay (the rhythm preview above)
};
// 4b · a take re-read: a selection that names marks the take no longer has is dropped; the undo stack is that take's
const _txLoad = D.txLoad;
D.txLoad = function () { const r = _txLoad.apply(this, arguments); try { this._txUndo = []; const p = this.txCols(); if (p && this._tx) { const keys = new Set(this._tx.dots.map(d => d.k)); p.sel = p.sel.filter(k => keys.has(k)); } } catch (e) {} return r; };
// 5 · the strike mode keeps its own ticks and its own `hear`; here `hear` is STRIKE (§228)
const _txSetMode = D.txSetMode;
D.txSetMode = function (m) {
    const was = this.txIsOn();
    if (m === 'texture' && !was) {
        this._txSavedOff = Object.assign({}, this.laneOff || {});
        this._txSavedHear = { hearMode: this.cfg.hearMode, longS: this.cfg.longS };
        this.cfg.hearMode = 'strike'; this.save(); if (typeof this.paintLongUI === 'function') try { this.paintLongUI(); } catch (e) {}
    }
    const r = _txSetMode.apply(this, arguments);
    if (m === 'strike' && was) {
        if (this._txSavedOff) { this.laneOff = this._txSavedOff; this._txSavedOff = null; if (this.strike) this.renderOrch(); }
        if (this._txSavedHear) { Object.assign(this.cfg, this._txSavedHear); this._txSavedHear = null; this.save(); if (typeof this.paintLongUI === 'function') try { this.paintLongUI(); } catch (e) {} }
    }
    return r;
};
// 6 · ESC clears the selection; CTRL+Z undoes (the row's [ · ] keys live in texture_row.js)
window.addEventListener('keydown', ev => {
    if (!D.el || D.el.style.display === 'none' || !D.txIsOn() || !D._tx) return;
    const t = ev.target; if (t && t.matches && t.matches('textarea, input, select')) return;
    if (ev.key === 'Escape') { if (D.txSel().length) D.txClearSel(); return; }   // no stopPropagation: a sound card or a takes menu closes on the same key
    if ((ev.key === 'z' || ev.key === 'Z') && (ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey) { ev.preventDefault(); ev.stopPropagation(); D.txUndo(); }
}, true);

}(typeof self !== 'undefined' ? self : this));
