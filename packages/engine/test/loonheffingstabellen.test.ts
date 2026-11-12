/**
 * Onafhankelijke toets van de belastingberekening aan de officiële loonheffingstabellen 2026
 * van de Belastingdienst (uitgave januari 2026), kolom "Jonger dan de AOW-leeftijd, met
 * loonheffingskorting". Geraadpleegd op 12 november 2026.
 *
 * - Witte maandtabel (loon): de app rekent met dezelfde schijven, algemene heffingskorting en
 *   arbeidskorting. Bron: https://download.belastingdienst.nl/belastingdienst/dl/rekenhulpen/loonheffing/2026/v01/pdf/wit_mnd_nl_std_20260101.pdf
 * - Groene maandtabel (uitkeringen, zonder arbeidskorting): hiermee rekent de app de bruto
 *   bijstand terug voor het toetsingsinkomen (open vraag V8).
 *   Bron: https://download.belastingdienst.nl/belastingdienst/dl/rekenhulpen/loonheffing/2026/v01/pdf/groen_mnd_nl_std_20260101.pdf
 *
 * De tabellen ronden per tabelloon af; de app rekent exact. Toegestaan verschil: € 0,25 per maand.
 */
import { describe, expect, it } from "vitest";
import { Lezer, standaardRegels } from "../src/regels.ts";
import { D } from "../src/geld.ts";
import { nettoLoon, progressief, stuksgewijs, brutoUitNetto } from "../src/modules/belasting.ts";

const l = () => new Lezer(standaardRegels, "2026-09-01");
const MARGE = 0.25;

describe("Witte maandtabel loonheffing 2026 (loon)", () => {
  // [tabelloon per maand, inhouding met loonheffingskorting]
  const wit: [number, number][] = [
    [954, 2.0],
    [1336.5, 29.92],
    [1503, 37.75],
    [1836, 53.58],
    [2002.5, 61.42],
    [2335.5, 130.08],
    [2619, 234.92],
    [3001.5, 388.58],
    [3501, 594.08],
  ];
  it.each(wit)("tabelloon € %d: inhouding gelijk aan de tabel", (loon, tabel) => {
    const app = nettoLoon(l(), D(loon).times(12)).heffing.div(12);
    expect(Math.abs(Number(app.minus(tabel)))).toBeLessThanOrEqual(MARGE);
  });
});

describe("Groene maandtabel loonheffing 2026 (uitkeringen): bruto bijstand terugrekenen (V8)", () => {
  const groen: [number, number][] = [
    [729, 1.0],
    [1003.5, 99.17],
    [1228.5, 179.58],
    [1395, 239.08],
    [1503, 277.67],
    [1836, 396.75],
    [2002.5, 456.25],
    [2502, 636.33],
  ];
  it.each(groen)("tabelloon € %d: inhouding gelijk aan de tabel", (loon, tabel) => {
    const jaar = D(loon).times(12);
    const h = progressief(l().schijven("ib.box1.schijven"), jaar).minus(stuksgewijs(l().schijven("ib.ahk"), jaar));
    const app = (h.lt(0) ? D(0) : h).div(12);
    expect(Math.abs(Number(app.minus(tabel)))).toBeLessThanOrEqual(MARGE);
  });
  it.each(groen)("netto bij tabelloon € %d: de app rekent het bruto bedrag terug", (loon, tabel) => {
    const netto = D(loon).minus(tabel).times(12);
    const bruto = brutoUitNetto(l(), netto).div(12);
    expect(Math.abs(Number(bruto.minus(loon)))).toBeLessThanOrEqual(MARGE);
  });
});
