#!/usr/bin/env node
// balance_schedule.js — the ENSEMBLE BALANCE probe's timetable for the Lake George septet (PLAN 0d.2).
//
// Rewritten for this palette 2026-09-18 from piece #5's (untouched in septet_2026/tools/balance_schedule.js).
// The design is RUNNING_LOG §44–§46; the composer's restatement, 2026-09-18: "our goal is to produce a
// realistic demo and have realistic arual feedback for me during composing phase … I want everything to
// speak but no one part to dominate or wash the others out, particularly with percussion".
//
// THE MECHANISM — three levers in series (§46):
//   the FADER   one constant dB per track, set once from this run's numbers  (layer 1, bank/balance.json)
//   VELOCITY    per note; it picks the SAMPLE, so it carries the dynamic     (layer 2, bank/velocity_remap.json)
//   CC7         the fine trim between layers, and the shape of a held note   (layer 2)
// Not "127 then CC7 down": velocity chooses WHICH recording plays, so a 127 sample turned down is a quiet
// fff, not a p. (That deliberate mispairing is its own device — Ferneyhough's parenthesized dynamics,
// COMPOSITION_NOTES LG-14 — but it is never how an ordinary note is balanced.)
// PERCUSSION NEVER RECEIVES CC7 — Spitfire binds it to the plugin's global gain (§42), so a probe that
// sent it would rewrite his mix. Percussion notes carry cc7 = null and the player sends nothing.
//
// THE ROLES
//   ref   the trim's raw material — each pitched instrument's ordinary voice, 3 pitches, at the ANCHOR
//         velocity (the QUIET level, his A: the piece lives there, so that is where the match is exact),
//         repeated so a round-robin sampler's scatter averages out
//   vel   the same 3 pitches across six velocities, CC7 full — the velocity→loudness slope
//   cc7   the same 3 pitches at one velocity across six CC7 values — the CC7→loudness slope, taken on the
//         CURVE channel where the recipe names one (`channels.curve`: the `b` instance for SI2, channels
//         2–4 on its own port for Xsample), because that is the channel the app's held notes use
//   perc  per percussion instrument, up to three REPRESENTATIVE keys × four velocities, the anchor key
//         repeated. A baseline, not all 261 mapped keys — his "basic scaffolding … refine when I design
//         the actual sounds". Keys come from bank/perc_rack.json + bank/aro_percussion_catalog.json, NOT
//         from a recipe: the percussion lane's recipe is still the placeholder (§43).
//
// THE BOWED VIBRAPHONE is IN (D12, §48 — COMPOSITION_NOTES LG-15, the opening's reference): it arrived
// on 2026-09-18 and this tool picked it up with no edit, because `bowed_vibraphone` was already listed in
// PITCHED below. An instrument with no recipe yet is reported under `skipped`, never an error.
//
//   node tools/balance_schedule.js                       # the whole run (~27 min)
//   node tools/balance_schedule.js --preflight           # the loudest case only, ~2 min → the clipping check
//   node tools/balance_schedule.js --only cello,horn     # a subset, same timings
//   node tools/balance_schedule.js --nopitched           # percussion alone
//   node tools/balance_schedule.js --noperc              # the pitched instruments alone
//   node tools/balance_schedule.js --nocc7               # send no CC7 anywhere (his knobs untouched; #5's §373)
//
// Then: probes/balance_probe.ps1 plays it while the REC track records (0d.1), and
//       probes/analyze_balance.py measures the recording → bank/balance.json.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const flag = k => args.includes('--' + k);

