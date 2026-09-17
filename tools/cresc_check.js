// cresc_check.js — the crescendo object, the end rule, the spacing rule and the listening-test file, checked in node
// (PLAN 1l; RUNNING_LOG §262). `node tools/cresc_check.js` → PASS / FAIL lines and a verdict.
// (1) the shapes: surge back-loaded, bloom front-loaded, line even — measured off the drawn curve, not asserted;
// (2) the end rule: to 0.17 s before the next note · the 5 s fallback · a manual duration · a crowded neighbour;
// (3) the object: the fields, the orange fill, the provenance, the ppp … fff range;
// (4) the spacing rule on HIS piece: the strikes unmoved, and the GESTURE CLAUSE letting every re-breath of the BLOOM through;
// (5) the test file: the grid, the same times on every lane, nothing overlapping, a marker per column.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const Cresc = require(path.join(ROOT, 'score/public/cresc.js'));
const Spacing = require(path.join(ROOT, 'score/public/spacing.js'));
const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fails++; };
const eq = (a, b, e) => Math.abs(a - b) <= (e || 1e-6);
const vn1 = { lane: 3, tech: 'senza_vel', label: 'Vn1' };

// ---- (1) the shapes ----
{
    const s = Cresc.make(0, 78, vn1, [], { shape: 'surge', ratio: 5, durS: 8 });
    const l = Cresc.make(0, 78, vn1, [], { shape: 'line', durS: 8 });
    const b = Cresc.make(0, 78, vn1, [], { shape: 'bloom', ratio: 5, durS: 8 });
    ok(s.segments[0].model === 'exponential' && eq(s.segments[0].slope, 0.40) && b.segments[0].model === 'logarithmic' && eq(b.segments[0].slope, -0.29) && l.segments[0].model === 'power' && l.segments[0].slope === 0,
        'the three shapes carry his own models and slopes (surge exponential 0.40 · bloom logarithmic −0.29 · line power 0)');
    const ts = Cresc.thresholdOf(s), tl = Cresc.thresholdOf(l), tb = Cresc.thresholdOf(b);
    ok(ts > 0.6 && eq(tl, 0.5, 0.02) && tb < 0.4, 'measured off the drawn curve: surge is BACK-loaded (half at ' + ts + '), line even (' + tl + '), bloom FRONT-loaded (' + tb + ')');
    ok(Cresc.heightAt(s, 0.5) < Cresc.heightAt(l, 0.5) && Cresc.heightAt(l, 0.5) < Cresc.heightAt(b, 0.5), 'at half time the bloom is loudest and the surge quietest — the families point the right ways');
    ok(Cresc.heightAt(s, 0) === 0 && Cresc.heightAt(s, 1) === 10 && Cresc.heightAt(b, 1) === 10, 'every shape starts at ppp and ends at fff — a CLIFF at the top');
    ok(Cresc.segmentFor('surge', 11).slope === 0.60 && Cresc.segmentFor('surge', 3).ratio === 2 && Cresc.segmentFor('bloom', 25).slope === -0.46, 'the ratio ladder picks the nearest rung (his CURVE_DATABASE)');
    ok(Cresc.STANDARD.shape === 'surge' && Cresc.STANDARD.ratio === 5 && Cresc.STANDARD.provisional === false && Cresc.STANDARD.named === '2026-09-08',
        'the standard is surge 5×, NAMED by him after the listening test (line and bloom stay as options; bloom revisited at first use)');
}

