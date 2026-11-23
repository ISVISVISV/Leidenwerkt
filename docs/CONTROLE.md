# Zo controleer je Leidenwerkt

Deze pagina is voor wie wil nagaan of de rekenhulp te vertrouwen is, zonder eerst alle documentatie te lezen. Je hebt er een kwartier voor nodig; voor de technische controle een half uur.

## Wat de app beweert, en wat niet

**Wel:** voor een inwoner van Leiden met bijstand rekent de app uit wat er per maand overblijft als hij of zij gaat werken of meer gaat werken. Ze rekent met de bijstandsnorm, de kostendelersnorm, de Leidse verlaging bij lage woonkosten, de inkomstenvrijlating, loonheffing en heffingskortingen, zorgtoeslag, huurtoeslag, kindgebonden budget, kinderbijslag en kinderopvangtoeslag.

**Niet:** de app beslist niets en vervangt de contactpersoon bij de gemeente niet. Ze rekent geen vermogen, schulden, beslag, eigen bijdragen of bijzondere bijstand in bedragen uit. Leidse regelingen zoals de Sleutelpas en de individuele inkomenstoeslag staan er als melding, niet als bedrag. Wat er precies wel en niet in zit, staat in [RECHT.md](RECHT.md), deel 1.

**Privacy:** alles draait in de browser. Er is geen server, er zijn geen cookies en er gaat geen verzoek naar buiten. Dat is te controleren in het netwerktabblad van de browser; een browsertest bewaakt het.

## 1. Steekproef in de app (vijf minuten)

Elk bedrag in de uitkomst is terug te volgen tot de letterlijke tekst van de bron.

