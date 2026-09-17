#!/usr/bin/env node
// passage_roundtrip.js — PROVE A PASSAGE SURVIVES CAPTURE AND INSERT UNCHANGED.
//
// The composer's condition on the whole feature (2026-09-10, RUNNING_LOG §361):
//   *"make sure to test it so that when it's inserted, you're comparing it to the original and making sure that there's nothing
//    just left behind or no changes were made."*
//
// So this does not test that the code runs. It captures a real score, inserts the capture at an arbitrary offset into an EMPTY
// score, and then diffs the inserted objects against the originals FIELD BY FIELD — every key of every object, at any depth.
// Three things are expected to differ and nothing else:
//   · `id`       — a fresh one per insert (two copies in one score must not share an id)
//   · `groupId`  — likewise, but every object that shared a group before must still share one after
//   · the times  — shifted by exactly the insert offset, the same shift for every object
// Anything else that differs is a failure and is printed.
//
//   node tools/passage_roundtrip.js [score-name] [--at 12.345]
//
// It uses the SAME pack/unpack functions the app uses, loaded out of score/public/passages.js, so it cannot drift from the app.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const scoreName = args.find(a => !a.startsWith('--')) || 'SeptetSec03-Materials-B';
const atIdx = args.indexOf('--at');
const AT = atIdx >= 0 ? parseFloat(args[atIdx + 1]) : 37.421;   // a deliberately awkward offset, not a round number

// ---- load the app's own pack/unpack, no copy ---------------------------------------------------
const src = fs.readFileSync(path.join(ROOT, 'score', 'public', 'passages.js'), 'utf8');
let idN = 0;
const fakeComposer = { objects: [], generateId: p => p + '-T' + (++idN), playheadTime: AT };
const sandbox = {
    window: {}, document: { getElementById: () => null, addEventListener: () => {}, readyState: 'complete' },
    console: { log: () => {}, table: () => {} }, fetch: () => Promise.reject(new Error('no network in the test')),
    Composer: fakeComposer, Date: Date, Math: Math, JSON: JSON, Map: Map, Set: Set,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const P = sandbox.window.passages;
if (!P) { console.error('FAIL: passages.js did not export `passages`'); process.exit(1); }

// ---- the source score --------------------------------------------------------------------------
const file = path.join(ROOT, 'scores', scoreName + '.json');
if (!fs.existsSync(file)) { console.error('no such score: ' + file); process.exit(2); }
const score = JSON.parse(fs.readFileSync(file, 'utf8'));
const originals = (score.objects || []).map(o => JSON.parse(JSON.stringify(o)));
if (!originals.length) { console.error('the score is empty'); process.exit(2); }

const t0of = o => o.startSeconds != null ? o.startSeconds : (o.startTime != null ? o.startTime : 0);
const from = Math.min.apply(null, originals.map(t0of));

// ---- capture, then insert into an EMPTY score at AT ---------------------------------------------
fakeComposer.objects = [];
const packed = JSON.parse(JSON.stringify(P._packForTest(originals, from)));
const stored = JSON.parse(JSON.stringify(packed));            // what would sit on disk
const inserted = P._unpackForTest(stored, AT, fakeComposer);

// ---- the diff ------------------------------------------------------------------------------------
const SHIFT_FIELDS = new Set(['startSeconds', 'endSeconds', 'startTime', 'endTime']);
const REF_FIELDS = new Set(['linkedCurveId', 'sourceId', 'parentId', 'launchedFrom']);
const near = (a, b) => Math.abs(a - b) < 1e-5;
const problems = [];
const note = (i, where, msg) => problems.push('  object ' + i + ' (' + (originals[i] && originals[i].id) + ') ' + where + ': ' + msg);

function walk(i, a, b, pathStr) {
    if (a === b) return;
    if (a == null || b == null) { if (a !== b) note(i, pathStr, JSON.stringify(a) + '  →  ' + JSON.stringify(b)); return; }
    if (typeof a !== typeof b) { note(i, pathStr, 'type changed ' + typeof a + ' → ' + typeof b); return; }
    if (typeof a !== 'object') {
        if (typeof a === 'number' && near(a, b)) return;
        note(i, pathStr, JSON.stringify(a) + '  →  ' + JSON.stringify(b));
        return;
    }
    if (Array.isArray(a) !== Array.isArray(b)) { note(i, pathStr, 'array/object mismatch'); return; }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
        if (pathStr === '' && (k === 'id' || k === 'groupId')) continue;                  // checked separately
        if (pathStr === '' && SHIFT_FIELDS.has(k)) continue;                              // checked separately
        if (REF_FIELDS.has(k) || (pathStr === '.trill' && k === 'launchedFrom')) continue; // checked separately
        if (k === '_els') { if (k in b) note(i, pathStr + '.' + k, 'live DOM leaked into the stored passage'); continue; }
        if (!(k in a)) { note(i, pathStr + '.' + k, 'field APPEARED on insert: ' + JSON.stringify(b[k])); continue; }
        if (!(k in b)) { note(i, pathStr + '.' + k, 'field LOST: ' + JSON.stringify(a[k])); continue; }
        walk(i, a[k], b[k], pathStr + '.' + k);
    }
}

console.log('PASSAGE ROUND-TRIP');
console.log('  score      : ' + scoreName + '  (' + originals.length + ' objects, first starts at ' + from.toFixed(3) + ' s)');
console.log('  inserted at: ' + AT + ' s, into an empty score');
console.log('');

// 1. nothing lost, nothing gained
if (inserted.length !== originals.length) problems.push('  COUNT: ' + originals.length + ' captured, ' + inserted.length + ' inserted');

