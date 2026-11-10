/**
 * Grenzen en onderdelen waar eerder geen test op lette (gevonden met een
 * mutatietest: één ding in de rekenkern veranderen en kijken of een test
 * faalt). De verwachte bedragen zijn met de hand uitgerekend uit de
 * regeldata van 1 juli 2026; de berekening staat erbij.
 */
import { describe, expect, it } from "vitest";
import { bereken, verschilEersteJaar, Lezer, standaardRegels, type Invoer, type Resultaat } from "../src/index.js";

const basis = (over: Partial<Invoer> = {}): Invoer => ({
  datum: "2026-11-10",
  gemeente: "leiden",
  leefvorm: "alleenstaande",
  leeftijd: 40,
  kinderen: [],
  kostendelers: 0,
  wonen: { soort: "anders" },
  nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 },
  vrijlatingFase: "start",
  ...over,
});
const post = (r: Resultaat, kant: "huidig" | "werk", id: string) => r[kant].posten.find((p) => p.id === id);
const bedrag = (r: Resultaat, kant: "huidig" | "werk", id: string) => post(r, kant, id)?.perMaand;
const stap = (r: Resultaat, kant: "huidig" | "werk", id: string, begin: string) => post(r, kant, id)?.stappen.find((s) => s.tekst.startsWith(begin))?.bedrag;
const ouder = (leeftijdKind: number, over: Partial<Invoer> = {}) => basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: leeftijdKind }], ...over });
const opvang = { soort: "dagopvang" as const, urenPerMaand: 80, uurprijs: 10 };

describe("kostendelersnorm bij een paar (art. 22a Pw)", () => {
  it("paar met één huisgenoot van 27+: A = 3, per partner (40% + 3 × 30%) / 3 = 43,33% van € 2.027,79", () => {
    // 2.027,79 × 1,3 / 3 = 878,709 per partner; samen 1.757,418
    const r = bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40 }, kostendelers: 1 }));
    expect(bedrag(r, "huidig", "bijstand")).toBe("1757.42");
  });
});

describe("leeftijdsgrenzen", () => {
  it("vrijlating: 27 jaar wel, 26 jaar niet (art. 31 lid 5 Pw)", () => {
    // Netto loon € 965,00; 25% daarvan is € 241,25.
    expect(bereken(basis({ leeftijd: 27 })).verschilPerMaand).toBe("241.25");
    expect(bereken(basis({ leeftijd: 26 })).verschilPerMaand).toBe("0.00");
  });

  it("alleenstaande ouder: de extra vrijlating na maand 6 geldt met een kind van 11, niet met een kind van 12 (art. 31 lid 2 onder r Pw)", () => {
    const met = bereken(ouder(11, { vrijlatingFase: "later" }));
    const zonder = bereken(ouder(12, { vrijlatingFase: "later" }));
    expect(bedrag(zonder, "werk", "bijstand")).toBe("454.46"); // 1.419,46 − 965,00
    // 12,5% van € 965,00 = € 120,625 meer bijstand
    expect(Number(bedrag(met, "werk", "bijstand")) - Number(bedrag(zonder, "werk", "bijstand"))).toBeCloseTo(120.62, 1);
  });

  it("combinatiekorting alleen met een kind jonger dan 12", () => {
    expect(bedrag(bereken(ouder(11)), "werk", "iack")).toBe("7.00");
    expect(post(bereken(ouder(12)), "werk", "iack")).toBeUndefined();
  });

  it("kinderbijslag per leeftijdsgroep: tot en met 5, 6 tot en met 11, 12 tot en met 17, niet vanaf 18 (SVB 2026)", () => {
    const akw = (leeftijd: number) => bedrag(bereken(ouder(leeftijd)), "huidig", "kinderbijslag");
    expect(akw(5)).toBe("99.47"); // 298,40 / 3
    expect(akw(6)).toBe("120.78"); // 362,35 / 3
    expect(akw(11)).toBe("120.78");
    expect(akw(12)).toBe("142.10"); // 426,29 / 3
    expect(akw(17)).toBe("142.10");
    expect(akw(18)).toBeUndefined();
  });

  it("kindgebonden budget: verhoging vanaf 12 en vanaf 16, niet vanaf 18 (Dienst Toeslagen 2026)", () => {
    const kgb = (leeftijd: number) => bedrag(bereken(ouder(leeftijd)), "huidig", "kgb");
    expect(kgb(11)).toBe("499.00"); // (2.580 + 3.416) / 12 = 499,67, naar beneden afgerond
    expect(kgb(12)).toBe("560.00"); // + 724: 6.720 / 12
    expect(kgb(15)).toBe("560.00");
    expect(kgb(16)).toBe("580.00"); // + 964: 6.960 / 12
    expect(kgb(17)).toBe("580.00");
    expect(kgb(18)).toBeUndefined();
    // Met toeslagpartner geen alleenstaande-ouderkop: (2.580 + 724) / 12 = 275,33
    const paar = bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40 }, kinderen: [{ leeftijd: 12 }] }));
    expect(bedrag(paar, "huidig", "kgb")).toBe("275.00");
  });
});

