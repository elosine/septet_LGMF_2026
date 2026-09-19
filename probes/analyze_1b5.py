#!/usr/bin/env python3
"""analyze_1b5.py - PLAN 1b.5 (2026-09-19): the ensemble verification.

    python probes/analyze_1b5.py <recording.wav> [--score scores/lgmf-1b5.json] [--out bank/verify_1b5.json]

The recording is the APP'S OWN playback (composer.html -> capture_composer_midi.js -> play_capture.ps1),
so what is measured here is the calibration as the piece will actually use it, not as a probe describes it.

THE PASS WAS WRITTEN DOWN BEFORE THE RUN, which is the only way it can fail:

  per part   every voice alone at fff within +/-1 dB of the 1b.3 target (-31.84 dB on the card's scale)
  spread     the eight parts within 3 dB of each other, at fff and at mf
  tutti      the full chord at fff at -20 LUFS-S +/- 2, and its true peak at or under -1 dBTP

Levels use the card's own measure - K-weighted RMS over the whole sounding note - so a number here is
directly comparable with bank/instrument_card.json. The tutti is read by ffmpeg's ebur128, the same
independent meter 1b.1 proved the chain against.
"""
import argparse, json, os, re, subprocess, sys, datetime
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'probes'))
from analyze_balance import k_weight
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

TARGET_DB = -31.84          # 1b.3: each voice at fff
TOL_PART = 1.0
TOL_SPREAD = 3.0
TUTTI_LUFS = -20.0
TOL_LUFS = 2.0
CEILING_DBTP = -1.0
DROP_DB = 40.0


def dbv(x): return 20.0 * np.log10(max(float(x), 1e-12))


def env_db(x, sr, hop_ms=10):
    hop = max(1, int(sr * hop_ms / 1000)); n = len(x) // hop
    if n == 0: return np.array([-200.0]), hop
    e = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-18)
    return 20 * np.log10(e), hop


def kw_rms_db(seg, sr):
    if len(seg) < 64: return -200.0
    f = np.fft.rfftfreq(len(seg), 1 / sr)
    spec = np.fft.rfft(seg)
    p = np.sum((np.abs(spec) * k_weight(f)) ** 2) / len(seg)
    return dbv(np.sqrt(2 * p / len(seg) + 1e-18))


def ebur128(path, start, dur):
    try:
        r = subprocess.run(['ffmpeg', '-nostats', '-hide_banner', '-ss', f'{start:.3f}', '-t', f'{dur:.3f}',
                            '-i', path, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'],
                           capture_output=True, text=True, timeout=300)
    except Exception as e:
        return {'error': str(e)}
    tail = r.stderr[r.stderr.rfind('Summary:'):] if 'Summary:' in r.stderr else r.stderr
    def grab(pat):
        m = re.search(pat, tail)
        return round(float(m.group(1)), 2) if m else None
    return {'lufs': grab(r'I:\s*(-?\d+\.?\d*)\s*LUFS'), 'truePeakDbtp': grab(r'Peak:\s*(-?\d+\.?\d*)\s*dBFS')}


ap = argparse.ArgumentParser()
ap.add_argument('wav')
ap.add_argument('--score', default=os.path.join(ROOT, 'scores', 'lgmf-1b5.json'))
ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'verify_1b5.json'))
a = ap.parse_args()

SC = json.load(open(a.score, encoding='utf-8'))
notes = [o for o in SC['objects'] if o.get('sonifyNote') is not None]
for n in notes:
    m = re.match(r'^(\S+)\s+·\s+(\S+)\s', n.get('performanceNotes', '') + ' ')
    n['_tag'] = m.group(1) if m else '?'
    n['_short'] = m.group(2) if m else '?'
notes.sort(key=lambda n: (n['startSeconds'], n['layer']))

x, sr = sf.read(a.wav, always_2d=True, dtype='float64')
mono = x.mean(axis=1)
E, hop = env_db(mono, sr)
floor = float(np.percentile(E, 5))
thresh = floor + 12.0
first = np.argmax(E > thresh) if np.any(E > thresh) else 0
offset = first * hop / sr - notes[0]['startSeconds']
print(f"{os.path.basename(a.wav)} — {len(x)/sr:.1f} s · floor {floor:.1f} dBFS · score found at {offset:+.3f} s · {len(notes)} notes")

# ---- the solo passes: one voice at a time ----
solo = {}
for n in notes:
    if not n['_tag'].startswith('solo'): continue
    t0 = offset + n['startSeconds']
    t1 = offset + n['endSeconds'] + 2.0
    i0, i1 = max(0, int(t0 * sr)), min(len(mono), int(t1 * sr))
    seg = mono[i0:i1]
    if len(seg) < int(sr * 0.2): continue
    e, h = env_db(seg, sr)
    on = int(np.argmax(e > thresh)) * h if np.any(e > thresh) else 0
    body = seg[on:]
    peak = float(np.max(np.abs(body)))
    eb, hb = env_db(body, sr)
    live = np.where(eb > dbv(peak) - DROP_DB)[0]
    end = min(len(body), (int(live[-1]) + 1) * hb) if len(live) else len(body)
    solo.setdefault(n['_tag'], []).append({
        'voice': n['_short'], 'pitch': n['sonifyNote'], 'lane': n['layer'],
        'integratedDb': round(kw_rms_db(body[:end], sr), 2), 'peakDbfs': round(dbv(peak), 2),
        'soundingS': round(end / sr, 2)})

