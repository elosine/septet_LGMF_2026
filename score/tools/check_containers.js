// check_containers.js — PLAN 1o step 2: the time-container generator, its three axes checked separately.
// Run: node score/tools/check_containers.js
const T = require('../public/time_containers.js');

let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? '  ok   ' : '  FAIL ') + name + (detail ? '  — ' + detail : '')); if (!cond) fail++; };
const H = t => console.log('\n' + t);

const mean = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const POOL = [1, 2, 3, 4, 5, 7, 9];

H('1 · the roll fills a span and STOPS SHORT, never over (his (a), §306)');
{
    let over = 0, empty = 0;
    for (let seed = 1; seed <= 60; seed++) {
        const r = T.roll({ values: [2, 5, 7, 15], total: 60, seed, stick: 0.5, jump: 0.1 });
        if (r.filled > 60 + 1e-9) over++;
        if (!r.count) empty++;
        if (Math.abs(r.filled + r.short - 60) > 1e-6) over++;
    }
    ok('60 seeds, none overshoots the span', over === 0);
    ok('and none comes back empty', empty === 0);
    const r = T.roll({ values: [2, 5, 7, 15], total: 60, seed: 1, stick: 0, jump: 0 });
    ok('the shortfall is reported', r.short >= 0 && Math.abs(r.filled + r.short - 60) < 1e-6, r.filled + ' s + ' + r.short + ' s short');
    ok('every container is one of the numbers', r.seq.every(v => [2, 5, 7, 15].includes(v)), r.seq.join(' '));
}

H('2 · the seed');
{
    const a = T.roll({ values: POOL, total: 60, seed: 9, stick: 0.9, jump: 0.1, contour: 'openClose' });
    const b = T.roll({ values: POOL, total: 60, seed: 9, stick: 0.9, jump: 0.1, contour: 'openClose' });
    const c = T.roll({ values: POOL, total: 60, seed: 10, stick: 0.9, jump: 0.1, contour: 'openClose' });
    ok('the same seed repeats a roll exactly', JSON.stringify(a.seq) === JSON.stringify(b.seq), a.units.join(' '));
    ok('another seed rolls differently', JSON.stringify(a.seq) !== JSON.stringify(c.seq), c.units.join(' '));
}

H('3 · THE POOL — the weights are his rule: a given weight stands, the rest share what is left');
{
    const w = T.weightsFor([2, 5, 7, 15], [null, null, null, 0.20]);
    ok('15 keeps its 20 %', Math.abs(w[3] - 0.20) < 1e-9);
    ok('the other three share the 80 % equally', w.slice(0, 3).every(x => Math.abs(x - 0.8 / 3) < 1e-9), w.map(x => (x * 100).toFixed(1) + '%').join(' '));
    ok('they sum to 1', Math.abs(w.reduce((s, x) => s + x, 0) - 1) < 1e-9);
    ok('no weights at all = equal shares', T.weightsFor([1, 2, 3], null).every(x => Math.abs(x - 1 / 3) < 1e-9));
    // and it shows in a long roll
    let count15 = 0, n = 0;
    for (let s = 1; s <= 40; s++) { const r = T.roll({ values: [2, 5, 7, 15], weights: [null, null, null, 0.20], total: 300, seed: s, stick: 0, jump: 0 });
        count15 += r.units.filter(v => v === 15).length; n += r.count; }
    const share = count15 / n;
    ok('over 40 long memoryless rolls, 15 comes up about a fifth of the time', Math.abs(share - 0.20) < 0.06, (share * 100).toFixed(1) + '%');
}

H('4 · the UNIT rescales a whole shape (his (c), §306)');
{
    const a = T.roll({ values: [2, 5, 7, 15], unit: 1, total: 60, seed: 3, stick: 0, jump: 0 });
    const b = T.roll({ values: [2, 5, 7, 15], unit: 0.4, total: 24, seed: 3, stick: 0, jump: 0 });
    ok('the same numbers come out, in the same order', JSON.stringify(a.units) === JSON.stringify(b.units), a.units.join(' '));
    ok('and the seconds are scaled by the unit', b.seq.every((v, i) => Math.abs(v - a.seq[i] * 0.4) < 1e-6), b.seq.slice(0, 5).join(' '));
}

