/**
 * Regimes voor de verrekening van inkomsten en het overgangsrecht per 2027.
 *
 * De bijstandsnormen voor 2027 zijn nog niet gepubliceerd. Om het mechanisme
 * te toetsen, voegt deze test TESTNORMEN toe die alleen hier bestaan. Ze
 * staan niet in regels/ en worden nooit in de app gebruikt.
 */
import { describe, expect, it } from "vitest";
import { bereken, regimeOp, RegelSet, ruweParameters, vrijlatingUitleg, type Invoer, type RuweParameter } from "../src/index.ts";
import { D } from "../src/geld.ts";
import { Lezer } from "../src/regels.ts";
import { vrijlating } from "../src/modules/vrijlating.ts";

const TESTNORM = (id: string, bedrag: string): RuweParameter => ({
  id,
  omschrijving: "TESTNORM, alleen voor deze test",
  eenheid: "euro_per_maand",
  waarde: { soort: "bedrag", bedrag },
  status: "onbevestigd",
  bron: { titel: "Testwaarde", url: "https://wetten.overheid.nl/", geraadpleegd_op: "2026-11-08" },
  geldig_van: "2027-01-01",
  geldig_tot: null,
});
const met2027 = new RegelSet([
  ...ruweParameters.filter((p) => !(p.geldig_van === "2027-01-01" && p.id.startsWith("pw.norm."))),
  TESTNORM("pw.norm.alleenstaande", "1450.00"),
  TESTNORM("pw.norm.gehuwden", "2071.43"),
  // TEST: belastingregels 2026 ook voor 2027, alleen om het netto loon te kunnen berekenen.
  ...ruweParameters
    .filter((p) => p.id.startsWith("ib.") && p.geldig_van === "2026-01-01")
    .map((p) => ({ ...p, omschrijving: "TEST: kopie 2026", geldig_van: "2027-01-01", geldig_tot: null })),
]);

const basis = (over: Partial<Invoer> = {}): Invoer => ({
  datum: "2027-03-01",
  gemeente: "leiden",
  leefvorm: "alleenstaande",
  leeftijd: 35,
  kinderen: [],
  kostendelers: 0,
  wonen: { soort: "anders" },
  nieuwWerk: { brutoMaandloon: 1000 },
  vrijlatingFase: "start",
  ...over,
});

describe("regimekeuze op rekendatum", () => {
  it("kiest het regime alleen op datum", () => {
    expect(regimeOp("2026-12-31").id).toBe("pw31");
    expect(regimeOp("2027-01-01").id).toBe("pw34a");
    expect(regimeOp("2030-06-01").id).toBe("pw34a");
  });
});

describe("vrijlating tot en met 2026 (art. 31 Pw)", () => {
  const l = () => new Lezer(met2027, "2026-09-01");
  const vraag = { nettoArbeid: D(1000), alleenstaandeOuderMetJongKind: false };
  it("geen vrijlating onder de 27 jaar (art. 31 lid 5)", () => {
    expect(vrijlating(l(), { ...vraag, fase: "start", leeftijd: 26 }).bedrag.toFixed(2)).toBe("0.00");
    expect(vrijlating(l(), { ...vraag, fase: "start", leeftijd: 27 }).bedrag.toFixed(2)).toBe("250.00");
  });
  it("medische urenbeperking: 15%, maximaal € 182,73, ook na maand 6 en onder de 27", () => {
    expect(vrijlating(l(), { ...vraag, fase: "later", leeftijd: 40, medischUrenbeperkt: true }).bedrag.toFixed(2)).toBe("150.00");
    expect(vrijlating(l(), { ...vraag, nettoArbeid: D(2000), fase: "later", leeftijd: 40, medischUrenbeperkt: true }).bedrag.toFixed(2)).toBe("182.73");
    expect(vrijlating(l(), { ...vraag, fase: "start", leeftijd: 24, medischUrenbeperkt: true }).bedrag.toFixed(2)).toBe("150.00");
  });
});

