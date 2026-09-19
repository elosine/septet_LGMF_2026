// Rendering-recipe config — septet LGMF 2026 (the port, PLAN 0b step 4, 2026-09-17; PLAN 0c
// fills it in). One entry per TRACK (score/public/composer.html TRACKS[].instKey).
//
// Schema, inherited from pieces #3/#4/#5: { label, port, rangeLow, rangeHigh, mechanism?,
// techniques: [{ key, label, channel, port?, cc0?, ks?, rangeLow?, rangeHigh? }] }.
//   - `port` is the loopMIDI port (case-exact); a technique's own `port` overrides it.
//   - `channel` is 1-based. `cc0` = Xsample articulation select, sent as a prelude before the
//     note. `ks` = keyswitch notes. `oneShot: true` marks presets that revert after one note.
//   - Ranges are MIDI numbers, middle C = 60, SOUNDING pitch. Written pitch is the notation
//     layer's business (notation/registry/ensemble.json), never this file's.
//
// ============================ STATUS: PROVISIONAL ============================
// **Nothing here has been heard.** Every channel number, every port name and every range not
// marked MEASURED is a placeholder written during the port so that the lanes exist, material
// can be assigned to them, the placement engines can route around them and the notation can
// lay them out. PLAN 0c (the recipes) and 0e (the rack) replace them, with the composer at
// the machine. The sound does not work until then, and is not expected to.
//
// Libraries — journal D6 (composer, 2026-09-17): IRCAM Solo Instruments 2 for bassoon, horn
// and trumpet · Xsample Contemporary Solo Strings for cello (piece #5's recipe, carried
// verbatim) and double bass · Spitfire Abbey Road Orchestra Percussion (piece #2's library) ·
// the ENGLISH HORN is being acquired and its library is not yet named · a BOWED VIBRAPHONE is
// still to be acquired (LG-9 — the first percussion instrument he has named).
//
// PORT NAMES carry an `LG` prefix on purpose: loopMIDI ports are machine-global and piece #5's
// rack is still in use on this machine (its PLAN 3 is unbuilt). A bare `Vc` would have been the
// Tempus cello's port, and the two pieces would have played into each other.
//
// TECHNIQUE KEYS are the notation registry's names (notation/registry/techniques.json) wherever
// one exists, so a key that reaches the IR is already drawable. Keys marked NEW below are not in
// that registry yet and MUST be registered before any material uses them (principle 3: the
// schema is a gate on the file). The SI2 rosters are the manual's own technique lists
// (#3/docs/manuals/extracted/IRCAM_Solo_Instruments_2_manual.txt, the Instrument List) — real
// names, so 0c starts from a roster rather than a blank.
const INSTRUMENTS = {

  // ---- ENGLISH HORN — LIBRARY NOT YET NAMED (D6: "english horn, getting now") ----
  // SI2 has NO english horn (its double reed is the oboe — read from the manual, RUNNING_LOG §9);
  // the Xsample catalog lists one. Until he says which library: one ordinary voice and a staccato,
  // so the lane is real. Range 52–81 (E3–A5) is the standard orchestral compass, NOT measured.
  // ---- ENGLISH HORN — Xsample (D8): the Elastic "English Horn.nki" (RUNNING_LOG §26), four Kontakt slots per D11 (§29) ----
  // The roster is the full Preset Menu as HIS Kontakt shows it (two screenshots, 2026-09-17, RUNNING_LOG §32): 36 factory
  // presets + Free Preset slots 37–39. CC#0 = preset number − 1. Keys reuse piece #5's bass clarinet keys wherever the
  // preset NAME is the same (same library, same design); keys marked NEW are not in notation/registry/techniques.json
  // yet and must be registered before material uses them. RANGES: the standard compass E3–A5 = 52–81 is assumed for
  // every preset, NOT read — 0d measures them (the flutter, multiphonic and noise presets will be narrower, as the
  // bass clarinet's were). `ordinary` = senza_vel, the bass clarinet's choice (a steady pitch for a beating partner);
  // his to flip to vib_vel.
  // BEND RANGE 1, not 2 (2026-09-19, PLAN 1a.0): the one MEASURED Xsample instrument, the cello, reads 0.97 st
  // (bank/bend_ranges.json) — the library is set to a semitone, not a whole tone. INFERRED for this instrument, not
  // measured; `bendMeasured` stays false and a bend probe would replace it. At 2 every cents ask landed HALF.
  english_horn: { balanceDb: 0.00, ordinary: "senza_vel", beating: true, playerBendSt: 1, bendRangeSt: 1, label: "English Horn", port: "LGEngHorn", rangeLow: 52, rangeHigh: 81, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsEnglishHornTechs(52, 81) },

  // ---- BASSOON — IRCAM Solo Instruments 2 (UVI) ----
  // Manual: "Instrument part to be written at actual pitch"; range in sounding pitches Bb1–Eb5
  // = MIDI 34–75. The roster below is the manual's own list. On UVI a channel IS a technique, so
  // the curve channels of D11 are technique COPIES on a second instance (piece #5's flute did
  // this on a `Fluteb` port): here `Bassoon SI2 b` on `LGBassoonb`, made as text (RUNNING_LOG §24).
  bassoon: { balanceDb: -7.79,
    label: "Bassoon", port: "LGBassoon", rangeLow: 34, rangeHigh: 75,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [] },   // WRITTEN AT LOAD by UVI_PARTS (tools/apply_uvi_parts.js): main = the Ordinario part, curve = its copies on the `b` instance. Empty curve = the voice's own channel (cresc.js) until then.
    techniques: [
      // ONE LINE PER TECHNIQUE, its PRESET named as the UVI browser lists it (loaded by him, one each, 2026-09-17 — Ordinario first, then
      // the browser's order; the overflow on the `b` instance). The CHANNEL and the PORT are not written here: tools/apply_uvi_parts.js
      // reads them from the running rack into UVI_PARTS below, applied at load. `ks` = the keyswitch inside a KS preset, the flute's
      // pattern (C1 = 36, C#1 = 37, D1 = 38; Durations C2 = 48, C#2 = 49) — PROVISIONAL until read on the red keys (0c).
      { key: "ord",               label: "ordinario",                     preset: "Bassoon Ordinario" },
      { key: "blow_no_reed",      label: "blow without reed — NEW",       preset: "Bassoon Blow Without Reed" },
      { key: "chrom_scale",       label: "chromatic scale",               preset: "Bassoon Chromatic Scale" },
      { key: "cresc",             label: "crescendo",                     preset: "Bassoon Cresc & Decrescendo KS", ks: 36 },
      { key: "cresc_decresc",     label: "crescendo to decrescendo",      preset: "Bassoon Cresc & Decrescendo KS", ks: 37 },
      { key: "decresc",           label: "decrescendo",                   preset: "Bassoon Cresc & Decrescendo KS", ks: 38 },
      { key: "dur_0_5s",          label: "note durations 0.5 s",          preset: "Bassoon Durations KS", ks: 48 },
      { key: "dur_1s",            label: "note durations 1 s",            preset: "Bassoon Durations KS", ks: 49 },
      { key: "flz",               label: "flatterzunge",                  preset: "Bassoon Flatterzunge" },
      { key: "fortepiano",        label: "fortepiano",                    preset: "Bassoon Fortepiano" },
      { key: "harmonic_fing",     label: "harmonic fingering",            preset: "Bassoon Harmonic Fingering" },
      { key: "key_click",         label: "key click",                     preset: "Bassoon Key Click" },
      { key: "multiphonics",      label: "multiphonics menu",             preset: "Bassoon Multiphonics Menu" },
      { key: "ord_mute",          label: "ordinario con sordina — NEW",   preset: "Bassoon Mute Ordinario" },
      { key: "ord_1q",            label: "ordinario quarter-tone",        preset: "Bassoon Quartertones Ordinario" },
      { key: "sforzando",         label: "sforzando",                     preset: "Bassoon Sforzando" },
      { key: "staccato",          label: "staccato",                      preset: "Bassoon Staccato" },
      { key: "gliss_throat_down", label: "throat glissando down — NEW",   preset: "Bassoon Throat Glissando Down KS" },   // a KS preset: which keys select what — unread
      { key: "gliss_throat_up",   label: "throat glissando up — NEW",     preset: "Bassoon Throat Glissando Up KS" },
      { key: "trill_m2",          label: "trill minor 2nd up",            preset: "Bassoon Trills KS", ks: 36 },
      { key: "trill_M2",          label: "trill major 2nd up",            preset: "Bassoon Trills KS", ks: 37 },
      { key: "vib_vel",           label: "vibrato",                       preset: "Bassoon Vibrato" },
    ],
  },

  // ---- HORN in F — IRCAM Solo Instruments 2 (UVI) ----
  // Manual: "Instrument part to be written a perfect fifth higher" — this is the SOURCE for the
  // ensemble registry's transpose: +7 (step 6). Range in sounding pitches B1–F4 = MIDI 35–65.
  horn: { balanceDb: -0.01,
    label: "Horn", port: "LGHorn", rangeLow: 35, rangeHigh: 65,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [] },   // WRITTEN AT LOAD by UVI_PARTS (tools/apply_uvi_parts.js): main = the Ordinario part, curve = its copies on the `b` instance. Empty curve = the voice's own channel (cresc.js) until then.
    techniques: [
      // ONE LINE PER TECHNIQUE, its PRESET named as the UVI browser lists it (loaded by him, one each, 2026-09-17 — Ordinario first, then
      // the browser's order; the overflow on the `b` instance). The CHANNEL and the PORT are not written here: tools/apply_uvi_parts.js
      // reads them from the running rack into UVI_PARTS below, applied at load. `ks` = the keyswitch inside a KS preset, the flute's
      // pattern (C1 = 36, C#1 = 37, D1 = 38; Durations C2 = 48, C#2 = 49) — PROVISIONAL until read on the red keys (0c).
      { key: "ord",             label: "ordinario",                       preset: "French Horn Ordinario" },
      { key: "chrom_scale",     label: "chromatic scale",                 preset: "French Horn Chromatic Scale" },
      { key: "cresc",           label: "crescendo",                       preset: "French Horn Cresc & Decrescendo KS", ks: 36 },
      { key: "cresc_decresc",   label: "crescendo to decrescendo",        preset: "French Horn Cresc & Decrescendo KS", ks: 37 },
      { key: "decresc",         label: "decrescendo",                     preset: "French Horn Cresc & Decrescendo KS", ks: 38 },
      { key: "cuivre",          label: "cuivré — NEW",                    preset: "French Horn Cuivre" },
      { key: "dur_0_5s",        label: "note durations 0.5 s",            preset: "French Horn Durations KS", ks: 48 },
      { key: "dur_1s",          label: "note durations 1 s",              preset: "French Horn Durations KS", ks: 49 },
      { key: "flz",             label: "flatterzunge",                    preset: "French Horn Flatterzunge" },
      { key: "fortepiano",      label: "fortepiano",                      preset: "French Horn Fortepiano" },
      { key: "flz_mute",        label: "flatterzunge con sordina — NEW",  preset: "French Horn Mute Flatterzunge" },
      { key: "ord_mute",        label: "ordinario con sordina — NEW",     preset: "French Horn Mute Ordinario" },
      { key: "open_to_stopped", label: "open to stopped — NEW",           preset: "French Horn Open & Stopped KS", ks: 36 },
      { key: "stopped_to_open", label: "stopped to open — NEW",           preset: "French Horn Open & Stopped KS", ks: 37 },
      { key: "ord_to_cuivre",   label: "ordinario to cuivré — NEW",       preset: "French Horn Ord & Cuivre KS", ks: 36 },
      { key: "cuivre_to_ord",   label: "cuivré to ordinario — NEW",       preset: "French Horn Ord & Cuivre KS", ks: 37 },
      { key: "ord_to_flz",      label: "ordinario to flatterzunge",       preset: "French Horn Ord & Flatterzunge KS", ks: 36 },
      { key: "flz_to_ord",      label: "flatterzunge to ordinario",       preset: "French Horn Ord & Flatterzunge KS", ks: 37 },
      { key: "sforzando",       label: "sforzando",                       preset: "French Horn Sforzando" },
      { key: "slap_pitched",    label: "slap pitched — NEW",              preset: "French Horn Slap Pitched" },
      { key: "staccato",        label: "staccato",                        preset: "French Horn Staccato" },
      { key: "flz_stopped",     label: "flatterzunge stopped — NEW",      preset: "French Horn Stopped Flatterzunge" },
      { key: "stopped",         label: "stopped — NEW",                   preset: "French Horn Stopped Ordinario" },
      { key: "trill_m2",        label: "trill minor 2nd up",              preset: "French Horn Trills KS", ks: 36 },
      { key: "trill_M2",        label: "trill major 2nd up",              preset: "French Horn Trills KS", ks: 37 },
    ],
  },

  // ---- TRUMPET in C — IRCAM Solo Instruments 2 (UVI) ----
  // Manual: "Instrument part to be written at actual pitch" — SI2's trumpet is in C. Whether the
  // PART is written in C or in B♭ is the composer's call at 2a; the library is unaffected.
  // Range in sounding pitches F#3–Bb5 = MIDI 54–82. The four mutes (cup · harmon · straight · wah-wah)
  // are KS presets of the trumpet in the browser and he loaded them — they are techniques below.
  trumpet: { balanceDb: -0.17,
    label: "Trumpet", port: "LGTrumpet", rangeLow: 54, rangeHigh: 82,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [] },   // WRITTEN AT LOAD by UVI_PARTS (tools/apply_uvi_parts.js): main = the Ordinario part, curve = its copies on the `b` instance. Empty curve = the voice's own channel (cresc.js) until then.
    techniques: [
      // ONE LINE PER TECHNIQUE, its PRESET named as the UVI browser lists it (loaded by him, one each, 2026-09-17 — Ordinario first, then
      // the browser's order; the overflow on the `b` instance). The CHANNEL and the PORT are not written here: tools/apply_uvi_parts.js
      // reads them from the running rack into UVI_PARTS below, applied at load. `ks` = the keyswitch inside a KS preset, the flute's
      // pattern (C1 = 36, C#1 = 37, D1 = 38; Durations C2 = 48, C#2 = 49) — PROVISIONAL until read on the red keys (0c). The mutes
      // are here because he loaded them; their KS order and the Glissando Menu's are GUESSES from the manual's alphabetical lists.
      { key: "ord",                 label: "ordinario",                          preset: "Trumpet Ordinario" },
      { key: "cresc",               label: "crescendo",                          preset: "Trumpet Cresc & Decrescendo KS", ks: 36 },
      { key: "cresc_decresc",       label: "crescendo to decrescendo",           preset: "Trumpet Cresc & Decrescendo KS", ks: 37 },
      { key: "decresc",             label: "decrescendo",                        preset: "Trumpet Cresc & Decrescendo KS", ks: 38 },
      { key: "cuivre",              label: "cuivré — NEW",                       preset: "Trumpet Cuivre" },
      { key: "dur_0_5s",            label: "note durations 0.5 s",               preset: "Trumpet Durations KS", ks: 48 },
      { key: "dur_1s",              label: "note durations 1 s",                 preset: "Trumpet Durations KS", ks: 49 },
      { key: "flz",                 label: "flatterzunge",                       preset: "Trumpet Flatterzunge" },
      { key: "fortepiano",          label: "fortepiano",                         preset: "Trumpet Fortepiano" },
      { key: "gliss_embouchure",    label: "glissando embouchure — NEW",         preset: "Trumpet Glissando Menu KS", ks: 36 },   // the menu's order: unread
      { key: "half_valve_gliss",    label: "half-valve glissando — NEW",         preset: "Trumpet Glissando Menu KS", ks: 37 },
      { key: "harmonics_gliss",     label: "harmonics glissando — NEW",          preset: "Trumpet Glissando Menu KS", ks: 38 },
      { key: "legato_intervals",    label: "increasing intervals legato — NEW",  preset: "Trumpet Increasing Intervals Legato" },
      { key: "ord_mute_cup",        label: "ordinario, cup mute — NEW",          preset: "Trumpet Mute Cup KS", ks: 36 },
      { key: "flz_mute_cup",        label: "flatterzunge, cup mute — NEW",       preset: "Trumpet Mute Cup KS", ks: 37 },
      { key: "ord_mute_harmon",     label: "ordinario, harmon mute — NEW",       preset: "Trumpet Mute Harmon KS", ks: 36 },
      { key: "flz_mute_harmon",     label: "flatterzunge, harmon mute — NEW",    preset: "Trumpet Mute Harmon KS", ks: 37 },
      { key: "ord_mute_straight",   label: "ordinario, straight mute — NEW",     preset: "Trumpet Mute Straight KS", ks: 36 },
      { key: "flz_mute_straight",   label: "flatterzunge, straight mute — NEW",  preset: "Trumpet Mute Straight KS", ks: 37 },
      { key: "wawa_closed",         label: "wah-wah mute, closed — NEW",         preset: "Trumpet Mute Wahwah KS", ks: 36 },   // manual: closed-to-open · flatterzunge-open · open-to-closed · ordinario-closed · ordinario-open; the KS order unread
      { key: "wawa_open",           label: "wah-wah mute, open — NEW",           preset: "Trumpet Mute Wahwah KS", ks: 37 },
      { key: "wawa_closed_to_open", label: "wah-wah closed to open — NEW",       preset: "Trumpet Mute Wahwah KS", ks: 38 },
      { key: "wawa_open_to_closed", label: "wah-wah open to closed — NEW",       preset: "Trumpet Mute Wahwah KS", ks: 39 },
      { key: "wawa_flz_open",       label: "wah-wah flatterzunge open — NEW",    preset: "Trumpet Mute Wahwah KS", ks: 40 },
      { key: "ord_to_cuivre",       label: "ordinario to cuivré — NEW",          preset: "Trumpet Ord & Cuivre KS", ks: 36 },
      { key: "cuivre_to_ord",       label: "cuivré to ordinario — NEW",          preset: "Trumpet Ord & Cuivre KS", ks: 37 },
      { key: "ord_to_flz",          label: "ordinario to flatterzunge",          preset: "Trumpet Ord & Flatterzunge KS", ks: 36 },
      { key: "flz_to_ord",          label: "flatterzunge to ordinario",          preset: "Trumpet Ord & Flatterzunge KS", ks: 37 },
      { key: "pedal_tone",          label: "pedal tone — NEW",                   preset: "Trumpet Pedal Tone" },
      { key: "sforzando",           label: "sforzando",                          preset: "Trumpet Sforzando" },
      { key: "slap_pitched",        label: "slap pitched — NEW",                 preset: "Trumpet Slap Pitched" },
      { key: "staccato",            label: "staccato",                           preset: "Trumpet Staccato" },
      { key: "trill_m2",            label: "trill minor 2nd up",                 preset: "Trumpet Trills KS", ks: 36 },
      { key: "trill_M2",            label: "trill major 2nd up",                 preset: "Trumpet Trills KS", ks: 37 },
      { key: "vocalize_harmonics",  label: "vocalize on harmonics — NEW",        preset: "Trumpet Vocalize on Harmonics" },
    ],
  },

  // ---- PERCUSSION — ONE PLAYER, ONE LANE (P4) ----
  // Spitfire Abbey Road Orchestra Percussion (D6 — piece #2's library, its journal decision 4:
  // Metal 58 instruments · High 62 · Low 20, in Spitfire's own plugin, NOT Kontakt and NOT UVI —
  // a mechanism this stack has never driven; that is real work at 0c). ARO has no tuned mallets,
  // which is why he needs a bowed vibraphone (LG-9) and has still to acquire one.
  //
  // The instrument in hand is a TECHNIQUE on this lane, exactly as #5's D6 made the flute's
  // doubling a technique. THE INSTRUMENTS ARE NOT CHOSEN — he has named one (the bowed vibraphone,
  // LG-9) and it is the one library that is missing. Until they are, `main` is a placeholder voice
  // (the registry's own key, as #5's piano used it) so the lane can hold material and be laid out;
  // its range 21–108 is so `laneCanPlay` never routes material away from the percussionist, NOT a
  // claim about any instrument's compass.
  //
  // THE SCAFFOLDING (0c, 2026-09-17): the ARO instruments are CATALOGUED, never typed here —
  //   bank/aro_percussion_catalog.json  what the library offers: 78 instruments, the MIDI key →
  //                                     beater/articulation map of each All-in-One preset as piece #2
  //                                     measured it key by key (35 verified · 39 skeleton, no keys yet)
  //   bank/perc_selection.json          which of them THIS PIECE uses, on which channel — empty now
  //   tools/apply_perc.js               writes the selection into the ARO_PERC block below: one
  //                                     technique per instrument × beater, applied at load
  // Choosing an instrument = one line in the selection + one Reaper track filtering on its channel +
  // the tool + palette_check — and its technique keys registered (principle 3) before material uses them.
  percussion: {
    label: "Percussion", port: "LGPerc", rangeLow: 21, rangeHigh: 108,
    ordinary: "main", beating: false, playerBendSt: 0, bendRangeSt: 0,
    channels: { main: 1, curve: [2, 3, 4] },
    techniques: [
      { key: "main", label: "struck, plain (PROVISIONAL — the instruments are not chosen)", channel: 1 },
    ],
  },

  // ---- BOWED VIBRAPHONE — Xsample Mallets Extended (Kontakt), CC#0 selects the preset ----
  // Acquired 2026-09-18 (LG-9 closed). It has its OWN LANE at his word (D12): the opening sustains it
  // continuously — two overlapping pitches with individual instruments beating against each one
  // (COMPOSITION_NOTES LG-15) — so it is a voice, not a technique on the percussion track. Same player as
  // Percussion (one percussionist); the score joins the two staves with a brace.
  // The roster is the full Preset Menu as HIS Kontakt shows it (screenshot, 2026-09-18): 12 factory presets
  // + Free Preset 13. CC#0 = preset number − 1, as the english horn and the strings (§32).
  // RANGE read from his plugin's own low/high fields: F2–F5 in Xsample's octave naming = MIDI 53–89, the
  // standard three-octave vibraphone F3–F6 sounding. NON-TRANSPOSING, single treble staff (his confirmation,
  // 2026-09-18 — notation/registry/ensemble.json part 5).
  // `ordinary` = bowed_vel (#12 Bowed Velocity), HIS CHOICE 2026-09-18, because the opening is bowed and a
  // bowed tone is the steady partner a beating needs. #7 is the same bow with vibrato on CC4.
  bowed_vibraphone: { balanceDb: 9.30,
    ordinary: "bowed_vel", beating: true, playerBendSt: 0, bendRangeSt: 2,
    label: "Vibraphone", port: "LGVibes", rangeLow: 53, rangeHigh: 89, mechanism: "cc0",
    channels: { main: 1, curve: [2, 3, 4] },
    techniques: xsVibraphoneTechs(53, 89),
  },

  // ---- CELLO — Xsample Contemporary Solo Strings (Kontakt), CC#0 selects the preset ----
  // PIECE #5'S ENTRY, CARRIED VERBATIM (D6) — the one recipe in this file that has been heard,
  // and its measured ranges and bend range come across with it (the tables below). Only the PORT
  // name changes, and only because loopMIDI ports are machine-global (see the header).
  // The full Xsample roster is 88 presets, identical across the instruments except the string
  // names; CC#0 = preset − 1. Channels per D11: 1 main · 2–4 curve A/B/C.
  cello: { balanceDb: 10.29, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "Cello", port: "LGCello", rangeLow: 36, rangeHigh: 83, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["C", "G", "D", "A"], 36, 83) },

  // ---- DOUBLE BASS — Xsample (D6: "use xsample double bass") ----
  // The cello's model, deliberately: one string mechanism for the PAIR (LG-1), the same CC#0
  // preset select and the same channel bank. The roster is generated by the same helper, so the
  // key set is the cello's. **The preset NUMBERS were VERIFIED 2026-09-17 against the Xsample double bass's own
  // Preset Menu** (his four screenshots, RUNNING_LOG §32): all 88 in the cello's order, Sul E / A / D / G.
  // Open strings E1 A1 D2 G2.
  // THE OCTAVE, SETTLED 2026-09-19 (PLAN 1a.0, RUNNING_LOG §67). The library is KEYED AN OCTAVE ABOVE ITS
  // SOUNDING PITCH — probed through the bridge: key 34 (sounding B♭1) silent, key 46 audible at −19.9 dB,
  // and its 40–81 is exactly the bass's sounding E1–A4 written up an octave (a double bass cannot sound A5).
  // §57 read 40–81 off his Kontakt and wrote it in here as if it were sounding pitch, which it is not.
  // THIS RECIPE IS SOUNDING PITCH, like every other — 28–69 (E1–A4) — because the score, the IR and the
  // notation are all sounding (ensemble.json _transposeConvention, #5's D9) and the app sends `sonifyNote`
  // raw to the port. The +12 the sampler needs is done in REAPER: a stock `midi_transpose` at the head of
  // the Bass XS chain (`reaper/bridge/jobs/bass_octave_fx.lua`), decision 0's pattern — Reaper-side, no app
  // change. Do not "correct" these numbers back to the sampler's keys.
  // The 0d probe's measured pitches 48 and 57 were SAMPLER keys = sounding 36 and 45; the trims stand.
  double_bass: { balanceDb: 5.25, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 1, label: "D. Bass", port: "LGBass", rangeLow: 28, rangeHigh: 69, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["E", "A", "D", "G"], 28, 69) },
};

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



