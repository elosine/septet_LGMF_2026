// aro_state.js — a Spitfire Abbey Road Orchestra instance's state as TEXT (PLAN 0c/0e, the percussion; RUNNING_LOG §34–§35).
//
// Reaper stores the plugin's state in the track chunk as base64 lines: a JUCE binary prefix (I/O masks, a length),
// then the state XML  <SPITFIREAUDIO_ABBEY_ROAD_ORCHESTRA><META family=… name=…/>…<ARTICS>…<ARTIC>…  , then a short
// JUCE tail. The instrument is named, not pathed — the samples come from the library on disk — so a loaded preset can
// be read, edited (which preset, which articulation is active, triggers, channels) and pushed back, or pushed into a
// NEW track, with no GUI. Modeled on tools/uvi_state.js (the bridge does the reading and the SetTrackStateChunk).
//
//   node tools/aro_state.js info "Percussion"                          # META + the articulations, from the running rack
//   node tools/aro_state.js decode "Percussion" out.xml                # the XML to a file (+ info)
//   node tools/aro_state.js encode "Percussion" edited.xml --push      # an edited XML into the running instance, read back
//   node tools/aro_state.js roundtrip "Percussion" --push              # unchanged, re-encoded, pushed, read back (the proof of the path)
//   node tools/aro_state.js clone "Percussion" "Dagu ARO" --push [--preset "Dragon Drums (C)" --family "Low Percussion"] [--artic "Dagu Sticks"]
//        # a NEW track after the source, the source's chunk (name changed, GUID dropped) with the state edited as asked, read back
//
// Every push is followed by a read-back and a summary; the read-back is the verdict, never the push.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const cmd = args[0], track = args[1];
const flag = k => args.includes('--' + k);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const END_TAG = '</SPITFIREAUDIO_ABBEY_ROAD_ORCHESTRA>';

function job(kind, ...rest) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'reaper_job.js'), kind, ...rest], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error('bridge job failed: ' + (r.stderr || r.stdout).slice(0, 600));
    return JSON.parse(r.stdout);
}
function getChunk(name) { const r = job('chunk', name); return r.result.chunk; }

