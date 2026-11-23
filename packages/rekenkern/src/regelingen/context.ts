/**
 * Wat alle regelingen van het huishouden willen weten: wie er zijn, het inkomen, en de grens van het sociaal minimum.
 */
import { CITATEN, type Citaat } from "../citaten.ts";
import { D, NUL, type Bedrag } from "../geld.ts";
import type { Lezer } from "../regels.ts";
import { VOLWASSEN, bron, heeft, heel, sociaalMinimum, totaalVan } from "./basis.ts";
import type { CheckInvoer, CheckPersoon, Kans } from "./types.ts";

/** Grens van een Leidse regeling tegen het inkomen. kd: de grens is de kostendelersnorm. */
export type Toets = { kans: Kans; grens?: Bedrag; boven?: boolean; kd?: boolean };

export type Context = ReturnType<typeof maakContext>;

export function maakContext(l: Lezer, invoer: CheckInvoer) {
  const paar = !!invoer.partner;
  const personen: CheckPersoon[] = paar ? [invoer.aanvrager, invoer.partner!] : [invoer.aanvrager];
  const minderjarig = invoer.kinderen.filter((k) => k.leeftijd < 18);
  const jong = personen.some((p) => p.leeftijd < VOLWASSEN);
  const metKinderen = invoer.kinderen.length > 0;
  const studeert = heeft(invoer.aanvrager, "studiefinanciering");
  const bedrijf = personen.some((p) => heeft(p, "bedrijf"));
  // AOW-leeftijd: dan gelden de normen van art. 22 Pw. Ook als maar één van een stel de AOW-leeftijd heeft (art. 22 c).
  // De aanvulling tot de norm heet dan de AIO-aanvulling en komt van de SVB.
  const metAow = personen.some((p) => p.aow);
  const aanvragerAow = !!invoer.aanvrager.aow;

  // Het sociaal minimum zonder vakantiegeld, zoals in de tabellen van de gemeente (zie docs/RECHT.md, deel 2).
  // Controle: 120% × 95% × € 1.419,46 = € 1.618,18, het bedrag voor een alleenstaande op gemeente.leiden.nl.
  const zonderVakantiegeld = (norm: Bedrag) => norm.times(D(1).minus(l.breuk("pw.vakantietoeslag")));
  // Jongeren: alleen voor een alleenstaande van 18, 19 of 20 jaar zonder kinderen noemt de gemeente een bedrag
  // (Gemeentepolis: € 399,48 = 120% × 95% × de jongerennorm van art. 20 lid 1 a Pw). Zonder steun van de ouders
  // kan de norm hoger zijn (art. 20 lid 3). Daarom is "boven de grens" voor hen "misschien".
  const jongAlleen = jong && !paar && invoer.kinderen.length === 0 && invoer.wonen !== "instelling";
  const minimum = (): Bedrag | undefined => {
    if (jong) return jongAlleen ? zonderVakantiegeld(l.bedrag("pw.norm.jong.alleenstaande")) : undefined;
    return sociaalMinimum(l, paar, invoer.wonen, 0, metAow);
  };
  // De toepasselijke bijstandsnorm (100%): met andere volwassenen van 27 jaar of ouder in huis de kostendelersnorm (art. 22a Pw).
  // Die geldt voor de bijstand, de inkomenstoeslag ("toepasselijke bijstandsnorm") en de vergelijking met de bijstand.
  // De tabellen van de gemeente voor 120%, 130% en 140% noemen geen kostendelersnorm. Daar blijft de norm van het huishouden.
  const kostendelers =
    jong || invoer.wonen === "instelling" ? 0 : (invoer.kostendelers ?? 0) + invoer.kinderen.filter((k) => l.aantal("pw.kostendeler.minimumleeftijd").lte(k.leeftijd)).length;
  const bijstandsnorm = (): Bedrag | undefined => {
    const min = minimum();
    if (!min || kostendelers === 0) return min;
    return sociaalMinimum(l, paar, invoer.wonen, kostendelers, metAow);
  };
  // Met bijstand telt de norm als inkomen: de bijstand vult aan tot de norm (praktijk van de gemeente, 13 november 2026).
  const inkomen = invoer.bijstand ? undefined : personen.reduce((s, p) => s.plus(D(totaalVan(p))), NUL);

  /** Grens van een Leidse regeling: deel van het sociaal minimum. Zonder id: het sociaal minimum zelf (100%). */
  const toets = (pctId?: string): Toets => {
    const min = pctId ? minimum() : bijstandsnorm();
    if (!min) return { kans: "misschien" };
    const grens = pctId ? min.times(l.breuk(pctId)) : min;
    const kd = !pctId && kostendelers > 0;
    if (!inkomen) return { kans: "ja", grens, kd };
    const boven = inkomen.gt(grens);
    return { kans: boven ? (jongAlleen ? "misschien" : "nee") : "ja", grens, boven, kd };
  };

  /** De zin over de grens. Hoort bij de bronnen van grensBronnen. */
  const grensZin = (t: Toets) =>
    t.grens
      ? ` De grens voor uw huishouden is ongeveer ${heel(t.grens)} netto per maand. Vakantiegeld telt niet mee.${
          t.kd && kostendelers > 0 ? " Er wonen meer volwassenen bij u. Daarom is deze grens lager." : ""
        }`
      : "";

  /** Waarom deze uitslag, voor het inkomen. Bevat de zin over de grens. */
  const waaromInkomen = (t: Toets): string => {
    if (!t.grens) return jong
      ? "Leidengeldwijzer kan de grens voor jongeren van 18, 19 en 20 jaar nog niet uitrekenen. Vraag het de gemeente."
      : "Leidengeldwijzer kan de grens voor uw woonsituatie niet uitrekenen. Vraag het de gemeente.";
    if (invoer.bijstand) return `Met ${metAow ? "een AIO-aanvulling" : "bijstand"} is uw inkomen niet hoger dan de grens.${grensZin(t)}`;
    if (t.boven && jongAlleen)
      return `Uw inkomen is hoger dan de grens.${grensZin(t)} Krijgt u geen geld van uw ouders? Dan kan de grens voor uw inkomen hoger zijn. Vraag de gemeente of u de regeling toch kunt krijgen. Bel 14 071 en kies 1.`;
    return `${t.boven ? "Uw inkomen is hoger dan de grens." : "Uw inkomen is niet hoger dan de grens."}${grensZin(t)}`;
  };

  /**
   * De bronnen bij de zin over de grens, achter de eigen bronnen van de regeling.
   * Jongeren: de jongerennorm. Met de AOW-leeftijd: de normen van art. 22 Pw. Die twee alleen als ze er nog niet bij staan.
   * Met de kostendelersnorm: de regel (art. 22a Pw) en wie niet meetelt.
   */
  const metGrensBronnen = (bronnen: Citaat[], t: Toets): Citaat[] => {
    if (!t.grens) return bronnen;
    const lijst = [...bronnen];
    const zonderDubbel = (extra: Citaat[]) => {
      if (!lijst.some((b) => b.titel === extra[0]?.titel)) lijst.push(...extra);
    };
    if (jongAlleen) zonderDubbel(bron(l, "pw.norm.jong.alleenstaande"));
    if (metAow) zonderDubbel(bron(l, "pw.norm.aow.alleenstaande"));
    if (t.kd && kostendelers > 0) lijst.push(...bron(l, "pw.kostendeler.basis"), CITATEN.kostendelerUitzonderingen);
    return lijst;
  };

  /** Met een eigen bedrijf kijkt de gemeente naar de winst. Dat rekent Leidengeldwijzer niet uit: dan misschien. */
  const kansMetBedrijf = (t: Toets): Kans => (bedrijf && t.kans !== "nee" ? "misschien" : t.kans);
  const bedrijfReden = " U heeft een eigen bedrijf. Dan kijkt de gemeente naar de winst in uw belastingaangifte. Leidengeldwijzer rekent dat niet uit.";
  /** De reden bij een grens van de gemeente, met het eigen bedrijf als dat de uitslag "misschien" maakt. */
  const waaromMetBedrijf = (t: Toets, bedrijfTekst = bedrijfReden): string => `${waaromInkomen(t)}${bedrijf && t.kans !== "nee" ? bedrijfTekst : ""}`;

  /** De vermogensgrens van de bijstand (art. 34 Pw) voor dit huishouden. */
  const vermogensgrensBijstand = paar ? "pw.vermogensgrens.gehuwden" : metKinderen ? "pw.vermogensgrens.alleenstaande_ouder" : "pw.vermogensgrens.alleenstaande";

  return {
    l,
    invoer,
    paar,
    personen,
    minderjarig,
    jong,
    jongAlleen,
    metKinderen,
    studeert,
    bedrijf,
    metAow,
    aanvragerAow,
    kostendelers,
    toets,
    grensZin,
    waaromInkomen,
    metGrensBronnen,
    kansMetBedrijf,
    waaromMetBedrijf,
    vermogensgrensBijstand,
  };
}
