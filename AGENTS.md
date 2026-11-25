# Werken aan deze repository

Een wegwijzer voor wie hier werk overneemt, vooral een geautomatiseerde assistent. Alles wat hieronder staat, staat ook in de gewone documentatie. Dit bestand zegt waar.

## Eerst lezen

1. [README.md](README.md): wat de twee rekenhulpen doen en hoe de repository is opgebouwd.
2. [CONTRIBUTING.md](CONTRIBUTING.md): de afspraken. Lees vooral "Afspraken voor commits en pull requests". Die zijn streng over privacy en over namen in commits.
3. Het document voor uw taak:

| Taak | Document |
| --- | --- |
| Bedragen voor een nieuw jaar (of per 1 juli) | [docs/JAARWISSEL.md](docs/JAARWISSEL.md) |
| Een melding van de bewaking (issue met label `bewaking`) | [docs/ONDERHOUD.md](docs/ONDERHOUD.md), hoofdstuk 3 |
| Een bedrag of regel bijwerken | [docs/ONDERHOUD.md](docs/ONDERHOUD.md), hoofdstuk 2 |
| Teksten voor gebruikers schrijven | [docs/ONDERHOUD.md](docs/ONDERHOUD.md), hoofdstuk 6 |
| Een rekenregel of voorwaarde begrijpen | [docs/RECHT.md](docs/RECHT.md) |
| Waarom iets zo is gebouwd | [docs/BESLUITEN.md](docs/BESLUITEN.md) |
| Hoe de code in elkaar zit | [docs/ARCHITECTUUR.md](docs/ARCHITECTUUR.md) |
| Controleren of iets klopt | [docs/CONTROLE.md](docs/CONTROLE.md) en [audit/README.md](audit/README.md) |
| Wat er nog moet gebeuren | [docs/PLANNING.md](docs/PLANNING.md) en de open issues |

## De belangrijkste regels

- **Geen verzinsels, geen aannames.** Elk bedrag en elke regel komt uit een officiële bron, met de letterlijke tekst. Weet u iets niet? Laat het `ontbrekend` en zeg het.
- **Geen persoonsgegevens.** Geen paden, gebruikersnamen of e-mailadressen in de repository, commits, issues of pull requests. Alleen verzonnen personen in tests.
- **Geen andere rekenhulpen of tools bij naam** in de repository, commits, issues of pull requests. Schrijf wat Leidengeldwijzer of Leidenwerkt doet, niet wat een ander doet.
- **Commits** als `Ian Vriend <ISVISVISV@users.noreply.github.com>`, zonder extra regels in het bericht (zie CONTRIBUTING.md).
- **Eerst vragen** bij alles wat een gebruiker anders ziet. Laat bij vormgeving eerst een afbeelding zien.
- **Teksten** in eenvoudig Nederlands (A2): korte zinnen, "u", geen bijzinnen, geen puntkomma.
- **Toegankelijk** volgens WCAG 2.2 AA, in licht en donker.
- **Alles in de browser.** Geen server, geen externe verzoeken vanuit de app.
- **Via een pull request.** Nooit rechtstreeks naar `main`. Een nieuwe versie maakt de beheerder zelf.
- **Spreek Nederlands** met de beheerder.

## Controles voordat u klaar bent

```bash
npm test                      # regeldata, tests, documenten en samenhang
npm run typecheck
npm run opruimen              # geen ongebruikte code of afhankelijkheden
npm run audit                 # Leidenwerkt; de uitvoer hoort in de commit
npm run audit:leidengeldwijzer
npm run test:e2e              # bij wijzigingen in een app
```

De CI draait dezelfde controles. Verandert de uitvoer van de audit, dan hoort de nieuwe uitvoer in dezelfde commit.