checks = []
for tag in ['solo-fff', 'solo-mf']:
    rows = solo.get(tag, [])
    if not rows: continue
    vals = [r['integratedDb'] for r in rows]
    spread = max(vals) - min(vals)
    print(f"\n{tag.upper()} — each voice alone" + (f", against the target {TARGET_DB}" if tag.endswith('fff') else ""))
    print(f"  {'voice':7}{'pitch':>6}{'integrated':>12}{'peak':>9}" + ("      err" if tag.endswith('fff') else ""))
    for r in rows:
        err = r['integratedDb'] - TARGET_DB
        print(f"  {r['voice']:7}{r['pitch']:>6}{r['integratedDb']:>12.2f}{r['peakDbfs']:>9.2f}"
              + (f"{err:>+9.2f}" if tag.endswith('fff') else ""))
    print(f"  spread across the eight parts: {spread:.2f} dB")
    if tag.endswith('fff'):
        worst = max(abs(v - TARGET_DB) for v in vals)
        checks.append(('every part at fff within ±1 dB of target', worst <= TOL_PART, f'worst {worst:.2f} dB'))
    checks.append((f'{tag} spread ≤ {TOL_SPREAD} dB', spread <= TOL_SPREAD, f'{spread:.2f} dB'))

# ---- the tutti: the whole chord at four dynamics ----
tutti = {}
for n in notes:
    if not n['_tag'].startswith('tutti'): continue
    tutti.setdefault(n['_tag'], []).append(n)
print(f"\nTUTTI — all eight voices, read by ffmpeg ebur128")
print(f"  {'dynamic':10}{'LUFS':>9}{'true peak':>12}{'target':>10}")
rows_t = []
for tag, ns in sorted(tutti.items(), key=lambda kv: min(o['startSeconds'] for o in kv[1])):
    t0 = offset + min(o['startSeconds'] for o in ns) + 0.6
    t1 = offset + max(o['endSeconds'] for o in ns) - 0.3
    m = ebur128(a.wav, t0, max(0.5, t1 - t0))
    name = tag.split('-', 1)[1]
    tgt = f'{TUTTI_LUFS:.1f}' if name == 'fff' else ''
    print(f"  {name:10}{(m.get('lufs') if m.get('lufs') is not None else float('nan')):>9}"
          f"{(m.get('truePeakDbtp') if m.get('truePeakDbtp') is not None else float('nan')):>12}{tgt:>10}")
    rows_t.append({'dynamic': name, 'startS': round(t0, 2), 'endS': round(t1, 2), **m})

fff = next((r for r in rows_t if r['dynamic'] == 'fff'), None)
if fff and fff.get('lufs') is not None:
    checks.append((f'tutti fff at {TUTTI_LUFS} LUFS ±{TOL_LUFS}', abs(fff['lufs'] - TUTTI_LUFS) <= TOL_LUFS, f"{fff['lufs']} LUFS"))
if fff and fff.get('truePeakDbtp') is not None:
    checks.append((f'tutti fff true peak ≤ {CEILING_DBTP} dBTP', fff['truePeakDbtp'] <= CEILING_DBTP, f"{fff['truePeakDbtp']} dBTP"))

print('\nTHE PASS, as written before the run:')
for what, ok, read in checks:
    print(f"  {'PASS' if ok else 'FAIL'}  {what:44} {read}")
allok = all(ok for _, ok, _ in checks)
print('\n' + ('1b.5 PASSES — the calibration holds through the app\u2019s own path.'
              if allok else '1b.5 FAILS — see the checks above.'))

out = {'generatedAt': datetime.datetime.now().isoformat(timespec='seconds'), 'planItem': '1b.5', 'piece': 'lgmf',
       'recording': os.path.basename(a.wav), 'score': os.path.basename(a.score),
       'path': 'composer.html (headless) → capture_composer_midi.js → play_capture.ps1 → the rack → REC',
       'target': {'perVoiceDb': TARGET_DB, 'tuttiLufs': TUTTI_LUFS, 'ceilingDbtp': CEILING_DBTP,
                  'tolPartDb': TOL_PART, 'tolSpreadDb': TOL_SPREAD, 'tolLufsDb': TOL_LUFS},
       'solo': solo, 'tutti': rows_t,
       'checks': [{'what': w, 'pass': bool(o), 'read': r} for w, o, r in checks], 'pass': bool(allok)}
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump(out, open(a.out, 'w', encoding='utf-8'), indent=1)
print(f"wrote {os.path.relpath(a.out, ROOT)}")
sys.exit(0 if allok else 1)
