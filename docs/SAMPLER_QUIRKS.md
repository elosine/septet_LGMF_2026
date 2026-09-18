> **Provenance (septet LGMF 2026, 2026-09-17):** copied unchanged from piece #5 `septet_2026/docs/SAMPLER_QUIRKS.md` with the port of the code it describes (PLAN 0b / 0g). **It describes the tool as it was built for the TEMPUS septet: its instrument names, its `§N` references into that piece's `RUNNING_LOG`, and its measurements are piece #5's.** The mechanism is what carries. Where this piece changes the tool, the change is recorded here and dated. **Only the Xsample entries apply to an instrument this piece has** (the cello, and the double bass by the same mechanism). The SI2 entries are about piece #5's flute; the piano entries are about instruments that are not here. Spitfire's own plugin — the percussion library (D6) — has never been driven by this stack and has no entry yet.

# Sampler & Reaper quirks — the septet's additions

> Piece #3's `docs/SAMPLER_QUIRKS.md` (in `for_bass_clarinet_harp_and_accordion`) is the ledger
> and applies here as written — monitoring, channel filters, single-client hardware inputs,
> UVI part channels, the octave-display conventions. This file holds only what the septet
> found on top of it, 2026-09-03 onward. One bullet each: symptom → cause → fix.

## Kontakt 8

- **Instrument goes silent right after a preset change; header shows `Memory: 0`.** Cause:
  the instrument's **Purge** state — Spitfire's panel has a "Purge unused" option, and a
  purge with nothing played yet unloads every sample; Kontakt does NOT reload purged samples
  when a note arrives, it plays silence. Fix: instrument header → **Purge ▾ → Reload all
  samples** (Memory climbs back). Leave "Purge unused" alone until a piece is finished and
  the played set is known. *(Plucked Piano, first sound, 2026-09-03.)*
- **Four slots of one instrument on one track (D11):** each slot's header `MIDI Ch` must be
  `[A] 1` … `[A] 4`. A slot left on `Omni` sounds on every channel — one note becomes four
  voices. Not readable from the `.rpp`; the one-note test is the check.

## Reaper 7.72

- **The default theme hides the record-input selector and the monitoring speaker** until
  the track is armed. Right-click the arm button for the same menu (Input → MIDI → port → All
  Channels; Monitor input). *(R3.)*
