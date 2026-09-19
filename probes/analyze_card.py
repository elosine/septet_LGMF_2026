#!/usr/bin/env python3
"""analyze_card.py - PLAN 1b.2 (2026-09-19): the INSTRUMENT CARD, measured off the rack.

    python probes/analyze_card.py <recording.wav> [--schedule probes/card_schedule.json]
                                  [--out bank/instrument_card.json]

Every level here is ABSOLUTE dBFS AT THE MASTER: REC has been at unity since 1b.0 and 1b.1 proved the
chain to three decimals (bank/reference.json). That is what makes these numbers comparable with the
K-20 target 1b.3 will set, and with any other studio's.

PER NOTE, FOUR THINGS - and the first two are the point of the step:

  maxMomentary   the loudest 400 ms, K-weighted: HOW IT SPEAKS. 0d measured only this, on a 1.2 s note.
  integrated     K-weighted RMS over the whole sounding note: HOW LOUD IT IS. For a wind these are
                 nearly equal; for the bowed vibraphone, whose bow is 20 dB down 7.4 s after its peak
                 (RUNNING_LOG §69), they are far apart - and balancing on the first is exactly why he
                 said "vibraphone is quiet".
  soundingS      onset to 40 dB below its own peak: the note's real life, measured rather than assumed.
  cents          f0 against the written pitch, by autocorrelation searched within +/-6 semitones of the
                 note that was asked for - so an octave error reads as an octave error, not as silence.
                 It is the check that would have caught the double bass a day earlier (1a.0 iv).

Bend notes (+50 % of full bend) are differenced against the unbent note of the same pitch and velocity
to give each instrument's REAL bend range in semitones - inferred until now for five of the seven (§74).
"""
import argparse, json, os, sys, datetime
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'probes'))
from analyze_balance import k_weight, level
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

DROP_DB = 40.0          # the note has stopped sounding once it is this far under its own peak
F0_WIN_S = 0.5
F0_AT_S = 0.6           # into the note: past the attack, inside the steady part


def dbv(x): return 20.0 * np.log10(max(float(x), 1e-12))


def env_db(x, sr, hop_ms=10):
    hop = max(1, int(sr * hop_ms / 1000)); n = len(x) // hop
    if n == 0: return np.array([-200.0]), hop
    e = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-18)
    return 20 * np.log10(e), hop


def kweighted_rms_db(seg, sr):
    """K-weighted RMS over the whole segment (Parseval on the plain spectrum, as analyze_balance.level does)"""
    if len(seg) < 64: return -200.0
    w = np.fft.rfftfreq(len(seg), 1 / sr)
    spec = np.fft.rfft(seg)
    p = np.sum((np.abs(spec) * k_weight(w)) ** 2) / len(seg)
    return dbv(np.sqrt(2 * p / len(seg) + 1e-18))


def f0_cents(seg, sr, pitch):
    """f0 by autocorrelation with parabolic interpolation, searched only within +/-6 semitones of the
    written note - the constraint that makes an octave error legible instead of plausible"""
    if len(seg) < int(sr * 0.05): return None, None
    want = 440.0 * 2 ** ((pitch - 69) / 12.0)
    lo, hi = want * 2 ** (-6 / 12.0), want * 2 ** (6 / 12.0)
    x = seg - np.mean(seg)
    if np.sqrt(np.mean(x * x)) < 1e-6: return None, None
    n = 1 << int(np.ceil(np.log2(len(x) * 2)))
    S = np.fft.rfft(x, n)
    ac = np.fft.irfft(S * np.conj(S), n)[:len(x)]
    if ac[0] <= 0: return None, None
    ac /= ac[0]
    t_lo, t_hi = int(sr / hi), min(len(ac) - 2, int(sr / lo))
    if t_hi <= t_lo + 1: return None, None
    k = int(np.argmax(ac[t_lo:t_hi])) + t_lo
    a, b, c = ac[k - 1], ac[k], ac[k + 1]
    d = a - 2 * b + c
    k_ref = k + (0.5 * (a - c) / d) if abs(d) > 1e-12 else k
    f = sr / k_ref
    return round(float(f), 3), round(float(1200 * np.log2(f / want)), 1)


ap = argparse.ArgumentParser()
ap.add_argument('wav')
ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'card_schedule.json'))
ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'instrument_card.json'))
a = ap.parse_args()

S = json.load(open(a.schedule, encoding='utf-8'))
notes = S['notes']
x, sr = sf.read(a.wav, always_2d=True, dtype='float64')
mono = x.mean(axis=1)
E, hop = env_db(mono, sr)
floor = float(np.percentile(E, 5))
thresh = floor + 12.0

