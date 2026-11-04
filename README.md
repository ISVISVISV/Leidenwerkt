# Leidenwerkt

Gratis, open rekenhulp voor inwoners van Leiden met bijstand. De vraag die de app beantwoordt: **hoeveel houd ik per maand meer of minder over als ik (meer) ga werken?**

- Alles draait in de browser. Er is geen server; invoer verlaat het apparaat niet.
- Elke regel en elk bedrag heeft een officiële bron en een status (`geverifieerd`, `onbevestigd`, `ontbrekend`). Ontbreekt een gegeven, dan rekent de app dat onderdeel niet uit in plaats van te gokken.
- De uitkomst is een inschatting, geen advies of beslissing.

## Snel starten

```bash
npm install
npm run dev        # ontwikkelserver
npm test           # regeldata controleren + unit- en eigenschapstests
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
| `e2e/` | Browsertests |
| `docs/` | Rekenregels, architectuur, onderhoud, risico's, open vragen, besluiten |

Zie [docs/ARCHITECTUUR.md](docs/ARCHITECTUUR.md) en [docs/ONDERHOUD.md](docs/ONDERHOUD.md).

## Status

Werkende eerste versie (MVP in opbouw). Wat al wel en niet berekend wordt staat in [docs/REKENREGELS.md](docs/REKENREGELS.md).

## Makers

Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI.

## Licentie

[EUPL-1.2](LICENSE).
