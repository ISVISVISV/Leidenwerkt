/**
 * Rekenkern van de tweede app: welke regelingen iemand in Leiden kan krijgen (src/regelingen.ts).
 * De voorwaarden staan in docs/RECHT.md (deel 2).
 */
import { describe, expect, it } from "vitest";
import { bijstandsnorm } from "../src/modules/bijstand.js";
import { brutoJaarMetAow, nettoMetAow } from "../src/modules/belasting.js";
import { NUL } from "../src/geld.js";
import { bereken, CITATEN, checkRegelingen, D, heeftAowLeeftijd, Lezer, standaardRegels, type CheckInvoer, type Invoer, type Kans, type Uitslag, type Vermogen } from "../src/index.js";

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
  it("jongeren met een partner of kinderen: Leidengeldwijzer rekent de grens nog niet uit en zegt dat", () => {
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
  it("boven 130% noemt de Sleutelpas de schuldregeling (art. 2.3 b en c)", () => {
    const hoog = { leeftijd: 40, inkomen: { loon: 2500 } };
    const u = uitslag(checkRegelingen(invoer({ aanvrager: hoog })), "sleutelpas")!;
    expect(u.kans).toBe("nee");
    expect(u.waarom).toContain("Heeft u een schuldregeling? Dan kunt u de Sleutelpas misschien toch krijgen.");
    expect(u.bronnen).toContainEqual(CITATEN.sleutelpasSchuld);
    const laag = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 1200 } } })), "sleutelpas")!;
    expect(laag.waarom).not.toContain("schuldregeling");
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
  it("een stel krijgt de toeslag samen: een partner jonger dan 23 of met studiefinanciering maakt het nee voor allebei", () => {
    const partner = { leeftijd: 40, inkomen: {} };
    expect(kans(invoer({ aanvrager: laag, partner }), "iit")).toBe("ja");
    const jong = uitslag(checkRegelingen(invoer({ aanvrager: laag, partner: { ...partner, leeftijd: 22 } })), "iit")!;
    expect(jong.kans).toBe("nee");
    expect(jong.waarom).toMatch(/^Uw partner is jonger dan 23 jaar\./);
    const student = uitslag(checkRegelingen(invoer({ aanvrager: laag, partner: { leeftijd: 30, inkomen: { studiefinanciering: 400 } } })), "iit")!;
    expect(student.kans).toBe("nee");
    expect(student.waarom).toMatch(/^Uw partner krijgt studiefinanciering\./);
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
  it("inkomen onder de norm in een huurwoning: waarschijnlijk wel bijstand. Bij een koopwoning of eigen bedrijf: misschien", () => {
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: {} } }), "bijstand")).toBe("ja");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: {} }, wonen: "koop" }), "bijstand")).toBe("misschien");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { bedrijf: 500 } } }), "bijstand")).toBe("misschien");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: {} }, vermogen: geld(9000) }), "bijstand")).toBe("nee");
  });
  it("hulp bij schulden: met schulden bij de gemeente (waarschijnlijk wel), anders bij 'Als u het nodig heeft'. Nooit twee keer", () => {
    const alle = checkRegelingen(invoer({ vermogen: geld(0, { schulden: 50000 }) }));
    expect(alle.filter((u) => u.id === "stadsbank")).toHaveLength(1);
    const met = uitslag(alle, "stadsbank")!;
    expect([met.kans, met.groep]).toEqual(["ja", "gemeente"]);
    expect(met.waarom).toBe("U heeft schulden.");
    const zonder = uitslag(checkRegelingen(invoer()), "stadsbank")!;
    expect([zonder.kans, zonder.groep]).toEqual(["info", "hulp"]);
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
  it("andere volwassenen in huis met onbekend inkomen: huurtoeslag misschien", () => {
    expect(kans(invoer({ andereBewoners: true }), "huurtoeslag")).toBe("misschien");
    expect(kans(invoer({ andereBewoners: true, andereBewonersAantal: 1 }), "huurtoeslag")).toBe("misschien");
    expect(kans(invoer({ kinderen: [{ leeftijd: 19 }] }), "huurtoeslag")).toBe("misschien");
  });
  it("met het inkomen van de huisgenoten rekent Leidengeldwijzer de huurtoeslag uit, net als Leidenwerkt", () => {
    const lw: Invoer = {
      datum: DATUM,
      gemeente: "leiden",
      leefvorm: "alleenstaande",
      leeftijd: 40,
      kinderen: [],
      kostendelers: 1,
      huisgenotenInkomenJaar: 6000,
      wonen: { soort: "huur", kaleHuurPerMaand: 750 },
      nieuwWerk: { brutoMaandloon: 0, urenPerWeek: 0 },
      vrijlatingFase: "start",
    };
    const getal = Number(bereken(lw).huidig.posten.find((p) => p.id === "huurtoeslag")!.perMaand!);
    const u = uitslag(checkRegelingen(invoer({ bijstand: true, aanvrager: { leeftijd: 40, inkomen: {} }, andereBewoners: true, andereBewonersAantal: 1, andereBewonersInkomenJaar: 6000 })), "huurtoeslag")!;
    expect(u.bedrag).toBe(`ongeveer €\u00a0${getal.toLocaleString("nl-NL", { maximumFractionDigits: 0 })} per maand`);
    expect(u.waarom).toContain("Het inkomen van de andere volwassenen in huis telt mee.");
    expect(u.bronnen).toContainEqual(CITATEN.htMedebewoners);
  });
  it("een kind jonger dan 23 met een klein inkomen: de vrijstelling, dus dezelfde huurtoeslag", () => {
    const zonder = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 19, leeftijdBeginJaar: 18, inkomenJaar: 0 }] })), "huurtoeslag")!.bedrag;
    const klein = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 19, leeftijdBeginJaar: 18, inkomenJaar: 3000 }] })), "huurtoeslag")!.bedrag;
    expect(zonder).toBeDefined();
    expect(klein).toBe(zonder);
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
  it("kinderopvang bij sociale of medische problemen: alleen met een kind jonger dan 13, bij 'Als u het nodig heeft'", () => {
    expect(kans(invoer({ kinderen: [{ leeftijd: 14 }], kinderbijslag: true }), "smi")).toBeUndefined();
    const u = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 2 }], kinderbijslag: true })), "smi")!;
    expect([u.kans, u.groep]).toEqual(["info", "hulp"]);
    expect(u.meenemen?.lijst.length).toBeGreaterThan(0);
  });
});

