import { Lezer, standaardRegels, type Invoer, type Kind, type Leefvorm, type Opvangsoort } from "@leidenwerkt/engine";

/** Hoogste uurprijs waarover kinderopvangtoeslag wordt gegeven, voor de rekendatum. */
export function maxUurprijs(l: Lezer, soort: Opvangsoort): number {
  try {
    return Number(l.bedrag(`kot.max_uurprijs.${soort}`).toFixed(2));
  } catch {
    return 0;
  }
}

export type LoonPer = "maand" | "netto" | "vierweken" | "uur";
export type Woonsituatie = "huur" | "koop" | "inwonend" | "dakloos" | "instelling";

export interface KindVeld {
  leeftijd: string;
  opvang: boolean;
  soort: Opvangsoort;
  uren: string;
  uurprijs: string;
}

export interface Formulier {
  leefvorm: Leefvorm;
  leeftijd: string;
  partnerLeeftijd: string;
  partnerWerkt: boolean;
  partnerBruto: string;
  kinderen: KindVeld[];
  kostendelers: string;
  huisgenotenInkomen: string;
  /** Woonsituatie. "instelling": de rekenhulp kan dit niet berekenen. */
  woont: Woonsituatie;
  /** Eigen voordeur, keuken, wc en douche of bad (alleen bij huur). */
  zelfstandig: boolean;
  /** Betaalt zelf gas, licht en water (alleen zonder woonkosten). */
  woonlasten: boolean;
  kaleHuur: string;
  /** Vanaf 2027: welke vrijlating de gebruiker op 31 december 2026 al had. */
  overgang: "" | "n" | "r";
  werktNu: boolean;
  medisch: boolean;
  nuPer: LoonPer;
  nuLoon: string;
  nuUren: string;
  per: LoonPer;
  loon: string;
  uren: string;
  reiskosten: string;
  vergoeding: string;
  overigeKosten: string;
}

export const leegFormulier: Formulier = {
  leefvorm: "alleenstaande",
  leeftijd: "",
  partnerLeeftijd: "",
  partnerWerkt: false,
  partnerBruto: "",
  kinderen: [],
  kostendelers: "0",
  huisgenotenInkomen: "",
  woont: "huur",
  zelfstandig: true,
  woonlasten: false,
  kaleHuur: "",
  overgang: "",
  werktNu: false,
  medisch: false,
  nuPer: "maand",
  nuLoon: "",
  nuUren: "",
  per: "maand",
  loon: "",
  uren: "",
  reiskosten: "",
  vergoeding: "",
  overigeKosten: "",
};

export const nieuwKind = (): KindVeld => ({ leeftijd: "", opvang: false, soort: "dagopvang", uren: "", uurprijs: "" });

/** Leest "15,50", "15.50" of "1.250,00" als getal; leeg geeft undefined. */
export function getal(tekst: string): number | undefined {
  const schoon = tekst.trim().replace(/\s|€/g, "");
  if (schoon === "") return undefined;
  let genormaliseerd: string;
  if (schoon.includes(",")) genormaliseerd = schoon.replace(/\./g, "").replace(",", "."); // 1.250,50
  else if (/^\d{1,3}(\.\d{3})+$/.test(schoon)) genormaliseerd = schoon.replace(/\./g, ""); // 1.250
  else genormaliseerd = schoon; // 15.50 of 1250
  const n = Number(genormaliseerd);
  return Number.isFinite(n) ? n : NaN;
}

