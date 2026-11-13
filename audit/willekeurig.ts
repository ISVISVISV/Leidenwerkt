/**
 * Willekeurige, verzonnen personen voor `npm run audit -- --willekeurig 200`. Elke run met hetzelfde zaad
 * (`--zaad 7`) geeft dezelfde personen, zodat een gevonden fout na te doen is.
 *
 * De personen zijn geldig zoals het formulier ze toelaat: elk veld dat de rekenhulp vraagt, is ingevuld met een
 * waarde die de controle in het formulier goedkeurt.
 */
import { controleer, leegFormulier, nieuwKind, type Formulier, type JaNeeVraag, type KindVeld } from "../app/src/formulier.ts";
import type { Persoon } from "./personen.ts";

/** Kleine, voorspelbare toevalsgenerator (mulberry32). */
function toeval(zaad: number) {
  let a = zaad >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const tussen = (van: number, tot: number) => van + Math.floor(r() * (tot - van + 1));
  const kies = <T,>(lijst: readonly T[]): T => lijst[Math.floor(r() * lijst.length)];
  const kans = (p: number) => r() < p;
  return { tussen, kies, kans };
}

const ALLE: JaNeeVraag[] = ["partner", "heeftKinderen", "partnerWerkt", "heeftAnderInkomen", "krijgtKinderalimentatie", "woonlasten", "andereBewoners", "werktNu"];
const datum = (leeftijd: number, t: ReturnType<typeof toeval>) => {
  const nu = new Date();
  return `${String(t.tussen(1, 28)).padStart(2, "0")}-${String(t.tussen(1, 12)).padStart(2, "0")}-${nu.getFullYear() - leeftijd - 1}`;
};
const komma = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

function loon(t: ReturnType<typeof toeval>, per: string, uren: number): string {
  switch (per) {
    case "uur":
      return komma(t.tussen(1250, 2400) / 100);
    case "maand":
      return String(Math.round((uren * 4.33 * t.tussen(14, 24)) / 10) * 10);
    case "netto":
      return String(Math.round((uren * 4.33 * t.tussen(12, 18)) / 10) * 10);
    case "week":
      return String(uren * t.tussen(14, 24));
    case "vierweken":
      return String(uren * 4 * t.tussen(14, 24));
    case "nettovierweken":
      return String(uren * 4 * t.tussen(12, 18));
    default:
      return String(uren * t.tussen(12, 18));
  }
}

