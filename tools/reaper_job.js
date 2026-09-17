#!/usr/bin/env node
// reaper_job.js — send a job to the Reaper bridge and print its answer (PLAN 0k.1; reaper/bridge/bridge.lua).
//
//   node tools/reaper_job.js heartbeat                       # is the bridge alive, which project
//   node tools/reaper_job.js tracks                          # every track: index, name, fader dB, arm, folder, FX
//   node tools/reaper_job.js fader "Flute SI2" -21           # set a track's fader (dB), read back
//   node tools/reaper_job.js run path/to/job.lua             # any Lua chunk that RETURNS its result
//   node tools/reaper_job.js -e "return reaper.GetAppVersion()"
//   node tools/reaper_job.js save                            # save the project (the composer's CTRL+S)
//   node tools/reaper_job.js chunk "Flute SI2" [out.txt]     # a track's state chunk (the plugin state inside)
//   node tools/reaper_job.js transport play|stop|record|pause · marker "name" [pos] · arm "<track>" on|off · reload
//   Runtime: %APPDATA%\REAPERridge (or $REAPER_BRIDGE); the project guard: $REAPER_PROJECT (default septet_rack).
//
// The job is written atomically into reaper/bridge/inbox/ (temp name, then rename) so the bridge
// never reads a half file; the answer is awaited in reaper/bridge/outbox/ (default 20 s).
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// the bridge RUNTIME is machine-level (one bridge per machine): %APPDATA%\REAPERridge, or $REAPER_BRIDGE
const B = process.env.REAPER_BRIDGE || path.join(process.env.APPDATA || path.join(require('os').homedir(), 'AppData', 'Roaming'), 'REAPER', 'bridge');
const INBOX = path.join(B, 'inbox'), OUTBOX = path.join(B, 'outbox'), HEART = path.join(B, 'heartbeat.json');
// a project guard: refuse to send when another project is open (set per repo; '' = any)
const EXPECT_PROJECT = process.env.REAPER_PROJECT || 'septet_rack';
const args = process.argv.slice(2);
const cmd = args[0];
const luaStr = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';

const T = {
    heartbeat: () => null,
    tracks: () => `
local out = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i)
  local _, name = reaper.GetTrackName(tr)
  local vol = reaper.GetMediaTrackInfo_Value(tr, 'D_VOL')
  local fx = {}
  for f = 0, reaper.TrackFX_GetCount(tr) - 1 do local _, fn = reaper.TrackFX_GetFXName(tr, f, ''); fx[#fx + 1] = fn end
  out[#out + 1] = { index = i + 1, name = name, dB = vol > 0 and 20 * math.log(vol, 10) or -150, arm = reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM'),
    folder = reaper.GetMediaTrackInfo_Value(tr, 'I_FOLDERDEPTH'), mute = reaper.GetMediaTrackInfo_Value(tr, 'B_MUTE'), fx = fx,
    recmode = reaper.GetMediaTrackInfo_Value(tr, 'I_RECMODE'), recinput = reaper.GetMediaTrackInfo_Value(tr, 'I_RECINPUT') }
end
return out`,
    fader: (name, dB) => `
local want = ${luaStr(name)}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
  if n == want then
    reaper.SetMediaTrackInfo_Value(tr, 'D_VOL', 10 ^ (${Number(dB)} / 20))
    local v = reaper.GetMediaTrackInfo_Value(tr, 'D_VOL')
    return { track = n, dB = 20 * math.log(v, 10) }
  end
end
error('no track named ' .. want)`,
    save: () => `reaper.Main_SaveProject(0, false); local _, p = reaper.EnumProjects(-1, ''); return { saved = p }`,
    transport: (what) => ({ play: 'reaper.Main_OnCommand(1007, 0)', stop: 'reaper.Main_OnCommand(1016, 0)', record: 'reaper.Main_OnCommand(1013, 0)', pause: 'reaper.Main_OnCommand(1008, 0)' }[what] || `error('transport: play|stop|record|pause')`) + `; return { playState = reaper.GetPlayState(), pos = reaper.GetPlayPosition() }`,
    marker: (name, pos) => `local p = ${pos != null ? Number(pos) : 'reaper.GetCursorPosition()'}; local id = reaper.AddProjectMarker(0, false, p, 0, ${luaStr(name || '')}, -1); return { marker = id, pos = p }`,
    arm: (name, on) => `
local want = ${luaStr(name)}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
  if n == want then reaper.SetMediaTrackInfo_Value(tr, 'I_RECARM', ${on === '0' || on === 'off' ? 0 : 1}); return { track = n, arm = reaper.GetMediaTrackInfo_Value(tr, 'I_RECARM') } end
end
error('no track named ' .. want)`,
    reload: () => `return { __reload = true }`,
    chunk: (name) => `
local want = ${luaStr(name)}
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
  if n == want then local ok, chunk = reaper.GetTrackStateChunk(tr, '', false); return { track = n, chunk = chunk } end
end
error('no track named ' .. want)`,
};

