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
- `scripts/bouw-regels.ts` controleert het schema (Zod), verplichte bronnen, alleen officiële domeinen, overlappende perioden en sprongen van meer dan 10% zonder notitie. Bij een fout stopt de build.
- `regels/bewaking.yaml` beschrijft welke wetten, publicaties en Leidse regelingen wekelijks worden nagelopen (`scripts/bewaking.ts`).

## Rekenengine (`packages/engine`)

- Pure functies; dezelfde invoer geeft altijd dezelfde uitkomst.
- Bedragen met `decimal.js`. Afronden gebeurt bij weergave, behalve waar de uitvoerder dat voorschrijft: toeslagen per maand naar beneden op hele euro's (zie REKENREGELS.md, Afronding).
- `Lezer` haalt parameters op voor de rekendatum en legt vast welke gebruikt zijn. Elke post in de uitkomst draagt zijn eigen stappen, gebruikte parameters, aannames en status.
- Ontbreekt een parameter (status `ontbrekend` of geen regel voor de datum), dan wordt die post niet berekend. Zulke posten vallen in beide situaties buiten het verschil en worden apart genoemd.
- Elke post heeft een `invloed` (ja, nee, onbekend) en een `richting` (daalt of stijgt als het inkomen uit werk stijgt). Daarmee zegt de uitkomst hoe betrouwbaar het kopgetal is en welke kant een fout op gaat (`betrouwbaarheid`), bijvoorbeeld "te gunstig" als de huurtoeslag ontbreekt.
- **Data tegenover mechanisme.** Bedragen staan in `regels/`. Een gewijzigd mechanisme krijgt een regime met een ingangsdatum in `regimes.ts`; de keuze hangt alleen af van de rekendatum. Overgangsrecht kan via `Lezer.op(datum)` regels van een eerdere dag lezen (bijvoorbeeld het oude onderdeel n zoals het luidde op 31 december 2026).

Modules:

| Module | Inhoud |
| --- | --- |
| `belasting.ts` | Box 1-tarief, algemene heffingskorting, arbeidskorting, IACK; bruto uit netto voor toetsingsinkomen |
| `regimes.ts` | Lijst van regimes voor de verrekening van inkomsten, met ingangsdatum |
| `bijstand.ts` | Norm, kostendelersnorm, aanvulling tot de norm |
| `vrijlating.ts` | Vrijlating per regime: art. 31 lid 2 n, r, y en lid 5 (tot en met 2026); art. 34a en overgangsrecht art. 78ff (vanaf 2027) |
| `toeslagen.ts` | Zorgtoeslag, huurtoeslag (7 stappen van Dienst Toeslagen), kindgebonden budget, kinderopvangtoeslag, afronding |
| `bereken.ts` | Twee situaties (nu en met werk), verschil, invloed per post, betrouwbaarheid, terugbetaalrisico toeslagen, signalen |
| `periodes.ts` | Vrijlatingsperioden in gewone taal, per regime |

## Leidengeldwijzer (`regelingen`) en de rekenkern van de regelingen

- `packages/engine/src/regelingen.ts`, functie `checkRegelingen`: per regeling een uitslag met een kans (ja, misschien, nee, info), een uitleg in gewone taal, een groep (gemeente, SVB, UWV, toeslagen, hulp) en de bronnen. Dezelfde regeldata en dezelfde belastingmodule als Leidenwerkt.
- Met de AOW-leeftijd gelden de normen van art. 22 Pw, de AIO-aanvulling van de SVB in plaats van de bijstand, en de belasting voor AOW-gerechtigden (`nettoMetAow`, `brutoJaarMetAow` in `belasting.ts`). Zie BESLUITEN.md, 19 tot en met 25.
- `regelingen/src/formulier.ts`: het formulier, de controle en de vertaling naar de invoer van de rekenkern. `Overzicht.tsx`: het overzicht in tegels en de korte afdruk.
- `scripts/audit-leidengeldwijzer.ts`: vaste en willekeurige verzonnen personen door de echte app, met controles op grenzen, bronnen en teksten.

## Gedeeld (`packages/ui`) en de startpagina (`start`)

- `packages/ui`: formuliervelden, bronvermelding, de knop voor licht en donker, het rode vlak bovenaan (`Kopvlak`) met de lijntekening van Leiden, en de huisstijl.
- `start`: een statische pagina. De lijntekening komt uit `start/scripts/skyline.py`. Dat script schrijft ook `packages/ui/src/skyline.ts`.

## App (`app`)

- React + Vite, eigen componenten, geen state- of CSS-framework.
- Vier stappen: huishouden, woning, werk, uitkomst. De uitkomst heeft een urenschuif en een keuze tussen "de eerste maanden" en "daarna".
- Lettertype Open Sans (SIL Open Font License 1.1) zit in de bundel. De CSP verbiedt netwerkverbindingen.
- Twee builds: statische site (`app/dist`) en één los HTML-bestand (`app/dist-los`).

## Kwaliteit

- `npm test`: regeldata, unit-, grens- en eigenschapstests (fast-check), rekenvoorbeelden van Dienst Toeslagen (`officieel.test.ts`), regimes en overgangsrecht, snapshots 2026 (`snapshot.test.ts`, verklaard in SNAPSHOTS.md), proefpersonen (`testgevallen/`), en controle dat de gegenereerde documentatie bijgewerkt is.
- `npm run docs`: genereert `docs/PROEFPERSONEN.md` en de statustabel in `docs/REKENREGELS.md`.
- Bij een pull request plaatst de CI een overzicht van gewijzigde parameters en het effect op de proefpersonen (`scripts/pr-overzicht.ts`).
- Elke week zoekt `.github/workflows/bewaking.yml` naar nieuwe versies en publicaties en opent issues (`scripts/bewaking.ts`).
- `npm run test:e2e`: Playwright op een mobiel scherm, axe-toegankelijkheidscontrole per stap, en controle dat er geen extern netwerkverzoek is.
- CI draait beide bij elke wijziging; bij een push naar `main` wordt de site op GitHub Pages gezet.

Besluiten staan in [adr/](adr/). Wat nog op de lijst staat, staat in [PLANNING.md](PLANNING.md).
