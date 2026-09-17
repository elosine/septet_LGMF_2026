#!/usr/bin/env node
// render_reaper.js — the Reaper render of the composer's own playback, through the bridge, never touching the rack (RUNNING_LOG §453).
//
//   node tools/render_reaper.js [--score piece-septet] [--peak -1] [--tail 6] [--skip-render] [--resume]
//   --resume: the render tab is already open and set up (e.g. a job outlived its timeout) — check it, then render, close, measure
//
// Needs: node tools/export_midi.js first (midi/<score>/NN <track>.mid) · Reaper open with the bridge alive (reaper/bridge/README.md).
//
// 1. reaper/septet_rack.rpp → reaper/<score>_render.rpp (a copy; the rack itself is never opened for writing — and refused if it has
//    unsaved changes, because the copy would miss them).
// 2. A NEW project tab opens the copy. In it: tempo 60 BPM (the files are 60 BPM / 960 PPQ), each part's MIDI file on the track of
//    the SAME NAME at 0:00 (the n-th file of a name on the n-th track of that name — piece #4's trap was a positional drop), the render
//    settings — master mix · WAV 32-BIT FLOAT · 48 kHz · stereo · 0 → the last note-off + tail · no normalize, no dither, not added to
//    the project — then saved, then rendered (action 42230, the dialog auto-closes). The REC folder is NOT muted: in this rack it is the
//    folder every part sums through (piece #4's REC was a second send and had to be).
// 3. The tab closes; the rack tab is current again.
// 4. PIECE #4'S CLIP LESSON, built in: the render is FLOAT, so a peak above 0 dBFS is measured, not clipped. ffmpeg reads the true
//    peak (ebur128), the loudness range and the first attack; then ONE plain gain (no limiter — the range is the piece) brings the true
//    peak to --peak dBTP (default −1) if it is above it, never up, and writes notation/audio/<score>.wav as 24-bit PCM — the name the
//    notation page's ♪ render chip looks for (IR source.score). The float stays in notation/audio/raw/ (gitignored) as the evidence.
//
// [PLAN 2h.7 — 2026-09-17, the Bloom practice videos] A DEMO RENDER: some parts, or a generated file, to its own name. Every flag is
// optional and the default call is unchanged.
//   --dir midi/<folder>     the per-track files to place (default midi/<score>)
//   --only "Va XS,Vn1 XS"   place only the tracks of these names (every file of each name); the rest of the rack stays empty
//   --out <name>            reaper/<name>_render.rpp · raw/<name>-float.wav · notation/audio/<name>.wav (default <score>)
//   --end S                 the render's end (default: the capture's last note-off + --tail)
//   --gainWindow a-b        the true peak is measured INSIDE a..b s and the one plain gain may go UP to --peak (a pair alone sits far
//                           under the mix); the first sound is read after a. For demo files only — the piece's render never goes up.
// A demo render may never write the piece's own WAV: --dir or --only without an --out of another name is refused.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const score = arg('score', 'piece-septet');
const PEAK = +arg('peak', -1), TAIL = +arg('tail', 6);
const MIDIDIR = arg('dir', null), ONLY = arg('only', null), NAME = arg('out', score), END_ARG = arg('end', null);
const WINDOW = arg('gainWindow', null) ? arg('gainWindow').split('-').map(Number) : null;
if ((MIDIDIR || ONLY) && NAME === score) { console.error('RENDER REFUSED: a demo render (--dir/--only) needs --out <another name> — it would overwrite notation/audio/' + score + '.wav'); process.exit(2); }
const RACK = path.join(ROOT, 'reaper', 'septet_rack.rpp');
const RPP = path.join(ROOT, 'reaper', NAME + '_render.rpp');
const RAWDIR = path.join(ROOT, 'notation', 'audio', 'raw');
const RAW = path.join(RAWDIR, NAME + '-float.wav');
const OUT = path.join(ROOT, 'notation', 'audio', NAME + '.wav');
const FF = (() => { try { return execFileSync('where', ['ffmpeg'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim(); } catch (e) { return 'ffmpeg'; } })();
const log = s => console.log(s);

const B = process.env.REAPER_BRIDGE || path.join(process.env.APPDATA, 'REAPER', 'bridge');
// reaper_job.js guards on the project name; this tool moves between the rack and the render tab, so the guard is the project that
// is open NOW, and every job that must act on one project checks the path itself
function openProjectStem() { const h = heartbeat(); return (h && h.project) ? path.basename(h.project, path.extname(h.project)) : 'septet_rack'; }
function job(lua, timeoutMs = 20000) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'reaper_job.js'), '-e', lua],
    { encoding: 'utf8', env: Object.assign({}, process.env, { REAPER_PROJECT: openProjectStem(), BRIDGE_TIMEOUT_MS: String(timeoutMs) }), timeout: timeoutMs + 10000 });
  const text = (r.stdout || '') + (r.stderr || '');
  let j = null; try { j = JSON.parse(r.stdout); } catch (e) { }
  if (!j || !j.ok) throw new Error('bridge job failed: ' + text.trim().slice(0, 800));
  return j.result;
}
const heartbeat = () => { try { const h = JSON.parse(fs.readFileSync(path.join(B, 'heartbeat.json'), 'utf8')); return Object.assign(h, { ageS: Date.now() / 1000 - h.time }); } catch (e) { return null; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const L = s => '[[' + s + ']]';
const { PLACE_LUA, writeEvt } = require('./reaper_midi_place.js');   // the one copy of how a part reaches a track

(async () => {
  const dir = MIDIDIR ? path.join(ROOT, MIDIDIR) : path.join(ROOT, 'midi', score);
  const onlyNames = ONLY ? ONLY.split(',').map(s => s.trim()).filter(Boolean) : null;
  const files = fs.readdirSync(dir).filter(f => /^\d\d .+\.mid$/.test(f)).sort()
    .filter(f => !onlyNames || onlyNames.includes(f.replace(/^\d\d /, '').replace(/\.mid$/, '')));
  if (!files.length) throw new Error('no per-track files in ' + path.relative(ROOT, dir) + (onlyNames ? ' named ' + ONLY : '') + ' — run tools/export_midi.js first');
  if (onlyNames) { const miss = onlyNames.filter(n => !files.some(f => f.replace(/^\d\d /, '').replace(/\.mid$/, '') === n)); if (miss.length) throw new Error('--only names no file: ' + miss.join(', ')); }
  const cap = JSON.parse(fs.readFileSync(path.join(ROOT, 'midi', score + '.capture.json'), 'utf8'));
  const lastOff = Math.max(...cap.events.filter(e => (e[2][0] & 0xF0) === 0x80 || ((e[2][0] & 0xF0) === 0x90 && e[2][2] === 0)).map(e => e[1]));
  const END = END_ARG != null ? +END_ARG : +(lastOff + TAIL).toFixed(3);
  const evts = files.map(f => writeEvt(path.join(dir, f)));

  if (!process.argv.includes('--skip-render')) {
    const hb = heartbeat();
    if (!hb || hb.ageS > 5) throw new Error('the Reaper bridge is not alive (heartbeat ' + (hb ? hb.ageS.toFixed(0) + ' s old' : 'missing') + ')');
    const RESUME = process.argv.includes('--resume');
    const st = job(`local _, p = reaper.EnumProjects(-1, '') return { path = p, dirty = reaper.IsProjectDirty(0) }`);
    if (RESUME && String(st.path).toLowerCase() !== RPP.toLowerCase()) throw new Error('--resume: the current tab is ' + st.path + ', not the render project');
    if (!RESUME) {
    if (/septet_rack\.rpp$/i.test(st.path) && st.dirty) throw new Error('the rack has unsaved changes — save it in Reaper first (the render copies the file)');
    fs.copyFileSync(RACK, RPP);
    fs.mkdirSync(RAWDIR, { recursive: true });
    try { fs.unlinkSync(RAW); } catch (e) { }
    log('1. ' + path.relative(ROOT, RPP) + ' ← the rack (saved ' + fs.statSync(RACK).mtime.toISOString().slice(0, 16) + ')');

    const opened = job(`reaper.Main_OnCommand(40859, 0)
reaper.Main_openProject('noprompt:' .. ${L(RPP)})
local _, p = reaper.EnumProjects(-1, '')
return { path = p, tracks = reaper.CountTracks(0) }`, 240000);
    if (!opened.path || opened.path.toLowerCase() !== RPP.toLowerCase()) throw new Error('the render project did not open: ' + JSON.stringify(opened));
    log('2. opened in a new tab · ' + opened.tracks + ' tracks');
    // the guard reads the heartbeat twice (here, then in reaper_job.js); until the heartbeat names the new tab the two reads can
    // straddle its update — the 2026-09-16 re-render was refused exactly so (RUNNING_LOG §553). Wait for it.
    for (let w = Date.now(); ; await sleep(250)) {
      const h = heartbeat();
      if (h && h.project && path.basename(h.project).toLowerCase() === path.basename(RPP).toLowerCase()) break;
      if (Date.now() - w > 30000) throw new Error('the heartbeat never named the render tab: ' + JSON.stringify(h));
    }

    const setup = job(`local _, p = reaper.EnumProjects(-1, '')
if p:lower() ~= (${L(RPP)}):lower() then return { error = 'wrong project: ' .. p } end
reaper.SetCurrentBPM(0, 60, false)
${PLACE_LUA}
local files = { ${files.map((f, k) => '{ ' + L(f.replace(/^\d\d /, '').replace(/\.mid$/, '')) + ', ' + L(evts[k].file) + ' }').join(', ')} }
local used, placed, problems = {}, {}, {}
for _, f in ipairs(files) do
  local idx = nil
  for i = 0, reaper.CountTracks(0) - 1 do
    local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
    if n == f[1] and not used[i] then idx = i; used[i] = true; break end
  end
  if idx == nil then problems[#problems + 1] = 'no track ' .. f[1] else
    local tr = reaper.GetTrack(0, idx)
    local before = reaper.CountTrackMediaItems(tr)
    local okp, notes, ccs = pcall(place, tr, f[1], f[2], ${END})
    if not okp or reaper.CountTrackMediaItems(tr) ~= before + 1 then problems[#problems + 1] = 'not placed ' .. f[1] .. ((not okp) and (': ' .. tostring(notes)) or '') else
      local it = reaper.GetTrackMediaItem(tr, before)
      placed[#placed + 1] = { track = idx + 1, name = f[1], pos = reaper.GetMediaItemInfo_Value(it, 'D_POSITION'), len = reaper.GetMediaItemInfo_Value(it, 'D_LENGTH'), notes = notes }
    end
  end
end
local S = function(k, v) reaper.GetSetProjectInfo_String(0, k, v, true) end
local N = function(k, v) reaper.GetSetProjectInfo(0, k, v, true) end
S('RENDER_FILE', ${L(RAWDIR)}) S('RENDER_PATTERN', ${L(NAME + '-float')}) S('RENDER_FORMAT', 'ZXZhdyAAAQ==')
N('RENDER_SETTINGS', 0) N('RENDER_BOUNDSFLAG', 0) N('RENDER_STARTPOS', 0) N('RENDER_ENDPOS', ${END}) N('RENDER_SRATE', 48000)
N('RENDER_CHANNELS', 2) N('RENDER_TAILFLAG', 0) N('RENDER_ADDTOPROJ', 0) N('RENDER_DITHER', 0)
pcall(N, 'RENDER_NORMALIZE', 0)
reaper.Main_SaveProject(0, false)
local _, fmt = reaper.GetSetProjectInfo_String(0, 'RENDER_FORMAT', '', false)
return { bpm = reaper.Master_GetTempo(), placed = placed, problems = problems, format = fmt, srate = reaper.GetSetProjectInfo(0, 'RENDER_SRATE', 0, false),
  endpos = reaper.GetSetProjectInfo(0, 'RENDER_ENDPOS', 0, false), dirty = reaper.IsProjectDirty(0) }`, 240000);
    if (setup.error) throw new Error(setup.error);
    const placed = setup.placed || [];
    if ((setup.problems || []).length || placed.length !== files.length) throw new Error('placement: ' + JSON.stringify(setup.problems) + ' · placed ' + placed.length + ' of ' + files.length);
    const miscount = placed.filter((p, k) => p.notes !== evts[k].on);
    if (miscount.length) throw new Error('note counts differ in Reaper: ' + JSON.stringify(miscount.map(p => p.name + ' ' + p.notes)));
    const off = placed.filter(p => Math.abs(p.pos) > 1e-6);
    if (off.length) throw new Error('items not at 0:00: ' + JSON.stringify(off));
    log('3. tempo ' + setup.bpm + ' BPM · ' + placed.length + ' items at 0:00, by name: ' + placed.map(p => p.track + ' ' + p.name + ' ' + p.len.toFixed(1) + ' s').join(' · '));
    log('   render: master mix · ' + setup.format + ' (WAV 32-bit float) · ' + setup.srate + ' Hz · 0 → ' + setup.endpos + ' s · saved');
    } else {
      const chk = job(`local n, bad = 0, {} for i = 0, reaper.CountTracks(0) - 1 do local tr = reaper.GetTrack(0, i) local c = reaper.CountTrackMediaItems(tr) if c == 1 then n = n + 1 if math.abs(reaper.GetMediaItemInfo_Value(reaper.GetTrackMediaItem(tr, 0), 'D_POSITION')) > 1e-6 then bad[#bad + 1] = i + 1 end elseif c > 1 then bad[#bad + 1] = i + 1 end end local _, f = reaper.GetSetProjectInfo_String(0, 'RENDER_FORMAT', '', false) return { items = n, bad = bad, bpm = reaper.Master_GetTempo(), fmt = f, dirty = reaper.IsProjectDirty(0) }`);
      if (chk.items !== files.length || (chk.bad || []).length || chk.bpm !== 60 || chk.fmt !== 'ZXZhdyAAAQ==') throw new Error('--resume: the render tab is not as set up: ' + JSON.stringify(chk));
      try { fs.unlinkSync(RAW); } catch (e) { }
      fs.mkdirSync(RAWDIR, { recursive: true });
      log('1-3. resumed in the open render tab · ' + chk.items + ' items at 0:00 · ' + chk.bpm + ' BPM · WAV 32-bit float');
    }

    const t0 = Date.now();
    job(`reaper.defer(function() reaper.Main_OnCommand(42230, 0) end) return { queued = true }`);
    log('4. rendering (offline, full speed) …');
    let lastSize = -1, stable = 0;
    while (true) {
      await sleep(3000);
      const size = fs.existsSync(RAW) ? fs.statSync(RAW).size : 0;
      const hb = heartbeat();
      stable = (size > 0 && size === lastSize && hb && hb.ageS < 3) ? stable + 1 : 0;
      lastSize = size;
      if (stable >= 2) break;
      if (Date.now() - t0 > 40 * 60000) throw new Error('the render did not finish in 40 minutes');
    }
    log('   done in ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s · ' + (lastSize / 1e6).toFixed(1) + ' MB');
    const closed = job(`local _, p = reaper.EnumProjects(-1, '')
if p:lower() ~= (${L(RPP)}):lower() then return { closed = false, current = p } end
if reaper.IsProjectDirty(0) == 1 then reaper.Main_SaveProject(0, false) end
reaper.Main_OnCommand(40860, 0)
local _, q = reaper.EnumProjects(-1, '')
return { closed = true, current = q }`, 60000);
    log('5. render tab closed · current: ' + path.basename(closed.current || '?'));
  }

  // MEASURE — the file itself, never a passage
  const probe = JSON.parse(execFileSync(FF.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1'), ['-v', 'error', '-show_entries', 'stream=codec_name,sample_rate,channels,duration_ts', '-of', 'json', RAW], { encoding: 'utf8' })).streams[0];
  const meas = f => spawnSync(FF, ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true+sample,silencedetect=noise=-80dB:d=0.05', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  const readM = txt => {
    const sum = txt.slice(txt.lastIndexOf('Summary:'));
    const num = re => { const m = sum.match(re); return m ? +m[1] : null; };
    const sil = [...txt.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]);
    const silStart0 = /silence_start: 0\b/.test(txt) || /silence_start: -?0\.0/.test(txt);
    return { I: num(/I:\s+(-?[\d.]+) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), truePeak: num(/True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/), samplePeak: num(/Sample peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/), firstSound: silStart0 && sil.length ? sil[0] : 0 };
  };
  let m = readM(meas(RAW));
  if (WINDOW) {   // a demo file: the peak and the first sound are the window's, not the whole file's
    const w = readM(spawnSync(FF, ['-hide_banner', '-nostats', '-ss', String(WINDOW[0]), '-to', String(WINDOW[1]), '-i', RAW, '-af', 'ebur128=peak=true+sample,silencedetect=noise=-80dB:d=0.05', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr);
    log('   the whole file: true peak ' + m.truePeak + ' dBTP · ' + m.I + ' LUFS — the gain is read in the window ' + WINDOW.join('–') + ' s');
    m = Object.assign(w, { firstSound: +(WINDOW[0] + w.firstSound).toFixed(3) });
  }
  const secs = probe.duration_ts / +probe.sample_rate;
  log('6. ' + path.relative(ROOT, RAW) + ' · ' + probe.codec_name + ' · ' + probe.sample_rate + ' Hz · ' + probe.channels + ' ch · ' + secs.toFixed(3) + ' s');
  log('   true peak ' + m.truePeak + ' dBTP · sample peak ' + m.samplePeak + ' dBFS · ' + m.I + ' LUFS · LRA ' + m.LRA + ' LU · first sound at ' + m.firstSound + ' s');
  if (probe.codec_name !== 'pcm_f32le') log('   WARNING: the render is not 32-bit float (' + probe.codec_name + ') — a peak over 0 would already be clipped');
  const firstOnset = Math.min(...cap.expect.notes.map(n => n.t0), ...cap.expect.snippets.map(s => s.start + Math.min(...s.notes.map(x => x[3])) / 1000));
  const gain = (m.truePeak > PEAK || WINDOW) ? +(PEAK - m.truePeak).toFixed(2) : 0;
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', RAW, '-af', 'volume=' + gain + 'dB', '-c:a', 'pcm_s24le', OUT]);
  const m2 = WINDOW
    ? readM(spawnSync(FF, ['-hide_banner', '-nostats', '-ss', String(WINDOW[0]), '-to', String(WINDOW[1]), '-i', OUT, '-af', 'ebur128=peak=true+sample', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr)
    : readM(meas(OUT));
  log('7. ' + path.relative(ROOT, OUT) + ' · 24-bit · gain ' + gain + ' dB (plain, no limiter) → true peak ' + m2.truePeak + ' dBTP · sample peak ' + m2.samplePeak + ' dBFS');
  log('   the equivalent master fader for a direct 24-bit render: ' + gain + ' dB');
  log('   sync: the first onset in the score ' + firstOnset.toFixed(3) + ' s · the first sound in the file ' + m.firstSound + ' s (a sampler\'s attack lands a few ms after)');
  fs.writeFileSync(path.join(RAWDIR, NAME + '-render.json'), JSON.stringify({ score, name: NAME, dir: path.relative(ROOT, dir), only: onlyNames, window: WINDOW, rendered: new Date().toISOString(), rpp: path.relative(ROOT, RPP), raw: probe, seconds: secs, float: m, gainDb: gain, final: m2, firstOnset, end: END }, null, 1));
})().catch(e => { console.error('RENDER FAILED: ' + e.message); process.exit(1); });