describe("invoer die de rekenkern weigert", () => {
  const weigert = (over: Partial<Invoer>) => expect(() => bereken(basis(over))).toThrow();
  const neemtAan = (over: Partial<Invoer>) => expect(() => bereken(basis(over))).not.toThrow();
  it("leeftijd: 21 tot en met 66 jaar", () => {
    weigert({ leeftijd: 20 });
    neemtAan({ leeftijd: 21 });
    neemtAan({ leeftijd: 66 });
    weigert({ leeftijd: 67 });
  });
  it("leeftijd van de partner: 21 tot en met 66 jaar", () => {
    const paar = (leeftijd: number): Partial<Invoer> => ({ leefvorm: "paar", partner: { leeftijd } });
    weigert(paar(20));
    neemtAan(paar(21));
    neemtAan(paar(66));
    weigert(paar(67));
  });
  it("aantallen huisgenoten: hele getallen vanaf 0", () => {
    weigert({ kostendelers: -1 });
    weigert({ kostendelers: 1.5 });
    weigert({ jongeHuisgenoten: -1 });
    weigert({ jongeHuisgenoten: 0.5 });
    neemtAan({ jongeHuisgenoten: 0 });
  });
  it("inkomen van huisgenoten: niet negatief", () => {
    weigert({ huisgenotenInkomenJaar: -1 });
    neemtAan({ huisgenotenInkomenJaar: 0 });
  });
  it("uren per week: hoogstens 60", () => {
    neemtAan({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 60 } });
    weigert({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 61 } });
  });
});

describe("netto loon", () => {
  it("pensioenpremie gaat van het belastbare loon en van het netto loon af", () => {
    // Bruto 2.000 × 1,08 × 12 = 25.920; premie 480; belastbaar 25.440.
    // Belasting 35,75% = 9.094,80; heffingskorting 3.115; arbeidskorting 996 + 31,009% × (25.440 − 11.965) = 5.174,46.
    // Te betalen 805,34; netto (25.920 − 480 − 805,34) / 12 = 2.052,89.
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 2000, pensioenpremiePerMaand: 40 } }));
    expect(bedrag(r, "werk", "loon")).toBe("2052.89");
    // Het jaarinkomen voor de toeslagen is het loon min de premie (er is geen bijstand meer).
    expect(stap(r, "werk", "zorgtoeslag", "Geschat bruto inkomen per jaar")).toBe("25440.00");
  });

  it("loon in de derde schijf van de arbeidskorting en de tweede belastingschijf", () => {
    // Bruto 4.500 × 1,08 × 12 = 58.320. Belasting 38.883 × 35,75% + 19.437 × 37,56% = 21.201,21.
    // Heffingskorting 3.115 − 6,398% × 28.584 = 1.286,20; arbeidskorting 5.685 − 6,51% × 12.728 = 4.856,41.
    // Netto (58.320 − 15.058,60) / 12 = 3.605,12.
    expect(bedrag(bereken(basis({ nieuwWerk: { brutoMaandloon: 4500 } })), "werk", "loon")).toBe("3605.12");
  });

  it("combinatiekorting: 11,45% van het arbeidsinkomen boven € 6.239, hoogstens € 3.032 en niet meer dan de belasting", () => {
    // Bruto 2.600: arbeidsinkomen 33.696; 11,45% × 27.457 = 3.143,83, dus het maximum 3.032; per maand 252,67.
    expect(bedrag(bereken(ouder(5, { nieuwWerk: { brutoMaandloon: 2600 } })), "werk", "iack")).toBe("252.67");
    // Bruto 900: 11,45% × (11.664 − 6.239) = 621,16 per jaar, maar er is maar € 83,97 belasting: per maand 7,00.
    const laag = bereken(ouder(5));
    expect(stap(laag, "werk", "iack", "Combinatiekorting volgens de tabel")).toBe("51.76");
    expect(bedrag(laag, "werk", "iack")).toBe("7.00");
  });

  it("uurloon zonder uren per week levert geen loon op", () => {
    expect(bereken(basis({ nieuwWerk: { brutoUurloon: 15 } })).verschilPerMaand).toBe("0.00");
  });
});

