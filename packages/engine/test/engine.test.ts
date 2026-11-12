import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { bereken, standaardRegels, type Invoer, type Resultaat } from "../src/index.ts";
import { Lezer } from "../src/regels.ts";
import { D } from "../src/geld.ts";
import { nettoLoon, brutoUitNetto, progressief, stuksgewijs } from "../src/modules/belasting.ts";
import { bijstandsnorm } from "../src/modules/bijstand.ts";

const JULI = "2026-08-01";

function basis(over: Partial<Invoer> = {}): Invoer {
  return {
    datum: JULI,
    gemeente: "leiden",
    leefvorm: "alleenstaande",
    leeftijd: 35,
    kinderen: [],
    kostendelers: 0,
    wonen: { soort: "anders" },
    nieuwWerk: { brutoMaandloon: 0 },
    vrijlatingFase: "geen",
    ...over,
  };
}

const post = (r: Resultaat, s: "huidig" | "werk", id: string) => r[s].posten.find((p) => p.id === id);

describe("belasting 2026", () => {
  const l = new Lezer(standaardRegels, JULI);

  it("rekent het voorbeeld van € 30.000 bruto exact uit", () => {
    // 30.000 × 35,75% = 10.725; AHK = 3.115 − 6,398% × 264 = 3.098,11;
    // AK = 5.300 + 1,95% × 4.155 = 5.381,0225; heffing = 2.245,8675.
    const r = nettoLoon(l, D(30000));
    expect(r.belasting.toFixed(2)).toBe("10725.00");
    expect(r.ahk.toFixed(4)).toBe("3098.1093");
    expect(r.arbeidskorting.toFixed(4)).toBe("5381.0225");
    expect(r.nettoJaar.toFixed(2)).toBe("27754.13");
  });

  it("arbeidskorting sluit aan op de knikpunten (geen sprongen)", () => {
    const ak = l.schijven("ib.arbeidskorting");
    for (const knik of [11965, 25845, 45592, 132920]) {
      const net = stuksgewijs(ak, D(knik).minus("0.01"));
      const op = stuksgewijs(ak, D(knik));
      expect(op.minus(net).abs().toNumber()).toBeLessThan(1.5);
    }
  });

  it("progressieve belasting over twee schijven", () => {
    const s = l.schijven("ib.box1.schijven");
    // 38.883 × 35,75% + 1.117 × 37,56%
    expect(progressief(s, D(40000)).toFixed(2)).toBe(D(38883).times("0.3575").plus(D(1117).times("0.3756")).toFixed(2));
  });

  it("bruto uit netto is de inverse van de nettoberekening zonder arbeidskorting", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 60000 }), (netto) => {
        const bruto = brutoUitNetto(l, D(netto));
        const tax = progressief(l.schijven("ib.box1.schijven"), bruto).minus(stuksgewijs(l.schijven("ib.ahk"), bruto));
        const terug = bruto.minus(tax.isNegative() ? 0 : tax);
        return terug.minus(netto).abs().lte("0.02");
      }),
      { numRuns: 200 },
    );
  });
});

