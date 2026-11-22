# Maakt de lijntekening van Leiden voor de startpagina (start/index.html). Draai: python3 start/scripts/skyline.py
# Het script schrijft skyline.svg en los.html (een grote versie om te bekijken). Plak de inhoud van skyline.svg in start/index.html.
# Bouwt de skyline als losse onderdelen met nette maten. Basislijn (straat/water) op y=240.
B=240
def ramen(x,w,boven,rijen=2,kol=2,rw=10,rh=15):
    """Kleine rechthoekige ramen, precies in het midden van de gevel verdeeld."""
    tussen=w/(kol+1)
    d=""
    for r in range(rijen):
        y=boven+r*30
        for k in range(kol):
            cx=x+tussen*(k+1)
            d+=f"M{cx-rw/2:.1f} {y}h{rw}v{rh}h-{rw}z"
    return f'<path d="{d}" stroke-width="2.2"/>'

def trapgevel(x,w,h,stappen=3,ramen_aan=True):
    # rechthoekig pand met trapgevel; w breed, h hoog tot de voet van de gevel
    st=w/(2*stappen+1)*1.0
    d=f"M{x} {B}V{B-h}"
    y=B-h; cx=x
    for i in range(stappen):
        d+=f"h{st:.1f}v-{st:.1f}"
    d+=f"h{w-2*stappen*st:.1f}"
    for i in range(stappen):
        d+=f"v{st:.1f}h{st:.1f}"
    d+=f"V{B}"
    return f'<path d="{d}"/>'+(ramen(x,w,B-h+14) if ramen_aan else "")
def tuitgevel(x,w,h):
    d=f"M{x} {B}V{B-h}l{w/2} -{w*0.55:.1f}l{w/2} {w*0.55:.1f}V{B}"
    return f'<path d="{d}"/>'+ramen(x,w,B-h+14)
def halsgevel(x,w,h):
    n=w*0.3
    d=f"M{x} {B}V{B-h}h{n:.1f}v-{n*1.6:.1f}c0-{n*0.9:.1f} {w-2*n:.1f}-{n*0.9:.1f} {w-2*n:.1f} 0v{n*1.6:.1f}h{n:.1f}V{B}"
    return f'<path d="{d}"/>'+ramen(x,w,B-h+14)

def spitsboog(x,onder,w,h):
    """Een spitsboogvenster: rechte zijkanten en een spitse bovenkant."""
    r=w*0.9
    return f"M{x} {onder}V{onder-h}A{r:.1f} {r:.1f} 0 0 1 {x+w/2:.1f} {onder-h-w*0.75:.1f}A{r:.1f} {r:.1f} 0 0 1 {x+w} {onder-h}V{onder}z"

def boog(x,onder,span,pijl):
    """Een rondboog over het water: van links onder via de top naar rechts onder."""
    r=(span*span/4+pijl*pijl)/(2*pijl)
    return f"M{x} {onder}A{r:.1f} {r:.1f} 0 0 1 {x+span} {onder}"

def koornbrug(x,w=290):
    # stenen brug met drie bogen (de middelste het grootst), het dek met landhoofden,
    # en daarop de zuilengang: zuilen, een balk, een fronton in het midden en een schilddak erachter
    dek=B-44
    brug=f"M{x} {B}V{dek}h{w}V{B}M{x} {dek+7}h{w}"
    m=x+w/2
    bogen=boog(x+22,B,62,24)+boog(m-42,B,84,30)+boog(x+w-84,B,62,24)
    kz=[x+30,x+52,x+100,x+122,x+w-122,x+w-100,x+w-52,x+w-30]
    zuilen="".join(f"M{z} {dek}V{dek-42}" for z in kz)
    balk=f"M{x+20} {dek-42}h{w-40}M{x+20} {dek-48}h{w-40}"
    fronton=f"M{m-58} {dek-48}L{m} {dek-88}L{m+58} {dek-48}"
    krans=f'<circle cx="{m}" cy="{dek-62}" r="7" stroke-width="2.2"/>'
    dak=f"M{x+20} {dek-48}L{x+56} {dek-72}H{m-23}M{m+23} {dek-72}H{x+w-56}L{x+w-20} {dek-48}"
    return f'<path d="{brug}"/><path d="{bogen}"/><path d="{zuilen}"/><path d="{balk}"/><path d="{dak}"/><path d="{fronton}"/>{krans}'