describe("geschat jaarinkomen voor de toeslagen", () => {
  it("ander inkomen komt in plaats van bijstand: het jaarinkomen blijft gelijk", () => {
    const zonder = stap(bereken(basis()), "huidig", "zorgtoeslag", "Geschat bruto inkomen per jaar");
    const met = stap(bereken(basis({ anderInkomenPerMaand: 100 })), "huidig", "zorgtoeslag", "Geschat bruto inkomen per jaar");
    expect(zonder).toBe("21663.07");
    expect(met).toBe(zonder);
  });
});

describe("kosten van het werk", () => {
  it("reiskosten en andere kosten tellen op; de vergoeding van de werkgever staat apart", () => {
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16, reiskostenPerMaand: 40, overigeKostenPerMaand: 10, reiskostenvergoedingPerMaand: 40 } }));
    expect(bedrag(r, "werk", "werkkosten")).toBe("-50.00");
    expect(bedrag(r, "werk", "reisvergoeding")).toBe("40.00");
    expect(r.verschilPerMaand).toBe("231.25"); // 241,25 − 50 + 40
  });
});

describe("eerste twaalf maanden", () => {
  it("zes maanden met vrijlating en zes maanden zonder", () => {
    expect(verschilEersteJaar(basis())).toEqual({ bedrag: "1447.50", startMaanden: 6 }); // 6 × 241,25 + 6 × 0
  });
});

describe("lagere norm bij lage huur (Leiden)", () => {
  it("huur € 100: de norm gaat omlaag met 10% van de gehuwdennorm min de huur", () => {
    // 202,779 − 100 = 102,779; 1.419,46 − 102,78 = 1.316,68
    expect(bedrag(bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 100, zelfstandig: true } })), "huidig", "bijstand")).toBe("1316.68");
  });
  it("huur niet ingevuld (0): geen verlaging", () => {
    expect(bedrag(bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 0, zelfstandig: true } })), "huidig", "bijstand")).toBe("1419.46");
  });
});

