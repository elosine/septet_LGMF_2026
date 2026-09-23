// texture_lib.js — THE PATTERN LIBRARY: a pattern is on disk (LGMF PLAN 1o.3 the store · 1o.4 the controls, 2026-09-22;
// RUNNING_LOG §276 … §278, §293; SEQUENCE_TOOL §16 — the sequence library's rules, verbatim, in a CLONE: `sequence_ui.js` is not changed).
//
// His model (LG-84 · LG-85): *"the texture is upstream … I load a texture turn onsets on/off assign takes dynamics etc, this belongs to
// another save file right, I can save it, recall it later make changes, but not change its underlying texture."* A pattern is a document of
// its own (texture_row.js, 1o.1 · 1o.2); this file gives it a FILE OF ITS OWN — `bank/patterns.json`, the FIFTH store of /api/snapshots
// (score/snapshots.js STORES; a running server keeps its module: RESTART it) — so every pattern he makes is on disk and git can see it.
//
//   · Panels `library` (the named keepers) and `untitled` (a rolling stack of 50, the oldest dropped at a save). An entry's state is
//     `{ doc, kept }` — the document, and the document at his last `save` (1o.4), or null.
//   · AUTOSAVE: the browser instantly on every change (texture_row's `txPersist`, wrapped here) · the disk about 2 s after the last
//     change, and on `pagehide` by `sendBeacon`, the one write a closing tab is guaranteed to make · an untitled document takes a
//     timestamp name at its FIRST change — `untitled <texture> 2026-09-22 14.32.05`, sortable, dots not colons (the store's name rule
//     refuses a colon) [call: the texture in the name, so the stack reads]. An untouched empty pattern is not a document.
//   · MIGRATION, once, at the first load that has the store: the documents 1o.2 kept in the browser (by id) and any pre-1o.1 pattern still
//     waiting in `pats` become untitled entries — a legacy one realized THEN (Texture is on composer.html), or, its take gone, kept with its
//     `n` marks at unknown times and said [call]. The names are derived from the document, so a repeated run writes the same names: no
//     duplicates. The browser key then holds `mode`, the open document and its key, and nothing else.
//   · `bank/patterns.json` sits under the same git policy as `bank/sequences.json`: autosaved, his to commit.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D || typeof D.txPat !== 'function' || typeof D.txLoad !== 'function') { console.warn('[texture_lib] texture_row.js is not loaded'); return; }
const LIB = { store: 'patterns', named: 'library', untitled: 'untitled', max: 50, debounce: 2000 };
const NAME_RE = /^[A-Za-z0-9._ -]{1,64}$/;   // score/snapshots.js's own rule
const copy = v => JSON.parse(JSON.stringify(v));
const pad = n => String(n).padStart(2, '0');
const stampOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + '.' + pad(d.getMinutes()) + '.' + pad(d.getSeconds());
const safe = s => String(s || '').replace(/[^A-Za-z0-9._ -]/g, '-');
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

