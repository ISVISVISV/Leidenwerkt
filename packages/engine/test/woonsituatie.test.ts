import { describe, expect, it } from "vitest";
import { bereken, verschilEersteJaar, vrijlatingUitleg, type Invoer, type Resultaat } from "../src/index.ts";

function basis(over: Partial<Invoer> = {}): Invoer {
  return {
    datum: "2026-08-01",
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
const bijstand = (r: Resultaat, s: "huidig" | "werk" = "huidig") => r[s].posten.find((p) => p.id === "bijstand")!.perMaand;

describe("Leiden: lagere norm bij geen of lage woonkosten (CVDR760406 art. 3.1)", () => {
  // Gehuwdennorm 1 juli 2026: € 2.027,79. 10% = € 202,779; 19% = € 385,2801.
  it("geen woonkosten, wel gas/licht/water: norm min 10% van de gehuwdennorm", () => {
    const r = bereken(basis({ wonen: { soort: "geen_woonkosten", betaaltWoonlasten: true } }));
    expect(bijstand(r)).toBe("1216.68"); // 1419,46 − 202,779
  });
  it("geen woonkosten en geen woonlasten (bijvoorbeeld dakloos): 19%", () => {
    const r = bereken(basis({ wonen: { soort: "geen_woonkosten", dakloos: true, betaaltWoonlasten: false } }));
    expect(bijstand(r)).toBe("1034.18"); // 1419,46 − 385,2801
  });
  it("huur onder 10% van de gehuwdennorm: het verschil", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 150 } }));
    expect(bijstand(r)).toBe("1366.68"); // 1419,46 − (202,779 − 150)
  });
  it("ook op een kamer met een huur onder de grens: het verschil, zonder huurtoeslag", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 150, zelfstandig: false } }));
    expect(bijstand(r)).toBe("1366.68"); // 1419,46 − (202,779 − 150)
    expect(r.huidig.posten.some((p) => p.id === "huurtoeslag")).toBe(false);
  });
  it("op een kamer met een huur boven de grens: de gewone norm", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 450, zelfstandig: false } }));
    expect(bijstand(r)).toBe("1419.46");
  });
  it("niet bij de kostendelersnorm (alleen art. 21)", () => {
    const met = bereken(basis({ kostendelers: 1, wonen: { soort: "geen_woonkosten", betaaltWoonlasten: false } }));
    const zonder = bereken(basis({ kostendelers: 1 }));
    expect(bijstand(met)).toBe(bijstand(zonder));
  });
});

describe("huurtoeslag alleen bij een zelfstandige woning", () => {
  it("een kamer: geen huurtoeslag, en dat staat bij de aannames", () => {
    const r = bereken(basis({ wonen: { soort: "huur", kaleHuurPerMaand: 500, zelfstandig: false } }));
    expect(r.huidig.posten.find((p) => p.id === "huurtoeslag")).toBeUndefined();
    expect(r.aannames.some((a) => a.includes("kamer"))).toBe(true);
  });
});

describe("verschil in de eerste 12 maanden", () => {
  it("tot en met 2026: 6 maanden met vrijlating en 6 zonder, niet 12 × het verschil van de eerste maanden", () => {
    const invoer = basis({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } });
    const start = Number(bereken({ ...invoer, vrijlatingFase: "start" }).verschilPerMaand);
    const later = Number(bereken({ ...invoer, vrijlatingFase: "later" }).verschilPerMaand);
    expect(start).toBeGreaterThan(later);
    expect(Number(verschilEersteJaar(invoer).bedrag)).toBeCloseTo(6 * start + 6 * later, 2);
    expect(verschilEersteJaar(invoer).startMaanden).toBe(6);
  });
  it("vanaf 2027 (art. 34a): de eerste 12 maanden zijn één periode", () => {
    expect(verschilEersteJaar(basis({ datum: "2027-02-01", nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } })).startMaanden).toBe(12);
  });
});

