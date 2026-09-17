// fill_ui.js — FILL MODE IN THE STRIKES DRAWER (PLAN 1n step 3; CN-54 · CN-55; RUNNING_LOG §295).
//
// His workflow, in his own words: *"the typical application would be to generate a strikes pattern like an accel but not necessarily and
// then overlay crescendos on that pattern, so for each attack in an instrument the long will start simultaneously in another
// instrument."* So this is a SECOND PASS over a pattern that already exists — never a generator of rhythm.
//
// A mixin on the drawer, exactly as 1k's chords mode is (strike_chords_ui.js), so the screen, the foot, the takes and the insert idiom
// are inherited rather than rebuilt. The one thing chosen rather than inherited: **the pattern is read from the OPEN SCORE, not from
// `bank/scattered_strikes.json`** — a strike group he has already dragged or stretched must fill where it actually sits.
//
// The engine is `fill.js` (which player, when it starts and ends, which kind) and `fill_pitch.js` (the pitch). Nothing musical is
// decided here; this is the screen and the writing.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[fill_ui] the strikes drawer is not loaded'); return; }

const FL = () => root.Fill;
const FPI = () => root.FillPitch;
const CR = () => root.Cresc;
const SP = () => root.Spacing;
const C_ = () => (typeof Composer !== 'undefined') ? Composer : (root.Composer || null);
const E_ = () => (typeof MorphEmit !== 'undefined') ? MorphEmit : (root.MorphEmit || null);
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : (root.TRACKS || []);
const MP = () => (typeof MorphPanel !== 'undefined') ? MorphPanel : (root.MorphPanel || null);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const COL = { flute: '#ffd479', bass_clarinet: '#e08a8a', piano: '#e8cf9a', violin1: '#8ea9c9', violin2: '#69b7c9', viola: '#b58ec9', cello: '#7ec9a8' };

const FL_DEFAULTS = {
    group: '',                                   // the strike group in the open score
    anchor: 'launch', cutAfter: 1,
    kind: 'cresc', kindRule: 'one', kindB: 'trill', kindMix: 0.35, roomThresholdS: 2.5,
    floorCresc: 0.3, floorTrill: 0.5,
    startRestMs: 150, keepInside: false, seed: 1,
    family: 'accent', order: 'turn', pseed: 1,   // the pitch strategy
    src: '', root: 'F2', intervalSt: 1, direction: 'up', bandSt: 24,
    dynLo: 0, dynHi: 10, secco: true,            // what a crescendo is written with (1l/1m's own defaults)
};