// ---- the VST block inside a track chunk (decoded LINE BY LINE — a joined decode stops at the first line's padding, §34)
function findVst(chunk) {
    const lines = chunk.split('\n');
    const i0 = lines.findIndex(l => /^\s*<VST /.test(l) && /Abbey Road/i.test(l));
    if (i0 < 0) throw new Error('no Abbey Road Orchestra VST block in this track');
    let i1 = i0 + 1; while (i1 < lines.length && !/^\s*>\s*$/.test(lines[i1])) i1++;
    const indent = (lines[i0 + 1].match(/^\s*/) || [''])[0];
    const raw = Buffer.concat(lines.slice(i0 + 1, i1).map(l => Buffer.from(l.trim(), 'base64')));
    return { lines, i0, i1, indent, raw };
}
function splitState(raw) {
    const s = raw.toString('latin1');
    const a = s.indexOf('<?xml'); const b = s.indexOf(END_TAG);
    if (a < 0 || b < 0) throw new Error('no Spitfire XML in this state (' + raw.length + ' bytes)');
    const e = b + END_TAG.length;
    return { prefix: raw.subarray(0, a), xml: raw.subarray(a, e), suffix: raw.subarray(e) };
}
// Length fields in the prefix that equal the state length (xml, or xml + tail, ± a small constant), either byte order —
// the UVI lesson (§22): a stale size and the plugin silently keeps its old state. Reported, then rewritten on encode.
function lengthFields(prefix, xmlLen, sufLen) {
    const found = [];
    for (let off = 0; off + 4 <= prefix.length; off++) {
        for (const order of ['LE', 'BE']) {
            const v = order === 'LE' ? prefix.readUInt32LE(off) : prefix.readUInt32BE(off);
            for (const [base, len] of [['xml', xmlLen], ['xml+tail', xmlLen + sufLen]]) {
                const k = v - len;   // seen: LE at 472 = xml exactly; BE at 464 = xml + 69 (the JUCE tail without Reaper's last 6 bytes)
                if (k >= -64 && k <= 64) found.push({ off, order, base, k });
            }
        }
    }
    return found;
}
function rebuild(prefix, newXml, suffix, fields) {
    const p = Buffer.from(prefix);
    for (const f of fields) {
        const v = (f.base === 'xml' ? newXml.length : newXml.length + suffix.length) + f.k;
        if (f.order === 'LE') p.writeUInt32LE(v, f.off); else p.writeUInt32BE(v, f.off);
    }
    return Buffer.concat([p, newXml, suffix]);
}
function withNewState(vst, raw) {
    const b64 = raw.toString('base64');
    const out = [];
    for (let i = 0; i < b64.length; i += 128) out.push(vst.indent + b64.slice(i, i + 128));
    return vst.lines.slice(0, vst.i0 + 1).concat(out, vst.lines.slice(vst.i1)).join('\n');
}
function pushChunk(name, chunk) {
    const tmp = path.join(ROOT, 'reaper', 'bridge', 'aro_push.lua');
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
function insertClone(srcName, newName, chunk) {
    const tmp = path.join(ROOT, 'reaper', 'bridge', 'aro_clone.lua');
    const code = `local src, want = ${JSON.stringify(srcName)}, ${JSON.stringify(newName)}
local chunk = [==[
${chunk}
]==]
for i = 0, reaper.CountTracks(0) - 1 do
  local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
  if n == want then error('a track named ' .. want .. ' already exists') end
end
local at = nil
for i = 0, reaper.CountTracks(0) - 1 do
  local _, n = reaper.GetTrackName(reaper.GetTrack(0, i))
  if n == src then at = i + 1 end
end
if not at then error('no track named ' .. src) end
reaper.InsertTrackAtIndex(at, true)
local tr = reaper.GetTrack(0, at)
local ok = reaper.SetTrackStateChunk(tr, chunk, false)
local _, name = reaper.GetTrackName(tr)
local ok2, back = reaper.GetTrackStateChunk(tr, '', false)
reaper.TrackList_AdjustWindows(false)
return { index = at + 1, name = name, set = ok, bytesBack = #back }`;
    fs.writeFileSync(tmp, code);
    const r = job('run', tmp);
    fs.unlinkSync(tmp);
    return r;
}

// ---- readings of the XML
const Q = String.fromCharCode(34);
function attr(tag, name) { const k = ' ' + name + '=' + Q; const i = tag.indexOf(k); if (i < 0) return null; const s = i + k.length; return tag.slice(s, tag.indexOf(Q, s)); }
function setting(block, id) { const k = 'id=' + Q + id + Q + ' value=' + Q; const i = block.indexOf(k); if (i < 0) return null; const s = i + k.length; return block.slice(s, block.indexOf(Q, s)); }
function summary(xmlBuf) {
    const s = xmlBuf.toString('utf8');
    const meta = (s.match(/<META [^>]*>/) || [''])[0];
    const artics = s.split('<ARTIC>').slice(1).map(x => x.split('</ARTIC>')[0].split('<MIX>')[0]);
    const globals = s.split('<ARTICS>')[1] ? s.split('<ARTICS>')[1].split('<ARTIC>')[0] : '';
    return {
        preset: attr(meta, 'name'), family: attr(meta, 'family'), version: attr(meta, 'version'),
        lastSelectedPrimaryArtic: setting(globals, 'p_lastSelectedPrimaryArtic'), midiChannel: setting(globals, 'p_midiChannel'),
        artics: artics.map((a, i) => ({ i, name: setting(a, 'a_name'), active: setting(a, 'a_active'), type: setting(a, 't_type'), ks: setting(a, 't_keyswitch'), ch: setting(a, 't_midiChannel'), top: setting(a, 'rr_neighbourMax') })),
        xmlBytes: xmlBuf.length,
    };
}
function printSummary(label, sum) {
    console.log(label + ': preset "' + sum.preset + '" · family "' + sum.family + '" · v' + sum.version + ' · ' + sum.artics.length + ' articulations · selected ' + sum.lastSelectedPrimaryArtic + ' · plugin MIDI ch ' + sum.midiChannel + ' · xml ' + sum.xmlBytes + ' B');
    for (const a of sum.artics) console.log('   ' + a.i + '  ' + a.name + (a.active !== '0' ? '  [active ' + a.active + ']' : '') + '  type ' + a.type + ' ks ' + a.ks + ' ch ' + a.ch + ' top ' + a.top);
}

// ---- XML edits
function editXml(xmlBuf, edits) {
    let s = xmlBuf.toString('utf8');
    if (edits.preset != null || edits.family != null) {
        s = s.replace(/<META [^>]*>/, tag => {
            if (edits.preset != null) tag = tag.replace(/ name="[^"]*"/, ' name="' + edits.preset + '"');
            if (edits.family != null) tag = tag.replace(/ family="[^"]*"/, ' family="' + edits.family + '"');
            return tag;
        });
    }
    if (edits.modified != null) s = s.replace(/<META ([^>]*) modified="[^"]*"/, '<META $1 modified="' + edits.modified + '"');
    if (edits.stripArtics) {   // META + UI + the global ARTICS settings only — does the plugin then load the named preset itself?
        const parts = s.split('<ARTIC>');
        const last = parts[parts.length - 1]; const after = last.slice(last.indexOf('</ARTIC>') + '</ARTIC>'.length);
        s = parts[0] + after;
    }
    if (edits.artic != null) {   // the active articulation, by name: a_active 2 on it, 0 elsewhere, and the selector index
        const parts = s.split('<ARTIC>');
        let idx = -1;
        for (let i = 1; i < parts.length; i++) {
            const isIt = setting(parts[i], 'a_name') === edits.artic;
            if (isIt) idx = i - 1;
            parts[i] = parts[i].replace(/id="a_active" value="[^"]*"/, 'id="a_active" value="' + (isIt ? '2' : '0') + '"');
        }
        if (idx < 0) throw new Error('no articulation named "' + edits.artic + '"');
        s = parts.join('<ARTIC>').replace(/id="p_lastSelectedPrimaryArtic" value="[^"]*"/, 'id="p_lastSelectedPrimaryArtic" value="' + idx + '"');
    }
    return Buffer.from(s, 'utf8');
}
function encodeState(vst, st, newXml) {
    const fields = lengthFields(st.prefix, st.xml.length, st.suffix.length);
    const raw = rebuild(st.prefix, newXml, st.suffix, fields);
    return { chunk: withNewState(vst, raw), fields, bytes: raw.length };
}
function readBack(name, label) {
    const vst = findVst(getChunk(name)); const st = splitState(vst.raw); const sum = summary(st.xml); printSummary(label, sum); return { vst, st, sum };
}

// ---- commands
try {
    if (!cmd || !track) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 18).join('\n')); process.exit(0); }
    if (cmd === 'info' || cmd === 'decode') {
        const vst = findVst(getChunk(track)); const st = splitState(vst.raw);
        printSummary(track, summary(st.xml));
        const f = lengthFields(st.prefix, st.xml.length, st.suffix.length);
        console.log('state ' + vst.raw.length + ' B = prefix ' + st.prefix.length + ' + xml ' + st.xml.length + ' + tail ' + st.suffix.length + ' · length fields in the prefix: ' + JSON.stringify(f) + ' · bytes before the xml: ' + st.prefix.subarray(Math.max(0, st.prefix.length - 24)).toString('hex'));
        if (cmd === 'decode') { const out = args[2] || (track.replace(/\W+/g, '_') + '.aro.xml'); fs.writeFileSync(out, st.xml); console.log('xml written: ' + out); }
    } else if (cmd === 'roundtrip' || cmd === 'encode') {
        const vst = findVst(getChunk(track)); const st = splitState(vst.raw);
        const newXml = cmd === 'encode' ? fs.readFileSync(args[2]) : st.xml;
        const e = encodeState(vst, st, newXml);
        console.log('encoded: ' + e.bytes + ' B, length fields rewritten: ' + JSON.stringify(e.fields));
        if (flag('push')) {
            const r = pushChunk(track, e.chunk); console.log('push: ' + JSON.stringify(r.result));
            const back = readBack(track, 'read-back');
            console.log('identical to what was pushed: ' + (Buffer.compare(back.st.xml, newXml) === 0));
        }
    } else if (cmd === 'edit') {   // the running instance edited in place: --preset --family --modified --strip-artics --artic, then --push + read-back
        const vst = findVst(getChunk(track)); const st = splitState(vst.raw);
        printSummary('before ' + track, summary(st.xml));
        const newXml = editXml(st.xml, { preset: opt('preset', null), family: opt('family', null), modified: opt('modified', null), stripArtics: flag('strip-artics'), artic: opt('artic', null) });
        const e = encodeState(vst, st, newXml);
        console.log('edited: ' + e.bytes + ' B (xml ' + newXml.length + '), length fields rewritten: ' + JSON.stringify(e.fields));
        if (flag('push')) { const r = pushChunk(track, e.chunk); console.log('push: ' + JSON.stringify(r.result)); readBack(track, 'read-back ' + track); }
        else console.log('(dry run — add --push)');
    } else if (cmd === 'clone') {
        const newName = args[2]; if (!newName) throw new Error('clone needs a new track name');
        const chunk = getChunk(track); const vst = findVst(chunk); const st = splitState(vst.raw);
        printSummary('source ' + track, summary(st.xml));
        const newXml = editXml(st.xml, { preset: opt('preset', null), family: opt('family', null), artic: opt('artic', null) });
        const e = encodeState(vst, st, newXml);
        let lines = e.chunk.split('\n').filter(l => !/^\s*TRACKID /.test(l));
        lines = lines.map(l => /^\s*NAME /.test(l) ? l.replace(/NAME .*/, 'NAME ' + JSON.stringify(newName)) : l);
        console.log('edited: ' + e.bytes + ' B, length fields rewritten: ' + JSON.stringify(e.fields) + (opt('preset', null) ? ' · preset → ' + opt('preset') : '') + (opt('artic', null) ? ' · active artic → ' + opt('artic') : ''));
        if (flag('push')) {
            const r = insertClone(track, newName, lines.join('\n')); console.log('clone: ' + JSON.stringify(r.result));
            readBack(newName, 'read-back ' + newName);
        } else console.log('(dry run — add --push)');
    } else throw new Error('unknown command ' + cmd);
} catch (e) { console.error(e.message); process.exit(1); }
