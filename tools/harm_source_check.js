// harm_source_check.js — a harmony as a strike, and a rhythm from another strike, checked in node (PLAN 1d, the drawer's step; RUNNING_LOG §324).
// `node tools/harm_source_check.js` → PASS / FAIL lines and a verdict.
// (1) rule 1 on his own example — five onsets, eight notes — in both modes; fewer notes; the degenerate one-onset rhythm;
// (2) rule 2 — the accents travel with the rhythm; a played strike on its own rhythm is unchanged; (3) the synthetic strike carries every
// field select() reads; (4) the banners from the morph panel's menu, on the real banks and a fake menu; (5) the drawer's dispatch lines
// and the script tags are in place, so an edit cannot drop them silently.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const H = require(path.join(ROOT, 'score/public/harm_source.js'));
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- (1) rule 1: five onsets, eight notes
const ticks = [0, 100, 250, 300, 500];
{
    const L = H.layOnTicks(ticks, 8, 'stack');
    ok(eq(L.dts, [0, 100, 250, 300, 500, 0, 100, 250]), 'stack: notes 6 7 8 land ON onsets 1 2 3 — ' + L.dts.join(' '));
    ok(L.stacked === 3 && L.mode === 'stack' && L.passes === 2 && L.empty === 0, 'stack: 3 stacked, no empties');
}
{
    const L = H.layOnTicks(ticks, 8, 'repeat');
    // the last gap is 200 (300 → 500); the second pass starts at 500 + 200 = 700
    ok(eq(L.dts, [0, 100, 250, 300, 500, 700, 800, 950]), 'repeat: a second pass one last gap on — ' + L.dts.join(' '));
    ok(L.lastGap === 200 && L.stride === 700 && L.passes === 2 && L.stacked === 0, 'repeat: last gap 200, stride 700, 2 passes');
}
{
    const L = H.layOnTicks(ticks, 3, 'stack');
    ok(eq(L.dts, [0, 100, 250]) && L.empty === 2 && L.stacked === 0, 'fewer notes: the first three onsets, two left empty');
}
{
    const L = H.layOnTicks([0, 0, 0], 5, 'repeat');
    ok(eq(L.dts, [0, 0, 0, 0, 0]) && L.degenerate && L.mode === 'stack', 'one onset only: repeat degenerates to stack and says so');
    ok(/repeat = stack/.test(H.describe(L)), 'the readout names it: ' + H.describe(L));
}
{
    // a rhythm whose last two notes are simultaneous: the last NON-ZERO gap is the stride's gap
    const L = H.layOnTicks([0, 80, 200, 200], 6, 'repeat');
    ok(L.lastGap === 120 && L.stride === 320 && eq(L.dts.slice(4), [320, 400]), 'repeat over a simultaneous tail: the last non-zero gap (120) — ' + L.dts.join(' '));
}
{
    const L = H.layOnTicks([], 3, 'stack');
    ok(eq(L.dts, [0, 0, 0]) && L.n === 0, 'no rhythm at all: everything at 0');
}
ok(/8 notes on 5 onsets · 3 stacked/.test(H.describe(H.layOnTicks(ticks, 8, 'stack'))), 'readout, stack: ' + H.describe(H.layOnTicks(ticks, 8, 'stack')));
ok(/2 passes, \+200 ms between/.test(H.describe(H.layOnTicks(ticks, 8, 'repeat'))), 'readout, repeat: ' + H.describe(H.layOnTicks(ticks, 8, 'repeat')));

// ---- (2) rule 2: the accents travel with the rhythm
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank/scattered_strikes.json'), 'utf8'));
const strikes = Object.values(db.strikes).sort((a, b) => a.index - b.index);
const s26 = strikes.find(s => s.index === 26), s24 = strikes.find(s => s.index === 24);
ok(!!s26 && !!s24, 'the db has #24 and #26 (' + strikes.length + ' strikes)');
{
    const R = H.rhythmOf(s26);
    ok(R.ticks.length === s26.notes.length && R.ticks.every((t, i) => i === 0 || t.dtMs >= R.ticks[i - 1].dtMs), 'rhythmOf: one onset per recorded note, sorted (' + R.ticks.length + ')');
    const items = [60, 64, 67].map(m => ({ midi: m }));
    const L = H.lay(items, R, 'stack');
    ok(L.notes.every((n, i) => n.vel === R.ticks[i].vel && n.durMs === R.ticks[i].durMs && n.dtMs === R.ticks[i].dtMs - R.ticks[0].dtMs), 'rule 2: each note takes the velocity and the length of the onset it landed on');
    ok(L.notes.every(n => [60, 64, 67].includes(n.midi)), 'the pitches stay the harmony\'s');
}
{
    // a played strike on its own rhythm is untouched — byte-for-byte what select() had
    const items = s24.notes.map(n => ({ midi: n.midi, dtMs: n.dtMs, vel: n.vel, durMs: n.durMs }));
    const L = H.lay(items, null, 'stack');
    ok(L.info.own && L.notes.every((n, i) => n.dtMs === s24.notes[i].dtMs && n.vel === s24.notes[i].vel && n.durMs === s24.notes[i].durMs && n.midi === s24.notes[i].midi), 'own rhythm: a played strike is unchanged');
    ok(H.describe(L.info) === '', 'own rhythm: nothing to say in the readout');
}
{
    // a harmony (no accents of its own) on its own rhythm: together, the defaults
    const L = H.lay([{ midi: 40 }, { midi: 47 }], null, 'stack');
    ok(L.notes.every(n => n.dtMs === 0 && n.vel === H.DEFAULTS.vel && n.durMs === H.DEFAULTS.durMs), 'a harmony on its own rhythm: together, at the defaults');
}

