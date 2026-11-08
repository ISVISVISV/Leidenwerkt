/**
 * Bewaking van wet- en regelgeving (opdracht: wijzigingen opmerken, niet
 * alleen rond 1 januari en 1 juli). Draait wekelijks in
 * .github/workflows/bewaking.yml en opent per nieuwe vondst een issue.
 *
 *   npx tsx scripts/bewaking.ts                 zoekt de afgelopen 8 dagen en opent issues (gh nodig)
 *   npx tsx scripts/bewaking.ts --droog         toont wat er gemeld zou worden, zonder issues
 *   npx tsx scripts/bewaking.ts --sinds 2026-06-01 --datum 2026-12-02 --droog
 *
 * Wat er bewaakt wordt staat in regels/bewaking.yaml.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { ruweParameters, type RuweParameter } from "../packages/engine/src/index.ts";

export interface Melding {
  /** Unieke sleutel; staat als markering in het issue zodat er geen dubbele issues komen. */
  sleutel: string;
  titel: string;
  tekst: string;
}

interface Bewaking {
  wetten: { id: string; naam: string; raakt: string[] }[];
  publicaties: { naam: string; query: string; raakt: string[] }[];
  lokaal: { gemeente: string; naam: string; titelwoorden: string; raakt: string[] }[];
  waarschuw_dagen_voor_einde: number;
  halfjaarlijkse_controle_maanden: number[];
}

// ---------- XML (SRU) zonder externe bibliotheek ----------

/** Splitst een SRU-antwoord in records (SRU 1.2 en 2.0, met of zonder prefix). */
export function records(xml: string): string[] {
  return [...xml.matchAll(/<(?:\w+:)?record>([\s\S]*?)<\/(?:\w+:)?record>/g)].map((m) => m[1]);
}

/** Tekst van alle elementen met deze lokale naam. */
export function velden(xml: string, naam: string): string[] {
  return [...xml.matchAll(new RegExp(`<(?:[\\w-]+:)?${naam}(?:\\s[^>]*)?>([^<]*)</(?:[\\w-]+:)?${naam}>`, "g"))].map((m) =>
    m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim(),
  );
}

export function aantal(xml: string): number {
  return Number(velden(xml, "numberOfRecords")[0] ?? 0);
}

export function diagnose(xml: string): string | undefined {
  return velden(xml, "message")[0];
}

// ---------- Zoeken ----------

const BWB = "https://zoekservice.overheid.nl/sru/Search?operation=searchRetrieve&version=1.2&x-connection=BWB";
const CVDR = "https://zoekservice.overheid.nl/sru/Search?operation=searchRetrieve&version=1.2&x-connection=cvdr";
const REPO = "https://repository.overheid.nl/sru?";

async function haal(url: string): Promise<string> {
  const r = await fetch(url, { headers: { "User-Agent": "Leidenwerkt-bewaking (github.com/ISVISVISV/Leidenwerkt)" } });
  if (!r.ok) throw new Error(`${r.status} bij ${url}`);
  return r.text();
}

