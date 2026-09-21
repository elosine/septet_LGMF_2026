// tools/once/make_rhythm_seq.js — A RECORD, NEVER RE-RUN (LGMF PLAN 1l.3, 2026-09-21; RUNNING_LOG §202).
// The one-time transform that gave birth to score/public/rhythm_seq_ui.js from score/public/sequence_ui.js. Later steps (1l.4 …) edit
// the clone BY HAND, so running this again would destroy them: it refuses while the output exists. Kept so the clone's origin can be read.
// make_rhythm_seq.js — PLAN 1l.3: THE RHYTHM SEQUENCE PANEL, cloned from score/public/sequence_ui.js (which is NOT changed).
// Every replacement is asserted to land exactly as many times as expected; the output is score/public/rhythm_seq_ui.js.
const fs = require('fs');
const SRC = 'score/public/sequence_ui.js', OUT = 'score/public/rhythm_seq_ui.js';
if (fs.existsSync(OUT)) { console.error(OUT + ' exists and is edited by hand after its birth — this transform is a record, never re-run'); process.exit(1); }
let s = fs.readFileSync(SRC, 'utf8');
if (s.indexOf('\r\n') >= 0) throw new Error('expected LF source');
const count = (h, n) => h.split(n).length - 1;
const rep = (a, b, n) => { const k = count(s, a); if (k !== (n || 1)) { throw new Error('found ' + k + ' (want ' + (n || 1) + '): ' + a.slice(0, 120)); } s = s.split(a).join(b); };
const cut = (startMark, endMark, insert) => {   // remove [start, end) — each marker exactly once
    if (count(s, startMark) !== 1 || count(s, endMark) !== 1) throw new Error('cut markers: ' + count(s, startMark) + '/' + count(s, endMark) + ' ' + startMark.slice(0, 60));
    const a = s.indexOf(startMark), b = s.indexOf(endMark); if (b <= a) throw new Error('cut order');
    s = s.slice(0, a) + (insert || '') + s.slice(b);
};

// ---------------------------------------------------------------- the header
rep('// sequence_ui.js — THE SEQUENCE DRAWER, one container at a time (PLAN 1d.2, 2026-09-19; RUNNING_LOG §115).\n',
`// rhythm_seq_ui.js — THE RHYTHM SEQUENCE PANEL (LGMF PLAN 1l.3, 2026-09-21; docs/PLAN.md § 1l; RUNNING_LOG §202; LG-56 · LG-57 · LG-60).
//
// A CLONE of the sequence drawer (sequence_ui.js), born 2026-09-21 of a ONE-TIME transform of that file (the script is
// tools/once/make_rhythm_seq.js — a record; later steps edit THIS file by hand, so it is never re-run) and NOT sharing its code — his
// decision (LG-56): "a clone … not a layer on it"; the architecture is looked at again after this version. It does not change one byte
// of the drawer he composes with. Underneath, it READS the drawer's pure harmony arithmetic, score/public/sequence.js, unchanged — so a
// harmony row behaves identically in both, and the two cannot drift (PLAN 1j's buildCarrier / dealSpan twins are the repo's warning).
//
// TWO ROWS ON ONE TIME SCALE (the boxes are laid out by SECONDS here, not by flex, so the two rows line up):
//   · THE HARMONY ROW — his harmony, built exactly as in the drawer: boxes of take · seconds · dynamic, the takes menu and its ▸, the
//     preview on a box, the roll, a range of boxes, the waves by preset (his presets are the drawer's own, one set for both), the EDGES
//     (kept at his word: "the edges will be useful for dynamics"), the clock and the cursor, the library. It is SILENT in the piece —
//     a MAP: each player's pitch and INTENDED WRITTEN LEVEL at every instant (LG-60). Hear auditions it as held chords; it is never
//     inserted.
//   · IT LEAVES OUT the breath line and \`enter\`: nothing is held here, so nothing breathes. The generator is handed a fixed HELD breath
//     (MAP_BREATH — each breath the player's own ceiling, no jitter, aligned) and every box is entered by \`attack\`, so each player's
//     pitch changes exactly at the harmony's lines.
//   · THE RHYTHM ROW — the same idiom, boxes left to right; an empty box is a REST. Its boundaries are INDEPENDENT of the harmony's —
//     a rhythm box can straddle a harmony change. 1l.4's workshop fills it with excerpts of rhythm takes.
// Saved in a library of its own (the \`rhythmseqs\` store, bank/rhythm_sequences.json) — his sequence library is not touched. In the
// score file it will ride as databases.rhythmSequences once Insert exists (1l.5).
//
// Below: the sequence drawer's own account of itself, inherited, and true here except where the lines above say otherwise.
//
// sequence_ui.js — THE SEQUENCE DRAWER, one container at a time (PLAN 1d.2, 2026-09-19; RUNNING_LOG §115).
`);

