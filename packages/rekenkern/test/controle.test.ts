import { describe, expect, it } from "vitest";
import { bereken, type Invoer, type Resultaat } from "../src/index.js";

/**
 * Bewaakt het met de hand uitgerekende voorbeeld in docs/CONTROLE.md.
 * Verandert een van deze bedragen, pas dan ook dat document aan.
 */
describe("het uitgewerkte voorbeeld in docs/CONTROLE.md", () => {
  const invoer = (fase: "start" | "later"): Invoer => ({
    datum: "2026-11-10",
    gemeente: "leiden",
    leefvorm: "alleenstaande",
    leeftijd: 40,
    kinderen: [],
    kostendelers: 0,
    wonen: { soort: "anders" }, // koopwoning
    nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 },
    vrijlatingFase: fase,
  });
  const post = (r: Resultaat, kant: "huidig" | "werk", id: string) => r[kant].posten.find((p) => p.id === id)!.perMaand;

  it("maand 1 t/m 6: netto loon € 965,00, bijstand € 695,71, € 241,25 meer", () => {
    const r = bereken(invoer("start"));
    expect(post(r, "huidig", "bijstand")).toBe("1419.46");
    expect(post(r, "huidig", "zorgtoeslag")).toBe("129.00");
    expect(r.huidig.besteedbaarPerMaand).toBe("1548.46");
    expect(post(r, "werk", "loon")).toBe("965.00");
    expect(post(r, "werk", "bijstand")).toBe("695.71");
    expect(post(r, "werk", "zorgtoeslag")).toBe("129.00");
    expect(r.werk.besteedbaarPerMaand).toBe("1789.71");
    expect(r.verschilPerMaand).toBe("241.25");
  });

  it("vanaf maand 7: bijstand € 454,46, evenveel als nu", () => {
    const r = bereken(invoer("later"));
    expect(post(r, "werk", "bijstand")).toBe("454.46");
    expect(r.werk.besteedbaarPerMaand).toBe("1548.46");
    expect(r.verschilPerMaand).toBe("0.00");
  });
});