export function wetMeldingen(xml: string, wet: Bewaking["wetten"][number]): Melding[] {
  return records(xml).map((rec) => {
    const toestand = velden(rec, "toestand")[0] ?? "";
    const start = velden(rec, "geldigheidsperiode_startdatum")[0] ?? "onbekend";
    const link = `https://wetten.overheid.nl/${wet.id}/${start}`;
    return {
      sleutel: `bwb:${toestand || `${wet.id}@${start}`}`,
      titel: `[bewaking] ${wet.naam}: nieuwe versie geldig vanaf ${start}`,
      tekst: `Er is een nieuwe of gewijzigde versie van de **${wet.naam}** (${wet.id}), geldig vanaf ${start}.\n\n- Tekst: ${link}\n- Raakt parameters: ${wet.raakt.map((r) => `\`${r}*\``).join(", ")}\n\nLees de gewijzigde artikelen na en kijk of een bedrag (regeldata) of een regel (engine) verandert.`,
    };
  });
}

export function publicatieMeldingen(xml: string, p: Bewaking["publicaties"][number]): Melding[] {
  return records(xml).map((rec) => {
    const id = velden(rec, "identifier")[0];
    const titel = velden(rec, "title")[0] ?? id;
    const url = velden(rec, "preferredUrl")[0] ?? `https://zoek.officielebekendmakingen.nl/${id}.html`;
    return {
      sleutel: `pub:${id}`,
      titel: `[bewaking] ${p.naam}: ${id}`,
      tekst: `Nieuwe publicatie bij **${p.naam}**:\n\n> ${titel}\n\n- Link: ${url}\n- Raakt parameters: ${p.raakt.map((r) => `\`${r}*\``).join(", ")}`,
    };
  });
}

export function lokaalMeldingen(xml: string, l: Bewaking["lokaal"][number]): Melding[] {
  return records(xml).map((rec) => {
    const id = velden(rec, "identifier")[0];
    const titel = velden(rec, "title")[0] ?? id;
    const werk = id.split("_")[0];
    return {
      sleutel: `cvdr:${id}`,
      titel: `[bewaking] ${l.gemeente}: ${titel}`,
      tekst: `Nieuwe of gewijzigde regeling van de gemeente ${l.gemeente}:\n\n> ${titel}\n\n- Link: https://lokaleregelgeving.overheid.nl/${werk}\n- Raakt parameters: ${l.raakt.map((r) => `\`${r}*\``).join(", ")}`,
    };
  });
}

// ---------- Controles zonder externe bron ----------

const plusDagen = (d: string, n: number) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