// ---------------------------------------------------------------- the guard, the colours, the held breath of the map
rep(`if (!D || !SEQ) { console.warn('[sequence_ui] needs the strikes drawer and sequence.js — one is not loaded'); return; }`,
`if (!D || !SEQ) { console.warn('[rhythm_seq_ui] needs the strikes drawer and sequence.js — one is not loaded'); return; }
const SQD = () => root.SequenceDrawer || null;   // 1l.3: the drawer — its curve-channel hook on D.routeFor serves this panel too, and its wave presets are shared`);
rep(`const COLOR = '#5E9FB8', EDGE_ON = '#9fdcf5', EDGE_OFF = '#34525f';`,
`const COLOR = '#C08A52', EDGE_ON = '#f0c890', EDGE_OFF = '#5a4630';   // 1l.3: warm, so the rhythm panel is never mistaken for the drawer
// 1l.3 — THE MAP'S BREATH. The harmony row is a map, not a performance: each player holds a box's note from line to line. The generator
// still splits a note at the instrument's ceiling (it must, and a split is continuous for the map — 1l.5 bridges the gap), so each
// breath is built round the player's OWN maximum with no jitter, aligned, and every box is entered by attack.
const MAP_BREATH = { striation: 'aligned', length: 30, jitter: 0, seed: 1, together: null, apart: 0.5, lengths: null, ofMax: 1, jitterS: 0 };
const MIN_PPS = 6;   // 1l.3: the two rows' shared time scale never goes below this many pixels a second (the rows then scroll)`);

// ---------------------------------------------------------------- the row: no breath dials, no enter; a rhythm row
rep(`newRow() { return { id: 's' + Date.now().toString(36), name: '', change: 'attack', breath: Object.assign({}, SEQ.DEFAULT_BREATH, NEW_BREATH, this.breathDefault() || {}), waves: this.wavesDefaults(), edges: this.edgesDefaults(), boxes: [], roll: this.rollDefaults(), rolled: false }; },`,
`newRow() { return { id: 'r' + Date.now().toString(36), name: '', change: 'attack', breath: Object.assign({}, MAP_BREATH), waves: this.wavesDefaults(), edges: this.edgesDefaults(), boxes: [], rhythm: [], roll: this.rollDefaults(), rolled: false }; },
    // 1l.3 — A RHYTHM BOX: an excerpt of a rhythm take (1l.4: take · start · stop, its length stop − start), or, with no take, a REST
    newRBox() { return { take: '', start: 0, stop: 0, dur: DEF_DUR }; },
    rboxFrom(b) { return { take: String((b && b.take) || ''), start: +(b && b.start) || 0, stop: +(b && b.stop) || 0, dur: clampDur(b && b.dur) }; },`);
rep(`        return { id: r.id, name: String(r.name || ''), change: SEQ.CHANGES.indexOf(r.change) >= 0 ? r.change : 'attack',
            breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}), waves: this.wavesDefaults(r.waves), edges: this.edgesDefaults(r.edges), roll: Object.assign(this.rollDefaults(), r.roll || {}), rolled: !!r.rolled,
            boxes: r.boxes.map(b => ({ take: String((b && b.take) || ''), dur: clampDur(b && b.dur), dyn: this.dynOk(b && b.dyn), dynWas: this.straightOk(b && b.dynWas), change: this.changeOk(b && b.change), range: this.rangeOk(b && b.range), chord: Array.isArray(b && b.chord) ? b.chord : [], frozen: String((b && b.frozen) || '') })) };`,
`        return { id: r.id, name: String(r.name || ''), change: 'attack',   // 1l.3: every box entered by attack; the map's own breath
            breath: Object.assign({}, MAP_BREATH), waves: this.wavesDefaults(r.waves), edges: this.edgesDefaults(r.edges), roll: Object.assign(this.rollDefaults(), r.roll || {}), rolled: !!r.rolled,
            boxes: r.boxes.map(b => ({ take: String((b && b.take) || ''), dur: clampDur(b && b.dur), dyn: this.dynOk(b && b.dyn), dynWas: this.straightOk(b && b.dynWas), change: null, range: this.rangeOk(b && b.range), chord: Array.isArray(b && b.chord) ? b.chord : [], frozen: String((b && b.frozen) || '') })),
            rhythm: Array.isArray(r.rhythm) ? r.rhythm.map(b => this.rboxFrom(b)) : [] };`);
rep(`    libBlank() { return !this.row.boxes.length && !this.row.name && !this.row.rolled; },`,
`    libBlank() { return !this.row.boxes.length && !(this.row.rhythm || []).length && !this.row.name && !this.row.rolled; },`);
rep(`        if (this.row.rolled) this.rollOpen = true;
        if (!this.isDefaultBreath()) this.breathOpen = true;
        if (this.row.boxes.some(b => b.dyn === WAVES)) this.wavesOpen = true;`,
`        if (this.row.rolled) this.rollOpen = true;
        if (this.row.boxes.some(b => b.dyn === WAVES)) this.wavesOpen = true;`);
rep(`        this.sel = this.row.boxes.length ? 0 : -1; this.selTo = null;
        if (this.row.rolled) this.rollOpen = true;   // a rolled sequence shows how its durations were made
        if (!this.isDefaultBreath()) this.breathOpen = true;   // and one whose breath was set shows its dials (1d.5)
`,
`        this.sel = this.row.boxes.length ? 0 : -1; this.selTo = null;
        if (this.row.rolled) this.rollOpen = true;   // a rolled sequence shows how its durations were made
`);
// the round trip (1l.5 will use it): a reopened recipe keeps its rhythm row
rep(`            boxes: (R.containers || []).map(c => ({ take: String(c.take || ''), dur: clampDur(c.dur), dyn: this.dynOk(c.dyn), dynWas: this.straightOk(c.dynWas), change: (this.changeOk(c.change) && c.change !== R.change) ? c.change : null, range: this.rangeOk(c.range), chord: JSON.parse(JSON.stringify(c.chord || [])), frozen: '' })) };`,
`            boxes: (R.containers || []).map(c => ({ take: String(c.take || ''), dur: clampDur(c.dur), dyn: this.dynOk(c.dyn), dynWas: this.straightOk(c.dynWas), change: null, range: this.rangeOk(c.range), chord: JSON.parse(JSON.stringify(c.chord || [])), frozen: '' })),
            rhythm: (R.rhythm || []).map(b => this.rboxFrom(b)) };`);
