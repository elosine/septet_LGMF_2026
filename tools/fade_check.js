// fade_check.js — THE FADE-IN'S THREE PIECES (2026-09-09; RUNNING_LOG §311–313).
// His report: "there's no real fade in there … regardless of how much I dial in there, the initial entry is quiet, but soon
// thereafter, it's like a loud attack." Measured, he was right: a 3 s fade on BLOOM was bit-identical to no fade at all.
// Three things had to change together, and each is checked here on its own AND in company.
// Run: node tools/fade_check.js
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const M = require(path.join(ROOT, 'score', 'public', 'morph.js'));

let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? '  ok   ' : '  FAIL ') + name + (detail ? '  — ' + detail : '')); if (!cond) fail++; };
const H = t => console.log('\n' + t);

const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'morph_models.json'), 'utf8'));
const BLOOM = () => JSON.parse(JSON.stringify((bank.models || bank).BLOOM.baseParams));
const SPAN = BLOOM().carrier.span;

// voice 0's five breaths, peak level of each — the measurement his ear reported on
function peaks(shape) {
    const P = BLOOM();
    if (shape) P.shape = { attack: shape };
    const r = M.render(P, { maxVoices: 10 });
    const v = r.notes.filter(n => n.voice === 0).sort((a, b) => a.tStart - b.tStart);
    return { peaks: v.map(n => Math.max.apply(null, n.level.map(x => x[1]))), warnings: r.warnings || [], meta: r.meta };
}
const bare = peaks(null);

H('0 · the ground truth — the morph already grows on its own, and that is the thing a fade has to fight');
ok('voice 0 doubles from breath 1 to breath 2 with NO shape at all', bare.peaks[1] > bare.peaks[0] * 1.8,
   bare.peaks.join(' / '));

H('1 · THE FRACTION — `lenPct` is a share of the span, and `len` still works when it is absent');
{
    const r = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('lenPct 0.6 on a ' + SPAN + ' s span resolves to ' + (0.6 * SPAN) + ' s', r.meta.shape.attackLen === 0.6 * SPAN,
       r.meta.shape.attackLen + ' s');
    ok('and it needs no `len` — no warning about one', !r.warnings.some(w => /needs a len/.test(w)), JSON.stringify(r.warnings));
    const s2 = peaks({ len: 12, entry: 'together', curve: 'linear', from: 0 });
    ok('a plain `len` still resolves to itself', s2.meta.shape.attackLen === 12, s2.meta.shape.attackLen + ' s');
    const s3 = peaks({ len: 12, lenPct: 0.25, entry: 'together', curve: 'linear', from: 0 });
    ok('lenPct WINS when both are given', s3.meta.shape.attackLen === 0.25 * SPAN, s3.meta.shape.attackLen + ' s');
    const s4 = peaks({ entry: 'together', curve: 'linear', from: 0 });
    ok('neither given: it says so rather than guessing in silence', s4.warnings.some(w => /needs a len/.test(w)),
       s4.warnings.find(w => /needs a len/.test(w)) || '(none)');
}

