# Open vragen

Stand: 13 november 2026. Per vraag staat wat ontbreekt en waar het te vinden is.

## Wacht op officiële bevestiging

Beantwoord door klantmanagers in Leiden, maar nog niet in een officieel document. Zodra dat er is: bron toevoegen en hier weghalen.

| # | Vraag | Antwoord uit de praktijk | Wat ontbreekt |
| --- | --- | --- | --- |
| G1 | Krijgt iemand die in 2027 het overgangsrecht van onderdeel n gebruikt daarna nog de nieuwe bijverdienregeling (art. 34a)? | De gemeente beslist (bevestigd 13 november 2026). De app neemt aan van niet en zegt dat de gebruiker het bij de gemeente moet vragen | Officiële documentatie. Wet, memorie van toelichting en de andere Kamerstukken van dossier 36582 zeggen het niet (doorzocht op 8 november 2026). Geen datum bekend |
| V13 | Telt een reiskostenvergoeding van de werkgever mee als inkomen voor de bijstand? | Nee: het is een doelverstrekking (bevestigd 13 november 2026). Zo rekent de app al | Een officiële bron met deze tekst (wet, beleidsregel of uitspraak) |

## Uit te zoeken

| # | Onderwerp | Wat ontbreekt | Waar te vinden |
| --- | --- | --- | --- |
| V1 | Bijstandsnormen 1 januari 2027 | Bedragen | Staatscourant-mededeling "gewijzigde bedragen per 1 januari 2027", verwacht begin december 2026 (de bewaking meldt het) |
| V2 | Belasting 2027 | Schijven, heffingskortingen, arbeidskorting | Belastingdienst na aanneming Belastingplan 2027 |
| V3 | Toeslagen 2027 | Standaardpremie, drempelinkomen, huurtoeslaggrenzen, kindgebonden budget | Staatscourant / brochures Dienst Toeslagen 2027 |
| V4 | Kinderopvangtoeslag 2027 | Tabel en maximum uurprijzen zijn gepubliceerd in **Stb. 2026, 308** (besluit van 3 oktober 2026); nog verwerken. Ook de **Wet van 1 juli 2026** tot wijziging van de Wet kinderopvang (Stb. 2026, 184; inwerkingtreding Stb. 2026, 253) nalezen op gevolgen voor de berekening | officielebekendmakingen.nl |
| V5 | Kostendelersnorm 2027 | Art. 19a en 22a in de versie per 1 januari 2027 nalezen (nu `onbevestigd`, overgenomen van 2026) | wetten.overheid.nl/BWBR0015703/2027-01-01 |
| V6 | Verrekening per 2027 | Uniform verrekenen, verrekening vakantiegeld, bufferbudget (art. 34b, max. € 1.000 per jaar); de app rekent dit niet | Regeling Participatiewet, IOAW en IOAZ (versie 2027) |
| V14 | Jongeren onder 27 vlak voor 2027 | De uitkomst toont voor wie jonger is dan 27 alleen 2026 (geen vrijlating). Vanaf 1 januari 2027 mag die persoon wel een deel houden (art. 34a). Zodra de normen voor 2027 officieel zijn (V1), nagaan of de uitkomst ook een bedrag vanaf januari 2027 kan tonen. Geen bedrag tonen zolang de normen onbekend zijn | Staatscourant, begin december 2026 |

## Opgelost

