# Risicoregister

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
| R9 | **Toegankelijkheid** onvoldoende voor mensen met beperkte digitale vaardigheden. | Middel | Hoog | B1-taal, axe-tests in CI, test met iemand uit de doelgroep. |
| R10 | **Privacy**: per ongeluk een externe bron (font, CDN, analytics) die verkeer genereert. | Laag | Middel | Playwright-test die faalt bij elk netwerkverzoek na het laden. |
| R11 | **Naamverwarring** met een gemeentelijk programma. | Laag | Laag | Zoektocht naar "Leidenwerkt" / "Leiden Werkt"leverde op 4-11-2026 geen bestaand gebruik op. |
| R12 | **Eén onderhouder.** Als die stopt, veroudert de app. | Middel | Hoog | Documentatie voor opvolgers, open licentie (EUPL-1.2), duidelijke bijdrageregels; app toont de datum van de laatst gecontroleerde regels. |
