// spectrum_ui.js — THE HARMONIC SERIES IN THE STRIKES DRAWER (PLAN 1c.4 → 1c.5, 2026-09-19; RUNNING_LOG §97–§99).
//
// His words: *"I want to start with just the natural harmonic series. So I can type in a root and then the harmonics will appear in the
// keyboard. And the harmonic module or whatever should just be a choice, a single choice in the strikes drawer … I type in a fundamental
// and the notes for all the partials up here all the way up the keyboard from the bottom all 88 keys and then where the notes are they
// should also indicate if their cents are added or not … we'll make this the one, the current column, the one all the way to the right.
// And then we'll need to work out the pitch bend. And we'll need to work out some additional rules so that fixed pitch instruments like
// piano and vibraphone are never assigned non-well-tempered pitches. But also we should put a tolerance there … like five cents."*
// Then (§98) *"this is illegible"* → one dot per key, the partials listed; the chips carry `p · ±c¢`. Then (§99): *"add the instrument
// ranges just lines not taking up too much horiz space … on the left next to note labels; then lets add the transposed column still all
// harmonic partials same rule for fixed pitch instrument and can we make all of the labels the pink or green."*
//
// The arithmetic is spectrum.js (pure). This file is the wiring, a mixin loaded last:
//   · a banner HARMONIC SERIES · from the fundamental, right under STRIKES, with a fundamental box (note name or MIDI) and two rows —
//     `just · partials of C2 · 65 n` and `just + 8ve · … n`; a click is select(id), id `sp:<fund>:just[+8ve]`, and strikeById answers it;
//   · on select the voices take their `partial`, `cents` and `set` from the strike's notes, and the `88` view switches on;
//   · the keyboard: the JUST column at the right (labels PINK), the 8ve column to its left (labels GREEN); one dot per key per column,
//     the partials listed on a shared key; and, at the far left beside the note names, one thin RANGE LINE per instrument (always, not
//     only for a series) — the hovered row's line brightens;
//   · the rows' chips carry `p · ±c¢` (`7⁸` marks the transposed set); on a player who cannot bend, `(tempered)`;
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
const INST = () => (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : (root.INSTRUMENTS || {}));
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const DEFAULT_FUND = 'C2';
const COL = { just: { x: 122, label: '#e39ac6', name: 'JUST' }, '8ve': { x: 62, label: '#8fd48f', name: 'JUST / 8ve' } };   // his pink and green
const RANGE_W = 30, RANGE_GAP = 3;   // the range strip at the left: one line per instrument
const KB_W = { plain: 150, spectrum: 235 };

