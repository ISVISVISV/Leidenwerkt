/**
 * Bewaking: verwerking van SRU-antwoorden (vorm zoals op 8 november 2026
 * nagelopen bij zoekservice.overheid.nl en repository.overheid.nl) en de
 * controles zonder externe bron.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { aflopendeRegels, antwoordFouten, halfjaarlijks, lokaalMeldingen, publicatieMeldingen, records, velden, wetMeldingen, zoekVanaf } from "../../../scripts/bewaking.ts";
import { ruweParameters, type RuweParameter } from "../src/index.ts";

const BWB = `<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/"><version>1.2</version><numberOfRecords>1</numberOfRecords><records><record>
<recordData><gzd><originalData><overheidbwb:meta><owmskern><dcterms:identifier>BWBR0015703</dcterms:identifier><dcterms:title>Participatiewet</dcterms:title>
<dcterms:modified>2026-07-01</dcterms:modified></owmskern><bwbipm><overheidbwb:toestand>http://wetten.overheid.nl/id/BWBR0015703/2026-07-01/0</overheidbwb:toestand>
<overheidbwb:geldigheidsperiode_startdatum>2026-07-01</overheidbwb:geldigheidsperiode_startdatum></bwbipm></overheidbwb:meta></originalData></gzd></recordData></record></records></searchRetrieveResponse>`;

const REPO = `<sru:searchRetrieveResponse xmlns:sru="http://docs.oasis-open.org/ns/search-ws/sruResponse"><sru:version>2.0</sru:version><sru:numberOfRecords>1</sru:numberOfRecords><sru:records><sru:record><sru:recordData><gzd:gzd><gzd:originalData><overheidwetgeving:meta><overheidwetgeving:owmskern><dcterms:identifier>stcrt-2025-39783</dcterms:identifier><dcterms:title>Regeling ... (Regeling huurtoeslaggrenzen 2026)</dcterms:title><dcterms:type scheme="OVERHEIDop.Rubriek">ministeriële regeling</dcterms:type></overheidwetgeving:owmskern></overheidwetgeving:meta></gzd:originalData><gzd:enrichedData><gzd:preferredUrl>https://zoek.officielebekendmakingen.nl/stcrt-2025-39783.html</gzd:preferredUrl></gzd:enrichedData></gzd:gzd></sru:recordData></sru:record></sru:records></sru:searchRetrieveResponse>`;

const CVDR = `<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/"><numberOfRecords>1</numberOfRecords><records><record><recordData><gzd><originalData><overheidrg:meta><owmskern><dcterms:identifier>CVDR747564_2</dcterms:identifier><dcterms:title>Beleidsregels Kindtegoed en armoederegelingen Sleutelpas gemeente Leiden 2026</dcterms:title></owmskern></overheidrg:meta></originalData></gzd></recordData></record></records></searchRetrieveResponse>`;

describe("SRU-antwoorden", () => {
  it("leest records en velden met en zonder prefix", () => {
    expect(records(BWB)).toHaveLength(1);
    expect(velden(records(REPO)[0], "preferredUrl")).toEqual(["https://zoek.officielebekendmakingen.nl/stcrt-2025-39783.html"]);
  });
  it("maakt meldingen met link en unieke sleutel", () => {
    const w = wetMeldingen(BWB, { id: "BWBR0015703", naam: "Participatiewet", raakt: ["pw."] });
    expect(w[0].sleutel).toBe("bwb:http://wetten.overheid.nl/id/BWBR0015703/2026-07-01/0");
    expect(w[0].tekst).toContain("https://wetten.overheid.nl/BWBR0015703/2026-07-01");
    const p = publicatieMeldingen(REPO, { naam: "Regeling huurtoeslaggrenzen", query: "", raakt: ["ht."] });
    expect(p[0].sleutel).toBe("pub:stcrt-2025-39783");
    const l = lokaalMeldingen(CVDR, { gemeente: "Leiden", naam: "Leiden", titelwoorden: "", raakt: ["leiden."] });
    expect(l[0].tekst).toContain("https://lokaleregelgeving.overheid.nl/CVDR747564");
  });
});

describe("controles zonder externe bron", () => {
  const p = (id: string, van: string, tot: string | null, status: RuweParameter["status"] = "geverifieerd"): RuweParameter => ({
    id,
    omschrijving: id,
    eenheid: "euro_per_maand",
    status,
    geldig_van: van,
    geldig_tot: tot,
  });
  it("meldt ruim vóór geldig_tot als er geen opvolger is", () => {
    const params = [p("a", "2026-01-01", "2026-12-31"), p("b", "2026-01-01", "2026-12-31"), p("b", "2027-01-01", null)];
    const m = aflopendeRegels(params, "2026-11-20", 45);
    expect(m).toHaveLength(1);
    expect(m[0].tekst).toContain("`a`");
    expect(m[0].tekst).not.toContain("`b`");
    expect(aflopendeRegels(params, "2026-10-01", 45)).toHaveLength(0);
  });
  it("halfjaarlijkse lijst alleen in de eerste week van juni en december", () => {
    const params = [p("x", "2026-01-01", null, "onbevestigd")];
    expect(halfjaarlijks(params, "2026-12-03", [6, 12])[0].sleutel).toBe("halfjaar:2026-12");
    expect(halfjaarlijks(params, "2026-12-10", [6, 12])).toHaveLength(0);
    expect(halfjaarlijks(params, "2026-11-03", [6, 12])).toHaveLength(0);
  });
});

describe("de bewaking faalt niet stil", () => {
  it("een antwoord zonder aantal resultaten is een fout, geen 'niets nieuws'", () => {
    expect(antwoordFouten("Participatiewet", BWB)).toEqual([]);
    expect(antwoordFouten("Participatiewet", "<html>Onderhoud</html>")[0]).toContain("geen aantal resultaten");
  });
  it("meer dan 50 resultaten is een fout", () => {
    expect(antwoordFouten("X", BWB.replace("<numberOfRecords>1<", "<numberOfRecords>73<"))[0]).toContain("73 resultaten");
  });
  it("zoekt vanaf de laatste geslaagde run, minstens 8 en hoogstens 90 dagen terug", () => {
    expect(zoekVanaf("2026-11-30")).toBe("2026-11-22");
    expect(zoekVanaf("2026-11-30", "2026-11-23T06:12:00Z")).toBe("2026-11-22");
    expect(zoekVanaf("2026-11-30", "2026-11-09T06:12:00Z")).toBe("2026-11-08");
    expect(zoekVanaf("2026-11-30", "2026-01-01T06:12:00Z")).toBe("2026-09-01");
  });
  it("elke groep bedragen in regels/ heeft een bron in de bewaking", () => {
    const cfg = parse(readFileSync(new URL("../../../regels/bewaking.yaml", import.meta.url), "utf8")) as { wetten: { raakt: string[] }[]; publicaties: { raakt: string[] }[]; lokaal: { raakt: string[] }[] };
    const bewaakt = new Set([...cfg.wetten, ...cfg.publicaties, ...cfg.lokaal].flatMap((b) => b.raakt));
    const groepen = new Set(ruweParameters.map((p) => `${p.id.split(".")[0]}.`));
    expect([...groepen].filter((g) => !bewaakt.has(g))).toEqual([]);
  });
});