export function willekeurigePersonen(aantal: number, zaad: number): Persoon[] {
  const t = toeval(zaad);
  const uit: Persoon[] = [];
  let poging = 0;
  while (uit.length < aantal && poging < aantal * 20) {
    poging++;
    const paar = t.kans(0.35);
    const kinderen: KindVeld[] = t.kans(0.45)
      ? Array.from({ length: t.tussen(1, 3) }, () => {
          const leeftijd = t.tussen(0, 25);
          const opvang = leeftijd < 13 && t.kans(0.4);
          const onbekend = leeftijd >= 18 && t.kans(0.2);
          return {
            ...nieuwKind(),
            geboren: datum(leeftijd, t),
            opvang,
            soort: opvang ? (leeftijd < 4 ? t.kies(["dagopvang", "gastouder"] as const) : t.kies(["bso", "gastouder"] as const)) : "",
            uren: opvang ? String(t.tussen(4, 50)) : "",
            uurprijs: opvang ? komma(t.tussen(600, 1400) / 100) : "",
            inkomen: leeftijd >= 18 && !onbekend ? String(t.tussen(0, 15) * 1000) : "",
            inkomenOnbekend: onbekend,
          };
        })
      : [];
    const woont = t.kies(["huur", "huur", "huur", "koop", "kostgeld", "inwonend", "instelling", "dakloos"] as const);
    const zelfstandig = woont === "huur" ? t.kans(0.75) : true;
    const andereBewoners = woont === "huur" && t.kans(0.25);
    const werktNu = t.kans(0.25);
    const verandering = werktNu ? t.kies(["meer", "ander", "erbij"] as const) : "";
    const per = t.kies(["uur", "uur", "maand", "netto", "week", "nettoweek", "vierweken", "nettovierweken"] as const);
    const uren = t.tussen(4, 40);
    const nuUren = t.tussen(4, 24);
    const nuPer = t.kies(["uur", "maand", "netto"] as const);
    const anderInkomen = t.kans(0.25);
    const f: Formulier = {
      ...leegFormulier,
      beantwoord: Object.fromEntries(ALLE.map((k) => [k, true])),
      leefvorm: paar ? "paar" : kinderen.length ? "alleenstaande_ouder" : "alleenstaande",
      geboren: datum(t.tussen(18, 66), t),
      partnerGeboren: paar ? datum(t.tussen(18, 66), t) : "",
      partnerWerkt: paar && t.kans(0.35),
      kinderen,
      heeftAnderInkomen: anderInkomen,
      partneralimentatie: anderInkomen && t.kans(0.5) ? String(t.tussen(5, 60) * 10) : "",
      anderInkomen: "",
      kinderalimentatieJa: kinderen.length > 0 && t.kans(0.3),
      woont,
      zelfstandig,
      kaleHuur: woont === "huur" ? String(t.tussen(250, 1100)) : woont === "kostgeld" ? String(t.tussen(0, 40) * 10) : "",
      woonlasten: woont === "inwonend" && t.kans(0.5),
      andereBewoners,
      kostendelers: andereBewoners || woont === "kostgeld" ? String(t.tussen(woont === "kostgeld" ? 1 : 0, 3)) : "",
      jongeHuisgenoten: andereBewoners ? String(t.tussen(0, 2)) : "",
      huisgenotenInkomen: andereBewoners ? String(t.tussen(0, 40) * 1000) : "",
      huisgenotenOnbekend: andereBewoners && t.kans(0.15),
      werktNu,
      werktAl: werktNu ? t.kies(["kort", "lang"] as const) : "",
      verandering,
      meerUren: verandering === "meer" ? String(nuUren + t.tussen(2, 16)) : "",
      nuUren: werktNu ? String(nuUren) : "",
      nuPer: werktNu ? nuPer : "",
      nuLoon: werktNu ? loon(t, nuPer, nuUren) : "",
      nuAllIn: werktNu && nuPer === "uur" ? t.kies(["nee", "ja", "onbekend"] as const) : "",
      medisch: t.kans(0.08),
      per: verandering === "meer" ? "" : per,
      loon: verandering === "meer" ? "" : loon(t, per, uren),
      uren: verandering === "meer" ? "" : String(uren),
      allIn: verandering !== "meer" && per === "uur" ? t.kies(["nee", "nee", "ja", "onbekend"] as const) : "",
      reiskosten: t.kans(0.3) ? String(t.tussen(10, 150)) : "",
      vergoeding: t.kans(0.2) ? String(t.tussen(10, 150)) : "",
      overigeKosten: t.kans(0.1) ? String(t.tussen(5, 60)) : "",
    };
    if (f.partnerWerkt) {
      f.partnerBruto = String(t.tussen(20, 150) * 10);
      f.partnerWerktAl = t.kies(["kort", "lang"] as const);
    }
    if (anderInkomen && !f.partneralimentatie) f.anderInkomen = String(t.tussen(5, 80) * 10);
    if (f.kinderalimentatieJa) f.kinderalimentatie = String(t.tussen(5, 50) * 10);
    // Alleen personen die het formulier in alle drie de stappen goedkeurt.
    if ([1, 2, 3].some((stap) => Object.keys(controleer(f, stap)).length > 0)) continue;
    uit.push({ naam: `Willekeurig ${zaad}-${uit.length + 1}`, f });
  }
  return uit;
}
