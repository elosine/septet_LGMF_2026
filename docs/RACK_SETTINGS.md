# RACK_SETTINGS — the settings that live only in his plugins

> **What this file is for.** Almost everything about this rack is regenerable from text: the tracks, the
> faders, the trims, the recipes, the remap. **These are not.** They are settings inside a sampler's own
> panel, set by hand, saved only in the Reaper project (and, where noted, in a `.nki`). Nothing in the repo
> can rebuild them and nothing checks them, so if a plugin is reloaded, a preset re-selected from disk, or
> the project restored from an older save, they are the first things to go — silently, because everything
> still sounds, just wrong.
>
> **Keep this current.** Every hand-set plugin value goes here the day it is set, with what it was, why it
> changed, how to revert it, and how to tell. Written at his request, 2026-09-19: *"make a clear note so we
> can revert when necessary."*
>
> The reasoning behind each change is in `RUNNING_LOG.md` at the section named; this file is the *state*.

---

## 1 · UVI SI2 — "Dynamic Amount" 0.70 → 1.00 on the bassoon, horn and trumpet

**What it does.** The SI2 instruments' Expression block has a **Dynamic → Amount** dial that sets how much
of the dynamic range velocity spans. At the factory **0.70** the brass gave about 5 dB from the quietest
velocity to the loudest; at **1.00** they give 23–26 dB and the bassoon 31.9.

**Set on** — these are the parts the piece actually plays, and only these:

| instance | part | channel | program |
|---|---|---|---|
| Bassoon SI2 | Part 1 | 1 | Bassoon Ordinario |
| Bassoon SI2 b | Parts 3 · 4 · 5 | 3 · 4 · 5 | Bassoon Ordinario ×3 (the curve copies) |
| Horn SI2 | Part 1 | 1 | French Horn Ordinario |
| Horn SI2 b | Parts 3 · 4 · 5 | 3 · 4 · 5 | French Horn Ordinario ×3 |
| Trumpet SI2 | Part 1 | 1 | Trumpet Ordinario |
| Trumpet SI2 b | Parts 5 · 6 · 7 | 5 · 6 · 7 | Trumpet Ordinario ×3 |

**Every other part on all six instances is still the factory 0.70**, with three strays nobody set
deliberately and the piece does not play: `Bassoon SI2` part 2 (Blow Without Reed) **0.54**, part 4
(Cresc & Decresc KS) **0.50**, and `Trumpet SI2 b` part 1 (Slap Pitched) **0.95**.

**Why both instances matter — the trap this fell into once already.** A *drawn* note is a curve event and
routes to the instrument's curve bank, which for the SI2 three is the **`b` instance**; only a plain or
keyswitched note uses main channel 1. RUNNING_LOG **§56** set part 1 of the main instance and stopped
there, so for a day the horn's and trumpet's 26 dB range sat on a part no score ever sounded while every
written note went through copies still at 0.70. **§85** found it. *Any technique brought into the piece
later needs its Dynamic checked on both the main part and its curve copies.*

**To revert:** set the six listed parts back to **0.70** in the UVI window. Nothing in the repo depends on
the value; the measurements do (`bank/instrument_card.json` would have to be remade).

**To check without guessing:** `node tools/uvi_state.js decode "Horn SI2 b" out.xml` and read the
`Dynamic="…"` attribute on each `<Part>`. It appears once per part.

---

## 2 · Xsample Vibraphone — preset **13 "Bowed Velocity RRoff"**

**What it is.** A copy of the library's preset 12 "Bowed Velocity" with **Round Robin → off** and
**Slot rr → off**, saved as preset **13** and named *Bowed Velocity RRoff*, **in all four Kontakt slots**
(`LGVibes` channels 1 · 2 · 3 · 4 — the app plays 2–4 and only plain notes use 1).

