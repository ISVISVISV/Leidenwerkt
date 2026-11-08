import { describe, expect, it } from "vitest";
import { bereken, verschilEersteJaar, vrijlatingUitleg, type Invoer, type Resultaat } from "../src/index.ts";

function basis(over: Partial<Invoer> = {}): Invoer {
  return {
    datum: "2026-08-01",
    gemeente: "leiden",
    leefvorm: "alleenstaande",
    leeftijd: 35,
    kinderen: [],
    kostendelers: 0,
    wonen: { soort: "anders" },
    nieuwWerk: { brutoMaandloon: 0 },
    vrijlatingFase: "geen",
    ...over,
  };
}
const bijstand = (r: Resultaat, s: "huidig" | "werk" = "huidig") => r[s].posten.find((p) => p.id === "bijstand")!.perMaand;

describe("Leiden: lagere norm bij geen of lage woonkosten (CVDR760406 art. 3.1)", () => {
  // Gehuwdennorm 1 juli 2026: € 2.027,79. 10% = € 202,779; 19% = € 385,2801.
  it("geen woonkosten, wel gas/licht/water: norm min 10% van de gehuwdennorm", () => {
    const r = bereken(basis({ wonen: { soort: "geen_woonkosten", betaaltWoonlasten: true } }));
    expect(bijstand(r)).toBe("1216.68"); // 1419,46 − 202,779
  });
  it("geen woonkosten en geen woonlasten (bijvoorbeeld dakloos): 19%", () => {
    const r = bereken(basis({ wonen: { soort: "geen_woonkosten", dakloos: true, betaaltWoonlasten: false } }));
    expect(bijstand(r)).toBe("1034.18"); // 1419,46 − 385,2801
  });
  it("huur onder 10% van de gehuwdennorm: het verschil", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 150 } }));
    expect(bijstand(r)).toBe("1366.68"); // 1419,46 − (202,779 − 150)
  });
  it("niet bij de kostendelersnorm (alleen art. 21)", () => {
    const met = bereken(basis({ kostendelers: 1, wonen: { soort: "geen_woonkosten", betaaltWoonlasten: false } }));
    const zonder = bereken(basis({ kostendelers: 1 }));
    expect(bijstand(met)).toBe(bijstand(zonder));
  });
});

describe("huurtoeslag alleen bij een zelfstandige woning", () => {
  it("een kamer: geen huurtoeslag, en dat staat bij de aannames", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 500, zelfstandig: false } }));
    expect(r.huidig.posten.find((p) => p.id === "huurtoeslag")).toBeUndefined();
    expect(r.aannames.some((a) => a.includes("kamer"))).toBe(true);
  });
});

describe("verschil in de eerste 12 maanden", () => {
  it("tot en met 2026: 6 maanden met vrijlating en 6 zonder, niet 12 × het verschil van de eerste maanden", () => {
    const invoer = basis({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } });
    const start = Number(bereken({ ...invoer, vrijlatingFase: "start" }).verschilPerMaand);
    const later = Number(bereken({ ...invoer, vrijlatingFase: "later" }).verschilPerMaand);
    expect(start).toBeGreaterThan(later);
    expect(Number(verschilEersteJaar(invoer).bedrag)).toBeCloseTo(6 * start + 6 * later, 2);
    expect(verschilEersteJaar(invoer).startMaanden).toBe(6);
  });
  it("vanaf 2027 (art. 34a): de eerste 12 maanden zijn één periode", () => {
    expect(verschilEersteJaar(basis({ datum: "2027-02-01", nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } })).startMaanden).toBe(12);
  });
});

describe("medische urenbeperking", () => {
  it("de uitleg noemt de vrijlating onder y alleen als de gebruiker die heeft", () => {
    const zonder = vrijlatingUitleg(basis());
    const met = vrijlatingUitleg(basis({ medischUrenbeperkt: true }));
    expect(zonder.periodes.map((p) => p.regel).join(" ")).not.toContain("medische");
    expect(met.periodes[1].regel).toContain("medische urenbeperking");
    expect(met.citaten.map((c) => c.titel)).toContain("Participatiewet, art. 31 lid 2 onder y");
  });
  it("onder de 27 meteen de vrijlating onder y, in één periode", () => {
    const u = vrijlatingUitleg(basis({ leeftijd: 24, medischUrenbeperkt: true }));
    expect(u.periodes).toHaveLength(1);
    expect(u.periodes[0].regel).toContain("15%");
  });
  it("in de situatie zonder vrijlating ('geen') telt ook de medische vrijlating niet", () => {
    const w = { brutoMaandloon: 900, urenPerWeek: 16 };
    const geen = bereken(basis({ nieuwWerk: w, vrijlatingFase: "geen", medischUrenbeperkt: true }));
    const gewoon = bereken(basis({ nieuwWerk: w, vrijlatingFase: "geen" }));
    expect(bijstand(geen, "werk")).toBe(bijstand(gewoon, "werk"));
  });
});

