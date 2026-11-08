# Open vragen

Stand: 8 november 2026. Per vraag staat of het uitzoekwerk is of een besluit of actie van de beheerder.

## Voor de beheerder

| # | Vraag of actie | Waarom | Urgentie |
| --- | --- | --- | --- |
| B5 | Navraag gemeente Leiden (alleen als het praktisch kan): krijgt iemand die in 2027 het overgangsrecht van onderdeel n gebruikt daarna nog de nieuwe bijverdienregeling (art. 34a)? | Wet, memorie van toelichting en de andere Kamerstukken van dossier 36582 zeggen het niet (doorzocht op 8 november 2026). De gemeente beslist; de app zegt dat erbij | Laag |
| B6 | Kiest u als uitgangspunt voor 2027 de nieuwe regels als standaard (zodra de normen bekend zijn)? | De app volgt nu de datum van vandaag; vanaf 1 januari 2027 vanzelf de nieuwe regels, of de laatste bekende met een waarschuwing | Laag |

## Uit te zoeken

| # | Onderwerp | Wat ontbreekt | Waar te vinden |
| --- | --- | --- | --- |
| V1 | Bijstandsnormen 1 januari 2027 | Bedragen | Staatscourant-mededeling "gewijzigde bedragen per 1 januari 2027", verwacht begin december 2026 (de bewaking meldt het) |
| V2 | Belasting 2027 | Schijven, heffingskortingen, arbeidskorting | Belastingdienst na aanneming Belastingplan 2027 |
| V3 | Toeslagen 2027 | Standaardpremie, drempelinkomen, huurtoeslaggrenzen, kindgebonden budget | Staatscourant / brochures Dienst Toeslagen 2027 |
| V4 | Kinderopvangtoeslag 2027 | Tabel en maximum uurprijzen zijn gepubliceerd in **Stb. 2026, 308** (besluit van 3 oktober 2026); nog verwerken. Ook de **Wet van 1 juli 2026** tot wijziging van de Wet kinderopvang (Stb. 2026, 184; inwerkingtreding Stb. 2026, 253) nalezen op gevolgen voor de berekening | officielebekendmakingen.nl |
| V5 | Kostendelersnorm 2027 | Art. 19a en 22a in de versie per 1 januari 2027 nalezen (nu `onbevestigd`, overgenomen van 2026) | wetten.overheid.nl/BWBR0015703/2027-01-01 |
| V6 | Verrekening per 2027 | Uniform verrekenen, verrekening vakantiegeld, bufferbudget (art. 34b, max. € 1.000 per jaar); de app rekent dit niet | Regeling Participatiewet, IOAW en IOAZ (versie 2027) |
| V7 | Netto loon | Officiële vergelijking met de witte maandtabel loonheffing 2026 voor de proefpersonen (nu `onbekend`) | Belastingdienst, loonheffingstabellen 2026 |
| V8 | Bruto bijstand voor het toetsingsinkomen | De app rekent de bruto bijstand terug uit de netto norm. Toetsen met de groene maandtabel loonheffing 2026 (uitkeringen), zonder echte documenten | Belastingdienst, loonheffingstabellen 2026 |
| V9 | Huurtoeslag: huisgenoten van 18 tot 27 jaar en inwonende kinderen met inkomen | Hun inkomen telt mee voor de huurtoeslag (kinderen onder 23 boven € 6.218); de app vraagt er nu niet naar | Brochure Berekening huurtoeslag 2026, stap 5 |
| V10 | Leiden: kwijtschelding | Welke norm Leiden hanteert en wie uitvoert | lokaleregelgeving.overheid.nl, leiden.nl |
| V12 | Leiden: grenzen van 110%, 120% en 150% | Gevonden in de Beleidsregels bijzondere bijstand 2022 (draagkracht, collectieve zorgverzekering, eigen bijdrage kinderopvang); nog niet als signaal in de app. De beleidsregels van 2022 zijn volgens lokaleregelgeving.overheid.nl nog geldend (stand 8 november 2026) | CVDR677687 |
| V11 | Individuele inkomenstoeslag | leiden.nl noemt "23 jaar of ouder" als voorwaarde maar bedragen "tussen de 21 jaar en de pensioengerechtigde leeftijd"; de verordening van 2020 is niet opnieuw nagelezen op leeftijd | Verordening IIT Leiden (CVDR634399) |

## Opgelost op 8 november 2026

- **Branch protection en CODEOWNERS**: ingesteld door de beheerder.
- **Huurtoeslag met huisgenoten van 27+**: ingebouwd en getoetst aan een proefberekening (Wim, € 282).
- **Proefberekeningen Dienst Toeslagen**: drie ingevuld (Fatima en Youssef, Bram, Sanne 24 uur); alle negen bedragen kwamen tot op de euro overeen met de app.
- **Sleutelpas**: 'WSM' is de toepasselijke bijstandsnorm (bevestigd door de beheerder).
- **Art. 34a, toets vooraf**: volgens de memorie van toelichting geldt de bijverdienregeling niet als het inkomen boven de bijstandsnorm ligt; ingebouwd.
- **Echte documenten**: niet nodig; de toets loopt via officiële rekenvoorbeelden, proefberekeningen en loonheffingstabellen.

- **Minimum-inkomensijkpunt huurtoeslag 2026**: € 23.425 / € 31.500 (Stcrt. 2025, 39783). Basishuur, grenzen en percentages bevestigd in de wet, het Besluit op de huurtoeslag en de brochure van Dienst Toeslagen. Servicekosten tellen sinds 2026 niet meer mee.
- **Kinderbijslag 2026**: bedragen per halfjaar van de SVB.
- **Zorgtoeslag, kindgebonden budget, kinderopvangtoeslag 2026**: alle parameters `geverifieerd` uit de brochures van Dienst Toeslagen; de rekenvoorbeelden zijn tests.
- **Vrijlating art. 31 lid 2 n en r**: nagelezen in de wettekst. Nieuw gevonden: geen vrijlating onder de 27 jaar (lid 5) en de vrijlating bij een medische urenbeperking (onder y).
- **Art. 34a vanaf 2027**: 15% zonder maximumbedrag en zonder inkomensgrens; geldt ook onder de 27. Overgangsrecht art. 78ff lid 2 en 3 gebouwd.
- **Individuele inkomenstoeslag**: actuele bedragen op leiden.nl (€ 462 / € 577 / € 635). Ze bevestigen artikel 4 van de verordening van 2020; de afwijkende toelichting is niet bepalend.
- **Garantieknop**: termijn en voorwaarden uit de Beleidsregels inkomensvoorzieningen Leiden 2026 (hoofdstuk 3).
- **Kostendelersnorm 2026**: formule en leeftijdsgrens in de wettekst (art. 19a en 22a).
- **Afronding**: Dienst Toeslagen rondt maandbedragen naar beneden af op hele euro's; ingebouwd.
