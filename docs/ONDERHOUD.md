# Onderhoud

## 1. Werken via pull requests

Niemand pusht rechtstreeks naar `main`. Elke wijziging gaat via een pull request. De CI draait de tests en de audit, en plaatst een overzicht van de gewijzigde parameters en het effect op de proefpersonen.

Er is één beheerder: Ian Vriend. Een voorstel van iemand anders controleert hij voordat het online komt (zie [CONTRIBUTING.md](../CONTRIBUTING.md) voor wat er gecontroleerd wordt). Zijn eigen wijzigingen voegt hij samen als de CI slaagt. Een tweede beoordelaar is er nog niet. Daarom leunt de controle op de tests, de audit en de vergelijking met officiële bronnen (zie [CONTROLE.md](CONTROLE.md)).

`main` is beschermd met een regel op GitHub (ruleset "main beschermen"): samenvoegen kan alleen via een pull request waarvan de CI-check `test` slaagt. Rechtstreeks pushen, force-pushen en verwijderen van `main` zijn geblokkeerd. `.github/CODEOWNERS` noemt de beheerder als eigenaar van de regeldata, de rekenkern, de proefpersonen, de scripts en de CI. Komt er een tweede beheerder? Zet dan in de regel het aantal verplichte goedkeuringen op 1.

## 2. Bedragen bijwerken

Bedragen veranderen meestal op **1 januari** en **1 juli**, maar niet altijd. De wekelijkse bewaking (hieronder) meldt nieuwe publicaties. Voor de jaarwissel is er een draaiboek met de volgorde, de bronnen per onderwerp en de audit: [JAARWISSEL.md](JAARWISSEL.md).

1. **Zoek de officiële publicatie.**
   - Bijstandsnormen en vrijlatingen: de mededeling in de Staatscourant "gewijzigde bedragen per 1 januari/1 juli" en de wettekst op wetten.overheid.nl (de redactie zet nieuwe bedragen tussen haken: "[Red: per 1 juli 2026: € 289,00]").
   - Belasting: belastingdienst.nl, "Voorlopige aanslag [jaar]: tarieven en heffingskortingen".
   - Toeslagen: de brochures "Berekening zorgtoeslag/huurtoeslag/kindgebonden budget/kinderopvangtoeslag [jaar]" van Dienst Toeslagen (belastingdienst.nl → brochures en publicaties), de Regeling huurtoeslaggrenzen en de standaardpremie in de Staatscourant, het Besluit kinderopvangtoeslag in het Staatsblad.
   - Kinderbijslag: svb.nl, bedragen kinderbijslag.
   - Leiden: lokaleregelgeving.overheid.nl (zoeken op "Leiden") en leiden.nl.
2. **Maak een nieuw bestand** naast het oude, bijvoorbeeld `regels/landelijk/participatiewet/2027-07.yaml`. Kopieer het vorige bestand en pas aan: `geldig_van`, `geldig_tot` (laatste dag of leeg), per parameter de `waarde`, `bron` en `status`. Heeft een parameter een `citaat` (de letterlijke tekst die de app in de pop-up bij de bron toont), neem dan de tekst over uit de nieuwe versie, woord voor woord, met de nieuwe bedragen. Zet in het vorige bestand `geldig_tot` op de dag ervoor.
3. **Status:** `geverifieerd` alleen als u de officiële bron zelf hebt geopend en de waarde letterlijk hebt overgenomen. Anders `onbevestigd`. Onbekend: `ontbrekend` zonder waarde.
4. **Sprong van meer dan 10%?** Zet in `notitie` waarom (bijvoorbeeld een wetswijziging). Zonder notitie weigert de CI het.
5. **Controleer:** `npm test`. Daarna `npm run docs` (statustabel en proefpersonen bijwerken) en, als snapshots veranderen, een verklaring in `docs/CONTROLE.md` (hoofdstuk 8).
6. **Pull request** openen; na goedkeuring zet de CI de nieuwe versie online.

Gewijzigde **regel** in plaats van bedrag (nieuwe voorwaarde, uitzondering, rekenvolgorde)? Dan hoort de wijziging in de engine, met tests. Voor de bijstand: een nieuw regime in `packages/rekenkern/src/regimes.ts` met een ingangsdatum en de regels in `packages/rekenkern/src/modules/vrijlating.ts`.

## 3. Bewaking van wet- en regelgeving

`.github/workflows/bewaking.yml` draait elke maandag (en met de hand via **Actions → Bewaking wet- en regelgeving → Run workflow**). Wat er bewaakt wordt staat in `regels/bewaking.yaml`:

- **Wetten** (Basiswettenbestand, SRU van zoekservice.overheid.nl): Participatiewet, Regeling Participatiewet, Wet en Besluit op de huurtoeslag, Wet op de zorgtoeslag, Wet op het kindgebonden budget, Algemene Kinderbijslagwet, Wet kinderopvang, Besluit kinderopvangtoeslag, Wet IB 2001, Wet LB 1964, Awir.
- **Publicaties** (SRU van repository.overheid.nl): bijstandsbedragen, Regeling huurtoeslaggrenzen, standaardpremie, Besluit kinderopvangtoeslag, kindgebonden budget, Belastingplan, Participatiewet in balans.
- **Leiden** (CVDR): regelingen met woorden als bijstand, inkomenstoeslag, Sleutelpas, kwijtschelding.
- **De bronnen zelf** (`scripts/bronnen.ts`): werkt elke link nog, uit de regeldata, `citaten.ts` en de broncode van de apps? En staat bij elke webpagina (geen pdf) onze letterlijke tekst er nog op? Zo valt het op als de gemeente of Dienst Toeslagen een bedrag of zin op een pagina verandert, ook zonder nieuwe regeling. Stukken korter dan 40 tekens slaat de controle over. Komt de tekst op een pagina pas met JavaScript, zet het adres dan in `bronnen_overslaan`: dan wordt alleen de link gecontroleerd.
- **Zonder externe bron:** een issue 45 dagen vóór elke `geldig_tot` zonder opvolgend bestand, en in de eerste week van juni en december een lijst van alle parameters die `ontbrekend` of `onbevestigd` zijn.

Elke vondst wordt een issue met het label `bewaking`. Er komt nooit twee keer een issue voor dezelfde vondst (de sleutel staat onzichtbaar in het issue).

### Een melding afhandelen

1. Open de link in het issue en lees wat er verandert, en per wanneer.
2. Raakt het de app niet (bijvoorbeeld een wijziging over BES-eilanden of jongeren onder 21)? Sluit het issue met een korte reden.
3. Verandert een **bedrag**: werk de regeldata bij (stappen in hoofdstuk 2) en verwijs in de pull request naar het issue met "Closes #12". GitHub sluit het issue dan vanzelf bij het samenvoegen. Een Nederlands woord als "Sluit" werkt daarvoor niet.
4. Verandert een **regel**: noteer het in `docs/RECHT.md` (deel 4, open vragen), bouw het in de rekenkern met tests, en leg de bron vast in `docs/RECHT.md` (deel 1 of 2).
5. Twijfel over de betekenis? Zet het issue op "vraag" en vraag het na bij de gemeente of een sociaal raadsman.
6. Meldt de bewaking een **fout van de zoekdienst**: controleer de bronnen met de hand; is de zoekdienst veranderd, pas dan `regels/bewaking.yaml` of `scripts/bewaking.ts` aan.

## 4. Waarschuwing in de app

Ligt de datum van vandaag na de laatste geldige regeldata (of ontbreekt een bedrag voor vandaag), dan rekent de app met de meest recente datum waarvoor alles bekend is en toont een duidelijke waarschuwing: met welke datum is gerekend en voor welke onderdelen de bedragen van vandaag nog ontbreken.

Bedragen gelden altijd per datum. Een oud bestand blijft staan; zo kan de app ook voor een eerdere periode rekenen.

## 5. Gebruikerstest

De rekentests zien niet wat een gebruiker niet begrijpt. Doe daarom bij elke nieuwe versie met wijzigingen in vragen, teksten of de uitkomst een gebruikerstest met personages, en na het bijwerken van de bedragen voor een nieuw jaar. De werkwijze en de opdracht staan in [CONTROLE.md](CONTROLE.md), hoofdstuk 6.

## 6. Teksten schrijven

Alle teksten in de rekenhulp zijn in A2-Nederlands, in de stijl van ASD-STE100 (besluit 7 in [BESLUITEN.md](BESLUITEN.md)):

- Korte zinnen. Eén boodschap per zin.
- Gewone woorden. Eén woord per begrip (besluit 8).
- "U" en de actieve vorm.
- Geen bijzinnen als het zonder kan. Geen puntkomma.
- Een stuk zin zonder werkwoord ("Hulp bij de kosten van …") wordt een hele zin.

De audit controleert een deel hiervan, zoals de puntkomma ([audit/README.md](../audit/README.md)). Een tekst die in Leidenwerkt en Leidengeldwijzer hetzelfde is, pas je in beide apps tegelijk aan.