**Why.** The library ships preset 12 with Round Robin on **"Repetition"** — active whenever a sound is
*repeated*, which is this piece's vibraphone texture exactly, since a bar is held by re-bowing the same
pitch about eleven times a minute. Its three round-robin members measured **up to 13.8 dB apart**. With the
cycle off, four strikes of one note measured **0.0 dB apart** (§79, §81, §82).

**It had to be a preset, not a dropdown.** The Round Robin menu is a per-preset "global parameter", and the
app sends **CC#0 to select the preset on every note** — so a change made in the dropdown is undone by the
very next note. Storing it *in* preset 13 is what makes it survive.

**The repo depends on this one.** `sandbox/instruments.js` gives the vibraphone's `bowed_vel` technique
`cc0: 12` (= preset 13). Preset 12 is still listed as `bowed_vel_rr`, marked superseded.

**To revert:** point `bowed_vel` back at `cc0: 11` in the recipe — preset 12 is untouched, which is exactly
why a new preset was made rather than editing in place.

---

## 3 · Xsample English Horn, Cello, Double Bass — Round Robin **off**, edited in place

**Set 2026-09-19** (his: *"done, all three are off"*), in **all four Kontakt slots of each**:

| instrument | preset edited | slots |
|---|---|---|
| English Horn XS | **12** "Senza Vibrato Velocity" | `LGEngHorn` ch 1 · 2 · 3 · 4 |
| Cello XS | **6** "Senza Vibrato Velocity" | `LGCello` ch 1 · 2 · 3 · 4 |
| Bass XS | **6** "Senza Vibrato Velocity" | `LGBass` ch 1 · 2 · 3 · 4 |

**Why.** The cello showed the vibraphone's exact signature — four strikes of one note reading
−27.9 · −31.3 · −22.7 · −27.9, the first and fourth identical, a deterministic three-sample cycle
**8.6 dB** wide. That is what made its velocity 100 measure *louder* than its 127 and put it 7.1 dB out in
the 1b.5 verification. The english horn (3.6 dB) and double bass (2.9 dB) scatter without a clear cycle in
four strikes — a longer or randomised one — and switching it off makes them deterministic either way (§89).

**Edited IN PLACE, unlike the vibraphone, and deliberately.** By this point round robin off was no longer an
experiment, and editing preset 12/6 in place means **no recipe change**, so every score already written
keeps working untouched. The library default is recoverable by reloading the `.nki`.

**To revert:** set Round Robin back to **"Repetition"** (the factory value) in each preset and Save Preset,
or reload the instrument's `.nki` — which also discards the curve-slot channel assignments, so
`reaper/kontakt/curve_slots.lua` would have to be re-run after.

---

## 4 · Reaper-side, for completeness — these ARE regenerable

Listed so this file answers "what is not stock" in one place, but none of them is hand-set:

| what | where it comes from | revert by |
|---|---|---|
| Track faders and the JS Volume FX | `bank/trims.json` → `reaper/bridge/jobs/apply_trims.lua` | regenerate and re-run the job |
| `Horn SI2 high` · `Horn SI2 b high` — note filters, MIDI Transpose −12, ReaPitch +12 | `reaper/bridge/jobs/horn_high_path.lua` | delete the two tracks and the mirror filters |
| `Bass XS` MIDI Transpose +12 | `reaper/bridge/jobs/bass_octave_fx.lua` | remove the FX; the recipe's range returns to sounding 28–69 |
| `REC` receive bus at unity | `reaper/bridge/jobs/make_rec_track.lua` | re-run with `REC_TRIM_DB` changed |
| `REF` track, the calibration files at 600 s / 635 s | `reaper/bridge/jobs/ref_track.lua` + `tools/make_reference_audio.js` | delete the track; the files regenerate byte-identical from their seed |
| The four percussion Kontakt curve slots | `reaper/kontakt/curve_slots.lua` | re-run the script |

**One standing warning that belongs here.** ARO's own global gain is **bound to CC7** and caps at unity, so
it can never be used for compensation and any CC7 sent to a percussion channel rewrites it (§42, §58). That
is why the percussion trims live in the Reaper fader and a JS Volume FX instead.
