# notation/ir — this piece's IR pages

Every `<id>.ir.json` here is a notation page DERIVED from a composer save by
`tools/notate_section.js` (or `notate_block.js` / `notate_morph.js`), validated by
`tools/ir_validate.js`, and listed in `index.json` — the manifest the notation app's
picker reads (`notation/app/notation.html`). The save in `scores/` is the ground truth;
a page is regenerable from its own `provenance.build` (the IR contract, piece #5's D9).

**Usage:** `node tools/ir_validate.js notation/ir/<id>.ir.json --against-source --complete`
— the validator takes a PATH, not an id.

## The test batteries' golden inputs are OTHER PIECES', staged, not stored

Two sets, neither committed here — they are other pieces' notation and composition:

**Piece #4's tuba pages**, read by name by `test_render`, `test_layout`, `test_animobj`,
`test_splice`, `test_extract_played`, `test_midiplayer`, `test_pattern_fit`,
`test_notate_block`, `ir_extract_golden` and `ir_validate_battery`
(`trance-bar-01`, `morph-window-01`, `db1`, `db1-all-x01`, `trance-section-01`,
`section1-e20`, `section1-e30`, `density-apex-01`) plus the tuba scores those pages name.

```bash
T=/c/Users/jwloy/GitHub/for_seven_tubas
for f in $(cd $T && git ls-files notation/ir); do mkdir -p $(dirname $f); git -C $T show HEAD:$f > $f; done
for n in tranceA002f piece-final-draft-001 piece-s25-finished01 piece-s23 piece-s27 piece-s28 cloud02-10track cloud02i-b cloud02i-b2; do git -C $T show HEAD:scores/$n.json > scores/$n.json; done
```

**Piece #5's septet pages and scores**, read by `test_septet_notation`, `test_trills`,
`test_morph_notation`, `test_cross_staff`, `test_surge_run`, `test_step_dynamics`
(`piece-septet`, `strike1`, `trill1`, `0i-test-b`) — stage the same way from
`/c/Users/jwloy/GitHub/septet_2026`, taking every file from `HEAD` so the composer's
uncommitted saves there are never read.

**Delete what you staged afterwards, from a list written before you copy anything.**

## Where the batteries stood at the port (2026-09-17)

The port ran them twice — once on the copy before anything changed (RUNNING_LOG §13) and
once after the re-palette (§16) — so that every red has one known cause. Eight engine
batteries are GREEN both times. The reds are all other pieces' fixtures or other pieces'
palettes, listed with their causes in those two entries and in `docs/NITS.md`.
**The snapshot fixtures in `tools/fixtures/*_snapshot.json` are hashes of the TUBA pages'
output**; they are regenerated (`--update`) when this piece has real pages of its own (2a).
