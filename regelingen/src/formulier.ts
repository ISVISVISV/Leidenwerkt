/**
 * Het formulier van de check: wat iemand invult, de controle per stap en de vertaling naar de rekenkern.
 * Er wordt niets bewaard: alles staat alleen in het geheugen van de pagina.
 */
import { Lezer, naarCitaat, standaardRegels, type CheckInvoer, type CheckPersoon, type Citaat, type Inkomenssoort, type Woonsoort } from "@leidenwerkt/engine";
import { getal, isoDatum, leeftijdOp, type Geboortedatum } from "@leidenwerkt/ui/invoer";

export type JaNee = "" | "ja" | "nee";

export interface Formulier {
  leiden: JaNee;
  geboren: Geboortedatum;
  partner: JaNee;
  partnerGeboren: Geboortedatum;
  heeftKinderen: JaNee;
  kinderen: Geboortedatum[];
  kinderbijslag: JaNee;
  bijstand: JaNee;
  soorten: Inkomenssoort[];
  netto: string;
  partnerSoorten: Inkomenssoort[];
  partnerNetto: string;
  langLaag: "" | "ja" | "nee" | "onbekend";
  studieMedisch: JaNee;
  woont: "" | Woonsoort;
  kaleHuur: string;
  andereBewoners: JaNee;
  vermogen: string;
  vermogenOnbekend: boolean;
}

export const leegFormulier: Formulier = {
  leiden: "",
  geboren: "",
  partner: "",
  partnerGeboren: "",
  heeftKinderen: "",
  kinderen: [""],
  kinderbijslag: "",
  bijstand: "",
  soorten: [],
  netto: "",
  partnerSoorten: [],
  partnerNetto: "",
  langLaag: "",
  studieMedisch: "",
  woont: "",
  kaleHuur: "",
  andereBewoners: "",
  vermogen: "",
  vermogenOnbekend: false,
};

