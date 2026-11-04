import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { bereken, standaardRegels, type Invoer, type Resultaat } from "../src/index.ts";
import { Lezer } from "../src/regels.ts";
import { D } from "../src/geld.ts";
import { nettoLoon, brutoUitNetto, progressief, stuksgewijs } from "../src/modules/belasting.ts";
import { bijstandsnorm } from "../src/modules/bijstand.ts";

const JULI = "2026-08-01";

function basis(over: Partial<Invoer> = {}): Invoer {
  return {
    datum: JULI,
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

const post = (r: Resultaat, s: "huidig" | "werk", id: string) => r[s].posten.find((p) => p.id === id);

describe("belasting 2026", () => {
  const l = new Lezer(standaardRegels, JULI);

  it("rekent het voorbeeld van € 30.000 bruto exact uit", () => {
    // 30.000 × 35,75% = 10.725; AHK = 3.115 − 6,398% × 264 = 3.098,11;
    // AK = 5.300 + 1,95% × 4.155 = 5.381,0225; heffing = 2.245,8675.
    const r = nettoLoon(l, D(30000));
    expect(r.belasting.toFixed(2)).toBe("10725.00");
    expect(r.ahk.toFixed(4)).toBe("3098.1093");
    expect(r.arbeidskorting.toFixed(4)).toBe("5381.0225");
    expect(r.nettoJaar.toFixed(2)).toBe("27754.13");
  });

  it("arbeidskorting sluit aan op de knikpunten (geen sprongen)", () => {
    const ak = l.schijven("ib.arbeidskorting");
    for (const knik of [11965, 25845, 45592, 132920]) {
      const net = stuksgewijs(ak, D(knik).minus("0.01"));
      const op = stuksgewijs(ak, D(knik));
      expect(op.minus(net).abs().toNumber()).toBeLessThan(1.5);
    }
  });

  it("progressieve belasting over twee schijven", () => {
    const s = l.schijven("ib.box1.schijven");
    // 38.883 × 35,75% + 1.117 × 37,56%
    expect(progressief(s, D(40000)).toFixed(2)).toBe(D(38883).times("0.3575").plus(D(1117).times("0.3756")).toFixed(2));
  });

  it("bruto uit netto is de inverse van de nettoberekening zonder arbeidskorting", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 60000 }), (netto) => {
        const bruto = brutoUitNetto(l, D(netto));
        const tax = progressief(l.schijven("ib.box1.schijven"), bruto).minus(stuksgewijs(l.schijven("ib.ahk"), bruto));
        const terug = bruto.minus(tax.isNegative() ? 0 : tax);
        return terug.minus(netto).abs().lte("0.02");
      }),
      { numRuns: 200 },
    );
  });
});

describe("bijstand", () => {
  it("volledige bijstand alleenstaande per 1 juli 2026", () => {
    const r = bereken(basis());
    expect(post(r, "huidig", "bijstand")?.perMaand).toBe("1419.46");
    expect(post(r, "huidig", "bijstand")?.status).toBe("geverifieerd");
  });

  it("kiest de norm die op de datum geldt", () => {
    expect(post(bereken(basis({ datum: "2026-06-30" })), "huidig", "bijstand")?.perMaand).toBe("1401.50");
    expect(post(bereken(basis({ datum: "2026-07-01" })), "huidig", "bijstand")?.perMaand).toBe("1419.46");
  });

  it("rekent niet met verzonnen normen voor 2027", () => {
    const r = bereken(basis({ datum: "2027-01-15" }));
    const b = post(r, "huidig", "bijstand");
    expect(b?.perMaand).toBeNull();
    expect(b?.reden).toContain("pw.norm.alleenstaande");
    expect(r.nietMeegenomen.map((n) => n.id)).toContain("bijstand");
  });

  it("vrijlating 25% onder het maximum", () => {
    // Netto loon via de motor; bijstand = norm − (netto − 25% × netto).
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 800 }, vrijlatingFase: "start" }));
    const netto = D(post(r, "werk", "loon")!.perMaand!);
    const verwacht = D("1419.46").minus(netto.minus(netto.times("0.25")));
    expect(post(r, "werk", "bijstand")!.perMaand).toBe(verwacht.toFixed(2));
  });

  it("vrijlating wordt afgetopt op € 289", () => {
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 1300 }, vrijlatingFase: "start" }));
    const netto = D(post(r, "werk", "loon")!.perMaand!);
    expect(netto.times("0.25").gt(289)).toBe(true);
    const verwacht = D("1419.46").minus(netto.minus(289));
    expect(post(r, "werk", "bijstand")!.perMaand).toBe(verwacht.toFixed(2));
  });

  it("alleenstaande ouder met jong kind houdt na 6 maanden 12,5% vrij, max € 180,17", () => {
    const r = bereken(
      basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 4 }], nieuwWerk: { brutoMaandloon: 1000 }, vrijlatingFase: "later" }),
    );
    const netto = D(post(r, "werk", "loon")!.perMaand!);
    const vrij = netto.times("0.125").lt("180.17") ? netto.times("0.125") : D("180.17");
    expect(post(r, "werk", "bijstand")!.perMaand).toBe(D("1419.46").minus(netto.minus(vrij)).toFixed(2));
  });

  it("kostendelersnorm: alleenstaande met één huisgenoot van 27+ krijgt 50% van de gehuwdennorm", () => {
    const l = new Lezer(standaardRegels, JULI);
    const { norm } = bijstandsnorm(l, basis({ kostendelers: 1 }));
    expect(norm.toFixed(3)).toBe(D("2027.79").times("0.5").toFixed(3));
  });

  it("geen bijstand meer bij een voltijdbaan", () => {
    const r = bereken(basis({ nieuwWerk: { brutoUurloon: 16, urenPerWeek: 36 } }));
    expect(post(r, "werk", "bijstand")!.perMaand).toBe("0.00");
  });
});

