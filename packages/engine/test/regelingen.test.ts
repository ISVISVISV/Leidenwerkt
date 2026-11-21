/**
 * Rekenkern van de tweede app: welke regelingen iemand in Leiden kan krijgen (src/regelingen.ts).
 * De voorwaarden staan in docs/recht/VOORWAARDEN.md.
 */
import { describe, expect, it } from "vitest";
import { bereken, checkRegelingen, type CheckInvoer, type Invoer, type Kans, type Uitslag, type Vermogen } from "../src/index.js";

const DATUM = "2026-11-21";
const geld = (spaarrekening: number, over: Partial<Vermogen> = {}): Vermogen => ({ betaalrekening: 0, spaarrekening, voertuigen: [], beleggingen: 0, spullen: 0, schulden: 0, ...over });
const invoer = (over: Partial<CheckInvoer> = {}): CheckInvoer => ({
  datum: DATUM,
  aanvrager: { leeftijd: 40, inkomen: { loon: 1200 } },
  kinderen: [],
  bijstand: false,
  langLaagInkomen: "ja",
  wonen: "huur",
  kaleHuurPerMaand: 750,
  andereBewoners: false,
  vermogen: geld(1000),
  ...over,
});
const uitslag = (u: Uitslag[], id: string) => u.find((x) => x.id === id);
const kans = (i: CheckInvoer, id: string): Kans | undefined => uitslag(checkRegelingen(i), id)?.kans;

describe("grenzen van de gemeente", () => {
  it("120% voor een alleenstaande is ongeveer € 1.618, zoals de tabel op gemeente.leiden.nl (€ 1.618,18)", () => {
    expect(uitslag(checkRegelingen(invoer()), "volwassenenfonds")!.waarom).toContain("ongeveer € 1.618 netto per maand");
  });
  it("120% voor een stel is ongeveer € 2.312 (tabel: € 2.311,68)", () => {
    const i = invoer({ partner: { leeftijd: 40, inkomen: {} } });
    expect(uitslag(checkRegelingen(i), "volwassenenfonds")!.waarom).toContain("ongeveer € 2.312 netto per maand");
  });
  it("130% voor een eenoudergezin is ongeveer € 1.753 (tabel: € 1.753,04)", () => {
    const i = invoer({ kinderen: [{ leeftijd: 8 }], kinderbijslag: true });
    expect(uitslag(checkRegelingen(i), "sleutelpas")!.waarom).toContain("ongeveer € 1.753 netto per maand");
  });
  it("net onder en net boven de grens van 120%", () => {
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 1618 } } }), "gemeentepolis")).toBe("ja");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 1619 } } }), "gemeentepolis")).toBe("nee");
  });
  it("met bijstand telt de norm als inkomen: onder elke grens", () => {
    const u = checkRegelingen(invoer({ bijstand: true, aanvrager: { leeftijd: 40, inkomen: {} } }));
    for (const id of ["sleutelpas", "volwassenenfonds", "gemeentepolis", "ovpas"]) expect(uitslag(u, id)!.kans, id).toBe("ja");
    expect(uitslag(u, "sleutelpas")!.waarom).toContain("vanzelf");
    expect(uitslag(u, "bijstand")).toBeUndefined();
  });
  it("alleenstaande van 18 tot 21: de grens met de jongerennorm, € 399 bij 120% (tabel gemeente: € 399,48)", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 19, inkomen: { loon: 350 } } })), "gemeentepolis")!;
    expect(u.kans).toBe("ja");
    expect(u.waarom).toContain("ongeveer €\u00a0399 netto per maand");
  });
  it("alleenstaande van 18 tot 21 boven de grens: misschien, want zonder steun van de ouders kan de grens hoger zijn", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 19, inkomen: { loon: 600 } } })), "gemeentepolis")!;
    expect(u.kans).toBe("misschien");
    expect(u.waarom).toContain("Krijgt u geen geld van uw ouders?");
  });
  it("jongeren met een partner of kinderen: Leidengeldfit rekent de grens nog niet uit en zegt dat", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 19, inkomen: { loon: 600 } }, partner: { leeftijd: 25, inkomen: {} } })), "gemeentepolis")!;
    expect(u.kans).toBe("misschien");
    expect(u.waarom).toContain("18, 19 en 20 jaar");
  });
  it("jongeren en bijstand: nooit de zin dat het inkomen lager is dan de bijstand als dat niet uit te rekenen is", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 19, inkomen: { loon: 600 } }, partner: { leeftijd: 20, inkomen: {} } })), "bijstand")!;
    expect(u.waarom).not.toContain("lager dan de bijstand");
  });
  it("een eigen bedrijf: misschien, met uitleg", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { bedrijf: 900 } } })), "sleutelpas")!;
    expect(u.kans).toBe("misschien");
    expect(u.waarom).toContain("winst");
  });
});

