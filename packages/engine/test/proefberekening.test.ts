/**
 * Onafhankelijke toets: de proefberekening toeslagen 2026 van Dienst
 * Toeslagen, ingevuld met verzonnen personen (gebruikerstest ronde 6,
 * november 2026). Ingevuld is het geschatte jaarinkomen dat de rekenhulp
 * toont, naar beneden afgerond op hele euro's. Dit toetst de formules voor
 * de toeslagen, niet de schatting van het inkomen zelf.
 * Bron: https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen
 */
import { describe, expect, it } from "vitest";
import { Lezer, standaardRegels } from "../src/regels.ts";
import { D } from "../src/geld.ts";
import { huurtoeslag, zorgtoeslag, kindgebondenBudget, kinderopvangtoeslag, maandbedragToeslag } from "../src/modules/toeslagen.ts";

const l = () => new Lezer(standaardRegels, "2026-09-01");
const perMaand = (jaar: ReturnType<typeof D>) => maandbedragToeslag(jaar.div(12)).toFixed(0);
const huur = (kaleHuur: number, inkomen: number, personen: number) => maandbedragToeslag(huurtoeslag(l(), D(kaleHuur), D(inkomen), personen).perMaand).toFixed(0);

describe("Proefberekening toeslagen 2026 (Dienst Toeslagen), november 2026", () => {
  it("stel zonder kinderen, huur € 750 (Ria en Kemal)", () => {
    for (const inkomen of [28176, 28199, 24731]) {
      expect(perMaand(zorgtoeslag(l(), D(inkomen), true))).toBe("246");
      expect(huur(750, inkomen, 2)).toBe("451");
    }
  });

  it("stel met kinderen van 4 en 9, huur € 820 (Lotte en Ruben)", () => {
    const kinderen = [{ leeftijd: 4 }, { leeftijd: 9 }];
    expect(perMaand(zorgtoeslag(l(), D(24608), true))).toBe("246");
    expect(huur(820, 24608, 4)).toBe("492");
    expect(perMaand(kindgebondenBudget(l(), D(24608), kinderen, true))).toBe("430");
    expect(perMaand(zorgtoeslag(l(), D(33799), true))).toBe("200");
    expect(huur(820, 33799, 4)).toBe("450");
    expect(perMaand(kindgebondenBudget(l(), D(33799), kinderen, true))).toBe("430");
  });

  it("alleenstaande met 2 medebewoners van samen € 30.000, huur € 950 (Wendy)", () => {
    expect(perMaand(zorgtoeslag(l(), D(11563), false))).toBe("129");
    expect(huur(950, 11563 + 30000, 3)).toBe("353");
    expect(perMaand(zorgtoeslag(l(), D(21565), false))).toBe("129");
    expect(huur(950, 21565 + 30000, 3)).toBe("170");
  });

  it("alleenstaande ouder, kinderen van 16 en 20, zoon verdient € 9.000 (Hatice)", () => {
    // Van een kind jonger dan 23 telt alleen het deel boven € 6.218 mee: € 2.782.
    const kinderen = [{ leeftijd: 16 }, { leeftijd: 20 }];
    for (const inkomen of [21663, 21059]) {
      expect(perMaand(zorgtoeslag(l(), D(inkomen), false))).toBe("129");
      expect(huur(780, inkomen + 2782, 3)).toBe("476");
      // De proefberekening gaf € 560 in januari en € 580 vanaf februari: de dochter werd op
      // 1 januari 16, en de hogere verhoging geldt "met ingang van de kalendermaand na de
      // maand waarin het kind de leeftijd van 16 jaar heeft bereikt" (Wkb, art. 2 lid 5).
      expect(perMaand(kindgebondenBudget(l(), D(inkomen), kinderen, false))).toBe("580");
    }
  });

  it("alleenstaande ouder, kind van 2 naar het kinderdagverblijf (Marco)", () => {
    const kind = { leeftijd: 2, opvang: { soort: "dagopvang" as const, urenPerMaand: 130, uurprijs: 10.25 } };
    expect(perMaand(zorgtoeslag(l(), D(21663), false))).toBe("129");
    expect(huur(700, 21663, 2)).toBe("428");
    expect(perMaand(kindgebondenBudget(l(), D(21663), [kind], false))).toBe("499");
    expect(perMaand(zorgtoeslag(l(), D(24373), false))).toBe("129");
    expect(huur(700, 24373, 2)).toBe("428");
    expect(perMaand(kindgebondenBudget(l(), D(24373), [kind], false))).toBe("499");
    expect(maandbedragToeslag(kinderopvangtoeslag(l(), D(24373), [kind]).toeslagPerMaand).toFixed(0)).toBe("1279");
  });

  it("alleenstaande, lage huur € 480 (Iris)", () => {
    expect(perMaand(zorgtoeslag(l(), D(21663), false))).toBe("129");
    expect(huur(480, 21663, 1)).toBe("277");
    expect(perMaand(zorgtoeslag(l(), D(28753), false))).toBe("129");
    expect(huur(480, 28753, 1)).toBe("157");
  });
});
