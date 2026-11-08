# Proefpersonen

<!-- Gegenereerd met `npm run docs` uit testgevallen/*.yaml. Niet met de hand aanpassen. -->

Verzonnen mensen in verzonnen situaties. Per persoon staan de invoer, de uitkomst van de rekenhulp en, waar beschikbaar, de vergelijking met een officiële waarde. 'Onbekend' betekent dat er nog geen officiële waarde is; dan bewaakt alleen de snapshot de uitkomst. Dit document is bedoeld om te laten controleren door een klantmanager of sociaal raadsman.

| Persoon | Rekendatum | Kopgetal (verschil per maand) | Officiële waarden binnen tolerantie |
| --- | --- | --- | --- |
| [Ayşe](#ayse) | 2026-09-01 | € 378,83 | 2 van 2 |
| [Daan](#daan) | 2026-09-01 | € 289,00 | 3 van 3 |
| [Fatima en Youssef](#fatima-en-youssef) | 2026-09-01 | € 477,28 | 5 van 5 |
| [Henk](#henk) | 2026-09-01 | € 275,83 | 2 van 2 |
| [Ilse](#ilse-boven-sleutelpasgrens) | 2026-09-01 | € 445,20 | 2 van 2 |
| [Ilse](#ilse-onder-sleutelpasgrens) | 2026-09-01 | € 414,33 | 2 van 2 |
| [Jesse](#jesse) | 2026-09-01 | € 0,00 | 3 van 3 |
| [Kevin](#kevin) | 2026-09-01 | € 289,00 | 3 van 3 |
| [Lotte](#lotte-2027) | 2027-02-01 | € 0,00 | – |
| [Marloes](#marloes) | 2026-09-01 | € 289,00 | 3 van 3 |
| [Peter](#peter) | 2026-09-01 | € 289,00 | 3 van 3 |
| [Rachid](#rachid-net-boven-norm) | 2026-09-01 | € 23,39 | 2 van 2 |
| [Rachid](#rachid-net-onder-norm) | 2026-09-01 | € 0,00 | 2 van 2 |
| [Rob](#rob) | 2026-09-01 | € 117,94 | 2 van 2 |
| [Sanne](#sanne-24-uur) | 2026-09-01 | € 368,33 | 7 van 7 |
| [Sanne](#sanne-maand-1-6) | 2026-09-01 | € 287,71 | 7 van 7 |
| [Sanne](#sanne-maand-7-36) | 2026-09-01 | € 147,33 | 7 van 7 |
| [Sanne](#sanne-vanaf-maand-37) | 2026-09-01 | € -1,29 | 7 van 7 |

<a id="ayse"></a>
## Ayşe (`ayse.yaml`)

Ayşe, 38, alleenstaande moeder van Mila (6), huurt voor € 700. Ze werkt al een jaar 12 uur per week als thuiszorghulp voor € 14,50 per uur (vrijlating als alleenstaande ouder) en kan uitbreiden naar 28 uur.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaande ouder, leeftijd 38
- Kinderen: 6 jaar
- Kale huur: € 700,00 per maand
- Werk nu: bruto € 14,50 per uur, 12 uur per week
- Werk straks: bruto € 14,50 per uur, 28 uur per week
- Vrijlatingsperiode: periode daarna

**Uitkomst:** nu € 2.698,03, met werk € 3.076,86 per maand; verschil € 378,83.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Kinderbijslag | nu | € 120,78 | € 120,78 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 362,35 per kwartaal (6 t/m 11 jaar) / 3 |
| Kinderbijslag | met werk | € 120,78 | € 120,78 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 362,35 per kwartaal (6 t/m 11 jaar) / 3 |
| Netto loon | nu | € 814,32 | onbekend | – | – |
| Netto loon | met werk | € 1.843,39 | onbekend | – | – |
| Bijstand | nu | € 706,93 | onbekend | – | – |
| Bijstand | met werk | € 0,00 | onbekend | – | – |
| Zorgtoeslag | nu | € 129,00 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |
| Huurtoeslag | nu | € 428,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 428,00 | onbekend | – | – |
| Kindgebonden budget | nu | € 499,00 | onbekend | – | – |
| Kindgebonden budget | met werk | € 499,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 38
- Kinderen: 6 jaar
- Medebewoners (geen partner): geen
- Huur: kale huur € 700,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 18.255,00; met werk: € 22.801,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/ayse.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.759,33) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="daan"></a>
## Daan (`daan.yaml`)

Daan, 41, alleenstaand, huurt voor € 640 kaal, heeft geen werk en overweegt 24 uur als magazijnmedewerker voor € 15,50 bruto per uur.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 41
- Kale huur: € 640,00 per maand
- Werk straks: bruto € 15,50 per uur, 24 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 1.935,46, met werk € 2.224,46 per maand; verschil € 289,00.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Huurtoeslag | nu | € 387,00 | € 387,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 295.68 + B € 92.17 + C € 0.00 = € 387.85, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Netto loon | met werk | € 1.691,82 | onbekend | – | – |
| Bijstand | met werk | € 16,64 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 387,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 41
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huur: kale huur € 640,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 21.091,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/daan.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.612,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="fatima-en-youssef"></a>
## Fatima en Youssef (`fatima-en-youssef.yaml`)

Fatima (38) en Youssef (40) zijn getrouwd en hebben twee kinderen: Sami (13) en Lina (9). Ze huren voor € 760. Youssef werkt al 16 uur voor € 1.100 bruto per maand. Fatima overweegt 20 uur als schoonmaker voor € 14,80 per uur.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: met partner, leeftijd 38, partner 40
- Werk partner: bruto € 1.100,00 per maand
- Kinderen: 13 jaar; 9 jaar
- Kale huur: € 760,00 per maand
- Werk straks: bruto € 14,80 per uur, 20 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 3.493,67, met werk € 3.970,95 per maand; verschil € 477,28.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Zorgtoeslag | nu | € 246,00 | € 246,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Kindgebonden budget | nu | € 490,00 | € 490,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kindgebonden budget 2026, stap 1 en 2 (maximale bedragen)](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf), 2026-11-08. 2 kinderen met partner € 5.160 + verhoging kind 12–15 jaar € 724 = € 5.884 / 12 = € 490,33, afgerond naar beneden; inkomen onder € 39.141 |
| Huurtoeslag | nu | € 467,00 | € 467,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 297.49 + B € 170.17 + C € 0.00 = € 467.66, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Kinderbijslag | nu | € 262,88 | € 262,88 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. (€ 426,29 + € 362,35) per kwartaal / 3 |
| Kinderbijslag | met werk | € 262,88 | € 262,88 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. (€ 426,29 + € 362,35) per kwartaal / 3 |
| Netto loon | met werk | € 1.353,00 | onbekend | – | – |
| Bijstand | nu | € 862,72 | onbekend | – | – |
| Bijstand | met werk | € 0,00 | onbekend | – | – |
| Zorgtoeslag | met werk | € 233,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 467,00 | onbekend | – | – |
| Kindgebonden budget | met werk | € 490,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: ja, 40 jaar; uw leeftijd: 38
- Kinderen: 13 jaar, 9 jaar
- Medebewoners (geen partner): geen
- Huur: kale huur € 760,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 25.521,00; met werk: € 30.879,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/fatima-en-youssef.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.282,67) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="henk"></a>
## Henk (`henk.yaml`)

Henk, 58, alleenstaand, woont in zijn eigen huis samen met zijn zoon Bas (29), die een baan heeft. Henk overweegt 16 uur als conciërge voor € 15,00 per uur.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 58
- Huisgenoten van 27 jaar of ouder: 1
- Geen huurtoeslag (geen huurwoning op eigen naam)
- Werk straks: bruto € 15,00 per uur, 16 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 1.142,90, met werk € 1.418,73 per maand; verschil € 275,83.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.013,90 | € 1.013,90 | € 0,00 ✓ | [Participatiewet art. 22a (kostendelersnorm), wetten.overheid.nl, versie 1 juli 2026](https://wetten.overheid.nl/BWBR0015703/2026-07-01), 2026-11-08. Kostendelersnorm met A = 2: (40% + 2 × 30%) / 2 = 50% van de gehuwdennorm € 2.027,79 = € 1.013,90 |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Netto loon | met werk | € 1.103,35 | onbekend | – | – |
| Bijstand | met werk | € 186,38 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 58
- Kinderen: geen
- Medebewoners (geen partner): 1 van 27 jaar of ouder
- Huurtoeslag: niet aanvragen
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 14.088,00; met werk: € 15.715,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/henk.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.040,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="ilse-boven-sleutelpasgrens"></a>
## Ilse (`ilse-boven-sleutelpasgrens.yaml`)

Ilse, 29, alleenstaand, woont in een kamer zonder huurtoeslag. Ze overweegt een baan van 32 uur voor € 1.780 bruto per maand; haar netto inkomen komt net boven de grens van de gratis Sleutelpas (130% van het sociaal minimum).

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 29
- Geen huurtoeslag (geen huurwoning op eigen naam)
- Werk straks: bruto € 1.780,00 per maand, 32 uur per week
- Vrijlatingsperiode: geen vrijlating

**Uitkomst:** nu € 1.548,46, met werk € 1.993,66 per maand; verschil € 445,20.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Netto loon | met werk | € 1.864,66 | onbekend | – | – |
| Bijstand | met werk | € 0,00 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 29
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huurtoeslag: niet aanvragen
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 23.069,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/ilse-boven-sleutelpasgrens.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.780,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="ilse-onder-sleutelpasgrens"></a>
## Ilse (`ilse-onder-sleutelpasgrens.yaml`)

Ilse, 29, alleenstaand, woont in een kamer zonder huurtoeslag. Ze overweegt een baan van 32 uur voor € 1.750 bruto per maand; haar netto inkomen komt net onder de grens van de gratis Sleutelpas (130% van het sociaal minimum).

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 29
- Geen huurtoeslag (geen huurwoning op eigen naam)
- Werk straks: bruto € 1.750,00 per maand, 32 uur per week
- Vrijlatingsperiode: geen vrijlating

**Uitkomst:** nu € 1.548,46, met werk € 1.962,79 per maand; verschil € 414,33.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Netto loon | met werk | € 1.833,79 | onbekend | – | – |
| Bijstand | met werk | € 0,00 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 29
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huurtoeslag: niet aanvragen
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 22.680,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/ilse-onder-sleutelpasgrens.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.750,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="jesse"></a>
## Jesse (`jesse.yaml`)

Jesse, 24, alleenstaand, huurt een studio voor € 520 kaal. Hij overweegt 20 uur in de horeca voor € 13,50 per uur. Onder de 27 jaar geldt in 2026 geen vrijlating.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 24
- Kale huur: € 520,00 per maand
- Werk straks: bruto € 13,50 per uur, 20 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 1.857,46, met werk € 1.857,46 per maand; verschil € 0,00.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Huurtoeslag | nu | € 309,00 | € 309,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 295.68 + B € 14.17 + C € 0.00 = € 309.85, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Netto loon | met werk | € 1.237,09 | onbekend | – | – |
| Bijstand | met werk | € 182,37 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 309,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 24
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huur: kale huur € 520,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 17.352,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/jesse.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.170,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="kevin"></a>
## Kevin (`kevin.yaml`)

Kevin, 31, alleenstaand, huurt voor € 580, overweegt uitzendwerk van 32 uur per week met een vierwekenloon van € 1.420 bruto.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 31
- Kale huur: € 580,00 per maand
- Werk straks: bruto € 1.420,00 per 4 weken, 32 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 1.896,46, met werk € 2.185,46 per maand; verschil € 289,00.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Huurtoeslag | nu | € 348,00 | € 348,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 295.68 + B € 53.17 + C € 0.00 = € 348.85, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Netto loon | met werk | € 1.616,03 | onbekend | – | – |
| Bijstand | met werk | € 92,43 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 348,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 31
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huur: kale huur € 580,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 21.046,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/kevin.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.538,33) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="lotte-2027"></a>
## Lotte (`lotte-2027.yaml`)

Lotte, 33, alleenstaand, huurt voor € 620. Ze werkt sinds oktober 2026 16 uur per week (€ 15,00 per uur) en kreeg op 31 december 2026 de vrijlating van 25%. In februari 2027 breidt ze uit naar 24 uur. Overgangsrecht art. 78ff lid 2 Pw.

> De bijstandsnormen, belastingtarieven en toeslagbedragen voor 2027 zijn nog niet gepubliceerd. Tot dan bewaakt alleen de snapshot dit geval; de engine rekent het overgangsrecht met de bedragen van 31 december 2026 (zie regimes.test.ts).

**Invoer** (rekendatum 2027-02-01)

- Leefvorm: alleenstaand, leeftijd 33
- Kale huur: € 620,00 per maand
- Werk nu: bruto € 15,00 per uur, 16 uur per week
- Werk straks: bruto € 15,00 per uur, 24 uur per week
- Vrijlatingsperiode: eerste periode, overgangsrecht (onderdeel n)

**Uitkomst:** nu € 0,00, met werk € 0,00 per maand; verschil € 0,00. Niet meegerekend: netto loon, bijstand, zorgtoeslag, huurtoeslag.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | niet berekend | onbekend | – | – |
| Bijstand | met werk | niet berekend | onbekend | – | – |
| Netto loon | met werk | niet berekend | onbekend | – | – |
| Huurtoeslag | met werk | niet berekend | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2027:

- Toeslagpartner: nee; uw leeftijd: 33
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huur: kale huur € 620,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2027 (toetsingsinkomen) zonder werk: –; met werk: – (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/lotte-2027.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 0,00) op in de witte maandtabel loonheffing 2027 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="marloes"></a>
## Marloes (`marloes.yaml`)

Marloes, 45, alleenstaand, huurt voor € 610. Ze weet alleen dat ze netto € 1.250 per maand krijgt voor 24 uur in een supermarkt.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 45
- Kale huur: € 610,00 per maand
- Werk straks: netto € 1.250,00 per maand, 24 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 1.916,46, met werk € 2.205,46 per maand; verschil € 289,00.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Huurtoeslag | nu | € 368,00 | € 368,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 295.68 + B € 72.67 + C € 0.00 = € 368.35, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Netto loon | met werk | € 1.350,00 | onbekend | – | – |
| Bijstand | met werk | € 358,46 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 368,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 45
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huur: kale huur € 610,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 20.887,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/marloes.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.279,75) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="peter"></a>
## Peter (`peter.yaml`)

Peter, 52, alleenstaand, huurt een vrije-sectorwoning voor € 850 kaal (boven de aftoppingsgrens). Hij overweegt 20 uur als chauffeur voor € 15,00 per uur.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 52
- Kale huur: € 850,00 per maand
- Werk straks: bruto € 15,00 per uur, 20 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 2.038,46, met werk € 2.327,46 per maand; verschil € 289,00.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Huurtoeslag | nu | € 490,00 | € 490,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 295.68 + B € 139.63 + C € 54.79 = € 490.11, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Netto loon | met werk | € 1.370,83 | onbekend | – | – |
| Bijstand | met werk | € 337,63 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 490,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 52
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huur: kale huur € 850,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 20.900,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/peter.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.300,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="rachid-net-boven-norm"></a>
## Rachid (`rachid-net-boven-norm.yaml`)

Rachid, 36, alleenstaand, woont bij een hospita (geen huurtoeslag). Hij werkt al langer dan 6 maanden en krijgt geen vrijlating meer. Met € 1.370 bruto per maand verdient hij netto net meer dan de bijstandsnorm.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 36
- Geen huurtoeslag (geen huurwoning op eigen naam)
- Werk straks: bruto € 1.370,00 per maand
- Vrijlatingsperiode: geen vrijlating

**Uitkomst:** nu € 1.548,46, met werk € 1.571,85 per maand; verschil € 23,39.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Netto loon | met werk | € 1.442,85 | onbekend | – | – |
| Bijstand | met werk | € 0,00 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 36
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huurtoeslag: niet aanvragen
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 17.755,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/rachid-net-boven-norm.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.370,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="rachid-net-onder-norm"></a>
## Rachid (`rachid-net-onder-norm.yaml`)

Rachid, 36, alleenstaand, woont bij een hospita (geen huurtoeslag). Hij werkt al langer dan 6 maanden en krijgt geen vrijlating meer. Met € 1.340 bruto per maand verdient hij netto net minder dan de bijstandsnorm.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 36
- Geen huurtoeslag (geen huurwoning op eigen naam)
- Werk straks: bruto € 1.340,00 per maand
- Vrijlatingsperiode: geen vrijlating

**Uitkomst:** nu € 1.548,46, met werk € 1.548,46 per maand; verschil € 0,00.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Netto loon | met werk | € 1.411,99 | onbekend | – | – |
| Bijstand | met werk | € 7,47 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 36
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huurtoeslag: niet aanvragen
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 17.456,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/rachid-net-onder-norm.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.340,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="rob"></a>
## Rob (`rob.yaml`)

Rob, 50, alleenstaand, woont in bij zijn zus (geen huurtoeslag, zus is geen kostendeler omdat hij commerciële huur betaalt). Hij heeft een medische urenbeperking en kan 12 uur werken voor € 14,00 per uur. Hij werkt al langer dan 6 maanden.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaand, leeftijd 50
- Geen huurtoeslag (geen huurwoning op eigen naam)
- Werk straks: bruto € 14,00 per uur, 12 uur per week
- Vrijlatingsperiode: periode daarna, medische urenbeperking

**Uitkomst:** nu € 1.548,46, met werk € 1.666,40 per maand; verschil € 117,94.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Netto loon | met werk | € 786,24 | onbekend | – | – |
| Bijstand | met werk | € 751,16 | onbekend | – | – |
| Zorgtoeslag | met werk | € 129,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 50
- Kinderen: geen
- Medebewoners (geen partner): geen
- Huurtoeslag: niet aanvragen
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 18.616,00 (doe twee proefberekeningen)

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/rob.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 728,00) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="sanne-24-uur"></a>
## Sanne (`sanne-24-uur.yaml`)

Sanne, 34, alleenstaande moeder van Noor (4), huurt voor € 690, overweegt 24 uur als doktersassistente voor € 16,20 per uur. Noor gaat 72 uur per maand naar het kinderdagverblijf (€ 10,90 per uur). Met 24 uur verdient ze meer dan de bijstandsnorm, dus de vrijlating maakt niet uit.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaande ouder, leeftijd 34
- Kinderen: 4 jaar (dagopvang, 72 uur per maand à € 10,90)
- Kale huur: € 690,00 per maand
- Werk straks: bruto € 16,20 per uur, 24 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 2.568,93, met werk € 2.937,26 per maand; verschil € 368,33.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Kindgebonden budget | nu | € 499,00 | € 499,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kindgebonden budget 2026, stap 1 en 2 (maximale bedragen)](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf), 2026-11-08. € 5.996 per jaar (alleenstaande ouder, 1 kind) / 12 = € 499,67, afgerond naar beneden |
| Huurtoeslag | nu | € 422,00 | € 422,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 297.49 + B € 124.67 + C € 0.00 = € 422.16, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Kinderbijslag | nu | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderbijslag | met werk | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderopvangtoeslag | met werk | € 753,00 | € 753,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kinderopvangtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf), 2026-11-08. 72 uur × € 10,90 (onder het maximum van € 11,23) × 96% = € 753,41, afgerond naar beneden; inkomen ruim onder € 56.413 |
| Netto loon | met werk | € 1.766,72 | onbekend | – | – |
| Bijstand | met werk | € 0,00 | onbekend | – | – |
| Huurtoeslag | met werk | € 422,00 | onbekend | – | – |
| Kindgebonden budget | met werk | € 499,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 34
- Kinderen: 4 jaar
- Medebewoners (geen partner): geen
- Huur: kale huur € 690,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 21.835,00 (doe twee proefberekeningen)
- Kinderopvang: dagopvang, 72 uur per maand, € 10.9 per uur

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/sanne-24-uur.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.684,80) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="sanne-maand-1-6"></a>
## Sanne (`sanne-maand-1-6.yaml`)

Sanne, 34, alleenstaande moeder van Noor (4), huurt voor € 690. Ze begint met 16 uur per week als doktersassistente voor € 16,20 per uur, zodat ze nog aanvullende bijstand krijgt. Noor gaat 56 uur per maand naar het kinderdagverblijf (€ 10,90 per uur). Periode: maand 1 t/m 6.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaande ouder, leeftijd 34
- Kinderen: 4 jaar (dagopvang, 56 uur per maand à € 10,90)
- Kale huur: € 690,00 per maand
- Werk straks: bruto € 16,20 per uur, 16 uur per week
- Vrijlatingsperiode: eerste periode

**Uitkomst:** nu € 2.568,93, met werk € 2.856,64 per maand; verschil € 287,71.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Kindgebonden budget | nu | € 499,00 | € 499,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kindgebonden budget 2026, stap 1 en 2 (maximale bedragen)](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf), 2026-11-08. € 5.996 per jaar (alleenstaande ouder, 1 kind) / 12 = € 499,67, afgerond naar beneden |
| Huurtoeslag | nu | € 422,00 | € 422,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 297.49 + B € 124.67 + C € 0.00 = € 422.16, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Kinderbijslag | nu | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderbijslag | met werk | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderopvangtoeslag | met werk | € 585,00 | € 585,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kinderopvangtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf), 2026-11-08. 56 uur × € 10,90 (onder het maximum van € 11,23) × 96% = € 585,98, afgerond naar beneden; inkomen ruim onder € 56.413 |
| Netto loon | met werk | € 1.188,94 | onbekend | – | – |
| Bijstand | met werk | € 519,52 | onbekend | – | – |
| Huurtoeslag | met werk | € 422,00 | onbekend | – | – |
| Kindgebonden budget | met werk | € 499,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 34
- Kinderen: 4 jaar
- Medebewoners (geen partner): geen
- Huur: kale huur € 690,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 20.791,00 (doe twee proefberekeningen)
- Kinderopvang: dagopvang, 56 uur per maand, € 10.9 per uur

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/sanne-maand-1-6.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.123,20) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="sanne-maand-7-36"></a>
## Sanne (`sanne-maand-7-36.yaml`)

Sanne, 34, alleenstaande moeder van Noor (4), huurt voor € 690. Ze begint met 16 uur per week als doktersassistente voor € 16,20 per uur, zodat ze nog aanvullende bijstand krijgt. Noor gaat 56 uur per maand naar het kinderdagverblijf (€ 10,90 per uur). Periode: maand 7 t/m 36.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaande ouder, leeftijd 34
- Kinderen: 4 jaar (dagopvang, 56 uur per maand à € 10,90)
- Kale huur: € 690,00 per maand
- Werk straks: bruto € 16,20 per uur, 16 uur per week
- Vrijlatingsperiode: periode daarna

**Uitkomst:** nu € 2.568,93, met werk € 2.716,26 per maand; verschil € 147,33.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Kindgebonden budget | nu | € 499,00 | € 499,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kindgebonden budget 2026, stap 1 en 2 (maximale bedragen)](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf), 2026-11-08. € 5.996 per jaar (alleenstaande ouder, 1 kind) / 12 = € 499,67, afgerond naar beneden |
| Huurtoeslag | nu | € 422,00 | € 422,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 297.49 + B € 124.67 + C € 0.00 = € 422.16, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Kinderbijslag | nu | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderbijslag | met werk | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderopvangtoeslag | met werk | € 585,00 | € 585,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kinderopvangtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf), 2026-11-08. 56 uur × € 10,90 (onder het maximum van € 11,23) × 96% = € 585,98, afgerond naar beneden; inkomen ruim onder € 56.413 |
| Netto loon | met werk | € 1.188,94 | onbekend | – | – |
| Bijstand | met werk | € 379,14 | onbekend | – | – |
| Huurtoeslag | met werk | € 422,00 | onbekend | – | – |
| Kindgebonden budget | met werk | € 499,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 34
- Kinderen: 4 jaar
- Medebewoners (geen partner): geen
- Huur: kale huur € 690,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 19.106,00 (doe twee proefberekeningen)
- Kinderopvang: dagopvang, 56 uur per maand, € 10.9 per uur

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/sanne-maand-7-36.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.123,20) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>

<a id="sanne-vanaf-maand-37"></a>
## Sanne (`sanne-vanaf-maand-37.yaml`)

Sanne, 34, alleenstaande moeder van Noor (4), huurt voor € 690. Ze begint met 16 uur per week als doktersassistente voor € 16,20 per uur, zodat ze nog aanvullende bijstand krijgt. Noor gaat 56 uur per maand naar het kinderdagverblijf (€ 10,90 per uur). Periode: vanaf maand 37.

**Invoer** (rekendatum 2026-09-01)

- Leefvorm: alleenstaande ouder, leeftijd 34
- Kinderen: 4 jaar (dagopvang, 56 uur per maand à € 10,90)
- Kale huur: € 690,00 per maand
- Werk straks: bruto € 16,20 per uur, 16 uur per week
- Vrijlatingsperiode: geen vrijlating

**Uitkomst:** nu € 2.568,93, met werk € 2.567,64 per maand; verschil € -1,29.

| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |
| --- | --- | ---: | ---: | ---: | --- |
| Bijstand | nu | € 1.419,46 | € 1.419,46 | € 0,00 ✓ | [Rijksoverheid — Hoe wordt de hoogte van mijn bijstandsuitkering berekend? (normen per 1 juli 2026)](https://www.rijksoverheid.nl/themas/werk/arbeidsomstandigheden/vraag-en-antwoord/bijstand/hoe-hoog-is-mijn-bijstandsuitkering), 2026-11-04. Volledige norm alleenstaande (ouder), 21 jaar tot AOW-leeftijd, zonder inkomen |
| Zorgtoeslag | nu | € 129,00 | € 129,00 | € 0,00 ✓ | [Belastingdienst — Hoeveel zorgtoeslag krijg ik? (tabel 2026)](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag), 2026-11-08. Tabel: toetsingsinkomen tot € 29.500 geeft het maximum |
| Kindgebonden budget | nu | € 499,00 | € 499,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kindgebonden budget 2026, stap 1 en 2 (maximale bedragen)](https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf), 2026-11-08. € 5.996 per jaar (alleenstaande ouder, 1 kind) / 12 = € 499,67, afgerond naar beneden |
| Huurtoeslag | nu | € 422,00 | € 422,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening huurtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf), 2026-11-08. A € 297.49 + B € 124.67 + C € 0.00 = € 422.16, afgerond naar beneden; rekeninkomen onder het minimum-inkomensijkpunt, dus geen correctie |
| Kinderbijslag | nu | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderbijslag | met werk | € 99,47 | € 99,47 | € 0,00 ✓ | [SVB — Bedragen kinderbijslag (derde en vierde kwartaal 2026)](https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag), 2026-11-08. € 298,40 per kwartaal (0 t/m 5 jaar) / 3 |
| Kinderopvangtoeslag | met werk | € 585,00 | € 585,00 | € 0,00 ✓ | [Dienst Toeslagen — Berekening kinderopvangtoeslag 2026, stappen 1 t/m 7](https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf), 2026-11-08. 56 uur × € 10,90 (onder het maximum van € 11,23) × 96% = € 585,98, afgerond naar beneden; inkomen ruim onder € 56.413 |
| Netto loon | met werk | € 1.188,94 | onbekend | – | – |
| Bijstand | met werk | € 230,52 | onbekend | – | – |
| Huurtoeslag | met werk | € 422,00 | onbekend | – | – |
| Kindgebonden budget | met werk | € 499,00 | onbekend | – | – |

<details><summary>Invulblad voor de controle</summary>

**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar 2026:

- Toeslagpartner: nee; uw leeftijd: 34
- Kinderen: 4 jaar
- Medebewoners (geen partner): geen
- Huur: kale huur € 690,00 per maand, servicekosten € 0
- Vermogen: onder de grens
- Inkomen 2026 (toetsingsinkomen) zonder werk: € 21.663,00; met werk: € 17.323,00 (doe twee proefberekeningen)
- Kinderopvang: dagopvang, 56 uur per maand, € 10.9 per uur

Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in `testgevallen/sanne-vanaf-maand-37.yaml`.

**Netto loon**: zoek het bruto maandloon (€ 1.123,20) op in de witte maandtabel loonheffing 2026 van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.

</details>
