// snapshots.js — PLAN 2ab. The merge logic for bank/panel_snapshots.json.
//
// PURE and node-only on purpose: the server does I/O, this decides what the
// file should become. That split is what makes tools/test_snapshots.js able to
// assert every rule below without starting a server or touching a disk.
//
//   merge(file, { panel, name, comment, state })        -> save
//   merge(file, { panel, name, delete: true })          -> remove
//
// `file` IS MUTATED IN PLACE and the caller writes it back. The return value
// says what happened; it never throws for an ordinary miss.
//
// ---------------------------------------------------------------------------
// THE RULES, and why each one is the way it is (2ab "Design decisions"):
//
//   1. `state` IS OPAQUE. Whatever the panel's save() writes, stored verbatim.
//      The server never validates its shape — one code path, and a panel that
//      does not exist yet (2ac's multitempo, 2ad's phase) costs zero work here.
//
//   2. AN UNKNOWN PANEL IS CREATED, NOT REJECTED. Same reason: a new panel
//      must not need a server edit before its first save can land.
//
//   3. `state` IS DEEP-COPIED IN. The caller's object is a live panel state in
//      the browser's POST body; storing it by reference would let a later
//      mutation reach into the file's copy. Cheap to get right, invisible when
//      wrong — which is exactly why test_snapshots.js asserts it and then
//      mutation-tests the assertion.
//
//   4. A BAD NAME IS REFUSED LOUDLY, NEVER NORMALISED. Silently rewriting
//      `my take/2` to `my take2` would hand the composer a snapshot under a
//      name they did not choose and cannot find (AI_METHODOLOGY rule 3: never
//      silently refuse or silently discard — make the correction explicit).
//
//   5. DELETING SOMETHING THAT IS NOT THERE IS A SUCCESS, not an error:
//      { ok: true, existed: false }. The end state is what was asked for. Only
//      a malformed request is a failure.
//
//   6. `saved` IS STAMPED HERE, NOT SENT BY THE CLIENT. A client-supplied date
//      would let a stale browser tab write a future timestamp and sort itself
//      to the top of the composer's Load list forever. `now` is injectable so
//      tests are deterministic; the request body can never reach it.

'use strict';

const NAME_RE = /^[A-Za-z0-9._ -]{1,64}$/;

// PLAN 1d.11 — THERE ARE TWO STORES, and the client names one by KEY, never by path: a client
// that could name a file could name any file on the disk. `storeFor` is the whole whitelist, and
// it lives here rather than in the server so that tools/test_snapshots.js can pin it.
//   panels     — bank/panel_snapshots.json, his takes: 3.1 MB, rewritten whole on every save
//   sequences  — bank/sequences.json, the sequence library: small, and AUTOSAVED every few seconds
// An absent or empty key is `panels`, so everything written before 1d.11 keeps working untouched.
// LGMF PLAN 1l.2 (2026-09-21) — a THIRD store:
//   rhythms    — bank/rhythm_takes.json, his RHYTHM TAKES from the Texture panel (a recipe: the dials, the seed, who plays). A file
//                of its own, as the sequence library is, so a rhythm save never rewrites the 3 MB of harmony takes.
// A RUNNING server keeps the module it started with — after this change `node score/server.js` must be RESTARTED for the store to exist.
const STORES = { panels: 'panel_snapshots.json', sequences: 'sequences.json', rhythms: 'rhythm_takes.json' };

function storeFor(key) {
    if (key == null || key === '') return STORES.panels;
    return Object.prototype.hasOwnProperty.call(STORES, key) ? STORES[key] : null;
}

// The one place the name rule lives. Panels and snapshot names share it: a
// panel key is written into the same JSON object and read back the same way.
function badName(what, v) {
    if (typeof v !== 'string' || !v.length) return what + ' is required';
    if (!NAME_RE.test(v)) {
        return what + ' must be 1-64 chars of letters, digits, dot, underscore,' +
               ' space or hyphen — got ' + JSON.stringify(v);
    }
    return null;
}

// JSON round-trip rather than structuredClone: `state` arrived as JSON over
// HTTP, so it is JSON-representable by construction, and this works on every
// node version this repo has ever run on.
function deepCopy(v) {
    return JSON.parse(JSON.stringify(v));
}

function panelsOf(file) {
    if (!file || typeof file !== 'object' || Array.isArray(file)) return null;
    if (!file.panels || typeof file.panels !== 'object' || Array.isArray(file.panels)) {
        file.panels = {};
    }
    return file.panels;
}

function countOf(file, panel) {
    const ps = file && file.panels && file.panels[panel];
    return ps && typeof ps === 'object' ? Object.keys(ps).length : 0;
}

function merge(file, req) {
    const now = arguments.length > 2 ? arguments[2] : new Date().toISOString();
    const r = req || {};

    const panels = panelsOf(file);
    if (!panels) return { ok: false, error: 'snapshot file is not an object' };

    const panelBad = badName('panel', r.panel);
    if (panelBad) return { ok: false, error: panelBad };
    const nameBad = badName('name', r.name);
    if (nameBad) return { ok: false, error: nameBad };

    // Rule 2 — create the panel bucket on first contact.
    if (!panels[r.panel] || typeof panels[r.panel] !== 'object' ||
        Array.isArray(panels[r.panel])) {
        panels[r.panel] = {};
    }
    const bucket = panels[r.panel];

    if (r.delete === true) {
        const existed = Object.prototype.hasOwnProperty.call(bucket, r.name);
        if (existed) delete bucket[r.name];
        // Rule 5 — the asked-for end state is reached either way.
        return { ok: true, action: 'delete', existed: existed,
                 count: countOf(file, r.panel) };
    }

    // A save with nothing to save is a malformed request, not an empty
    // snapshot: storing `undefined` would produce an entry that loads as
    // garbage days later, with nothing on screen to say why.
    if (r.state === null || typeof r.state !== 'object' || Array.isArray(r.state)) {
        return { ok: false, error: 'state must be an object (the panel save() payload)' };
    }

    const existed = Object.prototype.hasOwnProperty.call(bucket, r.name);
    bucket[r.name] = {
        saved: now,                                   // rule 6
        comment: typeof r.comment === 'string' ? r.comment : '',
        state: deepCopy(r.state),                     // rule 3
    };
    return { ok: true, action: 'save', existed: existed,
             count: countOf(file, r.panel) };
}

module.exports = { merge: merge, countOf: countOf, NAME_RE: NAME_RE,
                   STORES: STORES, storeFor: storeFor };
