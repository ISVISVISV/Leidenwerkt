# Onderhoud

## 1. Werken via pull requests

Niemand pusht rechtstreeks naar `main`. Elke wijziging gaat via een pull request; de CI draait de tests en plaatst een overzicht van de gewijzigde parameters en het effect op de proefpersonen. De beheerder keurt goed (zie [CONTRIBUTING.md](../CONTRIBUTING.md) voor wat er gecontroleerd wordt).

### Branch protection instellen (eenmalig, door de eigenaar op GitHub)

1. Ga naar **github.com/ISVISVISV/Leidenwerkt → Settings → Branches** (of **Rules → Rulesets**).
2. Klik **Add branch ruleset** (of **Add rule** bij de klassieke instelling). Naam: `main beschermen`. Enforcement status: **Active**.
3. Target branches: **Include default branch** (`main`).
4. Zet aan:
   - **Restrict deletions**
   - **Require a pull request before merging**, met **Required approvals: 1**, **Dismiss stale pull request approvals when new commits are pushed** en **Require review from Code Owners** (dan geldt `.github/CODEOWNERS`).
   - **Require status checks to pass**, met **Require branches to be up to date before merging**. Voeg als verplichte check toe: `test` (uit de workflow CI). De check verschijnt in de lijst nadat de CI één keer op een pull request heeft gedraaid.
   - **Block force pushes**
5. Bypass list: leeg laten. Wilt u als enige beheerder zelf kunnen samenvoegen zonder tweede reviewer, zet dan **Required approvals** op 0 en laat **Require review from Code Owners** aan; uw eigen goedkeuring is dan niet nodig, maar de CI wel. (GitHub staat niet toe dat u uw eigen pull request goedkeurt.)
6. Opslaan. Controleer onder **Settings → Actions → General** dat **Workflow permissions** op *Read repository contents* staat en dat **Allow GitHub Actions to create and approve pull requests** uit staat. De workflows vragen zelf de rechten die ze nodig hebben (issues, reacties bij pull requests).
7. Onder **Settings → Pages**: Source = *GitHub Actions* (staat al zo als de site werkt).

## 2. Bedragen bijwerken

Bedragen veranderen meestal op **1 januari** en **1 juli**, maar niet altijd. De wekelijkse bewaking (hieronder) meldt nieuwe publicaties.

1. **Zoek de officiële publicatie.**
   - Bijstandsnormen en vrijlatingen: de mededeling in de Staatscourant "gewijzigde bedragen per 1 januari/1 juli" en de wettekst op wetten.overheid.nl (de redactie zet nieuwe bedragen tussen haken: "[Red: per 1 juli 2026: € 289,00]").
   - Belasting: belastingdienst.nl, "Voorlopige aanslag [jaar]: tarieven en heffingskortingen".
   - Toeslagen: de brochures "Berekening zorgtoeslag/huurtoeslag/kindgebonden budget/kinderopvangtoeslag [jaar]" van Dienst Toeslagen (belastingdienst.nl → brochures en publicaties), de Regeling huurtoeslaggrenzen en de standaardpremie in de Staatscourant, het Besluit kinderopvangtoeslag in het Staatsblad.
   - Kinderbijslag: svb.nl, bedragen kinderbijslag.
   - Leiden: lokaleregelgeving.overheid.nl (zoeken op "Leiden") en leiden.nl.
2. **Maak een nieuw bestand** naast het oude, bijvoorbeeld `regels/landelijk/participatiewet/2027-07.yaml`. Kopieer het vorige bestand en pas aan: `geldig_van`, `geldig_tot` (laatste dag of leeg), per parameter de `waarde`, `bron` en `status`. Zet in het vorige bestand `geldig_tot` op de dag ervoor.
3. **Status:** `geverifieerd` alleen als u de officiële bron zelf hebt geopend en de waarde letterlijk hebt overgenomen. Anders `onbevestigd`. Onbekend: `ontbrekend` zonder waarde.
4. **Sprong van meer dan 10%?** Zet in `notitie` waarom (bijvoorbeeld een wetswijziging). Zonder notitie weigert de CI het.
5. **Controleer:** `npm test`. Daarna `npm run docs` (statustabel en proefpersonen bijwerken) en, als snapshots veranderen, een verklaring in `docs/SNAPSHOTS.md`.
6. **Pull request** openen; na goedkeuring zet de CI de nieuwe versie online.

Gewijzigde **regel** in plaats van bedrag (nieuwe voorwaarde, uitzondering, rekenvolgorde)? Dan hoort de wijziging in de engine, met tests. Voor de bijstand: een nieuw regime in `packages/engine/src/regimes.ts` met een ingangsdatum en de regels in `packages/engine/src/modules/vrijlating.ts`.

## 3. Bewaking van wet- en regelgeving

`.github/workflows/bewaking.yml` draait elke maandag (en met de hand via **Actions → Bewaking wet- en regelgeving → Run workflow**). Wat er bewaakt wordt staat in `regels/bewaking.yaml`:

- **Wetten** (Basiswettenbestand, SRU van zoekservice.overheid.nl): Participatiewet, Regeling Participatiewet, Wet en Besluit op de huurtoeslag, Wet op de zorgtoeslag, Wet op het kindgebonden budget, Algemene Kinderbijslagwet, Wet kinderopvang, Besluit kinderopvangtoeslag, Wet IB 2001, Wet LB 1964, Awir.
- **Publicaties** (SRU van repository.overheid.nl): bijstandsbedragen, Regeling huurtoeslaggrenzen, standaardpremie, Besluit kinderopvangtoeslag, kindgebonden budget, Belastingplan, Participatiewet in balans.
- **Leiden** (CVDR): regelingen met woorden als bijstand, inkomenstoeslag, Sleutelpas, kwijtschelding.
- **Zonder externe bron:** een issue 45 dagen vóór elke `geldig_tot` zonder opvolgend bestand, en in de eerste week van juni en december een lijst van alle parameters die `ontbrekend` of `onbevestigd` zijn.

Elke vondst wordt een issue met het label `bewaking`. Er komt nooit twee keer een issue voor dezelfde vondst (de sleutel staat onzichtbaar in het issue).

### Een melding afhandelen

1. Open de link in het issue en lees wat er verandert, en per wanneer.
2. Raakt het de app niet (bijvoorbeeld een wijziging over BES-eilanden of jongeren onder 21)? Sluit het issue met een korte reden.
3. Verandert een **bedrag**: werk de regeldata bij (stappen in hoofdstuk 2) en verwijs in de pull request naar het issue ("Sluit #12").
4. Verandert een **regel**: noteer het in `docs/OPEN_VRAGEN.md`, bouw het in de engine met tests, en leg de bron vast in `docs/REKENREGELS.md`.
5. Twijfel over de betekenis? Zet het issue op "vraag" en vraag het na bij de gemeente of een sociaal raadsman.
6. Meldt de bewaking een **fout van de zoekdienst**: controleer de bronnen met de hand; is de zoekdienst veranderd, pas dan `regels/bewaking.yaml` of `scripts/bewaking.ts` aan.

## 4. Waarschuwing in de app

Ligt de datum van vandaag na de laatste geldige regeldata (of ontbreekt een bedrag voor vandaag), dan rekent de app met de meest recente datum waarvoor alles bekend is en toont een duidelijke waarschuwing: met welke datum is gerekend en voor welke onderdelen de bedragen van vandaag nog ontbreken.

Bedragen gelden altijd per datum. Een oud bestand blijft staan; zo kan de app ook voor een eerdere periode rekenen.
