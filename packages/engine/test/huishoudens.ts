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
