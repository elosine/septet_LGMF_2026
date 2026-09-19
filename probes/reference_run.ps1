# reference_run.ps1 - PLAN 1b.1 (2026-09-19): record the REF track through REC, in one process.
#
# WHY ONE PROCESS (the lesson of RUNNING_LOG S50/S53): the transport has to be rolling before the first
# reference item and must stop after the last, and a bridge round trip cannot be timed against either.
# And S54's standing warning - after a record the bridge's STOP round trip times out - is why the stop is
# fired and then CONFIRMED FROM THE FILE rather than from the call's return.
#
# WHAT IT ASSUMES, each of it read back before anything rolls:
#   REF exists with its two items at 600 s and 635 s   (reaper/bridge/jobs/ref_track.lua)
#   REC exists, armed, unity, receives REF             (reaper/bridge/jobs/make_rec_track.lua, 1b.0)
#   every other track is I_RECMODE 2 "do not record"   (reaper/bridge/jobs/rec_mode_solo.lua)
#
# It plays 598 -> 670 s. His own recording of the balance score sits at 0-94 s and is never reached.
#
#   .\probes\reference_run.ps1              # record, stop, print the file
#   .\probes\reference_run.ps1 -DryRun      # every check, no transport
param([switch]$DryRun)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$START = 598.0
$END = 670.0
$PLAY_S = [int]($END - $START) + 4      # the tail, so the last item is complete before the stop

function Bridge([string]$expr) {
    $out = & node tools/reaper_job.js -e $expr 2>&1 | Out-String
    try { return ($out | ConvertFrom-Json) } catch { throw "the bridge did not answer with JSON: $out" }
}

Write-Host "PLAN 1b.1 - recording the calibration reference ($START -> $END s, $PLAY_S s of wall clock)"

$hb = Bridge 'return { alive = true, playing = (reaper.GetPlayState() ~= 0), project = reaper.GetProjectName(0, "") }'
if ($hb.result.playing) { Write-Host 'the transport is already rolling - stop it first'; exit 3 }
Write-Host "  bridge alive - project $($hb.result.project)"

# the pre-state: REF's items, REC's arm and fader, and who else could write a file
$pre = Bridge @'
local function find(n) for i = 0, reaper.CountTracks(0) - 1 do local t = reaper.GetTrack(0, i); local _, nm = reaper.GetTrackName(t); if nm == n then return t end end end
local ref, rec = find('REF'), find('REC')
local writers = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local t = reaper.GetTrack(0, i)
  if reaper.GetMediaTrackInfo_Value(t, 'I_RECARM') == 1 and reaper.GetMediaTrackInfo_Value(t, 'I_RECMODE') ~= 2 then
    local _, nm = reaper.GetTrackName(t); writers[#writers + 1] = nm
  end
end
local items = {}
if ref then for i = 0, reaper.CountTrackMediaItems(ref) - 1 do
  local it = reaper.GetTrackMediaItem(ref, i)
  items[#items + 1] = { pos = reaper.GetMediaItemInfo_Value(it, 'D_POSITION'), len = reaper.GetMediaItemInfo_Value(it, 'D_LENGTH') }
end end
return { refExists = (ref ~= nil), refItems = items, recExists = (rec ~= nil),
         recArm = rec and reaper.GetMediaTrackInfo_Value(rec, 'I_RECARM') or -1,
         recDb = rec and 20 * math.log(reaper.GetMediaTrackInfo_Value(rec, 'D_VOL'), 10) or -99,
         writers = writers }
'@
$p = $pre.result
if (-not $p.refExists) { Write-Host 'no REF track - run reaper/bridge/jobs/ref_track.lua'; exit 4 }
if (-not $p.recExists) { Write-Host 'no REC track - run reaper/bridge/jobs/make_rec_track.lua'; exit 4 }
if ($p.refItems.Count -ne 2) { Write-Host "REF holds $($p.refItems.Count) items, expected 2"; exit 4 }
if ($p.recArm -ne 1) { Write-Host 'REC is not record-armed'; exit 4 }
if ([math]::Abs($p.recDb) -gt 0.05) { Write-Host "REC is at $([math]::Round($p.recDb,2)) dB, not unity - 1b.0 wants the file to BE the master sum"; exit 4 }
if ($p.writers.Count -ne 1 -or $p.writers[0] -ne 'REC') {
    Write-Host "REC must be the only track that records; these would also write: $($p.writers -join ', ')"
    Write-Host '  run: node tools/reaper_job.js run reaper/bridge/jobs/rec_mode_solo.lua'
    exit 5
}
Write-Host "  REF: 2 items at $($p.refItems[0].pos) s and $($p.refItems[1].pos) s   REC: armed, $([math]::Round($p.recDb,2)) dB, the only writer"
if ($DryRun) { Write-Host 'dry run - nothing recorded'; exit 0 }

$before = @(Get-ChildItem reaper/Media/*.wav -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
Bridge "reaper.SetEditCurPos($START, true, false); return reaper.GetCursorPosition()" | Out-Null
Bridge 'reaper.Main_OnCommand(1013, 0); return reaper.GetPlayState()' | Out-Null
Start-Sleep -Milliseconds 800
$st = (Bridge 'return reaper.GetPlayState()').result
if ($st -ne 5 -and $st -ne 6) {
    Write-Host "NOT RECORDING (playstate $st) - stopping and aborting"
    Bridge 'reaper.Main_OnCommand(40667, 0); return 0' | Out-Null
    exit 6
}
Write-Host "  recording (playstate $st) - $PLAY_S s"
try { Start-Sleep -Seconds $PLAY_S }
finally {
    # 40667 = Transport: Stop (save all recorded media), no prompt. S54: the round trip may time out, so the
    # proof is the FILE, checked below, never this call's return.
    try { Bridge 'reaper.Main_OnCommand(40667, 0); return 0' | Out-Null } catch { Write-Host '  (the stop call timed out - as S54 says it may; confirming from the file)' }
}
Start-Sleep -Seconds 2

$after = Get-ChildItem reaper/Media/*.wav | Sort-Object LastWriteTime -Descending
$new = $after | Where-Object { $before -notcontains $_.Name }
if (-not $new) { Write-Host 'NO NEW FILE in reaper/Media - the record did not write'; exit 7 }
$w = $new | Select-Object -First 1
Write-Host "  wrote reaper/Media/$($w.Name)  ($([math]::Round($w.Length / 1MB, 1)) MB)"
Write-Host ''
Write-Host "next:  python probes/analyze_reference.py reaper/Media/$($w.Name)"
