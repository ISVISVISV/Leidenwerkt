# Rekenregels Leidenwerkt

Stand van het onderzoek: 4 november 2026 (fase 1 en eerste aanvulling in fase 2). De waarden zelf staan in `regels/`; dit document beschrijft rekenwijze en bronnen.

Dit document beschrijft per mechanisme de wettelijke grondslag, de rekenwijze, de gevonden waarden en hun status. Het is de bron voor de YAML-bestanden in `regels/` (fase 2).

## Statussen

| Status | Betekenis | Gevolg in de app |
| --- | --- | --- |
| `geverifieerd` | Officiële bron zelf geopend, waarde letterlijk overgenomen | Normaal gebruikt |
| `onbevestigd` | Waarde gevonden in een secundaire bron of een kamerstuk/wetsvoorstel, niet in de definitieve officiële publicatie | Gebruikt, met zichtbare markering |
| `ontbrekend` | Geen betrouwbare waarde gevonden, of bronnen spreken elkaar tegen | Onderdeel wordt niet berekend |

Commerciële rekensites en blogs zijn bij het onderzoek bewust niet als bron gebruikt. Ze bleken elkaar op meerdere punten tegen te spreken (bijvoorbeeld bij kinderbijslag en kindgebonden budget).

## Belangrijkste bevinding: 1 januari 2027 verandert de bijstand

De Participatiewet in balans (Stb. 2025, 312) wijzigt per 1 januari 2027 onder meer de inkomstenvrijlating, de verrekening van inkomsten en de verrekening van vakantiegeld. De app gaat naar verwachting in 2027 online. Daarom ondersteunt de engine twee regimes naast elkaar:

- **Tot en met 31 december 2026:** huidige vrijlatingen (artikel 31 lid 2 onder n en r Pw).
- **Vanaf 1 januari 2027:** nieuwe bijverdienregeling (artikel 34a Pw), met overgangsrecht.

De normbedragen voor 1 januari 2027 worden doorgaans begin december gepubliceerd (Normenbrief). Tot die tijd zijn ze `ontbrekend`.

---

## 1. Bijstandsnorm (Participatiewet)

**Grondslag:** artikelen 20, 21, 22 en 22a Participatiewet. Normen worden per 1 januari en 1 juli aangepast aan het netto minimumloon.

**Rekenwijze:** de norm hangt af van leeftijd en leefvorm. Een alleenstaande (ouder) krijgt 70% van de gehuwdennorm. De bijstand vult eigen inkomen aan tot de norm (zie mechanisme 3). Bedragen zijn netto per maand inclusief vakantietoeslag; de vakantietoeslag (5%) wordt gereserveerd en jaarlijks uitbetaald.

| Parameter | 1 jan 2026 | 1 jul 2026 | 1 jan 2027 | Status | Bron |
| --- | --- | --- | --- | --- | --- |
| Alleenstaande (ouder), 21 jaar tot AOW (art. 21 a) | € 1.401,50 | € 1.419,46 | – | geverifieerd / 2027: ontbrekend | Rijksoverheid; Stcrt. 2026, 20221 |
| Gehuwden, beiden 21 tot AOW (art. 21 b) | € 2.002,13 | € 2.027,79 | – | geverifieerd / 2027: ontbrekend | idem |
| Wettelijk minimumloon bruto per maand (excl. 8% vakantie-uitkering) | – | € 2.337,00 | – | geverifieerd | Stcrt. 2026, 20221 (toelichting) |

Bronnen:

