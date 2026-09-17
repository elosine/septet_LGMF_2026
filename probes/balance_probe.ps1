# balance_probe.ps1 - play the ENSEMBLE BALANCE timetable straight into the loopMIDI ports (winmm),
# bypassing the app, while Reaper records the rack's REC track. RUNNING_LOG S41 (composer,
# 2026-09-04: "a 127 flute is same perceived loudness as 127 violin").
#
#   node tools\balance_schedule.js                      # the timetable from the recipe file
#   .\probes\balance_probe.ps1                          # plays it (about 2 minutes)
#   .\probes\balance_probe.ps1 -DryRun                  # prints the timetable, sends nothing
#   .\probes\balance_probe.ps1 -Only violin1,cello      # a subset (same times as the full run)
#
# Per note: CC7 = 127 (the residue guard) + CC0 (Xsample preset) or the UVI keyswitch note,
# 300 ms before the note; note on at its time, note off at its time. All ports are opened at
# the start and closed at the end. Timing is absolute (a Stopwatch), so drift does not accumulate.
param(
    [string]$Schedule = (Join-Path $PSScriptRoot 'balance_schedule.json'),
    [string]$Only = '',
    [switch]$DryRun
)

Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Collections.Generic;
public class BalanceMidi {
  [DllImport("winmm.dll")] public static extern uint midiOutGetNumDevs();
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
  public struct MIDIOUTCAPS { public ushort wMid; public ushort wPid; public uint vDriverVersion; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string szPname; public ushort wTechnology; public ushort wVoices; public ushort wNotes; public ushort wChannelMask; public uint dwSupport; }
  [DllImport("winmm.dll", CharSet = CharSet.Ansi)] public static extern uint midiOutGetDevCaps(uint id, out MIDIOUTCAPS caps, uint cb);
  [DllImport("winmm.dll")] public static extern uint midiOutOpen(out IntPtr h, uint id, IntPtr cb, IntPtr inst, uint flags);
  [DllImport("winmm.dll")] public static extern uint midiOutShortMsg(IntPtr h, uint msg);
  [DllImport("winmm.dll")] public static extern uint midiOutClose(IntPtr h);
  static Dictionary<string, IntPtr> open = new Dictionary<string, IntPtr>();
  public static int Find(string name) { uint n = midiOutGetNumDevs(); for (uint i = 0; i < n; i++) { MIDIOUTCAPS c; midiOutGetDevCaps(i, out c, (uint)Marshal.SizeOf(typeof(MIDIOUTCAPS))); if (c.szPname == name) return (int)i; } return -1; }
  public static string Open(string port) { if (open.ContainsKey(port)) return "ok"; int id = Find(port); if (id < 0) return port + ": NOT FOUND (loopMIDI port names are case-exact)"; IntPtr h; if (midiOutOpen(out h, (uint)id, IntPtr.Zero, IntPtr.Zero, 0) != 0) return port + ": open failed"; open[port] = h; return "ok"; }
  public static void Send(string port, int status, int d1, int d2) { IntPtr h; if (open.TryGetValue(port, out h)) midiOutShortMsg(h, (uint)(status | (d1 << 8) | (d2 << 16))); }
  public static void CloseAll() { foreach (var kv in open) { for (int ch = 0; ch < 16; ch++) { midiOutShortMsg(kv.Value, (uint)(0xB0 | ch | (123 << 8))); midiOutShortMsg(kv.Value, (uint)(0xE0 | ch | (64 << 16))); } midiOutClose(kv.Value); } open.Clear(); }
}
'@
# (CloseAll also centres the pitch bend on every channel of every port it opened — the bend probe's residue guard, 2026-09-07.)

$S = Get-Content -Raw -Encoding UTF8 $Schedule | ConvertFrom-Json
$notes = @($S.notes)
if ($Only) { $keep = $Only.Split(','); $notes = @($notes | Where-Object { $keep -contains $_.inst }) }
if (-not $notes.Count) { Write-Host 'nothing to play'; exit 1 }
$ports = @($notes | ForEach-Object { $_.port } | Sort-Object -Unique)
Write-Host ("balance probe: {0} notes on {1} | {2:N1} s | schedule {3}" -f $notes.Count, ($ports -join ' '), ($S.totalMs / 1000), (Split-Path -Leaf $Schedule))

if ($DryRun) {
    foreach ($n in $notes) { Write-Host ("  {0,6:N2} s  {1,-9} {2,-7} ch{3,-3} {4} note {5,3} vel {6,3}  ({7} ms){8}" -f ($n.tOnMs / 1000), $n.label, $n.port, $n.ch, $(if ($n.cc0 -ne $null) { 'cc0=' + $n.cc0 } elseif ($n.ks -ne $null) { 'ks=' + $n.ks } else { '     ' }), $n.pitch, $n.vel, ($n.tOffMs - $n.tOnMs), $(if ($n.step -ne $null) { '  ' + $n.step + $(if ($n.bend -ne $null) { ' bend ' + $n.bend } else { ' (no bend msg)' }) + $(if ($n.rpn -ne $null) { ' rpn0=' + $n.rpn } else { '' }) + $(if ($n.bendResetMs -ne $null) { ' reset@' + ($n.bendResetMs / 1000) } else { ' NO RESET' }) } else { '' })) }
    exit 0
}

