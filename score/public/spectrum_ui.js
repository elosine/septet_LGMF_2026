// spectrum_ui.js — THE HARMONIC SERIES IN THE STRIKES DRAWER: the JUST column (PLAN 1c.4, 2026-09-19; RUNNING_LOG §97).
//
// His words: *"I want to start with just the natural harmonic series. So I can type in a root and then the harmonics will appear in the
// keyboard. And the harmonic module or whatever should just be a choice, a single choice in the strikes drawer … I type in a fundamental
// and the notes for all the partials up here all the way up the keyboard from the bottom all 88 keys and then where the notes are they
// should also indicate if their cents are added or not … we'll make this the one, the current column, the one all the way to the right.
// And then we'll need to work out the pitch bend. And we'll need to work out some additional rules so that fixed pitch instruments like
// piano and vibraphone are never assigned non-well-tempered pitches. But also we should put a tolerance there … like five cents."*
//
// The arithmetic is spectrum.js (pure). This file is the wiring, a mixin loaded last:
//   · a banner HARMONIC SERIES · from the fundamental, right under STRIKES, with a fundamental box (note name or MIDI) and one row —
//     `partials of C2 · 64 n`; a click is select(id), id `sp:<fund>:just`, and strikeById answers it (so a take restores it);
//   · on select the voices take their `partial` and `cents` from the strike's notes, and the `88` view switches on;
//   · the keyboard: `p · ±c¢` beside each dot (the JUST column, at the right; the wrap widened for the three columns to come);
//   · the fixed-pitch rule: mayTake(voice, lane) — false when |cents| > 5 and the player cannot bend (`playerBendSt` 0: the vibraphone,
//     its second seat, the percussion); the shuffle's fit test and fitReal both ask it. Within the tolerance the note is tempered and
//     its cents are dropped on those players (the outermost notesFor wrap).
// Hear's bend (playNotes) and Insert's morphBend are in strike_drawer.js (1c.4's additive changes).
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[spectrum_ui] the strikes drawer is not loaded'); return; }
const SP = () => root.Spectrum;
const SEP = () => root.MorphSeptet;
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const DEFAULT_FUND = 'C2';
const ID = /^sp:([^:]+):just$/;

