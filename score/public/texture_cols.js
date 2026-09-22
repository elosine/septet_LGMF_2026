// texture_cols.js — THE COLUMNS: every ON mark of the top row orchestrated with the drawer's left side (LGMF PLAN 1m.2, 2026-09-21;
// RUNNING_LOG §224 … §233; COMPOSITION_NOTES LG-66 … LG-72). THE THIRD FORM (§232 · §233), after his *"what do we need to get this
// working right?"* — ONE RULE:
//
//   A COLUMN'S PLAYERS ARE ITS TICKS. Tick = on = dealt = sounds. One switch, shown in two places: the circles in the column and the
//   boxes in the players list (the list shows the column clicked last — the PRIMARY). A fresh column has NO players. Tick one and it
//   gets a note from the harmony at once (an unassigned pitch that fits, chosen by the seed); untick one and its note leaves — nobody
//   else moves. Shuffle re-deals the column's players. Several columns selected share the HARMONY and the SHUFFLE, each dealt on its
//   OWN players; a harmony picked or a take loaded goes to all of them, each dealt on its own players. `Hear orchestrated` = the primary
//   column's players; SPACE = the pattern; `all on` · `all off` = the column's players.
//
// Why (§232): the drawer has ONE set of ticks and they belong to the playhead, not to a strike; the columns need players of their
// own. Two earlier forms bridged that with the one drawer (§227: the circles WERE the drawer's ticks — one set for every column;
// §228 · §231: who sounds apart from the ticks — a tick then meant nothing to him). Here the drawer is a VIEW of one column at a time:
// selecting a column puts its harmony, its deal and its players on the drawer; anything done there is written back into it; the
// other columns are dealt OFFLINE by the same drawer code (`txWithColumn`), so one rule holds everywhere.
//
// A mixin on texture_row.js (a mixin on the strikes drawer); `strike_drawer.js` is not changed. A column is
//   { state: the drawer's `state()` — the harmony's id, the cfg, the voices with their players (THE DEAL) · players: [drawer rows] ·
//     notes: the deal as notes, each player · pitch once · take: the name of the harmony take it came from }
// remembered with the pattern (localStorage, as 1m.1). `hear` is STRIKE here (§228 · §230). UNDO: ↶ · CTRL+Z (§228).
//
// 1m.3 DURATION (§234 … §237, LG-73): every note has a length he chose, or THE STANDARD SHORT — `short` in the bar, 120 ms, kept with
// the pattern — for the column notes, the claves, and the drawer's `hear: strike` while a texture take is on (so the column preview
// and the pattern agree; the strike mode keeps the strike's own lengths; `long tone` is long_tone_ui's and still wins). A column takes
// a `length` in seconds from the bar (blank = the short), shared by a multi-selection as the harmony is; one player takes a length of
// their own by a DOUBLE-CLICK on their lit circle (a box on the spot; blank = the column's). Stored in the column: `len` (s) and
// `lens` {row: s}; the notes stored in a column carry NO length — it is read at play time. SEEN: from each lit circle a bar to the
// right, the note's length at the zoom; the short = the circle alone. Under the DYNAMICS LAW these stay STRUCK notes held N seconds.
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
const ANCHOR_MF = 100, SHORT_MS = 120, SHORT_MIN = 10, SHORT_MAX = 5000, LEN_MIN = 0.01, LEN_MAX = 600;   // 1m.3: the standard short (ms) and a length's bounds (s)
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const ON_COL = '#E8CF9A', OFF_FILL = '#55555f', SEL_BG = 'rgba(201,160,90,.16)', SEL_LINE = '#C9A05A';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
const NOT_APPLIED = ['hearMode', 'longS'];   // the drawer's `hear` menu is the page's, not a column's
const rowOf = n => (n.row != null ? n.row : n.lane);
const lcg = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const shuffled = (a, rnd) => { const o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
const SHARED = st => (st ? st.strikeId + '|' + (st.cfg && st.cfg.oSeedShuffle) : '');   // what a multi-selection shares: the harmony and the shuffle
const isEnter = ev => ev.key === 'Enter' || ev.code === 'Enter' || ev.code === 'NumpadEnter' || ev.keyCode === 13;   // by name or by code: an automated key can come with no name
const isEsc = ev => ev.key === 'Escape' || ev.code === 'Escape' || ev.keyCode === 27;

Object.assign(D, {
    _txApplying: false, _txFromBtn: false, _txSavedOff: null, _txSavedHear: null, _txPersistT: null, _txUndo: [], _txHearSet: false, _txHeld: null,   // _txHeld: the column the drawer shows now (set by a recall) — the only one written back

    // the pattern's columns and selection — older forms brought forward: `on` (§228) or `off` (§227) → `players`, the deal cut to them
    txCols() {
        const p = this.txPat(); if (!p) return null;
        if (!p.cols) p.cols = {}; if (!Array.isArray(p.sel)) p.sel = [];
        Object.keys(p.cols).forEach(k => {
            const c = p.cols[k]; if (!c || Array.isArray(c.players)) return;
            const all = TRK().map((t, i) => i);
            c.players = Array.isArray(c.on) ? c.on.slice() : Array.isArray(c.off) ? all.filter(i => !c.off.includes(i)) : [];
            const keep = new Set(c.players);
            if (c.state && Array.isArray(c.state.voices)) c.state.voices.forEach(v => { if (v.lane >= 0 && !keep.has(v.lane)) { v.lane = -1; v.fold = 0; v.standIn = null; v.skip = false; v.piano = false; } v.also = (v.also || []).filter(r => keep.has(r.lane)); });
            c.notes = (c.notes || []).filter(n => keep.has(n.row));
            delete c.on; delete c.off;
        });
        if (p.lenV !== 1) { Object.keys(p.cols).forEach(k => { const c = p.cols[k]; ((c && c.notes) || []).forEach(n => { delete n.durMs; }); }); p.lenV = 1; }   // 1m.3: a stored note carries no length — it is read at play time
        return p;
    },
    txSel() { const p = this.txCols(); return p ? p.sel : []; },
    txPrimary() { const p = this.txCols(); return p && p.sel.length ? p.sel[0] : null; },
    txClavesOn() { return this._txS.claves !== false; },
    txPersistSoon() { clearTimeout(this._txPersistT); this._txPersistT = setTimeout(() => this.txPersist(), 150); },
    txTakeName() { const b = this.el && this.el.querySelector('#skTakeName'); return b ? String(b.value || '').trim() : ''; },
    txSetTakeName(v) { const b = this.el && this.el.querySelector('#skTakeName'); if (b) b.value = v || ''; },
    // `hear` = STRIKE while a texture take is on the page (§228 · §230)
    txHearStrike() {
        if (this._txHearSet) return; this._txHearSet = true;
        if (!this._txSavedHear) this._txSavedHear = { hearMode: this.cfg.hearMode, longS: this.cfg.longS };
        if (this.cfg.hearMode !== 'strike') { this.cfg.hearMode = 'strike'; this.save(); }
        if (typeof this.paintLongUI === 'function') try { this.paintLongUI(); } catch (e) {}
    },
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

    // ---------------------------------------------------------------- duration (1m.3)
    txShortMs() { const p = this.txPat(), v = p ? +p.short : NaN; return isFinite(v) && v > 0 ? v : SHORT_MS; },
    // a player's length in a column: their own (`lens`) over the column's (`len`); null = the standard short
    txLenS(c, lane) {
        const o = c && c.lens ? +c.lens[lane] : NaN; if (isFinite(o) && o > 0) return { s: o, own: true };
        const l = c ? +c.len : NaN; if (isFinite(l) && l > 0) return { s: l, own: false };
        return null;
    },
    txLenMs(c, lane) { const l = this.txLenS(c, lane); return l ? Math.round(l.s * 1000) : this.txShortMs(); },
    txLenWord(c, lane) { const l = this.txLenS(c, lane); return l ? l.s + ' s' + (l.own ? ' (their own)' : '') : 'the short, ' + this.txShortMs() + ' ms'; },
    txSetShort(raw) {
        const p = this.txPat(); if (!p) return;
        const s = String(raw == null ? '' : raw).trim(), v = s === '' ? SHORT_MS : clamp(Math.round(+s) || SHORT_MS, SHORT_MIN, SHORT_MAX);
        if (v === SHORT_MS) delete p.short; else p.short = v;
        this.txPersist(); this.txRender(); this.setStatus('the standard short: ' + v + ' ms — every note where nothing longer is set, the claves, and hear: strike');
    },
    // `length` for the SELECTED column(s): blank = the short; seconds otherwise — set with several selected → all of them
    txSetLen(raw) {
        const p = this.txCols(); if (!p || !p.sel.length) { this.txPaintLenUI(); this.setStatus('select a column first — length is the selected column(s)\'', true); return; }
        const s = String(raw == null ? '' : raw).trim(), v = s === '' ? null : clamp(+s, LEN_MIN, LEN_MAX);
        if (s !== '' && !(v > 0)) { this.txPaintLenUI(); this.setStatus('length: seconds, or blank for the short', true); return; }
        this.txPushUndo();
        p.sel.forEach(k => { const c = p.cols[k]; if (!c) return; if (v == null) delete c.len; else c.len = v; });
        this.txPersistSoon(); this.txRender();
        this.setStatus((p.sel.length === 1 ? 'the column at ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : p.sel.length + ' columns') + (v == null ? ': the short again (' + this.txShortMs() + ' ms)' : ': ' + v + ' s — a player\'s own length still stands over it'));
    },
    // one player's own length in one column: blank = the column's
    txSetOverride(k, lane, raw) {
        const p = this.txCols(), c = p && p.cols[k], t = TRK()[lane]; if (!c || !t) return;
        const s = String(raw == null ? '' : raw).trim(), v = s === '' ? null : clamp(+s, LEN_MIN, LEN_MAX);
        if (s !== '' && !(v > 0)) { this.setStatus('a length of their own: seconds, or blank for the column\'s', true); return; }
        this.txPushUndo();
        if (v == null) this.txClearOverride(c, lane); else { c.lens = c.lens || {}; c.lens[lane] = v; }
        this.txPersistSoon(); this.txRender();
        this.setStatus(t.label + ' at ' + this.txDot(k).t.toFixed(2) + ' s: ' + (v == null ? 'the column\'s length again (' + this.txLenWord(c, lane) + ')' : v + ' s, their own'));
    },
    txClearOverride(c, lane) { if (c && c.lens) { delete c.lens[lane]; if (!Object.keys(c.lens).length) delete c.lens; } },
    // the box on the spot (a double-click on a lit circle): ENTER or leaving it sets, ESC leaves it as it was
    txOpenLenBox(k, lane, cx, cy) {
        this.txCloseLenBox();
        const view = this.el && this.el.querySelector('#txView'), p = this.txCols(), c = p && p.cols[k], t = TRK()[lane]; if (!view || !c || !t) return;
        const own = c.lens ? +c.lens[lane] : NaN, col = +c.len;
        const box = document.createElement('input'); box.id = 'txLenBox'; box.type = 'number'; box.step = '0.05'; box.min = LEN_MIN; box.max = LEN_MAX;
        box.value = isFinite(own) && own > 0 ? own : ''; box.placeholder = isFinite(col) && col > 0 ? col + ' s' : 'short';
        box.title = t.label + ' at ' + this.txDot(k).t.toFixed(2) + ' s — a length of their own, in seconds; blank = the column\'s. ENTER sets · ESC leaves it';
        box.style.cssText = 'position:absolute;left:' + Math.round(cx + CIRC_R + 4) + 'px;top:' + Math.round(cy - 9) + 'px;width:56px;z-index:3;' + INP;
        view.appendChild(box);
        let done = false;
        const end = ok => { if (done) return; done = true; const v = box.value; box.remove(); if (ok) this.txSetOverride(k, lane, v); else this.setStatus(t.label + ': length left as it was'); };
        box.addEventListener('keydown', ev => { ev.stopPropagation(); if (isEnter(ev)) { ev.preventDefault(); end(true); } else if (isEsc(ev)) { ev.preventDefault(); end(false); } });
        box.addEventListener('blur', () => end(true));
        box.focus(); box.select();
        this.setStatus(t.label + ' at ' + this.txDot(k).t.toFixed(2) + ' s — their own length in seconds; blank = the column\'s (' + this.txLenWord(c, -1) + ')');
    },
    txCloseLenBox() { const b = this.el && this.el.querySelector('#txLenBox'); if (b) b.remove(); },
    // the bar's two boxes follow the pattern and the selection
    txPaintLenUI() {
        const sb = this.el && this.el.querySelector('#txShort'), lb = this.el && this.el.querySelector('#txLen'); if (!sb || !lb || !this.txIsOn()) return;
        const p = this.txCols(), k = this.txPrimary(), c = p && k ? p.cols[k] : null, l = c ? +c.len : NaN;
        if (document.activeElement !== sb) sb.value = this.txShortMs();
        lb.disabled = !k; lb.style.opacity = k ? '' : 0.45;
        if (document.activeElement !== lb) lb.value = isFinite(l) && l > 0 ? l : '';
        lb.placeholder = k ? 'short' : '—';
        lb.title = 'the length of the SELECTED column(s), in seconds — blank: the standard short; set with several selected, all of them take it' + (p && p.sel.length > 1 ? ' (' + p.sel.length + ' selected; the box shows the first)' : '') + '. A player\'s own length (double-click their circle) stands over it';
    },

    // ---------------------------------------------------------------- undo (§228)
    txUndoSnap() { const p = this.txCols(); return p ? JSON.stringify({ on: p.on, cols: p.cols, sel: p.sel, range: p.range }) : null; },
    txPushUndo() { const s = this.txUndoSnap(); if (s == null) return null; if (this._txUndo[this._txUndo.length - 1] !== s) { this._txUndo.push(s); if (this._txUndo.length > UNDO_MAX) this._txUndo.shift(); } return s; },
    txDropUndoIfSame(s) { if (s != null && this._txUndo.length && this._txUndo[this._txUndo.length - 1] === s && this.txUndoSnap() === s) this._txUndo.pop(); },
    txRestore(s) {
        const p = this.txCols(); if (!p) return;
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        const o = JSON.parse(s); p.on = o.on; p.cols = o.cols; p.sel = o.sel; p.range = o.range;
        if (p.sel.length && p.cols[p.sel[0]]) this.txRecall(p.sel[0], true);
        this.txPersistSoon(); this.txRender();
    },
    txUndo() {
        const p = this.txCols(); if (!p) return;
        const now = this.txUndoSnap(); let s = this._txUndo.pop(); if (s === now) s = this._txUndo.pop();
        if (s == null) { this.setStatus('nothing to undo'); return; }
        this.txRestore(s); this.setStatus('undone · ' + this._txUndo.length + ' more');
    },
    // the last change taken back exactly — the second press of a double-click undoes the first press's tick (1m.3)
    txRevertLast() {
        const now = this.txUndoSnap(), top = this._txUndo[this._txUndo.length - 1]; if (top == null || top === now) return false;
        while (this._txUndo.length && this._txUndo[this._txUndo.length - 1] === top) this._txUndo.pop();
        this.txRestore(top); return true;
    },

    // ---------------------------------------------------------------- the drawer as a VIEW of one column
    txPlayersNow() { const off = this.laneOff || {}; return TRK().map((t, i) => i).filter(i => !off[i]); },
    txSetPlayersNow(players) { const keep = new Set(players || []); this.laneOff = {}; TRK().forEach((t, i) => { if (!keep.has(i)) this.laneOff[i] = true; }); },
    txColNotes() {   // the deal as notes: each player · pitch once, no timing
        if (!this.strike) return [];
        const seen = new Set(), out = [];
        let ns = []; try { ns = this.notesFor('orch') || []; } catch (e) { ns = []; }
        ns.forEach(n => { const k = rowOf(n) + '|' + n.tech + '|' + n.midi; if (seen.has(k)) return; seen.add(k); const o = Object.assign({}, n, { row: rowOf(n), onMs: 0 }); delete o.durMs; out.push(o); });   // 1m.3: no length stored — read at play time
        return out;
    },
    txCapture() { return { state: this.state(), players: this.txPlayersNow(), notes: this.txColNotes(), take: this.txTakeName() }; },
    txClearedState() { const st = this.state(); (st.voices || []).forEach(v => { v.lane = -1; v.also = []; v.fold = 0; v.standIn = null; v.skip = false; v.piano = false; }); return st; },
    txFresh() { return { state: this.txClearedState(), players: [], notes: [], take: this.txTakeName() }; },
    // RECALL: a column onto the drawer — its harmony and deal (`applyState`, the take machinery), its players as the ticks, its take's name
    txRecall(k, quiet) {
        const p = this.txCols(), c = p && p.cols[k]; if (!c) return false;
        if (!c.state || !this.strikeById(c.state.strikeId)) { this.setStatus('that column\'s harmony is no longer in this score\'s list — pick one and shuffle', true); return false; }
        this._txApplying = true;
        try { if (!quiet) this.snapshot(); this.txSetPlayersNow(c.players); this.applyState(c.state); this.txSetTakeName(c.take); this._txHeld = k; }
        finally { this._txApplying = false; }
        if (!quiet) this.txWriteBack();
        return true;
    },
    // ANY column worked on by the drawer's own code, OFFLINE: the drawer takes the column (or `base`, another column's harmony) with the
    // column's players, `fn` runs on it, the result is stored, and the drawer is put back as it was. One rule for every column.
    txWithColumn(k, fn, base) {
        const p = this.txCols(), c = p && p.cols[k]; if (!c) return false;
        const st = base || c.state; if (!st || !this.strikeById(st.strikeId)) return false;
        const saved = this.strike ? { state: this.state(), off: Object.assign({}, this.laneOff), take: this.txTakeName() } : null;
        this._txApplying = true;
        try {
            this.txSetPlayersNow(c.players); this.applyState(st);
            fn.call(this, c);
            const cap = this.txCapture(); c.state = cap.state; c.players = cap.players; c.notes = cap.notes; if (!base) c.take = cap.take;
        } finally {
            if (saved) { this.laneOff = saved.off; this.applyState(saved.state); this.txSetTakeName(saved.take); }
            this._txApplying = false;
        }
        return true;
    },
    // THE MINI-DEAL: one player ticked → an unassigned pitch of the harmony that fits (in range first, folded if `may fold`), chosen by
    // the seed; none free → a pitch already held is doubled. Nobody else moves. Answers the voice, or null with nothing changed.
    txDealTo(lane) {
        const rnd = lcg((+this.cfg.oSeedShuffle || 1) * 7919 + lane * 31 + 1);
        const free = shuffled(this.voices.filter(v => v.lane < 0 && !v.piano), rnd);
        const tryOn = v => { this.assign(v, lane); if (!v.skip && (v.fold === 0 || this.cfg.mayFold)) return true; v.lane = -1; v.fold = 0; v.standIn = null; v.skip = false; return false; };
        for (const v of free) if (tryOn(v)) return v;
        const held = shuffled(this.voices.filter(v => v.lane >= 0 && v.lane !== lane && !this.reals(v).some(r => r.lane === lane)), rnd);
        for (const v of held) {
            const r = { lane, tech: this.defaultTech(lane), fold: 0, standIn: null, skip: false }; v.also = v.also || []; v.also.push(r);
            if (this.fitReal(v, r) && !r.skip && (r.fold === 0 || this.cfg.mayFold)) return v;
            v.also.pop();
        }
        return null;
    },
    txDropLane(lane) { this.onLane(lane).slice().forEach(({ v, r }) => this.dropReal(v, r)); },   // the player's notes leave; nobody else moves
    txOnDrawer(k) { const p = this.txCols(); return k === this.txPrimary() && !!this.strike && !!p.cols[k] && this.strike.id === (p.cols[k].state || {}).strikeId; },
    // TICK: a player of one column on or off — on the drawer when the column is the primary, offline otherwise; the selection untouched
    txTick(k, lane, on) {
        const p = this.txCols(); if (!p) return;
        const T = TRK(), t = T[lane]; if (!t) return;
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        this.txPushUndo();
        if (!p.cols[k]) { if (!this.strike) { this.setStatus('load a harmony first — a column is orchestrated from one', true); return; } p.cols[k] = this.txFresh(); }
        let dealt = null, word = '';
        const fn = function (c) {
            if (on) { delete this.laneOff[lane]; dealt = this.txDealTo(lane); if (!dealt) word = ' — no pitch of this harmony fits ' + t.label + ' (may fold, or another harmony)'; }
            else { this.laneOff[lane] = true; this.txDropLane(lane); this.txClearOverride(c, lane); }   // 1m.3: their own length leaves with them
        };
        if (this.txOnDrawer(k)) { fn.call(this, p.cols[k]); this.save(); this.render(); }   // the render writes it back
        else if (!this.txWithColumn(k, fn)) { this.setStatus('that column\'s harmony is no longer in this score\'s list — select it, pick one and shuffle', true); return; }
        this.txPersistSoon(); this.txRender();
        this.setStatus(t.label + (on ? ' on' : ' off') + ' at ' + this.txDot(k).t.toFixed(2) + ' s' + (on && dealt ? ' · ' + nm(dealt.pitch) : '') + word);
    },
    txAllPlayers(on) {
        const k = this.txPrimary(); if (!k) { this.setStatus('select a column first', true); return; }
        const p = this.txCols(); this.txPushUndo();
        if (!p.cols[k]) p.cols[k] = this.txFresh();
        const fn = function (c) { TRK().forEach((t, lane) => { if (on) { delete this.laneOff[lane]; this.txDealTo(lane); } else { this.laneOff[lane] = true; this.txDropLane(lane); this.txClearOverride(c, lane); } }); };
        if (this.txOnDrawer(k)) { fn.call(this, p.cols[k]); this.save(); this.render(); }
        else this.txWithColumn(k, fn);
        this.txPersistSoon(); this.txRender(); this.setStatus(on ? 'every player on in this column, each dealt a pitch that fits' : 'every player off in this column');
    },
    // LINKED: after every render of the drawer the PRIMARY column takes the drawer as it stands; what a multi-selection SHARES (the
    // harmony, the shuffle, a take loaded) goes to the other selected columns, each dealt on its own players
    txWriteBack() {
        if (!this.txIsOn() || !this._tx || this._txApplying || !this.strike) return;
        const p = this.txCols(), k = this.txPrimary(); if (!p || !k || this._txHeld !== k) return;   // the drawer must be SHOWING the primary
        const prev = p.cols[k], cap = this.txCapture();
        // a harmony picked in the list leaves every voice unassigned: the column's players are dealt it at once
        if (prev && prev.state && prev.state.strikeId !== cap.state.strikeId && cap.players.length && !(this.voices || []).some(v => v.lane >= 0)) {
            this.txSetPlayersNow(cap.players); this.shuffleOrch(); this._txApplying = true; try { this.render(); } finally { this._txApplying = false; }
            Object.assign(cap, this.txCapture());
        }
        // a take loaded is a deal on ITS players: the ticks follow it
        if (prev && prev.take !== cap.take && cap.take) {
            const played = new Set(); (this.voices || []).forEach(v => this.reals(v).forEach(r => { if (r.lane >= 0) played.add(r.lane); }));
            if (played.size) { this.txSetPlayersNow([...played]); this._txApplying = true; try { this.renderOrch(); } finally { this._txApplying = false; } cap.players = this.txPlayersNow(); }
        }
        const next = Object.assign({}, prev || {}, cap);
        if (JSON.stringify(next) === JSON.stringify(prev)) return;
        const before = this.txUndoSnap(); this._txUndo.push(before); if (this._txUndo.length > UNDO_MAX) this._txUndo.shift();
        p.cols[k] = next;
        const shareMoved = !prev || SHARED(prev.state) !== SHARED(next.state) || prev.take !== next.take;
        if (shareMoved && p.sel.length > 1) {
            const base = next.state;
            p.sel.slice(1).forEach(kk => { if (!p.cols[kk]) p.cols[kk] = this.txFresh(); this.txWithColumn(kk, function () { this.shuffleOrch(); }, base); p.cols[kk].take = next.take; });
        }
        this.txPersistSoon(); this.txRender();
    },
    // SELECT: plain = this column alone, recalled (a fresh one: the harmony with nobody on) · shift = added, kept as it is until the
    // next shuffle or harmony, which it then shares
    txSelect(k, add) {
        const p = this.txCols(); if (!p) return;
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        this.txPushUndo();
        if (add && p.sel.length) {
            const at = p.sel.indexOf(k);
            if (at >= 0) { p.sel.splice(at, 1); if (at === 0 && p.sel.length) this.txRecall(p.sel[0], true); this.txPersistSoon(); this.txRender(); this.setStatus('column at ' + this.txDot(k).t.toFixed(2) + ' s left the selection · ' + p.sel.length + ' selected'); return; }
            if (!p.cols[k]) p.cols[k] = this.txFresh();
            p.sel.push(k); this.txPersistSoon(); this.txRender(); this.setStatus(this.txColLine()); return;
        }
        p.sel = [k];
        if (!p.cols[k]) { if (!this.strike) { this.setStatus('load a harmony first — a column is orchestrated from one', true); p.sel = []; return; } p.cols[k] = this.txFresh(); }
        if (!this.txRecall(k)) this.txRender();
        this.txPersistSoon(); this.txRender(); this.setStatus(this.txColLine());
    },
    txClearSel() { const p = this.txCols(); if (!p || !p.sel.length) return; this.txPushUndo(); p.sel = []; this._txHeld = null; this.txPersistSoon(); this.txRender(); this.setStatus('no column selected — the drawer is on its own'); },
    txDot(k) { return this._tx.dots.find(d => d.k === k) || { t: 0 }; },
    txColLine() {
        const p = this.txCols(), T = TRK(); if (!p.sel.length) return 'no column selected';
        const c = p.cols[p.sel[0]], who = c ? (c.notes || []).map(n => (T[n.row] ? T[n.row].short : '?') + ' ' + nm(n.midi)).join(' · ') : '';
        const len = c && isFinite(+c.len) && +c.len > 0 ? ' · length ' + c.len + ' s' : '', own = c && c.lens && Object.keys(c.lens).length ? ' · ' + Object.keys(c.lens).length + ' with a length of their own' : '';
        return (p.sel.length === 1 ? 'column at ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : p.sel.length + ' columns') + ' selected — the drawer is theirs' + (c && c.take ? ' · take ' + c.take : '') + len + own + (who ? ' · ' + who : ' · nobody on yet: tick players');
    },

    // ---------------------------------------------------------------- the drawing, over the row's
    txRenderCols() {
        const svg = this.el && this.el.querySelector('#txSvg'), run = svg && svg.querySelector('#txRun'); if (!svg || !run || !this._tx) return;
        const p = this.txCols(), T = TRK(), W = this.txW(), H = this.txH(), ys = this.txRowsY(), mw = this.txMarkW(), sel = new Set(p.sel), on = new Set(p.on), px = this._txV ? this._txV.px : 0;
        const bw = Math.max(mw, BAND_MIN); let bands = '', bars = '', circs = '';
        this._tx.dots.forEach(d => {
            if (!on.has(d.k)) return;
            const x = this.txX(d.t), cx = x + mw / 2, x0 = cx - bw / 2; if (x0 > W + bw || x0 + bw < -bw) return;
            const c = p.cols[d.k], isSel = sel.has(d.k), players = new Set(c ? c.players : []);
            bands += '<rect class="txCol" data-k="' + d.k + '" x="' + x0.toFixed(1) + '" y="' + COL_TOP + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, H - COL_TOP) + '" fill="' + (isSel ? SEL_BG : 'rgba(255,255,255,.02)') + '" stroke="' + (isSel ? SEL_LINE : 'none') + '" stroke-width="1"/>';
            ys.forEach((cy, lane) => {
                const t = T[lane], isOn = players.has(lane), mine = c ? (c.notes || []).filter(n => n.row === lane) : [], L = isOn && mine.length ? this.txLenS(c, lane) : null;
                // 1m.3: a length set = a bar to the right, the note's length at the zoom (a player's own outlined); the short = the circle alone
                if (L) { const w = Math.min(Math.max(1, L.s * px), W - cx + 12); bars += '<rect class="txLen" x="' + cx.toFixed(1) + '" y="' + (cy - 3).toFixed(1) + '" width="' + w.toFixed(1) + '" height="6" rx="2" fill="' + ON_COL + '" fill-opacity="' + (L.own ? 0.5 : 0.3) + '" stroke="' + (L.own ? ON_COL : 'none') + '" stroke-width="1" pointer-events="none"/>'; }
                const title = (t ? t.label : 'row ' + lane) + ' · ' + d.t.toFixed(2) + ' s · ' + (isOn ? 'ON' : 'off') + (!c ? ' · no column yet' : mine.length ? ' · ' + mine.map(n => nm(n.midi) + (n.cents ? (n.cents > 0 ? ' +' : ' ') + Math.round(n.cents) + '¢' : '')).join(' ') + ' · ' + this.txLenWord(c, lane) + ' · double-click: a length of their own' : isOn ? ' · no pitch fits (may fold, or another harmony)' : '');
                circs += '<circle class="txCirc" data-k="' + d.k + '" data-lane="' + lane + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + CIRC_R + '" fill="' + (isOn ? (mine.length ? ON_COL : 'none') : OFF_FILL) + '" stroke="' + (isOn ? ON_COL : OFF_FILL) + '" stroke-width="1.3" style="cursor:pointer"><title>' + escH(title) + '</title></circle>';
            });
        });
        run.insertAdjacentHTML('beforebegin', bands + bars + circs);
        const i = this.el.querySelector('#txI'); if (i && p.sel.length) i.title = this.txColLine() + String.fromCharCode(10) + i.title;
        this.txPaintLenUI();
    },

    // ---------------------------------------------------------------- the hand
    // a click in the columns' area: on a circle = that player of that column · in a column's band = select (SHIFT: add) · else the row's own
    txColHit(ev) {   // what is under the pointer in the columns' area: the nearest ON mark's column, and the player's row if on a circle
        const svg = this.el.querySelector('#txSvg'), rect = svg.getBoundingClientRect(), x = ev.clientX - rect.left, y = ev.clientY - rect.top;
        if (y < COL_TOP) return null;
        const p = this.txCols(), mw = this.txMarkW(), bw = Math.max(mw, BAND_MIN), on = new Set(p.on);
        let best = null, bd = 1e9;
        this._tx.dots.forEach(d => { if (!on.has(d.k)) return; const dx = Math.abs(x - (this.txX(d.t) + mw / 2)); if (dx < bd) { bd = dx; best = d; } });
        if (!best || bd > Math.max(PICK_PX, bw / 2)) return null;
        const ys = this.txRowsY(); let lane = -1; ys.forEach((cy, i) => { if (Math.abs(y - cy) <= CIRC_R + 3) lane = i; });
        return { d: best, lane, cx: this.txX(best.t) + mw / 2, cy: lane >= 0 ? ys[lane] : y };
    },
    // the circle the FIRST press of a double-click landed on, kept for the second press and the `dblclick`: a tick re-renders the
    // drawer and the list's rows change height, so the circle has moved under the pointer by then
    txLastCirc() { const h = this._txLastCirc; return h && performance.now() - h.at < 700 ? h : null; },
    txColDown(ev) {
        if (!this._tx || ev.button !== 0) return false;
        const hit = this.txColHit(ev), last = this.txLastCirc();
        if (!hit && !(last && ev.detail >= 2)) return false;
        ev.preventDefault();
        // 1m.3: THE SECOND PRESS of a double-click takes the first press's tick back and opens the length box HERE. No `click` or
        // `dblclick` follows a press on a circle: the first press re-drew the columns, so the circle the mouse went down on has left
        // the DOM, and Chrome fires no click for it (his report — *"double click on players circle just toggles it on and off"*)
        if (ev.detail >= 2) { if (ev.detail === 2 && last) { this._txLastCirc = null; this.txRevertLast(); this.txOwnLength(last.k, last.lane); } return true; }
        if (hit.lane >= 0) { this._txLastCirc = { k: hit.d.k, lane: hit.lane, at: performance.now() }; const c = this.txCols().cols[hit.d.k]; this.txTick(hit.d.k, hit.lane, !(c && c.players.includes(hit.lane))); return true; }
        this._txLastCirc = null;
        this.txSelect(hit.d.k, !!ev.shiftKey);
        return true;
    },
    // that player's own length in that column — the box on the spot, where the circle is NOW (after the revert's redraw)
    txOwnLength(k, lane) {
        const c = this.txCols().cols[k], t = TRK()[lane];
        if (!c || !c.players.includes(lane)) { this.setStatus((t ? t.label : 'that player') + ' is off in this column — tick them first, then double-click for a length of their own', true); return; }
        const ys = this.txRowsY(), d = this.txDot(k);
        this.txOpenLenBox(k, lane, this.txX(d.t) + this.txMarkW() / 2, ys[lane] != null ? ys[lane] : COL_TOP);
    },
    // a browser that does send the `dblclick` (one that fires a click for a re-drawn target): nothing more once the box is open
    txColDbl(ev) {
        if (!this._tx || !this.txIsOn()) return false;
        if (this.el.querySelector('#txLenBox')) { ev.preventDefault(); ev.stopImmediatePropagation(); return true; }
        const hit = this.txColHit(ev); if (!hit || hit.lane < 0) return false;
        ev.preventDefault(); ev.stopImmediatePropagation(); this.txOwnLength(hit.d.k, hit.lane);
        return true;
    },

    // ---------------------------------------------------------------- the ear
    async txPlay() {   // THE RHYTHM PREVIEW
        if (!this._tx) { this.setStatus('choose a rhythm take first', true); return; }
        const p = this.txCols(), r = this.txRange(), on = new Set(p.on), lane = this.txPercLane(), claves = this.txClavesOn();
        const T = root.TexturePanel, cl = (T && T.CLAVES) || { tech: 'toys_claves', midi: 41 };
        const c0 = +p.cursor || 0, from = (c0 > r[0] && c0 < r[1]) ? c0 : r[0];
        const dots = this._tx.dots.filter(d => on.has(d.k) && d.t >= from - 1e-6 && d.t <= r[1] + 1e-6);
        if (!dots.length) { this.setStatus(p.on.length ? 'no ON mark between ' + from.toFixed(2) + ' s and ' + r[1].toFixed(2) + ' s — move the cursor or the range' : 'every mark is off — click some on (or all on)', true); return; }
        const notes = [], short = this.txShortMs(); let pitched = 0, bare = 0;
        dots.forEach(d => {
            const onMs = Math.round((d.t - from) * 1000), c = p.cols[d.k], mine = c ? (c.notes || []) : [];
            mine.forEach(n => notes.push(Object.assign({}, n, { onMs, durMs: this.txLenMs(c, n.row) })));   // 1m.3: the column's length, a player's own over it, else the short
            if (mine.length) pitched++; else bare++;
            if (claves && lane >= 0) notes.push({ lane, tech: cl.tech, midi: cl.midi, vel: ANCHOR_MF, cents: 0, onMs, durMs: short });
        });
        if (!notes.length) { this.setStatus('nothing to hear: no column has a player on and the claves are off', true); return; }
        await this.playNotes(notes, 'the rhythm · ' + pitched + ' marks with players · ' + bare + ' bare' + (claves ? ' · the claves under them' : '') + ' · short ' + short + ' ms · from ' + from.toFixed(2) + ' s');
        const e = E_(); if (e && e._playing) this.txStartRun(from, r[1]);
    },
    async txHearColumn() {   // THE COLUMN PREVIEW: the primary column's players, read from the drawer LIVE (the `hear` menu applies at once)
        const k = this.txPrimary();
        if (!this.strike) { this.setStatus('load a harmony first — a column is orchestrated from one', true); return; }
        const seen = new Set(), all = [];
        (this.notesFor('orch') || []).forEach(n => { const row = rowOf(n), key = row + '|' + n.tech + '|' + n.midi; if (seen.has(key)) return; seen.add(key); all.push(Object.assign({}, n, { row, onMs: 0, durMs: Math.max(30, +n.durMs || 0) })); });   // 1m.3: the lengths come through notesFor (hook 7) — the column's, or the short; `long tone` its own
        if (!all.length) { this.setStatus(k ? 'nobody is on in this column — tick players' : 'nothing dealt — tick players and shuffle', true); return; }
        return this.playNotes(all, k ? 'the column at ' + this.txDot(k).t.toFixed(2) + ' s · ' + all.length + ' players' : 'the deal · ' + all.length);
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · the drawing: the columns over the row's; the `claves` toggle and ↶ in the bar; the players list's tick boxes
const _txRender = D.txRender;
D.txRender = function () { const r = _txRender.apply(this, arguments); try { this.txRenderCols(); this.txPaintLenUI(); } catch (e) { console.warn('[texture_cols] render:', e); } return r; };
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
        // 1m.3: `short` (ms, the pattern's) and `length` (s, the selected column(s)') beside the claves; ENTER sets, ESC puts the value back
        const len = document.createElement('span'); len.className = 'txOnly'; len.style.cssText = 'display:inline-flex;align-items:center;gap:6px';
        len.innerHTML = '<label style="display:inline-flex;align-items:center;gap:3px" title="THE STANDARD SHORT (1m.3): the length of every note where nothing longer is set — the column notes, the claves, and hear: strike while a texture take is on. 120 ms unless you say; kept with the pattern"><span style="color:#9a9">short</span><input id="txShort" type="number" min="' + SHORT_MIN + '" max="' + SHORT_MAX + '" step="10" style="' + INP + ';width:46px"><span style="color:#777">ms</span></label>' +
            '<label style="display:inline-flex;align-items:center;gap:3px"><span style="color:#9a9">length</span><input id="txLen" type="number" min="' + LEN_MIN + '" max="' + LEN_MAX + '" step="0.1" style="' + INP + ';width:52px" placeholder="short"><span style="color:#777">s</span></label>';
        bar.insertBefore(len, zoom);
        const sb = len.querySelector('#txShort'), lb = len.querySelector('#txLen');
        sb.addEventListener('change', e => this.txSetShort(e.target.value));
        lb.addEventListener('change', e => this.txSetLen(e.target.value));
        [sb, lb].forEach(b => b.addEventListener('keydown', ev => { ev.stopPropagation(); if (isEnter(ev)) { ev.preventDefault(); b.blur(); } else if (isEsc(ev)) { ev.preventDefault(); this.txPaintLenUI(); b.blur(); } }));
        const svg = this.el.querySelector('#txSvg');
        if (svg && !svg._txColDbl) { svg._txColDbl = true; svg.addEventListener('dblclick', ev => { try { this.txColDbl(ev); } catch (e) { console.warn('[texture_cols] dblclick:', e); } }); }
        const hearO = this.el.querySelector('#skHearO'); if (hearO && !hearO._txBound) { hearO._txBound = true; hearO.addEventListener('click', () => { this._txFromBtn = true; }, true); }
        // the players list's tick boxes, while a texture take is on and a column is selected, are the column's players (rule 4): one
        // rule, not the drawer's own untick (which moves a note to another player)
        const orch = this.el.querySelector('#skOrch');
        if (orch && !orch._txBound) { orch._txBound = true; orch.addEventListener('click', ev => {
            const cb = ev.target && ev.target.closest && ev.target.closest('.skTick'); if (!cb || !this.txIsOn() || !this.txPrimary()) return;
            ev.preventDefault(); ev.stopImmediatePropagation();
            const lane = +cb.dataset.lane, c = this.txCols().cols[this.txPrimary()];
            this.txTick(this.txPrimary(), lane, !(c && c.players.includes(lane)));
        }, true); }
    }
    return r;
};
// 1b · the mode on the page: a texture take active (at load as on the switch) → `hear` is strike
const _txApply = D.txApply;
D.txApply = function () { const r = _txApply.apply(this, arguments); try { if (this.txIsOn()) this.txHearStrike(); } catch (e) {} return r; };
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
// 3 · LINKED: after every render of the drawer the primary column takes it, and what is shared goes to the others
const _render = D.render;
D.render = function () { const r = _render.apply(this, arguments); try { this.txWriteBack(); } catch (e) { console.warn('[texture_cols] link:', e); } return r; };
// 3b · `all on` · `all off` for the ticks in the orchestration panel: the column's players while a column is selected, the drawer's
//      own ticks otherwise (§231)
const _renderOrch = D.renderOrch;
D.renderOrch = function () {
    const r = _renderOrch.apply(this, arguments);
    try {
        const fc = this.el && this.el.querySelector('#skFreeCount');
        if (fc && !fc.parentNode.querySelector('#skTickAll')) {
            const b = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
            const span = document.createElement('span'); span.style.cssText = 'display:inline-flex;gap:4px;margin-left:6px';
            span.innerHTML = '<button id="skTickAll" style="' + b + '" title="tick every player (in a column: every player on, each dealt a pitch that fits)">all on</button><button id="skTickNone" style="' + b + '" title="untick every player (in a column: every player off; in the strike mode their notes fall silent now — back undoes it)">all off</button>';
            fc.parentNode.insertBefore(span, fc.nextSibling);
            span.querySelector('#skTickAll').addEventListener('click', () => { if (this.txIsOn() && this.txPrimary()) return this.txAllPlayers(true); this.laneOff = {}; this.renderOrch(); this.setStatus('every player ticked'); });
            span.querySelector('#skTickNone').addEventListener('click', () => {
                if (this.txIsOn() && this.txPrimary()) return this.txAllPlayers(false);
                this.snapshot(); TRK().forEach((t, l) => { this.laneOff[l] = true; });
                this.voices.forEach(v => { v.lane = -1; v.also = []; v.piano = false; v.fold = 0; v.standIn = null; v.skip = false; });
                this.save(); this.render(); this.setStatus('every player unticked — every note silent; tick some and shuffle, or assign (back undoes it)');
            });
        }
    } catch (e) { console.warn('[texture_cols] ticks:', e); }
    return r;
};
// 3c · a harmony TAKE loaded while a texture take is on keeps the page's `hear` (§231)
const _applyState = D.applyState;
D.applyState = function (st) {
    if (this.txIsOn() && st && st.cfg) { const cfg = Object.assign({}, st.cfg); NOT_APPLIED.forEach(key => { if (this.cfg[key] != null) cfg[key] = this.cfg[key]; else delete cfg[key]; }); st = Object.assign({}, st, { cfg }); }
    return _applyState.call(this, st);
};
// 3d · a harmony take LOADED names the box only after its own promise resolves: the write-back waits for it
const _loadTake = D.loadTake;
D.loadTake = function () {
    const r = _loadTake.apply(this, arguments), after = () => { try { if (this.txIsOn()) this.txWriteBack(); } catch (e) {} };
    if (r && typeof r.then === 'function') return r.then(v => { after(); return v; });
    after(); return r;
};
// 4 · Hear orchestrated is the COLUMN; SPACE is the rhythm. Both reach play('orch'); the button's own capture listener says which
const _play = D.play;
D.play = async function (mode) {
    const fromBtn = this._txFromBtn; this._txFromBtn = false;
    if (mode === 'orch' && this.txIsOn() && fromBtn) return this.txHearColumn();
    return _play.apply(this, arguments);   // texture_row's wrap: on a texture take → txPlay (the rhythm preview above)
};
// 4b · a take re-read: a selection that names marks the take no longer has is dropped; the undo stack is that take's
const _txLoad = D.txLoad;
D.txLoad = function () { const r = _txLoad.apply(this, arguments); try { this._txUndo = []; this._txHeld = null; const p = this.txCols(); if (p) p.sel = []; } catch (e) {} return r; };   // a take (re)read: no column selected until he clicks one
// 5 · the strike mode keeps its own ticks and its own `hear`; here `hear` is STRIKE (§228 · §230)
const _txSetMode = D.txSetMode;
D.txSetMode = function (m) {
    const was = this.txIsOn();
    if (m === 'texture' && !was) { this._txSavedOff = Object.assign({}, this.laneOff || {}); this.txHearStrike(); }
    const r = _txSetMode.apply(this, arguments);
    if (m === 'strike' && was) {
        if (this._txSavedOff) { this.laneOff = this._txSavedOff; this._txSavedOff = null; if (this.strike) this.renderOrch(); }
        if (this._txSavedHear) { Object.assign(this.cfg, this._txSavedHear); this._txSavedHear = null; this.save(); if (typeof this.paintLongUI === 'function') try { this.paintLongUI(); } catch (e) {} }
        this._txHearSet = false;
    }
    return r;
};
// 7 · 1m.3: `hear: strike` while a texture take is on = the lengths of the column the drawer shows (its `len`, a player's own) or THE
//     STANDARD SHORT; the strike mode keeps the strike's own lengths; `long tone` (long_tone_ui.js) keeps its own, whichever wraps last
const _notesFor = D.notesFor;
D.notesFor = function (mode) {
    const out = _notesFor.apply(this, arguments);
    if (mode !== 'orch' || !this.txIsOn() || this._txApplying || (this.isLong && this.isLong()) || !Array.isArray(out)) return out;
    const p = this.txCols(), k = this._txHeld, c = p && k && p.cols[k] && this.txOnDrawer(k) ? p.cols[k] : null;
    return out.map(n => Object.assign({}, n, { durMs: this.txLenMs(c, rowOf(n)) }));
};
// 6 · ESC clears the selection; CTRL+Z undoes (the row's [ · ] keys live in texture_row.js)
window.addEventListener('keydown', ev => {
    if (!D.el || D.el.style.display === 'none' || !D.txIsOn() || !D._tx) return;
    const t = ev.target; if (t && t.matches && t.matches('textarea, input, select')) return;
    if (ev.key === 'Escape') { if (D.txSel().length) D.txClearSel(); return; }   // no stopPropagation: a sound card or a takes menu closes on the same key
    if ((ev.key === 'z' || ev.key === 'Z') && (ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey) { ev.preventDefault(); ev.stopPropagation(); D.txUndo(); }
}, true);

}(typeof self !== 'undefined' ? self : this));
