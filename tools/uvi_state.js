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
    const compLen = readCompLen(header, stream.length, stream);
    return { header, z, compLen, tail: raw.subarray(z + compLen), xml };
}
function readCompLen(header, streamLen, stream) {
    // THE LAYOUT (LGMF RUNNING_LOG §22, 2026-09-17 — the same in piece #5's committed rack): a 288-byte Reaper prefix · LE size fields at
    // 288 and 300 · the VST2 fxBank wrapper "VstW … CcnK <BE byteSize> FBCh … UVIW …" · <BE 12 + compressed> "UVI4" <LE version> <LE xml
    // length> · the zlib stream · a short zero tail. The BE field just before "UVI4" is the compressed length; it is trusted only if that
    // exact slice inflates. (Piece #5's §49 reading — an LE field at z-24 — is kept as the fallback.)
    const h = header.length;
    const inflates = v => { try { zlib.inflateSync(stream.subarray(0, v)); return true; } catch (e) { return false; } };
    if (h >= 16 && header.subarray(h - 12, h - 8).toString('latin1') === 'UVI4') { const v = header.readUInt32BE(h - 16) - 12; if (v > 0 && v <= streamLen && inflates(v)) return v; }
    if (h >= 24) { const v = header.readUInt32LE(h - 24) - 12; if (v > 0 && v <= streamLen && inflates(v)) return v; }
    return streamLen;
}
function rebuild(header, xml, oldComp) {
    const comp = zlib.deflateSync(xml, { level: 6 });
    const h = Buffer.from(header);
    let fixed = [];
    // Every size field in the wrapper region (offset >= 288, past Reaper's own prefix table) that reads as (old compressed length + k),
    // k <= 256, in EITHER byte order, becomes (new compressed length + k) in the same order. Seen: LE +204 @288 · LE +188 @300 ·
    // BE +164 @328 (the fxBank byteSize) · BE +12 @h-16 (the UVI4 block). The first version rewrote LE fields with k <= 64 only — it
    // matched none of these, so every push carried stale sizes and UVI silently kept its old state (LGMF RUNNING_LOG §22).
    for (let off = 288; off + 4 <= h.length; off += 4) {
        const kl = h.readUInt32LE(off) - oldComp, kb = h.readUInt32BE(off) - oldComp;
        if (kl >= 0 && kl <= 256) { h.writeUInt32LE(comp.length + kl, off); fixed.push({ off, k: kl, order: 'LE' }); }
        else if (kb >= 0 && kb <= 256) { h.writeUInt32BE(comp.length + kb, off); fixed.push({ off, k: kb, order: 'BE' }); }
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
    // set-master (2026-09-18, RUNNING_LOG §51–§52): the instance's MASTER gain in dB. The clipping pre-flight found the
    // bassoon at +1.46 dBFS and the horn at +0.03 at velocity 127 / CC7 127 — and that is not the probe's doing: CC7 127
    // puts a UVI part at +6 dB by design (uvi_edit.js baseline), so the PIECE would clip them too. The Reaper fader cannot
    // reach a clip inside the plugin and a lower stored part gain is pushed straight back up by CC7, so the master is the
    // lever — #5's flute fix (its §115, −2 dB), done here as text instead of in the GUI.
    //   node tools/uvi_state.js set-master "Bassoon SI2" -6 --push
    if (cmd === 'set-master') {
        const db = +args[2];
        if (!Number.isFinite(db)) throw new Error('set-master needs a dB figure, e.g. -6');
        const gain = Math.pow(10, db / 20);
        let s = st.xml.toString('utf8');
        const m = /<Synth [^>]*DisplayName="Master"[^>]*>/.exec(s);
        if (!m || !/Gain="[^"]*"/.test(m[0])) throw new Error('no <Synth DisplayName="Master" … Gain="…"> in this state');
        const el = m[0].replace(/Gain="[^"]*"/, 'Gain="' + gain + '"');
        s = s.slice(0, m.index) + el + s.slice(m.index + m[0].length);
        const xml = Buffer.from(s, 'utf8');
        const nb = rebuild(st.header, xml, st.compLen);
        const before = info(st.xml).masterGainDb;
        console.log(JSON.stringify({ track, masterGainDb: { before, asked: db }, selfDecodeIdentical: Buffer.compare(splitState(Buffer.concat([nb.raw, st.tail])).xml, xml) === 0 }));
        if (flag('push')) { const r = pushChunk(track, withNewState(vst, Buffer.concat([nb.raw, st.tail]))); console.log('pushed:', JSON.stringify(r.result || r.error)); const back = info(splitState(findVst(getChunk(track)).raw).xml); console.log('read back master gain:', back.masterGainDb, 'dB'); }
        return;
    }
    console.error('unknown command ' + cmd); process.exit(2);
})().catch(e => { console.error(e.message); process.exit(1); });
