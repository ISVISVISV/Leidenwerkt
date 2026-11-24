/**
 * Regelingen van de gemeente Leiden, naast de Sleutelpas: de Gemeentepolis, de gratis OV-pas, de inkomenstoeslag,
 * de tegemoetkoming voor alleenverdieners, de studietoeslag, kinderopvang (SMI), kwijtschelding, bijzondere bijstand en bijstand.
 */
import { CITATEN } from "../citaten.ts";
import { euro } from "../geld.ts";
import { URL, bron, heel, vermogenToets, type MogelijkeUitslag } from "./basis.ts";
import type { Context } from "./context.ts";

/** Gemeentepolis: tot 120%. Ondernemers: een jaargrens die Leidengeldwijzer niet uitrekent. */
export function gemeentepolis(c: Context): MogelijkeUitslag {
  const t = c.toets("leiden.gemeentepolis.inkomensgrens");
  return {
    id: "gemeentepolis",
    naam: "Zorgverzekering van de gemeente",
    groep: "gemeente",
    kans: c.kansMetBedrijf(t),
    wat: "De Gemeentepolis is de zorgverzekering van de gemeente. Er zit een aanvullende verzekering bij. Nieuwe klanten melden zich aan tussen 12 november en 31 december.",
    waarom: c.waaromMetBedrijf(t, " U heeft een eigen bedrijf. Voor zzp'ers geldt een grens per jaar. Leidengeldwijzer rekent dat niet uit."),
    aanvragen: { tekst: "Meer informatie", url: URL.gemeentepolis },
    bronnen: c.metGrensBronnen(bron(c.l, "leiden.gemeentepolis.inkomensgrens"), t),
  };
}

/** Gratis OV-pas: 18 jaar of ouder, geen student, niet dak- of thuisloos, bijstand of tot 100%. */
export function ovpas(c: Context): MogelijkeUitslag {
  const t = c.toets("leiden.ovpas.inkomensgrens");
  const bronnen = bron(c.l, "leiden.ovpas.inkomensgrens");
  const basis = {
    id: "ovpas",
    naam: "Gratis OV-pas",
    groep: "gemeente" as const,
    wat: "U reist gratis met de streekbus, buiten de spits. Het aantal passen is beperkt.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.ov },
    bronnen,
  };
  if (c.studeert) return { ...basis, kans: "nee", waarom: "U krijgt studiefinanciering. De gratis OV-pas is niet voor studenten." };
  if (c.invoer.wonen === "dakloos") return { ...basis, kans: "nee", waarom: "U heeft geen vaste woonplek. De gratis OV-pas is niet voor mensen zonder vaste woonplek." };
  return {
    ...basis,
    kans: c.kansMetBedrijf(t),
    bronnen: c.metGrensBronnen(bronnen, t),
    waarom: c.waaromMetBedrijf(t),
  };
}

