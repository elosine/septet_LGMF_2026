// swell_ui.js — THE SOUND SWITCH: attack or crescendo (PLAN 1o step 1; CN-48 · CN-56; RUNNING_LOG §301–309).
//
// His words (CN-56): *"they would take the place of the strikes. And that's kind of what I originally set out to do … instead of a strike
// or short note, it'd be the onset of the crescendos."*
//
// So this is NOT a fourth drawer mode. It is a switch ORTHOGONAL to the mode (§304): *notes + crescendo* is a single line of swells,
// *chords + crescendo* is 1o proper — chords of swells — and every rhythm shape, voicing, order, span, take and insert already in the
// drawer serves both without being written twice.
//
// WHAT THE SWITCH ACTUALLY CHANGES — four things, and no more:
//   1. the dealt sound's LENGTH: 140 ms becomes `lengthMul` × the local gap of the rhythm, capped so it cannot run into that player's own
//      next dealt note (0.17 s before it, 1l's number) and floored at 1l's `minS`;
//   2. what the chord deal ASSUMES a sound occupies (`soundMs`), so the dealing already respects the swells — this is the circularity his
//      question uncovered (§302): the length is an INPUT to the deal, not something readable afterwards, because the deal is what creates
//      the who-plays-when in the first place;
//   3. what is WRITTEN: a short `waveCurve` becomes a 1l crescendo at 1l/1m's own defaults, in its own `grp-swell-…` group;
//   4. the READOUT: the voices actually sounding, and the flag count, which is the honest signal once the ensemble saturates and the
//      arithmetic stops holding (§303: length ÷ gap of 1 gives about 2.5 voices, 2 about 4, 3 saturates and fails a third of the entries).
//
// The piano stays out of the dealing as it always has (CN-34): a piano cannot swell.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[swell_ui] the strikes drawer is not loaded'); return; }

const CR = () => root.Cresc;
const E_ = () => (typeof MorphEmit !== 'undefined') ? MorphEmit : (root.MorphEmit || null);
// REVERT (2026-09-10): localStorage septet.strikes.classic = '1' + reload keeps 1o exactly as it was — the 1.2 default, no anchor, the old Hear
let CLASSIC = false; try { CLASSIC = !!localStorage.getItem('septet.strikes.classic'); } catch (e) {}
const C_ = () => (typeof Composer !== 'undefined') ? Composer : (root.Composer || null);
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : (root.TRACKS || []);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';

const SW_DEFAULTS = {
    sound: 'attack',        // 'attack' | 'cresc'
    lengthMode: 'gap',      // 'gap' = a multiple of the local gap (his choice, §304) · 'typed' = one length for the pass
    lengthMul: CLASSIC ? 1.2 : 1.0,   // × the gap to the next onset — shown as a PERCENTAGE: 100 = one onset to the next (his 2026-09-10 default; 1o opened at 1.2)
    lengthS: 2,             // the typed length
    dynLo: 0, dynHi: 10,    // ppp → fff, 1l's own default range
    secco: true,            // CN-49
    anchor: 'start',        // 2026-09-10: the pattern marks each crescendo's BEGINNING ('start', as 1o always did) or its END ('end')
};

