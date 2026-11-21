/**
 * Verzonnen personen voor `npm run audit:leidenrekent`. Elke persoon is een ingevuld formulier van Leidenrekent,
 * zoals het er na stap 3 uitziet. Alle gegevens zijn verzonnen.
 *
 * - `verwacht`: bedragen uit een officiële bron. De audit legt Leidenrekent ernaast.
 * - `omwegen`: een andere route naar hetzelfde formulier. `begin` is wat iemand eerst invulde, `wijzig` is wat
 *   iemand daarna veranderde. Oude velden blijven staan, net als in Leidenrekent. De uitkomst moet gelijk zijn.
 */
import { leegFormulier, type Formulier, type InkomenVelden } from "../../regelingen/src/formulier.ts";

/** De datum waarop de audit rekent. Vast, zodat iedereen dezelfde uitkomst krijgt. */
export const REKENDATUM = "2026-11-21";

export interface Verwachting {
  /** Het id van de regeling, bijvoorbeeld "gemeentepolis" of "zorgtoeslag". */
  regeling: string;
  /** De grens netto per maand zonder vakantiegeld, zoals de gemeente die noemt. */
  grens?: number;
  /** Het bedrag per maand, zoals een officiële rekenhulp het geeft. */
  bedrag?: number;
  /** Toegestaan verschil in euro's. Standaard 1 (Leidenrekent rondt af op hele euro's). */
  tolerantie?: number;
  bron: { titel: string; url: string; datum: string };
}

export interface Persoon {
  naam: string;
  f: Formulier;
  verwacht?: Verwachting[];
  omwegen?: { naam: string; begin: Partial<Formulier>; wijzig: Partial<Formulier> }[];
}

/** Een ingevuld formulier: alles "nee" of leeg, behalve wat de persoon zelf invult. */
export const formulier = (over: Partial<Formulier>): Formulier => ({
  ...leegFormulier,
  leiden: "ja",
  partner: "nee",
  heeftKinderen: "nee",
  woont: "huur",
  kaleHuur: "750",
  andereBewoners: "nee",
  bijstand: "nee",
  schuldregeling: "nee",
  langLaag: "nee",
  bezit: ["niets"],
  ...over,
});
export const inkomen = (bedragen: InkomenVelden["bedragen"], uitkering: InkomenVelden["uitkering"] = ""): InkomenVelden => ({
  soorten: Object.keys(bedragen).length ? (Object.keys(bedragen) as InkomenVelden["soorten"]) : ["geen"],
  bedragen,
  uitkering,
});
const geen = inkomen({});

const TABEL_120 = {
  titel: "Gemeente Leiden, Hulp bij kosten sport en cultuur (tabel 120% van het sociaal minimum)",
  url: "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/hulp-bij-kosten-sport-en-cultuur/",
  datum: "2026-11-21",
};
const TABEL_130 = {
  titel: "Gemeente Leiden, Hulp bij kosten schoolgaande kinderen (tabel 130% van het sociaal minimum)",
  url: "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/hulp-bij-kosten-schoolgaande-kinderen/",
  datum: "2026-11-21",
};