// The Xsample English Horn roster — his Preset Menu, 2026-09-17 (RUNNING_LOG §32). Hoisted, like xsStringTechs.
// lo/hi = the assumed zone until 0d measures each preset. `mw` = the wheel shapes the dynamic (curve-channel material, D11).
// The bowed vibraphone's Preset Menu, from his Kontakt (2026-09-18): 12 factory presets + Free Preset 13,
// CC#0 = preset number − 1. `mw: true` marks a preset whose shape or damping is on the modwheel, as the
// english horn's does; CC4 presets take their vibrato depth there (the menu names say so) and are measured
// at 0d, not assumed. Every preset is given the instrument's whole compass: an Xsample mallet instrument is
// one sample set per preset, so unlike the winds there is no narrower zone to find.
function xsVibraphoneTechs(lo, hi) {
  const P = (n, key, label, mw) => ({ key, label: label + " (#" + n + ")", channel: 1, cc0: n - 1, rangeLow: lo, rangeHigh: hi, ...(mw ? { mw: true } : {}) });
  return [
    P(1,  "std_mallets_vel",     "Standard Mallets Velocity CC4 Vibrato MW Speed", true),
    P(2,  "damped_vel",          "Damped Velocity"),
    P(3,  "xylo_mallets_vel",    "Xylophone Mallets Velocity CC4 Vibrato MW Speed", true),
    P(4,  "tri_mallets_vel",     "Triangle Mallets Velocity CC4 Vibrato MW Speed", true),
    P(5,  "hand_vibrato_vel",    "Hand Vibrato Velocity"),
    P(6,  "harmonics_vel",       "Harmonics Velocity"),
    P(7,  "bowed_vel_vib",       "Bowed Velocity CC4 Vibrato MW Speed", true),
    P(8,  "std_mallets_mwdamp",  "Standard Mallets Velocity MW Damped", true),
    P(9,  "xylo_mallets_mwshape", "Xylophone Mallets Velocity MW Shape", true),
    P(10, "tri_mallets_mwshape", "Triangle Mallets Velocity MW Shape", true),
    P(11, "hand_vibrato_mwshape", "Hand Vibrato Velocity MW Shape", true),
    P(12, "bowed_vel",           "Bowed Velocity"),
    P(13, "free_preset",         "Free Preset"),
  ];
}