describe("kinderopvang", () => {
  it("paar waarvan de partner niet werkt: geen toeslag en geen kosten, met een melding", () => {
    const r = bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40 }, kinderen: [{ leeftijd: 3, opvang }] }));
    expect(post(r, "werk", "kot")).toBeUndefined();
    expect(post(r, "werk", "opvangkosten")).toBeUndefined();
    const melding = r.signalen.find((s) => s.kop === "Kinderopvang is niet meegerekend");
    expect(melding?.soort).toBe("waarschuwing");
    expect(melding?.bron).toBeDefined();
  });

  it("paar waarvan beide partners werken: toeslag, kosten en geen melding", () => {
    const r = bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40, werk: { brutoMaandloon: 900 } }, kinderen: [{ leeftijd: 3, opvang }] }));
    expect(bedrag(r, "werk", "opvangkosten")).toBe("-800.00"); // 80 uur × € 10
    expect(bedrag(r, "werk", "kot")).toBe("768.00"); // 96% van € 800
    expect(r.signalen.some((s) => s.kop === "Kinderopvang is niet meegerekend")).toBe(false);
  });

  describe("vergoeding van de eigen bijdrage (Leiden, beleidsregels bijzondere bijstand 2022, art. 6)", () => {
    const geval = (loon: number, over: Partial<Invoer> = {}) =>
      bereken(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 3, opvang }], nieuwWerk: { brutoMaandloon: loon }, vrijlatingFase: "geen", ...over }));
    /** Draagkracht volgens art. 6 lid 2: niets tot 110%, 20% tot 130%, 50% tot 150%, daarboven alles. */
    const draagkracht = (norm: number, inkomen: number) => {
      const deel = (van: number, tot: number) => Math.max(0, Math.min(inkomen, tot) - van);
      return 0.2 * deel(1.1 * norm, 1.3 * norm) + 0.5 * deel(1.3 * norm, 1.5 * norm) + deel(1.5 * norm, Infinity);
    };
    const delen = (r: Resultaat) => ({
      norm: Number(stap(r, "werk", "bb_opvang", "Bijstandsnorm voor de bijzondere bijstand")),
      inkomen: Number(stap(r, "werk", "bb_opvang", "Netto inkomen")),
      eigen: Number(stap(r, "werk", "bb_opvang", "Eigen bijdrage")),
      vergoeding: Number(bedrag(r, "werk", "bb_opvang")),
    });

    it("rekennorm alleenstaande ouder: 90% van de gehuwdennorm, zonder 5% vakantietoeslag", () => {
      expect(delen(geval(1500)).norm).toBeCloseTo(2027.79 * 0.9 * 0.95, 1); // 1.733,76
    });

    it("inkomen tot 110% van de norm: de hele eigen bijdrage vergoed", () => {
      const d = delen(geval(1500));
      expect(d.inkomen).toBeLessThan(1.1 * d.norm);
      expect(d.eigen).toBe(32); // 800 − 768
      expect(d.vergoeding).toBe(32);
    });

    it("inkomen tussen 130% en 150%: 20% en 50% van de delen erboven", () => {
      const r = geval(2600);
      const d = delen(r);
      expect(d.inkomen).toBeGreaterThan(1.3 * d.norm);
      expect(d.inkomen).toBeLessThan(1.5 * d.norm);
      expect(Number(stap(r, "werk", "bb_opvang", "Wat u zelf moet bijdragen"))).toBeCloseTo(draagkracht(d.norm, d.inkomen), 1); // 98,44
      expect(d.vergoeding).toBe(0);
    });

    it("inkomen boven 150%: alles daarboven is draagkracht", () => {
      const r = geval(3600);
      const d = delen(r);
      expect(d.inkomen).toBeGreaterThan(1.5 * d.norm);
      expect(Number(stap(r, "werk", "bb_opvang", "Wat u zelf moet bijdragen"))).toBeCloseTo(draagkracht(d.norm, d.inkomen), 1); // 534,37
    });

    it("de eigen bijdrage min de draagkracht, bij een hogere eigen bijdrage", () => {
      // Duurdere opvang dan het maximum waarover toeslag wordt gegeven: de eigen bijdrage is hoger dan de draagkracht.
      const r = geval(2600, { kinderen: [{ leeftijd: 3, opvang: { soort: "dagopvang", urenPerMaand: 140, uurprijs: 12 } }] });
      const d = delen(r);
      const zelf = draagkracht(d.norm, d.inkomen);
      expect(d.eigen).toBeGreaterThan(zelf);
      expect(d.vergoeding).toBeCloseTo(d.eigen - zelf, 1);
    });

    it("het loon van de partner telt mee in het inkomen", () => {
      const alleen = delen(bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40, werk: { brutoMaandloon: 900 } }, kinderen: [{ leeftijd: 3, opvang }], nieuwWerk: { brutoMaandloon: 900 }, vrijlatingFase: "geen" })));
      const meer = delen(bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40, werk: { brutoMaandloon: 2500 } }, kinderen: [{ leeftijd: 3, opvang }], nieuwWerk: { brutoMaandloon: 900 }, vrijlatingFase: "geen" })));
      expect(alleen.norm).toBeCloseTo(2027.79 * 0.95, 1); // gehuwdennorm zonder vakantietoeslag
      expect(meer.inkomen).toBeGreaterThan(alleen.inkomen + 500);
    });

    it("de melding vraagt om aan te vragen als er een vergoeding is, en niet als die er niet is", () => {
      const koppen = (r: Resultaat) => r.signalen.map((s) => s.kop);
      expect(koppen(geval(1500))).toContain("Vraag de vergoeding voor de opvang aan");
      expect(koppen(geval(2600))).toContain("Eigen bijdrage kinderopvang");
      expect(koppen(geval(2600))).not.toContain("Vraag de vergoeding voor de opvang aan");
      expect(geval(1500).signalen.find((s) => s.kop.startsWith("Vraag de vergoeding"))?.actie).toBe(true);
      expect(geval(2600).signalen.find((s) => s.kop === "Eigen bijdrage kinderopvang")?.actie).toBeUndefined();
    });
  });
});