Object.assign(D, {
    _tlib: null, _tlibT: null, _tlibBusy: false, _tlibLast: '', _tlibLoaded: false, _tlibLoading: false,

    tlibIx(panel) { return (this._tlib && this._tlib[panel]) || {}; },
    tlibWhere() { const w = this._txS.lib; return w && w.panel && w.name ? { panel: w.panel, name: w.name } : { panel: LIB.untitled, name: null }; },
    tlibState() { return copy({ doc: this.txPat(), kept: this._txS.kept || null }); },
    tlibStamp(doc) { return ('untitled ' + safe(doc && doc.texture && doc.texture.name) + ' ' + stampOf(new Date())).slice(0, 64); },
    // an untouched empty pattern is not a document: no mark on, no player dealt, no name
    tlibBlank(doc) { const d = doc || this.txPat(); if (!d) return true; const dealt = Object.keys(d.cols || {}).some(k => d.cols[k] && (d.cols[k].players || []).length); return !(d.on || []).length && !dealt && !d.name; },
    async tlibPost(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ store: LIB.store }, body)) });
        const j = await r.json().catch(() => null);
        if (!j || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status));
        return j;
    },
    // every change schedules the DISK write; the browser already has it, instantly
    tlibTouch() { clearTimeout(this._tlibT); this._tlibT = setTimeout(() => { this.tlibFlush(); }, LIB.debounce); },
    async tlibFlush() {
        clearTimeout(this._tlibT);
        if (!this._tlibLoaded) return;                          // nothing is written before the index is read: the names depend on it
        const doc = this.txPat(); if (!doc) return;
        if (this._tlibBusy) { this.tlibTouch(); return; }        // one writer at a time: the store is rewritten whole
        if (!this._txS.lib && this.tlibBlank(doc)) return;
        if (!this._txS.lib) { this._txS.lib = { panel: LIB.untitled, name: this.tlibStamp(doc) }; this.txPersist(true); }   // a document takes its name at its FIRST change
        const w = this.tlibWhere(), state = this.tlibState(), sig = w.panel + '/' + w.name + '#' + JSON.stringify(state);
        if (sig === this._tlibLast) return;                     // nothing changed since the last write
        this._tlibBusy = true;
        try {
            await this.tlibPost({ panel: w.panel, name: w.name, state });
            this._tlib = this._tlib || {};
            (this._tlib[w.panel] = this._tlib[w.panel] || {})[w.name] = { saved: new Date().toISOString(), comment: '', state };
            this._tlibLast = sig;
            await this.tlibPrune();
        } catch (e) { this.setStatus('the pattern library did not save: ' + (e && e.message || e), true); }
        this._tlibBusy = false;
        this.txPaintPat();
    },
    // `pagehide` kills a pending fetch, so the last write of a closing or reloading tab goes by BEACON. Nothing is read back.
    tlibFlushBeacon() {
        clearTimeout(this._tlibT);
        const doc = this.txPat(); if (!doc || !this._tlibLoaded) return;
        if (!this._txS.lib && this.tlibBlank(doc)) return;
        if (!this._txS.lib) { this._txS.lib = { panel: LIB.untitled, name: this.tlibStamp(doc) }; this.txPersist(true); }
        const w = this.tlibWhere(), body = JSON.stringify({ store: LIB.store, panel: w.panel, name: w.name, state: this.tlibState() });
        try {
            if (navigator.sendBeacon) navigator.sendBeacon('/api/snapshots', new Blob([body], { type: 'application/json' }));
            else fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
        } catch (e) {}
    },
    // the stack keeps the newest 50; the oldest go at a save — never the one that is open
    async tlibPrune() {
        const u = this.tlibIx(LIB.untitled), keys = Object.keys(u); if (keys.length <= LIB.max) return;
        const w = this.tlibWhere();
        const old = keys.sort((a, b) => String(u[a] && u[a].saved || '').localeCompare(String(u[b] && u[b].saved || ''))).slice(0, keys.length - LIB.max);
        for (const k of old) {
            if (w.panel === LIB.untitled && k === w.name) continue;
            try { await this.tlibPost({ panel: LIB.untitled, name: k, delete: true }); delete u[k]; } catch (e) { break; }
        }
    },
    async tlibLoad() {
        try {
            const r = await fetch('/api/snapshots?store=' + LIB.store, { cache: 'no-store' }); const j = await r.json();
            if (!j || j.success === false) throw new Error((j && j.error) || 'no answer');
            this._tlib = j.panels || {};
        } catch (e) {
            this._tlib = this._tlib || {};
            this.setStatus('the pattern library could not be read (' + (e && e.message || e) + ') — restart the server if it predates 1o.3; patterns stay in this browser until then', true);
            this.txPaintPat(); return false;
        }
        this._tlibLoaded = true;
        await this.tlibMigrate();
        this.txPaintPat();
        if (this.txPat() && !this._txS.lib && !this.tlibBlank()) this.tlibTouch();   // a pattern that lived only in the browser is written at its first chance
        return true;
    },
    // MIGRATION, once (the header): the browser's documents → untitled entries; names derived from the document, so a repeat writes no duplicates
    async tlibMigrate() {
        const S = this._txS, docs = S.docs || {}, pats = S.pats || {}; let n = 0, failed = false;
        const idTime = id => { const t = parseInt(String(id || '').slice(1), 36); return isFinite(t) && t > 0 ? new Date(t) : new Date(); };
        const put = async (name, doc) => {
            if (this.tlibIx(LIB.untitled)[name]) return true;
            try { const state = copy({ doc, kept: null }); await this.tlibPost({ panel: LIB.untitled, name, state }); this._tlib = this._tlib || {}; (this._tlib[LIB.untitled] = this._tlib[LIB.untitled] || {})[name] = { saved: new Date().toISOString(), comment: '', state }; n++; return true; }
            catch (e) { failed = true; return false; }
        };
        for (const id of Object.keys(docs)) {
            const doc = docs[id]; if (!doc || !doc.texture) { delete docs[id]; continue; }
            if (this.tlibBlank(doc) && !(S.doc && S.doc.id === doc.id)) { delete docs[id]; continue; }   // an untouched empty pattern is not a document
            const name = ('untitled ' + safe(doc.texture.name) + ' ' + stampOf(idTime(doc.id)) + ' ' + safe(doc.id)).slice(0, 64);   // the id: two started in one second stay two
            if (!(await put(name, doc))) continue;
            if (S.doc && S.doc.id === doc.id && !S.lib) S.lib = { panel: LIB.untitled, name };
            delete docs[id];
        }
        for (const tex of Object.keys(pats)) {
            const old = pats[tex]; if (!old || typeof old !== 'object') { delete pats[tex]; continue; }
            let R = typeof this.txRealize === 'function' ? this.txRealize(tex, true) : null; const lost = !R;
            if (lost) R = { name: tex, n: +old.n || 0, span: 0, gap10: 0.05, dots: [], lost: true };   // [call] its take is gone: kept, its marks at unknown times
            const doc = Object.assign(this.txDocNew(R), old, { texture: R }); delete doc.n;
            if (!lost) { const keys = new Set(R.dots.map(d => d.k)); doc.on = (doc.on || []).filter(k => keys.has(k)); if (Array.isArray(doc.sel)) doc.sel = doc.sel.filter(k => keys.has(k)); Object.keys(doc.cols || {}).forEach(k => { if (!keys.has(k)) delete doc.cols[k]; }); }
            const name = ('untitled ' + safe(tex) + ' before 1o.1' + (lost ? ' (take gone)' : '')).slice(0, 64);
            if (!(await put(name, doc))) continue;
            if (S.openLegacy === tex) { delete S.openLegacy; this.txLoad(doc, { panel: LIB.untitled, name }); }
            delete pats[tex];
        }
        if (!failed) { delete S.docs; delete S.pats; delete S.open; delete S.openLegacy; }
        this.txPersist(true);
        if (n) this.setStatus(n + ' pattern' + (n === 1 ? '' : 's') + ' from this browser moved into bank/patterns.json (untitled)');
        return n;
    },
    tlibEntryLine(panel, name) {
        const e = this.tlibIx(panel)[name], d = e && e.state && e.state.doc;
        return d ? this.txDocLine(Object.assign({}, d, { name: panel === LIB.named ? name : '' })) + (e.state.kept ? ' · saved' : '') : name;
    },
});