- [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend?](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering) (geraadpleegd 4-11-2026)
- [Staatscourant 2026, 20221 — bedragen per 1 juli 2026](https://zoek.officielebekendmakingen.nl/stcrt-2026-20221.pdf) (geraadpleegd 4-11-2026)

## 2. Kostendelersnorm

**Grondslag:** artikel 22a Participatiewet.

**Rekenwijze:** woont de bijstandsgerechtigde met andere volwassenen in één woning (partner niet meegeteld), dan daalt de norm. Volgens Rijksoverheid tellen sinds de Participatiewet in balans alleen huisgenoten van **27 jaar of ouder** mee (geverifieerd). De formule in de wet — de norm per persoon als percentage van de gehuwdennorm, afhankelijk van het aantal kostendelers — moet nog letterlijk uit de geldende wettekst worden overgenomen.

| Parameter | Waarde | Status |
| --- | --- | --- |
| Leeftijdsgrens meetellende huisgenoten | 27 jaar | geverifieerd |
| Formule | ((40% + A × 30%) / A) × gehuwdennorm, A = medebewoners + belanghebbende (+ partner) | onbevestigd (tekst via InView, versie per 1-7-2024) |
| Bedragen art. 22a lid 3 per 1-7-2026 | a: € 755,98; b: € 350,42 | geverifieerd, betekenis per onderdeel nog uitzoeken |

## 3. Verrekening van inkomsten en inkomstenvrijlating

**Grondslag tot en met 2026:** artikel 31 lid 2 onder n en r Participatiewet.

- Onder n: algemene vrijlating van 25% van de inkomsten uit arbeid, met een maximum per maand, gedurende ten hoogste 6 aaneengesloten maanden, als dit bijdraagt aan arbeidsinschakeling. Percentage en duur: onbevestigd (bekend uit beleidsregels van andere gemeenten, nog niet uit wettekst).
- Onder r: alleenstaande ouder met volledige zorg voor een kind tot 12 jaar, na afloop van onder n: 12,5% met een maximum, gedurende ten hoogste 30 maanden.

| Parameter | 1 jan 2026 | 1 jul 2026 | Status |
| --- | --- | --- | --- |
| Maximum onder n per maand | € 285,00 | € 289,00 | 1 jul geverifieerd (Stcrt. 2026, 20221); 1 jan onbevestigd (VNG-document) |
| Maximum onder r per maand | – | € 180,17 | geverifieerd |
| Percentages 25% en 12,5%, duur 6 en 30 maanden | | | onbevestigd |

**Grondslag vanaf 1 januari 2027:** nieuw artikel 34a Participatiewet (bijverdienregeling).

| Doelgroep | Vrijlating | Duur | Status |
| --- | --- | --- | --- |
| Jonger dan AOW-leeftijd | 15% van de inkomsten uit arbeid | max. 12 aaneengesloten maanden, gemeente kan verlengen | onbevestigd (Schulinck, juni 2026) |
| Medisch urenbeperkt | 15% | geen maximale duur | onbevestigd |
| Vanaf AOW-leeftijd | 25%, max. € 226 per maand | geen maximale duur | onbevestigd |

Voorwaarden (onbevestigd): algemene bijstand ontvangen, inkomsten uit arbeid, bijdrage aan arbeidsinschakeling, en het inkomen is niet hoger dan de bijstandsnorm. Of er voor de groep onder AOW-leeftijd een maximumbedrag geldt, is nog niet vastgesteld.

**Overgangsrecht (onbevestigd):** wie op 31 december 2026 recht heeft op de 25%-vrijlating, houdt die uiterlijk tot 1 januari 2028. De vrijlating voor alleenstaande ouders gaat over in de nieuwe regeling, voor de resterende duur met een maximum van 30 maanden.

**Ook per 2027 (nog uit te zoeken):** uniform verrekenen van inkomsten, andere verrekening van vakantiegeld en een bufferbudget voor schommelende inkomsten.

Bronnen:

- [Binnenlands Bestuur / Schulinck — Inkomstenvrijlating in de Participatiewet in balans](https://www.binnenlandsbestuur.nl/sociaal/schulinck-sociaal-domein/inkomstenvrijlating-in-de-participatiewet-in-balans) (1 juni 2026)
- [VNG — Participatiewet in balans, inwerkingtreding](https://vng.nl/wetsvoorstellen/participatiewet-in-balans)

## 4. Loonheffing en heffingskortingen

**Grondslag:** Wet inkomstenbelasting 2001 en Wet op de loonbelasting 1964.

**Rekenwijze in de app:** het netto loon wordt benaderd met de jaarberekening: belasting over het jaarloon in schijven, minus algemene heffingskorting en arbeidskorting, teruggerekend naar een maand. De werkgever gebruikt loonheffingstabellen; de app vermeldt dat het werkelijke netto loon enkele euro's kan afwijken. Werknemerspremies (bijvoorbeeld pensioen) voert de gebruiker zelf in.

**2026, jonger dan AOW-leeftijd** (alles `geverifieerd`, bron Belastingdienst):

| Schijf | Belastbaar inkomen | Tarief |
| --- | --- | --- |
| 1 | t/m € 38.883 | 35,75% |
| 2 | € 38.883 – € 78.426 | 37,56% |
| 3 | boven € 78.426 | 49,50% |

| Algemene heffingskorting | |
| --- | --- |
| tot € 29.736 | € 3.115 |
| € 29.736 – € 78.426 | € 3.115 − 6,398% × (inkomen − € 29.736) |
| vanaf € 78.426 | € 0 |

| Arbeidskorting (arbeidsinkomen) | |
| --- | --- |
| tot € 11.965 | 8,324% × arbeidsinkomen |
| € 11.965 – € 25.845 | € 996 + 31,009% × (arbeidsinkomen − € 11.965) |
| € 25.845 – € 45.592 | € 5.300 + 1,950% × (arbeidsinkomen − € 25.845) |
| € 45.592 – € 132.920 | € 5.685 − 6,510% × (arbeidsinkomen − € 45.592) |
| vanaf € 132.920 | € 0 |

| Inkomensafhankelijke combinatiekorting (relevant voor alleenstaande ouders met kind tot 12) | |
| --- | --- |
| tot € 6.239 | € 0 |
| € 6.239 – € 32.710 | 11,45% × (arbeidsinkomen − € 6.239) |
| vanaf € 32.710 | € 3.032 |

Bron: [Belastingdienst — Voorlopige aanslag 2026: tarieven en heffingskortingen](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen) (geraadpleegd 4-11-2026).

**2027:** het Belastingplan 2027 is op Prinsjesdag 2026 ingediend en nog niet aangenomen. Voorgestelde waarden (alle `onbevestigd`): algemene heffingskorting max. € 3.154, afbouw vanaf € 30.910 met 6,638%; arbeidskorting max. € 5.929, afbouw vanaf € 47.834 met 6,51%; IACK max. € 2.918. Schijfgrenzen en tarieven 2027: `ontbrekend`. Definitieve waarden volgen na aanneming door de Eerste Kamer (december) en uit de Nieuwsbrief Loonheffingen 2027.

Open punt: de bijstand zelf wordt door de gemeente bruto uitbetaald met loonheffing. Voor de vergelijking rekent de app met de netto norm; dat volstaat zolang de app geen jaaraangifte nabootst.

## 5. Zorgtoeslag

**Grondslag:** Wet op de zorgtoeslag, artikel 2; percentages in het Besluit percentages drempel- en toetsingsinkomen zorgtoeslag.

**Rekenwijze:** zorgtoeslag = standaardpremie (× 2 bij toeslagpartner) − normpremie. Normpremie = normpercentage × drempelinkomen + afbouwpercentage × (toetsingsinkomen − drempelinkomen), voor zover positief. Het drempelinkomen is gelijk aan het jaarbedrag van het minimumloon.

| Parameter 2026 | Waarde | Status |
| --- | --- | --- |
| Normpercentage zonder partner | 1,912% | onbevestigd (Stb. 2025, 412, via kamerstuk) |
| Normpercentage met partner | 4,289% | onbevestigd |
| Afbouwpercentage | 13,730% | onbevestigd |
| Drempelinkomen | € 29.736 | onbevestigd (raming in kamerantwoord; levert met de standaardpremie een inkomensgrens van ca. € 41.000, secundaire bronnen noemen € 40.857) |
| Standaardpremie | € 2.119 | geverifieerd (Stcrt. 2025, 40022) |
| Vermogensgrens | – | ontbrekend |

**2027:** percentages 1,930% / 4,307% / 13,760% genoemd in hetzelfde besluit (onbevestigd); standaardpremie en drempelinkomen 2027 `ontbrekend`.

## 6. Huurtoeslag

**Grondslag:** Wet op de huurtoeslag (gewijzigd per 1 januari 2026 door de Wet verlaging eigen bijdrage huurtoeslag), Regeling huurtoeslaggrenzen 2026 (Stcrt. 2025, 39783).

**Rekenwijze (hoofdlijn):** de rekenhuur boven de basishuur wordt gesubsidieerd: 100% tot de kwaliteitskortingsgrens, 65% tot de aftoppingsgrens, 40% tot de maximale huurgrens, daarboven niets. Sinds 2026 is de maximale huurgrens geen toegangsgrens meer, alleen een rekengrens. De basishuur bestaat sinds 2026 uit een inkomensonafhankelijk deel en een apart berekende inkomensafhankelijke eigen bijdrage.

| Parameter 2026 | Waarde | Status |
| --- | --- | --- |
| Subsidiepercentages 100% / 65% / 40% | | onbevestigd (wettekst art. 21 via secundaire bron) |
| Kwaliteitskortingsgrens | € 498,20 | onbevestigd |
| Aftoppingsgrens 1–2 personen / 3+ personen | € 713,02 / € 764,14 | onbevestigd |
| Maximale huurgrens (rekengrens) | € 932,93 | onbevestigd |
| Minimum basishuur eenpersoons / meerpersoons | € 202,52 / € 200,71 | onbevestigd |
| Correctie basishuur (verlaging eigen bijdrage) | € 48,15 | onbevestigd (VNG-normbedragen kwijtschelding) |
| Inkomensafhankelijke vermindering | (rekeninkomen − minimum-inkomensijkpunt) × 27% (eenpersoons) of 22% (meerpersoons) / 12 | onbevestigd (Stb. 2024, 426) |
| Minimum-inkomensijkpunt 2026 | bruto AOW + vakantietoeslag + € 2.340 (eenpersoons) / € 2.512 (meerpersoons) | formule bekend, bedrag ontbrekend |

De engine bevat de volledige huurtoeslagformule. Zolang het minimum-inkomensijkpunt 2026 ontbreekt, meldt de app de huurtoeslag als 'niet berekend'.

## 7. Kindgebonden budget

**Grondslag:** Wet op het kindgebonden budget.

**Rekenwijze:** bedrag per kind, plus verhoging voor kinderen van 12 en 16 jaar, plus alleenstaande-ouderkop; afbouw met een percentage van het toetsingsinkomen boven een drempel.

| Parameter 2026 | Waarde | Status |
| --- | --- | --- |
| Bedrag per kind per jaar | € 2.580 | onbevestigd (salarissoftware-documentatie) |
| Verhoging kind 12 t/m 15 / 16 en 17 | € 724 / € 964 | onbevestigd |
| Alleenstaande-ouderkop | € 3.416 | onbevestigd |
| Drempel alleenstaande ouder / met partner | € 29.736 / € 39.141 | onbevestigd |
| Afbouwpercentage | 7,60% | onbevestigd (Kamerstuk 36606, nr. 3: 7,60% in 2026, 8,05% in 2027) |

## 8. Kinderbijslag

**Grondslag:** Algemene Kinderbijslagwet. Inkomensonafhankelijk, per kwartaal, drie leeftijdsgroepen (0–5, 6–11, 12–17), peildatum eerste dag van het kwartaal.

| Parameter | Status |
| --- | --- |
| Kwartaalbedragen 2026 | ontbrekend: secundaire bronnen spreken elkaar tegen; SVB-pagina nog niet geopend |

## 9. Kinderopvangtoeslag

**Grondslag:** Wet kinderopvang, Besluit kinderopvangtoeslag.

**Rekenwijze:** toeslag per kind = opvanguren (max. per maand) × min(werkelijke uurprijs, maximum uurprijs) × vergoedingspercentage uit de inkomenstabel. Het "eerste kind" is het kind met de meeste opvanguren; volgende kinderen krijgen een hoger percentage.

| Parameter 2026 | Waarde | Status |
| --- | --- | --- |
| Maximum uurprijs dagopvang / bso / gastouder | € 11,23 / € 9,98 / € 8,49 | geverifieerd (Rijksoverheid) |
| Maximaal aantal uren per maand per kind | 230 | onbevestigd |
| Vergoedingstabel 2026 (bijlage I Besluit, Stb. 2025, 233) | volledige tabel in `regels/landelijk/kinderopvang/2026.yaml` | onbevestigd (tekst via InView) |
| Urennorm gekoppeld aan gewerkte uren | – | ontbrekend |

Bron: [Rijksoverheid — Bedragen kinderopvangtoeslag 2026](https://www.rijksoverheid.nl/onderwerpen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026).

## 10. Overgangsmaanden

Geen eigen wettelijke regel, wel een rekenkundige: de app legt per maand naast elkaar wanneer welk bedrag binnenkomt. Uitgangspunten (aannames, zichtbaar in de app):

- Bijstand wordt per kalendermaand verrekend met het inkomen dat in die maand is ontvangen (onbevestigd; de uniforme verrekening per 2027 kan dit wijzigen).
- Het eerste salaris komt aan het einde van de eerste werkmaand of later; de gebruiker kiest.
- Toeslagvoorschotten veranderen pas als de gebruiker de inkomensschatting aanpast.
- De gereserveerde vakantietoeslag van de bijstand wordt bij uitstroom uitbetaald (onbevestigd).

## 11. Leiden

| Regeling | Wat vaststaat | Status | Bron |
| --- | --- | --- | --- |
| Individuele inkomenstoeslag | Referteperiode 5 jaar met inkomen niet boven 100% van de bijstandsnorm; geen uitzicht op inkomensverbetering; jaarlijks geïndexeerd met CPI | regels geverifieerd; bedragen ontbrekend | [Verordening IIT Leiden 2020](https://lokaleregelgeving.overheid.nl/CVDR634399/) |
| Individuele inkomenstoeslag — bedragen | Verordening 2020: € 400 / € 500 / € 550, maar artikel 4 en de toelichting noemen de bedragen voor alleenstaande ouder en gehuwden omgekeerd; actuele geïndexeerde bedragen onbekend | ontbrekend | idem |
| Sleutelpas (gratis) | Inkomen tot 130% van het wettelijk sociaal minimum, of in WSNP/MSNP; ambtshalve voor bijstandsgerechtigden | geverifieerd | [Beleidsregels Sleutelpas Leiden 2026](https://zoek.officielebekendmakingen.nl/gmb-2025-429670.pdf) |
| Tegoeden op de Sleutelpas (bijv. kindtegoed) | – | ontbrekend | – |
| Kwijtschelding gemeentelijke belastingen | Landelijk kader 100% kosten van bestaan (VNG); Leidse keuze en uitvoerder onbekend | ontbrekend | – |
| Collectieve zorgverzekering minima | – | ontbrekend | – |
| Beleidsregels inkomensvoorzieningen 2026 | Regelen terugwerkende kracht, garantieknop, zoekperiode jongeren, jongerennorm; **niet** de inkomstenvrijlating | geverifieerd | [CVDR760197](https://lokaleregelgeving.overheid.nl/CVDR760197/1) |

Leiden voert Werk en Inkomen ook uit voor Leiderdorp (aanvraagformulier IIT 2026). Dat maakt Leiderdorp een logische tweede gemeente.

---

## Overzicht status

| Mechanisme | 2026 | 2027 |
| --- | --- | --- |
| Bijstandsnorm | geverifieerd | ontbrekend (verwacht dec. 2026) |
| Kostendelersnorm | onbevestigd | onbevestigd |
| Inkomstenvrijlating | grotendeels geverifieerd | onbevestigd |
| Loonheffing en kortingen | geverifieerd | onbevestigd / ontbrekend |
| Zorgtoeslag | onbevestigd (standaardpremie geverifieerd) | ontbrekend |
| Huurtoeslag | formule bekend, minimum-inkomensijkpunt ontbrekend | ontbrekend |
| Kindgebonden budget | onbevestigd | ontbrekend |
| Kinderbijslag | ontbrekend | ontbrekend |
| Kinderopvangtoeslag | onbevestigd (uurprijzen geverifieerd) | ontbrekend |
| Leidse regelingen | deels | ontbrekend |

Conclusie: de bijstand en de belasting voor 2026 kunnen nu al betrouwbaar worden gebouwd. Voor de toeslagen ontbreken nog de officiële rekenparameters; die staan vooral in Staatsblad- en Staatscourant-publicaties en op de sites van Dienst Toeslagen en SVB. Het ophalen daarvan is de eerste taak in fase 2, parallel aan het fundament.
