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
//     `all off` act inside the range. Two onsets that land almost together stay TWO dots (LG-58) — drawn on stepped levels so each can
//     be clicked.
//   · SPACE (and Hear orchestrated) plays the ON dots, each ONE CLAVES NOTE — `toys_claves`, pair 2 high (key 41), the rack's own
//     Claves track (LGPerc ch 7) — through the drawer's one player, `playNotes`: a STRUCK note on MAIN (docs/DYNAMICS_LAW.md §1), its
//     anchor mf. The claves are a way of LISTENING: nothing is assigned to the percussion, nothing is inserted.
//   · a RANGE — a left and a right line, dragged by their grips on the ruler — and a CURSOR, dropped by a click on empty ground; play
//     starts at the cursor (inside the range) and ends at the right line.
//   · THE ZOOM STANDARD (his, §219 — the main score's and the beating panel's): ALT or CTRL + wheel zooms ABOUT THE MOUSE POINTER, a
//     horizontal wheel (or SHIFT + wheel) scrolls; the same direction as the main score (delta > 0 = in).
//   · REMEMBERED in the browser under a key of its own (`lgmf.textureRow.v1`) — NOT in the drawer's cfg, which a recalled harmony take
//     replaces whole: the mode, the take, and per take the ON dots (by `line:i`, 1l.6's identity of a dot), the range and the cursor.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[texture_row] the strikes drawer is not loaded'); return; }
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const TP_ = () => root.TexturePanel || null;

const STORE = 'lgmf.textureRow.v1';
const CTL_W = 150;                 // the controls' column, left of the row (the strike's own column is 132 px + its pad)
const RULER_H = 16, ROW_TOP = 24, DOT_R = 5, LEVELS = 3, LEVEL_DY = 12, VIEW_H = ROW_TOP + LEVELS * LEVEL_DY + 14;
const CLAVES_MS = 150, ANCHOR_MF = 100;
const PERC_KEY = 'percussion';
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function loadStore() {
    try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && typeof s === 'object') return Object.assign({ mode: 'strike', take: '', pats: {} }, s); } catch (e) {}
    return { mode: 'strike', take: '', pats: {} };
}

