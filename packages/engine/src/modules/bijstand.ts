/**
 * Bijstand (Participatiewet): norm, kostendelersnorm en aanvulling tot de
 * norm. De vrijlating staat per regime in ./vrijlating.ts.
 */
import { D, NUL, max, type Bedrag } from "../geld.ts";
import type { Lezer } from "../regels.ts";
import type { Invoer } from "../types.ts";

export interface NormUitkomst {
  norm: Bedrag;
  uitleg: string;
}

/** Bijstandsnorm per maand (netto, incl. vakantietoeslag) voor het hele huishouden. */
export function bijstandsnorm(l: Lezer, invoer: Invoer): NormUitkomst {
  const paar = invoer.leefvorm === "paar";
  if (invoer.kostendelers <= 0) {
    if (paar) return { norm: l.bedrag("pw.norm.gehuwden"), uitleg: "Norm voor gehuwden of samenwonenden" };
    return { norm: l.bedrag("pw.norm.alleenstaande"), uitleg: "Norm voor een alleenstaande (ouder)" };
  }
  const gehuwden = l.bedrag("pw.norm.gehuwden");
  // Kostendelersnorm: ((40% + A × 30%) / A) × gehuwdennorm per persoon,
  // A = medebewoners van 27+ plus belanghebbende (plus partner).
  l.aantal("pw.kostendeler.minimumleeftijd");
  const basis = l.breuk("pw.kostendeler.basis");
  const perPersoon = l.breuk("pw.kostendeler.per_persoon");
  const a = D(invoer.kostendelers + (paar ? 2 : 1));
  const factor = basis.plus(a.times(perPersoon)).div(a);
  const normPersoon = factor.times(gehuwden);
  return {
    norm: paar ? normPersoon.times(2) : normPersoon,
    uitleg: `Kostendelersnorm met ${a.toString()} kostendelers: ${factor.times(100).toDecimalPlaces(2).toString()}% van de gehuwdennorm${paar ? " per partner" : ""}`,
  };
}

/** Aanvulling tot de norm: norm − (inkomen − vrijlating), niet negatief. */
export function aanvulling(norm: Bedrag, inkomen: Bedrag, vrijgelaten: Bedrag): Bedrag {
  return max(NUL, norm.minus(inkomen.minus(vrijgelaten)));
}