let vasteDatum: string | undefined;
/** Alleen voor tests: een vaste datum. */
export function zetVandaag(datum: string | undefined) {
  vasteDatum = datum;
}
export function vandaag(): string {
  if (vasteDatum) return vasteDatum;
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const leeftijd = (g: Geboortedatum) => leeftijdOp(g, vandaag());
const metPartner = (f: Formulier) => f.partner === "ja";
const kinderen = (f: Formulier) => (f.heeftKinderen === "ja" ? f.kinderen : []);
export const minderjarigen = (f: Formulier) => kinderen(f).filter((k) => (leeftijd(k) ?? 99) < 18).length;

/** Vragen die alleen in bepaalde situaties komen. */
export const vraagInkomen = (f: Formulier) => f.bijstand === "nee";
export const vraagNetto = (s: Inkomenssoort[]) => s.length > 0 && !s.includes("geen");
export const vraagLangLaag = (f: Formulier) => (leeftijd(f.geboren) ?? 0) >= 23 && !f.soorten.includes("studiefinanciering");
export const vraagStudie = (f: Formulier) => vraagInkomen(f) && f.soorten.includes("studiefinanciering");
export const vraagHuur = (f: Formulier) => f.woont === "huur";

export type Fouten = Partial<Record<string, string>>;

export function controleer(f: Formulier, stap: number): Fouten {
  const fouten: Fouten = {};
  const kies = "Kies een antwoord.";
  const bedrag = (veld: keyof Formulier, tekst: string, maxi: number, melding: string) => {
    const n = getal(tekst);
    if (n === undefined) fouten[veld] = "Vul dit in.";
    else if (Number.isNaN(n) || n < 0 || n > maxi) fouten[veld] = melding;
  };
  const datum = (veld: string, g: Geboortedatum, min: number, maxi: number, melding: string, kind = false) => {
    if (!g.trim()) fouten[veld] = "Vul dit in.";
    else if (!isoDatum(g)) fouten[veld] = `Vul een datum in die bestaat, met dag, maand en jaar. Bijvoorbeeld ${kind ? "14-03-2018" : "14-03-1990"}.`;
    else if (isoDatum(g)! > vandaag()) fouten[veld] = "Deze datum ligt in de toekomst. Vul de geboortedatum in.";
    else {
      const l = leeftijd(g)!;
      if (l < min || l > maxi) fouten[veld] = melding;
    }
  };
  if (stap === 1) {
    if (!f.leiden) fouten.leiden = kies;
    else if (f.leiden === "nee") fouten.leiden = "Deze check is alleen voor inwoners van de gemeente Leiden.";
    datum("geboren", f.geboren, 18, 66, "Deze check werkt voor mensen van 18 jaar tot de AOW-leeftijd.");
    if (!f.partner) fouten.partner = kies;
    if (metPartner(f)) datum("partnerGeboren", f.partnerGeboren, 18, 66, "Uw partner moet 18 jaar of ouder zijn en jonger dan de AOW-leeftijd.");
    if (!f.heeftKinderen) fouten.heeftKinderen = kies;
    kinderen(f).forEach((k, i) => datum(`kind${i}`, k, 0, 30, "Vul de geboortedatum van uw kind in.", true));
    if (minderjarigen(f) > 0 && !f.kinderbijslag) fouten.kinderbijslag = kies;
  }
  if (stap === 2) {
    if (!f.bijstand) fouten.bijstand = kies;
    if (vraagInkomen(f)) {
      if (f.soorten.length === 0) fouten.soorten = "Kies minstens één antwoord.";
      if (vraagNetto(f.soorten)) bedrag("netto", f.netto, 20000, "Vul een bedrag per maand in, bijvoorbeeld 1.400.");
      if (metPartner(f)) {
        if (f.partnerSoorten.length === 0) fouten.partnerSoorten = "Kies minstens één antwoord.";
        if (vraagNetto(f.partnerSoorten)) bedrag("partnerNetto", f.partnerNetto, 20000, "Vul een bedrag per maand in, bijvoorbeeld 1.400.");
      }
    }
    if (vraagLangLaag(f) && !f.langLaag) fouten.langLaag = kies;
    if (vraagStudie(f) && !f.studieMedisch) fouten.studieMedisch = kies;
  }
  if (stap === 3) {
    if (!f.woont) fouten.woont = kies;
    if (vraagHuur(f)) {
      const n = getal(f.kaleHuur);
      if (n === undefined) fouten.kaleHuur = "Vul dit in.";
      else if (Number.isNaN(n) || n < 1 || n > 3000) fouten.kaleHuur = "Vul de kale huur per maand in. Die staat in uw huurcontract of op het overzicht van de verhuurder.";
    }
    if (!f.andereBewoners) fouten.andereBewoners = kies;
    if (!f.vermogenOnbekend) bedrag("vermogen", f.vermogen, 10_000_000, "Vul een bedrag in, bijvoorbeeld 2.500. Geen geld of bezit? Vul 0 in.");
  }
  return fouten;
}

const persoon = (geboren: Geboortedatum, soorten: Inkomenssoort[], netto: string): CheckPersoon => ({
  leeftijd: leeftijd(geboren) ?? 0,
  soorten,
  nettoPerMaand: vraagNetto(soorten) ? (getal(netto) ?? 0) : 0,
});

/** Het ingevulde formulier als invoer voor de rekenkern. Alleen aanroepen als alle stappen goed zijn. */
export function naarInvoer(f: Formulier): CheckInvoer {
  const bijstand = f.bijstand === "ja";
  return {
    datum: vandaag(),
    aanvrager: persoon(f.geboren, bijstand ? ["geen"] : f.soorten, f.netto),
    partner: metPartner(f) ? persoon(f.partnerGeboren, bijstand ? ["geen"] : f.partnerSoorten, f.partnerNetto) : undefined,
    kinderen: kinderen(f).map((k) => ({ leeftijd: leeftijd(k) ?? 0 })),
    kinderbijslag: minderjarigen(f) > 0 ? f.kinderbijslag === "ja" : undefined,
    bijstand,
    langLaagInkomen: vraagLangLaag(f) ? (f.langLaag || undefined) : undefined,
    studieMedisch: vraagStudie(f) ? (f.studieMedisch || undefined) : undefined,
    wonen: f.woont || "huur",
    kaleHuurPerMaand: vraagHuur(f) ? getal(f.kaleHuur) : undefined,
    andereBewoners: f.andereBewoners === "ja",
    vermogen: f.vermogenOnbekend ? undefined : (getal(f.vermogen) ?? 0),
  };
}

/** De letterlijke brontekst bij een parameter uit de regeldata, voor vandaag. */
export function bronVan(id: string): Citaat | undefined {
  const b = new Lezer(standaardRegels, vandaag()).brontekst(id);
  return b ? naarCitaat(b.citaat, b.bron, b.geldigVan) : undefined;
}
