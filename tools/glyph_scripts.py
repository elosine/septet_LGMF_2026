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
TODAY = '2026-09-13'
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
}


def num(v):
    s = '%.3f' % v
    s = s.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def grab(font, name):
    gs = font.getGlyphSet()
    U = font['head'].unitsPerEm / 4.0
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
        '_provenance': {'source': 'LilyPond ' + os.path.basename(LP) + ' ' + os.path.basename(font.reader.file.name) + ' ' + name,
                        'ported': TODAY, 'by': BY},
    }


e20 = TTFont(os.path.join(FONTS, 'emmentaler-20.otf'))
g = json.load(open(GLYPHS, encoding='utf-8'))
if 'accent' not in g.get('articulation', {}):
    sys.exit('glyphs.json has no articulation.accent — wrong file?')
out = []
def put(group, key, name):
    new = grab(e20, name)
    old = g[group].get(key)
    # an entry whose outline and box are unchanged keeps its own provenance (its original date) — re-running the
    # tool must not rewrite glyphs it already holds (2f.2)
    if old and old.get('path') == new['path'] and old.get('wSs') == new['wSs'] and old.get('hSs') == new['hSs']:
        out.append('%s.%s unchanged' % (group, key))
        return
    g[group][key] = new
    out.append('%s.%s (%s) %.3f x %.3f ss' % (group, key, name, new['wSs'], new['hSs']))


for key, name in SCRIPTS.items():
    put('articulation', key, name)
for key, name in ACCIDENTALS.items():
    put('accidental', key, name)

with open(GLYPHS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(g, f, indent=1, ensure_ascii=False)
subprocess.run(['node', '-e', "const fs=require('fs'),p=process.argv[1];fs.writeFileSync(p,JSON.stringify(JSON.parse(fs.readFileSync(p,'utf8')),null,1))", GLYPHS], check=True)
print(' · '.join(out))
