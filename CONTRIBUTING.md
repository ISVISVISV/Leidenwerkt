# Bijdragen

Iedereen mag een wijziging voorstellen. Alleen wat de beheerder heeft gecontroleerd komt online: niemand pusht rechtstreeks naar `main`, alles gaat via een pull request.

## Wat kunt u bijdragen?

- **Een bedrag of regel bijwerken.** Voeg een nieuw YAML-bestand toe in `regels/` (of pas de `geldig_tot` van het vorige aan), met de bron (URL van een officiële publicatie) en de datum waarop u die raadpleegde. Zie [docs/ONDERHOUD.md](docs/ONDERHOUD.md).
- **Een fout melden.** Open een issue. Beschrijf de situatie (huishouden, loon, uren), wat de app uitrekent en wat volgens u klopt, met bron.
- **Een proefpersoon aanleveren.** Een verzonnen of geanonimiseerde situatie met een uitkomst uit een officiële proefberekening of beschikking is zeer waardevol. Zie [testgevallen/README.md](testgevallen/README.md). Zet nooit echte namen, adressen, BSN of dossiernummers in de repository.

## Zo stelt u een wijziging voor

1. Maak een fork of een branch en breng de wijziging aan.
2. Draai `npm test` (regeldata, unit-, eigenschaps- en proefpersonentests, en controle dat `docs/PROEFPERSONEN.md` en de statustabel bijgewerkt zijn; anders eerst `npm run docs`). Bij wijzigingen in de app ook `npm run test:e2e`.
3. Veranderen er snapshots? Verklaar elke wijziging in [docs/CONTROLE.md](docs/CONTROLE.md), hoofdstuk 8.
4. Open een pull request. De CI plaatst een overzicht van de gewijzigde parameters en het effect op de proefpersonen.

## Wat de beheerder controleert

- **Bron**: elke nieuwe of gewijzigde waarde heeft een bron op een officieel domein (wetten.overheid.nl, officielebekendmakingen.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, uwv.nl, leiden.nl). De beheerder opent de bron zelf en vergelijkt de waarde letterlijk. Rekensites van derden tellen niet.
- **Status**: `geverifieerd` alleen als de waarde letterlijk in de officiële bron staat; anders `onbevestigd`.
- **Citaten**: de tekst in een `citaat` (regeldata) of in `packages/rekenkern/src/citaten.ts` staat woord voor woord in de officiële bron. Weglatingen staan als […]. Elke melding bij de uitkomst heeft een brontekst; een test controleert dat.
- **Sprongen**: een bedrag dat meer dan 10% afwijkt van de vorige periode heeft een `notitie` met de reden (de CI weigert het anders).
- **Effect**: het overzicht bij de pull request laat zien wat de wijziging met de proefpersonen doet. Grote of onverwachte verschuivingen worden nagevraagd.
- **Mechanisme of data**: een gewijzigd bedrag hoort alleen in `regels/`. Een gewijzigde voorwaarde of rekenvolgorde hoort in de engine, met tests (zie `packages/rekenkern/src/regimes.ts`).
- **Teksten**: eenvoudig Nederlands (taalniveau A2), concreet, met bedragen en periodes, geen ambtelijke termen. Zie [docs/ONDERHOUD.md](docs/ONDERHOUD.md), hoofdstuk 6.
- **Toegankelijkheid en privacy**: de axe-tests slagen in licht en donker; de app doet geen externe verzoeken.

## Regels voor code

1. Geen bedragen of percentages in code; alles in `regels/`.
2. Geen floats voor geld; gebruik de helpers in `packages/rekenkern/src/geld.ts`.
3. Elke wijziging in de engine heeft tests. `npm test` en `npm run test:e2e` moeten slagen.
4. Geen externe verzoeken vanuit de app (geen analytics, CDN's of externe fonts).
5. Teksten in de app in eenvoudig Nederlands (taalniveau A2).

## Afspraken voor commits en pull requests

Deze afspraken gelden voor iedereen, ook voor een geautomatiseerde assistent die namens de beheerder werkt.

- **Privacy.** Zet nooit paden van een computer, gebruikersnamen, e-mailadressen of andere persoonlijke gegevens in de repository, in commits, in issues of in pull requests.
- **Naam bij commits.** Een assistent die namens de beheerder werkt, commit als `Ian Vriend <ISVISVISV@users.noreply.github.com>`. Geen andere naam en geen privé-e-mailadres.
- **Geen extra regels in commitberichten.** Geen `Co-Authored-By`, geen links naar sessies en geen vermelding van een AI-model of AI-hulpmiddel. Dat geldt ook voor pull requests en de repository. De enige vermelding is de zin in README.md: "Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI."
- **Geen andere rekenhulpen.** Noem geen andere rekenhulpen of tools van anderen bij naam, ook niet om te vergelijken. Schrijf wat onze rekenhulpen doen en waarom.
- **Eén eigenaar.** Alleen Ian Vriend wordt als eigenaar of maker genoemd.
- **Werkwijze.** Elke wijziging gaat via een eigen branch en een pull request. De beheerder voegt samen (squash) als de CI slaagt.
- **Vooraf vragen.** Verandert wat een gebruiker ziet (een vraag, een tekst, een uitkomst of de vormgeving)? Vraag de beheerder eerst. Laat bij een verandering in de vormgeving eerst een afbeelding zien.
- **Besluiten vastleggen.** Een keuze die de rekenhulp vormt, komt in [docs/BESLUITEN.md](docs/BESLUITEN.md), met een nieuw nummer, de datum en de reden.
- **Bronnen.** Alleen officiële bronnen voor wet- en regelgeving, met de letterlijke tekst. Geen aannames. Organisaties buiten de overheid (zoals de Voedselbank) alleen als de gemeente Leiden ze noemt, met de eigen bron van die organisatie.
- **Voor het samenvoegen.** `npm test`, `npm run typecheck`, `npm run opruimen`, `npm run audit`, `npm run audit:leidengeldwijzer` en bij wijzigingen in de app `npm run test:e2e`. De uitvoer van de audit hoort in dezelfde commit.

## Een nieuwe versie

De beheerder maakt de release op GitHub zelf. Wie de versie voorbereidt:

1. verhoogt het versienummer:
   - Leidenwerkt: in `package.json`, `leidenwerkt/package.json`, `packages/rekenkern/package.json` en `packages/ui/package.json`, in `publiccode.yml` (`softwareVersion` en `releaseDate`) en in README.md ("Status");
   - Leidengeldwijzer: in `leidengeldwijzer/package.json` en in README.md ("Status");
2. zet in CHANGELOG.md "Nog niet uitgebracht" om naar het nieuwe nummer, met de datum;
3. levert de tekst voor de release aan de beheerder.

`npm test` controleert dat de versienummers overal gelijk zijn.

## Het nieuwe jaar

De bedragen van een nieuw jaar invoeren? Volg [docs/JAARWISSEL.md](docs/JAARWISSEL.md).
