import type { Citaat } from "./citaten.ts";
import type { GebruikteParameter, Status } from "./regels.ts";

export type Leefvorm = "alleenstaande" | "alleenstaande_ouder" | "paar";
/**
 * Periode van de vrijlating op het nieuwe werk:
 * - "start": de eerste periode (tot en met 2026: art. 31 lid 2 n, eerste 6 maanden;
 *   vanaf 2027: art. 34a, eerste 12 maanden; bij overgangsrecht: de rest van de oude periode)
 * - "later": daarna (tot en met 2026 voor een alleenstaande ouder: onder r)
 * - "geen": geen vrijlating
 */
export type Fase = "start" | "later" | "geen";
/** Vrijlating die iemand op 31 december 2026 al had (overgangsrecht art. 78ff Pw). */
export type Overgang2027 = "n" | "r";
export type Opvangsoort = "dagopvang" | "bso" | "gastouder";

export interface Kind {
  leeftijd: number;
  /** Kinderopvang die gebruikt wordt als de ouder(s) werken. */
  opvang?: {
    soort: Opvangsoort;
    urenPerMaand: number;
    uurprijs: number;
    /** De gebruiker wist de prijs niet; uurprijs is dan het maximale uurtarief voor de toeslag. */
    uurprijsGeschat?: boolean;
  };
}

export interface Werk {
  /** Bruto maandloon exclusief vakantiegeld. Of geef uurloon + uren. */
  brutoMaandloon?: number;
  /** Bruto loon per 4 weken (13 keer per jaar), exclusief vakantiegeld. */
  brutoVierwekenloon?: number;
  brutoUurloon?: number;
  /**
   * Netto maandloon zoals op de bankrekening, zonder vakantiegeld.
   * De engine rekent dit terug naar een bruto maandloon.
   */
  nettoMaandloon?: number;
  urenPerWeek?: number;
  /** Factor waarmee het loon wordt vermenigvuldigd, bijvoorbeeld bij een ander aantal uren (urenschuif). */
  urenFactor?: number;
  /** Vakantiegeld als breuk, standaard 0,08. */
  /**
   * Vakantiegeld als breuk van het brutoloon. Leeg: het wettelijke minimum uit de
   * regeldata (wml.vakantiebijslag). 0 bij een all-in uurloon (vakantiegeld zit al in het loon).
   */
  vakantiegeld?: number;
  /** De gebruiker weet niet of het vakantiegeld al in het uurloon zit; er is gerekend met vakantiegeld erbij. */
  vakantiegeldOnzeker?: boolean;
  pensioenpremiePerMaand?: number;
  reiskostenPerMaand?: number;
  reiskostenvergoedingPerMaand?: number;
  overigeKostenPerMaand?: number;
  /**
   * Een tweede baan naast deze. Het loon telt op; belasting wordt berekend over
   * het totaal, zoals bij de aangifte. Kosten en vergoedingen staan bij de hoofdbaan.
   */
  bijbaan?: Werk;
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
  /**
   * Bruto jaarinkomen (toetsingsinkomen) van die huisgenoten samen. Telt mee
   * voor de huurtoeslag (rekeninkomen, art. 1 Wht). Zonder dit bedrag wordt de
   * huurtoeslag niet berekend als er huisgenoten zijn.
   */
  huisgenotenInkomenJaar?: number;
  /**
   * Ander netto inkomen van het huishouden per maand, zoals alimentatie of een andere
   * uitkering. Telt volledig mee voor de bijstand (art. 32 Pw), in beide situaties.
   */
  anderInkomenPerMaand?: number;
  /** Wie al werkt: de kinderen gaan nu ook al naar de opvang (zelfde uren). Dan telt de opvang ook bij "Nu". */
  opvangNu?: boolean;
  /**
   * Aantal huisgenoten van 18 tot 27 jaar die geen kind van de gebruiker zijn.
   * Zij tellen niet mee voor de kostendelersnorm, wel voor de huurtoeslag.
   */
  jongeHuisgenoten?: number;
  /** Servicekosten tellen sinds 2026 niet meer mee voor de huurtoeslag; het veld wordt genegeerd. */
  wonen:
    | {
        soort: "huur";
        kaleHuurPerMaand?: number;
        servicekostenPerMaand?: number;
        /** Eigen toegangsdeur, keuken, wc en douche of bad. Standaard true. Zonder: geen huurtoeslag. */
        zelfstandig?: boolean;
      }
    /** Koopwoning, of woonsituatie onbekend: geen huurtoeslag, de gewone norm. */
    | { soort: "anders" }
    /**
     * De gebruiker betaalt zelf geen woonkosten: geen vaste woonplek, of iemand
     * anders betaalt de woonkosten. Leiden verlaagt dan de norm (art. 27 Pw,
     * beleidsregels CVDR760406 art. 3.1).
     */
    | { soort: "geen_woonkosten"; dakloos?: boolean; betaaltWoonlasten: boolean }
    /**
     * Verblijf in een inrichting (art. 1 onder f Pw), bijvoorbeeld een woonvorm met
     * begeleiding: de norm van art. 23, geen kostendelersnorm, geen huurtoeslag.
     */
    | { soort: "instelling" };
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
  vrijlatingFase: Fase;
  /** Vrijlating op het huidige werk naast de bijstand (standaard "geen"). */
  huidigeVrijlating?: Fase;
  /** Vanaf 2027: welke vrijlating de gebruiker op 31 december 2026 al had. */
  overgang2027?: Overgang2027;
  /** Medische urenbeperking vastgesteld (art. 31 lid 2 y, vanaf 2027 art. 34a lid 1 b). */
  medischUrenbeperkt?: boolean;
}

