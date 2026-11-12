/**
 * Letterlijke teksten uit officiële bronnen, voor de pop-up bij een bron in de app.
 *
 * Teksten met bedragen of percentages die per periode veranderen, staan in de
 * regeldata (veld `citaat` bij een parameter, zie regels/schema.ts), zodat ze met
 * een nieuw jaar meekomen. Hier staan alleen teksten zonder zulke bedragen.
 * De app werkt zonder internet, dus de tekst moet in de app zelf staan.
 */
import type { GebruikteParameter, Bron, BronCitaat } from "./regels.ts";

export interface Citaat {
  /** Korte naam, bijvoorbeeld "Participatiewet, art. 31 lid 2 onder n". */
  titel: string;
  url: string;
  /** Versie of datum van de tekst. */
  versie: string;
  tekst: string;
}

export const CITATEN = {
  pw17: {
    titel: "Participatiewet, art. 17 lid 1",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01#Hoofdstuk2_Paragraaf2.3_Artikel17",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "De belanghebbende doet aan het college op verzoek of onverwijld uit eigen beweging mededeling van alle feiten en omstandigheden waarvan hem redelijkerwijs duidelijk moet zijn dat zij van invloed kunnen zijn op zijn arbeidsinschakeling of het recht op bijstand.",
  },
  pw3: {
    titel: "Participatiewet, art. 3 lid 2 en 3",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01#Hoofdstuk1_Paragraaf1.1_Artikel3",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "2. In deze wet en de daarop berustende bepalingen wordt: a. als gehuwd of als echtgenoot mede aangemerkt de ongehuwde die met een ander een gezamenlijke huishouding voert, tenzij het betreft een aanverwant in de eerste graad of een bloedverwant in de eerste graad of indien er sprake is van een zorgbehoefte van of verleend door een bijstandsgerechtigde die de aanleiding vormt om samen te wonen, ongeacht of er sprake is van bloedverwantschap, gedurende de periode dat die zorg wordt verleend; […] 3. Van een gezamenlijke huishouding is sprake indien twee personen hun hoofdverblijf in dezelfde woning hebben en zij blijk geven zorg te dragen voor elkaar door middel van het leveren van een bijdrage in de kosten van de huishouding dan wel anderszins.",
  },
  pw32: {
    titel: "Participatiewet, art. 32 lid 1",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "Onder inkomen wordt verstaan de op grond van artikel 31 in aanmerking genomen middelen voorzover deze: a. betreffen inkomsten uit of in verband met arbeid, inkomsten uit vermogen, een premie als bedoeld in artikel 31, tweede lid, onderdeel j, een kostenvergoeding als bedoeld in artikel 31, tweede lid, onderdeel k, inkomsten uit verhuur, onderverhuur of het hebben van een of meer kostgangers, socialezekerheidsuitkeringen, uitkeringen tot levensonderhoud op grond van Boek 1 van het Burgerlijk Wetboek, voorlopige teruggave of teruggave van inkomstenbelasting, loonbelasting, premies volksverzekeringen en inkomensafhankelijke bijdragen als bedoeld in artikel 43 van de Zorgverzekeringswet, dan wel naar hun aard met deze inkomsten en uitkeringen overeenkomen; en b. betrekking hebben op een periode waarover beroep op bijstand wordt gedaan.",
  },
  pw34a: {
    titel: "Participatiewet, art. 34a lid 1 en 2",
    url: "https://wetten.overheid.nl/BWBR0015703/2027-01-01#Hoofdstuk3_Paragraaf3.4_Artikel34a",
    versie: "geldend vanaf 1 januari 2027",
    tekst:
      "1. Inkomsten uit arbeid worden niet met de algemene bijstand verrekend ten aanzien van degene die: a. de pensioengerechtigde leeftijd nog niet heeft bereikt: gedurende een aaneengesloten periode van maximaal twaalf maanden voor 15 procent van deze inkomsten per maand, indien dit naar het oordeel van het college bijdraagt aan de arbeidsinschakeling van deze persoon; b. medisch urenbeperkt is: voor 15 procent van deze inkomsten per maand; […] 2. Nadat de periode, bedoeld in het eerste lid, onderdeel a, is verstreken kan het college de periode waarin de inkomsten uit arbeid niet worden verrekend verlengen met een door het college te bepalen periode, indien het college een uitbreiding van de arbeidsomvang gelet op de individuele omstandigheden niet mogelijk acht.",
  },
  pw23inrichting: {
    titel: "Participatiewet, art. 1 onder f (inrichting)",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "inrichting: 1°. een instelling die zich blijkens haar doelstelling en feitelijke werkzaamheden richt op het bieden van verpleging of verzorging aan aldaar verblijvende hulpbehoevenden; 2°. een instelling die zich blijkens haar doelstelling en feitelijke werkzaamheden richt op het bieden van slaapgelegenheid, waarbij de mogelijkheid van hulpverlening of begeleiding gedurende meer dan de helft van ieder etmaal aanwezig is;",
  },
  alimentatie: {
    titel: "Rijksoverheid, Welke inkomsten worden van mijn bijstand afgetrokken?",
    url: "https://www.rijksoverheid.nl/onderwerpen/bijstand/vraag-en-antwoord/welke-inkomsten-bijstand-afgetrokken",
    versie: "geraadpleegd op 11 november 2026",
    tekst:
      "Heeft u bijstand en krijgt u partneralimentatie en/of kinderalimentatie? Dan geldt deze alimentatie als inkomen. De gemeente houdt hiermee dan rekening bij het vaststellen van uw bijstandsuitkering.",
  },
  kostendelerUitzonderingen: {
    titel: "Rijksoverheid, Wat is de kostendelersnorm in de bijstand?",
    url: "https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/bijstand/wat-is-de-kostendelersnorm-in-de-bijstand",
    versie: "geraadpleegd op 12 november 2026",
    tekst:
      "Niet alle huisgenoten tellen mee voor de kostendelersnorm. […] de commerciële huurder/onderhuurder/kostganger of de verhuurder/onderverhuurder/kostgever die in dezelfde woning woont; kamerhuurders met een commercieel contract (en die een commerciële huurprijs betalen); studenten die een opleiding volgen die recht kan geven op studiefinanciering of tegemoetkoming studiekosten;",
  },
  kotAanvragen: {
    titel: "Belastingdienst, Hoe vraag ik kinderopvangtoeslag aan?",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/hoe-moet-ik-kinderopvangtoeslag-aanvragen",
    versie: "geraadpleegd op 12 november 2026",
    tekst:
      "Die vraagt u zelf aan met Mijn toeslagen. […] Dit kan al zodra u het contract met de opvang hebt getekend. […] doe dit wel uiterlijk binnen 3 maanden nadat de opvang is gestart.",
  },
  pw31lid3: {
    titel: "Participatiewet, art. 31 lid 3",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01#Hoofdstuk3_Paragraaf3.4_Artikel31",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "De middelen worden in aanmerking genomen tot het bedrag dat resteert na aftrek van: a. de daarover door de belanghebbende verschuldigde loonbelasting of inkomstenbelasting; […]",
  },
  toetsingsinkomenKinderalimentatie: {
    titel: "Belastingdienst, Het inkomen dat telt voor toeslagen is het 'toetsingsinkomen'",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/kan_ik_toeslag_krijgen/inkomen/",
    versie: "geraadpleegd op 12 november 2026",
    tekst: "Inkomens die niet meetellen […] kinderbijslag […] alimentatie die u krijgt voor uw kinderen",
  },
  pw45lid4: {
    titel: "Participatiewet, art. 45 lid 4",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "De algemene bijstand wordt uitbetaald aan ieder van de rechthebbende echtgenoten voor de helft dan wel op hun gezamenlijk verzoek aan een van hen voor het geheel.",
  },
  pw45: {
    titel: "Participatiewet, art. 45 lid 1",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "De algemene bijstand wordt per kalendermaand vastgesteld en betaald. In afwijking van de eerste volzin wordt de vakantietoeslag, voorzover niet reeds eerder betaald, jaarlijks betaald in de maand juni over de aan die maand voorafgaande twaalf maanden of zo veel eerder als de vakantietoeslag over deze periode vaststaat, dan wel binnen drie maanden volgend op de maand waarin de algemene bijstand is beëindigd.",
  },
  awirTerugvordering: {
    titel: "Algemene wet inkomensafhankelijke regelingen, art. 26 lid 1",
    url: "https://wetten.overheid.nl/BWBR0018472/2026-10-01#Hoofdstuk2_Paragraaf3_Artikel26",
    versie: "geldend vanaf 1 oktober 2026",
    tekst:
      "Indien een herziening van een tegemoetkoming of een herziening van een voorschot leidt tot een terug te vorderen bedrag dan wel een verrekening van een voorschot met een tegemoetkoming daartoe leidt, is de belanghebbende het bedrag van de terugvordering in zijn geheel verschuldigd.",
  },
  htMedebewoners: {
    titel: "Wet op de huurtoeslag, art. 7 lid 1",
    url: "https://wetten.overheid.nl/BWBR0008659/2026-01-01",
    versie: "geldend vanaf 1 januari 2026",
    tekst: "Het recht op en de hoogte van de huurtoeslag is afhankelijk van de draagkracht, waaronder begrepen het vermogen, van de huurder, diens partner en de medebewoners.",
  },
  htInkomenKind: {
    titel: "Belastingdienst, Mijn kind woont thuis en verdient geld. Heeft dat gevolgen voor mijn huurtoeslag?",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/huurtoeslag/uw-inkomen-is-niet-te-hoog-voor-de-huurtoeslag/ik-heb-thuiswonende-kinderen-met-inkomen",
    versie: "geraadpleegd op 12 november 2026",
    tekst:
      "Het inkomen van een kind dat thuis woont, telt mee voor de huurtoeslag. […] Het gaat niet om het netto-inkomen, maar om het 'toetsingsinkomen' van uw kind. […] Studiefinanciering telt niet mee als inkomen voor huurtoeslag.",
  },
  htZelfstandig: {
    titel: "Dienst Toeslagen, Kan ik huurtoeslag krijgen?",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen",
    versie: "geraadpleegd op 8 november 2026",
    tekst:
      "Een zelfstandige woonruimte heeft in ieder geval een eigen toegangsdeur die op slot kan, keuken en wc. En sinds 1 maart 2024 moet de woning ook een eigen wasgelegenheid met douche of bad hebben.",
  },
  kotBeidenWerken: {
    titel: "Dienst Toeslagen, Kan ik kinderopvangtoeslag krijgen?",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen",
    versie: "geraadpleegd op 10 november 2026",
    tekst: "U en uw partner werken of volgen een opleiding, een inburgeringscursus of een traject naar werk",
  },
  bbKinderopvang: {
    titel: "Leiden, beleidsregels bijzondere bijstand 2022, art. 7 lid 1 onder f en de toelichting",
    url: "https://lokaleregelgeving.overheid.nl/CVDR677687",
    versie: "geldend vanaf 1 april 2022",
    tekst:
      "Art. 7 lid 1: Voor bijzondere bijstandsverlening komen in ieder geval de volgende kosten in aanmerking, indien zij noodzakelijk zijn op grond van bijzondere omstandigheden en er geen sprake is van een voorliggende voorziening: […] f. de eigen bijdrage in de kosten van formele kinderopvang, wanneer deze kosten noodzakelijk zijn voor werk, scholing of deelname aan een participatietraject. Toelichting: Voor de eigen bijdrage in de kosten van kinderopvang kan bijzondere bijstand worden verleend in die gevallen waarin de kosten van kinderopvang een belemmering vormen voor werk, scholing of voor deelname aan een participatietraject. Onder eigen bijdrage verstaan we hier de werkelijk gemaakte kosten voor formele kinderopvang minus de ontvangen tegemoetkomingen voor de kosten van kinderopvang (kinderopvangtoeslag).",
  },
} satisfies Record<string, Citaat>;

export type CitaatId = keyof typeof CITATEN;

const DATUM = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

/** Zet een citaat uit de regeldata om naar een Citaat voor de app. */
export function naarCitaat(c: BronCitaat, bron: Bron, geldigVan: string): Citaat {
  return { titel: c.kop, url: c.url ?? bron.url, versie: c.versie ?? `geldend vanaf ${DATUM(geldigVan)}`, tekst: c.tekst };
}

/** Teksten zonder bedragen die bij een groep parameters horen (op begin van de id). */
const PER_PARAMETER: [string, CitaatId][] = [["pw.bijverdien.", "pw34a"]];

/** De letterlijke brontekst bij een gebruikte parameter, als die er is. */
export function citaatVoorParameter(g: GebruikteParameter): Citaat | undefined {
  if (g.citaat && g.bron) return naarCitaat(g.citaat, g.bron, g.geldigVan);
  const hit = PER_PARAMETER.find(([prefix]) => g.id.startsWith(prefix));
  return hit ? CITATEN[hit[1]] : undefined;
}
