# Gebruikerstest met personages

De rekentests controleren of de berekening klopt met de regels. Ze zien niet wat een gebruiker niet begrijpt. Daarvoor is deze test: een tester doorloopt de rekenhulp als een aantal verzonnen personen en noteert alles wat verwarrend, dubbel of tegenstrijdig is. De eerste twee rondes (november 2026) vonden onder meer een rekenfout in het jaarbedrag, een link die terugstuurde naar het begin, ontbrekende antwoordopties en bedragen die niet terug te vinden waren.

## Wanneer

- Bij elke nieuwe versie met wijzigingen in vragen, teksten of de uitkomst.
- Na het bijwerken van de bedragen voor een nieuw jaar, als de uitkomst er anders uit kan zien.

## Hoe

1. De tester gebruikt alleen de rekenhulp, zoals een bezoeker: geen broncode, geen documentatie, alleen verzonnen gegevens.
2. Kies zes personen. Neem er vier die nog niet eerder zijn gebruikt (zie de lijst hieronder) en twee uit een vorige ronde, om te zien of de oplossingen werken.
3. Laat de tester de opdracht hieronder uitvoeren en het rapport opleveren.
4. Controleer elk punt zelf voordat er iets verandert. Niet alles is een fout: soms klopt de berekening en ontbreekt alleen uitleg, soms leest de tester iets verkeerd.
5. Verwerk de punten in pull requests en zet in `CHANGELOG.md` wat er is veranderd.
6. Vul de lijst met gebruikte personen hieronder aan.

## Opdracht voor de tester

> Je bent testgebruiker van "Leidenwerkt", een gratis rekenhulp voor inwoners van Leiden met bijstand: https://isvisvisv.github.io/Leidenwerkt/
>
> Je beoordeelt niet of de bedragen kloppen. Je noteert wat een gewoon mens verwarrend, dubbel, tegenstrijdig of onduidelijk vindt. Gebruik alleen de rekenhulp zelf, zoals een bezoeker, en alleen verzonnen gegevens. Open bij elke vraag het i-knopje en lees de uitleg. Gebruik een venster zo smal als een telefoon (ongeveer 390 pixels) als dat kan.
>
> Vul de rekenhulp volledig in voor elk van de zes personen [lijst], met hun eigen kennis en woorden.
>
> Noteer per scherm: een vraag die je niet begrijpt of anders leest dan bedoeld (citeer de vraag en zeg wat jij dacht); een vraag die je al eerder beantwoordde of die niet bij je situatie past; een antwoord waarin je je niet herkent; een uitleg die niet helpt; iets wat je verwachtte en niet zag. Op de uitkomst ook: twee teksten of getallen die elkaar lijken tegen te spreken, een bedrag dat je niet terugvindt of niet gelooft, en of "Wat u nu kunt doen" je echt vertelt wat je moet doen. En alles wat op een smal scherm niet goed werkt.
>
> Lever één tabel per persoon met de kolommen: Scherm | Vraag of tekst (citaat) | Wat ging mis | Ernst (blokkeert / verwarrend / klein) | Voorstel (één zin). Sluit af met de vijf ergste punten. Verzin geen problemen: staat er niets mis, schrijf dan "geen opmerkingen". Zeg aan het eind welke schermen of uitleg je niet hebt geopend.

## Gebruikte personen

| Ronde | Personen |
| --- | --- |
| 1 (november 2026) | Fatma (alleenstaande moeder, huurt, kind 6); Jeroen (24, woont bij moeder); Anna (kamer, meer uren); Mohamed (getrouwd, drie kinderen, koopwoning); Pieter (geen vaste woonplek, medische urenbeperking); Lisa (woonvorm met begeleiding) |
| 2 (november 2026) | Samira (kostgeld bij ouders); Kees (58, kamer, meer uren); Dewi (alleenstaande moeder, twee kinderen naar de opvang); Tom en Ilse (stel, partner met bijbaan); Ahmed (huisgenoten, netto per 4 weken); Marloes (23, studio, medische urenbeperking) |

Nog niet gebruikt, als idee: iemand van 21 met een kind; een stel waarvan één partner AOW-leeftijd nadert; iemand met alimentatie; iemand met een all-in uurloon in de horeca; iemand met een UWV-uitkering naast bijstand; iemand die in 2027 rekent; een ouder met een kind van 17 en een van 19.
