// chord_run.js — CHORD RUN: a series of chords in a row, one per onset, each dealt over the FREE players — ONE CONSOLE LINE
// (2026-09-10 04:00; RUNNING_LOG §330; the drawer's chords mode (1k) reduced to a line, the way crescRun reduced 1o).
//
// His words: *"I just want to play a series of chords in a row evenly, use the same tool I've been using, and just have the algorithm
// reorchestrate each chord strike so it uses free players, etcetera."* — after chords mode's controls had beaten him twice in one night
// (§330 has the diagnosis). The ENGINE is 1k's own, untouched — `strike_chords.js` deal(): the free players under the re-attack rule,
// the count drawn inside his range and lowered when too few are free, the notes by register, folded into each player's range.
//
//   chordRun({ chords: 9, gap: 0.7, perChord: [4, 6], tech: 'staccato' })
//
//   chords       9 = the first nine strikes of the db (#0 … #8) · [0, 3, 5] = those strikes · [[60, 64, 67], …] = typed chords
//   gap          seconds between onsets — an even row; the count = the number of chords (or `n`)
//   n            the number of onsets (with `gap`); more onsets than chords go round the list again
//   rhythm       OR the onsets from elsewhere: 'take:NAME' = a strikes-drawer take's run (even or accelerating), rebuilt from its dials ·
//                a list of seconds · { gap0, gapN, steep | n, shape } for an accelerating row (the drawer's calculator)
//   perChord     [min, max] players per onset — the machine draws inside it and lowers when too few are free
//   players      the lanes that take part (0 flute · 1 bass cl. · 2 piano · 3 vn 1 · 4 vn 2 · 5 viola · 6 cello); default all but the piano
//   piano        true = the piano is one more player (one note in its turn); false (default) = out
//   tech         the articulation for every player: 'staccato' · 'ordinary' · 'pizzicato' … (matched against each instrument's own list;
//                the ordinary voice when it has no such thing) · or per lane { 0: 'staccato', 3: 'bartok_vel' }
//   order        'turn' (the list in order) · 'shuffled'        advance   'each' (a fresh chord every onset) · 'exhaust' · 'times'
//   selection    which notes of a chord an onset takes: 'shuffle' · 'played' · 'high' · 'low' · 'spread' (1k's vocabulary)
//   rest         seconds a player is free after its last sound ENDS (0.15)      dealer   'free' · 'robin'      seed   the shuffle
//   soundMs      one hit's length (140)      vel  the level, 1–127, translated per instrument through 1g's remap      at   seconds
//   exclude      { 1: ['va'] } — onset 1 (counting from 1) is dealt WITHOUT those players (lanes, or fl · bcl · pno · vn1 · vn2 · va · vc);
//                the count is still drawn inside perChord, the players drawn from the rest (seeded), the chord's notes by register as always
//
// goTo(575) — parks the playhead at a time in the score (seconds), the way ⌖ does for a strike; SPACE then plays from there.
//
// One group `grp-strike-chrun` (a strike pattern to fill mode), replaced by every call; `chordRun.remove()` deletes it; `chordRun.keep('name')` freezes the one he likes; the numbers of a call are remembered
// (in the browser, across reloads), so the next call can change ONE: chordRun({ gap: 0.5 }). chordRun.fresh() forgets them.
(function (root) {
'use strict';
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const SC = () => root.StrikeChords || null;
const CR = () => root.Cresc || null;
const AC = () => root.AccelCalc || null;
const GROUP = 'grp-strike-chrun';   // a grp-strike- id, so fill mode (1n) sees the run as a PATTERN it can lay crescendos on (2026-09-10 06:00)
const OLD_GROUP = 'grp-chrun';          // the id before that, replaced on the next write
const LAST_KEY = 'septet.chordRun.last.v1';
const DEFAULTS = { chords: 9, gap: 0.7, perChord: [2, 4], players: null, piano: false, tech: null, order: 'turn', advance: 'each', times: [2, 4],
                   selection: 'shuffle', rest: 0.15, dealer: 'free', seed: 1, soundMs: 140, vel: 100 };
const r3 = x => Math.round(x * 1000) / 1000;
const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteNum(x) { if (typeof x === 'number') return x; const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(String(x).trim()); if (!m) return NaN; return NAMES[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12; }
const T0 = () => (typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || []);
// lanes from numbers or names: fl · flute · bcl · bass · pno · piano · vn1 · violin1 · vn2 · violin2 · va · viola · vc · cello
function laneList(v) {
    const T = T0(); const list = Array.isArray(v) ? v : String(v).split(/[\s,]+/);
    return list.map(x => {
        if (typeof x === 'number' || /^\d+$/.test(String(x))) return +x;
        const w = String(x).toLowerCase().replace(/[^a-z0-9]/g, '');
        const i = T.findIndex(t => [String(t.short || ''), String(t.instKey || ''), String(t.id || ''), String(t.label || '')].some(s => s.toLowerCase().replace(/[^a-z0-9]/g, '') === w));
        if (i >= 0) return i;
        const alias = { bcl: 'bass_clarinet', bass: 'bass_clarinet', bassclarinet: 'bass_clarinet', pno: 'piano', vn1: 'violin1', vn2: 'violin2', va: 'viola', vc: 'cello', fl: 'flute' }[w];
        return alias ? T.findIndex(t => t.instKey === alias) : -1;
    }).filter(i => i >= 0);
}
function load(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
function save(key, v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

let dbCache = null;
async function strikesDb() { if (dbCache) return dbCache; dbCache = await fetch('/bank/scattered_strikes.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()); return dbCache; }
async function chordList(spec) {
    const CRe = CR();
    const fromStrike = s => ({ id: s.id, name: '#' + s.index, pitches: [...new Set(s.notes.map(n => n.midi))].sort((a, b) => a - b) });
    if (typeof spec === 'number') { const db = await strikesDb(); const all = Object.values(db.strikes).sort((a, b) => a.index - b.index); return all.slice(0, Math.max(1, Math.round(spec))).map(fromStrike); }
    if (Array.isArray(spec) && spec.length && !Array.isArray(spec[0]) && typeof spec[0] !== 'string') { const db = await strikesDb(); const all = Object.values(db.strikes); return spec.map(i => all.find(s => s.index === +i)).filter(Boolean).map(fromStrike); }
    if (Array.isArray(spec)) return spec.map((p, k) => { const list = (Array.isArray(p) ? p : String(p).split(/[\s,]+/)).map(noteNum).filter(x => isFinite(x)); return list.length ? { id: 'typed-' + (k + 1), name: 'typed ' + (k + 1) + ' (' + list.map(m => CRe ? CRe.nm(m) : m).join(' ') + ')', pitches: [...new Set(list)].sort((a, b) => a - b) } : null; }).filter(Boolean);
    return [];
}

// the players the engine deals to: each lane with its technique and that technique's range — the drawer's chordPlayers(), mirrored
function playersFor(o) {
    const C = C_(), T = (typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || []);
    let lanes = Array.isArray(o.players) && o.players.length ? o.players.map(Number) : T.map((t, i) => i).filter(i => T[i].instKey !== 'piano');
    const pianoLane = T.findIndex(t => t.instKey === 'piano');
    if (o.piano && pianoLane >= 0 && !lanes.includes(pianoLane)) lanes = lanes.concat([pianoLane]);
    if (!o.piano && !(Array.isArray(o.players) && o.players.includes(pianoLane))) lanes = lanes.filter(l => l !== pianoLane);
    return lanes.map(lane => {
        const inst = C.trackInstrument(lane); if (!inst) return null;
        const techs = inst.techniques || [];
        const want = o.tech && typeof o.tech === 'object' ? o.tech[lane] : o.tech;
        let tech = null;
        if (want) {
            const w = String(want).toLowerCase();
            // the exact key first, then the plain velocity voice of that name (stac_vel before stac_vel_mwshape — his AB1-b rows), then the label, then a key prefix
            tech = techs.find(x => String(x.key).toLowerCase() === w)
                || techs.find(x => String(x.key).toLowerCase() === w.slice(0, 4) + '_vel')
                || techs.find(x => /^(.+) velocity( \(#\d+\))?$/i.test(String(x.label || '')) && String(x.label || '').toLowerCase().indexOf(w) === 0)
                || techs.find(x => String(x.label || '').toLowerCase().indexOf(w) >= 0)
                || techs.find(x => String(x.key).toLowerCase().indexOf(w.slice(0, 4)) === 0) || null;
            if (!tech && /^ord/.test(w)) tech = C.ordinaryTech(lane);
        }
        if (!tech) tech = C.ordinaryTech(lane) || techs[0] || null;
        if (!tech) return null;
        const lo = tech.rangeLow != null ? tech.rangeLow : (inst.rangeLow != null ? inst.rangeLow : 21);
        const hi = tech.rangeHigh != null ? tech.rangeHigh : (inst.rangeHigh != null ? inst.rangeHigh : 108);
        return { lane, tech: tech.key, techLabel: tech.label || tech.key, label: (T[lane] || {}).short || ('lane ' + lane), lo, hi, instKey: (T[lane] || {}).instKey, asked: !!want && !!tech && (String(tech.key).toLowerCase() === String(want).toLowerCase() || String(tech.label || '').toLowerCase().indexOf(String(want).toLowerCase()) >= 0) };
    }).filter(Boolean);
}

async function onsetsFor(o) {
    const A = AC();
    if (typeof o.rhythm === 'string' && /^take:/.test(o.rhythm)) {
        if (!root.crescRun || !root.crescRun.takeOnsets) throw new Error('cresc_run.js is needed for a take\'s rhythm');
        const R = await root.crescRun.takeOnsets(o.rhythm.slice(5).trim());
        return { onsets: R.onsets, label: R.label };
    }
    if (Array.isArray(o.rhythm) && o.rhythm.length) { const on = o.rhythm.map(Number).filter(isFinite).sort((a, b) => a - b); return { onsets: on.map(t => t - on[0]), label: 'a list of ' + on.length + ' onsets' }; }
    if (o.rhythm && typeof o.rhythm === 'object') {
        const r = o.rhythm; const spec = { shape: r.shape || 'geometric', gapStart: (r.gap0 || 1) * 1000, gapEnd: (r.gapN || r.gap0 || 1) * 1000, length: r.n != null ? { count: r.n } : { ratio: r.steep != null ? r.steep : 0.85 }, hold: { gaps: r.hold || 0 }, curve: r.curve, ease: r.ease, knee: r.knee, gamma: r.gamma };
        const R = A.run(spec); return { onsets: R.onsets.map(ms => ms / 1000), label: R.shape + ' ' + (r.gap0 || 1) + ' → ' + (r.gapN || r.gap0 || 1) + ' s, ' + R.notes + ' onsets' };
    }
    const n = Math.max(1, Math.round(o.n != null ? +o.n : (o._chordCount || 1)));
    const gap = Math.max(0.02, +o.gap || DEFAULTS.gap);
    return { onsets: Array.from({ length: n }, (_, i) => r3(i * gap)), label: 'even, ' + n + ' onsets ' + gap + ' s apart' };
}

function resolve(opts) {
    opts = opts || {};
    const o = Object.assign({}, DEFAULTS, chordRun.last || {}, opts);
    if ('gap' in opts || 'n' in opts) { if (!('rhythm' in opts)) delete o.rhythm; }
    if ('rhythm' in opts && opts.rhythm == null) delete o.rhythm;
    return o;
}

async function chordRun(opts) {
    const C = C_(), S = SC(), CRe = CR();
    if (!C || !S || !CRe || !AC()) { console.error('[chordRun] needs the score, strike_chords.js, cresc.js and accel_calc.js'); return null; }
    const o = resolve(opts);
    chordRun.last = Object.assign({}, o); save(LAST_KEY, chordRun.last);
    try {
        const chords = await chordList(o.chords);
        if (!chords.length) { console.error('[chordRun] no chords — chords: 9 (the first nine strikes), [0, 3, 5], or [[60, 64, 67]]'); return null; }
        o._chordCount = chords.length;
        const R = await onsetsFor(o);
        const onsetsMs = R.onsets.map(s => s * 1000);
        const players = playersFor(o);
        if (!players.length) { console.error('[chordRun] no players'); return null; }
        const realize = (pitch, p) => { const f = CRe.foldInto(pitch, p.lo, p.hi); return f ? { midi: f.pitch, fold: f.fold || 0, standIn: false } : null; };
        // exclude: an onset dealt without some players — a pinned onset for the engine (1k's manual path), its players drawn here, seeded,
        // from the rest, its count drawn inside perChord; the engine then gives them the chord's notes by register and marks them busy
        const manual = {}; const excluded = [];
        if (o.exclude && typeof o.exclude === 'object') {
            const rnd = S.mulberry32((+o.seed || 1) * 131 + 7), mn = +(o.perChord || [2, 4])[0], mx = +(o.perChord || [2, 4])[1];
            Object.keys(o.exclude).forEach(k => {
                const i = Math.max(0, Math.round(+k) - 1); const ex = laneList(o.exclude[k]);
                const allowed = players.filter(p => !ex.includes(p.lane)); if (!allowed.length) return;
                const want = Math.min(mx, Math.max(mn, mn + Math.floor(rnd() * (mx - mn + 1)))), n = Math.min(want, allowed.length);
                manual[i] = { count: n, players: S.shuffled(allowed, rnd).slice(0, n).map(p => p.lane) };
                excluded.push('onset ' + (i + 1) + ' without ' + ex.map(l => (T0()[l] || {}).short || l).join(' '));
            });
        }
        const res = S.deal(onsetsMs, chords, players, {
            order: o.order, advance: o.advance, timesMin: +(o.times || [2, 4])[0], timesMax: +(o.times || [2, 4])[1], selection: o.selection,
            countMin: +(o.perChord || [2, 4])[0], countMax: +(o.perChord || [2, 4])[1], reattackMs: Math.round((+o.rest || 0.15) * 1000), dealer: o.dealer, seed: +o.seed || 1,
            soundMs: +o.soundMs || 140,
        }, realize, Object.keys(manual).length ? manual : null);
        // ---- write, as the drawer's insert writes a strike
        const t0 = o.at != null ? +o.at : +C.getTimeAtPlayhead().toFixed(3);
        // the place is remembered like every other number: the next line lands HERE, not wherever playback left the playhead
        // (2026-09-10 05:20, "it moved all of the notes, 578.75") — goTo(...) or at: ... moves it
        chordRun.last.at = t0; save(LAST_KEY, chordRun.last);
        const T = (typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || []);
        const ML = (typeof META_LAYER !== 'undefined') ? META_LAYER : root.META_LAYER;
        const D = root.StrikeDrawer;
        const remap = (lane, midi, a) => (D && typeof D.remapVel === 'function') ? D.remapVel(lane, midi, a) : a;
        C.pushUndoState();
        const before = C.objects.length;
        C.objects = C.objects.filter(x => x.groupId !== GROUP && x.groupId !== OLD_GROUP);
        const replaced = before - C.objects.length;
        const dur = Math.max(0.03, (+o.soundMs || 140) / 1000);
        let maxEnd = t0, written = 0; const rows = [];
        res.events.forEach(e => {
            const at = r3(t0 + e.t / 1000);
            const parts = [];
            e.notes.forEach(n => {
                const vel = Math.max(1, Math.min(127, Math.round(remap(n.lane, n.midi, +o.vel || 100))));
                const lv = Math.max(1, Math.round((vel / 127) * 100) / 10);
                C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: GROUP,
                    startSeconds: at, endSeconds: r3(at + dur),
                    nodes: [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
                    color: '#C9A05A', fillMode: 'bottom', opacity: 0.55,
                    performanceNotes: 'chord run ' + (e.i + 1) + '/' + res.events.length + ' · ' + e.chordName + (n.fold ? ' (folded ' + n.fold + ')' : ''),
                    properties: { chordRun: { i: e.i, chordId: e.chordId, chordName: e.chordName, pitch: n.pitch, fold: n.fold } }, srcKind: 'strike',
                    sonifyNote: n.midi, technique: n.tech, sonifyMode: 'plain', recVel: vel });
                parts.push((T[n.lane] || {}).short + ':' + CRe.nm(n.midi));
                maxEnd = Math.max(maxEnd, at + dur); written++;
            });
            rows.push({ n: e.i + 1, at, chord: e.chordName, players: e.count + (e.lowered ? ' (lowered)' : '') + (e.flagged ? ' ✗' : ''), notes: parts.join(' ') });
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: GROUP, startSeconds: t0, endSeconds: r3(maxEnd),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: '#C9A05A', fillMode: 'bottom', opacity: 0.6, performanceNotes: 'chord run (drag = move, box = stretch) — ' + JSON.stringify(opts || {}), properties: { chordRun: o } });
        C.lastInsertGroup = GROUP;
        C.renderAll(); C.markDirty(); if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();
        const techs = players.map(p => p.label + ' ' + p.techLabel + (o.tech && !p.asked ? ' (no such voice — its ordinary one)' : '')).join(' · ');
        const text = res.events.length + ' chords at ' + t0.toFixed(2) + ' s · ' + R.label + ' · ' + written + ' notes · ' + S.describe(res)
            + ' · chords ' + chords.map(c => c.name).join(' ') + ' in ' + (o.order === 'shuffled' ? 'shuffled order' : 'turn')
            + ' · ' + techs + (excluded.length ? ' · ' + excluded.join(', ') : '') + (replaced ? ' · replaced the previous run' : '') + ' — SPACE plays from the playhead · CTRL+Z undoes';
        console.log('%c[chordRun] ' + text, 'color:#e8cf9a');
        console.table(rows);
        if (C.saveStatus) C.saveStatus.textContent = text;
        return { text, events: res.events, rows, chords, players, onsets: R.onsets, spec: o, group: GROUP };
    } catch (e) { console.error('[chordRun] ' + e.message); return null; }
}
chordRun.keep = function (name) {
    const C = C_(); if (!C) return null;
    const tag = 'grp-strike-chrun-kept-' + (name ? String(name).replace(/[^A-Za-z0-9_-]+/g, '-') : Date.now().toString(36));
    let n = 0; C.objects.forEach(x => { if (x.groupId === GROUP || x.groupId === OLD_GROUP) { x.groupId = tag; n++; } });
    if (!n) { console.warn('[chordRun] nothing to keep — write a run first'); return null; }
    C.markDirty(); C.renderAll();
    console.log('%c[chordRun] kept ' + n + ' objects as ' + tag + ' — the next call starts a new run', 'color:#e8cf9a');
    return tag;
};
chordRun.remove = function (name) {   // the working run, or a kept one by name — CTRL+Z brings it back
    const C = C_(); if (!C) return 0;
    const ids = name ? ['grp-strike-chrun-kept-' + String(name).replace(/[^A-Za-z0-9_-]+/g, '-')] : [GROUP, OLD_GROUP];
    C.pushUndoState(); const n = C.objects.length; C.objects = C.objects.filter(x => !ids.includes(x.groupId)); C.renderAll(); C.markDirty();
    console.log('[chordRun] removed ' + (n - C.objects.length) + ' objects (' + ids.join(', ') + ') — CTRL+Z brings them back'); return n - C.objects.length;
};
chordRun.fresh = function () { chordRun.last = null; save(LAST_KEY, null); console.log('[chordRun] forgot the last settings — the defaults apply'); };
chordRun.DEFAULTS = DEFAULTS; chordRun.GROUP = GROUP; chordRun.last = load(LAST_KEY);
root.chordRun = chordRun;
// goTo(575): the playhead parked at a time, as the drawer's ⌖ parks it on a strike's original time (the score scrolls; the playhead is the fixed line)
root.goTo = function (seconds) {
    const C = C_(); if (!C) return null;
    if (C.isPlaying) { console.warn('[goTo] stop first'); return null; }
    const t = Math.max(0, +seconds || 0);
    C.scrollOffset = t * C.pixelsPerSecond; if (typeof C.applyScroll === 'function') C.applyScroll();
    const now = +C.getTimeAtPlayhead().toFixed(3);
    // goTo is "this is where I am working": the next chordRun / crescRun line lands here
    if (root.chordRun) { root.chordRun.last = Object.assign({}, root.chordRun.last || {}, { at: now }); save(LAST_KEY, root.chordRun.last); }
    if (root.crescRun && root.crescRun.last) { root.crescRun.last.at = now; try { localStorage.setItem('septet.crescRun.last.v1', JSON.stringify(root.crescRun.last)); } catch (e) {} }
    console.log('%c[goTo] playhead at ' + now.toFixed(2) + ' s — SPACE plays from here; the next chordRun / crescRun line lands here', 'color:#e8cf9a');
    if (C.saveStatus) C.saveStatus.textContent = 'playhead at ' + now.toFixed(2) + ' s';
    return now;
};
// … and in the score itself (his 2026-09-10 09:40: "I thought we were adding something to the main score like maybe double click the main
// time display?"): DOUBLE-CLICK the floating time readout → type a time (575 · 9:35 · 9:35.5) → ENTER goes there; ESC or a click away cancels
function installGoToBox() {
    const ft = document.getElementById('floatingTime'); if (!ft || ft.dataset.goto) return;
    ft.dataset.goto = '1';
    ft.title = (ft.title ? ft.title + ' · ' : '') + 'double-click: go to a time (575, or 9:35)';
    ft.addEventListener('dblclick', ev => {
        ev.preventDefault(); ev.stopPropagation();
        const C = C_(); if (!C) return;
        if (C.isPlaying) { if (C.saveStatus) C.saveStatus.textContent = 'stop first'; return; }
        const old = document.getElementById('goToBox'); if (old) old.remove();
        const r = ft.getBoundingClientRect();
        const inp = document.createElement('input');
        inp.id = 'goToBox'; inp.value = (+C.getTimeAtPlayhead()).toFixed(2);
        inp.title = 'seconds (575) or minutes:seconds (9:35) — ENTER goes there, ESC cancels';
        inp.style.cssText = 'position:fixed;z-index:10000;left:' + Math.round(r.left) + 'px;top:' + Math.round(r.top) + 'px;width:' + Math.max(90, Math.round(r.width)) + 'px;height:' + Math.max(28, Math.round(r.height)) + 'px;background:#1b1b20;color:#e8cf9a;border:2px solid #e8cf9a;border-radius:4px;font:bold 16px/1.2 monospace;text-align:center;outline:none';
        ['mousedown', 'mouseup', 'click', 'dblclick', 'keydown', 'keyup', 'keypress'].forEach(t => inp.addEventListener(t, e => e.stopPropagation()));
        const parse = s => { s = String(s || '').trim(); const m = /^(\d+):(\d+(?:\.\d+)?)$/.exec(s); if (m) return (+m[1]) * 60 + (+m[2]); const n = parseFloat(s); return isFinite(n) ? n : null; };
        // removing the box fires its own blur, and the blur handler must not remove it again (found on the walk: a real ENTER threw and never went)
        let closed = false;
        const done = go => {
            if (closed) return; closed = true;
            const v = inp.value; inp.removeEventListener('blur', onBlur); inp.remove();
            if (!go) return;
            const t = parse(v);
            if (t == null) { if (C.saveStatus) C.saveStatus.textContent = 'not a time: "' + v + '" — 575, or 9:35'; return; }
            root.goTo(t);
        };
        const onBlur = () => done(false);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(true); } else if (e.key === 'Escape') { e.preventDefault(); done(false); } });
        inp.addEventListener('blur', onBlur);
        document.body.appendChild(inp); inp.focus(); inp.select();
    });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installGoToBox); else installGoToBox();
}(typeof self !== 'undefined' ? self : this));