H('5 · THE ORDER — stickiness lengthens the runs, interrupt breaks them (§307)');
{
    const runs = seq => { let r = 1, best = 1; for (let i = 1; i < seq.length; i++) { if (seq[i] === seq[i - 1]) { r++; best = Math.max(best, r); } else r = 1; } return best; };
    const near = seq => { let n = 0; for (let i = 1; i < seq.length; i++) if (Math.abs(seq[i] - seq[i - 1]) <= 1) n++; return n / Math.max(1, seq.length - 1); };
    const loose = [], tight = [];
    for (let s = 1; s <= 20; s++) {
        loose.push(near(T.roll({ values: POOL, total: 120, seed: s, stick: 0, jump: 0 }).units));
        tight.push(near(T.roll({ values: POOL, total: 120, seed: s, stick: 1.5, jump: 0 }).units));
    }
    ok('sticky rolls keep to neighbouring values far more often', mean(tight) > mean(loose) + 0.2,
       'memoryless ' + (mean(loose) * 100).toFixed(0) + '% vs sticky ' + (mean(tight) * 100).toFixed(0) + '%');
    const stuck = T.roll({ values: POOL, total: 120, seed: 2, stick: 2.5, jump: 0 });
    ok('stickiness alone LOCKS UP — the finding that made interrupt its own control', runs(stuck.units) >= 4,
       'longest run ' + runs(stuck.units) + ': ' + stuck.units.slice(0, 12).join(' '));
    const freed = T.roll({ values: POOL, total: 120, seed: 2, stick: 2.5, jump: 0.25 });
    ok('and interrupt breaks the lock', runs(freed.units) < runs(stuck.units),
       'longest run ' + runs(freed.units) + ': ' + freed.units.slice(0, 14).join(' '));
    const jumps = seq => { let n = 0; for (let i = 1; i < seq.length; i++) if (Math.abs(seq[i] - seq[i - 1]) >= 4) n++; return n; };
    ok('a higher interrupt gives more far leaps',
       jumps(T.roll({ values: POOL, total: 200, seed: 5, stick: 1.2, jump: 0.35 }).units) > jumps(T.roll({ values: POOL, total: 200, seed: 5, stick: 1.2, jump: 0 }).units));
}

H('6 · THE CONTOUR — his accordion (§308)');
{
    const halves = seq => { const h = Math.floor(seq.length / 2); return [mean(seq.slice(0, h)), mean(seq.slice(h))]; };
    const thirds = seq => { const t = Math.floor(seq.length / 3); return [mean(seq.slice(0, t)), mean(seq.slice(t, 2 * t)), mean(seq.slice(2 * t))]; };
    const many = (o, f) => { const out = []; for (let s = 1; s <= 24; s++) out.push(f(T.roll(Object.assign({ values: POOL, total: 150, stick: 0.9, jump: 0.05, depth: 2, seed: s }, o)).units)); return out; };
    const g = many({ contour: 'grow' }, halves);
    ok('grow: the second half is larger than the first', mean(g.map(x => x[1])) > mean(g.map(x => x[0])) + 0.5,
       mean(g.map(x => x[0])).toFixed(2) + ' → ' + mean(g.map(x => x[1])).toFixed(2));
    const sh = many({ contour: 'shrink' }, halves);
    ok('shrink: the second half is smaller', mean(sh.map(x => x[1])) < mean(sh.map(x => x[0])) - 0.5,
       mean(sh.map(x => x[0])).toFixed(2) + ' → ' + mean(sh.map(x => x[1])).toFixed(2));
    const oc = many({ contour: 'openClose', turn: 0.5 }, thirds);
    const a = mean(oc.map(x => x[0])), b = mean(oc.map(x => x[1])), c = mean(oc.map(x => x[2]));
    ok('open–close: the middle third is the largest — the bellows', b > a && b > c, a.toFixed(2) + ' → ' + b.toFixed(2) + ' → ' + c.toFixed(2));
    const co = many({ contour: 'closeOpen', turn: 0.5 }, thirds);
    const d = mean(co.map(x => x[0])), e = mean(co.map(x => x[1])), f = mean(co.map(x => x[2]));
    ok('close–open: the middle third is the smallest', e < d && e < f, d.toFixed(2) + ' → ' + e.toFixed(2) + ' → ' + f.toFixed(2));
    // the turn is the asymmetry
    const peakAt = turn => { const out = []; for (let s = 1; s <= 24; s++) { const u = T.roll({ values: POOL, total: 150, stick: 0.9, jump: 0.05, depth: 2, contour: 'openClose', turn, seed: s }).units;
        let bi = 0; u.forEach((v, i) => { if (v > u[bi]) bi = i; }); out.push(bi / Math.max(1, u.length - 1)); } return mean(out); };
    ok('an early turn puts the peak earlier than a late one', peakAt(0.25) < peakAt(0.8),
       'turn 0.25 peaks at ' + (peakAt(0.25) * 100).toFixed(0) + '% · turn 0.8 at ' + (peakAt(0.8) * 100).toFixed(0) + '%');
    // depth decides whether the shape is the subject or the background
    const shapedness = depth => { const out = []; for (let s = 1; s <= 24; s++) { const t = thirds(T.roll({ values: POOL, total: 150, stick: 0.9, jump: 0.15, contour: 'openClose', turn: 0.5, depth, seed: s }).units);
        out.push(t[1] - (t[0] + t[2]) / 2); } return mean(out); };
    ok('depth decides how much of the contour survives the interruptions', shapedness(2.5) > shapedness(0.3) + 0.3,
       'depth 0.3 → ' + shapedness(0.3).toFixed(2) + ' · depth 2.5 → ' + shapedness(2.5).toFixed(2));
    ok('flat pulls not at all', T.contourAt('flat', 0.5, 0.5, 1) === null);
}