rep(`    coreOf(r) { return JSON.stringify({ change: r.change,`, `    coreOf(r) { return JSON.stringify({ rhythm: r.rhythm || [], change: r.change,`);

// ---------------------------------------------------------------- build: the head, the two rows
rep(`        const sb = document.getElementById('strikesBtn');
        if (sb && !document.getElementById('sequenceBtn')) {
            const btn = document.createElement('button');
            btn.id = 'sequenceBtn'; btn.textContent = 'Sequence';
            btn.title = 'the SEQUENCE drawer (docs/SEQUENCE_TOOL.md): saved takes from the strikes drawer held as sustained chords, each for a duration, in a row of time containers — hear it, put it in the score';`,
`        const sb = document.getElementById('sequenceBtn') || document.getElementById('strikesBtn');   // 1l.3: beside the drawer's own button
        if (sb && !document.getElementById('sequenceBtn')) {
            const btn = document.createElement('button');
            btn.id = 'sequenceBtn'; btn.textContent = 'Rhythm';
            btn.title = 'the RHYTHM SEQUENCE panel (PLAN 1l): a silent HARMONY row — the map of every player\\'s pitch and written level — and a RHYTHM row of excerpts from Texture\\'s rhythm takes on top, every dot reading its pitch and level from the harmony beneath';`);
rep(`              '<b style="color:' + COLOR + ';letter-spacing:.08em">SEQUENCE</b>' +`, `              '<b style="color:' + COLOR + ';letter-spacing:.08em">RHYTHM SEQUENCE</b>' +`);
rep(`              '<select id="sqList" style="max-width:18.182em;' + INP + '"`, `              '<select id="sqList" style="display:none;max-width:18.182em;' + INP + '"`);   // 1l.3: the round trip arrives with Insert (1l.5)
rep(`              '<label title="how a new chord is taken — attack: everyone starts AT the line, together · seamless: each player takes the new chord at its next breath">change <select id="sqChange" style="' + INP + '">' + SEQ.CHANGES.map(c => '<option value="' + c + '">' + c + '</option>').join('') + '</select></label>' +
              '<button id="sqAdd" style="' + BTN + '" title="add a container at the end of the row">+ container</button>' +`,
`              '<button id="sqAdd" style="' + BTN + '" title="add a HARMONY box at the end of the harmony row — a take, its seconds, its dynamic: the map the rhythm reads">+ harmony box</button>' +
              '<button id="sqRAdd" style="' + BTN + ';color:#f0c890" title="add a RHYTHM box at the end of the rhythm row — a rest until the workshop (1l.4) gives it an excerpt of a rhythm take. Its lines are its own: it may straddle a harmony change">+ rhythm box</button>' +`);
rep(`              '<button id="sqBreathTog" style="' + BTN + ';color:#8fd0a0" title="the BREATH: how the players breathe and bow under the chords — the morph\\'s numbers until you touch one. Never together, sometimes, always; short breaths with long">breath</button>' +\n`, '');
rep(`              '<button id="sqHear" style="' + BTN + '" title="play the sequence through the strikes drawer\\'s own player — the same levels, the same bends (SPACE)">Hear</button>' +`,
`              '<button id="sqHear" style="' + BTN + '" title="AUDITION THE MAP: the harmony row as held chords, through the strikes drawer\\'s own player, to check it by ear (SPACE). It is never inserted — the harmony is silent in the piece">Hear</button>' +`);
rep(`              '<button id="sqInsert" style="' + BTN + '">Insert @ playhead</button>' +
              '<button id="sqMove" style="' + BTN + ';display:none" title="move this sequence to the playhead — the notes where it sits now are removed and it is written again from the playhead">move to playhead</button>' +`,
`              '<button id="sqInsert" style="' + BTN + ';display:none">Insert @ playhead</button>' +   // 1l.3: Insert arrives with 1l.5 — the rhythm, every dot reading the harmony
              '<button id="sqMove" style="' + BTN + ';display:none" title="move this sequence to the playhead — the notes where it sits now are removed and it is written again from the playhead">move to playhead</button>' +`);
rep(`            '<div id="sqBreath" style="display:none;gap:6px;row-gap:3px;align-items:center;flex-wrap:wrap;padding:3px 8px;white-space:nowrap;border-bottom:1px solid #2c3238"></div>' +\n`, '');
rep(`              '<div id="sqRow" style="position:relative;display:flex;gap:3px;flex:1 1 auto;min-width:100%"></div>' +`,
`              // 1l.3: TWO ROWS ON ONE TIME SCALE — the rhythm row on top, the harmony row (the map) beneath; the cursor and Hear's line run down both
              '<div id="sqRows" style="position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:3px">' +
                '<div style="color:#b09070;font-size:.8em;line-height:1">rhythm</div>' +
                '<div id="sqRRow" style="position:relative;flex:0 0 3.2em"></div>' +
                '<div style="color:#7a9aa8;font-size:.8em;line-height:1">harmony — the map (silent)</div>' +
                '<div id="sqRow" style="position:relative;flex:1 1 auto;min-height:5.2em"></div>' +
              '</div>' +`);