/** Individuele inkomenstoeslag: 23 jaar of ouder, 5 jaar een inkomen tot de norm, vermogen onder de bijstandsgrens. */
export function iit(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  const minLeeftijd = l.aantal("leiden.iit.minimumleeftijd");
  const jaren = l.aantal("leiden.iit.referteperiode").toString();
  const id = c.paar ? "leiden.iit.bedrag.gehuwden" : c.metKinderen ? "leiden.iit.bedrag.alleenstaande_ouder" : "leiden.iit.bedrag.alleenstaande";
  const basis = {
    id: "iit",
    naam: "Individuele inkomenstoeslag",
    groep: "gemeente" as const,
    bedrag: `${heel(l.bedrag(id))}, één keer per 12 maanden`,
    wat: `Dit is extra geld voor mensen die al ${jaren} jaar of langer een inkomen op bijstandsniveau hebben. En die geen kans hebben op meer inkomen.`,
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.iit },
    bronnen: [...bron(l, "leiden.iit.referteperiode"), CITATEN.iitPeildatum, ...bron(l, "pw.vermogensgrens.alleenstaande")],
  };
  if (minLeeftijd.gt(invoer.aanvrager.leeftijd))
    return { ...basis, kans: "nee", waarom: `U bent jonger dan ${minLeeftijd.toString()} jaar. Deze toeslag is voor mensen van ${minLeeftijd.toString()} jaar of ouder.` };
  // Een stel telt als één geheel: beiden moeten aan art. 36 lid 1 Pw voldoen, dus jonger zijn dan de AOW-leeftijd
  // (toelichting bij art. 4 van de verordening van Leiden).
  if (c.metAow)
    return {
      ...basis,
      kans: "nee",
      waarom: c.aanvragerAow
        ? "U heeft de AOW-leeftijd. Deze toeslag is voor mensen die de AOW-leeftijd nog niet hebben."
        : "Deze toeslag is voor mensen die de AOW-leeftijd nog niet hebben. Uw partner heeft de AOW-leeftijd. Daarom kunt u deze toeslag ook niet krijgen.",
      bronnen: c.aanvragerAow ? [CITATEN.iitLeeftijd, CITATEN.iitAow] : [CITATEN.iitLeeftijd, CITATEN.iitAow, CITATEN.iitGehuwden],
    };
  if (c.studeert) return { ...basis, kans: "nee", waarom: `U krijgt studiefinanciering. Met studiefinanciering in de afgelopen ${jaren} jaar kunt u deze toeslag niet krijgen.` };
  const v = vermogenToets(l, invoer, c.vermogensgrensBijstand);
  const t = c.toets();
  if (t.kans === "nee")
    return { ...basis, kans: "nee", bronnen: c.metGrensBronnen(basis.bronnen, t), waarom: `Uw inkomen is hoger dan de bijstand.${c.grensZin(t)}` };
  if (invoer.langLaagInkomen === "nee")
    return { ...basis, kans: "nee", waarom: `U heeft nog geen ${jaren} jaar een inkomen op bijstandsniveau. U krijgt deze toeslag alleen als u al ${jaren} jaar of langer een inkomen op bijstandsniveau heeft.` };
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}.` };
  const open = invoer.langLaagInkomen !== "ja" || v.kans === "misschien" || t.kans === "misschien" || c.bedrijf;
  // De redenen, in de volgorde van de voorwaarden: inkomen, hoe lang al, geld en bezit, eigen bedrijf.
  const lang =
    invoer.langLaagInkomen === "ja"
      ? `U heeft al ${jaren} jaar of langer een inkomen op bijstandsniveau.`
      : invoer.langLaagInkomen === "onbekend"
        ? `U weet niet zeker of u al ${jaren} jaar of langer een inkomen op bijstandsniveau heeft. De gemeente kijkt dat na.`
        : `De gemeente kijkt of u al ${jaren} jaar of langer een inkomen op bijstandsniveau heeft.`;
  return {
    ...basis,
    kans: open ? "misschien" : "ja",
    bronnen: c.metGrensBronnen(basis.bronnen, t),
    waarom: `${c.waaromMetBedrijf(t)} ${lang} ${v.zin} De gemeente kijkt ook of u kans heeft op meer inkomen.`,
  };
}

/** Tegemoetkoming alleenverdieners: partner, grootste inkomen een UWV-uitkering, onder 100%, vermogen als zorgtoeslag. */
export function alleenverdieners(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  if (!c.paar) return undefined;
  // "Uw grootste inkomen bestaat uit een uitkering van het UWV": het grootste bedrag van het huishouden.
  const stromen = c.personen.flatMap((p) => Object.entries(p.inkomen).map(([soort, bedrag]) => ({ soort, bedrag: bedrag ?? 0 })));
  const grootste = stromen.reduce((a, b) => (b.bedrag > a.bedrag ? b : a), { soort: "", bedrag: 0 });
  const uwv = !invoer.bijstand && grootste.soort === "uwv";
  const basis = {
    id: "alleenverdieners",
    naam: "Tegemoetkoming voor alleenverdieners",
    groep: "gemeente" as const,
    bedrag: `${heel(l.bedrag("leiden.alleenverdieners.bedrag"))} per jaar`,
    wat: "Dit is voor stellen met een uitkering van UWV en weinig ander inkomen.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.alleenverdieners },
    bronnen: [...bron(l, "leiden.alleenverdieners.bedrag"), ...bron(l, "zt.vermogen.met_partner")],
  };
  if (!uwv)
    return {
      ...basis,
      kans: "nee",
      waarom: invoer.bijstand
        ? "U krijgt bijstand. Bij deze tegemoetkoming moet het grootste inkomen een uitkering van UWV zijn. Bijvoorbeeld Wajong."
        : "Uw grootste inkomen is geen uitkering van UWV. Bij deze tegemoetkoming moet het grootste inkomen een uitkering van UWV zijn. Bijvoorbeeld Wajong.",
    };
  const t = c.toets();
  const bronnen = c.metGrensBronnen(basis.bronnen, t);
  if (t.kans === "nee") return { ...basis, bronnen, kans: "nee", waarom: `Uw netto inkomen samen is niet lager dan de bijstand voor stellen.${c.grensZin(t)}` };
  const v = vermogenToets(l, invoer, "zt.vermogen.met_partner");
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit samen zijn meer dan ${heel(v.grens)}.` };
  return {
    ...basis,
    bronnen,
    kans: t.kans === "misschien" || v.kans === "misschien" ? "misschien" : "ja",
    waarom: `${t.grens ? `Uw inkomen samen is lager dan de bijstand voor stellen.${c.grensZin(t)}` : c.waaromInkomen(t)} ${v.zin} De gemeente kijkt ook: zou u met alleen bijstand meer overhouden?`,
  };
}

