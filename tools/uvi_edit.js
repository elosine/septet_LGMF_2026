#!/usr/bin/env node
// uvi_edit.js — the UVI text edits this rack needs, on a decoded XML (PLAN 0e, 2026-09-17; RUNNING_LOG §22 proved the path).
// Works on files: decode with tools/uvi_state.js, edit here, encode --push there. Never touches Reaper itself.
//
//   node tools/uvi_edit.js baseline <in.xml> <out.xml> [--gain 2]
//       every part: Gain = --gain (2 = +6 dB, the value CC7 = 127 leaves a part at, so the stored state equals the playing state);
//       every program's inserts: Convolver Bypass=0, every other insert (DigitalEq, Maximizer, …) Bypass=1 — his rule, 2026-09-17:
//       "bypass effects except for convolver". Keygroup-level filters (OnePole, ThreeBandShelves) are the instrument, untouched.
//   node tools/uvi_edit.js clone <src.xml> <programDisplayName> <dst.xml> <out.xml> <partNo,partNo,…>
//       the whole <Program>…</Program> of that program in src, copied into those parts of dst (created if the instance has not
//       serialized them yet — an empty part is cloned from the last one with the right Name / DisplayName / MidiChannel). A part that
//       already holds a program is replaced. This is how the Ordinario curve copies are made without the GUI (§22: a <Program> is
//       the program itself; a path alone loads nothing).
//   node tools/uvi_edit.js table <in.xml>
//       one line per part: channel, gain, program, sample players, the three insert flags.
'use strict';
const fs = require('fs');
const args = process.argv.slice(2), cmd = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const rd = f => fs.readFileSync(f, 'utf8');

function parts(s) {   // every <Part …> … </Part> with its offsets and attributes
    const out = []; const re = /<Part\b[^>]*>/g; let m;
    while ((m = re.exec(s))) {
        const tag = m[0]; const g = k => { const r = new RegExp(' ' + k + '="([^"]*)"').exec(tag); return r ? r[1] : null; };
        out.push({ start: m.index, tagEnd: m.index + tag.length, end: s.indexOf('</Part>', m.index) + '</Part>'.length, tag, name: g('Name'), display: g('DisplayName'), no: +g('DisplayName').replace(/\D/g, ''), ch: +g('MidiChannel') + 1 });
    }
    return out;
}
function programOf(s, p) {   // the <Program …>…</Program> inside a part, or null
    const i = s.indexOf('<Program', p.tagEnd); if (i < 0 || i > p.end) return null;
    const j = s.indexOf('</Program>', i) + '</Program>'.length;
    return { start: i, end: j, text: s.slice(i, j), name: (/DisplayName="([^"]*)"/.exec(s.slice(i, s.indexOf('>', i))) || [])[1] };
}
function setAttr(tag, k, v) { return new RegExp(' ' + k + '="[^"]*"').test(tag) ? tag.replace(new RegExp(' ' + k + '="[^"]*"'), ' ' + k + '="' + v + '"') : tag.replace(/>$/, ' ' + k + '="' + v + '">'); }

