# Wijzigingen

Wat er per versie is veranderd. De opzet volgt [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/); de versienummers volgen [Semantic Versioning](https://semver.org/lang/nl/). Zolang de versie met 0 begint, is de rekenhulp nog niet nagelopen door iemand uit de praktijk.

Het versienummer staat in `package.json`, in de voettekst van de rekenhulp en op de afdruk.

## Nog niet uitgebracht

### Gewijzigd

- Werkt uw partner al? Dan vraagt de rekenhulp hoe lang. Bij korter dan 6 maanden mag ook uw partner een deel van het loon houden (art. 31 lid 2 onder n en art. 45 lid 4 Pw).
- Gemeentepolis bij verblijf in een instelling: de grens volgt de tabel van de gemeente (€ 512,36 zonder vakantiegeld).
- Startpagina: een vollediger lijst van wat u nodig heeft (zonder het inkomen van huisgenoten; dat vraagt de rekenhulp later, met de keuze 'weet ik niet'); voor wie de rekenhulp is, staat onderaan.
- Uw huishouden: nieuwe volgorde (partner, geboortedatums, werk van de partner, kinderen, ander inkomen). Nieuwe uitleg bij partner, kinderen en werk van de partner. Bij een stel: "De uitkomst geldt voor u samen."
- Ander inkomen in drie vakken: partneralimentatie (de rekenhulp trekt de belasting er zelf af, art. 31 lid 3 Pw), kinderalimentatie (telt niet mee voor de toeslagen) en ander inkomen.
- Loon per week in plaats van per 4 weken.
- Bij iemand anders in huis: geen ja/nee-vraag over andere bewoners, maar meteen het aantal, met de persoon bij wie u woont meegeteld.
- Sleutelpas en Kindtegoed zijn twee aparte meldingen. Alle grenzen staan er "met vakantiegeld" bij.
- Werkt u al korter dan 6 maanden, dan heet de eerste periode "Tot 6 maanden nadat u naast de bijstand bent gaan werken" en vervalt "De eerste 12 maanden samen".
- Het i-knopje staat direct achter de vraag, ook als die over twee regels loopt. Geen dubbele witruimte meer onder een groep vragen.
- Het inkomen van een kind van 18 of ouder wordt per kind gevraagd, het hele bedrag; de rekenhulp trekt zelf € 6.218 af bij een kind dat aan het begin van het jaar jonger is dan 23 (Belastingdienst). Studiefinanciering telt niet mee.
- Weet de gebruiker het inkomen van huisgenoten of van een kind niet, dan rekent de rekenhulp de huurtoeslag toch uit, zonder dat inkomen, en zegt dat onder de tabel.
- De meldingen over de Sleutelpas, het Kindtegoed, de Gemeentepolis, het zwemabonnement, het Volwassenenfonds en de OV-pas gebruiken dezelfde zinnen: boven de grens "krijgt u … niet meer", eronder "kunt u … nog krijgen".
- De grens voor de Gemeentepolis (collectieve zorgverzekering) volgt de tabel op de gemeentepagina, net als het Volwassenenfonds.
- Totalen, "U houdt over", de kop, "Zonder vrijlating" en "De eerste 12 maanden samen" rekenen met de afgeronde bedragen uit de tabel.
- Maximumbedragen van de vrijlating staan overal als "tot € …".
- Bij de verlaging voor lage woonkosten staat dat die niet geldt als er iemand van 27 jaar of ouder bij u woont.
- "Samen evenveel loon en bijstand als zonder werk" in plaats van "samen evenveel binnen".

## 0.4.0 – 12 november 2026

### Toegevoegd

- Werkwijze voor een gebruikerstest met personages (`docs/GEBRUIKERSTEST.md`).
- Netto loon per 4 weken als keuze bij het loon.
- Bij het inkomen van huisgenoten: "Ik weet het niet". De rekenhulp rekent de huurtoeslag dan niet uit en zegt waarom.
- Vaste stap "Meld uw werk bij de gemeente" voor iedereen met bijstand, met de tekst van art. 17 Participatiewet.
- Stap "Vraag kinderopvangtoeslag aan", met de termijn van 3 maanden (bron: Belastingdienst).
- Knop "Sluiten" in het venster met de wettekst.
- Toets van de toeslagformules aan dertien proefberekeningen van Dienst Toeslagen (`packages/engine/test/proefberekening.test.ts`).

### Gewijzigd

- "Wat u nu kunt doen" is een lijst, elke stap op een eigen regel. De stap voor de opvang heet "Vraag bijzondere bijstand aan voor de eigen bijdrage kinderopvang".
- Voorbeelden bij ander inkomen (andere uitkering, alimentatie, pensioen) en bij reiskosten (OV-kosten of benzine).
- Bij meer periodes zegt de kop over welke periode hij gaat.
- De vraag over gas, licht en water komt pas na de vraag over andere bewoners, en alleen als er geen volwassenen van 27 jaar of ouder in huis wonen; anders doet hij niet ter zake.
- Teksten: "andere volwassenen van 27 jaar of ouder in huis" in plaats van "huisgenoten", met de vermelding dat jongere huisgenoten niet meetellen; reiskosten bij ander werk; wie al langer werkt; de uitleg bij de opvanguren; "Netto loon, beide banen".
- Onder de kop staat een kort lijstje met het bedrag per periode en over de eerste 12 maanden samen, in plaats van een lange alinea.
- Duidelijkere teksten: wat u zonder vrijlating zou overhouden, de verlaging zonder woonkosten (zonder "norm voor partners"), de uitleg voor wie jonger is dan 27, de rekennorm van 90% voor een alleenstaande ouder bij de bijzondere bijstand, waarom het bruto inkomen met werk lager kan zijn, het inkomen van kinderen van 18 jaar of ouder bij de huurtoeslag, en de prijs van de opvang op het startscherm.
- De urengrens zegt "zonder vrijlating", en legt uit waarom er nog bijstand is als u boven de grens werkt.
- Wie al werkt, krijgt "Geef de verandering in uw werk door aan de gemeente" in plaats van "Meld uw werk".
- Bij het loon is niet meer vooraf gekozen welk bedrag u weet. In de tabel staat "Netto loon (met vakantiegeld)".
- Onder de tabel: vaste lasten zoals huur en zorgpremie staan er niet in. De zin over kostgeld is per situatie geschreven.
- Kleinere teksten: uitleg voor stellen wie "u" is, uitleg bij werk van de partner, flat of appartement bij de huurwoning, eenvoudiger uitleg bij de kale huur, dat partner- en kinderalimentatie allebei meetellen (met bron), wat de kleuren bij de meldingen betekenen, klikbare adressen in meldingen, en overal hetzelfde bedrag voor de grens van lage woonkosten.
- Geen enkele ja/nee-vraag heeft nog een antwoord vooraf; wie niets kiest, krijgt een foutmelding. Alleen "Nee, of ik weet het niet" bij de medische urenbeperking staat vooraf aan.
- Kleinere tekstverbeteringen: uitleg bij "Wat verandert er aan uw werk?", bij de huidige uren en bij een lage huur; geen voorbeeldprijs die op de echte prijs lijkt; geen knop om het enige kind te verwijderen.
- "Goed om te weten" toont alleen de koppen; een klik klapt de uitleg open. "Wat u nu kunt doen" is een korte rij links die de melding openklapt.
- Onder de tabel staat nu ook: de verlaging bij lage woonkosten, waar het kostgeld is, het loon van de partner met vakantiegeld, waarom toeslagen gelijk blijven en hoe u de combinatiekorting krijgt. Bij de meldingen staat met welk inkomen de grenzen zijn vergeleken.
- De melding over toeslagen zegt dat de daling al in de bedragen zit.
- Kortere teksten op de uitkomst (ongeveer 18% minder zichtbare woorden): het lijstje per periode, de bijstand, de urengrens, de uitleg van de vrijlating, de zinnen onder de tabel en het telefoonnummer. De zin met welk inkomen de grenzen zijn vergeleken, staat nu in de meldingen die een grens noemen.

### Hersteld

- Partneralimentatie telt voor de toeslagen bruto mee (het ontvangen bedrag), niet teruggerekend uit het bedrag na belasting. In de tabel heet de rij dan "Ander inkomen (na belasting)".
- Gratis OV-pas: volgens de gemeente voor wie bijstand krijgt of een inkomen heeft tot 100% van het sociaal minimum. De melding zegt nu "Zolang u bijstand krijgt, kunt u de gratis OV-pas houden", en vergelijkt anders met de grens.
- Bij kostgeld met een huisgenoot van 27 jaar of ouder noemt de uitleg nu de juiste reden. De aanname over kamers staat niet meer bij wie bij iemand anders in huis woont; de zin over huurtoeslag staat er ook bij wie niets betaalt.
- "Dat is niet meegerekend" in de meldingen is nu "Dat zit niet in de bedragen hierboven".
- Bij werk erbij: "Hoeveel uur per week gaat u bij het extra werk werken?". Meervoud bij de vraag of de kinderen al naar de opvang gaan.
- Met het vinkje "Ik weet dit inkomen niet" blijft de vraag zichtbaar.
- De uitleg dat de vrijlating voor het huidige werk afloopt, staat bij elke latere periode.
- Een half uur (bijvoorbeeld 2,5) werd zonder melding afgerond. Nu vraagt de rekenhulp om een heel aantal uren.
- Het venster met de wettekst ging al open bij focus of aanwijzen en lag dan over de vragen. Nu opent het alleen met een klik of Enter; na sluiten staat de focus weer op de bron.
- Na "Volgende stap" met een fout gaat de focus naar de samenvatting bovenaan; elke melding is een link naar de vraag.
- Escape sluit de uitleg van een i-knopje. Na "Kind toevoegen" staat de focus op de geboortedatum van het nieuwe kind.
- Het voorbeeld bij de geboortedatum van een kind is een datum die bij een kind past.
- Een te hoog uurloon geeft een melding die de grens noemt.
- De kop van de uitkomst kon € 1 verschillen van de tabel door afronding. De kop rekent nu met de bedragen uit de tabel.
- "Goed om te weten" zegt bij meer periodes over welke periode de meldingen gaan.
- Periodes met precies dezelfde uitkomst staan als één periode, bijvoorbeeld "Vanaf maand 7" als de bijstand al na maand 6 stopt.
- De bron bij een periode noemt alleen de wetsregel van die periode.
- "Het kinderdagverblijf" in plaats van "de kinderdagverblijf".
- Onder de tabel staat ook waarom toeslagen dalen. In de meldingen met een grens staat "uw inkomen samen" bij een stel.
- Voor wie jonger is dan 27: duidelijker uitleg zonder het woord "bijverdienregeling".
- In de uitleg bij huisgenoten: andere kamerhuurders met een eigen contract tellen niet mee (bron: Rijksoverheid).
- De urenschuif ging terug naar de ingevulde uren na "Gegevens aanpassen". Nu blijft hij staan, zolang de uren en het loon gelijk blijven. "Wat u heeft ingevuld" toont de ingevulde uren, niet de stand van de schuif.
- Bij een ander soort woning of een ander soort loon bleef het oude bedrag in het veld staan, met een andere betekenis. Nu begint het veld leeg.
- Een foutmelding bleef bovenaan staan als de vraag al was opgelost of verdwenen.
- "Wat u heeft ingevuld" toont "nee" bij andere bewoners als beide aantallen 0 zijn.
- Boven 140% van het sociaal minimum zei de melding niet dat ook het Kindtegoed vervalt.
- De tekst over een geschatte opvangprijs ging alleen over het eerste kind zonder prijs; nu noemt hij elke soort opvang waarvan de prijs onbekend is.
- Bij partners werd de bijstand voor de toeslagen teruggerekend alsof één persoon alles kreeg. Daardoor was het geschatte jaarinkomen te hoog en de zorgtoeslag en huurtoeslag te laag. Nu krijgt ieder de helft, zoals in art. 45 lid 4 Participatiewet.
- De combinatiekorting werd begrensd op de belasting over het loon alleen. Nu telt de belasting over loon en bijstand samen; bij een laag loon is de korting daardoor hoger.
- Wie al langer dan 6 maanden naast de bijstand werkt en meer uren gaat werken, zag een te hoog bedrag over de eerste 12 maanden: de rekenhulp rekende alsof de vrijlating opnieuw begon. Nu geldt de situatie zonder vrijlating alle 12 maanden.
- Een klik op een link onder "Wat u nu kunt doen" bracht u terug naar het begin van de rekenhulp.

## 0.3.0 – 11 november 2026

### Toegevoegd

- Bronnencontrole: elke geverifieerde parameter heeft een letterlijk citaat uit de officiële bron, en een test controleert dat de waarde in dat citaat staat. De tabel van de kinderopvangtoeslag is rij voor rij met de bron vergeleken.
- Melding over het Volwassenenfonds Sport & Cultuur (Leiden).
- Woonsituatie "bij iemand anders in huis, en ik betaal kostgeld of huur". Alleen het deel voor de woonruimte telt; bij een laag bedrag verlaagt de gemeente Leiden de bijstand.

### Gewijzigd

- De vragen over het huishouden zijn eenvoudiger: twee ja/nee-vragen over partner en kinderen in plaats van één keuzelijst.
- De vraag naar andere bewoners staat bij de woning. De aantallen verschijnen alleen als er andere bewoners zijn; het aantal van 18 tot en met 26 jaar alleen bij een zelfstandige huurwoning, omdat het alleen voor de huurtoeslag telt.
- Zorgverzekering en zwemabonnement zijn twee losse meldingen.
- Duidelijkere teksten bij ander inkomen en bij de kosten voor wie meer gaat werken.
- De uitkomst legt bedragen uit die anders lijken dan verwacht: het ingevulde loon tegenover het netto loon met vakantiegeld, de geschatte prijs van de kinderopvang, waarom er bij een kamer geen huurtoeslag staat, waarom het jaarbedrag geen 12 keer het maandbedrag is, wat de vrijlating oplevert en wat een medische urenbeperking doet.
- De meldingen over de Sleutelpas noemen de grens voor het huishouden en de opbouw van het Kindtegoed. De zin over het stoppen van de bijstand noemt het bedrag en gebruikt geen vakterm meer.
- Duidelijkere uitleg bij de woonsituatie: waar iemand die bij familie woont of geen vaste woonplek heeft moet kiezen, hoe u kunt nagaan of u in een instelling met een lagere bijstand woont, en vanaf welk bedrag een lage huur de bijstand verlaagt.
- De uren kinderopvang vult u per week in; de rekenhulp rekent ze om naar een maand (× 52 / 12).
- Bovenaan de uitkomst staat "Wat u nu kunt doen", met een link naar de meldingen waarvoor u iets moet doen. Wie geen contactpersoon heeft, vindt het telefoonnummer van de gemeente.
- Kortere en duidelijkere uitleg bij partner, kinderen, andere bewoners, medische urenbeperking en het startscherm.
- Geen antwoorden meer vooraf gekozen bij de woonsituatie, de soort opvang, het vakantiegeld in een uurloon en de aantallen bewoners. Wie niets kiest, krijgt een foutmelding in plaats van een stilzwijgende aanname.

### Hersteld

- Twee regels steunden op "de praktijk in Leiden" zonder bron. De vergoeding van de eigen bijdrage kinderopvang steunt nu op de tekst van de beleidsregels bijzondere bijstand (art. 7 lid 1 onder f). Bij een instelling zegt de rekenhulp dat de aanname dat de bewoner niets betaalt meestal klopt, maar afhangt van de instelling.
- De grens van de Sleutelpas, het Kindtegoed en het Volwassenenfonds is nu een vaste norm per soort huishouden, zonder kostendelersnorm, zoals in de tabellen van de gemeente. Eerder rekende de rekenhulp met de kostendelersnorm, waardoor de grens voor wie met anderen woont te laag was.
- Bij verblijf in een instelling volgen deze grenzen de norm voor een instelling, zoals de gemeente die noemt. Eerder gold daar de gewone norm, waardoor de grens veel te hoog was.
- Bij een kamer of gedeelde woning vraagt de rekenhulp nu de huur. Daardoor past ze ook daar de Leidse verlaging van de bijstand bij lage woonkosten toe. Eerder rekende ze bij een kamerhuur onder de grens met een te hoge bijstand.

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