foreach ($p in $ports) { $r = [BalanceMidi]::Open($p); if ($r -ne 'ok') { Write-Host $r; [BalanceMidi]::CloseAll(); exit 1 } }
Write-Host ("lead-in {0} s - recording should already be running" -f ($S.leadInMs / 1000))

# the event list: pre (CC7 / CC0 / keyswitch; the bend probe's RPN 0 and bend value), on, off, reset (the bend centred
# after the note, the bend probe only) - in absolute time
$events = New-Object System.Collections.Generic.List[object]
foreach ($n in $notes) {
    $events.Add([pscustomobject]@{ t = [double]$n.tPreMs; kind = 'pre'; n = $n })
    $events.Add([pscustomobject]@{ t = [double]$n.tOnMs;  kind = 'on';  n = $n })
    $events.Add([pscustomobject]@{ t = [double]$n.tOffMs; kind = 'off'; n = $n })
    if ($n.bendResetMs -ne $null) { $events.Add([pscustomobject]@{ t = [double]$n.bendResetMs; kind = 'reset'; n = $n }) }
}
$events = @($events | Sort-Object t)
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
    foreach ($e in $events) {
        $wait = $e.t - $sw.Elapsed.TotalMilliseconds
        if ($wait -gt 0) { Start-Sleep -Milliseconds ([int]$wait) }
        $n = $e.n; $chz = $n.ch - 1
        switch ($e.kind) {
            'pre' {
                # CC7 is MIDI VOLUME and the plugins bind their instrument/part volume to it, so sending it OVERWRITES any
                # per-voice trim the composer has set (RUNNING_LOG §373). A schedule made with --nocc7 carries cc7 = null and
                # nothing is sent, leaving his knobs exactly where he put them.
                if ($n.PSObject.Properties['cc7'] -eq $null -or $n.cc7 -ne $null) {
                    $cc7 = 127; if ($n.cc7 -ne $null) { $cc7 = [int]$n.cc7 }
                    [BalanceMidi]::Send($n.port, (0xB0 -bor $chz), 7, $cc7)
                }
                if ($n.cc0 -ne $null) { [BalanceMidi]::Send($n.port, (0xB0 -bor $chz), 0, [int]$n.cc0) }
                if ($n.ks -ne $null) { [BalanceMidi]::Send($n.port, (0x90 -bor $chz), [int]$n.ks, 100); Start-Sleep -Milliseconds 40; [BalanceMidi]::Send($n.port, (0x80 -bor $chz), [int]$n.ks, 0) }
                # the bend probe (PLAN 1f step 1, 2026-09-07): RPN 0 = pitch-bend sensitivity (CC101 0 · CC100 0 · CC6 value · CC38 0),
                # then the bend value itself, 14-bit, LSB first - both ride in the prelude so the note starts at its bent pitch
                if ($n.rpn -ne $null) { [BalanceMidi]::Send($n.port, (0xB0 -bor $chz), 101, 0); [BalanceMidi]::Send($n.port, (0xB0 -bor $chz), 100, 0); [BalanceMidi]::Send($n.port, (0xB0 -bor $chz), 6, [int]$n.rpn); [BalanceMidi]::Send($n.port, (0xB0 -bor $chz), 38, 0) }
                if ($n.bend -ne $null) { $bv = [int]$n.bend; [BalanceMidi]::Send($n.port, (0xE0 -bor $chz), ($bv -band 0x7F), (($bv -shr 7) -band 0x7F)) }
            }
            'on'  { [BalanceMidi]::Send($n.port, (0x90 -bor $chz), [int]$n.pitch, [int]$n.vel)
                    $c7 = 127; if ($n.cc7 -ne $null) { $c7 = [int]$n.cc7 }
                    Write-Host ("  {0,6:N2} s  {1,-9} {2,-7} note {3,3} vel {4,3} cc7 {5,3} {6}{7}" -f ($e.t / 1000), $n.label, $n.port, $n.pitch, $n.vel, $c7, $n.role, $(if ($n.step -ne $null) { ' ' + $n.step + $(if ($n.bend -ne $null) { ' bend ' + $n.bend } else { ' (no bend msg)' }) + $(if ($n.rpn -ne $null) { ' rpn0=' + $n.rpn } else { '' }) } else { '' })) }
            'off' { [BalanceMidi]::Send($n.port, (0x80 -bor $chz), [int]$n.pitch, 0) }
            'reset' { [BalanceMidi]::Send($n.port, (0xE0 -bor $chz), 0, 64) }
        }
    }
    Start-Sleep -Milliseconds 1500
} finally {
    [BalanceMidi]::CloseAll()
}
Write-Host ("done in {0:N1} s - stop the recording, then: python probes\analyze_balance.py <the wav>" -f $sw.Elapsed.TotalSeconds)