// ---- (3) the synthetic strike carries what select() reads
const entry = { value: 'harm:blasts:S001', id: 'S001', name: 'VERT01-28 V4', pitches: [30, 38, 41, 46, 48, 49, 60, 61, 62], source: 'BLASTS · the tuba piece' };
const S = H.makeStrike(entry);
ok(S.id === 'hs::harm:blasts:S001' && H.isHarmId(S.id) && eq(H.parseHarmId(S.id), { root: null, value: 'harm:blasts:S001' }), 'the id round-trips: ' + S.id);
ok(S.synthetic === true && S.index === 'S001' && S.t0 === 0 && S.spanMs === 0 && S.source === entry.source, 'synthetic, index S001, no time');
ok(S.notes.length === 9 && S.notes.every(n => n.dtMs === 0 && n.instKey === 'piano' && n.layer === 2 && n.technique === 'main' && n.vel === 100 && n.durMs === 100 && typeof n.objectId === 'string'), 'nine notes, all at 0 ms on the piano, the defaults');
ok(S.stats.noteCount === 9 && S.stats.midi.min === 30 && S.stats.midi.max === 62 && S.harmony.count === 9 && S.harmony.pcs.length === 6, 'stats and harmony blocks: 9 notes, 30–62, 6 pitch classes (0 1 2 5 6 10)');
ok(S.rhythm.onsetsMs.length === 1 && S.rhythm.groups[0].objectIds.length === 9, 'rhythm block: one onset, one group of nine');
{
    const fam = H.makeStrike({ value: 'fam:stack-p5', root: 'F2', id: H.shortIndex('fam:stack-p5', 'F2'), name: 'stack of 5ths', pitches: [41, 48, 55, 62, 69, 76], source: 'STACKS · from the root' });
    ok(fam.id === 'hs:F2:fam:stack-p5' && fam.index === 'stack-p5@F2' && eq(H.parseHarmId(fam.id), { root: 'F2', value: 'fam:stack-p5' }), 'a family carries its root in the id: ' + fam.id);
    ok(H.parseHarmId('hs:C#3:fam:mode-2').root === 'C#3', 'a sharp in the root parses');
}
ok(H.shortIndex('harm:chordShapes:cs-001') === 'cs-001' && H.shortIndex('starter:2') === 'starter-2' && H.shortIndex('model:M2') === 'M2' && H.shortIndex('tuba:M2') === 'tuba-M2' && H.shortIndex('kept:my set') === 'kept-my-set' && H.shortIndex('actual:ACT-3') === 'actual-ACT-3', 'short indexes, safe for group ids');
ok(H.rowName('S001 · VERT01-28 V4 · D1 D2 F2 A#2 C3 C#3 C4 C#4 …', 'S001') === 'VERT01-28 V4', 'the row name drops the id and the pitch list');
ok(H.rowName('stack of 5ths', 'stack-p5@F2') === 'stack of 5ths', 'a family keeps its name');
ok(!H.isHarmId('ss-ScatteredStrikes01-wc-308') && H.harmStrike === undefined, 'a db id is not a harmony id');

