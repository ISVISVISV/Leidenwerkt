/**
 * Verzonnen personen voor `npm run audit:leidengeldwijzer`. Elke persoon is een ingevuld formulier van Leidengeldwijzer,
 * zoals het er na stap 3 uitziet. Alle gegevens zijn verzonnen.
 *
 * - `verwacht`: bedragen uit een officiële bron. De audit legt Leidengeldwijzer ernaast.
 * - `omwegen`: een andere route naar hetzelfde formulier. `begin` is wat iemand eerst invulde, `wijzig` is wat
 *   iemand daarna veranderde. Oude velden blijven staan, net als in Leidengeldwijzer. De uitkomst moet gelijk zijn.
 */
import { leegFormulier, leegKind, type Formulier, type InkomenVelden, type KindInfo } from "../../leidengeldwijzer/src/formulier.ts";

/** De datum waarop de audit rekent. Vast, zodat iedereen dezelfde uitkomst krijgt. */
export const REKENDATUM = "2026-11-21";

export interface Verwachting {
  /** Het id van de regeling, bijvoorbeeld "gemeentepolis" of "zorgtoeslag". */
  regeling: string;
  /** De grens netto per maand zonder vakantiegeld, zoals de gemeente die noemt. */
  grens?: number;
  /** Het bedrag per maand, zoals een officiële rekenhulp het geeft. */
  bedrag?: number;
  /** Toegestaan verschil in euro's. Standaard 1 (Leidengeldwijzer rondt af op hele euro's). */
  tolerantie?: number;
  bron: { titel: string; url: string; datum: string };
}

export interface Persoon {
  naam: string;
  f: Formulier;
  verwacht?: Verwachting[];
  omwegen?: { naam: string; begin: Partial<Formulier>; wijzig: Partial<Formulier> }[];
}

/**
 * Een ingevuld formulier: alles "nee" of leeg, behalve wat de persoon zelf invult.
 * Per kind standaard: niet naar de opvang, en het inkomen (vanaf 18 jaar) onbekend.
 */
