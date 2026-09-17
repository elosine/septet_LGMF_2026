// harm_source_ui.js — THE HARMONY BANNERS AND THE RHYTHM SOURCE IN THE STRIKES DRAWER (PLAN 1d, the drawer's step; CN-57; RUNNING_LOG §324).
//
// The arithmetic is `harm_source.js` (pure, checked in node). This file is the wiring, a mixin on the drawer like chords mode and the
// sound switch:
//
//   · THE LEFT COLUMN becomes banners (the beating drawer's idiom, CN-36): STRIKES — the db's rows exactly as the column always had
//     them — then every group of the morph panel's own pitch menu (MorphPanel.pitchOptionGroups / sonorityOf, CN-53's one list, the
//     same one the crescendo bar deals from): BLASTS · CHORD SHAPES · STARTERS · THE MODELS' SETS · STACKS and MESSIAEN'S MODES from a
//     typed root · KEPT · RECALLED. A click on any row is `select(id)` — the harmony is a strike from there on: the keyboard, the
//     voicings, the shuffle, the orchestration, hear, the rhythm column, the run, chords / fill, the sound switch, takes, insert.
//   · RHYTHM FROM · EXTRA NOTES, under the rhythm column's controls: the onsets (and, rule 2, the accents) of ANY strike of the db laid
//     under whatever pitches are on the keyboard — `own` by default, so a strike clicked with `own` is byte-for-byte the drawer as it was.
//     `extra`: what happens to notes beyond the rhythm's onsets — stack (with the first onsets) or repeat (a second pass, one last gap on).
//
// Four dispatch lines live in strike_drawer.js (strikeById · applySource · spanFallback · applyState's lookup); everything else is here.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[harm_source_ui] the strikes drawer is not loaded'); return; }
const HS = () => root.HarmSource;
const MP = () => root.MorphPanel;
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nm = m => (HS() ? HS().nm(m) : String(m));
const HS_DEFAULTS = { root: 'F2', from: 'own', extra: 'stack', collapsed: {} };
const TITLES = {   // the insert buttons a harmony cannot use, with what to say
    skAtTime: 'a harmony has no original time — Insert @ playhead writes it where the playhead is',
    skAfter: 'a harmony has no previous strike — Insert @ playhead',
    skGoto: 'a harmony has no original time',
};

