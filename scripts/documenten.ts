/**
 * Genereert de delen van de documentatie die uit data volgen:
 * - docs/PROEFPERSONEN.md uit testgevallen/*.yaml (met invulbladen)
 * - de statustabel in docs/REKENREGELS.md uit regels/**.yaml
 *
 * npm run docs           schrijft de bestanden
 * npm run docs -- --check faalt als de bestanden niet bijgewerkt zijn (CI)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { draai, laadProefpersonen, type Uitkomst } from "./proefpersonen.ts";
import { ruweParameters, type RuweParameter } from "../packages/engine/src/index.ts";

const wortel = new URL("..", import.meta.url).pathname;
const check = process.argv.includes("--check");
const eur = (n: number | null | string | undefined) =>
  n === null || n === undefined
    ? "niet berekend"
    : typeof n === "string"
      ? n
      : `€ ${n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function invoerZinnen(u: Uitkomst): string[] {
  const i = u.persoon.invoer as Record<string, any>;
  const regels: string[] = [];
  const leefvorm = { alleenstaande: "alleenstaand", alleenstaande_ouder: "alleenstaande ouder", paar: "met partner" }[i.leefvorm as string];
  regels.push(`Leefvorm: ${leefvorm}, leeftijd ${i.leeftijd}${i.partner ? `, partner ${i.partner.leeftijd}` : ""}`);
  if (i.partner?.werk) regels.push(`Werk partner: bruto ${eur(i.partner.werk.brutoMaandloon)} per maand`);
  if (i.kinderen?.length) {
    regels.push(
      `Kinderen: ${i.kinderen
        .map((k: any) => `${k.leeftijd} jaar${k.opvang ? ` (${k.opvang.soort}, ${k.opvang.urenPerMaand} uur per maand à ${eur(k.opvang.uurprijs)})` : ""}`)
        .join("; ")}`,
    );
  }
  if (i.kostendelers) regels.push(`Huisgenoten van 27 jaar of ouder: ${i.kostendelers}`);
  regels.push(i.wonen?.soort === "huur" ? `Kale huur: ${eur(i.wonen.kaleHuurPerMaand)} per maand` : "Geen huurtoeslag (geen huurwoning op eigen naam)");
  const werk = (w: any) =>
    w.brutoMaandloon !== undefined
      ? `bruto ${eur(w.brutoMaandloon)} per maand`
      : w.brutoVierwekenloon !== undefined
        ? `bruto ${eur(w.brutoVierwekenloon)} per 4 weken`
        : w.nettoMaandloon !== undefined
          ? `netto ${eur(w.nettoMaandloon)} per maand`
          : `bruto ${eur(w.brutoUurloon)} per uur`;
  if (i.huidigWerk) regels.push(`Werk nu: ${werk(i.huidigWerk)}${i.huidigWerk.urenPerWeek ? `, ${i.huidigWerk.urenPerWeek} uur per week` : ""}`);
  regels.push(`Werk straks: ${werk(i.nieuwWerk)}${i.nieuwWerk.urenPerWeek ? `, ${i.nieuwWerk.urenPerWeek} uur per week` : ""}`);
  const fase = { start: "eerste periode", later: "periode daarna", geen: "geen vrijlating" }[i.vrijlatingFase as string];
  regels.push(`Vrijlatingsperiode: ${fase}${i.medischUrenbeperkt ? ", medische urenbeperking" : ""}${i.overgang2027 ? `, overgangsrecht (onderdeel ${i.overgang2027})` : ""}`);
  return regels;
}

function toetsingsinkomen(u: Uitkomst, s: "huidig" | "werk"): string | undefined {
  for (const p of u.resultaat[s].posten) {
    const st = p.stappen.find((x) => x.tekst.startsWith("Geschat bruto jaarinkomen"));
    if (st?.bedrag) return eur(Math.round(Number(st.bedrag)));
  }
  return undefined;
}

function invulblad(u: Uitkomst): string[] {
  const i = u.persoon.invoer as Record<string, any>;
  const jaar = u.persoon.rekendatum.slice(0, 4);
  const regels = [
    `<details><summary>Invulblad voor de controle</summary>`,
    "",
    `**Proefberekening Dienst Toeslagen** (belastingdienst.nl/toeslagen, "Proefberekening maken"), jaar ${jaar}:`,
    "",
    `- Toeslagpartner: ${i.leefvorm === "paar" ? `ja, ${i.partner.leeftijd} jaar` : "nee"}; uw leeftijd: ${i.leeftijd}`,
    `- Kinderen: ${i.kinderen?.length ? i.kinderen.map((k: any) => `${k.leeftijd} jaar`).join(", ") : "geen"}`,
    `- Medebewoners (geen partner): ${i.kostendelers ? `${i.kostendelers} van 27 jaar of ouder` : "geen"}`,
    i.wonen?.soort === "huur" ? `- Huur: kale huur ${eur(i.wonen.kaleHuurPerMaand)} per maand, servicekosten € 0` : "- Huurtoeslag: niet aanvragen",
    `- Vermogen: onder de grens`,
    `- Inkomen ${jaar} (toetsingsinkomen) zonder werk: ${toetsingsinkomen(u, "huidig") ?? "–"}; met werk: ${toetsingsinkomen(u, "werk") ?? "–"} (doe twee proefberekeningen)`,
  ];
  for (const k of i.kinderen ?? []) {
    if (k.opvang) regels.push(`- Kinderopvang: ${k.opvang.soort}, ${k.opvang.urenPerMaand} uur per maand, € ${k.opvang.uurprijs} per uur`);
  }
  regels.push(
    "",
    `Noteer per proefberekening de bedragen per maand voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag, en zet ze met bron en datum in \`testgevallen/${u.persoon.bestand}\`.`,
    "",
    `**Netto loon**: zoek het bruto maandloon (${eur(Number(u.resultaat.werk.posten.find((p) => p.id === "loon")?.stappen.find((s) => s.tekst.startsWith("Bruto loon per maand"))?.bedrag ?? 0))}) op in de witte maandtabel loonheffing ${jaar} van de Belastingdienst, met loonheffingskorting. De rekenhulp verdeelt het vakantiegeld over 12 maanden; tel daarom 8% vakantiegeld op of vergelijk met een loonstrook.`,
    "",
    "</details>",
  );
  return regels;
}

function proefpersonenDoc(): string {
  const uitkomsten = laadProefpersonen().map((p) => draai(p));
  const regels: string[] = [
    "# Proefpersonen",
    "",
    "<!-- Gegenereerd met `npm run docs` uit testgevallen/*.yaml. Niet met de hand aanpassen. -->",
    "",
    "Verzonnen mensen in verzonnen situaties. Per persoon staan de invoer, de uitkomst van de rekenhulp en, waar beschikbaar, de vergelijking met een officiële waarde. 'Onbekend' betekent dat er nog geen officiële waarde is; dan bewaakt alleen de snapshot de uitkomst. Dit document is bedoeld om te laten controleren door een klantmanager of sociaal raadsman.",
    "",
    "| Persoon | Rekendatum | Kopgetal (verschil per maand) | Officiële waarden binnen tolerantie |",
    "| --- | --- | --- | --- |",
  ];
  for (const u of uitkomsten) {
    const officieel = u.vergelijkingen.filter((v) => v.binnen !== null);
    const goed = officieel.filter((v) => v.binnen).length;
    regels.push(
      `| [${u.persoon.naam}](#${u.persoon.bestand.replace(".yaml", "")}) | ${u.persoon.rekendatum} | ${eur(Number(u.resultaat.verschilPerMaand))} | ${officieel.length ? `${goed} van ${officieel.length}` : "–"} |`,
    );
  }
  for (const u of uitkomsten) {
    regels.push("", `<a id="${u.persoon.bestand.replace(".yaml", "")}"></a>`, `## ${u.persoon.naam} (\`${u.persoon.bestand}\`)`, "", u.persoon.beschrijving, "");
    if (u.persoon.opmerking) regels.push(`> ${u.persoon.opmerking}`, "");
    regels.push("**Invoer** (rekendatum " + u.persoon.rekendatum + ")", "", ...invoerZinnen(u).map((r) => `- ${r}`), "");
    regels.push(
      `**Uitkomst:** nu ${eur(Number(u.resultaat.huidig.besteedbaarPerMaand))}, met werk ${eur(Number(u.resultaat.werk.besteedbaarPerMaand))} per maand; verschil ${eur(Number(u.resultaat.verschilPerMaand))}.` +
        (u.resultaat.nietMeegenomen.length ? ` Niet meegerekend: ${u.resultaat.nietMeegenomen.map((n) => n.label.toLowerCase()).join(", ")}.` : ""),
      "",
      "| Onderdeel | Situatie | Rekenhulp | Officieel | Verschil | Bron |",
      "| --- | --- | ---: | ---: | ---: | --- |",
    );
    for (const v of u.vergelijkingen) {
      const bron = v.bron ? `[${v.bron.titel}](${v.bron.url}), ${v.bron.datum}${v.toelichting ? `. ${v.toelichting}` : ""}` : "–";
      const status = v.binnen === null ? "" : v.binnen ? " ✓" : " ✗";
      regels.push(
        `| ${v.label} | ${v.situatie === "nu" ? "nu" : "met werk"} | ${eur(v.berekend)} | ${v.verwacht === "onbekend" ? "onbekend" : eur(v.verwacht)} | ${v.verschil === null ? "–" : eur(v.verschil) + status} | ${bron} |`,
      );
    }
    regels.push("", ...invulblad(u));
  }
  return regels.join("\n") + "\n";
}

const STATUS_ORDE = ["geverifieerd", "onbevestigd", "ontbrekend"] as const;
const ONDERWERPEN: [string, string][] = [
  ["pw.norm", "Bijstandsnorm"],
  ["pw.kostendeler", "Kostendelersnorm"],
  ["pw.vrijlating", "Inkomstenvrijlating (art. 31)"],
  ["pw.premie", "Premie (art. 31 lid 2 j)"],
  ["pw.bijverdien", "Bijverdienregeling (art. 34a)"],
  ["pw.overgang", "Overgangsrecht 2027"],
  ["ib.", "Loonheffing en kortingen"],
  ["zt.", "Zorgtoeslag"],
  ["ht.", "Huurtoeslag"],
  ["kgb.", "Kindgebonden budget"],
  ["akw.", "Kinderbijslag"],
  ["kot.", "Kinderopvangtoeslag"],
  ["leiden.", "Leidse regelingen"],
];

function statustabel(params: RuweParameter[]): string {
  const jaren = [...new Set(params.map((p) => p.geldig_van.slice(0, 4)))].sort();
  const regels = ["| Onderwerp | " + jaren.join(" | ") + " |", "| --- | " + jaren.map(() => "---").join(" | ") + " |"];
  for (const [prefix, naam] of ONDERWERPEN) {
    const cellen = jaren.map((jaar) => {
      const lijst = params.filter((p) => p.id.startsWith(prefix) && p.geldig_van.startsWith(jaar));
      if (!lijst.length) return "–";
      const telling = STATUS_ORDE.map((s) => [s, lijst.filter((p) => p.status === s).length] as const).filter(([, n]) => n > 0);
      return telling.length === 1 ? telling[0][0] : telling.map(([s, n]) => `${n} ${s}`).join(", ");
    });
    regels.push(`| ${naam} | ${cellen.join(" | ")} |`);
  }
  return regels.join("\n");
}

function schrijf(pad: string, inhoud: string): boolean {
  const oud = (() => {
    try {
      return readFileSync(pad, "utf8");
    } catch {
      return "";
    }
  })();
  if (oud === inhoud) return false;
  if (!check) writeFileSync(pad, inhoud);
  return true;
}

const gewijzigd: string[] = [];
if (schrijf(`${wortel}docs/PROEFPERSONEN.md`, proefpersonenDoc())) gewijzigd.push("docs/PROEFPERSONEN.md");

const rekenregels = readFileSync(`${wortel}docs/REKENREGELS.md`, "utf8");
const begin = "<!-- statustabel:begin -->";
const eind = "<!-- statustabel:eind -->";
if (!rekenregels.includes(begin) || !rekenregels.includes(eind)) throw new Error("REKENREGELS.md mist de markeringen voor de statustabel");
const nieuw =
  rekenregels.slice(0, rekenregels.indexOf(begin) + begin.length) +
  "\n<!-- Gegenereerd met `npm run docs` uit regels/**.yaml. Niet met de hand aanpassen. -->\n\n" +
  statustabel(ruweParameters) +
  "\n\n" +
  rekenregels.slice(rekenregels.indexOf(eind));
if (schrijf(`${wortel}docs/REKENREGELS.md`, nieuw)) gewijzigd.push("docs/REKENREGELS.md");

if (check && gewijzigd.length) {
  console.error(`Niet bijgewerkt: ${gewijzigd.join(", ")}. Draai 'npm run docs' en commit het resultaat.`);
  process.exit(1);
}
console.log(gewijzigd.length ? `Bijgewerkt: ${gewijzigd.join(", ")}` : "Documentatie is bijgewerkt.");
