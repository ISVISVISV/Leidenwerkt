/** Regelingen van de Sociale Verzekeringsbank: de AIO-aanvulling en de kinderbijslag. */
import { CITATEN } from "../citaten.ts";
import { NUL, euro } from "../geld.ts";
import { URL, bron, heel, vermogenToets, type MogelijkeUitslag } from "./basis.ts";
import type { Context } from "./context.ts";

/**
 * AIO-aanvulling: de bijstand voor wie de AOW-leeftijd heeft, ook als de partner die nog niet heeft.
 * Zelfde toets als de bijstand: inkomen onder de norm van art. 22 Pw, geld en bezit onder de grens van art. 34 Pw.
 */
export function aio(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  if (invoer.bijstand || !c.metAow) return undefined;
  const basis = {
    id: "aio",
    naam: "AIO-aanvulling",
    groep: "svb" as const,
    wat: "Heeft u geen volledige AOW? En heeft u weinig ander inkomen? Dan vult de SVB uw inkomen aan. Dit heet de AIO-aanvulling.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: CITATEN.aioWie.url },
    bronnen: [
      CITATEN.aioWie,
      ...bron(l, "pw.norm.aow.alleenstaande"),
      ...bron(l, "pw.vermogensgrens.alleenstaande"),
      ...(invoer.vermogen.voertuigen.length > 0 ? bron(l, "leiden.vermogen.voertuig_vrij") : []),
    ],
  };
  const t = c.toets();
  const bronnen = c.metGrensBronnen(basis.bronnen, t);
  if (t.kans === "nee") return { ...basis, bronnen, kans: "nee", waarom: `Uw inkomen is hoger dan het sociaal minimum voor mensen met AOW.${c.grensZin(t)}` };
  const v = vermogenToets(l, invoer, c.vermogensgrensBijstand);
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}. Dan moet u eerst dat geld gebruiken.` };
  const zeker = t.grens && !t.boven && v.kans === "ja" && !c.bedrijf && (invoer.wonen === "huur" || invoer.wonen === "kamer");
  if (zeker) return { ...basis, bronnen, kans: "ja", waarom: `Uw inkomen is lager dan het sociaal minimum.${c.grensZin(t)} ${v.zin}` };
  return {
    ...basis,
    bronnen,
    kans: "misschien",
    waarom: `${t.grens && !t.boven ? `Uw inkomen is lager dan het sociaal minimum.${c.grensZin(t)}` : c.waaromInkomen(t)} ${v.zin} De SVB kijkt ook naar hoe u woont en wie er bij u wonen.`,
  };
}

/** Kinderbijslag: hangt niet af van het inkomen. Alleen tonen als iemand het nog niet krijgt. */
export function kinderbijslag(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  const kinderen = invoer.kinderen.filter((k) => k.leeftijd < 18);
  if (kinderen.length === 0 || invoer.kinderbijslag !== false) return undefined;
  const perKwartaal = kinderen.reduce((s, k) => s.plus(l.bedrag(k.leeftijd <= 5 ? "akw.kwartaal.0_5" : k.leeftijd <= 11 ? "akw.kwartaal.6_11" : "akw.kwartaal.12_17")), NUL);
  return {
    id: "kinderbijslag",
    naam: "Kinderbijslag",
    groep: "svb",
    kans: "ja",
    bedrag: `${euro(perKwartaal)} per kwartaal`,
    wat: "Kinderbijslag is geld voor uw kinderen tot 18 jaar. U vraagt het aan bij de Sociale Verzekeringsbank.",
    waarom: "U heeft kinderen jonger dan 18 jaar. U krijgt nog geen kinderbijslag. Uw inkomen maakt niet uit.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.kinderbijslag },
    bronnen: [CITATEN.kinderbijslagWie, ...bron(l, "akw.kwartaal.0_5")],
  };
}