describe("Sleutelpas, Kindtegoed, laptop en zwemles", () => {
  it("niet in een instelling (art. 2.2 a)", () => {
    expect(kans(invoer({ wonen: "instelling" }), "sleutelpas")).toBe("nee");
  });
  it("niet met studiefinanciering, wel met een kind (art. 2.2 c)", () => {
    const student = { leeftijd: 22, inkomen: { studiefinanciering: 800 } };
    expect(kans(invoer({ aanvrager: student }), "sleutelpas")).toBe("nee");
    expect(kans(invoer({ aanvrager: student, kinderen: [{ leeftijd: 2 }], kinderbijslag: true }), "sleutelpas")).toBe("ja");
  });
  it("met een schuldregeling de Sleutelpas, ook boven 130% (art. 2.3 b en c)", () => {
    const hoog = { leeftijd: 40, inkomen: { loon: 2500 } };
    expect(kans(invoer({ aanvrager: hoog }), "sleutelpas")).toBe("nee");
    expect(kans(invoer({ aanvrager: hoog, schuldregeling: true }), "sleutelpas")).toBe("ja");
  });
  it("Kindtegoed per leeftijd: € 150 + € 350 + € 550 = € 1.050", () => {
    const u = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 2 }, { leeftijd: 8 }, { leeftijd: 15 }], kinderbijslag: true })), "kindtegoed")!;
    expect(u.bedrag).toBe("€ 1.050 per jaar");
  });
  it("Kindtegoed niet zonder kinderbijslag (art. 1.1 d)", () => {
    expect(kans(invoer({ kinderen: [{ leeftijd: 8 }], kinderbijslag: false }), "kindtegoed")).toBe("nee");
  });
  it("laptop: 1 voor de kinderen van 4 tot en met 11 samen, 1 per kind van 12 tot en met 17", () => {
    const u = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 5 }, { leeftijd: 9 }, { leeftijd: 13 }, { leeftijd: 16 }], kinderbijslag: true })), "laptop")!;
    expect(u.bedrag).toBe("3 laptops per 5 jaar");
  });
  it("zwemles alleen met een kind van 5 jaar of ouder", () => {
    expect(kans(invoer({ kinderen: [{ leeftijd: 4 }], kinderbijslag: true }), "zwemles")).toBeUndefined();
    expect(kans(invoer({ kinderen: [{ leeftijd: 5 }], kinderbijslag: true }), "zwemles")).toBe("ja");
  });
});

describe("individuele inkomenstoeslag", () => {
  const laag = { leeftijd: 40, inkomen: { uwv: 1300 } };
  it("vanaf 23 jaar", () => {
    expect(kans(invoer({ aanvrager: { ...laag, leeftijd: 22 } }), "iit")).toBe("nee");
    expect(kans(invoer({ aanvrager: laag }), "iit")).toBe("ja");
  });
  it("vermogen boven de grens van de bijstand (€ 8.000 voor een alleenstaande): nee", () => {
    expect(kans(invoer({ aanvrager: laag, vermogen: geld(8000) }), "iit")).toBe("ja");
    expect(kans(invoer({ aanvrager: laag, vermogen: geld(8001) }), "iit")).toBe("nee");
  });
  it("weet niet of het inkomen al 5 jaar laag is: misschien", () => {
    expect(kans(invoer({ aanvrager: laag, langLaagInkomen: "onbekend" }), "iit")).toBe("misschien");
    expect(kans(invoer({ aanvrager: laag, langLaagInkomen: "nee" }), "iit")).toBe("nee");
  });
  it("koopwoning: misschien, de gemeente kijkt ook naar het huis", () => {
    expect(kans(invoer({ aanvrager: laag, wonen: "koop" }), "iit")).toBe("misschien");
  });
});

