// test_identity.js — PLAN 2d.1, the identity contract (docs/NOTATION_IDENTITY.md). A note's id is stable from the moment it is
// drawn, through every edit that keeps it, into the IR as ev-wc-N, across any number of re-extracts — and no id is handed out twice.
// `node tools/test_identity.js [--score piece-septet | --file <path to a score>]` → PASS / FAIL lines and a verdict. Reads the
// score, never writes it.
//
// The composer's OWN code runs here: generateId · maxIdNumber · pushUndoState · undo · redo · restoreData · duplicateNote are
// lifted out of composer.html by name and run on a stub Composer (no DOM). The note card's edits are closures on its DOM
// (note_card.js commit(fn)) that change `this.wc` in place; this test makes the same field changes on the same objects, and the
// running-app walk (RUNNING_LOG §391) is the proof of the card's own path.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const T0 = Date.now();
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FILE = arg('file', null);   // 2d.1.4: another repo's score read where it lies (the tuba piece's — read-only, nothing staged)
const scoreName = FILE ? path.basename(FILE, '.json') : arg('score', 'piece-septet');
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const Extract = require(path.join(ROOT, 'notation', 'lib', 'extract_core.js'));
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const clone = o => JSON.parse(JSON.stringify(o));

// ---- the composer's own methods, lifted by name ----
// A method of the Composer literal starts "    name(…) {" at four spaces and ends at the next line that is "    }," at four —
// the file's own layout, held by every method it has.
function method(name) {
    const lines = html.split('\n');
    const i = lines.findIndex(l => new RegExp('^    ' + name + '\\([^)]*\\)\\s*\\{\\s*$').test(l));
    if (i < 0) throw new Error('composer.html: method ' + name + ' not found');
    const j = lines.findIndex((l, k) => k > i && /^    \},?\s*$/.test(l));
    return lines.slice(i, j + 1).join('\n').replace(/,\s*$/, '');
}
const NAMES = ['generateId', 'maxIdNumber', 'pushUndoState', 'undo', 'redo', 'restoreData', 'duplicateNote'];
const META_LAYER = +html.match(/const META_LAYER = (\d+);/)[1];
function makeComposer(opts) {
    let src = '({\n' + NAMES.map(method).join(',\n') + '\n})';
    // the bite check: put back the undo line as it was before 2d.1 and the reuse must show
    if (opts && opts.legacyUndo) src = src.replace('this.nextId = Math.max(this.nextId, prev.nextId);', 'this.nextId = prev.nextId;');
    const M = vm.runInNewContext(src, { console: { warn() {}, log() {} }, JSON, Math, Date, META_LAYER, CURVE_LAYERS: [] });
    const noop = () => {};
    return Object.assign(Object.create(M), {
        objects: [], markers: [], nextId: 1, _motiveCache: {}, undoStack: [], redoStack: [], maxUndoSteps: 100, lastUndoPushTime: 0,
        selectedObject: null, selectedObjects: [], selectedNodeIdx: -1, databases: {}, assets: {},
        _restoreMotives: noop, renderAll: noop, markDirty: noop, renderWaveCurve: noop, generateTicks: noop, applyScroll: noop,
        selectObject(o) { this.selectedObject = o; }, scheduleConflictRefresh: null,
    });
}

const SCORE = JSON.parse(fs.readFileSync(FILE || path.join(ROOT, 'scores', scoreName + '.json'), 'utf8'));
const idNum = id => { const m = /^[a-z]{2}-(\d+)$/.exec(id || ''); return m ? +m[1] : 0; };
const maxIn = d => Math.max(0, ...(d.objects || []).concat(d.markers || []).map(o => idNum(o && o.id)));
const MAX = maxIn(SCORE);
const dupIds = objs => { const s = new Set(); let n = 0; for (const o of objs) { if (s.has(o.id)) n++; s.add(o.id); } return n; };
console.log(scoreName + ': ' + SCORE.objects.length + ' objects · highest id ' + MAX + ' · saved nextId ' + SCORE.nextId);

