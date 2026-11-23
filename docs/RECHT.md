# Recht

De regels achter de rekenhulp: wat er wordt berekend, op grond van welke wet of regeling, en met welke bron. De bedragen zelf staan in `regels/`.

- [Deel 1. Leidenwerkt: rekenregels](#deel-1-leidenwerkt-rekenregels)
- [Deel 2. Leidengeldwijzer: voorwaarden per regeling](#deel-2-leidengeldwijzer-voorwaarden-per-regeling)
- [Deel 3. Leidengeldwijzer: welke vragen, en waarom](#deel-3-leidengeldwijzer-welke-vragen-en-waarom)
- [Deel 4. Open vragen](#deel-4-open-vragen)

## Deel 1. Leidenwerkt: rekenregels

Stand: 8 november 2026. De waarden staan in `regels/`. Dit deel beschrijft de rekenwijze, de grondslag en de bronnen. De statustabel hieronder wordt gegenereerd uit de YAML-bestanden (`npm run docs`), zodat er één bron van waarheid is.

### Statussen

| Status | Betekenis | Gevolg in de app |
| --- | --- | --- |
| `geverifieerd` | Officiële bron zelf geopend, waarde letterlijk overgenomen | Normaal gebruikt |
| `onbevestigd` | Waarde nog niet in de definitieve officiële publicatie nagelezen | Gebruikt, met zichtbare markering |
| `ontbrekend` | Geen betrouwbare waarde gevonden | Onderdeel wordt niet berekend |

Alleen officiële bronnen tellen: wetten.overheid.nl, officielebekendmakingen.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, leiden.nl. De CI controleert dit (zie `scripts/bouw-regels.ts`).

### Status per onderwerp en jaar

<!-- statustabel:begin -->
<!-- Gegenereerd met `npm run docs` uit regels/**.yaml. Niet met de hand aanpassen. -->

| Onderwerp | 2026 | 2027 |
| --- | --- | --- |
| Bijstandsnorm | geverifieerd | ontbrekend |
| Kostendelersnorm | geverifieerd | onbevestigd |
| Inkomstenvrijlating (art. 31) | geverifieerd | – |
| Premie (art. 31 lid 2 j) | geverifieerd | – |
| Bijverdienregeling (art. 34a) | – | geverifieerd |
| Overgangsrecht 2027 | – | geverifieerd |
| Loonheffing en kortingen | geverifieerd | – |
| Zorgtoeslag | geverifieerd | – |
| Huurtoeslag | geverifieerd | – |
| Kindgebonden budget | geverifieerd | – |
| Kinderbijslag | geverifieerd | – |
| Kinderopvangtoeslag | geverifieerd | – |
| Leidse regelingen | geverifieerd | – |

<!-- statustabel:eind -->

### Bronvermelding in de app

Bij de vrijlating, de gebruikte regels en elke melding toont de app de naam van de bron. Aanwijzen, Tab of tikken toont de letterlijke tekst, met een link naar de officiële bron. Teksten met bedragen staan bij de parameter in de regeldata (`citaat`), zodat ze per periode kloppen; teksten zonder bedragen staan in `packages/rekenkern/src/citaten.ts`.

### Data tegenover mechanisme

- Een **gewijzigd bedrag** is regeldata: een nieuw YAML-bestand met een nieuwe `geldig_van`.
- Een **gewijzigd mechanisme** (voorwaarden, uitzonderingen, rekenvolgorde) is code. Voor de verrekening van inkomsten met de bijstand staat dat in `packages/rekenkern/src/regimes.ts` (welk regime geldt op welke datum) en `packages/rekenkern/src/modules/vrijlating.ts` (de regels per regime, inclusief overgangsrecht). De regimekeuze hangt alleen af van de rekendatum.

### Afronding

De engine rekent met `decimal.js` en rondt niet tussentijds af, met deze uitzondering:

- **Toeslagen per maand**: naar beneden afgerond op hele euro's. Dit staat in alle vier de brochures "Berekening … 2026" van Dienst Toeslagen ("Bedrag afronden naar beneden op hele euro's"; rekenvoorbeelden zorgtoeslag € 129,20 → € 129, huurtoeslag € 492,03 → € 492).
- **Toetsingsinkomen voor de kinderopvangtoeslagtabel**: in hele euro's, omdat de tabel per hele euro loopt (van € 24.150 tot € 25.756).
- **Weergave op de uitkomst**: elke rij van de tabel wordt op hele euro's afgerond. Totalen, "U houdt over", de kop, "Zonder vrijlating" en "De eerste 12 maanden samen" rekenen met die afgeronde rijen, zodat elk bedrag op de pagina na te rekenen is met de tabel.
- Bijstand en netto loon: geen tussentijdse afronding gevonden in de wet; afronding alleen bij weergave. De werkgever gebruikt loonheffingstabellen, die zelf afronden; daardoor kan de loonstrook een paar euro afwijken.

### 1. Bijstandsnorm

**Grondslag:** artikelen 20, 21, 22 en 22a Participatiewet. Normen worden per 1 januari en 1 juli aangepast aan het netto minimumloon (art. 38 Pw) en gepubliceerd in de Staatscourant.

| | 1 jan 2026 | 1 jul 2026 | 1 jan 2027 |
| --- | --- | --- | --- |
| Alleenstaande (ouder), 21 tot AOW (art. 21 a) | € 1.401,50 | € 1.419,46 | verwacht begin december 2026 |
| Gehuwden, beiden 21 tot AOW (art. 21 b) | € 2.002,13 | € 2.027,79 | idem |

Bron: [Rijksoverheid, hoogte bijstandsuitkering](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering).

#### Lagere norm bij geen of lage woonkosten (Leiden)

Grondslag: art. 27 Pw en de [Beleidsregels Vermogen en Algemene Bijstandsnorm bij lage woonkosten of verblijf in inrichting 2026](https://lokaleregelgeving.overheid.nl/CVDR760406), art. 3.1 (geldend vanaf 14 april 2026). Alleen bij de norm van art. 21, dus niet bij de kostendelersnorm. De verlaging is een deel van de gehuwdennorm:

| Situatie | Verlaging |
| --- | --- |
| Zelf geen woonkosten (geen vaste woonplek, of iemand anders betaalt de woonkosten langer dan 6 maanden) | 10% |
| Woonkosten lager dan 10% van de gehuwdennorm | het verschil |
| Zelf geen woonlasten (gas, elektriciteit, water) | 9% |
| Geen woonkosten en geen woonlasten | 19% |

De app vraagt de huur bij een zelfstandige huurwoning en bij een kamer of gedeelde woning, en past de tweede regel in beide gevallen toe. Wie bij iemand anders in huis woont en kostgeld of huur betaalt, vult alleen het deel voor de woonruimte in. De beleidsregels kennen het begrip kostgeld niet; ze rekenen met woonkosten: "huur, hypotheek of andere aantoonbare kosten die rechtstreeks samenhangen met het feitelijk beschikken over onderdak" (art. 1.1). De app past dan ook de tweede regel toe, zonder huurtoeslag.

De app vraagt bij 'Uw woning' waar iemand woont. Bij "geen vaste woonplek" en "bij iemand in, zonder te betalen" volgt de vraag of iemand zelf gas, licht of water betaalt.

#### Verblijf in een inrichting (art. 23 Pw)

Een inrichting is onder meer een instelling die slaapgelegenheid biedt met de mogelijkheid van hulp of begeleiding gedurende meer dan de helft van elk etmaal (art. 1 onder f Pw). Daar geldt de norm van art. 23, omdat huur en levensmiddelen al betaald worden. De app rekent hiermee bij de keuze "woonvorm met begeleiding":

| | 1 jan 2026 | 1 jul 2026 |
| --- | --- | --- |
| Alleenstaande (ouder): lid 1 a + verhoging lid 2 a | € 443,76 + € 47,00 | € 449,44 + € 47,00 |
| Gehuwden: lid 1 b + verhoging lid 2 b | € 690,27 + € 106,00 | € 699,11 + € 106,00 |

Geen kostendelersnorm, geen huurtoeslag; de vrijlating werkt zoals altijd. Aanname: de bewoner betaalt niets voor het verblijf, ook niet met werk. Dat klopt meestal, maar hangt af van de instelling; er is geen bron die het vastlegt, en de app zegt het bij de aannames. Leiden zet de norm om 1 maand (verblijf langer dan 6 maanden) of 3 maanden (korter) na de opname (CVDR760406, hoofdstuk 4); de app rekent met de situatie na de omzetting. Een instelling met zorg en een woonvorm met begeleiding zijn één keuze, omdat de wet voor beide dezelfde norm geeft. Een eventuele eigen bijdrage voor zorg rekent de app niet.

### 2. Kostendelersnorm

**Grondslag:** art. 19a en 22a Pw ([wetten.overheid.nl, versie 1 juli 2026](https://wetten.overheid.nl/BWBR0015703/2026-07-01)).

Norm per persoon = ((40% + A × 30%) / A) × gehuwdennorm. A = kostendelende medebewoners plus de belanghebbende en diens echtgenoot. Een kostendelende medebewoner is iemand van **27 jaar of ouder** met hoofdverblijf in dezelfde woning, behalve de partner, een commerciële (onder)huurder of kostganger (geen familie in de eerste of tweede graad) en bepaalde studerenden (art. 19a lid 1).

#### Ander inkomen en alimentatie

- **Uitkering, pensioen en ander inkomen**: het netto bedrag per maand, zoals de gebruiker het ontvangt. Telt volledig mee voor de bijstand (art. 32 Pw).
- **Partneralimentatie**: de bijstand telt middelen "na aftrek van de daarover door de belanghebbende verschuldigde loonbelasting of inkomstenbelasting" (art. 31 lid 3 Pw). Op partneralimentatie wordt geen belasting ingehouden, dus de gebruiker vult het ontvangen bedrag in en de app trekt het tarief van de eerste schijf af (35,75% in 2026). Aanname: de heffingskortingen gaan al op aan bijstand of loon. Voor de toeslagen telt partneralimentatie mee.
- **Kinderalimentatie**: telt mee voor de bijstand ([Rijksoverheid](https://www.rijksoverheid.nl/onderwerpen/bijstand/vraag-en-antwoord/welke-inkomsten-bijstand-afgetrokken)), niet voor de toeslagen: "alimentatie die u krijgt voor uw kinderen" telt niet mee voor het toetsingsinkomen ([Belastingdienst](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/kan_ik_toeslag_krijgen/inkomen/)). Daarover betaalt u geen belasting.

### 3. Verrekening van inkomsten: vrijlating

#### Tot en met 31 december 2026 (regime `pw31`)

Bron: art. 31 lid 2 onder n, r, y en lid 5 Pw ([versie 1 juli 2026](https://wetten.overheid.nl/BWBR0015703/2026-07-01)).

| Onderdeel | Regel | Bedrag 1 jan / 1 jul 2026 |
| --- | --- | --- |
| n | 25% van de inkomsten uit arbeid, ten hoogste 6 maanden (onder de AOW-leeftijd), als het college vindt dat het bijdraagt aan arbeidsinschakeling | max. € 285 / € 289 per maand |
| r | Alleenstaande ouder met volledige zorg voor een kind tot 12 jaar, na de 6 maanden van n: 12,5%, aaneengesloten ten hoogste 30 maanden | max. € 177,66 / € 180,17 |
| y | Medisch urenbeperkt: 15%, zonder maximale duur, tenzij n van toepassing is | max. € 180,19 / € 182,73 |
| lid 5 | n en r gelden **niet** voor wie jonger is dan 27 jaar | |

**Na de 6 maanden** is er geen vrijlating meer (behalve r en y). Dat betekent niet dat werken niets oplevert: de bijstand vult het netto loon aan tot de norm, dus tot de norm houdt iemand evenveel over als zonder werk. Boven de norm stopt de bijstand en houdt iemand het hele netto loon, waarin de arbeidskorting al zit. Daarnaast tellen de toeslagen en de combinatiekorting.

**Loon van de partner.** De vrijlating geldt per partner: onderdeel n geldt "voor zover hij algemene bijstand ontvangt", en gehuwden ontvangen ieder de helft van de bijstand (art. 45 lid 4). De memorie van toelichting bij de wet Breed offensief ([Kamerstuk 35394, nr. 3](https://zoek.officielebekendmakingen.nl/kst-35394-3.html)) bevestigt dat voor alle vrijlatingsregels: "wanneer beide partners onder de doelgroep vallen [heeft] iedere partner afzonderlijk recht [...] op de inkomstenvrijlating". Ook bevestigd door klantmanagers in Leiden (13 november 2026). Werkt de partner korter dan 6 maanden naast de bijstand, dan rekent de app ook voor het loon van de partner 25% vrijlating, tot het maximum, in beide kolommen en alleen in de eerste periode. Aanname: de 6 maanden van de partner lopen tegelijk met de eerste periode van het nieuwe werk. Niet onder de 27 jaar (lid 5).

#### Vanaf 1 januari 2027 (regime `pw34a`)

Bron: art. 34a en 78ff Pw ([versie 1 januari 2027](https://wetten.overheid.nl/BWBR0015703/2027-01-01)).

| Groep | Vrijlating | Duur |
| --- | --- | --- |
| Onder de AOW-leeftijd (art. 34a lid 1 a) | 15% van de inkomsten uit arbeid per maand, **geen maximumbedrag** | ten hoogste 12 aaneengesloten maanden; het college kan verlengen als uitbreiding van de arbeidsomvang niet mogelijk is (lid 2); opnieuw bij een nieuw dienstverband (lid 3) |
| Medisch urenbeperkt (lid 1 b) | 15% | geen maximale duur |
| AOW-leeftijd (lid 1 c) | 25%, tot € 226 | geen maximale duur |

De uitzondering voor jongeren onder de 27 vervalt per 2027 (art. 31 lid 5 noemt dan alleen nog de onderdelen c en k).

**Eerst toetsen aan de bijstandsnorm.** De wettekst van art. 34a noemt geen inkomensgrens, maar de memorie van toelichting wel ([Kamerstuk 36582, nr. 3](https://zoek.officielebekendmakingen.nl/kst-36582-3.html), artikelsgewijze toelichting bij art. 34a): "Bij het niet in aanmerking nemen van inkomsten uit arbeid dient eerst getoetst te worden of er een inkomen onder de bijstandsnorm is. Als het inkomen hoger is dan de bijstandsnorm eindigt het recht op bijstand en wordt niet toegekomen aan de toepassing van het nieuwe artikel 34a." De engine volgt dit: is het netto inkomen van het huishouden hoger dan de norm, dan is er vanaf 2027 geen vrijlating en geen bijstand. (Dit gold niet voor het oude onderdeel n onder het overgangsrecht.) Bij een medische urenbeperking noemde de regering in [Kamerstuk 36582, nr. 6](https://zoek.officielebekendmakingen.nl/kst-36582-6.html) nog een maximum van € 136,26; de vastgestelde wettekst (lid 1 onder b) noemt geen maximum, en die volgt de engine.

Nieuw is ook een bufferbudget van ten hoogste € 1.000 per kalenderjaar (art. 34b); dat rekent de app niet.

**Overgangsrecht (art. 78ff):**

- Lid 2: wie vóór 1 januari 2027 een vrijlating onder n had, houdt het oude onderdeel n zoals het luidde op 31 december 2026 (25%, max. € 289), gedurende ten hoogste 12 maanden na 1 januari 2027. De engine leest daarvoor de parameters op 31 december 2026. Of iemand na afloop daarvan nog de nieuwe bijverdienregeling krijgt, staat niet in de wet en niet in de memorie van toelichting of de andere Kamerstukken van dossier 36582 (op 8 november 2026 doorzocht). Art. 34a lid 1 sluit het niet uit en lid 3 maakt een nieuwe periode mogelijk bij een nieuw dienstverband. De gemeente beslist; de app rekent na de oude periode zonder vrijlating en zegt dat erbij.
- Lid 3: wie een vrijlating onder r had, krijgt voor de rest van die periode de vrijlating van art. 34a lid 1 onder a (15%, zonder maximum).

### 4. Loonheffing en heffingskortingen

Ongewijzigd ten opzichte van de vorige stand; alle waarden 2026 `geverifieerd` ([Belastingdienst, tarieven en heffingskortingen 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen)). Het netto loon wordt benaderd met een jaarberekening; zie ADR 0004. Waarden 2027: na aanneming van het Belastingplan (december 2026).

**Kosten voor het werk.** Reiskosten en andere werkkosten die iemand zelf betaalt, gaan niet van het inkomen af dat met de bijstand wordt verrekend: art. 31 en 32 Pw ([versie 1 juli 2026](https://wetten.overheid.nl/BWBR0015703/2026-07-01)) noemen de inkomsten uit arbeid en de vrijlatingen, maar geen aftrek van kosten. De app toont de kosten daarom als aparte post onder "Wat eraf gaat". Een reiskostenvergoeding van de werkgever telt de app niet mee als inkomen voor de bijstand en toont die als aparte post onder "Wat er binnenkomt". Een reiskostenvergoeding is een doelverstrekking en telt daarom niet mee als inkomen voor de bijstand. Dat is bevestigd door klantmanagers in Leiden (13 november 2026, was V13). Een officiële bron met deze tekst moet nog worden toegevoegd.

**Geschat jaarinkomen voor de toeslagen.** Bruto loon per jaar inclusief vakantiegeld, plus de bijstand (en ander inkomen) teruggerekend naar bruto: het bruto bedrag waarbij na belasting en algemene heffingskorting het netto bedrag overblijft. Omdat loon ook arbeidskorting krijgt en bijstand niet, hoort bij hetzelfde netto bedrag aan bijstand een hoger bruto bedrag dan aan loon. Daardoor kan het geschatte jaarinkomen dalen als iemand gaat werken, terwijl het netto inkomen stijgt. De terugrekening is een schatting; de gemeente gebruikt de loonheffingstabellen (open vraag V8). De app toont beide delen onder "Hoe is dit berekend?".

**Bijstand van partners.** Bij partners betaalt de gemeente ieder de helft van de bijstand, tenzij ze samen vragen om alles aan één van hen te betalen ([Participatiewet, art. 45 lid 4](https://wetten.overheid.nl/BWBR0015703/2026-07-01)). De app rekent daarom voor het geschatte jaarinkomen ieder zijn helft terug naar bruto, met een eigen algemene heffingskorting. Ander inkomen telt bij één van de partners.

**Combinatiekorting.** De inkomensafhankelijke combinatiekorting gaat af van de belasting over het hele inkomen in box 1, dus over loon, bijstand en ander inkomen samen, na de algemene heffingskorting en de arbeidskorting. De app rekent de bijstand daarvoor terug naar bruto. De korting is niet hoger dan die belasting.

**Ander inkomen.** De app vraagt of het huishouden ander inkomen heeft dan bijstand en loon (alimentatie, een andere uitkering, pensioen) en zo ja het netto bedrag per maand. Dat telt volledig mee als inkomen voor de bijstand (art. 32 lid 1 Pw), zonder vrijlating, in beide situaties. Voor de toeslagen wordt het naar bruto omgerekend alsof het een uitkering is; kinderalimentatie telt bij Dienst Toeslagen niet mee, en dat staat bij de aannames. Kinderalimentatie vraagt de app niet bij ander inkomen, maar bij de kinderen, met de vraag "Krijgt u kinderalimentatie voor deze kinderen?" (zie BESLUITEN.md, besluit 16).

**Afdruk.** De afdruk toont boven de uitkomst wat de gebruiker heeft ingevuld (huishouden, woning, werk) en laat de bediening en de uitleg per onderdeel weg, zodat invoer en uitkomst samen op één of twee A4'tjes passen.

**Geboortedatum en opvanguren.** De app vraagt de geboortedatum van de gebruiker, de partner en de kinderen (dag, maand, jaar) en rekent daarmee de leeftijd op de rekendatum uit; de engine rekent met die leeftijd in hele jaren. Bij de kinderopvang kan iemand hoogstens 230 uur per kind per maand invullen (parameter `kot.max_uren_per_maand`), net als in de Proefberekening van Dienst Toeslagen.

**Wie al werkt, hoe lang al.** De app vraagt wie al werkt of dat korter is dan 6 maanden of 6 maanden of langer. Bij 6 maanden of langer is de eerste vrijlating (art. 31 lid 2 onder n, ten hoogste zes maanden) voorbij: de app rekent dan nu én straks met de periode daarna, ook bij ander of extra werk, en toont geen keuze voor de periode. Wie al werkt en opvang heeft, krijgt de vraag of het kind nu al naar de opvang gaat; zo ja, dan tellen de opvangkosten, de kinderopvangtoeslag en de vergoeding ook bij "Nu" (veld `opvangNu`).

**Overgangsrecht 2027 in het scherm.** De vraag "Mocht u in december 2026 al een deel van uw loon houden?" verschijnt pas als de normen voor 2027 bekend zijn. Tot die tijd is proefpersoon Lotte alleen via de engine te toetsen, niet via het scherm.

**Vakantiegeld.** De gebruiker vult het loon in zoals in het contract, zonder vakantiegeld. De app telt het wettelijke minimum erbij: 8% van het brutoloon (art. 15 lid 1 Wet minimumloon en minimumvakantiebijslag; parameter `wml.vakantiebijslag`). In de opbouwtabel staat het netto loon per maand inclusief vakantiegeld, gemiddeld over 12 maanden, net als de bijstand inclusief vakantietoeslag. Bij een uurloon vraagt de app of het vakantiegeld er al in zit (all-in); dan telt ze het niet nog eens. Weet de gebruiker het niet, dan rekent ze met vakantiegeld erbij en zegt dat erbij.

**Wie al werkt.** De app vraagt wat er verandert: meer uren bij het huidige werk (zelfde uurloon, nieuw totaal aantal uren), ander werk in plaats van het huidige, of werk erbij. Bij werk erbij telt het loon van beide banen op en wordt de belasting over het totaal berekend, zoals bij de aangifte; op de loonstroken kan het anders verdeeld zijn, omdat één werkgever de heffingskortingen toepast.

### 5. Zorgtoeslag

Zorgtoeslag per jaar = standaardpremie (× 2 met toeslagpartner) − normpremie; normpremie = normpercentage × drempelinkomen + 13,73% × (toetsingsinkomen − drempelinkomen), het tweede deel niet negatief. 2026: standaardpremie € 2.119, drempelinkomen € 29.736, normpercentage 1,912% / 4,289%. Bron: [Dienst Toeslagen, Berekening zorgtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_zorgtoeslag_tg0821z62fd.pdf). Vermogensgrens 2026: € 146.011 / € 184.633 (aanname in de app: eronder).

### 6. Huurtoeslag

Grondslag: Wet op de huurtoeslag (versie 1 januari 2026), Besluit op de huurtoeslag art. 7, Regeling huurtoeslaggrenzen 2026 (Stcrt. 2025, 39783). Rekenwijze volgens de 7 stappen van [Dienst Toeslagen, Berekening huurtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf):

1. Rekenhuur = kale huur, ten hoogste € 932,93. **Servicekosten tellen sinds 2026 niet meer mee.**
2. Basishuur € 202,52 (één persoon) of € 200,71 (meer personen); sinds 2026 niet meer afhankelijk van het inkomen.
3. Deel A: rekenhuur boven de basishuur tot € 498,20, 100%.
4. Deel B: tot de aftoppingsgrens (€ 713,02 bij 1–2 personen, € 764,14 bij 3 of meer), 65%. Deel C: daarboven tot € 932,93, 40%.
5. Rekeninkomen: toetsingsinkomens van alle bewoners (kinderen onder 23: boven € 6.218).
6. Correctie: (rekeninkomen − minimum-inkomensijkpunt) × 27% (één persoon) of 22% (meer personen) / 12. Ijkpunt 2026: € 23.425 / € 31.500.
7. A + B + C − correctie, naar beneden afgerond.

Getoetst aan de rekenvoorbeelden 2 en 3 uit de brochure (zie `packages/rekenkern/test/officieel.test.ts`) en aan vijf proefberekeningen.

**Zelfstandige woning:** huurtoeslag is er alleen voor een zelfstandige woonruimte: een eigen toegangsdeur die op slot kan, een eigen keuken en wc, en sinds 1 maart 2024 een eigen douche of bad ([Dienst Toeslagen, Kan ik huurtoeslag krijgen?](https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen)). Antwoordt de gebruiker dat de woning dat niet heeft, dan rekent de app zonder huurtoeslag en zegt dat erbij. Voor sommige onzelfstandige woningen kan wel huurtoeslag gelden; die uitzondering rekent de app niet.

**Huisgenoten en kinderen (medebewoners):** het toetsingsinkomen van iedereen die op het adres staat ingeschreven, behalve de partner en een onderhuurder, telt mee in het rekeninkomen (Awir art. 1 en 7, Wht art. 7; brochure stap 5), en elke bewoner telt mee voor het aantal personen. Leeftijd maakt daarbij niet uit; alleen voor inwonende kinderen jonger dan 23 telt het inkomen pas boven € 6.218 per jaar. De app vraagt bij 'Uw woning' naar huisgenoten van 27 jaar of ouder (ook nodig voor de kostendelersnorm) en van 18 tot 27 jaar (alleen voor de huurtoeslag), en naar het jaarinkomen van de huisgenoten samen. Het inkomen van een kind van 18 jaar of ouder vraagt de app per kind, het hele bedrag; de app trekt zelf € 6.218 af bij een kind dat aan het begin van het jaar jonger is dan 23. Studiefinanciering telt niet mee ([Belastingdienst, Mijn kind woont thuis en verdient geld](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/huurtoeslag/uw-inkomen-is-niet-te-hoog-voor-de-huurtoeslag/ik-heb-thuiswonende-kinderen-met-inkomen)). Weet de gebruiker een inkomen niet, dan rekent de app zonder dat inkomen en zegt onder de tabel dat de huurtoeslag lager kan zijn. Getoetst aan een proefberekening met één medebewoner (proefpersoon Wim).

### 7. Kindgebonden budget

2026: € 2.580 per kind, alleenstaande ouder bij één kind € 5.996 (dus € 3.416 extra), + € 724 (12–15 jaar), + € 964 (16–17 jaar); afbouw 7,6% boven € 29.736 (zonder partner) of € 39.141 (met partner). Bron: [Dienst Toeslagen, Berekening kindgebonden budget 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf). Let op: rekenvoorbeeld 2 in die brochure noemt in de tekst € 510 per maand, maar de eigen berekening komt op € 533,56; de engine volgt de berekening.

### 8. Kinderbijslag

Inkomensonafhankelijk; telt niet mee voor de bijstand (art. 31 lid 2 b Pw) en beïnvloedt het verschil dus niet. Per kind per kwartaal, eerste en tweede kwartaal 2026: € 295,07 / € 358,30 / € 421,53; derde en vierde kwartaal: € 298,40 / € 362,35 / € 426,29 (0–5, 6–11, 12–17 jaar). Bron: [SVB](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag). De app toont een derde van het kwartaalbedrag per maand, in beide situaties gelijk.

### 9. Kinderopvangtoeslag

Toeslag per kind = uren (max. 230 per maand) × min(uurprijs, maximum) × percentage uit de tabel. Maxima 2026: dagopvang € 11,23, bso € 9,98, gastouder € 8,49. Eerste kind = kind met de meeste uren. Per jaar ten hoogste het aantal gewerkte maanden × 230 uur (bij twee ouders: de ouder die het minst werkt). Tabel en voorbeelden: [Dienst Toeslagen, Berekening kinderopvangtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf).

Kinderopvangtoeslag is er alleen als de ouder en de partner allebei werken of een opleiding, inburgeringscursus of traject naar werk volgen ([Dienst Toeslagen, Kan ik kinderopvangtoeslag krijgen?](https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen)). Werkt de partner niet, dan rekent de app de toeslag en de kosten van de opvang niet mee en meldt dat in de uitkomst.

Weet de gebruiker de uurprijs niet, dan rekent de app met het maximum voor de soort opvang en zegt dat erbij. **Vergoeding van de eigen bijdrage (Leiden).** Blijft er na de toeslag een eigen bijdrage over, dan rekent de app een vergoeding van de gemeente mee (bijzondere bijstand, [Beleidsregels bijzondere bijstand 2022](https://lokaleregelgeving.overheid.nl/CVDR677687), art. 7 lid 1 onder f: "in ieder geval" komt in aanmerking "de eigen bijdrage in de kosten van formele kinderopvang, wanneer deze kosten noodzakelijk zijn voor werk"). De voorwaarde is dus dat de opvang nodig is om te kunnen werken. De app gaat ervan uit dat de aanvraag wordt toegekend, en zegt in de uitkomst wanneer de gemeente vergoedt, dat het ook geldt zonder bijstand, en dat de vergoeding aangevraagd moet worden. Berekening per maand:

1. Eigen bijdrage = kosten van de opvang − kinderopvangtoeslag.
2. Norm (art. 1 onder d): de bijstandsnorm zonder kostendelersnorm, met een verlaging op grond van art. 27; voor een alleenstaande ouder 90% van de gezinsnorm. Zonder vakantietoeslag: × (1 − 5%) (art. 19 lid 3 Pw).
3. Inkomen: netto loon (en dat van de partner) zonder vakantiegeld (benaderd als gemiddeld netto / 1,08) plus de bijstand zonder vakantietoeslag. Toeslagen tellen niet mee.
4. Draagkracht (art. 6 lid 2): niets tot 110% van de norm; 20% van het inkomen tussen 110% en 130%; 50% tussen 130% en 150%; 100% daarboven.
5. Vergoeding = eigen bijdrage − draagkracht, niet lager dan nul.

De gemeente stelt de draagkracht vast voor een jaar vanaf de aanvraag (art. 6 lid 1); de app rekent met het maandinkomen in de gekozen situatie.

### 10. Overgangsmaanden en terugbetalen van toeslagen

Toeslagen zijn een voorschot op het verwachte jaarinkomen. Wie gaat werken en zijn inkomen niet doorgeeft, krijgt te veel en moet dat na de definitieve berekening terugbetalen. De app toont per toeslag hoeveel lager die met werk wordt en wat dat na een jaar werk betekent (`terugbetaalrisico` in de uitkomst). 

### 11. Leiden

| Regeling | Wat vaststaat | Bron |
| --- | --- | --- |
| Verkorte aanvraag ('Garantieknop') | Nieuwe aanvraag binnen 12 maanden na het einde van de bijstand, als die stopte door werk, een uitsluitingsgrond of studie; de gemeente gebruikt bekende gegevens als woonadres, gezin, inkomen en vermogen niet zijn veranderd | [Beleidsregels inkomensvoorzieningen Leiden 2026, hoofdstuk 3](https://lokaleregelgeving.overheid.nl/CVDR760197) |
| Individuele inkomenstoeslag | € 462 (alleenstaande), € 577 (alleenstaande ouder), € 635 (gehuwden), één keer per 12 maanden; 23 jaar of ouder; 5 jaar inkomen tot 100% van de bijstandsnorm. De bedragen bevestigen artikel 4 van de verordening uit 2020 (€ 400 / € 500 / € 550, geïndexeerd); de afwijkende toelichting bij die verordening is niet bepalend | [leiden.nl](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/individuele-inkomenstoeslag/) |
| Sleutelpas en Kindtegoed | Twee aparte meldingen, elk met een eigen grens. Gratis pas en Kindtegoed tot 130% van het WSM; Kindtegoed per jaar € 150 (0–3), € 350 (4–11), € 550 (12–17); tussen 130% en 140% wel Kindtegoed, geen gratis pas. WSM = een vaste norm per soort huishouden, zonder kostendelersnorm, zoals in de tabellen van de gemeente: alleenstaand (ook eenoudergezin) of gehuwden; alleenstaand in een instelling de norm van art. 23 lid 1 zonder verhoging. Voor een paar in een instelling noemt de gemeente geen bedrag; de app geeft dan geen melding | [Beleidsregels Kindtegoed en armoederegelingen Sleutelpas 2026](https://lokaleregelgeving.overheid.nl/CVDR747564) |
| Premies bij werk | In de Re-integratieverordening 2023 staat alleen een premie bij een participatieplaats (€ 220 per 6 maanden), geen uitstroompremie. De landelijke vrijlating bij medische urenbeperking (onder y) geldt ook in Leiden | [Re-integratieverordening Participatiewet 2023 Leiden](https://lokaleregelgeving.overheid.nl/CVDR706023) |
| Draagkracht bijzondere bijstand | Geen draagkracht tot 110% van de bijstandsnorm (exclusief vakantietoeslag); daarboven 20% van het meerinkomen tot 130%, 50% tussen 130% en 150%, 100% boven 150% | [Beleidsregels bijzondere bijstand 2022, art. 6](https://lokaleregelgeving.overheid.nl/CVDR677687) |
| Gemeentepolis (collectieve zorgverzekering) | Voor inwoners met een inkomen tot 120% van het sociaal minimum; dezelfde tabel als het Volwassenenfonds. De app meldt of het inkomen met werk onder of boven die grens ligt; ze rekent geen bedrag | [Gemeente Leiden, Collectieve aanvullende zorgverzekering](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/collectieve-aanvullende-zorgverzekering/) |
| Zwemabonnement | Tot 120% van de bijstandsnorm kan de gemeente een seizoenabonnement voor zwembad De Vliet of De Zijl vergoeden. De app meldt of het inkomen met werk onder of boven die grens ligt | [Beleidsregels bijzondere bijstand 2022, art. 12](https://lokaleregelgeving.overheid.nl/CVDR677687) |
| Volwassenenfonds Sport & Cultuur | Voor volwassenen met een inkomen tot 120% van het sociaal minimum: een sport of culturele activiteit tot € 250 per jaar, aan te vragen via een tussenpersoon. De app meldt of het inkomen met werk onder of boven die grens ligt; ze rekent geen bedrag | [Gemeente Leiden, Hulp bij kosten sport en cultuur](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/hulp-bij-kosten-sport-en-cultuur/) |
| Kwijtschelding gemeentelijke belastingen | Voor onder meer afvalstoffenheffing en rioolheffing; kosten van bestaan 100% van de bijstandsnorm. De app meldt, als de bijstand door het werk stopt, dat de kwijtschelding kan vervallen; ze rekent geen bedrag | [Verordening kwijtschelding gemeentelijke belastingen Leiden 2025](https://lokaleregelgeving.overheid.nl/CVDR733112) |
| Gratis OV-pas | Voor inwoners van 18 jaar of ouder met een inkomen tot en met 100% van het sociaal minimum; niet voor studenten en niet voor dak- of thuislozen. Geldig op werkdagen van 9.00 tot 16.00 uur en na 18.30 uur, in het weekend en op feestdagen de hele dag. Het aantal passen is beperkt. De app meldt de pas en dat hij vervalt als de bijstand stopt; ze rekent geen bedrag | [Gemeente Leiden, Gratis openbaar vervoer](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/gratis-openbaar-vervoer/) |
| Eigen bijdrage kinderopvang (SMI) | Tot 110% van de bijstandsnorm volledig vergoed | idem |
| Eigen bijdrage kinderopvang (werk, scholing, participatie) | Bijzondere bijstand kan worden verleend als de kosten een belemmering zijn voor werk, scholing of een participatietraject. Eigen bijdrage = werkelijke kosten min kinderopvangtoeslag | idem |

**Welk inkomen telt voor de regelingen.** De gemeente toetst aan de norm van de klant. Zolang iemand bijstand krijgt, vult de bijstand het inkomen aan tot de norm: ander inkomen, zoals alimentatie, gaat er al van af, en het deel van het loon dat iemand door de vrijlating mag houden, telt niet mee. Het inkomen dat telt, is dan de norm, en die ligt altijd onder de grens. De app meldt daarom bij bijstand dat de regeling nog kan, en zegt dat het vrijgelaten deel niet meetelt. Zonder bijstand vergelijkt de app het hele netto inkomen (loon, ander inkomen en alimentatie) met de grens. Dit is de praktijk van de gemeente Leiden, bevestigd door klantmanagers (13 november 2026). Het geldt voor de Sleutelpas, het Kindtegoed, de Gemeentepolis, het zwemabonnement en Sport en cultuur. Voor de individuele inkomenstoeslag staat het ook in de verordening (zie deel 4, Opgelost, was V18).

**Grensbedragen met vakantiegeld.** De meldingen noemen elke inkomensgrens "netto per maand, met vakantiegeld", en vergelijken die met het inkomen van de gebruiker, ook met vakantiegeld (loon met het vakantiegeld over 12 maanden verdeeld, bijstand met vakantietoeslag). De tabellen van de gemeente noemen bedragen zonder vakantiegeld, bijvoorbeeld € 1.618,18 voor een alleenstaande bij 120%. Het bedrag in de app is daarom ongeveer 5% hoger (€ 1.703). De vergelijking is gelijk: grens en inkomen staan op dezelfde manier. Het inkomen zonder vakantiegeld kan de app niet exact uitrekenen, omdat de belasting over het loon van het hele jaarinkomen afhangt.

**Meldingen in dezelfde zinnen.** Boven de grens: "Met dit inkomen krijgt u … niet meer." Eronder: "Met dit inkomen kunt u … nog krijgen." Boven de grens is het antwoord zeker; eronder gelden ook andere voorwaarden die de app niet kent.

### 12. Onafhankelijke toetsing

- `packages/rekenkern/test/officieel.test.ts`: de rekenvoorbeelden van Dienst Toeslagen voor huurtoeslag, zorgtoeslag, kindgebonden budget en kinderopvangtoeslag 2026.
- `testgevallen/` en [PROEFPERSONEN.md](PROEFPERSONEN.md): fictieve huishoudens met officiële vergelijkingswaarden waar die er zijn, waaronder drie ingevulde proefberekeningen van Dienst Toeslagen (8 november 2026: Fatima en Youssef, Bram, Sanne 24 uur). Alle negen bedragen kwamen tot op de euro overeen.
- `packages/rekenkern/test/eigenschappen.test.ts`: de vorm van de wet (geen sprongen, dalend waar het moet).

## Deel 2. Leidengeldwijzer: voorwaarden per regeling

Welke regelingen iemand in Leiden kan krijgen. Alleen officiële bronnen. Stand: 23 november 2026.

**Let op.** De citaten hieronder zijn kort overgenomen van de bronpagina's. Voordat een voorwaarde in een regelbestand komt, wordt de volledige letterlijke tekst nagelezen op de bron, zoals bij Leidenwerkt.

Tekens in de kolom Status: ✓ uit de bron, ? nog uitzoeken, ! vraag voor de praktijk.

### Landelijke toeslagen

| Regeling | Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- | --- |
| Zorgtoeslag | Vermogen op 1 januari 2026 | "niet hoger is dan € 146.011"; met toeslagpartner "maximaal € 184.633" | ✓ | [Belastingdienst, maximaal vermogen zorgtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-vermogen-zorgtoeslag) |
| Zorgtoeslag | Vermogen van kinderen | Vermogen van een kind jonger dan 18 telt mee, van 18 of ouder niet | ✓ | idem |
| Kindgebonden budget | Vermogen 2026 | "maximaal € 146.011 vermogen hebben als u geen toeslagpartner hebt" en "€ 184.633 als u wel een toeslagpartner hebt" | ✓ | [Belastingdienst, maximaal vermogen kindgebonden budget](https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget) |
| Huurtoeslag | Vermogen 2026 | "niet hoger is dan € 38.479"; met toeslagpartner "maximaal € 76.958"; "Ook medebewoners mogen niet meer dan € 38.479 aan vermogen hebben" | ✓ | [Belastingdienst, maximaal vermogen huurtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/maximaal-vermogen-huurtoeslag) |
| Zorgtoeslag en kindgebonden budget | Vermogen vanaf 2027 | Zonder toeslagpartner "maximaal € 119.122", met toeslagpartner "maximaal € 158.748" (bericht van 15 oktober 2026) | ✓ | [Belastingdienst, lagere vermogensgrenzen vanaf 2027](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/berichten/nieuws/toeslagen/lagere-vermogensgrenzen-zorgtoeslag-kindgebonden-budget-vanaf-1-januari-2027) |
| Alle toeslagen | Inkomen en bedragen | Rekenregels zitten al in de rekenkern van Leidenwerkt, met bronnen | ✓ | regels/landelijk |
| Kinderopvangtoeslag | Wie het kan krijgen | Zie de tabel "Kinderopvangtoeslag: wie kan het krijgen" hieronder | ✓ | [Wet kinderopvang art. 1.6](https://wetten.overheid.nl/BWBR0017017/2026-01-01) |
| Huurtoeslag | Vermogen 2027 | Nog niet gepubliceerd (gezocht op 21 november 2026) | ? | |

### Regelingen van de gemeente Leiden

De gemeente noemt op [Hulp bij laag inkomen](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/): gratis openbaar vervoer, individuele inkomenstoeslag, bijzondere bijstand, hulp bij kosten sport en cultuur, hulp bij kosten schoolgaande kinderen, tegemoetkoming voor alleenverdieners, studietoeslag, zwemabonnement voor de zomer, kwijtschelding van belastingen, betalingsregeling belastingen, collectieve aanvullende zorgverzekering, energiecoach en hulp bij geldzaken.

#### Sleutelpas en Kindtegoed

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Wie | Inwoner van Leiden met een BSN (art. 2.1) | ✓ | [Beleidsregels Sleutelpas 2026, CVDR744950](https://lokaleregelgeving.overheid.nl/CVDR744950/1) |
| Inkomen | Het (gezins)inkomen "niet hoger is dan 130% van het Wettelijk Sociaal Minimum (WSM)" (art. 2.3 a). Of: toegelaten tot de WSNP, of deelname aan een schuldregeling van de gemeente (art. 2.3 b en c) | ✓ | idem |
| Welk inkomen | "netto maandinkomen zoals bedoeld in artikel 32 van de Participatiewet (PW) onder verwijzing naar artikel 31 PW, met uitzondering van artikel 31 lid 2 PW." (art. 4.3 a). Art. 31 lid 2 Pw noemt wat "Niet tot de middelen" hoort, onder meer kinderbijslag (b), toeslagen (d) en de vrijlatingen (n, r, y). Die tellen dus niet mee. Dat past bij de praktijk die op 13 november is bevestigd. Een maand met vakantiegeld, eindejaarsuitkering of bonus telt niet mee (art. 4.3 b) | ✓ | [Gemeenteblad 2025, 429670](https://zoek.officielebekendmakingen.nl/gmb-2025-429670.html), [Participatiewet art. 31](https://wetten.overheid.nl/BWBR0015703/2026-07-01#Hoofdstuk3_Paragraaf3.4_Artikel31) |
| Vermogen | Geen vermogensgrens. Alleen bij ondernemers gelden privé-onttrekkingen als vermogen (art. 4.3 c) | ✓ | idem |
| Uitgesloten | Detentie of instelling, geen geldig verblijfsrecht (behalve azc), studenten met studiefinanciering of tegemoetkoming (behalve met een kind ten laste en inkomen tot 130%), sommige EU-studenten en studievergunningen (art. 2.2) | ✓ | idem |
| Automatisch | Wie bijstand, IOAW, IOAZ of Bbz krijgt, krijgt de pas zonder aanvraag (art. 3.1) | ✓ | idem |
| Kindtegoed | Voor kinderen tot 18 met kinderbijslag (of pleegkindvergoeding) op hetzelfde adres. € 150 (0 t/m 3), € 350 (4 t/m 11), € 550 (12 t/m 17) (art. 1.1 d, 2.2) | ✓ | [Beleidsregels Kindtegoed en armoederegelingen Sleutelpas 2026, CVDR747564](https://lokaleregelgeving.overheid.nl/CVDR747564/1) |
| Kindtegoed tussen 130% en 140% | Wel Kindtegoed, geen gratis Sleutelpas (art. 4.1 a) | ✓ | idem |
| Volwassenentegoed | "Inwoners met een inkomen tot 120% van het WSM komen in aanmerking voor een Volwassenentegoed" (art. 3.4 a). Boven de 18 jaar aanvragen bij het Volwassenenfonds Sport en Cultuur (art. 3.4 c). "Het maximale tegoed dat het Volwassenenfonds kan toekennen is €250,-" (art. 3.4 e). Het Volwassenentegoed en het Volwassenenfonds zijn dus één regeling | ✓ | [Gemeenteblad 2025, 508798](https://zoek.officielebekendmakingen.nl/gmb-2025-508798.html) |
| Aanvullend Kindtegoed | Wijziging van 27 oktober 2026: per aanvraag hoogstens € 350 schoolspullen, € 350 fiets, € 480 tussenschoolse opvang, € 500 sport, € 600 cultuur, alleen als het Kindtegoed niet genoeg is | ✓ (aanvullend, niet automatisch) | [Gemeenteblad 2026, 496852](https://zoek.officielebekendmakingen.nl/gmb-2026-496852.pdf) |

#### Individuele inkomenstoeslag

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Woonplaats | "U woont in Leiden." | ✓ | [Gemeente Leiden, individuele inkomenstoeslag](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/individuele-inkomenstoeslag) |
| Leeftijd | "U bent 23 jaar of ouder, maar u hebt nog niet de AOW-leeftijd bereikt." Volgens de verordening telt de periode van 5 jaar vanaf 18 jaar, dus 23 jaar. De bedragen noemen "21 jaar tot de pensioengerechtigde leeftijd" | ✓ (bevestigd in de praktijk, 21 november 2026) | idem |
| Inkomen | 5 jaar of langer "een inkomen hebt van maximaal 100% van de geldende bijstandsnorm" | ✓ | idem |
| Vermogen | Op de peildatum "geen in aanmerking te nemen vermogen heeft als bedoeld in artikel 34 van de Participatiewet" (toelichting bij de verordening). Dat is de vermogensgrens van de bijstand: alleenstaande € 8.000, alleenstaande ouder € 16.000, gehuwden samen € 16.000 (art. 34 lid 3 Pw) | ✓ | [Gemeenteblad 2019, 316445](https://zoek.officielebekendmakingen.nl/gmb-2019-316445.html), [Participatiewet art. 34](https://wetten.overheid.nl/BWBR0015703/2026-07-01) |
| Uitgesloten | Studie met studiefinanciering of tegemoetkoming in de afgelopen 5 jaar, een verlaging van de bijstand omdat iemand niet genoeg werk zocht, of de toeslag al gekregen in de afgelopen 12 maanden | ✓ | idem |
| Bedrag | Alleenstaande € 462, alleenstaande ouder € 577, gehuwden € 635 | ✓ | idem |

#### Tegemoetkoming voor alleenverdieners

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Wie | In Leiden, met een fiscale partner. Het grootste inkomen is een uitkering van UWV (bijvoorbeeld Wajong). Netto inkomen lager dan 100% van het sociaal minimum, en minder dan met alleen bijstand | ✓ | [Gemeente Leiden, tegemoetkoming voor alleenverdieners](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/tegemoetkoming-voor-alleenverdieners) |
| Vermogen | "Uw vermogen is niet hoger dan mag voor de zorgtoeslag." | ✓ | idem |
| Bedrag | "In 2026 is de tegemoetkoming € 1.100,00." Eén keer per jaar | ✓ | idem |

#### Volwassenenfonds Sport & Cultuur

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Inkomen | "tot 120% van het sociaal minimum". Netto per maand zonder vakantiegeld: alleenstaand 18 tot 21 € 399,48, alleenstaand 21 tot AOW € 1.618,18, getrouwd of samenwonend 21 tot AOW € 2.311,68, alleenstaand in een instelling € 512,36, alleenstaand AOW € 1.809,57, getrouwd of samenwonend AOW € 2.480,75 | ✓ | [Gemeente Leiden, hulp bij kosten sport en cultuur](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/hulp-bij-kosten-sport-en-cultuur/) |
| Vermogen | Niet genoemd | ? | idem |
| Bedrag | Een sport- of cultuuractiviteit tot € 250 per jaar, via een tussenpersoon | ✓ | idem |

#### Jeugdfonds Sport & Cultuur, zwemles

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Inkomen | "maximaal 140% van het sociaal minimum". Netto per maand zonder vakantiegeld: eenoudergezin 21 tot AOW € 1.864,00, eenoudergezin AOW € 2.081,04, tweeoudergezin 21 tot AOW € 2.662,83, tweeoudergezin AOW € 2.851,73 | ✓ | idem |
| Leeftijd | Kinderen vanaf 5 jaar | ✓ | idem |
| Bedrag | Zwemdiploma A helemaal, B of C € 250 | ✓ | idem |

#### Gratis openbaar vervoer

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Wie | "U woont in Leiden", 18 jaar of ouder, geen student, niet dak- of thuisloos | ✓ | [Gemeente Leiden, gratis openbaar vervoer](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/gratis-openbaar-vervoer/) |
| Inkomen | "maximaal 100% van het sociaal minimum", of een bijstandsuitkering | ✓ | idem |
| Vermogen | "Het maakt niet uit hoe hoog uw vermogen is." | ✓ | idem |

#### Studietoeslag

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Wie | In Leiden of Leiderdorp, 15 jaar of ouder, studiefinanciering of tegemoetkoming schoolkosten, geen Wajong, door ziekte of een blijvende medische beperking niet kunnen bijverdienen | ✓ | [Gemeente Leiden, studietoeslag](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/studietoeslag) |
| Wet | Art. 36b Pw: voor wie "als rechtstreeks gevolg van een ziekte of gebrek structureel niet in staat is naast de studie inkomsten te verwerven", met studiefinanciering of een tegemoetkoming (WTOS) en zonder Wajong. De minimale hoogte staat in een algemene maatregel van bestuur | ✓ | [Participatiewet art. 36b](https://wetten.overheid.nl/BWBR0015703/2026-07-01) |
| Samen met bijstand | Wie jonger is dan 27 en studiefinanciering kan krijgen, heeft geen recht op algemene bijstand (art. 13 lid 2 c Pw). Studietoeslag en bijstand gaan dus in de regel niet samen | ✓ | idem |
| Bedrag | Wettelijk minimum per maand sinds 1 juli 2026: 21 jaar en ouder € 390,07, 20 jaar € 312,06, 19 jaar € 234,05, 18 jaar € 195,04, 17 jaar € 154,08, 16 jaar € 134,58, 15 jaar € 117,03 (art. 7a) | ✓ | [Besluit loonkostensubsidie en minimumbedragen studietoeslag Participatiewet 2021](https://wetten.overheid.nl/BWBR0044894/2026-07-01) |
| Bedrag op de site van de gemeente | "geldig vanaf 1 januari 2024", 21 jaar en ouder € 352,80. Dat is lager dan het wettelijke minimum van nu | ! de pagina van de gemeente is verouderd | [Gemeente Leiden, studietoeslag](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/studietoeslag) |

#### Gemeentepolis (collectieve aanvullende zorgverzekering)

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Inkomen | "voor inwoners van Leiden met een inkomen tot 120% van het sociaal minimum", dezelfde tabel als het Volwassenenfonds. Zzp'ers: jaarinkomen tot € 18.567,29 (alleenstaand) of € 26.524,66 (samenwonend). Jongeren van 18 tot 21 zonder steun van hun ouders: tot € 1.057,08 | ✓ | [Gemeente Leiden, collectieve aanvullende zorgverzekering](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/collectieve-aanvullende-zorgverzekering/) |
| Vermogen | Niet genoemd | ✓ (geen grens op de pagina) | idem |
| Aanvragen | Nieuwe klanten tussen 12 november en 31 december. Wie al bij Zorg en Zekerheid verzekerd is, op elk moment | ✓ | idem |

#### Sleutelpas met kindtegoed, de bedragen van de gemeente

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Inkomen 130% | Netto per maand zonder vakantiegeld: eenoudergezin 21 tot AOW € 1.753,04, eenoudergezin AOW € 1.960,36, tweeoudergezin 21 tot AOW € 2.504,32, tweeoudergezin AOW € 2.687,48 | ✓ | [Gemeente Leiden, hulp bij kosten schoolgaande kinderen](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/hulp-bij-kosten-schoolgaande-kinderen/) |
| Laptop | Een voucher op de Sleutelpas: kinderen van 4 t/m 11 één laptop per huishouden per 5 jaar, kinderen van 12 t/m 17 elk een laptop per 5 jaar | ✓ | idem |

#### Kinderopvangtoeslag: wie kan het krijgen

| Voorwaarde | Uit de bron | Status | Bron |
| --- | --- | --- | --- |
| Ouder | Aanspraak als de ouder onder meer: werkt (art. 1.6 lid 1 a), bijstand krijgt en "gebruik maakt van een voorziening gericht op arbeidsinschakeling" (c), jonger dan 18 is, een opleiding volgt en bijstand krijgt of kan krijgen (e), als werkzoekende zonder uitkering bij UWV staat en een traject volgt (f), inburgert met een cursus (g), met een WW-uitkering scholing of een traject volgt (h), of "is ingeschreven bij een school of instelling" voor voortgezet onderwijs, vavo, mbo of hoger onderwijs (j) | ✓ | [Wet kinderopvang art. 1.6](https://wetten.overheid.nl/BWBR0017017/2026-01-01) |
| Partner | Met een partner moet ook de partner werken, of in een van die situaties zijn (art. 1.6 lid 3) | ✓ | idem |
| Na stoppen met werk | Nog drie kalendermaanden dezelfde aanspraak (art. 1.6 lid 5) | ✓ | idem |

Gevolg voor de app: de vraag naar opvang hoort bij werk, studie, traject naar werk en inburgering. Leidenwerkt rekent alleen met werk. De nieuwe app kan de andere situaties noemen als reden om kinderopvangtoeslag te bekijken.

Leidengeldwijzer (24 november 2026): werkt of studeert iemand niet (geen loon, geen eigen bedrijf, geen studiefinanciering), dan staat de kinderopvangtoeslag bij "waarschijnlijk niet". De tekst noemt wie het is: u, uw partner of allebei. En de uitzonderingen: inburgering of een traject naar werk (art. 1.6 lid 1 en 3), en met een partner ook zorg uit de Wet langdurige zorg (art. 1.6 lid 8). Daar vraagt Leidengeldwijzer niet naar. Besluit 35.

#### Zwemabonnement voor de zomer

Kan nu niet worden aangevraagd (13 april tot en met 31 juli). De grens van 120% van de bijstandsnorm staat al in de regels van Leidenwerkt (Beleidsregels bijzondere bijstand 2022, art. 12). [Gemeente Leiden, zwemabonnement](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/zwemabonnement-voor-de-zomer/)

#### Toegevoegd op 22 november 2026

| Regeling | Wat Leidengeldwijzer doet | Bron |
| --- | --- | --- |
| Kinderbijslag | Alleen bij kinderen jonger dan 18 voor wie iemand nog geen kinderbijslag krijgt. Bedrag per kwartaal uit de tabel van de SVB. Hangt niet af van het inkomen | [SVB, Wat is kinderbijslag](https://www.svb.nl/nl/kinderbijslag/wat-is-kinderbijslag/wat-is-kinderbijslag) |
| Kinderopvang bij sociale of medische problemen | "Misschien" bij een kind jonger dan 13. Leidengeldwijzer vraagt niet naar klachten | [Gemeente Leiden](https://gemeente.leiden.nl/inwoners-en-ondernemers/zorg-en-onderwijs/kinderopvang/kinderopvang-bij-sociale-of-medische-problemen/), [Geldzaken](https://geldzaken.leiden.nl/regeling/kinderopvang-bij-sociale-of-medische-problemen/) |
| Kwijtschelding | "Misschien" tot het sociaal minimum. BSGR rekent het zelf uit | [Geldzaken](https://geldzaken.leiden.nl/regeling/kwijtschelding-of-geld-terugkrijgen/) |
| Bijzondere bijstand | "Misschien" tot 150% van de bijstandsnorm. Maatwerk | [Geldzaken](https://geldzaken.leiden.nl/regeling/bijzondere-bijstand-als-het-echt-nodig-is/) |
| Goed om te weten | Goede Buur Spreekuur, Stadsbank, Voedselbank. Voor iedereen | [Geldzaken](https://geldzaken.leiden.nl/) |

#### Mensen met de AOW-leeftijd (toegevoegd op 22 november 2026)

| Onderwerp | Wat Leidengeldwijzer doet | Uit de bron | Bron |
| --- | --- | --- | --- |
| AOW-leeftijd | Uit de geboortedatum. Geboren tot en met 31 december 1960: 67 jaar. Geboren van 1 januari 1961 tot en met 30 september 1964: 67 jaar en 3 maanden. Later geboren: nog niet vastgesteld, Leidengeldwijzer telt dan als "geen AOW-leeftijd" | "1 March 1957 up to and including 31 December 1960: 67 years. 1 January 1961 up to and including 30 September 1964: 67 years and 3 months." Rijksoverheid: 2026 en 2027 67 jaar, 2028 tot en met 2032 67 jaar en 3 maanden | [SVB, Your AOW pension age](https://www.svb.nl/en/aow-pension/aow-pension-age/your-aow-pension-age), [Rijksoverheid, AOW-leeftijd](https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/algemene-ouderdomswet-aow/aow-leeftijd) |
| Sociaal minimum | Norm van art. 22 Pw: alleenstaande (ouder) € 1.587,34, gehuwden € 2.176,10. Ook als maar één van een stel de AOW-leeftijd heeft (art. 22 c, de ander 21 jaar of ouder). Kostendelers: art. 22a met de norm van art. 22 b. In een instelling: grens onbekend, dus "misschien" | "Voor belanghebbenden die de pensioengerechtigde leeftijd hebben bereikt is de norm per kalendermaand, indien het betreft: a. een alleenstaande of een alleenstaande ouder zonder kostendelende medebewoners: € 1.587,34; …" | [Participatiewet art. 22 en 22a](https://wetten.overheid.nl/BWBR0015703/2026-07-01/0) |
| Controle met de gemeente | 120% × 95% × € 1.587,34 = € 1.809,57 en 120% × 95% × € 2.176,10 = € 2.480,75. Dat zijn precies de bedragen "Alleenstaand, AOW-leeftijd" en "Getrouwd of samenwonend, AOW-leeftijd" in de tabel. Ook 130%: € 1.960,36 en € 2.687,48 | ✓ | [Gemeente Leiden, hulp bij kosten sport en cultuur](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/hulp-bij-kosten-sport-en-cultuur/) |
| AIO-aanvulling | In plaats van de bijstand van de gemeente. Zelfde toets: inkomen onder de norm van art. 22, geld en bezit onder de grens van art. 34 Pw. Ook als de partner de AOW-leeftijd nog niet heeft | "U krijgt een AIO-aanvulling als u: de AOW-leeftijd heeft in Nederland woont geen AOW of geen volledige AOW krijgt geen of weinig andere inkomsten heeft niet te veel vermogen heeft" en "U kunt dan misschien AIO-aanvulling krijgen als: uw partner nog geen AOW heeft …" | [SVB, Kijk of u een AIO-aanvulling krijgt](https://www.svb.nl/nl/aio/kijk-of-u-een-aio-aanvulling-krijgt) |
| Sleutelpas | Met een AIO-aanvulling: waarschijnlijk wel, niet vanzelf. De AIO-aanvulling komt van de SVB, dus de gemeente kent die niet. Leidengeldwijzer zegt: vraag de pas aan en stuur de laatste maandspecificatie mee | Art. 3.1 noemt "Een algemene bijstandsuitkering ontvangen vanuit de Participatiewet" en "Een uitkering ontvangen vanuit de IOAW, IOAZ of Bbz", en die inwoners moeten bij de gemeente "als zodanig bekend zijn". De toelichting bij art. 4.3 noemt AIO apart bij de aanvraag: "is het voldoende om de meest recente maandspecificatie aan te leveren" | [Beleidsregels Sleutelpas 2026](https://zoek.officielebekendmakingen.nl/gmb-2025-429670.html) |
| Individuele inkomenstoeslag | Met de AOW-leeftijd: nee. Ook als alleen de partner de AOW-leeftijd heeft: een stel telt als één geheel. Beiden moeten voldoen aan art. 36 lid 1 Pw, en dat artikel noemt "jonger dan de pensioengerechtigde leeftijd" (toelichting bij art. 4 van de Verordening individuele inkomenstoeslag Leiden 2020: "Voldoet één van hen niet aan deze voorwaarden, dan bestaat voor beiden geen recht op individuele inkomenstoeslag."). Er is geen vergelijkbare toeslag voor mensen met AOW: voor hen geldt een hogere norm | "U bent 23 jaar of ouder, maar u hebt nog niet de AOW-leeftijd bereikt." en "Bent u AOW-gerechtigd? Dan geldt voor u een hogere bijstandsnorm […] komt u niet in aanmerking voor de individuele inkomenstoeslag." | [Gemeente Leiden, individuele inkomenstoeslag](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/individuele-inkomenstoeslag/), [Rijksoverheid](https://www.rijksoverheid.nl/themas/werk/pensioen/vraag-en-antwoord/participatiewet/individuele-inkomenstoeslag) |
| Gratis OV-pas | Zoals voor iedereen: 18 jaar of ouder, tot 100% van het sociaal minimum. De pagina noemt geen grens voor de leeftijd | ✓ | [Gemeente Leiden, gratis openbaar vervoer](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/gratis-openbaar-vervoer/) |
| Toeslagen | Met AOW en pensioen: met een bedrag. Leidengeldwijzer rekent het bruto inkomen terug uit het netto bedrag per maand, met de tarieven en kortingen voor wie de AOW-leeftijd heeft en de ingehouden bijdrage Zvw (4,85%). Het vakantiegeld van de AOW is een vast bedrag per maand (€ 104,78 alleenstaand, € 74,85 per persoon samen). Bij een deel van de AOW telt hetzelfde deel van het vakantiegeld. Controle: netto € 1.581,55 geeft precies bruto € 1.662,16, zoals bij de SVB. Met loon, een uitkering van UWV, een eigen bedrijf of ander inkomen erbij: "misschien", met de proefberekening. AIO-aanvulling: het inkomen is de norm van art. 22 Pw | "Bedrag per maand vanaf 1 juli 2026 met loonheffingskorting Brutobedrag AOW € 1.662,16 Af: loonheffing € 0,00 Af: bijdrage Zvw (4,85%) € 80,61 Nettobedrag AOW € 1.581,55" | [SVB, Bedragen AOW](https://www.svb.nl/nl/aow/bedragen-aow/aow-bedragen), [Belastingdienst, tarieven 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen), [Heffingskortingen voor AOW-gerechtigden](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/heffingskortingen_voor_aow_gerechtigden), [Percentages bijdrage Zvw](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/percentages-zvw) |
| Huurtoeslag | Dezelfde berekening als voor iedereen. Uitgezocht op 23 november 2026 in de wet zelf (versie 1 januari 2026): de berekening (art. 16, 17, 20 en 21) maakt alleen onderscheid tussen een eenpersoons- en een meerpersoonshuishouden. Art. 14 noemt nog een norminkomen voor een "eenpersoonsouderenhuishouden" (€ 28.089,78) en een "meerpersoonsouderenhuishouden" (€ 37.183,99), maar geen artikel van de berekening gebruikt dat nog: art. 18 en 19 zijn "[Vervallen per 01-01-2026]". Het minimum-inkomensijkpunt komt zelf wel uit de AOW: "het bedrag van het bruto- ouderdomspensioen voor de pensioengerechtigde […] vermeerderd met het bedrag van de bruto-vakantie-uitkering" (art. 17 lid 1) | "Voor elk rekeninkomen boven het minimum-inkomensijkpunt, bedoeld in artikel 17, wordt, per type huishouden […] verlaagd met […] 27% voor eenpersoonshuishoudens, of 22% voor meerpersoonshuishoudens." (art. 21 lid 2) ✓ | [Wet op de huurtoeslag, versie 1 januari 2026](https://wetten.overheid.nl/BWBR0008659/2026-01-01), [Rijksoverheid, huurtoeslagparameters 2026](https://www.rijksoverheid.nl/actueel/nieuws/2025/11/25/indexering-inkomensgrenzen-woningcorporaties-maximale-huurprijsgrenzen-en-huurtoeslagparameters-2026) |
| Wie "alleenstaand" is voor de AOW | Leidengeldwijzer kijkt alleen naar een partner. Woont iemand samen met een andere volwassene (geen kind of ouder), dan krijgt die soms de AOW voor samenwonenden. Dat vraagt Leidengeldwijzer niet. Besluit 22 in docs/BESLUITEN.md zegt waarom | Bewuste keuze | |
| Vermogen AIO | Leidengeldwijzer gebruikt de grens van art. 34 Pw (€ 8.000 / € 16.000). De pagina van de SVB noemt "€ 6.505" en "€ 13.010". Dat zijn de grenzen van 2022 ("Alleenstaande € 6.505,--", "Gehuwden € 13.010,--" per 1 juli 2022, normen gemeente Nijkerk). De pagina is dus verouderd | ✓ | [SVB, Inkomsten en vermogen](https://www.svb.nl/nl/aio/hoeveel-aio-aanvulling-krijgt-u/uw-inkomsten-en-vermogen) |

#### Toeslag van UWV (Toeslagenwet, toegevoegd op 23 november 2026)

| Onderwerp | Wat Leidengeldwijzer doet | Uit de bron | Bron |
| --- | --- | --- | --- |
| Wanneer | Alleen als iemand (nog niet met de AOW-leeftijd) een uitkering van UWV heeft | "U ontvangt een uitkering van UWV." "U bent 18 jaar of ouder. En u heeft nog niet de AOW-leeftijd." | [UWV, Wanneer recht op toeslag](https://www.uwv.nl/nl/toeslag/wanneer-recht-op-toeslag) |
| Grens | Sociaal minimum van UWV, bruto per maand: stel € 2.337,00, alleenstaande € 1.669,31, woningdeler € 1.086,20, 20 jaar € 1.308,26, 19 jaar € 957,44, 18 jaar € 781,91. Leidengeldwijzer rekent het bruto inkomen terug uit het netto inkomen (zoals voor de toeslagen) en haalt er 8% vakantiegeld af. Onder de grens: "misschien", nooit "ja", want UWV rekent met het bruto inkomen per dag. Boven de grens: "nee" | "Uw totale bruto-inkomen is lager dan het sociaal minimum." Tabel: zie de bron | [UWV, Sociaal minimum](https://www.uwv.nl/nl/toeslag/sociaal-minimum) |
| Partner na 1971 | Nee, behalve met een kind jonger dan 12 | "U bent getrouwd of woont samen met een partner die is geboren na 31 december 1971. En er wonen geen kinderen bij u die jonger zijn dan 12 jaar." | [UWV, Wanneer recht op toeslag](https://www.uwv.nl/nl/toeslag/wanneer-recht-op-toeslag) |
| Niet gevraagd | Jonger dan 21 en bij de ouders wonen, vrijwillig verzekerd, Ziektewet via de werkgever, minder loon bij ziekte. Leidengeldwijzer vraagt dit niet. Besluit 24 in docs/BESLUITEN.md zegt waarom | Bewuste keuze | |

#### Wat u nodig heeft voor de aanvraag (toegevoegd op 23 november 2026)

Per regeling een korte lijst, alleen uit de bron van de organisatie die de regeling geeft (geraadpleegd op 23 november 2026). De citaten staan in `packages/rekenkern/src/citaten.ts` (`meenemen…`), de teksten in `packages/rekenkern/src/regelingen/meenemen.ts`. Zie ook besluit 33.

| Regeling | Bron |
| --- | --- |
| Sleutelpas | Beleidsregels Sleutelpas 2026, art. 4.3 en toelichting: drie maandspecificaties, of één bij onder meer bijstand, AIO, AOW, WIA en Wajong; ondernemers de aangifte van vorig jaar |
| Laptop | gemeente.leiden.nl, Hulp bij kosten schoolgaande kinderen: de voucher op de Sleutelpas, via het Goede Buur Spreekuur |
| Gratis OV-pas | gemeente.leiden.nl, Gratis openbaar vervoer: brief met vouchercode, of DigiD |
| Individuele inkomenstoeslag, tegemoetkoming alleenverdieners | gemeente.leiden.nl: de documenten bij een aanvraag per post. Online met DigiD |
| Studietoeslag | gemeente.leiden.nl, Studietoeslag: bewijsstukken |
| Kinderopvang bij sociale of medische problemen | gemeente.leiden.nl: documenten bij de aanvraag |
| Kwijtschelding | gemeente.leiden.nl, Kwijtschelding van belastingen: "Meesturen" |
| Bijstand | gemeente.leiden.nl, Bijstandsaanvraag voorbereiden: "Dit hebt u altijd nodig" |
| Zorgtoeslag, kindgebonden budget, huurtoeslag, kinderopvangtoeslag | belastingdienst.nl, "Hoe moet ik … aanvragen?": aanvraag voorbereiden |

Geen lijst bij de AIO-aanvulling, de toeslag van UWV, de Gemeentepolis, het Volwassenenfonds, zwemles, bijzondere bijstand en kinderbijslag: de bronnen noemen geen papieren.

#### Nog uitzoeken

- **Huurtoeslag:** vermogensgrens 2027. Op 21 november 2026 nog niet gevonden. Het bericht van Dienst Toeslagen over 2027 noemt alleen zorgtoeslag en kindgebonden budget. Opnieuw kijken in december, samen met de andere bedragen van 2027.

### Vragen voor de praktijk

1. **Studietoeslag:** gelden de bedragen van 2024 nog? Zelf nagezocht: het wettelijke minimum is sinds 1 juli 2026 hoger (€ 390,07 voor 21 jaar en ouder). De pagina van de gemeente noemt nog € 352,80. Vraag: past de gemeente de pagina aan?
2. **Sleutelpas met een schuldregeling (art. 2.3):** de tekst is "a. inkomen tot 130% …, en; b. toegelaten tot de Wsnp. c. schuldregeling (MSNP)". Leidengeldwijzer leest a, b en c als drie losse mogelijkheden. Wie een schuldregeling bij de Stadsbank Leiden heeft of in de Wsnp zit, krijgt de Sleutelpas dan ook met een inkomen boven 130%. Leidengeldwijzer vraagt sinds 22 november niet meer naar een schuldregeling. Bij een inkomen boven de grens staat nu: "Heeft u een schuldregeling? Dan kunt u de Sleutelpas misschien toch krijgen." Vraag: klopt deze lezing in de praktijk? Zo niet, dan past Leidengeldwijzer de uitkomst aan.
3. **Jongeren van 18, 19 en 20 jaar:** de gemeente noemt alleen bij 120% een bedrag voor een alleenstaande van 18 tot 21 jaar (€ 399,48, de jongerennorm van art. 20 Pw). Leidengeldwijzer gebruikt dezelfde norm ook voor de Sleutelpas (130%) en de OV-pas (100%). Vraag: rekent de gemeente zo? En welke norm geldt voor jongeren zonder steun van hun ouders (de pagina van de Gemeentepolis noemt € 1.057,08)?
4. **Kindtegoed bij co-ouderschap:** de regel zegt "voor wie kinderbijslag wordt ontvangen" (art. 1.1 d). Er staat niet door wie. Bij co-ouderschap krijgt vaak één ouder de kinderbijslag. Leidengeldwijzer vraagt: "Krijgt u kinderbijslag?" Wie Nee kiest, ziet bij het Kindtegoed "waarschijnlijk niet". Vraag: kan de ouder zonder kinderbijslag het Kindtegoed krijgen, als het kind ook bij die ouder woont?
5. **Kostendelersnorm bij de grenzen van 120%, 130% en 140%:** de bijstand en de inkomenstoeslag gaan uit van de "toepasselijke bijstandsnorm". Daar hoort de kostendelersnorm bij (art. 22a Pw). Leidengeldwijzer gebruikt die sinds 22 november. De tabellen van de gemeente voor de Sleutelpas, het Volwassenenfonds, de Gemeentepolis en de OV-pas noemen alleen alleenstaanden en stellen. Leidengeldwijzer gebruikt daar dus de norm van het huishouden. Vraag: rekent de gemeente bij deze regelingen met de kostendelersnorm, als er meer volwassenen in huis wonen?

## Deel 3. Leidengeldwijzer: welke vragen, en waarom

### Wat Leidengeldwijzer niet vraagt, en waarom (22 november 2026)

Uitgangspunt: zo weinig vragen als kan, maar een concrete uitslag gaat voor. "Misschien" is in beginsel geen wenselijke uitslag. Een vraag blijft dus als ze de uitslag van een regeling concreet maakt. Een vraag valt weg als ze alleen een tip of het moment van aanvragen bepaalt.

Berekenjerecht.nl stelt deze vragen wel. Leidengeldwijzer niet:

| Vraag bij berekenjerecht.nl | Waarom zij die stellen | Wat Leidengeldwijzer doet |
| --- | --- | --- |
| Zorgpremie per maand, betaalde partneralimentatie, inkomen van medebewoners | Ze rekenen kwijtschelding en bijzondere bijstand helemaal uit. Daarvoor zijn de vaste lasten nodig | "Misschien" bij kwijtschelding en bijzondere bijstand. BSGR en de gemeente rekenen het zelf uit. Een eigen berekening kan later, als de regels in officiële bronnen te vinden zijn |
| Bent u zwanger of heeft u een baby? Heeft u moeite met boodschappen? Wilt u hulp bij geldzaken? | Ze kiezen daarmee welke tips u ziet (Stichting Babyspullen, voedselbank, hulp bij geldzaken) | Geen vraag. De tips staan voor iedereen onder "Goed om te weten". Stichting Babyspullen staat er niet in (besluit 28) |
| Wilt u overstappen naar de Gemeentepolis? | Het gaat over de keuze van de inwoner, niet over het recht | De kaart noemt wanneer u zich kunt aanmelden |
| Heeft u een aanslag ontvangen? | Kwijtschelding vraagt u aan na de aanslag. Dat gaat over het moment, niet over het recht | De kaart noemt hoe u het aanvraagt |
| Maak je gebruik van een schuldhulptraject? | Met een schuldregeling of in de Wsnp kunt u de Sleutelpas krijgen, ook boven 130% | Geen vraag meer (weggehaald op 22 november). Bij een inkomen boven de grens zegt de Sleutelpas: "Heeft u een schuldregeling? Dan kunt u de Sleutelpas misschien toch krijgen." |

Deze vragen blijven wel, omdat ze de uitslag concreet maken: kinderbijslag (Kindtegoed), 5 jaar of langer een laag inkomen (inkomenstoeslag), ziekte of handicap naast de studie (studietoeslag) en welke uitkering (Wajong en de studietoeslag, alleen gevraagd bij studiefinanciering met een uitkering van UWV).

### Huisgenoten en kinderopvang (22 november 2026)

- **Woont er nog iemand anders bij u? Ja**, in een huurwoning: Leidengeldwijzer vraagt hoeveel mensen dat zijn en hun bruto inkomen per jaar samen, met "Ik weet dit inkomen niet". Zo rekent Leidengeldwijzer de huurtoeslag uit (art. 7 Wet op de huurtoeslag). Hun geld en bezit vraagt Leidengeldwijzer niet. Het overzicht zegt dat.
- **Kinderen van 18 jaar of ouder**, in een huurwoning: hun bruto inkomen per jaar, met "Ik weet dit inkomen niet". Jonger dan 23 op 1 januari: de vrijstelling van de huurtoeslag. Zelfde vragen als Leidenwerkt.
- **Kinderen jonger dan 13**: gaat dit kind naar de opvang? Zo ja: soort, uren per week en prijs per uur (leeg: de hoogste prijs waarover u toeslag krijgt). Zelfde vragen als Leidenwerkt. Werken of studeren alle ouders? Dan rekent Leidengeldwijzer de kinderopvangtoeslag uit. Anders: misschien (bijvoorbeeld met inburgering of een traject naar werk).
- **Heeft u al 5 jaar of langer een laag inkomen?** De uitleg noemt nu het bedrag van de bijstand voor het huishouden (sociaal minimum zonder vakantiegeld), niet "de bijstand". "Minimuminkomen" is bewust niet gebruikt: veel mensen denken dan aan het minimumloon, en dat is hoger.

### Bijstand en schulden (22 november 2026)

- **Bijstand**: "waarschijnlijk wel" als het inkomen onder de bijstand ligt, het geld en bezit onder de grens, en Leidengeldwijzer de norm kent: een huurwoning of een kamer, 21 jaar of ouder, geen eigen bedrijf. Bij een koopwoning (de overwaarde telt mee), bij iemand in huis, zonder vaste woonplek of met een eigen bedrijf: "misschien".
- **Schulden ingevuld**: de kaart "Hulp bij schulden" staat dan bij wat u waarschijnlijk kunt krijgen, in het blok van de gemeente. De Stadsbank helpt inwoners van Leiden met schulden. De zin "Er zijn geen voorwaarden" staat er bewust niet: in de praktijk zijn er wel voorwaarden.

## Deel 4. Open vragen

Stand: 13 november 2026. Per vraag staat wat ontbreekt en waar het te vinden is.

### Wacht op officiële bevestiging

Beantwoord door klantmanagers in Leiden, maar nog niet in een officieel document. Zodra dat er is: bron toevoegen en hier weghalen.

| # | Vraag | Antwoord uit de praktijk | Wat ontbreekt |
| --- | --- | --- | --- |
| G1 | Krijgt iemand die in 2027 het overgangsrecht van onderdeel n gebruikt daarna nog de nieuwe bijverdienregeling (art. 34a)? | De gemeente beslist (bevestigd 13 november 2026). De app neemt aan van niet en zegt dat de gebruiker het bij de gemeente moet vragen | Officiële documentatie. Wet, memorie van toelichting en de andere Kamerstukken van dossier 36582 zeggen het niet (doorzocht op 8 november 2026). Geen datum bekend |
| R1 | Welk inkomen telt voor de Sleutelpas, het Kindtegoed, de Gemeentepolis, het zwemabonnement en Sport en cultuur? | De gemeente toetst aan de norm van de klant. Met bijstand telt de norm: alimentatie gaat al van de bijstand af, het vrijgelaten deel van het loon telt niet mee. Zonder bijstand telt het hele netto inkomen (bevestigd 13 november 2026). Zo rekent de app | Een beleidsregel of verordening van Leiden waarin het inkomensbegrip voor deze regelingen staat |
| V13 | Telt een reiskostenvergoeding van de werkgever mee als inkomen voor de bijstand? | Nee: het is een doelverstrekking (bevestigd 13 november 2026). Zo rekent de app al | Een officiële bron met deze tekst (wet, beleidsregel of uitspraak) |

### Uit te zoeken

| # | Onderwerp | Wat ontbreekt | Waar te vinden |
| --- | --- | --- | --- |
| V1 | Bijstandsnormen 1 januari 2027 | Bedragen | Staatscourant-mededeling "gewijzigde bedragen per 1 januari 2027", verwacht begin december 2026 (de bewaking meldt het) |
| V2 | Belasting 2027 | Schijven, heffingskortingen, arbeidskorting | Belastingdienst na aanneming Belastingplan 2027 |
| V3 | Toeslagen 2027 | Standaardpremie, drempelinkomen, huurtoeslaggrenzen, kindgebonden budget | Staatscourant / brochures Dienst Toeslagen 2027 |
| V4 | Kinderopvangtoeslag 2027 | Tabel en maximum uurprijzen zijn gepubliceerd in **Stb. 2026, 308** (besluit van 3 oktober 2026); nog verwerken. Ook de **Wet van 1 juli 2026** tot wijziging van de Wet kinderopvang (Stb. 2026, 184; inwerkingtreding Stb. 2026, 253) nalezen op gevolgen voor de berekening | officielebekendmakingen.nl |
| V5 | Kostendelersnorm 2027 | Art. 19a en 22a in de versie per 1 januari 2027 nalezen (nu `onbevestigd`, overgenomen van 2026) | wetten.overheid.nl/BWBR0015703/2027-01-01 |
| V6 | Verrekening per 2027 | Uniform verrekenen, verrekening vakantiegeld, bufferbudget (art. 34b, max. € 1.000 per jaar); de app rekent dit niet | Regeling Participatiewet, IOAW en IOAZ (versie 2027) |
| V14 | Jongeren onder 27 vlak voor 2027 | De uitkomst toont voor wie jonger is dan 27 alleen 2026 (geen vrijlating). Vanaf 1 januari 2027 mag die persoon wel een deel houden (art. 34a). Zodra de normen voor 2027 officieel zijn (V1), nagaan of de uitkomst ook een bedrag vanaf januari 2027 kan tonen. Geen bedrag tonen zolang de normen onbekend zijn | Staatscourant, begin december 2026 |

### Opgelost

- **Individuele inkomenstoeslag en vrijgelaten loon** (was V18): wie door de vrijlating meer dan de norm verdient, kan de individuele inkomenstoeslag nog steeds aanvragen. Bevestigd uit de praktijk, en zo staat het ook in de Verordening individuele inkomenstoeslag Leiden 2020 (CVDR634399, art. 1): inkomen is het inkomen van art. 32 Pw plus de algemene bijstand, en art. 32 telt alleen de middelen die volgens art. 31 meetellen. Het vrijgelaten loon telt dus niet mee.
- **Leeftijd individuele inkomenstoeslag** (was V11): de wet noemt 21 jaar (art. 36 lid 1 Pw), maar de Leidse verordening laat de referteperiode van vijf jaar ingaan op de achttiende verjaardag. Wie er aan voldoet, is dus minstens 23. De app gebruikt 23, zoals leiden.nl.
- **Netto loon** (was V7): de inhouding van de app is vergeleken met de witte maandtabel loonheffing 2026 (Belastingdienst, uitgave januari 2026) bij negen lonen van € 954 tot € 3.501 per maand. Verschil hoogstens € 0,18 per maand. Toets: `packages/rekenkern/test/loonheffingstabellen.test.ts`.
- **Bruto bijstand voor het toetsingsinkomen** (was V8): de terugrekening van netto naar bruto is vergeleken met de groene maandtabel loonheffing 2026 (uitkeringen) bij acht bedragen van € 729 tot € 2.502. De app vindt het bruto bedrag terug op hoogstens € 0,15 na. Toets: `packages/rekenkern/test/loonheffingstabellen.test.ts`. Een gemeente kan de vakantietoeslag anders uitbetalen; het jaarbedrag verandert daardoor niet.
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
