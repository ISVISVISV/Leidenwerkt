/**
 * Leest alle regelbestanden (regels/**\/*.yaml), controleert ze en schrijft
 * packages/engine/src/generated/regels.json. De build faalt bij fouten.
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { parse } from "yaml";
import { RegelBestand } from "../regels/schema.ts";

const wortel = new URL("..", import.meta.url).pathname;
// REGELS_MAP en REGELS_UITVOER zijn er alleen voor tests van deze controles.
const regelMap = process.env.REGELS_MAP ?? join(wortel, "regels");
const uitvoer = process.env.REGELS_UITVOER ?? join(wortel, "packages/engine/src/generated/regels.json");

function zoekYaml(map: string): string[] {
  return readdirSync(map).flatMap((naam) => {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) return zoekYaml(pad);
    // bewaking.yaml beschrijft wat er bewaakt wordt (scripts/bewaking.ts), geen parameters.
    return naam.endsWith(".yaml") && naam !== "bewaking.yaml" ? [pad] : [];
  });
}

/** Alleen officiële bronnen tellen (zie docs/REKENREGELS.md). Subdomeinen zijn toegestaan. */
const TOEGESTANE_DOMEINEN = [
  "wetten.overheid.nl",
  "officielebekendmakingen.nl",
  "lokaleregelgeving.overheid.nl",
  "repository.overheid.nl",
  "rijksoverheid.nl",
  "belastingdienst.nl",
  "svb.nl",
  "leiden.nl",
];

function officieelDomein(url: string): boolean {
  const host = new URL(url).hostname.toLowerCase();
  return TOEGESTANE_DOMEINEN.some((d) => host === d || host.endsWith(`.${d}`));
}

/** Grens voor een 'onverklaarde sprong' ten opzichte van de vorige periode. */
const SPRONG = 0.1;

function getalVan(w: any): number | null {
  if (!w) return null;
  const v = w.soort === "bedrag" ? w.bedrag : w.soort === "percentage" ? w.breuk : w.soort === "aantal" ? w.aantal : null;
  return v === null ? null : Number(v);
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
    if (p.bron && !officieelDomein(p.bron.url)) fouten.push(`${naam}: ${p.id}: bron ${new URL(p.bron.url).hostname} is geen officieel domein`);
    if (p.status === "geverifieerd" && !p.bron) fouten.push(`${naam}: ${p.id}: 'geverifieerd' mag alleen met een bron`);
    if (p.citaat && !p.bron) fouten.push(`${naam}: ${p.id}: een citaat hoort bij een bron`);
    if (p.citaat?.url && !officieelDomein(p.citaat.url)) fouten.push(`${naam}: ${p.id}: citaat-url ${new URL(p.citaat.url).hostname} is geen officieel domein`);
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
    const a = getalVan(vorige.waarde);
    const b = getalVan(huidige.waarde);
    if (a !== null && b !== null && a !== 0 && Math.abs(b - a) / Math.abs(a) > SPRONG && !huidige.notitie) {
      fouten.push(
        `${id}: ${huidige.bestand} wijkt ${Math.round((Math.abs(b - a) / Math.abs(a)) * 100)}% af van ${vorige.bestand} (${a} → ${b}); zet in 'notitie' waarom`,
      );
    }
  }
}

if (fouten.length) {
  console.error("Regeldata bevat fouten:\n- " + fouten.join("\n- "));
  process.exit(1);
}

mkdirSync(dirname(uitvoer), { recursive: true });
writeFileSync(uitvoer, JSON.stringify({ parameters: items }, null, 1));
console.log(`Regeldata in orde: ${items.length} parameters uit ${perId.size} ids.`);
