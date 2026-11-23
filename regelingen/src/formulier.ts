/**
 * Het formulier van Leidengeldwijzer: wat iemand invult, de controle per stap en de vertaling naar de rekenkern.
 * Er wordt niets bewaard: alles staat alleen in het geheugen van de pagina.
 *
 * Stappen: 1 Uw huishouden (met wonen), 2 Uw inkomen, 3 Geld en bezit, 4 Overzicht.
 */
import {
  euro,
  heeftAowLeeftijd,
  Lezer,
  naarCitaat,
  standaardRegels,
  type CheckInvoer,
  type CheckPersoon,
  type Citaat,
  type Inkomenssoort,
  type Opvangsoort,
  type Uitkeringssoort,
  type Woonsoort,
} from "@leidenwerkt/engine";
import { getal, isoDatum, leeftijdOp, type Geboortedatum } from "@leidenwerkt/ui/invoer";
import { SOORTEN, UITKERINGEN, woonOpties } from "./teksten.ts";

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
  geboren: Geboortedatum;
  partner: JaNee;
  partnerGeboren: Geboortedatum;
  heeftKinderen: JaNee;
  kinderen: Geboortedatum[];
  /** Per kind (zelfde volgorde als kinderen): opvang (jonger dan 13) en inkomen (18 jaar of ouder, voor de huurtoeslag). */
  kindInfo: KindInfo[];
  kinderbijslag: JaNee;
  woont: "" | Woonsoort;
  kaleHuur: string;
  andereBewoners: JaNee;
  /** Hoeveel andere mensen er wonen, en hun bruto inkomen per jaar samen. Voor de huurtoeslag. */
  andereAantal: string;
  /** Hoeveel van hen 27 jaar of ouder zijn (kostendelersnorm, art. 22a Pw). */
  andereOuder: string;
  andereInkomen: string;
  andereOnbekend: boolean;
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

export interface KindInfo {
  opvang: JaNee;
  soort: "" | Opvangsoort;
  /** Uren per week. */
  uren: string;
  /** Prijs per uur. Leeg: onbekend, dan de hoogste prijs waarover u toeslag krijgt. */
  prijs: string;
  /** Bruto inkomen per jaar, voor de huurtoeslag. */
  inkomen: string;
  inkomenOnbekend: boolean;
}
export const leegKind: KindInfo = { opvang: "", soort: "", uren: "", prijs: "", inkomen: "", inkomenOnbekend: false };
/** Wat er per kind is ingevuld. Ontbreekt het (nieuw kind), dan is alles leeg. */
export const infoVan = (f: Formulier, i: number): KindInfo => f.kindInfo[i] ?? leegKind;

const leegInkomen: InkomenVelden = { soorten: [], bedragen: {}, uitkering: "" };

