#!/usr/bin/env node
// capture_composer_midi.js — RUNNING_LOG §453 (2026-09-13). THE COMPOSER'S OWN PLAYBACK, captured message by message.
//
// Why: the render must sound like what the composer plays. The shared computation (sonify_core.compileScore) never learned the
// septet's playback rules — trills (zone snippets regenerated at play start), the notes a trill or a crescendo eats, the measured
// held velocity and CC7, the secco cut, the late switch beside a trill, the measured bend range (§441–§443). Porting them would make
// a second copy to keep in step. Instead this runs composer.html itself in headless Chrome under a VIRTUAL CLOCK and records every
// MIDI message its play loop sends, with the timestamp it was sent for. One engine; what he hears is what renders.
//
// How:
//   · Chrome headless, a throwaway profile, driven over the DevTools protocol (Node's own WebSocket — no dependencies).
//   · Before the page's scripts run: navigator.requestMIDIAccess → fake outputs named as the loopMIDI ports, recording
//     send(bytes, timestamp) (a timestamp in the past = now, as Web MIDI does; clear() drops what is queued ahead, as Web MIDI does);
//     performance.now → a virtual clock once the capture starts; EVERY non-GET request refused (no autosave, no save — the capture
//     can never write a score or a working copy).
//   · The score is loaded from its FILE (loadSession, the last Save — the file the MAIN notation file is built from), never the
//     working copy. The trill timing table and the velocity remap are awaited first.
//   · startPlay() at 0 s (it regenerates every trill and beating, as his ▶ does), then the play loop's own step (animatePlay →
//     applyScroll → the zone, motive and curve ticks) at 60 frames per virtual second to the end, then stopPlay() (the flush cure).
//   · Score seconds = (timestamp − playStartTime) / 1000 + playStartOffset / pixelsPerSecond — perfAt(), inverted.
//
//   node tools/capture_composer_midi.js [--score piece-lgmf] [--server http://localhost:5400] [--fps 60] [--out midi/<score>.capture.json]
//
// As a module: require('./capture_composer_midi.js').capture({ score, server, fps }) → { meta, events: [[port, sec, bytes], …], expect }.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
  .find(p => fs.existsSync(p));

