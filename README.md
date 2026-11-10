# Leidenwerkt

Gratis, open rekenhulp voor inwoners van Leiden met bijstand. De vraag die de app beantwoordt: **hoeveel houd ik per maand meer of minder over als ik (meer) ga werken?**

**Probeer het: [isvisvisv.github.io/Leidenwerkt](https://isvisvisv.github.io/Leidenwerkt/)**

- Alles draait in de browser. Er is geen server; invoer verlaat het apparaat niet.
- Elke regel en elk bedrag heeft een officiële bron en een status (`geverifieerd`, `onbevestigd`, `ontbrekend`). Ontbreekt een gegeven, dan rekent de app dat onderdeel niet uit in plaats van te gokken.
- De uitkomst is een inschatting, geen advies of beslissing.

## Snel starten

```bash
npm install
npm run dev        # ontwikkelserver
npm test           # regeldata controleren + unit-, eigenschaps- en proefpersonentests
npm run docs       # PROEFPERSONEN.md en de statustabel in REKENREGELS.md opnieuw maken
npm run test:e2e   # bouwen + browsertest met toegankelijkheidscontrole (axe)
npm run build      # statische site in app/dist
npm run build:los  # één zelfstandig HTML-bestand in app/dist-los
```

Voor `test:e2e` is Chromium nodig (`npx playwright install chromium`) of een bestaande Chrome via `CHROME_PATH=/pad/naar/chrome`.

## Opbouw

| Map | Inhoud |
| --- | --- |
| `regels/` | Normbedragen en parameters als YAML, per onderwerp en periode, met bron |
| `packages/engine/` | Rekenengine in TypeScript, los van de app, met uitlegspoor |
| `app/` | React-app (Vite) |
| `testgevallen/` | Proefpersonen: verzonnen huishoudens met officiële vergelijkingswaarden |
| `scripts/` | Regeldata bouwen en controleren, documentatie genereren, overzicht bij pull requests, bewaking van wetten |
| `e2e/` | Browsertests |
| `docs/` | Documentatie, zie hieronder |

Wijzigingen gaan via pull requests; zie [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentatie

| Document | Voor wie | Inhoud |
| --- | --- | --- |
| [CONTROLE.md](docs/CONTROLE.md) | Wie de rekenhulp wil beoordelen | Steekproef, een met de hand nagerekend voorbeeld, wat wel en niet is gecontroleerd |
| [REKENREGELS.md](docs/REKENREGELS.md) | Inhoudelijke lezers | Elke rekenregel met grondslag, bron en status |
| [OPEN_VRAGEN.md](docs/OPEN_VRAGEN.md) | Inhoudelijke lezers | Wat nog niet zeker is en waar het antwoord te vinden is |
| [PROEFPERSONEN.md](docs/PROEFPERSONEN.md) | Inhoudelijke lezers | Verzonnen huishoudens met de vergelijking met officiële waarden (gegenereerd) |
| [ARCHITECTUUR.md](docs/ARCHITECTUUR.md) | Ontwikkelaars | Opbouw van regeldata, rekenkern en app |
| [ONDERHOUD.md](docs/ONDERHOUD.md) | Beheerders | Bedragen bijwerken, bewaking van wetten, werkwijze |
| [BESLUITEN.md](docs/BESLUITEN.md) | Ontwikkelaars | De keuzes die de rekenhulp vormen, met de reden |
| [SNAPSHOTS.md](docs/SNAPSHOTS.md) | Ontwikkelaars | Waarom een vastgelegde uitkomst is gewijzigd |
| [RISICOS.md](docs/RISICOS.md) | Beheerders | Risico's en de maatregel per risico |
| [PLANNING.md](docs/PLANNING.md) | Iedereen | Wat nog op de lijst staat |
| [CHANGELOG.md](CHANGELOG.md) | Iedereen | Wat er per versie is veranderd |

## Status

Versie 0.2.0: de rekenhulp werkt en is getest met verzonnen huishoudens waarvan de uitkomsten zijn vergeleken met officiële rekenhulpen ([docs/PROEFPERSONEN.md](docs/PROEFPERSONEN.md)). De uitkomsten zijn nog niet nagelopen door een klantmanager of sociaal raadsman. De bedragen voor 2027 komen erin zodra ze gepubliceerd zijn.

Wil je nagaan of de rekenhulp te vertrouwen is? Begin bij [docs/CONTROLE.md](docs/CONTROLE.md): een steekproef in de app, één voorbeeld met de hand nagerekend, en wat wel en niet is gecontroleerd.

Wat wel en niet berekend wordt staat in [docs/REKENREGELS.md](docs/REKENREGELS.md); wat nog op de lijst staat in [docs/PLANNING.md](docs/PLANNING.md).

## Makers

Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI.

## Licentie

[EUPL-1.2](LICENSE).
