/**
 * Representatieve huishoudens voor de snapshottests. Verzonnen situaties.
 * Wijzig deze lijst niet zonder reden: de snapshots zetten de uitkomsten
 * voor 2026 vast, zodat wijzigingen in de engine zichtbaar worden.
 */
import type { Invoer } from "../src/index.ts";

const basis = (over: Partial<Invoer>): Invoer => ({
  datum: "2026-09-01",
  gemeente: "leiden",
  leefvorm: "alleenstaande",
  leeftijd: 35,
  kinderen: [],
  kostendelers: 0,
  wonen: { soort: "huur", kaleHuurPerMaand: 650 },
  nieuwWerk: { brutoUurloon: 15, urenPerWeek: 24 },
  vrijlatingFase: "start",
  ...over,
});

export const huishoudens: Record<string, Invoer> = {
  "alleenstaande 24 uur, maand 1-6": basis({}),
  "alleenstaande 24 uur, na maand 6": basis({ vrijlatingFase: "later" }),
  "alleenstaande 24 uur, eerste helft 2026": basis({ datum: "2026-03-01" }),
  "alleenstaande 36 uur": basis({ nieuwWerk: { brutoUurloon: 16, urenPerWeek: 36 }, vrijlatingFase: "geen" }),
  "alleenstaande 25 jaar, 20 uur": basis({ leeftijd: 25, nieuwWerk: { brutoUurloon: 14.5, urenPerWeek: 20 } }),
  "alleenstaande ouder, kind 4 met opvang": basis({
    leefvorm: "alleenstaande_ouder",
    leeftijd: 34,
    kinderen: [{ leeftijd: 4, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 11 } }],
    wonen: { soort: "huur", kaleHuurPerMaand: 690, servicekostenPerMaand: 40 },
  }),
  "alleenstaande ouder, maand 7-36": basis({
    leefvorm: "alleenstaande_ouder",
    kinderen: [{ leeftijd: 7 }],
    nieuwWerk: { brutoMaandloon: 1400 },
    vrijlatingFase: "later",
  }),
  "paar met twee kinderen, partner werkt": basis({
    leefvorm: "paar",
    leeftijd: 41,
    partner: { leeftijd: 39, werk: { brutoMaandloon: 900 } },
    kinderen: [{ leeftijd: 13 }, { leeftijd: 8 }],
    wonen: { soort: "huur", kaleHuurPerMaand: 780 },
    nieuwWerk: { brutoMaandloon: 1600 },
  }),
  "kostendeler, geen huur": basis({ kostendelers: 1, wonen: { soort: "anders" } }),
  "uitzendkracht vierwekenloon": basis({ nieuwWerk: { brutoVierwekenloon: 1350 } }),
  "netto maandloon": basis({ nieuwWerk: { nettoMaandloon: 1100 } }),
  "werkt al, breidt uit": basis({
    huidigWerk: { brutoMaandloon: 600 },
    huidigeVrijlating: "geen",
    nieuwWerk: { brutoMaandloon: 1500, reiskostenPerMaand: 40 },
    vrijlatingFase: "geen",
  }),
};

export const samenvatting = (r: import("../src/index.ts").Resultaat) => ({
  huidig: Object.fromEntries(r.huidig.posten.map((p) => [p.id, p.perMaand])),
  werk: Object.fromEntries(r.werk.posten.map((p) => [p.id, p.perMaand])),
  verschil: r.verschilPerMaand,
  nietMeegenomen: r.nietMeegenomen.map((n) => n.id),
});

/**
 * Extra huishoudens voor de snapshots van de uitleg (rekenstappen, meldingen,
 * aannames): situaties die de lijst hierboven niet raakt.
 */
export const extraVoorUitleg: Record<string, Invoer> = {
  "paar met kostendeler en jonge huisgenoot, huur": basis({
    leefvorm: "paar",
    leeftijd: 45,
    partner: { leeftijd: 44 },
    kostendelers: 1,
    jongeHuisgenoten: 1,
    huisgenotenInkomenJaar: 18000,
    nieuwWerk: { brutoMaandloon: 1300, urenPerWeek: 20 },
  }),
  "woonvorm met begeleiding": basis({ wonen: { soort: "instelling" }, nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } }),
  "geen vaste woonplek, medische urenbeperking, na maand 6": basis({
    wonen: { soort: "geen_woonkosten", dakloos: true, betaaltWoonlasten: false },
    medischUrenbeperkt: true,
    nieuwWerk: { brutoMaandloon: 700, urenPerWeek: 12 },
    vrijlatingFase: "later",
  }),
  "kamer, ander inkomen, kosten met vergoeding": basis({
    wonen: { soort: "huur", zelfstandig: false },
    anderInkomenPerMaand: 100,
    nieuwWerk: { brutoUurloon: 15, urenPerWeek: 19, reiskostenPerMaand: 40, reiskostenvergoedingPerMaand: 40, overigeKostenPerMaand: 10 },
    vrijlatingFase: "later",
  }),
  "alleenstaande ouder werkt al met opvang, neemt er werk bij": basis({
    leefvorm: "alleenstaande_ouder",
    kinderen: [{ leeftijd: 3, opvang: { soort: "dagopvang", urenPerMaand: 100, uurprijs: 12, uurprijsGeschat: true } }, { leeftijd: 9, opvang: { soort: "bso", urenPerMaand: 40, uurprijs: 9 } }],
    huidigWerk: { brutoMaandloon: 600, urenPerWeek: 10 },
    huidigeVrijlating: "later",
    opvangNu: true,
    nieuwWerk: { brutoMaandloon: 1200, urenPerWeek: 16, bijbaan: { brutoMaandloon: 600, urenPerWeek: 10 } },
    vrijlatingFase: "later",
  }),
  "paar met opvang, partner werkt niet": basis({
    leefvorm: "paar",
    partner: { leeftijd: 38 },
    kinderen: [{ leeftijd: 2, opvang: { soort: "dagopvang", urenPerMaand: 80, uurprijs: 10 } }],
    nieuwWerk: { brutoMaandloon: 1500, urenPerWeek: 24 },
  }),
  "hoog loon per 4 weken, bijstand stopt": basis({ nieuwWerk: { brutoVierwekenloon: 2600, urenPerWeek: 36 } }),
  "all-in uurloon, 24 jaar": basis({ leeftijd: 24, nieuwWerk: { brutoUurloon: 16.5, urenPerWeek: 20, vakantiegeld: 0 } }),
  "2027, bijverdienregeling": basis({ datum: "2027-02-01", nieuwWerk: { brutoMaandloon: 900, urenPerWeek: 16 } }),
};

/** Alles wat de gebruiker als uitleg te zien krijgt: rekenstappen, meldingen en aannames. */
export const uitleg = (r: import("../src/index.ts").Resultaat) => ({
  stappen: Object.fromEntries(
    (["huidig", "werk"] as const).map((kant) => [kant, Object.fromEntries(r[kant].posten.map((p) => [p.id, p.stappen.map((s) => (s.bedrag === undefined ? s.tekst : `${s.tekst}: ${s.bedrag}`))]))]),
  ),
  meldingen: r.signalen.map((s) => `[${s.soort}${s.actie ? ", actie" : ""}] ${s.kop}: ${s.tekst}`),
  aannames: r.aannames,
  betrouwbaarheid: r.betrouwbaarheid,
  nietMeegenomen: r.nietMeegenomen,
});
