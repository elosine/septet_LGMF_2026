// strike_chords_ui.js — CHORDS MODE IN THE STRIKES DRAWER (PLAN 1k steps 2–5; CN-44 … CN-47; RUNNING_LOG §250–253).
//
// A mixin on the drawer (strike_drawer.js), not a second drawer: his "a mirror of how it already is … re-adapt the same gooey
// elements". The drawer's rhythm is the rhythm — the strike's onsets with its dials, shapes, jitter and the run, untouched. What
// changes is what sits on an onset: a chord, or part of one, dealt over the players by the engine (strike_chords.js).
//
// THE SCREEN (§242, his question answered): his own screen with a CURSOR. The keyboard and its dotted lines are unchanged in kind and
// show ONE ONSET — the selected one; the rhythm strip is the selector (a column of dots per onset, the selected column lit); today's
// screen is this screen with a sequence of one. The chords list sits where the strikes list sits; the players column where the
// orchestration rows are; the articulation pull-downs keep their meaning (a player's voice for the whole sequence).
//
// Notes mode is byte-identical: every method here is reached only when `cfg.mode === 'chords'`, through five dispatch lines in
// strike_drawer.js.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[strike_chords_ui] the strikes drawer is not loaded'); return; }

const SC = () => root.StrikeChords;
const C_ = () => (typeof Composer !== 'undefined') ? Composer : (root.Composer || null);
const E_ = () => (typeof MorphEmit !== 'undefined') ? MorphEmit : (root.MorphEmit || null);
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : (root.TRACKS || []);
const INST = () => (typeof INSTRUMENTS !== 'undefined') ? INSTRUMENTS : (root.INSTRUMENTS || {});
const AC = () => (typeof AccelCalc !== 'undefined') ? AccelCalc : (root.AccelCalc || null);
const INST_COL = { flute: '#ffd479', bass_clarinet: '#e08a8a', piano: '#e8cf9a', violin1: '#8ea9c9', violin2: '#69b7c9', viola: '#b58ec9', cello: '#7ec9a8' };
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';

const CH_DEFAULTS = {
    list: [], order: 'turn', advance: 'exhaust', timesMin: 2, timesMax: 4, selection: 'shuffle',
    countMin: 2, countMax: 4, reattackMs: 150, dealer: 'free', seed: 1,   // PLAN 1l §256: 150 ms after the END is the app's one rule
    players: null,            // null = every player but the piano; else a list of lanes
    manual: {}, span: null, sel: 0,
};

