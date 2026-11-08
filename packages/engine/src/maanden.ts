/**
 * Overzicht per maand van de eerste 12 maanden na de start van het werk.
 *
 * Uitgangspunten (zie docs/REKENREGELS.md, hoofdstuk 10):
 * - Inkomen wordt achteraf verrekend: het loon van maand k gaat af van de
 *   bijstand van maand k + 1. In maand 1 krijgt u dus nog de bijstand van nu.
 *   (Praktijk in Leiden; vanaf 2027 ook art. 32 lid 2 Pw: inkomen telt in de
 *   periode waarin u erover kunt beschikken.)
 * - De vrijlating hoort bij het loon van de maand waarin het is verdiend.
 * - In de bijstand zit vakantietoeslag (art. 19 lid 3 Pw). Die wordt in juni
 *   uitbetaald, of uiterlijk 3 maanden nadat de bijstand stopt (art. 45 lid 1).
 * - De gemeente rekent per maand met het loon inclusief een deel vakantiegeld;
 *   de werkgever betaalt het vakantiegeld zelf meestal in mei uit.
 * - Toeslagen zijn vanaf maand 1 aangepast (de gebruiker geeft het nieuwe
 *   inkomen meteen door).
 * - Alle maanden met de regels van de rekendatum.
 */
import { D, NUL, centen, type Bedrag } from "./geld.ts";
import { Lezer, OntbrekendeParameter, standaardRegels, type RegelSet } from "./regels.ts";
import { bereken, metVakantiegeld } from "./bereken.ts";
import { REGIMES, regimeOp } from "./regimes.ts";
import type { Fase, Invoer, Resultaat } from "./types.ts";

export interface Eenmalig {
  wat: string;
  bedrag: string;
}

export interface Maand {
  /** JJJJ-MM */
  maand: string;
  /** 1 = eerste maand van het werk. */
  nummer: number;
  fase: Fase;
  /** Netto loon dat deze maand binnenkomt, zonder vakantiegeld. */
  loon: string;
  /** Bijstand die deze maand wordt uitbetaald, zonder vakantietoeslag. */
  bijstand: string;
  /** Toeslagen, kinderbijslag en andere bedragen, min de kosten van werk en opvang. */
  overig: string;
  eenmalig: Eenmalig[];
  totaal: string;
}

export interface Maandoverzicht {
  maanden: Maand[];
  /** Wat u nu per maand krijgt (zonder vakantietoeslag), om mee te vergelijken. */
  nu: string;
  /** Eerste maand zonder bijstand, of undefined als de bijstand doorloopt. */
  bijstandStopt?: string;
  /** Maand vanaf wanneer andere regels gelden dan die waarmee is gerekend (bijvoorbeeld 2027). */
  andereRegelsVanaf?: string;
  aannames: string[];
}

