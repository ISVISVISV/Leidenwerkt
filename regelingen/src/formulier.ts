/**
 * Het formulier van Leidenrekent: wat iemand invult, de controle per stap en de vertaling naar de rekenkern.
 * Er wordt niets bewaard: alles staat alleen in het geheugen van de pagina.
 *
 * Stappen: 1 Uw huishouden (met wonen), 2 Uw inkomen, 3 Geld en bezit, 4 Overzicht.
 */
import {
  Lezer,
  naarCitaat,
  standaardRegels,
  type CheckInvoer,
  type CheckPersoon,
  type Citaat,
  type Inkomenssoort,
  type Uitkeringssoort,
  type Woonsoort,
} from "@leidenwerkt/engine";
import { getal, isoDatum, leeftijdOp, type Geboortedatum } from "@leidenwerkt/ui/invoer";

export type JaNee = "" | "ja" | "nee";
export type Bezit = "betaal" | "spaar" | "voertuig" | "beleggingen" | "spullen" | "schuld" | "niets";
/** Een soort inkomen met een bedrag (alles behalve "geen"). */
export type Bedragsoort = Exclude<Inkomenssoort, "geen">;

/** Het inkomen van één persoon: welke soorten, het bedrag per soort, en welke uitkering. */
export interface InkomenVelden {
  soorten: Inkomenssoort[];
  bedragen: Partial<Record<Bedragsoort, string>>;
  uitkering: "" | Uitkeringssoort;
}

export interface Formulier {
  leiden: JaNee;
  geboren: Geboortedatum;
  partner: JaNee;
  partnerGeboren: Geboortedatum;
  heeftKinderen: JaNee;
  kinderen: Geboortedatum[];
  kinderbijslag: JaNee;
  woont: "" | Woonsoort;
  kaleHuur: string;
  andereBewoners: JaNee;
  bijstand: JaNee;
  inkomen: InkomenVelden;
  partnerInkomen: InkomenVelden;
  langLaag: "" | "ja" | "nee" | "onbekend";
  studieMedisch: JaNee;
  /** Welke soorten geld en bezit iemand heeft. */
  bezit: Bezit[];
  betaalrekening: string;
  spaarrekening: string;
  /** Waarde per auto, motor of scooter. */
  voertuigen: string[];
  beleggingen: string;
  spullen: string;
  schulden: string;
}

const leegInkomen: InkomenVelden = { soorten: [], bedragen: {}, uitkering: "" };

