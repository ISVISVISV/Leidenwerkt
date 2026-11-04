# Bijdragen

Bijdragen zijn welkom, vooral:

- **Een bedrag of regel bijwerken.** Pas het YAML-bestand in `regels/` aan, met bron (URL van een officiële publicatie) en datum van raadplegen. Zie [docs/ONDERHOUD.md](docs/ONDERHOUD.md).
- **Een fout melden.** Beschrijf de situatie (huishouden, loon, uren), wat de app uitrekent en wat volgens u klopt, met bron.
- **Een testgeval aanleveren.** Een geanonimiseerde situatie met een uitkomst uit een officiële proefberekening of beschikking is zeer waardevol.

Regels voor code:

1. Geen bedragen of percentages in code; alles in `regels/`.
2. Geen floats voor geld; gebruik de helpers in `packages/engine/src/geld.ts`.
3. Elke wijziging in de engine heeft tests. `npm test` en `npm run test:e2e` moeten slagen.
4. Geen externe verzoeken vanuit de app (geen analytics, CDN's of externe fonts).
5. Teksten in de app in begrijpelijk Nederlands (taalniveau B1).

Gebruik alleen officiële bronnen: wetten.overheid.nl, officielebekendmakingen.nl, lokaleregelgeving.overheid.nl, rijksoverheid.nl, belastingdienst.nl, svb.nl, gemeente Leiden. Rekensites van derden tellen niet als bron.