function portsFromInstruments() {
  const I = new Function(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\nreturn INSTRUMENTS;')();
  const ports = new Set();
  for (const k of Object.keys(I)) {
    const v = I[k]; if (!v || typeof v !== 'object') continue;
    if (v.port) ports.add(v.port);
    (v.techniques || []).forEach(t => t && t.port && ports.add(t.port));
    const c = v.channels && v.channels.curve; if (Array.isArray(c)) c.forEach(x => x && x.port && ports.add(x.port));
  }
  return [...ports];
}

// runs in the page before any of its scripts
const INIT = PORTS => `(() => {
  window.__blocked = [];
  const _fetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const m = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if (m !== 'GET' && m !== 'HEAD') { window.__blocked.push(m + ' ' + (input && input.url || input)); return Promise.reject(new Error('capture: writes refused')); }
    return _fetch(input, init);
  };
  const _open = XMLHttpRequest.prototype.open, _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__m = String(m).toUpperCase(); this.__u = u; return _open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () { if (this.__m !== 'GET' && this.__m !== 'HEAD') { window.__blocked.push(this.__m + ' ' + this.__u); throw new Error('capture: writes refused'); } return _send.apply(this, arguments); };
  try { navigator.sendBeacon = () => false; } catch (e) {}
  window.__virt = null;
  const _now = performance.now.bind(performance);
  performance.now = () => (window.__virt != null ? window.__virt : _now());
  window.__midi = [];
  const outs = new Map();
  for (const name of ${JSON.stringify(PORTS)}) {
    outs.set(name, { name, id: name, manufacturer: 'capture', state: 'connected', connection: 'open', type: 'output',
      send(data, ts) { const now = performance.now(); window.__midi.push([name, (ts == null || ts < now) ? now : ts, Array.from(data)]); },
      clear() { const now = performance.now(); window.__midi = window.__midi.filter(e => !(e[0] === name && e[1] > now)); },
      open() { return Promise.resolve(this); }, close() { return Promise.resolve(this); }, addEventListener() {}, removeEventListener() {} });
  }
  const access = { outputs: outs, inputs: new Map(), sysexEnabled: false, onstatechange: null, addEventListener() {}, removeEventListener() {} };
  navigator.requestMIDIAccess = () => Promise.resolve(access);
})();`;

// runs in the page once the composer is up
const RUN = (score, fps) => `(async () => {
  const C = Composer;
  await C.loadTrillDb(); await C.loadVelocityRemap();
  if (!C._trillDb) throw new Error('the trill timing table did not load');
  if (!C._velRemap) throw new Error('the velocity remap did not load');
  await C.loadSession(${JSON.stringify(score)});
  if (C.sessionName !== ${JSON.stringify(score)}) throw new Error('the score did not load: ' + C.sessionName);
  await C.initZoneMidi();
  if (!C._zoneMidiInited) throw new Error('MIDI did not initialise');
  if (C.soloParts && C.soloParts.clear) C.soloParts.clear();
  const pps = C.pixelsPerSecond;
  let end = 0;
  for (const o of C.objects) {
    if (o.type === 'waveCurve' && o.sonifyNote != null && o.endSeconds > end) end = o.endSeconds;
    if (o.type === 'zone' && o.endTime > end) end = o.endTime;
  }
  const T_END = end + 3;
  window.requestAnimationFrame = () => 0;           // the loop is stepped here, not by the display
  window.__virt = 1e6;
  C.stopPlay();
  C.scrollOffset = 0;
  window.__midi = [];                               // nothing before the run counts
  C.startPlay();                                    // regenerates trills and beatings; playStartTime = the virtual now
  const P0 = C.playStartTime, OFF = C.playStartOffset / pps, step = 1000 / ${fps};
  let f = 0;
  while (true) {
    f++;
    window.__virt = P0 + f * step;
    C.animatePlay();
    if ((window.__virt - P0) / 1000 + OFF > T_END) break;
    if (f % 1200 === 0) await new Promise(r => setTimeout(r, 0));
  }
  C.stopPlay();
  await new Promise(r => setTimeout(r, 400));       // the stop's second sweep (a 160 ms timer) lands at the virtual end
  // what the stream must contain, from the composer's own objects and rules
  const expect = { snippets: [], notes: [], eaten: [] };
  for (const o of C.objects) {
    if (o.type === 'zone' && o.midiSnippet && o.midiSnippet.events && o.midiSnippet.events.length && !o.midiMute) {
      const s = o.midiSnippet;
      expect.snippets.push({ id: o.id, layer: o.layer, model: o.midiModel || '', start: o.startTime - (s.leadMs || 0) / 1000, port: s.port, channel: s.channel || 1,
        notes: s.events.filter(e => e.notes && e._bend == null && e._cc == null).flatMap(e => e.notes.map(n => [e.port || s.port, e.channel || s.channel || 1, n, e.onsetMs])) });
    }
    if (o.type === 'waveCurve' && o.sonifyNote != null) {
      const inst = C.trackInstrument(o.layer); if (!inst) continue;
      const r = C.routeForNote(o, C.curveTechniqueFor(o), inst);
      const eaten = C.trillCovers(o.layer, o.startSeconds) || C.mutedByLive(o);
      (eaten ? expect.eaten : expect.notes).push({ id: o.id, port: r.port, ch: r.ch, pitch: o.sonifyNote, t0: o.startSeconds, t1: o.endSeconds, ks: o.sonifyMode === 'ks' ? o.ksNote : null,
        bend0: (o.morphBend && o.morphBend.length) ? o.morphBend[0][1] : null });   // [2j.7, §548] the initial bend in cents — export_midi check (e)
    }
  }
  return { frames: f, P0, OFF, pps, T_END, n: window.__midi.length, blocked: window.__blocked.slice(0, 20), blockedN: window.__blocked.length,
    objects: C.objects.length, trills: C.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill').length, expect };
})()`;

async function capture({ score = 'piece-lgmf', server = 'http://localhost:5400', fps = 60, log = console.log } = {}) {
  if (!CHROME) throw new Error('no Chrome or Edge found');
  const ping = await fetch(server + '/composer.html').catch(() => null);
  if (!ping || !ping.ok) throw new Error('the score server is not answering at ' + server + ' (node score/server.js)');
  const fileObjects = JSON.parse(fs.readFileSync(path.join(ROOT, 'scores', score + '.json'), 'utf8')).objects.length;
  const PORTS = portsFromInstruments();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'septet-capture-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run',
    '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--window-size=1920,1080', 'about:blank'],
  { stdio: 'ignore' });
  const cleanup = () => { try { chrome.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {} }, 1500); };
  try {
    let port = null;
    for (let i = 0; i < 100 && !port; i++) {
      await new Promise(r => setTimeout(r, 100));
      try { port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim(); } catch (e) {}
    }
    if (!port) throw new Error('Chrome did not open its debugging port');
    const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map(); const waiters = [];
    ws.onmessage = m => {
      const d = JSON.parse(m.data);
      if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
      else if (d.method) waiters.filter(w => w.method === d.method).forEach(w => { waiters.splice(waiters.indexOf(w), 1); w.res(d.params); });
    };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
    const once = method => new Promise(res => waiters.push({ method, res }));
    const evaluate = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error('page: ' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text));
      return r.result.value;
    };
    await send('Page.enable'); await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: INIT(PORTS) });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: server + '/composer.html' });
    await loaded;
    for (let i = 0; i < 200; i++) {
      if (await evaluate('typeof Composer !== "undefined" && !!Composer.lanes && Composer.lanes.length > 0')) break;
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 1500));   // the page's own start-up open settles first
    log('  capture: composer up in headless Chrome · ports ' + PORTS.join(' ') + ' · stepping ' + score + ' at ' + fps + ' fps');
    const t0 = Date.now();
    const meta = await evaluate(RUN(score, fps));
    if (meta.objects !== fileObjects) throw new Error('the page holds ' + meta.objects + ' objects, the file ' + fileObjects);
    const raw = [];
    for (let a = 0; a < meta.n; a += 20000) raw.push(...JSON.parse(await evaluate('JSON.stringify(window.__midi.slice(' + a + ',' + (a + 20000) + '))')));
    ws.close();
    let negative = 0;
    const events = raw.map(([p, ts, bytes]) => {
      let sec = (ts - meta.P0) / 1000 + meta.OFF;
      if (sec < 0) { negative++; sec = 0; }
      return [p, +sec.toFixed(6), bytes];
    });
    const expect = meta.expect; delete meta.expect;
    Object.assign(meta, { score, fps, ports: PORTS, negative, wallSeconds: +((Date.now() - t0) / 1000).toFixed(1), capturedAt: new Date().toISOString(),
      scoreFile: 'scores/' + score + '.json', scoreMtime: fs.statSync(path.join(ROOT, 'scores', score + '.json')).mtime.toISOString() });
    return { meta, events, expect };
  } finally { cleanup(); }
}

module.exports = { capture, portsFromInstruments };

if (require.main === module) {
  const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
  const score = arg('score', 'piece-lgmf');
  const out = arg('out', 'midi/' + score + '.capture.json');
  capture({ score, server: arg('server', 'http://localhost:5400'), fps: +arg('fps', 60) }).then(r => {
    fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, out), JSON.stringify(r));
    console.log('captured ' + r.events.length + ' messages · ' + r.meta.frames + ' frames in ' + r.meta.wallSeconds + ' s · writes refused: ' + r.meta.blockedN + ' → ' + out);
  }).catch(e => { console.error('capture failed: ' + e.message); process.exit(1); });
}