rep(`        q('#sqChange').addEventListener('change', e => {
            // 1d.8: the head's \`change\` is the sequence's rule AND sets every box — it asks before it overwrites boxes flipped by hand
            const c = SEQ.CHANGES.indexOf(e.target.value) >= 0 ? e.target.value : 'attack', flipped = this.row.boxes.filter(b => b.change && b.change !== c).length;
            e.target.blur();
            if (flipped && !window.confirm('Set every box to ' + c + '?\\n\\n' + flipped + ' box' + (flipped === 1 ? ' is' : 'es are') + ' entered another way by hand — that will be overwritten.')) { e.target.value = this.row.change; return; }
            this.row.change = c; this.row.boxes.forEach(b => { b.change = null; }); this.save(); this.render();
            this.setStatus('change: every box is entered by ' + c + (c === 'attack' ? ' — everyone starts at the line, together' : ' — each player takes the new chord at its next breath') + ' · any one box can be flipped on its own line (\`enter\`)');
        });
`, '');
rep(`        q('#sqAdd').addEventListener('click', () => this.addBox());`, `        q('#sqAdd').addEventListener('click', () => this.addBox());
        q('#sqRAdd').addEventListener('click', () => this.addRBox());   // 1l.3`);
rep(`        q('#sqBreathTog').addEventListener('click', () => { this.breathOpen = !this.breathOpen; this.save(); this.paintBreath(); this.fitStrikes(); });
        this.buildBreath();
`, '');
rep(`        tab.id = 'sequenceTab'; tab.textContent = 'SEQUENCE ▴'; tab.title = 'open the sequence drawer';
        tab.style.cssText = 'position:fixed;right:118px;bottom:0;z-index:8999;background:#16323d;color:#bfe6f5;border:1px solid ' + COLOR`,
`        tab.id = 'sequenceTab'; tab.textContent = 'RHYTHM ▴'; tab.title = 'open the rhythm sequence panel';
        tab.style.cssText = 'position:fixed;right:262px;bottom:0;z-index:8999;background:#3d2a16;color:#f5dcbf;border:1px solid ' + COLOR`);
rep(`        if (b) { b.style.background = show ? '#16323d' : ''; b.style.color = show ? '#bfe6f5' : ''; }`, `        if (b) { b.style.background = show ? '#3d2a16' : ''; b.style.color = show ? '#f5dcbf' : ''; }`);
rep(`        if (show) { this.clampWindow(); this.paintRoll(); this.paintBreath(); this.paintWaves(); this.paintEdges(); }`, `        if (show) { this.clampWindow(); this.paintRoll(); this.paintWaves(); this.paintEdges(); }`);
// the window opens a little above the drawer's default, so the two are not stacked exactly
rep(`        return { x: Math.round((window.innerWidth - w) / 2), y: Math.max(WIN.PAD, window.innerHeight - h - WIN.PAD), w: Math.round(w), h: Math.round(h) };`,
`        return { x: Math.round((window.innerWidth - w) / 2), y: Math.max(WIN.PAD, window.innerHeight - h - WIN.PAD - 60), w: Math.round(w), h: Math.round(h + 40) };`);

// ---------------------------------------------------------------- render: no \`change\`, no breath; the rhythm row
rep(`        q('#sqChange').value = this.row.change; q('#sqFrom').value = this.hearFrom;
        const n = this.row.boxes.length;
        q('#sqTotal').textContent = n ? (n + ' box' + (n > 1 ? 'es' : '') + ' · ' + fmtS(this.total()) + ' s') : '';
        this.renderRow(); this.renderEdit(); this.renderList(); this.paintInsert(); this.paintLib(); this.paintRoll(); this.paintBreath(); this.paintWaves(); this.paintEdges();`,
`        q('#sqFrom').value = this.hearFrom;
        const n = this.row.boxes.length, nr = (this.row.rhythm || []).length;
        q('#sqTotal').textContent = (n ? 'harmony ' + n + ' box' + (n > 1 ? 'es' : '') + ' · ' + fmtS(this.total()) + ' s' : '') + (nr ? (n ? ' · ' : '') + 'rhythm ' + nr + ' · ' + fmtS(this.rtotal()) + ' s' : '');
        this.renderRow(); this.renderRRow(); this.renderEdit(); this.renderList(); this.paintInsert(); this.paintLib(); this.paintRoll(); this.paintWaves(); this.paintEdges();`);

