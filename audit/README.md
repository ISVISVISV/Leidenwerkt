# Audit

`npm run audit` rekent de verzonnen personen uit [personen.ts](personen.ts) door met de echte uitkomstpagina en controleert automatisch wat testers eerder met de hand vonden. Er is geen AI en geen internet voor nodig. Het duurt ongeveer een halve minuut.

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

## Willekeurige personen

`npm run audit -- --willekeurig 200 --zaad 7` maakt 200 willekeurige, verzonnen personen en doet dezelfde controles (behalve de omwegen). Alleen personen die het formulier goedkeurt, doen mee. Met hetzelfde zaad komen dezelfde personen terug, zodat een fout na te doen is. Het rapport staat in `audit/rapport-willekeurig.md`, de formulieren van personen met een melding in `audit/willekeurig-fouten.json`. 200 personen duren ongeveer 4 minuten.

## Een persoon of omweg toevoegen

Voeg in [personen.ts](personen.ts) een persoon toe met een ingevuld formulier. Gebruik alleen verzonnen gegevens. Een omweg beschrijft wat iemand eerst invulde (`begin`) en precies wat hij daarna veranderde (`wijzig`). Oude velden blijven staan, net als in de rekenhulp.

De uitkomst hangt af van de datum van vandaag (regels en leeftijden). Draai de audit daarom vóór en na een wijziging op dezelfde dag als je de uitvoer wilt vergelijken.
