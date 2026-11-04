import type { Invoer, Kind, Leefvorm, Opvangsoort } from "@leidenwerkt/engine";

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
  huurt: boolean;
  kaleHuur: string;
  servicekosten: string;
  werktNu: boolean;
  nuUurloon: string;
  nuUren: string;
  uurloon: string;
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
  huurt: true,
  kaleHuur: "",
  servicekosten: "",
  werktNu: false,
  nuUurloon: "",
  nuUren: "",
  uurloon: "",
  uren: "24",
  reiskosten: "",
  vergoeding: "",
  overigeKosten: "",
};

export const nieuwKind = (): KindVeld => ({ leeftijd: "", opvang: false, soort: "dagopvang", uren: "", uurprijs: "" });

/** Leest "15,50", "15.50" of "1.250,00" als getal; leeg geeft undefined. */
export function getal(tekst: string): number | undefined {
  const schoon = tekst.trim().replace(/\s|€/g, "");
  if (schoon === "") return undefined;
  const genormaliseerd = /,\d{1,2}$/.test(schoon) ? schoon.replace(/\./g, "").replace(",", ".") : schoon.replace(/,/g, "");
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
      moet(`kind${i}`, k.leeftijd, 0, 30, "Vul een leeftijd in van 0 tot 30 jaar.");
      if (k.opvang) {
        moet(`kind${i}uren`, k.uren, 1, 300, "Vul het aantal uren per maand in.");
        moet(`kind${i}prijs`, k.uurprijs, 1, 30, "Vul de prijs per uur in.");
      }
    });
    moet("kostendelers", f.kostendelers, 0, 10, "Vul een aantal van 0 tot 10 in.");
  }
  if (stap === 2 && f.huurt) {
    moet("kaleHuur", f.kaleHuur, 1, 3000, "Vul de kale huur per maand in.", false);
    moet("servicekosten", f.servicekosten, 0, 500, "Vul een bedrag van 0 tot 500 in.", false);
  }
  if (stap === 3) {
    if (f.werktNu) {
      moet("nuUurloon", f.nuUurloon, 1, 100, "Vul een bruto uurloon in.");
      moet("nuUren", f.nuUren, 1, 60, "Vul het aantal uren per week in.");
    }
    moet("uurloon", f.uurloon, 1, 100, "Vul een bruto uurloon in, bijvoorbeeld 15,00.");
    moet("uren", f.uren, 1, 60, "Vul het aantal uren per week in.");
    for (const v of ["reiskosten", "vergoeding", "overigeKosten"] as const) moet(v, f[v], 0, 2000, "Vul een bedrag in.", false);
  }
  return fouten;
}

export function naarInvoer(f: Formulier, opties: { uren?: number; fase: Invoer["vrijlatingFase"]; datum: string }): Invoer {
  const kinderen: Kind[] = f.kinderen.map((k) => ({
    leeftijd: getal(k.leeftijd) ?? 0,
    opvang: k.opvang ? { soort: k.soort, urenPerMaand: getal(k.uren) ?? 0, uurprijs: getal(k.uurprijs) ?? 0 } : undefined,
  }));
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
    wonen: f.huurt
      ? { soort: "huur", kaleHuurPerMaand: getal(f.kaleHuur), servicekostenPerMaand: getal(f.servicekosten) }
      : { soort: "anders" },
    huidigWerk: f.werktNu ? { brutoUurloon: getal(f.nuUurloon) ?? 0, urenPerWeek: getal(f.nuUren) ?? 0 } : undefined,
    nieuwWerk: {
      brutoUurloon: getal(f.uurloon) ?? 0,
      urenPerWeek: opties.uren ?? getal(f.uren) ?? 0,
      reiskostenPerMaand: getal(f.reiskosten),
      reiskostenvergoedingPerMaand: getal(f.vergoeding),
      overigeKostenPerMaand: getal(f.overigeKosten),
    },
    vrijlatingFase: opties.fase,
    huidigeVrijlating: "geen",
  };
}
