#!/usr/bin/env python
"""selftest_ranges.py - a synthetic recording of probes/ranges_schedule.json with KNOWN rings and KNOWN silent keys, analyzed by
analyze_balance.py --ranges; the silent keys must come back silent, the sounding ones sounding, and each ring within 40 ms.
Run before a real ranges probe (PLAN 0d, 2026-09-06):

    python probes/selftest_ranges.py [--schedule probes/ranges_schedule.json] [--keep]
"""
import argparse, json, os, subprocess, sys, tempfile, shutil
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'ranges_schedule.json'))
    ap.add_argument('--keep', action='store_true')
    a = ap.parse_args()
    S = json.load(open(a.schedule, encoding='utf-8'))
    notes = S['notes']
    # keep the test short: the first two techniques of each instrument, up to 12 keys each
    keep, seen = [], {}
    for n in notes:
        k = (n['inst'], n['tech'])
        if len([t for t in seen if t[0] == n['inst']]) >= 2 and k not in seen: continue
        seen.setdefault(k, 0)
        if seen[k] >= 12: continue
        seen[k] += 1; keep.append(n)
    # re-time the kept notes back to back, the slot lengths as scheduled
    t = 3000.0; sched = []
    for n in keep:
        hold = n['tOffMs'] - n['tOnMs']; slot = n['slotEndMs'] - n['tOnMs']
        m = dict(n); m['tPreMs'] = t - 300; m['tOnMs'] = t; m['tOffMs'] = t + hold; m['slotEndMs'] = t + slot; sched.append(m); t += slot
    S2 = dict(S); S2['notes'] = sched; S2['totalMs'] = t + 1000
    sr = 44100; start = 1.7
    x = np.random.default_rng(3).standard_normal(int((t / 1000 + start + 2) * sr)) * 10 ** (-80 / 20)
    truth = {}
    for i, n in enumerate(sched):
        silent = (n['pitch'] % 7 == 3)                     # every key whose pitch is 3 mod 7 is silent
        ring = 0.25 + 0.02 * (n['pitch'] % 13) if n['cls'] == 'one' else None   # a one-shot's known ring: 0.25 .. 0.49 s
        truth[i] = {'silent': silent, 'ring': ring}
        if silent: continue
        f = 440.0 * 2 ** ((n['pitch'] - 69) / 12.0)
        t0 = int((n['tOnMs'] / 1000 + start) * sr)
        if n['cls'] == 'one':
            dur = ring + 0.3; tt = np.arange(int(dur * sr)) / sr
            env = 10 ** (-40 * (tt / ring) / 20)           # falls 40 dB exactly at `ring`
        else:
            dur = (n['tOffMs'] - n['tOnMs']) / 1000; tt = np.arange(int(dur * sr)) / sr
            env = np.ones_like(tt); env[-int(0.02 * sr):] = np.linspace(1, 0, int(0.02 * sr))
        amp = 10 ** (-24 / 20) * np.sqrt(2)
        x[t0:t0 + len(tt)] += amp * env * np.sin(2 * np.pi * f * tt)
    tmp = tempfile.mkdtemp(prefix='ranges_selftest_')
    wav = os.path.join(tmp, 'synthetic.wav'); sp = os.path.join(tmp, 'schedule.json'); out = os.path.join(tmp, 'ranges.json')
    sf.write(wav, x, sr, subtype='PCM_24'); json.dump(S2, open(sp, 'w'))
    # the analyzer also merges one-shot rows into bank/sample_lengths.json - protect the real bank
    bank = os.path.join(ROOT, 'bank', 'sample_lengths.json'); backup = bank + '.selftest.bak'
    shutil.copy(bank, backup)
    try:
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'probes', 'analyze_balance.py'), wav, '--ranges', '--schedule', sp, '--out', out], capture_output=True, text=True)
    finally:
        shutil.move(backup, bank)
    if r.returncode != 0:
        print(r.stdout); print(r.stderr); sys.exit('analyzer failed')
    R = json.load(open(out, encoding='utf-8'))
    worst, bad_silent, bad_found, n_ring = 0.0, 0, 0, 0
    for i, n in enumerate(sched):
        rec = R['instruments'][n['inst']][n['tech']]['keys'][str(n['pitch'])]
        tr = truth[i]
        if tr['silent'] and rec['found']: bad_silent += 1
        if not tr['silent'] and not rec['found']: bad_found += 1
        if not tr['silent'] and tr['ring'] is not None and rec['ringS'] is not None:
            n_ring += 1; worst = max(worst, abs(rec['ringS'] - tr['ring']))
    print(f"self-test: {len(sched)} notes, {sum(1 for v in truth.values() if v['silent'])} silent by design; misread silent {bad_silent}, misread sounding {bad_found}; {n_ring} rings compared, worst error {worst * 1000:.0f} ms; offset {R['offsetS']} (true {start})")
    ok = bad_silent == 0 and bad_found == 0 and worst <= 0.04 and abs(R['offsetS'] - start) < 0.02
    print('PASS' if ok else 'FAIL')
    if not a.keep: shutil.rmtree(tmp, ignore_errors=True)
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