const volgende = (jm: string, n = 1) => {
  const [j, m] = jm.split("-").map(Number);
  const d = new Date(j, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const post = (r: Resultaat, s: "huidig" | "werk", id: string): Bedrag => {
  const p = r[s].posten.find((x) => x.id === id);
  return p && p.perMaand !== null ? D(p.perMaand) : NUL;
};

/** Som van alle meegetelde posten behalve loon en bijstand (toeslagen min kosten). */
function overigVan(r: Resultaat, s: "huidig" | "werk"): Bedrag {
  const uit = new Set(r.nietMeegenomen.map((n) => n.id));
  return r[s].posten
    .filter((p) => p.perMaand !== null && !uit.has(p.id) && p.id !== "loon" && p.id !== "bijstand")
    .reduce((t, p) => t.plus(D(p.perMaand!)), NUL);
}

export function maandoverzicht(gegeven: Invoer, start: string, regels: RegelSet = standaardRegels): Maandoverzicht {
  const invoer = metVakantiegeld(gegeven, regels);
  const l = new Lezer(regels, invoer.datum);
  let duur = 6;
  try {
    duur = l.aantal(regimeOp(invoer.datum).id === "pw34a" ? "pw.bijverdien.duur" : "pw.vrijlating_n.duur").toNumber();
  } catch (e) {
    if (!(e instanceof OntbrekendeParameter)) throw e;
  }
  let vt = D("0.05");
  try {
    vt = l.breuk("pw.vakantietoeslag");
  } catch (e) {
    if (!(e instanceof OntbrekendeParameter)) throw e;
  }
  const faseVan = (k: number): Fase => (k <= duur ? "start" : "later");
  const cache = new Map<Fase, Resultaat>();
  const met = (fase: Fase) => {
    if (!cache.has(fase)) cache.set(fase, bereken({ ...invoer, vrijlatingFase: fase, huidigeVrijlating: invoer.huidigWerk ? fase : invoer.huidigeVrijlating }, regels));
    return cache.get(fase)!;
  };
  const vg = D(invoer.nieuwWerk.vakantiegeld ?? 0).plus(1);

  // Nu: bijstand (zonder vakantietoeslag), loon zonder vakantiegeld en de rest.
  const r1 = met(faseVan(1));
  const bijstandNu = post(r1, "huidig", "bijstand");
  const loonNu = post(r1, "huidig", "loon").div(vg);
  const nu = bijstandNu.times(D(1).minus(vt)).plus(loonNu).plus(overigVan(r1, "huidig"));

  const maanden: Maand[] = [];
  let vtOpgebouwd = NUL;
  // Opgebouwde vakantietoeslag vóór de start: sinds de laatste uitbetaling in juni.
  const [, startM] = start.split("-").map(Number);
  const maandenSindsJuni = (startM - 6 + 12) % 12;
  vtOpgebouwd = bijstandNu.times(vt).times(maandenSindsJuni);
  let vakantiegeldOpgebouwd = NUL;
  let bijstandStopt: string | undefined;
  let vtNogUitTeBetalen: { bedrag: Bedrag; uiterlijk: string } | undefined;

  for (let k = 1; k <= 12; k++) {
    const maand = volgende(start, k - 1);
    const fase = faseVan(k);
    const r = met(fase);
    // Bijstand van deze maand: verrekend met het loon van de vorige maand.
    const bruto = k === 1 ? bijstandNu : post(met(faseVan(k - 1)), "werk", "bijstand");
    const loonGemiddeld = post(r, "werk", "loon");
    const loon = loonGemiddeld.div(vg);
    vakantiegeldOpgebouwd = vakantiegeldOpgebouwd.plus(loonGemiddeld.minus(loon));
    vtOpgebouwd = vtOpgebouwd.plus(bruto.times(vt));
    const eenmalig: Eenmalig[] = [];
    const maandNr = Number(maand.slice(5));
    if (maandNr === 5 && vakantiegeldOpgebouwd.gt(0)) {
      eenmalig.push({ wat: "Vakantiegeld van de werkgever (meestal in mei)", bedrag: centen(vakantiegeldOpgebouwd) });
      vakantiegeldOpgebouwd = NUL;
    }
    if (bruto.isZero() && !bijstandStopt && k > 1) {
      bijstandStopt = maand;
      if (vtOpgebouwd.gt(0)) vtNogUitTeBetalen = { bedrag: vtOpgebouwd, uiterlijk: volgende(maand, 2) };
      vtOpgebouwd = NUL;
    }
    if (maandNr === 6 && vtOpgebouwd.gt(0) && !bijstandStopt) {
      eenmalig.push({ wat: "Vakantietoeslag van de bijstand (in juni)", bedrag: centen(vtOpgebouwd) });
      vtOpgebouwd = NUL;
    }
    if (vtNogUitTeBetalen && maand === bijstandStopt) {
      eenmalig.push({
        wat: `Vakantietoeslag van de bijstand, omdat de bijstand stopt (uiterlijk ${vtNogUitTeBetalen.uiterlijk})`,
        bedrag: centen(vtNogUitTeBetalen.bedrag),
      });
    }
    const bijstand = bruto.times(D(1).minus(vt));
    const overig = overigVan(r, "werk");
    const totaal = loon.plus(bijstand).plus(overig).plus(eenmalig.reduce((t, e) => t.plus(D(e.bedrag)), NUL));
    maanden.push({ maand, nummer: k, fase, loon: centen(loon), bijstand: centen(bijstand), overig: centen(overig), eenmalig, totaal: centen(totaal) });
  }

  const huidig = regimeOp(invoer.datum);
  const eind = `${volgende(start, 11)}-01`;
  const nieuw = REGIMES.find((x) => x.vanaf > invoer.datum && x.vanaf <= eind && x.id !== huidig.id);
  return {
    maanden,
    nu: centen(nu),
    bijstandStopt,
    andereRegelsVanaf: nieuw?.vanaf.slice(0, 7),
    aannames: [
      "'Toeslagen e.d.' zijn de toeslagen, de kinderbijslag en andere bedragen die binnenkomen, min de kosten van het werk en de kinderopvang.",
      "Uw loon wordt achteraf verrekend: het loon van een maand gaat af van de bijstand van de maand erna. In de eerste maand krijgt u dus nog de bijstand van nu én uw eerste loon.",
      "Er is aangenomen dat u elke maand loon krijgt, aan het einde van de maand waarin u werkte.",
      `Het netto loon per maand zonder vakantiegeld is benaderd door het gemiddelde netto loon te delen door ${vg.toString().replace(".", ",")}.`,
      "Er is aangenomen dat u uw nieuwe inkomen meteen doorgeeft aan Dienst Toeslagen, zodat uw toeslagen vanaf de eerste maand kloppen.",
      "Alle maanden zijn berekend met de bedragen van nu. Nieuwe bedragen per 1 januari of 1 juli zijn niet meegenomen.",
    ],
  };
}