// ---- (1) the minting ----
{
    const C = makeComposer(); C.restoreData(clone(SCORE));
    ok(C.nextId === Math.max(SCORE.nextId || 1, MAX + 1) && dupIds(C.objects) === 0, 'load: the counter is the save\'s own (' + C.nextId + '), no id held twice');
    const noCounter = clone(SCORE); delete noCounter.nextId;
    const C2 = makeComposer(); C2.restoreData(noCounter);
    ok(C2.nextId === MAX + 1, 'load with no nextId: the counter starts above the highest id (' + C2.nextId + '), not at 1');
    const behind = clone(SCORE); behind.nextId = 5;
    const C3 = makeComposer(); C3.restoreData(behind);
    ok(C3.nextId === MAX + 1, 'load with nextId behind its ids (5): floored at ' + C3.nextId);
    const n0 = C.nextId, a = C.generateId('wc');
    ok(a === 'wc-' + n0 && C.nextId === n0 + 1, 'generateId: ' + a + ', then the counter moves on');
}
{
    // the hazard 2d.1 found: draw → undo → draw again. The second note must not get the first one's id.
    const run = legacy => {
        const C = makeComposer({ legacyUndo: legacy }); C.restoreData(clone(SCORE));
        C.pushUndoState();
        const first = { id: C.generateId('wc'), type: 'waveCurve' }; C.objects.push(first);
        C.undo();
        const second = C.generateId('wc');
        C.objects.push({ id: second, type: 'waveCurve' });
        C.redo();                                     // the snapshot with the first note comes back
        return { first: first.id, second, dups: dupIds(C.objects), floorOk: C.nextId > C.maxIdNumber() };
    };
    const now = run(false), old = run(true);
    ok(now.second !== now.first && now.dups === 0 && now.floorOk, 'undo: the next note after an undo gets a NEW id (' + now.first + ' undone → ' + now.second + '); redo leaves no id held twice');
    ok(old.second === old.first, 'the check bites: with the pre-2d.1 undo line the undone id IS handed out again (' + old.first + ' → ' + old.second + ')');
}

// ---- (2) the IR: ev- + note id, across edits and re-extracts ----
const TRACKS = Array.isArray(SCORE.tracks) ? SCORE.tracks : null;
const parts = TRACKS ? TRACKS.map((_, i) => i) : Array.from({ length: 10 }, (_, i) => i);
const metaLayer = TRACKS ? TRACKS.length : 10;
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'registry', 'classes.json'), 'utf8'));
const sampleLengths = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'sample_lengths.json'), 'utf8'));
const TECH = path.join(ROOT, 'notation', 'registry', 'techniques.json');
const techniques = fs.existsSync(TECH) ? JSON.parse(fs.readFileSync(TECH, 'utf8')).techniques : null;
const ENS_PATH = path.join(ROOT, 'notation', 'registry', 'ensemble.json');
const chords = !!(TRACKS && fs.existsSync(ENS_PATH) && JSON.parse(fs.readFileSync(ENS_PATH, 'utf8')).parts.length === TRACKS.length);
function extract(objects) {
    const w1 = Math.max(...objects.filter(o => o.endSeconds != null).map(o => o.endSeconds)) + 1;
    const score = Object.assign({}, SCORE, { objects: clone(objects) });
    return Extract.extract(score, { scoreName, window: [0, w1], parts, id: 'identity-test', registry, sampleLengths, profile: 'trance',
        options: chords ? { chords: true } : {}, metaLayer, techniques, date: '2026-09-11', toolName: 'tools/test_identity.js' }).doc;
}
const evIds = doc => doc.events.map(e => e.id).sort();
const sameSet = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

const C = makeComposer(); C.restoreData(clone(SCORE));
const sounding = () => C.objects.filter(o => o.type === 'waveCurve' && o.sonifyNote != null && parts.includes(o.layer));
const base = extract(C.objects);
{
    const rule = base.events.every(e => e.source && e.id === 'ev-' + e.source.objectId);
    const byId = new Map(C.objects.map(o => [o.id, o]));
    const allHaveNote = base.events.every(e => byId.has(e.source.objectId));
    const covered = new Set(base.events.map(e => e.source.objectId));
    const missing = sounding().filter(o => !covered.has(o.id));
    ok(rule && allHaveNote, 'every IR event is ev- + its note\'s id, and that note is in the score (' + base.events.length + ' events)');
    ok(missing.length === 0, 'every sounding note has its event — one note, one event' + (missing.length ? ' (missing: ' + missing.slice(0, 5).map(o => o.id).join(' ') + ')' : ''));
    const again = extract(C.objects), third = extract(C.objects);
    ok(sameSet(evIds(base), evIds(again)) && sameSet(evIds(again), evIds(third)), 're-extracted twice, unchanged: the same ' + base.events.length + ' ids');
}

