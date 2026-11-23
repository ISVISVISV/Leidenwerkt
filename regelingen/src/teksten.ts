/**
 * De vragen en antwoorden van het formulier op één plek. Het formulier (App.tsx) en de lijst
 * "Wat u heeft ingevuld" op de afdruk (Overzicht.tsx) gebruiken dezelfde tekst.
 */
import type { Inkomenssoort, Opvangsoort, Uitkeringssoort, Woonsoort } from "@leidenwerkt/engine";
import type { Bedragsoort, Bezit } from "./formulier.ts";

export const JA_NEE: ["ja" | "nee", string][] = [
  ["nee", "Nee"],
  ["ja", "Ja"],
];

export const LANG_LAAG: ["nee" | "ja" | "onbekend", string][] = [
  ["nee", "Nee"],
  ["ja", "Ja"],
  ["onbekend", "Weet ik niet"],
];

export const OPVANGSOORTEN: [Opvangsoort, string][] = [
  ["dagopvang", "Kinderdagverblijf"],
  ["bso", "Buitenschoolse opvang"],
  ["gastouder", "Gastouder"],
];

export const SOORTEN: [Inkomenssoort, string][] = [
  ["loon", "Loon uit werk"],
  ["uwv", "Een uitkering van UWV"],
  ["aow", "AOW van de SVB"],
  ["pensioen", "Pensioen"],
  ["bedrijf", "Inkomen uit een eigen bedrijf"],
  ["studiefinanciering", "Studiefinanciering"],
  ["partneralimentatie", "Partneralimentatie"],
  ["kinderalimentatie", "Kinderalimentatie"],
  ["ander", "Ander inkomen, zoals pensioen"],
  ["geen", "Geen inkomen"],
];

export const UITKERINGEN: [Uitkeringssoort, string][] = [
  ["ww", "WW"],
  ["wajong", "Wajong"],
  ["wia", "WIA of WAO"],
  ["ziektewet", "Ziektewet"],
  ["anders", "Een andere uitkering"],
];

/** De vraag naar het bedrag per soort inkomen. Netto-uitleg alleen bij bedragen waar belasting af gaat. */
export const BEDRAGVRAAG: Record<Bedragsoort, { u: string; partner: string; netto: boolean }> = {
  loon: { u: "Hoeveel loon krijgt u netto per maand?", partner: "Hoeveel loon krijgt uw partner netto per maand?", netto: true },
  uwv: { u: "Hoeveel uitkering krijgt u netto per maand?", partner: "Hoeveel uitkering krijgt uw partner netto per maand?", netto: true },
  aow: { u: "Hoeveel AOW krijgt u netto per maand?", partner: "Hoeveel AOW krijgt uw partner netto per maand?", netto: true },
  pensioen: { u: "Hoeveel pensioen krijgt u netto per maand?", partner: "Hoeveel pensioen krijgt uw partner netto per maand?", netto: true },
  bedrijf: { u: "Hoeveel verdient u netto per maand met uw eigen bedrijf?", partner: "Hoeveel verdient uw partner netto per maand met het eigen bedrijf?", netto: true },
  studiefinanciering: { u: "Hoeveel studiefinanciering krijgt u per maand?", partner: "Hoeveel studiefinanciering krijgt uw partner per maand?", netto: false },
  partneralimentatie: { u: "Hoeveel partneralimentatie krijgt u per maand?", partner: "Hoeveel partneralimentatie krijgt uw partner per maand?", netto: false },
  kinderalimentatie: { u: "Hoeveel kinderalimentatie krijgt u per maand?", partner: "Hoeveel kinderalimentatie krijgt uw partner per maand?", netto: false },
  ander: { u: "Hoeveel ander inkomen krijgt u netto per maand?", partner: "Hoeveel ander inkomen krijgt uw partner netto per maand?", netto: true },
};

