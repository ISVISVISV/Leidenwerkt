/**
 * Snapshots van de uitkomsten voor 2026. Verandert een snapshot, dan moet
 * de wijziging verklaard zijn in docs/SNAPSHOTS.md (met de reden).
 * Bijwerken: npx vitest run -u, daarna het verschil nalopen.
 */
import { describe, expect, it } from "vitest";
import { bereken } from "../src/index.ts";
import { huishoudens, samenvatting } from "./huishoudens.ts";

describe("snapshots 2026", () => {
  for (const [naam, invoer] of Object.entries(huishoudens)) {
    it(naam, () => {
      expect(samenvatting(bereken(invoer))).toMatchSnapshot();
    });
  }
});