- **Individuele inkomenstoeslag en vrijgelaten loon** (was V18): wie door de vrijlating meer dan de norm verdient, kan de individuele inkomenstoeslag nog steeds aanvragen. Bevestigd uit de praktijk, en zo staat het ook in de Verordening individuele inkomenstoeslag Leiden 2020 (CVDR634399, art. 1): inkomen is het inkomen van art. 32 Pw plus de algemene bijstand, en art. 32 telt alleen de middelen die volgens art. 31 meetellen. Het vrijgelaten loon telt dus niet mee.
- **Leeftijd individuele inkomenstoeslag** (was V11): de wet noemt 21 jaar (art. 36 lid 1 Pw), maar de Leidse verordening laat de referteperiode van vijf jaar ingaan op de achttiende verjaardag. Wie er aan voldoet, is dus minstens 23. De app gebruikt 23, zoals leiden.nl.
- **Netto loon** (was V7): de inhouding van de app is vergeleken met de witte maandtabel loonheffing 2026 (Belastingdienst, uitgave januari 2026) bij negen lonen van € 954 tot € 3.501 per maand. Verschil hoogstens € 0,18 per maand. Toets: `packages/engine/test/loonheffingstabellen.test.ts`.
- **Bruto bijstand voor het toetsingsinkomen** (was V8): de terugrekening van netto naar bruto is vergeleken met de groene maandtabel loonheffing 2026 (uitkeringen) bij acht bedragen van € 729 tot € 2.502. De app vindt het bruto bedrag terug op hoogstens € 0,15 na. Toets: `packages/engine/test/loonheffingstabellen.test.ts`. Een gemeente kan de vakantietoeslag anders uitbetalen; het jaarbedrag verandert daardoor niet.
- **Grenzen van 110%, 120% en 150% (bijzondere bijstand)** (was V12): de Beleidsregels bijzondere bijstand 2022 (CVDR677687) zijn nog geldend (stand 12 november 2026). Art. 1 onder d bevestigt de norm die de app gebruikt: de norm van art. 20 tot en met 24 Pw, met de verlaging van art. 27, zonder kostendelersnorm, en voor een alleenstaande ouder 90% van de gezinsnorm. De draagkracht (art. 6) zit in de berekening van de vergoeding voor de eigen bijdrage kinderopvang; de 120% voor het zwemabonnement staat als melding.
- **Sleutelpas bij verblijf in een instelling**: de beleidsregels zeggen niet wat het WSM is. De gemeente noemt op dezelfde pagina als de Sleutelpas voor "alleenstaand, in instelling" een sociaal minimum op basis van de norm van art. 23 lid 1 (Volwassenenfonds: € 512,36 bij 120%). De app gebruikt die norm ook voor de Sleutelpas. Voor een paar in een instelling noemt de gemeente geen bedrag; de app geeft dan geen melding.
- **Huurtoeslag met huisgenoten van elke leeftijd en kinderen met inkomen**: iedereen op het adres telt mee (Awir art. 1 en 7); kinderen jonger dan 23 pas boven € 6.218 (brochure Berekening huurtoeslag 2026, stap 5).
- **Woonvorm met begeleiding (art. 23 Pw)**: norm bij verblijf in een inrichting ingebouwd, met de verhoging van lid 2. De app gaat ervan uit dat bewoners niets betalen voor het verblijf dat invloed heeft op de bijstand. Dat klopt meestal, maar hangt af van de instelling; er is geen bron die het vastlegt. De app zegt dit bij de aannames. Instelling met zorg en woonvorm met begeleiding zijn één keuze (zelfde norm).
- **Geen of lage woonkosten (Leiden)**: lagere norm volgens de Beleidsregels Vermogen en Algemene Bijstandsnorm bij lage woonkosten of verblijf in inrichting 2026 (CVDR760406, art. 3.1): 10% van de gehuwdennorm zonder woonkosten, 9% zonder woonlasten, 19% samen; bij woonkosten onder 10% het verschil. Alleen bij de norm van art. 21, niet bij de kostendelersnorm. Wonen in een instelling (art. 23) rekent de app niet.
- **Kamer of onzelfstandige woning**: geen huurtoeslag (voorwaarde zelfstandige woonruimte, belastingdienst.nl "Kan ik huurtoeslag krijgen?"). De app vraagt de huur wel, voor de Leidse verlaging bij lage woonkosten.
- **Eigen bijdrage kinderopvang**: Volgens de Leidse beleidsregels bijzondere bijstand (CVDR677687, art. 7 lid 1 onder f) komt "de eigen bijdrage in de kosten van formele kinderopvang, wanneer deze kosten noodzakelijk zijn voor werk" "in ieder geval" in aanmerking voor bijzondere bijstand. De app gaat ervan uit dat de opvang nodig is om te kunnen werken, en rekent de vergoeding mee met de draagkrachtregels van art. 6 en de rekennorm van art. 1 onder d, en zegt dat het aangevraagd moet worden.

- **Huurtoeslag met huisgenoten van 27+**: ingebouwd en getoetst aan een proefberekening (Wim, € 282).
- **Proefberekeningen Dienst Toeslagen**: drie ingevuld (Fatima en Youssef, Bram, Sanne 24 uur); alle negen bedragen kwamen tot op de euro overeen met de app.
- **Sleutelpas, Kindtegoed en Volwassenenfonds**: de grens is een vaste norm per soort huishouden, zonder kostendelersnorm. Zo staan de bedragen in de tabellen op gemeente.leiden.nl (Hulp bij kosten sport en cultuur); een test controleert dat de normen die bedragen opleveren.
- **Art. 34a, toets vooraf**: volgens de memorie van toelichting geldt de bijverdienregeling niet als het inkomen boven de bijstandsnorm ligt; ingebouwd.
- **Toetsing**: via officiële rekenvoorbeelden, proefberekeningen van Dienst Toeslagen en loonheffingstabellen, zonder documenten van echte personen.

