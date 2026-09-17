// containers_ui.js — TIME CONTAINERS AS A RHYTHM IN THE STRIKES DRAWER (PLAN 1o step 3; CN-56; RUNNING_LOG §305–309).
//
// The generator itself is `time_containers.js` and knows nothing of the drawer — his own ask (*"it'd be worth abstracting it into its own
// module because this is a type of technique I do a lot of"*). This file is only the wiring: **containers joins the drawer's own `shape`
// menu**, beside *as played · even · … · accel*, so it makes a rhythm for ATTACKS and SWELLS, NOTES and CHORDS alike (§304). It belongs to
// the drawer, not to 1o.
//
// Two rhythms, because the drawer has two kinds of consumer:
//   · CHORDS mode deals over whatever onsets it is given, so it takes the whole roll — however many containers fill the span.
//   · NOTES mode reshapes the strike's own recorded slots, so it must keep their COUNT; it takes the roll's first n gaps, rolling on if
//     the span runs out. The shape of the rhythm is the containers', the number of notes stays the strike's.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[containers_ui] the strikes drawer is not loaded'); return; }

const TC = () => root.TimeContainers;
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const CT_DEFAULTS = {
    values: '2 5 7 15', weights: '', unit: 1, total: 60,
    stick: 0.8, jump: 0.10,
    contour: 'flat', turn: 0.5, bow: 1, depth: 1,
    seed: 1, preset: '',
};

