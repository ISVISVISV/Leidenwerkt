/**
 * Gedeelde onderdelen van de audits van Leidenwerkt (scripts/audit.ts) en Leidengeldwijzer
 * (scripts/audit-leidengeldwijzer.ts): de browser, de controles die voor elke pagina gelden en het rapport.
 *
 * Werkwijze van beide audits: de pagina wordt met Vite op de server gemaakt (zoals in de browser) en met
 * Playwright in een echte browser geopend, op telefoonbreedte en als afdruk op A4. Geen AI, geen internet.
 */
import { createServer, type ViteDevServer } from "vite";
import { chromium, type Browser, type Page } from "@playwright/test";

/** `--naam 12` uit de opdrachtregel als getal. */
export const optie = (naam: string): number | undefined => {
  const i = process.argv.indexOf(`--${naam}`);
  return i > 0 ? Number(process.argv[i + 1]) : undefined;
};

/** `--datum JJJJ-MM-DD` uit de opdrachtregel, anders de vaste rekendatum. */
export const rekendatumUit = (standaard: string): string => {
  const i = process.argv.indexOf("--datum");
  return i > 0 ? process.argv[i + 1] : standaard;
};

/** Vite op de server voor één app (map onder de wortel), om modules uit de app te laden en te renderen. */
export function viteVoor(app: string): Promise<ViteDevServer> {
  return createServer({
    configFile: `${app}/vite.config.ts`,
    root: app,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
}

/** Een browser met een telefoonscherm (390 px breed) en een A4-afdruk (718 px: A4 min 15 mm marge). */
export async function browserMetPaginas(): Promise<{ browser: Browser; scherm: Page; papier: Page }> {
  // Net als de e2e-tests: lokaal kan een bestaande Chrome gebruikt worden (CHROME_PATH=/pad/naar/chrome).
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const scherm = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const papier = await browser.newPage({ viewport: { width: 718, height: 1000 } });
  await papier.emulateMedia({ media: "print" });
  return { browser, scherm, papier };
}

/** Een volledige HTML-pagina met de huisstijl. tsx geeft functies een naam met __name; die bestaat niet in de browser. */
export const pagina = (css: string, inhoud: string) =>
  `<!doctype html><html lang="nl"><head><meta charset="utf-8"><script>window.__name = (f) => f;</script><style>${css}</style></head><body><div class="pagina"><main>${inhoud}</main></div></body></html>`;

/** Blokken (CSS-selector) die in de afdruk over elkaar heen liggen. Uitklapblokken gaan eerst open. */
export function overlapIn(papier: Page, selector: string): Promise<string[]> {
  return papier.evaluate((sel) => {
    document.querySelectorAll("details").forEach((d) => ((d as HTMLDetailsElement).open = true));
    const blokken = [...document.querySelectorAll(sel)]
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0);
    const overlap: string[] = [];
    for (let i = 0; i < blokken.length; i++)
      for (let j = i + 1; j < blokken.length; j++) {
        const a = blokken[i];
        const b = blokken[j];
        if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
        const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (x > 2 && y > 2) overlap.push(`${a.e.className || a.e.tagName} en ${b.e.className || b.e.tagName} (${Math.round(y)} px)`);
      }
    return overlap;
  }, selector);
}

export interface Fout {
  persoon: string;
  waar: string;
  controle: string;
  wat: string;
}

/** Houdt bij welke controles hoe vaak zijn gedaan en wat niet klopte. */
export class Controles {
  readonly fouten: Fout[] = [];
  readonly telling = new Map<string, number>();

  controle(naam: string, persoon: string, waar: string, ok: boolean, wat: string) {
    this.telling.set(naam, (this.telling.get(naam) ?? 0) + 1);
    if (!ok) this.fouten.push({ persoon, waar, controle: naam, wat });
  }

  /** Geen puntkomma in tekst voor gebruikers. Letterlijke wetteksten staan niet in de tekst die de audit leest. */
  geenPuntkomma(persoon: string, waar: string, teksten: string[]) {
    const zinnen = teksten.join("\n").split("\n").filter((r) => /;/.test(r));
    this.controle(
      "Geen ; in teksten",
      persoon,
      waar,
      zinnen.length === 0,
      zinnen.map((z) => `"…${z.slice(Math.max(0, z.indexOf(";") - 70), z.indexOf(";") + 50)}…"`).join(" | "),
    );
  }

  /** Bedragen van 1.000 of meer met een punt: geen "€ 2300". */
  bedragenMetPunt(persoon: string, waar: string, teksten: string[]) {
    const zonderPunt = teksten.join("\n").match(/€\s?\d{4,}/g) ?? [];
    this.controle("Bedragen met een punt", persoon, waar, zonderPunt.length === 0, zonderPunt.join(", "));
  }

  /** Geen "NaN", "undefined", "null" of een minteken direct na het euroteken. */
  geenKapotteTekst(persoon: string, waar: string, teksten: string[]) {
    const kapot = teksten.join("\n").match(/.{0,40}(NaN|undefined|null|\[object|Infinity|€\s?-).{0,40}/g) ?? [];
    this.controle("Geen kapotte tekst", persoon, waar, kapot.length === 0, kapot.map((k) => `"${k}"`).join(" | "));
  }

  /** De tabel met controles en de lijst met wat niet klopt, als regels van een Markdown-rapport. */
  rapport(titel: string, uitleg: string): string[] {
    return [
      `# ${titel}`,
      "",
      uitleg,
      "",
      "| Controle | Aantal keer | Niet goed |",
      "| --- | --- | --- |",
      ...[...this.telling].map(([naam, n]) => `| ${naam} | ${n} | ${this.fouten.filter((f) => f.controle === naam).length} |`),
      "",
      this.fouten.length === 0 ? "Alles klopt." : "## Wat niet klopt\n",
      ...samengevat(this.fouten),
      "",
    ];
  }
}

/**
 * Elke melding één keer, met bij wie en waar ze voorkomt. Bij "Geen ; in teksten" is elke zin een aparte melding,
 * zodat dezelfde zin bij tien personen één regel wordt.
 */
export function samengevat(fouten: Fout[]): string[] {
  const groepen = new Map<string, Set<string>>();
  for (const f of fouten) {
    const delen = f.controle === "Geen ; in teksten" ? f.wat.split(" | ") : [f.wat];
    for (const d of delen) {
      const sleutel = `**${f.controle}**: ${f.controle === "Geen ; in teksten" ? d : `${f.persoon} · ${f.waar}: ${d}`}`;
      if (!groepen.has(sleutel)) groepen.set(sleutel, new Set());
      groepen.get(sleutel)!.add(f.persoon.split(":")[0]);
    }
  }
  return [...groepen].map(([s, wie]) =>
    s.startsWith("**Geen ;") ? `- ${s} (bij ${[...wie].slice(0, 4).join(", ")}${wie.size > 4 ? ` en ${wie.size - 4} anderen` : ""})` : `- ${s}`,
  );
}

/** Een bestandsnaam uit de naam van een persoon: "Sanne: alleenstaande moeder" wordt "sanne". */
export const bestandsnaam = (naam: string) =>
  naam
    .split(":")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Kleine, voorspelbare toevalsgenerator (mulberry32): hetzelfde zaad geeft dezelfde reeks. */
export function toeval(zaad: number) {
  let a = zaad >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const tussen = (van: number, tot: number) => van + Math.floor(r() * (tot - van + 1));
  const kies = <T,>(lijst: readonly T[]): T => lijst[Math.floor(r() * lijst.length)];
  const kans = (p: number) => r() < p;
  return { tussen, kies, kans };
}