describe("medische urenbeperking", () => {
  it("de uitleg noemt de vrijlating onder y alleen als de gebruiker die heeft", () => {
    const zonder = vrijlatingUitleg(basis());
    const met = vrijlatingUitleg(basis({ medischUrenbeperkt: true }));
    expect(zonder.periodes.map((p) => p.regel).join(" ")).not.toContain("medische");
    expect(met.periodes[1].regel).toContain("medische urenbeperking");
    expect(met.citaten.map((c) => c.titel)).toContain("Participatiewet, art. 31 lid 2 onder y");
  });
  it("onder de 27 meteen de vrijlating onder y, in één periode", () => {
    const u = vrijlatingUitleg(basis({ leeftijd: 24, medischUrenbeperkt: true }));
    expect(u.periodes).toHaveLength(1);
    expect(u.periodes[0].regel).toContain("15%");
  });
  it("in de situatie zonder vrijlating ('geen') telt ook de medische vrijlating niet", () => {
    const w = { brutoMaandloon: 900, urenPerWeek: 16 };
    const geen = bereken(basis({ nieuwWerk: w, vrijlatingFase: "geen", medischUrenbeperkt: true }));
    const gewoon = bereken(basis({ nieuwWerk: w, vrijlatingFase: "geen" }));
    expect(bijstand(geen, "werk")).toBe(bijstand(gewoon, "werk"));
  });
});

describe("kinderopvang: eigen bijdrage en bijzondere bijstand", () => {
  it("noemt de mogelijkheid van bijzondere bijstand als er een eigen bijdrage overblijft", () => {
    const r = bereken(
      basis({
        leefvorm: "alleenstaande_ouder",
        kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 12.5 } }],
        nieuwWerk: { brutoMaandloon: 1800, urenPerWeek: 24 },
        vrijlatingFase: "start",
      }),
    );
    expect(r.signalen.some((s) => s.tekst.includes("bijzondere bijstand"))).toBe(true);
  });
});

describe("Leiden: vergoeding eigen bijdrage kinderopvang (CVDR677687 art. 1, 6 en 7 onder f)", () => {
  const ouder = (bruto: number, prijs = 12.5): Invoer =>
    basis({
      leefvorm: "alleenstaande_ouder",
      kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: prijs } }],
      nieuwWerk: { brutoMaandloon: bruto, urenPerWeek: 24 },
      vrijlatingFase: "start",
    });
  const p = (r: Resultaat, id: string) => r.werk.posten.find((x) => x.id === id);

  it("onder 110% van de rekennorm: de hele eigen bijdrage wordt vergoed", () => {
    const r = bereken(ouder(1200));
    const eigen = -Number(p(r, "opvangkosten")!.perMaand) - Number(p(r, "kot")!.perMaand);
    expect(Number(p(r, "bb_opvang")!.perMaand)).toBeCloseTo(eigen, 2);
  });
  it("rekennorm alleenstaande ouder: 90% van de gezinsnorm, zonder vakantietoeslag", () => {
    const r = bereken(ouder(1200));
    const stap = p(r, "bb_opvang")!.stappen.find((s) => s.tekst.startsWith("Bijstandsnorm voor de bijzondere bijstand"))!;
    expect(stap.bedrag).toBe("1733.76"); // 2.027,79 × 0,9 × 0,95
  });
  it("bij een hoog inkomen draagt u zelf meer bij, tot er niets meer vergoed wordt", () => {
    const laag = Number(p(bereken(ouder(2600)), "bb_opvang")?.perMaand ?? 0);
    const hoog = Number(p(bereken(ouder(4500)), "bb_opvang")?.perMaand ?? 0);
    expect(hoog).toBeLessThanOrEqual(laag);
    expect(hoog).toBe(0);
  });
  it("geen vergoeding zonder eigen bijdrage (opvang onder het maximum uurtarief, hoge toeslag)", () => {
    const r = bereken(ouder(1200, 8));
    const bb = p(r, "bb_opvang");
    expect(bb === undefined || Number(bb.perMaand) < 40).toBe(true);
  });
});