// ── the dials ───────────────────────────────────────────────────────────────────────────────────────
const ANCHOR_VEL = +opt('anchor', 64);                                            // the QUIET level (his A, §45)
const VELS = opt('vels', '127,104,84,64,44,24').split(',').map(Number);
const CC7S = opt('cc7s', '127,104,84,64,44,24').split(',').map(Number);
const CC7_VEL = +opt('cc7vel', 100);                                              // velocity held fixed while CC7 is swept
const PERC_VELS = opt('percvels', '127,96,64,30').split(',').map(Number);
const FRACS = [0.25, 0.5, 0.75];                                                  // low · mid · high of the voice's range
const PERC_KEYS = +opt('perckeys', 3);                                            // representative keys per percussion instrument
const noCc7 = flag('nocc7');
const only = opt('only', '').split(',').filter(Boolean);
// --preflight (his ask, 2026-09-18: "the only issue is with clipping, I believe the last time we had to
// rerun the probe several times"): the LOUDEST case only — every instrument at top velocity, the pitched
// ones at their three pitches, the percussion on its anchor key. About a minute. Run with
// probes/clip_preflight.ps1, which watches EVERY track's peak: REC near 0 means not enough fader margin,
// a SOURCE track pinned at 0.0 while REC sits low means that plugin is clipping internally, which no
// fader can fix (#5's flute, fixed at the UVI master at −2 dB).
const preflight = flag('preflight');
// timing (ms)
const T = { hold: +opt('hold', 1200), gap: +opt('gap', 800), lead: +opt('lead', 3000), instGap: +opt('instgap', 1500), pre: 300,
            percHold: +opt('perchold', 200), percGapShort: +opt('percgap', 1200), percGapLong: +opt('percgaplong', 3000) };
// repeats: the Xsample instruments scatter ±2–4 dB by round robin (#5's §119), the SI2 three are layered and steady
const REPEATS = { xsample: { ref: 3, vel: 3, cc7: 2 }, si2: { ref: 3, vel: 1, cc7: 1 } };
const PERC_REPEATS = { anchor: 2, other: 1 };

// score order. `bowed_vibraphone` is listed so that it is picked up the moment its recipe exists (LG-15);
// instruments with no recipe yet are dropped with a note, not an error.
const PITCHED = ['english_horn', 'bassoon', 'horn', 'trumpet', 'bowed_vibraphone', 'cello', 'double_bass'];
const FAMILY = { english_horn: 'xsample', cello: 'xsample', double_bass: 'xsample', bowed_vibraphone: 'xsample',
                 bassoon: 'si2', horn: 'si2', trumpet: 'si2' };
// percussion instruments that ring long — the gap must outlast the sound or the next note measures its tail
// (§42's real finding, once the BOM was out of the way: a tail sits about 20 dB under the onset)
const PERC_LONG = new Set(['small_metals_finger_cymbals', 'small_metals_bell_tree', 'small_metals_triangles',
                           'temple_bowls', 'tam_tams_a', 'bass_drum', 'bass_drum_alt', 'crashes_and_stack']);
// an ANCHOR-eligible percussion articulation is a plain single sound: not a roll, a gliss, a choke, a damp,
// a flam or any of the long continuous gestures (a drag, a sweep, a scrape — Tam Tams and the Bass Drum are
// full of them and one would otherwise be picked as an instrument's representative)
const NOT_ANCHOR = /roll|gliss|choke|damp|flam|accent|long shake|scrape|swirl|tremol|drag|sweep|swell|continuous|slide|rub/i;
// the distinct percussion sounds all live in the lowest two octaves of each instrument's zone; everything
// above is the +24 repeat (whether those are the same samples is his deferred question, §41), so the
// representative keys are taken from the bottom PERC_SPAN semitones unless that leaves too few
const PERC_SPAN = +opt('percspan', 24);

// sandbox/instruments.js is a browser script (`const INSTRUMENTS = …`, no exports) — evaluate it
const INSTRUMENTS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const RACK = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'perc_rack.json'), 'utf8'));
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'aro_percussion_catalog.json'), 'utf8'));

const notes = [];
const plan = [];
const skipped = [];
let t = T.lead, i = 0;

// the curve channel the app's held notes use — `channels.curve` is either [{port,ch}…] (SI2's b instance)
// or [ch…] on the instrument's own port (Xsample's slots). Falls back to the main channel.
function curveChannel(I, tech) {
    const c = I.channels && I.channels.curve;
    if (!c || !c.length) return { port: tech.port || I.port, ch: tech.channel || 1, curve: false };
    const first = c[0];
    if (typeof first === 'object') return { port: first.port, ch: first.ch, curve: true };
    return { port: tech.port || I.port, ch: first, curve: true };
}

const pushNote = n => notes.push(Object.assign({ i: i++ }, n));

