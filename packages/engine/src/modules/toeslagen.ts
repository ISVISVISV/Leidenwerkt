/**
 * Toeslagen: zorgtoeslag, huurtoeslag, kindgebonden budget en
 * kinderopvangtoeslag. Alle bedragen per jaar, tenzij anders vermeld.
 */
import Decimal from "decimal.js";
import { D, NUL, max, min, type Bedrag } from "../geld.ts";
import type { Lezer } from "../regels.ts";
import type { Kind, Opvangsoort } from "../types.ts";

/**
 * Dienst Toeslagen rondt het bedrag per maand naar beneden af op hele euro's
 * (Berekening zorgtoeslag, huurtoeslag, kindgebonden budget en
 * kinderopvangtoeslag 2026, rekenvoorbeelden).
 */
export function maandbedragToeslag(perMaand: Bedrag): Bedrag {
  return max(NUL, perMaand.toDecimalPlaces(0, Decimal.ROUND_DOWN));
}

/** Toetsingsinkomen in hele euro's (de tabellen van Toeslagen gaan per hele euro). */
export function heleEuros(b: Bedrag): Bedrag {
  return b.toDecimalPlaces(0, Decimal.ROUND_DOWN);
}

/** Zorgtoeslag per jaar. */
export function zorgtoeslag(l: Lezer, toetsingsinkomen: Bedrag, metPartner: boolean): Bedrag {
  const standaardpremie = l.bedrag("zt.standaardpremie");
  const drempel = l.bedrag("zt.drempelinkomen");
  const norm = l.breuk(metPartner ? "zt.normpercentage.met_partner" : "zt.normpercentage.zonder_partner");
  const afbouw = l.breuk("zt.afbouwpercentage");
  const normpremie = norm.times(drempel).plus(afbouw.times(max(NUL, toetsingsinkomen.minus(drempel))));
  const premie = metPartner ? standaardpremie.times(2) : standaardpremie;
  return max(NUL, premie.minus(normpremie));
}

/** Kindgebonden budget per jaar voor kinderen jonger dan 18. */
export function kindgebondenBudget(l: Lezer, toetsingsinkomen: Bedrag, kinderen: Kind[], metPartner: boolean): Bedrag {
  const minderjarig = kinderen.filter((k) => k.leeftijd < 18);
  if (minderjarig.length === 0) return NUL;
  const perKind = l.bedrag("kgb.per_kind");
  let maximum = perKind.times(minderjarig.length);
  for (const k of minderjarig) {
    if (k.leeftijd >= 16) maximum = maximum.plus(l.bedrag("kgb.verhoging_16"));
    else if (k.leeftijd >= 12) maximum = maximum.plus(l.bedrag("kgb.verhoging_12"));
  }
  if (!metPartner) maximum = maximum.plus(l.bedrag("kgb.alleenstaande_ouderkop"));
  const drempel = l.bedrag(metPartner ? "kgb.drempel.partners" : "kgb.drempel.alleenstaand");
  const afbouw = l.breuk("kgb.afbouwpercentage").times(max(NUL, toetsingsinkomen.minus(drempel)));
  return max(NUL, maximum.minus(afbouw));
}

export interface HuurtoeslagUitkomst {
  rekenhuur: Bedrag;
  basishuur: Bedrag;
  deelA: Bedrag;
  deelB: Bedrag;
  deelC: Bedrag;
  correctie: Bedrag;
  /** Voor afronding. */
  perMaand: Bedrag;
}

/**
 * Huurtoeslag per maand, volgens de Wet op de huurtoeslag zoals per
 * 1 januari 2026 en de 7 stappen van Dienst Toeslagen (Berekening
 * huurtoeslag 2026). Rekenhuur is de kale huur; servicekosten tellen sinds
 * 2026 niet meer mee. Alleen voor huishoudens met iemand van 21 jaar of ouder.
 */