describe("toeslagen", () => {
  it("maximale zorgtoeslag alleenstaande zonder werk", () => {
    // (2.119 − 1,912% × 29.736) / 12 = 129,204
    const r = bereken(basis());
    expect(post(r, "huidig", "zorgtoeslag")!.perMaand).toBe("129.20");
    expect(post(r, "huidig", "zorgtoeslag")!.status).toBe("onbevestigd");
  });

  it("huurtoeslag wordt niet berekend zolang het minimum-inkomensijkpunt ontbreekt", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 650 } }));
    expect(post(r, "huidig", "huurtoeslag")!.perMaand).toBeNull();
    expect(r.nietMeegenomen.some((n) => n.id === "huurtoeslag")).toBe(true);
  });

  it("kindgebonden budget alleenstaande ouder met 1 kind van 8 bij laag inkomen", () => {
    const r = bereken(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 8 }] }));
    // (2.580 + 3.416) / 12 = 499,67
    expect(post(r, "huidig", "kgb")!.perMaand).toBe("499.67");
  });

  it("kinderopvangtoeslag alleen in de werksituatie, 96% bij laag inkomen", () => {
    const r = bereken(
      basis({
        leefvorm: "alleenstaande_ouder",
        kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 11 } }],
        nieuwWerk: { brutoUurloon: 15, urenPerWeek: 24 },
      }),
    );
    expect(post(r, "huidig", "kot")).toBeUndefined();
    expect(post(r, "werk", "kot")!.perMaand).toBe(D(80).times(11).times("0.96").toFixed(2));
    expect(post(r, "werk", "opvangkosten")!.perMaand).toBe("-880.00");
  });
});

describe("vergelijking en uitleg", () => {
  it("verschil is besteedbaar werk min besteedbaar huidig", () => {
    const r = bereken(basis({ nieuwWerk: { brutoUurloon: 15, urenPerWeek: 32, reiskostenPerMaand: 60 } }));
    expect(D(r.verschilPerMaand).toFixed(2)).toBe(D(r.werk.besteedbaarPerMaand).minus(r.huidig.besteedbaarPerMaand).toFixed(2));
    expect(D(r.verschilPerJaar).toFixed(2)).toBe(D(r.verschilPerMaand).times(12).toFixed(2));
  });

  it("gebruikt alleen regels die op de rekendatum gelden", () => {
    for (const datum of ["2026-03-01", "2026-09-01"]) {
      const r = bereken(basis({ datum, nieuwWerk: { brutoMaandloon: 1500 }, vrijlatingFase: "start" }));
      for (const p of [...r.huidig.posten, ...r.werk.posten]) {
        for (const g of p.parameters) {
          expect(g.geldigVan <= datum).toBe(true);
          const def = standaardRegels.zoek(g.id, datum)!;
          expect(def.geldig_van).toBe(g.geldigVan);
        }
      }
    }
  });

  it("elke gebruikte parameter heeft een bron", () => {
    const r = bereken(
      basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 3 }], nieuwWerk: { brutoMaandloon: 1800 }, vrijlatingFase: "start" }),
    );
    for (const p of [...r.huidig.posten, ...r.werk.posten]) for (const g of p.parameters) expect(g.bron?.url).toMatch(/^https:\/\//);
  });

  it("is deterministisch", () => {
    const invoer = basis({ nieuwWerk: { brutoUurloon: 14.5, urenPerWeek: 20 }, vrijlatingFase: "start" });
    expect(JSON.stringify(bereken(invoer))).toBe(JSON.stringify(bereken(invoer)));
  });

  it("weigert ongeldige invoer", () => {
    expect(() => bereken(basis({ leeftijd: 19 }))).toThrow();
    expect(() => bereken(basis({ nieuwWerk: { brutoMaandloon: -5 } }))).toThrow();
  });

  it("geldt voor elk uurloon en aantal uren zonder fouten (eigenschapstest)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1400, max: 4000 }), fc.integer({ min: 0, max: 40 }), (cent, uren) => {
        const r = bereken(basis({ nieuwWerk: { brutoUurloon: cent / 100, urenPerWeek: uren }, vrijlatingFase: "start" }));
        const bijstand = D(post(r, "werk", "bijstand")!.perMaand!);
        return bijstand.gte(0) && bijstand.lte("1419.46");
      }),
      { numRuns: 150 },
    );
  });
});
