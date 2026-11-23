/**
 * Gedeelde delen voor alle regelingen: bronnen, de normen, het vermogen en het bruto inkomen voor de toeslagen.
 */
import { naarCitaat, type Citaat } from "../citaten.ts";
import { D, NUL, euro, type Bedrag } from "../geld.ts";
import { Lezer, OntbrekendeParameter, type RegelSet } from "../regels.ts";
import { brutoJaarMetAow, brutoMaandUitNetto, brutoUitNetto, brutoUitNettoMetAow } from "../modules/belasting.ts";
import type { CheckInvoer, CheckPersoon, Inkomenssoort, Kans, Uitslag, Vermogen, Woonsoort } from "./types.ts";

export const heeft = (p: CheckPersoon, s: Exclude<Inkomenssoort, "geen">) => p.inkomen[s] !== undefined;
export const totaalVan = (p: CheckPersoon) => Object.values(p.inkomen).reduce((t, x) => t + (x ?? 0), 0);

const LEIDEN = "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen";
export const URL = {
  sleutelpas: `${LEIDEN}/hulp-bij-kosten-schoolgaande-kinderen/`,
  sportCultuur: `${LEIDEN}/hulp-bij-kosten-sport-en-cultuur/`,
  gemeentepolis: `${LEIDEN}/collectieve-aanvullende-zorgverzekering/`,
  ov: `${LEIDEN}/gratis-openbaar-vervoer/`,
  iit: `${LEIDEN}/individuele-inkomenstoeslag`,
  alleenverdieners: `${LEIDEN}/tegemoetkoming-voor-alleenverdieners/`,
  studietoeslag: `${LEIDEN}/studietoeslag`,
  smi: "https://gemeente.leiden.nl/inwoners-en-ondernemers/zorg-en-onderwijs/kinderopvang/kinderopvang-bij-sociale-of-medische-problemen/",
  kinderbijslag: "https://www.svb.nl/nl/kinderbijslag/wat-is-kinderbijslag/wat-is-kinderbijslag",
  bijstand: "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/bijstand/",
  toeslagen: "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
};

/** Een waarde die afhangt van een parameter: zonder die parameter (nog niet bekend) geen waarde. */
export function probeer<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch (e) {
    if (e instanceof OntbrekendeParameter) return undefined;
    throw e;
  }
}

/** Een uitslag. Leeg als er geen uitslag is, of als een parameter nog niet bekend is. */
export type MogelijkeUitslag = Uitslag | undefined;

export const bron = (l: Lezer, id: string): Citaat[] => {
  const b = l.brontekst(id);
  return b ? [naarCitaat(b.citaat, b.bron, b.geldigVan)] : [];
};

export const heel = (b: Bedrag) => euro(b, true);

/**
 * Heeft iemand op de datum de AOW-leeftijd? De AOW-leeftijd hangt af van de geboortedatum (tabel van de SVB).
 * Wie voor 1 maart 1957 geboren is, had in 2026 de AOW-leeftijd al: dan altijd ja. Leeg als Leidengeldwijzer
 * het niet weet (geboren vanaf 1 oktober 1964: die AOW-leeftijd staat nog niet vast).
 */