describe("kinderopvang: eigen bijdrage en bijzondere bijstand", () => {
  it("noemt de mogelijkheid van bijzondere bijstand als er een eigen bijdrage overblijft", () => {
    const r = bereken(
      basis({
        leefvorm: "alleenstaande_ouder",
        kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 12.5 } }],
        nieuwWerk: { brutoMaandloon: 1800, urenPerWeek: 24 },
        vrijlatingFase: "start",
      }),
    );
    expect(r.signalen.some((s) => s.tekst.includes("bijzondere bijstand"))).toBe(true);
  });
});

describe("Leiden: vergoeding eigen bijdrage kinderopvang (CVDR677687 art. 1, 6 en 7 onder f)", () => {
  const ouder = (bruto: number, prijs = 12.5): Invoer =>
    basis({
      leefvorm: "alleenstaande_ouder",
      kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: prijs } }],
      nieuwWerk: { brutoMaandloon: bruto, urenPerWeek: 24 },
      vrijlatingFase: "start",
    });
  const p = (r: Resultaat, id: string) => r.werk.posten.find((x) => x.id === id);

  it("onder 110% van de rekennorm: de hele eigen bijdrage wordt vergoed", () => {
    const r = bereken(ouder(1200));
    const eigen = -Number(p(r, "opvangkosten")!.perMaand) - Number(p(r, "kot")!.perMaand);
    expect(Number(p(r, "bb_opvang")!.perMaand)).toBeCloseTo(eigen, 2);
  });
  it("rekennorm alleenstaande ouder: 90% van de gezinsnorm, zonder vakantietoeslag", () => {
    const r = bereken(ouder(1200));
    const stap = p(r, "bb_opvang")!.stappen.find((s) => s.tekst.startsWith("Bijstandsnorm voor de bijzondere bijstand"))!;
    expect(stap.bedrag).toBe("1733.76"); // 2.027,79 × 0,9 × 0,95
  });
  it("bij een hoog inkomen draagt u zelf meer bij, tot er niets meer vergoed wordt", () => {
    const laag = Number(p(bereken(ouder(2600)), "bb_opvang")?.perMaand ?? 0);
    const hoog = Number(p(bereken(ouder(4500)), "bb_opvang")?.perMaand ?? 0);
    expect(hoog).toBeLessThanOrEqual(laag);
    expect(hoog).toBe(0);
  });
  it("geen vergoeding zonder eigen bijdrage (opvang onder het maximum uurtarief, hoge toeslag)", () => {
    const r = bereken(ouder(1200, 8));
    const bb = p(r, "bb_opvang");
    expect(bb === undefined || Number(bb.perMaand) < 40).toBe(true);
  });
});

describe("verblijf in een inrichting (art. 23 Pw), bijvoorbeeld een woonvorm met begeleiding", () => {
  it("alleenstaande: € 449,44 + € 47,00 per 1 juli 2026, zonder kostendelersnorm en zonder huurtoeslag", () => {
    const r = bereken(basis({ kostendelers: 2, wonen: { soort: "instelling" } }));
    expect(bijstand(r)).toBe("496.44");
    expect(r.huidig.posten.find((p) => p.id === "huurtoeslag")).toBeUndefined();
  });
  it("gehuwden: € 699,11 + € 106,00", () => {
    const r = bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40 }, wonen: { soort: "instelling" } }));
    expect(bijstand(r)).toBe("805.11");
  });
  it("per 1 januari 2026: € 443,76 + € 47,00", () => {
    expect(bijstand(bereken(basis({ datum: "2026-03-01", wonen: { soort: "instelling" } })))).toBe("490.76");
  });
});

describe("huurtoeslag: iedereen in huis telt mee, ook jonger dan 27 (Awir art. 7; brochure stap 5)", () => {
  const huur = { soort: "huur" as const, kaleHuurPerMaand: 700 };
  it("een huisgenoot van 18 tot 27 telt mee voor het aantal personen en het inkomen", () => {
    const zonder = bereken(basis({ wonen: huur }));
    const met = bereken(basis({ wonen: huur, jongeHuisgenoten: 1, huisgenotenInkomenJaar: 15000 }));
    const ht = (r: Resultaat) => Number(r.huidig.posten.find((p) => p.id === "huurtoeslag")!.perMaand);
    expect(ht(met)).toBeLessThan(ht(zonder));
    // De bijstand verandert niet: de kostendelersnorm geldt pas vanaf 27 jaar.
    expect(bijstand(met)).toBe(bijstand(zonder));
  });
  it("zonder inkomen van de jonge huisgenoot: huurtoeslag niet berekend", () => {
    const r = bereken(basis({ wonen: huur, jongeHuisgenoten: 1 }));
    expect(r.huidig.posten.find((p) => p.id === "huurtoeslag")!.perMaand).toBeNull();
  });
});