/** Bestanden waarvan de geldigheid binnenkort eindigt zonder opvolger. */
export function aflopendeRegels(params: RuweParameter[], datum: string, dagen: number): Melding[] {
  const grens = plusDagen(datum, dagen);
  const perId = new Map<string, RuweParameter[]>();
  for (const p of params) perId.set(p.id, [...(perId.get(p.id) ?? []), p]);
  const perEinde = new Map<string, string[]>();
  for (const [id, lijst] of perId) {
    const laatste = [...lijst].sort((a, b) => (a.geldig_van < b.geldig_van ? -1 : 1)).at(-1)!;
    if (laatste.geldig_tot && laatste.geldig_tot <= grens) {
      perEinde.set(laatste.geldig_tot, [...(perEinde.get(laatste.geldig_tot) ?? []), id]);
    }
  }
  return [...perEinde].map(([einde, ids]) => ({
    sleutel: `einde:${einde}`,
    titel: `[bewaking] Regeldata loopt af op ${einde} zonder opvolger (${ids.length} parameters)`,
    tekst: `Deze parameters gelden tot en met ${einde} en hebben nog geen nieuwe periode. Na die datum rekent de app terug met oude regels en toont een waarschuwing.\n\n${ids
      .sort()
      .map((i) => `- \`${i}\``)
      .join("\n")}\n\nZie docs/ONDERHOUD.md voor het bijwerken.`,
  }));
}

/** Begin juni en begin december: alle parameters die ontbrekend of onbevestigd zijn. */
export function halfjaarlijks(params: RuweParameter[], datum: string, maanden: number[]): Melding[] {
  const maand = Number(datum.slice(5, 7));
  if (!maanden.includes(maand) || Number(datum.slice(8, 10)) > 7) return [];
  const open = params.filter((p) => p.status !== "geverifieerd" && (!p.geldig_tot || p.geldig_tot >= datum));
  return [
    {
      sleutel: `halfjaar:${datum.slice(0, 7)}`,
      titel: `[bewaking] Halfjaarlijkse controle ${datum.slice(0, 7)}: ${open.length} parameters ontbrekend of onbevestigd`,
      tekst: open.length
        ? `${open
            .sort((a, b) => (a.id < b.id ? -1 : 1))
            .map((p) => `- \`${p.id}\` (${p.geldig_van}): ${p.status}${p.notitie ? ` — ${p.notitie}` : ""}`)
            .join("\n")}\n\nZoek de officiële bron en werk de status bij (docs/ONDERHOUD.md).`
        : "Alle geldende parameters zijn geverifieerd.",
    },
  ];
}

// ---------- Issues ----------

const markering = (m: Melding) => `<!-- bewaking:${m.sleutel} -->`;

function bestaandeSleutels(): Set<string> {
  execFileSync("gh", ["label", "create", "bewaking", "--color", "B3101C", "--description", "Automatische melding van een (mogelijke) wijziging", "--force"]);
  const uit = execFileSync("gh", ["issue", "list", "--label", "bewaking", "--state", "all", "--limit", "1000", "--json", "body"], { encoding: "utf8" });
  const set = new Set<string>();
  for (const i of JSON.parse(uit) as { body: string }[]) for (const m of i.body.matchAll(/<!-- bewaking:(.*?) -->/g)) set.add(m[1]);
  return set;
}

async function main() {
  const arg = (n: string) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const droog = process.argv.includes("--droog");
  const datum = arg("--datum") ?? new Date().toISOString().slice(0, 10);
  const sinds = arg("--sinds") ?? plusDagen(datum, -8);
  const cfg = parse(readFileSync(new URL("../regels/bewaking.yaml", import.meta.url), "utf8")) as Bewaking;

  const meldingen: Melding[] = [];
  const fouten: string[] = [];
  const zoek = async (wat: string, url: string, maak: (xml: string) => Melding[]) => {
    try {
      const xml = await haal(url);
      const d = diagnose(xml);
      if (d) fouten.push(`${wat}: ${d}`);
      meldingen.push(...maak(xml));
    } catch (e) {
      fouten.push(`${wat}: ${(e as Error).message}`);
    }
  };
  for (const w of cfg.wetten) {
    await zoek(w.naam, `${BWB}&maximumRecords=50&query=${encodeURIComponent(`dcterms.identifier=${w.id} and dcterms.modified>=${sinds}`)}`, (x) => wetMeldingen(x, w));
  }
  for (const p of cfg.publicaties) {
    await zoek(p.naam, `${REPO}maximumRecords=50&query=${encodeURIComponent(`(${p.query}) and dt.modified>=${sinds}`)}`, (x) => publicatieMeldingen(x, p));
  }
  for (const l of cfg.lokaal) {
    const q = `dcterms.creator="${l.gemeente}" and dcterms.modified>=${sinds} and dcterms.title any "${l.titelwoorden}"`;
    await zoek(l.naam, `${CVDR}&maximumRecords=50&query=${encodeURIComponent(q)}`, (x) => lokaalMeldingen(x, l));
  }
  meldingen.push(...aflopendeRegels(ruweParameters, datum, cfg.waarschuw_dagen_voor_einde));
  meldingen.push(...halfjaarlijks(ruweParameters, datum, cfg.halfjaarlijkse_controle_maanden));
  if (fouten.length) {
    meldingen.push({
      sleutel: `fout:${datum}`,
      titel: `[bewaking] Zoekdienst gaf een fout (${datum})`,
      tekst: `De wekelijkse bewaking kon niet alles nalopen. Controleer deze bronnen met de hand, of pas regels/bewaking.yaml aan als een zoekdienst is veranderd:\n\n${fouten.map((f) => `- ${f}`).join("\n")}`,
    });
  }

  const uniek = [...new Map(meldingen.map((m) => [m.sleutel, m])).values()];
  console.log(`Bewaking ${datum} (wijzigingen sinds ${sinds}): ${uniek.length} meldingen${fouten.length ? `, ${fouten.length} fouten` : ""}.`);
  if (droog) {
    for (const m of uniek) console.log(`\n# ${m.titel}\n${m.tekst}`);
    return;
  }
  const bestaand = bestaandeSleutels();
  for (const m of uniek) {
    if (bestaand.has(m.sleutel)) continue;
    execFileSync("gh", ["issue", "create", "--title", m.titel, "--label", "bewaking", "--body", `${m.tekst}\n\n${markering(m)}`]);
    console.log(`Issue geopend: ${m.titel}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