// ---- (2) the end rule ----
{
    const notes = [{ startSeconds: 12, endSeconds: 12.5 }];
    const a = Cresc.make(4, 78, vn1, notes, {});
    ok(eq(a.endSeconds, 11.83) && a.properties.cresc.end === 'toNextNote' && eq(a.properties.cresc.gapTo, 12), 'to 0.17 s before that player\'s next note (4 → 11.83, the note at 12)');
    const b = Cresc.make(4, 78, vn1, [], {});
    ok(eq(b.endSeconds, 9) && b.properties.cresc.end === 'fallback', 'no later note on that player: the 5 s fallback');
    const c = Cresc.make(4, 78, vn1, notes, { durS: 3 });
    ok(eq(c.endSeconds, 7) && c.properties.cresc.end === 'manual', 'a typed duration overrides both and says so');
    ok(Cresc.make(4, 78, vn1, [{ startSeconds: 4.2, endSeconds: 5 }], {}) === null && Cresc.endFor(4, [{ startSeconds: 4.2, endSeconds: 5 }], {}).how === 'noRoom',
        'a note too close REFUSES the crescendo rather than drawing one over it — the caller says there is no room (0.03 s here)');
    ok(Cresc.make(4, 78, vn1, [{ startSeconds: 4.2, endSeconds: 5 }], { durS: 3 }) !== null, 'a typed duration still makes one — the composer\'s hand overrides the room');
    ok(Cresc.make(4, 78, vn1, [{ startSeconds: 3, endSeconds: 3.5 }], {}).properties.cresc.end === 'fallback', 'an EARLIER note is not "next" — the fallback stands');
    ok(Cresc.DEFAULTS.endGapS === 0.17 && Cresc.DEFAULTS.fallbackS === 5 && Cresc.DEFAULTS.trillFallbackS === 3, 'his numbers: 0.17 s before the next note, 5 s for a crescendo, 3 s for a trill');
}

// ---- (3) the object ----
{
    const w = Cresc.make(10, 60, { lane: 6, tech: 'senza_vel', label: 'Vc' }, [], { durS: 6, dynLo: Cresc.dynHeight('p'), dynHi: Cresc.dynHeight('ff') });
    ok(w.type === 'waveCurve' && w.sonifyNote === 60 && w.layer === 6 && w.technique === 'senza_vel' && w.nodes.length === 2 && w.segments.length === 1, 'a crescendo IS an ordinary held note — no new object type');
    ok(w.color === '#C2410C' && w.fillMode === 'bottom' && w.opacity < 1, 'drawn filled and transparent in the morph orange');
    ok(eq(w.nodes[0].y, 2.9) && eq(w.nodes[1].y, 8.6) && w.properties.cresc.dynLo === 2.9 && w.properties.cresc.dynHi === 8.6, 'the dynamic range is the curve: p → ff');
    ok(Cresc.isCresc(w) && w.properties.cresc.peak === 'cliff' && w.properties.cresc.shape === 'surge' && w.properties.cresc.threshold === 0.68, 'the provenance carries the family, the ratio, the threshold, the range and the peak');
    ok(/^cresc surge 5× p→ff 6\.00 s \(typed\)$/.test(w.performanceNotes), 'the performance note says what it is: ' + w.performanceNotes);
    ok(/^C4 · surge 5× · p → ff · 6\.00 s · manual$/.test(Cresc.describe(w)), 'describe: ' + Cresc.describe(w));
    ok(Cresc.dynHeight('ppp') === 0 && Cresc.dynHeight('fff') === 10 && Cresc.dynName(0) === 'ppp' && Cresc.dynName(10) === 'fff', 'ppp … fff over the full measured scale (NAMING §2.9)');
}

