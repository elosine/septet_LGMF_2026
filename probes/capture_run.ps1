# capture_run.ps1 - PLAN 1b.5 (2026-09-19): record the APP'S OWN playback into the rack.
#
#   .\probes\capture_run.ps1 -Capture midi\lgmf-1b5.capture.json
#
# The sibling of card_run.ps1, and the difference is the whole point of 1b.5. card_run plays a SCHEDULE -
# notes a tool decided on. This plays a CAPTURE: every message composer.html itself sent, velocity and CC7
# chosen by the remap exactly as they will be for the piece (tools/capture_composer_midi.js, headless, on a
# virtual clock). Nothing sits between the app's decision and the sound being measured.
#
# It rolls from 700 s for the same reason card_run does: his recording of the balance score sits at 0-94 s
# and the REF items at 600/635 s, so anywhere earlier would play something else underneath the measurement.
param(
    [string]$Capture = '',
    [double]$StartAt = 700.0,
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
if (-not $Capture) { Write-Host 'give -Capture <file>'; exit 1 }
if (-not [System.IO.Path]::IsPathRooted($Capture)) { $Capture = Join-Path $repo $Capture }
if (-not (Test-Path $Capture)) { Write-Host "no capture at $Capture"; exit 1 }

$C = Get-Content -Raw -Encoding UTF8 $Capture | ConvertFrom-Json
$playS = [math]::Round((($C.events | ForEach-Object { [double]$_[1] } | Measure-Object -Maximum).Maximum), 1)
Write-Host ("PLAN 1b.5 - replaying {0}: {1} messages, {2} s, from {3} s" -f (Split-Path -Leaf $Capture), $C.events.Count, $playS, $StartAt)

function Bridge([string]$expr) {
    $out = & node tools/reaper_job.js -e $expr 2>&1 | Out-String
    try { return ($out | ConvertFrom-Json) } catch { throw "the bridge did not answer with JSON: $out" }
}

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
         recDb = rec and 20 * math.log(reaper.GetMediaTrackInfo_Value(rec, 'D_VOL'), 10) or -99, writers = writers }
'@
$p = $pre.result
if (-not $p.recExists) { Write-Host 'no REC track'; exit 4 }
if ($p.recArm -ne 1) { Write-Host 'REC is not record-armed'; exit 4 }
if ([math]::Abs($p.recDb) -gt 0.05) { Write-Host "REC is at $([math]::Round($p.recDb,2)) dB, not unity"; exit 4 }
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
Write-Host "  recording (playstate $st) - replaying the capture"
try { & (Join-Path $PSScriptRoot 'play_capture.ps1') -Capture $Capture | Select-Object -Last 1 | Out-Host }
finally {
    Start-Sleep -Seconds 3
    try { Bridge 'reaper.Main_OnCommand(40667, 0); return 0' | Out-Null } catch { Write-Host '  (the stop call timed out - confirming from the file)' }
}
Start-Sleep -Seconds 2

$new = Get-ChildItem reaper/Media/*.wav | Sort-Object LastWriteTime -Descending | Where-Object { $before -notcontains $_.Name }
if (-not $new) { Write-Host 'NO NEW FILE in reaper/Media'; exit 7 }
$w = $new | Select-Object -First 1
Write-Host "  wrote reaper/Media/$($w.Name)  ($([math]::Round($w.Length / 1MB, 1)) MB)"