describe("bijstand", () => {
  it("volledige bijstand alleenstaande per 1 juli 2026", () => {
    const r = bereken(basis());
    expect(post(r, "huidig", "bijstand")?.perMaand).toBe("1419.46");
    expect(post(r, "huidig", "bijstand")?.status).toBe("geverifieerd");
  });

  it("kiest de norm die op de datum geldt", () => {
    expect(post(bereken(basis({ datum: "2026-06-30" })), "huidig", "bijstand")?.perMaand).toBe("1401.50");
    expect(post(bereken(basis({ datum: "2026-07-01" })), "huidig", "bijstand")?.perMaand).toBe("1419.46");
  });

  it("rekent niet met verzonnen normen voor 2027", () => {
    const r = bereken(basis({ datum: "2027-01-15" }));
    const b = post(r, "huidig", "bijstand");
    expect(b?.perMaand).toBeNull();
    expect(b?.ontbrekendeParameter).toBe("pw.norm.alleenstaande");
    expect(b?.reden).toBe("De bedragen hiervoor zijn voor deze datum nog niet bekend.");
    expect(r.nietMeegenomen.map((n) => n.id)).toContain("bijstand");
  });

  it("vrijlating 25% onder het maximum", () => {
    // Netto loon via de motor; bijstand = norm − (netto − 25% × netto).
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 800 }, vrijlatingFase: "start" }));
    const netto = D(post(r, "werk", "loon")!.perMaand!);
    const verwacht = D("1419.46").minus(netto.minus(netto.times("0.25")));
    expect(post(r, "werk", "bijstand")!.perMaand).toBe(verwacht.toFixed(2));
  });

  it("vrijlating wordt afgetopt op € 289", () => {
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 1300 }, vrijlatingFase: "start" }));
    const netto = D(post(r, "werk", "loon")!.perMaand!);
    expect(netto.times("0.25").gt(289)).toBe(true);
    const verwacht = D("1419.46").minus(netto.minus(289));
    expect(post(r, "werk", "bijstand")!.perMaand).toBe(verwacht.toFixed(2));
  });

  it("alleenstaande ouder met jong kind houdt na 6 maanden 12,5% vrij, max € 180,17", () => {
    const r = bereken(
      basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 4 }], nieuwWerk: { brutoMaandloon: 1000 }, vrijlatingFase: "later" }),
    );
    const netto = D(post(r, "werk", "loon")!.perMaand!);
    const vrij = netto.times("0.125").lt("180.17") ? netto.times("0.125") : D("180.17");
    expect(post(r, "werk", "bijstand")!.perMaand).toBe(D("1419.46").minus(netto.minus(vrij)).toFixed(2));
  });

  it("kostendelersnorm: alleenstaande met één huisgenoot van 27+ krijgt 50% van de gehuwdennorm", () => {
    const l = new Lezer(standaardRegels, JULI);
    const { norm } = bijstandsnorm(l, basis({ kostendelers: 1 }));
    expect(norm.toFixed(3)).toBe(D("2027.79").times("0.5").toFixed(3));
  });

  it("geen bijstand meer bij een voltijdbaan", () => {
    const r = bereken(basis({ nieuwWerk: { brutoUurloon: 16, urenPerWeek: 36 } }));
    expect(post(r, "werk", "bijstand")!.perMaand).toBe("0.00");
  });
});