// the note card's six edits, in place, on six notes spread across the parts (the median note of each part)
const perPart = parts.map(p => sounding().filter(o => o.layer === p).sort((a, b) => a.startSeconds - b.startSeconds));
const pick = perPart.filter(l => l.length).map(l => l[Math.floor(l.length / 2)]);
const techOn = (lane, not) => { const o = sounding().find(x => x.layer === lane && x.technique && x.technique !== not); return o ? o.technique : null; };
const edits = [
    ['voice', wc => { const t = techOn(wc.layer, wc.technique); if (t) wc.technique = t; return 'technique → ' + wc.technique; }, (e, wc) => e.technique === wc.technique],
    ['pitch', wc => { wc.sonifyNote = wc.sonifyNote < 127 ? wc.sonifyNote + 1 : wc.sonifyNote - 1; return 'pitch → ' + wc.sonifyNote; }, (e, wc) => e.pitch.midi === wc.sonifyNote],
    ['dynamic', wc => { (wc.nodes || []).forEach(nd => { nd.y = 3; }); if (wc.sonifyMode === 'plain' || wc.recVel != null) wc.recVel = 38; return 'level → 3'; }, () => true],
    ['start', wc => { const len = wc.endSeconds - wc.startSeconds; wc.startSeconds = +(wc.startSeconds + 0.5).toFixed(3); wc.endSeconds = wc.startSeconds + len; return 'start → ' + wc.startSeconds; }, (e, wc) => Math.abs(e.onset - wc.startSeconds) < 1e-9],
    ['length', wc => { wc.endSeconds = wc.startSeconds + Math.max(0.02, (wc.endSeconds - wc.startSeconds) / 2); return 'length halved'; }, () => true],
    ['lane', wc => { const to = parts[(parts.indexOf(wc.layer) + 1) % parts.length]; wc.layer = to; const t = techOn(to); if (t) wc.technique = t; return 'lane → ' + to; }, (e, wc) => e.technique === wc.technique],
];
{
    const before = evIds(base);
    const done = edits.slice(0, pick.length).map(([kind, fn, check], i) => { const wc = pick[i]; return { kind, wc, id: wc.id, said: fn(wc), check }; });
    const doc = extract(C.objects), byEv = new Map(doc.events.map(e => [e.id, e]));
    ok(sameSet(before, evIds(doc)), 'after ' + done.length + ' in-place edits (' + done.map(d => d.kind).join(' · ') + '): the same ' + before.length + ' ids, none lost, none new');
    for (const d of done) {
        const e = byEv.get('ev-' + d.id);
        ok(!!e && e.source.objectId === d.id && d.wc.id === d.id && d.check(e, d.wc), d.kind + ' (' + d.said + '): ' + d.id + ' is still ev-' + d.id + ', and the event carries the edit');
    }
    const redo = extract(C.objects);
    ok(sameSet(evIds(doc), evIds(redo)), 'and re-extracted once more: unchanged');
}

// decision B, shown: a chunk is named after its earliest note — move that note and the name goes with it; the note ids do not
{
    const ch = base.chunks.find(c => c.events.length >= 3);
    if (!ch) console.log('SKIP  no chunk of three notes to show decision B on');
    else {
        const C4 = makeComposer(); C4.restoreData(clone(SCORE));
        const evOn = new Map(base.events.map(e => [e.id, e]));
        const members = ch.events.map(id => evOn.get(id).source.objectId);
        const firstWc = C4.objects.find(o => o.id === members[0]);
        const last = Math.max(...ch.events.map(id => evOn.get(id).onset));
        const len = firstWc.endSeconds - firstWc.startSeconds;
        firstWc.startSeconds = +(last + 3).toFixed(3); firstWc.endSeconds = firstWc.startSeconds + len;
        const doc = extract(C4.objects);
        const rest = members.slice(1).map(id => 'ev-' + id);
        const holder = doc.chunks.find(c => c.events.includes(rest[0]));
        ok(rest.every(id => doc.events.some(e => e.id === id)) && holder && holder.id !== ch.id,
            'decision B: moving ' + members[0] + ' out of ' + ch.id + ' renames the chunk of the other ' + rest.length + ' (now ' + (holder && holder.id) + ') — their note ids stand');
    }
}

// one edit that CREATES: duplicate → exactly one new id, never seen before
{
    const before = new Set(evIds(extract(C.objects)));
    const src = pick[0], n0 = C.nextId, seen = new Set(C.objects.map(o => o.id));
    const copy = C.duplicateNote(src);
    const after = evIds(extract(C.objects)), added = after.filter(id => !before.has(id));
    ok(copy.id === 'wc-' + n0 && !seen.has(copy.id) && src.id === pick[0].id, 'duplicate: the copy is ' + copy.id + ' — new, from the counter; the original keeps ' + src.id);
    ok(added.length === 1 && added[0] === 'ev-' + copy.id && after.length === before.size + 1, 'and the IR gains exactly one event, ev-' + copy.id);
}

console.log('\n' + (fails ? 'FAIL — ' + fails + ' check(s)' : 'ALL PASS') + ' · ' + scoreName + ' · ' + ((Date.now() - T0) / 1000).toFixed(1) + ' s');
process.exit(fails ? 1 : 0);