Object.assign(D, {

    // ------------------------------------------------------------ the settings (in cfg, so they ride in takes and in the browser)
    hs() {
        const c = this.cfg; if (!c.hs || typeof c.hs !== 'object') c.hs = {};
        for (const k in HS_DEFAULTS) if (c.hs[k] === undefined) c.hs[k] = JSON.parse(JSON.stringify(HS_DEFAULTS[k]));
        return c.hs;
    },
    hsCollapsed(key) { const col = this.hs().collapsed; return col[key] === undefined ? key !== 'strikes' : !!col[key]; },   // every banner but STRIKES starts folded — the column looks as it did

    // ------------------------------------------------------------ the morph panel's list, read once per root
    ensureHarmSources() {
        const M = MP(); if (!M) return Promise.resolve(false);
        if (M.pitchSources) return Promise.resolve(true);
        if (!this._hsLoading) {
            this._hsLoading = (M.loadPitchSources ? M.loadPitchSources() : Promise.resolve())
                .then(() => { this._hsLoading = null; this.hsDirty(); if (this.el && this.el.style.display !== 'none' && !(this.isChords && this.isChords())) this.renderBanners(); return true; })
                .catch(() => { this._hsLoading = null; return false; });
        }
        return this._hsLoading;
    },
    hsDirty() { this._hsGroups = null; this._hsCache = null; },
    harmGroups(force) {
        const H = HS(), M = MP(); if (!H || !M || !M.pitchOptionGroups || !M.sonorityOf) return null;
        if (!M.pitchSources) { this.ensureHarmSources(); return null; }
        const rootStr = this.hs().root;
        if (!force && this._hsGroups && this._hsGroups.root === rootStr) return this._hsGroups.groups;
        const groups = H.groupsFor(M.pitchOptionGroups(), (v, r) => M.sonorityOf(v, r), rootStr);
        this._hsGroups = { root: rootStr, groups }; this._hsCache = null;
        return groups;
    },
    // a harmony's strike, built on demand from its id and cached — strikeById() in the drawer asks here when the db has no such strike
    harmStrike(id) {
        const H = HS(); if (!H || !H.isHarmId(id)) return null;
        if (this._hsCache && this._hsCache[id]) return this._hsCache[id];
        const p = H.parseHarmId(id); if (!p) return null;
        const M = MP(); if (!M || !M.sonorityOf || !M.pitchSources) return null;
        const groups = this.harmGroups(); let e = null;
        if (groups) groups.some(g => { e = g.items.find(x => x.value === p.value && (x.root || null) === (p.root || null)) || null; return !!e; });
        if (!e) {
            let son = null; try { son = M.sonorityOf(p.value, H.isFamily(p.value) ? (p.root || this.hs().root) : undefined); } catch (x) { son = null; }
            if (!son || !son.notes || !son.notes.length) return null;
            e = { value: p.value, root: p.root, id: H.shortIndex(p.value, p.root), name: son.from || p.value, pitches: son.notes.slice(), source: '' };
        }
        const s = H.makeStrike(e);
        (this._hsCache = this._hsCache || {})[id] = s;
        return s;
    },
    setHarmRoot(v) {
        const SEP = root.MorphSeptet, H = HS();
        const str = String(v || '').trim();
        if (!str || !SEP || SEP.parseNote(str, 48) == null) { this.setStatus('not a note name: "' + str + '" — F2, C#3, Bb1 …', true); this.renderBanners(); return; }
        const was = this.strike && this.strike.synthetic && H.isFamily(this.strike.harm.value) ? this.strike.harm.value : null;
        this.hs().root = str; this.hsDirty(); this.save();
        this.renderBanners();
        if (was) this.select(H.harmId(was, str)); else this.setStatus('root ' + str + ' — the stacks and the modes are built from it');
    },

    // ------------------------------------------------------------ the column: banners (replaces the flat list of selectSeq)
    selectSeq(id) {
        this.seq = this.db.sequences[id]; if (!this.seq) return;
        this.renderBanners();
        const H = HS(), cur = this.cfg.strikeId;
        const want = cur && this.strikeById(cur) && (this.seq.strikeIds.includes(cur) || (H && H.isHarmId(cur))) ? cur : this.seq.strikeIds[0];
        if (want) this.select(want);
    },
    renderBanners() {
        const list = this.el && this.el.querySelector('#skSeq'); if (!list || !this.db) return;
        const H = HS(), hs = this.hs(), cur = this.cfg.strikeId, top = list.scrollTop;
        const banner = (key, title, extra) => {
            const folded = this.hsCollapsed(key);   // only an OPEN banner sticks while its rows scroll under it — folded ones scroll away, or nine of them pile up at the top
            return '<div class="skBanner" data-bank="' + key + '" title="' + esc(title) + ' — click to ' + (folded ? 'expand' : 'collapse') + '" style="position:' + (folded ? 'static' : 'sticky') + ';top:0;z-index:1;background:#1b1b20;padding:3px 8px;cursor:pointer;color:#e8cf9a;border-bottom:1px solid #333;font-weight:600;white-space:nowrap;display:flex;gap:6px;align-items:center">' +
                (folded ? '&#9656; ' : '&#9662; ') + '<span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">' + esc(title) + '</span>' + (extra || '') + '</div>';
        };
        const row = (id, a, aw, b, c, d, title) => '<div class="skSeqRow" data-id="' + esc(id) + '" title="' + esc(title || '') + '" style="padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap;' + (id === cur ? 'background:rgba(201,160,90,.25)' : '') + '">' +
            '<span style="color:#777;width:' + aw + 'px;flex:none;overflow:hidden">' + esc(a) + '</span><span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">' + esc(b) + '</span><span style="color:#bbb;flex:none">' + esc(c) + '</span><span style="color:#777;flex:none">' + esc(d) + '</span>' +
            '<span class="skRowHear" data-id="' + esc(id) + '" title="FIX-NOW 1 (2026-09-12): hear this harmony alone — a piano block, nothing loaded" style="color:#e8cf9a;flex:none;cursor:pointer;padding:0 3px">&#9834;</span></div>';
        let h = '';
        const seq = this.seq, ids = seq ? seq.strikeIds : [];
        h += banner('strikes', 'STRIKES · ' + ids.length + (seq ? ' · ' + (seq.spanMs / 1000).toFixed(1) + ' s' : ''));
        if (!this.hsCollapsed('strikes')) ids.forEach(sid => {
            const s = this.db.strikes[sid]; if (!s) return;
            h += row(sid, String(s.index), 20, s.t0.toFixed(2) + ' s', s.stats.noteCount + ' n', nm(s.stats.midi.min) + '–' + nm(s.stats.midi.max), '#' + s.index + ' · ' + s.label);
        });
        const groups = this.harmGroups();
        if (!groups) h += '<div style="padding:4px 8px;color:#777">reading the harmonies (the morph panel\'s list)…</div>';
        else groups.forEach(g => {
            const rootBox = g.family ? '<input class="skHsRoot" value="' + esc(hs.root) + '" title="the root the stacks and the modes are built from — a note name: F2, C#3, Bb1 … (ENTER applies)" style="' + INP + ';width:34px;font-weight:normal">' : '';
            h += banner(g.key, g.title + ' · ' + g.items.length, rootBox);
            if (this.hsCollapsed(g.key)) return;
            if (!g.items.length) h += '<div style="padding:2px 8px;color:#666">none yet</div>';
            g.items.forEach(e => { h += row(H.harmId(e.value, e.root), e.id, 56, e.name, e.n + ' n', e.range, e.id + ' · ' + e.name + ' · ' + e.pitches.map(nm).join(' ')); });
        });
        list.innerHTML = h; list.scrollTop = top;
        list.querySelectorAll('.skBanner').forEach(el => el.addEventListener('click', ev => {
            if (ev.target && ev.target.classList && ev.target.classList.contains('skHsRoot')) return;
            const k = el.dataset.bank; hs.collapsed[k] = !this.hsCollapsed(k); this.save(); this.renderBanners();
        }));
        list.querySelectorAll('.skSeqRow').forEach(el => el.addEventListener('click', () => this.select(el.dataset.id)));
        list.querySelectorAll('.skRowHear').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); this.hearHarmony(el.dataset.id); }));
        list.querySelectorAll('.skHsRoot').forEach(inp => {
            ['mousedown', 'click', 'dblclick', 'keydown', 'keyup'].forEach(t => inp.addEventListener(t, ev => ev.stopPropagation()));
            // ENTER commits and ESC restores here, explicitly — found on the walk (2026-09-09): a real ENTER left 'C#3' in the box and the root at F2
            inp.addEventListener('keydown', ev => {
                if (ev.key === 'Enter') { ev.preventDefault(); inp.dataset.done = '1'; this.setHarmRoot(inp.value); }
                else if (ev.key === 'Escape') { ev.preventDefault(); inp.value = hs.root; inp.blur(); }
            });
            inp.addEventListener('change', () => { if (inp.dataset.done) { delete inp.dataset.done; return; } this.setHarmRoot(inp.value); });
        });
    },

    // ------------------------------------------------------------ the rhythm source: the onsets and the accents of another strike
    sourceStrikes() { return Object.values((this.db && this.db.strikes) || {}).sort((a, b) => a.index - b.index); },
    rhythmStrike() { const f = this.hs().from; return f && f !== 'own' && this.db && this.db.strikes ? (this.db.strikes[f] || null) : null; },
    // lay the pitches on the source's onsets IN PLACE — lanes, voicing, order and hand assignments untouched (only dt0 · vel · durMs move)
    relay() {
        const H = HS(), s = this.strike; if (!H || !s || !this.voices) return;
        const rs = this.rhythmStrike();
        const items = this.voices.map(v => { const n = s.notes[v.i] || {}; return { midi: v.pitch0, dtMs: n.dtMs, vel: n.vel, durMs: n.durMs }; });
        const L = H.lay(items, rs ? H.rhythmOf(rs) : null, this.hs().extra);
        L.notes.forEach((n, i) => { const v = this.voices[i]; if (!v) return; v.dt0 = n.dtMs; v.vel = n.vel; v.durMs = n.durMs; });
        this.slotsPlayed = this.voices.map(v => v.dt0);
        this._hsInfo = L.info; this._hsRhythm = rs;
    },
    applySource() { this.relay(); },   // select() calls this right after the as-played slots are read
    spanFallback() { return this.strike && this.strike.synthetic && !this.rhythmStrike() ? 1000 : 0; },   // a chord has no span; a nominal second lets even · front · … spread it, and the = ms box then lands it
    hsReadout() {
        const hs = this.hs(), rs = this._hsRhythm, H = HS();
        if (hs.from !== 'own' && !rs) return 'rhythm from: that strike is no longer in the db — own';
        if (!rs) return this.strike && this.strike.synthetic ? 'own: together (as played = one chord)' : '';
        return 'rhythm #' + rs.index + ' (' + rs.notes.length + ' onsets, ' + Math.round(rs.spanMs) + ' ms) · ' + H.describe(this._hsInfo);
    },
    hsStatus() {
        const s = this.strike; if (!s) return;
        const H = HS(), rs = this._hsRhythm, extra = (rs ? ' · rhythm #' + rs.index + ' · ' + H.describe(this._hsInfo) : '')
            + (this._keepOrchInfo ? ' · ' + this._keepOrchInfo : '');   // §342: hsStatus runs after select() and would otherwise hide what keep-rhythm orchestrated
        if (s.synthetic) this.setStatus(s.harm.id + ' · ' + s.harm.name + ' · ' + s.stats.noteCount + ' notes · ' + s.stats.midi.min + '–' + s.stats.midi.max + ' (' + nm(s.stats.midi.min) + '–' + nm(s.stats.midi.max) + ') · ' + (s.harm.group || 'harmony') + (rs ? extra : ' · rhythm: own (together)' + (this._keepOrchInfo ? ' · ' + this._keepOrchInfo : '')));
        else if (rs) this.setStatus('strike #' + s.index + ' · ' + s.t0.toFixed(2) + ' s · ' + s.stats.noteCount + ' notes' + extra);
    },
    paintSourceButtons() {
        const on = !!(this.strike && this.strike.synthetic);
        Object.keys(TITLES).forEach(id => {
            const b = this.el && this.el.querySelector('#' + id); if (!b) return;
            if (b.dataset.hsTitle == null) b.dataset.hsTitle = b.title || '';
            b.disabled = on; b.style.opacity = on ? 0.45 : ''; b.title = on ? TITLES[id] : b.dataset.hsTitle;
            if (id === 'skAtTime' && on) b.textContent = 'Insert @ original time';
        });
    },
    ensureRhySrcUI() {
        const ctl = this.el && this.el.querySelector('#skRhyCtl'); if (!ctl) return;
        let box = ctl.querySelector('#skHsBox');
        if (!box) {
            box = document.createElement('div'); box.id = 'skHsBox';
            box.style.cssText = 'border-top:1px solid #333;margin-top:3px;padding-top:3px;display:flex;flex-direction:column;gap:2px';
            box.innerHTML = '<span style="color:#9a9" title="PLAN 1d (2026-09-09): the onsets — and the accents — of any strike of the db under whatever pitches are on the keyboard. own = this strike\'s recorded rhythm (a harmony: together). The pitches, the onsets and the players are the drawer\'s three independent lists (STRIKES_TOOL §L); this gives the onsets a second source.">rhythm from</span>' +
                '<select id="skHsFrom" style="' + INP + ';width:124px"></select>' +
                '<label title="notes beyond the rhythm\'s onsets — stack: they land on the first onsets again, sounding with those notes (the gesture keeps its length) · repeat: the rhythm plays through again, one last gap on (the gesture gets longer). Fewer notes than onsets: the last onsets stay empty.">extra <select id="skHsExtra" style="' + INP + ';width:64px"><option value="stack">stack</option><option value="repeat">repeat</option></select></label>' +
                '<div id="skHsOut" style="color:#9a9;white-space:normal;line-height:1.25"></div>';
            ctl.appendChild(box);
            const change = (k, v) => { this.snapshot(); this.hs()[k] = v; this.save(); this.relay(); this.render(); this.hsStatus(); };
            box.querySelector('#skHsFrom').addEventListener('change', e => change('from', e.target.value || 'own'));
            box.querySelector('#skHsExtra').addEventListener('change', e => change('extra', e.target.value === 'repeat' ? 'repeat' : 'stack'));
            ['mousedown', 'click', 'keydown', 'keyup'].forEach(t => box.addEventListener(t, ev => ev.stopPropagation()));
        }
        const from = box.querySelector('#skHsFrom'), strikes = this.sourceStrikes(), sig = strikes.length + ':' + (this.seq ? this.seq.id : '');
        if (from.dataset.sig !== sig) {
            from.innerHTML = '<option value="own">own</option>' + strikes.map(s => '<option value="' + esc(s.id) + '">#' + s.index + ' · ' + s.notes.length + ' n · ' + Math.round(s.spanMs) + ' ms</option>').join('');
            from.dataset.sig = sig;
        }
        from.value = this.hs().from; if (from.value !== this.hs().from) from.value = 'own';
        box.querySelector('#skHsExtra').value = this.hs().extra === 'repeat' ? 'repeat' : 'stack';
        box.querySelector('#skHsOut').textContent = this.hsReadout();
    },
});

