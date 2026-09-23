// texture_row.js — A TEXTURE TAKE IN THE RHYTHM'S PLACE: THE TOP ROW (LGMF PLAN 1m.1, 2026-09-21; RUNNING_LOG §214 … §220;
// COMPOSITION_NOTES LG-63 · LG-64 · LG-65).
//
// His words: *"In the strikes drawer … I don't want to disturb any of the functionality because there's a lot of things that works
// good here. But then as an alternate module to the rhythm one … check, uncheck the rhythm and check the textures drawer. And
// eventually the multi-tempo drawer."* And the first mode: *"the first thing I'll do is select a texture. I see a dot, more or less
// proportionally spaced horizontally on the x-axis. Nothing orchestrated yet … by default they're all off. I click on certain ones,
// and I can just press spacebar and listen to the rhythm pattern played by claves … a range so like a left line and a right line …
// a cursor that I can pop into one part of the pattern."* Built ONE STEP AT A TIME, at his word (§218): this file is step one only —
// the instruments' columns under each onset are the next build.
//
// A mixin on the strikes drawer, as long_tone_ui.js is; `strike_drawer.js` is not changed by it:
//   · `source [the strike | a texture take | multitempo — later]` at the head of the rhythm area. On `the strike` the drawer is
//     exactly what it was — this file only moves its rhythm controls 20 px down to make room for that one line.
//   · on `a texture take`: the strike's rhythm controls and its strip are HIDDEN (CSS only — every value is where he left it), and in
//     their place a takes menu (his rhythm takes from Texture, bank/rhythm_takes.json, the `rhythms` store) and THE TOP ROW: every
//     attack of the take, ALL ITS LINES MERGED onto one timeline, spaced in time, all OFF. A click turns a dot on or off; `all on` ·
//     `all off` act inside the range. ONE ROW of thin MARKS, as a DAW draws MIDI notes (his word, §221): a mark's LEFT EDGE is the
//     onset, its width follows the zoom (thin when zoomed out, never wider than its neighbours' gap allows), so the running cursor is
//     seen to HIT it. Two onsets that land almost together stay TWO marks (LG-58) — they overlap until he zooms in, as notes do.
//   · SPACE (and Hear orchestrated) plays the ON dots, each ONE CLAVES NOTE — `toys_claves`, pair 2 high (key 41), the rack's own
//     Claves track (LGPerc ch 7) — through the drawer's one player, `playNotes`: a STRUCK note on MAIN (docs/DYNAMICS_LAW.md §1), its
//     anchor mf. The claves are a way of LISTENING: nothing is assigned to the percussion, nothing is inserted.
//   · a RANGE — a left and a right line, dragged by their grips on the ruler — and a CURSOR, dropped by a click on empty ground; play
//     starts at the cursor (inside the range) and ends at the right line.
//   · THE ZOOM STANDARD (his, §219 — the main score's and the beating panel's): ALT or CTRL + wheel zooms ABOUT THE MOUSE POINTER, a
//     horizontal wheel (or SHIFT + wheel) scrolls; the same direction as the main score (delta > 0 = in).
//   · REMEMBERED in the browser under a key of its own (`lgmf.textureRow.v1`) — NOT in the drawer's cfg, which a recalled harmony take
//     replaces whole: the mode, the take, and per take the ON dots (by `line:i`, 1l.6's identity of a dot), the range and the cursor.
//   · 1o.1 (2026-09-22, PLAN § `1o` the save structure): what is remembered per take is A DOCUMENT OF ITS OWN carrying a COPY of the
//     take's onsets — see `txLoad`. The row reads the document's dots, never Texture's, after the one realize that starts it.
//   · 1o.2: the documents are kept BY `id`, several on one texture — `texture ▾` STARTS a new empty pattern on a take (LG-85: *"texture
//     is the spine for a new thing always empty"*), `pattern ▾` on a second bar line RECALLS one by its own name; a pre-1o.1 pattern
//     becomes a document at the first load that can realize its take (`txMigrateLegacy`).
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[texture_row] the strikes drawer is not loaded'); return; }
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const TP_ = () => root.TexturePanel || null;

const STORE = 'lgmf.textureRow.v1';
const LINE_H = 20, BAR_H = 2 * LINE_H + 4;   // the command bar across the top: TWO lines (1o.2 — the texture's, the pattern's); the timeline below has the whole width
const RULER_H = 16, ROW_TOP = 24, MARK_H = 18, MARK_MIN = 1.5, MARK_MAX = 7, VIEW_H = ROW_TOP + MARK_H + 14;
const CLAVES_MS = 150, ANCHOR_MF = 100;
const PERC_KEY = 'percussion';
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HELP = ['click a mark: on / off', 'click the ruler or open ground: the cursor',
    'drag a gold grip on the ruler: the range · double-click the ruler: the whole take',
    'SPACE: play from the cursor, on the claves · SPACE again: stop',
    'ALT + wheel: zoom at the pointer · wheel sideways: scroll', '[ and ] (keys or buttons): the left / right line of the range to the cursor', 'all on · all off: the whole take', 'crop: every mark outside the range off'].join(String.fromCharCode(10));
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function loadStore() {
    let s = null; try { s = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) {}
    s = Object.assign({ mode: 'strike', pats: {}, docs: {}, open: null }, (s && typeof s === 'object') ? s : {});
    if (!s.pats || typeof s.pats !== 'object') s.pats = {}; if (!s.docs || typeof s.docs !== 'object') s.docs = {};
    // 1o.2: the documents BY ID. A 1o.1 document, kept under its texture's name, moves over once; a pre-1o.1 pattern (marks and columns,
    // no dots of its own) waits in `pats` for a load that can realize its take (txMigrateLegacy). `take` (the remembered texture) is
    // now `open` (the remembered document).
    Object.keys(s.pats).forEach(n => {
        const d = s.pats[n];
        if (d && d.texture && Array.isArray(d.texture.dots)) { if (!d.id) d.id = 'p' + Date.now().toString(36); s.docs[d.id] = d; delete s.pats[n]; if (s.take === n) s.open = d.id; }
        else if (s.take === n) s.openLegacy = n;
    });
    delete s.take;
    return s;
}