export function huurtoeslag(l: Lezer, kaleHuurPerMaand: Bedrag, rekeninkomenJaar: Bedrag, personen: number): HuurtoeslagUitkomst {
  const meer = personen > 1;
  const basishuur = l.bedrag(meer ? "ht.basishuur.meerpersoons" : "ht.basishuur.eenpersoons");
  const kkg = l.bedrag("ht.kwaliteitskortingsgrens");
  const aftop = l.bedrag(personen >= 3 ? "ht.aftoppingsgrens.hoog" : "ht.aftoppingsgrens.laag");
  const maxHuur = l.bedrag("ht.maximale_huurgrens");
  const p1 = l.breuk("ht.subsidie.tot_kkg");
  const p2 = l.breuk("ht.subsidie.tot_aftopping");
  const p3 = l.breuk("ht.subsidie.boven_aftopping");
  const mip = l.bedrag(meer ? "ht.minimum_inkomensijkpunt.meerpersoons" : "ht.minimum_inkomensijkpunt.eenpersoons");
  const afbouw = l.breuk(meer ? "ht.afbouw.meerpersoons" : "ht.afbouw.eenpersoons");

  const rh = min(kaleHuurPerMaand, maxHuur);
  const nul = { rekenhuur: rh, basishuur, deelA: NUL, deelB: NUL, deelC: NUL, correctie: NUL, perMaand: NUL };
  if (rh.lte(basishuur)) return nul;
  const deelA = max(NUL, min(rh, kkg).minus(basishuur)).times(p1);
  const deelB = max(NUL, min(rh, aftop).minus(max(kkg, basishuur))).times(p2);
  const deelC = max(NUL, rh.minus(max(aftop, basishuur))).times(p3);
  const correctie = max(NUL, rekeninkomenJaar.minus(mip)).times(afbouw).div(12);
  return { rekenhuur: rh, basishuur, deelA, deelB, deelC, correctie, perMaand: max(NUL, deelA.plus(deelB).plus(deelC).minus(correctie)) };
}

export interface KotUitkomst {
  toeslagPerMaand: Bedrag;
  kostenPerMaand: Bedrag;
  perKind: { leeftijd: number; uren: number; percentage: Bedrag; toeslag: Bedrag; kosten: Bedrag }[];
}

const MAX_UURPRIJS: Record<Opvangsoort, string> = {
  dagopvang: "kot.max_uurprijs.dagopvang",
  bso: "kot.max_uurprijs.bso",
  gastouder: "kot.max_uurprijs.gastouder",
};

/** Kinderopvangtoeslag per maand. Het kind met de meeste uren is het 'eerste kind'. */
export function kinderopvangtoeslag(l: Lezer, toetsingsinkomen: Bedrag, kinderen: Kind[]): KotUitkomst {
  const metOpvang = kinderen.filter((k) => k.opvang && k.opvang.urenPerMaand > 0);
  if (metOpvang.length === 0) return { toeslagPerMaand: NUL, kostenPerMaand: NUL, perKind: [] };
  const tabel = l.kotTabel("kot.tabel");
  // De tabel gaat per hele euro ("van € 24.150 tot € 25.756"); kies de laatste rij waarvan 'vanaf' niet boven het inkomen ligt.
  const ti = heleEuros(max(NUL, toetsingsinkomen));
  const rij = [...tabel].reverse().find((r) => ti.gte(r.vanaf)) ?? tabel[0];
  const maxUren = l.aantal("kot.max_uren_per_maand");
  const gesorteerd = [...metOpvang].sort((a, b) => b.opvang!.urenPerMaand - a.opvang!.urenPerMaand);
  let toeslag = NUL;
  let kosten = NUL;
  const perKind = gesorteerd.map((k, i) => {
    const o = k.opvang!;
    const uren = D(o.urenPerMaand);
    const prijs = D(o.uurprijs);
    const maxPrijs = l.bedrag(MAX_UURPRIJS[o.soort]);
    const pct = i === 0 ? rij.eersteKind : rij.volgendKind;
    const t = min(uren, maxUren).times(min(prijs, maxPrijs)).times(pct);
    const c = uren.times(prijs);
    toeslag = toeslag.plus(t);
    kosten = kosten.plus(c);
    return { leeftijd: k.leeftijd, uren: o.urenPerMaand, percentage: pct, toeslag: t, kosten: c };
  });
  return { toeslagPerMaand: toeslag, kostenPerMaand: kosten, perKind };
}