/** Studietoeslag (art. 36b Pw): studiefinanciering, en door ziekte of handicap niet kunnen werken naast de studie. */
export function studietoeslag(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  if (!c.studeert) return undefined;
  const a = invoer.aanvrager.leeftijd;
  const id = a >= 21 ? "pw.studietoeslag.21" : a === 20 ? "pw.studietoeslag.20" : a === 19 ? "pw.studietoeslag.19" : "pw.studietoeslag.18";
  const basis = {
    id: "studietoeslag",
    naam: "Studietoeslag",
    groep: "gemeente" as const,
    bedrag: `minstens ${euro(l.bedrag(id))} per maand`,
    wat: "Dit is voor studenten met studiefinanciering. Zij kunnen door ziekte of een handicap niet werken naast hun studie.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.studietoeslag },
    bronnen: [CITATEN.pw36b, ...bron(l, id)],
  };
  if (invoer.aanvrager.uitkering === "wajong") return { ...basis, kans: "nee", waarom: "U krijgt een Wajong-uitkering. Met een Wajong-uitkering kunt u geen studietoeslag krijgen." };
  if (invoer.studieMedisch === "nee")
    return { ...basis, kans: "nee", waarom: "U kunt naast uw studie werken. Studietoeslag is alleen voor studenten die dat door ziekte of een handicap niet kunnen." };
  return {
    ...basis,
    kans: "ja",
    waarom: "U krijgt studiefinanciering. U kunt door ziekte of een handicap niet werken naast uw studie. De gemeente vraagt meestal een arts om advies.",
  };
}

/** Kinderopvang bij sociale of medische problemen: kinderen jonger dan 4 of op de basisschool (hier: jonger dan 13). */
export function smi(c: Context): MogelijkeUitslag {
  if (!c.invoer.kinderen.some((k) => k.leeftijd < 13)) return undefined;
  return {
    id: "smi",
    naam: "Kinderopvang bij sociale of medische problemen",
    groep: "gemeente",
    kans: "misschien",
    wat: "Heeft u of uw partner last van lichamelijke, psychische of sociale klachten? Kan niemand anders voor uw kind zorgen? Dan kan de gemeente helpen met de kosten van kinderopvang. U betaalt zelf ook een deel.",
    waarom: "Dit hangt af van uw situatie. Een onafhankelijk medisch adviesbureau kijkt of u de opvang nodig heeft. Daar vraagt Leidengeldwijzer niet naar.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.smi },
    bronnen: [CITATEN.kinderopvangSmi, CITATEN.kinderopvangSmiGeldzaken],
  };
}

/**
 * Kwijtschelding van gemeentelijke belastingen (BSGR): inkomen op of onder bijstandsniveau. De berekening is van BSGR,
 * daarom altijd "misschien". Boven bijstandsniveau geen melding.
 */
export function kwijtschelding(c: Context): MogelijkeUitslag {
  const t = c.toets();
  if (t.kans === "nee" || (t.boven && !c.jongAlleen)) return undefined;
  return {
    id: "kwijtschelding",
    naam: "Kwijtschelding van gemeentelijke belastingen",
    groep: "gemeente",
    kans: "misschien",
    wat: "Heeft u moeite met het betalen van de gemeentelijke belastingen? Dan hoeft u ze misschien niet te betalen. Dit heet kwijtschelding.",
    waarom: `${t.grens && !t.boven ? `Uw inkomen is niet hoger dan de bijstand.${c.grensZin(t)}` : c.waaromInkomen(t)} BSGR rekent zelf uit of u kwijtschelding krijgt. Uw geld en bezit en het inkomen van uw huisgenoten tellen ook mee.`,
    aanvragen: { tekst: "Meer informatie en aanvragen", url: CITATEN.kwijtschelding.url },
    bronnen: c.metGrensBronnen([CITATEN.kwijtschelding], t),
  };
}

