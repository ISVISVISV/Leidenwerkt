/**
 * Welke regelingen kan iemand in Leiden krijgen? Rekenkern van Leidengeldwijzer, de tweede app.
 *
 * Elke regeling geeft een uitslag: waarschijnlijk wel ("ja"), misschien, of waarschijnlijk niet ("nee"), met de reden
 * in gewone taal en de letterlijke bron. De voorwaarden staan in docs/RECHT.md (deel 2), de bedragen en grenzen in
 * regels/**\/*.yaml.
 *
 * "Misschien" betekent: Leidengeldwijzer weet het niet zeker. Bijvoorbeeld omdat iemand "Weet ik niet" antwoordde, of omdat
 * Leidengeldwijzer een situatie niet uitrekent (andere mensen in huis, inkomen uit een eigen bedrijf). Leidengeldwijzer zegt dan wat
 * er nog open is.
 */
import { Lezer, standaardRegels, type RegelSet } from "./regels.ts";
import { probeer, type MogelijkeUitslag } from "./regelingen/basis.ts";
import { maakContext, type Context } from "./regelingen/context.ts";
import { metMeenemen } from "./regelingen/meenemen.ts";
import { bijstand, bijzondereBijstand, alleenverdieners, gemeentepolis, iit, kwijtschelding, ovpas, smi, studietoeslag } from "./regelingen/gemeente.ts";
import { goedeBuur, stadsbank, voedselbank } from "./regelingen/hulp.ts";
import { kindtegoed, laptop, sleutelpas, volwassenenfonds, zwemles } from "./regelingen/sleutelpas.ts";
import { aio, kinderbijslag } from "./regelingen/svb.ts";
import { huurtoeslag, kgb, kot, maakToeslagContext, zorgtoeslag } from "./regelingen/toeslagen.ts";
import { tw } from "./regelingen/uwv.ts";
import type { CheckInvoer, Uitslag } from "./regelingen/types.ts";

export { heeftAowLeeftijd, sociaalMinimum, telbaarVermogen } from "./regelingen/basis.ts";
export type * from "./regelingen/types.ts";

/*
 * Elke regeling staat in een bestand van de organisatie die haar geeft. Daar staan ook de voorwaarden en de teksten.
 * - regelingen/sleutelpas.ts: de Sleutelpas, het Kindtegoed, de laptop, zwemles en het Volwassenenfonds.
 * - regelingen/gemeente.ts: de andere regelingen van de gemeente Leiden, en de bijstand.
 * - regelingen/hulp.ts: hulp voor iedereen.
 * - regelingen/svb.ts: de AIO-aanvulling en de kinderbijslag.
 * - regelingen/uwv.ts: de toeslag van UWV.
 * - regelingen/toeslagen.ts: de toeslagen van Dienst Toeslagen.
 * - regelingen/meenemen.ts: wat u nodig heeft voor de aanvraag, per regeling.
 * Wat alle regelingen delen (het huishouden, het inkomen, de grens) staat in regelingen/context.ts en regelingen/basis.ts.
 */

/** De volgorde van de uitslagen. De app groepeert ze per organisatie. */
const REGELINGEN: ((c: Context) => MogelijkeUitslag)[] = [
  sleutelpas,
  kindtegoed,
  laptop,
  zwemles,
  volwassenenfonds,
  gemeentepolis,
  ovpas,
  iit,
  alleenverdieners,
  studietoeslag,
  smi,
  kwijtschelding,
  bijzondereBijstand,
  goedeBuur,
  stadsbank,
  voedselbank,
  aio,
  tw,
  bijstand,
];

export function checkRegelingen(invoer: CheckInvoer, regels: RegelSet = standaardRegels): Uitslag[] {
  const c = maakContext(new Lezer(regels, invoer.datum), invoer);
  const z = maakToeslagContext(c);
  const toeslagen = [zorgtoeslag, kgb, huurtoeslag, kinderbijslag, kot].map((r) => (ctx: Context) => r(ctx, z));
  return [...REGELINGEN, ...toeslagen]
    .map((r) => probeer(() => r(c)))
    .filter((u): u is Uitslag => !!u)
    .map((u) => metMeenemen(u, c));
}
