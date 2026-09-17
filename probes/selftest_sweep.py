#!/usr/bin/env python
"""selftest_sweep.py - a synthetic recording of probes/sweep_schedule.json with KNOWN velocity and CC7 laws per
instrument, analyzed by analyze_balance.py --sweep; the recovered curves must match the laws (relative to 127) within
0.3 dB. Run before a real sweep (PLAN 1g item 1, 2026-09-06):

    python probes/selftest_sweep.py [--schedule probes/sweep_schedule.json] [--keep]
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = {'flute': -20.0, 'bass_clarinet': -26.0, 'piano': -34.0, 'violin1': -28.0, 'violin2': -27.5, 'viola': -24.0, 'cello': -26.0}
KVEL = {'flute': 0.6, 'bass_clarinet': 0.9, 'piano': 0.8, 'violin1': 1.0, 'violin2': 1.0, 'viola': 0.5, 'cello': 0.9}
KCC7 = 1.0


def law_db(inst, vel, cc7):
    return BASE[inst] + KVEL[inst] * 20 * np.log10(vel / 127.0) + KCC7 * 20 * np.log10(cc7 / 127.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'sweep_schedule.json'))
    ap.add_argument('--keep', action='store_true')
    a = ap.parse_args()
    S = json.load(open(a.schedule, encoding='utf-8'))
    sr = 44100; start = 2.345
    n = int((S['totalMs'] / 1000 + start + 2) * sr)
    rng = np.random.default_rng(1)
    x = rng.standard_normal(n) * 10 ** (-80 / 20)
    for q in S['notes']:
        f = 440.0 * 2 ** ((q['pitch'] - 69) / 12.0)
        t0 = int((q['tOnMs'] / 1000 + start) * sr); t1 = int((q['tOffMs'] / 1000 + start) * sr)
        t = np.arange(t1 - t0) / sr
        amp = 10 ** (law_db(q['inst'], q['vel'], q.get('cc7', 127)) / 20) * np.sqrt(2)   # RMS = the law
        env = np.minimum(1.0, np.minimum(t / 0.02, (t[-1] - t) / 0.02))
        x[t0:t1] += amp * env * np.sin(2 * np.pi * f * t)
    tmp = tempfile.mkdtemp(prefix='sweep_selftest_')
    wav = os.path.join(tmp, 'synthetic.wav'); out = os.path.join(tmp, 'velocity_map.json')
    sf.write(wav, x, sr, subtype='PCM_24')
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'probes', 'analyze_balance.py'), wav, '--sweep', '--schedule', a.schedule, '--out', out],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout); print(r.stderr); sys.exit('analyzer failed')
    V = json.load(open(out, encoding='utf-8'))
    worst = 0.0; rows = []
    for inst, d in V['instruments'].items():
        for kind, vals in (('vel', S['sweepVels']), ('cc7', S['sweepCc7s'])):
            m = d[kind + 'MeanDb']; ref = m.get('127')
            for v in vals:
                got = m.get(str(v))
                if got is None or ref is None: rows.append((inst, kind, v, None)); continue
                want = (law_db(inst, v, 127) - law_db(inst, 127, 127)) if kind == 'vel' else (law_db(inst, S['cc7Vel'], v) - law_db(inst, S['cc7Vel'], 127))
                err = (got - ref) - want; worst = max(worst, abs(err)); rows.append((inst, kind, v, err))
    missing = [r for r in rows if r[3] is None]
    print(f"self-test: {len(rows) - len(missing)} points compared, worst error {worst:.2f} dB" + (f", {len(missing)} missing" if missing else ''))
    print('offset detected', V['offsetS'], 's (true', start, 's) | repeatability', V['repeatWorstDb'], 'dB')
    ok = worst <= 0.3 and not missing and abs(V['offsetS'] - start) < 0.02
    print('PASS' if ok else 'FAIL')
    if not a.keep:
        for f in (wav, out):
            try: os.remove(f)
            except OSError: pass
        try: os.rmdir(tmp)
        except OSError: pass
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