first = np.argmax(E > thresh) if np.any(E > thresh) else 0
offset = first * hop / sr - notes[0]['tOnMs'] / 1000.0
print(f"{os.path.basename(a.wav)} — {len(x)/sr:.1f} s, {sr} Hz · noise floor {floor:.1f} dBFS · "
      f"schedule found at {offset:+.3f} s · {len(notes)} notes")

rows = []
for i, n in enumerate(notes):
    t0 = offset + n['tOnMs'] / 1000.0
    slot_end = offset + ((notes[i + 1]['tPreMs'] if i + 1 < len(notes) else S['totalMs']) / 1000.0) - 0.05
    i0, i1 = max(0, int(t0 * sr)), min(len(mono), int(slot_end * sr))
    if i1 - i0 < int(sr * 0.1):
        rows.append({**{k: n[k] for k in ('inst', 'label', 'role', 'pitch', 'vel', 'port', 'ch')}, 'found': False})
        continue
    seg = mono[i0:i1]
    e, h = env_db(seg, sr)
    on = int(np.argmax(e > thresh)) if np.any(e > thresh) else 0
    s0 = on * h
    body = seg[s0:]
    if len(body) < int(sr * 0.05) or np.max(np.abs(body)) < 10 ** (thresh / 20):
        rows.append({**{k: n[k] for k in ('inst', 'label', 'role', 'pitch', 'vel', 'port', 'ch')}, 'found': False})
        continue
    peak = float(np.max(np.abs(body)))
    eb, hb = env_db(body, sr)
    live = np.where(eb > dbv(peak) - DROP_DB)[0]
    end = min(len(body), (int(live[-1]) + 1) * hb) if len(live) else len(body)
    sounding = body[:end]
    flat_m, k_m = level(sounding, sr, True, win_s=0.4)
    # unpitched percussion has no f0: autocorrelation on a cymbal or a castanet returns the period of
    # whatever noise it locks onto, which reads as a huge 'pitch error' that means nothing. Only pitched notes.
    if n['role'] == 'perc':
        f0, cents = None, None
    else:
        f0, cents = f0_cents(body[int(sr * F0_AT_S):int(sr * (F0_AT_S + F0_WIN_S))], sr, n['pitch'])
    rows.append({**{k: n[k] for k in ('inst', 'label', 'role', 'pitch', 'vel', 'port', 'ch')},
                 'found': True, 'onsetS': round(i0 / sr + s0 / sr, 3),
                 'maxMomentaryDb': round(k_m, 2), 'maxMomentaryFlatDb': round(flat_m, 2),
                 'integratedDb': round(kweighted_rms_db(sounding, sr), 2),
                 'peakDbfs': round(dbv(peak), 2), 'soundingS': round(end / sr, 3),
                 'f0Hz': f0, 'centsOffWritten': cents,
                 **({'bendFraction': n['fraction']} if n.get('fraction') is not None else {})})

# ---- the card, per instrument ----
BAL = {}
for f in ('balance.json', 'balance_brass.json'):
    try:
        for I in json.load(open(os.path.join(ROOT, 'bank', f), encoding='utf-8'))['instruments']:
            BAL.setdefault(I['inst'], I)
    except Exception: pass
OFF = S.get('comparison', {}).get('expectedOffsetDb', 12.0)

card = {}
for r in rows:
    if not r['found']: continue
    c = card.setdefault(r['inst'], {'label': r['label'], 'port': r['port'], 'notes': [], 'bend': None})
    if r['role'] == 'bend': c['bend'] = r
    else: c['notes'].append(r)

