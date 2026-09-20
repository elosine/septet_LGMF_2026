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
// `re-roll` works on it; the containers are the truth — a typed-over duration is never re-derived.
//
// THE BREATH (PLAN 1d.5, RUNNING_LOG §118). A `breath` line, built as the roll line is, carries the generator's own dials — they live
// in sequence.js and travel in the recipe (`breath { … }`), so a reopened sequence breathes as it was dealt: striation (the morph's
// five) · length ± jitter (the morph's 8 s ± 0.35) · `together` (BLANK = free, the morph's way · 0 never · 1 always) · `apart` ·
// `lengths`, a pool of values and weights · a seed with `re-breathe` (the next seed — the chords and the durations are not touched).
// Every change re-deals the row and says what came of it in the status: the notes, the starts snapped and kept apart, who leads.
//
// THE WAVES (PLAN 1d.7, RUNNING_LOG §128). A `waves` line — lengths · weights · low … high · density · peak · seed · `re-wave` · `all →
// waves | straight` — and `waves` in every box's dyn pull-down beside `as dealt` and ppp … fff (his swap, LG-39): a waves box reads its
// players' streams of swells, a straight box holds its dynamic, and the streams run on under both. A box remembers the straight dyn
// it had (`dynWas`), so stepping back out of the waves restores it.
//   SPACE CARRIES THE WAVE, AND THE STRIKES DRAWER'S PLAYER IS NOT CHANGED. D.playNotes cannot ramp — one CC7 a note, 30 ms before it,
//   the level in the velocity. So after it has scheduled the notes this file sends each waved note's CC7 ramp ITSELF: the same routes
//   (D.routeFor), the same timers (MorphEmit._timers — Stop and SPACE cut it), and THE SCORE'S OWN LAW — Composer.heldCc7 on a stand-in
//   note stamped `velRef` = the waves' `high`, which is exactly how the inserted note is played. One velocity under a moving fader,
//   the morph's way: a breath re-entering mid-wave does not lurch, and the vibraphone's register rides in the law by itself.
//   INSERT writes a waved note DRAWN (its level breakpoints as nodes, `velRef` = `high`); a straight note is written as it always was.
//
// THE EDGES, AND A CHANGE RULE PER BOX (PLAN 1d.8, RUNNING_LOG §131; his words LG-40 · LG-41 · LG-42). Every box's line has `enter
// [attack | seamless]` — how THAT box is entered; a box that differs from the sequence's rule wears a mark, and the head's `change` sets
// every box (it asks before it overwrites flipped ones). Box 1's `enter` IS the beginning: "start together, then seamless" is box 1
// flipped to `attack`. An `edges` line: `fade in [s] from [niente | ppp … fff]` · `fade out [s] to [niente | ppp … fff]` · `exit
// [together | one by one]`. The generator decides everything; this file only carries it: a note with a niente `fade` is written with
// the score's own `cc7Fade` (absolute score seconds — so a faded sequence DRAGGED in the score keeps its old windows until it is
// re-inserted), drawn, one velocity; Hear's ramp multiplies the same weight in, through the same Composer.heldCc7.
//
// TWO THINGS HE ASKED FOR FROM INSIDE IT (2026-09-19, RUNNING_LOG §119–§120). `count` on the roll line: the roll fills a SPAN and
// never said how many boxes come out. Blank, the box shows what the dials give now; a number FILLS the `×` box — the seconds per
// unit that makes that many fit the span, searched for THIS seed (so `re-roll` solves it again); a typed `×` clears it, as a typed
// weight clears the tilt. In the drawer only — time_containers.js is not changed. And a PREVIEW `▸` on every box that holds a
// chord: that box's frozen notes on their own, all together, PREVIEW_S seconds at the box's dyn, through D.playNotes.
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
const VR_ = () => (typeof VelocityRemap !== 'undefined' ? VelocityRemap : (root.VelocityRemap || null));   // 1e: the mf velocity per instrument
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const LADDER = () => root.StrikeDyn || null;   // dyn_ui.js — the drawer's own ladder, the one the generator reads
const DT_ = () => root.DynTable || null;       // dyn_table.js — 1d.10, the CC7 of a written dynamic on a given instrument

const STORE = 'lgmf.sequenceDrawer.v1';
// PLAN 1d.11 — THE LIBRARY. `localStorage` above is the INSTANT layer and stays exactly what it was; the DISK is the durable one,
// `bank/sequences.json`, a store of its own (never a panel in `panel_snapshots.json`, 3.1 MB of his takes rewritten whole on every
// save — an autosave every couple of seconds must not touch it). A row is ALWAYS on disk: unnamed under a timestamp in a rolling
// stack, named under its name — so `new` destroys nothing, and git can see what he made.
const LIB = { store: 'sequences', named: 'library', untitled: 'untitled', max: 50, debounce: 2000 };
const LIB_NAME_RE = /^[A-Za-z0-9._ -]{1,64}$/;   // score/snapshots.js's own rule, which refuses a colon — hence `14.32.05`
const TC = () => root.TimeContainers || null;   // time_containers.js — piece #5's roll, its own module, not changed
const ROW_H = 120;   // the boxes' row: its share of the window when nothing is saved. The row GROWS with the window now (floating, 2026-09-20)
const FS = 15;       // +4 at his word (2026-09-20). THE ONE NUMBER: every size in this strip is this or a proportion of it — change it and the whole strip scales.
                     // Every width, padding and small size below was laid out against 11px and is written in `em`, so it follows FS on its own.
const WIN = { W: 1180, H: 360, MINW: 560, MINH: 220, PAD: 12 };   // the floating window: its size when nothing is saved, and how small it may be dragged
const COLOR = '#5E9FB8', EDGE_ON = '#9fdcf5', EDGE_OFF = '#34525f';
const AS_DEALT = SEQ.AS_DEALT;
const DEF_DUR = 8, MIN_DUR = 0.1, MAX_DUR = 3600;   // 0.1: a rolled container on a small unit may be short
const RECENTRE = 1e-6;   // cents — rounds to the centre; see the head of this file
const WAVES = SEQ.WAVES;   // a box's dyn: read the waves (1d.7)
const RAMP_MS = 50, RAMP_LEAD_MS = 15;   // Hear's CC7 ramp: a point every 50 ms where the value changes; the first lands AFTER playNotes' own CC7 (30 ms before the note) and before the note-on
const WTINT = '#c8a2ff';
const PREVIEW_S = 5;     // a box's preview: its chord held this long (or the box's own seconds, if shorter) — under every ceiling
const NEW_BREATH = { together: 0.2, apart: 0.6 };   // a NEW sequence's `together` and `apart` (his call, 2026-09-20: "lets go with .2 for together" - RUNNING_LOG 133 · 134). THE DRAWER's default, not the generator's:
                            // SEQ.DEFAULT_BREATH.together stays null (free), so the 1d gate and every recipe already dealt are untouched. Blank in the box is still free.
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px';   // the size comes from the panel (FS) through #sqStyle — one number, not one per control
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;cursor:pointer';
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

// ---------------------------------------------------------------- PLAN 1e — THE DYNAMICS LAW (RUNNING_LOG 137-142; docs/DYNAMICS_LAW.md)
// His diagnosis, 2026-09-20: *"in the tuba piece and in the last piece, we always made crescendos from zero ... CC7 zero to CC7 max ...
// a normalized one."* A note whose volume is SHAPED used to be STRUCK at the velocity of its shape's TOP, with the fader then moving it
// only inside the written ladder's 12 dB — which is why every wave sounded "between two high dynamic levels" (his ear, twice; the
// measurement is RUNNING_LOG 140). Under 1e a shaped note is struck at MF and THE FADER CARRIES THE WHOLE SHAPE, 0 ... 127, its top at
// the full fader. The machinery is the score's own, per note, and piece #5 built it for this very reason (its 316 / 346 / 349):
// `cc7Abs` maps the drawn height straight onto a CC7 range, bypassing the ladder; `velAbs` pins the strike. NOTHING IN composer.html
// CHANGES — the fix is what the TOOL writes. A strike, a plain note, a long tone and a trill are untouched.
//
// AMENDED BY PLAN 1d.10, THE DYNAMICS TABLE (2026-09-20, LG-51). Under 1e above, only a shape's DEPTH was heard: `pp-mf` and
// `ppp-mp` are both three steps deep and both played about CC7 73 ... 127, so the range he sets could not be told by ear. HIS
// PRINCIPLE: a STATED dynamic range is what SOUNDS, for the whole curve — *"a curve going from MP to FF should go ... say 65 to
// 111 in CC7, not up to the full 127."* So the fader range is no longer 0 ... 127 for every shape: it is the two written
// dynamics' OWN CC7 values, read from `dyn_table.js` through the instrument's measured fader curve, 4 dB a written step. Rule 1
// (the mf strike, per pitch) is untouched, and so are the curve channels and `curveDirty()`.
const MF_ANCHOR = 100;                 // mf on the ladder (65 ... 127, eight names evenly) — the anchor every shaped note is struck at
const CC7_FULL = { lo: 0, hi: 127 };   // 1e's normalized fader — now only the fallback, for a page that did not load dyn_table.js

