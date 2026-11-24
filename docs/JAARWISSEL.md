# Jaarwissel: de bedragen van een nieuw jaar invoeren

Een draaiboek voor één keer per jaar, meestal in december. Ook voor een wijziging op 1 juli. Het werkt voor een mens en voor een geautomatiseerde assistent. Volg de stappen op volgorde. Sla geen stap over zonder dat in de pull request te zeggen.

Hieronder staat "2027" als voorbeeld. Lees voor een ander jaar het jaar dat u invoert.

Wat er in algemene zin bij het bijwerken van bedragen hoort, staat in [ONDERHOUD.md](ONDERHOUD.md), hoofdstuk 2 en 3. Dit draaiboek zegt wat er bij een jaarwissel bij komt: de volgorde, de audit en wat de beheerder beslist.

## 0. Voor u begint

- Lees de afspraken in [CONTRIBUTING.md](../CONTRIBUTING.md), vooral "Afspraken voor commits en pull requests".
- Lees in [PLANNING.md](PLANNING.md) wat er voor dit jaar al besloten is. Voorbeeld: de kinderopvangtoeslag van 2027 wacht tot de andere bedragen van 2027 er zijn (besluit van Ian Vriend, 23 november 2026).
- Lees de open issues met het label `bewaking`. Dat is de takenlijst:
  - het issue "Regeldata loopt af op … zonder opvolger" noemt elke parameter die nog een waarde voor het nieuwe jaar nodig heeft;
  - de andere issues noemen een nieuwe publicatie, met de link.
- Draai `npm ci`, `npm test`, `npm run audit` en `npm run audit:leidengeldwijzer`. Alles moet slagen voordat u iets verandert. Dan weet u dat een fout later door uw wijziging komt.

## 1. Eerst: wat nu al geldt

Gaat een issue over regels die **dit** jaar gelden (bijvoorbeeld een nieuwe versie van de Leidse beleidsregels 2026)? Doe dat eerst, in een eigen pull request. Een fout daarin raakt gebruikers nu al. Werkwijze: ONDERHOUD.md, hoofdstuk 3, "Een melding afhandelen".

## 2. Welke bestanden, en waar de bron staat

Maak per onderwerp een nieuw bestand naast het oude (ONDERHOUD.md, hoofdstuk 2, stap 2). Zet in het oude bestand `geldig_tot` op de dag ervoor, als dat nog niet zo is.

| Map in `regels/` | Nieuw bestand | Bron | Wanneer verwacht |
| --- | --- | --- | --- |
| `landelijk/participatiewet/` | `2027-01.yaml` bestaat al, met `ontbrekend` | Staatscourant, "gewijzigde bedragen per 1 januari 2027", en de wettekst op wetten.overheid.nl | begin december |
| `landelijk/wml/` | `2027.yaml` | Staatscourant, bedragen minimumloon per 1 januari | november of december |
| `landelijk/belasting/` | `2027.yaml` en `2027-aow.yaml` | belastingdienst.nl, tarieven en heffingskortingen 2027 | december |
| `landelijk/aow/` | `2027.yaml` | svb.nl, bedragen AOW per 1 januari | december |
| `landelijk/kinderbijslag/` | `2027-01.yaml` | svb.nl, bedragen kinderbijslag | december |
| `landelijk/zorgtoeslag/` | `2027.yaml` | Dienst Toeslagen, "Berekening zorgtoeslag 2027", en de standaardpremie in de Staatscourant | december |
| `landelijk/huurtoeslag/` | `2027.yaml` | Regeling huurtoeslaggrenzen 2027 (Staatscourant) en "Berekening huurtoeslag 2027" | november |
| `landelijk/kindgebonden-budget/` | `2027.yaml` | Dienst Toeslagen, "Berekening kindgebonden budget 2027" | december |
| `landelijk/kinderopvang/` | `2027.yaml` | Besluit kinderopvangtoeslag in het Staatsblad (let op: soms meer dan één besluit per jaar) | november |
| `landelijk/toeslagen/` | `2027.yaml` | belastingdienst.nl, vermogensgrenzen toeslagen 2027 | oktober tot december |
| `gemeenten/leiden/` | `2027.yaml` | lokaleregelgeving.overheid.nl (zoeken op "Leiden") en gemeente.leiden.nl | december tot februari |

Regels:

- Alleen officiële bronnen. Open de bron zelf. Neem de waarde letterlijk over. Alleen dan is de status `geverifieerd`.
- Een `citaat` neemt u woord voor woord over uit de nieuwe versie.
- Is een bedrag nog niet gepubliceerd? Laat het `ontbrekend`. Raad nooit en neem nooit het oude bedrag over. De app rekent dan met de laatste datum waarvoor alles bekend is, en toont een waarschuwing (ONDERHOUD.md, hoofdstuk 4).
- Komen de bedragen in delen binnen? Dat mag. Maak dan een pull request per onderwerp. Elke pull request noemt het issue dat hij sluit ("Sluit #87").
- De Leidse regels komen vaak later dan de landelijke. Tot die er zijn, gelden de regels van het oude jaar niet vanzelf door. Staat op de site van de gemeente dat de regels gelijk blijven? Neem die zin dan als bron op.

