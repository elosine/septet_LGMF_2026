// rhythm_seq_ui.js — THE RHYTHM SEQUENCE PANEL (LGMF PLAN 1l.3, 2026-09-21; docs/PLAN.md § 1l; RUNNING_LOG §202; LG-56 · LG-57 · LG-60).
//
// A CLONE of the sequence drawer (sequence_ui.js), born 2026-09-21 of a ONE-TIME transform of that file (the script is
// tools/once/make_rhythm_seq.js — a record; later steps edit THIS file by hand, so it is never re-run) and NOT sharing its code — his
// decision (LG-56): "a clone … not a layer on it"; the architecture is looked at again after this version. It does not change one byte
// of the drawer he composes with. Underneath, it READS the drawer's pure harmony arithmetic, score/public/sequence.js, unchanged — so a
// harmony row behaves identically in both, and the two cannot drift (PLAN 1j's buildCarrier / dealSpan twins are the repo's warning).
//
// TWO ROWS ON ONE TIME SCALE (the boxes are laid out by SECONDS here, not by flex, so the two rows line up):
//   · THE HARMONY ROW — his harmony, built exactly as in the drawer: boxes of take · seconds · dynamic, the takes menu and its ▸, the
//     preview on a box, the roll, a range of boxes, the waves by preset (his presets are the drawer's own, one set for both), the EDGES
//     (kept at his word: "the edges will be useful for dynamics"), the clock and the cursor, the library. It is SILENT in the piece —
//     a MAP: each player's pitch and INTENDED WRITTEN LEVEL at every instant (LG-60). Hear auditions it as held chords; it is never
//     inserted.
//   · IT LEAVES OUT the breath line and `enter`: nothing is held here, so nothing breathes. The generator is handed a fixed HELD breath
//     (MAP_BREATH — each breath the player's own ceiling, no jitter, aligned) and every box is entered by `attack`, so each player's
//     pitch changes exactly at the harmony's lines.
//   · THE RHYTHM ROW — the same idiom, boxes left to right; an empty box is a REST. Its boundaries are INDEPENDENT of the harmony's —
//     a rhythm box can straddle a harmony change. 1l.4's workshop fills it with excerpts of rhythm takes.
// Saved in a library of its own (the `rhythmseqs` store, bank/rhythm_sequences.json) — his sequence library is not touched. In the
// score file it will ride as databases.rhythmSequences once Insert exists (1l.5).
//
// Below: the sequence drawer's own account of itself, inherited, and true here except where the lines above say otherwise.
//
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
//     note drawn, the rest `plain`) as ONE group `grp-seq-<id>` with one META bar, and the recipe into `databases.rhythmSequences`.
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
// THE ROUND TRIP (PLAN 1d.3, RUNNING_LOG §116). `sequences in this score` lists the open score's `databases.rhythmSequences`; pick one and
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
//   → PLAN 1g (2026-09-20) AMENDS THE LAST CLAUSE: a straight SUSTAINED note is shaped too — struck at mf, its fader held flat at its
//   table value on a curve channel — so a straight box and a waves box share ONE scale. See `isShaped`, above `shape`.
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
if (!D || !SEQ) { console.warn('[rhythm_seq_ui] needs the strikes drawer and sequence.js — one is not loaded'); return; }
const SQD = () => root.SequenceDrawer || null;   // 1l.3: the drawer — its curve-channel hook on D.routeFor serves this panel too, and its wave presets are shared
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const VR_ = () => (typeof VelocityRemap !== 'undefined' ? VelocityRemap : (root.VelocityRemap || null));   // 1e: the mf velocity per instrument
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const LADDER = () => root.StrikeDyn || null;   // dyn_ui.js — the drawer's own ladder, the one the generator reads
const DT_ = () => root.DynTable || null;       // dyn_table.js — 1d.10, the CC7 of a written dynamic on a given instrument

const STORE = 'lgmf.rhythmSequence.v1';
// PLAN 1d.11 — THE LIBRARY. `localStorage` above is the INSTANT layer and stays exactly what it was; the DISK is the durable one,
// `bank/rhythm_sequences.json`, a store of its own (never a panel in `panel_snapshots.json`, 3.1 MB of his takes rewritten whole on every
// save — an autosave every couple of seconds must not touch it). A row is ALWAYS on disk: unnamed under a timestamp in a rolling
// stack, named under its name — so `new` destroys nothing, and git can see what he made.
const LIB = { store: 'rhythmseqs', named: 'library', untitled: 'untitled', max: 50, debounce: 2000 };   // 1l.3: bank/rhythm_sequences.json
const LIB_NAME_RE = /^[A-Za-z0-9._ -]{1,64}$/;   // score/snapshots.js's own rule, which refuses a colon — hence `14.32.05`
// PLAN 1d.13 — THE WAVES BY PRESET (LG-49 as amended by LG-50). He does not want to type seconds, weights or a peak:
// *"a sort of presets situation … a way to easily generate a behavior"*. The five below are the AI's starting points and are
// PROVISIONAL — *"probably need to refine all presets while composing"* — so `save preset` keeps his own, and one saved under a
// built-in's name overrides it. The swell they describe: rest at `low` → rise → HOLD at `high` → fall → rest at `low`.
const WAVE_PRESETS = {
    breathing: { shortest: 8, longest: 20, tilt: 0, shape: 'golden', hold: 0.2, density: 0.6, low: 'pp', high: 'mf' },
    tides:     { shortest: 20, longest: 45, tilt: 0, shape: 'even', hold: 0.1, density: 1, low: 'pp', high: 'mf' },
    ripples:   { shortest: 3, longest: 8, tilt: 0, shape: 'even', hold: 0, density: 0.8, low: 'pp', high: 'mf' },
    surges:    { shortest: 6, longest: 14, tilt: 0, shape: 'surge', hold: 0.1, density: 0.35, low: 'pp', high: 'mf' },
    blooms:    { shortest: 12, longest: 30, tilt: 0, shape: 'bloom', hold: 0.35, density: 0.15, low: 'pp', high: 'mf' },
};
const DENSITY_WORDS = [['constant', 1], ['busy', 0.8], ['breathing', 0.6], ['occasional', 0.35], ['rare', 0.15]];   // density in words, not a number
const NEW_WAVES = Object.assign({ seed: 1 }, WAVE_PRESETS.breathing);   // a NEW sequence's waves line: `breathing`, his default
const PRESET_PANEL = 'wavePresets';
const TC = () => root.TimeContainers || null;   // time_containers.js — piece #5's roll, its own module, not changed
const ROW_H = 120;   // the boxes' row: its share of the window when nothing is saved. The row GROWS with the window now (floating, 2026-09-20)
const FS = 15;       // +4 at his word (2026-09-20). THE ONE NUMBER: every size in this strip is this or a proportion of it — change it and the whole strip scales.
                     // Every width, padding and small size below was laid out against 11px and is written in `em`, so it follows FS on its own.