// ---------------------------------------------------------------- the list and the open: the library's, over the row's own
// the named first, A → Z; then the untitled, newest first (the stamp sorts)
D.txDocList = function () {
    const named = Object.keys(this.tlibIx(LIB.named)).sort((a, b) => a.localeCompare(b)), un = Object.keys(this.tlibIx(LIB.untitled)).sort((a, b) => b.localeCompare(a));
    return named.map(nm => ({ key: LIB.named + '/' + nm, panel: LIB.named, name: nm, line: this.tlibEntryLine(LIB.named, nm) }))
        .concat(un.map(nm => ({ key: LIB.untitled + '/' + nm, panel: LIB.untitled, name: nm, line: this.tlibEntryLine(LIB.untitled, nm) })));
};
D.txOpenKey = function (key) { const i = String(key || '').indexOf('/'); return i < 0 ? null : { panel: key.slice(0, i), name: key.slice(i + 1) }; };
// open an entry: the one being left is already on disk (or about to be — its write is sent first), so there is no prompt
D.txOpen = function (key) {
    const w = this.txOpenKey(key), e = w && this.tlibIx(w.panel)[w.name];
    if (!e || !e.state || !e.state.doc) { this.setStatus('"' + (w ? w.name : key) + '" is not in the pattern library', true); this.txPaintPat(); return false; }
    this.tlibFlush();                                            // the state is taken synchronously, under the old key, before anything changes
    const ev = (typeof MorphEmit !== 'undefined' ? MorphEmit : root.MorphEmit); if (ev && ev._playing) { ev.panic(); this.onStopped(); }
    const doc = copy(e.state.doc); if (w.panel === LIB.named) doc.name = w.name;
    this.txLoad(doc, { panel: w.panel, name: w.name, kept: e.state.kept ? copy(e.state.kept) : null });
    this._tlibLast = w.panel + '/' + w.name + '#' + JSON.stringify(this.tlibState());
    this.txRender(); this.setStatus('opened ' + this.txLine() + (this._txS.kept ? ' · it has a saved state — revert comes back to it' : ''));
    return true;
};
D.txCurrentKey = function () { const w = this._txS.lib; return w && w.panel && w.name ? w.panel + '/' + w.name : ''; };