// ---------------------------------------------------------------- the harmony row, laid out by SECONDS
rep(`    renderRow() {
        const row = this.el.querySelector('#sqRow'); row.innerHTML = '';`,
`    // 1l.3 — ONE TIME SCALE FOR BOTH ROWS: pixels a second, from the longer row and the room there is (never under MIN_PPS — then the rows scroll)
    rtotal() { return (this.row.rhythm || []).reduce((a, b) => a + (+b.dur || 0), 0); },
    ppsNow() {
        const wrap = this.el && this.el.querySelector('#sqRowWrap'), avail = Math.max(200, ((wrap && wrap.clientWidth) || 900) - 20);
        return Math.max(MIN_PPS, avail / Math.max(1, this.total(), this.rtotal()));
    },
    renderRow() {
        const row = this.el.querySelector('#sqRow'); row.innerHTML = '';
        const rows = this.el.querySelector('#sqRows'), pps = this.pps = this.ppsNow();
        rows.querySelectorAll('#sqLine,#sqCursorLine').forEach(x => x.remove());
        rows.style.width = Math.ceil(Math.max(this.total(), this.rtotal()) * pps) + 'px'; rows.style.minWidth = '100%';
        let at = 0;`);
rep(`            hint.textContent = 'an empty row — "+ container" adds a box; click a box to give it a take, its seconds and its dyn';`,
`            hint.textContent = 'the harmony row is empty — "+ harmony box" adds a box; click a box to give it a take, its seconds and its dyn';`);
rep(`            const own = (b.change && b.change !== this.row.change) ? b.change : null;   // 1d.8: a box entered another way than the sequence's rule wears it`,
`            const own = null;   // 1l.3: no \`enter\` here — every box is entered by attack`);
rep(`            d.style.cssText = 'position:relative;flex:' + Math.max(0.1, +b.dur || 0) + ' 1 0;min-width:8.727em;box-sizing:border-box;padding:3px 6px;border-radius:4px;cursor:pointer;overflow:hidden;' +`,
`            const x0 = at * pps, wpx = Math.max(4, (+b.dur || 0) * pps - 3); at += +b.dur || 0;   // 1l.3: by SECONDS, so the rhythm row lines up
            d.style.cssText = 'position:absolute;top:0;bottom:0;left:' + x0 + 'px;width:' + wpx + 'px;box-sizing:border-box;padding:3px 6px;border-radius:4px;cursor:pointer;overflow:hidden;' +`);
rep(`                this.sel = i; this.selTo = null; this.save(); this.render();
            });
            if (!empty) {   // the PREVIEW`,
`                this.sel = i; this.selTo = null; this.rsel = -1; this.save(); this.render();
            });
            if (!empty) {   // the PREVIEW`);
rep(`        const line = document.createElement('div');
        line.id = 'sqLine'; line.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#fff;opacity:.85;display:none;pointer-events:none';
        row.appendChild(line);
        const cur = document.createElement('div');   // 1d.15: the cursor's own line, down the boxes
        cur.id = 'sqCursorLine'; cur.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#e8a06a;opacity:.8;display:none;pointer-events:none';
        row.appendChild(cur);`,
`        const line = document.createElement('div');
        line.id = 'sqLine'; line.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#fff;opacity:.85;display:none;pointer-events:none;z-index:2';
        rows.appendChild(line);   // 1l.3: down BOTH rows
        const cur = document.createElement('div');   // 1d.15: the cursor's own line, down the boxes
        cur.id = 'sqCursorLine'; cur.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#e8a06a;opacity:.8;display:none;pointer-events:none;z-index:2';
        rows.appendChild(cur);`);

// ---------------------------------------------------------------- the edit line: no \`enter\`; a rhythm box has its own
rep(`        const ed = this.el && this.el.querySelector('#sqEdit'); if (!ed) return;
        const i = this.sel, b = this.row.boxes[i];`,
`        const ed = this.el && this.el.querySelector('#sqEdit'); if (!ed) return;
        if (this.rsel != null && this.rsel >= 0 && (this.row.rhythm || [])[this.rsel]) return this.renderREdit();   // 1l.3: a rhythm box is selected
        const i = this.sel, b = this.row.boxes[i];`);
