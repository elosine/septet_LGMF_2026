// cue_picker.js — THE PICKER CARD (PLAN 1j step 3; CN-43; RUNNING_LOG §232). A click on a line — or on a note born of one — opens a
// small card beside it: the source at the top; a vertical keyboard over the piano's range with the chosen voice's reach lit, and on it
// the ensemble's sounding pitches at that instant in the players' colours (a mid-glide one with its cents), the piano's own notes then,
// the line's source ringed; the four voices; the eight dynamics; the duration presets and a box; a key click sets the pitch and
// sounds it on the piano alone at the chosen voice and dynamic (his "a", §221); ▶ in context plays the score from a second before to
// two after; ENTER applies, ESC closes; apply turns the line into a note through Composer.cueToNote (the provenance kept); a made
// note reopens with its values. The keyboard is the drawers' (strike_drawer.js / beating_panel.js: the keys stacked by pitch, a C per
// octave), drawn here for the piano. Loads on the page after piano_cues.js; nothing in node.
(function (root) {
'use strict';
const HOST = () => (typeof Composer !== 'undefined') ? Composer : null;
const PC = () => root.PianoCues;
const KEY_H = 7, KB_LO = 21, KB_HI = 108, KB_W = 200, KEY_X = 24, WHITE_W = 46, BLACK_W = 28, MARK_X = 84, MARK_GAP = 36;
const BLACK = [1, 3, 6, 8, 10];
const VOICES = [['main', 'normal'], ['muted', 'muted'], ['harmonics', 'harmonic'], ['plucked', 'plucked']];
const HELD = () => ({ lo: (typeof HELD_LO !== 'undefined') ? HELD_LO : 65, hi: (typeof HELD_HI !== 'undefined') ? HELD_HI : 127 });
const nn = m => PC().nm(m);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';
const LIT = 'background:#b39ddb;color:#111;border:1px solid #d6c7f0;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';

const P = {
    el: null, wc: null, st: null, _docKey: null, _ctxTimer: null, _ctxOn: false,

    open(wc, e) {
        const C = HOST(); if (!C || !PC() || !wc || !wc.properties || !wc.properties.cue) return;
        this.close();
        this.wc = wc;
        const cue = wc.properties.cue, isNote = wc.sonifyNote != null;
        this.st = {
            t: wc.startSeconds, kind: cue.kind, isNote,
            pitch: isNote ? wc.sonifyNote : null,
            voice: (isNote && wc.technique) ? wc.technique : 'main',
            height: (wc.nodes && wc.nodes.length) ? +wc.nodes[0].y : PC().DEFAULTS.defaultHeight,
            dur: isNote ? +(wc.endSeconds - wc.startSeconds).toFixed(2) : PC().DEFAULTS.defaultDur,
        };
        this.build(e);
        this._docKey = (ev) => {
            if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); this.close(); }
            else if (ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); this.apply(); }
        };
        document.addEventListener('keydown', this._docKey, true);
    },

    close() {
        if (this._docKey) { document.removeEventListener('keydown', this._docKey, true); this._docKey = null; }
        if (this._ctxTimer) { clearTimeout(this._ctxTimer); this._ctxTimer = null; }
        const C = HOST();
        if (this._ctxOn && C && C.isPlaying) C.stopPlay();
        this._ctxOn = false;
        if (this.el) { this.el.remove(); this.el = null; }
        this.wc = null; this.st = null;
    },

    isOpen() { return !!this.el; },

    // ---- the voice's reach on the piano (the recipe's technique ranges) ----
    reach() {
        const C = HOST(), lane = C.cueLane(), techs = C.trackTechniques(lane) || [], t = techs.find(x => x.key === this.st.voice) || {};
        const inst = C.trackInstrument(lane) || {};
        return { lo: t.rangeLow != null ? t.rangeLow : (inst.rangeLow != null ? inst.rangeLow : KB_LO), hi: t.rangeHigh != null ? t.rangeHigh : (inst.rangeHigh != null ? inst.rangeHigh : KB_HI) };
    },

    opts() { const C = HOST(); return C.cueOpts ? C.cueOpts() : { pianoLane: 2, metaLayer: 7 }; },

    build(e) {
        const C = HOST(), cue = this.wc.properties.cue, st = this.st, O = this.opts();
        const box = document.createElement('div'); box.id = 'cuePicker';
        box.setAttribute('tabindex', '0');
        box.style.cssText = 'position:fixed;z-index:9600;width:452px;background:#26262e;color:#ddd;border:1px solid #b39ddb;border-radius:6px;padding:0;font:12px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,0.45);user-select:none';
        const x0 = e && e.clientX != null ? e.clientX : 200, y0 = e && e.clientY != null ? e.clientY : 200;
        box.style.left = Math.max(4, Math.min(window.innerWidth - 460, x0 + 14)) + 'px';
        box.style.top = Math.max(4, Math.min(window.innerHeight - 470, y0 - 120)) + 'px';
        const src = PC().sourceText(cue, O);
        box.innerHTML = [
            '<div id="cpDrag" style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:#2f2f3a;border-bottom:1px solid #444;cursor:move;border-radius:6px 6px 0 0">',
            '<span><b style="color:#d6c7f0">' + (st.isNote ? 'piano note' : 'line') + '</b> <span style="color:#aaa">' + PC().KIND_MARK[cue.kind] + ' ' + esc(src) + '</span></span>',
            '<span id="cpClose" title="ESC" style="cursor:pointer;color:#aaa;font-size:14px">&#10005;</span></div>',
            '<div style="display:flex;gap:8px;padding:6px 8px 8px">',
            '<div id="cpKbBox" style="width:' + KB_W + 'px;max-height:400px;overflow-y:auto;overflow-x:hidden;border:1px solid #3a3a44;background:#1b1b20;border-radius:3px"></div>',
            '<div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0">',
            '<div id="cpPitch" style="font-size:13px;color:#e8cf9a"></div>',
            '<div><div style="color:#888;margin-bottom:2px">voice</div><div id="cpVoices" style="display:flex;gap:4px;flex-wrap:wrap"></div></div>',
            '<div><div style="color:#888;margin-bottom:2px">dynamic</div><div id="cpDyns" style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px"></div></div>',
            '<div><div style="color:#888;margin-bottom:2px">duration</div><div id="cpDurs" style="display:flex;gap:3px;flex-wrap:wrap;align-items:center"></div></div>',
            '<div style="display:flex;gap:4px;align-items:center;margin-top:2px">',
            '<button id="cpCtx" style="' + BTN + '" title="play the score from a second before this line to two after (the piano with the ensemble)">&#9654; in context</button>',
            '<button id="cpHear" style="' + BTN + '" title="sound the chosen key on the piano alone">&#9834; hear</button>',
            '</div>',
            '<div style="display:flex;gap:4px;align-items:center;margin-top:auto">',
            '<button id="cpSet" style="' + LIT + ';font-weight:bold" title="ENTER">' + (st.isNote ? 'set' : 'make the note') + '</button>',
            '<button id="cpCancel" style="' + BTN + '" title="ESC">close</button>',
            '</div>',
            '<div id="cpStatus" style="color:#9a9;min-height:14px;font-size:11px"></div>',
            '<div style="color:#666;font-size:10px">a key sets the pitch and sounds it &middot; ENTER applies &middot; ESC closes</div>',
            '</div></div>',
        ].join('');
        document.body.appendChild(box);
        this.el = box;
        ['mousedown', 'click', 'dblclick', 'mouseup', 'wheel'].forEach(ev => box.addEventListener(ev, x => x.stopPropagation()));
        box.querySelector('#cpClose').addEventListener('click', () => this.close());
        box.querySelector('#cpCancel').addEventListener('click', () => this.close());
        box.querySelector('#cpSet').addEventListener('click', () => this.apply());
        box.querySelector('#cpCtx').addEventListener('click', () => this.playContext());
        box.querySelector('#cpHear').addEventListener('click', () => this.audition());
        this.makeDraggable(box, box.querySelector('#cpDrag'));
        this.drawControls();
        this.drawKeyboard(true);
        box.focus();
    },

    drawControls() {
        const st = this.st, box = this.el, P_ = PC();
        box.querySelector('#cpPitch').innerHTML = st.pitch != null ? 'pitch <b>' + nn(st.pitch) + '</b> <span style="color:#888">(' + st.pitch + ')</span>' : '<span style="color:#888">pick a key on the keyboard</span>';
        const vb = box.querySelector('#cpVoices'); vb.innerHTML = '';
        VOICES.forEach(([key, label]) => {
            const b = document.createElement('button'); b.textContent = label; b.dataset.voice = key;
            b.style.cssText = st.voice === key ? LIT : BTN;
            b.addEventListener('click', () => { st.voice = key; this.drawControls(); this.drawKeyboard(false); this.audition(); });
            vb.appendChild(b);
        });
        const db = box.querySelector('#cpDyns'); db.innerHTML = '';
        const cur = P_.dynName(st.height);
        P_.DYN.forEach(d => {
            const b = document.createElement('button'); b.textContent = d; b.dataset.dyn = d;
            b.style.cssText = (cur === d ? LIT : BTN) + ';padding:2px 3px';
            b.addEventListener('click', () => { st.height = P_.dynHeight(d); this.drawControls(); this.audition(); });
            db.appendChild(b);
        });
        const ub = box.querySelector('#cpDurs'); ub.innerHTML = '';
        P_.PRESETS.forEach(s => {
            const b = document.createElement('button'); b.textContent = s < 1 ? s.toString().replace('0.', '.') : s + ' s'; b.dataset.dur = s;
            b.style.cssText = (Math.abs(st.dur - s) < 1e-6 ? LIT : BTN) + ';padding:2px 5px';
            b.addEventListener('click', () => { st.dur = s; this.drawControls(); });
            ub.appendChild(b);
        });
        const nb = document.createElement('button'); nb.textContent = 'next'; nb.title = 'to the next line or note on the piano lane'; nb.style.cssText = BTN + ';padding:2px 5px';
        nb.addEventListener('click', () => {
            const C = HOST(), nx = P_.nextAfter(C.objects, st.t, this.opts());
            if (nx == null) { this.status('nothing follows on the piano lane — the duration stays', true); return; }
            st.dur = Math.max(0.1, +(nx - st.t).toFixed(2)); this.drawControls();
            this.status('to the next line: ' + st.dur.toFixed(2) + ' s');
        });
        ub.appendChild(nb);
        const inp = document.createElement('input'); inp.type = 'number'; inp.step = '0.05'; inp.min = '0.05'; inp.value = st.dur; inp.id = 'cpDurIn';
        inp.title = 'seconds — type, or turn the wheel over it'; inp.style.cssText = 'width:56px;background:#1a1a22;color:#cca;border:1px solid #333;padding:2px 4px;font-size:11px';
        inp.addEventListener('change', () => { const v = parseFloat(inp.value); if (isFinite(v) && v > 0) { st.dur = +v.toFixed(2); this.drawControls(); } });
        inp.addEventListener('wheel', ev => { ev.preventDefault(); const v = Math.max(0.05, +(st.dur + (ev.deltaY < 0 ? 0.05 : -0.05)).toFixed(2)); st.dur = v; inp.value = v; this.drawControls(); }, { passive: false });
        ub.appendChild(inp);
        const sEl = document.createElement('span'); sEl.textContent = 's'; sEl.style.color = '#888'; ub.appendChild(sEl);
    },

    // the vertical keyboard: the keys stacked by pitch, a C per octave; the voice's reach lit; the ensemble at this instant; the piano's own
    drawKeyboard(scrollTo) {
        const C = HOST(), P_ = PC(), st = this.st, cue = this.wc.properties.cue, O = this.opts(), lane = C.cueLane();
        const kb = this.el.querySelector('#cpKbBox'), reach = this.reach();
        const H = (KB_HI - KB_LO + 1) * KEY_H + 4, yOf = m => (KB_HI - m) * KEY_H + 2;
        let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + KB_W + '" height="' + H + '" style="display:block">';
        for (let m = KB_HI; m >= KB_LO; m--) {
            const y = yOf(m), black = BLACK.includes(m % 12), inReach = m >= reach.lo && m <= reach.hi;
            s += '<rect class="cpKey" data-m="' + m + '" x="' + KEY_X + '" y="' + (y + 0.5) + '" width="' + (black ? BLACK_W : WHITE_W) + '" height="' + (KEY_H - 1) + '" fill="' + (black ? '#2a2a30' : '#d8d3c8') + '" stroke="#111" stroke-width="0.4" opacity="' + (inReach ? 1 : 0.22) + '" style="cursor:pointer"><title>' + nn(m) + (inReach ? '' : ' — beyond this voice') + '</title></rect>';
            if (m % 12 === 0) s += '<text x="2" y="' + (y + KEY_H - 1) + '" font-size="8" fill="#999" style="pointer-events:none">C' + (m / 12 - 1) + '</text>';
        }
        if (st.pitch != null && st.pitch >= KB_LO && st.pitch <= KB_HI) {
            const y = yOf(st.pitch);
            s += '<rect x="' + (KEY_X - 1) + '" y="' + (y - 0.5) + '" width="' + (WHITE_W + 2) + '" height="' + (KEY_H + 1) + '" fill="none" stroke="#FFD700" stroke-width="1.6" style="pointer-events:none"/>';
        }
        // the ensemble at this instant (just after an onset, just before an end) and the piano's own notes then
        const tAt = st.t + (cue.kind === 'end' ? -0.001 : 0.001);
        const ens = P_.ensembleAt(C.objects, tAt, O).filter(x => x.id !== this.wc.id);
        const slots = {};
        const marks = [];
        ens.forEach(x => {
            const key = Math.round(x.pitch), slot = slots[key] = (slots[key] || 0);
            slots[key]++;
            const isPno = x.lane === lane, col = isPno ? P_.INST_COL.piano : P_.colorOf(x.lane, O), label = isPno ? 'Pno' : P_.labelOf(x.lane, O);
            const yc = (KB_HI - x.pitch) * KEY_H + 2 + KEY_H / 2, cx = MARK_X + slot * MARK_GAP;
            const isSrc = x.id === cue.srcId;
            marks.push({ yc, isSrc });
            if (isSrc) s += '<circle cx="' + cx + '" cy="' + yc + '" r="7.5" fill="none" stroke="#fff" stroke-width="1.2" style="pointer-events:none"/>';
            s += '<circle cx="' + cx + '" cy="' + yc + '" r="4.5" fill="' + col + '" stroke="#111" stroke-width="0.5"><title>' + esc(label + ' ' + nn(x.midi) + (x.cents ? ' ' + (x.cents > 0 ? '+' : '') + x.cents + ' c' : '') + (isSrc ? ' — the source of this line' : '')) + '</title></circle>';
            s += '<text x="' + (cx + 6) + '" y="' + (yc + 3) + '" font-size="8" fill="' + col + '" style="pointer-events:none">' + esc(label) + (x.cents ? '<tspan fill="#999">' + (x.cents > 0 ? '+' : '') + x.cents + '</tspan>' : '') + '</text>';
        });
        s += '</svg>';
        kb.innerHTML = s;
        kb.querySelectorAll('.cpKey').forEach(k => k.addEventListener('mousedown', ev => { ev.preventDefault(); ev.stopPropagation(); this.setPitch(+k.dataset.m, true); }));
        const legend = ens.length ? ens.map(x => (x.lane === lane ? 'Pno' : P_.labelOf(x.lane, O)) + ' ' + nn(Math.round(x.pitch)) + (x.cents ? (x.cents > 0 ? '+' : '') + x.cents : '')).join(' · ') : 'nothing sounds at this instant';
        kb.title = 'the ensemble at ' + st.t.toFixed(2) + ' s: ' + legend;
        if (scrollTo) {
            const src = marks.find(m => m.isSrc), yc = src ? src.yc : (marks.length ? marks.reduce((a, m) => a + m.yc, 0) / marks.length : yOf(st.pitch != null ? st.pitch : 60));
            kb.scrollTop = Math.max(0, yc - kb.clientHeight / 2);
        }
    },

    setPitch(m, sound) {
        this.st.pitch = m;
        this.drawControls();
        this.drawKeyboard(false);
        if (sound) this.audition();
    },

    // the sound: the chosen key on the piano alone, the voice's channel, the dynamic through the remap (the score's held-note law)
    async audition() {
        const C = HOST(), st = this.st; if (!C || !st || st.pitch == null) return;
        const lane = C.cueLane(), inst = C.trackInstrument(lane) || {}, tech = (C.trackTechniques(lane) || []).find(t => t.key === st.voice) || {};
        const port = String(tech.port || inst.port || '').toLowerCase(), ch = ((tech.channel || 1) - 1);
        try { if (!C._zoneMidiInited && C.initZoneMidi) await C.initZoneMidi(); } catch (e) { }
        const out = C._zoneMidiOutputs && C._zoneMidiOutputs[port];
        if (!out) { this.status('no MIDI output for ' + (port || 'the piano'), true); return; }
        const H = HELD(), h01 = Math.max(0, Math.min(1, st.height / 10)), anchor = H.lo + (H.hi - H.lo) * h01;
        let vel = Math.round(anchor), cc7 = 127;
        if (C._velRemap && typeof VelocityRemap !== 'undefined') {
            try { const d = VelocityRemap.heldNote(C._velRemap, 'piano', st.pitch, anchor); vel = d.vel; cc7 = VelocityRemap.cc7ForHeight(C._velRemap, 'piano', st.pitch, vel, anchor); } catch (e) { }
        }
        if (tech.cc0 != null) out.send([0xB0 | ch, 0, tech.cc0]);
        out.send([0xB0 | ch, 7, Math.max(0, Math.min(127, Math.round(cc7)))]);
        out.send([0x90 | ch, st.pitch, Math.max(1, Math.min(127, Math.round(vel)))]);
        const key = st.pitch, ms = Math.round(Math.min(2.5, Math.max(0.15, st.dur)) * 1000);
        setTimeout(() => { try { out.send([0x80 | ch, key, 0]); } catch (e) { } }, ms);
        this._lastAudition = { port, ch, key, vel, cc7 };
        this.status('heard ' + nn(key) + ' · ' + (VOICES.find(v => v[0] === st.voice) || [st.voice, st.voice])[1] + ' · ' + PC().dynName(st.height) + ' (velocity ' + vel + ')');
    },

    // ▶ in context: the score from a second before the line to two after, then back to the line
    playContext() {
        const C = HOST(), st = this.st; if (!C || !st) return;
        if (this._ctxTimer) { clearTimeout(this._ctxTimer); this._ctxTimer = null; }
        if (C.isPlaying) C.stopPlay();
        const pps = C.pixelsPerSecond;
        C.scrollOffset = Math.max(0, st.t - 1) * pps; C.applyScroll();
        C.startPlay(); this._ctxOn = true;
        this.status('playing ' + Math.max(0, st.t - 1).toFixed(1) + ' → ' + (st.t + 2).toFixed(1) + ' s');
        this._ctxTimer = setTimeout(() => {
            this._ctxTimer = null;
            if (C.isPlaying) C.stopPlay();
            this._ctxOn = false;
            C.scrollOffset = st.t * pps; C.applyScroll();
            if (this.el) this.status('');
        }, 3000);
    },

    // apply: the line becomes a note (a made note takes the new values) — the same object, its provenance kept; undo restores
    apply() {
        const C = HOST(), st = this.st, wc = this.wc; if (!C || !st || !wc) return;
        if (st.pitch == null) { this.status('pick a key first', true); return; }
        const inp = this.el.querySelector('#cpDurIn'); if (inp) { const v = parseFloat(inp.value); if (isFinite(v) && v > 0) st.dur = +v.toFixed(2); }
        if (C.pushUndoState) C.pushUndoState();
        C.cueToNote(wc, { pitch: st.pitch, technique: st.voice, height: st.height, dur: st.dur });
        if (C.markDirty) C.markDirty();
        if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();
        if (C.saveStatus) C.saveStatus.textContent = (st.isNote ? 'piano note set: ' : 'a piano note from the line: ') + nn(st.pitch) + ' ' + (VOICES.find(v => v[0] === st.voice) || [st.voice, st.voice])[1] + ' ' + PC().dynName(st.height) + ' ' + st.dur.toFixed(2) + ' s — CTRL+Z undoes';
        C.selectObject(wc);
        this.close();
    },

    status(msg, bad) { const s = this.el && this.el.querySelector('#cpStatus'); if (!s) return; s.style.color = bad ? '#e06666' : '#9a9'; s.textContent = msg || ''; },

    makeDraggable(box, handle) {
        let sx = 0, sy = 0, bx = 0, by = 0, on = false;
        handle.addEventListener('mousedown', e => { if (e.target.id === 'cpClose') return; on = true; sx = e.clientX; sy = e.clientY; const r = box.getBoundingClientRect(); bx = r.left; by = r.top; e.preventDefault(); });
        document.addEventListener('mousemove', e => { if (!on) return; box.style.left = Math.max(0, bx + e.clientX - sx) + 'px'; box.style.top = Math.max(0, by + e.clientY - sy) + 'px'; });
        document.addEventListener('mouseup', () => { on = false; });
    },
};
root.CuePicker = P;
}(typeof self !== 'undefined' ? self : this));