H('2 · THE CEILING — it caps the dynamics layer where the multiplier only scaled it');
{
    const mul = peaks({ lenPct: 0.6, mode: 'multiply', entry: 'together', curve: 'held', from: 0 });
    const cap = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('multiply is still the default', peaks({ lenPct: 0.6, entry: 'together', curve: 'held', from: 0 }).peaks.join() === mul.peaks.join());
    ok('the ceiling grades the first three breaths', cap.peaks[0] < cap.peaks[1] && cap.peaks[1] < cap.peaks[2],
       cap.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' → '));
    ok('and it holds breath 2 far below where the morph would put it', cap.peaks[1] < bare.peaks[1] * 0.6,
       'ceiling ' + cap.peaks[1] + ' vs bare ' + bare.peaks[1]);
    // AND THE HONEST PART, which the measurement corrected: with a held curve and a long enough length BOTH modes grade.
    // What the ceiling actually gives is that it flattens the LOUD and leaves the QUIET alone — a multiplier scales
    // everything, including the breath that was already the quietest, and nearly silences it.
    ok('both modes grade once the length and the curve are right', mul.peaks[0] < mul.peaks[1] && mul.peaks[1] < mul.peaks[2],
       'multiply ' + mul.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' → '));
    ok('but the multiplier nearly silences the quiet breath where the ceiling lets it speak',
       mul.peaks[0] < cap.peaks[0] * 0.7, 'multiply ' + mul.peaks[0] + ' vs ceiling ' + cap.peaks[0]);
    ok('and the ceiling lets more of the LATER breath through, so the fade ends sooner',
       cap.peaks[2] > mul.peaks[2], 'ceiling ' + cap.peaks[2] + ' vs multiply ' + mul.peaks[2]);
    const over = peaks({ lenPct: 0.5, mode: 'ceiling', entry: 'together', curve: 'held', from: 0, peak: 1.5 });
    ok('a ceiling that is asked to overshoot says so and refuses', over.warnings.some(w => /cannot overshoot/.test(w)),
       over.warnings.find(w => /cannot overshoot/.test(w)) || '(none)');
}

H('3 · THE HELD-BACK CURVE — nothing else in the vocabulary stays low');
{
    const at = (c, u) => M.curveEase(c, u);
    ok('held is 0.01 a tenth of the way along', Math.abs(at('held', 0.1) - 0.01) < 1e-9, at('held', 0.1).toFixed(3));
    ok('linear is ten times that, and expo THIRTY-FIVE times — it is front-loaded',
       at('linear', 0.1) > at('held', 0.1) * 5 && at('expo', 0.1) > at('held', 0.1) * 20,
       'held ' + at('held', 0.1).toFixed(2) + ' · linear ' + at('linear', 0.1).toFixed(2) + ' · expo ' + at('expo', 0.1).toFixed(2));
    ok('all four curves still reach 1 at the end', ['linear', 'expo', 'sudden', 'held'].every(c => Math.abs(at(c, 1) - 1) < 1e-9));
    ok('held is in the vocabulary the panel reads', M.SHAPE_CURVES.indexOf('held') >= 0, M.SHAPE_CURVES.join(' '));
    // and it is the curve that makes the ceiling bite
    const straight = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'linear', from: 0 });
    const heldC = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('a STRAIGHT ceiling barely bites — the finding that corrected the first recommendation',
       straight.peaks[1] > heldC.peaks[1] * 1.5, 'linear ' + straight.peaks[1] + ' vs held ' + heldC.peaks[1]);
}

