# Architectuur

Leidenwerkt bestaat uit drie lagen: regeldata, rekenengine en app. Alles draait in de browser van de gebruiker; er is geen server.

```
regels/**/*.yaml ──(scripts/bouw-regels.ts: valideren)──► engine/src/generated/regels.json
                                                                   │
Invoer (formulier) ──► engine: bereken(invoer) ──► Resultaat (posten + uitlegspoor) ──► app
```

## Regeldata

- Eén YAML-bestand per onderwerp en periode (`geldig_van`, `geldig_tot`).
- Elke parameter: `id`, omschrijving, eenheid, waarde, `status`, `bron` (titel, URL, datum geraadpleegd), optioneel `notitie`.
- `scripts/bouw-regels.ts` controleert het schema (Zod), verplichte bronnen en overlappende perioden. Bij een fout stopt de build.

## Rekenengine (`packages/engine`)

- Pure functies; dezelfde invoer geeft altijd dezelfde uitkomst.
- Bedragen met `decimal.js`; afronden gebeurt alleen bij weergave.
- `Lezer` haalt parameters op voor de rekendatum en legt vast welke gebruikt zijn. Elke post in de uitkomst draagt zijn eigen stappen, gebruikte parameters, aannames en status.
- Ontbreekt een parameter (status `ontbrekend` of geen regel voor de datum), dan wordt die post niet berekend. Zulke posten vallen in beide situaties buiten het verschil en worden apart genoemd.

Modules:

| Module | Inhoud |
| --- | --- |
| `belasting.ts` | Box 1-tarief, algemene heffingskorting, arbeidskorting, IACK; bruto uit netto voor toetsingsinkomen |
| `bijstand.ts` | Norm, kostendelersnorm, vrijlating (regime tot 2027 en art. 34a vanaf 2027), aanvulling |
| `toeslagen.ts` | Zorgtoeslag, huurtoeslag, kindgebonden budget, kinderopvangtoeslag |
| `bereken.ts` | Twee situaties (nu en met werk), verschil, signalen, Leidse signalen |

## App (`app`)

- React + Vite, eigen componenten, geen state- of CSS-framework.
- Vier stappen: huishouden, woning, werk, uitkomst. De uitkomst heeft een urenschuif en een keuze tussen "de eerste maanden" en "daarna".
- Lettertype Atkinson Hyperlegible zit in de bundel. De CSP verbiedt netwerkverbindingen.
- Twee builds: statische site (`app/dist`) en één los HTML-bestand (`app/dist-los`).

## Kwaliteit

- `npm test`: regeldata, unit-, grens- en eigenschapstests (fast-check), test dat alleen regels van de rekendatum worden gebruikt.
- `npm run test:e2e`: Playwright op een mobiel scherm, axe-toegankelijkheidscontrole per stap, en controle dat er geen extern netwerkverzoek is.
- CI draait beide bij elke wijziging; bij een push naar `main` wordt de site op GitHub Pages gezet.

Besluiten staan in [adr/](adr/).
