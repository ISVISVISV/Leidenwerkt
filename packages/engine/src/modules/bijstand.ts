/**
 * Bijstand (Participatiewet): norm, kostendelersnorm en aanvulling tot de
 * norm. De vrijlating staat per regime in ./vrijlating.ts.
 */
import { D, NUL, euro, max, type Bedrag } from "../geld.ts";
import type { Lezer } from "../regels.ts";
import type { Invoer } from "../types.ts";

export interface NormUitkomst {
  norm: Bedrag;
  uitleg: string;
}

/** Bijstandsnorm per maand (netto, incl. vakantietoeslag) voor het hele huishouden. */
export function bijstandsnorm(l: Lezer, invoer: Invoer): NormUitkomst {
  const paar = invoer.leefvorm === "paar";
  if (invoer.wonen.soort === "instelling") {
    // Art. 23 Pw: norm bij verblijf in een inrichting, verhoogd met het bedrag van lid 2.
    const norm = paar
      ? l.bedrag("pw.norm.inrichting.gehuwden").plus(l.bedrag("pw.norm.inrichting.verhoging_gehuwden"))
      : l.bedrag("pw.norm.inrichting.alleenstaande").plus(l.bedrag("pw.norm.inrichting.verhoging_alleenstaande"));
    return { norm, uitleg: `Norm bij verblijf in een instelling${paar ? " (gehuwden)" : ""}` };
  }
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
    uitleg: `Kostendelersnorm: ${paar ? "u en uw partner delen" : "u deelt"} de kosten met ${invoer.kostendelers} ${invoer.kostendelers === 1 ? "andere volwassene" : "andere volwassenen"} van 27 jaar of ouder in huis${(invoer.jongeHuisgenoten ?? 0) > 0 ? " (huisgenoten jonger dan 27 tellen niet mee)" : ""}. Dat is ${factor.times(100).toDecimalPlaces(2).toString().replace(".", ",")}% van de norm voor partners${paar ? ", per partner" : ""}`,
  };
}

/** Aanvulling tot de norm: norm − (inkomen − vrijlating), niet negatief. */
export function aanvulling(norm: Bedrag, inkomen: Bedrag, vrijgelaten: Bedrag): Bedrag {
  return max(NUL, norm.minus(inkomen.minus(vrijgelaten)));
}

export interface Woonkorting {
  bedrag: Bedrag;
  /** Rekenstap, met de grondslag. */
  tekst: string;
  /** De reden in gewone woorden, voor de uitleg onder de tabel. */
  reden: string;
  aanname: string;
}

/**
 * Leiden: lagere norm bij geen of lage woonkosten (art. 27 Pw; Beleidsregels
 * CVDR760406 art. 3.1). Alleen bij de norm van art. 21 Pw, dus niet bij de
 * kostendelersnorm. Percentages zijn een deel van de gehuwdennorm:
 * - geen woonkosten: 10%;
 * - woonkosten onder 10% van de gehuwdennorm: het verschil;
 * - geen woonlasten (gas, elektriciteit, water): 9%; beide: 19%.
 */
export function woonkorting(l: Lezer, invoer: Invoer): Woonkorting {
  const geen: Woonkorting = { bedrag: NUL, tekst: "", reden: "", aanname: "" };
  if (invoer.gemeente !== "leiden" || invoer.kostendelers > 0) return geen;
  const w = invoer.wonen;
  if (w.soort === "anders" || w.soort === "instelling") return geen;
  if (w.soort === "huur") {
    const huur = D(w.kaleHuurPerMaand ?? 0);
    // Eerst kijken of de verlaging geldt; alleen dan staan de regels bij de gebruikte regels.
    const drempel = l.zonderNoteren(() => l.bedrag("pw.norm.gehuwden").times(l.breuk("leiden.woonkosten.korting_geen_woonkosten")));
    if (huur.isZero() || huur.gte(drempel)) return geen;
  }
  const gehuwden = l.bedrag("pw.norm.gehuwden");
  const pk = l.breuk("leiden.woonkosten.korting_geen_woonkosten");
  const grens = gehuwden.times(pk);
  if (w.soort === "huur") {
    const huur = D(w.kaleHuurPerMaand ?? 0);
    return {
      bedrag: grens.minus(huur),
      tekst: `Uw woonkosten zijn lager dan ${euro(grens)}. De gemeente verlaagt de norm met het verschil`,
      reden: `Uw woonkosten zijn lager dan ${euro(grens)}`,
      aanname: "Bij heel lage woonkosten verlaagt de gemeente Leiden de bijstandsnorm. Vraag uw contactpersoon bij de gemeente welk bedrag voor u geldt.",
    };
  }
  const pl = l.breuk("leiden.woonkosten.korting_geen_woonlasten");
  const pct = w.betaaltWoonlasten ? pk : pk.plus(pl);
  const wat = w.betaaltWoonlasten ? "geen woonkosten" : "geen woonkosten en geen kosten voor gas, licht en water";
  return {
    bedrag: gehuwden.times(pct),
    tekst: `U betaalt ${wat}. De gemeente verlaagt de norm met ${pct.times(100).toString().replace(".", ",")}% van de norm voor partners`,
    reden: w.dakloos ? `We gaan ervan uit dat u ${wat} heeft` : `U betaalt ${wat}`,
    aanname: w.dakloos
      ? "Zonder vaste woonplek gaat de gemeente Leiden ervan uit dat u geen woonkosten heeft. Betaalt u toch voor onderdak? Laat dat zien aan uw contactpersoon bij de gemeente; dan kan de verlaging lager zijn."
      : "Betaalt iemand anders langer dan 6 maanden uw woonkosten, dan verlaagt de gemeente Leiden de norm. Korter dan 6 maanden telt het als gift. Vraag uw contactpersoon bij de gemeente wat voor u geldt.",
  };
}
