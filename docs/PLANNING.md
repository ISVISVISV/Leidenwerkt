# Planning

Wat er nog op de lijst staat.

## Stroomlijnen en opschonen (afgesproken op 23 november 2026)

Elke stap is een eigen pull request. De uitkomst voor de gebruiker blijft gelijk; de vastgelegde uitvoer van de audit bewaakt dat. Verandert er toch iets voor de gebruiker, dan eerst akkoord van Ian.

- [x] Stap 0: versie 0.7.0 uitbrengen.
- [x] Stap 1: namen opschonen. De map `app` heet nu `leidenwerkt`, de map `regelingen` heet nu `leidengeldwijzer`. De pakketten heten `@rekenhulp/rekenkern` en `@rekenhulp/ui`. De adressen van de site blijven gelijk.
- [x] Stap 2: de rekenkern van Leidengeldwijzer opdelen. Eén bestand per aanbieder (gemeente, Sleutelpas, SVB, UWV, toeslagen, hulp) en een gedeeld deel voor grenzen en vermogen. De teksten per regeling op één plek. Geen code meer die in teksten zoekt om een bron toe te voegen.
- [x] Stap 3: documentatie stroomlijnen naar ongeveer 7 documenten (README, ARCHITECTUUR, BESLUITEN met de ADR's, RECHT, ONDERHOUD, CONTROLE, PLANNING). Een automatische controle op hetzelfde versienummer overal en op oude woorden. Eigenaar: Ian Vriend.
- [x] Stap 4: 8 personen van de audit van Leidengeldwijzer door de proefberekening van Dienst Toeslagen. Alle 21 bedragen gelijk. Vastgelegd als `verwacht` bij de personen zelf in `audit/leidengeldwijzer/personen.ts` (niet in `extern/`: die map is voor personen van anderen). Zie CONTROLE.md, hoofdstuk 4.
- [x] Stap 5: "Wat u moet meenemen": per regeling de papieren voor de aanvraag, uit officiële bronnen, in A2 en kort. Gebouwd als "Wat heeft u nodig?" in het venster van 13 regelingen (`packages/rekenkern/src/regelingen/meenemen.ts`, besluit 33). Niet op de afdruk: die blijft kort.
- [x] Stap 6: opruimen. knip zoekt nu bij elke wijziging naar ongebruikte code en afhankelijkheden (`npm run opruimen`). Leidenwerkt heeft per stap van het formulier een eigen bestand.
- [ ] Stap 7: `packages/rekenkern/src/bereken.ts` (ongeveer 1.150 regels) opdelen in kleinere bestanden, zoals de regelingen in stap 2. Pas **na** de jaarwissel naar 2027, zodat twee grote wijzigingen aan de rekenkern elkaar niet in de weg zitten (afgesproken op 25 november 2026). Vangnet: de vastgelegde uitvoer van de audit, de snapshots en de proefpersonen in `testgevallen/` moeten gelijk blijven.

Niet doen (besloten op 23 november 2026): een melding over de jaarwissel (het is nog een testversie; de echte release is waarschijnlijk op 1 januari 2027), een koppeling tussen Leidengeldwijzer en Leidenwerkt (Leidengeldwijzer is bewust los gebouwd), een herinnering in de agenda, en "wat als er iets verandert" (behalve de zin "Verandert uw situatie? Doe de check dan opnieuw."). Afgeronde punten staan in de geschiedenis van de pull requests; open vragen over de regels staan in [RECHT.md](RECHT.md), deel 4.

## Regeldata

- [ ] Bijstandsnormen, belasting en toeslagen 2027 invoeren zodra ze gepubliceerd zijn (de bewaking opent hiervoor issues, verwacht begin december 2026).
- [ ] Kinderopvangtoeslag 2027 verwerken (Stb. 2026, 308). Wacht op de andere bedragen van 2027 (besluit van Ian, 23 november 2026).

## Rekenhulp

- [ ] Leidengeldwijzer: bijstand bij studiefinanciering vanaf 27 jaar en bij een stel waarvan één partner studeert. Wacht op de antwoorden van collega's (RECHT.md, deel 2, vraag 6). Daarna bouwen, en die vraag weer weghalen.
- [ ] Leidengeldwijzer: toeslagpartner vanaf 2027. Opnieuw bekijken bij de jaarwissel (afgesproken op 25 november 2026). Nu besloten: niets bouwen.
  - **Het probleem.** Leidengeldwijzer vraagt alleen "Woont u samen met een partner?". Dat is de partner van de Participatiewet (art. 3). De toeslagen rekenen we met dezelfde partner. Maar de toeslagen kijken naar de partner van de Awir, art. 3. Dat is niet altijd dezelfde persoon.
  - **Awir art. 3, versie 2026.** Naast de fiscale partner (art. 5a AWR) ook wie op hetzelfde adres staat en: samen een kind heeft, een kind van de ander heeft erkend, als pensioenpartner is aangemeld, samen een eigen woning heeft, (beiden meerderjarig) met een minderjarig kind van een van beiden op het adres woont (lid 2, onderdeel e), of vorig jaar al partner was (lid 2, onderdeel f). Bijna elk stel dat samenwoont, is dan partner. De fout is nu klein.
  - **Awir art. 3, versie 2027.** Lid 1: "De echtgenoot of geregistreerd partner van de belanghebbende wordt als partner van de belanghebbende aangemerkt." Lid 2: zonder echtgenoot of geregistreerd partner alleen wie op hetzelfde adres staat, beiden 18 jaar of ouder, en: a. notarieel samenlevingscontract; b. samen een kind; c. een kind van de ander erkend; d. als partner aangemeld voor een pensioenregeling; e. samen een eigen woning waar beiden wonen. De onderdelen e en f van 2026 vervallen. Bron: wetten.overheid.nl/BWBR0018472/2027-01-01, en de pagina "Toeslagpartner voor de toeslagen" van Dienst Toeslagen.
  - **Wie het raakt in 2027.** Stellen die niet getrouwd zijn, geen kind samen hebben en huren: de zorgtoeslag (en het kindgebonden budget) rekenen we dan met een partner die niet meetelt. En stiefgezinnen: de ouder krijgt het kindgebonden budget misschien als alleenstaande ouder. De fout gaat één kant op: te laag, of "waarschijnlijk niet". Voor de doelgroep is dat de ergste fout, want dan vraagt iemand niets aan.
  - **Schets, als we het bouwen.** Eén vraag, alleen bij een partner, en alleen als Leidengeldwijzer met de regels van 2027 rekent: "Geldt een van deze dingen voor u en uw partner?" met de lijst: "U bent getrouwd, of geregistreerd partner." / "U heeft samen een kind." / "Een van u heeft het kind van de ander erkend." / "U heeft een samenlevingscontract bij de notaris." / "U heeft samen een koophuis en u woont daar allebei." / "U staat bij het pensioen van de ander als partner." Keuzes: Ja / Nee / Ik weet het niet. Bij Nee: zorgtoeslag, kindgebonden budget en kinderopvangtoeslag zonder partner, huurtoeslag met de partner als medebewoner, en bij de toeslagen "Klopt dit niet? Dan moet u de toeslag later terugbetalen." Bij "Ik weet het niet": "misschien". De bijstand en de Leidse regelingen blijven de partner van de Participatiewet gebruiken. Eerst nagaan: het bedrag voor een alleenstaande ouder in het kindgebonden budget, en of de huurtoeslag de partner dan echt als medebewoner telt.
  - **Afweging.** Leidengeldwijzer is sterk omdat het weinig vragen stelt (Ian, 25 november 2026). Een vraag erbij moet dus echt iets opleveren.
- [ ] Leiden: de kwijtschelding van gemeentelijke belastingen als bedrag (nu alleen een melding); daarvoor zijn de tarieven en de rekenregels voor de betalingscapaciteit nodig.

- [ ] Leidengeldwijzer: op de afdruk ook de contactgegevens van de SVB en UWV, als er een tegel van die organisatie op staat. UWV: "Voor de meeste vragen belt u UWV via 088 898 92 94." (uwv.nl/nl/contact/telefoonnummer). Het nummer van de SVB hangt af van de woonplaats; de pagina daarvoor laadt alleen met JavaScript.

## Toetsing

- [ ] Versie 1.0.0 van beide rekenhulpen, als de bedragen en regels van 2027 erin staan (besluit van Ian, 24 november 2026). Leidengeldwijzer blijft tot dan niet vindbaar in zoekmachines.