rep(`            '<label title="how THIS box is entered — attack: everyone lands a breath before its line and starts AT it, together · seamless: each player takes it at their next breath. The head\\'s \`change\` sets every box; this flips one. On box 1 it is how the sequence BEGINS: attack = everyone together, seamless = staggered">enter <select id="sqEnter" style="' + INP + '">' + SEQ.CHANGES.map(c => '<option value="' + c + '">' + c + '</option>').join('') + '</select></label>' +\n`, '');
rep(`        q('#sqDyn').value = b.dyn; q('#sqEnter').value = b.change || this.row.change;`, `        q('#sqDyn').value = b.dyn;`);
rep(`        q('#sqEnter').addEventListener('change', e => {
            const c = this.changeOk(e.target.value) || this.row.change; e.target.blur();
            const n = this.eachSel(x => { x.change = c === this.row.change ? null : c; });
            this.save(); this.render();
            this.setStatus(this.selLabel() + ' ' + (n === 1 ? 'is' : 'are') + ' entered by ' + c + (c === this.row.change ? ' — the sequence\\'s own rule' : ' — the rest stay ' + this.row.change) + (this.selSpan().a === 0 ? ' · box 1: this is how the sequence BEGINS (' + (c === 'attack' ? 'everyone together' : 'staggered') + ')' : ''));
        });
`, '');
rep(`    addBox() { this.row.boxes.push(this.newBox()); this.sel = this.row.boxes.length - 1; this.selTo = null; this.save(); this.render(); this.setStatus('box ' + (this.sel + 1) + ' added — choose its take (a box left without one is a REST)'); },`,
`    addBox() { this.row.boxes.push(this.newBox()); this.sel = this.row.boxes.length - 1; this.selTo = null; this.rsel = -1; this.save(); this.render(); this.setStatus('harmony box ' + (this.sel + 1) + ' added — choose its take (a box left without one is a REST)'); },

    // ------------------------------------------------------------------ 1l.3 — THE RHYTHM ROW: the same idiom, on the same time scale, its lines its own
    renderRRow() {
        const row = this.el.querySelector('#sqRRow'); if (!row) return;
        row.innerHTML = '';
        const R = this.row.rhythm || [], pps = this.pps || this.ppsNow();
        if (!R.length) {
            const hint = document.createElement('div');
            hint.style.cssText = 'color:#8a7a68;padding:.5em 8px;white-space:nowrap';
            hint.textContent = 'the rhythm row is empty — the workshop (PLAN 1l.4) fills it with excerpts of rhythm takes; "+ rhythm box" adds a rest';
            row.appendChild(hint); return;
        }
        let at = 0;
        R.forEach((b, i) => {
            const on = i === this.rsel, rest = !b.take, x0 = at * pps, wpx = Math.max(4, (+b.dur || 0) * pps - 3); at += +b.dur || 0;
            const d = document.createElement('div');
            d.className = 'sqRBox'; d.dataset.i = i;
            d.style.cssText = 'position:absolute;top:0;bottom:0;left:' + x0 + 'px;width:' + wpx + 'px;box-sizing:border-box;padding:2px 6px;border-radius:4px;cursor:pointer;overflow:hidden;white-space:nowrap;' +
                'background:' + (on ? '#4a3420' : (rest ? '#1f1a16' : '#2c241c')) + ';border:1px ' + (rest ? 'dashed ' : 'solid ') + (on ? EDGE_ON : (rest ? '#6a5a4a' : '#6a5030'));
            d.title = rest ? 'a REST in the rhythm row — silence for its ' + fmtS(b.dur) + ' s' : 'rhythm take "' + b.take + '" · ' + fmtS(b.start) + ' → ' + fmtS(b.stop) + ' s';
            d.innerHTML = '<span style="color:#a98">' + (i + 1) + '</span> <span style="color:' + (rest ? '#8a7a68;font-style:italic' : '#f5e6d4') + '">' + esc(rest ? 'rest' : b.take) + '</span> <span style="color:#b9a">' + fmtS(b.dur) + ' s</span>';
            d.addEventListener('click', () => { this.rsel = i; this.save(); this.render(); });
            row.appendChild(d);
        });
    },
    renderREdit() {
        const ed = this.el.querySelector('#sqEdit'), i = this.rsel, b = this.row.rhythm[i];
        ed.innerHTML = '<b style="color:#f0c890">rhythm box ' + (i + 1) + '</b>' +
            (b.take ? '<span style="color:#b9a">take "' + esc(b.take) + '" · ' + fmtS(b.start) + ' → ' + fmtS(b.stop) + ' s · ' + fmtS(b.dur) + ' s</span>'
                    : '<label><input id="sqRDur" type="number" min="' + MIN_DUR + '" max="' + MAX_DUR + '" step="0.5" style="width:5.091em;' + INP + '"> s</label>') +
            '<button id="sqRLeft" style="' + BTN + '" title="move this rhythm box earlier">◂</button><button id="sqRRight" style="' + BTN + '" title="move this rhythm box later">▸</button>' +
            '<button id="sqRDel" style="' + BTN + '" title="remove this rhythm box">×</button>' +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:#9ab">' + (b.take ? 'an excerpt of a rhythm take — its length is its cut' : 'a REST — silence for its ' + fmtS(b.dur) + ' s. The workshop (1l.4) gives a box an excerpt of a rhythm take') + '</span>';
        const q = s => ed.querySelector(s);
        if (q('#sqRDur')) {
            q('#sqRDur').value = b.dur;
            q('#sqRDur').addEventListener('change', e => { b.dur = clampDur(e.target.value); e.target.blur(); this.save(); this.render(); });
            q('#sqRDur').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); e.target.blur(); } });
        }
        q('#sqRLeft').addEventListener('click', () => this.moveRBox(i, -1));
        q('#sqRRight').addEventListener('click', () => this.moveRBox(i, 1));
        q('#sqRDel').addEventListener('click', () => this.removeRBox(i));
    },
    addRBox() { if (!this.row.rhythm) this.row.rhythm = []; this.row.rhythm.push(this.newRBox()); this.rsel = this.row.rhythm.length - 1; this.save(); this.render(); this.setStatus('rhythm box ' + (this.rsel + 1) + ' added — a rest for now; the workshop (1l.4) gives a box an excerpt of a rhythm take'); },
    removeRBox(i) { const R = this.row.rhythm || []; if (!R[i]) return; R.splice(i, 1); this.rsel = R.length ? Math.min(i, R.length - 1) : -1; this.save(); this.render(); },
    moveRBox(i, by) { const R = this.row.rhythm || [], j = i + by; if (!R[i] || j < 0 || j >= R.length) return; const t = R[i]; R[i] = R[j]; R[j] = t; this.rsel = j; this.save(); this.render(); },`);