export const formulier = (over: Partial<Formulier>): Formulier => ({
  ...leegFormulier,
  kindInfo: (over.kinderen ?? []).map((): KindInfo => ({ ...leegKind, opvang: "nee", inkomenOnbekend: true })),
  partner: "nee",
  heeftKinderen: "nee",
  woont: "huur",
  kaleHuur: "750",
  andereBewoners: "nee",
  bijstand: "nee",
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
/**
 * Proefberekening van Dienst Toeslagen, ingevuld op 23 november 2026 met dezelfde gegevens. Als inkomen staat het
 * toetsingsinkomen dat Leidengeldwijzer zelf schat uit het netto inkomen, per persoon, in hele euro's. Zo toetst dit de
 * berekening van de toeslagen, niet de schatting van het bruto inkomen. Zie docs/CONTROLE.md, hoofdstuk 4.
 */
const PROEF = {
  titel: "Dienst Toeslagen, proefberekening toeslagen 2026",
  url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
  datum: "2026-11-23",
};
const proef = (bedragen: Record<string, number>): Verwachting[] => Object.entries(bedragen).map(([regeling, bedrag]) => ({ regeling, bedrag, bron: PROEF }));

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
    verwacht: [{ regeling: "sleutelpas", grens: 1753.04, bron: TABEL_130 }, ...proef({ zorgtoeslag: 129, kgb: 990, huurtoeslag: 422 })],
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
    verwacht: [{ regeling: "sleutelpas", grens: 2504.32, bron: TABEL_130 }, ...proef({ zorgtoeslag: 239, kgb: 430, huurtoeslag: 516 })],
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
    f: formulier({ geboren: "01-03-2007", woont: "inwonend", kaleHuur: "", andereAantal: "2", andereOuder: "2", inkomen: inkomen({ loon: "600" }) }),
    verwacht: [{ regeling: "gemeentepolis", grens: 399.48, bron: TABEL_120 }],
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
    naam: "Esra: met schulden, loon boven 130%",
    f: formulier({ geboren: "01-03-1991", kaleHuur: "900", inkomen: inkomen({ loon: "1900" }), bezit: ["schuld"], schulden: "18000" }),
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
    naam: "Amina: net in Nederland, nog geen kinderbijslag",
    f: formulier({
      geboren: "01-03-1996",
      heeftKinderen: "ja",
      kinderen: ["01-03-2024", "01-03-2020"],
      kinderbijslag: "nee",
      kaleHuur: "650",
      inkomen: inkomen({ loon: "1100" }),
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
      andereAantal: "1",
      andereOuder: "1",
      andereInkomen: "18000",
      kindInfo: [
        { ...leegKind, inkomen: "5000" },
        { ...leegKind, opvang: "nee" },
      ],
      inkomen: inkomen({ uwv: "1100", partneralimentatie: "250" }, "anders"),
      bezit: ["beleggingen", "spullen"],
      beleggingen: "4000",
      spullen: "6000",
    }),
    verwacht: proef({ zorgtoeslag: 129, kgb: 560, huurtoeslag: 335 }),
  },
  {
    naam: "Mila: moeder met loon, twee kinderen naar de opvang",
    f: formulier({
      geboren: "01-03-1992",
      heeftKinderen: "ja",
      kinderen: ["01-03-2023", "01-03-2019"],
      kindInfo: [
        { ...leegKind, opvang: "ja", soort: "dagopvang", uren: "18", prijs: "10,50" },
        { ...leegKind, opvang: "ja", soort: "bso", uren: "6", prijs: "" },
      ],
      kinderbijslag: "ja",
      kaleHuur: "800",
      inkomen: inkomen({ loon: "1900" }),
    }),
    // Uren per week die een heel aantal uren per maand geven (78 en 26): de proefberekening vraagt hele uren.
    verwacht: proef({ zorgtoeslag: 129, kgb: 714, huurtoeslag: 484, kot: 1035 }),
  },
  {
    naam: "Bram: huisgenoot met inkomen, inkomen onbekend",
    f: formulier({ geboren: "01-03-1985", andereBewoners: "ja", andereAantal: "1", andereOuder: "1", andereOnbekend: true, inkomen: inkomen({ loon: "1400" }) }),
  },
  {
    naam: "Karin: alleenstaand met een kleine WW-uitkering",
    f: formulier({ geboren: "15-04-1980", inkomen: inkomen({ uwv: "1050" }, "ww"), kaleHuur: "700" }),
    verwacht: proef({ zorgtoeslag: 129, huurtoeslag: 426 }),
  },
  {
    naam: "Riet: alleenstaand met AOW en een klein pensioen",
    f: formulier({ geboren: "01-03-1952", inkomen: inkomen({ aow: "1100", pensioen: "150" }), kaleHuur: "650", bezit: ["spaar"], spaarrekening: "3000" }),
    verwacht: [
      { regeling: "gemeentepolis", grens: 1809.57, bron: TABEL_120 },
      { regeling: "volwassenenfonds", grens: 1809.57, bron: TABEL_120 },
      ...proef({ zorgtoeslag: 129, huurtoeslag: 394 }),
    ],
  },
  {
    naam: "Henk en Truus: stel, allebei met AOW",
    f: formulier({ geboren: "01-06-1950", partner: "ja", partnerGeboren: "15-09-1955", inkomen: inkomen({ aow: "850" }), partnerInkomen: inkomen({ aow: "850" }), kaleHuur: "700" }),
    verwacht: [{ regeling: "gemeentepolis", grens: 2480.75, bron: TABEL_120 }, ...proef({ zorgtoeslag: 246, huurtoeslag: 428 })],
  },
  {
    naam: "Jan en Anja: Jan heeft AOW, Anja nog niet",
    f: formulier({ geboren: "01-02-1956", partner: "ja", partnerGeboren: "01-02-1970", inkomen: inkomen({ aow: "850" }), partnerInkomen: inkomen({ loon: "600" }), kaleHuur: "700" }),
    verwacht: [{ regeling: "gemeentepolis", grens: 2480.75, bron: TABEL_120 }, ...proef({ zorgtoeslag: 246, huurtoeslag: 428 })],
  },
];
