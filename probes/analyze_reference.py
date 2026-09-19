#!/usr/bin/env python3
"""analyze_reference.py - PLAN 1b.1 (2026-09-19): read the calibration reference back off the rack.

    python probes/analyze_reference.py <recording.wav> [--out bank/reference.json]

The recording is the rack's REC track (unity since 1b.0, so it IS the master sum) capturing the REF
track's two items. This finds them, measures them three ways, and says PASS or FAIL against what the
generator wrote - which is the whole point: until the meter reads a known signal correctly, no
measurement of an instrument means anything.

THREE MEASUREMENTS, because each proves something the others cannot:
  flat RMS, per channel   the digital chain's gain, exactly. -20.00 dBFS in, -20.00 dBFS out = unity.
  BS.1770 (ffmpeg ebur128) the industry meter, INDEPENDENT of this repo's code - integrated LUFS and
                          true peak. A 1 kHz sine at -20 dBFS RMS in two correlated channels is
                          -17.0 LUFS and -17.0 dBTP by definition, so this is an absolute check.
  K-weighted RMS          probes/analyze_balance.py's own core, the number 0d's trims are made of, so
                          this run and every earlier one stay comparable.

The TONE is the pass/fail (its expected values are exact). The NOISE is the monitor reference: its
level is what he sets the system volume by, and its LUFS is recorded, not asserted.
"""
import argparse, json, os, re, subprocess, sys, datetime
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'probes'))
from analyze_balance import level                      # the loudness core, unchanged since #5
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

EXPECT_RMS = -20.00          # what tools/make_reference_audio.js writes, per channel
EXPECT_TONE_LUFS = -17.0     # a -20 dBFS RMS sine, correlated stereo: -20.0 mono + 3.01
EXPECT_TONE_TP = -17.0       # a sine's true peak is its RMS + 3.01
TOL_RMS, TOL_LUFS = 0.10, 0.30


def dbfs(x): return 20 * np.log10(max(float(x), 1e-12))