// ---------------------------------------------------------------- the hooks on what the drawer already does
const _select = D.select;
D.select = function (id) {
    _select.call(this, id);
    if (!this.strike || this.strike.id !== id) return;
    this.paintSourceButtons(); this.hsStatus();
};
const _render = D.render;
D.render = function () {
    // chords mode owns the column while it is on; when notes mode comes back, the banners come back with it
    if (this.strike && this.el && !(this.isChords && this.isChords())) { const list = this.el.querySelector('#skSeq'); if (list && !list.querySelector('.skBanner')) this.renderBanners(); }
    return _render.apply(this, arguments);
};
const _renderRhythm = D.renderRhythm;
D.renderRhythm = function () {
    const r = _renderRhythm.apply(this, arguments);
    try { this.ensureRhySrcUI(); } catch (e) { console.warn('[harm_source_ui] rhythm-from controls:', e); }
    return r;
};
const _loadTake = D.loadTake;
D.loadTake = async function (name) { await this.ensureHarmSources(); return _loadTake.call(this, name); };
const _applyState = D.applyState;
D.applyState = function (st) {
    if (st && (!st.cfg || !st.cfg.hs)) { const hs = this.hs(); hs.from = 'own'; hs.extra = 'stack'; }   // a take from before the rhythm source meant its own rhythm
    _applyState.call(this, st);
    if (this.strike) { this.relay(); this.render(); this.paintSourceButtons(); this.hsStatus(); }
};
const _takeComment = D.takeComment;
D.takeComment = function () {
    const s = this.strike, rs = this.rhythmStrike();
    const base = s && s.synthetic ? ('harmony ' + s.harm.id + ' · ' + (s.harm.group || 'harmony')) : _takeComment.call(this);
    return base + (rs ? ' · rhythm #' + rs.index + ' (' + this.hs().extra + ')' : '');
};
// chords mode's bank menu takes the same collections (its list is a list of chords; the banners' groups join the three banks it had)
if (typeof D.renderChordList === 'function' && typeof D.fillChordBank === 'function') {
    const _rcl = D.renderChordList;
    D.renderChordList = function () {
        _rcl.apply(this, arguments);
        const sel = this.el && this.el.querySelector('#skChBank'); if (!sel) return;
        (this.harmGroups() || []).forEach(g => {
            if (g.key === 'blasts' || g.key === 'chordShapes' || g.key === 'strikes') return;
            const o = document.createElement('option'); o.value = 'hs:' + g.key; o.textContent = g.title.split(' · ')[0].toLowerCase(); o.title = g.title; sel.appendChild(o);
        });
        const c = this.ch(); if (c.bank && /^hs:/.test(c.bank)) { sel.value = c.bank; if (sel.value === c.bank) this.fillChordBank(); }
    };
    const _fcb = D.fillChordBank;
    D.fillChordBank = function () {
        const sel = this.el && this.el.querySelector('#skChBank'), pick = this.el && this.el.querySelector('#skChPick');
        const bank = sel ? sel.value : '';
        if (!/^hs:/.test(bank)) return _fcb.apply(this, arguments);
        const H = HS(), g = (this.harmGroups() || []).find(x => x.key === bank.slice(3));
        const items = g ? g.items.map(e => ({ id: H.harmId(e.value, e.root), name: e.id + ' · ' + e.name, pitches: e.pitches.slice() })) : [];
        this._chBankItems = items;
        if (pick) pick.innerHTML = items.map((x, i) => '<option value="' + i + '">' + esc(x.name + ' · ' + x.pitches.length) + '</option>').join('') || '<option value="">(empty)</option>';
    };
}

}(typeof self !== 'undefined' ? self : this));
