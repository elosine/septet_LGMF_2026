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
  english_horn: {
    label: "English Horn", port: "LGEngHorn", rangeLow: 52, rangeHigh: 81,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [2, 3, 4] },
    techniques: [
      { key: "ord",      label: "Ordinario (PROVISIONAL — no library yet)", channel: 1 },
      { key: "staccato", label: "Staccato (PROVISIONAL — no library yet)",  channel: 1 },
    ],
  },

  // ---- BASSOON — IRCAM Solo Instruments 2 (UVI) ----
  // Manual: "Instrument part to be written at actual pitch"; range in sounding pitches Bb1–Eb5
  // = MIDI 34–75. The roster below is the manual's own list. On UVI a channel IS a technique, so
  // the curve channels of D11 need technique COPIES on a second instance (piece #5's flute did
  // this on a `Fluteb` port) — that is 0c/0e work; every channel here is a placeholder 1.
  bassoon: {
    label: "Bassoon", port: "LGBassoon", rangeLow: 34, rangeHigh: 75,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [2, 3, 4] },
    techniques: [
      { key: "ord",           label: "ordinario", channel: 1 },
      { key: "ord_1q",        label: "ordinario quarter-tone", channel: 1 },
      { key: "staccato",      label: "staccato", channel: 1 },
      { key: "sforzando",     label: "sforzando", channel: 1 },
      { key: "flz",           label: "flatterzunge", channel: 1 },
      { key: "chrom_scale",   label: "chromatic scale", channel: 1 },
      { key: "cresc",         label: "crescendo", channel: 1 },
      { key: "decresc",       label: "decrescendo", channel: 1 },
      { key: "cresc_decresc", label: "crescendo to decrescendo", channel: 1 },
      { key: "multiphonics",  label: "multiphonics", channel: 1 },
      { key: "key_click",     label: "key click", channel: 1 },
      { key: "harmonic_fing", label: "harmonic fingering", channel: 1 },
      { key: "trill_m2",      label: "trill minor 2nd up", channel: 1 },
      { key: "trill_M2",      label: "trill major 2nd up", channel: 1 },
      { key: "vib_vel",       label: "vibrato", channel: 1 },
      { key: "dur_0_5s",      label: "note durations 0.5 s", channel: 1 },
      { key: "dur_1s",        label: "note durations 1 s", channel: 1 },
      { key: "gliss_throat",  label: "glissando with throat — NEW, not in techniques.json", channel: 1 },
      { key: "blow_no_reed",  label: "blow without reed — NEW, not in techniques.json", channel: 1 },
    ],
  },

  // ---- HORN in F — IRCAM Solo Instruments 2 (UVI) ----
  // Manual: "Instrument part to be written a perfect fifth higher" — this is the SOURCE for the
  // ensemble registry's transpose: +7 (step 6). Range in sounding pitches B1–F4 = MIDI 35–65.
  horn: {
    label: "Horn", port: "LGHorn", rangeLow: 35, rangeHigh: 65,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [2, 3, 4] },
    techniques: [
      { key: "ord",             label: "ordinario", channel: 1 },
      { key: "staccato",        label: "staccato", channel: 1 },
      { key: "sforzando",       label: "sforzando", channel: 1 },
      { key: "flz",             label: "flatterzunge", channel: 1 },
      { key: "chrom_scale",     label: "chromatic scale", channel: 1 },
      { key: "cresc",           label: "crescendo", channel: 1 },
      { key: "decresc",         label: "decrescendo", channel: 1 },
      { key: "cresc_decresc",   label: "crescendo to decrescendo", channel: 1 },
      { key: "trill_m2",        label: "trill minor 2nd up", channel: 1 },
      { key: "trill_M2",        label: "trill major 2nd up", channel: 1 },
      { key: "dur_0_5s",        label: "note durations 0.5 s", channel: 1 },
      { key: "dur_1s",          label: "note durations 1 s", channel: 1 },
      { key: "cuivre",          label: "cuivré — NEW, not in techniques.json", channel: 1 },
      { key: "ord_to_cuivre",   label: "ordinario to cuivré — NEW", channel: 1 },
      { key: "cuivre_to_ord",   label: "cuivré to ordinario — NEW", channel: 1 },
      { key: "stopped",         label: "stopped — NEW", channel: 1 },
      { key: "open_to_stopped", label: "open to stopped — NEW", channel: 1 },
      { key: "stopped_to_open", label: "stopped to open — NEW", channel: 1 },
      { key: "flz_stopped",     label: "flatterzunge stopped — NEW", channel: 1 },
      { key: "slap_pitched",    label: "slap pitched — NEW", channel: 1 },
    ],
  },

  // ---- TRUMPET in C — IRCAM Solo Instruments 2 (UVI) ----
  // Manual: "Instrument part to be written at actual pitch" — SI2's trumpet is in C. Whether the
  // PART is written in C or in B♭ is the composer's call at 2a; the library is unaffected.
  // Range in sounding pitches F#3–Bb5 = MIDI 54–82. Four mutes exist as separate SI2 instruments
  // (cup · harmon · straight · wawa) — registered at 0c if he wants them.
  trumpet: {
    label: "Trumpet", port: "LGTrumpet", rangeLow: 54, rangeHigh: 82,
    ordinary: "ord", beating: true, playerBendSt: 1, bendRangeSt: 2,
    channels: { main: 1, curve: [2, 3, 4] },
    techniques: [
      { key: "ord",            label: "ordinario", channel: 1 },
      { key: "staccato",       label: "staccato", channel: 1 },
      { key: "sforzando",      label: "sforzando", channel: 1 },
      { key: "flz",            label: "flatterzunge", channel: 1 },
      { key: "cresc",          label: "crescendo", channel: 1 },
      { key: "decresc",        label: "decrescendo", channel: 1 },
      { key: "cresc_decresc",  label: "crescendo to decrescendo", channel: 1 },
      { key: "trill_m2",       label: "trill minor 2nd up", channel: 1 },
      { key: "trill_M2",       label: "trill major 2nd up", channel: 1 },
      { key: "dur_0_5s",       label: "note durations 0.5 s", channel: 1 },
      { key: "dur_1s",         label: "note durations 1 s", channel: 1 },
      { key: "cuivre",         label: "cuivré — NEW, not in techniques.json", channel: 1 },
      { key: "ord_to_cuivre",  label: "ordinario to cuivré — NEW", channel: 1 },
      { key: "cuivre_to_ord",  label: "cuivré to ordinario — NEW", channel: 1 },
      { key: "ord_to_flz",     label: "ordinario to flatterzunge", channel: 1 },
      { key: "flz_to_ord",     label: "flatterzunge to ordinario", channel: 1 },
      { key: "half_valve_gliss", label: "half-valve glissando — NEW", channel: 1 },
      { key: "gliss_embouchure", label: "glissando embouchure — NEW", channel: 1 },
      { key: "harmonics_gliss",  label: "harmonics glissando — NEW", channel: 1 },
      { key: "pedal_tone",       label: "pedal tone — NEW", channel: 1 },
      { key: "slap_pitched",     label: "slap pitched — NEW", channel: 1 },
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

  // ---- CELLO — Xsample Contemporary Solo Strings (Kontakt), CC#0 selects the preset ----
  // PIECE #5'S ENTRY, CARRIED VERBATIM (D6) — the one recipe in this file that has been heard,
  // and its measured ranges and bend range come across with it (the tables below). Only the PORT
  // name changes, and only because loopMIDI ports are machine-global (see the header).
  // The full Xsample roster is 88 presets, identical across the instruments except the string
  // names; CC#0 = preset − 1. Channels per D11: 1 main · 2–4 curve A/B/C.
  cello: { balanceDb: -1, ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "Cello", port: "LGCello", rangeLow: 36, rangeHigh: 83, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["C", "G", "D", "A"], 36, 83) },

  // ---- DOUBLE BASS — Xsample (D6: "use xsample double bass") ----
  // The cello's model, deliberately: one string mechanism for the PAIR (LG-1), the same CC#0
  // preset select and the same channel bank. The roster is generated by the same helper, so the
  // key set is the cello's — but the preset NUMBERS are assumed, not read: **every cc0 here is
  // the cello's, and must be verified against the Xsample double bass's own Preset Menu at 0c.**
  // Open strings E1 A1 D2 G2. Range 28–67 (E1–G4) is the standard compass, NOT measured — the
  // instrument sounds an octave below its written part (the notation layer's +12, step 6).
  double_bass: { ordinary: "senza_vel", playerBendSt: 1, bendRangeSt: 2, label: "D. Bass", port: "LGBass", rangeLow: 28, rangeHigh: 67, mechanism: "cc0", channels: { main: 1, curve: [2, 3, 4] }, techniques: xsStringTechs(["E", "A", "D", "G"], 28, 67) },
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
