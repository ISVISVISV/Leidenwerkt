# Audit van Leidengeldfit

`npm run audit:leidengeldfit` rekent de verzonnen personen uit [personen.ts](personen.ts) en [extern/](extern/) door met de echte overzichtspagina van Leidengeldfit. Daarna controleert het script alles automatisch. Er is geen AI en geen internet voor nodig. Het duurt ongeveer een halve minuut.

Het werkt net als de audit van Leidenwerkt ([../README.md](../README.md)). De gedeelde onderdelen staan in [scripts/audit-kern.ts](../../scripts/audit-kern.ts).

## Wat eruit komt

- **[rapport.md](rapport.md)**: per controle hoe vaak die is gedaan en wat niet klopt.
- **[uitvoer/](uitvoer/)**: per persoon wat is ingevuld en het hele overzicht als platte tekst. Met `git diff audit/leidengeldfit/uitvoer` ziet u wat er sinds de vorige keer is veranderd.

Een tester kan deze tekstbestanden lezen. Klikken door de site is dan niet nodig.

## De controles

1. **Formulier keurt de persoon goed**: zo kan iemand het formulier echt invullen.
2. **Elke uitslag staat op de pagina**: elke regeling uit de rekenkern staat op het overzicht, in de goede groep.
3. **Reden en bron bij elke regeling.**
4. **Links naar officiële sites**: elke link om aan te vragen gaat via https naar een site van de overheid.
5. **Grens past bij de groep**: "Uw inkomen is hoger dan de grens" staat alleen bij "waarschijnlijk niet".
6. **Grens past bij het inkomen**: het ingevulde inkomen is echt hoger of lager dan de grens die erbij staat.
7. **Geen ; in teksten.**
8. **Bedragen met een punt**: geen "€ 2300".
9. **Geen kapotte tekst**: geen "NaN", "undefined" of "null".
10. **Afdruk zonder overlap**: op A4 schuift geen blok over een ander.
11. **Afdruk toont alle regelingen**: ook de dichtgeklapte groep staat op papier.
12. **Gelijk aan de officiële bron**: bij personen met `verwacht` is de grens of het bedrag gelijk aan de bron, binnen € 1.
13. **Omweg geeft dezelfde uitkomst**: wie eerst iets anders invult en het daarna aanpast, krijgt hetzelfde overzicht.
14. **Rekent zonder fout.**

## Zelf de audit doen

1. Installeer [Node.js](https://nodejs.org) 22 en download dit project (`git clone https://github.com/ISVISVISV/Leidenwerkt.git`).
2. Draai `npm ci` en daarna `npm run audit:leidengeldfit`.

De audit rekent met een vaste datum (`REKENDATUM` in [personen.ts](personen.ts)). Iedereen krijgt dan op elke dag dezelfde uitvoer. Een andere datum kan met `npm run audit:leidengeldfit -- --datum 2026-12-01`.

De audit draait ook bij elke wijziging op GitHub. Verandert een uitkomst, dan ziet u dat in de pull request.

## Willekeurige personen

`npm run audit:leidengeldfit -- --willekeurig 200 --zaad 7` maakt 200 willekeurige, verzonnen personen en doet dezelfde controles (behalve de omwegen). Hetzelfde zaad geeft dezelfde personen. Het rapport staat in `rapport-willekeurig.md`, de formulieren met een melding in `willekeurig-fouten.json`.

## Zelf een persoon met officiële bedragen toevoegen

Maak in [extern/](extern/) een bestand `naam.yaml`:

```yaml
naam: "Voorbeeld: alleenstaand met loon"
formulier:
  geboren: "01-03-1990"
  inkomen: { soorten: [loon], bedragen: { loon: "1300" }, uitkering: "" }
verwacht:
  - regeling: gemeentepolis
    grens: 1618.18
    bron: { titel: "Gemeente Leiden, collectieve zorgverzekering", url: "https://gemeente.leiden.nl/…", datum: "2026-11-21" }
```

De velden van het formulier staan in `regelingen/src/formulier.ts` (`Formulier`). Wat u niet invult, staat op "nee" of leeg. Gebruik alleen verzonnen gegevens.