Object.assign(D, {

    // ---------------------------------------------------------------- state
    ch() {
        if (!this.cfg.ch) this.cfg.ch = JSON.parse(JSON.stringify(CH_DEFAULTS));
        else for (const k in CH_DEFAULTS) if (this.cfg.ch[k] === undefined) this.cfg.ch[k] = JSON.parse(JSON.stringify(CH_DEFAULTS[k]));
        return this.cfg.ch;
    },
    isChords() { return this.cfg.mode === 'chords'; },

    // the players taking part: the ticked lanes with their ordinary voice and its measured range (the drawer's own source)
    chordPlayers() {
        const c = this.ch(), T = TRK();
        const lanes = c.players || T.map((t, i) => i).filter(i => T[i].instKey !== 'piano');
        return lanes.map(lane => {
            const inst = this.instOf(lane); if (!inst) return null;
            const tech = (inst.techniques || []).find(x => x.key === (c.tech && c.tech[lane])) || (inst.techniques || []).find(x => x.key === this.defaultTech(lane)) || (inst.techniques || [])[0];
            if (!tech) return null;
            const lo = tech.rangeLow != null ? tech.rangeLow : (inst.rangeLow != null ? inst.rangeLow : 21);
            const hi = tech.rangeHigh != null ? tech.rangeHigh : (inst.rangeHigh != null ? inst.rangeHigh : 108);
            return { lane, tech: tech.key, label: (T[lane] || {}).short || ('lane ' + lane), lo, hi, instKey: (T[lane] || {}).instKey };
        }).filter(Boolean);
    },

    // the onsets: the drawer's own rhythm — the strike's pattern with its dials, or the run's
    chordOnsets() {
        if (this.cfg.shape === 'accel') { const a = AC(); if (a) { try { return a.run(this.accelSpec()).onsets.slice(); } catch (e) { } } }
        return this.pattern().slice().sort((x, y) => x - y);
    },

    // the deal, cached on the settings that make it
    chordSeq() {
        const S = SC(); if (!S) return null;
        const c = this.ch();
        if (c.frozen && c.frozen.events) return c.frozen;   // a take loaded "as it was": the stored sequence stands until a dial is touched
        const players = this.chordPlayers(), onsets = this.chordOnsets();
        const key = JSON.stringify([onsets, c.list.map(x => [x.id, x.pitches]), players.map(p => [p.lane, p.tech, p.lo, p.hi]),
            c.order, c.advance, c.timesMin, c.timesMax, c.selection, c.countMin, c.countMax, c.reattackMs, c.dealer, c.seed, c.manual,
            c.soundMs]);   // PLAN 1o: a swell occupies its player far longer than a hit, so the length is part of the deal (§302)
        if (this._chSeq && this._chSeq.key === key) return this._chSeq.out;
        const out = S.deal(onsets, c.list, players, {
            order: c.order, advance: c.advance, timesMin: +c.timesMin, timesMax: +c.timesMax, selection: c.selection,
            countMin: +c.countMin, countMax: +c.countMax, reattackMs: +c.reattackMs, dealer: c.dealer, seed: +c.seed,
            soundMs: c.soundMs != null ? +c.soundMs : undefined,   // PLAN 1o: 140 ms for a hit, the swell's own length for a swell
        }, (pitch, p) => this.realize(pitch, p), c.manual);
        this._chSeq = { key, out };
        return out;
    },
    chordDirty() { this._chSeq = null; const c = this.cfg.ch; if (c) c.frozen = null; },   // any dial touched = a fresh deal (a frozen take is let go)

    // the marked span (step 4): the onset indices inside it, or every onset when nothing is marked
    chordSpanIdx() {
        const c = this.ch(), res = this.chordSeq(); if (!res) return [];
        const all = res.events.map(e => e.i);
        if (!c.span) return all;
        const a = Math.min(c.span.from, c.span.to), b = Math.max(c.span.from, c.span.to);
        return all.filter(i => i >= a && i <= b);
    },

    // the notes in the drawer's own shape, so play / insert / the score path are the code they always were
    chordNotes(opts) {
        const res = this.chordSeq(); if (!res) return [];
        const only = (opts && opts.span) ? new Set(this.chordSpanIdx()) : null;
        const T = TRK(), pianoLane = T.findIndex(t => t.instKey === 'piano');
        const dur = Math.max(30, 140 * (this.cfg.durX || 1));
        const out = [];
        res.events.forEach(e => {
            if (only && !only.has(e.i)) return;
            e.notes.forEach(n => {
                const vel = clamp(Math.round((this.cfg.flatten ? 127 : 100) * (this.cfg.dynX || 1)), 1, 127);
                out.push({ lane: n.lane, tech: n.tech, midi: n.midi, vel: this.remapVel(n.lane, n.midi, vel), onMs: e.t, durMs: dur });
            });
        });
        if (opts && opts.piano) return out.map(n => ({ lane: pianoLane, tech: 'main', midi: n.midi, vel: n.vel, onMs: n.onMs, durMs: n.durMs }));
        return out;
    },

    // ---------------------------------------------------------------- the controls (injected once)
    injectChordUI() {
        if (!this.el || this.el.querySelector('#skModeWrap')) return;
        const head = this.el.querySelector('#skHead');
        const wrap = document.createElement('span');
        wrap.id = 'skModeWrap';
        wrap.style.cssText = 'display:inline-flex;gap:3px;align-items:center;white-space:nowrap';
        wrap.title = 'PLAN 1k: notes = the drawer as it always was (one note per onset); chords = the same rhythm with a chord, or part of one, on every onset, dealt over the players by rule';
        wrap.innerHTML = '<span style="color:#9a9">mode</span>' +
            '<button id="skModeNotes" style="' + BTN + '">notes</button><button id="skModeChords" style="' + BTN + '" title="§377: the OLD chords tool (a chord list, dealt by rule). A chord on each onset of your rhythm lives in NOTES mode: double-click an onset dot, then click a harmony in the left column">chords (old)</button>';
        head.insertBefore(wrap, head.querySelector('#skSeqSel') ? head.querySelector('#skSeqSel').parentNode : head.querySelector('#skReload'));
        wrap.querySelector('#skModeNotes').addEventListener('click', () => this.setMode('notes'));
        wrap.querySelector('#skModeChords').addEventListener('click', () => this.setMode('chords'));
        // the chords foot (Generate · the readout) beside the drawer's own buttons
        const foot = this.el.querySelector('#skFoot');
        const cf = document.createElement('span');
        cf.id = 'skChFoot';
        cf.style.cssText = 'display:none;gap:6px;align-items:center;white-space:nowrap';
        cf.innerHTML = '<span style="color:#555">|</span>' +
            '<button id="skChGen" style="' + BTN + ';color:#e8cf9a" title="deal the chords over the players at the rhythm\'s onsets (a new seed each time; the dials and the seed box are beside the players)">Generate</button>' +
            '<button id="skChClear" style="' + BTN + '" title="unmark the span — the insert buttons write the whole sequence again">whole</button>' +
            '<label title="a take carries the dealt sequence AND the settings: ticked, a load puts the sequence back exactly as it was; unticked, it fills the dials and deals again"><input id="skChAsIs" type="checkbox" checked> as it was</label>' +
            '<span id="skChSpan" style="color:#9a9"></span>';
        foot.insertBefore(cf, foot.querySelector('#skTakeGrp'));
        cf.querySelector('#skChGen').addEventListener('click', () => { const c = this.ch(); c.seed = (+c.seed || 1) + 1; this.chordDirty(); this.save(); this.render(); this.setStatus(SC().describe(this.chordSeq())); });
        cf.querySelector('#skChClear').addEventListener('click', () => this.clearChordSpan());
        this.paintMode();
    },
    paintMode() {
        if (!this.el) return;
        const on = this.isChords();
        const a = this.el.querySelector('#skModeNotes'), b = this.el.querySelector('#skModeChords');
        if (a) a.style.cssText = BTN + (on ? '' : ';background:#4a3a12;color:#e8cf9a;border-color:#C9A05A');
        if (b) b.style.cssText = BTN + (on ? ';background:#4a3a12;color:#e8cf9a;border-color:#C9A05A' : '');
        const cf = this.el.querySelector('#skChFoot'); if (cf) cf.style.display = on ? 'inline-flex' : 'none';
        const pick = this.el.querySelector('#skPick'); if (on && pick) pick.style.display = 'none';
    },
    setMode(m) {
        this.cfg.mode = m === 'chords' ? 'chords' : 'notes';
        this.chordDirty(); this.save(); this.paintMode(); this.closeOnsetCard();
        if (this.strike) this.render();
        this.setStatus(this.isChords() ? 'chords mode — build a chord list, then Generate' : 'notes mode');
    },

    // ---------------------------------------------------------------- render
    renderChords() {
        this.paintMode();
        this.renderChordList();
        this.renderChordPlayers();
        this.renderChordKeyboard();
        this.renderChordRhythm();
        const res = this.chordSeq();
        const el = this.el.querySelector('#skChSpan');
        if (el && res) {
            const idx = this.chordSpanIdx(), c = this.ch();
            el.textContent = c.span ? (idx.length + ' of ' + res.events.length + ' onsets marked') : (res.events.length + ' onsets');
        }
        requestAnimationFrame(() => this.renderChordLines());
    },

    // the chords list, where the strikes list sits
    renderChordList() {
        const box = this.el.querySelector('#skSeq'), c = this.ch(), S = SC();
        const opt = (arr, v) => arr.map(([k, l]) => '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
        let s = '<div style="padding:3px 6px;border-bottom:1px solid #333;color:#e8cf9a">CHORDS <span style="color:#9a9">' + c.list.length + '</span></div>';
        s += '<div id="skChRows" style="max-height:38%;overflow:auto">';
        c.list.forEach((x, i) => {
            s += '<div class="skChRow" data-i="' + i + '" style="display:flex;gap:4px;align-items:center;padding:1px 6px;border-bottom:1px solid #262630">' +
                '<span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc((x.pitches || []).map(nm).join(' ')) + '">' + esc(x.name || x.id) +
                ' <span style="color:#777">' + (x.pitches || []).length + '</span></span>' +
                '<span class="skChUp" data-i="' + i + '" style="cursor:pointer;color:#888" title="up">&#9650;</span>' +
                '<span class="skChDel" data-i="' + i + '" style="cursor:pointer;color:#a66" title="remove">&times;</span></div>';
        });
        if (!c.list.length) s += '<div style="padding:4px 6px;color:#777">empty — add from a bank below, or type pitches</div>';
        s += '</div>';
        s += '<div style="padding:3px 6px;border-top:1px solid #333;display:flex;flex-direction:column;gap:3px">' +
            '<div style="display:flex;gap:3px"><select id="skChBank" style="' + INP + ';flex:0 0 74px"><option value="blasts">blasts</option><option value="chordShapes">shapes</option><option value="strikes">strikes</option></select>' +
            '<select id="skChPick" style="' + INP + ';flex:1 1 auto;min-width:0"></select></div>' +
            '<div style="display:flex;gap:3px"><button id="skChAdd" style="' + BTN + ';flex:1 1 auto">add</button><button id="skChAddAll" style="' + BTN + '" title="add every chord of this bank that fits the ensemble">add all</button></div>' +
            '<div style="display:flex;gap:3px"><input id="skChType" placeholder="or type: 40 47 55 62" style="' + INP + ';flex:1 1 auto;min-width:0"><button id="skChTypeAdd" style="' + BTN + '">+</button></div>' +
            '<div style="border-top:1px solid #333;padding-top:3px;display:flex;flex-direction:column;gap:2px">' +
            '<label title="the list in its own order, or shuffled to completion and reshuffled (seeded)">order <select id="skChOrder" style="' + INP + ';width:88px">' + opt(S.ORDERS, c.order) + '</select></label>' +
            '<label title="when the next chord comes: exhaust it (every note sounded once) · stay on it n times · a fresh chord every onset">advance <select id="skChAdv" style="' + INP + ';width:126px">' + opt(S.ADVANCES, c.advance) + '</select></label>' +
            '<label id="skChTimesWrap" title="how many onsets a chord stays for (a range — the machine draws inside it)">times <input id="skChT0" type="number" min="1" max="32" style="' + INP + ';width:34px"> – <input id="skChT1" type="number" min="1" max="32" style="' + INP + ';width:34px"></label>' +
            '<label title="which notes of the chord an onset takes — the drawer\'s own voicing vocabulary">selection <select id="skChSel" style="' + INP + ';width:96px">' + opt(S.SELECTIONS, c.selection) + '</select></label>' +
            '</div></div>';
        box.innerHTML = s;
        const q = id => box.querySelector(id);
        this.fillChordBank();
        q('#skChBank').value = c.bank || 'blasts';
        q('#skChBank').addEventListener('change', e => { c.bank = e.target.value; this.save(); this.fillChordBank(); });
        q('#skChAdd').addEventListener('click', () => this.addChordFromBank(false));
        q('#skChAddAll').addEventListener('click', () => this.addChordFromBank(true));
        q('#skChTypeAdd').addEventListener('click', () => this.addTypedChord());
        q('#skChType').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.addTypedChord(); } });
        q('#skChT0').value = c.timesMin; q('#skChT1').value = c.timesMax;
        q('#skChTimesWrap').style.display = c.advance === 'times' ? '' : 'none';
        ['skChOrder,order', 'skChAdv,advance', 'skChSel,selection'].forEach(pair => {
            const [id, key] = pair.split(',');
            q('#' + id).addEventListener('change', e => { c[key] = e.target.value; this.chordDirty(); this.save(); this.render(); });
        });
        ['skChT0,timesMin', 'skChT1,timesMax'].forEach(pair => {
            const [id, key] = pair.split(',');
            q('#' + id).addEventListener('change', e => { c[key] = clamp(+e.target.value || 1, 1, 32); this.chordDirty(); this.save(); this.render(); });
        });
        box.querySelectorAll('.skChDel').forEach(x => x.addEventListener('click', () => { c.list.splice(+x.dataset.i, 1); this.chordDirty(); this.save(); this.render(); }));
        box.querySelectorAll('.skChUp').forEach(x => x.addEventListener('click', () => { const i = +x.dataset.i; if (i > 0) { const t = c.list[i - 1]; c.list[i - 1] = c.list[i]; c.list[i] = t; this.chordDirty(); this.save(); this.render(); } }));
    },
    chordBanks() {
        if (this._chBanks) return Promise.resolve(this._chBanks);
        return fetch('/bank/harmonies.json', { cache: 'no-store' }).then(r => r.json()).then(j => { this._chBanks = (j && j.banks) || {}; return this._chBanks; }).catch(() => ({}));
    },
    fillChordBank() {
        const sel = this.el.querySelector('#skChPick'); if (!sel) return;
        const bank = (this.el.querySelector('#skChBank') || {}).value || 'blasts';
        this.chordBanks().then(banks => {
            let items = ((banks[bank] || {}).entries) || [];
            if (bank === 'strikes' && !items.length && this.db && this.db.strikes) {
                items = Object.values(this.db.strikes).map(s => ({ id: s.id, name: '#' + s.index + ' (' + s.notes.length + ')', pitches: [...new Set(s.notes.map(n => n.midi))].sort((a, b) => a - b) }));
            }
            this._chBankItems = items;
            sel.innerHTML = items.map((x, i) => '<option value="' + i + '">' + esc((x.name || x.id) + ' · ' + x.pitches.length) + '</option>').join('') || '<option value="">(empty)</option>';
        });
    },
    addChordFromBank(all) {
        const c = this.ch(), items = this._chBankItems || [];
        const sel = this.el.querySelector('#skChPick');
        const add = x => { if (x && x.pitches && x.pitches.length && !c.list.some(y => y.id === x.id)) c.list.push({ id: x.id, name: x.name || x.id, pitches: x.pitches.slice() }); };
        if (all) items.forEach(add); else add(items[+sel.value]);
        this.chordDirty(); this.save(); this.render();
        this.setStatus(c.list.length + ' chords in the list');
    },
    addTypedChord() {
        const c = this.ch(), box = this.el.querySelector('#skChType');
        const ps = (box.value || '').split(/[^0-9]+/).filter(x => x !== '').map(x => +x).filter(x => x >= 0 && x <= 127);
        if (!ps.length) { this.setStatus('type MIDI numbers, e.g. 40 47 55 62', true); return; }
        const id = 'typed-' + (c.list.filter(x => /^typed-/.test(x.id)).length + 1);
        c.list.push({ id, name: ps.map(nm).join(' '), pitches: [...new Set(ps)].sort((a, b) => a - b) });
        box.value = ''; this.chordDirty(); this.save(); this.render();
    },

    // the players column, where the orchestration rows are
    renderChordPlayers() {
        const box = this.el.querySelector('#skOrch'), c = this.ch(), T = TRK(), S = SC();
        const res = this.chordSeq(), sum = res ? res.summary : null;
        const lanes = c.players || T.map((t, i) => i).filter(i => T[i].instKey !== 'piano');
        let s = '<div style="padding:3px 6px;border-bottom:1px solid #333;color:#e8cf9a">PLAYERS</div><div style="padding:2px 6px;overflow:auto;flex:1 1 auto">';
        T.forEach((t, lane) => {
            const inst = this.instOf(lane); if (!inst) return;
            const on = lanes.indexOf(lane) >= 0, col = INST_COL[t.instKey] || '#999';
            const techs = inst.techniques || [];
            const cur = (c.tech && c.tech[lane]) || this.defaultTech(lane) || (techs[0] || {}).key;
            const n = sum && sum.perPlayer ? (sum.perPlayer[lane] || 0) : 0;
            s += '<div class="skChP" data-lane="' + lane + '" style="display:flex;gap:4px;align-items:center;padding:1px 0">' +
                '<input type="checkbox" class="skChPOn" data-lane="' + lane + '"' + (on ? ' checked' : '') + ' style="margin:0">' +
                '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + col + '"></span>' +
                '<span style="flex:0 0 34px;color:' + col + '">' + esc(t.short) + '</span>' +
                '<select class="skChPT" data-lane="' + lane + '" style="' + INP + ';flex:1 1 auto;min-width:0">' +
                techs.map(x => '<option value="' + x.key + '"' + (x.key === cur ? ' selected' : '') + '>' + esc(x.label || x.key) + '</option>').join('') + '</select>' +
                '<span style="flex:0 0 30px;text-align:right;color:#777">' + n + '</span></div>';
        });
        s += '</div>';
        s += '<div style="padding:3px 6px;border-top:1px solid #333;display:flex;flex-direction:column;gap:3px">' +
            '<label title="how many players an onset takes — the machine draws inside this range and lowers it only when too few are free">players / onset <input id="skChC0" type="number" min="1" max="7" style="' + INP + ';width:34px"> – <input id="skChC1" type="number" min="1" max="7" style="' + INP + ';width:34px"></label>' +
            '<label title="PLAN 1l: a player is free this long after its last sound ENDS (not after its attack) — a guarantee, checked against the real onsets; the rest never applies inside one gesture">rest after the end &ge; <input id="skChMin" type="number" min="0" step="10" style="' + INP + ';width:52px"> ms</label>' +
            '<label title="which free players are picked when more are free than needed: round robin = the longest idle first; free = a seeded draw leaning toward whoever has waited longest">deal <select id="skChDeal" style="' + INP + ';width:96px">' +
            S.DEALERS.map(([k, l]) => '<option value="' + k + '"' + (k === c.dealer ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>' +
            '<label title="the same seed always gives the same sequence">seed <input id="skChSeed" type="number" min="1" style="' + INP + ';width:56px"></label>' +
            '<div id="skChRead" style="color:#9a9;white-space:normal"></div></div>';
        box.innerHTML = s;
        const q = id => box.querySelector(id);
        q('#skChC0').value = c.countMin; q('#skChC1').value = c.countMax; q('#skChMin').value = c.reattackMs; q('#skChSeed').value = c.seed;
        const rd = q('#skChRead');
        if (rd && res) {
            rd.innerHTML = esc(S.describe(res)) + (res.warnings.length ? '<div style="color:#e88">' + esc(res.warnings[0]) + '</div>' : '');
            const t = S.tightest(res.events);
            if (t.ms != null) rd.innerHTML += '<div style="color:#777">tightest ' + Math.round(t.ms) + ' ms</div>';
        }
        box.querySelectorAll('.skChPOn').forEach(x => x.addEventListener('change', () => {
            const lane = +x.dataset.lane, cur = c.players || T.map((t, i) => i).filter(i => T[i].instKey !== 'piano');
            const next = x.checked ? [...new Set(cur.concat(lane))].sort((a, b) => a - b) : cur.filter(l => l !== lane);
            c.players = next; this.chordDirty(); this.save(); this.render();
        }));
        box.querySelectorAll('.skChPT').forEach(x => x.addEventListener('change', () => {
            if (!c.tech) c.tech = {};
            c.tech[+x.dataset.lane] = x.value; this.chordDirty(); this.save(); this.render();
        }));
        [['skChC0', 'countMin', 1, 7], ['skChC1', 'countMax', 1, 7], ['skChMin', 'reattackMs', 0, 5000], ['skChSeed', 'seed', 1, 1e9]].forEach(([id, key, lo, hi]) => {
            q('#' + id).addEventListener('change', e => { c[key] = clamp(+e.target.value || lo, lo, hi); this.chordDirty(); this.save(); this.render(); });
        });
        q('#skChDeal').addEventListener('change', e => { c.dealer = e.target.value; this.chordDirty(); this.save(); this.render(); });
    },

    // the keyboard: the chord in play, the selected onset's notes ringed, the sounding notes as dots in the players' colours
    renderChordKeyboard() {
        const svg = this.el.querySelector('#skKb'), R = this.range(), h = this.rh();
        const rows = R.hi - R.lo + 1, H = rows * h + 4;
        svg.setAttribute('height', H); svg.style.height = H + 'px';
        const res = this.chordSeq(), c = this.ch();
        const ev = res && res.events[clamp(c.sel || 0, 0, Math.max(0, res.events.length - 1))];
        const chord = ev && c.list.find(x => x.id === ev.chordId);
        const inChord = new Set((chord ? chord.pitches : []).map(p => p));
        const taken = new Set(ev ? ev.notes.map(n => n.pitch) : []);
        let s = '';
        for (let m = R.hi; m >= R.lo; m--) {
            const y = this.keyY(m), black = BLACK_(m);
            const lit = inChord.has(m);
            s += '<rect class="skChKey" data-m="' + m + '" x="44" y="' + (y + 0.5) + '" width="' + (black ? 60 : 100) + '" height="' + (h - 1) + '" fill="' + (lit ? '#8a7a4a' : (black ? '#2a2a30' : '#d8d3c8')) + '" stroke="#111" stroke-width="0.4" opacity="' + (lit ? 1 : 0.5) + '"><title>' + nm(m) + (lit ? ' — in the chord' : '') + '</title></rect>';
            if (taken.has(m)) s += '<rect x="43" y="' + (y - 0.5) + '" width="102" height="' + (h + 1) + '" fill="none" stroke="#e8cf9a" stroke-width="1.4"/>';
            if (m % 12 === 0) s += '<text x="2" y="' + (y + h * 0.8) + '" font-size="' + Math.max(8, h) + '" fill="#777">C' + (m / 12 - 1) + '</text>';
        }
        // the sounding notes of the selected onset, at their folded pitch, in the player's colour
        if (ev) ev.notes.forEach((n, k) => {
            const y = this.keyY(clamp(n.midi, R.lo, R.hi)) + h / 2, col = INST_COL[(TRK()[n.lane] || {}).instKey] || '#999';
            s += '<circle class="skChDot" data-lane="' + n.lane + '" cx="' + (122 + (k % 2) * 9) + '" cy="' + y + '" r="' + Math.max(2.5, h * 0.42) + '" fill="' + col + '" stroke="#111" stroke-width="0.5"><title>' + esc(n.label + ' ' + nm(n.midi) + (n.fold ? ' (folded ' + n.fold + ' oct)' : '') + (n.standIn ? ' — stand-in' : '')) + '</title></circle>';
        });
        svg.innerHTML = s;
    },

    // the rhythm strip: the drawer's own axis, a COLUMN of dots per onset (one per player), the selected column lit
    renderChordRhythm() {
        const wrap = this.el.querySelector('#skRhyWrap'), svg = this.el.querySelector('#skRhy');
        wrap.style.flex = '0 0 ' + clamp(this.cfg.rhythmW || 480, 320, 1400) + 'px';
        const R = this.range(), h = this.rh(), rows = R.hi - R.lo + 1, H = rows * h + 4;
        const W = Math.max(300, wrap.clientWidth - 4);
        svg.setAttribute('height', H); svg.style.height = H + 'px'; svg.setAttribute('width', W);
        const res = this.chordSeq(), c = this.ch();
        if (!res || !res.events.length) { svg.innerHTML = '<text x="12" y="20" font-size="11" fill="#777">' + esc((res && res.summary && res.summary.info) || 'no onsets') + '</text>'; return; }
        const pat = res.events.map(e => e.t), spanMs = Math.max(1, Math.max.apply(null, pat)), pad = 14;
        // §347: chords mode reserved only 10 px on the left — but `#skRhyCtl`, the rhythm control panel, is absolutely
        // positioned over the strip and STAYS IN THE DOM when the mode changes. With the run block open it is ~225 px wide,
        // so in chords mode it sat on top of the first onsets: unclickable, and the earliest one hidden entirely. Reserve
        // whatever the panel actually measures, exactly as notes mode now does.
        const ctlEl = wrap.querySelector('#skRhyCtl');
        const ctlW = (ctlEl && ctlEl.offsetParent !== null) ? Math.round(ctlEl.offsetWidth || 0) + 10 : 10;
        const pxPerMs = Math.max(0.001, (W - 2 * pad - ctlW - 10) / Math.max(spanMs, 50));
        const X = ms => pad + ctlW + ms * pxPerMs;
        const marked = new Set(c.span ? this.chordSpanIdx() : []);
        let s = '';
        const step = spanMs > 2000 ? 500 : spanMs > 600 ? 100 : 50;
        for (let t = 0; t <= spanMs + 1; t += step) s += '<line x1="' + X(t) + '" y1="0" x2="' + X(t) + '" y2="' + H + '" stroke="#333"/><text x="' + (X(t) + 2) + '" y="10" font-size="9" fill="#666">' + Math.round(t) + '</text>';
        for (let m = R.hi; m >= R.lo; m -= 12) s += '<line x1="' + pad + '" y1="' + (this.keyY(m) + h) + '" x2="' + W + '" y2="' + (this.keyY(m) + h) + '" stroke="#2c2c34"/>';
        res.events.forEach(e => {
            const x = X(e.t), sel = (c.sel || 0) === e.i;
            if (marked.has(e.i)) s += '<rect x="' + (x - 5) + '" y="0" width="10" height="' + H + '" fill="#C9A05A" opacity="0.16"/>';
            if (sel) s += '<rect x="' + (x - 6) + '" y="0" width="12" height="' + H + '" fill="none" stroke="#e8cf9a" stroke-width="1" opacity="0.8"/>';
            e.notes.forEach(n => {
                const y = this.keyY(clamp(n.midi, R.lo, R.hi)) + h / 2, col = INST_COL[(TRK()[n.lane] || {}).instKey] || '#999';
                s += '<circle cx="' + x + '" cy="' + y + '" r="' + Math.max(2.2, h * 0.36) + '" fill="' + col + '" stroke="' + (e.manual ? '#fff' : '#111') + '" stroke-width="' + (e.manual ? 1.2 : 0.5) + '"/>';
            });
            if (e.flagged) s += '<text x="' + (x - 3) + '" y="' + (H - 2) + '" font-size="10" fill="#e88">&#10007;</text>';
            else if (e.lowered) s += '<text x="' + (x - 2) + '" y="' + (H - 2) + '" font-size="9" fill="#c9a05a">&#8595;</text>';
            else if (e.short) s += '<text x="' + (x - 2) + '" y="' + (H - 2) + '" font-size="9" fill="#777">&#183;</text>';
            s += '<rect class="skChHit" data-i="' + e.i + '" x="' + (x - 6) + '" y="0" width="12" height="' + H + '" fill="transparent" style="cursor:pointer"><title>' +
                esc('onset ' + (e.i + 1) + ' · ' + Math.round(e.t) + ' ms · ' + (e.chordName || e.chordId || '') + ' · ' + e.notes.map(n => n.label + ' ' + nm(n.midi)).join(' · ') +
                    (e.manual ? ' · by hand' : '') + (e.flagged ? ' · ✗ the rest could not hold' : e.lowered ? ' · lowered' : e.short ? ' · the chord ran out' : '')) + '</title></rect>';
        });
        svg.innerHTML = s;
        this._chXs = res.events.map(e => ({ i: e.i, x: X(e.t) }));   // the drag reads the nearest onset from the pointer's x (a gap between the hit rects must not stop it)
        svg.querySelectorAll('.skChHit').forEach(r => {
            r.addEventListener('mousedown', ev => { ev.preventDefault(); this.chordSpanStart(+r.dataset.i, ev); });
            r.addEventListener('click', ev => { ev.stopPropagation(); this.onOnsetClick(+r.dataset.i, ev); });
        });
    },

    // the dotted lines, key → player, for the selected onset (the drawer's own picture)
    renderChordLines() {
        const svg = this.el.querySelector('#skLines'); if (!svg) return;
        const res = this.chordSeq(), c = this.ch();
        const ev = res && res.events[clamp(c.sel || 0, 0, Math.max(0, res.events.length - 1))];
        if (!ev) { svg.innerHTML = ''; return; }
        const bodyR = this.body.getBoundingClientRect();
        svg.setAttribute('width', this.body.scrollWidth); svg.setAttribute('height', this.body.scrollHeight);
        const kb = this.el.querySelector('#skKb').getBoundingClientRect();
        let s = '';
        ev.notes.forEach(n => {
            const row = this.el.querySelector('.skChP[data-lane="' + n.lane + '"]');
            if (!row) return;
            const rr = row.getBoundingClientRect();
            const y1 = kb.top - bodyR.top + this.keyY(clamp(n.midi, this.range().lo, this.range().hi)) + this.rh() / 2 + this.body.scrollTop;
            const x1 = kb.left - bodyR.left + 130 + this.body.scrollLeft;
            const y2 = rr.top - bodyR.top + rr.height / 2 + this.body.scrollTop, x2 = rr.left - bodyR.left + this.body.scrollLeft;
            s += '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + (INST_COL[(TRK()[n.lane] || {}).instKey] || '#999') + '" stroke-width="1" stroke-dasharray="3 3" fill="none" opacity="0.8"/>';
        });
        svg.innerHTML = s;
    },
});