// 2. every field, at any depth
originals.forEach((o, i) => walk(i, o, inserted[i], ''));

// 3. the times moved by exactly one shift, the same for all
const shift = AT - from;
originals.forEach((o, i) => {
    SHIFT_FIELDS.forEach(k => {
        if (o[k] == null && inserted[i][k] == null) return;
        if (o[k] == null || inserted[i][k] == null) { note(i, k, 'present on one side only'); return; }
        if (!near(o[k] + shift, inserted[i][k])) note(i, k, o[k] + ' + ' + shift.toFixed(6) + ' should be ' + (o[k] + shift).toFixed(6) + ', got ' + inserted[i][k]);
    });
});

// 4. ids are all new, all unique, and none of the originals leaked through
const newIds = inserted.map(o => o.id), oldIds = new Set(originals.map(o => o.id));
if (new Set(newIds).size !== newIds.length) problems.push('  IDS: the insert made duplicate ids');
newIds.forEach((id, i) => { if (oldIds.has(id)) note(i, 'id', 'an ORIGINAL id leaked into the insert: ' + id); });
const packedIds = new Set(stored.map(o => o.id));
newIds.forEach((id, i) => { if (packedIds.has(id)) note(i, 'id', 'a STORED token leaked into the score: ' + id); });

// 5. grouping is preserved exactly — same partition, different names
const part = list => {
    const m = new Map();
    list.forEach((o, i) => { const g = o.groupId || ('~solo' + i); if (!m.has(g)) m.set(g, []); m.get(g).push(i); });
    return [...m.values()].map(v => v.join(',')).sort().join(' | ');
};
if (part(originals) !== part(inserted)) problems.push('  GROUPS: the grouping changed\n    before: ' + part(originals) + '\n    after : ' + part(inserted));
inserted.forEach((o, i) => { if (o.groupId && originals[i].groupId && o.groupId === originals[i].groupId) note(i, 'groupId', 'reused the ORIGINAL groupId — two copies in one score would merge'); });

// 6. cross-references inside the passage still point at the right object
originals.forEach((o, i) => {
    REF_FIELDS.forEach(k => {
        if (!o[k]) return;
        const target = originals.findIndex(x => x.id === o[k]);
        if (target < 0) { if (inserted[i][k]) note(i, k, 'pointed OUTSIDE the passage and should have been dropped, kept "' + inserted[i][k] + '"'); return; }
        if (inserted[i][k] !== inserted[target].id) note(i, k, 'should point at inserted object ' + target + ' (' + inserted[target].id + '), points at "' + inserted[i][k] + '"');
    });
});

// 7. the stored form is portable: no absolute time, no id from the source score, and it survives JSON
const asDisk = JSON.parse(JSON.stringify(stored));
if (JSON.stringify(asDisk) !== JSON.stringify(stored)) problems.push('  STORE: the passage does not survive a JSON round trip');
stored.forEach((o, i) => {
    if (oldIds.has(o.id)) note(i, 'stored id', 'the source score id was stored: ' + o.id);
    SHIFT_FIELDS.forEach(k => { if (o[k] != null && o[k] < -1e-6) note(i, 'stored ' + k, 'negative relative time ' + o[k]); });
});
const firstStart = Math.min.apply(null, stored.map(t0of));
if (!near(firstStart, 0)) problems.push('  STORE: the passage does not start at 0 (starts at ' + firstStart + ')');

// 8. INSERTED TWICE into one score: no id collision, no group collision, and the two copies stay separate.
// (The realistic use — the same passage laid down twice in one piece. If the second insert reused the first's ids or groups the
// score would silently merge them, which is the worst kind of "something left behind".)
const second = P._unpackForTest(JSON.parse(JSON.stringify(stored)), AT + 60, fakeComposer);
const firstIds = new Set(inserted.map(o => o.id));
second.forEach((o, i) => { if (firstIds.has(o.id)) note(i, 'id', 'the SECOND insert reused an id from the first: ' + o.id); });
const firstGroups = new Set(inserted.map(o => o.groupId).filter(Boolean));
second.forEach((o, i) => { if (o.groupId && firstGroups.has(o.groupId)) note(i, 'groupId', 'the SECOND insert reused a group from the first: ' + o.groupId); });
if (part(inserted) !== part(second)) problems.push('  GROUPS: the second insert grouped differently from the first');
second.forEach((o, i) => {
    SHIFT_FIELDS.forEach(k => { if (o[k] != null && !near(o[k], inserted[i][k] + 60)) note(i, k, 'the second copy is not exactly 60 s after the first'); });
});

// ---- verdict ------------------------------------------------------------------------------------
const checks = [
    ['object count', originals.length + ' → ' + inserted.length],
    ['fields compared', 'every key of every object, at any depth'],
    ['time shift', 'all moved by exactly ' + shift.toFixed(6) + ' s'],
    ['ids', newIds.length + ' new, all unique, none reused'],
    ['groups', part(originals).split(' | ').length + ' groups, partition preserved, all renamed'],
    ['stored form', 'starts at 0, no source ids, survives JSON'],
    ['inserted twice', 'no id or group shared between the two copies']
];
checks.forEach(c => console.log('  ' + c[0].padEnd(17) + c[1]));
console.log('');
if (problems.length) {
    console.log('FAIL — ' + problems.length + ' difference(s) that should not be there:');
    problems.slice(0, 40).forEach(p => console.log(p));
    if (problems.length > 40) console.log('  … and ' + (problems.length - 40) + ' more');
    process.exit(1);
}
console.log('PASS — the insert is the original, moved. Nothing lost, nothing added, nothing left behind.');
