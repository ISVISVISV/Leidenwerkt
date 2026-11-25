/**
 * "Als u het nodig heeft": hulp die afhangt van uw situatie. Leidengeldwijzer kan niet uitrekenen of u het krijgt.
 * Volgorde op de pagina: hulp bij uw aanvraag, bijzondere bijstand (gemeente.ts), hulp bij schulden, de Voedselbank.
 */
import { CITATEN } from "../citaten.ts";
import { D } from "../geld.ts";
import { bron, heel } from "./basis.ts";
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

/** Hulp bij schulden van de Stadsbank Leiden. Voor iedereen in Leiden, zonder voorwaarden. */
export function stadsbank(c: Context): Uitslag {
  const basis = {
    id: "stadsbank",
    naam: "Hulp bij schulden",
    aanvragen: { tekst: "Meer informatie", url: CITATEN.stadsbank.url },
    bronnen: [CITATEN.stadsbank],
  };
  // Met schulden: bij de gemeente, bij wat u waarschijnlijk kunt krijgen. Anders bij "Als u het nodig heeft".
  // Nooit op twee plekken (besluit 42).
  if (c.invoer.vermogen.schulden > 0)
    return {
      ...basis,
      groep: "gemeente",
      kans: "ja",
      wat: "De Stadsbank Leiden helpt inwoners van Leiden met schulden. Bel 14 071 en kies 1.",
      waarom: "U heeft schulden.",
    };
  return {
    ...basis,
    groep: "hulp",
    kans: "info",
    waarom: "Heeft u schulden? Of maakt u zich zorgen over geld? Dan kan de Stadsbank u helpen. Bel 14 071 en kies 1.",
  };
}

/**
 * De Voedselbank Leiden: na de vaste lasten mag iemand niet meer dan het normbedrag overhouden (basis plus een bedrag
 * per persoon). Leidengeldwijzer vraagt niet naar de vaste lasten. Daarom noemt het alleen de grens voor dit huishouden.
 * Wie er meetelt als "persoon in uw huishouden": u, uw partner en uw kinderen. Andere bewoners: dat bepaalt de Voedselbank.
 */
export function voedselbank(c: Context): Uitslag {
  const { l, invoer } = c;
  const aantal = c.personen.length + invoer.kinderen.length;
  const grens = l.bedrag("leiden.voedselbank.basis").plus(l.bedrag("leiden.voedselbank.per_persoon").times(D(aantal)));
  return {
    id: "voedselbank",
    naam: "Voedselbank",
    groep: "hulp",
    kans: "info",
    waarom: `De Voedselbank geeft een pakket met eten als u weinig geld overhoudt. Na het betalen van uw vaste lasten mag u niet meer dan ${heel(grens)} per maand overhouden. Dat is de grens voor ${aantal === 1 ? "1 persoon" : `uw huishouden van ${aantal} personen`}. Vaste lasten zijn bijvoorbeeld huur, energie, water, verzekeringen en aflossingen.${invoer.andereBewoners ? " Wonen er nog anderen bij u? Vraag de Voedselbank of zij meetellen." : ""} De Voedselbank rekent het met u uit.`,
    aanvragen: { tekst: "Meer informatie", url: "https://voedselbankleiden.nl/ik-zoek-hulp/waaraan-moet-je-voldoen/" },
    bronnen: [CITATEN.voedselbank, ...bron(l, "leiden.voedselbank.basis")],
  };
}
