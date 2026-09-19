# NITS — deferred small stuff

> Things worth fixing that are **not** blocking the piece (`AI_METHODOLOGY.md` rule 1: fix
> what blocks the work or what will break; record the rest here). One bullet each: what it
> is, what was observed, why it is deferred. Enough context to act on cold. Delete when
> fixed. **Never ask the composer to triage this file.**

## From the port of piece #5's engine (2026-09-17, RUNNING_LOG §12–§18)

### Tests that are piece #5's, bound to #5's palette or #5's material

*Each was GREEN before the re-palette and RED after — the cause is known in every case, and
none is a defect in this repo's code. They are rewritten against this piece's material at 0c
(the recipes) and 2a (the notation), which is exactly what piece #5 did with piece #4's.*

- **`beating_calc_check`** — asserts #5's six bending players **by name**, then indexes them.
  Its own first lines already print the right six for this piece
  (`english_horn bassoon horn trumpet cello double_bass`); only the expected list is stale.
- **`strike_chords_check`** — asserts #5's seven players and their ordinary ranges.
- **`piano_harmonics_check`** — reads `INSTRUMENTS.piano.techniques`. **This piece has no
  piano.** The feature itself is quiet in the running app (proven by clicking, §16); the
  check cannot run at all. Retire it, or repoint it if the percussionist ever takes the
  struck role (the planner's open question).
- **`harm_source_check`** — needs strikes #24 and #26 from `bank/scattered_strikes.json`,
  the composer's own recorded piano strikes, deliberately left behind. Its pure logic
  section passes; only the data section dies.
- **`piano_cues_check`** — ENOENT `scores/piano-harmonics-test.json`, one of #5's scores.
- **`test_septet_notation`** (101 checks), **`test_trills`** (92), **`test_morph_notation`**
  (178), **`test_cross_staff`** (79), **`test_surge_run`**, **`test_step_dynamics`**,
  **`test_identity`** — all read `scores/piece-septet.json` or `notation/ir/piece-septet.ir.json`
  as fixtures. They ran GREEN here on staged copies (§13) and are the best evidence the
  engine is whole; they need this piece's own pages before they mean anything about it.
  `notation/ir/README.md` holds the staging recipe.
- **`tools/fixtures/*_snapshot.json`** are hashes of piece #4's pages. Regenerate with
  `--update` when this piece has real pages (2a) — not before, or the snapshot proves nothing.

### Red in the SOURCE too — not ours, and not new

- **`test_coords`** — `FAIL px boundary: layout.js is pixel-free (seconds + ss only)`.
  Identical failure in `septet_2026`, run there read-only (§13).
- **`cresc_check`** — 2 FAILED. Identical in the source. Its two "FAIL" lines are prose
  describing behaviour #5 accepted; the check reports them as failures.
- **`test_extract_played`** — snapshot drift; #5 recorded it red at its own 0g, and red in
  piece #4 itself.
- **`ir_extract_golden`** (19 differences) and **`test_notate_block`** (62/65) — piece #4's
  frozen goldens read by #5's evolved engine: `extract_core.js`, `layout.js` and
  `classify.js` all differ between #4 and #5 while the test harnesses do not. The third
  `notate_block` failure is about `cuivre`, a tuba technique with no row in this piece's
  `bank/sample_lengths.json`.
- **`test_playability`** — ENOENT `docs/SI2_staccato_lengths.md`, the tuba doc. #5 recorded
  the same. This piece's sample-length tables come at 0c / 0d.
- **`test_midiplayer` · `test_sonify_core`** — a tuba score's lanes resolve to recipe keys no
  septet carries (`r.port` null). #5 recorded exactly this.

### Carried code that still speaks of other pieces

- **The piano as a ROLE survives in twelve modules** (`strike_sounds` · `strike_drawer` ·
  `chord_run` · `strike_chords_ui` · `swell_ui` · `cresc_panel` · `morph_panel` ·
  `cue_picker` · `piano_cues` · `piano_harmonics` · `cresc_strikes` · `composer.html`
  `cueLane()`). Every one looks the lane up with `findIndex` and gets −1; each was exercised
  in the running app and is quiet (§16). **Deliberate — see the port's P2.** Whether the
  percussionist inherits the struck role is the composer's, and it is in `PLANNER.md`.
- **`score/public/clusterview.html` and `chordview.html`** still address piece #4's
  `tuba1..tuba10` ports (they are #4's cluster/chord research viewers, inert while the banks
  are empty, and they were already a NIT in #5). Re-palette the first time a cluster or chord
  bank exists here.
- **`multitempo.js` `LO = 30, HI = 67`** is still the tuba bank's playable range. Per-lane
  ranges belong there when the MT rig is first used — and LG-5 makes that likely early.
- **`probes/*.ps1` default `$Port = 'tuba1'`** — parameters, not logic; set this piece's port
  when a probe is run (0d).
- **Copied bank presets carry "10 tubas" labels** in `texture_params`, `texture_models`,
  `morph_models`, `morph_recipes` — honest provenance; relabel only when a Lake George preset
  replaces one. The panel takes in `bank/panel_snapshots.json` are piece #5's, at its last
  commit; they load, and they are his reference material.
- **`docs/instrument_map.json` has zero instruments** ("Loaded 0 instruments" on every page
  load). It is piece #2 lineage and is NOT what routes MIDI here (`sandbox/instruments.js`
  is). Fill or retire at 0c.
- **The carried tool docs describe the tools as built for the TEMPUS septet** — their
  instrument names, their measurements and their `§N` references into #5's RUNNING_LOG.
  Each says so in its first line. `SAMPLER_QUIRKS.md` is the one to watch: only its Xsample
  entries are about an instrument this piece has.
- **`docs/SWEEP_LIST.md` was NOT carried** — it is #5's open fault list for its own composing
  sessions. This piece opens its own when composing starts.

### Open work this port created or uncovered

- **18 recipe technique keys are not in `notation/registry/techniques.json`** — the brass and
  bassoon extras (`cuivre`, `ord_to_cuivre`, `cuivre_to_ord`, `stopped`, `open_to_stopped`,
  `stopped_to_open`, `flz_stopped`, `slap_pitched`, `half_valve_gliss`, `gliss_embouchure`,
  `harmonics_gliss`, `pedal_tone`, `gliss_throat`, `blow_no_reed`). `tools/palette_check.js`
  lists them on every run. A roster entry is not yet a notation kind; they must be registered
  **before any material uses one** (principle 3: the schema is a gate on the file).
- ~~The double bass's CC#0 preset numbers are the cello's~~ — **closed 2026-09-17** (RUNNING_LOG §32): verified against
  the bass's own Preset Menu, all 88 identical in order.
- **The percussion recipe is one placeholder voice** (`main`) over 21–108, and that range is
  set so `laneCanPlay` never routes material away — it is not a claim about any instrument.
  Real entries at 0c, once he names the instruments. **Spitfire's own plugin has never been
  driven by this stack**; that is real work, not a transcription.
- ~~The english horn's library is unnamed; its two techniques are placeholders~~ — **closed 2026-09-17**: Xsample (D8),
  the roster of 36 presets written from his Preset Menu (RUNNING_LOG §32). Ranges still assumed until 0d.
- **The presentation score's pitch form is undecided for this piece.** The `video-jury`
  realization's part override was emptied at the port because it named `bass_clarinet` and
  `layout.js ensembleFor()` **throws** on an override for a part that does not exist (§17).
  In C, or at written pitch? His call at 2b; #5's D55 is the precedent, not the answer.
- **`.claude/launch.json` carries a `tempus-5300` entry** that starts piece #5's server from
  its own folder. Deliberate, so both apps can sit side by side while #5's PLAN 3 is unbuilt.
  Remove it when that piece is finished.
- **`MORPH_NOTES.md` §1–§2 say "this piece" and mean the Tempus septet.** Flagged in its first
  line. Rewrite §1 "What exists" the first time the morph tool is adjusted for Lake George;
  §3 stays append-only.
- **`HOW_WE_WORK.md` cites `RUNNING_LOG §182 · §188 · §209 · §216`** — the TEMPUS lab
  journal's sections, flagged in its provenance line. Left as they are: they are the source
  of those rules.

#### From the percussion scaffolding (2026-09-17, RUNNING_LOG §19)

- **The day the first percussion instrument is selected, four app tables go RED** in
  `palette_check`: `strike_drawer.js STRIKE_DEFAULT` · `ART_SETS.spiccato` · `ART_SETS.staccato`
  · `cresc_card.js STRIKE_DEFAULT` — each names `percussion → main`, the placeholder that
  `apply_perc.js` replaces. Point them at a real technique key then (proved with a two-instrument
  proof selection, §19). Not fixable now: there is no real key to point at.
- **Percussion technique keys are generated** (`<slug>_<beater>`, e.g. `brake_drums_poly_beater`)
  and are not notation kinds. Register each in `techniques.json` when its instrument is chosen —
  and percussion notation proper (a percussion clef, one-line / five-line staves, unpitched
  noteheads) is the 2a item `ensemble.json`'s `_clefNote` already names.
- **The sandbox shows no per-key labels for a percussion technique.** The technique carries a
  `keys` table (`{ midi, label }` — "Low · Hit L") that no UI reads. Surface it when the first
  instrument is chosen, so he picks a key by name, not by number.
- **39 catalog entries are skeletons** — name and beaters only, no keys; `apply_perc.js` refuses
  them. Mapping one is the hover-and-dictate walkthrough (catalog `_meta.walkthrough`), him at the
  machine, minutes per instrument. Do it per instrument as he chooses, never all 39.
- **`tools/apply_ranges.js` would BREAK the recipe if re-run.** Its BEGIN marker
  (`MEASURED RANGES (generated by tools/apply_ranges.js …)`) no longer matches the carried block's
  header (`MEASURED RANGES — piece #5's, for the CELLO ONLY`), so it would insert a SECOND
  `const MEASURED_RANGES` before the hardware-capture lines and `instruments.js` would not
  evaluate. `apply_bend_ranges.js` has the same shape — check it the same way. Fix the marker or
  the header before 0d's first probe.
- **Piece #5's `tools/uvi_state.js` has the header flaw fixed here** (RUNNING_LOG §22): its `rebuild()` rewrites only LE fields
  within 64 of the old length and its committed flute carries the same 496-byte header. Carry the fix back before #5's rack is
  next edited as text (never from this repo — a note for that repo's own session).

- **Automate the loopMIDI ports for the percussion** (composer, 2026-09-17: *"we should make a note to figure out how you can
  automate the loop MIDI ports, because each of the percussion instruments will need its own port"*). Today the ports are made by
  hand in loopMIDI (ten, §20). Find whether loopMIDI can be driven (its CLI / config file / registry) before the percussion tracks
  are made; the per-instrument-port design itself is his call against D7's one-port-many-channels (RUNNING_LOG §34–§35).

- **`tools/beating_calc_check.js` is still piece #5's and CRASHES** (found 2026-09-19 running it after PLAN 1a.2's ceiling
  change). It asserts #5's cast — flute, bass clarinet, two violins, viola, cello, plus a piano that does not exist here — so
  its first three assertions fail and then it throws on `ranges['bowed_vibraphone']` being undefined, because the vibraphone
  joined the palette on 2026-09-18 (D12). It is NOT one of this piece's gates (CLAUDE.md names `palette_check.js` and
  `test_written_pitch.js`), and it was already dead before today's edits — nothing regressed. Rewriting it for this ensemble
  is worth doing before the beating tool is used in earnest (LG-8, LG-15), not now. **One thing in it is worth keeping
  whatever happens:** its assertion that *"the flute (SI2) at ±2 st, the five Xsample instruments at ±1 st (0.96–0.99
  measured)"* — piece #5 measured ALL FIVE of its Xsample instruments at a semitone, which is the independent confirmation
  behind §67's setting of this piece's english horn and double bass to `bendRangeSt: 1`.