describe("toeslagen", () => {
  it("maximale zorgtoeslag alleenstaande zonder werk, naar beneden afgerond", () => {
    // (2.119 − 1,912% × 29.736) / 12 = 129,204 → € 129 (zoals Dienst Toeslagen)
    const r = bereken(basis());
    expect(post(r, "huidig", "zorgtoeslag")!.perMaand).toBe("129.00");
    expect(post(r, "huidig", "zorgtoeslag")!.status).toBe("geverifieerd");
  });

  it("huurtoeslag wordt berekend en is in beide situaties aanwezig", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 650 } }));
    expect(post(r, "huidig", "huurtoeslag")!.perMaand).not.toBeNull();
    expect(r.nietMeegenomen).toEqual([]);
  });

  it("huurtoeslag met huisgenoten van wie het inkomen onbekend is: berekend zonder hun inkomen, met een aanname", () => {
    const r = bereken(basis({ kostendelers: 1, wonen: { soort: "huur", kaleHuurPerMaand: 650 }, nieuwWerk: { brutoMaandloon: 1500 } }));
    expect(post(r, "huidig", "huurtoeslag")!.perMaand).not.toBeNull();
    expect(post(r, "huidig", "huurtoeslag")!.aannames.join(" ")).toContain("huisgenoten is niet meegeteld");
  });

  it("huurtoeslag met huisgenoten: hun inkomen telt mee en het huishouden is meerpersoons", () => {
    const r = bereken(basis({ kostendelers: 1, huisgenotenInkomenJaar: 26000, wonen: { soort: "huur", kaleHuurPerMaand: 650 } }));
    const p = post(r, "huidig", "huurtoeslag")!;
    expect(p.perMaand).not.toBeNull();
    expect(p.parameters.some((g) => g.id === "ht.minimum_inkomensijkpunt.meerpersoons")).toBe(true);
    expect(r.nietMeegenomen).toEqual([]);
  });

  it("kindgebonden budget alleenstaande ouder met 1 kind van 8 bij laag inkomen", () => {
    const r = bereken(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 8 }] }));
    // (2.580 + 3.416) / 12 = 499,67 → € 499
    expect(post(r, "huidig", "kgb")!.perMaand).toBe("499.00");
  });

  it("kinderbijslag is in beide situaties gelijk en beïnvloedt het verschil niet", () => {
    const r = bereken(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 8 }], nieuwWerk: { brutoMaandloon: 1200 } }));
    // 3e kwartaal 2026, 6 t/m 11 jaar: € 362,35 per kwartaal
    expect(post(r, "huidig", "kinderbijslag")!.perMaand).toBe(D("362.35").div(3).toFixed(2));
    expect(post(r, "werk", "kinderbijslag")!.perMaand).toBe(post(r, "huidig", "kinderbijslag")!.perMaand);
    expect(post(r, "werk", "kinderbijslag")!.invloed).toBe("nee");
  });

  it("kinderopvangtoeslag alleen in de werksituatie, 96% bij laag inkomen", () => {
    const r = bereken(
      basis({
        leefvorm: "alleenstaande_ouder",
        kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 11 } }],
        nieuwWerk: { brutoUurloon: 15, urenPerWeek: 24 },
      }),
    );
    expect(post(r, "huidig", "kot")).toBeUndefined();
    // 80 × € 11 × 96% = € 844,80 → € 844
    expect(post(r, "werk", "kot")!.perMaand).toBe("844.00");
    expect(post(r, "werk", "opvangkosten")!.perMaand).toBe("-880.00");
  });
});

describe("vergelijking en uitleg", () => {
  it("verschil is besteedbaar werk min besteedbaar huidig", () => {
    const r = bereken(basis({ nieuwWerk: { brutoUurloon: 15, urenPerWeek: 32, reiskostenPerMaand: 60 } }));
    expect(D(r.verschilPerMaand).toFixed(2)).toBe(D(r.werk.besteedbaarPerMaand).minus(r.huidig.besteedbaarPerMaand).toFixed(2));
    expect(D(r.verschilPerJaar).toFixed(2)).toBe(D(r.verschilPerMaand).times(12).toFixed(2));
  });

  it("gebruikt alleen regels die op de rekendatum gelden", () => {
    for (const datum of ["2026-03-01", "2026-09-01"]) {
      const r = bereken(basis({ datum, nieuwWerk: { brutoMaandloon: 1500 }, vrijlatingFase: "start" }));
      for (const p of [...r.huidig.posten, ...r.werk.posten]) {
        for (const g of p.parameters) {
          expect(g.geldigVan <= datum).toBe(true);
          const def = standaardRegels.zoek(g.id, datum)!;
          expect(def.geldig_van).toBe(g.geldigVan);
        }
      }
    }
  });

  it("elke gebruikte parameter heeft een bron", () => {
    const r = bereken(
      basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 3 }], nieuwWerk: { brutoMaandloon: 1800 }, vrijlatingFase: "start" }),
    );
    for (const p of [...r.huidig.posten, ...r.werk.posten]) for (const g of p.parameters) expect(g.bron?.url).toMatch(/^https:\/\//);
  });

  it("is deterministisch", () => {
    const invoer = basis({ nieuwWerk: { brutoUurloon: 14.5, urenPerWeek: 20 }, vrijlatingFase: "start" });
    expect(JSON.stringify(bereken(invoer))).toBe(JSON.stringify(bereken(invoer)));
  });

  it("weigert ongeldige invoer", () => {
    expect(() => bereken(basis({ leeftijd: 19 }))).toThrow();
    expect(() => bereken(basis({ nieuwWerk: { brutoMaandloon: -5 } }))).toThrow();
  });

  it("geldt voor elk uurloon en aantal uren zonder fouten (eigenschapstest)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1400, max: 4000 }), fc.integer({ min: 0, max: 40 }), (cent, uren) => {
        const r = bereken(basis({ nieuwWerk: { brutoUurloon: cent / 100, urenPerWeek: uren }, vrijlatingFase: "start" }));
        const bijstand = D(post(r, "werk", "bijstand")!.perMaand!);
        return bijstand.gte(0) && bijstand.lte("1419.46");
      }),
      { numRuns: 150 },
    );
  });
});

