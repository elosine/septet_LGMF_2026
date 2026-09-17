// strike_drawer.js — THE STRIKES DRAWER (PLAN 1c.2; the requirements, decision by decision, in
// docs/STRIKES_TOOL.md — sections A–T). Built 2026-09-03/04 for the composer's morning test.
//
// One full-width drawer that pulls up from the bottom of the composer score. Left to right:
//   0 · the SEQUENCE — the strikes of the source save in order (index · go time · notes)
//   1 · the KEYBOARD — vertical, the ensemble span (an `88` toggle widens it), every voice a dot
//       in its pitch-class colour with its name; hollow = a stand-in (the articulation sounds,
//       not the pitch); a ring = the piano plays it too
//   2 · the ORCHESTRATION — the seven players in score order, shuffle, top / bottom locks, the
//       "shuffle may fold" switch, an articulation menu on every row; dotted lines from keys
//   3 · the ARTICULATION picker — the clicked player's full roster grouped by kind, and the
//       variant list (open strings, multiphonic keys, noise keys) with a ▶ to hear each
//   4 · the RHYTHM strip — rows aligned with the keyboard, time left→right, the live 60 ms
//       bands, transforms (span ×, shape + amount, jitter, reverse, rotate, reshuffle) and the
//       ORDER (presets, shuffle, click two dots to swap)
// Bottom: voicing presets (original · spread · cluster ±oct · low · high · high+low · reshuffle),
// Hear piano / Hear orchestrated / Stop, duration × / dyn × / flatten, Insert @ playhead,
// Replace in place, back, takes (save / load), the piano quick buttons.
//
// THE MODEL (STRIKES_TOOL L): three independent lists — PITCHES (the harmony), ONSETS (the
// rhythmic positions), PLAYERS — paired freely: pitch↔onset (the order), pitch↔player (the
// orchestration). "As played" is one pairing. Voicing presets move octaves only; the harmony
// never changes. An articulation is a layer (S): a voice keeps its harmony pitch, the KIND of
// the articulation decides what sounds (pitched / fixed-pitch / noise / multiphonic → stand-in).
// Ranges (F): the shuffle never produces a misfit; a hand choice that misfits folds by octave
// (marked ↑ ↓) or is skipped. The 60 ms grouping is re-derived after every transform (J).
//
// MIDI glue and scheduling are the multitempo panel's, verbatim in spirit: MorphEmit.ensureMidi
// / routeFor / noteOn / noteOff, panic() the one stop path, timers in E._timers, one absolute
// time base. Composer, TRACKS, META_LAYER, INSTRUMENTS are script-level consts in composer.html
// (global lexical scope, not window properties) — read as free identifiers.
(function (root) {
'use strict';

const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const TRK = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const INST = () => (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : (root.INSTRUMENTS || {}));
const AC_ = () => (typeof AccelCalc !== 'undefined' ? AccelCalc : (root.AccelCalc || null));       // 1h: the acceleration calculator (accel_calc.js)
const VR_ = () => (typeof VelocityRemap !== 'undefined' ? VelocityRemap : (root.VelocityRemap || null));
const DIAL_CFG = { curve: 'aCurve', ease: 'aEase', knee: 'aKnee', gamma: 'aGamma' };   // the shapes' dials → the cfg fields
// 1h (composer, 2026-09-06, CN-30): the run's dials — the shape, its number, the length by steep / notes / ms, jitter, hold,
// mirror, the level ramp; a take saved before them gets these, never the last strike's
const ACCEL_DEFAULTS = { aShape: 'geometric', aLen: 'ratio', aCount: 12, aDur: 2000, aCurve: 0, aEase: 2, aKnee: 0.5, aGamma: 2, aJit: 0, aJitEnd: '', aHold: 0, aMirror: false, aVel0: '', aVel1: '', aVelCurve: 0, aDeal: 'robin', aPool: 'cards' };

const DB_URL = '/bank/scattered_strikes.json';
const STORE = 'septet.strikeDrawer.v3';
const TAKES = 'septet.strikeTakes.v1';            // v1: the browser's takes — read once by the migration, never written again
const TAKES_PANEL = 'strikes';                     // O v2 (2026-09-04): takes live in bank/panel_snapshots.json under this bucket
const TAKE_NAME = /^[A-Za-z0-9._ -]{1,64}$/;       // the server's name rule (score/snapshots.js), checked here first
const LEAD_MS = 250, CC0_LEAD_MS = 30;
const SPAN = { lo: 36, hi: 96 };        // the ensemble's span on screen (cello C2 … flute C7)
const FULL = { lo: 21, hi: 108 };       // the `88` toggle
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK = [1, 3, 6, 8, 10];
const PC_PALETTE = ['#ffd479', '#7ec9a8', '#8ea9c9', '#c98a8a', '#b58ec9', '#d4c25e',
                    '#69b7c9', '#c9986e', '#96c96e', '#c96ea8', '#8a8ac9', '#e0e0e0'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const SEED_KEEP = 8;   // U8: how many earlier seeds each random button keeps as chips
const OPEN_STRINGS = { violin1: [55, 62, 69, 76], violin2: [55, 62, 69, 76], viola: [48, 55, 62, 69], cello: [36, 43, 50, 57] };
const PLAIN_PREF = ['ord', 'main', 'senza_vel', 'senza_mw', 'staccato'];
// U2 (composer, 2026-09-04): the default articulation of a strike — flute pizzicato (the written tongue
// ram), bass clarinet slap, violins Bartók, viola / cello gettato; the piano as it is; all at 127
const STRIKE_DEFAULT = { flute: 'pizzicato', bass_clarinet: 'slap', violin1: 'bartok_vel', violin2: 'bartok_vel', viola: 'gettato_vel', cello: 'gettato_vel', piano: 'main' };
// §377 (composer, 2026-09-10 — STRIKES_TOOL §AB1-b/-c): named sets for the seven rows, one click each. `percussive` IS STRIKE_DEFAULT
// and stays the default; spiccato has no flute or bass-clarinet voice, so those two take their plain staccato.
const ART_SETS = {
    percussive: STRIKE_DEFAULT,
    spiccato: { flute: 'staccato', bass_clarinet: 'stac_vel', violin1: 'spicc_vel', violin2: 'spicc_vel', viola: 'spicc_vel', cello: 'spicc_vel', piano: 'main' },
    staccato: { flute: 'staccato', bass_clarinet: 'stac_vel', violin1: 'stac_vel', violin2: 'stac_vel', viola: 'stac_vel', cello: 'stac_vel', piano: 'main' },
};

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffled(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function plainTech(inst) {
    const techs = (inst && inst.techniques) || [];
    for (const k of PLAIN_PREF) { const t = techs.find(q => q.key === k); if (t) return t.key; }
    return techs.length ? techs[0].key : null;
}
// the KIND of an articulation (S): until the recipe file carries a `kind` field (0c), a name rule
function kindOf(tech) {
    if (!tech) return 'pitched';
    if (tech.kind) return tech.kind;
    const s = (tech.key + ' ' + (tech.label || '')).toLowerCase();
    if (/multiphon|mp_/.test(s)) return 'multiphonic';
    if (/behind_bridge|peg_box|_open|open strings|sul[1-4]|nh_gliss|harmonics sul/.test(s)) return 'fixed';
    if (/body|undef|key_click|key_noises|slap|air_noise|jet_whistle|tongue_ram|whistle|noise|finger_vel|tailpiece|gliss_undef/.test(s)) return 'noise';
    return 'pitched';
}
function techRange(inst, tech) {
    const lo = (tech && tech.rangeLow != null) ? tech.rangeLow : (inst ? inst.rangeLow : 0);
    const hi = (tech && tech.rangeHigh != null) ? tech.rangeHigh : (inst ? inst.rangeHigh : 127);
    return [lo, hi];
}
function permutations(arr) {   // every order of arr (Heap's algorithm); used for ≤ 7 cards (5040)
    const out = [], a = arr.slice(), c = new Array(a.length).fill(0); out.push(a.slice()); let i = 1;
    while (i < a.length) { if (c[i] < i) { const k = i % 2 ? c[i] : 0; const t = a[i]; a[i] = a[k]; a[k] = t; out.push(a.slice()); c[i]++; i = 1; } else { c[i] = 0; i++; } }
    return out;
}
function foldInto(pitch, lo, hi) {
    let p = pitch, n = 0;
    while (p < lo && n < 8) { p += 12; n++; }
    while (p > hi && n > -8) { p -= 12; n--; }
    return (p >= lo && p <= hi) ? { pitch: p, oct: n } : null;
}

const D = {
    el: null, body: null, db: null, seq: null, strike: null,
    voices: [], slots: [], ph: null, base: 0, prev: null, pickerLane: null,
    cfg: { strikeId: null, show88: false, rowH: 0, full: true, heightPx: 0, voicing: 'original', vSeed: 1, clusterOct: 0,
           timeX: 1, shape: 'played', amount: 1, jitterMs: 0, reverse: false, rotate: 0, rSeed: 1, dropRests: true, aFirst: 100, aRatio: 0.85, aFloor: 45, aMin: 250, aSeed: 1, aRedeal: true, ...ACCEL_DEFAULTS, order: 'played', oSeed: 1, simMs: 60, keepRhythm: false,
           durX: 1, dynX: 1, flatten: true, mayFold: false, topLock: -1, bottomLock: -1, oSeedShuffle: 1, zoomPxPerMs: 0, rhythmW: 480, artSet: 'percussive', transpose: 0 },

    // ------------------------------------------------------------------ init / build
    init() {
        const host = document.getElementById('mtBtn') || document.getElementById('pulseBtn') ||
                     document.getElementById('textureBtn') || document.getElementById('morphBtn') || document.getElementById('blastsBtn');
        if (!host) { console.warn('[strikes] no button to anchor to'); return; }
        { const C = C_(); if (C && typeof C.loadVelocityRemap === 'function') C.loadVelocityRemap(); }   // 1h: the level ramp translates through 1g's remap — fetched once, early
        const btn = document.createElement('button');
        btn.id = 'strikesBtn'; btn.textContent = 'Strikes';
        btn.title = 'the scattered-strike drawer (docs/STRIKES_TOOL.md): pick a strike in the sequence, voice it, orchestrate it, shape its rhythm, hear it, put it back in the score';
        btn.addEventListener('click', () => this.toggle());
        host.parentNode.insertBefore(btn, host.nextSibling);
        this.restore();
        this.build();
        const tab = document.createElement('div');
        tab.id = 'strikesTab'; tab.textContent = 'STRIKES \u25B4';
        tab.title = 'open the strikes drawer';
        tab.style.cssText = 'position:fixed;right:14px;bottom:0;z-index:8999;background:#4a3a12;color:#e8cf9a;border:1px solid #C9A05A;border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:12px system-ui,sans-serif;letter-spacing:.06em';
        tab.addEventListener('click', () => this.toggle(true));
        document.body.appendChild(tab);
        window.addEventListener('resize', () => { if (this.el && this.el.style.display !== 'none') this.render(); });
        const e = E_();
        if (e) { const prev = e.onStop; e.onStop = () => { if (prev) try { prev(); } catch (x) {} this.onStopped(); }; }
        this.refreshTakes().then(() => this.migrateTakes());
    },

    build() {
        const d = document.createElement('div');
        d.id = 'strikeDrawer';
        d.tabIndex = -1;
        d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:58vh;z-index:9000;background:#1b1b20;border-top:2px solid #C9A05A;' +
            'color:#ddd;font:11px/1.4 system-ui,sans-serif;display:none;box-shadow:0 -8px 30px rgba(0,0,0,.6);overflow:hidden;flex-direction:column';
        const inp = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
        const btn = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
        d.innerHTML =
            '<div id="skHandle" style="flex:none;height:8px;cursor:ns-resize;background:linear-gradient(#3a3a44,#1b1b20)"></div>' +
            '<div id="skHead" style="flex:none;display:flex;gap:10px;align-items:center;padding:3px 10px;border-bottom:1px solid #444;background:rgba(201,160,90,.12)">' +
              '<b style="color:#e8cf9a">STRIKES</b>' +
              '<button id="skHearChord" style="' + btn + '" title="FIX-NOW 1 (2026-09-12): the loaded harmony AS DEALT — every player its note, one strike, no rhythm">&#9834; as dealt</button>' +
              '<span id="skStatus" style="color:#9a9;flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">idle</span>' +
              '<label>source <select id="skSeqSel" style="' + inp + '"></select></label>' +
              '<button id="skReload" style="' + btn + '" title="re-read bank/scattered_strikes.json">&#8635; db</button>' +
              '<button id="skRescan" style="' + btn + '" title="re-ingest the source save into the database (tools/strike_db.js via the server)">rescan</button>' +
              '<label title="the 60 ms simultaneity threshold — live">sim <input id="skSim" type="number" min="5" max="500" step="5" style="width:46px;' + inp + '"> ms</label>' +
              '<button id="skZ0" style="' + btn + '" title="fit the keyboard to the drawer">fit</button><button id="skZ1" style="' + btn + '">Z1</button><button id="skZ2" style="' + btn + '">Z2</button><button id="skZ3" style="' + btn + '">Z3</button>' +
              '<button id="skFull" style="' + btn + '" title="full page height / half">&#8597; full</button>' +
              '<label title="widen the keyboard to the piano\'s 88 keys"><input id="sk88" type="checkbox"> 88</label>' +
              '<span id="skClose" style="cursor:pointer;color:#888;font-size:14px;padding:0 4px">&#10005;</span>' +
            '</div>' +
            '<div id="skBody" style="flex:1 1 auto;min-height:0;position:relative;display:flex;gap:0;align-items:stretch;overflow:auto">' +
              '<div id="skSeq" style="flex:0 0 190px;overflow:auto;border-right:1px solid #333;padding:2px 0"></div>' +
              '<div id="skKbWrap" style="flex:0 0 150px;position:relative"><svg id="skKb" width="150" height="10"></svg></div>' +
              '<div id="skGap" style="flex:1 1 140px;max-width:320px;min-width:120px" title="the dotted lines run here: key → player"></div>' +
              '<div id="skOrch" style="flex:0 0 330px;border-left:1px solid #333;border-right:1px solid #333;position:relative;display:flex;flex-direction:column"></div>' +
              '<div id="skPick" style="flex:0 0 240px;border-right:1px solid #333;overflow:auto;display:none;padding:4px 6px"></div>' +
              '<div id="skRhyWrap" style="flex:0 0 480px;position:relative;min-width:300px"><svg id="skRhy" width="100%" height="10"></svg></div>' +
              '<div id="skSpacer" style="flex:1 1 0"></div>' +
              '<svg id="skLines" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible"></svg>' +
            '</div>' +
            '<div id="skFoot" style="flex:none;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;padding:4px 10px;border-top:1px solid #444">' +
              '<span style="color:#9a9">voicing</span>' +
              ['original', 'spread', 'cluster', 'low', 'high', 'highlow'].map(v => '<button class="skV" data-v="' + v + '" style="' + btn + '">' + ({ original: 'original', spread: 'spread out', cluster: 'cluster', low: 'cluster low', high: 'cluster high', highlow: 'high + low' })[v] + '</button>').join('') +
              '<label title="the tight cluster moved by octaves">oct <input id="skClOct" type="number" min="-3" max="3" step="1" style="width:40px;' + inp + '"></label>' +
              '<span style="display:inline-flex;gap:2px;align-items:center" title="§377: move the WHOLE voicing — every voice, in any preset; the players re-fit their ranges (fold ↑↓ or ✕). A new strike sets it back to 0; back undoes">transpose ' +
              [[-12, '&minus;8va'], [-1, '&minus;&frac12;'], [1, '+&frac12;'], [12, '+8va']].map(p => '<button class="skTr" data-d="' + p[0] + '" style="' + btn + ';padding:1px 4px">' + p[1] + '</button>').join('') +
              ' <span id="skTrN" style="color:#e8cf9a;min-width:22px"></span></span>' +
              '<button id="skVRe" style="' + btn + '" title="a different realization of the same voicing preset">reshuffle voicing</button>' +
              '<span id="skSeedV"></span>' +
              '<span style="color:#555">|</span>' +
              '<button id="skHearP" style="' + btn + '">Hear piano</button><button id="skHearO" style="' + btn + ';color:#e8cf9a">Hear orchestrated</button><button id="skStop" style="' + btn + '">Stop</button>' +
              '<label>dur &times; <input id="skDurX" type="number" min="0.1" max="20" step="0.1" style="width:44px;' + inp + '"></label>' +
              '<label>dyn &times; <input id="skDynX" type="number" min="0.1" max="2" step="0.05" style="width:44px;' + inp + '"></label>' +
              '<label title="every note at velocity 127 (dyn × still applies)"><input id="skFlat" type="checkbox"> flat 127</label>' +
              '<button id="skSoloOff" style="' + btn + '" title="U3: shift-click a dot (keyboard or rhythm) to solo a voice, S on a player row to solo its voices">solo off</button>' +
              '<span style="color:#555">|</span>' +
              '<span style="color:#9a9">piano</span>' +
              ['none', 'one', 'topbot', 'rest', 'all'].map(k => '<button class="skPno" data-k="' + k + '" style="' + btn + '">' + ({ none: 'none', one: 'one', topbot: 'top+bottom', rest: 'rest', all: 'all' })[k] + '</button>').join('') +
              // PLAN 1t step 5: the piano's block on the PLAIN strike — blank = today (one note); with a count its one note at its own
              // shuffled onset becomes a chord of `count`, the harmony's leftovers first, then doubles of what the ensemble plays
              '<label title="PLAN 1t: blank = the piano&#39;s one note, as always. With a count, that note becomes a chord of this many — the harmony&#39;s leftovers first, then doubles of pitches the ensemble plays (CN-66), fitted to the hands">count <input id="skPnoRowN" type="number" min="0" max="10" step="1" placeholder="1" style="' + inp + ';width:34px"></label>' +
              '<label title="PLAN 1t: the piano&#39;s chord moved by octaves before it is fitted, ±4 (CN-65)">8va <input id="skPnoRow8va" type="number" min="-4" max="4" step="1" style="' + inp + ';width:34px"></label>' +
              '<label title="PLAN 1t: two hands (CN-61) or ONE hand per onset with the hands alternating (CN-67); blank = the pattern&#39;s own setting">hands <select id="skPnoRowHands" style="' + inp + ';width:58px"><option value="">pattern</option><option value="two">two</option><option value="one">one, alt</option></select></label>' +
              '<span id="skPnoRowWhy" style="color:#9a9"></span>' +
              '<span style="color:#555">|</span>' +
              '<button id="skGoto" style="' + btn + '" title="park the playhead on the original time of this strike (picking a strike no longer moves the playhead)">&#8982; original</button>' +
              '<button id="skInsert" style="' + btn + '" title="write the strike at the playhead as a gesture (groupId + META shape) — a COPY: an earlier insert of this strike is replaced only if it sits at this same time">Insert @ playhead</button>' +
              '<button id="skAtTime" style="' + btn + '" title="write the strike into WHATEVER score is open, at the time it was played (no need to open its source save); original notes found there are replaced">Insert @ original time</button>' +
              '<button id="skAfter" style="' + btn + '" title="U11: write the strike after the PREVIOUS strike as it stands in the open score — start = its last onset + the recorded onset gap between the two; an earlier insert of this strike is replaced">Insert @ after previous</button>' +
              '<button id="skBack" style="' + btn + '" title="one step back">back</button>' +
              // U9 (composer, 2026-09-04: "can we make return save, the save take button drifted to the other end of the
              // screen"): the take controls are one group that wraps as a unit, and ENTER in the box saves.
              '<span id="skTakeGrp" style="display:inline-flex;gap:4px;align-items:center;white-space:nowrap">' +
              '<input id="skTakeName" placeholder="take name — ENTER saves" style="width:130px;' + inp + '"><button id="skTakeSave" style="' + btn + '">save take</button>' +
              '<select id="skTakeSel" style="max-width:130px;' + inp + '"><option value="">load take…</option></select>' +
              '<button id="skTakeDel" title="delete the take named in the box (asks first)" style="' + btn + '">&times;</button>' +
              '</span>' +
              '<span id="skPlayhead" style="display:none;color:#e8cf9a">&#9654;</span>' +
            '</div>';
        document.body.appendChild(d);
        this.el = d; this.body = d.querySelector('#skBody');
        this.applyHeight();
        if (this.injectChordUI) this.injectChordUI();   // PLAN 1k: the mode switch and the chords foot (strike_chords_ui.js)
        if (this.injectFillUI) this.injectFillUI();     // PLAN 1n: the fill mode button and its foot (fill_ui.js) — after the mode row exists
        if (this.injectSwellUI) this.injectSwellUI();   // PLAN 1o: the sound switch (attack | crescendo) and its foot (swell_ui.js)
        if (this.injectContainerUI) this.injectContainerUI();   // PLAN 1o: time containers in the shape menu (containers_ui.js)
        // wiring
        const q = s => d.querySelector(s);
        q('#skClose').addEventListener('click', () => this.toggle(false));
        q('#skReload').addEventListener('click', () => this.loadDb(true));
        q('#skRescan').addEventListener('click', () => this.rescan());
        q('#skSeqSel').addEventListener('change', e => this.selectSeq(e.target.value));
        q('#skSim').addEventListener('change', e => { this.cfg.simMs = clamp(+e.target.value || 60, 5, 500); this.save(); this.render(); });
        q('#sk88').addEventListener('change', e => { this.cfg.show88 = e.target.checked; this.save(); this.render(); });
        q('#skZ0').addEventListener('click', () => { this.cfg.rowH = 0; this.save(); this.render(); });
        q('#skFull').addEventListener('click', () => { this.cfg.full = !this.cfg.full; this.save(); this.applyHeight(); this.render(); });
        q('#skZ1').addEventListener('click', () => { this.cfg.rowH = 6; this.save(); this.render(); });
        q('#skZ2').addEventListener('click', () => { this.cfg.rowH = 9; this.save(); this.render(); });
        q('#skZ3').addEventListener('click', () => { this.cfg.rowH = 12; this.save(); this.render(); });
        d.querySelectorAll('.skV').forEach(b => b.addEventListener('click', () => { this.snapshot(); this.cfg.voicing = b.dataset.v; this.applyVoicing(); this.save(); this.render(); }));
        q('#skClOct').addEventListener('change', e => { this.snapshot(); this.cfg.clusterOct = clamp(+e.target.value || 0, -3, 3); this.applyVoicing(); this.save(); this.render(); });
        q('#skVRe').addEventListener('click', () => { this.snapshot(); this.useSeed('vSeed', this.nextSeed('vSeed')); this.save(); this.render(); });
        d.querySelectorAll('.skTr').forEach(b => b.addEventListener('click', () => { if (!this.strike) return; this.snapshot(); this.cfg.transpose = clamp((+this.cfg.transpose || 0) + (+b.dataset.d), -48, 48); this.applyVoicing(); this.save(); this.render(); this.setStatus('voicing transposed ' + (this.cfg.transpose > 0 ? '+' : '') + this.cfg.transpose + ' semitones — the players re-fitted'); }));
        q('#skHearP').addEventListener('click', () => this.play('piano'));
        q('#skHearO').addEventListener('click', () => this.play('orch'));
        q('#skHearChord').addEventListener('click', () => this.hearDealt());
        q('#skStop').addEventListener('click', () => { const e = E_(); if (e) e.panic(); this.onStopped(); });
        q('#skDurX').addEventListener('change', e => { this.cfg.durX = clamp(+e.target.value || 1, 0.1, 20); this.save(); });
        q('#skDynX').addEventListener('change', e => { this.cfg.dynX = clamp(+e.target.value || 1, 0.1, 2); this.save(); });
        q('#skFlat').addEventListener('change', e => { this.cfg.flatten = e.target.checked; this.save(); });
        q('#skSoloOff').addEventListener('click', () => { this.snapshot(); this.voices.forEach(v => { v.solo = false; }); this.render(); });
        d.querySelectorAll('.skPno').forEach(b => b.addEventListener('click', () => { this.snapshot(); this.pianoQuick(b.dataset.k); this.render(); }));
        // PLAN 1t step 5: the piano row's block on the plain strike
        { const bind = (id, key) => { const el = d.querySelector(id); if (el) el.addEventListener('change', e => { this.snapshot(); this.cfg[key] = e.target.value; this.save(); this.render(); e.target.blur(); }); };
          bind('#skPnoRowN', 'pnoRowN'); bind('#skPnoRow8va', 'pnoRow8va'); bind('#skPnoRowHands', 'pnoRowHands'); }
        q('#skGoto').addEventListener('click', () => this.gotoOriginal());
        q('#skInsert').addEventListener('click', () => this.insert(false));
        q('#skAtTime').addEventListener('click', () => this.insert(true));
        q('#skAfter').addEventListener('click', () => this.insert('after'));
        q('#skBack').addEventListener('click', () => this.back());
        q('#skTakeSave').addEventListener('click', () => this.saveTake());
        q('#skTakeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveTake(); });   // U9
        q('#skTakeSel').addEventListener('change', e => { if (e.target.value) this.loadTake(e.target.value); e.target.value = ''; });
        q('#skTakeDel').addEventListener('click', () => this.deleteTake());
        // resize handle
        let drag = null;
        q('#skHandle').addEventListener('mousedown', e => { drag = { y: e.clientY, h: d.getBoundingClientRect().height }; e.preventDefault(); });
        document.addEventListener('mousemove', e => { if (!drag) return; const h = clamp(drag.h + (drag.y - e.clientY), 220, window.innerHeight); d.style.height = h + 'px'; this.cfg.full = false; this.cfg.heightPx = h; this.render(); });
        document.addEventListener('mouseup', () => { if (drag) this.save(); drag = null; });
        // SPACE while the drawer is open = hear orchestrated / stop, wherever the focus is; the score's own SPACE
        // (a bubbling listener on window) never sees it. Capture phase on window, because the score blurs every
        // select and number input on change (composer.html init, the "pull-down menus trap the spacebar" fix),
        // which dropped the focus to <body> and handed SPACE to the transport (composer, 2026-09-04: "at some
        // point it started playing the main score"). Text entry keeps its SPACE (the take name); a focused
        // select or button is blurred first so SPACE cannot open or press it.
        window.addEventListener('keydown', ev => {
            if (ev.code !== 'Space' || !this.el || this.el.style.display === 'none') return;
            const t = ev.target, m = q => !!(t && t.matches && t.matches(q));
            if (m('textarea, input[type=text], input[type=number], input[type=search], input:not([type])')) return;
            if (m('select, button')) t.blur();
            ev.preventDefault(); ev.stopPropagation();
            const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); } else this.play('orch');
        }, true);
        this.writeFields();
    },

    writeFields() {
        const q = s => this.el.querySelector(s);
        q('#skSim').value = this.cfg.simMs; q('#sk88').checked = !!this.cfg.show88;
        q('#skClOct').value = this.cfg.clusterOct; q('#skDurX').value = this.cfg.durX; q('#skDynX').value = this.cfg.dynX;
        q('#skFlat').checked = !!this.cfg.flatten;
        this.fillTakes();
    },
    applyHeight() {
        const full = this.cfg.full !== false;
        this.el.style.height = full ? '100vh' : ((this.cfg.heightPx || 0) >= 220 ? this.cfg.heightPx + 'px' : '58vh');
        const b = this.el.querySelector('#skFull'); if (b) b.innerHTML = full ? '&#8597; half' : '&#8597; full';
    },
    // the keyboard's row height: explicit (Z1–Z3) or fitted to the drawer's body
    rh() {
        if (this.cfg.rowH > 0) return this.cfg.rowH;
        const R = this.range(), bh = this.body ? this.body.clientHeight : 0;
        return clamp(Math.floor((bh - 6) / (R.hi - R.lo + 1)), 5, 16);
    },

    preflight() {
        const C = C_(), e = E_(), bad = [];
        if (!C) bad.push('Composer not reachable');
        if (!e || typeof e.ensureMidi !== 'function' || typeof e.routeFor !== 'function' || typeof e.panic !== 'function') bad.push('MorphEmit incomplete');
        if (!TRK().length || METAL() == null) bad.push('TRACKS / META_LAYER missing');
        if (C && typeof C.getTimeAtPlayhead !== 'function') bad.push('Composer.getTimeAtPlayhead missing');
        if (bad.length) console.error('[strikes] PREFLIGHT FAILED:', bad);
        return bad;
    },

    toggle(force) {
        const show = force != null ? force : this.el.style.display === 'none';
        this.el.style.display = show ? 'flex' : 'none';
        const b = document.getElementById('strikesBtn');
        if (b) { b.style.background = show ? '#4a3a12' : ''; b.style.color = show ? '#e8cf9a' : ''; }
        const tab = document.getElementById('strikesTab'); if (tab) tab.style.display = show ? 'none' : '';
        if (!show) { const e = E_(); if (e) e.panic(); return; }
        const bad = this.preflight();
        this.el.focus();
        if (bad.length) { this.setStatus('PREFLIGHT: ' + bad.join(' · '), true); return; }
        this.loadDb(false);
        this.refreshTakes();
    },

    // ------------------------------------------------------------------ the database
    async loadDb(force) {
        if (this.db && !force) { this.fillSeq(); return; }
        try {
            const r = await fetch(DB_URL + '?t=' + Date.now(), { cache: 'no-store' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            this.db = await r.json();
        } catch (err) { this.setStatus('cannot read ' + DB_URL + ' — run tools/strike_db.js first (' + err.message + ')', true); return; }
        this.fillSeq();
    },
    async rescan() {
        const seq = this.seq; if (!seq) return;
        this.setStatus('rescanning ' + seq.source + ' …');
        try {
            const r = await fetch('/api/strikes/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: seq.source, gap: this.db && this.db.defaults ? this.db.defaults.strikeGapMs : 500, sim: this.cfg.simMs }) });
            const j = await r.json();
            if (!j.success) throw new Error(j.error || 'ingest failed');
            const first = (j.census || '').split('\n').slice(0, 2).join(' · ');
            await this.loadDb(true);
            this.setStatus('rescanned: ' + first);
        } catch (err) { this.setStatus('rescan failed: ' + err.message + ' (is the server the one with /api/strikes/ingest? restart node score/server.js)', true); }
    },
    fillSeq() {
        const sel = this.el.querySelector('#skSeqSel');
        const seqs = Object.values((this.db && this.db.sequences) || {});
        sel.innerHTML = '';
        seqs.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.source + ' · ' + s.strikeIds.length + ' strikes'; sel.appendChild(o); });
        if (!seqs.length) { this.setStatus('the database has no sequences yet', true); return; }
        const want = this.seq && seqs.find(s => s.id === this.seq.id) ? this.seq.id : seqs[0].id;
        sel.value = want; this.selectSeq(want);
    },
    selectSeq(id) {
        this.seq = this.db.sequences[id]; if (!this.seq) return;
        const list = this.el.querySelector('#skSeq');
        list.innerHTML = '<div style="padding:2px 8px;color:#9a9">' + this.seq.strikeIds.length + ' strikes · ' + (this.seq.spanMs / 1000).toFixed(1) + ' s</div>';
        this.seq.strikeIds.forEach((sid, i) => {
            const s = this.db.strikes[sid]; if (!s) return;
            const row = document.createElement('div');
            row.className = 'skSeqRow'; row.dataset.id = sid;
            row.style.cssText = 'padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap';
            row.innerHTML = '<span style="color:#777;width:20px">' + s.index + '</span><span style="width:52px">' + s.t0.toFixed(2) + ' s</span><span style="color:#bbb">' + s.stats.noteCount + ' n</span><span style="color:#777">' + nm(s.stats.midi.min) + '–' + nm(s.stats.midi.max) + '</span>';
            row.addEventListener('click', () => this.select(sid));
            list.appendChild(row);
        });
        const want = this.cfg.strikeId && this.db.strikes[this.cfg.strikeId] && this.seq.strikeIds.includes(this.cfg.strikeId) ? this.cfg.strikeId : this.seq.strikeIds[0];
        if (want) this.select(want);
    },

    // ------------------------------------------------------------------ the strike → voices
    // harm_source_ui.js (PLAN 1d, 2026-09-09): a strike is the db's — or a harmony of the banners made into one on demand
    strikeById(id) { return (this.db && this.db.strikes && this.db.strikes[id]) || (this.harmStrike ? this.harmStrike(id) : null) || null; },
    select(id) {
        const s = this.strikeById(id); if (!s) return;
        this.strike = s; this.cfg.strikeId = id; this.prev = null;
        this.el.querySelectorAll('.skSeqRow').forEach(r => { r.style.background = r.dataset.id === id ? 'rgba(201,160,90,.25)' : ''; });
        // voices as played; the as-played pairing: voice i ↔ its own onset
        { const at = this.el.querySelector('#skAtTime'); if (at) at.textContent = 'Insert @ ' + s.t0.toFixed(2) + ' s (original)'; }
        this.voices = s.notes.map((n, i) => ({
            id: n.objectId, i, pitch0: n.midi, pc: ((n.midi % 12) + 12) % 12, pitch: n.midi,
            lane: -1, also: [], fold: 0, tech: null, standIn: null, piano: false, solo: false, vel: n.vel != null ? n.vel : 100, durMs: n.durMs || 100,
            dt0: n.dtMs, slot: i,
        }));
        this.slotsPlayed = s.notes.map(n => n.dtMs);      // the onset pattern as played (voice order)
        if (this.applySource) this.applySource();          // harm_source_ui.js: the onsets (and the accents) of another strike — rhythm from · extra notes
        this.cfg.transpose = 0;                             // §377: a transposition belongs to the voicing in play, and the voicing resets below
        // 2026-09-10: `keep rhythm` — a new pick (a harmony above all) no longer throws away the rhythm he built.
        // Parked as a one-liner on 2026-09-09 (STRIKES_TOOL §AA, "on his word"); his word came with
        // "I want to hear that same acceleration in a different harmony". OFF by default = the drawer exactly as it was.
        if (this.cfg.keepRhythm) {
            // the voicing still resets: a preset MOVES pitches, and carrying it onto a different harmony is not what he asked for.
            this.cfg.voicing = 'original';
            // a by-hand order was set slot-by-slot on the OLD note count and means nothing here; every rule-based order re-derives.
            if (this.cfg.order === 'manual') this.cfg.order = 'played';
        } else {
            this.cfg.voicing = 'original'; this.cfg.order = 'played'; this.resetRhythm();
        }
        this.asPlayedOrchestration();
        this.applyVoicing();
        // 2026-09-10: with `keep rhythm` on, the new harmony arrives ORCHESTRATED, not with empty lanes — his
        // "I can just choose a new harmony and then hear/orchestrate it". The existing seeded shuffle does it
        // (respects the top/bottom locks, never a misfit, the piano flagged); `reshuffle` gives another.
        if (this.cfg.keepRhythm) {
            // §342: the run only sounds voices that HAVE PLAYERS (accelUnits filters on them), so an unorchestrated
            // pick makes the whole rhythm vanish with no message. A harmony's pitches come from sonorityOf, not from a
            // real instrument's recording, so they miss ranges far more often than a played strike's do — which is why
            // strikes kept the rhythm and harmonies did not. Retry once with folding, then SAY what was placed.
            const placed = () => this.voices.filter(v => v.lane >= 0 && !v.skip).length;
            this.shuffleOrch();
            if (!placed() && this.voices.length && !this.cfg.mayFold) {
                const was = this.cfg.mayFold; this.cfg.mayFold = true; this.shuffleOrch(); this.cfg.mayFold = was;
                this._keepOrchFolded = placed() > 0;
            } else this._keepOrchFolded = false;
            this._keepOrchInfo = placed() + ' of ' + this.voices.length + ' voices orchestrated'
                + (this._keepOrchFolded ? ' (folded by octave to fit)' : '')
                + (placed() < this.voices.length ? ' — ' + (this.voices.length - placed()) + ' had no player that fits; reshuffle, or allow folding' : '');
        } else this._keepOrchInfo = '';
        this.save();
        // the pick leaves the playhead where the composer put it (2026-09-06: it used to park on the strike's original time, so a
        // "scroll, then pick, then Insert @ playhead" landed back at the original — the ⌖ button parks it on request; RUNNING_LOG §113)
        this.render();
        this.setStatus('strike #' + s.index + ' · ' + s.t0.toFixed(2) + ' s · ' + s.stats.noteCount + ' notes · span ' + Math.round(s.spanMs) + ' ms · ' + s.source + (this._keepOrchInfo ? ' · ' + this._keepOrchInfo : ''));
    },
    asPlayedOrchestration() {
        // as played: every voice on its recorded lane (the piano), no player assignment yet
        const T = TRK();
        this.voices.forEach(v => { const n = this.strike.notes[v.i]; const lane = T.findIndex(t => t.instKey === n.instKey); v.lane = -1; v.also = []; v.piano = lane >= 0 && T[lane].instKey === 'piano'; v.tech = null; v.fold = 0; v.standIn = null; });
    },

    // ------------------------------------------------------------------ voicing presets (B)
    range() { return this.cfg.show88 ? FULL : SPAN; },
    applyVoicing() {
        const vs = this.voices; if (!vs.length) return;
        const rnd = mulberry32(this.cfg.vSeed * 7919 + 17);
        const R = this.range();
        const nearestOct = (pc, target) => { let best = null; for (let p = pc; p <= 127; p += 12) { if (p < R.lo - 12) continue; if (best == null || Math.abs(p - target) < Math.abs(best - target)) best = p; } return clamp(best, R.lo, R.hi); };
        const pack = (list, centre) => {
            // the smallest chromatic span: rotate the sorted unique pcs so the largest gap is at the end
            const pcs = [...new Set(list.map(v => v.pc))].sort((a, b) => a - b);
            if (!pcs.length) return;
            let bestK = 0, bestSpan = 99;
            const spans = pcs.map((_, k) => (pcs[(k - 1 + pcs.length) % pcs.length] - pcs[k] + 12) % 12 || 12);   // span if we start at k
            pcs.forEach((_, k) => { if (spans[k] < bestSpan) { bestSpan = spans[k]; bestK = k; } });
            const near = pcs.map((_, k) => k).filter(k => spans[k] <= bestSpan + 2);
            const k0 = this.cfg.voicing === 'original' ? bestK : near[Math.floor(rnd() * near.length)];
            const packed = {}; let p = pcs[k0] + 12 * Math.round((centre - pcs[k0]) / 12);
            for (let j = 0; j < pcs.length; j++) { const pc = pcs[(k0 + j) % pcs.length]; while (p % 12 !== pc) p++; packed[pc] = p; }
            const lo = Math.min(...Object.values(packed)), hi = Math.max(...Object.values(packed));
            const shift = 12 * Math.round((centre - (lo + hi) / 2) / 12);
            list.forEach(v => { v.pitch = clamp(packed[v.pc] + shift, R.lo, R.hi); });
        };
        switch (this.cfg.voicing) {
            case 'original': vs.forEach(v => { v.pitch = v.pitch0; }); break;
            case 'spread': {
                const order = shuffled(vs, rnd);
                order.forEach((v, i) => { const target = R.lo + (i + 0.5) * (R.hi - R.lo) / order.length; v.pitch = nearestOct(v.pc, target); });
                break;
            }
            case 'cluster': pack(vs, 60 + 12 * this.cfg.clusterOct + Math.round((rnd() - 0.5) * 0)); break;
            case 'low': pack(vs, R.lo + 8 + 12 * this.cfg.clusterOct); break;
            case 'high': pack(vs, R.hi - 8 + 12 * this.cfg.clusterOct); break;
            case 'highlow': {
                const order = shuffled(vs, rnd); const half = Math.ceil(order.length / 2);
                pack(order.slice(0, half), R.lo + 8); pack(order.slice(half), R.hi - 8);
                break;
            }
        }
        // §377 (AB2, composer 2026-09-10: "way to shift the original voicing. Up or down Octaves"): the whole voicing moved, in ANY
        // preset — `oct` above only ever served the cluster presets. Applied once, after the preset; a new strike sets it back to 0.
        const tr = Math.round(+this.cfg.transpose || 0);
        if (tr) vs.forEach(v => { v.pitch = clamp(v.pitch + tr, 21, 108); });
        // a voiced pitch may no longer fit its player: re-fold
        vs.forEach(v => { if (v.lane >= 0) this.fitVoice(v); (v.also || []).forEach(r => this.fitReal(v, r)); });
    },

    // ------------------------------------------------------------------ orchestration (E, F)
    instOf(lane) { const T = TRK(); return lane >= 0 && T[lane] ? INST()[T[lane].instKey] : null; },
    // strike_sounds.js (2026-09-10): the voice a chord's note takes on a lane with no row voice — the strike voice he set (U2 revised), else the plain one
    strikeTechOf(lane) { return this.setTech(this.cfg.artSet, lane); },
    // U2: the strike default for a player, if its roster has it; else the plain technique — §377: from the articulation set in force
    defaultTech(lane) { return this.instOf(lane) ? this.setTech(this.cfg.artSet, lane) : null; },
    // §377: the voice set `k` gives a lane (its roster's own key, else the plain voice)
    setTech(k, lane) { const inst = this.instOf(lane), T = TRK(); const key = (ART_SETS[k] || STRIKE_DEFAULT)[(T[lane] || {}).instKey]; return (inst && (inst.techniques || []).some(t => t.key === key)) ? key : plainTech(inst); },
    // §377: one click puts every row on the set — the notes the rows hold now, and every player the shuffle or a chord deals later
    applyArtSet(k) {
        if (!ART_SETS[k]) return;
        this.snapshot(); this.cfg.artSet = k;
        this.voices.forEach(v => this.reals(v).forEach(r => { r.tech = this.setTech(k, r.lane); r.standIn = null; this.fitReal(v, r); }));
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render();
        const T = TRK(); this.setStatus('articulations: ' + k + ' — ' + T.map((t, lane) => t.short + ' ' + ((this.instOf(lane) && (this.instOf(lane).techniques || []).find(q => q.key === this.setTech(k, lane))) || {}).label).join(' · '));
    },
    // the set every row equals right now (null once a row has been changed by hand)
    artSetNow() { const k = this.cfg.artSet || 'percussive'; return this.voices.every(v => this.reals(v).every(r => r.tech === this.setTech(k, r.lane))) ? k : null; },
    techOf(v) { return this.techOfR(v); },
    techOfR(r) { const inst = this.instOf(r.lane); return inst ? ((inst.techniques || []).find(t => t.key === r.tech) || null) : null; },
    fitVoice(v) { return this.fitReal(v, v); },
    // U10 (composer, 2026-09-04: "two instruments can play the same note, but not the other way around"): a voice is
    // realized on its primary player (the voice's own lane / tech / fold / standIn / skip) and on any number of
    // doublings in v.also, each { lane, tech, fold, standIn, skip }. r is either the voice itself or one of v.also.
    fitReal(v, r) {
        // F: fold by octave into the player's (technique's) range; fixed-pitch / noise / multiphonic → stand-in
        const inst = this.instOf(r.lane); if (!inst) { r.fold = 0; r.standIn = null; return true; }
        const tech = this.techOfR(r); const kind = kindOf(tech);
        const [lo, hi] = techRange(inst, tech);
        if (kind === 'pitched') {
            r.standIn = null;
            const f = foldInto(v.pitch, lo, hi);
            if (!f) { r.fold = 0; r.skip = true; return false; }
            r.fold = f.oct; r.skip = false; return true;
        }
        r.fold = 0; r.skip = false;
        if (r.standIn == null) r.standIn = this.defaultStandIn(v.pitch, r.lane, inst, tech, kind, lo, hi);
        return true;
    },
    defaultStandIn(pitch, lane, inst, tech, kind, lo, hi) {
        const T = TRK(); const key = T[lane] && T[lane].instKey;
        if (kind === 'fixed' && OPEN_STRINGS[key]) { const os = OPEN_STRINGS[key]; return os.reduce((a, b) => Math.abs(b - pitch) < Math.abs(a - pitch) ? b : a); }
        const f = foldInto(pitch, lo, hi); return f ? f.pitch : lo;
    },
    soundingPitch(v) { return this.soundingPitchR(v, v); },
    soundingPitchR(v, r) { return r.standIn != null ? r.standIn : (v.pitch + 12 * r.fold); },
    reals(v) { const out = []; if (v.lane >= 0) out.push(v); (v.also || []).forEach(r => out.push(r)); return out; },          // every player that has this note
    onLane(lane) { const out = []; this.voices.forEach(v => this.reals(v).forEach(r => { if (r.lane === lane) out.push({ v, r }); })); return out; },
    dropReal(v, r) {                                                                                                          // this player no longer plays the note
        if (r !== v) { const k = (v.also || []).indexOf(r); if (k >= 0) v.also.splice(k, 1); return; }
        const nx = (v.also || []).shift();
        if (nx) Object.assign(v, { lane: nx.lane, tech: nx.tech, fold: nx.fold, standIn: nx.standIn, skip: !!nx.skip });
        else { v.lane = -1; v.fold = 0; v.standIn = null; v.skip = false; }
    },

    // ---- PLAN 1t step 4: FREE / BUSY AT THE PLAYHEAD -------------------------------------------------------------------
    // A player busy in the open score where the strike is going cannot take one of its notes. The read is sounding.js's — the
    // SAME function the crescendo panel's `who` ticks use (1q-PRINCIPLE), and an end exactly at the playhead counts as free.
    // The tick is what the shuffle deals onto: free here AND not unticked by hand. `laneOff` is session state, never saved into
    // a take — it belongs to where the playhead is standing, not to the strike.
    laneOff: {},
    busyLanes() {
        const C = C_(), S = root.Sounding, Sp = root.Spacing, T = TRK();
        if (!C || !S || !Sp || !C.objects) return { busy: [], until: {} };
        const ML = (typeof META_LAYER !== 'undefined') ? META_LAYER : T.length;
        const t = +C.getTimeAtPlayhead();
        const ev = Sp.eventsOf(C.objects.filter(o => {
            if (!o || o.layer == null || o.layer >= ML) return false;
            if (o.type === 'zone') return o.midiModel === 'trill' || o.midiModel === 'beating';
            return o.type === 'waveCurve' && o.sonifyNote != null;
        }));
        const r = S.atIn(ev, t, T.map((x, i) => i).filter(i => i < ML));
        return { busy: r.busy, until: r.until, t };
    },
    laneTicked(lane, B) {
        const b = B || this.busyLanes();
        if (b.busy.indexOf(lane) >= 0) return false;
        return !this.laneOff[lane];
    },
    // the playhead moved, or the score changed: the ticks are stale. Only the orchestration panel is redrawn.
    orchStale() {
        if (!this.el || this.el.style.display === 'none') return;
        if (this._orchRaf) return;
        this._orchRaf = requestAnimationFrame(() => { this._orchRaf = null; if (this.el && this.el.style.display !== 'none' && this.strike) this.renderOrch(); });
    },
    watchPlayhead() {
        const C = C_(); if (!C || this._watching) return;
        this._watching = true;
        ['applyScroll', 'markDirty'].forEach(k => {
            const prev = C[k]; if (typeof prev !== 'function') return;
            C[k] = function (...a) { const r = prev.apply(this, a); try { D.orchStale(); } catch (e) {} return r; };
        });
    },

    shuffleOrch() {
        const T = TRK(); const n = T.length; const rnd = mulberry32(this.cfg.oSeedShuffle * 104729 + 3);
        const vs = [...this.voices].sort((a, b) => a.pitch - b.pitch);
        vs.forEach(v => { v.lane = -1; v.also = []; v.fold = 0; v.standIn = null; v.skip = false; v.piano = false; });
        const free = new Set([...Array(n).keys()]);
        // §343: while the sound switch is on crescendo, the piano is not a candidate — a piano cannot swell (CN-34), so dealing
        // it a voice both wastes a player and puts a flat note in the middle of the swells. It comes straight back on `attack`.
        if (this.isSwell && this.isSwell()) { const pl = T.findIndex(t => t.instKey === 'piano'); if (pl >= 0) free.delete(pl); }
        // PLAN 1t step 4: the shuffle deals onto TICKED rows only — a row busy at the playhead, or unticked by hand, is not a
        // candidate. §AF's "an assignment that survives a shuffle", in its small form.
        { const B = this.busyLanes();
          [...free].forEach(l => { if (!this.laneTicked(l, B)) free.delete(l); }); }
        const give = (v, lane) => { v.lane = lane; v.tech = this.defaultTech(lane); this.fitVoice(v); free.delete(lane); };
        const fits = (v, lane) => { const inst = this.instOf(lane); if (!inst) return false; const tk = this.defaultTech(lane); const [lo, hi] = techRange(inst, (inst.techniques || []).find(t => t.key === tk)); return this.cfg.mayFold ? !!foldInto(v.pitch, lo, hi) : (v.pitch >= lo && v.pitch <= hi); };
        // locks first: the highest and the lowest voice
        if (this.cfg.topLock >= 0 && vs.length) { const v = vs[vs.length - 1]; if (fits(v, this.cfg.topLock) || this.cfg.mayFold) give(v, this.cfg.topLock); }
        if (this.cfg.bottomLock >= 0 && vs.length > 1) { const v = vs[0]; if (v.lane < 0 && (fits(v, this.cfg.bottomLock) || this.cfg.mayFold)) give(v, this.cfg.bottomLock); }
        // the rest: a random draw, each player once, never a misfit
        for (const v of shuffled(vs.filter(x => x.lane < 0), rnd)) {
            const cands = [...free].filter(l => fits(v, l));
            if (!cands.length) continue;
            give(v, cands[Math.floor(rnd() * cands.length)]);
        }
        // the piano plays what it was given (one note); any leftover voice is silent until flagged
        this.voices.forEach(v => { if (v.lane >= 0 && T[v.lane].instKey === 'piano') v.piano = true; });
    },
    // FIX-NOW 5 (2026-09-12, §421 — his "unticking does not take them out from hear orch"): an untick drops the player at once.
    // Its doublings go; each of its own notes moves to a free TICKED player that fits (the others keep their notes — this is not a
    // reshuffle), or falls silent with a word. Ticking it back changes nothing until he shuffles or assigns.
    dropLane(lane) {
        const here = this.onLane(lane); if (!here.length) { this.renderOrch(); return; }
        this.snapshot();
        const B = this.busyLanes(), T = TRK();
        const swell = this.isSwell && this.isSwell();
        let moved = 0, silent = 0;
        here.forEach(({ v, r }) => {
            if (r !== v) { this.dropReal(v, r); return; }
            v.lane = -1; v.piano = false; v.fold = 0; v.standIn = null; v.skip = false;
            const used = new Set(); this.voices.forEach(w => this.reals(w).forEach(x => used.add(x.lane)));
            const cand = T.map((t, l) => l).filter(l => l !== lane && !used.has(l) && this.laneTicked(l, B) && !(swell && T[l].instKey === 'piano'));
            for (const l of cand) { this.assign(v, l); if (!v.skip) break; v.lane = -1; v.skip = false; v.fold = 0; v.standIn = null; }
            if (v.lane >= 0) { moved++; if (T[v.lane].instKey === 'piano') v.piano = true; } else silent++;
        });
        this.save(); this.render();
        this.setStatus((T[lane] ? T[lane].short : 'lane ' + lane) + ' unticked — ' + moved + ' note' + (moved === 1 ? '' : 's') + ' moved to a free player'
            + (silent ? ' · ' + silent + ' silent (no free ticked player fits — tick one, or shuffle)' : ''));
    },
    assign(v, lane, tech) { v.lane = lane; v.fold = 0; v.standIn = null; if (lane >= 0) { v.tech = tech || this.defaultTech(lane); if (!this.fitVoice(v)) v.skip = true; } },   // tech: the row's current technique, if it has one (U7)
    pianoQuick(k) {
        const vs = [...this.voices].sort((a, b) => a.pitch - b.pitch);
        const T = TRK(); const pianoLane = T.findIndex(t => t.instKey === 'piano');
        const own = v => v.lane === pianoLane;
        switch (k) {
            case 'none': vs.forEach(v => { v.piano = own(v); }); break;
            case 'one': vs.forEach(v => { v.piano = own(v); }); if (!vs.some(v => v.piano) && vs.length) vs[Math.floor(vs.length / 2)].piano = true; break;
            case 'topbot': vs.forEach(v => { v.piano = own(v); }); if (vs.length) { vs[0].piano = true; vs[vs.length - 1].piano = true; } break;
            case 'rest': vs.forEach(v => { v.piano = own(v) || v.lane < 0; }); break;
            case 'all': vs.forEach(v => { v.piano = true; }); break;
        }
    },

    // ------------------------------------------------------------------ rhythm (J) and order (K)
    // the onset PATTERN after transforms: an array of slot times (ms), index = slot
    // U5 (composer, 2026-09-04: "how to reset the rhythm"): the one place the rhythm goes back to as played —
    // the button and every strike pick use it. Order and orchestration are not touched.
    // U8 (composer, 2026-09-04: "Can I have the seed? And can I have a way to go back to previous seeds? … a row or
    // a table of previous shuffles … I can just click on previous seeds"): every random button shows its seed, keeps the
    // last SEED_KEEP seeds as clickable chips (newest first, the current one lit), and takes a typed seed. A new shuffle
    // always uses max(seen) + 1, so it never repeats a seed still in the row. The histories live in cfg (saved, in takes).
    seedHist(key) { const h = this.cfg.seedHist || (this.cfg.seedHist = {}); if (!Array.isArray(h[key])) h[key] = []; return h[key]; },
    noteSeed(key) { const h = this.seedHist(key), n = this.cfg[key]; const i = h.indexOf(n); if (i >= 0) h.splice(i, 1); h.unshift(n); if (h.length > SEED_KEEP) h.length = SEED_KEEP; },
    nextSeed(key) { return Math.max(this.cfg[key] || 0, ...this.seedHist(key)) + 1; },
    useSeed(key, n) {
        n = Math.max(1, Math.round(+n || 1)); this.cfg[key] = n; this.noteSeed(key);
        if (key === 'oSeed') this.cfg.order = 'random';
        else if (key === 'rSeed') { if (this.cfg.shape === 'played') this.cfg.shape = 'random'; }
        else if (key === 'oSeedShuffle') this.shuffleOrch();
        else if (key === 'vSeed') this.applyVoicing();
    },
    seedChips(key) {
        const h = this.seedHist(key); if (!h.length) this.noteSeed(key);
        const cur = this.cfg[key];
        const b = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 3px;font-size:10px;cursor:pointer;line-height:14px';
        return '<span class="skSeeds" style="display:inline-flex;flex-wrap:wrap;gap:2px;align-items:center;font-size:10px;color:#9a9" title="the seed of this shuffle — click an earlier one to have it back, or type one">seed ' +
            '<input class="skSeedIn" data-key="' + key + '" type="number" min="1" step="1" value="' + cur + '" style="width:38px;background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px">' +
            h.map(n => '<button class="skSeed" data-key="' + key + '" data-n="' + n + '" style="' + b + (n === cur ? ';background:#e8cf9a;color:#222' : '') + '">' + n + '</button>').join('') + '</span>';
    },
    renderSeeds() {
        const put = (id, key) => { const el = this.el.querySelector(id); if (el) el.innerHTML = this.seedChips(key); };
        put('#skSeedV', 'vSeed'); put('#skSeedO', 'oSeed'); put('#skSeedR', 'rSeed'); put('#skSeedA', 'aSeed');   // the orchestration header's chips are inline in renderOrch
        this.el.querySelectorAll('.skSeed').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); this.snapshot(); this.useSeed(b.dataset.key, +b.dataset.n); this.save(); this.render(); }));
        this.el.querySelectorAll('.skSeedIn').forEach(i => i.addEventListener('change', ev => { ev.stopPropagation(); this.snapshot(); this.useSeed(i.dataset.key, +i.value); this.save(); this.render(); }));
    },
    // ---- U13 (composer, 2026-09-04 → 05): the accelerating run with a round robin of the players ----
    // Cards = the sounding notes in slot order, pitch on player (a doubled note is one card with two players; the piano
    // flag adds the piano). Gaps: from the first gap (the gap box) down to the floor at about the steepness; the count of
    // notes follows, the last gap lands exactly on the floor. Cycle 1 = the composer's order; each later cycle = a shuffle
    // of the cards that satisfies the re-attack rule against the known onset times (every order tried for ≤ 7 cards), or,
    // when none does, the rotation of players in the composer's order with the pitches shuffled and folded into range.
    accelUnits() {
        const T = TRK(); const pianoLane = T.findIndex(t => t.instKey === 'piano'); const units = [];
        this.voices.slice().sort((a, b) => a.slot - b.slot).forEach(v => {
            const players = this.reals(v).filter(r => !r.skip).map(r => ({ lane: r.lane, tech: r.tech }));
            if (v.piano && pianoLane >= 0 && !players.some(x => x.lane === pianoLane)) players.push({ lane: pianoLane, tech: plainTech(this.instOf(pianoLane)) });
            if (players.length) units.push({ v, pitch: v.pitch, players });
        });
        return units;
    },
    realize(P, pl) {   // pitch P on player pl → the midi that sounds (folded into the technique's range; noise / fixed → stand-in)
        const inst = this.instOf(pl.lane); if (!inst) return null;
        const tech = (inst.techniques || []).find(t => t.key === pl.tech) || null; const kind = kindOf(tech); const [lo, hi] = techRange(inst, tech);
        if (kind === 'pitched') { const f = foldInto(P, lo, hi); return f ? { midi: f.pitch, fold: f.oct, standIn: false } : null; }
        return { midi: this.defaultStandIn(P, pl.lane, inst, tech, kind, lo, hi), fold: 0, standIn: true };
    },
    // 1h (composer, 2026-09-06, CN-30): the run's timing comes from the calculator (accel_calc.js) — the shape and its dial,
    // the length by steep / notes / ms, jitter, hold, mirror, a level ramp; the dealing below is untouched
    accelSpec() {
        const c = this.cfg; const blank = v => v === '' || v == null;
        const lenBy = (c.aShape === 'even' && c.aLen !== 'count') ? 'duration' : c.aLen;   // §142: an even run has no steepness — the ms box or the notes
        const L = lenBy === 'count' ? { count: +c.aCount || 2 } : lenBy === 'duration' ? { duration: +c.aDur || 1 } : { ratio: +c.aRatio || 0.85 };
        return { gapStart: Math.max(1, +c.aFirst || 1), gapEnd: Math.max(1, +c.aFloor || 45), length: L, shape: c.aShape || 'geometric',
                 curve: +c.aCurve || 0, ease: +c.aEase || 2, knee: +c.aKnee || 0, gamma: +c.aGamma || 2,
                 jitter: { pct: +c.aJit || 0, pctEnd: blank(c.aJitEnd) ? null : +c.aJitEnd, seed: +c.aSeed || 1 },
                 hold: { gaps: +c.aHold || 0 }, mirror: !!c.aMirror,
                 level: (!blank(c.aVel0) && !blank(c.aVel1)) ? { start: +c.aVel0, end: +c.aVel1, curve: +c.aVelCurve || 0 } : null };
    },
    accelSeq() {
        const c = this.cfg; const units = this.accelUnits(); const n = units.length;
        const spec = this.accelSpec();
        const key = JSON.stringify([spec, c.aMin, c.aRedeal, c.aDeal, c.aPool, c.durX, this.voices.map(v => v.pitch), units.map(u => [u.v.i, u.pitch, u.players.map(x => x.lane + ':' + x.tech)])]);
        if (this._accel && this._accel.key === key) return this._accel.out;
        const AC = AC_(); const R = AC.run(spec);
        const fastest = R.gaps.length ? Math.min.apply(null, R.gaps) : Math.min(spec.gapStart, spec.gapEnd), minMs = Math.max(0, +c.aMin || 0);   // the tail check on the run as dealt (an even run, the jitter)
        const on = R.onsets, N = on.length, k = R.gapCount;
        const out = { units: n, notes: N, gaps: k, total: R.duration, ratio: R.ratio, calc: R, spec, events: [], cycles: [], info: '' };
        if (!n) { out.info = 'no sounding notes — assign players first'; this._accel = { key, out }; return out; }
        const rnd = mulberry32((+c.aSeed || 1) * 7727 + 29);
        const last = new Map();
        const fits = (u, t, L) => u.players.every(x => !L.has(x.lane) || t - L.get(x.lane) >= minMs);
        const mark = (u, t, L) => u.players.forEach(x => L.set(x.lane, t));
        const checkPerm = (perm, times) => { const L = new Map(last); for (let j = 0; j < times.length; j++) { if (!fits(perm[j], times[j], L)) return false; mark(perm[j], times[j], L); } return true; };
        // 1h item 5 (composer, 2026-09-06, §135–138: "c, build both pls"): the pitch pool — the cards' pitches, or every distinct pitch
        // the strike holds, players or not (each with its recorded voice for the velocity and the length); drawn to completion, then
        // reshuffled. The round robin with the cards keeps its original draw (one permutation per lap) so earlier takes deal as before.
        const poolAll = c.aPool === 'strike'; const seenP = new Set(); const pool = [];
        (poolAll ? this.voices.slice().sort((a, b) => a.slot - b.slot) : units.map(u => u.v)).forEach(v => { if (!seenP.has(v.pitch)) { seenP.add(v.pitch); pool.push({ pitch: v.pitch, v }); } });
        let deck = []; const draw = () => { if (!deck.length) deck = shuffled(pool, rnd); return deck.pop(); };
        const lanesSeen = new Set(); const players = []; units.forEach(u => u.players.forEach(x => { if (!lanesSeen.has(x.lane)) { lanesSeen.add(x.lane); players.push(x); } }));
        out.pool = pool.length; out.players = players.length;
        let pos = 0, cyc = 0;
        if (c.aDeal === 'free') {
            // the free dealer — no lap: each onset to any player the re-attack rule allows, at random (seeded), never the one who just
            // played while another is free, a lean toward whoever has waited longest; the pitch drawn from the pool per note and folded
            // into that player's range. Nobody free = the rule cannot hold at this speed: the least-recent player takes it, flagged.
            let prevLane = -1, folded = 0, viol = 0;
            on.forEach((t, i) => {
                const wait = x => last.has(x.lane) ? t - last.get(x.lane) : Infinity;
                let free = players.filter(x => wait(x) >= minMs);
                if (free.length > 1) free = free.filter(x => x.lane !== prevLane);
                let pick;
                if (free.length) {
                    const finite = free.map(x => wait(x)).filter(w => w !== Infinity); const top = (finite.length ? Math.max(...finite) : 0) + 1;
                    const ws = free.map(x => (wait(x) === Infinity ? top * 2 : wait(x)) + 1); const tot = ws.reduce((a, b) => a + b, 0);
                    let r = rnd() * tot; pick = free[free.length - 1]; for (let j = 0; j < free.length; j++) { r -= ws[j]; if (r <= 0) { pick = free[j]; break; } }
                } else { viol++; pick = players.reduce((b, x) => wait(x) > wait(b) ? x : b, players[0]); }
                const d = draw(); const P = d.pitch; const rz = this.realize(P, pick);
                if (rz && !rz.standIn && rz.midi !== P) folded++;
                out.events.push({ pos: i, onMs: t, cycle: 0, mode: 'free', unit: { v: d.v, pitch: P, players: [pick] }, pitch: P, notes: rz ? [{ lane: pick.lane, tech: pick.tech, midi: rz.midi, standIn: rz.standIn }] : [], level: R.levels ? R.levels[i] : null });
                last.set(pick.lane, t); prevLane = pick.lane;
            });
            out.cycles.push({ cycle: 0, len: N, mode: 'free', folded, viol, redealt: true });
            pos = N;
        }
        while (pos < N) {
            const len = Math.min(n, N - pos), times = on.slice(pos, pos + len);
            let order = null, mode = 'own';
            if (cyc === 0) order = units.slice(0, len);
            else {
                if (n <= 7) { const valid = permutations(units).filter(perm => checkPerm(perm.slice(0, len), times)); if (valid.length) { order = valid[Math.floor(rnd() * valid.length)].slice(0, len); mode = 'shuffled'; } }
                else { for (let a = 0; a < 3000 && !order; a++) { const perm = shuffled(units, rnd); if (checkPerm(perm.slice(0, len), times)) { order = perm.slice(0, len); mode = 'shuffled'; } } }
                if (!order) { order = units.slice(0, len); mode = 'rotation'; }
            }
            const pitches = (cyc > 0 && (mode === 'rotation' || c.aRedeal)) ? (poolAll ? Array.from({ length: len }, () => draw().pitch) : shuffled(units.map(u => u.pitch), rnd)) : null;   // U13b: the pitch set dealt afresh from cycle 2 (always in the rotation, else it would loop); 1h item 5: from the whole strike when chosen
            let folded = 0, viol = 0;
            order.forEach((u, j) => {
                const t = times[j], P = pitches ? pitches[j] : u.pitch;
                if (!fits(u, t, last)) viol++;
                const notes = u.players.map(x => { const rz = this.realize(P, x); if (!rz) return null; if (pitches && !rz.standIn && rz.midi !== P) folded++; return { lane: x.lane, tech: x.tech, midi: rz.midi, standIn: rz.standIn }; }).filter(Boolean);
                out.events.push({ pos: pos + j, onMs: t, cycle: cyc, mode, unit: u, pitch: P, notes, level: R.levels ? R.levels[pos + j] : null });
                mark(u, t, last);
            });
            out.cycles.push({ cycle: cyc, len, mode, folded, viol, redealt: !!pitches });
            pos += len; cyc++;
        }
        const nTail = c.aDeal === 'free' ? players.length : n; const tail = nTail * fastest, feas = tail >= minMs;   // the re-attack rule at the run's fastest gap
        const flags = x => (x.folded ? ', ' + x.folded + ' folded' : '') + (x.viol ? ' ⚠ ' + x.viol + ' re-attack' + (x.viol > 1 ? 's' : '') + ' < ' + minMs : '');
        const poolText = 'pitches from ' + (poolAll ? 'the whole strike' : 'the cards') + ' (' + pool.length + ')';
        const dealText = c.aDeal === 'free'
            ? 'free dealing over ' + players.length + ' players · ' + poolText + flags(out.cycles[0])
            : 'cycles ' + out.cycles.map(x => (x.cycle + 1) + ': ' + (x.mode === 'own' ? 'your order' : x.mode === 'shuffled' ? 'shuffled ok' + (x.redealt ? ', pitches re-dealt' : '') : 'rotation, pitches re-dealt') + flags(x)).join(' · ') + (poolAll ? ' · ' + poolText : '');
        out.info = AC.describe(R, spec) + (R.fit && R.fit.residual && Math.abs(R.fit.residual) > 0.5 ? ' · fit off by ' + R.fit.residual.toFixed(1) + ' ms' : '') + '<br>' + dealText + '<br>tail ' + nTail + ' × ' + Math.round(fastest) + ' = ' + Math.round(tail) + (feas ? ' ≥ ' + minMs + ' ✓' : ' < ' + minMs + ' ✗ — raise the fastest gap to ' + Math.ceil(minMs / nTail) + ' or add a player');
        this._accel = { key, out }; return out;
    },
    resetRhythm() { this.cfg.shape = 'played'; this.cfg.timeX = 1; this.cfg.amount = 1; this.cfg.jitterMs = 0; this.cfg.reverse = false; this.cfg.rotate = 0; },
    // U12 (composer, 2026-09-04, decision A: "the gap between the notes heard"): keep = the slots that sound, in order;
    // the pattern is then built over those onsets only — the silent ones leave the rhythm instead of standing as rests.
    // S is the recorded span either way, so the strike keeps its length until the ms / gap box says otherwise.
    pattern(keep) {
        const all = this.slotsPlayed.slice().sort((a, b) => a - b);
        const S = all.length ? ((all[all.length - 1] - all[0]) || (this.spanFallback ? this.spanFallback() : 0)) : 0;   // harm_source_ui.js: a harmony has no played span — a nominal one lets the shapes spread it
        const base = keep ? keep.map(k => all[k]).filter(x => x != null) : all;
        const n = base.length; if (!n) return [];
        const rnd = mulberry32(this.cfg.rSeed * 48611 + 5);
        let shaped;
        const u = i => n > 1 ? i / (n - 1) : 0;
        switch (this.cfg.shape) {
            // UNISON (PLAN 1t step 3, CN-72): every onset at the first. ONE path — the shape's own case here, so `timed()`, `pat()`,
            // `bands()`, Hear, the strip and Insert all read it from the same place; there is deliberately no second way through a
            // `= ms` of 0 (that box already refuses a span of 0 and says so).
            case 'unison': shaped = base.map(() => 0); break;
            case 'even': shaped = base.map((_, i) => S * u(i)); break;
            case 'front': shaped = base.map((_, i) => S * Math.pow(u(i), 2)); break;
            case 'back': shaped = base.map((_, i) => S * Math.sqrt(u(i))); break;
            case 'centre': shaped = base.map((_, i) => S * (Math.asin(2 * u(i) - 1) / Math.PI + 0.5)); break;
            case 'edges': shaped = base.map((_, i) => { const x = u(i); return S * (x * x * (3 - 2 * x)); }); break;
            case 'random': shaped = [0].concat([...Array(n - 1)].map(() => rnd() * S)).sort((a, b) => a - b); break;
            default: shaped = base.map(t => t - base[0]);
        }
        const played = base.map(t => t - base[0]);
        const a = clamp(this.cfg.amount, 0, 1);
        let out = shaped.map((t, i) => (1 - a) * played[i] + a * t);
        if (this.cfg.reverse) { const L = out.length ? out[out.length - 1] : 0; out = out.map(t => L - t).sort((x, y) => x - y); }   // mirrored within its own span, so the first onset stays at 0
        if (this.cfg.rotate) { const gaps = out.slice(1).map((t, i) => t - out[i]); if (gaps.length) { const g = gaps.slice(this.cfg.rotate % gaps.length).concat(gaps.slice(0, this.cfg.rotate % gaps.length)); out = [0]; g.forEach(x => out.push(out[out.length - 1] + x)); } }
        if (this.cfg.jitterMs) { const jr = mulberry32(this.cfg.rSeed * 31 + 9); out = out.map(t => Math.max(0, t + (jr() * 2 - 1) * this.cfg.jitterMs)); }
        return out.map(t => t * this.cfg.timeX);
    },
    // the ORDER: which voice takes which slot (K)
    applyOrder() {
        if (this.cfg.order === 'manual') return;   // K fix (2026-09-04): a by-hand dot swap sets the slots itself; every render used to re-derive them from "as played" and undo it
        const vs = this.voices; const n = vs.length;
        const byPitch = [...vs].sort((a, b) => a.pitch - b.pitch);
        const played = [...vs].sort((a, b) => a.dt0 - b.dt0);
        const rnd = mulberry32(this.cfg.oSeed * 7877 + 11);
        let seq;
        switch (this.cfg.order) {
            case 'lowhigh': seq = byPitch; break;
            case 'highlow': seq = byPitch.slice().reverse(); break;
            case 'outin': { seq = []; let lo = 0, hi = n - 1, t = true; while (lo <= hi) { seq.push(t ? byPitch[lo++] : byPitch[hi--]); t = !t; } break; }
            case 'inout': { const m = Math.floor(n / 2); seq = []; let l = m, r = m + 1, t = true; while (l >= 0 || r < n) { if (t && l >= 0) seq.push(byPitch[l--]); else if (r < n) seq.push(byPitch[r++]); else if (l >= 0) seq.push(byPitch[l--]); t = !t; } break; }
            case 'random': seq = shuffled(vs, rnd); break;
            default: seq = played;
        }
        seq.forEach((v, i) => { v.slot = i; });
    },
    sounds(v) { return !!v.piano || this.reals(v).some(r => !r.skip); },                    // somebody plays it
    keptSlots() { return this.voices.filter(v => this.sounds(v)).sort((a, b) => a.slot - b.slot).map(v => v.slot); },
    pat(all) { return (all || !this.cfg.dropRests) ? this.pattern() : this.pattern(this.keptSlots()); },   // the rhythm as it will sound
    timed(all) {
        const dur = v => Math.max(30, v.durMs * this.cfg.durX);
        const full = this.pattern();
        if (all || !this.cfg.dropRests) return this.voices.map(v => ({ v, onMs: full[v.slot] != null ? full[v.slot] : 0, durMs: dur(v) }));
        const sounding = this.voices.filter(v => this.sounds(v)).sort((a, b) => a.slot - b.slot);
        const pat = this.pattern(sounding.map(v => v.slot)); const rank = new Map(sounding.map((v, k) => [v, k]));
        return this.voices.map(v => ({ v, onMs: rank.has(v) ? pat[rank.get(v)] : (full[v.slot] != null ? full[v.slot] : 0), durMs: dur(v) }));
    },
    bands() {
        // live regrouping at simMs over the current pattern (J)
        const pat = (this.cfg.shape === 'accel' ? this.accelSeq().events.map(e => e.onMs) : this.pattern()).slice().sort((a, b) => a - b);
        const groups = []; let last = -Infinity;
        pat.forEach(t => { if (t - last >= this.cfg.simMs || !groups.length) { groups.push({ t0: t, t1: t + this.cfg.simMs }); last = t; } });
        return groups;
    },

    // ------------------------------------------------------------------ render
    keyY(midi) { const R = this.range(); return (R.hi - midi) * this.rh(); },
    render() {
        if (!this.strike) return;
        if (this.isChords && this.isChords()) return this.renderChords();   // PLAN 1k: chords mode (strike_chords_ui.js) — notes mode below is untouched
        this.applyOrder();
        this.renderKeyboard(); this.renderOrch(); this.renderPicker(); this.renderRhythm(); this.renderSeeds();
        { const tn = this.el.querySelector('#skTrN'), tr = Math.round(+this.cfg.transpose || 0); if (tn) tn.textContent = tr ? (tr > 0 ? '+' : '') + tr : ''; }   // §377
        requestAnimationFrame(() => this.renderLines());
    },
    pcColor(pc) { const pcs = [...new Set(this.voices.map(v => v.pc))].sort((a, b) => a - b); return PC_PALETTE[pcs.indexOf(pc) % PC_PALETTE.length]; },
    renderKeyboard() {
        const R = this.range(), h = this.rh(), svg = this.el.querySelector('#skKb');
        const rows = R.hi - R.lo + 1, H = rows * h + 4;
        svg.setAttribute('height', H); svg.style.height = H + 'px';
        let s = '';
        for (let m = R.hi; m >= R.lo; m--) {
            const y = this.keyY(m), black = BLACK.includes(m % 12);
            s += '<rect class="skKey" data-m="' + m + '" x="44" y="' + (y + 0.5) + '" width="' + (black ? 60 : 100) + '" height="' + (h - 1) + '" fill="' + (black ? '#2a2a30' : '#d8d3c8') + '" stroke="#111" stroke-width="0.5" style="cursor:pointer"/>';
            if (m % 12 === 0) s += '<text x="2" y="' + (y + h * 0.8) + '" font-size="' + Math.max(8, h) + '" fill="#777">C' + (m / 12 - 1) + '</text>';
        }
        // voices
        const r = Math.max(2.5, h * 0.42); const anySolo = this.voices.some(v => v.solo);
        const byPitch = {};
        this.voices.forEach(v => { (byPitch[v.pitch] = byPitch[v.pitch] || []).push(v); });
        Object.keys(byPitch).forEach(p => {
            const list = byPitch[p], m = +p; if (m < R.lo || m > R.hi) return;
            list.forEach((v, k) => {
                const cy = this.keyY(m) + h / 2, cx = 122 + k * 10, col = this.pcColor(v.pc);
                if (v.piano) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.5) + '" fill="none" stroke="#e8cf9a" stroke-width="1.2"/>';
                s += '<circle class="skDot" data-i="' + v.i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (v.standIn != null ? 'none' : col) + '" stroke="' + (v.solo ? '#fff' : col) + '" stroke-width="' + (v.solo ? 2.5 : 1.5) + '" opacity="' + (anySolo && !v.solo ? 0.35 : 1) + '" style="cursor:pointer"><title>' + (v.solo ? 'SOLO · ' : '') + nm(v.pitch) + (v.pitch !== v.pitch0 ? ' (played ' + nm(v.pitch0) + ')' : '') + (v.standIn != null ? ' · stands in: ' + nm(v.standIn) : '') + '</title></circle>';
                if (k === 0) s += '<text x="40" y="' + (cy + 3) + '" font-size="' + Math.max(8, Math.min(11, h + 2)) + '" fill="' + col + '" text-anchor="end">' + nm(m) + '</text>';
            });
        });
        // out-of-view voices (the 88 case): arrows at the edges
        const above = this.voices.filter(v => v.pitch > R.hi).length, below = this.voices.filter(v => v.pitch < R.lo).length;
        if (above) s += '<text x="120" y="10" fill="#e88" font-size="10">▲' + above + '</text>';
        if (below) s += '<text x="120" y="' + (H - 2) + '" fill="#e88" font-size="10">▼' + below + '</text>';
        svg.innerHTML = s;
        // click a key → toggle the piano flag of the voice(s) on it; click a dot too
        svg.querySelectorAll('.skKey').forEach(k => k.addEventListener('click', () => { const m = +k.dataset.m; const vs = this.voices.filter(v => v.pitch === m); if (!vs.length) return; this.snapshot(); vs.forEach(v => { v.piano = !v.piano; }); this.render(); }));
        svg.querySelectorAll('.skDot').forEach(dd => dd.addEventListener('click', ev => { ev.stopPropagation(); const v = this.voices[+dd.dataset.i]; this.snapshot(); if (ev.shiftKey) v.solo = !v.solo; else v.piano = !v.piano; this.render(); }));
    },
    renderOrch() {
        const T = TRK(), box = this.el.querySelector('#skOrch');
        this.watchPlayhead();                      // PLAN 1t step 4: the ticks follow the playhead and the score
        const B = this.busyLanes();                // ONE read for the whole panel
        const nFree = T.map((t, i) => i).filter(i => this.laneTicked(i, B)).length;
        const inp = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:11px;max-width:150px';
        const btn = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
        const opts = sel => '<option value="-1">—</option>' + T.map((t, i) => '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + t.label + '</option>').join('');
        let s = '<div style="display:flex;gap:6px;align-items:center;padding:4px 6px;border-bottom:1px solid #333;flex-wrap:wrap">' +
            '<button id="skShuffle" style="' + btn + ';color:#e8cf9a">shuffle</button>' + this.seedChips('oSeedShuffle') +
            '<label title="off: played registers only; on: the shuffle may fold a pitch class by octave into any player"><input id="skFold" type="checkbox"' + (this.cfg.mayFold ? ' checked' : '') + '> may fold</label>' +
            '<label>top → <select id="skTop" style="' + inp + '">' + opts(this.cfg.topLock) + '</select></label>' +
            '<label>bottom → <select id="skBot" style="' + inp + '">' + opts(this.cfg.bottomLock) + '</select></label>' +
            '<button id="skAsPlayed" style="' + btn + '" title="back to the piano, as played">as played</button>' +
            // PLAN 1t step 4: the count, so the tick row can be read at a glance
            '<span id="skFreeCount" style="color:#9a9;margin-left:auto" title="free / busy AT THE PLAYHEAD in the open score (an end exactly there counts as free); the shuffle deals onto the ticked rows only">'
            + nFree + ' free · ' + B.busy.length + ' busy</span></div>';
        // §377: the articulation sets — one click fills every row (and every player dealt later: the shuffle, a chord at an onset)
        { const now = this.artSetNow(), lit = ';background:#4a3a12;color:#e8cf9a;border-color:#C9A05A';
          s += '<div style="display:flex;gap:4px;align-items:center;padding:3px 6px;border-bottom:1px solid #333"><span style="color:#9a9" title="the articulation on every row at once; the lit one is what the rows hold now (none lit once a row is changed by hand)">set</span>' +
              Object.keys(ART_SETS).map(k => '<button class="skArt" data-set="' + k + '" style="' + btn + (k === now ? lit : '') + '" title="' + k + ': ' + T.map((t, lane) => t.short + ' ' + this.setTech(k, lane)).join(' · ') + '">' + k + '</button>').join('') + '</div>'; }
        s += '<div id="skRows" style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-around">';
        T.forEach((t, lane) => {
            const inst = INST()[t.instKey]; const here = this.onLane(lane); const mine = here.map(h => h.v);
            const techs = (inst && inst.techniques) || [];
            const groups = {}; techs.forEach(tq => { const k = kindOf(tq); (groups[k] = groups[k] || []).push(tq); });
            const cur = here.length ? (here[0].r.tech || this.defaultTech(lane)) : this.defaultTech(lane);
            const menu = '<select class="skTech" data-lane="' + lane + '" style="' + inp + '">' + ['pitched', 'fixed', 'noise', 'multiphonic'].filter(k => groups[k]).map(k => '<optgroup label="' + k + '">' + groups[k].map(tq => '<option value="' + tq.key + '"' + (tq.key === cur ? ' selected' : '') + '>' + tq.label + '</option>').join('') + '</optgroup>').join('') + '</select>';
            const notes = here.map(({ v, r }) => '<span class="skChip" data-i="' + v.i + '" data-r="' + (r === v ? 'p' : v.also.indexOf(r)) + '" title="click: take ' + nm(v.pitch) + ' off this player" style="cursor:pointer;color:' + this.pcColor(v.pc) + '">' + nm(this.soundingPitchR(v, r)) + (r.fold ? (r.fold > 0 ? '↑' : '↓') : '') + (r.standIn != null ? '*' : '') + (r.skip ? ' ✕' : '') + '</span>').join(' ');
            const soloed = mine.length > 0 && mine.every(v => v.solo);
            // PLAN 1t step 4: the tick at the row's left edge, before the landing dot. A row BUSY at the playhead is dimmed, its
            // tick cleared and disabled, and says until when; a free row is ticked unless he unticked it.
            const busy = B.busy.indexOf(lane) >= 0, ticked = this.laneTicked(lane, B);
            s += '<div class="skRow" data-lane="' + lane + '" style="display:flex;gap:6px;align-items:center;padding:1px 6px;'
                + (busy ? 'opacity:.45;' : '') + (this.pickerLane === lane ? 'background:rgba(201,160,90,.15)' : '') + '">' +
                '<input class="skTick" type="checkbox" data-lane="' + lane + '"' + (ticked ? ' checked' : '') + (busy ? ' disabled' : '') +
                    ' style="flex:none;margin:0" title="' + (busy ? 'busy at the playhead until ' + (B.until[lane] != null ? B.until[lane].toFixed(2) : '?') + ' s'
                    : 'ticked: the shuffle may deal onto this player') + '">' +
                '<span class="skLand" style="flex:none;width:8px;height:8px;border-radius:50%;background:' + (mine.length ? '#e8cf9a' : '#444') + '" title="the lines land here"></span>' +
                '<span class="skRowName" style="width:64px;cursor:pointer;color:#e8cf9a" title="click: the full articulation list">' + t.label + '</span>' +
                '<button class="skSolo" data-lane="' + lane + '" style="' + btn + ';padding:0 4px;' + (soloed ? 'background:#e8cf9a;color:#222' : '') + '" title="solo this player\'s voices">S</button>' +
                '<span style="width:88px;overflow:hidden;white-space:nowrap">' + (notes || '<span style="color:#555">·</span>')
                + (busy ? ' <span style="color:#777">busy &rarr; ' + (B.until[lane] != null ? B.until[lane].toFixed(2) : '?') + ' s</span>' : '')
                + '</span>' + menu + '</div>';
        });
        s += '</div>';
        box.innerHTML = s;
        box.querySelector('#skShuffle').addEventListener('click', () => { this.snapshot(); this.useSeed('oSeedShuffle', this.nextSeed('oSeedShuffle')); this.save(); this.render(); });
        box.querySelector('#skFold').addEventListener('change', e => { this.cfg.mayFold = e.target.checked; this.save(); });
        box.querySelector('#skTop').addEventListener('change', e => { this.cfg.topLock = +e.target.value; this.save(); });
        box.querySelector('#skBot').addEventListener('change', e => { this.cfg.bottomLock = +e.target.value; this.save(); });
        box.querySelector('#skAsPlayed').addEventListener('click', () => { this.snapshot(); this.asPlayedOrchestration(); this.render(); });
        box.querySelectorAll('.skArt').forEach(b => b.addEventListener('click', () => this.applyArtSet(b.dataset.set)));
        // PLAN 1t step 4: unticking is by hand and sticks until he ticks it back; a busy row's tick is not his to set
        box.querySelectorAll('.skTick').forEach(cb => cb.addEventListener('click', ev => {
            ev.stopPropagation();
            const lane = +cb.dataset.lane;
            if (cb.checked) { delete this.laneOff[lane]; this.renderOrch(); }
            else { this.laneOff[lane] = true; this.dropLane(lane); }   // FIX-NOW 5 (§421): an untick drops the player NOW
        }));
        box.querySelectorAll('.skTech').forEach(sel => sel.addEventListener('change', e => { const lane = +sel.dataset.lane; this.snapshot(); this.onLane(lane).forEach(({ v, r }) => { r.tech = e.target.value; r.standIn = null; this.fitReal(v, r); }); this.render(); }));
        box.querySelectorAll('.skRowName').forEach(el => el.addEventListener('click', () => { const lane = +el.parentNode.dataset.lane; this.pickerLane = this.pickerLane === lane ? null : lane; this.render(); }));
        box.querySelectorAll('.skSolo').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const lane = +el.dataset.lane; const mine = this.onLane(lane).map(h => h.v); if (!mine.length) return; this.snapshot(); const on = !mine.every(v => v.solo); mine.forEach(v => { v.solo = on; }); this.render(); }));
        box.querySelectorAll('.skRow').forEach(row => { row.addEventListener('mouseenter', () => { this.hoverLane = +row.dataset.lane; this.renderLines(); }); row.addEventListener('mouseleave', () => { this.hoverLane = null; this.renderLines(); }); });
        // drop a voice on a player: click a dot on the keyboard, then a row (two-click assign).
        // U7 (composer, 2026-09-04: "it added two lines to the instrument. The previous one didn't go away"): a plain
        // click REPLACES — the note(s) the player had go to the armed note's old player (or to nobody), so the chord
        // stays whole and nothing is lost; each note takes the technique its new row already plays. Shift-click ADDS.
        // U10 (composer, 2026-09-04: "one instrument can't play two notes … two instruments can play the same note"):
        // a plain click gives the row the armed note and takes the row's own note(s) off it — to NOBODY, not to another
        // player; the armed note stays wherever else it already is (a doubling). Shift-click keeps what the row had.
        // Without an armed note, a click on a note in a row takes that note off that player.
        box.querySelectorAll('.skRow').forEach(row => row.addEventListener('click', ev => {
            if (ev.target.tagName === 'SELECT' || ev.target.tagName === 'BUTTON' || ev.target.classList.contains('skRowName')) return;
            const lane = +row.dataset.lane, T = TRK(); const name = l => l >= 0 && T[l] ? T[l].label : 'nobody';
            if (this.pendingVoice == null) {
                const chip = ev.target.closest && ev.target.closest('.skChip'); if (!chip) return;
                const v = this.voices[+chip.dataset.i]; if (!v) return;
                const r = chip.dataset.r === 'p' ? v : v.also[+chip.dataset.r]; if (!r) return;
                this.snapshot(); this.dropReal(v, r);
                const still = this.reals(v).map(x => name(x.lane));
                this.setStatus(nm(v.pitch) + ' taken off ' + name(lane) + (still.length ? ' · still on ' + still.join(', ') : ' · nobody plays it now'));
                this.render(); return;
            }
            const v = this.voices[this.pendingVoice]; this.pendingVoice = null;
            if (this.reals(v).some(r => r.lane === lane)) { this.setStatus(nm(v.pitch) + ' is already on ' + name(lane)); this.render(); return; }
            const first = this.onLane(lane)[0]; const rowTech = first ? first.r.tech : null;
            const there = ev.shiftKey ? [] : this.onLane(lane).filter(h => h.v !== v);
            this.snapshot();
            there.forEach(({ v: o, r }) => this.dropReal(o, r));
            if (v.lane < 0) this.assign(v, lane, rowTech);
            else { const r = { lane, tech: rowTech || this.defaultTech(lane), fold: 0, standIn: null, skip: false }; (v.also = v.also || []).push(r); if (!this.fitReal(v, r)) r.skip = true; }
            const elsewhere = this.reals(v).filter(r => r.lane !== lane).map(r => name(r.lane));
            const gone = [...new Set(there.map(h => nm(h.v.pitch)))];
            this.setStatus(nm(v.pitch) + ' → ' + name(lane) + (elsewhere.length ? ' (also on ' + elsewhere.join(', ') + ')' : '') + (gone.length ? ' · ' + gone.join(' ') + ' → nobody' : '') + ' · shift-click keeps what the row had · click a note in a row to take it off');
            this.render();
        }));
    },
    renderPicker() {
        const box = this.el.querySelector('#skPick');
        if (this.pickerLane == null) { box.style.display = 'none'; return; }
        const lane = this.pickerLane, T = TRK(), inst = INST()[T[lane].instKey];
        const here = this.onLane(lane); const mine = here.map(h => h.v);
        const techs = (inst && inst.techniques) || [];
        const groups = {}; techs.forEach(tq => { const k = kindOf(tq); (groups[k] = groups[k] || []).push(tq); });
        const cur = here.length ? here[0].r.tech : null;
        let s = '<div style="color:#e8cf9a;margin-bottom:4px">' + T[lane].label + ' · articulations</div>';
        ['pitched', 'fixed', 'noise', 'multiphonic'].forEach(k => {
            if (!groups[k]) return;
            s += '<div style="color:#9a9;margin:4px 0 2px">' + k + '</div>' + groups[k].map(tq => '<div class="skPickT" data-key="' + tq.key + '" style="cursor:pointer;padding:0 4px;' + (tq.key === cur ? 'background:rgba(201,160,90,.25)' : '') + '">' + tq.label + '</div>').join('');
        });
        // variants (T): open strings / the technique's keys
        if (mine.length && cur) {
            const tech = techs.find(t => t.key === cur), kind = kindOf(tech);
            if (kind !== 'pitched') {
                const [lo, hi] = techRange(inst, tech);
                const keys = kind === 'fixed' && OPEN_STRINGS[T[lane].instKey] ? OPEN_STRINGS[T[lane].instKey] : [...Array(Math.max(0, Math.min(40, hi - lo + 1))).keys()].map(i => lo + i);
                s += '<div style="color:#9a9;margin:6px 0 2px">variants · click = select, ▶ = hear</div>' + keys.map(k => '<div style="display:flex;gap:4px"><span class="skVar" data-k="' + k + '" style="cursor:pointer;flex:1;' + (here[0].r.standIn === k ? 'color:#e8cf9a' : '') + '">' + nm(k) + ' <span style="color:#666">' + k + '</span></span><span class="skVarHear" data-k="' + k + '" style="cursor:pointer;color:#9fd3db">&#9654;</span></div>').join('');
            }
        }
        box.innerHTML = s; box.style.display = '';
        box.querySelectorAll('.skPickT').forEach(el => el.addEventListener('click', () => { this.snapshot(); here.forEach(({ v, r }) => { r.tech = el.dataset.key; r.standIn = null; this.fitReal(v, r); }); this.render(); }));
        box.querySelectorAll('.skVar').forEach(el => el.addEventListener('click', () => { this.snapshot(); here.forEach(({ r }) => { r.standIn = +el.dataset.k; }); this.render(); }));
        box.querySelectorAll('.skVarHear').forEach(el => el.addEventListener('click', () => this.hearOne(lane, cur, +el.dataset.k)));
    },
    renderRhythm() {
        const wrap = this.el.querySelector('#skRhyWrap'), svg = this.el.querySelector('#skRhy');
        wrap.style.flex = '0 0 ' + clamp(this.cfg.rhythmW || 480, 320, 1400) + 'px';
        const R = this.range(), h = this.rh(), rows = R.hi - R.lo + 1, H = rows * h + 4;
        const W = Math.max(300, wrap.clientWidth - 4);
        svg.setAttribute('height', H); svg.style.height = H + 'px'; svg.setAttribute('width', W);
        const A = this.cfg.shape === 'accel' ? this.accelSeq() : null;
        const timed = this.timed(); const pat = A ? A.events.map(e => e.onMs) : this.pattern();
        const spanMs = Math.max(1, Math.max(...pat, 0)); const pad = 14;
        // §347: the controls sit ABSOLUTE over the strip's left margin, and the margin used to be a hard-coded 130 px — but the
        // run block's own rows ("→ last 180 ms", "jitter % 0 →", "hold 0 gaps", "vel curve") are far wider than the 132 px the
        // panel asks for, so with the run open the panel spilled to ~225 px and SAT ON the first onsets: unclickable, and the
        // earliest dot hidden altogether. Measure the panel instead of guessing at it.
        const ctlW = Math.max(130, Math.round(this._rhyCtlW || 130)) + 10;
        const pxPerMs = Math.max(0.001, (W - 2 * pad - ctlW) / Math.max(spanMs, 50));
        const X = ms => pad + ctlW + ms * pxPerMs;
        let s = '';
        // the live bands
        this.bands().forEach(b => { s += '<rect x="' + X(b.t0) + '" y="0" width="' + Math.max(2, (b.t1 - b.t0) * pxPerMs) + '" height="' + H + '" fill="#C9A05A" opacity="0.13"/>'; });
        // row lines + the controls column at the left of the strip
        for (let m = R.hi; m >= R.lo; m -= 12) s += '<line x1="' + (pad + 130) + '" y1="' + (this.keyY(m) + h) + '" x2="' + W + '" y2="' + (this.keyY(m) + h) + '" stroke="#2c2c33"/>';
        // time ruler
        const step = spanMs > 2000 ? 500 : spanMs > 600 ? 100 : 50;
        for (let t = 0; t <= spanMs + 1; t += step) s += '<line x1="' + X(t) + '" y1="0" x2="' + X(t) + '" y2="' + H + '" stroke="#333"/><text x="' + (X(t) + 2) + '" y="10" font-size="9" fill="#666">' + Math.round(t) + '</text>';
        // dots
        const r = Math.max(2.5, h * 0.42); const anySolo = this.voices.some(v => v.solo);
        if (A) A.events.forEach(ev => {   // U13: the run — a dot per card played, the dealt pitch's height; a fallback cycle is dashed
            const v = ev.unit.v; if (ev.pitch < R.lo || ev.pitch > R.hi) return; const cy = this.keyY(ev.pitch) + h / 2, col = this.pcColor(((ev.pitch % 12) + 12) % 12);
            const who = ev.notes.map(nt => (TRK()[nt.lane] || {}).label + ' ' + nm(nt.midi) + (nt.standIn ? '*' : '')).join(' + ');
            s += '<circle class="skADot" cx="' + X(ev.onMs) + '" cy="' + cy + '" r="' + r + '" fill="' + col + '" stroke="' + col + '" stroke-width="1.5"' + (ev.mode === 'rotation' ? ' stroke-dasharray="2 2" fill-opacity="0.45"' : '') + ' opacity="' + (anySolo && !v.solo ? 0.35 : 1) + '"><title>' + (ev.pos + 1) + ' · ' + nm(ev.pitch) + ' @ ' + Math.round(ev.onMs) + ' ms · ' + who + ' · cycle ' + (ev.cycle + 1) + ' (' + ev.mode + ')</title></circle>'; });
        else timed.forEach(q => { const v = q.v, cy = this.keyY(v.pitch) + h / 2, col = this.pcColor(v.pc); if (v.pitch < R.lo || v.pitch > R.hi) return;
            s += '<circle class="skRDot" data-i="' + v.i + '" cx="' + X(q.onMs) + '" cy="' + cy + '" r="' + r + '" fill="' + (this.reals(v).length || v.piano ? col : 'none') + '" stroke="' + (v.solo ? '#fff' : col) + '" stroke-width="' + (v.solo ? 2.5 : 1.5) + '" opacity="' + (anySolo && !v.solo ? 0.35 : 1) + '" style="cursor:pointer"' + (this.swapFirst === v.i ? ' stroke-dasharray="2 2"' : '') + '><title>' + nm(v.pitch) + ' @ ' + Math.round(q.onMs) + ' ms · slot ' + v.slot + (this.cfg.dropRests && !this.sounds(v) ? ' · nobody plays it — out of the rhythm' : '') + '</title></circle>'; });
        svg.innerHTML = s;
        // controls (HTML, over the strip's left margin)
        let ctl = wrap.querySelector('#skRhyCtl');
        if (!ctl) {
            ctl = document.createElement('div'); ctl.id = 'skRhyCtl';
            ctl.style.cssText = 'position:absolute;left:4px;top:2px;width:132px;display:flex;flex-direction:column;gap:3px;font-size:10px';
            const inp = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px;width:52px';
            const btn = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
            ctl.innerHTML = '<span style="color:#9a9">rhythm</span>' +
                // §377 (composer, 2026-09-10: "put the shape selection at the top of the rhythm group")
                '<label>shape <select id="skShape" style="' + inp + ';width:64px"><option value="played">as played</option><option value="unison">unison</option><option value="even">even</option><option value="front">front-loaded</option><option value="back">back-loaded</option><option value="centre">centre</option><option value="edges">edges</option><option value="random">random</option><option value="accel">accel · round robin</option></select></label>' +
                '<label>span × <input id="skTimeX" type="number" min="0.01" step="0.05" style="' + inp + '"></label>' +
                '<label title="U11: first onset → last onset of the strike as shaped now; type a duration and span × follows">= <input id="skSpanMs" type="number" min="1" step="1" style="' + inp + '"> ms</label>' +
                '<label title="U12: the mean gap between the onsets that sound; type a gap and the duration follows: gap × (onsets − 1)">gap <input id="skGapMs" type="number" min="0.1" step="0.1" style="' + inp + '"> ms</label>' +
                '<label title="U12: checked — a note nobody plays leaves the rhythm and the sounding notes are spaced by themselves; unchecked — it stays as a rest on the recorded grid"><input id="skDrop" type="checkbox"> drop rests</label>' +
                '<div id="skAccel" style="display:none;flex-direction:column;gap:3px;margin-top:3px;padding-top:3px;border-top:1px solid #333">' +
                '<span style="color:#9a9" title="U13: one accelerating run — the gap box is its FIRST gap, every next gap is steep × the one before, down to → last; the notes needed are computed and the players come round again (cycle 1 in your order, later cycles shuffled under the re-attack rule, or the rotation with the pitches shuffled when no shuffle fits)">accel · round robin</span>' +
                '<label title="1h: the run\'s shape — even: the same gap throughout, the gap box, → last ignored, the length by ms or notes (§142) · geometric: each gap a fixed fraction of the one before (a still head, then the collapse) · curve: the speed changes by a percentage per second, the dial from bloom (the change early) through even to surge (a still head, then the swell) · S-curve: even, accelerating, then the last gaps nearly equal · two-phase: a flat head, then the rush · late rush: the gaps stay near the first, then collapse · linear ms: each gap shorter by the same milliseconds">run <select id="skAShape" style="' + inp + ';width:84px"></select></label>' +
                '<label id="skADialRow" title="the shape\'s one number"><span id="skADialName">dial</span> <input id="skADial" type="number" step="0.05" style="' + inp + '"></label>' +
                '<span style="color:#9a9" title="the run\'s length by any ONE of the three — type one and the other two follow; the one in charge is outlined">length</span>' +
                '<label title="the steepness: each gap about this fraction of the one before (the count of notes follows; the last gap lands exactly on → last, so the fraction is adjusted a little); for a run that slows, the same number read as its inverse">steep <input id="skASteep" type="number" min="0.5" max="0.99" step="0.01" style="' + inp + '"></label>' +
                '<label title="the count of notes in the run; type it and steep and ms follow">notes <input id="skACount" type="number" min="2" max="500" step="1" style="' + inp + '"></label>' +
                '<label title="the last gap — the landing (larger than the gap box = a run that slows)">→ last <input id="skAFloor" type="number" min="5" step="1" style="' + inp + '"> ms</label>' +
                '<label title="performer jitter (CN-13): each gap moved at random by about this percentage of itself, seeded with the run\'s seed; a second number ramps the jitter from the first gap to the last (blank = the same throughout)">jitter % <input id="skAJit" type="number" min="0" max="100" step="1" style="' + inp + '"> → <input id="skAJitEnd" type="number" min="0" max="100" step="1" placeholder="same" style="' + inp + '"></label>' +
                '<label title="extra gaps at the last gap after the ramp: the run stays at its landing speed for this many more notes">hold <input id="skAHold" type="number" min="0" max="200" step="1" style="' + inp + '"> gaps</label>' +
                '<label title="the run played backwards in time — a rush that opens out; not the same as swapping the gap and → last, which keeps the shape\'s direction"><input id="skAMirror" type="checkbox"> mirror</label>' +
                '<label title="a loudness ramp along the run in the ensemble\'s one scale (the violins\' velocity, as the trills: 65 = a curve\'s bottom, 127 = its top), each instrument translated through 1g\'s measured remap; blank = the strike\'s own velocities; curve: below 0 the change early, above 0 late">vel <input id="skAVel0" type="number" min="1" max="127" step="1" placeholder="as is" style="' + inp + '"> → <input id="skAVel1" type="number" min="1" max="127" step="1" placeholder="as is" style="' + inp + '"> vel curve <input id="skAVelCurve" type="number" min="-1" max="1" step="0.1" style="' + inp + '"></label>' +
                '<label title="no player attacks twice within this time; a cycle that cannot be shuffled under it falls back to the rotation of players with the pitches shuffled (folded into range)">re-attack ≥ <input id="skAMin" type="number" min="0" step="10" style="' + inp + '"> ms</label>' +
                '<label title="1h item 5 (composer, 2026-09-06): round robin — every player once per lap of the cards, cycle 1 in your order, later laps shuffled under the re-attack rule (U13); free — no lap: each note to any player the rule allows, at random, never the one who just played while another is free, a lean toward whoever has waited longest">deal <select id="skADeal" style="' + inp + ';width:84px"><option value="robin">round robin</option><option value="free">free</option></select></label>' +
                '<label title="1h item 5: where the dealt pitches come from — the cards (the notes with players, as now) or every distinct pitch the strike holds, players or not; drawn to completion before any repeats, then reshuffled; each folded into the receiving player\'s range as now">pitches <select id="skAPool" style="' + inp + ';width:84px"><option value="cards">the cards</option><option value="strike">the whole strike</option></select></label>' +
                '<label title="U13b (composer, 2026-09-05: \"can we scramble the pitches after the round robin\"): checked — from cycle 2 on, the pitch set is dealt afresh to the players (folded into range), whether the instrument order is shuffled or repeats; unchecked — each player keeps its own pitch, only the order changes"><input id="skARedeal" type="checkbox"> re-deal pitches after cycle 1</label>' +
                '<div id="skSeedA"></div>' +
                '<div id="skAInfo" style="color:#9a9;white-space:normal;line-height:1.3"></div>' +
                '</div>' +
                '<label>amount <input id="skAmt" type="range" min="0" max="1" step="0.05" style="width:64px"></label>' +
                '<label>jitter <input id="skJit" type="number" min="0" max="500" step="5" style="' + inp + '"> ms</label>' +
                '<div><button id="skRev" style="' + btn + '">reverse</button> <button id="skRot" style="' + btn + '">rotate</button> <button id="skRRe" style="' + btn + '">reshuffle</button></div>' +
                '<div><button id="skRhyReset" style="' + btn + '" title="the rhythm as played: shape as played · span × 1 · jitter 0 · reverse off · rotate 0 — order and orchestration untouched; back undoes it (U5)">reset rhythm</button></div>' +
                '<div><label title="2026-09-10: keep the rhythm you built when you pick a NEW strike or harmony, AND orchestrate the new notes automatically (the seeded shuffle — reshuffle for another) — the shape, the run and all its dials, span ×, jitter, reverse, rotate, and the order menu (a by-hand order falls back to as played, its slots belonged to the old note count). The VOICING still resets, and the players are always re-dealt: a new harmony has new notes. Off = the drawer as it always was."><input id="skKeepRhy" type="checkbox"> keep rhythm + orchestrate on a new pick</label></div>' +
                '<div id="skSeedR"></div>' +
                '<span style="color:#9a9;margin-top:4px">order</span>' +
                '<label><select id="skOrder" style="' + inp + ';width:78px"><option value="played">as played</option><option value="manual">by hand</option><option value="lowhigh">low → high</option><option value="highlow">high → low</option><option value="outin">outside-in</option><option value="inout">inside-out</option><option value="random">random</option></select></label>' +
                '<div><button id="skORe" style="' + btn + '">shuffle order</button></div><div id="skSeedO"></div><span style="color:#666">click two dots to swap<br>shift-click = solo</span>' +
                '<label style="margin-top:4px">width <input id="skRhyW" type="range" min="320" max="1400" step="20" style="width:64px"></label>';
            wrap.appendChild(ctl);
            const q = sel => ctl.querySelector(sel);
            q('#skTimeX').addEventListener('change', e => { this.snapshot(); this.cfg.timeX = clamp(+e.target.value || 1, 0.01, 10000); this.save(); this.render(); });   // U11: the ×20 cap is gone (#22 is 13 ms as played)
            q('#skGapMs').addEventListener('change', e => {
                if (this.cfg.shape === 'accel') { this.snapshot(); this.cfg.aFirst = Math.max(1, +e.target.value || 1); this.save(); this.render(); return; }   // U13: the FIRST gap of the run
                const g = Math.max(0.1, +e.target.value || 0); const pp = this.pat(); const m = pp.length; const last = m ? pp[m - 1] : 0;
                if (m < 2) { this.setStatus('one sounding onset — there is no gap to set', true); this.render(); return; }
                const unit = this.cfg.timeX ? last / this.cfg.timeX : 0; if (!unit) { this.render(); return; }
                this.snapshot(); this.cfg.timeX = clamp((g * (m - 1)) / unit, 0.01, 10000); this.save(); this.render();
            });
            q('#skDrop').addEventListener('change', e => { this.snapshot(); this.cfg.dropRests = !!e.target.checked; this.save(); this.render(); });
            q('#skASteep').addEventListener('change', e => { this.snapshot(); this.cfg.aRatio = clamp(+e.target.value || 0.85, 0.5, 0.99); this.cfg.aLen = 'ratio'; this.save(); this.render(); });
            // 1h: the run's shape, its dial, the length by notes, the jitter, the hold, the mirror, the level ramp
            q('#skAShape').addEventListener('change', e => { this.snapshot(); this.cfg.aShape = e.target.value; if (this.cfg.aShape === 'even' && this.cfg.aLen === 'ratio') this.cfg.aLen = 'duration'; this.save(); this.render(); });
            q('#skADial').addEventListener('change', e => { const AC = AC_(); const sh = AC && AC.shapeOf(this.cfg.aShape); if (!sh || !sh.dial) return; this.snapshot(); this.cfg[DIAL_CFG[sh.dial.key]] = clamp(+e.target.value || 0, sh.dial.min, sh.dial.max); this.save(); this.render(); });
            q('#skACount').addEventListener('change', e => { this.snapshot(); this.cfg.aCount = clamp(Math.round(+e.target.value || 2), 2, 500); this.cfg.aLen = 'count'; this.save(); this.render(); });
            q('#skAJit').addEventListener('change', e => { this.snapshot(); this.cfg.aJit = clamp(+e.target.value || 0, 0, 100); this.save(); this.render(); });
            q('#skAJitEnd').addEventListener('change', e => { this.snapshot(); this.cfg.aJitEnd = e.target.value === '' ? '' : clamp(+e.target.value || 0, 0, 100); this.save(); this.render(); });
            q('#skAHold').addEventListener('change', e => { this.snapshot(); this.cfg.aHold = clamp(Math.round(+e.target.value || 0), 0, 200); this.save(); this.render(); });
            q('#skAMirror').addEventListener('change', e => { this.snapshot(); this.cfg.aMirror = !!e.target.checked; this.save(); this.render(); });
            q('#skAVel0').addEventListener('change', e => { this.snapshot(); this.cfg.aVel0 = e.target.value === '' ? '' : clamp(Math.round(+e.target.value || 1), 1, 127); this.save(); this.render(); });
            q('#skAVel1').addEventListener('change', e => { this.snapshot(); this.cfg.aVel1 = e.target.value === '' ? '' : clamp(Math.round(+e.target.value || 1), 1, 127); this.save(); this.render(); });
            q('#skAVelCurve').addEventListener('change', e => { this.snapshot(); this.cfg.aVelCurve = clamp(+e.target.value || 0, -1, 1); this.save(); this.render(); });
            q('#skAFloor').addEventListener('change', e => { this.snapshot(); this.cfg.aFloor = clamp(+e.target.value || 45, 5, 5000); this.save(); this.render(); });
            q('#skAMin').addEventListener('change', e => { this.snapshot(); this.cfg.aMin = clamp(+e.target.value || 0, 0, 5000); this.save(); this.render(); });
            q('#skADeal').addEventListener('change', e => { this.snapshot(); this.cfg.aDeal = e.target.value === 'free' ? 'free' : 'robin'; this.save(); this.render(); });   // 1h item 5
            q('#skAPool').addEventListener('change', e => { this.snapshot(); this.cfg.aPool = e.target.value === 'strike' ? 'strike' : 'cards'; this.save(); this.render(); });
            q('#skARedeal').addEventListener('change', e => { this.snapshot(); this.cfg.aRedeal = !!e.target.checked; this.save(); this.render(); });
            q('#skSpanMs').addEventListener('change', e => {
                if (this.cfg.shape === 'accel') { this.snapshot(); this.cfg.aDur = Math.max(1, +e.target.value || 1); this.cfg.aLen = 'duration'; this.save(); this.render(); return; }   // 1h: the duration as the run's length — steep and notes follow
                // U11 (composer, 2026-09-04: "an extra millisecond box next to span so we can dial in the exact duration"):
                // the box is the real first→last onset of the current pattern; typing a duration sets span × so the pattern lands on it
                const want = Math.max(1, +e.target.value || 0); const pp = this.pat(); const last = pp.length ? pp[pp.length - 1] : 0;
                const unit = this.cfg.timeX ? last / this.cfg.timeX : 0;
                if (!unit) { this.setStatus('this strike has no span to stretch (a single onset)', true); this.render(); return; }
                this.snapshot(); this.cfg.timeX = clamp(want / unit, 0.01, 10000); this.save(); this.render();
            });
            q('#skShape').addEventListener('change', e => { this.snapshot(); this.cfg.shape = e.target.value; this.save(); this.render(); });
            q('#skAmt').addEventListener('pointerdown', () => this.snapshot());   // once per drag, not per tick
            q('#skAmt').addEventListener('input', e => { this.cfg.amount = +e.target.value; this.save(); this.render(); });
            q('#skJit').addEventListener('change', e => { this.snapshot(); this.cfg.jitterMs = clamp(+e.target.value || 0, 0, 500); this.save(); this.render(); });
            q('#skRev').addEventListener('click', () => { this.snapshot(); this.cfg.reverse = !this.cfg.reverse; this.render(); });
            q('#skRot').addEventListener('click', () => { this.snapshot(); this.cfg.rotate = (this.cfg.rotate || 0) + 1; this.render(); });
            q('#skRRe').addEventListener('click', () => { this.snapshot(); this.useSeed('rSeed', this.nextSeed('rSeed')); this.save(); this.render(); });
            q('#skKeepRhy').addEventListener('change', e => { this.cfg.keepRhythm = !!e.target.checked; this.save(); this.render(); this.setStatus(this.cfg.keepRhythm ? 'keep rhythm ON — a new strike or harmony keeps the shape, the run and every dial, and arrives orchestrated by the seeded shuffle (reshuffle for another); the voicing resets' : 'keep rhythm OFF — a new pick resets the rhythm as it always did'); });
            q('#skRhyReset').addEventListener('click', () => { this.snapshot(); this.resetRhythm(); this.save(); this.render(); this.setStatus('rhythm reset to as played (span × 1 · jitter 0 · reverse off · rotate 0) — back undoes it'); });
            q('#skOrder').addEventListener('change', e => { this.snapshot(); this.cfg.order = e.target.value; this.save(); this.render(); });
            q('#skORe').addEventListener('click', () => { this.snapshot(); this.useSeed('oSeed', this.nextSeed('oSeed')); this.save(); this.render(); });
            q('#skRhyW').addEventListener('input', e => { this.cfg.rhythmW = +e.target.value; this.save(); this.render(); });
        }
        { const A = this.cfg.shape === 'accel' ? this.accelSeq() : null; const acc = ctl.querySelector('#skAccel'); acc.style.display = A ? 'flex' : 'none';
          const gapBox = ctl.querySelector('#skGapMs'), msBox = ctl.querySelector('#skSpanMs');
          if (A) { const c = this.cfg, AC = AC_(), Q = sel => ctl.querySelector(sel);
            gapBox.value = +(+c.aFirst).toFixed(1); msBox.value = Math.round(A.total); Q('#skAFloor').value = c.aFloor; Q('#skAMin').value = c.aMin; Q('#skARedeal').checked = !!c.aRedeal; Q('#skAInfo').innerHTML = A.info; gapBox.title = 'accel: the FIRST gap of the run — the chain\'s value';
            // 1h: the run's shape menu (one source: the calculator's list), its dial, the length boxes with the one in charge outlined
            const sel = Q('#skAShape'); if (AC && sel.options.length !== AC.SHAPES.length) sel.innerHTML = AC.SHAPES.map(s => '<option value="' + s.key + '" title="' + s.note + '">' + s.label + '</option>').join(''); sel.value = c.aShape || 'geometric';
            const sh = AC && AC.shapeOf(c.aShape); const dialRow = Q('#skADialRow'), dial = Q('#skADial');
            if (sh && sh.dial) { dialRow.style.display = ''; Q('#skADialName').textContent = sh.dial.label; dial.min = sh.dial.min; dial.max = sh.dial.max; dial.step = sh.dial.step; dial.value = c[DIAL_CFG[sh.dial.key]]; dialRow.title = sh.note; } else dialRow.style.display = 'none';
            Q('#skASteep').value = c.aLen === 'ratio' ? c.aRatio : +A.ratio.toFixed(3); Q('#skACount').value = c.aLen === 'count' ? c.aCount : A.notes;
            const even = c.aShape === 'even', lenBy = (even && c.aLen !== 'count') ? 'duration' : (c.aLen || 'ratio');
            const master = { ratio: '#skASteep', count: '#skACount', duration: '#skSpanMs' }; Object.keys(master).forEach(k => { Q(master[k]).style.outline = lenBy === k ? '1px solid #C9A05A' : ''; });
            Q('#skASteep').disabled = even; Q('#skAFloor').disabled = even;   // §142: no steepness and no landing in an even run
            Q('#skAJit').value = c.aJit || 0; Q('#skAJitEnd').value = c.aJitEnd === '' || c.aJitEnd == null ? '' : c.aJitEnd; Q('#skAHold').value = c.aHold || 0; Q('#skAMirror').checked = !!c.aMirror;
            Q('#skAVel0').value = c.aVel0 === '' || c.aVel0 == null ? '' : c.aVel0; Q('#skAVel1').value = c.aVel1 === '' || c.aVel1 == null ? '' : c.aVel1; Q('#skAVelCurve').value = c.aVelCurve || 0;
            Q('#skADeal').value = c.aDeal === 'free' ? 'free' : 'robin'; Q('#skAPool').value = c.aPool === 'strike' ? 'strike' : 'cards'; Q('#skARedeal').disabled = c.aDeal === 'free'; }
          else { msBox.style.outline = ''; const pp = this.pat(); const m = pp.length, last = m ? pp[m - 1] : 0; msBox.value = Math.round(last); gapBox.value = m > 1 ? +(last / (m - 1)).toFixed(1) : 0; gapBox.title = 'the mean gap between the onsets that sound; type a gap and the duration follows: gap × (onsets − 1)'; }
          msBox.disabled = false; ctl.querySelector('#skDrop').checked = !!this.cfg.dropRests; }   // 1h: in accel the ms box is the run's duration, typed
        // PLAN 1t step 3: under UNISON there is no span, so span × · = ms · gap are greyed and say why — rather than accepting a
        // number that does nothing
        { const uni = this.cfg.shape === 'unison';
          [['#skTimeX', 'span ×'], ['#skSpanMs', 'the duration'], ['#skGapMs', 'the gap']].forEach(([sel, what]) => {
              const b = ctl.querySelector(sel); if (!b) return;
              b.disabled = uni; b.style.opacity = uni ? 0.4 : '';
              if (uni) b.title = 'unison: every onset is at the first, so there is no span — ' + what + ' has nothing to stretch';
          }); }
        // §347: measure the panel now it is filled; if the strip was laid out against a different width, lay it out once more.
        { const w = ctl.offsetWidth || ctl.getBoundingClientRect().width || 0;
          if (w && Math.abs(w - (this._rhyCtlW || 130)) > 1 && !this._rhyReflow) {
              this._rhyCtlW = w; this._rhyReflow = true;
              try { this.renderRhythm(); } finally { this._rhyReflow = false; }
              return;
          } }
        ctl.querySelector('#skRhyW').value = this.cfg.rhythmW || 480; ctl.querySelector('#skTimeX').value = +(+this.cfg.timeX).toFixed(3); ctl.querySelector('#skShape').value = this.cfg.shape; ctl.querySelector('#skAmt').value = this.cfg.amount; ctl.querySelector('#skJit').value = this.cfg.jitterMs; ctl.querySelector('#skOrder').value = this.cfg.order; { const kr = ctl.querySelector('#skKeepRhy'); if (kr) kr.checked = !!this.cfg.keepRhythm; }
        // dots: click one, then another = swap their slots; a dot on the keyboard then a player row = assign
        svg.querySelectorAll('.skRDot').forEach(dd => dd.addEventListener('click', ev => {
            const i = +dd.dataset.i;
            if (ev.shiftKey) { this.snapshot(); this.voices[i].solo = !this.voices[i].solo; this.render(); return; }
            if (this.swapFirst == null) { this.swapFirst = i; this.render(); return; }
            const a = this.voices[this.swapFirst], b = this.voices[i]; this.swapFirst = null;
            if (a !== b) { this.snapshot(); const t = a.slot; a.slot = b.slot; b.slot = t; this.cfg.order = 'manual'; }
            this.render();
        }));
        // a keyboard dot click also arms "assign to the next clicked player"
        this.el.querySelectorAll('#skKb .skDot').forEach(dd => dd.addEventListener('dblclick', ev => { ev.stopPropagation(); this.pendingVoice = +dd.dataset.i; this.setStatus('voice ' + nm(this.voices[this.pendingVoice].pitch) + ' armed — click a player row: it plays this note (what it had goes to nobody; the note stays wherever else it is) · shift-click keeps what the row had'); }));
    },
    renderLines() {
        const svg = this.el.querySelector('#skLines'), body = this.body;
        const kb = this.el.querySelector('#skKb'), rows = this.el.querySelectorAll('#skOrch .skRow');
        if (!kb || !rows.length) { svg.innerHTML = ''; return; }
        const bb = body.getBoundingClientRect();
        svg.setAttribute('width', body.scrollWidth); svg.setAttribute('height', body.scrollHeight);
        svg.style.width = body.scrollWidth + 'px'; svg.style.height = body.scrollHeight + 'px';
        let s = '';
        const pairs = []; this.voices.forEach(v => this.reals(v).forEach(r => pairs.push({ v, r })));   // U10: a line per player that has the note
        pairs.forEach(({ v, r }) => {
            const dot = kb.querySelector('.skDot[data-i="' + v.i + '"]'); const row = rows[r.lane];
            if (!dot || !row) return;
            const land = row.querySelector('.skLand') || row;
            const a = dot.getBoundingClientRect(), b = land.getBoundingClientRect();
            const x1 = a.left + a.width - bb.left + body.scrollLeft, y1 = a.top + a.height / 2 - bb.top + body.scrollTop;
            const x2 = b.left + b.width / 2 - bb.left + body.scrollLeft, y2 = b.top + b.height / 2 - bb.top + body.scrollTop;
            const hot = this.hoverLane === r.lane, dim = this.hoverLane != null && !hot;
            s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + this.pcColor(v.pc) + '" stroke-width="' + (hot ? 2.2 : 1) + '" stroke-dasharray="' + (hot ? '5 3' : '3 3') + '" opacity="' + (hot ? 1 : dim ? 0.3 : 0.8) + '"/>';
        });
        svg.innerHTML = s;
    },

    // ------------------------------------------------------------------ hear (G)
    remapVel(lane, midi, anchor) {   // 1h: the level ramp's number is the ensemble's scale (the violins'), translated per instrument through 1g's remap (bank/velocity_remap.json); without the bank it passes through
        const C = C_(), VR = VR_(), T = TRK(); const a = clamp(Math.round(anchor), 1, 127); const key = T[lane] && T[lane].instKey;
        return (VR && C && C._velRemap && key) ? VR.velocityFor(C._velRemap, key, midi, a) : a;
    },
    notesFor(mode) {
        const T = TRK(); const pianoLane = T.findIndex(t => t.instKey === 'piano');
        if (this.isChords && this.isChords()) return this.chordNotes({ piano: mode === 'piano', span: true });   // PLAN 1k: the dealt chords, the marked span only
        if (this.cfg.shape === 'accel' && mode !== 'piano') {   // U13: the run — one note per player of each card, at the run's onsets
            const A = this.accelSeq(); const anySolo = this.voices.some(v => v.solo); const out = [];
            A.events.forEach(ev => { const v = ev.unit.v; if (anySolo && !v.solo) return; const vel0 = clamp(Math.round((this.cfg.flatten ? 127 : v.vel) * this.cfg.dynX), 1, 127); const durMs = Math.max(30, v.durMs * this.cfg.durX);
                ev.notes.forEach(nt => out.push({ lane: nt.lane, tech: nt.tech || plainTech(this.instOf(nt.lane)), midi: nt.midi, vel: ev.level != null ? this.remapVel(nt.lane, nt.midi, ev.level) : vel0, onMs: ev.onMs, durMs })); });   // 1h: the level ramp, when set, replaces the strike's velocity
            return out;
        }
        const out = []; const anySolo = this.voices.some(v => v.solo);
        this.timed(mode === 'piano').forEach(q => {   // Hear piano = the whole chord as played, rests or not
            const v = q.v; const vel = clamp(Math.round((this.cfg.flatten ? 127 : v.vel) * this.cfg.dynX), 1, 127);
            if (anySolo && !v.solo) return;                       // U3: while anything is soloed, only the soloed voices sound
            if (mode === 'piano') { out.push({ lane: pianoLane, tech: plainTech(this.instOf(pianoLane)), midi: v.pitch, vel, onMs: q.onMs, durMs: q.durMs }); return; }
            this.reals(v).forEach(r => { if (!r.skip) out.push({ lane: r.lane, tech: r.tech || plainTech(this.instOf(r.lane)), midi: this.soundingPitchR(v, r), vel, onMs: q.onMs, durMs: q.durMs }); });   // U10: one note per player that has it
            if (v.piano && !this.reals(v).some(r => r.lane === pianoLane)) out.push({ lane: pianoLane, tech: plainTech(this.instOf(pianoLane)), midi: v.pitch, vel, onMs: q.onMs, durMs: q.durMs });
        });
        return out;
    },
    async play(mode) { if (!this.strike) return; return this.playNotes(this.notesFor(mode), mode === 'piano' ? 'the harmony on the piano' : 'orchestrated'); },
    // FIX-NOW 1 (2026-09-12, §421): Hear's body, given its notes — Hear, the list's row ♪ (a harmony as a piano block) and the
    // head's ♪ as dealt (the loaded harmony, every player its note, one strike, no rhythm) all play through this one path
    async playNotes(notes, label) {
        const e = E_();
        e.panic();
        if (!await e.ensureMidi()) { this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const routes = {}, missing = {}; let skipped = 0;
        notes.forEach(n => { const k = n.lane + '|' + n.tech; if (!(k in routes)) { const r = e.routeFor(n.lane, n.tech); routes[k] = r || null; if (!r) { const inst = this.instOf(n.lane); missing[(inst && inst.port) || ('lane ' + n.lane)] = 1; } } if (!routes[k]) skipped++; });
        if (!notes.length || skipped === notes.length) { this.setStatus(Object.keys(missing).length ? 'no MIDI port for ' + Object.keys(missing).join(', ') : 'nothing to play — shuffle or assign first', true); return; }
        Object.values(routes).forEach(r => { if (r) try { r.out.send([0xB0 | r.ch, 7, 127]); } catch (x) {} });
        this.base = performance.now() + LEAD_MS; e._playing = true;
        const span = notes.reduce((m, n) => Math.max(m, n.onMs + n.durMs), 0) + 400;
        notes.forEach(n => {
            const r = routes[n.lane + '|' + n.tech]; if (!r) return;
            const on = this.base + n.onMs, off = on + n.durMs;
            if (r.tech && r.tech.cc0 != null) e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 0, r.tech.cc0]); } catch (x) {} }, Math.max(0, on - CC0_LEAD_MS - performance.now())));
            e._timers.push(setTimeout(() => e.noteOn(r, n.midi, n.vel), Math.max(0, on - performance.now())));
            e._timers.push(setTimeout(() => e.noteOff(r, n.midi), Math.max(0, off - performance.now())));
        });
        e._timers.push(setTimeout(() => e.panic(), span + 700));
        this.startPlayhead(span);
        this.setStatus('hearing ' + label + ' · ' + (notes.length - skipped) + ' notes' + (skipped ? ' · ' + skipped + ' had no port' : ''));
    },
    // FIX-NOW 1 · the head's ♪: the loaded harmony as dealt — what Hear orchestrated would play, every onset moved to 0, each
    // player·pitch once. The deal is heard, not the rhythm.
    hearDealt() {
        if (!this.strike) { this.setStatus('load a harmony first', true); return; }
        const seen = new Set(), notes = [];
        this.notesFor('orch').forEach(n => { const k = n.lane + '|' + n.tech + '|' + n.midi; if (seen.has(k)) return; seen.add(k); notes.push(Object.assign({}, n, { onMs: 0, durMs: Math.max(600, +n.durMs || 0) })); });
        return this.playNotes(notes, 'the harmony as dealt · one strike');
    },
    // FIX-NOW 1 · a row's ♪: that harmony alone as a piano block, ~600 ms — nothing loaded, nothing changed
    hearHarmony(id) {
        const s = this.strikeById(id); if (!s) { this.setStatus('no such harmony: ' + id, true); return; }
        const T = TRK(), pl = T.findIndex(t => t.instKey === 'piano'); if (pl < 0) { this.setStatus('no piano lane to audition on', true); return; }
        const tech = this.defaultTech(pl);
        const notes = [...new Set((s.notes || []).map(n => +n.midi).filter(isFinite))].map(m => ({ lane: pl, tech, midi: clamp(m, 21, 108), vel: 100, onMs: 0, durMs: 600 }));
        return this.playNotes(notes, (s.label || String(id)) + ' · piano block');
    },
    async hearOne(lane, techKey, midi) {
        const e = E_(); e.panic();
        if (!await e.ensureMidi()) { this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const r = e.routeFor(lane, techKey); if (!r) { this.setStatus('no port for that player', true); return; }
        try { r.out.send([0xB0 | r.ch, 7, 127]); if (r.tech && r.tech.cc0 != null) r.out.send([0xB0 | r.ch, 0, r.tech.cc0]); } catch (x) {}
        e._playing = true;
        e._timers.push(setTimeout(() => e.noteOn(r, midi, 100), 60));
        e._timers.push(setTimeout(() => e.noteOff(r, midi), 60 + 800));
        e._timers.push(setTimeout(() => e.panic(), 1600));
    },
    startPlayhead(spanMs) {
        this.stopPlayhead(); const head = this.el.querySelector('#skPlayhead'); head.style.display = '';
        this.ph = setInterval(() => { const el = performance.now() - this.base; head.textContent = el < 0 ? '▶' : '▶ ' + (el / 1000).toFixed(2) + ' s'; if (el > spanMs) this.stopPlayhead(); }, 60);
    },
    stopPlayhead() { if (this.ph) { clearInterval(this.ph); this.ph = null; } const head = this.el && this.el.querySelector('#skPlayhead'); if (head) { head.style.display = 'none'; head.textContent = '▶'; } },
    onStopped() { this.stopPlayhead(); },

    // ⌖ (2026-09-06, §113): park the playhead on the strike's original time — on request, never on the pick
    gotoOriginal() {
        const C = C_(); if (!C || !this.strike) return;
        if (C.isPlaying) { this.setStatus('stop first', true); return; }
        if (typeof C.applyScroll === 'function') { C.scrollOffset = this.strike.t0 * C.pixelsPerSecond; C.applyScroll(); }
        this.setStatus('playhead at #' + this.strike.index + "'s original time " + this.strike.t0.toFixed(3) + ' s');
    },

    // ------------------------------------------------------------------ insert / replace (Q)
    insert(replace) {
        const C = C_(); if (!C || !this.strike) return;
        // §345: with the sound switch on CRESCENDO, `notesFor` returns swell-LENGTH notes (swell_ui wraps it so Hear gets the
        // lengths) — and this insert would then write them as PLAIN long notes: bricks, not crescendos. The crescendo objects
        // only ever came from the swell foot's own `Insert swells`. His principle (§AC item 2) is that Hear plays what Insert
        // writes; so Insert @ playhead now writes what Hear is playing.
        if (this.isSwell && this.isSwell() && !(this.isFill && this.isFill()) && this.swellInsert) {
            if (!replace) return this.swellInsert();
            this.setStatus('the sound is CRESCENDO — swells are written at the PLAYHEAD; use Insert @ playhead, or set the sound back to attack', true);
            return;
        }
        const notes = this.notesFor('orch');   // PLAN 1k: in chords mode these are the dealt chords of the MARKED span (nothing marked = the whole)
        if (!notes.length) { this.setStatus(this.isChords() ? 'nothing to insert — build a chord list and Generate' : 'nothing to insert — shuffle or assign first', true); return; }
        let t = +C.getTimeAtPlayhead().toFixed(3);
        let replaceMsg = '', afterMsg = '';
        if (replace === 'after') {
            // U11 (composer, 2026-09-04: "calculate the gap between seventeen and eighteen — the onset gap — and place that gap
            // at the end of the seventeen in the score; that will be the new onset time for eighteen"): the previous strike as
            // it stands in the OPEN score (its last onset = its end) + the recorded onset gap t0(n) − t0(n−1) from the database.
            const prev = Object.values(this.db.strikes).find(x => x.index === this.strike.index - 1);
            if (!prev) { this.setStatus('no previous strike in the database', true); return; }
            const pp = 'grp-strike-' + prev.index + '-', ML = METAL();
            const prevNotes = C.objects.filter(o => o.groupId && String(o.groupId).startsWith(pp) && o.layer !== ML && o.sonifyNote != null);
            if (!prevNotes.length) { this.setStatus('#' + prev.index + ' is not in this score — insert it first (@ original time or @ after previous)', true); return; }
            const end = Math.max(...prevNotes.map(o => +o.startSeconds || 0)), gap = this.strike.t0 - prev.t0;
            t = +(end + gap).toFixed(3);
            afterMsg = ' = end of #' + prev.index + ' (' + end.toFixed(3) + ') + onset gap ' + gap.toFixed(3);
        }
        // choice 3 (composer, 2026-09-04: replace on re-insert = yes): a strike exists once in a score — an earlier insert of
        // this strike, in any mode, is removed before the new one is written
        C.pushUndoState();
        // 2026-09-06 (§113): an insert replaces an earlier insert of this strike only where it sits at the same time (within 100 ms)
        // and keeps its copies elsewhere, so a strike can recur (CN-28: patterned, call-and-response strikes); choice 3 of
        // 2026-09-04 ("replace on re-insert") narrowed to the same time — the status names the copies kept
        { const mine = 'grp-strike-' + this.strike.index + '-'; const before0 = C.objects.length;
          const gStart = {}; C.objects.forEach(o => { if (o.groupId && String(o.groupId).startsWith(mine)) { const g = o.groupId, st = +o.startSeconds || 0; gStart[g] = g in gStart ? Math.min(gStart[g], st) : st; } });
          const drop = g => Math.abs(gStart[g] - t) < 0.1;   // every mode: replaced where it already sits (within 100 ms), kept elsewhere
          C.objects = C.objects.filter(o => !(o.groupId && String(o.groupId).startsWith(mine) && drop(o.groupId)));
          const older = before0 - C.objects.length; if (older) replaceMsg += ' · replaced the earlier #' + this.strike.index + ' at this time (' + older + ' objects)';
          const kept = Object.keys(gStart).filter(g => !drop(g)).length; if (kept) replaceMsg += ' · ' + kept + ' earlier copy' + (kept > 1 ? 'ies' : '') + ' of #' + this.strike.index + ' kept elsewhere'; }
        if (replace === true) {
            // Q v2 (composer, 2026-09-04: "have the time code carry with the strike … it'll put it in its
            // original time, but I don't have to open the scattered strikes 01 save file"): the strike is
            // written at its own t0 into WHATEVER score is open. Originals are removed only where they truly
            // exist — same id AND lane AND pitch AND onset (within 25 ms) — never by id alone (wc-40 exists in
            // every score). In the source save or a copy of it that replaces them; elsewhere it just inserts.
            t = this.strike.t0;
            const want = new Map(this.strike.notes.map(nn => [nn.objectId, nn]));
            const isOriginal = o => { const nn = want.get(o.id); return !!nn && o.layer === nn.layer && o.sonifyNote === nn.midi && Math.abs((+o.startSeconds || 0) - (this.strike.t0 + nn.dtMs / 1000)) < 0.025; };
            const before = C.objects.length;
            C.objects = C.objects.filter(o => !isOriginal(o));
            const gone = before - C.objects.length;
            replaceMsg += gone ? (' · replaced ' + gone + ' original notes') : ' · no originals in this score';
        }
        const group = 'grp-strike-' + this.strike.index + '-' + Math.floor(t * 10) + (replace === true ? 'r' : replace === 'after' ? 'a' : '');
        let maxEnd = t; const busy = [];   // TRILLS_TOOL §7 (phase 3): a card on a player who is trilling at that moment is skipped — the run keeps its timing
        notes.forEach(n => {
            const start = t + n.onMs / 1000, dur = n.durMs / 1000;
            if (typeof C.trillCovers === 'function' && C.trillCovers(n.lane, +start.toFixed(3))) { busy.push(((TRK()[n.lane] || {}).short || ('L' + n.lane)) + '@' + start.toFixed(2)); return; }
            maxEnd = Math.max(maxEnd, start + dur);
            const lv = Math.max(1, Math.round((n.vel / 127) * 100) / 10);
            C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: group,
                startSeconds: +start.toFixed(3), endSeconds: +(start + dur).toFixed(3),
                nodes: [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
                color: '#C9A05A', fillMode: 'bottom', opacity: 0.55, performanceNotes: 'strike #' + this.strike.index + ' (' + this.strike.id + ')', properties: {}, srcKind: 'strike',
                sonifyNote: n.midi, technique: n.tech, sonifyMode: 'plain', recVel: n.vel });
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: METAL(), groupId: group, startSeconds: t, endSeconds: +maxEnd.toFixed(3),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: '#C9A05A', fillMode: 'bottom', opacity: 0.6, performanceNotes: 'strike #' + this.strike.index + ' (drag = move, box = stretch)', properties: {} });
        C.lastInsertGroup = group;
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        C.renderAll(); C.markDirty();
        this.setStatus((replace === 'after' ? '#' + this.strike.index + ' → ' + t.toFixed(3) + ' s' + afterMsg + ' · ' : '') + 'inserted ' + (notes.length - busy.length) + ' notes at ' + t.toFixed(3) + ' s' + (replace === true ? ' (original time)' : replace === 'after' ? ' (after previous)' : ' (playhead)') + ' as ' + group + replaceMsg + (busy.length ? ' · ' + busy.length + ' skipped — trilling: ' + busy.join(' ') : ''));
    },

    // ------------------------------------------------------------------ back / takes (O)
    state() { return JSON.parse(JSON.stringify({ strikeId: this.cfg.strikeId, cfg: this.cfg, voices: this.voices.map(v => ({ i: v.i, pitch: v.pitch, lane: v.lane, fold: v.fold, tech: v.tech, standIn: v.standIn, piano: v.piano, solo: !!v.solo, slot: v.slot, skip: !!v.skip, also: (v.also || []).map(r => ({ lane: r.lane, tech: r.tech, fold: r.fold, standIn: r.standIn, skip: !!r.skip })) })) })); },
    applyState(st) {
        if (!st || !this.strike || st.strikeId !== this.strike.id) { if (st && st.strikeId && this.strikeById(st.strikeId)) { this.select(st.strikeId); } if (!st || st.strikeId !== (this.strike && this.strike.id)) return; }
        Object.assign(this.cfg, ACCEL_DEFAULTS, st.cfg); this.cfg.strikeId = this.strike.id;   // 1h: a take from before the run's dials gets their defaults, not the last strike's
        st.voices.forEach(sv => { const v = this.voices[sv.i]; if (!v) return; Object.assign(v, { pitch: sv.pitch, lane: sv.lane, fold: sv.fold, tech: sv.tech, standIn: sv.standIn, piano: sv.piano, solo: !!sv.solo, slot: sv.slot, skip: sv.skip, also: (sv.also || []).map(r => ({ lane: r.lane, tech: r.tech, fold: r.fold, standIn: r.standIn, skip: !!r.skip })) }); });
        this.writeFields(); this.render();
    },
    snapshot() { this.prev = this.state(); },
    back() { if (!this.prev) { this.setStatus('nothing to go back to'); return; } const p = this.prev; this.prev = null; this.applyState(p); this.setStatus('back one step'); },
    // O v2 (composer, 2026-09-04: "lets keep those save files as well"): takes live in bank/panel_snapshots.json
    // through /api/snapshots (panel 'strikes') — the file the other panels use and git carries — not in the
    // browser. `state` is opaque to the server; `saved` is stamped there. The v1 localStorage takes are copied
    // over once (migrateTakes); the browser copy is kept under a '.migrated' key, never deleted.
    takeList: {},
    async refreshTakes() {
        try {
            const file = await fetch('/api/snapshots', { cache: 'no-store' }).then(x => x.json());
            this.takeList = (file && file.panels && file.panels[TAKES_PANEL]) || {};
        } catch (e) { this.takeList = {}; this.setStatus('take list failed: ' + e.message + ' (is node score/server.js running?)', true); }
        this.fillTakes();
    },
    takeNames() { const t = this.takeList; return Object.keys(t).sort((a, b) => String(t[b].saved || '').localeCompare(String(t[a].saved || ''))); },
    fillTakes() { const sel = this.el.querySelector('#skTakeSel'); if (!sel) return; sel.innerHTML = '<option value="">load take…</option>' + this.takeNames().map(nme => '<option value="' + nme.replace(/"/g, '&quot;') + '">' + nme + '</option>').join(''); },
    async postTake(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ panel: TAKES_PANEL }, body)) }).then(x => x.json());
        if (!r.success) throw new Error(r.error || '?');
        return r;
    },
    takeComment() { return this.strike ? ('strike #' + this.strike.index + ' · ' + this.strike.source) : ''; },
    async saveTake() {
        const box = this.el.querySelector('#skTakeName'), d = new Date(), pad = x => String(x).padStart(2, '0');
        const name = (box.value || '').trim() || ('take ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + pad(d.getMinutes()));
        if (!TAKE_NAME.test(name)) { this.setStatus('take not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen — got "' + name + '"', true); return; }
        try {
            const r = await this.postTake({ name, comment: this.takeComment(), state: this.state() });
            box.value = name; await this.refreshTakes();
            this.setStatus('take saved: ' + name + (r.existed ? ' (replaced)' : '') + ' · ' + r.panels + ' take' + (r.panels === 1 ? '' : 's') + ' in bank/panel_snapshots.json (committed at the wrap)');
        } catch (e) { this.setStatus('take not saved: ' + e.message, true); }
    },
    loadTake(name) {
        const t = this.takeList[name]; if (!t) { this.setStatus('no take named "' + name + '"', true); return; }
        this.snapshot(); this.applyState(t.state);
        const box = this.el.querySelector('#skTakeName'); if (box) box.value = name;
        this.setStatus('take loaded: ' + name + (t.comment ? ' · ' + t.comment : '') + ' · saved ' + String(t.saved || '').slice(0, 16).replace('T', ' '));
    },
    async deleteTake() {
        const box = this.el.querySelector('#skTakeName'), name = (box.value || '').trim();
        if (!name || !this.takeList[name]) { this.setStatus('type or load the name of the take to delete', true); return; }
        if (!window.confirm('Delete take "' + name + '" from bank/panel_snapshots.json?')) return;
        try { const r = await this.postTake({ name, delete: true }); box.value = ''; await this.refreshTakes(); this.setStatus('take deleted: ' + name + ' · ' + r.panels + ' left'); }
        catch (e) { this.setStatus('delete failed: ' + e.message, true); }
    },
    async migrateTakes() {
        let old = []; try { old = JSON.parse(localStorage.getItem(TAKES) || '[]'); } catch (e) { old = []; }
        if (!Array.isArray(old) || !old.length) return;
        const done = [], skipped = [];
        for (const t of old) {
            const name = (String(t.name || 'take').replace(/[^A-Za-z0-9._ -]/g, '-').slice(0, 64).trim()) || 'take';
            if (this.takeList[name]) { skipped.push(name); continue; }
            try {
                await this.postTake({ name, comment: 'from the browser, saved ' + String(t.time || '').slice(0, 16).replace('T', ' ') + (name !== t.name ? ' (was "' + t.name + '")' : ''), state: t.state });
                done.push(name + (name !== t.name ? ' (was "' + t.name + '")' : ''));
            } catch (e) { this.setStatus('take migration stopped at "' + name + '": ' + e.message + ' — the browser copies are kept', true); return; }
        }
        try { localStorage.setItem(TAKES + '.migrated', localStorage.getItem(TAKES)); localStorage.removeItem(TAKES); } catch (e) {}
        await this.refreshTakes();
        this.setStatus('takes moved to bank/panel_snapshots.json: ' + (done.join(', ') || 'none') + (skipped.length ? ' · already there: ' + skipped.join(', ') : ''));
    },

    // ------------------------------------------------------------------ misc
    save() { try { localStorage.setItem(STORE, JSON.stringify(this.cfg)); } catch (e) {} },
    restore() { try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s) Object.assign(this.cfg, s); } catch (e) {} },
    setStatus(msg, bad) { const s = this.el.querySelector('#skStatus'); s.textContent = msg; s.title = msg; s.style.color = bad ? '#e88' : '#9a9'; },   // the header line truncates — hover for the whole message (composer, 2026-09-04: "where to find status")
    // PLAN 1k: chords mode is a mixin (strike_chords_ui.js); this stub keeps the drawer whole when the mixin is not loaded
    isChords() { return false; },
};

root.StrikeDrawer = D;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => D.init());
else D.init();

}(typeof self !== 'undefined' ? self : this));