// ---------------------------------------------------------------- step 3: the manual onset, a card at the onset
Object.assign(D, {
    onOnsetClick(i, ev) {
        const c = this.ch();
        if (this._chDragged) { this._chDragged = false; return; }        // a drag marked a span: not a click
        if (ev && ev.shiftKey) { c.span = { from: c.sel || 0, to: i }; this.save(); this.render(); return; }
        c.sel = i; this.save(); this.render(); this.openOnsetCard(i, ev);
    },
    closeOnsetCard() { const b = document.getElementById('skOnsetCard'); if (b) b.remove(); if (this._onsetKey) { document.removeEventListener('keydown', this._onsetKey, true); this._onsetKey = null; } },
    openOnsetCard(i, ev) {
        const res = this.chordSeq(); if (!res || !res.events[i]) return;
        this.closeOnsetCard();
        const c = this.ch(), e = res.events[i], T = TRK(), players = this.chordPlayers();
        const m = c.manual[i] || c.manual[String(i)] || null;
        const box = document.createElement('div');
        box.id = 'skOnsetCard'; box.tabIndex = 0;
        box.style.cssText = 'position:fixed;z-index:9600;width:280px;background:#26262e;color:#ddd;border:1px solid #C9A05A;border-radius:6px;font:11px/1.45 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5)';
        const x0 = ev && ev.clientX != null ? ev.clientX : 300, y0 = ev && ev.clientY != null ? ev.clientY : 300;
        box.style.left = Math.max(4, Math.min(window.innerWidth - 288, x0 + 12)) + 'px';
        box.style.top = Math.max(4, Math.min(window.innerHeight - 300, y0 - 60)) + 'px';
        box.innerHTML =
            '<div id="skOcDrag" style="display:flex;justify-content:space-between;align-items:center;padding:4px 7px;background:#2f2f3a;border-bottom:1px solid #444;cursor:move;border-radius:6px 6px 0 0">' +
            '<b style="color:#e8cf9a">onset ' + (i + 1) + '</b><span style="color:#9a9">' + Math.round(e.t) + ' ms' + (m ? ' · by hand' : '') + '</span>' +
            '<span id="skOcX" style="cursor:pointer;color:#aaa;font-size:13px">&#10005;</span></div>' +
            '<div style="padding:6px 7px;display:flex;flex-direction:column;gap:5px">' +
            '<label>players <input id="skOcN" type="number" min="1" max="7" value="' + (m ? (m.count || e.count || c.countMin) : (e.count || c.countMin)) + '" style="' + INP + ';width:38px"></label>' +
            '<label>chord <select id="skOcC" style="' + INP + ';width:100%">' +
            '<option value="">— the machine\'s (' + esc(e.chordName || e.chordId || '') + ') —</option>' +
            c.list.map(x => '<option value="' + esc(x.id) + '"' + (m && m.chordId === x.id ? ' selected' : '') + '>' + esc(x.name || x.id) + '</option>').join('') + '</select></label>' +
            '<label>notes <input id="skOcP" placeholder="the machine chooses" value="' + esc(m && m.pitches ? m.pitches.join(' ') : '') + '" style="' + INP + ';width:100%" title="MIDI numbers; empty = the machine picks them from the chord by the selection"></label>' +
            '<div style="color:#9a9">players</div><div id="skOcPl" style="display:flex;flex-wrap:wrap;gap:3px 8px">' +
            players.map(p => '<label style="white-space:nowrap"><input type="checkbox" class="skOcPl" data-lane="' + p.lane + '"' + (m && m.players && m.players.indexOf(p.lane) >= 0 ? ' checked' : '') + ' style="margin:0"> <span style="color:' + (INST_COL[p.instKey] || '#999') + '">' + esc(p.label) + '</span></label>').join('') + '</div>' +
            '<div style="color:#777">' + esc(e.notes.map(n => n.label + ' ' + nm(n.midi)).join(' · ') || 'silent') + (e.flagged ? ' · ✗' : e.lowered ? ' · lowered' : e.short ? ' · the chord ran out' : '') + '</div>' +
            '<div style="display:flex;gap:4px;margin-top:2px">' +
            '<button id="skOcOk" style="' + BTN + ';color:#e8cf9a" title="ENTER">set by hand</button>' +
            '<button id="skOcAuto" style="' + BTN + '" title="hand this onset back to the machine">&#10005; automatic</button>' +
            '<button id="skOcHear" style="' + BTN + '">&#9834;</button></div>' +
            '<div style="color:#666">a hand onset is kept through a re-generate and a new seed; the rest is dealt around it; it is flagged, never lowered</div>' +
            '</div>';
        document.body.appendChild(box);
        ['mousedown', 'click', 'dblclick', 'mouseup'].forEach(t => box.addEventListener(t, x => x.stopPropagation()));
        const q = id => box.querySelector(id);
        q('#skOcX').addEventListener('click', () => this.closeOnsetCard());
        q('#skOcOk').addEventListener('click', () => this.setOnsetByHand(i, box));
        q('#skOcAuto').addEventListener('click', () => { delete c.manual[i]; delete c.manual[String(i)]; this.chordDirty(); this.save(); this.closeOnsetCard(); this.render(); this.setStatus('onset ' + (i + 1) + ' is the machine\'s again'); });
        q('#skOcHear').addEventListener('click', () => this.hearOnset(i));
        this._onsetKey = k => {
            if (k.key === 'Escape') { k.preventDefault(); k.stopPropagation(); this.closeOnsetCard(); }
            else if (k.key === 'Enter') { k.preventDefault(); k.stopPropagation(); this.setOnsetByHand(i, box); }
        };
        document.addEventListener('keydown', this._onsetKey, true);
        let sx = 0, sy = 0, bx = 0, by = 0, on = false, drag = q('#skOcDrag');
        drag.addEventListener('mousedown', d => { if (d.target.id === 'skOcX') return; on = true; sx = d.clientX; sy = d.clientY; const r = box.getBoundingClientRect(); bx = r.left; by = r.top; d.preventDefault(); });
        document.addEventListener('mousemove', d => { if (!on) return; box.style.left = Math.max(0, bx + d.clientX - sx) + 'px'; box.style.top = Math.max(0, by + d.clientY - sy) + 'px'; });
        // §377: the same stuck card §348 fixed in the sound card — line ~445 stops `mouseup` on the box, and a drag by the head always
        // ends over the box, so `on` was never cleared. CAPTURE runs before the target and cannot be stopped.
        document.addEventListener('mouseup', () => { on = false; }, true);
        box.focus();
    },
    setOnsetByHand(i, box) {
        const c = this.ch();
        const n = clamp(+box.querySelector('#skOcN').value || 1, 1, 7);
        const chordId = box.querySelector('#skOcC').value || null;
        const ps = (box.querySelector('#skOcP').value || '').split(/[^0-9]+/).filter(x => x !== '').map(x => +x).filter(x => x >= 0 && x <= 127);
        const lanes = Array.from(box.querySelectorAll('.skOcPl')).filter(x => x.checked).map(x => +x.dataset.lane);
        const m = { count: n };
        if (chordId) m.chordId = chordId;
        if (ps.length) m.pitches = [...new Set(ps)].sort((a, b) => a - b);
        if (lanes.length) m.players = lanes;
        c.manual[i] = m;
        this.chordDirty(); this.save(); this.closeOnsetCard(); this.render();
        const e = (this.chordSeq() || { events: [] }).events[i];
        this.setStatus('onset ' + (i + 1) + ' by hand: ' + (e ? e.notes.map(x => x.label + ' ' + nm(x.midi)).join(' · ') : '') + (e && e.flagged ? ' — ✗ it breaks the ' + c.reattackMs + ' ms rest (kept as you set it)' : ''), !!(e && e.flagged));
    },
    async hearOnset(i) {
        const res = this.chordSeq(), e = res && res.events[i]; if (!e) return;
        const em = E_(); if (!em) return;
        em.panic();
        if (!await em.ensureMidi()) { this.setStatus(em._midiError || 'MIDI unavailable', true); return; }
        e.notes.forEach(n => {
            const r = em.routeFor(n.lane, n.tech); if (!r) return;
            try {
                if (r.cc0 != null) r.out.send([0xB0 | r.ch, 0, r.cc0]);
                r.out.send([0xB0 | r.ch, 7, 127]);
                r.out.send([0x90 | r.ch, n.midi, 110]);
                setTimeout(() => { try { r.out.send([0x80 | r.ch, n.midi, 0]); } catch (x) { } }, 400);
            } catch (x) { }
        });
        this.setStatus('onset ' + (i + 1) + ': ' + e.notes.map(n => n.label + ' ' + nm(n.midi)).join(' · '));
    },

    // ------------------------------------------------------------ step 4: the span, marked by a drag or by click / shift-click
    chordSpanStart(i, ev) {
        const c = this.ch();
        this._chDragged = false;
        const from = i;
        const move = m => {
            const hit = this.onsetAtX(m.clientX);
            if (hit == null || hit === from) return;
            this._chDragged = true;
            c.span = { from, to: hit };
            this.renderChordRhythm();
            const el2 = this.el.querySelector('#skChSpan');
            if (el2) el2.textContent = this.chordSpanIdx().length + ' of ' + (this.chordSeq() || { events: [] }).events.length + ' onsets marked';
        };
        const up = () => {
            window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
            if (this._chDragged) { this.save(); this.render(); this.setStatus(this.chordSpanIdx().length + ' onsets marked — the insert buttons write only these; a click on empty space clears it'); }
        };
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    },
    onsetAtX(clientX) {
        const svg = this.el && this.el.querySelector('#skRhy'); if (!svg || !this._chXs || !this._chXs.length) return null;
        const x = clientX - svg.getBoundingClientRect().left;
        let best = this._chXs[0];
        this._chXs.forEach(p => { if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p; });
        return best.i;
    },
    clearChordSpan() { const c = this.ch(); if (!c.span) return; c.span = null; this.save(); this.render(); this.setStatus('the whole sequence again'); },

    // ------------------------------------------------------------ step 5: the take carries the result and the recipe
    chordFreeze() {
        const res = this.chordSeq(); if (!res) return null;
        const c = this.ch(), idx = new Set(this.chordSpanIdx());
        return { events: res.events.filter(e => idx.has(e.i)), summary: res.summary, warnings: res.warnings || [],
                 part: !!c.span, of: c.span ? { from: Math.min(c.span.from, c.span.to), to: Math.max(c.span.from, c.span.to), whole: res.events.length } : null };
    },
    // a take loaded "as it was": the stored sequence becomes the drawer's, and stands until a dial is touched (chordDirty lets it go)
    chordThaw(frozen) {
        if (!frozen || !frozen.events || !frozen.events.length) return false;
        const c = this.ch();
        this._chSeq = null;
        c.frozen = { events: frozen.events, summary: frozen.summary, warnings: frozen.warnings || [], part: !!frozen.part, of: frozen.of || null };
        c.span = null;                       // a part take IS its own sequence now; nothing of it is masked
        c.sel = 0;
        return true;
    },
});

