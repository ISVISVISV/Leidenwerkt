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
export function brutoUitNetto(l: Lezer, nettoJaar: Bedrag): Bedrag {
  if (nettoJaar.lte(0)) return NUL;
  const schijven = l.schijven("ib.box1.schijven");
  const ahk = l.schijven("ib.ahk");
  const netto = (g: Bedrag) => g.minus(max(NUL, progressief(schijven, g).minus(stuksgewijs(ahk, g))));
  let laag = nettoJaar;
  let hoog = nettoJaar.times(3);
  for (let i = 0; i < 80 && hoog.minus(laag).gt(D("0.001")); i++) {
    const midden = laag.plus(hoog).div(2);
    if (netto(midden).lt(nettoJaar)) laag = midden;
    else hoog = midden;
  }
  return hoog.toDecimalPlaces(2);
}