Object.assign(D, {
    _tx: null,          // the realized take: { name, dots: [{ k, line, i, t }], span }
    _txS: loadStore(),  // what is remembered
    _txV: null,         // the view: { px (per second), t0 (seconds at the left edge) }
    _txTakes: null,     // the rhythm takes, by name

    txIsOn() { return this._txS.mode === 'texture'; },
    txPersist() { try { localStorage.setItem(STORE, JSON.stringify(this._txS)); } catch (e) {} },
    txPat() {
        const n = this._tx && this._tx.name; if (!n) return null;
        return this._txS.pats[n] || (this._txS.pats[n] = { n: this._tx.dots.length, on: [], range: null, cursor: 0 });
    },
    txRange() { const p = this.txPat(), sp = this._tx ? this._tx.span : 0; const r = p && Array.isArray(p.range) ? p.range : null; return r ? [clamp(+r[0] || 0, 0, sp), clamp(+r[1] || sp, 0, sp)] : [0, sp]; },

    // ---------------------------------------------------------------- the DOM
    txEnsureUI() {
        if (!this.el) return false;
        const wrap = this.el.querySelector('#skRhyWrap'); if (!wrap) return false;
        if (wrap.querySelector('#txHead')) return true;
        if (!document.getElementById('txStyle')) {
            const st = document.createElement('style'); st.id = 'txStyle';
            st.textContent =
                '#skRhyWrap > #skRhyCtl { top: 22px !important; }' +                                   // room for the one `source` line
                '#skRhyWrap.txOn > #skRhyCtl, #skRhyWrap.txOn > #skRhy { display: none !important; }' + // hidden, never rebuilt: his values stay
                '#skRhyWrap:not(.txOn) > #txCtl, #skRhyWrap:not(.txOn) > #txView { display: none !important; }' +
                '#skBody.txOn > #skSpacer { display: none !important; }' +                             // the row takes the free width
                '#txSvg .txDot { cursor: pointer; } #txSvg .txGrip { cursor: ew-resize; }';
            document.head.appendChild(st);
        }
        const head = document.createElement('div'); head.id = 'txHead';
        head.style.cssText = 'position:absolute;left:4px;top:2px;width:' + (CTL_W - 8) + 'px;font-size:10px;z-index:2;white-space:nowrap';
        head.title = 'PLAN 1m.1 (2026-09-21): where the rhythm comes from — the strike: the drawer as it always was · a texture take: the attacks of one of your rhythm takes from Texture, as a row of dots to switch on and hear · multitempo: later';
        head.innerHTML = '<label><span style="color:#9a9">source</span> <select id="txMode" style="' + INP + ';width:96px">' +
            '<option value="strike">the strike</option><option value="texture">a texture take</option><option value="mt" disabled>multitempo — later</option></select></label>';
        wrap.appendChild(head);
        const ctl = document.createElement('div'); ctl.id = 'txCtl';
        ctl.style.cssText = 'position:absolute;left:4px;top:22px;width:' + (CTL_W - 8) + 'px;display:flex;flex-direction:column;gap:4px;font-size:10px;z-index:2';
        ctl.innerHTML =
            '<span style="color:#9a9">texture take</span>' +
            '<div style="display:flex;gap:3px"><select id="txTake" style="' + INP + ';flex:1 1 auto;min-width:0" title="your rhythm takes, saved in Texture (rhythm take · save) — the newest first"></select>' +
            '<button id="txReload" style="' + BTN + '" title="read the rhythm takes again (after saving a new one in Texture)">&#8635;</button></div>' +
            '<div><button id="txAllOn" style="' + BTN + '" title="every dot inside the range ON">all on</button> <button id="txAllOff" style="' + BTN + '" title="every dot inside the range OFF">all off</button></div>' +
            '<div><button id="txWhole" style="' + BTN + '" title="the range back to the whole take">range: whole</button> <button id="txFit" style="' + BTN + '" title="the whole take in view">fit</button></div>' +
            '<div id="txInfo" style="color:#9a9;white-space:normal;line-height:1.35"></div>' +
            '<div style="color:#666;white-space:normal;line-height:1.35">click a dot: on / off · click the ground: the cursor · drag a grip on the ruler: the range · SPACE: play from the cursor, on the claves · ALT + wheel: zoom at the pointer · wheel sideways: scroll</div>';
        wrap.appendChild(ctl);
        const view = document.createElement('div'); view.id = 'txView';
        view.style.cssText = 'position:absolute;left:' + CTL_W + 'px;top:0;right:0;bottom:0;overflow:hidden';
        view.innerHTML = '<svg id="txSvg" width="100%" height="' + VIEW_H + '" style="display:block;user-select:none"></svg>';
        wrap.appendChild(view);

        head.querySelector('#txMode').addEventListener('change', e => this.txSetMode(e.target.value === 'texture' ? 'texture' : 'strike'));
        ctl.querySelector('#txTake').addEventListener('change', e => this.txPick(e.target.value));
        ctl.querySelector('#txReload').addEventListener('click', () => this.txRefreshTakes(true));
        ctl.querySelector('#txAllOn').addEventListener('click', () => this.txAll(true));
        ctl.querySelector('#txAllOff').addEventListener('click', () => this.txAll(false));
        ctl.querySelector('#txWhole').addEventListener('click', () => { const p = this.txPat(); if (!p) return; p.range = null; this.txPersist(); this.txRender(); });
        ctl.querySelector('#txFit').addEventListener('click', () => { this._txV = null; this.txRender(); });
        const svg = view.querySelector('#txSvg');
        svg.addEventListener('mousedown', ev => this.txDown(ev));
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
        else this.setStatus(this._tx ? this.txLine() : 'source: a texture take — choose one of your rhythm takes');
    },

    // ---------------------------------------------------------------- the takes
    async txRefreshTakes(say) {
        try {
            const f = await fetch('/api/snapshots?store=rhythms', { cache: 'no-store' }).then(r => r.json());
            this._txTakes = (f && f.panels && f.panels.rhythm) || {};
        } catch (e) { this._txTakes = {}; }
        const names = Object.keys(this._txTakes).sort((a, b) => String(this._txTakes[b].saved || '').localeCompare(String(this._txTakes[a].saved || '')));
        const sel = this.el.querySelector('#txTake');
        sel.innerHTML = '<option value="">' + (names.length ? 'choose… (' + names.length + ')' : 'none saved yet') + '</option>' + names.map(n => '<option value="' + escH(n) + '">' + escH(n) + '</option>').join('');
        if (this._txS.take && this._txTakes[this._txS.take]) { sel.value = this._txS.take; if (!this._tx || this._tx.name !== this._txS.take) this.txLoad(this._txS.take); }
        else { this._tx = null; }
        this.txRender();
        if (say) this.setStatus(names.length + ' rhythm take' + (names.length === 1 ? '' : 's') + ' in bank/rhythm_takes.json');
        if (!names.length && this.txIsOn()) this.setStatus('no rhythm takes yet — make one in Texture (rhythm take · save), then ↻ here', true);
    },
    txPick(name) {
        const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); }
        this._txS.take = name || ''; this.txPersist();
        if (!name) { this._tx = null; this.txRender(); return; }
        this.txLoad(name); this.txRender();
        if (this._tx) this.setStatus(this.txLine());
    },
    // A take is a RECIPE (1l.2): realized by Texture's own machinery (`TexturePanel.realize`, 1l.4), with no harmony — only its attacks
    // are wanted. The dots are numbered as `notesOf` numbers them (time, then line; `i` counts within a line), so `line:i` names the
    // same attack here, in Texture's lines view and in the rhythm panel.
    txLoad(name) {
        const T = TP_(), t = this._txTakes && this._txTakes[name], s = t && t.state;
        this._tx = null; this._txV = null;
        if (!T || typeof T.realize !== 'function') { this.setStatus('Texture is not on this page — its engine draws the take', true); return; }
        if (!s || !s.spec) { this.setStatus('no rhythm take named "' + name + '"', true); return; }
        let R; try { R = T.realize(s, null); } catch (e) { this.setStatus('that take could not be drawn: ' + e.message, true); return; }
        const origin = R.originOf(R.result), count = {}, dots = [];
        ((R.result && R.result.objects) || []).filter(o => o.type === 'waveCurve')
            .sort((a, b) => a.startSeconds - b.startSeconds || a.layer - b.layer)
            .forEach(o => { const L = o.layer, i = count[L] = (count[L] == null ? 0 : count[L] + 1); dots.push({ k: L + ':' + i, line: L, i, t: +(o.startSeconds - origin).toFixed(4) }); });
        const span = Math.max(R.spanOf(R.result), dots.length ? dots[dots.length - 1].t + 0.25 : 0.001);
        this._tx = { name, dots, span };
        const p = this.txPat();
        if (p.n !== dots.length) { const had = (p.on || []).length; p.n = dots.length; p.on = []; p.range = null; p.cursor = 0; if (had) this._txNote = 'the take "' + name + '" has changed since its pattern was made (' + had + ' dots were on) — the pattern starts again'; }
        this.txPersist();
    },
    txLine() {
        if (!this._tx) return 'no take';
        const p = this.txPat(), r = this.txRange(), note = this._txNote; this._txNote = '';
        return (note ? note + ' · ' : '') + 'texture take "' + this._tx.name + '" · ' + this._tx.dots.length + ' dots · ' + p.on.length + ' on · ' + this._tx.span.toFixed(2) + ' s · range ' + r[0].toFixed(2) + '–' + r[1].toFixed(2) + ' s';
    },

    // ---------------------------------------------------------------- the row
    txW() { const v = this.el.querySelector('#txView'), w = this.el.querySelector('#skRhyWrap'); return Math.max(120, (v && v.clientWidth) || ((w && w.clientWidth) || 480) - CTL_W); },
    txFitPx() { return (this.txW() - 24) / Math.max(0.001, this._tx.span); },
    txView() {
        if (!this._txV) this._txV = { px: this.txFitPx(), t0: -12 / this.txFitPx() };
        const v = this._txV, fit = this.txFitPx(), W = this.txW();
        v.px = clamp(v.px, fit * 0.9, Math.max(fit, 4000));                       // from the whole take to 4 px a millisecond
        v.t0 = clamp(v.t0, -12 / v.px, Math.max(-12 / v.px, this._tx.span + 12 / v.px - W / v.px));
        return v;
    },
    txX(t) { const v = this._txV; return (t - v.t0) * v.px; },
    txT(x) { const v = this._txV; return v.t0 + x / v.px; },
    txRender() {
        if (!this.el || !this.txIsOn()) return;
        const svg = this.el.querySelector('#txSvg'), info = this.el.querySelector('#txInfo'); if (!svg) return;
        if (!this._tx) { svg.innerHTML = '<text x="8" y="28" font-size="11" fill="#777">choose a rhythm take at the left</text>'; if (info) info.textContent = ''; return; }
        const v = this.txView(), W = this.txW(), H = VIEW_H, p = this.txPat(), on = new Set(p.on), r = this.txRange();
        const tA = this.txT(0), tB = this.txT(W);
        let s = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#17171b"/><rect x="0" y="0" width="' + W + '" height="' + RULER_H + '" fill="#1e1e24"/>';
        // the ruler: a label about every 80 px
        const want = 80 / v.px, steps = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60, 120, 300];
        const step = steps.find(x => x >= want) || 600, dec = step < 0.1 ? 2 : step < 1 ? 1 : 0;
        for (let t = Math.max(0, Math.ceil(tA / step) * step); t <= Math.min(this._tx.span, tB); t += step)
            s += '<line x1="' + this.txX(t) + '" y1="0" x2="' + this.txX(t) + '" y2="' + H + '" stroke="#2c2c33"/><text x="' + (this.txX(t) + 3) + '" y="11" font-size="9" fill="#777">' + t.toFixed(dec) + '</text>';
        // the dots, on stepped levels where they would sit on one another (two near-together onsets stay TWO dots)
        const last = []; let drawn = 0;
        this._tx.dots.forEach(d => {
            const x = this.txX(d.t);
            let lv = 0; while (lv < LEVELS - 1 && last[lv] != null && x - last[lv] < 2 * DOT_R + 1) lv++;
            last[lv] = x;
            if (x < -DOT_R || x > W + DOT_R) return;
            const isOn = on.has(d.k), inR = d.t >= r[0] - 1e-6 && d.t <= r[1] + 1e-6, cy = ROW_TOP + DOT_R + lv * LEVEL_DY;
            s += '<circle class="txDot" data-k="' + d.k + '" cx="' + x.toFixed(1) + '" cy="' + cy + '" r="' + DOT_R + '" fill="' + (isOn ? '#E8CF9A' : 'none') + '" stroke="' + (isOn ? '#E8CF9A' : '#7a7a86') + '" stroke-width="1.5" opacity="' + (inR ? 1 : 0.35) + '"><title>' + d.t.toFixed(3) + ' s · line ' + (d.line + 1) + ' · ' + (isOn ? 'ON' : 'off') + '</title></circle>';
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
        if (info) info.textContent = this._tx.dots.length + ' dots · ' + p.on.length + ' on · ' + this._tx.span.toFixed(2) + ' s · range ' + r[0].toFixed(2) + '–' + r[1].toFixed(2) + ' · cursor ' + (+p.cursor || 0).toFixed(2);
        if (this._txRunT != null) this.txPaintRun();
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
        p.cursor = +clamp(this.txT(x), 0, this._tx.span).toFixed(3); this.txPersist(); this.txRender();
    },
    txDragGrip(g, rect) {
        const p = this.txPat(), move = ev => {
            const r = this.txRange(), t = +clamp(this.txT(ev.clientX - rect.left), 0, this._tx.span).toFixed(3);
            if (g === 'a') r[0] = Math.min(t, r[1] - 0.01); else r[1] = Math.max(t, r[0] + 0.01);
            p.range = [r[0], r[1]]; this.txRender();
        }, up = () => { window.removeEventListener('mousemove', move, true); window.removeEventListener('mouseup', up, true); this.txPersist(); this.setStatus(this.txLine()); };
        window.addEventListener('mousemove', move, true); window.addEventListener('mouseup', up, true);
    },
    txAll(on) {
        const p = this.txPat(); if (!p) return;
        const r = this.txRange(), inside = new Set(this._tx.dots.filter(d => d.t >= r[0] - 1e-6 && d.t <= r[1] + 1e-6).map(d => d.k));
        p.on = p.on.filter(k => !inside.has(k)); if (on) p.on = p.on.concat([...inside]);
        this.txPersist(); this.txRender(); this.setStatus(this.txLine());
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
