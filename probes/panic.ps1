# panic.ps1 - silence the rack: on EVERY loopMIDI port of the septet, on all 16 channels, an explicit note-off for every key
# (Xsample in Kontakt does not honour CC123, piece #1's finding), then CC120 / CC123, the pitch bend centred, CC7 back to 127.
# Written 2026-09-07 for a trapped note (composer: "midi note trapped won't stop playing"; RUNNING_LOG §176).
#
#   powershell -NoProfile -File probes\panic.ps1            # every port
#   powershell -NoProfile -File probes\panic.ps1 -Ports Vn1,Va
param([string[]]$Ports = @('Flute', 'Fluteb', 'BassCl', 'Piano', 'Vn1', 'Vn2', 'Va', 'Vc'))

Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Collections.Generic;
public class PanicMidi {
  [DllImport("winmm.dll")] public static extern uint midiOutGetNumDevs();
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
  public struct MIDIOUTCAPS { public ushort wMid; public ushort wPid; public uint vDriverVersion; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string szPname; public ushort wTechnology; public ushort wVoices; public ushort wNotes; public ushort wChannelMask; public uint dwSupport; }
  [DllImport("winmm.dll", CharSet = CharSet.Ansi)] public static extern uint midiOutGetDevCaps(uint id, out MIDIOUTCAPS caps, uint cb);
  [DllImport("winmm.dll")] public static extern uint midiOutOpen(out IntPtr h, uint id, IntPtr cb, IntPtr inst, uint flags);
  [DllImport("winmm.dll")] public static extern uint midiOutShortMsg(IntPtr h, uint msg);
  [DllImport("winmm.dll")] public static extern uint midiOutClose(IntPtr h);
  public static int Find(string name) { uint n = midiOutGetNumDevs(); for (uint i = 0; i < n; i++) { MIDIOUTCAPS c; midiOutGetDevCaps(i, out c, (uint)Marshal.SizeOf(typeof(MIDIOUTCAPS))); if (c.szPname == name) return (int)i; } return -1; }
  public static int Panic(string port) {
    int id = Find(port); if (id < 0) return -1;
    IntPtr h; if (midiOutOpen(out h, (uint)id, IntPtr.Zero, IntPtr.Zero, 0) != 0) return -2;
    int sent = 0;
    for (int ch = 0; ch < 16; ch++) {
      for (int k = 0; k < 128; k++) { midiOutShortMsg(h, (uint)((0x80 | ch) | (k << 8))); sent++; }
      midiOutShortMsg(h, (uint)((0xB0 | ch) | (120 << 8))); midiOutShortMsg(h, (uint)((0xB0 | ch) | (123 << 8)));
      midiOutShortMsg(h, (uint)((0xE0 | ch) | (64 << 16))); midiOutShortMsg(h, (uint)((0xB0 | ch) | (7 << 8) | (127 << 16)));
      midiOutShortMsg(h, (uint)((0xB0 | ch) | (64 << 8)));   // sustain pedal up
      sent += 5;
    }
    midiOutClose(h); return sent;
  }
}
'@

foreach ($p in $Ports) {
    $n = [PanicMidi]::Panic($p)
    if ($n -eq -1) { Write-Host ("  {0,-8} NOT FOUND (loopMIDI port names are case-exact)" -f $p) -ForegroundColor Red }
    elseif ($n -eq -2) { Write-Host ("  {0,-8} open failed" -f $p) -ForegroundColor Red }
    else { Write-Host ("  {0,-8} silenced: {1} messages (note-off on every key of 16 channels, CC120, CC123, bend centred, CC7 127, pedal up)" -f $p, $n) -ForegroundColor Green }
}
