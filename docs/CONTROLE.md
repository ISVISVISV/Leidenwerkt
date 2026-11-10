# Zo controleer je Leidenwerkt

Deze pagina is voor wie wil nagaan of de rekenhulp te vertrouwen is, zonder eerst alle documentatie te lezen. Je hebt er een kwartier voor nodig; voor de technische controle een half uur.

## Wat de app beweert, en wat niet

**Wel:** voor een inwoner van Leiden met bijstand rekent de app uit wat er per maand overblijft als hij of zij gaat werken of meer gaat werken. Ze rekent met de bijstandsnorm, de kostendelersnorm, de Leidse verlaging bij lage woonkosten, de inkomstenvrijlating, loonheffing en heffingskortingen, zorgtoeslag, huurtoeslag, kindgebonden budget, kinderbijslag en kinderopvangtoeslag.

**Niet:** de app beslist niets en vervangt geen klantmanager. Ze rekent geen vermogen, schulden, beslag, eigen bijdragen of bijzondere bijstand in bedragen uit. Leidse regelingen zoals de Sleutelpas en de individuele inkomenstoeslag staan er als melding, niet als bedrag. Wat er precies wel en niet in zit, staat in [REKENREGELS.md](REKENREGELS.md).

**Privacy:** alles draait in de browser. Er is geen server, er zijn geen cookies en er gaat geen verzoek naar buiten. Dat is te controleren in het netwerktabblad van de browser; een browsertest bewaakt het.

## 1. Steekproef in de app (vijf minuten)

Elk bedrag in de uitkomst is terug te volgen tot de letterlijke tekst van de bron.

1. Open [de rekenhulp](https://isvisvisv.github.io/Leidenwerkt/) en vul een verzonnen huishouden in.
2. Klap onder de uitkomst **Hoe is dit berekend?** open en kies een post, bijvoorbeeld Bijstand.
3. Je ziet de rekenstappen met tussenbedragen. Onder **Gebruikte regels** staat elke parameter met zijn waarde en zijn bron.
4. Klik op een bron. Je ziet de letterlijke tekst uit de wet of de publicatie, met een link naar de officiële pagina.

Hetzelfde geldt voor de meldingen onder **Goed om te weten** en voor de uitleg achter de i-knopjes: bij elke bewering over een regel staat de bron.

## 2. Eén voorbeeld met de hand nagerekend

Een alleenstaande van 40 jaar met een koopwoning en volledige bijstand gaat 16 uur per week werken voor € 900 bruto per maand. Regels zoals ze gelden op 10 november 2026. Een test bewaakt dat de app precies deze bedragen geeft (`packages/engine/test/controle.test.ts`).

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
git clone https://github.com/ISVISVISV/Leidenwerkt.git
cd Leidenwerkt
npm ci
npm test          # rekenkern, regeldata en documentatie
npm run test:e2e  # de app in een browser, inclusief toegankelijkheid
```

Wat de tests bewijzen:

| Test | Wat het aantoont |
| --- | --- |
| `packages/engine/test/officieel.test.ts` | De rekenvoorbeelden uit de brochures van Dienst Toeslagen komen er exact uit |
| `testgevallen/*.yaml` en [PROEFPERSONEN.md](PROEFPERSONEN.md) | Verzonnen huishoudens, per bedrag vergeleken met een officiële waarde waar die er is, waaronder ingevulde proefberekeningen van Dienst Toeslagen |
| `packages/engine/test/eigenschappen.test.ts` | Bij willekeurige invoer gedraagt de uitkomst zich zoals de wet voorschrijft: geen sprongen, dalend waar het moet |
| `e2e/rekenhulp.spec.ts` | De app doet wat de rekenkern uitrekent, voldoet aan WCAG 2.2 AA en doet geen verzoeken naar buiten |

Wat de tests **niet** bewijzen: dat een regel goed is begrepen als er geen officiële vergelijkingswaarde voor bestaat. Daarvoor is de bronvermelding per parameter bedoeld, en de lijst met open vragen.

Waar je moet kijken:

| Vraag | Plek |
| --- | --- |
| Waar staan de bedragen? | `regels/**/*.yaml`: elke parameter met bron, geldigheid en status, vaak met het letterlijke citaat. De rekenkern leest de bedragen daaruit |
| Waar staat de berekening? | `packages/engine/src/`, los van de app; elke post levert zijn eigen rekenstappen |
| Hoe weet ik dat de bronnen nog kloppen? | Een wekelijkse controle vergelijkt de versies van de gebruikte wetten en opent een melding bij een wijziging ([ONDERHOUD.md](ONDERHOUD.md)) |
| Wat gebeurt er als een bedrag ontbreekt? | De app rekent het onderdeel niet uit en zegt dat, in plaats van te schatten |

## 4. Hoe het gecontroleerd is, en waar dat ophoudt

- **Bronnen.** Elke parameter is overgenomen uit een officiële bron (wetten.overheid.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, leiden.nl). Parameters met de status `onbevestigd` zijn in de app zichtbaar gemarkeerd.
- **Officiële rekenhulpen.** De toeslagen zijn vergeleken met de proefberekening van Dienst Toeslagen, met verzonnen gegevens. De bedragen kwamen tot op de euro overeen.
- **Tweede narekening.** In november 2026 zijn 22 verzonnen casussen opnieuw nagerekend zonder vooraf de code te lezen. De bijstand kwam in alle casussen overeen; de toeslagen in de zes casussen die bij Dienst Toeslagen zijn nagelopen ook. Beperking: bij die narekening konden de wetteksten zelf niet worden geopend en is deels op niet-officiële overzichten geleund. Het is een bevestiging van de formules, geen tweede controle van elk bedrag.
- **Nog niet gedaan.** De uitkomsten zijn niet nagelopen door een klantmanager of sociaal raadsman, en de app is niet getest met mensen uit de doelgroep.

## 5. Wat niet zeker is

De volledige lijst staat in [OPEN_VRAGEN.md](OPEN_VRAGEN.md). De punten die een uitkomst kunnen raken:

- **Bruto bijstand voor de toeslagen.** De app rekent de netto bijstand terug naar bruto om het jaarinkomen te schatten. De gemeente gebruikt daarvoor de loonheffingstabellen; het verschil is niet getoetst.
- **Reiskostenvergoeding van de werkgever.** De app telt die niet mee als inkomen voor de bijstand. Dat is een aanname.
- **2027.** De bedragen voor 2027 zijn nog niet gepubliceerd. Voor een datum in 2027 rekent de app met de laatste bekende regels en zegt dat erbij.
- **Praktijk in Leiden.** Een paar keuzes volgen de praktijk en niet een beleidsregel, bijvoorbeeld dat bewoners van een woonvorm met begeleiding niets voor het verblijf betalen. Ze staan bij de betreffende regel in REKENREGELS.md.

Zie je iets dat niet klopt? Maak een melding aan in de repository, met de invoer, de uitkomst van de app en de bron waaruit blijkt wat het moet zijn.
