#!/usr/bin/env python3
"""selftest_bend.py - a synthetic recording of the bend schedule with a KNOWN instrument per player, analyzed by
probes/analyze_bend.py; the analyzer must read back what was put in (PLAN 1f step 1, 2026-09-07; the tuba's
probes/selftest_bend_analyzer.py, adapted to this kit's schedule).

Why: every number the beating tool will trust - the sampler's range, the residue, whether MIDI can widen the range -
is just what this analyzer reports. Audio whose true pitch is known by construction is the only ground truth there is;
a real take has none. The simulated players are DELIBERATELY unlike each other (ranges 0.5 to 2 semitones, one of them
honouring RPN 0, a tuning offset on some) so the analyzer is proved per instrument, not on average.

    python probes/selftest_bend.py [--schedule probes/bend_schedule.json] [--keep]
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
# the simulated instruments: bend range in semitones, RPN 0 honoured?, the sampler's own tuning offset in cents
SIM = {
    'flute':         {'rangeSt': 1.99, 'rpn': False, 'tune': 0.0},
    'bass_clarinet': {'rangeSt': 0.50, 'rpn': False, 'tune': -4.0},
    'violin1':       {'rangeSt': 1.00, 'rpn': False, 'tune': 0.0},
    'violin2':       {'rangeSt': 2.00, 'rpn': True,  'tune': 0.0},
    'viola':         {'rangeSt': 1.50, 'rpn': False, 'tune': +6.0},
    'cello':         {'rangeSt': 2.00, 'rpn': True,  'tune': -3.0},
}
SCOOP_MS = 90      # a bend that lands closer than this before the note scoops in
START = 2.345      # where the schedule's t=0 sits in the file


def midi_hz(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def truth_for(inst, n, state):
    """The cents the simulated player sounds for this slot (settled), given the bend state carried between slots."""
    sim = SIM[inst]
    if n.get('rpn') is not None:
        state['sens'] = float(n['rpn']) if sim['rpn'] else state['sens']
    if n.get('bend') is not None:
        state['frac'] = float(n['bendFraction'])
    rng = state['sens'] if sim['rpn'] else sim['rangeSt']
    cents = sim['tune'] + state['frac'] * 100.0 * rng
    if n.get('bendResetMs') is not None:
        state['after_frac'] = 0.0
    else:
        state['after_frac'] = state['frac']
    return cents


def render(S, wav):
    total_s = S['totalMs'] / 1000.0 + START + 3.0
    n = int(total_s * SR)
    x = np.random.default_rng(7).normal(0, 3e-4, n)
    truth = []
    states = {}
    for q in sorted(S['notes'], key=lambda q: q['tOnMs']):
        st = states.setdefault(q['inst'], {'sens': 2.0, 'frac': 0.0, 'after_frac': 0.0})
        st['frac'] = st['after_frac']                      # what the last slot left behind (the residue)
        cents = truth_for(q['inst'], q, st)
        on = q['tOnMs'] / 1000.0 + START
        off = q['tOffMs'] / 1000.0 + START
        ring = 0.45
        i0, i1 = int(on * SR), int((off + ring) * SR)
        if i1 > n:
            continue
        t = np.arange(i1 - i0) / SR
        dur = off - on
        lead = (q['tOnMs'] - q['tPreMs'])                  # the bend lands preMs before the note
        c = np.full_like(t, cents)
        if q.get('bend') is not None and lead < SCOOP_MS:  # (not the case at 300 ms - the machinery is kept from the tuba's test)
            c = cents + (0.0 - cents) * np.exp(-t / 0.045)
        f = midi_hz(q['pitch']) * 2.0 ** (c / 1200.0)
        phase = 2 * np.pi * np.cumsum(f) / SR
        env = np.where(t <= dur, 1.0, np.exp(-(t - dur) / 0.15)) * np.clip(t / 0.010, 0, 1)
        sig = np.zeros_like(t)
        for h, amp in enumerate([1.0, 0.55, 0.35, 0.22, 0.14, 0.09, 0.06, 0.04], start=1):
            sig += amp * np.sin(phase * h)
        x[i0:i1] += 0.20 * env * sig / 1.6
        truth.append({'inst': q['inst'], 'step': q['step'], 'pitch': q['pitch'], 'settledCents': round(cents, 1)})
    sf.write(wav, np.clip(x, -1, 1).astype(np.float32), SR)
    return truth


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'bend_schedule.json'))
    ap.add_argument('--keep', action='store_true')
    a = ap.parse_args()
    S = json.load(open(a.schedule, encoding='utf-8-sig'))
    tmp = tempfile.mkdtemp(prefix='bend_selftest_')
    wav = os.path.join(tmp, 'synthetic.wav')
    out = os.path.join(tmp, 'bend_ranges.json')
    ana = os.path.join(tmp, 'analysis.json')
    truth = render(S, wav)
    print(f"rendered {len(truth)} slots -> {wav} ({os.path.getsize(wav) / 1e6:.1f} MB)\n")
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'probes', 'analyze_bend.py'), wav, '--schedule', a.schedule, '--out', out, '--analysis', ana],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    sys.stdout.write(r.stdout)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        sys.exit('analyzer failed')
    B = json.load(open(out, encoding='utf-8'))
    got = {(x['inst'], x['step']): x for x in json.load(open(ana, encoding='utf-8'))['results']}

    TOL = 8.0
    fails, checked = [], 0
    print(f"\n{'player':<14}{'step':<7}{'injected':>10}{'measured':>10}{'err':>7}")
    print('-' * 50)
    for tr in truth:
        g = got.get((tr['inst'], tr['step']))
        if not g or g.get('verdict') in ('SILENT', None):
            fails.append(f"{tr['inst']} {tr['step']}: the analyzer found no audio")
            continue
        mes = g.get('settledCents')
        if mes is None:
            fails.append(f"{tr['inst']} {tr['step']}: no settled reading")
            continue
        err = abs(mes - tr['settledCents'])
        checked += 1
        flag = '' if err <= TOL else '   <-- FAIL'
        if err > TOL:
            fails.append(f"{tr['inst']} {tr['step']}: injected {tr['settledCents']:+.1f}, measured {mes:+.1f}")
        print(f"{tr['inst']:<14}{tr['step']:<7}{tr['settledCents']:>+10.1f}{mes:>+10.1f}{err:>7.1f}{flag}")

    print('\n--- derived per instrument vs the simulated instrument ---')
    ok = True
    for inst, sim in SIM.items():
        d = B['instruments'].get(inst)
        if not d:
            print(f"  {inst:<14} MISSING"); ok = False; continue
        good_r = d['rangeSt'] is not None and abs(d['rangeSt'] - sim['rangeSt']) <= 0.05
        good_rpn = d['rpnHonoured'] == sim['rpn']
        good_res = d['residueConfirmed'] is True
        good_rest = d['restoredOk'] is True
        good_base = d['baselineCents'] is not None and abs(d['baselineCents'] - sim['tune']) <= 5.0
        good_pre = d['prearmOk'] is True
        good_v = d['verdict'] == 'OK'
        line_ok = good_r and good_rpn and good_res and good_rest and good_base and good_pre and good_v
        ok = ok and line_ok
        print(f"  {inst:<14} range {str(d['rangeSt']):<6} want {sim['rangeSt']:<5} {'OK' if good_r else 'FAIL'} | rpn {str(d['rpnHonoured']):<5} want {str(sim['rpn']):<5} {'OK' if good_rpn else 'FAIL'}"
              f" | residue {str(d['residueCents']):<6} confirmed {str(d['residueConfirmed']):<5} {'OK' if good_res else 'FAIL'} | restored {str(d['restoredOk']):<5} {'OK' if good_rest else 'FAIL'}"
              f" | baseline {str(d['baselineCents']):<5} want {sim['tune']:<5} {'OK' if good_base else 'FAIL'} | prearm {'OK' if good_pre else 'FAIL'} | verdict {d['verdict']} {'OK' if good_v else 'FAIL'}"
              + (f" | rpn12 range {d['rpn12RangeSt']}" if d.get('rpn12RangeSt') else ''))
    off_ok = abs(B['offsetS'] - START) < 0.02
    print(f"  offset detected {B['offsetS']} s (true {START} s) {'OK' if off_ok else 'FAIL'}")
    ok = ok and off_ok

    if not a.keep:
        for f in (wav, out, ana):
            try: os.remove(f)
            except OSError: pass
        try: os.rmdir(tmp)
        except OSError: pass
    print(f"\n{checked} cents comparisons, {len(fails)} outside {TOL:.0f} cents")
    for f in fails[:15]:
        print('  ' + f)
    if fails or not ok:
        print('\nSELF-TEST FAILED'); sys.exit(1)
    print('\nSELF-TEST PASSED - the analyzer recovers every injected pitch within 8 cents and derives the range, the residue, the RPN verdict and the restore per instrument')


if __name__ == '__main__':
    main()
