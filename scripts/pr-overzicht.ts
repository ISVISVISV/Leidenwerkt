/**
 * Overzicht bij een pull request: welke parameters zijn gewijzigd en wat
 * doet dat met de uitkomsten van de proefpersonen?
 *
 * Gebruik: npx tsx scripts/pr-overzicht.ts --basis <map met de basisversie van de repository>
 *
 * De uitkomsten worden twee keer berekend met de engine uit deze versie:
 * met de regeldata van de basis en met de regeldata van deze versie. Zo is
 * het effect van alleen de datawijziging zichtbaar. Wijzigingen in de engine
 * zelf staan apart vermeld; die zie je in de snapshots (docs/SNAPSHOTS.md).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";
import { RegelSet, type RuweParameter } from "../packages/engine/src/index.ts";
import { draai, laadProefpersonen, samenvatting } from "./proefpersonen.ts";

const wortel = new URL("..", import.meta.url).pathname;
const basisArg = process.argv.indexOf("--basis");
if (basisArg < 0) throw new Error("Gebruik: --basis <map>");
const basis = process.argv[basisArg + 1];

type Param = RuweParameter & { bestand: string };

function leesRegels(map: string): Param[] {
  const uit: Param[] = [];
  const zoek = (m: string): string[] =>
    readdirSync(m).flatMap((n) => {
      const p = join(m, n);
      return statSync(p).isDirectory() ? zoek(p) : n.endsWith(".yaml") && n !== "bewaking.yaml" ? [p] : [];
    });
  if (!existsSync(map)) return uit;
  for (const pad of zoek(map)) {
    const b = parse(readFileSync(pad, "utf8"));
    for (const p of b.parameters ?? []) {
      uit.push({ ...p, geldig_van: b.geldig_van, geldig_tot: b.geldig_tot, bestand: relative(map, pad) });
    }
  }
  return uit;
}

const waardeTekst = (p?: Param) => {
  if (!p) return "–";
  const w = p.waarde;
  if (!w) return `(${p.status})`;
  const v = w.soort === "bedrag" ? `€ ${w.bedrag}` : w.soort === "percentage" ? `${Number(w.breuk) * 100}%` : w.soort === "aantal" ? String(w.aantal) : "tabel";
  return `${v} (${p.status})`;
};

const oud = leesRegels(join(basis, "regels"));
const nieuw = leesRegels(join(wortel, "regels"));
const sleutel = (p: Param) => `${p.id}@${p.geldig_van}`;
const oudMap = new Map(oud.map((p) => [sleutel(p), p]));
const nieuwMap = new Map(nieuw.map((p) => [sleutel(p), p]));

const rijen: string[] = [];
for (const k of [...new Set([...oudMap.keys(), ...nieuwMap.keys()])].sort()) {
  const a = oudMap.get(k);
  const b = nieuwMap.get(k);
  const zelfde = a && b && JSON.stringify([a.waarde, a.status, a.bron?.url, a.geldig_tot]) === JSON.stringify([b.waarde, b.status, b.bron?.url, b.geldig_tot]);
  if (zelfde) continue;
  const p = (b ?? a)!;
  const wat = !a ? "nieuw" : !b ? "verwijderd" : "gewijzigd";
  rijen.push(`| \`${p.id}\` | ${p.geldig_van} | ${wat} | ${waardeTekst(a)} | ${waardeTekst(b)} | ${b?.bron ? `[bron](${b.bron.url})` : "–"} |`);
}

const uit: string[] = ["## Overzicht van deze wijziging", ""];
uit.push("### Gewijzigde parameters", "");
if (rijen.length) {
  uit.push("| Parameter | Geldig vanaf | Wat | Was | Wordt | Bron |", "| --- | --- | --- | --- | --- | --- |", ...rijen);
} else {
  uit.push("Geen parameters gewijzigd.");
}

// Effect op de proefpersonen: zelfde engine, oude tegenover nieuwe regeldata.
const regelsOud = new RegelSet(oud);
const regelsNieuw = new RegelSet(nieuw);
const effect: string[] = [];
const buitenTolerantie: string[] = [];
for (const p of laadProefpersonen()) {
  const a = samenvatting(draai(p, regelsOud));
  const nieuwUit = draai(p, regelsNieuw);
  const b = samenvatting(nieuwUit);
  for (const v of nieuwUit.vergelijkingen) {
    if (v.binnen === false) buitenTolerantie.push(`- ${p.naam} (\`${p.bestand}\`): ${v.label} ${v.situatie === "nu" ? "nu" : "met werk"} verwacht ${v.verwacht}, berekend ${v.berekend}`);
  }
  const verschillen: string[] = [];
  for (const sit of ["nu", "met_werk"] as const) {
    for (const id of new Set([...Object.keys(a[sit]), ...Object.keys(b[sit])])) {
      const x = a[sit][id] ?? null;
      const y = b[sit][id] ?? null;
      if (x !== y) verschillen.push(`${id} ${sit === "nu" ? "nu" : "met werk"}: ${x ?? "–"} → ${y ?? "–"}`);
    }
  }
  if (a.verschil !== b.verschil || verschillen.length) {
    effect.push(`| ${p.naam} (\`${p.bestand}\`) | ${a.verschil} | ${b.verschil} | ${verschillen.join("; ") || "–"} |`);
  }
}
uit.push("", "### Effect op de proefpersonen (alleen door de regeldata)", "");
if (effect.length) {
  uit.push("| Proefpersoon | Verschil per maand was | Wordt | Gewijzigde posten |", "| --- | ---: | ---: | --- |", ...effect);
} else {
  uit.push("Geen effect op de proefpersonen.");
}
if (buitenTolerantie.length) {
  uit.push("", "### Buiten de tolerantie van de officiële waarde", "", ...buitenTolerantie);
}

let engine: string[] = [];
try {
  engine = execFileSync("git", ["diff", "--name-only", `${process.env.BASIS_SHA ?? "origin/main"}...HEAD`, "--", "packages/engine/src", "scripts", "regels/schema.ts"], {
    cwd: wortel,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
} catch {
  engine = [];
}
uit.push("", "### Gewijzigde code die uitkomsten kan beïnvloeden", "");
uit.push(engine.length ? engine.map((f) => `- \`${f}\``).join("\n") + "\n\nControleer de snapshots en de verklaring in `docs/SNAPSHOTS.md`." : "Geen.");

console.log(uit.join("\n"));