Object.assign(D, {
    spec() { const c = this.cfg; if (!c.spec || typeof c.spec !== 'object') c.spec = {}; if (!c.spec.fund) c.spec.fund = DEFAULT_FUND; return c.spec; },
    specTol() { const S = SP(); return S ? S.TOL : 5; },
    specFundMidi(str) { const s = SEP(); return s ? s.parseNote(str != null ? str : this.spec().fund, 48) : null; },
    specId(fundStr) { const S = SP(), m = this.specFundMidi(fundStr); return (S && m != null) ? 'sp:' + S.nm(m) + ':just' : null; },
    isSpectrumId(id) { return ID.test(String(id || '')); },
    // the strike for an id, built on demand and cached — strikeById asks here when the db and the harmonies have no such strike
    spectrumStrike(id) {
        const S = SP(), m = ID.exec(String(id || '')); if (!S || !m) return null;
        if (this._spCache && this._spCache[id]) return this._spCache[id];
        const fund = this.specFundMidi(m[1]); if (fund == null) return null;
        const st = S.makeStrike(fund, id);
        (this._spCache = this._spCache || {})[id] = st;
        return st;
    },
    // the rule: a player who cannot bend never takes a note more than the tolerance off
    mayTake(v, lane) {
        const c = Math.abs(+(v && v.cents) || 0); if (c <= this.specTol()) return true;
        const inst = this.instOf(lane); return !!(inst && +inst.playerBendSt > 0);
    },
    fixedPitch(lane) { const inst = this.instOf(lane); return !!inst && !(+inst.playerBendSt > 0); },
    setSpecFund(v) {
        const str = String(v || '').trim(), m = this.specFundMidi(str);
        if (!str || m == null) { this.setStatus('not a note name: "' + str + '" — E1, C2, Bb1, or a MIDI number', true); this.renderBanners(); return; }
        const was = this.strike && this.strike.spectrum;
        this.spec().fund = str; this.save();
        this.renderBanners();
        if (was) this.select(this.specId(str)); else this.setStatus('fundamental ' + str + ' — the series is built from it');
    },
    // the banner's HTML, placed right under STRIKES (before the first harmony banner)
    renderSpectrumBanner() {
        const list = this.el && this.el.querySelector('#skSeq'); if (!list || list.querySelector('.skBanner[data-bank="spectrum"]')) return;
        const S = SP(); if (!S) return;
        const sp = this.spec(), fund = this.specFundMidi(), id = this.specId(), cur = this.cfg.strikeId;
        const folded = this.hsCollapsed ? this.hsCollapsed('spectrum') : false;
        const n = fund != null ? S.partialsOf(fund).length : 0;
        const title = 'HARMONIC SERIES · from the fundamental';
        let h = '<div class="skBanner" data-bank="spectrum" title="' + esc(title) + ' — click to ' + (folded ? 'expand' : 'collapse') + '" style="position:' + (folded ? 'static' : 'sticky') + ';top:0;z-index:1;background:#1b1b20;padding:3px 8px;cursor:pointer;color:#e8cf9a;border-bottom:1px solid #333;font-weight:600;white-space:nowrap;display:flex;gap:6px;align-items:center">' +
            (folded ? '&#9656; ' : '&#9662; ') + '<span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">' + esc(title) + '</span>' +
            '<input class="skSpFund" value="' + esc(sp.fund) + '" title="the fundamental — a note name (E1, C2, Bb1) or a MIDI number; ENTER applies" style="' + INP + ';width:34px;font-weight:normal"></div>';
        if (!folded) {
            if (fund == null || !id) h += '<div style="padding:2px 8px;color:#e88">not a note name</div>';
            else h += '<div class="skSeqRow skSpRow" data-id="' + esc(id) + '" title="every partial of ' + esc(S.nm(fund)) + ' to the top of the 88 keys — the JUST column: each note carries its partial and its cents; players who cannot bend take only those within ±' + this.specTol() + '¢" style="padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap;' + (id === cur ? 'background:rgba(201,160,90,.25)' : '') + '">' +
                '<span style="color:#777;width:56px;flex:none;overflow:hidden">just</span><span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">partials of ' + esc(S.nm(fund)) + '</span><span style="color:#bbb;flex:none">' + n + ' n</span><span style="color:#777;flex:none">' + esc(S.nm(fund)) + '–' + esc(S.nm(S.partialsOf(fund).slice(-1)[0].midi)) + '</span></div>';
        }
        const first = list.querySelector('.skBanner[data-bank]:not([data-bank="strikes"])');
        if (first) first.insertAdjacentHTML('beforebegin', h); else list.insertAdjacentHTML('beforeend', h);
        const banner = list.querySelector('.skBanner[data-bank="spectrum"]');
        banner.addEventListener('click', ev => {
            if (ev.target && ev.target.classList && ev.target.classList.contains('skSpFund')) return;
            const hs = this.hs ? this.hs() : null; if (hs) { hs.collapsed.spectrum = !this.hsCollapsed('spectrum'); this.save(); }
            this.renderBanners();
        });
        const inp = banner.querySelector('.skSpFund');
        ['mousedown', 'click', 'dblclick', 'keydown', 'keyup'].forEach(t => inp.addEventListener(t, ev => ev.stopPropagation()));
        inp.addEventListener('keydown', ev => {
            if (ev.key === 'Enter') { ev.preventDefault(); inp.dataset.done = '1'; this.setSpecFund(inp.value); }
            else if (ev.key === 'Escape') { ev.preventDefault(); inp.value = this.spec().fund; inp.blur(); }
        });
        inp.addEventListener('change', () => { if (inp.dataset.done) { delete inp.dataset.done; return; } this.setSpecFund(inp.value); });
        list.querySelectorAll('.skSpRow').forEach(el => el.addEventListener('click', () => this.select(el.dataset.id)));
    },
    // the keyboard's labels: `p · ±c¢` beside each dot of a spectrum strike
    paintSpectrumLabels() {
        const svg = this.el && this.el.querySelector('#skKb'), wrap = this.el && this.el.querySelector('#skKbWrap'); if (!svg || !wrap) return;
        svg.querySelectorAll('.skSpLab').forEach(x => x.remove());
        const on = !!(this.strike && this.strike.spectrum);
        wrap.style.flex = on ? '0 0 235px' : '0 0 150px'; svg.setAttribute('width', on ? 235 : 150); svg.style.width = (on ? 235 : 150) + 'px';
        if (!on) return;
        const S = SP(), tol = this.specTol(); let s = '';
        svg.querySelectorAll('.skDot').forEach(dot => {
            const v = this.voices[+dot.dataset.i]; if (!v || v.partial == null) return;
            const cx = +dot.getAttribute('cx'), cy = +dot.getAttribute('cy'), col = dot.getAttribute('stroke') || '#ddd';
            const fixedOnly = Math.abs(+v.cents || 0) <= tol;
            s += '<text class="skSpLab" x="' + (cx + 7) + '" y="' + (cy + 3) + '" font-size="9" fill="' + col + '" opacity="' + (fixedOnly ? 0.85 : 1) + '"><title>partial ' + v.partial + ' · ' + S.centsText(v.cents) + (fixedOnly ? ' — within ±' + tol + '¢: tempered for a fixed-pitch player' : '') + '</title>' + esc(S.label({ partial: v.partial, cents: v.cents }, tol)) + '</text>';
        });
        svg.insertAdjacentHTML('beforeend', s);
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · strikeById answers a spectrum id
const _strikeById = D.strikeById;
D.strikeById = function (id) { return _strikeById.call(this, id) || (this.isSpectrumId(id) ? this.spectrumStrike(id) : null); };
// 2 · select: the voices take their partial and cents; the 88 view; the labels
const _select = D.select;
D.select = function (id) {
    _select.call(this, id);
    if (!this.strike || this.strike.id !== id) return;
    const sp = !!this.strike.spectrum;
    this.voices.forEach(v => { const n = this.strike.notes[v.i] || {}; v.cents = sp ? (+n.cents || 0) : 0; v.partial = sp ? n.partial : undefined; });
    if (sp && !this.cfg.show88) { this.cfg.show88 = true; const b = this.el.querySelector('#sk88'); if (b) b.checked = true; this.save(); }
    if (sp) { this.render(); this.setStatus(this.strike.label + ' · ' + this.strike.notes.length + ' partials of ' + SP().nm(this.strike.fundamental) + ' to the top key · the JUST column · players who cannot bend take only notes within ±' + this.specTol() + '¢'); }
};
// 3 · the banner rides on renderBanners; the labels on renderKeyboard
const _renderBanners = D.renderBanners;
D.renderBanners = function () { const r = _renderBanners.apply(this, arguments); try { this.renderSpectrumBanner(); } catch (e) { console.warn('[spectrum_ui] banner:', e); } return r; };
const _renderKeyboard = D.renderKeyboard;
D.renderKeyboard = function () { const r = _renderKeyboard.apply(this, arguments); try { this.paintSpectrumLabels(); } catch (e) { console.warn('[spectrum_ui] labels:', e); } return r; };
// 4 · a fixed-pitch player plays the tempered note: its cents are dropped on the way out (they are within the tolerance by the rule)
const _notesFor = D.notesFor;
D.notesFor = function (mode) {
    const out = _notesFor.apply(this, arguments);
    if (!out || !out.length) return out;
    return out.map(n => (n.cents && this.fixedPitch(n.row != null ? n.row : n.lane)) ? Object.assign({}, n, { cents: 0 }) : n);
};
}(typeof self !== 'undefined' ? self : this));
