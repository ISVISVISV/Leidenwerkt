import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

/**
 * Bronnencontrole: elke geverifieerde parameter heeft een letterlijk citaat uit de bron, en de waarde
 * staat in dat citaat. Zo kan een lezer elk bedrag terugvinden zonder de bron zelf te openen, en valt een
 * tikfout tussen bron en regeldata meteen op.
 */
const root = fileURLToPath(new URL("../../../", import.meta.url));
const bestanden = globSync("regels/**/*.yaml", { cwd: root }).filter((b) => !b.endsWith("bewaking.yaml"));

const TELWOORDEN: Record<string, string> = { "6": "zes", "12": "twaalf" };

/** Waarden die niet letterlijk in de bron staan maar eruit volgen. De notitie moet de afleiding laten zien. */
const AFGELEID: Record<string, string> = {
  "kgb.alleenstaande_ouderkop": "5.996",
};

function schrijfwijzen(waarde: string): string[] {
  const n = Number(waarde);
  const v = new Set<string>([waarde, waarde.replace(".", ",")]);
  for (const d of [0, 1, 2, 3, 4]) {
    const nl = n.toLocaleString("nl-NL", { minimumFractionDigits: d, maximumFractionDigits: d });
    v.add(nl);
    v.add(nl.replace(/\./g, ""));
  }
  if (TELWOORDEN[waarde]) v.add(TELWOORDEN[waarde]);
  return [...v];
}

type Param = { id: string; status: string; waarde?: Record<string, string>; citaat?: { tekst: string }; notitie?: string };
const parameters: { bestand: string; p: Param }[] = bestanden.flatMap((b) =>
  ((parse(readFileSync(root + b, "utf8"))?.parameters ?? []) as Param[]).map((p) => ({ bestand: b, p })),
);

describe("bronnencontrole van de regeldata", () => {
  it("leest alle parameters", () => {
    expect(parameters.length).toBeGreaterThan(100);
  });

  it("elke geverifieerde parameter heeft een letterlijk citaat", () => {
    const zonder = parameters.filter(({ p }) => p.status === "geverifieerd" && !p.citaat?.tekst).map(({ bestand, p }) => `${bestand}: ${p.id}`);
    expect(zonder).toEqual([]);
  });

  it("de waarde staat in het citaat (of de notitie laat zien hoe ze eruit volgt)", () => {
    const mis: string[] = [];
    for (const { bestand, p } of parameters) {
      const w = p.waarde;
      const tekst = (p.citaat?.tekst ?? "").replace(/ /g, " ");
      if (!w || !tekst) continue;
      let kandidaten: string[];
      if (w.soort === "bedrag") kandidaten = schrijfwijzen(w.bedrag);
      else if (w.soort === "percentage") kandidaten = schrijfwijzen(String(Math.round(Number(w.breuk) * 1e6) / 1e4));
      else if (w.soort === "aantal") kandidaten = schrijfwijzen(w.aantal);
      else continue; // tabellen en schijven: rij voor rij vergeleken, zie het citaat
      if (kandidaten.some((k) => tekst.includes(k))) continue;
      const afgeleid = AFGELEID[p.id];
      if (afgeleid && tekst.includes(afgeleid) && p.notitie?.includes(afgeleid)) continue;
      mis.push(`${bestand}: ${p.id} = ${JSON.stringify(w)}`);
    }
    expect(mis).toEqual([]);
  });
});
