#!/usr/bin/env node
// unsaved_check.js — D17 (composer 2026-09-04): the session-end question "any unsaved edits?"
//
// Every open in the composer score goes through a working copy (scores/<name>-work.json,
// gitignored); the file itself changes only on Save. So a working copy whose CONTENT differs
// from its file is exactly "edits the composer has not saved" — and a working copy with no
// file at all is a score that was never saved. This lists both, so the AI can ask before the
// commit instead of committing a stale file. Same comparison as score/server.js workState().
//
//   node tools/unsaved_check.js            → a line per working copy, exit 1 if any is unsaved
//   node tools/unsaved_check.js --json     → machine-readable
'use strict';
const fs = require('fs');
const path = require('path');

const SCORES = path.join(__dirname, '..', 'scores');

function essence(json) {
    try {
        const d = JSON.parse(json);
        if (d && d.metadata) { delete d.metadata.modified; delete d.metadata.created; }
        if (d) delete d.viewport;
        return JSON.stringify(d);
    } catch (e) { return json; }
}

const rows = [];
for (const f of fs.readdirSync(SCORES).filter(f => /-work\.json$/.test(f))) {
    const base = f.replace(/-work\.json$/, '');
    const wf = path.join(SCORES, f), bf = path.join(SCORES, base + '.json');
    const st = fs.statSync(wf);
    const row = { base, work: f, workModified: st.mtime.toISOString(), orphan: !fs.existsSync(bf), differs: true };
    if (!row.orphan) {
        try { row.differs = essence(fs.readFileSync(wf, 'utf8')) !== essence(fs.readFileSync(bf, 'utf8')); }
        catch (e) { row.differs = true; }
        row.fileModified = fs.statSync(bf).mtime.toISOString();
    }
    rows.push(row);
}

const unsaved = rows.filter(r => r.orphan || r.differs);
if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ working: rows, unsaved }, null, 2));
} else if (!rows.length) {
    console.log('no working copies in scores/ — nothing unsaved');
} else {
    for (const r of rows) {
        const when = r.workModified.slice(0, 16).replace('T', ' ');
        if (r.orphan) console.log(`UNSAVED  ${r.base}: never saved — the working copy (${when}) is the only copy`);
        else if (r.differs) console.log(`UNSAVED  ${r.base}: the working copy (${when}) holds edits the file (${r.fileModified.slice(0, 16).replace('T', ' ')}) does not`);
        else console.log(`clean    ${r.base}: the working copy matches the file`);
    }
    console.log(unsaved.length ? `${unsaved.length} unsaved — ask the composer (Save in the app, or Reload to drop) before the commit` : 'nothing unsaved');
}
process.exit(unsaved.length ? 1 : 0);