describe("verblijf in een inrichting (art. 23 Pw), bijvoorbeeld een woonvorm met begeleiding", () => {
  it("alleenstaande: € 449,44 + € 47,00 per 1 juli 2026, zonder kostendelersnorm en zonder huurtoeslag", () => {
    const r = bereken(basis({ kostendelers: 2, wonen: { soort: "instelling" } }));
    expect(bijstand(r)).toBe("496.44");
    expect(r.huidig.posten.find((p) => p.id === "huurtoeslag")).toBeUndefined();
  });
  it("gehuwden: € 699,11 + € 106,00", () => {
    const r = bereken(basis({ leefvorm: "paar", partner: { leeftijd: 40 }, wonen: { soort: "instelling" } }));
    expect(bijstand(r)).toBe("805.11");
  });
  it("per 1 januari 2026: € 443,76 + € 47,00", () => {
    expect(bijstand(bereken(basis({ datum: "2026-03-01", wonen: { soort: "instelling" } })))).toBe("490.76");
  });
});

describe("huurtoeslag: iedereen in huis telt mee, ook jonger dan 27 (Awir art. 7; brochure stap 5)", () => {
  const huur = { soort: "huur" as const, kaleHuurPerMaand: 700 };
  it("een huisgenoot van 18 tot 27 telt mee voor het aantal personen en het inkomen", () => {
    const zonder = bereken(basis({ wonen: huur }));
    const met = bereken(basis({ wonen: huur, jongeHuisgenoten: 1, huisgenotenInkomenJaar: 15000 }));
    const ht = (r: Resultaat) => Number(r.huidig.posten.find((p) => p.id === "huurtoeslag")!.perMaand);
    expect(ht(met)).toBeLessThan(ht(zonder));
    // De bijstand verandert niet: de kostendelersnorm geldt pas vanaf 27 jaar.
    expect(bijstand(met)).toBe(bijstand(zonder));
  });
  it("zonder inkomen van de jonge huisgenoot: huurtoeslag niet berekend", () => {
    const r = bereken(basis({ wonen: huur, jongeHuisgenoten: 1 }));
    expect(r.huidig.posten.find((p) => p.id === "huurtoeslag")!.perMaand).toBeNull();
  });
});

describe("bronvermelding", () => {
  it("elke melding bij de uitkomst heeft een letterlijke brontekst", async () => {
    const { huishoudens } = await import("./huishoudens.ts");
    const extra: Invoer[] = [
      basis({ wonen: { soort: "instelling" }, nieuwWerk: { brutoMaandloon: 400, urenPerWeek: 8 }, vrijlatingFase: "start" }),
      basis({ nieuwWerk: { brutoVierwekenloon: 1500, urenPerWeek: 24 }, vrijlatingFase: "start" }),
      basis({
        leefvorm: "alleenstaande_ouder",
        kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 12.5 } }],
        nieuwWerk: { brutoMaandloon: 1800, urenPerWeek: 24 },
        vrijlatingFase: "start",
      }),
    ];
    for (const invoer of [...Object.values(huishoudens), ...extra]) {
      for (const s of bereken(invoer).signalen) {
        expect(s.bron, s.tekst).toBeDefined();
        expect(s.kop.length, s.tekst).toBeGreaterThan(3);
        expect(s.bron!.tekst.length).toBeGreaterThan(20);
      }
    }
  });
  it("de vrijlating heeft per periode de wettekst van de juiste datum", () => {
    expect(vrijlatingUitleg(basis({ datum: "2026-03-01" })).citaten[0].tekst).toContain("€ 285,00 per maand");
    expect(vrijlatingUitleg(basis({ datum: "2026-08-01" })).citaten[0].tekst).toContain("€ 289,00");
  });
});

describe("twee banen (bijbaan)", () => {
  it("het loon telt op en de belasting gaat over het totaal", () => {
    const twee = bereken(basis({ nieuwWerk: { brutoMaandloon: 900, bijbaan: { brutoMaandloon: 400 } }, vrijlatingFase: "start" }));
    const een = bereken(basis({ nieuwWerk: { brutoMaandloon: 1300 }, vrijlatingFase: "start" }));
    const loon = (r: Resultaat) => r.werk.posten.find((p) => p.id === "loon")!.perMaand;
    expect(loon(twee)).toBe(loon(een));
    expect(bijstand(twee, "werk")).toBe(bijstand(een, "werk"));
  });
});