1. Open [de rekenhulp](https://isvisvisv.github.io/Rekenhulp/leidenwerkt/) en vul een verzonnen huishouden in.
2. Klap onder de uitkomst **Hoe is dit berekend?** open en kies een post, bijvoorbeeld Bijstand.
3. Je ziet de rekenstappen met tussenbedragen. Onder **Gebruikte regels** staat elke parameter met zijn waarde en zijn bron.
4. Klik op een bron. Je ziet de letterlijke tekst uit de wet of de publicatie, met een link naar de officiële pagina.

Hetzelfde geldt voor de meldingen onder **Goed om te weten** en voor de uitleg achter "Meer uitleg": bij elke bewering over een regel staat de bron.

## 2. Eén voorbeeld met de hand nagerekend

Een alleenstaande van 40 jaar met een koopwoning en volledige bijstand gaat 16 uur per week werken voor € 900 bruto per maand. Regels zoals ze gelden op 10 november 2026. Een test bewaakt dat de app precies deze bedragen geeft (`packages/rekenkern/test/controle.test.ts`).

**Netto loon**

| Stap | Berekening | Bedrag |
| --- | --- | --- |
| Bruto loon per jaar, met 8% vakantiegeld | € 900 × 1,08 × 12 | € 11.664,00 |
| Belasting en premies, eerste schijf 35,75% | 35,75% × € 11.664 | € 4.169,88 |
| Algemene heffingskorting | vast bedrag tot € 29.736 | − € 3.115,00 |
| Arbeidskorting | 8,324% × € 11.664 | − € 970,91 |
| Te betalen per jaar | | € 83,97 |
| Netto per maand | (€ 11.664 − € 83,97) / 12 | **€ 965,00** |

Bronnen: [Belastingdienst, tarieven en heffingskortingen 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen); vakantiegeld: [Wet minimumloon en minimumvakantiebijslag, art. 15](https://wetten.overheid.nl/BWBR0002638/2026-07-01).

**Bijstand**

| Stap | Berekening | Bedrag |
| --- | --- | --- |
| Norm alleenstaande, netto met vakantietoeslag | | € 1.419,46 |
| Vrijlating maand 1 t/m 6 | 25% × € 965,00 (maximaal € 289,00) | € 241,25 |
| Bijstand maand 1 t/m 6 | € 1.419,46 − (€ 965,00 − € 241,25) | **€ 695,71** |
| Bijstand vanaf maand 7 | € 1.419,46 − € 965,00 | **€ 454,46** |

Bronnen: [Rijksoverheid, hoogte van de bijstandsuitkering](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering); [Participatiewet, art. 31 lid 2 onder n](https://wetten.overheid.nl/BWBR0015703/2026-07-01).

**Zorgtoeslag**

| Stap | Berekening | Bedrag |
| --- | --- | --- |
| Standaardpremie | | € 2.119,00 |
| Normpremie (inkomen onder het drempelinkomen) | 1,912% × € 29.736 | − € 568,55 |
| Zorgtoeslag per maand, naar beneden afgerond | € 1.550,45 / 12 | **€ 129** |

Bron: [Dienst Toeslagen, Berekening zorgtoeslag 2026](https://download.belastingdienst.nl/toeslagen/docs/berekening_zorgtoeslag_tg0821z62fd.pdf). De zorgtoeslag is in dit voorbeeld met en zonder werk gelijk.

**Uitkomst**

| | Nu | Maand 1 t/m 6 | Vanaf maand 7 |
| --- | --- | --- | --- |
| Netto loon | – | € 965,00 | € 965,00 |
| Bijstand | € 1.419,46 | € 695,71 | € 454,46 |
| Zorgtoeslag | € 129,00 | € 129,00 | € 129,00 |
| Samen | € 1.548,46 | € 1.789,71 | € 1.548,46 |
| Verschil met nu | | **€ 241,25 meer** | **€ 0** |

Dit is het patroon dat de app zichtbaar wil maken: onder de bijstandsnorm levert werken alleen in de maanden met vrijlating iets extra op.

## 3. De technische controle (een half uur)

```sh
git clone https://github.com/ISVISVISV/Rekenhulp.git
cd Leidenwerkt
npm ci
npm test          # rekenkern, regeldata en documentatie
npm run test:e2e  # de app in een browser, inclusief toegankelijkheid
```

Wat de tests bewijzen:

| Test | Wat het aantoont |
| --- | --- |
| `packages/rekenkern/test/officieel.test.ts` | De rekenvoorbeelden uit de brochures van Dienst Toeslagen komen er exact uit |
| `packages/rekenkern/test/bronnen.test.ts` | Elke geverifieerde parameter heeft een letterlijk citaat uit de bron, en de waarde staat in dat citaat |
| `testgevallen/*.yaml` en [PROEFPERSONEN.md](PROEFPERSONEN.md) | Verzonnen huishoudens, per bedrag vergeleken met een officiële waarde waar die er is, waaronder ingevulde proefberekeningen van Dienst Toeslagen |
| `packages/rekenkern/test/grenzen.test.ts` | Grenzen en onderdelen met de hand nagerekend: leeftijdsgrenzen, kostendelersnorm bij een paar, belastingschijven, vergoeding kinderopvang, opbouw van de kinderopvangtabel |
| `packages/rekenkern/test/snapshot.test.ts` | Vastgelegde uitkomsten en uitleg (rekenstappen, meldingen, aannames); elke wijziging valt op |
| `packages/rekenkern/test/eigenschappen.test.ts` | Bij willekeurige invoer gedraagt de uitkomst zich zoals de wet voorschrijft: geen sprongen, dalend waar het moet |
| `e2e/leidenwerkt.spec.ts` | De app doet wat de rekenkern uitrekent, voldoet aan WCAG 2.2 AA en doet geen verzoeken naar buiten |

**Deugen de tests zelf?** Op 11 november 2026 is een mutatietest gedaan: 1.031 keer is één ding veranderd in de rekenkern of in een bedrag van 2026 (een vergelijking, een plus of min, een grens, een bedrag) en is gekeken of een test faalde. In 900 gevallen faalde een test, waaronder alle 426 veranderde bedragen op 22 na; veranderde bedragen vangt vooral de bronnencontrole (`bronnen.test.ts`), die eist dat elk bedrag letterlijk in het citaat uit de bron staat. Van de 131 overige veranderde in 85 gevallen niets aan de uitkomst (gelijkwaardige code, of een grens die een euro opschuift), in 42 gevallen alleen een tekst of rekenstap buiten de vastgelegde huishoudens, en in 4 gevallen een bedrag. Voor één daarvan, de leeftijdsgrens van 27 jaar bij een medische urenbeperking, is daarna een test toegevoegd. De andere 3 gaan over invoer die de app niet toelaat: een loon van precies € 0, opvang van 0 uur en een vergoeding van precies € 0. Eerdere metingen: 441 van 1.010 (eerste meting) en 871 van 1.020 (10 november).

Wat de tests **niet** bewijzen: dat een regel goed is begrepen als er geen officiële vergelijkingswaarde voor bestaat. Daarvoor is de bronvermelding per parameter bedoeld, en de lijst met open vragen.

Waar je moet kijken:

| Vraag | Plek |
| --- | --- |
| Waar staan de bedragen? | `regels/**/*.yaml`: elke parameter met bron, geldigheid en status, vaak met het letterlijke citaat. De rekenkern leest de bedragen daaruit |
| Waar staat de berekening? | `packages/rekenkern/src/`, los van de app; elke post levert zijn eigen rekenstappen |
| Hoe weet ik dat de bronnen nog kloppen? | Een wekelijkse controle vergelijkt de versies van de gebruikte wetten en opent een melding bij een wijziging ([ONDERHOUD.md](ONDERHOUD.md)) |
| Wat gebeurt er als een bedrag ontbreekt? | De app rekent het onderdeel niet uit en zegt dat, in plaats van te schatten |

## 4. Hoe het gecontroleerd is, en waar dat ophoudt

- **Bronnen.** Elke parameter is overgenomen uit een officiële bron (wetten.overheid.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, leiden.nl). Parameters met de status `onbevestigd` zijn in de app zichtbaar gemarkeerd.
- **Officiële rekenhulpen.** De toeslagen zijn vergeleken met de proefberekening van Dienst Toeslagen, met verzonnen gegevens. De bedragen kwamen tot op de euro overeen. Dertien van die proefberekeningen (november 2026: stellen, medebewoners, een kind van 20 met inkomen, kinderopvang) staan als toets in `packages/rekenkern/test/proefberekening.test.ts`.
- **Leidengeldwijzer en de proefberekening.** Op 23 november 2026 zijn acht personen uit de audit van Leidengeldwijzer ingevuld in de proefberekening van Dienst Toeslagen: met AOW, een stel met AOW, een stel met één AOW-gerechtigde, een WW-uitkering, alleenstaande ouders, een huisgenoot en een kind van 20 met inkomen, en kinderopvang. Alle 21 bedragen kwamen tot op de euro overeen. Ze staan als `verwacht` in `audit/leidengeldwijzer/personen.ts`; de audit controleert ze bij elke wijziging. Beperking: als inkomen is het toetsingsinkomen ingevuld dat Leidengeldwijzer zelf schat uit het netto inkomen. Dit toetst dus de berekening van de toeslagen, niet die schatting. De schatting zelf is vergeleken met de loonheffingstabellen (`packages/rekenkern/test/loonheffingstabellen.test.ts`).
- **Tweede narekening.** In november 2026 zijn 22 verzonnen casussen opnieuw nagerekend zonder vooraf de code te lezen. De bijstand kwam in alle casussen overeen; de toeslagen in de zes casussen die bij Dienst Toeslagen zijn nagelopen ook. Beperking: bij die narekening konden de wetteksten zelf niet worden geopend en is deels op niet-officiële overzichten geleund. Het is een bevestiging van de formules, geen tweede controle van elk bedrag.
- **Nog niet gedaan.** De uitkomsten zijn niet nagelopen door een klantmanager of sociaal raadsman, en de app is niet getest met mensen uit de doelgroep.

## 5. Wat niet zeker is

De volledige lijst staat in [RECHT.md](RECHT.md), deel 4. De punten die een uitkomst kunnen raken:

- **Overgangsrecht 2027.** Of iemand na de oude vrijlating nog de nieuwe bijverdienregeling krijgt, beslist de gemeente. Dat is bevestigd door klantmanagers in Leiden, maar staat nog niet in een officieel document (G1).
- **Reiskostenvergoeding van de werkgever.** De app telt die niet mee als inkomen voor de bijstand: het is een doelverstrekking. Bevestigd door klantmanagers in Leiden; een officiële bron met deze tekst moet nog worden toegevoegd.
- **2027.** De bedragen voor 2027 zijn nog niet gepubliceerd. Voor een datum in 2027 rekent de app met de laatste bekende regels en zegt dat erbij.
- **Praktijk in Leiden.** Een paar keuzes volgen de praktijk en niet een beleidsregel, bijvoorbeeld dat bewoners van een woonvorm met begeleiding niets voor het verblijf betalen. Ze staan bij de betreffende regel in RECHT.md.

Zie je iets dat niet klopt? Maak een melding aan in de repository, met de invoer, de uitkomst van de app en de bron waaruit blijkt wat het moet zijn.

## 6. Gebruikerstest met personages

De rekentests controleren of de berekening klopt met de regels. Ze zien niet wat een gebruiker niet begrijpt. Daarvoor is deze test: een tester doorloopt de rekenhulp als een aantal verzonnen personen en noteert alles wat verwarrend, dubbel of tegenstrijdig is. De eerste twee rondes (november 2026) vonden onder meer een rekenfout in het jaarbedrag, een link die terugstuurde naar het begin, ontbrekende antwoordopties en bedragen die niet terug te vinden waren.

### Wanneer

- Bij elke nieuwe versie met wijzigingen in vragen, teksten of de uitkomst.
- Na het bijwerken van de bedragen voor een nieuw jaar, als de uitkomst er anders uit kan zien.

### Hoe

1. De tester gebruikt alleen de rekenhulp, zoals een bezoeker: geen broncode, geen documentatie, alleen verzonnen gegevens.
2. Kies zes personen. Neem er vier die nog niet eerder zijn gebruikt (zie de lijst hieronder) en twee uit een vorige ronde, om te zien of de oplossingen werken.
3. Laat de tester de opdracht hieronder uitvoeren en het rapport opleveren.
4. Controleer elk punt zelf voordat er iets verandert. Niet alles is een fout: soms klopt de berekening en ontbreekt alleen uitleg, soms leest de tester iets verkeerd.
5. Verwerk de punten in pull requests en zet in `CHANGELOG.md` wat er is veranderd.
6. Vul de lijst met gebruikte personen hieronder aan.

### Opdracht voor de tester

Vervang [personen] door de zes gekozen personen, elk met leeftijd, huishouden, woning en het werk dat ze overwegen.

> Je bent testgebruiker van "Leidenwerkt", een gratis rekenhulp voor inwoners van Leiden met bijstand: https://isvisvisv.github.io/Rekenhulp/leidenwerkt/
>
> **Doel.** Vind plekken waar een gewone gebruiker vastloopt, iets verkeerd begrijpt, of twee dingen ziet die elkaar tegenspreken. Je hoeft bedragen niet zelf na te rekenen, maar meld het wel als een bedrag niet te geloven is of als twee bedragen of teksten elkaar tegenspreken.
>
> **Werkwijze.** Gebruik alleen de rekenhulp zelf, zoals een bezoeker: geen broncode, geen documentatie, alleen verzonnen gegevens. Gebruik een venster zo smal als een telefoon (ongeveer 390 pixels) als dat kan. Vul alles met de hand in, niet met een script. Open bij elke vraag "Meer uitleg", als die knop er staat. Klik op de uitkomst op de koppen onder "Goed om te weten" en op de links onder "Wat u nu kunt doen".
>
> **Personen.** Vul de rekenhulp voor elk volledig in, met hun eigen kennis en woorden: [personen]
>
> **Wat je meldt.** Een vraag of tekst die je niet begrijpt of anders leest dan bedoeld (citeer hem en zeg wat jij dacht). Een situatie waarvoor geen passend antwoord bestaat. Iets wat je zoekt en niet vindt. Twee teksten of bedragen die elkaar tegenspreken, of een bedrag dat je niet gelooft (zeg waarom). Een uitleg die je vraag niet beantwoordt. Iets wat op een smal scherm niet werkt. Een knop of link die niets doet of naar de verkeerde plek gaat.
>
> **Wat je niet meldt.** Dit zijn bewuste keuzes; meld ze niet en stel ze niet voor:
> - dat huur, vaste lasten, vermogen, schulden, bijzondere bijstand of de waarde van een koopwoning niet worden meegerekend (buiten de rekenhulp);
> - dat de kinderopvang bij "Uw huishouden" staat in plaats van bij het werk;
> - dat "Goed om te weten" ingeklapt is of dat "Wat u nu kunt doen" een korte rij links is (de uitkomstpagina mag niet langer worden);
> - dat de urenschuif geen + en − knoppen heeft, of bij meer uren niet onder het huidige aantal uren kan;
> - dat er geen schatting is voor het deel van het kostgeld voor de woonruimte, of geen "weet ik niet" bij het eigen loon (geen officiële regel voor);
> - dat de vraag naar huisgenoten de grens van 27 jaar gebruikt (die staat in de wet);
> - dat van de partner alleen het bruto loon wordt gevraagd;
> - woorden als "vrijlating", "kostendelersnorm" of "combinatiekorting" op zich; meld ze alleen als de uitleg ontbreekt of niet helpt;
> - wensen voor nieuwe functies, extra vragen of extra uitleg op de uitkomst, tenzij je zonder die toevoeging echt vastloopt;
> - opmaak, kleur of lettertype, tenzij het daardoor onleesbaar of onbruikbaar is.
>
> **Voorstellen.** Hoogstens één zin, en alleen om iets bestaands korter, duidelijker of juister te maken. Weet je geen goed voorstel, schrijf dan "–". Een nieuwe vraag, een nieuw blok of meer tekst op de uitkomst mag je alleen voorstellen bij ernst "blokkeert".
>
> **Rapport.** Eén tabel per persoon: Scherm | Vraag of tekst (citaat) | Wat ging mis | Ernst | Voorstel. Ernst is "blokkeert" (je kunt niet verder, of de uitkomst klopt voor deze persoon niet), "verwarrend" (je kunt verder maar twijfelt of begrijpt het verkeerd) of "klein" (storend, maar je begrijpt het). Niets mis? Schrijf "geen opmerkingen"; verzin geen problemen. Sluit af met de vijf ergste punten, de controlevragen bij de herhaalde personen, en eerlijk welke schermen, knoppen "Meer uitleg" of uitklapblokken je niet hebt geopend en wat je niet met de hand hebt gedaan.

Werk de lijst "Wat je niet meldt" bij als er een nieuwe bewuste keuze bij komt; de redenen staan in [BESLUITEN.md](BESLUITEN.md) of in de pull request.

### Gebruikte personen

| Ronde | Personen |
| --- | --- |
| 1 (november 2026) | Fatma (alleenstaande moeder, huurt, kind 6); Jeroen (24, woont bij moeder); Anna (kamer, meer uren); Mohamed (getrouwd, drie kinderen, koopwoning); Pieter (geen vaste woonplek, medische urenbeperking); Lisa (woonvorm met begeleiding) |
| 2 (november 2026) | Samira (kostgeld bij ouders); Kees (58, kamer, meer uren); Dewi (alleenstaande moeder, twee kinderen naar de opvang); Tom en Ilse (stel, partner met bijbaan); Ahmed (huisgenoten, netto per 4 weken); Marloes (23, studio, medische urenbeperking) |
| 3 (november 2026) | Noor (21, baby naar gastouder); Henk en Joke (stel, 64 en 60); Sanne (gescheiden, alimentatie, kind 10); Bilal (horeca, all-in uurloon, kamer); Kees en Samira opnieuw |
| 4 (november 2026) | Fleur (UWV-uitkering naast bijstand); Ricardo (alleenstaande vader, kinderen 17 en 19); Mila en Daan (stel, partner werkt al, kind naar kinderdagverblijf); Joost (nachtopvang, netto loon); Henk en Joke en Noor opnieuw |
| 5 (november 2026) | Thijs (26, bij ouders); Esra (drie kinderen, verschillende opvang); Pim (ander werk in plaats van het huidige); Yara (medische urenbeperking, kamer); Gerard en Ans (werk erbij); Sem (huisgenoten, voltijd) |
| 6 (november 2026) | Twee andere soorten tests, zie hieronder: omwegen (tien scenario's); toeslagen tegen de proefberekening (Ria en Kemal, Lotte en Ruben, Wendy, Hatice, Marco, Iris) |
| 7 (november 2026) | Na het inkorten: Dewi, Tom en Ilse, Noor (opnieuw), Yara (opnieuw, andere gegevens), Karim (36, voltijd). Daarna vreemde invoer en alleen het toetsenbord |
| 8 (november 2026) | Op versie 0.4.0: Tom en Ilse, Noor, Yara en Karim opnieuw. Nieuw: Johan (58, werkt al, meer uren), Marieke (woonvorm met begeleiding), Fatou en Ibrahim (kinderen van 3 en 19, studiefinanciering), Lars (25, kostgeld bij zijn vader), Priya (partneralimentatie) |
| 9 (november 2026) | Eerste indruk en personen: Tom en Ilse (partner werkt kort), Priya, Hatice (kinderalimentatie, zoon met onbekend inkomen), Lars (weekloon), Sanne (bij een vriendin in huis), Dewi (werk erbij, opvang), Fatou en Ibrahim |
| 10 (november 2026) | Omwegen bij de nieuwe vragen (negen scenario's en twee eigen); toeslagen tegen de proefberekening (Priya, Hatice, Tom en Ilse); alleen het toetsenbord in stap 1 |
| 11 (november 2026) | De afdruk (Tom en Ilse, Sanne, Johan); de zin bij de urenschuif bij zeven soorten loon; stap 1 in de nieuwe volgorde (Ahmed en Leila, Joke, Sanne) |

Nog niet gebruikt, als idee: iemand die in 2027 rekent.

### Andere soorten tests

**Automatische audit.** `npm run audit` doet zonder AI wat testers eerder met de hand deden: omwegen vergelijken, bedragen in zinnen naast de tabel leggen, de afdruk op overlap controleren, de urenschuif op verspringen door afronding, en teksten op ";" en bedragen zonder punt. Personen met bedragen uit een officiële bron (zoals de proefberekening van Dienst Toeslagen) staan erin met `verwacht`, of als bestand in audit/extern. De audit draait bij elke wijziging op GitHub. Zie [audit/README.md](../audit/README.md). Een tester is daarna vooral nodig voor begrijpelijkheid en voor nieuwe functies, en kan de tekstbestanden in audit/uitvoer lezen in plaats van door de site te klikken.

Naast de test met personages zijn twee andere tests nuttig gebleken (ronde 6):

- **Omwegen.** De tester vult elk scenario twee keer in: één keer meteen goed, en één keer met een omweg (eerst iets anders invullen, dan wijzigen via "Gegevens aanpassen", "Vorige stap", de terugknop van de browser of "Opnieuw beginnen"). Elk verschil in de uitkomst is een fout. Zo vond ronde 6 dat de urenschuif terugsprong en dat oude bedragen bleven staan in een veld met een andere betekenis.
- **Toeslagen tegen de proefberekening.** De tester neemt het geschatte jaarinkomen over uit "Hoe is dit berekend?" en vult het met dezelfde situatie in bij de proefberekening van Dienst Toeslagen. Zet de uitkomsten daarna als toets in `packages/rekenkern/test/proefberekening.test.ts` (de formules), of met het hele formulier als `verwacht` in de audit (zie audit/README.md). Dat laatste toetst ook de schatting van het inkomen.

Doe ook deze tests na grote wijzigingen in de vragen of in de berekening van de toeslagen. Laat de tester ook hier geen voorstellen doen, alleen beschrijven wat er gebeurt.

## 7. Risico's

Stand: 10 november 2026.

| # | Risico | Kans | Impact | Maatregel |
| --- | --- | --- | --- | --- |
| R1 | **Verouderde regels.** Normbedragen veranderen twee keer per jaar; de app geeft dan verkeerde uitkomsten zonder dat iemand het merkt. | Hoog | Hoog | Elke parameter heeft een geldigheidsperiode; de app toont een duidelijke waarschuwing als er voor de gekozen datum geen geldige waarden zijn. `ONDERHOUD.md` met stappenplan. Wekelijkse bewaking van wetten, publicaties en Leidse regelingen (GitHub Action), issue 45 dagen vóór het einde van regeldata, halfjaarlijkse lijst van open parameters. |
| R2 | **Wetswijziging 2027.** De Participatiewet in balans verandert vrijlating en verrekening; details deels nog onbekend. | Zeker | Hoog | Twee regimes in de engine; 2027-onderdelen blijven `onbevestigd` tot wettekst gecontroleerd is. |
| R3 | **Onbetrouwbare bronnen.** Online rekensites spreken elkaar tegen; overnemen leidt tot fouten. | Hoog | Hoog | Alleen officiële bronnen; de build weigert andere domeinen; statusveld per waarde; toetsing aan rekenvoorbeelden van Dienst Toeslagen. |
| R13 | **Vandalisme of onopgemerkte fout in een bijdrage.** | Middel | Hoog | Pull requests met verplichte review (CODEOWNERS) en CI; overzicht van gewijzigde parameters en effect op proefpersonen; controle op sprongen > 10%. |
| R4 | **Huurtoeslag te complex** om correct na te bouwen na de wijziging per 2026. | Middel | Hoog | Gebouwd naar de brochure "Berekening huurtoeslag 2026" en getoetst aan de rekenvoorbeelden en proefberekeningen van Dienst Toeslagen. Wat niet te berekenen is (bijvoorbeeld een kamer) toont de app als "niet berekend". |
| R5 | **Schijnnauwkeurigheid.** Gebruiker leest een indicatie als zekerheid. | Middel | Hoog | Afronden op hele euro's, aannames zichtbaar, bandbreedte bij gevoelige aannames, vaste uitleg dat gemeente en Toeslagen beslissen. |
| R6 | **Leidse regelingen onvolledig** omdat ze deels alleen op de gemeentesite staan. | Hoog | Middel | Leidse plug-ins zijn optioneel; wat ontbreekt meldt de app. Validatie met een praktijkdeskundige. |
| R7 | **Gemeentelijke beleidsvrijheid** (bijvoorbeeld wel of geen vrijlating, verlenging na 12 maanden) maakt uitkomst onzeker. | Hoog | Middel | De app toont de uitkomst per periode, met en na de vrijlating, en zegt erbij dat de gemeente beslist. |
| R8 | **Netto loon wijkt af** van de loonstrook door loonheffingstabellen, pensioen en cao-regelingen. | Hoog | Laag | Uitleg in de app; gebruiker kan eigen netto loon invullen als dat bekend is. |
| R9 | **Toegankelijkheid** onvoldoende voor mensen met beperkte digitale vaardigheden. | Middel | Hoog | A2-taal, axe-tests in CI, test met iemand uit de doelgroep. |
| R10 | **Privacy**: per ongeluk een externe bron (font, CDN, analytics) die verkeer genereert. | Laag | Middel | Playwright-test die faalt bij elk netwerkverzoek na het laden. |
| R11 | **Naamverwarring** met een gemeentelijk programma. | Laag | Laag | Zoektocht naar "Leidenwerkt" / "Leiden Werkt"leverde op 4-11-2026 geen bestaand gebruik op. |
| R12 | **Eén onderhouder.** Als die stopt, veroudert de app. | Middel | Hoog | Documentatie voor opvolgers, open licentie (EUPL-1.2), duidelijke bijdrageregels; app toont de datum van de laatst gecontroleerde regels. |

## 8. Snapshots: waarom een vastgelegde uitkomst is gewijzigd

De snapshots in `packages/rekenkern/test/__snapshots__/` zetten de uitkomsten voor 2026 vast voor de huishoudens in `packages/rekenkern/test/huishoudens.ts`. Verandert een snapshot, dan staat hier waarom. Bijwerken: `npx vitest run -u`, daarna het verschil nalopen en hier verklaren.

### 8 november 2026: eerste vastlegging en eerste wijziging

Vastgelegd in commit "Snapshots van de uitkomsten 2026 vastgezet", vóór de wijzigingen hieronder. Daarna gewijzigd om deze redenen, allemaal met een officiële bron:

| Wijziging | Effect op de snapshots | Bron |
| --- | --- | --- |
| Huurtoeslag wordt nu berekend: minimum-inkomensijkpunt 2026 gevonden (€ 23.425 / € 31.500) | `huurtoeslag` was `null` en viel buiten het verschil; nu een bedrag. Het verschil (kopgetal) daalt waar de huurtoeslag met werk lager wordt, bijvoorbeeld "alleenstaande 36 uur": € 980,52 → € 779,40 | Regeling huurtoeslaggrenzen 2026, Stcrt. 2025, 39783; Berekening huurtoeslag 2026 (Dienst Toeslagen) |
| Toeslagen per maand naar beneden afgerond op hele euro's | `zorgtoeslag` € 129,20 → € 129; `kgb` € 499,67 → € 499; `kot` € 844,80 → € 844 | Rekenvoorbeelden in de brochures "Berekening … 2026" van Dienst Toeslagen |
| Geen vrijlating onder de 27 jaar (tot en met 2026) | "alleenstaande 25 jaar, 20 uur": bijstand met werk € 382,21 → € 93,21; verschil € 289 → € 0 | Participatiewet art. 31 lid 5 (versie 1 juli 2026) |
| Kinderbijslag berekend (SVB-bedragen 2026) | `kinderbijslag` was `null`; nu in beide situaties hetzelfde bedrag. Geen effect op het verschil | SVB, bedragen kinderbijslag 2026 |
| Servicekosten tellen niet meer mee voor de huurtoeslag | "alleenstaande ouder, kind 4 met opvang": rekenhuur € 690 in plaats van € 730 | Berekening huurtoeslag 2026, stap 1 |
| Geen vrijlating meer op het loon van de partner | Geen effect in deze huishoudens (bijstand met werk was al € 0) | Aanname: de partner werkte al, dus zijn of haar vrijlatingsperiode is waarschijnlijk voorbij (staat bij de aannames in de app) |

### 8 november 2026 (vervolg)

Geen wijziging in de snapshots 2026. De toets vooraf bij art. 34a en de huurtoeslag met huisgenoten raken de vastgelegde huishoudens niet (alleen 2027, en huishoudens zonder huisgenoten met huur).

### Lagere norm bij geen woonkosten, kamer zonder huurtoeslag, medische urenbeperking

Geen wijziging in de snapshots 2026. De vastgelegde huishoudens huren een zelfstandige woning of hebben woonsituatie "anders", en hebben geen medische urenbeperking.

### Vergoeding eigen bijdrage kinderopvang (Leiden)

Nieuwe post `bb_opvang` met werk, voor huishoudens met kinderopvang (Beleidsregels bijzondere bijstand 2022, art. 1, 6 en 7 onder f):

| Huishouden of proefpersoon | Vergoeding | Verschil |
| --- | --- | --- |
| Snapshot "alleenstaande ouder, kind 4 met opvang" | € 36,00 | € 299,48 → € 335,48 |
| Sanne, 24 uur | € 31,80 | € 368,33 → € 400,13 |
| Sanne, maand 1 t/m 6 | € 25,40 | € 287,71 → € 313,11 |
| Sanne, maand 7 t/m 36 | € 25,40 | € 147,33 → € 172,73 |
| Sanne, vanaf maand 37 | € 25,40 | € −1,29 → € 24,11 |

Bij Sanne blijft het inkomen onder 110% van de rekennorm, dus de hele eigen bijdrage wordt vergoed.

### Woonvorm met begeleiding (art. 23 Pw)

Geen wijziging in de snapshots 2026; geen van de vastgelegde huishoudens woont in een instelling.

### Snapshots van de uitleg (10 november 2026)

Nieuw: naast de bedragen staan nu ook de rekenstappen, meldingen en aannames vast, voor de bestaande huishoudens en negen extra (`extraVoorUitleg` in `huishoudens.ts`). De snapshots van de bedragen zijn niet gewijzigd. Een gewijzigde tekst in de uitleg hoeft hier niet verklaard te worden; een gewijzigd tussenbedrag wel.

### 11 november 2026: bijstand van partners per helft, combinatiekorting over het hele inkomen

| Wijziging | Effect op de snapshots | Bron |
| --- | --- | --- |
| Bij partners is de bijstand per helft teruggerekend naar bruto, ieder met een eigen heffingskorting | Lager geschat jaarinkomen bij paren met bijstand, dus meer zorgtoeslag en huurtoeslag. Bijvoorbeeld "paar met opvang, partner werkt niet": jaarinkomen zonder werk € 33.388,60 → € 28.176,62, huurtoeslag € 361 → € 396. Bij "paar met twee kinderen, partner werkt" een verschil van één cent door afronding | Participatiewet, art. 45 lid 4 |
| De combinatiekorting gaat af van de belasting over loon en bijstand samen, niet alleen over het loon | Bij alleenstaande ouders met een laag loon is de korting hoger: "alleenstaande ouder, kind 4 met opvang" en de proefpersonen Ayşe en Sanne. Bij Ayşe nu € 0 → € 33,71 per maand | Belastingdienst, tarieven en heffingskortingen 2026 (heffingskortingen gaan af van de belasting over het inkomen in box 1) |