// ---------------------------------------------------------------- the breath section goes whole; the presets are the drawer's
cut('    // ------------------------------------------------------------------ the breath (1d.5): the generator\'s own dials — the morph\'s numbers until he touches one\n',
    '    // ------------------------------------------------------------------ a box takes its chord: the take, LOADED in the strikes drawer, as `long tone` deals it\n',
    '    // 1l.3: THE BREATH LINE IS LEFT OUT — nothing is held here, so nothing breathes (MAP_BREATH, at the head of this file).\n\n');
rep(`    presetIx() { return (this._lib && this._lib[PRESET_PANEL]) || {}; },`,
`    // 1l.3: ONE SET OF WAVE PRESETS for both panels — his, kept in the drawer's store (bank/sequences.json, panel wavePresets)
    presetIx() { const Q = SQD(); return (Q && Q._lib && Q._lib[PRESET_PANEL]) || {}; },
    async presetPost(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ store: 'sequences', panel: PRESET_PANEL }, body)) });
        const j = await r.json().catch(() => null);
        if (!j || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status));
        const Q = SQD(); if (Q) { Q._lib = Q._lib || {}; const P = Q._lib[PRESET_PANEL] = Q._lib[PRESET_PANEL] || {}; if (body.delete) delete P[body.name]; else P[body.name] = { saved: new Date().toISOString(), state: body.state }; Q._preSig = null; }
        return j;
    },`);
rep(`        try { await this.libPost({ panel: PRESET_PANEL, name: name, state: { waves: w } }); } catch (e) { this.setStatus('the preset did not save: ' + (e && e.message || e), true); return; }
        this._lib = this._lib || {}; (this._lib[PRESET_PANEL] = this._lib[PRESET_PANEL] || {})[name] = { saved: new Date().toISOString(), state: { waves: w } };`,
`        try { await this.presetPost({ name: name, state: { waves: w } }); } catch (e) { this.setStatus('the preset did not save: ' + (e && e.message || e), true); return; }`);
rep(`        try { await this.libPost({ panel: PRESET_PANEL, name: name, delete: true }); } catch (e) { this.setStatus('not deleted: ' + (e && e.message || e), true); return; }
        delete this._lib[PRESET_PANEL][name];`,
`        try { await this.presetPost({ name: name, delete: true }); } catch (e) { this.setStatus('not deleted: ' + (e && e.message || e), true); return; }`);

// ---------------------------------------------------------------- the recipe: the map's breath, attack everywhere, the rhythm row carried
rep(`        return Object.assign({ t0: +t0 || 0, change: r.change, breath: Object.assign({}, SEQ.DEFAULT_BREATH, r.breath || {}),
            containers: r.boxes.map(b => Object.assign({ dur: +b.dur, dyn: b.dyn, take: b.take, chord: b.chord.length ? b.chord : null }, b.dyn === WAVES ? { dynWas: b.dynWas || AS_DEALT } : {},
                this.rangeOk(b.range) ? { range: this.rangeOk(b.range) } : {},   // 1d.12: a box may read the waves through a range of its own
                (b.change && b.change !== r.change) ? { change: b.change } : {})) },   // 1d.8: a box carries its own \`enter\` only when it differs from the sequence's`,
`        // 1l.3: the MAP's breath and \`attack\` at every line (nothing breathes here) — and the RHYTHM row, which sequence.js ignores
        return Object.assign({ t0: +t0 || 0, change: 'attack', breath: Object.assign({}, MAP_BREATH),
            containers: r.boxes.map(b => Object.assign({ dur: +b.dur, dyn: b.dyn, take: b.take, chord: b.chord.length ? b.chord : null }, b.dyn === WAVES ? { dynWas: b.dynWas || AS_DEALT } : {},
                this.rangeOk(b.range) ? { range: this.rangeOk(b.range) } : {})),   // 1d.12: a box may read the waves through a range of its own
            rhythm: (r.rhythm || []).map(b => ({ take: b.take, start: +b.start || 0, stop: +b.stop || 0, dur: +b.dur })) },`);
rep(`        if (!this.row.boxes.length) { this.setStatus('an empty row — "+ container" first', true); return null; }`,
`        if (!this.row.boxes.length) { this.setStatus('the harmony row is empty — "+ harmony box" first', true); return null; }`);
rep(`        const label = 'the sequence · ' + this.row.boxes.length + ' box'`, `        const label = 'the harmony map · ' + this.row.boxes.length + ' box'`);

// ---------------------------------------------------------------- the clock and the cursor, on the shared scale
rep(`    timeAtX(x) {
        const boxes = this.el.querySelectorAll('.sqBox'); if (!boxes.length) return null;
        let acc = 0;
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i], dur = +this.row.boxes[i].dur || 0, l = b.offsetLeft, w = b.offsetWidth;
            if (x < l + w || i === boxes.length - 1) return acc + dur * clamp((x - l) / Math.max(1, w), 0, 1);
            acc += dur;
        }
        return acc;
    },
    xAtTime(t) {
        const boxes = this.el.querySelectorAll('.sqBox'); if (!boxes.length) return null;
        let acc = 0;
        for (let i = 0; i < boxes.length; i++) {
            const dur = +this.row.boxes[i].dur || 0, b = boxes[i];
            if (t <= acc + dur || i === boxes.length - 1) return b.offsetLeft + b.offsetWidth * clamp((t - acc) / Math.max(0.001, dur), 0, 1);
            acc += dur;
        }
        return null;
    },`,
`    // 1l.3: the two rows share ONE scale (this.pps pixels a second), so a time is a place and a place a time — on either row
    timeAtX(x) { const pps = this.pps || this.ppsNow(); return this.row.boxes.length ? clamp(x / pps, 0, this.total()) : null; },
    xAtTime(t) { const pps = this.pps || this.ppsNow(); return this.row.boxes.length ? clamp(t, 0, this.total()) * pps : null; },`);