const WIN = { W: 1180, H: 360, MINW: 560, MINH: 220, PAD: 12 };   // the floating window: its size when nothing is saved, and how small it may be dragged
const COLOR = '#C08A52', EDGE_ON = '#f0c890', EDGE_OFF = '#5a4630';   // 1l.3: warm, so the rhythm panel is never mistaken for the drawer
// 1l.3 — THE MAP'S BREATH. The harmony row is a map, not a performance: each player holds a box's note from line to line. The generator
// still splits a note at the instrument's ceiling (it must, and a split is continuous for the map — 1l.5 bridges the gap), so each
// breath is built round the player's OWN maximum with no jitter, aligned, and every box is entered by attack.
const MAP_BREATH = { striation: 'aligned', length: 30, jitter: 0, seed: 1, together: null, apart: 0.5, lengths: null, ofMax: 1, jitterS: 0 };
const MIN_PPS = 6;
const VIB_TECH = 'std_mallets_vel';   // 1l.6: a percussion dot become the vibraphone is STRUCK — Standard Mallets (the AI's call; the card offers the roster)   // 1l.3: the two rows' shared time scale never goes below this many pixels a second (the rows then scroll)
const AS_DEALT = SEQ.AS_DEALT;
const DEF_DUR = 8, MIN_DUR = 0.1, MAX_DUR = 3600;   // 0.1: a rolled container on a small unit may be short
const RECENTRE = 1e-6;   // cents — rounds to the centre; see the head of this file
const WAVES = SEQ.WAVES;   // a box's dyn: read the waves (1d.7)
const RAMP_MS = 50, RAMP_LEAD_MS = 15;   // Hear's CC7 ramp: a point every 50 ms where the value changes; the first lands AFTER playNotes' own CC7 (30 ms before the note) and before the note-on
const WTINT = '#c8a2ff';
const PREVIEW_S = 5;     // a box's preview: its chord held this long (or the box's own seconds, if shorter) — under every ceiling
const DEFAULTS_PANEL = 'defaults', DEFAULTS_KEY = 'breath';   // 1d.14: HIS own default breath line, in the library's store
// PLAN 1d.9 · 1d.14 — a NEW sequence's breath line (RUNNING_LOG 149: `of max` ON at 0.65 · `±` ONE number of seconds for
// everyone, 1.3 s the AI's pick inside the range he named · `outlier` one in ten, his "one in 10 is fine").
const NEW_BREATH = { together: 0.2, apart: 0.6, ofMax: 0.65, jitterS: 1.3, outlier: { share: 0.1, short: 0.4, floor: 2 } };   // a NEW sequence's `together` and `apart` (his call, 2026-09-20: "lets go with .2 for together" - RUNNING_LOG 133 · 134). THE DRAWER's default, not the generator's:
                            // SEQ.DEFAULT_BREATH.together stays null (free), so the 1d gate and every recipe already dealt are untouched. Blank in the box is still free.
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px';   // the size comes from the panel (FS) through #rsStyle — one number, not one per control
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
    el: null, row: null, sel: -1, hearFrom: 'start', active: false, _raf: 0, _painted: false, _listSig: null, _previewing: -1, _pvT: 0, _pvTake: null, _takeMenu: null,

    // ------------------------------------------------------------------ the row being built (remembered in the browser)
    // the roll's dials start from time_containers.js's OWN defaults — the ones the strikes drawer's `containers` shape starts from
    rollDefaults() {
        const d = (TC() && TC().DEFAULTS) || {};
        return { preset: '', values: (d.values || [2, 5, 7, 15]).join(' '), weights: '', tilt: 0, unit: d.unit || 1, total: d.total || 60, count: '',
            stick: d.stick != null ? d.stick : 0.8, jump: d.jump != null ? d.jump : 0.1, contour: d.contour || 'flat',
            turn: d.turn != null ? d.turn : 0.5, bow: d.bow || 1, depth: d.depth != null ? d.depth : 1, seed: d.seed || 1 };
    },
    // 1d.13: a waves line is OLD-STYLE (a typed pool and a `peak`, 1d.7) or PRESET-STYLE (lengths between two numbers, a named
    // shape, a hold). `shape` is what tells them apart, in the generator as here — so an old recipe keeps its own notes until he
    // touches a dial, and is never silently converted by being opened.
    isOldWaves(w) { return !!(w && w.shape == null && w.lengths); },
    wavesDefaults(over) {
        const old = this.isOldWaves(over);
        const w = Object.assign(JSON.parse(JSON.stringify(old ? SEQ.DEFAULT_WAVES : NEW_WAVES)), over || {});
        if (old) w.lengths = JSON.parse(JSON.stringify(w.lengths || SEQ.DEFAULT_WAVES.lengths));
        else { delete w.lengths; delete w.peak; }   // the preset dials replace the pool and the peak outright
        return w;
    },
    densityWord(v) { const hit = DENSITY_WORDS.find(p => Math.abs(p[1] - (+v || 0)) < 1e-9); return hit ? hit[0] : null; },
    // 1l.3: ONE SET OF WAVE PRESETS for both panels — his, kept in the drawer's store (bank/rhythm_sequences.json, panel wavePresets)
    presetIx() { const Q = SQD(); return (Q && Q._lib && Q._lib[PRESET_PANEL]) || {}; },
    async presetPost(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ store: 'sequences', panel: PRESET_PANEL }, body)) });
        const j = await r.json().catch(() => null);
        if (!j || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status));
        const Q = SQD(); if (Q) { Q._lib = Q._lib || {}; const P = Q._lib[PRESET_PANEL] = Q._lib[PRESET_PANEL] || {}; if (body.delete) delete P[body.name]; else P[body.name] = { saved: new Date().toISOString(), state: body.state }; Q._preSig = null; }
        return j;
    },
    presetNames() {
        const mine = Object.keys(this.presetIx()).sort((a, b) => a.localeCompare(b));
        const built = Object.keys(WAVE_PRESETS);
        return built.concat(mine.filter(n => built.indexOf(n) < 0));
    },
    presetOf(name) {
        const his = this.presetIx()[name];                            // one saved under a BUILT-IN's name overrides it
        if (his && his.state && his.state.waves) return JSON.parse(JSON.stringify(his.state.waves));
        return WAVE_PRESETS[name] ? JSON.parse(JSON.stringify(WAVE_PRESETS[name])) : null;
    },
    // which preset the line is sitting on, if any — the dials compared, the seed ignored (it is not part of a behaviour)
    presetMatch() {
        const w = this.row.waves, keys = ['shortest', 'longest', 'tilt', 'shape', 'hold', 'density', 'low', 'high'];
        return this.presetNames().find(n => { const p = this.presetOf(n); return p && keys.every(k => JSON.stringify(w[k]) === JSON.stringify(p[k])); }) || '';
    },
    edgesDefaults(over) { const e = Object.assign({}, SEQ.DEFAULT_EDGES, over || {}); e.fadeIn = clamp(+e.fadeIn || 0, 0, 600); e.fadeOut = clamp(+e.fadeOut || 0, 0, 600); if (SEQ.EXITS.indexOf(e.exit) < 0) e.exit = SEQ.DEFAULT_EDGES.exit; e.fadeInFrom = this.farOk(e.fadeInFrom); e.fadeOutTo = this.farOk(e.fadeOutTo); return e; },
    farOk(d) { const L = LADDER(); return (L && L.NAMES.indexOf(d) >= 0) ? d : SEQ.NIENTE; },   // the far end of a fade: niente, or a name on the ladder
    changeOk(c) { return SEQ.CHANGES.indexOf(c) >= 0 ? c : null; },                              // a box's own `enter`; null = the sequence's rule
    newRow() { return { id: 'r' + Date.now().toString(36), name: '', change: 'attack', breath: Object.assign({}, MAP_BREATH), waves: this.wavesDefaults(), edges: this.edgesDefaults(), boxes: [], rhythm: [], roll: this.rollDefaults(), rolled: false }; },
    // 1l.3 — A RHYTHM BOX: an excerpt of a rhythm take (1l.4: take · start · stop, its length stop − start), or, with no take, a REST
    newRBox() { return { take: '', start: 0, stop: 0, dur: DEF_DUR }; },
    rboxFrom(b) { return { take: String((b && b.take) || ''), start: +(b && b.start) || 0, stop: +(b && b.stop) || 0, dur: clampDur(b && b.dur), state: (b && b.state && typeof b.state === 'object') ? b.state : null,   // 1l.4: the take's recipe, FROZEN
        touches: (b && b.touches && typeof b.touches === 'object') ? b.touches : {}, assign: (b && Array.isArray(b.assign)) ? b.assign : null }; },   // 1l.6: his touches · a line moved to another instrument
    newBox() { return { take: '', dur: DEF_DUR, dyn: AS_DEALT, dynWas: AS_DEALT, change: null, range: null, chord: [], frozen: '' }; },
    save(quiet) { try { localStorage.setItem(STORE, JSON.stringify({ row: this.row, sel: this.sel, hearFrom: this.hearFrom, cursor: this.cursor == null ? null : this.cursor, win: this._win || null, rollOpen: !!this.rollOpen, breathOpen: !!this.breathOpen, wavesOpen: !!this.wavesOpen, edgesOpen: !!this.edgesOpen, libOpen: !!this.libOpen, workOpen: !!this.workOpen, work: this.work || null, dotMode: this.dotMode || 'mute', libKey: this.libKey || null, libPanel: this.libPanel || null, kept: this.kept || null })); } catch (e) {} if (!quiet) { this.libTouch(); this.paintDot(); } },
    // one normalisation of a stored row, whichever store it came from — localStorage, the library on disk, or `revert`'s own copy
    rowFrom(r) {
        if (!(r && typeof r.id === 'string' && Array.isArray(r.boxes))) return this.newRow();
        return { id: r.id, name: String(r.name || ''), change: 'attack',   // 1l.3: every box entered by attack; the map's own breath
            breath: Object.assign({}, MAP_BREATH), waves: this.wavesDefaults(r.waves), edges: this.edgesDefaults(r.edges), roll: Object.assign(this.rollDefaults(), r.roll || {}), rolled: !!r.rolled,
            boxes: r.boxes.map(b => ({ take: String((b && b.take) || ''), dur: clampDur(b && b.dur), dyn: this.dynOk(b && b.dyn), dynWas: this.straightOk(b && b.dynWas), change: null, range: this.rangeOk(b && b.range), chord: Array.isArray(b && b.chord) ? b.chord : [], frozen: String((b && b.frozen) || '') })),
            rhythm: Array.isArray(r.rhythm) ? r.rhythm.map(b => this.rboxFrom(b)) : [] };
    },
    restore() {
        let st = null; try { st = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { st = null; }
        const r = st && st.row;
        if (r && typeof r.id === 'string' && Array.isArray(r.boxes)) {
            this.row = this.rowFrom(r);
            this.sel = Number.isInteger(st.sel) && st.sel >= 0 && st.sel < this.row.boxes.length ? st.sel : (this.row.boxes.length ? 0 : -1);
            this.hearFrom = ['box', 'cursor'].indexOf(st.hearFrom) >= 0 ? st.hearFrom : 'start';
            this.cursor = (typeof st.cursor === 'number' && isFinite(st.cursor)) ? st.cursor : null; this.rollOpen = !!st.rollOpen; this.breathOpen = !!st.breathOpen; this.wavesOpen = !!st.wavesOpen; this.edgesOpen = !!st.edgesOpen;
            this.libOpen = !!st.libOpen;
            this.dotMode = st.dotMode === 'edit' ? 'edit' : 'mute';   // 1l.6
            this.workOpen = !!st.workOpen; this.work = (st.work && typeof st.work === 'object') ? st.work : null;   // 1l.4: the workshop
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
    libBlank() { return !this.row.boxes.length && !(this.row.rhythm || []).length && !this.row.name && !this.row.rolled; },
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
        this.sel = this.row.boxes.length ? 0 : -1; this.selTo = null;
        if (this.row.rolled) this.rollOpen = true;
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
        this.row.id = 'r' + Date.now().toString(36);
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
        this.sel = this.row.boxes.length ? 0 : -1; this.selTo = null;
        this.save(); this._listSig = ''; this.render();
        this.setStatus('reverted to the saved state · ' + this.row.boxes.length + ' box' + (this.row.boxes.length === 1 ? '' : 'es'));
    },
    // the `•` beside the name is painted on every save, not only on a render: a dial that saves without re-rendering the
    // whole strip would otherwise leave it stale, and a stale `•` is a lie about what `revert` would do
    paintDot() {
        const d = this.el && this.el.querySelector('#rsDot'); if (d) d.style.display = this.libDirty() ? '' : 'none';
    },
    paintLib() {
        if (!this.el) return;
        const q = s => this.el.querySelector(s);
        const tog = q('#rsLibTog'); if (tog) { tog.textContent = this.libOpen ? 'library ▾' : 'library ▸'; tog.style.background = this.libOpen ? '#20303a' : '#2a2a30'; }
        const line = q('#rsLib'); if (line) line.style.display = this.libOpen ? 'flex' : 'none';
        this.paintDot();
        const sel = q('#rsLibList');
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
        const where = q('#rsLibWhere');
        if (where) {
            const w = this.libWhere();
            where.textContent = w.name ? (w.panel === LIB.named ? 'saved as "' + w.name + '"' : 'autosaving · ' + w.name) : 'not saved yet';
            where.title = w.name ? 'this row autosaves to bank/rhythm_sequences.json, panel `' + w.panel + '`, under "' + w.name + '"' : 'this row is saved to bank/rhythm_sequences.json at its first change';
        }
        const rv = q('#rsLibRevert'); if (rv) rv.disabled = !this.kept;
        const dl = q('#rsLibDel'); if (dl) dl.disabled = !(sel && sel.value);
    },
    // ------------------------------------------------------------------ A RANGE OF BOXES (1d.12)
    // Between ONE box and ALL boxes there was nothing, and a rolled row can be thirty boxes long. Click = one box, as ever;
    // SHIFT+click = from the selected box to this one. What the edit line sets then goes on every box of the selection.
    selSpan() { const n = this.row.boxes.length; if (this.sel < 0 || !n) return null; const cl = x => Math.max(0, Math.min(n - 1, x)); const a = cl(this.sel), b = this.selTo == null ? a : cl(this.selTo); return { a: Math.min(a, b), b: Math.max(a, b) }; },
    selCount() { const s = this.selSpan(); return s ? (s.b - s.a + 1) : 0; },
    inSel(i) { const s = this.selSpan(); return !!s && i >= s.a && i <= s.b; },
    clearSel(render) { if (this.selTo == null) return; this.selTo = null; this.save(); if (render !== false) this.render(); },
    // run over every box of the selection — one box or sixteen, the same path
    eachSel(fn) { const s = this.selSpan(); if (!s) return 0; let n = 0; for (let i = s.a; i <= s.b; i++) { if (this.row.boxes[i]) { fn(this.row.boxes[i], i); n++; } } return n; },
    selLabel() { const s = this.selSpan(); return !s ? '' : (s.a === s.b ? 'box ' + (s.a + 1) : 'boxes ' + (s.a + 1) + '–' + (s.b + 1)); },
    rangeOk(q) { const L = LADDER(); return (L && q && L.NAMES.indexOf(q.low) >= 0 && L.NAMES.indexOf(q.high) >= 0 && L.ANCHOR[q.low] < L.ANCHOR[q.high]) ? { low: q.low, high: q.high } : null; },
    rangeTag(b) { const q = this.rangeOk(b && b.range); return q ? q.low + '–' + q.high : ''; },
    straightOk(d) { const L = LADDER(); return (L && L.NAMES.indexOf(d) >= 0) ? d : AS_DEALT; },   // a straight dynamic: `as dealt`, or a name on the ladder
    dynOk(d) { return d === WAVES ? WAVES : this.straightOk(d); },                                 // a box's dyn: a straight dynamic, or the waves (1d.7)
    levelOfName(name) { const L = LADDER(); return L && L.ANCHOR[name] != null ? clamp((L.ANCHOR[name] - L.LO) / (L.HI - L.LO), 0, 1) : 0.5; },
    isOpen() { return !!this.el && this.el.style.display !== 'none'; },
    players(chord) { const s = {}; (chord || []).forEach(n => { s[n.lane + ':' + (n.seat || 0)] = 1; }); return Object.keys(s).length; },
    total() { return this.row.boxes.reduce((a, b) => a + (+b.dur || 0), 0); },

    // ------------------------------------------------------------------ build
    build() {
        const sb = document.getElementById('sequenceBtn') || document.getElementById('strikesBtn');   // 1l.3: beside the drawer's own button
        if (sb && !document.getElementById('rhythmSeqBtn')) {
            const btn = document.createElement('button');
            btn.id = 'rhythmSeqBtn'; btn.textContent = 'Rhythm';
            btn.title = 'the RHYTHM SEQUENCE panel (PLAN 1l): a silent HARMONY row — the map of every player\'s pitch and written level — and a RHYTHM row of excerpts from Texture\'s rhythm takes on top, every dot reading its pitch and level from the harmony beneath';
            btn.addEventListener('click', () => this.toggle());
            sb.parentNode.insertBefore(btn, sb.nextSibling);
        }
        const d = document.createElement('div');
        d.id = 'rhythmSeqPanel'; d.tabIndex = -1;
        d.style.cssText = 'position:fixed;z-index:9001;background:#181c20;border:1px solid ' + EDGE_OFF + ';border-top:2px solid ' + EDGE_OFF + ';border-radius:6px;' +
            'color:#ddd;font:' + FS + 'px/1.4 system-ui,sans-serif;display:none;box-shadow:0 10px 34px rgba(0,0,0,.6);overflow:hidden;flex-direction:column;outline:none;' +
            'resize:both;min-width:' + WIN.MINW + 'px;min-height:' + WIN.MINH + 'px';   // resize:both is the browser's own grip, bottom-right; ResizeObserver below remembers what he drags it to
        const L = LADDER();
        d.innerHTML =
            '<div id="rsHead" style="display:flex;gap:8px;row-gap:3px;flex-wrap:wrap;align-items:center;padding:4px 8px;white-space:nowrap;border-bottom:1px solid #2c3238">' +   // 1d.5: it WRAPS, as the roll line does — at 1280 px a placed sequence\'s head was 61 px too long before `breath` was added, and its × was cut off
              '<b style="color:' + COLOR + ';letter-spacing:.08em">RHYTHM SEQUENCE</b>' +
              '<input id="rsName" type="text" placeholder="name" maxlength="64" style="width:10.909em;' + INP + '" title="a name for this sequence. Naming it MOVES it in the library — it is saved under that name from then on, and the untitled entry is gone. The name also goes into the score file with the recipe">' +
              '<span id="rsDot" title="changed since `save` — `revert` (the library line) comes back to the saved state" style="display:none;color:' + WTINT + ';font-size:1.2em;line-height:1">&bull;</span>' +
              '<select id="rsList" style="max-width:18.182em;' + INP + '" title="the sequences placed in the open score (its databases.rhythmSequences) — pick one and it comes back as it was: the boxes, the frozen chords, the seconds, the dyns, attack or seamless. Change anything, then re-insert: it is replaced IN PLACE"></select>' +
              '<button id="rsAdd" style="' + BTN + '" title="add a HARMONY box at the end of the harmony row — a take, its seconds, its dynamic: the map the rhythm reads">+ harmony box</button>' +
              '<button id="rsRAdd" style="' + BTN + ';color:#f0c890" title="add a RHYTHM box at the end of the rhythm row — a rest until the workshop (1l.4) gives it an excerpt of a rhythm take. Its lines are its own: it may straddle a harmony change">+ rhythm box</button>' +
              '<button id="rsLibTog" style="' + BTN + ';color:#7fc4e8" title="the LIBRARY: every sequence you make is on disk in bank/rhythm_sequences.json — unnamed ones in a rolling stack, named ones by name. Open one, duplicate it, delete it; `save` marks a keeper and `revert` comes back to it">library</button>' +
              '<button id="rsRollTog" style="' + BTN + ';color:#e8a06a" title="the ROLL: a set of time containers rolled from a pool of numbers — it lays out the row\'s durations for you">roll</button>' +
              '<button id="rsWavesTog" style="' + BTN + ';color:' + WTINT + '" title="the WAVES: every player rises and falls on a stream of swells of their own, out of step with the others. A box READS the waves when its dyn is `waves`; any box can step out to a straight dynamic and the waves run on under it">waves</button>' +
              '<button id="rsEdgesTog" style="' + BTN + ';color:#e6c46a" title="the EDGES: how the sequence begins and ends — a fade in from nothing (or from a dynamic), a fade out to nothing (or to a dynamic), and whether the players end together or one by one, each finishing a last breath of their own. How it BEGINS — together or staggered — is box 1\'s `enter`">edges</button>' +
              '<span style="color:#b9a" title="what a click on a DOT does (the dot view over the rows) — mute: off or on · edit: its card. SHIFT+click = the whole line of that box · drag a box over dots = several">dots</span>' +
              '<button id="rsDMmute" style="' + BTN + '" title="MUTE: a click turns a dot off or on (SHIFT+click: its whole line in that box; drag a box: several)">mute</button>' +
              '<button id="rsDMedit" style="' + BTN + '" title="EDIT: a click opens the dot\'s card — pitch (from the harmony beneath, then free), dynamic, articulation; the percussion can become the vibraphone">edit</button>' +
              '<button id="rsWorkTog" style="' + BTN + ';color:#f0c890" title="the WORKSHOP (PLAN 1l.4): choose a rhythm take, SEE its lines as dots and HEAR it in the selected harmony box — each player\'s pitch and level from that box — then cut a portion (click a start and a stop on its timeline, or drag across the dots) or take the whole take looped, and save it to the rhythm row">workshop</button>' +
              '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
              '<label title="what SPACE and Hear play — the whole sequence, from the selected box on, or from the CURSOR (click the time strip above the boxes)">hear <select id="rsFrom" style="' + INP + '"><option value="start">from the start</option><option value="box">from the box</option><option value="cursor">from the cursor</option></select></label>' +
              '<button id="rsHear" style="' + BTN + '" title="HEAR THE RHYTHM SEQUENCE: every dot on its player, with the pitch and the written level the harmony has beneath it at that instant — from the start, the box, or the cursor (SPACE)">Hear</button>' +
              '<button id="rsHearMap" style="' + BTN + '" title="AUDITION THE MAP: the harmony row alone, as held chords, to check it by ear. It is never inserted — the harmony is silent in the piece">map ▸</button>' +
              '<button id="rsStop" style="' + BTN + '">Stop</button>' +
              '<button id="rsInsert" style="' + BTN + '">Insert @ playhead</button>' +   // 1l.5: the RHYTHM, every dot reading the harmony
              '<button id="rsMove" style="' + BTN + ';display:none" title="move this sequence to the playhead — the notes where it sits now are removed and it is written again from the playhead">move to playhead</button>' +
              '<button id="rsNew" style="' + BTN + '" title="start a fresh sequence — the row is cleared; a sequence already in the score stays there">new</button>' +
              '<span id="rsSpace" title="SPACE goes to what you clicked last — this strip, the strikes drawer, or the score" style="padding:0 5px;border:1px solid #444;border-radius:3px;font-size:.9em;letter-spacing:.08em">SPACE</span>' +
              '<span id="rsTotal" style="color:#9ab"></span>' +
              '<span id="rsClock" style="color:#9fdcf5;font-variant-numeric:tabular-nums" title="elapsed / total while Hear plays — it stops where Hear stops"></span>' +
              '<span style="flex:1"></span>' +
              '<button id="rsClose" style="' + BTN + '" title="close the sequence drawer (the row is kept)">&times;</button>' +
            '</div>' +
            '<div id="rsLib" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238">' +
              '<select id="rsLibList" style="max-width:24em;' + INP + '" title="every sequence on disk — named ones first, then the untitled stack, newest first. Pick one and it opens; the row you are leaving is already saved, so nothing is lost"></select>' +
              '<button id="rsLibSave" style="' + BTN + '" title="mark this state as the keeper — `revert` comes back to it. Two states per name and never more: the current one and this">save</button>' +
              '<button id="rsLibRevert" style="' + BTN + '" title="go back to the state you last pressed `save` at">revert</button>' +
              '<button id="rsLibDup" style="' + BTN + '" title="a copy under a new name — its own sequence in the score, written beside the original and not over it">duplicate</button>' +
              '<button id="rsLibDel" style="' + BTN + '" title="delete the sequence chosen in the list from bank/rhythm_sequences.json">&times;</button>' +
              '<span id="rsLibWhere" style="color:#9ab"></span>' +
            '</div>' +
            '<div id="rsRoll" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="rsEdges" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="rsWaves" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +
            '<div id="rsWork" style="display:none;flex-direction:column;gap:4px;padding:4px 8px;border-bottom:1px solid #2c3238"></div>' +   // 1l.4: the workshop
            '<div id="rsStatus" style="padding:1px 8px;height:1.455em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9a9"></div>' +   // a line of its own: the head is full at 1280 px and the status is what tells him what happened
            '<div id="rsRowWrap" style="flex:1 1 auto;min-height:' + Math.round(ROW_H * 0.6) + 'px;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;padding:6px 8px;display:flex;flex-direction:column">' +
              // 1d.15: THE TIME STRIP — click anywhere along it to put the cursor there, and SPACE plays from there
              '<div id="rsTime" title="click to put the CURSOR at that second — SPACE then plays from there, entering a note already sounding with what is left of it. Click it again to clear" style="position:relative;height:1.1em;min-width:100%;flex:0 0 auto;margin-bottom:3px;border-bottom:1px solid #2c3238;cursor:crosshair"></div>' +
              // 1l.3: TWO ROWS ON ONE TIME SCALE — the rhythm row on top, the harmony row (the map) beneath; the cursor and Hear's line run down both
              '<div id="rsRows" style="position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:3px">' +
                '<div id="rsDots" style="display:none;flex:0 0 auto"></div>' +   // 1l.5: THE CONTINUOUS DOT VIEW — every box's dots, on the rows' own scale
                '<div style="color:#b09070;font-size:.8em;line-height:1">rhythm</div>' +
                '<div id="rsRRow" style="position:relative;flex:0 0 3.2em"></div>' +
                '<div style="color:#7a9aa8;font-size:.8em;line-height:1">harmony — the map (silent)</div>' +
                '<div id="rsRow" style="position:relative;flex:1 1 auto;min-height:5.2em"></div>' +
              '</div>' +
            '</div>' +
            '<div id="rsEdit" style="display:flex;gap:8px;align-items:center;padding:4px 8px;border-top:1px solid #2c3238;white-space:nowrap;min-height:2.364em;overflow:hidden"></div>';
        if (!document.getElementById('rsStyle')) {   // form controls do NOT inherit type: one rule gives every input, select and button in the strip the panel's size
            const st = document.createElement('style'); st.id = 'rsStyle';
            st.textContent = '#rhythmSeqPanel input,#rhythmSeqPanel select,#rhythmSeqPanel button{font:inherit}' +
                '#rsHead{cursor:move}#rsHead input,#rsHead select,#rsHead label{cursor:auto}#rsHead button{cursor:pointer}';
            document.head.appendChild(st);
        }
        document.body.appendChild(d);
        this.el = d;
        this.placeWindow();                                   // where he left it last, or along the bottom, where it used to be docked
        this.dragBy(d.querySelector('#rsHead'));
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
        q('#rsName').addEventListener('change', async e => { const want = e.target.value.trim(); if (!(await this.libSetName(want))) e.target.value = this.row.name || ''; });
        q('#rsName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        q('#rsLibTog').addEventListener('click', () => { this.libOpen = !this.libOpen; this.save(true); this.paintLib(); this.fitStrikes(); });
        q('#rsLibList').addEventListener('change', e => {
            const v = e.target.value; e.target.blur();
            if (!v) { this.paintLib(); return; }
            const i = v.indexOf('/'); this.libOpenEntry(v.slice(0, i), v.slice(i + 1));
        });
        q('#rsLibSave').addEventListener('click', () => this.libKeep());
        q('#rsLibRevert').addEventListener('click', () => this.libRevert());
        q('#rsLibDup').addEventListener('click', () => this.libDuplicate());
        q('#rsLibDel').addEventListener('click', () => {
            const v = q('#rsLibList').value; if (!v) { this.setStatus('choose a sequence in the list first', true); return; }
            const i = v.indexOf('/'); this.libDelete(v.slice(0, i), v.slice(i + 1));
        });
        q('#rsFrom').addEventListener('change', e => { this.hearFrom = ['box', 'cursor'].indexOf(e.target.value) >= 0 ? e.target.value : 'start'; this.save(); e.target.blur(); this.paintCursor(); });
        // 1d.15: a click in the TIME STRIP puts the cursor at that second; a click at the same place again clears it
        q('#rsTime').addEventListener('click', ev => this.clickTime(ev));
        q('#rsAdd').addEventListener('click', () => this.addBox());
        q('#rsRAdd').addEventListener('click', () => this.addRBox());   // 1l.3
        q('#rsRollTog').addEventListener('click', () => { this.rollOpen = !this.rollOpen; this.save(); this.paintRoll(); this.fitStrikes(); });
        this.buildRoll();
        q('#rsWavesTog').addEventListener('click', () => { this.wavesOpen = !this.wavesOpen; this.save(); this.paintWaves(); this.fitStrikes(); });
        this.buildWaves();
        q('#rsEdgesTog').addEventListener('click', () => { this.edgesOpen = !this.edgesOpen; this.save(); this.paintEdges(); this.fitStrikes(); });
        this.buildEdges();
        q('#rsDMmute').addEventListener('click', () => { this.dotMode = 'mute'; this.closeCard(); this.save(true); this.paintDotMode(); });   // 1l.6
        q('#rsDMedit').addEventListener('click', () => { this.dotMode = 'edit'; this.save(true); this.paintDotMode(); });
        q('#rsWorkTog').addEventListener('click', () => { this.workOpen = !this.workOpen; this.save(); this.paintWork(true); });   // 1l.4
        this.buildWork();
        window.addEventListener('resize', () => { if (this.isOpen()) { this.clampWindow(); this.fitStrikes(); } });   // the screen changed under a floating window: bring it back into view
        q('#rsHear').addEventListener('click', () => this.hear());
        q('#rsHearMap').addEventListener('click', () => this.hearMap());   // 1l.5
        q('#rsStop').addEventListener('click', () => this.stop());
        q('#rsInsert').addEventListener('click', () => this.insert(false));
        q('#rsMove').addEventListener('click', () => this.insert(true));
        q('#rsList').addEventListener('change', e => { const id = e.target.value; e.target.blur(); if (id) this.reopen(id); else { this._listSig = ''; this.renderList(); } });
        q('#rsNew').addEventListener('click', () => this.startNew());
        q('#rsClose').addEventListener('click', () => this.toggle(false));
        if (!L) this.setStatus('dyn_ui.js is not loaded — a box can only be "as dealt"', true);

        const tab = document.createElement('div');
        tab.id = 'rhythmSeqTab'; tab.textContent = 'RHYTHM ▴'; tab.title = 'open the rhythm sequence panel';
        tab.style.cssText = 'position:fixed;right:262px;bottom:0;z-index:8999;background:#3d2a16;color:#f5dcbf;border:1px solid ' + COLOR + ';border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:' + (FS + 1) + 'px system-ui,sans-serif;letter-spacing:.06em';
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
        // 1d.12: ESC returns a selection of boxes to one — the drawer's own key, and only while this strip was clicked last
        window.addEventListener('keydown', ev => {
            if (ev.key !== 'Escape' || !this.isOpen() || !this.active || this.selTo == null) return;
            const t = ev.target, m = s => !!(t && t.matches && t.matches(s));
            if (m('textarea, input[type=text], input[type=search]')) return;   // ESC in a text field is the field's own (it reverts it)
            ev.preventDefault(); ev.stopPropagation();
            this.clearSel(); this.setStatus('box ' + (this.sel + 1) + ' — one box again');
        }, true);
    },

    toggle(force) {
        const show = force != null ? !!force : !this.isOpen();
        this.el.style.display = show ? 'flex' : 'none';
        const b = document.getElementById('rhythmSeqBtn');
        if (b) { b.style.background = show ? '#3d2a16' : ''; b.style.color = show ? '#f5dcbf' : ''; }
        const tab = document.getElementById('rhythmSeqTab'); if (tab) tab.style.display = show ? 'none' : '';
        if (show) { this.clampWindow(); this.paintRoll(); this.paintWaves(); this.paintEdges(); this.paintWork(true); }   // clamp first: only now can the window be measured, and the screen may have changed while it was shut
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
        return { x: Math.round((window.innerWidth - w) / 2), y: Math.max(WIN.PAD, window.innerHeight - h - WIN.PAD - 60), w: Math.round(w), h: Math.round(h + 40) };
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
        const sp = this.el.querySelector('#rsSpace');
        if (sp) { sp.style.color = on ? '#0e1a20' : '#667'; sp.style.background = on ? EDGE_ON : 'transparent'; sp.style.borderColor = on ? EDGE_ON : '#444'; }
    },
    setStatus(msg, bad) { const s = this.el && this.el.querySelector('#rsStatus'); if (!s) return; s.textContent = msg; s.title = msg; s.style.color = bad ? '#e88' : '#9a9'; },

    // ------------------------------------------------------------------ the row
    render() {
        if (!this.el) return;
        const q = s => this.el.querySelector(s);
        if (document.activeElement !== q('#rsName')) q('#rsName').value = this.row.name || '';
        q('#rsFrom').value = this.hearFrom;
        const n = this.row.boxes.length, nr = (this.row.rhythm || []).length;
        q('#rsTotal').textContent = (n ? 'harmony ' + n + ' box' + (n > 1 ? 'es' : '') + ' · ' + fmtS(this.total()) + ' s' : '') + (nr ? (n ? ' · ' : '') + 'rhythm ' + nr + ' · ' + fmtS(this.rtotal()) + ' s' : '');
        this.renderRow(); this.renderRRow(); this.renderEdit(); this.paintWork(!!this.workOpen); this.paintDotMode();   // 1l.4: the workshop's dots follow the harmony box he clicks this.renderList(); this.paintInsert(); this.paintLib(); this.paintRoll(); this.paintWaves(); this.paintEdges();
        this.paintCursor(); this.paintClock(null);   // 1d.15: after renderRow, which rebuilds the boxes the cursor is measured against
    },

    // ------------------------------------------------------------------ the sequences in the open score — the round trip (1d.3)
    dbList() { const C = C_(), L = C && C.databases && C.databases.rhythmSequences; return Array.isArray(L) ? L.filter(x => x && x.id && x.recipe) : []; },
    entryOf(id) { return this.dbList().find(x => x.id === id) || null; },
    // where a sequence sits NOW: its META bar's start — a group he dragged moves with its bar. With no bar left, the recipe's own
    // start. null = none of its objects are in the score
    placedAt(id) {
        const C = C_(); if (!C || !Array.isArray(C.objects)) return null;
        const group = 'grp-rseq-' + id, ML = METAL(); let bar = null, any = false;
        C.objects.forEach(o => { if (o.groupId !== group) return; any = true; if (o.layer === ML && o.sonifyNote == null && isFinite(+o.startSeconds) && (bar == null || +o.startSeconds < bar)) bar = +o.startSeconds; });
        if (!any) return null;
        if (bar != null) return +bar.toFixed(3);
        const e = this.entryOf(id); return e ? +(+e.recipe.t0 || 0).toFixed(3) : null;
    },
    coreOf(r) { return JSON.stringify({ rhythm: r.rhythm || [], change: r.change, breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}), waves: r.waves ? this.wavesDefaults(r.waves) : null, edges: r.edges ? this.edgesDefaults(r.edges) : null, containers: (r.containers || []).map(c => ({ dur: +c.dur, dyn: c.dyn == null ? AS_DEALT : c.dyn, change: (c.change && c.change !== r.change) ? c.change : null, range: c.range || null, take: c.take || '', chord: c.chord || [] })) }); },
    // the row holds something the score does not: boxes never inserted, or changed since
    isDirty() { if (!this.row.boxes.length) return false; const e = this.entryOf(this.row.id); return !e || this.coreOf(e.recipe) !== this.coreOf(this.recipe(0)); },
    renderList() {
        const sel = this.el && this.el.querySelector('#rsList'); if (!sel) return;
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
        const b = this.el && this.el.querySelector('#rsInsert'), mv = this.el && this.el.querySelector('#rsMove'); if (!b) return;
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
            boxes: (R.containers || []).map(c => ({ take: String(c.take || ''), dur: clampDur(c.dur), dyn: this.dynOk(c.dyn), dynWas: this.straightOk(c.dynWas), change: null, range: this.rangeOk(c.range), chord: JSON.parse(JSON.stringify(c.chord || [])), frozen: '' })),
            rhythm: (R.rhythm || []).map(b => this.rboxFrom(b)) };
        this.sel = this.row.boxes.length ? 0 : -1; this.selTo = null;
        if (this.row.rolled) this.rollOpen = true;   // a rolled sequence shows how its durations were made
        if (this.row.boxes.some(b => b.dyn === WAVES)) this.wavesOpen = true;   // and one that reads the waves shows theirs (1d.7)
        if (!this.isDefaultEdges()) this.edgesOpen = true;                      // and one with fades or an exit of its own shows the edges (1d.8)
        this.save(); this._listSig = ''; this.render(); this.fitStrikes();
        const at = this.placedAt(id), was = +(+R.t0 || 0).toFixed(3), n = this.row.boxes.length;
        this.setStatus('reopened "' + (e.name || id) + '" · ' + n + ' box' + (n === 1 ? '' : 'es') + ' · ' +
            (at == null ? 'its notes are no longer in the score — Insert writes it at the playhead'
                : 'it sits at ' + at.toFixed(3) + ' s' + (Math.abs(at - was) > 0.002 ? ' (moved in the score — the recipe said ' + was.toFixed(3) + ' s)' : '') + ' — change anything, then re-insert in place'));
    },

    // 1l.3 — ONE TIME SCALE FOR BOTH ROWS: pixels a second, from the longer row and the room there is (never under MIN_PPS — then the rows scroll)
    rtotal() { return (this.row.rhythm || []).reduce((a, b) => a + (+b.dur || 0), 0); },
    ppsNow() {
        const wrap = this.el && this.el.querySelector('#rsRowWrap'), avail = Math.max(200, ((wrap && wrap.clientWidth) || 900) - 20);
        return Math.max(MIN_PPS, avail / Math.max(1, this.total(), this.rtotal()));
    },
    renderRow() {
        const row = this.el.querySelector('#rsRow'); row.innerHTML = '';
        const rows = this.el.querySelector('#rsRows'), pps = this.pps = this.ppsNow();
        rows.querySelectorAll('#rsLine,#rsCursorLine').forEach(x => x.remove());
        this.drawDots();   // 1l.5
        rows.style.width = Math.ceil(Math.max(this.total(), this.rtotal()) * pps) + 'px'; rows.style.minWidth = '100%';
        let at = 0;
        if (!this.row.boxes.length) {
            const hint = document.createElement('div');
            hint.style.cssText = 'color:#778;align-self:center;padding:0 8px';
            hint.textContent = 'the harmony row is empty — "+ harmony box" adds a box; click a box to give it a take, its seconds and its dyn';
            row.appendChild(hint);
        }
        this.row.boxes.forEach((b, i) => {
            const on = i === this.sel, empty = !b.chord.length, np = this.players(b.chord);
            const inSel = this.inSel(i), tag = this.rangeTag(b);   // 1d.12: in the SELECTION (painted), and its own waves range (a tag)
            const d = document.createElement('div');
            d.className = 'rsBox'; d.dataset.i = i;
            const x0 = at * pps, wpx = Math.max(4, (+b.dur || 0) * pps - 3); at += +b.dur || 0;   // 1l.3: by SECONDS, so the rhythm row lines up
            d.style.cssText = 'position:absolute;top:0;bottom:0;left:' + x0 + 'px;width:' + wpx + 'px;box-sizing:border-box;padding:3px 6px;border-radius:4px;cursor:pointer;overflow:hidden;' +
                // 1d.4: a box with no chord is a REST — deliberate, so it is drawn quiet (dashed, dim), not as a fault
                'background:' + (on ? '#22404d' : (inSel ? '#1e343e' : (empty ? '#191d21' : '#20262c'))) + ';border:1px ' + (empty ? 'dashed ' : 'solid ') + (on ? EDGE_ON : (inSel ? '#3d7d96' : (empty ? '#56606a' : '#3a4650'))) + ';display:flex;flex-direction:column;justify-content:center;white-space:nowrap';
            d.title = empty ? 'a REST — silence for its duration: every player stops at its start and begins again after it. Choose a take to give it a chord' : this.chordText(b.chord);
            const own = null;   // 1l.3: no `enter` here — every box is entered by attack
            d.innerHTML = '<div style="color:#789;font-size:.9em">' + (i + 1) + (own ? ' <span style="color:#e6c46a" title="this box is entered by ' + own + ' — the sequence\'s rule is ' + this.row.change + '">' + (own === 'attack' ? '▶| attack' : '≈ seamless') + '</span>' : '') + '</div>' +
                '<div style="overflow:hidden;text-overflow:ellipsis;color:' + (empty ? '#7d8790' : '#e6eef2') + (empty ? ';font-style:italic' : '') + '">' + esc(b.take || 'rest') + '</div>' +
                '<div style="color:#9ab">' + fmtS(b.dur) + ' s' + (empty ? '' : ' · ' + (b.dyn === WAVES ? '<span style="color:' + WTINT + '">∿ waves</span>' : esc(b.dyn))) +
                    (tag ? ' <span style="color:' + WTINT + ';opacity:.85" title="this box reads the waves through a range of its own — the sequence\'s is ' + esc(this.row.waves.low + '–' + this.row.waves.high) + '">' + esc(tag) + '</span>' : '') + '</div>' +   // 1d.7: a waves box wears a mark · 1d.12: and its own range
                '<div style="color:' + (empty ? '#7d8790' : '#7a9') + ';font-size:.9em">' + (empty ? 'silence' : (np + ' player' + (np === 1 ? '' : 's') + (b.chord.length > np ? ' · ' + b.chord.length + ' notes' : ''))) + '</div>';
            // 1d.12: a plain click is ONE box and clears the selection; SHIFT+click reaches from the selected box to this one
            d.addEventListener('click', ev => {
                if (ev.shiftKey && this.sel >= 0 && this.sel !== i) { this.selTo = i; this.save(); this.render(); this.setStatus(this.selLabel() + ' selected — `dyn`, `enter` and `range` go on all ' + this.selCount() + '. ESC, or a plain click, returns to one'); return; }
                this.sel = i; this.selTo = null; this.rsel = -1; this.save(); this.render(); this.jumpTo(this.row.boxes.slice(0, i).reduce((x, y) => x + (+y.dur || 0), 0));
            });
            if (!empty) {   // the PREVIEW: this box's chord on its own — every box that holds a take has one
                const on = this._previewing === i, pv = document.createElement('button');
                pv.className = 'rsPrev'; pv.textContent = on ? '■' : '▸';
                pv.title = on ? 'stop the preview' : 'PREVIEW: hear this box\'s chord on its own — everyone together, ' + fmtS(Math.min(PREVIEW_S, +b.dur || PREVIEW_S)) + ' s, at the box\'s dyn (' + b.dyn + ')';
                pv.style.cssText = 'position:absolute;top:2px;right:3px;width:1.818em;height:1.636em;padding:0;line-height:1.455em;font-size:1em;cursor:pointer;border-radius:3px;border:1px solid ' + (on ? EDGE_ON : '#4a5a66') + ';background:' + (on ? '#2f5f72' : '#1a2228') + ';color:' + (on ? '#fff' : '#9fdcf5');
                pv.addEventListener('click', ev => { ev.stopPropagation(); this.preview(i); });
                d.appendChild(pv);
            }
            row.appendChild(d);
        });
        const line = document.createElement('div');
        line.id = 'rsLine'; line.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#fff;opacity:.85;display:none;pointer-events:none;z-index:2';
        rows.appendChild(line);   // 1l.3: down BOTH rows
        const cur = document.createElement('div');   // 1d.15: the cursor's own line, down the boxes
        cur.id = 'rsCursorLine'; cur.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#e8a06a;opacity:.8;display:none;pointer-events:none;z-index:2';
        rows.appendChild(cur);
    },
    chordText(chord) { return (chord || []).map(n => shortOf(n.lane) + (n.seat ? '²' : '') + ' ' + pitchName(n.midi) + centsTxt(n.cents)).join(' · '); },
    renderEdit() {
        const ed = this.el && this.el.querySelector('#rsEdit'); if (!ed) return;
        if (this.rsel != null && this.rsel >= 0 && (this.row.rhythm || [])[this.rsel]) return this.renderREdit();   // 1l.3: a rhythm box is selected
        const i = this.sel, b = this.row.boxes[i];
        if (!b) { ed.innerHTML = '<span style="color:#778">no box selected</span>'; return; }
        const names = D.takeNames ? D.takeNames() : [];
        const L = LADDER(), dyns = [AS_DEALT, WAVES].concat(L ? L.NAMES : []);
        const missing = b.take && names.indexOf(b.take) < 0;
        const many = this.selCount() > 1;   // 1d.12: take and seconds stay per box; dyn, enter and range go on the whole selection
        ed.innerHTML =
            '<b style="color:' + COLOR + '" title="' + (many ? 'SHIFT+click reached from box ' + (this.sel + 1) + ' to this one — what you set below goes on every box of the selection. ESC, or a plain click, returns to one' : 'click a box to select it · SHIFT+click another to select the range between them') + '">' + this.selLabel() + (many ? ' <span style="color:#9ab;font-weight:normal">(' + this.selCount() + ')</span>' : '') + '</b>' +
            (many ? '<button id="rsSelClear" style="' + BTN + '" title="back to one box (ESC)">one box</button>' : '') +
            (many ? '' :
            '<label title="a saved take of the strikes drawer. Choosing one LOADS it in the strikes drawer, so you see it — whatever is undealt there is replaced (save it as a take first) — and the box freezes its notes as `long tone` deals them">take <button id="rsTake" type="button" style="max-width:20em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;cursor:pointer;' + INP + '">' +
                esc(b.take ? b.take + (missing ? ' (not in the list)' : '') : '— choose —') + ' ▾</button></label>' +   // THE TAKES MENU — a list of our own, a ▸ beside every take (openTakeMenu)
            '<label><input id="rsDur" type="number" min="' + MIN_DUR + '" max="' + MAX_DUR + '" step="0.5" style="width:5.091em;' + INP + '"> s</label>') +
            '<label title="as dealt: each note keeps the level the take was saved at · waves: every player rises and falls on their own stream of swells, between the waves\' low and high (the `waves` line) · ppp … fff: the whole box at that dynamic, on the drawer\'s own written scale">dyn <select id="rsDyn" style="' + INP + '">' + dyns.map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('') + '</select></label>' +
            // 1d.12: the same dealt waves, read through a range of THIS selection's own. Blank = the sequence's.
            '<label title="the waves range these boxes are read through — the same dealt swells, between two other dynamics. Blank (`sequence range`) = the sequence\'s own, ' + esc(this.row.waves.low + '–' + this.row.waves.high) + '. Where two ranges meet the level GLIDES across the line over half a second, never a step">range ' +
                '<select id="rsRLo" style="' + INP + '"><option value="">—</option>' + (L ? L.NAMES.map(n => '<option value="' + n + '">' + n + '</option>').join('') : '') + '</select> ' +
                '<select id="rsRHi" style="' + INP + '"><option value="">—</option>' + (L ? L.NAMES.map(n => '<option value="' + n + '">' + n + '</option>').join('') : '') + '</select></label>' +
            '<button id="rsRClear" style="' + BTN + '" title="back to the sequence\'s own waves range">sequence range</button>' +
            (many ? '' :
            '<button id="rsRefresh" style="' + BTN + '" title="read the take again — the box holds the notes as they were when it was chosen">refresh from take</button>' +
            '<button id="rsLeft" style="' + BTN + '" title="move this box earlier">◂</button><button id="rsRight" style="' + BTN + '" title="move this box later">▸</button>' +
            '<button id="rsDel" style="' + BTN + '" title="remove this box">×</button>') +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:#9ab" title="' + esc(this.chordText(b.chord)) + '">' + esc(many ? this.selCount() + ' boxes — take and seconds stay per box' : (b.chord.length ? this.chordText(b.chord) : 'a REST — silence for its ' + fmtS(b.dur) + ' s; choose a take to give it a chord')) + '</span>';
        const q = s => ed.querySelector(s);
        if (!many) q('#rsDur').value = b.dur;
        q('#rsDyn').value = b.dyn;
        const rq = this.rangeOk(b.range); q('#rsRLo').value = rq ? rq.low : ''; q('#rsRHi').value = rq ? rq.high : '';
        q('#rsDyn').addEventListener('change', e => {
            const d = this.dynOk(e.target.value); e.target.blur();
            const n = this.eachSel(x => {
                if (d === WAVES && x.dyn !== WAVES) x.dynWas = x.dyn; else if (d !== WAVES) x.dynWas = d;   // the straight dyn is remembered, so stepping out of the waves restores it
                x.dyn = d;
            });
            this.save(); this.render();
            if (d === WAVES) this.wavesStatus(this.selLabel() + ' read' + (n === 1 ? 's' : '') + ' the waves');
            else this.setStatus(this.selLabel() + ' at ' + d);
        });
        // both ends together: a range is two dynamics, and half of one is not a range
        const setRange = () => {
            const lo = q('#rsRLo').value, hi = q('#rsRHi').value;
            if (!lo && !hi) { this.eachSel(x => { x.range = null; }); this.save(); this.render(); this.setStatus(this.selLabel() + ' back to the sequence\'s waves range (' + this.row.waves.low + '–' + this.row.waves.high + ')'); return; }
            const ok = this.rangeOk({ low: lo, high: hi });
            if (!ok) { this.setStatus(lo && hi ? 'a range runs upwards: ' + lo + ' must be below ' + hi : 'a range needs BOTH ends — pick a low and a high', true); return; }
            const n = this.eachSel(x => { x.range = { low: ok.low, high: ok.high }; });
            this.save(); this.render();
            this.setStatus(this.selLabel() + ' read' + (n === 1 ? 's' : '') + ' the waves through ' + ok.low + '–' + ok.high + (this.row.boxes.some((x, k) => !this.inSel(k) && x.dyn === WAVES) ? ' · the rest stay ' + this.row.waves.low + '–' + this.row.waves.high + ', and the level GLIDES across the line between them' : ''));
        };
        q('#rsRLo').addEventListener('change', e => { e.target.blur(); setRange(); });
        q('#rsRHi').addEventListener('change', e => { e.target.blur(); setRange(); });
        q('#rsRClear').addEventListener('click', () => { const n = this.eachSel(x => { x.range = null; }); this.save(); this.render(); this.setStatus(this.selLabel() + ' — ' + n + ' box' + (n === 1 ? '' : 'es') + ' back to the sequence\'s waves range (' + this.row.waves.low + '–' + this.row.waves.high + ')'); });
        if (many) { q('#rsSelClear').addEventListener('click', () => this.clearSel()); return; }
        q('#rsTake').addEventListener('click', e => { e.preventDefault(); this.openTakeMenu(i, e.currentTarget); });
        q('#rsDur').addEventListener('change', e => { b.dur = clampDur(e.target.value); e.target.blur(); this.save(); this.render(); });
        q('#rsDur').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        q('#rsRefresh').addEventListener('click', () => { if (b.take) this.freeze(i, b.take); else this.setStatus('box ' + (i + 1) + ' has no take to refresh from', true); });
        q('#rsLeft').addEventListener('click', () => this.moveBox(i, -1));
        q('#rsRight').addEventListener('click', () => this.moveBox(i, 1));
        q('#rsDel').addEventListener('click', () => this.removeBox(i));
    },
    addBox() { this.row.boxes.push(this.newBox()); this.sel = this.row.boxes.length - 1; this.selTo = null; this.rsel = -1; this.save(); this.render(); this.setStatus('harmony box ' + (this.sel + 1) + ' added — choose its take (a box left without one is a REST)'); },

    // ------------------------------------------------------------------ 1l.3 — THE RHYTHM ROW: the same idiom, on the same time scale, its lines its own
    renderRRow() {
        const row = this.el.querySelector('#rsRRow'); if (!row) return;
        row.innerHTML = '';
        const R = this.row.rhythm || [], pps = this.pps || this.ppsNow();
        if (!R.length) {
            const hint = document.createElement('div');
            hint.style.cssText = 'color:#8a7a68;padding:.5em 8px;white-space:nowrap';
            hint.textContent = 'the rhythm row is empty — the workshop (PLAN 1l.4) fills it with excerpts of rhythm takes; "+ rhythm box" adds a rest';
            row.appendChild(hint); return;
        }
        let at = 0;
        R.forEach((b, i) => {
            const on = i === this.rsel, rest = !b.take, x0 = at * pps, wpx = Math.max(4, (+b.dur || 0) * pps - 3); at += +b.dur || 0;
            const d = document.createElement('div');
            d.className = 'rsRBox'; d.dataset.i = i;
            d.style.cssText = 'position:absolute;top:0;bottom:0;left:' + x0 + 'px;width:' + wpx + 'px;box-sizing:border-box;padding:2px 6px;border-radius:4px;cursor:pointer;overflow:hidden;white-space:nowrap;' +
                'background:' + (on ? '#4a3420' : (rest ? '#1f1a16' : '#2c241c')) + ';border:1px ' + (rest ? 'dashed ' : 'solid ') + (on ? EDGE_ON : (rest ? '#6a5a4a' : '#6a5030'));
            d.title = rest ? 'a REST in the rhythm row — silence for its ' + fmtS(b.dur) + ' s' : 'rhythm take "' + b.take + '" · ' + fmtS(b.start) + ' → ' + fmtS(b.stop) + ' s';
            d.innerHTML = '<span style="color:#a98">' + (i + 1) + '</span> <span style="color:' + (rest ? '#8a7a68;font-style:italic' : '#f5e6d4') + '">' + esc(rest ? 'rest' : b.take) + '</span> <span style="color:#b9a">' + fmtS(b.dur) + ' s</span>';
            d.addEventListener('click', () => { this.rsel = i; this.save(); this.render(); this.jumpTo(R.slice(0, i).reduce((x, y) => x + (+y.dur || 0), 0)); });
            row.appendChild(d);
            if (!rest && b.state) this.miniature(d, b, wpx);   // 1l.4: the box shows a miniature of its dots
        });
    },
    // 1l.4: a rhythm box's dots in miniature — its lines as rows, the excerpt [start, stop) across the box
    miniature(d, b, wpx) {
        const W = this.realized(b.state); if (!W) return;
        const n = Math.max(1, W.lines.length), w = Math.max(4, Math.round(wpx - 10)), h = Math.max(10, Math.round(FS * 1.3)), dpr = root.devicePixelRatio || 1;
        const cv = document.createElement('canvas');
        cv.width = w * dpr; cv.height = h * dpr; cv.style.cssText = 'display:block;width:' + w + 'px;height:' + h + 'px;margin-top:1px;pointer-events:none';
        const x = cv.getContext('2d'); if (!x) return;
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#e8c89a';
        const dur = Math.max(0.001, b.stop - b.start);
        W.lines.forEach((row, L) => row.forEach(dt => { if (dt.t < b.start - 1e-9 || dt.t >= b.stop - 1e-9) return; x.fillRect(Math.round((dt.t - b.start) / dur * (w - 2)), Math.round((L + 0.5) * h / n) - 1, 2, 2); }));
        d.appendChild(cv);
    },
    renderREdit() {
        const ed = this.el.querySelector('#rsEdit'), i = this.rsel, b = this.row.rhythm[i];
        ed.innerHTML = '<b style="color:#f0c890">rhythm box ' + (i + 1) + '</b>' +
            (b.take ? '<span style="color:#b9a">take "' + esc(b.take) + '" · ' + (+b.start).toFixed(2) + ' → ' + (+b.stop).toFixed(2) + ' s · ' + fmtS(b.dur) + ' s</span><button id="rsRRef" style="' + BTN + '" title="read the rhythm take again from bank/rhythm_takes.json — the box holds its recipe as it was when it was cut">refresh from take</button>'
                    : '<label><input id="rsRDur" type="number" min="' + MIN_DUR + '" max="' + MAX_DUR + '" step="0.5" style="width:5.091em;' + INP + '"> s</label>') +
            (b.take ? '<button id="rsRWho" style="' + BTN + '" title="WHO PLAYS each line in this box — only the rhythm moves (1l.6)">who plays ▾</button>' + (this.touchCount(b) ? '<span style="color:#c8a2ff">' + this.touchCount(b) + ' touched</span>' : '') : '') +
            '<button id="rsRLeft" style="' + BTN + '" title="move this rhythm box earlier">◂</button><button id="rsRRight" style="' + BTN + '" title="move this rhythm box later">▸</button>' +
            '<button id="rsRDel" style="' + BTN + '" title="remove this rhythm box">×</button>' +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:#9ab">' + (b.take ? 'an excerpt of a rhythm take — its length is its cut' : 'a REST — silence for its ' + fmtS(b.dur) + ' s. The workshop (1l.4) gives a box an excerpt of a rhythm take') + '</span>';
        const q = s => ed.querySelector(s);
        if (q('#rsRDur')) {
            q('#rsRDur').value = b.dur;
            q('#rsRDur').addEventListener('change', e => { b.dur = clampDur(e.target.value); e.target.blur(); this.save(); this.render(); });
            q('#rsRDur').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        }
        if (q('#rsRRef')) q('#rsRRef').addEventListener('click', async () => {
            const L = await this.workList(true), t = L[b.take];
            if (!t || !t.state || !t.state.spec) { this.setStatus('no rhythm take named "' + b.take + '" in bank/rhythm_takes.json any more', true); return; }
            const nt = this.touchCount(b);   // 1l.6: a RE-CUT loses the touches — say how many, first
            if (nt && JSON.stringify(t.state) !== JSON.stringify(b.state) && !window.confirm('The rhythm take has changed since this box was cut.\n\nRe-reading it LOSES ' + nt + ' touch' + (nt === 1 ? '' : 'es') + ' on this box (mutes and changed dots). Go on?')) return;
            if (JSON.stringify(t.state) !== JSON.stringify(b.state)) { b.touches = {}; b.assign = null; }
            b.state = JSON.parse(JSON.stringify(t.state)); this.save(); this.render(); this.setStatus('rhythm box ' + (i + 1) + ' re-read "' + b.take + '" — the same cut, ' + (+b.start).toFixed(2) + ' → ' + (+b.stop).toFixed(2) + ' s');
        });
        if (q('#rsRWho')) q('#rsRWho').addEventListener('click', e => this.openWho(i, e.currentTarget));   // 1l.6
        q('#rsRLeft').addEventListener('click', () => this.moveRBox(i, -1));
        q('#rsRRight').addEventListener('click', () => this.moveRBox(i, 1));
        q('#rsRDel').addEventListener('click', () => this.removeRBox(i));
    },
    addRBox() { if (!this.row.rhythm) this.row.rhythm = []; this.row.rhythm.push(this.newRBox()); this.rsel = this.row.rhythm.length - 1; this.save(); this.render(); this.setStatus('rhythm box ' + (this.rsel + 1) + ' added — a rest for now; the workshop (1l.4) gives a box an excerpt of a rhythm take'); },
    removeRBox(i) { const R = this.row.rhythm || []; if (!R[i]) return; R.splice(i, 1); this.rsel = R.length ? Math.min(i, R.length - 1) : -1; this.save(); this.render(); },
    moveRBox(i, by) { const R = this.row.rhythm || [], j = i + by; if (!R[i] || j < 0 || j >= R.length) return; const t = R[i]; R[i] = R[j]; R[j] = t; this.rsel = j; this.save(); this.render(); },

    // ------------------------------------------------------------------ 1l.4 · 1l.5 — THE MAP AND THE JOIN (LG-56 · LG-58 · LG-60)
    // The harmony row, dealt by sequence.js, is a list of notes per player WITH GAPS — the breath before an attack line, a ceiling split.
    // THE MAP IS CONTINUOUS (1l.5's caution for the build): at any instant inside a box, a player's note is the one sounding there, else
    // the last one before it in that box (its END level held), else the first after it (its START level) — a gap never reads as "no note
    // beneath". A player the box does not deal has nothing beneath, and a REST box has nothing for anyone (LG-58 — no borrowed notes:
    // the dot is HOLLOW, silent, and the status warns). What a player has at an instant: [{ midi, cents, partial, tech, level, weight }],
    // `level` the INTENDED WRITTEN LEVEL, 0…1 on the ladder (ppp … fff), and `weight` a niente fade's multiplier (1 outside any).
    mapOf(G) {
        const by = {}, B = G.bounds, last = B.length - 1;
        G.notes.forEach(n => { const k = n.lane + ':' + (n.seat || 0); (by[k] || (by[k] = [])).push(n); });
        const boxAt = t => { if (t < B[0] - 1e-9 || t >= B[last] - 1e-9) return -1; let i = 0; while (i < last - 1 && B[i + 1] <= t + 1e-9) i++; return i; };
        const levelIn = (n, x) => { const L = (n.levels && n.levels.length) ? n.levels : [[0, n.level], [n.dur, n.level]]; if (x <= L[0][0]) return L[0][1]; for (let i = 1; i < L.length; i++) if (x <= L[i][0]) { const p = L[i - 1], q = L[i]; return p[1] + (q[1] - p[1]) * ((x - p[0]) / Math.max(1e-9, q[0] - p[0])); } return L[L.length - 1][1]; };
        const weightOf = (n, t) => { const f = n.fade; if (!f) return 1; const u = clamp((t - f.start) / Math.max(1e-6, f.end - f.start), 0, 1); return clamp(f.from + (f.to - f.from) * u, 0, 1); };
        const M = {
            G, boxAt, bounds: B,
            // the MEAN level and weight of every pitched player sounding at t (the harmony's whole chord, the vibraphones included) — what a
            // percussion dot with no note of its own reads (the claves fallback)
            meanAt(t) {
                let n = 0, lv = 0, w = 0;
                Object.keys(by).forEach(k => { const f = by[k][0]; if (!f || f.inst === 'percussion') return; const [lane, seat] = k.split(':').map(Number); const x = M.at(lane, seat, t); if (!x.length) return; n++; lv += x[0].level; w += x[0].weight; });
                return n ? { level: lv / n, weight: w / n } : null;
            },
            at(lane, seat, t) {
                const ci = boxAt(t); if (ci < 0) return [];
                const mine = (by[lane + ':' + (seat || 0)] || []).filter(n => n.container === ci);
                if (!mine.length) return [];
                let cur = mine.filter(n => n.start <= t + 1e-9 && n.end > t + 1e-9), where = null;
                if (!cur.length) {
                    const before = mine.filter(n => n.end <= t + 1e-9);
                    if (before.length) { const s0 = Math.max.apply(null, before.map(n => n.start)); cur = before.filter(n => n.start === s0); where = 'end'; }
                    else { const s0 = Math.min.apply(null, mine.map(n => n.start)); cur = mine.filter(n => n.start === s0); where = 'start'; }
                }
                return cur.map(n => ({ midi: n.midi, cents: n.cents || 0, partial: n.partial, tech: n.tech,
                    level: clamp(levelIn(n, where === 'end' ? n.dur : (where === 'start' ? 0 : t - n.start)), 0, 1), weight: weightOf(n, t), box: ci }));
            },
        };
        return M;
    },
    // THE JOIN, for one dot of a realized rhythm take `R` at harmony time `T`: whose dot it is (the take's who-plays) → what each of those
    // players has beneath at that instant → the pitch with its cents, and the intended written level. The ARTICULATION is the rhythm
    // take's for that player (his short defaults, LG-59); the harmony gives pitch and level only. THE PERCUSSION: what the harmony beneath
    // gives the Percussion player, as it plays it (unbent) — else, where the box has a chord, the claves (pair 2 high) at the MEAN level of
    // every pitched player sounding there (the AI's call: the claves have no note of their own to read a level from). The strike is the
    // level's ANCHOR on the ladder, which the strikes drawer's player remaps per instrument and pitch (LG-60: the written level is the
    // ground truth); a niente fade's weight scales the strike and rides beside the level.
    joinDot(R, map, dot, T) {
        const TP = root.TexturePanel, P = TP ? TP.P7() : [], L = LADDER(), lo = L ? L.LO : 65, hi = L ? L.HI : 127;
        const out = [], ps = R.assignOf(dot.line).map(s => P[s]).filter(Boolean);
        const got = ps.map(p => ({ p, ns: map.at(p.lane, 0, T) }));
        got.forEach(g => {
            let ns = g.ns;
            if (g.p.instKey === 'percussion') {
                if (ns.length) ns = ns.map(n => Object.assign({}, n, { cents: 0 }));
                else { const m = map.meanAt(T); if (m) ns = [{ midi: TP.CLAVES.midi, cents: 0, tech: TP.CLAVES.tech, level: m.level, weight: m.weight, fallback: true }]; }   // a REST box: nobody sounds, so no claves either
            }
            ns.forEach(n => {
                const anchor = Math.round(lo + (hi - lo) * n.level);
                out.push({ lane: g.p.lane, slot: g.p.slot, short: g.p.short, tech: g.p.instKey === 'percussion' ? (n.tech || 'main') : R.artOf(g.p),
                    midi: n.midi, cents: n.cents || 0, partial: n.partial, level: n.level, weight: n.weight, vel: anchor, fallback: !!n.fallback });
            });
        });
        return out;
    },
    // a realized rhythm take, cached by its frozen recipe (the same recipe always gives the same dots)
    realized(state) {
        const TP = root.TexturePanel; if (!TP || !state || !state.spec) return null;
        const key = JSON.stringify(state);
        this._real = this._real || new Map();
        if (!this._real.has(key)) {
            const R = TP.realize(state, null);
            const b = R.notesOf(R.result, null);
            this._real.set(key, { R, lines: b.lines.map(row => row || []), span: R.spanOf(R.result) });
            if (this._real.size > 40) this._real.delete(this._real.keys().next().value);
        }
        return this._real.get(key);
    },

    // ------------------------------------------------------------------ 1l.4 — THE WORKSHOP (docs/PLAN.md § 1l.4)
    // The dot view of 1l.2 (dot_view.js), a menu of his rhythm takes, and the harmony box selected in the harmony row as the PREVIEW
    // harmony — for the preview only: a rhythm box carries no harmony of its own (LG-57). SEE the take's lines as dots in time, HEAR them
    // in that harmony (each player's pitch AND level from that box — the join's first use), CUT a portion (a start and a stop clicked on
    // the timeline, or a drag across the dots — nothing snaps, LG-58), or take the ENTIRE take looped N times (his correction, RUNNING_LOG
    // §196: looping belongs to the selection, and lands as N boxes — a box never loops), and SAVE to the rhythm row. A box keeps the
    // take's recipe FROZEN, as a harmony box keeps its chord.
    workDefaults() { return { take: '', a: 0, b: 0, mode: 'cut', n: 2 }; },
    buildWork() {
        const line = this.el.querySelector('#rsWork'); if (!line) return;
        const lab = 'color:#b9a';
        line.innerHTML = '<div style="display:flex;gap:6px;row-gap:3px;flex-wrap:wrap;align-items:center;white-space:nowrap">' +
            '<span style="color:#f0c890">workshop</span>' +
            '<label style="' + lab + '" title="a RHYTHM TAKE saved in the Texture panel (bank/rhythm_takes.json) — its recipe: the dials, the seed, who plays each line, the articulations">rhythm take <select id="rsKTake" style="max-width:16em;' + INP + '"></select></label>' +
            '<button id="rsKReload" style="' + BTN + '" title="read the list of rhythm takes again">↻</button>' +
            '<span id="rsKHarm" style="color:#9ab" title="the PREVIEW harmony: the harmony box selected in the harmony row — click one. For the preview only: a rhythm box carries no harmony of its own"></span>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<label style="' + lab + '" title="a PORTION — click a start and then a stop on the timeline, or drag across the dots, or type them here to the hundredth — or the WHOLE take looped a number of times: each pass lands on the rhythm row as a box of its own">take <select id="rsKMode" style="' + INP + '"><option value="cut">a portion</option><option value="loop">the whole take ×</option></select></label>' +
            '<span id="rsKCut" style="display:inline-flex;gap:4px;align-items:center"><label style="' + lab + '">from <input id="rsKA" type="number" step="0.01" min="0" style="width:5.2em;' + INP + '"> s</label><label style="' + lab + '">to <input id="rsKB" type="number" step="0.01" min="0" style="width:5.2em;' + INP + '"> s</label></span>' +
            '<span id="rsKLoop" style="display:none;gap:4px;align-items:center"><input id="rsKN" type="number" step="1" min="1" max="64" style="width:3.6em;' + INP + '"><span style="' + lab + '">times</span></span>' +
            '<span id="rsKLen" style="color:#f0c890"></span>' +
            '<button id="rsKPlay" style="' + BTN + '" title="HEAR the selection — or the whole take — in the preview harmony: each player\'s pitch and level from that box, each player\'s articulation from the rhythm take. Click again to stop">▸ play</button>' +
            '<button id="rsKSave" style="' + BTN + ';color:#f0c890" title="SAVE TO THE RHYTHM ROW: a box that remembers the take (its recipe, frozen) · the start · the stop — its length is stop − start. The whole take looped N times lands as N boxes, one after another">save → rhythm row</button>' +
            '</div><div id="rsKView"></div>';
        const q = s => line.querySelector(s);
        q('#rsKTake').addEventListener('change', e => { e.target.blur(); this.workChoose(e.target.value); });
        q('#rsKReload').addEventListener('click', () => this.workList(true));
        q('#rsKMode').addEventListener('change', e => { e.target.blur(); this.work.mode = e.target.value === 'loop' ? 'loop' : 'cut'; this.save(true); this.paintWork(true); });
        const typed = () => { const w = this.work, S = this.workSpan(); let a = clamp(+q('#rsKA').value || 0, 0, S), b = clamp(+q('#rsKB').value || 0, 0, S); if (b < a) { const t = a; a = b; b = t; } this.workSet(a, b, 'typed'); };
        ['#rsKA', '#rsKB'].forEach(id => { q(id).addEventListener('change', e => { e.target.blur(); typed(); }); q(id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } }); });
        q('#rsKN').addEventListener('change', e => { e.target.blur(); this.work.n = clamp(Math.round(+e.target.value || 1), 1, 64); this.save(true); this.paintWork(false); });
        q('#rsKPlay').addEventListener('click', () => this.workPlay());
        q('#rsKSave').addEventListener('click', () => this.workSave());
        this.wView = root.DotView ? root.DotView.create(line.querySelector('#rsKView')) : null;
        if (this.wView) {
            this.wView.onSeek = t => this.workMark(t);                  // a click on its timeline: a START, then a STOP
            this.wView.onSpan = (a, b) => this.workSet(a, b, 'marquee'); // a drag across the dots
        }
        if (!this.work) this.work = this.workDefaults();
    },
    async workList(force) {
        if (this._rt && !force) return this._rt;
        try { const f = await fetch('/api/snapshots?store=rhythms', { cache: 'no-store' }).then(r => r.json()); this._rt = (f && f.panels && f.panels.rhythm) || {}; }
        catch (e) { this._rt = {}; }
        this.paintWork(true);
        return this._rt;
    },
    workState() { const t = this.work && this.work.take && this._rt && this._rt[this.work.take]; return (t && t.state && t.state.spec) ? t.state : null; },
    workSpan() { const W = this.workState() ? this.realized(this.workState()) : null; return W ? W.span : 0; },
    workChoose(name) {
        this.stop();
        this.work = Object.assign(this.workDefaults(), { take: name || '', mode: this.work.mode, n: this.work.n });
        const S = this.workSpan(); this.work.a = 0; this.work.b = +S.toFixed(3);
        this._wMark = 'start';
        this.save(true); this.paintWork(true);
        if (name) this.setStatus('workshop: rhythm take "' + name + '" · ' + fmtS(S) + ' s — click a harmony box to hear it in that harmony; click a start and a stop on its timeline, or drag across the dots, to cut a portion');
    },
    // a click on the timeline: the START, then the STOP (then a new start). The cut falls exactly where he clicks — nothing snaps.
    workMark(t) {
        const w = this.work; if (!this.workState()) return;
        if (w.mode === 'loop') { w.mode = 'cut'; }
        if (this._wMark !== 'stop') { w.a = +t.toFixed(3); if (!(w.b > w.a)) w.b = +this.workSpan().toFixed(3); this._wMark = 'stop'; this.setStatus('start at ' + fmtS(w.a) + ' s — now click the STOP'); }
        else { let a = w.a, b = +t.toFixed(3); if (b < a) { const x = a; a = b; b = x; } w.a = a; w.b = b; this._wMark = 'start'; this.setStatus('cut ' + w.a.toFixed(2) + ' → ' + w.b.toFixed(2) + ' s = ' + (w.b - w.a).toFixed(2) + ' s — ▸ play hears it, save puts it on the rhythm row'); }
        this.save(true); this.paintWork(true);
    },
    workSet(a, b, how) {
        const w = this.work; if (!this.workState()) return;
        w.mode = 'cut'; w.a = +a.toFixed(3); w.b = +b.toFixed(3); this._wMark = 'start';
        this.save(true); this.paintWork(true);
        this.setStatus('cut ' + w.a.toFixed(2) + ' → ' + w.b.toFixed(2) + ' s = ' + (w.b - w.a).toFixed(2) + ' s' + (how === 'marquee' ? ' (dragged)' : '') + ' — ▸ play hears it, save puts it on the rhythm row');
    },
    // the PREVIEW map: the selected harmony box on its own, as the generator deals it — lengthened to cover the whole take, so a take longer
    // than the box is still heard in that harmony (its waves run on). No edges: a single box previewed is not the sequence's beginning or end.
    previewMap() {
        const b = this.row.boxes[this.sel]; if (!b || !b.chord.length) return null;
        const span = this.workSpan();
        const recipe = { t0: 0, change: 'attack', breath: Object.assign({}, MAP_BREATH),
            containers: [Object.assign({ dur: Math.max(+b.dur || 1, span + 0.5), dyn: b.dyn, chord: b.chord }, this.rangeOk(b.range) ? { range: this.rangeOk(b.range) } : {})] };
        if (b.dyn === WAVES) recipe.waves = this.wavesDefaults(this.row.waves);
        try { return this.mapOf(SEQ.generate(recipe)); } catch (e) { this.setStatus('the preview harmony could not be dealt: ' + String(e && e.message || e).replace(/^sequence: /, ''), true); return null; }
    },
    // the dots of the take in the preview harmony: each dot with its players' notes, and a look — ok · warn (too close on one player) ·
    // hollow (nothing beneath) · silent (no player). `win` = [a, b) in take seconds, or the whole take.
    workDots(map, win) {
        const st = this.workState(), W = st ? this.realized(st) : null; if (!W) return null;
        const col = W.R.collisions(W.lines);
        const a = win ? win.a : 0, b = win ? win.b : W.span;
        const rows = W.lines.map((row, L) => ({ label: 'L' + (L + 1), dots: row.map(d => {
            const inWin = d.t >= a - 1e-9 && d.t < b - 1e-9;
            const notes = (map && inWin) ? this.joinDot(W.R, map, d, d.t - a) : [];
            const s = !W.R.assignOf(L).length ? 'silent' : (map && inWin && !notes.length) ? 'hollow' : col.flagged.has(L + ':' + d.i) ? 'warn' : 'ok';
            return { t: d.t, s, dur: d.dur, line: L, i: d.i, notes, inWin };
        }) }));
        return { W, rows, col };
    },
    paintWork(full) {
        const line = this.el && this.el.querySelector('#rsWork'); if (!line) return;
        line.style.display = this.workOpen ? 'flex' : 'none';
        const tog = this.el.querySelector('#rsWorkTog');
        if (tog) { tog.textContent = this.workOpen ? 'workshop ▾' : 'workshop ▸'; tog.style.background = this.workOpen ? '#3a2a18' : '#2a2a30'; }
        if (!this.workOpen) return;
        if (!this._rt) { this.workList(false); return; }
        if (!this.work) this.work = this.workDefaults();
        const q = s => line.querySelector(s), w = this.work, names = Object.keys(this._rt).sort((x, y) => String(this._rt[y].saved || '').localeCompare(String(this._rt[x].saved || '')));
        const sig = names.join('|') + '@' + w.take;
        if (sig !== this._wSig) { this._wSig = sig; q('#rsKTake').innerHTML = '<option value="">— choose (' + names.length + ') —</option>' + names.map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join('') + ((w.take && names.indexOf(w.take) < 0) ? '<option value="' + esc(w.take) + '">' + esc(w.take) + ' (not in the list)</option>' : ''); }
        q('#rsKTake').value = w.take || '';
        const b = this.row.boxes[this.sel];
        q('#rsKHarm').innerHTML = b && b.chord.length ? 'in <b style="color:#9fdcf5">harmony box ' + (this.sel + 1) + '</b> · ' + esc(b.take) + ' · ' + esc(b.dyn === WAVES ? 'waves' : b.dyn) : '<span style="color:#e0b062">click a harmony box below — the preview harmony</span>';
        q('#rsKMode').value = w.mode;
        q('#rsKCut').style.display = w.mode === 'cut' ? 'inline-flex' : 'none';
        q('#rsKLoop').style.display = w.mode === 'loop' ? 'inline-flex' : 'none';
        const S = this.workSpan();
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#rsKA', (+w.a || 0).toFixed(2)); put('#rsKB', (+w.b || 0).toFixed(2)); put('#rsKN', w.n || 2);
        q('#rsKLen').textContent = !this.workState() ? '' : (w.mode === 'loop' ? '→ ' + (w.n || 1) + ' box' + ((w.n || 1) === 1 ? '' : 'es') + ' of ' + fmtS(S) + ' s = ' + fmtS(S * (w.n || 1)) + ' s' : '= ' + Math.max(0, (w.b || 0) - (w.a || 0)).toFixed(2) + ' s of ' + fmtS(S));
        if (!full || !this.wView) return;
        if (!this.workState()) { this.wView.set({ rows: [], t0: 0, t1: 1 }); return; }
        const D2 = this.workDots(this.previewMap(), w.mode === 'cut' ? { a: w.a, b: w.b } : null);
        this.wView.sel = w.mode === 'cut' && w.b > w.a ? { a: w.a, b: w.b } : null;
        this.wView.set({ rows: D2.rows.map(r => ({ label: r.label, dots: r.dots.map(d => ({ t: d.t, s: (w.mode === 'cut' && !d.inWin) ? 'muted' : d.s })) })), t0: 0, t1: Math.max(0.5, D2.W.span) });
    },
    // HEAR the cut (or the whole take) in the preview harmony, through the strikes drawer's player — every dot a STRUCK note (docs/DYNAMICS_LAW.md)
    async workPlay() {
        if (this._wPlaying) { this.stop(); return; }
        const st = this.workState(); if (!st) { this.setStatus('choose a rhythm take in the workshop first', true); return; }
        const map = this.previewMap(); if (!map) { this.setStatus('click a harmony box with a chord — the workshop plays the take in THAT harmony', true); return; }
        const w = this.work, win = w.mode === 'cut' ? { a: w.a, b: w.b } : { a: 0, b: this.workSpan() };
        if (!(win.b > win.a)) { this.setStatus('the cut is empty — click a start and a stop on the workshop\'s timeline', true); return; }
        this.stop();
        const Dd = this.workDots(map, win), notes = [], hollow = [];
        Dd.rows.forEach(r => r.dots.forEach(d => {
            if (!d.inWin) return;
            if (!d.notes.length) { if (d.s === 'hollow') hollow.push(r.label); return; }
            d.notes.forEach(n => { const vel = Math.max(1, Math.round(n.vel)); if (n.weight <= 0.001) return;
                notes.push({ lane: n.lane, tech: n.tech, midi: n.midi, vel: vel, cents: n.cents, partial: n.partial, onMs: Math.round((d.t - win.a) * 1000), durMs: Math.max(20, Math.round(d.dur * 1000)) }); });
        }));
        if (!notes.length) { this.setStatus('nothing to play — ' + (hollow.length ? hollow.length + ' dots have no note beneath in this harmony' : 'no dots in the cut'), true); return; }
        await D.playNotes(notes, 'workshop · ' + w.take + ' in harmony box ' + (this.sel + 1));
        const e = E_();
        if (!e || !e._playing) { const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); return; }
        this._wPlaying = true;
        const b = this.row.boxes[this.sel];
        this.setStatus('workshop: "' + w.take + '" ' + win.a.toFixed(2) + ' → ' + win.b.toFixed(2) + ' s in harmony box ' + (this.sel + 1) + ' (' + b.take + ', ' + (b.dyn === WAVES ? 'waves' : b.dyn) + ') · ' + notes.length + ' notes' + (hollow.length ? ' · ' + hollow.length + ' dots HOLLOW — nothing beneath them in this harmony' : ''));
        clearInterval(this._wCur);
        this._wCur = setInterval(() => {
            const ee = E_();
            if (!ee || !ee._playing) { clearInterval(this._wCur); this._wCur = null; this._wPlaying = false; if (this.wView) this.wView.setCursor(null); return; }
            if (this.wView) this.wView.setCursor(win.a + Math.max(0, (performance.now() - D.base) / 1000));
        }, 50);
    },
    // SAVE → THE RHYTHM ROW. A portion: one box — take · start · stop, its length stop − start. The whole take × N: N boxes end to end.
    // Every box keeps the take's recipe FROZEN (`state`), so a later re-save of the take in Texture changes no box already placed.
    workSave() {
        const st = this.workState(), w = this.work; if (!st) { this.setStatus('choose a rhythm take in the workshop first', true); return; }
        const S = +this.workSpan().toFixed(3), add = [];
        if (w.mode === 'loop') { for (let k = 0; k < (w.n || 1); k++) add.push({ take: w.take, start: 0, stop: S, dur: clampDur(S), state: JSON.parse(JSON.stringify(st)) }); }
        else {
            if (!(w.b - w.a >= MIN_DUR)) { this.setStatus('the cut is too short — click a start and a stop on the workshop\'s timeline', true); return; }
            add.push({ take: w.take, start: +w.a.toFixed(3), stop: +w.b.toFixed(3), dur: clampDur(w.b - w.a), state: JSON.parse(JSON.stringify(st)) });
        }
        if (!this.row.rhythm) this.row.rhythm = [];
        const at = this.row.rhythm.length;
        add.forEach(b => this.row.rhythm.push(b));
        this.rsel = at; this.save(); this.render();
        this.setStatus(add.length === 1 ? 'rhythm box ' + (at + 1) + ' ← "' + w.take + '" ' + add[0].start.toFixed(2) + ' → ' + add[0].stop.toFixed(2) + ' s (' + fmtS(add[0].dur) + ' s)'
            : 'rhythm boxes ' + (at + 1) + '–' + (at + add.length) + ' ← the whole of "' + w.take + '", ' + add.length + ' times · ' + fmtS(S) + ' s each, end to end');
    },
    // ------------------------------------------------------------------ 1l.5 — THE WHOLE SEQUENCE: every dot reading the harmony beneath (docs/PLAN.md § 1l.5)
    // A recipe in (the harmony boxes, the waves, the edges, and the rhythm row with every box's take FROZEN), and out: every dot of every
    // rhythm box at its place in time, and for each of its players the note it sounds — the pitch (with its cents) and the INTENDED
    // WRITTEN LEVEL the harmony has for that player AT THAT INSTANT (LG-60): across harmony changes, waves, ramps and edges. The rhythm row
    // starts where the harmony does (`t0`); its boxes follow one another; a rest is silence. A dot with nothing beneath is HOLLOW — kept in
    // the view, counted in the status, never sounded (LG-58). `quiet`: no status line (handEdits reads a recipe that is not on screen).
    // Each note: { lane, tech, midi, cents, partial, level, anchor (the level's ladder velocity — recVel), velAbs (what sounds — the anchor
    // remapped for this instrument and pitch, times a niente fade's weight), weight, dyn, start, end, box, line, i }.
    dotsOf(recipe, quiet) {
        let G = null;
        try { G = SEQ.generate(recipe); } catch (e) { if (!quiet) this.setStatus(String(e && e.message || e).replace(/^sequence: /, ''), true); return null; }
        const map = this.mapOf(G), L = LADDER(), names = L ? L.NAMES : null, lo = L ? L.LO : 65, hi = L ? L.HI : 127;
        const nameOf = lv => names ? names[Math.max(0, Math.min(names.length - 1, Math.round(lv * (names.length - 1))))] : '';
        const levelOfName = nm => { const k = names ? names.indexOf(nm) : -1; return k < 0 ? null : k / (names.length - 1); };
        const T0 = +recipe.t0 || 0, vibLane = (typeof TRACKS !== 'undefined' ? TRACKS : []).findIndex(t => t.instKey === 'bowed_vibraphone');
        const dots = [], notes = [], rows = [];
        let s = T0, hollow = 0, muted = 0, changed = 0;
        (recipe.rhythm || []).forEach((b, bi) => {
            const W = (b.take && b.state) ? this.realized(b.state) : null;
            if (W) {
                // 1l.6: a line MOVED to another instrument in this box — only the rhythm moves (b.assign, else the take's own who-plays)
                const RB = Array.isArray(b.assign) ? Object.assign(Object.create(W.R), { assign: b.assign }) : W.R;
                const touches = (b.touches && typeof b.touches === 'object') ? b.touches : {};
                W.lines.forEach((row, Lx) => row.forEach(d => {
                    if (d.t < b.start - 1e-9 || d.t >= b.stop - 1e-9) return;
                    const T = +(s + (d.t - b.start)).toFixed(4), ns = this.joinDot(RB, map, d, T), tch = touches[Lx + ':' + d.i] || null;
                    // 1l.6: HIS TOUCHES — an EXCEPTION in the recipe, keyed box · line · dot: a mute (rhythm), or per player a pitch · a
                    // dynamic · an articulation · the percussion become the vibraphone. An untouched dot keeps reading the harmony.
                    let isChanged = false;
                    if (tch && tch.p) ns.forEach(n => {
                        const o = tch.p[n.slot]; if (!o) return;
                        if (o.vib != null && vibLane >= 0) {
                            const v = map.at(vibLane, o.vib, T)[0];
                            if (v) Object.assign(n, { lane: vibLane, midi: v.midi, cents: v.cents || 0, partial: v.partial, level: v.level, weight: v.weight, tech: o.tech || VIB_TECH, fallback: false });
                            else n.gone = true;   // no vibraphone note beneath: nothing to borrow (LG-58)
                        } else {
                            if (o.midi != null) { n.midi = o.midi; n.cents = +o.cents || 0; n.partial = o.partial != null ? o.partial : null; }
                            if (o.tech) n.tech = o.tech;
                        }
                        if (o.dyn) { const lv = levelOfName(o.dyn); if (lv != null) n.level = lv; }
                        n.vel = Math.round(lo + (hi - lo) * n.level); n.changed = true; isChanged = true;
                    });
                    const live = ns.filter(n => !n.gone), isMuted = !!(tch && tch.mute), sounding = isMuted ? [] : live.filter(n => n.weight > 0.001);
                    const dot = { box: bi, line: Lx, i: d.i, T: T, dur: d.dur, notes: live, hollow: !live.length, silent: !RB.assignOf(Lx).length, muted: isMuted, changed: isChanged };
                    dots.push(dot); if (dot.hollow && !dot.silent) hollow++; if (isMuted) muted++; if (isChanged) changed++;
                    (rows[Lx] || (rows[Lx] = [])).push({ t: T - T0, box: bi, line: Lx, i: d.i,
                        s: dot.silent ? 'silent' : isMuted ? 'muted' : dot.hollow ? 'hollow' : isChanged ? 'changed' : (!sounding.length ? 'muted' : 'ok') });
                    sounding.forEach(n => {
                        const velAbs = Math.max(1, Math.round(D.remapVel(n.lane, n.midi, n.vel) * n.weight));
                        notes.push({ lane: n.lane, tech: n.tech, midi: n.midi, cents: n.cents || 0, partial: n.partial, level: n.level, anchor: n.vel, velAbs: velAbs, weight: n.weight,
                            dyn: nameOf(n.level), fallback: n.fallback, changed: !!n.changed, start: +T.toFixed(3), end: +(T + Math.max(0.02, d.dur)).toFixed(3), box: bi, line: Lx, i: d.i });
                    });
                }));
            }
            s += +b.dur || 0;
        });
        notes.sort((a, b) => a.start - b.start || a.lane - b.lane);
        return { G, map, dots, notes, rows, hollow, muted, changed, end: s };
    },
    rhythmHasDots() { return (this.row.rhythm || []).some(b => b.take && b.state); },
    seqTotal() { return Math.max(this.total(), this.rtotal()); },

    // HEAR — the whole rhythm sequence, from the start, from the selected box, or from the cursor, through the strikes drawer's player:
    // every dot a STRUCK note at `velAbs`; a just note on a curve channel with its bend, as the score routes it (curveSeats, 1e V2b).
    async hear() {
        if (this._previewing >= 0) this.stop();
        if (!this.rhythmHasDots()) { this.setStatus('the rhythm row has no excerpt yet — the workshop fills it. `map ▸` auditions the harmony', true); return; }
        const X = this.dotsOf(this.recipe(0)); if (!X) return;
        const from = this.hearFrom === 'cursor' ? Math.max(0, +this.cursor || 0)
            : (this.hearFrom === 'box' ? (this.rsel >= 0 ? this.row.rhythm.slice(0, this.rsel).reduce((a, b) => a + (+b.dur || 0), 0) : (this.sel > 0 && X.G.bounds[this.sel] != null ? X.G.bounds[this.sel] : 0)) : 0);
        const bends = {}; X.notes.forEach(n => { if (n.cents) bends[n.lane] = 1; });
        const notes = [], jus = [];
        X.notes.forEach(n => {
            if (n.start < from - 1e-6) return;
            const rec = { lane: n.lane, tech: n.tech, midi: n.midi, seat: 0, vel: n.anchor, velAbs: n.velAbs, cents: n.cents ? n.cents : (bends[n.lane] ? RECENTRE : 0), partial: n.partial,
                onMs: Math.round((n.start - from) * 1000), durMs: Math.max(20, Math.round((n.end - n.start) * 1000)) };
            notes.push(rec);
            if (n.cents) jus.push({ lane: n.lane, tech: n.tech, seat: 0, midi: n.midi, onMs: rec.onMs, durMs: rec.durMs, note: rec });
        });
        if (!notes.length) { this.setStatus('nothing to hear from ' + fmtS(from) + ' s' + (X.hollow ? ' — ' + X.hollow + ' dots have nothing beneath' : ''), true); return; }
        const onMain = this.curveSeats(jus);   // a just note streams its bend on a CURVE channel, as the inserted note will
        const label = 'the rhythm sequence · ' + this.row.rhythm.length + ' rhythm boxes over ' + this.row.boxes.length + ' harmony boxes' + (from ? ' from ' + fmtS(from) + ' s' : '');
        await D.playNotes(notes, label);
        const e = E_();
        if (!e || !e._playing) { const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); return; }
        this._heardNotes = notes;   // what went out, for the verification and the curious
        this.setStatus('hearing ' + label + ' · ' + notes.length + ' notes from ' + X.dots.length + ' dots' + (X.hollow ? ' · ' + X.hollow + ' dot' + (X.hollow === 1 ? '' : 's') + ' HOLLOW — nothing beneath them' : '') +
            (jus.length ? ' · ' + jus.length + ' just, on the curve channels' + (onMain ? ' (' + onMain + ' had none — on MAIN)' : '') : ''));
        this.startRLine(from, X.end - (+X.G.t0 || 0));
    },
    // the line, the clock and the dot view's cursor while the rhythm plays — and the rows scroll to keep them in sight (1l.5)
    startRLine(from, end) {
        this.stopLine();
        const wrap = this.el.querySelector('#rsRowWrap');
        const tick = () => {
            const e = E_(), line = this.el && this.el.querySelector('#rsLine');
            if (!e || !e._playing || !line || !this.isOpen()) { this.stopLine(); return; }
            const t = from + (performance.now() - D.base) / 1000;
            if (t >= end + 0.5) { this.stopLine(); return; }
            const pps = this.pps || this.ppsNow(), x = clamp(t, 0, this.seqTotal()) * pps;
            if (t >= 0) { line.style.left = x + 'px'; line.style.display = 'block'; }
            if (this.dView) this.dView.setCursor(t);
            if (wrap && (x < wrap.scrollLeft + 20 || x > wrap.scrollLeft + wrap.clientWidth - 40)) wrap.scrollLeft = Math.max(0, x - wrap.clientWidth * 0.25);
            this.paintClock(t);
            this._raf = requestAnimationFrame(tick);
        };
        this._raf = requestAnimationFrame(tick);
    },
    // THE CONTINUOUS DOT VIEW (his B, RUNNING_LOG §194): every rhythm box's dots in ONE view on the rows' own time scale — so it scrolls
    // with them — each line a row, each dot's look its state (ok · hollow · silent · muted under a fade to nothing)
    drawDots() {
        const host = this.el && this.el.querySelector('#rsDots'); if (!host) return;
        if (!this.rhythmHasDots()) { host.style.display = 'none'; return; }
        host.style.display = '';
        if (!this.dView && root.DotView) {
            this.dView = root.DotView.create(host, { pad: 0, pxPerSec: this.pps || this.ppsNow(), marquee2d: true });
            this.dView.onSeek = t => this.setCursorAt(t);
            this.dView.onDot = (r, i, ev) => this.dotClick(r, i, ev);            // 1l.6: mute or edit, by the mode he has lit
            this.dView.onSpan = (a, b, ev, r0, r1) => this.dotSpan(a, b, ev, r0, r1);
        }
        if (!this.dView) return;
        let X = null;
        try { X = this.row.boxes.length ? this.dotsOf(this.recipe(0), true) : null; } catch (e) { X = null; }
        this.dView.pxPerSec = this.pps || this.ppsNow();
        const sel = new Set((this._selDots || []).map(d => d.box + ':' + d.line + ':' + d.i));
        if (X) X.rows.forEach(r => (r || []).forEach(d => { d.sel = sel.has(d.box + ':' + d.line + ':' + d.i); }));
        const rows = X ? X.rows.map((r, Lx) => ({ label: 'L' + (Lx + 1), dots: r || [] })) : [];
        this.dView.set({ rows: rows, t0: 0, t1: Math.max(0.5, this.seqTotal()) });
        this._dotsX = X;
    },
    // a click on the dot view's timeline puts the CURSOR there (as the time strip does)
    setCursorAt(t) {
        this.cursor = Math.round(t * 100) / 100; this.hearFrom = 'cursor'; this.save(); this.render();
        this.setStatus('cursor at ' + this.mss(this.cursor) + ' — SPACE plays the rhythm sequence from there');
    },
    // a click on a box JUMPS the rows there when it is out of sight (the continuous view scrolls with them)
    jumpTo(t0) {
        const wrap = this.el && this.el.querySelector('#rsRowWrap'); if (!wrap) return;
        const x = t0 * (this.pps || this.ppsNow());
        if (x < wrap.scrollLeft || x > wrap.scrollLeft + wrap.clientWidth - 30) wrap.scrollLeft = Math.max(0, x - 20);
    },
    // ------------------------------------------------------------------ 1l.6 — THE DOTS, TOUCHED (docs/PLAN.md § 1l.6; his A: two VISIBLE modes)
    // On the continuous dot view: `mute` — a click turns a dot off or on; `edit` — a click opens the dot's CARD. One dot (a click), a whole
    // LINE of its box (SHIFT+click), or several (drag a BOX over time and lines) take the same touch. A touch is an EXCEPTION kept on its
    // rhythm box, keyed line:dot — so it survives a change of the harmony row and a move of its box, and the recipe carries it. It does not
    // survive a RE-CUT of its box (the panel says how many would be lost, first). A mute is RHYTHM: it stays when a line moves.
    touchKey(d) { return d.line + ':' + d.i; },
    dotsIn(a, b, r0, r1) { const X = this._dotsX; if (!X) return []; const out = []; for (let r = r0; r <= r1; r++) (X.rows[r] || []).forEach(d => { if (d.t >= a - 1e-9 && d.t <= b + 1e-9) out.push(d); }); return out; },
    lineOf(d) { const X = this._dotsX; return X ? [].concat(...X.rows.map(r => (r || []).filter(x => x.box === d.box && x.line === d.line))) : [d]; },
    touchesOf(bi) { const b = this.row.rhythm[bi]; if (!b) return null; if (!b.touches || typeof b.touches !== 'object') b.touches = {}; return b.touches; },
    tidyTouch(bi, k) { const T = this.touchesOf(bi); const t = T && T[k]; if (!t) return; if (t.p && !Object.keys(t.p).length) delete t.p; if (!t.mute) delete t.mute; if (!Object.keys(t).length) delete T[k]; },
    dotClick(row, idx, ev) {
        const X = this._dotsX, d = X && X.rows[row] && X.rows[row][idx]; if (!d) return;
        const set = ev && ev.shiftKey ? this.lineOf(d) : [d];
        if (this.dotMode === 'edit') { this.openCard(set, ev); return; }
        this.toggleMute(set, ev && ev.shiftKey ? 'the line' : 'the dot');
    },
    dotSpan(a, b, ev, r0, r1) {
        const set = this.dotsIn(a, b, r0, r1); if (!set.length) { this.setStatus('no dots in that box', true); return; }
        if (this.dotMode === 'edit') { this.openCard(set, ev); return; }
        this.toggleMute(set, 'the box');
    },
    // MUTE: every dot of the set off — unless every one is already off, then every one back on
    toggleMute(set, what) {
        const allOff = set.every(d => { const t = (this.touchesOf(d.box) || {})[this.touchKey(d)]; return !!(t && t.mute); });
        set.forEach(d => { const T = this.touchesOf(d.box), k = this.touchKey(d); if (!T) return; if (allOff) { if (T[k]) { delete T[k].mute; this.tidyTouch(d.box, k); } } else { (T[k] || (T[k] = {})).mute = true; } });
        this.save(); this.render();
        this.setStatus((allOff ? 'unmuted ' : 'muted ') + what + (set.length > 1 ? ' (' + set.length + ' dots)' : '') + ' — ' + (allOff ? 'it reads the harmony again' : 'silent, and it stays silent if its line moves to another player'));
    },
    // THE CARD: pitch — first the notes of the harmony BENEATH (it stays in the harmony, cents and all), then free · dynamic · articulation ·
    // for the percussion, the vibraphone (one of its two notes beneath) · back to the harmony. One player at a time (a doubled line has two).
    openCard(set, ev) {
        this.closeCard();
        this._selDots = set.slice(); this.drawDots();
        const TP = root.TexturePanel, P = TP ? TP.P7() : [], X = this._dotsX; if (!X || !set.length) return;
        const first = set[0], b = this.row.rhythm[first.box], W = b && this.realized(b.state); if (!W) return;
        const RB = Array.isArray(b.assign) ? Object.assign(Object.create(W.R), { assign: b.assign }) : W.R;
        const slots = [...new Set(set.flatMap(d => { const bb = this.row.rhythm[d.box], WW = bb && this.realized(bb.state); if (!WW) return []; const R2 = Array.isArray(bb.assign) ? Object.assign(Object.create(WW.R), { assign: bb.assign }) : WW.R; return R2.assignOf(d.line); }))].sort((x, y) => x - y);
        if (!slots.length) { this.setStatus('nobody plays these dots — give the line a player (who plays, on the rhythm box)', true); return; }
        const T = +(first.t + (X.G.t0 || 0)).toFixed(4), beneath = [];
        (typeof TRACKS !== 'undefined' ? TRACKS : []).forEach((tr, lane) => [0, 2].forEach(seat => { X.map.at(lane, seat, T).forEach(n => beneath.push({ lane, seat, midi: n.midi, cents: n.cents || 0, partial: n.partial, label: (tr.short || tr.label) + (seat ? '²' : '') + ' ' + pitchName(n.midi) + centsTxt(n.cents) })); }));
        const L = LADDER(), I = (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : {});
        const c = document.createElement('div'); c.id = 'rsCard';
        const x0 = ev && ev.clientX != null ? ev.clientX : window.innerWidth / 2, y0 = ev && ev.clientY != null ? ev.clientY : window.innerHeight / 2;
        c.style.cssText = 'position:fixed;z-index:100001;left:' + Math.max(4, Math.min(x0 + 8, window.innerWidth - 380)) + 'px;top:' + Math.max(4, Math.min(y0 + 8, window.innerHeight - 300)) + 'px;width:360px;' +
            'background:#16141a;color:#ddd;border:1px solid ' + EDGE_ON + ';border-radius:5px;padding:8px 10px;font:12px/1.5 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.6)';
        const SEL = 'style="' + INP + ';max-width:15em"';
        c.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><b style="color:' + EDGE_ON + '">' +
                (set.length === 1 ? 'dot · rhythm box ' + (first.box + 1) + ' · L' + (first.line + 1) + ' · ' + fmtS(T - (this._dotsX.G.t0 || 0)) + ' s' : set.length + ' dots') + '</b>' +
                '<span id="rsCardX" style="cursor:pointer;color:#888">&#10005;</span></div>' +
            '<div style="display:grid;grid-template-columns:5.5em 1fr;gap:3px 6px;align-items:center">' +
            '<span style="color:#b9a">player</span><select id="rsCardP" ' + SEL + '>' + slots.map(s => '<option value="' + s + '">' + esc((P[s] && P[s].label) || ('player ' + s)) + '</option>').join('') + '</select>' +
            '<span style="color:#b9a">pitch</span><select id="rsCardPitch" ' + SEL + '><option value="">as the harmony</option>' +
                beneath.map((n, k) => '<option value="h' + k + '">' + esc(n.label) + ' (beneath)</option>').join('') + '<option value="free">free…</option></select>' +
            '<span></span><span id="rsCardFree" style="display:none">midi <input id="rsCardMidi" type="number" min="21" max="108" step="1" style="width:4.5em;' + INP + '"> cents <input id="rsCardCents" type="number" min="-50" max="50" step="1" value="0" style="width:4em;' + INP + '"></span>' +
            '<span style="color:#b9a">dynamic</span><select id="rsCardDyn" ' + SEL + '><option value="">as the harmony</option>' + (L ? L.NAMES.map(n => '<option value="' + n + '">' + n + '</option>').join('') : '') + '</select>' +
            '<span style="color:#b9a">articulation</span><select id="rsCardTech" ' + SEL + '></select>' +
            '<span style="color:#b9a" id="rsCardVibL">percussion</span><select id="rsCardVib" ' + SEL + '><option value="">as it is</option><option value="0">the vibraphone — note 1 beneath</option><option value="2">the vibraphone — note 2 beneath</option></select>' +
            '</div><div style="display:flex;gap:6px;margin-top:6px">' +
            '<button id="rsCardApply" style="' + BTN + ';color:' + EDGE_ON + '">apply</button>' +
            '<button id="rsCardClear" style="' + BTN + '" title="this player on these dots reads the harmony again — pitch, dynamic, articulation">back to the harmony</button>' +
            '<button id="rsCardMute" style="' + BTN + '" title="mute or unmute these dots — the rhythm itself, for every player of the line">mute / unmute</button></div>';
        document.body.appendChild(c); this._card = c;
        const q = s => c.querySelector(s);
        const fillPlayer = () => {
            const slot = +q('#rsCardP').value, p = P[slot], isPerc = p && p.instKey === 'percussion';
            const vibOn = isPerc && q('#rsCardVib').value !== '', key = vibOn ? 'bowed_vibraphone' : (p && p.instKey), techs = (I[key] && I[key].techniques) || [];
            q('#rsCardTech').innerHTML = '<option value="">' + (vibOn ? 'Standard Mallets (the default)' : 'as the take') + '</option>' + techs.map(t => '<option value="' + esc(t.key) + '">' + esc(t.label || t.key) + '</option>').join('');
            q('#rsCardVib').style.display = isPerc ? '' : 'none'; q('#rsCardVibL').style.display = isPerc ? '' : 'none';
            q('#rsCardPitch').disabled = vibOn;
            const cur = ((this.touchesOf(first.box) || {})[this.touchKey(first)] || {}).p, o = cur && cur[slot];
            q('#rsCardDyn').value = (o && o.dyn) || ''; q('#rsCardTech').value = (o && o.tech) || ''; if (isPerc) q('#rsCardVib').value = (o && o.vib != null) ? String(o.vib) : q('#rsCardVib').value;
        };
        q('#rsCardP').addEventListener('change', fillPlayer);
        q('#rsCardVib').addEventListener('change', () => { const keep = q('#rsCardVib').value; fillPlayer(); q('#rsCardVib').value = keep; });
        q('#rsCardPitch').addEventListener('change', e => { q('#rsCardFree').style.display = e.target.value === 'free' ? '' : 'none'; });
        q('#rsCardX').addEventListener('click', () => this.closeCard());
        q('#rsCardMute').addEventListener('click', () => { this.toggleMute(this._selDots || set, (this._selDots || set).length + ' dot' + ((this._selDots || set).length === 1 ? '' : 's')); this.closeCard(); });
        q('#rsCardClear').addEventListener('click', () => {
            const slot = +q('#rsCardP').value;
            set.forEach(d => { const TT = this.touchesOf(d.box), k = this.touchKey(d); if (TT && TT[k] && TT[k].p) { delete TT[k].p[slot]; this.tidyTouch(d.box, k); } });
            this.save(); this.closeCard(); this.render(); this.setStatus('back to the harmony — ' + set.length + ' dot' + (set.length === 1 ? '' : 's') + ' of ' + ((P[slot] && P[slot].label) || 'that player') + ' read the harmony again');
        });
        q('#rsCardApply').addEventListener('click', () => {
            const slot = +q('#rsCardP').value, p = P[slot], isPerc = p && p.instKey === 'percussion', o = {};
            const pv = q('#rsCardPitch').value, dyn = q('#rsCardDyn').value, tech = q('#rsCardTech').value, vib = isPerc ? q('#rsCardVib').value : '';
            if (vib !== '') o.vib = +vib;
            else if (pv === 'free') { const m = Math.round(+q('#rsCardMidi').value); if (!(m >= 21 && m <= 108)) { this.setStatus('a free pitch is a MIDI note, 21 … 108', true); return; } o.midi = m; o.cents = clamp(+q('#rsCardCents').value || 0, -50, 50); }
            else if (pv && pv[0] === 'h') { const n = beneath[+pv.slice(1)]; if (n) { o.midi = n.midi; o.cents = n.cents; if (n.partial != null) o.partial = n.partial; } }
            if (dyn) o.dyn = dyn;
            if (tech) o.tech = tech;
            if (!Object.keys(o).length) { this.setStatus('nothing chosen — pick a pitch, a dynamic or an articulation (or `back to the harmony`)', true); return; }
            set.forEach(d => { const TT = this.touchesOf(d.box), k = this.touchKey(d); if (!TT) return; const t = TT[k] || (TT[k] = {}); (t.p || (t.p = {}))[slot] = Object.assign({}, o); });
            this.save(); this.closeCard(); this.render();
            this.setStatus('changed ' + set.length + ' dot' + (set.length === 1 ? '' : 's') + ' of ' + ((p && p.label) || 'that player') + ': ' + [o.vib != null ? 'the vibraphone, note ' + (o.vib ? 2 : 1) + ' beneath' : '', o.midi != null ? pitchName(o.midi) + centsTxt(o.cents) : '', o.dyn || '', o.tech || ''].filter(Boolean).join(' · ') + ' — the rest keep reading the harmony');
        });
        fillPlayer();
    },
    closeCard() { if (this._card) { this._card.remove(); this._card = null; } if (this._selDots) { this._selDots = null; this.drawDots(); } },
    touchCount(b) { return (b && b.touches) ? Object.keys(b.touches).length : 0; },

    // WHO PLAYS, per box (the same grid as Texture's, 1l.2): only the RHYTHM moves — the pitch comes from the new player's note; the pitches and
    // articulations changed on that line are DROPPED (LG-57); its MUTES stay — they are rhythm
    openWho(bi, anchor) {
        this.closeWho();
        const b = this.row.rhythm[bi], W = b && this.realized(b.state), TP = root.TexturePanel; if (!W || !TP) return;
        const P = TP.P7(), RB = Array.isArray(b.assign) ? Object.assign(Object.create(W.R), { assign: b.assign }) : W.R, n = W.lines.length;
        const r = anchor ? anchor.getBoundingClientRect() : { left: 200, bottom: 200 };
        const w = document.createElement('div'); w.id = 'rsWho';
        w.style.cssText = 'position:fixed;z-index:100001;left:' + Math.max(4, Math.min(r.left, window.innerWidth - 320)) + 'px;top:' + Math.max(4, Math.min(r.bottom + 4, window.innerHeight - 40 - n * 22)) + 'px;background:#16141a;color:#ddd;border:1px solid ' + EDGE_ON + ';border-radius:5px;padding:6px 8px;font:12px/1.4 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.6)';
        let h = '<div style="display:flex;justify-content:space-between;margin-bottom:3px"><b style="color:' + EDGE_ON + '">who plays · rhythm box ' + (bi + 1) + '</b><span id="rsWhoX" style="cursor:pointer;color:#888;margin-left:12px">&#10005;</span></div><table style="border-collapse:collapse"><tr><td></td>' + P.map(p => '<td style="padding:0 3px;color:#b9a;text-align:center">' + esc(p.short) + '</td>').join('') + '</tr>';
        for (let L = 0; L < n; L++) { const on = new Set(RB.assignOf(L)); h += '<tr><td style="color:#9a9;padding-right:4px">L' + (L + 1) + '</td>' + P.map((p, c) => '<td style="text-align:center"><input type="checkbox" data-l="' + L + '" data-c="' + c + '"' + (on.has(c) ? ' checked' : '') + '></td>').join('') + '</tr>'; }
        h += '</table><div style="color:#888;margin-top:3px">only the rhythm moves: a moved line reads its NEW player\'s note; its changed pitches and articulations go, its mutes stay</div>';
        w.innerHTML = h; document.body.appendChild(w); this._who = w;
        w.querySelector('#rsWhoX').addEventListener('click', () => this.closeWho());
        w.addEventListener('change', e => {
            const cb = e.target.closest('input[data-l]'); if (!cb) return;
            const L = +cb.dataset.l, c = +cb.dataset.c, cur = [];
            const RBnow = Array.isArray(b.assign) ? Object.assign(Object.create(W.R), { assign: b.assign }) : W.R;   // as it stands NOW — not as the grid opened
            for (let k = 0; k < n; k++) cur.push(RBnow.assignOf(k).slice());
            const set = new Set(cur[L]); if (cb.checked) set.add(c); else set.delete(c); cur[L] = [...set].sort((x, y) => x - y);
            b.assign = cur;
            let dropped = 0; const TT = this.touchesOf(bi) || {};
            Object.keys(TT).forEach(k => { if (+k.split(':')[0] === L && TT[k].p) { dropped += Object.keys(TT[k].p).length; delete TT[k].p; this.tidyTouch(bi, k); } });
            this.save(); this.render();
            this.setStatus('rhythm box ' + (bi + 1) + ' · L' + (L + 1) + ' now played by ' + (cur[L].length ? cur[L].map(s => P[s].short).join(' + ') : 'nobody') + (dropped ? ' · ' + dropped + ' changed pitch/articulation touch' + (dropped === 1 ? '' : 'es') + ' dropped — its mutes stay' : ''));
        });
    },
    closeWho() { if (this._who) { this._who.remove(); this._who = null; } },
    paintDotMode() {
        const m = this.dotMode === 'edit' ? 'edit' : 'mute';
        ['mute', 'edit'].forEach(k => { const b = this.el && this.el.querySelector('#rsDM' + k); if (b) { b.style.background = k === m ? '#4a3420' : '#2a2a30'; b.style.color = k === m ? '#f0c890' : '#ccc'; } });
    },


    removeBox(i) { if (!this.row.boxes[i]) return; this.row.boxes.splice(i, 1); this.sel = Math.min(i, this.row.boxes.length - 1); this.selTo = null; this.save(); this.render(); },
    moveBox(i, by) { const j = i + by, B = this.row.boxes; if (!B[i] || j < 0 || j >= B.length) return; const t = B[i]; B[i] = B[j]; B[j] = t; this.sel = j; this.selTo = null; this.save(); this.render(); },
    // 1d.11: `new` DESTROYS NOTHING — the row being left is already on disk in the library, so there is no longer a prompt
    startNew() { this.libNewRow(); },

    // ------------------------------------------------------------------ the roll (1d.4): time_containers.js's dials, the strikes drawer's habit
    buildRoll() {
        const line = this.el.querySelector('#rsRoll'), T = TC(); if (!line) return;
        if (!T) { line.innerHTML = '<span style="color:#e88">time_containers.js is not loaded — no roll</span>'; return; }
        const lab = 'color:#8a8';
        line.innerHTML = '<span style="color:#e8a06a">roll</span>' +
            '<select id="rsRPre" style="' + INP + ';max-width:15.455em" title="a starting point, sorted by SPREAD (largest ÷ smallest) — the spread is what you hear. Picking one fills the boxes; it is not a mode."><option value="">preset…</option>' +
                T.PRESETS.map(p => '<option value="' + esc(p.key) + '" title="' + esc(p.note) + '">' + T.spreadOf(p.values) + '× · ' + esc(p.label) + ' — ' + p.values.join(' ') + '</option>').join('') + '</select>' +
            '<input id="rsRVals" type="text" style="' + INP + ';width:10em" title="the numbers, separated by spaces">' +
            '<input id="rsRW" type="text" style="' + INP + ';width:10em" placeholder="weights" title="one weight per number, or blank. 20 or 20% or 0.2 all mean a fifth; a dash or a gap means “share what is left”. Typing here puts the tilt back to the middle — a typed weight stands.">' +
            '<label style="' + lab + '" title="weight the short values or the long ones: FILLS the weights box (weight ∝ value^k). The middle = no weights.">tilt short <input id="rsRTilt" type="range" min="-3" max="3" step="0.25" style="width:6.545em;vertical-align:middle"> long</label>' +
            '<label style="' + lab + '" title="seconds per unit — one number rescales the whole set">× <input id="rsRUnit" type="number" step="0.05" min="0.01" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="the span the roll fills; it stops short and says by how much">fill <input id="rsRTot" type="number" step="1" min="1" style="' + INP + ';width:4.727em"> s</label>' +
            '<label style="' + lab + '" title="how many containers. BLANK: the grey number is what the dials give now. Type a number and it FILLS the × box — the seconds per unit that makes that many fit the span, for this seed (re-roll solves it again). Typing × yourself clears it: × stays the truth">count <input id="rsRCount" type="number" step="1" min="1" style="' + INP + ';width:4em"></label>' +
            '<label style="' + lab + '" title="how much the next container stays near the last — the periodicity">stick <input id="rsRStick" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:4em"></label>' +
            '<label style="' + lab + '" title="how often it deliberately leaps far — the interruption">interrupt <input id="rsRJump" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:4em"></label>' +
            '<select id="rsRContour" style="' + INP + '" title="the accordion: the size the roll is pulled toward across the span">' + T.CONTOURS.map(c => '<option value="' + c[0] + '">' + esc(c[1]) + '</option>').join('') + '</select>' +
            '<span id="rsRShape" style="display:none;gap:4px;align-items:center">' +
                '<label style="' + lab + '" title="where the reversal sits — the asymmetry">turn <input id="rsRTurn" type="number" step="0.05" min="0.02" max="0.98" style="' + INP + ';width:4em"></label>' +
                '<label style="' + lab + '" title="broad (below 1) or sharp (above 1) at the turn">bow <input id="rsRBow" type="number" step="0.1" min="0.1" max="4" style="' + INP + ';width:4em"></label>' +
                '<label style="' + lab + '" title="how hard the contour pulls">depth <input id="rsRDepth" type="number" step="0.1" min="0" max="4" style="' + INP + ';width:4em"></label>' +
            '</span>' +
            '<label style="' + lab + '" title="the same seed rolls the same set">seed <input id="rsRSeed" type="number" step="1" min="1" style="' + INP + ';width:4.364em"></label>' +
            '<button id="rsRGo" style="' + BTN + ';color:#e8a06a" title="roll with this seed — the durations become the row\'s boxes. Chords already in the row stay in their boxes, by position (it asks first)">roll</button>' +
            '<button id="rsRNext" style="' + BTN + '" title="the next seed, rolled">re-roll</button>';
        const q = s => line.querySelector(s);
        q('#rsRPre').addEventListener('change', e => {
            const p = T.PRESETS.find(x => x.key === e.target.value); e.target.blur(); if (!p) return;
            const c = this.row.roll; c.preset = p.key; c.values = p.values.join(' '); c.tilt = 0;
            c.weights = p.weights ? p.weights.map(w => (w == null ? '-' : Math.round(w * 100) + '%')).join(' ') : '';
            this.solveCount();   // a count that is set holds: × follows the new numbers
            this.save(); this.paintRoll(); this.setStatus(p.label + ' — ' + p.note + ' · spread ' + T.spreadOf(p.values) + '× · press roll');
        });
        ['rsRVals', 'rsRW', 'rsRUnit', 'rsRTot', 'rsRCount', 'rsRStick', 'rsRJump', 'rsRContour', 'rsRTurn', 'rsRBow', 'rsRDepth', 'rsRSeed'].forEach(id => {
            q('#' + id).addEventListener('change', e => {
                const c = this.row.roll;
                c.values = q('#rsRVals').value;
                if (id === 'rsRW') { c.tilt = 0; c.weights = q('#rsRW').value; }   // a typed weight stands, and the tilt goes back to the middle
                else if (id === 'rsRVals' && c.tilt) this.applyTilt();             // new numbers under a tilt: the weights follow them
                c.unit = +q('#rsRUnit').value || 1; c.total = +q('#rsRTot').value || 60;
                c.stick = +q('#rsRStick').value; c.jump = +q('#rsRJump').value; c.contour = q('#rsRContour').value;
                c.turn = +q('#rsRTurn').value; c.bow = +q('#rsRBow').value; c.depth = +q('#rsRDepth').value;
                c.seed = Math.max(1, Math.round(+q('#rsRSeed').value || 1));
                if (id === 'rsRVals' || id === 'rsRW') c.preset = '';
                // the count: a typed × stands and clears it; otherwise a count that is set HOLDS — × is solved again under whatever dial moved
                if (id === 'rsRUnit') c.count = '';
                else if (id === 'rsRCount') { const n = Math.round(+q('#rsRCount').value); c.count = n >= 1 ? n : ''; }
                const solved = this.solveCount();
                if (e.target.tagName === 'SELECT' || e.target.type === 'number') e.target.blur();
                this.save(); this.paintRoll(); if (id === 'rsRContour') this.fitStrikes();
                if (solved && id === 'rsRCount') this.setStatus('count ' + c.count + '  →  × ' + solved.unit + ' s' + (solved.count === c.count ? '' : ' — these dials cannot give exactly ' + c.count + ': this gives ' + solved.count) + (solved.short > 0.001 ? ' · ' + fmtS(solved.short) + ' s short of the fill' : '') + ' · seed ' + c.seed + ' · press roll', solved.count !== c.count);
            });
            if (id === 'rsRVals' || id === 'rsRW') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
        q('#rsRTilt').addEventListener('input', e => { this.row.roll.tilt = +e.target.value || 0; this.applyTilt(); this.solveCount(); this.paintRoll(); });
        q('#rsRTilt').addEventListener('change', e => { e.target.blur(); this.save(); const k = this.row.roll.tilt; this.setStatus(k ? 'tilt ' + (k > 0 ? 'toward the LONG values' : 'toward the SHORT values') + ' (k ' + k + ') — weights ' + this.row.roll.weights : 'tilt off — no weights'); });
        q('#rsRGo').addEventListener('click', () => this.doRoll(false));
        q('#rsRNext').addEventListener('click', () => this.doRoll(true));
    },
    paintRoll() {
        const line = this.el && this.el.querySelector('#rsRoll'); if (!line) return;
        line.style.display = this.rollOpen ? 'flex' : 'none';
        const tog = this.el.querySelector('#rsRollTog'); if (tog) { tog.textContent = this.rollOpen ? 'roll ▾' : 'roll ▸'; tog.style.background = this.rollOpen ? '#3a2a18' : '#2a2a30'; }
        const c = this.row.roll, q = s => line.querySelector(s); if (!q('#rsRVals')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#rsRPre', c.preset || ''); put('#rsRVals', c.values); put('#rsRW', c.weights); put('#rsRTilt', c.tilt || 0);
        put('#rsRCount', c.count || '');
        if (this.rollOpen && TC()) { const now = TC().roll(this.rollOpts()); q('#rsRCount').placeholder = String(now.count); }   // blank = a readout: what these dials and this seed give
        put('#rsRUnit', c.unit); put('#rsRTot', c.total); put('#rsRStick', c.stick); put('#rsRJump', c.jump); put('#rsRContour', c.contour);
        put('#rsRTurn', c.turn); put('#rsRBow', c.bow); put('#rsRDepth', c.depth); put('#rsRSeed', c.seed);
        q('#rsRShape').style.display = c.contour && c.contour !== 'flat' ? 'inline-flex' : 'none';
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
        const line = this.el.querySelector('#rsEdges'); if (!line) return;
        const lab = 'color:#8a8', L = LADDER(), far = '<option value="' + SEQ.NIENTE + '">niente</option>' + (L ? L.NAMES : []).map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('');
        line.innerHTML = '<span style="color:#e6c46a">edges</span>' +
            '<label style="' + lab + '" title="the sequence comes IN over this many seconds. 0 = it just starts. The fade follows how it begins (box 1\'s `enter`): everyone together → one fade for all · staggered → each player fades in on their own entry">fade in <input id="rsEIn" type="number" step="0.5" min="0" max="600" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="where the fade in starts FROM — niente = true silence (the fader from zero) · a dynamic = a calibrated crescendo or diminuendo into the box; it may be LOUDER than the box — an entry that settles">from <select id="rsEFrom" style="' + INP + '">' + far + '</select></label>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<label style="' + lab + '" title="the sequence goes OUT over this many seconds. 0 = it just ends. The fade follows the exit: together → one fade for all · one by one → each player fades on their own ending">fade out <input id="rsEOut" type="number" step="0.5" min="0" max="600" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="where the fade out arrives — niente = true silence · a dynamic = a calibrated diminuendo or crescendo out of the box">to <select id="rsETo" style="' + INP + '">' + far + '</select></label>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<label style="' + lab + '" title="how the players LEAVE — together: every last breath lands on the end · one by one: each player finishes a last breath of their own, the ends spread over the last stretch before the line (the fade out\'s length, else one breath), the latest ON the line">exit <select id="rsEExit" style="' + INP + '">' + SEQ.EXITS.map(x => '<option value="' + x + '">' + x + '</option>').join('') + '</select></label>';
        const q = s => line.querySelector(s);
        ['rsEIn', 'rsEFrom', 'rsEOut', 'rsETo', 'rsEExit'].forEach(id => {
            q('#' + id).addEventListener('change', e => {
                e.target.blur();
                this.row.edges = this.edgesDefaults({ fadeIn: q('#rsEIn').value, fadeInFrom: q('#rsEFrom').value, fadeOut: q('#rsEOut').value, fadeOutTo: q('#rsETo').value, exit: q('#rsEExit').value });
                this.save(); this.paintEdges(); this.edgesStatus();
            });
            if (id === 'rsEIn' || id === 'rsEOut') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
    },
    paintEdges() {
        const line = this.el && this.el.querySelector('#rsEdges'); if (!line) return;
        line.style.display = this.edgesOpen ? 'flex' : 'none';
        const tog = this.el.querySelector('#rsEdgesTog');
        if (tog) { tog.textContent = 'edges' + (this.isDefaultEdges() ? '' : ' •') + (this.edgesOpen ? ' ▾' : ' ▸'); tog.style.background = this.edgesOpen ? '#3a3218' : '#2a2a30'; }
        const e = this.row.edges, q = s => line.querySelector(s); if (!q('#rsEIn')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        put('#rsEIn', e.fadeIn); put('#rsEFrom', e.fadeInFrom); put('#rsEOut', e.fadeOut); put('#rsETo', e.fadeOutTo); put('#rsEExit', e.exit);
        q('#rsEFrom').parentNode.style.opacity = e.fadeIn > 0 ? 1 : 0.45; q('#rsETo').parentNode.style.opacity = e.fadeOut > 0 ? 1 : 0.45;
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
        const line = this.el.querySelector('#rsWaves'); if (!line) return;
        const lab = 'color:#8a8', L = LADDER(), d = SEQ.DEFAULT_WAVES, opts = (L ? L.NAMES : []).map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('');
        line.innerHTML = '<span style="color:' + WTINT + '">waves</span>' +
            // 1d.13: ONE menu fills every dial below it. The five are starting points and he refines them as he composes.
            '<label style="' + lab + '" title="a way of behaving, not a number to type: it fills every dial on this line. The five are starting points — turn any dial and `save preset` keeps your own under a name (one saved under a built-in\'s name overrides it)">preset <select id="rsWPre" style="' + INP + '"></select></label>' +
            '<button id="rsWSave" style="' + BTN + ';color:' + WTINT + '" title="keep this whole waves line under a name">save preset</button>' +
            '<button id="rsWDel" style="' + BTN + '" title="delete the preset of your own that is chosen — a built-in of the same name comes back">&times;</button>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<label style="' + lab + '" title="the SHORTEST a swell may last, in seconds. Every swell is drawn somewhere between this and `longest`">short <input id="rsWShort" type="number" step="1" min="0.5" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="the LONGEST a swell may last, in seconds">long <input id="rsWLong" type="number" step="1" min="0.5" style="' + INP + ';width:4.364em"> s</label>' +
            '<label style="' + lab + '" title="which end of that span the draws lean toward: −1 all short · 0 even · +1 all long">tilt <input id="rsWTilt" type="range" min="-1" max="1" step="0.1" style="width:6.4em;vertical-align:middle"><span id="rsWTiltN" style="color:#9ab"></span></label>' +
            '<label style="' + lab + '" title="the shape of every swell — the RISE as a share of the moving time, the fall taking the rest. golden: the rise is the long part of the division (his default) · reverse golden: the fall is · even: half and half · surge: a quick rise, a long fall · bloom: a long rise, a quick fall">shape <select id="rsWShape" style="' + INP + '">' + Object.keys(SEQ.SHAPES).map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join('') + '</select></label>' +
            '<label style="' + lab + '" title="how long a swell SITS at its top, as a share of its length: 0.2 means a 10 s swell holds for 2 s. The rise and the fall share what is left">hold <input id="rsWHold" type="number" step="0.05" min="0" max="1" style="' + INP + ';width:4.364em"></label>' +
            '<label style="' + lab + '" title="how much of the time a player is inside a swell — the rest sits at `low`. constant: swells back to back · rare: one now and then">density <select id="rsWDen" style="' + INP + '"></select></label>' +
            '<label style="' + lab + '" title="the BOTTOM of every wave, and where a player rests between swells — a written dynamic. There is no niente inside the waves: silence belongs to the sequence\'s edges. A RANGE of boxes can read the same waves through a range of its own (1d.12)">low <select id="rsWLo" style="' + INP + '">' + opts + '</select></label>' +
            '<label style="' + lab + '" title="the TOP of every wave — a written dynamic">high <select id="rsWHi" style="' + INP + '">' + opts + '</select></label>' +
            '<label style="' + lab + '" title="the waves have a seed of their own — the same seed deals the same streams">seed <input id="rsWSeed" type="number" step="1" min="1" style="' + INP + ';width:4.364em"></label>' +
            '<button id="rsWNext" style="' + BTN + ';color:' + WTINT + '" title="the next seed: every player\'s stream is dealt again — the chords, the durations and the breath dials are not touched (a wave that passes a louder top may shorten a breath: the ceiling is read at the loudest point)">re-wave</button>' +
            '<span style="width:1px;height:1.455em;background:#3a4148"></span>' +
            '<span style="' + lab + '">all boxes →</span><button id="rsWAll" style="' + BTN + ';color:' + WTINT + '" title="every box reads the waves (each remembers the straight dyn it had)">waves</button>' +
            '<button id="rsWNone" style="' + BTN + '" title="every box back to the straight dyn it had before the waves">straight</button>' +
            '<span id="rsWOld" style="color:#e8a06a;display:none" title="this sequence was made before the presets: it still has a typed pool of lengths and a `peak`, and it still plays exactly as it did. Turn any dial on this line and it takes the preset dials instead">made before the presets</span>';
        const q = s => line.querySelector(s);
        ['rsWShort', 'rsWLong', 'rsWTilt', 'rsWShape', 'rsWHold', 'rsWDen', 'rsWLo', 'rsWHi', 'rsWSeed'].forEach(id => {
            q('#' + id).addEventListener('change', e => { if (e.target.tagName === 'SELECT' || e.target.type === 'number') e.target.blur(); this.readWaves(); this.save(); this.paintWaves(); this.wavesStatus('waves'); });
            q('#' + id).addEventListener('input', e => { if (e.target.type === 'range') { const n = q('#rsWTiltN'); if (n) n.textContent = ' ' + (+e.target.value).toFixed(1); } });
            if (id !== 'rsWLo' && id !== 'rsWHi' && id !== 'rsWShape' && id !== 'rsWDen') q('#' + id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        });
        q('#rsWPre').addEventListener('change', e => { const n = e.target.value; e.target.blur(); if (n) this.applyPreset(n); else this.paintWaves(); });
        q('#rsWSave').addEventListener('click', () => this.savePreset());
        q('#rsWDel').addEventListener('click', () => this.deletePreset(q('#rsWPre').value));
        q('#rsWNext').addEventListener('click', () => { this.stop(); this.row.waves.seed = Math.max(1, Math.round(+this.row.waves.seed || 1)) + 1; this.save(); this.paintWaves(); this.wavesStatus('re-waved'); });
        q('#rsWAll').addEventListener('click', () => this.setAllBoxes(true));
        q('#rsWNone').addEventListener('click', () => this.setAllBoxes(false));
    },
    // ONE menu fills every dial. The seed is not part of a behaviour, so it is kept — picking a preset does not re-deal.
    applyPreset(name) {
        const p = this.presetOf(name); if (!p) { this.setStatus('no preset named "' + name + '"', true); return; }
        const was = this.isOldWaves(this.row.waves);
        this.stop();
        this.row.waves = this.wavesDefaults(Object.assign({ seed: this.row.waves.seed }, p));
        this.save(); this.paintWaves();
        this.wavesStatus('preset "' + name + '"' + (was ? ' — the typed pool and the peak are gone: this line has the preset dials now' : ''));
    },
    async savePreset() {
        const suggest = this.presetMatch() || '';
        const name = String(window.prompt('Keep this waves line as a preset called:', suggest) || '').trim();
        if (!name) return;
        if (!LIB_NAME_RE.test(name)) { this.setStatus('a preset name may hold letters, digits, dot, underscore, space or hyphen, up to 64 — not "' + name + '"', true); return; }
        if (this.presetIx()[name] && !window.confirm('Replace your preset "' + name + '"?')) return;
        if (WAVE_PRESETS[name] && !this.presetIx()[name] && !window.confirm('"' + name + '" is one of the built-in presets.\n\nSaving it here OVERRIDES the built-in — the `×` beside the menu brings it back.')) return;
        const w = JSON.parse(JSON.stringify(this.row.waves)); delete w.seed;   // a behaviour, not a deal
        try { await this.presetPost({ name: name, state: { waves: w } }); } catch (e) { this.setStatus('the preset did not save: ' + (e && e.message || e), true); return; }
        this.paintWaves();
        this.setStatus('preset "' + name + '" saved' + (WAVE_PRESETS[name] ? ' — it overrides the built-in of that name' : '') + ' · it is in bank/sequences.json (shared with the sequence drawer) and rides in the repo');
    },
    async deletePreset(name) {
        if (!name || !this.presetIx()[name]) { this.setStatus(name && WAVE_PRESETS[name] ? '"' + name + '" is a built-in preset — there is nothing of yours to delete' : 'choose one of your own presets first', true); return; }
        if (!window.confirm('Delete your preset "' + name + '"?' + (WAVE_PRESETS[name] ? '\n\nThe built-in of that name comes back.' : ''))) return;
        try { await this.presetPost({ name: name, delete: true }); } catch (e) { this.setStatus('not deleted: ' + (e && e.message || e), true); return; }
        this.paintWaves();
        this.setStatus('preset "' + name + '" deleted' + (WAVE_PRESETS[name] ? ' — the built-in is back' : ''));
    },
    presetText() {
        const w = this.row.waves;
        if (this.isOldWaves(w)) return 'a pool of ' + w.lengths.values.join(' ') + ' s · peak ' + w.peak + ' · ' + w.low + '–' + w.high;
        return w.shortest + '–' + w.longest + ' s · ' + w.shape + ' · hold ' + w.hold + ' · ' + (this.densityWord(w.density) || w.density) + ' · ' + w.low + '–' + w.high;
    },
    readWaves() {
        const line = this.el.querySelector('#rsWaves'), q = s => line.querySelector(s), d = NEW_WAVES;
        const num = (s, def) => { const v = q(s).value.trim(); return v === '' || !isFinite(+v) ? def : +v; };
        // touching ANY dial converts an old line to the preset dials — and says so; nothing converts by merely being opened
        const w = this.isOldWaves(this.row.waves) ? this.wavesDefaults(Object.assign({}, NEW_WAVES, { seed: this.row.waves.seed, low: this.row.waves.low, high: this.row.waves.high })) : this.row.waves;
        this.row.waves = w;
        w.shortest = Math.max(0.5, num('#rsWShort', d.shortest));
        w.longest = Math.max(w.shortest, num('#rsWLong', d.longest));
        w.tilt = clamp(num('#rsWTilt', 0), -1, 1);
        w.shape = SEQ.SHAPES[q('#rsWShape').value] != null ? q('#rsWShape').value : d.shape;
        w.hold = clamp(num('#rsWHold', d.hold), 0, 1);
        const den = DENSITY_WORDS.find(p => p[0] === q('#rsWDen').value);
        w.density = den ? den[1] : clamp(+q('#rsWDen').value || d.density, 0, 1);
        w.low = this.straightOk(q('#rsWLo').value) === AS_DEALT ? d.low : q('#rsWLo').value;
        w.high = this.straightOk(q('#rsWHi').value) === AS_DEALT ? d.high : q('#rsWHi').value;
        w.seed = Math.max(1, Math.round(num('#rsWSeed', d.seed)));
    },
    paintWaves() {
        const line = this.el && this.el.querySelector('#rsWaves'); if (!line) return;
        line.style.display = this.wavesOpen ? 'flex' : 'none';
        const n = this.row.boxes.filter(b => b.dyn === WAVES).length, tog = this.el.querySelector('#rsWavesTog');
        if (tog) { tog.textContent = 'waves' + (n ? ' ∿' + n : '') + (this.wavesOpen ? ' ▾' : ' ▸'); tog.style.background = this.wavesOpen ? '#2a2140' : '#2a2a30'; }   // ∿N: how many boxes read the waves
        const w = this.row.waves, q = s => line.querySelector(s); if (!q('#rsWShort')) return;
        const put = (s, v) => { const el = q(s); if (el && document.activeElement !== el) el.value = v; };
        const old = this.isOldWaves(w), shown = old ? NEW_WAVES : w;   // an old line shows the preset dials it WOULD take, and says so
        // the preset menu: the built-ins, his own after them, and an overridden built-in marked
        const names = this.presetNames(), here = this.presetMatch();
        const sig = names.map(n => n + (this.presetIx()[n] ? '*' : '')).join('|') + '@' + here;
        if (sig !== this._preSig) {
            this._preSig = sig;
            q('#rsWPre').innerHTML = '<option value="">' + (here ? '— ' + esc(here) + ' —' : '— your own dials —') + '</option>' +
                names.map(n => '<option value="' + esc(n) + '">' + esc(n) + (this.presetIx()[n] ? (WAVE_PRESETS[n] ? ' (yours, over the built-in)' : ' (yours)') : '') + '</option>').join('');
        }
        q('#rsWPre').value = '';
        if (!q('#rsWDen').options.length) q('#rsWDen').innerHTML = DENSITY_WORDS.map(p => '<option value="' + p[0] + '">' + p[0] + '</option>').join('') + '<option value="">(a number)</option>';
        put('#rsWShort', shown.shortest); put('#rsWLong', shown.longest); put('#rsWTilt', shown.tilt || 0);
        put('#rsWShape', shown.shape); put('#rsWHold', shown.hold);
        put('#rsWDen', this.densityWord(shown.density) || '');
        put('#rsWLo', w.low); put('#rsWHi', w.high); put('#rsWSeed', w.seed);
        const tn = q('#rsWTiltN'); if (tn) tn.textContent = ' ' + (+(shown.tilt || 0)).toFixed(1);
        const ow = q('#rsWOld'); if (ow) ow.style.display = old ? '' : 'none';
        [q('#rsWShort'), q('#rsWLong'), q('#rsWTilt'), q('#rsWShape'), q('#rsWHold'), q('#rsWDen')].forEach(el => { if (el) el.style.opacity = old ? 0.55 : 1; });
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
        const w = this.row.waves, txt = this.presetText() + ' · seed ' + w.seed;
        if (!this.row.boxes.some(b => b.dyn === WAVES && b.chord.length)) { this.setStatus(lead + ': ' + txt + ' — no box reads the waves yet: set a box\'s dyn to `waves`, or `all boxes → waves`'); return; }
        const G = this.generate(0); if (!G) return;   // generate() has said why (low above high, …)
        const waved = G.notes.filter(n => n.waves).length, sw = Object.keys(G.streams || {}).map(k => G.streams[k].swells);
        this.setStatus(lead + ': ' + txt + '  →  ' + waved + ' of ' + G.notes.length + ' notes read the waves · swells per player ' + sw.join(' ') + this.flagsText(G));
    },

    // 1l.3: THE BREATH LINE IS LEFT OUT — nothing is held here, so nothing breathes (MAP_BREATH, at the head of this file).

    // ------------------------------------------------------------------ a box takes its chord: the take, LOADED in the strikes drawer, as `long tone` deals it
    // the chord of a saved take, as `long tone` deals it — it LOADS the take in the strikes drawer, so he sees it. Null, and the status
    // says why, when it cannot. Shared by `freeze` (the box takes it) and `previewTake` (the takes menu's ▸: heard, not chosen)
    async dealTake(name) {
        if (!D.db && D.loadDb) await D.loadDb(false);
        if (!D.takeList || !D.takeList[name]) await D.refreshTakes();
        const t = D.takeList && D.takeList[name];
        if (!t) { this.setStatus('no take named "' + name + '" in bank/panel_snapshots.json', true); return null; }
        await D.loadTake(name);
        const want = t.state && t.state.strikeId;
        if (!D.strike || (want && D.strike.id !== want)) { this.setStatus('"' + name + '" could not be loaded in the strikes drawer — its harmony (' + want + ') was not found', true); return null; }
        const T = D.tracks(), L = LADDER(), lo = L ? L.LO : 65, hi = L ? L.HI : 127;
        const dealt = D.longNotes(D.notesFor('orch'));
        const chord = dealt.filter(n => Number.isInteger(n.lane) && n.lane >= 0 && T[n.lane] && isFinite(+n.midi)).map(n => {
            const vel = clamp(Math.round(+n.vel || lo), lo, hi);
            const o = { lane: n.lane, seat: n.seat || 0, inst: T[n.lane].instKey, tech: n.tech, midi: +n.midi, cents: +(+n.cents || 0).toFixed(2), level: +((vel - lo) / (hi - lo)).toFixed(4), vel: vel };
            if (n.partial != null) o.partial = n.partial;
            return o;
        });
        if (!chord.length) { this.setStatus('"' + name + '" dealt no notes — open the strikes drawer and look: nothing assigned, or every player busy at the playhead (PLAN 1t)', true); return null; }
        return chord;
    },
    async freeze(i, name) {
        const b = this.row.boxes[i]; if (!b) return;
        if (!name) { b.take = ''; b.chord = []; b.frozen = ''; this.save(); this.render(); this.setStatus('box ' + (i + 1) + ' is a REST — silence for its ' + fmtS(b.dur) + ' s'); return; }
        try {
            const chord = await this.dealTake(name);
            if (!chord) { this.renderEdit(); return; }
            b.take = name; b.chord = chord; b.frozen = new Date().toISOString();
            this.save(); this.render();
            const np = this.players(chord);
            this.setStatus('box ' + (i + 1) + ' ← "' + name + '" · ' + np + ' player' + (np === 1 ? '' : 's') + ' frozen: ' + this.chordText(chord));
        } catch (e) { this.setStatus('take not read: ' + (e && e.message || e), true); this.renderEdit(); }
    },

    // ------------------------------------------------------------------ THE TAKES MENU (2026-09-20) — his ask of RUNNING_LOG 120, read then as a
    // button per BOX: *"in the takes menu a small button next to the take to preview"*. A native pull-down cannot hold a button, so
    // the box's `take` is a list of our own: a ▸ beside every take (HEAR it — 5 s, at this box's dyn — WITHOUT choosing it; click the
    // lit one again to stop), the NAME chooses it, and a filter over the 200-odd names. ESC or a click outside closes it.
    closeTakeMenu() {
        const m = this._takeMenu; if (!m) return;
        this._takeMenu = null; document.removeEventListener('mousedown', m._out, true); m.remove();
    },
    paintTakeMenu() {
        const m = this._takeMenu; if (!m) return;
        m.querySelectorAll('.rsTkPv').forEach(p => { const on = p.dataset.name === this._pvTake; p.textContent = on ? '■' : '▸'; p.style.background = on ? '#2a5a3a' : '#2a2a30'; });
    },
    openTakeMenu(i, anchor) {
        if (this._takeMenu) { this.closeTakeMenu(); return; }
        const b = this.row.boxes[i]; if (!b || !anchor) return;
        const names = D.takeNames ? D.takeNames() : [], cs = getComputedStyle(anchor), r = anchor.getBoundingClientRect();
        const below = window.innerHeight - r.bottom, above = r.top, up = below < 320 && above > below;
        const m = document.createElement('div'); m.id = 'rsTakeMenu';
        m.style.cssText = 'position:fixed;z-index:100000;left:' + Math.max(4, Math.min(r.left, window.innerWidth - 360)) + 'px;' +
            (up ? 'bottom:' + (window.innerHeight - r.top + 2) + 'px;' : 'top:' + (r.bottom + 2) + 'px;') +
            'width:23em;max-height:' + Math.max(160, Math.min(560, (up ? above : below) - 12)) + 'px;display:flex;flex-direction:column;background:#111114;color:#ddd;' +
            'border:1px solid #556;border-radius:4px;box-shadow:0 6px 24px rgba(0,0,0,.6);font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize;
        const rowOf = (name, label) => '<div class="rsTkRow' + (name === (b.take || '') ? ' cur' : '') + '" data-name="' + esc(name) + '">' +
            (name ? '<button type="button" class="rsTkPv" data-name="' + esc(name) + '" title="HEAR this take — ' + PREVIEW_S + ' s, at this box\'s dyn — without choosing it (it is loaded in the strikes drawer, as choosing does). Click again to stop" style="' + BTN + ';padding:0 .4em;flex:0 0 auto;font-size:inherit">▸</button>'
                  : '<span style="width:1.7em;flex:0 0 auto"></span>') +
            '<span class="rsTkNm">' + esc(label) + '</span></div>';
        m.innerHTML = '<style>#rsTakeMenu .rsTkRow{display:flex;align-items:center;gap:.5em;padding:.12em .5em;cursor:pointer;white-space:nowrap}' +
            '#rsTakeMenu .rsTkRow:hover,#rsTakeMenu .rsTkRow.hl{background:#20303a}#rsTakeMenu .rsTkRow.cur .rsTkNm{color:#7fc4e8;font-weight:bold}' +
            '#rsTakeMenu .rsTkNm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}</style>' +
            '<div style="display:flex;align-items:center;gap:.5em;padding:.3em .4em;border-bottom:1px solid #2c3238;flex:0 0 auto">' +
              '<input id="rsTkFilter" type="text" spellcheck="false" placeholder="filter — part of a name" style="flex:1;min-width:0;font-size:inherit;' + INP + '">' +
              '<span id="rsTkCount" style="color:#9ab;flex:0 0 auto"></span></div>' +
            '<div id="rsTkList" style="overflow-y:auto;flex:1 1 auto">' + rowOf('', '— choose — (a REST)') +
              ((b.take && names.indexOf(b.take) < 0) ? rowOf(b.take, b.take + ' (not in the list)') : '') +
              names.map(nm => rowOf(nm, nm)).join('') + '</div>';
        document.body.appendChild(m); this._takeMenu = m;
        const fil = m.querySelector('#rsTkFilter'), rows = () => Array.from(m.querySelectorAll('.rsTkRow')), shown = () => rows().filter(x => x.style.display !== 'none');
        const choose = name => { this.closeTakeMenu(); this.freeze(i, name); };
        const count = () => { m.querySelector('#rsTkCount').textContent = shown().filter(x => x.dataset.name).length + ' of ' + names.length; };
        const light = el => { rows().forEach(x => x.classList.remove('hl')); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'nearest' }); } };
        fil.addEventListener('input', () => {
            const words = fil.value.toLowerCase().split(/\s+/).filter(Boolean);   // every word must be in the name, in any order
            rows().forEach(x => { const nm = x.dataset.name.toLowerCase(); x.style.display = (!x.dataset.name && words.length) || !words.every(w => nm.indexOf(w) >= 0) ? 'none' : ''; });
            count(); light(words.length ? shown()[0] : null);
        });
        fil.addEventListener('keydown', e => {
            e.stopPropagation();   // typing here is typing: not SPACE = Hear, not the composer's own keys
            const S_ = shown(), k = S_.findIndex(x => x.classList.contains('hl'));
            if (e.key === 'Escape') { e.preventDefault(); this.closeTakeMenu(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); light(S_[Math.min(S_.length - 1, k + 1)]); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); light(S_[Math.max(0, k - 1)]); }
            else if (e.key === 'Enter') { e.preventDefault(); const el = S_[k] || (fil.value.trim() ? S_[0] : null); if (el) choose(el.dataset.name); }
        });
        m.addEventListener('click', e => {
            const pv = e.target.closest('.rsTkPv'); if (pv) { e.stopPropagation(); this.previewTake(pv.dataset.name); fil.focus(); return; }
            const row = e.target.closest('.rsTkRow'); if (row) choose(row.dataset.name);
        });
        m._out = e => { if (!m.contains(e.target) && !(e.target.closest && e.target.closest('#rsTake'))) { if (this._pvTake) this.stop(); this.closeTakeMenu(); } };
        document.addEventListener('mousedown', m._out, true);
        count(); this.paintTakeMenu();
        const cur = m.querySelector('.rsTkRow.cur'); if (cur) cur.scrollIntoView({ block: 'center' });
        fil.focus();
    },
    // the ▸ of the takes menu: the take's chord, everyone together, PREVIEW_S seconds at the SELECTED box's dyn — heard, not chosen
    async previewTake(name) {
        const was = this._pvTake; this.stop(); if (was === name || !name) return;
        let chord = null;
        try { chord = await this.dealTake(name); } catch (e) { this.setStatus('take not read: ' + (e && e.message || e), true); return; }
        if (!chord) return;
        const b = this.row.boxes[this.sel], dyn = b ? b.dyn : AS_DEALT, ms = PREVIEW_S * 1000;
        const label = 'preview · take "' + name + '" · ' + this.players(chord) + ' players · ' + fmtS(ms / 1000) + ' s · ' + (dyn === WAVES ? 'flat at the waves\' high (' + this.row.waves.high + ')' : dyn) + ' — HEARD, not chosen: click its name to put it in the box';
        if (!(await this.playChord(chord, dyn, ms, label))) return;
        this._pvTake = name; this.paintTakeMenu();
        clearTimeout(this._pvT); this._pvT = setTimeout(() => { if (this._pvTake === name) { this._pvTake = null; this.paintTakeMenu(); } }, ms + 400);
    },

    // ------------------------------------------------------------------ the recipe, and the notes derived from it
    recipe(t0) {
        const r = this.row;
        // 1d.4: a box with no chord is a REST (`chord: null`); a rolled row keeps the dials that made its durations (`roll`)
        // 1d.7: the waves' dials travel when a box reads them, or when they were moved off their defaults; a waves box keeps the straight dyn it had
        const wavesToo = r.boxes.some(b => b.dyn === WAVES) || !this.isDefaultWaves();
        // 1l.3: the MAP's breath and `attack` at every line (nothing breathes here) — and the RHYTHM row, which sequence.js ignores
        return Object.assign({ t0: +t0 || 0, change: 'attack', breath: Object.assign({}, MAP_BREATH),
            containers: r.boxes.map(b => Object.assign({ dur: +b.dur, dyn: b.dyn, take: b.take, chord: b.chord.length ? b.chord : null }, b.dyn === WAVES ? { dynWas: b.dynWas || AS_DEALT } : {},
                this.rangeOk(b.range) ? { range: this.rangeOk(b.range) } : {})),   // 1d.12: a box may read the waves through a range of its own
            rhythm: (r.rhythm || []).map(b => Object.assign({ take: b.take, start: +b.start || 0, stop: +b.stop || 0, dur: +b.dur }, b.state ? { state: b.state } : {},
                (b.touches && Object.keys(b.touches).length) ? { touches: b.touches } : {}, Array.isArray(b.assign) ? { assign: b.assign } : {})) },   // 1l.6: the touches ride in the recipe   // 1l.4: each box's rhythm take, frozen
            wavesToo ? { waves: this.wavesDefaults(r.waves) } : {},
            this.isDefaultEdges() ? {} : { edges: this.edgesDefaults(r.edges) },
            r.rolled ? { roll: JSON.parse(JSON.stringify(r.roll)) } : {});
    },
    generate(t0) {
        if (!this.row.boxes.length) { this.setStatus('the harmony row is empty — "+ harmony box" first', true); return null; }
        try { return SEQ.generate(this.recipe(t0)); }
        catch (e) { this.setStatus(String(e && e.message || e).replace(/^sequence: /, ''), true); return null; }
    },
    // `skip` leaves a flag out where the line has already said it in its own words (the breath status counts the outliers itself)
    flagsText(G, skip) { const c = {}; G.notes.forEach(n => (n.flags || []).forEach(f => { if (skip && skip.indexOf(f) >= 0) return; c[f] = (c[f] || 0) + 1; })); const k = Object.keys(c); return k.length ? ' · ' + k.map(f => c[f] + ' ' + f).join(' · ') : ''; },

    // what Hear plays: the generator's notes in the shape D.playNotes takes — from the start, or from the selected box on (a note
    // already sounding at that line is picked up there)
    hearNotes() {
        const G = this.generate(0); if (!G) return null;
        // 1d.15: from the start, from the selected box's line, or from the CURSOR — any second inside the row. A note already
        // sounding there starts AT it with what is left of it, its fader at the curve's value there (`skipS`, as `from the box`).
        const from = this.hearFrom === 'cursor' ? Math.max(0, Math.min(+this.cursor || 0, Math.max(0, G.end - G.t0 - 0.05)))
            : ((this.hearFrom === 'box' && this.sel > 0 && this.sel < G.bounds.length - 1) ? G.bounds[this.sel] : 0);
        const bends = {}; G.notes.forEach(n => { if (n.cents) bends[n.player] = 1; });
        const notes = [], ramps = [], shaped = [];
        G.notes.forEach(n => {
            if (n.end <= from + 0.02) return;
            const st = Math.max(n.start, from), onMs = Math.round((st - from) * 1000), durMs = Math.max(30, Math.round((n.end - st) * 1000));
            // 1d.7 · 1d.8: a note whose level MOVES — it read the waves, it lies under a niente fade, it is ramped to or from a dynamic — is
            // struck at ONE velocity and its CC7 follows (scheduleRamps). A strike just takes its level
            // PLAN 1e: a SHAPED note is STRUCK AT MF — the ANCHOR, which playNotes remaps into this instrument's own velocity.
            // PLAN 1d.10: and its fader runs between the CC7 values of its own two written dynamics, every breakpoint on its own.
            // PLAN 1g: EVERY sustained note is shaped — a straight one holds its table value (`isShaped`, above `shape`).
            const ramped = this.isShaped(n), sh = ramped ? this.shape(n) : null;
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
    // PLAN 1g — IN A SEQUENCE, ONE SCALE (2026-09-20, RUNNING_LOG 157 · 158). His ear: *"the attacks are very loud"* — a straight `pp`
    // box after a `pp`–`mp` waves box. His recording read back showed both sides ON the law and the law itself at fault: a STRUCK note
    // lives on 1b's 12 dB ladder (a struck `pp` is about 10 dB under fff) and a SHAPED one on 1d.10's table under an mf strike (a
    // shaped `pp` is about 28 dB under it), so the same NAME was two levels 18 dB apart and the line between the boxes was a +10 …
    // +18 dB step. HIS CALL (a): inside a sequence every SUSTAINED note is written the shaped way — struck at mf, on a curve channel,
    // the fader on the table — and a note whose level does not move simply holds its table value (`cc7Abs` lo === hi: `heldCc7`
    // answers `lo` whatever the height). A straight `pp` IS the waves' `low` by construction, and an `attack` is a full attack played
    // down (LG-14). Only a FIXED-length sound (a strike — no breath, no bow, no measured fader curve) still takes its velocity.
    // (No dyn_table.js on the page → there is no table to hold a flat note on, so only a MOVING level is shaped: 1e's rule, as it was.)
    isShaped(n) { return n.kind !== 'fixed' && (!!DT_() || !!n.waves || !!n.fade || !!n.ramp); },
    // a shaped note's fader: { cc7Abs, levels, flat } — the drawn heights that put each breakpoint on its written dynamic
    shape(n) {
        const L = this.levelsOf(n).map(p => [p[0], clamp(+p[1] || 0, 0, 1)]);
        let lo = 1, hi = 0; L.forEach(p => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
        const T = DT_(), C = C_(), bank = C ? C._velRemap : null, key = this.instKeyOf(n.lane), flat = hi - lo < 1e-9;
        if (!T) return { key: key, measured: false, flat: flat, cc7Abs: { lo: CC7_FULL.lo, hi: CC7_FULL.hi },   // no dyn_table.js on the page: 1e's law, the note's own top at full
            levels: L.map(p => [p[0], clamp(1 - (hi - p[1]), 0, 1)]) };
        return { key: key, measured: T.hasCurve(bank, key), flat: flat,
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
        // PLAN 1g: A REAL SEAT'S CHANNEL IS TAKEN. The second vibraphone sits on its lane's first curve channel (1c.3), and a marker
        // dealt that same channel put two players' faders on ONE CC7 — in his own recording both vibraphones' waved notes are on
        // ch 2 (RUNNING_LOG 158). With every sustained note shaped it would reach the straight boxes too, so the pool skips it.
        const held = {};
        ramps.forEach(w => { if (!w.seat || typeof w.seat === 'string') return; const r = D.routeFor(w.lane, w.tech, w.seat); if (r && r.ch != null) (held[w.lane] = held[w.lane] || new Set()).add(r.ch + 1); });
        Object.keys(byLane).forEach(k => {
            const lane = +k, list = byLane[k].slice().sort((a, b) => a.onMs - b.onMs), freeAt = new Map();
            list.forEach(w => {
                const pool = C.curveChannelsOf(lane, w.tech) || [];
                if (!pool.length) { onMain++; return; }
                const open = i => !(held[lane] && typeof pool[i] === 'number' && held[lane].has(pool[i]) && held[lane].size < pool.length);   // never skip the whole pool
                let pick = -1, best = Infinity;
                for (let i = 0; i < pool.length; i++) { if (!open(i)) continue; const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f <= w.onMs + 1e-9 && f < best) { best = f; pick = i; } }
                if (pick < 0) { let lo = Infinity; for (let i = 0; i < pool.length; i++) { if (!open(i)) continue; const f = freeAt.has(i) ? freeAt.get(i) : -Infinity; if (f < lo) { lo = f; pick = i; } } if (pick < 0) pick = 0; }
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
        const ms = Math.round(Math.min(PREVIEW_S, +b.dur || PREVIEW_S) * 1000);
        const label = 'preview · box ' + (i + 1) + (b.take ? ' · ' + b.take : '') + ' · ' + this.players(b.chord) + ' players · ' + fmtS(ms / 1000) + ' s · ' + (b.dyn === WAVES ? 'flat at the waves’ high (' + this.row.waves.high + ')' : b.dyn);
        if (!(await this.playChord(b.chord, b.dyn, ms, label))) return;
        this._previewing = i; this.renderRow();
        clearTimeout(this._pvT); this._pvT = setTimeout(() => { if (this._previewing === i) { this._previewing = -1; if (this.isOpen()) this.renderRow(); } }, ms + 400);
    },
    // ONE player for both previews — a box's ▸ and the takes menu's ▸: a chord, everyone together, `ms` long, at `dyn`. True when it plays
    async playChord(chord, dyn, ms, label) {
        const L = LADDER(), dynP = dyn === WAVES ? this.row.waves.high : dyn, named = dynP !== AS_DEALT && L && L.ANCHOR[dynP] != null;   // a waves box previews its chord flat at the waves' `high` — the chord is what is auditioned, not the wave
        const levelOf = n => named ? (L.ANCHOR[dynP] - L.LO) / (L.HI - L.LO) : (n.level != null ? +n.level : 0.5);
        const bends = {}; this.row.boxes.forEach(x => x.chord.forEach(n => { if (n.cents) bends[n.lane + ':' + (n.seat || 0)] = 1; }));   // as hearNotes: a player bent anywhere in the row is re-centred
        // PLAN 1g: the preview is on the SAME scale as Hear — a sustained note struck at mf, held at its table value on a curve
        // channel — or a box auditioned at `pp` would sound some 18 dB louder than the same box inside the sequence.
        const BC = root.BeatingCalc, durMs = Math.max(30, ms), notes = [], ramps = [];
        chord.forEach(n => {
            const lvl = levelOf(n), key = this.instKeyOf(n.lane), kind = (BC && BC.CEILINGS && BC.CEILINGS[key]) ? 'held' : 'fixed';   // sequence.js noteInfo's own test
            const shaped = this.isShaped({ kind: kind }), sh = shaped ? this.shape({ lane: n.lane, level: lvl, dur: durMs / 1000 }) : null;
            const rec = { lane: n.lane, tech: n.tech, midi: n.midi, seat: n.seat || 0, vel: shaped ? MF_ANCHOR : anchorOf(lvl), onMs: 0, durMs: durMs,
                cents: n.cents ? n.cents : (bends[n.lane + ':' + (n.seat || 0)] ? RECENTRE : 0), partial: n.partial };
            notes.push(rec);
            if (shaped) ramps.push({ lane: n.lane, tech: n.tech, seat: n.seat || 0, midi: n.midi, onMs: 0, durMs: durMs, skipS: 0, noteStart: 0,
                levels: sh.levels, velRef: yOf(this.mfLevel()), cc7Abs: sh.cc7Abs, fade: null, note: rec });
        });
        this.curveSeats(ramps);
        await D.playNotes(notes, label);
        const e = E_();
        if (e && e._playing) { this.scheduleRamps({ ramps: ramps }); this.setStatus(label); return true; }
        const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); return false;
    },
    // 1l.3's audition of the MAP (held chords) — `map ▸` in the head; Hear (above) is the rhythm sequence since 1l.5
    async hearMap() {
        if (this._previewing >= 0) this.stop();
        const H = this.hearNotes(); if (!H) return;
        if (!H.notes.length) { this.setStatus('nothing to hear', true); return; }
        const label = 'the harmony map · ' + this.row.boxes.length + ' box' + (this.row.boxes.length > 1 ? 'es' : '') + ' · ' + fmtS(H.G.total - H.from) + ' s' + (H.from ? ' from box ' + (this.sel + 1) : '');
        await D.playNotes(H.notes, label);
        const e = E_();
        if (e && e._playing) { const cc = this.scheduleRamps(H); this.setStatus('hearing ' + label + ' · ' + H.notes.length + ' notes' + (H.ramps.length ? ' · ' + H.ramps.length + ' shaped, struck at mf on the curve channels (' + cc + ' fader moves)' + this.rangeText(H.shaped) + this.tableNote(H.shaped) : '') + (H.onMain ? ' · ' + H.onMain + ' had no curve channel — on MAIN, so their fader will not move' : '') + this.flagsText(H.G)); this.startLine(H); }
        else { const s = D.el && D.el.querySelector('#skStatus'); this.setStatus((s && s.textContent) || 'could not play', true); }
    },
    stop() {
        const e = E_(); if (e && e._playing) { e.panic(); if (D.onStopped) D.onStopped(); } this.stopLine();
        if (this._previewing >= 0) { this._previewing = -1; clearTimeout(this._pvT); if (this.el && this.isOpen()) this.renderRow(); }
        if (this._pvTake) { this._pvTake = null; clearTimeout(this._pvT); this.paintTakeMenu(); }
    },
    // ------------------------------------------------------------------ THE CLOCK AND THE CURSOR (1d.15)
    // Hear used to start at the beginning or at a box's LEFT EDGE, and a rolled row can run for minutes. The cursor is any
    // second of the sequence; the clock says where the ear has got to. Insert is untouched — this is for the ear, not the score.
    mss(s) { const v = Math.max(0, +s || 0), m = Math.floor(v / 60), r = v - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); },
    // where a click along the strip falls, in seconds from the sequence's start — read off the BOXES, which carry the layout
    // 1l.3: the two rows share ONE scale (this.pps pixels a second), so a time is a place and a place a time — on either row
    timeAtX(x) { const pps = this.pps || this.ppsNow(); return this.row.boxes.length ? clamp(x / pps, 0, this.seqTotal()) : null; },
    xAtTime(t) { const pps = this.pps || this.ppsNow(); return this.row.boxes.length ? clamp(t, 0, this.seqTotal()) * pps : null; },
    clickTime(ev) {
        const row = this.el.querySelector('#rsRows'); if (!row || !this.row.boxes.length) return;
        const x = ev.clientX - row.getBoundingClientRect().left;
        const t = this.timeAtX(x); if (t == null) return;
        if (this.cursor != null && Math.abs(this.cursor - t) < 0.15) {   // a click where it already is takes it away
            this.cursor = null; this.hearFrom = 'start'; this.save(); this.render();
            this.setStatus('the cursor is cleared — SPACE plays from the start'); return;
        }
        this.cursor = Math.round(t * 100) / 100; this.hearFrom = 'cursor';
        this.save(); this.render();
        const w = this.cursorWhere();
        this.setStatus('cursor at ' + this.mss(this.cursor) + (w ? ' · box ' + w.box + ', ' + fmtS(w.into) + ' s into it' : '') + ' — SPACE plays from there');
    },
    cursorWhere() {
        if (this.cursor == null) return null;
        let acc = 0;
        for (let i = 0; i < this.row.boxes.length; i++) {
            const dur = +this.row.boxes[i].dur || 0;
            if (this.cursor <= acc + dur || i === this.row.boxes.length - 1) return { box: i + 1, into: Math.max(0, this.cursor - acc) };
            acc += dur;
        }
        return null;
    },
    paintCursor() {
        const strip = this.el && this.el.querySelector('#rsTime'); if (!strip) return;
        const sel = this.el.querySelector('#rsFrom'); if (sel && document.activeElement !== sel) sel.value = this.hearFrom;
        strip.innerHTML = '';
        const off = this.el.querySelector("#rsCursorLine"); if (off) off.style.display = "none";
        if (this.cursor == null || !this.row.boxes.length) return;
        const x = this.xAtTime(this.cursor); if (x == null) return;
        const w = this.cursorWhere();
        const mark = document.createElement('div');
        mark.style.cssText = 'position:absolute;top:0;bottom:-4px;left:' + x + 'px;width:2px;background:#e8a06a;pointer-events:none';
        const tag = document.createElement('div');
        tag.textContent = this.mss(this.cursor) + (w ? '  box ' + w.box + ' +' + fmtS(w.into) : '');
        tag.style.cssText = 'position:absolute;top:0;left:' + (x + 4) + 'px;color:#e8a06a;font-size:.85em;white-space:nowrap;pointer-events:none';
        strip.appendChild(mark); strip.appendChild(tag);
        // and the line down the boxes, so the ear and the eye agree
        const line = this.el.querySelector('#rsCursorLine');
        if (line) { line.style.left = x + 'px'; line.style.display = 'block'; }
    },
    // elapsed / total while Hear plays; `t` null leaves it at where it stopped (his: it stops where Hear stops)
    paintClock(t) {
        const c = this.el && this.el.querySelector('#rsClock'); if (!c) return;
        if (t == null) { if (!this._clockAt) { c.textContent = ''; } return; }
        this._clockAt = t;
        c.textContent = this.mss(t) + ' / ' + this.mss(this.seqTotal());
    },
    startLine(H) {
        this.stopLine();
        const tick = () => {
            const e = E_(), line = this.el && this.el.querySelector('#rsLine');
            if (!e || !e._playing || !line || !this.isOpen()) { this.stopLine(); return; }
            const t = H.from + (performance.now() - D.base) / 1000, B = H.G.bounds;
            if (t >= H.G.end) { this.stopLine(); return; }
            if (t >= 0) { line.style.left = (clamp(t - B[0], 0, this.total()) * (this.pps || this.ppsNow())) + 'px'; line.style.display = 'block'; }   // 1l.3: the shared scale
            this.paintClock(t - B[0]);   // 1d.15: the clock runs with the line
            this._raf = requestAnimationFrame(tick);
        };
        this._raf = requestAnimationFrame(tick);
    },
    stopLine() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; const line = this.el && this.el.querySelector('#rsLine'); if (line) line.style.display = 'none'; if (this.dView && this.dView.cursor != null) this.dView.setCursor(null); },

    // ------------------------------------------------------------------ 1l.5 — INSERT: the RHYTHM, every dot reading the harmony beneath, as ONE group
    // As the sequence drawer inserts (1d.3's round trip kept whole): a sequence already IN the score is replaced IN PLACE from where its META
    // bar sits now; `move to playhead` is the one way it moves; the recipe (both rows, every rhythm box's take frozen) goes into the score
    // file as databases.rhythmSequences. THE HARMONY IS NEVER INSERTED — it is the map. Each dot becomes, for each of its players, the
    // strikes drawer's kind of STRUCK note (docs/DYNAMICS_LAW.md §1): `recVel` = the anchor of the INTENDED WRITTEN LEVEL (the ground
    // truth, LG-60 — what goes to notation), `velAbs` = the velocity Hear sends (that level remapped for the instrument and the pitch, times
    // a niente fade's weight) — the score sends `velAbs` as it stands, so the score and Hear agree note for note. A plain note holds MAIN; a
    // just note (cents) is drawn — `morphBend` — on a curve channel, its fader held at 127 (`cc7Abs`), as Hear routes it. Every note
    // carries `rseqDot` = box:line:dot — its place in the recipe, for 1l.6's touches.
    insert(toPlayhead) {
        const C = C_(); if (!C || typeof C.getTimeAtPlayhead !== 'function') { this.setStatus('the composer is not reachable', true); return; }
        const id = this.row.id, group = 'grp-rseq-' + id, ML = METAL(), name = this.row.name || ('rhythm sequence ' + id);
        const sits = this.placedAt(id), inPlace = sits != null && !toPlayhead;
        const t0 = inPlace ? sits : +C.getTimeAtPlayhead().toFixed(3);
        const X = this.dotsOf(this.recipe(t0)); if (!X) return;
        if (!X.notes.length) { this.setStatus('nothing to insert — ' + (X.dots.length ? X.hollow + ' dots have no note beneath them' : 'the rhythm row has no excerpt yet (the workshop fills it)'), true); return; }
        const saved = this.entryOf(id), oldNotes = C.objects.filter(o => o.groupId === group && o.sonifyNote != null);
        const he = (saved && sits != null && oldNotes.length) ? this.handEdits(saved, sits, oldNotes) : null;
        C.pushUndoState();
        const before = C.objects.length;
        C.objects = C.objects.filter(o => o.groupId !== group);   // one row = one place in the score: the old group's objects go, by their id
        const gone = before - C.objects.length;
        let maxEnd = t0, written = 0; const busy = [];
        X.notes.forEach(n => {
            if (typeof C.trillCovers === 'function' && C.trillCovers(n.lane, n.start)) { busy.push(shortOf(n.lane) + '@' + n.start.toFixed(2)); return; }   // TRILLS_TOOL §7, as D.insert
            maxEnd = Math.max(maxEnd, n.end);
            const y = yOf(n.level), cents = +n.cents || 0, box = this.row.rhythm[n.box] || {};
            C.objects.push(Object.assign({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: group,
                startSeconds: n.start, endSeconds: n.end,
                nodes: [{ pos: 0, y: y, smooth: 0.25 }, { pos: 1, y: y, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
                color: COLOR, fillMode: 'bottom', opacity: 0.55, properties: {}, srcKind: 'rhythmSequence',
                performanceNotes: name + ' · rhythm box ' + (n.box + 1) + (box.take ? ' · ' + box.take : '') + ' · L' + (n.line + 1) + ' dot ' + (n.i + 1) + ' · ' + n.dyn +
                    (n.weight < 0.999 ? ' · faded ×' + n.weight.toFixed(2) : '') + (n.fallback ? ' · claves (no percussion note beneath)' : '') +
                    (n.partial != null ? ' · partial ' + n.partial : '') + (cents ? ' · ' + (cents > 0 ? '+' : '') + Math.round(cents) + '¢ just' : ''),
                sonifyNote: n.midi, technique: n.tech, recVel: n.anchor, velAbs: n.velAbs, rseqDot: n.box + ':' + n.line + ':' + n.i },
                cents ? { morphBend: [[0, +cents.toFixed(2)], [+(n.end - n.start).toFixed(3), +cents.toFixed(2)]], cc7Abs: { lo: 127, hi: 127 } } : { sonifyMode: 'plain' }));
            written++;
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: group, startSeconds: t0, endSeconds: +Math.max(maxEnd, t0 + 0.1).toFixed(3),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: COLOR, fillMode: 'bottom', opacity: 0.6, srcKind: 'rhythmSequence',
            performanceNotes: name + ' · ' + this.row.rhythm.length + ' rhythm boxes over ' + this.row.boxes.length + ' harmony boxes — a RHYTHM SEQUENCE: change it in the Rhythm panel and Insert again', properties: {} });
        if (!C.databases) C.databases = {};
        if (!Array.isArray(C.databases.rhythmSequences)) C.databases.rhythmSequences = [];
        const entry = { id: id, name: name, group: group, inserted: new Date().toISOString(), notes: written, recipe: JSON.parse(JSON.stringify(this.recipe(t0))) };
        const k = C.databases.rhythmSequences.findIndex(x => x && x.id === id);
        if (k >= 0) C.databases.rhythmSequences[k] = entry; else C.databases.rhythmSequences.push(entry);
        C.lastInsertGroup = group;
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        if (C.curveDirty) C.curveDirty();   // docs/DYNAMICS_LAW.md §4: a just note is a curve event, and the map is cached
        C.renderAll(); C.markDirty();
        this._listSig = ''; this.renderList(); this.paintInsert();
        const how = inPlace ? 're-inserted IN PLACE' : (sits != null ? 'MOVED to the playhead' : 'inserted');
        this.setStatus(how + ' · ' + written + ' notes from ' + X.dots.length + ' dots · ' + t0.toFixed(3) + ' → ' + maxEnd.toFixed(3) + ' s as ' + group + ' · the recipe is in the score file' +
            (X.hollow ? ' · ' + X.hollow + ' dot' + (X.hollow === 1 ? '' : 's') + ' HOLLOW — nothing beneath, not written' : '') +
            (gone ? ' · replaced ' + gone + ' objects' + (sits != null && !inPlace ? ' at ' + sits.toFixed(3) + ' s' : '') : '') +
            (he && he.edited ? ' · ' + he.edited + ' note' + (he.edited === 1 ? '' : 's') + ' had been moved or re-pitched by hand — overwritten: the recipe is the truth' : '') +
            (he && he.missing > he.edited ? ' · ' + (he.missing - he.edited) + ' of its notes had been deleted — written again' : '') +
            (busy.length ? ' · ' + busy.length + ' skipped — trilling: ' + busy.join(' ') : ''));
    },
    // 1d.3's count, for the rhythm: how many of the old group's notes are not where the SAVED recipe puts them — and how many it expects that are gone
    handEdits(entry, start, oldNotes) {
        try {
            const X = this.dotsOf(Object.assign({}, entry.recipe, { t0: start }), true);
            const want = X.notes.map(n => ({ lane: n.lane, midi: n.midi, s: n.start, e: n.end, used: false }));
            let edited = 0;
            oldNotes.forEach(o => {
                const w = want.find(x => !x.used && x.lane === o.layer && x.midi === o.sonifyNote && Math.abs(x.s - (+o.startSeconds)) < 0.01 && Math.abs(x.e - (+o.endSeconds)) < 0.01);
                if (w) w.used = true; else edited++;
            });
            return { edited: edited, missing: want.filter(x => !x.used).length };
        } catch (e) { return null; }
    },
};

// 1l.3: the drawer's curve-channel hook on D.routeFor (sequence_ui.js, PLAN 1e V2b) is ALREADY installed and resolves this panel's marker
// seats too — a second wrap would only stack the same work. SequenceDrawer must therefore load first (composer.html orders it so).

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

root.RhythmSequence = S;
}(typeof self !== 'undefined' ? self : this));
