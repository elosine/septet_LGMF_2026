#!/usr/bin/env node
// check_ceilings.js — PLAN 1a.4 / 1a.6's required check, as a gate anything can run.
//
// "Never exceeding the max" (his brief, LG-29). A sustained note must not be longer than its
// instrument can hold it — the breath or the bow ceilings measured at mf and written into
// `score/public/beating_calc.js` CEILINGS (PLAN 1a.2). The ceiling is read AT THE NOTE'S OWN LEVEL,
// because a quiet note lasts longer than a loud one and the palette says so.
//
//   node tools/check_ceilings.js scores/lgmf-ref.json [more.json …]
//   node tools/check_ceilings.js --all            # every lgmf-* score in scores/
//
// Exits non-zero on the first score that fails, so it can stand in a build.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const BC = require(path.join(ROOT, 'score', 'public', 'beating_calc.js'));

const html = fs.readFileSync(path.join(ROOT, 'score', 'public', 'composer.html'), 'utf8');
const TRACKS = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const CEIL = BC.CEILINGS || {};

let args = process.argv.slice(2);
if (args.includes('--all')) {
    args = fs.readdirSync(path.join(ROOT, 'scores'))
        .filter(f => /^lgmf-.*\.json$/.test(f) && !/-work\.json$/.test(f))
        .map(f => path.join('scores', f));
}
if (!args.length) { console.log('usage: node tools/check_ceilings.js <score.json> … | --all'); process.exit(2); }

const r3 = x => Math.round(x * 1000) / 1000;
let failed = 0;

args.forEach(rel => {
    const p = path.resolve(ROOT, rel);
    const save = JSON.parse(fs.readFileSync(p, 'utf8'));
    const notes = (save.objects || []).filter(o => o.type === 'waveCurve' && o.sonifyNote != null);
    const over = [], byInst = {};
    notes.forEach(o => {
        const tr = TRACKS[o.layer];
        const inst = tr && tr.instKey;
        if (!inst || !CEIL[inst]) return;                 // a lane with no ceiling (the percussion) is not held
        // the note's own dynamic: the top of its drawn curve, 0–10 → 0–1, which is what ceilingFor takes
        const top = (o.nodes && o.nodes.length) ? Math.max.apply(null, o.nodes.map(n => n.y)) / 10 : 0.5;
        const c = BC.ceilingFor(inst, top);
        const dur = o.endSeconds - o.startSeconds;
        const b = byInst[inst] || (byInst[inst] = { n: 0, max: 0, ceiling: c.seconds, kind: c.kind });
        b.n++; if (dur > b.max) b.max = dur;
        if (dur > c.seconds + 1e-6) over.push({ id: o.id, inst, dur: r3(dur), ceiling: c.seconds, at: o.startSeconds });
    });
    const label = path.relative(ROOT, p).replace(/\\/g, '/');
    if (over.length) {
        failed++;
        console.log('CEILING RED  ' + label + ' — ' + over.length + ' of ' + notes.length + ' notes exceed their ceiling:');
        over.slice(0, 8).forEach(x => console.log('   ✗ ' + x.inst + ' ' + x.id + ' at ' + x.at + ' s: ' + x.dur + ' s > ' + x.ceiling));
    } else {
        const worst = Object.keys(byInst).map(k => k.split('_')[0] + ' ' + r3(byInst[k].max) + '/' + byInst[k].ceiling).join(' · ');
        console.log('CEILING GREEN ' + label + ' — ' + notes.length + ' notes, longest per instrument: ' + worst);
    }
});
process.exit(failed ? 1 : 0);
