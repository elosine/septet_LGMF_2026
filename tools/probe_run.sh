#!/bin/bash
# probe_run.sh <schedule.json> <analyzer flags...> — record through the bridge, play the schedule, stop with 40667 (save all
# recorded media, no prompt), analyze, remove the recording's items, cursor back to 0. Reaper and the rack up; nothing else sending MIDI.
S="${PROBE_SCRATCH:-/tmp}"
SCHED="$1"; shift
cd /c/Users/jwloy/GitHub/septet_2026 || exit 2
J="node tools/reaper_job.js"
# the analyzer: probes/analyze_balance.py unless the schedule is the bend probe's ("bend": true → probes/analyze_bend.py,
# PLAN 1f step 1, 2026-09-07) or PROBE_ANALYZER names one
if [ -z "$PROBE_ANALYZER" ]; then if grep -q '"bend": true' "$SCHED"; then PROBE_ANALYZER=probes/analyze_bend.py; else PROBE_ANALYZER=probes/analyze_balance.py; fi; fi
echo "analyzer: $PROBE_ANALYZER"
T0=$(date +%s)
$J heartbeat | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log('bridge alive',j.alive,'playing',j.playing);if(!j.alive||j.playing){process.exit(3)}})" || exit 3
$J -e "local g = {}; for i = 0, reaper.CountTracks(0) - 1 do local tr = reaper.GetTrack(0, i); for k = 0, reaper.CountTrackMediaItems(tr) - 1 do local it = reaper.GetTrackMediaItem(tr, k); local _, guid = reaper.GetSetMediaItemInfo_String(it, 'GUID', '', false); g[#g + 1] = guid end end; return g" > "$S/run_items_before.json"
$J -e "reaper.SetEditCurPos(3600, false, false); return reaper.GetCursorPosition()" > /dev/null
$J transport record > /dev/null
sleep 1
state=$($J -e "return reaper.GetPlayState()" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.parse(s).result)})")
echo "playstate after record: $state"
if [ "$state" != "5" ] && [ "$state" != "6" ]; then echo "NOT RECORDING - aborting"; $J -e "reaper.Main_OnCommand(40667, 0); return 0" > /dev/null; exit 4; fi
powershell -NoProfile -File probes/balance_probe.ps1 -Schedule "$SCHED" > "$S/probe_run.log" 2>&1
echo "probe exit $?"
$J -e "reaper.Main_OnCommand(40667, 0); return reaper.GetPlayState()" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log('after stop(40667): playstate',JSON.parse(s).result)})"
sleep 2
W=$(ls -t reaper/Media/*.wav | head -1)
echo "recording: $W"
# the newest wav must be THIS run's — an unarmed REC track leaves an older file newest, and the analyzer would read a stale take
if [ -z "$W" ] || [ "$(stat -c %Y "$W")" -lt "$T0" ]; then echo "NOTHING RECORDED in this run (newest wav predates it) - is the REC track armed? aborting"; exit 5; fi
python "$PROBE_ANALYZER" "$W" --schedule "$SCHED" "$@"
node -e "
const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); const keep=(j.result||[]).map(g=>\"'\"+g+\"'\").join(',');
const lua='local keep = {'+keep+'}; local kset = {}; for _, g in ipairs(keep) do kset[g] = true end; local removed = 0; for i = 0, reaper.CountTracks(0) - 1 do local tr = reaper.GetTrack(0, i); for k = reaper.CountTrackMediaItems(tr) - 1, 0, -1 do local it = reaper.GetTrackMediaItem(tr, k); local _, g = reaper.GetSetMediaItemInfo_String(it, \"GUID\", \"\", false); if not kset[g] then reaper.DeleteTrackMediaItem(tr, it); removed = removed + 1 end end end; reaper.SetEditCurPos(0, false, false); reaper.UpdateArrange(); return { removed = removed, cursor = reaper.GetCursorPosition() }';
require('fs').writeFileSync(process.argv[2], lua);
" "$S/run_items_before.json" "$S/run_cleanup.lua"
$J run "$S/run_cleanup.lua" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log('cleanup:',JSON.stringify(j.result||j.error))})"
