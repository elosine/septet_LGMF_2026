// test_trills.js — PLAN 2f (2026-09-13): section 1's trills, the battery grown step by step.
//   2f.2 the glyphs — the trill sign and the neighbour's parentheses, stock size from Emmentaler
//   2f.3 the IR — trill zones as env trill events, eaten notes out, the composer's curve math, the validator
//   2f.4 the device — the column (right of the go line since §452), tr and sfz, the curve over the lane, the go line's top, no GC
//   2f.6 the rest — every trill in the save, the whole piece, the full device, no warning
// Spec: docs/TRILL_NOTATION_SPEC.md. piece-septet.json is the composer's LIVE score: read, never written.
// --glyphs <path> / --extract <path> run the checks against another glyphs.json / extract_core.js (to see them go red once).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const J = p => JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : path.join(ROOT, p), 'utf8'));
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };
const eq = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', want ' + b + ')');

const glyphs = J(arg('--glyphs') || 'notation/lib/glyphs.json');

// ---- 2f.2 the glyphs (TRILL_NOTATION_SPEC §2–§3, GLYPH_SIZING §2) ----
{
  const tr = glyphs.articulation && glyphs.articulation.trill;
  ok(tr && tr.path, 'glyphs.articulation.trill exists (scripts.trill)');
  if (tr) {
    eq(tr.wSs, 2.396, 0.002, 'trill sign stored at STOCK width');
    eq(tr.hSs, 2.204, 0.002, 'trill sign stored at STOCK height');
    // §439 (the composer: "halfway between what it currently is now and the sforzando size"): the tr's drawn height is
    // halfway between the first scale's (0.70) and the sfz's — the registry scale, read, not restated
    const trK = J('notation/registry/container.json').engraving.layout.devices.byEnv.trill.techSymbolScale;
    eq(tr.hSs * trK, (tr.hSs * 0.70 + glyphs.dynamic.sfz.hSs) / 2, 0.005, 'trill sign at the registry scale ' + trK + ': height halfway between 0.70 and the sfz (§439)');
    ok(/scripts\.trill/.test(tr._provenance && tr._provenance.source), 'trill sign provenance names the Emmentaler glyph');
  }
  for (const k of ['leftParen', 'rightParen']) {
    const g = glyphs.accidental && glyphs.accidental[k];
    ok(g && g.path, 'glyphs.accidental.' + k + ' exists');
    if (g) {
      eq(g.wSs, 0.452, 0.002, k + ' stored at STOCK width');
      eq(g.hSs * 0.63, 1.326, 0.003, k + ' at parenScale 0.63 is LilyPond\'s TrillPitchParentheses height (probe 1.26 ink)');
      ok(g.anchors && g.anchors.center, k + ' carries a center anchor (the stamp aligns on it)');
    }
  }
  // the existing entries the tool re-grabs keep their own provenance (byte-stable re-run)
  ok(glyphs.articulation.snappizz && glyphs.articulation.snappizz._provenance.ported === '2026-09-11', 'snappizz untouched by the re-run (ported 2026-09-11)');
  // the stamps render them (touchpoints 2 and 4 already cover artic-* and accidental-*)
  const Stamps = require('../notation/lib/stamps.js');
  const S = Stamps.makeStamps(glyphs);
  let svgT = '', svgP = '';
  try { svgT = Stamps.toSvg(Stamps.scaled(S.articulation('trill'), 0.57), { xPx: 10, yPx: 10, ssPx: 7.9, align: 'center' }); } catch (e) { /* red below */ }
  try { svgP = Stamps.toSvg(Stamps.scaled(S.accidental('leftParen'), 0.63), { xPx: 10, yPx: 10, ssPx: 7.9, align: 'center' }); } catch (e) { /* red below */ }
  ok(/<path/.test(svgT), 'stamps: artic-trill renders a path at a scale');
  ok(/<path/.test(svgP), 'stamps: accidental-leftParen renders a path at scale 0.63');
}

