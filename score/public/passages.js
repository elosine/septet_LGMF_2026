// passages.js — A CAPTURED STRETCH OF SCORE, INSERTABLE AT THE PLAYHEAD INTO ANY SCORE
// (composer 2026-09-10, RUNNING_LOG §360–361).
//
// His ask: *"in the safe score right now is a series of crescendos and accents. Can I capture this whole thing as a meta that's
// insertable into any score? So I actually like to ... make a collection of these. and then have a menu where I can insert them
// at the playhead, but into any score I want."*
//
// And his two conditions, which are the whole design: *"verify its reliability so that, one, it is portable and stored properly.
// So, like, once I put one that's committed, it's put into the committed files, and ... make sure to test it so that when it's
// inserted, you're comparing it to the original and making sure that there's nothing just left behind or no changes were made."*
//
// SO:
//  · STORED under `bank/passages/`, which is committed — `scores/*-work.json` and `scores/versions/` are gitignored, bank/ is not.
//  · PORTABLE: nothing in a passage refers to the score it came from. Times are RELATIVE to the passage start; ids and groupIds
//    are rewritten to local tokens (`o0`, `g0`) at capture and re-issued fresh at insert, so a passage can be inserted into the
//    same score twice, or into a score that happens to use the same ids, without a collision either way.
//  · LOSSLESS: capture copies every field of every object verbatim except `_els` (live DOM) and the two identifiers. It does not
//    keep a whitelist — a field this file has never heard of survives, which is the only way a capture stays correct as the score
//    format grows. `tools/passage_roundtrip.js` proves it by diffing an insert against the original, field for field.
(function (root) {
    'use strict';
    const C = () => (typeof Composer !== 'undefined' ? Composer : root.Composer);
    const EPS = 1e-6;

    // WHERE THE PLAYHEAD IS. `Composer.getTimeAtPlayhead()` — the score scrolls under a fixed playhead line, so the time is
    // `scrollOffset / pixelsPerSecond` and there is no stored "current time" at all.
    //
    // The first build of this file used `Composer.playheadTime`, falling back to `Composer.currentTime`. NEITHER PROPERTY EXISTS,
    // so the whole chain always yielded 0: both ⤓ buttons stamped 0.00 and `insert @ playhead` inserted at 0 (composer 2026-09-10,
    // *"end doesn't registure new cursor point"* and *"neither does start"*). The app walk missed it because the test SET
    // `Composer.playheadTime` by hand before reading it back — a test that invents the thing it is testing proves nothing.
    // → RUNNING_LOG §363. `morph_panel.js:47` and `texture_panel.js:889` carry the identical phantom.
    const now = () => {
        const Cp = C();
        if (!Cp) return 0;
        if (typeof Cp.getTimeAtPlayhead === 'function') return Math.max(0, Cp.getTimeAtPlayhead());
        return 0;
    };

    const round = v => Math.round(v * 1e6) / 1e6;
    const t0of = o => o.startSeconds != null ? o.startSeconds : (o.startTime != null ? o.startTime : 0);
    const t1of = o => o.endSeconds != null ? o.endSeconds : (o.endTime != null ? o.endTime : t0of(o));

    // ---- what a passage is made of -------------------------------------------------------------
    // Objects are stored EXACTLY as the score holds them, with three substitutions and nothing else:
    //   id      → 'o<n>'   (its index in the passage)
    //   groupId → 'g<n>'   (a token shared by everything that shared the group)
    //   startSeconds / endSeconds → relative to the passage start
    // A cross-reference to an object INSIDE the passage is remapped too; one pointing OUTSIDE is dropped, because a passage that
    // silently carried a dangling id into another score would be exactly the "something left behind" he asked me to rule out.
    const REF_FIELDS = ['linkedCurveId', 'sourceId', 'parentId', 'launchedFrom'];

    function pack(objs, t0) {
        const idMap = new Map(), grpMap = new Map();
        objs.forEach((o, i) => idMap.set(o.id, 'o' + i));
        objs.forEach(o => { if (o.groupId && !grpMap.has(o.groupId)) grpMap.set(o.groupId, 'g' + grpMap.size); });
        return objs.map(o => {
            const c = JSON.parse(JSON.stringify(o, (k, v) => k === '_els' ? undefined : v));
            c.id = idMap.get(o.id);
            if (c.groupId) c.groupId = grpMap.get(o.groupId);
            if (c.startSeconds != null) c.startSeconds = round(c.startSeconds - t0);
            if (c.endSeconds != null) c.endSeconds = round(c.endSeconds - t0);
            if (c.startTime != null) c.startTime = round(c.startTime - t0);     // zones and markers speak in startTime/endTime
            if (c.endTime != null) c.endTime = round(c.endTime - t0);
            REF_FIELDS.forEach(f => { if (c[f]) c[f] = idMap.has(c[f]) ? idMap.get(c[f]) : ''; });
            if (c.trill && c.trill.launchedFrom) c.trill.launchedFrom = idMap.get(c.trill.launchedFrom) || null;
            return c;
        });
    }

    function unpack(packed, t0, Cp) {
        const idMap = new Map(), grpMap = new Map();
        const stamp = Date.now().toString(36);
        packed.forEach(p => idMap.set(p.id, Cp.generateId(p.type === 'waveCurve' ? 'wc' : p.type === 'lineWedge' ? 'lw' : 'zn')));
        packed.forEach(p => { if (p.groupId && !grpMap.has(p.groupId)) grpMap.set(p.groupId, 'grp-psg-' + stamp + '-' + grpMap.size); });
        return packed.map(p => {
            const c = JSON.parse(JSON.stringify(p));
            c.id = idMap.get(p.id);
            if (c.groupId) c.groupId = grpMap.get(p.groupId);
            if (c.startSeconds != null) c.startSeconds = round(c.startSeconds + t0);
            if (c.endSeconds != null) c.endSeconds = round(c.endSeconds + t0);
            if (c.startTime != null) c.startTime = round(c.startTime + t0);
            if (c.endTime != null) c.endTime = round(c.endTime + t0);
            REF_FIELDS.forEach(f => { if (c[f]) c[f] = idMap.get(c[f]) || ''; });
            if (c.trill && c.trill.launchedFrom) c.trill.launchedFrom = idMap.get(c.trill.launchedFrom) || null;
            delete c._els;
            return c;
        });
    }

    const P = {
        _list: null,
        // exposed so tools/passage_roundtrip.js tests THESE functions and not a copy of them — a test of a copy proves nothing
        _packForTest: pack,
        _unpackForTest: unpack,

        // ---- CAPTURE ---------------------------------------------------------------------------
        // The span, in order of preference: the times he names · the objects he has selected · the whole score.
        // An object belongs to the passage when it STARTS inside the span, so a long shape reaching past the end still comes.
        //
        // THE BOUNDARIES ARE A NET, NOT A RULER (composer 2026-09-10: *"just make sure if I don't get the precise exact times for
        // those two, that is just capturing the events within those boundaries. So it's not gonna paste in. If I start the capture
        // start time at two seconds before the first event, it's not gonna insert two seconds of silence"*).
        // So the ZERO of a passage is always the FIRST EVENT IN IT, never the boundary he typed and never 0. He can be as sloppy
        // with the boxes as he likes and the passage still begins on its first sound. This was a real fault in the first build,
        // which zeroed to the boundary for a span and to 0 for the whole score — both of which bake in leading silence.
        which(opts) {
            const Cp = C(), o = opts || {};
            let objs, why;
            if (o.from != null || o.to != null) {
                const a = o.from != null ? o.from : -Infinity, b = o.to != null ? o.to : Infinity;
                objs = Cp.objects.filter(x => t0of(x) >= a - EPS && t0of(x) < b + EPS);
                why = objs.length + ' between ' + (o.from != null ? o.from + ' s' : 'the start')
                    + ' and ' + (o.to != null ? o.to + ' s' : 'the end');
            } else {
                const sel = (Cp.selectedObjects && Cp.selectedObjects.length > 1) ? Cp.selectedObjects.slice()
                          : (Cp.selectedObject ? [Cp.selectedObject] : []);
                if (sel.length) { objs = sel; why = sel.length + ' selected'; }
                else { objs = Cp.objects.slice(); why = 'the whole score'; }
            }
            const from = objs.length ? Math.min.apply(null, objs.map(t0of)) : 0;
            return { objs: objs, from: from, why: why };
        },

        // what the two boxes say, as capture options. Empty means "not named" — NOT zero: an empty `from` with a filled `to`
        // must mean "from the start of the score", and a `from` of 0 must stay a real boundary.
        boxes() {
            const f = document.getElementById('psgFrom'), t = document.getElementById('psgTo');
            const num = el => (el && el.value !== '' && isFinite(+el.value)) ? +el.value : null;
            const o = {};
            if (num(f) != null) o.from = num(f);
            if (num(t) != null) o.to = num(t);
            return o;
        },

        async capture(name, opts) {
            const Cp = C(), o = opts || {};
            if (!name) { console.log('a name is needed: passages.capture("crescendos into strikes")'); return null; }
            const pick = this.which(o);
            if (!pick.objs.length) { console.log('nothing to capture'); return null; }
            const from = o.zero === false ? 0 : pick.from;
            const span = round(Math.max.apply(null, pick.objs.map(t1of)) - from);
            const body = {
                name: name,
                capturedAt: new Date().toISOString(),
                // `Composer.sessionName` is a STRING here, not the input element (the element is `sessionNameInput`) — walked into
                // once on the verification run, where every capture recorded `capturedFrom: null`.
                capturedFrom: (typeof Cp.sessionName === 'string' ? Cp.sessionName : null)
                              || (document.getElementById('sessionName') || {}).value || null,
                span: span,
                lanes: [...new Set(pick.objs.map(x => x.layer))].sort((a, b) => a - b),
                objects: pack(pick.objs, from),
                overwrite: !!o.overwrite
            };
            // A CAPTURE THAT FAILS MUST SAY SO WHERE HE CAN SEE IT (composer 2026-09-10: *"capture didnt show up in passages"*).
            // It failed silently: the POST returned 404 and the only report was a console.log. `passages.js` is a static file and
            // reloads with the page, but `/api/passages` lives in `server.js`, which is loaded ONCE when node starts — so after a
            // page reload the menu and the buttons are new while the routes are not, and 404 is the expected answer until the
            // server itself is restarted. That case is named on screen now rather than left to be diagnosed. → RUNNING_LOG §364.
            let r, j;
            try {
                r = await fetch('/api/passages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                j = await r.json().catch(() => ({}));
            } catch (e) {
                alert('Capture failed — the score server is not answering.\n\n' + e.message);
                return null;
            }
            if (r.status === 404) {
                alert('Capture failed: this server does not have the passages API yet.\n\n' +
                      'The page reloaded but the SERVER did not — it has been running since before this feature existed.\n\n' +
                      'Stop it and start it again:   node score/server.js\n\nNothing was lost; nothing was written.');
                return null;
            }
            if (!r.ok) { alert('Capture failed: ' + (j.error || ('HTTP ' + r.status))); return null; }
            console.log('captured "' + name + '" — ' + body.objects.length + ' objects (' + pick.why + '), ' + span.toFixed(3) + ' s, lanes ' + body.lanes.join(',') + ' → bank/passages/' + j.file);
            await this.refresh();
            return j;
        },

        // ---- INSERT ----------------------------------------------------------------------------
        async insert(nameOrFile, opts) {
            const Cp = C(), o = opts || {};
            const file = await this.fileFor(nameOrFile);
            if (!file) { console.log('no passage called "' + nameOrFile + '" — passages.list()'); return null; }
            const r = await fetch('/api/passages/' + encodeURIComponent(file));
            if (!r.ok) { console.log('could not read ' + file); return null; }
            const psg = await r.json();
            const at = o.at != null ? o.at : now();
            Cp.pushUndoState();
            const made = unpack(psg.objects || [], at, Cp);
            made.forEach(w => {
                Cp.objects.push(w);
                // the same three-way the score's own redraw uses (composer.html:3048–3050), so anything it can hold, a passage can
                if (w.type === 'waveCurve') Cp.renderWaveCurve(w);
                else if (w.type === 'lineWedge') Cp.renderLineWedge(w);
                else Cp.renderZone(w);
            });
            Cp.selectedObjects = made.slice();
            Cp.selectedObject = made[0] || null;
            made.forEach(w => { if (w._els && w._els.highlight) w._els.highlight.style.display = ''; });
            Cp.markDirty();
            if (Cp.curveDirty) Cp.curveDirty();
            if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
            console.log('inserted "' + psg.name + '" at ' + at.toFixed(3) + ' s — ' + made.length + ' objects, ' + (psg.span || 0).toFixed(3) + ' s, lanes ' + (psg.lanes || []).join(','));
            return made;
        },

        // ---- the collection --------------------------------------------------------------------
        async list() {
            let r;
            try { r = await fetch('/api/passages'); } catch (e) { this._apiMissing = true; return []; }
            // the same 404 the capture path names: the routes are in server.js, which needs a restart, not a page reload
            this._apiMissing = (r.status === 404);
            const l = r.ok ? await r.json() : [];
            this._list = l;
            if (console.table && l.length) console.table(l.map(x => ({ name: x.name, objects: x.objects, seconds: x.span, lanes: (x.lanes || []).join(','), from: x.capturedFrom })));
            else if (!l.length) console.log('the collection is empty — passages.capture("a name") first');
            return l;
        },
        async fileFor(n) {
            if (!n) return null;
            if (String(n).endsWith('.json')) return n;
            const l = (this._list && this._list.length) ? this._list : await this.list();
            const hit = l.find(x => x.name === n) || l.find(x => x.name.toLowerCase() === String(n).toLowerCase()) || l.find(x => x.file === n + '.json');
            return hit ? hit.file : null;
        },
        async remove(n) {
            const file = await this.fileFor(n);
            if (!file) { console.log('no passage called "' + n + '"'); return; }
            const r = await fetch('/api/passages/' + encodeURIComponent(file), { method: 'DELETE' });
            console.log(r.ok ? 'deleted ' + file : 'could not delete ' + file);
            this._list = null;
            await this.refresh();
        },

        // ---- the menu in the top bar -----------------------------------------------------------
        // Deliberately the same three-control shape as the score's own Load: a select and two buttons, in the bar he already
        // uses. No card, no panel — the day's lesson twice over (§355, §358): a control where his hand already is, and nothing
        // for him to paste.
        async refresh() {
            const sel = document.getElementById('psgSelect');
            if (!sel) return;
            const keep = sel.value;
            this._list = null;
            const l = await this.list();
            sel.innerHTML = (this._apiMissing ? '<option value="">-- restart the server --</option>' : '<option value="">-- Passages --</option>') +
                l.map(x => '<option value="' + x.file + '">' + x.name + '  (' + x.objects + ' obj · ' + (x.span != null ? x.span.toFixed(1) : '?') + 's)</option>').join('');
            if (keep && l.some(x => x.file === keep)) sel.value = keep;
        },
        mount() {
            const bar = document.getElementById('topBar');
            if (!bar || document.getElementById('psgSelect')) return;
            const wrap = document.createElement('span');
            wrap.style.cssText = 'display:inline-flex;align-items:center;gap:4px';
            const box = 'width:46px;background:#141419;color:#ddd;border:1px solid #444;padding:1px 2px;font-size:11px';
            const stamp = 'padding:1px 3px;font-size:10px;line-height:1';
            wrap.innerHTML =
                '<span style="opacity:.35">│</span>' +
                '<select id="psgSelect" title="the passage collection — captured stretches of score, insertable at the playhead into any score"><option value="">-- Passages --</option></select>' +
                '<button id="psgInsert" title="insert the chosen passage at the playhead; it arrives selected, so one drag moves the whole thing. CTRL+Z removes it.">insert @ playhead</button>' +
                '<span style="color:#888;font-size:11px;margin-left:4px">from</span>' +
                '<input id="psgFrom" type="number" step="0.01" placeholder="start" style="' + box + '" title="capture start, in seconds. Leave both boxes empty to capture the whole score. The boundary is a net, not a ruler — a passage always begins on its first event, never on the time you typed.">' +
                '<button id="psgFromNow" style="' + stamp + '" title="take the playhead time as the capture start">⤓</button>' +
                '<span style="color:#888;font-size:11px">to</span>' +
                '<input id="psgTo" type="number" step="0.01" placeholder="end" style="' + box + '" title="capture end, in seconds. Leave empty for the end of the score.">' +
                '<button id="psgToNow" style="' + stamp + '" title="take the playhead time as the capture end">⤓</button>' +
                '<button id="psgClear" style="' + stamp + '" title="clear both boxes — back to the whole score (or the selection, if there is one)">✕</button>' +
                '<button id="psgCapture" title="capture what the boxes describe — or the selection, or the whole score when the boxes are empty — as a named passage">capture…</button>';
            const anchor = document.getElementById('blastsBtn');
            if (anchor && anchor.parentNode === bar) bar.insertBefore(wrap, anchor); else bar.appendChild(wrap);
            document.getElementById('psgInsert').addEventListener('click', async () => {
                const v = document.getElementById('psgSelect').value;
                if (!v) { console.log('choose a passage first'); return; }
                await this.insert(v);
            });
            // the playhead into a box, and the boxes back out again
            const put = id => { document.getElementById(id).value = (Math.round(now() * 100) / 100).toFixed(2); };
            document.getElementById('psgFromNow').addEventListener('click', () => put('psgFrom'));
            document.getElementById('psgToNow').addEventListener('click', () => put('psgTo'));
            document.getElementById('psgClear').addEventListener('click', () => {
                document.getElementById('psgFrom').value = '';
                document.getElementById('psgTo').value = '';
            });
            document.getElementById('psgCapture').addEventListener('click', async () => {
                const span = this.boxes();
                const pick = this.which(span);
                if (!pick.objs.length) { alert('Nothing in that range to capture.'); return; }
                // say what will be taken AND where it will start, so a sloppy boundary is visibly harmless before he commits
                const n = prompt('Name this passage\n\n' + pick.objs.length + ' objects — ' + pick.why +
                    '\nfirst event at ' + pick.from.toFixed(2) + ' s; the passage will start there, not at the boundary.', '');
                if (n == null || !n.trim()) return;
                await this.capture(n.trim(), span);
            });
            this.refresh();
        }
    };

    root.passages = P;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => P.mount());
    else P.mount();
})(window);