describe("eerste helft van 2026", () => {
  it("rekent met de normen van 1 januari 2026", () => {
    // Norm alleenstaande € 1.401,50; vrijlating 25% van € 965,00 = € 241,25 (maximum € 285,00).
    const r = bereken(basis({ datum: "2026-03-01" }));
    expect(bedrag(r, "huidig", "bijstand")).toBe("1401.50");
    expect(bedrag(r, "werk", "bijstand")).toBe("677.75"); // 1.401,50 − (965,00 − 241,25)
    expect(bedrag(bereken(basis({ datum: "2026-03-01", leefvorm: "paar", partner: { leeftijd: 40 } })), "huidig", "bijstand")).toBe("2002.13");
    // Hoog genoeg loon om het maximum van de vrijlating te raken: € 285,00.
    const hoog = bereken(basis({ datum: "2026-03-01", nieuwWerk: { brutoMaandloon: 1300 } }));
    const zonder = bereken(basis({ datum: "2026-03-01", nieuwWerk: { brutoMaandloon: 1300 }, vrijlatingFase: "geen" }));
    expect(Number(bedrag(hoog, "werk", "bijstand")) - Number(bedrag(zonder, "werk", "bijstand"))).toBeCloseTo(285, 2);
    expect(bedrag(bereken(ouder(5, { datum: "2026-03-01" })), "huidig", "kinderbijslag")).toBe("98.36"); // 295,07 / 3
    expect(bedrag(bereken(ouder(8, { datum: "2026-03-01" })), "huidig", "kinderbijslag")).toBe("119.43"); // 358,30 / 3
    expect(bedrag(bereken(ouder(14, { datum: "2026-03-01" })), "huidig", "kinderbijslag")).toBe("140.51"); // 421,53 / 3
  });
});

describe("kinderopvangtoeslagtabel 2026: opbouw van de tabel", () => {
  const tabel = new Lezer(standaardRegels, "2026-11-10").kotTabel("kot.tabel");
  it("de inkomensgroepen sluiten op elkaar aan, van € 0 tot onbegrensd", () => {
    expect(tabel[0].vanaf.toString()).toBe("0");
    expect(tabel[tabel.length - 1].tot).toBeNull();
    for (let i = 1; i < tabel.length; i++) expect(tabel[i].vanaf.toString(), `rij ${i + 1}`).toBe(tabel[i - 1].tot!.plus(1).toString());
  });
  it("het percentage daalt met het inkomen en is voor een volgend kind nooit lager dan voor het eerste", () => {
    for (let i = 0; i < tabel.length; i++) {
      expect(tabel[i].volgendKind.gte(tabel[i].eersteKind), `rij ${i + 1}`).toBe(true);
      if (i > 0) {
        expect(tabel[i].eersteKind.lte(tabel[i - 1].eersteKind), `rij ${i + 1}, eerste kind`).toBe(true);
        expect(tabel[i].volgendKind.lte(tabel[i - 1].volgendKind), `rij ${i + 1}, volgend kind`).toBe(true);
      }
    }
  });
  it("de tabel is niet ongemerkt gewijzigd: 69 rijen, met vaste sommen van de percentages", () => {
    // Controlegetallen van de tabel uit bijlage I van het Besluit kinderopvangtoeslag (Stb. 2025, 233).
    // Verandert de tabel met opzet, pas dan deze getallen aan.
    const som = (veld: "eersteKind" | "volgendKind") => tabel.reduce((s, r) => s.plus(r[veld]), tabel[0].eersteKind.minus(tabel[0].eersteKind)).toString();
    expect(tabel.length).toBe(69);
    expect({ eerste: som("eersteKind"), volgend: som("volgendKind") }).toMatchInlineSnapshot(`
      {
        "eerste": "46.713",
        "volgend": "60.301",
      }
    `);
  });
});

