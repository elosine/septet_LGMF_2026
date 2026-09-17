#!/usr/bin/env python3
"""analyze_bend.py - the PITCH-BEND probe's analyzer (PLAN 1f step 1, the palette, 2026-09-07).

Pairs a recording of probes/bend_schedule.json (built by `node tools/balance_schedule.js --bend`, played by
probes/balance_probe.ps1 through tools/probe_run.sh) with the schedule and reports, per note, the pitch that actually
sounded in CENTS against the written MIDI note. From the eight slots per player it derives what the beating tool needs:

    rangeSt          the sampler's pitch-bend range in semitones per full bend (the measured cents / the fraction sent,
                     the unbent reference subtracted; the median of +50 % / +100 % / -100 %, the spread reported)
    residueCents     what a bend left unreset does to the NEXT note (the trap the tick's resetMorphBend guards against)
    scoopCents       onset vs settled at the prelude's lead - is 300 ms enough for the note to START at pitch?
    rpnHonoured      does RPN 0 (pitch-bend sensitivity) change the range, i.e. can MIDI widen it?
    restoredOk       after RPN 0 back to 2, is full bend what it was before?

METHOD (the tuba piece's probes/analyze_bend_probe.py, whose self-test proved it to 8 cents): f0 by energy-normalised
autocorrelation with parabolic peak interpolation, searched ONLY within +/-6 semitones of the written pitch - blind pitch
detection octave-errors, and an octave error would read as a catastrophic bend. The RPN slots get a second band an
octave up (+12 semitones is where an honoured RPN 0 = 12 puts full bend): a periodic tone at 2f also peaks at the lag of
f, so the normal band alone would read an honoured RPN as "nothing happened".

    python probes/analyze_bend.py <recording.wav> [--schedule probes/bend_schedule.json]
                                  [--out bank/bend_ranges.json] [--analysis probes/last_bend_analysis.json] [--offset s]

Writes bank/bend_ranges.json (per instrument, with provenance) and probes/last_bend_analysis.json (every slot's readings).
Then `node tools/apply_bend_ranges.js` writes the measured ranges into sandbox/instruments.js (bendRangeSt per instrument).
"""
import argparse
import datetime
import json
import os
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

