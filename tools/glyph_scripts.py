r"""glyph_scripts.py — articulation SCRIPTS from LilyPond's Emmentaler font into
notation/lib/glyphs.json articulation (RUNNING_LOG §400, 2026-09-11).

The septet's strikes need two marks the tuba piece never drew: the snap
(Bartók) pizzicato symbol — the circle with a line, LilyPond `\snappizzicato`,
which piece #2 and the quartet used at font-size -3 — and the `+` the composer
chose for the bass clarinet's slap tongue (LilyPond's scripts.stopped, the
brass hand-stop sign; here it means slap, by the piece's legend).

Same source, same scale and frame as tools/glyph_emmentaler.py (the clefs):
1 staff space = unitsPerEm / 4; top-left origin, y down; `origin` anchor =
the font's glyph origin, `center` = the bbox centre (what layout aligns on).
The accent's own entry is the shape check: it must already be there.

Usage:  python tools/glyph_scripts.py [--lilypond <share/lilypond/X.Y.Z dir>]
"""
import json, os, subprocess, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GLYPHS = os.path.join(ROOT, 'notation', 'lib', 'glyphs.json')
LP = r'C:/Users/jwloy/OneDrive/Documents/lilypond-2.24.4/share/lilypond/2.24.4'
if '--lilypond' in sys.argv:
    LP = sys.argv[sys.argv.index('--lilypond') + 1]
FONTS = os.path.join(LP, 'fonts', 'otf')
TODAY = __import__('datetime').date.today().isoformat()   # a NEW entry's port date (an unchanged one keeps its own)
BY = 'tools/glyph_scripts.py'

SCRIPTS = {           # glyphs.json articulation key -> Emmentaler glyph name
    'snappizz': 'scripts.snappizzicato',
    'plus': 'scripts.stopped',
    # PLAN 2f.2 (2026-09-13, RUNNING_LOG §436): the trill sign, stored at STOCK size; the device scales it
    # (registry devices.byEnv.trill.trillSignScale 0.70 — GLYPH_SIZING §2 Ornaments, the pedal's factor)
    'trill': 'scripts.trill',
}
# PLAN 2f.2: the parentheses round the trill's neighbour head — glyphs.json ACCIDENTAL group, stock size; the device
# scales them (trillPitch.parenScale 0.63 = LilyPond's TrillPitchParentheses font-size -4, probe trill.ly, §435)
ACCIDENTALS = {
    'leftParen': 'accidentals.leftparen',
    'rightParen': 'accidentals.rightparen',
    # LGMF PLAN 2d.1 (2026-09-25, RUNNING_LOG §382; docs/research/just_partials_notation.md §1a): the ARROWED accidentals of the
    # just marks' middle band (|c| 20 … 37) — an arrow on the note's own accidental, alone on a natural. Stock size, as the parens.
    'sharpArrowUp': 'accidentals.sharp.arrowup',
    'sharpArrowDown': 'accidentals.sharp.arrowdown',
    'flatArrowUp': 'accidentals.flat.arrowup',
    'flatArrowDown': 'accidentals.flat.arrowdown',
    'naturalArrowUp': 'accidentals.natural.arrowup',
    'naturalArrowDown': 'accidentals.natural.arrowdown',
}


