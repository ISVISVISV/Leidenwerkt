# Proefpersonen

Eén YAML-bestand per verzonnen persoon in een verzonnen situatie. Nooit echte personen. Echte documenten (uitkeringsspecificatie, toeslagbeschikking) worden eerst geanonimiseerd en pas daarna als proefpersoon vastgelegd: andere naam, afgeronde bedragen waar dat de toets niet raakt, geen adressen, BSN of dossiernummers.

## Opbouw

```yaml
naam: Daan
beschrijving: Daan, 41, alleenstaand, huurt voor € 640 kaal, ...   # gewone taal
rekendatum: 2026-09-01                                              # bepaalt welke regels gelden
invoer: { ... }                                                     # zoals de engine (Invoer), zonder datum en gemeente
verwacht:
  - onderdeel: huurtoeslag        # netto_loon, bijstand, zorgtoeslag, huurtoeslag, kindgebonden_budget, kinderopvangtoeslag, kinderbijslag
    situatie: nu                  # nu of met_werk
    waarde: 387                   # officiële waarde per maand, of: onbekend
    tolerantie: 0                 # toegestane afwijking in euro's
    bron: { titel: ..., url: ..., datum: 2026-11-08 }
    toelichting: hoe de officiële waarde tot stand kwam
signaal_bevat: ["..."]            # optioneel: tekst die in 'Goed om te weten' moet staan
opmerking: ...                    # optioneel
```

Een officiële waarde komt uit een proefberekening of rekenvoorbeeld van de uitvoerder (Dienst Toeslagen, Belastingdienst, SVB, gemeente) of uit een officiële tabel. Staat de waarde er nog niet, gebruik dan `onbekend`; dan bewaakt alleen de snapshot de uitkomst.

## Draaien

- `npm test` draait alle proefpersonen. Wijkt een onderdeel meer af dan de tolerantie, dan faalt de test met: wie, welk onderdeel, verwacht, berekend en bron.
- `npm run docs` maakt [docs/PROEFPERSONEN.md](../docs/PROEFPERSONEN.md) opnieuw, met per persoon een invulblad voor de proefberekening van Dienst Toeslagen.
