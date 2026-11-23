/**
 * `npm run audit:leidengeldwijzer`: rekent de verzonnen personen uit audit/leidengeldwijzer/personen.ts door met de echte
 * overzichtspagina van Leidengeldwijzer, schrijft per persoon het overzicht als platte tekst weg en controleert
 * automatisch wat er mis kan gaan. Geen AI en geen internet nodig. Zie audit/leidengeldwijzer/README.md.
 *
 * Uitvoer:
 * - audit/leidengeldwijzer/uitvoer/<persoon>.txt: wat de persoon invulde en het overzicht als tekst.
 * - audit/leidengeldwijzer/rapport.md: de controles en alles wat niet klopt.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "yaml";
import { Controles, bestandsnaam, browserMetPaginas, optie, overlapIn, pagina, rekendatumUit, viteVoor } from "./audit-kern.ts";
import { PERSONEN, REKENDATUM, formulier, type Persoon, type Verwachting } from "../audit/leidengeldwijzer/personen.ts";
import { willekeurigePersonen } from "../audit/leidengeldwijzer/willekeurig.ts";
import type { Formulier } from "../regelingen/src/formulier.ts";
import type { CheckInvoer } from "../packages/engine/src/index.ts";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const map = join(wortel, "audit", "leidengeldwijzer");
const uitvoerMap = join(map, "uitvoer");
const aantalWillekeurig = optie("willekeurig");
const zaad = optie("zaad") ?? Date.now() % 100000;

/** Officiële sites waar een aanvraaglink naartoe mag wijzen. */
const OFFICIEEL = ["leiden.nl", "belastingdienst.nl", "rijksoverheid.nl", "overheid.nl", "svb.nl", "uwv.nl"];