def hooglandsekerk(x):
    # de gevel van de Hooglandse Kerk: een hoog middendeel met een groot spitsboograam en een dubbele deur,
    # twee slanke torentjes ernaast met spitse punten, een sierlijke top, en lagere zijbeuken met een spitsboograam
    mw=104; mx=x+70; top=B-200
    zij_l=f"M{x} {B}V{B-110}L{x+24} {B-138}H{mx-18}"
    zij_r=f"M{mx+mw+18} {B-138}H{mx+mw+46}L{mx+mw+70} {B-110}V{B}"
    raam_l=spitsboog(x+18,B-30,30,52); raam_r=spitsboog(mx+mw+22,B-30,30,52)
    toren_l=f"M{mx-18} {B}V{top+20}h18M{mx-18} {top+20}l9-34l9 34"
    toren_r=f"M{mx+mw} {top+20}h18V{B}M{mx+mw} {top+20}l9-34l9 34"
    midden=f"M{mx} {B}V{top+20}"+f"M{mx+mw} {B}V{top+20}"
    gevel=f"M{mx} {top+20}L{mx+mw/2} {top-22}L{mx+mw} {top+20}"
    pinakels="".join(f"M{mx+mw*f:.1f} {top+20-44*min(f,1-f)*2+2:.1f}v-12" for f in (0.25,0.5,0.75))
    raam=spitsboog(mx+24,B-56,56,96)
    stijl=f"M{mx+52} {B-56}V{B-152}"
    deur=f"M{mx+30} {B}V{B-26}a11 11 0 0 1 22 0V{B}M{mx+52} {B}V{B-26}a11 11 0 0 1 22 0V{B}"
    return (f'<path d="{zij_l}"/><path d="{zij_r}"/><path d="{raam_l}{raam_r}" stroke-width="2.2"/>'
            f'<path d="{toren_l}"/><path d="{toren_r}"/><path d="{midden}"/><path d="{gevel}"/><path d="{pinakels}" stroke-width="2.2"/>'
            f'<path d="{raam}" stroke-width="2.5"/><path d="{stijl}" stroke-width="2"/><path d="{deur}" stroke-width="2.2"/>')

def molen(cx):
    # De Valk: hoog, taps, stelling op ongeveer 40%, kap, vier wieken
    voet=34; top=20; romp_h=150; stel=B-62
    romp=f"M{cx-voet} {B}L{cx-top} {B-romp_h}h{2*top}L{cx+voet} {B}"
    stelling=f"M{cx-58} {stel}h116M{cx-58} {stel-12}h116M{cx-58} {stel-12}v12M{cx+58} {stel-12}v12M{cx-52} {stel}l20 22M{cx+52} {stel}l-20 22"
    kap=f"M{cx-top-4} {B-romp_h}c0-26 {2*top+8}-26 {2*top+8} 0"
    deur=f"M{cx-8} {B}v-22a8 8 0 0 1 16 0v22"
    raam=f"M{cx-5} {B-110}h10v12h-10z"
    hub=(cx,B-romp_h-14)
    return f'<path d="{romp}"/><path d="{stelling}"/><path d="{kap}"/><path d="{deur}" stroke-width="2.5"/><path d="{raam}" stroke-width="2.5"/>', hub

def wieken(hub,L=104):
    cx,cy=hub
    g=""
    for h in (15,105,195,285):
        hek="".join(f"M{cx} {cy-14-i*15}h12" for i in range(6))
        g+=f'<g transform="rotate({h} {cx} {cy})"><path d="M{cx} {cy}V{cy-L}"/><path d="M{cx} {cy-10}h12V{cy-L}h-12{hek}" stroke-width="2"/></g>'
    return f'<g class="wieken">{g}<circle cx="{cx}" cy="{cy}" r="5"/></g>'

def water(x0=-120,n=15):
    d=f"M{x0} 254c40-6 80 6 120 0s80-6 120 0"+"".join(" 80 6 120 0" if i%2==0 else " 80-6 120 0" for i in range(n))
    return f'<path class="water" d="{d}"/>'

SCHAAL=0.5625  # de gebouwen zijn kleiner dan de breedte van de pagina; de lijnen worden even veel dunner
BREED=1440/SCHAAL  # breedte van de tekening voor het schalen

def skyline():
    p=[]
    # links: een pand, molen De Valk, en twee groepjes panden (nooit meer dan vier naast elkaar)
    p.append(trapgevel(60,64,80))
    m,hub=molen(270); p.append(m); p.append(wieken(hub))
    p.append(halsgevel(440,52,84)); p.append(trapgevel(506,64,80)); p.append(tuitgevel(584,50,84)); p.append(halsgevel(648,54,92))
    p.append(trapgevel(830,58,70,2)); p.append(tuitgevel(902,46,80)); p.append(trapgevel(962,60,78))
    # midden: de Koornbrug
    bx=BREED/2-145
    p.append(koornbrug(bx))
    # rechts: een pand, de Hooglandse Kerk, twee groepjes panden en een pand aan het eind
    p.append(halsgevel(1500,54,92))
    p.append(hooglandsekerk(1600))
    p.append(tuitgevel(1880,50,84)); p.append(trapgevel(1944,64,80)); p.append(halsgevel(2022,52,84))
    p.append(trapgevel(2220,58,70,2)); p.append(tuitgevel(2292,56,90)); p.append(trapgevel(2362,46,72,2))
    p.append(halsgevel(2470,52,84))
    lijn=f'<path d="M0 {B}H{bx}M{bx+290} {B}H{BREED}"/>'
    groep=f'<g transform="translate(0 {B}) scale({SCHAAL}) translate(0 -{B})">{lijn}{"".join(p)}</g>'
    return water()+groep, hub

if __name__=="__main__":
    inhoud,hub=skyline()
    import json; print(json.dumps({"hub":hub}))
    svg=f'<svg class="skyline" viewBox="0 80 1440 179" preserveAspectRatio="xMidYMax slice" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">{inhoud}</svg>'
    open("skyline.svg","w").write(svg)
    groot=svg.replace('class="skyline"','style="width:2880px;display:block"')
    open("los.html","w").write('<html><body style="margin:0;background:#c8200f;color:#fff">'+groot+'</body></html>')
