# Onderhoud: bedragen bijwerken

Bedragen veranderen meestal op **1 januari** en **1 juli**. Doe dit twee keer per jaar.

## Stappenplan

1. **Zoek de officiële publicatie.**
   - Bijstandsnormen en vrijlatingen: de mededeling in de Staatscourant "gewijzigde bedragen per 1 januari/1 juli" en de Normenbrief op rijksoverheid.nl.
   - Belasting: belastingdienst.nl, "Voorlopige aanslag [jaar]: tarieven en heffingskortingen".
   - Toeslagen: Staatscourant (standaardpremie, Regeling huurtoeslaggrenzen), Besluit kinderopvangtoeslag (bijlage I), belastingdienst.nl/toeslagen.
   - Leiden: lokaleregelgeving.overheid.nl, zoeken op "Leiden".
2. **Maak een nieuw bestand** naast het oude, bijvoorbeeld `regels/landelijk/participatiewet/2027-07.yaml`. Kopieer het vorige bestand en pas aan:
   - `geldig_van` (eerste dag), `geldig_tot` (laatste dag of leeg);
   - zet in het vorige bestand `geldig_tot` op de dag ervoor;
   - per parameter de nieuwe `waarde`, de `bron` (titel, url, `geraadpleegd_op`) en de `status`.
3. **Status kiezen.** `geverifieerd` alleen als u de officiële bron zelf hebt geopend en de waarde letterlijk hebt overgenomen. Anders `onbevestigd`. Onbekend: `ontbrekend` zonder waarde.
4. **Controleer:** `npm test`. Fouten in bestanden (geen bron, overlappende periode) worden met bestandsnaam gemeld.
5. **Pas `docs/REKENREGELS.md` aan** en zet open punten in `docs/OPEN_VRAGEN.md`.
6. **Publiceer:** commit naar `main`; de CI zet de nieuwe versie online.

Bedragen gelden altijd per datum. Een oud bestand blijft staan; zo kan de app ook voor een eerdere periode rekenen.
