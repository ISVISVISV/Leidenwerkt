/**
 * Eigenschapstests die de vorm van de wet volgen: geen sprongen bij grenzen,
 * dalend of stijgend waar de wet dat voorschrijft.
 *
 * Bewust NIET getest: dat het totale besteedbare inkomen stijgt met het loon.
 * Dat hoeft niet; juist die armoedeval moet de app zichtbaar maken.
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { bereken, type Invoer } from "../src/index.ts";
import { Lezer, standaardRegels } from "../src/regels.ts";
import { D } from "../src/geld.ts";
import { zorgtoeslag, kindgebondenBudget, huurtoeslag, kinderopvangtoeslag } from "../src/modules/toeslagen.ts";
import { vrijlating } from "../src/modules/vrijlating.ts";

const l = () => new Lezer(standaardRegels, "2026-09-01");
const inkomen = fc.integer({ min: 0, max: 80_000 });

describe("zorgtoeslag", () => {
  it("daalt nooit als het inkomen stijgt, en per euro meer inkomen met hoogstens 13,73 cent", () => {
    fc.assert(
      fc.property(inkomen, fc.integer({ min: 1, max: 5000 }), fc.boolean(), (x, dx, partner) => {
        const a = zorgtoeslag(l(), D(x), partner);
        const b = zorgtoeslag(l(), D(x + dx), partner);
        return b.lte(a) && a.minus(b).lte(D(dx).times("0.1373").plus("0.000001"));
      }),
      { numRuns: 300 },
    );
  });
  it("geen sprong bij het drempelinkomen", () => {
    const voor = zorgtoeslag(l(), D("29735.99"), false);
    const na = zorgtoeslag(l(), D("29736.01"), false);
    expect(voor.minus(na).abs().lt("0.01")).toBe(true);
  });
});

describe("huurtoeslag", () => {
  it("daalt nooit als het inkomen stijgt", () => {
    fc.assert(
      fc.property(inkomen, fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 150, max: 1200 }), fc.integer({ min: 1, max: 5 }), (x, dx, huur, pers) => {
        return huurtoeslag(l(), D(huur), D(x + dx), pers).perMaand.lte(huurtoeslag(l(), D(huur), D(x), pers).perMaand);
      }),
      { numRuns: 300 },
    );
  });
  it("stijgt nooit minder als de huur stijgt, en niet boven de maximale huurgrens", () => {
    fc.assert(
      fc.property(inkomen, fc.integer({ min: 150, max: 1200 }), fc.integer({ min: 1, max: 300 }), fc.integer({ min: 1, max: 5 }), (x, huur, dh, pers) => {
        const a = huurtoeslag(l(), D(huur), D(x), pers).perMaand;
        const b = huurtoeslag(l(), D(huur + dh), D(x), pers).perMaand;
        // Kleine marge voor afronding in de 40e decimaal (repeterende breuk bij /12).
        return b.gte(a) && b.minus(a).lte(D(dh).plus("0.000000001"));
      }),
      { numRuns: 300 },
    );
  });
  it("geen sprongen bij de grenzen (basishuur, kwaliteitskorting, aftopping, maximale huurgrens)", () => {
    for (const grens of ["202.52", "498.20", "713.02", "932.93"]) {
      const voor = huurtoeslag(l(), D(grens).minus("0.01"), D(20000), 1).perMaand;
      const na = huurtoeslag(l(), D(grens).plus("0.01"), D(20000), 1).perMaand;
      expect(na.minus(voor).abs().lte("0.02")).toBe(true);
    }
  });
});

describe("kindgebonden budget en kinderopvangtoeslag", () => {
  it("kindgebonden budget daalt nooit als het inkomen stijgt", () => {
    fc.assert(
      fc.property(inkomen, fc.integer({ min: 1, max: 5000 }), fc.boolean(), (x, dx, partner) => {
        const kinderen = [{ leeftijd: 5 }, { leeftijd: 13 }];
        return kindgebondenBudget(l(), D(x + dx), kinderen, partner).lte(kindgebondenBudget(l(), D(x), kinderen, partner));
      }),
      { numRuns: 200 },
    );
  });
  it("kinderopvangtoeslag daalt nooit als het inkomen stijgt", () => {
    const kinderen = [{ leeftijd: 2, opvang: { soort: "dagopvang" as const, urenPerMaand: 100, uurprijs: 10 } }];
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 300_000 }), fc.integer({ min: 1, max: 10_000 }), (x, dx) =>
        kinderopvangtoeslag(l(), D(x + dx), kinderen).toeslagPerMaand.lte(kinderopvangtoeslag(l(), D(x), kinderen).toeslagPerMaand),
      ),
      { numRuns: 200 },
    );
  });
});

describe("bijstand en vrijlating", () => {
  const basis = (bruto: number, fase: Invoer["vrijlatingFase"]): Invoer => ({
    datum: "2026-09-01",
    gemeente: "leiden",
    leefvorm: "alleenstaande",
    leeftijd: 35,
    kinderen: [],
    kostendelers: 0,
    wonen: { soort: "anders" },
    nieuwWerk: { brutoMaandloon: bruto },
    vrijlatingFase: fase,
  });
  const bijstandPlusLoon = (bruto: number, fase: Invoer["vrijlatingFase"]) => {
    const r = bereken(basis(bruto, fase));
    const p = (id: string) => D(r.werk.posten.find((x) => x.id === id)?.perMaand ?? 0);
    return { som: p("loon").plus(p("bijstand")), bijstand: p("bijstand") };
  };
  it("netto loon plus bijstand daalt nooit als het loon stijgt", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4000 }), fc.integer({ min: 1, max: 500 }), fc.constantFrom("start", "later", "geen"), (x, dx, fase) => {
        return bijstandPlusLoon(x + dx, fase as Invoer["vrijlatingFase"]).som.gte(bijstandPlusLoon(x, fase as Invoer["vrijlatingFase"]).som.minus("0.02"));
      }),
      { numRuns: 120 },
    );
  });
  it("bijstand verandert zonder sprongen: € 1 meer bruto loon geeft hoogstens € 1,08 minder bijstand (incl. 8% vakantiegeld)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 4000 }), fc.constantFrom("start", "later", "geen"), (x, fase) => {
        const a = bijstandPlusLoon(x, fase as Invoer["vrijlatingFase"]).bijstand;
        const b = bijstandPlusLoon(x + 1, fase as Invoer["vrijlatingFase"]).bijstand;
        return b.lte(a.plus("0.01")) && a.minus(b).lte("1.09");
      }),
      { numRuns: 120 },
    );
  });
  it("vrijlating heeft geen sprong bij het maximumbedrag", () => {
    const v = (x: string) =>
      vrijlating(l(), { fase: "start", nettoArbeid: D(x), leeftijd: 35, alleenstaandeOuderMetJongKind: false }).bedrag;
    expect(v("1156.00").toFixed(2)).toBe("289.00");
    expect(v("1155.99").minus(v("1156.01")).abs().lte("0.01")).toBe(true);
  });
});