describe("kwijtschelding, bijzondere bijstand en goed om te weten", () => {
  it("kwijtschelding: misschien tot het sociaal minimum, daarboven geen melding", () => {
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { uwv: 1300 } } }), "kwijtschelding")).toBe("misschien");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { uwv: 1400 } } }), "kwijtschelding")).toBeUndefined();
  });
  it("bijzondere bijstand: bij 'Als u het nodig heeft' tot 150%, met twee voorbeelden. Daarboven geen melding", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2000 } } })), "bijzondere_bijstand")!;
    expect([u.kans, u.groep]).toEqual(["info", "hulp"]);
    expect(u.waarom).toContain("Bijvoorbeeld kosten voor rechtshulp of voor een bewindvoerder.");
    expect(kans(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2100 } } }), "bijzondere_bijstand")).toBeUndefined();
  });
  it("goed om te weten staat er altijd, ook bij een hoog inkomen", () => {
    const u = checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 5000 } } }));
    expect(u.filter((x) => x.kans === "info").map((x) => x.id)).toEqual(["goede_buur", "stadsbank", "voedselbank"]);
  });
  it("de Voedselbank noemt de grens voor het huishouden: € 210 plus € 125 per persoon", () => {
    expect(uitslag(checkRegelingen(invoer()), "voedselbank")!.waarom).toContain("niet meer dan €\u00a0335 per maand overhouden. Dat is de grens voor 1 persoon.");
    const gezin = uitslag(checkRegelingen(invoer({ partner: { leeftijd: 40, inkomen: {} }, kinderen: [{ leeftijd: 4 }, { leeftijd: 9 }] })), "voedselbank")!;
    expect(gezin.waarom).toContain("€\u00a0710 per maand overhouden. Dat is de grens voor uw huishouden van 4 personen.");
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

describe("kinderopvangtoeslag", () => {
  const opvang = { soort: "dagopvang" as const, urenPerMaand: 80, uurprijs: 10 };
  it("geen kind naar de opvang: geen kaart", () => {
    expect(uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 3 }] })), "kot")).toBeUndefined();
  });
  it("met werk en opvang: een bedrag. U betaalt zelf ook een deel.", () => {
    const u = uitslag(checkRegelingen(invoer({ kinderen: [{ leeftijd: 3, opvang }], kinderbijslag: true })), "kot")!;
    expect(u.kans).toBe("ja");
    expect(u.bedrag).toMatch(/^ongeveer €\s\d+ per maand$/);
    expect(u.wat).toContain("U betaalt zelf ook een deel.");
  });
  it("zonder werk of studie: waarschijnlijk niet, en de uitzondering (inburgering of traject naar werk) staat erbij", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { uwv: 1200 } }, kinderen: [{ leeftijd: 3, opvang }] })), "kot")!;
    expect(u.kans).toBe("nee");
    expect(u.waarom).toBe("U werkt niet en u studeert niet. Dan krijgt u meestal geen kinderopvangtoeslag. Het kan wel als u inburgert of een traject naar werk volgt.");
  });

  it("met een partner die niet werkt: de tekst noemt de partner, en de bron art. 1.6 lid 3 en 8", () => {
    const u = uitslag(
      checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 2000 } }, partner: { leeftijd: 38, inkomen: {} }, kinderen: [{ leeftijd: 3, opvang }] })),
      "kot",
    )!;
    expect(u.kans).toBe("nee");
    expect(u.waarom).toMatch(/^Uw partner werkt niet en studeert niet\..*Of als uw partner zorg krijgt uit de Wet langdurige zorg\.$/);
    expect(u.bronnen.map((b) => b.titel)).toContain("Wet kinderopvang, art. 1.6 lid 3 en lid 8");
  });
});

