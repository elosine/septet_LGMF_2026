#!/usr/bin/env python3
"""analyze_lgmf_balance.py - measure the Lake George balance recording (PLAN 0d.3).

    python probes/analyze_lgmf_balance.py <recording.wav>
           [--schedule probes/balance_schedule.json] [--weight k|flat]
           [--target quietest|-24] [--out bank/balance.json]

The recording is the rack's REC track (0d.1), started BEFORE probes/balance_probe.ps1 and
stopped after it. The timetable says when every note was played; the file's own start is found
from its first onset and each note's window is refined to its local onset.

WHAT IT MEASURES, and why it is LOUDNESS and not peak (RUNNING_LOG §44): a finger cymbal peaks
high and is quiet, so a peak match would bury it - which is the washing-out the composer named
(LG-13). The level of a note is the loudest K-weighted RMS window inside it (BS.1770's
pre-filter), taken over 400 ms for a sustained note and 150 ms for a percussion one-shot, whose
whole sound can be shorter than one sustained window.

THE TWO LAYERS (§45, both in this one run):
  layer 1  the TRIM - one dB per track. Every instrument's level at the ANCHOR (role `ref` for
           the pitched instruments: the ordinary voice, three pitches, at the quiet velocity;
           the anchor KEY at the same velocity for each percussion instrument). trim = target -
           level, target = the QUIETEST instrument by default so every trim is a cut and
           nothing can clip. Typed into the Reaper faders (0d.4).
  layer 2  the SLOPES - level against velocity (role `vel`) and against CC7 (role `cc7`, taken
           on the curve channel), per instrument and per register, which tools/velocity_remap.js
           inverts into `target -> (velocity, CC7)` (0d.5).

It also reports the SPREAD AT FULL - where the ensemble sits at velocity 127 once the trims are
in - because the piece is quiet with loud moments (LG-13) and that is where a part would wash
the others out; and the round-robin SCATTER per instrument (the repeats' standard deviation),
which is the floor no remap can beat (#5's §119: the Xsample instruments spread 2-4 dB).

Writes bank/balance.json: every note measured, the per-instrument tables, the trims, the
scatter, and the provenance. Prints the fader values to type in.
"""
import argparse, json, os, sys, datetime
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'probes'))
from analyze_balance import db, level, envelope          # the loudness core, carried from #5 unchanged

try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

WIN_SUS, WIN_ONE = 0.40, 0.15      # integration windows: sustained note / percussion one-shot


def fmt(v, nd=1, sign=''):
    return ('?' if v is None else f'{v:+.{nd}f}' if sign else f'{v:.{nd}f}')


def mean(vals):
    vals = [v for v in vals if v is not None]
    return round(float(np.mean(vals)), 2) if vals else None


def sd(vals):
    vals = [v for v in vals if v is not None]
    return round(float(np.std(vals)), 2) if len(vals) > 1 else None


