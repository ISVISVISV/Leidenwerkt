/**
 * Bijstand (Participatiewet): norm, kostendelersnorm, inkomstenvrijlating
 * en aanvulling tot de norm.
 */
import { D, NUL, max, min, type Bedrag } from "../geld.ts";
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

export interface VrijlatingUitkomst {
  bedrag: Bedrag;
  uitleg: string;
  aannames: string[];
}

/**
 * Vrijlating op netto inkomsten uit arbeid van één persoon, per maand.
 * Tot en met 2026: art. 31 lid 2 onder n en r Pw. Vanaf 2027: art. 34a Pw.
 */
export function vrijlating(
  l: Lezer,
  fase: Invoer["vrijlatingFase"],
  nettoArbeid: Bedrag,
  huishoudinkomen: Bedrag,
  norm: Bedrag,
  alleenstaandeOuderMetJongKind: boolean,
): VrijlatingUitkomst {
  if (fase === "geen" || nettoArbeid.lte(0)) return { bedrag: NUL, uitleg: "Geen vrijlating toegepast", aannames: [] };

  if (l.bestaat("pw.bijverdien.percentage")) {
    // Regime vanaf 2027 (Participatiewet in balans).
    if (fase === "later") {
      l.aantal("pw.bijverdien.duur");
      return {
        bedrag: NUL,
        uitleg: "Na de eerste 12 maanden geen bijverdienregeling (tenzij de gemeente verlengt)",
        aannames: ["De gemeente kan de bijverdienregeling na 12 maanden verlengen; hier is aangenomen dat dat niet gebeurt."],
      };
    }
    const pct = l.breuk("pw.bijverdien.percentage");
    l.aantal("pw.bijverdien.duur");
    if (huishoudinkomen.gt(norm)) {
      return {
        bedrag: NUL,
        uitleg: "Inkomen hoger dan de bijstandsnorm: bijverdienregeling geldt niet",
        aannames: [],
      };
    }
    return {
      bedrag: nettoArbeid.times(pct),
      uitleg: `Bijverdienregeling: ${pct.times(100).toString()}% van het netto loon`,
      aannames: ["Voor de bijverdienregeling vanaf 2027 is (nog) geen maximumbedrag bekend."],
    };
  }

  if (fase === "start") {
    const pct = l.breuk("pw.vrijlating_n.percentage");
    const maximum = l.bedrag("pw.vrijlating_n.maximum");
    l.aantal("pw.vrijlating_n.duur");
    return {
      bedrag: min(nettoArbeid.times(pct), maximum),
      uitleg: `Inkomstenvrijlating: ${pct.times(100).toString()}% van het netto loon, maximaal € ${maximum.toFixed(2).replace(".", ",")} per maand (eerste 6 maanden)`,
      aannames: [],
    };
  }

  // fase "later"
  if (!alleenstaandeOuderMetJongKind) {
    return { bedrag: NUL, uitleg: "Na 6 maanden geen vrijlating meer", aannames: [] };
  }
  const pct = l.breuk("pw.vrijlating_r.percentage");
  const maximum = l.bedrag("pw.vrijlating_r.maximum");
  l.aantal("pw.vrijlating_r.duur");
  return {
    bedrag: min(nettoArbeid.times(pct), maximum),
    uitleg: `Vrijlating alleenstaande ouder: ${pct.times(100).toString()}% van het netto loon, maximaal € ${maximum.toFixed(2).replace(".", ",")} per maand`,
    aannames: [],
  };
}

/** Aanvulling tot de norm: norm − (inkomen − vrijlating), niet negatief. */
export function aanvulling(norm: Bedrag, inkomen: Bedrag, vrijgelaten: Bedrag): Bedrag {
  return max(NUL, norm.minus(inkomen.minus(vrijgelaten)));
}
