/**
 * Verzonnen personen voor `npm run audit`. Elke persoon is een ingevuld formulier, zoals de rekenhulp het na
 * stap 3 heeft. Alle gegevens zijn verzonnen.
 *
 * - `uren`: extra standen van de urenschuif om af te drukken (de ingevulde uren gaan altijd mee).
 * - `omweg`: een andere route naar hetzelfde formulier. `begin` is wat iemand eerst invulde, `wijzig` is precies
 *   wat de gebruiker daarna verandert, zoals de rekenhulp dat doet (oude velden blijven staan). De uitkomst moet
 *   gelijk zijn aan die van het formulier zelf.
 */
import { leegFormulier, nieuwKind, type Formulier, type JaNeeVraag, type KindVeld } from "../app/src/formulier.ts";

export interface Persoon {
  naam: string;
  f: Formulier;
  uren?: number[];
  omwegen?: { naam: string; begin: Partial<Formulier>; wijzig: Partial<Formulier> }[];
}

const ALLE: JaNeeVraag[] = ["partner", "heeftKinderen", "partnerWerkt", "heeftAnderInkomen", "krijgtKinderalimentatie", "woonlasten", "andereBewoners", "werktNu"];
const formulier = (over: Partial<Formulier>): Formulier => ({
  ...leegFormulier,
  beantwoord: Object.fromEntries(ALLE.map((k) => [k, true])),
  ...over,
});
const kind = (geboren: string, over: Partial<KindVeld> = {}): KindVeld => ({ ...nieuwKind(), geboren, ...over });
const huur = (kaleHuur: string, zelfstandig = true): Partial<Formulier> => ({ woont: "huur", zelfstandig, kaleHuur });
const uurloon = (loon: string, uren: string): Partial<Formulier> => ({ per: "uur", loon, uren, allIn: "nee" });

const basis = formulier({ geboren: "01-03-1990", ...huur("750"), ...uurloon("15", "20") });

