/**
 * Regimes voor de verrekening van inkomsten uit arbeid met de bijstand.
 *
 * Een gewijzigd bedrag is regeldata (regels/**.yaml). Een gewijzigd
 * mechanisme (voorwaarden, uitzonderingen, volgorde) is een regime met een
 * eigen ingangsdatum. De keuze hangt alleen af van de rekendatum, niet van
 * welke parameters toevallig bestaan.
 */
export type RegimeId = "pw31" | "pw34a";

export interface Regime {
  id: RegimeId;
  /** Eerste dag waarop het regime geldt (JJJJ-MM-DD). */
  vanaf: string;
  naam: string;
  grondslag: string;
}

/** Op volgorde van ingangsdatum. Een nieuw regime komt onderaan. */
export const REGIMES: readonly Regime[] = [
  {
    id: "pw31",
    vanaf: "2015-01-01",
    naam: "Inkomstenvrijlating (tot en met 2026)",
    grondslag: "Participatiewet art. 31 lid 2 onder n, r en y",
  },
  {
    id: "pw34a",
    vanaf: "2027-01-01",
    naam: "Bijverdienregeling (vanaf 2027)",
    grondslag: "Participatiewet art. 34a, overgangsrecht art. 78ff (Participatiewet in balans)",
  },
];

export function regimeOp(datum: string): Regime {
  let gekozen = REGIMES[0];
  for (const r of REGIMES) if (r.vanaf <= datum) gekozen = r;
  return gekozen;
}

/** Laatste dag voor de ingang van een regime (voor overgangsrecht). */
export function dagVoor(regime: Regime): string {
  const d = new Date(`${regime.vanaf}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Datum + aantal maanden (JJJJ-MM-DD), voor de duur van overgangsrecht. */
export function plusMaanden(datum: string, maanden: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + maanden);
  return d.toISOString().slice(0, 10);
}