describe("geld en bezit", () => {
  const laag = { leeftijd: 40, inkomen: { uwv: 1300 } };
  it("bijstand: één auto tot € 4.500 telt niet mee (Leiden, art. 2.1 lid 1)", () => {
    expect(kans(invoer({ aanvrager: laag, vermogen: geld(7000, { voertuigen: [4500] }) }), "iit")).toBe("ja");
  });
  it("bijstand: van een duurdere auto telt alleen het deel boven € 4.500 (lid 2)", () => {
    // 7.000 + (6.000 − 4.500) = 8.500, meer dan € 8.000
    expect(kans(invoer({ aanvrager: laag, vermogen: geld(7000, { voertuigen: [6000] }) }), "iit")).toBe("nee");
  });
  it("bijstand: een tweede auto telt helemaal mee (lid 3)", () => {
    // 5.000 + 4.000 + 2.000 − 4.000 = 7.000; met de vrijstelling op de duurste auto
    expect(kans(invoer({ aanvrager: laag, vermogen: geld(5000, { voertuigen: [4000, 2000] }) }), "iit")).toBe("ja");
    expect(kans(invoer({ aanvrager: laag, vermogen: geld(5000, { voertuigen: [4000, 3500] }) }), "iit")).toBe("nee");
  });
  it("toeslagen: de auto telt niet mee, schulden gaan eraf", () => {
    expect(kans(invoer({ vermogen: geld(38000, { voertuigen: [20000] }) }), "huurtoeslag")).toBe("ja");
    expect(kans(invoer({ vermogen: geld(40000, { schulden: 2000 }) }), "huurtoeslag")).toBe("ja");
  });
  it("toeslagen: boven € 59.357 geen bedrag, want inkomen uit vermogen telt mee", () => {
    const u = uitslag(checkRegelingen(invoer({ vermogen: geld(60000) })), "zorgtoeslag")!;
    expect(u.kans).toBe("misschien");
    expect(u.bedrag).toBeUndefined();
  });
});

describe("tegemoetkoming voor alleenverdieners", () => {
  const paar = (aanvrager: CheckInvoer["aanvrager"], partner: CheckInvoer["aanvrager"]) => invoer({ aanvrager, partner });
  it("grootste inkomen een uitkering van UWV en samen onder de norm: ja", () => {
    expect(kans(paar({ leeftijd: 40, inkomen: { uwv: 1500 } }, { leeftijd: 40, inkomen: {} }), "alleenverdieners")).toBe("ja");
  });
  it("grootste inkomen loon: nee", () => {
    expect(kans(paar({ leeftijd: 40, inkomen: { uwv: 400 } }, { leeftijd: 40, inkomen: { loon: 1000 } }), "alleenverdieners")).toBe("nee");
  });
  it("zonder partner geen uitslag", () => {
    expect(kans(invoer(), "alleenverdieners")).toBeUndefined();
  });
});

