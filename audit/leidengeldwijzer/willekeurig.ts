/**
 * Willekeurige, verzonnen personen voor `npm run audit:leidengeldwijzer -- --willekeurig 200 --zaad 7`.
 * Hetzelfde zaad geeft dezelfde personen, zodat een gevonden fout na te doen is. Alleen personen die het
 * formulier in alle drie de stappen goedkeurt, doen mee.
 */
import { controleer, zetVandaag, type Bedragsoort, type Bezit, type Formulier, type InkomenVelden } from "../../leidengeldwijzer/src/formulier.ts";
import { toeval } from "../../scripts/audit-kern.ts";
import { REKENDATUM, formulier, type Persoon } from "./personen.ts";

type Toeval = ReturnType<typeof toeval>;
const datum = (leeftijd: number, t: Toeval) =>
  `${String(t.tussen(1, 28)).padStart(2, "0")}-${String(t.tussen(1, 12)).padStart(2, "0")}-${Number(REKENDATUM.slice(0, 4)) - leeftijd - 1}`;

const SOORTEN: Bedragsoort[] = ["loon", "uwv", "aow", "bedrijf", "studiefinanciering", "partneralimentatie", "kinderalimentatie", "ander"];

function inkomen(t: Toeval): InkomenVelden {
  if (t.kans(0.15)) return { soorten: ["geen"], bedragen: {}, uitkering: "" };
  const aantal = t.kans(0.7) ? 1 : 2;
  const soorten = [...new Set(Array.from({ length: aantal }, () => t.kies(SOORTEN)))];
  const bedragen = Object.fromEntries(soorten.map((s) => [s, String(t.tussen(1, 60) * 50)]));
  return { soorten, bedragen, uitkering: soorten.includes("uwv") ? t.kies(["ww", "wajong", "wia", "ziektewet", "anders"] as const) : "" };
}

export function willekeurigePersonen(aantal: number, zaad: number): Persoon[] {
  zetVandaag(REKENDATUM);
  const t = toeval(zaad);
  const uit: Persoon[] = [];
  let poging = 0;
  while (uit.length < aantal && poging < aantal * 20) {
    poging++;
    const paar = t.kans(0.35);
    const kinderen = t.kans(0.4) ? Array.from({ length: t.tussen(1, 3) }, () => datum(t.tussen(0, 22), t)) : [];
    const woont = t.kies(["huur", "huur", "huur", "kamer", "koop", "kostgeld", "inwonend", "dakloos", "instelling"] as const);
    const bijstand = t.kans(0.3);
    const aantalAnderen = t.tussen(1, 3);
    const bezit: Bezit[] = t.kans(0.25) ? ["niets"] : [...new Set(Array.from({ length: t.tussen(1, 3) }, () => t.kies(["betaal", "spaar", "voertuig", "beleggingen", "spullen", "schuld"] as const)))];
    const bedrag = (max: number) => String(t.tussen(0, max / 100) * 100);
    const f: Formulier = formulier({
      geboren: datum(t.tussen(18, 85), t),
      partner: paar ? "ja" : "nee",
      partnerGeboren: paar ? datum(t.tussen(18, 85), t) : "",
      heeftKinderen: kinderen.length ? "ja" : "nee",
      kinderen: kinderen.length ? kinderen : [""],
      kinderbijslag: t.kans(0.9) ? "ja" : "nee",
      woont,
      kaleHuur: woont === "huur" ? String(t.tussen(300, 1200)) : "",
      kindInfo: kinderen.map(() => ({
        opvang: t.kans(0.3) ? ("ja" as const) : ("nee" as const),
        soort: t.kies(["dagopvang", "bso", "gastouder"] as const),
        uren: String(t.tussen(4, 40)),
        prijs: t.kans(0.5) ? String(t.tussen(7, 13)) : "",
        inkomen: String(t.tussen(0, 300) * 100),
        inkomenOnbekend: t.kans(0.2),
      })),
      andereBewoners: t.kans(0.15) ? "ja" : "nee",
      andereAantal: String(aantalAnderen),
      andereOuder: String(t.tussen(0, aantalAnderen)),
      andereInkomen: String(t.tussen(0, 400) * 100),
      andereOnbekend: t.kans(0.2),
      bijstand: bijstand ? "ja" : "nee",
      inkomen: inkomen(t),
      partnerInkomen: inkomen(t),
      langLaag: t.kies(["ja", "nee", "onbekend"] as const),
      studieMedisch: t.kans(0.5) ? "ja" : "nee",
      bezit,
      betaalrekening: bedrag(3000),
      spaarrekening: bedrag(40000),
      voertuigen: Array.from({ length: t.tussen(1, 2) }, () => bedrag(15000)),
      beleggingen: bedrag(70000),
      spullen: bedrag(10000),
      schulden: bedrag(20000),
    });
    // Alleen personen die het formulier goedkeurt (bijvoorbeeld geen kinderbijslag-antwoord zonder minderjarig kind is prima).
    if ([1, 2, 3].some((stap) => Object.keys(controleer(f, stap)).length > 0)) continue;
    uit.push({ naam: `Willekeurig ${zaad}-${uit.length + 1}`, f });
  }
  return uit;
}
