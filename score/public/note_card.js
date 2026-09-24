// note_card.js — THE NOTE CARD (composer 2026-09-09).
//
// His ask, after an afternoon lost to the interface: *"I want to be able to select a note, choose a different instrument, and maybe
// choose a different pitch, and then drag the block so I can edit the duration or location. but none of that is working right now.
// So let's get something expedient in place as soon as possible."*
//
// So this is one card with exactly those four controls and nothing else, opened by selecting a note. It is deliberately its own file
// and its own DOM — it does not touch the properties panel, the drag code or anything else that might already be misbehaving, so it
// cannot be broken by them and they cannot be broken by it.
//
// THE ONE DESIGN DECISION WORTH STATING: **every change is auditioned the instant it is made.** A voice that does not speak is the
// thing that cost him the afternoon, and no amount of correct-looking UI tells him whether a sound came out. The card plays the note
// on every edit and prints the MIDI channel it went out on, so silence is diagnosable in one glance instead of an hour — the piano's
// four voices are four different channels (main 1 · plucked 2 · harmonics 3 · muted 5) reaching two different plugins, and if nothing
// is loaded on that channel in the rack the app is behaving correctly and still making no sound.
(function (root) {
    'use strict';
    const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
    // `Composer` and `Cresc` are top-level `const`s in composer.html — a lexical global, NOT a property of `window`, so `root.Composer`
    // is undefined. Documented in the journal and walked into anyway; named here so the next file does not.
    const C = () => (typeof Composer !== 'undefined' ? Composer : root.Composer);
    const CR = () => (typeof Cresc !== 'undefined' ? Cresc : root.Cresc);
    const TRACKS_ = () => (typeof TRACKS !== 'undefined' ? TRACKS : []);   // composer.html's lexical const, same story as Composer
    const VR_ = () => (typeof VelocityRemap !== 'undefined' ? VelocityRemap : root.VelocityRemap);
    // PLAN 1e (2026-09-20): a shape drawn BY HAND on a note can take the same law the tools now write — struck at mf, the fader the
    // whole way, 0 ... 127, so the drawn height IS the fader instead of a step inside the written ladder's 12 dB. docs/DYNAMICS_LAW.md.
    const MF_ANCHOR = 100;
    const mfVel = (lane, midi) => {
        const Cp = C(), VR = VR_(), T = TRACKS_(), key = T[lane] && T[lane].instKey;
        const d = (VR && Cp && Cp._velRemap && key && VR.heldNote) ? VR.heldNote(Cp._velRemap, key, midi, MF_ANCHOR) : null;
        return d ? d.vel : MF_ANCHOR;
    };

    const CARD = {
        el: null,
        wc: null,
        _timer: null,

        // ---- the audition, which is the point ----------------------------------------------------
        // Straight to the port the note itself would use, so what is heard is what the score will play. No engine, no scheduler: a
        // note-on, CC7 full, and a note-off after its own length (capped, so a long note does not hold the card hostage).
        route(wc) {
            const Cp = C(), inst = Cp.trackInstrument(wc.layer);
            if (!inst) return null;
            const techs = Cp.trackTechniques(wc.layer) || [];
            const tech = techs.find(t => t.key === wc.technique) || techs[0] || null;
            const r = Cp.routeForNote(wc, tech, inst);
            const out = Cp._zoneMidiOutputs[r.port];
            return out ? { out: out, ch: r.ch, tech: tech, port: r.port } : { out: null, ch: r.ch, tech: tech, port: r.port };
        },
        async hear(wc) {
            const Cp = C();
            if (!Cp._zoneMidiInited && Cp.initZoneMidi) await Cp.initZoneMidi();
            const r = this.route(wc);
            this.say(r);
            if (!r || !r.out) return;
            if (this._timer) { clearTimeout(this._timer); this._timer = null; }
            if (this._last) { try { this._last.out.send([0x80 | this._last.ch, this._last.key, 0]); } catch (e) {} }
            try {
                if (r.tech && r.tech.cc0 != null) r.out.send([0xB0 | r.ch, 0, r.tech.cc0]);
                r.out.send([0xB0 | r.ch, 7, 127]);
                r.out.send([0x90 | r.ch, wc.sonifyNote, wc.recVel != null ? wc.recVel : 100]);
            } catch (e) { return; }
            this._last = { out: r.out, ch: r.ch, key: wc.sonifyNote };
            const ms = Math.min(2500, Math.max(250, (wc.endSeconds - wc.startSeconds) * 1000));
            this._timer = setTimeout(() => {
                this._timer = null;
                try { r.out.send([0x80 | r.ch, wc.sonifyNote, 0]); } catch (e) {}
                this._last = null;
            }, ms);
        },
        // the line that makes silence diagnosable: which port, which channel, and whether that port exists at all
        say(r) {
            const s = this.el && this.el.querySelector('#ncWhere');
            if (!s) return;
            if (!r) { s.textContent = 'no instrument on this lane'; s.style.color = '#e06666'; return; }
            const known = !!r.out;
            s.innerHTML = 'out: <b>' + (r.port || '?') + '</b> · MIDI ch <b>' + (r.ch + 1) + '</b>' +
                (known ? '' : ' — <span style="color:#e06666">that port is not open</span>');
            s.style.color = known ? '#8a9' : '#e06666';
        },

        // ---- THE ONE RULE FOR A NOTE'S DYNAMIC (2026-09-24, his "am i able to multiselect and batch update the dynamic?") ----------
        // The card's own setter since 2026-09-09, lifted out so the harmony strip's `dyn` box can apply it to every selected note, and
        // brought under DYNAMICS_LAW §3 for the kinds the setter did not know. `h` is the tile height 0 … 10 (a written name is
        // Cresc.dynHeight(name)). Returns the kind it treated the note as, for the status.
        //   struck  — a played note (`plain`, or a `recVel`): the tile's height IS the value and the velocity moves in step, the
        //             card's rule; a `velAbs` that was the recVel (§318's pin on a re-pitched struck note) follows it
        //   full    — a `full fader` note (cc7Abs 0 … 127): the height IS the fader (1e), so the height alone
        //   shaped  — velAbs + a table range (a sequence's, a texture's): Rule 2 — the fader on the table value of the NEW written
        //             dynamic, lo = hi (flat), the mf strike untouched; the heights at the written height
        //   drawn   — anything else: the height is its level on the anchor scale
        applyLevel(wc, h, level) {   // level: the exact written step 0 … 1 when the caller had a NAME (DynTable.levelOfName), so the table lands to the digit; else h / 10
            const v = Math.max(0, Math.min(10, Math.round(h * 10) / 10)), setY = () => { (wc.nodes || []).forEach(nd => { nd.y = v; }); };
            if (wc.sonifyMode === 'plain' || wc.recVel != null) {
                const was = wc.recVel; setY();
                wc.recVel = Math.max(1, Math.min(127, Math.round(v / 10 * 127)));
                if (wc.velAbs != null && was != null && wc.velAbs === was) wc.velAbs = wc.recVel;
                return 'struck';
            }
            if (wc.velAbs != null && wc.cc7Abs) {
                if (wc.cc7Abs.lo === 0 && wc.cc7Abs.hi === 127) { setY(); return 'full'; }
                const T = root.DynTable, Cp = C(), bank = Cp ? Cp._velRemap : null, tr = (typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || [])[wc.layer], key = tr && tr.instKey;
                if (T && key) { const lvl = (level != null && isFinite(level)) ? Math.max(0, Math.min(1, +level)) : v / 10; wc.cc7Abs = T.range(bank, key, lvl, lvl); setY(); return 'shaped'; }
            }
            setY(); return 'drawn';
        },

        // ---- open / close -------------------------------------------------------------------------
        open(wc, ev) {
            const Cp = C();
            if (!wc || wc.type !== 'waveCurve' || wc.sonifyNote == null) return this.close();
            this.wc = wc;
            if (!this.el) this.build();
            this.el.style.display = '';
            if (ev) {
                this.el.style.left = Math.min(ev.clientX + 14, window.innerWidth - 300) + 'px';
                this.el.style.top = Math.min(ev.clientY + 10, window.innerHeight - 260) + 'px';
            }
            this.paint();
        },
        close() {
            this.wc = null;
            if (this.el) this.el.style.display = 'none';
        },

        build() {
            const d = document.createElement('div');
            d.id = 'noteCard';
            d.style.cssText = 'position:fixed; z-index:9998; left:120px; top:140px; width:264px; background:#1c1c22;' +
                'border:1px solid #5E8C7A; border-radius:7px; padding:8px 9px; box-shadow:0 6px 22px rgba(0,0,0,.55);' +
                'font:12px system-ui,Segoe UI,sans-serif; color:#ddd; display:none';
            d.innerHTML =
                '<div id="ncHead" style="display:flex;justify-content:space-between;align-items:center;cursor:move;margin:-2px 0 6px">' +
                  '<b style="color:#8fb3a5">NOTE</b><span id="ncClose" style="cursor:pointer;color:#888;padding:0 3px">&times;</span></div>' +
                '<div id="ncStack" style="color:#c08a3e;font-size:11px;margin:0 0 5px;display:none"></div>' +
                // MOVE TO PART (PLAN 2d.5): the note goes to another player IN PLACE — the same id, so a notation choice on it holds
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">part</span><select id="ncPart" title="move this note to another part — same note, same id; the voice becomes that part\'s ordinary one" style="flex:1;min-width:0;background:#141419;color:#ddd;border:1px solid #444;padding:2px"></select></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">voice</span><select id="ncTech" style="flex:1;min-width:0;background:#141419;color:#ddd;border:1px solid #444;padding:2px"></select></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">pitch</span>' +
                  '<button id="ncDn" style="width:22px">&minus;</button>' +
                  '<input id="ncPitch" type="number" min="0" max="127" style="width:56px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<button id="ncUp" style="width:22px">+</button>' +
                  '<b id="ncName" style="color:#8fb3a5;margin-left:2px"></b></div>' +
                // ±8va, and the part's range as an INDICATOR — never a block (2d.5.4)
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="width:52px"></span>' +
                  '<button id="ncOctDn" style="padding:0 5px;font-size:11px">&minus;8va</button>' +
                  '<button id="ncOctUp" style="padding:0 5px;font-size:11px">+8va</button>' +
                  '<span id="ncRange" style="font-size:11px;color:#777"></span></div>' +
                // 1q.6 (2026-09-24): what a take left on the note — the sounding note with its cents, the partial, the take (HarmonySel.info)
                '<div id="ncJust" style="display:none;margin:1px 0 3px 58px;font-size:11px;color:#c9b27a"></div>' +
                // THE DYNAMIC (2026-09-09, his *"also no ability to change dynamic in panel"*). One value underneath, the drawn
                // height 0-10, shown three ways because each is what he wants at a different moment: the ensemble's own ppp…fff
                // scale (Cresc.DYN, so the card cannot drift from the crescendos), the height the tile is drawn at, and the MIDI
                // velocity a captured note actually replays with — a `plain` note is struck at `recVel` and its CC7 stays full.
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">dyn</span>' +
                  '<select id="ncDyn" style="width:58px;background:#141419;color:#ddd;border:1px solid #444;padding:2px"></select>' +
                  '<input id="ncLevel" type="number" step="0.1" min="0" max="10" style="width:52px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<span style="color:#666">of 10</span>' +
                  '<span id="ncVel" style="color:#8a9;font-size:11px;margin-left:auto"></span></div>' +
                // PLAN 1e — THE FULL FADER. On: the note is struck at mf and its drawn height maps straight onto CC7 0 ... 127, which is
                // how every shape a tool writes now sounds. Off: both fields go and the note is back on the written ladder (12 dB).
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px"></span>' +
                  '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;color:#9a9;font-size:11px" ' +
                    'title="a SHAPED note: struck at mf, the drawn height straight onto CC7 0-127 (docs/DYNAMICS_LAW.md). Off: the written ladder, 12 dB">' +
                    '<input id="ncFull" type="checkbox" style="margin:0"> full fader</label>' +
                  '<span id="ncFullV" style="color:#666;font-size:10px"></span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">start</span>' +
                  '<input id="ncStart" type="number" step="0.01" style="width:74px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<span style="color:#9a9">len</span>' +
                  '<input id="ncLen" type="number" step="0.01" min="0.02" style="width:64px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<span style="color:#666">s</span></div>' +
                '<div style="display:flex;align-items:center;gap:8px;margin:7px 0 3px">' +
                  '<button id="ncPlay" style="padding:2px 10px">&#9654; hear</button>' +
                  '<button id="ncDup" style="padding:2px 10px" title="copy this note one length later (CTRL+drag the note does the same)">duplicate</button>' +
                  '<span id="ncWhere" style="font-size:11px;color:#8a9"></span></div>' +
                '<div style="color:#666;font-size:10px;margin-top:5px;line-height:1.35">' +
                  '&uarr;&darr; in the pitch box moves by a semitone &middot; every change is heard at once<br>' +
                  'notes stacked here: click the same spot again to cycle down &middot; CTRL+drag a note copies it</div>';
            document.body.appendChild(d);
            this.el = d;

            d.querySelector('#ncClose').addEventListener('click', () => this.close());
            // drag by the header
            const head = d.querySelector('#ncHead');
            head.addEventListener('mousedown', (e) => {
                if (e.target.id === 'ncClose') return;
                const r = d.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
                const mv = (ev) => { d.style.left = (ev.clientX - ox) + 'px'; d.style.top = (ev.clientY - oy) + 'px'; };
                const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
                window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
                e.preventDefault();
            });

            const commit = (fn) => {
                if (!this.wc) return;
                const Cp = C();
                // every card edit is its own undo step (found in 2d.5.6, 2026-09-11: the card never pushed one, so the next CTRL+Z
                // went back to the snapshot BEFORE the card edits and took them with it — a pitch set in the card silently undone)
                Cp.pushUndoState();
                fn(this.wc);
                Cp._curveCh = null;                 // the channel map is cached; a voice change must re-derive it
                Cp.renderWaveCurve(this.wc);
                Cp.markDirty();
                if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
                this.paint();
                this.hear(this.wc);
            };

            d.querySelector('#ncTech').addEventListener('change', (e) => commit(wc => { wc.technique = e.target.value; }));
            d.querySelector('#ncFull').addEventListener('change', (e) => commit(wc => {
                if (e.target.checked) { wc.cc7Abs = { lo: 0, hi: 127 }; wc.velAbs = mfVel(wc.layer, wc.sonifyNote); }
                else { delete wc.cc7Abs; delete wc.velAbs; }
            }));
            const setPitch = v => commit(wc => { wc.sonifyNote = Math.max(0, Math.min(127, Math.round(v))); });
            d.querySelector('#ncPitch').addEventListener('change', (e) => setPitch(+e.target.value));
            d.querySelector('#ncPitch').addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault(); e.stopPropagation();
                    setPitch((this.wc ? this.wc.sonifyNote : 60) + (e.key === 'ArrowUp' ? 1 : -1));
                }
            });
            d.querySelector('#ncUp').addEventListener('click', () => setPitch((this.wc ? this.wc.sonifyNote : 60) + 1));
            d.querySelector('#ncDn').addEventListener('click', () => setPitch((this.wc ? this.wc.sonifyNote : 60) - 1));
            d.querySelector('#ncOctUp').addEventListener('click', () => setPitch((this.wc ? this.wc.sonifyNote : 60) + 12));
            d.querySelector('#ncOctDn').addEventListener('click', () => setPitch((this.wc ? this.wc.sonifyNote : 60) - 12));
            d.querySelector('#ncPart').addEventListener('change', (e) => {
                if (!this.wc) return;
                const r = this.moveToPart(this.wc, +e.target.value);
                if (!r.ok) { this.paint(); const s = this.el.querySelector('#ncWhere'); s.textContent = r.why; s.style.color = '#e06666'; return; }
                this.paint();
                this.hear(this.wc);
            });
            // one setter for all three faces of the dynamic: the tile's drawn height IS the value, and a captured note's replay
            // velocity is kept in step with it so what is seen and what is heard cannot disagree
            const setLevel = (l, level) => commit(wc => { CARD.applyLevel(wc, l, level); });   // 2026-09-24: the one rule, `applyLevel` below — the harmony strip's `dyn` box applies it to a whole selection
            d.querySelector('#ncDyn').addEventListener('change', (e) => {
                const h = CR() && CR().dynHeight ? CR().dynHeight(e.target.value) : null;
                if (h != null) setLevel(h, root.DynTable && root.DynTable.levelOfName ? root.DynTable.levelOfName(e.target.value) : null);
            });
            d.querySelector('#ncLevel').addEventListener('change', (e) => setLevel(+e.target.value));
            d.querySelector('#ncStart').addEventListener('change', (e) => commit(wc => {
                const len = wc.endSeconds - wc.startSeconds;
                wc.startSeconds = Math.max(0, +e.target.value || 0);
                wc.endSeconds = wc.startSeconds + len;
            }));
            d.querySelector('#ncLen').addEventListener('change', (e) => commit(wc => {
                wc.endSeconds = wc.startSeconds + Math.max(0.02, +e.target.value || 0.02);
            }));
            d.querySelector('#ncPlay').addEventListener('click', () => this.wc && this.hear(this.wc));
            // DUPLICATE (2026-09-10). One click: a copy one length later, selected, and the card follows it — so a run of
            // repeated notes is click, click, click without ever leaving the card. The score's CTRL+drag is the same call.
            d.querySelector('#ncDup').addEventListener('click', () => {
                if (!this.wc) return;
                const copy = C().duplicateNote(this.wc);   // selectObject reopens this card on the copy
                if (copy) this.hear(copy);
            });
            // typing in the card must never reach the score's keyboard shortcuts
            d.addEventListener('keydown', (e) => e.stopPropagation());
        },

        // ---- MOVE TO PART (PLAN 2d.5.3) — the one function the card's selector and moveNote() both call ----------------------
        // The note stays the same object: its id, time, length, pitch and dynamic are untouched, so a notation choice keyed to the
        // id follows it (docs/NOTATION_IDENTITY.md). What a note's PART is: `wc.layer`, the lane index = TRACKS order = the notation
        // part. Keyed to it, and re-derived here (2d.5.1): the instrument and its voices (TRACKS → INSTRUMENTS) — the voice becomes
        // the target's `ordinary` one, since a key from the old instrument means nothing on the new · the lane the note is drawn in
        // (its element is dropped and redrawn) · the D11 curve-channel map (cached, curveDirty) · the conflict marks (markDirty
        // schedules them) · undo (one step). Self-invalidating, nothing to do: heldDyn's cache (keys on layer) · lane solo/mute.
        // Carried as they are: groupId (a morph re-apply regenerates its notes anyway) · a trill on the new lane eats a note that
        // starts inside it at playback. Refused: containers, cue lines (a line stays on the piano lane, PLAN 1j), the META / curve
        // layers. A NOTE has no drag path to another lane (the lane drag moves grains — every sonified note — in time only); the
        // properties panel's `layer` field was the one way, and this is the second.
        moveToPart(wc, to) {
            const Cp = C(), T = TRACKS_();
            if (!wc || wc.type !== 'waveCurve' || wc.sonifyNote == null) return { ok: false, why: 'not a note' };
            if (!Number.isInteger(to) || to < 0 || to >= T.length) return { ok: false, why: 'no part ' + to + ' — the parts are 0–' + (T.length - 1) };
            if (wc.layer < 0 || wc.layer >= T.length) return { ok: false, why: 'this note is on a META / curve layer, not a part' };
            // NOT refused: a "grain" — composer.html's isGrain is EVERY sonified note on a part lane; the lane drag's refusal of
            // grains is a gesture rule (a grab of a grain is a retime), and copying it here refused every note (found in 2d.5.6)
            if (wc.isContainer || (Cp.isCueLine && Cp.isCueLine(wc))) return { ok: false, why: 'containers and cue lines stay on their lane' };
            const from = wc.layer;
            if (from === to) return { ok: true, id: wc.id, from, to, technique: wc.technique, same: true };
            Cp.pushUndoState();
            if (wc._els && wc._els.group) wc._els.group.remove();
            const old = Cp.elementCache.get(wc.id); if (old) old.remove();
            Cp.elementCache.delete(wc.id);
            wc.layer = to;
            const inst = Cp.trackInstrument(to), techs = Cp.trackTechniques(to) || [];
            wc.technique = inst && inst.ordinary && techs.some(t => t.key === inst.ordinary) ? inst.ordinary : (techs[0] ? techs[0].key : '');
            if (Cp.curveDirty) Cp.curveDirty(); else Cp._curveCh = null;
            Cp.renderWaveCurve(wc);
            Cp.markDirty();
            return { ok: true, id: wc.id, from, to, technique: wc.technique };
        },
        inRange(wc) {
            const [lo, hi] = C().trackRange(wc.layer);
            return { lo, hi, ok: wc.sonifyNote >= lo && wc.sonifyNote <= hi };
        },

        paint() {
            const wc = this.wc, Cp = C();
            if (!wc || !this.el) return;
            const psel = this.el.querySelector('#ncPart'), T = TRACKS_();
            if (psel.options.length !== T.length) {
                psel.innerHTML = '';
                T.forEach((t, i) => { const o = document.createElement('option'); o.value = i; o.textContent = t.short + ' — ' + t.label; psel.appendChild(o); });
            }
            psel.value = wc.layer;
            const rg = this.inRange(wc), rs = this.el.querySelector('#ncRange');
            rs.textContent = (rg.ok ? 'range ' : 'out of range ') + nm(rg.lo) + '–' + nm(rg.hi);
            rs.style.color = rg.ok ? '#777' : '#e06666';
            const techs = Cp.trackTechniques(wc.layer) || [];
            const sel = this.el.querySelector('#ncTech');
            // the CHANNEL is shown against every voice, because that is the fact that explains a silent one
            sel.innerHTML = '';
            techs.forEach(t => {
                const o = document.createElement('option');
                o.value = t.key;
                o.textContent = (t.label || t.key) + '  [ch ' + (t.channel || 1) + ']';
                if (t.key === wc.technique) o.selected = true;
                sel.appendChild(o);
            });
            if (!techs.some(t => t.key === wc.technique) && techs.length) sel.value = techs[0].key;
            // the dynamic, read back off the tile itself
            const ys = (wc.nodes || []).map(x => +x.y).filter(y => !isNaN(y));
            const lvl = ys.length ? Math.max.apply(null, ys) : 5;
            const dsel = this.el.querySelector('#ncDyn');
            const scale = (CR() && CR().DYN) || ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
            if (dsel.options.length !== scale.length) {
                dsel.innerHTML = '';
                scale.forEach(nme => { const o = document.createElement('option'); o.value = nme; o.textContent = nme; dsel.appendChild(o); });
            }
            dsel.value = CR() && CR().dynName ? CR().dynName(lvl) : scale[Math.round(lvl / 10 * 7)];
            this.el.querySelector('#ncLevel').value = Math.round(lvl * 10) / 10;
            this.el.querySelector('#ncVel').textContent =
                wc.sonifyMode === 'plain' ? 'vel ' + (wc.recVel != null ? wc.recVel : 100) : 'drawn';
            const full = !!(wc.cc7Abs && wc.cc7Abs.lo === 0 && wc.cc7Abs.hi === 127);
            this.el.querySelector('#ncFull').checked = full;
            this.el.querySelector('#ncFullV').textContent = full ? 'struck at vel ' + (wc.velAbs != null ? wc.velAbs : 100) + ' - CC7 0-127' : '';
            this.el.querySelector('#ncPitch').value = wc.sonifyNote;
            this.el.querySelector('#ncName').textContent = nm(wc.sonifyNote);
            // 1q.6: the cents from a flat `morphBend` (a moving one as a range), the partial and the take from HarmonySel.info — a
            // transpose keeps the cents (setPitch touches the note number alone); the partial stands through an octave (the drawer's
            // convention — the fold speaks through the pitch); a move NOT by octaves is said, from the take's dealt pitch (`hq.midi`)
            { const j = this.el.querySelector('#ncJust'); const HS = root.HarmonySel, info = HS && HS.info ? HS.info(wc) : null;
              const bp = Array.isArray(wc.morphBend) ? wc.morphBend.map(p => +p[1]).filter(x => isFinite(x)) : [];
              const cmin = bp.length ? Math.min.apply(null, bp) : 0, cmax = bp.length ? Math.max.apply(null, bp) : 0;
              const ct = c => (c > 0 ? '+' : '\u2212') + Math.abs(Math.round(c)) + '\u00a2', bits = [];
              if (bp.length && (Math.abs(cmin) >= 0.5 || Math.abs(cmax) >= 0.5)) bits.push(Math.abs(cmax - cmin) < 0.5 ? nm(wc.sonifyNote) + ' ' + ct(cmax) : 'bend ' + ct(cmin) + ' \u2026 ' + ct(cmax));
              if (info && info.partial != null) { let p = 'partial ' + info.partial; if (info.midi != null) { const d = wc.sonifyNote - info.midi; if (d % 12) p += ' (moved ' + (d > 0 ? '+' : '') + d + ' st)'; } bits.push(p); }
              if (info && info.take) bits.push('\u2190 take "' + info.take + '"' + (info.seed != null ? ' \u00b7 shuffle ' + info.seed : ''));
              j.textContent = bits.join(' \u00b7 '); j.style.display = bits.length ? '' : 'none'; }
            this.el.querySelector('#ncStart').value = Math.round(wc.startSeconds * 100) / 100;
            this.el.querySelector('#ncLen').value = Math.round((wc.endSeconds - wc.startSeconds) * 100) / 100;
            // how many notes are stacked under this one, so he knows there is something to cycle to
            const stack = Cp.stackAt ? Cp.stackAt(wc.startSeconds + (wc.endSeconds - wc.startSeconds) / 2, wc.layer) : [];
            const s = this.el.querySelector('#ncStack');
            if (stack.length > 1) {
                const i = stack.findIndex(o => o.id === wc.id);
                s.style.display = '';
                s.textContent = (i + 1) + ' of ' + stack.length + ' stacked here — click the same spot again for the next';
            } else s.style.display = 'none';
            this.say(this.route(wc));
        },
    };

    root.NoteCard = CARD;

    // ---- moveNote — the swap as one console line (PLAN 2d.5.7), the crescRun / goTo pattern ------------------------------------
    //   moveNote({ at: 143.57, from: 'Vc', to: 'Fl' })            the cello note starting at (or sounding at) 143.57 s → the flute
    //   moveNote({ at: 143.57, from: 'Vc', to: 'Fl', pitch: 48 })  … the one at pitch 48, when notes are stacked there
    //   moveNote({ id: 'wc-2052', to: 'Fl', toPitch: 72 })         by id, and a new pitch in the same undo step
    // A part is its short name (Fl BCl Pno Vn1 Vn2 Va Vc), its id, or its index. Never guesses: two candidates and no pitch → it lists
    // them and moves nothing. The same moveToPart the card's selector calls — whoever runs it, one code path.
    //
    // THE ONE-WRITER RULE (2d.5.8): the working copy lives in the OPEN PAGE (D17) and a second tab of the same score clobbers it on
    // Save. One open composer tab per score — the AI drives HIS tab, or he closes it first. A throwaway :5301 tab opens its origin's
    // last score, which can be his: read Composer.sessionName before touching anything; open the zz-ai- copy first.
    const partIndex = (p) => {
        const T = TRACKS_();
        if (typeof p === 'number') return Number.isInteger(p) && p >= 0 && p < T.length ? p : -1;
        const s = String(p == null ? '' : p).toLowerCase();
        return T.findIndex(t => t.short.toLowerCase() === s || t.id.toLowerCase() === s || t.label.toLowerCase() === s);
    };
    root.moveNote = function (o) {
        o = o || {};
        const Cp = C(), T = TRACKS_();
        if (!Cp) return null;
        const names = T.map(t => t.short).join(' · ');
        const to = partIndex(o.to);
        if (to < 0) { console.warn('[moveNote] to: one of ' + names); return null; }
        let wc = null;
        if (o.id) {
            wc = Cp.objects.find(x => x.id === o.id);
            if (!wc) { console.warn('[moveNote] no note ' + o.id); return null; }
        } else {
            const from = partIndex(o.from);
            if (from < 0 || o.at == null) { console.warn('[moveNote] needs { at, from, to } or { id, to } — parts: ' + names); return null; }
            const at = +o.at;
            const notes = Cp.objects.filter(x => x.type === 'waveCurve' && x.sonifyNote != null && x.layer === from);
            let hits = notes.filter(x => Math.abs(x.startSeconds - at) < 0.05);
            if (!hits.length) hits = notes.filter(x => x.startSeconds <= at && at < x.endSeconds);
            if (o.pitch != null) hits = hits.filter(x => x.sonifyNote === +o.pitch);
            if (hits.length !== 1) {
                console.warn('[moveNote] ' + (hits.length
                    ? hits.length + ' notes there — name one with pitch: ' + hits.map(x => x.id + ' pitch ' + x.sonifyNote + ' @ ' + x.startSeconds.toFixed(3)).join(' · ')
                    : 'no ' + T[from].short + ' note at ' + at + ' s'));
                return null;
            }
            wc = hits[0];
        }
        const r = CARD.moveToPart(wc, to);
        if (!r.ok) { console.warn('[moveNote] ' + wc.id + ': ' + r.why); return null; }
        if (o.toPitch != null) {
            wc.sonifyNote = Math.max(0, Math.min(127, Math.round(+o.toPitch)));
            Cp.renderWaveCurve(wc);
            Cp.markDirty();
        }
        if (CARD.wc === wc) CARD.paint();
        const rg = CARD.inRange(wc);
        const out = { id: wc.id, from: T[r.from].short, to: T[r.to].short, technique: wc.technique, pitch: wc.sonifyNote, inRange: rg.ok };
        console.log('%c[moveNote] ' + out.id + ' ' + out.from + ' → ' + out.to + ' · voice ' + out.technique + ' · pitch ' + out.pitch +
            (rg.ok ? '' : ' — OUT OF RANGE ' + rg.lo + '–' + rg.hi) + ' · unsaved until Save', 'color:#e8cf9a');
        return out;
    };

    // foldFlute (RUNNING_LOG §400, 2026-09-11 — the composer: "ok tongue ram, drop them all into C3-D4"): the flute's tongue rams
    // (technique `pizzicato`) only sound C3–D4, so every one in the window is moved into that span by the SMALLEST drop, ONE undo
    // step (CTRL+Z puts all of them back). A change to the MUSIC — it runs in HIS tab (the one-writer rule above); the notation
    // then writes fingered = sounding + M7 and marks anything still outside.
    //   foldFlute()                                                    0–183 s · Fl · pizzicato · into 48..62 (C3–D4)
    //   foldFlute({ from: 0, to: 183, lo: 48, hi: 62, part: 'Fl', technique: 'pizzicato' })
    root.foldMidi = function (p, lo, hi) { let q = p; while (q > hi) q -= 12; while (q < lo) q += 12; return q >= lo && q <= hi ? q : null; };
    root.foldFlute = function (o) {
        o = o || {};
        const Cp = C(), T = TRACKS_();
        if (!Cp) return null;
        const part = partIndex(o.part != null ? o.part : 'Fl');
        if (part < 0) { console.warn('[foldFlute] part: one of ' + T.map(t => t.short).join(' · ')); return null; }
        const from = o.from != null ? +o.from : 0, to = o.to != null ? +o.to : 183;
        const lo = o.lo != null ? +o.lo : 48, hi = o.hi != null ? +o.hi : 62, tech = o.technique || 'pizzicato';
        const notes = Cp.objects.filter(x => x.type === 'waveCurve' && x.sonifyNote != null && x.layer === part && x.technique === tech && x.startSeconds >= from && x.startSeconds < to);
        const moves = notes.map(x => ({ x, q: root.foldMidi(x.sonifyNote, lo, hi) })).filter(m => m.q != null && m.q !== m.x.sonifyNote);
        const stuck = notes.filter(x => root.foldMidi(x.sonifyNote, lo, hi) == null).length;
        if (!moves.length) { console.log('[foldFlute] nothing to move — ' + notes.length + ' ' + T[part].short + ' ' + tech + ' notes, all inside ' + lo + '..' + hi); return { moved: 0, of: notes.length, stuck }; }
        Cp.pushUndoState();
        for (const m of moves) { m.x.sonifyNote = m.q; Cp.renderWaveCurve(m.x); }
        Cp.markDirty();
        if (CARD.wc && moves.some(m => m.x === CARD.wc)) CARD.paint();
        console.log('%c[foldFlute] ' + moves.length + ' of ' + notes.length + ' ' + T[part].short + ' ' + tech + ' notes moved into ' + lo + '..' + hi +
            (stuck ? ' · ' + stuck + ' cannot fold' : '') + ' · one undo step · unsaved until Save', 'color:#e8cf9a');
        return { moved: moves.length, of: notes.length, stuck, ids: moves.map(m => m.x.id) };
    };

    // stepDynamics (PLAN 2i.3, CN-83 — the composer, 2026-09-14: "I want to start at p and then at the end end up at f f f. So I guess in
    // even progression by time"): every STRIKE in the window (srcKind 'strike'), every part, set to the dynamic of its equal time band, on
    // the score's own scale — Cresc.dynHeight (NAMING §2.9: ppp … fff in eight equal steps), the velocity height/10 × 127, the strike's
    // flat curve at that height (as crescStrikes().set writes a dynamic). ONE undo step. A strike ON a band edge takes the later band;
    // the window's last instant stays in the last band. Anything that is not a strike (the crescendo run's swells, CN-84) is untouched.
    //   stepDynamics()                                                  444–624 s · p mp mf f ff fff · 30 s each
    //   stepDynamics({ from: 444, to: 624, dyns: ['p', 'mp', 'mf', 'f', 'ff', 'fff'] })
    root.stepDynamics = function (o) {
        o = o || {};
        const Cp = C(), CRe = CR();
        if (!Cp || !CRe || !CRe.dynHeight) return null;
        const from = o.from != null ? +o.from : 444, to = o.to != null ? +o.to : 624;
        const dyns = o.dyns || ['p', 'mp', 'mf', 'f', 'ff', 'fff'];
        const hs = dyns.map(d => CRe.dynHeight(d));
        if (!dyns.length || hs.some(h => h == null) || !(to > from)) { console.warn('[stepDynamics] needs from < to and dyns from ' + CRe.DYN.join(' ')); return null; }
        const w = (to - from) / dyns.length, EPS = 1e-6;
        const notes = Cp.objects.filter(x => x.type === 'waveCurve' && x.srcKind === 'strike' && x.startSeconds >= from - EPS && x.startSeconds <= to + EPS);
        if (!notes.length) { console.log('[stepDynamics] no strikes in ' + from + '–' + to + ' s'); return { of: 0, changed: 0, bands: [] }; }
        const bands = dyns.map((d, i) => ({ dyn: d, from: from + i * w, to: from + (i + 1) * w, height: hs[i], vel: Math.max(1, Math.min(127, Math.round(hs[i] / 10 * 127))), n: 0 }));
        Cp.pushUndoState();
        let changed = 0;
        for (const x of notes) {
            const b = bands[Math.max(0, Math.min(bands.length - 1, Math.floor((x.startSeconds - from + EPS) / w)))];
            b.n++;
            if (x.recVel !== b.vel || (x.nodes || []).some(nd => nd.y !== b.height)) changed++;
            (x.nodes || []).forEach(nd => { nd.y = b.height; });
            x.recVel = b.vel;
            Cp.renderWaveCurve(x);
        }
        Cp.markDirty();
        if (CARD.wc && notes.indexOf(CARD.wc) >= 0) CARD.paint();
        console.log('%c[stepDynamics] ' + notes.length + ' strikes, ' + changed + ' changed · ' +
            bands.map(b => b.dyn + ' ' + b.from.toFixed(0) + '–' + b.to.toFixed(0) + ' s vel ' + b.vel + ' ×' + b.n).join(' · ') +
            ' · one undo step · unsaved until Save', 'color:#e8cf9a');
        return { of: notes.length, changed, bands };
    };
})(typeof window !== 'undefined' ? window : this);
