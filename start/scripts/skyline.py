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

def koornbrug(x,w):
    # stenen boog over het water, het dek met een rand, en daarop een zuilengang met een schilddak
    dek=B-30
    # lage boog: koorde w-40, pijl 22 (straal = (koorde²/4 + pijl²) / (2 × pijl))
    k=w-40; h=22; r=(k*k/4+h*h)/(2*h)
    boog=f"M{x+20} {B}A{r:.1f} {r:.1f} 0 0 1 {x+w-20} {B}"
    rand=f"M{x} {B}V{dek}h{w}V{B}M{x} {dek+6}h{w}"
    n=7; m=34; zx=[x+m+i*(w-2*m)/(n-1) for i in range(n)]
    zuilen="".join(f"M{z:.1f} {dek}V{dek-34}" for z in zx)
    balk=f"M{x+m-8} {dek-34}h{w-2*m+16}"
    dak=f"M{x+m-16} {dek-34}L{x+m+22} {dek-54}H{x+w-m-22}L{x+w-m+16} {dek-34}z"
    return f'<path d="{boog}"/><path d="{rand}"/><path d="{zuilen}"/><path d="{balk}"/><path d="{dak}"/>'

def pieterskerk(x):
    # lang schip met een steil dak, steunberen, hoge spitsboogvensters, een kleine dakruiter,
    # en de gevel van het dwarsschip met een groot spitsboograam
    w=230; muur=B-70; nok=B-150
    schip=f"M{x} {B}V{muur}h{w}V{B}"
    dak=f"M{x-6} {muur}L{x+26} {nok}h{w-52}L{x+w+6} {muur}"
    ramen="".join(spitsboog(x+20+i*42,B-12,16,30) for i in range(5))
    steun="".join(f"M{x+42*i+5} {B}v-40" for i in range(1,6))
    dx=x+w*0.62; ruiter=f"M{dx-6} {nok}v-16l6-28l6 28v16"
    gx=x+w+18; gw=86
    gevel=f"M{gx} {B}V{B-96}L{gx+gw/2} {B-170}L{gx+gw} {B-96}V{B}"
    groot=spitsboog(gx+25,B-16,36,58)
    return f'<path d="{schip}"/><path d="{dak}"/><path d="{steun}" stroke-width="2.2"/><path d="{ramen}" stroke-width="2.2"/><path d="{ruiter}"/><path d="{gevel}"/><path d="{groot}" stroke-width="2.5"/>'

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

def skyline():
    p=[]
    # links: panden
    p.append(trapgevel(30,64,80)); p.append(tuitgevel(108,56,90)); p.append(halsgevel(178,52,84)); p.append(trapgevel(244,58,70,2))
    # Koornbrug
    p.append(koornbrug(340,280))
    # panden midden
    p.append(halsgevel(660,54,92)); p.append(trapgevel(728,60,78))
    # Pieterskerk
    p.append(pieterskerk(820))
    # molen
    m,hub=molen(1238); p.append(m); p.append(wieken(hub))
    # rechts
    p.append(tuitgevel(1330,50,84)); p.append(trapgevel(1390,46,72,2))
    lijn='<path d="M0 240h340M620 240h820"/>'
    return lijn+water()+"".join(p), hub

if __name__=="__main__":
    inhoud,hub=skyline()
    import json; print(json.dumps({"hub":hub}))
    svg=f'<svg class="skyline" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">{inhoud}</svg>'
    open("skyline.svg","w").write(svg)
    groot=svg.replace('class="skyline"','style="width:2880px;display:block"')
    open("los.html","w").write('<html><body style="margin:0;background:#c8200f;color:#fff">'+groot+'</body></html>')
