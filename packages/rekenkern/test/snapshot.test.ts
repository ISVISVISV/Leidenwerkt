/**
 * Snapshots van de uitkomsten voor 2026. Verandert een snapshot, dan moet
 * de wijziging verklaard zijn in docs/SNAPSHOTS.md (met de reden).
 * Bijwerken: npx vitest run -u, daarna het verschil nalopen.
 */
import { describe, expect, it } from "vitest";
import { bereken } from "../src/index.ts";
import { extraVoorUitleg, huishoudens, samenvatting, uitleg } from "./huishoudens.ts";

describe("snapshots 2026", () => {
  for (const [naam, invoer] of Object.entries(huishoudens)) {
    it(naam, () => {
      expect(samenvatting(bereken(invoer))).toMatchSnapshot();
    });
  }
});

/**
 * De uitleg bij de uitkomst: rekenstappen, meldingen en aannames. Een
 * gewijzigde tekst of een gewijzigd tussenbedrag wordt hier zichtbaar.
 * Tekstwijzigingen hoeven niet in docs/SNAPSHOTS.md; gewijzigde bedragen wel.
 */
describe("snapshots van de uitleg", () => {
  for (const [naam, invoer] of Object.entries({ ...huishoudens, ...extraVoorUitleg })) {
    it(naam, () => {
      expect(uitleg(bereken(invoer))).toMatchSnapshot();
    });
  }
});