describe("vakantiegeld (art. 15 Wml, uit de regeldata)", () => {
  const loon = (w: Invoer["nieuwWerk"]) =>
    Number(bereken(basis({ nieuwWerk: w, vrijlatingFase: "start" })).werk.posten.find((p) => p.id === "loon")!.perMaand);
  it("zonder opgave rekent de app met 8% uit de regeldata, en noemt die regel als bron", () => {
    const r = bereken(basis({ nieuwWerk: { brutoUurloon: 15, urenPerWeek: 20 }, vrijlatingFase: "start" }));
    const p = r.werk.posten.find((x) => x.id === "loon")!;
    expect(p.parameters.some((g) => g.id === "wml.vakantiebijslag")).toBe(true);
    expect(loon({ brutoUurloon: 15, urenPerWeek: 20 })).toBe(loon({ brutoUurloon: 15, urenPerWeek: 20, vakantiegeld: 0.08 }));
  });
  it("all-in uurloon: geen vakantiegeld erbij, dus minder netto", () => {
    expect(loon({ brutoUurloon: 15, urenPerWeek: 20, vakantiegeld: 0 })).toBeLessThan(loon({ brutoUurloon: 15, urenPerWeek: 20 }));
  });
});

describe("na de QA", () => {
  it("wie al werkt en nu al opvang heeft: opvang en toeslag ook bij 'Nu'", () => {
    const i = basis({
      leefvorm: "alleenstaande_ouder",
      kinderen: [{ leeftijd: 6, opvang: { soort: "bso", urenPerMaand: 40, uurprijs: 9 } }],
      huidigWerk: { brutoUurloon: 14.5, urenPerWeek: 12 },
      nieuwWerk: { brutoUurloon: 14.5, urenPerWeek: 28 },
      huidigeVrijlating: "later",
      vrijlatingFase: "later",
    });
    expect(bereken(i).huidig.posten.find((p) => p.id === "kot")).toBeUndefined();
    const r = bereken({ ...i, opvangNu: true });
    expect(r.huidig.posten.find((p) => p.id === "kot")).toBeDefined();
    expect(r.huidig.posten.find((p) => p.id === "opvangkosten")).toBeDefined();
  });
  it("Sleutelpas: de grens gaat uit van het sociaal minimum, ook in een woonvorm met begeleiding", () => {
    const w = { brutoMaandloon: 900, urenPerWeek: 16 };
    const gewoon = bereken(basis({ nieuwWerk: w, vrijlatingFase: "start" })).signalen.find((s) => s.tekst.includes("Sleutelpas"));
    const instelling = bereken(basis({ wonen: { soort: "instelling" }, nieuwWerk: w, vrijlatingFase: "start" })).signalen.find((s) => s.tekst.includes("Sleutelpas"));
    expect(instelling?.tekst).toBe(gewoon?.tekst);
  });
});

describe("ander inkomen (art. 32 Pw)", () => {
  it("gaat helemaal van de bijstand af, nu en met werk, en verandert het verschil niet zolang er bijstand is", () => {
    const w = { brutoMaandloon: 600, urenPerWeek: 10 };
    const zonder = bereken(basis({ nieuwWerk: w, vrijlatingFase: "start" }));
    const met = bereken(basis({ nieuwWerk: w, vrijlatingFase: "start", anderInkomenPerMaand: 250 }));
    expect(Number(bijstand(met))).toBeCloseTo(Number(bijstand(zonder)) - 250, 2);
    expect(Number(bijstand(met, "werk"))).toBeCloseTo(Number(bijstand(zonder, "werk")) - 250, 2);
    expect(met.huidig.posten.find((p) => p.id === "ander_inkomen")!.perMaand).toBe("250.00");
    expect(met.verschilPerMaand).toBe(zonder.verschilPerMaand);
  });
});