rep(`            let i = 0; while (i < B.length - 2 && B[i + 1] <= t) i++;
            const box = this.el.querySelectorAll('.sqBox')[i];
            if (box && t >= 0) { const f = clamp((t - B[i]) / Math.max(0.001, B[i + 1] - B[i]), 0, 1); line.style.left = (box.offsetLeft + f * box.offsetWidth) + 'px'; line.style.display = 'block'; }`,
`            if (t >= 0) { line.style.left = (clamp(t - B[0], 0, this.total()) * (this.pps || this.ppsNow())) + 'px'; line.style.display = 'block'; }   // 1l.3: the shared scale`);
rep(`        const row = this.el.querySelector('#sqRow'); if (!row || !this.row.boxes.length) return;
        const x = ev.clientX - row.getBoundingClientRect().left;`,
`        const row = this.el.querySelector('#sqRows'); if (!row || !this.row.boxes.length) return;
        const x = ev.clientX - row.getBoundingClientRect().left;`);

// ---------------------------------------------------------------- Insert waits for 1l.5
rep(`    insert(toPlayhead) {
        const C = C_(); if (!C || typeof C.getTimeAtPlayhead !== 'function') { this.setStatus('the composer is not reachable', true); return; }`,
`    insert(toPlayhead) {
        // 1l.3: NOT YET. The harmony row is a silent MAP and is never inserted; what goes into the score is the RHYTHM, every dot reading
        // its pitch and written level from the harmony beneath — PLAN 1l.5 writes that. The drawer's insert is kept below for 1l.5 to rework.
        if (!this.allowInsert) { this.setStatus('Insert arrives with PLAN 1l.5 — the rhythm, every dot reading the harmony beneath. The harmony row is a silent map: it is never inserted', true); return; }
        const C = C_(); if (!C || typeof C.getTimeAtPlayhead !== 'function') { this.setStatus('the composer is not reachable', true); return; }`);

// ---------------------------------------------------------------- the hooks: the drawer's curve-channel hook already serves us; SPACE is ours when clicked last
cut('// ---------------------------------------------------------------- PLAN 1e V2b: the second hook — a MARKER seat resolves to a curve channel\n',
    '// ---------------------------------------------------------------- the one hook on what the drawer does: SPACE, when this strip was clicked last\n',
    '// 1l.3: the drawer\'s curve-channel hook on D.routeFor (sequence_ui.js, PLAN 1e V2b) is ALREADY installed and resolves this panel\'s marker\n// seats too — a second wrap would only stack the same work. SequenceDrawer must therefore load first (composer.html orders it so).\n\n');

// ---------------------------------------------------------------- global renames: the panel's own names, the rhythm panel's store and score key
rep(`const STORE = 'lgmf.sequenceDrawer.v1';`, `const STORE = 'lgmf.rhythmSequence.v1';`);
rep(`const LIB = { store: 'sequences', named: 'library', untitled: 'untitled', max: 50, debounce: 2000 };`, `const LIB = { store: 'rhythmseqs', named: 'library', untitled: 'untitled', max: 50, debounce: 2000 };   // 1l.3: bank/rhythm_sequences.json`);
rep(`        this.row.id = 's' + Date.now().toString(36);`, `        this.row.id = 'r' + Date.now().toString(36);`);
rep('root.SequenceDrawer = S;', 'root.RhythmSequence = S;');
s = s.split('databases.sequences').join('databases.rhythmSequences');
s = s.split("'grp-seq-'").join("'grp-rseq-'");
s = s.split("srcKind: 'sequence'").join("srcKind: 'rhythmSequence'");
s = s.split('bank/sequences.json').join('bank/rhythm_sequences.json');
s = s.split('sequenceDrawer').join('rhythmSeqPanel');
s = s.split('sequenceBtn').join('rhythmSeqBtn');
s = s.split('sequenceTab').join('rhythmSeqTab');
s = s.replace(/\bsq([A-Z][A-Za-z0-9]*)/g, 'rs$1');
// the presets ARE in bank/sequences.json (the drawer's store): put that one message back
s = s.split("' · it is in bank/rhythm_sequences.json and rides in the repo'").join("' · it is in bank/sequences.json (shared with the sequence drawer) and rides in the repo'");
// the button anchors on the DRAWER's button: its id was renamed with the rest, so name it again (after the renames)
s = s.split("document.getElementById('rhythmSeqBtn') || document.getElementById('strikesBtn');   // 1l.3").join("document.getElementById('sequenceBtn') || document.getElementById('strikesBtn');   // 1l.3");
if (/\bsq[A-Z]/.test(s)) throw new Error('an sq id survived');
fs.writeFileSync(OUT, s);
console.log('wrote', OUT, s.split('\n').length, 'lines');
