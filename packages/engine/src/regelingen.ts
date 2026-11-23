/**
 * Welke regelingen kan iemand in Leiden krijgen? Rekenkern van Leidengeldwijzer, de tweede app.
 *
 * Elke regeling geeft een uitslag: waarschijnlijk wel ("ja"), misschien, of waarschijnlijk niet ("nee"), met de reden
 * in gewone taal en de letterlijke bron. De voorwaarden staan in docs/recht/VOORWAARDEN.md, de bedragen en grenzen in
 * regels/**\/*.yaml.
 *
 * "Misschien" betekent: Leidengeldwijzer weet het niet zeker. Bijvoorbeeld omdat iemand "Weet ik niet" antwoordde, of omdat
 * Leidengeldwijzer een situatie niet uitrekent (andere mensen in huis, inkomen uit een eigen bedrijf). Leidengeldwijzer zegt dan wat
 * er nog open is.
 */
import { CITATEN, naarCitaat, type Citaat } from "./citaten.ts";
import { D, NUL, euro, max, type Bedrag } from "./geld.ts";
import { Lezer, OntbrekendeParameter, standaardRegels, type RegelSet } from "./regels.ts";
import { brutoMaandUitNetto, brutoUitNetto } from "./modules/belasting.ts";
import { huurtoeslag, kindgebondenBudget, kinderopvangtoeslag, maandbedragToeslag, zorgtoeslag } from "./modules/toeslagen.ts";
import type { Kind } from "./types.ts";

/** Soort inkomen. "geen" sluit de andere uit. */
export type Inkomenssoort = "loon" | "uwv" | "aow" | "bedrijf" | "studiefinanciering" | "partneralimentatie" | "kinderalimentatie" | "ander" | "geen";
export type Uitkeringssoort = "ww" | "wajong" | "wia" | "ziektewet" | "anders";

export interface CheckPersoon {
  leeftijd: number;
  /** Heeft deze persoon op de rekendatum de AOW-leeftijd? Zie heeftAowLeeftijd. */
  aow?: boolean;
  /**
   * Inkomen per soort, per maand, zonder vakantiegeld. Loon, uitkering, bedrijf en ander inkomen: netto.
   * Alimentatie en studiefinanciering: het bedrag dat binnenkomt. Leeg bij bijstand of geen inkomen.
   */
  inkomen: Partial<Record<Exclude<Inkomenssoort, "geen">, number>>;
  /** Welke uitkering van UWV, als er een is. */
  uitkering?: Uitkeringssoort;
}

const heeft = (p: CheckPersoon, s: Exclude<Inkomenssoort, "geen">) => p.inkomen[s] !== undefined;
const totaalVan = (p: CheckPersoon) => Object.values(p.inkomen).reduce((t, x) => t + (x ?? 0), 0);

export type Woonsoort = "huur" | "kamer" | "koop" | "kostgeld" | "inwonend" | "dakloos" | "instelling";
export type JaNeeOnbekend = "ja" | "nee" | "onbekend";

export interface CheckInvoer {
  /** Rekendatum, JJJJ-MM-DD. */
  datum: string;
  aanvrager: CheckPersoon;
  partner?: CheckPersoon;
  /**
   * Kinderen die bij de aanvrager wonen. Voor de huurtoeslag: het bruto inkomen per jaar van een kind van 18 of ouder
   * (inkomenJaar, leeg als het onbekend is). Voor de kinderopvangtoeslag: de opvang van een kind jonger dan 13.
   */
  kinderen: Pick<Kind, "leeftijd" | "leeftijdBeginJaar" | "inkomenJaar" | "opvang">[];
  /** Krijgt de aanvrager kinderbijslag voor de kinderen? Alleen nodig als er kinderen jonger dan 18 zijn. */
  kinderbijslag?: boolean;
  /** Bijstand van de gemeente (voor het huishouden). */
  bijstand: boolean;
  /** 5 jaar of langer een inkomen tot de bijstandsnorm. Alleen nodig vanaf 23 jaar. */
  langLaagInkomen?: JaNeeOnbekend;
  /** Studiefinanciering, en door ziekte of handicap niet kunnen werken naast de studie. */
  studieMedisch?: "ja" | "nee";
  wonen: Woonsoort;
  kaleHuurPerMaand?: number;
  /** Andere mensen in huis, naast partner en kinderen. */
  andereBewoners: boolean;
  /** Hoeveel andere mensen er in huis wonen. Voor de huurtoeslag. */
  andereBewonersAantal?: number;
  /** Hun bruto inkomen per jaar, samen. Voor de huurtoeslag. Leeg: onbekend. */
  andereBewonersInkomenJaar?: number;
  /**
   * Hoeveel van de andere bewoners 27 jaar of ouder zijn en meetellen als kostendeler (art. 22a Pw).
   * Eigen kinderen van 27 jaar of ouder telt de rekenkern zelf mee.
   */
  kostendelers?: number;
  /** Geld en bezit, per onderdeel. De eigen woning zit er niet in. */
  vermogen: Vermogen;
}

/** Geld en bezit van het huishouden, in euro's. Leidengeldwijzer telt per regeling wat meetelt. */
export interface Vermogen {
  betaalrekening: number;
  spaarrekening: number;
  /** Waarde van elke auto, motor of scooter. */
  voertuigen: number[];
  /** Contant geld, aandelen of andere beleggingen. */
  beleggingen: number;
  /** Spullen die veel geld waard zijn, zoals sieraden of een boot. */
  spullen: number;
  schulden: number;
}

/** "info": goed om te weten, voor iedereen (hulp en voorzieningen zonder rekensom). */
export type Kans = "ja" | "misschien" | "nee" | "info";
/** Wie de regeling geeft: de gemeente Leiden, Dienst Toeslagen, de Sociale Verzekeringsbank, de bijstand, of hulp voor iedereen. */
export type Groep = "gemeente" | "toeslagen" | "svb" | "inkomen" | "hulp";

export interface Uitslag {
  id: string;
  naam: string;
  groep: Groep;
  kans: Kans;
  /** Wat het oplevert, bijvoorbeeld "€ 1.100 per jaar". */
  bedrag?: string;
  /** Eén tot drie korte zinnen: waarom deze uitslag. */
  waarom: string;
  /** Hoe en waar aanvragen. */
  aanvragen?: { tekst: string; url: string };
  bronnen: Citaat[];
}

const LEIDEN = "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/hulp-bij-laag-inkomen";
const URL = {
  sleutelpas: `${LEIDEN}/hulp-bij-kosten-schoolgaande-kinderen/`,
  sportCultuur: `${LEIDEN}/hulp-bij-kosten-sport-en-cultuur/`,
  gemeentepolis: `${LEIDEN}/collectieve-aanvullende-zorgverzekering/`,
  ov: `${LEIDEN}/gratis-openbaar-vervoer/`,
  iit: `${LEIDEN}/individuele-inkomenstoeslag`,
  alleenverdieners: `${LEIDEN}/tegemoetkoming-voor-alleenverdieners/`,
  studietoeslag: `${LEIDEN}/studietoeslag`,
  smi: "https://gemeente.leiden.nl/inwoners-en-ondernemers/zorg-en-onderwijs/kinderopvang/kinderopvang-bij-sociale-of-medische-problemen/",
  kinderbijslag: "https://www.svb.nl/nl/kinderbijslag/wat-is-kinderbijslag/wat-is-kinderbijslag",
  bijstand: "https://gemeente.leiden.nl/inwoners-en-ondernemers/uitkering-en-inkomen/bijstand/",
  toeslagen: "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
};

