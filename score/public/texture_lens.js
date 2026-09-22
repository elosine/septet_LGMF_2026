// texture_lens.js — THE LENS: the orchestration panel edits the SELECTED COLUMN(S) (LGMF PLAN 1m.4.4, 2026-09-22; RUNNING_LOG §245 …
// §252; COMPOSITION_NOTES LG-81 · LG-83). His decision (LG-81): the column OWNS its orchestration; the panel is a lens on the
// selection — every action goes to every selected column, "mixed" where they differ, grey with nothing selected — and keeps only a
// DEFAULTS memory, what the drawer holds while nothing is selected, from which a fresh column starts EMPTY (no players, the defaults'
// set and dials). Rejected (§248): a mother column whose children follow · templates.
//
// THE ONE RULE for a take (§251 · §252): its PITCHES go to every selected column, dealt on that column's OWN players with their own
// articulations; onto a column with NO players its players and their articulations come too; never its cfg (the dials). Two kinds
// kept apart (LG-83): what a take carries — harmony · deal · articulations — and what the column alone carries — plays · length.
//
// A mixin on texture_cols.js; `strike_drawer.js`, `texture_row.js` and `texture_cols.js` are not changed by it beyond two lines. On
// `the strike` every wrap here passes straight through — THE SHIELD. What it adds to the drawer:
//   · `rowTechs[lane]` — a row's ARTICULATION as the column carries it (a pitched voice chosen by name), so a re-deal keeps it: the
//     drawer's `defaultTech` reads it while a texture take is on. A set pressed clears them (every row on the set). In `state()`.
//   · the broadcast: a tick · a row's voice (by name or by key) · a set · `all on` / `all off` → every selected column, the primary on
//     the drawer, the others offline through `txWithColumn`; ONE undo step for the lot.
//   · `txWriteBack` (replaced whole): the harmony and the DEAL dials shared as before (each column dealt on its own players); a take by
//     THE ONE RULE; every other dial copied. With nothing selected the drawer is the DEFAULTS memory (`_txS.defaults`).
//   · the marks: a row's box a THIRD state (indeterminate) where the columns differ · a row's menu, the set and `length` outlined dashed ·
//     the status naming what differs. A tooltip says which columns.
//   · nothing selected → the panel and the picker greyed; a click or a change on them does nothing and the status says so; the
//     harmony list, the rhythm takes, the row and SPACE stay live. The bar says `defaults` · `column 1.23 s` · `3 columns`.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D || typeof D.txWriteBack !== 'function' || typeof D.chooseTech !== 'function') { console.warn('[texture_lens] texture_cols.js / the 1m.4.3 drawer is not loaded'); return; }
const TRK = () => (typeof D.tracks === 'function' ? D.tracks() : (typeof TRACKS !== 'undefined' ? TRACKS : [])) || [];
const UNDO_MAX = 40;
const NOT_SHARED = ['hearMode', 'longS', 'strikeId', 'seedHist', 'rowH', 'show88', 'full', 'heightPx', 'rhythmW', 'zoomPxPerMs', 'simMs'];   // the page's, the view's: never a column's
const DEAL_KEYS = ['oSeedShuffle', 'mayFold', 'topLock', 'bottomLock', 'voicing', 'vSeed', 'clusterOct', 'transpose'];   // a change here re-deals every selected column on its own players
const SHARED = st => (st ? st.strikeId + '|' + (st.cfg && st.cfg.oSeedShuffle) : '');
const MIXED = '1px dashed #C9A05A';
const cfgOf = c => (c && c.state && c.state.cfg) || {};
const lanesOf = st => { const s = new Set(); ((st && st.voices) || []).forEach(v => { if (v.lane >= 0) s.add(v.lane); (v.also || []).forEach(r => { if (r.lane >= 0) s.add(r.lane); }); }); Object.keys((st && st.rowKeys) || {}).forEach(l => s.add(+l)); return [...s].sort((a, b) => a - b); };
const techsOf = st => { const t = {}; ((st && st.voices) || []).forEach(v => { if (v.lane >= 0 && v.tech) t[v.lane] = v.tech; (v.also || []).forEach(r => { if (r.lane >= 0 && r.tech) t[r.lane] = r.tech; }); }); return t; };
// a column's voice on each row, as a word: `tech@midi` (a by-key voice) · the note's tech · the row's own · nothing
const laneTechs = c => { const st = (c && c.state) || {}, out = {}; Object.assign(out, st.rowTechs || {}); Object.entries(techsOf(st)).forEach(([l, t]) => { out[l] = t; }); Object.entries(st.rowKeys || {}).forEach(([l, rk]) => { out[l] = rk.tech + '@' + rk.midi; }); return out; };
const setOf = (c, D) => { const st = (c && c.state) || {}, k = (st.cfg && st.cfg.artSet) || 'percussive'; const T = TRK(); return (st.voices || []).every(v => [v].concat(v.also || []).every(r => r.lane < 0 || (st.rowKeys || {})[r.lane] || (T[r.lane] && T[r.lane].instKey === 'percussion') || r.tech === D.setTech(k, r.lane))) ? k : null; };

