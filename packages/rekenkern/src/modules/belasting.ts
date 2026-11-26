/**
 * Loonheffing en heffingskortingen (Wet IB 2001, Wet LB 1964).
 * Het netto loon wordt benaderd met een jaarberekening; werkgevers
 * gebruiken loonheffingstabellen, dus de loonstrook kan iets afwijken.
 */
import { D, NUL, max, min, type Bedrag } from "../geld.ts";
import type { Lezer, Schijf } from "../regels.ts";

/** Stuksgewijs lineaire korting: basis + percentage × (x − vanaf) in de schijf waar x in valt. */
export function stuksgewijs(schijven: Schijf[], x: Bedrag): Bedrag {
  const s = schijven.find((s) => x.gte(s.vanaf) && (s.tot === null || x.lt(s.tot))) ?? schijven[schijven.length - 1];
  return max(NUL, s.basis.plus(s.percentage.times(x.minus(s.vanaf))));
}

/** Belasting over x met oplopende tarieven per schijf. */
export function progressief(schijven: Schijf[], x: Bedrag): Bedrag {
  let totaal = NUL;
  for (const s of schijven) {
    if (x.lte(s.vanaf)) break;
    const bovengrens = s.tot === null ? x : min(x, s.tot);
    totaal = totaal.plus(bovengrens.minus(s.vanaf).times(s.percentage));
  }
  return totaal;
}

export interface LoonUitkomst {
  brutoJaar: Bedrag;
  belastbaarJaar: Bedrag;
  belasting: Bedrag;
  ahk: Bedrag;
  arbeidskorting: Bedrag;
  heffing: Bedrag;
  nettoJaar: Bedrag;
  /** Belasting die na AHK en arbeidskorting nog over is (ruimte voor IACK). */
  restBelasting: Bedrag;
}

/** Netto loon over een jaar. `brutoJaar` is inclusief vakantiegeld. */
export function nettoLoon(l: Lezer, brutoJaar: Bedrag, pensioenJaar: Bedrag = NUL): LoonUitkomst {
  const belastbaar = max(NUL, brutoJaar.minus(pensioenJaar));
  const belasting = progressief(l.schijven("ib.box1.schijven"), belastbaar);
  const ahk = stuksgewijs(l.schijven("ib.ahk"), belastbaar);
  const ak = stuksgewijs(l.schijven("ib.arbeidskorting"), belastbaar);
  const heffing = max(NUL, belasting.minus(ahk).minus(ak));
  return {
    brutoJaar,
    belastbaarJaar: belastbaar,
    belasting,
    ahk,
    arbeidskorting: ak,
    heffing,
    nettoJaar: brutoJaar.minus(pensioenJaar).minus(heffing),
    restBelasting: heffing,
  };
}

/**
 * Bruto jaarbedrag van een uitkering bij een gegeven netto jaarbedrag:
 * de bruto G waarvoor G − max(0, belasting(G) − AHK(G)) = netto.
 * Gebruikt voor het toetsingsinkomen van toeslagen.
 */
export function brutoUitNetto(l: Lezer, nettoJaar: Bedrag, metHeffingskorting = true): Bedrag {
  if (nettoJaar.lte(0)) return NUL;
  const schijven = l.schijven("ib.box1.schijven");
  const ahk = l.schijven("ib.ahk");
  // Zonder heffingskorting: als de loonheffingskorting al op het loon wordt toegepast (bijstand naast werk).
  const korting = (g: Bedrag) => (metHeffingskorting ? stuksgewijs(ahk, g) : NUL);
  const netto = (g: Bedrag) => g.minus(max(NUL, progressief(schijven, g).minus(korting(g))));
  let laag = nettoJaar;
  let hoog = nettoJaar.times(3);
  for (let i = 0; i < 80 && hoog.minus(laag).gt(D("0.001")); i++) {
    const midden = laag.plus(hoog).div(2);
    if (netto(midden).lt(nettoJaar)) laag = midden;
    else hoog = midden;
  }
  return hoog.toDecimalPlaces(2);
}

/**
 * Bruto maandloon (zonder vakantiegeld) bij een netto maandloon zoals op
 * de loonstrook. Aanname: de werkgever houdt per maand hetzelfde deel aan
 * belasting in als over het hele jaar (vakantiegeld inbegrepen).
 */
