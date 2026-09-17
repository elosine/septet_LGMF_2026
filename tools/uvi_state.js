#!/usr/bin/env node
// uvi_state.js — UVI Workstation's insides as text (PLAN 0k.3; RUNNING_LOG §49; docs/REAPER_CONTROL.md §3b).
//
// A UVI instance's state, as Reaper stores it in the track chunk, is: Reaper's VST wrapper →
// a UVI header (…, block size = 12 + compressed bytes, "UVI4", version, XML length) → a zlib
// stream of XML (<UVI4><Engine>…<Part MidiChannel= Gain= OutputName=>…). This tool reads a
// track's chunk through the bridge, decodes that XML, and can write an edited XML back into
// the running instance (SetTrackStateChunk) — no GUI.
//
//   node tools/uvi_state.js info  "Flute SI2"                 # parts: channel, gain, output, program, bypassed inserts
//   node tools/uvi_state.js decode "Flute SI2" flute.xml       # the XML to a file
//   node tools/uvi_state.js roundtrip "Flute SI2" [--push]     # re-encode unchanged; --push sends it to Reaper and reads back
//   node tools/uvi_state.js encode "Flute SI2" flute.xml --push   # an edited XML into the running instance
//   node tools/uvi_state.js set-output "Flute SI2" 13 "Out 2" --push  # a part to an output pair: "Out 2".."Out 17", or "" = Main.
//       The stored token is a path, "$Engine/Out 2" (learned by diffing the GUI's change, RUNNING_LOG §59); the tool adds the prefix.
//
// Every length field in the UVI header that equals (old compressed length + k) for a small k is
// rewritten as (new compressed length + k): the header's own bookkeeping, handled generically.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const cmd = args[0], track = args[1];
const flag = k => args.includes('--' + k);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };

function job(kind, ...rest) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'reaper_job.js'), kind, ...rest], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error('bridge job failed: ' + (r.stderr || r.stdout).slice(0, 400));
    return JSON.parse(r.stdout);
}
function getChunk(name) { const r = job('chunk', name); return r.result.chunk; }

// ---- the VST block inside a track chunk
function findVst(chunk) {
    const lines = chunk.split('\n');
    const i0 = lines.findIndex(l => /^\s*<VST /.test(l) && /UVIWorkstation/i.test(l));
    if (i0 < 0) throw new Error('no UVI Workstation VST block in this track');
    let i1 = i0 + 1; while (i1 < lines.length && !/^\s*>\s*$/.test(lines[i1])) i1++;
    const indent = (lines[i0 + 1].match(/^\s*/) || [''])[0];
    const b64 = lines.slice(i0 + 1, i1).map(l => l.trim()).join('');
    return { lines, i0, i1, indent, raw: Buffer.from(b64, 'base64') };
}
function splitState(raw) {
    const z = raw.indexOf(Buffer.from([0x78, 0x9c]));
    if (z < 0) throw new Error('no zlib stream found');
    const header = raw.subarray(0, z);
    const stream = raw.subarray(z);
    const xml = zlib.inflateSync(stream);
    // the compressed length: inflate consumed how much? recompute by trial: zlib streams end with adler32; find via inflateSync on prefixes is costly — use the header's own field instead
    const compLen = readCompLen(header, stream.length);
    return { header, z, compLen, tail: raw.subarray(z + compLen), xml };
}
function readCompLen(header, streamLen) {
    // the field at z-24 holds 12 + compressed length (RUNNING_LOG §49); trust it if plausible, else the stream is the rest of the buffer
    if (header.length >= 24) { const v = header.readUInt32LE(header.length - 24) - 12; if (v > 0 && v <= streamLen) return v; }
    return streamLen;
}
function rebuild(header, xml, oldComp) {
    const comp = zlib.deflateSync(xml, { level: 6 });
    const h = Buffer.from(header);
    let fixed = [];
    for (let off = 0; off + 4 <= h.length; off += 4) {
        const v = h.readUInt32LE(off);
        const k = v - oldComp;
        if (k >= 0 && k <= 64) { h.writeUInt32LE(comp.length + k, off); fixed.push({ off, k }); }
    }
    // the XML length field (the last 4 bytes of the header)
    if (h.length >= 4 && h.readUInt32LE(h.length - 4) !== xml.length) h.writeUInt32LE(xml.length, h.length - 4);
    return { raw: Buffer.concat([h, comp]), fixed, compLen: comp.length };
}
function withNewState(vst, raw) {
    const b64 = raw.toString('base64');
    const out = [];
    for (let i = 0; i < b64.length; i += 128) out.push(vst.indent + b64.slice(i, i + 128));
    return vst.lines.slice(0, vst.i0 + 1).concat(out, vst.lines.slice(vst.i1)).join('\n');
}
function pushChunk(name, chunk) {
    const tmp = path.join(ROOT, 'reaper', 'bridge', 'chunk_push.lua');
    const code = `local want = ${JSON.stringify(name)}
local chunk = [==[
${chunk}
]==]
for i = 0, reaper.CountTracks(0) - 1 do
  local tr = reaper.GetTrack(0, i); local _, n = reaper.GetTrackName(tr)
  if n == want then
    local ok = reaper.SetTrackStateChunk(tr, chunk, false)
    local ok2, back = reaper.GetTrackStateChunk(tr, '', false)
    return { track = n, set = ok, bytesBack = #back }
  end
end
error('no track named ' .. want)`;
    fs.writeFileSync(tmp, code);
    const r = job('run', tmp);
    fs.unlinkSync(tmp);
    return r;
}