const S = {
    el: null, row: null, sel: -1, hearFrom: 'start', active: false, _raf: 0, _painted: false, _listSig: null, _previewing: -1, _pvT: 0,

    // ------------------------------------------------------------------ the row being built (remembered in the browser)
    // the roll's dials start from time_containers.js's OWN defaults — the ones the strikes drawer's `containers` shape starts from
    rollDefaults() {
        const d = (TC() && TC().DEFAULTS) || {};
        return { preset: '', values: (d.values || [2, 5, 7, 15]).join(' '), weights: '', tilt: 0, unit: d.unit || 1, total: d.total || 60, count: '',
            stick: d.stick != null ? d.stick : 0.8, jump: d.jump != null ? d.jump : 0.1, contour: d.contour || 'flat',
            turn: d.turn != null ? d.turn : 0.5, bow: d.bow || 1, depth: d.depth != null ? d.depth : 1, seed: d.seed || 1 };
    },
    wavesDefaults(over) { const w = Object.assign(JSON.parse(JSON.stringify(SEQ.DEFAULT_WAVES)), over || {}); w.lengths = JSON.parse(JSON.stringify(w.lengths || SEQ.DEFAULT_WAVES.lengths)); return w; },
    edgesDefaults(over) { const e = Object.assign({}, SEQ.DEFAULT_EDGES, over || {}); e.fadeIn = clamp(+e.fadeIn || 0, 0, 600); e.fadeOut = clamp(+e.fadeOut || 0, 0, 600); if (SEQ.EXITS.indexOf(e.exit) < 0) e.exit = SEQ.DEFAULT_EDGES.exit; e.fadeInFrom = this.farOk(e.fadeInFrom); e.fadeOutTo = this.farOk(e.fadeOutTo); return e; },
    farOk(d) { const L = LADDER(); return (L && L.NAMES.indexOf(d) >= 0) ? d : SEQ.NIENTE; },   // the far end of a fade: niente, or a name on the ladder
    changeOk(c) { return SEQ.CHANGES.indexOf(c) >= 0 ? c : null; },                              // a box's own `enter`; null = the sequence's rule
    newRow() { return { id: 's' + Date.now().toString(36), name: '', change: 'attack', breath: Object.assign({}, SEQ.DEFAULT_BREATH, NEW_BREATH), waves: this.wavesDefaults(), edges: this.edgesDefaults(), boxes: [], roll: this.rollDefaults(), rolled: false }; },
    newBox() { return { take: '', dur: DEF_DUR, dyn: AS_DEALT, dynWas: AS_DEALT, change: null, chord: [], frozen: '' }; },
    save(quiet) { try { localStorage.setItem(STORE, JSON.stringify({ row: this.row, sel: this.sel, hearFrom: this.hearFrom, win: this._win || null, rollOpen: !!this.rollOpen, breathOpen: !!this.breathOpen, wavesOpen: !!this.wavesOpen, edgesOpen: !!this.edgesOpen, libOpen: !!this.libOpen, libKey: this.libKey || null, libPanel: this.libPanel || null, kept: this.kept || null })); } catch (e) {} if (!quiet) { this.libTouch(); this.paintDot(); } },
    // one normalisation of a stored row, whichever store it came from — localStorage, the library on disk, or `revert`'s own copy
    rowFrom(r) {
        if (!(r && typeof r.id === 'string' && Array.isArray(r.boxes))) return this.newRow();
        return { id: r.id, name: String(r.name || ''), change: SEQ.CHANGES.indexOf(r.change) >= 0 ? r.change : 'attack',
            breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}), waves: this.wavesDefaults(r.waves), edges: this.edgesDefaults(r.edges), roll: Object.assign(this.rollDefaults(), r.roll || {}), rolled: !!r.rolled,
            boxes: r.boxes.map(b => ({ take: String((b && b.take) || ''), dur: clampDur(b && b.dur), dyn: this.dynOk(b && b.dyn), dynWas: this.straightOk(b && b.dynWas), change: this.changeOk(b && b.change), chord: Array.isArray(b && b.chord) ? b.chord : [], frozen: String((b && b.frozen) || '') })) };
    },
    restore() {
        let st = null; try { st = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { st = null; }
        const r = st && st.row;
        if (r && typeof r.id === 'string' && Array.isArray(r.boxes)) {
            this.row = this.rowFrom(r);
            this.sel = Number.isInteger(st.sel) && st.sel >= 0 && st.sel < this.row.boxes.length ? st.sel : (this.row.boxes.length ? 0 : -1);
            this.hearFrom = st.hearFrom === 'box' ? 'box' : 'start'; this.rollOpen = !!st.rollOpen; this.breathOpen = !!st.breathOpen; this.wavesOpen = !!st.wavesOpen; this.edgesOpen = !!st.edgesOpen;
            this.libOpen = !!st.libOpen;
            this.libKey = typeof st.libKey === 'string' ? st.libKey : null;                                  // 1d.11: which entry on disk this row IS
            this.libPanel = st.libPanel === LIB.named || st.libPanel === LIB.untitled ? st.libPanel : null;
            this.kept = (st.kept && st.kept.row) ? st.kept : null;                                           // the state at his last `save`
        } else { this.row = this.newRow(); this.sel = -1; }
    },
    // ------------------------------------------------------------------ THE LIBRARY (1d.11) — a sequence is a DOCUMENT
    // It has a name, it autosaves, many coexist, and they ride in the repo. Two states per name and never more (his: *"without
    // creating a cascade of new versions"*): the CURRENT one, autosaved, and `kept` — the state at his last `save`, which
    // `revert` comes back to. A variant is a second name: `duplicate`.
    libIx(panel) { return (this._lib && this._lib[panel]) || {}; },
    libWhere() { return { panel: this.libPanel || LIB.untitled, name: this.libKey || null }; },
    libState() { return JSON.parse(JSON.stringify({ row: this.row, kept: this.kept || null })); },
    libStamp() {
        const d = new Date(), p = n => String(n).padStart(2, '0');
        return 'untitled ' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
            p(d.getHours()) + '.' + p(d.getMinutes()) + '.' + p(d.getSeconds());   // sortable, and DOTS not colons: the store's name rule refuses a colon
    },
    libBlank() { return !this.row.boxes.length && !this.row.name && !this.row.rolled; },
    async libPost(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.assign({ store: LIB.store }, body)) });
        const j = await r.json().catch(() => null);
        if (!j || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status));
        return j;
    },
    // every change schedules the DISK write; `localStorage` already has it, instantly
    libTouch() { clearTimeout(this._libT); this._libT = setTimeout(() => { this.libFlush(); }, LIB.debounce); },
    async libFlush() {
        clearTimeout(this._libT);
        if (this._libBusy) { this.libTouch(); return; }          // one writer at a time: the store is rewritten whole
        if (this.libBlank() && !this.libKey) return;             // an untouched empty row is not a document
        if (!this.libKey) { this.libKey = this.libStamp(); this.libPanel = LIB.untitled; }   // a row takes its name at its FIRST change
        const w = this.libWhere(), state = this.libState();
        this._libBusy = true;
        try {
            await this.libPost({ panel: w.panel, name: w.name, state: state });
            this._lib = this._lib || {};
            (this._lib[w.panel] = this._lib[w.panel] || {})[w.name] = { saved: new Date().toISOString(), comment: '', state: state };
            this.save(true);
            await this.libPrune();
        } catch (e) { this.setStatus('the library did not save: ' + (e && e.message || e), true); }
        this._libBusy = false;
        this.paintLib();
    },
    // `pagehide` kills a pending fetch, so the last write of a closing or reloading tab goes by BEACON — the one request a
    // browser guarantees to send. Nothing is read back, so there is no cache to update: the next load reads the disk.
    libFlushBeacon() {
        clearTimeout(this._libT);
        if (this.libBlank() && !this.libKey) return;
        if (!this.libKey) { this.libKey = this.libStamp(); this.libPanel = LIB.untitled; this.save(true); }
        const w = this.libWhere();
        const body = JSON.stringify({ store: LIB.store, panel: w.panel, name: w.name, state: this.libState() });
        try {
            if (navigator.sendBeacon) navigator.sendBeacon('/api/snapshots', new Blob([body], { type: 'application/json' }));
            else fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
        } catch (e) {}
    },
    // the stack keeps the newest (his: *"make the auto save number large, these are small files"*); the oldest go at save
    async libPrune() {
        const u = this.libIx(LIB.untitled), keys = Object.keys(u);
        if (keys.length <= LIB.max) return;
        const old = keys.sort((a, b) => String(u[a] && u[a].saved || '').localeCompare(String(u[b] && u[b].saved || ''))).slice(0, keys.length - LIB.max);
        for (const k of old) {
            if (k === this.libKey) continue;
            try { await this.libPost({ panel: LIB.untitled, name: k, delete: true }); delete u[k]; } catch (e) { break; }
        }
    },
    async libLoad() {
        try {
            const r = await fetch('/api/snapshots?store=' + LIB.store, { cache: 'no-store' });
            const j = await r.json(); this._lib = (j && j.panels) || {};
        } catch (e) { this._lib = this._lib || {}; }
        // MIGRATION, and the ordinary first save alike: the row that lived only in localStorage becomes the first untitled entry
        if (!this.libKey && !this.libBlank()) await this.libFlush();
        else this.paintLib();
    },
    // open an entry: the row being left is already safe on disk, so there is no prompt
    async libOpenEntry(panel, name) {
        const e = this.libIx(panel)[name];
        if (!e || !e.state || !e.state.row) { this.setStatus('"' + name + '" is not in the library', true); this.paintLib(); return; }
        await this.libFlush();
        this.stop();
        this.row = this.rowFrom(e.state.row);
        this.kept = (e.state.kept && e.state.kept.row) ? e.state.kept : null;
        this.libPanel = panel; this.libKey = name;
        this.sel = this.row.boxes.length ? 0 : -1;
        if (this.row.rolled) this.rollOpen = true;
        if (!this.isDefaultBreath()) this.breathOpen = true;
        if (this.row.boxes.some(b => b.dyn === WAVES)) this.wavesOpen = true;
        if (!this.isDefaultEdges()) this.edgesOpen = true;
        this.save(true); this._listSig = ''; this.render(); this.fitStrikes();
        this.setStatus('opened "' + name + '" · ' + this.row.boxes.length + ' box' + (this.row.boxes.length === 1 ? '' : 'es') +
            ' · ' + fmtS(this.total()) + ' s' + (this.kept ? ' · it has a saved state — `revert` comes back to it' : ''));
    },
    // NAMING MOVES IT (the takes' way): saved under the name, the entry it came from deleted. Clearing a name moves it back to
    // the untitled stack — nothing is lost either way, because `kept` travels with the entry.
    async libSetName(next) {
        const name = String(next || '').trim(), w = this.libWhere();
        if (name && !LIB_NAME_RE.test(name)) { this.setStatus('a name may hold letters, digits, dot, underscore, space or hyphen, up to 64 — not "' + name + '"', true); return false; }
        if (name === (this.row.name || '')) return true;
        if (name && name !== w.name && this.libIx(LIB.named)[name] &&
            !window.confirm('"' + name + '" is already in the library.\n\nReplace it with this sequence?')) return false;
        if (!name && w.panel === LIB.named &&
            !window.confirm('Un-name this sequence?\n\nIt moves back to the untitled stack — nothing is lost, but it is no longer kept by name.')) return false;
        const to = name ? { panel: LIB.named, name: name } : { panel: LIB.untitled, name: this.libStamp() };
        this.row.name = name;
        this.libPanel = to.panel; this.libKey = to.name;
        await this.libFlush();
        if (w.name && (w.panel !== to.panel || w.name !== to.name)) {
            try { await this.libPost({ panel: w.panel, name: w.name, delete: true }); if (this._lib[w.panel]) delete this._lib[w.panel][w.name]; } catch (e) {}
        }
        this.paintLib(); this.render();
        this.setStatus(name ? 'saved as "' + name + '" — it autosaves to that name from now on' : 'un-named — back in the untitled stack as "' + to.name + '"');
        return true;
    },
    // a variant is a SECOND NAME, and it is its own sequence in the score: a new id, or Insert would replace the original's group
    async libDuplicate() {
        const suggest = this.row.name ? (this.row.name + ' 2').slice(0, 64) : '';
        const name = String(window.prompt('Duplicate this sequence as:', suggest) || '').trim();
        if (!name) return;
        if (!LIB_NAME_RE.test(name)) { this.setStatus('a name may hold letters, digits, dot, underscore, space or hyphen, up to 64 — not "' + name + '"', true); return; }
        if (this.libIx(LIB.named)[name] && !window.confirm('"' + name + '" is already in the library.\n\nReplace it?')) return;
        await this.libFlush();                       // the original, under its own name, first
        this.row.id = 's' + Date.now().toString(36);
        this.row.name = name; this.libPanel = LIB.named; this.libKey = name; this.kept = null;
        await this.libFlush();
        this._listSig = ''; this.render();
        this.setStatus('duplicated as "' + name + '" — a sequence of its own: Insert writes it beside the original, not over it');
    },
    async libDelete(panel, name) {
        if (!window.confirm('Delete "' + name + '" from the library?\n\nThis cannot be undone.')) { this.paintLib(); return; }
        try { await this.libPost({ panel: panel, name: name, delete: true }); } catch (e) { this.setStatus('not deleted: ' + (e && e.message || e), true); return; }
        if (this._lib && this._lib[panel]) delete this._lib[panel][name];
        const w = this.libWhere(), mine = panel === w.panel && name === w.name;
        if (mine) { this.libKey = null; this.libPanel = null; this.save(true); }   // the row stays on screen; the next change writes it again, untitled
        this.paintLib();
        this.setStatus('deleted "' + name + '"' + (mine ? ' — the row is still here, and the next change saves it again as a new untitled' : ''));
    },
    async libNewRow() {
        await this.libFlush();                       // the one being left is already on disk, so `new` destroys nothing
        this.stop();
        this.row = this.newRow(); this.kept = null; this.libKey = null; this.libPanel = null; this.sel = -1;
        this.save(true); this._listSig = ''; this.render(); this.paintLib();
        this.setStatus('a new sequence — "+ container" to begin. The one you left is in the library');
    },
    // `save` marks a keeper; `revert` returns to it; a `•` while they differ. The RECIPE is compared, not the panel's open lines.
    libKeep() {
        if (!this.row.boxes.length) { this.setStatus('nothing to save yet — "+ container" first', true); return; }
        this.kept = { row: JSON.parse(JSON.stringify(this.row)), core: this.coreOf(this.recipe(0)) };
        this.save(); this.paintLib();
        this.setStatus('saved' + (this.libKey ? ' as the keeper of "' + this.libKey + '"' : '') + ' — `revert` comes back to this state');
    },
    libDirty() { return !!(this.kept && this.row.boxes.length && this.kept.core !== this.coreOf(this.recipe(0))); },
    libRevert() {
        if (!this.kept) { this.setStatus('there is no saved state to revert to — press `save` first', true); return; }
        if (!window.confirm('Revert to the saved state?\n\nEverything changed since `save` is lost.')) return;
        this.stop();
        this.row = this.rowFrom(this.kept.row);
        this.sel = this.row.boxes.length ? 0 : -1;
        this.save(); this._listSig = ''; this.render();
        this.setStatus('reverted to the saved state · ' + this.row.boxes.length + ' box' + (this.row.boxes.length === 1 ? '' : 'es'));
    },
    // the `•` beside the name is painted on every save, not only on a render: a dial that saves without re-rendering the
    // whole strip would otherwise leave it stale, and a stale `•` is a lie about what `revert` would do
    paintDot() {
        const d = this.el && this.el.querySelector('#sqDot'); if (d) d.style.display = this.libDirty() ? '' : 'none';
    },
    paintLib() {
        if (!this.el) return;
        const q = s => this.el.querySelector(s);
        const tog = q('#sqLibTog'); if (tog) { tog.textContent = this.libOpen ? 'library ▾' : 'library ▸'; tog.style.background = this.libOpen ? '#20303a' : '#2a2a30'; }
        const line = q('#sqLib'); if (line) line.style.display = this.libOpen ? 'flex' : 'none';
        this.paintDot();
        const sel = q('#sqLibList');
        if (sel) {
            const named = Object.keys(this.libIx(LIB.named)).sort((a, b) => a.localeCompare(b));
            const un = Object.keys(this.libIx(LIB.untitled)).sort((a, b) => b.localeCompare(a));   // newest first — the stamp sorts
            const w = this.libWhere();
            const opt = (panel, n) => {
                const e = this.libIx(panel)[n], bx = ((e && e.state && e.state.row && e.state.row.boxes) || []).length;
                return '<option value="' + esc(panel + '/' + n) + '">' + esc(n) + ' · ' + bx + ' box' + (bx === 1 ? '' : 'es') + (e && e.state && e.state.kept ? ' · saved' : '') + '</option>';
            };
            const sig = named.join('|') + '#' + un.join('|') + '@' + w.panel + '/' + w.name;
            if (sig !== this._libSig) {
                this._libSig = sig;
                sel.innerHTML = '<option value="">the library (' + named.length + ' named · ' + un.length + ' untitled)</option>' +
                    named.map(n => opt(LIB.named, n)).join('') + un.map(n => opt(LIB.untitled, n)).join('');
                sel.value = w.name ? (w.panel + '/' + w.name) : '';
            }
        }
        const where = q('#sqLibWhere');
        if (where) {
            const w = this.libWhere();
            where.textContent = w.name ? (w.panel === LIB.named ? 'saved as "' + w.name + '"' : 'autosaving · ' + w.name) : 'not saved yet';
            where.title = w.name ? 'this row autosaves to bank/sequences.json, panel `' + w.panel + '`, under "' + w.name + '"' : 'this row is saved to bank/sequences.json at its first change';
        }
        const rv = q('#sqLibRevert'); if (rv) rv.disabled = !this.kept;
        const dl = q('#sqLibDel'); if (dl) dl.disabled = !(sel && sel.value);
    },
    straightOk(d) { const L = LADDER(); return (L && L.NAMES.indexOf(d) >= 0) ? d : AS_DEALT; },   // a straight dynamic: `as dealt`, or a name on the ladder
    dynOk(d) { return d === WAVES ? WAVES : this.straightOk(d); },                                 // a box's dyn: a straight dynamic, or the waves (1d.7)
    levelOfName(name) { const L = LADDER(); return L && L.ANCHOR[name] != null ? clamp((L.ANCHOR[name] - L.LO) / (L.HI - L.LO), 0, 1) : 0.5; },
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
        d.style.cssText = 'position:fixed;z-index:9001;background:#181c20;border:1px solid ' + EDGE_OFF + ';border-top:2px solid ' + EDGE_OFF + ';border-radius:6px;' +
            'color:#ddd;font:' + FS + 'px/1.4 system-ui,sans-serif;display:none;box-shadow:0 10px 34px rgba(0,0,0,.6);overflow:hidden;flex-direction:column;outline:none;' +
            'resize:both;min-width:' + WIN.MINW + 'px;min-height:' + WIN.MINH + 'px';   // resize:both is the browser's own grip, bottom-right; ResizeObserver below remembers what he drags it to
        const L = LADDER();
        d.innerHTML =
            '<div id="sqHead" style="display:flex;gap:8px;row-gap:3px;flex-wrap:wrap;align-items:center;padding:4px 8px;white-space:nowrap;border-bottom:1px solid #2c3238">' +   // 1d.5: it WRAPS, as the roll line does — at 1280 px a placed sequence\'s head was 61 px too long before `breath` was added, and its × was cut off
              '<b style="color:' + COLOR + ';letter-spacing:.08em">SEQUENCE</b>' +
              '<input id="sqName" type="text" placeholder="name" maxlength="64" style="width:10.909em;' + INP + '" title="a name for this sequence. Naming it MOVES it in the library — it is saved under that name from then on, and the untitled entry is gone. The name also goes into the score file with the recipe">' +
              '<span id="sqDot" title="changed since `save` — `revert` (the library line) comes back to the saved state" style="display:none;color:' + WTINT + ';font-size:1.2em;line-height:1">&bull;</span>' +
              '<select id="sqList" style="max-width:18.182em;' + INP + '" title="the sequences placed in the open score (its databases.sequences) — pick one and it comes back as it was: the boxes, the frozen chords, the seconds, the dyns, attack or seamless. Change anything, then re-insert: it is replaced IN PLACE"></select>' +
              '<label title="how a new chord is taken — attack: everyone starts AT the line, together · seamless: each player takes the new chord at its next breath">change <select id="sqChange" style="' + INP + '">' + SEQ.CHANGES.map(c => '<option value="' + c + '">' + c + '</option>').join('') + '</select></label>' +
              '<button id="sqAdd" style="' + BTN + '" title="add a container at the end of the row">+ container</button>' +
              '<button id="sqLibTog" style="' + BTN + ';color:#7fc4e8" title="the LIBRARY: every sequence you make is on disk in bank/sequences.json — unnamed ones in a rolling stack, named ones by name. Open one, duplicate it, delete it; `save` marks a keeper and `revert` comes back to it">library</button>' +
              '<button id="sqRollTog" style="' + BTN + ';color:#e8a06a" title="the ROLL: a set of time containers rolled from a pool of numbers — it lays out the row\'s durations for you">roll</button>' +
              '<button id="sqBreathTog" style="' + BTN + ';color:#8fd0a0" title="the BREATH: how the players breathe and bow under the chords — the morph\'s numbers until you touch one. Never together, sometimes, always; short breaths with long">breath</button>' +
              '<button id="sqWavesTog" style="' + BTN + ';color:' + WTINT + '" title="the WAVES: every player rises and falls on a stream of swells of their own, out of step with the others. A box READS the waves when its dyn is `waves`; any box can step out to a straight dynamic and the waves run on under it">waves</button>' +
              '<button id="sqEdgesTog" style="' + BTN + ';color:#e6c46a" title="the EDGES: how the sequence begins and ends — a fade in from nothing (or from a dynamic), a fade out to nothing (or to a dynamic), and whether the players end together or one by one, each finishing a last breath of their own. How it BEGINS — together or staggered — is box 1\'s `enter`">edges</button>' +
              '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
              '<label title="what SPACE and Hear play — the whole sequence, or from the selected box on">hear <select id="sqFrom" style="' + INP + '"><option value="start">from the start</option><option value="box">from the box</option></select></label>' +
              '<button id="sqHear" style="' + BTN + '" title="play the sequence through the strikes drawer\'s own player — the same levels, the same bends (SPACE)">Hear</button>' +
              '<button id="sqStop" style="' + BTN + '">Stop</button>' +
              '<button id="sqInsert" style="' + BTN + '">Insert @ playhead</button>' +
              '<button id="sqMove" style="' + BTN + ';display:none" title="move this sequence to the playhead — the notes where it sits now are removed and it is written again from the playhead">move to playhead</button>' +
              '<button id="sqNew" style="' + BTN + '" title="start a fresh sequence — the row is cleared; a sequence already in the score stays there">new</button>' +
              '<span id="sqSpace" title="SPACE goes to what you clicked last — this strip, the strikes drawer, or the score" style="padding:0 5px;border:1px solid #444;border-radius:3px;font-size:.9em;letter-spacing:.08em">SPACE</span>' +
              '<span id="sqTotal" style="color:#9ab"></span>' +
              '<span style="flex:1"></span>' +
              '<button id="sqClose" style="' + BTN + '" title="close the sequence drawer (the row is kept)">&times;</button>' +
            '</div>' +
            '<div id="sqLib" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238">' +
              '<select id="sqLibList" style="max-width:24em;' + INP + '" title="every sequence on disk — named ones first, then the untitled stack, newest first. Pick one and it opens; the row you are leaving is already saved, so nothing is lost"></select>' +
              '<button id="sqLibSave" style="' + BTN + '" title="mark this state as the keeper — `revert` comes back to it. Two states per name and never more: the current one and this">save</button>' +
              '<button id="sqLibRevert" style="' + BTN + '" title="go back to the state you last pressed `save` at">revert</button>' +
              '<button id="sqLibDup" style="' + BTN + '" title="a copy under a new name — its own sequence in the score, written beside the original and not over it">duplicate</button>' +
              '<button id="sqLibDel" style="' + BTN + '" title="delete the sequence chosen in the list from bank/sequences.json">&times;</button>' +
              '<span id="sqLibWhere" style="color:#9ab"></span>' +
            '</div>' +
            '<div id="sqRoll" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="sqBreath" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="sqEdges" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="sqWaves" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="sqStatus" style="padding:1px 8px;height:1.455em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9a9"></div>' +   // a line of its own: the head is full at 1280 px and the status is what tells him what happened
            '<div id="sqRowWrap" style="flex:1 1 auto;min-height:' + Math.round(ROW_H * 0.6) + 'px;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;padding:6px 8px">' +
              '<div id="sqRow" style="position:relative;display:flex;gap:3px;height:100%;min-width:100%"></div>' +
            '</div>' +
            '<div id="sqEdit" style="display:flex;gap:8px;align-items:center;padding:4px 8px;border-top:1px solid #2c3238;white-space:nowrap;min-height:2.364em;overflow:hidden"></div>';
        if (!document.getElementById('sqStyle')) {   // form controls do NOT inherit type: one rule gives every input, select and button in the strip the panel's size
            const st = document.createElement('style'); st.id = 'sqStyle';
            st.textContent = '#sequenceDrawer input,#sequenceDrawer select,#sequenceDrawer button{font:inherit}' +
                '#sqHead{cursor:move}#sqHead input,#sqHead select,#sqHead label{cursor:auto}#sqHead button{cursor:pointer}';
            document.head.appendChild(st);
        }
        document.body.appendChild(d);
        this.el = d;
        this.placeWindow();                                   // where he left it last, or along the bottom, where it used to be docked
        this.dragBy(d.querySelector('#sqHead'));
        // TWO WAYS TO CATCH A RESIZE, because neither is enough alone. The observer is the live one — and its handle is KEPT, since an
        // observer with no reference of its own is collected in Blink and never fires again. But ResizeObserver is delivered on the
        // rendering lifecycle, and a host that is not painting never delivers it (it never did in the in-app pane, where this was verified),
        // so the grip's own pointerup saves too: that is the end of every drag of the corner, and it needs no frames at all.
        if (window.ResizeObserver) { this._ro = new window.ResizeObserver(() => { if (this.isOpen()) this.saveWindow(); }); this._ro.observe(d); }
        window.addEventListener('pointerup', () => {
            const g = this._win;
            if (this.isOpen() && g && (g.w !== this.el.offsetWidth || g.h !== this.el.offsetHeight)) this.saveWindow();
        });
        const q = s => d.querySelector(s);
        // 1d.11: a name + ENTER MOVES the sequence in the library — saved under that name, the entry it came from deleted
        q('#sqName').addEventListener('change', async e => { const want = e.target.value.trim(); if (!(await this.libSetName(want))) e.target.value = this.row.name || ''; });
        q('#sqName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        q('#sqLibTog').addEventListener('click', () => { this.libOpen = !this.libOpen; this.save(true); this.paintLib(); this.fitStrikes(); });
        q('#sqLibList').addEventListener('change', e => {
            const v = e.target.value; e.target.blur();
            if (!v) { this.paintLib(); return; }
            const i = v.indexOf('/'); this.libOpenEntry(v.slice(0, i), v.slice(i + 1));
        });
        q('#sqLibSave').addEventListener('click', () => this.libKeep());
        q('#sqLibRevert').addEventListener('click', () => this.libRevert());
        q('#sqLibDup').addEventListener('click', () => this.libDuplicate());
        q('#sqLibDel').addEventListener('click', () => {
            const v = q('#sqLibList').value; if (!v) { this.setStatus('choose a sequence in the list first', true); return; }
            const i = v.indexOf('/'); this.libDelete(v.slice(0, i), v.slice(i + 1));
        });
        q('#sqChange').addEventListener('change', e => {
            // 1d.8: the head's `change` is the sequence's rule AND sets every box — it asks before it overwrites boxes flipped by hand
            const c = SEQ.CHANGES.indexOf(e.target.value) >= 0 ? e.target.value : 'attack', flipped = this.row.boxes.filter(b => b.change && b.change !== c).length;
            e.target.blur();
            if (flipped && !window.confirm('Set every box to ' + c + '?\n\n' + flipped + ' box' + (flipped === 1 ? ' is' : 'es are') + ' entered another way by hand — that will be overwritten.')) { e.target.value = this.row.change; return; }
            this.row.change = c; this.row.boxes.forEach(b => { b.change = null; }); this.save(); this.render();
            this.setStatus('change: every box is entered by ' + c + (c === 'attack' ? ' — everyone starts at the line, together' : ' — each player takes the new chord at its next breath') + ' · any one box can be flipped on its own line (`enter`)');
        });
        q('#sqFrom').addEventListener('change', e => { this.hearFrom = e.target.value === 'box' ? 'box' : 'start'; this.save(); e.target.blur(); });
        q('#sqAdd').addEventListener('click', () => this.addBox());
        q('#sqRollTog').addEventListener('click', () => { this.rollOpen = !this.rollOpen; this.save(); this.paintRoll(); this.fitStrikes(); });
        this.buildRoll();
        q('#sqBreathTog').addEventListener('click', () => { this.breathOpen = !this.breathOpen; this.save(); this.paintBreath(); this.fitStrikes(); });
        this.buildBreath();
        q('#sqWavesTog').addEventListener('click', () => { this.wavesOpen = !this.wavesOpen; this.save(); this.paintWaves(); this.fitStrikes(); });
        this.buildWaves();
        q('#sqEdgesTog').addEventListener('click', () => { this.edgesOpen = !this.edgesOpen; this.save(); this.paintEdges(); this.fitStrikes(); });
        this.buildEdges();
        window.addEventListener('resize', () => { if (this.isOpen()) { this.clampWindow(); this.fitStrikes(); } });   // the screen changed under a floating window: bring it back into view
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
        tab.style.cssText = 'position:fixed;right:118px;bottom:0;z-index:8999;background:#16323d;color:#bfe6f5;border:1px solid ' + COLOR + ';border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:' + (FS + 1) + 'px system-ui,sans-serif;letter-spacing:.06em';
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
        if (show) { this.clampWindow(); this.paintRoll(); this.paintBreath(); this.paintWaves(); this.paintEdges(); }   // clamp first: only now can the window be measured, and the screen may have changed while it was shut
        this.fitStrikes();
        if (!show) { this.setActive(false); this.stop(); return; }
        this.setActive(true);
        this.render();
        if (D.refreshTakes) D.refreshTakes().then(() => this.renderEdit()).catch(() => {});
    },
    // the two drawers one above the other: while this strip is open the strikes drawer stands ON it (styles only — its code is not touched)
    stripH() { return this.isOpen() ? Math.round(this.el.getBoundingClientRect().height) : 0; },
    refit() { if (this.isOpen() && this.stripH() !== this._fitH) this.fitStrikes(); },   // the head wraps, so a longer Insert button may add a line: fit again only when the height moved
    // THE STRIP FLOATS (2026-09-20, his call), so it no longer STANDS on the strikes drawer and the drawer keeps the bottom of the screen.
    // This is now the one place that puts back what the docked strip used to take — idempotent, and it still re-renders the drawer.
    fitStrikes() {
        this._fitH = this.stripH();
        if (D.el) {
            D.el.style.bottom = '0';
            D.el.style.maxHeight = '';
            if (D.el.style.display !== 'none' && typeof D.render === 'function') { try { D.render(); } catch (e) {} }
        }
        const tab = document.getElementById('strikesTab'); if (tab) tab.style.bottom = '0';
    },

    // ------------------------------------------------------------------ the floating window (2026-09-20 — drag it by the head, size it by the corner, it comes back where he left it)
    // The geometry is the BROWSER's, not the piece's: it lives in localStorage beside the row, never in the score file and never in a recipe.
    winDefault() {
        const w = Math.min(WIN.W, Math.max(WIN.MINW, window.innerWidth - 2 * WIN.PAD)), h = Math.min(WIN.H, Math.max(WIN.MINH, window.innerHeight - 2 * WIN.PAD));
        return { x: Math.round((window.innerWidth - w) / 2), y: Math.max(WIN.PAD, window.innerHeight - h - WIN.PAD), w: Math.round(w), h: Math.round(h) };
    },
    placeWindow() {
        let g = null; try { g = (JSON.parse(localStorage.getItem(STORE) || 'null') || {}).win; } catch (e) { g = null; }
        // a size under the minimum is not a window he chose — it is a bad save, and one is on disk from the first build of this (0 × 0)
        const ok = g && ['x', 'y', 'w', 'h'].every(k => isFinite(+g[k])) && +g.w >= WIN.MINW && +g.h >= WIN.MINH;
        this._win = ok ? { x: +g.x, y: +g.y, w: +g.w, h: +g.h } : this.winDefault();
        this.clampWindow();
    },
    // THE GEOMETRY IS HELD AS NUMBERS in this._win, never read back off a hidden element: placeWindow runs from build(), where the
    // panel is still display:none and every measurement is 0 — that put the window in the corner at its minimum and saved 0 × 0.
    // The element is measured only when it is VISIBLE, which is the one case that can be bigger than we think: he dragged the corner.
    clampWindow() {   // saved on a wider screen, or dragged half off: never leave the head out of reach
        const el = this.el, g = this._win || (this._win = this.winDefault()); if (!el) return;
        if (this.isOpen() && el.offsetWidth) { g.w = el.offsetWidth; g.h = el.offsetHeight; }   // his own resize is the truth
        g.w = Math.round(clamp(g.w, WIN.MINW, Math.max(WIN.MINW, window.innerWidth)));
        g.h = Math.round(clamp(g.h, WIN.MINH, Math.max(WIN.MINH, window.innerHeight)));
        g.x = Math.round(clamp(g.x, 0, Math.max(0, window.innerWidth - g.w)));
        g.y = Math.round(clamp(g.y, 0, Math.max(0, window.innerHeight - g.h)));
        el.style.width = g.w + 'px'; el.style.height = g.h + 'px'; el.style.left = g.x + 'px'; el.style.top = g.y + 'px';
        this.save();
    },
    saveWindow() {
        const el = this.el, g = this._win; if (!el || !g) return;
        if (this.isOpen() && el.offsetWidth) { g.w = el.offsetWidth; g.h = el.offsetHeight; }   // a hidden panel measures 0 — never let that reach the store
        const px = (v, was) => { const n = parseFloat(v); return isFinite(n) ? Math.round(n) : was; };   // NOT `|| was`: dragged hard against the left or top edge, the number IS 0
        g.x = px(el.style.left, g.x); g.y = px(el.style.top, g.y);
        this.save();
    },
    // drag by the head — but never by anything he can click: a control under the pointer keeps the pointer
    dragBy(head) {
        if (!head) return;
        head.addEventListener('pointerdown', ev => {
            if (ev.button !== 0) return;
            const t = ev.target;
            if (t && t.closest && t.closest('input,select,button,textarea,option')) return;
            const el = this.el, x0 = ev.clientX, y0 = ev.clientY, l0 = parseFloat(el.style.left) || 0, t0 = parseFloat(el.style.top) || 0;
            const move = e => {
                el.style.left = Math.round(clamp(l0 + e.clientX - x0, 0, Math.max(0, window.innerWidth - el.offsetWidth))) + 'px';
                el.style.top = Math.round(clamp(t0 + e.clientY - y0, 0, Math.max(0, window.innerHeight - el.offsetHeight))) + 'px';
            };
            const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); this.saveWindow(); };
            window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
            ev.preventDefault();
        });
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
        this.renderRow(); this.renderEdit(); this.renderList(); this.paintInsert(); this.paintLib(); this.paintRoll(); this.paintBreath(); this.paintWaves(); this.paintEdges();
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
    coreOf(r) { return JSON.stringify({ change: r.change, breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}), waves: r.waves ? this.wavesDefaults(r.waves) : null, edges: r.edges ? this.edgesDefaults(r.edges) : null, containers: (r.containers || []).map(c => ({ dur: +c.dur, dyn: c.dyn == null ? AS_DEALT : c.dyn, change: (c.change && c.change !== r.change) ? c.change : null, take: c.take || '', chord: c.chord || [] })) }); },
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
        this.refit();
    },
    reopen(id) {
        const e = this.entryOf(id); if (!e) { this._listSig = ''; this.renderList(); return; }
        if (this.isDirty() && !window.confirm('Reopen "' + (e.name || id) + '"?\n\nThe row in the drawer holds changes that are not in the score — they will be lost.')) { this._listSig = ''; this.renderList(); return; }
        this.stop();
        const R = e.recipe;
        this.row = { id: e.id, name: (e.name && e.name !== 'sequence ' + e.id) ? String(e.name) : '', change: SEQ.CHANGES.indexOf(R.change) >= 0 ? R.change : 'attack',
            breath: Object.assign({}, SEQ.DEFAULT_BREATH, R.breath || {}), waves: this.wavesDefaults(R.waves), edges: this.edgesDefaults(R.edges), roll: Object.assign(this.rollDefaults(), R.roll || {}), rolled: !!R.roll,
            boxes: (R.containers || []).map(c => ({ take: String(c.take || ''), dur: clampDur(c.dur), dyn: this.dynOk(c.dyn), dynWas: this.straightOk(c.dynWas), change: (this.changeOk(c.change) && c.change !== R.change) ? c.change : null, chord: JSON.parse(JSON.stringify(c.chord || [])), frozen: '' })) };
        this.sel = this.row.boxes.length ? 0 : -1;
        if (this.row.rolled) this.rollOpen = true;   // a rolled sequence shows how its durations were made
        if (!this.isDefaultBreath()) this.breathOpen = true;   // and one whose breath was set shows its dials (1d.5)
        if (this.row.boxes.some(b => b.dyn === WAVES)) this.wavesOpen = true;   // and one that reads the waves shows theirs (1d.7)
        if (!this.isDefaultEdges()) this.edgesOpen = true;                      // and one with fades or an exit of its own shows the edges (1d.8)
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
            d.style.cssText = 'position:relative;flex:' + Math.max(0.1, +b.dur || 0) + ' 1 0;min-width:8.727em;box-sizing:border-box;padding:3px 6px;border-radius:4px;cursor:pointer;overflow:hidden;' +
                // 1d.4: a box with no chord is a REST — deliberate, so it is drawn quiet (dashed, dim), not as a fault
                'background:' + (on ? '#22404d' : (empty ? '#191d21' : '#20262c')) + ';border:1px ' + (empty ? 'dashed ' : 'solid ') + (on ? EDGE_ON : (empty ? '#56606a' : '#3a4650')) + ';display:flex;flex-direction:column;justify-content:center;white-space:nowrap';
            d.title = empty ? 'a REST — silence for its duration: every player stops at its start and begins again after it. Choose a take to give it a chord' : this.chordText(b.chord);
            const own = (b.change && b.change !== this.row.change) ? b.change : null;   // 1d.8: a box entered another way than the sequence's rule wears it
            d.innerHTML = '<div style="color:#789;font-size:.9em">' + (i + 1) + (own ? ' <span style="color:#e6c46a" title="this box is entered by ' + own + ' — the sequence\'s rule is ' + this.row.change + '">' + (own === 'attack' ? '▶| attack' : '≈ seamless') + '</span>' : '') + '</div>' +
                '<div style="overflow:hidden;text-overflow:ellipsis;color:' + (empty ? '#7d8790' : '#e6eef2') + (empty ? ';font-style:italic' : '') + '">' + esc(b.take || 'rest') + '</div>' +
                '<div style="color:#9ab">' + fmtS(b.dur) + ' s' + (empty ? '' : ' · ' + (b.dyn === WAVES ? '<span style="color:' + WTINT + '">∿ waves</span>' : esc(b.dyn))) + '</div>' +   // 1d.7: a waves box wears a mark
                '<div style="color:' + (empty ? '#7d8790' : '#7a9') + ';font-size:.9em">' + (empty ? 'silence' : (np + ' player' + (np === 1 ? '' : 's') + (b.chord.length > np ? ' · ' + b.chord.length + ' notes' : ''))) + '</div>';
            d.addEventListener('click', () => { this.sel = i; this.save(); this.render(); });
            if (!empty) {   // the PREVIEW: this box's chord on its own — every box that holds a take has one
                const on = this._previewing === i, pv = document.createElement('button');
                pv.className = 'sqPrev'; pv.textContent = on ? '■' : '▸';
                pv.title = on ? 'stop the preview' : 'PREVIEW: hear this box\'s chord on its own — everyone together, ' + fmtS(Math.min(PREVIEW_S, +b.dur || PREVIEW_S)) + ' s, at the box\'s dyn (' + b.dyn + ')';
                pv.style.cssText = 'position:absolute;top:2px;right:3px;width:1.818em;height:1.636em;padding:0;line-height:1.455em;font-size:1em;cursor:pointer;border-radius:3px;border:1px solid ' + (on ? EDGE_ON : '#4a5a66') + ';background:' + (on ? '#2f5f72' : '#1a2228') + ';color:' + (on ? '#fff' : '#9fdcf5');
                pv.addEventListener('click', ev => { ev.stopPropagation(); this.preview(i); });
                d.appendChild(pv);
            }
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
        const L = LADDER(), dyns = [AS_DEALT, WAVES].concat(L ? L.NAMES : []);
        const missing = b.take && names.indexOf(b.take) < 0;
        ed.innerHTML =
            '<b style="color:' + COLOR + '">box ' + (i + 1) + '</b>' +
            '<label title="a saved take of the strikes drawer. Choosing one LOADS it in the strikes drawer, so you see it — whatever is undealt there is replaced (save it as a take first) — and the box freezes its notes as `long tone` deals them">take <select id="sqTake" style="max-width:20em;' + INP + '"><option value="">— choose —</option>' +
                (missing ? '<option value="' + esc(b.take) + '">' + esc(b.take) + ' (not in the list)</option>' : '') +
                names.map(nm => '<option value="' + esc(nm) + '">' + esc(nm) + '</option>').join('') + '</select></label>' +
            '<label><input id="sqDur" type="number" min="' + MIN_DUR + '" max="' + MAX_DUR + '" step="0.5" style="width:5.091em;' + INP + '"> s</label>' +
            '<label title="as dealt: each note keeps the level the take was saved at · waves: every player rises and falls on their own stream of swells, between the waves\' low and high (the `waves` line) · ppp … fff: the whole box at that dynamic, on the drawer\'s own written scale">dyn <select id="sqDyn" style="' + INP + '">' + dyns.map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('') + '</select></label>' +
            '<label title="how THIS box is entered — attack: everyone lands a breath before its line and starts AT it, together · seamless: each player takes it at their next breath. The head\'s `change` sets every box; this flips one. On box 1 it is how the sequence BEGINS: attack = everyone together, seamless = staggered">enter <select id="sqEnter" style="' + INP + '">' + SEQ.CHANGES.map(c => '<option value="' + c + '">' + c + '</option>').join('') + '</select></label>' +
            '<button id="sqRefresh" style="' + BTN + '" title="read the take again — the box holds the notes as they were when it was chosen">refresh from take</button>' +
            '<button id="sqLeft" style="' + BTN + '" title="move this box earlier">◂</button><button id="sqRight" style="' + BTN + '" title="move this box later">▸</button>' +
            '<button id="sqDel" style="' + BTN + '" title="remove this box">×</button>' +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:#9ab" title="' + esc(this.chordText(b.chord)) + '">' + esc(b.chord.length ? this.chordText(b.chord) : 'a REST — silence for its ' + fmtS(b.dur) + ' s; choose a take to give it a chord') + '</span>';
        const q = s => ed.querySelector(s);
        q('#sqTake').value = b.take || ''; q('#sqDur').value = b.dur; q('#sqDyn').value = b.dyn; q('#sqEnter').value = b.change || this.row.change;
        q('#sqEnter').addEventListener('change', e => {
            const c = this.changeOk(e.target.value) || this.row.change; b.change = c === this.row.change ? null : c; e.target.blur(); this.save(); this.render();
            this.setStatus('box ' + (i + 1) + ' is entered by ' + c + (b.change ? ' — the rest stay ' + this.row.change : ' — the sequence\'s own rule') + (i === 0 ? ' · box 1: this is how the sequence BEGINS (' + (c === 'attack' ? 'everyone together' : 'staggered') + ')' : ''));
        });
        q('#sqTake').addEventListener('change', e => { e.target.blur(); this.freeze(i, e.target.value); });
        q('#sqDur').addEventListener('change', e => { b.dur = clampDur(e.target.value); e.target.blur(); this.save(); this.render(); });
        q('#sqDur').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        q('#sqDyn').addEventListener('change', e => {
            const d = this.dynOk(e.target.value); if (d === WAVES && b.dyn !== WAVES) b.dynWas = b.dyn; else if (d !== WAVES) b.dynWas = d;   // the straight dyn is remembered, so stepping out of the waves restores it
            b.dyn = d; e.target.blur(); this.save(); this.render();
            if (d === WAVES) this.wavesStatus('box ' + (i + 1) + ' reads the waves');
        });
        q('#sqRefresh').addEventListener('click', () => { if (b.take) this.freeze(i, b.take); else this.setStatus('box ' + (i + 1) + ' has no take to refresh from', true); });
        q('#sqLeft').addEventListener('click', () => this.moveBox(i, -1));
        q('#sqRight').addEventListener('click', () => this.moveBox(i, 1));
        q('#sqDel').addEventListener('click', () => this.removeBox(i));
    },
    addBox() { this.row.boxes.push(this.newBox()); this.sel = this.row.boxes.length - 1; this.save(); this.render(); this.setStatus('box ' + (this.sel + 1) + ' added — choose its take (a box left without one is a REST)'); },
    removeBox(i) { if (!this.row.boxes[i]) return; this.row.boxes.splice(i, 1); this.sel = Math.min(i, this.row.boxes.length - 1); this.save(); this.render(); },
    moveBox(i, by) { const j = i + by, B = this.row.boxes; if (!B[i] || j < 0 || j >= B.length) return; const t = B[i]; B[i] = B[j]; B[j] = t; this.sel = j; this.save(); this.render(); },
    // 1d.11: `new` DESTROYS NOTHING — the row being left is already on disk in the library, so there is no longer a prompt
    startNew() { this.libNewRow(); },

    // ------------------------------------------------------------------ the roll (1d.4): time_containers.js's dials, the strikes drawer's habit
    buildRoll() {
        const line = this.el.querySelector('#sqRoll'), T = TC(); if (!line) return;
        if (!T) { line.innerHTML = '<span style="color:#e88">time_containers.js is not loaded — no roll</span>'; return; }
        const lab = 'color:#8a8';
        line.innerHTML = '<span style="color:#e8a06a">roll</span>' +
            '<select id="sqRPre" style="' + INP + ';max-width:15.455em" title="a starting point, sorted by SPREAD (largest ÷ smallest) — the spread is what you hear. Picking one fills the boxes; it is not a mode."><option value="">preset…</option>' +
                T.PRESETS.map(p => '<option value="' + esc(p.key) + '" title="' + esc(p.note) + '">' + T.spreadOf(p.values) + '× · ' + esc(p.label) + ' — ' + p.values.join(' ') + '</option>').join('') + '</select>' +
            '<input id="sqRVals" type="text" style="' + INP + ';width:10em" title="the numbers, separated by spaces">' +
            '<input id="sqRW" type="text" style="' + INP + ';width:10em" placeholder="weights" title="one weight per number, or blank. 20 or 20% or 0.2 all mean a fifth; a dash or a gap means “share what is left”. Typing here puts the tilt back to the middle — a typed weight stands.">' +
            '<label style="' + lab + '" title="weight the short values or the long ones: FILLS the weights box (weight ∝ value^k). The middle = no weights.">tilt short <input id="sqRTilt" type="range" min="-3" max="3" step="0.25" style="width:6.545em;vertical-align:middle"> long</label>' +
            '<label style="' + lab + '" title="seconds per unit — one number rescales the whole set">× <input id="sqRUnit" type="number" step="0.05" min="0.01" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="the span the roll fills; it stops short and says by how much">fill <input id="sqRTot" type="number" step="1" min="1" style="' + INP + ';width:4.727em"> s</label>' +
            '<label style="' + lab + '" title="how many containers. BLANK: the grey number is what the dials give now. Type a number and it FILLS the × box — the seconds per unit that makes that many fit the span, for this seed (re-roll solves it again). Typing × yourself clears it: × stays the truth">count <input id="sqRCount" type="number" step="1" min="1" style="' + INP + ';width:4em"></label>' +
            '<label style="' + lab + '" title="how much the next container stays near the last — the periodicity">stick <input id="sqRStick" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:4em"></label>' +
            '<label style="' + lab + '" title="how often it deliberately leaps far — the interruption">interrupt <input id="sqRJump" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:4em"></label>' +
            '<select id="sqRContour" style="' + INP + '" title="the accordion: the size the roll is pulled toward across the span">' + T.CONTOURS.map(c => '<option value="' + c[0] + '">' + esc(c[1]) + '</option>').join('') + '</select>' +
            '<span id="sqRShape" style="display:none;gap:4px;align-items:center">' +
                '<label style="' + lab + '" title="where the reversal sits — the asymmetry">turn <input id="sqRTurn" type="number" step="0.05" min="0.02" max="0.98" style="' + INP + ';width:4em"></label>' +
                '<label style="' + lab + '" title="broad (below 1) or sharp (above 1) at the turn">bow <input id="sqRBow" type="number" step="0.1" min="0.1" max="4" style="' + INP + ';width:4em"></label>' +
                '<label style="' + lab + '" title="how hard the contour pulls">depth <input id="sqRDepth" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:4em"></label>' +
            '</span>' +
            '<label style="' + lab + '" title="the same seed rolls the same set">seed <input id="sqRSeed" type="number" step="1" min="1" style="' + INP + ';width:4.364em"></label>' +
            '<button id="sqRGo" style="' + BTN + ';color:#e8a06a" title="roll with this seed — the durations become the row\'s boxes. Chords already in the row stay in their boxes, by position (it asks first)">roll</button>' +
            '<button id="sqRNext" style="' + BTN + '" title="the next seed, rolled">re-roll</button>';
        const q = s => line.querySelector(s);
        q('#sqRPre').addEventListener('change', e => {
            const p = T.PRESETS.find(x => x.key === e.target.value); e.target.blur(); if (!p) return;
            const c = this.row.roll; c.preset = p.key; c.values = p.values.join(' '); c.tilt = 0;
            c.weights = p.weights ? p.weights.map(w => (w == null ? '-' : Math.round(w * 100) + '%')).join(' ') : '';
            this.solveCount();   // a count that is set holds: × follows the new numbers
            this.save(); this.paintRoll(); this.setStatus(p.label + ' — ' + p.note + ' · spread ' + T.spreadOf(p.values) + '× · press roll');
        });
        ['sqRVals', 'sqRW', 'sqRUnit', 'sqRTot', 'sqRCount', 'sqRStick', 'sqRJump', 'sqRContour', 'sqRTurn', 'sqRBow', 'sqRDepth', 'sqRSeed'].forEach(id => {
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
                // the count: a typed × stands and clears it; otherwise a count that is set HOLDS — × is solved again under whatever dial moved
                if (id === 'sqRUnit') c.count = '';
                else if (id === 'sqRCount') { const n = Math.round(+q('#sqRCount').value); c.count = n >= 1 ? n : ''; }
                const solved = this.solveCount();
                if (e.target.tagName === 'SELECT' || e.target.type === 'number') e.target.blur();
                this.save(); this.paintRoll(); if (id === 'sqRContour') this.fitStrikes();
                if (solved && id === 'sqRCount') this.setStatus('count ' + c.count + '  →  × ' + solved.unit + ' s' + (solved.count === c.count ? '' : ' — these dials cannot give exactly ' + c.count + ': this gives ' + solved.count) + (solved.short > 0.001 ? ' · ' + fmtS(solved.short) + ' s short of the fill' : '') + ' · seed ' + c.seed + ' · press roll', solved.count !== c.count);
            });
            if (id === 'sqRVals' || id === 'sqRW') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
        q('#sqRTilt').addEventListener('input', e => { this.row.roll.tilt = +e.target.value || 0; this.applyTilt(); this.solveCount(); this.paintRoll(); });
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
        put('#sqRCount', c.count || '');
        if (this.rollOpen && TC()) { const now = TC().roll(this.rollOpts()); q('#sqRCount').placeholder = String(now.count); }   // blank = a readout: what these dials and this seed give
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
    // `count`: the × that makes that many containers fit the span — searched, not estimated, because the order and the contour both
    // move the average. From half to double the arithmetic guess, for THIS seed: the count first, then the fullest span, then the
    // nearest to the guess. Writes c.unit; null when no count is set
    solveCount() {
        const T = TC(), c = this.row.roll, N = Math.round(+c.count); if (!T || !(N >= 1)) return null;
        const o = this.rollOpts(); if (!o.values.length || !(o.total > 0)) return null;
        const w = T.weightsFor(o.values, o.weights), sw = w.reduce((a, b) => a + b, 0) || 1;
        const mean = o.values.reduce((a, v, i) => a + v * w[i], 0) / sw, est = o.total / (N * Math.max(1e-6, mean));
        let best = null;
        for (let k = -40; k <= 40; k++) {
            const unit = Math.max(0.01, Math.round(est * Math.pow(2, k / 40) * 1000) / 1000);
            const r = T.roll(Object.assign({}, o, { unit: unit })), score = Math.abs(r.count - N) * 1e6 + r.short * 1000 + Math.abs(k);
            if (!best || score < best.score) best = { unit: unit, count: r.count, short: r.short, score: score };
        }
        c.unit = best.unit; return best;
    },
    doRoll(next) {
        const T = TC(); if (!T) { this.setStatus('time_containers.js is not loaded', true); return; }
        const c = this.row.roll, unitWas = c.unit; if (next) c.seed = Math.max(1, Math.round(+c.seed || 1)) + 1;
        this.solveCount();   // a count that is set is solved for the seed being rolled
        const o = this.rollOpts(), r = T.roll(o);
        if (!r.seq.length) { this.save(); this.paintRoll(); this.setStatus('nothing rolled — ' + (r.why || 'no containers'), true); return; }
        const B = this.row.boxes, filled = B.filter(b => b.chord.length).length;
        if (filled) {
            const kept = B.slice(0, r.seq.length).filter(b => b.chord.length).length, dropped = filled - kept;
            if (!window.confirm('Roll over this row?\n\n' + B.length + ' box' + (B.length === 1 ? '' : 'es') + ' become ' + r.seq.length + ', with new durations.\nChords stay in their boxes by position: ' + kept + ' kept' + (dropped ? ', ' + dropped + ' DROPPED (beyond the new count).' : '.'))) {
                if (next) c.seed--; c.unit = unitWas; this.paintRoll(); return;
            }
        }
        this.stop();
        this.row.boxes = r.seq.map((s, i) => Object.assign(B[i] ? B[i] : this.newBox(), { dur: clampDur(s) }));
        this.row.rolled = true;
        this.sel = clamp(this.sel, 0, this.row.boxes.length - 1);
        this.save(); this.render();
        this.setStatus('rolled ' + r.count + ' · ' + fmtS(r.filled) + ' of ' + fmtS(o.total) + ' s' + (r.short > 0.001 ? ' · ' + fmtS(r.short) + ' s short' : '') + '  →  ' + r.units.join(' ') +
            ' · seed ' + o.seed + ' · spread ' + r.spread + '×' + (c.count ? ' · count ' + c.count + ' → × ' + o.unit + ' s' : '') + (filled ? ' · chords kept by position' : ' · click each box and give it a take — a box left empty is a REST'));
    },

    // ------------------------------------------------------------------ the edges (1d.8): a fade in, a fade out, and how the players leave. How they ENTER is box 1's `enter`
    isDefaultEdges() { return JSON.stringify(this.edgesDefaults(this.row.edges)) === JSON.stringify(this.edgesDefaults()); },
    buildEdges() {
        const line = this.el.querySelector('#sqEdges'); if (!line) return;
        const lab = 'color:#8a8', L = LADDER(), far = '<option value="' + SEQ.NIENTE + '">niente</option>' + (L ? L.NAMES : []).map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('');
        line.innerHTML = '<span style="color:#e6c46a">edges</span>' +
            '<label style="' + lab + '" title="the sequence comes IN over this many seconds. 0 = it just starts. The fade follows how it begins (box 1\'s `enter`): everyone together → one fade for all · staggered → each player fades in on their own entry">fade in <input id="sqEIn" type="number" step="0.5" min="0" max="600" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="where the fade in starts FROM — niente = true silence (the fader from zero) · a dynamic = a calibrated crescendo or diminuendo into the box; it may be LOUDER than the box — an entry that settles">from <select id="sqEFrom" style="' + INP + '">' + far + '</select></label>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<label style="' + lab + '" title="the sequence goes OUT over this many seconds. 0 = it just ends. The fade follows the exit: together → one fade for all · one by one → each player fades on their own ending">fade out <input id="sqEOut" type="number" step="0.5" min="0" max="600" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="where the fade out arrives — niente = true silence · a dynamic = a calibrated diminuendo or crescendo out of the box">to <select id="sqETo" style="' + INP + '">' + far + '</select></label>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<label style="' + lab + '" title="how the players LEAVE — together: every last breath lands on the end · one by one: each player finishes a last breath of their own, the ends spread over the last stretch before the line (the fade out\'s length, else one breath), the latest ON the line">exit <select id="sqEExit" style="' + INP + '">' + SEQ.EXITS.map(x => '<option value="' + x + '">' + x + '</option>').join('') + '</select></label>';
        const q = s => line.querySelector(s);
        ['sqEIn', 'sqEFrom', 'sqEOut', 'sqETo', 'sqEExit'].forEach(id => {
            q('#' + id).addEventListener('change', e => {
                e.target.blur();
                this.row.edges = this.edgesDefaults({ fadeIn: q('#sqEIn').value, fadeInFrom: q('#sqEFrom').value, fadeOut: q('#sqEOut').value, fadeOutTo: q('#sqETo').value, exit: q('#sqEExit').value });
                this.save(); this.paintEdges(); this.edgesStatus();
            });
            if (id === 'sqEIn' || id === 'sqEOut') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
    },
    paintEdges() {
        const line = this.el && this.el.querySelector('#sqEdges'); if (!line) return;
        line.style.display = this.edgesOpen ? 'flex' : 'none';
        const tog = this.el.querySelector('#sqEdgesTog');
        if (tog) { tog.textContent = 'edges' + (this.isDefaultEdges() ? '' : ' •') + (this.edgesOpen ? ' ▾' : ' ▸'); tog.style.background = this.edgesOpen ? '#3a3218' : '#2a2a30'; }
        const e = this.row.edges, q = s => line.querySelector(s); if (!q('#sqEIn')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#sqEIn', e.fadeIn); put('#sqEFrom', e.fadeInFrom); put('#sqEOut', e.fadeOut); put('#sqETo', e.fadeOutTo); put('#sqEExit', e.exit);
        q('#sqEFrom').parentNode.style.opacity = e.fadeIn > 0 ? 1 : 0.45; q('#sqETo').parentNode.style.opacity = e.fadeOut > 0 ? 1 : 0.45;
    },
    edgesStatus() {
        const e = this.row.edges, b0 = this.row.boxes[0], begins = ((b0 && b0.change) || this.row.change) === 'attack' ? 'together' : 'staggered';
        const txt = 'begins ' + begins + (e.fadeIn > 0 ? ', ' + fmtS(e.fadeIn) + ' s from ' + e.fadeInFrom + (begins === 'together' ? ' (one fade)' : ' (each on their own entry)') : '') +
            ' · ends ' + e.exit + (e.fadeOut > 0 ? ', ' + fmtS(e.fadeOut) + ' s to ' + e.fadeOutTo + (e.exit === 'together' ? ' (one fade)' : ' (each on their own ending)') : '');
        if (!this.row.boxes.some(x => x.chord.length)) { this.setStatus('edges: ' + txt + ' — no chord in the row yet'); return; }
        const G = this.generate(0); if (!G) return;
        const faded = G.notes.filter(n => n.fade).length, ramped = G.notes.filter(n => n.ramp).length;
        this.setStatus('edges: ' + txt + '  →  ' + G.notes.length + ' notes' + (faded ? ' · ' + faded + ' under a niente fade' : '') + (ramped ? ' · ' + ramped + ' ramped to or from a dynamic' : '') + this.flagsText(G));
    },

    // ------------------------------------------------------------------ the waves (1d.7): every player on a stream of swells of their own; a box reads them or holds a straight dynamic
    isDefaultWaves() { return JSON.stringify(this.wavesDefaults(this.row.waves)) === JSON.stringify(this.wavesDefaults()); },
    buildWaves() {
        const line = this.el.querySelector('#sqWaves'); if (!line) return;
        const lab = 'color:#8a8', L = LADDER(), d = SEQ.DEFAULT_WAVES, opts = (L ? L.NAMES : []).map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('');
        line.innerHTML = '<span style="color:' + WTINT + '">waves</span>' +
            '<input id="sqWVals" type="text" style="' + INP + ';width:8.182em" title="the POOL of swell lengths in seconds, separated by spaces — short with long. Each player draws a stream of their own from it. Default ' + d.lengths.values.join(' ') + '">' +
            '<input id="sqWW" type="text" placeholder="weights" style="' + INP + ';width:8.182em" title="one weight per length, or blank. 20 or 20% or 0.2 all mean a fifth; a dash means “share what is left”">' +
            '<label style="' + lab + '" title="the BOTTOM of every wave, and where a player sits between swells — a written dynamic. There is no niente inside the waves: silence belongs to the sequence\'s edges">low <select id="sqWLo" style="' + INP + '">' + opts + '</select></label>' +
            '<label style="' + lab + '" title="the TOP of every wave — a written dynamic. Every waved note is struck at THIS level\'s velocity and the fader does the moving, so a breath re-entering mid-wave does not lurch">high <select id="sqWHi" style="' + INP + '">' + opts + '</select></label>' +
            '<label style="' + lab + '" title="how much of the time a player is inside a swell, 0 … 1 — the rest sits at `low`. 1 = swells back to back · 0 = flat at `low`. Default ' + d.density + '">density <input id="sqWDen" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:4.364em"></label>' +
            '<label style="' + lab + '" title="where the top sits inside a swell, 0 … 1 — 0.5 even · 0.7 a slow rise and a quick fall · 0.3 the reverse. A little seeded jitter round it. Default ' + d.peak + '">peak <input id="sqWPeak" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:4.364em"></label>' +
            '<label style="' + lab + '" title="the waves have a seed of their own — the same seed deals the same streams">seed <input id="sqWSeed" type="number" step="1" min="1" style="' + INP + ';width:4.364em"></label>' +
            '<button id="sqWNext" style="' + BTN + ';color:' + WTINT + '" title="the next seed: every player\'s stream is dealt again — the chords, the durations and the breath dials are not touched (a wave that passes a louder top may shorten a breath: the ceiling is read at the loudest point)">re-wave</button>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<span style="' + lab + '">all boxes →</span><button id="sqWAll" style="' + BTN + ';color:' + WTINT + '" title="every box reads the waves (each remembers the straight dyn it had)">waves</button>' +
            '<button id="sqWNone" style="' + BTN + '" title="every box back to the straight dyn it had before the waves">straight</button>';
        const q = s => line.querySelector(s);
        ['sqWVals', 'sqWW', 'sqWLo', 'sqWHi', 'sqWDen', 'sqWPeak', 'sqWSeed'].forEach(id => {
            q('#' + id).addEventListener('change', e => { if (e.target.tagName === 'SELECT' || e.target.type === 'number') e.target.blur(); this.readWaves(); this.save(); this.paintWaves(); this.wavesStatus('waves'); });
            if (id !== 'sqWLo' && id !== 'sqWHi') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
        q('#sqWNext').addEventListener('click', () => { this.stop(); this.row.waves.seed = Math.max(1, Math.round(+this.row.waves.seed || 1)) + 1; this.save(); this.paintWaves(); this.wavesStatus('re-waved'); });
        q('#sqWAll').addEventListener('click', () => this.setAllBoxes(true));
        q('#sqWNone').addEventListener('click', () => this.setAllBoxes(false));
    },
    readWaves() {
        const line = this.el.querySelector('#sqWaves'), q = s => line.querySelector(s), w = this.row.waves, d = SEQ.DEFAULT_WAVES;
        const num = (s, def) => { const v = q(s).value.trim(); return v === '' || !isFinite(+v) ? def : +v; };
        const nums = String(q('#sqWVals').value || '').split(/[\s,]+/).map(Number).filter(x => isFinite(x) && x > 0);
        w.lengths = nums.length ? { values: nums, weights: this.parseWeights(nums, q('#sqWW').value) } : JSON.parse(JSON.stringify(d.lengths));   // an emptied box goes back to the default pool — the waves always have one
        w.low = this.straightOk(q('#sqWLo').value) === AS_DEALT ? d.low : q('#sqWLo').value; w.high = this.straightOk(q('#sqWHi').value) === AS_DEALT ? d.high : q('#sqWHi').value;
        w.density = clamp(num('#sqWDen', d.density), 0, 1); w.peak = clamp(num('#sqWPeak', d.peak), 0, 1); w.seed = Math.max(1, Math.round(num('#sqWSeed', d.seed)));
    },
    paintWaves() {
        const line = this.el && this.el.querySelector('#sqWaves'); if (!line) return;
        line.style.display = this.wavesOpen ? 'flex' : 'none';
        const n = this.row.boxes.filter(b => b.dyn === WAVES).length, tog = this.el.querySelector('#sqWavesTog');
        if (tog) { tog.textContent = 'waves' + (n ? ' ∿' + n : '') + (this.wavesOpen ? ' ▾' : ' ▸'); tog.style.background = this.wavesOpen ? '#2a2140' : '#2a2a30'; }   // ∿N: how many boxes read the waves
        const w = this.row.waves, q = s => line.querySelector(s); if (!q('#sqWVals')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#sqWVals', w.lengths.values.join(' '));
        put('#sqWW', w.lengths.weights && w.lengths.weights.some(x => x != null) ? w.lengths.weights.map(x => (x == null ? '-' : (Math.round(x * 1000) / 10) + '%')).join(' ') : '');
        put('#sqWLo', w.low); put('#sqWHi', w.high); put('#sqWDen', w.density); put('#sqWPeak', w.peak); put('#sqWSeed', w.seed);
    },
    // one control sets every box at once (his "most common situation"); any single box can then be flipped on its own line
    setAllBoxes(toWaves) {
        const B = this.row.boxes.filter(b => b.chord.length); if (!B.length) { this.setStatus('no box with a chord yet', true); return; }
        this.stop();
        B.forEach(b => { if (toWaves) { if (b.dyn !== WAVES) { b.dynWas = b.dyn; b.dyn = WAVES; } } else if (b.dyn === WAVES) b.dyn = this.straightOk(b.dynWas); });
        this.save(); this.render(); this.wavesStatus(toWaves ? 'all boxes read the waves' : 'all boxes straight again');
    },
    // what the waves made of the row: how many notes read them, between what, and each player's swells — or what is wrong
    wavesStatus(lead) {
        const w = this.row.waves, txt = w.lengths.values.join(' ') + ' s · ' + w.low + ' … ' + w.high + ' · density ' + w.density + ' · peak ' + w.peak + ' · seed ' + w.seed;
        if (!this.row.boxes.some(b => b.dyn === WAVES && b.chord.length)) { this.setStatus(lead + ': ' + txt + ' — no box reads the waves yet: set a box\'s dyn to `waves`, or `all boxes → waves`'); return; }
        const G = this.generate(0); if (!G) return;   // generate() has said why (low above high, …)
        const waved = G.notes.filter(n => n.waves).length, sw = Object.keys(G.streams || {}).map(k => G.streams[k].swells);
        this.setStatus(lead + ': ' + txt + '  →  ' + waved + ' of ' + G.notes.length + ' notes read the waves · swells per player ' + sw.join(' ') + this.flagsText(G));
    },

    // ------------------------------------------------------------------ the breath (1d.5): the generator's own dials — the morph's numbers until he touches one
    isDefaultBreath() { const b = this.row.breath, d = SEQ.DEFAULT_BREATH; return b.striation === d.striation && +b.length === d.length && +b.jitter === d.jitter && (b.seed | 0) === d.seed && (b.together == null ? null : +b.together) === NEW_BREATH.together && +b.apart === NEW_BREATH.apart && !b.lengths; },
    buildBreath() {
        const line = this.el.querySelector('#sqBreath'); if (!line) return;
        const lab = 'color:#8a8', d = SEQ.DEFAULT_BREATH;
        line.innerHTML = '<span style="color:#8fd0a0">breath</span>' +
            '<label style="' + lab + '" title="how the players\' FIRST breaths are set against each other — the morph\'s five. staggered: one after another across half a breath · grouped: in three waves · aligned: together · converging / diverging: as the morph has them — they set the first entry only (converging starts staggered, diverging starts aligned)">striation <select id="sqBStri" style="' + INP + '">' + SEQ.STRIATIONS.map(s => '<option value="' + s + '">' + s + '</option>').join('') + '</select></label>' +
            '<label style="' + lab + '" title="the wanted length of a breath or a bow — the morph\'s ' + d.length + ' s. The instrument\'s ceiling still splits anything longer. With a pool of lengths this only spaces the first entries">length <input id="sqBLen" type="number" step="0.5" min="0.5" max="120" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="how far a breath may fall from the length — the morph\'s ' + d.jitter + ' = ±' + Math.round(d.jitter * 100) + '%. Not applied to a pool value">± <input id="sqBJit" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:4.364em"></label>' +
            '<label style="' + lab + '" title="BLANK = free, the morph\'s way: two players begin a breath together only by chance · 0 = NEVER: every start is kept `apart` from every other player\'s · between: that share of the re-entries snaps onto another player\'s, the rest are kept apart · 1 = everyone re-enters together. The shortest breath leads (the bowed vibraphone, when it plays). An attack line is everyone, by design, and stands outside this">together <input id="sqBTog" type="number" step="0.1" min="0" max="1" placeholder="free" style="' + INP + ';width:4.727em"></label>' +
            '<label style="' + lab + '" title="how close two players\' starts may come while `together` is under 1 — a number for your ear. Eight players have room for about 0.75 s; past that some starts are flagged CROWDED and left where they fell">apart <input id="sqBApart" type="number" step="0.05" min="0.05" max="10" style="' + INP + ';width:4.364em"> s</label>' +
            '<input id="sqBVals" type="text" placeholder="lengths — a pool" style="' + INP + ';width:10em" title="a POOL of breath lengths in seconds, separated by spaces — short with long, e.g. 3 9. Each breath\'s wanted length is drawn from it (each player a stream of its own) instead of length ± jitter; the ceiling still binds. Blank = no pool">' +
            '<input id="sqBW" type="text" placeholder="weights" style="' + INP + ';width:8.182em" title="one weight per pool value, or blank. 20 or 20% or 0.2 all mean a fifth; a dash means “share what is left”">' +
            '<label style="' + lab + '" title="the same seed deals the same breaths">seed <input id="sqBSeed" type="number" step="1" min="1" style="' + INP + ';width:4.364em"></label>' +
            '<button id="sqBNext" style="' + BTN + ';color:#8fd0a0" title="the next seed: every breath is dealt again — the chords and the durations are not touched">re-breathe</button>';
        const q = s => line.querySelector(s);
        ['sqBStri', 'sqBLen', 'sqBJit', 'sqBTog', 'sqBApart', 'sqBVals', 'sqBW', 'sqBSeed'].forEach(id => {
            q('#' + id).addEventListener('change', e => { if (e.target.tagName === 'SELECT' || e.target.type === 'number') e.target.blur(); this.readBreath(); this.save(); this.paintBreath(); this.breathStatus('breath'); });
            if (id !== 'sqBStri') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
        q('#sqBNext').addEventListener('click', () => { this.stop(); this.row.breath.seed = Math.max(1, Math.round(+this.row.breath.seed || 1)) + 1; this.save(); this.paintBreath(); this.breathStatus('re-breathed'); });
    },
    // the pool's weights read exactly as the roll's are (rollOpts): 20 · 20% · 0.2 all a fifth, a dash = share what is left
    parseWeights(nums, txt) {
        const raw = String(txt || '').split(/[\s,]+/).filter(x => x !== ''); if (!raw.length) return null;
        return nums.map((v, i) => {
            const t = raw[i]; if (t == null || t === '-') return null;
            const n = parseFloat(String(t).replace('%', '')); if (!isFinite(n)) return null;
            return String(t).indexOf('%') >= 0 || n > 1 ? n / 100 : n;
        });
    },
    readBreath() {
        const line = this.el.querySelector('#sqBreath'), q = s => line.querySelector(s), b = this.row.breath, d = SEQ.DEFAULT_BREATH;
        const num = (s, def) => { const v = q(s).value.trim(); return v === '' || !isFinite(+v) ? def : +v; };
        b.striation = SEQ.STRIATIONS.indexOf(q('#sqBStri').value) >= 0 ? q('#sqBStri').value : d.striation;
        b.length = clamp(num('#sqBLen', d.length), 0.5, 120); b.jitter = clamp(num('#sqBJit', d.jitter), 0, 1);
        const tg = q('#sqBTog').value.trim(); b.together = (tg === '' || !isFinite(+tg)) ? null : clamp(+tg, 0, 1);   // BLANK = free, the morph's way
        b.apart = clamp(num('#sqBApart', d.apart), 0.05, 10);
        const nums = String(q('#sqBVals').value || '').split(/[\s,]+/).map(Number).filter(x => isFinite(x) && x > 0);
        b.lengths = nums.length ? { values: nums, weights: this.parseWeights(nums, q('#sqBW').value) } : null;
        b.seed = Math.max(1, Math.round(num('#sqBSeed', d.seed)));
    },
    paintBreath() {
        const line = this.el && this.el.querySelector('#sqBreath'); if (!line) return;
        line.style.display = this.breathOpen ? 'flex' : 'none';
        const tog = this.el.querySelector('#sqBreathTog');
        if (tog) { tog.textContent = 'breath' + (this.isDefaultBreath() ? '' : ' •') + (this.breathOpen ? ' ▾' : ' ▸'); tog.style.background = this.breathOpen ? '#1d3325' : '#2a2a30'; }   // the dot: a dial is off the morph's numbers
        const b = this.row.breath, q = s => line.querySelector(s); if (!q('#sqBStri')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#sqBStri', b.striation); put('#sqBLen', b.length); put('#sqBJit', b.jitter); put('#sqBTog', b.together == null ? '' : b.together); put('#sqBApart', b.apart);
        put('#sqBVals', b.lengths ? b.lengths.values.join(' ') : '');
        put('#sqBW', b.lengths && b.lengths.weights && b.lengths.weights.some(w => w != null) ? b.lengths.weights.map(w => (w == null ? '-' : (Math.round(w * 1000) / 10) + '%')).join(' ') : '');
        put('#sqBSeed', b.seed);
        q('#sqBApart').parentNode.style.opacity = (b.together == null || b.together >= 1) ? 0.45 : 1;   // `apart` means something only while together is 0 … under 1
        q('#sqBLen').parentNode.style.opacity = q('#sqBJit').parentNode.style.opacity = b.lengths ? 0.45 : 1;
    },
    // what the dials made of the row: the notes, the starts snapped and kept apart, who leads — or what is wrong
    breathStatus(lead) {
        const b = this.row.breath;
        const txt = b.striation + ' · ' + (b.lengths ? 'pool ' + b.lengths.values.join(' ') : fmtS(b.length) + ' s ± ' + b.jitter) +
            ' · together ' + (b.together == null ? 'free' : b.together + (b.together < 1 ? ' (apart ' + b.apart + ' s)' : '')) + ' · seed ' + b.seed;
        if (!this.row.boxes.some(x => x.chord.length)) { this.setStatus(lead + ': ' + txt + ' — no chord in the row yet'); return; }
        const G = this.generate(0); if (!G) return;   // generate() has said why
        const crowded = G.notes.filter(n => (n.flags || []).indexOf('CROWDED') >= 0).length;
        const ld = G.dealt && G.dealt[0] ? G.dealt[0].split(':') : null;
        this.setStatus(lead + ': ' + txt + '  →  ' + G.notes.length + ' notes' + this.flagsText(G) + (ld ? ' · led by ' + shortOf(+ld[0]) + (+ld[1] ? '²' : '') : '') +
            (crowded ? ' — CROWDED: `apart` is wider than this many players have room for' : ''), !!crowded);
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
        // 1d.7: the waves' dials travel when a box reads them, or when they were moved off their defaults; a waves box keeps the straight dyn it had
        const wavesToo = r.boxes.some(b => b.dyn === WAVES) || !this.isDefaultWaves();
        return Object.assign({ t0: +t0 || 0, change: r.change, breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}),
            containers: r.boxes.map(b => Object.assign({ dur: +b.dur, dyn: b.dyn, take: b.take, chord: b.chord.length ? b.chord : null }, b.dyn === WAVES ? { dynWas: b.dynWas || AS_DEALT } : {},
                (b.change && b.change !== r.change) ? { change: b.change } : {})) },   // 1d.8: a box carries its own `enter` only when it differs from the sequence's
            wavesToo ? { waves: this.wavesDefaults(r.waves) } : {},
            this.isDefaultEdges() ? {} : { edges: this.edgesDefaults(r.edges) },
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
        const notes = [], ramps = [], shaped = [];
        G.notes.forEach(n => {
            if (n.end <= from + 0.02) return;
            const st = Math.max(n.start, from), onMs = Math.round((st - from) * 1000), durMs = Math.max(30, Math.round((n.end - st) * 1000));
            // 1d.7 · 1d.8: a note whose level MOVES — it read the waves, it lies under a niente fade, it is ramped to or from a dynamic — is
            // struck at ONE velocity and its CC7 follows (scheduleRamps). A strike just takes its level
            // PLAN 1e: a SHAPED note is STRUCK AT MF — the ANCHOR, which playNotes remaps into this instrument's own velocity.
            // PLAN 1d.10: and its fader runs between the CC7 values of its own two written dynamics, every breakpoint on its own.
            const ramped = (!!n.waves || !!n.fade || !!n.ramp) && n.kind !== 'fixed', sh = ramped ? this.shape(n) : null;
            const rec = { lane: n.lane, tech: n.tech, midi: n.midi, seat: n.seat || 0, vel: ramped ? MF_ANCHOR : anchorOf(n.level), onMs: onMs, durMs: durMs,
                cents: n.cents ? n.cents : (bends[n.player] ? RECENTRE : 0), partial: n.partial };
            notes.push(rec);
            if (ramped) { shaped.push(sh); ramps.push({ lane: n.lane, tech: n.tech, seat: n.seat || 0, midi: n.midi, onMs: onMs, durMs: durMs, skipS: st - n.start, noteStart: n.start,
                levels: sh.levels, velRef: yOf(this.mfLevel()), cc7Abs: sh.cc7Abs, fade: n.fade || null, note: rec }); }
        });
        const onMain = this.curveSeats(ramps);   // 1e V2b: and each of them onto a CURVE channel — MAIN takes no moving controller (D11)
        return { G: G, from: from, notes: notes, ramps: ramps, shaped: shaped, onMain: onMain };
    },
    // 1d.7 — SPACE CARRIES THE WAVE (the head of this file has the why): each waved note's CC7 ramp, sent from here AFTER D.playNotes has
    // scheduled the notes — its routes, MorphEmit's timers, the score's own law (Composer.heldCc7 on a stand-in stamped velRef = high).
    // A point every RAMP_MS where the value changes. Returns how many messages were scheduled
    // ---------------------------------------------------------------- PLAN 1e, the two rules
    // RULE 1 — mf for ALL instruments. The cost, accepted (his call 2026-09-20): a shape tops out at mf loudness, 3.9 ... 5.4 dB under a
    // struck fff — but UNIFORMLY so, because 1b calibrated every instrument to one written span, so the balance holds.
    mfLevel() { const L = LADDER(), lo = L ? L.LO : 65, hi = L ? L.HI : 127; return clamp((MF_ANCHOR - lo) / (hi - lo), 0, 1); },
    mfVel(lane, midi) {
        const C = C_(), VR = VR_(), T = (D.tracks ? D.tracks() : []);
        const key = T[lane] && T[lane].instKey;
        const d = (VR && C && C._velRemap && key && VR.heldNote) ? VR.heldNote(C._velRemap, key, midi, MF_ANCHOR) : null;
        return d ? d.vel : MF_ANCHOR;   // no bank loaded: the anchor itself, as everything else in this file falls back
    },
    // RULE 2 — AMENDED BY 1d.10: THE WRITTEN DYNAMICS ARE THE FADER RANGE. Not 0 ... 127 for every shape, but the CC7 values the
    // note's own lowest and highest written levels have on THIS instrument (`dyn_table.js`, 4 dB a written step through the
    // measured curve). Two shapes of equal DEPTH therefore sound at different heights, which is the whole point of the step —
    // and because the table is ABSOLUTE, two notes of the same player join at the same level without any shared "top" to
    // measure from, which is what 1e needed `topOf` for. Every breakpoint is placed at its OWN table value, not interpolated
    // between the two ends: the ladder is not linear in CC7 and a straight line would miss every dynamic in between.
    instKeyOf(lane) { const T = (D.tracks ? D.tracks() : []); return (T[lane] && T[lane].instKey) || null; },
    levelsOf(n) { return (n.levels && n.levels.length >= 2) ? n.levels : [[0, n.level], [Math.max(0.001, +n.dur || 0), n.level]]; },
    // a shaped note's fader: { cc7Abs, levels } — the drawn heights that put each breakpoint on its written dynamic
    shape(n) {
        const L = this.levelsOf(n).map(p => [p[0], clamp(+p[1] || 0, 0, 1)]);
        let lo = 1, hi = 0; L.forEach(p => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
        const T = DT_(), C = C_(), bank = C ? C._velRemap : null, key = this.instKeyOf(n.lane);
        if (!T) return { key: key, measured: false, cc7Abs: { lo: CC7_FULL.lo, hi: CC7_FULL.hi },   // no dyn_table.js on the page: 1e's law, the note's own top at full
            levels: L.map(p => [p[0], clamp(1 - (hi - p[1]), 0, 1)]) };
        return { key: key, measured: T.hasCurve(bank, key),
            cc7Abs: T.range(bank, key, lo, hi), levels: L.map(p => [p[0], T.height(bank, key, p[1], lo, hi)]) };
    },
    // 1d.10: the fader span the shaped notes were actually given — the status states the claim his ear is judging, because
    // "a stated range is what sounds" is only true if the numbers that went out say so
    rangeText(shaped) {
        if (!shaped || !shaped.length) return '';
        let lo = 127, hi = 0;
        shaped.forEach(s => { const a = s.cc7Abs || {}; lo = Math.min(lo, a.lo != null ? a.lo : 0); hi = Math.max(hi, a.hi != null ? a.hi : 127); });
        return ' · the fader CC7 ' + lo + '…' + hi;
    },
    // what the status line says about the table: the bank gives every instrument its MEASURED fader law, and without it the
    // table is the UVI law's guess — a claim about the sound, so it is said out loud rather than assumed. Only the instruments
    // that actually SHAPED a note are counted: the percussion lane carries no fader curve and never shapes one (a strike is
    // `fixed`), so it is not a fault and must not be reported as one.
    tableNote(shaped) {
        if (!DT_()) return ' · NO dyn_table.js — the fader is 1e\'s 0…127';
        const guessed = [...new Set((shaped || []).filter(s => !s.measured).map(s => s.key || '?'))];
        return guessed.length ? ' · NO MEASURED CURVE for ' + guessed.join(', ') + ' — the table is the UVI law there' : '';
    },
    // 1e V2b — THE ROUTE. A ramped note streams a moving fader, and his rack takes one only on the CURVE channels (D11): MAIN ch 1 is
    // plain notes, dynamics by velocity, no moving controller. So each ramped note is given a MARKER seat — 'c0', 'c1', ... , the index
    // into its instrument's own curve bank — which `playNotes` keys its route cache on and the wrapper at the foot of this file resolves.
    // Round robin per player in time order, exactly as the score's own curveChannelMap does. A REAL seat (the second vibraphone) is
    // already on a curve channel and keeps it; a technique with no curve copy stays on MAIN and the status says how many.
    curveSeats(ramps) {
        const C = C_(); if (!C || typeof C.curveChannelsOf !== 'function') return ramps.filter(w => !w.seat).length;
        const byLane = {}; let onMain = 0;
        ramps.forEach(w => { if (w.seat) return; (byLane[w.lane] = byLane[w.lane] || []).push(w); });
        Object.keys(byLane).forEach(k => {
            const lane = +k, list = byLane[k].slice().sort((a, b) => a.onMs - b.onMs), freeAt = new Map();
            list.forEach(w => {
                const pool = C.curveChannelsOf(lane, w.tech) || [];
                if (!pool.length) { onMain++; return; }
                let pick = -1, best = Infinity;
                for (let i = 0; i < pool.length; i++) { const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f <= w.onMs + 1e-9 && f < best) { best = f; pick = i; } }
                if (pick < 0) { pick = 0; let lo = Infinity; for (let i = 0; i < pool.length; i++) { const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f < lo) { lo = f; pick = i; } } }
                freeAt.set(pick, w.onMs + w.durMs + 50);   // its own span and a breath after it, as curveChannelMap's 0.05 s
                w.seat = 'c' + pick; if (w.note) w.note.seat = w.seat;
            });
        });
        return onMain;
    },
    rampPoints(w) {
        const C = C_(); if (!C || typeof C.heldCc7 !== 'function') return [];
        // 1d.8: a niente fade rides on the stand-in as the score's own `cc7Fade` — heldCc7 multiplies it in, at the time it is asked for
        // 1e: the stand-in carries `cc7Abs` too, so Hear's fader is the same normalized one the inserted note will play (heldCc7 reads it
        // BEFORE the ladder; a niente `cc7Fade` still multiplies in on top of the answer)
        const wc = { id: 'seq-hear-' + w.lane + '-' + w.midi, layer: w.lane, sonifyNote: w.midi, velRef: w.velRef, cc7Abs: w.cc7Abs || null, nodes: [], cc7Fade: w.fade || null, startSeconds: w.noteStart }, L = w.levels, out = [];
        const at = x => { if (x <= L[0][0]) return L[0][1]; for (let i = 1; i < L.length; i++) if (x <= L[i][0]) { const p = L[i - 1], q = L[i]; return p[1] + (q[1] - p[1]) * ((x - p[0]) / Math.max(1e-9, q[0] - p[0])); } return L[L.length - 1][1]; };
        let last = -1;
        const point = ms => { const x = w.skipS + ms / 1000, cc = C.heldCc7(wc, at(x), w.noteStart + x); if (cc !== last) { out.push([ms, cc]); last = cc; } };
        for (let ms = 0; ms < w.durMs; ms += RAMP_MS) point(ms);
        point(w.durMs);   // and the note's very end, off the 50 ms grid — a fade to niente arrives AT zero, not one step short of it
        return out;
    },
    scheduleRamps(H) {
        const e = E_(); if (!e || !e._playing || !H.ramps || !H.ramps.length) return 0;
        let sent = 0;
        H.ramps.forEach(w => {
            const r = D.routeFor(w.lane, w.tech, w.seat); if (!r || !r.out) return;
            this.rampPoints(w).forEach(p => {
                const when = D.base + w.onMs + p[0] - RAMP_LEAD_MS, cc = p[1];
                e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, cc]); } catch (x) {} }, Math.max(0, when - performance.now()))); sent++;
            });
        });
        return sent;
    },
    // a box's PREVIEW: its frozen chord on its own, everyone together, PREVIEW_S seconds (or the box's own, if shorter) at the box's
    // dyn — through the same player as Hear. Click the lit button again, or Stop, or SPACE, to cut it short
    async preview(i) {
        const b = this.row.boxes[i]; if (!b || !b.chord.length) return;
        const was = this._previewing; this.stop(); if (was === i) return;
        if (this.sel !== i) { this.sel = i; this.save(); this.render(); }
        const L = LADDER(), dynP = b.dyn === WAVES ? this.row.waves.high : b.dyn, named = dynP !== AS_DEALT && L && L.ANCHOR[dynP] != null;   // a waves box previews its chord flat at the waves' `high` — the chord is what is auditioned, not the wave
        const levelOf = n => named ? (L.ANCHOR[dynP] - L.LO) / (L.HI - L.LO) : (n.level != null ? +n.level : 0.5);
        const bends = {}; this.row.boxes.forEach(x => x.chord.forEach(n => { if (n.cents) bends[n.lane + ':' + (n.seat || 0)] = 1; }));   // as hearNotes: a player bent anywhere in the row is re-centred
        const ms = Math.round(Math.min(PREVIEW_S, +b.dur || PREVIEW_S) * 1000);
        const notes = b.chord.map(n => ({ lane: n.lane, tech: n.tech, midi: n.midi, seat: n.seat || 0, vel: anchorOf(levelOf(n)), onMs: 0, durMs: Math.max(30, ms),
            cents: n.cents ? n.cents : (bends[n.lane + ':' + (n.seat || 0)] ? RECENTRE : 0), partial: n.partial }));
        const label = 'preview · box ' + (i + 1) + (b.take ? ' · ' + b.take : '') + ' · ' + this.players(b.chord) + ' players · ' + fmtS(ms / 1000) + ' s · ' + (b.dyn === WAVES ? 'flat at the waves\' high (' + dynP + ')' : b.dyn);
        await D.playNotes(notes, label);
        const e = E_();
        if (e && e._playing) {
            this._previewing = i; this.renderRow(); this.setStatus(label);
            clearTimeout(this._pvT); this._pvT = setTimeout(() => { if (this._previewing === i) { this._previewing = -1; if (this.isOpen()) this.renderRow(); } }, ms + 400);
        } else { const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); }
    },
    async hear() {
        if (this._previewing >= 0) this.stop();
        const H = this.hearNotes(); if (!H) return;
        if (!H.notes.length) { this.setStatus('nothing to hear', true); return; }
        const label = 'the sequence · ' + this.row.boxes.length + ' box' + (this.row.boxes.length > 1 ? 'es' : '') + ' · ' + fmtS(H.G.total - H.from) + ' s' + (H.from ? ' from box ' + (this.sel + 1) : '');
        await D.playNotes(H.notes, label);
        const e = E_();
        if (e && e._playing) { const cc = this.scheduleRamps(H); this.setStatus('hearing ' + label + ' · ' + H.notes.length + ' notes' + (H.ramps.length ? ' · ' + H.ramps.length + ' shaped, struck at mf on the curve channels (' + cc + ' fader moves)' + this.rangeText(H.shaped) + this.tableNote(H.shaped) : '') + (H.onMain ? ' · ' + H.onMain + ' had no curve channel — on MAIN, so their fader will not move' : '') + this.flagsText(H.G)); this.startLine(H); }
        else { const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); }
    },
    stop() {
        const e = E_(); if (e && e._playing) { e.panic(); if (D.onStopped) D.onStopped(); } this.stopLine();
        if (this._previewing >= 0) { this._previewing = -1; clearTimeout(this._pvT); if (this.el && this.isOpen()) this.renderRow(); }
    },
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
        let maxEnd = G.end, written = 0; const busy = [], shaped = [];
        const wavesTxt = G.waves ? ' · waves ' + G.waves.low + '…' + G.waves.high : '';
        G.notes.forEach(n => {
            if (typeof C.trillCovers === 'function' && C.trillCovers(n.lane, n.start)) { busy.push(shortOf(n.lane) + '@' + n.start.toFixed(2)); return; }   // TRILLS_TOOL §7, as D.insert
            maxEnd = Math.max(maxEnd, n.end);
            // PLAN 1d.10 (amending 1e's rule 2): a SHAPED note's heights are the drawn heights that put each breakpoint on the CC7 of
            // its own written dynamic, between the two the note asks for. A straight note is drawn as it always was.
            const ramped = (!!n.waves || !!n.fade || !!n.ramp) && n.kind !== 'fixed', sh = ramped ? this.shape(n) : null;
            if (sh) shaped.push(sh);
            const src = ramped ? sh.levels : (n.levels && n.levels.length >= 2 ? n.levels : [[0, n.level], [n.dur, n.level]]);
            const nodes = src.map(p => ({ pos: n.dur > 0 ? clamp(p[0] / n.dur, 0, 1) : 0, y: yOf(p[1]), smooth: 0.25 }));
            const segments = []; for (let k = 1; k < nodes.length; k++) segments.push({ model: 'power', slope: 0 });
            const box = this.row.boxes[n.container] || {};
            // 1d.7: a note that read the waves is written DRAWN — its breakpoints are the nodes above — and stamped `velRef` = the waves'
            // `high`, so the score strikes every waved note at ONE velocity and lets CC7 follow the curve (composer.html curveTop / heldCc7:
            // the morph's way). A strike (a fixed-length sound) took its level from the wave and stays plain.
            // 1d.8: the same for a note under a niente fade (it carries the score's own `cc7Fade`, in score seconds) and for one ramped to or
            // from a dynamic (the ramp is already in its breakpoints). One velocity: the waves' `high`, or the note's own loudest if louder.
            // 1e: `ramped` and its top are computed with the nodes above, because the nodes are now re-based against that top.
            C.objects.push(Object.assign({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: group,
                startSeconds: n.start, endSeconds: n.end, nodes: nodes, segments: segments,
                color: COLOR, fillMode: 'bottom', opacity: 0.55, properties: {}, srcKind: 'sequence',
                performanceNotes: name + ' · box ' + (n.container + 1) + (box.take ? ' · ' + box.take : '') + (n.partial != null ? ' · partial ' + n.partial : '') + (n.cents ? ' · ' + (n.cents > 0 ? '+' : '') + Math.round(n.cents) + '¢ just' : '') + (n.waves ? wavesTxt : ''),
                sonifyNote: n.midi, technique: n.tech, recVel: anchorOf(n.level) },
                // PLAN 1e: the NORMALIZED FADER and the MF STRIKE, per note. `velRef` is kept and now means the mf height, so a note that
                // loses `cc7Abs` or `velAbs` by hand still falls back to being struck at mf with its fader on the ladder from there.
                ramped ? { velRef: yOf(this.mfLevel()), cc7Abs: { lo: sh.cc7Abs.lo, hi: sh.cc7Abs.hi }, velAbs: this.mfVel(n.lane, n.midi) } : {},
                (ramped && n.fade) ? { cc7Fade: { start: n.fade.start, end: n.fade.end, from: n.fade.from, to: n.fade.to, curve: n.fade.curve } } : {},
                (n.seat || n.cents || ramped) ? {} : { sonifyMode: 'plain' },   // 1c.3 / 1c.4, as D.insert: a seat's note or a bent note is DRAWN (its own curve channel), the rest hold MAIN
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
        // THE CURVE-CHANNEL MAP IS CACHED (D11, composer.html curveChannelMap): once the score has been played, a note that is not in the map falls
        // back to MAIN ch 1 - and a waved, faded or bent note is a CURVE event, whose moving CC7 his rack takes only on the curve channels.
        // Every other tool that writes curve events drops the map (swell_ui, fill_ui, cresc_*, note_card); this one did not, so an inserted
        // sequence played flat, at one dynamic, until the tab was reloaded (his report, RUNNING_LOG 139).
        if (C.curveDirty) C.curveDirty();
        C.renderAll(); C.markDirty();
        this._listSig = ''; this.renderList(); this.paintInsert();
        const how = inPlace ? 're-inserted IN PLACE' : (sits != null ? 'MOVED to the playhead' : 'inserted');
        this.setStatus(how + ' · ' + written + ' notes · ' + t0.toFixed(3) + ' → ' + G.end.toFixed(3) + ' s as ' + group + ' · the recipe is in the score file' +
            (gone ? ' · replaced ' + gone + ' objects' + (sits != null && !inPlace ? ' at ' + sits.toFixed(3) + ' s' : '') : '') +
            (he && he.edited ? ' · ' + he.edited + ' note' + (he.edited === 1 ? '' : 's') + ' had been moved or re-pitched by hand — overwritten: the recipe is the truth' : '') +
            (he && he.missing > he.edited ? ' · ' + (he.missing - he.edited) + ' of its notes had been deleted — written again' : '') +   // a changed note is also a wanted note unmatched: count only the surplus
            (shaped.length ? ' · ' + shaped.length + ' shaped' + this.rangeText(shaped) + this.tableNote(shaped) : '') +
            this.flagsText(G) + (busy.length ? ' · ' + busy.length + ' skipped — trilling: ' + busy.join(' ') : ''));
    },
};

// ---------------------------------------------------------------- PLAN 1e V2b: the second hook — a MARKER seat resolves to a curve channel
// `strike_drawer.js` is not changed (his 2a). A marker 'cN' on a note means "this one streams a fader: put it on my instrument's Nth curve
// channel". An entry in that bank is a NUMBER (a channel on the instrument's own port) or { port, ch } (the SI2 second instances, the `b`
// ports), which is exactly what Composer.curveRoute resolves; the port's output comes from MorphEmit. Anything this cannot resolve falls
// back to the route the drawer would have given, so a missing bank is quiet, not broken.
const _routeFor = D.routeFor;
D.routeFor = function (lane, techKey, seat) {
    const m = (typeof seat === 'string') ? /^c(\d+)$/.exec(seat) : null;
    const base = _routeFor.call(this, lane, techKey, m ? 0 : seat);
    if (!m || !base) return base;
    const C = C_(), E = E_();
    if (!C || !E || typeof C.curveChannelsOf !== 'function' || typeof C.curveRoute !== 'function') return base;
    const entry = (C.curveChannelsOf(lane, techKey) || [])[+m[1]];
    if (entry == null) return base;
    const r = C.curveRoute(lane, entry), out = E.outputFor(r.port);
    if (!out || !r.ch) return base;
    return Object.assign({}, base, { out: out, port: r.port, ch: r.ch - 1 });
};

// ---------------------------------------------------------------- the one hook on what the drawer does: SPACE, when this strip was clicked last
const _play = D.play;
D.play = function (mode) {
    if (mode === 'orch' && S.isOpen() && S.active) return S.hear();
    return _play.apply(this, arguments);
};

function boot() {
    if (S.el) return;
    S.restore(); S.build(); S.render(); S.setActive(false);
    S.libLoad();                                            // 1d.11: the library from disk, and the first save of a row that only lived in localStorage
    // the last change may be younger than the debounce — `pagehide` is the one event a tab always gets, on a close and on a reload alike
    window.addEventListener('pagehide', () => { try { S.libFlushBeacon(); } catch (e) {} });
}
if (D.el) boot();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
else setTimeout(boot, 0);

root.SequenceDrawer = S;
}(typeof self !== 'undefined' ? self : this));