## 3. Verandert er een regel, niet alleen een bedrag?

Lees bij elke nieuwe publicatie of er ook een voorwaarde, uitzondering of rekenvolgorde verandert. Voorbeelden: de Participatiewet in balans per 1 januari 2027, en de wijziging van de Wet op de huurtoeslag die BESLUITEN.md nummer 23 noemt.

- Een gewijzigde regel hoort in de rekenkern, met tests en met een ingangsdatum (zie `packages/rekenkern/src/regimes.ts`).
- Leg de bron vast in [RECHT.md](RECHT.md).
- Verandert daardoor wat gebruikers zien? Vraag dan eerst de beheerder (zie CONTRIBUTING.md).

## 4. Controleren

1. `npm test`. Een sprong van meer dan 10% heeft een `notitie` nodig, anders weigert de test het.
2. `npm run docs`. Dit maakt PROEFPERSONEN.md en de statustabel in RECHT.md opnieuw.
3. Veranderen snapshots? Verklaar elke wijziging in [CONTROLE.md](CONTROLE.md), hoofdstuk 8.
4. `npm run audit` en `npm run audit:leidengeldwijzer`. De uitvoer van het oude jaar mag **niet** veranderen: die audits rekenen met een vaste datum in dat jaar. Verandert er toch iets, dan heeft u een bestand van het oude jaar geraakt.
5. `npm run typecheck` en `npm run test:e2e`.

## 5. De audit voor het nieuwe jaar

Besluit (BESLUITEN.md nummer 38): elk jaar heeft een eigen set proefpersonen met officiële bedragen. De set van het oude jaar blijft staan. Zo blijft het oude jaar gecontroleerd en wordt het nieuwe jaar apart getoetst.

Zodra Dienst Toeslagen de proefberekening voor het nieuwe jaar online heeft:

1. **Leidengeldwijzer** (`audit/leidengeldwijzer/personen.ts`). Vul voor dezelfde personen de proefberekening van het nieuwe jaar in. Gebruik dezelfde gegevens, met het toetsingsinkomen dat Leidengeldwijzer zelf schat. Leg de bedragen vast met een eigen bron ("Dienst Toeslagen, proefberekening toeslagen 2027", met de datum). Neem de grenzen uit de nieuwe tabellen van de gemeente (120%, 130% en 140%) als bron voor de Leidse regelingen.
2. **Leidenwerkt** (`audit/personen.ts` en `testgevallen/`). Maak voor een paar proefpersonen een kopie met `rekendatum` in het nieuwe jaar en de officiële bedragen van dat jaar.
3. **De eerste keer** moet de audit nog leren met twee rekendata te werken. Bouw dat zo:
   - een vaste rekendatum per jaar, bijvoorbeeld `REKENDATA = { 2026: "2026-11-21", 2027: "2027-01-15" }`;
   - de uitvoer per jaar in een eigen map, bijvoorbeeld `audit/uitvoer/2026/` en `audit/uitvoer/2027/`, en een rapport per jaar;
   - de verwachtingen per persoon per jaar;
   - de CI controleert alle jaren.
   Leg dit vast in `audit/README.md` en `audit/leidengeldwijzer/README.md`, en pas dit draaiboek aan als het anders is gebouwd.
4. Alle bedragen moeten binnen de tolerantie kloppen. Klopt iets niet? Zoek de oorzaak. Pas nooit de verwachting aan om de test te laten slagen.

## 6. Afronden

1. Werk bij:
   - [PLANNING.md](PLANNING.md): wat af is en wat nog wacht;
   - [RECHT.md](RECHT.md): bronnen en status;
   - [CHANGELOG.md](../CHANGELOG.md), onder "Nog niet uitgebracht";
   - de zin over 2027 in [README.md](../README.md), bij "Status".
2. Doe een gebruikerstest met personages ([CONTROLE.md](CONTROLE.md), hoofdstuk 6). Dat is de afspraak na het bijwerken van de bedragen voor een nieuw jaar.
3. Een nieuwe versie maakt de beheerder zelf. Zie CONTRIBUTING.md, "Een nieuwe versie".
4. Kijk op 2 januari of de CI nog slaagt. De browsertests rekenen met de datum van vandaag. Ontbreekt er dan nog een bedrag, dan toont de app een waarschuwing.

## Valkuilen

- **Het oude bestand vergeten af te sluiten.** Twee bestanden die allebei op 1 januari gelden, geeft een fout bij `npm run regels`.
- **Bedragen zonder vakantiegeld of met vakantiegeld.** De bijstandsnormen in `regels/` zijn met vakantietoeslag. De tabellen van de gemeente Leiden zijn zonder vakantiegeld. De rekenkern rekent dat om. Neem de waarde over zoals de bron hem geeft, en controleer de `omschrijving` van de parameter.
- **Een jaarbedrag als maandbedrag.** Kijk naar de `eenheid` van de parameter.
- **Een nieuw besluit dat een eerder besluit van hetzelfde jaar wijzigt.** Bij de kinderopvangtoeslag gebeurt dat vaak. Gebruik de laatste versie, en noem beide in de bron.
- **De audit van het oude jaar verandert.** Dat mag niet (zie stap 4).
