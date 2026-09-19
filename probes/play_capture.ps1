# play_capture.ps1 - PLAN 1b.5 (2026-09-19): replay a CAPTURED MIDI event list into the rack, in real time.
#
#   .\probes\play_capture.ps1 -Capture midi\lgmf-1b5.capture.json
#
# WHY THIS EXISTS. Every probe so far sent MIDI that a SCHEDULE described - my arithmetic, not the app's.
# 1b.5 has to test the app's own decisions, so the chain is:
#     composer.html (headless, virtual clock)  ->  tools/capture_composer_midi.js  ->  this  ->  the rack
# The capture is every message his playback sends, with the timestamp it was sent for; this plays that list
# back down the same loopMIDI ports at wall-clock speed while REC records. Nothing sits between the app's
# choice of velocity and CC7 and the sound being measured.
#
# The event shape is the capture's own: [port, seconds, [status, data1, data2]].
param(
    [string]$Capture = '',
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
if (-not $Capture) { Write-Host 'give -Capture <file>'; exit 1 }
if (-not [System.IO.Path]::IsPathRooted($Capture)) { $Capture = Join-Path $repo $Capture }
if (-not (Test-Path $Capture)) { Write-Host "no capture at $Capture"; exit 1 }

Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Collections.Generic;
public class CapMidi {
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

$C = Get-Content -Raw -Encoding UTF8 $Capture | ConvertFrom-Json
$ev = @($C.events | Sort-Object { [double]$_[1] })
if (-not $ev.Count) { Write-Host 'the capture has no events'; exit 1 }
$ports = @($ev | ForEach-Object { [string]$_[0] } | Sort-Object -Unique)
$endS = [double]$ev[$ev.Count - 1][1]
Write-Host ("capture: {0} messages on {1} | {2:N1} s | {3}" -f $ev.Count, ($ports -join ' '), $endS, (Split-Path -Leaf $Capture))

foreach ($p in $ports) { $r = [CapMidi]::Open($p); if ($r -ne 'ok') { Write-Host "  $r"; [CapMidi]::CloseAll(); exit 2 } }
if ($DryRun) {
    $on = @($ev | Where-Object { ([int]$_[2][0] -band 0xF0) -eq 0x90 -and [int]$_[2][2] -gt 0 })
    Write-Host ("  dry run - {0} note-ons, first at {1:N2} s, last at {2:N2} s" -f $on.Count, [double]$on[0][1], [double]$on[$on.Count-1][1])
    [CapMidi]::CloseAll(); exit 0
}

# warm the type before the clock starts, so a .NET compile cannot eat the lead-in (the lesson of S53)
[CapMidi]::Send($ports[0], 0xB0, 123, 0)
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$i = 0
try {
    while ($i -lt $ev.Count) {
        $due = [double]$ev[$i][1] * 1000.0
        $wait = $due - $sw.Elapsed.TotalMilliseconds
        if ($wait -gt 1.5) { Start-Sleep -Milliseconds ([int][math]::Floor($wait)) }
        else { while ($sw.Elapsed.TotalMilliseconds -lt $due) { } }
        $e = $ev[$i]
        [CapMidi]::Send([string]$e[0], [int]$e[2][0], [int]$e[2][1], [int]$e[2][2])
        $i++
    }
    Start-Sleep -Milliseconds 1500
}
finally { [CapMidi]::CloseAll() }
Write-Host ("done in {0:N1} s - {1} messages sent" -f $sw.Elapsed.TotalSeconds, $i)