describe("kostendelersnorm (art. 22a Pw)", () => {
  it("met een huisgenoot van 27+ is de grens voor de bijstand de kostendelersnorm, zonder vakantiegeld", () => {
    const l = new Lezer(standaardRegels, DATUM);
    const verwacht = bijstandsnorm(l, {
      datum: DATUM, gemeente: "leiden", leefvorm: "alleenstaande", leeftijd: 40, kinderen: [], kostendelers: 1,
      wonen: { soort: "huur", kaleHuurPerMaand: 750 }, nieuwWerk: { brutoMaandloon: 0, urenPerWeek: 0 }, vrijlatingFase: "start",
    }).norm.times(D(1).minus(l.breuk("pw.vakantietoeslag")));
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 40, inkomen: { loon: 1100 } }, andereBewoners: true, kostendelers: 1 })), "bijstand")!;
    expect(u.kans).toBe("nee");
    expect(u.waarom).toContain(`ongeveer € ${Math.round(Number(verwacht)).toLocaleString("nl-NL")} netto per maand`.replace("€ ", "€ "));
    expect(u.waarom).toContain("Er wonen meer volwassenen bij u. Daarom is deze grens lager.");
    expect(u.bronnen).toContainEqual(CITATEN.kostendelerUitzonderingen);
  });
  it("een eigen kind van 27 jaar telt ook mee. De grenzen van 120% en meer blijven gelijk.", () => {
    const met = checkRegelingen(invoer({ aanvrager: { leeftijd: 55, inkomen: { loon: 1100 } }, kinderen: [{ leeftijd: 28 }] }));
    expect(uitslag(met, "bijstand")!.kans).toBe("nee");
    expect(uitslag(met, "volwassenenfonds")!.waarom).toContain("ongeveer €\u00a01.618 netto per maand");
  });
});

