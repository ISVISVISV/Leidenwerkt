# Audit

`npm run audit` rekent de verzonnen personen uit [personen.ts](personen.ts) en [extern/](extern/) door met de echte uitkomstpagina en controleert automatisch wat testers eerder met de hand vonden. Er is geen AI en geen internet voor nodig. Het duurt ongeveer een halve minuut.

## Wat eruit komt

- **[rapport.md](rapport.md)**: per controle hoe vaak die is gedaan en wat niet klopt. Elke melding staat er één keer, met bij wie ze voorkomt.
- **[uitvoer/](uitvoer/)**: per persoon de hele uitkomst als platte tekst, per stand van de urenschuif en per periode, met "Wat u heeft ingevuld" uit de afdruk. Met `git diff audit/uitvoer` zie je wat er sinds de vorige keer is veranderd.

Een AI-tester die moet beoordelen of de uitkomst begrijpelijk is, kan deze tekstbestanden lezen. Klikken door de site is dan niet nodig.

## De controles

1. **Tabel telt op**: de rijen zijn samen het subtotaal, de subtotalen samen "U houdt over".
2. **Zin bovenaan past bij de tabel**: het bedrag "ongeveer € … meer" is "U houdt over" met werk min nu.
3. **Netto loon in de zin past bij de tabel**: "ongeveer € … netto per maand" (of per week, of per 4 weken) × 1,08 is het netto loon in de tabel, op € 3 na.
4. **Opvang: delen samen het totaal**: wat de gemeente vergoedt plus wat u zelf betaalt, is de eigen bijdrage.
5. **Inkomen en grens kloppen met elkaar**: een melding die "niet meer" zegt, heeft een inkomen boven de grens, en omgekeerd.
6. **Geen ; in teksten** die gebruikers zien. Letterlijke wetteksten tellen niet mee.
7. **Bedragen met een punt**: geen "€ 2300".
8. **Afdruk zonder overlap**: op A4 schuift geen blok over een ander.
9. **Urenschuif verspringt niet met € 1**: rond de ingevulde uren gaat "U houdt over" niet heen en weer door afronding.
10. **Omweg geeft dezelfde uitkomst**: wie eerst iets anders invult en het daarna aanpast, krijgt dezelfde uitkomst als wie het meteen goed invult.
11. **Geen kapotte tekst**: geen "NaN", "undefined", "null" of een minteken direct na het euroteken.
12. **Rekent zonder fout**: de pagina komt tot stand zonder foutmelding.
13. **Zin over de bijstand past bij de tabel**: "Uw bijstand van € … stopt" en "U houdt € … bijstand" noemen het bedrag uit de tabel.
14. **Gelijk aan de officiële bron**: bij personen met officiële bedragen (`verwacht`) is de regel in de tabel gelijk aan die bron, binnen de opgegeven tolerantie.

## Zelf de audit doen

Iedereen kan de audit draaien, zonder ons:

1. Installeer [Node.js](https://nodejs.org) 22 en download dit project (`git clone https://github.com/ISVISVISV/Leidenwerkt.git`).
2. Draai `npm ci` en daarna `npm run audit`.

De audit rekent met een vaste datum (`REKENDATUM` in [personen.ts](personen.ts)). Daardoor krijgt iedereen, op elke dag, precies dezelfde uitvoer als in deze repository staat. Een andere datum kan met `npm run audit -- --datum 2026-12-01`.

De audit draait ook bij elke wijziging automatisch op GitHub. Het rapport staat bij elke run onder "Actions", met de uitvoer als download. Verandert een uitkomst, dan is dat te zien in de pull request, omdat de uitvoer in de repository moet passen bij de code.

## Zelf een persoon met officiële bedragen toevoegen

Een onafhankelijke partij, zoals een klantmanager of de sociaal raadslieden, kan zelf personen toevoegen met bedragen uit een officiële bron. Maak in [extern/](extern/) een bestand `naam.yaml`, zoals [extern/priya.yaml](extern/priya.yaml):

- `formulier`: wat er in de rekenhulp is ingevuld. De namen van de velden staan in `app/src/formulier.ts` (`Formulier`). Bedragen en uren als tekst, zoals in het formulier ("790", "16,50").
- `verwacht`: per regel in de tabel het bedrag per maand uit de officiële bron. Met `onderdeel` (de naam van de regel, bijvoorbeeld "Huurtoeslag"), `situatie` (`nu` of `met_werk`), `waarde`, eventueel `periode` ("Maand 1 t/m 6") en `tolerantie` in euro's, en de `bron` (titel, adres, datum).

Gebruik alleen verzonnen gegevens. De audit legt de rekenhulp naast elk bedrag en meldt elk verschil.

## Willekeurige personen

`npm run audit -- --willekeurig 200 --zaad 7` maakt 200 willekeurige, verzonnen personen en doet dezelfde controles (behalve de omwegen). Alleen personen die het formulier goedkeurt, doen mee. Met hetzelfde zaad komen dezelfde personen terug, zodat een fout na te doen is. Het rapport staat in `audit/rapport-willekeurig.md`, de formulieren van personen met een melding in `audit/willekeurig-fouten.json`. 200 personen duren ongeveer 4 minuten.

## Een persoon of omweg toevoegen

Voeg in [personen.ts](personen.ts) een persoon toe met een ingevuld formulier. Gebruik alleen verzonnen gegevens. Een omweg beschrijft wat iemand eerst invulde (`begin`) en precies wat hij daarna veranderde (`wijzig`). Oude velden blijven staan, net als in de rekenhulp.

Zet bij personen met een bedrag uit een officiële bron ook `verwacht` erbij (zie hierboven).