/** Bijzondere bijstand: maatwerk, tot 150% van de bijstandsnorm. Boven die grens geen melding. */
export function bijzondereBijstand(c: Context): MogelijkeUitslag {
  const t = c.toets("leiden.bb.inkomensgrens");
  if (t.kans === "nee" || (t.boven && !c.jongAlleen)) return undefined;
  return {
    id: "bijzondere_bijstand",
    naam: "Bijzondere bijstand",
    groep: "hulp",
    kans: "info",
    waarom:
      "Heeft u kosten die echt nodig zijn? En kunt u die niet betalen? Bijvoorbeeld kosten voor rechtshulp of voor een bewindvoerder. Dan kan de gemeente misschien helpen. Vraag het aan voordat u de kosten maakt.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.bijzondereBijstand },
    bronnen: [CITATEN.bijzondereBijstand, ...bron(c.l, "leiden.bb.inkomensgrens")],
  };
}

/** Bijstand: alleen een melding. Onder de norm en onder de vermogensgrens: misschien recht op bijstand. Met de AOW-leeftijd: zie aio. */
export function bijstand(c: Context): MogelijkeUitslag {
  const { l, invoer } = c;
  if (invoer.bijstand || c.metAow) return undefined;
  const basis = {
    id: "bijstand",
    naam: "Bijstand",
    groep: "inkomen" as const,
    wat: "Heeft u te weinig inkomen? Dan vult de gemeente uw inkomen aan tot de bijstand.",
    aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.bijstand },
    bronnen: [
      ...(c.studeert ? [CITATEN.pw13studie] : []),
      ...bron(l, c.jong ? "pw.norm.jong.alleenstaande" : "pw.norm.alleenstaande"),
      ...bron(l, "pw.vermogensgrens.alleenstaande"),
      ...(invoer.vermogen.voertuigen.length > 0 ? bron(l, "leiden.vermogen.voertuig_vrij") : []),
    ],
  };
  if (c.studeert && invoer.aanvrager.leeftijd < 27)
    return { ...basis, kans: "nee", waarom: "U bent jonger dan 27 jaar en u krijgt studiefinanciering. Dan kunt u geen bijstand krijgen." };
  const t = c.toets();
  const bronnen = c.metGrensBronnen(basis.bronnen, t);
  if (t.kans === "nee") return { ...basis, bronnen, kans: "nee", waarom: `Uw inkomen is hoger dan de bijstand.${c.grensZin(t)}` };
  const v = vermogenToets(l, invoer, c.vermogensgrensBijstand);
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}. Dan moet u eerst dat geld gebruiken.` };
  // Waarschijnlijk wel: inkomen onder de bijstand, geld en bezit onder de grens, en een woonsituatie waarvan
  // Leidengeldwijzer de norm kent (huurwoning of kamer, 21 jaar of ouder, geen eigen bedrijf).
  // Bij een koopwoning (overwaarde), bij iemand in huis, zonder vaste woonplek of met een eigen bedrijf: misschien.
  const zeker = t.grens && !t.boven && v.kans === "ja" && !c.jong && !c.bedrijf && (invoer.wonen === "huur" || invoer.wonen === "kamer");
  if (zeker)
    return {
      ...basis,
      bronnen,
      kans: "ja",
      waarom: `Uw inkomen is lager dan de bijstand.${c.grensZin(t)} ${v.zin}`,
    };
  return {
    ...basis,
    bronnen,
    kans: "misschien",
    waarom: `${t.grens && !t.boven ? `Uw inkomen is lager dan de bijstand.${c.grensZin(t)}` : c.waaromInkomen(t)} ${v.zin}${c.bedrijf ? " U heeft een eigen bedrijf. Dan gelden andere regels voor de bijstand." : ""} De gemeente kijkt ook naar hoe u woont en wie er bij u wonen.`,
  };
}