describe("AOW-leeftijd", () => {
  const aow = (inkomen: Record<string, number> = { aow: 1450 }) => ({ leeftijd: 70, aow: true, inkomen });
  it("AOW-leeftijd uit de tabel van de SVB: 67 jaar tot en met geboren in 1960, daarna 67 jaar en 3 maanden", () => {
    expect(heeftAowLeeftijd(standaardRegels, "1959-11-21", DATUM)).toBe(true); // vandaag 67
    expect(heeftAowLeeftijd(standaardRegels, "1959-11-22", DATUM)).toBe(false); // morgen 67
    expect(heeftAowLeeftijd(standaardRegels, "1950-05-01", DATUM)).toBe(true);
    expect(heeftAowLeeftijd(standaardRegels, "1960-12-31", "2027-12-31")).toBe(true);
    expect(heeftAowLeeftijd(standaardRegels, "1961-01-15", "2028-01-15")).toBe(false); // 67, maar nog niet 67 en 3 maanden
    expect(heeftAowLeeftijd(standaardRegels, "1961-01-15", "2028-04-15")).toBe(true);
    expect(heeftAowLeeftijd(standaardRegels, "1965-01-01", DATUM)).toBeUndefined(); // nog niet vastgesteld
  });
  it("120% voor een alleenstaande met AOW is ongeveer €\u00a01.810, zoals de tabel op gemeente.leiden.nl (€ 1.809,57)", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: aow({ aow: 1700 }) })), "volwassenenfonds")!;
    expect(u.kans).toBe("ja");
    expect(u.waarom).toContain("ongeveer €\u00a01.810 netto per maand");
    expect(u.bronnen.some((b) => b.titel.includes("art. 22"))).toBe(true);
  });
  it("120% voor een stel met AOW is ongeveer €\u00a02.481 (tabel: € 2.480,75), ook als maar één de AOW-leeftijd heeft (art. 22 c)", () => {
    const beide = invoer({ aanvrager: aow({ aow: 1000 }), partner: aow({ aow: 1000 }) });
    const een = invoer({ aanvrager: aow({ aow: 1000 }), partner: { leeftijd: 60, inkomen: { loon: 1000 } } });
    expect(uitslag(checkRegelingen(beide), "gemeentepolis")!.waarom).toContain("ongeveer €\u00a02.481 netto per maand");
    expect(uitslag(checkRegelingen(een), "gemeentepolis")!.waarom).toContain("ongeveer €\u00a02.481 netto per maand");
  });
  it("130% voor een alleenstaande met AOW is ongeveer €\u00a01.960 (tabel gemeente eenoudergezin AOW: € 1.960,36)", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: aow({ aow: 1900 }) })), "sleutelpas")!;
    expect(u.kans).toBe("ja");
    expect(u.waarom).toContain("ongeveer €\u00a01.960 netto per maand");
  });
  it("geen bijstand van de gemeente, wel de AIO-aanvulling van de SVB onder het sociaal minimum", () => {
    const u = checkRegelingen(invoer({ aanvrager: aow({ aow: 1200 }) }));
    expect(uitslag(u, "bijstand")).toBeUndefined();
    const aio = uitslag(u, "aio")!;
    expect(aio.kans).toBe("ja");
    expect(aio.groep).toBe("svb");
    expect(aio.wat).toContain("AIO-aanvulling");
    expect(aio.bronnen).toContain(CITATEN.aioWie);
  });
  it("AIO-aanvulling: boven het sociaal minimum of te veel geld: nee", () => {
    expect(kans(invoer({ aanvrager: aow({ aow: 1550 }) }), "aio")).toBe("nee");
    expect(kans(invoer({ aanvrager: aow({ aow: 1200 }), vermogen: geld(9000) }), "aio")).toBe("nee");
  });
  it("met een AIO-aanvulling: onder elke grens, maar de Sleutelpas komt niet vanzelf", () => {
    const u = checkRegelingen(invoer({ bijstand: true, aanvrager: aow({}) }));
    for (const id of ["sleutelpas", "volwassenenfonds", "gemeentepolis", "ovpas"]) expect(uitslag(u, id)!.kans, id).toBe("ja");
    expect(uitslag(u, "sleutelpas")!.waarom).not.toContain("vanzelf");
    expect(uitslag(u, "sleutelpas")!.waarom).toContain("Met een AIO-aanvulling");
    expect(uitslag(u, "aio")).toBeUndefined();
  });
  it("individuele inkomenstoeslag: ook nee als alleen de partner de AOW-leeftijd heeft (een stel telt als één geheel)", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: { leeftijd: 60, inkomen: { loon: 500 } }, partner: aow({ aow: 800 }) })), "iit")!;
    expect(u.kans).toBe("nee");
    expect(u.bronnen).toContain(CITATEN.iitAow);
    expect(u.bronnen).toContain(CITATEN.iitGehuwden);
  });
  it("Sleutelpas met een AIO-aanvulling: aanvragen met de maandspecificatie", () => {
    const u = uitslag(checkRegelingen(invoer({ bijstand: true, aanvrager: aow({}) })), "sleutelpas")!;
    expect(u.waarom).toContain("maandspecificatie");
    expect(u.bronnen).toContain(CITATEN.sleutelpasSpecificatie);
  });
  it("individuele inkomenstoeslag: niet met de AOW-leeftijd", () => {
    const u = uitslag(checkRegelingen(invoer({ aanvrager: aow({ aow: 1200 }) })), "iit")!;
    expect(u.kans).toBe("nee");
    expect(u.bronnen).toContain(CITATEN.iitLeeftijd);
  });
  it("bruto uit netto met de AOW-leeftijd klopt met de bedragen van de SVB (1 juli 2026)", () => {
    const l = new Lezer(standaardRegels, DATUM);
    // Alleenstaand: netto € 1.581,55 met loonheffingskorting, bruto € 1.662,16 plus € 104,78 vakantiegeld per maand.
    const alleen = brutoJaarMetAow(l, D("1581.55"), NUL, true, false);
    expect(alleen.minus(D("1662.16").plus("104.78").times(12)).abs().toNumber()).toBeLessThan(1);
    // Getrouwd of samenwonend, per persoon: netto € 1.084,13, bruto € 1.139,39 plus € 74,85.
    const samen = brutoJaarMetAow(l, D("1084.13"), NUL, false, false);
    expect(samen.minus(D("1139.39").plus("74.85").times(12)).abs().toNumber()).toBeLessThan(1);
    // Zonder loonheffingskorting (pensioen zonder korting komt hier niet voor): netto per jaar terug naar bruto.
    expect(nettoMetAow(l, D("1662.16").times(12), true, false).gt(D("1581.55").times(12).minus(1))).toBe(true);
  });
  it("toeslagen met AOW en pensioen: met een bedrag", () => {
    const u = checkRegelingen(invoer({ aanvrager: aow({ aow: 1450, pensioen: 300 }) }));
    for (const id of ["zorgtoeslag", "huurtoeslag"]) {
      expect(uitslag(u, id)!.kans, id).toBe("ja");
      expect(uitslag(u, id)!.bedrag, id).toBeDefined();
    }
  });
  it("toeslagen met AOW en ander inkomen of loon: geen bedrag, wel de proefberekening", () => {
    const u = checkRegelingen(invoer({ aanvrager: aow({ aow: 1200, loon: 400 }) }));
    expect(uitslag(u, "zorgtoeslag")!.kans).toBe("misschien");
    expect(uitslag(u, "zorgtoeslag")!.bedrag).toBeUndefined();
    expect(uitslag(u, "zorgtoeslag")!.waarom).toContain("AOW-leeftijd");
  });
  it("toeslagen met een AIO-aanvulling: dezelfde zorgtoeslag als met precies het sociaal minimum aan AOW", () => {
    const aio = uitslag(checkRegelingen(invoer({ bijstand: true, aanvrager: aow({}) })), "zorgtoeslag")!;
    expect(aio.kans).toBe("ja");
    expect(aio.bedrag).toBeDefined();
  });
  it("kostendelersnorm met AOW: de norm van art. 22 b als B (art. 22a lid 1)", () => {
    // Twee volwassenen (de aanvrager en één kostendeler): (40% + 2 × 30%) / 2 = 50% van € 2.176,10, zonder vakantiegeld.
    const u = uitslag(checkRegelingen(invoer({ aanvrager: aow({ aow: 1000 }), andereBewoners: true, andereBewonersAantal: 1, kostendelers: 1 })), "aio")!;
    expect(u.kans).toBe("ja");
    expect(u.waarom).toContain("ongeveer €\u00a01.034 netto per maand");
  });
  it("in een instelling met AOW: de grens is niet bekend, dus misschien", () => {
    expect(kans(invoer({ aanvrager: aow({ aow: 1000 }), wonen: "instelling" }), "volwassenenfonds")).toBe("misschien");
  });
});

