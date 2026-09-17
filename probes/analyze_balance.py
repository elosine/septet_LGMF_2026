#!/usr/bin/env python3
"""analyze_balance.py - measure the ENSEMBLE BALANCE recording and print the trims.
RUNNING_LOG S41 (composer, 2026-09-04: "an easy but data based way to normalize the volume
between instruments ... a 127 flute is same perceived loudness as 127 violin").

    python probes/analyze_balance.py <recording.wav> [--schedule probes/balance_schedule.json]
                                     [--target quietest | -18] [--weight k | flat]
                                     [--out bank/balance.json]

The recording is the rack's REC track, started BEFORE probes/balance_probe.ps1 and stopped
after it. The timetable (the schedule file) says when every note was played; the recording's
own start is found from its first onset, each note's window is refined to its local onset, and
the level is the loudest 1 s RMS inside the note - flat (dBFS) and K-weighted (the ITU-R
BS.1770 pre-filter: a +4 dB high shelf above ~1.7 kHz and a 38 Hz high-pass, applied in the
frequency domain - the "perceived" reading, numpy only).

Per instrument (its PLAIN technique): level127 = the mean over its three pitches at velocity
127 (dB); level64 the same at 64; trim = target - level127, target = the QUIETEST instrument's
level127 by default (cuts only, so nothing can clip) or a dB figure. The STRIKE articulations
(flute pizzicato, bass clarinet slap, Bartok pizz, gettato) are measured the same way and
reported against the instrument's plain level and against each other (after the trims). Writes bank/balance.json (measurements with
provenance + the trims) and prints the Reaper fader values to type in.
"""
import argparse, json, os, sys, datetime
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

# ---- BS.1770 K-weighting as a magnitude response (48 kHz reference coefficients) ----
_SHELF = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_HPF = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])
def _mag(b, a, f):
    w = 2 * np.pi * f / 48000.0
    z = np.exp(-1j * w)
    num = b[0] + b[1] * z + b[2] * z * z
    den = a[0] + a[1] * z + a[2] * z * z
    return np.abs(num / den)
def k_weight(f):
    f = np.minimum(f, 23999.0)
    return _mag(*_SHELF, f) * _mag(*_HPF, f)

def db(x): return 20 * np.log10(max(x, 1e-9))

def level(seg, sr, weight, win_s=0.4):
    """loudest window (RMS, win_s long) in the segment, flat and K-weighted, in dB(FS).
    400 ms = the 'momentary' integration of BS.1770 - short enough to read a strike or a
    decaying piano note at its loudness, long enough to ignore a single click."""
    win = min(len(seg), int(sr * win_s)); hop = max(1, int(sr * 0.02))
    best_flat, best_k = 1e-9, 1e-9
    f = np.fft.rfftfreq(win, 1 / sr); wk = k_weight(f)
    for s in range(0, max(1, len(seg) - win + 1), hop):
        w = seg[s:s + win]
        rms = float(np.sqrt(np.mean(w * w) + 1e-18))
        if rms > best_flat: best_flat = rms
        if weight:
            # RECTANGULAR window (2026-09-06, RUNNING_LOG §119): a Hann taper put a note's attack transient at the window's
            # edge whenever the segment began exactly at the onset, and read a piano note 2 dB low against the same note
            # measured with the segment starting 0.1 s earlier. Parseval on the plain spectrum: rms^2 = 2 * sum|X W|^2 / N^2
            spec = np.fft.rfft(w)
            p = np.sum((np.abs(spec) * wk) ** 2) / len(w)
            rk = float(np.sqrt(2 * p / len(w) + 1e-18))
            if rk > best_k: best_k = rk
    return db(best_flat), (db(best_k) if weight else None)

def envelope(x, sr, hop_ms=10):
    hop = int(sr * hop_ms / 1000); n = len(x) // hop
    e = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-18)
    return 20 * np.log10(e), hop

def fmt(v, sign=''):
    if v is None: return '-'
    return f"{v:+.1f}" if sign else f"{v:.1f}"


