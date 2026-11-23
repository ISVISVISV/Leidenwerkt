/** Goed om te weten: hulp voor iedereen, zonder voorwaarden van Leidengeldwijzer. */
import { CITATEN } from "../citaten.ts";
import type { Context } from "./context.ts";
import type { Uitslag } from "./types.ts";

export function goedeBuur(): Uitslag {
  return {
    id: "goede_buur",
    naam: "Hulp bij uw aanvraag",
    groep: "hulp",
    kans: "info",
    waarom: "Wilt u hulp bij een aanvraag of bij uw geldzaken? Ga dan naar het Goede Buur Spreekuur. U hoeft geen afspraak te maken. De hulp is gratis.",
    aanvragen: { tekst: "Waar en wanneer", url: CITATEN.goedeBuur.url },
    bronnen: [CITATEN.goedeBuur],
  };
}

/**
 * Hulp bij schulden van de Stadsbank Leiden. Heeft iemand schulden ingevuld? Dan staat deze hulp bij wat u
 * waarschijnlijk kunt krijgen, bij de gemeente.
 */
export function stadsbank(c: Context): Uitslag {
  const schulden = c.invoer.vermogen.schulden > 0;
  return {
    id: "stadsbank",
    naam: "Hulp bij schulden",
    groep: schulden ? "gemeente" : "hulp",
    kans: schulden ? "ja" : "info",
    waarom: schulden
      ? "U heeft schulden. De Stadsbank Leiden helpt inwoners van Leiden met schulden. Bel 14 071 en kies 1."
      : "Heeft u schulden? Of maakt u zich zorgen over geld? Dan kan de Stadsbank u helpen. Bel 14 071 en kies 1.",
    aanvragen: { tekst: "Meer informatie", url: CITATEN.stadsbank.url },
    bronnen: [CITATEN.stadsbank],
  };
}

export function voedselbank(): Uitslag {
  return {
    id: "voedselbank",
    naam: "Voedselbank",
    groep: "hulp",
    kans: "info",
    waarom: "Zijn boodschappen te duur? Dan kunt u misschien naar de Voedselbank. De Voedselbank bepaalt zelf de voorwaarden.",
    aanvragen: { tekst: "Meer informatie", url: CITATEN.voedselbank.url },
    bronnen: [CITATEN.voedselbank],
  };
}
