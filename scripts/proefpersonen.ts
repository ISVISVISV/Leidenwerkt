/**
 * Proefpersonen: fictieve huishoudens in testgevallen/*.yaml, met per
 * onderdeel een officiële vergelijkingswaarde (of 'onbekend').
 *
 * Gebruikt door de test (packages/engine/test/proefpersonen.test.ts), door
 * docs/PROEFPERSONEN.md (npm run proefpersonen) en door het overzicht bij
 * pull requests (scripts/pr-overzicht.ts).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { bereken, standaardRegels, type Invoer, type RegelSet, type Resultaat } from "../packages/engine/src/index.ts";

export const ONDERDELEN = {
  netto_loon: { post: "loon", label: "Netto loon" },
  bijstand: { post: "bijstand", label: "Bijstand" },
  zorgtoeslag: { post: "zorgtoeslag", label: "Zorgtoeslag" },
  huurtoeslag: { post: "huurtoeslag", label: "Huurtoeslag" },
  kindgebonden_budget: { post: "kgb", label: "Kindgebonden budget" },
  kinderopvangtoeslag: { post: "kot", label: "Kinderopvangtoeslag" },
  kinderbijslag: { post: "kinderbijslag", label: "Kinderbijslag" },
} as const;
export type Onderdeel = keyof typeof ONDERDELEN;

const Verwacht = z
  .object({
    onderdeel: z.enum(Object.keys(ONDERDELEN) as [Onderdeel, ...Onderdeel[]]),
    situatie: z.enum(["nu", "met_werk"]),
    waarde: z.union([z.number(), z.literal("onbekend")]),
    tolerantie: z.number().min(0).optional(),
    bron: z.object({ titel: z.string(), url: z.string().url(), datum: z.string() }).optional(),
    toelichting: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.waarde !== "onbekend" && (!v.bron || v.tolerantie === undefined)) {
      ctx.addIssue({ code: "custom", message: `${v.onderdeel}/${v.situatie}: een officiële waarde vraagt een bron en een tolerantie` });
    }
  });

export const Proefpersoon = z.object({
  naam: z.string(),
  beschrijving: z.string().min(20),
  rekendatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  invoer: z.record(z.string(), z.unknown()),
  verwacht: z.array(Verwacht),
  signaal_bevat: z.array(z.string()).optional(),
  opmerking: z.string().optional(),
});
export type Proefpersoon = z.infer<typeof Proefpersoon> & { bestand: string };

const map = new URL("../testgevallen/", import.meta.url).pathname;

export function laadProefpersonen(): Proefpersoon[] {
  return readdirSync(map)
    .filter((n) => n.endsWith(".yaml"))
    .sort()
    .map((bestand) => {
      const res = Proefpersoon.safeParse(parse(readFileSync(join(map, bestand), "utf8")));
      if (!res.success) throw new Error(`${bestand}: ${res.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      return { ...res.data, bestand };
    });
}

export function invoerVan(p: Proefpersoon): Invoer {
  return { ...(p.invoer as unknown as Invoer), datum: p.rekendatum, gemeente: "leiden" };
}

export interface Vergelijking {
  onderdeel: Onderdeel;
  label: string;
  situatie: "nu" | "met_werk";
  berekend: number | null;
  verwacht: number | "onbekend";
  verschil: number | null;
  tolerantie?: number;
  binnen: boolean | null;
  bron?: { titel: string; url: string; datum: string };
  toelichting?: string;
}

export interface Uitkomst {
  persoon: Proefpersoon;
  resultaat: Resultaat;
  vergelijkingen: Vergelijking[];
  signaalFouten: string[];
}

export function draai(p: Proefpersoon, regels: RegelSet = standaardRegels): Uitkomst {
  const r = bereken(invoerVan(p), regels);
  const vergelijkingen = p.verwacht.map((v): Vergelijking => {
    const situatie = v.situatie === "nu" ? r.huidig : r.werk;
    const post = situatie.posten.find((x) => x.id === ONDERDELEN[v.onderdeel].post);
    const berekend = post?.perMaand != null ? Number(post.perMaand) : post ? null : 0;
    const verschil = v.waarde === "onbekend" || berekend === null ? null : Math.round((berekend - v.waarde) * 100) / 100;
    return {
      onderdeel: v.onderdeel,
      label: ONDERDELEN[v.onderdeel].label,
      situatie: v.situatie,
      berekend,
      verwacht: v.waarde,
      verschil,
      tolerantie: v.tolerantie,
      binnen: v.waarde === "onbekend" ? null : verschil !== null && Math.abs(verschil) <= (v.tolerantie ?? 0) + 1e-9,
      bron: v.bron,
      toelichting: v.toelichting,
    };
  });
  const teksten = r.signalen.map((s) => s.tekst).join("\n");
  const signaalFouten = (p.signaal_bevat ?? []).filter((t) => !teksten.includes(t)).map((t) => `signaal met "${t}" ontbreekt`);
  return { persoon: p, resultaat: r, vergelijkingen, signaalFouten };
}

/** Korte samenvatting voor snapshots en het PR-overzicht. */
export function samenvatting(u: Uitkomst) {
  const posten = (s: Resultaat["huidig"]) => Object.fromEntries(s.posten.map((p) => [p.id, p.perMaand]));
  return { nu: posten(u.resultaat.huidig), met_werk: posten(u.resultaat.werk), verschil: u.resultaat.verschilPerMaand };
}