Object.assign(D, {
    spec() { const c = this.cfg; if (!c.spec || typeof c.spec !== 'object') c.spec = {}; if (!c.spec.fund) c.spec.fund = DEFAULT_FUND; return c.spec; },
    specTol() { const S = SP(); return S ? S.TOL : 5; },
    specFundMidi(str) { const s = SEP(); return s ? s.parseNote(str != null ? str : this.spec().fund, 48) : null; },
    specId(sets, fundStr) { const S = SP(), m = this.specFundMidi(fundStr); return (S && m != null) ? S.idFor(S.nm(m), sets) : null; },
    isSpectrumId(id) { const S = SP(); return !!(S && S.parseId(id)); },
    // the strike for an id, built on demand and cached — strikeById asks here when the db and the harmonies have no such strike
    spectrumStrike(id) {
        const S = SP(), p = S && S.parseId(id); if (!p) return null;
        if (this._spCache && this._spCache[id]) return this._spCache[id];
        const fund = this.specFundMidi(p.fund); if (fund == null) return null;
        const st = S.makeStrike(fund, id, { sets: p.sets });
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
        const was = this.strike && this.strike.spectrum ? this.strike.sets : null;
        this.spec().fund = str; this.save();
        this.renderBanners();
        if (was) this.select(this.specId(was, str)); else this.setStatus('fundamental ' + str + ' — the series is built from it');
    },
    // the banner's HTML, placed right under STRIKES (before the first harmony banner)
    renderSpectrumBanner() {
        const list = this.el && this.el.querySelector('#skSeq'); if (!list || list.querySelector('.skBanner[data-bank="spectrum"]')) return;
        const S = SP(); if (!S) return;
        const sp = this.spec(), fund = this.specFundMidi(), cur = this.cfg.strikeId;
        const folded = this.hsCollapsed ? this.hsCollapsed('spectrum') : false;
        const title = 'HARMONIC SERIES · from the fundamental';
        let h = '<div class="skBanner" data-bank="spectrum" title="' + esc(title) + ' — click to ' + (folded ? 'expand' : 'collapse') + '" style="position:' + (folded ? 'static' : 'sticky') + ';top:0;z-index:1;background:#1b1b20;padding:3px 8px;cursor:pointer;color:#e8cf9a;border-bottom:1px solid #333;font-weight:600;white-space:nowrap;display:flex;gap:6px;align-items:center">' +
            (folded ? '&#9656; ' : '&#9662; ') + '<span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">' + esc(title) + '</span>' +
            '<input class="skSpFund" value="' + esc(sp.fund) + '" title="the fundamental — a note name (E1, C2, Bb1) or a MIDI number; ENTER applies" style="' + INP + ';width:34px;font-weight:normal"></div>';
        if (!folded) {
            if (fund == null) h += '<div style="padding:2px 8px;color:#e88">not a note name</div>';
            else {
                const row = (sets, tag, tip) => {
                    const id = S.idFor(S.nm(fund), sets), st = this.spectrumStrike(id), n = st ? st.notes.length : 0;
                    return '<div class="skSeqRow skSpRow" data-id="' + esc(id) + '" title="' + esc(tip) + '" style="padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap;' + (id === cur ? 'background:rgba(201,160,90,.25)' : '') + '">' +
                        '<span style="color:#777;width:56px;flex:none;overflow:hidden">' + esc(tag) + '</span><span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">partials of ' + esc(S.nm(fund)) + '</span><span style="color:#bbb;flex:none">' + n + ' n</span><span style="color:#777;flex:none">' + (st ? esc(S.nm(st.stats.midi.min)) + '–' + esc(S.nm(st.stats.midi.max)) : '') + '</span></div>';
                };
                h += row(['just'], 'just', 'every partial of ' + S.nm(fund) + ' to the top of the 88 keys — the JUST column (pink): each note carries its partial and its cents; players who cannot bend take only those within ±' + this.specTol() + '¢');
                h += row(['just', '8ve'], 'just + 8ve', 'the JUST column and, to its left, the same partials transposed into every octave of the 88 (green): each pitch class the series holds, with its cents, on every key of that class; the same rule for players who cannot bend');
            }
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

    // ---------------------------------------------------------------- the keyboard: the range strip, the columns, the labels
    // Everything the core drew is moved right by RANGE_W into a <g>, and the range lines go in the strip that opens at the left — the core's
    // own coordinates are untouched, the dotted lines (getBoundingClientRect) and the clicks follow the transform.
    rangeLanes() {   // one line per INSTRUMENT (a seat shares its instrument's), in row order
        const T = this.tracks ? this.tracks() : [], seen = new Set(), out = [];
        T.forEach((t, lane) => { const key = t.seatOf != null ? T[t.seatOf].instKey : t.instKey; if (seen.has(key)) return; seen.add(key); const inst = INST()[key]; if (inst && inst.rangeLow != null && inst.rangeHigh != null) out.push({ lane: t.seatOf != null ? t.seatOf : lane, key, inst, short: t.short }); });
        return out;
    },
    paintKeyboardExtras() {
        const svg = this.el && this.el.querySelector('#skKb'), wrap = this.el && this.el.querySelector('#skKbWrap'); if (!svg || !wrap || !this.strike) return;
        const on = !!this.strike.spectrum, base = on ? KB_W.spectrum : KB_W.plain, W = base + RANGE_W;
        wrap.style.flex = '0 0 ' + W + 'px'; svg.setAttribute('width', W); svg.style.width = W + 'px';
        // 1 · move the core's drawing right, once per render (the core replaces innerHTML every time, so there is never a stale <g>)
        let g = svg.querySelector('g.skKbCore');
        if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'skKbCore'); g.setAttribute('transform', 'translate(' + RANGE_W + ',0)'); while (svg.firstChild) g.appendChild(svg.firstChild); svg.appendChild(g); }
        // 2 · the range lines, in the strip at the left
        svg.querySelectorAll('.skRange').forEach(x => x.remove());
        { const R = this.range(), h = this.rh(); let s = '';
          this.rangeLanes().forEach((r, i) => {
              const lo = Math.max(R.lo, r.inst.rangeLow), hi = Math.min(R.hi, r.inst.rangeHigh); if (lo > hi) return;
              const x = 2 + i * RANGE_GAP + 0.75, y1 = this.keyY(hi) + 0.5, y2 = this.keyY(lo) + h - 0.5;
              s += '<line class="skRange" data-lane="' + r.lane + '" x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="#e8cf9a" stroke-width="1.5" opacity="0.45"><title>' + esc(r.inst.label + ' · ' + SP().nm(r.inst.rangeLow) + '–' + SP().nm(r.inst.rangeHigh)) + '</title></line>';
          });
          svg.insertAdjacentHTML('afterbegin', s); }
        this.paintRangeHover();
        // 3 · the columns and the labels of a series
        g.querySelectorAll('.skSpLab').forEach(x => x.remove());
        if (!on) return;
        const S = SP(), tol = this.specTol(); let s = '';
        const byCell = {};
        g.querySelectorAll('.skDot').forEach(dot => { const v = this.voices[+dot.dataset.i]; if (!v || v.partial == null) return; const set = v.set || 'just'; (byCell[set + '@' + v.pitch] = byCell[set + '@' + v.pitch] || { set, list: [] }).list.push({ dot, v }); });
        Object.keys(byCell).forEach(k => {
            const cell = byCell[k], col = COL[cell.set] || COL.just, list = cell.list.sort((a, b) => a.v.partial - b.v.partial), first = list[0].dot;
            first.setAttribute('cx', col.x);
            const cy = +first.getAttribute('cy');
            list.slice(1).forEach(({ dot }) => { dot.setAttribute('cx', col.x); dot.style.opacity = 0; dot.style.pointerEvents = 'none'; });
            const one = list.length === 1, v0 = list[0].v;
            const text = one ? S.label({ partial: v0.partial, cents: v0.cents }, tol) : list.map(x => x.v.partial).join(' · ');
            const title = col.name + '\n' + list.map(x => 'partial ' + x.v.partial + ' · ' + S.centsText(x.v.cents) + (Math.abs(+x.v.cents || 0) <= tol ? ' (tempered for a fixed-pitch player)' : '')).join('\n') + (one ? '' : '\n' + list.length + ' partials on this key — double-click arms the lowest; the shuffle deals the rest');
            s += '<text class="skSpLab" x="' + (col.x + 7) + '" y="' + (cy + 3) + '" font-size="9" fill="' + col.label + '"><title>' + esc(title) + '</title>' + esc(text) + '</text>';
        });
        g.insertAdjacentHTML('beforeend', s);
    },
    paintRangeHover() {
        const svg = this.el && this.el.querySelector('#skKb'); if (!svg) return;
        const hot = this.hoverLane != null ? this.scoreLane(this.hoverLane) : null;
        svg.querySelectorAll('.skRange').forEach(l => { const mine = hot != null && +l.dataset.lane === hot; l.setAttribute('opacity', mine ? 1 : (hot != null ? 0.25 : 0.45)); l.setAttribute('stroke-width', mine ? 2.5 : 1.5); });
    },
    // the orchestration rows: each chip carries its partial and cents — `A#4 · 7 · −31¢` (`7⁸` = the transposed set); on a player who cannot bend, `· 3 (tempered)`
    paintSpectrumChips() {
        const box = this.el && this.el.querySelector('#skOrch'); if (!box) return;
        const on = !!(this.strike && this.strike.spectrum);
        box.style.flex = on ? '0 0 380px' : '0 0 330px';
        if (!on) return;
        const S = SP(), tol = this.specTol();
        box.querySelectorAll('.skRow').forEach(row => {
            const lane = +row.dataset.lane, fixed = this.fixedPitch(lane);
            row.querySelectorAll('.skChip').forEach(chip => {
                const v = this.voices[+chip.dataset.i]; if (!v || v.partial == null || chip.querySelector('.skSpChip')) return;
                const within = Math.abs(+v.cents || 0) <= tol, p = v.partial + (v.set === '8ve' ? '⁸' : '');
                const t = fixed ? (' · ' + p + (within ? ' (tempered)' : ' ✗ ' + S.centsText(v.cents))) : ' · ' + S.label({ partial: p, cents: v.cents }, tol);
                chip.insertAdjacentHTML('beforeend', '<span class="skSpChip" style="color:' + ((COL[v.set || 'just'] || COL.just).label) + '">' + esc(t) + '</span>');
                const holder = chip.parentNode; if (holder && holder.style && holder.style.width === '88px') holder.style.width = '138px';
            });
        });
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · strikeById answers a spectrum id
const _strikeById = D.strikeById;
D.strikeById = function (id) { return _strikeById.call(this, id) || (this.isSpectrumId(id) ? this.spectrumStrike(id) : null); };
// 2 · select: the voices take their partial, cents and set; the 88 view; the labels
const _select = D.select;
D.select = function (id) {
    _select.call(this, id);
    if (!this.strike || this.strike.id !== id) return;
    const sp = !!this.strike.spectrum;
    this.voices.forEach(v => { const n = this.strike.notes[v.i] || {}; v.cents = sp ? (+n.cents || 0) : 0; v.partial = sp ? n.partial : undefined; v.set = sp ? n.set : undefined; });
    if (sp && !this.cfg.show88) { this.cfg.show88 = true; const b = this.el.querySelector('#sk88'); if (b) b.checked = true; this.save(); }
    if (sp) { this.render(); const S = SP(); this.setStatus(this.strike.label + ' · ' + this.strike.notes.length + ' notes of ' + S.nm(this.strike.fundamental) + (this.strike.sets.indexOf('8ve') >= 0 ? ' · JUST (pink) at the right, the same partials in every octave (green) to its left' : ' · the JUST column') + ' · players who cannot bend take only notes within ±' + this.specTol() + '¢'); }
};
// 3 · the banner rides on renderBanners; the range strip, the columns and the labels on renderKeyboard; the chips on renderOrch; the hover on renderLines
const _renderBanners = D.renderBanners;
D.renderBanners = function () { const r = _renderBanners.apply(this, arguments); try { this.renderSpectrumBanner(); } catch (e) { console.warn('[spectrum_ui] banner:', e); } return r; };
const _renderKeyboard = D.renderKeyboard;
D.renderKeyboard = function () { const r = _renderKeyboard.apply(this, arguments); try { this.paintKeyboardExtras(); } catch (e) { console.warn('[spectrum_ui] keyboard:', e); } return r; };
const _renderOrch = D.renderOrch;
D.renderOrch = function () { const r = _renderOrch.apply(this, arguments); try { this.paintSpectrumChips(); } catch (e) { console.warn('[spectrum_ui] chips:', e); } return r; };
const _renderLines = D.renderLines;
D.renderLines = function () { const r = _renderLines.apply(this, arguments); try { this.paintRangeHover(); } catch (e) {} return r; };
// 4 · a fixed-pitch player plays the tempered note: its cents are dropped on the way out (they are within the tolerance by the rule)
const _notesFor = D.notesFor;
D.notesFor = function (mode) {
    const out = _notesFor.apply(this, arguments);
    if (!out || !out.length) return out;
    return out.map(n => (n.cents && this.fixedPitch(n.row != null ? n.row : n.lane)) ? Object.assign({}, n, { cents: 0 }) : n);
};
}(typeof self !== 'undefined' ? self : this));