/** Een uitslag die afhangt van een parameter: zonder die parameter (nog niet bekend) geen uitslag. */
function probeer(fn: () => Uitslag | undefined): Uitslag | undefined {
  try {
    return fn();
  } catch (e) {
    if (e instanceof OntbrekendeParameter) return undefined;
    throw e;
  }
}

const bron = (l: Lezer, id: string): Citaat[] => {
  const b = l.brontekst(id);
  return b ? [naarCitaat(b.citaat, b.bron, b.geldigVan)] : [];
};

const heel = (b: Bedrag) => euro(b, true);

/**
 * Heeft iemand op de datum de AOW-leeftijd? De AOW-leeftijd hangt af van de geboortedatum (tabel van de SVB).
 * Wie voor 1 maart 1957 geboren is, had in 2026 de AOW-leeftijd al: dan altijd ja. Leeg als Leidengeldwijzer
 * het niet weet (geboren vanaf 1 oktober 1964: die AOW-leeftijd staat nog niet vast).
 */
export function heeftAowLeeftijd(regels: RegelSet, geboren: string, datum: string): boolean | undefined {
  const l = new Lezer(regels, datum);
  let maanden: number;
  try {
    if (geboren < "1957-03-01") return true;
    if (geboren <= "1960-12-31") maanden = l.aantal("aow.leeftijd.geboren_tot_1961").toNumber();
    else if (geboren <= "1964-09-30") maanden = l.aantal("aow.leeftijd.geboren_1961_tot_okt_1964").toNumber();
    else return undefined;
  } catch (e) {
    if (e instanceof OntbrekendeParameter) return undefined;
    throw e;
  }
  // De dag waarop iemand de AOW-leeftijd bereikt: de geboortedag, zoveel maanden later.
  const [j, m, d] = geboren.split("-").map(Number);
  const totaal = m - 1 + maanden;
  const jaar = j + Math.floor(totaal / 12);
  const maand = (totaal % 12) + 1;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${jaar}-${p(maand)}-${p(d)}` <= datum;
}

/** Leeftijd vanaf wanneer de gewone normen gelden. Voor 18, 19 en 20 jaar rekent Leidengeldwijzer nog niet. */
const VOLWASSEN = 21;

/**
 * Het sociaal minimum per maand zonder vakantiegeld, voor iemand van 21 jaar of ouder: de bijstandsnorm van het huishouden.
 * Zoals in de tabellen van de gemeente. Leeg als Leidengeldwijzer het niet weet (een stel in een instelling).
 */
export function sociaalMinimum(l: Lezer, paar: boolean, wonen: Woonsoort, kostendelers = 0, aow = false): Bedrag | undefined {
  const zonderVakantiegeld = (norm: Bedrag) => norm.times(D(1).minus(l.breuk("pw.vakantietoeslag")));
  // Met de AOW-leeftijd: de normen van art. 22 Pw. Leidengeldwijzer kent de norm in een instelling dan niet (art. 23).
  if (wonen === "instelling") return paar || aow ? undefined : zonderVakantiegeld(l.bedrag("pw.norm.inrichting.alleenstaande"));
  const gehuwden = aow ? "pw.norm.aow.gehuwden" : "pw.norm.gehuwden";
  if (kostendelers > 0) {
    // Kostendelersnorm (art. 22a Pw): per persoon (40% + A × 30%) / A van de gehuwdennorm.
    // Met de AOW-leeftijd is dat de norm van art. 22 b (of c, die even hoog is).
    const a = D(kostendelers + (paar ? 2 : 1));
    const factor = l.breuk("pw.kostendeler.basis").plus(a.times(l.breuk("pw.kostendeler.per_persoon"))).div(a);
    const perPersoon = zonderVakantiegeld(factor.times(l.bedrag(gehuwden)));
    return paar ? perPersoon.times(2) : perPersoon;
  }
  return zonderVakantiegeld(l.bedrag(paar ? gehuwden : aow ? "pw.norm.aow.alleenstaande" : "pw.norm.alleenstaande"));
}

export function checkRegelingen(invoer: CheckInvoer, regels: RegelSet = standaardRegels): Uitslag[] {
  const l = new Lezer(regels, invoer.datum);
  const paar = !!invoer.partner;
  const personen = paar ? [invoer.aanvrager, invoer.partner!] : [invoer.aanvrager];
  const minderjarig = invoer.kinderen.filter((k) => k.leeftijd < 18);
  const jong = personen.some((p) => p.leeftijd < VOLWASSEN);
  const metKinderen = invoer.kinderen.length > 0;
  const studeert = heeft(invoer.aanvrager, "studiefinanciering");
  const bedrijf = personen.some((p) => heeft(p, "bedrijf"));
  // AOW-leeftijd: dan gelden de normen van art. 22 Pw. Ook als maar één van een stel de AOW-leeftijd heeft (art. 22 c).
  // De aanvulling tot de norm heet dan de AIO-aanvulling en komt van de SVB.
  const metAow = personen.some((p) => p.aow);
  const aanvragerAow = !!invoer.aanvrager.aow;

  // Het sociaal minimum zonder vakantiegeld, zoals in de tabellen van de gemeente (zie VOORWAARDEN.md).
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
  type Toets = { kans: Kans; grens?: Bedrag; boven?: boolean; kd?: boolean };
  const toets = (pctId?: string): Toets => {
    const min = pctId ? minimum() : bijstandsnorm();
    if (!min) return { kans: "misschien" };
    const grens = pctId ? min.times(l.breuk(pctId)) : min;
    const kd = !pctId && kostendelers > 0;
    if (!inkomen) return { kans: "ja", grens, kd };
    const boven = inkomen.gt(grens);
    return { kans: boven ? (jongAlleen ? "misschien" : "nee") : "ja", grens, boven, kd };
  };
  const grensZin = (grens?: Bedrag, metKostendelers = false) =>
    grens
      ? ` De grens voor uw huishouden is ongeveer ${heel(grens)} netto per maand. Vakantiegeld telt niet mee.${
          metKostendelers && kostendelers > 0 ? " Er wonen meer volwassenen bij u. Daarom is deze grens lager." : ""
        }`
      : "";
  const waaromInkomen = ({ grens, boven, kd }: Toets): string => {
    if (!grens) return jong
      ? "Leidengeldwijzer kan de grens voor jongeren van 18, 19 en 20 jaar nog niet uitrekenen. Vraag het de gemeente."
      : "Leidengeldwijzer kan de grens voor uw woonsituatie niet uitrekenen. Vraag het de gemeente.";
    if (invoer.bijstand) return `Met ${metAow ? "een AIO-aanvulling" : "bijstand"} is uw inkomen niet hoger dan de grens.${grensZin(grens, kd)}`;
    if (boven && jongAlleen)
      return `Uw inkomen is hoger dan de grens.${grensZin(grens, kd)} Krijgt u geen geld van uw ouders? Dan kan de grens voor uw inkomen hoger zijn. Vraag de gemeente of u de regeling toch kunt krijgen. Bel 14 071 en kies 1.`;
    return `${boven ? "Uw inkomen is hoger dan de grens." : "Uw inkomen is niet hoger dan de grens."}${grensZin(grens, kd)}`;
  };
  const bedrijfZin = " Heeft u een eigen bedrijf? Dan kijkt de gemeente naar de winst in uw belastingaangifte.";

  const uit: (Uitslag | undefined)[] = [];

  // Sleutelpas (Beleidsregels Sleutelpas 2026): tot 130%, niet in een instelling, niet voor studenten zonder kind.
  uit.push(
    probeer(() => {
      const t = toets("leiden.sleutelpas.inkomensgrens");
      const bronnen = [...bron(l, "leiden.sleutelpas.inkomensgrens"), CITATEN.sleutelpasWie];
      const basis = { id: "sleutelpas", naam: "Sleutelpas", groep: "gemeente" as const, bronnen, aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.sleutelpas } };
      if (invoer.wonen === "instelling")
        return { ...basis, kans: "nee", waarom: "Woont u in een instelling? Dan kunt u de Sleutelpas niet krijgen." };
      if (studeert && minderjarig.length === 0)
        return { ...basis, kans: "nee", waarom: "Met studiefinanciering kunt u de Sleutelpas niet krijgen. Dat kan wel als u ook voor een kind zorgt." };
      if (invoer.bijstand && !metAow)
        return { ...basis, kans: "ja", waarom: "Met bijstand krijgt u de Sleutelpas vanzelf. U hoeft hem niet aan te vragen." };
      // De AIO-aanvulling komt van de SVB. Art. 3.1 noemt die niet bij wie de pas vanzelf krijgt. Bij de aanvraag is de
      // laatste maandspecificatie genoeg (toelichting bij art. 4.3).
      if (invoer.bijstand && metAow)
        return {
          ...basis,
          kans: "ja",
          bronnen: [...bronnen, CITATEN.sleutelpasSpecificatie],
          waarom: `Met de Sleutelpas krijgt u korting op sport, cultuur en uitjes. ${waaromInkomen(t)} Vraag de pas aan. Stuur de laatste maandspecificatie van uw AIO-aanvulling mee.`,
        };
      const kans = bedrijf && t.kans !== "nee" ? "misschien" : t.kans;
      const waarom = `Met de Sleutelpas krijgt u korting op sport, cultuur en uitjes. ${waaromInkomen(t)}${bedrijf ? bedrijfZin : ""}`;
      // Art. 2.3 b en c: met een schuldregeling (MSNP) of in de Wsnp heeft iemand geen draagkracht, ook boven 130%.
      if (t.boven)
        return {
          ...basis,
          kans,
          bronnen: [...bronnen, CITATEN.sleutelpasSchuld],
          waarom: `${waarom} Heeft u een schuldregeling? Dan kunt u de Sleutelpas misschien toch krijgen.`,
        };
      return { ...basis, kans, waarom };
    }),
  );

  // Kindtegoed (art. 2.2): per kind jonger dan 18 met kinderbijslag, tot 140%. Tussen 130% en 140% zonder gratis pas.
  if (minderjarig.length > 0)
    uit.push(
      probeer(() => {
        const t = toets("leiden.kindtegoed.inkomensgrens");
        const perKind = (k: { leeftijd: number }) =>
          l.bedrag(k.leeftijd <= 3 ? "leiden.kindtegoed.0_3" : k.leeftijd <= 11 ? "leiden.kindtegoed.4_11" : "leiden.kindtegoed.12_17");
        const totaal = minderjarig.reduce((s, k) => s.plus(perKind(k)), NUL);
        const bronnen = [...bron(l, "leiden.kindtegoed.0_3"), CITATEN.kindtegoedKind];
        const basis = { id: "kindtegoed", naam: "Kindtegoed", groep: "gemeente" as const, bedrag: `${heel(totaal)} per jaar`, bronnen, aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.sleutelpas } };
        if (invoer.kinderbijslag === false)
          return { ...basis, kans: "nee", waarom: "Het Kindtegoed is alleen voor kinderen voor wie u kinderbijslag of een pleegkindvergoeding krijgt." };
        const kans = bedrijf && t.kans !== "nee" ? "misschien" : t.kans;
        return { ...basis, kans, waarom: `U krijgt geld op de Sleutelpas. Daarmee betaalt u schoolspullen, sport en cultuur voor uw kinderen. ${waaromInkomen(t)}` };
      }),
    );

  // Laptop (art. 3.2): op de Sleutelpas, voor kinderen van 4 tot en met 17 jaar.
  const schoolkinderen = minderjarig.filter((k) => k.leeftijd >= 4);
  if (schoolkinderen.length > 0)
    uit.push(
      probeer(() => {
        const t = toets("leiden.sleutelpas.inkomensgrens");
        const termijn = l.aantal("leiden.laptop.termijn").toString();
        const middelbaar = schoolkinderen.filter((k) => k.leeftijd >= 12).length;
        const aantal = middelbaar + (schoolkinderen.length > middelbaar ? 1 : 0);
        const sleutelpasNee = invoer.wonen === "instelling" || (studeert && minderjarig.length === 0);
        const kans: Kans = sleutelpasNee ? "nee" : bedrijf && t.kans !== "nee" ? "misschien" : invoer.bijstand ? "ja" : t.kans;
        return {
          id: "laptop",
          naam: "Laptop voor school",
          groep: "gemeente",
          kans,
          bedrag: aantal === 1 ? `1 laptop per ${termijn} jaar` : `${aantal} laptops per ${termijn} jaar`,
          waarom: `Op de Sleutelpas staat een bon voor een laptop. Kinderen van 4 tot en met 11 jaar krijgen samen 1 laptop. Kinderen van 12 tot en met 17 jaar krijgen elk een laptop.`,
          aanvragen: { tekst: "Meer informatie", url: URL.sleutelpas },
          bronnen: bron(l, "leiden.laptop.termijn"),
        };
      }),
    );

  // Zwemles (art. 3.3): kinderen vanaf 5 jaar, tot 140%.
  if (minderjarig.length > 0)
    uit.push(
      probeer(() => {
        const vanaf = l.aantal("leiden.zwemles.minimumleeftijd");
        if (!minderjarig.some((k) => vanaf.lte(k.leeftijd))) return undefined;
        const t = toets("leiden.zwemles.inkomensgrens");
        const bc = heel(l.bedrag("leiden.zwemles.diploma_bc"));
        return {
          id: "zwemles",
          naam: "Zwemles",
          groep: "gemeente",
          kans: bedrijf && t.kans !== "nee" ? "misschien" : t.kans,
          bedrag: `Diploma A: alles betaald. Diploma B of C: ${bc}.`,
          waarom: `Dit is voor kinderen vanaf ${vanaf.toString()} jaar. U vraagt het aan bij het Jeugdfonds Sport & Cultuur. ${waaromInkomen(t)}`,
          aanvragen: { tekst: "Meer informatie", url: URL.sportCultuur },
          bronnen: bron(l, "leiden.zwemles.inkomensgrens"),
        };
      }),
    );

  // Volwassenenfonds Sport & Cultuur (art. 3.4): vanaf 18 jaar, tot 120%.
  uit.push(
    probeer(() => {
      const t = toets("leiden.volwassenenfonds.inkomensgrens");
      return {
        id: "volwassenenfonds",
        naam: "Sport en cultuur voor volwassenen",
        groep: "gemeente",
        kans: bedrijf && t.kans !== "nee" ? "misschien" : t.kans,
        bedrag: `tot ${heel(l.bedrag("leiden.volwassenenfonds.maximum"))} per jaar`,
        waarom: `Het Volwassenenfonds Sport & Cultuur betaalt een sport of activiteit voor u. U vraagt het aan via een tussenpersoon. ${waaromInkomen(t)}`,
        aanvragen: { tekst: "Meer informatie", url: URL.sportCultuur },
        bronnen: [...bron(l, "leiden.volwassenenfonds.inkomensgrens"), CITATEN.volwassenentegoed],
      };
    }),
  );

  // Gemeentepolis: tot 120%. Ondernemers: een jaargrens die Leidengeldwijzer niet uitrekent.
  uit.push(
    probeer(() => {
      const t = toets("leiden.gemeentepolis.inkomensgrens");
      return {
        id: "gemeentepolis",
        naam: "Zorgverzekering van de gemeente",
        groep: "gemeente",
        kans: bedrijf && t.kans !== "nee" ? "misschien" : t.kans,
        waarom: `De Gemeentepolis is de zorgverzekering van de gemeente. Er zit een aanvullende verzekering bij. Nieuwe klanten melden zich aan tussen 12 november en 31 december. ${waaromInkomen(t)}${bedrijf ? " Voor zzp'ers geldt een grens per jaar." : ""}`,
        aanvragen: { tekst: "Meer informatie", url: URL.gemeentepolis },
        bronnen: bron(l, "leiden.gemeentepolis.inkomensgrens"),
      };
    }),
  );

  // Gratis OV-pas: 18 jaar of ouder, geen student, niet dak- of thuisloos, bijstand of tot 100%.
  uit.push(
    probeer(() => {
      const t = toets("leiden.ovpas.inkomensgrens");
      const basis = { id: "ovpas", naam: "Gratis OV-pas", groep: "gemeente" as const, aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.ov }, bronnen: bron(l, "leiden.ovpas.inkomensgrens") };
      if (studeert) return { ...basis, kans: "nee", waarom: "De gratis OV-pas is niet voor studenten." };
      if (invoer.wonen === "dakloos") return { ...basis, kans: "nee", waarom: "De gratis OV-pas is niet voor mensen zonder vaste woonplek." };
      return {
        ...basis,
        kans: bedrijf && t.kans !== "nee" ? "misschien" : t.kans,
        waarom: `U reist gratis met de streekbus, buiten de spits. Het aantal passen is beperkt. ${waaromInkomen(t)}`,
      };
    }),
  );

  // Individuele inkomenstoeslag: 23 jaar of ouder, 5 jaar een inkomen tot de norm, vermogen onder de bijstandsgrens.
  uit.push(
    probeer(() => {
      const minLeeftijd = l.aantal("leiden.iit.minimumleeftijd");
      const jaren = l.aantal("leiden.iit.referteperiode").toString();
      const id = paar ? "leiden.iit.bedrag.gehuwden" : metKinderen ? "leiden.iit.bedrag.alleenstaande_ouder" : "leiden.iit.bedrag.alleenstaande";
      const basis = {
        id: "iit",
        naam: "Individuele inkomenstoeslag",
        groep: "gemeente" as const,
        bedrag: `${heel(l.bedrag(id))}, één keer per 12 maanden`,
        aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.iit },
        bronnen: [...bron(l, "leiden.iit.referteperiode"), CITATEN.iitPeildatum, ...bron(l, "pw.vermogensgrens.alleenstaande")],
      };
      if (minLeeftijd.gt(invoer.aanvrager.leeftijd))
        return { ...basis, kans: "nee", waarom: `Deze toeslag is voor mensen van ${minLeeftijd.toString()} jaar of ouder.` };
      // Een stel telt als één geheel: heeft een van beiden de AOW-leeftijd, dan geldt de hogere norm van art. 22 Pw en geen toeslag.
      if (metAow)
        return {
          ...basis,
          kans: "nee",
          waarom: aanvragerAow
            ? "Deze toeslag is voor mensen die de AOW-leeftijd nog niet hebben."
            : "Deze toeslag is voor mensen die de AOW-leeftijd nog niet hebben. Uw partner heeft de AOW-leeftijd. Daarom kunt u deze toeslag ook niet krijgen.",
          bronnen: [CITATEN.iitLeeftijd, CITATEN.iitAow],
        };
      if (studeert) return { ...basis, kans: "nee", waarom: `Met studiefinanciering in de afgelopen ${jaren} jaar kunt u deze toeslag niet krijgen.` };
      const v = vermogenToets(l, invoer, paar ? "pw.vermogensgrens.gehuwden" : metKinderen ? "pw.vermogensgrens.alleenstaande_ouder" : "pw.vermogensgrens.alleenstaande");
      const t = toets();
      if (t.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw inkomen is hoger dan de bijstand.${grensZin(t.grens, t.kd)}` };
      if (invoer.langLaagInkomen === "nee") return { ...basis, kans: "nee", waarom: `U krijgt deze toeslag alleen als u al ${jaren} jaar of langer een laag inkomen heeft.` };
      if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}.` };
      const open = invoer.langLaagInkomen !== "ja" || v.kans === "misschien" || t.kans === "misschien" || bedrijf;
      return {
        ...basis,
        kans: open ? "misschien" : "ja",
        waarom: `Dit is extra geld. U krijgt het als u al ${jaren} jaar of langer een laag inkomen heeft, en geen kans op meer inkomen. ${v.zin}`,
      };
    }),
  );

  // Tegemoetkoming alleenverdieners: partner, grootste inkomen een UWV-uitkering, onder 100%, vermogen als zorgtoeslag.
  if (paar)
    uit.push(
      probeer(() => {
        // "Uw grootste inkomen bestaat uit een uitkering van het UWV": het grootste bedrag van het huishouden.
        const stromen = personen.flatMap((p) => Object.entries(p.inkomen).map(([soort, bedrag]) => ({ soort, bedrag: bedrag ?? 0 })));
        const grootste = stromen.reduce((a, b) => (b.bedrag > a.bedrag ? b : a), { soort: "", bedrag: 0 });
        const uwv = !invoer.bijstand && grootste.soort === "uwv";
        const basis = {
          id: "alleenverdieners",
          naam: "Tegemoetkoming voor alleenverdieners",
          groep: "gemeente" as const,
          bedrag: `${heel(l.bedrag("leiden.alleenverdieners.bedrag"))} per jaar`,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.alleenverdieners },
          bronnen: [...bron(l, "leiden.alleenverdieners.bedrag"), ...bron(l, "zt.vermogen.met_partner")],
        };
        if (!uwv) return { ...basis, kans: "nee", waarom: "Deze tegemoetkoming is alleen voor stellen. Het grootste inkomen moet een uitkering van UWV zijn. Bijvoorbeeld Wajong." };
        const t = toets();
        if (t.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw netto inkomen samen is niet lager dan de bijstand voor stellen.${grensZin(t.grens, t.kd)}` };
        const v = vermogenToets(l, invoer, "zt.vermogen.met_partner");
        if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit samen zijn meer dan ${heel(v.grens)}.` };
        return {
          ...basis,
          kans: t.kans === "misschien" || v.kans === "misschien" ? "misschien" : "ja",
          waarom: `Dit is voor stellen met een uitkering van UWV en weinig ander inkomen. ${t.grens ? `Uw inkomen samen is lager dan de bijstand voor stellen.${grensZin(t.grens, t.kd)}` : waaromInkomen(t)} De gemeente kijkt ook: zou u met alleen bijstand meer overhouden?`,
        };
      }),
    );

  // Studietoeslag (art. 36b Pw): studiefinanciering, en door ziekte of handicap niet kunnen werken naast de studie.
  if (studeert)
    uit.push(
      probeer(() => {
        const a = invoer.aanvrager.leeftijd;
        const id = a >= 21 ? "pw.studietoeslag.21" : a === 20 ? "pw.studietoeslag.20" : a === 19 ? "pw.studietoeslag.19" : "pw.studietoeslag.18";
        const wajong = invoer.aanvrager.uitkering === "wajong";
        const basis = {
          id: "studietoeslag",
          naam: "Studietoeslag",
          groep: "gemeente" as const,
          bedrag: `minstens ${euro(l.bedrag(id))} per maand`,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.studietoeslag },
          bronnen: [CITATEN.pw36b, ...bron(l, id)],
        };
        if (wajong) return { ...basis, kans: "nee", waarom: "Met een Wajong-uitkering kunt u geen studietoeslag krijgen." };
        if (invoer.studieMedisch === "nee")
          return { ...basis, kans: "nee", waarom: "Studietoeslag is alleen voor studenten met een ziekte of handicap. Zij kunnen daardoor niet werken naast hun studie." };
        return {
          ...basis,
          kans: "ja",
          waarom: "Dit is voor studenten met studiefinanciering. Zij kunnen door ziekte of een handicap niet werken naast hun studie. De gemeente vraagt meestal een arts om advies.",
        };
      }),
    );

  // Kinderopvang bij sociale of medische problemen: kinderen jonger dan 4 of op de basisschool (hier: jonger dan 13).
  if (invoer.kinderen.some((k) => k.leeftijd < 13))
    uit.push({
      id: "smi",
      naam: "Kinderopvang bij sociale of medische problemen",
      groep: "gemeente",
      kans: "misschien",
      waarom:
        "Heeft u of uw partner last van lichamelijke, psychische of sociale klachten? Kan niemand anders voor uw kind zorgen? Dan kan de gemeente helpen met de kosten van kinderopvang. U betaalt zelf ook een deel.",
      aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.smi },
      bronnen: [CITATEN.kinderopvangSmi, CITATEN.kinderopvangSmiGeldzaken],
    });

  // Kwijtschelding van gemeentelijke belastingen (BSGR): inkomen op of onder bijstandsniveau. De berekening is van BSGR,
  // daarom altijd "misschien". Boven bijstandsniveau geen melding.
  uit.push(
    probeer(() => {
      const t = toets();
      if (t.kans === "nee" || (t.boven && !jongAlleen)) return undefined;
      return {
        id: "kwijtschelding",
        naam: "Kwijtschelding van gemeentelijke belastingen",
        groep: "gemeente",
        kans: "misschien",
        waarom:
          "Heeft u moeite met het betalen van de gemeentelijke belastingen? Dan hoeft u ze misschien niet te betalen. Dit heet kwijtschelding. Uw inkomen mag niet hoger zijn dan de bijstand. Uw geld en bezit en het inkomen van uw huisgenoten tellen ook mee.",
        aanvragen: { tekst: "Meer informatie en aanvragen", url: CITATEN.kwijtschelding.url },
        bronnen: [CITATEN.kwijtschelding],
      };
    }),
  );

  // Bijzondere bijstand: maatwerk, tot 150% van de bijstandsnorm. Boven die grens geen melding.
  uit.push(
    probeer(() => {
      const t = toets("leiden.bb.inkomensgrens");
      if (t.kans === "nee" || (t.boven && !jongAlleen)) return undefined;
      return {
        id: "bijzondere_bijstand",
        naam: "Bijzondere bijstand",
        groep: "gemeente",
        kans: "misschien",
        waarom:
          "Heeft u kosten die u niet kunt betalen? Bijvoorbeeld voor een verhuizing of rechtshulp. Dan kan de gemeente u misschien helpen. Dit heet bijzondere bijstand. U krijgt dan een vergoeding of een lening. Vraag het aan voordat u de kosten maakt.",
        aanvragen: { tekst: "Meer informatie en aanvragen", url: CITATEN.bijzondereBijstand.url },
        bronnen: [CITATEN.bijzondereBijstand, ...bron(l, "leiden.bb.inkomensgrens")],
      };
    }),
  );

  // Goed om te weten: hulp voor iedereen, zonder voorwaarden van Leidengeldwijzer.
  uit.push(
    {
      id: "goede_buur",
      naam: "Hulp bij uw aanvraag",
      groep: "hulp",
      kans: "info",
      waarom: "Wilt u hulp bij een aanvraag of bij uw geldzaken? Ga dan naar het Goede Buur Spreekuur. U hoeft geen afspraak te maken. De hulp is gratis.",
      aanvragen: { tekst: "Waar en wanneer", url: CITATEN.goedeBuur.url },
      bronnen: [CITATEN.goedeBuur],
    },
    // Heeft iemand schulden ingevuld? Dan staat de hulp bij schulden bij wat u waarschijnlijk kunt krijgen:
    // de Stadsbank helpt inwoners van Leiden met schulden.
    invoer.vermogen.schulden > 0
      ? {
          id: "stadsbank",
          naam: "Hulp bij schulden",
          groep: "gemeente",
          kans: "ja",
          waarom: "U heeft schulden. De Stadsbank Leiden helpt inwoners van Leiden met schulden. Bel 14 071 en kies 1.",
          aanvragen: { tekst: "Meer informatie", url: CITATEN.stadsbank.url },
          bronnen: [CITATEN.stadsbank],
        }
      : {
          id: "stadsbank",
          naam: "Hulp bij schulden",
          groep: "hulp",
          kans: "info",
          waarom: "Heeft u schulden? Of maakt u zich zorgen over geld? Dan kan de Stadsbank u helpen. Bel 14 071 en kies 1.",
          aanvragen: { tekst: "Meer informatie", url: CITATEN.stadsbank.url },
          bronnen: [CITATEN.stadsbank],
        },
    {
      id: "voedselbank",
      naam: "Voedselbank",
      groep: "hulp",
      kans: "info",
      waarom: "Zijn boodschappen te duur? Dan kunt u misschien naar de Voedselbank. De Voedselbank bepaalt zelf de voorwaarden.",
      aanvragen: { tekst: "Meer informatie", url: CITATEN.voedselbank.url },
      bronnen: [CITATEN.voedselbank],
    },
  );

  // AIO-aanvulling van de SVB: de bijstand voor wie de AOW-leeftijd heeft, ook als de partner die nog niet heeft.
  // Zelfde toets als de bijstand: inkomen onder de norm van art. 22 Pw, geld en bezit onder de grens van art. 34 Pw.
  if (!invoer.bijstand && metAow)
    uit.push(
      probeer(() => {
        const basis = {
          id: "aio",
          naam: "AIO-aanvulling",
          groep: "svb" as const,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: CITATEN.aioWie.url },
          bronnen: [CITATEN.aioWie, ...bron(l, "pw.norm.aow.alleenstaande"), ...bron(l, "pw.vermogensgrens.alleenstaande"), ...(invoer.vermogen.voertuigen.length > 0 ? bron(l, "leiden.vermogen.voertuig_vrij") : [])],
        };
        const t = toets();
        if (t.kans === "nee")
          return { ...basis, kans: "nee", waarom: `Uw inkomen is hoger dan het sociaal minimum voor mensen met AOW.${grensZin(t.grens, t.kd)}` };
        const v = vermogenToets(l, invoer, paar ? "pw.vermogensgrens.gehuwden" : metKinderen ? "pw.vermogensgrens.alleenstaande_ouder" : "pw.vermogensgrens.alleenstaande");
        if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}. Dan moet u eerst dat geld gebruiken.` };
        const uitleg = "Heeft u geen volledige AOW? En heeft u weinig ander inkomen? Dan vult de SVB uw inkomen aan. Dit heet de AIO-aanvulling.";
        const zeker = t.grens && !t.boven && v.kans === "ja" && !bedrijf && (invoer.wonen === "huur" || invoer.wonen === "kamer");
        if (zeker)
          return { ...basis, kans: "ja", waarom: `${uitleg} Uw inkomen is lager dan het sociaal minimum.${grensZin(t.grens, t.kd)} ${v.zin}` };
        return {
          ...basis,
          kans: "misschien",
          waarom: `${uitleg} ${t.grens && !t.boven ? `Uw inkomen is lager dan het sociaal minimum.${grensZin(t.grens, t.kd)}` : waaromInkomen(t)} ${v.zin} De SVB kijkt ook naar hoe u woont en wie er bij u wonen.`,
        };
      }),
    );

  // Bijstand: alleen een melding. Onder de norm en onder de vermogensgrens: misschien recht op bijstand.
  if (!invoer.bijstand && !metAow)
    uit.push(
      probeer(() => {
        const basis = {
          id: "bijstand",
          naam: "Bijstand",
          groep: "inkomen" as const,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.bijstand },
          bronnen: [...(studeert ? [CITATEN.pw13studie] : []), ...bron(l, jong ? "pw.norm.jong.alleenstaande" : "pw.norm.alleenstaande"), ...bron(l, "pw.vermogensgrens.alleenstaande"), ...(invoer.vermogen.voertuigen.length > 0 ? bron(l, "leiden.vermogen.voertuig_vrij") : [])],
        };
        if (studeert && invoer.aanvrager.leeftijd < 27)
          return { ...basis, kans: "nee", waarom: "Bent u jonger dan 27 jaar en krijgt u studiefinanciering? Dan kunt u geen bijstand krijgen." };
        const t = toets();
        if (t.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw inkomen is hoger dan de bijstand.${grensZin(t.grens, t.kd)}` };
        const v = vermogenToets(l, invoer, paar ? "pw.vermogensgrens.gehuwden" : metKinderen ? "pw.vermogensgrens.alleenstaande_ouder" : "pw.vermogensgrens.alleenstaande");
        if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}. Dan moet u eerst dat geld gebruiken.` };
        // Waarschijnlijk wel: inkomen onder de bijstand, geld en bezit onder de grens, en een woonsituatie waarvan
        // Leidengeldwijzer de norm kent (huurwoning of kamer, 21 jaar of ouder, geen eigen bedrijf).
        // Bij een koopwoning (overwaarde), bij iemand in huis, zonder vaste woonplek of met een eigen bedrijf: misschien.
        const zeker = t.grens && !t.boven && v.kans === "ja" && !jong && !bedrijf && (invoer.wonen === "huur" || invoer.wonen === "kamer");
        if (zeker)
          return {
            ...basis,
            kans: "ja",
            waarom: `Uw inkomen is lager dan de bijstand.${grensZin(t.grens, t.kd)} ${v.zin} Dan vult de gemeente uw inkomen aan tot de bijstand.`,
          };
        return {
          ...basis,
          kans: "misschien",
          waarom: `${t.grens && !t.boven ? `Uw inkomen is lager dan de bijstand.${grensZin(t.grens, t.kd)}` : waaromInkomen(t)} ${v.zin} De gemeente kijkt ook naar hoe u woont en wie er bij u wonen.`,
        };
      }),
    );

  // Landelijke toeslagen, met de rekenkern van Leidenwerkt.
  uit.push(...toeslagen(l, invoer, personen));

  const lijst = uit.filter((u): u is Uitslag => !!u);
  // Bij jongeren komt de grens uit de jongerennorm: die bron hoort er dan bij.
  if (jongAlleen) {
    const jongBron = bron(l, "pw.norm.jong.alleenstaande");
    for (const u of lijst) if (/De grens voor uw huishouden/.test(u.waarom) && !u.bronnen.some((b) => b.titel === jongBron[0]?.titel)) u.bronnen.push(...jongBron);
  }
  // Met de AOW-leeftijd komt de grens uit de normen van art. 22 Pw: die bron hoort er dan bij.
  if (metAow) {
    const aowBron = bron(l, "pw.norm.aow.alleenstaande");
    for (const u of lijst) if (/De grens voor uw huishouden/.test(u.waarom) && !u.bronnen.some((b) => b.titel === aowBron[0]?.titel)) u.bronnen.push(...aowBron);
  }
  // Met de kostendelersnorm: de regel (art. 22a Pw) en wie niet meetelt.
  if (kostendelers > 0) {
    const kdBron = [...bron(l, "pw.kostendeler.basis"), CITATEN.kostendelerUitzonderingen];
    for (const u of lijst) if (/Daarom is deze grens lager\./.test(u.waarom)) u.bronnen.push(...kdBron);
  }
  return lijst;
}