async function main() {
  const vite = await viteVoor(join(wortel, "regelingen"));
  const rekendatum = rekendatumUit(REKENDATUM);
  const form = (await vite.ssrLoadModule("/src/formulier.ts")) as {
    zetVandaag: (d: string) => void;
    controleer: (f: Formulier, stap: number) => Record<string, string>;
    naarInvoer: (f: Formulier) => CheckInvoer;
  };
  form.zetVandaag(rekendatum);
  const { Overzicht } = (await vite.ssrLoadModule("/src/Overzicht.tsx")) as { Overzicht: (p: object) => unknown };
  const { checkRegelingen } = (await vite.ssrLoadModule("@leidenwerkt/engine")) as { checkRegelingen: (i: CheckInvoer) => { id: string; kans: string }[] };
  const css = ["packages/ui/src/stijl.css", "regelingen/src/eigen.css"].map((b) => readFileSync(join(wortel, b), "utf8")).join("\n");
  const { browser, scherm, papier } = await browserMetPaginas();
  const c = new Controles();

  async function bekijk(f: Formulier) {
    const inhoud = pagina(css, renderToStaticMarkup(createElement(Overzicht as never, { f })));
    // Scherm: per regeling een tegel. De uitleg (waarom, aanvraag, bronnen) staat verborgen bij de tegel en opent in een venster.
    // De audit leest die uitleg uit de pagina (textContent), zonder te klikken.
    await scherm.setContent(inhoud);
    const w = await scherm.evaluate(() => {
      const tekst = (e: Element | null) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
      const kaarten = [...document.querySelectorAll(".overzicht-raster .regeling")].map((li) => ({
        id: li.getAttribute("data-id") ?? "",
        groep: ["ja", "misschien", "info", "nee"].find((g) => li.closest(".groep")?.classList.contains(g)) ?? "",
        naam: tekst(li.querySelector(".regeling-naam")),
        bedrag: tekst(li.querySelector(".uitleg-bedrag")),
        waarom: tekst(li.querySelector(".waarom")),
        links: [...li.querySelectorAll("a.aanvraag")].map((a) => (a as HTMLAnchorElement).href),
        bronnen: li.querySelectorAll(".bron-knop").length,
      }));
      const uitleg = kaarten.map((k) => [k.naam, k.bedrag, k.waarom].filter(Boolean).join("\n")).join("\n\n");
      return { schermTekst: (document.querySelector("main") as HTMLElement).innerText.trim(), uitleg, kaarten };
    });
    // Papier: de korte afdruk. Elke regeling staat erop met haar naam.
    await papier.setContent(inhoud);
    const overlap = await overlapIn(papier, ".afdruk-datum, .afdruk-groep, .afdruk-contact, .gegevens");
    const afdruk = await papier.evaluate(() => (document.querySelector(".afdruk") as HTMLElement).innerText.trim());
    const nietOpPapier = w.kaarten.filter((k) => k.groep !== "info" && !afdruk.includes(k.naam)).map((k) => k.naam);
    return { ...w, tekst: `${afdruk}\n\n## Uitleg per regeling (op het scherm, in het venster)\n\n${w.uitleg}`, afdruk, overlap, nietOpPapier };
  }

  /** Het inkomen van het huishouden per maand, zoals de gemeente het telt (zonder bijstand). */
  const huishoudinkomen = (i: CheckInvoer) =>
    i.bijstand ? undefined : [i.aanvrager, i.partner].filter(Boolean).reduce((s, p) => s + Object.values(p!.inkomen).reduce((t, x) => t + (x ?? 0), 0), 0);
  const getal = (x: string) => Number(x.replace(/\./g, "").replace(",", "."));

  function controleer(p: Persoon, waar: string, w: Awaited<ReturnType<typeof bekijk>>) {
    const invoer = form.naarInvoer(p.f);
    // 1. Elke uitslag van de rekenkern staat op de pagina, in de goede groep.
    const kern = checkRegelingen(invoer);
    const opPagina = new Map(w.kaarten.map((k) => [k.id, k.groep]));
    for (const u of kern)
      c.controle("Elke uitslag staat op de pagina", p.naam, waar, opPagina.get(u.id) === u.kans, `${u.id}: rekenkern "${u.kans}", pagina "${opPagina.get(u.id) ?? "ontbreekt"}"`);
    c.controle("Elke uitslag staat op de pagina", p.naam, waar, w.kaarten.length === kern.length, `rekenkern ${kern.length}, pagina ${w.kaarten.length}`);
    const inkomen = huishoudinkomen(invoer);
    for (const k of w.kaarten) {
      // 2. Elke regeling heeft een reden en een bron.
      c.controle("Reden en bron bij elke regeling", p.naam, waar, k.waarom.length > 10 && k.bronnen > 0, `${k.naam}: reden "${k.waarom}", ${k.bronnen} bronnen`);
      // 3. Aanvraaglinks gaan naar een officiële site, via https.
      for (const l of k.links) {
        const host = new URL(l).hostname;
        c.controle("Links naar officiële sites", p.naam, waar, l.startsWith("https://") && OFFICIEEL.some((d) => host === d || host.endsWith(`.${d}`)), `${k.naam}: ${l}`);
      }
      // 4. De zin over de grens past bij de groep en bij het inkomen.
      const boven = /Uw inkomen is hoger dan de grens/.test(k.waarom);
      const onder = /Uw inkomen is niet hoger dan de grens/.test(k.waarom);
      if (boven || onder) {
        // Jongeren van 18 tot 21 zonder steun van hun ouders kunnen een hogere grens hebben: dan "misschien".
        const misschienHoger = /Krijgt u geen geld van uw ouders\?/.test(k.waarom);
        c.controle("Grens past bij de groep", p.naam, waar, boven ? k.groep === "nee" || (misschienHoger && k.groep === "misschien") : k.groep !== "nee", `${k.naam}: "${boven ? "hoger" : "niet hoger"}" in groep "${k.groep}"`);
        const g = /grens voor uw huishouden is ongeveer €\s([\d.]+)/.exec(k.waarom);
        if (g && inkomen !== undefined) {
          const grens = getal(g[1]);
          c.controle("Grens past bij het inkomen", p.naam, waar, boven ? inkomen > grens - 1 : inkomen <= grens + 1, `${k.naam}: inkomen € ${inkomen}, grens ongeveer € ${grens}, zegt "${boven ? "hoger" : "niet hoger"}"`);
        }
      }
    }
    // 5. Teksten.
    c.geenPuntkomma(p.naam, waar, [w.schermTekst, w.tekst]);
    c.bedragenMetPunt(p.naam, waar, [w.schermTekst, w.tekst]);
    c.geenKapotteTekst(p.naam, waar, [w.schermTekst, w.tekst]);
    // 6. Afdruk: niets overlapt, en ook de dichtgeklapte groep staat op papier.
    c.controle("Afdruk zonder overlap", p.naam, waar, w.overlap.length === 0, w.overlap.join(" | "));
    c.controle("Afdruk toont alle regelingen", p.naam, waar, w.nietOpPapier.length === 0, `niet op papier: ${w.nietOpPapier.join(", ")}`);
    // 7. Officiële bedragen en grenzen.
    for (const v of p.verwacht ?? []) {
      const k = w.kaarten.find((x) => x.id === v.regeling);
      const tol = v.tolerantie ?? 1;
      if (v.grens !== undefined) {
        const g = k && /grens voor uw huishouden is ongeveer €\s([\d.]+)/.exec(k.waarom);
        const app = g ? getal(g[1]) : NaN;
        c.controle("Gelijk aan de officiële bron", p.naam, waar, Math.abs(app - v.grens) <= tol, `${v.regeling}, grens: Leidengeldwijzer € ${app}, ${v.bron.titel}: € ${v.grens}`);
      }
      if (v.bedrag !== undefined) {
        const b = k && /€\s([\d.]+)/.exec(k.bedrag);
        const app = b ? getal(b[1]) : NaN;
        c.controle("Gelijk aan de officiële bron", p.naam, waar, Math.abs(app - v.bedrag) <= tol, `${v.regeling}, bedrag: Leidengeldwijzer € ${app}, ${v.bron.titel}: € ${v.bedrag}`);
      }
    }
  }

  const personen: Persoon[] = aantalWillekeurig ? willekeurigePersonen(aantalWillekeurig, zaad) : [...PERSONEN, ...externePersonen()];
  if (!aantalWillekeurig) {
    rmSync(uitvoerMap, { recursive: true, force: true });
    mkdirSync(uitvoerMap, { recursive: true });
  }
  const mislukt: Persoon[] = [];
  for (const p of personen) {
    const voor = c.fouten.length;
    try {
      // 0. Het formulier keurt de persoon goed: zo kan iemand het echt invullen.
      const fout = [1, 2, 3].flatMap((stap) => Object.entries(form.controleer(p.f, stap)).map(([id, m]) => `stap ${stap}, ${id}: ${m}`));
      c.controle("Formulier keurt de persoon goed", p.naam, "-", fout.length === 0, fout.join(" | "));
      const w = await bekijk(p.f);
      controleer(p, "overzicht", w);
      // 8. Omwegen: dezelfde uitkomst als de directe route.
      for (const o of p.omwegen ?? []) {
        const via = { ...p.f, ...o.begin, ...o.wijzig } as Formulier;
        const a = w.tekst.split("\n");
        const b = (await bekijk(via)).tekst.split("\n");
        const i = a.findIndex((r, n) => r !== b[n]);
        c.controle("Omweg geeft dezelfde uitkomst", p.naam, o.naam, i === -1 && a.length === b.length, i === -1 ? "andere lengte" : `direct: "${a[i]}" | omweg: "${b[i] ?? ""}"`);
      }
      if (!aantalWillekeurig)
        writeFileSync(join(uitvoerMap, `${bestandsnaam(p.naam)}.txt`), `# ${p.naam}\n\n## Wat is ingevuld\n\n${ingevuld(form.naarInvoer(p.f))}\n\n## Afdruk\n\n${w.tekst}\n`);
    } catch (e) {
      c.controle("Rekent zonder fout", p.naam, "-", false, String(e).split("\n")[0]);
    }
    if (c.fouten.length > voor) mislukt.push(p);
  }
  await browser.close();
  await vite.close();

  const regels = c.rapport(
    "Auditrapport Leidengeldwijzer",
    aantalWillekeurig
      ? `Gemaakt met \`npm run audit:leidengeldwijzer -- --willekeurig ${aantalWillekeurig} --zaad ${zaad}\` met rekendatum ${rekendatum}. ${personen.length} willekeurige personen. De formulieren van personen met een melding staan in audit/leidengeldwijzer/willekeurig-fouten.json.`
      : `Gemaakt met \`npm run audit:leidengeldwijzer\` met rekendatum ${rekendatum}. ${personen.length} personen uit audit/leidengeldwijzer/personen.ts en extern/. De overzichten staan in audit/leidengeldwijzer/uitvoer/.`,
  );
  writeFileSync(join(map, aantalWillekeurig ? "rapport-willekeurig.md" : "rapport.md"), regels.join("\n"));
  if (aantalWillekeurig) writeFileSync(join(map, "willekeurig-fouten.json"), JSON.stringify(mislukt, null, 1));
  console.log(regels.slice(4).join("\n"));
  process.exitCode = c.fouten.length ? 1 : 0;
}