WIN_MS = 20             # RMS envelope window
HOP_MS = 10
FLOOR_MARGIN_DB = 12    # "sounding" gate above the measured noise floor ...
PEAK_MARGIN_DB = 35     # ... and never further than this below the loudest frame (Reaper writes digital silence between notes)
ONSET_TOL_S = 1.0       # allowed drift between the scheduled and the detected onset
SEARCH_ST = 6.0         # f0 search half-width, semitones around the nominal
F0_HOP_MS = 10
MIN_PERIODS = 4         # analysis window = this many periods of the nominal f0
CONF_MIN = 0.30         # normalised autocorrelation peak below this = unvoiced
RPN_CONF = 0.60         # the octave-up band must be this confident to be believed (an honoured RPN)
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def note_name(m):
    return NAMES[int(m) % 12] + str(int(m) // 12 - 1)


def midi_hz(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def envelope(x, sr):
    win = max(1, int(sr * WIN_MS / 1000))
    hop = max(1, int(sr * HOP_MS / 1000))
    n = 1 + max(0, (len(x) - win) // hop)
    rms = np.empty(n)
    for i in range(n):
        seg = x[i * hop: i * hop + win]
        rms[i] = np.sqrt(np.mean(seg * seg) + 1e-12)
    t = (np.arange(n) * hop + win / 2) / sr
    return t, 20 * np.log10(rms + 1e-12)


def f0_at(x, sr, start_s, dur_s, nominal_hz, search_st=SEARCH_ST):
    """One f0 estimate over [start_s, start_s+dur_s). Returns (hz, confidence)."""
    i0 = int(start_s * sr)
    n = int(dur_s * sr)
    if i0 < 0 or i0 + n > len(x) or n < 64:
        return None, 0.0
    seg = x[i0: i0 + n].astype(np.float64)
    seg = seg - seg.mean()
    if np.sqrt(np.mean(seg * seg)) < 1e-6:
        return None, 0.0
    # raw autocorrelation via FFT, ENERGY-NORMALISED per lag (the YIN term) - an unwindowed, unnormalised r[L] tapers with
    # the lag and reads every note sharp (+10.9 cents at MIDI 46 on the tuba's self-test)
    N = len(seg)
    nfft = 1 << (2 * N - 1).bit_length()
    spec = np.fft.rfft(seg, nfft)
    ac = np.fft.irfft(spec * np.conj(spec), nfft)[:N]
    if ac[0] <= 0:
        return None, 0.0
    lo_hz = nominal_hz * 2.0 ** (-search_st / 12.0)
    hi_hz = nominal_hz * 2.0 ** (search_st / 12.0)
    lag_min = max(2, int(sr / hi_hz))
    lag_max = min(N - 3, int(sr / lo_hz))
    if lag_max <= lag_min + 1:
        return None, 0.0
    sq = seg * seg
    csum = np.concatenate(([0.0], np.cumsum(sq)))
    lags = np.arange(0, lag_max + 2)
    e_head = csum[N - lags] - csum[0]
    e_tail = csum[N] - csum[lags]
    norm = np.sqrt(np.maximum(e_head * e_tail, 1e-30))
    acn = ac[: lag_max + 2] / norm
    band = acn[lag_min: lag_max + 1]
    k = int(np.argmax(band)) + lag_min
    conf = float(np.clip(acn[k], 0.0, 1.0))
    y0, y1, y2 = acn[k - 1], acn[k], acn[k + 1]
    denom = y0 - 2 * y1 + y2
    delta = 0.0 if denom == 0 else 0.5 * (y0 - y2) / denom
    lag = k + float(np.clip(delta, -1.0, 1.0))
    edge = (k <= lag_min + 1) or (k >= lag_max - 1)
    return (sr / lag if lag > 0 else None), (0.0 if edge else conf)


def f0_track(x, sr, t_start, t_end, nominal_hz, search_st=SEARCH_ST):
    win_s = max(MIN_PERIODS / nominal_hz, 0.020)
    hop_s = F0_HOP_MS / 1000.0
    ts, hz, cf = [], [], []
    t = t_start
    while t + win_s <= t_end:
        f, c = f0_at(x, sr, t, win_s, nominal_hz, search_st)
        ts.append(t + win_s / 2)
        hz.append(f if f else np.nan)
        cf.append(c)
        t += hop_s
    return np.array(ts), np.array(hz, dtype=float), np.array(cf)


def stable_cents(ts, hz, conf, nominal_hz, t_lo, t_hi, conf_min=CONF_MIN):
    """Median cents over a window, ignoring low-confidence frames. Returns (cents, frames, median confidence)."""
    m = (ts >= t_lo) & (ts < t_hi) & (conf >= conf_min) & np.isfinite(hz)
    if not m.any():
        return None, 0, 0.0
    c = 1200.0 * np.log2(hz[m] / nominal_hz)
    return float(np.median(c)), int(m.sum()), float(np.median(conf[m]))


def r1(v):
    return None if v is None else round(float(v), 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('wav')
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'bend_schedule.json'))
    ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'bend_ranges.json'))
    ap.add_argument('--analysis', default=os.path.join(ROOT, 'probes', 'last_bend_analysis.json'))
    ap.add_argument('--offset', type=float, default=None, help='where the schedule\'s t=0 sits in the file, in s (default: found from the onset train)')
    a = ap.parse_args()

    S = json.load(open(a.schedule, encoding='utf-8-sig'))
    if not S.get('bend'):
        sys.exit('not a bend schedule (build one with: node tools/balance_schedule.js --bend)')
    notes = sorted(S['notes'], key=lambda n: n['tOnMs'])
    x, sr = sf.read(a.wav, always_2d=True)
    x = x.mean(axis=1)
    span = len(x) / sr
    t_env, env_db = envelope(x, sr)
    floor_db = float(np.percentile(env_db, 10))
    peak_db = float(env_db.max())
    thresh = max(floor_db + FLOOR_MARGIN_DB, peak_db - PEAK_MARGIN_DB)
    above = env_db > thresh
    if not above.any():
        sys.exit('no audio above the gate - the wrong file, or a silent take')

    # ALIGNMENT by the onset train against the schedule, not the first threshold crossing (one blip before the first
    # note would shift every label)
    onsets = np.where(above[1:] & ~above[:-1])[0] + 1
    det = []
    for i in onsets:
        if not det or t_env[i] - det[-1] > 0.25:
            det.append(float(t_env[i]))
    det_arr = np.array(det)
    exp = np.array([n['tOnMs'] / 1000.0 for n in notes])
    if a.offset is None:
        grid = 0.01
        cand = np.arange(0.0, max(grid, span - exp.max() + 2.0), grid)
        best_off, best_score = 0.0, -1
        for off in cand:
            want = exp + off
            idx = np.clip(np.searchsorted(det_arr, want), 1, len(det_arr) - 1)
            near = np.minimum(np.abs(det_arr[idx] - want), np.abs(det_arr[idx - 1] - want))
            score = int((near < 0.12).sum())
            if score > best_score:
                best_score, best_off = score, float(off)
        # the grid search stops at the FIRST offset that matches every slot within 120 ms, which is up to 120 ms early;
        # refine by the median residual of the matched onsets (the gate crossing sits 10-20 ms after the true onset)
        want = exp + best_off
        idx = np.clip(np.searchsorted(det_arr, want), 1, len(det_arr) - 1)
        d1, d0 = det_arr[idx] - want, det_arr[idx - 1] - want
        res = np.where(np.abs(d1) < np.abs(d0), d1, d0)
        m = np.abs(res) < 0.12
        t0 = best_off + (float(np.median(res[m])) if m.any() else 0.0)
    else:
        t0, best_score = a.offset, None
    print(f"{os.path.basename(a.wav)}: {span:.1f} s @ {sr} Hz | floor {floor_db:.1f} dB, peak {peak_db:.1f} dB, gate {thresh:.1f} dB | "
          f"{len(det)} onsets for {len(notes)} slots | schedule t=0 at {t0:.2f} s" + (f" ({best_score}/{len(notes)} matched within 120 ms)" if best_score is not None else ''))
    if best_score is not None and best_score < 0.8 * len(notes):
        print('WARNING: fewer than 80 % of the slots matched - the alignment is suspect; check the sender log before believing a label')

    results = []
    for n in notes:
        on_s = t0 + n['tOnMs'] / 1000.0
        off_s = t0 + n['tOffMs'] / 1000.0
        nominal = midi_hz(n['pitch'])
        r = {k: n.get(k) for k in ('i', 'inst', 'label', 'step', 'what', 'tech', 'port', 'ch', 'pitch', 'tOnMs', 'tOffMs', 'bend', 'bendFraction', 'rpn', 'bendResetMs')}
        i_lo = np.searchsorted(t_env, on_s - ONSET_TOL_S)
        i_hi = np.searchsorted(t_env, on_s + ONSET_TOL_S)
        seg = above[i_lo:i_hi]
        if not seg.any():
            r['verdict'] = 'SILENT'
            results.append(r)
            continue
        onset_t = float(t_env[i_lo + int(np.argmax(seg))])
        r['onsetDriftSec'] = round(onset_t - on_s, 3)
        t_end = min(off_s + 1.5, span)
        ts, hz, cf = f0_track(x, sr, onset_t, t_end, nominal)
        mid_lo = onset_t + 0.30
        mid_hi = max(mid_lo + 0.10, off_s - 0.15)
        c_on, n_on, _ = stable_cents(ts, hz, cf, nominal, onset_t, onset_t + 0.08)
        c_mid, n_mid, conf_mid = stable_cents(ts, hz, cf, nominal, mid_lo, mid_hi)
        c_tail, n_tail, _ = stable_cents(ts, hz, cf, nominal, off_s + 0.02, off_s + 0.60)
        r['band'] = 'nominal'
        if n.get('rpn') is not None:
            # the octave-up band: an honoured RPN 0 = 12 puts full bend a whole octave up, where the nominal band reads the
            # sub-harmonic instead; believe the upper band only when it is confident on its own
            ts2, hz2, cf2 = f0_track(x, sr, onset_t, t_end, nominal * 2.0)
            c2, n2, conf2 = stable_cents(ts2, hz2, cf2, nominal, mid_lo, mid_hi, RPN_CONF)
            r['octaveBandCents'] = r1(c2)
            r['octaveBandConf'] = round(conf2, 2)
            r['octaveBandFrames'] = n2
            if c2 is not None and n2 >= 3 and c2 > 600.0:
                c_mid, n_mid, conf_mid = c2, n2, conf2
                r['band'] = 'octave-up'
                c_on = stable_cents(ts2, hz2, cf2, nominal, onset_t, onset_t + 0.08, RPN_CONF)[0]
                c_tail = stable_cents(ts2, hz2, cf2, nominal, off_s + 0.02, off_s + 0.60, RPN_CONF)[0]
        r['framesVoiced'] = int(n_mid)
        r['confidence'] = round(conf_mid, 2)
        r['onsetCents'] = r1(c_on)
        r['settledCents'] = r1(c_mid)
        r['tailCents'] = r1(c_tail)
        r['scoopCents'] = None if (c_on is None or c_mid is None) else round(c_mid - c_on, 1)
        r['verdict'] = 'OK' if n_mid >= 3 else 'WEAK'
        results.append(r)

    # ---- per instrument: the derivations ----
    by_inst = {}
    for r in results:
        by_inst.setdefault(r['inst'], []).append(r)
    inst_out = {}
    print()
    print(f"{'player':<14}{'pitch':<7}{'ref c':>7}{'+50 c':>8}{'+100 c':>8}{'-100 c':>8}{'range st':>10}{'spread':>8}{'residue':>9}{'scoop':>7}{'rpn12 c':>9}{'rest c':>8}  verdict")
    print('-' * 118)
    for inst, rows in by_inst.items():
        S_ = {r['step']: r for r in rows}
        get = lambda step: (S_.get(step) or {}).get('settledCents')
        ref = get('ref')
        base = ref if ref is not None else 0.0
        meas = []
        for step in ('+50', '+100', '-100'):
            r = S_.get(step)
            if not r or r.get('settledCents') is None or not r.get('bendFraction'):
                continue
            rel = r['settledCents'] - base
            meas.append({'step': step, 'fraction': r['bendFraction'], 'settledCents': r['settledCents'], 'relCents': round(rel, 1),
                         'derivedRangeSt': round(abs(rel / (r['bendFraction'] * 100.0)), 3)})
        rng = [m['derivedRangeSt'] for m in meas]
        range_st = round(float(np.median(rng)), 2) if rng else None
        spread = round(max(rng) - min(rng), 2) if rng else None
        dead = bool(rng) and all(abs(m['relCents']) < 5.0 for m in meas)
        # the residue: the note after an unreset +50 % bend, against the reference; real if most of the bent amount stayed
        res_a, res_b = get('res_a'), get('res_b')
        residue = None if (res_b is None) else round(res_b - base, 1)
        bent_a = None if (res_a is None) else res_a - base
        residue_confirmed = None if (residue is None or bent_a is None) else bool(abs(residue) > 5.0 and abs(residue) >= 0.5 * abs(bent_a))
        # the pre-arm: the +100 slot's onset against its settled reading, LESS the unbent reference's own attack behaviour — a reed
        # starts sharp and a bow flat for the first 80 ms whatever the bend (the real take of 2026-09-07: bass clarinet +14 c, the
        # strings −5 to −10 c on the reference itself); a bend that landed late would show as tens of cents beyond that
        ref_scoop = (S_.get('ref') or {}).get('scoopCents')
        raw_scoop = (S_.get('+100') or {}).get('scoopCents')
        scoop = None if (raw_scoop is None or ref_scoop is None) else round(raw_scoop - ref_scoop, 1)
        prearm_ok = None if scoop is None else bool(abs(scoop) <= 10.0)
        # RPN 0: honoured if full bend after asking for 12 st reads far wider than full bend before
        full, rpn12, rest = get('+100'), get('rpn12'), get('rest')
        rpn_honoured = None
        rpn12_range = None
        if rpn12 is not None and full is not None:
            rpn_honoured = bool(abs(rpn12 - base) > 1.5 * max(abs(full - base), 5.0))
            r12 = S_['rpn12']
            if rpn_honoured and r12.get('bendFraction'):
                rpn12_range = round(abs((rpn12 - base) / (r12['bendFraction'] * 100.0)), 2)
        restored_ok = None if (rest is None or full is None) else bool(abs(rest - full) <= 10.0)
        silent = [r['step'] for r in rows if r.get('verdict') == 'SILENT']
        weak = [r['step'] for r in rows if r.get('verdict') == 'WEAK']
        if silent:
            verdict = 'SILENT ' + ' '.join(silent)
        elif range_st is None:
            verdict = 'NO RANGE'
        elif dead:
            verdict = 'BEND DEAD'
        elif spread is not None and spread > 0.4:
            verdict = 'NOT LINEAR'
        else:
            verdict = 'OK'
        if weak:
            verdict += ' (weak: ' + ' '.join(weak) + ')'
        head = rows[0]
        inst_out[inst] = {
            'label': head.get('label'), 'tech': head.get('tech'), 'port': head.get('port'), 'ch': head.get('ch'), 'pitch': head.get('pitch'),
            'note': note_name(head.get('pitch')), 'baselineCents': r1(ref),
            'rangeSt': range_st, 'rangeSpreadSt': spread, 'linear': (None if spread is None else bool(spread <= 0.4)), 'bendDead': dead,
            'measurements': meas,
            'residueCents': residue, 'residueConfirmed': residue_confirmed,
            'scoopCents': scoop, 'attackScoopCents': r1(ref_scoop), 'scoopRawCents': r1(raw_scoop), 'prearmOk': prearm_ok, 'bendLeadMs': (S.get('bendPlan') or {}).get('bendLeadMs'),
            'rpnHonoured': rpn_honoured, 'rpn12RangeSt': rpn12_range, 'restoredOk': restored_ok, 'mutableByMidi': rpn_honoured,
            'rpn12Cents': r1(None if rpn12 is None else rpn12 - base), 'restCents': r1(None if rest is None else rest - base),
            'verdict': verdict,
        }
        f = lambda v: '-' if v is None else f"{v:+.1f}"
        print(f"{head.get('label', inst):<14}{note_name(head.get('pitch')) + '(' + str(head.get('pitch')) + ')':<7}{f(ref):>7}{f(get('+50')):>8}{f(get('+100')):>8}{f(get('-100')):>8}"
              f"{('-' if range_st is None else f'{range_st:.2f}'):>10}{('-' if spread is None else f'{spread:.2f}'):>8}{f(residue):>9}{f(scoop):>7}{f(get('rpn12')):>9}{f(get('rest')):>8}  {verdict}"
              + ('' if rpn_honoured is None else ('  RPN honoured' if rpn_honoured else '  RPN ignored')) + ('' if restored_ok is None or restored_ok else '  NOT RESTORED - reload the instrument'))

    bank = {
        'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'),
        'wav': os.path.basename(a.wav),
        'schedule': os.path.relpath(a.schedule, ROOT).replace(chr(92), '/'),
        'scheduleGeneratedAt': S.get('generatedAt'),
        'offsetS': round(t0, 3),
        'gateDb': round(thresh, 1),
        'method': 'f0 by energy-normalised autocorrelation within +/-6 semitones of the written note (the RPN slots also an octave up); '
                  'rangeSt = median over +50 / +100 / -100 % of |measured cents - reference| / fraction; residue = the plain note after an '
                  'unreset +50 % bend; RPN honoured if full bend after RPN 0 = 12 reads > 1.5x full bend before; restored if the last slot '
                  'is within 10 c of +100 %; scoop = the +100 slot\'s onset-vs-settled less the reference\'s own (the attack\'s wobble), '
                  'pre-arm OK within 10 c',
        'bendPlan': S.get('bendPlan'),
        'instruments': inst_out,
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(bank, open(a.out, 'w', encoding='utf-8'), indent=1)
    json.dump({'wav': a.wav, 'schedule': a.schedule, 'offsetS': t0, 'gateDb': thresh, 'results': results},
              open(a.analysis, 'w', encoding='utf-8'), indent=1)
    n_sil = sum(1 for r in results if r.get('verdict') == 'SILENT')
    print(f"\n{len(results)} slots: {len(results) - n_sil} sounded, {n_sil} silent -> {os.path.relpath(a.out, ROOT)} and {os.path.relpath(a.analysis, ROOT)}")
    print('next: node tools/apply_bend_ranges.js   (writes bendRangeSt per instrument into sandbox/instruments.js)')


if __name__ == '__main__':
    main()