Object.assign(D, {
    _tx: null,          // the open document's TEXTURE (1o.1): { name, n, span, gap10, dots: [{ k, line, i, t }] } — its own copy, read by every row
    _txDoc: null,       // THE DOCUMENT that is open (1o.1) — `txPat()` returns it
    _txS: loadStore(),  // what is remembered
    _txV: null,         // the view: { px (per second), t0 (seconds at the left edge) }
    _txTakes: null,     // the rhythm takes, by name
    _txPatSig: '',      // the pattern menu as last painted (1o.2)

    txIsOn() { return this._txS.mode === 'texture'; },
    txPersist() { try { localStorage.setItem(STORE, JSON.stringify(this._txS)); } catch (e) {} },
    txPat() { return this._txDoc || null; },
    txRange() { const p = this.txPat(), sp = this._tx ? this._tx.span : 0; const r = p && Array.isArray(p.range) ? p.range : null; return r ? [clamp(+r[0] || 0, 0, sp), clamp(+r[1] || sp, 0, sp)] : [0, sp]; },

    // ---------------------------------------------------------------- the DOM
    txEnsureUI() {
        if (!this.el) return false;
        const wrap = this.el.querySelector('#skRhyWrap'); if (!wrap) return false;
        if (wrap.querySelector('#txBar')) return true;
        if (!document.getElementById('txStyle')) {
            const st = document.createElement('style'); st.id = 'txStyle';
            st.textContent =
                '#skRhyWrap > #skRhyCtl { top: 22px !important; }' +                                   // room for the one `source` line
                '#skRhyWrap.txOn > #skRhyCtl, #skRhyWrap.txOn > #skRhy { display: none !important; }' + // hidden, never rebuilt: his values stay
                '#skRhyWrap:not(.txOn) > #txView, #skRhyWrap:not(.txOn) > #txBar2, #skRhyWrap:not(.txOn) #txBar .txOnly { display: none !important; }' +
                '#skBody.txOn > #skSpacer { display: none !important; }' +                             // the row takes the free width
                '#txBar { pointer-events: none; } #txBar > * { pointer-events: auto; }' +              // on the strike, the bar is only its `source` menu
                '#txSvg .txDot { cursor: pointer; } #txSvg .txGrip { cursor: ew-resize; }';
            document.head.appendChild(st);
        }
        // ONE COMMAND BAR across the top (his word, §221): the source, and — on a texture take — the take, all on · all off, the cursor's
        // return, the zoom, the `i`. No text on the panel: every explanation is a hover. The timeline below it has the whole width.
        const bar = document.createElement('div'); bar.id = 'txBar';
        bar.style.cssText = 'position:absolute;left:4px;top:2px;right:4px;height:' + (LINE_H - 2) + 'px;display:flex;gap:6px;align-items:center;font-size:10px;z-index:2;white-space:nowrap';
        bar.innerHTML =
            '<label title="PLAN 1m.1 (2026-09-21): where the rhythm comes from — the strike: the drawer as it always was · a texture take: the attacks of one of your rhythm takes from Texture, as a row of marks to switch on and hear · multitempo: later"><span style="color:#9a9">source</span> <select id="txMode" style="' + INP + ';width:96px">' +
            '<option value="strike">the strike</option><option value="texture">a texture take</option><option value="mt" disabled>multitempo — later</option></select></label>' +
            '<select id="txTake" class="txOnly" style="' + INP + ';width:170px" title="PLAN 1o.2: TEXTURE ▾ — your rhythm takes, saved in Texture (rhythm take · save), the newest first. Choosing one STARTS A NEW, EMPTY PATTERN on it (the onsets copied, nothing on); the pattern you leave is kept under pattern ▾ below"></select>' +
            '<button id="txReload" class="txOnly" style="' + BTN + '" title="read the rhythm takes again (after saving a new one in Texture)">&#8635;</button>' +
            '<button id="txAllOn" class="txOnly" style="' + BTN + '" title="every mark of the take ON">all on</button>' +
            '<button id="txAllOff" class="txOnly" style="' + BTN + '" title="every mark of the take OFF">all off</button>' +
            '<button id="txCrop" class="txOnly" style="' + BTN + '" title="crop: every mark OUTSIDE the range off — the ones inside stay as they are">crop</button>' +
            '<button id="txHome" class="txOnly" style="' + BTN + '" title="the cursor back to the left line of the range">&#9198;</button>' +
            '<button id="txSetA" class="txOnly" style="' + BTN + '" title="the LEFT line of the range to the cursor — key [">[</button>' +
            '<button id="txSetB" class="txOnly" style="' + BTN + '" title="the RIGHT line of the range to the cursor — key ]">]</button>' +
            '<input id="txZoom" class="txOnly" type="range" min="0" max="1" step="0.005" value="0" style="width:140px" title="zoom — left: the whole take · right: close in (about the cursor when it is in view). ALT + wheel zooms at the pointer">' +
            '<span id="txI" class="txOnly" style="flex:none;width:13px;height:13px;border:1px solid #666;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#9a9;font-size:9px;cursor:help">i</span>';
        wrap.appendChild(bar);
        // THE SECOND LINE (1o.2): the PATTERN — the document that is open, and the menu that brings one back
        const bar2 = document.createElement('div'); bar2.id = 'txBar2';
        bar2.style.cssText = 'position:absolute;left:4px;top:' + (LINE_H + 2) + 'px;right:4px;height:' + (LINE_H - 2) + 'px;display:flex;gap:6px;align-items:center;font-size:10px;z-index:2;white-space:nowrap';
        bar2.innerHTML =
            '<span style="color:#9a9;cursor:help" title="PLAN 1o (2026-09-22): THE PATTERN — a document of its own on one texture: its marks, range, cursor, short and columns, carrying its own copy of the onsets. texture ▾ above starts a new empty one; this menu brings one back">pattern</span>' +
            '<select id="txPatSel" style="' + INP + ';width:250px" title="every pattern kept — the named ones first (A → Z), then the untitled, newest first: name · texture · marks on · columns"></select>' +
            '<span id="txTexLabel" style="color:#bbb;cursor:help" title="the texture this pattern was started on — a LABEL: the pattern carries its own copy of the onsets, so a take re-saved or deleted in Texture does not reach it"></span>';
        wrap.appendChild(bar2);
        bar2.querySelector('#txPatSel').addEventListener('change', e => { const id = e.target.value; if (id) this.txOpen(id); else this.txPaintPat(); });
        const view = document.createElement('div'); view.id = 'txView';
        view.style.cssText = 'position:absolute;left:0;top:' + BAR_H + 'px;right:0;bottom:0;overflow:hidden';
        view.innerHTML = '<svg id="txSvg" width="100%" height="' + VIEW_H + '" style="display:block;user-select:none"></svg>';
        wrap.appendChild(view);

        bar.querySelector('#txMode').addEventListener('change', e => this.txSetMode(e.target.value === 'texture' ? 'texture' : 'strike'));
        bar.querySelector('#txTake').addEventListener('change', e => this.txPick(e.target.value));
        bar.querySelector('#txReload').addEventListener('click', () => this.txRefreshTakes(true));
        bar.querySelector('#txAllOn').addEventListener('click', () => this.txAll(true));
        bar.querySelector('#txAllOff').addEventListener('click', () => this.txAll(false));
        bar.querySelector('#txCrop').addEventListener('click', () => this.txCrop());
        bar.querySelector('#txHome').addEventListener('click', () => this.txCursorHome());
        bar.querySelector('#txSetA').addEventListener('click', () => this.txSnap('a'));
        bar.querySelector('#txSetB').addEventListener('click', () => this.txSnap('b'));
        bar.querySelector('#txZoom').addEventListener('input', e => this.txZoomTo(+e.target.value));
        const svg = view.querySelector('#txSvg');
        svg.addEventListener('mousedown', ev => this.txDown(ev));
        svg.addEventListener('dblclick', ev => { const p = this.txPat(); if (!p || ev.clientY - svg.getBoundingClientRect().top > RULER_H) return; p.range = null; this.txPersist(); this.txRender(); this.setStatus(this.txLine()); });   // the ruler, twice: the whole take
        view.addEventListener('wheel', ev => this.txWheel(ev), { passive: false });
        if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (this.txIsOn()) this.txRender(); }).observe(view);
        return true;
    },

    // the mode on the page: two classes, nothing rebuilt — the strike's controls keep every value
    txApply() {
        if (!this.txEnsureUI()) return;
        const on = this.txIsOn(), wrap = this.el.querySelector('#skRhyWrap');
        wrap.classList.toggle('txOn', on); this.body.classList.toggle('txOn', on);
        const sel = wrap.querySelector('#txMode'); if (sel.value !== this._txS.mode) sel.value = on ? 'texture' : 'strike';
        if (!on) return;
        wrap.style.flex = '1 0 ' + clamp(this.cfg.rhythmW || 480, 320, 1400) + 'px';   // grows into the free width, never under the strike's own width
        if (!this._txTakes) this.txRefreshTakes(); else this.txRender();
    },
    txSetMode(m) {
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        this._txS.mode = m; this.txPersist(); this.txApply();
        if (m === 'strike') { if (this.strike) this.render(); this.setStatus('source: the strike — the drawer as it always was'); }
        else this.setStatus(this._tx ? this.txLine() : 'source: a texture take — choose a texture to start a pattern on, or bring one back with pattern ▾');
    },

    // ---------------------------------------------------------------- the takes
    async txRefreshTakes(say) {
        try {
            const f = await fetch('/api/snapshots?store=rhythms', { cache: 'no-store' }).then(r => r.json());
            this._txTakes = (f && f.panels && f.panels.rhythm) || {};
        } catch (e) { this._txTakes = {}; }
        const names = Object.keys(this._txTakes).sort((a, b) => String(this._txTakes[b].saved || '').localeCompare(String(this._txTakes[a].saved || '')));
        const sel = this.el.querySelector('#txTake');
        sel.innerHTML = '<option value="">' + (names.length ? 'texture ▾ · start a new pattern on… (' + names.length + ')' : 'no textures saved yet') + '</option>' + names.map(n => '<option value="' + escH(n) + '">' + escH(n) + '</option>').join('');
        sel.value = '';   // 1o.2: the menu STARTS; what is open is named on the second line
        this.txMigrateLegacy();
        const d = this._txS.open && this.txDocs()[this._txS.open];   // the remembered document opens whether or not its take is still in the store
        if (d) { if (this._txDoc !== d) this.txLoad(d); } else { this._tx = null; this._txDoc = null; }
        this.txRender(); this.txPaintPat();
        if (say) this.setStatus(names.length + ' rhythm take' + (names.length === 1 ? '' : 's') + ' in bank/rhythm_takes.json');
        if (!names.length && this.txIsOn() && !this._txDoc) this.setStatus('no rhythm takes yet — make one in Texture (rhythm take · save), then ↻ here', true);
    },
    // `texture ▾`: choosing a take STARTS a new pattern on it (1o.2); the menu goes back to its heading so the same texture can be chosen again
    txPick(name) {
        const sel = this.el && this.el.querySelector('#txTake'); if (sel) sel.value = '';
        if (name) this.txStart(name);
    },
    // ---------------------------------------------------------------- the document (1o.1, PLAN § `1o` the save structure)
    // A pattern is a DOCUMENT OF ITS OWN: `{ v, id, name, texture: { name, n, span, gap10, dots }, on, range, cursor, short, cols, sel }` —
    // the take's onsets COPIED INTO IT once, when it is started, by the one `realize` below; from then on the row reads the document's
    // own dots and Texture is not consulted: a take re-saved or deleted there touches nothing (§255), and the pattern opens on a page
    // without Texture. The texture's name is a LABEL (the takes menu, the status). Until 1o.2 the document is kept under its texture's
    // name, one per texture; 1o.2 keys it by `id` and starts several on one texture; 1o.3 moves it to disk.
    txDocNew(R) { return { v: 1, id: 'p' + Date.now().toString(36), name: '', texture: R, on: [], range: null, cursor: 0 }; },
    txDocs() { return this._txS.docs; },
    txDocTime(d) { const n = parseInt(String(d && d.id || '').slice(1), 36); return isFinite(n) ? n : 0; },
    // the list (1o.2): the named first, A → Z; then the untitled, newest first
    txDocList() {
        const L = Object.values(this.txDocs()).filter(d => d && d.texture && Array.isArray(d.texture.dots));
        const named = L.filter(d => d.name).sort((a, b) => String(a.name).localeCompare(String(b.name))), un = L.filter(d => !d.name).sort((a, b) => this.txDocTime(b) - this.txDocTime(a));
        return named.concat(un);
    },
    txDocLine(d) { const cols = Object.keys(d.cols || {}).filter(k => d.cols[k] && (d.cols[k].players || []).length).length; return (d.name || 'untitled') + ' · ' + (d.texture.name || '?') + ' · ' + (d.on || []).length + ' on · ' + cols + ' column' + (cols === 1 ? '' : 's'); },
    // A take is a RECIPE (1l.2): realized ONCE by Texture's own machinery (`TexturePanel.realize`, 1l.4), with no harmony — only its
    // attacks are wanted. The dots are numbered as `notesOf` numbers them (time, then line; `i` counts within a line), so `line:i`
    // names the same attack here, in Texture's lines view and in the rhythm panel.
    txRealize(name, quiet) {
        const T = TP_(), t = this._txTakes && this._txTakes[name], s = t && t.state, say = m => { if (!quiet) this.setStatus(m, true); };
        if (!T || typeof T.realize !== 'function') { say('Texture is not on this page — its engine draws a take to start a pattern on (one already started opens without it)'); return null; }
        if (!s || !s.spec) { say('no rhythm take named "' + name + '"'); return null; }
        let R; try { R = T.realize(s, null); } catch (e) { say('that take could not be drawn: ' + e.message); return null; }
        const origin = R.originOf(R.result), count = {}, dots = [];
        ((R.result && R.result.objects) || []).filter(o => o.type === 'waveCurve')
            .sort((a, b) => a.startSeconds - b.startSeconds || a.layer - b.layer)
            .forEach(o => { const L = o.layer, i = count[L] = (count[L] == null ? 0 : count[L] + 1); dots.push({ k: L + ':' + i, line: L, i, t: +(o.startSeconds - origin).toFixed(4) }); });
        const span = Math.max(R.spanOf(R.result), dots.length ? dots[dots.length - 1].t + 0.25 : 0.001);
        const gaps = dots.slice(1).map((d, i) => d.t - dots[i].t).filter(g => g > 0.002).sort((a, b) => a - b);
        return { name, n: dots.length, span, gap10: gaps.length ? gaps[Math.floor(gaps.length * 0.1)] : 0.05, dots };
    },
    // START (1o.2): a texture chosen starts a NEW, EMPTY pattern on it — the dots copied, nothing on, no columns (LG-85). It asks nothing:
    // the pattern he leaves is kept (in the browser by `id` until 1o.3, on disk from then on)
    txStart(name) {
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        const R = this.txRealize(name); if (!R) return false;
        const doc = this.txDocNew(R); this.txDocs()[doc.id] = doc;
        this.txLoad(doc); this.txRender();
        this.setStatus('a new pattern on "' + name + '" · ' + R.n + ' onsets, none on · the one you left is under pattern ▾');
        return true;
    },
    // OPEN (1o.2): a pattern by its own line in `pattern ▾` — its dots, marks, range, columns; the texture label follows it
    txOpen(id) {
        const doc = this.txDocs()[id]; if (!doc) { this.setStatus('that pattern is no longer here', true); this.txPaintPat(); return false; }
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        this.txLoad(doc); this.txRender(); this.setStatus('opened ' + this.txLine());
        return true;
    },
    // the OPEN document: the row, the columns and the lens read it through `txPat()`. The wraps in texture_cols.js (no column selected,
    // the undo stack emptied) and texture_lens.js (the defaults back) hook this.
    txLoad(doc) {
        this._txV = null;
        if (!doc || !doc.texture) { this._tx = null; this._txDoc = null; this._txS.open = null; this.txPersist(); this.txPaintPat(); return; }
        this._txDoc = doc; this._tx = doc.texture; this._txS.open = doc.id;
        this.txPersist(); this.txPaintPat();
    },
    // a pattern made before 1o.1 (marks and columns, no dots of its own — his at :5400) becomes a document at the first load that can
    // realize its take: the dots as the take stands now, its marks, range, cursor, columns and `short` kept; a mark or column naming an
    // onset the take no longer has is dropped and said [call — the old "starts again" reset is gone]. One whose take is not in the store
    // waits in `pats`, untouched, for a load that has it (1o.3's migration takes it over).
    txMigrateLegacy() {
        const P = this._txS.pats || {}; let moved = 0;
        Object.keys(P).forEach(name => {
            const old = P[name]; if (!old || typeof old !== 'object') { delete P[name]; return; }
            const R = this.txRealize(name, true); if (!R) return;
            const doc = Object.assign(this.txDocNew(R), old, { texture: R }); delete doc.n;
            const keys = new Set(R.dots.map(d => d.k)), had = (doc.on || []).length;
            doc.on = (doc.on || []).filter(k => keys.has(k)); if (Array.isArray(doc.sel)) doc.sel = doc.sel.filter(k => keys.has(k));
            Object.keys(doc.cols || {}).forEach(k => { if (!keys.has(k)) delete doc.cols[k]; });
            if (had !== doc.on.length) this._txNote = 'the pattern on "' + name + '" was made before its onsets were its own and the take has changed since: ' + (had - doc.on.length) + ' of its ' + had + ' marks named onsets the take no longer has and were dropped';
            this.txDocs()[doc.id] = doc; delete P[name]; moved++;
            if (this._txS.openLegacy === name) { this._txS.open = doc.id; delete this._txS.openLegacy; }
        });
        if (moved) this.txPersist();
        return moved;
    },
    // the pattern menu and the texture label, painted after every render — the menu rebuilt only when its lines changed
    txPaintPat() {
        const sel = this.el && this.el.querySelector('#txPatSel'), lab = this.el && this.el.querySelector('#txTexLabel'); if (!sel) return;
        const L = this.txDocList(), open = this._txDoc ? this._txDoc.id : '';
        const sig = L.map(d => d.id + '|' + this.txDocLine(d)).join(String.fromCharCode(10)) + '@' + open;
        if (sig !== this._txPatSig) { this._txPatSig = sig; sel.innerHTML = '<option value="">pattern ▾ (' + L.length + ')</option>' + L.map(d => '<option value="' + escH(d.id) + '">' + escH(this.txDocLine(d)) + '</option>').join(''); sel.value = open; }
        if (lab) lab.textContent = this._txDoc ? 'on "' + (this._tx.name || '?') + '"' : '';
    },
    txLine() {
        if (!this._tx) return 'no pattern';
        const p = this.txPat(), r = this.txRange(), note = this._txNote; this._txNote = '';
        return (note ? note + ' · ' : '') + 'pattern ' + (p.name ? '"' + p.name + '"' : '(untitled)') + ' on "' + this._tx.name + '" · ' + this._tx.dots.length + ' dots · ' + p.on.length + ' on · ' + this._tx.span.toFixed(2) + ' s · range ' + r[0].toFixed(2) + '–' + r[1].toFixed(2) + ' s';
    },

    // ---------------------------------------------------------------- the row
    txW() { const v = this.el.querySelector('#txView'), w = this.el.querySelector('#skRhyWrap'); return Math.max(120, (v && v.clientWidth) || (w && w.clientWidth) || 480); },
    txFitPx() { return (this.txW() - 24) / Math.max(0.001, this._tx.span); },
    txView() {
        if (!this._txV) this._txV = { px: this.txFitPx(), t0: -12 / this.txFitPx() };
        const v = this._txV, fit = this.txFitPx(), W = this.txW();
        v.px = clamp(v.px, fit * 0.9, Math.max(fit, 4000));                       // from the whole take to 4 px a millisecond
        v.t0 = clamp(v.t0, -12 / v.px, Math.max(-12 / v.px, this._tx.span + 12 / v.px - W / v.px));
        return v;
    },
    txX(t) { const v = this._txV; return (t - v.t0) * v.px; },
    // the zoom slider: 0 = the whole take, 1 = the closest (a log scale between them); it zooms about the cursor when that is in view,
    // else about the middle of the view
    txZoomMax() { return Math.max(this.txFitPx() * 1.01, 4000); },
    txZoomPos() { const f = this.txFitPx(); return clamp(Math.log(this._txV.px / f) / Math.log(this.txZoomMax() / f), 0, 1); },
    txZoomTo(pos) {
        if (!this._tx) return; const v = this.txView(), W = this.txW(), f = this.txFitPx(), p = this.txPat();
        const xc = this.txX(+p.cursor || 0), x = (xc >= 0 && xc <= W) ? xc : W / 2, tAt = this.txT(x);
        v.px = f * Math.pow(this.txZoomMax() / f, clamp(pos, 0, 1)); this.txView(); v.t0 = tAt - x / v.px; this.txRender();
    },
    // a mark's width in pixels: six tenths of the take's TYPICAL SMALL GAP (the tenth percentile of its onset-to-onset gaps) at this
    // zoom — so it thins as he zooms out and never swallows the rhythm it shows
    txMarkW() { return clamp(0.6 * (this._tx.gap10 || 0.05) * this._txV.px, MARK_MIN, MARK_MAX); },
    txT(x) { const v = this._txV; return v.t0 + x / v.px; },
    txH() { return VIEW_H; },   // the drawing's height — the columns (1m.2, texture_cols.js) take the whole view
    txRender() {
        if (!this.el || !this.txIsOn()) return;
        const svg = this.el.querySelector('#txSvg'), info = this.el.querySelector('#txI'); if (!svg) return;
        if (!this._tx) { svg.innerHTML = '<text x="8" y="28" font-size="11" fill="#777">choose a texture at the left — it starts a new pattern; pattern ▾ brings one back</text>'; if (info) info.title = HELP; this.txPaintPat(); return; }
        const v = this.txView(), W = this.txW(), H = this.txH(), p = this.txPat(), on = new Set(p.on), r = this.txRange();
        const tA = this.txT(0), tB = this.txT(W);
        let s = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#17171b"/><rect x="0" y="0" width="' + W + '" height="' + RULER_H + '" fill="#1e1e24"/>';
        // the ruler: a label about every 80 px
        const want = 80 / v.px, steps = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60, 120, 300];
        const step = steps.find(x => x >= want) || 600, dec = step < 0.1 ? 2 : step < 1 ? 1 : 0;
        for (let t = Math.max(0, Math.ceil(tA / step) * step); t <= Math.min(this._tx.span, tB); t += step)
            s += '<line x1="' + this.txX(t) + '" y1="0" x2="' + this.txX(t) + '" y2="' + H + '" stroke="#2c2c33"/><text x="' + (this.txX(t) + 3) + '" y="11" font-size="9" fill="#777">' + t.toFixed(dec) + '</text>';
        // the marks: ONE row; the left edge IS the onset; the width follows the zoom (§221)
        const mw = this.txMarkW(); let drawn = 0;
        this._tx.dots.forEach(d => {
            const x = this.txX(d.t);
            if (x < -mw || x > W + mw) return;
            const isOn = on.has(d.k), inR = d.t >= r[0] - 1e-6 && d.t <= r[1] + 1e-6, thin = mw < 3;
            s += '<rect class="txDot" data-k="' + d.k + '" x="' + x.toFixed(1) + '" y="' + ROW_TOP + '" width="' + mw.toFixed(1) + '" height="' + MARK_H + '" fill="' + (isOn ? '#E8CF9A' : (thin ? '#6a6a76' : '#33333c')) + '" stroke="' + (thin ? 'none' : (isOn ? '#E8CF9A' : '#7a7a86')) + '" stroke-width="1" opacity="' + (inR ? 1 : 0.35) + '"><title>' + d.t.toFixed(3) + ' s · line ' + (d.line + 1) + ' · ' + (isOn ? 'ON' : 'off') + '</title></rect>';
            drawn++;
        });
        // the range: the ground outside it dimmed, a line and a grip at each end
        const xa = this.txX(r[0]), xb = this.txX(r[1]);
        if (xa > 0) s += '<rect x="0" y="' + RULER_H + '" width="' + Math.min(W, xa) + '" height="' + (H - RULER_H) + '" fill="#000" opacity="0.35" pointer-events="none"/>';
        if (xb < W) s += '<rect x="' + Math.max(0, xb) + '" y="' + RULER_H + '" width="' + (W - Math.max(0, xb)) + '" height="' + (H - RULER_H) + '" fill="#000" opacity="0.35" pointer-events="none"/>';
        [['a', xa, 1], ['b', xb, -1]].forEach(g => {
            s += '<line x1="' + g[1] + '" y1="0" x2="' + g[1] + '" y2="' + H + '" stroke="#C9A05A" stroke-width="1.5" pointer-events="none"/>' +
                 '<path class="txGrip" data-g="' + g[0] + '" d="M' + g[1] + ',0 l' + (9 * g[2]) + ',0 l' + (-9 * g[2]) + ',' + RULER_H + ' z" fill="#C9A05A"><title>' + (g[0] === 'a' ? 'the left line' : 'the right line') + ' of the range — drag</title></path>';
        });
        // the cursor he dropped, and the one that runs while it plays
        const xc = this.txX(clamp(+p.cursor || 0, 0, this._tx.span));
        s += '<line x1="' + xc + '" y1="0" x2="' + xc + '" y2="' + H + '" stroke="#7fd4ff" stroke-width="1" pointer-events="none"/><path d="M' + (xc - 4) + ',0 l8,0 l-4,6 z" fill="#7fd4ff" pointer-events="none"/>';
        s += '<line id="txRun" x1="0" y1="0" x2="0" y2="' + H + '" stroke="#ff7f7f" stroke-width="1.5" pointer-events="none" style="display:none"/>';
        svg.setAttribute('height', H); svg.innerHTML = s;
        if (info) info.title = this._tx.dots.length + ' marks · ' + p.on.length + ' on · ' + this._tx.span.toFixed(2) + ' s · range ' + r[0].toFixed(2) + '–' + r[1].toFixed(2) + ' s · cursor ' + (+p.cursor || 0).toFixed(2) + ' s' + String.fromCharCode(10, 10) + HELP;
        { const z = this.el.querySelector('#txZoom'); if (z && document.activeElement !== z) z.value = this.txZoomPos(); }
        if (this._txRunT != null) this.txPaintRun();
        this.txPaintPat();
    },

    // ---------------------------------------------------------------- the hand
    txDown(ev) {
        if (!this._tx || ev.button !== 0) return;
        const svg = this.el.querySelector('#txSvg'), rect = svg.getBoundingClientRect(), x = ev.clientX - rect.left, t = ev.target;
        const p = this.txPat();
        if (t && t.classList && t.classList.contains('txGrip')) { ev.preventDefault(); return this.txDragGrip(t.dataset.g, rect); }
        if (t && t.classList && t.classList.contains('txDot')) {
            const k = t.dataset.k, at = p.on.indexOf(k);
            if (at >= 0) p.on.splice(at, 1); else p.on.push(k);
            this.txPersist(); this.txRender(); return;
        }
        // in the row, a click NEAR a thin mark is a click on it (the nearest within 4 px); on the ruler, or on open ground, the cursor
        const y = ev.clientY - rect.top;
        if (y >= ROW_TOP - 2 && y <= ROW_TOP + MARK_H + 2) {
            const mw = this.txMarkW(); let best = null, bd = 1e9;
            this._tx.dots.forEach(d => { const dx = Math.abs(x - (this.txX(d.t) + mw / 2)); if (dx < bd) { bd = dx; best = d; } });
            if (best && bd <= Math.max(4, mw / 2 + 2)) { const at = p.on.indexOf(best.k); if (at >= 0) p.on.splice(at, 1); else p.on.push(best.k); this.txPersist(); this.txRender(); return; }
        }
        p.cursor = +clamp(this.txT(x), 0, this._tx.span).toFixed(3); this.txPersist(); this.txRender();
    },
    // the cursor back to the left line of the range (his word, §221), the view brought to it
    txCursorHome() {
        const p = this.txPat(); if (!p) return;
        p.cursor = +this.txRange()[0].toFixed(3); this.txPersist();
        const v = this.txView(), xc = this.txX(p.cursor); if (xc < 0 || xc > this.txW() - 8) v.t0 = p.cursor - 24 / v.px;
        this.txRender();
    },
    txDragGrip(g, rect) {
        const p = this.txPat(), move = ev => {
            const r = this.txRange(), t = +clamp(this.txT(ev.clientX - rect.left), 0, this._tx.span).toFixed(3);
            if (g === 'a') r[0] = Math.min(t, r[1] - 0.01); else r[1] = Math.max(t, r[0] + 0.01);
            p.range = [r[0], r[1]]; this.txRender();
        }, up = () => { window.removeEventListener('mousemove', move, true); window.removeEventListener('mouseup', up, true); this.txPersist(); this.setStatus(this.txLine()); };
        window.addEventListener('mousemove', move, true); window.addEventListener('mouseup', up, true);
    },
    // `all on` · `all off` — THE WHOLE TAKE (his word, §222): inside-the-range left marks ON outside it that he could not clear
    // without losing the ones he wanted
    txAll(on) {
        const p = this.txPat(); if (!p) return;
        p.on = on ? this._tx.dots.map(d => d.k) : [];
        this.txPersist(); this.txRender(); this.setStatus(this.txLine());
    },
    // `crop` (his word, §223): every mark OUTSIDE the range off; inside it nothing changes
    txCrop() {
        const p = this.txPat(); if (!p) return;
        const r = this.txRange(), inside = new Set(this._tx.dots.filter(d => d.t >= r[0] - 1e-6 && d.t <= r[1] + 1e-6).map(d => d.k));
        const had = p.on.length; p.on = p.on.filter(k => inside.has(k));
        this.txPersist(); this.txRender(); this.setStatus('crop: ' + (had - p.on.length) + ' marks outside the range turned off · ' + this.txLine());
    },
    // a line of the range SNAPS TO THE CURSOR (his word, §222) — `[` the left, `]` the right; a cursor on the far side of the other line
    // takes that other line to the take's end, so the range is never inside out
    txSnap(g) {
        const p = this.txPat(); if (!p) return;
        const r = this.txRange(), c = clamp(+p.cursor || 0, 0, this._tx.span);
        if (g === 'a') { if (c >= r[1] - 0.01) r[1] = this._tx.span; r[0] = Math.min(c, r[1] - 0.01); }
        else { if (c <= r[0] + 0.01) r[0] = 0; r[1] = Math.max(c, r[0] + 0.01); }
        p.range = [+r[0].toFixed(3), +r[1].toFixed(3)]; this.txPersist(); this.txRender(); this.setStatus(this.txLine());
    },
    // THE ZOOM STANDARD (§219): ALT or CTRL + wheel zooms about the POINTER's own time; a sideways wheel (or SHIFT + wheel) scrolls
    txWheel(ev) {
        if (!this._tx) return;
        const v = this.txView(), rect = this.el.querySelector('#txSvg').getBoundingClientRect(), x = ev.clientX - rect.left;
        if (ev.ctrlKey || ev.altKey) {
            ev.preventDefault(); ev.stopPropagation();
            const delta = ev.deltaX || ev.deltaY; if (!delta) return;
            const tAt = this.txT(x); v.px *= (delta > 0 ? 1.18 : 0.85); this.txView(); v.t0 = tAt - x / v.px; this.txRender(); return;
        }
        const dx = Math.abs(ev.deltaX) > 0 ? ev.deltaX : (ev.shiftKey ? ev.deltaY : 0);
        if (dx) { ev.preventDefault(); ev.stopPropagation(); v.t0 += dx / v.px; this.txRender(); }
    },

    // ---------------------------------------------------------------- the ear
    txPercLane() { const T = this.tracks() || []; return T.findIndex(t => t && t.instKey === PERC_KEY && t.seatOf == null); },
    async txPlay() {
        if (!this._tx) { this.setStatus('choose a rhythm take first', true); return; }
        const p = this.txPat(), r = this.txRange(), on = new Set(p.on), lane = this.txPercLane();
        if (lane < 0) { this.setStatus('no Percussion player on this page — the claves are his', true); return; }
        const T = TP_(), cl = (T && T.CLAVES) || { tech: 'toys_claves', midi: 41 };
        const c = +p.cursor || 0, from = (c > r[0] && c < r[1]) ? c : r[0];
        const dots = this._tx.dots.filter(d => on.has(d.k) && d.t >= from - 1e-6 && d.t <= r[1] + 1e-6);
        if (!dots.length) { this.setStatus(p.on.length ? 'no ON dot between ' + from.toFixed(2) + ' s and ' + r[1].toFixed(2) + ' s — move the cursor or the range' : 'every dot is off — click some on (or all on)', true); return; }
        const notes = dots.map(d => ({ lane, tech: cl.tech, midi: cl.midi, vel: ANCHOR_MF, cents: 0, onMs: Math.round((d.t - from) * 1000), durMs: CLAVES_MS }));
        await this.playNotes(notes, 'the texture row on the claves · from ' + from.toFixed(2) + ' s');
        const e = E_(); if (e && e._playing) this.txStartRun(from, r[1]);
    },
    txStartRun(from, to) {
        this.txStopRun(); this._txRunFrom = from; this._txRunTo = to;
        this._txRunT = setInterval(() => {
            const e = E_(); if (!e || !e._playing) return this.txStopRun();
            this._txRunAt = from + (performance.now() - this.base) / 1000;
            if (this._txRunAt > to + 0.6) return this.txStopRun();
            const v = this._txV, W = this.txW();
            if (v && this._txRunAt >= 0 && (this.txX(this._txRunAt) > W - 8 || this.txX(this._txRunAt) < 0)) { v.t0 = this._txRunAt - 24 / v.px; this.txRender(); }   // page on when the cursor leaves the view
            this.txPaintRun();
        }, 40);
    },
    txPaintRun() {
        const ln = this.el && this.el.querySelector('#txRun'); if (!ln || this._txRunAt == null) return;
        const x = this.txX(Math.max(this._txRunFrom, this._txRunAt)); ln.setAttribute('x1', x); ln.setAttribute('x2', x); ln.style.display = '';
    },
    txStopRun() {
        if (this._txRunT != null) { clearInterval(this._txRunT); this._txRunT = null; }
        this._txRunAt = null; const ln = this.el && this.el.querySelector('#txRun'); if (ln) ln.style.display = 'none';
    },
});