/** Wat er is ingevuld, in gewone zinnen, voor bovenaan het uitvoerbestand. */
function ingevuld(i: CheckInvoer): string {
  const euro = (n: number) => `€ ${n.toLocaleString("nl-NL")}`;
  const persoon = (naam: string, p: CheckInvoer["aanvrager"]) =>
    `${naam}: ${p.leeftijd} jaar. Inkomen per maand: ${
      Object.entries(p.inkomen).map(([s, b]) => `${s} ${euro(b ?? 0)}`).join(", ") || (i.bijstand ? "bijstand" : "geen")
    }${p.uitkering ? ` (uitkering: ${p.uitkering})` : ""}.`;
  const v = i.vermogen;
  return [
    persoon("Aanvrager", i.aanvrager),
    i.partner ? persoon("Partner", i.partner) : "Geen partner.",
    i.kinderen.length
      ? `Kinderen: ${i.kinderen
          .map(
            (k) =>
              `${k.leeftijd} jaar${k.opvang ? ` (opvang ${k.opvang.soort}, ${k.opvang.urenPerMaand} uur per maand, ${euro(k.opvang.uurprijs)} per uur${k.opvang.uurprijsGeschat ? ", prijs geschat" : ""})` : ""}${k.leeftijd >= 18 ? ` (inkomen ${k.inkomenJaar === undefined ? "onbekend" : `${euro(k.inkomenJaar)} per jaar`})` : ""}`,
          )
          .join(", ")}. Kinderbijslag: ${i.kinderbijslag ? "ja" : "nee"}.`
      : "Geen kinderen.",
    `Wonen: ${i.wonen}${i.kaleHuurPerMaand !== undefined ? `, kale huur ${euro(i.kaleHuurPerMaand)}` : ""}. Andere mensen in huis: ${
      i.andereBewoners
        ? `ja${i.andereBewonersAantal ? `, ${i.andereBewonersAantal}, inkomen ${i.andereBewonersInkomenJaar === undefined ? "onbekend" : `${euro(i.andereBewonersInkomenJaar)} per jaar`}` : ""}`
        : "nee"
    }.`,
    `Bijstand: ${i.bijstand ? "ja" : "nee"}. 5 jaar laag inkomen: ${i.langLaagInkomen ?? "niet gevraagd"}.`,
    `Geld en bezit: betaalrekening ${euro(v.betaalrekening)}, spaarrekening ${euro(v.spaarrekening)}, voertuigen ${v.voertuigen.map(euro).join(" en ") || "geen"}, beleggingen ${euro(v.beleggingen)}, spullen ${euro(v.spullen)}, schulden ${euro(v.schulden)}.`,
  ].join("\n");
}

/**
 * Personen die een ander (bijvoorbeeld een klantmanager) heeft ingevuld, met bedragen uit een officiële bron.
 * Elk bestand in audit/leidengeldwijzer/extern/*.yaml is één persoon. Zie audit/leidengeldwijzer/README.md.
 */
function externePersonen(): Persoon[] {
  const extern = join(map, "extern");
  let bestanden: string[] = [];
  try {
    bestanden = readdirSync(extern).filter((b) => b.endsWith(".yaml")).sort();
  } catch {
    return [];
  }
  return bestanden.map((b) => {
    const d = parse(readFileSync(join(extern, b), "utf8")) as { naam: string; formulier: Partial<Formulier>; verwacht?: Verwachting[] };
    return { naam: d.naam, f: formulier(d.formulier), verwacht: d.verwacht };
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
