/**
 * Proefpersonen (testgevallen/*.yaml): elk onderdeel met een officiële
 * vergelijkingswaarde moet binnen de tolerantie vallen. Onderdelen met
 * 'onbekend' worden alleen door de snapshot bewaakt.
 */
import { describe, expect, it } from "vitest";
import { draai, laadProefpersonen, samenvatting } from "../../../scripts/proefpersonen.ts";

const euro = (n: number | null | string) => (typeof n === "number" ? `€ ${n.toFixed(2)}` : String(n));

describe("proefpersonen", () => {
  for (const p of laadProefpersonen()) {
    it(`${p.bestand}: ${p.naam}`, () => {
      const u = draai(p);
      const fouten = u.vergelijkingen
        .filter((v) => v.binnen === false)
        .map(
          (v) =>
            `${p.naam} (${p.bestand}), ${v.label} ${v.situatie === "nu" ? "nu" : "met werk"}: verwacht ${euro(v.verwacht)}, berekend ${euro(v.berekend)}, ` +
            `verschil ${euro(v.verschil)} (tolerantie € ${v.tolerantie}). Bron: ${v.bron?.titel} (${v.bron?.url})`,
        );
      expect([...fouten, ...u.signaalFouten.map((f) => `${p.naam}: ${f}`)]).toEqual([]);
      expect(samenvatting(u)).toMatchSnapshot();
    });
  }
});
