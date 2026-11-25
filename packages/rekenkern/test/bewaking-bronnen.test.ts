/** Bewaking van de bronnen (scripts/bronnen.ts): tekst van een webpagina vergelijken met een letterlijk citaat. */
import { describe, expect, it } from "vitest";
import { htmlNaarTekst, normaliseer, ontbrekendeStukken, stukken } from "../../../scripts/bronnen.ts";
import { alleBronnen } from "../../../scripts/bewaking.ts";
import { ruweParameters } from "../src/index.ts";

describe("citaat op een webpagina", () => {
  const pagina = htmlNaarTekst(
    `<html><head><script>var x = "€ 1.000";</script></head><body><p>In 2026 kunt u huurtoeslag krijgen als uw vermogen op 1 januari&nbsp;2026 niet hoger is dan €&nbsp;38.479.</p><p>Hebt u een toeslagpartner? In dat geval mag het vermogen van u samen op 1 januari 2026 maximaal € 76.958 zijn.</p></body></html>`,
  );
  const citaat =
    "In 2026 kunt u huurtoeslag krijgen als uw vermogen op 1 januari 2026 niet hoger is dan € 38.479. Hebt u een toeslagpartner? In dat geval mag het vermogen van u samen op 1 januari 2026 maximaal € 76.958 zijn. […] Ook medebewoners mogen niet meer dan € 38.479 aan vermogen hebben.";

  it("splitst op […] en slaat korte stukken over", () => {
    expect(stukken("Een stuk dat lang genoeg is om te zoeken op de pagina. […] kort […] • Nog een lang stuk met een opsommingsteken ervoor")).toEqual([
      "Een stuk dat lang genoeg is om te zoeken op de pagina.",
      "Nog een lang stuk met een opsommingsteken ervoor",
    ]);
  });
  it("vindt een tekst met harde spaties en tags ertussen; noemt alleen wat ontbreekt", () => {
    expect(ontbrekendeStukken(citaat, pagina)).toEqual(["Ook medebewoners mogen niet meer dan € 38.479 aan vermogen hebben."]);
  });
  it("een veranderd bedrag valt op", () => {
    expect(ontbrekendeStukken("Hebt u een toeslagpartner? In dat geval mag het vermogen van u samen op 1 januari 2026 maximaal € 80.000 zijn.", pagina)).toHaveLength(1);
  });
  it("aanhalingstekens en streepjes tellen niet", () => {
    expect(normaliseer("‘U’ – “wij”  samen")).toBe(normaliseer("'u' - \"wij\" samen"));
  });
  it("geen tekst uit scripts", () => {
    expect(pagina).not.toContain("var x");
  });
});

describe("welke bronnen", () => {
  it("alleen regels die nu of later gelden, en de citaten uit citaten.ts", () => {
    const b = alleBronnen(ruweParameters, "2026-11-25", []);
    expect(b.some((x) => x.waar.startsWith("citaten.ts"))).toBe(true);
    expect(b.every((x) => x.url.startsWith("https://"))).toBe(true);
    const oud = ruweParameters.find((p) => p.geldig_tot && p.geldig_tot < "2026-11-25" && p.bron?.url);
    if (oud) expect(b.some((x) => x.waar === `regeldata ${oud.id}` && x.url === oud.bron!.url && !ruweParameters.some((p) => p.id === oud.id && (!p.geldig_tot || p.geldig_tot >= "2026-11-25") && p.bron?.url === oud.bron!.url))).toBe(false);
  });
});
