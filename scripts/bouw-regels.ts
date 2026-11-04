/**
 * Leest alle regelbestanden (regels/**\/*.yaml), controleert ze en schrijft
 * packages/engine/src/generated/regels.json. De build faalt bij fouten.
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";
import { RegelBestand } from "../regels/schema.ts";

const wortel = new URL("..", import.meta.url).pathname;
const regelMap = join(wortel, "regels");
const uitvoer = join(wortel, "packages/engine/src/generated/regels.json");

function zoekYaml(map: string): string[] {
  return readdirSync(map).flatMap((naam) => {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) return zoekYaml(pad);
    return naam.endsWith(".yaml") ? [pad] : [];
  });
}

const fouten: string[] = [];
const items: Record<string, unknown>[] = [];

for (const pad of zoekYaml(regelMap).sort()) {
  const naam = relative(wortel, pad);
  const res = RegelBestand.safeParse(parse(readFileSync(pad, "utf8")));
  if (!res.success) {
    for (const issue of res.error.issues) fouten.push(`${naam}: ${issue.path.join(".")} ${issue.message}`);
    continue;
  }
  const b = res.data;
  if (b.geldig_tot && b.geldig_tot < b.geldig_van) fouten.push(`${naam}: geldig_tot ligt voor geldig_van`);
  for (const p of b.parameters) {
    items.push({ ...p, geldig_van: b.geldig_van, geldig_tot: b.geldig_tot, bestand: naam });
  }
}

// Controle: geen overlappende perioden voor dezelfde parameter.
const perId = new Map<string, Record<string, any>[]>();
for (const it of items) {
  const lijst = perId.get(it.id as string) ?? [];
  lijst.push(it);
  perId.set(it.id as string, lijst);
}
for (const [id, lijst] of perId) {
  lijst.sort((a, b) => (a.geldig_van < b.geldig_van ? -1 : 1));
  for (let i = 1; i < lijst.length; i++) {
    const vorige = lijst[i - 1];
    const huidige = lijst[i];
    if (vorige.geldig_van === huidige.geldig_van) {
      fouten.push(`${id}: twee keer gedefinieerd vanaf ${huidige.geldig_van} (${vorige.bestand}, ${huidige.bestand})`);
    } else if (vorige.geldig_tot && vorige.geldig_tot >= huidige.geldig_van) {
      fouten.push(`${id}: periode in ${vorige.bestand} overlapt met ${huidige.bestand}`);
    }
  }
}

if (fouten.length) {
  console.error("Regeldata bevat fouten:\n- " + fouten.join("\n- "));
  process.exit(1);
}

mkdirSync(join(wortel, "packages/engine/src/generated"), { recursive: true });
writeFileSync(uitvoer, JSON.stringify({ parameters: items }, null, 1));
console.log(`Regeldata in orde: ${items.length} parameters uit ${perId.size} ids.`);
