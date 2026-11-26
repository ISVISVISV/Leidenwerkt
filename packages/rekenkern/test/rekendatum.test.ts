/** De datum waarmee de rekenhulpen rekenen, ook na de jaarwissel als nog niet alle bedragen bekend zijn. */
import { describe, expect, it } from "vitest";
import { RegelSet, standaardRegels, type RuweParameter } from "../src/index.ts";

const p = (geldig_van: string, geldig_tot: string | null, status: "geverifieerd" | "ontbrekend"): RuweParameter =>
  ({ id: "x.bedrag", omschrijving: "x", eenheid: "euro", geldig_van, geldig_tot, status, ...(status === "ontbrekend" ? {} : { waarde: { soort: "bedrag", bedrag: "1" } }) }) as unknown as RuweParameter;

describe("rekendatum", () => {
  it("vandaag als alles bekend is", () => {
    const r = new RegelSet([p("2026-01-01", null, "geverifieerd")]);
    expect(r.rekendatum("2026-06-15")).toEqual({ datum: "2026-06-15", teruggevallen: false });
  });
  it("de laatste dag van het oude jaar als het nieuwe jaar nog ontbreekt", () => {
    const r = new RegelSet([p("2026-01-01", "2026-12-31", "geverifieerd"), p("2027-01-01", null, "ontbrekend")]);
    expect(r.rekendatum("2027-01-02")).toEqual({ datum: "2026-12-31", teruggevallen: true });
    expect(r.rekendatum("2027-03-15")).toEqual({ datum: "2026-12-31", teruggevallen: true });
  });
  it("de echte regeldata: vandaag gewoon, en na de laatste regeldata nooit een datum zonder bedragen", () => {
    const d = standaardRegels.rekendatum("2030-01-02");
    expect(d.teruggevallen).toBe(true);
    expect(standaardRegels.onbekendOp(d.datum)).toEqual([]);
  });
});