describe("overige grenzen", () => {
  it("een kind van 18 telt niet mee voor kindgebonden budget en kinderbijslag, een jonger kind ernaast wel", () => {
    const een = bereken(ouder(10));
    const twee = bereken(ouder(10, { kinderen: [{ leeftijd: 18 }, { leeftijd: 10 }] }));
    expect(bedrag(twee, "huidig", "kgb")).toBe(bedrag(een, "huidig", "kgb"));
    expect(bedrag(twee, "huidig", "kinderbijslag")).toBe(bedrag(een, "huidig", "kinderbijslag"));
  });

  it("zonder loon geen kinderopvangtoeslag en geen opvangkosten", () => {
    const r = bereken(ouder(3, { kinderen: [{ leeftijd: 3, opvang }], nieuwWerk: { brutoMaandloon: 0 } }));
    expect(post(r, "werk", "kot")).toBeUndefined();
    expect(post(r, "werk", "opvangkosten")).toBeUndefined();
    expect(post(r, "werk", "werkkosten")).toBeUndefined();
    expect(r.verschilPerMaand).toBe("0.00");
  });

  it("opvang met 0 uur telt niet als opvang", () => {
    const r = bereken(ouder(3, { kinderen: [{ leeftijd: 3, opvang: { ...opvang, urenPerMaand: 0 } }] }));
    expect(post(r, "werk", "kot")).toBeUndefined();
  });

  it("vergoeding eigen bijdrage: ander inkomen en het loon van de partner tellen mee in het inkomen", () => {
    const inkomen = (over: Partial<Invoer>) =>
      Number(stap(bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40, werk: { brutoMaandloon: 900 } }, kinderen: [{ leeftijd: 3, opvang }], nieuwWerk: { brutoMaandloon: 2600 }, vrijlatingFase: "geen", ...over })), "werk", "bb_opvang", "Netto inkomen"));
    const start = inkomen({});
    // Er is geen bijstand meer, dus € 200 ander inkomen telt volledig mee.
    expect(inkomen({ anderInkomenPerMaand: 200 }) - start).toBeCloseTo(200, 1);
    // Partner van € 900 naar € 2.500 bruto: netto van € 965,00 naar € 2.432,45; zonder vakantiegeld (÷ 1,08) is dat € 1.358,75 meer.
    expect(inkomen({ partner: { leeftijd: 40, werk: { brutoMaandloon: 2500 } } }) - start).toBeCloseTo(1358.75, 1);
  });

  it("eerste twaalf maanden bij een alleenstaande ouder: zes maanden eerste vrijlating, zes maanden de vrijlating daarna", () => {
    const i = ouder(5, { nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } });
    const start = Number(bereken({ ...i, vrijlatingFase: "start" }).verschilPerMaand);
    const later = Number(bereken({ ...i, vrijlatingFase: "later" }).verschilPerMaand);
    expect(later).toBeGreaterThan(0);
    expect(later).toBeLessThan(start);
    const jaar = verschilEersteJaar(i);
    expect(jaar.startMaanden).toBe(6);
    expect(Number(jaar.bedrag)).toBeCloseTo(6 * start + 6 * later, 1);
  });
});
