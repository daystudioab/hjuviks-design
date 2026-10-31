# Genererar en animerad SVG-karta över Hjuviks Marina (schematisk).
import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

NAVY = '#0B2065'; HEAD = '#002A71'; CREAM = '#F9E6B3'; CREAM_D = '#E9C97A'
W, H = 400, 560

def fontpath(fil):
    f = TTFont(fil); return f
FONTS = {'reg': TTFont('/usr/share/fonts/opentype/inter/Inter-Regular.otf'),
         'med': TTFont('/usr/share/fonts/opentype/inter/Inter-Medium.otf'),
         'semi': TTFont('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'),
         'it': TTFont('/usr/share/fonts/opentype/inter/Inter-Italic.otf')}

def text(s, x, y, size, vikt='med', spacing=0.0, anchor='start'):
    f = FONTS[vikt]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    sc = size / upm; hmtx = f['hmtx']
    # bredd
    namn = [cmap.get(ord(c), '.notdef') for c in s]
    bredd = sum(hmtx[n][0] * sc for n in namn) + spacing * size * (len(s) - 1)
    if anchor == 'middle': x -= bredd / 2
    elif anchor == 'end': x -= bredd
    d = []
    cx = x
    for n in namn:
        pen = SVGPathPen(gs)
        tp = TransformPen(pen, (sc, 0, 0, -sc, cx, y))
        gs[n].draw(tp)
        d.append(pen.getCommands())
        cx += hmtx[n][0] * sc + spacing * size
    return ' '.join(p for p in d if p), bredd

def smooth(pts, closed=True, t=0.5):
    # Catmull-Rom → kubisk bezier
    n = len(pts)
    out = f'M{pts[0][0]:.1f},{pts[0][1]:.1f}'
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
        p1 = pts[i]; p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3)
        out += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return out + (' Z' if closed else '')

import random
def brus(pts, seed, amp=6.0, djup=4, closed=True):
    """Naturlig kustlinje: rekursiv mittpunktsförskjutning längs normalen."""
    r = random.Random(seed)
    lista = pts + ([pts[0]] if closed else [])
    for nivå in range(djup):
        ny = []
        a = amp / (1.7 ** nivå)
        for i in range(len(lista) - 1):
            (x1, y1), (x2, y2) = lista[i], lista[i + 1]
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2
            dx, dy = x2 - x1, y2 - y1
            L = math.hypot(dx, dy) or 1
            nx, ny_ = -dy / L, dx / L
            k = r.uniform(-1, 1) * a * min(1.0, L / 30)
            ny.append((x1, y1)); ny.append((mx + nx * k, my + ny_ * k))
        ny.append(lista[-1])
        lista = ny
    return lista[:-1] if closed else lista

def form(pts, seed, amp=6.0, djup=4, closed=True):
    return smooth(brus(pts, seed, amp, djup, closed), closed=closed, t=0.35)

# Hisingen (norr) med Hjuviks udde och en liten vik där marinan ligger
hisingen = [(-20,-20),(420,-20),(420,218),(392,226),(366,222),(338,236),(306,232),(284,246),(258,244),(240,258),
            (228,276),(214,282),(206,296),(200,312),(188,326),(170,336),(150,334),(136,320),(128,300),(114,288),
            (96,282),(80,266),(58,262),(36,250),(14,256),(-20,250)]
# Fastlandet i söder (Långedrag/Nya Varvet) som stiger mot älvmynningen i öster
fastland = [(-20,600),(-20,486),(24,480),(58,470),(92,474),(120,458),(150,456),(178,440),(208,436),(236,418),
            (262,412),(290,392),(318,384),(344,366),(372,352),(420,344),(420,600)]