def regions(mono, sr, floor_db=-50.0, min_s=5.0, gap_s=0.5):
    """contiguous stretches louder than floor_db, at least min_s long, gaps under gap_s bridged"""
    hop = int(sr * 0.01)
    n = len(mono) // hop
    env = 20 * np.log10(np.sqrt(np.mean(mono[:n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-12)
    on = env > floor_db
    out, i = [], 0
    while i < n:
        if not on[i]:
            i += 1; continue
        j = i
        while j < n:
            if on[j]: j += 1; continue
            k = j
            while k < n and not on[k] and (k - j) * 0.01 < gap_s: k += 1
            if k < n and on[k]: j = k
            else: break
        if (j - i) * 0.01 >= min_s: out.append((i * hop / sr, j * hop / sr))
        i = j + 1
    return out


def is_tone(seg, sr):
    """a 1 kHz sine puts nearly all its energy in one bin; pink noise does not"""
    w = seg[:int(sr * 2)]
    spec = np.abs(np.fft.rfft(w * np.hanning(len(w))))
    f = np.fft.rfftfreq(len(w), 1 / sr)
    band = (f > 950) & (f < 1050)
    return float(np.sum(spec[band] ** 2) / (np.sum(spec ** 2) + 1e-18)) > 0.9


def ebur128(path, start, dur):
    """integrated LUFS and true peak of one slice, by ffmpeg - a meter this repo did not write"""
    try:
        p = subprocess.run(['ffmpeg', '-nostats', '-hide_banner', '-ss', f'{start:.3f}', '-t', f'{dur:.3f}',
                            '-i', path, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'],
                           capture_output=True, text=True, timeout=300)
    except Exception as e:
        return {'error': str(e)}
    txt = p.stderr
    tail = txt[txt.rfind('Summary:'):] if 'Summary:' in txt else txt
    def grab(pat):
        m = re.search(pat, tail)
        return round(float(m.group(1)), 2) if m else None
    return {'lufs': grab(r'I:\s*(-?\d+\.?\d*)\s*LUFS'), 'truePeakDbtp': grab(r'Peak:\s*(-?\d+\.?\d*)\s*dBFS')}


ap = argparse.ArgumentParser()
ap.add_argument('wav')
ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'reference.json'))
a = ap.parse_args()

x, sr = sf.read(a.wav, always_2d=True, dtype='float64')
mono = x.mean(axis=1)
found = regions(mono, sr)
print(f'{os.path.basename(a.wav)} — {len(x)/sr:.1f} s, {sr} Hz, {x.shape[1]} ch — {len(found)} region(s) above −50 dBFS')
if len(found) != 2:
    print('EXPECTED TWO REGIONS (30 s noise, 30 s tone). Found: '
          + ', '.join(f'{s:.1f}–{e:.1f} s' for s, e in found))
    sys.exit(2)

rows, verdicts = [], []
for s, e in found:
    i0, i1 = int(s * sr), int(e * sr)
    pad = int((i1 - i0) * 0.10)                                  # the steady middle 80%: never an edge
    i0, i1 = i0 + pad, i1 - pad
    seg, segm = x[i0:i1, :], mono[i0:i1]
    kind = 'tone' if is_tone(segm, sr) else 'pink'
    ch = [round(dbfs(np.sqrt(np.mean(seg[:, c] ** 2))), 3) for c in range(seg.shape[1])]
    _, k = level(segm, sr, True, win_s=0.4)
    eb = ebur128(a.wav, i0 / sr, (i1 - i0) / sr)
    peak = round(dbfs(np.max(np.abs(seg))), 2)
    r = {'kind': kind, 'startS': round(s, 2), 'endS': round(e, 2), 'measuredOverS': round((i1 - i0) / sr, 2),
         'rmsDbfsPerChannel': ch, 'rmsDbfs': round(float(np.mean(ch)), 3), 'kWeightedRmsDbfs': round(k, 2),
         'samplePeakDbfs': peak, 'lufs': eb.get('lufs'), 'truePeakDbtp': eb.get('truePeakDbtp')}
    drms = r['rmsDbfs'] - EXPECT_RMS
    r['rmsDeltaDb'] = round(drms, 3)
    checks = [('flat RMS', abs(drms) <= TOL_RMS, f"{r['rmsDbfs']:+.2f} vs {EXPECT_RMS:+.2f} dBFS")]
    if kind == 'tone':
        dl = (r['lufs'] - EXPECT_TONE_LUFS) if r['lufs'] is not None else None
        dp = (r['truePeakDbtp'] - EXPECT_TONE_TP) if r['truePeakDbtp'] is not None else None
        r['lufsDeltaDb'] = round(dl, 2) if dl is not None else None
        checks += [('BS.1770 LUFS', dl is not None and abs(dl) <= TOL_LUFS, f"{r['lufs']} vs {EXPECT_TONE_LUFS} LUFS"),
                   ('true peak', dp is not None and abs(dp) <= TOL_LUFS, f"{r['truePeakDbtp']} vs {EXPECT_TONE_TP} dBTP")]
    r['checks'] = [{'what': w, 'pass': bool(ok), 'read': d} for w, ok, d in checks]
    r['pass'] = all(ok for _, ok, _ in checks)
    verdicts.append(r['pass'])
    rows.append(r)

    print(f"\n  {kind.upper():5} {s:7.1f}–{e:.1f} s   flat RMS {r['rmsDbfs']:+.3f} dBFS "
          f"(L {ch[0]:+.3f} / R {ch[-1]:+.3f})   K-weighted {k:+.2f}   LUFS {r['lufs']}   "
          f"true peak {r['truePeakDbtp']} dBTP   sample peak {peak:+.2f}")
    for w, ok, d in checks:
        print(f"        {'PASS' if ok else 'FAIL'}  {w:14} {d}")

ok = all(verdicts) and len(rows) == 2
print('\n' + ('THE CHAIN AND THE METER ARE PROVEN — 1b.1 PASSES.' if ok else 'FAIL — the chain is not unity, or the meter is not reading what it should.'))
if ok:
    pink = next((r for r in rows if r['kind'] == 'pink'), None)
    if pink:
        print(f"\nTHE MONITOR REFERENCE: play REF\u2019s pink noise at 600 s and set the system volume there, ONCE.")
        print(f"  it is {pink['rmsDbfs']:+.2f} dBFS RMS / {pink['lufs']} LUFS at the master. That setting is K-20:")
        print(f"  from it, a tutti fff reaching \u22121 dBTP is ~19 dB louder than this noise, and never clips.")

out = {'generatedAt': datetime.datetime.now().isoformat(timespec='seconds'), 'planItem': '1b.1',
       'piece': 'lgmf', 'standard': 'K-20 (Katz / SMPTE RP 200); loudness ITU-R BS.1770 (LUFS), ceiling dBTP',
       'recording': os.path.basename(a.wav), 'sampleRate': sr, 'channels': int(x.shape[1]),
       'expected': {'rmsDbfs': EXPECT_RMS, 'toneLufsStereo': EXPECT_TONE_LUFS, 'toneTruePeakDbtp': EXPECT_TONE_TP,
                    'toleranceDb': {'rms': TOL_RMS, 'lufs': TOL_LUFS}},
       'source': {'generator': 'tools/make_reference_audio.js', 'seed': 20260919,
                  'files': ['probes/reference/pink-20dBFS.wav', 'probes/reference/tone1k-20dBFS.wav']},
       'chain': 'REF (unity) -> master -> REC (unity since 1b.0; post-fader output, so the file IS the master sum)',
       'regions': rows, 'pass': bool(ok),
       'note': 'The TONE is the pass/fail: its expected readings are exact by definition. The NOISE is the monitor '
               'reference the system volume is set by, and its LUFS is measured, not asserted. Re-run through '
               'tools/qc_rack.js (1b.6) after any change to the rack.'}
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump(out, open(a.out, 'w', encoding='utf-8'), indent=1)
print(f"\nwrote {os.path.relpath(a.out, ROOT)}")
sys.exit(0 if ok else 1)