/**
 * Het vermogen dat meetelt.
 * - Bijstand (art. 34 Pw): alles, behalve één auto of motor tot € 4.500 (Leiden, Beleidsregels Vermogen 2026, art. 2.1).
 * - Toeslagen: zoals bij de belastingaangifte, de auto telt niet mee (Dienst Toeslagen).
 */
export function telbaarVermogen(l: Lezer, v: Vermogen, voor: "bijstand" | "toeslagen"): Bedrag {
  // Spullen voor eigen gebruik tellen niet mee voor de toeslagen, net als bij de belastingaangifte.
  const basis = D(v.betaalrekening).plus(v.spaarrekening).plus(v.beleggingen).minus(v.schulden);
  if (voor === "toeslagen") return basis;
  const voertuigen = v.voertuigen.reduce((s, x) => s.plus(x), NUL);
  const hoogste = v.voertuigen.reduce((m, x) => Math.max(m, x), 0);
  const vrij = D(Math.min(hoogste, l.bedrag("leiden.vermogen.voertuig_vrij").toNumber()));
  return basis.plus(v.spullen).plus(voertuigen).minus(vrij);
}

/** Vermogen tegen een grens. Bij een koopwoning telt een deel van de woning mee voor de bijstand: dan misschien. */
function vermogenToets(l: Lezer, invoer: CheckInvoer, grensId: string): { kans: Kans; grens: Bedrag; zin: string } {
  const grens = l.bedrag(grensId);
  const bijstand = grensId.startsWith("pw.");
  const vermogen = telbaarVermogen(l, invoer.vermogen, bijstand ? "bijstand" : "toeslagen");
  if (vermogen.gt(grens)) return { kans: "nee", grens, zin: "" };
  if (invoer.wonen === "koop" && bijstand)
    return { kans: "misschien", grens, zin: `Uw geld en bezit zijn niet meer dan ${heel(grens)}. De gemeente kijkt ook naar de waarde van uw huis.` };
  return { kans: "ja", grens, zin: `Uw geld en bezit zijn niet meer dan ${heel(grens)}.` };
}