H('4 · THE THREE TOGETHER, against what he has now — his own numbers');
{
    const rows = [
        ['no shape at all', null],
        ['the old fade · 8 s multiply linear', { len: 8, entry: 'together', curve: 'linear', from: 0 }],
        ['the old fade · 3 s (the preset)', { len: 3, entry: 'together', curve: 'linear', from: 0 }],
        ['THE NEW ONE · 60% ceiling held', { lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 }],
    ];
    rows.forEach(([label, sh]) => console.log('     ' + label.padEnd(36) + peaks(sh).peaks.map(x => String(x).padStart(4)).join(' ')));
    const old3 = peaks({ len: 3, entry: 'together', curve: 'linear', from: 0 });
    ok('HIS REPORT CONFIRMED: the old 3 s fade is bit-identical to no fade at all',
       JSON.stringify(old3.peaks) === JSON.stringify(bare.peaks), old3.peaks.join(' / '));
    const nu = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('the new one is not', JSON.stringify(nu.peaks) !== JSON.stringify(bare.peaks), nu.peaks.join(' / '));
    // THE POINT OF THE WHOLE FIX, stated as the thing that is actually different: the old fade reached ONE breath, the new
    // one reaches THREE. A fade-in is supposed to grow, so a steeper climb is the fade working, not a fault.
    ok('the old fade reached exactly one breath', old3.peaks.filter((v, i) => v < bare[i] - 0.05).length === 0
       && peaks({ len: 8, entry: 'together', curve: 'linear', from: 0 }).peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length === 1,
       'the 8 s fade changed ' + peaks({ len: 8, entry: 'together', curve: 'linear', from: 0 }).peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length + ' of 5');
    ok('the new one reaches three', nu.peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length >= 3,
       'it changed ' + nu.peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length + ' of 5');
    [0.4, 0.6, 0.8].forEach(p => {
        const r = peaks({ lenPct: p, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
        ok('lenPct ' + p + ' behaves — a longer fade holds breath 1 lower', r.peaks[0] <= bare.peaks[0],
           r.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' / '));
    });
}

H('5 · NOTHING IN THE BANK MOVED — the guarantee that let this be built at all');
{
    ok('a no-shape render is untouched', JSON.stringify(peaks(null).peaks) === JSON.stringify(bare.peaks));
    const presets = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'shape_presets.json'), 'utf8'));
    ok('fade-in-3s still says exactly what it said', JSON.stringify(presets.presets['fade-in-3s'].shape) ===
       JSON.stringify({ attack: { len: 3, entry: 'together', curve: 'linear', from: 0 } }),
       JSON.stringify(presets.presets['fade-in-3s'].shape));
    ok('hit-and-settle is untouched too', presets.presets['hit-and-settle'].shape.attack.peak === 1.5);
    // the preset ended up as HIS logic, not my two refinements: the morph's own level scaled from silence, meeting the
    // natural level at the end of the window. A fraction is what it must carry; the mode and curve are the plain ones.
    ok('and the new preset is there, measured rather than guessed', !!presets.presets['fade-in-slow'] &&
       presets.presets['fade-in-slow'].shape.attack.lenPct > 0 &&
       presets.presets['fade-in-slow'].shape.attack.mode === 'fade' &&
       presets.presets['fade-in-slow'].shape.attack.curve === 'linear',
       JSON.stringify(presets.presets['fade-in-slow'].shape.attack));
    // the old presets must render exactly as they did — no new field can have changed them
    const legacy = peaks(presets.presets['fade-in-3s'].shape.attack);
    ok('rendering fade-in-3s gives the bare numbers, as it always did (that IS the bug he reported)',
       JSON.stringify(legacy.peaks) === JSON.stringify(bare.peaks), legacy.peaks.join(' / '));
}

// ===========================================================================
// 6 - THE FADE, IN CC7 (2026-09-09, RUNNING_LOG §315 for the design, §316 for why it had to move, §317 for the build).
//
// §315 built his algorithm in LEVEL space and he still heard no fade. §316 measured why, on a plain drawn note with no morph in it at
// all: the drawn 0-10 is a scale of anchor velocities 65..127, which on the measured remap is -39.18 .. -29.22 dB. **9.96 dB end to
// end, and level 0 sends CC7 88.** No ramp built there can start from silence. So the fade now leaves the level completely alone - the
// written dynamics stay the morph's own - and multiplies CC7 by a weight that runs from `from` to 1 across the window.
//
// Everything below measures CC7, because CC7 is what reaches the sampler. That is the lesson of §314 and §316 both.
// ===========================================================================
const VR = require(path.join(ROOT, 'score', 'public', 'velocity_remap.js'));
const remapBank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'velocity_remap.json'), 'utf8'));
const INST = Object.keys(remapBank.instruments || remapBank)[0];
const HLO = 65, HHI = 127;