// ---- (3b) secco and the slot rotation (PLAN 1l step 5) ----
{
    const w = Cresc.make(0, 78, vn1, [], { durS: 4 });
    ok(w.properties.cresc.secco === true, 'a crescendo is SECCO by default (his CN-49)');
    ok(Cresc.make(0, 78, vn1, [], { durS: 4, secco: false }).properties.cresc.secco === false, 'and it can be turned off one at a time');
    const mk = (t, dur, i) => { const c = Cresc.make(t, 78, vn1, [], { durS: dur }); c.id = 'c' + i; return c; };
    const env = { pool: { violin1: [2, 3, 4] }, instKeys: { 3: 'violin1' }, toleranceS: 2 };
    const fine = Cresc.assignSlots([0, 1.2, 2.4, 3.6, 4.8, 6].map((t, i) => mk(t, 1, i)), env);
    ok(fine.assigned.map(a => a.slot).join() === '2,3,4,2,3,4' && fine.warnings.length === 0, 'the pool of three rotates and keeps the 2 s rest at 1 s crescendos every 1.2 s');
    const tight = Cresc.assignSlots([0, 0.6, 1.2, 1.8, 2.4].map((t, i) => mk(t, 0.5, i)), env);
    ok(tight.warnings.length > 0 && /add a slot/.test(tight.warnings[0]), 'half-second crescendos every 0.6 s WARN rather than silently break the rest — the signal for a fourth slot');
    const none = Cresc.assignSlots([mk(0, 4, 0)], { pool: {}, instKeys: { 3: 'violin1' }, toleranceS: 2 });
    ok(none.assigned[0].slot === null && /no pool/.test(none.assigned[0].why), 'no pool = the ordinary voice\'s own channel, exactly as today');
    const list = [0, 1.2].map((t, i) => mk(t, 1, i));
    Cresc.applySlots(list, Cresc.assignSlots(list, env).assigned);
    ok(list[0].properties.cresc.slot === 2 && list[1].properties.cresc.slot === 3, 'applySlots writes the slot into the provenance, which is what the tick sends on');
    ok(Cresc.DEFAULTS.secco === true && Cresc.DEFAULTS.toleranceS === 2 && JSON.stringify(Cresc.DEFAULTS.pool) === '{}', 'the defaults: secco on, the tolerance provisional at 2 s, the pool empty until the slots exist');
}

// ---- (4) the spacing rule on HIS piece ----
{
    const piece = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores/piece-septet.json'), 'utf8'));
    const ev = Spacing.eventsOf(piece.objects);
    ok(ev.length > 500, 'the piece read as sounding events (' + ev.length + ')');
    // the strikes do not move: the median note is 63 ms, so 150 ms after its end is looser than 250 ms after its attack
    const shorts = ev.filter(e => (e.t1 - e.t0) <= 0.2);
    let newlyBlocked = 0, byGesture = 0, across = [];
    for (let lane = 0; lane < 7; lane++) {
        const list = ev.filter(e => e.lane === lane).sort((a, b) => a.t0 - b.t0);
        for (let i = 1; i < list.length; i++) {
            const prev = list[i - 1], cur = list[i];
            const atkGap = (cur.t0 - prev.t0) * 1000, endGap = (cur.t0 - prev.t1) * 1000;
            if (atkGap >= 250 && endGap < 150) { newlyBlocked++; if (prev.group && cur.group && prev.group === cur.group) byGesture++; else across.push({ prev: prev.kind, cur: cur.kind, endGap: Math.round(endGap) }); }
        }
    }
    ok(shorts.length > 500, '515+ of the piece\'s notes are 200 ms or shorter (' + shorts.length + ') — the strikes are the short case');
    ok(byGesture === 18 && across.length === newlyBlocked - 18, 'of the ' + newlyBlocked + ' pairs the plain rule would newly block, 18 are INSIDE one gesture (the morph\'s re-breaths) — the clause lets all 18 through');
    ok(across.length && across.every(x => x.prev === 'trill'), 'the other ' + across.length + ' are all a TRILL followed by a strike note ' + Math.min.apply(null, across.map(x => x.endGap)) + '–' + Math.max.apply(null, across.map(x => x.endGap)) + ' ms later — already tighter than 150 ms in his score, and left exactly as they are (the rule governs new generation, it never rewrites what he wrote)');
    // the same, through the helper
    const morph = ev.filter(e => e.group === 'grp-morph-01');
    let blocked = 0;
    morph.forEach(e => { const others = ev.filter(x => x.lane === e.lane && x !== e); if (!Spacing.free(e.t0, others, { restMs: 150, group: e.group, dur: e.t1 - e.t0 }).free) blocked++; });
    ok(morph.length === 0 || blocked === 0, morph.length ? 'every re-breath of the placed morph passes the helper with its group (' + morph.length + ' notes)' : 'no placed morph in the piece file (the BLOOM lives in his test score) — the arithmetic above stands');
    const t = Spacing.tightest(ev);
    ok(t.ms != null, 'the tightest rest between two SEPARATE gestures of one player: ' + t.ms + ' ms');
}
// the helper itself
{
    const one = [{ lane: 0, t0: 0, t1: 8, group: 'g1', kind: 'cresc' }];
    ok(Spacing.free(8.05, one, { restMs: 150 }).free === false && eq(Spacing.free(8.05, one, { restMs: 150 }).freeAt, 8.15), 'a long sound blocks its whole length and 150 ms more');
    ok(Spacing.free(8.15, one, { restMs: 150 }).free === true, 'and frees exactly then');
    ok(Spacing.free(4, one, { restMs: 150 }).free === false, 'a player is not free in the MIDDLE of its own long sound (the old attack-to-attack rule said it was)');
    ok(Spacing.free(4, one, { restMs: 150, group: 'g1' }).free === true, 'the gesture clause: a sound of the SAME gesture never blocks');
    const med = [{ lane: 0, t0: 0, t1: 0.063, group: null }];
    ok(Spacing.free(0.213, med, { restMs: 150 }).free === true && Spacing.free(0.2, med, { restMs: 150 }).free === false && eq(Spacing.free(0.2, med, { restMs: 150 }).freeAt, 0.213),
        'a 63 ms strike (the piece\'s median) frees at 213 ms — looser than the old 250 ms attack-to-attack, so the strikes do not move');
    ok(Spacing.free(1, [{ lane: 0, t0: 2, t1: 3, group: null }], { restMs: 150, dur: 4 }).free === false, 'a new long sound that would run over a later note is blocked too');
}

