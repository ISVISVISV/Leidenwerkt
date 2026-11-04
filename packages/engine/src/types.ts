import type { GebruikteParameter, Status } from "./regels.ts";

export type Leefvorm = "alleenstaande" | "alleenstaande_ouder" | "paar";
export type Opvangsoort = "dagopvang" | "bso" | "gastouder";

export interface Kind {
  leeftijd: number;
  /** Kinderopvang die gebruikt wordt als de ouder(s) werken. */
  opvang?: { soort: Opvangsoort; urenPerMaand: number; uurprijs: number };
}

export interface Werk {
  /** Bruto maandloon exclusief vakantiegeld. Of geef uurloon + uren. */
  brutoMaandloon?: number;
  /** Bruto loon per 4 weken (13 keer per jaar), exclusief vakantiegeld. */
  brutoVierwekenloon?: number;
  brutoUurloon?: number;
  urenPerWeek?: number;
  /** Vakantiegeld als breuk, standaard 0,08. */
  vakantiegeld?: number;
  pensioenpremiePerMaand?: number;
  reiskostenPerMaand?: number;
  reiskostenvergoedingPerMaand?: number;
  overigeKostenPerMaand?: number;
}

export interface Invoer {
  /** Datum waarvoor gerekend wordt (JJJJ-MM-DD); bepaalt welke regels gelden. */
  datum: string;
  gemeente: "leiden";
  leefvorm: Leefvorm;
  leeftijd: number;
  partner?: { leeftijd: number; werk?: Werk };
  kinderen: Kind[];
  /** Aantal huisgenoten van 27 jaar of ouder (niet de partner, niet de eigen kinderen onder 27). */
  kostendelers: number;
  wonen: { soort: "huur"; kaleHuurPerMaand?: number; servicekostenPerMaand?: number } | { soort: "anders" };
  /** Huidige situatie: eventueel werk naast de bijstand. */
  huidigWerk?: Werk;
  /** Het werk dat de gebruiker overweegt. */
  nieuwWerk: Werk;
  /**
   * Welke vrijlating op het nieuwe werk van toepassing is:
   * - "start": eerste maanden (art. 31 lid 2 n Pw, of art. 34a vanaf 2027)
   * - "later": na afloop daarvan (alleenstaande ouder: onder r)
   * - "geen": geen vrijlating
   */
  vrijlatingFase: "start" | "later" | "geen";
  /** Vrijlating op het huidige werk naast de bijstand (standaard "geen"). */
  huidigeVrijlating?: "start" | "later" | "geen";
}

export type PostStatus = Status | "invoer";
export type Postsoort = "inkomen" | "toeslag" | "kosten";

export interface Stap {
  tekst: string;
  bedrag?: string;
}

export interface Post {
  id: string;
  label: string;
  soort: Postsoort;
  /** Bedrag per maand in euro's (2 decimalen) of null als het niet berekend kon worden. */
  perMaand: string | null;
  status: PostStatus;
  stappen: Stap[];
  parameters: GebruikteParameter[];
  aannames: string[];
  /** Reden waarom de post niet berekend is. */
  reden?: string;
}

export interface Situatie {
  naam: "huidig" | "werk";
  posten: Post[];
  /** Som van alle berekende posten in posten die in beide situaties berekend konden worden. */
  besteedbaarPerMaand: string;
}

export interface Signaal {
  soort: "waarschuwing" | "info";
  tekst: string;
}

export interface Resultaat {
  datum: string;
  huidig: Situatie;
  werk: Situatie;
  verschilPerMaand: string;
  verschilPerJaar: string;
  /** Posten die in minstens één situatie niet berekend konden worden en dus buiten het verschil vallen. */
  nietMeegenomen: { id: string; label: string; reden: string }[];
  /** Laagste zekerheid van alle gebruikte gegevens. */
  zekerheid: "geverifieerd" | "onbevestigd";
  signalen: Signaal[];
  aannames: string[];
}
