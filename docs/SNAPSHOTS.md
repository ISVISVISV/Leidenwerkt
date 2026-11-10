# Snapshots: verklaring van wijzigingen

De snapshots in `packages/engine/test/__snapshots__/` zetten de uitkomsten voor 2026 vast voor de huishoudens in `packages/engine/test/huishoudens.ts`. Verandert een snapshot, dan staat hier waarom. Bijwerken: `npx vitest run -u`, daarna het verschil nalopen en hier verklaren.

## 8 november 2026: eerste vastlegging en eerste wijziging

Vastgelegd in commit "Snapshots van de uitkomsten 2026 vastgezet", vóór de wijzigingen hieronder. Daarna gewijzigd om deze redenen, allemaal met een officiële bron:

| Wijziging | Effect op de snapshots | Bron |
| --- | --- | --- |
| Huurtoeslag wordt nu berekend: minimum-inkomensijkpunt 2026 gevonden (€ 23.425 / € 31.500) | `huurtoeslag` was `null` en viel buiten het verschil; nu een bedrag. Het verschil (kopgetal) daalt waar de huurtoeslag met werk lager wordt, bijvoorbeeld "alleenstaande 36 uur": € 980,52 → € 779,40 | Regeling huurtoeslaggrenzen 2026, Stcrt. 2025, 39783; Berekening huurtoeslag 2026 (Dienst Toeslagen) |
| Toeslagen per maand naar beneden afgerond op hele euro's | `zorgtoeslag` € 129,20 → € 129; `kgb` € 499,67 → € 499; `kot` € 844,80 → € 844 | Rekenvoorbeelden in de brochures "Berekening … 2026" van Dienst Toeslagen |
| Geen vrijlating onder de 27 jaar (tot en met 2026) | "alleenstaande 25 jaar, 20 uur": bijstand met werk € 382,21 → € 93,21; verschil € 289 → € 0 | Participatiewet art. 31 lid 5 (versie 1 juli 2026) |
| Kinderbijslag berekend (SVB-bedragen 2026) | `kinderbijslag` was `null`; nu in beide situaties hetzelfde bedrag. Geen effect op het verschil | SVB, bedragen kinderbijslag 2026 |
| Servicekosten tellen niet meer mee voor de huurtoeslag | "alleenstaande ouder, kind 4 met opvang": rekenhuur € 690 in plaats van € 730 | Berekening huurtoeslag 2026, stap 1 |
| Geen vrijlating meer op het loon van de partner | Geen effect in deze huishoudens (bijstand met werk was al € 0) | Aanname: de partner werkte al, dus zijn of haar vrijlatingsperiode is waarschijnlijk voorbij (staat bij de aannames in de app) |

## 8 november 2026 (vervolg)

Geen wijziging in de snapshots 2026. De toets vooraf bij art. 34a en de huurtoeslag met huisgenoten raken de vastgelegde huishoudens niet (alleen 2027, en huishoudens zonder huisgenoten met huur).

## Lagere norm bij geen woonkosten, kamer zonder huurtoeslag, medische urenbeperking

Geen wijziging in de snapshots 2026. De vastgelegde huishoudens huren een zelfstandige woning of hebben woonsituatie "anders", en hebben geen medische urenbeperking.

## Vergoeding eigen bijdrage kinderopvang (Leiden)

Nieuwe post `bb_opvang` met werk, voor huishoudens met kinderopvang (Beleidsregels bijzondere bijstand 2022, art. 1, 6 en 7 onder f):

| Huishouden of proefpersoon | Vergoeding | Verschil |
| --- | --- | --- |
| Snapshot "alleenstaande ouder, kind 4 met opvang" | € 36,00 | € 299,48 → € 335,48 |
| Sanne, 24 uur | € 31,80 | € 368,33 → € 400,13 |
| Sanne, maand 1 t/m 6 | € 25,40 | € 287,71 → € 313,11 |
| Sanne, maand 7 t/m 36 | € 25,40 | € 147,33 → € 172,73 |
| Sanne, vanaf maand 37 | € 25,40 | € −1,29 → € 24,11 |

Bij Sanne blijft het inkomen onder 110% van de rekennorm, dus de hele eigen bijdrage wordt vergoed.

## Woonvorm met begeleiding (art. 23 Pw)

Geen wijziging in de snapshots 2026; geen van de vastgelegde huishoudens woont in een instelling.

## Snapshots van de uitleg (10 november 2026)

Nieuw: naast de bedragen staan nu ook de rekenstappen, meldingen en aannames vast, voor de bestaande huishoudens en negen extra (`extraVoorUitleg` in `huishoudens.ts`). De snapshots van de bedragen zijn niet gewijzigd. Een gewijzigde tekst in de uitleg hoeft hier niet verklaard te worden; een gewijzigd tussenbedrag wel.