// ---------------------------------------------------------------- the hooks
// 1 · every browser write of the pattern schedules the disk write (`quiet` = the library's own bookkeeping, no touch)
const _txPersist = D.txPersist;
D.txPersist = function (quiet) { const r = _txPersist.apply(this, arguments); if (!quiet && this._tlibLoaded && this.txPat()) this.tlibTouch(); return r; };
// 2 · a start sends the pattern being left first (its state taken synchronously, under its own key)
const _txStart = D.txStart;
D.txStart = function () { if (this._tlibLoaded) this.tlibFlush(); const r = _txStart.apply(this, arguments); if (r) this._tlibLast = ''; return r; };
// 3 · the library is read once the takes are (the migration realizes a legacy pattern, and needs them)
const _txRefreshTakes = D.txRefreshTakes;
D.txRefreshTakes = async function () {
    const r = await _txRefreshTakes.apply(this, arguments);
    if (!this._tlibLoaded && !this._tlibLoading) { this._tlibLoading = true; try { await this.tlibLoad(); } catch (e) { console.warn('[texture_lib] load:', e); } this._tlibLoading = false; }
    return r;
};
// 4 · the last change may be younger than the debounce: `pagehide` is the one event a tab always gets, on a close and on a reload alike
window.addEventListener('pagehide', () => { try { D.tlibFlushBeacon(); } catch (e) {} });
// 5 · at load the row has already asked for the takes (texture_row boots before this file, defer order), so the wrap above missed that
//    call: on a texture take, wait for them and read the library then. On the strike nothing is read; the switch goes through the wrap.
function boot() {
    if (D._tlibLoaded || D._tlibLoading) return;
    if (!D.txIsOn()) return;
    if (!D._txTakes) { setTimeout(boot, 250); return; }
    D._tlibLoading = true;
    D.tlibLoad().catch(e => console.warn('[texture_lib] load:', e)).then(() => { D._tlibLoading = false; });
}
boot();

root.TextureLib = { LIB, NAME_RE };
}(typeof self !== 'undefined' ? self : this));
