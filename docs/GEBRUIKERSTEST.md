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

Vervang [personen] door de zes gekozen personen, elk met leeftijd, huishouden, woning en het werk dat ze overwegen.

> Je bent testgebruiker van "Leidenwerkt", een gratis rekenhulp voor inwoners van Leiden met bijstand: https://isvisvisv.github.io/Leidenwerkt/
>
> **Doel.** Vind plekken waar een gewone gebruiker vastloopt, iets verkeerd begrijpt, of twee dingen ziet die elkaar tegenspreken. Je hoeft bedragen niet zelf na te rekenen, maar meld het wel als een bedrag niet te geloven is of als twee bedragen of teksten elkaar tegenspreken.
>
> **Werkwijze.** Gebruik alleen de rekenhulp zelf, zoals een bezoeker: geen broncode, geen documentatie, alleen verzonnen gegevens. Gebruik een venster zo smal als een telefoon (ongeveer 390 pixels) als dat kan. Vul alles met de hand in, niet met een script. Open bij elke vraag het i-knopje. Klik op de uitkomst op de koppen onder "Goed om te weten" en op de links onder "Wat u nu kunt doen".
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
> **Rapport.** Eén tabel per persoon: Scherm | Vraag of tekst (citaat) | Wat ging mis | Ernst | Voorstel. Ernst is "blokkeert" (je kunt niet verder, of de uitkomst klopt voor deze persoon niet), "verwarrend" (je kunt verder maar twijfelt of begrijpt het verkeerd) of "klein" (storend, maar je begrijpt het). Niets mis? Schrijf "geen opmerkingen"; verzin geen problemen. Sluit af met de vijf ergste punten, de controlevragen bij de herhaalde personen, en eerlijk welke schermen, i-knopjes of uitklapblokken je niet hebt geopend en wat je niet met de hand hebt gedaan.

Werk de lijst "Wat je niet meldt" bij als er een nieuwe bewuste keuze bij komt; de redenen staan in [BESLUITEN.md](BESLUITEN.md) of in de pull request.

## Gebruikte personen

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

## Andere soorten tests

**Automatische audit.** `npm run audit` doet zonder AI wat testers eerder met de hand deden: omwegen vergelijken, bedragen in zinnen naast de tabel leggen, de afdruk op overlap controleren, de urenschuif op verspringen door afronding, en teksten op ";" en bedragen zonder punt. Personen met bedragen uit een officiële bron (zoals de proefberekening van Dienst Toeslagen) staan erin met `verwacht`, of als bestand in audit/extern. De audit draait bij elke wijziging op GitHub. Zie [audit/README.md](../audit/README.md). Een tester is daarna vooral nodig voor begrijpelijkheid en voor nieuwe functies, en kan de tekstbestanden in audit/uitvoer lezen in plaats van door de site te klikken.

Naast de test met personages zijn twee andere tests nuttig gebleken (ronde 6):

- **Omwegen.** De tester vult elk scenario twee keer in: één keer meteen goed, en één keer met een omweg (eerst iets anders invullen, dan wijzigen via "Gegevens aanpassen", "Vorige stap", de terugknop van de browser of "Opnieuw beginnen"). Elk verschil in de uitkomst is een fout. Zo vond ronde 6 dat de urenschuif terugsprong en dat oude bedragen bleven staan in een veld met een andere betekenis.
- **Toeslagen tegen de proefberekening.** De tester neemt het geschatte jaarinkomen over uit "Hoe is dit berekend?" en vult het met dezelfde situatie in bij de proefberekening van Dienst Toeslagen. Zet de uitkomsten daarna als toets in `packages/engine/test/proefberekening.test.ts` (de formules), of met het hele formulier als `verwacht` in de audit (zie audit/README.md). Dat laatste toetst ook de schatting van het inkomen.

Doe ook deze tests na grote wijzigingen in de vragen of in de berekening van de toeslagen. Laat de tester ook hier geen voorstellen doen, alleen beschrijven wat er gebeurt.