export const PERSONEN: Persoon[] = [
  {
    naam: "Basis: alleenstaand, loon, huurwoning",
    f: formulier({ geboren: "01-03-1990", inkomen: inkomen({ loon: "1300" }), bezit: ["spaar"], spaarrekening: "2000" }),
    verwacht: [
      { regeling: "gemeentepolis", grens: 1618.18, bron: TABEL_120 },
      { regeling: "volwassenenfonds", grens: 1618.18, bron: TABEL_120 },
    ],
    omwegen: [
      { naam: "eerst ook kinderalimentatie, daarna niet meer", begin: { inkomen: inkomen({ loon: "1300", kinderalimentatie: "200" }) }, wijzig: { inkomen: { ...inkomen({ loon: "1300", kinderalimentatie: "200" }), soorten: ["loon"] } } },
      { naam: "eerst met partner, daarna zonder", begin: { partner: "ja", partnerGeboren: "01-03-1988", partnerInkomen: inkomen({ loon: "900" }) }, wijzig: { partner: "nee" } },
      { naam: "eerst een auto, daarna niet meer", begin: { bezit: ["spaar", "voertuig"], voertuigen: ["9000"] }, wijzig: { bezit: ["spaar"] } },
      { naam: "eerst kinderen, daarna geen", begin: { heeftKinderen: "ja", kinderen: ["01-03-2018"], kinderbijslag: "ja" }, wijzig: { heeftKinderen: "nee" } },
    ],
  },
  {
    naam: "Sanne: alleenstaande moeder, loon en kinderalimentatie",
    f: formulier({
      geboren: "01-03-1993",
      heeftKinderen: "ja",
      kinderen: ["01-03-2023", "01-03-2017", "01-03-2012"],
      kinderbijslag: "ja",
      kaleHuur: "690",
      inkomen: inkomen({ loon: "1250", kinderalimentatie: "280" }),
      bezit: ["betaal", "spaar"],
      betaalrekening: "300",
      spaarrekening: "800",
    }),
    verwacht: [{ regeling: "sleutelpas", grens: 1753.04, bron: TABEL_130 }],
  },
  {
    naam: "Ahmed en Leila: stel met bijstand en twee kinderen",
    f: formulier({
      geboren: "01-03-1985",
      partner: "ja",
      partnerGeboren: "01-03-1987",
      heeftKinderen: "ja",
      kinderen: ["01-03-2019", "01-03-2014"],
      kinderbijslag: "ja",
      kaleHuur: "840",
      bijstand: "ja",
      langLaag: "ja",
    }),
    verwacht: [
      { regeling: "gemeentepolis", grens: 2311.68, bron: TABEL_120 },
      { regeling: "volwassenenfonds", grens: 2311.68, bron: TABEL_120 },
    ],
  },
  {
    naam: "Fatou en Ibrahim: stel met loon en twee kinderen",
    f: formulier({
      geboren: "01-03-1995",
      partner: "ja",
      partnerGeboren: "01-03-1997",
      heeftKinderen: "ja",
      kinderen: ["01-03-2023", "01-03-2016"],
      kinderbijslag: "ja",
      kaleHuur: "880",
      inkomen: inkomen({ loon: "1600" }),
      partnerInkomen: inkomen({ loon: "700" }),
      bezit: ["betaal", "voertuig"],
      betaalrekening: "400",
      voertuigen: ["2500"],
    }),
    verwacht: [{ regeling: "sleutelpas", grens: 2504.32, bron: TABEL_130 }],
  },
  {
    naam: "Peter en Mieke: Wajong is het grootste inkomen, kamer",
    f: formulier({
      geboren: "01-03-1980",
      partner: "ja",
      partnerGeboren: "01-03-1982",
      woont: "kamer",
      kaleHuur: "",
      inkomen: inkomen({ uwv: "1400" }, "wajong"),
      partnerInkomen: inkomen({ loon: "200" }),
      langLaag: "ja",
    }),
  },
  {
    naam: "Daan: student met een handicap",
    f: formulier({ geboren: "01-03-2004", woont: "kamer", kaleHuur: "", inkomen: inkomen({ studiefinanciering: "650" }), studieMedisch: "ja" }),
  },
  {
    naam: "Fleur: student met Wajong",
    f: formulier({ geboren: "01-03-2003", woont: "kamer", kaleHuur: "", inkomen: inkomen({ studiefinanciering: "500", uwv: "600" }, "wajong"), studieMedisch: "ja" }),
  },
  {
    naam: "Karim: zzp'er",
    f: formulier({ geboren: "01-03-1988", kaleHuur: "820", inkomen: inkomen({ bedrijf: "1200" }), bezit: ["betaal"], betaalrekening: "1500" }),
  },
  {
    naam: "Joke: bijstand, koopwoning, auto van € 6.000",
    f: formulier({ geboren: "01-03-1970", woont: "koop", kaleHuur: "", bijstand: "ja", langLaag: "ja", bezit: ["voertuig", "spaar"], voertuigen: ["6000"], spaarrekening: "3000" }),
  },
  {
    naam: "Lars: 19, woont bij zijn ouders",
    f: formulier({ geboren: "01-03-2007", woont: "inwonend", kaleHuur: "", inkomen: inkomen({ loon: "600" }) }),
  },
  {
    naam: "Marieke: bijstand, woonvorm met begeleiding",
    f: formulier({ geboren: "01-03-1982", woont: "instelling", kaleHuur: "", bijstand: "ja", langLaag: "onbekend" }),
  },
  {
    naam: "Ruud: geen vaste woonplek, geen inkomen",
    f: formulier({ geboren: "01-03-1975", woont: "dakloos", kaleHuur: "", inkomen: geen, langLaag: "ja" }),
  },
  {
    naam: "Esra: schuldregeling bij de Stadsbank, loon boven 130%",
    f: formulier({ geboren: "01-03-1991", kaleHuur: "900", schuldregeling: "ja", inkomen: inkomen({ loon: "1900" }), bezit: ["schuld"], schulden: "18000" }),
  },
  {
    naam: "Willem: veel spaargeld",
    f: formulier({ geboren: "01-03-1965", inkomen: inkomen({ uwv: "1300" }, "wia"), bezit: ["spaar"], spaarrekening: "60000" }),
  },
  {
    naam: "Noor en Sem: loon en uitkering bij één persoon",
    f: formulier({
      geboren: "01-03-1990",
      partner: "ja",
      partnerGeboren: "01-03-1991",
      inkomen: inkomen({ loon: "700", uwv: "600" }, "ww"),
      partnerInkomen: inkomen({ loon: "800" }),
    }),
  },
  {
    naam: "Hatice: huisgenoot en een zoon van 20",
    f: formulier({
      geboren: "01-03-1978",
      heeftKinderen: "ja",
      kinderen: ["01-03-2006", "01-03-2012"],
      kinderbijslag: "ja",
      andereBewoners: "ja",
      inkomen: inkomen({ uwv: "1100", partneralimentatie: "250" }, "anders"),
      bezit: ["beleggingen", "spullen"],
      beleggingen: "4000",
      spullen: "6000",
    }),
  },
];