Object.assign(D, {

    ct() {
        if (!this.cfg.ct) this.cfg.ct = JSON.parse(JSON.stringify(CT_DEFAULTS));
        else for (const k in CT_DEFAULTS) if (this.cfg.ct[k] === undefined) this.cfg.ct[k] = CT_DEFAULTS[k];
        return this.cfg.ct;
    },
    isContainers() { return this.cfg.shape === 'containers'; },
    ctDirty() { this._ct = null; if (this.chordDirty) this.chordDirty(); },

    ctOpts() {
        const c = this.ct();
        const nums = String(c.values || '').split(/[\s,]+/).map(Number).filter(x => isFinite(x) && x > 0);
        const wRaw = String(c.weights || '').split(/[\s,]+/).filter(x => x !== '');
        const weights = wRaw.length ? nums.map((v, i) => {
            const t = wRaw[i];
            if (t == null || t === '-' || t === '') return null;
            const n = parseFloat(String(t).replace('%', ''));
            if (!isFinite(n)) return null;
            return String(t).indexOf('%') >= 0 || n > 1 ? n / 100 : n;      // 20 or 20% or 0.2 all mean a fifth
        }) : null;
        return { values: nums, weights, unit: +c.unit || 1, total: +c.total || 60,
                 stick: +c.stick, jump: +c.jump, contour: c.contour, turn: +c.turn, bow: +c.bow, depth: +c.depth,
                 seed: Math.max(1, +c.seed || 1) };
    },
    ctRoll() {
        const T = TC(); if (!T) return null;
        const o = this.ctOpts();
        const key = JSON.stringify(o);
        if (this._ct && this._ct.key === key) return this._ct.out;
        const out = T.roll(o);
        this._ct = { key, out };
        return out;
    },
    // the roll continued until it has at least `n` containers — for notes mode, which must keep the strike's own note count
    ctGaps(n) {
        const T = TC(); if (!T) return [];
        const o = this.ctOpts(); const gaps = [];
        let seed = o.seed, guard = 0;
        while (gaps.length < n && guard++ < 40) {
            const r = T.roll(Object.assign({}, o, { seed }));
            if (!r.seq.length) break;
            r.seq.forEach(v => gaps.push(v));
            seed++;
        }
        return gaps.slice(0, n);
    },

    // ---------------------------------------------------------------- the controls
    injectContainerUI() {
        if (!this.el || this.el.querySelector('#skCtFoot')) return;
        const T = TC();
        const foot = this.el.querySelector('#skFoot'); if (!foot) return;
        const cf = document.createElement('span');
        cf.id = 'skCtFoot';
        cf.style.cssText = 'display:none;gap:5px;align-items:center;white-space:nowrap;flex-wrap:wrap';
        const contours = T ? T.CONTOURS : [['flat', 'no contour']];
        cf.innerHTML = '<span style="color:#555">|</span><span style="color:#9a9">containers</span>'
            + '<select id="skCtPre" style="' + INP + ';max-width:190px" title="a starting point, sorted by SPREAD (largest ÷ smallest) — because the spread is what you actually hear. Picking one fills the boxes; it is not a mode."><option value="">preset…</option></select>'
            + '<input id="skCtVals" style="' + INP + ';width:120px" title="the numbers, separated by spaces">'
            + '<input id="skCtW" style="' + INP + ';width:86px" placeholder="weights" title="one weight per number, or blank. 20 or 20% or 0.2 all mean a fifth; a dash or a gap means &quot;share what is left&quot; — his own rule">'
            + '<label style="color:#8a8" title="seconds per unit — one number rescales a whole shape">× <input id="skCtUnit" type="number" step="0.05" min="0.01" style="' + INP + ';width:48px"> s</label>'
            + '<label style="color:#8a8" title="the span the roll fills; it stops short and says by how much">fill <input id="skCtTot" type="number" step="1" min="1" style="' + INP + ';width:48px"> s</label>'
            + '<label style="color:#8a8" title="how much the next container stays near the last — the periodicity">stick <input id="skCtStick" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:44px"></label>'
            + '<label style="color:#8a8" title="how often it deliberately leaps far — the interruption. Its own control, because stickiness alone locks onto one value and never leaves.">interrupt <input id="skCtJump" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:44px"></label>'
            + '<select id="skCtContour" style="' + INP + '" title="the accordion: the size the roll is pulled toward across the span">'
            + contours.map(c => '<option value="' + c[0] + '">' + esc(c[1]) + '</option>').join('') + '</select>'
            + '<span id="skCtShape" style="display:none;gap:4px;align-items:center">'
            + '<label style="color:#8a8" title="where the reversal sits — the asymmetry">turn <input id="skCtTurn" type="number" step="0.05" min="0.02" max="0.98" style="' + INP + ';width:44px"></label>'
            + '<label style="color:#8a8" title="broad (below 1) or sharp (above 1) at the turn">bow <input id="skCtBow" type="number" step="0.1" min="0.1" max="4" style="' + INP + ';width:44px"></label>'
            + '<label style="color:#8a8" title="how hard the contour pulls — this is what decides whether the large-scale form is the subject or the background">depth <input id="skCtDepth" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:44px"></label>'
            + '</span>'
            + '<label style="color:#8a8" title="the same seed rolls the same set">seed <input id="skCtSeed" type="number" step="1" min="1" style="' + INP + ';width:44px"></label>'
            + '<button id="skCtRoll" style="' + BTN + ';color:#e8a06a" title="roll again (a new seed)">roll</button>'
            + '<span id="skCtOut" style="color:#9a9;max-width:520px;overflow:hidden;text-overflow:ellipsis"></span>';
        foot.insertBefore(cf, foot.querySelector('#skTakeGrp'));
        const pre = cf.querySelector('#skCtPre');
        if (T) T.PRESETS.forEach(p => {
            const o = document.createElement('option');
            o.value = p.key;
            o.textContent = T.spreadOf(p.values) + '× · ' + p.label + ' — ' + p.values.join(' ');
            o.title = p.note;
            pre.appendChild(o);
        });
        pre.addEventListener('change', () => {
            const p = T && T.PRESETS.find(x => x.key === pre.value); if (!p) return;
            const c = this.ct();
            c.preset = p.key; c.values = p.values.join(' ');
            c.weights = p.weights ? p.weights.map(w => (w == null ? '-' : Math.round(w * 100) + '%')).join(' ') : '';
            this.ctDirty(); this.save(); this.paintContainers(); this.render();
            this.setStatus(p.label + ' — ' + p.note + ' · spread ' + T.spreadOf(p.values) + '×');
        });
        ['skCtVals', 'skCtW', 'skCtUnit', 'skCtTot', 'skCtStick', 'skCtJump', 'skCtContour', 'skCtTurn', 'skCtBow', 'skCtDepth', 'skCtSeed']
            .forEach(id => cf.querySelector('#' + id).addEventListener('change', () => {
                const c = this.ct(), q = i => cf.querySelector('#' + i);
                c.values = q('skCtVals').value; c.weights = q('skCtW').value;
                c.unit = +q('skCtUnit').value || 1; c.total = +q('skCtTot').value || 60;
                c.stick = +q('skCtStick').value; c.jump = +q('skCtJump').value;
                c.contour = q('skCtContour').value;
                c.turn = +q('skCtTurn').value; c.bow = +q('skCtBow').value; c.depth = +q('skCtDepth').value;
                c.seed = Math.max(1, +q('skCtSeed').value || 1);
                c.preset = '';
                this.ctDirty(); this.save(); this.paintContainers(); this.render();
            }));
        cf.querySelector('#skCtRoll').addEventListener('click', () => {
            const c = this.ct(); c.seed = Math.max(1, +c.seed || 1) + 1;
            this.ctDirty(); this.save(); this.paintContainers(); this.render();
            const r = this.ctRoll();
            this.setStatus(r ? (TC().describe(this.ctOpts(), r) + '  →  ' + r.units.join(' ')) : 'the container module is not loaded');
        });
        this.paintContainers();
    },
    // the shape menu is built fresh every time a strike is rendered, so the entry is ensured on every paint rather than once at inject
    ensureShapeOption() {
        const sh = this.el && this.el.querySelector('#skShape');
        if (!sh || Array.from(sh.options).some(o => o.value === 'containers')) return;
        const o = document.createElement('option');
        o.value = 'containers'; o.textContent = 'containers';
        o.title = 'PLAN 1o: a rolled set of time containers — a pool of numbers × an order (stickiness, interrupt) × a contour (the accordion)';
        sh.appendChild(o);
        if (this.cfg.shape === 'containers') sh.value = 'containers';
    },
    paintContainers() {
        if (!this.el) return;
        this.ensureShapeOption();
        const cf = this.el.querySelector('#skCtFoot'); if (!cf) return;
        const on = this.isContainers() && !(this.isFill && this.isFill());
        cf.style.display = on ? 'inline-flex' : 'none';
        if (!on) return;
        const c = this.ct(), q = i => cf.querySelector('#' + i);
        q('skCtPre').value = c.preset || '';
        q('skCtVals').value = c.values; q('skCtW').value = c.weights;
        q('skCtUnit').value = c.unit; q('skCtTot').value = c.total;
        q('skCtStick').value = c.stick; q('skCtJump').value = c.jump;
        q('skCtContour').value = c.contour;
        q('skCtTurn').value = c.turn; q('skCtBow').value = c.bow; q('skCtDepth').value = c.depth;
        q('skCtSeed').value = c.seed;
        q('skCtShape').style.display = c.contour === 'flat' ? 'none' : 'inline-flex';
        const T = TC(), r = this.ctRoll();
        q('skCtOut').textContent = (T && r) ? (r.why || (r.units.join(' ') + '   ·   ' + T.describe(this.ctOpts(), r))) : '';
    },
});