- **Plugging a hardware keyboard in while Reaper runs enables it as a Reaper input** (the
  ini's `midiins` mask already covered the new device index). Chrome's Web MIDI then gets
  nothing — the app is silent from the keyboard. Fix: Preferences → MIDI Devices → disable
  input on `Keystation 88 MK3` and `MIDIIN2 (Keystation 88 MK3)`, reload the app. *(First
  sound, 2026-09-03.)*
- **Reaper's REC-line device index is Reaper's own**, not winmm's; decode arm / channel /
  monitor / mode from the file, take the device identity from the track's own label.

## UVI Workstation (SI2, PP2)

- **The manual's keyswitch names are scientific (C4 = 60); the display is an octave lower**,
  and each instrument's switch zone sits just under its own extended range — the flute's at
  display C1 = MIDI 36, the tuba's at C0 = 24. Read the red keys, never the manual alone.
- **PP2's yellow octave is the Edit page's selected octave**, not a sound; its low blue keys
  C-1–G#-1 are Bar Hits (hands / sticks / mallets on the cast-iron plate).
- **Preset FX ship on:** IR reverb, and in PP2 a Maximizer (threshold −1 dB) and a Tilt EQ —
  bypass all of them in the rack (PLAN 0e's per-track rule).
- **A part with every MIC POSITION disabled is SILENT, and looks perfectly healthy** (composer,
  2026-09-09, RUNNING_LOG §321). A piano voice on its own channel produced nothing; the app's
  routing was correct all along (`plucked` ch 2 · `harmonics` ch 3 · `muted` ch 5 on port `Piano`,
  both Reaper tracks armed on all channels of the one device) and the cause was inside the plugin:
  *"ok fixed the mic choices were all turned off."* **Check the mics before suspecting the routing** —
  MIDI arrives, the meters may even move, and no sound comes out.

- **Flute: the SI2 Pizzicato sample stands in for the written TONGUE RAM** (composer, 2026-09-04:
  "pizzicato sounds loud in sample, just note that we'll notate this as tongue ram"). The recipe
  carries `notate: "tongue ram"` on `flute.pizzicato`; the notation layer (2a) reads it. The FX KS
  preset's own tongue ram (manual: third keyswitch, D1 = 38) was not seen in the loaded patch —
  only C1/C#1 lit; unverified until D1 is pressed on the FX part (Flute ch 5).

- **The balance, as set 2026-09-04 (RUNNING_LOG §46–47, §61):** Reaper faders — flute −21 · Fluteb −21 ·
  bass clarinet −9 · Piano Kontakt +7 · Piano PP2 +7 · violins 0 · viola −3.5 · cello −1; the strike lanes
  `Flute strikes` / `BassCl strikes` at 0. Anchor = the violins' Senza Vibrato at 127 (−27.45 dB, 400 ms,
  K-weighted). The recipe's `balanceDb` mirrors the faders. Re-run `tools/balance_schedule.js` +
  `probes/balance_probe.ps1` + `probes/analyze_balance.py` after any library or preset change.
- **Strike lanes:** the flute Pizzicato part (UVI Part 13) goes to `$Engine/Out 2` (plugin pins 3/4 →
  track channels 3/4 → a post-FX pre-fader send → `Flute strikes`); the bass clarinet's slap plays a
  second copy of the instrument in Kontakt slot 5 ("Bass Clarinet STRIKE", [A] 5, output st.2 →
  `BassCl strikes`). Both built by script (`tools/uvi_state.js set-output`, `reaper/kontakt/
  bcl_strike_slot.lua`, `reaper/bridge/jobs/strike_lane.lua`); the app routes by the recipe's channel.

- **The state header is 496 bytes on this machine, not 312** (LGMF, RUNNING_LOG §22, 2026-09-17): a 288-byte Reaper prefix, LE
  sizes at 288/300, the VST2 fxBank wrapper (`VstW … CcnK <BE byteSize> FBCh … UVIW`), `<BE 12 + compressed> UVI4 <version> <xml
  length>`, the zlib stream, a zero tail. `tools/uvi_state.js` reads the compressed length from the field before `UVI4` and rewrites
  every size field past 288 in its own byte order; a push with stale sizes is accepted by Reaper and SILENTLY ignored by UVI.
- **A `<Program>` in the state is the program itself, not a reference.** `ProgramPath` alone yields a labeled EMPTY program (silent);
  a cloned body keeps its own sound whatever the path says. So: load each preset ONCE in the GUI; every copy, move, re-channel,
  re-instance, gain and bypass after that is text. (RUNNING_LOG §22, proven with the meters.)
- **A push replaces the whole instance state** — GUI edits made between the decode and the push are lost. Hand the instance over
  in words before touching it.

## Xsample (Kontakt)

- **CC#0 88–117 are the keyswitch banks' stored slots, not presets** — piece #1's registry
  values 89 / 95 / 97 meant "whatever that Kontakt had stored there". Use direct presets,
  CC#0 = preset − 1. (RUNNING_LOG §29.)
- **Every flutter-tongue sample preset of the bass clarinet tops out at C4 (60)**, the rest
  at F4 (65); glissandi at F#1 (42); multiphonics at A#1 (46); the composer's Flutter LOCK
  (#34) sits at G2–A5 (55–93). Strings: violin G2–F6 (55–101), viola C2–A5 (48–93), cello
  C1–B4 (36–83) on the standard presets; open-string presets narrow to the strings' zone.
- **Silent track, meter flashing, the instrument plays from Kontakt's own keyboard** — the
  slot's `MIDI Ch` is not the channel being sent. With one port per instrument (the septet),
  every instrument's slot 1 sits on **[A] 1**; numbering instruments across channels (vn2 =
  ch 2, va = 3 …) is the quartet's one-port habit and leaves channel 1 unheard. The one-move
  test: switch the silent track's input to a port that works — if it stays silent, the fault
  is inside that track's plugin. *(Vn2 / Va / Vc, first sound, 2026-09-03.)*
