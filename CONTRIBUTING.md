# Bijdragen

Iedereen mag een wijziging voorstellen. Alleen wat de beheerder heeft gecontroleerd komt online: niemand pusht rechtstreeks naar `main`, alles gaat via een pull request.

## Wat kunt u bijdragen?

- **Een bedrag of regel bijwerken.** Voeg een nieuw YAML-bestand toe in `regels/` (of pas de `geldig_tot` van het vorige aan), met de bron (URL van een officiële publicatie) en de datum waarop u die raadpleegde. Zie [docs/ONDERHOUD.md](docs/ONDERHOUD.md).
- **Een fout melden.** Open een issue. Beschrijf de situatie (huishouden, loon, uren), wat de app uitrekent en wat volgens u klopt, met bron.
- **Een proefpersoon aanleveren.** Een verzonnen of geanonimiseerde situatie met een uitkomst uit een officiële proefberekening of beschikking is zeer waardevol. Zie [testgevallen/README.md](testgevallen/README.md). Zet nooit echte namen, adressen, BSN of dossiernummers in de repository.

## Zo stelt u een wijziging voor

1. Maak een fork of een branch en breng de wijziging aan.
2. Draai `npm test` (regeldata, unit-, eigenschaps- en proefpersonentests, en controle dat `docs/PROEFPERSONEN.md` en de statustabel bijgewerkt zijn; anders eerst `npm run docs`). Bij wijzigingen in de app ook `npm run test:e2e`.
3. Veranderen er snapshots? Verklaar elke wijziging in [docs/SNAPSHOTS.md](docs/SNAPSHOTS.md).
4. Open een pull request. De CI plaatst een overzicht van de gewijzigde parameters en het effect op de proefpersonen.

## Wat de beheerder controleert

- **Bron**: elke nieuwe of gewijzigde waarde heeft een bron op een officieel domein (wetten.overheid.nl, officielebekendmakingen.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, leiden.nl). De beheerder opent de bron zelf en vergelijkt de waarde letterlijk. Rekensites van derden tellen niet.
- **Status**: `geverifieerd` alleen als de waarde letterlijk in de officiële bron staat; anders `onbevestigd`.
- **Citaten**: de tekst in een `citaat` (regeldata) of in `packages/engine/src/citaten.ts` staat woord voor woord in de officiële bron. Weglatingen staan als […]. Elke melding bij de uitkomst heeft een brontekst; een test controleert dat.
- **Sprongen**: een bedrag dat meer dan 10% afwijkt van de vorige periode heeft een `notitie` met de reden (de CI weigert het anders).
- **Effect**: het overzicht bij de pull request laat zien wat de wijziging met de proefpersonen doet. Grote of onverwachte verschuivingen worden nagevraagd.
- **Mechanisme of data**: een gewijzigd bedrag hoort alleen in `regels/`. Een gewijzigde voorwaarde of rekenvolgorde hoort in de engine, met tests (zie `packages/engine/src/regimes.ts`).
- **Teksten**: begrijpelijk Nederlands (B1), concreet, met bedragen en periodes, geen ambtelijke termen.
- **Toegankelijkheid en privacy**: de axe-tests slagen in licht en donker; de app doet geen externe verzoeken.

## Regels voor code

1. Geen bedragen of percentages in code; alles in `regels/`.
2. Geen floats voor geld; gebruik de helpers in `packages/engine/src/geld.ts`.
3. Elke wijziging in de engine heeft tests. `npm test` en `npm run test:e2e` moeten slagen.
4. Geen externe verzoeken vanuit de app (geen analytics, CDN's of externe fonts).
5. Teksten in de app in begrijpelijk Nederlands (taalniveau B1).
