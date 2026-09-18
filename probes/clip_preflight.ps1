# clip_preflight.ps1 - the CLIPPING PRE-FLIGHT for PLAN 0d (2026-09-18).
#
# His ask: "the only issue is with clipping, I believe the last time we had to rerun the probe several
# times because of clipping, whats the best way to amileroate this?" This is the answer's third part -
# a two-minute check that makes a 27-minute re-run unnecessary. (The other two: record 32-bit float,
# and REC's fader at -12 dB, which make_rec_track.lua sets. A constant offset cancels out of every
# number 0d wants, so headroom is free.)
#
# It plays the LOUDEST case only - every instrument at top velocity - while clip_watch.lua reads EVERY
# track's meter. Two faults look identical in a recording and only the per-track peaks separate them:
#   REC at/near 0 dB                        -> not enough fader margin; lower REC_TRIM_DB and redo
#   a SOURCE track at 0.0 while REC is low  -> THAT PLUGIN clips internally; no fader can fix it, it is
#                                              fixed inside the instrument (#5's flute, UVI master -2 dB)
#
# The watch and the notes are launched from THIS ONE PROCESS on purpose: a tool round trip cannot be
# timed against a defer loop, and two attempts on 2026-09-18 read -144 dB everywhere for that reason
# alone (RUNNING_LOG S50). Nothing is recorded - this reads meters, it does not need the transport.
#
#   .\probes\clip_preflight.ps1
#   .\probes\clip_preflight.ps1 -Schedule probes\balance_schedule.json   # watch the REAL run instead
#
param(
    [string]$Schedule = '',
    [switch]$SkipGenerate
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$watchJob = Join-Path $repo 'reaper\bridge\jobs\clip_watch.lua'
$result = Join-Path $repo 'probes\clip_watch.json'
$secFile = Join-Path $repo 'probes\clip_watch_s.txt'

if (-not $Schedule) { $Schedule = Join-Path $repo 'probes\preflight_schedule.json' }
if (-not [System.IO.Path]::IsPathRooted($Schedule)) { $Schedule = Join-Path $repo $Schedule }

# 1. the timetable
if (-not $SkipGenerate -and $Schedule -like '*preflight_schedule.json') {
    Push-Location $repo
    & node tools/balance_schedule.js --preflight | Select-Object -Last 1 | Out-Host
    Pop-Location
}
if (-not (Test-Path $Schedule)) { Write-Host "no schedule at $Schedule"; exit 1 }
$S = Get-Content -Raw -Encoding UTF8 $Schedule | ConvertFrom-Json
$playS = [math]::Round($S.totalMs / 1000, 1)
$watchS = [math]::Ceiling($playS + 25)      # the lead-in, node's start-up, and the last sound's tail

# 2. tell the watcher how long, and clear the old result
Set-Content -Path $secFile -Value ([string]$watchS) -Encoding ASCII -NoNewline
if (Test-Path $result) { Remove-Item $result }

Write-Host ("pre-flight: {0} notes, {1:N1} s of playing, watching every track for {2} s" -f $S.notes.Count, $playS, $watchS)
Write-Host '  nothing is recorded and the transport is not touched - this reads the live meters'

# 3. parse-check and launch the watcher (S28: never send the bridge a file you have not parsed)
Push-Location $repo
$chk = & node tools/reaper_job.js -e "local f, e = loadfile('$($watchJob -replace '\\','/')'); return { parsed = (f ~= nil), err = tostring(e) }"
# -notmatch on an ARRAY returns the non-matching ELEMENTS, not a boolean, so a clean parse reads as a
# failure (it did, once, 2026-09-18). Join to one string first.
$chkText = ($chk | Out-String)
if ($chkText -notmatch '"parsed":\s*true') { Pop-Location; Write-Host 'clip_watch.lua did NOT parse:'; Write-Host $chkText; exit 1 }
$null = & node tools/reaper_job.js run reaper/bridge/jobs/clip_watch.lua
Pop-Location
Write-Host ('  watcher running, playing from ' + (Get-Date -Format 'HH:mm:ss'))

# 4. play it, inside the window
& (Join-Path $PSScriptRoot 'balance_probe.ps1') -Schedule $Schedule | Out-Null

# 5. wait for the window to close, then report
Write-Host '  played; waiting for the watch window to close'
$n = 0
while (-not (Test-Path $result) -and $n -lt ($watchS * 2 + 60)) { Start-Sleep -Milliseconds 500; $n++ }
if (-not (Test-Path $result)) { Write-Host 'no result file - did the bridge stay alive?'; exit 1 }

$R = Get-Content -Raw -Encoding UTF8 $result | ConvertFrom-Json
Write-Host ''
Write-Host ("{0,-24}{1,10}{2,10}   {3}" -f 'track', 'peak L', 'peak R', 'verdict')
foreach ($p in $R.peaks) {
    $mark = switch ($p.verdict) { 'CLIPPED' { '  <== CLIPPED' } 'near' { '  <-- near' } default { '' } }
    Write-Host ("{0,-24}{1,10:N2}{2,10:N2}   {3}{4}" -f $p.track, $p.peakL_dB, $p.peakR_dB, $p.verdict, $mark)
}
Write-Host ''
if ($R.clipped.Count) {
    $recClipped = $R.clipped -contains 'REC'
    Write-Host ('CLIPPED: ' + ($R.clipped -join ', '))
    if ($recClipped) { Write-Host '  REC itself clipped -> lower REC_TRIM_DB in reaper/bridge/jobs/make_rec_track.lua and re-run it' }
    $srcOnly = @($R.clipped | Where-Object { $_ -ne 'REC' -and $_ -ne 'MASTER' })
    if ($srcOnly.Count) { Write-Host ('  these clip INSIDE the plugin, where no Reaper fader reaches: ' + ($srcOnly -join ', ')) }
    exit 2
}
if ($R.near.Count) { Write-Host ('near the ceiling (within 3 dB), worth a look: ' + ($R.near -join ', ')) }
$rec = $R.peaks | Where-Object { $_.track -eq 'REC' }
if ($rec) { Write-Host ('REC peaked at {0:N2} dB - {1:N1} dB of margin' -f $rec.peak_dB, [math]::Abs($rec.peak_dB)) }
Write-Host 'no clipping: the full run is safe to record.'