// ---- (5) the listening-test file ----
{
    const f = path.join(ROOT, 'scores/cresc-test.json');
    ok(fs.existsSync(f), 'the test file exists (node tools/cresc_test.js writes it)');
    const s = JSON.parse(fs.readFileSync(f, 'utf8'));
    const cres = s.objects.filter(Cresc.isCresc), marks = s.objects.filter(o => o.type === 'marker');
    ok(cres.length === 63 && marks.length === 9, '63 crescendos in 9 columns, a marker on each (' + cres.length + ' / ' + marks.length + ')');
    ok(new Set(cres.map(c => c.layer)).size === 7, 'every player has all nine');
    const byT = {}; cres.forEach(c => (byT[c.startSeconds] = (byT[c.startSeconds] || 0) + 1));
    ok(Object.keys(byT).length === 9 && Object.values(byT).every(n => n === 7), 'the same times on all seven lanes — soloing swaps the instrument without moving');
    let overlap = 0;
    for (let lane = 0; lane < 7; lane++) {
        const list = cres.filter(c => c.layer === lane).sort((a, b) => a.startSeconds - b.startSeconds);
        for (let i = 1; i < list.length; i++) if (list[i].startSeconds < list[i - 1].endSeconds) overlap++;
    }
    ok(overlap === 0, 'nothing bleeds into the next column');
    ok(cres.every(c => c.properties.cresc.end === 'manual' && [1.5, 5, 12].indexOf(+(c.endSeconds - c.startSeconds).toFixed(2)) >= 0), 'every crescendo is exactly its column\'s length');
    ok([...new Set(cres.map(c => c.properties.cresc.shape))].sort().join() === 'bloom,line,surge', 'the three shapes are all there');
    ok(cres.every(c => c.technique === (recipe[tracks[c.layer].instKey].ordinary || 'main')), 'each on its player\'s ORDINARY voice');
    ok(cres.every(c => { const inst = recipe[tracks[c.layer].instKey]; const t = (inst.techniques || []).find(x => x.key === c.technique); const lo = t.rangeLow != null ? t.rangeLow : inst.rangeLow, hi = t.rangeHigh != null ? t.rangeHigh : inst.rangeHigh; return c.sonifyNote >= lo && c.sonifyNote <= hi; }), 'every pitch inside its player\'s range');
    ok(cres.every(c => c.nodes[0].y === 0 && c.nodes[1].y === 10), 'ppp → fff on every one');
    ok(s.tracks.length === 7 && s.metadata.generator === 'tools/cresc_test.js', 'the file carries the septet\'s tracks and says how it was made');
}

console.log(fails ? ('\n' + fails + ' FAILED') : '\nALL PASS');
process.exit(fails ? 1 : 0);