def sweep_report(a, S, rows, key, floor, offset):
    """PLAN 1g items 1 and 5 (2026-09-06): the velocity / CC7 sweep. Roles from the schedule: ref (the balance run's notes,
    compared against bank/balance.json), vel (eight velocities), cc7 (eight CC7 values at one velocity). Per instrument and
    register the measured level; the means printed; everything written to bank/velocity_map.json with provenance."""
    bank = None
    try: bank = json.load(open(a.bank, encoding='utf-8'))
    except Exception: bank = None
    def mean(vals): return round(float(np.mean(vals)), 2) if vals else None
    insts = {}
    for r in rows:
        d = insts.setdefault(r['inst'], {'label': r['label'], 'port': r['port'], 'tech': r['tech'], 'techLabel': r['techLabel'], 'ref': [], 'vel': {}, 'cc7': {}})
        q = {'pitch': r['pitch'], 'vel': r['vel'], 'cc7': r.get('cc7', 127), 'onset': r['onset'], 'found': r['found'], 'dbFlat': r['dbFlat'], 'dbK': r['dbK'], 'peakDb': r['peakDb'], 'clip': r['clip']}
        role = r.get('role')
        if role == 'ref': d['ref'].append(q)
        elif role == 'vel': d['vel'].setdefault(str(r['pitch']), []).append(q)
        elif role == 'cc7': d['cc7'].setdefault(str(r['pitch']), []).append(q)
    order = [k for k in S['order'] if k in insts]
    print('\nREFERENCE - the balance run notes replayed (plain technique, three pitches, 127)\n')
    trims = S.get('trims') or {}
    print(f"{'instrument':14} {'now (dB)':>9} {'bank (dB)':>10} {'trim':>6} {'expected':>9} {'delta':>7}   verdict   (expected = the bank's pre-trim level + the trim on the fader)")
    worst = 0.0
    for k in order:
        d = insts[k]
        now = mean([q[key] for q in d['ref'] if q['found']])
        bk = None
        if bank and k in bank.get('instruments', {}):
            bk = mean([q[key] for q in bank['instruments'][k]['notes'] if q['vel'] == 127 and q['found']])
        trim = float(trims.get(k, 0) or 0)
        exp = round(bk + trim, 2) if bk is not None else None
        delta = round(now - exp, 2) if now is not None and exp is not None else None
        d['refMeanDb'] = now; d['bankMeanDb'] = bk; d['trimDb'] = trim; d['expectedDb'] = exp; d['refDeltaDb'] = delta
        if delta is not None: worst = max(worst, abs(delta))
        verdict = '-' if delta is None else ('ok' if abs(delta) <= a.tol else f'OFF by more than {a.tol:.1f} dB - the chain changed since the balance run')
        print(f"{d['label']:14} {fmt(now):>9} {fmt(bk):>10} {fmt(trim, '+'):>6} {fmt(exp):>9} {fmt(delta, '+'):>7}   {verdict}")
    consistent = worst <= a.tol
    print('\nreference verdict: ' + ('CONSISTENT with the balance run' if consistent else 'NOT CONSISTENT with the balance run') + f' (worst {worst:.2f} dB)')
    for kind, label in (('vel', 'VELOCITY'), ('cc7', 'CC7')):
        cols = (S.get('sweepVels') if kind == 'vel' else S.get('sweepCc7s')) or []
        print(f"\n{label} -> level (dB, {a.weight}-weighted, {a.win:.1f} s window, mean of the three registers; ? = a register not found)\n")
        print(f"{'instrument':14} " + ' '.join(f"{c:>7}" for c in cols))
        for k in order:
            d = insts[k]; cells = []; means = {}
            for c in cols:
                qs = [q for p in d[kind].values() for q in p if q[kind] == c]
                f = [q[key] for q in qs if q['found']]
                means[str(c)] = mean(f)
                cells.append(('-' if not f else f"{np.mean(f):.1f}") + ('?' if len(f) < len(qs) else ''))
            d[kind + 'MeanDb'] = means
            print(f"{d['label']:14} " + ' '.join(f"{c:>7}" for c in cells))
    print('\nREPEATABILITY - the reference notes against the same notes inside the velocity sweep (127)\n')
    rep_worst = 0.0
    for k in order:
        d = insts[k]
        v127 = mean([q[key] for p in d['vel'].values() for q in p if q['vel'] == 127 and q['found']])
        dd = round(v127 - d['refMeanDb'], 2) if v127 is not None and d['refMeanDb'] is not None else None
        d['repeatDeltaDb'] = dd
        if dd is not None: rep_worst = max(rep_worst, abs(dd))
        print(f"{d['label']:14} ref {fmt(d['refMeanDb']):>7}  sweep@127 {fmt(v127):>7}  delta {fmt(dd, '+'):>6}")
    print(f'repeatability: worst {rep_worst:.2f} dB')
    clipped = [f"{r['label']} {r['pitch']}@v{r['vel']}/cc{r.get('cc7', 127)} (peak {r['peakDb']:+.1f})" for r in rows if r['clip']]
    if clipped: print('\nCLIPPED: ' + ', '.join(clipped))
    else: print(f"\nno clipping: highest sample peak {max(r['peakDb'] for r in rows):+.1f} dBFS")
    missing = [f"{r['label']} {r['pitch']}@v{r['vel']}/cc{r.get('cc7', 127)}" for r in rows if not r['found']]
    if missing: print('\nNOT FOUND (below the floor - the instrument does not sound there): ' + ', '.join(missing))
    outp = a.out if os.path.basename(a.out) != 'balance.json' else os.path.join(ROOT, 'bank', 'velocity_map.json')
    out = {'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'), 'wav': os.path.basename(a.wav), 'windowS': a.win, 'minDb': a.min,
           'schedule': os.path.relpath(a.schedule, ROOT).replace(chr(92), '/'), 'scheduleGeneratedAt': S.get('generatedAt'), 'weighting': a.weight,
           'noiseFloorDb': round(floor, 1), 'offsetS': round(offset, 3), 'sweepVels': S.get('sweepVels'), 'sweepCc7s': S.get('sweepCc7s'), 'cc7Vel': S.get('cc7Vel'),
           'referenceBank': (os.path.relpath(a.bank, ROOT).replace(chr(92), '/') if bank else None), 'referenceConsistent': consistent, 'referenceTolDb': a.tol, 'referenceWorstDb': round(worst, 2), 'repeatWorstDb': round(rep_worst, 2),
           'instruments': {k: insts[k] for k in order}}
    os.makedirs(os.path.dirname(outp), exist_ok=True)
    json.dump(out, open(outp, 'w', encoding='utf-8'), indent=1)
    print(f'-> {os.path.relpath(outp, ROOT)}')


