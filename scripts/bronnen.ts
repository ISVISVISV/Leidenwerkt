/**
 * Bewaking van de bronnen zelf: werken de links nog, en staat onze letterlijke tekst nog op de webpagina?
 * Wordt elke week aangeroepen door scripts/bewaking.ts. Zie docs/ONDERHOUD.md, hoofdstuk 3.
 *
 * - Links: alle adressen uit de regeldata, uit citaten.ts en uit de broncode van de apps en de startpagina.
 *   Een link die een fout geeft (404, 410, 500 …) of niet bereikbaar is, wordt een melding.
 * - Citaten: bij elke bron die een gewone webpagina is (geen pdf), moet elk stuk van de letterlijke tekst
 *   (de delen tussen "[…]") nog op de pagina staan. Zo valt het op als een bedrag of zin is veranderd.
 *   We vergelijken zonder leestekens en in delen per zin (zie fragmenten). Zo geeft opmaak geen vals alarm.
 *   Korte stukken (minder dan MIN_LENGTE tekens) slaan we over: die geven te veel vals alarm.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import type { Melding } from "./bewaking.ts";

export const MIN_LENGTE = 40;

export interface Bronvermelding {
  url: string;
  /** Waar de link vandaan komt, voor de melding. */
  waar: string;
  /** De letterlijke tekst, als die op deze pagina hoort te staan. */
  tekst?: string;
  kop?: string;
}