describe("studietoeslag en bijstand", () => {
  const student = (leeftijd: number) => ({ leeftijd, inkomen: { studiefinanciering: 600 } });
  it("minimumbedrag naar leeftijd (art. 7a)", () => {
    expect(uitslag(checkRegelingen(invoer({ aanvrager: student(24), studieMedisch: "ja" })), "studietoeslag")!.bedrag).toBe("minstens € 390,07 per maand");
    expect(uitslag(checkRegelingen(invoer({ aanvrager: student(19), studieMedisch: "ja" })), "studietoeslag")!.bedrag).toBe("minstens € 234,05 per maand");
  });
  it("zonder medische reden geen studietoeslag", () => {
    expect(kans(invoer({ aanvrager: student(24), studieMedisch: "nee" }), "studietoeslag")).toBe("nee");
  });
  it("studiefinanciering en jonger dan 27: geen bijstand (art. 13 lid 2 c)", () => {
    expect(kans(invoer({ aanvrager: student(24) }), "bijstand")).toBe("nee");
  });
  it("inkomen onder de norm: misschien bijstand, nooit zeker", () => {
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: {} } }), "bijstand")).toBe("misschien");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: {} }, vermogen: geld(9000) }), "bijstand")).toBe("nee");
  });
});

describe("toeslagen", () => {
  it("met bijstand dezelfde zorgtoeslag en huurtoeslag als Leidenwerkt", () => {
    const lw: Invoer = {
      datum: DATUM,
      gemeente: "leiden",
      leefvorm: "alleenstaande",
      leeftijd: 40,
      kinderen: [],
      kostendelers: 0,
      wonen: { soort: "huur", kaleHuurPerMaand: 750 },
      nieuwWerk: { brutoMaandloon: 0, urenPerWeek: 0 },
      vrijlatingFase: "start",
    };
    const r = bereken(lw);
    const lwBedrag = (id: string) => r.huidig.posten.find((p) => p.id === id)!.perMaand!;
    const u = checkRegelingen(invoer({ bijstand: true, aanvrager: { leeftijd: 40, inkomen: {} } }));
    for (const id of ["zorgtoeslag", "huurtoeslag"]) {
      const getal = Number(lwBedrag(id));
      expect(uitslag(u, id)!.bedrag, id).toBe(`ongeveer € ${getal.toLocaleString("nl-NL", { maximumFractionDigits: 0 })} per maand`);
    }
  });
  it("een kamer: geen huurtoeslag", () => {
    expect(kans(invoer({ wonen: "kamer" }), "huurtoeslag")).toBe("nee");
  });
  it("andere volwassenen in huis: huurtoeslag misschien", () => {
    expect(kans(invoer({ andereBewoners: true }), "huurtoeslag")).toBe("misschien");
  });
  it("vermogen boven € 38.479: geen huurtoeslag, wel zorgtoeslag", () => {
    const i = invoer({ vermogen: geld(40000) });
    expect(kans(i, "huurtoeslag")).toBe("nee");
    expect(kans(i, "zorgtoeslag")).toBe("ja");
  });
  it("meer dan één soort inkomen: geen bedrag, wel de proefberekening", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 600, uwv: 600 } } })), "zorgtoeslag")!;
    expect(u.kans).toBe("misschien");
    expect(u.bedrag).toBeUndefined();
  });
});

describe("soorten inkomen", () => {
  it("kinderalimentatie telt niet mee voor de toeslagen, wel voor de grenzen van de gemeente", () => {
    const zonder = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 1200 } } })), "zorgtoeslag")!;
    const met = checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 1200, kinderalimentatie: 500 } } }));
    expect(uitslag(met, "zorgtoeslag")!.bedrag).toBe(zonder.bedrag);
    expect(uitslag(met, "gemeentepolis")!.kans).toBe("nee"); // 1.700 > 1.618
  });
  it("loon met partneralimentatie: wel een bedrag, en lager dan zonder alimentatie", () => {
    const bedrag = (i: CheckInvoer) => Number(uitslag(checkRegelingen(i), "zorgtoeslag")!.bedrag!.replace(/\D/g, ""));
    const met = invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2000, partneralimentatie: 300 } } });
    expect(bedrag(met)).toBeLessThan(bedrag(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2000 } } })));
  });
  it("met Wajong geen studietoeslag (art. 36b lid 3 b)", () => {
    const i = invoer({ aanvrager: { leeftijd: 22, inkomen: { studiefinanciering: 400, uwv: 300 }, uitkering: "wajong" }, studieMedisch: "ja" });
    expect(kans(i, "studietoeslag")).toBe("nee");
  });
  it("spullen tellen niet mee voor de toeslagen, wel voor de bijstand", () => {
    const laag = { leeftijd: 40, inkomen: { uwv: 1300 } };
    const i = invoer({ aanvrager: laag, vermogen: geld(1000, { spullen: 50000 }) });
    expect(kans(i, "huurtoeslag")).toBe("ja");
    expect(kans(i, "iit")).toBe("nee");
  });
  it("alleenverdieners: het grootste bedrag in het huishouden is een uitkering van UWV", () => {
    const i = invoer({ aanvrager: { leeftijd: 40, inkomen: { uwv: 900, loon: 200 } }, partner: { leeftijd: 40, inkomen: { loon: 500 } } });
    expect(kans(i, "alleenverdieners")).toBe("ja");
  });
});