/** Toetsingsinkomen per jaar (bruto), afgeleid uit het netto inkomen. Undefined als Leidengeldwijzer het niet kan afleiden. */
function toetsingsinkomen(l: Lezer, invoer: CheckInvoer, personen: CheckPersoon[]): Bedrag | undefined {
  if (invoer.bijstand) {
    // Zoals Leidenwerkt: de bijstand (met vakantietoeslag) als uitkering, bij een paar half om half.
    const norm = l.bedrag(personen.length > 1 ? "pw.norm.gehuwden" : "pw.norm.alleenstaande").times(12);
    return personen.length > 1 ? brutoUitNetto(l, norm.div(2)).times(2) : brutoUitNetto(l, norm);
  }
  // Per persoon. Loon en uitkering: bruto terugrekenen uit netto, met vakantiegeld. Partneralimentatie komt bruto
  // binnen en telt zo mee. Kinderalimentatie en studiefinanciering tellen niet mee voor de toeslagen.
  // Twee soorten met loonheffing (loon en uitkering), een eigen bedrijf of ander inkomen: dat rekent Leidengeldwijzer niet uit.
  const vg = l.breuk("wml.vakantiebijslag");
  let totaal = NUL;
  for (const p of personen) {
    if (heeft(p, "bedrijf") || heeft(p, "ander") || heeft(p, "aow")) return undefined;
    if (heeft(p, "loon") && heeft(p, "uwv")) return undefined;
    const loon = p.inkomen.loon ?? 0;
    const uwv = p.inkomen.uwv ?? 0;
    if (loon > 0) totaal = totaal.plus(brutoMaandUitNetto(l, D(loon), vg).times(12).times(vg.plus(1)));
    if (uwv > 0) totaal = totaal.plus(brutoUitNetto(l, D(uwv).times(12).times(vg.plus(1))));
    totaal = totaal.plus(D(p.inkomen.partneralimentatie ?? 0).times(12));
  }
  return totaal;
}

