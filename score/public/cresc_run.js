// cresc_run.js — CRESC RUN: a set of overlapping crescendos whose onsets accelerate and whose lengths shorten — ONE LINE PER VERSION
// (CN-59, 2026-09-09 evening; RUNNING_LOG §325–327).
//
// His words: *"The first gesture in my third section for this piece will be a set of overlapping crescendos. They'll go from PPP to FFF,
// and their onsets will accelerate. And their durations will shorten each new onset. The issue is I don't have the specs. I don't know
// what those are yet. So I need to hear a few versions … and then settle on the one I want."* — and, on the drawer: *"everything I want
// to set is so difficult to find … We could just do it in the save score, and you could perhaps give me a console script every time."*
//
// So: no panel. In the score's console (F12 → Console), one line writes the gesture at the playhead as one group; SPACE plays it (the
// score's own playback — the crescendo's CC7 ramp on the curve channels, 1l); the next line REPLACES it; `crescRun.keep()` freezes the
// one he likes so the next line starts a new one beside it. Every number is a plain option:
//
//   crescRun({ gap0: 2, gapN: 0.5, steep: 0.85, len: 2 })
//
//   gap0 · gapN    the first and the last gap between onsets, in SECONDS (attack to attack, whoever plays)
//   steep          each gap as a fraction of the one before (0.85 = a steady push; 0.7 = a rush) — the count follows
//   n              OR the number of onsets (then steep follows)
//   shape          'geometric' (default) · 'curve' (+ curve −1…1: bloom … surge) · 's' (+ ease) · 'twoPhase' (+ knee) · 'lateRush' (+ gamma) · 'even'
//   hold           extra onsets at the last gap after the ramp
//   rhythm         OR the onsets from elsewhere, and the four above are ignored: 'take:NAME' = a strikes-drawer take's accel run, rebuilt
//                  from its dials exactly as the drawer builds it (his 2026-09-09 late: "I want you to use these rhythms") · or a list of
//                  seconds from the first onset: [0, 0.7, 1.3, …]
//   len            each crescendo's length as a MULTIPLE of the gap to the next onset (2 = twice the gap: they shorten with the rush)
//   lenS           OR one fixed length in seconds for all of them
//   lenN · lenSN   the same two, at the END of the run — a ramp: len 2 → lenN 4 makes the overlap grow; lenS 2.2 → lenSN 1.4 in seconds
//   dyn            ['ppp', 'fff'] — from → to (ppp pp p mp mf f ff fff)
//   secco          true (the cut at the end) · false (let it ring)
//   players        the lanes, in the order of the round robin (0 flute · 1 bass cl. · 2 piano · 3 vn 1 · 4 vn 2 · 5 viola · 6 cello)
//   pitches        'from Bb3' = chromatic upward from there, one per onset, on and on as the players come round · { from: 'Bb3', step: 2 }
//                  for another interval · a list of notes or MIDI numbers dealt in turn · 'keyboard' = what the strikes drawer holds
//   at             seconds
//
// THE STANDING SETTINGS (his 2026-09-09 late, for the section-3 gesture): *"always five seventy five for this one. Always that order of
// instruments, always those pitches starting for b flat three going up."* — `crescRun.profiles.s3` = at 575 · bass clarinet, cello, viola,
// violin 2, violin 1, flute, wrapping · chromatic from Bb3. It is the base of every call (a line only ever overrides it), and it survives
// a reload, as do the numbers of the last call (`crescRun.last`, kept in the browser). `crescRun.fresh()` forgets the last numbers only.
//
// A crescendo can never run into that player's next sound: its length is capped 0.17 s before it (1l's end rule), and it is never
// shorter than 0.30 s (the floor) — the readout says how many were capped or floored.
(function (root) {
'use strict';
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const CR = () => root.Cresc || null;
const AC = () => root.AccelCalc || null;
const GROUP = 'grp-crun';                                   // the working run's group — replaced by every call
const LAST_KEY = 'septet.crescRun.last.v1', PROFILE_KEY = 'septet.crescRun.profile.v1';
const DEFAULTS = { gap0: 2, gapN: 0.5, steep: 0.85, shape: 'geometric', hold: 0, len: 2, dyn: ['ppp', 'fff'], secco: true,
                   players: [0, 1, 3, 4, 5, 6], pitches: [41, 48, 55, 62, 69, 76] };
const PROFILES = {
    s3: { at: 575, players: [1, 6, 5, 4, 3, 0], pitches: 'from Bb3' },   // the section-3 gesture: his standing order and pitches (2026-09-09)
};
const r3 = x => Math.round(x * 1000) / 1000;
const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteNum(x) {
    if (typeof x === 'number') return x;
    const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(String(x).trim()); if (!m) return NaN;
    return NAMES[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
}
function load(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
function save(key, v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

// the pitch pool: a function of the onset index, so a chromatic climb never runs out
function pitchAt(p) {
    if (p === 'keyboard') {
        const D = root.StrikeDrawer;
        const vs = D && D.voices && D.voices.length ? D.voices.map(v => v.pitch) : null;
        if (!vs) { console.warn('[crescRun] the strikes drawer holds nothing — using the default stack'); return i => DEFAULTS.pitches[i % DEFAULTS.pitches.length]; }
        return i => vs[i % vs.length];
    }
    const climb = (fromStr, step) => { const f = noteNum(fromStr); if (!isFinite(f)) return null; const s = isFinite(+step) && +step !== 0 ? +step : 1; return i => f + i * s; };
    if (p && typeof p === 'object' && !Array.isArray(p) && p.from != null) { const g = climb(p.from, p.step); if (g) return g; }
    if (typeof p === 'string') { const m = /^\s*(?:up\s+)?from\s+([A-Ga-g](?:#|b)?-?\d)(?:\s+by\s+(-?\d+))?\s*$/i.exec(p); if (m) { const g = climb(m[1], m[2]); if (g) return g; } p = p.split(/[\s,]+/); }
    const list = (Array.isArray(p) ? p : [p]).map(noteNum).filter(x => isFinite(x));
    const L = list.length ? list : DEFAULTS.pitches.slice();
    return i => L[i % L.length];
}
function describePitches(p) {
    if (p === 'keyboard') return 'the drawer\'s keyboard';
    if (p && typeof p === 'object' && !Array.isArray(p) && p.from != null) return 'from ' + p.from + (p.step && +p.step !== 1 ? ' by ' + p.step : '') + ' upward';
    if (typeof p === 'string' && /from/i.test(p)) return p.replace(/^\s*up\s+/i, '') + ' upward';
    return 'dealt in turn';
}

// a strikes-drawer take's accel run, rebuilt from its dials the way the drawer does (strike_drawer.js accelSpec — mirrored, not shared,
// because the drawer's function reads its live cfg); the onsets in ms
function specFromTakeCfg(c) {
    const blank = v => v === '' || v == null;
    const lenBy = (c.aShape === 'even' && c.aLen !== 'count') ? 'duration' : c.aLen;
    const L = lenBy === 'count' ? { count: +c.aCount || 2 } : lenBy === 'duration' ? { duration: +c.aDur || 1 } : { ratio: +c.aRatio || 0.85 };
    return { gapStart: Math.max(1, +c.aFirst || 1), gapEnd: Math.max(1, +c.aFloor || 45), length: L, shape: c.aShape || 'geometric',
             curve: +c.aCurve || 0, ease: +c.aEase || 2, knee: +c.aKnee || 0, gamma: +c.aGamma || 2,
             jitter: { pct: +c.aJit || 0, pctEnd: blank(c.aJitEnd) ? null : +c.aJitEnd, seed: +c.aSeed || 1 },
             hold: { gaps: +c.aHold || 0 }, mirror: !!c.aMirror,
             level: (!blank(c.aVel0) && !blank(c.aVel1)) ? { start: +c.aVel0, end: +c.aVel1, curve: +c.aVelCurve || 0 } : null };
}
async function onsetsFromTake(name) {
    const file = await fetch('/api/snapshots', { cache: 'no-store' }).then(x => x.json());
    const t = file && file.panels && file.panels.strikes && file.panels.strikes[name];
    if (!t) throw new Error('no strikes take named "' + name + '"');
    const c = (t.state && t.state.cfg) || {};
    if (c.shape !== 'accel') throw new Error('take "' + name + '" is not an accel run (its shape is ' + (c.shape || 'as played') + ') — only a run can be rebuilt from its dials');
    const spec = specFromTakeCfg(c);
    const R = AC().run(spec);
    return { onsets: R.onsets.map(ms => ms / 1000), gaps: R.gaps.map(ms => ms / 1000),
             label: 'take ' + name + ' (' + R.shape + (spec.shape === 'curve' ? ' ' + (+spec.curve).toFixed(2) : '') + ', ' + R.notes + ' onsets, ' + Math.round(spec.gapStart) + ' → ' + Math.round(spec.gapEnd) + ' ms' + (t.comment ? '; ' + t.comment : '') + ')' };
}

function resolveOptions(opts) {
    opts = opts || {};
    const profile = PROFILES[crescRun.profile] || {};
    const last = crescRun.last || {};
    const o = Object.assign({}, DEFAULTS, profile, last, opts);
    // n and steep are two ways of saying one thing: the one given in THIS call wins; else the one the last call used
    if ('n' in opts) { delete o.steep; } else if ('steep' in opts) { delete o.n; }
    if ('rhythm' in opts && opts.rhythm == null) delete o.rhythm;   // rhythm: null goes back to the numbers
    if ('gap0' in opts || 'gapN' in opts || 'steep' in opts || 'n' in opts || 'shape' in opts) { if (!('rhythm' in opts)) delete o.rhythm; }   // a number for the run puts the take away
    if ('lenS' in opts || 'lenSN' in opts) { delete o.len; delete o.lenN; if (o.lenS == null) o.lenS = o.lenSN; }
    else if ('len' in opts || 'lenN' in opts) { delete o.lenS; delete o.lenSN; if (o.len == null) o.len = DEFAULTS.len; }
    if (o.steep == null && o.n == null) o.steep = DEFAULTS.steep;
    if (o.n != null && !('steep' in opts)) delete o.steep;
    if (o.len == null && o.lenS == null) o.len = DEFAULTS.len;
    return o;
}

function write(o, R) {
    const C = C_(), CRe = CR();
    const onsets = R.onsets, N = onsets.length;
    const t0 = o.at != null ? +o.at : +C.getTimeAtPlayhead().toFixed(3);
    if (crescRun.last) { crescRun.last.at = t0; save(LAST_KEY, crescRun.last); }   // the place is remembered: the next line lands here, not where playback left the playhead (§332)
    const lanes = (o.players || DEFAULTS.players).map(Number).filter(l => l >= 0 && C.trackInstrument(l));
    if (!lanes.length) { console.error('[crescRun] no playable lanes in players'); return null; }
    const pitch = pitchAt(o.pitches);
    const dynLo = CRe.dynHeight(Array.isArray(o.dyn) ? o.dyn[0] : 'ppp'), dynHi = CRe.dynHeight(Array.isArray(o.dyn) ? o.dyn[1] : 'fff');
    C.pushUndoState();
    const before = C.objects.length;
    C.objects = C.objects.filter(x => x.groupId !== GROUP);
    const replaced = before - C.objects.length;
    const ML = (typeof META_LAYER !== 'undefined') ? META_LAYER : root.META_LAYER;
    const T = (typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || []);
    // the plan: onset i → lane (round robin) → pitch (the pool at i, folded into the player's range: crescFold gives { pitch, fold } or null)
    const plan = onsets.map((t, i) => ({ i, at: r3(t0 + t), lane: lanes[i % lanes.length], gap: i < N - 1 ? onsets[i + 1] - t : (i > 0 ? t - onsets[i - 1] : (o.gap0 || 1)) }));
    plan.forEach(p => {
        const raw = pitch(p.i); const f = C.crescFold(raw, p.lane);
        if (f && f.pitch != null) { p.pitch = f.pitch; p.fold = f.fold; p.raw = raw; }
        else { const g = C.crescFold(60, p.lane); p.pitch = g && g.pitch != null ? g.pitch : 60; p.raw = raw; p.unreachable = true; }
    });
    const made = [], capped = [], floored = [];
    let maxEnd = t0;
    plan.forEach(p => {
        const later = C.objects.filter(x => x.layer === p.lane && x.sonifyNote != null && x.layer !== ML)
            .concat(plan.filter(q => q.lane === p.lane && q.at > p.at + 1e-6).map(q => ({ startSeconds: q.at })));
        // the length, and its ramp along the run: a multiple of the gap, len → lenN, or seconds, lenS → lenSN — linear over the onsets
        const p01 = N > 1 ? p.i / (N - 1) : 0;
        const want = o.lenS != null
            ? (o.lenSN != null ? +o.lenS + (+o.lenSN - +o.lenS) * p01 : +o.lenS)
            : ((o.lenN != null ? +o.len + (+o.lenN - +o.len) * p01 : +o.len) * p.gap);
        const e = CRe.endFor(p.at, later, {});
        let dur = want;
        if (e.how === 'toNextNote' && e.end - p.at < want) { dur = e.end - p.at; capped.push(p.i); }
        if (dur < CRe.DEFAULTS.minS) { dur = CRe.DEFAULTS.minS; floored.push(p.i); }
        const tech = C.ordinaryTech(p.lane) || {};
        const wc = CRe.make(p.at, p.pitch, { lane: p.lane, tech: tech.key, label: (T[p.lane] || {}).short }, [], { durS: dur, dynLo, dynHi, secco: o.secco !== false });
        if (!wc) return;
        wc.id = 'wc-' + (C.nextId++);
        wc.groupId = GROUP;
        wc.properties.cresc.end = 'run';
        wc.properties.cresc.run = { i: p.i, of: N, gapS: r3(p.gap), len: o.lenS != null ? null : o.len, lenS: o.lenS != null ? o.lenS : null, capped: capped.includes(p.i), raw: p.raw, rhythm: R.label || null };
        wc.performanceNotes = 'cresc ' + wc.properties.cresc.shape + ' ' + wc.properties.cresc.ratio + '× ' + CRe.dynName(dynLo) + '→' + CRe.dynName(dynHi) + ' ' + dur.toFixed(2) + ' s (cresc run ' + (p.i + 1) + '/' + N + ')';
        maxEnd = Math.max(maxEnd, p.at + dur);
        C.objects.push(wc);
        made.push({ i: p.i, at: p.at, lane: p.lane, pitch: p.pitch, dur: r3(dur), gap: r3(p.gap), unreachable: !!p.unreachable });
    });
    C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: GROUP,
        startSeconds: t0, endSeconds: r3(maxEnd),
        nodes: [{ pos: 0, y: 7.8, smooth: 0 }, { pos: 1, y: 7.8, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
        color: '#C2410C', fillMode: 'bottom', opacity: 0.5, performanceNotes: 'cresc run (drag = move, box = stretch) — ' + JSON.stringify(o), properties: { crescRun: o } });
    C.lastInsertGroup = GROUP;
    C.curveDirty(); C.renderAll(); C.markDirty(); if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();

    // the readout: what was written, and how thick it is
    const voicesAt = t => made.filter(m => m.at <= t && t < m.at + m.dur).length;
    const samples = []; for (let t = t0; t < maxEnd; t += 0.05) samples.push(voicesAt(t));
    const avg = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0, peak = samples.length ? Math.max(...samples) : 0;
    const gaps = R.gaps;
    const unreachable = made.filter(m => m.unreachable).length;
    const text = made.length + ' crescendos over ' + r3(maxEnd - t0) + ' s at ' + t0.toFixed(2) + ' s · gaps ' + gaps[0].toFixed(2) + ' → ' + gaps[gaps.length - 1].toFixed(2) + ' s (' + (R.label || (R.shape + (o.n != null ? ', ' + N + ' onsets' : ', steep ' + (+o.steep).toFixed(2)))) + ')'
        + ' · lengths ' + made[0].dur.toFixed(2) + ' → ' + made[made.length - 1].dur.toFixed(2) + ' s · ' + CRe.dynName(dynLo) + '→' + CRe.dynName(dynHi) + (o.secco === false ? ' · no secco' : ' · secco')
        + ' · players ' + lanes.map(l => (T[l] || {}).short || l).join(' ') + ' wrapping · pitches ' + describePitches(o.pitches)
        + ' · ' + avg.toFixed(1) + ' voices sounding, peak ' + peak
        + (capped.length ? ' · ' + capped.length + ' capped at the player\'s next entry' : '') + (floored.length ? ' · ' + floored.length + ' at the 0.30 s floor' : '')
        + (unreachable ? ' · ' + unreachable + ' pitch' + (unreachable > 1 ? 'es' : '') + ' out of the player\'s reach (C4 used)' : '')
        + (replaced ? ' · replaced the previous run' : '') + ' — SPACE plays from the playhead · CTRL+Z undoes';
    console.log('%c[crescRun] ' + text, 'color:#e8a06a');
    console.table(made.map(m => ({ n: m.i + 1, at: m.at, player: (T[m.lane] || {}).short || m.lane, pitch: CRe.nm(m.pitch), gap: m.gap, length: m.dur })));
    if (C.saveStatus) C.saveStatus.textContent = text;
    return { text, made, onsets, spec: o, group: GROUP };
}

function crescRun(opts) {
    const C = C_(), CRe = CR(), A = AC();
    if (!C || !CRe || !A) { console.error('[crescRun] needs the score, cresc.js and accel_calc.js'); return null; }
    const o = resolveOptions(opts);
    crescRun.last = Object.assign({}, o); save(LAST_KEY, crescRun.last);
    // the onsets: from a take, from a list, or from the numbers through the drawer's own acceleration calculator (1h)
    if (typeof o.rhythm === 'string' && /^take:/.test(o.rhythm)) {
        return onsetsFromTake(o.rhythm.slice(5).trim()).then(R => write(o, R)).catch(e => { console.error('[crescRun] ' + e.message); return null; });
    }
    let R;
    if (Array.isArray(o.rhythm) && o.rhythm.length) {
        const on = o.rhythm.map(Number).filter(isFinite).sort((a, b) => a - b); const t0 = on[0];
        const onsets = on.map(t => t - t0);
        R = { onsets, gaps: onsets.slice(1).map((t, i) => t - onsets[i]), shape: 'list', label: 'a list of ' + onsets.length + ' onsets' };
        if (!R.gaps.length) R.gaps = [o.gap0 || 1];
    } else {
        const spec = { shape: o.shape, gapStart: o.gap0 * 1000, gapEnd: o.gapN * 1000, length: o.n != null ? { count: o.n } : { ratio: o.steep },
                       hold: { gaps: o.hold || 0 }, curve: o.curve, ease: o.ease, knee: o.knee, gamma: o.gamma };
        const r = A.run(spec);
        R = { onsets: r.onsets.map(ms => ms / 1000), gaps: r.gaps.map(ms => ms / 1000), shape: r.shape, label: null };
    }
    return write(o, R);
}
// freeze the current run under its own group, so the next call writes a new one beside it
crescRun.keep = function (name) {
    const C = C_(); if (!C) return null;
    const tag = 'grp-crun-kept-' + (name ? String(name).replace(/[^A-Za-z0-9_-]+/g, '-') : Date.now().toString(36));
    let n = 0; C.objects.forEach(x => { if (x.groupId === GROUP) { x.groupId = tag; n++; } });
    if (!n) { console.warn('[crescRun] nothing to keep — write a run first'); return null; }
    C.markDirty(); C.renderAll();
    console.log('%c[crescRun] kept ' + n + ' objects as ' + tag + ' — the next call starts a new run', 'color:#e8a06a');
    return tag;
};
crescRun.remove = function (name) {   // the working run, or a kept one by name — CTRL+Z brings it back
    const C = C_(); if (!C) return 0;
    const id = name ? 'grp-crun-kept-' + String(name).replace(/[^A-Za-z0-9_-]+/g, '-') : GROUP;
    C.pushUndoState(); const n = C.objects.length; C.objects = C.objects.filter(x => x.groupId !== id); C.renderAll(); C.markDirty();
    console.log('[crescRun] removed ' + (n - C.objects.length) + ' objects (' + id + ') — CTRL+Z brings them back'); return n - C.objects.length;
};
crescRun.fresh = function () { crescRun.last = null; save(LAST_KEY, null); console.log('[crescRun] forgot the last settings — the profile and the defaults apply'); };
crescRun.use = function (name) {   // choose the standing profile (null = none); remembered in the browser
    if (name != null && !PROFILES[name]) { console.warn('[crescRun] no profile "' + name + '" — ' + Object.keys(PROFILES).join(', ')); return; }
    crescRun.profile = name || null; save(PROFILE_KEY, crescRun.profile);
    console.log('[crescRun] profile: ' + (name ? name + ' = ' + JSON.stringify(PROFILES[name]) : 'none'));
};
crescRun.presets = {
    push:   { gap0: 2.0, gapN: 0.5, steep: 0.85, len: 2,   dyn: ['ppp', 'fff'] },   // a steady push, ~3 voices sounding
    rush:   { gap0: 1.5, gapN: 0.3, steep: 0.78, len: 1.5, dyn: ['ppp', 'fff'] },   // tighter and steeper
    pile:   { gap0: 2.5, gapN: 0.6, steep: 0.85, lenS: 4,  dyn: ['ppp', 'fff'] },   // long ones piling up while the onsets close in
};
crescRun.profiles = PROFILES; crescRun.DEFAULTS = DEFAULTS; crescRun.GROUP = GROUP;
crescRun.takeOnsets = onsetsFromTake;   // chord_run.js borrows a take's rhythm through this
crescRun.last = load(LAST_KEY);
{ const p = load(PROFILE_KEY); crescRun.profile = p === null ? 's3' : p; }   // never chosen = his section-3 settings
root.crescRun = crescRun;
}(typeof self !== 'undefined' ? self : this));
