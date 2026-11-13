# Besluiten

De keuzes die de rekenhulp vormen, met de reden. Wie iets wil veranderen, leest hier eerst waarom het is zoals het is. Nieuwe besluiten komen onderaan.

| # | Besluit | Reden |
| --- | --- | --- |
| 1 | **Alles draait in de browser.** Geen server, geen cookies, geen verzoeken naar buiten. | De gebruiker vult inkomen en gezinssituatie in. Wat het apparaat niet verlaat, kan niet lekken. Een test bewaakt het. |
| 2 | **Bedragen staan in `regels/`, niet in de code.** Elke parameter heeft een bron, een geldigheidsperiode en een status. | Bedragen veranderen twee keer per jaar. Zo is bijwerken een wijziging in data, en is elk bedrag terug te volgen tot zijn bron. |
| 3 | **Alleen officiële bronnen.** De bouw weigert andere domeinen. | Rekensites spreken elkaar tegen. Een bedrag dat niet officieel te bevestigen is, hoort er niet in. |
| 4 | **Liever "niet berekend" dan een schatting.** Ontbreekt een bedrag, dan zegt de rekenhulp dat. | Een verzonnen bedrag ziet eruit als een echt bedrag. |
| 5 | **Geld als decimale getallen** (decimal.js), nooit als zwevendekommagetal. | Afrondfouten van centen zijn in een berekening van een uitkering niet uit te leggen. |
| 6 | **De rekenkern staat los van de app** en levert bij elk bedrag zijn rekenstappen en gebruikte regels. | De uitleg in de app kan dan niet afwijken van de berekening, en de kern is zonder browser te testen. |
| 7 | **Taalniveau B1, u-vorm, bedragen per maand.** Uitleg staat achter een i-knop. | De doelgroep moet de vraag kunnen lezen zonder de uitleg; wie meer wil weten, klikt. |
| 8 | **Eén term per begrip.** Huisgenoten, rekenhulp, kinderopvang, inkomen per jaar, instelling, "uw contactpersoon bij de gemeente". | Twee woorden voor hetzelfde ding lezen als twee dingen. |
| 9 | **Eén antwoord bovenaan, per periode.** Geen overzicht per maand van het eerste jaar. | Het overzicht per maand gaf meer nuance dan de gebruiker nodig heeft en leidde af van het antwoord. |
| 10 | **Leidse regelingen als melding, niet als bedrag** (behalve de vergoeding van de eigen bijdrage kinderopvang). | De gemeente beslist per aanvraag; de rekenhulp kan het recht niet vaststellen. Een melding met bron zegt wat er kan veranderen. |
| 11 | **Werkkosten gaan niet van het inkomen voor de bijstand af.** Ze staan als aparte post onder "Wat eraf gaat". | Art. 31 en 32 Participatiewet kennen geen aftrek van kosten. Zie REKENREGELS.md. |
| 12 | **De vrijlating per periode tonen**, met de zin dat de gemeente beslist. | De vrijlating is tijdelijk en de gemeente heeft beleidsvrijheid; één bedrag zou te gunstig of te ongunstig zijn. |
| 13 | **Toeslagen op basis van een geschat jaarinkomen**, met de bijstand teruggerekend naar bruto. | Dienst Toeslagen rekent met het bruto jaarinkomen; de bijstand is netto. De schatting staat als aanname bij de uitkomst. |
| 14 | **Wijzigingen via pull requests, met tests en een overzicht van gewijzigde parameters.** | Een fout in een bedrag moet opvallen voordat ze online staat. |
| 15 | **Alleen verzonnen gegevens** in tests, proefpersonen en officiële rekenhulpen. | Er horen geen persoonsgegevens in een openbare repository of in een test. |
| 16 | **Kinderalimentatie staat bij de kinderen, achter een vinkje** ("Ik krijg kinderalimentatie", bij een stel "Ik of mijn partner krijgt kinderalimentatie"). De vraag naar ander inkomen staat boven de kinderen en heeft alleen de vakken partneralimentatie en ander inkomen. (13 november 2026) | Ander inkomen hoort bij het inkomen van de partner, dus vóór de kinderen. Op dat moment weet de rekenhulp nog niet of er kinderen zijn, dus kan het vak voor kinderalimentatie daar niet goed verschijnen. Een vinkje vraagt niemand naar iets wat niet voor hem geldt, net als het vinkje voor de kinderopvang. **Terugdraaien:** daarvoor stond ander inkomen ná de kinderen, met kinderalimentatie als derde vak (alleen bij kinderen). Zie de commit "Stap 1: kinderalimentatie bij de kinderen" in de geschiedenis. |
