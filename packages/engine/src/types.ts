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
  /** Leeftijd op 1 januari van het rekenjaar; bepaalt de vrijstelling voor de huurtoeslag (jonger dan 23). */
  leeftijdBeginJaar?: number;
  /**
   * Toetsingsinkomen (ongeveer bruto) per jaar van een kind van 18 of ouder. Telt mee voor de huurtoeslag;
   * de rekenhulp trekt de vrijstelling zelf af. Ontbreekt het, dan telt het niet mee en zegt de rekenhulp dat.
   */
  inkomenJaar?: number;
  /** De gebruiker weet het inkomen van dit kind niet. */
  inkomenOnbekend?: boolean;
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
  /** Bruto loon per week (52 keer per jaar), exclusief vakantiegeld. */
  brutoWeekloon?: number;
  brutoUurloon?: number;
  /**
   * Netto maandloon zoals op de bankrekening, zonder vakantiegeld.
   * De engine rekent dit terug naar een bruto maandloon.
   */
  nettoMaandloon?: number;
  /** Netto loon per 4 weken, zonder vakantiegeld; de engine rekent het om naar een maand (× 13 / 12). */
  nettoVierwekenloon?: number;
  /** Netto loon per week, zonder vakantiegeld; de engine rekent het om naar een maand (× 52 / 12). */
  nettoWeekloon?: number;
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
   * voor de huurtoeslag (rekeninkomen, art. 1 Wht). Zonder dit bedrag rekent de
   * huurtoeslag zonder hun inkomen, met een aanname.
   */
  huisgenotenInkomenJaar?: number;
  /**
   * Ander netto inkomen van het huishouden per maand, zoals alimentatie of een andere
   * uitkering. Telt volledig mee voor de bijstand (art. 32 Pw), in beide situaties.
   */
  anderInkomenPerMaand?: number;
  /**
   * Partneralimentatie per maand, zoals ontvangen (vóór belasting). De bijstand telt het bedrag
   * na aftrek van de inkomstenbelasting (art. 31 lid 3 Pw); voor de toeslagen telt het mee.
   */
  partneralimentatiePerMaand?: number;
  /**
   * Kinderalimentatie per maand. Telt mee voor de bijstand (art. 32 Pw), niet voor de toeslagen
   * (Belastingdienst: alimentatie voor uw kinderen hoort niet bij het toetsingsinkomen).
   */
  kinderalimentatiePerMaand?: number;
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
  /** Reden waarom de post niet berekend is, in gewone taal. */
  reden?: string;
  /** Welke parameter ontbrak, voor onderhoud; niet voor de gebruiker. */
  ontbrekendeParameter?: string;
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