export type PostStatus = Status | "invoer";
export type Postsoort = "inkomen" | "toeslag" | "kosten";

/**
 * Of een post het verschil tussen nu en met werk beïnvloedt.
 * - "ja": hangt af van het inkomen of bestaat alleen met werk
 * - "nee": is in beide situaties gelijk (bijvoorbeeld kinderbijslag)
 * - "onbekend": niet te zeggen
 */
export type Invloed = "ja" | "nee" | "onbekend";
/** Richting van de post als het inkomen uit werk stijgt. */
export type Richting = "daalt" | "stijgt" | "wisselt";

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
  invloed: Invloed;
  /** Wat er met de post gebeurt als het inkomen uit werk stijgt (alleen bij invloed "ja"). */
  richting?: Richting;
}

export interface Situatie {
  naam: "huidig" | "werk";
  posten: Post[];
  /** Som van alle berekende posten in posten die in beide situaties berekend konden worden. */
  besteedbaarPerMaand: string;
}

export interface Signaal {
  soort: "waarschuwing" | "info";
  /** Korte kop waaraan de melding te herkennen is. */
  kop: string;
  /** De gebruiker moet zelf iets doen (doorgeven, aanvragen). */
  actie?: boolean;
  tekst: string;
  /** Letterlijke brontekst bij de melding. */
  bron?: Citaat;
}

export interface Resultaat {
  datum: string;
  huidig: Situatie;
  werk: Situatie;
  verschilPerMaand: string;
  verschilPerJaar: string;
  /** Posten die in minstens één situatie niet berekend konden worden en dus buiten het verschil vallen. */
  nietMeegenomen: { id: string; label: string; reden: string; invloed: Invloed; richting?: Richting }[];
  /** Laagste zekerheid van alle gebruikte gegevens. */
  zekerheid: "geverifieerd" | "onbevestigd";
  /** Hoe betrouwbaar het kopgetal is en welke kant een fout waarschijnlijk op gaat. */
  betrouwbaarheid: Betrouwbaarheid;
  /** Regime voor de verrekening van inkomsten op de rekendatum. */
  regime: { id: string; naam: string; grondslag: string };
  /** Toeslagen die met werk lager worden: wat u terug moet betalen als u niets doorgeeft. */
  terugbetaalrisico: TerugbetaalRisico[];
  signalen: Signaal[];
  aannames: string[];
}

export interface Betrouwbaarheid {
  niveau: "goed" | "redelijk" | "beperkt";
  /** Waarschijnlijke richting van de fout in het kopgetal. */
  richting: "te_gunstig" | "te_ongunstig" | "onbekend" | "geen";
  tekst: string;
}

export interface TerugbetaalRisico {
  id: string;
  label: string;
  nuPerMaand: string;
  straksPerMaand: string;
  minderPerMaand: string;
  /** Wat u na een heel jaar werk ongeveer terugbetaalt als u niets doorgeeft. */
  perJaar: string;
}