def ranges_report(a, S, rows, key, floor, offset):
    """PLAN 0d (2026-09-06): per instrument and technique the keys that sounded -> the true range (gaps named), the ring per key
    -> the one-shot lengths; bank/technique_ranges.json and the one-shot rows merged into bank/sample_lengths.json."""
    NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    def nm(m): return NAMES[m % 12] + str(m // 12 - 1)
    techs = {}
    for r in rows:
        d = techs.setdefault((r['inst'], r['tech']), {'inst': r['inst'], 'label': r['label'], 'tech': r['tech'], 'techLabel': r['techLabel'], 'cls': r.get('cls'), 'port': r['port'], 'keys': {}})
        d['keys'][str(r['pitch'])] = {'found': bool(r['found']), 'dbK': r['dbK'], 'peakDb': r['peakDb'], 'ringS': r.get('ringS'), 'ringCapped': r.get('ringCapped')}
    out_ranges = {}
    lengths_new = {}
    print(f"\nRANGES - the keys that sounded, per technique ({a.weight}-weighted; a key counts as silent below {a.min:.0f} dBFS)\n")
    print(f"{'instrument':14} {'technique':24} {'zone':9} {'sounds':9} {'silent keys':40} {'ring s (min / median / max)':28} capped")
    for (inst, tech), d in techs.items():
        ks = sorted(int(k) for k in d['keys'])
        found = [k for k in ks if d['keys'][str(k)]['found']]
        silent = [k for k in ks if not d['keys'][str(k)]['found']]
        lo, hi = (min(found), max(found)) if found else (None, None)
        gaps = [k for k in silent if lo is not None and lo < k < hi]
        rings = [d['keys'][str(k)]['ringS'] for k in found if d['keys'][str(k)]['ringS'] is not None]
        capped = sum(1 for k in found if d['keys'][str(k)]['ringCapped'])
        rec = {'label': d['label'], 'techLabel': d['techLabel'], 'cls': d['cls'], 'port': d['port'], 'zone': [ks[0], ks[-1]] if ks else None, 'measuredKeys': ks,
               'lo': lo, 'hi': hi, 'silent': silent, 'gapsInside': gaps, 'ringMedianS': (round(float(np.median(rings)), 3) if rings else None), 'ringMinS': (min(rings) if rings else None), 'ringMaxS': (max(rings) if rings else None), 'capped': capped, 'keys': d['keys']}
        out_ranges.setdefault(inst, {})[tech] = rec
        if d['cls'] == 'one':
            lengths_new.setdefault(tech, {})
            for k in found:
                q = d['keys'][str(k)]
                if q['ringS'] is not None: lengths_new[tech].setdefault(str(k), []).append(q['ringS'])
        sil = ' '.join(nm(k) for k in silent)
        rg = f"{rings and min(rings) or 0:.2f} / {float(np.median(rings)) if rings else 0:.2f} / {rings and max(rings) or 0:.2f}" if rings else '-'
        zone = f"{ks[0]}-{ks[-1]}" if ks else '-'
        snd = f"{lo}-{hi}" if lo is not None else 'NONE'
        print(f"{d['label']:14} {d['tech'][:24]:24} {zone:9} {snd:9} {sil[:40]:40} {rg:28} {capped if capped else '-'}")
    # merge the one-shot lengths into the bank (a technique key shared by several instruments: the mean per key)
    lp = os.path.join(ROOT, 'bank', 'sample_lengths.json')
    try: SL = json.load(open(lp, encoding='utf-8'))
    except Exception: SL = {}
    for tech, per in lengths_new.items():   # merged per key: a later run adds or refreshes keys, never drops the others
        row = SL.get(tech) if isinstance(SL.get(tech), dict) else {}
        row.update({k: round(float(np.mean(v)), 3) for k, v in per.items()})
        SL[tech] = {k: row[k] for k in sorted(row, key=lambda x: int(x))}
    SL['_meta_septet'] = {'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'), 'wav': os.path.basename(a.wav), 'rule': 'ring = onset -> last 10 ms frame above max(floor + 12 dB, peak - 40 dB) in the slot; capped at the slot end', 'techniques': sorted(lengths_new.keys())}
    json.dump(SL, open(lp, 'w', encoding='utf-8'), indent=1)
    outp = a.out if os.path.basename(a.out) != 'balance.json' else os.path.join(ROOT, 'bank', 'technique_ranges.json')
    out = {'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'), 'wav': os.path.basename(a.wav), 'windowS': a.win, 'minDb': a.min, 'weighting': a.weight,
           'schedule': os.path.relpath(a.schedule, ROOT).replace(chr(92), '/'), 'noiseFloorDb': round(floor, 1), 'offsetS': round(offset, 3), 'rule': 'a key sounds if its onset is found and its flat level is above --min; the range = the lowest and highest sounding keys, the silent keys inside named', 'instruments': out_ranges}
    json.dump(out, open(outp, 'w', encoding='utf-8'), indent=1)
    clipped = [f"{r['label']} {r['tech']} {r['pitch']}" for r in rows if r['clip']]
    if clipped: print('\nCLIPPED: ' + ', '.join(clipped))
    print(f"\n-> {os.path.relpath(outp, ROOT)} and the one-shot rows in bank/sample_lengths.json ({', '.join(sorted(lengths_new.keys()))})")