// the drawer's own state / applyState, wrapped: a chords take carries the RESULT beside the RECIPE (his CN-47), and loading offers
// "as it was" (the stored sequence, nothing re-dealt) or "the settings" (the dials filled, generated again)
(function wrapTakes() {
    const state0 = D.state, apply0 = D.applyState;
    D.state = function () {
        const st = state0.call(this);
        if (this.isChords && this.isChords()) { const f = this.chordFreeze(); if (f) st.chResult = f; }
        return st;
    };
    D.applyState = function (st) {
        const asIs = !!(st && st.chResult) && !(this.el && this.el.querySelector('#skChAsIs') && !this.el.querySelector('#skChAsIs').checked);
        apply0.call(this, st);
        if (st && st.cfg && st.cfg.mode === 'chords') {
            this.cfg.mode = 'chords';
            this.chordDirty();
            const note = (asIs && this.chordThaw(st.chResult))
                ? 'as it was — ' + st.chResult.events.length + ' onsets, nothing re-dealt' + (st.chResult.part ? ' (the part ' + (st.chResult.of.from + 1) + '–' + (st.chResult.of.to + 1) + ' of ' + st.chResult.of.whole + ')' : '')
                : 'the settings — the dials are filled, the deal is fresh';
            this.paintMode(); this.render();
            const msg = this.el.querySelector('#skStatus').textContent;
            setTimeout(() => this.setStatus(msg + ' · ' + note), 0);   // the drawer's own take message lands first; this says which way it came back
        } else if (this.cfg.mode === 'chords') { this.paintMode(); this.render(); }
    };
}());

function BLACK_(m) { return [1, 3, 6, 8, 10].indexOf(((m % 12) + 12) % 12) >= 0; }

// the drawer builds itself as it loads, before this mixin is assigned, so the controls are injected here too (the hook in build()
// covers the other order); harmless twice — injectChordUI returns at once when they are already there
if (D.el) D.injectChordUI();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.injectChordUI(); });
else setTimeout(() => { if (D.el) D.injectChordUI(); }, 0);
}(typeof self !== 'undefined' ? self : this));
