#!/usr/bin/env node
// test_snapshots — score/snapshots.js: the merge rules its own header states, and (PLAN 1d.11)
// the two-store whitelist.
//   node tools/test_snapshots.js
//
// PURE, so it asserts every rule without starting a server or touching a disk. The store table
// lives in snapshots.js rather than in the server for exactly that reason: a client names a store
// by KEY, never by path, and a whitelist that cannot be tested is a whitelist nobody trusts.
'use strict';
const path = require('path');
const S = require(path.join(__dirname, '..', 'score', 'snapshots.js'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const NOW = '2026-01-01T00:00:00.000Z';
const fresh = () => ({ _version: 1, panels: {} });

console.log('SNAPSHOTS — the merge rules, and the three stores\n');

// --- the stores (1d.11) -----------------------------------------------------------------
ok(S.storeFor('panels') === 'panel_snapshots.json', 'store `panels` → panel_snapshots.json');
ok(S.storeFor('sequences') === 'sequences.json', 'store `sequences` → sequences.json — the library, a file of its own');
ok(S.storeFor('rhythms') === 'rhythm_takes.json', 'store `rhythms` → rhythm_takes.json — the rhythm takes, a file of their own (PLAN 1l.2)');
ok(S.storeFor(null) === 'panel_snapshots.json' && S.storeFor('') === 'panel_snapshots.json' && S.storeFor(undefined) === 'panel_snapshots.json',
   'an absent store is `panels` — everything written before 1d.11 keeps working');
const NASTY = ['../../secrets', 'sequences.json', 'rhythm_takes.json', 'Rhythms', '/etc/passwd', 'C:\\Windows\\win.ini', 'Panels', '__proto__', 'constructor', 'toString'];
ok(NASTY.every(k => S.storeFor(k) === null), 'nothing else resolves — a path, a filename, a wrong case, or a prototype key: ' + NASTY.length + ' refused');
ok(Object.keys(S.STORES).length === 3, 'there are exactly three stores');

// --- rule 1 · state is opaque, and rule 2 · an unknown panel is created ------------------
let f = fresh();
let r = S.merge(f, { panel: 'sequences-that-do-not-exist-yet', name: 'one', state: { anything: [1, { deep: true }] } }, NOW);
ok(r.ok && r.action === 'save' && !r.existed && r.count === 1, 'an unknown panel is CREATED, not rejected');
ok(JSON.stringify(f.panels['sequences-that-do-not-exist-yet'].one.state) === '{"anything":[1,{"deep":true}]}', 'state is stored verbatim — the server never validates its shape');

// --- rule 3 · state is deep-copied in ---------------------------------------------------
const live = { boxes: [{ take: 'a' }] };
f = fresh(); S.merge(f, { panel: 'library', name: 'mine', state: live }, NOW);
live.boxes[0].take = 'MUTATED AFTER THE SAVE';
ok(f.panels.library.mine.state.boxes[0].take === 'a', 'state is DEEP-COPIED in — a later mutation of the caller\'s object cannot reach the file');

// --- rule 4 · a bad name is refused loudly, never normalised -----------------------------
f = fresh();
for (const bad of ['my take/2', 'a:b', '', 'x'.repeat(65), 'tab\there']) {
    const q = S.merge(f, { panel: 'library', name: bad, state: {} }, NOW);
    ok(!q.ok && /name must be|name is required/.test(q.error), 'name ' + JSON.stringify(bad.slice(0, 20)) + ' refused: ' + (q.error || '').slice(0, 48));
}
ok(!S.merge(f, { panel: 'a/b', name: 'one', state: {} }, NOW).ok, 'a bad PANEL name is refused by the same rule');
ok(S.merge(fresh(), { panel: 'untitled', name: 'untitled 2026-09-20 14.32.05', state: {} }, NOW).ok,
   '1d.11\'s untitled key passes the name rule — dots, not colons, which is why it is written that way');

// --- rule 5 · deleting something that is not there is a SUCCESS --------------------------
f = fresh();
r = S.merge(f, { panel: 'library', name: 'never-was', delete: true }, NOW);
ok(r.ok && r.action === 'delete' && r.existed === false && r.count === 0, 'delete of a missing entry: ok, existed false — the asked-for end state is reached');
S.merge(f, { panel: 'library', name: 'here', state: {} }, NOW);
r = S.merge(f, { panel: 'library', name: 'here', delete: true }, NOW);
ok(r.ok && r.existed === true && r.count === 0 && !f.panels.library.here, 'delete of a present entry removes it and says it existed');

// --- rule 6 · `saved` is stamped by the server, never sent by the client -----------------
f = fresh();
S.merge(f, { panel: 'library', name: 'stamped', state: {}, saved: '2099-12-31T00:00:00.000Z' }, NOW);
ok(f.panels.library.stamped.saved === NOW, 'a client-supplied date cannot reach `saved` — a stale tab cannot sort itself to the top forever');

// --- a save with nothing to save is malformed, not an empty snapshot ---------------------
for (const st of [undefined, null, 'a string', 42, ['an', 'array']]) {
    ok(!S.merge(fresh(), { panel: 'library', name: 'x', state: st }, NOW).ok, 'state ' + JSON.stringify(st === undefined ? 'undefined' : st) + ' refused');
}
ok(!S.merge('not an object', { panel: 'p', name: 'n', state: {} }, NOW).ok, 'a snapshot file that is not an object is refused, not crashed on');

// --- overwrite, and the count ------------------------------------------------------------
f = fresh();
S.merge(f, { panel: 'untitled', name: 'one', state: { v: 1 } }, NOW);
r = S.merge(f, { panel: 'untitled', name: 'one', state: { v: 2 }, comment: 'second' }, NOW);
ok(r.ok && r.existed === true && r.count === 1 && f.panels.untitled.one.state.v === 2 && f.panels.untitled.one.comment === 'second', 'a second save under one name REPLACES it — two states per name and never more (1d.11: no cascade of versions)');
S.merge(f, { panel: 'library', name: 'two', state: {} }, NOW);
ok(S.countOf(f, 'untitled') === 1 && S.countOf(f, 'library') === 1 && S.countOf(f, 'nothing') === 0, 'countOf is per panel');

console.log('\n' + (fail ? 'SNAPSHOTS RED: ' + fail + ' failed' : 'SNAPSHOTS GREEN: ' + pass + ' checks'));
process.exit(fail ? 1 : 0);
