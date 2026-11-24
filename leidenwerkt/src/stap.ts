/** Wat alle stappen van het formulier delen. */
import type { Fouten, Formulier, JaNeeVraag } from "./formulier.ts";

export type StapProps = { f: Formulier; zet: <K extends keyof Formulier>(k: K, v: Formulier[K]) => void; fouten: Fouten };

/** Een ja/nee-vraag heeft geen antwoord vooraf; pas na een keuze telt de waarde als beantwoord. */
export const antwoordHulp =
  (f: Formulier, zet: StapProps["zet"]) =>
  (vraag: JaNeeVraag, fn: (v: string) => void) =>
  (v: string) => {
    zet("beantwoord", { ...f.beantwoord, [vraag]: true });
    fn(v);
  };
