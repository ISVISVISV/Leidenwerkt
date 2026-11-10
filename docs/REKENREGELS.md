# Rekenregels Leidenwerkt

Stand: 8 november 2026. De waarden staan in `regels/`; dit document beschrijft de rekenwijze, de grondslag en de bronnen. De statustabel hieronder wordt gegenereerd uit de YAML-bestanden (`npm run docs`), zodat er één bron van waarheid is.

## Statussen

| Status | Betekenis | Gevolg in de app |
| --- | --- | --- |
| `geverifieerd` | Officiële bron zelf geopend, waarde letterlijk overgenomen | Normaal gebruikt |
| `onbevestigd` | Waarde nog niet in de definitieve officiële publicatie nagelezen | Gebruikt, met zichtbare markering |
| `ontbrekend` | Geen betrouwbare waarde gevonden | Onderdeel wordt niet berekend |

Alleen officiële bronnen tellen: wetten.overheid.nl, officielebekendmakingen.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, leiden.nl. De CI controleert dit (zie `scripts/bouw-regels.ts`).

## Status per onderwerp en jaar

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

## Bronvermelding in de app

Bij de vrijlating, de gebruikte regels en elke melding toont de app de naam van de bron. Aanwijzen, Tab of tikken toont de letterlijke tekst, met een link naar de officiële bron. Teksten met bedragen staan bij de parameter in de regeldata (`citaat`), zodat ze per periode kloppen; teksten zonder bedragen staan in `packages/engine/src/citaten.ts`.

## Data tegenover mechanisme

- Een **gewijzigd bedrag** is regeldata: een nieuw YAML-bestand met een nieuwe `geldig_van`.
- Een **gewijzigd mechanisme** (voorwaarden, uitzonderingen, rekenvolgorde) is code. Voor de verrekening van inkomsten met de bijstand staat dat in `packages/engine/src/regimes.ts` (welk regime geldt op welke datum) en `packages/engine/src/modules/vrijlating.ts` (de regels per regime, inclusief overgangsrecht). De regimekeuze hangt alleen af van de rekendatum.

## Afronding

De engine rekent met `decimal.js` en rondt niet tussentijds af, met deze uitzondering:

- **Toeslagen per maand**: naar beneden afgerond op hele euro's. Dit staat in alle vier de brochures "Berekening … 2026" van Dienst Toeslagen ("Bedrag afronden naar beneden op hele euro's"; rekenvoorbeelden zorgtoeslag € 129,20 → € 129, huurtoeslag € 492,03 → € 492).
- **Toetsingsinkomen voor de kinderopvangtoeslagtabel**: in hele euro's, omdat de tabel per hele euro loopt (van € 24.150 tot € 25.756).
- Bijstand en netto loon: geen tussentijdse afronding gevonden in de wet; afronding alleen bij weergave. De werkgever gebruikt loonheffingstabellen, die zelf afronden; daardoor kan de loonstrook een paar euro afwijken.

## 1. Bijstandsnorm

**Grondslag:** artikelen 20, 21, 22 en 22a Participatiewet. Normen worden per 1 januari en 1 juli aangepast aan het netto minimumloon (art. 38 Pw) en gepubliceerd in de Staatscourant.

| | 1 jan 2026 | 1 jul 2026 | 1 jan 2027 |
| --- | --- | --- | --- |
| Alleenstaande (ouder), 21 tot AOW (art. 21 a) | € 1.401,50 | € 1.419,46 | verwacht begin december 2026 |
| Gehuwden, beiden 21 tot AOW (art. 21 b) | € 2.002,13 | € 2.027,79 | idem |

Bron: [Rijksoverheid, hoogte bijstandsuitkering](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering).

### Lagere norm bij geen of lage woonkosten (Leiden)