def measure(wav, schedule, weight, min_db, offset_arg):
    """slice the recording by the timetable and return one row per note.
    (The slicing is #5's, its §119 rectangular-window fix included; the only change here is the
    per-note window - a one-shot's whole sound is shorter than one sustained window.)"""
    S = json.load(open(schedule, encoding='utf-8'))
    x, sr = sf.read(wav, always_2d=True); x = x.mean(axis=1)
    env, hop = envelope(x, sr)
    floor = max(float(np.percentile(env, 5)), -90.0)
    notes = S['notes']
    if offset_arg is None:
        if not (env > floor + 20).any(): sys.exit('no onset found: is this the right file?')
        offset = int(np.argmax(env > floor + 20)) * hop / sr - notes[0]['tOnMs'] / 1000
    else:
        offset = offset_arg
    print(f'{os.path.basename(wav)}: {len(x)/sr:.1f} s @ {sr} Hz | noise floor {floor:.1f} dB | '
          f'schedule starts at {offset:+.3f} s in the file | {len(notes)} notes expected')

    rows, missing = [], 0
    for n in notes:
        one = n['role'] == 'perc'
        win = WIN_ONE if one else WIN_SUS
        t_on = n['tOnMs'] / 1000 + offset
        # the measured span: a sustained note is its own length; a one-shot is its slot, so the
        # ring is inside the window and the decay is not chopped at the note-off
        t_end = (n['slotEndMs'] / 1000 + offset - 0.35) if one and n.get('slotEndMs') else (n['tOffMs'] / 1000 + offset + 0.2)
        f0 = max(0, int((t_on - 0.1) * sr / hop)); f1 = min(len(env), int((t_on + 0.4) * sr / hop))
        found = (env[f0:f1] > floor + 15).any() if f1 > f0 else False
        on = (f0 + int(np.argmax(env[f0:f1] > floor + 15))) * hop / sr if found else t_on
        seg = x[int(on * sr): int(min(len(x), t_end * sr))]
        if not len(seg):
            flat, kk, pk = -99.0, -99.0, -99.0
        else:
            flat, kk = level(seg, sr, weight == 'k', win); pk = db(float(np.max(np.abs(seg))))
        lv = kk if (weight == 'k' and kk is not None) else flat
        if lv < min_db: found = False; missing += 1
        rows.append(dict(n, level=None if not found else round(lv, 2), flat=round(flat, 2),
                         peak=round(pk, 2), found=bool(found), winS=win, onS=round(on, 3)))
    if missing:
        print(f'  ⚠ {missing} of {len(notes)} notes did not sound above {min_db} dB — listed under `silent` in the json')
    return S, rows, dict(floorDb=round(floor, 1), offsetS=round(offset, 3), sr=sr, lengthS=round(len(x) / sr, 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('wav')
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'balance_schedule.json'))
    ap.add_argument('--weight', choices=['k', 'flat'], default='k')
    ap.add_argument('--target', default='quietest', help='"quietest" (every trim a cut) or a dB figure')
    ap.add_argument('--min', type=float, default=-70.0, help='below this a note counts as silent')
    ap.add_argument('--offset', type=float, default=None, help='force the schedule-to-file offset in s')
    ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'balance.json'))
    a = ap.parse_args()

    S, rows, rec = measure(a.wav, a.schedule, a.weight, a.min, a.offset)
    anchor_vel = S['anchorVel']

    # ── per instrument ──────────────────────────────────────────────────────────────────────
    insts = []
    for key in S['pitched'] + [p['inst'] for p in S['plan'] if p['role'] == 'perc']:
        mine = [r for r in rows if r['inst'] == key]
        if not mine: continue
        label = mine[0]['label']
        perc = mine[0]['role'] == 'perc'
        anchor_rows = [r for r in mine if r.get('anchor') and r['vel'] == anchor_vel]
        rec_by_pitch = {}
        for r in anchor_rows: rec_by_pitch.setdefault(r['pitch'], []).append(r['level'])
        anchor = mean([r['level'] for r in anchor_rows])
        full = mean([r['level'] for r in mine if r['vel'] == max(S['percVels'] if perc else S['vels']) and (r['cc7'] in (None, 127))])
        # the velocity slope, per register (a pitch for the pitched, a key for the percussion)
        vel_tab, cc7_tab = {}, {}
        for r in mine:
            if r['role'] in ('vel', 'perc'):
                vel_tab.setdefault(str(r['pitch']), {}).setdefault(str(r['vel']), []).append(r['level'])
            elif r['role'] == 'cc7':
                cc7_tab.setdefault(str(r['pitch']), {}).setdefault(str(r['cc7']), []).append(r['level'])
        squash = lambda tab: {p: {v: mean(l) for v, l in sorted(d.items(), key=lambda kv: -int(kv[0]))} for p, d in tab.items()}
        scatter = sd([r['level'] for r in anchor_rows]) if len(anchor_rows) > 1 else None
        insts.append(dict(inst=key, label=label, kind='perc' if perc else 'pitched',
                          family=None if perc else S['families'].get(key),
                          port=mine[0]['port'], ch=mine[0]['ch'],
                          anchorVel=anchor_vel, anchorDb=anchor, fullDb=full,
                          anchorByPitch={str(p): mean(l) for p, l in sorted(rec_by_pitch.items())},
                          velocity=squash(vel_tab), cc7=squash(cc7_tab),
                          scatterSd=scatter, notes=len(mine),
                          silent=[dict(pitch=r['pitch'], vel=r['vel'], cc7=r['cc7'], role=r['role']) for r in mine if not r['found']]))

    have = [i for i in insts if i['anchorDb'] is not None]
    if not have: sys.exit('no instrument produced an anchor level — is this the right recording?')
    target = min(i['anchorDb'] for i in have) if a.target == 'quietest' else float(a.target)
    for i in insts:
        i['trimDb'] = None if i['anchorDb'] is None else round(target - i['anchorDb'], 2)
        i['fullAfterTrimDb'] = None if (i['fullDb'] is None or i['trimDb'] is None) else round(i['fullDb'] + i['trimDb'], 2)

    # ── the report ──────────────────────────────────────────────────────────────────────────
    w = a.weight
    print(f'\nANCHOR velocity {anchor_vel} (the quiet level) · {w}-weighted · target {target:.2f} dB '
          f'({"the quietest instrument — every trim a cut" if a.target == "quietest" else "given"})\n')
    print(f'  {"instrument":<20}{"port":<11}{"ch":>3}  {"anchor":>8}{"trim":>8}{"scatter":>9}   {"@full":>8}{"after trim":>11}')
    for i in insts:
        print(f'  {i["label"]:<20}{i["port"]:<11}{i["ch"]:>3}  {fmt(i["anchorDb"]):>8}{fmt(i["trimDb"], sign="+"):>8}'
              f'{("±" + fmt(i["scatterSd"], 2)) if i["scatterSd"] is not None else "—":>9}   '
              f'{fmt(i["fullDb"]):>8}{fmt(i["fullAfterTrimDb"]):>11}')
    spread = [i['fullAfterTrimDb'] for i in insts if i['fullAfterTrimDb'] is not None]
    if spread:
        print(f'\n  spread at FULL velocity once the trims are in: {max(spread) - min(spread):.1f} dB '
              f'({min(spread):.1f} … {max(spread):.1f}) — layer 2 (the remap) is what closes this')
    worst = max((i for i in insts if i['scatterSd'] is not None), key=lambda i: i['scatterSd'], default=None)
    if worst:
        print(f'  widest round-robin scatter: {worst["label"]} ±{worst["scatterSd"]:.2f} dB — the floor no remap can beat')

    out = dict(measuredAt=datetime.datetime.now().isoformat(timespec='seconds'),
               planItem='0d.3', piece='lgmf', wav=os.path.basename(a.wav), recording=rec,
               schedule=os.path.relpath(a.schedule, ROOT).replace('\\', '/'),
               scheduleGeneratedAt=S.get('generatedAt'), weighting=w,
               windowS=dict(sustained=WIN_SUS, oneShot=WIN_ONE), minDb=a.min,
               anchorVel=anchor_vel, target=target, targetMode=a.target,
               spreadAtFullDb=None if not spread else round(max(spread) - min(spread), 2),
               instruments=insts,
               note='trims go on the Reaper faders (0d.4) and into sandbox/instruments.js as balanceDb, '
                    'which is the RECORD ONLY — the app sends nothing for them. The velocity/cc7 tables are '
                    'layer 2 raw material for tools/velocity_remap.js (0d.5).')
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(out, open(a.out, 'w', encoding='utf-8'), indent=1)
    print(f'\n→ {os.path.relpath(a.out, ROOT)}')
    print('  type the trims into the Reaper faders (or run the 0d.4 job), then: node tools/velocity_remap.js')


if __name__ == '__main__':
    main()
