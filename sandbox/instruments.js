// Rendering-recipe config — septet 2026 (PLAN 0b skeleton, 2026-09-03; PLAN 0c fills it in).
//
// One entry per TRACK (score/public/composer.html TRACKS[].instKey). Schema, inherited from
// pieces #3/#4: { label, port, rangeLow, rangeHigh, mechanism?, techniques: [{ key, label,
// channel, port?, cc0?, ks?, rangeLow?, rangeHigh? }] }.
//   - `port` is the loopMIDI port (case-exact); a technique's own `port` overrides it — the
//     overflow-instance pattern for UVI instruments with more than 16 techniques (piece #4).
//   - `channel` is 1-based. `cc0` = Xsample articulation select, sent as a prelude before the
//     note (piece #3's mechanism, kept in the app: composer.html sends CC#0 wherever tech.cc0
//     is set). `ks` = keyswitch notes. `oneShot: true` marks Xsample presets that revert to
//     the base mode after one note (piece #1's cc_mapping_registry state rules).
//   - Ranges are MIDI numbers, middle C = 60. Per-technique ranges override the instrument's.
//
// STATUS: every channel number and range below is PROVISIONAL until PLAN 0e (the rack build)
// and 0c (the recipes) confirm it against the actual UVI / Kontakt builds. Sources per entry.
// Libraries (journal D7): SI2 flute · Xsample bass clarinet · 8Dio Steinway + IRCAM Prepared
// Piano 2 · Xsample Contemporary Solo Strings.
const INSTRUMENTS = {
  // ---- FLUTE — IRCAM Solo Instruments 2 "Flute in C" (UVI, one part per PRESET) ----
  // Re-rostered 2026-09-03 (PLAN 0e R3, RUNNING_LOG §20). The composer's UVI browser shows 19
  // Flute presets: 10 single-technique patches and 9 "KS" patches holding 2–3 techniques each,
  // chosen by a keyswitch note (SI2 manual pp. 10–12, "Layers & Keyswitches – Flute"). One UVI
  // part per PRESET, loaded in the browser's alphabetical order: 16 on "Flute" (A1–A16), the last
  // three on "Fluteb" (A1–A3; 13 slots free for the curve copies of 0c.7). A technique KEY names
  // what the player does; `preset` names the UVI patch; a KS mode carries `ks` = the switch note
  // the prelude latches before the note (`tech.ks`, wired at 0c.7 — until then the object's own
  // `ksNote`, the tuba path). KEYSWITCH NUMBERS: the manual's note names are scientific (C4 = 60),
  // but the FLUTE's switches sit an octave above the tuba's: the composer's UVI screenshot at R3
  // (A1, Aeolian KS) shows the red key at display C1 = MIDI 36, just under the tan extended range
  // that starts at C#1 — SI2 puts each instrument's KS zone under its own range. So manual C1 → 36,
  // C#1 → 37, D1 → 38; Durations KS (manual C2/C#2) → 48/49. Each KS preset is checked on its red
  // keys as it loads. Range: sounding C4–C7, B3 with the extension
  // → MIDI 59–96 (manual p. 51); per-preset ranges are read from the UVI GUI at 0c, never
  // ear-scanned. Multiphonics Menu: one multiphonic per key, display C3–F5 = MIDI 60–89 (manual
  // "FLUTE Multiphonics"). Piccolo / bass flute are NOT here yet — undecided (D6; CN-2, CN-4).
  // D11 / 0c.7 for the FLUTE (composer, 2026-09-08: "for [the flute] lets use the kontakt standard and use the appropriate number of
  // addl instances … the principle for playback/demo is best result for least/most efficient use of work"). On UVI a channel IS a
  // technique, so a curve channel cannot be "the same instrument again" as a Kontakt slot can: it must be a curve COPY of a technique.
  // Three copies of ORDINARIO on the `Fluteb` port (which uses 1–3 today and has thirteen slots free) give the flute the Kontakt
  // standard of three curve channels for the one technique that swells. Every other flute technique has no copy and stays on its own
  // channel, as before. `curveTechniques` says which keys have copies; a curve entry may name its own port.
  flute: { channels: { curve: [{ port: "Fluteb", ch: 4 }, { port: "Fluteb", ch: 5 }, { port: "Fluteb", ch: 6 }], curveTechniques: ["ord"] },
    balanceDb: -21, ordinary: "ord", playerBendSt: 1, bendRangeSt: 1.99,   // `ordinary` (PLAN 1g item 4, 2026-09-06): the instrument's ordinary voice — a new trill's default, the voice the sweep measured
    // THE BEATING PALETTE (PLAN 1f step 1, 2026-09-07): `playerBendSt` = how far the real player may bend, his rule "usually within semitone at the most" (1 for
    // all six; the winds by embouchure, to be narrowed by his ear when heard); `bendRangeSt` = the sampler's range in semitones per full pitch bend — PROVISIONAL
    // until the bend probe (`node tools/balance_schedule.js --bend` → the rack → probes/analyze_bend.py → tools/apply_bend_ranges.js) writes MEASURED_BEND below:
    // 1.99 for the UVI flute (the tuba piece measured SI2 at 1.99, RPN ignored), 2 (Kontakt's default) for the Xsample instruments. `beating: false` = never a
    // beating player (the piano, CN-34: an anchor only). The tick reads bendRangeSt from PLAN 1f step 3 on (the tuba's 1.99 constant until then).
    label: "Flute",
    port: "Flute",
    rangeLow: 59,
    rangeHigh: 96,
    techniques: [
      // A1 · Flute Aeolian KS
      { key: "aeolian_and_ord", label: "Aeolian & Ordinario",        preset: "Flute Aeolian KS",            channel: 1,  ks: 36, rangeLow: 60, rangeHigh: 83 },   // native C3–B4 (UVI) = MIDI 60–83; tan extension 37–59 and 84+ (screenshot 2026-09-03)
      { key: "aeolian",         label: "Aeolian",                    preset: "Flute Aeolian KS",            channel: 1,  ks: 37, rangeLow: 60, rangeHigh: 83 },   // C#1 red? — composer to confirm (manual: second switch)
      // A2 · Flute Chromatic Scale
      { key: "chrom_scale",     label: "Chromatic Scale",            preset: "Flute Chromatic Scale",       channel: 2,  rangeLow: 48, rangeHigh: 96 },   // A2 screenshot: white C2→ past C5 (right end cut; 96 = the instrument top, provisional); no red keys; purple at C3 + C4 — meaning not in the manual legend; no tan
      // A3 · Flute Cresc & Decrescendo KS
      { key: "cresc",           label: "Crescendo",                  preset: "Flute Cresc & Decrescendo KS", channel: 3, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A3 screenshot: red C1 + C#1; white C3→C6 and beyond (cut ~D6); grey below C3, no tan
      { key: "cresc_decresc",   label: "Crescendo to Decrescendo",   preset: "Flute Cresc & Decrescendo KS", channel: 3, ks: 37, rangeLow: 60, rangeHigh: 96 },
      { key: "decresc",         label: "Decrescendo",                preset: "Flute Cresc & Decrescendo KS", channel: 3, ks: 38, rangeLow: 60, rangeHigh: 96 },   // D1 looked GREY in the A3 screenshot, not red — the manual's third switch; verify by pressing it
      // A4 · Flute Durations KS (fixed-length notes; manual: C2 / C#2)
      { key: "dur_0_5s",        label: "Duration 0.5 s",             preset: "Flute Durations KS",          channel: 4,  ks: 48, rangeLow: 60, rangeHigh: 96 },   // A4 screenshot: red C2 (48) ✓ manual; C#2 looked black (second switch unconfirmed); white C3→C6+, grey below, no tan
      { key: "dur_1s",          label: "Duration 1 s",               preset: "Flute Durations KS",          channel: 4,  ks: 49, rangeLow: 60, rangeHigh: 96 },   // C#2 — verify (not red on screen)
      // A5 · Flute FX KS
      { key: "jet_whistle",     label: "Jet Whistle",                preset: "Flute FX KS",                 channel: 5,  ks: 36, rangeLow: 48, rangeHigh: 83 },   // A5 screenshot: red C1 + C#1; tan D1–B1 (38–47) and C5+ (84+); white C2–B4 native; PURPLE C4
      { key: "key_click",       label: "Key Click",                  preset: "Flute FX KS",                 channel: 5,  ks: 37, rangeLow: 48, rangeHigh: 83 },
      { key: "tongue_ram",      label: "Tongue Ram",                 preset: "Flute FX KS",                 channel: 5,  ks: 38, rangeLow: 48, rangeHigh: 83 },   // D1 is TAN on screen, not red — the manual's third switch (tongue ram); verify by pressing   // UNVERIFIED in the loaded patch (composer, 2026-09-04: "i dont see a tongue ram in the sampler") — only C1/C#1 were red in the A5 screenshot; press D1 (38) on the FX KS part to settle it; until then the written tongue ram uses the pizzicato sample
      // A6 · Flute Finger Modes KS
      { key: "harmonic_fing",   label: "Harmonic Fingering",         preset: "Flute Finger Modes KS",       channel: 6,  ks: 36, rangeLow: 79, rangeHigh: 96 },   // A6 screenshot: red C1; white only from ≈G4 (display) → C6+ = MIDI ≈79–96 (upper register); grey elsewhere, no tan
      { key: "discolored_fing", label: "Discolored Fingering",       preset: "Flute Finger Modes KS",       channel: 6,  ks: 37, rangeLow: 79, rangeHigh: 96 },   // C#1 not red on screen — verify
      // A7 · Flute Flatterzunge
      { key: "flz",             label: "Flatterzunge",               preset: "Flute Flatterzunge",          channel: 7,  rangeLow: 60, rangeHigh: 96 },   // A7 screenshot: no red keys; white C3→C6 (60–96), grey beyond C6 — the top is C6 display = MIDI 96; no tan
      // A8 · Flute Fortepiano
      { key: "fortepiano",      label: "Fortepiano",                 preset: "Flute Fortepiano",            channel: 8,  rangeLow: 60, rangeHigh: 96 },   // A8 screenshot: no red keys; white C3→C6 (60–96), grey beyond; no tan
      // A9 · Flute Multiphonics Menu (one multiphonic per key)
      { key: "multiphonics",    label: "Multiphonics Menu",          preset: "Flute Multiphonics Menu",     channel: 9,  rangeLow: 60, rangeHigh: 89 },   // A9 screenshot: no red keys; white C3→F5 DISPLAY = MIDI 60–89, one multiphonic per key (30, = the manual's table C3..F5 read as display names); tan below C3 and above F5
      // A10 · Flute Ord & Aeolian KS (the two transitions)
      { key: "ord_to_aeolian",  label: "Ordinario to Aeolian",       preset: "Flute Ord & Aeolian KS",      channel: 10, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A10 screenshot: red C1; C#1 not red; white C3→C6 (60–96); grey elsewhere, no tan
      { key: "aeolian_to_ord",  label: "Aeolian to Ordinario",       preset: "Flute Ord & Aeolian KS",      channel: 10, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      // A11 · Flute Ord & Flatterzunge KS (the two transitions)
      { key: "ord_to_flz",      label: "Ordinario to Flatterzunge",  preset: "Flute Ord & Flatterzunge KS", channel: 11, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A11 screenshot: as A10 — red C1, white C3→C6, grey elsewhere
      { key: "flz_to_ord",      label: "Flatterzunge to Ordinario",  preset: "Flute Ord & Flatterzunge KS", channel: 11, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      // A12 · Flute Ordinario
      { key: "ord",             label: "Ordinario",                  preset: "Flute Ordinario",             channel: 12, rangeLow: 60, rangeHigh: 96 },   // A12 screenshot: no red keys; white C3→C6 (60–96); B2 grey (the manual's B3 extension is not in this patch); no tan
      // A13 · Flute Pizzicato
      { key: "pizzicato",       label: "Pizzicato",                  preset: "Flute Pizzicato",  notate: "tongue ram", lane: "Flute strikes",             channel: 13, rangeLow: 60, rangeHigh: 84 },   // A13 screenshot: no red keys; white C3→C5 native (60–84); tan below C3 and above C5 (stretched)   // NOTATES AS TONGUE RAM (composer, 2026-09-04: "pizzicato sounds loud in sample, just note that we'll notate this as tongue ram") — the SI2 pizzicato sample stands in for the written tongue ram; RUNNING_LOG §44
      // A14 · Flute Play & Sing KS
      { key: "play_sing",       label: "Play and Sing (sung C4)",    preset: "Flute Play & Sing KS",        channel: 14, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A14 screenshot: red C1; C#1 not red; tan C#1–B2 (37–59) below; white from C3 (60), right end cut in the frame (top provisional 96)
      { key: "play_sing_unison",label: "Play and Sing Unison",       preset: "Flute Play & Sing KS",        channel: 14, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      // A15 · Flute Quartertones Ordinario
      { key: "ord_1q",          label: "Ordinario quarter-tone",     preset: "Flute Quartertones Ordinario", channel: 15, rangeLow: 60, rangeHigh: 96 },   // A15 screenshot: no red keys; white C3→C6 (60–96), grey elsewhere, no tan. Which quarter-tone each key sounds (above? below?) — 0c, by ear
      // A16 · Flute Sforzando
      { key: "sforzando",       label: "Sforzando",                  preset: "Flute Sforzando",             channel: 16, rangeLow: 60, rangeHigh: 96 },   // A16 screenshot: no red keys; white C3→C6 (60–96); grey elsewhere, no tan
      // ---- second instance "Fluteb" (A1–A3) ----
      { key: "staccato",        label: "Staccato",                   preset: "Flute Staccato",              port: "Fluteb", channel: 1, rangeLow: 60, rangeHigh: 96 },   // Fluteb A1 screenshot: no red keys; white C3→C6 (60–96) native; tan below C3 and above C6 (stretched)
      { key: "trill_m2",        label: "Trill minor 2nd",            preset: "Flute Trills KS",             port: "Fluteb", channel: 2, ks: 36, rangeLow: 60, rangeHigh: 96 },   // Fluteb A2 screenshot: red C1; C#1 not red; white C3→C6 (60–96); grey elsewhere, no tan
      { key: "trill_M2",        label: "Trill major 2nd",            preset: "Flute Trills KS",             port: "Fluteb", channel: 2, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      { key: "whistle_tones",   label: "Whistle Tones",              preset: "Flute Whistle Tones",         port: "Fluteb", channel: 3, rangeLow: 48, rangeHigh: 84 },   // Fluteb A3 screenshot: no red keys; white C2→C5 (48–84) native; tan below C2 and above C5
    ],
  },
  // ---- BASS CLARINET — Xsample (Kontakt), CC#0 selects the preset (preset N => CC#0 N-1) ----
  // THE KEYSWITCH ZONE, decoded 2026-09-03 at R5 from the composer's Kontakt screenshots + the AIL
  // Extended Scripting manual (#3 docs/manuals/extracted/Xsample_AIL_Extended_Scripting.txt, pp. 3, 8, 22).
  // Manual names are scientific (C4 = 60); Kontakt DISPLAYS one octave lower (C3 = 60). MIDI numbers:
  //   21 22 23  (Kontakt A-1 A#-1 B-1, GREEN)  velocity-sensitive function keys — LOW velocity: select
  //             Key Switch Bank 1 / 2 / 3; HIGH velocity: A-1 = Tune Base Note mode, A#-1 = Toggle
  //             Switch mode, B-1 = Trill & Slide mode.
  //   24–33     (Kontakt C0–A0, RED) 10 key switches per bank, 3 banks = 30 preset slots (Store KS).
  //   Tune Base Note mode: keys 22–33 set the base note of the current tuning (pure tunings).
  //   Toggle Switch mode (or CC#0 121): MAGENTA keys 28–33 (E0–A0) toggle sound slots 1–6 on/off
  //             (the <1>/<0> row above the slots); 24–27 stay key switches.
  //   Trill & Slide mode (or CC#0 122): 27 (D#0) half-tone trill · 28 (E0) whole-tone trill (aftertouch =
  //             speed) · 29 (F0, yellow) slot round-robin counter reset · 30 slide down / 31 slide up
  //             (release switch) · 32 slide down / 33 slide up (legato); 24–26 stay key switches.
  //   Preset Mode off = Phrase Mode on (button, blue A#7, or CC#0 126/127): the yellow keys play the
  //             Phrase Designer's phrases (monophonic).
  // CC#0 covers all of it without a key: 0–87 presets 1–88 · 88–117 keyswitch-bank presets 1–30 ·
  //   118/119/120 bank 1/2/3 · 121 toggle mode · 122 slide & trill mode · 126/127 preset/phrase mode;
  //   round robin by CC#82 (0–20 on repetition · 21–41 off · 42–62 random · 63–83 always).
  // THE FLOOR RULE follows: playable A#0–F4 on the display = MIDI 34–65; nothing below 34 is ever sent
  //   as a note (21–33 are switches and function keys). Candidate techniques for 0c: the two trills and
  //   the four slides — CC#0 122 + the function key, then CC#0 118 to leave the mode.
  // Started from piece #3 sandbox/instruments.js `bass_clarinet_xs` (13 starter presets); the FULL menu
  // the deep map is #3/docs/XSAMPLE_BASSCL_map.md. Floor rule: never send below MIDI 34.
  bass_clarinet: { balanceDb: -9, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [2, 3, 4] },   // D11: ch 1 MAIN · 2–4 CURVE A/B/C — the four Kontakt slots his rack holds (his screenshots, 2026-09-08)
    label: "Bass Clarinet",
    port: "BassCl",
    rangeLow: 34,   // floor rule: never send below MIDI 34 (keyswitch/function zone)
    rangeHigh: 65,  // standard zone per XSAMPLE_BASSCL_map §6d
    mechanism: "cc0",
    techniques: [
      // The full Preset Menu as the composer's Kontakt shows it (screenshots, R5, 2026-09-03): 33 factory
      // presets + #34 Flutter LOCK (piece #3's bespoke preset) + Free Preset slots 35–88 for our own.
      // CC#0 = preset number − 1. `mw: true` = the wheel (CC1) shapes the dynamic — curve-channel
      // material under D11; Velocity presets are main-channel material. Ranges: standard A#0–F4 = 34–65;
      // flutter-tongue sample presets 34–60; glissandi 34–42; multiphonics 34–46; #34 55–93.
      { key: "senza_mw", label: "Senza Vibrato MW (#1)", channel: 1, cc0: 0, rangeLow: 34, rangeHigh: 65, mw: true },   // GUI A#0–F4 (screenshot, R5)
      { key: "natural_vib_mw", label: "Natural Vibrato MW (#2)", channel: 1, cc0: 1, rangeLow: 34, rangeHigh: 65, mw: true },   // GUI A#0–F4 (screenshot, R5); the sampled vibrato, vs the curve-channel CC4 width
      { key: "stac_vel_mwshape", label: "Staccato Velocity MW Shape (#3)", channel: 1, cc0: 2, rangeLow: 34, rangeHigh: 65, mw: true },   // standard zone assumed (composer sends only the ones that differ)
      { key: "stac2_mwshape", label: "Staccato 2 MW Shape (#4)", channel: 1, cc0: 3, rangeLow: 34, rangeHigh: 65, mw: true },   // standard zone assumed
      { key: "flutter_mw", label: "Flutter Tongue MW (#5)", channel: 1, cc0: 4, rangeLow: 34, rangeHigh: 60, mw: true },   // GUI high C4 — the flutter-tongue sample presets stop a fourth short (screenshot, R5)
      { key: "slap", label: "Slap Tongue Velocity (#6)", channel: 5, cc0: 5, rangeLow: 34, rangeHigh: 65, lane: "BassCl strikes" },   // STRIKE SLOT (2026-09-04, PLAN 0k.4 / B): a second copy of the instrument on [A] 5 → Kontakt output st.2 → the "BassCl strikes" Reaper lane, own gain; built by reaper/kontakt/bcl_strike_slot.lua; RUNNING_LOG §60   // #3 map §6d, GUI-read 2026-08-08
      { key: "gliss_undef", label: "Glissando Undefined MW Shape (#7)", channel: 1, cc0: 6, rangeLow: 34, rangeHigh: 42, mw: true },   // GUI A#0–F#1 (screenshot, R5): the narrow gesture zone
      { key: "undef_tones", label: "Undefined Tones Velocity (#8)", channel: 1, cc0: 7, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d (Trigger off, Timer 0)
      { key: "key_noises", label: "Key Noises Velocity (#9)", channel: 1, cc0: 8, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d
      { key: "mp_short", label: "Multiphonics Velocity (#10)", channel: 1, cc0: 9, rangeLow: 34, rangeHigh: 46 },   // GUI A#0–A#1 (screenshot, R5); 13 keys, cataloged in #3's map §6c
      { key: "air_noises", label: "Air Noises Velocity (#11)", channel: 1, cc0: 10, rangeLow: 34, rangeHigh: 65 },   // GUI A#0–F4 (screenshot, R5); Legato Int. 39 factory
      { key: "cresc", label: "Crescendo (#12)", channel: 1, cc0: 11, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d
      { key: "senza_vel", label: "Senza Vibrato Velocity (#13)", channel: 1, cc0: 12, rangeLow: 34, rangeHigh: 65 },   // standard zone assumed
      { key: "natural_vib_vel", label: "Natural Vibrato Velocity (#14)", channel: 1, cc0: 13, rangeLow: 34, rangeHigh: 65 },   // standard zone assumed
      { key: "morph_vxmw", label: "Senza Vibrato + Flutter Tongue Velocity X MW (#15)", channel: 1, cc0: 14, rangeLow: 34, rangeHigh: 60, mw: true },   // GUI high C4 (screenshot, R5) — the flutter layer caps it
      { key: "flutter_vel", label: "Flutter Tongue Velocity (#16)", channel: 1, cc0: 15, rangeLow: 34, rangeHigh: 60 },   // GUI high C4 (screenshot, R5)
      { key: "senza_vel_mwinv", label: "Senza Vibrato Velocity + MW inverted (#17)", channel: 1, cc0: 16, rangeLow: 34, rangeHigh: 65, mw: true },   // standard zone assumed
      { key: "triple16", label: "Triple Tongue 16T (#18)", channel: 1, cc0: 17, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d (RR always rnd)
      { key: "stac_vel", label: "Staccato Velocity (#19)", channel: 1, cc0: 18, rangeLow: 34, rangeHigh: 65 },   // standard zone assumed
      { key: "accent_vel", label: "With Accent Velocity (#20)", channel: 1, cc0: 19, rangeLow: 34, rangeHigh: 65 },   // standard zone assumed
      { key: "gliss_undef_mw", label: "Glissando Undefined MW (#21)", channel: 1, cc0: 20, rangeLow: 34, rangeHigh: 42, mw: true },   // GUI A#0–F#1 (screenshot, R5): the wheel-shaped sibling of #7
      { key: "mp_loop", label: "Multiphonics MW (#22)", channel: 1, cc0: 21, rangeLow: 34, rangeHigh: 46, mw: true },   // GUI A#0–A#1 (screenshot, R5)
      { key: "air_noises_mw", label: "Air Noises MW (#23)", channel: 1, cc0: 22, rangeLow: 34, rangeHigh: 65, mw: true },   // standard zone assumed
      { key: "vib_mw", label: "Vibrato MW (#24)", channel: 1, cc0: 23, rangeLow: 34, rangeHigh: 65, mw: true },   // standard zone assumed
      { key: "vib_vel", label: "Vibrato Velocity (#25)", channel: 1, cc0: 24, rangeLow: 34, rangeHigh: 65 },   // standard zone assumed
      { key: "vib_vel_mwinv", label: "Vibrato Velocity + MW inverted (#26)", channel: 1, cc0: 25, rangeLow: 34, rangeHigh: 65, mw: true },   // standard zone assumed
      { key: "secco", label: "Secco Velocity (#27)", channel: 1, cc0: 26, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d (Slot rr 2)
      { key: "portato", label: "Portato Velocity (#28)", channel: 1, cc0: 27, rangeLow: 34, rangeHigh: 65 },   // standard zone assumed
      { key: "flutter_vel_mwinv", label: "Flutter Tongue Velocity + MW inverted (#29)", channel: 1, cc0: 28, rangeLow: 34, rangeHigh: 60, mw: true },   // GUI A#0–C4 (screenshot, R5)
      { key: "pseudo_cb_vel_mwinv", label: "Pseudo Contrabass Velocity + MW inverted (#30)", channel: 1, cc0: 29, rangeLow: 34, rangeHigh: 65, mw: true },   // zone NOT read — a pseudo instrument may shift it; VERIFY on the GUI before use
      { key: "pseudo_cb_stac", label: "Pseudo Contrabass Staccato Velocity (#31)", channel: 1, cc0: 30, rangeLow: 34, rangeHigh: 65 },   // zone NOT read — VERIFY
      { key: "pseudo_cl_vel_mwinv", label: "Pseudo Clarinet Velocity + MW inverted (#32)", channel: 1, cc0: 31, rangeLow: 34, rangeHigh: 65, mw: true },   // zone NOT read — VERIFY
      { key: "pseudo_cl_stac", label: "Pseudo Clarinet Staccato Velocity (#33)", channel: 1, cc0: 32, rangeLow: 34, rangeHigh: 65 },   // zone NOT read — VERIFY
      { key: "flutter_lock", label: "Flutter LOCK (#34, the composer's bespoke preset from piece #3)", channel: 1, cc0: 33, rangeLow: 55, rangeHigh: 93 },   // GUI low G2 / high A5 (screenshot, R5): Ensemble-routed LOCK, slot 4 active, Slot rr 2 — high and bright
    ],
  },

  // ---- PIANO — 8Dio Steinway Grand + Spitfire Plucked Piano (Kontakt) + IRCAM Prepared Piano 2 (UVI), ONE port ----
  // From piece #2 docs/instrument_map.json (port "Piano1", channels 1–5): main ch 1 (velocity,
  // CC64 pedal) · plucked ch 2 (Spitfire, added at R6) · harmonics ch 3 (+ch 4 second layer; CC21 pitch shift, 19.048 cents/step,
  // 85 ms CC lead; sounding cap MIDI 101) · muted ch 5. Preparations are TECHNIQUES of one
  // piano track. Plucked piano had no library in #2 ("TBD"); the septet has Spitfire's, on ch 2.
  piano: { balanceDb: 7, ordinary: "main", beating: false, playerBendSt: 0,
    label: "Piano",
    port: "Piano",
    rangeLow: 21,
    rangeHigh: 108,
    techniques: [
      { key: "main",      label: "8Dio 1969 Legacy Piano (Steinway 1969)", channel: 1, rangeLow: 21, rangeHigh: 108 },   // R6 screenshot: 8DIO_1969_Legacy_Piano, MIDI Ch [A] 1, DEFAULT preset, blue A-1 upward = the full 88; the 8Dio panel has its own GAIN knob — left at default for the gain check; its other presets (Staccato, Reversed, Glisten, Infinity, Ethereal, Glockiano, Suppressiano, Emperor, Golden, The Future) are candidate techniques, not loaded
      { key: "plucked",   label: "Plucked Piano (Spitfire)",          channel: 2, rangeLow: 21, rangeHigh: 108 },   // R6, 2026-09-03: Spitfire Plucked Piano in the same Kontakt instance as the Steinway, on the channel #2 reserved; Kontakt keyboard shows the whole range blue, keyswitches red around C#-1/D#-1 and "Reset on key F-1" — all below 21, never sent
      { key: "harmonics", label: "Harmonics (Prepared Piano 2)",     channel: 3, rangeLow: 21, rangeHigh: 77 },
      { key: "muted",     label: "Muted strings (Prepared Piano 2)", channel: 5 },
    ],
  },

  // ---- STRINGS — Xsample Contemporary Solo Strings (Kontakt), CC#0 selects the preset ----
  // Re-rostered 2026-09-03 at R8–R11 from the composer's Kontakt screenshots (RUNNING_LOG §29): the
  // FULL Preset Menu, 88 presets, identical across violin / viola / cello except the string names in
  // #31–38 and #73–76 (cello and viola C G D A; violin G D A E — the violin's own menu confirmed
  // through #27, the rest by the library's pattern). CC#0 = preset − 1, DIRECT presets only.
  // CORRECTION to the 0b skeleton: piece #1's registry values 89 / 95 / 97 were KEYSWITCH-BANK
  // presets (CC#0 88–117 = the banks' stored slots, per the Xsample manual), i.e. whatever the
  // quartet had stored in its own Kontakt — not portable. Senza vibrato = #6 (cc0 5), pizzicato =
  // #70 (cc0 69), Bartók = #80 (cc0 79). `mw: true` = the wheel (CC1) shapes the dynamic (curve-
  // channel material under D11); Velocity presets are main-channel material. Ranges from the GUI
  // low/high fields on the standard preset (Kontakt display C3 = 60): violin G2–F6 = 55–101, viola
  // C2–A5 = 48–93, cello C1–B4 = 36–83; per-preset exceptions are registered as the composer sends
  // them. Keyswitch zone = the bass clarinet's (green 21–23 function keys, red 24–33 bank slots,
  // all reachable by CC#0 — never sent as notes); the blue key at the very top is the Preset /
  // Phrase Mode switch (manual: A#7, or CC#0 126/127). Channels per D11: 1 main · 2–4 curve A/B/C.
  violin1: { balanceDb: 0, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "Violin 1", port: "Vn1", rangeLow: 55, rangeHigh: 101, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["G", "D", "A", "E"], 55, 101, vnRanges()) },
  violin2: { balanceDb: 0, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "Violin 2", port: "Vn2", rangeLow: 55, rangeHigh: 101, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["G", "D", "A", "E"], 55, 101, vnRanges()) },
  viola:   { balanceDb: -3.5, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "Viola",    port: "Va",  rangeLow: 48, rangeHigh: 93,  mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["C", "G", "D", "A"], 48, 93) },
  cello:   { balanceDb: -1, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "Cello",    port: "Vc",  rangeLow: 36, rangeHigh: 83,  mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["C", "G", "D", "A"], 36, 83) },
};

// Per-preset zones read from the GUI as the composer uses a preset (his rule at R8: "there are too many
// presets, let's get ranges as I use them"). Violin: #7 Arco Open Strings `G2–E4` = 55–76 (2026-09-03).
function vnRanges() { return { arco_open_vel: [55, 76] }; }   // the Bartók top is MEASURED now (2026-09-06: E6 = 88 on both violins, MEASURED_RANGES below) — the provisional 85 of 2026-09-05 removed   // Bartók top 85 (C#6) provisional, 2026-09-05: C7 (96) silent in the composer's strike #25, B♭6 (90) silent at 0j (journal Q6); the true top is 85–89 — raise it if a higher note is heard   // hoisted, like xsStringTechs — the table above runs first
// The composer's practice (R8): the VELOCITY presets by default — the MW ones "sound different" and are
// chosen deliberately; under D11 that keeps most string material on the main channel.
// The one Xsample string roster, instantiated per instrument (fresh arrays, so per-instrument
// range exceptions at 0c never bleed across). `s` = the four open strings low→high; lo/hi = the
// instrument's standard zone. Hoisted function declaration, so the table above may use it.
function xsStringTechs(s, lo, hi, ranges) {
  const r = ranges || {};   // per-preset zone exceptions, registered as the composer uses them: { key: [lo, hi] }
  const P = (n, key, label, mw) => ({ key, label: label + " (#" + n + ")", channel: 1, cc0: n - 1, rangeLow: (r[key] || [lo, hi])[0], rangeHigh: (r[key] || [lo, hi])[1], ...(mw ? { mw: true } : {}) });
  return [
    P(1, "vib_vel_mwinv", "Vibrato Velocity + MW inverted", true),
    P(2, "vib_vel", "Vibrato Velocity"),
    P(3, "vib_mw", "Vibrato MW", true),
    P(4, "accent_vib_vel", "Accent Vibrato Velocity"),
    P(5, "senza_vel_mwinv", "Senza Vibrato Velocity + MW inverted", true),
    P(6, "senza_vel", "Senza Vibrato Velocity"),
    P(7, "arco_open_vel", "Arco Open Strings Velocity"),
    P(8, "senza_mw", "Senza Vibrato MW", true),
    P(9, "arco_open_mw", "Arco Open Strings MW", true),
    P(10, "accent_senza_vel", "Accent Senza Vibrato Velocity"),
    P(11, "light_accent_hi_vel", "Light Accent Velocity - high position"),
    P(12, "marcato_sfz_vel", "Marcato sfz Velocity"),
    P(13, "marcato_stac_vel", "Marcato Staccato Velocity"),
    P(14, "marcato_stac_open_vel", "Marcato Staccato Open Strings Velocity"),
    P(15, "marcato_spicc_vel", "Marcato + Spiccato Velocity"),
    P(16, "spicc_vel", "Spiccato Velocity"),
    P(17, "spicc_open_vel", "Spiccato Open Strings Velocity"),
    P(18, "spicc_vel_soft_x_bright_mw", "Spiccato Velocity - Soft X Bright MW", true),
    P(19, "stac_vel", "Staccato Velocity"),
    P(20, "stac_open_vel", "Staccato Open Strings Velocity"),
    P(21, "gettato_vel", "Gettato Velocity"),
    P(22, "trem_vel_mwinv", "Tremolo Velocity + MW inverted", true),
    P(23, "trem_vel", "Tremolo Velocity"),
    P(24, "trem_open_vel", "Tremolo Open Strings Velocity"),
    P(25, "trem_mw", "Tremolo MW", true),
    P(26, "trem_open_mw", "Tremolo Open Strings MW", true),
    P(27, "nh_gliss_slow_vel", "Natural Harmonics Glissando Slow Velocity"),
    P(28, "nh_gliss_slow_mw", "Natural Harmonics Glissando Slow MW", true),
    P(29, "nh_gliss_fast_vel", "Natural Harmonics Glissando Fast Velocity"),
    P(30, "nh_gliss_fast_mw", "Natural Harmonics Glissando Fast MW", true),
    P(31, "nh_sul1_vel", "Natural Harmonics Sul " + s[0] + " Velocity"),
    P(32, "nh_sul1_mw", "Natural Harmonics Sul " + s[0] + " MW", true),
    P(33, "nh_sul2_vel", "Natural Harmonics Sul " + s[1] + " Velocity"),
    P(34, "nh_sul2_mw", "Natural Harmonics Sul " + s[1] + " MW", true),
    P(35, "nh_sul3_vel", "Natural Harmonics Sul " + s[2] + " Velocity"),
    P(36, "nh_sul3_mw", "Natural Harmonics Sul " + s[2] + " MW", true),
    P(37, "nh_sul4_vel", "Natural Harmonics Sul " + s[3] + " Velocity"),
    P(38, "nh_sul4_mw", "Natural Harmonics Sul " + s[3] + " MW", true),
    P(39, "ah_vel", "Artificial Harmonics Velocity"),
    P(40, "ah_mw", "Artificial Harmonics MW", true),
    P(41, "ah_spicc_vel", "Artificial Harmonics Spiccato Velocity"),
    P(42, "ah_trem_mw", "Artificial Harmonics Tremolo MW", true),
    P(43, "flaut_vel", "Flautando Fragile Velocity"),
    P(44, "flaut_mw", "Flautando Fragile MW", true),
    P(45, "flaut_x_sp_mw_vel", "Flautando Fragile X Sul Ponticello MW - Velocity", true),
    P(46, "sp_vel", "Sul Ponticello Velocity"),
    P(47, "sp_mw", "Sul Ponticello MW", true),
    P(48, "sp_spicc_vel", "Sul Ponticello Spiccato Velocity"),
    P(49, "sp_trem_vel", "Sul Ponticello Tremolo Velocity"),
    P(50, "sp_trem_mw", "Sul Ponticello Tremolo MW", true),
    P(51, "sp_trem_x_sp_mw_vel", "Sul Ponticello Tremolo X Sul Ponticello MW - Velocity", true),
    P(52, "circ_bow_vel", "Circular Bowing Velocity"),
    P(53, "circ_bow_mw", "Circular Bowing MW", true),
    P(54, "bow_op_vel", "Bow Overpressure Velocity"),
    P(55, "bow_op_mw", "Bow Overpressure MW", true),
    P(56, "bow_op_x_marcato_sfz_mw_vel", "Bow Overpressure X Marcato sfz MW - Velocity", true),
    P(57, "bow_op_stac_vel", "Bow Overpressure Staccato Velocity"),
    P(58, "tailpiece_vel", "Tailpiece Bowed Velocity"),
    P(59, "tailpiece_mw", "Tailpiece Bowed MW", true),
    P(60, "sord_vib_vel_mwinv", "Sordino Vibrato Velocity + MW inverted", true),
    P(61, "sord_vib_vel", "Sordino Vibrato Velocity"),
    P(62, "sord_vib_mw", "Sordino Vibrato MW", true),
    P(63, "sord_senza_vel_mwinv", "Sordino Senza Vibrato Velocity + MW inverted", true),
    P(64, "sord_senza_vel", "Sordino Senza Vibrato Velocity"),
    P(65, "sord_open_vel", "Sordino Open Strings Velocity"),
    P(66, "sord_senza_mw", "Sordino Senza Vibrato MW", true),
    P(67, "sord_open_mw", "Sordino Open Strings MW", true),
    P(68, "sord_spicc_vel", "Sordino Spiccato Velocity"),
    P(69, "sord_spicc_open_vel", "Sordino Spiccato Open Strings Velocity"),
    P(70, "pizz_vel", "Pizzicato Velocity"),
    P(71, "pizz_vib_vel", "Pizzicato Vibrato Velocity"),
    P(72, "pizz_open_vel", "Pizzicato Open Strings Velocity"),
    P(73, "pizz_h_sul1_vel", "Pizzicato Harmonics Sul " + s[0] + " Velocity"),
    P(74, "pizz_h_sul2_vel", "Pizzicato Harmonics Sul " + s[1] + " Velocity"),
    P(75, "pizz_h_sul3_vel", "Pizzicato Harmonics Sul " + s[2] + " Velocity"),
    P(76, "pizz_h_sul4_vel", "Pizzicato Harmonics Sul " + s[3] + " Velocity"),
    P(77, "pizz_sp_vel", "Pizzicato Sul Ponticello Velocity"),
    P(78, "pizz_sp_open_vel", "Pizzicato Sul Ponticello Open Strings Velocity"),
    P(79, "pizz_x_sp_mw_vel", "Pizzicato X Sul Ponticello MW - Velocity", true),
    P(80, "bartok_vel", "Bartok Pizzicato Velocity"),
    P(81, "pizz_behind_bridge_vel", "Pizzicato Behind Bridge Velocity"),
    P(82, "pizz_peg_box_vel", "Pizzicato In Peg Box Velocity"),
    P(83, "col_legno_vel", "Col Legno Velocity"),
    P(84, "col_legno_gett_vel", "Col Legno Gettato Velocity"),
    P(85, "finger_vel", "Finger Velocity"),
    P(86, "body_vel", "Body Strokes Velocity"),
    P(87, "undef_vel", "Undefined Sounds Velocity"),
    P(88, "undef_mw", "Undefined Sounds MW", true),
  ];
}

// ---- MEASURED RANGES (generated by tools/apply_ranges.js — do not edit by hand) ----
const MEASURED_RANGES = {   // measured 2026-09-06T14:50 (01-REC-260906_1415.wav): per technique [lo, hi] of the keys that sounded; silent keys inside the span listed
  flute: {
    "pizzicato": { lo: 60, hi: 84 },
    "tongue_ram": { lo: 48, hi: 83 },
    "staccato": { lo: 60, hi: 96 },
    "ord": { lo: 60, hi: 96 },
    "sforzando": { lo: 60, hi: 96 },
    "fortepiano": { lo: 60, hi: 96 },
  },
  bass_clarinet: {
    "slap": { lo: 34, hi: 65 },
    "stac_vel": { lo: 34, hi: 65 },
    "secco": { lo: 34, hi: 65 },
    "senza_vel": { lo: 34, hi: 65 },
    "accent_vel": { lo: 34, hi: 65 },
    "portato": { lo: 34, hi: 65 },
  },
  piano: {
    "main": { lo: 21, hi: 108 },
    "plucked": null,   // NOTHING sounded — check the routing or the preset
    "harmonics": { lo: 21, hi: 77 },
  },
  violin1: {
    "bartok_vel": { lo: 55, hi: 88 },   // silent: 89 90 91 92 93 94 95 96 97 98 99 100 101
    "gettato_vel": { lo: 55, hi: 94 },   // silent: 95 96 97 98 99 100 101
    "senza_vel": { lo: 55, hi: 101 },
    "accent_senza_vel": { lo: 55, hi: 101 },
    "marcato_sfz_vel": { lo: 55, hi: 101 },
    "marcato_stac_vel": { lo: 55, hi: 101 },
    "spicc_vel": { lo: 55, hi: 101 },
    "stac_vel": { lo: 55, hi: 101 },
  },
  violin2: {
    "bartok_vel": { lo: 55, hi: 88 },   // silent: 89 90 91 92 93 94 95 96 97 98 99 100 101
    "gettato_vel": { lo: 55, hi: 94 },   // silent: 95 96 97 98 99 100 101
    "senza_vel": { lo: 55, hi: 101 },
    "accent_senza_vel": { lo: 55, hi: 101 },
    "marcato_sfz_vel": { lo: 55, hi: 101 },
    "marcato_stac_vel": { lo: 55, hi: 101 },
    "spicc_vel": { lo: 55, hi: 101 },
    "stac_vel": { lo: 55, hi: 101 },
  },
  viola: {
    "bartok_vel": { lo: 48, hi: 76 },   // silent: 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93
    "gettato_vel": { lo: 48, hi: 88 },   // silent: 89 90 91 92 93
    "senza_vel": { lo: 48, hi: 93 },
    "accent_senza_vel": { lo: 48, hi: 93 },
    "marcato_sfz_vel": { lo: 48, hi: 93 },
    "marcato_stac_vel": { lo: 48, hi: 93 },
    "spicc_vel": { lo: 48, hi: 93 },
    "stac_vel": { lo: 48, hi: 93 },
  },
  cello: {
    "bartok_vel": { lo: 36, hi: 71 },   // silent: 72 73 74 75 76 77 78 79 80 81 82 83
    "gettato_vel": { lo: 36, hi: 76 },   // silent: 77 78 79 80 81 82 83
    "senza_vel": { lo: 36, hi: 83 },
    "accent_senza_vel": { lo: 36, hi: 83 },
    "marcato_sfz_vel": { lo: 36, hi: 83 },
    "marcato_stac_vel": { lo: 36, hi: 83 },
    "spicc_vel": { lo: 36, hi: 83 },
    "stac_vel": { lo: 36, hi: 83 },
  },
};
function applyMeasuredRanges(all, measured) {   // the measured span replaces the keyboard zone where it is narrower
  for (const [inst, techs] of Object.entries(measured || {})) {
    const I = all[inst]; if (!I || !I.techniques) continue;
    for (const q of I.techniques) {
      const m = techs[q.key]; if (!m) continue;
      const lo = q.rangeLow != null ? q.rangeLow : I.rangeLow, hi = q.rangeHigh != null ? q.rangeHigh : I.rangeHigh;
      q.zoneLow = lo; q.zoneHigh = hi; q.measured = true;
      q.rangeLow = Math.max(lo, m.lo); q.rangeHigh = Math.min(hi, m.hi);
      if (m.gaps && m.gaps.length) q.silentKeys = m.gaps.slice();
    }
  }
}
applyMeasuredRanges(INSTRUMENTS, MEASURED_RANGES);
// ---- end of the measured ranges ----

// ---- MEASURED BEND RANGES (generated by tools/apply_bend_ranges.js — do not edit by hand) ----
const MEASURED_BEND = {   // measured 2026-09-07T00:22 (01-REC-260907_0015.wav): semitones per full bend on the ordinary voice; RPN 0 honoured = MIDI can change it
  flute: { rangeSt: 2, spreadSt: 0, mutableByMidi: false, residueCents: 100.2, pitch: 78 },
  bass_clarinet: { rangeSt: 0.98, spreadSt: 0.01, mutableByMidi: false, residueCents: 49.4, pitch: 50 },
  violin1: { rangeSt: 0.96, spreadSt: 0.02, mutableByMidi: false, residueCents: 49.9, pitch: 78 },
  violin2: { rangeSt: 0.97, spreadSt: 0.01, mutableByMidi: false, residueCents: 50.4, pitch: 78 },
  viola: { rangeSt: 0.99, spreadSt: 0.04, mutableByMidi: false, residueCents: 49.3, pitch: 71 },
  cello: { rangeSt: 0.97, spreadSt: 0.03, mutableByMidi: false, residueCents: 48.3, pitch: 60 },
};
function applyMeasuredBend(all, measured) {   // the measured range replaces the provisional bendRangeSt
  for (const [inst, m] of Object.entries(measured || {})) {
    const I = all[inst]; if (!I || !m) continue;
    I.bendRangeSt = m.rangeSt; I.bendMeasured = true; I.bendMutableByMidi = !!m.mutableByMidi; I.bendResidueCents = m.residueCents;
  }
}
applyMeasuredBend(INSTRUMENTS, MEASURED_BEND);
// ---- end of the measured bend ranges ----

// Hardware capture input. Keystation 88 MK3 exposes "Keystation 88 MK3" (keys) and
// "MIDIIN2 (Keystation 88 MK3)" (DAW control - never bind). See piece #3's SAMPLER_QUIRKS.md.
const INPUT_MATCH = /keystation/i;
const INPUT_EXCLUDE = /^MIDIIN\d+/i;