def proof_report(a, S, rows, key, floor, offset):
    """PLAN 1g item 1, to-do 6 (2026-09-06): at each curve height the seven instruments, each sent its remapped velocity, must
    sit at one level - the violins' - within a.tol dB."""
    hs = S.get('proofH') or sorted({r['h'] for r in rows})
    anchors = ('violin1', 'violin2')
    order = [k for k in S['order'] if any(r['inst'] == k for r in rows)]
    result = {'heights': [], 'pass': True, 'worstDb': 0.0}
    print(f"\nPROOF - the seven at each curve height, each at its remapped velocity ({a.weight}-weighted, {a.win:.1f} s); tolerance {a.tol:.1f} dB from the violins\n")
    for h in hs:
        rs = [r for r in rows if r['h'] == h]
        anchor_vals = [float(r[key]) for r in rs if r['inst'] in anchors and r['found']]
        anchor = float(np.mean(anchor_vals)) if anchor_vals else None
        print(f"height {h:g} (anchor velocity {rs[0]['anchorVel'] if rs else '-'}): violins {fmt(anchor)} dB")
        per = []
        for k in order:
            grp = [x for x in rs if x['inst'] == k and x['found']]
            r = next((x for x in rs if x['inst'] == k), None)
            if r is None: continue
            vals = [float(x[key]) for x in grp]
            lvl = float(np.mean(vals)) if vals else None
            sd = float(np.std(vals)) if len(vals) > 1 else None
            dev = round(lvl - anchor, 2) if anchor is not None and lvl is not None else None
            ok = bool(dev is not None and abs(dev) <= a.tol)
            if dev is not None: result['worstDb'] = max(result['worstDb'], abs(dev))
            if not ok: result['pass'] = False
            per.append({'inst': k, 'label': r['label'], 'pitch': r['pitch'], 'vel': r['vel'], 'n': len(vals), 'found': bool(vals), 'db': lvl, 'sdDb': sd,
                        'minDb': (min(vals) if vals else None), 'maxDb': (max(vals) if vals else None), 'devDb': dev, 'ok': ok, 'notes': vals})
            scatter = (f"  n {len(vals)} sd {sd:.2f} [{min(vals):.1f} .. {max(vals):.1f}]" if sd is not None else '')
            print(f"   {r['label']:14} pitch {r['pitch']:3} sent {r['vel']:3}  level {fmt(lvl):>7}  dev {fmt(dev, '+'):>6}  {'ok' if ok else 'OFF'}{scatter}")
        found = [p['db'] for p in per if p['found']]
        spread = round(max(found) - min(found), 2) if len(found) > 1 else None
        print(f"   spread {fmt(spread)} dB")
        result['heights'].append({'h': h, 'anchorDb': anchor, 'spreadDb': spread, 'instruments': per})
    print(f"\nproof verdict: {'PASS' if result['pass'] else 'FAIL'} - worst deviation {result['worstDb']:.2f} dB (tolerance {a.tol:.1f})")
    clipped = [f"{r['label']} {r['pitch']}@v{r['vel']}" for r in rows if r['clip']]
    if clipped: print('CLIPPED: ' + ', '.join(clipped))
    outp = a.out if os.path.basename(a.out) != 'balance.json' else os.path.join(ROOT, 'bank', 'velocity_proof.json')
    out = {'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'), 'wav': os.path.basename(a.wav), 'windowS': a.win, 'weighting': a.weight, 'tolDb': a.tol,
           'schedule': os.path.relpath(a.schedule, ROOT).replace(chr(92), '/'), 'remapMeasuredAt': S.get('remapMeasuredAt'), 'proofScale': S.get('proofScale'), 'noiseFloorDb': round(floor, 1), 'offsetS': round(offset, 3), 'result': result}
    os.makedirs(os.path.dirname(outp), exist_ok=True)
    json.dump(out, open(outp, 'w', encoding='utf-8'), indent=1)
    print(f'-> {os.path.relpath(outp, ROOT)}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('wav')
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'balance_schedule.json'))
    ap.add_argument('--target', default='quietest')
    ap.add_argument('--weight', default='k', choices=['k', 'flat'])
    ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'balance.json'))
    ap.add_argument('--offset', type=float, default=None, help='recording start of the schedule, in s (default: detected from the first onset)')
    ap.add_argument('--win', type=float, default=0.4, help='RMS window in s (0.4 = momentary; 1.0 = the sustained reading)')
    ap.add_argument('--min', type=float, default=-70.0, help='a note below this level (dBFS) counts as NOT sounding')
    ap.add_argument('--bank', default=os.path.join(ROOT, 'bank', 'balance.json'), help='sweep: the balance bank the reference notes are compared against')
    ap.add_argument('--tol', type=float, default=1.5, help='sweep: the reference check tolerance in dB (PLAN 1g: within about 1.5 dB)')
    ap.add_argument('--ranges', action='store_true', help='the samples true ranges and the one-shots lengths (tools/balance_schedule.js --ranges) -> bank/technique_ranges.json + bank/sample_lengths.json rows')
    ap.add_argument('--proof', action='store_true', help='the remap proof (tools/balance_schedule.js --proof): the seven at each curve height, their spread and deviation from the violins -> bank/velocity_proof.json')
    ap.add_argument('--sweep', action='store_true', help='the velocity / CC7 sweep (tools/balance_schedule.js --sweep): the reference check against bank/balance.json, the per-instrument velocity and CC7 curves -> bank/velocity_map.json')
    a = ap.parse_args()

    S = json.load(open(a.schedule, encoding='utf-8'))
    x, sr = sf.read(a.wav, always_2d=True); x = x.mean(axis=1)
    env, hop = envelope(x, sr)
    floor = max(float(np.percentile(env, 5)), -90.0)   # digital silence between notes would put the floor at -180
    notes = S['notes']
    # the recording's start: the first frame 20 dB over the floor = the first note's onset
    if a.offset is None:
        idx = np.argmax(env > floor + 20)
        if not (env > floor + 20).any(): sys.exit('no onset found: is this the right file?')
        offset = idx * hop / sr - notes[0]['tOnMs'] / 1000
    else: offset = a.offset
    print(f'{os.path.basename(a.wav)}: {len(x)/sr:.1f} s @ {sr} Hz | noise floor {floor:.1f} dB | schedule starts at {offset:+.3f} s in the file')

    rows = []
    for n in notes:
        t_on = n['tOnMs'] / 1000 + offset; t_off = n['tOffMs'] / 1000 + offset
        # refine to the local onset: the first frame 15 dB over the floor within -0.1 ... +0.4 s of the expected time
        f0 = max(0, int((t_on - 0.1) * sr / hop)); f1 = min(len(env), int((t_on + 0.4) * sr / hop))
        loc = np.argmax(env[f0:f1] > floor + 15) if f1 > f0 else 0
        found = (env[f0:f1] > floor + 15).any() if f1 > f0 else False
        on = (f0 + loc) * hop / sr if found else t_on
        seg = x[int(on * sr): int(min(len(x), (t_off + 0.2) * sr))]
        if not len(seg): flat, kk, pk = -99.0, -99.0, -99.0
        else: flat, kk = level(seg, sr, a.weight == 'k', a.win); pk = db(float(np.max(np.abs(seg))))
        if flat < a.min: found = False    # nothing sounded where the timetable expected a note (e.g. a pitch outside the preset's samples)
        ring_s, ring_capped = None, None
        if found and n.get('slotEndMs') is not None:
            # the ring (PLAN 0d, 2026-09-06): from the onset to the last 10 ms frame still above max(floor + 12, peak - 40) inside the
            # note's own slot (the next note's pre-arm excluded); at the slot's end it is capped - the sample outlives the slot
            slot_end = n['slotEndMs'] / 1000 + offset - 0.35
            g0 = int(on * sr / hop); g1 = min(len(env), int(slot_end * sr / hop))
            if g1 > g0 + 1:
                seg_env = env[g0:g1]
                thr = max(floor + 12.0, float(seg_env.max()) - 40.0)
                above = np.nonzero(seg_env > thr)[0]
                last = int(above[-1]) if len(above) else 0
                ring_s = round((last + 1) * hop / sr, 3)
                ring_capped = bool(last >= (g1 - g0) - 15)
        rows.append(dict(n, onset=round(on, 3), found=bool(found), dbFlat=round(flat, 2), dbK=(round(kk, 2) if kk is not None else None), peakDb=round(pk, 2), clip=bool(pk >= -0.1), ringS=ring_s, ringCapped=ring_capped))

    key = 'dbK' if a.weight == 'k' else 'dbFlat'
    if a.sweep:
        sweep_report(a, S, rows, key, floor, offset); return
    if a.proof:
        proof_report(a, S, rows, key, floor, offset); return
    if a.ranges:
        ranges_report(a, S, rows, key, floor, offset); return
    insts = {}
    for r in rows:
        role = r.get('role', 'plain')
        d = insts.setdefault(r['inst'], {'label': r['label'], 'port': r['port'], 'tech': None, 'techLabel': None, 'notes': [], 'techniques': {}})
        if role == 'plain':
            d['tech'] = r['tech']; d['techLabel'] = r['techLabel']
            d['notes'].append({'pitch': r['pitch'], 'vel': r['vel'], 'onset': r['onset'], 'found': r['found'], 'dbFlat': r['dbFlat'], 'dbK': r['dbK'], 'peakDb': r['peakDb'], 'clip': r['clip']})
        else:
            tq = d['techniques'].setdefault(r['tech'], {'techLabel': r['techLabel'], 'port': r['port'], 'notes': []})
            tq['notes'].append({'pitch': r['pitch'], 'vel': r['vel'], 'onset': r['onset'], 'found': r['found'], 'dbFlat': r['dbFlat'], 'dbK': r['dbK'], 'peakDb': r['peakDb'], 'clip': r['clip']})
    for k, d in insts.items():
        v127 = [q[key] for q in d['notes'] if q['vel'] == 127 and q['found']]
        v64 = [q[key] for q in d['notes'] if q['vel'] == 64 and q['found']]
        d['level127'] = round(float(np.mean(v127)), 2) if v127 else None
        d['level64'] = round(float(np.mean(v64)), 2) if v64 else None
        d['spread127'] = round(float(max(v127) - min(v127)), 2) if len(v127) > 1 else None
        pk = [q['peakDb'] for q in d['notes'] if q['vel'] == 127 and q['found']]
        d['peak127'] = round(float(max(pk)), 1) if pk else None
    levels = [d['level127'] for d in insts.values() if d['level127'] is not None]
    if not levels: sys.exit('no note found at all')
    target = min(levels) if a.target == 'quietest' else float(a.target)
    for d in insts.values():
        d['trimDb'] = round(target - d['level127'], 1) if d['level127'] is not None else None
        for tq in d['techniques'].values():
            v127 = [q[key] for q in tq['notes'] if q['vel'] == 127 and q['found']]
            v64 = [q[key] for q in tq['notes'] if q['vel'] == 64 and q['found']]
            tq['level127'] = round(float(np.mean(v127)), 2) if v127 else None
            tq['level64'] = round(float(np.mean(v64)), 2) if v64 else None
            tq['vsPlainDb'] = round(tq['level127'] - d['level127'], 1) if tq['level127'] is not None and d['level127'] is not None else None
            tq['afterTrimDb'] = round(tq['level127'] + d['trimDb'], 1) if tq['level127'] is not None and d['trimDb'] is not None else None

    print(f"\nweighting {a.weight} | window {a.win:.2f} s | target {target:.2f} dB ({'the quietest instrument' if a.target == 'quietest' else 'given'})\n")
    print(f"{'instrument':10} {'port':7} {'technique':32} {'127 (dB)':>9} {'spread':>7} {'peak':>6} {'64 (dB)':>8} {'127-64':>7} {'TRIM':>6}   notes at 127 (pitch: dB)")
    for k in S['order']:
        d = insts.get(k)
        if not d: continue
        n127 = ' '.join(f"{q['pitch']}:{q[key]:.1f}" + ('' if q['found'] else '?') for q in d['notes'] if q['vel'] == 127)
        l127 = f"{d['level127']:.1f}" if d['level127'] is not None else '  -'
        l64 = f"{d['level64']:.1f}" if d['level64'] is not None else '  -'
        diff = f"{d['level127'] - d['level64']:.1f}" if d['level127'] is not None and d['level64'] is not None else '  -'
        sp = f"{d['spread127']:.1f}" if d['spread127'] is not None else '  -'
        tr = f"{d['trimDb']:+.1f}" if d['trimDb'] is not None else '  -'
        pk = f"{d['peak127']:.1f}" if d['peak127'] is not None else '  -'
        print(f"{d['label']:10} {d['port']:7} {d['techLabel'][:32]:32} {l127:>9} {sp:>7} {pk:>6} {l64:>8} {diff:>7} {tr:>6}   {n127}")
    techs = [(k, d, tk, tq) for k in S['order'] if k in insts for d in [insts[k]] for tk, tq in d['techniques'].items()]
    if techs:
        print(f"\nSTRIKE articulations at 127 (measured against each other; 'after trim' = with the instrument's trim applied, target {target:.1f})\n")
        print(f"{'instrument':10} {'technique':36} {'127 (dB)':>9} {'vs plain':>9} {'after trim':>11}   notes at 127 (pitch: dB)")
        for k, d, tk, tq in techs:
            n127 = ' '.join(f"{q['pitch']}:{q[key]:.1f}" + ('' if q['found'] else '?') for q in tq['notes'] if q['vel'] == 127)
            l = f"{tq['level127']:.1f}" if tq['level127'] is not None else '  -'
            vp = f"{tq['vsPlainDb']:+.1f}" if tq['vsPlainDb'] is not None else '  -'
            at = f"{tq['afterTrimDb']:.1f}" if tq['afterTrimDb'] is not None else '  -'
            print(f"{d['label']:10} {tq['techLabel'][:36]:36} {l:>9} {vp:>9} {at:>11}   {n127}")
        vals = [tq['afterTrimDb'] for _, _, _, tq in techs if tq['afterTrimDb'] is not None]
        if len(vals) > 1: print(f"\nspread of the strike articulations after the trims: {max(vals) - min(vals):.1f} dB (loudest {max(vals):.1f}, quietest {min(vals):.1f})")
    clipped = [f"{r['label']} {r['techLabel'][:12]} {r['pitch']}@{r['vel']} (peak {r['peakDb']:+.1f})" for r in rows if r['clip']]
    if clipped: print('\nCLIPPED (sample peak at 0 dBFS - the reading is low, lower that instrument and re-run it alone): ' + ', '.join(clipped))
    else: print(f"\nno clipping: highest sample peak {max(r['peakDb'] for r in rows):+.1f} dBFS")
    missing = [f"{r['label']} {r['pitch']}@{r['vel']}" for r in rows if not r['found']]
    if missing: print('\nNOT FOUND (no onset where the timetable expects one): ' + ', '.join(missing))
    print('\nReaper: type each TRIM into the track\'s volume field (double-click the fader) - the piece\'s fff is then matched across the ensemble.')

    out = {'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'), 'wav': os.path.basename(a.wav), 'windowS': a.win, 'minDb': a.min, 'schedule': os.path.relpath(a.schedule, ROOT).replace('\\', '/'),
           'scheduleGeneratedAt': S.get('generatedAt'), 'weighting': a.weight, 'targetDb': round(target, 2), 'targetRule': a.target, 'noiseFloorDb': round(floor, 1), 'offsetS': round(offset, 3),
           'instruments': {k: insts[k] for k in S['order'] if k in insts}}
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(out, open(a.out, 'w', encoding='utf-8'), indent=1)
    print(f'-> {os.path.relpath(a.out, ROOT)}')

if __name__ == '__main__':
    main()
