# balance_run.ps1 - the whole 0d.3 run in one process: record on, play the schedule, record off
# (2026-09-18). His "saved, go".
#
# WHY ONE PROCESS. The transport must be rolling before the schedule's lead-in ends and must stop after
# the last sound's tail, and a tool round trip cannot be timed against either (RUNNING_LOG S50 cost two
# probes that way). So this script drives the transport through the bridge itself.
#
# WHAT IT ASSUMES, all of it already true and read back (S49-S52):
#   REC exists, is armed, records its OUTPUT post-fader at -12 dB, and receives the 24 measured tracks
#   every other track is I_RECMODE 2 ("do not record"), so only REC writes a file - rec_mode_solo.lua
#   the project records 32-bit float, so an over would be recoverable
#   the pre-flight is green with 16.5 dB of margin
#
#   .\probes\balance_run.ps1                 # the full schedule
#   .\probes\balance_run.ps1 -DryRun         # everything except the transport and the notes
#
param(
    [string]$Schedule = '',
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
if (-not $Schedule) { $Schedule = Join-Path $repo 'probes\balance_schedule.json' }
if (-not [System.IO.Path]::IsPathRooted($Schedule)) { $Schedule = Join-Path $repo $Schedule }
if (-not (Test-Path $Schedule)) { Write-Host "no schedule at $Schedule"; exit 1 }

$S = Get-Content -Raw -Encoding UTF8 $Schedule | ConvertFrom-Json
$playS = [math]::Round($S.totalMs / 1000, 1)

function Bridge([string]$expr) {
    Push-Location $repo
    try { $r = & node tools/reaper_job.js -e $expr } finally { Pop-Location }
    return ($r | Out-String)
}

Write-Host ("balance run: {0} notes, {1:N1} s ({2:N1} min) of playing" -f $S.notes.Count, $playS, ($playS / 60))

# 1. cursor to 0, and confirm REC is the only writer before anything rolls
$pre = Bridge @'
local function tr(n) for i=0,reaper.CountTracks(0)-1 do local t=reaper.GetTrack(0,i); local _,nm=reaper.GetTrackName(t); if nm==n then return t end end end
local rec = tr('REC')
if not rec then return { error = 'no REC track' } end
local writers = {}
for i=0,reaper.CountTracks(0)-1 do local t=reaper.GetTrack(0,i); local _,nm=reaper.GetTrackName(t)
  if reaper.GetMediaTrackInfo_Value(t,'I_RECMODE') ~= 2 and reaper.GetMediaTrackInfo_Value(t,'I_RECARM') == 1 then writers[#writers+1]=nm end end
reaper.SetEditCurPos(0, false, false)
return { writers = writers, playState = reaper.GetPlayState(), curPos = reaper.GetCursorPosition(),
         recVolDb = 20*math.log(reaper.GetMediaTrackInfo_Value(rec,'D_VOL'),10), recArm = reaper.GetMediaTrackInfo_Value(rec,'I_RECARM') }
'@
Write-Host '  pre-flight state:'; Write-Host ($pre -split "`n" | Where-Object { $_ -match 'writers|recVolDb|recArm|playState|curPos|error' } | Out-String).Trim()
if ($pre -notmatch '"REC"') { Write-Host 'REC is not the only armed writer, or is missing - stopping'; exit 1 }

if ($DryRun) { Write-Host 'dry run: not recording, not playing'; exit 0 }

# 2. the MIDI type, compiled BEFORE the transport rolls so the lead-in is not eaten by it
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Collections.Generic;
public class RunWarm {
  [DllImport("winmm.dll")] public static extern uint midiOutGetNumDevs();
}
'@
$null = [RunWarm]::midiOutGetNumDevs()

# 3. record on (action 1013 = Transport: Record)
$on = Bridge 'reaper.Main_OnCommand(1013, 0); return { playState = reaper.GetPlayState() }'
Write-Host ('  record ON at ' + (Get-Date -Format 'HH:mm:ss') + ' -> playState ' + ([regex]::Match($on, '"playState":\s*(\d+)').Groups[1].Value) + '  (5 = playing+recording)')
if ($on -notmatch '"playState":\s*5') { Write-Host 'the transport did not go into record - stopping and bailing out'; $null = Bridge 'reaper.Main_OnCommand(1016, 0); return {}'; exit 1 }

# 4. play the schedule
try {
    & (Join-Path $PSScriptRoot 'balance_probe.ps1') -Schedule $Schedule | Select-Object -Last 1 | Out-Host
} finally {
    # 5. record off, whatever happened (action 1016 = Transport: Stop) - a note-off storm is already
    #    sent by balance_probe's own CloseAll
    Start-Sleep -Seconds 4
    $off = Bridge 'reaper.Main_OnCommand(1016, 0); return { playState = reaper.GetPlayState() }'
    Write-Host ('  record OFF at ' + (Get-Date -Format 'HH:mm:ss'))
}

# 6. what was written
$after = Bridge @'
local function tr(n) for i=0,reaper.CountTracks(0)-1 do local t=reaper.GetTrack(0,i); local _,nm=reaper.GetTrackName(t); if nm==n then return t end end end
local rec = tr('REC')
local out = { items = reaper.CountTrackMediaItems(rec), files = {} }
for i = 0, reaper.CountTrackMediaItems(rec) - 1 do
  local it = reaper.GetTrackMediaItem(rec, i)
  local tk = reaper.GetActiveTake(it)
  if tk then
    local src = reaper.GetMediaItemTake_Source(tk)
    local fn = reaper.GetMediaSourceFileName(src, '')
    out.files[#out.files+1] = fn .. '  |  ' .. string.format('%.1f s', reaper.GetMediaItemInfo_Value(it, 'D_LENGTH'))
  end
end
out.projectPath = reaper.GetProjectPath('')
return out
'@
Write-Host ''
Write-Host 'what REC wrote:'
Write-Host $after
Write-Host 'next: python probes/analyze_lgmf_balance.py <that wav>'