function toeslagen(l: Lezer, invoer: CheckInvoer, personen: CheckPersoon[]): (Uitslag | undefined)[] {
  const paar = personen.length > 1;
  // Boven deze grens telt inkomen uit vermogen mee in het toetsingsinkomen. Dat rekent Leidengeldwijzer niet uit.
  const vermogenTeHoog = probeer2(() =>
    telbaarVermogen(l, invoer.vermogen, "toeslagen").gt(l.bedrag(paar ? "toeslagen.vermogen.inkomen.met_partner" : "toeslagen.vermogen.inkomen.zonder_partner")),
  );
  // Met de AOW-leeftijd is de belasting anders. Leidengeldwijzer rekent het bruto inkomen dan niet terug uit het netto inkomen.
  const metAow = personen.some((p) => p.aow);
  const ti = vermogenTeHoog === false && !metAow ? probeer2(() => toetsingsinkomen(l, invoer, personen)) : undefined;
  const proef = { tekst: "Proefberekening van Dienst Toeslagen", url: URL.toeslagen };
  const geenBedrag = vermogenTeHoog
    ? "Een deel van uw geld en bezit telt mee als inkomen. Leidengeldwijzer rekent dat niet uit. Doe de proefberekening van Dienst Toeslagen."
    : metAow
      ? "Leidengeldwijzer rekent de toeslagen voor mensen met de AOW-leeftijd nog niet uit. Doe de proefberekening van Dienst Toeslagen."
      : "Leidengeldwijzer kan uw toeslag niet uitrekenen met dit soort inkomen. Doe de proefberekening van Dienst Toeslagen.";
  const kinderen: Kind[] = invoer.kinderen.map((k) => ({ leeftijd: k.leeftijd }));
  const werkenOfStuderen = personen.every((p) => heeft(p, "loon") || heeft(p, "bedrijf") || heeft(p, "studiefinanciering"));
  const uit: (Uitslag | undefined)[] = [];

  uit.push(
    probeer(() => {
      const v = vermogenToets(l, invoer, paar ? "zt.vermogen.met_partner" : "zt.vermogen.zonder_partner");
      const basis = { id: "zorgtoeslag", naam: "Zorgtoeslag", groep: "toeslagen" as const, aanvragen: proef, bronnen: bron(l, "zt.vermogen.zonder_partner") };
      if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit op 1 januari waren meer dan ${heel(v.grens)}.` };
      if (!ti) return { ...basis, kans: "misschien", waarom: geenBedrag };
      const bedrag = maandbedragToeslag(zorgtoeslag(l, ti, paar).div(12));
      if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen zorgtoeslag." };
      return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Dit is geld voor de kosten van uw zorgverzekering. ${v.zin}` };
    }),
  );

  if (invoer.kinderen.some((k) => k.leeftijd < 18))
    uit.push(
      probeer(() => {
        const v = vermogenToets(l, invoer, paar ? "kgb.vermogen.met_partner" : "kgb.vermogen.zonder_partner");
        const basis = { id: "kgb", naam: "Kindgebonden budget", groep: "toeslagen" as const, aanvragen: proef, bronnen: bron(l, "kgb.vermogen.zonder_partner") };
        if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit waren meer dan ${heel(v.grens)}.` };
        if (!ti) return { ...basis, kans: "misschien", waarom: geenBedrag };
        const bedrag = maandbedragToeslag(kindgebondenBudget(l, ti, kinderen, paar).div(12));
        if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen kindgebonden budget." };
        return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Dit is extra geld voor ouders met kinderen jonger dan 18 jaar. ${v.zin}` };
      }),
    );

  uit.push(
    probeer(() => {
      const basis = { id: "huurtoeslag", naam: "Huurtoeslag", groep: "toeslagen" as const, aanvragen: proef, bronnen: [CITATEN.htZelfstandig, ...bron(l, "ht.vermogen.zonder_partner")] };
      if (invoer.wonen !== "huur" && invoer.wonen !== "kamer") return undefined;
      if (invoer.wonen === "kamer")
        return { ...basis, kans: "nee", waarom: "Huurtoeslag is er meestal alleen voor een woning met een eigen voordeur, keuken, wc en douche." };
      const v = vermogenToets(l, invoer, paar ? "ht.vermogen.met_partner" : "ht.vermogen.zonder_partner");
      if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit op 1 januari waren meer dan ${heel(v.grens)}.` };
      // Andere volwassenen in huis (huisgenoten en kinderen van 18 of ouder): hun inkomen telt mee (art. 7 Wet op de huurtoeslag).
      // Een kind dat op 1 januari jonger is dan 23, heeft een vrijstelling. Weet iemand een inkomen niet? Dan geen bedrag.
      const volwassenKinderen = invoer.kinderen.filter((k) => k.leeftijd >= 18);
      const anderen = invoer.andereBewoners || volwassenKinderen.length > 0;
      const onbekend =
        (invoer.andereBewoners && (invoer.andereBewonersInkomenJaar === undefined || !invoer.andereBewonersAantal)) ||
        volwassenKinderen.some((k) => k.inkomenJaar === undefined);
      if (onbekend)
        return { ...basis, kans: "misschien", waarom: "Er wonen nog andere volwassenen bij u. Hun inkomen en hun geld en bezit tellen mee. Leidengeldwijzer rekent dat niet uit. Doe de proefberekening van Dienst Toeslagen." };
      const inkomenAnderen = anderen
        ? volwassenKinderen.reduce((s, k) => {
            const jong = (k.leeftijdBeginJaar ?? k.leeftijd) < 23;
            const ink = D(k.inkomenJaar!);
            return s.plus(jong ? max(NUL, ink.minus(l.bedrag("ht.vrijstelling_kind_onder_23"))) : ink);
          }, D(invoer.andereBewoners ? invoer.andereBewonersInkomenJaar! : 0))
        : NUL;
      if (anderen) basis.bronnen.push(CITATEN.htMedebewoners, ...(volwassenKinderen.length > 0 ? [CITATEN.htInkomenKind, ...bron(l, "ht.vrijstelling_kind_onder_23")] : []));
      const anderenZin = anderen
        ? " Het inkomen van de andere volwassenen in huis telt mee. Hun geld en bezit telt ook mee. Dat rekent Leidengeldwijzer niet uit."
        : "";
      if (personen.every((p) => p.leeftijd < 21))
        return { ...basis, kans: "misschien", waarom: "Leidengeldwijzer rekent de huurtoeslag voor jongeren onder de 21 jaar niet uit. Doe de proefberekening van Dienst Toeslagen." };
      if (!ti || invoer.kaleHuurPerMaand === undefined) return { ...basis, kans: "misschien", waarom: geenBedrag };
      const personenAantal = personen.length + invoer.kinderen.length + (invoer.andereBewoners ? (invoer.andereBewonersAantal ?? 0) : 0);
      const r = huurtoeslag(l, D(invoer.kaleHuurPerMaand), ti.plus(inkomenAnderen), personenAantal);
      const bedrag = maandbedragToeslag(r.perMaand);
      if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: `Met deze huur en dit inkomen krijgt u waarschijnlijk geen huurtoeslag.${anderenZin}` };
      return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Dit is geld voor uw huur. ${v.zin}${anderenZin}` };
    }),
  );

  // Kinderbijslag: hangt niet af van het inkomen. Alleen tonen als iemand het nog niet krijgt.
  const kbKinderen = invoer.kinderen.filter((k) => k.leeftijd < 18);
  if (kbKinderen.length > 0 && invoer.kinderbijslag === false)
    uit.push(
      probeer(() => {
        const perKwartaal = kbKinderen.reduce(
          (s, k) => s.plus(l.bedrag(k.leeftijd <= 5 ? "akw.kwartaal.0_5" : k.leeftijd <= 11 ? "akw.kwartaal.6_11" : "akw.kwartaal.12_17")),
          NUL,
        );
        return {
          id: "kinderbijslag",
          naam: "Kinderbijslag",
          groep: "svb",
          kans: "ja",
          bedrag: `${euro(perKwartaal)} per kwartaal`,
          waarom: "Kinderbijslag is geld voor uw kinderen tot 18 jaar. Uw inkomen maakt niet uit. U vraagt dit aan bij de Sociale Verzekeringsbank.",
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.kinderbijslag },
          bronnen: [CITATEN.kinderbijslagWie, ...bron(l, "akw.kwartaal.0_5")],
        };
      }),
    );

  // Kinderopvangtoeslag: alleen voor kinderen die naar de opvang gaan. Werken of studeren alle ouders?
  // Dan rekent Leidengeldwijzer de toeslag uit. Anders kan het misschien, bijvoorbeeld met inburgering of een traject naar werk.
  const opvang = invoer.kinderen.filter((k) => k.leeftijd < 13 && k.opvang && k.opvang.urenPerMaand > 0);
  if (opvang.length > 0)
    uit.push(
      probeer(() => {
        const basis = { id: "kot", naam: "Kinderopvangtoeslag", groep: "toeslagen" as const, aanvragen: proef, bronnen: [CITATEN.kotWie] };
        const misschien = {
          ...basis,
          kans: "misschien" as const,
          waarom:
            "Gaat uw kind naar de kinderopvang of een gastouder? Dan kunt u misschien kinderopvangtoeslag krijgen. Dat kan als u werkt of studeert. Het kan ook als u inburgert of een traject naar werk volgt. Heeft u een partner? Dan geldt dit voor u allebei.",
        };
        if (!werkenOfStuderen) return misschien;
        if (!ti) return { ...basis, kans: "misschien", waarom: geenBedrag };
        const r = kinderopvangtoeslag(l, ti, opvang as Kind[]);
        const bedrag = maandbedragToeslag(r.toeslagPerMaand);
        if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen kinderopvangtoeslag." };
        const geschat = opvang.some((k) => k.opvang!.uurprijsGeschat);
        return {
          ...basis,
          kans: "ja",
          bedrag: `ongeveer ${heel(bedrag)} per maand`,
          waarom: `Dit is geld voor de kosten van de kinderopvang. U betaalt zelf ook een deel.${
            geschat ? " U weet de prijs per uur niet. Leidengeldwijzer rekent daarom met de hoogste prijs voor de toeslag." : ""
          }`,
        };
      }),
    );

  return uit;
}

function probeer2<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch (e) {
    if (e instanceof OntbrekendeParameter) return undefined;
    throw e;
  }
}