/** Maakt tekst vergelijkbaar: kleine letters, gewone spaties en aanhalingstekens, geen dubbele spaties. */
export function normaliseer(s: string): string {
  return s
    .replace(/[   ]/g, " ")
    .replace(/­/g, "")
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Zichtbare tekst van een HTML-pagina, zonder scripts, stijlen en tags. */
export function htmlNaarTekst(html: string): string {
  return html
    .replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&euro;/g, "€")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

/** De stukken van een citaat die we zoeken: de delen tussen "[…]", zonder opsommingstekens aan het begin. */
export function stukken(tekst: string): string[] {
  return tekst
    .split(/\[\s*(?:…|\.\.\.)\s*\]/)
    .map((s) => s.replace(/^[\s•·\-–]+/, "").replace(/[\s•·]+$/, ""))
    .filter((s) => s.length >= MIN_LENGTE);
}

/** Alleen letters, cijfers, € en enkele spaties. Zo maken leestekens en opmaak (";" of ".", "1." of "1") niets uit. */
export function kaal(s: string): string {
  return normaliseer(s)
    .replace(/[^\p{L}\p{N}€]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Een stuk in kleinere delen: bij ";" en bij een punt aan het eind van een zin.
 * Zonder ons eigen kopje ("Art. 19a lid 1:", "Toelichting:") en zonder nummers aan het begin ("1", "a.", "2°.").
 * Een bedrag blijft bij zijn zin, want we knippen niet bij ":". Een kort deel met een bedrag houden we ook.
 */
// Een kopje knippen we weg en maken er een grens van. Staat het toch op de pagina, dan geeft dat geen vals alarm.
const KOPJE = /(?:^|(?<=[\s;.]))(?:art\.|artikel|toelichting)[^:;.]{0,30}:\s*/gi;

export function fragmenten(stuk: string): string[] {
  return stuk
    .replace(KOPJE, ". ")
    .split(/;\s+|\.\s+(?=\S)/)
    .map((f) => kaal(f).replace(/^((\d+|[a-z]) )+/, ""))
    .filter((f) => f.length >= MIN_LENGTE || (f.includes("€") && /\d/.test(f)));
}

/** De stukken van het citaat die niet (meer) op de pagina staan. Een stuk mist als een van zijn delen mist. */
export function ontbrekendeStukken(citaat: string, paginaTekst: string, nietOpPagina: string[] = []): string[] {
  // Zonder spaties: soms plakt de pagina twee woorden aan elkaar ("UitvoeringsregelingInvorderingswet").
  const zonderSpaties = (s: string) => s.replace(/ /g, "");
  const pagina = zonderSpaties(kaal(paginaTekst));
  // Tekst die wel in het citaat staat maar niet als tekst op de pagina (bijvoorbeeld een formule als plaatje): een grens.
  for (const t of nietOpPagina) citaat = citaat.split(t).join(". ");
  return stukken(citaat).filter((s) => fragmenten(s).some((f) => !pagina.includes(zonderSpaties(f))));
}

const zonderAnker = (url: string) => url.split("#")[0];
const isPdf = (url: string) => /\.pdf($|\?)/i.test(zonderAnker(url));

/** Alle adressen in broncode: de apps, de gedeelde onderdelen en de startpagina. */
export function linksInBroncode(mappen: string[], wortel: string): Bronvermelding[] {
  const uit: Bronvermelding[] = [];
  const loop = (map: string) => {
    for (const naam of readdirSync(map)) {
      const pad = join(map, naam);
      if (naam === "node_modules" || naam === "dist" || naam === "generated" || naam === "test") continue;
      if (statSync(pad).isDirectory()) loop(pad);
      else if (/\.(ts|tsx|html)$/.test(naam))
        for (const m of readFileSync(pad, "utf8").matchAll(/https:\/\/[^\s"'`<>)\]]+/g)) if (!m[0].includes("${")) uit.push({ url: m[0].replace(/[.,;]+$/, ""), waar: pad.replace(wortel + "/", "") });
    }
  };
  for (const m of mappen) loop(join(wortel, m));
  return uit;
}

/** Adressen die geen bron zijn: schema's, de repository zelf, voorbeelden in commentaar. */
export const GEEN_BRON = [/^https:\/\/(unpkg\.com|json\.schemastore\.org|github\.com\/ISVISVISV|isvisvisv\.github\.io|www\.w3\.org)/];

const sleutel = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 10);

/** Haalt een pagina op. Gooit bij een netwerkfout; geeft de status en (bij HTML) de tekst. */
async function haalPagina(url: string): Promise<{ status: number; html?: string }> {
  const r = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
    headers: { "User-Agent": "Leidenwerkt-bewaking (github.com/ISVISVISV/Rekenhulp)", Accept: "text/html,application/pdf;q=0.9,*/*;q=0.8" },
  });
  const type = r.headers.get("content-type") ?? "";
  return { status: r.status, html: r.ok && type.includes("html") ? await r.text() : undefined };
}

/**
 * Loopt alle bronnen na. Geeft meldingen voor kapotte links en voor citaten die niet meer op de pagina staan.
 * overslaan: stukken van adressen waar de tekst pas met JavaScript op de pagina komt; die links worden wel gecontroleerd.
 * nietOpPagina: stukjes citaat die op de pagina geen tekst zijn, zoals een formule die als plaatje op de pagina staat.
 */
export async function controleerBronnen(bronnen: Bronvermelding[], overslaan: string[], nietOpPagina: string[] = []): Promise<{ meldingen: Melding[]; verslag: string[] }> {
  const perUrl = new Map<string, Bronvermelding[]>();
  for (const b of bronnen) {
    if (GEEN_BRON.some((r) => r.test(b.url))) continue;
    const u = zonderAnker(b.url);
    perUrl.set(u, [...(perUrl.get(u) ?? []), b]);
  }
  const meldingen: Melding[] = [];
  const verslag: string[] = [];
  const urls = [...perUrl.keys()];
  let i = 0;
  const werker = async () => {
    while (i < urls.length) {
      const url = urls[i++];
      const vermeldingen = perUrl.get(url)!;
      const waar = [...new Set(vermeldingen.map((v) => v.waar))].slice(0, 5).join(", ");
      let pagina: { status: number; html?: string };
      try {
        // Een netwerkfout komt soms één keer voor. Daarom proberen we het twee keer.
        pagina = await haalPagina(url).catch(() => haalPagina(url));
      } catch (e) {
        verslag.push(`niet bereikbaar: ${url} (${(e as Error).message})`);
        meldingen.push({ sleutel: `link:${url}`, titel: `[bewaking] Link niet bereikbaar: ${url.slice(0, 80)}`, tekst: `De link ${url} gaf geen antwoord (${(e as Error).message}). Gebruikt in: ${waar}.\n\nControleer de link met de hand. Werkt hij niet meer? Zoek het nieuwe adres op de officiële site en pas het aan.` });
        continue;
      }
      // 401, 403 en 429: de site weert automatische verzoeken. Dat zegt niets over de link.
      if (pagina.status >= 400 && ![401, 403, 429].includes(pagina.status)) {
        verslag.push(`fout ${pagina.status}: ${url}`);
        meldingen.push({ sleutel: `link:${url}`, titel: `[bewaking] Link werkt niet (${pagina.status}): ${url.slice(0, 80)}`, tekst: `De link ${url} geeft fout ${pagina.status}. Gebruikt in: ${waar}.\n\nZoek het nieuwe adres op de officiële site en pas het aan.` });
        continue;
      }
      if (!pagina.html || isPdf(url) || overslaan.some((o) => url.includes(o))) continue;
      const tekst = htmlNaarTekst(pagina.html);
      for (const v of vermeldingen) {
        if (!v.tekst) continue;
        const mist = ontbrekendeStukken(v.tekst, tekst, nietOpPagina);
        if (!mist.length) continue;
        verslag.push(`tekst niet gevonden: ${v.kop ?? url} (${mist.length} van ${stukken(v.tekst).length} stukken)`);
        meldingen.push({
          sleutel: `citaat:${url}:${sleutel(v.tekst)}`,
          titel: `[bewaking] Tekst staat niet meer op de pagina: ${(v.kop ?? url).slice(0, 80)}`,
          tekst: `Bij ${v.kop ?? "de bron"} (${v.waar}) staat een letterlijke tekst. Deze stukken staan niet meer op ${url}:\n\n${mist.map((m) => `> ${m}`).join("\n\n")}\n\nMisschien is de pagina veranderd: een bedrag, een voorwaarde of een zin. Lees de pagina na. Pas de waarde en het citaat aan als dat nodig is (docs/ONDERHOUD.md, hoofdstuk 2). Komt de tekst pas met JavaScript op de pagina? Zet het adres dan in \`bronnen_overslaan\` in regels/bewaking.yaml.`,
        });
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, werker));
  verslag.unshift(`Bronnen: ${urls.length} adressen nagelopen, ${meldingen.length} meldingen.`);
  return { meldingen, verslag };
}
