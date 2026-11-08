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
