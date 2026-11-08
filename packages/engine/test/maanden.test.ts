import { describe, expect, it } from "vitest";
import { bereken, maandoverzicht, type Invoer } from "../src/index.ts";

const invoer = (bruto: number): Invoer => ({
  datum: "2026-09-01",
  gemeente: "leiden",
  leefvorm: "alleenstaande",
  leeftijd: 35,
  kinderen: [],
  kostendelers: 0,
  wonen: { soort: "anders" },
  nieuwWerk: { brutoMaandloon: bruto, urenPerWeek: 20 },
  vrijlatingFase: "start",
});
const bijstand = (i: Invoer, fase: "start" | "later", s: "huidig" | "werk") =>
  Number(bereken({ ...i, vrijlatingFase: fase })[s].posten.find((p) => p.id === "bijstand")!.perMaand);

describe("overzicht per maand", () => {
  it("loon wordt achteraf verrekend: maand 1 de bijstand van nu, maand 2 de bijstand met het loon van maand 1", () => {
    const i = invoer(1000);
    const o = maandoverzicht(i, "2026-10");
    expect(Number(o.maanden[0].bijstand)).toBeCloseTo(bijstand(i, "start", "huidig") * 0.95, 2);
    expect(Number(o.maanden[1].bijstand)).toBeCloseTo(bijstand(i, "start", "werk") * 0.95, 2);
    // Maand 8 wordt verrekend met het loon van maand 7: geen vrijlating meer.
    expect(Number(o.maanden[7].bijstand)).toBeCloseTo(bijstand(i, "later", "werk") * 0.95, 2);
    expect(o.maanden[6].fase).toBe("later");
  });
  it("vakantiegeld van de werkgever in mei, vakantietoeslag van de bijstand in juni", () => {
    const o = maandoverzicht(invoer(1000), "2026-10");
    const mei = o.maanden.find((m) => m.maand === "2027-05")!;
    const juni = o.maanden.find((m) => m.maand === "2027-06")!;
    expect(mei.eenmalig.some((e) => e.wat.startsWith("Vakantiegeld"))).toBe(true);
    expect(juni.eenmalig.some((e) => e.wat.startsWith("Vakantietoeslag"))).toBe(true);
  });
  it("stopt de bijstand, dan komt de opgebouwde vakantietoeslag in die maand (uiterlijk 3 maanden later)", () => {
    const o = maandoverzicht(invoer(2600), "2026-10");
    expect(o.bijstandStopt).toBe("2026-11");
    const stop = o.maanden[1];
    expect(stop.bijstand).toBe("0.00");
    const vt = stop.eenmalig.find((e) => e.wat.includes("omdat de bijstand stopt"));
    expect(vt).toBeDefined();
    expect(vt!.wat).toContain("2027-01");
    // Opgebouwd sinds juni: 4 maanden vóór de start plus de eerste werkmaand, 5% van de bijstand.
    const b = bijstand(invoer(2600), "start", "huidig");
    expect(Number(vt!.bedrag)).toBeCloseTo(b * 0.05 * 5, 1);
  });
});

describe("overzicht per maand over de jaargrens", () => {
  it("meldt dat er vanaf januari 2027 andere regels gelden", () => {
    expect(maandoverzicht(invoer(1000), "2026-10").andereRegelsVanaf).toBe("2027-01");
    expect(maandoverzicht({ ...invoer(1000), datum: "2026-01-15" }, "2026-01").andereRegelsVanaf).toBe(undefined);
  });
});
