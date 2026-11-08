# Open vragen

Stand: 8 november 2026. Per vraag staat of het uitzoekwerk is of een besluit of actie van de beheerder.

## Voor de beheerder

| # | Vraag of actie | Waarom | Urgentie |
| --- | --- | --- | --- |
| B1 | Branch protection en CODEOWNERS activeren | Zonder deze instelling kan iedereen met schrijfrechten nog rechtstreeks naar `main`. Stappen in [ONDERHOUD.md](ONDERHOUD.md#branch-protection-instellen-eenmalig-door-de-eigenaar-op-github) | Hoog |
| B2 | Proefberekeningen van Dienst Toeslagen invullen voor een paar proefpersonen | De proefberekening is een interactief formulier. Per persoon staat een invulblad in [PROEFPERSONEN.md](PROEFPERSONEN.md). Zet de uitkomsten met datum in `testgevallen/*.yaml` | Normaal |
| B3 | Geanonimiseerde echte documenten aanleveren (uitkeringsspecificatie bijstand, toeslagbeschikking, loonstrook) | Onafhankelijke toets van netto loon, bruto bijstand (toetsingsinkomen) en vrijlating | Normaal |
| B4 | Navraag gemeente Leiden: is 'WSM' in de Sleutelpasregels gelijk aan de toepasselijke bijstandsnorm? Welke inkomensgrens geldt voor gehuwden? | Bepaalt de grens van de gratis Sleutelpas en het Kindtegoed in de app | Normaal |
| B5 | Navraag gemeente Leiden: krijgt iemand die in 2027 het overgangsrecht van onderdeel n gebruikt daarna nog de nieuwe bijverdienregeling (art. 34a)? En hoe past Leiden "bijdragen aan arbeidsinschakeling" toe? | De wet zegt het niet; de app neemt nu aan van niet en verwijst naar de klantmanager | Normaal |
| B6 | Kiest u als uitgangspunt voor 2027 de nieuwe regels als standaard (zodra de normen bekend zijn)? | De app volgt nu de datum van vandaag; vanaf 1 januari 2027 vanzelf de nieuwe regels, of de laatste bekende met een waarschuwing | Laag |

## Uit te zoeken

| # | Onderwerp | Wat ontbreekt | Waar te vinden |
| --- | --- | --- | --- |
| V1 | Bijstandsnormen 1 januari 2027 | Bedragen | Staatscourant-mededeling "gewijzigde bedragen per 1 januari 2027", verwacht begin december 2026 (de bewaking meldt het) |
| V2 | Belasting 2027 | Schijven, heffingskortingen, arbeidskorting | Belastingdienst na aanneming Belastingplan 2027 |
| V3 | Toeslagen 2027 | Standaardpremie, drempelinkomen, huurtoeslaggrenzen, kindgebonden budget | Staatscourant / brochures Dienst Toeslagen 2027 |
| V4 | Kinderopvangtoeslag 2027 | Tabel en maximum uurprijzen zijn gepubliceerd in **Stb. 2026, 308** (besluit van 3 oktober 2026); nog verwerken. Ook de **Wet van 1 juli 2026** tot wijziging van de Wet kinderopvang (Stb. 2026, 184; inwerkingtreding Stb. 2026, 253) nalezen op gevolgen voor de berekening | officielebekendmakingen.nl |
| V5 | Kostendelersnorm 2027 | Art. 19a en 22a in de versie per 1 januari 2027 nalezen (nu `onbevestigd`, overgenomen van 2026) | wetten.overheid.nl/BWBR0015703/2027-01-01 |
| V6 | Verrekening per 2027 | Uniform verrekenen, verrekening vakantiegeld, bufferbudget (art. 34b, max. € 1.000 per jaar); de app rekent dit niet | Regeling Participatiewet, IOAW en IOAZ (versie 2027) |
| V7 | Netto loon | Officiële vergelijking met de witte maandtabel loonheffing 2026 voor de proefpersonen (nu `onbekend`) | Belastingdienst, loonheffingstabellen 2026 |
| V8 | Bruto bijstand voor het toetsingsinkomen | De app rekent de bruto bijstand terug uit de netto norm; de gemeente gebruikt het werkelijke bruto bedrag. Toetsen met een uitkeringsspecificatie (B3) | Uitkeringsspecificatie |
| V9 | Huurtoeslag met medebewoners | Inkomen van huisgenoten (rekeninkomen); nu niet ondersteund en gemeld | Wet op de huurtoeslag, brochure stap 5 |
| V10 | Leiden: kwijtschelding en collectieve zorgverzekering | Welke norm Leiden hanteert en wie uitvoert; bestaat er een minimapolis | lokaleregelgeving.overheid.nl, leiden.nl |
| V11 | Individuele inkomenstoeslag | leiden.nl noemt "23 jaar of ouder" als voorwaarde maar bedragen "tussen de 21 jaar en de pensioengerechtigde leeftijd"; de verordening van 2020 is niet opnieuw nagelezen op leeftijd | Verordening IIT Leiden (CVDR634399) |

## Opgelost op 8 november 2026

- **Minimum-inkomensijkpunt huurtoeslag 2026**: € 23.425 / € 31.500 (Stcrt. 2025, 39783). Basishuur, grenzen en percentages bevestigd in de wet, het Besluit op de huurtoeslag en de brochure van Dienst Toeslagen. Servicekosten tellen sinds 2026 niet meer mee.
- **Kinderbijslag 2026**: bedragen per halfjaar van de SVB.
- **Zorgtoeslag, kindgebonden budget, kinderopvangtoeslag 2026**: alle parameters `geverifieerd` uit de brochures van Dienst Toeslagen; de rekenvoorbeelden zijn tests.
- **Vrijlating art. 31 lid 2 n en r**: nagelezen in de wettekst. Nieuw gevonden: geen vrijlating onder de 27 jaar (lid 5) en de vrijlating bij een medische urenbeperking (onder y).
- **Art. 34a vanaf 2027**: 15% zonder maximumbedrag en zonder inkomensgrens; geldt ook onder de 27. Overgangsrecht art. 78ff lid 2 en 3 gebouwd.
- **Individuele inkomenstoeslag**: actuele bedragen op leiden.nl (€ 462 / € 577 / € 635). Ze bevestigen artikel 4 van de verordening van 2020; de afwijkende toelichting is niet bepalend.
- **Garantieknop**: termijn en voorwaarden uit de Beleidsregels inkomensvoorzieningen Leiden 2026 (hoofdstuk 3).
- **Kostendelersnorm 2026**: formule en leeftijdsgrens in de wettekst (art. 19a en 22a).
- **Afronding**: Dienst Toeslagen rondt maandbedragen naar beneden af op hele euro's; ingebouwd.