// the emitter's arithmetic, in full: velocity from velRef when it is stamped, CC7 from the note's own level through the measured
// remap, then multiplied by the fade's weight at that instant. Anything this gets wrong, the ear gets wrong.
function shaped(shape) {
    const P = BLOOM();
    if (shape) P.shape = { attack: shape };
    return M.render(P, { maxVoices: 10 });
}
function voice(r, vi) {
    return r.notes.filter(n => n.voice === vi).sort((a, b) => a.tStart - b.tStart).map(n => {
        const hMax = Math.max.apply(null, n.level.map(x => x[1])) / 10;
        const h = n.velRef != null ? n.velRef / 10 : hMax;
        const d = VR.heldNote(remapBank, INST, n.midi, HLO + (HHI - HLO) * Math.max(0, Math.min(1, h)));
        const vel = d ? d.vel : 100;
        const ccBase = q => VR.cc7ForHeight(remapBank, INST, n.midi, vel, HLO + (HHI - HLO) * Math.max(0, Math.min(1, q / 10)));
        const lvlAt = tAbs => { const dt = tAbs - n.tStart, p = n.level;
            if (dt <= p[0][0]) return p[0][1];
            for (let i = 1; i < p.length; i++) if (dt <= p[i][0]) {
                const c = p[i - 1], e = p[i]; return c[1] + (e[1] - c[1]) * ((dt - c[0]) / Math.max(1e-6, e[0] - c[0])); }
            return p[p.length - 1][1]; };
        return { n: n, t: n.tStart, dur: n.dur, vel: vel, velRef: n.velRef,
                 cc: tAbs => Math.max(0, Math.min(127, Math.round(ccBase(lvlAt(tAbs)) * M.fadeWeight(n.cc7Fade, tAbs)))),
                 ccNatural: tAbs => ccBase(lvlAt(tAbs)) };
    });
}
// the CC7 a listener actually hears across a stretch: whichever note of that part is sounding, sampled
function heard(r, vi, t0, t1, step) {
    const v = voice(r, vi), out = [];
    for (let t = t0; t <= t1 + 1e-9; t += step) {
        const n = v.filter(x => x.t <= t + 1e-9 && x.t + x.dur > t - 1e-9).pop();
        if (n) out.push({ t: +t.toFixed(2), cc: n.cc(t), vel: n.vel });
    }
    return out;
}
const FADE = { lenPct: 0.6, mode: 'fade', entry: 'together', curve: 'linear', from: 0 };
const NEUTRAL = { lenPct: 0.6, mode: 'multiply', entry: 'together', from: 1, curve: 'linear' };  // same schedule, gain 1 everywhere
const LEN = 0.6 * SPAN;

H('6a · THE MODEL — how the morph fades with nothing dialled in, which he confirmed by ear is right');
{
    const b = voice(shaped(null), 0);
    ok('every breath is struck at the SAME velocity', new Set(b.slice(0, 4).map(x => x.vel)).size === 1,
       b.slice(0, 4).map(x => x.vel).join(' · '));
    ok('and CC7 is what moves', b[0].cc(b[0].t) < b[1].cc(b[1].t),
       b.slice(0, 3).map(x => x.cc(x.t)).join(' → '));
}

H('6b · §316\'S FINDING, kept as the reason this design exists — the level scale cannot reach silence');
{
    const b = voice(shaped(null), 0)[0];
    // 71 on this instrument, 88 on Vn1 - it varies with the sample's own loudness, and on none of them is it anywhere near off
    ok('the QUIETEST thing the level scale can say is still well over half fader, nowhere near off',
       VR.cc7ForHeight(remapBank, INST, b.n.midi, b.vel, HLO) >= 64,
       'level 0 → CC7 ' + VR.cc7ForHeight(remapBank, INST, b.n.midi, b.vel, HLO));
    const db = VR.targetDb(remapBank, HHI) - VR.targetDb(remapBank, HLO);
    ok('because the whole drawn 0-10 scale spans under 11 dB', db < 11, db.toFixed(2) + ' dB');
}