// ---- 2f.3 the IR (TRILL_NOTATION_SPEC §1) ----
{
  const Extract = require(arg('--extract') ? path.resolve(arg('--extract')) : '../notation/lib/extract_core.js');
  const SonifyCore = require('../score/public/sonify_core.js');
  const score = J('scores/piece-septet.json');
  const W = [0, 176], PARTS = [0, 1, 2, 3, 4, 5, 6];
  const base = {
    scoreName: 'piece-septet', window: W, parts: PARTS, id: 'trill-battery', profile: 'trance', metaLayer: 7,
    registry: J('notation/registry/classes.json'), sampleLengths: J('bank/sample_lengths.json'),
    techniques: J('notation/registry/techniques.json').techniques,
  };
  const off = Extract.extract(score, Object.assign({}, base, { options: { chords: true } })).doc;
  const on = Extract.extract(score, Object.assign({}, base, { options: { chords: true, trills: true } })).doc;
  const zones = score.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill' && o.trill && o.startTime >= W[0] && o.startTime < W[1] && PARTS.includes(o.layer));
  const trillIds = new Set(score.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill').map(o => o.id));
  const eaten = score.objects.filter(o => o.type === 'waveCurve' && o.mutedBy && trillIds.has(o.mutedBy) && o.startSeconds >= W[0] && o.startSeconds < W[1] && PARTS.includes(o.layer));
  const trEv = on.events.filter(e => e.env === 'trill');

  ok(!off.events.some(e => e.env === 'trill'), 'trills OFF: no env trill event (every existing page extracts as before)');
  ok(eaten.every(o => off.events.some(e => e.source.objectId === o.id)), 'trills OFF: the eaten notes are still extracted (' + eaten.length + ')');
  ok(zones.length > 0, 'the live score holds trill zones in 0–176 s (' + zones.length + ')');
  ok(trEv.length === zones.length && zones.every(z => trEv.filter(e => e.source.objectId === z.id).length === 1), 'trills ON: every trill zone in window × parts is exactly one env trill event');
  ok(!on.events.some(e => eaten.some(o => o.id === e.source.objectId)), 'trills ON: no event sources a note a trill ate (mutedBy)');
  ok(on.events.length === off.events.length - eaten.length + zones.length, 'trills ON: events = off − eaten + trills (' + on.events.length + ')');
  const chunkOf = id => on.chunks.find(c => c.events.includes(id));
  let bad = [];
  for (const e of trEv) {
    const z = zones.find(q => q.id === e.source.objectId);
    const c = chunkOf(e.id);
    const s = e.level && e.level.samples;
    const nb = e.trill && e.trill.neighbour;
    const STEPS = 'CDEFGAB';
    const nextStep = STEPS[(STEPS.indexOf(e.pitch.spelled.step) + 1) % 7];
    if (!c || c.events.length !== 1 || c.class !== 'trill' || c.part !== z.layer) bad.push(e.id + ' chunk');
    if (!s || s.length !== 101 || s.some(v => !(v >= 0 && v <= 1))) bad.push(e.id + ' samples');
    if (Math.abs(e.onset - z.startTime) > 1e-9 || Math.abs(e.duration - (z.endTime - z.startTime)) > 1e-9) bad.push(e.id + ' span');
    if (!nb || nb.midi !== e.pitch.midi + z.trill.interval) bad.push(e.id + ' neighbour midi');
    else if (nb.spelled.step !== nextStep && Math.abs(nb.spelled.alter) <= 1 && !(Extract.naiveSpell(nb.midi).step === nb.spelled.step)) bad.push(e.id + ' neighbour step ' + nb.spelled.step);
  }
  ok(!bad.length, 'every trill event: its own chunk (class trill, the zone\'s part) · 101 samples in 0–1 · the zone\'s span · neighbour = pitch + interval, the next letter up' + (bad.length ? ' — ' + bad.slice(0, 6).join(', ') : ''));

  // THE CURVE: the port equals composer.html's own getYAtPos, lifted from the live file (with a smooth node,
  // the case sonify_core.evalWaveCurve does not cover)
  const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
  const i0 = html.indexOf('    getYAtPos(wc, pos) {');
  const i1 = html.indexOf('\n    },', i0);
  ok(i0 > 0 && i1 > i0, 'composer.html still defines getYAtPos (the port\'s reference)');
  if (i0 > 0 && i1 > i0 && Extract.curveYAtPos) {
    const body = html.slice(html.indexOf('{', i0) + 1, i1);
    const ref = new Function('wc', 'pos', body).bind({ computeSegY: SonifyCore.computeSegY });
    const syn = { nodes: [{ pos: 0, y: 1 }, { pos: 0.3, y: 9, smooth: 0.8 }, { pos: 0.7, y: 2, smooth: 0.5 }, { pos: 1, y: 7 }],
      segments: [{ model: 'bezier', slope: 0.4 }, { model: 'ctrl', slope: 0, cx: 0.3, cy: 0.9 }, { model: 'bezier', slope: -0.2 }] };
    let maxD = 0, maxDev = 0;
    for (let k = 0; k <= 400; k++) {
      const pos = k / 400;
      maxD = Math.max(maxD, Math.abs(Extract.curveYAtPos(syn, pos) - ref(syn, pos)));
      maxDev = Math.max(maxDev, Math.abs(ref(syn, pos) - SonifyCore.evalWaveCurve(syn, pos) * 10));
    }
    ok(maxD < 1e-12, 'curveYAtPos === composer.html getYAtPos on a smoothed curve, 401 points (max diff ' + maxD + ')');
    ok(maxDev > 0.05, 'the smoothed test curve is one sonify_core.evalWaveCurve gets wrong (max ' + maxDev.toFixed(3) + ' of 10) — the port is not vacuous');
  } else ok(false, 'extract_core exports curveYAtPos');

  // THE REFERENCE: each trill's samples equal an independent reading of its window over its span
  {
    let worst = 0;
    const win = { A: 8, B: 9, C: 10 };
    for (const e of trEv) {
      const z = zones.find(q => q.id === e.source.objectId);
      const L = z.trill.curveRef === 'auto' ? 8 : win[z.trill.curveRef];
      if (L == null) continue;
      const cs = score.objects.filter(o => o.type === 'waveCurve' && o.layer === L && !o.groupId && o.sonifyNote == null && o.endSeconds > z.startTime && o.startSeconds < z.endTime);
      if (!cs.length || cs.some(c => c.nodes.some(n => n.smooth > 0))) continue;
      for (let i = 0; i <= 100; i += 10) {
        const sec = z.startTime + (z.endTime - z.startTime) * i / 100;
        const c = cs.find(o => sec >= o.startSeconds && sec <= o.endSeconds);
        if (!c) continue;
        const v = Math.max(0, Math.min(1, SonifyCore.evalWaveCurve(c, (sec - c.startSeconds) / (c.endSeconds - c.startSeconds))));
        worst = Math.max(worst, Math.abs(v - e.level.samples[i]));
      }
    }
    ok(worst < 2e-3, 'every trill\'s samples match its window read independently (sonify_core, no smooth nodes) — worst ' + worst.toFixed(5));
  }

  // THE SPELLING RULE, by cases
  if (Extract.spellNeighbour) {
    const S = (st, al, oc) => ({ step: st, alter: al, octave: oc });
    const f = s => s.step + (s.alter > 0 ? '#'.repeat(s.alter) : 'b'.repeat(-s.alter)) + s.octave;
    const cases = [[S('C', 0, 4), 61, 'Db4'], [S('C', 0, 2), 38, 'D2'], [S('E', 0, 4), 65, 'F4'], [S('B', 0, 3), 60, 'C4'], [S('B', 0, 3), 61, 'C#4'],
      [S('C', 1, 4), 63, 'D#4'], [S('G', 1, 3), 57, 'A3'], [S('B', 1, 3), 62, 'D4']];
    const got = cases.map(([m, n, want]) => [f(Extract.spellNeighbour(m, n)), want]);
    ok(got.every(([g, w]) => g === w), 'neighbour spelling: next letter up; a double accidental falls back — ' + got.map(([g, w]) => g + (g === w ? '' : '≠' + w)).join(' '));
  } else ok(false, 'extract_core exports spellNeighbour');

  // THE VALIDATOR accepts a trill page and still refuses a broken one
  if (!trEv.length) ok(false, 'ir_validate checks skipped: the extraction holds no trill event');
  else {
    const { spawnSync } = require('child_process');
    const tmp = path.join(require('os').tmpdir(), 'trill-battery.ir.json');
    const doc = JSON.parse(JSON.stringify(on));
    fs.writeFileSync(tmp, JSON.stringify(doc));
    const r1 = spawnSync(process.execPath, [path.join(ROOT, 'tools/ir_validate.js'), tmp, '--against-source', '--complete'], { encoding: 'utf8' });
    ok(r1.status === 0, 'ir_validate: the trills-ON extraction is VALID against source and complete' + (r1.status ? ' — ' + (r1.stdout + r1.stderr).split('\n').slice(0, 3).join(' | ') : ''));
    const broken = JSON.parse(JSON.stringify(on));
    broken.events.find(e => e.env === 'trill').trill.interval += 1;
    fs.writeFileSync(tmp, JSON.stringify(broken));
    const r2 = spawnSync(process.execPath, [path.join(ROOT, 'tools/ir_validate.js'), tmp, '--against-source', '--complete'], { encoding: 'utf8' });
    ok(r2.status !== 0 && /interval/.test(r2.stdout + r2.stderr), 'ir_validate: a wrong interval is refused');
    const missing = JSON.parse(JSON.stringify(on));
    const gone = missing.events.find(e => e.env === 'trill');
    missing.events = missing.events.filter(e => e !== gone);
    missing.chunks = missing.chunks.filter(c => !c.events.includes(gone.id));
    fs.writeFileSync(tmp, JSON.stringify(missing));
    const r3 = spawnSync(process.execPath, [path.join(ROOT, 'tools/ir_validate.js'), tmp, '--against-source', '--complete'], { encoding: 'utf8' });
    ok(r3.status !== 0 && /trill .* has no event/.test(r3.stdout + r3.stderr), 'ir_validate --complete: a missing trill is refused');
    fs.unlinkSync(tmp);
  }
}

// ---- 2f.4 the device (TRILL_NOTATION_SPEC §2–§5; registry devices.byEnv.trill) ----
{
  const Extract = require('../notation/lib/extract_core.js');
  const Layout = require('../notation/lib/layout.js');
  const Render = require('../notation/lib/render.js');
  const Coords = require('../notation/lib/coords.js');
  const score = J('scores/piece-septet.json');
  const ens = J('notation/registry/ensemble.json'), tech = J('notation/registry/techniques.json'), C = J('notation/registry/container.json');
  const DEV = C.engraving.layout.devices.byEnv.trill;
  const L = C.engraving.layout;
  ok(DEV && DEV.goLine && DEV.goLineTopAsGc && !DEV.gc && DEV.nhUnit && DEV.brick === false && DEV.curve && DEV.cut === false && DEV.curveBand === 'lane'
    && DEV.dynMark === 'sfz' && DEV.techSymbol === 'trill' && Math.abs(DEV.techSymbolScale - 0.57) < 1e-9 && DEV.trillPitch && DEV.chainSide === undefined,
    'registry byEnv.trill: go line (strikes\' length) · no GC · open unit · no brick · curve over the lane, not peak-cut · sfz · tr at 0.57 (§439) · the neighbour group · chainSide unset (the room rule)');
  const parts = ens.parts.map(p => p.part);
  // the first PIANO trill in the live save, never a hard-coded id
  const pz = score.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill' && o.trill && o.layer === 2).sort((a, b) => a.startTime - b.startTime)[0];
  ok(!!pz, 'the live save holds a piano trill');
  if (pz) {
    const w0 = Math.floor(pz.startTime) - 3, w1 = pz.endTime + 0.2;
    const { doc } = Extract.extract(score, { scoreName: 'piece-septet', window: [w0, w1], parts, id: 'trill-dev', registry: J('notation/registry/classes.json'),
      sampleLengths: J('bank/sample_lengths.json'), profile: 'trance', options: { chords: true, trills: true }, metaLayer: ens.metaLayer, techniques: tech.techniques });
    for (const c of doc.chunks) c.strategy = 'unresolved';   // the --bricks page
    const model = Layout.layoutSection(doc, glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, L));
    const evId = 'ev-' + pz.id;
    const ev = doc.events.find(e => e.id === evId);
    const sys = model.systems.find(s => s.items.some(i => i.ev === evId || (i.k === 'glyph' && i.g === 'notehead-open' && Math.abs(i.t - pz.startTime) < 1e-9)));
    const its = sys ? sys.items.filter(i => Math.abs((i.t != null ? i.t : i.t0) - pz.startTime) < 1e-9 && (i.ev === evId || ['glyph', 'ledger'].includes(i.k))) : [];
    const g = k => its.filter(i => i.k === 'glyph' && i.g === k);
    const head = g('notehead-open')[0], lp = g('accidental-leftParen')[0], rp = g('accidental-rightParen')[0];
    const nHead = its.find(i => i.k === 'glyph' && i.g === 'notehead' && i.ev === evId), sfz = g('dyn-sfz')[0], tr = g('artic-trill')[0];
    ok(head && lp && rp && nHead && sfz && tr, 'the piano trill draws: open head · ( neighbour ) · sfz · tr');
    if (head && lp && rp && nHead && sfz && tr) {
      const P = DEV.trillPitch;
      const hw = glyphs.notehead.open.wSs, pw = glyphs.accidental.leftParen.wSs * P.parenScale, nw = glyphs.notehead.filled.wSs * P.headScale;
      const hRight = head.dxSs + hw / 2, lpLeft = lp.dxSs - pw / 2, lpRight = lp.dxSs + pw / 2;
      const nL = nHead.dxSs - nw / 2, nR = nHead.dxSs + nw / 2, rpLeft = rp.dxSs - pw / 2, rpRight = rp.dxSs + pw / 2;
      eq(lpLeft - hRight, P.groupPadSs, 1e-6, 'the left paren sits groupPadSs after the main head (LilyPond 0.30)');
      if (!its.some(i => i.ev === evId && /^accidental-(sharp|flat|natural)/.test(i.g || ''))) eq(nL - lpRight, P.parenInnerSs, 1e-6, 'paren → neighbour head: parenInnerSs (LilyPond 0.42)');
      eq(rpLeft - nR, P.parenInnerSs, 1e-6, 'neighbour head → right paren: parenInnerSs');
      ok(head.dxSs - hw / 2 >= L.nhGapSs - 1e-6 && rpRight > 0, 'the column sits RIGHT of the go line (§452 afterGo; its leftmost ink measured for every trill below)');
      const nSp = { step: 'CDEFGAB'[('CDEFGAB'.indexOf(ev.pitch.spelled.step) + 1) % 7] };
      eq(nHead.ySs - head.ySs, 0.5, 1e-9, 'the neighbour head a step above the main (' + ev.pitch.spelled.step + ' → ' + nSp.step + ')');
      eq(lp.ySs, nHead.ySs, 1e-9, 'the parens centred on the neighbour head');
      eq(sfz.dxSs, head.dxSs, 1e-9, 'sfz centred on the head column');
      eq(tr.dxSs, head.dxSs, 1e-9, 'tr centred on the head column');
      const inkBot = Math.min(head.ySs - glyphs.notehead.open.hSs / 2, lp.ySs - glyphs.accidental.leftParen.hSs * P.parenScale / 2, -2);
      eq(sfz.ySs + glyphs.dynamic.sfz.hSs / 2, inkBot - L.stackGapSs, 1e-6, 'sfz top ink stackGapSs below the unit\'s (or the staff\'s) bottom ink — the tuba chain');
      const inkTop = Math.max(head.ySs + glyphs.notehead.open.hSs / 2, lp.ySs + glyphs.accidental.leftParen.hSs * P.parenScale / 2, 2);
      eq(tr.ySs - glyphs.articulation.trill.hSs * DEV.techSymbolScale / 2, inkTop + L.stackGapSs, 1e-6, 'tr bottom ink stackGapSs above the staff or the unit\'s top ink');
      ok(Math.abs(tr.scale - DEV.techSymbolScale) < 1e-9 && Math.abs(lp.scale - P.parenScale) < 1e-9 && Math.abs(nHead.scale - P.headScale) < 1e-9, 'scales as data: tr ' + DEV.techSymbolScale + ' · parens ' + P.parenScale + ' · neighbour head ' + P.headScale);
    }
    const allIt = model.systems.flatMap(s => s.items.filter(i => i.ev === evId));
    ok(!allIt.some(i => i.k === 'gc'), 'no GC on the trill');
    ok(!allIt.some(i => i.k === 'brick' || i.k === 'ringbar'), 'no brick, no ring bar on the trill');
    const curve = allIt.find(i => i.k === 'envcurve'), gl = allIt.find(i => i.k === 'goline');
    ok(curve && curve.band === 'lane' && Math.abs(curve.t0 - pz.startTime) < 1e-9 && Math.abs(curve.t1 - pz.endTime) < 1e-9 && curve.samples.length === 101,
      'the curve: the trill\'s exact span, 101 samples, the whole lane');
    ok(gl && gl.topAsGc && Math.abs(gl.t - pz.startTime) < 1e-9, 'the go line at the onset, topAsGc');
    ok(!doc.events.some(e => score.objects.some(o => o.id === e.source.objectId && o.mutedBy === pz.id)), 'the note the trill ate is not on the page');

    // RENDER in the jury frame with the app's lane math: the curve fills the piano's whole lane; the go line's top is a GC's
    const W = 1920, H = 1080, lanes = C.realizations['video-jury'].lanes;
    const topPad = lanes.padTopPx / H, botPad = lanes.padBotPx / H, gap = lanes.gapPx / H;
    const weights = parts.map(p => ens.parts.find(q => q.part === p).weight || 1);
    const unit = ((1 - topPad - botPad - gap * (parts.length - 1)) / weights.reduce((a, b) => a + b, 0)) * H;
    let systems = Coords.systemsForParts(parts, { topPad, botPad, gap, weights });
    const ssPer = unit / (C.staff.staffHeightPx / 4);
    systems.forEach((s, i) => { s.ssPerSystem = ssPer * weights[i]; });
    systems = Coords.withStaves(systems, p => { const e = ens.parts.find(q => q.part === p); return (e.staves && e.staves.length) || 1; });
    const view = Coords.makeView({ widthPx: W, heightPx: H, window: [w0, w1], gutterPx: C.prefatory.gutterPx, systems, ssPerSystem: ssPer });
    const svg = Render.renderSection(model, view, glyphs, { engraving: C.engraving.render, ensemble: ens });
    ok(!/NaN|Infinity/.test(svg), 'render: no NaN or Infinity');
    const a = view.system('2:0'), b = view.system('2:1');
    const col = C.engraving.render.envCurve.color;
    const paths = [...svg.matchAll(new RegExp('<path d="([^"]+)" fill="' + col + '"', 'g'))].map(m => m[1]);
    const xOn = view.xOfSeconds(pz.startTime);
    const ours = paths.find(d => { const m = d.match(/^M([\d.]+),/); return m && Math.abs(+m[1] - xOn) < 1; });
    ok(!!ours, 'render: the trill\'s curve path starts at its go line (x ' + xOn.toFixed(1) + ')');
    if (ours) {
      const ys = [...ours.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map(m => +m[2]);
      eq(Math.max(...ys), b.yBotPx, 0.11, 'render: the curve\'s floor is the piano lane\'s bottom (the lower staff system)');
      if (ev.level.samples.some(v => v >= 0.999)) eq(Math.min(...ys), a.yTopPx, 0.11, 'render: a full-level sample reaches the piano lane\'s top (the upper staff system)');
    }
    const lines = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="[\d.]+" y2="([\d.]+)" stroke="#333"/g)].map(m => ({ x: +m[1], y1: +m[2], y2: +m[3] }));
    // the piano's own go line — another part may strike at the same onset (the bass clarinet does at the first trill)
    const trLine = lines.find(l => Math.abs(l.x - xOn) < 0.01 && l.y2 > a.yTopPx && l.y1 < b.yBotPx);
    ok(!!trLine, 'render: the trill\'s go line is drawn');
    if (trLine) {
      const GC = require('../notation/lib/gc.js');
      const Gg = GC.laneGeom(GC.systemOf(view, 2), view, C.engraving.render.gc.look);
      eq(trLine.y1, Math.max(a.yTopPx, Gg.impactY - Gg.h), 0.11, 'render: the go line starts at the GC arc\'s top, like the strikes\'');
    }
  }
}

