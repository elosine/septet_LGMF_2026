// dyn_ui.js — THE DYNAMIC OF WHAT THE DRAWER PLAYS, ppp … fff (PLAN 1c.2b, 2026-09-19; RUNNING_LOG §95).
//
// His question: *"can I change the level? And where would I do that? And would it apply both to strikes and long tones? And could I
// get that in terms of actual dynamics? So PPP to FFF. … Instead, can I get a pull down for the PPP to FFF?"* His decisions: A — the
// pull-down REPLACES `dyn ×` and `flat 127` on the foot (their cfg fields stay, so an old take still loads; two level controls would
// fight); the default is `mf`.
//
// The ladder is the score's own written scale, not a new one (1b, bank/velocity_remap.json `scale`): a drawn height h is the anchor
// velocity 65 + 62·h, the whole written range spans 12 dB, 127 is the tutti fff he measured. Eight names, evenly spaced:
//   ppp 65 · pp 74 · p 83 · mp 92 · mf 100 · f 109 · ff 118 · fff 127   (≈ 1.7 dB a step)
// A mixin loaded after long_tone_ui.js: its wrap of `notesFor` is the outermost, so every note the chain built — a strike, a long
// tone, a chord at an onset, ♪ as dealt — leaves with `vel` = the chosen ANCHOR. `playNotes` (strike_drawer.js, 1c.2b) then sends
// each note the way the score sends a held note: the instrument's velocity for that level and its CC7 (velocityFor / cc7ForHeight).
// Insert writes the height that means the anchor, so the inserted note plays back at the level Hear played.
// The one exception: the accelerating run with its own level ramp (`vel → vel`, 1h) — its per-note anchors are kept.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[dyn_ui] the strikes drawer is not loaded'); return; }
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const LO = 65, HI = 127, DEFAULT = 'mf';
const NAMES = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
const ANCHOR = {}; NAMES.forEach((n, i) => { ANCHOR[n] = Math.round(LO + (HI - LO) * i / (NAMES.length - 1)); });

Object.assign(D, {
    dynName() { return NAMES.includes(this.cfg.dyn) ? this.cfg.dyn : DEFAULT; },
    dynAnchor() { return ANCHOR[this.dynName()]; },
    dynDb(name) { return ((ANCHOR[name || this.dynName()] - HI) * 12 / (HI - LO)); },   // re the tutti fff, on the 12 dB written span
    ensureDynUI() {
        const foot = this.el && this.el.querySelector('#skFoot'); if (!foot || foot.querySelector('#skDyn')) return;
        const dynX = foot.querySelector('#skDynX'), flat = foot.querySelector('#skFlat'); if (!dynX) return;
        // A: the two old controls leave the foot (not the cfg); the pull-down takes their place
        [dynX, flat].forEach(el => { const lab = el && el.closest('label'); if (lab) lab.style.display = 'none'; });
        const lab = document.createElement('label');
        lab.id = 'skDynLab';
        lab.title = 'PLAN 1c.2b (2026-09-19): the dynamic of everything the drawer plays — strikes, long tones, ♪ — and of what Insert writes. The score\'s own written scale: fff = the tutti fff (anchor 127), ppp = a drawn note\'s floor (65), 12 dB between them. Each instrument is sent its own velocity and CC7 for the level, as the score does.';
        lab.innerHTML = 'dyn <select id="skDyn" style="' + INP + '">' + NAMES.map(n => '<option value="' + n + '">' + n + '</option>').join('') + '</select>';
        dynX.closest('label').parentNode.insertBefore(lab, dynX.closest('label'));
        lab.querySelector('#skDyn').addEventListener('change', e => {
            this.cfg.dyn = NAMES.includes(e.target.value) ? e.target.value : DEFAULT; this.save(); this.paintDynUI();
            this.setStatus('dyn ' + this.dynName() + ' — anchor ' + this.dynAnchor() + ', ' + this.dynDb().toFixed(1) + ' dB re the tutti fff; every player sent its own velocity and CC7 for that level');
            e.target.blur();
        });
    },
    paintDynUI() {
        if (!this.el) return; this.ensureDynUI();
        const sel = this.el.querySelector('#skDyn'); if (sel) sel.value = this.dynName();
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · every note leaves with the chosen anchor — except the run's own level ramp, which is already a per-note anchor
const _notesFor = D.notesFor;
D.notesFor = function (mode) {
    const out = _notesFor.apply(this, arguments);
    if (this.cfg.shape === 'accel' && mode !== 'piano' && this.accelSpec && this.accelSpec().level) return out;
    const a = this.dynAnchor();
    return (out || []).map(n => Object.assign({}, n, { vel: a }));
};
// 2 · the select follows cfg: at build and after every applyState (a take, back)
const _writeFields = D.writeFields;
D.writeFields = function () { const r = _writeFields.apply(this, arguments); try { this.paintDynUI(); } catch (e) { console.warn('[dyn_ui] paint:', e); } return r; };
if (D.el) D.paintDynUI();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.paintDynUI(); });
else setTimeout(() => { if (D.el) D.paintDynUI(); }, 0);

root.StrikeDyn = { NAMES, ANCHOR, LO, HI };
}(typeof self !== 'undefined' ? self : this));
