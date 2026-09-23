// texture_insert.js — INSERT: the pattern into the score (LGMF PLAN 1o.5, 2026-09-22; RUNNING_LOG §276 … §278, §288, §295;
// SEQUENCE_TOOL §10 — the sequence's round trip, verbatim; `sequence_ui.js` and `strike_drawer.js` are not changed).
//
// His confirmation (§288): *"it's a two-way, correct? … I finish creating one in the drawer, in the strikes drawer, I insert it. Do some
// other things, come back to it, and then can edit it again in the strikes drawer, and it just replaces the one that's there."* Yes:
//   · the drawer's own `Insert @ playhead` button, on a texture take, writes THE OPEN PATTERN — its RANGE (his A, §277): the range's left
//     line lands on the playhead, only the ON marks inside it are written; the cursor is not consulted.
//   · the notes are WHAT SPACE PLAYS (texture_cols.js `txNotesBetween`, one list for both): each ON column's notes as dealt, with the
//     column's length or the player's own or the standard short (1m.3), `technique` and the pitch (a by-key voice's key) from the
//     column, a bent note's cents as `morphBend`; a seat's or a bent note DRAWN, the rest `plain` (the strike's rule, 1c.3 · 1c.4); the
//     claves NEVER written; a note under a trill skipped and counted (TRILLS_TOOL §7). UNTIL `1n.1` (§288): struck at the deal's velocity
//     on the strike's height rule (1c.2b), the lengths uncut, no `follow` — `1n.1`'s one helper re-points this beside SPACE.
//   · one group `grp-pat-<id>`, `srcKind: 'pattern'`, one META bar over the span; the entry `{ id, name, group, inserted, notes, t0, doc }`
//     — THE DOCUMENT COPIED WHOLE, dots included — into `databases.patterns`, so the score stands alone.
//   · a pattern IN the score is replaced IN PLACE from where its META bar sits now (a group he dragged is found where he left it); the old
//     group's objects go first; hand edits inside it are counted and overwritten — the document is the truth. `move to playhead` is the
//     one way a placed pattern still moves. `patterns in this score` brings a placed one back into the drawer, a row like any other
//     (untitled until named); an orphan (its notes gone) is marked and re-inserts at the playhead.
//   · the curve-channel map is CACHED (D11): `Composer.curveDirty()` after every write (§75 · §139).
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D || typeof D.txPat !== 'function' || typeof D.txNotesBetween !== 'function') { console.warn('[texture_insert] texture_cols.js is not loaded'); return; }
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const TRK = () => (typeof D.tracks === 'function' ? D.tracks() : (typeof TRACKS !== 'undefined' ? TRACKS : [])) || [];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const copy = v => JSON.parse(JSON.stringify(v));
const escH = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shortOf = lane => { const t = TRK()[lane]; return (t && (t.short || t.label)) || ('L' + lane); };
const COLOR = '#7FB8A4';   // the pattern's colour in the score — the strike is gold, the sequence blue
const MIN_Y = 0.05, MF_LEVEL = (100 - 65) / 62;   // 1n.1: a drawn node never sits at zero; mf on the written ladder (the sequence's `mfLevel`)
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px';