describe("toeslag van UWV (Toeslagenwet)", () => {
  const uwv = (bedrag: number, over: Partial<CheckInvoer> = {}) => invoer({ aanvrager: { leeftijd: 45, inkomen: { uwv: bedrag } }, ...over });
  it("een uitkering van UWV onder het sociaal minimum: misschien, met het bedrag van UWV (€ 1.669 bruto, alleenstaand)", () => {
    const u = uitslag(checkRegelingen(uwv(1100)), "tw")!;
    expect(u.kans).toBe("misschien");
    expect(u.groep).toBe("uwv");
    expect(u.waarom).toContain("€ 1.669 bruto per maand");
    expect(u.bronnen).toContain(CITATEN.twWie);
  });
  it("boven het sociaal minimum: nee", () => {
    expect(kans(uwv(2000), "tw")).toBe("nee");
  });
  it("zonder uitkering van UWV: geen tegel", () => {
    expect(uitslag(checkRegelingen(invoer()), "tw")).toBeUndefined();
  });
  it("partner geboren na 1971 en geen kind jonger dan 12: nee", () => {
    const i = uwv(900, { partner: { leeftijd: 40, geborenNa1971: true, inkomen: {} } });
    expect(kans(i, "tw")).toBe("nee");
    const metKind = uwv(900, { partner: { leeftijd: 40, geborenNa1971: true, inkomen: {} }, kinderen: [{ leeftijd: 6 }], kinderbijslag: true });
    expect(kans(metKind, "tw")).toBe("misschien");
  });
  it("een stel: het sociaal minimum voor 2 personen (€ 2.337)", () => {
    const u = uitslag(checkRegelingen(uwv(900, { partner: { leeftijd: 58, geborenNa1971: false, inkomen: {} } })), "tw")!;
    expect(u.waarom).toContain("€ 2.337 bruto per maand voor u samen");
  });
});