// ── the pitched instruments ─────────────────────────────────────────────────────────────────────────
if (!flag('nopitched')) for (const role of (preflight ? ['preflight'] : ['ref', 'vel', 'cc7'])) {
    for (const inst of PITCHED) {
        if (only.length && !only.includes(inst)) continue;
        const I = INSTRUMENTS[inst];
        if (!I) { if (role === 'ref') skipped.push(inst + ' (no recipe yet)'); continue; }
        const tech = I.techniques.find(q => q.key === I.ordinary);
        if (!tech) { console.error('no ordinary voice on ' + inst); process.exit(1); }
        const lo = tech.rangeLow != null ? tech.rangeLow : I.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : I.rangeHigh;
        const pitches = FRACS.map(f => Math.round(lo + (hi - lo) * f));
        const rep = role === 'preflight' ? 1 : (REPEATS[FAMILY[inst]] || REPEATS.xsample)[role];
        const velList = role === 'preflight' ? [Math.max.apply(null, VELS)]
                      : role === 'ref' ? [ANCHOR_VEL] : role === 'vel' ? VELS : [CC7_VEL];
        const cc7List = role === 'cc7' ? CC7S : [127];
        const dest = role === 'cc7' ? curveChannel(I, tech) : { port: tech.port || I.port, ch: tech.channel || 1, curve: false };
        plan.push({ inst, label: I.label, role, tech: tech.key, port: dest.port, ch: dest.ch, curve: dest.curve, pitches,
                    notes: velList.length * cc7List.length * pitches.length * rep });
        for (const cc7 of cc7List) for (const vel of velList) for (const pitch of pitches) for (let r = 0; r < rep; r++) {
            pushNote({ inst, label: I.label, role, rpt: r, tech: tech.key, techLabel: tech.label,
                       port: dest.port, ch: dest.ch, curve: dest.curve,
                       cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null,
                       pitch, vel, cc7: noCc7 ? null : cc7, anchor: role === 'ref',
                       tPreMs: t - T.pre, tOnMs: t, tOffMs: t + T.hold });
            t += T.hold + T.gap;
        }
        t += T.instGap;
    }
}

// ── the fourteen percussion instruments ─────────────────────────────────────────────────────────────
// up to PERC_KEYS representative keys each: the plain single sounds first (NOT_ANCHOR excluded), spread
// across the instrument's keyboard; if an instrument has no plain sound at all (the bell tree is six
// glisses) the spread is taken over every unique key instead, and the plan line says so.
function representativeKeys(entry) {
    const all = (entry.allInOne || []).filter(r => r.duplicateOf == null && r.repeatOf == null && r.midi != null);
    if (!all.length) return [];
    const floor = Math.min.apply(null, all.map(r => r.midi));
    const low = all.filter(r => r.midi < floor + PERC_SPAN);
    const rows = low.length >= Math.min(PERC_KEYS, all.length) ? low : all;
    const plain = rows.filter(r => !NOT_ANCHOR.test(r.articulation || ''));
    const pool = plain.length ? plain : rows;
    const n = Math.min(PERC_KEYS, pool.length);
    const pick = [];
    for (let k = 0; k < n; k++) pick.push(pool[Math.round(k * (pool.length - 1) / Math.max(1, n - 1))]);
    return pick.filter((r, k) => pick.findIndex(q => q.midi === r.midi) === k)
               .map((r, k) => Object.assign({}, r, { anchor: k === 0, fallback: !plain.length }));
}