Object.assign(D, {
    rowTechs: {}, _txLensBusy: false, _txTakeHand: false,

    // ---------------------------------------------------------------- the broadcast
    // `fn` runs on the drawer (= the primary column, written back by its render) and offline on every other selected column
    txBroadcast(fn, word) {
        if (!this.txIsOn() || this._txLensBusy || this._txApplying) return fn.call(this);
        const p = this.txCols(), k = this.txPrimary();
        if (!p || !k) { if (p) this.txGreySay(); return fn.call(this); }
        this._txLensBusy = true;
        try {
            this.txPushUndo();
            const r = fn.call(this);
            p.sel.slice(1).forEach(kk => { if (!p.cols[kk]) p.cols[kk] = this.txFresh(); this.txWithColumn(kk, function () { fn.call(this); }); });
            this.txPersistSoon(); this.txRender();
            if (word && p.sel.length > 1) this.setStatus(word + ' → ' + p.sel.length + ' columns');
            return r;
        } finally { this._txLensBusy = false; }
    },
    txGreySay() { this.setStatus('no column selected — the panel edits the selected column(s): click a column, or SHIFT+click several', true); },
    txLaneWord(lane) { const t = TRK()[lane]; return t ? t.label : 'row ' + lane; },

    // ---------------------------------------------------------------- the DEFAULTS memory
    txSaveDefaults() { if (!this.strike) return; this._txS.defaults = { state: this.state(), players: this.txPlayersNow(), take: this.txTakeName() }; this.txPersist(); },
    txRestoreDefaults() {
        const d = this._txS.defaults; if (!d || !d.state || !this.strikeById(d.state.strikeId)) return false;
        this._txApplying = true;
        try { this.txSetPlayersNow(d.players || []); this.applyState(d.state); this.txSetTakeName(d.take || ''); } finally { this._txApplying = false; }
        return true;
    },
    txWho() {
        const p = this.txCols(); if (!p) return '';
        if (!p.sel.length) return 'defaults';
        return p.sel.length === 1 ? 'column ' + this.txDot(p.sel[0]).t.toFixed(2) + ' s' : p.sel.length + ' columns';
    },
    txPaintWho() {
        const bar = this.el && this.el.querySelector('#txBar'); if (!bar) return;
        let who = bar.querySelector('#txWho');
        if (!who) { who = document.createElement('span'); who.id = 'txWho'; who.className = 'txOnly'; who.style.cssText = 'color:#e8cf9a;font-size:10px;padding:0 4px;border:1px solid #4a3a12;border-radius:3px;white-space:nowrap'; who.title = 'THE LENS (1m.4.4): the orchestration panel shows and edits the SELECTED column(s); with nothing selected it holds the DEFAULTS a fresh column starts from'; const z = bar.querySelector('#txZoom'); bar.insertBefore(who, z); }
        who.textContent = this.txWho();
    },

    // ---------------------------------------------------------------- THE ONE RULE for a take, on the drawer holding column `c`
    txTakeInto(c, take, inner) {
        if (!take || !this.strikeById(take.strikeId)) return false;
        const own = { off: Object.assign({}, this.laneOff || {}), techs: Object.assign({}, this.rowTechs || {}), keys: Object.assign({}, this.rowKeys || {}), cfg: Object.assign({}, this.cfg) };
        const hasPlayers = ((c && c.players) || []).length > 0 || Object.keys(own.keys).length > 0;
        const st = Object.assign({}, take, { cfg: Object.assign({}, own.cfg, { strikeId: take.strikeId }) });   // never its cfg
        (inner || this.applyState).call(this, st);
        if (hasPlayers) { this.laneOff = own.off; this.rowTechs = own.techs; this.rowKeys = own.keys; this.shuffleOrch(); }   // its pitches on this column's own players, their own articulations
        else { this.txSetPlayersNow(lanesOf(st)); this.rowTechs = techsOf(st); this.rowKeys = Object.assign({}, st.rowKeys || {}); }   // an empty column: its players and their articulations too, the deal as it has it
        return hasPlayers;
    },
    // the primary's HARMONY and DEAL dials (the seed, may fold, the locks, the voicing) onto the drawer holding column `c` — this
    // column's own players, articulations, key voices and every other dial kept; then dealt. Same players + same harmony + the
    // shared seed = the same notes (1m.4.7's `repeat`).
    txHarmonyInto(c, base) {
        if (!base || !this.strikeById(base.strikeId)) return false;
        const own = { off: Object.assign({}, this.laneOff || {}), techs: Object.assign({}, this.rowTechs || {}), keys: Object.assign({}, this.rowKeys || {}), cfg: Object.assign({}, this.cfg) };
        const deal = {}; DEAL_KEYS.forEach(key => { if (base.cfg && key in base.cfg) deal[key] = base.cfg[key]; });
        this.applyState(Object.assign({}, base, { cfg: Object.assign({}, own.cfg, deal, { strikeId: base.strikeId }) }));
        this.laneOff = own.off; this.rowTechs = own.techs; this.rowKeys = own.keys; this.shuffleOrch();
        return true;
    },

    // ---------------------------------------------------------------- the write-back, replaced whole
    txWriteBack() {
        if (!this.txIsOn() || !this._tx || this._txApplying || !this.strike) return;
        const p = this.txCols(), k = this.txPrimary(); if (!p) return;
        if (!k) { this.txSaveDefaults(); this.txPaintWho(); return; }   // nothing selected: the drawer is the defaults
        if (this._txHeld !== k) return;   // the drawer must be SHOWING the primary
        const prev = p.cols[k], cap = this.txCapture();
        const harmMoved = !!(prev && prev.state && prev.state.strikeId !== cap.state.strikeId);
        const takeMoved = !!(prev && prev.take !== cap.take && cap.take);
        // a harmony picked in the list leaves every voice unassigned: the column's players are dealt it at once (as before)
        if (harmMoved && cap.players.length && !(this.voices || []).some(v => v.lane >= 0)) {
            this.txSetPlayersNow(cap.players); this.shuffleOrch(); this._txApplying = true; try { this.render(); } finally { this._txApplying = false; }
            Object.assign(cap, this.txCapture());
        }
        const next = Object.assign({}, prev || {}, cap);
        if (JSON.stringify(next) === JSON.stringify(prev)) return;
        const before = this.txUndoSnap(); this._txUndo.push(before); if (this._txUndo.length > UNDO_MAX) this._txUndo.shift();
        p.cols[k] = next;
        if (p.sel.length > 1) {
            const pc = cfgOf(prev), nc = cfgOf(next);
            const delta = {}; Object.keys(nc).forEach(key => { if (NOT_SHARED.includes(key)) return; if (JSON.stringify(nc[key]) !== JSON.stringify(pc[key])) delta[key] = nc[key]; });
            const dealMoved = !prev || SHARED(prev.state) !== SHARED(next.state) || DEAL_KEYS.some(key => key in delta);
            const take = takeMoved && this.takeList && this.takeList[next.take] ? this.takeList[next.take].state : null;
            p.sel.slice(1).forEach(kk => {
                if (!p.cols[kk]) p.cols[kk] = this.txFresh();
                if (take) { this.txWithColumn(kk, function (c) { this.txTakeInto(c, take); }); p.cols[kk].take = next.take; }          // THE ONE RULE
                else if (dealMoved) this.txWithColumn(kk, function (c) { this.txHarmonyInto(c, next.state); });                        // the harmony and the deal dials: each on its own players, its own set and dials kept
                else if (Object.keys(delta).length) { const c = p.cols[kk]; c.state.cfg = Object.assign({}, c.state.cfg || {}, delta); }   // every other dial: copied
            });
        }
        this.txPersistSoon(); this.txRender();
    },

    // ---------------------------------------------------------------- the marks: where the selected columns differ
    txPaintMixed() {
        const orch = this.el && this.el.querySelector('#skOrch'); if (!orch) return;
        const p = this.txIsOn() ? this.txCols() : null, k = p && this.txPrimary();
        const grey = !!(p && !k);
        orch.style.opacity = grey ? 0.45 : ''; orch.title = grey ? 'no column selected — the panel edits the selected column(s)' : '';
        const pick = this.el.querySelector('#skPick'); if (pick) { pick.style.opacity = grey ? 0.45 : ''; }
        const cols = p && p.sel.length > 1 ? p.sel.map(kk => p.cols[kk]).filter(Boolean) : [];
        const T = TRK(), diffs = [];
        const techsPer = cols.map(laneTechs), setsPer = cols.map(c => setOf(c, this)), lensPer = cols.map(c => (c && isFinite(+c.len) && +c.len > 0) ? +c.len : null);
        T.forEach((t, lane) => {
            const row = orch.querySelector('.skRow[data-lane="' + lane + '"]'); if (!row) return;
            const cb = row.querySelector('.skTick'), sel = row.querySelector('.skTech');
            const has = cols.map(c => (c.players || []).includes(lane)), pMixed = cols.length > 1 && has.some(Boolean) && !has.every(Boolean);
            if (cb) { cb.indeterminate = pMixed; if (pMixed) { cb.title = 'mixed: on in ' + has.filter(Boolean).length + ' of ' + cols.length + ' selected columns — a click puts every one of them ' + (cb.checked ? 'off' : 'on'); diffs.push(t.short + ' on/off'); } }
            const tv = techsPer.map(m => m[lane] || ''), tMixed = cols.length > 1 && has.some(Boolean) && new Set(tv.filter((x, i) => has[i])).size > 1;
            if (sel) { sel.style.outline = tMixed ? MIXED : ''; if (tMixed) { sel.title = 'mixed: ' + [...new Set(tv.filter(Boolean))].join(' · ') + ' — the menu shows the first column; a choice goes to all of them'; diffs.push(t.short + ' voice'); } else sel.title = ''; }
        });
        const sMixed = cols.length > 1 && new Set(setsPer.map(String)).size > 1;
        orch.querySelectorAll('.skArt').forEach(b => { b.style.outline = sMixed ? MIXED : ''; }); if (sMixed) diffs.push('the set');
        const lb = this.el.querySelector('#txLen'); if (lb) { const lMixed = cols.length > 1 && new Set(lensPer.map(String)).size > 1; lb.style.outline = lMixed ? MIXED : ''; if (lMixed) diffs.push('length'); }
        const hMixed = cols.length > 1 && new Set(cols.map(c => c.state && c.state.strikeId)).size > 1; if (hMixed) diffs.push('the harmony');
        this._txMixed = diffs;
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · a row's articulation as the column carries it: `defaultTech` reads it while a texture take is on; `chooseTech` writes it
const _defaultTech = D.defaultTech;
D.defaultTech = function (lane) {
    if (this.txIsOn && this.txIsOn() && this.rowTechs && this.rowTechs[lane]) { const inst = this.instOf(lane); if (inst && (inst.techniques || []).some(t => t.key === this.rowTechs[lane])) return this.rowTechs[lane]; }
    return _defaultTech.apply(this, arguments);
};
const _chooseTech = D.chooseTech;
D.chooseTech = function (lane, key, midi) {
    const inst = this.instOf(lane), tq = inst && (inst.techniques || []).find(t => t.key === key);
    return this.txBroadcast(function () {
        if (this.txIsOn() && tq) { if (this.kindOfTech(tq) === 'key') delete this.rowTechs[lane]; else this.rowTechs[lane] = key; }
        return _chooseTech.call(this, lane, key, midi);
    }, tq ? this.txLaneWord(lane) + ': ' + tq.label : '');
};
D.kindOfTech = function (tq) { return tq.kind || 'pitched'; };
const _setRowKey = D.setRowKey;
D.setRowKey = function (lane, techKey, midi) { return this.txBroadcast(function () { if (this.txIsOn()) delete this.rowTechs[lane]; return _setRowKey.call(this, lane, techKey, midi); }, this.txLaneWord(lane) + ': a key voice'); };
const _clearRowKey = D.clearRowKey;
D.clearRowKey = function (lane) { return this.txBroadcast(function () { return _clearRowKey.call(this, lane); }, this.txLaneWord(lane) + ': the key voice off'); };
const _applyArtSet = D.applyArtSet;
D.applyArtSet = function (k) { return this.txBroadcast(function () { if (this.txIsOn()) this.rowTechs = {}; return _applyArtSet.call(this, k); }, 'set ' + k); };
// 2 · a tick and `all on` / `all off` go to every selected column
const _txTick = D.txTick;
D.txTick = function (k, lane, on) {
    const p = this.txCols(); if (!p || k !== this.txPrimary() || p.sel.length < 2 || this._txLensBusy) return _txTick.apply(this, arguments);
    this._txLensBusy = true;
    try { p.sel.forEach(kk => _txTick.call(this, kk, lane, on)); this.setStatus(this.txLaneWord(lane) + (on ? ' on' : ' off') + ' → ' + p.sel.length + ' columns'); }
    finally { this._txLensBusy = false; }
};
const _txAllPlayers = D.txAllPlayers;
D.txAllPlayers = function (on) {
    const p = this.txCols(); if (!p || p.sel.length < 2 || this._txLensBusy) return _txAllPlayers.apply(this, arguments);
    this._txLensBusy = true;
    try {
        const first = p.sel[0]; _txAllPlayers.call(this, on);
        p.sel.slice(1).forEach(kk => { if (!p.cols[kk]) p.cols[kk] = this.txFresh(); this.txWithColumn(kk, function (c) { TRK().forEach((t, lane) => { if (on) { delete this.laneOff[lane]; this.txDealTo(lane); } else { this.laneOff[lane] = true; this.txDropLane(lane); this.txClearOverride(c, lane); } }); }); });
        this.txPersistSoon(); this.txRender(); this.setStatus((on ? 'every player on' : 'every player off') + ' → ' + p.sel.length + ' columns');
    } finally { this._txLensBusy = false; }
};
// 3 · the state carries `rowTechs`; a fresh column has none; a column worked offline on another's harmony keeps its own
const _state = D.state;
D.state = function () { const st = _state.apply(this, arguments); st.rowTechs = JSON.parse(JSON.stringify(this.rowTechs || {})); return st; };
const _applyState = D.applyState;
D.applyState = function (st) {
    // THE ONE RULE for a take loaded BY HAND onto a selected column (the drawer's take menu): never its cfg; its pitches on the column's
    // own players and articulations, or, onto an empty column, its players and articulations too
    if (this._txTakeHand && this.txIsOn && this.txIsOn() && !this._txApplying && this._txHeld != null && st && st.cfg) {
        const p = this.txCols(), c = p && p.cols[this._txHeld];
        if (c && this.strikeById(st.strikeId)) {
            const inner = s => { const r = _applyState.call(this, s); this.rowTechs = Object.assign({}, s.rowTechs || {}); return r; };
            this._txApplying = true; let had;
            try { had = this.txTakeInto(c, st, inner); } finally { this._txApplying = false; }
            this.render();
            this._txTakeNote = had ? 'its pitches dealt on this column\'s own players' : 'onto an empty column: its players and their articulations too';
            return;
        }
    }
    const r = _applyState.call(this, st);
    this.rowTechs = Object.assign({}, (st && st.rowTechs) || {});
    return r;
};
const _loadTake = D.loadTake;
D.loadTake = function () {
    this._txTakeHand = true; this._txTakeNote = '';
    let r; try { r = _loadTake.apply(this, arguments); } catch (e) { this._txTakeHand = false; throw e; }
    const done = () => { this._txTakeHand = false; if (this._txTakeNote) { this.setStatus(document.querySelector('#skStatus').textContent + ' · ' + this._txTakeNote); this._txTakeNote = ''; } };
    if (r && typeof r.then === 'function') return r.then(v => { done(); return v; }, e => { done(); throw e; });
    done(); return r;
};
const _txClearedState = D.txClearedState;
D.txClearedState = function () { const st = _txClearedState.apply(this, arguments); st.rowTechs = {}; return st; };
// a fresh column starts from the DEFAULTS (what the drawer holds while nothing is selected), not from the primary
const _txFresh = D.txFresh;
D.txFresh = function () {
    const d = this._txS.defaults;
    if (!d || !d.state || !this.strikeById(d.state.strikeId) || !this.txPrimary()) return _txFresh.apply(this, arguments);
    const st = JSON.parse(JSON.stringify(d.state)); (st.voices || []).forEach(v => { v.lane = -1; v.also = []; v.fold = 0; v.standIn = null; v.skip = false; v.piano = false; }); st.rowKeys = {}; st.rowTechs = {};
    return { state: st, players: [], notes: [], take: '' };
};
// a new harmony picked in the list while a column is held keeps the column's players, articulations and key voices (the pitches change)
const _select = D.select;
D.select = function (id) {
    if (!(this.txIsOn && this.txIsOn()) || this._txHeld == null || this._txApplying) return _select.apply(this, arguments);
    const keep = { techs: Object.assign({}, this.rowTechs || {}), keys: Object.assign({}, this.rowKeys || {}) };
    const r = _select.apply(this, arguments);
    this.rowTechs = keep.techs; this.rowKeys = keep.keys;
    return r;
};
// 4 · a selection that starts from nothing saves the defaults first; a cleared selection brings them back
const _txSelect = D.txSelect;
D.txSelect = function (k, add) { const p = this.txCols(); if (p && !p.sel.length && this._txHeld == null) this.txSaveDefaults(); return _txSelect.apply(this, arguments); };
const _txClearSel = D.txClearSel;
D.txClearSel = function () { const r = _txClearSel.apply(this, arguments); try { if (this.txRestoreDefaults()) { this.render(); this.setStatus('no column selected — the drawer shows the defaults a fresh column starts from'); } } catch (e) { console.warn('[texture_lens] defaults:', e); } return r; };
const _txLoad = D.txLoad;
D.txLoad = function () { const r = _txLoad.apply(this, arguments); try { this.txRestoreDefaults(); } catch (e) {} return r; };
// 5 · the marks and the grey, after every render of the panel; the bar's word after every render of the row
const _renderOrch = D.renderOrch;
D.renderOrch = function () { const r = _renderOrch.apply(this, arguments); try { this.txPaintMixed(); } catch (e) { console.warn('[texture_lens] marks:', e); } return r; };
const _renderPicker = D.renderPicker;
D.renderPicker = function () { const r = _renderPicker.apply(this, arguments); try { const pick = this.el.querySelector('#skPick'); if (pick && this.txIsOn()) pick.style.opacity = this.txPrimary() ? '' : 0.45; } catch (e) {} return r; };
const _txRender = D.txRender;
D.txRender = function () { const r = _txRender.apply(this, arguments); try { this.txPaintWho(); this.txPaintMixed(); if (this._txMixed && this._txMixed.length && this.txSel().length > 1) { const i = this.el.querySelector('#txI'); if (i) i.title = 'mixed across the selection: ' + this._txMixed.join(' · ') + String.fromCharCode(10) + i.title; } } catch (e) {} return r; };
const _txColLine = D.txColLine;
D.txColLine = function () { const s = _txColLine.apply(this, arguments); return (this._txMixed && this._txMixed.length && this.txSel().length > 1) ? s + ' · mixed: ' + this._txMixed.join(' · ') : s; };
// 6 · nothing selected: a click or a change on the panel or the picker does nothing and the status says so (the harmony list, the
//     rhythm takes, the row and SPACE are outside it and stay live)
const _txEnsureUI = D.txEnsureUI;
D.txEnsureUI = function () {
    const r = _txEnsureUI.apply(this, arguments);
    ['#skOrch', '#skPick'].forEach(sel => { const el = this.el && this.el.querySelector(sel); if (!el || el._txLensGrey) return; el._txLensGrey = true;
        ['click', 'change', 'mousedown'].forEach(ev => el.addEventListener(ev, e => {
            if (!this.txIsOn() || this.txPrimary()) return;
            const t = e.target; if (t && t.matches && t.matches('.skRowName')) return;   // the picker may still be opened to LOOK
            e.preventDefault(); e.stopImmediatePropagation(); if (ev === 'click') this.txGreySay();
        }, true)); });
    return r;
};
// 7 · the strike mode keeps its own rows: a switch back clears the row articulations (they belong to a column)
const _txSetMode = D.txSetMode;
D.txSetMode = function (m) { const r = _txSetMode.apply(this, arguments); if (m === 'strike') this.rowTechs = {}; return r; };

}(typeof self !== 'undefined' ? self : this));
