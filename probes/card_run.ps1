# card_run.ps1 - PLAN 1b.2 (2026-09-19): record the instrument card, in one process.
#
# The same shape as probes/reference_run.ps1 (1b.1) with the schedule player in the middle, and ONE
# difference that matters:
#
#   IT ROLLS FROM 700 s, NOT FROM 0. His recording of the balance score sits at 0-94 s on every track
#   (RUNNING_LOG S75) and the REF items sit at 600 s and 635 s (1b.1). Rolling from 0 would play the
#   septet into the samplers underneath the measurement, and rolling from 600 would put the calibration
#   noise on top of it. At 700 s the timeline is empty, so the ONLY sound in the file is the schedule's
#   own notes, sent live over MIDI by probes/balance_probe.ps1.
#
#   .\probes\card_run.ps1                                  # probes/card_schedule.json
#   .\probes\card_run.ps1 -Schedule probes\other.json       # another timetable, same rig
#   .\probes\card_run.ps1 -DryRun                           # every check, no transport
param(
    [string]$Schedule = '',
    [double]$StartAt = 700.0,
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
if (-not $Schedule) { $Schedule = 'probes\card_schedule.json' }
if (-not [System.IO.Path]::IsPathRooted($Schedule)) { $Schedule = Join-Path $repo $Schedule }
if (-not (Test-Path $Schedule)) { Write-Host "no schedule at $Schedule"; exit 1 }

$S = Get-Content -Raw -Encoding UTF8 $Schedule | ConvertFrom-Json
$playS = [math]::Round($S.totalMs / 1000, 1)

function Bridge([string]$expr) {
    $out = & node tools/reaper_job.js -e $expr 2>&1 | Out-String
    try { return ($out | ConvertFrom-Json) } catch { throw "the bridge did not answer with JSON: $out" }
}

Write-Host "PLAN 1b.2 - the instrument card: $($S.notes.Count) notes, $playS s, from $StartAt s"

$hb = Bridge 'return { playing = (reaper.GetPlayState() ~= 0) }'
if ($hb.result.playing) { Write-Host 'the transport is already rolling - stop it first'; exit 3 }

$pre = Bridge @'
local function find(n) for i = 0, reaper.CountTracks(0) - 1 do local t = reaper.GetTrack(0, i); local _, nm = reaper.GetTrackName(t); if nm == n then return t end end end
local rec = find('REC')
local writers = {}
for i = 0, reaper.CountTracks(0) - 1 do
  local t = reaper.GetTrack(0, i)
  if reaper.GetMediaTrackInfo_Value(t, 'I_RECARM') == 1 and reaper.GetMediaTrackInfo_Value(t, 'I_RECMODE') ~= 2 then
    local _, nm = reaper.GetTrackName(t); writers[#writers + 1] = nm
  end
end
return { recExists = (rec ~= nil), recArm = rec and reaper.GetMediaTrackInfo_Value(rec, 'I_RECARM') or -1,
         recDb = rec and 20 * math.log(reaper.GetMediaTrackInfo_Value(rec, 'D_VOL'), 10) or -99,
         writers = writers }
'@
$p = $pre.result
if (-not $p.recExists) { Write-Host 'no REC track - run reaper/bridge/jobs/make_rec_track.lua'; exit 4 }
if ($p.recArm -ne 1) { Write-Host 'REC is not record-armed'; exit 4 }
if ([math]::Abs($p.recDb) -gt 0.05) { Write-Host "REC is at $([math]::Round($p.recDb,2)) dB, not unity - 1b.0 wants the file to BE the master sum"; exit 4 }
if ($p.writers.Count -ne 1 -or $p.writers[0] -ne 'REC') {
    Write-Host "REC must be the only track that records; these would also write: $($p.writers -join ', ')"
    Write-Host '  run: node tools/reaper_job.js run reaper/bridge/jobs/rec_mode_solo.lua'
    exit 5
}
Write-Host "  REC: armed, $([math]::Round($p.recDb,2)) dB, the only writer"
if ($DryRun) { Write-Host 'dry run - nothing recorded'; exit 0 }

$before = @(Get-ChildItem reaper/Media/*.wav -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
Bridge "reaper.SetEditCurPos($StartAt, true, false); return reaper.GetCursorPosition()" | Out-Null
Bridge 'reaper.Main_OnCommand(1013, 0); return reaper.GetPlayState()' | Out-Null
Start-Sleep -Milliseconds 800
$st = (Bridge 'return reaper.GetPlayState()').result
if ($st -ne 5 -and $st -ne 6) {
    Write-Host "NOT RECORDING (playstate $st) - stopping and aborting"
    Bridge 'reaper.Main_OnCommand(40667, 0); return 0' | Out-Null
    exit 6
}
Write-Host "  recording (playstate $st) - playing the schedule"
try {
    & (Join-Path $PSScriptRoot 'balance_probe.ps1') -Schedule $Schedule | Select-Object -Last 1 | Out-Host
}
finally {
    Start-Sleep -Seconds 3
    # S54: after a record the stop's round trip may time out. The proof is the FILE.
    try { Bridge 'reaper.Main_OnCommand(40667, 0); return 0' | Out-Null } catch { Write-Host '  (the stop call timed out - confirming from the file)' }
}
Start-Sleep -Seconds 2

$after = Get-ChildItem reaper/Media/*.wav | Sort-Object LastWriteTime -Descending
$new = $after | Where-Object { $before -notcontains $_.Name }
if (-not $new) { Write-Host 'NO NEW FILE in reaper/Media - the record did not write'; exit 7 }
$w = $new | Select-Object -First 1
Write-Host "  wrote reaper/Media/$($w.Name)  ($([math]::Round($w.Length / 1MB, 1)) MB)"
Write-Host ''
Write-Host "next:  python probes/analyze_card.py reaper/Media/$($w.Name)"