H('7 · THE PRESETS — sorted by spread, because the spread is what is audible (§306)');
{
    const sp = T.PRESETS.map(p => T.spreadOf(p.values));
    ok('the menu is in spread order', sp.every((v, i) => i === 0 || v >= sp[i - 1]), sp.join(' '));
    ok('it runs from even to extreme', sp[0] === 1 && sp[sp.length - 1] >= 15, sp[0] + '× … ' + sp[sp.length - 1] + '×');
    ok('every preset has a source note and usable numbers', T.PRESETS.every(p => p.note && p.values.length && p.values.every(v => v > 0)),
       T.PRESETS.length + ' presets');
    ok('the proportion systems are all there', ['pythag', 'root2', 'golden', 'root3', 'silver', 'modulor'].every(k => T.PRESETS.some(p => p.key === k)));
    ok('his own weighted set is one of them', (T.PRESETS.find(p => p.key === 'oneRareLong') || {}).weights != null);
    // and the spread really does govern how much the seed matters
    const varyOf = vals => { const c = []; for (let s = 1; s <= 20; s++) c.push(T.roll({ values: vals, total: 120, seed: s, stick: 0, jump: 0 }).count); return Math.max.apply(null, c) - Math.min.apply(null, c); };
    ok('an even set gives the same count whatever the seed; a wide one does not', varyOf([4]) === 0 && varyOf([1, 2, 4, 8, 16]) > 5,
       'even ' + varyOf([4]) + ' · powers of two ' + varyOf([1, 2, 4, 8, 16]));
}

H('8 · the edges');
{
    ok('no numbers: it says so', T.roll({ values: [], total: 60 }).why !== '');
    ok('every container longer than the span: it says so', /longer than the span/.test(T.roll({ values: [90], total: 60 }).why));
    ok('one number fills evenly', T.roll({ values: [4], total: 60, seed: 1 }).count === 15);
    ok('a zero or negative number is ignored', T.roll({ values: [0, -3, 4], total: 20, seed: 1 }).seq.every(v => v === 4));
    const r = T.roll({ values: [2, 3], total: 12, stick: 0, seed: 1 });
    const on = T.onsetsMs(r, 0);
    ok('onsetsMs turns the roll into onsets, cumulative from zero',
       on[0] === 0 && on.length === r.count && on.every((v, i) => i === 0 || Math.abs(v - (on[i - 1] + r.seq[i - 1] * 1000)) < 1e-6),
       on.join(' '));
    ok('and it honours a start offset', T.onsetsMs(r, 5000)[0] === 5000);
    ok('and describe says what was set', /spread/.test(T.describe({ values: POOL, contour: 'openClose' })), T.describe({ values: POOL, contour: 'openClose' }));
}

console.log('\n' + (fail ? fail + ' FAILED' : 'all checks passed'));
process.exit(fail ? 1 : 0);