def num(v):
    s = '%.3f' % v
    s = s.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def grab(font, name, k=1.0):
    # k: the size the entry is stored at, in staff spaces per Emmentaler staff space (1 = stock). LGMF 2d.1: the house accidentals
    # (piece #2's accidental_paths.json) are Emmentaler at HALF — sharp 1.5 / 3.0 ss tall, flat 1.254 / 2.512, natural 1.532 /
    # 3.056, quarterSharp 1.33 / 2.66 — so an accidental the layout's chooser draws beside them at scale 1 is baked at 0.5
    gs = font.getGlyphSet()
    U = font['head'].unitsPerEm / 4.0 / k
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    x0, y0, x1, y1 = bp.bounds
    sp = SVGPathPen(gs, ntos=num)
    gs[name].draw(TransformPen(sp, (1.0 / U, 0, 0, -1.0 / U, -x0 / U, y1 / U)))
    w, h = (x1 - x0) / U, (y1 - y0) / U
    return {
        'path': sp.getCommands(),
        'wSs': round(w, 3),
        'hSs': round(h, 3),
        'anchors': {'origin': {'x': round(-x0 / U, 3), 'y': round(y1 / U, 3)},
                    'center': {'x': round(w / 2, 3), 'y': round(h / 2, 3)}},
        '_provenance': dict({'source': 'LilyPond ' + os.path.basename(LP) + ' ' + os.path.basename(font.reader.file.name) + ' ' + name,
                        'ported': TODAY, 'by': BY}, **({'scale': k} if k != 1.0 else {})),
    }


e20 = TTFont(os.path.join(FONTS, 'emmentaler-20.otf'))
g = json.load(open(GLYPHS, encoding='utf-8'))
if 'accent' not in g.get('articulation', {}):
    sys.exit('glyphs.json has no articulation.accent — wrong file?')
out = []
changed = []      # entries that REPLACE one the file holds (a full rewrite)
added = []        # (group, key) of entries NEW to the file (inserted as text — LGMF 2d.1)
def put(group, key, name, k=1.0):
    new = grab(e20, name, k)
    # [LGMF 2d.1] an ARROWED accidental is not symmetric about its note (the arrow's stem runs past it), so it carries the house
    # flats' anchor: noteY = the font origin's height (the note's line), centred across the glyph — the chooser aligns on it
    if 'Arrow' in key:
        new['anchors']['noteY'] = {'x': new['anchors']['center']['x'], 'y': new['anchors']['origin']['y']}
    old = g[group].get(key)
    # an entry whose outline and box are unchanged keeps its own provenance (its original date) — re-running the
    # tool must not rewrite glyphs it already holds (2f.2)
    if old and old.get('path') == new['path'] and old.get('wSs') == new['wSs'] and old.get('hSs') == new['hSs']:
        out.append('%s.%s unchanged' % (group, key))
        return
    (changed if old else added).append((group, key))
    g[group][key] = new
    out.append('%s.%s (%s) %.3f x %.3f ss' % (group, key, name, new['wSs'], new['hSs']))


for key, name in SCRIPTS.items():
    put('articulation', key, name)
for key, name in ACCIDENTALS.items():
    put('accidental', key, name, 0.5 if 'Arrow' in key else 1.0)   # the arrowed ones at the house set's size (grab's note)

if changed:
    with open(GLYPHS, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(g, f, indent=1, ensure_ascii=False)
    subprocess.run(['node', '-e', "const fs=require('fs'),p=process.argv[1];fs.writeFileSync(p,JSON.stringify(JSON.parse(fs.readFileSync(p,'utf8')),null,1))", GLYPHS], check=True)
elif added:
    # [LGMF PLAN 2d.1] ONLY NEW ENTRIES: insert each as text at the end of its group, so the rest of the file stays byte for byte
    # (it holds hand-compacted lines — text.pizz.'s anchors — that a full re-serialisation would expand)
    txt = open(GLYPHS, encoding='utf-8').read()
    for group, key in added:
        head = '\n "%s": {' % group
        a = txt.index(head)
        close = txt.index('\n }', a + len(head))          # the group's own closing brace (depth 1)
        block = json.dumps({key: g[group][key]}, indent=1, ensure_ascii=False)[2:-2]   # '"key": {...}' at depth 1
        block = '\n'.join(' ' + line for line in block.split('\n'))                 # to depth 2
        txt = txt[:close] + ',\n' + block + txt[close:]
    if json.loads(txt) != g:
        sys.exit('glyph_scripts: the inserted text does not parse to the new table — nothing written')
    with open(GLYPHS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(txt)
print(' · '.join(out))
