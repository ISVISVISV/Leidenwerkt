/**
 * `npm run audit`: rekent de verzonnen personen uit audit/personen.ts door met de echte uitkomstpagina,
 * schrijft per persoon de uitkomst als platte tekst weg en controleert automatisch wat testers eerder met de
 * hand vonden. Geen AI nodig.
 *
 * Uitvoer:
 * - audit/uitvoer/<persoon>.txt: de uitkomst als tekst, per stand van de urenschuif en per periode.
 *   Met `git diff audit/uitvoer` zie je wat er sinds de vorige keer is veranderd.
 * - audit/rapport.md: de controles en alles wat niet klopt.
 *
 * Werkwijze: de pagina wordt met Vite op de server gemaakt (zoals in de browser) en met Playwright in een echte
 * browser geopend, op telefoonbreedte en als afdruk op A4.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { PERSONEN, type Persoon } from "../audit/personen.ts";
import { willekeurigePersonen } from "../audit/willekeurig.ts";
import type { Formulier } from "../app/src/formulier.ts";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
// `npm run audit -- --willekeurig 200 --zaad 7`: willekeurige personen in plaats van de vaste.
const optie = (naam: string) => {
  const i = process.argv.indexOf(`--${naam}`);
  return i > 0 ? Number(process.argv[i + 1]) : undefined;
};
const aantalWillekeurig = optie("willekeurig");
const zaad = optie("zaad") ?? Date.now() % 100000;
const uitvoerMap = join(wortel, "audit", "uitvoer");

type Fase = "start" | "later" | "geen";
interface Rij {
  label: string;
  nu: number | null;
  werk: number | null;
  soort: "rij" | "subtotaal" | "totaal";
}
interface Weergave {
  tekst: string;
  kop: string;
  rijen: Rij[];
  noten: string[];
  signalen: { kop: string; tekst: string }[];
  periode?: string;
  afdrukOverlap: string[];
  afdrukTekst: string;
}

/** "€ 1.234", "– € 1.333" of "−€ 5" als getal. "–" alleen (geen bedrag) geeft null. */
function bedrag(t: string): number | null {
  const s = t.replace(/\s| /g, "");
  const m = /^([–−-]?)€([\d.]+)(?:,(\d+))?$/.exec(s);
  if (!m) return null;
  const n = Number(m[2].replace(/\./g, "") + (m[3] ? "." + m[3] : ""));
  return m[1] ? -n : n;
}