oar = [
    ([(46,356),(78,342),(110,350),(124,370),(110,394),(80,400),(52,388)], 11, 5),      # Rivö
    ([(160,384),(184,376),(202,388),(198,406),(174,412),(156,402)], 12, 4),            # Förö
    ([(14,316),(30,308),(44,318),(38,332),(20,330)], 13, 3),
    ([(236,350),(250,344),(262,352),(256,364),(242,362)], 14, 3),
    ([(126,428),(138,424),(148,432),(140,442),(128,440)], 15, 2.5),
    ([(282,370),(292,366),(300,374),(292,382),(283,379)], 16, 2.5),
    ([(96,318),(104,314),(110,320),(104,326),(97,324)], 17, 2),
    ([(214,368),(220,365),(225,370),(220,375),(214,373)], 18, 1.5),
]
# Djupkurvor (sjökortskänsla) i fjorden
kurvor = [
    [(-10,300),(40,296),(90,310),(130,340),(190,352),(240,330),(290,300),(340,276),(410,262)],
    [(-10,446),(40,438),(90,428),(150,430),(210,408),(260,384),(310,358),(360,330),(410,316)],
]
marina = (205, 300)   # Hjuviks Marina, i viken på uddens östra sida
bro = ((364, 220), (364, 352))  # Älvsborgsbron över älvmynningen
# Väg från brons norra fäste längs Hisingen till Hjuvik
vag = [(364,214),(342,196),(312,190),(282,198),(256,206),(236,222),(222,246),(214,268),(208,288)]
# Brygga i viken
bryggor = [((212,292),(226,288)),((210,300),(226,298)),((208,308),(222,309))]
# Liten båt som glider i fjorden
bat_bana = smooth([(-30,420),(50,410),(140,392),(220,384),(300,350),(360,318),(440,300)], closed=False)

def p(d, **kw):
    a = ' '.join(f'{k.replace("_","-")}="{v}"' for k, v in kw.items())
    return f'<path d="{d}" {a}/>'

delar = []
# Land
delar.append(f'<g class="land">')
delar.append(p(form(hisingen, 1, 7, 5), fill=CREAM, fill_opacity='0.22', stroke=NAVY, stroke_width='1.3', stroke_linejoin='round'))
delar.append(p(form(fastland, 2, 7, 5), fill=CREAM, fill_opacity='0.22', stroke=NAVY, stroke_width='1.3', stroke_linejoin='round'))
for o, seed, amp in oar:
    delar.append(p(form(o, seed, amp, 4), fill=CREAM, fill_opacity='0.22', stroke=NAVY, stroke_width='1.1', stroke_linejoin='round'))
delar.append('</g>')
# Djupkurvor
delar.append('<g class="kurvor" fill="none" stroke="%s" stroke-width="1" stroke-linecap="round" opacity="0.35">' % NAVY)
for i, k in enumerate(kurvor):
    delar.append(f'<path class="kurva k{i}" d="{form(k, 30+i, 5, 3, closed=False)}" pathLength="1"/>')
delar.append('</g>')
# Bron
(bx1, by1), (bx2, by2) = bro
delar.append(f'<g class="bro"><line x1="{bx1}" y1="{by1}" x2="{bx2}" y2="{by2}" stroke="{NAVY}" stroke-width="3.2" stroke-linecap="round"/>'
             f'<rect x="{bx1-4}" y="{by1+42}" width="8" height="5" rx="1.5" fill="{NAVY}"/><rect x="{bx1-4}" y="{by2-47}" width="8" height="5" rx="1.5" fill="{NAVY}"/></g>')
for (a, b) in bryggor:
    delar.append(f'<line class="brygga" x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="{NAVY}" stroke-width="1.6" stroke-linecap="round"/>')
# Väg
delar.append(f'<path class="vag" d="{smooth(vag, closed=False)}" fill="none" stroke="{NAVY}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 6"/>')
delar.append(f'<path class="vag-rita" d="{smooth(vag, closed=False)}" fill="none" stroke="{CREAM_D}" stroke-width="3" stroke-linecap="round" pathLength="1"/>')
# Båt
delar.append(f'<g class="bat"><g><path d="M-9,0 L9,0 L6,4 L-6,4 Z" fill="{NAVY}"/><path d="M0,-1 L0,-15 L8,-1 Z" fill="{CREAM}" stroke="{NAVY}" stroke-width="0.8" stroke-linejoin="round"/></g></g>')
# Marinan: ringar + nål
mx, my = marina
delar.append(f'<g class="ringar" transform="translate({mx} {my})" fill="none" stroke="{NAVY}" stroke-width="1.4">'
             '<circle class="ring r1" r="10"/><circle class="ring r2" r="10"/><circle class="ring r3" r="10"/></g>')