export function brutoMaandUitNetto(l: Lezer, nettoMaand: Bedrag, vakantiegeld: Bedrag): Bedrag {
  if (nettoMaand.lte(0)) return NUL;
  const nettoBij = (brutoMaand: Bedrag) => {
    const jaar = brutoMaand.times(12).times(vakantiegeld.plus(1));
    const r = nettoLoon(l, jaar);
    return brutoMaand.times(r.nettoJaar.div(jaar));
  };
  let laag = nettoMaand;
  let hoog = nettoMaand.times(3);
  for (let i = 0; i < 80 && hoog.minus(laag).gt(D("0.001")); i++) {
    const midden = laag.plus(hoog).div(2);
    if (nettoBij(midden).lt(nettoMaand)) laag = midden;
    else hoog = midden;
  }
  return hoog.toDecimalPlaces(2);
}

/**
 * Netto per jaar met de AOW-leeftijd: de tarieven en heffingskortingen voor wie de AOW-leeftijd heeft
 * (algemene heffingskorting voor AOW-gerechtigden, ouderenkorting, alleenstaande-ouderenkorting) en de
 * ingehouden bijdrage Zvw. Die bijdrage gaat ook van de AOW en van een pensioen af (SVB, Bedragen AOW).
 */
export function nettoMetAow(l: Lezer, brutoJaar: Bedrag, alleenstaand: boolean, geborenVoor1946: boolean): Bedrag {
  if (brutoJaar.lte(0)) return NUL;
  const schijven = l.schijven(geborenVoor1946 ? "ib.box1.schijven.aow_voor_1946" : "ib.box1.schijven.aow");
  const kortingen = stuksgewijs(l.schijven("ib.ahk.aow"), brutoJaar)
    .plus(stuksgewijs(l.schijven("ib.ouderenkorting"), brutoJaar))
    .plus(alleenstaand ? l.bedrag("ib.alleenstaande_ouderenkorting") : NUL);
  const heffing = max(NUL, progressief(schijven, brutoJaar).minus(kortingen));
  const zvw = min(brutoJaar, l.bedrag("zvw.maximum_bijdrage_inkomen")).times(l.breuk("zvw.ingehouden_bijdrage"));
  return brutoJaar.minus(heffing).minus(zvw);
}

/** Bruto jaarbedrag met de AOW-leeftijd bij een netto jaarbedrag (zonder AOW-vakantiegeld), bijvoorbeeld de AIO-norm. */
export function brutoUitNettoMetAow(l: Lezer, nettoJaar: Bedrag, alleenstaand: boolean, geborenVoor1946: boolean): Bedrag {
  if (nettoJaar.lte(0)) return NUL;
  let laag = nettoJaar;
  let hoog = nettoJaar.times(3);
  for (let i = 0; i < 80 && hoog.minus(laag).gt(D("0.001")); i++) {
    const midden = laag.plus(hoog).div(2);
    if (nettoMetAow(l, midden, alleenstaand, geborenVoor1946).lt(nettoJaar)) laag = midden;
    else hoog = midden;
  }
  return hoog.toDecimalPlaces(2);
}

/**
 * Bruto jaarinkomen met de AOW-leeftijd, uit de netto AOW en het netto pensioen per maand (zoals op het
 * betaaloverzicht, zonder vakantiegeld). Het vakantiegeld van de AOW is een vast bedrag per maand (SVB). Bij een
 * deel van de AOW telt Leidengeldwijzer hetzelfde deel van het vakantiegeld. Aanname, net als bij loon: per maand
 * gaat hetzelfde deel af als over het hele jaar.
 */
export function brutoJaarMetAow(l: Lezer, aowNettoMaand: Bedrag, pensioenNettoMaand: Bedrag, alleenstaand: boolean, geborenVoor1946: boolean): Bedrag {
  if (aowNettoMaand.plus(pensioenNettoMaand).lte(0)) return NUL;
  const vol = l.bedrag(alleenstaand ? "aow.bruto.alleenstaand" : "aow.bruto.gehuwd");
  const vakantiegeldVol = l.bedrag(alleenstaand ? "aow.vakantiegeld.alleenstaand" : "aow.vakantiegeld.gehuwd");
  const jaar = (k: Bedrag) => {
    const aow = aowNettoMaand.times(k);
    const vakantiegeld = vakantiegeldVol.times(min(D(1), aow.div(vol)));
    return aow.plus(vakantiegeld).plus(pensioenNettoMaand.times(k)).times(12);
  };
  // k = bruto / netto. Het netto bedrag per maand is het bruto bedrag maal netto/bruto over het jaar.
  let k = D(1);
  for (let i = 0; i < 100; i++) {
    const g = jaar(k);
    const nieuw = g.div(nettoMetAow(l, g, alleenstaand, geborenVoor1946));
    if (nieuw.minus(k).abs().lt(D("0.0000001"))) break;
    k = nieuw;
  }
  return jaar(k).toDecimalPlaces(2);
}
