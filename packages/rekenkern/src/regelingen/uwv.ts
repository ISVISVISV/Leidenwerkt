/**
 * Toeslag van UWV (Toeslagenwet): vult een uitkering van UWV aan tot het sociaal minimum, bruto. Nooit "ja": UWV kijkt
 * naar het bruto inkomen per dag, en Leidengeldwijzer rekent het bruto inkomen terug uit het netto inkomen.
 */
import { CITATEN } from "../citaten.ts";
import { D } from "../geld.ts";
import { bron, heel, probeer, toetsingsinkomen, type MogelijkeUitslag } from "./basis.ts";
import type { Context } from "./context.ts";
import type { CheckPersoon } from "./types.ts";

export function tw(c: Context): MogelijkeUitslag {
  const { l, invoer, paar } = c;
  const metUwv = c.personen.filter((p) => !p.aow && (p.inkomen.uwv ?? 0) > 0);
  if (metUwv.length === 0) return undefined;
  const leeftijd = Math.min(...metUwv.map((p) => p.leeftijd));
  const minimumId = paar
    ? "tw.sociaal_minimum.gehuwd"
    : leeftijd < 21
      ? `tw.sociaal_minimum.alleenstaand_${Math.max(18, leeftijd)}`
      : c.kostendelers > 0
        ? "tw.sociaal_minimum.woningdeler"
        : "tw.sociaal_minimum.alleenstaand";
  const basis = {
    id: "tw",
    naam: "Toeslag van UWV",
    groep: "uwv" as const,
    wat: "Is uw bruto inkomen lager dan het sociaal minimum? Dan vult UWV uw uitkering misschien aan. Dit heet een toeslag.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: CITATEN.twWie.url },
    bronnen: [CITATEN.twWie, ...bron(l, minimumId)],
  };
  // Geen toeslag met een partner die na 1971 is geboren, als er geen kind jonger dan 12 bij u woont.
  const kindOnder12 = invoer.kinderen.some((k) => k.leeftijd < 12);
  const partnerVan = (p: CheckPersoon) => (p === invoer.aanvrager ? invoer.partner : invoer.aanvrager);
  if (paar && !kindOnder12 && metUwv.every((p) => partnerVan(p)?.geborenNa1971))
    return {
      ...basis,
      kans: "nee",
      waarom: "U woont samen met een partner die na 1971 is geboren. En er wonen geen kinderen jonger dan 12 jaar bij u. Dan kunt u geen toeslag van UWV krijgen.",
    };
  const minimum = l.bedrag(minimumId);
  const grens = ` Het sociaal minimum is ${heel(minimum)} bruto per maand${paar ? " voor u samen" : ""}.`;
  // Het bruto inkomen per maand zonder vakantiegeld (8%), uit hetzelfde bruto inkomen als voor de toeslagen.
  const ti = probeer(() => toetsingsinkomen(l, invoer, c.personen));
  const brutoMaand = ti?.div(12).div(D("1.08"));
  if (brutoMaand && brutoMaand.gt(minimum))
    return { ...basis, kans: "nee", waarom: `Uw bruto inkomen is ongeveer ${heel(brutoMaand)} per maand. Dat is meer dan het sociaal minimum van UWV.${grens}` };
  return {
    ...basis,
    kans: "misschien",
    waarom: brutoMaand
      ? `U krijgt een uitkering van UWV. Uw bruto inkomen is ongeveer ${heel(brutoMaand)} per maand. Dat is niet meer dan het sociaal minimum.${grens} UWV kijkt naar uw bruto inkomen per dag. Leidengeldwijzer schat het bruto inkomen uit het netto inkomen. Daarom weet Leidengeldwijzer het niet zeker.`
      : `U krijgt een uitkering van UWV.${grens} Leidengeldwijzer kan uw bruto inkomen niet uitrekenen. UWV rekent uit of u de toeslag krijgt.`,
  };
}
