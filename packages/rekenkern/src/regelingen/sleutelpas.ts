/**
 * De Sleutelpas en wat erop staat (Beleidsregels Sleutelpas 2026 van de gemeente Leiden):
 * de pas zelf, het Kindtegoed, de laptop, zwemles en het Volwassenenfonds Sport & Cultuur.
 */
import { CITATEN } from "../citaten.ts";
import { NUL } from "../geld.ts";
import { URL, bron, heel, type MogelijkeUitslag } from "./basis.ts";
import type { Context } from "./context.ts";
import type { Kans } from "./types.ts";

/** Sleutelpas: tot 130%, niet in een instelling, niet voor studenten zonder kind. */
export function sleutelpas(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  const t = c.toets("leiden.sleutelpas.inkomensgrens");
  const bronnen = [...bron(l, "leiden.sleutelpas.inkomensgrens"), CITATEN.sleutelpasWie];
  const basis = {
    id: "sleutelpas",
    naam: "Sleutelpas",
    groep: "gemeente" as const,
    wat: "Met de Sleutelpas krijgt u korting op sport, cultuur en uitjes.",
    bronnen,
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.sleutelpas },
  };
  if (invoer.wonen === "instelling") return { ...basis, kans: "nee", waarom: "U woont in een instelling. Dan kunt u de Sleutelpas niet krijgen." };
  if (c.studeert && c.minderjarig.length === 0)
    return { ...basis, kans: "nee", waarom: "U krijgt studiefinanciering. Dan kunt u de Sleutelpas niet krijgen. Dat kan wel als u ook voor een kind zorgt." };
  if (invoer.bijstand && !c.metAow) return { ...basis, kans: "ja", waarom: "Met bijstand krijgt u de Sleutelpas vanzelf. U hoeft hem niet aan te vragen." };
  // De AIO-aanvulling komt van de SVB. Art. 3.1 noemt die niet bij wie de pas vanzelf krijgt. Bij de aanvraag is de
  // laatste maandspecificatie genoeg (toelichting bij art. 4.3).
  if (invoer.bijstand && c.metAow)
    return {
      ...basis,
      // Kan Leidengeldwijzer de grens niet uitrekenen (een partner van 18, 19 of 20 jaar)? Dan misschien.
      kans: t.grens ? "ja" : "misschien",
      bronnen: c.metGrensBronnen([...bronnen, CITATEN.sleutelpasSpecificatie], t),
      waarom: `${c.waaromInkomen(t)} Vraag de pas aan. Stuur de laatste maandspecificatie van uw AIO-aanvulling mee.`,
    };
  const kans = c.kansMetBedrijf(t);
  const waarom = c.waaromMetBedrijf(t);
  // Art. 2.3 b en c: met een schuldregeling (MSNP) of in de Wsnp heeft iemand geen draagkracht, ook boven 130%.
  if (t.boven)
    return {
      ...basis,
      kans,
      bronnen: c.metGrensBronnen([...bronnen, CITATEN.sleutelpasSchuld], t),
      waarom: `${waarom} Heeft u een schuldregeling? Dan kunt u de Sleutelpas misschien toch krijgen.`,
    };
  return { ...basis, kans, bronnen: c.metGrensBronnen(bronnen, t), waarom };
}

/** Kindtegoed (art. 2.2): per kind jonger dan 18 met kinderbijslag, tot 140%. Tussen 130% en 140% zonder gratis pas. */
export function kindtegoed(c: Context): MogelijkeUitslag {
  const { l, invoer, minderjarig } = c;
  if (minderjarig.length === 0) return undefined;
  const t = c.toets("leiden.kindtegoed.inkomensgrens");
  const perKind = (k: { leeftijd: number }) =>
    l.bedrag(k.leeftijd <= 3 ? "leiden.kindtegoed.0_3" : k.leeftijd <= 11 ? "leiden.kindtegoed.4_11" : "leiden.kindtegoed.12_17");
  const totaal = minderjarig.reduce((s, k) => s.plus(perKind(k)), NUL);
  const bronnen = [...bron(l, "leiden.kindtegoed.0_3"), CITATEN.kindtegoedKind];
  const basis = {
    id: "kindtegoed",
    naam: "Kindtegoed",
    groep: "gemeente" as const,
    bedrag: `${heel(totaal)} per jaar`,
    wat: "U krijgt geld op de Sleutelpas. Daarmee betaalt u schoolspullen, sport en cultuur voor uw kinderen.",
    bronnen,
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.sleutelpas },
  };
  if (invoer.kinderbijslag === false)
    return { ...basis, kans: "nee", waarom: "Het Kindtegoed is alleen voor kinderen voor wie u kinderbijslag of een pleegkindvergoeding krijgt." };
  return {
    ...basis,
    kans: c.kansMetBedrijf(t),
    bronnen: c.metGrensBronnen(bronnen, t),
    waarom: c.waaromMetBedrijf(t),
  };
}