Object.assign(D, {

    sw() {
        if (!this.cfg.sw) this.cfg.sw = JSON.parse(JSON.stringify(SW_DEFAULTS));
        else for (const k in SW_DEFAULTS) if (this.cfg.sw[k] === undefined) this.cfg.sw[k] = SW_DEFAULTS[k];
        return this.cfg.sw;
    },
    isSwell() { return this.sw().sound === 'cresc'; },

    // WHAT THE DEAL ASSUMES a sound occupies. The deal happens before the lengths are knowable per note (§302), so it is given the
    // nominal: the multiplier against the rhythm's MEDIAN gap. The per-note length below then respects each player's own next note, so
    // the assumption only has to be close, not exact.
    swellSoundMs() {
        const s = this.sw();
        if (!this.isSwell()) return 140;
        if (s.lengthMode === 'typed') return Math.max(300, (+s.lengthS || 2) * 1000);
        const on = (this.chordOnsets ? this.chordOnsets() : []).slice().sort((a, b) => a - b);
        const gaps = on.slice(1).map((v, i) => v - on[i]).filter(g => g > 0).sort((a, b) => a - b);
        const med = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 1000;
        return Math.max(300, med * (+s.lengthMul || 1.2));
    },

    // THE LENGTH OF ONE SWELL. `notes` is the whole dealt set (each { lane, onMs, … }).
    swellLenMs(n, notes) {
        const s = this.sw(), CRe = CR();
        const minMs = ((CRe && CRe.DEFAULTS.minS) || 0.3) * 1000;
        // NOT 1l's 5 s fallback: that is the length a free-standing crescendo takes when nothing follows it, and as a CEILING here it
        // would silently crush a long container — his time containers reach 15 s and more (found on the walk). The real ceiling is the
        // player's own next dealt note, applied below; this is only a sanity bound.
        const capMs = 60000;
        const gapS = ((CRe && CRe.DEFAULTS.endGapS) || 0.17) * 1000;
        let want;
        if (s.lengthMode === 'typed') want = (+s.lengthS || 2) * 1000;
        else {
            // the LOCAL gap of the rhythm — the next onset of the sequence, whoever plays it. The LAST entry has no next onset, so it
            // takes the gap BEHIND it instead (the local tempo there) rather than the sanity bound, which would give it a 60 s swell.
            const later = notes.map(x => x.onMs).filter(t => t > n.onMs + 1).sort((a, b) => a - b);
            let gap;
            if (later.length) gap = later[0] - n.onMs;
            else {
                const earlier = notes.map(x => x.onMs).filter(t => t < n.onMs - 1).sort((a, b) => b - a);
                gap = earlier.length ? n.onMs - earlier[0] : ((CRe && CRe.DEFAULTS.fallbackS) || 5) * 1000;
            }
            want = gap * (+s.lengthMul || 1.2);
        }
        // and it may never run into this player's OWN next dealt note
        const mine = notes.filter(x => x.lane === n.lane && x.onMs > n.onMs + 1).map(x => x.onMs).sort((a, b) => a - b);
        if (mine.length) want = Math.min(want, Math.max(minMs, mine[0] - n.onMs - gapS));
        return Math.round(Math.max(minMs, Math.min(capMs, want)));
    },

    // the dealt notes with swell lengths on them — used by Hear and by Insert alike
    swellNotes(mode) {
        let notes = this._notesForPlain(mode);
        if (!this.isSwell()) return notes;
        // §343: the piano is dropped from a crescendo pass outright. CN-34 — a piano cannot swell — was honoured in the CHORD
        // deal but never here, so a voice sitting on the piano lane (or doubled onto it) came through as a long FLAT note and
        // sounded exactly like "the piano is still playing" after he had taken it out. Hear and Insert both go through here.
        { const T = TRK(); notes = notes.filter(n => !(T[n.lane] && T[n.lane].instKey === 'piano')); }
        if (!notes.length) return notes;
        // a crescendo is the ORDINARY voice (his rule, 2026-09-10: "the crescendos are the ones we discussed, ord / senza vib vel"); the row's
        // strike voice is for hits — so Hear routes a swell the way Insert writes it
        const C = C_(); const ord = lane => { const t = C && C.ordinaryTech ? C.ordinaryTech(lane) : null; return t ? t.key : null; };
        if (!CLASSIC && this.sw().anchor === 'end') return this.swellEndNotes(notes).map(n => Object.assign(n, { tech: ord(n.lane) || n.tech }));
        return notes.map(n => Object.assign({}, n, { durMs: this.swellLenMs(n, notes), swell: true, tech: CLASSIC ? n.tech : (ord(n.lane) || n.tech) }));
    },
    // THE END ANCHOR (2026-09-10, his commission): each crescendo ENDS on its onset and began one gap × the percentage earlier — the gap
    // BEFORE the onset, the first onset taking the gap after it (so the first reaches back before the pattern); never back into that
    // player's own previous sound (its previous onset is the END of its previous crescendo + the 150 ms rest); the 0.30 s floor holds.
    swellEndNotes(notes) {
        const s = this.sw(), CRe = CR();
        const minMs = ((CRe && CRe.DEFAULTS.minS) || 0.3) * 1000, restMs = 150;
        const on = notes.map(x => x.onMs).sort((a, b) => a - b);
        return notes.map(n => {
            const earlier = on.filter(t => t < n.onMs - 1), later = on.filter(t => t > n.onMs + 1);
            const gap = earlier.length ? n.onMs - earlier[earlier.length - 1] : (later.length ? later[0] - n.onMs : ((CRe && CRe.DEFAULTS.fallbackS) || 5) * 1000);
            let want = s.lengthMode === 'typed' ? (+s.lengthS || 2) * 1000 : gap * (+s.lengthMul || 1);
            const mine = notes.filter(x => x.lane === n.lane && x.onMs < n.onMs - 1).map(x => x.onMs).sort((a, b) => b - a);
            if (mine.length) want = Math.min(want, Math.max(minMs, n.onMs - mine[0] - restMs));
            const len = Math.round(Math.max(minMs, Math.min(60000, want)));
            return Object.assign({}, n, { onMs: n.onMs - len, durMs: len, swell: true, endsAt: n.onMs });
        });
    },

    // THE READOUT: what will actually sound, measured rather than predicted (§303 — the formula over-predicts once the ensemble saturates,
    // and that is exactly where the flags appear, so the flag count is the honest half)
    swellReadout() {
        const notes = this.swellNotes('orch');
        if (!notes.length) return { text: 'nothing dealt yet', voices: 0, flagged: 0 };
        const t0 = Math.min.apply(null, notes.map(n => n.onMs));
        const t1 = Math.max.apply(null, notes.map(n => n.onMs + n.durMs));
        let sum = 0, k = 0, peak = 0;
        for (let t = t0; t <= t1; t += 25) {
            const v = notes.filter(n => n.onMs <= t && n.onMs + n.durMs > t).length;
            sum += v; k++; if (v > peak) peak = v;
        }
        const lens = notes.map(n => n.durMs / 1000).sort((a, b) => a - b);
        const seq = (this.isChords && this.isChords() && this.chordSeq) ? this.chordSeq() : null;
        const flagged = seq ? seq.events.filter(e => e.flagged).length : 0;
        const lowered = seq ? seq.events.filter(e => e.lowered).length : 0;
        const voices = k ? sum / k : 0;
        // a rhythm can simply be too fast for a swell (§303: a 0.30 s swell already wants 400 ms gaps). When the multiplier would put a
        // length under 1l's floor, the floor wins and the entries start failing — so the readout says WHY rather than only that they did.
        const minS = ((CR() && CR().DEFAULTS.minS) || 0.3);
        const floored = notes.filter(n => Math.abs(n.durMs / 1000 - minS) < 1e-6).length;
        return {
            voices, peak, flagged, lowered, floored,
            text: notes.length + ' swells · ' + lens[0].toFixed(2) + '–' + lens[lens.length - 1].toFixed(2) + ' s (median '
                + lens[Math.floor(lens.length / 2)].toFixed(2) + ' s) · ' + voices.toFixed(1) + ' voices sounding, peak ' + peak
                + (lowered ? ' · ' + lowered + ' entries thinned' : '')
                + (lowered ? '' : '')
                + (flagged ? ' · ' + flagged + ' could not be met' : '')
                + (floored === notes.length && flagged ? ' — these gaps are too fast for a swell: every one is at the ' + minS.toFixed(2) + ' s floor' : ''),
        };
    },

    // ---------------------------------------------------------------- the write
    swellInsert() {
        const C = C_(), CRe = CR(), s = this.sw();
        if (!C || !CRe) { this.setStatus('the crescendo module is not loaded', true); return; }
        const notes = this.swellNotes('orch');
        if (!notes.length) { this.setStatus('nothing to insert — Generate first', true); return; }
        const t = +C.getTimeAtPlayhead().toFixed(3);
        const ML = (typeof META_LAYER !== 'undefined') ? META_LAYER : 7;
        const tag = this.isChords && this.isChords() ? 'ch' : 'nt';
        const group = 'grp-swell-' + tag + '-' + (this.strike ? this.strike.index : 0) + '-' + Math.floor(t * 10);
        C.pushUndoState();
        const before = C.objects.length;
        C.objects = C.objects.filter(o => o.groupId !== group);
        const replaced = before - C.objects.length;
        let maxEnd = t, minStart = t, made = 0;   // an END-anchored pass begins before the playhead
        notes.forEach(n => {
            const at = +(t + n.onMs / 1000).toFixed(3), dur = n.durMs / 1000; minStart = Math.min(minStart, at);
            const tech = (C.ordinaryTech && C.ordinaryTech(n.lane)) || {};
            const wc = CRe.make(at, n.midi, { lane: n.lane, tech: tech.key, label: (TRK()[n.lane] || {}).short }, [],
                { durS: dur, dynLo: +s.dynLo, dynHi: +s.dynHi, secco: s.secco !== false });
            if (!wc) return;
            wc.id = 'wc-' + (C.nextId++);
            wc.groupId = group;
            // §349, HIS RULE: "insert at playhead means insert what I'm listening to at the playhead." Hear is the reference.
            // Hear sends CC7 = 65 + 62 · u^exp(4·0.40) and a note-on velocity of the note's own vel. The score played neither:
            // its CC7 came from the anchor law (§316: drawn 0 = CC7 88, 9.96 dB end to end) or, after §346, from a cc7Abs I chose,
            // and its velocity from the CURVE'S TOP (`heldVel`). Three differences, so it could not match. Now the object CARRIES
            // Hear's numbers: the curve sampled straight off Hear's law as nodes, the CC7 range Hear uses, the velocity Hear sends.
            // Measured: 0 mismatches across 17 samples of the two ramps.
            { const SHP = Math.exp(4 * 0.40), N = 16, nd = [], sg = [];
              for (let i = 0; i <= N; i++) { const u = i / N; nd.push({ pos: u, y: +(10 * Math.pow(u, SHP)).toFixed(4), smooth: 0 }); }
              for (let i = 0; i < N; i++) sg.push({ model: 'power', slope: 0 });
              wc.nodes = nd; wc.segments = sg;
              wc.cc7Abs = { lo: 65, hi: 127 };
              wc.velAbs = n.vel != null ? n.vel : 100; }
            wc.properties.cresc.end = 'swell';
            wc.properties.cresc.swell = { from: this.strike ? this.strike.id : null, mode: this.cfg.mode || 'notes',
                                          lengthMode: s.lengthMode, lengthMul: +s.lengthMul, onMs: n.onMs, anchor: s.anchor === 'end' ? 'end' : 'start', endsAt: n.endsAt != null ? n.endsAt : null };
            wc.performanceNotes = 'cresc ' + wc.properties.cresc.shape + ' ' + wc.properties.cresc.ratio + '× '
                + CRe.dynName(+s.dynLo) + '→' + CRe.dynName(+s.dynHi) + ' ' + dur.toFixed(2) + ' s (swell strike)';
            maxEnd = Math.max(maxEnd, at + dur);
            C.objects.push(wc);
            made++;
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: group,
            startSeconds: Math.round(minStart * 1000) / 1000, endSeconds: Math.round(maxEnd * 1000) / 1000,
            nodes: [{ pos: 0, y: 7.8, smooth: 0 }, { pos: 1, y: 7.8, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: '#C2410C', fillMode: 'bottom', opacity: 0.5, performanceNotes: 'swell strike (drag = move, box = stretch)', properties: {} });
        C.lastInsertGroup = group;
        C.curveDirty(); C.renderAll(); C.markDirty(); C.scheduleConflictRefresh();
        const r = this.swellReadout();
        this.setStatus('inserted ' + made + ' swells at ' + t.toFixed(3) + ' s as ' + group
            + (replaced ? ' · replaced the earlier pass' : '') + ' · ' + r.text + ' — CTRL+Z undoes it');
    },

    // ---------------------------------------------------------------- the switch and its controls
    injectSwellUI() {
        if (!this.el || this.el.querySelector('#skSoundWrap')) return;
        const head = this.el.querySelector('#skHead'); if (!head) return;
        const wrap = document.createElement('span');
        wrap.id = 'skSoundWrap';
        wrap.style.cssText = 'display:inline-flex;gap:3px;align-items:center;white-space:nowrap';
        wrap.title = 'PLAN 1o: what the drawer deals — a short attack as it always has, or a CRESCENDO in its place. The switch is beside the mode, not inside it, so notes and chords both serve it.';
        wrap.innerHTML = '<span style="color:#9a9">sound</span>'
            + '<button id="skSndAtk" style="' + BTN + '">attack</button><button id="skSndCr" style="' + BTN + '">crescendo</button>';
        const modeWrap = this.el.querySelector('#skModeWrap');
        if (modeWrap && modeWrap.parentNode) modeWrap.parentNode.insertBefore(wrap, modeWrap.nextSibling);
        else head.appendChild(wrap);
        wrap.querySelector('#skSndAtk').addEventListener('click', () => this.setSound('attack'));
        wrap.querySelector('#skSndCr').addEventListener('click', () => this.setSound('cresc'));

        const foot = this.el.querySelector('#skFoot');
        const sf = document.createElement('span');
        sf.id = 'skSwFoot';
        sf.style.cssText = 'display:none;gap:6px;align-items:center;white-space:nowrap';
        sf.innerHTML = '<span style="color:#555">|</span><span style="color:#9a9">swell</span>'
            + '<select id="skSwMode" style="' + INP + '" title="the length of each swell: a multiple of the gap to the next onset (it follows an accelerando by itself), or one typed length for the whole pass">'
            + '<option value="gap">% of the gap</option><option value="typed">a typed length</option></select>'
            + '<input id="skSwMul" type="number" step="10" min="20" style="' + INP + ';width:50px" title="the length as a PERCENTAGE of the gap to the next onset: 100 = one onset to the next, more = they overlap, less = air between — and it is the density dial: 100 gives about 2.5 voices sounding, 200 about 4, 300 saturates"><span id="skSwPct" style="color:#8a8">%</span>'
            + '<input id="skSwLen" type="number" step="0.1" min="0.3" style="' + INP + ';width:46px" title="the typed length in seconds"><span style="color:#8a8">s</span>'
            + (CLASSIC ? '' : '<select id="skSwAnchor" style="' + INP + '" title="what the pattern marks: the BEGINNING of each crescendo (it starts on its onset and runs a percentage of the gap to the next) or its END (it ends on its onset and began a percentage of the gap before it; the first reaches back before the pattern)"><option value="start">starts on the onset</option><option value="end">ends on the onset</option></select>')
            + '<select id="skSwLo" style="' + INP + ';width:50px" title="the dynamic each swell starts from"></select>'
            + '<span style="color:#8a8">→</span>'
            + '<select id="skSwHi" style="' + INP + ';width:50px" title="the dynamic each swell reaches"></select>'
            + '<label title="secco: the cut at the end so nothing rings past it (CN-49)"><input id="skSwSecco" type="checkbox"> secco</label>'
            + '<button id="skSwIns" style="' + BTN + ';color:#e8a06a" title="write the swells into the score at the playhead as their own group">Insert swells</button>'
            + '<span id="skSwOut" style="color:#9a9"></span>';
        foot.insertBefore(sf, foot.querySelector('#skTakeGrp'));
        const CRe = CR();
        const opts = (CRe ? CRe.DYN : ['ppp', 'fff']).map(d => '<option value="' + d + '">' + d + '</option>').join('');
        sf.querySelector('#skSwLo').innerHTML = opts; sf.querySelector('#skSwHi').innerHTML = opts;
        sf.querySelector('#skSwIns').addEventListener('click', () => this.swellInsert());
        ['skSwMode', 'skSwMul', 'skSwLen', 'skSwLo', 'skSwHi', 'skSwSecco'].concat(CLASSIC ? [] : ['skSwAnchor']).forEach(id => {
            sf.querySelector('#' + id).addEventListener('change', () => {
                const s = this.sw(), q = i => sf.querySelector('#' + i);
                s.lengthMode = q('skSwMode').value;
                s.lengthMul = Math.max(0.2, (+q('skSwMul').value || 100) / 100);   // the box is a percentage
                if (q('skSwAnchor')) s.anchor = q('skSwAnchor').value === 'end' ? 'end' : 'start';
                s.lengthS = +q('skSwLen').value || 2;
                s.dynLo = CRe ? CRe.dynHeight(q('skSwLo').value) : 0;
                s.dynHi = CRe ? CRe.dynHeight(q('skSwHi').value) : 10;
                s.secco = q('skSwSecco').checked;
                if (this.chordDirty) this.chordDirty();
                this.save(); this.paintSound(); this.render();
            });
        });
        this.paintSound();
    },
    paintSound() {
        if (!this.el) return;
        const on = this.isSwell(), s = this.sw(), CRe = CR();
        const a = this.el.querySelector('#skSndAtk'), b = this.el.querySelector('#skSndCr');
        if (a) a.style.cssText = BTN + (on ? '' : ';background:#4a2a12;color:#e8a06a;border-color:#C2410C');
        if (b) b.style.cssText = BTN + (on ? ';background:#4a2a12;color:#e8a06a;border-color:#C2410C' : '');
        const sf = this.el.querySelector('#skSwFoot');
        if (!sf) return;
        sf.style.display = (on && !(this.isFill && this.isFill())) ? 'inline-flex' : 'none';
        const q = i => sf.querySelector('#' + i);
        q('skSwMode').value = s.lengthMode;
        q('skSwMul').value = Math.round((+s.lengthMul || 1) * 100); q('skSwMul').style.display = s.lengthMode === 'gap' ? '' : 'none';
        { const pct = sf.querySelector('#skSwPct'); if (pct) pct.style.display = s.lengthMode === 'gap' ? '' : 'none'; }
        if (q('skSwAnchor')) q('skSwAnchor').value = s.anchor === 'end' ? 'end' : 'start';
        q('skSwLen').value = s.lengthS; q('skSwLen').style.display = s.lengthMode === 'typed' ? '' : 'none';
        if (CRe) { q('skSwLo').value = CRe.dynName(s.dynLo); q('skSwHi').value = CRe.dynName(s.dynHi); }
        q('skSwSecco').checked = s.secco !== false;
        if (on) { try { q('skSwOut').textContent = this.swellReadout().text; } catch (e) { q('skSwOut').textContent = ''; } }
    },
    setSound(v) {
        this.sw().sound = (v === 'cresc') ? 'cresc' : 'attack';
        if (this.chordDirty) this.chordDirty();
        this.save(); this.paintSound();
        if (this.strike || this.isFill && this.isFill()) this.render();
        this.setStatus(this.isSwell()
            ? 'crescendo: every dealt sound is a swell — its length follows the gap, and the readout says how thick it will be'
            : 'attack: the drawer as it always was');
    },
});

// ---------------------------------------------------------------- the hooks, kept to three
// 1 · notesFor gains the swell lengths, so Hear and the insert both see them
D._notesForPlain = D.notesFor;
D.notesFor = function (mode) {
    if (this.isSwell && this.isSwell() && !(this.isFill && this.isFill())) return this.swellNotes(mode);
    return this._notesForPlain.apply(this, arguments);
};
// 2 · the chord deal is told what a sound occupies (§302: the length is an INPUT to the deal)
if (D.chordSeq) {
    const _chordSeq = D.chordSeq;
    D.chordSeq = function () {
        const c = this.ch ? this.ch() : null;
        if (c) c.soundMs = this.swellSoundMs();          // in the cache key through `c`, so a swell setting re-deals
        return _chordSeq.apply(this, arguments);
    };
}
// 3 · the mode paint carries the sound switch with it
if (D.paintMode) {
    const _paintMode = D.paintMode;
    D.paintMode = function () { _paintMode.apply(this, arguments); if (this.paintSound) this.paintSound(); };
}
// 4 · Hear plays a swell AS a swell (2026-09-10 — the NIT of 2026-09-09 closed): the drawer's play() sends plain note-ons, so with the
// switch on crescendo the audition is scheduled here instead — the same routes and timers, plus the CC7 ramp fill mode's Hear uses (§Y)
// and the secco cut. The piano's Hear and fill mode keep their own paths.
if (!CLASSIC) {
    const _play = D.play;
    D.play = async function (mode) {
        if (!(this.isSwell && this.isSwell()) || (this.isFill && this.isFill()) || mode === 'piano') return _play.apply(this, arguments);
        const e = E_(); if (!this.strike || !e) return;
        e.panic();
        if (!await e.ensureMidi()) { this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const notes = this.notesFor(mode);
        if (!notes.length) { this.setStatus('nothing to play — shuffle or assign first', true); return; }
        const routes = {}; let skipped = 0;
        notes.forEach(n => { const k = n.lane + '|' + n.tech; if (!(k in routes)) routes[k] = e.routeFor(n.lane, n.tech) || null; if (!routes[k]) skipped++; });
        if (skipped === notes.length) { this.setStatus('no MIDI port for these players', true); return; }
        const t0 = Math.min.apply(null, notes.map(n => n.onMs));
        const base = performance.now() + 260; this.base = base; e._playing = true;
        const shape = Math.exp(4 * 0.40);   // the standard surge, as fill mode's Hear plays it (§Y)
        notes.forEach(n => {
            const r = routes[n.lane + '|' + n.tech]; if (!r) return;
            const on = base + (n.onMs - t0), dur = n.durMs;
            if (r.tech && r.tech.cc0 != null) e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 0, r.tech.cc0]); } catch (x) {} }, Math.max(0, on - 30 - performance.now())));
            if (n.swell) {
                for (let i = 0; i <= 16; i++) { const u = i / 16, v = Math.round(65 + 62 * Math.pow(u, shape)); e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, v]); } catch (x) {} }, Math.max(0, on - 5 + u * dur - performance.now()))); }
                // §350 THE SECCO THAT NEVER CUT: it was scheduled at `on + dur - 10`, but the ramp's LAST point (u = 1) lands at
                // `on - 5 + dur` — 5 ms LATER — and sends CC7 127 straight over the top of it. The cut also belongs AFTER the
                // note-off, not before: secco kills the RELEASE TAIL (CN-49, "so nothing rings past it"), and a cut 10 ms before
                // the end just ducks the last of the note. Now: after the last ramp point and after the note-off.
                // §350b: and it must not silence a NEIGHBOUR. Overlapping swells on a round robin can share a route, and a blunt
                // CC7 0 would cut whichever is still sounding — the score guards this (`seccoCut`, "a secco crescendo must not
                // silence its neighbour"); the drawer's audition did not. Skip the cut while another note on this same route runs on.
                const myEnd = n.onMs + n.durMs, rk = n.lane + '|' + n.tech;
                const neighbour = notes.some(m => m !== n && (m.lane + '|' + m.tech) === rk && m.onMs < myEnd && (m.onMs + m.durMs) > myEnd + 1);
                if (this.sw().secco !== false && !neighbour) e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, 0]); } catch (x) {} }, Math.max(0, on + dur + 2 - performance.now())));
            } else e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 7, 127]); } catch (x) {} }, Math.max(0, on - 5 - performance.now())));
            e._timers.push(setTimeout(() => e.noteOn(r, n.midi, n.vel), Math.max(0, on - performance.now())));
            e._timers.push(setTimeout(() => e.noteOff(r, n.midi), Math.max(0, on + dur - performance.now())));
        });
        const span = Math.max.apply(null, notes.map(n => n.onMs + n.durMs)) - t0 + 400;
        e._timers.push(setTimeout(() => e.panic(), span + 700));
        this.startPlayhead(span);
        this.setStatus('hearing the swells with their ramps · ' + (notes.length - skipped) + ' notes' + (skipped ? ' · ' + skipped + ' had no port' : ''));
    };
}

if (D.el) D.injectSwellUI();
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (D.el) D.injectSwellUI(); });
else setTimeout(() => { if (D.el) D.injectSwellUI(); }, 0);
}(typeof self !== 'undefined' ? self : this));