H('6c · THE FADE STARTS AT CC7 ZERO — the thing no level ramp could do, and his instruction word for word');
{
    const f = voice(shaped(FADE), 0);
    ok('the first breath opens at CC7 0', f[0].cc(f[0].t) === 0, 'CC7 ' + f[0].cc(f[0].t));
    ok('where without the fade it would have opened most of the way up', f[0].ccNatural(f[0].t) >= 64,
       'CC7 ' + f[0].ccNatural(f[0].t) + ' natural');
    ok('`from` raises the floor when he wants one — 0.5 opens half way up',
       (() => { const g = voice(shaped(Object.assign({}, FADE, { from: 0.5 })), 0)[0];
                return Math.abs(g.cc(g.t) - g.ccNatural(g.t) / 2) <= 1; })());
}

H('6d · AND IT RISES CONTINUOUSLY ACROSS THE WHOLE WINDOW — through the re-breaths, not restarting at each');
{
    const h = heard(shaped(FADE), 0, 0, LEN, 0.5);
    let falls = 0;
    for (let i = 1; i < h.length; i++) if (h[i].cc < h[i - 1].cc - 1) falls++;
    ok('CC7 never falls anywhere inside the window', falls === 0, h.length + ' samples, ' + h[0].cc + ' → ' + h[h.length - 1].cc);
    ok('one velocity the whole way', new Set(h.map(x => x.vel)).size === 1, h[0].vel + ' throughout');
    ok('it covers the fader\'s real range, not ten decibels of it', h[h.length - 1].cc - h[0].cc > 90,
       h[0].cc + ' → ' + h[h.length - 1].cc);
    // his curve dial still means what it says
    const held = heard(shaped(Object.assign({}, FADE, { curve: 'held' })), 0, 0, LEN, 0.5);
    const lin = h;
    ok('a `held` curve hangs lower at the half way point than `linear`',
       held[Math.floor(held.length / 2)].cc < lin[Math.floor(lin.length / 2)].cc,
       'held ' + held[Math.floor(held.length / 2)].cc + ' vs linear ' + lin[Math.floor(lin.length / 2)].cc);
}

H('6e · THE JOIN — the weight is exactly 1 at the end of the window, so the morph resumes on its own CC7');
{
    const r = shaped(FADE);
    ok('the weight is 0 at the start and exactly 1 at the end',
       M.fadeWeight({ start: 0, end: LEN, from: 0, curve: 'linear' }, 0) === 0 &&
       M.fadeWeight({ start: 0, end: LEN, from: 0, curve: 'linear' }, LEN) === 1);
    ok('and stays 1 past it — nothing is attenuated after the window',
       M.fadeWeight({ start: 0, end: LEN, from: 0, curve: 'linear' }, LEN + 30) === 1);
    const straddlers = r.notes.filter(n => n.tStart < LEN - 1e-9 && n.tStart + n.dur > LEN + 1e-9);
    ok('some parts ARE mid-breath there — the case the design turns on', straddlers.length > 0,
       straddlers.length + ' of ' + r.notes.filter(n => n.tStart < LEN).length + ' notes inside the window straddle its end');
    straddlers.slice(0, 1).forEach(n => {
        const v = voice(r, n.voice).find(x => x.t === n.tStart);
        ok('and the one measured meets its natural CC7 exactly at the end', v.cc(LEN) === v.ccNatural(LEN),
           v.cc(LEN) + ' = ' + v.ccNatural(LEN));
    });
    ok('no note starting after the window carries a fade stamp',
       r.notes.filter(n => n.tStart >= LEN - 1e-9).every(n => n.cc7Fade == null && n.velRef == null));
}

H('6f · THE WRITTEN MUSIC IS UNTOUCHED — the correction §316 forced, and the strongest thing here');
{
    const f = shaped(FADE), g = shaped(NEUTRAL);
    const strip = res => JSON.stringify(res.notes.map(n => {
        const c = Object.assign({}, n); delete c.velRef; delete c.cc7Fade; return c; }));
    ok('a faded render is IDENTICAL to the same shape at gain 1, once the two stamps are removed', strip(f) === strip(g));
    ok('which means every level, every entry, every duration, pitch, bend and technique is the morph\'s own',
       JSON.stringify(f.notes.map(n => n.level)) === JSON.stringify(g.notes.map(n => n.level)));
    // and voice 0, which `entry` does not reschedule, can be held against the bare morph directly
    const sig = res => res.notes.filter(n => n.voice === 0).map(n => n.tStart + '+' + n.dur).sort().join(' ');
    ok('voice 0 breathes exactly where the bare morph breathes', sig(f) === sig(M.render(BLOOM(), { maxVoices: 10 })),
       sig(f));
}

