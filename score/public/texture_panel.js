// texture_panel.js — PLAN 2x §3.2, the Texture panel.
//
// THE PANEL GENERATES, AUDITIONS AND INSERTS. IT NEVER EDITS. (R10)
// No selection, no drag, no per-note anything. That boundary is a design rule,
// not a preference: the cluster sandbox's piano-roll editor cost ~80% of that
// build, and a liked texture is RE-GENERATED from its parameters rather than
// cut and patched. New interaction wishes go to NITS, not in here.
//
// It injects its own button and DOM, so composer.html only has to load two
// scripts — the diff in a file two agents share stays at two lines.
//
// PREVIEW STATE NEVER TOUCHES THE SCORE. Autosave writes the loaded score every
// 5 s, so a preview living in Composer.objects would be a data-loss bug (see the
// autosave-overwrites-loaded-score history). The render lives in a local var
// until the composer presses Insert.
//
// D29: ATTACK FIELDS ONLY — this panel never sends a pitch bend. Bend-based work
// is the Morph panel's (2v). The two layer freely in the score.

(function (root) {
'use strict';

// `const Composer = {...}` in composer.html is a LEXICAL global: visible to every
// classic script by bare identifier, but NOT a property of window. Reaching for
// it as `root.Composer` silently yields undefined, which makes every MIDI route
// resolve to null and produces a "nothing sounded" that has nothing to do with
// MIDI. Always go through here. (Trap documented in morph_emit.js's header.)
function HOST() { return (typeof Composer !== 'undefined') ? Composer : null; }

const TX = root.Texture, E = root.MorphEmit;
if (!TX || !E) { console.warn('[texture_panel] needs texture_engine.js + morph_emit.js'); return; }

// ---------------------------------------------------------------------------------------------------------------------------
// LGMF PLAN 1l.1 (2026-09-21) — TEXTURE PLAYS THIS ENSEMBLE (docs/PLAN.md § 1l.1; RUNNING_LOG §199; COMPOSITION_NOTES LG-59).
// The panel was the tubas': ten players on one instrument, five articulations, plain velocities straight to the rack, pitch
// from presets inside the tubas' staccato window. Here:
//   · SEVEN PLAYERS in score order — the percussionist and the vibraphone are ONE player, so the vibraphone's lane is skipped.
//     The engine renders seven player SLOTS; `P7()` maps a slot to its score lane. A model asking for more is fitted in proportion.
//   · each player's ARTICULATION from their own roster, his defaults (ART_DEFAULT), reaching the engine per player through its
//     one opt-in, `laneVoice`, so the ring, the clamp and the badge are computed on what will sound.
//   · the PITCH from a harmony TAKE, the sequence drawer's takes menu: each player reads their own note(s) AS ASSIGNED, cents
//     kept; a player given none is SILENT and named; the percussion plays what the take gives it, else the claves, pair 2 high.
//   · every attack through the STRIKES DRAWER'S player (`StrikeDrawer.playNotes`) — a STRUCK note under docs/DYNAMICS_LAW.md:
//     `level 0…10` is now a WRITTEN DYNAMIC, ppp … fff, whose ladder anchor 1b's bank remaps per instrument and pitch.
//   · Insert writes the strikes drawer's kind of note on the right lanes, the META shape on this piece's META lane.
// LIVE streams outside that one player on the tubas' pitch presets, so it is hidden (NITS). Nothing of the tubas' own path is
// deleted: the engine is unchanged without its opt-in, and the research slate still loads.
const DYN = () => root.StrikeDyn || { NAMES: ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'], LO: 65, HI: 127 };
const SD = () => (typeof StrikeDrawer !== 'undefined' ? StrikeDrawer : (root.StrikeDrawer || null));
const SQ = () => root.SequenceDrawer || null;
const TRK = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const INSTS = () => (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : (root.INSTRUMENTS || {}));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : (root.META_LAYER != null ? root.META_LAYER : 8));
// his defaults (LG-59): the english horn Staccato Velocity · bassoon, horn, trumpet staccato · the strings Spiccato Velocity
const ART_DEFAULT = { english_horn: 'stac_vel', bassoon: 'staccato', horn: 'staccato', trumpet: 'staccato', cello: 'spicc_vel', double_bass: 'spicc_vel' };
// the percussion's fallback when a take gives the Percussion player nothing: claves, pair 2 high (sandbox/instruments.js, 1l.1)
const CLAVES = { tech: 'toys_claves', midi: 41, name: 'claves · pair 2 high' };
const PERC = 'percussion', VIB = 'bowed_vibraphone';
const STORE = 'septet.texture.lgmf.v1';        // the chosen take and the articulations — this browser's convenience only
const RHYTHM_PANEL = 'rhythm';                 // 1l.2: the bucket in bank/rhythm_takes.json (the `rhythms` store)
const RHYTHM_NAME = /^[A-Za-z0-9._ -]{1,64}$/; // the server's name rule (score/snapshots.js), checked here first
const MAX_LINES = 10;                          // 1l.2: the engine's own limit (its humanize stage and D17 are ten lanes wide)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nn = m => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const escH = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// the seven players: every score lane but the vibraphone's, in score order — { slot, lane, instKey, short, label }
let _p7 = null;
const P7 = () => {
    const T = TRK();
    if (_p7 && _p7.base === T) return _p7.list;
    const list = [];
    T.forEach((t, lane) => { if (t.instKey !== VIB) list.push({ slot: list.length, lane, instKey: t.instKey, short: t.short, label: t.label }); });
    _p7 = { base: T, list };
    return list;
};
// a written dynamic ⇄ the engine's level: each name IS a level (ppp = 0 … fff = 10), so a note's anchor, LO + (HI − LO) · level / 10,
// is exactly the ladder's anchor at every name — and a morph between two models still moves the level between them
const levelOfName = name => { const N = DYN().NAMES, i = N.indexOf(name); return i < 0 ? null : +(i * 10 / (N.length - 1)).toFixed(4); };
const nameOfLevel = lv => { const N = DYN().NAMES; return N[Math.max(0, Math.min(N.length - 1, Math.round((+lv || 0) * (N.length - 1) / 10)))]; };
const anchorOfLevel = lv => { const L = DYN(); return Math.round(L.LO + (L.HI - L.LO) * Math.max(0, Math.min(10, +lv || 0)) / 10); };

const PANEL = {
    el: null, rev: -1, params: null, models: null,
    active: 'A', result: null, spec: null, poll: null,
    pinned: null, abSide: 'cur', humanized: false, timing: null,
    // 1l.1: the harmony take (dealt once, frozen: { name, chord, at }), each player's articulation by instKey, the takes menu
    take: null, arts: {}, _takeMenu: null, _pvTake: null, _fitNote: '',
    // 1l.2: WHO PLAYS EACH LINE — per line, the player slots that play it (null = the default, line k → player k); the lines view;
    // the rhythm takes (bank/rhythm_takes.json) and the one in hand; the cursor
    assign: null, linesOpen: true, view: null, rhythmName: '', rhythms: {}, _curT: null, _lines: null,
    // LIVE mode (PLAN 2ag): a streaming scheduler the composer drives in real
    // time. `data` mirrors the params file's `live` block; box edits are
    // ephemeral until the AI writes them back into the file.
    lv: { playing: false, tick: null, runT: null, slot: 0, step: 0,
          data: null, skipped: 0, state: null, logT0: null, log: [] },

    // ---------------------------------------------------------------- boot
    init() {
        // anchor after the Morph button if it exists, else after Insertion —
        // both are stable ids, and neither is a line number (plan §15.8)
        const host = document.getElementById('morphBtn') || document.getElementById('blastsBtn');
        if (!host) { console.warn('[texture_panel] no button to anchor to'); return; }
        const btn = document.createElement('button');
        btn.id = 'textureBtn';
        btn.textContent = 'Texture';
        btn.title = 'attack-field textures: summon a category, hear it, step seeds, A/B, insert (never edits)';
        btn.addEventListener('click', () => this.toggle());
        host.parentNode.insertBefore(btn, host.nextSibling);
        this.restore();
        this.build();
        this.startPolling();
    },

    // 1l.1: the chosen take and the articulations survive a reload in THIS browser (a convenience, never the record)
    restore() {
        try {
            const s = JSON.parse(localStorage.getItem(STORE) || 'null');
            if (s && s.arts && typeof s.arts === 'object') this.arts = s.arts;
            if (s && s.take && s.take.name && Array.isArray(s.take.chord)) this.take = s.take;
            if (s && Array.isArray(s.assign)) this.assign = s.assign;                 // 1l.2
            if (s && typeof s.linesOpen === 'boolean') this.linesOpen = s.linesOpen;
            if (s && typeof s.rhythmName === 'string') this.rhythmName = s.rhythmName;
        } catch (e) {}
    },
    persist() {
        try { localStorage.setItem(STORE, JSON.stringify({ arts: this.arts, take: this.take, assign: this.assign, linesOpen: this.linesOpen, rhythmName: this.rhythmName })); } catch (e) {}
    },

    build() {
        const d = document.createElement('div');
        d.id = 'texturePanel';
        d.style.cssText = [
            'position:fixed', 'right:16px', 'top:96px', 'width:360px', 'z-index:9000',
            'background:rgba(28,28,32,0.97)', 'border:1px solid #3F7D5A', 'border-radius:6px',
            'padding:10px 12px', 'color:#ddd', 'font:11px/1.45 system-ui,sans-serif',
            'box-shadow:0 6px 24px rgba(0,0,0,0.5)', 'display:none',
            // The panel is FIXED, so the page scrollbar can never reach its
            // bottom — since the LIVE section it can outgrow the viewport, so
            // it scrolls as a whole (the dials keep their own inner scroll).
            'max-height:calc(100vh - 112px)', 'overflow-y:auto',
        ].join(';');
        d.innerHTML = [
            // sticky, so the drag handle stays grabbable while the panel scrolls
            '<div id="texDrag" style="cursor:move;font-weight:600;color:#8fd6ab;',
            'margin:-10px -12px 8px;padding:7px 12px;border-bottom:1px solid #444;',
            'position:sticky;top:-10px;z-index:1;',
            'background:rgb(35,47,44)">TEXTURE',   // the old green tint, opaque (sticky must not show through)
            '<span id="texClose" style="float:right;cursor:pointer;color:#888">&#10005;</span></div>',
            '<div id="texStatus" style="color:#9a9;margin-bottom:7px">idle</div>',
            // 1l.1 — THE HARMONY TAKE (the sequence drawer's takes menu) and THE SEVEN PLAYERS: each one's articulation and note(s)
            '<div style="display:flex;gap:5px;align-items:center;margin-bottom:5px"><span style="color:#9a9">take</span>',
            '<button id="texTake" style="flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"',
            ' title="the harmony: each player plays their own note(s) of this take, as assigned — the list has a ▸ beside every take to HEAR this texture on it without choosing it">',
            '— choose a harmony take — ▾</button></div>',
            '<div id="texPlayers" style="margin-bottom:8px"></div>',
            // 1l.2 — THE LINES, drawn in time, with WHO PLAYS each at the left (the dot view, dot_view.js)
            '<div style="display:flex;gap:6px;align-items:center;color:#8fd6ab;border-top:1px solid #3a3a44;padding-top:5px;margin-bottom:4px">',
            '<button id="texLinesTog" style="font-size:10px;padding:0 5px">lines ▾</button>',
            '<span id="texLinesInfo" style="flex:1;color:#9a9;font-weight:400"></span>',
            '<button id="texAssignReset" style="font-size:10px;padding:0 5px" title="who plays: back to Texture\'s own order — top line to the first player, and so on">default</button>',
            '</div>',
            '<div id="texLines" style="margin-bottom:8px"></div>',
            // 1l.2 — RHYTHM TAKES: the recipe (the dials, the seed, who plays, the articulations) saved by name; recall from the list
            '<div style="display:flex;gap:5px;align-items:center;margin-bottom:8px">',
            '<span style="color:#9a9">rhythm take</span>',
            '<input id="texRtName" type="text" spellcheck="false" placeholder="name" style="width:120px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 4px">',
            '<button id="texRtSave" title="save the pattern as a RHYTHM TAKE — the dials, the seed, who plays, the articulations (bank/rhythm_takes.json)">save</button>',
            '<select id="texRtSel" style="flex:1;min-width:0;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px"><option value="">recall…</option></select>',
            '<button id="texRtDel" title="delete the rhythm take named in the box">×</button>',
            '</div>',
            '<div id="texTabs" style="margin-bottom:6px"></div>',
            '<div id="texModels" style="margin-bottom:8px"></div>',
            '<div id="texFields" style="max-height:250px;overflow:auto;margin-bottom:8px"></div>',
            '<div id="texFlags" style="max-height:110px;overflow:auto;margin-bottom:8px"></div>',
            // FIXED COLUMNS, not flex. The Play button's label changes while it
            // runs; in a flex row that reflows everything to the right, and the
            // composer reached for Stop and hit Insert instead (2v, 2026-08-16).
            // A transport control must never move under the pointer.
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">',
            '<button id="texGen">Generate</button>',
            '<button id="texPlay" style="overflow:hidden;white-space:nowrap">Play</button>',
            '<button id="texStop">Stop</button>',
            '</div>',
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">',
            '<button id="texPin" title="pin this render as the reference for A/B">Pin</button>',
            '<button id="texAB" title="flip playback between pinned and current, back-to-back">A/B</button>',
            '<button id="texHum" title="re-render with stage + human timing error and A/B it against the clean one">Humanize</button>',
            '</div>',
            // MORPH (§7): a category morph is a dial morph between two models.
            // The panel exposes only the two-point case; the engine speaks full
            // breakpoint lists, so batteries and pockets get the general form.
            '<div style="display:flex;gap:5px;align-items:center;margin-top:6px">',
            '<span style="color:#9a9">morph</span>',
            '<select id="texMorphTo" style="flex:1;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px"></select>',
            '<span style="color:#9a9">over</span>',
            '<input id="texMorphSec" type="number" value="30" step="5" style="width:48px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 4px">',
            '<span style="color:#9a9">s</span>',
            '<button id="texMorphGo" title="morph the current dials into the chosen model over N seconds">go</button>',
            '</div>',
            // LIVE (PLAN 2ag) — walk six (bpm, players) steps in real time.
            // The character is TWO NUMBERS, not a mode: jitter>0 = rain,
            // Δbpm>0 = gallop (two half-groups at bpm∓Δ/2), both 0 = smear
            // (ticks emerges at slow bpm). Groove stays out — per-player fixed
            // offsets are a later add. Steps are read from the DOM every tick,
            // so edits and arrow presses land on the NEXT attack — no restart.
            // LGMF 1l.1: HIDDEN — LIVE streams outside the strikes drawer's player on the tubas' pitch presets (docs/NITS.md)
            '<div id="texLive" style="display:none">',
            '<div style="color:#8fd6ab;border-top:1px solid #3a3a44;margin-top:8px;padding-top:6px;font-weight:600">LIVE',
            '<span id="texLvSlots" style="font-weight:400;margin-left:6px"></span></div>',
            // steps are ROWS (built per-sequence in lvDraw — the count follows
            // the file, so a first-pass ladder can carry 12+ steps and a dialed
            // one 6). Columns: # · bpm · players · offset.
            '<div id="texLvGrid" style="margin-top:5px"></div>',
            '<div style="display:flex;gap:5px;align-items:center;margin-top:5px;color:#9a9">',
            'jitter<input id="texLvJit" type="number" step="5" min="0" value="0" title="ms; 45 = rain" style="width:44px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px">',
            '&Delta;bpm<input id="texLvDb" type="number" step="1" min="0" value="0" title="2 = gallop: two half-groups at bpm&#8723;&Delta;/2" style="width:40px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px">',
            '<button id="texLvGo" style="flex:1" title="stream continuously; &larr;/&rarr; walk the steps live">Live</button>',
            '<button id="texLvRun" title="auto-advance one step every N seconds (wraps)">Run</button>',
            '<input id="texLvSecs" type="number" step="1" min="1" value="6" style="width:34px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px">s',
            '</div>',
            // PITCH (live). Presets only, all inside the staccato sounding
            // window MIDI 30-65 (notes outside it are SILENT - the known trap).
            // Lane j gets pitches[j], ascending across the stage line.
            '<div style="display:flex;gap:5px;align-items:center;margin-top:4px;color:#9a9">pitch',
            '<select id="texLvPitch" style="flex:1;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px">',
            '<option value="unison">unison (root)</option>',
            '<option value="octaves">octaves (root pc)</option>',
            '<option value="fifths">fifths stack</option>',
            '<option value="clusterFA">cluster F&ndash;A, octave spread</option>',
            // VERT01 species, ORIGINAL played voicings (bank/VERT01-NN.json),
            // no octave doublings. sp08/27/30's top 66 is CUIVRE in the blasts
            // and cannot sound in staccato (30-65) - dropped from the preset.
            '<option value="sp01">species 1 (8 notes)</option>',
            '<option value="sp08">species 8 (4, top 66 dropped)</option>',
            '<option value="sp27">species 27 (4, top 66 dropped)</option>',
            '<option value="sp30">species 30 (7, top 66 dropped)</option>',
            '<option value="sp33">species 33 (6 notes)</option>',
            '</select>',
            // ORDER — kills the arpeggio-cycling of the ascending lane map.
            // shuffled: one scramble, each player keeps one note (re-pick the
            // option to re-deal it). redeal: new scramble every cycle/pass.
            // random: fresh draw per attack (audition texture; a live part
            // would redistribute the leaps).
            'order<select id="texLvOrder" style="width:86px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px">',
            '<option value="ascending">ascending</option>',
            '<option value="shuffled">shuffled</option>',
            '<option value="redeal">re-deal</option>',
            '<option value="random">random</option>',
            '</select></div>',
            '<div id="texLvOut" style="color:#9a9;margin-top:3px">&mdash;</div>',
            // STOPWATCH LOG — every step change while live gets a timestamped
            // line. `0` restarts the clock (the composer plays a while, THEN
            // starts timing); Copy puts the log on the clipboard as plain text
            // the AI can render back as a fixed texture with those durations.
            '<div style="display:flex;gap:5px;align-items:center;margin-top:4px">',
            '<button id="texLvZero" title="restart the stopwatch at 0.0 and clear the log (key: 0)">0</button>',
            '<button id="texLvCopy" title="copy the log as plain text">Copy log</button>',
            '<span style="color:#666">step changes are logged while LIVE</span>',
            '</div>',
            '<div id="texLvLog" style="display:none;max-height:90px;overflow:auto;margin-top:3px;',
            'font-family:Consolas,monospace;font-size:10px;color:#9a9;background:#1b1b20;',
            'border:1px solid #333;border-radius:3px;padding:3px 6px;white-space:pre"></div>',
            '</div>',   // #texLive
            '<div style="margin-top:6px">',
            '<button id="texIns" style="width:100%"',
            ' title="insert at the playhead as a draggable group">Insert @ cursor</button>',
            '</div>',
            '<div style="color:#666;margin-top:7px">SPACE play/stop &middot; &larr;/&rarr; variant',
            ' &middot; &uarr;/&darr; seed &middot; P pin &middot; A flip &middot; H humanize &middot; G generate',
            ' &mdash; only while this panel has focus</div>',
            '<div id="texHelp" style="color:#666;margin-top:4px"></div>',
        ].join('');
        document.body.appendChild(d);
        this.el = d;

        d.querySelector('#texClose').addEventListener('click', () => this.toggle(false));
        d.querySelector('#texGen').addEventListener('click', () => this.generate());
        d.querySelector('#texPlay').addEventListener('click', () => this.play());
        d.querySelector('#texStop').addEventListener('click', () => E.panic());
        d.querySelector('#texPin').addEventListener('click', () => this.pin());
        d.querySelector('#texAB').addEventListener('click', () => this.flip());
        d.querySelector('#texHum').addEventListener('click', () => this.humanize());
        d.querySelector('#texIns').addEventListener('click', () => this.insert());
        // 1l.1: the takes menu, and a player's articulation (delegated — the strip is redrawn with every render)
        d.querySelector('#texTake').addEventListener('click', e => { e.preventDefault(); this.openTakeMenu(e.currentTarget); });
        d.querySelector('#texPlayers').addEventListener('change', e => {
            const s = e.target.closest('select[data-inst]'); if (!s) return;
            this.arts[s.dataset.inst] = s.value; this.persist();
            this.humanized = false;
            if (this.spec) this.renderSpec(this.spec);
        });
        // 1l.2: the lines view — who plays is ticked in its grid; a click on its timeline plays from there
        if (root.DotView) {
            this.view = root.DotView.create(d.querySelector('#texLines'));
            this.view.onToggle = (line, slot, on) => this.toggleAssign(line, slot, on);
            this.view.onSeek = t => this.play(null, t);
        }
        d.querySelector('#texLinesTog').addEventListener('click', () => { this.linesOpen = !this.linesOpen; this.persist(); this.applyWidth(); this.drawLines(); });
        d.querySelector('#texAssignReset').addEventListener('click', () => { this.assign = null; this.persist(); this.humanized = false; if (this.spec) this.renderSpec(this.spec); });
        // 1l.2: rhythm takes
        d.querySelector('#texRtSave').addEventListener('click', () => this.saveRhythm(d.querySelector('#texRtName').value.trim()));
        d.querySelector('#texRtSel').addEventListener('change', e => { const n = e.target.value; e.target.value = ''; if (n) this.recallRhythm(n); });
        d.querySelector('#texRtDel').addEventListener('click', () => this.deleteRhythm(d.querySelector('#texRtName').value.trim()));
        d.querySelector('#texRtName').value = this.rhythmName || '';
        this.applyWidth();
        d.querySelector('#texMorphGo').addEventListener('click', () => this.morphTo());
        d.querySelector('#texLvGo').addEventListener('click', () => this.lvPlay());
        d.querySelector('#texLvRun').addEventListener('click', () => this.lvRun());
        d.querySelector('#texLvZero').addEventListener('click', () => this.lvZero());
        d.querySelector('#texLvCopy').addEventListener('click', () => this.lvCopy());
        // the scheduler reads the DOM each tick, so inputs only need the readout.
        // The grid is rebuilt per sequence, so its listener is DELEGATED.
        d.querySelector('#texLvGrid').addEventListener('input', () => this.lvReadout());
        d.querySelectorAll('#texLvJit,#texLvDb').forEach(i =>
            i.addEventListener('input', () => this.lvReadout()));
        d.querySelector('#texLvPitch').addEventListener('change', () => this.lvReadout());
        d.querySelector('#texLvOrder').addEventListener('change', () => {
            if (this.lv.state) this.lv.state.perm = null;   // re-picking shuffled deals fresh
            this.lvReadout();
        });
        this.makeDraggable(d, d.querySelector('#texDrag'));

        // Keys are scoped to the panel: composer.html has global handlers and a
        // stray SPACE here must not fight the transport (plan §15.11).
        d.setAttribute('tabindex', '0');
        d.addEventListener('keydown', e => {
            if (e.target.matches('input,select,textarea')) return;
            const k = e.key;
            const take = () => { e.preventDefault(); e.stopPropagation(); };
            // LIVE owns the keys while it streams: arrows walk the steps at the
            // next attack, SPACE stops. (Click the panel background first if
            // focus is in a number box — there, arrows edit the number.)
            if (this.lv.playing) {
                if (k === 'ArrowLeft' || k === 'ArrowRight') { take(); this.lvStep(k === 'ArrowRight' ? 1 : -1); return; }
                if (k === ' ') { take(); this.lvStop(); return; }
                if (k === '0') { take(); this.lvZero(); return; }
                if (k === 'ArrowUp' || k === 'ArrowDown') { take(); return; }
            }
            if (k === ' ') { take(); E.isPlaying() ? E.panic() : this.play(); }
            else if (k === 'ArrowLeft' || k === 'ArrowRight') {
                take();
                const keys = this.variantKeys();
                if (!keys.length) return;
                const i = keys.indexOf(this.active) + (k === 'ArrowRight' ? 1 : -1);
                this.active = keys[(i + keys.length) % keys.length];
                this.humanized = false;
                this.generate();
            } else if (k === 'ArrowUp' || k === 'ArrowDown') {
                // SEED STEPPING (R5) — at ten voices a jitter/scatter setting is a
                // LOTTERY, not a texture: each render is one draw from it, and the
                // phantom "accents" in the research came from judging single draws.
                // Stepping the seed answers "is this the setting, or just this
                // draw?" — and "a different gallop" is literally a new seed.
                take();
                this.stepSeed(k === 'ArrowUp' ? 1 : -1);
            } else if (k === 'p' || k === 'P') { take(); this.pin(); }
            else if (k === 'a' || k === 'A') { take(); this.flip(); }
            else if (k === 'h' || k === 'H') { take(); this.humanize(); }
            else if (k === 'g' || k === 'G') { take(); this.generate(); }
        });
        // CHAIN, never overwrite. `E.onStop` is a single slot on a layer BOTH
        // panels share: the Morph panel sets it to reset its own Play button, and
        // a plain assignment here would silently leave that button reading
        // "Playing…" forever after any texture stop (and vice versa, depending on
        // script order). Two panels, one emit layer — so cooperate with whatever
        // is already there instead of assuming we are alone.
        const prevOnStop = E.onStop;
        E.onStop = () => {
            if (prevOnStop) { try { prevOnStop(); } catch (e) {} }
            const b = d.querySelector('#texPlay');
            if (b) b.textContent = 'Play';
            if (this._pvTake) { this._pvTake = null; this.paintTakeMenu(); }   // 1l.1: a take's ▸ preview ended
            this.stopCursor();                                                   // 1l.2: the lines view's cursor
            // ONE stop path: any panic (main Play, Morph, ours) also lands the
            // live stream. lvStop flips `playing` before its own panic, so this
            // cannot recurse.
            if (this.lv.playing) this.lvStop();
        };
    },

    makeDraggable(box, handle) {
        let sx = 0, sy = 0, bx = 0, by = 0, on = false;
        handle.addEventListener('mousedown', e => {
            if (e.target.id === 'texClose') return;
            on = true; sx = e.clientX; sy = e.clientY;
            const r = box.getBoundingClientRect(); bx = r.left; by = r.top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!on) return;
            box.style.left = (bx + e.clientX - sx) + 'px';
            box.style.top = (by + e.clientY - sy) + 'px';
            box.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => { on = false; });
    },

    // PREFLIGHT — every assumption this panel makes about the host app, checked
    // at OPEN time and reported loudly by name. A wrong assumption about the host
    // must fail HERE, not as silence three layers down at Play time. (The 2v
    // lesson: `window.Composer` was undefined, every route resolved to null, and
    // the panel reported a MIDI problem that did not exist.)
    preflight() {
        const C = HOST();
        const bad = [];
        if (!C) bad.push('Composer not reachable (lexical global — use HOST())');
        else {
            if (typeof C.trackInstrument !== 'function') bad.push('Composer.trackInstrument missing');
            else if (!C.trackInstrument(0)) bad.push('Composer.trackInstrument(0) returned nothing');
            if (!Array.isArray(C.objects)) bad.push('Composer.objects is not an array');
            if (typeof C._zoneMidiOutputs !== 'object') bad.push('Composer._zoneMidiOutputs missing');
            if (!C.sampleLen) bad.push('Composer.sampleLen missing (ring lengths — clamping and playability need it)');
        }
        if (typeof TX.render !== 'function') bad.push('texture_engine.js missing');
        if (typeof E.routeFor !== 'function') bad.push('morph_emit.js missing');
        this._preflight = bad;
        if (bad.length) console.error('[texture] PREFLIGHT FAILED:', bad);
        return bad;
    },

    async toggle(force) {
        const show = force != null ? force : this.el.style.display === 'none';
        this.el.style.display = show ? '' : 'none';
        if (show) {
            // 1l.1: the page loads bank/sample_lengths.json asynchronously at boot; opened before it lands, the preflight failed
            // and the panel never refreshed (found verifying 1l.1). Wait for it instead.
            const C = HOST();
            if (C && !C.sampleLen && typeof C.loadSampleLengths === 'function') { try { await C.loadSampleLengths(); } catch (e) {} }
            this.refreshRhythms();                                              // 1l.2: the rhythm takes' list
            const bad = this.preflight();
            this.el.focus();
            if (bad.length) { this.setStatus('PREFLIGHT: ' + bad.join(' · '), true); return; }
            this.refresh(true);
        } else { E.panic(); }
    },

    // ------------------------------------------------- the conversational loop
    // The AI writes bank/texture_params.json and bumps `rev`; the panel notices
    // within a second and regenerates. No websocket, no connection state, and it
    // survives a page reload (plan §3.3). `autoplay` is absent BY DESIGN — sound
    // only ever on the composer's SPACE or Play.
    startPolling() {
        this.poll = setInterval(() => {
            if (this.el.style.display !== 'none') this.refresh(false);
        }, 1000);
    },
    async refresh(force) {
        try {
            if (!this.models || force) {
                const m = await fetch('/api/texturemodels', { cache: 'no-store' });
                this.models = await m.json();
            }
            const r = await fetch('/api/textureparams', { cache: 'no-store' });
            const j = await r.json();
            if (!force && j.rev === this.rev) return;
            const revChanged = j.rev !== this.rev;
            this.rev = j.rev;
            this.params = j;
            const keys = this.variantKeys();
            // HONOUR `active` ON A REV BUMP. A new rev is a deliberate AI write —
            // "here is the new slate, and this is the one I mean" — so the panel
            // must land on it. Only inheriting `active` when the current tab had
            // gone invalid (the 2v behaviour) meant the composer sat on A reading
            // A's dials while the AI was describing B, which quietly defeats the
            // whole conversational loop. Found by running the loop, not by
            // reading it. On an ordinary poll with no rev change, the composer's
            // tab is theirs and nothing moves.
            if (revChanged && j.active && keys.indexOf(j.active) >= 0) this.active = j.active;
            if (keys.indexOf(this.active) < 0) this.active = keys[0];
            this.humanized = false;
            this.pinned = null;      // a new slate invalidates the old reference
            // a rev bump is a deliberate AI write — the live boxes follow it
            // too (mid-stream edits land on the next attack, same contract)
            this.lvLoad(j.live);
            this.generate();
        } catch (e) { this.setStatus('params file unavailable — ' + e.message, true); }
    },
    variantKeys() {
        const v = (this.params && this.params.variants) || {};
        return Object.keys(v).filter(k => v[k]);
    },
    current() {
        const v = (this.params && this.params.variants) || {};
        return v[this.active] || null;
    },

    // ------------------------------------------- 1l.1: the ensemble — the fit, the players, the take
    // FITTED IN PROPORTION: a section whose groups ask for more players than the ensemble has is scaled, largest remainder, every
    // group keeping at least one — ten → seven, the gallop's 5 + 5 → 4 + 3. (The engine's own clamp fills lanes in order and would
    // make the gallop 5 + 2.) And each group's level lands on its written dynamic. Returns what it changed, '' when nothing.
    fitSpec(spec) {
        const NP = P7().length, moved = [];
        (spec.sections || []).forEach(sec => {
            const vs = (sec.voices || []).filter(v => v.players != null && v.lanes == null);
            vs.forEach(v => { v.level = levelOfName(nameOfLevel(v.level != null ? v.level : 7.5)); });
            const want = vs.map(v => Math.max(1, Math.round(+v.players || 1)));
            const total = want.reduce((a, b) => a + b, 0);
            if (total <= NP) return;
            const raw = want.map(x => x * NP / total), n = raw.map(x => Math.max(1, Math.floor(x)));
            let left = NP - n.reduce((a, b) => a + b, 0);
            raw.map((x, i) => ({ i, f: x - Math.floor(x) })).sort((a, b) => b.f - a.f || a.i - b.i)
               .forEach(q => { if (left > 0) { n[q.i]++; left--; } });
            while (n.reduce((a, b) => a + b, 0) > NP) { const k = n.indexOf(Math.max.apply(null, n)); if (n[k] <= 1) break; n[k]--; }
            moved.push(want.join(' + ') + ' → ' + n.join(' + '));
            vs.forEach((v, i) => { v.players = n[i]; });
        });
        return moved.length ? 'fitted to ' + NP + ' players: ' + moved.join(' · ') : '';
    },
    // a player's articulation: his choice here, else his default (LG-59), else the instrument's ordinary voice
    artOf(p) {
        const inst = INSTS()[p.instKey], techs = (inst && inst.techniques) || [];
        const has = k => !!k && techs.some(t => t.key === k);
        if (has(this.arts[p.instKey])) return this.arts[p.instKey];
        if (has(ART_DEFAULT[p.instKey])) return ART_DEFAULT[p.instKey];
        return has(inst && inst.ordinary) ? inst.ordinary : ((techs[0] && techs[0].key) || null);
    },
    // A PLAYER'S NOTES, AS ASSIGNED: every note the take gives this player (lowest first), the cents and the partial kept, on this
    // player's articulation. The percussion: what the take gives the Percussion player, AS THE TAKE PLAYS IT (its technique, no bend
    // — a struck key is not tuned); with none, the claves, pair 2 high. No take, or a player given nothing → [] (SILENT).
    playerNotes(p, chord) {
        const src = chord || (this.take && this.take.chord) || null;
        if (!src) return [];
        const mine = src.filter(n => n.inst === p.instKey && isFinite(+n.midi)).slice().sort((a, b) => a.midi - b.midi);
        if (p.instKey === PERC) {
            if (mine.length) return mine.map(n => ({ midi: Math.round(+n.midi), cents: 0, tech: n.tech || 'main', partial: null }));
            return [{ midi: CLAVES.midi, cents: 0, tech: CLAVES.tech, partial: null, fallback: true }];
        }
        const tech = this.artOf(p);
        return mine.map(n => ({ midi: Math.round(+n.midi), cents: +(+n.cents || 0).toFixed(2), tech, partial: n.partial != null ? n.partial : null }));
    },
    // ------------------------------------------- 1l.2: WHO PLAYS EACH LINE
    // A LINE is one of the engine's players (a group of three makes three lines). WHO PLAYS it is a set of the seven players —
    // many-to-many (LG-57): two ticks in one row DOUBLE the line, each player on their OWN note; several ticks in one column MERGE
    // lines onto one player. The default is Texture's own order: line k → player k (lines past the seventh wrap round, merging).
    assignOf(line) {
        const a = this.assign && this.assign[line];
        return Array.isArray(a) ? a.filter(s => s >= 0 && s < P7().length) : [line % P7().length];
    },
    toggleAssign(line, slot, on) {
        const n = Math.max(line + 1, (this.assign || []).length, this.lineCount());
        const a = [];
        for (let k = 0; k < n; k++) a.push(this.assignOf(k).slice());
        const set = new Set(a[line]);
        if (on) set.add(slot); else set.delete(slot);
        a[line] = [...set].sort((x, y) => x - y);
        this.assign = a;
        this.persist();
        this.humanized = false;
        if (this.spec) this.renderSpec(this.spec);
    },
    lineCount() {
        const objs = ((this.result && this.result.objects) || []).filter(o => o.type === 'waveCurve');
        return objs.length ? Math.max.apply(null, objs.map(o => o.layer)) + 1 : 0;
    },
    // the engine's opt-in (texture_engine.js `laneVoice`): a LINE's pitch and articulation — its first player who has a note (a
    // two-note player, a doubled line: all of them are expanded after the render) — so the ring and the badge are the real ones.
    // A line nobody plays, or whose players the take gives nothing, keeps its place: its attacks are made and left out, so nobody
    // else's rhythm moves.
    laneVoice(line) {
        const ps = this.assignOf(line).map(s => P7()[s]).filter(Boolean);
        for (const p of ps) { const ns = this.playerNotes(p); if (ns.length) return { pitch: ns[0].midi, tech: ns[0].tech }; }
        return ps.length ? { pitch: null, tech: this.artOf(ps[0]) } : null;
    },
    // the time origin of a render: its first section's start (the engine's t0), so the lead-in before a first attack is kept and a
    // time on the lines view is a time in the pattern — what a cut (1l.4) is measured in
    originOf(result) { return (result && result.spec && result.spec.t0 != null) ? result.spec.t0 : 2; },
    spanOf(result) {
        const o = this.originOf(result);
        let end = o;
        ((result && result.report) || []).forEach(r => { end = Math.max(end, r.t0 + (r.sec && r.sec.dur || 0)); });
        ((result && result.objects) || []).forEach(x => { if (x.type === 'waveCurve') end = Math.max(end, x.endSeconds); });
        return Math.max(0.001, end - o);
    },
    // THE ONE TRANSLATION, for Play, Insert and the lines view alike: every rendered attack → the note(s) its players sound, in the
    // strikes drawer's note form ({ lane, tech, midi, vel = the ANCHOR of its written dynamic, onMs, durMs, cents, partial }) plus its
    // times (`t` from the origin) and where it came from (`line`, `i` — the dot's number in its line)
    notesOf(result, chord) {
        const P = P7(), out = [], silent = {}, unplayed = {}, cache = {};
        const objs = ((result && result.objects) || []).filter(o => o.type === 'waveCurve');
        const origin = this.originOf(result);
        if (!objs.length) return { notes: out, silent, unplayed, origin, lines: [] };
        const lines = [];
        objs.slice().sort((a, b) => a.startSeconds - b.startSeconds || a.layer - b.layer).forEach(o => {
            const L = o.layer, row = lines[L] || (lines[L] = []), i = row.length;
            const lv = (o.nodes && o.nodes[0]) ? o.nodes[0].y : 7.5;
            const dot = { line: L, i, t: +(o.startSeconds - origin).toFixed(4), dur: o.endSeconds - o.startSeconds, level: lv, players: [], hollow: true };
            row.push(dot);
            const ps = this.assignOf(L).map(s => P[s]).filter(Boolean);
            if (!ps.length) { unplayed['L' + (L + 1)] = (unplayed['L' + (L + 1)] || 0) + 1; return; }
            ps.forEach(p => {
                const ns = cache[p.slot] || (cache[p.slot] = this.playerNotes(p, chord));
                if (!ns.length) { silent[p.short] = (silent[p.short] || 0) + 1; return; }
                dot.hollow = false; dot.players.push(p.slot);
                ns.forEach(n => out.push({
                    lane: p.lane, slot: p.slot, tech: n.tech, midi: n.midi, vel: anchorOfLevel(lv), cents: n.cents || 0, partial: n.partial,
                    onMs: Math.round(dot.t * 1000), durMs: Math.max(20, Math.round(dot.dur * 1000)),
                    start: o.startSeconds, end: o.endSeconds, t: dot.t, dyn: nameOfLevel(lv), line: L, i,
                }));
            });
        });
        return { notes: out, silent, unplayed, origin, lines };
    },
    // THE COLLISION CHECK, on ONE PLAYER at a time (LG-58): the D17 law the tuba piece used and Composer.CONFLICT still uses (texture
    // engine `pairTier` — HARD = two attacks sounding at once, SOFT = too close to re-articulate, the leap counted), over every attack
    // that player makes from every line they play. A pair is FLAGGED — both dots drawn in the warning colour — never moved or dropped
    // (his to mute, 1l.6). Different players are never checked against each other. The minimum gap stays the tuba's, at his word.
    collisions(lines) {
        const byPlayer = {};
        lines.forEach(row => (row || []).forEach(d => d.players.forEach(s => (byPlayer[s] || (byPlayer[s] = [])).push(d))));
        const flagged = new Set(), per = {};
        Object.keys(byPlayer).forEach(s => {
            const p = P7()[+s], first = this.playerNotes(p)[0];
            const ev = byPlayer[s].map(d => ({ d, startSeconds: d.t, endSeconds: d.t + d.dur, sonifyNote: first ? first.midi : 60 }))
                .sort((a, b) => a.startSeconds - b.startSeconds || a.d.line - b.d.line);
            for (let a = 0; a < ev.length; a++) {
                for (let b = a + 1; b < ev.length; b++) {
                    if (ev[b].startSeconds - ev[a].endSeconds > TX.D17.WINDOW) break;
                    if (TX.pairTier(ev[a], ev[b]) === 'free') continue;
                    flagged.add(ev[a].d.line + ':' + ev[a].d.i); flagged.add(ev[b].d.line + ':' + ev[b].d.i);
                    per[p.short] = (per[p.short] || 0) + 1;
                }
            }
        });
        return { flagged, per };
    },
    silentText(b) {
        const s = Object.keys(b.silent || {}), u = Object.keys(b.unplayed || {});
        return [s.length ? 'SILENT — no note in the take: ' + s.join(' · ') : '', u.length ? 'no player: ' + u.join(' · ') : ''].filter(Boolean).join(' · ');
    },

    // THE LINES VIEW — every line a row of dots in time, who plays it ticked at the left; a click on the timeline plays from there
    applyWidth() {
        if (!this.el) return;
        this.el.style.width = this.linesOpen ? 'min(860px, calc(100vw - 40px))' : '360px';
        const box = this.el.querySelector('#texLines'); if (box) box.style.display = this.linesOpen ? '' : 'none';
        const tog = this.el.querySelector('#texLinesTog'); if (tog) tog.textContent = this.linesOpen ? 'lines ▾' : 'lines ▸';
    },
    drawLines() {
        const info = this.el && this.el.querySelector('#texLinesInfo');
        if (!this.result) return;
        const b = this.notesOf(this.result, this.take ? this.take.chord : null), col = this.collisions(b.lines);
        const P = P7(), span = this.spanOf(this.result);
        const rows = b.lines.map((row, L) => ({
            label: 'L' + (L + 1),
            dots: (row || []).map(d => ({ t: d.t, s: !this.assignOf(L).length ? 'silent' : d.hollow ? 'hollow' : col.flagged.has(L + ':' + d.i) ? 'warn' : 'ok' })),
        }));
        this._lines = { b, col, span };
        const per = Object.keys(col.per);
        if (info) info.innerHTML = b.lines.length + ' line' + (b.lines.length === 1 ? '' : 's') + ' · ' + span.toFixed(1) + ' s' +
            (per.length ? ' · <span style="color:#e0b062">too close on ' + per.map(k => escH(k) + ' ×' + col.per[k]).join(' · ') + '</span>' : ' · <span style="color:#6a6">no player too close</span>');
        if (!this.view || !this.linesOpen) return;
        this.view.set({
            rows, t0: 0, t1: span,
            grid: { heads: P.map(p => p.short), on: L => new Set(this.assignOf(L)), title: (L, c) => 'L' + (L + 1) + ' played by ' + P[c].label },
        });
    },
    startCursor(from) {
        this.stopCursor();
        const D = SD(); if (!D || !this.view) return;
        this._curT = setInterval(() => {
            if (!E.isPlaying()) { this.stopCursor(); return; }
            this.view.setCursor(Math.max(from, from + (performance.now() - D.base) / 1000));
        }, 50);
    },
    stopCursor() {
        if (this._curT) { clearInterval(this._curT); this._curT = null; }
        if (this.view && this.view.cursor != null) this.view.setCursor(null);
    },

    // ------------------------------------------- 1l.2: RHYTHM TAKES — the recipe saved by name (bank/rhythm_takes.json)
    // A take is the RECIPE — the dials and the seed (the whole spec), who plays, the articulations — never the notes: the engine draws
    // nothing at random, so the same recipe always gives the same dots, which is what lets a touched dot be found again (1l.6).
    // A store of its own (`rhythms`, score/snapshots.js), as the sequence library has one: a rhythm save never rewrites his harmony takes.
    rhythmState() {
        return { v: 1, spec: JSON.parse(JSON.stringify(this.spec)), assign: this.assign ? JSON.parse(JSON.stringify(this.assign)) : null,
                 arts: Object.assign({}, this.arts), variant: this.active, label: this.labelOf(this.spec) };
    },
    async refreshRhythms() {
        try {
            const f = await fetch('/api/snapshots?store=rhythms', { cache: 'no-store' }).then(r => r.json());
            this.rhythms = (f && f.panels && f.panels[RHYTHM_PANEL]) || {};
        } catch (e) { this.rhythms = {}; }
        this.fillRhythms();
    },
    fillRhythms() {
        const sel = this.el && this.el.querySelector('#texRtSel'); if (!sel) return;
        const names = Object.keys(this.rhythms).sort((a, b) => String(this.rhythms[b].saved || '').localeCompare(String(this.rhythms[a].saved || '')));
        sel.innerHTML = '<option value="">recall… (' + names.length + ')</option>' + names.map(n => '<option value="' + escH(n) + '">' + escH(n) + '</option>').join('');
    },
    async postRhythm(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.assign({ store: 'rhythms', panel: RHYTHM_PANEL }, body)) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.success) throw new Error(j.error || ('HTTP ' + r.status) + (j.error === 'unknown store' ? ' — restart node score/server.js (the rhythms store is new)' : ''));
        return j;
    },
    async saveRhythm(name) {
        if (!this.spec) { this.setStatus('nothing to save — generate a texture first', true); return; }
        if (!RHYTHM_NAME.test(name || '')) { this.setStatus('a rhythm take needs a name: 1–64 letters, digits, dot, underscore, space or hyphen', true); return; }
        try {
            const r = await this.postRhythm({ name, comment: this.rhythmState().label, state: this.rhythmState() });
            this.rhythmName = name; this.persist();
            await this.refreshRhythms();
            this.setStatus('rhythm take ' + (r.existed ? 'REPLACED' : 'saved') + ': "' + name + '" · ' + r.panels + ' in bank/rhythm_takes.json');
        } catch (e) { this.setStatus('rhythm take not saved: ' + e.message, true); }
    },
    async recallRhythm(name) {
        if (!this.rhythms[name]) await this.refreshRhythms();
        const t = this.rhythms[name], s = t && t.state;
        if (!s || !s.spec) { this.setStatus('no rhythm take named "' + name + '"', true); return; }
        this.spec = JSON.parse(JSON.stringify(s.spec));
        this.assign = Array.isArray(s.assign) ? JSON.parse(JSON.stringify(s.assign)) : null;
        if (s.arts && typeof s.arts === 'object') this.arts = Object.assign({}, s.arts);
        this._fieldStamp = this.active + '@' + this.rev;   // the fields drawn from the recalled spec ARE its dials
        this._fitNote = '';
        this.humanized = false;
        this.rhythmName = name; this.persist();
        const nb = this.el.querySelector('#texRtName'); if (nb) nb.value = name;
        this.renderSpec(this.spec);
        this.setStatus('rhythm take recalled: "' + name + '" — ' + (s.label || ''), false);
    },
    async deleteRhythm(name) {
        if (!name) { this.setStatus('type the name of the rhythm take to delete', true); return; }
        if (!window.confirm('Delete the rhythm take "' + name + '"?')) return;
        try {
            const r = await this.postRhythm({ name, delete: true });
            if (this.rhythmName === name) { this.rhythmName = ''; this.persist(); }
            await this.refreshRhythms();
            this.setStatus(r.existed ? 'rhythm take deleted: "' + name + '" · ' + r.panels + ' left' : 'no rhythm take named "' + name + '" — nothing deleted', !r.existed);
        } catch (e) { this.setStatus('not deleted: ' + e.message, true); }
    },

    // THE PLAYERS STRIP: each player's articulation (their own roster; his default marked ·) and the note(s) the take gives them
    drawPlayers() {
        const box = this.el && this.el.querySelector('#texPlayers'); if (!box) return;
        const P = P7(), I = INSTS(), tk = this.take;
        const tb = this.el.querySelector('#texTake');
        if (tb) { tb.textContent = tk ? tk.name + ' ▾' : '— choose a harmony take — ▾'; tb.style.color = tk ? '#e8cf9a' : '#e0b062'; }
        const SEL = 'width:100%;box-sizing:border-box;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px;font-size:10px';
        let h = '<div style="display:grid;grid-template-columns:34px minmax(0,1fr) 92px;gap:2px 5px;align-items:center">';
        P.forEach(p => {
            const ns = this.playerNotes(p);
            let art;
            if (p.instKey === PERC) {
                art = '<span style="color:#9a9" title="the percussion plays what the take gives the Percussion player, as the take plays it; with none, the claves, pair 2 high">' +
                      (!tk ? '—' : (ns.length && ns[0].fallback ? CLAVES.name + ' (none in the take)' : 'as the take')) + '</span>';
            } else {
                const cur = this.artOf(p);
                art = '<select data-inst="' + escH(p.instKey) + '" title="' + escH(p.label) + '\'s articulation — · marks his default" style="' + SEL + '">' +
                      ((I[p.instKey] && I[p.instKey].techniques) || []).map(t => '<option value="' + escH(t.key) + '"' + (t.key === cur ? ' selected' : '') + '>' +
                      escH(t.label || t.key) + (t.key === ART_DEFAULT[p.instKey] ? ' ·' : '') + '</option>').join('') + '</select>';
            }
            const note = !tk ? '<span style="color:#666">—</span>'
                : ns.length ? ns.map(n => nn(n.midi) + (n.cents ? '<span style="color:#9a9">' + (n.cents > 0 ? '+' : '') + Math.round(n.cents) + '¢</span>' : '')).join(' ')
                : '<span style="color:#e0b062" title="the take gives this player no note — their attacks are SILENT">silent</span>';
            h += '<span style="color:#8fd6ab">' + escH(p.short) + '</span>' + art + '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + note + '</span>';
        });
        h += '</div>';
        const vib = tk ? (tk.chord || []).filter(n => n.inst === VIB) : [];
        if (vib.length) h += '<div style="color:#777;margin-top:2px">Vib: ' + vib.map(n => nn(n.midi)).join(' ') + ' — carried, not played here (the dots, 1l.6)</div>';
        box.innerHTML = h;
    },

    // THE TAKES MENU — the sequence drawer's idiom (sequence_ui.js `openTakeMenu`): a filter over his takes, a ▸ beside each that
    // HEARS THIS TEXTURE ON THAT TAKE without choosing it (click the lit one to stop), the name chooses. ESC or a click outside closes.
    // A take is DEALT ONCE through the sequence drawer's own `dealTake` — which loads it in the strikes drawer, as everywhere — and frozen.
    async dealTake(name) {
        const S = SQ();
        if (!S || typeof S.dealTake !== 'function') { this.setStatus('the sequence drawer is not on this page — a take cannot be read', true); return null; }
        try {
            const ch = await S.dealTake(name);
            if (!ch || !ch.length) { this.setStatus('take "' + name + '" dealt no notes — look in the strikes drawer: nothing assigned, or its harmony not found', true); return null; }
            return ch.map(n => { const o = { lane: n.lane, seat: +n.seat || 0, inst: n.inst, tech: n.tech, midi: Math.round(+n.midi), cents: +(+n.cents || 0).toFixed(2) }; if (n.partial != null) o.partial = n.partial; return o; });
        } catch (e) { this.setStatus('take not read: ' + ((e && e.message) || e), true); return null; }
    },
    async chooseTake(name) {
        const chord = await this.dealTake(name); if (!chord) return;
        this.take = { name, chord, at: new Date().toISOString() };
        this.persist();
        this.humanized = false;
        if (this.spec) this.renderSpec(this.spec); else this.drawPlayers();
    },
    async previewTake(name) {
        const was = this._pvTake;
        E.panic();
        this._pvTake = null; this.paintTakeMenu();
        if (was === name || !name) return;
        const chord = await this.dealTake(name); if (!chord) return;
        if (!this.result) this.generate();
        if (!this.result) return;
        if (!(await this.playResult(this.result, chord, 'PREVIEW · take "' + name + '" — heard, not chosen: click its name to choose it'))) return;
        this._pvTake = name; this.paintTakeMenu();
    },
    closeTakeMenu() {
        const m = this._takeMenu; if (!m) return;
        this._takeMenu = null; document.removeEventListener('mousedown', m._out, true); m.remove();
    },
    paintTakeMenu() {
        const m = this._takeMenu; if (!m) return;
        m.querySelectorAll('.txTkPv').forEach(p => { const on = p.dataset.name === this._pvTake; p.textContent = on ? '■' : '▸'; p.style.background = on ? '#2a5a3a' : ''; });
    },
    async openTakeMenu(anchor) {
        if (this._takeMenu) { this.closeTakeMenu(); return; }
        const D = SD();
        if (!D || !SQ()) { this.setStatus('the strikes drawer and the sequence drawer must be on this page to read a take', true); return; }
        if (!D.takeList || !Object.keys(D.takeList).length) { try { await D.refreshTakes(); } catch (e) {} }
        const names = D.takeNames ? D.takeNames() : [], cur = this.take ? this.take.name : '';
        const r = anchor.getBoundingClientRect(), below = window.innerHeight - r.bottom, above = r.top, up = below < 320 && above > below;
        const m = document.createElement('div'); m.id = 'texTakeMenu';
        m.style.cssText = 'position:fixed;z-index:100000;left:' + Math.max(4, Math.min(r.left, window.innerWidth - 340)) + 'px;' +
            (up ? 'bottom:' + (window.innerHeight - r.top + 2) + 'px;' : 'top:' + (r.bottom + 2) + 'px;') +
            'width:320px;max-height:' + Math.max(160, Math.min(520, (up ? above : below) - 12)) + 'px;display:flex;flex-direction:column;background:#111114;color:#ddd;' +
            'border:1px solid #3F7D5A;border-radius:4px;box-shadow:0 6px 24px rgba(0,0,0,.6);font:11px/1.45 system-ui,sans-serif';
        const rowOf = nm => '<div class="txTkRow' + (nm === cur ? ' cur' : '') + '" data-name="' + escH(nm) + '">' +
            '<button type="button" class="txTkPv" data-name="' + escH(nm) + '" title="HEAR this texture on this take without choosing it — click again to stop" style="padding:0 5px;flex:0 0 auto">▸</button>' +
            '<span class="txTkNm">' + escH(nm) + '</span></div>';
        m.innerHTML = '<style>#texTakeMenu .txTkRow{display:flex;align-items:center;gap:6px;padding:1px 6px;cursor:pointer;white-space:nowrap}' +
            '#texTakeMenu .txTkRow:hover,#texTakeMenu .txTkRow.hl{background:#23332b}#texTakeMenu .txTkRow.cur .txTkNm{color:#8fd6ab;font-weight:bold}' +
            '#texTakeMenu .txTkNm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}</style>' +
            '<div style="display:flex;align-items:center;gap:6px;padding:4px 5px;border-bottom:1px solid #2c3238;flex:0 0 auto">' +
              '<input id="txTkFilter" type="text" spellcheck="false" placeholder="filter — part of a name" style="flex:1;min-width:0;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 4px">' +
              '<span id="txTkCount" style="color:#9a9;flex:0 0 auto"></span></div>' +
            '<div id="txTkList" style="overflow-y:auto;flex:1 1 auto">' +
              ((cur && names.indexOf(cur) < 0) ? rowOf(cur) : '') + names.map(rowOf).join('') + '</div>';
        document.body.appendChild(m); this._takeMenu = m;
        const fil = m.querySelector('#txTkFilter'), rows = () => Array.from(m.querySelectorAll('.txTkRow')), shown = () => rows().filter(x => x.style.display !== 'none');
        const choose = nm => { this.closeTakeMenu(); this.chooseTake(nm); };
        const count = () => { m.querySelector('#txTkCount').textContent = shown().length + ' of ' + names.length; };
        const light = el => { rows().forEach(x => x.classList.remove('hl')); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'nearest' }); } };
        fil.addEventListener('input', () => {
            const words = fil.value.toLowerCase().split(/\s+/).filter(Boolean);   // every word in the name, any order
            rows().forEach(x => { const s = x.dataset.name.toLowerCase(); x.style.display = words.every(w => s.indexOf(w) >= 0) ? '' : 'none'; });
            count(); light(words.length ? shown()[0] : null);
        });
        fil.addEventListener('keydown', e => {
            e.stopPropagation();   // typing here is typing — not SPACE = play, not the composer's keys
            const S_ = shown(), k = S_.findIndex(x => x.classList.contains('hl'));
            if (e.key === 'Escape') { e.preventDefault(); this.closeTakeMenu(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); light(S_[Math.min(S_.length - 1, k + 1)]); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); light(S_[Math.max(0, k - 1)]); }
            else if (e.key === 'Enter') { e.preventDefault(); const el = S_[k] || (fil.value.trim() ? S_[0] : null); if (el) choose(el.dataset.name); }
        });
        m.addEventListener('click', e => {
            const pv = e.target.closest('.txTkPv'); if (pv) { e.stopPropagation(); this.previewTake(pv.dataset.name); fil.focus(); return; }
            const row = e.target.closest('.txTkRow'); if (row) choose(row.dataset.name);
        });
        m._out = e => { if (!m.contains(e.target) && !(e.target.closest && e.target.closest('#texTake'))) { if (this._pvTake) E.panic(); this.closeTakeMenu(); } };
        document.addEventListener('mousedown', m._out, true);
        count(); this.paintTakeMenu();
        const c = m.querySelector('.txTkRow.cur'); if (c) c.scrollIntoView({ block: 'center' });
        fil.focus();
    },

    // ------------------------------------------------------------- rendering
    generate() {
        const p = this.current();
        if (!p || !p.spec) { this.setStatus('no variant', true); return; }
        // THE FIELDS BELONG TO A VARIANT. Reading them blindly merges the PREVIOUS
        // variant's dials into the new one, so switching A→B auditions B at A's
        // seed and A's density — and it sticks, because draw() then redraws the
        // fields from the already-wrong merge. Every cross-variant comparison is
        // then of the wrong thing. (Found in 2v, 2026-08-16; same shape here.)
        // So: nudges persist while you stay put; changing variant, or the AI
        // rewriting the params file, resets to what the file actually says.
        const stamp = this.active + '@' + this.rev;
        const fresh = !(this._fieldStamp === stamp && this.spec);
        // 1l.1 · 1l.2: a spec newly taken from the file is fitted to the ensemble, and says what fitting it changed
        const merged = !fresh
            ? this.readFields()
            : this.adopt(JSON.parse(JSON.stringify(p.spec)));
        this._fieldStamp = stamp;
        this.spec = merged;
        this.renderSpec(merged);
    },

    // 1l.2: a spec TAKEN UP (from the params file, or a model) is fitted to the ensemble — seven lines, one per player, by default.
    // After that the players dial may raise the lines to ten (the engine's limit); who plays each is the lines view's grid.
    adopt(spec) {
        this._fitNote = this.fitSpec(spec);
        return spec;
    },
    renderSpec(spec) {
        try {
            this.result = TX.render(spec, {
                maxLanes: MAX_LINES,                                 // 1l.2: the LINES; who plays each is assignOf()
                sampleLengths: (HOST() && HOST().sampleLen) || null, // this piece's bank/sample_lengths.json — this ensemble's one-shots
                tonality: root.Tonality || null,
                humanize: this.humanized ? this.humanizeSettings() : null,
                laneVoice: line => this.laneVoice(line),             // 1l.1: each line's own pitch and articulation (the engine's opt-in)
            });
        } catch (e) {
            this.setStatus('render failed: ' + e.message, true);
            console.error(e); return;
        }
        this.draw(spec);
    },

    humanizeSettings() {
        return { stageMs: TX.HUMANIZE.stageMs, jitterMs: TX.HUMANIZE.jitterMs,
                 seed: (this.spec && this.spec.seed) || 1 };
    },

    stepSeed(delta) {
        if (!this.spec) return;
        this.spec.seed = Math.max(0, (this.spec.seed || 0) + delta);
        this.renderSpec(this.spec);
        if (!this.seedIsLive(this.spec)) {
            this.setStatus('seed ' + this.spec.seed + ' — INERT for this texture: no stochastic dial is' +
                ' engaged (scatter 0, jitter 0), so there is only one draw. Raise jitter or scatter' +
                ' and the seed becomes the draw number.', true);
        }
    },

    // A seed only means something if SOMETHING is drawn from it. A two-tempo
    // gallop with scatter 0 and jitter 0 is fully determined, so stepping its
    // seed is a no-op — and an interface that silently does nothing is worse
    // than one that refuses. Say so instead (AI_METHODOLOGY rule 3: never
    // silently refuse, never silently discard).
    seedIsLive(spec) {
        return (spec.sections || []).some(sec =>
            (sec.voices || []).some(g => (g.scatter || 0) > 0 || (g.jitterMs || 0) > 0));
    },

    // R9 — every render is self-describing. If a variant carries no label, one is
    // composed from the dials that actually moved, in plain language, so a render
    // is never anonymous and the numbers stay learnable (§6's two-sided contract).
    // 1l.2: the variant's own label only while the spec IS that variant's; a model, a morph or a recalled rhythm take is described by
    // its name and its dials (the label named variant G while `smear` was loaded — found verifying 1l.2)
    labelOf(spec) {
        const p = this.current() || {};
        return (p.label && p.spec && spec && p.spec.name === spec.name) ? p.label : ((spec && spec.name ? spec.name + ' · ' : '') + this.autoLabel(spec));
    },
    autoLabel(spec) {
        const v = ((spec.sections || [])[0] || {}).voices || [];
        if (!v.length) return spec.name || 'texture';
        const parts = v.map((g, i) => {
            const n = g.players || (g.lanes || []).length || 1;
            const rate = (n * (g.bpm || 100) / 60).toFixed(1);
            const bits = [n + ' parts', rate + '/s'];
            if (g.jitterMs) bits.push('jitter ' + g.jitterMs + ' ms');
            if (g.scatter) bits.push('scatter ' + g.scatter);
            bits.push(nameOfLevel(g.level != null ? g.level : 7.5));   // 1l.1: the articulation is per player now; the dynamic is the group's
            return (v.length > 1 ? 'group ' + (i + 1) + ': ' : '') + bits.join(' · ');
        });
        return parts.join('  |  ');
    },

    draw(spec) {
        const r = this.result;
        const m = (r.report[0] && r.report[0].metrics) || { sd: 0, unevenness: 0, n: 0 };
        const p = this.current() || {};
        const dens = r.report.reduce((a, s) => a + s.lines.reduce((x, l) => x + l.composite, 0), 0)
                     / Math.max(1, r.report.length);
        const label = this.labelOf(spec);
        // THE CEILING FOLLOWS THE PITCH SET, it is not the flat 23/s. That figure
        // is C3-specific — the whole research arc ran on one C3, which is among
        // the SHORTEST staccato samples — so a texture given real pitches has a
        // lower ceiling than the one the composer calibrated by ear.
        const ceil = r.ceiling ? r.ceiling.rate : TX.RAILS.density[1];
        const amber = dens > ceil;

        this.setStatus(
            'v' + this.rev + ' &middot; ' + this.active + (this.humanized ? ' &middot; <b style="color:#8fd6ab">H</b>' : '') +
            ' &middot; "' + label + '"<br>seed <b>' + (spec.seed != null ? spec.seed : '—') + '</b>' +
            (this.seedIsLive(spec) ? '' : ' <span style="color:#777">(inert — nothing stochastic)</span>') +
            ' &middot; ' + (amber ? '<span style="color:#e0b062">' : '') + dens.toFixed(1) + '/s' +
            (amber ? ' &#9888; past the ' + ceil.toFixed(1) + '/s ceiling for this pitch set</span>'
                   : '<span style="color:#777"> of ' + ceil.toFixed(1) + '</span>') +
            ' &middot; sd ' + m.sd.toFixed(1) + ' ms &middot; unev ' + m.unevenness.toFixed(2) +
            ' &middot; ' + r.notes + ' notes<br>' +
            (r.summary.hard ? '<b style="color:#e06666">&#9888; ' + r.summary.hard + ' hard</b> / ' : '&#9888; 0 hard / ') +
            (r.summary.soft ? '<span style="color:#e0b062">' + r.summary.soft + ' soft</span>' : '0 soft') +
            (this.pinned ? ' &middot; <span style="color:#8a8ac0">pinned: ' + this.pinned.tag + '</span>' : '') +
            // 1l.1: the take, who is silent, and what fitting to seven changed
            (this.take ? '<br>take <b style="color:#e8cf9a">' + escH(this.take.name) + '</b>' +
                ((s => s ? ' &middot; <span style="color:#e0b062">' + escH(s) + '</span>' : '')(this.silentText(this.notesOf(r, this.take.chord))))
                       : '<br><span style="color:#e0b062">no take — choose a harmony take above: each player plays their own note of it</span>') +
            (this._fitNote ? '<br><span style="color:#9ab">' + escH(this._fitNote) + '</span>' : ''),
            false, true);
        this.drawPlayers();
        this.drawLines();                  // 1l.2

        // ---- variant tabs
        const tabs = this.el.querySelector('#texTabs');
        tabs.innerHTML = '';
        this.variantKeys().forEach(k => {
            const b = document.createElement('button');
            b.textContent = k;
            b.style.cssText = 'margin-right:4px;' + (k === this.active
                ? 'background:#3F7D5A;color:#fff;border-color:#6fb98f' : '');
            b.addEventListener('click', () => {
                this.active = k; this.humanized = false; this.generate();
            });
            tabs.appendChild(b);
        });

        // ---- category buttons: the five MODELS (§5). Loading one replaces the
        // dials with its point; the dials stay visible and editable (R1 — numbers
        // never hidden, never the primary interface).
        const mods = this.el.querySelector('#texModels');
        mods.innerHTML = '<span style="color:#9a9;margin-right:5px">model:</span>';
        const store = (this.models && this.models.models) || {};
        Object.keys(store).forEach(name => {
            const b = document.createElement('button');
            b.textContent = name.toLowerCase();
            b.title = store[name].heard || name;
            b.style.cssText = 'margin-right:3px;font-size:10px;padding:1px 5px';
            b.addEventListener('click', () => {
                this.spec = this.adopt(JSON.parse(JSON.stringify(store[name].spec)));   // 1l.2: fitted to the ensemble as it is taken up
                // the model IS the truth now, not the fields — and the fields drawn from it ARE its dials. LGMF 1l.1 (2026-09-21):
                // this was `null`, so the next nudge failed the stamp test in generate() and silently reloaded the FILE's variant,
                // throwing the model away (found verifying 1l.1: a `dyn` change after `smear` came back as variant G). Stamp it.
                this._fieldStamp = this.active + '@' + this.rev;
                this.humanized = false;
                this.renderSpec(this.spec);
            });
            mods.appendChild(b);
        });
        // keep the morph destination list in step with the model store
        const msel = this.el.querySelector('#texMorphTo');
        if (msel && msel.options.length !== Object.keys(store).length) {
            const keep = msel.value;
            msel.innerHTML = '';
            Object.keys(store).forEach(n => {
                const o = document.createElement('option');
                o.value = n; o.textContent = n.toLowerCase();
                msel.appendChild(o);
            });
            if (keep) msel.value = keep;
        }

        // ---- dials, per voice group
        const f = this.el.querySelector('#texFields');
        f.innerHTML = '';
        const head = t => {
            const h = document.createElement('div');
            h.style.cssText = 'color:#8fd6ab;margin:6px 0 2px;border-top:1px solid #3a3a44;padding-top:4px';
            h.textContent = t; f.appendChild(h);
        };
        const row = (label, path, val, step, rail) => {
            const w = document.createElement('div');
            w.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:2px 0';
            const out = (rail && (val < rail[0] || val > rail[1]));
            w.innerHTML = '<span style="color:' + (out ? '#e0b062' : '#9a9') + '">' + label +
                (out ? ' &#9888;' : '') + '</span>';
            const i = document.createElement('input');
            i.type = 'number'; i.step = step; i.value = val; i.dataset.path = path;
            i.style.cssText = 'width:74px;background:#1b1b20;color:#ddd;border:1px solid ' +
                (out ? '#7a5a2a' : '#444') + ';padding:1px 4px';
            i.addEventListener('change', () => { this.humanized = false; this.generate(); });
            w.appendChild(i); f.appendChild(w);
        };
        const sel = (label, path, val, opts) => {
            const w = document.createElement('div');
            w.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:2px 0';
            w.innerHTML = '<span style="color:#9a9">' + label + '</span>';
            const s = document.createElement('select');
            s.dataset.path = path;
            s.style.cssText = 'width:80px;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px';
            opts.forEach(o => {
                const op = document.createElement('option');
                op.value = o; op.textContent = o;
                if (o === val) op.selected = true;
                s.appendChild(op);
            });
            s.addEventListener('change', () => { this.humanized = false; this.generate(); });
            w.appendChild(s); f.appendChild(w);
        };

        row('seed', 'seed', spec.seed != null ? spec.seed : 1, 1);
        const secs = spec.sections || [];
        secs.forEach((sec, si) => {
            row('duration (s)', 'sections.' + si + '.dur', sec.dur, 1);
            (sec.voices || []).forEach((g, gi) => {
                const base = 'sections.' + si + '.voices.' + gi + '.';
                head(secs.length > 1 ? 'section ' + (si + 1) + ' · group ' + (gi + 1)
                                     : 'group ' + (gi + 1) +
                                       ((sec.voices.length > 1) ? '' : ' — the dials'));
                row('players', base + 'players', g.players != null ? g.players : (g.lanes || []).length,
                    1, [1, MAX_LINES]);                                    // 1l.2: the LINES (up to the engine's ten); who plays each: the lines view
                row('bpm (per player)', base + 'bpm', g.bpm, 1);
                row('scatter 0…1', base + 'scatter', g.scatter || 0, 0.05, TX.RAILS.scatter);
                row('jitter (ms)', base + 'jitterMs', g.jitterMs || 0, 5, TX.RAILS.jitterMs);
                row('note length (s)', base + 'notelen', g.notelen != null ? g.notelen : 0.12, 0.02);
                // 1l.1: the WRITTEN DYNAMIC (was `level 0…10`) — a struck note's dynamic is its velocity, the ladder's anchor
                // remapped per instrument (docs/DYNAMICS_LAW.md §1). The articulation is now per PLAYER (the strip above), and
                // the pitch is the TAKE's: the tubas' articulation list and the engine's pitch dials (policy · root · set) are gone
                // from here — the engine keeps them, so the research slate still renders.
                sel('dyn', base + 'level', nameOfLevel(g.level != null ? g.level : 7.5), DYN().NAMES);
            });
        });

        // ---- flags, in 2r's existing red/amber vocabulary — no new colours
        const fl = this.el.querySelector('#texFlags');
        fl.innerHTML = '';
        if (r.unknown.length) {
            fl.innerHTML += '<div style="color:#e0b062">unrecognised keys (ignored, not applied): ' +
                r.unknown.join(', ') + '</div>';
        }
        // a named set that did not resolve is LOUD — rendering quietly at the
        // root pitch would look exactly like the set having been applied
        if ((r.unresolvedSets || []).length) {
            fl.innerHTML += '<div style="color:#e06666">&#9888; pitch set not found: ' +
                r.unresolvedSets.join(', ') + ' — rendered at the root pitch instead.</div>';
        }
        if (r.clamps.length) {
            fl.innerHTML += '<div style="color:#e0b062">clamped: ' + r.clamps.join(' · ') + '</div>';
        }
        // SAMPLE RING — the conflict the badge structurally cannot show, and the
        // one the mock-up plays perfectly cleanly (2r: technique = MIDI channel,
        // so two attacks on one player go out on two UVI voices and both sound).
        // At the density ceiling this is the only thing between a texture and an
        // unplayable one, so it gets the loudest line in the panel.
        (r.rings || []).forEach(x => {
            fl.innerHTML += '<div style="color:#e06666">&#9888; SAMPLE RING &middot; ' +
                x.players + ' players re-attack every <b>' + x.tightest.toFixed(2) +
                ' s</b> but ' + x.tech + ' rings <b>' + x.ring + ' s</b> (over by ' +
                x.overBy.toFixed(2) + ' s) — the mock-up will play this cleanly and the hall will not.' +
                '</div>';
        });
        const rows = r.summary.pairs.slice(0, 30);
        if (!rows.length && !r.unknown.length && !r.clamps.length && !(r.rings || []).length) {
            fl.innerHTML = '<div style="color:#6a6">no flags</div>';
        }
        rows.forEach(x => {
            fl.innerHTML += '<div style="color:' + (x.tier === 'hard' ? '#e06666' : '#e0b062') + '">T' +
                (x.layer + 1) + ' &middot; ' + x.at.toFixed(2) + ' s &middot; ' + x.tier +
                ' &middot; ' + x.a + ' → ' + x.b + '</div>';
        });

        this.drawHelp();
    },

    // §15.13 — the escape hatch, said where it will be read. The audition
    // schedules with setTimeout-class timers and 23 attacks/s is a 43 ms grid, so
    // a dense texture CAN sound worse than it is. The panel measures its own
    // timing on every play (below) so this is a number, not a worry.
    drawHelp() {
        const h = this.el.querySelector('#texHelp');
        if (!h) return;
        const t = this.timing;
        h.innerHTML = t
            ? ('last play: <b>' + t.scheduled + '</b> notes · timing drift mean ' +
               t.mean.toFixed(1) + ' ms, max ' + t.max.toFixed(1) + ' ms' +
               (t.max > 15 ? '<br><span style="color:#e0b062">⚠ drift is audible at this density — ' +
                 'A/B against Reaper before blaming the material: ' +
                 '<code>node tools/phase_shift.js --fromModel &lt;NAME&gt; --midi</code></span>' : ''))
            : 'every attack goes through the strikes drawer\'s player (browser timers) — a struck note at its written dynamic, remapped per instrument.';
    },

    readFields() {
        const merged = JSON.parse(JSON.stringify(this.spec));
        const setPath = (path, val) => {
            const parts = path.split('.');
            let o = merged;
            for (let k = 0; k < parts.length - 1; k++) {
                if (o[parts[k]] == null) o[parts[k]] = {};
                o = o[parts[k]];
            }
            o[parts[parts.length - 1]] = val;
        };
        this.el.querySelectorAll('#texFields input').forEach(i => {
            const v = parseFloat(i.value);
            if (!isNaN(v)) setPath(i.dataset.path, v);
        });
        this.el.querySelectorAll('#texFields select').forEach(s => {
            // two selects carry non-string meanings; everything else is literal
            if (/\.level$/.test(s.dataset.path)) setPath(s.dataset.path, levelOfName(s.value));   // 1l.1: the written dynamic → its level
            else if (/\.pitch\.pool$/.test(s.dataset.path)) setPath(s.dataset.path, s.value === 'pooled');
            else if (/\.pitch\.set$/.test(s.dataset.path)) {
                setPath(s.dataset.path, s.value.indexOf('none') >= 0 ? null : s.value);
            } else setPath(s.dataset.path, s.value);
        });
        return merged;
    },

    // ------------------------------------------------------------- transport
    //
    // LGMF PLAN 1l.1 — THE ONE SOUND PATH. Every attack goes through the STRIKES DRAWER'S player, `StrikeDrawer.playNotes`, as the
    // sequence drawer's Hear does: a STRUCK note (docs/DYNAMICS_LAW.md §1) — the anchor of its written dynamic, remapped per
    // instrument and pitch through 1b's bank (bank/velocity_remap.json), the register's CC7 and the technique's CC0 30 ms ahead, a
    // just pitch bent by its cents, on MAIN; the seat and the route as the drawer resolves them. Before this, Texture sent a plain
    // velocity (level / 10 × 127) with CC7 pinned at 127 straight to the rack, bypassing the remap (§189). The drawer's `panic`
    // is the one stop path, as it was (`E.onStop` resets the Play button). The browser-timer drift meter went with the old loop.
    async play(which, from) {
        const src = (which === 'pin' && this.pinned) ? this.pinned : { result: this.result, tag: 'current' };
        if (!src.result) { this.generate(); src.result = this.result; }
        if (!src.result) return;
        if (!this.take) { this.setStatus('choose a harmony take first — the take button at the top: each player plays their own note of it', true); return; }
        await this.playResult(src.result, this.take.chord, src.tag + ' · take "' + this.take.name + '"', from);
    },
    // `from` (seconds on the lines view, 1l.2): play from that point — the notes before it are left out and the rest keep their times
    async playResult(result, chord, tag, from) {
        const D = SD();
        if (!D || typeof D.playNotes !== 'function') { this.setStatus('the strikes drawer is not on this page — its player is the one sound path', true); return false; }
        const b = this.notesOf(result, chord), t0 = Math.max(0, +from || 0);
        const notes = t0 > 0 ? b.notes.filter(n => n.t >= t0 - 1e-6).map(n => Object.assign({}, n, { onMs: Math.round((n.t - t0) * 1000) })) : b.notes;
        if (!notes.length) { this.setStatus('nothing to play' + (t0 > 0 ? ' after ' + t0.toFixed(2) + ' s' : '') + ' — ' + (this.silentText(b) || 'no attacks'), true); return false; }
        const btn = this.el.querySelector('#texPlay');
        btn.textContent = 'starting…';
        await D.playNotes(notes, 'texture · ' + tag);
        if (!E.isPlaying()) {
            btn.textContent = 'Play';
            const why = D.el && D.el.querySelector('#skStatus');
            this.setStatus('nothing sounded — the strikes drawer says: ' + ((why && why.textContent) || E._midiError || '?'), true);
            return false;
        }
        btn.textContent = 'Playing…';
        this.startCursor(t0);
        const s = this.silentText(b);
        this.setStatus('playing ' + notes.length + ' notes' + (t0 > 0 ? ' from ' + t0.toFixed(2) + ' s' : '') + ' · ' + tag + (s ? ' · ' + s : ''));
        return true;
    },

    // MORPH TO A MODEL (§7). A CATEGORY MORPH IS A DIAL MORPH BETWEEN TWO
    // MODELS — there is no separate morph machinery, which is why "rain becoming
    // a groove" and "jitter falling while scatter rises" are the same object.
    // Only the dials that actually DIFFER get a curve, so the resulting spec
    // reads as a list of what changed (the §6 two-sided contract, in data form).
    //
    // Where a pair SNAPS instead of crossfading (phase06 heard rain->stutter
    // snap), that is a finding to record per pair, not a bug to fix.
    morphTo() {
        if (!this.spec) return;
        const name = this.el.querySelector('#texMorphTo').value;
        const store = (this.models && this.models.models) || {};
        const dest = store[name];
        if (!dest) { this.setStatus('unknown model ' + name, true); return; }
        const secs = Math.max(1, parseFloat(this.el.querySelector('#texMorphSec').value) || 30);

        const spec = JSON.parse(JSON.stringify(this.spec));
        const dv = ((dest.spec.sections || [])[0] || {}).voices || [];
        const moved = [];
        (spec.sections || []).forEach(sec => {
            sec.dur = secs;
            (sec.voices || []).forEach((g, gi) => {
                const to = dv[Math.min(gi, dv.length - 1)] || {};
                const cur = {
                    bpm: g.bpm, jitterMs: g.jitterMs || 0,
                    scatter: g.scatter || 0, level: g.level != null ? g.level : 7.5,
                };
                const tgt = {
                    bpm: to.bpm != null ? to.bpm : cur.bpm,
                    jitterMs: to.jitterMs != null ? to.jitterMs : 0,
                    scatter: to.scatter != null ? to.scatter : 0,
                    level: to.level != null ? levelOfName(nameOfLevel(to.level)) : cur.level,   // 1l.1: onto a written dynamic
                };
                const curves = {};
                Object.keys(cur).forEach(k => {
                    if (Math.abs(cur[k] - tgt[k]) < 1e-9) return;
                    curves[k] = [{ t: 0, value: cur[k] }, { t: secs, value: tgt[k] }];
                    if (gi === 0) moved.push(k + ' ' + cur[k] + '→' + tgt[k]);
                });
                g.curves = Object.keys(curves).length ? curves : null;
            });
        });
        spec.name = (spec.name || 'texture') + '-to-' + name.toLowerCase();
        this.spec = spec;
        this._fieldStamp = this.active + '@' + this.rev;   // 1l.1: as a model click — a nudge after a morph keeps the morph
        this.humanized = false;
        this.renderSpec(spec);
        this.setStatus(moved.length
            ? ('morphing into ' + name + ' over ' + secs + ' s — moving: ' + moved.join(' · '))
            : ('nothing to morph: the current dials already match ' + name), !moved.length);
    },

    // PIN / A-B (plan §9) — the fix for ORDER EFFECTS. In the research batteries
    // the same setting drew opposite verdicts at different positions, because the
    // ear drifts across a long battery. P pins the current render as the
    // reference; A flips playback between pinned and current, back-to-back, in
    // the same position. Every comparison becomes pairwise and immediate: change
    // ONE thing — a dial, or only the seed — and flip.
    pin() {
        if (!this.result) return;
        const p = this.current() || {};
        this.pinned = {
            result: this.result,
            tag: (this.humanized ? 'H · ' : '') + this.active + ' seed ' +
                 ((this.spec && this.spec.seed) != null ? this.spec.seed : '?'),
            label: this.labelOf(this.spec),
        };
        this.abSide = 'cur';
        this.draw(this.spec);
        this.setStatus('pinned: ' + this.pinned.tag + ' — press A to flip against it');
    },
    flip() {
        if (!this.pinned) { this.setStatus('nothing pinned — press P first', true); return; }
        this.abSide = this.abSide === 'cur' ? 'pin' : 'cur';
        this.play(this.abSide);
    },

    // HUMANIZE (plan §9, R6) — the robustness pass. Re-renders the CURRENT spec
    // with the stage + human error model overlaid, auto-pinning the clean render
    // so A flips straight between them. The standing performance rule is that no
    // texture may depend on precise timing, so a keeper cannot be banked without
    // a verdict here (that gate lands with the stores in Phase 4).
    humanize() {
        if (!this.spec) return;
        if (this.humanized) {                    // toggle back to clean
            this.humanized = false;
            this.renderSpec(this.spec);
            this.setStatus('clean render — press H again for the humanized one');
            return;
        }
        this.pin();                              // the clean render becomes the reference
        this.humanized = true;
        this.renderSpec(this.spec);
        this.setStatus('HUMANIZED: stage ±' + TX.HUMANIZE.stageMs + ' ms (fixed, where they stand)' +
            ' + human ±' + TX.HUMANIZE.jitterMs + ' ms (per attack). Both are ESTIMATES.' +
            ' Press A to flip against the clean render.');
    },

    // ---------------------------------------------------------------- insert
    // 2w placement conventions: a groupId so it drags and scales as one unit, the
    // engine's own plain-language markers (R9), and a META shape so there is
    // something to GRAB. The META shape was missing in 2v's first
    // version — the group inserted and sounded fine but could not be
    // group-scaled, and only the phase gate caught it.
    //
    // LGMF PLAN 1l.1: the notes are what Play sounds (`notesOf`, the one translation), written as the STRIKES DRAWER writes a strike
    // (strike_drawer.js `insert`): on the player's score lane, `plain`, `recVel` = the anchor of the written dynamic (the score
    // remaps it as Hear did) and the height that anchor means, (anchor − 65) / 62; a just pitch as a drawn note carrying its cents
    // in `morphBend`, which takes a curve channel from the score's pool. A player the take gives nothing writes nothing. The META
    // shape goes on THIS piece's META lane (the tubas' was 10), one undo step, and the curve-channel map is dropped
    // (docs/DYNAMICS_LAW.md §4 — every tool that writes a curve event).
    insert() {
        const C = HOST();
        if (!C || !this.result) return;
        if (!this.take) { this.setStatus('choose a harmony take first — Insert writes each player\'s own note of it', true); return; }
        const b = this.notesOf(this.result, this.take.chord);
        if (!b.notes.length) { this.setStatus('nothing to insert — ' + (this.silentText(b) || 'no attacks'), true); return; }
        // SAME BUG, SAME LINE, FIXED THE SAME DAY (2026-08-17, day 14; found in
        // morph_panel, which this was copied from). `Composer.playheadTime` and
        // `Composer.currentTime` DO NOT EXIST; the app's accessor is `getTimeAtPlayhead()`.
        const at = (typeof C.getTimeAtPlayhead === 'function' && isFinite(C.getTimeAtPlayhead()))
            ? Math.max(0, C.getTimeAtPlayhead())
            : (C.playheadTime != null ? C.playheadTime : (C.currentTime || 0));
        const p = this.current() || {};
        let seq = 1;
        while (C.objects.some(o => o.groupId === 'grp-tex-' + String(seq).padStart(2, '0'))) seq++;
        const gid = 'grp-tex-' + String(seq).padStart(2, '0');
        if (typeof C.pushUndoState === 'function') C.pushUndoState();
        const label = this.labelOf(this.spec);
        const markers = this.result.objects.filter(o => o.type === 'marker');
        const shift = at - b.origin;       // 1l.2: the pattern's origin lands on the playhead — a time on the lines view is a time after it
        const starts = [];
        let maxEnd = at;
        b.notes.forEach(n => {
            const start = +(n.start + shift).toFixed(3), end = +(n.end + shift).toFixed(3), cents = +n.cents || 0;
            const lv = Math.max(0.05, Math.round(((Math.max(65, Math.min(127, n.vel)) - 65) / 62) * 100) / 10);
            starts.push(start); maxEnd = Math.max(maxEnd, end);
            C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: gid,
                startSeconds: start, endSeconds: end,
                nodes: [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
                color: '#3F7D5A', fillMode: 'bottom', opacity: 0.55, properties: {}, srcKind: 'texture',
                performanceNotes: 'TEXTURE ' + label + ' · take ' + this.take.name + ' · ' + n.dyn +
                    (n.partial != null ? ' · partial ' + n.partial + (cents ? ' · ' + (cents > 0 ? '+' : '') + Math.round(cents) + '¢ just' : '') : ''),
                sonifyNote: n.midi, technique: n.tech, ...(cents ? {} : { sonifyMode: 'plain' }), recVel: n.vel,
                ...(cents ? { morphBend: [[0, +cents.toFixed(2)], [+(end - start).toFixed(3), +cents.toFixed(2)]] } : {}) });
        });
        markers.forEach(m => C.objects.push({ id: 'mk-tex-' + (C.nextId++), type: 'marker', layer: 0, groupId: gid,
            time: +(m.time + shift).toFixed(3), label: m.label, color: m.color, performanceNotes: '', properties: {} }));

        // contour follows the texture's own ATTACK DENSITY — for a flat-level
        // field that is the shape the ear actually tracks, and it is what
        // place_gesture.js draws for density material (2w).
        const span = Math.max(0.05, maxEnd - at);
        const W = 12, prof = [];
        for (let w = 0; w < W; w++) {
            const a = at + (span * w) / W, z = at + (span * (w + 1)) / W;
            prof.push(starts.filter(t => t >= a && t < z).length);
        }
        const peak = Math.max(1, Math.max.apply(null, prof));
        const nds = prof.map((c, i) => ({
            pos: Math.round(((i + 0.5) / W) * 1000) / 1000,
            y: Math.max(0.4, Math.min(10, Math.round((c / peak) * 8 * 10) / 10)),
            smooth: 0.35,
        }));
        nds.unshift({ pos: 0, y: nds[0].y, smooth: 0.35 });
        nds.push({ pos: 1, y: nds[nds.length - 1].y, smooth: 0.35 });
        C.objects.push({
            id: 'wc-texmeta-' + seq, type: 'waveCurve', layer: METAL(), groupId: gid,
            startSeconds: +at.toFixed(3), endSeconds: +(at + span).toFixed(3),
            nodes: nds, segments: nds.slice(1).map(() => ({ model: 'bezier', slope: 0 })),
            color: '#3F7D5A', fillMode: 'bottom', opacity: 0.45,
            performanceNotes: 'TEXTURE ' + label + ' · take ' + this.take.name +
                ' — density contour (drag = move, edge/box = stretch)', properties: {},
        });
        C.lastInsertGroup = gid;
        if (C.curveDirty) C.curveDirty();
        if (C.renderAll) C.renderAll();
        if (C.markDirty) C.markDirty();
        if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();
        const s = this.silentText(b);
        this.setStatus('inserted ' + b.notes.length + ' notes at ' + at.toFixed(2) + ' s as ' + gid + ' · take "' + this.take.name + '"' + (s ? ' · ' + s : ''));
    },

    // ------------------------------------------------------------ LIVE (2ag)
    // A streaming scheduler, deliberately unlike play(): play() books every
    // note of a fixed render upfront; this books only a 160 ms lookahead and
    // reads the boxes each tick, so arrows and edits land on the NEXT attack
    // with no restart. Unseeded by design — a live instrument is not a render;
    // anything worth keeping gets written into the params file and rendered
    // seeded. D29 holds (no bend); CC7 pinned, dynamics ride velocity (D12).

    lvDefaults() {
        const bpms = [36, 54, 72, 90, 108, 132];   // the kept A–F rungs
        const seq = (name, jit, db) => ({ name, jitterMs: jit, dBpm: db, root: 48,
            steps: bpms.map(b => ({ bpm: b, players: META_LAYER })) });
        return { secsPerStep: 6, slot: 1,
                 seqs: [seq('smear A–F', 0, 0), seq('rain A–F', 45, 0),
                        seq('gallop A–F', 0, 2), seq('accretion', 0, 0), seq('scratch', 0, 0)] };
    },

    lvLoad(live) {
        this.lv.data = live ? JSON.parse(JSON.stringify(live)) : this.lvDefaults();
        if (!Array.isArray(this.lv.data.seqs) || !this.lv.data.seqs.length) this.lv.data = this.lvDefaults();
        const want = (this.lv.data.slot || 1) - 1;
        this.lv.slot = Math.max(0, Math.min(this.lv.data.seqs.length - 1, want));
        this.lvDraw();
    },

    lvSeq() { return this.lv.data ? this.lv.data.seqs[this.lv.slot] : null; },

    lvDraw() {
        const d = this.el, s = this.lvSeq();
        if (!s) return;
        const slots = d.querySelector('#texLvSlots');
        slots.innerHTML = '';
        this.lv.data.seqs.forEach((q, i) => {
            const b = document.createElement('button');
            b.textContent = q.name || ('S' + (i + 1));   // named, per the composer
            b.title = 'slot ' + (i + 1);
            b.style.cssText = 'margin:0 0 2px 3px;font-size:10px;padding:0 4px;' +
                (i === this.lv.slot ? 'background:#3F7D5A;color:#fff;border-color:#6fb98f' : '');
            b.addEventListener('click', () => this.lvSlot(i));
            slots.appendChild(b);
        });
        const steps = s.steps || [];
        if (this.lv.step >= steps.length) this.lv.step = 0;
        const grid = d.querySelector('#texLvGrid');
        const inp = 'style="width:100%;box-sizing:border-box;background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 2px"';
        grid.style.cssText = 'display:grid;grid-template-columns:24px 1fr 1fr 1fr;gap:3px;align-items:center;margin-top:5px';
        grid.innerHTML =
            '<span style="color:#9a9">#</span><span style="color:#9a9">bpm</span>' +
            '<span style="color:#9a9">players</span><span style="color:#9a9">offset</span>' +
            steps.map((st, i) =>
                '<span id="texLvH' + i + '" style="text-align:center;color:#9a9;border-radius:3px">' + (i + 1) + '</span>' +
                '<input id="texLvBpm' + i + '" type="number" step="1" value="' + (st.bpm != null ? st.bpm : 60) + '" ' + inp + '>' +
                '<input id="texLvPl' + i + '" type="number" step="1" min="1" max="' + META_LAYER + '" value="' + (st.players != null ? st.players : META_LAYER) + '" ' + inp + '>' +
                '<input id="texLvOff' + i + '" type="number" step="0.01" min="0" max="0.99" value="' + (st.offset || 0) + '" ' + inp + '>'
            ).join('');
        d.querySelector('#texLvJit').value = s.jitterMs || 0;
        d.querySelector('#texLvDb').value = s.dBpm || 0;
        d.querySelector('#texLvPitch').value = s.pitchMode || 'unison';
        d.querySelector('#texLvOrder').value = s.pitchOrder || 'ascending';
        if (this.lv.data.secsPerStep) d.querySelector('#texLvSecs').value = this.lv.data.secsPerStep;
        this.lvHilite();
        this.lvReadout();
    },

    lvSaveBoxes() {
        const d = this.el, s = this.lvSeq();
        if (!s) return;
        const n = (s.steps || []).length;
        s.steps = [];
        for (let i = 0; i < n; i++) s.steps.push({
            bpm: parseFloat(d.querySelector('#texLvBpm' + i).value) || 60,
            players: parseFloat(d.querySelector('#texLvPl' + i).value) || META_LAYER,
            offset: parseFloat(d.querySelector('#texLvOff' + i).value) || 0,
        });
        s.jitterMs = parseFloat(d.querySelector('#texLvJit').value) || 0;
        s.dBpm = parseFloat(d.querySelector('#texLvDb').value) || 0;
        s.pitchMode = (d.querySelector('#texLvPitch') || {}).value || 'unison';
        s.pitchOrder = (d.querySelector('#texLvOrder') || {}).value || 'ascending';
    },

    lvSlot(i) {
        this.lvSaveBoxes();          // box edits survive a slot round-trip (in memory only)
        this.lv.slot = i;
        this.lvDraw();
        if (this.lv.playing) this.lvLog('(slot)');   // a character change is a log event too
    },

    lvHilite() {
        if (!this.el) return;
        for (let i = 0; ; i++) {
            const h = this.el.querySelector('#texLvH' + i);
            if (!h) break;
            h.style.cssText = 'text-align:center;border-radius:3px;' +
                (i === this.lv.step ? 'background:#3F7D5A;color:#fff' : 'color:#9a9');
        }
    },

    lvStep(delta) {
        const len = ((this.lvSeq() || {}).steps || []).length || 1;
        this.lv.step = (this.lv.step + delta + len) % len;
        this.lvHilite();
        this.lvReadout();
        if (this.lv.playing) this.lvLog();       // arrows AND auto-run land here
    },

    // ------------------------------------------------- stopwatch log (2ag)
    // The log is the composer PERFORMING the ladder's shape by hand, captured
    // as data — paste it back to the AI and it renders as a fixed texture with
    // exactly those step durations (the 2f play-in pattern, at form level).
    lvLogLine(tag) {
        const p = this.lvParams();
        const t = ((performance.now() - this.lv.logT0) / 1000).toFixed(1);
        const ch = p.off > 0 ? 'offset ' + p.off
            : p.db > 0 ? 'gallop d' + p.db : (p.jit > 0 ? 'rain jit' + p.jit : 'smear');
        return t.padStart(6) + 's  step ' + (this.lv.step + 1) + '  ' + p.bpm + 'x' + p.players +
            ' = ' + (p.players * p.bpm / 60).toFixed(1) + '/s  ' + ch + (tag ? '  ' + tag : '');
    },
    lvLog(tag) {
        if (this.lv.logT0 == null) return;
        this.lv.log.push(this.lvLogLine(tag));
        this.lvLogDraw();
    },
    lvLogDraw() {
        const box = this.el.querySelector('#texLvLog');
        if (!box) return;
        box.style.display = this.lv.log.length ? '' : 'none';
        box.textContent = this.lv.log.join('\n');
        box.scrollTop = box.scrollHeight;
    },
    lvZero() {
        this.lv.logT0 = performance.now();
        this.lv.log = [];
        const seq = this.lvSeq() || {};
        this.lvLog('(zero · ' + (seq.name || 'S' + (this.lv.slot + 1)) + ')');
    },
    lvCopy() {
        if (!this.lv.log.length) { this.setStatus('log is empty — press 0 while LIVE', true); return; }
        const text = this.lv.log.join('\n');
        const done = () => this.setStatus('log copied (' + this.lv.log.length + ' lines)');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done,
                () => this.setStatus('clipboard refused — select the log text by hand', true));
        } else this.setStatus('no clipboard API — select the log text by hand', true);
    },

    lvParams() {
        const d = this.el, i = this.lv.step;
        const num = (id, fb) => {
            const el = d.querySelector('#' + id);
            const v = el ? parseFloat(el.value) : NaN;
            return isNaN(v) ? fb : v;
        };
        return {
            bpm: Math.max(1, num('texLvBpm' + i, 60)),
            players: Math.max(1, Math.min(META_LAYER, Math.round(num('texLvPl' + i, META_LAYER)))),
            jit: Math.max(0, num('texLvJit', 0)),
            db: Math.max(0, num('texLvDb', 0)),
            off: Math.max(0, Math.min(0.99, num('texLvOff' + i, 0))),
            pitchMode: (d.querySelector('#texLvPitch') || {}).value || 'unison',
            order: (d.querySelector('#texLvOrder') || {}).value || 'ascending',
        };
    },

    lvShuffle(n) {
        const a = [];
        for (let i = 0; i < n; i++) a.push(i);
        for (let i = n - 1; i > 0; i--) {
            const k = (Math.random() * (i + 1)) | 0;
            const t = a[i]; a[i] = a[k]; a[k] = t;
        }
        return a;
    },

    // PITCH PRESETS — lane j gets pitches(mode)[j], ascending across the stage.
    // Everything stays inside the staccato window 30-65; F1 (29) is below the
    // floor, which is why the F-A cluster starts at F#1. Ring caps measured
    // 2026-08-20: unison(C3) 142 · octaves 125 · fifths 122 · clusterFA 117.
    // VERT01 species — the ORIGINAL played voicings (bank/VERT01-NN.json),
    // literal, no octave doublings. In-range notes only: sp08 [.. 65,(66)],
    // sp27 [.. 64,(66)], sp30 [.. 61,(66)] each lose their cuivre-register 66,
    // which staccato cannot sound (the 30-65 trap).
    SPECIES: {
        sp01: [36, 44, 47, 48, 53, 55, 56, 64],
        sp08: [31, 42, 43, 65],
        sp27: [33, 34, 63, 64],
        sp30: [33, 39, 45, 47, 55, 57, 61],
        sp33: [34, 38, 39, 51, 53, 54],
    },

    lvPitches(mode, players, root) {
        let set;
        if (this.SPECIES[mode]) {
            set = this.SPECIES[mode];
        } else if (mode === 'octaves') {
            const pc = ((root % 12) + 12) % 12;
            set = [];
            for (let k = pc; k <= 65; k += 12) if (k >= 30) set.push(k);
        } else if (mode === 'fifths') {
            let k = ((root % 12) + 12) % 12;
            while (k < 30) k += 12;
            set = [];
            for (; k <= 65; k += 7) set.push(k);
        } else if (mode === 'clusterFA') {
            set = [30, 31, 33, 41, 42, 44, 45, 53, 55, 57];
        } else return new Array(players).fill(root);
        // spread the set over the lanes, ascending, low end thicker
        const out = [];
        for (let j = 0; j < players; j++) out.push(set[Math.floor(j * set.length / players)]);
        return out;
    },

    // ROTOR (the phase ladder): player j sits at (j·f mod 1) of the per-player
    // cycle. One number spans the taxonomy — f=1/players even (smear) · f=1/q
    // → q evenly spaced cluster-pulses · q>players rationals → uneven figures ·
    // tiny f → the cascade/decollage · irrational → never-repeating lumpy.
    // Per-player spacing stays 60/bpm regardless of f, so the BPM cap table is
    // untouched. offset 0 = OFF (the legacy even round-robin path).
    lvRotor(players, f) {
        const out = [];
        for (let j = 0; j < players; j++) out.push((j * f) % 1);
        return out;
    },
    // orientation only: distinct onset groups per cycle, merged at ~1/48 cycle
    lvRotorGroups(players, f) {
        const bins = new Set();
        this.lvRotor(players, f).forEach(x => bins.add(Math.round(x * 48) % 48));
        return bins.size;
    },

    // Δ>0 splits the players into two half-groups at bpm∓Δ/2 — the two-stream
    // structure that IS a gallop. lap = 60/(Δ × players-per-group): tempo does
    // not move the flutter, player count does.
    lvSplit(players, bpm, db) {
        if (!(db > 0) || players < 2) return [{ n: players, bpm: bpm, lane0: 0 }];
        const nA = Math.ceil(players / 2);
        return [{ n: nA, bpm: bpm - db / 2, lane0: 0 },
                { n: players - nA, bpm: bpm + db / 2, lane0: nA }];
    },

    async lvPlay() {
        if (this.lv.playing) { this.lvStop(); return; }
        const bad = this.preflight();
        if (bad.length) { this.setStatus('PREFLIGHT: ' + bad.join(' · '), true); return; }
        if (!this.lv.data) this.lvLoad(this.params && this.params.live);
        E.panic();
        if (!await E.ensureMidi()) { this.setStatus(E._midiError || 'MIDI unavailable', true); return; }

        const routes = [], missing = {};
        for (let L = 0; L < 10; L++) {
            const r = E.routeFor(L, 'staccato');
            routes.push(r || null);
            if (!r) {
                const C = HOST();
                const inst = C && C.trackInstrument ? C.trackInstrument(L) : null;
                missing[(inst && inst.port) || ('lane ' + L)] = 1;
            }
        }
        if (!routes.some(Boolean)) {
            this.setStatus('no MIDI port for ' + Object.keys(missing).join(', ') +
                ' — is loopMIDI running with those ports open?', true);
            return;
        }
        // CC7 pinned, same contract and same conversion point as play() (D12)
        routes.forEach(r => { if (r) try { r.out.send([0xB0 | r.ch, 7, 127]); } catch (e) {} });

        const seq = this.lvSeq() || {};
        const root = seq.root != null ? seq.root : 48;
        const vel = 95;                       // level 7.5 → velocity
        const LOOK = 160, NOTE = 120, TICK = 60;
        const st = { next: [performance.now() + 150, performance.now() + 150],
                     rr: [0, 0], cyc: performance.now() + 150, perm: null, dealt: 0 };
        this.lv.state = st;
        this.lv.skipped = 0;
        this.lv.playing = true;
        E._playing = true;
        const fire = (route, at, key) => {
            if (!route) { this.lv.skipped++; return; }
            const k = key != null ? key : root;
            E._timers.push(setTimeout(() => E.noteOn(route, k, vel),
                Math.max(0, at - performance.now())));
            E._timers.push(setTimeout(() => E.noteOff(route, k),
                Math.max(0, at + NOTE - performance.now())));
        };
        this.lv.tick = setInterval(() => {
            const now = performance.now();
            const p = this.lvParams();
            const laneP = this.lvPitches(p.pitchMode, p.players, root);
            // pitch ORDER: which note a lane sounds. Permutation state lives in
            // st so a mid-play order change (or re-pick) deals fresh.
            const pick = (lane) => {
                if (p.order === 'random') return laneP[(Math.random() * p.players) | 0];
                if (p.order === 'shuffled' || p.order === 'redeal') {
                    if (!st.perm || st.perm.length !== p.players) st.perm = this.lvShuffle(p.players);
                    return laneP[st.perm[lane]];
                }
                return laneP[lane];
            };
            const dealt = () => {                 // redeal: fresh permutation each full pass
                if (p.order !== 'redeal') return;
                if (++st.dealt >= p.players) { st.perm = this.lvShuffle(p.players); st.dealt = 0; }
            };
            if (p.off > 0) {
                // ROTOR mode — whole cycles are booked as they enter the look
                // window, so edits land on the NEXT CYCLE (up to 60/bpm late),
                // not the next attack. Δbpm is ignored while an offset is set.
                st.next[0] = now + LOOK; st.next[1] = now + LOOK;   // keep the group clocks fresh
                const T = 60000 / p.bpm;
                if (st.cyc < now) st.cyc = now + 100;               // stale after a mode switch
                while (st.cyc < now + LOOK) {
                    for (let j = 0; j < p.players; j++) {
                        fire(routes[j], st.cyc + ((j * p.off) % 1) * T +
                            (p.jit ? (2 * Math.random() - 1) * p.jit : 0), pick(j));
                        dealt();
                    }
                    st.cyc += T;
                }
                return;
            }
            st.cyc = now + LOOK;                                    // keep the rotor clock fresh
            const groups = this.lvSplit(p.players, p.bpm, p.db);
            for (let gi = 0; gi < 2; gi++) {
                const g = groups[gi];
                // a dormant group's clock rides just ahead of now, so raising Δ
                // mid-stream starts group B cleanly instead of draining a backlog
                if (!g) { st.next[gi] = now + LOOK; continue; }
                const iv = 60000 / (g.n * g.bpm);
                while (st.next[gi] < now + LOOK) {
                    const lane = g.lane0 + (st.rr[gi]++ % g.n);
                    fire(routes[lane], st.next[gi] + (p.jit ? (2 * Math.random() - 1) * p.jit : 0), pick(lane));
                    dealt();
                    st.next[gi] += iv;
                }
            }
        }, TICK);
        this.el.querySelector('#texLvGo').textContent = 'Stop';
        this.el.focus();                      // arrows work immediately
        this.lvZero();                        // clock runs from Live; 0 restarts it whenever ready
        this.lvReadout();
    },

    lvStop() {
        if (this.lv.tick) { clearInterval(this.lv.tick); this.lv.tick = null; }
        this.lvLog('(stop)');                // total duration, while logT0 is still live
        this.lv.playing = false;             // BEFORE panic — the onStop chain checks it
        if (this.lv.runT) this.lvRun();      // stopping also parks the auto-run
        E.panic();
        const b = this.el.querySelector('#texLvGo');
        if (b) b.textContent = 'Live';
        this.lvReadout();
    },

    // auto-run: one step every N seconds, wrapping. Works while stopped too —
    // it just walks the highlight, which is also how it gets verified silently.
    lvRun() {
        const b = this.el.querySelector('#texLvRun');
        if (this.lv.runT) {
            clearInterval(this.lv.runT); this.lv.runT = null;
            if (b) b.textContent = 'Run';
            return;
        }
        const secs = Math.max(1, parseFloat(this.el.querySelector('#texLvSecs').value) || 6);
        this.lv.runT = setInterval(() => this.lvStep(1), secs * 1000);
        if (b) b.textContent = '■';
    },

    lvReadout() {
        const out = this.el && this.el.querySelector('#texLvOut');
        if (!out || !this.lv.data) return;
        const p = this.lvParams();
        const rate = p.players * p.bpm / 60;
        const seq = this.lvSeq() || {};
        const len = ((seq.steps || []).length) || 1;
        let s = 'S' + (this.lv.slot + 1) + (seq.name ? ' "' + seq.name + '"' : '') +
            ' · step ' + (this.lv.step + 1) + '/' + len + ' · ' + p.bpm + ' BPM × ' + p.players +
            ' = <b>' + rate.toFixed(1) + '/s</b>';
        if (p.off > 0) {
            s += ' · offset ' + p.off + ' → ≈' + this.lvRotorGroups(p.players, p.off) +
                ' onset groups/cycle' + (p.db > 0 ? ' <span style="color:#777">(Δ ignored)</span>' : '');
        }
        else if (p.db > 0) s += ' · gallop Δ' + p.db + ', lap ~' + (60 / (p.db * Math.ceil(p.players / 2))).toFixed(1) + ' s';
        else if (p.jit > 0) s += ' · rain ±' + p.jit + ' ms';
        else s += ' · smear';
        // per-preset per-player caps (measured 2026-08-20; unison = C3)
        const CAPS = { unison: 142, octaves: 125, fifths: 122, clusterFA: 117,
                       sp01: 127, sp08: 117, sp27: 122, sp30: 130, sp33: 122 };
        if (p.pitchMode !== 'unison') s += ' · ' + p.pitchMode;
        if (p.order !== 'ascending' && p.pitchMode !== 'unison') s += ' (' + p.order + ')';
        const cap = CAPS[p.pitchMode] || 142;
        if (p.bpm > cap) s += ' <span style="color:#e0b062">&#9888; over the ' + cap +
            ' BPM ring cap for this pitch set</span>';
        else if (rate > 23) s += ' <span style="color:#e0b062">&#9888; past the ~23/s C3 ring ceiling</span>';
        if (this.lv.playing) s += ' · <b style="color:#8fd6ab">LIVE</b>';
        if (this.lv.skipped) s += ' · <span style="color:#e0b062">' + this.lv.skipped + ' skipped (no port)</span>';
        out.innerHTML = s;
    },

    setStatus(msg, bad, html) {
        const s = this.el.querySelector('#texStatus');
        if (!s) return;
        s.style.color = bad ? '#e06666' : '#9a9';
        if (html) s.innerHTML = msg; else s.textContent = msg;
    },
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => PANEL.init());
else PANEL.init();
root.TexturePanel = PANEL;
}(typeof self !== 'undefined' ? self : this));