function xsEnglishHornTechs(lo, hi) {
  const P = (n, key, label, mw) => ({ key, label: label + " (#" + n + ")", channel: 1, cc0: n - 1, rangeLow: lo, rangeHigh: hi, ...(mw ? { mw: true } : {}) });
  return [
    P(1,  "vib_mw",               "Vibrato MW", true),
    P(2,  "senza_mw",             "Senza Vibrato MW", true),
    P(3,  "stac_vel_mwshape",     "Staccato Velocity 1 MW Shape", true),
    P(4,  "stac2_mwshape",        "Staccato Velocity 2 MW Shape", true),
    P(5,  "flutter_mw",           "Flutter Tongue MW", true),
    P(6,  "mp_short",             "Multiphonics Velocity"),
    P(7,  "crow_vel_mwshape",     "Crow On Reed Velocity MW Shape", true),   // NEW
    P(8,  "key_noises",           "Key Noises Velocity"),
    P(9,  "various_noises",       "Various Noises Velocity"),   // NEW
    P(10, "air_noises",           "Air Noises Velocity CC4"),   // CC4 = the air amount, per the menu name; measured at 0d
    P(11, "vib_vel",              "Vibrato Velocity"),
    P(12, "senza_vel",            "Senza Vibrato Velocity"),
    P(13, "flutter_vel",          "Flutter Tongue Velocity"),
    P(14, "vib_x_senza_vxmw",     "Vibrato - Senza Vibrato Velocity X MW", true),   // NEW
    P(15, "vib_senza_mw2d_cc2",   "Vibrato + Senza Vibrato MW 2 dimensional X CC2", true),   // NEW
    P(16, "triple16",             "Triple Tongue 16T"),
    P(17, "morph_vxmw",           "Senza Vibrato + Flutter Tongue Velocity X MW", true),
    P(18, "vib_flutter_vxmw",     "Vibrato + Flutter Tongue Velocity X MW", true),   // NEW
    P(19, "stac_vel",             "Staccato Velocity"),
    P(20, "accent_vel",           "With Accent Velocity"),
    P(21, "mp_loop",              "Multiphonics MW", true),
    P(22, "crow_vel",             "Crow On Reed Velocity"),   // NEW
    P(23, "air_noises_mw",        "Air Noises MW", true),
    P(24, "undef_tones",          "Undefined Tones Velocity"),
    P(25, "cresc_espr",           "Crescendo Espressivo"),   // NEW
    P(26, "cresc",                "Crescendo"),
    P(27, "portato",              "Portato Velocity"),
    P(28, "secco",                "Secco Velocity"),
    P(29, "vib_to_senza",         "Vibrato to Senza Vibrato Velocity"),   // NEW
    P(30, "senza_to_vib",         "Senza Vibrato to Vibrato Velocity"),   // NEW
    P(31, "vib_vel_mwinv",        "Vibrato Velocity + MW inverted", true),
    P(32, "senza_vel_mwinv",      "Senza Vibrato Velocity + MW inverted", true),
    P(33, "pseudo_bsn_vel_mwinv", "Pseudo Bassoon Velocity + MW inverted", true),   // NEW
    P(34, "pseudo_bsn_stac",      "Pseudo Bassoon Staccato Velocity"),   // NEW
    P(35, "pseudo_ob_vel_mwinv",  "Pseudo Oboe Velocity + MW inverted", true),   // NEW
    P(36, "pseudo_ob_stac",       "Pseudo Oboe Staccato Velocity"),   // NEW
    // 37–39 Free Preset — empty slots, not techniques
  ];
}