function heartbeat() {
    try {
        const h = JSON.parse(fs.readFileSync(HEART, 'utf8'));
        const age = Date.now() / 1000 - h.time;
        return { ...h, ageS: Math.round(age), alive: age < 5 };
    } catch (e) { return { alive: false, error: 'no heartbeat file' }; }
}

function send(code, timeoutMs = 20000) {
    fs.mkdirSync(INBOX, { recursive: true }); fs.mkdirSync(OUTBOX, { recursive: true });
    const name = Date.now() + '-' + Math.floor(Math.random() * 1e6);
    const tmp = path.join(INBOX, name + '.tmp'), job = path.join(INBOX, name + '.lua'), out = path.join(OUTBOX, name + '.json');
    fs.writeFileSync(tmp, code); fs.renameSync(tmp, job);
    const t0 = Date.now();
    return new Promise((resolve, reject) => {
        const poll = () => {
            if (fs.existsSync(out)) {
                try { const r = JSON.parse(fs.readFileSync(out, 'utf8')); fs.unlinkSync(out); resolve({ ...r, roundTripMs: Date.now() - t0 }); }
                catch (e) { setTimeout(poll, 30); }
                return;
            }
            if (Date.now() - t0 > timeoutMs) { try { fs.unlinkSync(job); } catch (e) {} reject(new Error('no answer in ' + timeoutMs + ' ms — is the bridge running? (' + JSON.stringify(heartbeat()) + ')')); return; }
            setTimeout(poll, 30);
        };
        poll();
    });
}

(async () => {
    if (!cmd || cmd === '-h') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 12).join('\n')); process.exit(0); }
    if (cmd === 'heartbeat') { console.log(JSON.stringify(heartbeat(), null, 1)); process.exit(0); }
    if (EXPECT_PROJECT) { const h = heartbeat(); if (h.alive && h.project && !path.basename(h.project).startsWith(EXPECT_PROJECT)) { console.error('refusing: Reaper has ' + path.basename(h.project) + ' open, this repo expects ' + EXPECT_PROJECT + ' (set REAPER_PROJECT to override)'); process.exit(3); } }
    let code;
    if (cmd === 'run') code = fs.readFileSync(path.resolve(args[1]), 'utf8');
    else if (cmd === '-e') code = args[1];
    else if (T[cmd]) code = T[cmd](...args.slice(1));
    else { console.error('unknown job ' + cmd); process.exit(2); }
    try {
        const r = await send(code, +(process.env.BRIDGE_TIMEOUT_MS || 20000));
        if (cmd === 'chunk' && r.ok && args[2]) { fs.writeFileSync(path.resolve(args[2]), r.result.chunk); r.result = { track: r.result.track, written: args[2], bytes: r.result.chunk.length }; }
        console.log(JSON.stringify(r, null, 1));
        process.exit(r.ok ? 0 : 1);
    } catch (e) { console.error(e.message); process.exit(1); }
})();