Object.assign(D, {

    // ---------------------------------------------------------------- state
    fl() {
        if (!this.cfg.fl) this.cfg.fl = JSON.parse(JSON.stringify(FL_DEFAULTS));
        else for (const k in FL_DEFAULTS) if (this.cfg.fl[k] === undefined) this.cfg.fl[k] = JSON.parse(JSON.stringify(FL_DEFAULTS[k]));
        return this.cfg.fl;
    },
    isFill() { return this.cfg.mode === 'fill'; },
    fillDirty() { this._fill = null; },

    // the strike groups PRESENT IN THE OPEN SCORE, newest last, with their real time
    fillGroups() {
        const C = C_(); if (!C) return [];
        const g = {};
        C.objects.forEach(o => {
            if (!o.groupId || o.type !== 'waveCurve' || o.sonifyNote == null) return;
            if (!/^grp-strike-/.test(o.groupId)) return;
            const e = g[o.groupId] || (g[o.groupId] = { id: o.groupId, t: Infinity, n: 0, lanes: {} });
            e.t = Math.min(e.t, +o.startSeconds); e.n++; e.lanes[o.layer] = 1;
        });
        return Object.values(g).sort((a, b) => a.t - b.t);
    },
    fillGroup() {
        const f = this.fl(), all = this.fillGroups();
        return all.find(x => x.id === f.group) || all[all.length - 1] || null;
    },
    // the name this pattern's fill is written under — one place, so the deal can EXCLUDE the fill already in the score and the insert
    // can replace it. Without this, generating again sees its own last pass occupying every player (found on the walk, §300).
    fillGroupId(g) {
        const gr = g || this.fillGroup(); if (!gr) return '';
        return 'grp-fill-' + gr.id.replace('grp-strike-', '') + '-' + Math.floor(gr.t * 10);
    },

    // each player's ordinary voice range — the same source 1k's realize uses
    fillRanges() {
        const C = C_(), T = TRK(), R = {};
        T.forEach((t, i) => {
            const inst = C && C.trackInstrument(i); if (!inst) return;
            const tech = (C.ordinaryTech && C.ordinaryTech(i)) || (inst.techniques || [])[0] || {};
            R[i] = [tech.rangeLow != null ? tech.rangeLow : inst.rangeLow, tech.rangeHigh != null ? tech.rangeHigh : inst.rangeHigh];
        });
        return R;
    },
    // everything the score already sounds, in spacing.js's shape — the pattern's own attacks INCLUDED
    fillEvents(exceptGroup) {
        const C = C_(), S = SP(); if (!C || !S) return [];
        const on = C.objects.filter(o => {
            if (!o || o.layer == null || o.layer >= (typeof META_LAYER !== 'undefined' ? META_LAYER : 7)) return false;
            if (exceptGroup && o.groupId === exceptGroup && !o.pinned) return false;   // its own last pass is ignored, but a PINNED long still occupies its player (found on the walk, §300)
            if (o.type === 'zone') return o.midiModel === 'trill' || o.midiModel === 'beating';
            if (o.type !== 'waveCurve' || o.sonifyNote == null) return false;
            if (C.mutedByLive && C.mutedByLive(o)) return false;
            return true;
        });
        return S.eventsOf(on);
    },

    fillOpts() {
        const f = this.fl();
        return {
            anchor: f.anchor, cutAfter: Math.max(1, +f.cutAfter || 1),
            kind: f.kind, kindRule: f.kindRule, kindB: f.kindB, kindMix: +f.kindMix, roomThresholdS: +f.roomThresholdS,
            floors: { cresc: +f.floorCresc, trill: +f.floorTrill, tone: +f.floorCresc },
            startRestMs: +f.startRestMs, keepInside: !!f.keepInside, seed: Math.max(1, +f.seed || 1),
        };
    },
    fillSonority() {
        const f = this.fl(), M = MP();
        if (!f.src || !M || !M.sonorityOf) return null;
        try { return M.sonorityOf(f.src, f.root); } catch (e) { return null; }
    },
    fillPitchOpts() {
        const f = this.fl(), son = this.fillSonority();
        return {
            family: f.family, order: f.order, seed: Math.max(1, +f.pseed || 1),
            notes: son ? son.notes : [], from: son ? son.from : '',
            intervalSt: Math.abs(+f.intervalSt || 1), direction: f.direction, bandSt: Math.max(12, +f.bandSt || 24),
        };
    },

    // ---------------------------------------------------------------- the pass, cached by its settings
    fillRun() {
        const F = FL(), FP = FPI(); if (!F || !FP) return null;
        const g = this.fillGroup(); if (!g) return null;
        const key = JSON.stringify([g.id, this.fillOpts(), this.fillPitchOpts(), (C_() || {}).objects.length]);
        if (this._fill && this._fill.key === key) return this._fill.out;
        const C = C_();
        const attacks = F.attacksOf(C.objects, g.id);
        const events = this.fillEvents(this.fillGroupId(g));   // a re-Generate must not see its own last pass as busy players (§300)
        const players = TRK().map((t, i) => i);
        const dealt = F.deal(attacks, events, players, this.fillOpts());
        const voiced = FP.assign(dealt.longs, attacks, this.fillRanges(), this.fillPitchOpts());
        const out = {
            group: g, attacks, longs: voiced.longs,
            aborts: dealt.aborts.concat(voiced.aborts),
            summary: F.summarize({ longs: voiced.longs, aborts: dealt.aborts.concat(voiced.aborts) }, players),
        };
        this._fill = { key, out };
        return out;
    },

    // ---------------------------------------------------------------- the screen
    renderFill() {
        const body = this.el.querySelector('#skBody');
        const f = this.fl(), groups = this.fillGroups(), run = this.fillRun();
        const T = TRK(), F = FL(), FP = FPI();
        const sel = (id, val, items, title, w) => '<select data-fl="' + id + '" title="' + esc(title || '') + '" style="' + INP + (w ? ';width:' + w + 'px' : '') + '">'
            + items.map(it => '<option value="' + esc(it[0]) + '"' + (String(val) === String(it[0]) ? ' selected' : '') + '>' + esc(it[1]) + '</option>').join('') + '</select>';
        const num = (id, val, title, w, step) => '<input data-fl="' + id + '" type="number" step="' + (step || 1) + '" value="' + val + '" title="' + esc(title || '') + '" style="' + INP + ';width:' + (w || 46) + 'px">';
        const lbl = t => '<span style="color:#8a8">' + t + '</span>';

        const isChain = f.family === 'chain', needsSon = (f.family === 'sonority' || f.family === 'vertical');
        const son = this.fillSonority();
        const rows = [];
        rows.push('<div style="display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;padding:5px 8px;border-bottom:1px solid #333">'
            + lbl('pattern') + sel('group', f.group || (run && run.group.id) || '', groups.map(g => [g.id, g.id.replace('grp-strike-', '#') + ' · ' + g.t.toFixed(2) + ' s · ' + g.n + ' attacks']),
                'the strike groups in the OPEN score — read from the score, so a group you have dragged fills where it actually sits', 250)
            + lbl('anchor') + sel('anchor', f.anchor, [['launch', 'the accent starts it'], ['cut', 'the accent ends it'], ['both', 'accent to accent']],
                'launched: the accent kicks it off and the room ends it · cut: the accent ends it at the END of the accent note, the room decides how early it began · both: it spans two accents', 190)
            + (f.anchor === 'both' ? lbl('cut after') + num('cutAfter', f.cutAfter, 'how many attacks later the cutting accent is', 42) : '')
            + lbl('kind') + sel('kindRule', f.kindRule, [['one', 'one kind'], ['proportion', 'a mix'], ['byRoom', 'by room']], 'one kind for the pass is the default; a mix scatters a proportion of the second kind; by room lets the derived length choose', 90)
            + sel('kind', f.kind, F.KINDS, 'the kind this pass writes', 90)
            + (f.kindRule !== 'one' ? sel('kindB', f.kindB, F.KINDS, 'the second kind', 80) : '')
            + (f.kindRule === 'proportion' ? lbl('share') + num('kindMix', f.kindMix, 'the share that takes the second kind', 46, 0.05) : '')
            + (f.kindRule === 'byRoom' ? lbl('under') + num('roomThresholdS', f.roomThresholdS, 'shorter than this takes the second kind (his own trills stopped at 2.60 s)', 46, 0.1) + lbl('s') : '')
            + '</div>');
        rows.push('<div style="display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;padding:5px 8px;border-bottom:1px solid #333">'
            + lbl('pitch') + sel('family', f.family, FP.FAMILIES, 'where each long takes its pitch from — the pattern, a harmony, a chain of one interval, or the note the sounding chord is missing', 230)
            + (needsSon ? '<button data-fl="pick" style="' + BTN + '" title="the morph panel\'s own harmony menu — the same 163 sonorities the crescendo bar reaches">' + esc(son ? son.from : 'harmony…') + '</button>' : '')
            + (isChain ? lbl('interval') + num('intervalSt', f.intervalSt, 'semitones from the previous long — 1 is his minor second, 7 the fifth', 42)
                + sel('direction', f.direction, FP.DIRECTIONS, 'up · down · alternating', 90)
                + lbl('band') + num('bandSt', f.bandSt, 'the chain is wrapped by octaves inside this many semitones, centred on its start — which is what makes it a spiral rather than a runaway', 46) : '')
            + ((needsSon || f.family === 'patternDeck') ? lbl('order') + sel('order', f.order, [['turn', 'in turn'], ['shuffled', 'shuffled'], ['random', 'random']], '1k\'s deck', 90)
                + lbl('seed') + num('pseed', f.pseed, 'the pitch seed', 42) : '')
            + '<span style="flex:1"></span>'
            + lbl('rest') + num('startRestMs', f.startRestMs, 'the gap a player needs before it may begin a long. The rule is 150 ms; his own trills at 135.78 s went to 49 ms, so lower it when the texture is this dense', 46) + lbl('ms')
            + lbl('floors') + num('floorCresc', f.floorCresc, 'the shortest crescendo', 42, 0.05) + num('floorTrill', f.floorTrill, 'the shortest trill', 42, 0.05) + lbl('s')
            + '<label title="clip the pass to the pattern\'s own span — a cut long may otherwise begin before the first attack"><input type="checkbox" data-fl="keepInside"' + (f.keepInside ? ' checked' : '') + '> inside</label>'
            + lbl('seed') + num('seed', f.seed, 'the selection seed — the same number deals the same pass', 42)
            + '</div>');

        // the preview: one row per player, the attacks as ticks and the longs as bars
        let pv = '<div style="padding:6px 8px;color:#777">choose a pattern and press Generate</div>';
        if (run && run.attacks.length) {
            const t0 = Math.min(run.attacks[0].t, run.longs.reduce((m, x) => Math.min(m, x.t0), Infinity));
            const t1 = Math.max(run.attacks[run.attacks.length - 1].t, run.longs.reduce((m, x) => Math.max(m, x.t1), 0));
            const W = 1000, X = t => Math.max(0, Math.min(W, ((t - t0) / Math.max(0.001, t1 - t0)) * W));
            const nm = m => CR().nm(m);
            pv = '<div style="padding:4px 8px;overflow:auto">'
               + '<div style="color:#9a9;margin-bottom:3px">' + esc(run.summary.text) + '</div>'
               + T.map((t, lane) => {
                    const mine = run.longs.filter(x => x.lane === lane);
                    const hits = run.attacks.filter(a => a.lane === lane);
                    const col = COL[t.instKey] || '#999';
                    return '<div style="position:relative;height:16px;margin:1px 0;background:#141418;border-radius:2px">'
                        + '<span style="position:absolute;left:2px;top:1px;font-size:10px;color:' + col + ';z-index:2">' + esc(t.short) + '</span>'
                        + hits.map(a => '<span title="attack ' + a.t.toFixed(2) + ' s · ' + nm(a.midi) + '" style="position:absolute;left:' + (X(a.t) / W * 100).toFixed(3) + '%;top:0;width:2px;height:16px;background:#C9A05A"></span>').join('')
                        + mine.map(x => '<span title="' + x.kind + ' ' + nm(x.midi) + ' · ' + x.t0.toFixed(2) + ' → ' + x.t1.toFixed(2) + ' s (' + x.len.toFixed(2) + ' s) · ' + esc(x.pitch.source) + '" '
                            + 'style="position:absolute;left:' + (X(x.t0) / W * 100).toFixed(3) + '%;width:' + ((X(x.t1) - X(x.t0)) / W * 100).toFixed(3) + '%;top:4px;height:9px;border-radius:2px;'
                            + 'background:' + (x.kind === 'trill' ? '#F04B00' : '#C2410C') + ';opacity:.75"></span>').join('')
                        + '</div>';
                 }).join('')
               + (run.aborts.length ? '<div style="color:#c88;margin-top:3px">' + run.aborts.length + ' attacks with no long: '
                    + [...new Set(run.aborts.map(x => x.why))].join(', ') + '</div>' : '')
               + '</div>';
        }
        body.innerHTML = '<div style="flex:1 1 auto;min-width:0;overflow:auto">' + rows.join('') + pv + '</div>';

        body.querySelectorAll('[data-fl]').forEach(el => {
            const k = el.dataset.fl;
            if (k === 'pick') { el.addEventListener('click', () => this.fillPickHarmony()); return; }
            el.addEventListener('change', () => {
                const f2 = this.fl();
                f2[k] = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? +el.value : el.value);
                this.fillDirty(); this.save(); this.render();
            });
        });
    },

    // the morph panel's own harmony menu, reused (the crescendo bar's chooser in a drawer)
    async fillPickHarmony() {
        const M = MP(), f = this.fl();
        if (!M || !M.pitchOptionGroups) { this.setStatus('the morph panel is not loaded — open it once so its harmonies are read', true); return; }
        if (!M.pitchSources && M.loadPitchSources) { this.setStatus('reading the harmonies…'); try { await M.loadPitchSources(); } catch (e) { } }
        const groups = M.pitchOptionGroups();
        const old = document.getElementById('flPick'); if (old) old.remove();
        const box = document.createElement('div');
        box.id = 'flPick';
        box.style.cssText = 'position:fixed;z-index:9800;left:50%;top:70px;transform:translateX(-50%);width:540px;background:#26262e;color:#ddd;border:1px solid #C2410C;border-radius:6px;padding:8px;font:12px/1.6 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.55)';
        box.innerHTML = '<div style="color:#e8a06a;margin-bottom:5px"><b>the harmony this fill deals from</b> — the morph panel&#39;s own list</div>'
            + '<select id="flSrc" size="12" style="width:100%;background:#1b1b20;color:#ddd;border:1px solid #444;font-size:12px"></select>'
            + '<div style="display:flex;gap:6px;align-items:center;margin-top:6px">'
            + '<label style="color:#9a9">root <input id="flRoot" value="' + esc(f.root || 'F2') + '" style="width:52px;background:#1b1b20;color:#ddd;border:1px solid #444"></label>'
            + '<button id="flOk" style="margin-left:auto;' + BTN + ';background:#C2410C;color:#fff;border-color:#e07040">take it</button>'
            + '<button id="flCancel" style="' + BTN + '">cancel</button></div>';
        document.body.appendChild(box);
        ['mousedown', 'click', 'dblclick', 'mouseup', 'keydown'].forEach(t => box.addEventListener(t, e => e.stopPropagation()));
        const s = box.querySelector('#flSrc');
        groups.forEach(g => { const og = document.createElement('optgroup'); og.label = g.label; g.items.forEach(it => { const o = document.createElement('option'); o.value = it.value; o.textContent = it.text; if (it.value === f.src) o.selected = true; og.appendChild(o); }); s.appendChild(og); });
        const take = () => { f.src = s.value || ''; f.root = box.querySelector('#flRoot').value || 'F2'; this.fillDirty(); this.save(); box.remove(); this.render(); };
        box.querySelector('#flOk').addEventListener('click', take);
        s.addEventListener('dblclick', take);
        box.querySelector('#flCancel').addEventListener('click', () => box.remove());
        box.addEventListener('keydown', e => { if (e.key === 'Escape') box.remove(); if (e.key === 'Enter') take(); });
        s.focus();
    },

    // ---------------------------------------------------------------- Generate · Hear · Insert
    fillGenerate() {
        const f = this.fl();
        f.seed = Math.max(1, +f.seed || 1) + 1;
        this.fillDirty(); this.save(); this.render();
        const run = this.fillRun();
        this.setStatus(run ? run.summary.text : 'no strike group in this score to fill');
    },
    async fillHear() {
        const e = E_(), run = this.fillRun(); if (!run) { this.setStatus('nothing to hear — choose a pattern', true); return; }
        e.panic();
        if (!await e.ensureMidi()) { this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const C = C_(), t0 = Math.min(run.attacks[0].t, run.longs.reduce((m, x) => Math.min(m, x.t0), Infinity));
        const base = performance.now() + 260;
        let skipped = 0;
        const routeOf = lane => { const tech = (C.ordinaryTech && C.ordinaryTech(lane)) || {}; return e.routeFor(lane, tech.key); };
        // the attacks, as they sound
        run.attacks.forEach(a => {
            const r = routeOf(a.lane); if (!r) { skipped++; return; }
            const on = base + (a.t - t0) * 1000;
            e._timers.push(setTimeout(() => e.noteOn(r, a.midi, 100), Math.max(0, on - performance.now())));
            e._timers.push(setTimeout(() => e.noteOff(r, a.midi), Math.max(0, on + Math.max(60, a.dur * 1000) - performance.now())));
        });
        // the longs: a held note with a rising CC7 for a crescendo, plain for the rest (the real trill is heard once it is inserted)
        run.longs.forEach(x => {
            const r = routeOf(x.lane); if (!r) { skipped++; return; }
            const on = base + (x.t0 - t0) * 1000, dur = (x.t1 - x.t0) * 1000;
            if (x.kind === 'cresc') {
                for (let i = 0; i <= 16; i++) {
                    const u = i / 16, v = Math.round(65 + 62 * Math.pow(u, Math.exp(4 * 0.40)));
                    e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, v]); } catch (q) { } }, Math.max(0, on + u * dur - performance.now())));
                }
                e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, 0]); } catch (q) { } }, Math.max(0, on + dur - 10 - performance.now())));
            } else {
                e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, 110]); } catch (q) { } }, Math.max(0, on - 5 - performance.now())));
            }
            e._timers.push(setTimeout(() => e.noteOn(r, x.midi, 100), Math.max(0, on - performance.now())));
            e._timers.push(setTimeout(() => e.noteOff(r, x.midi), Math.max(0, on + dur - performance.now())));
        });
        e._playing = true;
        const span = Math.max.apply(null, run.longs.map(x => (x.t1 - t0) * 1000).concat(run.attacks.map(a => (a.t - t0) * 1000))) + 500;
        this.base = base;
        e._timers.push(setTimeout(() => e.panic(), span + 700));
        this.startPlayhead(span);
        this.setStatus('hearing the pattern with its fill · ' + run.longs.length + ' longs' + (skipped ? ' · ' + skipped + ' had no port' : '')
            + ' — the trills sound as held notes here; insert to hear the real ones');
    },
    // write the pass into the score as its own group, replacing an earlier fill of this pattern (the drawer's replace rule)
    fillInsert() {
        const C = C_(), run = this.fillRun(), CRe = CR(), f = this.fl();
        if (!C || !run || !run.longs.length) { this.setStatus('nothing to insert — Generate first', true); return; }
        const ML = (typeof META_LAYER !== 'undefined') ? META_LAYER : 7;
        const group = this.fillGroupId(run.group);
        C.pushUndoState();
        const before = C.objects.length;
        const kept = C.objects.filter(o => o.groupId === group && o.pinned);
        C.objects = C.objects.filter(o => !(o.groupId === group && !o.pinned));
        const gone = before - C.objects.length - 0;
        let maxEnd = run.group.t, made = 0, trills = 0;
        run.longs.forEach(x => {
            if (kept.some(k => Math.abs(k.startSeconds - x.t0) < 0.02 && k.layer === x.lane)) return;   // a hand-edited long is pinned
            const tech = (C.ordinaryTech && C.ordinaryTech(x.lane)) || {};
            maxEnd = Math.max(maxEnd, x.t1);
            if (x.kind === 'trill') {
                const zone = C.createZone({ layer: x.lane, startTime: x.t0, endTime: x.t1, zoneFunction: 'midiPreview', midiModel: 'trill',
                    color: '#F04B00', opacity: 0.16, zoneHeight: 0.96, yOffset: 0.5, performanceNotes: 'trill (fill)' });
                zone.groupId = group;
                zone.trill = C.trillDefaults(x.lane, x.t0);
                zone.trill.pitch = x.midi;
                zone.fill = { attackId: x.attackId, launchedBy: x.launchedBy, cutBy: x.cutBy, from: run.group.id, pitch: x.pitch };
                C.regenerateTrill(zone);
                C.renderZone(zone);
                trills++; made++;
                return;
            }
            const wc = CRe.make(x.t0, x.midi, { lane: x.lane, tech: tech.key, label: (TRK()[x.lane] || {}).short }, [],
                { durS: x.t1 - x.t0, dynLo: +f.dynLo, dynHi: +f.dynHi, secco: f.secco !== false });
            if (!wc) return;
            wc.id = 'wc-' + (C.nextId++);
            wc.groupId = group;
            wc.endSeconds = x.t1;
            wc.properties.cresc.end = x.cutBy ? 'cutByAccent' : x.boundedBy === 'fallback' ? 'fallback' : 'toNextNote';
            wc.properties.cresc.fill = { attackId: x.attackId, launchedBy: x.launchedBy, cutBy: x.cutBy, from: run.group.id, pitch: x.pitch, kind: x.kind };
            // the note says what actually ended it — `Cresc.make` stamps "(typed)" because the length is passed in, but here the
            // length came from the room or from an accent, and that is what the score should read
            const why = x.cutBy ? 'cut by an accent' : x.boundedBy === 'fallback' ? 'no next sound' : x.boundedBy === 'clipped' ? 'clipped to the pattern' : 'to the next sound';
            wc.performanceNotes = 'cresc ' + wc.properties.cresc.shape + ' ' + wc.properties.cresc.ratio + '× '
                + CRe.dynName(+f.dynLo) + '→' + CRe.dynName(+f.dynHi) + ' ' + (x.t1 - x.t0).toFixed(2) + ' s (' + why + ')'
                + (x.pitch.fold ? ' · ' + CRe.nm(x.pitch.raw) + ' folded ' + (x.pitch.fold > 0 ? '+' : '') + x.pitch.fold + ' 8ve' : '')
                + ' · fill of ' + run.group.id;
            C.objects.push(wc);
            made++;
        });
        // the gesture's own META shape, the drawer's idiom
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: group,
            startSeconds: run.group.t, endSeconds: Math.round(maxEnd * 1000) / 1000,
            nodes: [{ pos: 0, y: 7.2, smooth: 0 }, { pos: 1, y: 7.2, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: '#C2410C', fillMode: 'bottom', opacity: 0.5, performanceNotes: 'fill of ' + run.group.id + ' (drag = move, box = stretch)', properties: {} });
        C.lastInsertGroup = group;
        this.fillDirty();                                    // the score changed under it
        C.curveDirty(); C.renderAll(); C.markDirty(); C.scheduleConflictRefresh();
        this.setStatus('inserted ' + made + ' longs' + (trills ? ' (' + trills + ' trills)' : '') + ' as ' + group
            + (gone > 0 ? ' · replaced the earlier fill' : '') + (kept.length ? ' · ' + kept.length + ' hand-edited kept' : '')
            + (run.aborts.length ? ' · ' + run.aborts.length + ' attacks had none' : '') + ' — CTRL+Z undoes it');
    },

    // ---------------------------------------------------------------- the mode button and the foot
    injectFillUI() {
        if (!this.el || this.el.querySelector('#skModeFill')) return;
        const wrap = this.el.querySelector('#skModeWrap');
        if (!wrap) return;                                  // chords mode makes it; without it there is no mode row
        const b = document.createElement('button');
        b.id = 'skModeFill'; b.textContent = 'fill'; b.style.cssText = BTN;
        b.title = 'PLAN 1n: overlay a long — a crescendo or a trill — on EVERY attack of a strike pattern already in the score, each in another instrument';
        wrap.appendChild(b);
        b.addEventListener('click', () => this.setMode('fill'));
        const foot = this.el.querySelector('#skFoot');
        const ff = document.createElement('span');
        ff.id = 'skFlFoot';
        ff.style.cssText = 'display:none;gap:6px;align-items:center;white-space:nowrap';
        ff.innerHTML = '<span style="color:#555">|</span>'
            + '<button id="skFlGen" style="' + BTN + ';color:#e8a06a" title="deal the longs over the pattern (a new seed each time)">Generate</button>'
            + '<button id="skFlHear" style="' + BTN + '" title="the pattern with its fill, before it enters the score">Hear</button>'
            + '<button id="skFlIns" style="' + BTN + ';color:#e8a06a" title="write the longs into the score as their own group at the pattern\'s own time">Insert</button>';
        foot.insertBefore(ff, foot.querySelector('#skTakeGrp'));
        ff.querySelector('#skFlGen').addEventListener('click', () => this.fillGenerate());
        ff.querySelector('#skFlHear').addEventListener('click', () => this.fillHear());
        ff.querySelector('#skFlIns').addEventListener('click', () => this.fillInsert());
        const paint = this.paintMode.bind(this);
        this.paintMode = function () {
            paint();
            const on = this.isFill();
            const el = this.el && this.el.querySelector('#skModeFill');
            if (el) el.style.cssText = BTN + (on ? ';background:#4a2a12;color:#e8a06a;border-color:#C2410C' : '');
            const cf = this.el && this.el.querySelector('#skChFoot'); if (cf && on) cf.style.display = 'none';
            const f2 = this.el && this.el.querySelector('#skFlFoot'); if (f2) f2.style.display = on ? 'inline-flex' : 'none';
            const pick = this.el && this.el.querySelector('#skPick'); if (on && pick) pick.style.display = 'none';
            // fill mode borrows the drawer, not its notes-mode controls: the voicing bar, the piano row, the strike inserts and
            // the two Hears belong to a strike being built, and none of them means anything over a pattern already in the score
            const foot = this.el && this.el.querySelector('#skFoot');
            if (foot) Array.from(foot.children).forEach(c => {
                if (c.id === 'skFlFoot' || c.id === 'skTakeGrp' || c.id === 'skPlayhead' || c.id === 'skStop') return;
                if (!on) { if (c.dataset.flHid) { c.style.display = c.dataset.flHid === '-' ? '' : c.dataset.flHid; delete c.dataset.flHid; } return; }
                if (c.id === 'skChFoot') return;                       // chords mode hides its own
                if (!c.dataset.flHid) c.dataset.flHid = c.style.display || '-';
                c.style.display = 'none';
            });
        };
        this.paintMode();
    },
});

// fill mode needs no strike from the database — the drawer's render must reach it even with nothing picked
const _render = D.render;
D.render = function () {
    if (this.isFill && this.isFill() && this.el) { this.renderFill(); this.paintMode(); return; }
    return _render.apply(this, arguments);
};
const _setMode = D.setMode;
D.setMode = function (m) {
    if (m === 'fill') {
        this.cfg.mode = 'fill'; this.fillDirty(); this.save(); this.paintMode();
        if (this.closeOnsetCard) this.closeOnsetCard();
        this.render();
        this.setStatus('fill mode — choose a pattern already in the score, then Generate');
        return;
    }
    return _setMode.apply(this, arguments);
};

if (D.el) D.injectFillUI();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.injectFillUI(); });
else setTimeout(() => { if (D.el) D.injectFillUI(); }, 0);
}(typeof self !== 'undefined' ? self : this));
