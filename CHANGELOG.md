# Wijzigingen

Wat er per versie is veranderd. De opzet volgt [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/); de versienummers volgen [Semantic Versioning](https://semver.org/lang/nl/). In november 2026 zijn beide rekenhulpen inhoudelijk nagelopen. Versie 1.0.0 komt als de bedragen en regels van 2027 erin staan.

Het versienummer staat in `package.json`, in de voettekst van de rekenhulp en op de afdruk.

## Nog niet uitgebracht

### Veranderd

- Leidengeldwijzer is geen proefversie meer. Beide rekenhulpen zijn inhoudelijk nagelopen. Leidengeldwijzer staat nog niet in zoekmachines.
- Leidengeldwijzer: bij de opvang kunt u nu ook kiezen "Nog niet, maar dat wil ik". De prijs per uur is niet verplicht. Weet u die nog niet? Dan rekent Leidengeldwijzer met de hoogste prijs waarvoor u toeslag krijgt.
- Leidengeldwijzer: de vraag "Heeft u al 5 jaar of langer een laag inkomen?" is nu "… een inkomen op bijstandsniveau?". Dat is het woord van de gemeente, en het klinkt niet als een oordeel. Ook de teksten bij de inkomenstoeslag.
- Leidengeldwijzer: zwemles staat niet meer bij "Deze regelingen horen bij de Sleutelpas". U vraagt het aan bij het Jeugdfonds Sport & Cultuur, zoals de gemeente het beschrijft.
- Leidengeldwijzer: elk blok op de uitkomst heeft nu de rustige kleur van de organisatie. Rood voor de gemeente Leiden (met de gele Sleutelpas erin), blauw voor Dienst Toeslagen, groen voor de SVB en lichter blauw voor UWV. De tegels erin zijn wit.
- Leidengeldwijzer: bij het inkomen heet de keuze nu "Ander inkomen, zoals inkomsten uit verhuur". Pensioen was een verwarrend voorbeeld: wie de AOW-leeftijd heeft, ziet al een aparte keuze voor pensioen.
- Leidengeldwijzer: de individuele inkomenstoeslag kijkt nu ook naar de partner. Is uw partner jonger dan 23 jaar, of krijgt uw partner studiefinanciering? Dan is het "waarschijnlijk niet". Een stel krijgt de toeslag samen.
- Leidengeldwijzer: "Hulp bij schulden" staat bij de gemeente, bij wat u waarschijnlijk kunt krijgen, als u schulden invult. Zonder schulden staat het bij "Als u het nodig heeft". Nooit op twee plekken.
- Bij een bron staat niet meer wanneer wij de pagina hebben bekeken. Bij een wet staat wel welke versie geldt ("geldend vanaf …").
- Leidengeldwijzer: kinderopvang bij sociale of medische problemen staat nu bij "Als u het nodig heeft", en niet meer bij "Dit kunt u misschien krijgen". Alleen als er een kind jonger dan 13 is. "Wat heeft u nodig?" blijft erbij.
- Leidengeldwijzer: de uitleg bij de toeslag van UWV noemt nu ook de naam van de wet: de Toeslagenwet.
- Een nieuwe stap begint nu altijd bovenaan de pagina, ook als u ver naar beneden stond. Ook bij terug met de knop van de browser.
- Leidengeldwijzer: bij de kinderopvang heet het vak nu "Prijs per uur", zonder "(niet verplicht)". De uitleg eronder zegt al wat u doet als u de prijs nog niet weet.
- Op een computer is de tekst nu 16 pixels in plaats van 18, de standaard van de browser. Op een telefoon blijft het 18. Op een laag scherm (een laptop) is het rode vlak in de rekenhulpen lager. Zo ziet u op een laptop de knop of de kaarten zonder te scrollen. Inzoomen werkt zoals altijd: bij 200% is de tekst 2 keer zo groot.
- De molen en het water in de tekening bewegen nu ook in Leidenwerkt en Leidengeldwijzer, net als op de startpagina. Niet bij "minder beweging".
- Leidengeldwijzer: de knop bij bijzondere bijstand gaat nu direct naar de aanvraagpagina van de gemeente Leiden.
- Onderaan staat nu: "Dat beslist de organisatie die de regeling geeft." Zo klopt het ook voor de Voedselbank, het Jeugdfonds en de Stadsbank.
- Leidengeldwijzer: bij elke regeling staat nu apart wat het is, en waarom u het waarschijnlijk wel, misschien of waarschijnlijk niet krijgt. Met een eigen bedrijf staat het bedrijf als reden erbij.
- Leidengeldwijzer: "Hulp nodig?" heet nu "Als u het nodig heeft". Daarin staan hulp bij uw aanvraag, bijzondere bijstand (met voorbeelden), hulp bij schulden en de Voedselbank. De Voedselbank noemt de grens voor uw huishouden.
- Leidengeldwijzer: op de afdruk staat nu ook wat u kunt krijgen als u het nodig heeft: bijzondere bijstand en de Voedselbank.
- Leidengeldwijzer: de koppen op de uitkomst zeggen wat u moet doen. Bijvoorbeeld: "U moet deze regelingen zelf aanvragen. Kies een regeling. Dan ziet u hoe dat gaat."
- Leidengeldwijzer: bij de kinderopvangtoeslag staat nu concreet wie niet werkt of studeert. U of uw partner. Dan krijgt u de toeslag meestal niet. De uitzonderingen staan erbij: inburgering, een traject naar werk, of zorg uit de Wet langdurige zorg.
- Links naar andere websites hebben een klein pijltje ↗. Een schermlezer leest "opent in een nieuw tabblad". Onder de knop om aan te vragen staat de website.
- Startpagina: nieuwe teksten. "Wat houdt u over als u gaat werken?", en duidelijker over privacy en bronnen. UWV staat nu bij wie er beslist.
- De documentatie zegt nu eerlijk hoe er wordt gecontroleerd: er is één beheerder en nog geen tweede beoordelaar.

### Toegevoegd

- Bewaking: elke week controleert GitHub of alle links naar bronnen nog werken, en of onze letterlijke teksten nog op de webpagina's staan. Een verschil wordt een issue. Leestekens en opmaak tellen niet mee, een bedrag wel.
- Regeldata: de huurtoeslag voor 2027 uit de Regeling huurtoeslaggrenzen 2027 (huurgrenzen, kwaliteitskortingsgrens, aftoppingsgrenzen en minimum-inkomensijkpunten). Ook de vermogensgrenzen voor 2027 (€ 39.480 alleen, € 78.960 samen). De basishuur en de vrijstelling voor kinderen volgen als Dienst Toeslagen ze publiceert. Tot alle bedragen van 2027 bekend zijn, rekenen beide rekenhulpen met 2026.

### Opgelost

- Bedragen met een komma voor de duizendtallen: "40,000" las de rekenhulp als € 40. Nu is een komma of punt met precies 3 cijfers erachter een scheiding tussen duizendtallen. "1.234,56" en "1,234.56" worden allebei € 1.234,56.
- Leidengeldwijzer: een prijs per uur van 0 voor de opvang telt nu als "weet ik niet". Dan rekent Leidengeldwijzer met de hoogste prijs voor de toeslag.
- Leidengeldwijzer: met bijstand stond de kinderopvangtoeslag altijd bij "waarschijnlijk niet", met de reden "U werkt niet". Gaat een kind naar de opvang, dan vraagt Leidengeldwijzer nu: "Werkt u naast de bijstand?"
- Leidengeldwijzer: met bijstand en een huisgenoot van 27 jaar of ouder rekende de huurtoeslag met de volle bijstandsnorm. Nu met de kostendelersnorm, zoals Leidenwerkt. De huurtoeslag was te laag.
- Een ouder met alleen kinderen van 18 jaar of ouder telde als alleenstaande ouder. Nu als alleenstaande: de vermogensgrens voor bijstand is € 8.000, en de inkomenstoeslag is het bedrag voor een alleenstaande (art. 4 Pw).
- Na de jaarwissel, als nog niet alle bedragen van het nieuwe jaar bekend zijn: Leidengeldwijzer rekent dan met de regels van 31 december, met een melding bovenaan het overzicht. Eerst gaf Leidengeldwijzer een witte pagina, of verdwenen regelingen zonder uitleg. Leidenwerkt gaf een witte pagina bij partneralimentatie.
- Gaat er bij het rekenen toch iets mis, dan ziet u een melding met het telefoonnummer van de gemeente, en geen witte pagina.
- De link naar de bedragen van de kinderopvangtoeslag 2026 op rijksoverheid.nl werkte niet meer. Hij gaat nu naar het nieuwe adres.
- De letterlijke teksten bij de vermogensgrenzen van de toeslagen zijn bijgewerkt. Dienst Toeslagen noemt op die pagina's nu 2027, en zegt wat het in 2026 was.

## 0.8.0 – 23 november 2026

Leidenwerkt 0.8.0 en Leidengeldwijzer 0.4.0. Leidenwerkt zelf is niet veranderd.

### Toegevoegd

- Leidengeldwijzer: "Wat heeft u nodig?" in het venster van 13 regelingen. Welke papieren of gegevens u nodig heeft voor de aanvraag, uit de officiële bron.

### Opgelost

- Leidengeldwijzer: de link bij Bijstand ging naar een pagina die niet meer bestaat. Hij gaat nu naar "Bijstand aanvragen" van de gemeente Leiden.

### Veranderd

- De rekenkern van Leidengeldwijzer is opgedeeld: één bestand per organisatie. De uitslagen zijn gelijk gebleven.
- De documentatie is teruggebracht van zeventien naar zeven documenten. Een nieuwe controle in `npm test` bewaakt de links, het versienummer en oude namen.

### Gecontroleerd

- Acht personen van Leidengeldwijzer zijn vergeleken met de proefberekening van Dienst Toeslagen. Alle 21 bedragen waren gelijk. De audit controleert ze voortaan bij elke wijziging.

## 0.7.0 – 23 november 2026

Leidenwerkt 0.7.0 en Leidengeldwijzer 0.3.0.

### Toegevoegd

- Leidengeldwijzer: de toeslag van UWV (Toeslagenwet). Wie een uitkering van UWV heeft en een inkomen onder het sociaal minimum van UWV, ziet een tegel in een nieuw blok "UWV".
- Leidengeldwijzer werkt nu ook voor mensen met de AOW-leeftijd. De grenzen komen dan uit de normen voor mensen met AOW (art. 22 Participatiewet). In plaats van de bijstand noemt Leidengeldwijzer de AIO-aanvulling van de SVB. Bij de soorten inkomen staan dan "AOW van de SVB" en "Pensioen". Met AOW en pensioen rekent Leidengeldwijzer ook de toeslagen uit, met de belasting en de bijdrage Zvw voor mensen met de AOW-leeftijd.

### Gewijzigd

- Leidenwerkt: in het rode vlak van de uitkomst staat nu een korte tekst en de knop "Afdrukken of opslaan als pdf", zoals bij Leidengeldwijzer.
- Leidengeldwijzer: op de telefoon is er minder ruimte rond de kaarten in het overzicht. Zo blijven de tegels breed genoeg.
- Leidengeldwijzer: op de afdruk staat "AOW van de SVB" weer met hoofdletters.
- Leidengeldwijzer: onder het overzicht staat "Verandert uw situatie? Doe de check dan opnieuw."
- De belasting voor mensen met de AOW-leeftijd is getoetst aan de groene maandtabel loonheffing 2026.

## 0.6.0 – 23 november 2026

Leidenwerkt 0.6.0 en Leidengeldwijzer 0.2.0.

### Toegevoegd

- Leidengeldwijzer (proefversie): welke regelingen kunt u krijgen in Leiden? Bijvoorbeeld de Sleutelpas, de toeslagen en de bijstand. U vult een paar vragen in en ziet een overzicht in tegels, per gemeente, Dienst Toeslagen en SVB. Het overzicht kunt u afdrukken. Op isvisvisv.github.io/Rekenhulp/leidengeldwijzer/.
- Startpagina "Rekenhulp voor Leidenaren" op isvisvisv.github.io/Rekenhulp/, met beide rekenhulpen. Bovenaan een rood vlak met een eigen lijntekening van Leiden: molen De Valk, de Koornbrug en de gevel van de Hooglandse Kerk. In de donkere modus is het een avondlucht.
- Leidengeldwijzer: bij schulden staat de hulp van de Stadsbank Leiden bij wat u waarschijnlijk kunt krijgen. Met een inkomen onder de bijstand en een huurwoning: waarschijnlijk wel bijstand.

### Gewijzigd

- Nieuwe stijl, net als de startpagina. Bovenaan staat een rood vlak met "Rekenhulp voor Leidenaren". Daarmee gaat u terug naar de startpagina. Op de eerste pagina en bij de uitkomst staat in het rode vlak de kop met een lijntekening van Leiden. Bij de vragen is het rode vlak laag. De vragen en de uitkomst staan in een witte kaart.
- Leidengeldwijzer: elke groep in het overzicht is een witte kaart. Op de telefoon staat "Hulp nodig?" nu onderaan, na de regelingen.
- "t/m" (bijvoorbeeld "maand 1 t/m 6") breekt niet meer af na de schuine streep. Dat gebeurde in sommige browsers op een smal scherm.
- Kinderopvang: bij elk kind jonger dan 13 de vraag "Als u gaat werken, gaat dit kind dan naar de opvang?" (Nee / Ja), in plaats van een vinkje. Op de startpagina: "Gaat uw kind naar de opvang terwijl u werkt? Vul dan in hoeveel uur per week dit is. Weet u de prijs per uur? Vul die dan ook in."
- Tekst onderaan de pagina: wat u invult blijft op uw eigen telefoon of computer, Leidenwerkt geeft een schatting, en een link naar de broncode.
- Lettertype Open Sans in plaats van Atkinson Hyperlegible. Het zit in de bundel, de site laadt niets van buiten.
- Sleutelpas bij verblijf in een instelling: "Woont u in een instelling? Dan kunt u de Sleutelpas niet krijgen." Zo staat het in de Beleidsregels Sleutelpas 2026, art. 2.2 a. Eerder gaf de rekenhulp hier een inkomensgrens.
- Knop voor licht en donker, rechts bovenaan. Zonder keuze volgt de pagina de instelling van uw telefoon of computer. De keuze blijft op uw eigen apparaat.
- Nieuw adres: Leidenwerkt staat nu op isvisvisv.github.io/Rekenhulp/leidenwerkt/. Op isvisvisv.github.io/Rekenhulp/ staat een startpagina met beide rekenhulpen.
- Uitleg bij een vraag: korte uitleg staat nu altijd onder de vraag. Langere uitleg en bronnen staan achter de knop "Meer uitleg", in plaats van achter een klein i-knopje.
- Rustigere kleuren, geïnspireerd op gemeente.leiden.nl: tekst bijna zwart met een vleugje blauw, een koele grijze achtergrond. De donkere modus is donkerblauw. Het rood blijft.
- De melding over de toeslagen heet nu "Geef uw nieuwe inkomen door aan Dienst Toeslagen". Wie een toeslag krijgt, ziet die melding nu altijd, ook als de toeslag niet verandert: een nieuw inkomen moet u dan toch doorgeven (Belastingdienst, "Mijn inkomen verandert – moet ik dat doorgeven?").

## 0.5.0 – 13 november 2026

### Gewijzigd

- Toets van de belastingberekening aan de witte en groene maandtabel loonheffing 2026 van de Belastingdienst (`packages/rekenkern/test/loonheffingstabellen.test.ts`): verschil hoogstens € 0,18 per maand.
- Werkt uw partner al? Dan vraagt de rekenhulp hoe lang. Bij korter dan 6 maanden mag ook uw partner een deel van het loon houden (art. 31 lid 2 onder n en art. 45 lid 4 Pw).
- Gemeentepolis bij verblijf in een instelling: de grens volgt de tabel van de gemeente (€ 512,36 zonder vakantiegeld).
- Startpagina: een vollediger lijst van wat u nodig heeft, met het inkomen per jaar van volwassenen en kinderen van 18 jaar of ouder die bij u wonen; voor wie de rekenhulp is, staat onderaan.
- Uw huishouden: nieuwe volgorde (partner, geboortedatums, werk van de partner, kinderen, ander inkomen). Nieuwe uitleg bij partner, kinderen en werk van de partner.
- Ander inkomen in drie vakken: partneralimentatie (de rekenhulp trekt de belasting er zelf af, art. 31 lid 3 Pw), kinderalimentatie (telt niet mee voor de toeslagen) en ander inkomen.
- Loon per week in plaats van per 4 weken.
- Bij iemand anders in huis: geen ja/nee-vraag over andere bewoners, maar meteen het aantal, met de persoon bij wie u woont meegeteld.
- Sleutelpas en Kindtegoed zijn twee aparte meldingen. Alle grenzen staan er "met vakantiegeld" bij.
- Werkt u al korter dan 6 maanden, dan heet de eerste periode "Tot 6 maanden nadat u naast de bijstand bent gaan werken" en vervalt "De eerste 12 maanden samen".
- Uw huishouden: ander inkomen staat nu vóór de kinderen. Kinderalimentatie vult u in bij de kinderen, na de vraag "Krijgt u kinderalimentatie voor deze kinderen?" (BESLUITEN.md, besluit 16). Terug te draaien met de commit "Stap 1: kinderalimentatie bij de kinderen".
- Stap 1 en 3 in delen: een kop met een streep erboven ("Kinderen", "Uw werk nu", "Het werk dat u overweegt"), in plaats van een streep naast de titel van een groep (besluit 18).
- Regelingen van Leiden (Sleutelpas, Kindtegoed, Gemeentepolis, zwemabonnement, Sport en cultuur): zolang iemand bijstand krijgt, telt het vrijgelaten deel van het loon niet mee. De regeling kan dan nog, en de melding zegt: "U krijgt nog bijstand. Het deel van uw loon dat u mag houden, telt voor deze regeling niet mee." Praktijk van de gemeente, bevestigd door klantmanagers.
- Teksten zonder ";" (aannames, meldingen, uitleg en "Wat u heeft ingevuld").
- Audit: vaste rekendatum (iedereen krijgt dezelfde uitkomst), personen met officiële bedragen (audit/extern/*.yaml en `verwacht`), en de audit draait bij elke wijziging op GitHub met het rapport erbij.
- Omschrijvingen en bronnen in de regelbestanden zonder ";".
- Loon per 4 weken is weer een eigen keuze (bruto en netto). Dan staat de melding over twee keer loon in één maand erbij. De zin "Deel het bedrag dan door 4" bij het weekloon is weg.
- `npm run audit -- --willekeurig 200`: dezelfde controles met willekeurige verzonnen personen, en drie controles erbij (kapotte tekst, rekenen zonder fout, de zin over de bijstand).
- `npm run audit`: rekent vaste verzonnen personen door met de echte uitkomstpagina, schrijft de uitkomsten als tekst weg en doet tien automatische controles (zie audit/README.md).
- Afronding: de bijstand in de tabel neemt het afrondingsverschil van de andere rijen op. "U houdt over" is daardoor precies het afgeronde totaal en verspringt niet meer met € 1 als de urenschuif een uur verschuift.
- Eigen bijdrage kinderopvang: het deel dat de gemeente vergoedt en het deel dat u zelf betaalt, zijn samen precies het totaal.
- Tabel: de regel met ander inkomen heet naar wat erin zit: "Kinderalimentatie", "Partneralimentatie (na belasting)", "Alimentatie", "Ander inkomen" of "Alimentatie en ander inkomen".
- Afdruk: de zinnen onder de tabel schuiven niet meer over "U houdt over". De zin over vanaf hoeveel uur u geen bijstand meer nodig heeft, staat nu ook op papier. De punten onder "Wat u nu kunt doen" zijn op papier gewone tekst. De zin "Klik op een kop…" staat niet op papier.
- Wat u heeft ingevuld: bedragen met een punt ("€ 2.300"), het vakantiegeld bij een uurloon, "Werkt al 6 maanden of langer naast de bijstand" in plaats van alleen "6 maanden of langer", en "U heeft de urenschuif verschoven naar 32 uur" als de schuif op een ander aantal uren staat.
- Hoe is dit berekend, netto loon: bij een loon per week staat het ingevulde weekloon en daarna "Omgerekend naar een maand (× 52 / 12), zonder vakantiegeld". Bij een uurloon staat het ingevulde uurloon erbij.
- Bij een netto loon en een verschoven urenschuif: "Hoe is dit berekend?" toont het ingevulde netto loon (niet meer het omgerekende bedrag als "dat u invulde") en het bruto loon bij de ingevulde uren. De zin onder de tabel noemt het netto loon bij de nieuwe uren als "ongeveer", uit de tabel.
- Escape in een geopende uitleg sluit die uitleg en zet de focus terug op het i-knopje. Staat er een bron open, dan sluit Escape eerst de bron.
- Onder de tabel: staat de urenschuif op een ander aantal uren dan bij het ingevulde maand- of weekloon, dan noemt de zin beide, bijvoorbeeld "U vulde € 1.300 netto per maand in, bij 24 uur per week. Bij 40 uur is dat € 2.167 netto per maand." (besluit 17).
- Uitleg bij kinderen: "Dat vult u later in bij het onderdeel 'Uw woning'." De vraag zelf staat er niet meer in, omdat die per huishouden anders luidt.
- Bij de uren kinderopvang staat geen rekenuitleg meer: de rekenhulp vraagt het aantal uren per week en houdt zelf rekening met het maximum van 230 uur per maand.
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

- Werkwijze voor een gebruikerstest met personages (nu in `docs/CONTROLE.md`, hoofdstuk 6).
- Netto loon per 4 weken als keuze bij het loon.
- Bij het inkomen van huisgenoten: "Ik weet het niet". De rekenhulp rekent de huurtoeslag dan niet uit en zegt waarom.
- Vaste stap "Meld uw werk bij de gemeente" voor iedereen met bijstand, met de tekst van art. 17 Participatiewet.
- Stap "Vraag kinderopvangtoeslag aan", met de termijn van 3 maanden (bron: Belastingdienst).
- Knop "Sluiten" in het venster met de wettekst.
- Toets van de toeslagformules aan dertien proefberekeningen van Dienst Toeslagen (`packages/rekenkern/test/proefberekening.test.ts`).

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