describe("wat u nodig heeft voor de aanvraag", () => {
  const voorbeelden: CheckInvoer[] = [
    invoer({ aanvrager: { leeftijd: 35, inkomen: { loon: 900 } }, kinderen: [{ leeftijd: 3, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 10 } }, { leeftijd: 9 }], kinderbijslag: true }),
    invoer({ aanvrager: { leeftijd: 40, inkomen: {} }, vermogen: geld(500, { schulden: 2000 }) }),
    invoer({ aanvrager: { leeftijd: 22, inkomen: { studiefinanciering: 400 } }, studieMedisch: "ja", wonen: "kamer" }),
    invoer({ aanvrager: { leeftijd: 45, inkomen: { uwv: 1100 } }, partner: { leeftijd: 44, inkomen: {} } }),
    invoer({ bijstand: true }),
  ];
  const alle = voorbeelden.flatMap((i) => checkRegelingen(i));

  it("staat bij een deel van de regelingen, met de bron erbij", () => {
    const met = alle.filter((u) => u.meenemen);
    const ids = new Set(met.map((u) => u.id));
    for (const id of ["sleutelpas", "laptop", "ovpas", "iit", "alleenverdieners", "studietoeslag", "smi", "kwijtschelding", "bijstand", "zorgtoeslag", "kgb", "huurtoeslag", "kot"]) expect(ids.has(id), id).toBe(true);
    for (const u of met) expect(u.bronnen.some((b) => /aanvra|vraag ik|bewijsstukken|artikel 4\.3|laptop|voorbereiden/i.test(b.titel)), u.id).toBe(true);
  });

  it("niet bij waarschijnlijk niet, en niet bij de Sleutelpas die u met bijstand vanzelf krijgt", () => {
    for (const u of alle) if (u.kans === "nee") expect(u.meenemen, u.id).toBeUndefined();
    expect(uitslag(checkRegelingen(invoer({ bijstand: true })), "sleutelpas")!.meenemen).toBeUndefined();
  });

  it("korte zinnen in A2: geen puntkomma, een punt aan het eind", () => {
    for (const u of alle.filter((x) => x.meenemen))
      for (const zin of [u.meenemen!.kop, ...u.meenemen!.lijst]) {
        expect(zin, u.id).not.toContain(";");
        expect(/[.:]$/.test(zin), zin).toBe(true);
      }
  });
});