// ---- 2f.6 the rest — every trill in the live save, over the whole piece, the full device, no warning ----
{
  const Extract = require('../notation/lib/extract_core.js');
  const Layout = require('../notation/lib/layout.js');
  const score = J('scores/piece-septet.json');
  const ens = J('notation/registry/ensemble.json'), tech = J('notation/registry/techniques.json'), C = J('notation/registry/container.json');
  const parts = ens.parts.map(p => p.part);
  const ends = score.objects.filter(o => o.type === 'waveCurve' && o.sonifyNote != null && o.endSeconds != null).map(o => o.endSeconds);
  const w1 = Math.ceil(Math.max(...ends));   // notate_section --all
  const { doc } = Extract.extract(score, { scoreName: 'piece-septet', window: [0, w1], parts, id: 'trill-all', registry: J('notation/registry/classes.json'),
    sampleLengths: J('bank/sample_lengths.json'), profile: 'trance', options: { chords: true, trills: true }, metaLayer: ens.metaLayer, techniques: tech.techniques });
  for (const c of doc.chunks) c.strategy = 'unresolved';
  const model = Layout.layoutSection(doc, glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, C.engraving.layout));
  const trills = doc.events.filter(e => e.env === 'trill');
  const zonesAll = score.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill' && o.trill && parts.includes(o.layer) && o.startTime < w1);
  ok(trills.length === zonesAll.length, 'the whole piece: every trill in the save is on the page (' + trills.length + ')');
  const need = ['notehead-open', 'accidental-leftParen', 'accidental-rightParen', 'artic-trill', 'dyn-sfz'];
  const bad = [];
  for (const e of trills) {
    const its = model.systems.flatMap(s => s.items.filter(i => Math.abs((i.t != null ? i.t : i.t0) - e.onset) < 1e-9));
    const miss = need.filter(k => !its.some(i => i.k === 'glyph' && i.g === k));
    if (!its.some(i => i.k === 'envcurve' && i.ev === e.id)) miss.push('curve');
    if (!its.some(i => i.k === 'goline' && i.ev === e.id)) miss.push('goline');
    if (its.some(i => i.k === 'gc' && i.ev === e.id)) miss.push('HAS A GC');
    if (miss.length) bad.push(e.id + ' ' + miss.join(','));
  }
  ok(!bad.length, 'the whole piece: every trill draws head · ( neighbour ) · tr · sfz · curve · go line, and no GC' + (bad.length ? ' — ' + bad.slice(0, 5).join(' | ') : ''));
  const warn = (model.warnings || []).filter(w => /trill|ev-zn-/.test(w));
  ok(!warn.length, 'the whole piece: no layout warning names a trill' + (warn.length ? ' — ' + warn.slice(0, 3).join(' | ') : ''));
}

