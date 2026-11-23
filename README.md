# Rekenhulp voor Leidenaren

Twee gratis, open rekenhulpen voor inwoners van Leiden. **[isvisvisv.github.io/Rekenhulp](https://isvisvisv.github.io/Rekenhulp/)**

| Rekenhulp | Vraag | Voor wie | Adres |
| --- | --- | --- | --- |
| **Leidengeldwijzer** | Welke regelingen kunt u krijgen? Bijvoorbeeld de Sleutelpas, de toeslagen en de bijstand. | Inwoners van Leiden van 18 jaar of ouder, ook met AOW | [/leidengeldwijzer](https://isvisvisv.github.io/Rekenhulp/leidengeldwijzer/) (proefversie) |
| **Leidenwerkt** | Hoeveel houdt u per maand meer of minder over als u (meer) gaat werken? | Inwoners van Leiden met bijstand | [/leidenwerkt](https://isvisvisv.github.io/Rekenhulp/leidenwerkt/) |

Voor beide geldt:

- Alles draait in de browser. Er is geen server. Wat iemand invult, verlaat het apparaat niet.
- Elke regel en elk bedrag heeft een officiële bron. Ontbreekt een gegeven, dan rekent de rekenhulp dat onderdeel niet uit in plaats van te gokken.
- De uitkomst is een schatting, geen advies of beslissing.
- Alle tekst is in eenvoudig Nederlands (taalniveau A2) en de apps voldoen aan WCAG 2.2 AA.

De code valt onder de open licentie EUPL-1.2. Het logo van de Sleutelpas (`leidengeldwijzer/src/afbeeldingen/sleutelpas.png`) is van de gemeente Leiden en is rechtenvrij te gebruiken. Het valt niet onder de EUPL.

## Snel starten

```bash
npm install
npm run dev        # ontwikkelserver
npm run dev:leidengeldwijzer  # ontwikkelserver van Leidengeldwijzer
npm run build:start     # de startpagina in start/dist
npm test           # regeldata controleren + unit-, eigenschaps- en proefpersonentests
npm run docs       # PROEFPERSONEN.md en de statustabel in RECHT.md opnieuw maken
npm run test:e2e   # bouwen + browsertest met toegankelijkheidscontrole (axe)
npm run build      # statische site in leidenwerkt/dist
npm run build:los  # één zelfstandig HTML-bestand in leidenwerkt/dist-los
```

Voor `test:e2e` is Chromium nodig (`npx playwright install chromium`) of een bestaande Chrome via `CHROME_PATH=/pad/naar/chrome`.

## Opbouw

| Map | Inhoud |
| --- | --- |
| `regels/` | Normbedragen en parameters als YAML, per onderwerp en periode, met bron |
| `packages/rekenkern/` | Rekenengine in TypeScript, los van de app, met uitlegspoor |
| `leidenwerkt/` | React-app Leidenwerkt (Vite) |
| `leidengeldwijzer/` | Leidengeldwijzer: welke regelingen kunt u krijgen in Leiden? Proefversie |
| `start/` | De startpagina met beide rekenhulpen |
| `packages/ui/` | Formuliervelden, bronvermelding en huisstijl, gedeeld door beide apps |
| `testgevallen/` | Proefpersonen: verzonnen huishoudens met officiële vergelijkingswaarden |
| `scripts/` | Regeldata bouwen en controleren, documentatie genereren, overzicht bij pull requests, bewaking van wetten |
| `e2e/` | Browsertests |
| `docs/` | Documentatie, zie hieronder |

Wijzigingen gaan via pull requests; zie [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentatie

| Document | Voor wie | Inhoud |
| --- | --- | --- |
| [CONTROLE.md](docs/CONTROLE.md) | Wie de rekenhulp wil beoordelen | Steekproef, een met de hand nagerekend voorbeeld, wat wel en niet is gecontroleerd, de gebruikerstest, de risico's en de verklaring van gewijzigde snapshots |
| [RECHT.md](docs/RECHT.md) | Inhoudelijke lezers | Elke rekenregel en voorwaarde met grondslag, bron en status, en de open vragen |
| [PROEFPERSONEN.md](docs/PROEFPERSONEN.md) | Inhoudelijke lezers | Verzonnen huishoudens met de vergelijking met officiële waarden (gegenereerd) |
| [ARCHITECTUUR.md](docs/ARCHITECTUUR.md) | Ontwikkelaars | Opbouw van regeldata, rekenkern en apps |
| [BESLUITEN.md](docs/BESLUITEN.md) | Iedereen die iets wil veranderen | De keuzes die de rekenhulp vormen, met de reden |
| [ONDERHOUD.md](docs/ONDERHOUD.md) | Beheerders | Bedragen bijwerken, bewaking van wetten, werkwijze, teksten schrijven |
| [PLANNING.md](docs/PLANNING.md) | Iedereen | Wat nog op de lijst staat |
| [CHANGELOG.md](CHANGELOG.md) | Iedereen | Wat er per versie is veranderd |

Eigenaar van de documentatie is Ian Vriend.

## Status

Leidenwerkt versie 0.7.0, Leidengeldwijzer versie 0.3.0 (proefversie). Leidenwerkt werkt en is getest met verzonnen huishoudens waarvan de uitkomsten zijn vergeleken met officiële rekenhulpen ([docs/PROEFPERSONEN.md](docs/PROEFPERSONEN.md)), met elf rondes gebruikerstests ([docs/CONTROLE.md](docs/CONTROLE.md), hoofdstuk 6) en met een automatische audit die bij elke wijziging draait ([audit/README.md](audit/README.md)). Leidengeldwijzer heeft een eigen audit met verzonnen personen, ook met AOW en met een uitkering van UWV ([audit/leidengeldwijzer/README.md](audit/leidengeldwijzer/README.md)). De uitkomsten zijn nog niet nagelopen door een klantmanager of sociaal raadsman. De bedragen voor 2027 komen erin zodra ze gepubliceerd zijn.

Wil je nagaan of de rekenhulp te vertrouwen is? Begin bij [docs/CONTROLE.md](docs/CONTROLE.md): een steekproef in de app, één voorbeeld met de hand nagerekend, en wat wel en niet is gecontroleerd.

Wat wel en niet berekend wordt staat in [docs/RECHT.md](docs/RECHT.md); wat nog op de lijst staat in [docs/PLANNING.md](docs/PLANNING.md).

## Makers

Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI.

## Licentie

[EUPL-1.2](LICENSE).
