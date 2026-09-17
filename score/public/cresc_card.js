// cresc_card.js — THE CRESCENDO CARD (PLAN 1m step 2; CN-48 · CN-49; RUNNING_LOG §281).
//
// His picture (CN-48): "c key, little panel, default dynamic range and duration (til next note or if no note a standard duration), and
// articulation, but I can change any of them there in the mini panel". Decided §276: **C makes the crescendo at once and this card edits
// the LIVE object**, so every turn of a control is heard immediately; ENTER keeps it, ESC removes it, CTRL+Z undoes it.
//
// Four controls, each with 1l's default: the DYNAMIC RANGE (two dynamics, ppp … fff), the DURATION (what the end rule gave it, typed or
// dragged to another), the ARTICULATION (that player's techniques, defaulting to its ordinary voice — Ordinario on the flute, Senza
// Vibrato Velocity on the strings and the bass clarinet, confirmed with him), and the SECCO tick (on by default, CN-49). ♪ hears it
// alone; ▶ hears it in context. The card REMEMBERS its settings between crescendos (`Composer._crescCard`), so a passage keeps one
// character without re-setting it, and clicking an existing crescendo reopens the card with its own values — the card is the editor as
// well as the maker.
(function (root) {
'use strict';
const HOST = () => (typeof Composer !== 'undefined') ? Composer : null;
const C_ = () => root.Cresc;
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : [];
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const INP = 'background:#1a1a22;color:#cca;border:1px solid #333;padding:2px 5px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';
const LIT = 'background:#C2410C;color:#fff;border:1px solid #e07040;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';

// REVERT (2026-09-10): localStorage septet.strikes.classic = '1' + reload leaves the ACCENT row out
let CLASSIC = false; try { CLASSIC = !!localStorage.getItem('septet.strikes.classic'); } catch (e) {}
// the accent's default voice per instrument — the strike voices he set on 2026-09-04 (U2 revised; strike_drawer.js STRIKE_DEFAULT)
const STRIKE_DEFAULT = { flute: 'pizzicato', bass_clarinet: 'slap', violin1: 'bartok_vel', violin2: 'bartok_vel', viola: 'gettato_vel', cello: 'gettato_vel', piano: 'main' };
const ACCENT_MS = 140;
const CARD = {
    el: null, wc: null, _key: null, _ctxTimer: null, _born: false,

    open(wc, ev, opts) {
        const C = HOST(), Cr = C_(); if (!C || !Cr || !wc || !Cr.isCresc(wc)) return;
        this.close();
        this.wc = wc;
        this._born = !(opts && opts.existing);   // opened on a fresh C: ESC removes it. Opened by a click: ESC just closes.
        this.build(ev);
    },
    close(removeIfBorn) {
        if (this._key) { document.removeEventListener('keydown', this._key, true); this._key = null; }
        if (this._ctxTimer) { clearTimeout(this._ctxTimer); this._ctxTimer = null; const C = HOST(); if (C && C.isPlaying) C.stopPlay(); }
        if (this.el) { this.el.remove(); this.el = null; }
        this.wc = null;
    },
    isOpen() { return !!this.el; },
    cfg() { const C = HOST(); if (!C._crescCard) C._crescCard = {}; return C._crescCard; },

    build(ev) {
        const C = HOST(), Cr = C_(), wc = this.wc, cr = wc.properties.cresc;
        const lane = wc.layer, techs = C.trackTechniques(lane) || [];
        const box = document.createElement('div');
        box.id = 'crescCard'; box.tabIndex = 0;
        box.style.cssText = 'position:fixed;z-index:9600;width:266px;background:#26262e;color:#ddd;border:1px solid #C2410C;border-radius:6px;font:11px/1.5 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);user-select:none';
        // opened by a click: beside the pointer. Opened by the C key: beside the crescendo just drawn.
        let x0 = 260, y0 = 240;
        if (ev && ev.clientX != null) { x0 = ev.clientX; y0 = ev.clientY; }
        else {
            const el = C.elementCache.get(wc.id);
            if (el && el.getBoundingClientRect) {
                const r = el.getBoundingClientRect();
                // only when the crescendo is actually on screen; a note scrolled away would throw the card into a corner
                if ((r.width || r.height) && r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight) { x0 = r.right; y0 = r.top + r.height / 2; }
            }
        }
        box.style.left = Math.max(4, Math.min(window.innerWidth - 274, x0 + 14)) + 'px';
        box.style.top = Math.max(4, Math.min(window.innerHeight - 320, y0 - 70)) + 'px';
        box.innerHTML = [
            '<div id="ccDrag" style="display:flex;justify-content:space-between;align-items:center;padding:4px 7px;background:#3a2a1a;border-bottom:1px solid #C2410C;cursor:move;border-radius:6px 6px 0 0">',
            '<b style="color:#e8a06a">crescendo</b><span id="ccWho" style="color:#9a9"></span>',
            '<span id="ccX" style="cursor:pointer;color:#aaa;font-size:13px">&#10005;</span></div>',
            '<div style="padding:6px 7px;display:flex;flex-direction:column;gap:6px">',
            '<div><div style="color:#888">dynamic range</div><div style="display:flex;gap:4px;align-items:center">',
            '<select id="ccLo" style="' + INP + ';width:52px"></select><span style="color:#888">&rarr;</span>',
            '<select id="ccHi" style="' + INP + ';width:52px"></select>',
            '<span id="ccShape" style="color:#9a9;margin-left:auto"></span></div></div>',
            '<div><div style="color:#888">duration</div><div style="display:flex;gap:4px;align-items:center">',
            '<input id="ccDur" type="number" step="0.1" min="0.3" style="' + INP + ';width:60px"> <span style="color:#888">s</span>',
            '<button id="ccRule" style="' + BTN + '" title="back to the rule: to 0.17 s before this player\'s next note, or 5 s when there is none">by the rule</button>',
            '<span id="ccHow" style="color:#777;margin-left:auto"></span></div></div>',
            '<div><div style="color:#888">articulation</div><select id="ccTech" style="' + INP + ';width:100%"></select></div>',
            '<label style="display:flex;gap:5px;align-items:center" title="secco: the strings damp the string at the end for an abrupt cut; in the sound a CC7 cut so nothing rings past it (CN-49)">',
            '<input id="ccSecco" type="checkbox"> secco <span style="color:#777">(the cut)</span></label>',
            // 2026-09-10 (his commission, STRIKES_TOOL §AD): the ACCENT row — a strike on the crescendo's start or its end, by another player
            (CLASSIC ? '' : '<div id="ccAcc" style="border-top:1px solid #3a3a44;padding-top:5px">'
            + '<div style="color:#888">accent <span style="color:#666">— a strike at the start or the end, by a player of your choice</span></div>'
            + '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">'
            + '<select id="ccAccAt" style="' + INP + ';width:70px"><option value="start">at start</option><option value="end">at end</option></select>'
            + '<select id="ccAccLane" style="' + INP + ';width:56px" title="who plays the accent"></select>'
            + '<input id="ccAccPitch" style="' + INP + ';width:44px" title="the accent\'s pitch — the crescendo\'s by default, folded into that player\'s range">'
            + '<span id="ccAccMidi" style="color:#8a8;min-width:26px" title="§351: the MIDI number of the pitch in the box"></span>'
            + '<button id="ccAccAdd" style="' + BTN + '">+ add</button><button id="ccAccHear" style="' + BTN + '" title="hear the accent alone">&#9834;</button><button id="ccAccDel" style="' + BTN + '" title="remove the accent at this end">&#10005;</button></div>'
            + '<select id="ccAccTech" style="' + INP + ';width:100%;margin-top:3px" title="the accent\'s articulation — that player\'s strike voice by default"></select>'
            + '<label id="ccAccHoldWrap" style="display:flex;gap:4px;align-items:center;margin-top:3px" title="§351: the accent is HELD, ending exactly when the crescendo ends, instead of a 140 ms strike. Only for an accent at the start."><input id="ccAccHold" type="checkbox"> hold to the crescendo end</label>'
            + '<div id="ccAccWho" style="color:#9a9"></div></div>'),
            // PLAN 1n step 4: the fill row, shown only for a long that belongs to a fill pass — its anchors and where they point
            '<div id="ccFill" style="display:none;border-top:1px solid #3a3a44;padding-top:5px">',
            '<div style="color:#888">this long is part of a fill</div>',
            '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">',
            '<button id="ccFlip" style="' + BTN + '" title="the toggle: launched ⇄ cut. The anchor moves to the other end and the length is re-derived; nothing else in the pass is touched.">flip</button>',
            '<button id="ccPoint" style="' + BTN + '" title="then click an attack of the pattern in the score to move this anchor to it — refused, with the reason, if it does not fit">re-point…</button>',
            '<span id="ccFillWho" style="color:#9a9;flex:1;overflow:hidden;text-overflow:ellipsis"></span></div></div>',
            '<div style="display:flex;gap:4px;align-items:center">',
            '<button id="ccHear" style="' + BTN + '" title="hear it alone">&#9834;</button>',
            '<button id="ccCtx" style="' + BTN + '" title="hear it with what is around it">&#9654; in context</button>',
            '<span id="ccStatus" style="color:#9a9;margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span></div>',
            '<div style="display:flex;gap:4px;align-items:center">',
            '<button id="ccOk" style="' + LIT + '" title="ENTER">keep</button>',
            '<button id="ccDel" style="' + BTN + '" title="ESC on a new one; this always removes it">&#10005; remove</button>',
            '<span style="color:#666;margin-left:auto">ENTER &middot; ESC</span></div>',
            '</div>',
        ].join('');
        document.body.appendChild(box);
        this.el = box;
        ['mousedown', 'click', 'dblclick', 'mouseup', 'wheel'].forEach(t => box.addEventListener(t, x => x.stopPropagation()));
        const q = id => box.querySelector(id);
        // the dynamics
        const opts = Cr.DYN.map(d => '<option value="' + d + '">' + d + '</option>').join('');
        q('#ccLo').innerHTML = opts; q('#ccHi').innerHTML = opts;
        q('#ccLo').value = Cr.dynName(cr.dynLo); q('#ccHi').value = Cr.dynName(cr.dynHi);
        // the techniques
        q('#ccTech').innerHTML = techs.map(t => '<option value="' + esc(t.key) + '">' + esc(t.label || t.key) + '</option>').join('');
        q('#ccTech').value = wc.technique;
        q('#ccSecco').checked = cr.secco !== false;
        this.paintFill();
        if (!CLASSIC) {
            q('#ccAccLane').innerHTML = TRK().map((t, i) => '<option value="' + i + '">' + esc(t.short || t.label) + '</option>').join('');
            q('#ccAccLane').value = String((lane + 1) % Math.max(1, TRK().length));   // another player by default (CN-54: two players)
            this.accentLaneChanged(true); this.paintAccent();
            q('#ccAccAt').addEventListener('change', () => this.paintAccent());
            // §351: the MIDI echo follows the box live, whichever way he types the pitch
            ['input', 'change'].forEach(ev => q('#ccAccPitch').addEventListener(ev, () => this.accentMidiEcho()));
            q('#ccAccLane').addEventListener('change', () => this.accentLaneChanged(true));
            q('#ccAccAdd').addEventListener('click', () => this.accentAdd());
            q('#ccAccHear').addEventListener('click', () => this.accentHear());
            q('#ccAccDel').addEventListener('click', () => this.accentRemove());
            ['ccAccPitch', 'ccAccTech', 'ccAccLane', 'ccAccAt'].forEach(id => q('#' + id).addEventListener('keydown', k => { if (k.key === ' ') k.stopPropagation(); }));
        }
        q('#ccDur').value = (wc.endSeconds - wc.startSeconds).toFixed(2);
        this.paint();
        q('#ccX').addEventListener('click', () => this.close());
        q('#ccOk').addEventListener('click', () => this.keep());
        q('#ccDel').addEventListener('click', () => this.remove());
        q('#ccHear').addEventListener('click', () => this.hear());
        q('#ccCtx').addEventListener('click', () => this.context());
        q('#ccRule').addEventListener('click', () => this.byTheRule());
        q('#ccFlip').addEventListener('click', () => this.flip());
        q('#ccPoint').addEventListener('click', () => this.pointing());
        q('#ccLo').addEventListener('change', () => this.apply());
        q('#ccHi').addEventListener('change', () => this.apply());
        q('#ccTech').addEventListener('change', () => this.apply());
        q('#ccSecco').addEventListener('change', () => this.apply());
        q('#ccDur').addEventListener('change', () => this.apply());
        this._key = k => {
            if (this.el && (k.key === 'Escape')) { k.preventDefault(); k.stopPropagation(); this._born ? this.remove() : this.close(); }
            else if (this.el && k.key === 'Enter') { k.preventDefault(); k.stopPropagation(); this.keep(); }
        };
        document.addEventListener('keydown', this._key, true);
        this.makeDraggable(box, q('#ccDrag'));
        box.focus();
    },

    // every change goes onto the LIVE crescendo, and is remembered for the next one
    apply() {
        const C = HOST(), Cr = C_(), wc = this.wc; if (!wc) return;
        const q = id => this.el.querySelector(id);
        const lo = Cr.dynHeight(q('#ccLo').value), hi = Cr.dynHeight(q('#ccHi').value);
        const dur = Math.max(0.3, +q('#ccDur').value || 1);
        const tech = q('#ccTech').value, secco = q('#ccSecco').checked;
        wc.nodes = [{ pos: 0, y: lo, smooth: 0.25 }, { pos: 1, y: hi, smooth: 0.25 }];
        wc.endSeconds = Math.round((wc.startSeconds + dur) * 1000) / 1000;
        wc.technique = tech;
        const cr = wc.properties.cresc;
        cr.dynLo = lo; cr.dynHi = hi; cr.secco = secco;
        if (Math.abs(dur - (cr.gapTo != null ? cr.gapTo - wc.startSeconds - cr.endGapS : -1)) > 0.005) cr.end = 'manual';
        wc.performanceNotes = 'cresc ' + cr.shape + (cr.shape === 'line' ? '' : ' ' + cr.ratio + '×') + ' ' + Cr.dynName(lo) + '→' + Cr.dynName(hi) +
            ' ' + dur.toFixed(2) + ' s' + (cr.end === 'manual' ? ' (typed)' : cr.end === 'fallback' ? ' (no next note)' : '');
        Object.assign(this.cfg(), { dynLo: lo, dynHi: hi, secco: secco, durS: null });   // the range and the tick carry; the duration does not (the rule is per note)
        C.curveDirty(); C.renderWaveCurve(wc); C.markDirty(); C.scheduleConflictRefresh();
        this.paint();
    },
    byTheRule() {
        const C = HOST(), Cr = C_(), wc = this.wc; if (!wc) return;
        const e = Cr.endFor(wc.startSeconds, C.laneNotesFor(wc.layer, wc.id), {});
        if (e.how === 'noRoom' || e.end == null) { this.status('no room — the next note is ' + (e.room != null ? e.room.toFixed(2) + ' s' : 'too close') + ' away', true); return; }
        wc.endSeconds = e.end; wc.properties.cresc.end = e.how; wc.properties.cresc.gapTo = e.gapTo;
        this.el.querySelector('#ccDur').value = (e.end - wc.startSeconds).toFixed(2);
        this.apply();
        wc.properties.cresc.end = e.how;   // apply() may have stamped 'manual'
        this.paint();
    },
    paint() {
        const Cr = C_(), wc = this.wc; if (!wc || !this.el) return;
        const cr = wc.properties.cresc, T = TRK();
        this.el.querySelector('#ccWho').textContent = ((T[wc.layer] || {}).short || '') + ' ' + Cr.nm(wc.sonifyNote) + ' (' + wc.sonifyNote + ') · ' + wc.startSeconds.toFixed(2) + ' s';   // §351
        this.el.querySelector('#ccShape').textContent = cr.shape + (cr.shape === 'line' ? '' : ' ' + cr.ratio + '×');
        this.el.querySelector('#ccHow').textContent = cr.end === 'toNextNote' ? 'to the next note' : cr.end === 'fallback' ? 'no next note' : 'typed';
    },
    status(m, bad) { const s = this.el && this.el.querySelector('#ccStatus'); if (s) { s.style.color = bad ? '#e88' : '#9a9'; s.textContent = m || ''; } },

    // ---------------------------------------------------------------- PLAN 1n step 4 · the fill row
    fillOf(wc) { return wc && wc.properties && wc.properties.cresc && wc.properties.cresc.fill; },
    paintFill() {
        const box = this.el && this.el.querySelector('#ccFill'); if (!box) return;
        const f = this.fillOf(this.wc);
        box.style.display = f ? 'block' : 'none';
        if (!f) return;
        const C = HOST(), at = id => C.objects.find(o => o.id === id);
        const nmOf = id => { const a = at(id); return a ? ((TRK()[a.layer] || {}).short || '?') + ' ' + (+a.startSeconds).toFixed(2) + ' s' : '(gone)'; };
        this.el.querySelector('#ccFillWho').textContent =
            (f.launchedBy ? 'launched by ' + nmOf(f.launchedBy) : '') + (f.launchedBy && f.cutBy ? ' · ' : '') + (f.cutBy ? 'cut by ' + nmOf(f.cutBy) : '')
            + (f.pitch ? ' · ' + f.pitch.source : '');
    },
    // the toggle he asked for (CN-54): launched ⇄ cut, this long only, nothing regenerated
    flip() {
        const C = HOST(), wc = this.wc, f = this.fillOf(wc); if (!C || !f) return;
        const FL = root.Fill; if (!FL) { this.status('the filler module is not loaded', true); return; }
        const which = f.cutBy ? 'launchedBy' : 'cutBy';
        const anchorId = f.cutBy || f.launchedBy;
        const a = C.objects.find(o => o.id === anchorId);
        if (!a) { this.status('the accent this long is anchored to is gone', true); return; }
        const long = { lane: wc.layer, t0: wc.startSeconds, t1: wc.endSeconds, len: wc.endSeconds - wc.startSeconds, kind: 'cresc' };
        const attack = { id: a.id, t: +a.startSeconds, dur: (+a.endSeconds - +a.startSeconds), lane: a.layer, midi: a.sonifyNote };
        // the same accent, the other end: launched becomes cut and the room decides the new near end (and the reverse)
        const events = C.crescRoomEvents ? C.crescRoomEvents(wc.layer, wc.id) : [];
        const span = which === 'cutBy'
            ? FL.roomBackward(wc.layer, Math.round((attack.t + attack.dur) * 1000) / 1000, events, {})
            : FL.roomForward(wc.layer, attack.t, events, {});
        if (!span || span.t1 - span.t0 < FL.FLOORS.cresc) { this.status('no room to flip it — that player is busy on the other side', true); return; }
        C.pushUndoState();
        wc.startSeconds = span.t0; wc.endSeconds = span.t1;
        wc.properties.cresc.fill = Object.assign({}, f, { launchedBy: which === 'cutBy' ? null : a.id, cutBy: which === 'cutBy' ? a.id : null });
        wc.properties.cresc.end = which === 'cutBy' ? 'cutByAccent' : (span.boundedBy === 'fallback' ? 'fallback' : 'toNextNote');
        wc.pinned = true;                                    // hand-edited: a re-Generate leaves it (1k's own idiom)
        this.el.querySelector('#ccDur').value = (wc.endSeconds - wc.startSeconds).toFixed(2);
        this.apply(); this.paintFill();
        this.status('flipped — now ' + (which === 'cutBy' ? 'cut by' : 'launched by') + ' that accent, ' + (span.t1 - span.t0).toFixed(2) + ' s; pinned');
    },
    // re-point: the next click on an attack in the score moves this long's anchor to it
    pointing() {
        const C = HOST(), wc = this.wc, f = this.fillOf(wc); if (!C || !f) return;
        C._crescRepoint = { id: wc.id, which: f.cutBy ? 'cutBy' : 'launchedBy' };
        this.status('click an attack of the pattern — ESC cancels');
    },

    async hear() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        const inst = C.trackInstrument(wc.layer), tech = C.curveTechniqueFor(wc);
        try { if (!C._zoneMidiInited && C.initZoneMidi) await C.initZoneMidi(); } catch (e) { }
        const route = C.routeForNote(wc, tech, inst);
        const out = C._zoneMidiOutputs && C._zoneMidiOutputs[route.port];
        if (!out) { this.status('no MIDI output for ' + (route.port || 'this player'), true); return; }
        const ch = route.ch, dur = Math.min(6, wc.endSeconds - wc.startSeconds);
        if (tech && tech.cc0 != null) out.send([0xB0 | ch, 0, tech.cc0]);
        const steps = 24, t0 = performance.now() + 5;
        out.send([0xB0 | ch, 7, C.heldCc7(wc, C.evalWaveCurve(wc, 0))], t0);
        out.send([0x90 | ch, wc.sonifyNote, C.heldVel(wc)], t0 + 5);
        for (let i = 1; i <= steps; i++) {
            const u = i / steps;
            out.send([0xB0 | ch, 7, C.heldCc7(wc, C.evalWaveCurve(wc, u))], t0 + 5 + u * dur * 1000);
        }
        if (wc.properties.cresc.secco !== false) out.send([0xB0 | ch, 7, 0], t0 + 5 + dur * 1000 - 10);
        out.send([0x80 | ch, wc.sonifyNote, 0], t0 + 5 + dur * 1000);
        this.status('heard · ' + C_().describe(wc));
    },
    context() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        if (this._ctxTimer) { clearTimeout(this._ctxTimer); this._ctxTimer = null; }
        if (C.isPlaying) C.stopPlay();
        const pps = C.pixelsPerSecond, from = Math.max(0, wc.startSeconds - 1), to = wc.endSeconds + 1;
        C.scrollOffset = from * pps; C.applyScroll(); C.startPlay();
        this.status('playing ' + from.toFixed(1) + ' → ' + to.toFixed(1) + ' s');
        this._ctxTimer = setTimeout(() => { this._ctxTimer = null; if (C.isPlaying) C.stopPlay(); C.scrollOffset = wc.startSeconds * pps; C.applyScroll(); this.status(''); }, (to - from) * 1000);
    },
    keep() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        this.apply();
        C.saveStatus.textContent = 'crescendo kept: ' + C_().describe(wc) + ' — click it to edit again';
        this.close();
    },
    remove() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        C.pushUndoState();
        C.objects = C.objects.filter(o => o !== wc);
        // its accents go with it (2026-09-10)
        Object.values((wc.properties.cresc && wc.properties.cresc.accents) || {}).forEach(id => { const a = C.objects.find(o => o.id === id); if (!a) return; C.objects = C.objects.filter(o => o !== a); const e2 = C.elementCache.get(a.id); if (e2) e2.remove(); C.elementCache.delete(a.id); });
        const el = C.elementCache.get(wc.id); if (el) el.remove();
        C.elementCache.delete(wc.id);
        C.objects.forEach(o => { if (o.mutedBy === wc.id) { delete o.mutedBy; C.renderWaveCurve(o); } });   // the grey original comes back (§277)
        C.selectedObject = null; C.selectedObjects = []; C.hidePropertyPanel();
        C.curveDirty(); C.markDirty(); C.scheduleConflictRefresh();
        C.saveStatus.textContent = 'crescendo removed — its note is back';
        this.close();
    },
    // ---- the ACCENT (2026-09-10, his commission): a short strike on the crescendo's start or its end, by a player of his choice, with its
    // own pitch and articulation; a note of its own in the crescendo's group, remembered on the crescendo (properties.cresc.accents)
    accentObj(at) { const C = HOST(), wc = this.wc; const acc = (wc && wc.properties.cresc && wc.properties.cresc.accents) || {}; return acc[at] ? C.objects.find(o => o.id === acc[at]) || null : null; },
    accentTechs(lane) { const C = HOST(); return (C.trackTechniques && C.trackTechniques(lane)) || []; },
    accentRange(lane, techKey) {
        const C = HOST(), inst = C.trackInstrument ? C.trackInstrument(lane) : null, techs = this.accentTechs(lane), t = techs.find(x => x.key === techKey) || null;
        return [t && t.rangeLow != null ? t.rangeLow : (inst && inst.rangeLow != null ? inst.rangeLow : 21), t && t.rangeHigh != null ? t.rangeHigh : (inst && inst.rangeHigh != null ? inst.rangeHigh : 108)];
    },
    accentLaneChanged(fillDefaults) {
        const q = id => this.el.querySelector(id), Cr = C_(), wc = this.wc; if (!q('#ccAccLane')) return;
        const lane = +q('#ccAccLane').value, techs = this.accentTechs(lane), instKey = (TRK()[lane] || {}).instKey;
        const def = techs.some(t => t.key === STRIKE_DEFAULT[instKey]) ? STRIKE_DEFAULT[instKey] : (techs[0] ? techs[0].key : '');
        q('#ccAccTech').innerHTML = techs.map(t => '<option value="' + esc(t.key) + '">' + esc(t.label || t.key) + '</option>').join('');
        const existing = this.accentObj(q('#ccAccAt').value);
        q('#ccAccTech').value = existing && existing.layer === lane ? existing.technique : def;
        if (fillDefaults) {
            const [lo, hi] = this.accentRange(lane, q('#ccAccTech').value);
            const f = Cr.foldInto(wc.sonifyNote, lo, hi);
            q('#ccAccPitch').value = existing && existing.layer === lane ? Cr.nm(existing.sonifyNote) : (f ? Cr.nm(f.pitch) : Cr.nm(wc.sonifyNote));
        }
    },
    paintAccent() {
        const q = id => this.el.querySelector(id), Cr = C_(); if (!q('#ccAccAt')) return;
        const at = q('#ccAccAt').value, a = this.accentObj(at), other = this.accentObj(at === 'start' ? 'end' : 'start');
        if (a) { q('#ccAccLane').value = String(a.layer); this.accentLaneChanged(false); q('#ccAccTech').value = a.technique; q('#ccAccPitch').value = Cr.nm(a.sonifyNote); q('#ccAccAdd').textContent = 'update'; }
        else q('#ccAccAdd').textContent = '+ add';
        // §351: the hold tick is only meaningful at the START — an accent AT the end has nothing left to be held through.
        { const hw = q('#ccAccHoldWrap'), hb = q('#ccAccHold');
          if (hw && hb) { const canHold = at === 'start'; hw.style.opacity = canHold ? '1' : '0.4'; hb.disabled = !canHold;
                          hb.checked = canHold && !!(a && a.properties && a.properties.accent && a.properties.accent.hold); } }
        this.accentMidiEcho();
        const T = TRK();
        const held = !!(a && a.properties && a.properties.accent && a.properties.accent.hold);
        q('#ccAccWho').textContent = (a ? 'at ' + at + ': ' + (T[a.layer] || {}).short + ' ' + Cr.nm(a.sonifyNote) + ' (' + a.sonifyNote + ') · ' + (this.accentTechs(a.layer).find(t => t.key === a.technique) || {}).label + (held ? ' · held to the crescendo end (' + (a.endSeconds - a.startSeconds).toFixed(2) + ' s)' : '') : 'no accent at the ' + at)
            + (other ? ' · the ' + (at === 'start' ? 'end' : 'start') + ' has one too' : '');
    },
    // §351, his: "it has f five, but I also wanna see the midi number" — the box takes a NAME or a NUMBER, and this echoes
    // whichever it is as the other, live, so the two readings are never in doubt.
    accentMidiEcho() {
        const q = id => this.el.querySelector(id), Cr = C_(); const box = q('#ccAccPitch'), out = q('#ccAccMidi');
        if (!box || !out || !Cr) return;
        const v = String(box.value || '').trim();
        const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(v), base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const midi = m ? base[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12 : (isFinite(+v) && v !== '' ? +v : NaN);
        out.textContent = isFinite(midi) ? (m ? '= ' + midi : '= ' + Cr.nm(midi)) : '';
    },
    accentAdd() {
        const C = HOST(), Cr = C_(), wc = this.wc, q = id => this.el.querySelector(id); if (!C || !wc) return;
        const at = q('#ccAccAt').value, lane = +q('#ccAccLane').value, tech = q('#ccAccTech').value;
        const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(String(q('#ccAccPitch').value || '').trim());
        const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        let midi = m ? base[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12 : (isFinite(+q('#ccAccPitch').value) ? +q('#ccAccPitch').value : NaN);
        if (!isFinite(midi)) { this.status('a pitch, please — C4, F#3, Bb2 …', true); return; }
        const [lo, hi] = this.accentRange(lane, tech); const f = Cr.foldInto(midi, lo, hi); if (f) midi = f.pitch;
        const t = at === 'end' ? wc.endSeconds : wc.startSeconds;
        // §351, his: "the accent duration, it will end at the same time the Crescendo does" — held, not a 140 ms strike.
        const holdBox = q('#ccAccHold'), hold = at === 'start' && !!(holdBox && holdBox.checked && !holdBox.disabled);
        const endT = hold ? Math.max(t + 0.05, wc.endSeconds) : t + ACCENT_MS / 1000;
        C.pushUndoState();
        let a = this.accentObj(at);
        const vel = 110, lv = Math.max(1, Math.round((vel / 127) * 100) / 10);
        if (!a) { a = { id: 'wc-' + (C.nextId++), type: 'waveCurve', properties: {} }; C.objects.push(a); }
        Object.assign(a, { layer: lane, groupId: wc.groupId || null, startSeconds: +t.toFixed(3), endSeconds: +endT.toFixed(3),
            nodes: [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
            color: '#C9A05A', fillMode: 'bottom', opacity: 0.55, performanceNotes: 'accent at the ' + at + ' of a crescendo (' + Cr.nm(midi) + ' / ' + midi + ')' + (hold ? ', held to its end' : ''),
            srcKind: 'strike', sonifyNote: midi, technique: tech, sonifyMode: 'plain', recVel: vel });
        a.properties.accent = { of: wc.id, at, hold };
        wc.properties.cresc.accents = Object.assign({}, wc.properties.cresc.accents || {}, { [at]: a.id });
        const old = C.elementCache.get(a.id); if (old) old.remove(); C.elementCache.delete(a.id);
        if (C.renderWaveCurve) C.renderWaveCurve(a); else C.renderAll();
        C.curveDirty(); C.markDirty(); if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();
        this.paintAccent(); this.status('accent at the ' + at + ': ' + (TRK()[lane] || {}).short + ' ' + Cr.nm(midi) + ' (' + midi + ')' + (hold ? ' · held to the crescendo end' : '') + (f && f.fold ? ' · folded' : ''));
    },
    accentHear() {
        const q = id => this.el.querySelector(id), D = root.StrikeDrawer; if (!D || !D.hearOne) { this.status('the strikes drawer is not loaded', true); return; }
        const a = this.accentObj(q('#ccAccAt').value);
        const lane = a ? a.layer : +q('#ccAccLane').value, tech = a ? a.technique : q('#ccAccTech').value;
        const Cr = C_(); const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(String(q('#ccAccPitch').value || '').trim()); const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const midi = a ? a.sonifyNote : (m ? base[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12 : 60);
        D.hearOne(lane, tech, midi); this.status('hearing ' + (TRK()[lane] || {}).short + ' ' + Cr.nm(midi));
    },
    accentRemove() {
        const C = HOST(), wc = this.wc, q = id => this.el.querySelector(id); if (!C || !wc) return;
        const at = q('#ccAccAt').value, a = this.accentObj(at); if (!a) { this.status('no accent at the ' + at); return; }
        C.pushUndoState();
        C.objects = C.objects.filter(o => o !== a); const el = C.elementCache.get(a.id); if (el) el.remove(); C.elementCache.delete(a.id);
        const acc = Object.assign({}, wc.properties.cresc.accents || {}); delete acc[at]; wc.properties.cresc.accents = acc;
        C.curveDirty(); C.markDirty(); if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();
        this.paintAccent(); this.status('accent at the ' + at + ' removed');
    },
    makeDraggable(box, handle) {
        let sx = 0, sy = 0, bx = 0, by = 0, on = false;
        handle.addEventListener('mousedown', e => { if (e.target.id === 'ccX') return; on = true; sx = e.clientX; sy = e.clientY; const r = box.getBoundingClientRect(); bx = r.left; by = r.top; e.preventDefault(); });
        document.addEventListener('mousemove', e => { if (!on) return; box.style.left = Math.max(0, bx + e.clientX - sx) + 'px'; box.style.top = Math.max(0, by + e.clientY - sy) + 'px'; });
        document.addEventListener('mouseup', () => { on = false; });
    },
};
root.CrescCard = CARD;
}(typeof self !== 'undefined' ? self : this));
