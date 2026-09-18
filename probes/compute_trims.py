#!/usr/bin/env python3
"""compute_trims.py - the 0d.4 trims from bank/balance.json, under the rule the run forced (RUNNING_LOG S54, S57).

    python probes/compute_trims.py [--fader-max 12] [--write]

WHY NOT #5's RULE. #5 cut every instrument to the quietest one's level at the anchor. Here the
percussion sits ~25 dB under the winds velocity-for-velocity (S54), so that rule prescribes -48 dB
on the bassoon and leaves it inaudible at full. The two groups need their own anchors:

  PITCHED    anchored at the QUIET level (velocity 64, his A): the target is the group's MEDIAN
             anchor, so trims are small and go both ways. Three instruments land at 0.
  PERCUSSION anchored at FULL (velocity 127, its anchor key): fff = fff. A tambourine at full is as
             loud as a horn at full - that is the physical statement, and a percussion one-shot has
             no "quiet level" comparable to a wind's velocity 64. Its target is the pitched group's
             AFTER-TRIM level at full, so the two groups meet at the top and the quiet end takes
             care of itself through velocity.

The absolute level is arbitrary (the master fader); only the differences matter. REC's -12 dB and
K-weighting are constant offsets and cancel. Boosts are allowed: the run had 16.5 dB of margin at
full on REC and the loudest source sat at -4.5 dBFS with the SI2 masters at -6.

Reaper's fader stops at +12 dB. A trim beyond that is flagged; the excess belongs in the instrument's
own gain (ARO's global gain, as text - the same lever the SI2 masters used, S52), not in a stack of FX.
"""
import argparse, json, os, datetime, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def mean(v):
    v = [x for x in v if x is not None]
    return round(sum(v) / len(v), 2) if v else None


def level_at(i, key, vel):
    vals = [x for p, tab in (i.get(key) or {}).items() for k, x in tab.items() if k == str(vel) and x is not None]
    return mean(vals)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bank', default=os.path.join(ROOT, 'bank', 'balance.json'))
    ap.add_argument('--fader-max', type=float, default=12.0)
    ap.add_argument('--write', action='store_true', help='write trimDb + the rule into the bank file')
    a = ap.parse_args()
    B = json.load(open(a.bank, encoding='utf-8'))
    insts = B['instruments']
    anchor_vel = B['anchorVel']

    pitched = [i for i in insts if i['kind'] == 'pitched' and i.get('anchorDb') is not None]
    perc = [i for i in insts if i['kind'] == 'perc']
    # the velocity lists live in the schedule the run was played from, not in the bank
    try:
        S = json.load(open(os.path.join(ROOT, B.get('schedule', 'probes/balance_schedule.json')), encoding='utf-8'))
        top_vel, perc_top = max(S['vels']), max(S['percVels'])
    except Exception:
        top_vel, perc_top = 127, 127

    # 1. the pitched group: anchor at the quiet level, target = the median
    target_p = round(statistics.median(i['anchorDb'] for i in pitched), 2)
    for i in pitched:
        i['trimDb'] = round(target_p - i['anchorDb'], 2)
        i['anchorAt'] = anchor_vel
        full = level_at(i, 'velocity', top_vel)
        i['fullDb'] = full
        i['fullAfterTrimDb'] = None if full is None else round(full + i['trimDb'], 2)

    # 2. the percussion: anchor at full, target = the pitched group's after-trim level at full
    target_q = round(statistics.median(i['fullAfterTrimDb'] for i in pitched if i['fullAfterTrimDb'] is not None), 2)
    for i in perc:
        full = level_at(i, 'velocity', perc_top)
        i['fullDb'] = full
        i['anchorAt'] = perc_top
        i['trimDb'] = None if full is None else round(target_q - full, 2)
        i['fullAfterTrimDb'] = None if full is None else round(full + i['trimDb'], 2)

    over = []
    for i in insts:
        t = i.get('trimDb')
        i['faderDb'] = None if t is None else round(max(-150.0, min(a.fader_max, t)), 2)
        i['pluginGainDb'] = None if t is None else round(t - i['faderDb'], 2)
        if i['pluginGainDb']: over.append(i)

    # 3. the report
    print(f'\nPITCHED - anchored at velocity {anchor_vel} (the quiet level), target = the group median {target_p:.1f} dB')
    print(f'  {"instrument":<16}{"@64":>8}{"trim":>8}   {"@full":>7}{"after":>8}')
    for i in pitched:
        print(f'  {i["label"]:<16}{i["anchorDb"]:>8.1f}{i["trimDb"]:>+8.1f}   {i["fullDb"]:>7.1f}{i["fullAfterTrimDb"]:>8.1f}')
    print(f'\nPERCUSSION - anchored at velocity {perc_top} (fff = fff), target = the pitched group at full after trim, {target_q:.1f} dB')
    print(f'  {"instrument":<20}{"@127":>7}{"trim":>8}   {"fader":>7}{"plugin":>8}')
    for i in perc:
        if i['trimDb'] is None: print(f'  {i["label"]:<20}{"?":>7}'); continue
        flag = '  <- beyond the fader' if i['pluginGainDb'] else ''
        print(f'  {i["label"]:<20}{i["fullDb"]:>7.1f}{i["trimDb"]:>+8.1f}   {i["faderDb"]:>+7.1f}{i["pluginGainDb"]:>+8.1f}{flag}')
    sp = [i['fullAfterTrimDb'] for i in insts if i.get('fullAfterTrimDb') is not None]
    print(f'\n  everyone at full, after trim: {min(sp):.1f} … {max(sp):.1f} dB  (spread {max(sp) - min(sp):.1f})')
    if over: print(f'  {len(over)} trims exceed the fader\'s +{a.fader_max:.0f} dB; the remainder goes into the plugin\'s own gain: ' + ', '.join(f'{i["label"]} {i["pluginGainDb"]:+.1f}' for i in over))

    if a.write:
        B['trimRule'] = dict(computedAt=datetime.datetime.now().isoformat(timespec='seconds'),
                             pitched=dict(anchorVel=anchor_vel, target='median of the group at the anchor', targetDb=target_p),
                             percussion=dict(anchorVel=perc_top, target='the pitched group at full velocity after trim', targetDb=target_q),
                             faderMaxDb=a.fader_max,
                             why='#5 cut everything to the quietest; here the percussion sits ~25 dB under the winds at equal velocity, so that rule buried the winds (S54). Two anchors: pitched at the quiet level, percussion at full, meeting at the top.')
        json.dump(B, open(a.bank, 'w', encoding='utf-8'), indent=1)
        print(f'\n-> trims written to {os.path.relpath(a.bank, ROOT)}')


if __name__ == '__main__':
    main()