// ---------------------------------------------------------------- the hooks — each passes straight through on `the strike`
// 1 · SPACE and Hear orchestrated both call play('orch'): on a texture take they play the row
const _play = D.play;
D.play = async function (mode) { if (mode === 'orch' && this.txIsOn()) return this.txPlay(); return _play.apply(this, arguments); };
// 2 · the one stop path also stops the running cursor
const _onStopped = D.onStopped;
D.onStopped = function () { try { this.txStopRun(); } catch (e) {} return _onStopped.apply(this, arguments); };
// 3 · nothing to insert yet: the row is the rhythm alone, heard on the claves — the columns come with the next build
const _insert = D.insert;
D.insert = function () {
    if (this.txIsOn()) { this.setStatus('source: a texture take — nothing to insert yet: the row is the rhythm alone (switch the source to the strike to insert a strike)', true); return; }
    return _insert.apply(this, arguments);
};
// 3b · the keys `[` and `]` — only while the drawer shows a texture take, and never while he types in a box
window.addEventListener('keydown', ev => {
    if ((ev.key !== '[' && ev.key !== ']') || ev.ctrlKey || ev.altKey || ev.metaKey) return;
    if (!D.el || D.el.style.display === 'none' || !D.txIsOn() || !D._tx) return;
    const t = ev.target; if (t && t.matches && t.matches('textarea, input[type=text], input[type=number], input[type=search], input:not([type])')) return;
    ev.preventDefault(); ev.stopPropagation(); D.txSnap(ev.key === '[' ? 'a' : 'b');
}, true);
// 4 · the mode follows every render, and the drawer opening
const _render = D.render;
D.render = function () { const r = _render.apply(this, arguments); try { this.txApply(); } catch (e) { console.warn('[texture_row] apply:', e); } return r; };
const _toggle = D.toggle;
D.toggle = function () { const r = _toggle.apply(this, arguments); try { this.txApply(); } catch (e) { console.warn('[texture_row] apply:', e); } return r; };
// the drawer is built before this file runs (defer order)
if (D.el) D.txApply();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.txApply(); });
else setTimeout(() => { if (D.el) D.txApply(); }, 0);

}(typeof self !== 'undefined' ? self : this));