nal = ('M0,0 C-4,-8 -13,-15 -13,-25 A13,13 0 1 1 13,-25 C13,-15 4,-8 0,0 Z')
delar.append(f'<g transform="translate({mx} {my})"><g class="nal">'
             f'<ellipse class="skugga" cx="0" cy="1" rx="6" ry="2" fill="{NAVY}" opacity="0.25"/>'
             f'<path d="{nal}" fill="{NAVY}"/><circle cx="0" cy="-25" r="5.5" fill="{CREAM}"/></g></g>')

# Etiketter (text som konturer så att typsnittet alltid stämmer)
def etikett(s, x, y, size, vikt, fyll, spacing=0.0, anchor='start', klass='etikett', opacity='1'):
    d, b = text(s, x, y, size, vikt, spacing, anchor)
    return f'<path class="{klass}" d="{d}" fill="{fyll}" opacity="{opacity}"/>', b

e1, _ = etikett('HISINGEN', 250, 120, 13, 'semi', NAVY, 0.28, 'middle', opacity='0.55')
e2, _ = etikett('Rivöfjorden', 150, 470 - 100, 11, 'it', NAVY, 0.02, 'start', opacity='0.7')
e3, _ = etikett('Älvsborgsbron', 354, 300, 10, 'med', NAVY, 0.0, 'end', opacity='0.8')
e4, _ = etikett('Torslanda', 90, 170, 10.5, 'med', NAVY, 0.04, 'middle', opacity='0.45')
e5, _ = etikett('Långedrag', 230, 500, 10.5, 'med', NAVY, 0.04, 'middle', opacity='0.45')
delar.append(f'<g class="etiketter">{e1}{e2}{e3}{e4}{e5}</g>')

# Marinans skylt
txt, tb = text('Hjuviks Marina', 0, 0, 13, 'semi', 0.0)
pad = 11; bw = tb + pad * 2; bh = 28
sx, sy = mx - bw / 2, my - 78
skylt_txt, _ = text('Hjuviks Marina', sx + pad, sy + 18.5, 13, 'semi')
delar.append(f'<g class="skylt"><rect x="{sx:.1f}" y="{sy:.1f}" width="{bw:.1f}" height="{bh}" rx="14" fill="{CREAM}"/>'
             f'<path d="M{mx-6:.1f},{sy+bh:.1f} L{mx:.1f},{sy+bh+6:.1f} L{mx+6:.1f},{sy+bh:.1f} Z" fill="{CREAM}"/>'
             f'<path d="{skylt_txt}" fill="{NAVY}"/></g>')
# Norrpil
nx, ny = 360, 52
n_d, _ = text('N', nx, ny - 16, 10, 'semi', 0, 'middle')
delar.append(f'<g class="norr" opacity="0.75"><path d="M{nx},{ny-12} L{nx+6},{ny+6} L{nx},{ny+2} L{nx-6},{ny+6} Z" fill="{NAVY}"/><path d="{n_d}" fill="{NAVY}"/></g>')
# "15 min" vid vägen
min_d, mb = text('15 min', 0, 0, 10, 'semi')
vx, vy = 300, 176
min_txt, _ = text('15 min', vx - mb / 2, vy + 3.6, 10, 'semi')
delar.append(f'<g class="minuter"><rect x="{vx-mb/2-8:.1f}" y="{vy-9}" width="{mb+16:.1f}" height="18" rx="9" fill="{NAVY}"/><path d="{min_txt}" fill="{CREAM}"/></g>')

