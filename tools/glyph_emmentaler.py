"""glyph_emmentaler.py — clefs, braces and bracket tips from LilyPond's own
Emmentaler font into notation/lib/glyphs.json (PLAN 2a.2, 2026-09-11).

The engine's glyphs are LilyPond's (piece #2 baked its bass and treble clefs
from LilyPond SVG output). The septet needs the treble and ALTO clefs, the
piano's brace and the bracket tips; #2 has no alto, so every one of them is
taken from the same source here, at the same scale:

    1 staff space = unitsPerEm / 4 = 250 font units

Verified against what the engine already holds before anything is written:
clefs.F must reproduce glyphs.json clef.bass (wSs 2.688, hSs 3.104, fLine
0.052/1.052) and clefs.G must reproduce #2's clef_paths.json treble (2.572 x
7.319, gLine -0.008/4.779). If either drifts the script stops.

Frame: top-left origin, y down, staff-space units (the glyphs.json
convention). The anchor is the glyph ORIGIN: the line a clef sits on
(fLine / gLine / cLine), the end of a bracket's line for a tip.

Brace: LilyPond picks the brace glyph nearest the span (the stroke weight
grows with size), so a ladder of sizes is kept, not one glyph scaled.

Usage:  python tools/glyph_emmentaler.py [--lilypond <share/lilypond/X.Y.Z dir>]
Then:   node -e "..."  re-serialises with JSON.stringify(g, null, 1), the
        file's own format — run by the script itself via node.
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
TODAY = '2026-09-11'
BY = 'tools/glyph_emmentaler.py'


def num(v):
    s = '%.3f' % v
    s = s.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def grab(font, name, anchor):
    gs = font.getGlyphSet()
    U = font['head'].unitsPerEm / 4.0
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    x0, y0, x1, y1 = bp.bounds
    sp = SVGPathPen(gs, ntos=num)
    gs[name].draw(TransformPen(sp, (1.0 / U, 0, 0, -1.0 / U, -x0 / U, y1 / U)))
    return {
        'path': sp.getCommands(),
        'wSs': round((x1 - x0) / U, 3),
        'hSs': round((y1 - y0) / U, 3),
        'anchors': {anchor: {'x': round(-x0 / U, 3), 'y': round(y1 / U, 3)}},
        '_provenance': {'source': 'LilyPond ' + os.path.basename(LP) + ' ' + os.path.basename(font.reader.file.name) + ' ' + name,
                        'ported': TODAY, 'by': BY},
    }


def check(g, w, h, anchor, ax, ay, what):
    a = g['anchors'][anchor]
    if abs(g['wSs'] - w) > 1e-3 or abs(g['hSs'] - h) > 1e-3 or abs(a['x'] - ax) > 1e-3 or abs(a['y'] - ay) > 1e-3:
        sys.exit('scale check FAILED for %s: got %s %s %s' % (what, g['wSs'], g['hSs'], a))


e20 = TTFont(os.path.join(FONTS, 'emmentaler-20.otf'))
bass = grab(e20, 'clefs.F', 'fLine')
check(bass, 2.688, 3.104, 'fLine', 0.052, 1.052, 'clefs.F vs glyphs.json clef.bass')
treble = grab(e20, 'clefs.G', 'gLine')
check(treble, 2.572, 7.319, 'gLine', -0.008, 4.779, "clefs.G vs piece #2's clef_paths.json treble")
alto = grab(e20, 'clefs.C', 'cLine')

g = json.load(open(GLYPHS, encoding='utf-8'))
g['clef']['treble'] = treble
g['clef']['alto'] = alto
g['bracketTip'] = {'up': grab(e20, 'brackettips.up', 'origin'), 'down': grab(e20, 'brackettips.down', 'origin')}

br = TTFont(os.path.join(FONTS, 'emmentaler-brace.otf'))
gs = br.getGlyphSet()
U = br['head'].unitsPerEm / 4.0
heights = []
for i in range(len([n for n in br.getGlyphOrder() if n.startswith('brace')])):
    bp = BoundsPen(gs)
    gs['brace%d' % i].draw(bp)
    heights.append((bp.bounds[3] - bp.bounds[1]) / U)
targets = [8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 34, 38, 43, 48, 54, 60]
picked = sorted(set(min(range(len(heights)), key=lambda i: abs(heights[i] - t)) for t in targets))
brace = {'_doc': 'the piano brace, LilyPond\'s own ladder of sizes (emmentaler-brace); render picks the glyph nearest the span and scales it the last few percent'}
for i in picked:
    brace['h%.2f' % heights[i]] = grab(br, 'brace%d' % i, 'origin')
g['brace'] = brace

with open(GLYPHS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(g, f, indent=1, ensure_ascii=False)
# the file's own format is JSON.stringify(g, null, 1) — re-serialise with node
subprocess.run(['node', '-e', "const fs=require('fs'),p=process.argv[1];fs.writeFileSync(p,JSON.stringify(JSON.parse(fs.readFileSync(p,'utf8')),null,1))", GLYPHS], check=True)
print('clef.treble %.3f x %.3f · clef.alto %.3f x %.3f · %d braces %s..%s · bracket tips' %
      (treble['wSs'], treble['hSs'], alto['wSs'], alto['hSs'], len(picked), '%.1f' % heights[picked[0]], '%.1f' % heights[picked[-1]]))