Grondslag: art. 27 Pw en de [Beleidsregels Vermogen en Algemene Bijstandsnorm bij lage woonkosten of verblijf in inrichting 2026](https://lokaleregelgeving.overheid.nl/CVDR760406), art. 3.1 (geldend vanaf 14 april 2026). Alleen bij de norm van art. 21, dus niet bij de kostendelersnorm. De verlaging is een deel van de gehuwdennorm:

| Situatie | Verlaging |
| --- | --- |
| Zelf geen woonkosten (geen vaste woonplek, of iemand anders betaalt de woonkosten langer dan 6 maanden) | 10% |
| Woonkosten lager dan 10% van de gehuwdennorm | het verschil |
| Zelf geen woonlasten (gas, elektriciteit, water) | 9% |
| Geen woonkosten en geen woonlasten | 19% |

De app vraagt bij 'Uw woning' waar iemand woont. Bij "geen vaste woonplek" en "bij iemand in, zonder te betalen" volgt de vraag of iemand zelf gas, licht of water betaalt.

### Verblijf in een inrichting (art. 23 Pw)

Een inrichting is onder meer een instelling die slaapgelegenheid biedt met de mogelijkheid van hulp of begeleiding gedurende meer dan de helft van elk etmaal (art. 1 onder f Pw). Daar geldt de norm van art. 23, omdat huur en levensmiddelen al betaald worden. De app rekent hiermee bij de keuze "woonvorm met begeleiding":

| | 1 jan 2026 | 1 jul 2026 |
| --- | --- | --- |
| Alleenstaande (ouder): lid 1 a + verhoging lid 2 a | € 443,76 + € 47,00 | € 449,44 + € 47,00 |
| Gehuwden: lid 1 b + verhoging lid 2 b | € 690,27 + € 106,00 | € 699,11 + € 106,00 |

Geen kostendelersnorm, geen huurtoeslag; de vrijlating werkt zoals altijd. Aanname: de bewoner betaalt niets voor het verblijf, ook niet met werk (volgens de praktijk in Leiden). Leiden zet de norm om 1 maand (verblijf langer dan 6 maanden) of 3 maanden (korter) na de opname (CVDR760406, hoofdstuk 4); de app rekent met de situatie na de omzetting. Een instelling met zorg en een woonvorm met begeleiding zijn één keuze, omdat de wet voor beide dezelfde norm geeft. Een eventuele eigen bijdrage voor zorg rekent de app niet.

## 2. Kostendelersnorm

**Grondslag:** art. 19a en 22a Pw ([wetten.overheid.nl, versie 1 juli 2026](https://wetten.overheid.nl/BWBR0015703/2026-07-01)).

Norm per persoon = ((40% + A × 30%) / A) × gehuwdennorm. A = kostendelende medebewoners plus de belanghebbende en diens echtgenoot. Een kostendelende medebewoner is iemand van **27 jaar of ouder** met hoofdverblijf in dezelfde woning, behalve de partner, een commerciële (onder)huurder of kostganger (geen familie in de eerste of tweede graad) en bepaalde studerenden (art. 19a lid 1).

## 3. Verrekening van inkomsten: vrijlating

### Tot en met 31 december 2026 (regime `pw31`)

Bron: art. 31 lid 2 onder n, r, y en lid 5 Pw ([versie 1 juli 2026](https://wetten.overheid.nl/BWBR0015703/2026-07-01)).

| Onderdeel | Regel | Bedrag 1 jan / 1 jul 2026 |
| --- | --- | --- |
| n | 25% van de inkomsten uit arbeid, ten hoogste 6 maanden (onder de AOW-leeftijd), als het college vindt dat het bijdraagt aan arbeidsinschakeling | max. € 285 / € 289 per maand |
| r | Alleenstaande ouder met volledige zorg voor een kind tot 12 jaar, na de 6 maanden van n: 12,5%, aaneengesloten ten hoogste 30 maanden | max. € 177,66 / € 180,17 |
| y | Medisch urenbeperkt: 15%, zonder maximale duur, tenzij n van toepassing is | max. € 180,19 / € 182,73 |
| lid 5 | n en r gelden **niet** voor wie jonger is dan 27 jaar | |

**Na de 6 maanden** is er geen vrijlating meer (behalve r en y). Dat betekent niet dat werken niets oplevert: de bijstand vult het netto loon aan tot de norm, dus tot de norm houdt iemand evenveel over als zonder werk. Boven de norm stopt de bijstand en houdt iemand het hele netto loon, waarin de arbeidskorting al zit. Daarnaast tellen de toeslagen en de combinatiekorting.

### Vanaf 1 januari 2027 (regime `pw34a`)

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

## 4. Loonheffing en heffingskortingen

Ongewijzigd ten opzichte van de vorige stand; alle waarden 2026 `geverifieerd` ([Belastingdienst, tarieven en heffingskortingen 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen)). Het netto loon wordt benaderd met een jaarberekening; zie ADR 0004. Waarden 2027: na aanneming van het Belastingplan (december 2026).

**Ander inkomen.** De app vraagt of het huishouden ander inkomen heeft dan bijstand en loon (alimentatie, een andere uitkering, pensioen) en zo ja het netto bedrag per maand. Dat telt volledig mee als inkomen voor de bijstand (art. 32 lid 1 Pw), zonder vrijlating, in beide situaties. Voor de toeslagen wordt het naar bruto omgerekend alsof het een uitkering is; kinderalimentatie telt bij Dienst Toeslagen niet mee, en dat staat bij de aannames.

**Afdruk.** De afdruk toont boven de uitkomst wat de gebruiker heeft ingevuld (huishouden, woning, werk) en laat de bediening en de uitleg per onderdeel weg, zodat invoer en uitkomst samen op één of twee A4'tjes passen.

**Geboortedatum en opvanguren.** De app vraagt de geboortedatum van de gebruiker, de partner en de kinderen (dag, maand, jaar) en rekent daarmee de leeftijd op de rekendatum uit; de engine rekent met die leeftijd in hele jaren. Bij de kinderopvang kan iemand hoogstens 230 uur per kind per maand invullen (parameter `kot.max_uren_per_maand`), net als in de Proefberekening van Dienst Toeslagen.

**Wie al werkt, hoe lang al.** De app vraagt wie al werkt of dat korter is dan 6 maanden of 6 maanden of langer. Bij 6 maanden of langer is de eerste vrijlating (art. 31 lid 2 onder n, ten hoogste zes maanden) voorbij: de app rekent dan nu én straks met de periode daarna, ook bij ander of extra werk, en toont geen keuze voor de periode. Wie al werkt en opvang heeft, krijgt de vraag of het kind nu al naar de opvang gaat; zo ja, dan tellen de opvangkosten, de kinderopvangtoeslag en de vergoeding ook bij "Nu" (veld `opvangNu`).

**Overgangsrecht 2027 in het scherm.** De vraag "Mocht u in december 2026 al een deel van uw loon houden?" verschijnt pas als de normen voor 2027 bekend zijn. Tot die tijd is proefpersoon Lotte alleen via de engine te toetsen, niet via het scherm.

**Vakantiegeld.** De gebruiker vult het loon in zoals in het contract, zonder vakantiegeld. De app telt het wettelijke minimum erbij: 8% van het brutoloon (art. 15 lid 1 Wet minimumloon en minimumvakantiebijslag; parameter `wml.vakantiebijslag`). In de opbouwtabel staat het netto loon per maand inclusief vakantiegeld, gemiddeld over 12 maanden, net als de bijstand inclusief vakantietoeslag. Bij een uurloon vraagt de app of het vakantiegeld er al in zit (all-in); dan telt ze het niet nog eens. Weet de gebruiker het niet, dan rekent ze met vakantiegeld erbij en zegt dat erbij.

**Wie al werkt.** De app vraagt wat er verandert: meer uren bij het huidige werk (zelfde uurloon, nieuw totaal aantal uren), ander werk in plaats van het huidige, of werk erbij. Bij werk erbij telt het loon van beide banen op en wordt de belasting over het totaal berekend, zoals bij de aangifte; op de loonstroken kan het anders verdeeld zijn, omdat één werkgever de heffingskortingen toepast.

## 5. Zorgtoeslag

Zorgtoeslag per jaar = standaardpremie (× 2 met toeslagpartner) − normpremie; normpremie = normpercentage × drempelinkomen + 13,73% × (toetsingsinkomen − drempelinkomen), het tweede deel niet negatief. 2026: standaardpremie € 2.119, drempelinkomen € 29.736, normpercentage 1,912% / 4,289%. Bron: [Dienst Toeslagen, Berekening zorgtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_zorgtoeslag_tg0821z62fd.pdf). Vermogensgrens 2026: € 146.011 / € 184.633 (aanname in de app: eronder).

## 6. Huurtoeslag

Grondslag: Wet op de huurtoeslag (versie 1 januari 2026), Besluit op de huurtoeslag art. 7, Regeling huurtoeslaggrenzen 2026 (Stcrt. 2025, 39783). Rekenwijze volgens de 7 stappen van [Dienst Toeslagen, Berekening huurtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf):

1. Rekenhuur = kale huur, ten hoogste € 932,93. **Servicekosten tellen sinds 2026 niet meer mee.**
2. Basishuur € 202,52 (één persoon) of € 200,71 (meer personen); sinds 2026 niet meer afhankelijk van het inkomen.
3. Deel A: rekenhuur boven de basishuur tot € 498,20, 100%.
4. Deel B: tot de aftoppingsgrens (€ 713,02 bij 1–2 personen, € 764,14 bij 3 of meer), 65%. Deel C: daarboven tot € 932,93, 40%.
5. Rekeninkomen: toetsingsinkomens van alle bewoners (kinderen onder 23: boven € 6.218).
6. Correctie: (rekeninkomen − minimum-inkomensijkpunt) × 27% (één persoon) of 22% (meer personen) / 12. Ijkpunt 2026: € 23.425 / € 31.500.
7. A + B + C − correctie, naar beneden afgerond.

Getoetst aan de rekenvoorbeelden 2 en 3 uit de brochure (zie `packages/engine/test/officieel.test.ts`) en aan vijf proefberekeningen.

**Zelfstandige woning:** huurtoeslag is er alleen voor een zelfstandige woonruimte: een eigen toegangsdeur die op slot kan, een eigen keuken en wc, en sinds 1 maart 2024 een eigen douche of bad ([Dienst Toeslagen, Kan ik huurtoeslag krijgen?](https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen)). Antwoordt de gebruiker dat de woning dat niet heeft, dan rekent de app zonder huurtoeslag en zegt dat erbij. Voor sommige onzelfstandige woningen kan wel huurtoeslag gelden; die uitzondering rekent de app niet.

**Huisgenoten en kinderen (medebewoners):** het toetsingsinkomen van iedereen die op het adres staat ingeschreven, behalve de partner en een onderhuurder, telt mee in het rekeninkomen (Awir art. 1 en 7, Wht art. 7; brochure stap 5), en elke bewoner telt mee voor het aantal personen. Leeftijd maakt daarbij niet uit; alleen voor inwonende kinderen jonger dan 23 telt het inkomen pas boven € 6.218 per jaar. De app vraagt in stap 1 naar huisgenoten van 27 jaar of ouder (ook nodig voor de kostendelersnorm) en van 18 tot 27 jaar (alleen voor de huurtoeslag), en bij 'Uw woning' naar het jaarinkomen van alle anderen in huis samen. Getoetst aan een proefberekening met één medebewoner (proefpersoon Wim).

## 7. Kindgebonden budget

2026: € 2.580 per kind, alleenstaande ouder bij één kind € 5.996 (dus € 3.416 extra), + € 724 (12–15 jaar), + € 964 (16–17 jaar); afbouw 7,6% boven € 29.736 (zonder partner) of € 39.141 (met partner). Bron: [Dienst Toeslagen, Berekening kindgebonden budget 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf). Let op: rekenvoorbeeld 2 in die brochure noemt in de tekst € 510 per maand, maar de eigen berekening komt op € 533,56; de engine volgt de berekening.

## 8. Kinderbijslag

Inkomensonafhankelijk; telt niet mee voor de bijstand (art. 31 lid 2 b Pw) en beïnvloedt het verschil dus niet. Per kind per kwartaal, eerste en tweede kwartaal 2026: € 295,07 / € 358,30 / € 421,53; derde en vierde kwartaal: € 298,40 / € 362,35 / € 426,29 (0–5, 6–11, 12–17 jaar). Bron: [SVB](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag). De app toont een derde van het kwartaalbedrag per maand, in beide situaties gelijk.

## 9. Kinderopvangtoeslag

Toeslag per kind = uren (max. 230 per maand) × min(uurprijs, maximum) × percentage uit de tabel. Maxima 2026: dagopvang € 11,23, bso € 9,98, gastouder € 8,49. Eerste kind = kind met de meeste uren. Per jaar ten hoogste het aantal gewerkte maanden × 230 uur (bij twee ouders: de ouder die het minst werkt). Tabel en voorbeelden: [Dienst Toeslagen, Berekening kinderopvangtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf).

Weet de gebruiker de uurprijs niet, dan rekent de app met het maximum voor de soort opvang en zegt dat erbij. **Vergoeding van de eigen bijdrage (Leiden).** Blijft er na de toeslag een eigen bijdrage over, dan rekent de app een vergoeding van de gemeente mee (bijzondere bijstand, [Beleidsregels bijzondere bijstand 2022](https://lokaleregelgeving.overheid.nl/CVDR677687), art. 7 onder f: kan worden verleend als de kosten van kinderopvang een belemmering vormen voor werk). De voorwaarde is dus dat de opvang nodig is om te kunnen werken; in de praktijk kent Leiden de vergoeding aan werkende ouders toe. De app gaat ervan uit dat de aanvraag wordt toegekend, en zegt in de uitkomst wanneer de gemeente vergoedt, dat het ook geldt zonder bijstand, en dat de vergoeding aangevraagd moet worden. Berekening per maand:

1. Eigen bijdrage = kosten van de opvang − kinderopvangtoeslag.
2. Norm (art. 1 onder d): de bijstandsnorm zonder kostendelersnorm, met een verlaging op grond van art. 27; voor een alleenstaande ouder 90% van de gezinsnorm. Zonder vakantietoeslag: × (1 − 5%) (art. 19 lid 3 Pw).
3. Inkomen: netto loon (en dat van de partner) zonder vakantiegeld (benaderd als gemiddeld netto / 1,08) plus de bijstand zonder vakantietoeslag. Toeslagen tellen niet mee.
4. Draagkracht (art. 6 lid 2): niets tot 110% van de norm; 20% van het inkomen tussen 110% en 130%; 50% tussen 130% en 150%; 100% daarboven.
5. Vergoeding = eigen bijdrage − draagkracht, niet lager dan nul.

De gemeente stelt de draagkracht vast voor een jaar vanaf de aanvraag (art. 6 lid 1); de app rekent met het maandinkomen in de gekozen situatie.

## 10. Overgangsmaanden en terugbetalen van toeslagen

Toeslagen zijn een voorschot op het verwachte jaarinkomen. Wie gaat werken en zijn inkomen niet doorgeeft, krijgt te veel en moet dat na de definitieve berekening terugbetalen. De app toont per toeslag hoeveel lager die met werk wordt en wat dat na een jaar werk betekent (`terugbetaalrisico` in de uitkomst). 

## 11. Leiden

| Regeling | Wat vaststaat | Bron |
| --- | --- | --- |
| Verkorte aanvraag ('Garantieknop') | Nieuwe aanvraag binnen 12 maanden na het einde van de bijstand, als die stopte door werk, een uitsluitingsgrond of studie; de gemeente gebruikt bekende gegevens als woonadres, gezin, inkomen en vermogen niet zijn veranderd | [Beleidsregels inkomensvoorzieningen Leiden 2026, hoofdstuk 3](https://lokaleregelgeving.overheid.nl/CVDR760197) |
| Individuele inkomenstoeslag | € 462 (alleenstaande), € 577 (alleenstaande ouder), € 635 (gehuwden), één keer per 12 maanden; 23 jaar of ouder; 5 jaar inkomen tot 100% van de bijstandsnorm. De bedragen bevestigen artikel 4 van de verordening uit 2020 (€ 400 / € 500 / € 550, geïndexeerd); de afwijkende toelichting bij die verordening is niet bepalend | [leiden.nl](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/individuele-inkomenstoeslag/) |
| Sleutelpas en Kindtegoed | Gratis pas en Kindtegoed tot 130% van het WSM; Kindtegoed per jaar € 150 (0–3), € 350 (4–11), € 550 (12–17); tussen 130% en 140% wel Kindtegoed, geen gratis pas. WSM = de gewone bijstandsnorm, ook bij verblijf in een instelling | [Beleidsregels Kindtegoed en armoederegelingen Sleutelpas 2026](https://lokaleregelgeving.overheid.nl/CVDR747564) |
| Premies bij werk | In de Re-integratieverordening 2023 staat alleen een premie bij een participatieplaats (€ 220 per 6 maanden), geen uitstroompremie. De landelijke vrijlating bij medische urenbeperking (onder y) geldt ook in Leiden | [Re-integratieverordening Participatiewet 2023 Leiden](https://lokaleregelgeving.overheid.nl/CVDR706023) |
| Draagkracht bijzondere bijstand | Geen draagkracht tot 110% van de bijstandsnorm (exclusief vakantietoeslag); daarboven 20% van het meerinkomen tot 130%, 50% tussen 130% en 150%, 100% boven 150% | [Beleidsregels bijzondere bijstand 2022, art. 6](https://lokaleregelgeving.overheid.nl/CVDR677687) |
| Collectieve zorgverzekering voor minima en zwemabonnement | Tot 120% van de bijstandsnorm kan de gemeente (een deel van) de premie betalen en een seizoenabonnement voor zwembad De Vliet of De Zijl vergoeden. De app meldt of het inkomen met werk onder of boven die grens ligt; ze rekent geen bedrag | idem, art. 11 en 12 |
| Kwijtschelding gemeentelijke belastingen | Voor onder meer afvalstoffenheffing en rioolheffing; kosten van bestaan 100% van de bijstandsnorm. De app meldt, als de bijstand door het werk stopt, dat de kwijtschelding kan vervallen; ze rekent geen bedrag | [Verordening kwijtschelding gemeentelijke belastingen Leiden 2025](https://lokaleregelgeving.overheid.nl/CVDR733112) |
| Gratis OV-pas | Voor inwoners van 18 jaar of ouder met een inkomen tot en met 100% van het sociaal minimum; niet voor studenten en niet voor dak- of thuislozen. Geldig op werkdagen van 9.00 tot 16.00 uur en na 18.30 uur, in het weekend en op feestdagen de hele dag. Het aantal passen is beperkt. De app meldt de pas en dat hij vervalt als de bijstand stopt; ze rekent geen bedrag | [Gemeente Leiden, Gratis openbaar vervoer](https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen/gratis-openbaar-vervoer/) |
| Eigen bijdrage kinderopvang (SMI) | Tot 110% van de bijstandsnorm volledig vergoed | idem |
| Eigen bijdrage kinderopvang (werk, scholing, participatie) | Bijzondere bijstand kan worden verleend als de kosten een belemmering zijn voor werk, scholing of een participatietraject. Eigen bijdrage = werkelijke kosten min kinderopvangtoeslag | idem |

## 12. Onafhankelijke toetsing

- `packages/engine/test/officieel.test.ts`: de rekenvoorbeelden van Dienst Toeslagen voor huurtoeslag, zorgtoeslag, kindgebonden budget en kinderopvangtoeslag 2026.
- `testgevallen/` en [PROEFPERSONEN.md](PROEFPERSONEN.md): fictieve huishoudens met officiële vergelijkingswaarden waar die er zijn, waaronder drie ingevulde proefberekeningen van Dienst Toeslagen (8 november 2026: Fatima en Youssef, Bram, Sanne 24 uur). Alle negen bedragen kwamen tot op de euro overeen.
- `packages/engine/test/eigenschappen.test.ts`: de vorm van de wet (geen sprongen, dalend waar het moet).