describe("bijverdienregeling vanaf 2027 (art. 34a Pw)", () => {
  const l = () => new Lezer(met2027, "2027-03-01");
  const vraag = { alleenstaandeOuderMetJongKind: false, leeftijd: 35 };
  it("15% zonder maximumbedrag", () => {
    expect(vrijlating(l(), { ...vraag, fase: "start", nettoArbeid: D(1000) }).bedrag.toFixed(2)).toBe("150.00");
    expect(vrijlating(l(), { ...vraag, fase: "start", nettoArbeid: D(3000) }).bedrag.toFixed(2)).toBe("450.00");
  });
  it("geldt niet als het inkomen boven de bijstandsnorm ligt (memorie van toelichting art. 34a)", () => {
    const v = vrijlating(l(), { ...vraag, fase: "start", nettoArbeid: D(1500), huishoudinkomen: D(1500), norm: D(1450) });
    expect(v.bedrag.toFixed(2)).toBe("0.00");
    expect(vrijlating(l(), { ...vraag, fase: "start", nettoArbeid: D(1400), huishoudinkomen: D(1400), norm: D(1450) }).bedrag.toFixed(2)).toBe("210.00");
  });
  it("geldt ook onder de 27 jaar", () => {
    expect(vrijlating(l(), { ...vraag, leeftijd: 22, fase: "start", nettoArbeid: D(1000) }).bedrag.toFixed(2)).toBe("150.00");
  });
  it("na 12 maanden niets (tenzij de gemeente verlengt)", () => {
    const v = vrijlating(l(), { ...vraag, fase: "later", nettoArbeid: D(1000) });
    expect(v.bedrag.toFixed(2)).toBe("0.00");
    expect(v.aannames.join(" ")).toContain("verlengen");
  });
});

describe("overgangsrecht art. 78ff Pw", () => {
  const l = (datum = "2027-03-01") => new Lezer(met2027, datum);
  const vraag = { alleenstaandeOuderMetJongKind: false, leeftijd: 35, fase: "start" as const };
  it("lid 2: oude vrijlating n loopt door met het bedrag van 31 december 2026 (25%, max € 289)", () => {
    const lezer = l();
    const v = vrijlating(lezer, { ...vraag, nettoArbeid: D(2000), overgang: "n" });
    expect(v.bedrag.toFixed(2)).toBe("289.00");
    expect(lezer.gebruikt.find((g) => g.id === "pw.vrijlating_n.maximum")?.geldigVan).toBe("2026-07-01");
  });
  it("lid 2: na 12 maanden na 1 januari 2027 vervalt het overgangsrecht", () => {
    const v = vrijlating(l("2028-01-01"), { ...vraag, nettoArbeid: D(2000), overgang: "n" });
    expect(v.bedrag.toFixed(2)).toBe("300.00"); // gewone bijverdienregeling, 15%
  });
  it("lid 3: alleenstaande ouder met oude r-vrijlating krijgt 15% zonder maximum", () => {
    const v = vrijlating(l(), { ...vraag, alleenstaandeOuderMetJongKind: true, nettoArbeid: D(2000), overgang: "r" });
    expect(v.bedrag.toFixed(2)).toBe("300.00");
  });
  it("de app-uitleg noemt de rest van de oude periode", () => {
    const u = vrijlatingUitleg(basis({ overgang2027: "n" }), met2027);
    expect(u.periodes[0].naam).toBe("Rest van uw 6 maanden");
    expect(u.periodes[0].regel).toMatch(/€\s289,00/);
  });
});

describe("hele berekening in 2027 met testnormen", () => {
  it("bijstand = norm − (netto − 15%)", () => {
    const r = bereken(basis(), met2027);
    expect(r.regime.id).toBe("pw34a");
    const netto = D(r.werk.posten.find((p) => p.id === "loon")!.perMaand!);
    const bijstand = r.werk.posten.find((p) => p.id === "bijstand")!.perMaand!;
    const verwacht = D("1450.00").minus(netto.minus(netto.times("0.15")));
    expect(D(bijstand).minus(verwacht).abs().lte("0.01")).toBe(true);
  });
  it("zonder testnormen wordt in 2027 geen bijstand berekend", () => {
    const r = bereken(basis());
    expect(r.werk.posten.find((p) => p.id === "bijstand")!.perMaand).toBeNull();
  });
});