// ---- §445 → §452 the column RIGHT of the go line, EVERY trill (registry devices.byEnv.trill.nhAnchor 'afterGo') ----
{
  const Layout = require('../notation/lib/layout.js');
  const ens = J('notation/registry/ensemble.json'), tech = J('notation/registry/techniques.json'), C = J('notation/registry/container.json');
  const L = C.engraving.layout, O = glyphs.standards.ottava, LF = glyphs.standards.ledgerLine.lengthFraction;
  const parts = ens.parts.map(p => p.part);
  ok(L.devices.byEnv.trill.nhAnchor === 'afterGo', 'registry: byEnv.trill.nhAnchor afterGo — the rule for every trill, no build flag');
  // the MAIN file (D41), laid out as the page lays it out
  const ir = J('notation/ir/piece-septet.ir.json');
  ok(!/--trillsRight/.test(ir.provenance.build) && !ir.overlays.some(o => /^ov-trillright-/.test(o.id)), 'the MAIN file carries no per-span --trillsRight overlay — the registry holds the rule');
  const model = Layout.layoutSection(JSON.parse(JSON.stringify(ir)), glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, L));
  const trills = ir.events.filter(e => e.env === 'trill').sort((a, b) => a.onset - b.onset);
  const G = n => n === 'notehead-open' ? glyphs.notehead.open : n === 'notehead' ? glyphs.notehead.filled : n.startsWith('accidental-') ? glyphs.accidental[n.slice(11)]
    : n.startsWith('artic-') ? glyphs.articulation[n.slice(6)] : n.startsWith('dyn-') ? glyphs.dynamic[n.slice(4)] : null;
  const ext = i => {
    if (i.k === 'ledger') { const w = i.wSs * (1 + 2 * LF); return [i.dxSs - w / 2, i.dxSs + w / 2]; }
    if (i.k === 'ottava') { const lg = glyphs.ottavaText[i.label], lgW = lg ? lg.wSs + (O.textGapBeforeLineSs || 0.1) : 0;
      let x0 = i.dx0Ss; if (i.dx1Ss - (x0 + lgW) < (O.minBracketSpanSs || 1.37)) x0 = i.dx1Ss - (O.minBracketSpanSs || 1.37) - lgW; return [x0, i.dx1Ss]; }
    if (i.k !== 'glyph') return null; const g = G(i.g); if (!g) return null; const k = i.scale || 1;
    if (i.align === 'noteY' && g.anchors && g.anchors.noteY) { const x = i.dxSs - g.anchors.noteY.x * k; return [x, x + g.wSs * k]; }
    return [i.dxSs - g.wSs * k / 2, i.dxSs + g.wSs * k / 2];
  };
  let badR = [], badO = [], kinds = new Set(), n = 0;
  for (const e of trills) {
    const sys = model.systems.find(s => s.items.some(i => i.k === 'envcurve' && i.ev === e.id));
    const part = String(sys.key != null ? sys.key : sys.part).split(':')[0];
    // the piano's column spans both of its staff systems (the tr above the upper, the head on the lower)
    const its = model.systems.filter(s => String(s.key != null ? s.key : s.part).split(':')[0] === part)
      .flatMap(s => s.items.filter(i => Math.abs((i.t != null ? i.t : i.t0) - e.onset) < 1e-9 && (i.ev === e.id || ['glyph', 'ledger', 'ottava'].includes(i.k))));
    const xs = its.map(i => [i, ext(i)]).filter(p => p[1]);
    if (!xs.length) { badR.push(e.source.objectId + ' no ink'); continue; }
    n++;
    const who = xs.reduce((a, p) => (p[1][0] < a[1][0] ? p : a));
    if (Math.abs(who[1][0] - L.nhGapSs) > 1e-6) badR.push(e.source.objectId + '@' + e.onset.toFixed(2) + ' left ' + who[1][0].toFixed(3));
    kinds.add(who[0].k === 'glyph' ? who[0].g : who[0].k);
    const ott = its.find(i => i.k === 'ottava'), rp = its.find(i => i.g === 'accidental-rightParen');
    if (ott && rp && ott.dx1Ss < ext(rp)[1] - 1e-9) badO.push(e.source.objectId);
  }
  ok(n === trills.length && !badR.length, 'afterGo, the whole piece: every trill column (' + n + ' of ' + trills.length + ') starts nhGapSs (' + L.nhGapSs + ') right of its go line, from its leftmost ink' + (badR.length ? ' — ' + badR.slice(0, 5).join(', ') : ''));
  ok(kinds.size >= 3, 'afterGo: the leftmost element differs from column to column (' + [...kinds].join(', ') + ') — the rule measures, it does not assume the head');
  ok(!badO.length, 'an ottava on a trill runs over the neighbour group (its hook past the right paren)' + (badO.length ? ' — ' + badO.join(', ') : ''));
}