// ---------------------------------------------------------------- the two rhythms
// CHORDS: the whole roll — however many containers fill the span
if (D.chordOnsets) {
    const _chordOnsets = D.chordOnsets;
    D.chordOnsets = function () {
        if (this.isContainers && this.isContainers()) {
            const T = TC(), r = this.ctRoll();
            if (T && r && r.seq.length) return T.onsetsMs(r, 0);
        }
        return _chordOnsets.apply(this, arguments);
    };
}
// NOTES: the strike's own note count, at the containers' gaps
const _pattern = D.pattern;
D.pattern = function (keep) {
    if (this.isContainers && this.isContainers()) {
        const all = this.slotsPlayed.slice().sort((a, b) => a - b);
        const n = (keep ? keep.length : all.length);
        if (n > 0) {
            const gaps = this.ctGaps(Math.max(0, n - 1));
            if (gaps.length) {
                const out = [0];
                gaps.forEach(g => out.push(out[out.length - 1] + g * 1000));
                return out.slice(0, n).map(t => t * this.cfg.timeX);
            }
        }
    }
    return _pattern.apply(this, arguments);
};
// the shape menu is rebuilt by every render of the control panel, so the entry and the row are ensured after each one — hooking
// paintMode alone was not enough, because a render can happen without a mode change (found on the walk)
const _render = D.render;
D.render = function () {
    const r = _render.apply(this, arguments);
    if (this.paintContainers) { try { this.paintContainers(); } catch (e) { } }
    if (this.paintSound) { try { this.paintSound(); } catch (e) { } }
    return r;
};
if (D.paintMode) {
    const _paintMode = D.paintMode;
    D.paintMode = function () { _paintMode.apply(this, arguments); if (this.paintContainers) this.paintContainers(); };
}

if (D.el) D.injectContainerUI();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.injectContainerUI(); });
else setTimeout(() => { if (D.el) D.injectContainerUI(); }, 0);
}(typeof self !== 'undefined' ? self : this));