async function main() {
  const vite = await createServer({
    configFile: join(wortel, "app", "vite.config.ts"),
    root: join(wortel, "app"),
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  const { Uitkomst } = (await vite.ssrLoadModule("/src/Uitkomst.tsx")) as {
    Uitkomst: (p: object) => unknown;
  };
  const css = readFileSync(join(wortel, "app", "src", "styles.css"), "utf8");
  // Net als de e2e-tests: lokaal kan een bestaande Chrome gebruikt worden (CHROME_PATH=/pad/naar/chrome).
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  );
  const scherm = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  const papier = await browser.newPage({
    viewport: { width: 718, height: 1000 },
  }); // A4 min 15 mm marge
  await papier.emulateMedia({ media: "print" });

  // tsx geeft functies een naam met de hulpfunctie __name; die bestaat niet in de browser.
  const html = (f: Formulier, uren: number | undefined, fase: Fase) =>
    `<!doctype html><html lang="nl"><head><meta charset="utf-8"><script>window.__name = (f) => f;</script><style>${css}</style></head><body><div class="pagina"><main>${renderToStaticMarkup(
      createElement(Uitkomst as never, {
        f,
        bewaardeUren: uren,
        beginFase: fase,
      }),
    )}</main></div></body></html>`;

  async function bekijk(
    f: Formulier,
    uren: number | undefined,
    fase: Fase,
  ): Promise<Weergave> {
    const pagina = html(f, uren, fase);
    await scherm.setContent(pagina);
    const w = await scherm.evaluate(() => {
      document
        .querySelectorAll("details")
        .forEach((d) => ((d as HTMLDetailsElement).open = true));
      document.querySelectorAll(".bron-tekst").forEach((e) => e.remove());
      const tekst = (e: Element | null) =>
        (e as HTMLElement | null)?.innerText.trim() ?? "";
      const rijen = [...document.querySelectorAll("table.vergelijking tr")]
        .filter(
          (tr) =>
            !tr.classList.contains("groepkop") &&
            tr.querySelectorAll("td").length === 2,
        )
        .map((tr) => ({
          label: tekst(tr.querySelector("th")),
          nu: tekst(tr.querySelectorAll("td")[0]),
          werk: tekst(tr.querySelectorAll("td")[1]),
          soort: tr.classList.contains("subtotaal")
            ? "subtotaal"
            : tr.closest("tfoot")
              ? "totaal"
              : "rij",
        }));
      const gekozen = document.querySelector<HTMLInputElement>(
        ".bediening input[type=radio]:checked",
      );
      return {
        tekst: tekst(document.querySelector("main")),
        kop: tekst(document.querySelector(".antwoord-zin")),
        rijen,
        noten: [...document.querySelectorAll(".tabel-noten li")].map(tekst),
        signalen: [...document.querySelectorAll("details.signaal")].map(
          (d) => ({
            kop: tekst(d.querySelector("summary")),
            tekst: tekst(d)
              .replace(tekst(d.querySelector("summary")), "")
              .trim(),
          }),
        ),
        periode: gekozen ? tekst(gekozen.closest("label")) : undefined,
      };
    });
    await papier.setContent(pagina);
    const afdruk = await papier.evaluate(() => {
      document
        .querySelectorAll("details")
        .forEach((d) => ((d as HTMLDetailsElement).open = true));
      const blokken = [
        ...document.querySelectorAll(
          ".antwoord, .te-doen, .gegevens, .urengrens, table.vergelijking, .tabel-noten, .signalen > li, .aannames, main > section, main > p",
        ),
      ]
        .map((e) => ({ e, r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0);
      const overlap: string[] = [];
      for (let i = 0; i < blokken.length; i++)
        for (let j = i + 1; j < blokken.length; j++) {
          const a = blokken[i];
          const b = blokken[j];
          if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
          const x =
            Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
          const y =
            Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
          if (x > 2 && y > 2)
            overlap.push(
              `${a.e.className || a.e.tagName} en ${b.e.className || b.e.tagName} (${Math.round(y)} px)`,
            );
        }
      return {
        overlap,
        tekst:
          (
            document.querySelector(".gegevens") as HTMLElement | null
          )?.innerText.trim() ?? "",
      };
    });
    return {
      ...w,
      rijen: w.rijen.map((r) => ({
        label: r.label,
        nu: bedrag(r.nu),
        werk: bedrag(r.werk),
        soort: r.soort as Rij["soort"],
      })),
      afdrukOverlap: afdruk.overlap,
      afdrukTekst: afdruk.tekst,
    };
  }

  // ---- Controles ------------------------------------------------------------------------------------------
  const fouten: {
    persoon: string;
    waar: string;
    controle: string;
    wat: string;
  }[] = [];
  const telling = new Map<string, number>();
  const controle = (
    naam: string,
    persoon: string,
    waar: string,
    ok: boolean,
    wat: string,
  ) => {
    telling.set(naam, (telling.get(naam) ?? 0) + 1);
    if (!ok) fouten.push({ persoon, waar, controle: naam, wat });
  };

  function controleer(persoon: string, waar: string, w: Weergave) {
    // 1. De tabel telt op.
    for (const kol of ["nu", "werk"] as const) {
      let groep = 0;
      let totaal = 0;
      for (const r of w.rijen) {
        if (r.soort === "rij") groep += r[kol] ?? 0;
        else if (r.soort === "subtotaal") {
          controle(
            "Tabel telt op",
            persoon,
            waar,
            Math.abs(groep - (r[kol] ?? 0)) < 0.01,
            `${kol}: rijen samen € ${groep}, "${r.label}" zegt € ${r[kol]}`,
          );
          totaal += r[kol] ?? 0;
          groep = 0;
        } else
          controle(
            "Tabel telt op",
            persoon,
            waar,
            Math.abs(totaal - (r[kol] ?? 0)) < 0.01,
            `${kol}: totalen samen € ${totaal}, "${r.label}" zegt € ${r[kol]}`,
          );
      }
    }
    // 2. De zin bovenaan past bij "U houdt over".
    const over = w.rijen.find((r) => r.soort === "totaal");
    const kop = /ongeveer €\s([\d.]+)(?: per maand)? (meer|minder)/.exec(w.kop);
    if (over && over.nu !== null && over.werk !== null) {
      const verschil = over.werk - over.nu;
      const gezegd = kop
        ? Number(kop[1].replace(/\./g, "")) * (kop[2] === "minder" ? -1 : 1)
        : /evenveel|hetzelfde/.test(w.kop)
          ? 0
          : NaN;
      controle(
        "Zin bovenaan past bij de tabel",
        persoon,
        waar,
        // "Ongeveer evenveel" staat er bewust bij een verschil van minder dan € 10.
        gezegd === 0 && !kop ? Math.abs(verschil) < 10 : gezegd === verschil,
        `zin: "${w.kop}", tabel: € ${verschil}`,
      );
    }
    // 3. Het netto loon in de zin onder de tabel past bij de tabel (× 1,08 vakantiegeld, per week × 52 / 12, per 4 weken × 13 / 12).
    const loon = w.rijen.find((r) => r.label.startsWith("Netto loon"));
    for (const noot of w.noten) {
      const m = /ongeveer €\s([\d.]+) netto per (maand|week|4 weken)/.exec(noot);
      if (!m || !loon?.werk) continue;
      const maand =
        Number(m[1].replace(/\./g, "")) *
        (m[2] === "week" ? 52 / 12 : m[2] === "4 weken" ? 13 / 12 : 1) *
        1.08;
      controle(
        "Netto loon in de zin past bij de tabel",
        persoon,
        waar,
        Math.abs(maand - loon.werk) <= 3,
        `zin: "${m[0]}" (≈ € ${Math.round(maand)} met vakantiegeld), tabel: € ${loon.werk}`,
      );
    }
    // 4. Delen van de eigen bijdrage kinderopvang zijn samen het totaal.
    for (const s of w.signalen) {
      const m =
        /betaalt u nog €\s([\d.]+) per maand.*?Hier is €\s([\d.]+) per maand meegerekend\. U betaalt zelf €\s([\d.]+)/s.exec(
          s.tekst,
        );
      if (m) {
        const [a, b, c] = [m[1], m[2], m[3]].map((x) =>
          Number(x.replace(/\./g, "")),
        );
        controle(
          "Opvang: delen samen het totaal",
          persoon,
          waar,
          b + c === a,
          `€ ${b} + € ${c} is niet € ${a}`,
        );
      }
    }
    // 5. Inkomen en grens in de meldingen spreken elkaar niet tegen.
    for (const s of w.signalen) {
      const grens = /De grens is ongeveer €\s([\d.]+)/.exec(s.tekst);
      const inkomen =
        /is ongeveer €\s([\d.]+) per maand, met vakantiegeld/.exec(s.tekst);
      if (!grens || !inkomen) continue;
      const [g, i] = [grens[1], inkomen[1]].map((x) =>
        Number(x.replace(/\./g, "")),
      );
      const nietMeer = s.tekst.includes("niet meer");
      controle(
        "Inkomen en grens kloppen met elkaar",
        persoon,
        waar,
        nietMeer ? i > g : i <= g,
        `${s.kop}: inkomen € ${i}, grens € ${g}, zegt "${nietMeer ? "niet meer" : "nog krijgen"}"`,
      );
    }
    // 6. Geen puntkomma in tekst voor gebruikers (de letterlijke wetteksten tellen niet mee).
    const zinnen = [w.tekst, w.afdrukTekst]
      .join("\n")
      .split("\n")
      .filter((r) => /;/.test(r));
    controle(
      "Geen ; in teksten",
      persoon,
      waar,
      zinnen.length === 0,
      zinnen
        .map(
          (z) =>
            `"…${z.slice(Math.max(0, z.indexOf(";") - 70), z.indexOf(";") + 50)}…"`,
        )
        .join(" | "),
    );
    // 7. Bedragen van 1.000 of meer met een punt.
    const zonderPunt =
      [w.tekst, w.afdrukTekst].join("\n").match(/€\s?\d{4,}/g) ?? [];
    controle(
      "Bedragen met een punt",
      persoon,
      waar,
      zonderPunt.length === 0,
      zonderPunt.join(", "),
    );
    // 8. In de afdruk overlapt niets.
    controle(
      "Afdruk zonder overlap",
      persoon,
      waar,
      w.afdrukOverlap.length === 0,
      w.afdrukOverlap.join(" | "),
    );
    // 13. De zin over de bijstand past bij de tabel.
    const bijstand = w.rijen.find((r) => r.label === "Bijstand");
    const stopt = /Uw bijstand van €\s([\d.]+) per maand stopt/.exec(w.tekst);
    const houdt = /(?:U houdt|houdt u nog) €\s([\d.]+) bijstand per maand/.exec(w.tekst);
    const getal = (x: string) => Number(x.replace(/\./g, ""));
    if (bijstand && stopt)
      controle("Zin over de bijstand past bij de tabel", persoon, waar, bijstand.nu === getal(stopt[1]) && !bijstand.werk, `zin: "${stopt[0]}", tabel: nu € ${bijstand.nu}, met werk € ${bijstand.werk}`);
    if (bijstand && houdt)
      controle("Zin over de bijstand past bij de tabel", persoon, waar, bijstand.werk === getal(houdt[1]), `zin: "${houdt[0]}", tabel met werk: € ${bijstand.werk}`);
    // 11. Geen kapotte tekst.
    const kapot =
      [w.tekst, w.afdrukTekst]
        .join("\n")
        .match(/.{0,40}(NaN|undefined|null|\[object|Infinity|€\s?-).{0,40}/g) ??
      [];
    controle(
      "Geen kapotte tekst",
      persoon,
      waar,
      kapot.length === 0,
      kapot.map((k) => `"${k}"`).join(" | "),
    );
  }

  // ---- Personen doorrekenen ---------------------------------------------------------------------------------
  const personen: Persoon[] = aantalWillekeurig
    ? willekeurigePersonen(aantalWillekeurig, zaad)
    : PERSONEN;
  if (!aantalWillekeurig) {
    rmSync(uitvoerMap, { recursive: true, force: true });
    mkdirSync(uitvoerMap, { recursive: true });
  }
  const mislukt: Persoon[] = [];
  for (const p of personen) {
    try {
      const voor = fouten.length;
      const delen: string[] = [`# ${p.naam}`];
      const ingevuld = Number(
        p.f.werktNu && p.f.verandering === "meer" ? p.f.meerUren : p.f.uren,
      );
      for (const uren of [undefined, ...(p.uren ?? [])]) {
        const gezien = new Set<string>();
        for (const fase of ["start", "later", "geen"] as Fase[]) {
          const w = await bekijk(p.f, uren, fase);
          if (gezien.has(w.tekst)) continue;
          gezien.add(w.tekst);
          const waar = `${uren ?? ingevuld} uur${w.periode ? `, ${w.periode}` : ""}`;
          controleer(p.naam, waar, w);
          delen.push(
            `\n## ${waar}\n\n${w.tekst}\n\n### Wat u heeft ingevuld (afdruk)\n\n${w.afdrukTekst}`,
          );
        }
      }
      // 9. De urenschuif: "U houdt over" verspringt niet heen en weer met € 1.
      const reeks: number[] = [];
      const van = Math.max(1, ingevuld - 4);
      for (let u = van; u <= ingevuld + 4; u++) {
        const over = (await bekijk(p.f, u, "start")).rijen.find(
          (r) => r.soort === "totaal",
        );
        reeks.push(over?.werk ?? NaN);
      }
      const stappen = reeks.slice(1).map((x, i) => x - reeks[i]);
      // Een stap van € 1 terug tegen de richting in (bijvoorbeeld 289, 290, 290, 289) is afronding, geen echte verandering.
      let laatste = 0;
      let zigzag = false;
      for (const s of stappen) {
        if (s === 0) continue;
        // Alleen € 1 heen en € 1 terug is afronding. Een echte daling (zoals door de combinatiekorting) telt niet.
        if (Math.abs(s) === 1 && Math.abs(laatste) === 1 && Math.sign(s) !== Math.sign(laatste)) zigzag = true;
        laatste = s;
      }
      controle(
        "Urenschuif verspringt niet met € 1",
        p.naam,
        `${van} t/m ${ingevuld + 4} uur`,
        !zigzag,
        `"U houdt over" per uur: ${reeks.map((x) => `€ ${x}`).join(", ")}`,
      );
      // 10. Omwegen: dezelfde uitkomst als de directe route.
      for (const o of p.omwegen ?? []) {
        const via = { ...p.f, ...o.begin, ...o.wijzig } as Formulier;
        for (const fase of ["start", "geen"] as Fase[]) {
          const a = (await bekijk(p.f, undefined, fase)).tekst.split("\n");
          const b = (await bekijk(via, undefined, fase)).tekst.split("\n");
          const i = a.findIndex((r, n) => r !== b[n]);
          controle(
            "Omweg geeft dezelfde uitkomst",
            p.naam,
            `${o.naam} (${fase})`,
            i === -1 && a.length === b.length,
            i === -1
              ? "andere lengte"
              : `direct: "${a[i]}" | omweg: "${b[i] ?? ""}"`,
          );
        }
      }
      if (!aantalWillekeurig) {
        const bestand = p.naam
          .split(":")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        writeFileSync(
          join(uitvoerMap, `${bestand}.txt`),
          delen.join("\n") + "\n",
        );
      }
      if (fouten.length > voor) mislukt.push(p);
    } catch (e) {
      // 12. De pagina komt zonder fout tot stand.
      controle(
        "Rekent zonder fout",
        p.naam,
        "-",
        false,
        String(e).split("\n")[0],
      );
      mislukt.push(p);
    }
  }
  await browser.close();
  await vite.close();

  // ---- Rapport -----------------------------------------------------------------------------------------------
  const regels = [
    "# Auditrapport",
    "",
    aantalWillekeurig
      ? `Gemaakt met \`npm run audit -- --willekeurig ${aantalWillekeurig} --zaad ${zaad}\` op ${new Date().toISOString().slice(0, 10)}. ${personen.length} willekeurige personen. De formulieren van personen met een melding staan in audit/willekeurig-fouten.json.`
      : `Gemaakt met \`npm run audit\` op ${new Date().toISOString().slice(0, 10)}. ${personen.length} personen uit audit/personen.ts. De uitkomsten staan in audit/uitvoer/.`,
    "",
    "| Controle | Aantal keer | Niet goed |",
    "| --- | --- | --- |",
    ...[...telling].map(
      ([naam, n]) =>
        `| ${naam} | ${n} | ${fouten.filter((f) => f.controle === naam).length} |`,
    ),
    "",
    fouten.length === 0 ? "Alles klopt." : "## Wat niet klopt\n",
    ...samengevat(fouten),
    "",
  ];
  writeFileSync(
    join(
      wortel,
      "audit",
      aantalWillekeurig ? "rapport-willekeurig.md" : "rapport.md",
    ),
    regels.join("\n"),
  );
  if (aantalWillekeurig)
    writeFileSync(
      join(wortel, "audit", "willekeurig-fouten.json"),
      JSON.stringify(mislukt, null, 1),
    );
  console.log(regels.slice(4).join("\n"));
  process.exitCode = fouten.length ? 1 : 0;
}

/**
 * Elke melding één keer, met bij wie en waar ze voorkomt. Bij "Geen ; in teksten" is elke zin een aparte melding,
 * zodat dezelfde zin bij tien personen één regel wordt.
 */
function samengevat(
  fouten: { persoon: string; waar: string; controle: string; wat: string }[],
): string[] {
  const groepen = new Map<string, Set<string>>();
  for (const f of fouten) {
    const delen =
      f.controle === "Geen ; in teksten" ? f.wat.split(" | ") : [f.wat];
    for (const d of delen) {
      const sleutel = `**${f.controle}**: ${f.controle === "Geen ; in teksten" ? d : `${f.persoon} · ${f.waar}: ${d}`}`;
      if (!groepen.has(sleutel)) groepen.set(sleutel, new Set());
      groepen.get(sleutel)!.add(f.persoon.split(":")[0]);
    }
  }
  return [...groepen].map(([s, wie]) =>
    s.startsWith("**Geen ;")
      ? `- ${s} (bij ${[...wie].slice(0, 4).join(", ")}${wie.size > 4 ? ` en ${wie.size - 4} anderen` : ""})`
      : `- ${s}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