- **Minimum-inkomensijkpunt huurtoeslag 2026**: € 23.425 / € 31.500 (Stcrt. 2025, 39783). Basishuur, grenzen en percentages bevestigd in de wet, het Besluit op de huurtoeslag en de brochure van Dienst Toeslagen. Servicekosten tellen sinds 2026 niet meer mee.
- **Kinderbijslag 2026**: bedragen per halfjaar van de SVB.
- **Zorgtoeslag, kindgebonden budget, kinderopvangtoeslag 2026**: alle parameters `geverifieerd` uit de brochures van Dienst Toeslagen; de rekenvoorbeelden zijn tests.
- **Vrijlating art. 31 lid 2 n en r**: nagelezen in de wettekst. Nieuw gevonden: geen vrijlating onder de 27 jaar (lid 5) en de vrijlating bij een medische urenbeperking (onder y).
- **Art. 34a vanaf 2027**: 15% zonder maximumbedrag en zonder inkomensgrens; geldt ook onder de 27. Overgangsrecht art. 78ff lid 2 en 3 gebouwd.
- **Individuele inkomenstoeslag**: actuele bedragen op leiden.nl (€ 462 / € 577 / € 635). Ze bevestigen artikel 4 van de verordening van 2020; de afwijkende toelichting is niet bepalend.
- **Garantieknop**: termijn en voorwaarden uit de Beleidsregels inkomensvoorzieningen Leiden 2026 (hoofdstuk 3).
- **Kostendelersnorm 2026**: formule en leeftijdsgrens in de wettekst (art. 19a en 22a).
- **Vrijlating over het loon van de partner** (was V15): de vrijlating van art. 31 lid 2 onder n geldt "voor zover hij algemene bijstand ontvangt"; gehuwden ontvangen ieder de helft (art. 45 lid 4), dus de vrijlating geldt per partner. Leiden heeft hierover geen eigen beleidsregel; andere gemeenten schrijven in hun beleidsregels letterlijk dat het recht "bij gehuwden voor ieder van de partners afzonderlijk" bestaat. De app vraagt hoe lang de partner al werkt en rekent bij korter dan 6 maanden 25% vrijlating, in beide kolommen en alleen in de eerste periode (aanname: de 6 maanden van de partner lopen tegelijk). Alleen in de regels tot en met 2026. Bevestigd door de memorie van toelichting bij de wet Breed offensief ([Kamerstuk 35394, nr. 3](https://zoek.officielebekendmakingen.nl/kst-35394-3.html)): "net als bij de overige reeds bestaande vrijlatingsregels, dat wanneer beide partners onder de doelgroep vallen iedere partner afzonderlijk recht heeft op de inkomstenvrijlating", en door klantmanagers in Leiden (13 november 2026).
- **Kinderalimentatie en toeslagen** (was V16): kinderalimentatie telt mee voor de bijstand, niet voor de toeslagen. De app vraagt haar apart, bij de kinderen.
- **Partneralimentatie**: de bijstand telt het bedrag na inkomstenbelasting (art. 31 lid 3 Pw). De app trekt het tarief van de eerste schijf af.
- **Inkomen van kinderen voor de huurtoeslag**: het hele toetsingsinkomen telt mee, min € 6.218 voor een kind dat aan het begin van het jaar jonger is dan 23; studiefinanciering telt niet mee (belastingdienst.nl, "Mijn kind woont thuis en verdient geld").
- **Gemeentepolis**: grens 120% van het sociaal minimum, dezelfde tabel als het Volwassenenfonds (gemeente.leiden.nl, "Collectieve aanvullende zorgverzekering"). Ook bij verblijf in een instelling (was V17): de pagina noemt voor een alleenstaande € 512,36 zonder vakantiegeld, gelijk aan 120% × 95% van de norm van art. 23 lid 1 Pw; voor een paar in een instelling geen bedrag.
- **Kamerhuurders en de kostendelersnorm**: kamerhuurders met een commercieel contract en een commerciële huurprijs tellen niet mee als kostendeler, net als commerciële (onder)huurders en kostgangers (rijksoverheid.nl, "Wat is de kostendelersnorm in de bijstand?"). Staat in de uitleg bij de vraag naar huisgenoten.
- **Kinderopvangtoeslag aanvragen**: zelf aanvragen via Mijn toeslagen, uiterlijk 3 maanden nadat de opvang is gestart (belastingdienst.nl, "Hoe vraag ik kinderopvangtoeslag aan?"). Staat als stap in de uitkomst.
- **Afronding**: Dienst Toeslagen rondt maandbedragen naar beneden af op hele euro's; ingebouwd.
