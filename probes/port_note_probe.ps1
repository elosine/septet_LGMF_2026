# port_note_probe.ps1 - play ONE note straight into a loopMIDI port (winmm), bypassing the app.
# The bisecting probe for "X is silent": if this sounds, Reaper + the plugin are right and the
# fault is in the app's path; if not, it is on the Reaper / plugin side. Born 2026-09-03 at the
# septet's first sound (RUNNING_LOG §31), from piece #4's cc7_calibration_probe.ps1 skeleton.
#
#   .\probes\port_note_probe.ps1 -Port Vc -Channel 1 -CC0 5 -Note 48 -Ms 2000
#
# CC7 = 127 is sent first (the residue guard), then CC0 (preset select; -1 = don't send), a
# 300 ms settle, the note, the note-off.
param(
    [string]$Port = 'Vc',
    [int]$Channel = 1,        # 1-based
    [int]$CC0 = -1,           # Xsample: preset number - 1; -1 = leave the preset as it is
    [int]$Note = 48,
    [int]$Velocity = 100,
    [int]$Ms = 1500
)

Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Threading;
public class PortNoteProbe {
  [DllImport("winmm.dll")] public static extern uint midiOutGetNumDevs();
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
  public struct MIDIOUTCAPS { public ushort wMid; public ushort wPid; public uint vDriverVersion; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string szPname; public ushort wTechnology; public ushort wVoices; public ushort wNotes; public ushort wChannelMask; public uint dwSupport; }
  [DllImport("winmm.dll", CharSet = CharSet.Ansi)] public static extern uint midiOutGetDevCaps(uint id, out MIDIOUTCAPS caps, uint cb);
  [DllImport("winmm.dll")] public static extern uint midiOutOpen(out IntPtr h, uint id, IntPtr cb, IntPtr inst, uint flags);
  [DllImport("winmm.dll")] public static extern uint midiOutShortMsg(IntPtr h, uint msg);
  [DllImport("winmm.dll")] public static extern uint midiOutClose(IntPtr h);
  public static int Find(string name) { uint n = midiOutGetNumDevs(); for (uint i = 0; i < n; i++) { MIDIOUTCAPS c; midiOutGetDevCaps(i, out c, (uint)Marshal.SizeOf(typeof(MIDIOUTCAPS))); if (c.szPname == name) return (int)i; } return -1; }
  public static string Play(string port, int ch, int cc0, int note, int vel, int ms) {
    int id = Find(port); if (id < 0) return port + ": NOT FOUND (loopMIDI port names are case-exact)";
    IntPtr h; if (midiOutOpen(out h, (uint)id, IntPtr.Zero, IntPtr.Zero, 0) != 0) return port + ": open failed";
    uint st = (uint)(0xB0 | (ch - 1));
    midiOutShortMsg(h, st | (7u << 8) | (127u << 16));
    if (cc0 >= 0) midiOutShortMsg(h, st | (0u << 8) | ((uint)cc0 << 16));
    Thread.Sleep(300);
    midiOutShortMsg(h, (uint)(0x90 | (ch - 1)) | ((uint)note << 8) | ((uint)vel << 16));
    Thread.Sleep(ms);
    midiOutShortMsg(h, (uint)(0x80 | (ch - 1)) | ((uint)note << 8));
    Thread.Sleep(200);
    midiOutClose(h);
    return port + ": sent ch" + ch + (cc0 >= 0 ? " cc0=" + cc0 : "") + " note " + note + " vel " + vel + " for " + ms + " ms";
  }
}
'@

[PortNoteProbe]::Play($Port, $Channel, $CC0, $Note, $Velocity, $Ms)
