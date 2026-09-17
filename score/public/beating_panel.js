// beating_panel.js — THE BEATING PANEL (PLAN 1f step 4, 2026-09-07; the requirements in docs/BEATING_TOOL.md §6; the composer's
// picture RUNNING_LOG §147: "a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … I can slide one
// over … everything should have handles … hit space bar to play that configuration … audition that configuration over different
// durations"; the settled points of §156).
//
// A floating, draggable panel (the morph panel's chassis) holding a PATTERN of up to three pairs, one ROW each. In a row:
//   · the two players' RATE curves as mirror images above and below a centre line (beats per second, the heard beating = the gap);
//     the BAND between them filled and tinted by zone (flanger · beating · roughness); every point a handle on a rail (drag up /
//     down = the rate, left / right = its place; the ends stay at the ends); a shape from the menu (flat · ramp out · ramp in · hump ·
//     the long arc · burst) pops in; DRAW mode adds points by clicking (freehand, the trill's curve tool's gesture: points → the
//     line); the MIRROR LOCK on by default — drag one, the other mirrors; ALT-drag moves a curve alone; the body dragged sideways
//     slides the curve in time (the phase; both when locked); the rate in numbers at the handle while dragging;
//   · the CRESCENDO lane (the level 0 → 1, following the beating by default, or its own points from the menu / drawn);
//   · the BREATH lane per player: the marks as dotted go lines on sliders (drag to move — a hand mark, kept through a shuffle;
//     click to add; ALT-click to remove), the ceiling drawn as a bar from each mark and a warning past it, the three modes, a
//     shuffle (a new seed, the hand marks kept).
// A whole row slides in time against the others (the OFFSET rail). The DURATION box sets the pattern's length (the curves are over
// normalised time already; the marks scale, the breaths re-deal). SPACE with the panel open plays the pattern — all pairs, real
// time, timestamped through Composer.playBeatingEvents (the tick's own event path) — and stops on SPACE again. TAKES are named
// snapshots in bank/panel_snapshots.json (the `beatings` bucket, the strikes drawer's way).
// Two ways in: P on a selected beating BINDS the panel to that zone — its row IS the zone's block, every edit regenerates the zone
// live (debounced) — or the Beating button opens an empty pattern that lives in the panel until Insert (step 6).
// Composer, TRACKS, META_LAYER, INSTRUMENTS, BeatingCalc are script-level consts in composer.html — read as free identifiers.
(function (root) {
'use strict';

const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const BC_ = () => (typeof BeatingCalc !== 'undefined' ? BeatingCalc : (root.BeatingCalc || null));
const TRK = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const INST = () => (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : (root.INSTRUMENTS || {}));
const TAKES_PANEL = 'beatings';
const TAKE_NAME = /^[A-Za-z0-9._ -]{1,64}$/;
const MAX_ROWS = 3;
let W = 520;   // the row's drawing width — the page's, read at every render (a full-page drawer, 2026-09-07); 520 the floor
const HR = 150, HL = 50, HB = 56, PADL = 40, PADR = 12;   // the rate area, the level lane, the breath lane, the axis gutters
const ZONE_FILL = { flanger: 'rgba(150,150,170,0.22)', beating: 'rgba(123,63,228,0.30)', roughness: 'rgba(225,70,70,0.38)' };
const COL = { upper: '#ffb347', lower: '#69b7c9', level: '#7ec9a8', breath: '#e0e0e0', bad: '#e88' };
const SHAPES = [['adsr', 'hold'], ['hump', 'hump'], ['burst', 'burst'], ['arc', 'long arc'], ['rampOut', 'ramp out'], ['rampIn', 'ramp in'], ['flat', 'flat']];   // "hold" = the ADSR (2026-09-07)
// the dynamics (NAMING §2.9): the level 0 … 1 is ppp … fff in eight equal steps
const DYN = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
const dynName = h => DYN[Math.max(0, Math.min(7, Math.round(7 * (+h || 0))))];
const parseLevel = s => { s = String(s == null ? '' : s).trim().toLowerCase(); if (!s) return null; const i = DYN.indexOf(s); if (i >= 0) return Math.round(i / 7 * 1000) / 1000; const v = parseFloat(s); return isNaN(v) ? null : Math.max(0, Math.min(1, v)); };
// the pitch side (step 5): the keyboard as the strikes drawer draws it, the relations between the pairs (§148: "the thirds, fifths, and just
// Unison … the relationship could be between the three, could be fifths, could be thirds, could be something else"; §158: unison two ways)
const DB_URL = '/bank/scattered_strikes.json';
const SPAN = { lo: 36, hi: 96 }, FULL = { lo: 21, hi: 108 };
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK = [1, 3, 6, 8, 10];
const PC_PALETTE = ['#ffd479', '#7ec9a8', '#8ea9c9', '#c98a8a', '#b58ec9', '#d4c25e', '#69b7c9', '#c9986e', '#96c96e', '#c96ea8', '#8a8ac9', '#e0e0e0'];
const ROW_COLORS = ['#c9a8ff', '#ffb347', '#7ec9a8'];
// the keyboard's geometry (2026-09-07, the second pass of the pitch side, MORPH_NOTES §3 / RUNNING_LOG §179–181): the players' ordinary
// ranges as coloured columns at the left ("each in its own column on the keyboard. There's room to the left of the circle note
// indicators"), then the C labels, the note names, the keys, the chord's dots, the pairs' rings
const KB = { w: 236, top: 18, colX: 6, colGap: 6, colW: 3, cX: 40, nameX: 72, keyX: 76, whiteW: 90, blackW: 54, dotX: 152, ringX: 176 };
const INST_COL = { flute: '#ffd479', bass_clarinet: '#e08a8a', violin1: '#8ea9c9', violin2: '#69b7c9', viola: '#b58ec9', cello: '#7ec9a8' };
const SEED_KEEP = 8;   // the strikes drawer's U8: the last seeds as chips
const VOICING_DEFAULTS = () => ({ preset: 'original', seed: 1, oct: 0, below: 0, above: 0, hist: [] });
// the sequence (2026-09-07, the composer: "a length for the entire sequence and a play for the entire sequence … for each pair, there
// should be a length, a duration, and then the play for just that pair … a track for every pair … drag them like I can the trill zones")
const PRESET_SHAPES = ['adsr', 'flat', 'rampOut', 'rampIn', 'hump', 'arc', 'burst'];   // the menu's shapes: the level box pops them in again; a drawn one is scaled
const SEQ_H = 30;                 // a track's height in the sequence strip
const PAIRS_PANEL = 'beatingPairs';   // the pair takes' bucket in bank/panel_snapshots.json
const SHAPES_PANEL = 'beatingShapes';   // his stored shapes (normalised curves)
const RELATIONS = [['unison1', 'unison · 1 oct', 'every pair on the root, one octave (a field on one pitch — the tuba\'s bloom)'], ['unisonOcts', 'unison · octaves', 'the root\'s pitch class spread across octaves, a pair per octave'],
                   ['thirds', 'thirds', 'a stack of thirds from the root (root · +4 · +7)'], ['fourths', 'fourths', 'a stack of fourths (root · +5 · +10)'], ['fifths', 'fifths', 'a stack of fifths (root · +7 · +14)'], ['stack', 'stack', 'the typed stack: semitones above the root, one per pair']];
const parseNote = s => { s = String(s || '').trim(); if (!s) return null; if (/^\d+$/.test(s)) return +s; const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(s); if (!m) return null; const pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return (parseInt(m[3], 10) + 1) * 12 + pc; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r3 = v => Math.round(v * 1000) / 1000;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nn = m => BC_().noteName(m);

const P = {
    el: null, rows: [], length: 6, bound: null, takeList: {}, pairTakes: {}, shapesBank: {}, _timer: null, _aud: null, _drag: null, status: '',
    focus: 'sequence',   // what SPACE plays: 'sequence' | 'pair' (the active row) | 'chord' — set by where he last clicked
    loop: false, _loopArgs: null, seqSpan: null, _undo: null, _prevHarmony: null, _keepRows: false, pxPerS: null,
    db: null, banks: null, harmony: null, collapsed: {}, chord: [], chordId: '', armed: null, armedIdx: null, activeRow: 0, show88: false, rootMode: false, relation: 'unison1',
    voicing: VOICING_DEFAULTS(),   // the sonority's voicing: the preset, the seed, the octave box, the octave range (saved with the take)

    // ------------------------------------------------------------------ the chassis
    init() {
        if (this.el) return;
        // THE CHASSIS: a full-page drawer from the bottom, the strikes drawer's (composer, 2026-09-07: "lets make the panel full page like
        // strikes" — the floating box at the top right was not found); ⇕ half / full as the drawer's, a tab at the bottom when closed
        this.restore();
        const d = document.createElement('div');
        d.id = 'beatingPanel';
        d.style.cssText = ['position:fixed', 'left:0', 'right:0', 'bottom:0', 'height:100vh', 'z-index:9000', 'background:#1b1b20', 'border-top:2px solid #7B3FE4',
            'padding:0 12px 8px', 'color:#ddd', 'font:13px/1.45 system-ui,sans-serif', 'box-shadow:0 -8px 30px rgba(0,0,0,.6)', 'display:none', 'flex-direction:column', 'overflow:hidden'].join(';');
        d.innerHTML = [
            '<div id="bpDrag" style="font-weight:600;color:#c9a8ff;margin:0 -12px 8px;padding:7px 12px;border-bottom:1px solid #444;background:rgba(123,63,228,0.18);display:flex;gap:10px;align-items:center">BEATING',
            '<span id="bpTitle" style="font-weight:400;color:#aaa"></span><span style="flex:1 1 auto"></span>',
            '<button id="bpFull" title="full page height / half" style="font-size:12px;cursor:pointer">&#8597; half</button>',
            '<span id="bpClose" title="close (ESC)" style="cursor:pointer;color:#888;font-size:18px;padding:0 4px">&#10005;</span></div>',
            '<div id="bpStatus" style="color:#9a9;margin-bottom:6px;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>',
            '<div id="bpHead" style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin-bottom:6px">',
            '<label title="the timeline&#8217;s own span (room to drag the pairs into) &#8212; never shorter than the last pair&#8217;s end">timeline <input id="bpLen" type="number" step="1" min="1" max="600" style="width:56px"> s</label>',
            '<button id="bpAdd" title="another pair (up to three) &#8212; born empty: double-click a note on the keyboard, then its node">+ pair</button>',
            '<button id="bpPlay" title="the whole sequence: all pairs at their offsets (the strip&#8217;s mute and solo apply), through the score&#8217;s MIDI path">&#9654; sequence</button>',
            '<button id="bpStop">&#9632; stop</button>',
            '<button id="bpLoop" title="loop: the play goes round until stop &#8212; adjust while it plays, every round takes the edits">&#10227; loop</button>',
            '<button id="bpUndo" title="undo the last edit in the drawer (one level) &#8212; CTRL+Z while the drawer is open does the same">&#8630; undo</button>',
            '<span style="display:inline-flex;gap:2px;align-items:center;color:#888" title="the lanes&#8217; time window, shared by every pair (the sequence timeline: the same second is the same x in every row); ALT + wheel over a lane zooms at the mouse, a horizontal wheel scrolls; fit = the sequence fills the width"><button id="bpZoomOut">&#8722;</button><span id="bpZoomLbl" style="min-width:64px;text-align:center">fit</span><button id="bpZoomIn">+</button><button id="bpZoomFit">fit</button></span>',
            '<button id="bpHelp" title="every gesture of the drawer, on one card">? gestures</button>',
            '<span id="bpSpace" style="color:#9a9" title="what SPACE plays — the sequence, the active pair, or the chord — set by where you last clicked; SPACE while playing stops"></span>',
            '<span style="margin-left:auto"></span>',
            '<input id="bpTakeName" type="text" placeholder="take name" style="width:110px" title="ENTER saves">',
            '<button id="bpTakeSave" title="save this pattern as a named take in bank/panel_snapshots.json">save take</button>',
            '<select id="bpTakeSel" style="max-width:130px"><option value="">load take&#8230;</option></select>',
            '<button id="bpTakeDel" title="delete the named take">&#10005;</button>',
            '<button id="bpInsert" title="Insert @ playhead: the pattern into the score as its beatings under one group with a META shape (the crescendo&#8217;s mean); the same panel inserting again at the same time replaces its earlier insert, elsewhere makes another; nothing around it touched">insert @ playhead</button>',
            '</div>',
            // THE PITCH SIDE (step 5, §148 / §158): the strikes menu → the keyboard; a note armed by a click lands on the pair whose row is
            // clicked next (or is dragged onto it) as the pair's LOWER note; the relations deal every pair's pitch from a root
            '<div id="bpPitch" style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:6px;padding:4px 6px;border:1px solid #3a3a44;border-radius:4px">',
            '<button id="bpHear" title="hear the chord alone, on the piano voice (CN-36)">&#9654; chord</button>',
            '<span id="bpChordName" style="color:#c9a8ff;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>',
            '<span style="color:#888">relation</span>',
            '<span id="bpRel"></span>',
            '<input id="bpStack" type="text" value="0 7 12" style="width:64px" title="a typed stack: semitones above the root, one per pair">',
            '<label>root <input id="bpRoot" type="text" placeholder="C4 or 60" style="width:56px" title="a note name or MIDI number; or click a key with root mode on"></label>',
            '<button id="bpDeal" title="deal the pairs&#8217; pitches from the root by the relation, folded into the pairs&#8217; ranges, from the bottom up">deal</button>',
            '<button id="bpAuto" title="deal the sonority to the pairs without a note, low to high (SHIFT: every pair again)">auto-assign</button>',
            '<button id="bpRevert" title="back to the previous harmony, voicing and assignments (one level)">revert</button>',
            '<label title="the whole piano instead of the ensemble&#8217;s span"><input id="bp88" type="checkbox"> 88</label>',
            '<span id="bpArmed" style="color:#c9a8ff"></span>',
            '</div>',
            // THE VOICING BAR (2026-09-07, MORPH_NOTES §3): the strikes drawer's presets over the sonority; the OCTAVE box moves the whole
            // sonority; the octave RANGE is the window every note may scatter within on a reshuffle; the seeded reshuffle with its chips
            '<div id="bpVoice" style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:6px;padding:4px 6px;border:1px solid #3a3a44;border-radius:4px">',
            '<span style="color:#888">voicing</span><span id="bpVBtns"></span>',
            '<label title="the octave box: the whole sonority moved by octaves">oct <input id="bpOct" type="number" min="-3" max="3" step="1" value="0" style="width:44px"></label>',
            '<label title="the octave range: every note may scatter this many octaves below &#8230; above the octave box&#8217;s octave (a reshuffle deals the scatter)">range &#8722;<input id="bpBelow" type="number" min="0" max="3" step="1" value="0" style="width:40px"> &#8230; +<input id="bpAbove" type="number" min="0" max="3" step="1" value="0" style="width:40px"></label>',
            '<button id="bpVRe" title="a different realization of the same voicing preset &#8212; a new seed; with an octave range the notes scatter inside it">&#8635; reshuffle voicing</button>',
            '<span id="bpSeeds"></span>',
            '</div>',
            // THE SEQUENCE STRIP (2026-09-07): a track per pair, the pair a zone drawn with its heard-beating curve — dragged in time, stretched
            // at its right edge, started later at its left edge (the trill zones' handling); the rows follow live
            '<div id="bpSeqWrap" style="flex:0 0 auto;margin-bottom:6px;border:1px solid #3a3a44;border-radius:4px;background:#1a1a20;overflow:hidden"><svg id="bpSeq" style="display:block"></svg></div>',
            // the body: three columns, each scrolling on its own — the harmonies on the left in banners (CN-36, the strikes drawer's list), the
            // keyboard, the rows; over them the LINES from the assigned keys to the pairs' nodes (the strikes drawer's dotted lines)
            '<div id="bpBody" style="flex:1 1 auto;display:flex;gap:8px;overflow:hidden;min-height:0;margin:0 -4px;padding:0 4px;position:relative">',
            '<div id="bpList" style="flex:0 0 260px;overflow-y:auto;min-height:0;border-right:1px solid #333;padding:2px 0"></div>',
            '<div id="bpKbWrap" style="flex:0 0 ' + KB.w + 'px;overflow-y:auto;min-height:0"><div id="bpKbLegend" style="font-size:10px;color:#888;padding:0 0 2px 4px;white-space:nowrap"></div><svg id="bpKb" width="' + KB.w + '" style="display:block"></svg></div>',
            '<div id="bpRows" style="flex:1 1 auto;min-width:0;overflow-y:auto;min-height:0"></div>',
            '<svg id="bpLines" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible"></svg>',
            '</div>',
        ].join('');
        document.body.appendChild(d);
        this.el = d;
        const tab = document.createElement('div');
        tab.id = 'beatingTab'; tab.textContent = 'BEATING ▴'; tab.title = 'open the beating panel';
        tab.style.cssText = 'position:fixed;right:124px;bottom:0;z-index:8999;background:#2e1f4a;color:#d9c8ff;border:1px solid #7B3FE4;border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:14px system-ui,sans-serif;letter-spacing:.04em';
        tab.addEventListener('click', () => this.toggle());
        document.body.appendChild(tab);
        d.querySelector('#bpFull').addEventListener('click', () => { this.cfg.full = !this.cfg.full; this.save(); this.applyHeight(); this.render(); });
        window.addEventListener('resize', () => { if (this.isOpen()) this.render(); });
        this.applyHeight();
        d.querySelector('#bpClose').addEventListener('click', () => this.close());
        d.querySelector('#bpAdd').addEventListener('click', () => this.addRow());
        d.querySelector('#bpPlay').addEventListener('click', () => { this.setFocus('sequence'); this.play(); });
        d.querySelector('#bpStop').addEventListener('click', () => this.stop());
        d.querySelector('#bpSeq').addEventListener('mousedown', ev => { if (ev.target === ev.currentTarget || ev.target.tagName === 'line' || ev.target.tagName === 'text') this.setFocus('sequence'); });
        d.querySelector('#bpLen').addEventListener('change', ev => this.setLength(parseFloat(ev.target.value)));
        d.querySelector('#bpTakeSave').addEventListener('click', () => this.saveTake());
        d.querySelector('#bpTakeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveTake(); });
        d.querySelector('#bpTakeSel').addEventListener('change', ev => { if (ev.target.value) this.loadTake(ev.target.value); ev.target.value = ''; });
        d.querySelector('#bpTakeDel').addEventListener('click', () => this.deleteTake());
        d.querySelector('#bpInsert').addEventListener('click', () => this.insert());
        // the pitch side's controls
        d.querySelector('#bpHear').addEventListener('click', () => { this.setFocus('chord'); this.hearChord(); });
        d.querySelector('#bpRel').innerHTML = RELATIONS.map(([k, l, t]) => '<button class="bpRelBtn" data-rel="' + k + '" title="' + esc(t) + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer">' + l + '</button>').join('');
        d.querySelectorAll('.bpRelBtn').forEach(b => b.addEventListener('click', () => { this.relation = b.dataset.rel; this.rootMode = true; this.paintRelation(); this.setStatus('relation ' + b.textContent + ' — click a key for the root (or type it) and deal'); }));
        d.querySelector('#bpDeal').addEventListener('click', () => { this.snapshot(); this.deal(); });
        d.querySelector('#bpAuto').addEventListener('click', ev => this.autoAssign(ev.shiftKey));
        d.querySelector('#bpRevert').addEventListener('click', () => this.revertHarmony());
        d.querySelector('#bpUndo').addEventListener('click', () => this.undo());
        d.querySelector('#bpHelp').addEventListener('click', () => this.showGestures());
        d.querySelector('#bpZoomOut').addEventListener('click', () => this.zoomBy(1 / 1.5));
        d.querySelector('#bpZoomIn').addEventListener('click', () => this.zoomBy(1.5));
        d.querySelector('#bpZoomFit').addEventListener('click', () => { this.pxPerS = null; this.viewStart = 0; this.render(); this.setStatus('the lanes fit the sequence; every row on the same timeline'); });
        // CTRL+Z while the drawer is open is the drawer's undo, wherever the focus sits (the score's undo would answer otherwise)
        window.addEventListener('keydown', ev => {
            if (!(ev.ctrlKey || ev.metaKey) || ev.shiftKey || (ev.key !== 'z' && ev.key !== 'Z') || !this.isOpen()) return;
            const t = ev.target; if (t && t.matches && t.matches('input[type=text], textarea')) return;
            ev.preventDefault(); ev.stopPropagation(); this.undo();
        }, true);
        d.querySelector('#bpLoop').addEventListener('click', () => { this.loop = !this.loop; const bt = d.querySelector('#bpLoop'); bt.style.background = this.loop ? '#7B3FE4' : ''; bt.style.color = this.loop ? '#fff' : ''; this.setStatus(this.loop ? 'loop on — the play goes round until stop; edits take effect at every round' : 'loop off'); if (!this.loop) this._loopArgs = null; });
        d.querySelector('#bpRoot').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.deal(); });
        d.querySelector('#bp88').addEventListener('change', ev => { this.show88 = ev.target.checked; this.applyVoicing(); });
        // the voicing bar
        d.querySelector('#bpVBtns').innerHTML = BC_().VOICINGS.map(([k, l]) => '<button class="bpV" data-v="' + k + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer">' + l + '</button>').join('');
        d.querySelectorAll('.bpV').forEach(b => b.addEventListener('click', () => { this.voicing.preset = b.dataset.v; this.applyVoicing(); this.setStatus('voicing ' + b.textContent + (this.voicing.oct ? ' · oct ' + (this.voicing.oct > 0 ? '+' : '') + this.voicing.oct : '') + ((this.voicing.below || this.voicing.above) ? ' · range −' + this.voicing.below + ' … +' + this.voicing.above : '') + ' · seed ' + this.voicing.seed + ' — the pairs holding a note of the sonority follow it'); }));
        d.querySelector('#bpOct').addEventListener('change', ev => { this.voicing.oct = clamp(Math.round(+ev.target.value || 0), -3, 3); this.applyVoicing(); });
        d.querySelector('#bpBelow').addEventListener('change', ev => { this.voicing.below = clamp(Math.round(+ev.target.value || 0), 0, 3); this.applyVoicing(); });
        d.querySelector('#bpAbove').addEventListener('change', ev => { this.voicing.above = clamp(Math.round(+ev.target.value || 0), 0, 3); this.applyVoicing(); });
        d.querySelector('#bpVRe').addEventListener('click', () => { this.useSeed(this.nextSeed()); this.setStatus('voicing reshuffled — seed ' + this.voicing.seed + ((this.voicing.below || this.voicing.above) ? ', the notes scattered −' + this.voicing.below + ' … +' + this.voicing.above + ' octaves around oct ' + this.voicing.oct : (this.voicing.preset === 'original' ? ' (original with no octave range: nothing to scatter — set a range)' : '')) + '; the earlier seeds are the chips'); });
        d.querySelector('#bpKbWrap').addEventListener('scroll', () => this.renderLines());
        d.querySelector('#bpRows').addEventListener('scroll', () => this.renderLines());
        d.setAttribute('tabindex', '0');
        d.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z') && !(e.target.matches && e.target.matches('input[type=text], textarea'))) { e.preventDefault(); e.stopPropagation(); this.undo(); return; }   // the drawer's own undo, not the score's
            if (e.target.matches('input,select,textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (this.armed != null || this.rootMode) { this.armed = null; this.rootMode = false; this.render(); this.setStatus('disarmed'); } else this.close(); }
        });
        // SPACE while the panel is open = the pattern, never the transport (the strikes drawer's rule, capture phase: the score
        // blurs selects and number inputs on change and would hand SPACE to the transport); text entry keeps its SPACE
        window.addEventListener('keydown', ev => {
            if (ev.code !== 'Space' || !this.el || this.el.style.display === 'none') return;
            const t = ev.target, m = q => !!(t && t.matches && t.matches(q));
            if (m('textarea, input[type=text], input[type=search], input:not([type])')) return;   // text entry keeps its SPACE
            if (m('select, button, input[type=number]')) t.blur();   // a number box never traps SPACE (composer, 2026-09-07)
            ev.preventDefault(); ev.stopPropagation();
            this.spaceBar();
        }, true);
    },
    // the height: full page or half, remembered in the browser (the strikes drawer's way)
    cfg: { full: true },
    save() { try { localStorage.setItem('septet.beatingPanel.v1', JSON.stringify(this.cfg)); } catch (e) {} },
    restore() { try { const s = JSON.parse(localStorage.getItem('septet.beatingPanel.v1') || 'null'); if (s) Object.assign(this.cfg, s); } catch (e) {} },
    applyHeight() {
        if (!this.el) return;
        const full = this.cfg.full !== false;
        this.el.style.height = full ? '100vh' : '62vh';
        const b = this.el.querySelector('#bpFull'); if (b) b.innerHTML = full ? '&#8597; half' : '&#8597; full';
    },
    bringToFront() {
        let z = 9000;
        document.querySelectorAll('div[id$="Panel"]').forEach(p => { if (p === this.el || p.style.display === 'none') return; const pz = parseInt(window.getComputedStyle(p).zIndex, 10); if (!isNaN(pz) && pz >= z) z = pz + 1; });
        this.el.style.zIndex = String(z);
    },
    setStatus(msg, bad) { this.status = msg; const s = this.el && this.el.querySelector('#bpStatus'); if (s) { s.textContent = msg; s.title = msg; s.style.color = bad ? '#e88' : '#9a9'; } },
    isOpen() { return !!this.el && this.el.style.display !== 'none'; },
    show() { this.init(); this.el.style.display = 'flex'; this.bringToFront(); this.applyHeight(); this.el.focus(); this.refreshTakes(); const b = document.getElementById('beatingBtn'); if (b) { b.style.background = '#3a2a5a'; b.style.color = '#d9c8ff'; } const tab = document.getElementById('beatingTab'); if (tab) tab.style.display = 'none'; },
    close() { if (!this.el) return; this.stop(); this.closeNodeEditor(); this.el.style.display = 'none'; const b = document.getElementById('beatingBtn'); if (b) { b.style.background = ''; b.style.color = ''; } const tab = document.getElementById('beatingTab'); if (tab) tab.style.display = ''; },
    toggle() { this.init(); if (this.isOpen()) { this.close(); return; } const C = C_(), sel = C && C.selectedObject; if (sel && sel.type === 'zone' && sel.midiModel === 'beating') this.openFor(sel); else this.openNew(); },

    // ------------------------------------------------------------------ the two ways in
    // P on a beating: the panel is BOUND to the zone — the row's block is the zone's own, edits regenerate it live
    openFor(zone) {
        this.init(); const C = C_();
        this.bound = zone; C.ensureBeating(zone);
        // a beating of a pattern (step 6): the whole group comes in — every beating with its groupId, a row each, their offsets from the first
        const mates = zone.groupId ? C.objects.filter(o => o.type === 'zone' && o.midiModel === 'beating' && o.groupId === zone.groupId).sort((a, b) => a.startTime - b.startTime) : [zone];
        const first = mates[0].startTime;
        this.patternGroupId = zone.groupId || null; this.insertAt = null;
        this.boundFirst = first;
        this.rows = mates.map(z => { C.ensureBeating(z); return this.mkRow(z.layer, z.beating, r3(z.startTime - first), z, r3(Math.max(0.1, z.endTime - z.startTime))); });
        this.length = this.seqLength();
        this.activeRow = 0; this.armed = null; this.armedIdx = null; this.voicing = VOICING_DEFAULTS(); this.focus = 'pair';
        this.show(); this.render();
        this.setStatus((mates.length > 1 ? 'bound to the pattern ' + zone.groupId + ' (' + mates.length + ' pairs) — every edit regenerates its beatings; insert replaces it in place' : 'bound to ' + C.beatingLabel(zone) + ' — every edit regenerates it') + '; SPACE plays; ESC closes');
        // a beating born on a strike note opens on that strike's chord (the strike by the note's id, its group, or its time)
        this.loadDb().then(() => { const s = this.strikeFor(zone); this._keepRows = true; try { if (s) this.pickSource(s.id); else this.drawKeyboard(); } finally { this._keepRows = false; } });
    },
    // the Beating button with nothing bound: an empty pattern that lives here until Insert (step 6)
    openNew() {
        this.init(); const C = C_();
        this.bound = null; this.patternGroupId = null; this.insertAt = null; this.boundFirst = null; this.focus = 'sequence';
        // the starting point (§160, kept as a convenience): a selected strike note gives the first row its pitch and the insert its time — no link
        const sel = C && C.selectedObject, note = (sel && sel.type === 'waveCurve' && sel.sonifyNote != null && sel.layer < METAL() && sel.layer !== 2) ? sel : null;
        if (!this.rows.length || this.rows.some(r => r.zone) || note) { this.rows = []; const r = this.defaultRow(note ? note.layer : (C ? C.activeLane : 3)); if (r) this.rows.push(r); }
        if (note && this.rows[0]) {   // the note folds as a unit for the pair (§180); a partner that reaches it as written is preferred
            const r = this.rows[0]; r.b.noteIndex = null; r.b.srcPitch = note.sonifyNote;
            if (!this.rowFold(r, note.sonifyNote)) { const c = C.beatingPartnerCandidates(r.layer, note.sonifyNote, 'unison'); if (c.length) r.b.partnerLayer = c[0].layer; }
            this.refold(r);
            this.insertAt = r3(note.startSeconds);
        }
        this.activeRow = 0; this.armed = null; this.armedIdx = null; this.voicing = VOICING_DEFAULTS();
        this.show(); this.render();
        this.setStatus(this.rows.length ? 'a new pattern' + (note ? ' from the strike note ' + nn(note.sonifyNote) + ' at ' + note.startSeconds.toFixed(2) + ' s (its pitch on the first pair, its onset the insert time — no link)' : '') + ' — pick a strike or deal a relation for the pitches, shapes pop in from the menu, SPACE plays it, insert puts it in the score' : 'no pair can be made on this lane', !this.rows.length);
        this.loadDb().then(() => this.drawKeyboard());
    },
    mkRow(layer, b, offset, zone, length) { return { layer, b, offset: offset || 0, length: r3(Math.max(0.1, +length || this.length || 6)), zone: zone || null, locked: true, levelLock: true, mute: false, solo: false, draw: false, scale: 6, out: null }; },
    // a new pair on a lane: the partner the nearest lane that can pair on the lane's middle note — never a player already in the
    // pattern (a player in two pairs would carry two bend streams on one channel: a sum, wrong); the rows warn if it happens by hand
    defaultRow(layer, used) {
        const C = C_(), BC = BC_(); if (!C || !BC) return null;
        const M = METAL(); if (layer == null || layer >= M || layer === 2) layer = 3;
        const me = TRK()[layer] && TRK()[layer].instKey; if (!me) return null;
        // born EMPTY (2026-09-07, his walk-through line 5: "before I choose my instruments, I'll assign a pitch"): no note until he
        // assigns one; the partner the nearest free bending lane; the birth shape the ADSR at 3 Hz over 9 s
        const free = [0, 1, 3, 4, 5, 6].filter(L => L !== layer && !(used && used.has(L)));
        free.sort((a, c) => Math.abs(a - layer) - Math.abs(c - layer) || a - c);
        const b = C.beatingDefaults(layer, 0, null, free.length ? free[0] : null);
        return this.mkRow(layer, b, 0, null, 9);
    },
    usedLayers(except) { const used = new Set(); this.rows.forEach(r => { if (r === except) return; used.add(r.layer); if (r.b.partnerLayer != null) used.add(r.b.partnerLayer); }); return used; },
    addRow() {
        if (this.rows.length >= MAX_ROWS) { this.setStatus('three pairs at most (the six bending players)', true); return; }
        if (this.bound && !this.patternGroupId) { this.setStatus('a lone beating is one pair — for a pattern of several open a new pattern (Beating with nothing selected), or insert this one and add to its group', true); return; }
        const used = this.usedLayers();
        const free = [0, 1, 3, 4, 5, 6].filter(L => !used.has(L));
        let r = null; for (const L of free) { r = this.defaultRow(L, used); if (r) break; }
        if (!r) { this.setStatus('no free pair — every bending player is in the pattern', true); return; }
        this.rows.push(r); this.render();
    },
    removeRow(i) { if (this.bound) return; this.rows.splice(i, 1); this.render(); },

    // ------------------------------------------------------------------ the math per row (the panel's lines) and the objects
    rowSpec(row) {
        const C = C_();
        const z = row.zone || { layer: row.layer, startTime: 0, endTime: row.length, beating: row.b, id: 'bp-row' };
        return C.beatingSpec(z);
    },
    rowOut(row) { const BC = BC_(); row.out = BC.renderPair(this.rowSpec(row), INST()); return row.out; },
    // an edit: the row's lines at once; the bound zone regenerated after a short pause (a drag fires many)
    changed(row, now) {
        this.rowOut(row);
        if (row.zone) {
            const C = C_();
            clearTimeout(this._timer);
            const go = () => { C.regenerateBeating(row.zone); C.renderZone(row.zone); C.markDirty(); };
            if (now) go(); else this._timer = setTimeout(go, 120);
        }
    },
    // ---- the sequence: every pair has its own length and offset; the sequence is as long as the last pair's end ----
    seqLength() { return r3(Math.max(0.1, ...this.rows.map(r => (r.offset || 0) + (r.length || 0)), 0.1)); },
    // the timeline's own span (his line 20: "that timeline could have an independent duration"): room to drag the pairs into; never
    // shorter than the content; the pairs are not stretched by it
    setLength(v) {
        if (!(v > 0)) return;
        this.seqSpan = r3(Math.max(v, this.seqLength()));
        this.render();
        this.setStatus('timeline ' + this.seqSpan + ' s' + (this.seqSpan > v ? ' (the pairs reach ' + this.seqLength() + ' s)' : '') + ' — the pairs keep their lengths; drag them in the strip');
    },
    // one pair's own duration: the same shapes over it (the composer, 2026-09-07: "keep the custom shape and just change the duration")
    setRowLength(row, v) {   // the typed length trims or extends the END; the nodes keep their time
        if (!(v > 0)) return;
        this.resizeKeepTimes(row, v, false);
        this.changed(row, true); this.render();
    },
    // a bound zone follows its row's offset and length in the score (the group's first start is the origin)
    placeZone(row) {
        if (!row.zone) return;
        const first = this.boundFirst != null ? this.boundFirst : row.zone.startTime - (row.offset || 0);
        row.zone.startTime = r3(first + (row.offset || 0)); row.zone.endTime = r3(row.zone.startTime + row.length);
    },
    // the level box (the "to" rate): a preset shape pops in again at the new level; a drawn or dragged shape is SCALED to it — the composer,
    // 2026-09-07: "Can I have the new beating level keep the custom shape" (it used to pop a burst in)
    setLevel(row, to) {
        const BC = BC_(), b = row.b; b.rateTo = to;
        const unlocked = !!(b.rate && b.rate.lower && b.rate.upper);
        // the level box SCALES the curve as it is — every node keeps its time, the shape its proportions (2026-09-07 night: "typing in a new
        // hz max changes the whole curve" — the hold shape was popped in again from its defaults); a curve at zero takes a flat at the level
        const out = this.rowOut(row);
        if (!(out.maxBeat > 1e-6)) { this.popShape(row, PRESET_SHAPES.includes(b.shape) ? b.shape : 'flat'); return; }
        const k = to / out.maxBeat;
        if (unlocked) { b.rate.lower = BC.scaleCurve(b.rate.lower, k); b.rate.upper = BC.scaleCurve(b.rate.upper, k); }
        else b.beat = BC.scaleCurve(BC.curveOf(this.heardCurve(row)), k);
        // the shape keeps its name (a scaled hold is still the hold — its attack and release boxes stay)
    },
    // what SPACE plays (2026-09-07: "somehow I listen to the entire sequence with space … if I'm working with a pair, I just listen to the
    // pair with space. And if I'm in the chord shapes, I just listen to the chord with space")
    setFocus(f) { this.focus = f; this.paintFocus(); },
    paintFocus() { const s = this.el && this.el.querySelector('#bpSpace'); if (!s) return; const f = this.focus || 'sequence'; s.textContent = 'space → ' + (f === 'pair' ? 'pair ' + (this.activeRow + 1) : f === 'chord' ? 'chord' : 'sequence'); },
    spaceBar() {
        if (this._aud) { this.stop(); return; }
        const f = this.focus || 'sequence';
        if (f === 'chord') this.hearChord(); else if (f === 'pair' && this.rows[this.activeRow]) this.playRow(this.activeRow); else this.play();
    },

    // ------------------------------------------------------------------ the rendering
    render() {
        if (!this.el) return;
        const C = C_(), BC = BC_();
        this.length = this.seqLength();
        if (this.seqSpan && this.seqSpan < this.length) this.seqSpan = null;
        this.el.querySelector('#bpLen').value = this.seqSpan || Math.ceil(this.length * 1.15);
        this.paintUndo();
        this.el.querySelector('#bpTitle').textContent = this.patternGroupId ? '— pattern ' + this.patternGroupId + ' · ' + this.rows.length + ' pair' + (this.rows.length > 1 ? 's' : '') : this.bound ? '— ' + (TRK()[this.bound.layer] || {}).short + ' ' + this.bound.startTime.toFixed(2) + ' s' : '— new pattern' + (this.insertAt != null ? ' @ ' + this.insertAt.toFixed(2) + ' s' : '');
        this.el.querySelector('#bpAdd').disabled = (!!this.bound && !this.patternGroupId) || this.rows.length >= MAX_ROWS;
        this.el.querySelector('#bpInsert').textContent = this.patternGroupId ? 'insert (replace the pattern)' : 'insert @ ' + (this.insertAt != null ? this.insertAt.toFixed(2) + ' s' : 'playhead');
        const host = this.el.querySelector('#bpRows'), kbWrap = this.el.querySelector('#bpKbWrap');
        const keepRows = host.scrollTop, keepKb = kbWrap ? kbWrap.scrollTop : 0;   // a render rebuilds the columns: their scroll stays where he left it (2026-09-07 night: "any change … auto scrolls up to pair 1")
        host.innerHTML = '';
        W = Math.max(520, (host.clientWidth || 0) - 24);   // the drawings fill the page
        this.rows.forEach((row, i) => { this.rowOut(row); host.appendChild(this.buildRow(row, i)); });
        if (!this.rows.length) host.innerHTML = '<div style="color:#888;padding:12px">no pairs — + pair</div>';
        host.scrollTop = keepRows; if (kbWrap) kbWrap.scrollTop = keepKb;
        if (this.activeRow >= this.rows.length) this.activeRow = Math.max(0, this.rows.length - 1);
        this.drawKeyboard(); this.paintRelation(); this.paintVoicing(); this.drawSeq(); this.paintFocus(); this.paintZoom();
        const ar = this.el.querySelector('#bpArmed'); if (ar) ar.textContent = this.armed != null ? nn(this.armed) + ' armed — click a pair\'s node (or drag it there)' : (this.rootMode ? 'root mode: click a key' : '');
        requestAnimationFrame(() => this.renderLines());
    },
    // ---- the voicing bar's state (the buttons, the boxes, the seed chips — the strikes drawer's U8) ----
    paintVoicing() {
        const v = this.voicing, el = this.el; if (!el) return;
        el.querySelectorAll('.bpV').forEach(b => { const on = b.dataset.v === v.preset; b.style.background = on ? '#7B3FE4' : ''; b.style.color = on ? '#fff' : ''; b.style.borderColor = on ? '#7B3FE4' : ''; });
        const put = (id, val) => { const q = el.querySelector(id); if (q && document.activeElement !== q) q.value = val; };
        put('#bpOct', v.oct); put('#bpBelow', v.below); put('#bpAbove', v.above);
        const chips = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:11px;cursor:pointer;line-height:16px';
        const hist = Array.isArray(v.hist) ? v.hist : (v.hist = []); if (!hist.includes(v.seed)) this.noteSeed();
        const seeds = el.querySelector('#bpSeeds');
        if (seeds) {
            seeds.innerHTML = '<span style="display:inline-flex;flex-wrap:wrap;gap:3px;align-items:center;color:#9a9" title="the seed of this voicing — click an earlier one to have it back, or type one">seed <input id="bpSeedIn" type="number" min="1" step="1" value="' + v.seed + '" style="width:44px">'
                + hist.map(n => '<button class="bpSeed" data-n="' + n + '" style="' + chips + (n === v.seed ? ';background:#c9a8ff;color:#222' : '') + '">' + n + '</button>').join('') + '</span>';
            seeds.querySelector('#bpSeedIn').addEventListener('change', ev => { ev.stopPropagation(); this.useSeed(+ev.target.value); });
            seeds.querySelectorAll('.bpSeed').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); this.useSeed(+b.dataset.n); }));
        }
    },
    noteSeed() { const v = this.voicing, h = Array.isArray(v.hist) ? v.hist : (v.hist = []); const i = h.indexOf(v.seed); if (i >= 0) h.splice(i, 1); h.unshift(v.seed); if (h.length > SEED_KEEP) h.length = SEED_KEEP; },
    nextSeed() { const v = this.voicing; return Math.max(v.seed || 0, ...(Array.isArray(v.hist) ? v.hist : [])) + 1; },
    useSeed(n) { this.voicing.seed = Math.max(1, Math.round(+n || 1)); this.noteSeed(); this.applyVoicing(); },
    // the sonority voiced from its original pitches (BeatingCalc.voiceChord: pure — the same five numbers, the same voicing); the pairs
    // holding a note of the sonority follow it (Q3) and refold (§180)
    voiceNow() { const BC = BC_(); if (!this.chord.length) return; const v = BC.voiceChord(this.chord.map(n => n.midi0 != null ? n.midi0 : n.midi), this.voicing, this.range()); this.chord.forEach((n, i) => { n.midi = v[i]; }); },
    applyVoicing() { this.voiceNow(); this.refoldRows(); this.render(); },
    // a sonority onto the keyboard: the original pitches kept (midi0), the voicing applied; a pair's note index belongs to the sonority it
    // was made on — it survives where the voiced note at that index is the pair's note as given (a reopened beating, a loaded take), else
    // it is cleared (the pair keeps its pitch, the line then comes from the key)
    // the harmony on the keyboard remembered for `revert` (his line 22: "an easy way to revert back to the original choice") — one level,
    // taken by the pickers BEFORE they change anything (a reopened beating or a loaded take remembers too)
    rememberHarmony() {
        if (!this.chord.length && !this.harmony) return;
        this._prevHarmony = { harmony: this.harmony ? Object.assign({}, this.harmony) : null, chordId: this.chordId, notes: this.chord.map(n => ({ midi: n.midi0 != null ? n.midi0 : n.midi, instKey: n.instKey, id: n.id })), voicing: JSON.parse(JSON.stringify(this.voicing)), rows: this.rows.map(r => ({ noteIndex: r.b.noteIndex, srcPitch: r.b.srcPitch, pitch: r.b.pitch, fold: r.b.fold, interval: r.b.interval, noteIs: r.b.noteIs, partnerLayer: r.b.partnerLayer })) };
    },
    setChord(notes, opts) {
        const o = opts || {};
        if (!o.noHistory) this.rememberHarmony();
        this.chord = (notes || []).map(n => Object.assign({}, n, { midi0: n.midi }));
        this.voiceNow();
        // a pair keeps its place in the new sonority ("maybe there's an initial assignment automatic"): the note at its own index, else the
        // nearest pitch of the new sonority; a pair without a note stays empty (auto-assign fills those). A reopened beating or a loaded
        // take keeps its rows as they are (keepRows).
        if (!o.keepRows && !this._keepRows) this.rows.forEach(r => {
            const b = r.b; if (b.noteIndex == null && b.srcPitch == null) return;
            if (b.noteIndex != null && this.chord[b.noteIndex]) { b.srcPitch = this.chord[b.noteIndex].midi; return; }
            if (!this.chord.length) { b.noteIndex = null; return; }
            const was = b.srcPitch != null ? b.srcPitch : b.pitch; let best = 0;
            this.chord.forEach((n, k) => { if (Math.abs(n.midi - was) < Math.abs(this.chord[best].midi - was)) best = k; });
            b.noteIndex = best; b.srcPitch = this.chord[best].midi;
        });
        else this.rows.forEach(r => { const b = r.b; if (b.noteIndex != null && !(this.chord[b.noteIndex] && this.chord[b.noteIndex].midi === b.srcPitch)) b.noteIndex = null; });
        this.refoldRows(); this.render();
    },
    // back to the previous harmony, voicing and assignments (one level)
    revertHarmony() {
        const p = this._prevHarmony; if (!p) { this.setStatus('nothing to revert — the harmony before the last change is remembered from now on', true); return; }
        this._prevHarmony = null; this.snapshot();
        this.voicing = Object.assign(VOICING_DEFAULTS(), p.voicing); this.harmony = p.harmony; this.chordId = p.chordId || '';
        this.setChord(p.notes, { noHistory: true, keepRows: true });
        this.rows.forEach((r, i) => { const s = p.rows[i]; if (!s) return; Object.assign(r.b, { noteIndex: s.noteIndex, srcPitch: s.srcPitch, pitch: s.pitch, fold: s.fold, interval: s.interval, noteIs: s.noteIs, partnerLayer: s.partnerLayer }); if (r.b.pitch != null) this.refold(r); });
        this.renderList();
        const nm = this.el.querySelector('#bpChordName'), st = this.harmony && this.harmony.bank === 'strikes' && this.db && this.db.strikes ? this.db.strikes[this.harmony.id] : null, en = this.harmony && this.harmony.bank !== 'strikes' ? this.entriesOf(this.harmony.bank).find(x => x.id === this.harmony.id) : null;
        if (nm) nm.textContent = st ? '#' + st.index + ' · strike at ' + st.t0.toFixed(2) + ' s' : en ? en.label + ' · ' + en.name : (this.harmony ? this.harmony.id : '');
        this.render(); this.setStatus('the previous harmony, voicing and assignments are back');
    },
    // the sonority dealt to the pairs without a note (all of them with SHIFT): low to high across the pairs, each folded for its players
    autoAssign(all) {
        const notes = [...new Set(this.chord.map(n => n.midi))].sort((a, b) => a - b); if (!notes.length) { this.setStatus('no sonority on the keyboard — pick one on the left', true); return; }
        const rows = this.rows.filter(r => all || r.b.pitch == null); if (!rows.length) { this.setStatus('every pair has a note — SHIFT-click deals them all again', true); return; }
        this.snapshot();
        rows.forEach((r, k) => { const m = notes[rows.length === 1 ? Math.floor(notes.length / 2) : Math.round(k * (notes.length - 1) / (rows.length - 1))]; r.b.noteIndex = this.indexAt(m); r.b.srcPitch = m; r.b.noteIs = 'lower'; r.b.skip = false; this.refold(r); });
        this.render(); this.setStatus('dealt: ' + rows.map(r => 'pair ' + (this.rows.indexOf(r) + 1) + ' ' + nn(r.b.srcPitch) + (r.b.fold ? ' → ' + nn(r.b.pitch) + BC_().foldMark(r.b.fold) : '')).join(' · '));
    },
    refoldRows() { this.rows.forEach(r => { const b = r.b; if (b.noteIndex != null && this.chord[b.noteIndex]) { b.srcPitch = this.chord[b.noteIndex].midi; this.refold(r); } }); },
    // THE PAIR'S FOLD (§179–180): the note as given (srcPitch — the sonority's or typed) folds by octaves AS ONE UNIT to the nearest octave
    // both players hold their notes, as written first, a tie down; when no octave serves, the pitch stays as given and the row flags it
    // and offers the ladder (buildRow). The block's `pitch` is always what sounds.
    refold(row) {
        const BC = BC_(), T = TRK(), b = row.b;
        const me = T[row.layer] && T[row.layer].instKey, pt = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null;
        if (b.srcPitch == null && b.pitch == null) { this.changed(row, true); return null; }   // born empty: nothing to fold yet
        if (b.srcPitch == null) b.srcPitch = b.pitch;
        let f = (me && pt) ? BC.foldPair(INST(), b.srcPitch, b.interval, me, pt, null, { noteIs: b.noteIs || 'lower' }) : null;
        // the fourth and the fifth are one family (2026-09-07): when no octave serves the one, the pair takes the other with the same note as its
        // other end — the note given becomes the pair's upper note (or its lower again)
        if (!f && me && pt && BC.INVERSION[b.interval]) {
            const inv = BC.INVERSION[b.interval], flip = (b.noteIs || 'lower') === 'lower' ? 'upper' : 'lower';
            const g = BC.foldPair(INST(), b.srcPitch, inv, me, pt, null, { noteIs: flip });
            if (g) { b.interval = inv; b.noteIs = flip; f = g; }
        }
        if (f) { b.pitch = f.pitch; b.fold = f.k; } else { b.pitch = (b.noteIs === 'upper') ? b.srcPitch - (BC.INTERVALS[b.interval] || BC.INTERVALS.unison).semitones : b.srcPitch; b.fold = 0; }
        this.changed(row, true);
        return f;
    },
    rowFold(row, m) {   // what the row's pair would make of a note, without touching the row
        const BC = BC_(), T = TRK(), b = row.b;
        const me = T[row.layer] && T[row.layer].instKey, pt = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null;
        if (!(me && pt)) return null;
        return BC.foldPair(INST(), m, b.interval, me, pt, null, { noteIs: b.noteIs || 'lower' }) || (BC.INVERSION[b.interval] ? BC.foldPair(INST(), m, BC.INVERSION[b.interval], me, pt, null, { noteIs: (b.noteIs || 'lower') === 'lower' ? 'upper' : 'lower' }) : null);
    },
    // the pitch each player of the row actually sounds, with the fold mark
    rowPitches(row) {
        const BC = BC_(), b = row.b, out = row.out || this.rowOut(row), iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison, T = TRK();
        const me = T[row.layer] && T[row.layer].instKey, src = b.srcPitch != null ? b.srcPitch : b.pitch;
        const k = Math.round((b.pitch - src) / 12), mark = BC.foldMark(k);
        const of = key => key ? { player: key, pitch: b.pitch + (out.players.upper === key && iv.semitones ? iv.semitones : 0), mark, k } : null;
        return { me: of(me), partner: of(b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null), src, k, mark };
    },
    // THE LINES (the strikes drawer's renderLines): from the assigned note's dot on the keyboard — or its key when the note is not in the
    // sonority — to the pair's node, dotted, in the row's colour; over the body, redrawn on render and on the columns' scroll
    renderLines() {
        const el = this.el, svg = el && el.querySelector('#bpLines'), body = el && el.querySelector('#bpBody'), kb = el && el.querySelector('#bpKb');
        if (!svg || !body || !kb || !this.isOpen()) return;
        const bb = body.getBoundingClientRect(); svg.setAttribute('width', bb.width); svg.setAttribute('height', bb.height);
        const kbBox = el.querySelector('#bpKbWrap').getBoundingClientRect();
        let s = '';
        this.rows.forEach((row, i) => {
            const b = row.b, src = b.srcPitch != null ? b.srcPitch : b.pitch, col = ROW_COLORS[i % ROW_COLORS.length];
            const node = el.querySelector('.bpRow[data-row="' + i + '"] .bpNode'); if (!node) return;
            const from = (b.noteIndex != null && kb.querySelector('.bpDot[data-i="' + b.noteIndex + '"]')) || kb.querySelector('.bpDot[data-m="' + src + '"]') || kb.querySelector('.bpKey[data-m="' + src + '"]');
            if (!from) return;
            const a = from.getBoundingClientRect(), n = node.getBoundingClientRect();
            const y1 = a.top + a.height / 2, y2 = n.top + n.height / 2;
            if (y1 < kbBox.top || y1 > kbBox.bottom || y2 < bb.top || y2 > bb.bottom) return;   // scrolled out of sight: no line
            const x1 = a.left + a.width - bb.left, x2 = n.left + n.width / 2 - bb.left;
            const hot = i === this.activeRow;
            s += '<line x1="' + x1 + '" y1="' + (y1 - bb.top) + '" x2="' + x2 + '" y2="' + (y2 - bb.top) + '" stroke="' + col + '" stroke-width="' + (hot ? 2 : 1.2) + '" stroke-dasharray="' + (hot ? '5 3' : '3 3') + '" opacity="' + (hot ? 0.95 : 0.6) + '"/>';
        });
        svg.innerHTML = s;
    },
    paintRelation() { this.el.querySelectorAll('.bpRelBtn').forEach(b => { const on = b.dataset.rel === this.relation; b.style.background = on ? '#7B3FE4' : ''; b.style.color = on ? '#fff' : ''; b.style.borderColor = on ? '#7B3FE4' : ''; }); },
    buildRow(row, i) {
        const C = C_(), BC = BC_(), b = row.b, out = row.out, T = TRK();
        const me = T[row.layer] ? T[row.layer].label : '?', meKey = T[row.layer] && T[row.layer].instKey, ptKey = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null;
        const noNote = b.pitch == null;   // born empty (his line 5): the row asks for a note
        const src = noNote ? null : (b.srcPitch != null ? b.srcPitch : b.pitch), RP = noNote ? null : this.rowPitches(row);
        const folded = !noNote && !!(meKey && ptKey && this.rowFold(row, src));
        const ladder = (!noNote && !folded && meKey && ptKey) ? BC.pairLadder(INST(), src, b.interval, meKey, ptKey) : null;
        const laneOf = key => T.findIndex(t => t.instKey === key);
        const pcCol = m => this.pcColor(((m % 12) + 12) % 12);
        const chip = (p, bad) => p ? '<span class="bpChip" style="color:' + (bad ? '#e88' : pcCol(p.pitch)) + ';font-weight:600" title="' + esc(p.player + (bad ? ': out of reach at this interval in every octave' : ' sounds ' + nn(p.pitch) + (p.k ? ', ' + Math.abs(p.k) + ' octave' + (Math.abs(p.k) > 1 ? 's' : '') + (p.k > 0 ? ' up' : ' down') + ' from the note as given' : ', as given'))) + '">' + (bad ? '✕' : nn(p.pitch) + p.mark) + '</span>' : '';
        const seatOpts = (meKey && !noNote) ? BC.seatOptions(INST(), src, b.interval, meKey) : [];
        const lim = k => k ? BC.bendLimits(INST(), k) : null, lo = lim(out.players.lower), up = lim(out.players.upper);
        const fl = out.flags.map(f => f.flag).filter((v, j, a) => a.indexOf(v) === j && v !== 'out-of-range');
        { const used = this.usedLayers(row); const twice = [row.layer, b.partnerLayer].filter(L => L != null && used.has(L)).map(L => T[L].short); if (twice.length) fl.push('⚠ ' + twice.join(', ') + ' also in another pair — one channel would carry two bends'); }
        const iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison;
        const box = document.createElement('div');
        box.className = 'bpRow'; box.dataset.row = i;
        box.style.cssText = 'border:1px solid #444;border-left:4px solid ' + ROW_COLORS[i % ROW_COLORS.length] + ';border-radius:5px;padding:6px 8px;margin-bottom:8px;background:' + (i === this.activeRow ? 'rgba(123,63,228,0.08)' : 'rgba(255,255,255,0.03)') + (row.mute ? ';opacity:0.55' : '');
        box.addEventListener('mousedown', () => { if (this.activeRow !== i) this.activeRow = i; this.focus = 'pair'; this.paintFocus(); });   // the row under the mouse is the pair SPACE plays
        box.addEventListener('click', ev => { if (ev.target.closest('input, select, button, svg')) return; if (this.armed != null) this.assign(i, this.armed); else if (this.activeRow !== i) { this.activeRow = i; this.render(); } });
        const sel = 'background:#7B3FE4;color:#fff;border-color:#7B3FE4;';
        const btn = (cls, data, label, on, title) => '<button class="' + cls + '" ' + data + ' title="' + esc(title || '') + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer;' + (on ? sel : '') + '">' + label + '</button>';
        const userShapes = Object.keys(this.shapesBank || {}).sort();
        const shapeBtns = (cls, what) => SHAPES.map(([k, l]) => btn(cls, 'data-shape="' + k + '"', l, false, what)).join('') + userShapes.map(n => btn(cls, 'data-shape="u:' + esc(n) + '"', '&#9733; ' + esc(n), false, 'your shape "' + n + '" — ALT-click deletes it')).join('');
        // player 1 and player 2 as pull-downs, both always (a bound zone moves to the lane chosen); player 2 shows what it would sound
        const laneSel = '<select class="bpLane" title="player 1 &#8212; the launching player (a bound zone moves to that lane)">' + [0, 1, 3, 4, 5, 6].map(L => '<option value="' + L + '"' + (L === row.layer ? ' selected' : '') + '>' + esc(T[L].label) + '</option>').join('') + '</select>';
        const ptSel = '<select class="bpPartner" title="player 2: every player, with the pitch it would sound on this note (&#8593; / &#8595; = folded by octaves, both together), &#10005; when no octave serves both">' + (b.partnerLayer == null ? '<option value="" selected>partner&#8230;</option>' : '')
            + (noNote ? [0, 1, 3, 4, 5, 6].filter(L => L !== row.layer).map(L => '<option value="' + L + '"' + (L === b.partnerLayer ? ' selected' : '') + '>' + esc(T[L].label) + '</option>').join('')
                      : seatOpts.map(o => { const L = laneOf(o.player), f = o.fold, pOf = f ? (f.lower === o.player ? f.pitch : f.pitch + iv.semitones) : null; return L < 0 ? '' : '<option value="' + L + '"' + (L === b.partnerLayer ? ' selected' : '') + '>' + esc(T[L].label) + ' — ' + (f ? nn(pOf) + BC.foldMark(f.k) : '✕') + '</option>'; }).join('')) + '</select>';
        const levLo = b.levelLo == null ? 0.3 : b.levelLo, levHi = b.levelHi == null ? 0.9 : b.levelHi;
        const brMode = (b.breath.mode || 'one') !== 'designated' ? 'one' : (b.breath.deal === false ? 'hand' : ((b.breath.phase == null ? 0.5 : +b.breath.phase) === 0 ? 'unison' : 'random'));
        box.innerHTML = [
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:4px">',
            // the pair's NODE (CN-36: "click a node connected to a pair"): lit while a note is armed
            '<span class="bpNode" title="' + (this.armed != null ? nn(this.armed) + ' lands here' : 'double-click a note on the keyboard, then click here') + '" style="display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid ' + ROW_COLORS[i % ROW_COLORS.length] + ';background:' + (this.armed != null ? ROW_COLORS[i % ROW_COLORS.length] : '#1b1b20') + ';cursor:pointer;flex:none"></span>',
            '<b style="color:#c9a8ff">pair ' + (i + 1) + '</b> ',
            laneSel, ' ' + chip(RP && RP.me, !folded),
            ' + ' + ptSel, ' ' + chip(RP && RP.partner, !folded),
            (noNote ? ' <span style="color:#c9a8ff" title="the pair has no note yet">assign a note &#8212; double-click a note on the keyboard, then this node</span>'
                    : ' on <input class="bpPitch" type="number" value="' + src + '" min="21" max="108" step="1" style="width:50px" title="the note as given (the sonority&#8217;s, or typed) &#8212; the pair folds it as one unit to the nearest octave both reach, as written first, a tie down"> <span style="color:#aaa">' + nn(src) + (folded && RP.k ? ' &#8594; ' + nn(b.pitch) + RP.mark : '') + (iv.semitones && folded ? ' + ' + nn(b.pitch + iv.semitones) : '') + (b.noteIs === 'upper' ? ' <span style="color:#777" title="the note given is the pair&#8217;s UPPER note: the fifth that no octave served sounds as the fourth below it (fourths and fifths are one family)">inverted</span>' : '') + (b.noteIndex != null ? ' <span style="color:#777" title="the pair remembers which note of the sonority it holds: the voicings and the octave box move it and the pair follows">note ' + (b.noteIndex + 1) + '</span>' : '') + '</span>'),
            ' <span>' + Object.values(BC.INTERVALS).map(q => btn('bpIv', 'data-iv="' + q.key + '"', q.label, b.interval === q.key, q.label + ': the just offset ' + q.justOffsetCents + ' c on the upper note, the beating ' + q.partial + '× per cent' + (q.key === 'P4' || q.key === 'P5' ? ' — the fourth and the fifth are one family: when no octave serves, the pair takes the other' : ''))).join('') + '</span>',
            ' <label style="color:#888" title="this pair&#8217;s own duration &#8212; the curves keep their shape over it; the end handle and the strip&#8217;s right edge do the same">len <input class="bpRowLen" type="number" step="0.5" min="0.5" max="180" value="' + row.length + '" style="width:52px"> s</label>',
            ' ' + btn('bpRowPlay', '', '&#9654; pair', false, 'hear this pair alone — SPACE does the same while the pair is the focus'),
            (b.skip ? ' <span style="color:#e88">&#10005; skipped &#8212; nobody plays it</span> ' + btn('bpUnskip', '', 'play it', false, 'take the skip off') : ''),
            (row.zone ? '' : ' <button class="bpRemove" title="remove this pair" style="margin-left:auto;font-size:12px;cursor:pointer">&#10005; pair</button>'),
            '</div>',
            // THE LADDER (§180, Q2 — offered, never applied by the tool): when no octave serves both players at this interval
            (ladder ? '<div class="bpLadder" style="color:#e88;margin:0 0 4px;display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center">&#9888; no octave where ' + esc(T[row.layer].short) + ' and ' + esc(T[b.partnerLayer].short) + ' both reach ' + nn(src) + ' at ' + iv.label + ' &#8212;'
                + (ladder.intervals.length ? ' <span style="color:#aaa">the interval:</span> ' + ladder.intervals.map(o => btn('bpOfferIv', 'data-iv="' + o.interval + '"', o.label + ': ' + esc(T[laneOf(o.fold.lower)].short) + ' ' + nn(o.fold.pitch) + ' · ' + esc(T[laneOf(o.fold.upper)].short) + ' ' + nn(o.fold.pitch + BC.INTERVALS[o.interval].semitones), false, 'this pair at ' + o.label + ' (folded ' + Math.abs(o.fold.k) + ')')).join('') : '')
                + (ladder.players.some(o => o.seat === 'b') ? ' <span style="color:#aaa">instead of ' + esc(T[b.partnerLayer].short) + ':</span> ' + ladder.players.filter(o => o.seat === 'b').map(o => btn('bpOfferPt', 'data-lane="' + laneOf(o.player) + '"', esc(T[laneOf(o.player)].short) + ' ' + nn(o.fold.lower === o.player ? o.fold.pitch : o.fold.pitch + iv.semitones) + BC.foldMark(o.fold.k), false, T[laneOf(o.player)].label + ' as player 2')).join('') : '')
                + (ladder.players.some(o => o.seat === 'a') ? ' <span style="color:#aaa">instead of ' + esc(T[row.layer].short) + ':</span> ' + ladder.players.filter(o => o.seat === 'a').map(o => btn('bpOfferMe', 'data-lane="' + laneOf(o.player) + '"', esc(T[laneOf(o.player)].short) + ' ' + nn(o.fold.lower === o.player ? o.fold.pitch : o.fold.pitch + iv.semitones) + BC.foldMark(o.fold.k), false, T[laneOf(o.player)].label + ' as player 1')).join('') : '')
                + ' ' + btn('bpSkip', '', '&#10005; skip', !!b.skip, 'nobody plays this pair (the strikes drawer\'s third way); a new note, partner or interval takes it off') + '</div>' : ''),
            // the shape line: the menu's shapes and his own, the maximum in Hz with its audition, the lock, draw, the axis, save shape; the pair takes at the right
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:3px">',
            '<span style="color:#888">shape</span> ' + shapeBtns('bpShape', 'pop the shape in at the maximum'),
            ' <label style="color:#888" title="the maximum beating in Hz (beats per second) &#8212; type it, spin it with the arrows or the wheel; a menu shape pops in again at it, a drawn shape is scaled to it">max <input class="bpRateTo" type="number" value="' + (+b.rateTo || 0) + '" min="0" max="30" step="0.5" style="width:52px"> Hz</label>',
            ' ' + btn('bpHearMax', '', '&#9654; max', false, 'hear 4 s flat at the maximum on this pair'),
            // the hold shape's attack and release, typed in seconds (2026-09-07 late evening: "a short ramp up about a double the length sustained and then an equal short ramp down")
            (this.isAdsr(row) ? ' <label style="color:#888" title="the hold shape&#8217;s rise to the maximum, in seconds &#8212; kept through a length change; the hold takes the rest">attack <input class="bpAtt" type="number" step="0.1" min="0.05" max="60" value="' + ((b.adsr && b.adsr.attackS) || 2) + '" style="width:48px"> s</label>'
                + ' <label style="color:#888" title="the hold shape&#8217;s fall back to the base, in seconds">release <input class="bpRel" type="number" step="0.1" min="0.05" max="60" value="' + ((b.adsr && b.adsr.releaseS) || 3) + '" style="width:48px"> s</label>'
                + ' <span class="bpHoldInfo" style="color:#888"></span>' : ''),
            ' ' + btn('bpLock', '', row.locked ? '&#128274; mirrored' : '&#128275; free', row.locked, 'the mirror lock: drag one curve, the other mirrors (ALT-drag moves one alone)'),
            ' ' + btn('bpDraw', '', '&#10002; draw', row.draw, 'draw: a click in the rate area adds a point (ESC or click again to end) — without it a double-click adds one'),
            ' <label style="color:#888">±<input class="bpScale" type="number" value="' + row.scale + '" min="2" max="40" step="1" style="width:40px" title="the rate axis, Hz"></label>',
            ' <span style="display:inline-flex;gap:3px;align-items:center"><input class="bpShapeName" type="text" placeholder="shape name" style="width:80px" title="store this pair&#8217;s beating shape under a name (normalised: it pops in at any maximum) &#8212; ENTER saves"><button class="bpShapeSave" title="store the shape among the shape buttons (bank/panel_snapshots.json, beatingShapes); ALT-click a stored shape deletes it">save shape</button></span>',
            ' <span style="margin-left:auto;display:inline-flex;gap:4px;align-items:center"><input class="bpPairName" type="text" placeholder="pair take" style="width:90px" title="a name for this pair&#8217;s settings (the curves, the level, the breaths, the interval, the length) &#8212; ENTER saves">'
                + '<button class="bpPairSave" title="save this pair&#8217;s settings as a named pair take (bank/panel_snapshots.json, the beatingPairs bucket)">save pair</button>'
                + '<select class="bpPairSel" style="max-width:120px" title="load a pair take into this pair: its curves, level, breaths, interval and length; the players and the note stay"><option value="">load pair&#8230;</option>' + Object.keys(this.pairTakes || {}).sort().map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join('') + '</select></span>',
            '</div>',
            '<svg class="bpRates" width="' + W + '" height="' + HR + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            // the crescendo line: the shapes, follows, together / each, low and high as dynamics (ppp … fff)
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin:3px 0 2px"><span style="color:#888">crescendo</span> ' + shapeBtns('bpLevShape', 'the level shape between low and high')
                + ' ' + btn('bpLevFollow', '', 'follows the beating', !b.levelCurve, 'the crescendo follows the beating between low and high')
                + ' ' + btn('bpLevLock', '', row.levelLock !== false ? '&#128274; together' : '&#128275; each', row.levelLock !== false, 'together: one crescendo for both players (edit one, both move) · each: a crescendo per player ("maybe they reach max at different times")')
                + ' <label style="color:#888" title="the score&#8217;s dynamic: ppp = 0 &#8230; fff = 1 in eight steps &#8212; type a name (mp) or a number; equal loudness across instruments through the remap, over the whole measured scale">low <input class="bpLevLo" type="text" value="' + levLo + '" style="width:44px"> <span class="bpDynLo" style="color:#7ec9a8">' + dynName(levLo) + '</span></label>'
                + ' <label style="color:#888" title="ppp = 0 &#8230; fff = 1">high <input class="bpLevHi" type="text" value="' + levHi + '" style="width:44px"> <span class="bpDynHi" style="color:#7ec9a8">' + dynName(levHi) + '</span></label></div>',
            '<svg class="bpLevel" width="' + W + '" height="' + HL + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            // the breaths: one · random · unison · by hand; the shuffle; the marks live in the lane below
            '<div style="display:flex;gap:8px;align-items:center;margin:3px 0 2px"><span style="color:#888">breaths</span> <select class="bpBreath" title="one: a single breath or bow each · random: dealt inside the ceiling, the two players staggered · unison: both at the same marks · by hand: only the marks you place">' + [['one', 'one'], ['random', 'random'], ['unison', 'unison'], ['hand', 'by hand']].map(([k, l]) => '<option value="' + k + '"' + (brMode === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>'
                + ' ' + btn('bpShuffle', '', '&#8635; shuffle', false, 'deal the breaths again from a new seed — the marks you placed stay') + ' <span style="color:#888">seed ' + (b.breath.seed || 1) + '</span>'
                + ' <span class="bpBreathInfo" style="color:#888"></span></div>',
            '<svg class="bpBreaths" width="' + W + '" height="' + HB + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin-top:3px"><span style="color:#888" title="this pair&#8217;s place in the sequence — drag its zone in the strip above">@ ' + (row.offset || 0).toFixed(2) + ' s · ' + row.length + ' s</span>',
            ' <span class="bpReadout" style="color:#9a9;margin-left:auto">max ' + out.maxBeat + ' Hz · ' + (out.players.lower || '?') + ' ±' + out.maxCents.lower + ' c' + (lo ? '/' + lo.limitCents : '') + ' · ' + (out.players.upper || '?') + ' ±' + out.maxCents.upper + ' c' + (up ? '/' + up.limitCents : '')
                + (out.justOffsetCents ? ' · just ' + (out.justOffsetCents > 0 ? '+' : '') + out.justOffsetCents + ' c' : '') + ' · ' + out.notes.lower.length + '+' + out.notes.upper.length + ' notes' + (fl.length ? ' · <span style="color:#e88">&#9888; ' + fl.join(' ') + '</span>' : '') + '</span></div>',
        ].join('');
        // the controls
        const q = s => box.querySelector(s), qa = s => box.querySelectorAll(s);
        const redo = () => { this.changed(row, true); this.render(); };
        const refit = () => { b.skip = false; this.refold(row); this.render(); this.sayFold(row, i); };   // a change of a seat, the note or the interval refolds the pair (§180) and takes a skip off
        q('.bpLane').addEventListener('change', ev => { this.snapshot(); const L = +ev.target.value; if (b.partnerLayer === L) b.partnerLayer = null; if (row.zone) C.removeBeatingDecor(row.zone); row.layer = L; if (row.zone) { row.zone.layer = L; C.renderZone(row.zone); C.markDirty(); } refit(); });
        q('.bpPartner').addEventListener('change', ev => { this.snapshot(); b.partnerLayer = ev.target.value === '' ? null : +ev.target.value; refit(); });
        if (q('.bpPitch')) q('.bpPitch').addEventListener('change', ev => { const v = parseInt(ev.target.value, 10); if (!isNaN(v)) { this.snapshot(); b.noteIndex = null; b.srcPitch = clamp(v, 21, 108); b.noteIs = 'lower'; refit(); } });
        qa('.bpIv').forEach(el => el.addEventListener('click', () => { this.snapshot(); b.interval = el.dataset.iv; b.noteIs = 'lower'; refit(); }));
        qa('.bpOfferIv').forEach(el => el.addEventListener('click', () => { this.snapshot(); b.interval = el.dataset.iv; b.noteIs = 'lower'; refit(); }));
        qa('.bpOfferPt').forEach(el => el.addEventListener('click', () => { this.snapshot(); b.partnerLayer = +el.dataset.lane; refit(); }));
        qa('.bpOfferMe').forEach(el => el.addEventListener('click', () => { this.snapshot(); const L = +el.dataset.lane; if (row.zone) { C.removeBeatingDecor(row.zone); row.zone.layer = L; } row.layer = L; if (row.zone) { C.renderZone(row.zone); C.markDirty(); } refit(); }));
        if (q('.bpSkip')) q('.bpSkip').addEventListener('click', () => { this.snapshot(); b.skip = !b.skip; redo(); this.setStatus(b.skip ? 'pair ' + (i + 1) + ' skipped — nobody plays it; a new note, partner or interval takes the skip off' : 'pair ' + (i + 1) + ' plays again'); });
        if (q('.bpUnskip')) q('.bpUnskip').addEventListener('click', () => { this.snapshot(); b.skip = false; redo(); });
        if (q('.bpRemove')) q('.bpRemove').addEventListener('click', () => { this.snapshot(); this.removeRow(i); });
        qa('.bpShape').forEach(el => el.addEventListener('click', ev => { if (ev.altKey && el.dataset.shape.indexOf('u:') === 0) { this.deleteShape(el.dataset.shape.slice(2)); return; } this.snapshot(); this.popShape(row, el.dataset.shape); redo(); }));
        q('.bpRateTo').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { this.snapshot(); this.setLevel(row, Math.max(0, v)); redo(); } });
        q('.bpRateTo').addEventListener('wheel', ev => { ev.preventDefault(); ev.stopPropagation(); const v = Math.max(0, r3((+ev.target.value || 0) + (ev.deltaY > 0 ? -0.5 : 0.5))); ev.target.value = v; this.snapshot(); this.setLevel(row, v); redo(); }, { passive: false });
        q('.bpHearMax').addEventListener('click', () => { this.activeRow = i; this.setFocus('pair'); this.hearMax(row); });
        if (q('.bpAtt')) {
            const setHold = () => { const a = parseFloat(q('.bpAtt').value), r = parseFloat(q('.bpRel').value); if (!(a > 0) || !(r > 0)) return; this.snapshot(); this.setHoldSeconds(row, a, r); redo(); const hs = this.holdSeconds(row); if (hs) this.setStatus('hold: attack ' + hs.attackS + ' s · hold ' + hs.holdS + ' s · release ' + hs.releaseS + ' s' + (hs.attackS < a - 0.01 || hs.releaseS < r - 0.01 ? ' (the pair is too short for ' + a + ' + ' + r + ' s)' : '')); };
            q('.bpAtt').addEventListener('change', setHold); q('.bpRel').addEventListener('change', setHold);
            const hs = this.holdSeconds(row); if (hs) { q('.bpAtt').value = hs.attackS; q('.bpRel').value = hs.releaseS; q('.bpHoldInfo').textContent = 'hold ' + hs.holdS + ' s'; }
        }
        q('.bpRowLen').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (v > 0) { this.snapshot(); this.setRowLength(row, v); } });
        q('.bpRowPlay').addEventListener('click', () => { this.activeRow = i; this.setFocus('pair'); this.playRow(i); });
        q('.bpPairSave').addEventListener('click', () => this.savePair(i, q('.bpPairName').value));
        q('.bpPairName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.savePair(i, q('.bpPairName').value); });
        q('.bpPairSel').addEventListener('change', ev => { if (ev.target.value) { this.snapshot(); this.loadPair(i, ev.target.value); } ev.target.value = ''; });
        q('.bpShapeSave').addEventListener('click', () => this.saveShape(row, q('.bpShapeName').value));
        q('.bpShapeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveShape(row, q('.bpShapeName').value); });
        q('.bpLock').addEventListener('click', () => { this.snapshot(); row.locked = !row.locked; if (row.locked) { this.relock(row); } else { this.unlock(row); } redo(); });
        q('.bpDraw').addEventListener('click', () => { row.draw = !row.draw; this.render(); this.setStatus(row.draw ? 'draw: click in the rate area to add points; a point drags; ALT-click removes it; click draw again to end' : 'draw off — a double-click on the curve area adds a point'); });
        q('.bpScale').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (v > 0) { row.scale = v; this.render(); } });
        qa('.bpLevShape').forEach(el => el.addEventListener('click', ev => { if (ev.altKey && el.dataset.shape.indexOf('u:') === 0) { this.deleteShape(el.dataset.shape.slice(2)); return; } this.snapshot(); this.popLevelShape(row, el.dataset.shape); redo(); }));
        q('.bpLevFollow').addEventListener('click', () => { this.snapshot(); b.levelCurve = null; redo(); });
        q('.bpLevLock').addEventListener('click', () => { this.snapshot(); const lock = row.levelLock === false; row.levelLock = lock; const lp = this.levelPts(row); if (lock && lp) this.setLevelPts(row, 'upper', lp.upper); redo(); this.setStatus(lock ? 'the crescendo is shared again — the upper player\'s curve for both' : 'a crescendo per player — edit each curve on its own'); });
        q('.bpLevLo').addEventListener('change', ev => { const v = parseLevel(ev.target.value); if (v != null) { this.snapshot(); b.levelLo = v; redo(); } else this.setStatus('low: a dynamic (ppp … fff) or a number 0 … 1', true); });
        q('.bpLevHi').addEventListener('change', ev => { const v = parseLevel(ev.target.value); if (v != null) { this.snapshot(); b.levelHi = v; redo(); } else this.setStatus('high: a dynamic (ppp … fff) or a number 0 … 1', true); });
        q('.bpBreath').addEventListener('change', ev => { this.snapshot(); const k = ev.target.value; if (k === 'one') b.breath.mode = 'one'; else { b.breath.mode = 'designated'; if (k === 'hand') b.breath.deal = false; else { delete b.breath.deal; b.breath.phase = k === 'unison' ? 0 : 0.5; } } redo(); });
        q('.bpShuffle').addEventListener('click', () => { this.snapshot(); if ((b.breath.mode || 'one') !== 'designated' || b.breath.deal === false) { b.breath.mode = 'designated'; delete b.breath.deal; if (b.breath.phase == null) b.breath.phase = 0.5; } b.breath.seed = (b.breath.seed || 1) + 1; redo(); this.setStatus('breaths dealt again (seed ' + b.breath.seed + '); the marks you placed stay'); });
        this.drawRates(row, q('.bpRates'));
        this.drawLevel(row, q('.bpLevel'));
        this.drawBreaths(row, q('.bpBreaths'), q('.bpBreathInfo'));
        return box;
    },

    // ---- the curves in the block: `beat` (one heard curve, mirrored by `share`) while locked; `rate.lower / upper` when unlocked ----
    heardCurve(row) { const C = C_(); return C.beatingCurve(row.b); },
    curvesOf(row) {
        const BC = BC_(), b = row.b;
        if (b.rate && b.rate.lower && b.rate.upper) return { lower: BC.curveOf(b.rate.lower), upper: BC.curveOf(b.rate.upper) };
        const m = BC.mirrored(this.heardCurve(row), b.share);
        return { lower: BC.curveOf(m.lower), upper: BC.curveOf(m.upper) };
    },
    popShape(row, key) {
        const BC = BC_(), b = row.b, to = +b.rateTo || 0, from = +b.rateFrom || 0;
        if (String(key).indexOf('u:') === 0) { const sh = this.shapesBank[key.slice(2)]; if (!sh) return; b.shape = key; b.beat = BC.scaleCurve(sh.curve, to); b.rate = null; row.locked = true; return; }   // his stored shape at the maximum
        b.shape = key;
        const a = b.adsr || (b.adsr = { attackS: 2, releaseS: 3 });
        b.beat = key === 'flat' ? BC.shape('flat', { level: to }) : key === 'rampOut' ? [[0, 0], [1, to]] : key === 'rampIn' ? [[0, to], [1, 0]] : key === 'hump' ? BC.shape('hump', { peak: to, base: from }) : key === 'adsr' ? BC.shape('adsr', { peak: to, base: from, length: row.length, attackS: a.attackS, releaseS: a.releaseS }) : key === 'arc' ? BC.shape('arc', { peak: to, base: from }) : BC.shape('burst', { peak: to });
        b.rate = null; row.locked = true;
    },
    unlock(row) { const c = this.curvesOf(row); row.b.rate = { lower: c.lower.map(p => JSON.parse(JSON.stringify(p))), upper: c.upper.map(p => JSON.parse(JSON.stringify(p))) }; },
    relock(row) {   // the upper curve becomes the heard curve's upper half again; the lower mirrors it (the bends kept)
        const BC = BC_(), c = this.curvesOf(row);
        row.b.beat = c.upper.map(p => { const k = BC.ctrlOf(p); return BC.withExtra(p[0], r3(p[1] * 2), k ? [k[0], r3(k[1] * 2)] : (BC.slopeOf(p) || null)); });
        row.b.share = 0.5; row.b.rate = null; if (!this.isAdsr(row)) row.b.shape = 'drawn';
    },
    isAdsr(row) { return row.b.shape === 'adsr' && BC_().curveOf(this.heardCurve(row)).length === 4; },
    // an edit of one curve's point: locked → the heard curve's point (the other mirrors); unlocked → that curve alone; the segment's bend stays
    setPoint(row, who, idx, p, v) {
        const BC = BC_(), b = row.b;
        if (row.locked) {
            const beat = BC.curveOf(this.heardCurve(row)); if (!beat[idx]) return;
            beat[idx] = BC.withExtra(p, r3(Math.abs(v) * 2), beat[idx].length > 2 ? beat[idx][2] : null); b.beat = beat; if (b.shape !== 'adsr') b.shape = 'drawn';
        } else {
            if (!b.rate) this.unlock(row);
            const c = BC.curveOf(b.rate[who]); if (!c[idx]) return;
            c[idx] = BC.withExtra(p, r3(v), c[idx].length > 2 ? c[idx][2] : null); b.rate[who] = c;
        }
    },
    // the BEND of the segment after a point: a control point [cx, cy] (the score's curve windows — 2026-09-07 evening, "you need 2 degrees
    // of freedom"), null = straight. Locked → on the heard curve, in its units (the drawn curve is the heard one scaled by the share);
    // unlocked → that curve alone.
    setCtrl(row, who, idx, ctrl) {
        const BC = BC_(), b = row.b;
        if (row.locked) {
            const beat = BC.curveOf(this.heardCurve(row)); if (!beat[idx]) return;
            const share = b.share == null ? 0.5 : clamp(+b.share, 0.05, 0.95), k = who === 'upper' ? 1 / (1 - share) : -1 / share;
            beat[idx] = BC.withExtra(beat[idx][0], beat[idx][1], ctrl ? [ctrl[0], r3(ctrl[1] * k)] : null); b.beat = beat;
        } else {
            if (!b.rate) this.unlock(row);
            const c = BC.curveOf(b.rate[who]); if (!c[idx]) return;
            c[idx] = BC.withExtra(c[idx][0], c[idx][1], ctrl ? [ctrl[0], r3(ctrl[1])] : null); b.rate[who] = c;
        }
    },
    setSlope(row, who, idx, s) { this.setCtrl(row, who, idx, null); },   // ALT-click: straight (the older power slope is gone too)
    // THE REGION MODEL (2026-09-07, night — the composer's DAW picture): the pair is a region on a time axis; its curve is drawn over the
    // region in PROPORTION, so dragging the region's end keeps the shape's proportions ("make the duration four seconds, keep the
    // proportions of the curve"); the points inside are dragged in real time within the region. The hold shape's attack and release
    // boxes TYPE seconds at the current length (they set the points); nothing is kept in seconds through a resize.
    fitShapeToLength(row) { /* nothing: the nodes keep their own time (resizeKeepTimes) */ },
    // A TRIM (2026-09-07 night, his correction: "All the points should be independent on the timeline … if it's six seconds and I move the
    // endpoint to four seconds, the curve notes stay where they are in their timeline. Same with the front point"): the region's length
    // changes, every node keeps its time on the timeline — its place inside the region is re-expressed; a node beyond the new end (or
    // before the new start) is kept where it is, drawn dim, and comes back when the edge is pulled out again; the breath marks and the
    // slides keep their time too (a mark outside the region goes). keepEnd = the START moved (the region starts later or earlier).
    resizeKeepTimes(row, newL, keepEnd) {
        const BC = BC_(), b = row.b, oldL = Math.max(0.1, row.length); newL = r3(clamp(newL, 0.5, 180));
        const dStart = keepEnd ? r3(oldL - newL) : 0;
        const remap = c => (c == null ? c : (typeof c === 'number' ? c : BC.curveOf(c).map(p => BC.withExtra(r3((p[0] * oldL - dStart) / newL), p[1], p.length > 2 ? p[2] : null))));
        if (Array.isArray(b.beat) && b.beat.length) b.beat = remap(b.beat);
        if (b.rate && b.rate.lower && b.rate.upper) b.rate = { lower: remap(b.rate.lower), upper: remap(b.rate.upper) };
        if (b.levelCurve) b.levelCurve = Array.isArray(b.levelCurve) ? remap(b.levelCurve) : { lower: remap(b.levelCurve.lower), upper: remap(b.levelCurve.upper) };
        if (b.breath && b.breath.marks) for (const who of ['lower', 'upper']) if (Array.isArray(b.breath.marks[who])) b.breath.marks[who] = b.breath.marks[who].map(t => r3(t - dStart)).filter(t => t >= 0.1 && t <= newL - 0.1);
        if (b.slide) for (const who of ['lower', 'upper']) if (b.slide[who]) b.slide[who] = r3(b.slide[who] - dStart * 0);   // a slide is a lag of the curve, kept as it is
        row.length = newL; if (keepEnd) row.offset = r3(Math.max(0, (row.offset || 0) + dStart));
        this.placeZone(row);
    },
    holdSeconds(row) { const BC = BC_(), pts = BC.curveOf(this.heardCurve(row)); return this.isAdsr(row) ? { attackS: r3(pts[1][0] * row.length), holdS: r3((pts[2][0] - pts[1][0]) * row.length), releaseS: r3((1 - pts[2][0]) * row.length) } : null; },
    setHoldSeconds(row, a, r) {
        const BC = BC_(), b = row.b, L = Math.max(0.1, row.length); if (!this.isAdsr(row)) return;
        let pa = clamp(a / L, 0.01, 0.97), ph = clamp(1 - r / L, pa + 0.02, 0.99);
        const pts = BC.curveOf(this.heardCurve(row));
        pts[0] = BC.withExtra(0, pts[0][1], pts[0].length > 2 ? pts[0][2] : null);   // the hold shape spans the region: its first node at the start, its last at the end
        pts[1] = BC.withExtra(r3(pa), pts[1][1], pts[1].length > 2 ? pts[1][2] : null); pts[2] = BC.withExtra(r3(ph), pts[2][1], pts[2].length > 2 ? pts[2][2] : null);
        pts[3] = BC.withExtra(1, pts[3][1], pts[3].length > 2 ? pts[3][2] : null);
        b.beat = pts; b.rate = null; row.locked = true;
    },
    addPoint(row, who, p, v) {
        const BC = BC_(), b = row.b;
        if (row.locked) { const beat = BC.curveOf(this.heardCurve(row)); beat.push([p, r3(Math.abs(v) * 2)]); b.beat = BC.curveOf(beat); b.shape = 'drawn'; }
        else { if (!b.rate) this.unlock(row); const c = BC.curveOf(b.rate[who]); c.push([p, r3(v)]); b.rate[who] = BC.curveOf(c); }
    },
    removePoint(row, who, idx) {
        const BC = BC_(), b = row.b;
        if (row.locked) { const beat = BC.curveOf(this.heardCurve(row)); if (beat.length <= 2) return; beat.splice(idx, 1); b.beat = beat; b.shape = 'drawn'; }
        else { if (!b.rate) this.unlock(row); const c = BC.curveOf(b.rate[who]); if (c.length <= 2) return; c.splice(idx, 1); b.rate[who] = c; }
    },
    slideCurve(row, who, dSec) {
        const b = row.b, L = row.length; if (!b.slide) b.slide = { lower: 0, upper: 0 };
        if (row.locked) { b.slide.lower = r3(clamp(b.slide.lower + dSec, -L, L)); b.slide.upper = r3(clamp(b.slide.upper + dSec, -L, L)); }
        else b.slide[who] = r3(clamp((b.slide[who] || 0) + dSec, -L, L));
    },

    // ONE TIME WINDOW for every row — the SEQUENCE timeline (2026-09-07 night: a region sits at its offset, the same second is the same x
    // in every row): the window starts at viewStart seconds and spans the lane's width at pxPerS; by default the sequence fills the width
    // (fit); ALT (or CTRL) + wheel over a lane zooms at the mouse, a horizontal wheel scrolls (the score's gestures); − / + / fit in the head
    windowOf(row) {
        if (row && row._viewLock) return row._viewLock;
        const content = Math.max(1, this.seqLength());
        const span = this.pxPerS ? (W - PADL - PADR) / this.pxPerS : content * 1.15;
        return { span: r3(Math.max(span, 0.5)), start: Math.max(0, +this.viewStart || 0) };
    },
    viewSpan(row) { return this.windowOf(row).span; },
    effectivePxPerS() { return this.pxPerS || (W - PADL - PADR) / this.windowOf(null).span; },
    zoomBy(k, tAtMouse, frac) {
        const cur = this.effectivePxPerS(), next = clamp(cur * k, 2, 800);
        if (tAtMouse != null && frac != null) { const span = (W - PADL - PADR) / next; this.viewStart = Math.max(0, tAtMouse - frac * span); }
        this.pxPerS = next; this.render();
        this.setStatus('zoom ' + Math.round(this.pxPerS) + ' px per second — every row on the same timeline (ALT + wheel over a lane zooms at the mouse, a horizontal wheel scrolls, fit resets)');
    },
    scrollView(dSec) {
        const content = Math.max(1, this.seqLength()), span = this.windowOf(null).span;
        this.viewStart = clamp((+this.viewStart || 0) + dSec, 0, Math.max(0, content - span * 0.25)); this.render();
    },
    laneWheel(ev, row, svg) {   // the score's wheel: ALT / CTRL = zoom at the mouse, horizontal = scroll, vertical alone passes
        if (ev.ctrlKey || ev.altKey) { ev.preventDefault(); ev.stopPropagation(); const delta = ev.deltaX || ev.deltaY; if (!delta) return; const r = svg.getBoundingClientRect(), frac = clamp((ev.clientX - r.left - PADL) / (W - PADL - PADR), 0, 1), w = this.windowOf(row); this.zoomBy(delta > 0 ? 1.18 : 0.85, w.start + frac * w.span, frac); return; }
        if (Math.abs(ev.deltaX) > 0) { ev.preventDefault(); ev.stopPropagation(); this.scrollView(ev.deltaX / this.effectivePxPerS()); }
    },
    paintZoom() { const l = this.el && this.el.querySelector('#bpZoomLbl'); if (l) l.textContent = this.pxPerS ? Math.round(this.pxPerS) + ' px/s' + (this.viewStart ? ' @ ' + r3(this.viewStart) + ' s' : '') : 'fit'; },
    // THE CURSOR: a playhead line across every lane and the strip while a pair or the sequence plays, so the curve is read as it sounds;
    // the curve's zero is the first note-on (the lead before it is the bend's pre-arm)
    startCursor(list, alone, firstStartSec) {
        const C = C_(); this.stopCursor();
        const t0 = performance.now() + 5 + (C ? C.BEATING_LEAD_MS : 300);
        this._cursor = { t0, rows: list.map(r => ({ row: r, offset: alone ? 0 : (r.zone ? (isFinite(firstStartSec) ? r.zone.startTime - firstStartSec : 0) : (r.offset || 0)) })) };
        const tick = () => { if (!this._cursor) return; this.tickCursor(performance.now()); this._cursorRaf = requestAnimationFrame(tick); };
        this._cursorRaf = requestAnimationFrame(tick);
    },
    tickCursor(nowMs) {
        const cur = this._cursor; if (!cur || !this.el) return;
        const tSeq = (nowMs - cur.t0) / 1000;
        this.rows.forEach((row, i) => {
            const entry = cur.rows.find(e => e.row === row); const t = entry ? tSeq - entry.offset : null;
            const on = !!entry && t >= 0 && t <= row.length;
            ['.bpRates', '.bpLevel', '.bpBreaths'].forEach(cls => { const svg = this.el.querySelector('.bpRow[data-row="' + i + '"] ' + cls); const line = svg && svg.querySelector('.bpCursor'); if (!line || !svg._X) return; line.style.display = on ? '' : 'none'; if (on) { const x = svg._X(t / Math.max(0.1, row.length)); line.setAttribute('x1', x); line.setAttribute('x2', x); } });
        });
        const seq = this.el.querySelector('#bpSeq'), sl = seq && seq.querySelector('.bpCursor');
        if (sl && seq._X) { const on = tSeq >= 0 && tSeq <= this.seqLength(); sl.style.display = on ? '' : 'none'; if (on) { const x = seq._X(tSeq); sl.setAttribute('x1', x); sl.setAttribute('x2', x); } }
    },
    stopCursor() { if (this._cursorRaf) cancelAnimationFrame(this._cursorRaf); this._cursorRaf = null; this._cursor = null; if (this.el) this.el.querySelectorAll('.bpCursor').forEach(l => { l.style.display = 'none'; }); },
    // the gesture card (2026-09-07 night: "I don't have in my memory what things are taken")
    showGestures() {
        this.closeNodeEditor();
        const rows = [
            ['THE LANES (the sequence timeline; the region = the pair, at its offset)', ''],
            ['a node', 'drag = time and value · SHIFT-drag = one axis only · SHIFT-click = type its time and value · ALT-click = remove'],
            ['the line', 'hold and pull = bend (the point you hold follows the mouse) · pull sideways = move the segment\'s points · CTRL-drag = slide the whole curve in time · ALT-click = straighten'],
            ['the lane', 'double-click = a new node there · draw on = a click adds'],
            ['the region\'s edges', 'drag the dashed start or end = trim or extend; every node keeps its time'],
            ['the window', 'ALT (or CTRL) + wheel = zoom at the mouse · horizontal wheel = scroll · − / + / fit in the head'],
            ['the breath lane', 'click = your breath · drag it · ALT-click = remove'],
            ['THE KEYBOARD', 'double-click a note, then click a pair\'s node = assign · click a note = arm / disarm · ESC = disarm'],
            ['THE STRIP', 'drag a zone = move it · its edges = trim · M / S = mute / solo · a click = that pair is what SPACE plays'],
            ['SPACE', 'plays what you last clicked (sequence · pair · chord); again = stop · CTRL+Z = undo (one level) · ESC = close'],
        ];
        const box = document.createElement('div'); box.id = 'bpNodeEd';
        box.style.cssText = 'position:fixed;z-index:9500;left:50%;top:80px;transform:translateX(-50%);max-width:820px;background:#26262e;border:1px solid #7B3FE4;border-radius:6px;padding:10px 14px;color:#ddd;font:12px/1.5 system-ui;box-shadow:0 6px 24px rgba(0,0,0,.6)';
        box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="color:#c9a8ff">the drawer\'s gestures</b><button id="bpNeX">&#10005;</button></div>'
            + rows.map(([k, v]) => v ? '<div style="display:flex;gap:10px;padding:2px 0;border-top:1px solid #333"><span style="flex:0 0 150px;color:#c9a8ff">' + esc(k) + '</span><span>' + esc(v) + '</span></div>' : '<div style="color:#9a9;margin-top:6px">' + esc(k) + '</div>').join('');
        document.body.appendChild(box);
        box.querySelector('#bpNeX').addEventListener('click', () => this.closeNodeEditor());
        const esc1 = ev => { if (ev.key === 'Escape') { this.closeNodeEditor(); window.removeEventListener('keydown', esc1, true); } }; window.addEventListener('keydown', esc1, true);
    },

    // ---- the rate area: the two curves over the REGION on the sequence timeline (2026-09-07 night, the composer's DAW picture) ----
    // The region sits at the pair's offset and ends at its length; its two edges TRIM it — every node keeps its own time on the timeline,
    // a node beyond a trim waits in the dimmed area until the edge comes back; the nodes inside move in real time. The line: hold and
    // pull to bend (the held point follows the mouse), sideways to move the segment's points, CTRL-drag to slide the whole curve;
    // SHIFT-click a node to type it; ALT-click removes a node or straightens a segment; a double-click on the lane adds a node; ALT /
    // CTRL + wheel zooms at the mouse, a horizontal wheel scrolls (the score's gestures). The beats themselves are marked on the centre.
    secAt(g, r, x) { return g.start + (x - r.left - g.x0) / (g.x1 - g.x0) * g.view; },   // the mouse → the timeline's seconds
    drawRates(row, svg) {
        const BC = BC_(), out = row.out, cur = this.curvesOf(row), b = row.b, S = row.scale, L = Math.max(0.1, row.length), off = row.offset || 0, win = this.windowOf(row), view = win.span, start = win.start;
        const x0 = PADL, x1 = W - PADR, mid = HR / 2, sy = (HR / 2 - 6) / S;
        const X = p => x0 + ((off + p * L - start) / view) * (x1 - x0), Y = v => mid - v * sy, ns = 'http://www.w3.org/2000/svg';
        const mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        svg.innerHTML = ''; svg._X = X;
        const xa = X(0), xb = X(1);
        // outside the region: dimmed
        if (xb < x1) svg.appendChild(mk('rect', { x: Math.max(x0, xb), y: 0, width: Math.max(0, x1 - Math.max(x0, xb)), height: HR, fill: '#000', 'fill-opacity': 0.3 }));
        if (xa > x0) svg.appendChild(mk('rect', { x: x0, y: 0, width: Math.max(0, Math.min(x1, xa) - x0), height: HR, fill: '#000', 'fill-opacity': 0.3 }));
        // the timeline's seconds along the bottom
        const tickStep = view > 40 ? 10 : view > 16 ? 5 : 1;
        for (let t = Math.ceil(start / tickStep) * tickStep; t < start + view; t += tickStep) { const x = x0 + ((t - start) / view) * (x1 - x0); svg.appendChild(mk('line', { x1: x, x2: x, y1: HR - 6, y2: HR, stroke: '#555' })); const tt = mk('text', { x: x + 2, y: HR - 8, fill: '#555', 'font-size': 9 }); tt.textContent = t; svg.appendChild(tt); }
        // the zone bands: a sliver per sample between the two players' rates (the gap = the heard beating)
        out.samples.forEach((s, k) => {
            const n = out.samples[k + 1]; if (!n) return;
            const xs = X(s.p), xe = X(n.p), top = Y(Math.max(s.rateL, s.rateU)), bot = Y(Math.min(s.rateL, s.rateU));
            svg.appendChild(mk('rect', { x: xs, y: Math.min(top, bot), width: Math.max(0.5, xe - xs), height: Math.max(0.5, Math.abs(bot - top)), fill: ZONE_FILL[s.zone] || ZONE_FILL.beating }));
        });
        // the axis: the centre line and the rate marks (Hz)
        svg.appendChild(mk('line', { x1: x0, x2: x1, y1: mid, y2: mid, stroke: '#666', 'stroke-width': 1 }));
        [S, S / 2, -S / 2, -S].forEach(v => { svg.appendChild(mk('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: '#333', 'stroke-dasharray': '2 4' })); const t = mk('text', { x: 2, y: Y(v) + 4, fill: '#777', 'font-size': 11 }); t.textContent = (v > 0 ? '+' : '') + v; svg.appendChild(t); });
        const zt = mk('text', { x: 2, y: mid + 4, fill: '#999', 'font-size': 11 }); zt.textContent = '0'; svg.appendChild(zt);
        [1, 15].forEach(z => { const y = Y(z / 2), y2 = Y(-z / 2); svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: z === 1 ? '#557' : '#744', 'stroke-dasharray': '1 5' })); svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y2, y2: y2, stroke: z === 1 ? '#557' : '#744', 'stroke-dasharray': '1 5' })); });
        // the slid curves as played (the samples) — thin
        const lineOf = (key, col) => { const d = out.samples.map((s, k) => (k ? 'L' : 'M') + X(s.p).toFixed(1) + ' ' + Y(s[key]).toFixed(1)).join(' '); svg.appendChild(mk('path', { d, fill: 'none', stroke: col, 'stroke-width': 1, 'stroke-opacity': 0.55 })); };
        lineOf('rateU', COL.upper); lineOf('rateL', COL.lower);
        // THE BEATS THEMSELVES: a mark on the centre line at every beat the pair makes (the integral of the heard rate) — the picture of the sound
        let phase = 0, beats = 0;
        for (let k = 1; k < out.samples.length; k++) {
            const s0 = out.samples[k - 1], s1 = out.samples[k], dt = s1.t - s0.t; if (dt <= 0) continue;
            const next = phase + (s0.beat + s1.beat) / 2 * dt;
            if (Math.floor(next) > Math.floor(phase)) { const f = (Math.floor(next) - phase) / Math.max(1e-9, next - phase); const t = s0.t + f * dt; beats++; svg.appendChild(mk('line', { x1: X(t / L), x2: X(t / L), y1: mid - 5, y2: mid + 5, stroke: s1.beat < 1 ? '#667' : '#e6d8ff', 'stroke-width': 1.2, 'stroke-opacity': s1.beat < 1 ? 0.5 : 0.9 })); }
            phase = next;
        }
        const bt = mk('text', { x: x0 + 4, y: HR - 5, fill: '#c9a8ff', 'font-size': 11 }); bt.textContent = beats + ' beat' + (beats === 1 ? '' : 's') + ' in ' + row.length + ' s'; svg.appendChild(bt);
        // the drawn curves — bold, sampled through their bends; a hit stroke per segment carries the line's gestures; the nodes are handles
        const drawCurve = (who, pts, col) => {
            const slide = (b.slide && b.slide[who]) || 0, sp = slide / L;
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k], c = pts[k + 1], N = 24, d = [];
                for (let j = 0; j <= N; j++) { const p = a[0] + (c[0] - a[0]) * j / N; d.push((j ? 'L' : 'M') + X(p + sp).toFixed(1) + ' ' + Y(BC.evalCurve(pts, p)).toFixed(1)); }
                const path = mk('path', { d: d.join(' '), fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }); path.style.pointerEvents = 'none'; svg.appendChild(path);
                const hit = mk('path', { d: d.join(' '), fill: 'none', stroke: 'transparent', 'stroke-width': 14 }); hit.style.cursor = 'ns-resize'; hit.style.pointerEvents = 'stroke';
                hit.innerHTML = '<title>' + (BC.ctrlOf(a) ? 'bent · ' : '') + 'hold the line and pull: the point you hold follows the mouse · sideways moves the segment\'s points · CTRL-drag slides the whole curve in time · ALT-click straightens · double-click on the lane adds a node</title>';
                hit.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); if (e.ctrlKey || e.metaKey) { this.snapshot(); this.dragBody(row, who, e, svg); return; } if (e.altKey) { this.snapshot(); this.setCtrl(row, who, k, null); this.changed(row, true); this.render(); return; } this.dragSegment(row, who, k, e, svg); });
                svg.appendChild(hit);
            }
            pts.forEach((p, idx) => {
                const outside = p[0] < -1e-6 || p[0] > 1 + 1e-6;
                const h = mk('circle', { cx: X(clamp(p[0] + sp, -1, 2)), cy: Y(p[1]), r: 5, fill: '#1a1a20', stroke: col, 'stroke-width': 2, opacity: outside ? 0.45 : 1 });
                h.style.cursor = 'move';
                h.innerHTML = '<title>' + (outside ? 'beyond the region — it waits here until the edge is pulled out · ' : '') + r3(off + p[0] * L) + ' s · drag (time and value; SHIFT clamps to one axis) · SHIFT-click or double-click to type · ALT-click removes</title>';
                h.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); if (e.altKey) { if (pts.length > 2) { this.snapshot(); this.removePoint(row, who, idx); this.changed(row, true); this.render(); } return; } this.dragHandle(row, who, idx, e, svg); });
                h.addEventListener('dblclick', e => { e.preventDefault(); e.stopPropagation(); this.openNodeEditor(row, who, idx, e, 'rate'); });
                svg.appendChild(h);
            });
        };
        drawCurve('upper', cur.upper, COL.upper); drawCurve('lower', cur.lower, COL.lower);
        // the region's edges: a handle at the start and at the end — a trim, the nodes keep their time
        [['start', xa], ['end', xb]].forEach(([which, x]) => {
            svg.appendChild(mk('line', { x1: x, x2: x, y1: 0, y2: HR, stroke: '#bbb', 'stroke-dasharray': '3 3' }));
            const hnd = mk('rect', { x: x - 4, y: 0, width: 8, height: HR, fill: '#fff', 'fill-opacity': 0.06 }); hnd.style.cursor = 'ew-resize';
            hnd.innerHTML = '<title>' + (which === 'end' ? 'the region\'s end (' + r3(off + L) + ' s): drag to trim or extend the pair — every node keeps its time' : 'the region\'s start (' + r3(off) + ' s): drag to start the pair later or earlier — every node keeps its time, the end stays') + '</title>';
            hnd.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); this.dragRegionEdge(row, which, e, svg); });
            svg.appendChild(hnd);
        });
        // the players' names and the lock state; the cursor; the wheel; a double-click adds a node; draw mode
        const nmU = mk('text', { x: x1 - 4, y: 12, fill: COL.upper, 'font-size': 12, 'text-anchor': 'end' }); nmU.textContent = (out.players.upper || '?') + ' ↑' + (b.slide && b.slide.upper ? ' slid ' + b.slide.upper + ' s' : ''); svg.appendChild(nmU);
        const nmL = mk('text', { x: x1 - 4, y: HR - 5, fill: COL.lower, 'font-size': 12, 'text-anchor': 'end' }); nmL.textContent = (out.players.lower || '?') + ' ↓' + (b.slide && b.slide.lower ? ' slid ' + b.slide.lower + ' s' : ''); svg.appendChild(nmL);
        const beatT = mk('text', { x: x0 + 4, y: 12, fill: '#c9a8ff', 'font-size': 12 }); beatT.textContent = 'beating ' + out.maxBeat + ' Hz max' + (row.locked ? ' · mirrored' : ' · free') + ' · ' + r3(off) + ' → ' + r3(off + L) + ' s'; svg.appendChild(beatT);
        svg.appendChild(mk('line', { class: 'bpCursor', x1: x0, x2: x0, y1: 0, y2: HR, stroke: '#fff', 'stroke-width': 1.5, 'pointer-events': 'none', style: 'display:none' }));
        if (!svg._wheelBound) { svg._wheelBound = true; svg.addEventListener('wheel', e => this.laneWheel(e, row, svg), { passive: false }); }
        const geom = { x0, x1, mid, sy, X, Y, view, L, start, off }; svg._geom = geom;
        const addAt = e => {   // a node where the mouse is, on the curve above or below the centre
            const r = svg.getBoundingClientRect(); const p = clamp((this.secAt(geom, r, e.clientX) - off) / L, -1, 2), v = (mid - (e.clientY - r.top)) / sy;
            const who = v >= 0 ? 'upper' : 'lower';
            this.snapshot(); this.addPoint(row, who, r3(p), r3(v)); this.changed(row, true); this.render();
        };
        const onEmpty = e => e.target === svg || e.target.tagName === 'rect' || e.target.tagName === 'line' || e.target.tagName === 'text' || (e.target.tagName === 'path' && e.target.getAttribute('stroke') !== 'transparent');
        svg.addEventListener('dblclick', e => { if (e.target.tagName === 'circle') return; e.preventDefault(); addAt(e); });
        if (row.draw) { svg.style.cursor = 'crosshair'; svg.addEventListener('mousedown', e => { if (!onEmpty(e)) return; addAt(e); }); }
    },
    // the region's edge dragged: a trim or an extension; the time window stays put so the edge follows the mouse
    dragRegionEdge(row, which, e0, svg) {
        this.snapshot();
        const g = svg._geom, r = svg.getBoundingClientRect(); row._viewLock = { span: g.view, start: g.start }; let moved = false;
        const onMove = ev => {
            moved = true; const t = r3(Math.round(this.secAt(g, r, ev.clientX) / 0.05) * 0.05), off = row.offset || 0;
            if (which === 'end') { const len = clamp(t - off, 0.5, 180); if (len !== row.length) this.resizeKeepTimes(row, len, false); }
            else { const ns = clamp(t, 0, off + row.length - 0.5); if (Math.abs(ns - off) > 1e-9) this.resizeKeepTimes(row, off + row.length - ns, true); }
            this.rowOut(row); this.drawRates(row, svg); this.drawSeq(); this.changed(row, false);
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); delete row._viewLock; if (!moved) { this._undo = null; this.paintUndo(); return; } this.changed(row, true); this.render(); this.setStatus('pair ' + (this.rows.indexOf(row) + 1) + ' ' + r3(row.offset || 0) + ' → ' + r3((row.offset || 0) + row.length) + ' s — the nodes kept their time'); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },
    // hold the line and pull (the score's startBendDrag): the column where the line was grabbed is the control's x, and as the mouse moves
    // the control's y is solved so the held point of the line follows the mouse — two degrees of freedom; a sideways pull moves the
    // segment's points instead (the mode from the first movement); a click without movement changes nothing
    dragSegment(row, who, k, e0, svg) {
        this.snapshot();
        const BC = BC_(), g = svg._geom, r = svg.getBoundingClientRect(), b = row.b, x0 = e0.clientX, y0 = e0.clientY; let mode = null, moved = false;
        const cur0 = this.curvesOf(row)[who], a0 = cur0[k], c0 = cur0[k + 1]; if (!a0 || !c0) return;
        const n = cur0.length, pA = a0[0], pC = c0[0], y1 = a0[1], y2 = c0[1];
        const sp = ((b.slide && b.slide[who]) || 0) / g.L;
        const pGrab = (this.secAt(g, r, e0.clientX) - g.off) / g.L - sp;
        const cx = clamp((pGrab - pA) / Math.max(1e-6, pC - pA), 0.08, 0.92), bT = BC.bezierT(cx, cx), w2 = 2 * (1 - bT) * bT;
        const movA = k > 0, movC = k + 1 < n - 1, lo = k > 0 ? cur0[k - 1][0] + 0.01 : -1, hi = k + 2 < n ? cur0[k + 2][0] - 0.01 : 2;
        const onMove = ev => {
            const dx = ev.clientX - x0, dy = ev.clientY - y0;
            if (!mode) { if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return; mode = Math.abs(dy) >= Math.abs(dx) ? 'bend' : 'shift'; svg.style.cursor = mode === 'bend' ? 'ns-resize' : 'ew-resize'; }
            moved = true;
            if (mode === 'bend') {
                const v = clamp((g.mid - (ev.clientY - r.top)) / g.sy, -row.scale, row.scale);   // the value under the mouse, in the curve's units
                const cy = (v - (1 - bT) * (1 - bT) * y1 - bT * bT * y2) / Math.max(1e-6, w2);
                this.setCtrl(row, who, k, [cx, cy]);
            } else if (movA || movC) {
                let s = dx / (g.x1 - g.x0) * g.view / g.L;
                if (movA) s = clamp(s, lo - pA, (movC ? hi - (pC - pA) : pC - 0.01) - pA);
                if (movC) s = clamp(s, (movA ? lo + (pC - pA) : pA + 0.01) - pC, hi - pC);
                if (movA) this.setPoint(row, who, k, r3(pA + s), a0[1]);
                if (movC) this.setPoint(row, who, k + 1, r3(pC + s), c0[1]);
            }
            this.rowOut(row); this.drawRates(row, svg); this.changed(row, false);
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); svg.style.cursor = ''; if (!moved) { this._undo = null; this.paintUndo(); return; } this.changed(row, true); this.render(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },
    // a node: drag in time and value (between its neighbours); SHIFT-drag clamps to one axis; SHIFT-click (no movement) types it; a click
    // without movement changes nothing, so a double-click finds the same node twice
    dragHandle(row, who, idx, e0, svg) {
        this.snapshot();
        const BC = BC_(), g = svg._geom, r = svg.getBoundingClientRect(), b = row.b, cur = this.curvesOf(row)[who], n = cur.length;
        const slide = (b.slide && b.slide[who]) || 0, sp = slide / g.L, xs = e0.clientX, ys = e0.clientY, shiftAtStart = !!e0.shiftKey;
        const p0 = cur[idx][0], v0 = cur[idx][1], lo = idx > 0 ? cur[idx - 1][0] + 0.005 : -1, hi = idx + 1 < n ? cur[idx + 1][0] - 0.005 : 2; let axis = null, moved = false;
        const tip = document.createElementNS('http://www.w3.org/2000/svg', 'text'); tip.setAttribute('fill', '#fff'); tip.setAttribute('font-size', '12'); svg.appendChild(tip);
        const onMove = ev => {
            if (!moved) { if (Math.abs(ev.clientX - xs) < 3 && Math.abs(ev.clientY - ys) < 3) return; moved = true; }
            let p = clamp((this.secAt(g, r, ev.clientX) - g.off) / g.L - sp, lo, hi); let v = clamp((g.mid - (ev.clientY - r.top)) / g.sy, -row.scale, row.scale);
            if (ev.shiftKey) { if (!axis) { const dx = Math.abs(ev.clientX - xs), dy = Math.abs(ev.clientY - ys); axis = dx >= dy ? 'x' : 'y'; } if (axis === 'x') v = v0; else p = p0; }
            const vv = who === 'upper' ? Math.max(0, v) : Math.min(0, v);   // above the centre for the upper, below for the lower
            const wasLocked = row.locked; if (ev.altKey && row.locked) { row.locked = false; this.unlock(row); }
            this.setPoint(row, who, idx, r3(p), r3(vv));
            row.locked = row.locked && wasLocked;
            this.rowOut(row);
            tip.setAttribute('x', clamp(ev.clientX - r.left + 8, 4, W - 110)); tip.setAttribute('y', clamp(ev.clientY - r.top - 8, 10, HR - 4));
            tip.textContent = (row.locked ? (Math.abs(vv) * 2).toFixed(2) + ' Hz heard' : Math.abs(vv).toFixed(2) + ' Hz ' + who) + ' · ' + r3(g.off + p * g.L) + ' s' + (axis ? (axis === 'x' ? ' · time only' : ' · value only') : '');
            this.drawRates(row, svg); svg.appendChild(tip);
            this.changed(row, false);
        };
        const onUp = ev => {
            window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); tip.remove();
            if (!moved) { this._undo = null; this.paintUndo(); if (shiftAtStart) this.openNodeEditor(row, who, idx, ev, 'rate'); return; }   // a click: nothing moved, nothing re-drawn; SHIFT-click types
            this.changed(row, true); this.render();
        };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },
    // a node typed (SHIFT-click, or a double-click): a small box at the node with its time on the timeline in seconds and its value — Hz
    // heard on a rate curve, a dynamic (ppp … fff) or 0 … 1 on the crescendo; ENTER applies, ESC closes
    openNodeEditor(row, who, idx, e, lane) {
        this.closeNodeEditor();
        const BC = BC_(), L = Math.max(0.1, row.length), off = row.offset || 0;
        const pts = lane === 'rate' ? this.curvesOf(row)[who] : (this.levelPts(row) || {})[who]; if (!pts || !pts[idx]) return;
        const p = pts[idx], isRate = lane === 'rate';
        const box = document.createElement('div'); box.id = 'bpNodeEd';
        box.style.cssText = 'position:fixed;z-index:9500;left:' + Math.min(window.innerWidth - 250, e.clientX + 10) + 'px;top:' + Math.max(4, e.clientY - 40) + 'px;background:#26262e;border:1px solid #7B3FE4;border-radius:4px;padding:6px 8px;color:#ddd;font:12px system-ui;display:flex;gap:6px;align-items:center;box-shadow:0 4px 16px rgba(0,0,0,.5)';
        box.innerHTML = '<label>time <input id="bpNeT" type="number" step="0.05" value="' + r3(off + p[0] * L) + '" style="width:64px" title="on the timeline, in seconds"> s</label>'
            + '<label>' + (isRate ? 'value <input id="bpNeV" type="text" value="' + r3(Math.abs(p[1]) * (row.locked ? 2 : 1)) + '" style="width:56px"> Hz' + (row.locked ? ' heard' : ' ' + who) : 'level <input id="bpNeV" type="text" value="' + dynName(p[1]) + '" style="width:56px" title="ppp … fff or 0 … 1">') + '</label>'
            + '<button id="bpNeOk">set</button><button id="bpNeX" title="ESC">&#10005;</button>';
        document.body.appendChild(box);
        const apply = () => {
            const tIn = parseFloat(box.querySelector('#bpNeT').value), vRaw = box.querySelector('#bpNeV').value;
            const pNew = clamp(((isNaN(tIn) ? off + p[0] * L : tIn) - off) / L, -1, 2);
            this.snapshot();
            if (isRate) {
                const v = parseFloat(vRaw); if (isNaN(v)) { this.setStatus('a number of Hz, please', true); return; }
                const heardOrOwn = Math.max(0, v), val = row.locked ? heardOrOwn / 2 : heardOrOwn;
                this.setPoint(row, who, idx, r3(pNew), r3(who === 'upper' ? val : -val));
            } else {
                const v = parseLevel(vRaw); if (v == null) { this.setStatus('a dynamic (ppp … fff) or a number 0 … 1, please', true); return; }
                const cur = this.levelPts(row)[who]; cur[idx] = cur[idx].length > 2 ? [r3(pNew), v, cur[idx][2]] : [r3(pNew), v]; this.setLevelPts(row, who, BC.curveOf(cur));
            }
            this.closeNodeEditor(); this.changed(row, true); this.render();
        };
        box.querySelector('#bpNeOk').addEventListener('click', apply);
        box.querySelector('#bpNeX').addEventListener('click', () => this.closeNodeEditor());
        box.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); apply(); } else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); this.closeNodeEditor(); } else ev.stopPropagation(); });
        const first = box.querySelector('#bpNeV'); first.focus(); first.select();
    },
    closeNodeEditor() { const old = document.getElementById('bpNodeEd'); if (old) old.remove(); },
    dragBody(row, who, e0, svg) {
        const g = svg._geom, x0 = e0.clientX; let last = 0, moved = false;
        const onMove = ev => { const d = (ev.clientX - x0) / (g.x1 - g.x0) * g.view; const step = r3(d - last); if (!step) return; moved = true; last = r3(last + step); if (ev.altKey && row.locked) { row.locked = false; this.unlock(row); } this.slideCurve(row, who, step); this.rowOut(row); this.drawRates(row, svg); this.changed(row, false); };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); if (!moved) return; this.changed(row, true); this.render(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },

    // ---- the crescendo lane ----
    // One curve for both players, or one per player; on the same timeline window as the rates (the region at its offset, the nodes at
    // their own time); the same gestures: hold the line to bend or shift, SHIFT-click a node to type, ALT-click removes, a double-click
    // adds; the axis in dynamics (ppp … fff); the players' ideal breath lengths as faint ticks
    levelPts(row) {   // the edited crescendo curves, or null while it follows the beating (a legacy single array serves both players)
        const BC = BC_(), lc = row.b.levelCurve; if (!lc) return null;
        if (Array.isArray(lc)) return { lower: BC.curveOf(lc), upper: BC.curveOf(lc) };
        return { lower: BC.curveOf(lc.lower || lc.upper || 0.6), upper: BC.curveOf(lc.upper || lc.lower || 0.6) };
    },
    setLevelPts(row, who, pts) {   // together: both players take the edit; each: this player alone
        const cur = this.levelPts(row) || { lower: pts, upper: pts }, copy = a => JSON.parse(JSON.stringify(a));
        row.b.levelCurve = row.levelLock !== false ? { lower: copy(pts), upper: copy(pts) } : Object.assign(cur, { [who]: copy(pts) });
    },
    popLevelShape(row, key) {
        const BC = BC_(), b = row.b, lo = b.levelLo == null ? 0.3 : b.levelLo, hi = b.levelHi == null ? 0.9 : b.levelHi;
        let pts;
        if (key.indexOf('u:') === 0) { const sh = this.shapesBank[key.slice(2)]; if (!sh) return; pts = BC.curveOf(sh.curve).map(p => (p.length > 2 ? [p[0], r3(lo + (hi - lo) * p[1]), p[2]] : [p[0], r3(lo + (hi - lo) * p[1])])); }
        else pts = BC.shape(key, { level: hi, from: key === 'rampIn' ? hi : lo, to: key === 'rampIn' ? lo : hi, peak: hi, base: lo, length: row.length, attackS: b.adsr && b.adsr.attackS, releaseS: b.adsr && b.adsr.releaseS });
        b.levelCurve = { lower: pts.map(p => p.slice()), upper: pts.map(p => p.slice()) };
    },
    drawLevel(row, svg) {
        const BC = BC_(), out = row.out, b = row.b, ns = 'http://www.w3.org/2000/svg', L = Math.max(0.1, row.length), off = row.offset || 0, win = this.windowOf(row), view = win.span, start = win.start;
        const x0 = PADL, x1 = W - PADR, X = p => x0 + ((off + p * L - start) / view) * (x1 - x0), Y = v => HL - 4 - clamp(v, 0, 1) * (HL - 10);
        const mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        svg.innerHTML = ''; svg._X = X;
        const xa = X(0), xb = X(1);
        if (xb < x1) svg.appendChild(mk('rect', { x: Math.max(x0, xb), y: 0, width: Math.max(0, x1 - Math.max(x0, xb)), height: HL, fill: '#000', 'fill-opacity': 0.3 }));
        if (xa > x0) svg.appendChild(mk('rect', { x: x0, y: 0, width: Math.max(0, Math.min(x1, xa) - x0), height: HL, fill: '#000', 'fill-opacity': 0.3 }));
        [xa, xb].forEach(x => svg.appendChild(mk('line', { x1: x, x2: x, y1: 0, y2: HL, stroke: '#bbb', 'stroke-dasharray': '3 3' })));
        // the ideal breath lengths as faint ticks, per player (the ceiling at this level, from the start)
        for (const who of ['lower', 'upper']) { const br = out.breaths[who], col = who === 'upper' ? COL.upper : COL.lower; if (!br || !br.ceiling || !(br.ceiling.seconds > 0)) continue; for (let t = br.ceiling.seconds; t < L - 0.05; t += br.ceiling.seconds) svg.appendChild(mk('line', { x1: X(t / L), x2: X(t / L), y1: 2, y2: HL - 2, stroke: col, 'stroke-opacity': 0.35, 'stroke-dasharray': '1 3' })); }
        const lp = this.levelPts(row);
        const fillOf = key => { const d = out.samples.map((s, k) => (k ? 'L' : 'M') + X(s.p).toFixed(1) + ' ' + Y(s[key]).toFixed(1)).join(' '); return d + ' L' + X(1).toFixed(1) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + ' Z'; };
        svg.appendChild(mk('path', { d: fillOf('levelU'), fill: COL.upper, 'fill-opacity': 0.1, stroke: 'none' }));
        svg.appendChild(mk('path', { d: fillOf('levelL'), fill: COL.lower, 'fill-opacity': 0.1, stroke: 'none' }));
        [[0, 'ppp'], [4 / 7, 'mf'], [1, 'fff']].forEach(([v, name]) => { const t = mk('text', { x: 2, y: Y(v) + 3, fill: '#777', 'font-size': 10 }); t.textContent = name; svg.appendChild(t); });
        const lbl = mk('text', { x: x1 - 4, y: 11, fill: COL.level, 'font-size': 12, 'text-anchor': 'end' }); lbl.textContent = (lp ? (row.levelLock !== false ? 'one crescendo, both players' : 'a crescendo per player') : 'follows the beating') + ' · ' + dynName(b.levelLo == null ? 0.3 : b.levelLo) + ' → ' + dynName(b.levelHi == null ? 0.9 : b.levelHi); svg.appendChild(lbl);
        svg.appendChild(mk('line', { class: 'bpCursor', x1: x0, x2: x0, y1: 0, y2: HL, stroke: '#fff', 'stroke-width': 1.5, 'pointer-events': 'none', style: 'display:none' }));
        if (!svg._wheelBound) { svg._wheelBound = true; svg.addEventListener('wheel', e => this.laneWheel(e, row, svg), { passive: false }); }
        const geom = { x0, x1, view, L, start, off }; svg._geom = geom;
        if (!lp) {   // following: the two sample lines
            [['levelU', COL.upper], ['levelL', COL.lower]].forEach(([key, col]) => { const d = out.samples.map((s, k) => (k ? 'L' : 'M') + X(s.p).toFixed(1) + ' ' + Y(s[key]).toFixed(1)).join(' '); svg.appendChild(mk('path', { d, fill: 'none', stroke: col, 'stroke-width': 1.4 })); });
            svg.innerHTML += '<title>the crescendo follows the beating between low and high — pick a shape or double-click to draw one</title>';
            svg.addEventListener('dblclick', e => { e.preventDefault(); this.snapshot(); this.popLevelShape(row, 'hump'); this.changed(row, true); this.render(); });
            return;
        }
        const drawOne = (who, pts, col) => {
            const together = row.levelLock !== false;
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k], c = pts[k + 1], N = 20, d = [];
                for (let j = 0; j <= N; j++) { const p = a[0] + (c[0] - a[0]) * j / N; d.push((j ? 'L' : 'M') + X(p).toFixed(1) + ' ' + Y(BC.evalCurve(pts, p)).toFixed(1)); }
                svg.appendChild(mk('path', { d: d.join(' '), fill: 'none', stroke: col, 'stroke-width': together && who === 'lower' ? 1 : 1.8, 'stroke-opacity': together && who === 'lower' ? 0.5 : 1, 'pointer-events': 'none' }));
                if (together && who === 'lower') continue;   // one set of gestures while the two are the same curve
                const hit = mk('path', { d: d.join(' '), fill: 'none', stroke: 'transparent', 'stroke-width': 12 }); hit.style.cursor = 'ns-resize'; hit.style.pointerEvents = 'stroke';
                hit.innerHTML = '<title>hold the line and pull: the point you hold follows the mouse · sideways moves the segment\'s points (a plateau slides) · ALT-click straightens · double-click on the lane adds a node</title>';
                hit.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); if (e.altKey) { this.snapshot(); const cur = this.levelPts(row)[who]; cur[k] = [cur[k][0], cur[k][1]]; this.setLevelPts(row, who, cur); this.changed(row, true); this.render(); return; } this.dragLevelSegment(row, who, k, e, svg); });
                svg.appendChild(hit);
            }
            if (together && who === 'lower') return;
            pts.forEach((p, idx) => {
                const outside = p[0] < -1e-6 || p[0] > 1 + 1e-6;
                const h = mk('circle', { cx: X(clamp(p[0], -1, 2)), cy: Y(p[1]), r: 4.5, fill: '#1a1a20', stroke: col, 'stroke-width': 2, opacity: outside ? 0.45 : 1 }); h.style.cursor = 'move';
                h.innerHTML = '<title>' + dynName(p[1]) + ' at ' + r3(off + p[0] * L) + ' s — drag (SHIFT clamps to one axis) · SHIFT-click or double-click to type · ALT-click removes</title>';
                h.addEventListener('dblclick', e => { e.preventDefault(); e.stopPropagation(); this.openNodeEditor(row, who, idx, e, 'level'); });
                h.addEventListener('mousedown', e => {
                    e.preventDefault(); e.stopPropagation();
                    if (e.altKey) { if (pts.length > 2) { this.snapshot(); const cur = this.levelPts(row)[who]; cur.splice(idx, 1); this.setLevelPts(row, who, cur); this.changed(row, true); this.render(); } return; }
                    this.snapshot();
                    const r = svg.getBoundingClientRect(), n = pts.length, xs = e.clientX, ys = e.clientY, shiftAtStart = !!e.shiftKey, p0 = p[0], v0 = p[1];
                    const lo = idx > 0 ? pts[idx - 1][0] + 0.005 : -1, hi = idx + 1 < n ? pts[idx + 1][0] - 0.005 : 2; let moved = false, axis = null;
                    const onMove = ev => {
                        if (!moved) { if (Math.abs(ev.clientX - xs) < 3 && Math.abs(ev.clientY - ys) < 3) return; moved = true; }
                        let pp = clamp((this.secAt(geom, r, ev.clientX) - off) / L, lo, hi); let v = clamp((HL - 4 - (ev.clientY - r.top)) / (HL - 10), 0, 1);
                        if (ev.shiftKey) { if (!axis) { axis = Math.abs(ev.clientX - xs) >= Math.abs(ev.clientY - ys) ? 'x' : 'y'; } if (axis === 'x') v = v0; else pp = p0; }
                        const cur = this.levelPts(row)[who]; cur[idx] = cur[idx].length > 2 ? [r3(pp), r3(v), cur[idx][2]] : [r3(pp), r3(v)]; this.setLevelPts(row, who, cur); this.rowOut(row); this.drawLevel(row, svg); this.changed(row, false);
                    };
                    const onUp = ev => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); if (!moved) { this._undo = null; this.paintUndo(); if (shiftAtStart) this.openNodeEditor(row, who, idx, ev, 'level'); return; } this.changed(row, true); this.render(); };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                });
                svg.appendChild(h);
            });
        };
        drawOne('lower', lp.lower, COL.lower); drawOne('upper', lp.upper, COL.upper);
        svg.addEventListener('dblclick', e => {   // a node on the curve nearer the mouse (the upper when together)
            if (e.target.tagName === 'circle') return; e.preventDefault();
            const r = svg.getBoundingClientRect(); const p = clamp((this.secAt(geom, r, e.clientX) - off) / L, -1, 2), v = clamp((HL - 4 - (e.clientY - r.top)) / (HL - 10), 0, 1);
            const who = row.levelLock !== false ? 'upper' : (Math.abs(BC.evalCurve(lp.upper, p) - v) <= Math.abs(BC.evalCurve(lp.lower, p) - v) ? 'upper' : 'lower');
            this.snapshot(); const cur = this.levelPts(row)[who]; cur.push([r3(p), r3(v)]); this.setLevelPts(row, who, BC.curveOf(cur)); this.changed(row, true); this.render();
        });
    },
    dragLevelSegment(row, who, k, e0, svg) {
        this.snapshot();
        const BC = BC_(), g = svg._geom, r = svg.getBoundingClientRect(), x0 = e0.clientX, y0 = e0.clientY; let mode = null, moved = false;
        const cur0 = this.levelPts(row)[who].map(p => JSON.parse(JSON.stringify(p))), a0 = cur0[k], c0 = cur0[k + 1]; if (!a0 || !c0) return;
        const n = cur0.length, pA = a0[0], pC = c0[0], y1 = a0[1], y2 = c0[1];
        const pGrab = (this.secAt(g, r, e0.clientX) - g.off) / g.L, cx = clamp((pGrab - pA) / Math.max(1e-6, pC - pA), 0.08, 0.92), bT = BC.bezierT(cx, cx), w2 = 2 * (1 - bT) * bT;
        const movA = k > 0, movC = k + 1 < n - 1, lo = k > 0 ? cur0[k - 1][0] + 0.01 : -1, hi = k + 2 < n ? cur0[k + 2][0] - 0.01 : 2;
        const onMove = ev => {
            const dx = ev.clientX - x0, dy = ev.clientY - y0;
            if (!mode) { if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return; mode = Math.abs(dy) >= Math.abs(dx) ? 'bend' : 'shift'; svg.style.cursor = mode === 'bend' ? 'ns-resize' : 'ew-resize'; }
            moved = true;
            const cur = cur0.map(p => JSON.parse(JSON.stringify(p)));
            if (mode === 'bend') { const v = clamp((HL - 4 - (ev.clientY - r.top)) / (HL - 10), -0.2, 1.2); const cy = clamp((v - (1 - bT) * (1 - bT) * y1 - bT * bT * y2) / Math.max(1e-6, w2), -0.5, 1.5); cur[k] = [cur[k][0], cur[k][1], [cx, r3(cy)]]; }
            else if (movA || movC) {
                let s = dx / (g.x1 - g.x0) * g.view / g.L;
                if (movA) s = clamp(s, lo - pA, (movC ? hi - (pC - pA) : pC - 0.01) - pA);
                if (movC) s = clamp(s, (movA ? lo + (pC - pA) : pA + 0.01) - pC, hi - pC);
                if (movA) cur[k][0] = r3(pA + s); if (movC) cur[k + 1][0] = r3(pC + s);
            }
            this.setLevelPts(row, who, cur); this.rowOut(row); this.drawLevel(row, svg); this.changed(row, false);
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); svg.style.cursor = ''; if (!moved) { this._undo = null; this.paintUndo(); return; } this.changed(row, true); this.render(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },

    // ---- the breath lane: per player the ideal breath lengths as faint ticks, the marks as dotted lines (yours bold, the dealt ones thin),
    // drag to move, click to add, ALT-click to remove; one ⚠ where a span is longer than the ceiling; on the same timeline window ----
    drawBreaths(row, svg, info) {
        const BC = BC_(), out = row.out, b = row.b, ns = 'http://www.w3.org/2000/svg', L = Math.max(0.1, row.length), off = row.offset || 0, win = this.windowOf(row), view = win.span, start = win.start;
        const x0 = PADL, x1 = W - PADR, X = t => x0 + ((off + t - start) / view) * (x1 - x0), tAt = x => start + (x - x0) / (x1 - x0) * view - off;
        const mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        svg.innerHTML = ''; svg._X = p => X(p * L);
        const xa = X(0), xb = X(L);
        if (xb < x1) svg.appendChild(mk('rect', { x: Math.max(x0, xb), y: 0, width: Math.max(0, x1 - Math.max(x0, xb)), height: HB, fill: '#000', 'fill-opacity': 0.3 }));
        if (xa > x0) svg.appendChild(mk('rect', { x: x0, y: 0, width: Math.max(0, Math.min(x1, xa) - x0), height: HB, fill: '#000', 'fill-opacity': 0.3 }));
        [xa, xb].forEach(x => svg.appendChild(mk('line', { x1: x, x2: x, y1: 0, y2: HB, stroke: '#bbb', 'stroke-dasharray': '3 3' })));
        const rowsY = { upper: 15, lower: 41 };
        const over = [];
        for (const who of ['upper', 'lower']) {
            const br = out.breaths[who], inst = out.players[who], y = rowsY[who], col = who === 'upper' ? COL.upper : COL.lower;
            const nm = mk('text', { x: 2, y: y + 4, fill: col, 'font-size': 11 }); nm.textContent = (inst || '?').slice(0, 5); svg.appendChild(nm);
            svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: '#444' }));
            const ceil = br.ceiling && br.ceiling.seconds > 0 ? br.ceiling.seconds : 0;
            if (ceil) for (let t = ceil; t < L - 0.05; t += ceil) svg.appendChild(mk('line', { x1: X(t), x2: X(t), y1: y - 7, y2: y + 7, stroke: col, 'stroke-opacity': 0.35, 'stroke-dasharray': '1 2' }));
            (br.spans || []).forEach(sp => { if (br.mode !== 'continuous' && ceil && sp[1] - sp[0] > ceil + 1e-6) { over.push(who); svg.appendChild(mk('rect', { x: X(sp[0]), y: y - 3, width: Math.max(1, X(sp[1]) - X(sp[0])), height: 6, fill: COL.bad, 'fill-opacity': 0.25, rx: 2 })); } });
            (br.marks || []).forEach(m => {
                const hand = b.breath.marks && b.breath.marks[who] && b.breath.marks[who].includes(m);
                svg.appendChild(mk('line', { x1: X(m), x2: X(m), y1: y - 11, y2: y + 11, stroke: COL.breath, 'stroke-width': hand ? 2 : 1, 'stroke-dasharray': hand ? '3 2' : '2 3', 'stroke-opacity': hand ? 1 : 0.7 }));
                const h = mk('circle', { cx: X(m), cy: y, r: 4.5, fill: hand ? COL.breath : '#1a1a20', stroke: COL.breath, 'stroke-width': 1.5 }); h.style.cursor = 'ew-resize';
                h.innerHTML = '<title>' + (hand ? 'your breath' : 'a dealt breath') + ' at ' + r3(off + m) + ' s — drag; ALT-click removes</title>';
                h.addEventListener('mousedown', e => {
                    e.preventDefault(); e.stopPropagation(); this.snapshot();
                    if (!b.breath.marks) b.breath.marks = { lower: [], upper: [] }; if (!b.breath.marks[who]) b.breath.marks[who] = [];
                    const handList = b.breath.marks[who], isHand = handList.includes(m);
                    if (e.altKey) {   // your mark goes; a dealt one: the others become yours and the deal stops
                        if (isHand) b.breath.marks[who] = handList.filter(x => x !== m);
                        else { b.breath.deal = false; b.breath.marks[who] = (br.marks || []).filter(x => x !== m); }
                        b.breath.mode = 'designated'; this.changed(row, true); this.render(); return;
                    }
                    const r = svg.getBoundingClientRect(); const others = handList.filter(x => x !== m); let moved = false;
                    const onMove = ev => { moved = true; const cur = r3(clamp(tAt(ev.clientX - r.left), 0.1, L - 0.1)); b.breath.mode = 'designated'; b.breath.marks[who] = others.concat([cur]).sort((p, q) => p - q); this.rowOut(row); this.drawBreaths(row, svg, info); this.changed(row, false); };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); if (!moved) { this._undo = null; this.paintUndo(); return; } this.changed(row, true); this.render(); };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                });
                svg.appendChild(h);
            });
            if (ceil) { const ct = mk('text', { x: x1 - 4, y: y + 4, fill: '#666', 'font-size': 10, 'text-anchor': 'end' }); ct.textContent = 'ideal ≤ ' + ceil + ' s'; svg.appendChild(ct); }
        }
        svg.appendChild(mk('line', { class: 'bpCursor', x1: x0, x2: x0, y1: 0, y2: HB, stroke: '#fff', 'stroke-width': 1.5, 'pointer-events': 'none', style: 'display:none' }));
        if (!svg._wheelBound) { svg._wheelBound = true; svg.addEventListener('wheel', e => this.laneWheel(e, row, svg), { passive: false }); }
        svg.style.cursor = 'copy';
        svg.addEventListener('mousedown', e => {   // a click on the lane places your breath for that player (inside the region)
            if (e.target.tagName === 'circle') return;
            const r = svg.getBoundingClientRect(); const t = tAt(e.clientX - r.left); if (t < 0.1 || t > L - 0.1) return;
            this.snapshot();
            const who = (e.clientY - r.top) < 28 ? 'upper' : 'lower';
            if (!b.breath.marks) b.breath.marks = { lower: [], upper: [] }; if (!b.breath.marks[who]) b.breath.marks[who] = [];
            b.breath.mode = 'designated'; b.breath.marks[who] = b.breath.marks[who].concat([r3(t)]).sort((p, q) => p - q);   // yours; a deal keeps it
            this.changed(row, true); this.render();
        });
        if (info) { const mode = (b.breath.mode || 'one') !== 'designated' ? 'one breath each' : (b.breath.deal === false ? 'your marks only' : ((b.breath.phase == null ? 0.5 : +b.breath.phase) === 0 ? 'unison' : 'random') + ' · ' + (out.breaths.lower.marks || []).length + ' + ' + (out.breaths.upper.marks || []).length + ' marks'); info.textContent = mode + (over.length ? ' · ⚠ ' + [...new Set(over)].map(w => out.players[w]).join(', ') + ' past the ideal length' : ''); info.style.color = over.length ? COL.bad : '#888'; }
    },

    // ------------------------------------------------------------------ the pitch side (step 5): the bank, the keyboard, assigning, the relations
    async loadDb() {
        if (this.db) return this.db;
        try { const r = await fetch(DB_URL + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); this.db = await r.json(); }
        catch (e) { this.setStatus('the bank of strikes could not be read (' + e.message + ') — the keyboard works without it', true); this.db = { strikes: {}, sequences: {} }; }
        // the earlier pieces' harmonies (tools/harmony_scrape.js → bank/harmonies.json): the tuba's blasts, the two-piano chord shapes
        try { const r = await fetch('/bank/harmonies.json?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) this.banks = await r.json(); } catch (e) { this.banks = null; }
        this.fillSources();
        return this.db;
    },
    // ---- the harmonies on the left (CN-36): one scroll, three collapsible banners — the strikes, the tuba's blasts, the two-piano chord shapes ----
    BANNERS: [['strikes', 'STRIKES'], ['blasts', 'BLASTS · the tuba piece'], ['chordShapes', 'CHORD SHAPES · 2 pianos 2 percussion']],
    entriesOf(bank) {
        if (bank === 'strikes') return this.sourceList().map(s => ({ id: s.id, label: '#' + s.index, name: s.t0.toFixed(2) + ' s', n: s.notes.length, range: nn(s.stats.midi.min) + '–' + nn(s.stats.midi.max), pitches: s.notes.map(q => q.midi) }));
        const b = this.banks && this.banks.banks && this.banks.banks[bank];
        return b && b.entries ? b.entries.map(e => ({ id: e.id, label: e.id, name: e.name, n: e.n, range: e.range, pitches: e.pitches, aliases: e.aliases || [] })) : [];
    },
    renderList() {
        const host = this.el && this.el.querySelector('#bpList'); if (!host) return;
        let h = '';
        for (const [key, title] of this.BANNERS) {
            const es = this.entriesOf(key), open = !this.collapsed[key];
            h += '<div class="bpBanner" data-bank="' + key + '" title="click to ' + (open ? 'collapse' : 'expand') + '" style="position:sticky;top:0;z-index:1;background:#1b1b20;padding:3px 8px;cursor:pointer;color:#c9a8ff;border-bottom:1px solid #333;font-weight:600;white-space:nowrap">' + (open ? '&#9662; ' : '&#9656; ') + esc(title) + ' <span style="color:#777;font-weight:400">' + es.length + '</span></div>';
            if (open) es.forEach(e => {
                const on = this.harmony && this.harmony.bank === key && this.harmony.id === e.id;
                h += '<div class="bpEntry" data-bank="' + key + '" data-id="' + esc(e.id) + '" style="padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap;' + (on ? 'background:rgba(123,63,228,.3)' : '') + '" title="' + esc(e.name) + (e.aliases && e.aliases.length ? ' · also ' + e.aliases.join(' ') : '') + '">'
                    + '<span style="color:#777;width:56px;overflow:hidden;flex:none">' + esc(e.label) + '</span><span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">' + esc(e.name) + '</span><span style="color:#bbb;flex:none">' + e.n + ' n</span><span style="color:#777;flex:none">' + esc(e.range) + '</span></div>';
            });
        }
        host.innerHTML = h;
        host.querySelectorAll('.bpBanner').forEach(el => el.addEventListener('click', () => { const k = el.dataset.bank; this.collapsed[k] = !this.collapsed[k]; this.renderList(); }));
        host.querySelectorAll('.bpEntry').forEach(el => el.addEventListener('click', () => { this.focus = 'chord'; this.pickHarmony(el.dataset.bank, el.dataset.id); }));
        const on = host.querySelector('.bpEntry[style*="rgba(123,63,228"]'); if (on && typeof on.scrollIntoView === 'function') { try { on.scrollIntoView({ block: 'nearest' }); } catch (e) { } }
    },
    pickHarmony(bank, id) {
        if (bank === 'strikes') { this.pickSource(id); return; }
        const e = this.entriesOf(bank).find(x => x.id === id); if (!e) return;
        this.rememberHarmony();
        this.harmony = { bank, id }; this.chordId = ''; this.rootMode = false; this.setChord(e.pitches.map(m => ({ midi: m })), { noHistory: true });
        this.renderList();
        const nm = this.el.querySelector('#bpChordName'); if (nm) nm.textContent = e.label + ' · ' + e.name;
        this.setStatus(e.label + ' ' + e.name + ' (' + e.n + ' notes, ' + e.range + ') on the keyboard — &#9654; chord hears it on the piano; click or double-click a note, then a pair\'s node'.replace('&#9654;', '▶'));
    },
    // hear the chord alone, on the piano voice (CN-36: "use the piano voice for play back of just the harmony")
    async hearChord() {
        const C = C_(); if (!C) return;
        if (!this.chord.length) { this.setStatus('no chord on the keyboard — pick one on the left', true); return; }
        if (!C._zoneMidiInited) await C.initZoneMidi();
        const r = C.beatingRouting(2), out = r && C._zoneMidiOutputs[(r.port || '').toLowerCase()];
        if (!out) { this.setStatus('the piano has no MIDI output — is the rack up?', true); return; }
        const ch = (r.channel || 1) - 1, now = performance.now() + 5, dur = 1500;
        out.send([0xB0 | ch, 7, 127], now); if (r.cc0 != null) out.send([0xB0 | ch, 0, r.cc0], now);
        const keys = [...new Set(this.chord.map(n => n.midi))].sort((a, b) => a - b);
        keys.forEach(k => { out.send([0x90 | ch, k, 88], now + 5); C.noteSounding(out, ch, k, now + 5 + dur, true); });   // the offs from timers, never queued ahead (§178)
        this.setStatus('the chord on the piano: ' + keys.map(nn).join(' '));
    },
    // the strikes in sequence order, numbered as the drawer numbers them (index · t0 · notes)
    sourceList() {
        const db = this.db; if (!db) return [];
        const seqs = Object.values(db.sequences || {}), out = [];
        seqs.forEach(sq => (sq.strikeIds || []).forEach(sid => { const s = db.strikes[sid]; if (s) out.push(s); }));
        if (!out.length) Object.values(db.strikes || {}).forEach(s => out.push(s));
        return out;
    },
    fillSources() { this.renderList(); },
    pickSource(id) {
        const s = this.db && this.db.strikes && this.db.strikes[id];
        this.rememberHarmony();
        this.chordId = s ? id : '';
        this.harmony = s ? { bank: 'strikes', id } : null;
        this.rootMode = false; this.setChord(s ? s.notes.map(n => ({ midi: n.midi, instKey: n.instKey, id: n.objectId })) : [], { noHistory: true }); this.renderList();
        const nm = this.el.querySelector('#bpChordName'); if (nm) nm.textContent = s ? '#' + s.index + ' · strike at ' + s.t0.toFixed(2) + ' s' : '';
        if (s) this.setStatus('strike #' + s.index + ' (' + s.t0.toFixed(2) + ' s, ' + s.notes.length + ' notes) on the keyboard — ▶ chord hears it on the piano; click or double-click a note, then a pair\'s node; the dimmed keys are what the active pair cannot play');
    },
    // the strike a bound beating was born on: the note's id in the bank, its strike group's index, or its onset
    strikeFor(zone) {
        const db = this.db; if (!db || !zone) return null;
        const C = C_(), b = zone.beating || {}, note = b.launchedFrom ? C.objects.find(o => o.id === b.launchedFrom) : null;
        const all = Object.values(db.strikes || {});
        let s = note ? all.find(q => q.notes.some(n => n.objectId === note.id)) : null;
        if (!s && note && note.groupId) { const m = /^grp-strike-(\d+)-/.exec(note.groupId); if (m) s = this.sourceList().find(q => q.index === +m[1]) || all.find(q => q.index === +m[1]); }
        if (!s) { const t = note ? note.startSeconds : zone.startTime; s = all.find(q => Math.abs(q.t0 - t) < 0.1) || null; }
        return s;
    },
    range() { return this.show88 ? FULL : SPAN; },
    pcColor(pc) { const pcs = [...new Set(this.chord.map(n => ((n.midi % 12) + 12) % 12))].sort((a, b) => a - b); const i = pcs.indexOf(pc); return PC_PALETTE[(i >= 0 ? i : pc) % PC_PALETTE.length]; },
    // can this row's pair play the note as its lower note (step 1's table: at unison both hold it; at an interval one the lower, one the upper)
    rowCanPlay(row, m) { return !!this.rowFold(row, m); },   // in some octave (§180: the pair folds as a unit); rowFold says which
    // the keyboard: the drawer's drawing — vertical keys, the C labels, the chord's notes as dots in their pitch-class colours with their names,
    // the rows' pair notes as rings in the row colours, the keys the active pair cannot play dimmed; a click arms a note (or sets the root)
    drawKeyboard() {
        const svg = this.el && this.el.querySelector('#bpKb'); if (!svg) return;
        const BC = BC_(), R = this.range(), h = 10, rows = R.hi - R.lo + 1, H = rows * h + KB.top + 10, keyY = m => KB.top + (R.hi - m) * h;
        svg.setAttribute('height', H); svg.style.height = H + 'px';
        const row = this.rows[this.activeRow], T = TRK();
        let s = '';
        // the players' ordinary ranges as columns at the left (2026-09-07: "different colored lines showing me the ordinary range of the
        // instruments in this piece, each in its own column"), one per bending player in score order; the legend above the keyboard
        const P = BC.players(INST());
        P.forEach((p, i) => {
            const r = BC.ordinaryRange(INST(), p); if (!r) return;
            const x = KB.colX + i * KB.colGap, top = Math.min(r[1], R.hi), bot = Math.max(r[0], R.lo), col = INST_COL[p] || '#888';
            const short = (T.find(t => t.instKey === p) || {}).short || p;
            if (top >= bot) s += '<rect x="' + (x - KB.colW / 2) + '" y="' + keyY(top) + '" width="' + KB.colW + '" height="' + (keyY(bot) + h - keyY(top)) + '" rx="1.5" fill="' + col + '" fill-opacity="0.75"><title>' + esc(short) + ' — ordinary range ' + nn(r[0]) + '–' + nn(r[1]) + '</title></rect>';
            if (r[1] > R.hi) s += '<text x="' + x + '" y="' + (KB.top - 4) + '" font-size="7" fill="' + col + '" text-anchor="middle">▲</text>';
            if (r[0] < R.lo) s += '<text x="' + x + '" y="' + (H - 2) + '" font-size="7" fill="' + col + '" text-anchor="middle">▼</text>';
        });
        const legend = this.el.querySelector('#bpKbLegend'); if (legend) legend.innerHTML = 'ranges ' + P.map(p => '<span style="color:' + (INST_COL[p] || '#888') + '" title="' + esc(p + ' ' + (BC.ordinaryRange(INST(), p) || []).map(nn).join('–')) + '">' + esc((T.find(t => t.instKey === p) || {}).short || p) + '</span>').join(' ');
        // the keys: lit where the active pair holds the note as written, half where the pair would fold it, dim where no octave serves both
        for (let m = R.hi; m >= R.lo; m--) {
            const y = keyY(m), black = BLACK.includes(m % 12), f = row ? this.rowFold(row, m) : { k: 0 };
            const op = !f ? 0.22 : f.k ? 0.55 : 1;
            s += '<rect class="bpKey" data-m="' + m + '" x="' + KB.keyX + '" y="' + (y + 0.5) + '" width="' + (black ? KB.blackW : KB.whiteW) + '" height="' + (h - 1) + '" fill="' + (black ? '#2a2a30' : '#d8d3c8') + '" fill-opacity="' + op + '" stroke="#111" stroke-width="0.5" style="cursor:crosshair"><title>' + nn(m) + (!f ? ' — no octave where the active pair both reach it' : f.k ? ' — the active pair would fold it to ' + nn(f.pitch) + BC.foldMark(f.k) : '') + '</title></rect>';
            if (m % 12 === 0) s += '<text x="' + KB.cX + '" y="' + (y + h * 0.85) + '" font-size="10" fill="#777">C' + (m / 12 - 1) + '</text>';
        }
        // the rows' pair notes AS SOUNDED: rings (the lower note filled, the upper hollow) in the row colour, at the right
        this.rows.forEach((r, i) => {
            const iv = BC.INTERVALS[r.b.interval] || BC.INTERVALS.unison, col = ROW_COLORS[i % ROW_COLORS.length];
            const lo = r.b.pitch, up = r.b.pitch + iv.semitones;
            [[lo, true], [up, iv.semitones > 0]].forEach(([m, show]) => { if (!show || m < R.lo || m > R.hi) return; const cy = keyY(m) + h / 2; s += '<circle cx="' + (KB.ringX + i * 7) + '" cy="' + cy + '" r="4" fill="' + (m === lo ? col : 'none') + '" stroke="' + col + '" stroke-width="1.5"' + (r.b.skip ? ' opacity="0.35"' : '') + '><title>pair ' + (i + 1) + ': ' + nn(m) + (m === lo ? ' (lower)' : ' (upper)') + (r.b.skip ? ' — skipped' : '') + '</title></circle>'; });
        });
        // the sonority's notes: dots with their names (data-i = the note's index in the sonority — a pair remembers it, Q3), draggable onto a row
        const byPitch = {}; this.chord.forEach((n, idx) => { (byPitch[n.midi] = byPitch[n.midi] || []).push(idx); });
        Object.keys(byPitch).forEach(p => {
            const m = +p; if (m < R.lo || m > R.hi) return;
            const pc = ((m % 12) + 12) % 12, col = this.pcColor(pc), cy = keyY(m) + h / 2, k = byPitch[p].length, idx = byPitch[p][0];
            const held = this.rows.some(r => r.b.noteIndex != null && byPitch[p].includes(r.b.noteIndex));
            s += '<circle class="bpDot" data-m="' + m + '" data-i="' + idx + '" cx="' + KB.dotX + '" cy="' + cy + '" r="' + (3.2 + Math.min(2, k - 1)) + '" fill="' + col + '" stroke="' + (this.armed === m || held ? '#fff' : col) + '" stroke-width="' + (this.armed === m ? 2.2 : held ? 1.4 : 1) + '" style="cursor:crosshair"><title>' + nn(m) + (k > 1 ? ' ×' + k : '') + (this.chord[idx].midi0 != null && this.chord[idx].midi0 !== m ? ' (voiced from ' + nn(this.chord[idx].midi0) + ')' : '') + ' — double-click to arm, then a pair\'s node; or drag it onto a pair</title></circle>';
            s += '<text x="' + KB.nameX + '" y="' + (cy + 3) + '" font-size="10" fill="' + col + '" text-anchor="end">' + nn(m) + '</text>';
        });
        const above = this.chord.filter(n => n.midi > R.hi).length, below = this.chord.filter(n => n.midi < R.lo).length;
        if (above) s += '<text x="' + (KB.dotX - 6) + '" y="' + (KB.top - 5) + '" fill="#e88" font-size="11">▲' + above + '</text>';
        if (below) s += '<text x="' + (KB.dotX - 6) + '" y="' + (H - 2) + '" fill="#e88" font-size="11">▼' + below + '</text>';
        if (this.armed != null && this.armed >= R.lo && this.armed <= R.hi) s += '<rect x="' + (KB.keyX - 2) + '" y="' + (keyY(this.armed) - 0.5) + '" width="' + (KB.whiteW + 4) + '" height="' + (h + 1) + '" fill="none" stroke="#fff" stroke-width="1.2" pointer-events="none"/>';
        svg.innerHTML = s;
        svg.querySelectorAll('.bpKey').forEach(k => { k.addEventListener('click', () => this.keyClick(+k.dataset.m)); k.addEventListener('dblclick', ev => { ev.preventDefault(); this.arm(+k.dataset.m, this.indexAt(+k.dataset.m)); }); });
        svg.querySelectorAll('.bpDot').forEach(d => {
            d.addEventListener('click', ev => { ev.stopPropagation(); this.keyClick(+d.dataset.m); });
            d.addEventListener('dblclick', ev => { ev.stopPropagation(); ev.preventDefault(); this.arm(+d.dataset.m, +d.dataset.i); });   // CN-36: "double click a note on the keyboard and then click a node connected to a pair"
        });
    },
    indexAt(m) { const i = this.chord.findIndex(n => n.midi === m); return i >= 0 ? i : null; },
    arm(m, idx) { this.armed = m; this.armedIdx = idx != null ? idx : this.indexAt(m); this.rootMode = false; this.focus = 'chord'; this.render(); this.setStatus(nn(m) + ' armed — click a pair\'s node (or anywhere on its row) to give it the note; the pair folds it as one unit to the nearest octave both reach; ESC disarms'); },
    keyClick(m) {
        if (this.rootMode) { const rb = this.el.querySelector('#bpRoot'); if (rb) rb.value = nn(m); this.rootMode = false; this.deal(m); return; }
        this.armed = this.armed === m ? null : m; this.armedIdx = this.armed != null ? this.indexAt(m) : null; this.focus = 'chord';
        this.render();
        if (this.armed != null) { const r = this.rows[this.activeRow], f = r ? this.rowFold(r, m) : null; this.setStatus(nn(m) + ' armed — click a pair\'s node to give it the note, ESC or click it again to disarm' + (r ? (f ? (f.k ? ' · the active pair would fold it to ' + nn(f.pitch) + BC_().foldMark(f.k) : ' · the active pair holds it as written') : ' · no octave where the active pair both reach it — the row will offer the ways out') : '')); }
    },
    // (the drag of a dot onto a row is gone — 2026-09-07, "you can just get rid of the drag behavior. I'll just stick with double
    // clicking and then clicking on the node")
    // the note becomes the pair's note — its index in the sonority remembered (Q3) — and the pair folds it as one unit (§180); never
    // refused: when no octave serves both, the row shows the ladder
    assign(i, m, idx) {
        const row = this.rows[i]; if (!row) return;
        const useIdx = idx != null ? idx : (this.armed === m && this.armedIdx != null ? this.armedIdx : this.indexAt(m));
        this.armed = null; this.armedIdx = null; this.activeRow = i; this.snapshot();
        row.b.noteIndex = (useIdx != null && this.chord[useIdx] && this.chord[useIdx].midi === m) ? useIdx : null;
        row.b.srcPitch = m; row.b.skip = false; row.b.noteIs = 'lower';
        this.refold(row); this.render(); this.sayFold(row, i);
    },
    sayFold(row, i) {
        const BC = BC_(), T = TRK(), b = row.b, RP = this.rowPitches(row), iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison;
        const me = T[row.layer] ? T[row.layer].short : '?', pt = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].short : '?';
        if (b.pitch == null) { this.setStatus('pair ' + (i + 1) + ' has no note yet — double-click a note on the keyboard, then its node', true); return; }
        if (b.partnerLayer == null) { this.setStatus('pair ' + (i + 1) + ' on ' + nn(RP.src) + ' — no partner yet: pick one in the row (every player is listed, with what it would sound)', true); return; }
        if (!this.rowFold(row, RP.src)) { this.setStatus('pair ' + (i + 1) + ': no octave where ' + me + ' and ' + pt + ' both reach ' + nn(RP.src) + ' at ' + iv.label + ' — the row offers the ways out (an interval, another player, skip); nothing applied', true); return; }
        this.setStatus('pair ' + (i + 1) + ' on ' + nn(RP.src) + (RP.k ? ' → ' + nn(b.pitch) + RP.mark + ' (' + Math.abs(RP.k) + ' octave' + (Math.abs(RP.k) > 1 ? 's' : '') + (RP.k > 0 ? ' up' : ' down') + ', both players)' : ' as written') + ' · ' + (RP.me ? me + ' ' + nn(RP.me.pitch) : '') + (RP.partner ? ' · ' + pt + ' ' + nn(RP.partner.pitch) : '') + (iv.semitones ? ' (' + iv.label + (b.noteIs === 'upper' ? ', inverted — the fourth and the fifth are one family' : '') + ')' : ''));
    },
    // the relation from a root: every pair's pitch by the relation, folded by octave into what the pair can play (the drawer's fold rule),
    // the pairs from the bottom up
    deal(rootIn) {
        const rb = this.el.querySelector('#bpRoot'), root = rootIn != null ? rootIn : parseNote(rb && rb.value);
        if (root == null) { this.rootMode = true; this.render(); this.setStatus('no root — click a key, or type one (C4 or 60) and ENTER', true); return; }
        if (!this.rows.length) return;
        const rel = this.relation || 'unison1';
        const stack = (this.el.querySelector('#bpStack').value || '0').trim().split(/[\s,]+/).map(Number).filter(v => !isNaN(v));
        const offs = rel === 'unison1' ? [0, 0, 0] : rel === 'unisonOcts' ? [0, 12, 24] : rel === 'thirds' ? [0, 4, 7] : rel === 'fourths' ? [0, 5, 10] : rel === 'fifths' ? [0, 7, 14] : stack;
        const placed = [], skipped = [];
        this.rows.forEach((row, i) => {
            const target = root + (offs[i] != null ? offs[i] : offs[offs.length - 1] || 0);
            const f = this.rowFold(row, target);   // the pair's fold (§180): the nearest octave both reach, a tie down
            if (!f) { skipped.push('pair ' + (i + 1)); return; }
            row.b.noteIndex = null; row.b.srcPitch = target; row.b.skip = false; row.b.noteIs = 'lower'; this.refold(row);
            placed.push('pair ' + (i + 1) + ' ' + nn(f.pitch) + BC_().foldMark(f.k));
        });
        this.rootMode = false; this.render();
        this.setStatus('dealt ' + (RELATIONS.find(r => r[0] === rel) || [])[1] + ' from ' + nn(root) + ': ' + placed.join(' · ') + (skipped.length ? ' · out of reach: ' + skipped.join(', ') : ''), !!skipped.length);
    },

    // ------------------------------------------------------------------ the audition: all pairs, timestamped, through the tick's event path
    async play() { return this.playRows(this.rows, 'the sequence', false); },
    async playRow(i) { const row = this.rows[i]; if (row) return this.playRows([row], 'pair ' + (i + 1), true); },
    // the rows given, at their offsets (a pair alone from its own start), timestamped through the tick's event path; the strip's mute and
    // solo apply to the sequence; with the loop on it plays round until stop (edits take effect at every round)
    async playRows(listIn, label, alone) {
        const C = C_(); if (!C || !listIn.length) return;
        this.stop();
        const anySolo = !alone && listIn.some(r => r.solo);
        const list = alone ? listIn : listIn.filter(r => !r.mute && (!anySolo || r.solo));
        if (!list.length) { this.setStatus('every pair is muted', true); return; }
        const events = [], slots = new Map();
        let firstPort = null, firstCh = 1;
        const firstStart = Math.min.apply(null, list.filter(r => r.zone).map(r => r.zone.startTime).concat([Infinity]));
        for (const row of list) {
            const z = row.zone || { id: 'bp-row-' + this.rows.indexOf(row), type: 'zone', layer: row.layer, startTime: 0, endTime: row.length, beating: row.b };
            const s = C.regenerateBeating(z); if (!s) continue;
            if (row.zone) C.renderZone(row.zone);
            if (!firstPort) { firstPort = s.port; firstCh = s.channel; }
            const off = alone ? 0 : (row.zone ? (isFinite(firstStart) ? (row.zone.startTime - firstStart) * 1000 : 0) : (row.offset || 0) * 1000);   // a bound group plays at its own offsets
            s.events.forEach(e => events.push(Object.assign({}, e, { onsetMs: e.onsetMs + off, port: e.port || s.port, channel: e.channel || s.channel })));
            s.slots.forEach(q => slots.set(q.port + '|' + q.channel, q));
        }
        if (!events.length) { this.setStatus('nothing to play' + (list.some(r => r.b.pitch == null) ? ' — a pair has no note yet' : list.some(r => r.b.skip) ? ' — the pair is skipped' : ''), true); return; }
        events.sort((a, c) => a.onsetMs - c.onsetMs);
        const fake = { id: 'bp-pattern', midiSnippet: { port: firstPort, channel: firstCh, events, slots: [...slots.values()], source: 'beating' } };
        await C.playBeatingEvents(fake, events, null, null);
        this._aud = C._beatingAud; this._loopArgs = [listIn, label, alone];
        this.startCursor(list, alone, firstStart);
        const btn = this.el.querySelector('#bpPlay'); if (btn) btn.textContent = '■ playing ' + label;
        const last = events.reduce((m, e) => Math.max(m, e.onsetMs + (e.durations ? e.durations[0] : 0)), 0);
        clearTimeout(this._audTimer);
        this._audTimer = setTimeout(() => { this._aud = null; if (this.loop && this._loopArgs) { this.playRows.apply(this, this._loopArgs); return; } if (btn) btn.innerHTML = '&#9654; sequence'; }, last + C.BEATING_CENTRE_MS + 100);
        this.setStatus('playing ' + label + ' · ' + list.length + ' pair' + (list.length > 1 ? 's' : '') + ' · ' + events.length + ' events' + (this.loop ? ' · looping' : '') + ' · SPACE stops');
    },
    stop() { const C = C_(); if (C) C.stopBeatingAudition(); this._aud = null; this._loopArgs = null; clearTimeout(this._audTimer); this.stopCursor(); const btn = this.el && this.el.querySelector('#bpPlay'); if (btn) btn.innerHTML = '&#9654; sequence'; },
    // 4 s flat at the maximum on this pair (his line 7: "listen to a passage of max beating")
    hearMax(row) {
        const C = C_(), BC = BC_(), b = row.b; if (!C || b.pitch == null) { this.setStatus('the pair has no note yet — assign one first', true); return; }
        const to = +b.rateTo || 0; if (!(to > 0)) { this.setStatus('max is 0 Hz — nothing to hear', true); return; }
        const tb = Object.assign(JSON.parse(JSON.stringify(b)), { shape: 'flat', beat: BC.shape('flat', { level: to }), rate: null, share: 0.5, breath: { mode: 'one' }, levelCurve: null, slide: { lower: 0, upper: 0 }, skip: false });
        const z = { id: 'bp-max-' + this.rows.indexOf(row), type: 'zone', layer: row.layer, startTime: 0, endTime: 4, beating: tb };
        const s = C.regenerateBeating(z); if (!s || !s.events.length) { this.setStatus('nothing to hear', true); return; }
        this.stop();
        C.playBeatingEvents(z, s.events, null, null).then(() => { this._aud = C._beatingAud; });
        this.setStatus('4 s flat at ' + to + ' Hz on pair ' + (this.rows.indexOf(row) + 1) + ' · SPACE stops');
    },

    // ------------------------------------------------------------------ the sequence strip (2026-09-07): a track per pair, the pair a zone
    // drawn with its heard-beating curve — the body dragged moves it in time, the right edge stretches it (the pair's own length, its
    // shapes kept), the left edge starts it later keeping its end; a bound zone moves in the score too. The rows follow live.
    drawSeq() {
        const svg = this.el && this.el.querySelector('#bpSeq'), wrap = this.el && this.el.querySelector('#bpSeqWrap'); if (!svg || !wrap) return;
        const rows = this.rows; if (!rows.length) { wrap.style.display = 'none'; return; } wrap.style.display = '';
        const BC = BC_(), ns = 'http://www.w3.org/2000/svg', mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        // the timeline's own span (his line 20: "that timeline could have an independent duration"): typed in the head, never less than the content
        const W2 = Math.max(400, (wrap.clientWidth || W) - 2), seq = this.seqLength(), L = Math.max(1, seq * 1.05, +this.seqSpan || 0), H = 16 + rows.length * SEQ_H + 4;
        const x0 = PADL, x1 = W2 - PADR - 40, X = t => x0 + (t / L) * (x1 - x0), secPerPx = L / (x1 - x0);
        svg.setAttribute('width', W2); svg.setAttribute('height', H); svg.style.width = W2 + 'px'; svg.style.height = H + 'px'; svg.innerHTML = ''; svg._X = X;
        svg.appendChild(mk('line', { class: 'bpCursor', x1: x0, x2: x0, y1: 12, y2: H, stroke: '#fff', 'stroke-width': 1.5, 'pointer-events': 'none', style: 'display:none' }));
        const step = L > 40 ? 10 : L > 16 ? 5 : 1;
        for (let t = 0; t <= L + 1e-6; t += step) { svg.appendChild(mk('line', { x1: X(t), x2: X(t), y1: 12, y2: H, stroke: '#2e2e36' })); const tx = mk('text', { x: X(t) + 2, y: 10, fill: '#777', 'font-size': 10 }); tx.textContent = t + ' s'; svg.appendChild(tx); }
        const lbl = mk('text', { x: 2, y: 10, fill: '#9a9', 'font-size': 10 }); lbl.textContent = 'sequence ' + seq + ' s'; svg.appendChild(lbl);
        rows.forEach((row, i) => {
            const out = row.out || this.rowOut(row), col = ROW_COLORS[i % ROW_COLORS.length], y = 16 + i * SEQ_H, h = SEQ_H - 4, active = i === this.activeRow;
            const xa = X(row.offset || 0), xb = X((row.offset || 0) + row.length), dim = row.mute || row.b.skip || row.b.pitch == null;
            svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y + h / 2, y2: y + h / 2, stroke: '#2a2a32' }));
            const body = mk('rect', { x: xa, y, width: Math.max(2, xb - xa), height: h, rx: 3, fill: col, 'fill-opacity': dim ? 0.08 : active ? 0.3 : 0.16, stroke: col, 'stroke-width': active ? 1.5 : 1, 'stroke-opacity': dim ? 0.4 : 1 });
            body.style.cursor = 'move'; body.innerHTML = '<title>pair ' + (i + 1) + ' — drag to move it in time; the edges stretch it; a click makes it the pair SPACE plays</title>'; svg.appendChild(body);
            const mb = out.maxBeat || 1, d = out.samples.map((s, k) => (k ? 'L' : 'M') + (xa + (s.t / Math.max(0.1, row.length)) * (xb - xa)).toFixed(1) + ' ' + (y + h - 2 - (s.beat / mb) * (h - 4)).toFixed(1)).join(' ');
            svg.appendChild(mk('path', { d, fill: 'none', stroke: col, 'stroke-width': 1.2, 'pointer-events': 'none', opacity: dim ? 0.3 : 0.9 }));
            const t = mk('text', { x: xa + 5, y: y + 11, fill: '#ddd', 'font-size': 10, 'pointer-events': 'none' });
            t.textContent = 'pair ' + (i + 1) + ' · ' + (out.players.lower || '?').slice(0, 5) + ' + ' + (out.players.upper || '?').slice(0, 5) + ' · ' + (row.b.pitch == null ? 'no note' : nn(row.b.pitch)) + ' · ' + row.length + ' s' + (row.offset ? ' @ ' + row.offset + ' s' : '') + (row.b.skip ? ' · skipped' : '') + (row.mute ? ' · muted' : '');
            svg.appendChild(t);
            const edgeL = mk('rect', { x: xa - 3, y, width: 6, height: h, fill: col, 'fill-opacity': 0.02 }); edgeL.style.cursor = 'ew-resize'; edgeL.innerHTML = '<title>start later, the end kept</title>';
            const edgeR = mk('rect', { x: xb - 3, y, width: 6, height: h, fill: col, 'fill-opacity': 0.02 }); edgeR.style.cursor = 'ew-resize'; edgeR.innerHTML = '<title>the pair\'s length — its shapes kept over it</title>';
            svg.appendChild(edgeL); svg.appendChild(edgeR);
            // mute and solo per track ("I wanna hear it in context")
            [['M', 'mute', x1 + 6], ['S', 'solo', x1 + 24]].forEach(([lab, key, x]) => {
                const on = !!row[key];
                const g = mk('g', { class: 'bpMS' }); g.style.cursor = 'pointer';
                g.appendChild(mk('rect', { x, y: y + h / 2 - 8, width: 16, height: 16, rx: 3, fill: on ? (key === 'solo' ? '#e8cf9a' : '#e88') : '#2a2a30', stroke: '#555' }));
                const tt = mk('text', { x: x + 8, y: y + h / 2 + 4, fill: on ? '#222' : '#aaa', 'font-size': 11, 'text-anchor': 'middle', 'pointer-events': 'none' }); tt.textContent = lab; g.appendChild(tt);
                g.innerHTML += '<title>' + (key === 'mute' ? 'mute this pair in the sequence' : 'solo this pair in the sequence') + '</title>';
                g.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); row[key] = !row[key]; if (row[key]) row[key === 'mute' ? 'solo' : 'mute'] = false; this.render(); this.setStatus('pair ' + (i + 1) + (row.mute ? ' muted' : row.solo ? ' soloed' : ' plays')); });
                svg.appendChild(g);
            });
            const drag = (mode, e0) => {
                e0.preventDefault(); e0.stopPropagation(); this.activeRow = i; this.setFocus('pair'); this.snapshot();
                const o0 = row.offset || 0, l0 = row.length, xs = e0.clientX;
                const onMove = ev => {
                    const dt = (ev.clientX - xs) * secPerPx;
                    let off = o0, len = l0;
                    if (mode === 'move') off = Math.max(0, o0 + dt);
                    else if (mode === 'right') len = Math.max(0.5, l0 + dt);
                    else { off = clamp(o0 + dt, 0, o0 + l0 - 0.5); len = o0 + l0 - off; }
                    off = r3(Math.round(off / 0.05) * 0.05); len = r3(Math.max(0.5, Math.round(len / 0.05) * 0.05));
                    if (mode === 'move') { row.offset = off; this.placeZone(row); }
                    else if (len !== row.length) { this.resizeKeepTimes(row, len, mode === 'left'); if (mode === 'left') row.offset = off; this.placeZone(row); }   // a trim: the nodes keep their time
                    this.rowOut(row); this.drawSeq();
                };
                const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); this.setStatus('pair ' + (i + 1) + ' @ ' + (row.offset || 0) + ' s · ' + row.length + ' s' + (row.zone ? ' — the zone moved in the score' : '')); };
                window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
            };
            body.addEventListener('mousedown', e => drag('move', e)); edgeR.addEventListener('mousedown', e => drag('right', e)); edgeL.addEventListener('mousedown', e => drag('left', e));
        });
    },

    // ------------------------------------------------------------------ insertion (step 6, §160: its own thing — nothing around it touched)
    // the pattern into the score as one gesture: a `beating` zone per row on its launching lane at the insert time + the row's offset, all
    // under one new group id with a META shape whose contour is the crescendo's mean across the pattern (BeatingCalc.renderPattern);
    // the panel remembers the group. The same panel inserting again at the same time (within 100 ms) REPLACES its earlier insert; at
    // another time it makes a second group (the strikes drawer's rule, §113); a panel bound to a group replaces that group in place.
    // No note is muted or eaten or greyed; the accents are his to add by hand.
    removeGroup(groupId) {
        const C = C_(); if (!groupId) return 0;
        const gone = C.objects.filter(o => o.groupId === groupId);
        gone.forEach(o => { if (o.type === 'zone' && o.midiModel === 'beating') C.removeBeatingDecor(o); if (o._els) { if (o._els.group) o._els.group.remove(); if (o._els.groups) o._els.groups.forEach(g => g.remove()); } C.elementCache.delete(o.id); if (C.selectedObject === o) C.deselectAll(); });
        C.objects = C.objects.filter(o => o.groupId !== groupId);
        return gone.length;
    },
    insert() {
        const C = C_(), BC = BC_(); if (!C || !BC || !this.rows.length) { this.setStatus('nothing to insert', true); return; }
        const M = METAL();
        const groupStart = this.patternGroupId ? Math.min.apply(null, C.objects.filter(o => o.groupId === this.patternGroupId && o.type === 'zone').map(o => o.startTime).concat([Infinity])) : Infinity;
        const t = isFinite(groupStart) ? groupStart : (this.insertAt != null ? this.insertAt : Math.max(0, +C.getTimeAtPlayhead().toFixed(3)));
        const rowsSpec = this.rows.filter(r => r.b.pitch != null).map(r => ({ layer: r.layer, b: JSON.parse(JSON.stringify(r.b)), offset: r.zone && isFinite(groupStart) ? r3(r.zone.startTime - groupStart) : (r.offset || 0), length: r.zone ? r3(r.zone.endTime - r.zone.startTime) : r.length }));
        if (!rowsSpec.length) { this.setStatus('nothing to insert — no pair has a note yet', true); return; }
        C.pushUndoState();
        let replaced = 0;
        if (this.patternGroupId && (isFinite(groupStart) ? true : false)) { if (Math.abs(groupStart - t) < 0.1) replaced = this.removeGroup(this.patternGroupId); }
        else if (this.lastInsert && Math.abs(this.lastInsert.t - t) < 0.1) replaced = this.removeGroup(this.lastInsert.group);
        const group = 'grp-beating-' + Math.floor(t * 10) + '-' + (C.nextId++);
        const zones = [];
        rowsSpec.forEach(rs => {
            const z = C.createZone({ layer: rs.layer, startTime: r3(t + rs.offset), endTime: r3(t + rs.offset + rs.length), zoneFunction: 'midiPreview', midiModel: 'beating', color: '#7B3FE4', opacity: 0.16, zoneHeight: 0.96, yOffset: 0.5, performanceNotes: 'beating' });
            C.undoStack.pop();   // createZone pushes its own undo step; the insert is ONE step
            z.groupId = group; z.beating = rs.b; z.beating.launchedFrom = null;
            C.regenerateBeating(z); C.renderZone(z);
            zones.push(z);
        });
        // the META shape: the crescendo's mean across the pattern as its contour (§160), the pattern's whole span
        const pat = BC.renderPattern({ length: this.seqLength(), pairs: rowsSpec.map(rs => Object.assign({}, C.beatingSpec({ layer: rs.layer, startTime: 0, endTime: rs.length, beating: rs.b }), { length: rs.length })), offsets: rowsSpec.map(rs => rs.offset) }, INST());
        const patLen = Math.max(0.1, pat.length);
        const nodes = pat.contour.map(([tt, lv], i, a) => ({ pos: i === a.length - 1 ? 1 : Math.round((tt / patLen) * 10000) / 10000, y: Math.round(Math.max(0, Math.min(1, lv)) * 100) / 10, smooth: 0 }));
        const shape = { id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: M, groupId: group, startSeconds: r3(t), endSeconds: r3(t + patLen),
            nodes, segments: nodes.slice(0, -1).map(() => ({ model: 'power', slope: 0 })), color: '#7B3FE4', fillMode: 'bottom', opacity: 0.6,
            performanceNotes: 'beating pattern · ' + zones.length + ' pair' + (zones.length > 1 ? 's' : '') + ' (drag = move, box = stretch)', properties: {} };
        C.objects.push(shape);
        C.lastInsertGroup = group; this.lastInsert = { group, t };
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        C.renderAll(); C.markDirty();
        C.selectObject(shape);   // the handle: a drag moves the whole pattern, the box stretches it, DELETE removes all of it
        this.openFor(zones[0]);
        this.setStatus('inserted ' + zones.length + ' pair' + (zones.length > 1 ? 's' : '') + ' at ' + t.toFixed(3) + ' s as ' + group + (replaced ? ' · replaced the earlier insert at this time (' + replaced + ' objects)' : '') + ' — the shape on META is the handle; nothing around it touched');
    },

    // ------------------------------------------------------------------ takes (bank/panel_snapshots.json): the sequence (`beatings`), a pair
    // (`beatingPairs`), a shape (`beatingShapes`); the one-level undo; the state
    state() { return { length: this.seqLength(), seqSpan: this.seqSpan || null, harmony: this.harmony ? { bank: this.harmony.bank, id: this.harmony.id } : null, voicing: JSON.parse(JSON.stringify(this.voicing)), rows: this.rows.map(r => ({ layer: r.layer, offset: r.offset, length: r.length, locked: r.locked, levelLock: r.levelLock !== false, mute: !!r.mute, solo: !!r.solo, scale: r.scale, b: JSON.parse(JSON.stringify(r.b)) })) }; },
    applyState(st) {
        if (!st || !Array.isArray(st.rows)) return;
        this.voicing = Object.assign(VOICING_DEFAULTS(), st.voicing || {});   // the voicing saves with the take (2026-09-07)
        this.seqSpan = st.seqSpan || null;
        const seqLen = r3(+st.length || 6);
        const fill = (row, r) => { row.locked = r.locked !== false; row.levelLock = r.levelLock !== false; row.mute = !!r.mute; row.solo = !!r.solo; row.scale = r.scale || 6; return row; };
        if (this.bound) {   // a bound zone takes the FIRST row's block; its length stretches the zone
            const r0 = st.rows[0]; if (!r0) return;
            Object.assign(this.bound.beating, r0.b, { partnerLayer: r0.b.partnerLayer });
            const len = r3(+r0.length || seqLen);
            this.bound.endTime = r3(this.bound.startTime + len);
            this.rows = [fill(this.mkRow(this.bound.layer, this.bound.beating, 0, this.bound, len), r0)];
            this.changed(this.rows[0], true);
        } else {
            this.rows = st.rows.slice(0, MAX_ROWS).map(r => fill(this.mkRow(r.layer, JSON.parse(JSON.stringify(r.b)), r.offset || 0, null, r.length || seqLen), r));
        }
        this._keepRows = true;   // the rows' notes are the take's: the harmony pick must not re-deal them
        if (st.harmony && st.harmony.bank && st.harmony.id) this.loadDb().then(() => { this.pickHarmony(st.harmony.bank, st.harmony.id); this._keepRows = false; }); else this._keepRows = false;
        this.render();
    },
    // ---- the one-level undo (2026-09-07): a snapshot before every edit; ↶ or CTRL+Z in the drawer brings it back ----
    snapshot() {
        this._undo = { rows: this.rows.map(r => ({ layer: r.layer, length: r.length, offset: r.offset, locked: r.locked, levelLock: r.levelLock, scale: r.scale, mute: r.mute, solo: r.solo, b: JSON.parse(JSON.stringify(r.b)) })), voicing: JSON.parse(JSON.stringify(this.voicing)), harmony: this.harmony ? Object.assign({}, this.harmony) : null, chordId: this.chordId, notes: this.chord.map(n => ({ midi: n.midi0 != null ? n.midi0 : n.midi, instKey: n.instKey, id: n.id })), activeRow: this.activeRow };
        this.paintUndo();
    },
    paintUndo() { const u = this.el && this.el.querySelector('#bpUndo'); if (u) { u.disabled = !this._undo; u.style.opacity = this._undo ? '' : '0.5'; } },
    undo() {
        const u = this._undo; if (!u) { this.setStatus('nothing to undo', true); return; }
        this._undo = null;
        this.voicing = Object.assign(VOICING_DEFAULTS(), u.voicing); this.harmony = u.harmony; this.chordId = u.chordId || '';
        this.setChord(u.notes, { noHistory: true, keepRows: true });
        if (this.bound || this.rows.length === u.rows.length) {
            u.rows.forEach((s, i) => { const r = this.rows[i]; if (!r) return; Object.keys(r.b).forEach(k => { delete r.b[k]; }); Object.assign(r.b, s.b); r.length = s.length; r.offset = s.offset; r.locked = s.locked; r.levelLock = s.levelLock; r.scale = s.scale; r.mute = s.mute; r.solo = s.solo; if (r.zone && r.zone.layer !== s.layer) { C_().removeBeatingDecor(r.zone); r.zone.layer = s.layer; } r.layer = s.layer; this.placeZone(r); this.changed(r, true); });
        } else {
            this.rows = u.rows.map(s => { const r = this.mkRow(s.layer, s.b, s.offset, null, s.length); r.locked = s.locked; r.levelLock = s.levelLock; r.scale = s.scale; r.mute = !!s.mute; r.solo = !!s.solo; return r; });
        }
        this.activeRow = Math.min(u.activeRow || 0, Math.max(0, this.rows.length - 1)); this.renderList(); this.render(); this.setStatus('undone (one level)');
    },
    async refreshTakes() {
        try { const file = await fetch('/api/snapshots', { cache: 'no-store' }).then(x => x.json()); const P = (file && file.panels) || {}; this.takeList = P[TAKES_PANEL] || {}; this.pairTakes = P[PAIRS_PANEL] || {}; this.shapesBank = {}; Object.keys(P[SHAPES_PANEL] || {}).forEach(n => { const t = P[SHAPES_PANEL][n]; if (t && t.state && Array.isArray(t.state.curve)) this.shapesBank[n] = t.state; }); }
        catch (e) { this.takeList = {}; this.pairTakes = {}; this.shapesBank = {}; }
        this.fillTakes();
    },
    takeNames() { const t = this.takeList; return Object.keys(t).sort((a, b) => String(t[b].saved || '').localeCompare(String(t[a].saved || ''))); },
    fillTakes() { const sel = this.el && this.el.querySelector('#bpTakeSel'); if (!sel) return; sel.innerHTML = '<option value="">load take…</option>' + this.takeNames().map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join(''); },
    async postTake(body, panel) { const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ panel: panel || TAKES_PANEL }, body)) }).then(x => x.json()); if (!r.success) throw new Error(r.error || '?'); return r; },
    takeComment() { const v = this.voicing; return (this.harmony ? this.harmony.bank + ' ' + this.harmony.id + ' · ' : '') + ((v.preset !== 'original' || v.oct || v.below || v.above) ? v.preset + (v.oct ? ' oct' + (v.oct > 0 ? '+' : '') + v.oct : '') + ((v.below || v.above) ? ' −' + v.below + '…+' + v.above : '') + ' seed ' + v.seed + ' · ' : '') + this.rows.map(r => (TRK()[r.layer] || {}).short + '+' + (TRK()[r.b.partnerLayer] || {}).short + ' ' + (r.b.pitch == null ? '—' : nn(r.b.pitch)) + ' ' + r.b.interval + ' ' + r.length + 's' + (r.offset ? '@' + r.offset : '')).join(' · ') + ' · ' + this.seqLength() + ' s'; },
    async saveTake() {
        const box = this.el.querySelector('#bpTakeName'), d = new Date(), pad = x => String(x).padStart(2, '0');
        const name = (box.value || '').trim() || ('beating ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + pad(d.getMinutes()));
        if (!TAKE_NAME.test(name)) { this.setStatus('take not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen', true); return; }
        try { const r = await this.postTake({ name, comment: this.takeComment(), state: this.state() }); box.value = name; await this.refreshTakes(); this.setStatus('take saved: ' + name + (r.existed ? ' (replaced)' : '') + ' · ' + r.panels + ' in bank/panel_snapshots.json'); }
        catch (e) { this.setStatus('take not saved: ' + e.message, true); }
    },
    loadTake(name) {
        const t = this.takeList[name]; if (!t) { this.setStatus('no take named "' + name + '"', true); return; }
        this.snapshot(); this.applyState(t.state);
        const box = this.el.querySelector('#bpTakeName'); if (box) box.value = name;
        this.setStatus('take loaded: ' + name + (t.comment ? ' · ' + t.comment : ''));
    },
    async deleteTake() {
        const box = this.el.querySelector('#bpTakeName'), name = (box.value || '').trim();
        if (!name || !this.takeList[name]) { this.setStatus('type or load the name of the take to delete', true); return; }
        if (!window.confirm('Delete take "' + name + '" from bank/panel_snapshots.json?')) return;
        try { const r = await this.postTake({ name, delete: true }); box.value = ''; await this.refreshTakes(); this.setStatus('take deleted: ' + name + ' · ' + r.panels + ' left'); }
        catch (e) { this.setStatus('delete failed: ' + e.message, true); }
    },
    // ---- the pair takes (2026-09-07, "a save for individual pairs settings"): one row's settings under a name, the beatingPairs bucket ----
    pairState(row) { return { layer: row.layer, length: row.length, locked: row.locked, levelLock: row.levelLock !== false, scale: row.scale, b: JSON.parse(JSON.stringify(row.b)) }; },
    async savePair(i, name) {
        const row = this.rows[i]; if (!row) return;
        const d = new Date(), pad = x => String(x).padStart(2, '0');
        name = (name || '').trim() || ('pair ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + pad(d.getMinutes()));
        if (!TAKE_NAME.test(name)) { this.setStatus('pair take not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen', true); return; }
        const T = TRK(), b = row.b;
        try { const r = await this.postTake({ name, comment: (T[row.layer] || {}).short + '+' + (T[b.partnerLayer] || {}).short + ' ' + (b.pitch == null ? '—' : nn(b.pitch)) + ' ' + b.interval + ' · ' + (b.shape || 'drawn') + ' max ' + (+b.rateTo || 0) + ' Hz · ' + row.length + ' s', state: this.pairState(row) }, PAIRS_PANEL); await this.refreshTakes(); this.render(); this.setStatus('pair take saved: ' + name + (r.existed ? ' (replaced)' : '')); }
        catch (e) { this.setStatus('pair take not saved: ' + e.message, true); }
    },
    // into a row: the curves, the level, the breaths, the interval, the length, the locks and the axis; the row's players and its note stay
    loadPair(i, name) {
        const t = this.pairTakes[name], row = this.rows[i]; if (!t || !row || !t.state || !t.state.b) { this.setStatus('no pair take named "' + name + '"', true); return; }
        const nb = JSON.parse(JSON.stringify(t.state.b)), keep = ['partnerLayer', 'pitch', 'srcPitch', 'noteIndex', 'noteIs', 'fold', 'launchedFrom'];
        keep.forEach(k => { delete nb[k]; });
        Object.assign(row.b, nb); row.locked = t.state.locked !== false; row.levelLock = t.state.levelLock !== false; row.scale = t.state.scale || row.scale;
        this.setRowLength(row, +t.state.length || row.length);
        if (row.b.pitch != null) this.refold(row); this.render();
        this.setStatus('pair take "' + name + '" loaded into pair ' + (i + 1) + ': its curves, level, breaths, interval and length — the players and the note kept');
    },
    // ---- the shapes (his line 8: "the first few are custom, but then I can store those as preset shapes"): the heard curve normalised
    // (its maximum 1) under a name, the beatingShapes bucket; a button among the shapes, for the beating and for the crescendo ----
    async saveShape(row, name) {
        const BC = BC_(); name = (name || '').trim();
        if (!name) { this.setStatus('a name for the shape, please', true); return; }
        if (!TAKE_NAME.test(name)) { this.setStatus('shape not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen', true); return; }
        const beat = BC.curveOf(this.heardCurve(row)), m = Math.max(...beat.map(p => Math.abs(p[1]))) || 1;
        const curve = BC.scaleCurve(beat, 1 / m).map(p => (p.length > 2 ? [r3(p[0]), r3(p[1]), p[2]] : [r3(p[0]), r3(p[1])]));
        try { const r = await this.postTake({ name, comment: curve.length + ' points, max 1 — from pair ' + (this.rows.indexOf(row) + 1), state: { curve, from: row.b.shape || 'drawn' } }, SHAPES_PANEL); await this.refreshTakes(); this.render(); this.setStatus('shape saved: ' + name + (r.existed ? ' (replaced)' : '') + ' — it pops in at any maximum; ALT-click its button to delete it'); }
        catch (e) { this.setStatus('shape not saved: ' + e.message, true); }
    },
    async deleteShape(name) {
        if (!this.shapesBank[name]) return;
        if (!window.confirm('Delete the shape "' + name + '"?')) return;
        try { await this.postTake({ name, delete: true }, SHAPES_PANEL); await this.refreshTakes(); this.render(); this.setStatus('shape deleted: ' + name); }
        catch (e) { this.setStatus('delete failed: ' + e.message, true); }
    },
};

root.BeatingPanel = P;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => P.init());
else P.init();

}(typeof self !== 'undefined' ? self : this));
