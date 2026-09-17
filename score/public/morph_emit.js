// morph_emit.js — PLAN 2v, the MIDI emit layer. ALL morph sound goes through
// here: the panel's audition and the score's playback of inserted morph notes.
// One place for the hygiene, because the hygiene is the failure mode.
//
// WHY A REGISTRY. Probe 0 confirmed the residue trap is real: a note played
// after an unreset bend came out +49.4 cents sharp. And the piece-#3 history is
// that "all notes off wasn't working as expected". So panic() does NOT trust
// CC123 — it sends an explicit note-off for every note this layer actually
// started, from a registry, and uses CC123 only as belt-and-braces.
//
// MEASURED CONSTANTS come from docs/MORPH_FINDINGS.md via Morph.MEASURED:
//   BEND_PREARM_S 0.05  — set the bend this far before note-on so the note
//                         STARTS at pitch instead of scooping into it
//   RESET_GAP_S   0.0   — resetting bend at note-off proved inaudible
//   BEND_RANGE_ST 1.99  — the patch's real range; RPN 0 is ignored so it is a
//                         hard ceiling

(function (root) {
'use strict';

// `const Composer = {...}` in composer.html is a LEXICAL global: visible to every
// classic script by bare identifier, but NOT a property of window. Reaching for
// it as `root.Composer` silently yielded undefined, which made every MIDI route
// resolve to null and produced a "nothing sounded" that had nothing to do with
// MIDI. Always go through here.
function HOST() { return (typeof Composer !== 'undefined') ? Composer : null; }

const M = root.Morph;
if (!M) { console.warn('[morph_emit] morph.js must load first'); return; }

// CC7 NEEDS REAL LEAD BEFORE A COLD ATTACK — the day-14 finding on the blip.
// The score app met this exact artifact in its own curve playback and killed
// it with PREARM_S = 0.15: "settle CC7/KS before the attack (kills the entry
// bite)" (composer.html). The panel's t=0 notes had ~2 ms of real lead — the
// day-13 "synchronous" arm fires at play-press, but the note-on lands on the
// very next timer tick. If the sampler smooths CC7 over tens of ms (the
// standard zipper-noise guard), the note speaks at the PREVIOUS CC7 — 127
// after any stop — for its first instants. And the same mechanism runs the
// END blip in reverse: panic() restored CC7=127 in the same instant as the
// note-offs, so the ~0.69 s UVI release tail was yanked up to full volume.
// This is also what the composer's counter-evidence was saying all along: a
// keyboard-played chord involves NO CC7 movement near the note-on, so it has
// no bite — the blip needs CC7 to be MOVING under sounding audio, not a
// sample transient and not velocity. Day 13's three fixes corrected the
// VALUES; this is the TIMING.
// EVERY ATTACK IS TIMESTAMPED, AND THE CC7 STREAM IS QUEUED AHEAD (2026-09-09, RUNNING_LOG §319).
//
// This file had neither of §103's fixes. Attacks went out on `setTimeout` — better than frames, but still at the mercy of a busy main
// thread — and the CC7 stream was sent one value per animation frame, which stops entirely when the page is not painting. A FADE is
// the case that makes the second unacceptable: there the stream IS the gesture, and nothing else is carrying it.
//
// Web MIDI delivers `send(msg, timestamp)` to the millisecond whatever the frame rate, and every value is known before a note starts,
// so the whole run is handed over at play() time. Measured on a full BLOOM with the fade: ~1100 CC7 messages for 40 seconds, and the
// count barely moves between a 16.7 ms step and a 50 ms one, because CC7 is 7-bit and repeats are dropped. The frame rate now touches
// nothing; the rAF tick is left for BEND alone, which is 14-bit, genuinely dense, and far less exposed to a dropped frame.
const STREAM_STEP_S = 0.02;   // 50 Hz — finer than a frame, and the dedupe means it costs nothing to ask often
// AND THE QUEUE IS BOUNDED (2026-09-09, §320, after §319 hung his rack). Timestamps are only half the pattern; the other half is that
// **nothing may be queued that cannot be un-queued**, and on this platform NOTHING can be un-queued: `MIDIOutput.clear()` is in the
// Web MIDI spec and **Chrome does not implement it** — the prototype carries `send` and `constructor`, nothing else. §319 handed the
// whole run to the driver on the strength of a `clear()` that silently did not exist, so Stop cancelled nothing, the note-offs went
// out while the note-ons kept arriving behind them, and the rack was left sounding with no way to reach it. Hence: never hold more
// than SCHED_AHEAD_MS in the driver, top it up from a TIMER (which fires when the page is not painting — the whole point of §319),
// and let Stop simply stop refilling. The worst case is then one horizon of already-committed sound, and 250 ms is inaudible.
const SCHED_AHEAD_MS = 250;   // how far ahead the driver ever holds — also exactly how long a panic can take to bite
const SCHED_TICK_MS  = 60;    // the refill timer; four chances inside every horizon, so a late tick cannot open a gap
const CC_LEAD_MS = 250;   // > the score's proven 150 ms, imperceptible on a play button
const TAIL_MS    = 2000;  // CC7-restore delay past note-off; ord tail measured 0.69 s

const EMIT = {
    _active: [],        // [{out, ch, key, port}] — every note WE started
    _bentCh: {},        // "port|ch" -> true, so we only reset what we touched
    _timers: [],
    _restore: {},       // "port|ch" -> timeout id of a pending CC7=127 restore
    _playing: false,
    _t0: 0,
    _raf: null,
    _sched: null,       // the refill interval (§320) — the only thing feeding the driver
    _sweep: null,       // the belt-and-braces silence after a stop; CANCELLED by the next play, or it would land inside it
    _plan: null,
    CC_LEAD_MS: CC_LEAD_MS,   // exposed so the panel can align narration
    onFrame: null,      // host hook: (elapsedSec) => void
    onStop: null,

    // ---- resolution -------------------------------------------------------
    outputFor(portName) {
        const C = HOST();
        if (!C || !C._zoneMidiOutputs) return null;
        return C._zoneMidiOutputs[String(portName || '').toLowerCase()] || null;
    },
    // voice -> lane -> instrument -> (port, channel) for a technique
    routeFor(lane, techKey) {
        const C = HOST();
        const inst = C && C.trackInstrument ? C.trackInstrument(lane) : null;
        if (!inst) return null;
        // the septet (2026-09-07, §203): an unknown key falls back to the instrument's ORDINARY voice (the recipe's `ordinary`),
        // then to 'ord' as before; the route carries the switch (CC0 or a keyswitch), the instrument's measured bend range and its key
        const techs = inst.techniques || [];
        const tech = techs.find(t => t.key === techKey)
                  || (inst.ordinary && techs.find(t => t.key === inst.ordinary))
                  || techs.find(t => t.key === 'ord');
        const port = (tech && tech.port) || inst.port;
        const out = this.outputFor(port);
        if (!out) return null;
        const T = (typeof TRACKS !== 'undefined') ? TRACKS : (root.TRACKS || null);
        return { out: out, port: port, ch: ((tech && tech.channel) || 1) - 1, tech: tech,
                 instKey: (T && T[lane]) ? T[lane].instKey : null, bendRangeSt: inst.bendRangeSt || null,
                 cc0: (tech && tech.cc0 != null) ? tech.cc0 : null, ks: (tech && tech.ks != null) ? tech.ks : null };
    },

    // ---- primitives -------------------------------------------------------
    sendBend(route, cents) {
        const v = M.bendValue(cents, route.bendRangeSt || undefined);   // the instrument's measured range (§203); the tuba's 1.99 st when unknown
        route.out.send([0xE0 | route.ch, v & 0x7F, (v >> 7) & 0x7F]);
        this._bentCh[route.port + '|' + route.ch] = true;
    },
    noteOn(route, key, vel) {
        route.out.send([0x90 | route.ch, key, vel]);
        this._active.push({ out: route.out, ch: route.ch, key: key, port: route.port });
    },
    noteOff(route, key) {
        route.out.send([0x80 | route.ch, key, 0]);
        for (let i = this._active.length - 1; i >= 0; i--) {
            const a = this._active[i];
            if (a.ch === route.ch && a.key === key && a.port === route.port) {
                this._active.splice(i, 1);
                break;
            }
        }
    },

    // THE VERIFIED STOP SEQUENCE (probe 0.5: silence 0.69 s after the explicit
    // note-offs, both ports clean afterwards). Order matters.
    panic() {
        this._timers.forEach(clearTimeout);
        this._timers = [];
        if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
        // STOP REFILLING FIRST (§320). Everything past the horizon has not been handed over and now never will be; what is already in
        // the driver cannot be recalled on this platform, so the sweep below is timed to land after it.
        if (this._sched) { clearInterval(this._sched); this._sched = null; }
        this._playing = false;

        // 1. explicit note-off for everything WE started — the registry is the
        //    source of truth, not memory of what "should" be sounding
        //    — and a note whose own note-on is COMMITTED but has not arrived yet is closed just after it (§103's trick), which is the
        //    precise cure: it names one key on one channel rather than silencing everything
        const nowP = performance.now();
        this._active.forEach(a => {
            try {
                if (a.onAt != null && a.onAt > nowP) a.out.send([0x80 | a.ch, a.key, 0], a.onAt + 5);
                else a.out.send([0x80 | a.ch, a.key, 0]);
            } catch (e) {}
        });
        const started = this._active.length;
        this._active = [];

        // 2. CC123 as belt-and-braces only
        const outs = {};
        Object.keys(this._bentCh).forEach(k => {
            const port = k.split('|')[0], ch = +k.split('|')[1];
            const out = this.outputFor(port);
            if (out) { outs[k] = { out: out, ch: ch }; try { out.send([0xB0 | ch, 123, 0]); } catch (e) {} }
        });

        // 2b. AND AGAIN AFTER THE HORIZON (§320), as belt and braces. The per-note close above is the real cure; this catches anything
        //     the registry could have missed. It must be a TIMER and not a timestamp: a timestamped message cannot be recalled on this
        //     platform, so a Play pressed straight after a Stop would have taken an all-notes-off 310 ms into the new run. `play()`
        //     cancels it. Late is harmless — the horizon is only 250 ms, so the worst case without it is inaudible anyway.
        if (this._sweep) clearTimeout(this._sweep);
        this._sweep = setTimeout(() => {
            this._sweep = null;
            Object.keys(outs).forEach(k => {
                const o = outs[k];
                try { o.out.send([0xB0 | o.ch, 120, 0]); } catch (e) {}   // all sound off
                try { o.out.send([0xB0 | o.ch, 123, 0]); } catch (e) {}   // all notes off
            });
        }, SCHED_AHEAD_MS + 60);

        // 3. centre the bend NOW (RESET_GAP_S measured 0 — inaudible), but the
        //    CC7=127 restore waits TAIL_MS past the note-offs. Restoring in the
        //    same instant yanked the ~0.69 s UVI release tail up to full volume
        //    — THE END BLIP (see the header). The restore only exists so the
        //    keyboard still speaks between runs; 2 s later serves that just as
        //    well. Per-channel timers in _restore, NOT in _timers, so a new
        //    play() can cancel exactly the channels it re-arms — a leftover
        //    restore firing mid-fade would slam CC7 to full inside the new run.
        //    If the tab dies before a restore fires, CC7 stays low: the score's
        //    CC7 Reset button is the standing cure (Principle 3).
        const gapMs = Math.max(0, (M.MEASURED.RESET_GAP_S || 0) * 1000);
        const centre = () => {
            Object.keys(outs).forEach(k => {
                const o = outs[k];
                try { o.out.send([0xE0 | o.ch, 0, 64]); } catch (e) {}
            });
        };
        if (gapMs > 0) this._timers.push(setTimeout(centre, gapMs)); else centre();
        Object.keys(outs).forEach(k => {
            const o = outs[k];
            if (this._restore[k]) clearTimeout(this._restore[k]);
            this._restore[k] = setTimeout(() => {
                delete this._restore[k];
                try { o.out.send([0xB0 | o.ch, 7, 127]); } catch (e) {}
            }, gapMs + TAIL_MS);
        });
        this._bentCh = {};
        if (this.onStop) try { this.onStop(); } catch (e) {}
        return started;
    },

    // MIDI IS INITIALISED LAZILY BY THE APP, and `navigator.requestMIDIAccess()`
    // needs a USER GESTURE — so it can only succeed on the composer's own click.
    // The app kicks it from the transport and the Rec button; the panel has to
    // kick it too or every route resolves to null and nothing sounds at all.
    // (That is exactly what happened on the first audition: `_zoneMidiOutputs`
    // was an empty object and `play` scheduled zero notes.)
    // Requests access HERE rather than delegating to Composer.initZoneMidi,
    // which swallows its error into a console.warn — so the panel could only
    // report "unavailable" and leave the composer guessing between a browser
    // permission, a missing port, and a broken rig. Those need different fixes,
    // so the real error has to reach the status line.
    _midiError: null,
    async ensureMidi() {
        const C = HOST();
        if (!C) { this._midiError = 'the score app has not finished loading'; return false; }
        if (C._zoneMidiOutputs && Object.keys(C._zoneMidiOutputs).length) return true;
        if (typeof navigator.requestMIDIAccess !== 'function') {
            this._midiError = 'this browser has no Web MIDI API';
            return false;
        }
        try {
            const access = await navigator.requestMIDIAccess();
            C._zoneMidiOutputs = C._zoneMidiOutputs || {};
            access.outputs.forEach(o => { C._zoneMidiOutputs[o.name.toLowerCase()] = o; });
            C._zoneMidiAccess = access;
            C._zoneMidiInited = true;
            if (C.bindHwInput) { try { C.bindHwInput(); } catch (e) {} }
            const n = Object.keys(C._zoneMidiOutputs).length;
            this._midiError = n ? null : 'the browser granted MIDI but reports no output ports — is loopMIDI running?';
            return n > 0;
        } catch (e) {
            const name = (e && e.name) || 'Error';
            this._midiError = name === 'NotAllowedError'
                ? 'this browser has BLOCKED Web MIDI for localhost:5300. It is a per-browser ' +
                  'setting, so a window where the score plays fine will work here too — ' +
                  'open the score in that window, or allow MIDI in this one (padlock icon → MIDI devices).'
                : name + ': ' + ((e && e.message) || 'MIDI request failed');
            return false;
        }
    },

    // ---- audition ---------------------------------------------------------
    // Plays a render. Bend envelopes are note-relative, so each note carries its
    // own trajectory and nothing here needs to know about the morph as a whole.
    // Returns {scheduled, skipped, reason} so the panel can say WHY nothing
    // sounded instead of guessing at the composer.
    async play(result, opts) {
        const o = opts || {};
        this.panic();
        // panic arms a silence for one horizon's time; this run starts now, so that silence would land inside it (§320)
        if (this._sweep) { clearTimeout(this._sweep); this._sweep = null; }
        if (!result || !result.notes || !result.notes.length) {
            return { scheduled: 0, skipped: 0, reason: 'nothing rendered' };
        }
        if (!await this.ensureMidi()) {
            return { scheduled: 0, skipped: 0, reason: this._midiError || 'MIDI unavailable' };
        }

        // audition on the same players the insert would use
        const _lanes = (result.meta && result.meta.lanes) || null;
        const laneOf = o.laneOf || (v => (_lanes && _lanes[v] != null) ? _lanes[v] : v);
        const velBase = o.velocity || 96;
        // VELOCITY HAS TO FOLLOW A FADE-IN TOO, and this is real evidence for
        // the open PLAN 2q question (velocity vs CC7 on SI2).
        //
        // The engine was made to open a fade at level 0 -> CC7 0, and the
        // composer still heard an attack, only quieter. If CC7 alone governed
        // loudness, CC7 0 would be silence. It is not — so the note-on velocity
        // is producing the transient, exactly as D12 found in the cluster
        // sandbox ("velocity is what the meter shows"). CC7 cannot mute a
        // velocity-96 attack; it can only attenuate what follows it.
        //
        // So a note whose opening level is below the engine's 0.4 floor — which
        // now happens ONLY inside an attack window — takes a proportionally
        // softer velocity. MIDI velocity 0 means note-off, so the floor is 1.
        // Everything else is untouched at 96.
        // THE SEPTET'S LOUDNESS (2026-09-07, §203): as the score plays a held curve note (1g item 5) — the velocity for the TOP of the
        // note's level curve through the measured remap, CC7 following the height — so the audition and the inserted notes agree;
        // without a remap (or an unknown instrument) the tuba's path below stands
        const Cr = HOST(), bank = Cr && Cr._velRemap, VR = root.VelocityRemap || null;
        const LO = (typeof HELD_LO !== 'undefined') ? HELD_LO : 65, HI = (typeof HELD_HI !== 'undefined') ? HELD_HI : 127;
        // A NOTE INSIDE A FADE IS STRUCK FOR WHERE IT STARTS, NOT WHERE IT ENDS (2026-09-09, RUNNING_LOG §314).
        //
        // The held-note law takes the velocity from the TOP of a note's level curve and lets CC7 shape it down — right for the body,
        // where the curve is a swell and the top is what the note is "for". Inside a FADE it is exactly wrong: each breath is a fresh
        // note-on, and a note that will eventually reach level 4 was being STRUCK for level 4 however quiet the fade wanted its entry.
        // Measured on BLOOM, voice 0's five breaths came out at velocity 1 · 103 · 103 · 103 · 71 whatever the fade said — the fade
        // shaped the CC7 within each note and could not touch the attack that began it. That is the jump the composer heard at the
        // second breath, and no fade setting could have fixed it: it is downstream of the whole shape.
        //
        // So inside the attack window the reference is the level the note OPENS at. CC7 is calibrated against the same reference
        // (`ccOf` takes this `dyn`), so the two stay consistent and the note still ends where its curve says.
        //
        // AND THE FADE RETIRES THAT RULE (2026-09-09, §315). Opening-level velocities still MOVE between breaths, and a moving
        // velocity is what he hears as a jump — measured, that fix gave 1 · 63 · 103 · 103, better but still a lurch, and the two
        // extremes are off the remap's measured range in opposite directions (velocity 1 forces CC7 to 123; velocity 63 forces 127).
        // The morph's own fade, which sounds right, holds ONE velocity and moves only CC7. So in `fade` mode the engine stamps every
        // note inside the window with `velRef` — the velocity of the breath in progress at the end of it — and this reads it. The
        // level curve, already rewritten into the ramp, then drives CC7 alone. `multiply` and `ceiling` keep the §314 rule below.
        const shMeta = (result.meta && result.meta.shape) || null;
        const attackEnd = (shMeta && shMeta.attackLen) || 0;
        const fadeMode = !!(shMeta && shMeta.attackMode === 'fade');
        const dynOf = (n, route) => {
            if (!bank || !VR || !route.instKey) return null;
            const hMax = Math.max.apply(null, n.level.map(l => l[1])) / 10;
            const hOpen = (n.level[0] && n.level[0][1] != null ? n.level[0][1] : 0) / 10;
            const h = n.velRef != null ? n.velRef / 10
                    : (!fadeMode && attackEnd > 0 && n.tStart < attackEnd) ? hOpen
                    : hMax;
            return VR.heldNote(bank, route.instKey, n.midi, LO + (HI - LO) * Math.max(0, Math.min(1, h)));
        };
        // and below the engine's 0.4 floor the remap has nothing left to give, so the velocity is scaled by hand — the old rule, kept,
        // because a fade that opens at level 0 must open at silence and MIDI velocity 0 means note-off (the floor is 1)
        const velFor = (n, dyn) => {
            const base = dyn ? dyn.vel : velBase;
            // A STAMPED NOTE IS ALREADY AT ITS VELOCITY (§315) — and it is the constant one, so this softening, which reads the
            // level the note OPENS at, would drive the first breath of a fade to velocity 1 and put the jump straight back.
            if (n.velRef != null) return base;
            const l0 = (n.level && n.level[0] && n.level[0][1] != null) ? n.level[0][1] : 10;
            if (l0 >= 0.4) return base;
            return Math.max(1, Math.round(base * (l0 / 0.4)));
        };
        // THE FADE IS APPLIED HERE, TO CC7 (2026-09-09, §317), and not to the level it used to rewrite. `cc7ForHeight` answers in the
        // MUSICAL scale — anchor velocities 65…127, 9.96 dB, bottoming out at CC7 88 (§316) — so a fade expressed there can never
        // start from silence. The weight multiplies the answer instead: 0 is CC7 0, which is the fader shut.
        const fadeAt = (n, dt) => n.cc7Fade ? M.fadeWeight(n.cc7Fade, n.tStart + dt) : 1;
        const ccOf = (n, route, dyn) => (h => dyn
            ? VR.cc7ForHeight(bank, route.instKey, n.midi, dyn.vel, LO + (HI - LO) * Math.max(0, Math.min(1, h / 10)))
            : this.levelToCC(h));
        const prearm = (M.MEASURED.BEND_PREARM_S || 0.05) * 1000;
        const scheduled = [];
        let skipped = 0;
        const missing = {};

        // THE WHOLE SCHEDULE IS SHIFTED BY CC_LEAD_MS. Day 13 sent the opening
        // CC7 "synchronously before any timer" — but the t=0 note-on fires on
        // the very next timer tick, so the real lead was single-digit ms, and
        // a sampler that smooths CC7 still had it near the stop()-restored 127
        // when the note spoke (the header's full story). Shifting every event
        // by a constant gives the opening notes a TRUE 250 ms of CC7 settle;
        // on a play button the delay is imperceptible.
        const resolved = [];
        result.notes.forEach(n => {
            const route = this.routeFor(laneOf(n.voice), n.technique);
            if (!route) {
                skipped++;
                const C = HOST();
                const inst = C && C.trackInstrument ? C.trackInstrument(laneOf(n.voice)) : null;
                missing[(inst && inst.port) || ('lane ' + laneOf(n.voice))] = 1;
                return;
            }
            resolved.push({ n: n, route: route, key: route.port + '|' + route.ch,
                            onMs: n.tStart * 1000 + CC_LEAD_MS,
                            offMs: (n.tStart + n.dur) * 1000 + CC_LEAD_MS });
        });

        // this run re-arms these channels itself — a pending CC7=127 restore
        // from the previous stop firing mid-fade would be the old end blip
        // relocated into the new run
        resolved.forEach(r => {
            if (this._restore[r.key]) { clearTimeout(this._restore[r.key]); delete this._restore[r.key]; }
        });

        // ONE CLOCK for the whole run, taken before anything is queued: every timestamp below is an offset from it, and the rAF tick
        // measures against the same base, so the bend it still streams cannot drift from the notes it belongs to.
        const t0 = performance.now();
        const at = ms => t0 + Math.max(0, ms);
        const events = [];       // every message of the whole run, built now, released a horizon at a time
        resolved.forEach(r => {
            const n = r.n, route = r.route;
            const key = n.midi;
            // COLD vs WARM entry decides the CC7 lead. A cold entry (nothing
            // of ours sounding on that channel through the lead window) gets
            // the full CC_LEAD_MS — this covers the t=0 notes, every staggered
            // first entry in a fade, and each rung of the panel's fade ladder.
            // A warm handoff (D26 re-key seams, cycling) keeps the short lead:
            // sending the next note's level 250 ms early there would yank the
            // still-sounding previous note.
            const cold = !resolved.some(o2 => o2 !== r && o2.key === r.key &&
                o2.onMs < r.onMs && o2.offMs > r.onMs - CC_LEAD_MS);
            // n.bend is ALREADY relative to the played key (the render loop
            // subtracts it). Adding the residual here as well played every
            // off-key note out by its own residual — measured at up to 40.2
            // cents on an M2 spectral render, found during 2z G4 and fixed in
            // both places at once. See the note in morph.js toScoreObjects.
            const bend = n.bend.map(pt => [pt[0], pt[1]]);

            const dyn = dynOf(n, route), cc7At = ccOf(n, route, dyn);
            // EVERY MESSAGE IS COMPUTED NOW AND SENT LATER. The values all follow from the note's own level curve and the fade's
            // weight, both known before a sound is made — so the expensive part happens once, here, and the refill below is a walk
            // along a sorted list. What it does NOT do is hand them to the driver: see SCHED_AHEAD_MS.
            const ev = (ms, msg, kind) => events.push({ ms: ms, msg: msg, route: route, kind: kind, key: key });
            // pre-arm the bend so the note STARTS at pitch (probe 0.3)
            const b0 = M.bendValue(bend[0][1], route.bendRangeSt || undefined);
            ev(r.onMs - prearm, [0xE0 | route.ch, b0 & 0x7F, (b0 >> 7) & 0x7F]);
            this._bentCh[route.port + '|' + route.ch] = true;
            // the switch (the septet's CC0 preset or a keyswitch) and CC7 for this note's opening level
            const armMs = cold ? r.onMs - CC_LEAD_MS : r.onMs - prearm + 5;
            if (route.cc0 != null) ev(armMs, [0xB0 | route.ch, 0, route.cc0]);
            if (route.ks != null) { ev(armMs, [0x90 | route.ch, route.ks, 100]); ev(armMs, [0x80 | route.ch, route.ks, 0]); }
            const cc7Open = Math.max(0, Math.min(127, Math.round(cc7At(n.level[0][1]) * fadeAt(n, 0))));
            ev(armMs, [0xB0 | route.ch, 7, cc7Open]);
            ev(r.onMs, [0x90 | route.ch, key, velFor(n, dyn)], 'on');
            ev(r.offMs, [0x80 | route.ch, key, 0], 'off');

            // the CC7 stream, as events on the same list — repeats dropped, so a slow fade is a handful of messages a second
            let lastCc = cc7Open;
            const durS = Math.max(0, (r.offMs - r.onMs) / 1000);
            for (let dt = STREAM_STEP_S; dt <= durS + 1e-9; dt += STREAM_STEP_S) {
                const v = Math.max(0, Math.min(127, Math.round(cc7At(this.interp(n.level, dt)) * fadeAt(n, dt))));
                if (v !== lastCc) { ev(r.onMs + dt * 1000, [0xB0 | route.ch, 7, v]); lastCc = v; }
            }
            scheduled.push({ route: route, bend: bend, level: n.level, cc7Fade: n.cc7Fade, tStart: n.tStart,
                             onMs: r.onMs, offMs: r.offMs,
                             lastB: null, lastC: null, cc7At: cc7At });
        });

        if (!scheduled.length) {
            return { scheduled: 0, skipped: skipped,
                     reason: 'no MIDI port for ' + Object.keys(missing).join(', ') +
                             ' — is loopMIDI running with those ports open?' };
        }

        const span = (o.span || result.meta.span) * 1000 + 1200 + CC_LEAD_MS;
        this._plan = scheduled;
        this._t0 = t0;
        this._playing = true;

        // THE REFILL. A cursor along the sorted list, handing the driver everything inside the horizon with its exact timestamp. The
        // timing is the timestamp's, not the tick's — a late tick still delivers the message at the right millisecond — so this can
        // run on a `setInterval`, which fires when the page is not painting at all. That was §319's whole purpose, kept; what §320
        // adds is the bound, so that Stop is always within SCHED_AHEAD_MS of silence.
        events.sort((a, b) => a.ms - b.ms);
        let cursor = 0;
        this._queuedTo = 0;
        const refill = () => {
            if (!this._playing) return;
            const horizon = (performance.now() - t0) + SCHED_AHEAD_MS;
            while (cursor < events.length && events[cursor].ms <= horizon) {
                const e = events[cursor++];
                try { e.route.out.send(e.msg, at(e.ms)); } catch (err) {}
                // `_active` is the registry panic closes, and it is filled as a note-on is COMMITTED rather than when it sounds: a
                // note-off for a key that never spoke is a no-op, a note we forgot to register is a hung note.
                if (e.kind === 'on') this._active.push({ out: e.route.out, ch: e.route.ch, key: e.key, port: e.route.port,
                                                         onAt: at(e.ms) });
                else if (e.kind === 'off') {
                    for (let i = this._active.length - 1; i >= 0; i--) {
                        const a = this._active[i];
                        if (a.ch === e.route.ch && a.key === e.key && a.port === e.route.port) { this._active.splice(i, 1); break; }
                    }
                }
            }
            this._queuedTo = horizon;
            if (cursor >= events.length && this._sched) { clearInterval(this._sched); this._sched = null; }
        };
        if (this._sched) clearInterval(this._sched);
        refill();                                   // the first horizon before anything else happens
        this._sched = setInterval(refill, SCHED_TICK_MS);

        const tick = () => {
            if (!this._playing) return;
            const el = performance.now() - this._t0;
            scheduled.forEach(s => {
                if (el < s.onMs || el > s.offMs) return;
                const dt = (el - s.onMs) / 1000;
                // BEND ONLY (§319). CC7 is queued with timestamps at play() time, so a dropped frame can no longer step on a fade.
                // Bend stays here: 14-bit and changing constantly, it would queue an order of magnitude more messages for a
                // dimension where a frame's worth of lag is inaudible.
                const bv = Math.round(this.interp(s.bend, dt));
                if (bv !== s.lastB) { this.sendBend(s.route, bv); s.lastB = bv; }
            });
            // the host's clock runs in RENDER time — take the shift back out
            if (this.onFrame) try { this.onFrame(Math.max(0, el - CC_LEAD_MS) / 1000); } catch (e) {}
            if (el > span) { this.panic(); return; }
            this._raf = requestAnimationFrame(tick);
        };
        this._raf = requestAnimationFrame(tick);
        return { scheduled: scheduled.length, skipped: skipped, reason: null };
    },

    // linear interpolation over [[dtSec, value], ...]
    interp(bp, dt) {
        if (!bp || !bp.length) return 0;
        if (dt <= bp[0][0]) return bp[0][1];
        for (let i = 1; i < bp.length; i++) {
            if (dt <= bp[i][0]) {
                const a = bp[i - 1], b = bp[i];
                const f = (dt - a[0]) / Math.max(1e-6, b[0] - a[0]);
                return a[1] + f * (b[1] - a[1]);
            }
        }
        return bp[bp.length - 1][1];
    },

    // level 0-10 -> CC7 through the score's MEASURED map. Never re-derive it:
    // Composer.curveValToCC is the authority (probes/cc7_map.json, levelSpanDb).
    levelToCC(level0to10) {
        const C = HOST();
        const v = Math.max(0, Math.min(1, level0to10 / 10));
        if (C && typeof C.curveValToCC === 'function') return C.curveValToCC(v);
        return Math.round(v * 127);
    },

    isPlaying() { return this._playing; },
};

root.MorphEmit = EMIT;
}(typeof self !== 'undefined' ? self : this));