if (!flag('noperc')) for (const track of RACK.tracks) {
    if (only.length && !only.includes(track.catalog) && !only.includes('percussion')) continue;
    const entry = CATALOG.instruments[track.catalog];
    if (!entry) { console.error('no catalog entry ' + track.catalog + ' for ' + track.track); process.exit(1); }
    let keys = representativeKeys(entry);
    if (!keys.length) { skipped.push(track.track + ' (no mapped keys)'); continue; }
    if (preflight) keys = keys.slice(0, 1);                                  // the anchor key alone, at top velocity
    const percVels = preflight ? [Math.max.apply(null, PERC_VELS)] : PERC_VELS;
    const gap = PERC_LONG.has(track.catalog) ? T.percGapLong : T.percGapShort;
    plan.push({ inst: track.catalog, label: track.track.replace(/ ARO$/, ''), role: 'perc', track: track.track, ch: track.channel,
                artic: track.artic, keys: keys.map(k => k.midi), articulations: keys.map(k => k.articulation),
                fallback: keys[0].fallback, ringGapMs: gap,
                notes: keys.reduce((a, k) => a + percVels.length * (preflight ? 1 : (k.anchor ? PERC_REPEATS.anchor : PERC_REPEATS.other)), 0) });
    for (const key of keys) for (const vel of percVels) for (let r = 0; r < (preflight ? 1 : (key.anchor ? PERC_REPEATS.anchor : PERC_REPEATS.other)); r++) {
        pushNote({ inst: track.catalog, label: track.track.replace(/ ARO$/, ''), rpt: r,
                   tech: key.articulation || 'hit', techLabel: (track.artic || '') + ' · ' + (key.articulation || 'hit'),
                   port: RACK.port, ch: track.channel, cc0: null, ks: null,
                   role: preflight ? 'preflight' : 'perc', pitch: key.midi, vel, cc7: null, anchor: !!key.anchor,   // cc7 null: Spitfire's CC7 is its global gain (§42)
                   tPreMs: t - T.pre, tOnMs: t, tOffMs: t + T.percHold, slotEndMs: t + T.percHold + gap });
        t += T.percHold + gap;
    }
    t += T.instGap;
}

// ── out ─────────────────────────────────────────────────────────────────────────────────────────────
const out = path.resolve(ROOT, opt('out', preflight ? 'probes/preflight_schedule.json' : 'probes/balance_schedule.json'));
const schedule = {
    generatedAt: new Date().toISOString(), piece: 'lgmf', planItem: preflight ? '0d.2 preflight' : '0d.2', preflight,
    sources: ['sandbox/instruments.js', 'bank/perc_rack.json', 'bank/aro_percussion_catalog.json'],
    anchorVel: ANCHOR_VEL, vels: VELS, cc7s: CC7S, cc7Vel: CC7_VEL, percVels: PERC_VELS, fracs: FRACS,
    percKeys: PERC_KEYS, repeats: REPEATS, percRepeats: PERC_REPEATS, noCc7, skipped,
    pitched: PITCHED.filter(k => INSTRUMENTS[k] && (!only.length || only.includes(k))), families: FAMILY,
    percPort: RACK.port, timing: T, leadInMs: T.lead, preMs: T.pre, noteMs: T.hold, gapMs: T.gap, instGapMs: T.instGap,
    trims: Object.fromEntries(Object.keys(INSTRUMENTS).map(k => [k, INSTRUMENTS[k].balanceDb != null ? INSTRUMENTS[k].balanceDb : 0])),
    plan, totalMs: t, notes,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(schedule, null, 1));

console.log('balance schedule → ' + path.relative(ROOT, out) + ' · ' + notes.length + ' notes · ' + (t / 60000).toFixed(1) + ' min');
console.log('  anchor velocity ' + ANCHOR_VEL + ' (the quiet level) · vels ' + VELS.join(',') + ' · cc7 ' + CC7S.join(',') +
            ' @vel ' + CC7_VEL + ' · perc vels ' + PERC_VELS.join(','));
for (const p of plan) {
    if (p.role === 'perc') {
        console.log('  perc    ' + p.label.padEnd(20) + RACK.port.padEnd(11) + 'ch' + String(p.ch).padEnd(3) +
                    ' keys ' + p.keys.join(' ').padEnd(11) + String(p.notes).padStart(3) + ' notes  ' +
                    (p.ringGapMs / 1000).toFixed(1) + 's ring  ' + p.articulations.join(' / ') +
                    (p.fallback ? '   [no plain sound — spread over all]' : ''));
    } else {
        console.log('  ' + p.role.padEnd(7) + ' ' + p.label.padEnd(19) + p.port.padEnd(11) + 'ch' + String(p.ch).padEnd(3) +
                    ' pitches ' + p.pitches.join(' ').padEnd(12) + String(p.notes).padStart(3) + ' notes' + (p.curve ? '   [curve channel]' : ''));
    }
}
if (skipped.length) console.log('  not in this run: ' + skipped.join(' · '));