// ---- readings of the XML
function info(xml) {
    const s = xml.toString('utf8');
    const master = /<Synth [^>]*DisplayName="Master"[^>]*Gain="([^"]+)"/.exec(s) || /<Synth [^>]*Gain="([^"]+)"[^>]*DisplayName="Master"/.exec(s);
    const parts = [];
    const re = /<Part\b([^>]*)>/g; let m;
    while ((m = re.exec(s))) {
        const a = m[1]; const g = k => { const r = new RegExp(k + '="([^"]*)"').exec(a); return r ? r[1] : null; };
        const after = s.slice(m.index, m.index + 20000);
        const prog = /<Program\b[^>]*DisplayName="([^"]*)"[^>]*ProgramPath="([^"]*)"/.exec(after);
        const byp = (after.match(/Bypass="1"/g) || []).length;
        parts.push({ part: g('DisplayName'), midiChannel: +g('MidiChannel'), gainDb: g('Gain') != null ? +(20 * Math.log10(+g('Gain'))).toFixed(2) : null, output: g('OutputName') || '(main)', mute: g('Mute'), program: prog ? prog[1] : null, programPath: prog ? prog[2].split('/').pop() : null, bypassedInsertsNearby: byp });
    }
    return { masterGainDb: master ? +(20 * Math.log10(+master[1])).toFixed(2) : null, parts, xmlBytes: xml.length };
}

(async () => {
    if (!cmd || !track) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 15).join('\n')); process.exit(0); }
    const chunk = getChunk(track);
    const vst = findVst(chunk);
    const st = splitState(vst.raw);
    if (cmd === 'info') { console.log(JSON.stringify({ track, headerBytes: st.z, compressed: st.compLen, tail: st.tail.length, ...info(st.xml) }, null, 1)); return; }
    if (cmd === 'decode') { fs.writeFileSync(path.resolve(args[2]), st.xml); console.log('wrote ' + args[2] + ' (' + st.xml.length + ' bytes; header ' + st.z + ', compressed ' + st.compLen + ', tail ' + st.tail.length + ')'); return; }
    if (cmd === 'roundtrip' || cmd === 'encode') {
        const xml = cmd === 'encode' ? fs.readFileSync(path.resolve(args[2])) : st.xml;
        const nb = rebuild(st.header, xml, st.compLen);
        const raw2 = Buffer.concat([nb.raw, st.tail]);
        // self-check: decode what we built
        const st2 = splitState(raw2);
        const same = Buffer.compare(st2.xml, xml) === 0;
        console.log(JSON.stringify({ track, rebuilt: { headerFieldsFixed: nb.fixed, compressedBefore: st.compLen, compressedAfter: nb.compLen, xmlBytes: xml.length, selfDecodeIdentical: same } }, null, 1));
        if (!same) { console.error('self-check failed — not pushing'); process.exit(1); }
        if (flag('push')) {
            const newChunk = withNewState(vst, raw2);
            const r = pushChunk(track, newChunk);
            console.log('pushed:', JSON.stringify(r.result || r.error));
            // read back and compare the XML
            const back = splitState(findVst(getChunk(track)).raw);
            console.log('read back: xml identical to what was pushed =', Buffer.compare(back.xml, xml) === 0, '| compressed', back.compLen, '| header', back.z);
        }
        return;
    }
    if (cmd === 'set-output') {
        const part = +args[2], name = args[3] || '';
        const token = name === '' ? '' : (name.startsWith('$Engine/') ? name : '$Engine/' + name);
        let s = st.xml.toString('utf8');
        const m = new RegExp('<Part Name="Part ' + (part - 1) + '"[^>]*>').exec(s);
        if (!m || !m[0].includes('DisplayName="Part ' + part + '"')) throw new Error('no part ' + part);
        const el = m[0].replace(/OutputName="[^"]*"/, 'OutputName="' + token + '"');
        s = s.slice(0, m.index) + el + s.slice(m.index + m[0].length);
        const xml = Buffer.from(s, 'utf8');
        const nb = rebuild(st.header, xml, st.compLen);
        console.log(JSON.stringify({ track, part, output: token || '(main)', selfDecodeIdentical: Buffer.compare(splitState(Buffer.concat([nb.raw, st.tail])).xml, xml) === 0 }));
        if (flag('push')) { const r = pushChunk(track, withNewState(vst, Buffer.concat([nb.raw, st.tail]))); console.log('pushed:', JSON.stringify(r.result || r.error)); const back = info(splitState(findVst(getChunk(track)).raw).xml); console.log('read back part ' + part + ' output:', back.parts[part - 1].output); }
        return;
    }
    console.error('unknown command ' + cmd); process.exit(2);
})().catch(e => { console.error(e.message); process.exit(1); });
