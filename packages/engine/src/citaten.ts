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
  sleutelpasWie: {
    titel: "Leiden, Beleidsregels Sleutelpas 2026, art. 2.2 en 3.1",
    url: "https://zoek.officielebekendmakingen.nl/gmb-2025-429670.html",
    versie: "geraadpleegd op 21 november 2026",
    tekst:
      "Een aantal inwoners is uitgesloten om een aanvraag te doen voor een Sleutelpas, dat zijn: a. Inwoners die in detentie of een instelling te verblijven. […] c. Inwoners die uit Rijkskas bekostigd onderwijs volgen en in verband daarmee aanspraak kunnen maken op studiefinanciering op grond van de Wet studiefinanciering 2000 of de Wet tegemoetkoming onderwijsbijdrage en schoolkosten, tenzij deze persoon zorgt draagt over een ten laste komend kind en het gezinsinkomen niet meer bedraagt dan 130% van het sociaal minimum. […] De Sleutelpas wordt ambtshalve toegekend aan inwoners, die: a. Een algemene bijstandsuitkering ontvangen vanuit de Participatiewet; b. Een uitkering ontvangen vanuit de IOAW, IOAZ of Bbz;",
  },
  kindtegoedKind: {
    titel: "Leiden, Beleidsregels Kindtegoed en armoederegelingen Sleutelpas 2026, art. 1.1 d",
    url: "https://zoek.officielebekendmakingen.nl/gmb-2025-508798.html",
    versie: "geldend vanaf 1 januari 2026",
    tekst:
      "Kind: de minderjarige (tot 18 jaar) die op moment van aanvraag op hetzelfde adres woont als de rechthebbende en voor wie kinderbijslag wordt ontvangen zoals bedoeld in de Algemene Kinderbijslagwet, of zal worden ontvangen vanaf het eerstvolgende kwartaal of het pleegkind waarvoor een pleegkindvergoeding wordt ontvangen.",
  },
  volwassenentegoed: {
    titel: "Leiden, Beleidsregels Kindtegoed en armoederegelingen Sleutelpas 2026, art. 3.4",
    url: "https://zoek.officielebekendmakingen.nl/gmb-2025-508798.html",
    versie: "geldend vanaf 1 januari 2026",
    tekst:
      "a. Inwoners met een inkomen tot 120% van het WSM komen in aanmerking voor een Volwassenentegoed. […] c. Rechthebbenden boven de 18 jaar oud kunnen hiervoor een aanvraag doen bij het Volwassenenfonds Sport en Cultuur. […] e. Het maximale tegoed dat het Volwassenenfonds kan toekennen is €250,-",
  },
  pw36b: {
    titel: "Participatiewet, art. 36b lid 1 tot en met 3",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "1 In aanvulling op de artikelen 7 en 7a, eerste lid, onderdeel b of c verstrekt het college op aanvraag van een belanghebbende die als rechtstreeks gevolg van een ziekte of gebrek structureel niet in staat is naast de studie inkomsten te verwerven, een studietoeslag […] 2 Bij de beoordeling of recht bestaat op de studietoeslag vraagt het college een geneeskundig advies, tenzij zonder dit advies vastgesteld kan worden dat recht bestaat op de studietoeslag. 3 De aanvraag kan worden gedaan door een belanghebbende die: a. studiefinanciering ontvangt op grond van de Wet studiefinanciering 2000, niet zijnde het levenlanglerenkrediet, of een tegemoetkoming krijgt op grond van hoofdstuk 4 van de Wet tegemoetkoming onderwijsbijdrage en schoolkosten; en b. geen recht heeft op een uitkering op grond van de Wet arbeidsongeschiktheidsvoorziening jonggehandicapten.",
  },
  iitPeildatum: {
    titel: "Leiden, Verordening individuele inkomenstoeslag, toelichting (Gemeenteblad 2019, 316445)",
    url: "https://zoek.officielebekendmakingen.nl/gmb-2019-316445.html",
    versie: "geraadpleegd op 21 november 2026",
    tekst:
      "Het gaat om de datum waarop een persoon langdurig een laag inkomen heeft, geen in aanmerking te nemen vermogen heeft als bedoeld in artikel 34 van de Participatiewet en, gelet op de omstandigheden van die persoon, geen uitzicht op inkomensverbetering heeft.",
  },
  iitLeeftijd: {
    titel: "Gemeente Leiden, Individuele inkomenstoeslag",
    url: "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/individuele-inkomenstoeslag/",
    versie: "geraadpleegd op 22 november 2026",
    tekst: "U bent 23 jaar of ouder, maar u hebt nog niet de AOW-leeftijd bereikt.",
  },
  iitAow: {
    titel: "Rijksoverheid, Wat is de individuele inkomenstoeslag?",
    url: "https://www.rijksoverheid.nl/themas/werk/pensioen/vraag-en-antwoord/participatiewet/individuele-inkomenstoeslag",
    versie: "geraadpleegd op 23 november 2026",
    tekst: "Bent u AOW-gerechtigd? Dan geldt voor u een hogere bijstandsnorm […] komt u niet in aanmerking voor de individuele inkomenstoeslag.",
  },
  sleutelpasSpecificatie: {
    titel: "Beleidsregels Sleutelpas Leiden 2026, toelichting bij artikel 4.3",
    url: "https://zoek.officielebekendmakingen.nl/gmb-2025-429670.html",
    versie: "Gemeenteblad 2025, 429670",
    tekst: "Bij een aantal soorten inkomen kan hiervan afgeweken worden […] is het voldoende om de meest recente maandspecificatie aan te leveren. Dit is het geval bij de volgende inkomenssoorten: […] AIO (Aanvullende Inkomensvoorziening Ouderen)",
  },
  aioWie: {
    titel: "SVB, Kijk of u een AIO-aanvulling krijgt",
    url: "https://www.svb.nl/nl/aio/kijk-of-u-een-aio-aanvulling-krijgt",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "U krijgt een AIO-aanvulling als u: de AOW-leeftijd heeft in Nederland woont geen AOW of geen volledige AOW krijgt geen of weinig andere inkomsten heeft niet te veel vermogen heeft […] U kunt dan misschien AIO-aanvulling krijgen als: uw partner nog geen AOW heeft u en uw partner naast uw AOW geen of weinig andere inkomsten hebben u en uw partner niet te veel vermogen hebben",
  },
  sleutelpasSchuld: {
    titel: "Leiden, Beleidsregels Sleutelpas 2026, art. 2.3",
    url: "https://zoek.officielebekendmakingen.nl/gmb-2025-429670.html",
    versie: "geraadpleegd op 21 november 2026",
    tekst:
      "De rechthebbende heeft geen draagkracht als: a. Het (gezins)inkomen van de rechthebbende niet hoger is dan 130% van het Wettelijk Sociaal Minimum (WSM), en; b. De rechthebbende is toegelaten tot de schuldsaneringsregeling (volgens de WSNP). c. De rechthebbende meedoet aan een schuldregeling die door de gemeente is afgesloten (MSNP). Dit geldt zolang die persoon zich aan de afspraken van de regeling houdt.",
  },
  stadsbankSchuldregeling: {
    titel: "Leiden, Bankreglement stadsbank gemeente Leiden 2025, art. 1",
    url: "https://lokaleregelgeving.overheid.nl/CVDR741747/",
    versie: "geraadpleegd op 21 november 2026",
    tekst:
      "Schuldregeling: bij een schuldregeling bemiddelt de Stadsbank tussen de schuldenaar en zijn schuldeisers om een minnelijke regeling van de totale schuldenlast te bewerkstelligen; […] Stadsbank: de Stadsbank Leiden, (statutair) gevestigd te Leiden, en kantoorhoudende te 2312 NH Leiden aan de Langegracht 72;",
  },
  kinderbijslagWie: {
    titel: "SVB, Wat is kinderbijslag",
    url: "https://www.svb.nl/nl/kinderbijslag/wat-is-kinderbijslag/wat-is-kinderbijslag",
    versie: "geraadpleegd op 21 november 2026",
    tekst:
      "Kinderbijslag is een bijdrage in de kosten voor de verzorging van kinderen tot 18 jaar. De betaling is per kwartaal. Heeft u een kind jonger dan 18 jaar? Dan kunt u kinderbijslag krijgen als u hiervoor verzekerd bent. U bent meestal verzekerd voor de kinderbijslag als u in Nederland woont of werkt.",
  },
  kinderopvangSmi: {
    titel: "Gemeente Leiden, Kinderopvang bij sociale of medische problemen",
    url: "https://gemeente.leiden.nl/inwoners-en-ondernemers/zorg-en-onderwijs/kinderopvang/kinderopvang-bij-sociale-of-medische-problemen/",
    versie: "geraadpleegd op 21 november 2026",
    tekst:
      "Hebt u lichamelijke, psychische of sociale problemen? Of heeft uw partner lichamelijke, psychische of sociale problemen? En wilt u daarom voor uw kind(eren) kinderopvang regelen? Dan kunt u een vergoeding voor de kinderopvangkosten aanvragen. U kunt voor maximaal 3 dagen een vergoeding voor de kinderopvang krijgen. […] Uw kind(eren) is (zijn) jonger dan 4 jaar of zit(ten) op de basisschool. U en/of uw partner krijgen geen andere vergoeding voor de kinderopvangkosten. […] Hou er rekening mee dat u ook een eigen bijdrage moet betalen.",
  },
  kinderopvangSmiGeldzaken: {
    titel: "Gemeente Leiden, Geldzaken: Kinderopvang bij sociale of medische problemen",
    url: "https://geldzaken.leiden.nl/regeling/kinderopvang-bij-sociale-of-medische-problemen/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Hebt u last van lichamelijke, psychische of sociale klachten? En kan er geen andere volwassene voor uw kinderen zorgen? Dan kan de gemeente u helpen met de kosten voor kinderopvang. […] Uw kinderen zitten op de basisschool of zijn jonger dan 4 jaar.",
  },
  kwijtschelding: {
    titel: "Gemeente Leiden, Geldzaken: Kwijtschelding of geld terugkrijgen",
    url: "https://geldzaken.leiden.nl/regeling/kwijtschelding-of-geld-terugkrijgen/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Hebt u moeite met het betalen van de gemeentelijke belastingen? Dan kunt u misschien kwijtschelding krijgen. Dit betekent dat u de belasting niet hoeft te betalen. Hebt u de belasting al betaald? Dan kunt u misschien het geld terugkrijgen. Is dit voor u? Uw inkomen is op of onder bijstandsniveau en uw vermogen is niet te hoog. […] Het inkomen van uw huisgenoten kan ook meetellen.",
  },
  bijzondereBijstand: {
    titel: "Gemeente Leiden, Geldzaken: Bijzondere bijstand als het echt nodig is",
    url: "https://geldzaken.leiden.nl/regeling/bijzondere-bijstand-als-het-echt-nodig-is/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Soms hebt u kosten die u niet kunt betalen. Bijvoorbeeld omdat ze onverwacht zijn. De gemeente kan u dan een vergoeding of een lening geven. Dit heet bijzondere bijstand. […] U hebt de kosten nog niet gemaakt. De kosten zijn noodzakelijk: voor dingen die u echt nodig hebt. […] Uw inkomen is maximaal 110% van de bijstandsnorm en uw vermogen is niet te hoog. Hebt u een hoger inkomen, tot 150% van de bijstandsnorm? Dan kunt u ook nog in aanmerking komen. Maar u krijgt dan een lagere vergoeding. […] Het gaat bijvoorbeeld om kosten voor bewindvoering, rechtshulp, kinderopvang, verhuizing of woninginrichting.",
  },
  goedeBuur: {
    titel: "Gemeente Leiden, Geldzaken: Het Goede Buur Spreekuur",
    url: "https://geldzaken.leiden.nl/regeling/rekeningen/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Vindt u het even moeilijk om de rekeningen te betalen? Wilt u dat iemand u helpt met een aanvraag of sollicitatie? Of hebt u andere vragen over geld? In Leiden zijn er veel mensen die graag met u meekijken. Deze hulp is gratis en vrijblijvend. […] Op maandag, dinsdag en donderdag kunt u binnenlopen bij het Goede Buur Spreekuur. U hebt hier geen afspraak voor nodig.",
  },
  goedeBuurTijden: {
    titel: "Gemeente Leiden, Geldzaken: Het Goede Buur Spreekuur (tijden en plekken)",
    url: "https://geldzaken.leiden.nl/hulp-bij-uw-aanvraag/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Hieronder ziet u wanneer de spreekuren van Een Goede Buur zijn. Maandag van 9.00 uur – 11.00 uur. Dinsdag van 9.00 uur – 11.00 uur. Donderdag van 13.00 – 15.00 uur. In de binnenstad: Maandag van 9.00 – 11.00 uur (bij Speeltuinvereniging Ons Eiland). Dinsdag van 9.30 – 11.30 (in de Stadskamer). […] Huis van de Buurt De Kooi, Driftstraat 29. Huis van de Buurt Het Gebouw, Arubapad 2. Huis van de Buurt Matilo, Zaanstraat 126. Huis van de Buurt Morschwijck, Topaaslaan 19. Speeltuinvereniging Ons Eiland, Kortenaerstraat 61. de Stadskamer, Nieuwstraat 7. Huis van de Buurt Op Eigen Wieken, Valkenpad 5. Huis van de Buurt Stevenshof, Trix Terwindtstraat 4. Huis van de Buurt Bos- en Gasthuis, Boshuizerkade 119. […] Vrijwilligers van Incluzio zijn tijdens openingstijden te bellen of te appen via 06 – 21 42 76 37. […] Dan kunt u bellen naar 14071 van maandag tot en met vrijdag tussen 9:00 en 17:00.",
  },
  steunpuntBelastingdienst: {
    titel: "Gemeente Leiden, Belastingdienst opent steunpunt in het Stadskantoor Leiden (10 juli 2026)",
    url: "https://gemeente.leiden.nl/nieuws-en-publicaties/nieuws/belastingdienst-opent-steunpunt-in-het-stadskantoor-leiden/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Het steunpunt van de Belastingdienst in Stadskantoor Leiden (Bargelaan 190) is iedere vrijdag geopend van 9.00 tot 16.00 uur. U kunt langskomen voor persoonlijke hulp of (video)bellen. Maak wel eerst een afspraak via de website van de Belastingdienst.",
  },
  toeslagenBellen: {
    titel: "Dienst Toeslagen, Bellen met Dienst Toeslagen",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/contact-met-dienst-toeslagen/content/bellen",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Voor vragen over uw toeslagen kunt u ons bellen: 0800 - 0543. Dit nummer is gratis. […] We zijn bereikbaar op: maandag tot en met donderdag van 8.00 uur tot 20.00 uur, vrijdag van 8.00 uur tot 17.00 uur",
  },
  stadsbank: {
    titel: "Gemeente Leiden, Geldzaken: Samen werken aan een oplossing",
    url: "https://geldzaken.leiden.nl/regeling/samen-werken-aan-een-oplossing/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Hebt u schulden? Wilt u voorkomen dat u schulden krijgt? Of maakt u zich zorgen over geld? Dan kan een schuldhulpverlener van de Stadsbank u helpen. […] Alle inwoners van Leiden kunnen contact opnemen met de Stadsbank. Er zijn geen voorwaarden. […] Bellen kan ook: 14 071 (keuzenummer 1).",
  },
  voedselbank: {
    titel: "Gemeente Leiden, Geldzaken: De Voedselbank",
    url: "https://geldzaken.leiden.nl/regeling/gratis-een-gezonde-maaltijd-op-tafel/",
    versie: "geraadpleegd op 22 november 2026",
    tekst:
      "Zijn boodschappen even te duur? Of vindt u het moeilijk om een gezonde maaltijd te kopen? Dan kunt u tijdelijk naar de Voedselbank. U krijgt daar elke week een pakket met eten en drinken voor u en uw gezin. […] De Voedselbank bepaalt voorwaarden en eisen.",
  },
  pw13studie: {
    titel: "Participatiewet, art. 13 lid 2 c",
    url: "https://wetten.overheid.nl/BWBR0015703/2026-07-01",
    versie: "geldend vanaf 1 juli 2026",
    tekst:
      "Geen recht op algemene bijstand heeft degene: […] c. die jonger is dan 27 jaar en uit ’s Rijks kas bekostigd onderwijs kan volgen en: 1°. in verband daarmee aanspraak heeft op studiefinanciering op grond van de Wet studiefinanciering 2000, dan wel 2°. in verband daarmee geen aanspraak heeft op studiefinanciering en dit onderwijs niet volgt;",
  },
  kotWie: {
    titel: "Wet kinderopvang, art. 1.6 lid 1",
    url: "https://wetten.overheid.nl/BWBR0017017/2026-01-01",
    versie: "geldend vanaf 1 januari 2026",
    tekst:
      "Een ouder heeft voor een berekeningsjaar aanspraak op een kinderopvangtoeslag, indien de ouder in dat jaar: a. tegenwoordige arbeid verricht waaruit inkomen uit werk en woning in de zin van de Wet inkomstenbelasting 2001 wordt genoten, […] c. algemene bijstand of een uitkering ontvangt op grond van de Participatiewet […] en gebruik maakt van een voorziening gericht op arbeidsinschakeling […] die de noodzaak tot kinderopvang met zich brengt, […] g. inburgeringsplichtig is op grond van de Wet inburgering 2021 en een cursus of opleiding volgt […] j. is ingeschreven bij een school of instelling, voor het volgen van: […]",
  },
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
  inkomenDoorgeven: {
    titel: "Belastingdienst, Mijn inkomen verandert – moet ik dat doorgeven?",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/werk-en-inkomen/content/mijn-inkomen-verandert-moet-ik-dat-doorgeven",
    versie: "geraadpleegd op 13 november 2026",
    tekst: "Ja, als u een voorlopige aanslag of een toeslag hebt. […] Geef dan aan ons door dat uw inkomen verandert. Dit doet u met Mijn toeslagen of met de app Toeslagen.",
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