describe("bij elke uitslag staat waarom", () => {
  // Willekeurige huishoudens, zoals in scripts/vergelijk-regelingen.ts, maar minder.
  const voorbeelden: CheckInvoer[] = [
    invoer({ aanvrager: { leeftijd: 35, inkomen: { bedrijf: 900 } }, kinderen: [{ leeftijd: 6 }, { leeftijd: 13 }], kinderbijslag: true }),
    invoer({ aanvrager: { leeftijd: 40, inkomen: { bedrijf: 800 } }, partner: { leeftijd: 38, inkomen: { loon: 600 } } }),
    invoer({ aanvrager: { leeftijd: 19, inkomen: { loon: 600 } } }),
    invoer({ aanvrager: { leeftijd: 45, inkomen: { loon: 3500 } }, kinderen: [{ leeftijd: 8 }], kinderbijslag: true }),
    invoer({ aanvrager: { leeftijd: 30, inkomen: { loon: 900 } }, wonen: "instelling" }),
    invoer({ aanvrager: { leeftijd: 50, inkomen: { uwv: 1000 } }, wonen: "koop" }),
  ];
  const alle = voorbeelden.flatMap((i) => checkRegelingen(i));

  it("misschien en waarschijnlijk niet: er staat een reden, geen beschrijving van de regeling", () => {
    for (const u of alle.filter((x) => x.kans === "misschien" || x.kans === "nee")) {
      expect(u.waarom.length, u.id).toBeGreaterThan(20);
      if (u.wat) expect(u.waarom, u.id).not.toContain(u.wat);
    }
  });

  it("met een eigen bedrijf staat het bedrijf als reden bij elke Leidse regeling die daardoor misschien is", () => {
    const zzp = checkRegelingen(voorbeelden[0]);
    for (const id of ["sleutelpas", "kindtegoed", "laptop", "zwemles", "volwassenenfonds", "gemeentepolis", "ovpas"]) {
      const u = uitslag(zzp, id)!;
      expect(u.kans, id).toBe("misschien");
      expect(u.waarom, id).toContain("U heeft een eigen bedrijf.");
    }
  });

  it("'Uw inkomen is niet hoger dan de grens' bij misschien: er staat altijd een tweede reden", () => {
    for (const u of alle.filter((x) => x.kans === "misschien" && /Uw inkomen is niet hoger dan de grens/.test(x.waarom))) {
      const rest = u.waarom.replace(/Uw inkomen is niet hoger dan de grens\.( De grens voor uw huishouden is ongeveer € [\d.]+ netto per maand\. Vakantiegeld telt niet mee\.)?/, "").trim();
      expect(rest.length, `${u.id}: ${u.waarom}`).toBeGreaterThan(20);
    }
  });
});

describe("rekenfouten uit de review van 26 november 2026", () => {
  it("met bijstand en een kostendeler: het inkomen voor de toeslagen gaat uit van de kostendelersnorm (lager inkomen)", async () => {
    const { toetsingsinkomen } = await import("../src/regelingen/basis.js");
    const l = new Lezer(standaardRegels, DATUM);
    const i = invoer({ bijstand: true, aanvrager: { leeftijd: 40, inkomen: {} } });
    const zonder = toetsingsinkomen(l, i, [i.aanvrager], 0)!;
    const met = toetsingsinkomen(l, i, [i.aanvrager], 1)!;
    // Kostendelersnorm met A = 2: 50% van de gehuwdennorm, lager dan de norm voor een alleenstaande.
    expect(met.lt(zonder)).toBe(true);
    expect(met.gt(0)).toBe(true);
  });
  it("een ouder met alleen een kind van 20 is geen alleenstaande ouder: vermogensgrens € 8.000 en de inkomenstoeslag voor een alleenstaande", () => {
    const i = invoer({ aanvrager: { leeftijd: 50, inkomen: { loon: 900 } }, kinderen: [{ leeftijd: 20 }], vermogen: geld(12000) });
    expect(kans(i, "bijstand")).toBe("nee");
    const metJongKind = invoer({ aanvrager: { leeftijd: 50, inkomen: { loon: 900 } }, kinderen: [{ leeftijd: 12 }], kinderbijslag: true, vermogen: geld(12000) });
    expect(kans(metJongKind, "bijstand")).not.toBe("nee");
  });
});

describe("kinderopvangtoeslag met bijstand en werk (review 26 november 2026)", () => {
  const metOpvang = (werkt: boolean) =>
    invoer({
      bijstand: true,
      aanvrager: { leeftijd: 34, inkomen: werkt ? { loon: 0 } : {} },
      kinderen: [{ leeftijd: 3, opvang: { soort: "dagopvang", urenPerMaand: 86.67, uurprijs: 10 } }],
      kinderbijslag: true,
    });
  it("werkt naast de bijstand: kinderopvangtoeslag waarschijnlijk wel", () => {
    expect(kans(metOpvang(true), "kot")).toBe("ja");
  });
  it("werkt niet: waarschijnlijk niet, met de reden", () => {
    expect(kans(metOpvang(false), "kot")).toBe("nee");
  });
});
