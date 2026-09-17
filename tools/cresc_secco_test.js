// cresc_secco_test.js — THE SECCO TOLERANCE, as a score file (PLAN 1l step 5; CN-49 · CN-50; RUNNING_LOG §263–266).
//
//   node tools/cresc_secco_test.js [--out cresc-secco-test] [--gaps 0.25,0.5,1,2,3] [--cresc 4] [--row 10]
//
// The question this file asks his ear: **after a secco crescendo is cut with CC7 0, how soon can CC7 be raised again before the cut
// note's tail comes back?** He remembers about 2 s from the string quartet's samplers (§264); these are Xsample, SI2, 8Dio and IRCAM,
// and this piece has never measured it (§265). The answer decides how many slots a crescendo pool needs (the napkin of §266: three
// hold above ~0.75 s a crescendo at a 2 s tolerance).
//
// EACH ROW is one gap: a 4 s secco crescendo (cut at its end by the app's `seccoCut`), then a short note on the SAME player and the
// SAME slot after the gap — that note's own pre-arm re-pins CC7 = 127 (D11), which is the moment the tail would return. Rows are far
// apart so one cannot contaminate the next. Every player gets the same rows at the same times, so **solo a part (S in its lane,
// ALT-click = exclusive) and listen down the column**: at which gap do you hear the crescendo come back under the short note?
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const Cresc = require(path.join(ROOT, 'score/public/cresc.js'));

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; return (v != null && !/^--/.test(v)) ? v : true; };
const name = String(flag('--out', 'cresc-secco-test'));
const gaps = String(flag('--gaps', '0.25,0.5,1,2,3')).split(',').map(Number).filter(x => x >= 0);
const crescS = +flag('--cresc', 4);
const rowGap = +flag('--row', 10);           // between rows: longer than the longest gap plus the tail, so rows never contaminate
const probeS = 1.2;                          // the short note that re-pins CC7 — long enough to hear a returning tail under it
const out = path.join(ROOT, 'scores', name + '.json');

const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
const tracks = vm.runInNewContext(html.match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const layoutVersion = +(html.match(/layoutVersion: (\d+)/) || [0, 5])[1];

const players = tracks.map((t, lane) => {
    const inst = recipe[t.instKey]; if (!inst) return null;
    const key = inst.ordinary || (inst.techniques[0] || {}).key;
    const tech = (inst.techniques || []).find(x => x.key === key) || inst.techniques[0];
    const lo = tech.rangeLow != null ? tech.rangeLow : inst.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : inst.rangeHigh;
    return { lane, tech: tech.key, label: t.short, instKey: t.instKey, lo, hi, pitch: Math.round((lo + hi) / 2) };
}).filter(Boolean);

const objects = [];
let id = 1, t = 2;
gaps.forEach((g, k) => {
    objects.push({ id: 'mk-' + (id++), type: 'marker', layer: 0, time: +t.toFixed(3),
        label: (k + 1) + '. cut → ' + g + ' s → a note (does the tail come back?)', color: Cresc.DEFAULTS.color, performanceNotes: '', properties: {} });
    players.forEach(p => {
        // the secco crescendo: a typed length, so the next note does not shorten it
        const wc = Cresc.make(t, p.pitch, p, [], { durS: crescS, secco: true });
        wc.id = 'wc-' + (id++);
        wc.performanceNotes = 'secco crescendo ' + crescS + ' s — ' + p.label + ' ' + Cresc.nm(p.pitch) + ' · cut at its end';
        objects.push(wc);
        // the probe note: the SAME player and slot, `gap` after the cut; its pre-arm re-pins CC7 = 127
        const at = t + crescS + g;
        objects.push({
            id: 'wc-' + (id++), type: 'waveCurve', layer: p.lane,
            startSeconds: +at.toFixed(3), endSeconds: +(at + probeS).toFixed(3),
            nodes: [{ pos: 0, y: 4, smooth: 0.25 }, { pos: 1, y: 4, smooth: 0.25 }],
            segments: [{ model: 'power', slope: 0 }],
            color: '#1D6FA5', fillMode: 'bottom', opacity: 0.45,
            performanceNotes: 'the re-pin — a quiet note ' + g + ' s after the cut; if the crescendo\'s tail returns under it, the tolerance is longer than ' + g + ' s',
            properties: {}, sonifyNote: p.pitch, technique: p.tech,
        });
    });
    t += crescS + g + probeS + rowGap;
});

const score = {
    version: 1, layoutVersion,
    tracks: tracks.map(x => ({ id: x.id, label: x.label, short: x.short, instKey: x.instKey })),
    assets: [],
    metadata: { title: name, note: 'PLAN 1l step 5 — the SECCO TOLERANCE, and D11 shown working. Each row: a ' + crescS + ' s secco crescendo ' +
        'cut with CC7 0 at its end, then a quiet note on the same player after ' + gaps.join(' / ') + ' s. ' +
        'READ IT IN TWO HALVES. (1) THE FLUTE has no curve bank, so both sounds share one channel and the re-pin can revive the cut: solo the ' +
        'flute and listen down the rows — the first gap with NO returning tail is this kit\'s tolerance. (2) THE STRINGS AND THE BASS CLARINET ' +
        'have D11\'s curve channels (2/3/4), so the router puts the crescendo and the note on DIFFERENT channels and the tail cannot come back ' +
        'at all: solo a string and you should hear a clean cut at every gap. If you do, D11 is doing its job and the tolerance only matters ' +
        'when crescendos crowd each other onto the same curve channel — which the tool warns about.',
        generatedAt: new Date().toISOString(), generator: 'tools/cresc_secco_test.js' },
    objects,
    markers: [], databases: {}, nextId: id + 1,
    viewport: { scrollOffset: 0, pixelsPerSecond: 20 },
};
fs.writeFileSync(out, JSON.stringify(score));
console.log('wrote ' + out);
console.log(gaps.length + ' rows × ' + players.length + ' players · the crescendo ' + crescS + ' s, the probe note ' + probeS + ' s · gaps ' + gaps.join(' ') + ' s · ' + (t - rowGap).toFixed(1) + ' s total');
players.forEach(p => console.log('  ' + p.label.padEnd(4) + ' ' + Cresc.nm(p.pitch) + ' · ' + p.tech));
