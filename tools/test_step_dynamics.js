#!/usr/bin/env node
// test_step_dynamics.js — PLAN 2i.3, the save edits for section 3: foldFlute over section 3 (D38, §507) and stepDynamics (CN-83).
//   node tools/test_step_dynamics.js          (A) both commands run on an in-memory copy of scores/piece-septet.json, checked
//   node tools/test_step_dynamics.js --save   (A) + (B) the SAVE itself is checked as stepped and folded — run after his Save
// The commands are the real ones (score/public/note_card.js) against a stub Composer; the dynamic scale is the real Cresc (cresc.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const Cresc = require(path.join(ROOT, 'score', 'public', 'cresc.js'));
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };

const FROM = 444, TO = 624, W = 30;
const DYNS = ['p', 'mp', 'mf', 'f', 'ff', 'fff'];
const VEL = { p: 37, mp: 55, mf: 72, f: 90, ff: 109, fff: 127 };   // Cresc.dynHeight × 127 / 10, rounded
const bandOf = t => DYNS[Math.max(0, Math.min(5, Math.floor((t - FROM + 1e-6) / W)))];
const isS3Strike = x => x.type === 'waveCurve' && x.srcKind === 'strike' && x.startSeconds >= FROM - 1e-6 && x.startSeconds <= TO + 1e-6;
// 101 rams since his moves of 2026-09-14 in two rounds (three out, five in — the five folded into C3–D4; RUNNING_LOG §523–§524)
const isFlRam = x => x.type === 'waveCurve' && x.layer === 0 && x.technique === 'pizzicato' && x.startSeconds >= 430;

function load() { return JSON.parse(fs.readFileSync(path.join(ROOT, 'scores', 'piece-septet.json'), 'utf8')); }

// ---- (A) the commands on a copy ----
{
  const score = load();
  let undo = 0, dirty = 0;
  const Composer = { objects: score.objects, pushUndoState() { undo++; }, renderWaveCurve() {}, markDirty() { dirty++; } };
  const TRACKS = score.tracks.map((t, i) => ({ short: t.short || String(i), id: t.id || String(i), label: t.label || t.name || String(i) }));
  const ctx = { Composer, Cresc, TRACKS, console: { log() {}, warn() {} } };
  ctx.window = ctx;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'score', 'public', 'note_card.js'), 'utf8'), ctx);

  ok(DYNS.every(d => Math.round(Cresc.dynHeight(d) / 10 * 127) === VEL[d]), 'the velocity table = the score\'s own scale (Cresc.dynHeight)');
  const others = JSON.stringify(score.objects.filter(x => !isS3Strike(x) && !isFlRam(x)));
  const s1 = JSON.stringify(score.objects.filter(x => x.srcKind === 'strike' && x.startSeconds < 176));

  const alreadyFolded = score.objects.filter(isFlRam).every(x => x.sonifyNote >= 48 && x.sonifyNote <= 62);
  const f = ctx.foldFlute({ from: 430, to: 700, lo: 48, hi: 62, part: 'Fl', technique: 'pizzicato' });
  ok(f && f.of === 101 && f.stuck === 0, 'foldFlute over section 3: 101 flute rams, none stuck (got ' + (f && f.of) + ', stuck ' + (f && f.stuck) + ')');
  ok(f && f.moved === (alreadyFolded ? 0 : 79), 'foldFlute moves ' + (alreadyFolded ? '0 (the save is already folded)' : '79 (§507)') + ' — got ' + (f && f.moved));
  ok(score.objects.filter(isFlRam).every(x => x.sonifyNote >= 48 && x.sonifyNote <= 62), 'every section-3 ram now sounds inside C3–D4 (48..62)');

  const u0 = undo;
  const r = ctx.stepDynamics();
  ok(r && r.of === 932, 'stepDynamics: 932 strikes in 444–624 s (got ' + (r && r.of) + ')');
  ok(undo === u0 + 1, 'stepDynamics is ONE undo step');
  ok(r && r.bands.map(b => b.n).join() === '64,139,121,60,190,358', 'per band p·mp·mf·f·ff·fff: 64 · 139 · 121 · 60 · 190 · 358 (got ' + (r && r.bands.map(b => b.n).join()) + ')');
  ok(r && r.bands.map(b => b.vel).join() === DYNS.map(d => VEL[d]).join(), 'band velocities 37 · 55 · 72 · 90 · 109 · 127');
  const S3 = score.objects.filter(isS3Strike);
  ok(S3.every(x => x.recVel === VEL[bandOf(x.startSeconds)] && x.nodes.every(n => n.y === Cresc.dynHeight(bandOf(x.startSeconds)))), 'every strike\'s velocity and curve height = its band');
  ok(S3.filter(x => x.startSeconds === 624).every(x => x.recVel === 127) && S3.filter(x => x.startSeconds === 444).every(x => x.recVel === 37), 'the edges: 444 → p · 624 → fff');
  ok(JSON.stringify(score.objects.filter(x => !isS3Strike(x) && !isFlRam(x))) === others, 'nothing else touched — the crescendo run, sections 1 and 2, the group boxes');
  ok(JSON.stringify(score.objects.filter(x => x.srcKind === 'strike' && x.startSeconds < 176)) === s1, 'section 1\'s strikes unchanged (fff on every one)');
  const again = ctx.stepDynamics();
  ok(again && again.changed === 0, 'a second run changes nothing');
}

// ---- (B) the save itself, after his Save ----
if (process.argv.includes('--save')) {
  const score = load();
  const S3 = score.objects.filter(isS3Strike);
  const off = S3.filter(x => x.recVel !== VEL[bandOf(x.startSeconds)]);
  ok(S3.length === 932 && !off.length, 'THE SAVE: 932 section-3 strikes at their band velocity (' + off.length + ' off' + (off.length ? ', e.g. ' + off.slice(0, 3).map(x => x.id + '@' + x.startSeconds + ' vel ' + x.recVel).join(' · ') : '') + ')');
  const rams = score.objects.filter(isFlRam), out = rams.filter(x => x.sonifyNote < 48 || x.sonifyNote > 62);
  ok(rams.length === 101 && !out.length, 'THE SAVE: 101 section-3 rams inside C3–D4 (' + out.length + ' outside)');
}

console.log((fail ? 'FAIL' : 'PASS') + ' — ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