if (cmd === 'table') {
    const s = rd(args[1]);
    for (const p of parts(s)) {
        const body = s.slice(p.start, p.end); const pr = programOf(s, p);
        const flag = tag => { const m = new RegExp('<' + tag + '\\b[^>]*Bypass="([01])"').exec(body); return m ? m[1] : '-'; };
        const sp = (body.match(/<SamplePlayer\b/g) || []).length; const g = +(/ Gain="([^"]*)"/.exec(p.tag) || [])[1];
        console.log(p.display.padEnd(8) + ' ch ' + String(p.ch).padStart(2) + ' | gain ' + (20 * Math.log10(g)).toFixed(1).padStart(5) + ' dB | ' + (pr ? pr.name.replace(/&amp;/g, '&') : '—').padEnd(36) + ' | players ' + String(sp).padStart(3) + ' | conv ' + flag('Convolver') + ' eq ' + flag('DigitalEq') + ' max ' + flag('Maximizer'));
    }
} else if (cmd === 'baseline') {
    let s = rd(args[1]); const gain = opt('gain', '2'); let n = 0, c = 0, b = 0;
    // part gains, from the last part backwards so offsets stay valid
    const ps = parts(s).reverse();
    for (const p of ps) { const t = setAttr(p.tag, 'Gain', gain); if (t !== p.tag) n++; s = s.slice(0, p.start) + t + s.slice(p.tagEnd); }
    // program-level inserts: the tags that occur only there
    s = s.replace(/<Convolver\b[^>]*>/g, t => { const u = setAttr(t, 'Bypass', '0'); if (u !== t) c++; return u; });
    s = s.replace(/<(DigitalEq|Maximizer|Compressor|Limiter|Delay|Reverb|Chorus|Phaser|Flanger|Distortion|Tilt\w*|\w*Eq)\b[^>]*Bypass="[01]"[^>]*>/g, t => { if (/^<Convolver/.test(t)) return t; const u = setAttr(t, 'Bypass', '1'); if (u !== t) b++; return u; });
    fs.writeFileSync(args[2], s);
    console.log('baseline: ' + ps.length + ' parts, gain ' + gain + ' (' + (20 * Math.log10(+gain)).toFixed(1) + ' dB) on ' + n + ' changed; convolver on (' + c + ' changed); other inserts bypassed (' + b + ' changed)');
} else if (cmd === 'clone') {
    const [, srcF, progName, dstF, outF, list] = args;
    const src = rd(srcF); let dst = rd(dstF);
    const sp = parts(src).find(p => { const pr = programOf(src, p); return pr && pr.name === progName; });
    if (!sp) throw new Error('no part in ' + srcF + ' holds "' + progName + '"');
    const prog = programOf(src, sp).text;
    const targets = list.split(',').map(x => +x);
    // make sure the destination has serialized parts up to the highest target
    let ps = parts(dst); const have = Math.max(...ps.map(p => p.no));
    for (let no = have + 1; no <= Math.max(...targets); no++) {
        const last = ps[ps.length - 1];
        let tpl = dst.slice(last.start, last.end); const pr = programOf(dst, last);
        if (pr) tpl = tpl.slice(0, pr.start - last.start) + tpl.slice(pr.end - last.start);   // an empty copy of the last part
        let tag = /<Part\b[^>]*>/.exec(tpl)[0]; let t2 = setAttr(setAttr(setAttr(tag, 'Name', 'Part ' + (no - 1)), 'DisplayName', 'Part ' + no), 'MidiChannel', String(no - 1));
        tpl = t2 + tpl.slice(tag.length);
        dst = dst.slice(0, last.end) + '\n                ' + tpl + dst.slice(last.end);
        ps = parts(dst);
    }
    let done = [];
    for (const no of targets.slice().sort((a, b) => b - a)) {   // highest first: offsets above stay valid
        const p = ps.find(x => x.no === no); if (!p) throw new Error('part ' + no + ' missing after creation');
        const pr = programOf(dst, p);
        if (pr) dst = dst.slice(0, pr.start) + prog + dst.slice(pr.end);
        else { const at = dst.indexOf('</BusRouters>', p.tagEnd) + '</BusRouters>'.length; if (at < p.tagEnd || at > p.end) throw new Error('no BusRouters in part ' + no); dst = dst.slice(0, at) + '\n                    ' + prog + dst.slice(at); }
        done.push(no + ' (ch ' + p.ch + (pr ? ', replaced ' + pr.name : '') + ')');
        ps = parts(dst);
    }
    fs.writeFileSync(outF, dst);
    console.log('cloned "' + progName + '" (' + prog.length + ' bytes) into part(s) ' + done.reverse().join(', '));
} else { console.log(rd(__filename).split('\n').slice(1, 16).join('\n')); process.exit(cmd ? 2 : 0); }