describe("kinderbijslag en kinderopvang bij problemen", () => {
  it("geen kinderbijslag: wel tonen, met het bedrag per kwartaal (€ 298,40 + € 362,35)", () => {
    const u = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 3 }, { leeftijd: 8 }], kinderbijslag: false })), "kinderbijslag")!;
    expect(u.kans).toBe("ja");
    expect(u.bedrag).toBe("€\u00a0660,75 per kwartaal");
  });
  it("al kinderbijslag: niet tonen", () => {
    expect(kans(invoer({ kinderen: [{ leeftijd: 3 }], kinderbijslag: true }), "kinderbijslag")).toBeUndefined();
  });
  it("kinderopvang bij sociale of medische problemen: alleen met een kind jonger dan 13", () => {
    expect(kans(invoer({ kinderen: [{ leeftijd: 14 }], kinderbijslag: true }), "smi")).toBeUndefined();
    expect(kans(invoer({ kinderen: [{ leeftijd: 2 }], kinderbijslag: true }), "smi")).toBe("misschien");
  });
});

describe("kwijtschelding, bijzondere bijstand en goed om te weten", () => {
  it("kwijtschelding: misschien tot het sociaal minimum, daarboven geen melding", () => {
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { uwv: 1300 } } }), "kwijtschelding")).toBe("misschien");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { uwv: 1400 } } }), "kwijtschelding")).toBeUndefined();
  });
  it("bijzondere bijstand: misschien tot 150%, daarboven geen melding", () => {
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2000 } } }), "bijzondere_bijstand")).toBe("misschien");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2100 } } }), "bijzondere_bijstand")).toBeUndefined();
  });
  it("goed om te weten staat er altijd, ook bij een hoog inkomen", () => {
    const u = checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 5000 } } }));
    expect(u.filter((x) => x.kans === "info").map((x) => x.id)).toEqual(["goede_buur", "stadsbank", "voedselbank"]);
  });
});

describe("teksten", () => {
  const voorbeelden: CheckInvoer[] = [
    invoer(),
    invoer({ bijstand: true, kinderen: [{ leeftijd: 3 }, { leeftijd: 14 }], kinderbijslag: true }),
    invoer({ partner: { leeftijd: 50, inkomen: { uwv: 1600 } }, wonen: "koop", vermogen: geld(0) }),
    invoer({ aanvrager: { leeftijd: 20, inkomen: { studiefinanciering: 500 } }, studieMedisch: "ja", wonen: "kamer" }),
    invoer({ wonen: "dakloos", aanvrager: { leeftijd: 30, inkomen: {} } }),
  ];
  it("elke uitslag heeft een bron, een reden en geen puntkomma", () => {
    for (const i of voorbeelden)
      for (const u of checkRegelingen(i)) {
        expect(u.bronnen.length, u.id).toBeGreaterThan(0);
        expect(u.waarom.length, u.id).toBeGreaterThan(10);
        expect(u.waarom, u.id).not.toContain(";");
        expect(u.waarom, u.id).not.toMatch(/  |undefined|NaN/);
      }
  });
});