export const PERSONEN: Persoon[] = [
  {
    naam: "Basis: alleenstaand, 20 uur × € 15",
    f: basis,
    uren: [16, 24, 32],
    omwegen: [
      { naam: "eerst weekloon, daarna uurloon", begin: { per: "week", loon: "300" }, wijzig: { per: "uur", loon: "15", allIn: "nee" } },
      { naam: "eerst bij iemand anders in huis", begin: { woont: "kostgeld", kaleHuur: "0", kostendelers: "1" }, wijzig: { woont: "huur", zelfstandig: true, kaleHuur: "750" } },
      { naam: "eerst alimentatie, daarna Nee", begin: { heeftAnderInkomen: true, partneralimentatie: "300" }, wijzig: { heeftAnderInkomen: false } },
      { naam: "eerst een kind met kinderalimentatie, daarna Nee bij kinderen", begin: { leefvorm: "alleenstaande_ouder", kinderen: [kind("01-03-2020")], kinderalimentatieJa: true, kinderalimentatie: "250" }, wijzig: { leefvorm: "alleenstaande", kinderen: [] } },
      { naam: "eerst met partner die werkt, daarna geen partner", begin: { leefvorm: "paar", partnerGeboren: "01-03-1988", partnerWerkt: true, partnerBruto: "450", partnerWerktAl: "kort" }, wijzig: { leefvorm: "alleenstaande" } },
    ],
  },
  {
    naam: "Tom en Ilse: stel, Ilse werkt kort, Tom 32 uur",
    f: formulier({ leefvorm: "paar", geboren: "01-06-1985", partnerGeboren: "01-06-1987", partnerWerkt: true, partnerBruto: "450", partnerWerktAl: "kort", ...huur("820"), per: "maand", loon: "2300", uren: "32" }),
    omwegen: [{ naam: "eerst partner werkt niet", begin: { partnerWerkt: false }, wijzig: { partnerWerkt: true } }],
  },
  {
    naam: "Sanne: alleenstaande moeder, opvang, kinderalimentatie, netto loon",
    f: formulier({
      leefvorm: "alleenstaande_ouder",
      geboren: "01-03-1993",
      kinderen: [kind("01-03-2022", { opvang: true, soort: "dagopvang", uren: "30", uurprijs: "10,25" })],
      kinderalimentatieJa: true,
      kinderalimentatie: "280",
      ...huur("690"),
      per: "netto",
      loon: "1300",
      uren: "24",
    }),
    uren: [32],
    omwegen: [{ naam: "eerst geen kinderalimentatie", begin: { kinderalimentatieJa: false, kinderalimentatie: "" }, wijzig: { kinderalimentatieJa: true, kinderalimentatie: "280" } }],
  },
  {
    naam: "Johan: werkt al 9 maanden 12 uur, gaat naar 24",
    f: formulier({ geboren: "01-03-1968", ...huur("710"), werktNu: true, nuUren: "12", nuPer: "uur", nuLoon: "14,50", nuAllIn: "nee", werktAl: "lang", verandering: "meer", meerUren: "24" }),
  },
  {
    naam: "Noor: 21, baby bij gastouder, kamer",
    f: formulier({
      leefvorm: "alleenstaande_ouder",
      geboren: "01-03-2005",
      kinderen: [kind("01-03-2026", { opvang: true, soort: "gastouder", uren: "20", uurprijs: "8,50" })],
      ...huur("420", false),
      ...uurloon("13", "16"),
    }),
  },
  { naam: "Yara: kamer, medische urenbeperking", f: formulier({ geboren: "01-03-1981", ...huur("480", false), medisch: true, ...uurloon("15", "12") }) },
  { naam: "Karim: voltijd 36 uur", f: formulier({ geboren: "01-03-1996", ...huur("640"), per: "maand", loon: "2600", uren: "36" }) },
  { naam: "Priya: partneralimentatie", f: formulier({ geboren: "01-06-1988", heeftAnderInkomen: true, partneralimentatie: "300", ...huur("790"), ...uurloon("16", "20") }) },
  {
    naam: "Hatice: kinderen van 16 en 20, kinderalimentatie, zoon met inkomen",
    f: formulier({
      leefvorm: "alleenstaande_ouder",
      geboren: "01-06-1978",
      kinderen: [kind("01-06-2010"), kind("01-06-2006", { inkomen: "9000" })],
      kinderalimentatieJa: true,
      kinderalimentatie: "250",
      ...huur("780"),
      ...uurloon("15", "24"),
    }),
    omwegen: [
      { naam: "eerst inkomen zoon onbekend", begin: { kinderen: [kind("01-06-2010"), kind("01-06-2006", { inkomenOnbekend: true })] }, wijzig: { kinderen: [kind("01-06-2010"), kind("01-06-2006", { inkomen: "9000" })] } },
    ],
  },
  { naam: "Joke: partneralimentatie, bij haar zus in huis", f: formulier({ geboren: "01-03-1974", heeftAnderInkomen: true, partneralimentatie: "350", woont: "kostgeld", kaleHuur: "250", kostendelers: "1", ...uurloon("14", "16") }) },
  { naam: "Lars: 25, woont bij zijn vader, voltijd", f: formulier({ geboren: "01-03-2001", woont: "kostgeld", kaleHuur: "200", kostendelers: "1", per: "maand", loon: "2400", uren: "40" }) },
  {
    naam: "Ahmed en Leila: stel, kinderen van 4 en 19, Leila werkt kort",
    f: formulier({
      leefvorm: "paar",
      geboren: "01-03-1990",
      partnerGeboren: "01-03-1992",
      partnerWerkt: true,
      partnerBruto: "420",
      partnerWerktAl: "kort",
      kinderen: [kind("01-03-2022"), kind("01-03-2007", { inkomen: "4000" })],
      ...huur("840"),
      ...uurloon("15,50", "32"),
    }),
  },
  { naam: "Marieke: woonvorm met begeleiding", f: formulier({ geboren: "01-03-1982", woont: "instelling", ...uurloon("13,80", "8") }) },
  {
    naam: "Fatou en Ibrahim: stel, kinderen van 3 en 19",
    f: formulier({ leefvorm: "paar", geboren: "01-03-1995", partnerGeboren: "01-03-1997", kinderen: [kind("01-03-2023"), kind("01-03-2007", { inkomen: "3000" })], ...huur("880"), ...uurloon("15", "24") }),
  },
  { naam: "Netto weekloon: € 300 per week, 20 uur", f: { ...basis, per: "nettoweek", loon: "300" }, uren: [32] },
];