// ---- UVI PARTS (generated by tools/apply_uvi_parts.js from the running rack — do not edit by hand) ----
const UVI_PARTS = {   // read from the running rack 2026-09-18 02:02 — bassoon: 22 techniques on 21 parts, 3 curve copies · horn: 25 techniques on 21 parts, 3 curve copies · trumpet: 35 techniques on 23 parts, 3 curve copies
  bassoon: {
    techniques: { ord: {"port":"LGBassoon","channel":1}, blow_no_reed: {"port":"LGBassoon","channel":2}, chrom_scale: {"port":"LGBassoon","channel":3}, cresc: {"port":"LGBassoon","channel":4}, cresc_decresc: {"port":"LGBassoon","channel":4}, decresc: {"port":"LGBassoon","channel":4}, dur_0_5s: {"port":"LGBassoon","channel":5}, dur_1s: {"port":"LGBassoon","channel":5}, flz: {"port":"LGBassoon","channel":6}, fortepiano: {"port":"LGBassoon","channel":7}, harmonic_fing: {"port":"LGBassoon","channel":8}, key_click: {"port":"LGBassoon","channel":9}, multiphonics: {"port":"LGBassoon","channel":10}, ord_mute: {"port":"LGBassoon","channel":11}, ord_1q: {"port":"LGBassoon","channel":12}, sforzando: {"port":"LGBassoon","channel":13}, staccato: {"port":"LGBassoon","channel":14}, gliss_throat_down: {"port":"LGBassoon","channel":15}, gliss_throat_up: {"port":"LGBassoon","channel":16}, trill_m2: {"port":"LGBassoonb","channel":1}, trill_M2: {"port":"LGBassoonb","channel":1}, vib_vel: {"port":"LGBassoonb","channel":2} },
    main: {"port":"LGBassoon","channel":1}, curve: [{"port":"LGBassoonb","ch":3},{"port":"LGBassoonb","ch":4},{"port":"LGBassoonb","ch":5}], curveTechniques: ["ord"],
    parts: [{"track":"Bassoon SI2","part":"Part 1","ch":1,"program":"Bassoon Ordinario"},
            {"track":"Bassoon SI2","part":"Part 2","ch":2,"program":"Bassoon Blow Without Reed"},
            {"track":"Bassoon SI2","part":"Part 3","ch":3,"program":"Bassoon Chromatic Scale"},
            {"track":"Bassoon SI2","part":"Part 4","ch":4,"program":"Bassoon Cresc & Decrescendo KS"},
            {"track":"Bassoon SI2","part":"Part 5","ch":5,"program":"Bassoon Durations KS"},
            {"track":"Bassoon SI2","part":"Part 6","ch":6,"program":"Bassoon Flatterzunge"},
            {"track":"Bassoon SI2","part":"Part 7","ch":7,"program":"Bassoon Fortepiano"},
            {"track":"Bassoon SI2","part":"Part 8","ch":8,"program":"Bassoon Harmonic Fingering"},
            {"track":"Bassoon SI2","part":"Part 9","ch":9,"program":"Bassoon Key Click"},
            {"track":"Bassoon SI2","part":"Part 10","ch":10,"program":"Bassoon Multiphonics Menu"},
            {"track":"Bassoon SI2","part":"Part 11","ch":11,"program":"Bassoon Mute Ordinario"},
            {"track":"Bassoon SI2","part":"Part 12","ch":12,"program":"Bassoon Quartertones Ordinario"},
            {"track":"Bassoon SI2","part":"Part 13","ch":13,"program":"Bassoon Sforzando"},
            {"track":"Bassoon SI2","part":"Part 14","ch":14,"program":"Bassoon Staccato"},
            {"track":"Bassoon SI2","part":"Part 15","ch":15,"program":"Bassoon Throat Glissando Down KS"},
            {"track":"Bassoon SI2","part":"Part 16","ch":16,"program":"Bassoon Throat Glissando Up KS"},
            {"track":"Bassoon SI2 b","part":"Part 1","ch":1,"program":"Bassoon Trills KS"},
            {"track":"Bassoon SI2 b","part":"Part 2","ch":2,"program":"Bassoon Vibrato"},
            {"track":"Bassoon SI2 b","part":"Part 3","ch":3,"program":"Bassoon Ordinario"},
            {"track":"Bassoon SI2 b","part":"Part 4","ch":4,"program":"Bassoon Ordinario"},
            {"track":"Bassoon SI2 b","part":"Part 5","ch":5,"program":"Bassoon Ordinario"}],
  },
  horn: {
    techniques: { ord: {"port":"LGHorn","channel":1}, chrom_scale: {"port":"LGHorn","channel":2}, cresc: {"port":"LGHorn","channel":3}, cresc_decresc: {"port":"LGHorn","channel":3}, decresc: {"port":"LGHorn","channel":3}, cuivre: {"port":"LGHorn","channel":4}, dur_0_5s: {"port":"LGHorn","channel":5}, dur_1s: {"port":"LGHorn","channel":5}, flz: {"port":"LGHorn","channel":6}, fortepiano: {"port":"LGHorn","channel":7}, flz_mute: {"port":"LGHorn","channel":8}, ord_mute: {"port":"LGHorn","channel":9}, open_to_stopped: {"port":"LGHorn","channel":10}, stopped_to_open: {"port":"LGHorn","channel":10}, ord_to_cuivre: {"port":"LGHorn","channel":11}, cuivre_to_ord: {"port":"LGHorn","channel":11}, ord_to_flz: {"port":"LGHorn","channel":12}, flz_to_ord: {"port":"LGHorn","channel":12}, sforzando: {"port":"LGHorn","channel":13}, slap_pitched: {"port":"LGHorn","channel":14}, staccato: {"port":"LGHorn","channel":15}, flz_stopped: {"port":"LGHorn","channel":16}, stopped: {"port":"LGHornb","channel":1}, trill_m2: {"port":"LGHornb","channel":2}, trill_M2: {"port":"LGHornb","channel":2} },
    main: {"port":"LGHorn","channel":1}, curve: [{"port":"LGHornb","ch":3},{"port":"LGHornb","ch":4},{"port":"LGHornb","ch":5}], curveTechniques: ["ord"],
    parts: [{"track":"Horn SI2","part":"Part 1","ch":1,"program":"French Horn Ordinario"},
            {"track":"Horn SI2","part":"Part 2","ch":2,"program":"French Horn Chromatic Scale"},
            {"track":"Horn SI2","part":"Part 3","ch":3,"program":"French Horn Cresc & Decrescendo KS"},
            {"track":"Horn SI2","part":"Part 4","ch":4,"program":"French Horn Cuivre"},
            {"track":"Horn SI2","part":"Part 5","ch":5,"program":"French Horn Durations KS"},
            {"track":"Horn SI2","part":"Part 6","ch":6,"program":"French Horn Flatterzunge"},
            {"track":"Horn SI2","part":"Part 7","ch":7,"program":"French Horn Fortepiano"},
            {"track":"Horn SI2","part":"Part 8","ch":8,"program":"French Horn Mute Flatterzunge"},
            {"track":"Horn SI2","part":"Part 9","ch":9,"program":"French Horn Mute Ordinario"},
            {"track":"Horn SI2","part":"Part 10","ch":10,"program":"French Horn Open & Stopped KS"},
            {"track":"Horn SI2","part":"Part 11","ch":11,"program":"French Horn Ord & Cuivre KS"},
            {"track":"Horn SI2","part":"Part 12","ch":12,"program":"French Horn Ord & Flatterzunge KS"},
            {"track":"Horn SI2","part":"Part 13","ch":13,"program":"French Horn Sforzando"},
            {"track":"Horn SI2","part":"Part 14","ch":14,"program":"French Horn Slap Pitched"},
            {"track":"Horn SI2","part":"Part 15","ch":15,"program":"French Horn Staccato"},
            {"track":"Horn SI2","part":"Part 16","ch":16,"program":"French Horn Stopped Flatterzunge"},
            {"track":"Horn SI2 b","part":"Part 1","ch":1,"program":"French Horn Stopped Ordinario"},
            {"track":"Horn SI2 b","part":"Part 2","ch":2,"program":"French Horn Trills KS"},
            {"track":"Horn SI2 b","part":"Part 3","ch":3,"program":"French Horn Ordinario"},
            {"track":"Horn SI2 b","part":"Part 4","ch":4,"program":"French Horn Ordinario"},
            {"track":"Horn SI2 b","part":"Part 5","ch":5,"program":"French Horn Ordinario"}],
  },
  trumpet: {
    techniques: { ord: {"port":"LGTrumpet","channel":1}, cresc: {"port":"LGTrumpet","channel":2}, cresc_decresc: {"port":"LGTrumpet","channel":2}, decresc: {"port":"LGTrumpet","channel":2}, cuivre: {"port":"LGTrumpet","channel":3}, dur_0_5s: {"port":"LGTrumpet","channel":4}, dur_1s: {"port":"LGTrumpet","channel":4}, flz: {"port":"LGTrumpet","channel":5}, fortepiano: {"port":"LGTrumpet","channel":6}, gliss_embouchure: {"port":"LGTrumpet","channel":7}, half_valve_gliss: {"port":"LGTrumpet","channel":7}, harmonics_gliss: {"port":"LGTrumpet","channel":7}, legato_intervals: {"port":"LGTrumpet","channel":8}, ord_mute_cup: {"port":"LGTrumpet","channel":9}, flz_mute_cup: {"port":"LGTrumpet","channel":9}, ord_mute_harmon: {"port":"LGTrumpet","channel":10}, flz_mute_harmon: {"port":"LGTrumpet","channel":10}, ord_mute_straight: {"port":"LGTrumpet","channel":11}, flz_mute_straight: {"port":"LGTrumpet","channel":11}, wawa_closed: {"port":"LGTrumpet","channel":12}, wawa_open: {"port":"LGTrumpet","channel":12}, wawa_closed_to_open: {"port":"LGTrumpet","channel":12}, wawa_open_to_closed: {"port":"LGTrumpet","channel":12}, wawa_flz_open: {"port":"LGTrumpet","channel":12}, ord_to_cuivre: {"port":"LGTrumpet","channel":13}, cuivre_to_ord: {"port":"LGTrumpet","channel":13}, ord_to_flz: {"port":"LGTrumpet","channel":14}, flz_to_ord: {"port":"LGTrumpet","channel":14}, pedal_tone: {"port":"LGTrumpet","channel":15}, sforzando: {"port":"LGTrumpet","channel":16}, slap_pitched: {"port":"LGTrumpetb","channel":1}, staccato: {"port":"LGTrumpetb","channel":2}, trill_m2: {"port":"LGTrumpetb","channel":3}, trill_M2: {"port":"LGTrumpetb","channel":3}, vocalize_harmonics: {"port":"LGTrumpetb","channel":4} },
    main: {"port":"LGTrumpet","channel":1}, curve: [{"port":"LGTrumpetb","ch":5},{"port":"LGTrumpetb","ch":6},{"port":"LGTrumpetb","ch":7}], curveTechniques: ["ord"],
    parts: [{"track":"Trumpet SI2","part":"Part 1","ch":1,"program":"Trumpet Ordinario"},
            {"track":"Trumpet SI2","part":"Part 2","ch":2,"program":"Trumpet Cresc & Decrescendo KS"},
            {"track":"Trumpet SI2","part":"Part 3","ch":3,"program":"Trumpet Cuivre"},
            {"track":"Trumpet SI2","part":"Part 4","ch":4,"program":"Trumpet Durations KS"},
            {"track":"Trumpet SI2","part":"Part 5","ch":5,"program":"Trumpet Flatterzunge"},
            {"track":"Trumpet SI2","part":"Part 6","ch":6,"program":"Trumpet Fortepiano"},
            {"track":"Trumpet SI2","part":"Part 7","ch":7,"program":"Trumpet Glissando Menu KS"},
            {"track":"Trumpet SI2","part":"Part 8","ch":8,"program":"Trumpet Increasing Intervals Legato"},
            {"track":"Trumpet SI2","part":"Part 9","ch":9,"program":"Trumpet Mute Cup KS"},
            {"track":"Trumpet SI2","part":"Part 10","ch":10,"program":"Trumpet Mute Harmon KS"},
            {"track":"Trumpet SI2","part":"Part 11","ch":11,"program":"Trumpet Mute Straight KS"},
            {"track":"Trumpet SI2","part":"Part 12","ch":12,"program":"Trumpet Mute Wahwah KS"},
            {"track":"Trumpet SI2","part":"Part 13","ch":13,"program":"Trumpet Ord & Cuivre KS"},
            {"track":"Trumpet SI2","part":"Part 14","ch":14,"program":"Trumpet Ord & Flatterzunge KS"},
            {"track":"Trumpet SI2","part":"Part 15","ch":15,"program":"Trumpet Pedal Tone"},
            {"track":"Trumpet SI2","part":"Part 16","ch":16,"program":"Trumpet Sforzando"},
            {"track":"Trumpet SI2 b","part":"Part 1","ch":1,"program":"Trumpet Slap Pitched"},
            {"track":"Trumpet SI2 b","part":"Part 2","ch":2,"program":"Trumpet Staccato"},
            {"track":"Trumpet SI2 b","part":"Part 3","ch":3,"program":"Trumpet Trills KS"},
            {"track":"Trumpet SI2 b","part":"Part 4","ch":4,"program":"Trumpet Vocalize on Harmonics"},
            {"track":"Trumpet SI2 b","part":"Part 5","ch":5,"program":"Trumpet Ordinario"},
            {"track":"Trumpet SI2 b","part":"Part 6","ch":6,"program":"Trumpet Ordinario"},
            {"track":"Trumpet SI2 b","part":"Part 7","ch":7,"program":"Trumpet Ordinario"}],
  },
};
function applyUviParts(all, gen) {   // the rack decides the channel and the port of every SI2 technique; the recipe keeps the preset and the keyswitch
  for (const [inst, g] of Object.entries(gen || {})) {
    const R = all[inst]; if (!R || !R.techniques) continue;
    for (const q of R.techniques) { const v = g.techniques[q.key]; if (!v) { if (q.channel == null && g.main) q.channel = g.main.channel; continue; } q.channel = v.channel; if (v.port !== R.port) q.port = v.port; else delete q.port; q.placed = true; }
    if (g.main) R.channels = { main: g.main.channel, mainPort: g.main.port !== R.port ? g.main.port : undefined, curve: g.curve.map(c => ({ port: c.port, ch: c.ch })), curveTechniques: g.curveTechniques.slice() };
    R.uviParts = g.parts.slice();
  }
}
applyUviParts(INSTRUMENTS, UVI_PARTS);
// ---- end of the UVI parts ----