css = f"""
.land{{opacity:0;transform-origin:50% 50%;animation:in .9s cubic-bezier(.16,1,.3,1) .05s forwards}}
.etiketter,.norr{{opacity:0;animation:in .8s ease .7s forwards}}
.kurva{{stroke-dashoffset:1;animation:rita 1.6s cubic-bezier(.65,0,.35,1) forwards}}
.kurvor{{stroke-dasharray:none}}
.kurva{{stroke-dasharray:1 1}}
.k0{{animation-delay:.4s}}.k1{{animation-delay:.6s}}.k2{{animation-delay:.8s}}
.bro{{opacity:0;animation:in .6s ease .9s forwards}}
.vag{{opacity:0;animation:in .2s linear 2.6s forwards}}
.vag-rita{{stroke-dasharray:1 1;stroke-dashoffset:1;animation:rita 1.5s cubic-bezier(.65,0,.35,1) 1.2s forwards,ut .5s ease 2.7s forwards}}
.minuter{{opacity:0;transform-box:fill-box;transform-origin:center;animation:pop .5s cubic-bezier(.34,1.56,.64,1) 2.3s forwards}}
.nal{{opacity:0;transform:translateY(-40px);animation:fall .7s cubic-bezier(.34,1.56,.64,1) 2.5s forwards}}
.skylt{{opacity:0;transform-box:fill-box;transform-origin:50% 100%;animation:pop .55s cubic-bezier(.34,1.56,.64,1) 3s forwards}}
.ring{{opacity:0;transform-box:fill-box;transform-origin:center;animation:ring 3.6s cubic-bezier(.2,.6,.4,1) infinite}}
.r1{{animation-delay:3.1s}}.r2{{animation-delay:4.3s}}.r3{{animation-delay:5.5s}}
.bat{{offset-path:path('{bat_bana}');offset-rotate:0deg;animation:segla 38s linear 1.5s infinite;opacity:0}}
.bat>g{{animation:gung 3.2s ease-in-out infinite}}
@keyframes in{{from{{opacity:0;transform:scale(.985)}}to{{opacity:1;transform:none}}}}
@keyframes ut{{to{{opacity:0}}}}
@keyframes rita{{to{{stroke-dashoffset:0}}}}
@keyframes pop{{from{{opacity:0;transform:scale(.6)}}to{{opacity:1;transform:none}}}}
@keyframes fall{{from{{opacity:0;transform:translateY(-40px)}}60%{{opacity:1}}to{{opacity:1;transform:none}}}}
@keyframes ring{{0%{{opacity:.55;transform:scale(.6)}}100%{{opacity:0;transform:scale(4.2)}}}}
@keyframes segla{{0%{{offset-distance:0%;opacity:0}}4%{{opacity:1}}96%{{opacity:1}}100%{{offset-distance:100%;opacity:0}}}}
@keyframes gung{{0%,100%{{transform:rotate(-3deg)}}50%{{transform:rotate(3deg) translateY(.6px)}}}}
@media (prefers-reduced-motion:reduce){{
 .land,.etiketter,.norr,.bro,.vag,.minuter,.nal,.skylt{{animation:none;opacity:1;transform:none}}
 .kurva,.vag-rita{{animation:none;stroke-dashoffset:0}}.vag-rita{{opacity:0}}
 .ring,.bat{{animation:none;opacity:0}}
}}
"""
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t d">'
       f'<title id="t">Karta: Hjuviks Marina</title><desc id="d">Hjuviks Marina ligger på Hisingens sydvästra udde vid Rivöfjorden, en kvart med bil från Älvsborgsbron.</desc>'
       f'<style>{css}</style>'
       f'<defs><clipPath id="ram"><rect width="{W}" height="{H}" rx="28"/></clipPath></defs>'
       f'<g clip-path="url(#ram)"><rect width="{W}" height="{H}" fill="#fff"/>' + ''.join(delar) + f'</g><rect x="0.5" y="0.5" width="{W-1}" height="{H-1}" rx="27.5" fill="none" stroke="{NAVY}" stroke-opacity="0.14"/></svg>')
open(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', '..', 'assets', 'hjuviks-karta.svg'), 'w').write(svg)
print(len(svg))