- **`model_bank --validate` warns twice about `provenance.palette`** (2026-09-19, PLAN 1a.5). The validator's allowed-key
  list for an actual's provenance does not include `palette`, but `buildActual` writes it on every septet render (§213 —
  each voice's player, voice and reach). The writer and the checker disagree; the writer is right. Two warnings, not
  errors, on every actual this piece files. One line in the validator when someone is next in there.

- **2026-09-19 — the generated scores share one object-id space** (`wc-1, wc-2 …` from `build_lgmf_ref.js` and `build_lgmf_transitions.js`). RUNNING_LOG §75: a per-id cache in the app (`curveChannelMap`) crossed scores because of it — fixed at the cache, but the collision stays, and any future per-id state is the same trap. Defence when convenient: a per-score prefix (`wc-bal-1`), or ids derived from the actual's entity. Not blocking.

- **2026-09-19 — the triangles and castanets read ~3 dB under their prescribed trim** (RUNNING_LOG §78, the 1b.2 spot check): `new = 0d + 12 + trim` holds within 0.9 dB for the finger cymbals and tam tams but not for these two, which are the ones carrying the largest **JS Volume** boosts (+10.2 and +20.0 on top of a +12 fader). Either the JS gain is not delivering its full amount, or a single hit caught a different round robin. 1b.3 measures all fourteen rather than leaning on the carry-over, so this is recorded, not blocking.