describe("loonvormen en perioden", () => {
  it("vierwekenloon telt 13 keer per jaar", () => {
    const vier = bereken(basis({ nieuwWerk: { brutoVierwekenloon: 1200 } }));
    const maand = bereken(basis({ nieuwWerk: { brutoMaandloon: 1300 } }));
    expect(post(vier, "werk", "loon")!.perMaand).toBe(post(maand, "werk", "loon")!.perMaand);
    expect(vier.signalen.some((s) => s.tekst.includes("13 keer"))).toBe(true);
  });

  it("uurloon × uren × 52 / 12 is gelijk aan het maandloon", () => {
    const uur = bereken(basis({ nieuwWerk: { brutoUurloon: 15, urenPerWeek: 20 } }));
    const maand = bereken(basis({ nieuwWerk: { brutoMaandloon: 1300 } }));
    expect(post(uur, "werk", "loon")!.perMaand).toBe(post(maand, "werk", "loon")!.perMaand);
  });

  it("noemt de vrijlatingsperioden concreet", async () => {
    const { vrijlatingsPeriodes } = await import("../src/index.ts");
    const p = vrijlatingsPeriodes(basis());
    expect(p.map((x) => x.naam)).toEqual(["Maand 1 t/m 6", "Vanaf maand 7"]);
    expect(p[0].regel).toContain("tot €\u00a0289 per maand");
    const ouder = vrijlatingsPeriodes(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 5 }] }));
    expect(ouder.map((x) => x.naam)).toEqual(["Maand 1 t/m 6", "Maand 7 t/m 36", "Vanaf maand 37"]);
  });
});

describe("netto maandloon als invoer", () => {
  it("rekent netto terug naar bruto zodat de loonstrook klopt", () => {
    const viaBruto = bereken(basis({ nieuwWerk: { brutoMaandloon: 2000 } }));
    const l = new Lezer(standaardRegels, JULI);
    const r = nettoLoon(l, D(2000).times(12).times("1.08"));
    const nettoStrook = D(2000).times(r.nettoJaar.div(r.brutoJaar));
    const viaNetto = bereken(basis({ nieuwWerk: { nettoMaandloon: Number(nettoStrook.toFixed(2)) } }));
    const verschil = D(post(viaNetto, "werk", "loon")!.perMaand!).minus(post(viaBruto, "werk", "loon")!.perMaand!).abs();
    expect(verschil.lte("0.05")).toBe(true);
    expect(viaNetto.werk.posten.find((p) => p.id === "loon")!.aannames.some((a) => a.includes("netto loon in"))).toBe(true);
  });

  it("urenfactor schaalt het loon mee", () => {
    const heel = bereken(basis({ nieuwWerk: { brutoMaandloon: 2000 } }));
    const half = bereken(basis({ nieuwWerk: { brutoMaandloon: 4000, urenFactor: 0.5 } }));
    expect(post(half, "werk", "loon")!.perMaand).toBe(post(heel, "werk", "loon")!.perMaand);
  });
});