Object.assign(D, {
    _tinsSig: '',
    tinsDb() { const C = C_(), L = C && C.databases && C.databases.patterns; return Array.isArray(L) ? L.filter(x => x && x.id && x.doc) : []; },
    tinsEntry(id) { return this.tinsDb().find(x => x.id === id) || null; },
    tinsRange(doc) { const sp = doc.texture.span, r = Array.isArray(doc.range) ? doc.range : null; return r ? [clamp(+r[0] || 0, 0, sp), clamp(+r[1] || sp, 0, sp)] : [0, sp]; },
    // where a pattern sits NOW: its META bar's start — a group he dragged moves with its bar. With no bar left, the entry's own start.
    // null = none of its objects are in the score
    tinsPlacedAt(id) {
        const C = C_(); if (!C || !Array.isArray(C.objects)) return null;
        const group = 'grp-pat-' + id, ML = METAL(); let bar = null, any = false;
        C.objects.forEach(o => { if (o.groupId !== group) return; any = true; if (o.layer === ML && o.sonifyNote == null && isFinite(+o.startSeconds) && (bar == null || +o.startSeconds < bar)) bar = +o.startSeconds; });
        if (!any) return null;
        if (bar != null) return +bar.toFixed(3);
        const e = this.tinsEntry(id); return e ? +(+e.t0 || 0).toFixed(3) : null;
    },
    // the list a document writes at `t0`: its range's ON marks, from the range's left line, no claves
    tinsList(doc, t0) {
        const r = this.tinsRange(doc), L = this.txNotesBetween(r[0], r[1], false, doc);
        return { range: r, notes: L.notes.map((n, i) => Object.assign({}, n, { k: L.cols[i], start: +(t0 + n.onMs / 1000).toFixed(3), end: +(t0 + n.onMs / 1000 + n.durMs / 1000).toFixed(3) })), dots: L.dots };
    },
    // how many of the old group's notes are not where the SAVED document puts them — moved, stretched or re-pitched by hand — and how
    // many the document expects that are gone (the sequence's `handEdits`, 1d.3)
    tinsHandEdits(entry, start, oldNotes) {
        try {
            const want = this.tinsList(entry.doc, start).notes.map(n => ({ lane: n.lane, midi: n.midi, s: n.start, e: n.end, used: false }));
            let edited = 0;
            oldNotes.forEach(o => {
                const w = want.find(x => !x.used && x.lane === o.layer && x.midi === o.sonifyNote && Math.abs(x.s - (+o.startSeconds)) < 0.01 && Math.abs(x.e - (+o.endSeconds)) < 0.01);
                if (w) w.used = true; else edited++;
            });
            return { edited, missing: want.filter(x => !x.used).length };
        } catch (e) { return null; }
    },
    // INSERT — at the playhead, or IN PLACE when the pattern is in the score (`toPlayhead` = the `move to playhead` button)
    tinsInsert(toPlayhead) {
        const C = C_(); if (!C || typeof C.getTimeAtPlayhead !== 'function') { this.setStatus('the composer is not reachable', true); return; }
        const doc = this.txPat(); if (!doc) { this.setStatus('no pattern is open — choose a texture to start one, or pattern ▾', true); return; }
        const id = doc.id, group = 'grp-pat-' + id, ML = METAL(), name = doc.name || ('pattern ' + id);
        const sits = this.tinsPlacedAt(id), inPlace = sits != null && !toPlayhead;
        const t0 = inPlace ? sits : +C.getTimeAtPlayhead().toFixed(3);
        const L = this.tinsList(doc, t0);
        if (!L.dots.length) { this.setStatus((doc.on || []).length ? 'no ON mark inside the range ' + L.range[0].toFixed(2) + '–' + L.range[1].toFixed(2) + ' s — widen it, or turn marks on inside it' : 'every mark is off — click some on (or all on) before inserting', true); return; }
        if (!L.notes.length) { this.setStatus('the ON marks inside the range have no players — select a column and tick players', true); return; }
        // the document is the truth: count what he changed by hand inside the group — the old notes against what the SAVED document writes there
        const saved = this.tinsEntry(id), oldNotes = C.objects.filter(o => o.groupId === group && o.sonifyNote != null);
        const he = (saved && sits != null && oldNotes.length) ? this.tinsHandEdits(saved, sits, oldNotes) : null;
        C.pushUndoState();
        const before = C.objects.length;
        C.objects = C.objects.filter(o => o.groupId !== group);   // one pattern = one place in the score: the old group's objects go, by their id
        const gone = before - C.objects.length;
        let maxEnd = t0, written = 0; const busy = [];
        L.notes.forEach(n => {
            const start = n.start, dur = +(n.durMs / 1000).toFixed(3);
            if (typeof C.trillCovers === 'function' && C.trillCovers(n.lane, start)) { busy.push(shortOf(n.lane) + '@' + start.toFixed(2)); return; }   // TRILLS_TOOL §7, as D.insert
            maxEnd = Math.max(maxEnd, n.end);
            const c = (doc.cols || {})[n.k] || {}, len = this.txLenS(c, n.row != null ? n.row : n.lane);
            // 1n.1 — THE ONE HELPER'S ANSWER (texture_dyn.js, dressed onto the list by txNotesBetween, so Insert writes WHAT SPACE PLAYS):
            //   `sample` (a short note, or a held one whose level does not move a written step) — B2: struck at its LADDER velocity
            //   (`velAbs`), its fader SET ONCE from the residual (`cc7Abs` lo === hi, so heldCc7 answers it whatever the height), DRAWN at
            //   its written height, a CURVE EVENT (no `plain`) so the score's map puts it on a curve channel · `follow` — struck at MF,
            //   the fader between the table values of its own two names, every breakpoint on its own value (the sequence's idiom), `velRef`
            //   the mf height · `plain` / `main` — velocity alone (`velAbs`), MAIN, as the strike writes it: no measured curve, or no
            //   curve copy for the voice. Without the helper on the page: 1c.2b's rule, as 1o.5 wrote it.
            const S = n.dyn || null, shaped = !!(S && (S.how === 'sample' || S.how === 'follow' || S.how === 'own') && S.cc7Abs);   // `own` (his "b", 2026-09-23): a set fader on the note's own channel — a curve event the score's map leaves on the voice's channel, its CC7 pre-armed there
            const yOf = h => Math.max(MIN_Y, Math.min(10, Math.round(1000 * 10 * Math.max(0, Math.min(1, h))) / 1000));
            const lv = S ? yOf(S.level < 0 ? 0 : S.level) : Math.max(0.05, Math.round(((clamp(Math.round(n.vel), 65, 127) - 65) / 62) * 100) / 10);   // 1c.2b: the drawn height MEANS the written level — (vel − 65) / 62
            const nodes = (shaped && S.how === 'follow' && !S.flat) ? S.heights.map(h => ({ pos: h[0], y: yOf(h[1]), smooth: 0.25 })) : [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }];
            const segments = []; for (let q = 1; q < nodes.length; q++) segments.push({ model: 'power', slope: 0 });
            const dynTxt = S ? ' · ' + (S.text || '') + (S.how === 'follow' ? ' (follow)' : S.how === 'sample' ? '' : S.how === 'own' ? ' (own channel)' : ' (velocity alone)') : '';
            C.objects.push(Object.assign({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: group,
                startSeconds: start, endSeconds: n.end,
                nodes: nodes, segments: segments,
                color: COLOR, fillMode: 'bottom', opacity: 0.55, properties: {}, srcKind: 'pattern',
                performanceNotes: name + (c.take ? ' · ' + c.take : '') + ' · ' + (len ? len.s + ' s' + (len.own ? ' (their own)' : '') : 'short') + dynTxt + (n.partial != null ? ' · partial ' + n.partial : '') + (n.cents ? ' · ' + (n.cents > 0 ? '+' : '') + Math.round(n.cents) + '¢ just' : ''),
                sonifyNote: n.midi, technique: n.tech, recVel: n.vel },
                S ? { velAbs: S.velAbs } : {},   // 1n.1: the note-on pinned — the ladder velocity (B2), or mf for a follow; the plain-strike fault of NITS closed for the texture
                shaped ? { cc7Abs: { lo: S.cc7Abs.lo, hi: S.cc7Abs.hi } } : {},
                (shaped && S.how === 'follow') ? { velRef: yOf(MF_LEVEL) } : {},
                (shaped || n.seat || n.cents) ? {} : { sonifyMode: 'plain' },   // 1c.3 / 1c.4, as D.insert: a seat's note or a bent note is DRAWN (its own curve channel); 1n.1: a shaped note too; the rest hold MAIN
                n.cents ? { morphBend: [[0, +(+n.cents).toFixed(2)], [dur, +(+n.cents).toFixed(2)]] } : {}));
            written++;
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: group, startSeconds: t0, endSeconds: +maxEnd.toFixed(3),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: COLOR, fillMode: 'bottom', opacity: 0.6, srcKind: 'pattern',
            performanceNotes: name + ' · on ' + doc.texture.name + ' · ' + L.dots.length + ' onsets — a PATTERN: change it in the strikes drawer and Insert again', properties: {} });
        // the document into the score file: the working copy and every named version carry it (collectData saves `databases` whole)
        if (!C.databases) C.databases = {};
        if (!Array.isArray(C.databases.patterns)) C.databases.patterns = [];
        const entry = { id, name, group, inserted: new Date().toISOString(), notes: written, t0, doc: copy(doc) };
        const k = C.databases.patterns.findIndex(x => x && x.id === id);
        if (k >= 0) C.databases.patterns[k] = entry; else C.databases.patterns.push(entry);
        C.lastInsertGroup = group;
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        if (C.curveDirty) C.curveDirty();   // THE CURVE-CHANNEL MAP IS CACHED (D11; §75 · §139): a bent or seated note is a curve event
        C.renderAll(); C.markDirty();
        this._tinsSig = ''; this.tinsPaint();
        const how = inPlace ? 're-inserted IN PLACE' : (sits != null ? 'MOVED to the playhead' : 'inserted');
        this.setStatus(how + ' · ' + written + ' notes on ' + L.dots.length + ' onsets · ' + t0.toFixed(3) + ' → ' + maxEnd.toFixed(3) + ' s as ' + group + ' · the pattern is in the score file' +
            (gone ? ' · replaced ' + gone + ' objects' + (sits != null && !inPlace ? ' at ' + sits.toFixed(3) + ' s' : '') : '') +
            (he && he.edited ? ' · ' + he.edited + ' note' + (he.edited === 1 ? '' : 's') + ' had been moved or re-pitched by hand — overwritten: the pattern is the truth' : '') +
            (he && he.missing > he.edited ? ' · ' + (he.missing - he.edited) + ' of its notes had been deleted — written again' : '') +
            (typeof this.txDynText === 'function' ? this.txDynText(L.notes) : '') +   // 1n.1: what went onto the one scale, and what stayed on velocity alone
            (busy.length ? ' · ' + busy.length + ' skipped — trilling: ' + busy.join(' ') : ''));
    },
    // REOPEN a placed pattern from the score's list: a row like any other, untitled until named; it keeps its id, so a re-insert replaces its group
    tinsReopen(id) {
        const e = this.tinsEntry(id); if (!e) { this._tinsSig = ''; this.tinsPaint(); return; }
        if (typeof this.tlibFlush === 'function') this.tlibFlush();
        const doc = copy(e.doc); if (!doc.texture) { this.setStatus('that entry has no texture in it', true); return; }
        this.txLoad(doc, null); this.txRender();
        const at = this.tinsPlacedAt(id), was = +(+e.t0 || 0).toFixed(3);
        this.setStatus('reopened "' + (e.name || id) + '" · ' + (doc.on || []).length + ' on · ' +
            (at == null ? 'its notes are no longer in the score — Insert writes it at the playhead'
                : 'it sits at ' + at.toFixed(3) + ' s' + (Math.abs(at - was) > 0.002 ? ' (moved in the score — it was inserted at ' + was.toFixed(3) + ' s)' : '') + ' — change anything, then re-insert in place'));
    },
    // the drawer's own Insert button reads for the pattern while a texture take is on; the strike's word comes back on the switch
    tinsPaint() {
        if (!this.el) return;
        const q = s => this.el.querySelector(s), on = this.txIsOn(), doc = on ? this.txPat() : null;
        const b = q('#skInsert'), mv = q('#txMove'), sel = q('#txInScore');
        if (b) {
            if (!on) { if (this._tinsSaved) { b.textContent = this._tinsSaved.text; b.title = this._tinsSaved.title; this._tinsSaved = null; } }
            else {
                if (!this._tinsSaved) this._tinsSaved = { text: b.textContent, title: b.title };
                const at = doc ? this.tinsPlacedAt(doc.id) : null;
                b.textContent = at == null ? 'Insert @ playhead' : 'Re-insert in place @ ' + at.toFixed(2) + ' s';
                b.title = at == null ? 'PLAN 1o.5: write the open PATTERN at the playhead — its range\'s left line on the playhead, only the ON marks inside it, one group and one META bar over the span — and the document into the score file'
                    : 'this pattern is in the score at ' + at.toFixed(3) + ' s (read from its META bar, so a group you dragged is found where you left it). Its notes are REPLACED IN PLACE from that start and the document updated. The document is the truth: notes changed by hand inside the group are overwritten';
                if (mv) mv.style.display = at == null ? 'none' : '';
            }
        }
        if (sel && on) {
            const L = this.tinsDb(), at = {}; L.forEach(e => { at[e.id] = this.tinsPlacedAt(e.id); });
            const sig = L.map(e => [e.id, e.name, at[e.id], e.notes, e.inserted].join('|')).join('\n') + '@' + (doc ? doc.id : '');
            if (sig !== this._tinsSig) {
                this._tinsSig = sig;
                sel.innerHTML = '<option value="">patterns in this score (' + L.length + ')</option>' + L.map(e => '<option value="' + escH(e.id) + '">' + escH(e.name || e.id) + ' · ' + (e.notes || 0) + ' notes · ' + (at[e.id] == null ? 'NOT in the score' : '@ ' + at[e.id].toFixed(1) + ' s') + '</option>').join('');
                sel.value = doc && L.some(e => e.id === doc.id) ? doc.id : '';
            }
        }
    },
});