export const leegFormulier: Formulier = {
  geboren: "",
  partner: "",
  partnerGeboren: "",
  heeftKinderen: "",
  kinderen: [""],
  kindInfo: [],
  kinderbijslag: "",
  woont: "",
  kaleHuur: "",
  andereBewoners: "",
  andereAantal: "",
  andereOuder: "",
  andereInkomen: "",
  andereOnbekend: false,
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
/** Heeft iemand met deze geboortedatum vandaag de AOW-leeftijd? Onbekend telt als nee. */
export const aowVan = (g: Geboortedatum) => {
  const iso = isoDatum(g);
  return iso ? (heeftAowLeeftijd(standaardRegels, iso, vandaag()) ?? false) : false;
};
/** Heeft de aanvrager of de partner de AOW-leeftijd? Dan komt de aanvulling tot het sociaal minimum van de SVB (AIO). */
export const metAow = (f: Formulier) => aowVan(f.geboren) || (metPartner(f) && aowVan(f.partnerGeboren));
/** De soorten inkomen om uit te kiezen. AOW alleen voor wie de AOW-leeftijd heeft. */
export const soortOpties = (aow: boolean) => SOORTEN.filter(([s]) => aow || s !== "aow");
const kinderen = (f: Formulier) => (f.heeftKinderen === "ja" ? f.kinderen : []);
export const minderjarigen = (f: Formulier) => kinderen(f).filter((k) => (leeftijd(k) ?? 99) < 18).length;

/** Het id van het bedragveld, voor de aanvrager of de partner. */
export const bedragId = (partner: boolean, s: Bedragsoort) => `${partner ? "partnerInkomen" : "inkomen"}_${s}`;
export const uitkeringId = (partner: boolean) => (partner ? "partnerUitkering" : "uitkering");
export const soortenId = (partner: boolean) => (partner ? "partnerSoorten" : "soorten");

/** Vragen die alleen in bepaalde situaties komen. */
export const vraagInkomen = (f: Formulier) => f.bijstand === "nee";
/**
 * Welke uitkering iemand krijgt, telt alleen voor de studietoeslag: met Wajong krijgt u die niet (art. 36b Pw).
 * Daarom komt de vraag alleen bij de aanvrager, met studiefinanciering en een uitkering van UWV.
 */
export const vraagUitkering = (v: InkomenVelden, partner: boolean) => !partner && v.soorten.includes("uwv") && v.soorten.includes("studiefinanciering");
export const bedragSoorten = (v: InkomenVelden, aow = true): Bedragsoort[] => v.soorten.filter((s): s is Bedragsoort => s !== "geen" && (aow || s !== "aow"));
const studeert = (f: Formulier) => vraagInkomen(f) && f.inkomen.soorten.includes("studiefinanciering");
/** Alleen voor de individuele inkomenstoeslag: vanaf 23 jaar, en de aanvrager en de partner hebben nog niet de AOW-leeftijd. */
export const vraagLangLaag = (f: Formulier) => (leeftijd(f.geboren) ?? 0) >= 23 && !metAow(f) && !studeert(f);
export const vraagStudie = studeert;
export const vraagHuur = (f: Formulier) => f.woont === "huur";
/** Voor de huurtoeslag: hoeveel andere mensen en hun inkomen. Alleen bij een huurwoning. */
/** Hoeveel andere mensen er wonen, en hoeveel van hen 27 jaar of ouder zijn. Voor de bijstand en de huurtoeslag. */
export const vraagAantal = (f: Formulier) => f.andereBewoners === "ja" && f.woont !== "instelling";
export const vraagAnderen = (f: Formulier) => vraagHuur(f) && f.andereBewoners === "ja";
/** Voor de huurtoeslag: het inkomen van een kind van 18 jaar of ouder. */
export const vraagInkomenKind = (f: Formulier, k: Geboortedatum) => vraagHuur(f) && (leeftijd(k) ?? 0) >= 18;
/** Voor de kinderopvangtoeslag: gaat een kind jonger dan 13 naar de opvang? */
export const vraagOpvang = (k: Geboortedatum) => (leeftijd(k) ?? 99) < 13;
/** Uren per week omgerekend naar een maand: 52 weken verdeeld over 12 maanden, zoals in Leidenwerkt. */
const urenPerMaand = (perWeek: number) => Math.round(((perWeek * 52) / 12) * 100) / 100;
const maxUurprijs = (l: Lezer, soort: Opvangsoort) => Number(l.bedrag(`kot.max_uurprijs.${soort}`).toFixed(2));

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
    else if (!isoDatum(g)) fouten[veld] = `Vul dag, maand en jaar in. Bijvoorbeeld ${kind ? "14-03-2018" : "14-03-1990"}.`;
    else if (isoDatum(g)! > vandaag()) fouten[veld] = "Deze datum ligt in de toekomst. Vul de geboortedatum in.";
    else {
      const l = leeftijd(g)!;
      if (l < min || l > maxi) fouten[veld] = melding;
    }
  };
  const inkomen = (v: InkomenVelden, partner: boolean) => {
    const aow = aowVan(partner ? f.partnerGeboren : f.geboren);
    if (v.soorten.filter((s) => aow || s !== "aow").length === 0) fouten[soortenId(partner)] = "Kies minstens één antwoord.";
    if (vraagUitkering(v, partner) && !v.uitkering) fouten[uitkeringId(partner)] = kies;
    for (const s of bedragSoorten(v, aow)) bedrag(bedragId(partner, s), v.bedragen[s], 20000, "Vul een bedrag per maand in, bijvoorbeeld 1.400.");
  };
  if (stap === 1) {
    datum("geboren", f.geboren, 18, 120, "Leidengeldwijzer werkt voor mensen van 18 jaar of ouder.");
    if (!f.partner) fouten.partner = kies;
    if (metPartner(f)) datum("partnerGeboren", f.partnerGeboren, 18, 120, "Uw partner moet 18 jaar of ouder zijn.");
    if (!f.heeftKinderen) fouten.heeftKinderen = kies;
    kinderen(f).forEach((k, i) => {
      datum(`kind${i}`, k, 0, 30, "Vul de geboortedatum van uw kind in.", true);
      const info = infoVan(f, i);
      if (vraagOpvang(k)) {
        if (!info.opvang) fouten[`opvang${i}`] = kies;
        if (info.opvang === "ja") {
          if (!info.soort) fouten[`soort${i}`] = kies;
          bedrag(`kind${i}uren`, info.uren, 60, "Vul het aantal uur per week in, bijvoorbeeld 16.");
          if (info.prijs.trim()) bedrag(`kind${i}prijs`, info.prijs, 50, "Vul de prijs per uur in, bijvoorbeeld 10,50.");
        }
      }
      if (vraagInkomenKind(f, k) && !info.inkomenOnbekend) bedrag(`kind${i}inkomen`, info.inkomen, 1_000_000, "Vul een bedrag per jaar in, bijvoorbeeld 4.000.");
    });
    if (minderjarigen(f) > 0 && !f.kinderbijslag) fouten.kinderbijslag = kies;
    if (!f.woont) fouten.woont = kies;
    if (vraagHuur(f)) {
      const n = getal(f.kaleHuur);
      if (n === undefined) fouten.kaleHuur = "Vul dit in.";
      else if (Number.isNaN(n) || n < 1 || n > 3000) fouten.kaleHuur = "Vul de kale huur per maand in, bijvoorbeeld 750.";
    }
    if (!f.andereBewoners) fouten.andereBewoners = kies;
    if (vraagAantal(f)) {
      const n = getal(f.andereAantal);
      if (n === undefined) fouten.andereAantal = "Vul dit in.";
      else if (Number.isNaN(n) || !Number.isInteger(n) || n < 1 || n > 20) fouten.andereAantal = "Vul een aantal in, bijvoorbeeld 1.";
      const o = getal(f.andereOuder);
      if (o === undefined) fouten.andereOuder = "Vul dit in. Is niemand 27 jaar of ouder? Vul dan 0 in.";
      else if (Number.isNaN(o) || !Number.isInteger(o) || o < 0 || (n !== undefined && o > n)) fouten.andereOuder = "Vul een aantal in. Dat is niet meer dan het aantal mensen.";
    }
    if (vraagAnderen(f)) {
      if (!f.andereOnbekend) bedrag("andereInkomen", f.andereInkomen, 10_000_000, "Vul een bedrag per jaar in, bijvoorbeeld 25.000.");
    }
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

const persoon = (geboren: Geboortedatum, v: InkomenVelden | undefined, partner = false): CheckPersoon => ({
  leeftijd: leeftijd(geboren) ?? 0,
  aow: aowVan(geboren),
  inkomen: v ? Object.fromEntries(bedragSoorten(v, aowVan(geboren)).map((s) => [s, getal(v.bedragen[s] ?? "") ?? 0])) : {},
  uitkering: v && vraagUitkering(v, partner) && v.uitkering ? v.uitkering : undefined,
});

/** Het ingevulde formulier als invoer voor de rekenkern. Alleen aanroepen als alle stappen goed zijn. */
export function naarInvoer(f: Formulier): CheckInvoer {
  const bijstand = f.bijstand === "ja";
  const som = (b: Bezit, t: string) => (f.bezit.includes(b) ? (getal(t) ?? 0) : 0);
  return {
    datum: vandaag(),
    aanvrager: persoon(f.geboren, bijstand ? undefined : f.inkomen),
    partner: metPartner(f) ? persoon(f.partnerGeboren, bijstand ? undefined : f.partnerInkomen, true) : undefined,
    kinderen: kinderen(f).map((k, i) => {
      const info = infoVan(f, i);
      const iso = isoDatum(k);
      const soort = info.soort || "dagopvang";
      const prijs = getal(info.prijs);
      const geschat = prijs === undefined || Number.isNaN(prijs);
      return {
        leeftijd: leeftijd(k) ?? 0,
        leeftijdBeginJaar: iso ? (leeftijdOp(k, `${vandaag().slice(0, 4)}-01-01`) ?? undefined) : undefined,
        inkomenJaar: vraagInkomenKind(f, k) && !info.inkomenOnbekend ? getal(info.inkomen) : undefined,
        opvang:
          vraagOpvang(k) && info.opvang === "ja"
            ? { soort, urenPerMaand: urenPerMaand(getal(info.uren) ?? 0), uurprijs: geschat ? maxUurprijs(new Lezer(standaardRegels, vandaag()), soort) : prijs, uurprijsGeschat: geschat || undefined }
            : undefined,
      };
    }),
    kinderbijslag: minderjarigen(f) > 0 ? f.kinderbijslag === "ja" : undefined,
    bijstand,
    langLaagInkomen: vraagLangLaag(f) ? f.langLaag || undefined : undefined,
    studieMedisch: vraagStudie(f) ? f.studieMedisch || undefined : undefined,
    wonen: f.woont || "huur",
    kaleHuurPerMaand: vraagHuur(f) ? getal(f.kaleHuur) : undefined,
    andereBewoners: f.andereBewoners === "ja",
    andereBewonersAantal: vraagAantal(f) ? getal(f.andereAantal) : undefined,
    kostendelers: vraagAantal(f) ? getal(f.andereOuder) : undefined,
    andereBewonersInkomenJaar: vraagAnderen(f) && !f.andereOnbekend ? getal(f.andereInkomen) : undefined,
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

/** Een ingevuld bedrag als euro, zoals in Leidenwerkt: "€ 1.250" of "€ 14,50". */
export const euroTekst = (t: string) => {
  const n = getal(t);
  if (n === undefined || Number.isNaN(n)) return `€ ${t}`;
  return Number.isInteger(n) ? euro(String(n), true) : euro(n.toFixed(2));
};

const kleineLetter = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/**
 * Wat iemand heeft ingevuld, als korte regels per stap. Voor de afdruk, net als in Leidenwerkt:
 * zo kan iemand het overzicht meenemen naar een spreekuur, met de gegevens erbij.
 */
export function ingevuld(f: Formulier): { kop: string; regels: [string, string][] }[] {
  const paar = metPartner(f);
  const huishouden: [string, string][] = [["Geboren", f.geboren.trim()]];
  huishouden.push(["Partner", paar ? `geboren ${f.partnerGeboren.trim()}` : "nee"]);
  if (kinderen(f).length === 0) huishouden.push(["Kinderen", "nee"]);
  const OPVANG: Record<Opvangsoort, string> = { dagopvang: "kinderdagverblijf", bso: "buitenschoolse opvang", gastouder: "gastouder" };
  kinderen(f).forEach((k, i) => {
    const info = infoVan(f, i);
    const opvang =
      vraagOpvang(k) && info.opvang === "ja"
        ? `. ${info.soort ? OPVANG[info.soort].charAt(0).toUpperCase() + OPVANG[info.soort].slice(1) : "Opvang"}, ${info.uren} uur per week${info.prijs.trim() ? ` × ${euroTekst(info.prijs)}` : ", prijs onbekend"}`
        : "";
    const inkomen = vraagInkomenKind(f, k) ? `. Inkomen: ${info.inkomenOnbekend ? "onbekend" : `${euroTekst(info.inkomen)} bruto per jaar`}` : "";
    huishouden.push([`Kind ${i + 1}`, `geboren ${k.trim()}${opvang}${inkomen}`]);
  });
  if (minderjarigen(f) > 0) huishouden.push(["Kinderbijslag", f.kinderbijslag === "ja" ? "ja" : "nee"]);
  const woon = woonOpties(paar).find(([w]) => w === f.woont);
  if (woon) huishouden.push(["Woning", kleineLetter(woon[1])]);
  if (vraagHuur(f)) huishouden.push(["Kale huur", `${euroTekst(f.kaleHuur)} per maand`]);
  huishouden.push([
    "Andere bewoners",
    f.andereBewoners !== "ja"
      ? "nee"
      : vraagAantal(f)
        ? `${f.andereAantal}, van wie ${f.andereOuder} van 27 jaar of ouder${vraagAnderen(f) ? `. Samen ${f.andereOnbekend ? "inkomen onbekend" : `${euroTekst(f.andereInkomen)} bruto per jaar`}` : ""}`
        : "ja",
  ]);

  const inkomen: [string, string][] = [[metAow(f) ? "AIO-aanvulling" : "Bijstand", f.bijstand === "ja" ? "ja" : "nee"]];
  const persoon = (v: InkomenVelden, partner: boolean) => {
    const naam = partner ? "Inkomen partner" : "Inkomen";
    if (v.soorten.includes("geen")) return inkomen.push([naam, "geen"]);
    const delen = bedragSoorten(v, aowVan(partner ? f.partnerGeboren : f.geboren)).map((s) => `${kleineLetter(SOORTEN.find(([w]) => w === s)![1])} ${euroTekst(v.bedragen[s] ?? "")}`);
    inkomen.push([naam, `${delen.join(", ")} per maand`]);
    if (vraagUitkering(v, partner) && v.uitkering) inkomen.push(["Uitkering", UITKERINGEN.find(([w]) => w === v.uitkering)![1]]);
  };
  if (vraagInkomen(f)) {
    persoon(f.inkomen, false);
    if (paar) persoon(f.partnerInkomen, true);
  }
  if (vraagLangLaag(f) && f.langLaag) inkomen.push(["5 jaar of langer laag inkomen", f.langLaag === "onbekend" ? "weet ik niet" : f.langLaag]);
  if (vraagStudie(f) && f.studieMedisch) inkomen.push(["Door ziekte of handicap niet werken naast de studie", f.studieMedisch]);

  const geld: [string, string][] = [];
  if (f.bezit.includes("niets") || f.bezit.length === 0) geld.push(["Geld en bezit", "niets van dit"]);
  if (f.bezit.includes("betaal")) geld.push(["Betaalrekening", euroTekst(f.betaalrekening)]);
  if (f.bezit.includes("spaar")) geld.push(["Spaarrekening", euroTekst(f.spaarrekening)]);
  if (f.bezit.includes("voertuig")) f.voertuigen.forEach((v, i) => geld.push([f.voertuigen.length > 1 ? `Auto, motor of scooter ${i + 1}` : "Auto, motor of scooter", euroTekst(v)]));
  if (f.bezit.includes("beleggingen")) geld.push(["Contant geld en beleggingen", euroTekst(f.beleggingen)]);
  if (f.bezit.includes("spullen")) geld.push(["Spullen", euroTekst(f.spullen)]);
  if (f.bezit.includes("schuld")) geld.push(["Schulden", euroTekst(f.schulden)]);

  return [
    { kop: "Uw huishouden", regels: huishouden },
    { kop: "Uw inkomen", regels: inkomen },
    { kop: "Geld en bezit", regels: geld },
  ];
}