export const woonOpties = (paar: boolean): [Woonsoort, string][] => [
  ["huur", "In een huurwoning met een eigen voordeur, keuken, wc en douche"],
  ["kamer", "Op een kamer, of in een woning waar ik de keuken, wc of douche deel"],
  ["koop", "In een koopwoning"],
  ["kostgeld", `Bij iemand anders in huis${paar ? " (niet bij uw partner)" : ""}, en ik betaal kostgeld of huur`],
  ["inwonend", `Bij iemand anders in huis${paar ? " (niet bij uw partner)" : ""}, en ik betaal niets voor mijn woonruimte`],
  ["dakloos", "Ik heb geen vaste woonplek"],
  ["instelling", "In een instelling of woonvorm waar ik zorg of begeleiding krijg"],
];

export const BEZIT: [Bezit, string][] = [
  ["betaal", "Geld op een betaalrekening"],
  ["spaar", "Geld op een spaarrekening"],
  ["voertuig", "Een auto, motor of scooter"],
  ["beleggingen", "Contant geld, aandelen of andere beleggingen"],
  ["spullen", "Spullen die veel geld waard zijn, zoals sieraden of een boot"],
  ["schuld", "Schulden"],
  ["niets", "Niets van dit"],
];

export const VRAAG = {
  geboren: "Uw geboortedatum",
  partner: "Woont u samen met een partner?",
  partnerGeboren: "Geboortedatum van uw partner",
  heeftKinderen: "Heeft u kinderen die bij u wonen?",
  kind: (i: number, aantal: number) => (aantal > 1 ? `Geboortedatum van kind ${i + 1}` : "Geboortedatum van uw kind"),
  kinderbijslag: "Krijgt u kinderbijslag voor uw kinderen jonger dan 18 jaar?",
  woont: "Waar woont u?",
  kaleHuur: "Kale huur per maand",
  andereBewoners: "Woont er nog iemand anders bij u?",
  andereAantal: "Hoeveel mensen zijn dat?",
  andereOuder: "Hoeveel van hen zijn 27 jaar of ouder?",
  andereInkomen: "Hoeveel bruto inkomen hebben deze mensen samen per jaar?",
  opvang: "Gaat dit kind naar de opvang?",
  soortOpvang: "Soort opvang",
  uren: "Hoeveel uur per week gaat dit kind naar de opvang?",
  prijs: "Prijs per uur",
  inkomenKind: (welke: string) => `Hoeveel bruto inkomen heeft ${welke} per jaar?`,
  bijstand: (paar: boolean, aow = false) =>
    aow
      ? paar
        ? "Krijgt u samen een AIO-aanvulling van de SVB?"
        : "Krijgt u een AIO-aanvulling van de SVB?"
      : paar
        ? "Krijgt u samen bijstand van de gemeente?"
        : "Krijgt u bijstand van de gemeente?",
  soorten: (partner: boolean) => (partner ? "Wat voor inkomen heeft uw partner?" : "Wat voor inkomen heeft u?"),
  uitkering: (partner: boolean) => (partner ? "Welke uitkering krijgt uw partner?" : "Welke uitkering krijgt u?"),
  studieMedisch: "Kunt u door ziekte of een handicap niet werken naast uw studie?",
  langLaag: "Heeft u al 5 jaar of langer een laag inkomen?",
  bezit: (paar: boolean) => (paar ? "Wat hebben u en uw partner samen?" : "Wat heeft u?"),
  betaal: (paar: boolean) => (paar ? "Hoeveel geld staat er op de betaalrekening van u en uw partner samen?" : "Hoeveel geld staat er op uw betaalrekening?"),
  spaar: (paar: boolean) => (paar ? "Hoeveel geld staat er op de spaarrekening van u en uw partner samen?" : "Hoeveel geld staat er op uw spaarrekening?"),
  voertuig: (i: number, aantal: number) => (aantal > 1 ? `Hoeveel is auto, motor of scooter ${i + 1} nu waard?` : "Hoeveel is uw auto, motor of scooter nu waard?"),
  beleggingen: (paar: boolean) => (paar ? "Hoeveel contant geld en beleggingen hebben u en uw partner samen?" : "Hoeveel contant geld en beleggingen heeft u?"),
  spullen: "Hoeveel zijn deze spullen samen waard?",
  schulden: (paar: boolean) => (paar ? "Hoeveel schulden hebben u en uw partner samen?" : "Hoeveel schulden heeft u?"),
};
