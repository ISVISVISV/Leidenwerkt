/** De invoer en de uitslag van Leidengeldwijzer. */
import type { Citaat } from "../citaten.ts";
import type { Kind } from "../types.ts";

/** Soort inkomen. "geen" sluit de andere uit. */
export type Inkomenssoort = "loon" | "uwv" | "aow" | "pensioen" | "bedrijf" | "studiefinanciering" | "partneralimentatie" | "kinderalimentatie" | "ander" | "geen";
export type Uitkeringssoort = "ww" | "wajong" | "wia" | "ziektewet" | "anders";

export interface CheckPersoon {
  leeftijd: number;
  /** Heeft deze persoon op de rekendatum de AOW-leeftijd? Zie heeftAowLeeftijd. */
  aow?: boolean;
  /** Geboren vóór 1 januari 1946: dan is de eerste belastingschijf langer. */
  geborenVoor1946?: boolean;
  /** Geboren na 31 december 1971: dan krijgt de partner geen toeslag van UWV, tenzij er een kind jonger dan 12 is. */
  geborenNa1971?: boolean;
  /**
   * Inkomen per soort, per maand, zonder vakantiegeld. Loon, uitkering, bedrijf en ander inkomen: netto.
   * Alimentatie en studiefinanciering: het bedrag dat binnenkomt. Leeg bij bijstand of geen inkomen.
   */
  inkomen: Partial<Record<Exclude<Inkomenssoort, "geen">, number>>;
  /** Welke uitkering van UWV, als er een is. */
  uitkering?: Uitkeringssoort;
}

export type Woonsoort = "huur" | "kamer" | "koop" | "kostgeld" | "inwonend" | "dakloos" | "instelling";
export type JaNeeOnbekend = "ja" | "nee" | "onbekend";

export interface CheckInvoer {
  /** Rekendatum, JJJJ-MM-DD. */
  datum: string;
  aanvrager: CheckPersoon;
  partner?: CheckPersoon;
  /**
   * Kinderen die bij de aanvrager wonen. Voor de huurtoeslag: het bruto inkomen per jaar van een kind van 18 of ouder
   * (inkomenJaar, leeg als het onbekend is). Voor de kinderopvangtoeslag: de opvang van een kind jonger dan 13.
   */
  kinderen: Pick<Kind, "leeftijd" | "leeftijdBeginJaar" | "inkomenJaar" | "opvang">[];
  /** Krijgt de aanvrager kinderbijslag voor de kinderen? Alleen nodig als er kinderen jonger dan 18 zijn. */
  kinderbijslag?: boolean;
  /** Bijstand van de gemeente (voor het huishouden). */
  bijstand: boolean;
  /** 5 jaar of langer een inkomen tot de bijstandsnorm. Alleen nodig vanaf 23 jaar. */
  langLaagInkomen?: JaNeeOnbekend;
  /** Studiefinanciering, en door ziekte of handicap niet kunnen werken naast de studie. */
  studieMedisch?: "ja" | "nee";
  wonen: Woonsoort;
  kaleHuurPerMaand?: number;
  /** Andere mensen in huis, naast partner en kinderen. */
  andereBewoners: boolean;
  /** Hoeveel andere mensen er in huis wonen. Voor de huurtoeslag. */
  andereBewonersAantal?: number;
  /** Hun bruto inkomen per jaar, samen. Voor de huurtoeslag. Leeg: onbekend. */
  andereBewonersInkomenJaar?: number;
  /**
   * Hoeveel van de andere bewoners 27 jaar of ouder zijn en meetellen als kostendeler (art. 22a Pw).
   * Eigen kinderen van 27 jaar of ouder telt de rekenkern zelf mee.
   */
  kostendelers?: number;
  /** Geld en bezit, per onderdeel. De eigen woning zit er niet in. */
  vermogen: Vermogen;
}

/** Geld en bezit van het huishouden, in euro's. Leidengeldwijzer telt per regeling wat meetelt. */
export interface Vermogen {
  betaalrekening: number;
  spaarrekening: number;
  /** Waarde van elke auto, motor of scooter. */
  voertuigen: number[];
  /** Contant geld, aandelen of andere beleggingen. */
  beleggingen: number;
  /** Spullen die veel geld waard zijn, zoals sieraden of een boot. */
  spullen: number;
  schulden: number;
}

/** "info": goed om te weten, voor iedereen (hulp en voorzieningen zonder rekensom). */
export type Kans = "ja" | "misschien" | "nee" | "info";
/** Wie de regeling geeft: de gemeente Leiden, Dienst Toeslagen, de Sociale Verzekeringsbank, de bijstand, of hulp voor iedereen. */
export type Groep = "gemeente" | "toeslagen" | "svb" | "uwv" | "inkomen" | "hulp";

export interface Uitslag {
  id: string;
  naam: string;
  groep: Groep;
  kans: Kans;
  /** Wat het oplevert, bijvoorbeeld "€ 1.100 per jaar". */
  bedrag?: string;
  /** Eén tot drie korte zinnen: waarom deze uitslag. */
  waarom: string;
  /** Hoe en waar aanvragen. */
  aanvragen?: { tekst: string; url: string };
  bronnen: Citaat[];
  /** Wat u nodig heeft voor de aanvraag: een korte zin en een lijst. De bron staat in bronnen. Zie meenemen.ts. */
  meenemen?: { kop: string; lijst: string[] };
}