/** Laptop (art. 3.2): op de Sleutelpas, voor kinderen van 4 tot en met 17 jaar. */
export function laptop(c: Context): MogelijkeUitslag {
  const { l, invoer, minderjarig } = c;
  const schoolkinderen = minderjarig.filter((k) => k.leeftijd >= 4);
  if (schoolkinderen.length === 0) return undefined;
  const t = c.toets("leiden.sleutelpas.inkomensgrens");
  const termijn = l.aantal("leiden.laptop.termijn").toString();
  const middelbaar = schoolkinderen.filter((k) => k.leeftijd >= 12).length;
  const aantal = middelbaar + (schoolkinderen.length > middelbaar ? 1 : 0);
  const sleutelpasNee = invoer.wonen === "instelling" || (c.studeert && minderjarig.length === 0);
  const kans: Kans = sleutelpasNee ? "nee" : c.bedrijf && t.kans !== "nee" ? "misschien" : invoer.bijstand ? "ja" : t.kans;
  // De bon staat op de Sleutelpas: de reden is die van de Sleutelpas.
  const vanzelf = invoer.bijstand && !c.metAow && kans === "ja";
  const viaGrens = !sleutelpasNee && !vanzelf;
  const waarom = sleutelpasNee
    ? "De bon staat op de Sleutelpas. U woont in een instelling. Dan kunt u de Sleutelpas niet krijgen."
    : vanzelf
      ? "Met bijstand krijgt u de Sleutelpas vanzelf. De bon staat op de pas."
      : c.waaromMetBedrijf(t);
  return {
    id: "laptop",
    naam: "Laptop voor school",
    groep: "gemeente",
    kans,
    bedrag: aantal === 1 ? `1 laptop per ${termijn} jaar` : `${aantal} laptops per ${termijn} jaar`,
    wat: "Op de Sleutelpas staat een bon voor een laptop. Kinderen van 4 tot en met 11 jaar krijgen samen 1 laptop. Kinderen van 12 tot en met 17 jaar krijgen elk een laptop.",
    waarom,
    aanvragen: { tekst: "Meer informatie", url: URL.sleutelpas },
    bronnen: viaGrens ? c.metGrensBronnen([...bron(l, "leiden.laptop.termijn"), ...bron(l, "leiden.sleutelpas.inkomensgrens")], t) : bron(l, "leiden.laptop.termijn"),
  };
}

/** Zwemles (art. 3.3): kinderen vanaf 5 jaar, tot 140%. */
export function zwemles(c: Context): MogelijkeUitslag {
  const { l, minderjarig } = c;
  if (minderjarig.length === 0) return undefined;
  const vanaf = l.aantal("leiden.zwemles.minimumleeftijd");
  if (!minderjarig.some((k) => vanaf.lte(k.leeftijd))) return undefined;
  const t = c.toets("leiden.zwemles.inkomensgrens");
  const bc = heel(l.bedrag("leiden.zwemles.diploma_bc"));
  return {
    id: "zwemles",
    naam: "Zwemles",
    groep: "gemeente",
    kans: c.kansMetBedrijf(t),
    bedrag: `Diploma A: alles betaald. Diploma B of C: ${bc}.`,
    wat: `Dit is voor kinderen vanaf ${vanaf.toString()} jaar. U vraagt het aan bij het Jeugdfonds Sport & Cultuur.`,
    waarom: c.waaromMetBedrijf(t),
    aanvragen: { tekst: "Meer informatie", url: URL.sportCultuur },
    bronnen: c.metGrensBronnen(bron(l, "leiden.zwemles.inkomensgrens"), t),
  };
}

/** Volwassenenfonds Sport & Cultuur (art. 3.4): vanaf 18 jaar, tot 120%. */
export function volwassenenfonds(c: Context): MogelijkeUitslag {
  const { l } = c;
  const t = c.toets("leiden.volwassenenfonds.inkomensgrens");
  return {
    id: "volwassenenfonds",
    naam: "Sport en cultuur voor volwassenen",
    groep: "gemeente",
    kans: c.kansMetBedrijf(t),
    bedrag: `tot ${heel(l.bedrag("leiden.volwassenenfonds.maximum"))} per jaar`,
    wat: "Het Volwassenenfonds Sport & Cultuur betaalt een sport of activiteit voor u. U vraagt het aan via een tussenpersoon.",
    waarom: c.waaromMetBedrijf(t),
    aanvragen: { tekst: "Meer informatie", url: URL.sportCultuur },
    bronnen: c.metGrensBronnen([...bron(l, "leiden.volwassenenfonds.inkomensgrens"), CITATEN.volwassenentegoed], t),
  };
}
