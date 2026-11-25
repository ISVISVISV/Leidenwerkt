import { describe, expect, it } from "vitest";
import { versieVoorScherm } from "../src/Bron.tsx";

describe("versie van een bron op het scherm", () => {
  it("een wet: de versie blijft", () => {
    expect(versieVoorScherm("geldend vanaf 1 juli 2026")).toBe("geldend vanaf 1 juli 2026");
  });
  it("een webpagina: de datum van raadplegen staat niet op het scherm", () => {
    expect(versieVoorScherm("geraadpleegd op 21 november 2026")).toBe("");
    expect(versieVoorScherm("geraadpleegd op 21 november 2026. Alle 69 rijen zijn met de regeldata vergeleken.")).toBe("");
  });
  it("een wet met een datum van raadplegen erachter: alleen de versie", () => {
    expect(versieVoorScherm("geldend vanaf 1 januari 2026, geraadpleegd op 11 november 2026")).toBe("geldend vanaf 1 januari 2026");
  });
  it("andere vermeldingen blijven", () => {
    expect(versieVoorScherm("Gemeenteblad 2025, 429670")).toBe("Gemeenteblad 2025, 429670");
  });
});
