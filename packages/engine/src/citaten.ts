/**
 * Letterlijke wetteksten voor de bronvermelding in de app (de pop-up bij een
 * bron). Alleen tekst die letterlijk is overgenomen van de officiële bron, met
 * de datum van de versie. De app werkt zonder internet, dus de tekst staat hier.
 */
export interface Citaat {
  /** Korte naam, bijvoorbeeld "Participatiewet, art. 31 lid 2 onder n". */
  titel: string;
  url: string;
  /** Versie of datum waarop de tekst is overgenomen. */
  versie: string;
  tekst: string;
}

const PW_2026 = "https://wetten.overheid.nl/BWBR0015703/2026-07-01";
const PW_2027 = "https://wetten.overheid.nl/BWBR0015703/2027-01-01";

export const CITATEN = {
  pw31n: {
    titel: "Participatiewet, art. 31 lid 2 onder n",
    url: `${PW_2026}#Hoofdstuk3_Paragraaf3.4_Artikel31_Lid2`,
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "inkomsten uit arbeid tot 25 procent van deze inkomsten, met een maximum van € 285,00 [Red: per 1 juli 2026: € 289,00] per maand, voor zover hij algemene bijstand ontvangt, waarbij voor een persoon die de pensioengerechtigde leeftijd nog niet heeft bereikt geldt dat die inkomsten gedurende ten hoogste zes maanden niet tot de middelen worden gerekend en dat dit naar het oordeel van het college moet bijdragen aan zijn arbeidsinschakeling;",
  },
  pw31r: {
    titel: "Participatiewet, art. 31 lid 2 onder r",
    url: `${PW_2026}#Hoofdstuk3_Paragraaf3.4_Artikel31_Lid2`,
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "inkomsten uit arbeid van een alleenstaande ouder tot 12,5 procent van deze inkomsten, met een maximum van € 177,66 [Red: per 1 juli 2026: € 180,17] per maand, gedurende een aaneengesloten periode van maximaal 30 maanden, voor zover hij algemene bijstand ontvangt en onderdeel y, z of aa niet van toepassing is, ingeval: 1°. hij de volledige zorg heeft voor een tot zijn last komend kind tot 12 jaar, 2°. de periode van zes maanden, bedoeld in onderdeel n, is verstreken, en 3°. dit volgens het college bijdraagt aan zijn arbeidsinschakeling;",
  },
  pw31y: {
    titel: "Participatiewet, art. 31 lid 2 onder y",
    url: `${PW_2026}#Hoofdstuk3_Paragraaf3.4_Artikel31_Lid2`,
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "inkomsten uit arbeid van een persoon die medisch urenbeperkt is tot 15 procent van deze inkomsten uit arbeid, met een maximum van € 180,19 [Red: per 1 juli 2026: € 182,73] per maand, voor zover hij algemene bijstand ontvangt, tenzij onderdeel n van toepassing is;",
  },
  pw31lid5: {
    titel: "Participatiewet, art. 31 lid 5",
    url: `${PW_2026}#Hoofdstuk3_Paragraaf3.4_Artikel31_Lid5`,
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "Het tweede lid, onderdelen c, j, k, n en r, zijn niet van toepassing op de persoon die jonger is dan 27 jaar, met dien verstande dat onderdeel j wel van toepassing is als het gaat om een persoon jonger dan 27 jaar die behoort tot de doelgroep loonkostensubsidie.",
  },
  pw34a: {
    titel: "Participatiewet, art. 34a lid 1 en 2",
    url: `${PW_2027}#Hoofdstuk3_Paragraaf3.4_Artikel34a`,
    versie: "geldend vanaf 1 januari 2027",
    tekst:
      "1. Inkomsten uit arbeid worden niet met de algemene bijstand verrekend ten aanzien van degene die: a. de pensioengerechtigde leeftijd nog niet heeft bereikt: gedurende een aaneengesloten periode van maximaal twaalf maanden voor 15 procent van deze inkomsten per maand, indien dit naar het oordeel van het college bijdraagt aan de arbeidsinschakeling van deze persoon; b. medisch urenbeperkt is: voor 15 procent van deze inkomsten per maand; […] 2. Nadat de periode, bedoeld in het eerste lid, onderdeel a, is verstreken kan het college de periode waarin de inkomsten uit arbeid niet worden verrekend verlengen met een door het college te bepalen periode, indien het college een uitbreiding van de arbeidsomvang gelet op de individuele omstandigheden niet mogelijk acht.",
  },
  leidenWoonkosten: {
    titel: "Beleidsregels Vermogen en Algemene Bijstandsnorm bij lage woonkosten of verblijf in inrichting 2026 (Leiden), art. 3.1 lid 2",
    url: "https://lokaleregelgeving.overheid.nl/CVDR760406",
    versie: "geldend vanaf 14 april 2026",
    tekst:
      "De verlaging in verband met de woonsituatie, als bedoeld in artikel 27 van de wet, bedraagt: a. als de belanghebbende (zelf) geen woonkosten betaalt: 10% van de gehuwden norm. b. als de woonkosten van de belanghebbende (zelf) minder dan 10% van de gehuwden norm zijn: het verschil tussen de daadwerkelijke woonkosten en 10% van de gehuwden norm. c. als belanghebbende (zelf) geen woonlasten betaalt: 9 % van de gehuwdennorm. d. als belanghebbende (zelf) geen woonkosten betaalt en geen woonlasten heeft; 19 % van de gehuwdennorm.",
  },
} satisfies Record<string, Citaat>;

export type CitaatId = keyof typeof CITATEN;

/** Welke wettekst hoort bij een parameter (op begin van de id). */
const PER_PARAMETER: [string, CitaatId][] = [
  ["pw.vrijlating_n.", "pw31n"],
  ["pw.vrijlating_r.", "pw31r"],
  ["pw.vrijlating_y.", "pw31y"],
  ["pw.vrijlating.minimumleeftijd", "pw31lid5"],
  ["pw.bijverdien.", "pw34a"],
  ["leiden.woonkosten.", "leidenWoonkosten"],
];

export function citaatVoorParameter(id: string): Citaat | undefined {
  const hit = PER_PARAMETER.find(([prefix]) => id.startsWith(prefix));
  return hit ? CITATEN[hit[1]] : undefined;
}