export const leegFormulier: Formulier = {
  leiden: "",
  geboren: "",
  partner: "",
  partnerGeboren: "",
  heeftKinderen: "",
  kinderen: [""],
  kinderbijslag: "",
  woont: "",
  kaleHuur: "",
  andereBewoners: "",
  bijstand: "",
  inkomen: leegInkomen,
  partnerInkomen: leegInkomen,
  langLaag: "",
  studieMedisch: "",
  bezit: [],
  betaalrekening: "",
  spaarrekening: "",
  voertuigen: [""],
  beleggingen: "",
  spullen: "",
  schulden: "",
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

/** Het id van het bedragveld, voor de aanvrager of de partner. */
export const bedragId = (partner: boolean, s: Bedragsoort) => `${partner ? "partnerInkomen" : "inkomen"}_${s}`;
export const uitkeringId = (partner: boolean) => (partner ? "partnerUitkering" : "uitkering");
export const soortenId = (partner: boolean) => (partner ? "partnerSoorten" : "soorten");

/** Vragen die alleen in bepaalde situaties komen. */
export const vraagInkomen = (f: Formulier) => f.bijstand === "nee";
export const bedragSoorten = (v: InkomenVelden): Bedragsoort[] => v.soorten.filter((s): s is Bedragsoort => s !== "geen");
const studeert = (f: Formulier) => vraagInkomen(f) && f.inkomen.soorten.includes("studiefinanciering");
export const vraagLangLaag = (f: Formulier) => (leeftijd(f.geboren) ?? 0) >= 23 && !studeert(f);
export const vraagStudie = studeert;
export const vraagHuur = (f: Formulier) => f.woont === "huur";

export type Fouten = Partial<Record<string, string>>;

export function controleer(f: Formulier, stap: number): Fouten {
  const fouten: Fouten = {};
  const kies = "Kies een antwoord.";
  const bedrag = (veld: string, tekst: string | undefined, maxi: number, melding: string) => {
    const n = getal(tekst ?? "");
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
  const inkomen = (v: InkomenVelden, partner: boolean) => {
    if (v.soorten.length === 0) fouten[soortenId(partner)] = "Kies minstens één antwoord.";
    if (v.soorten.includes("uwv") && !v.uitkering) fouten[uitkeringId(partner)] = kies;
    for (const s of bedragSoorten(v)) bedrag(bedragId(partner, s), v.bedragen[s], 20000, "Vul een bedrag per maand in, bijvoorbeeld 1.400.");
  };
  if (stap === 1) {
    if (!f.leiden) fouten.leiden = kies;
    else if (f.leiden === "nee") fouten.leiden = "Leidenrekent is alleen voor inwoners van de gemeente Leiden.";
    datum("geboren", f.geboren, 18, 66, "Leidenrekent werkt voor mensen van 18 jaar tot de AOW-leeftijd.");
    if (!f.partner) fouten.partner = kies;
    if (metPartner(f)) datum("partnerGeboren", f.partnerGeboren, 18, 66, "Uw partner moet 18 jaar of ouder zijn en jonger dan de AOW-leeftijd.");
    if (!f.heeftKinderen) fouten.heeftKinderen = kies;
    kinderen(f).forEach((k, i) => datum(`kind${i}`, k, 0, 30, "Vul de geboortedatum van uw kind in.", true));
    if (minderjarigen(f) > 0 && !f.kinderbijslag) fouten.kinderbijslag = kies;
    if (!f.woont) fouten.woont = kies;
    if (vraagHuur(f)) {
      const n = getal(f.kaleHuur);
      if (n === undefined) fouten.kaleHuur = "Vul dit in.";
      else if (Number.isNaN(n) || n < 1 || n > 3000) fouten.kaleHuur = "Vul de kale huur per maand in, bijvoorbeeld 750.";
    }
    if (!f.andereBewoners) fouten.andereBewoners = kies;
  }
  if (stap === 2) {
    if (!f.bijstand) fouten.bijstand = kies;
    if (vraagInkomen(f)) {
      inkomen(f.inkomen, false);
      if (metPartner(f)) inkomen(f.partnerInkomen, true);
    }
    if (vraagLangLaag(f) && !f.langLaag) fouten.langLaag = kies;
    if (vraagStudie(f) && !f.studieMedisch) fouten.studieMedisch = kies;
  }
  if (stap === 3) {
    if (f.bezit.length === 0) fouten.bezit = "Kies minstens één antwoord.";
    const melding = "Vul een bedrag in, bijvoorbeeld 2.500.";
    if (f.bezit.includes("betaal")) bedrag("betaalrekening", f.betaalrekening, 10_000_000, melding);
    if (f.bezit.includes("spaar")) bedrag("spaarrekening", f.spaarrekening, 10_000_000, melding);
    if (f.bezit.includes("voertuig")) f.voertuigen.forEach((v, i) => bedrag(`voertuig${i}`, v, 10_000_000, melding));
    if (f.bezit.includes("beleggingen")) bedrag("beleggingen", f.beleggingen, 10_000_000, melding);
    if (f.bezit.includes("spullen")) bedrag("spullen", f.spullen, 10_000_000, melding);
    if (f.bezit.includes("schuld")) bedrag("schulden", f.schulden, 10_000_000, melding);
  }
  return fouten;
}

const persoon = (geboren: Geboortedatum, v: InkomenVelden | undefined): CheckPersoon => ({
  leeftijd: leeftijd(geboren) ?? 0,
  inkomen: v ? Object.fromEntries(bedragSoorten(v).map((s) => [s, getal(v.bedragen[s] ?? "") ?? 0])) : {},
  uitkering: v?.soorten.includes("uwv") && v.uitkering ? v.uitkering : undefined,
});

/** Het ingevulde formulier als invoer voor de rekenkern. Alleen aanroepen als alle stappen goed zijn. */
export function naarInvoer(f: Formulier): CheckInvoer {
  const bijstand = f.bijstand === "ja";
  const som = (b: Bezit, t: string) => (f.bezit.includes(b) ? (getal(t) ?? 0) : 0);
  return {
    datum: vandaag(),
    aanvrager: persoon(f.geboren, bijstand ? undefined : f.inkomen),
    partner: metPartner(f) ? persoon(f.partnerGeboren, bijstand ? undefined : f.partnerInkomen) : undefined,
    kinderen: kinderen(f).map((k) => ({ leeftijd: leeftijd(k) ?? 0 })),
    kinderbijslag: minderjarigen(f) > 0 ? f.kinderbijslag === "ja" : undefined,
    bijstand,
    langLaagInkomen: vraagLangLaag(f) ? f.langLaag || undefined : undefined,
    studieMedisch: vraagStudie(f) ? f.studieMedisch || undefined : undefined,
    wonen: f.woont || "huur",
    kaleHuurPerMaand: vraagHuur(f) ? getal(f.kaleHuur) : undefined,
    andereBewoners: f.andereBewoners === "ja",
    vermogen: {
      betaalrekening: som("betaal", f.betaalrekening),
      spaarrekening: som("spaar", f.spaarrekening),
      voertuigen: f.bezit.includes("voertuig") ? f.voertuigen.map((v) => getal(v) ?? 0) : [],
      beleggingen: som("beleggingen", f.beleggingen),
      spullen: som("spullen", f.spullen),
      schulden: som("schuld", f.schulden),
    },
  };
}

/** De letterlijke brontekst bij een parameter uit de regeldata, voor vandaag. */
export function bronVan(id: string): Citaat | undefined {
  const b = new Lezer(standaardRegels, vandaag()).brontekst(id);
  return b ? naarCitaat(b.citaat, b.bron, b.geldigVan) : undefined;
}
