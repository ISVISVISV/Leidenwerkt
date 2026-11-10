# Wijzigingen

Wat er per versie is veranderd. De opzet volgt [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/); de versienummers volgen [Semantic Versioning](https://semver.org/lang/nl/). Zolang de versie met 0 begint, is de rekenhulp nog niet nagelopen door iemand uit de praktijk.

Het versienummer staat in `package.json`, in de voettekst van de rekenhulp en op de afdruk.

## Nog niet uitgebracht

### Toegevoegd

- Melding over het Volwassenenfonds Sport & Cultuur (Leiden).

### Gewijzigd

- De vragen over het huishouden zijn eenvoudiger: twee ja/nee-vragen over partner en kinderen in plaats van één keuzelijst.
- De vraag naar andere bewoners staat bij de woning. De aantallen verschijnen alleen als er andere bewoners zijn; het aantal van 18 tot en met 26 jaar alleen bij een zelfstandige huurwoning, omdat het alleen voor de huurtoeslag telt.
- Zorgverzekering en zwemabonnement zijn twee losse meldingen.
- Duidelijkere teksten bij ander inkomen en bij de kosten voor wie meer gaat werken.
- De uitkomst legt bedragen uit die anders lijken dan verwacht: het ingevulde loon tegenover het netto loon met vakantiegeld, de geschatte prijs van de kinderopvang, waarom er bij een kamer geen huurtoeslag staat, waarom het jaarbedrag geen 12 keer het maandbedrag is, wat de vrijlating oplevert en wat een medische urenbeperking doet.
- De meldingen over de Sleutelpas noemen de grens voor het huishouden en de opbouw van het Kindtegoed. De zin over het stoppen van de bijstand noemt het bedrag en gebruikt geen vakterm meer.
- Geen antwoorden meer vooraf gekozen bij de woonsituatie, de soort opvang, het vakantiegeld in een uurloon en de aantallen bewoners. Wie niets kiest, krijgt een foutmelding in plaats van een stilzwijgende aanname.

### Hersteld

- Bij een kamer of gedeelde woning vraagt de rekenhulp nu de huur. Daardoor past ze ook daar de Leidse verlaging van de bijstand bij lage woonkosten toe. Eerder rekende ze bij een kamerhuur onder de grens met een te hoge bijstand.
- De grens van het Volwassenenfonds Sport & Cultuur bij verblijf in een instelling volgt nu de instellingsnorm, zoals de gemeente die noemt. Eerder gold daar de gewone norm, waardoor de grens veel te hoog was.

## 0.2.0 – 10 november 2026

### Toegevoegd

- Regels vanaf 2027 (bijverdienregeling, overgangsrecht) als apart regime, naast de regels van 2026.
- Huurtoeslag, met huisgenoten en kinderen met inkomen.
- Woonsituaties: kamer, inwonend zonder kosten, geen vaste woonplek, instelling (lagere norm van art. 23 en art. 27 Participatiewet en de Leidse beleidsregels).
- Wie al werkt naast de bijstand: meer uren, ander werk of werk erbij.
- Medische urenbeperking, ander inkomen, loon per uur, per 4 weken of netto, all-in uurloon.
- Vergoeding van de eigen bijdrage kinderopvang (Leiden).
- Meldingen onder "Goed om te weten": Sleutelpas en Kindtegoed, collectieve zorgverzekering en zwemabonnement, gratis OV-pas, individuele inkomenstoeslag, kwijtschelding, opnieuw bijstand aanvragen. Elke melding heeft een bron.
- Letterlijke brontekst bij elke regel en elke melding.
- Urenschuif, keuze van de periode (met en na de vrijlating), totaal over de eerste twaalf maanden.
- Eén zin over de bijstand: blijft die, stopt die, en wanneer.
- Afdruk met de ingevulde gegevens.
- Wekelijkse bewaking van de gebruikte wetten.
- Proefpersonen met officiële vergelijkingswaarden, controlepagina, risicoregister.

### Gewijzigd

- Geboortedatum in plaats van leeftijd, in één vak.
- Uitleg staat achter een i-knop.
- Huurwoning en kamer zijn aparte keuzes; bij een kamer geen vraag naar de huur.
- Vakantiegeld komt uit de regeldata en wordt bij het loon opgeteld.
- Eén vaste term per begrip in alle teksten.
- De terugknop van de browser gaat een stap terug en bewaart de invoer.

### Hersteld

- Geen vrijlating voor wie jonger is dan 27 jaar (tot en met 2026).
- Toeslagen per maand naar beneden afgerond, zoals Dienst Toeslagen doet.
- Servicekosten tellen niet meer mee voor de huurtoeslag.
- Wie al zes maanden of langer werkt, zag de uitleg van de verkeerde periode.
- Bij een paar waarvan de partner niet werkt, bleef kinderopvang zonder melding buiten de berekening.
- Teksten die niet bij het bedrag pasten (urengrens, totaal over twaalf maanden, bijstand van minder dan € 1).

### Tests

- Tests voor grenzen en onderdelen, met de hand nagerekend; vastlegging van rekenstappen, meldingen en aannames.
- Mutatietest: zie [docs/CONTROLE.md](docs/CONTROLE.md).

## 0.1.0 – 4 november 2026

Eerste versie: bijstand, vrijlating, netto loon, zorgtoeslag, kindgebonden budget, kinderbijslag en kinderopvangtoeslag voor 2026, met regeldata in YAML en bronvermelding per bedrag.
