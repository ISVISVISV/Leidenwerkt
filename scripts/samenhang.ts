/**
 * Controleert of de repository bij elkaar past. Draait in `npm test`.
 * - Elke link naar een bestand in een .md-bestand wijst naar een bestand dat bestaat.
 * - Overal hetzelfde versienummer: package.json, publiccode.yml, CHANGELOG.md en README.md.
 * - Geen oude namen meer (van mappen, pakketten en documenten die anders heten of zijn opgegaan in een ander document).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const wortel = new URL("..", import.meta.url).pathname;
const lees = (p: string) => readFileSync(join(wortel, p), "utf8");
const bestanden = execFileSync("git", ["ls-files"], { cwd: wortel, encoding: "utf8" })
  .split("\n")
  .filter((f) => f && existsSync(join(wortel, f)));
const fouten: string[] = [];

// 1. Links naar bestanden.
for (const f of bestanden.filter((f) => f.endsWith(".md"))) {
  const tekst = lees(f);
  for (const [, doel] of tekst.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^[a-z]+:/i.test(doel) || doel.startsWith("#")) continue;
    const pad = decodeURI(doel.split("#")[0]);
    if (!existsSync(join(wortel, dirname(f), pad))) fouten.push(`${f}: de link naar ${doel} werkt niet.`);
  }
}

// 2. Het versienummer.
const versie = (p: string) => JSON.parse(lees(p)).version as string;
const leidenwerkt = versie("package.json");
for (const p of ["leidenwerkt/package.json", "packages/rekenkern/package.json", "packages/ui/package.json"])
  if (versie(p) !== leidenwerkt) fouten.push(`${p} heeft versie ${versie(p)}, package.json heeft ${leidenwerkt}.`);
const publiccode = lees("publiccode.yml").match(/^softwareVersion:\s*(\S+)/m)?.[1];
if (publiccode !== leidenwerkt) fouten.push(`publiccode.yml heeft versie ${publiccode}, package.json heeft ${leidenwerkt}.`);
const changelog = lees("CHANGELOG.md").match(/^## (\d+\.\d+\.\d+)/m)?.[1];
if (changelog !== leidenwerkt) fouten.push(`De laatste versie in CHANGELOG.md is ${changelog}, package.json heeft ${leidenwerkt}.`);
const readme = lees("README.md").match(/Leidenwerkt versie (\S+), Leidengeldwijzer versie (\S+)/);
const leidengeldwijzer = versie("leidengeldwijzer/package.json");
if (readme?.[1] !== leidenwerkt || readme?.[2] !== leidengeldwijzer)
  fouten.push(`README.md noemt Leidenwerkt ${readme?.[1]} en Leidengeldwijzer ${readme?.[2]}. Dat moet ${leidenwerkt} en ${leidengeldwijzer} zijn.`);

// 3. Oude namen. CHANGELOG.md mag ze noemen: dat is geschiedenis.
const OUD: [RegExp, string][] = [
  [/@leidenwerkt\//, "@rekenhulp/…"],
  [/packages\/engine/, "packages/rekenkern"],
  [/(^|[\s`"'(])app\/src/, "leidenwerkt/src"],
  [/-w (app|regelingen)\b/, "-w leidenwerkt of -w leidengeldwijzer"],
  [/(dev|build|audit):regelingen\b/, "…:leidengeldwijzer"],
  [/e2e\/(rekenhulp|regelingen)\.spec/, "e2e/leidenwerkt.spec of e2e/leidengeldwijzer.spec"],
  [/REKENREGELS\.md|VOORWAARDEN\.md|OPEN_VRAGEN|docs\/recht\//, "docs/RECHT.md"],
  [/RISICOS\.md|SNAPSHOTS\.md|GEBRUIKERSTEST\.md/, "docs/CONTROLE.md"],
  [/TEKSTEN-A2/, "docs/ONDERHOUD.md, hoofdstuk 6"],
  [/docs\/adr\b/, "docs/BESLUITEN.md"],
];
const tekstbestand = /\.(md|ts|tsx|js|mjs|json|ya?ml|html|css|py|txt)$/;
for (const f of bestanden.filter((f) => tekstbestand.test(f) && f !== "CHANGELOG.md" && f !== "scripts/samenhang.ts")) {
  lees(f)
    .split("\n")
    .forEach((regel, i) => {
      for (const [oud, nieuw] of OUD) if (oud.test(regel)) fouten.push(`${f}:${i + 1}: oude naam (${oud.source}). Nu: ${nieuw}.`);
    });
}

if (fouten.length) {
  console.error(fouten.join("\n"));
  process.exit(1);
}
console.log(`Samenhang in orde: ${bestanden.length} bestanden, versie ${leidenwerkt} (Leidengeldwijzer ${leidengeldwijzer}).`);