export function vandaag(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export type Fouten = Partial<Record<string, string>>;

export function controleer(f: Formulier, stap: number): Fouten {
  const fouten: Fouten = {};
  const moet = (veld: keyof Formulier | string, tekst: string, min: number, maxi: number, melding: string, verplicht = true) => {
    const n = getal(tekst);
    if (n === undefined) {
      if (verplicht) fouten[veld] = "Vul dit in.";
    } else if (Number.isNaN(n) || n < min || n > maxi) fouten[veld] = melding;
  };
  if (stap === 1) {
    moet("leeftijd", f.leeftijd, 21, 66, "Deze rekenhulp werkt voor leeftijden van 21 tot 67 jaar.");
    if (f.leefvorm === "paar") moet("partnerLeeftijd", f.partnerLeeftijd, 21, 66, "Uw partner moet 21 tot 67 jaar zijn.");
    if (f.leefvorm === "paar" && f.partnerWerkt) moet("partnerBruto", f.partnerBruto, 1, 20000, "Vul een bruto maandloon in.");
    if (f.leefvorm === "alleenstaande_ouder" && f.kinderen.length === 0) fouten.kinderen = "Voeg minstens één kind toe.";
    f.kinderen.forEach((k, i) => {
      moet(`kind${i}`, k.leeftijd, 0, 26, "Vul een leeftijd in van 0 tot en met 26 jaar. Een kind van 27 jaar of ouder telt u hieronder mee als huisgenoot.");
      if (k.opvang) {
        moet(`kind${i}uren`, k.uren, 1, 300, "Vul het aantal uren per maand in.");
        moet(`kind${i}prijs`, k.uurprijs, 1, 30, "Vul een prijs per uur in, bijvoorbeeld 11,50. Weet u het niet? Laat het vak dan leeg.", false);
      }
    });
    moet("kostendelers", f.kostendelers, 0, 10, "Vul een aantal van 0 tot 10 in.");
  }
  if (stap === 2 && f.woont === "instelling") fouten.woont = "Voor mensen die in een instelling wonen kan deze rekenhulp nog niet rekenen.";
  if (stap === 2 && f.woont === "huur" && (getal(f.kostendelers) ?? 0) > 0) {
    moet("huisgenotenInkomen", f.huisgenotenInkomen, 0, 500000, "Vul een bedrag per jaar in, bijvoorbeeld 25.000. Geen inkomen? Vul 0 in.");
  }
  if (stap === 2 && f.woont === "huur") {
    moet("kaleHuur", f.kaleHuur, 1, 3000, "Vul de kale huur per maand in. Die staat in uw huurcontract of op het overzicht van de verhuurder.");
  }
  if (stap === 3) {
    const loonGrens = (per: LoonPer): [number, number, string] =>
      per === "uur" ? [1, 100, "Vul een bruto uurloon in, bijvoorbeeld 15,00."] : [50, 15000, "Vul een bruto bedrag in, bijvoorbeeld 1.800."];
    if (f.werktNu) {
      moet("nuLoon", f.nuLoon, ...loonGrens(f.nuPer));
      moet("nuUren", f.nuUren, 1, 60, "Vul het aantal uren per week in.");
    }
    moet("loon", f.loon, ...loonGrens(f.per));
    moet("uren", f.uren, 1, 60, "Vul het aantal uren per week in.");
    for (const v of ["reiskosten", "vergoeding", "overigeKosten"] as const) moet(v, f[v], 0, 2000, "Vul een bedrag in.", false);
  }
  return fouten;
}

export function naarInvoer(f: Formulier, opties: { uren?: number; fase: Invoer["vrijlatingFase"]; datum: string }): Invoer {
  const l = new Lezer(standaardRegels, opties.datum);
  const kinderen: Kind[] = f.kinderen.map((k) => {
    const prijs = getal(k.uurprijs);
    const geschat = prijs === undefined;
    return {
      leeftijd: getal(k.leeftijd) ?? 0,
      opvang: k.opvang
        ? { soort: k.soort, urenPerMaand: getal(k.uren) ?? 0, uurprijs: geschat ? maxUurprijs(l, k.soort) : prijs, uurprijsGeschat: geschat || undefined }
        : undefined,
    };
  });
  const paar = f.leefvorm === "paar";
  return {
    datum: opties.datum,
    gemeente: "leiden",
    leefvorm: f.leefvorm,
    leeftijd: getal(f.leeftijd) ?? 0,
    partner: paar
      ? { leeftijd: getal(f.partnerLeeftijd) ?? 0, werk: f.partnerWerkt ? { brutoMaandloon: getal(f.partnerBruto) ?? 0 } : undefined }
      : undefined,
    kinderen,
    kostendelers: getal(f.kostendelers) ?? 0,
    huisgenotenInkomenJaar: (getal(f.kostendelers) ?? 0) > 0 ? getal(f.huisgenotenInkomen) : undefined,
    wonen:
      f.woont === "huur"
        ? { soort: "huur", kaleHuurPerMaand: getal(f.kaleHuur), zelfstandig: f.zelfstandig }
        : f.woont === "inwonend" || f.woont === "dakloos"
          ? { soort: "geen_woonkosten", dakloos: f.woont === "dakloos", betaaltWoonlasten: f.woonlasten }
          : { soort: "anders" },
    huidigWerk: f.werktNu ? loonWerk(f.nuPer, getal(f.nuLoon) ?? 0, getal(f.nuUren) ?? 0) : undefined,
    nieuwWerk: {
      ...loonWerk(f.per, getal(f.loon) ?? 0, getal(f.uren) ?? 0, opties.uren),
      reiskostenPerMaand: getal(f.reiskosten),
      reiskostenvergoedingPerMaand: getal(f.vergoeding),
      overigeKostenPerMaand: getal(f.overigeKosten),
    },
    vrijlatingFase: opties.fase,
    // De vrijlating hoort bij de persoon, niet bij een baan: wie al werkt, zit nu in dezelfde periode.
    huidigeVrijlating: f.werktNu ? opties.fase : "geen",
    overgang2027: f.werktNu && f.overgang ? f.overgang : undefined,
    medischUrenbeperkt: f.medisch || undefined,
  };
}

/**
 * Zet het ingevulde loon om naar werk voor de engine. Bij een maand- of
 * vierwekenloon schaalt het loon mee als de gebruiker met de urenschuif
 * een ander aantal uren kiest.
 */
function loonWerk(per: LoonPer, bedrag: number, uren: number, andereUren?: number) {
  const nieuweUren = andereUren ?? uren;
  if (per === "uur") return { brutoUurloon: bedrag, urenPerWeek: nieuweUren };
  const urenFactor = uren > 0 ? nieuweUren / uren : 1;
  if (per === "vierweken") return { brutoVierwekenloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
  if (per === "netto") return { nettoMaandloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
  return { brutoMaandloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
}

/** Laat alleen tekens door die in een getal horen; letters en andere tekens verdwijnen meteen. */
export function alleenCijfers(tekst: string, soort: "geheel" | "getal"): string {
  return soort === "geheel" ? tekst.replace(/[^0-9]/g, "") : tekst.replace(/[^0-9.,]/g, "");
}