// ---- ARO PERCUSSION (generated by tools/apply_perc.js from bank/perc_selection.json — do not edit by hand) ----
const ARO_PERC = {   // 0 instrument(s) selected 2026-09-18 — the placeholder voice stays
  port: "LGPerc",
  instruments: [
  ],
};
function applyAroPerc(all, sel) {   // the selection REPLACES the placeholder voice; nothing selected → nothing changes
  const P = all.percussion; if (!P || !sel || !sel.instruments || !sel.instruments.length) return;
  const techs = [];
  for (const I of sel.instruments) for (const q of I.techniques) techs.push(Object.assign({}, q, { keys: q.keys.slice() }));
  P.techniques = techs; P.ordinary = techs[0].key;
  P.rangeLow = Math.min(...techs.map(q => q.rangeLow)); P.rangeHigh = Math.max(...techs.map(q => q.rangeHigh));
  P.channels = { main: sel.instruments[0].channel, curve: [] };   // a curve voice on another channel would be another INSTRUMENT (cresc.js: empty = the voice's own channel)
  P.aroInstruments = sel.instruments.map(I => ({ slug: I.slug, name: I.name, port: I.port, channel: I.channel }));
}
applyAroPerc(INSTRUMENTS, ARO_PERC);
// ---- end of the ARO percussion ----

// ---- MEASURED RANGES — piece #5's, for the CELLO ONLY ----
// Measured 2026-09-06T14:50 in the Tempus rack (01-REC-260906_1415.wav): per technique [lo, hi]
// of the keys that actually sounded, silent keys listed. The cello is the same library and the
// same instrument, so the measurement carries; every other instrument's rows were left behind
// with piece #5 and are re-measured here at 0d.
const MEASURED_RANGES = {
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

// ---- MEASURED BEND RANGE — piece #5's, for the CELLO ONLY ----
// Measured 2026-09-07T00:22 (01-REC-260907_0015.wav): semitones per full bend on the ordinary
// voice. RPN 0 was NOT honoured on any Xsample instrument there — the range is what Kontakt is
// set to, so the bend is a property of the rack, not of MIDI (0e re-checks it here).
const MEASURED_BEND = {
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
