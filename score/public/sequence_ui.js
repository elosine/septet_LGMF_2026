// sequence_ui.js — THE SEQUENCE DRAWER, one container at a time (PLAN 1d.2, 2026-09-19; RUNNING_LOG §115).
//
// His brief is COMPOSITION_NOTES LG-35: saved takes from the strikes drawer held as SUSTAINED CHORDS, each for a duration, in a row of
// time containers he can re-time or swap at any moment. The architecture he approved (§102–§107): a sequence is a RECIPE saved in the
// score file and the notes are DERIVED from it (sequence.js, 1d.1); a box's chord is FROZEN when chosen; he edits in the drawer, the
// score shows the result. docs/SEQUENCE_TOOL.md carries this in prose.
//
// A strip along the bottom of the screen, opened by a `Sequence` button beside `Strikes`. NOTHING in strike_drawer.js is changed —
// this file stands outside it, as long_tone_ui.js does, and reaches it through what it already offers:
//   · a box takes its chord by LOADING the take in the strikes drawer (D.loadTake — so he sees what he chose) and reading the notes as
//     `long tone` deals them: D.longNotes(D.notesFor('orch')) — each player·pitch once, with its cents, its seat and the take's dyn.
//   · Hear plays the generator's notes through D.playNotes — the remap of 1c.2b, the bends of 1c.4, the seat's curve channel of 1c.3.
//   · Insert writes the objects D.insert writes (a waveCurve per note, height = the anchor, cents as `morphBend`, a seat or a bent
//     note drawn, the rest `plain`) as ONE group `grp-seq-<id>` with one META bar, and the recipe into `databases.sequences`.
// Three wraps of the drawer, all from outside: `play` (SPACE, below) · its `bottom` / `maxHeight` styles while this strip is open, so
// the two sit one above the other · nothing else.
//
// SPACE GOES TO WHAT HE CLICKED LAST (his to reverse, §115). The strikes drawer's own capture listener owns SPACE whenever that
// drawer is open and calls D.play('orch'); the wrap below hands that to the sequence when THIS strip was clicked last. With the
// strikes drawer closed this file's own listener plays the sequence — and lets SPACE through to the score's transport once he has
// clicked the score. The lit `SPACE` in the head and the bright top border say which.
//
// ONE ROW = ONE SEQUENCE = ONE PLACE IN THE SCORE (his to reverse, §115). The row carries an id; two inserts of one row would double
// every note, so an insert always removes the earlier insert of that id first. `new` starts a fresh id.
//
// THE ROUND TRIP (PLAN 1d.3, RUNNING_LOG §116). `sequences in this score` lists the open score's `databases.sequences`; pick one and
// the recipe is back in the row — the boxes, the frozen chords, the seconds, the dyns, attack or seamless. A sequence that is IN the
// score is RE-INSERTED IN PLACE: its start is read from where its META bar sits NOW (a group he dragged is found where he left it),
// never from the recipe and never from the playhead; the old objects go, the new are written from that start, the recipe is updated
// under the same id. THE RECIPE IS THE TRUTH — notes moved or re-pitched by hand inside the group are overwritten, and the status
// counts them (the old group against what the SAVED recipe generates at that start). `move to playhead` is the one way Insert still
// moves a placed sequence. A sequence whose notes are gone from the score (an undo, a delete) stays in the list, marked, and Insert
// writes it at the playhead. NOT built, told him: reopening by clicking the META bar — that needs a hook in the score's canvas.
//
// THE ROLL (PLAN 1d.4, RUNNING_LOG §117). A `roll` line under the head carries the dials of time_containers.js — piece #5's module,
// the one the strikes drawer's `containers` shape uses, NOT changed — a pool (values · weights · unit), a total to fill, an order
// (stick · interrupt), a contour (+ turn · bow · depth), a seed, the presets sorted by spread. Its defaults are the module's own.
// `roll` lays the rolled durations out as a row of boxes; `re-roll` takes the next seed. `tilt` FILLS the weights box toward the long
// or the short values (weight ∝ value^k) — in the drawer only; a typed weight stands and puts the tilt back to the middle.
// A box with no chord is a REST: the recipe carries `chord: null` and the generator keeps every player silent through it.
// ROLLING OVER CHORDS KEEPS THEM, BY POSITION (mine, his to reverse — the plan said the row is replaced): a re-roll is a RE-TIMING,
// and losing seven chosen takes to try another seed would make the roll unusable. It asks first and says how many are kept or dropped.
// The recipe keeps the dials (`roll { … }`) once a row was rolled, so a reopened sequence shows how its durations were made and
// `re-roll` works on it; the containers are the truth — a typed-over duration is never re-derived. The breath dials are 1d.5.
//
// A BEND THAT MUST BE TAKEN BACK. D.playNotes sends a bend only for a note WITH cents, and a chord of the strikes drawer has one note
// a player, so nothing there ever needed re-centring. A sequence gives one player a just note and then a tempered one on the same
// channel; so a tempered note of a player who bends anywhere in the sequence leaves here with a millionth of a cent — the player then
// sends it the centre. Players who never bend are sent nothing, as before.
(function (root) {
'use strict';
const D = root.StrikeDrawer, SEQ = root.Sequence;
if (!D || !SEQ) { console.warn('[sequence_ui] needs the strikes drawer and sequence.js — one is not loaded'); return; }
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const LADDER = () => root.StrikeDyn || null;   // dyn_ui.js — the drawer's own ladder, the one the generator reads

const STORE = 'lgmf.sequenceDrawer.v1';
const TC = () => root.TimeContainers || null;   // time_containers.js — piece #5's roll, its own module, not changed
const ROW_H = 120;   // the boxes' row. The strip's own height is its content's — the roll line may wrap — and stripH() reads it back
const COLOR = '#5E9FB8', EDGE_ON = '#9fdcf5', EDGE_OFF = '#34525f';
const AS_DEALT = SEQ.AS_DEALT;
const DEF_DUR = 8, MIN_DUR = 0.1, MAX_DUR = 3600;   // 0.1: a rolled container on a small unit may be short
const RECENTRE = 1e-6;   // cents — rounds to the centre; see the head of this file
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const NAMES12 = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampDur = v => (isFinite(+v) && +v > 0) ? clamp(Math.round(+v * 1000) / 1000, MIN_DUR, MAX_DUR) : DEF_DUR;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtS = v => { const n = +v || 0; return (Math.round(n * 10) % 10 ? n.toFixed(1) : String(Math.round(n))); };
const pitchName = m => NAMES12[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const centsTxt = c => { const r = Math.round(+c || 0); return r ? (' ' + (r > 0 ? '+' : '−') + Math.abs(r) + '¢') : ''; };
const anchorOf = level => { const L = LADDER(), lo = L ? L.LO : 65, hi = L ? L.HI : 127; return Math.round(lo + (hi - lo) * clamp(+level || 0, 0, 1)); };
const yOf = level => Math.max(0.05, Math.round(clamp(+level || 0, 0, 1) * 100) / 10);   // the drawn height that MEANS the anchor (D.insert, 1c.2b)
const shortOf = lane => { const t = (D.tracks ? D.tracks() : [])[lane]; return (t && (t.short || t.label)) || ('L' + lane); };

const S = {
    el: null, row: null, sel: -1, hearFrom: 'start', active: false, _raf: 0, _painted: false, _listSig: null,

    // ------------------------------------------------------------------ the row being built (remembered in the browser)
    // the roll's dials start from time_containers.js's OWN defaults — the ones the strikes drawer's `containers` shape starts from
    rollDefaults() {
        const d = (TC() && TC().DEFAULTS) || {};
        return { preset: '', values: (d.values || [2, 5, 7, 15]).join(' '), weights: '', tilt: 0, unit: d.unit || 1, total: d.total || 60,
            stick: d.stick != null ? d.stick : 0.8, jump: d.jump != null ? d.jump : 0.1, contour: d.contour || 'flat',
            turn: d.turn != null ? d.turn : 0.5, bow: d.bow || 1, depth: d.depth != null ? d.depth : 1, seed: d.seed || 1 };
    },
    newRow() { return { id: 's' + Date.now().toString(36), name: '', change: 'attack', breath: Object.assign({}, SEQ.DEFAULT_BREATH), boxes: [], roll: this.rollDefaults(), rolled: false }; },
    newBox() { return { take: '', dur: DEF_DUR, dyn: AS_DEALT, chord: [], frozen: '' }; },
    save() { try { localStorage.setItem(STORE, JSON.stringify({ row: this.row, sel: this.sel, hearFrom: this.hearFrom, rollOpen: !!this.rollOpen })); } catch (e) {} },
    restore() {
        let st = null; try { st = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { st = null; }
        const r = st && st.row;
        if (r && typeof r.id === 'string' && Array.isArray(r.boxes)) {
            this.row = { id: r.id, name: String(r.name || ''), change: SEQ.CHANGES.indexOf(r.change) >= 0 ? r.change : 'attack',
                breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}), roll: Object.assign(this.rollDefaults(), r.roll || {}), rolled: !!r.rolled,
                boxes: r.boxes.map(b => ({ take: String((b && b.take) || ''), dur: clampDur(b && b.dur), dyn: this.dynOk(b && b.dyn), chord: Array.isArray(b && b.chord) ? b.chord : [], frozen: String((b && b.frozen) || '') })) };
            this.sel = Number.isInteger(st.sel) && st.sel >= 0 && st.sel < this.row.boxes.length ? st.sel : (this.row.boxes.length ? 0 : -1);
            this.hearFrom = st.hearFrom === 'box' ? 'box' : 'start'; this.rollOpen = !!st.rollOpen;
        } else { this.row = this.newRow(); this.sel = -1; }
    },
    dynOk(d) { const L = LADDER(); return (L && L.NAMES.indexOf(d) >= 0) ? d : AS_DEALT; },
    isOpen() { return !!this.el && this.el.style.display !== 'none'; },
    players(chord) { const s = {}; (chord || []).forEach(n => { s[n.lane + ':' + (n.seat || 0)] = 1; }); return Object.keys(s).length; },
    total() { return this.row.boxes.reduce((a, b) => a + (+b.dur || 0), 0); },

    // ------------------------------------------------------------------ build
    build() {
        const sb = document.getElementById('strikesBtn');
        if (sb && !document.getElementById('sequenceBtn')) {
            const btn = document.createElement('button');
            btn.id = 'sequenceBtn'; btn.textContent = 'Sequence';
            btn.title = 'the SEQUENCE drawer (docs/SEQUENCE_TOOL.md): saved takes from the strikes drawer held as sustained chords, each for a duration, in a row of time containers — hear it, put it in the score';
            btn.addEventListener('click', () => this.toggle());
            sb.parentNode.insertBefore(btn, sb.nextSibling);
        }
        const d = document.createElement('div');
        d.id = 'sequenceDrawer'; d.tabIndex = -1;
        d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9001;background:#181c20;border-top:2px solid ' + EDGE_OFF + ';' +
            'color:#ddd;font:11px/1.4 system-ui,sans-serif;display:none;box-shadow:0 -6px 24px rgba(0,0,0,.55);overflow:hidden;flex-direction:column;outline:none';
        const L = LADDER();
        d.innerHTML =
            '<div id="sqHead" style="display:flex;gap:8px;align-items:center;padding:4px 8px;white-space:nowrap;overflow:hidden;border-bottom:1px solid #2c3238">' +
              '<b style="color:' + COLOR + ';letter-spacing:.08em">SEQUENCE</b>' +
              '<input id="sqName" type="text" placeholder="name" maxlength="48" style="width:120px;' + INP + '" title="a name for this sequence — it goes into the score file with the recipe">' +
              '<select id="sqList" style="max-width:200px;' + INP + '" title="the sequences placed in the open score (its databases.sequences) — pick one and it comes back as it was: the boxes, the frozen chords, the seconds, the dyns, attack or seamless. Change anything, then re-insert: it is replaced IN PLACE"></select>' +
              '<label title="how a new chord is taken — attack: everyone starts AT the line, together · seamless: each player takes the new chord at its next breath">change <select id="sqChange" style="' + INP + '">' + SEQ.CHANGES.map(c => '<option value="' + c + '">' + c + '</option>').join('') + '</select></label>' +
              '<button id="sqAdd" style="' + BTN + '" title="add a container at the end of the row">+ container</button>' +
              '<button id="sqRollTog" style="' + BTN + ';color:#e8a06a" title="the ROLL: a set of time containers rolled from a pool of numbers — it lays out the row\'s durations for you">roll</button>' +
              '<span style="width:1px;height:16px;background:#3a4148"></span>' +
              '<label title="what SPACE and Hear play — the whole sequence, or from the selected box on">hear <select id="sqFrom" style="' + INP + '"><option value="start">from the start</option><option value="box">from the box</option></select></label>' +
              '<button id="sqHear" style="' + BTN + '" title="play the sequence through the strikes drawer\'s own player — the same levels, the same bends (SPACE)">Hear</button>' +
              '<button id="sqStop" style="' + BTN + '">Stop</button>' +
              '<button id="sqInsert" style="' + BTN + '">Insert @ playhead</button>' +
              '<button id="sqMove" style="' + BTN + ';display:none" title="move this sequence to the playhead — the notes where it sits now are removed and it is written again from the playhead">move to playhead</button>' +
              '<button id="sqNew" style="' + BTN + '" title="start a fresh sequence — the row is cleared; a sequence already in the score stays there">new</button>' +
              '<span id="sqSpace" title="SPACE goes to what you clicked last — this strip, the strikes drawer, or the score" style="padding:0 5px;border:1px solid #444;border-radius:3px;font-size:10px;letter-spacing:.08em">SPACE</span>' +
              '<span id="sqTotal" style="color:#9ab"></span>' +
              '<span style="flex:1"></span>' +
              '<button id="sqClose" style="' + BTN + '" title="close the sequence drawer (the row is kept)">&times;</button>' +
            '</div>' +
            '<div id="sqRoll" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="sqStatus" style="padding:1px 8px;height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9a9"></div>' +   // a line of its own: the head is full at 1280 px and the status is what tells him what happened
            '<div id="sqRowWrap" style="flex:none;height:' + ROW_H + 'px;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;padding:6px 8px">' +
              '<div id="sqRow" style="position:relative;display:flex;gap:3px;height:100%;min-width:100%"></div>' +
            '</div>' +
            '<div id="sqEdit" style="display:flex;gap:8px;align-items:center;padding:4px 8px;border-top:1px solid #2c3238;white-space:nowrap;min-height:26px;overflow:hidden"></div>';
        document.body.appendChild(d);
        this.el = d;
        const q = s => d.querySelector(s);
        q('#sqName').addEventListener('change', e => { this.row.name = e.target.value.trim(); this.save(); });
        q('#sqName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        q('#sqChange').addEventListener('change', e => { this.row.change = SEQ.CHANGES.indexOf(e.target.value) >= 0 ? e.target.value : 'attack'; this.save(); e.target.blur(); this.setStatus('change: ' + this.row.change + (this.row.change === 'attack' ? ' — everyone starts at the line, together' : ' — each player takes the new chord at its next breath')); });
        q('#sqFrom').addEventListener('change', e => { this.hearFrom = e.target.value === 'box' ? 'box' : 'start'; this.save(); e.target.blur(); });
        q('#sqAdd').addEventListener('click', () => this.addBox());
        q('#sqRollTog').addEventListener('click', () => { this.rollOpen = !this.rollOpen; this.save(); this.paintRoll(); this.fitStrikes(); });
        this.buildRoll();
        window.addEventListener('resize', () => { if (this.isOpen()) this.fitStrikes(); });   // the roll line wraps with the width, and the strikes drawer stands on the strip
        q('#sqHear').addEventListener('click', () => this.hear());
        q('#sqStop').addEventListener('click', () => this.stop());
        q('#sqInsert').addEventListener('click', () => this.insert(false));
        q('#sqMove').addEventListener('click', () => this.insert(true));
        q('#sqList').addEventListener('change', e => { const id = e.target.value; e.target.blur(); if (id) this.reopen(id); else { this._listSig = ''; this.renderList(); } });
        q('#sqNew').addEventListener('click', () => this.startNew());
        q('#sqClose').addEventListener('click', () => this.toggle(false));
        if (!L) this.setStatus('dyn_ui.js is not loaded — a box can only be "as dealt"', true);

        const tab = document.createElement('div');
        tab.id = 'sequenceTab'; tab.textContent = 'SEQUENCE ▴'; tab.title = 'open the sequence drawer';
        tab.style.cssText = 'position:fixed;right:118px;bottom:0;z-index:8999;background:#16323d;color:#bfe6f5;border:1px solid ' + COLOR + ';border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:12px system-ui,sans-serif;letter-spacing:.06em';
        tab.addEventListener('click', () => this.toggle(true));
        document.body.appendChild(tab);

        // SPACE goes to what he clicked last: this strip, or anything else
        document.addEventListener('pointerdown', ev => {
            const inside = !!(this.el && this.el.contains(ev.target));
            this.setActive(inside);
            if (inside) { this.renderList(); this.paintInsert(); }   // 1d.3: the score may have changed under the strip (a drag, an undo, another score opened)
        }, true);
        // with the strikes drawer CLOSED its listener is silent, so SPACE is answered here — and only while this strip was clicked last
        window.addEventListener('keydown', ev => {
            if (ev.code !== 'Space' || !this.isOpen() || !this.active) return;
            if (D.el && D.el.style.display !== 'none') return;   // the strikes drawer is open: its own listener has the key and calls D.play — wrapped below
            const t = ev.target, m = s => !!(t && t.matches && t.matches(s));
            if (m('textarea, input[type=text], input[type=number], input[type=search], input:not([type])')) return;
            if (m('select, button')) t.blur();
            ev.preventDefault(); ev.stopPropagation();
            const e = E_(); if (e && e._playing) this.stop(); else this.hear();
        }, true);
    },

    toggle(force) {
        const show = force != null ? !!force : !this.isOpen();
        this.el.style.display = show ? 'flex' : 'none';
        const b = document.getElementById('sequenceBtn');
        if (b) { b.style.background = show ? '#16323d' : ''; b.style.color = show ? '#bfe6f5' : ''; }
        const tab = document.getElementById('sequenceTab'); if (tab) tab.style.display = show ? 'none' : '';
        if (show) this.paintRoll();   // before the fit: the roll line is part of the strip's height
        this.fitStrikes();
        if (!show) { this.setActive(false); this.stop(); return; }
        this.setActive(true);
        this.render();
        if (D.refreshTakes) D.refreshTakes().then(() => this.renderEdit()).catch(() => {});
    },
    // the two drawers one above the other: while this strip is open the strikes drawer stands ON it (styles only — its code is not touched)
    stripH() { return this.isOpen() ? Math.round(this.el.getBoundingClientRect().height) : 0; },
    fitStrikes() {
        const open = this.isOpen(), STRIP_H = this.stripH();
        if (D.el) {
            D.el.style.bottom = open ? STRIP_H + 'px' : '0';
            D.el.style.maxHeight = open ? 'calc(100vh - ' + STRIP_H + 'px)' : '';
            if (D.el.style.display !== 'none' && typeof D.render === 'function') { try { D.render(); } catch (e) {} }
        }
        const tab = document.getElementById('strikesTab'); if (tab) tab.style.bottom = open ? STRIP_H + 'px' : '0';
    },
    setActive(on) {
        on = !!on && this.isOpen();
        if (on === this.active && this._painted) return;
        this.active = on; this._painted = true;
        if (!this.el) return;
        this.el.style.borderTopColor = on ? EDGE_ON : EDGE_OFF;
        const sp = this.el.querySelector('#sqSpace');
        if (sp) { sp.style.color = on ? '#0e1a20' : '#667'; sp.style.background = on ? EDGE_ON : 'transparent'; sp.style.borderColor = on ? EDGE_ON : '#444'; }
    },
    setStatus(msg, bad) { const s = this.el && this.el.querySelector('#sqStatus'); if (!s) return; s.textContent = msg; s.title = msg; s.style.color = bad ? '#e88' : '#9a9'; },

    // ------------------------------------------------------------------ the row
    render() {
        if (!this.el) return;
        const q = s => this.el.querySelector(s);
        if (document.activeElement !== q('#sqName')) q('#sqName').value = this.row.name || '';
        q('#sqChange').value = this.row.change; q('#sqFrom').value = this.hearFrom;
        const n = this.row.boxes.length;
        q('#sqTotal').textContent = n ? (n + ' box' + (n > 1 ? 'es' : '') + ' · ' + fmtS(this.total()) + ' s') : '';
        this.renderRow(); this.renderEdit(); this.renderList(); this.paintInsert(); this.paintRoll();
    },

    // ------------------------------------------------------------------ the sequences in the open score — the round trip (1d.3)
    dbList() { const C = C_(), L = C && C.databases && C.databases.sequences; return Array.isArray(L) ? L.filter(x => x && x.id && x.recipe) : []; },
    entryOf(id) { return this.dbList().find(x => x.id === id) || null; },
    // where a sequence sits NOW: its META bar's start — a group he dragged moves with its bar. With no bar left, the recipe's own
    // start. null = none of its objects are in the score
    placedAt(id) {
        const C = C_(); if (!C || !Array.isArray(C.objects)) return null;
        const group = 'grp-seq-' + id, ML = METAL(); let bar = null, any = false;
        C.objects.forEach(o => { if (o.groupId !== group) return; any = true; if (o.layer === ML && o.sonifyNote == null && isFinite(+o.startSeconds) && (bar == null || +o.startSeconds < bar)) bar = +o.startSeconds; });
        if (!any) return null;
        if (bar != null) return +bar.toFixed(3);
        const e = this.entryOf(id); return e ? +(+e.recipe.t0 || 0).toFixed(3) : null;
    },
    coreOf(r) { return JSON.stringify({ change: r.change, breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}), containers: (r.containers || []).map(c => ({ dur: +c.dur, dyn: c.dyn == null ? AS_DEALT : c.dyn, take: c.take || '', chord: c.chord || [] })) }); },
    // the row holds something the score does not: boxes never inserted, or changed since
    isDirty() { if (!this.row.boxes.length) return false; const e = this.entryOf(this.row.id); return !e || this.coreOf(e.recipe) !== this.coreOf(this.recipe(0)); },
    renderList() {
        const sel = this.el && this.el.querySelector('#sqList'); if (!sel) return;
        const L = this.dbList(), at = {}; L.forEach(e => { at[e.id] = this.placedAt(e.id); });
        const sig = L.map(e => [e.id, e.name, at[e.id], (e.recipe.containers || []).length, e.inserted].join('|')).join('\n') + '\n@' + this.row.id;
        if (sig === this._listSig) return;   // untouched while nothing changed, so an open pull-down is never rebuilt under his hand
        this._listSig = sig;
        sel.innerHTML = '<option value="">sequences in this score (' + L.length + ')</option>' + L.map(e => {
            const cs = e.recipe.containers || [], tot = cs.reduce((a, c) => a + (+c.dur || 0), 0);
            return '<option value="' + esc(e.id) + '">' + esc(e.name || e.id) + ' · ' + cs.length + ' box' + (cs.length === 1 ? '' : 'es') + ' · ' + fmtS(tot) + ' s · ' + (at[e.id] == null ? 'NOT in the score' : '@ ' + at[e.id].toFixed(1) + ' s') + '</option>';
        }).join('');
        sel.value = L.some(e => e.id === this.row.id) ? this.row.id : '';
    },
    paintInsert() {
        const b = this.el && this.el.querySelector('#sqInsert'), mv = this.el && this.el.querySelector('#sqMove'); if (!b) return;
        const at = this.placedAt(this.row.id);
        b.textContent = at == null ? 'Insert @ playhead' : 'Re-insert in place @ ' + at.toFixed(2) + ' s';
        b.title = at == null
            ? 'write the sequence at the playhead — one group, one META bar over the span — and its recipe into the score file'
            : 'this sequence is in the score at ' + at.toFixed(3) + ' s (read from its META bar, so a group you dragged is found where you left it). Its notes are REPLACED IN PLACE from that start and the recipe updated. The recipe is the truth: notes changed by hand inside the group are overwritten';
        if (mv) mv.style.display = at == null ? 'none' : '';
    },
    reopen(id) {
        const e = this.entryOf(id); if (!e) { this._listSig = ''; this.renderList(); return; }
        if (this.isDirty() && !window.confirm('Reopen "' + (e.name || id) + '"?\n\nThe row in the drawer holds changes that are not in the score — they will be lost.')) { this._listSig = ''; this.renderList(); return; }
        this.stop();
        const R = e.recipe;
        this.row = { id: e.id, name: (e.name && e.name !== 'sequence ' + e.id) ? String(e.name) : '', change: SEQ.CHANGES.indexOf(R.change) >= 0 ? R.change : 'attack',
            breath: Object.assign({}, SEQ.DEFAULT_BREATH, R.breath || {}), roll: Object.assign(this.rollDefaults(), R.roll || {}), rolled: !!R.roll,
            boxes: (R.containers || []).map(c => ({ take: String(c.take || ''), dur: clampDur(c.dur), dyn: this.dynOk(c.dyn), chord: JSON.parse(JSON.stringify(c.chord || [])), frozen: '' })) };
        this.sel = this.row.boxes.length ? 0 : -1;
        if (this.row.rolled) this.rollOpen = true;   // a rolled sequence shows how its durations were made
        this.save(); this._listSig = ''; this.render(); this.fitStrikes();
        const at = this.placedAt(id), was = +(+R.t0 || 0).toFixed(3), n = this.row.boxes.length;
        this.setStatus('reopened "' + (e.name || id) + '" · ' + n + ' box' + (n === 1 ? '' : 'es') + ' · ' +
            (at == null ? 'its notes are no longer in the score — Insert writes it at the playhead'
                : 'it sits at ' + at.toFixed(3) + ' s' + (Math.abs(at - was) > 0.002 ? ' (moved in the score — the recipe said ' + was.toFixed(3) + ' s)' : '') + ' — change anything, then re-insert in place'));
    },
    // how many of the old group's notes are not where the SAVED recipe puts them — moved, stretched or re-pitched by hand — and how
    // many the recipe expects that are gone
    handEdits(entry, start, oldNotes) {
        try {
            const want = SEQ.generate(Object.assign({}, entry.recipe, { t0: start })).notes.map(n => ({ lane: n.lane, midi: n.midi, s: n.start, e: n.end, used: false }));
            let edited = 0;
            oldNotes.forEach(o => {
                const w = want.find(x => !x.used && x.lane === o.layer && x.midi === o.sonifyNote && Math.abs(x.s - (+o.startSeconds)) < 0.01 && Math.abs(x.e - (+o.endSeconds)) < 0.01);
                if (w) w.used = true; else edited++;
            });
            return { edited: edited, missing: want.filter(x => !x.used).length };
        } catch (e) { return null; }
    },
    renderRow() {
        const row = this.el.querySelector('#sqRow'); row.innerHTML = '';
        if (!this.row.boxes.length) {
            const hint = document.createElement('div');
            hint.style.cssText = 'color:#778;align-self:center;padding:0 8px';
            hint.textContent = 'an empty row — "+ container" adds a box; click a box to give it a take, its seconds and its dyn';
            row.appendChild(hint);
        }
        this.row.boxes.forEach((b, i) => {
            const on = i === this.sel, empty = !b.chord.length, np = this.players(b.chord);
            const d = document.createElement('div');
            d.className = 'sqBox'; d.dataset.i = i;
            d.style.cssText = 'flex:' + Math.max(0.1, +b.dur || 0) + ' 1 0;min-width:96px;box-sizing:border-box;padding:3px 6px;border-radius:4px;cursor:pointer;overflow:hidden;' +
                // 1d.4: a box with no chord is a REST — deliberate, so it is drawn quiet (dashed, dim), not as a fault
                'background:' + (on ? '#22404d' : (empty ? '#191d21' : '#20262c')) + ';border:1px ' + (empty ? 'dashed ' : 'solid ') + (on ? EDGE_ON : (empty ? '#56606a' : '#3a4650')) + ';display:flex;flex-direction:column;justify-content:center;white-space:nowrap';
            d.title = empty ? 'a REST — silence for its duration: every player stops at its start and begins again after it. Choose a take to give it a chord' : this.chordText(b.chord);
            d.innerHTML = '<div style="color:#789;font-size:10px">' + (i + 1) + '</div>' +
                '<div style="overflow:hidden;text-overflow:ellipsis;color:' + (empty ? '#7d8790' : '#e6eef2') + (empty ? ';font-style:italic' : '') + '">' + esc(b.take || 'rest') + '</div>' +
                '<div style="color:#9ab">' + fmtS(b.dur) + ' s' + (empty ? '' : ' · ' + esc(b.dyn)) + '</div>' +
                '<div style="color:' + (empty ? '#7d8790' : '#7a9') + ';font-size:10px">' + (empty ? 'silence' : (np + ' player' + (np === 1 ? '' : 's') + (b.chord.length > np ? ' · ' + b.chord.length + ' notes' : ''))) + '</div>';
            d.addEventListener('click', () => { this.sel = i; this.save(); this.render(); });
            row.appendChild(d);
        });
        const line = document.createElement('div');
        line.id = 'sqLine'; line.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#fff;opacity:.85;display:none;pointer-events:none';
        row.appendChild(line);
    },
    chordText(chord) { return (chord || []).map(n => shortOf(n.lane) + (n.seat ? '²' : '') + ' ' + pitchName(n.midi) + centsTxt(n.cents)).join(' · '); },
    renderEdit() {
        const ed = this.el && this.el.querySelector('#sqEdit'); if (!ed) return;
        const i = this.sel, b = this.row.boxes[i];
        if (!b) { ed.innerHTML = '<span style="color:#778">no box selected</span>'; return; }
        const names = D.takeNames ? D.takeNames() : [];
        const L = LADDER(), dyns = [AS_DEALT].concat(L ? L.NAMES : []);
        const missing = b.take && names.indexOf(b.take) < 0;
        ed.innerHTML =
            '<b style="color:' + COLOR + '">box ' + (i + 1) + '</b>' +
            '<label title="a saved take of the strikes drawer. Choosing one LOADS it in the strikes drawer, so you see it — whatever is undealt there is replaced (save it as a take first) — and the box freezes its notes as `long tone` deals them">take <select id="sqTake" style="max-width:220px;' + INP + '"><option value="">— choose —</option>' +
                (missing ? '<option value="' + esc(b.take) + '">' + esc(b.take) + ' (not in the list)</option>' : '') +
                names.map(nm => '<option value="' + esc(nm) + '">' + esc(nm) + '</option>').join('') + '</select></label>' +
            '<label><input id="sqDur" type="number" min="' + MIN_DUR + '" max="' + MAX_DUR + '" step="0.5" style="width:56px;' + INP + '"> s</label>' +
            '<label title="as dealt: each note keeps the level the take was saved at · ppp … fff: the whole box at that dynamic, on the drawer\'s own written scale">dyn <select id="sqDyn" style="' + INP + '">' + dyns.map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('') + '</select></label>' +
            '<button id="sqRefresh" style="' + BTN + '" title="read the take again — the box holds the notes as they were when it was chosen">refresh from take</button>' +
            '<button id="sqLeft" style="' + BTN + '" title="move this box earlier">◂</button><button id="sqRight" style="' + BTN + '" title="move this box later">▸</button>' +
            '<button id="sqDel" style="' + BTN + '" title="remove this box">×</button>' +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:#9ab" title="' + esc(this.chordText(b.chord)) + '">' + esc(b.chord.length ? this.chordText(b.chord) : 'a REST — silence for its ' + fmtS(b.dur) + ' s; choose a take to give it a chord') + '</span>';
        const q = s => ed.querySelector(s);
        q('#sqTake').value = b.take || ''; q('#sqDur').value = b.dur; q('#sqDyn').value = b.dyn;
        q('#sqTake').addEventListener('change', e => { e.target.blur(); this.freeze(i, e.target.value); });
        q('#sqDur').addEventListener('change', e => { b.dur = clampDur(e.target.value); e.target.blur(); this.save(); this.render(); });
        q('#sqDur').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        q('#sqDyn').addEventListener('change', e => { b.dyn = this.dynOk(e.target.value); e.target.blur(); this.save(); this.render(); });
        q('#sqRefresh').addEventListener('click', () => { if (b.take) this.freeze(i, b.take); else this.setStatus('box ' + (i + 1) + ' has no take to refresh from', true); });
        q('#sqLeft').addEventListener('click', () => this.moveBox(i, -1));
        q('#sqRight').addEventListener('click', () => this.moveBox(i, 1));
        q('#sqDel').addEventListener('click', () => this.removeBox(i));
    },
    addBox() { this.row.boxes.push(this.newBox()); this.sel = this.row.boxes.length - 1; this.save(); this.render(); this.setStatus('box ' + (this.sel + 1) + ' added — choose its take (a box left without one is a REST)'); },
    removeBox(i) { if (!this.row.boxes[i]) return; this.row.boxes.splice(i, 1); this.sel = Math.min(i, this.row.boxes.length - 1); this.save(); this.render(); },
    moveBox(i, by) { const j = i + by, B = this.row.boxes; if (!B[i] || j < 0 || j >= B.length) return; const t = B[i]; B[i] = B[j]; B[j] = t; this.sel = j; this.save(); this.render(); },
    startNew() {
        if (this.row.boxes.length && !window.confirm('Start a new sequence?\n\nThe row in the drawer is cleared. A sequence already inserted stays in the score.')) return;
        this.stop(); this.row = this.newRow(); this.sel = -1; this.save(); this.render(); this.setStatus('a new sequence — "+ container" to begin');
    },

    // ------------------------------------------------------------------ the roll (1d.4): time_containers.js's dials, the strikes drawer's habit
    buildRoll() {
        const line = this.el.querySelector('#sqRoll'), T = TC(); if (!line) return;
        if (!T) { line.innerHTML = '<span style="color:#e88">time_containers.js is not loaded — no roll</span>'; return; }
        const lab = 'color:#8a8';
        line.innerHTML = '<span style="color:#e8a06a">roll</span>' +
            '<select id="sqRPre" style="' + INP + ';max-width:170px" title="a starting point, sorted by SPREAD (largest ÷ smallest) — the spread is what you hear. Picking one fills the boxes; it is not a mode."><option value="">preset…</option>' +
                T.PRESETS.map(p => '<option value="' + esc(p.key) + '" title="' + esc(p.note) + '">' + T.spreadOf(p.values) + '× · ' + esc(p.label) + ' — ' + p.values.join(' ') + '</option>').join('') + '</select>' +
            '<input id="sqRVals" type="text" style="' + INP + ';width:110px" title="the numbers, separated by spaces">' +
            '<input id="sqRW" type="text" style="' + INP + ';width:110px" placeholder="weights" title="one weight per number, or blank. 20 or 20% or 0.2 all mean a fifth; a dash or a gap means “share what is left”. Typing here puts the tilt back to the middle — a typed weight stands.">' +
            '<label style="' + lab + '" title="weight the short values or the long ones: FILLS the weights box (weight ∝ value^k). The middle = no weights.">tilt short <input id="sqRTilt" type="range" min="-3" max="3" step="0.25" style="width:72px;vertical-align:middle"> long</label>' +
            '<label style="' + lab + '" title="seconds per unit — one number rescales the whole set">× <input id="sqRUnit" type="number" step="0.05" min="0.01" style="' + INP + ';width:48px"> s</label>' +
            '<label style="' + lab + '" title="the span the roll fills; it stops short and says by how much">fill <input id="sqRTot" type="number" step="1" min="1" style="' + INP + ';width:52px"> s</label>' +
            '<label style="' + lab + '" title="how much the next container stays near the last — the periodicity">stick <input id="sqRStick" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:44px"></label>' +
            '<label style="' + lab + '" title="how often it deliberately leaps far — the interruption">interrupt <input id="sqRJump" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:44px"></label>' +
            '<select id="sqRContour" style="' + INP + '" title="the accordion: the size the roll is pulled toward across the span">' + T.CONTOURS.map(c => '<option value="' + c[0] + '">' + esc(c[1]) + '</option>').join('') + '</select>' +
            '<span id="sqRShape" style="display:none;gap:4px;align-items:center">' +
                '<label style="' + lab + '" title="where the reversal sits — the asymmetry">turn <input id="sqRTurn" type="number" step="0.05" min="0.02" max="0.98" style="' + INP + ';width:44px"></label>' +
                '<label style="' + lab + '" title="broad (below 1) or sharp (above 1) at the turn">bow <input id="sqRBow" type="number" step="0.1" min="0.1" max="4" style="' + INP + ';width:44px"></label>' +
                '<label style="' + lab + '" title="how hard the contour pulls">depth <input id="sqRDepth" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:44px"></label>' +
            '</span>' +
            '<label style="' + lab + '" title="the same seed rolls the same set">seed <input id="sqRSeed" type="number" step="1" min="1" style="' + INP + ';width:48px"></label>' +
            '<button id="sqRGo" style="' + BTN + ';color:#e8a06a" title="roll with this seed — the durations become the row\'s boxes. Chords already in the row stay in their boxes, by position (it asks first)">roll</button>' +
            '<button id="sqRNext" style="' + BTN + '" title="the next seed, rolled">re-roll</button>';
        const q = s => line.querySelector(s);
        q('#sqRPre').addEventListener('change', e => {
            const p = T.PRESETS.find(x => x.key === e.target.value); e.target.blur(); if (!p) return;
            const c = this.row.roll; c.preset = p.key; c.values = p.values.join(' '); c.tilt = 0;
            c.weights = p.weights ? p.weights.map(w => (w == null ? '-' : Math.round(w * 100) + '%')).join(' ') : '';
            this.save(); this.paintRoll(); this.setStatus(p.label + ' — ' + p.note + ' · spread ' + T.spreadOf(p.values) + '× · press roll');
        });
        ['sqRVals', 'sqRW', 'sqRUnit', 'sqRTot', 'sqRStick', 'sqRJump', 'sqRContour', 'sqRTurn', 'sqRBow', 'sqRDepth', 'sqRSeed'].forEach(id => {
            q('#' + id).addEventListener('change', e => {
                const c = this.row.roll;
                c.values = q('#sqRVals').value;
                if (id === 'sqRW') { c.tilt = 0; c.weights = q('#sqRW').value; }   // a typed weight stands, and the tilt goes back to the middle
                else if (id === 'sqRVals' && c.tilt) this.applyTilt();             // new numbers under a tilt: the weights follow them
                c.unit = +q('#sqRUnit').value || 1; c.total = +q('#sqRTot').value || 60;
                c.stick = +q('#sqRStick').value; c.jump = +q('#sqRJump').value; c.contour = q('#sqRContour').value;
                c.turn = +q('#sqRTurn').value; c.bow = +q('#sqRBow').value; c.depth = +q('#sqRDepth').value;
                c.seed = Math.max(1, Math.round(+q('#sqRSeed').value || 1));
                if (id === 'sqRVals' || id === 'sqRW') c.preset = '';
                if (e.target.tagName === 'SELECT' || e.target.type === 'number') e.target.blur();
                this.save(); this.paintRoll(); if (id === 'sqRContour') this.fitStrikes();
            });
            if (id === 'sqRVals' || id === 'sqRW') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
        q('#sqRTilt').addEventListener('input', e => { this.row.roll.tilt = +e.target.value || 0; this.applyTilt(); this.paintRoll(); });
        q('#sqRTilt').addEventListener('change', e => { e.target.blur(); this.save(); const k = this.row.roll.tilt; this.setStatus(k ? 'tilt ' + (k > 0 ? 'toward the LONG values' : 'toward the SHORT values') + ' (k ' + k + ') — weights ' + this.row.roll.weights : 'tilt off — no weights'); });
        q('#sqRGo').addEventListener('click', () => this.doRoll(false));
        q('#sqRNext').addEventListener('click', () => this.doRoll(true));
    },
    paintRoll() {
        const line = this.el && this.el.querySelector('#sqRoll'); if (!line) return;
        line.style.display = this.rollOpen ? 'flex' : 'none';
        const tog = this.el.querySelector('#sqRollTog'); if (tog) { tog.textContent = this.rollOpen ? 'roll ▾' : 'roll ▸'; tog.style.background = this.rollOpen ? '#3a2a18' : '#2a2a30'; }
        const c = this.row.roll, q = s => line.querySelector(s); if (!q('#sqRVals')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#sqRPre', c.preset || ''); put('#sqRVals', c.values); put('#sqRW', c.weights); put('#sqRTilt', c.tilt || 0);
        put('#sqRUnit', c.unit); put('#sqRTot', c.total); put('#sqRStick', c.stick); put('#sqRJump', c.jump); put('#sqRContour', c.contour);
        put('#sqRTurn', c.turn); put('#sqRBow', c.bow); put('#sqRDepth', c.depth); put('#sqRSeed', c.seed);
        q('#sqRShape').style.display = c.contour && c.contour !== 'flat' ? 'inline-flex' : 'none';
    },
    // the dials as time_containers.js takes them — the weights read exactly as containers_ui.js reads them (20 · 20% · 0.2 · a dash)
    rollOpts() {
        const c = this.row.roll;
        const nums = String(c.values || '').split(/[\s,]+/).map(Number).filter(x => isFinite(x) && x > 0);
        const wRaw = String(c.weights || '').split(/[\s,]+/).filter(x => x !== '');
        const weights = wRaw.length ? nums.map((v, i) => {
            const t = wRaw[i]; if (t == null || t === '-' || t === '') return null;
            const n = parseFloat(String(t).replace('%', '')); if (!isFinite(n)) return null;
            return String(t).indexOf('%') >= 0 || n > 1 ? n / 100 : n;
        }) : null;
        return { values: nums, weights: weights, unit: +c.unit || 1, total: +c.total || 60, stick: +c.stick, jump: +c.jump, contour: c.contour,
            turn: +c.turn, bow: +c.bow, depth: +c.depth, seed: Math.max(1, Math.round(+c.seed || 1)) };
    },
    // his "weight the higher ones or low ones": weight ∝ value^k, written INTO the weights box — the box stays the truth
    applyTilt() {
        const c = this.row.roll, k = +c.tilt || 0;
        const nums = String(c.values || '').split(/[\s,]+/).map(Number).filter(x => isFinite(x) && x > 0);
        if (!k || !nums.length) { c.weights = ''; return; }
        const w = nums.map(v => Math.pow(v, k)), sum = w.reduce((a, b) => a + b, 0);
        c.weights = w.map(x => (Math.round(x / sum * 1000) / 10) + '%').join(' ');
        c.preset = '';
    },
    doRoll(next) {
        const T = TC(); if (!T) { this.setStatus('time_containers.js is not loaded', true); return; }
        const c = this.row.roll; if (next) c.seed = Math.max(1, Math.round(+c.seed || 1)) + 1;
        const o = this.rollOpts(), r = T.roll(o);
        if (!r.seq.length) { this.save(); this.paintRoll(); this.setStatus('nothing rolled — ' + (r.why || 'no containers'), true); return; }
        const B = this.row.boxes, filled = B.filter(b => b.chord.length).length;
        if (filled) {
            const kept = B.slice(0, r.seq.length).filter(b => b.chord.length).length, dropped = filled - kept;
            if (!window.confirm('Roll over this row?\n\n' + B.length + ' box' + (B.length === 1 ? '' : 'es') + ' become ' + r.seq.length + ', with new durations.\nChords stay in their boxes by position: ' + kept + ' kept' + (dropped ? ', ' + dropped + ' DROPPED (beyond the new count).' : '.'))) {
                if (next) c.seed--; this.paintRoll(); return;
            }
        }
        this.stop();
        this.row.boxes = r.seq.map((s, i) => Object.assign(B[i] ? B[i] : this.newBox(), { dur: clampDur(s) }));
        this.row.rolled = true;
        this.sel = clamp(this.sel, 0, this.row.boxes.length - 1);
        this.save(); this.render();
        this.setStatus('rolled ' + r.count + ' · ' + fmtS(r.filled) + ' of ' + fmtS(o.total) + ' s' + (r.short > 0.001 ? ' · ' + fmtS(r.short) + ' s short' : '') + '  →  ' + r.units.join(' ') +
            ' · seed ' + o.seed + ' · spread ' + r.spread + '×' + (filled ? ' · chords kept by position' : ' · click each box and give it a take — a box left empty is a REST'));
    },

    // ------------------------------------------------------------------ a box takes its chord: the take, LOADED in the strikes drawer, as `long tone` deals it
    async freeze(i, name) {
        const b = this.row.boxes[i]; if (!b) return;
        if (!name) { b.take = ''; b.chord = []; b.frozen = ''; this.save(); this.render(); this.setStatus('box ' + (i + 1) + ' is a REST — silence for its ' + fmtS(b.dur) + ' s'); return; }
        try {
            if (!D.db && D.loadDb) await D.loadDb(false);
            if (!D.takeList || !D.takeList[name]) await D.refreshTakes();
            const t = D.takeList && D.takeList[name];
            if (!t) { this.setStatus('no take named "' + name + '" in bank/panel_snapshots.json', true); this.renderEdit(); return; }
            await D.loadTake(name);
            const want = t.state && t.state.strikeId;
            if (!D.strike || (want && D.strike.id !== want)) { this.setStatus('"' + name + '" could not be loaded in the strikes drawer — its harmony (' + want + ') was not found', true); this.renderEdit(); return; }
            const T = D.tracks(), L = LADDER(), lo = L ? L.LO : 65, hi = L ? L.HI : 127;
            const dealt = D.longNotes(D.notesFor('orch'));
            const chord = dealt.filter(n => Number.isInteger(n.lane) && n.lane >= 0 && T[n.lane] && isFinite(+n.midi)).map(n => {
                const vel = clamp(Math.round(+n.vel || lo), lo, hi);
                const o = { lane: n.lane, seat: n.seat || 0, inst: T[n.lane].instKey, tech: n.tech, midi: +n.midi, cents: +(+n.cents || 0).toFixed(2), level: +((vel - lo) / (hi - lo)).toFixed(4), vel: vel };
                if (n.partial != null) o.partial = n.partial;
                return o;
            });
            if (!chord.length) { this.setStatus('"' + name + '" dealt no notes — open the strikes drawer and look: nothing assigned, or every player busy at the playhead (PLAN 1t)', true); this.renderEdit(); return; }
            b.take = name; b.chord = chord; b.frozen = new Date().toISOString();
            this.save(); this.render();
            const np = this.players(chord);
            this.setStatus('box ' + (i + 1) + ' ← "' + name + '" · ' + np + ' player' + (np === 1 ? '' : 's') + ' frozen: ' + this.chordText(chord));
        } catch (e) { this.setStatus('take not read: ' + (e && e.message || e), true); this.renderEdit(); }
    },

    // ------------------------------------------------------------------ the recipe, and the notes derived from it
    recipe(t0) {
        const r = this.row;
        // 1d.4: a box with no chord is a REST (`chord: null`); a rolled row keeps the dials that made its durations (`roll`)
        return Object.assign({ t0: +t0 || 0, change: r.change, breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}),
            containers: r.boxes.map(b => ({ dur: +b.dur, dyn: b.dyn, take: b.take, chord: b.chord.length ? b.chord : null })) },
            r.rolled ? { roll: JSON.parse(JSON.stringify(r.roll)) } : {});
    },
    generate(t0) {
        if (!this.row.boxes.length) { this.setStatus('an empty row — "+ container" first', true); return null; }
        try { return SEQ.generate(this.recipe(t0)); }
        catch (e) { this.setStatus(String(e && e.message || e).replace(/^sequence: /, ''), true); return null; }
    },
    flagsText(G) { const c = {}; G.notes.forEach(n => (n.flags || []).forEach(f => { c[f] = (c[f] || 0) + 1; })); const k = Object.keys(c); return k.length ? ' · ' + k.map(f => c[f] + ' ' + f).join(' · ') : ''; },

    // what Hear plays: the generator's notes in the shape D.playNotes takes — from the start, or from the selected box on (a note
    // already sounding at that line is picked up there)
    hearNotes() {
        const G = this.generate(0); if (!G) return null;
        const from = (this.hearFrom === 'box' && this.sel > 0 && this.sel < G.bounds.length - 1) ? G.bounds[this.sel] : 0;
        const bends = {}; G.notes.forEach(n => { if (n.cents) bends[n.player] = 1; });
        const notes = [];
        G.notes.forEach(n => {
            if (n.end <= from + 0.02) return;
            const st = Math.max(n.start, from);
            notes.push({ lane: n.lane, tech: n.tech, midi: n.midi, seat: n.seat || 0, vel: anchorOf(n.level), onMs: Math.round((st - from) * 1000), durMs: Math.max(30, Math.round((n.end - st) * 1000)),
                cents: n.cents ? n.cents : (bends[n.player] ? RECENTRE : 0), partial: n.partial });
        });
        return { G: G, from: from, notes: notes };
    },
    async hear() {
        const H = this.hearNotes(); if (!H) return;
        if (!H.notes.length) { this.setStatus('nothing to hear', true); return; }
        const label = 'the sequence · ' + this.row.boxes.length + ' box' + (this.row.boxes.length > 1 ? 'es' : '') + ' · ' + fmtS(H.G.total - H.from) + ' s' + (H.from ? ' from box ' + (this.sel + 1) : '');
        await D.playNotes(H.notes, label);
        const e = E_();
        if (e && e._playing) { this.setStatus('hearing ' + label + ' · ' + H.notes.length + ' notes' + this.flagsText(H.G)); this.startLine(H); }
        else { const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); }
    },
    stop() { const e = E_(); if (e && e._playing) { e.panic(); if (D.onStopped) D.onStopped(); } this.stopLine(); },
    startLine(H) {
        this.stopLine();
        const tick = () => {
            const e = E_(), line = this.el && this.el.querySelector('#sqLine');
            if (!e || !e._playing || !line || !this.isOpen()) { this.stopLine(); return; }
            const t = H.from + (performance.now() - D.base) / 1000, B = H.G.bounds;
            if (t >= H.G.end) { this.stopLine(); return; }
            let i = 0; while (i < B.length - 2 && B[i + 1] <= t) i++;
            const box = this.el.querySelectorAll('.sqBox')[i];
            if (box && t >= 0) { const f = clamp((t - B[i]) / Math.max(0.001, B[i + 1] - B[i]), 0, 1); line.style.left = (box.offsetLeft + f * box.offsetWidth) + 'px'; line.style.display = 'block'; }
            this._raf = requestAnimationFrame(tick);
        };
        this._raf = requestAnimationFrame(tick);
    },
    stopLine() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; const line = this.el && this.el.querySelector('#sqLine'); if (line) line.style.display = 'none'; },

    // ------------------------------------------------------------------ Insert @ playhead: the objects D.insert writes, as ONE group, and the recipe into the score file
    // 1d.3: a sequence that is IN the score is replaced IN PLACE — from where its META bar sits now; `toPlayhead` (the `move to
    // playhead` button) is the one way a placed sequence still moves. A sequence not in the score is written at the playhead.
    insert(toPlayhead) {
        const C = C_(); if (!C || typeof C.getTimeAtPlayhead !== 'function') { this.setStatus('the composer is not reachable', true); return; }
        const id = this.row.id, group = 'grp-seq-' + id, ML = METAL(), name = this.row.name || ('sequence ' + id);
        const sits = this.placedAt(id), inPlace = sits != null && !toPlayhead;
        const t0 = inPlace ? sits : +C.getTimeAtPlayhead().toFixed(3);
        const G = this.generate(t0); if (!G) return;
        // the recipe is the truth: count what he changed by hand inside the group — the old notes against what the SAVED recipe generates there
        const saved = this.entryOf(id), oldNotes = C.objects.filter(o => o.groupId === group && o.sonifyNote != null);
        const he = (saved && sits != null && oldNotes.length) ? this.handEdits(saved, sits, oldNotes) : null;
        C.pushUndoState();
        const before = C.objects.length;
        C.objects = C.objects.filter(o => o.groupId !== group);   // one row = one place in the score: the old group's objects go, by their id
        const gone = before - C.objects.length;
        let maxEnd = G.end, written = 0; const busy = [];
        G.notes.forEach(n => {
            if (typeof C.trillCovers === 'function' && C.trillCovers(n.lane, n.start)) { busy.push(shortOf(n.lane) + '@' + n.start.toFixed(2)); return; }   // TRILLS_TOOL §7, as D.insert
            maxEnd = Math.max(maxEnd, n.end);
            const nodes = (n.levels && n.levels.length >= 2 ? n.levels : [[0, n.level], [n.dur, n.level]]).map(p => ({ pos: n.dur > 0 ? clamp(p[0] / n.dur, 0, 1) : 0, y: yOf(p[1]), smooth: 0.25 }));
            const segments = []; for (let k = 1; k < nodes.length; k++) segments.push({ model: 'power', slope: 0 });
            const box = this.row.boxes[n.container] || {};
            C.objects.push(Object.assign({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: group,
                startSeconds: n.start, endSeconds: n.end, nodes: nodes, segments: segments,
                color: COLOR, fillMode: 'bottom', opacity: 0.55, properties: {}, srcKind: 'sequence',
                performanceNotes: name + ' · box ' + (n.container + 1) + (box.take ? ' · ' + box.take : '') + (n.partial != null ? ' · partial ' + n.partial : '') + (n.cents ? ' · ' + (n.cents > 0 ? '+' : '') + Math.round(n.cents) + '¢ just' : ''),
                sonifyNote: n.midi, technique: n.tech, recVel: anchorOf(n.level) },
                (n.seat || n.cents) ? {} : { sonifyMode: 'plain' },   // 1c.3 / 1c.4, as D.insert: a seat's note or a bent note is DRAWN (its own curve channel), the rest hold MAIN
                n.cents ? { morphBend: [[0, +(+n.cents).toFixed(2)], [n.dur, +(+n.cents).toFixed(2)]] } : {}));
            written++;
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: group, startSeconds: t0, endSeconds: +maxEnd.toFixed(3),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: COLOR, fillMode: 'bottom', opacity: 0.6, srcKind: 'sequence',
            performanceNotes: name + ' · ' + this.row.boxes.length + ' boxes · ' + this.row.change + ' — a SEQUENCE: change it in the Sequence drawer and Insert again', properties: {} });
        // the recipe into the score file: the working copy and every named version carry it (collectData saves `databases` whole)
        if (!C.databases) C.databases = {};
        if (!Array.isArray(C.databases.sequences)) C.databases.sequences = [];
        const entry = { id: id, name: name, group: group, inserted: new Date().toISOString(), notes: written, recipe: JSON.parse(JSON.stringify(this.recipe(t0))) };
        const k = C.databases.sequences.findIndex(x => x && x.id === id);
        if (k >= 0) C.databases.sequences[k] = entry; else C.databases.sequences.push(entry);
        C.lastInsertGroup = group;
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        C.renderAll(); C.markDirty();
        this._listSig = ''; this.renderList(); this.paintInsert();
        const how = inPlace ? 're-inserted IN PLACE' : (sits != null ? 'MOVED to the playhead' : 'inserted');
        this.setStatus(how + ' · ' + written + ' notes · ' + t0.toFixed(3) + ' → ' + G.end.toFixed(3) + ' s as ' + group + ' · the recipe is in the score file' +
            (gone ? ' · replaced ' + gone + ' objects' + (sits != null && !inPlace ? ' at ' + sits.toFixed(3) + ' s' : '') : '') +
            (he && he.edited ? ' · ' + he.edited + ' note' + (he.edited === 1 ? '' : 's') + ' had been moved or re-pitched by hand — overwritten: the recipe is the truth' : '') +
            (he && he.missing > he.edited ? ' · ' + (he.missing - he.edited) + ' of its notes had been deleted — written again' : '') +   // a changed note is also a wanted note unmatched: count only the surplus
            this.flagsText(G) + (busy.length ? ' · ' + busy.length + ' skipped — trilling: ' + busy.join(' ') : ''));
    },
};

// ---------------------------------------------------------------- the one hook on what the drawer does: SPACE, when this strip was clicked last
const _play = D.play;
D.play = function (mode) {
    if (mode === 'orch' && S.isOpen() && S.active) return S.hear();
    return _play.apply(this, arguments);
};

function boot() { if (S.el) return; S.restore(); S.build(); S.render(); S.setActive(false); }
if (D.el) boot();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
else setTimeout(boot, 0);

root.SequenceDrawer = S;
}(typeof self !== 'undefined' ? self : this));