describe("Leiden: collectieve zorgverzekering en kwijtschelding", () => {
  const tekst = (r: Resultaat, woord: string) => r.signalen.find((s) => s.kop.startsWith(woord));
  it("zorgverzekering: onder 120% van de norm kan de gemeente nog meebetalen, daarboven niet", () => {
    const laag = bereken(basis({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 }, vrijlatingFase: "start" }));
    const hoog = bereken(basis({ nieuwWerk: { brutoMaandloon: 2600, urenPerWeek: 36 }, vrijlatingFase: "start" }));
    expect(tekst(laag, "Zorgverzekering")!.tekst).toContain("kan dat waarschijnlijk nog");
    expect(tekst(laag, "Zwemabonnement")!.tekst).toContain("zwembad De Vliet of De Zijl");
    expect(tekst(laag, "Gratis OV-pas")!.tekst).toContain("Zolang u bijstand krijgt");
    expect(tekst(hoog, "Gratis OV-pas")!.tekst).toContain("krijgt u die pas niet meer");
    const dakloos = bereken(basis({ wonen: { soort: "geen_woonkosten", dakloos: true, betaaltWoonlasten: false }, nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 }, vrijlatingFase: "start" }));
    expect(tekst(dakloos, "Gratis OV-pas")).toBeUndefined();
    expect(tekst(hoog, "Zorgverzekering")!.tekst).toContain("niet meer mee");
    // 120% van € 1.419,46
    expect(tekst(hoog, "Zorgverzekering")!.tekst).toMatch(/€\s1\.703/);
  });
  it("de kleur van een melding volgt het recht: groen zolang het blijft, oranje als het vervalt, en acties staan bovenaan", () => {
    const laag = bereken(basis({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 }, vrijlatingFase: "start" }));
    const hoog = bereken(basis({ nieuwWerk: { brutoMaandloon: 2600, urenPerWeek: 36 }, vrijlatingFase: "start" }));
    for (const kop of ["Individuele inkomenstoeslag", "Gratis OV-pas", "Zorgverzekering", "Sleutelpas"]) {
      expect(tekst(laag, kop)!.soort, kop).toBe("info");
      expect(tekst(hoog, kop)!.soort, kop).toBe("waarschuwing");
    }
    expect(tekst(laag, "Individuele inkomenstoeslag")!.tekst).toContain("blijven krijgen");
    expect(tekst(hoog, "Individuele inkomenstoeslag")!.tekst).toContain("waarschijnlijk niet meer");
    const rang = (s: { actie?: boolean; soort: string }) => (s.actie ? 0 : s.soort === "waarschuwing" ? 1 : 2);
    for (const r of [laag, hoog]) expect(r.signalen.map(rang)).toEqual([...r.signalen.map(rang)].sort());
  });
  it("kwijtschelding: alleen een melding als de bijstand door het werk stopt", () => {
    const laag = bereken(basis({ nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 }, vrijlatingFase: "start" }));
    const hoog = bereken(basis({ nieuwWerk: { brutoMaandloon: 2600, urenPerWeek: 36 }, vrijlatingFase: "start" }));
    expect(tekst(laag, "Gemeentelijke belastingen")).toBeUndefined();
    expect(tekst(hoog, "Gemeentelijke belastingen")!.bron!.tekst).toContain("Afvalstoffenheffing");
  });
});

describe("Leiden: meldingen over zorgverzekering, zwemmen en sport", () => {
  const melding = (r: Resultaat, kop: string) => r.signalen.find((s) => s.kop === kop);
  it("zorgverzekering en zwemabonnement zijn twee losse meldingen", () => {
    const r = bereken(basis({ nieuwWerk: { brutoMaandloon: 900 }, vrijlatingFase: "geen" }));
    expect(melding(r, "Zorgverzekering")?.tekst).not.toContain("zwem");
    expect(melding(r, "Zwemabonnement")?.tekst).toContain("De Vliet");
  });
  it("Volwassenenfonds: tot 120% van de norm een tip, daarboven een waarschuwing", () => {
    // Norm alleenstaande € 1.419,46; 120% = € 1.703,35.
    const laag = melding(bereken(basis({ nieuwWerk: { brutoMaandloon: 900 } })), "Sport en cultuur");
    expect(laag?.soort).toBe("info");
    expect(laag?.tekst).toMatch(/250 per jaar/);
    expect(laag?.tekst).toMatch(/1\.703/);
    const hoog = melding(bereken(basis({ nieuwWerk: { brutoMaandloon: 3000 } })), "Sport en cultuur");
    expect(hoog?.soort).toBe("waarschuwing");
  });
});