H('6g · THE LEGACY MODES ARE STILL THERE AND STILL INERT — his condition, checked and not assumed');
{
    const b = peaks(null);
    ['multiply', 'ceiling'].forEach(m => {
        const r = peaks({ lenPct: 0.6, mode: m, entry: 'together', curve: 'linear', from: 0 });
        ok(m + ' renders as it did — it still scales the level', r.meta.shape.attackMode === m &&
           JSON.stringify(r.peaks) !== JSON.stringify(b.peaks), r.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' / '));
    });
    const P2 = BLOOM(); P2.shape = { attack: { lenPct: 0.6, mode: 'multiply', entry: 'together', curve: 'linear', from: 0 } };
    ok('and stamps nothing for the emitter or the score to find',
       M.render(P2, { maxVoices: 10 }).notes.every(n => n.velRef == null && n.cc7Fade == null));
    ok('a no-shape render still has no shape meta at all', !M.render(BLOOM(), { maxVoices: 10 }).meta.shape);
}

H('6h · IT TRAVELS INTO THE SCORE — in SCORE seconds, so an inserted object needs nothing from its render');
{
    const r = shaped(FADE), AT = 137;
    const objs = M.toScoreObjects(r, AT, {});
    const inWin = objs.filter(o => o.cc7Fade);
    ok('every object inside the window carries the window, offset to where it was inserted',
       inWin.length > 0 && inWin.every(o => o.cc7Fade.start === AT && o.cc7Fade.end === AT + LEN),
       inWin.length + ' objects · ' + JSON.stringify(inWin[0].cc7Fade));
    ok('and its velocity reference, since the score has the same velocity law as the panel',
       inWin.every(o => o.velRef != null));
    ok('objects after the window carry neither', objs.filter(o => o.startSeconds >= AT + LEN).every(o => !o.cc7Fade && o.velRef == null));
    const plain = M.toScoreObjects(M.render(BLOOM(), { maxVoices: 10 }), AT, {});
    ok('a no-shape insert gains no new field', plain.every(o => o.cc7Fade === undefined && o.velRef === undefined));
}

H('6i · THE LADDER — `lenPct` outranks `len`, so a rung that set only `len` would audition one length five times');
{
    const base = Object.assign(BLOOM(), { shape: { attack: Object.assign({}, FADE) } });
    const seen = [];
    M.buildLadder(base, [4, 12, 24], { render: p => { seen.push(p.shape.attack.len + '/' + p.shape.attack.lenPct);
                                                      return M.render(p, { maxVoices: 10 }); } });
    ok('each rung renders at its own length, with the fraction cleared',
       seen.join(' ') === '4/undefined 12/undefined 24/undefined', seen.join(' '));
}

H('6j · WHAT A FADE IGNORES, SAID OUT LOUD — no silent no-ops');
{
    const w = sh => { const P2 = BLOOM(); P2.shape = sh; return (M.render(P2, { maxVoices: 10 }).warnings || []).join(' | '); };
    ok('a `peak` with a fade is reported, not quietly dropped',
       /peak" is ignored/.test(w({ attack: Object.assign({}, FADE, { peak: 1.5 }) })));
    ok('a decay block with a fade is reported too', /decay block has no peak/.test(w({ attack: FADE, decay: { len: 3, curve: 'linear' } })));
    ok('and a `from` so high it is not a fade at all is called out',
       /barely a fade/.test(w({ attack: Object.assign({}, FADE, { from: 0.95 }) })));
}

console.log('\n' + (fail ? fail + ' FAILED' : 'all checks passed'));
process.exit(fail ? 1 : 0);