describe("Alimentatie en weekloon (ronde 9)", () => {
  const p = (r: Resultaat, s: "huidig" | "werk", id: string) => r[s].posten.find((x) => x.id === id);
  it("partneralimentatie telt voor de bijstand na belasting (art. 31 lid 3 Pw): € 300 − 35,75% = € 192,75", () => {
    const r = bereken(basis({ partneralimentatiePerMaand: 300 }));
    expect(p(r, "huidig", "ander_inkomen")!.perMaand).toBe("192.75");
  });
  it("kinderalimentatie telt mee voor de bijstand, niet voor de toeslagen", () => {
    const zonder = bereken(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 6 }], wonen: { soort: "huur", kaleHuurPerMaand: 700 } }));
    const met = bereken(basis({ leefvorm: "alleenstaande_ouder", kinderen: [{ leeftijd: 6 }], wonen: { soort: "huur", kaleHuurPerMaand: 700 }, kinderalimentatiePerMaand: 250 }));
    expect(p(met, "huidig", "ander_inkomen")!.perMaand).toBe("250.00");
    // De bijstand daalt met de alimentatie, de toeslagen blijven gelijk.
    expect(D(p(zonder, "huidig", "bijstand")!.perMaand!).minus(p(met, "huidig", "bijstand")!.perMaand!).toFixed(2)).toBe("250.00");
    for (const id of ["zorgtoeslag", "huurtoeslag", "kgb"]) expect(p(met, "huidig", id)!.perMaand).toBe(p(zonder, "huidig", id)!.perMaand);
  });
  it("weekloon: 52 keer per jaar", () => {
    const week = bereken(basis({ nieuwWerk: { brutoWeekloon: 300, urenPerWeek: 20 } }));
    const maand = bereken(basis({ nieuwWerk: { brutoMaandloon: 1300, urenPerWeek: 20 } }));
    expect(p(week, "werk", "loon")!.perMaand).toBe(p(maand, "werk", "loon")!.perMaand);
    expect(week.signalen.some((s) => s.kop === "Loon per week")).toBe(true);
  });
});

describe("Vrijlating voor het loon van de partner (V15)", () => {
  const bijstand = (r: Resultaat, s: "huidig" | "werk") => D(r[s].posten.find((x) => x.id === "bijstand")!.perMaand!);
  const stel = (werktKort: boolean, fase: "start" | "later") =>
    bereken(basis({ leefvorm: "paar", partner: { leeftijd: 39, werk: { brutoMaandloon: 450 }, werktKort }, nieuwWerk: { brutoMaandloon: 600, urenPerWeek: 10 }, vrijlatingFase: fase }));
  it("korter dan 6 maanden: 25% van het netto loon van de partner, in beide kolommen", () => {
    const kort = stel(true, "start");
    const lang = stel(false, "start");
    const extra = bijstand(kort, "huidig").minus(bijstand(lang, "huidig"));
    expect(extra.gt(100)).toBe(true);
    expect(extra.lte(D("289"))).toBe(true);
    expect(kort.huidig.posten.find((x) => x.id === "bijstand")!.aannames.join(" ")).toContain("tegelijk lopen");
  });
  it("na de eerste periode geen vrijlating meer voor de partner, ook niet in de kolom Nu", () => {
    expect(bijstand(stel(true, "later"), "huidig").toFixed(2)).toBe(bijstand(stel(false, "later"), "huidig").toFixed(2));
  });
  it("partner jonger dan 27: geen vrijlating (art. 31 lid 5 Pw)", () => {
    const jong = (werktKort: boolean) =>
      bereken(basis({ leefvorm: "paar", partner: { leeftijd: 24, werk: { brutoMaandloon: 450 }, werktKort }, nieuwWerk: { brutoMaandloon: 600, urenPerWeek: 10 }, vrijlatingFase: "start" }));
    expect(bijstand(jong(true), "huidig").toFixed(2)).toBe(bijstand(jong(false), "huidig").toFixed(2));
  });
});