export function heeftAowLeeftijd(regels: RegelSet, geboren: string, datum: string): boolean | undefined {
  const l = new Lezer(regels, datum);
  let maanden: number;
  try {
    if (geboren < "1957-03-01") return true;
    if (geboren <= "1960-12-31") maanden = l.aantal("aow.leeftijd.geboren_tot_1961").toNumber();
    else if (geboren <= "1964-09-30") maanden = l.aantal("aow.leeftijd.geboren_1961_tot_okt_1964").toNumber();
    else return undefined;
  } catch (e) {
    if (e instanceof OntbrekendeParameter) return undefined;
    throw e;
  }
  // De dag waarop iemand de AOW-leeftijd bereikt: de geboortedag, zoveel maanden later.
  const [j, m, d] = geboren.split("-").map(Number);
  const totaal = m - 1 + maanden;
  const jaar = j + Math.floor(totaal / 12);
  const maand = (totaal % 12) + 1;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${jaar}-${p(maand)}-${p(d)}` <= datum;
}

/** Leeftijd vanaf wanneer de gewone normen gelden. Voor 18, 19 en 20 jaar rekent Leidengeldwijzer nog niet. */
export const VOLWASSEN = 21;

/**
 * Het sociaal minimum per maand zonder vakantiegeld, voor iemand van 21 jaar of ouder: de bijstandsnorm van het huishouden.
 * Zoals in de tabellen van de gemeente. Leeg als Leidengeldwijzer het niet weet (een stel in een instelling).
 */
export function sociaalMinimum(l: Lezer, paar: boolean, wonen: Woonsoort, kostendelers = 0, aow = false): Bedrag | undefined {
  const zonderVakantiegeld = (norm: Bedrag) => norm.times(D(1).minus(l.breuk("pw.vakantietoeslag")));
  // Met de AOW-leeftijd: de normen van art. 22 Pw. Leidengeldwijzer kent de norm in een instelling dan niet (art. 23).
  if (wonen === "instelling") return paar || aow ? undefined : zonderVakantiegeld(l.bedrag("pw.norm.inrichting.alleenstaande"));
  const gehuwden = aow ? "pw.norm.aow.gehuwden" : "pw.norm.gehuwden";
  if (kostendelers > 0) {
    // Kostendelersnorm (art. 22a Pw): per persoon (40% + A × 30%) / A van de gehuwdennorm.
    // Met de AOW-leeftijd is dat de norm van art. 22 b (of c, die even hoog is).
    const a = D(kostendelers + (paar ? 2 : 1));
    const factor = l.breuk("pw.kostendeler.basis").plus(a.times(l.breuk("pw.kostendeler.per_persoon"))).div(a);
    const perPersoon = zonderVakantiegeld(factor.times(l.bedrag(gehuwden)));
    return paar ? perPersoon.times(2) : perPersoon;
  }
  return zonderVakantiegeld(l.bedrag(paar ? gehuwden : aow ? "pw.norm.aow.alleenstaande" : "pw.norm.alleenstaande"));
}

/**
 * Het vermogen dat meetelt.
 * - Bijstand (art. 34 Pw): alles, behalve één auto of motor tot € 4.500 (Leiden, Beleidsregels Vermogen 2026, art. 2.1).
 * - Toeslagen: zoals bij de belastingaangifte, de auto telt niet mee (Dienst Toeslagen).
 */
export function telbaarVermogen(l: Lezer, v: Vermogen, voor: "bijstand" | "toeslagen"): Bedrag {
  // Spullen voor eigen gebruik tellen niet mee voor de toeslagen, net als bij de belastingaangifte.
  const basis = D(v.betaalrekening).plus(v.spaarrekening).plus(v.beleggingen).minus(v.schulden);
  if (voor === "toeslagen") return basis;
  const voertuigen = v.voertuigen.reduce((s, x) => s.plus(x), NUL);
  const hoogste = v.voertuigen.reduce((m, x) => Math.max(m, x), 0);
  const vrij = D(Math.min(hoogste, l.bedrag("leiden.vermogen.voertuig_vrij").toNumber()));
  return basis.plus(v.spullen).plus(voertuigen).minus(vrij);
}

/** Vermogen tegen een grens. Bij een koopwoning telt een deel van de woning mee voor de bijstand: dan misschien. */
export function vermogenToets(l: Lezer, invoer: CheckInvoer, grensId: string): { kans: Kans; grens: Bedrag; zin: string } {
  const grens = l.bedrag(grensId);
  const bijstand = grensId.startsWith("pw.");
  const vermogen = telbaarVermogen(l, invoer.vermogen, bijstand ? "bijstand" : "toeslagen");
  if (vermogen.gt(grens)) return { kans: "nee", grens, zin: "" };
  if (invoer.wonen === "koop" && bijstand)
    return { kans: "misschien", grens, zin: `Uw geld en bezit zijn niet meer dan ${heel(grens)}. De gemeente kijkt ook naar de waarde van uw huis.` };
  return { kans: "ja", grens, zin: `Uw geld en bezit zijn niet meer dan ${heel(grens)}.` };
}

/** Toetsingsinkomen per jaar (bruto), afgeleid uit het netto inkomen. Undefined als Leidengeldwijzer het niet kan afleiden. */
export function toetsingsinkomen(l: Lezer, invoer: CheckInvoer, personen: CheckPersoon[]): Bedrag | undefined {
  const paar = personen.length > 1;
  if (invoer.bijstand && personen.some((p) => p.aow)) {
    // AIO-aanvulling: samen met de AOW komt het inkomen op de norm van art. 22 Pw (met vakantietoeslag).
    // Bij een paar half om half. Wie de AOW-leeftijd heeft, betaalt belasting volgens de tarieven voor AOW-gerechtigden.
    const norm = l.bedrag(paar ? "pw.norm.aow.gehuwden" : "pw.norm.aow.alleenstaande").times(12);
    const deel = paar ? norm.div(2) : norm;
    return personen.reduce((t, p) => t.plus(p.aow ? brutoUitNettoMetAow(l, deel, !paar, !!p.geborenVoor1946) : brutoUitNetto(l, deel)), NUL);
  }
  if (invoer.bijstand) {
    // Zoals Leidenwerkt: de bijstand (met vakantietoeslag) als uitkering, bij een paar half om half.
    const norm = l.bedrag(personen.length > 1 ? "pw.norm.gehuwden" : "pw.norm.alleenstaande").times(12);
    return personen.length > 1 ? brutoUitNetto(l, norm.div(2)).times(2) : brutoUitNetto(l, norm);
  }
  // Per persoon. Loon en uitkering: bruto terugrekenen uit netto, met vakantiegeld. Partneralimentatie komt bruto
  // binnen en telt zo mee. Kinderalimentatie en studiefinanciering tellen niet mee voor de toeslagen.
  // Twee soorten met loonheffing (loon en uitkering), een eigen bedrijf of ander inkomen: dat rekent Leidengeldwijzer niet uit.
  const vg = l.breuk("wml.vakantiebijslag");
  let totaal = NUL;
  for (const p of personen) {
    if (p.aow) {
      // Met de AOW-leeftijd: AOW en pensioen, met de belasting en de bijdrage Zvw voor AOW-gerechtigden.
      // Loon, een uitkering van UWV, een eigen bedrijf of ander inkomen daarnaast: dat rekent Leidengeldwijzer niet uit.
      if ((["loon", "uwv", "bedrijf", "ander", "studiefinanciering"] as const).some((s) => heeft(p, s))) return undefined;
      totaal = totaal.plus(brutoJaarMetAow(l, D(p.inkomen.aow ?? 0), D(p.inkomen.pensioen ?? 0), !paar, !!p.geborenVoor1946));
      totaal = totaal.plus(D(p.inkomen.partneralimentatie ?? 0).times(12));
      continue;
    }
    if (heeft(p, "bedrijf") || heeft(p, "ander") || heeft(p, "aow") || heeft(p, "pensioen")) return undefined;
    if (heeft(p, "loon") && heeft(p, "uwv")) return undefined;
    const loon = p.inkomen.loon ?? 0;
    const uwv = p.inkomen.uwv ?? 0;
    if (loon > 0) totaal = totaal.plus(brutoMaandUitNetto(l, D(loon), vg).times(12).times(vg.plus(1)));
    if (uwv > 0) totaal = totaal.plus(brutoUitNetto(l, D(uwv).times(12).times(vg.plus(1))));
    totaal = totaal.plus(D(p.inkomen.partneralimentatie ?? 0).times(12));
  }
  return totaal;
}