// ---- (4) the banners from the morph panel's menu — on the real banks, and on a fake menu
const banks = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank/harmonies.json'), 'utf8')).banks;
{
    const nmList = arr => arr.slice(0, 8).map(H.nm).join(' ') + (arr.length > 8 ? ' …' : '');
    const groups = [
        { label: 'kept (yours)', items: [] },
        { label: 'stacks from the root', items: [{ value: 'fam:stack-p5', text: 'stack of 5ths' }, { value: 'fam:stack-m2', text: 'stack of semitones' }] },
        { label: "Messiaen's modes from the root", items: [{ value: 'fam:mode-2', text: 'Messiaen mode 2 (octatonic)' }] },
        { label: 'strikes', items: [{ value: 'harm:strikes:x', text: '#0 · 0.61 s · G2 …' }] },
        { label: 'blasts · the tuba piece', items: banks.blasts.entries.map(e => ({ value: 'harm:blasts:' + e.id, text: e.id + ' · ' + e.name + ' · ' + nmList(e.pitches) })) },
        { label: 'chord shapes · 2 pianos 2 percussion', items: banks.chordShapes.entries.map(e => ({ value: 'harm:chordShapes:' + e.id, text: e.id + ' · ' + e.name + ' · ' + nmList(e.pitches) })) },
    ];
    const sonorityOf = (v, r) => {
        const [kind, ...rest] = v.split(':');
        if (kind === 'fam') { const step = { 'stack-p5': 7, 'stack-m2': 1 }[rest[0]]; const rootMidi = { F2: 41, 'C#3': 49 }[r]; if (rootMidi == null) return null; if (step) return { notes: [0, 1, 2, 3, 4, 5].map(k => rootMidi + k * step), from: rest[0] }; return { notes: [rootMidi, rootMidi + 1, rootMidi + 3], from: rest[0] }; }
        if (kind === 'harm') { const e = (banks[rest[0]] || { entries: [] }).entries.find(x => x.id === rest.slice(1).join(':')); return e ? { notes: e.pitches.slice(), from: rest[0] + ' ' + e.id } : null; }
        return null;
    };
    const G = H.groupsFor(groups, sonorityOf, 'F2');
    ok(G.length === 5 && !G.some(g => g.key === 'strikes'), 'the morph menu\'s own strikes group is skipped (the db\'s banner is richer): ' + G.map(g => g.key).join(' '));
    const bl = G.find(g => g.key === 'blasts'), cs = G.find(g => g.key === 'chordShapes'), st = G.find(g => g.key === 'stacks'), md = G.find(g => g.key === 'modes'), kp = G.find(g => g.key === 'kept');
    ok(bl.items.length === 45 && cs.items.length === 54, 'the real banks: 45 blasts, 54 chord shapes');
    ok(bl.title === 'BLASTS · the tuba piece' && cs.title === 'CHORD SHAPES · 2 pianos 2 percussion' && kp.title === 'KEPT · yours', 'the banner titles');
    const e = bl.items.find(x => x.id === 'S001');
    ok(e && e.name === 'VERT01-28 V4' && e.n === 9 && e.range === 'F#1–D4' && eq(e.pitches, [30, 38, 41, 46, 48, 49, 60, 61, 62]) && e.root === null, 'a blast row: S001 · VERT01-28 V4 · 9 n · F#1–D4');
    ok(st.family && md.family && !bl.family, 'the stacks and the modes are the family banners (they get the root box)');
    ok(st.items[0].root === 'F2' && eq(st.items[0].pitches, [41, 48, 55, 62, 69, 76]) && st.items[0].id === 'stack-p5@F2' && st.items[0].name === 'stack of 5ths', 'a stack from F2: 41 48 55 62 69 76, id stack-p5@F2');
    const G2 = H.groupsFor(groups, sonorityOf, 'C#3');
    ok(G2.find(g => g.key === 'stacks').items[0].pitches[0] === 49 && G2.find(g => g.key === 'stacks').items[0].id === 'stack-p5@C#3', 'another root rebuilds the families');
    ok(kp.items.length === 0, 'an empty group stays as an empty banner');
    // a menu entry whose sonority cannot be built (no root, a broken kept set) is left out, never a crash
    const G3 = H.groupsFor([{ label: 'kept (yours)', items: [{ value: 'kept:broken', text: 'broken' }] }], () => { throw new Error('boom'); }, 'F2');
    ok(G3.length === 1 && G3[0].items.length === 0, 'a sonority that throws is skipped');
}

// ---- (5) the drawer's dispatch lines and the script tags
const drawer = fs.readFileSync(path.join(ROOT, 'score/public/strike_drawer.js'), 'utf8');
ok(/strikeById\(id\) \{ return \(this\.db && this\.db\.strikes && this\.db\.strikes\[id\]\)/.test(drawer) && /const s = this\.strikeById\(id\); if \(!s\) return;/.test(drawer), 'strike_drawer.js: select() looks a strike up through strikeById()');
ok(/if \(this\.applySource\) this\.applySource\(\);/.test(drawer), 'strike_drawer.js: select() hands the slots to applySource()');
ok(/this\.strikeById\(st\.strikeId\)\) \{ this\.select\(st\.strikeId\); \}/.test(drawer), 'strike_drawer.js: applyState() looks up through strikeById()');
ok(/\(this\.spanFallback \? this\.spanFallback\(\) : 0\)/.test(drawer), 'strike_drawer.js: pattern() takes the nominal span from spanFallback()');
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const iA = html.indexOf('<script src="/harm_source.js"'), iB = html.indexOf('<script src="/harm_source_ui.js"'), iC = html.indexOf('<script src="/strike_chords_ui.js"'), iD = html.indexOf('<script src="/swell_ui.js"');
ok(iA > 0 && iB > iA && iA > iC && iA > iD, 'composer.html: harm_source.js then harm_source_ui.js, after chords mode and the sound switch');
const ui = fs.readFileSync(path.join(ROOT, 'score/public/harm_source_ui.js'), 'utf8');
ok(/selectSeq\(id\) \{/.test(ui) && /renderBanners\(\) \{/.test(ui) && /applySource\(\) \{ this\.relay\(\); \}/.test(ui) && /spanFallback\(\) \{/.test(ui) && /harmStrike\(id\) \{/.test(ui), 'harm_source_ui.js: the column, the source, the fallback and the lookup are defined');

console.log(fails ? ('\n' + fails + ' FAILED') : '\nALL PASS');
process.exit(fails ? 1 : 0);