// ---------------------------------------------------------------- the hooks
// 1 · the drawer's Insert, on a texture take, writes the pattern (texture_row's refusal of 1m.1 is inside this wrap and no longer reached)
const _insert = D.insert;
D.insert = function (replace) {
    if (this.txIsOn()) { if (replace === true || replace === 'after') { this.setStatus('a pattern is written at the playhead (or back in place) — the strike\'s other inserts are the strike\'s', true); return; } return this.tinsInsert(false); }
    return _insert.apply(this, arguments);
};
// 2 · `move to playhead` and `patterns in this score` on the pattern line
const _txEnsureUI = D.txEnsureUI;
D.txEnsureUI = function () {
    const r = _txEnsureUI.apply(this, arguments);
    const bar2 = this.el && this.el.querySelector('#txBar2');
    if (bar2 && !bar2.querySelector('#txInScore')) {
        const box = document.createElement('span'); box.style.cssText = 'display:inline-flex;align-items:center;gap:5px';
        box.innerHTML = '<button id="txMove" style="' + BTN + ';display:none" title="this pattern is in the score: write it again at the PLAYHEAD instead of back in place (its old notes go)">move to playhead</button>' +
            '<select id="txInScore" style="' + INP + ';width:170px" title="the patterns written into THIS score (the score file carries each document whole); pick one and it is back in the drawer — a row like any other, untitled until named"></select>';
        bar2.appendChild(box);
        box.querySelector('#txMove').addEventListener('click', () => this.tinsInsert(true));
        box.querySelector('#txInScore').addEventListener('change', e => { const id = e.target.value; if (id) this.tinsReopen(id); else { this._tinsSig = ''; this.tinsPaint(); } });
    }
    return r;
};
// 3 · painted after every render of the row and every switch of the source
const _txPaintPat = D.txPaintPat;
D.txPaintPat = function () { const r = _txPaintPat.apply(this, arguments); try { this.tinsPaint(); } catch (e) { console.warn('[texture_insert] paint:', e); } return r; };
const _txApply = D.txApply;
D.txApply = function () { const r = _txApply.apply(this, arguments); try { this.tinsPaint(); } catch (e) {} return r; };

root.TextureInsert = { COLOR };
}(typeof self !== 'undefined' ? self : this));