print(f"\n{'instrument':17}{'vel':>5}{'maxMom':>9}{'integ':>8}{'M−I':>6}{'sound':>7}{'cents':>7}   0d+{OFF:.0f}  Δ")
out_inst = {}
for key, c in card.items():
    vels = sorted({r['vel'] for r in c['notes']})
    per_vel = {}
    for v in vels:
        sel = [r for r in c['notes'] if r['vel'] == v and r['role'] in ('card', 'perc')]
        if not sel: continue
        per_vel[str(v)] = {
            'maxMomentaryDb': round(float(np.mean([r['maxMomentaryDb'] for r in sel])), 2),
            'integratedDb': round(float(np.mean([r['integratedDb'] for r in sel])), 2),
            'soundingS': round(float(np.mean([r['soundingS'] for r in sel])), 2),
            'perPitch': {str(r['pitch']): {'maxMomentaryDb': r['maxMomentaryDb'], 'integratedDb': r['integratedDb'],
                                           'soundingS': r['soundingS'], 'centsOffWritten': r['centsOffWritten']} for r in sel},
        }
    b = BAL.get(key, {})
    old64, old127 = b.get('anchorDb'), b.get('fullDb')
    rec = {'label': c['label'], 'port': c['port'], 'byVelocity': per_vel,
           'compare0d': {'anchorDb': old64, 'fullDb': old127, 'expectedOffsetDb': OFF}}
    # the bend range, from the +50 % note against the unbent note of the same pitch and velocity
    if c['bend'] and c['bend'].get('centsOffWritten') is not None:
        ref = next((r for r in c['notes'] if r['pitch'] == c['bend']['pitch'] and r['vel'] == c['bend']['vel']
                    and r['centsOffWritten'] is not None), None)
        if ref:
            d = c['bend']['centsOffWritten'] - ref['centsOffWritten']
            rec['bend'] = {'pitch': c['bend']['pitch'], 'fraction': c['bend'].get('bendFraction', 0.5),
                           'centsMoved': round(d, 1), 'rangeSt': round(abs(d) / (100 * c['bend'].get('bendFraction', 0.5)), 3),
                           'unbentCents': ref['centsOffWritten'], 'bentCents': c['bend']['centsOffWritten']}
    out_inst[key] = rec

    for v in vels:
        pv = per_vel.get(str(v))
        if not pv: continue
        cts = [r['centsOffWritten'] for r in c['notes'] if r['vel'] == v and r['centsOffWritten'] is not None]
        cs = f"{np.mean(cts):+.0f}" if cts else '  —'
        cmp_s = ''
        if v == 64 and old64 is not None:
            cmp_s = f"  {old64 + OFF:+7.2f} {pv['maxMomentaryDb'] - (old64 + OFF):+6.2f}"
        elif v == 127 and old127 is not None:
            cmp_s = f"  {old127 + OFF:+7.2f} {pv['maxMomentaryDb'] - (old127 + OFF):+6.2f}"
        print(f"{(c['label'] if v == vels[0] else ''):17}{v:>5}{pv['maxMomentaryDb']:>9.2f}{pv['integratedDb']:>8.2f}"
              f"{pv['maxMomentaryDb'] - pv['integratedDb']:>6.1f}{pv['soundingS']:>7.2f}{cs:>7}{cmp_s}")

print('\nBEND RANGE, measured (+50 % of full bend against the same note unbent):')
for key, r in out_inst.items():
    if 'bend' in r:
        print(f"  {r['label']:17} {r['bend']['centsMoved']:+7.1f} c  →  {r['bend']['rangeSt']:.2f} semitones")

print('\nPITCH: any note more than 40 cents off its written pitch (0 expected; a bend note is excluded):')
bad = [r for r in rows if r['found'] and r['role'] != 'bend' and r['centsOffWritten'] is not None
       and abs(r['centsOffWritten']) > 40]
print('  none — every note sounds the pitch it was sent.' if not bad else
      '\n'.join(f"  {r['label']:17} note {r['pitch']:3} vel {r['vel']:3}  {r['centsOffWritten']:+.0f} c" for r in bad))

missing = [r for r in rows if not r['found']]
if missing:
    print(f"\nNOT FOUND ({len(missing)}): " + ', '.join(f"{r['label']} {r['pitch']}/{r['vel']}" for r in missing[:12]))

out = {'generatedAt': datetime.datetime.now().isoformat(timespec='seconds'), 'planItem': '1b.2', 'piece': 'lgmf',
       'recording': os.path.basename(a.wav), 'schedule': os.path.basename(a.schedule),
       'scheduleGeneratedAt': S.get('generatedAt'), 'sampleRate': sr,
       'scale': 'absolute dBFS at the master (REC at unity since 1b.0; the chain proven in bank/reference.json)',
       'reference': 'bank/reference.json', 'standard': S.get('standard'),
       'method': {'maxMomentary': 'loudest 400 ms, K-weighted (BS.1770 pre-filter) — how it speaks',
                  'integrated': 'K-weighted RMS over the whole sounding note — how loud it is',
                  'soundingS': f'onset to {DROP_DB:.0f} dB below the note\'s own peak',
                  'cents': 'f0 by autocorrelation, searched within ±6 semitones of the written pitch',
                  'noiseFloorDb': round(floor, 2), 'scheduleOffsetS': round(offset, 3)},
       'instruments': out_inst, 'notes': rows}
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump(out, open(a.out, 'w', encoding='utf-8'), indent=1)
print(f"\nwrote {os.path.relpath(a.out, ROOT)} — {sum(1 for r in rows if r['found'])}/{len(rows)} notes measured")
