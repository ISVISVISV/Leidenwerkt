/**
 * Onafhankelijke toets: de rekenvoorbeelden die Dienst Toeslagen zelf
 * publiceert in de brochures "Berekening ... 2026". Deze uitkomsten komen
 * niet uit onze eigen lezing van de wet, maar van de uitvoerder.
 * Bronnen staan per blok; afronding: naar beneden op hele euro's per maand.
 */
import { describe, expect, it } from "vitest";
import { Lezer, standaardRegels } from "../src/regels.ts";
import { D } from "../src/geld.ts";
import { huurtoeslag, zorgtoeslag, kindgebondenBudget, kinderopvangtoeslag, maandbedragToeslag } from "../src/modules/toeslagen.ts";

const l = () => new Lezer(standaardRegels, "2026-09-01");
const maand = (jaar: ReturnType<typeof D>) => maandbedragToeslag(jaar.div(12)).toFixed(0);

describe("Berekening huurtoeslag 2026 (Dienst Toeslagen, TG 083-1Z62FD)", () => {
  it("rekenvoorbeeld 2: Demi en Sophie met kind, huur € 1.200, rekeninkomen € 34.000 → € 492", () => {
    const h = huurtoeslag(l(), D(1200), D(34000), 3);
    expect(h.rekenhuur.toFixed(2)).toBe("932.93");
    expect(h.deelA.toFixed(2)).toBe("297.49");
    expect(h.deelB.toFixed(2)).toBe("172.86");
    expect(h.deelC.toFixed(2)).toBe("67.52"); // brochure: 67,51 (afgekapt); 168,79 × 40% = 67,516
    expect(h.correctie.toFixed(2)).toBe("45.83");
    expect(maandbedragToeslag(h.perMaand).toFixed(0)).toBe("492");
  });

  it("rekenvoorbeeld 3: Marina alleen, huur € 710, rekeninkomen € 29.000 → € 307", () => {
    const h = huurtoeslag(l(), D(710), D(29000), 1);
    expect(h.deelA.toFixed(2)).toBe("295.68");
    expect(h.deelB.toFixed(2)).toBe("137.67");
    expect(h.deelC.toFixed(2)).toBe("0.00");
    expect(h.correctie.toFixed(2)).toBe("125.44");
    expect(maandbedragToeslag(h.perMaand).toFixed(0)).toBe("307");
  });

  it("onder het minimum-inkomensijkpunt geen correctie", () => {
    const h = huurtoeslag(l(), D(600), D(23000), 1);
    expect(h.correctie.isZero()).toBe(true);
  });
});

describe("Berekening zorgtoeslag 2026 (Dienst Toeslagen, TG 082-1Z62FD)", () => {
  it("rekenvoorbeeld 1: Wouter, € 19.000 → € 129,20 → € 129", () => {
    expect(zorgtoeslag(l(), D(19000), false).toFixed(2)).toBe("1550.45");
    expect(maand(zorgtoeslag(l(), D(19000), false))).toBe("129");
  });
  it("rekenvoorbeeld 2: normpremie met partner bij € 33.200 is € 1.750,98", () => {
    // Subtotaal in de brochure: € 4.238 − € 1.750,98 = € 2.487,02 (daarna 50% voor een militair; dat ondersteunen we niet).
    expect(zorgtoeslag(l(), D(33200), true).toFixed(2)).toBe("2487.02");
  });
});

describe("Berekening kindgebonden budget 2026 (Dienst Toeslagen, TG 081-1Z61FD)", () => {
  it("rekenvoorbeeld 1: twee kinderen (4 en 8), € 45.000 samen → € 392", () => {
    const j = kindgebondenBudget(l(), D(45000), [{ leeftijd: 4 }, { leeftijd: 8 }], true);
    expect(j.toFixed(2)).toBe("4714.72");
    expect(maand(j)).toBe("392");
  });
  it("rekenvoorbeeld 2: twee kinderen (16 en 13), € 45.000 samen → € 533", () => {
    // De brochure noemt in de tekst € 510, maar rekent zelf € 533,56 → € 533.
    const j = kindgebondenBudget(l(), D(45000), [{ leeftijd: 16 }, { leeftijd: 13 }], true);
    expect(j.toFixed(2)).toBe("6402.72");
    expect(maand(j)).toBe("533");
  });
  it("rekenvoorbeeld 3: Mario, alleenstaande ouder, kind 8, € 30.000 → € 497", () => {
    const j = kindgebondenBudget(l(), D(30000), [{ leeftijd: 8 }], false);
    expect(j.toFixed(2)).toBe("5975.94");
    expect(maand(j)).toBe("497");
  });
});

describe("Berekening kinderopvangtoeslag 2026 (Dienst Toeslagen, TG 080-1Z61FD)", () => {
  const kot = (ti: number, kinderen: Parameters<typeof kinderopvangtoeslag>[2]) =>
    maandbedragToeslag(kinderopvangtoeslag(l(), D(ti), kinderen).toeslagPerMaand).toFixed(0);
  it("rekenvoorbeeld 1: € 60.000, 122 uur dagopvang à € 10,50 → € 1.202", () => {
    expect(kot(60000, [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 122, uurprijs: 10.5 } }])).toBe("1202");
  });
  it("rekenvoorbeeld 2: € 120.000, dagopvang 87 uur à € 12,45 en bso 65 uur à € 10,10 → € 1.162", () => {
    expect(
      kot(120000, [
        { leeftijd: 7, opvang: { soort: "bso", urenPerMaand: 65, uurprijs: 10.1 } },
        { leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 87, uurprijs: 12.45 } },
      ]),
    ).toBe("1162");
  });
  it("rekenvoorbeeld 3: Anne, € 40.000, 240 uur gastouder à € 8,25 (max. 230 uur) → € 1.821", () => {
    expect(kot(40000, [{ leeftijd: 1, opvang: { soort: "gastouder", urenPerMaand: 240, uurprijs: 8.25 } }])).toBe("1821");
  });
  it("rekenvoorbeeld 4: € 50.000, 108 uur gastouder à € 9,52 → € 880", () => {
    expect(kot(50000, [{ leeftijd: 1, opvang: { soort: "gastouder", urenPerMaand: 108, uurprijs: 9.52 } }])).toBe("880");
  });
  it("inkomen tussen twee tabelrijen (€ 24.149,50) valt in de juiste rij", () => {
    const r = kinderopvangtoeslag(l(), D("24149.50"), [{ leeftijd: 1, opvang: { soort: "dagopvang", urenPerMaand: 100, uurprijs: 10 } }]);
    expect(r.perKind[0].percentage.toFixed(2)).toBe("0.96");
  });
});