// ---- D42 the curve look (the two-piano piece's): one closed path, fill 0.3, a 2 px stroke round the shape, opacity 0.3 ----
{
  const Render = require('../notation/lib/render.js');
  const Coords = require('../notation/lib/coords.js');
  const C = J('notation/registry/container.json');
  const R = C.engraving.render;
  const std = k => R[k] && R[k].fillOpacity === 0.3 && R[k].strokeWPx === 2 && R[k].strokeOpacity === 1 && R[k].pathOpacity === 0.3;
  ok(std('envCurve') && R.envCurve.color === '#99FF00', 'registry envCurve = D42: limeGreen #99FF00 · fill 0.3 · 2 px stroke · path opacity 0.3');
  ok(std('crescCurve') && R.crescCurve.color === '#99FF00', 'registry crescCurve (the morph crescendo) = D42 limeGreen');
  ok(std('glissCurve') && R.glissCurve.color === '#F04B00', 'registry glissCurve (the morph glissando) = D42 brightOrange #F04B00');
  // a synthetic model: one curve item on one system
  const sysList = Coords.systemsForParts([0], { topPad: 0.01, botPad: 0.01, gap: 0 });
  const view = Coords.makeView({ widthPx: 1920, heightPx: 1080, window: [0, 10], systems: sysList, ssPerSystem: 30 });
  const model = { window: [0, 10], systems: [{ part: 0, clef: 'bass', items: [
    { k: 'envcurve', t0: 1, t1: 4, samples: [0, 0.5, 1], ev: 'e1', cut: false },
    
  ] }] };
  const withReg = Render.renderSection(model, view, glyphs, { engraving: R });
  const env = (withReg.match(/<path d="M[^"]*Z" fill="#99FF00"[^>]*>/) || [''])[0];
  ok(/fill-opacity="0.3"/.test(env) && /stroke="#99FF00"/.test(env) && /stroke-width="2"/.test(env) && /opacity="0.3"\/>$/.test(env) && / Z"/.test(env),
    'render with the registry: the curve is ONE closed path — fill, fill-opacity 0.3, stroke #99FF00 2 px, opacity 0.3 on the path');
  const legacy = Render.renderSection(model, view, glyphs, {});
  ok(/fill="#2E7D32" fill-opacity="0.3" stroke="none"/.test(legacy) && !/opacity="0.3"\/>/.test(legacy.replace(/fill-opacity="0.3"/g, '')),
    'render WITHOUT the registry (the tuba batteries\' code defaults): the old fill-only look, unchanged');
}

// ---- D42 the meters (§448): piece #2's curve follower — 8 px, right edge 3 px left of the cursor, fill 0.3 FIRST, outline 1.5 @ 0.8 over it ----
{
  const A = require('../notation/lib/animobj.js');
  const C = J('notation/registry/container.json');
  const view = { widthPx: 1920, heightPx: 1080, window: [0, 10], xOfSeconds: t => 100 * t, systems: [{ yTopPx: 100, yBotPx: 300, ssPx: 7.9 }], system() { return this.systems[0]; } };
  for (const [kind, color] of [['curveMeter', '#99FF00'], ['crescMeter', '#99FF00'], ['glissMeter', '#F04B00']]) {
    const st = C.animated[kind];
    ok(st && st.wPx === 8 && st.gapPx === 3 && st.fillOpacity === 0.3 && st.outlineWPx === 1.5 && st.outlineOpacity === 0.8 && st.color === color,
      'registry ' + kind + ' = #2\'s follower: 8 px · gap 3 · fill 0.3 · outline 1.5 @ 0.8 · ' + color);
    const svg = String(A.frameSvg([{ kind, part: 0, t0: 0, t1: 10, samples: [0.5, 0.5], full: true }], view, 5, C.animated, { cursor: false }));
    const rects = [...svg.matchAll(/<rect [^>]*>/g)].map(m => m[0]);
    const fillR = rects.findIndex(r => !/fill="none"/.test(r)), lineR = rects.findIndex(r => /fill="none"/.test(r));
    const xOf = r => +(r.match(/x="([\d.]+)"/) || [])[1];
    ok(rects.length === 2 && fillR === 0 && lineR === 1 && /opacity="0.3"/.test(rects[0]) && /stroke-width="1.5" opacity="0.8"/.test(rects[1])
      && Math.abs(xOf(rects[0]) + 8 - (500 - 3)) < 1e-9, kind + ' draws the fill FIRST (0.3), the outline over it (1.5 @ 0.8), right edge 3 px left of the cursor');
  }
}

// ---- 2f.7 the curve shape (§450–§451): 100 samples per second · the drawn floor at 1 of 10 — drawing only ----
{
  const Extract = require(arg('--extract') ? path.resolve(arg('--extract')) : '../notation/lib/extract_core.js');
  const SonifyCore = require('../score/public/sonify_core.js');
  const Layout = require('../notation/lib/layout.js');
  const Render = require('../notation/lib/render.js');
  const Coords = require('../notation/lib/coords.js');
  const A = require('../notation/lib/animobj.js');
  const C = J('notation/registry/container.json');
  const score = J('scores/piece-septet.json');
  const base = { scoreName: 'piece-septet', window: [0, 176], parts: [0, 1, 2, 3, 4, 5, 6], id: 'trill-rate', profile: 'trance', metaLayer: 7,
    registry: J('notation/registry/classes.json'), sampleLengths: J('bank/sample_lengths.json'), techniques: J('notation/registry/techniques.json').techniques };
  const at101 = Extract.extract(score, Object.assign({}, base, { options: { chords: true, trills: true } })).doc.events.filter(e => e.env === 'trill');
  const at100 = Extract.extract(score, Object.assign({}, base, { options: { chords: true, trills: true, trillRate: 100 } })).doc.events.filter(e => e.env === 'trill');
  const want = e => Math.max(101, Math.ceil(e.duration * 100) + 1);
  ok(at100.length === at101.length && at100.length > 0, 'trillRate 100: the same trills as without it (' + at100.length + ')');
  const badN = at100.filter(e => e.level.samples.length !== want(e) || e.level.samples.some(v => !(v >= 0 && v <= 1)));
  ok(!badN.length, 'trillRate 100: every trill carries max(101, ceil(duration × 100) + 1) samples, all in 0–1' + (badN.length ? ' — ' + badN.slice(0, 4).map(e => e.id + ' ' + e.level.samples.length).join(', ') : ''));
  const long = at100.reduce((m, e) => (e.duration > m.duration ? e : m), at100[0]);
  ok(long.level.samples.length >= 1731 && long.duration / (long.level.samples.length - 1) <= 0.01 + 1e-12,
    'trillRate 100: the longest trill (' + long.duration.toFixed(2) + ' s) is sampled at most 10 ms apart (' + long.level.samples.length + ')');
  ok(at101.every(e => e.level.samples.length === 101), 'no trillRate: still the fixed 101 (every other build unchanged)');
  // the same math, only denser: the ends agree, and every sample matches its window read independently (no smooth nodes)
  ok(at100.every((e, k) => Math.abs(e.level.samples[0] - at101[k].level.samples[0]) < 1e-9
    && Math.abs(e.level.samples[e.level.samples.length - 1] - at101[k].level.samples[100]) < 1e-9),
    'trillRate 100: each trill starts and ends on the same level as the 101-sample reading');
  {
    let worst = 0;
    const win = { A: 8, B: 9, C: 10 };
    for (const e of at100) {
      const z = score.objects.find(o => o.id === e.source.objectId);
      const L = z.trill.curveRef === 'auto' ? 8 : win[z.trill.curveRef];
      if (L == null) continue;
      const cs = score.objects.filter(o => o.type === 'waveCurve' && o.layer === L && !o.groupId && o.sonifyNote == null && o.endSeconds > z.startTime && o.startSeconds < z.endTime);
      if (!cs.length || cs.some(c => c.nodes.some(n => n.smooth > 0))) continue;
      const n = e.level.samples.length;
      for (let i = 0; i < n; i += 7) {
        const sec = z.startTime + (z.endTime - z.startTime) * i / (n - 1);
        const c = cs.find(o => sec >= o.startSeconds && sec <= o.endSeconds);
        if (!c) continue;
        const v = Math.max(0, Math.min(1, SonifyCore.evalWaveCurve(c, (sec - c.startSeconds) / (c.endSeconds - c.startSeconds))));
        worst = Math.max(worst, Math.abs(v - e.level.samples[i]));
      }
    }
    ok(worst < 2e-3, 'trillRate 100: the dense samples match the windows read independently, nothing invented (worst ' + worst.toFixed(5) + ')');
  }

  // THE FLOOR: the registry, the transform, and its order after curveZero / cut
  const DEV = C.engraving.layout.devices.byEnv;
  ok(DEV.trill.curveFloor === 0.1 && DEV.surge.curveFloor == null, 'registry: byEnv.trill.curveFloor 0.1 (1 on the 0–10 scale); the surge has none');
  const lv = smp => ({ level: { samples: smp } });
  ok(JSON.stringify(Layout.drawnLevelSamples(lv([0, 0.5, 1]), { curveFloor: 0.1 })) === '[0.1,0.55,1]',
    'drawnLevelSamples curveFloor 0.1: 0 → 0.1, 0.5 → 0.55, 1 → 1 (the top stays at the top)');
  ok(JSON.stringify(Layout.drawnLevelSamples(lv([0, 0.5, 1]), {})) === '[0,0.5,1]' && JSON.stringify(Layout.drawnLevelSamples(lv([0, 0.5, 1]), { curveFloor: 0 })) === '[0,0.5,1]',
    'drawnLevelSamples without a floor: the samples unchanged (the surges, the tuba batteries)');
  ok(JSON.stringify(Layout.drawnLevelSamples(lv([0.2, 0.6, 1, 0.9]), { curveZero: true, cut: true, curveFloor: 0.1 })) === '[0.1,0.55,1]',
    'the floor comes LAST: curveZero (0.2 → 0), cut (at the peak), then 0 → 0.1');
  ok(at100.some(e => Math.min(...e.level.samples) < 0.01), 'the IR keeps the true level (a trill still dips below 0.01 in the data): the floor is the page\'s, not the sound\'s');

  // the section through layout: every trill's drawn curve sits at or above the floor
  const ens = J('notation/registry/ensemble.json'), tech = J('notation/registry/techniques.json');
  const parts = ens.parts.map(q => q.part);
  const { doc } = Extract.extract(score, Object.assign({}, base, { parts, options: { chords: true, trills: true, trillRate: 100 }, metaLayer: ens.metaLayer, techniques: tech.techniques }));
  for (const c of doc.chunks) c.strategy = 'unresolved';
  const model = Layout.layoutSection(doc, glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, C.engraving.layout));
  const curves = model.systems.flatMap(sy => sy.items.filter(i => i.k === 'envcurve'));
  const trEvs = doc.events.filter(e => e.env === 'trill');
  ok(curves.length === trEvs.length && curves.every(i => Math.min(...i.samples) >= 0.1 - 1e-9 && Math.max(...i.samples) <= 1 + 1e-9),
    'layout, 0–176 s: every trill curve (' + curves.length + ' of ' + trEvs.length + ') is drawn between 0.1 and 1, none blanks out');
  const dipEv = doc.events.find(e => e.id === 'ev-zn-1136');
  const dip = curves.find(i => i.ev === 'ev-zn-1136');
  ok(!!(dip && dipEv) && Math.abs(dip.samples[0] - (0.1 + 0.9 * dipEv.level.samples[0])) < 1e-4 && dip.samples[0] > 0.1,
    'layout: the 132.13 s trill (level ' + (dipEv ? dipEv.level.samples[0] : '?') + ' at its go line) is drawn from ' + (dip ? dip.samples[0] : '?') + ', no white space');

  // render: a level-0 stretch draws a tenth of the lane above the baseline
  const sysList = Coords.systemsForParts([0], { topPad: 0.01, botPad: 0.01, gap: 0 });
  const view = Coords.makeView({ widthPx: 1920, heightPx: 1080, window: [0, 10], systems: sysList, ssPerSystem: 30 });
  const smp = Layout.drawnLevelSamples(lv([0, 0, 1]), { curveFloor: 0.1 });
  const svg = Render.renderSection({ window: [0, 10], systems: [{ part: 0, clef: 'bass', items: [{ k: 'envcurve', t0: 1, t1: 4, samples: smp, ev: 'e1', cut: false }] }] },
    view, glyphs, { engraving: C.engraving.render });
  const d = (svg.match(/<path d="(M[^"]*Z)" fill="#99FF00"/) || [])[1] || '';
  const ys = [...d.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map(m => +m[2]);
  const sy = view.system(0) || view.systems[0];
  ok(ys.length >= 4 && Math.abs(ys[0] - (sy.yBotPx - 0.1 * (sy.yBotPx - sy.yTopPx))) < 0.11 && Math.abs(Math.max(...ys) - sy.yBotPx) < 0.11,
    'render: a level-0 start draws 10 % of the lane above its baseline; the fill still closes on the baseline');

  // the meter rides the same floor
  const mview = { widthPx: 1920, heightPx: 1080, window: [0, 10], xOfSeconds: t => 100 * t, systems: [{ yTopPx: 100, yBotPx: 300, ssPx: 7.9 }], system() { return this.systems[0]; } };
  const msvg = String(A.frameSvg([{ kind: 'curveMeter', part: 0, t0: 0, t1: 10, samples: Layout.drawnLevelSamples(lv([0, 0]), { curveFloor: 0.1 }), full: true }],
    mview, 5, C.animated, { cursor: false }));
  const fillR = [...msvg.matchAll(/<rect [^>]*>/g)].map(m => m[0]).find(r => !/fill="none"/.test(r)) || '';
  eq(+((fillR.match(/height="([\d.]+)"/) || [])[1]), 20, 0.6, 'the meter at level 0 with the floor fills a tenth of its 200 px tube');
  ok(/drawnOf: e => NotationLayout\.drawnLevelSamples\(e/.test(fs.readFileSync(path.join(ROOT, 'notation/app/notation.html'), 'utf8')),
    'the page injects drawnLevelSamples as the meters\' drawnOf (one source for page and meter)');

  // the MAIN file (D41) is built with the rate
  const main = J('notation/ir/piece-septet.ir.json');
  const mt = main.events.filter(e => e.env === 'trill');
  ok(/--trillRate 100\b/.test(main.provenance.build) && mt.length > 0 && mt.every(e => e.level.samples.length === want(e)),
    'the MAIN file: its recorded build carries --trillRate 100, and all ' + mt.length + ' trills are sampled at 100/s');
}

console.log(pass + ' passed, ' + fail + ' failed');
console.log(fail ? 'TRILLS RED: ' + fail + ' failure(s)' : 'TRILLS GREEN: 2f.2 glyphs · 2f.3 IR · 2f.4 device · 2f.6 the whole piece · §452 every trill right of the go line · D42 the curve look and the meters · 2f.7 100/s and the floor at 1');
process.exit(fail ? 1 : 0);
