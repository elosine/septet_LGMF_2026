// long_tone_ui.js — LONG TONES ON HEAR (PLAN 1c.2, laid out with the composer 2026-09-19; RUNNING_LOG §94).
//
// His words: *"I want to keep the hear orchestrated functionality. I press space bar to listen. My thought was that I can have a menu
// as to what I want to hear orchestrated. So if I want to hear long tones, I can check or pull a menu down, selection, and then press a
// space bar to hear the long tones instead."* And his decision A: Insert follows the menu (STRIKES_TOOL §AC-2 — Hear plays what
// Insert writes).
//
// A mixin on the strikes drawer, loaded AFTER every other drawer mixin (composer.html), so its wrap of `notesFor` is the outermost:
//   · `hear [strike | long tone] [N] s` in the foot, right of Stop. Both settings live in cfg (`hearMode`, `longS`) — remembered in the
//     browser (D.save) and saved / restored with takes (state() carries cfg whole; writeFields repaints after applyState).
//   · on `long tone`, mode `orch`: the notes the chain built become the harmony AS DEALT — each player·pitch once, together at 0, held
//     N seconds (the strike's velocity, dyn × and flat 127 have already been applied by the chain). Hear, SPACE and Insert all read
//     `notesFor('orch')`, so all three follow the menu. `piano` mode is untouched.
//   · on `strike` the wrapper returns the chain's notes unchanged — the drawer is byte-identical to before this file.
// SPACE while playing = stop: the drawer's own capture listener, not touched here.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[long_tone_ui] the strikes drawer is not loaded'); return; }
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const DEF_S = 6, MIN_S = 0.5, MAX_S = 120;
const clampS = v => (isFinite(+v) && +v > 0) ? Math.max(MIN_S, Math.min(MAX_S, +v)) : DEF_S;

Object.assign(D, {
    hearMode() { return this.cfg.hearMode === 'long' ? 'long' : 'strike'; },
    isLong() { return this.hearMode() === 'long'; },
    longS() { return clampS(this.cfg.longS); },
    // the held chord: each player·pitch once (the reading `♪ as dealt` uses), together at 0, held N s
    longNotes(notes) {
        const seen = new Set(), out = [], durMs = Math.round(this.longS() * 1000);
        (notes || []).forEach(n => { const k = n.lane + '|' + n.tech + '|' + n.midi; if (seen.has(k)) return; seen.add(k); out.push(Object.assign({}, n, { onMs: 0, durMs })); });
        return out;
    },
    ensureLongUI() {
        const foot = this.el && this.el.querySelector('#skFoot'); if (!foot || foot.querySelector('#skHearMode')) return;
        const stop = foot.querySelector('#skStop'); if (!stop) return;
        const wrap = document.createElement('span');
        wrap.id = 'skLongGrp'; wrap.style.cssText = 'display:inline-flex;gap:4px;align-items:center;white-space:nowrap';
        wrap.title = 'PLAN 1c.2 (2026-09-19): what SPACE / Hear orchestrated plays — strike: the pattern, as always · long tone: the harmony as dealt, every player its note, together, held this many seconds. Insert @ playhead writes what Hear plays.';
        wrap.innerHTML = '<label>hear <select id="skHearMode" style="' + INP + '"><option value="strike">strike</option><option value="long">long tone</option></select></label>' +
            '<label><input id="skLongS" type="number" min="' + MIN_S + '" max="' + MAX_S + '" step="0.5" style="width:44px;' + INP + '"> s</label>';
        stop.parentNode.insertBefore(wrap, stop.nextSibling);
        wrap.querySelector('#skHearMode').addEventListener('change', e => {
            this.cfg.hearMode = e.target.value === 'long' ? 'long' : 'strike'; this.save(); this.paintLongUI();
            this.setStatus(this.isLong() ? 'hear: long tone — SPACE holds the harmony as dealt for ' + this.longS() + ' s; Insert @ playhead writes the held chord' : 'hear: strike — the pattern, as always');
        });
        wrap.querySelector('#skLongS').addEventListener('change', e => { this.cfg.longS = clampS(e.target.value); this.save(); this.paintLongUI(); if (this.isLong()) this.setStatus('long tone: ' + this.longS() + ' s'); });
    },
    paintLongUI() {
        if (!this.el) return; this.ensureLongUI();
        const sel = this.el.querySelector('#skHearMode'), box = this.el.querySelector('#skLongS'); if (!sel || !box) return;
        sel.value = this.hearMode();
        if (document.activeElement !== box) box.value = this.longS();
        box.disabled = !this.isLong(); box.style.opacity = this.isLong() ? '' : 0.45;
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · the notes Hear builds — outermost, so every other mixin's reading (the chords at onsets, the swells, the piano block) is what gets held
const _notesFor = D.notesFor;
D.notesFor = function (mode) {
    const out = _notesFor.apply(this, arguments);
    if (mode !== 'orch' || !this.isLong()) return out;
    return this.longNotes(out);
};
// 2 · the status names it ("hearing long tones · 6 s · 8 notes"); playNotes adds the count
const _play = D.play;
D.play = async function (mode) {
    if (mode === 'orch' && this.isLong()) { if (!this.strike) return; return this.playNotes(this.notesFor('orch'), 'long tones · ' + this.longS() + ' s'); }
    return _play.apply(this, arguments);
};
// 3 · Insert follows the menu (his decision A): the notes are already held through notesFor; the status says so
const _insert = D.insert;
D.insert = function () {
    const r = _insert.apply(this, arguments);
    if (this.isLong()) { const s = this.el && this.el.querySelector('#skStatus'); if (s && /^inserted|inserted \d/.test(s.textContent)) this.setStatus(s.textContent + ' · long tones · ' + this.longS() + ' s'); }
    return r;
};
// 4 · the menu and the box follow cfg: at build, and after every applyState (a take, back)
const _writeFields = D.writeFields;
D.writeFields = function () { const r = _writeFields.apply(this, arguments); try { this.paintLongUI(); } catch (e) { console.warn('[long_tone_ui] paint:', e); } return r; };
// the drawer is built before this file runs (defer order): paint now
if (D.el) D.paintLongUI();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.paintLongUI(); });
else setTimeout(() => { if (D.el) D.paintLongUI(); }, 0);

}(typeof self !== 'undefined' ? self : this));
