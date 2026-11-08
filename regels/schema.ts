/**
 * Schema voor regeldata. Elk YAML-bestand onder regels/ beschrijft één
 * geldigheidsperiode met een lijst parameters. Zie docs/ONDERHOUD.md.
 */
import { z } from "zod";

const datum = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "datum moet de vorm JJJJ-MM-DD hebben");

/** Getallen worden als tekst bewaard zodat er geen afrondingsfouten ontstaan. */
const getal = z
  .union([z.number(), z.string()])
  .transform((v) => String(v))
  .refine((v) => /^-?\d+(\.\d+)?$/.test(v), "ongeldig getal");

export const Status = z.enum(["geverifieerd", "onbevestigd", "ontbrekend"]);
export type Status = z.infer<typeof Status>;

export const Bron = z.object({
  titel: z.string().min(3),
  url: z.string().url(),
  geraadpleegd_op: datum,
});

/**
 * Letterlijke tekst uit de bron, voor de pop-up in de app. Alleen tekst die
 * woord voor woord in de officiële bron staat. 'url' kan naar een artikel wijzen.
 */
export const Citaat = z.object({
  kop: z.string().min(3),
  tekst: z.string().min(10),
  url: z.string().url().optional(),
  /** Welke versie van de tekst, bijvoorbeeld "geldend vanaf 1 juli 2026". */
  versie: z.string().optional(),
});

const Schijf = z.object({
  vanaf: getal,
  tot: getal.nullable(),
  /** Bedrag aan het begin van de schijf (bijv. arbeidskorting € 996). */
  basis: getal.default("0"),
  /** Percentage als breuk: 0,3575 voor 35,75%. */
  percentage: getal,
});

const KotRij = z.object({
  vanaf: getal,
  tot: getal.nullable(),
  eerste_kind: getal,
  volgend_kind: getal,
});

const Waarde = z.union([
  z.object({ soort: z.literal("bedrag"), bedrag: getal }),
  z.object({ soort: z.literal("percentage"), breuk: getal }),
  z.object({ soort: z.literal("aantal"), aantal: getal }),
  z.object({ soort: z.literal("schijven"), schijven: z.array(Schijf).min(1) }),
  z.object({ soort: z.literal("kot_tabel"), rijen: z.array(KotRij).min(1) }),
]);

export const Parameter = z
  .object({
    id: z.string().regex(/^[a-z0-9_.]+$/, "id: kleine letters, cijfers, punt, underscore"),
    omschrijving: z.string().min(5),
    eenheid: z.enum([
      "euro_per_maand",
      "euro_per_jaar",
      "euro_per_kwartaal",
      "euro_per_uur",
      "breuk",
      "jaren",
      "maanden",
      "uren_per_maand",
      "tabel",
    ]),
    waarde: Waarde.optional(),
    status: Status,
    bron: Bron.optional(),
    citaat: Citaat.optional(),
    notitie: z.string().optional(),
  })
  .superRefine((p, ctx) => {
    if (p.status !== "ontbrekend" && !p.waarde) {
      ctx.addIssue({ code: "custom", message: `${p.id}: waarde verplicht tenzij status 'ontbrekend'` });
    }
    if (p.status !== "ontbrekend" && !p.bron) {
      ctx.addIssue({ code: "custom", message: `${p.id}: bron verplicht tenzij status 'ontbrekend'` });
    }
  });

export const RegelBestand = z.object({
  gebied: z.string(),
  geldig_van: datum,
  /** Laatste dag waarop het bestand geldt (inclusief). Leeg = tot het volgende bestand. */
  geldig_tot: datum.nullable(),
  parameters: z.array(Parameter).min(1),
});

export type RegelBestand = z.infer<typeof RegelBestand>;
export type ParameterDef = z.infer<typeof Parameter>;
