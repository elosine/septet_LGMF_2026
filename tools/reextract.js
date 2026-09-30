#!/usr/bin/env node
// THE RE-EXTRACTION RUNNER (session 18, 2026-09-30 — RUNNING_LOG §589 … §604; kept as a scratchpad script until checkpoint #7 made it a tool):
// piece-lgmf's whole build lives in its provenance.build (2j's discipline — the composer save is the ground truth, the IR derived from a
// COPY). This runner re-runs that command with the args you add, so a figure's hands are APPENDED to the record and nothing is retyped
// (the 8 KB Bash limit — a long command line dies with a fake quote error):
//   node tools/reextract.js "<a phrase appended to --notes, or ''>" [args appended to the build …]
//     --hand 'wc-3444:{"grace":true}'        a hand (quote the JSON for the shell; later hands MERGE onto earlier ones for the same id;
//                                             a key set to null unsets it)
//     --beam 317.164-317.339@0               a beam span · --plainNotes 0:316.8:323.14 · --beatGridFit 0:0.0945:7:317.048:317.052:323.002[:keepLead]
//     @replace:OLD=>NEW                      swap ONE existing arg of the build (e.g. a frame's hand for one with :keepLead, or a beam span)
//   @drop:ARG                              drop ONE existing arg of the build, and the --flag before it if there is one (§611: the hand
//                                           and the --plainNotes window on the bassoon's one-off came out when byEnv.oneOff replaced them)
// It reads notation/ir/piece-lgmf.ir.json, tokenizes provenance.build (double quotes with \" escapes), re-points --scoreFile at a FRESH
// copy of scores/piece-Recombination-Draft01-done.json in the scratchpad (so his latest save is what is read), applies the replacements,
// appends the rest, and spawns tools/notate_section.js. After it: node tools/gen_engraving_rules.js → check_rules → eh_figure_check →
// layout_shield --diff (the baseline written on HEAD first).
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ROOT = path.join(__dirname, '..');
const IR = process.env.IR || 'piece-lgmf', SCORE = process.env.SCORE || 'piece-Recombination-Draft01-done';
const BS = String.fromCharCode(92), DQ = String.fromCharCode(34);
const ir = JSON.parse(fs.readFileSync(path.join(ROOT, 'notation', 'ir', IR + '.ir.json'), 'utf8'));
const cmd = ir.provenance.build;
const args = []; let cur = '', inQ = false, has = false;
for (let i = 0; i < cmd.length; i++) { const c = cmd[i];
  if (inQ) { if (c === BS && i + 1 < cmd.length && (cmd[i + 1] === DQ || cmd[i + 1] === BS)) { cur += cmd[i + 1]; i++; } else if (c === DQ) inQ = false; else cur += c; }
  else { if (c === DQ) { inQ = true; has = true; } else if (/\s/.test(c)) { if (cur || has) { args.push(cur); cur = ''; has = false; } } else cur += c; } }
if (cur || has) args.push(cur);
if (args[0] !== 'node' || !/notate_section/.test(args[1])) throw new Error('unexpected build head: ' + args.slice(0, 2).join(' '));
const a = args.slice(2);
const k = a.indexOf('--scoreFile'); if (k < 0) throw new Error('no --scoreFile in the build');
const scratch = process.env.SCRATCH || fs.mkdtempSync(path.join(os.tmpdir(), 'lgmf-reextract-'));
const copy = path.join(scratch, SCORE + '-copy.json'); fs.copyFileSync(path.join(ROOT, 'scores', SCORE + '.json'), copy); a[k + 1] = copy;
const EXTRA = process.argv.slice(3);
for (let i = EXTRA.length - 1; i >= 0; i--) if (EXTRA[i].startsWith('@replace:')) { const [o, nw] = EXTRA[i].slice(9).split('=>'); const j = a.indexOf(o); if (j < 0) throw new Error('replace: not in the build: ' + o); a[j] = nw; EXTRA.splice(i, 1); }
for (let i = EXTRA.length - 1; i >= 0; i--) if (EXTRA[i].startsWith('@drop:')) { const o = EXTRA[i].slice(6); const j = a.indexOf(o); if (j < 0) throw new Error('drop: not in the build: ' + o); const two = j > 0 && a[j - 1].startsWith('--') ? 2 : 1; a.splice(j - two + 1, two); EXTRA.splice(i, 1); }
a.push(...EXTRA);
const n = a.indexOf('--notes'); if (n >= 0 && process.argv[2]) a[n + 1] = a[n + 1] + process.argv[2];
const hands = a.filter(x => x.startsWith('wc-') && x.includes(':{'));
console.log('reextract ' + IR + ': ' + a.length + ' args · ' + hands.length + ' hands · beatGridFit × ' + a.filter(x => x === '--beatGridFit').length + ' · the copy ' + copy);
const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'notate_section.js'), ...a], { stdio: 'inherit' });
process.exit(r.status);
