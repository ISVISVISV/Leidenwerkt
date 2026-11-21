/**
 * Welke regelingen kan iemand in Leiden krijgen? Rekenkern van Leidenrekent, de tweede app.
 *
 * Elke regeling geeft een uitslag: waarschijnlijk wel ("ja"), misschien, of waarschijnlijk niet ("nee"), met de reden
 * in gewone taal en de letterlijke bron. De voorwaarden staan in docs/recht/VOORWAARDEN.md, de bedragen en grenzen in
 * regels/**\/*.yaml.
 *
 * "Misschien" betekent: Leidenrekent weet het niet zeker. Bijvoorbeeld omdat iemand "Weet ik niet" antwoordde, of omdat
 * Leidenrekent een situatie niet uitrekent (andere mensen in huis, inkomen uit een eigen bedrijf). Leidenrekent zegt dan wat
 * er nog open is.
 */
import { CITATEN, naarCitaat, type Citaat } from "./citaten.ts";
import { D, NUL, euro, type Bedrag } from "./geld.ts";
import { Lezer, OntbrekendeParameter, standaardRegels, type RegelSet } from "./regels.ts";
import { brutoMaandUitNetto, brutoUitNetto } from "./modules/belasting.ts";
import { huurtoeslag, kindgebondenBudget, maandbedragToeslag, zorgtoeslag } from "./modules/toeslagen.ts";
import type { Kind } from "./types.ts";

/** Soort inkomen. "geen" sluit de andere uit. */
export type Inkomenssoort = "loon" | "uwv" | "bedrijf" | "studiefinanciering" | "ander" | "geen";

export interface CheckPersoon {
  leeftijd: number;
  soorten: Inkomenssoort[];
  /** Netto per maand, zonder vakantiegeld, zonder toeslagen en kinderbijslag. Niet gebruikt bij bijstand. */
  nettoPerMaand: number;
}

export type Woonsoort = "huur" | "kamer" | "koop" | "kostgeld" | "inwonend" | "dakloos" | "instelling";
export type JaNeeOnbekend = "ja" | "nee" | "onbekend";

export interface CheckInvoer {
  /** Rekendatum, JJJJ-MM-DD. */
  datum: string;
  aanvrager: CheckPersoon;
  partner?: CheckPersoon;
  /** Kinderen die bij de aanvrager wonen. */
  kinderen: { leeftijd: number }[];
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
  /** Geld en bezit min schulden, zonder de eigen woning. Undefined: "Weet ik niet". */
  vermogen?: number;
}

export type Kans = "ja" | "misschien" | "nee";
export type Groep = "gemeente" | "toeslagen" | "inkomen";

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

/** Leeftijd vanaf wanneer de gewone normen gelden. Voor 18, 19 en 20 jaar rekent Leidenrekent nog niet. */
const VOLWASSEN = 21;

export function checkRegelingen(invoer: CheckInvoer, regels: RegelSet = standaardRegels): Uitslag[] {
  const l = new Lezer(regels, invoer.datum);
  const paar = !!invoer.partner;
  const personen = paar ? [invoer.aanvrager, invoer.partner!] : [invoer.aanvrager];
  const minderjarig = invoer.kinderen.filter((k) => k.leeftijd < 18);
  const jong = personen.some((p) => p.leeftijd < VOLWASSEN);
  const metKinderen = invoer.kinderen.length > 0;
  const studeert = invoer.aanvrager.soorten.includes("studiefinanciering");
  const bedrijf = personen.some((p) => p.soorten.includes("bedrijf"));

  // Het sociaal minimum zonder vakantiegeld, zoals in de tabellen van de gemeente (zie VOORWAARDEN.md).
  // Controle: 120% × 95% × € 1.419,46 = € 1.618,18, het bedrag voor een alleenstaande op gemeente.leiden.nl.
  const zonderVakantiegeld = (norm: Bedrag) => norm.times(D(1).minus(l.breuk("pw.vakantietoeslag")));
  const minimum = (): Bedrag | undefined => {
    if (jong) return undefined;
    if (invoer.wonen === "instelling") return paar ? undefined : zonderVakantiegeld(l.bedrag("pw.norm.inrichting.alleenstaande"));
    return zonderVakantiegeld(l.bedrag(paar ? "pw.norm.gehuwden" : "pw.norm.alleenstaande"));
  };
  // Met bijstand telt de norm als inkomen: de bijstand vult aan tot de norm (praktijk van de gemeente, 13 november 2026).
  const inkomen = invoer.bijstand ? undefined : personen.reduce((s, p) => s.plus(D(p.nettoPerMaand)), NUL);

  /** Grens van een Leidse regeling: deel van het sociaal minimum. Zonder id: het sociaal minimum zelf (100%). */
  const toets = (pctId?: string): { kans: Kans; grens?: Bedrag } => {
    const min = minimum();
    if (!min) return { kans: "misschien" };
    const grens = pctId ? min.times(l.breuk(pctId)) : min;
    if (!inkomen) return { kans: "ja", grens };
    return { kans: inkomen.lte(grens) ? "ja" : "nee", grens };
  };
  const grensZin = (grens?: Bedrag) =>
    grens ? ` De grens voor uw huishouden is ongeveer ${heel(grens)} netto per maand, zonder vakantiegeld.` : "";
  const waaromInkomen = (kans: Kans, grens?: Bedrag): string => {
    if (!grens) return jong
      ? "Voor jongeren van 18, 19 en 20 jaar rekent Leidenrekent de grens nog niet uit. Vraag het de gemeente."
      : "Voor uw woonsituatie rekent Leidenrekent de grens niet uit. Vraag het de gemeente.";
    if (invoer.bijstand) return `Met bijstand is uw inkomen niet hoger dan de grens.${grensZin(grens)}`;
    return `${kans === "ja" ? "Uw inkomen is niet hoger dan de grens." : "Uw inkomen is hoger dan de grens."}${grensZin(grens)}`;
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
        return { ...basis, kans: "nee", waarom: "Wie in een instelling woont, kan de Sleutelpas niet krijgen." };
      if (studeert && minderjarig.length === 0)
        return { ...basis, kans: "nee", waarom: "Met studiefinanciering kunt u de Sleutelpas niet krijgen. Dat kan wel als u ook voor een kind zorgt." };
      if (invoer.bijstand)
        return { ...basis, kans: "ja", waarom: "Met bijstand krijgt u de Sleutelpas vanzelf. U hoeft hem niet aan te vragen." };
      const kans = bedrijf && t.kans !== "nee" ? "misschien" : t.kans;
      return { ...basis, kans, waarom: `Met de Sleutelpas krijgt u korting op sport, cultuur en uitjes. ${waaromInkomen(t.kans, t.grens)}${bedrijf ? bedrijfZin : ""}` };
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
          return { ...basis, kans: "nee", waarom: "Het Kindtegoed is voor kinderen voor wie u kinderbijslag krijgt." };
        const kans = bedrijf && t.kans !== "nee" ? "misschien" : t.kans;
        return { ...basis, kans, waarom: `Geld op de Sleutelpas voor schoolspullen, sport en cultuur van uw kinderen. ${waaromInkomen(t.kans, t.grens)}` };
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
          waarom: `Een bon voor een laptop op de Sleutelpas. Kinderen van 4 tot en met 11 jaar krijgen samen 1 laptop. Kinderen van 12 tot en met 17 jaar krijgen elk een laptop. Dit hoort bij de Sleutelpas.`,
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
          bedrag: `Zwemdiploma A helemaal, B of C ${bc}`,
          waarom: `Voor kinderen vanaf ${vanaf.toString()} jaar, via het Jeugdfonds Sport & Cultuur. ${waaromInkomen(t.kans, t.grens)}`,
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
        waarom: `Het Volwassenenfonds Sport & Cultuur betaalt een sport of activiteit voor u. Aanvragen gaat via een tussenpersoon. ${waaromInkomen(t.kans, t.grens)}`,
        aanvragen: { tekst: "Meer informatie", url: URL.sportCultuur },
        bronnen: [...bron(l, "leiden.volwassenenfonds.inkomensgrens"), CITATEN.volwassenentegoed],
      };
    }),
  );

  // Gemeentepolis: tot 120%. Ondernemers: een jaargrens die Leidenrekent niet uitrekent.
  uit.push(
    probeer(() => {
      const t = toets("leiden.gemeentepolis.inkomensgrens");
      return {
        id: "gemeentepolis",
        naam: "Zorgverzekering van de gemeente",
        groep: "gemeente",
        kans: bedrijf && t.kans !== "nee" ? "misschien" : t.kans,
        waarom: `De Gemeentepolis is de zorgverzekering van de gemeente, met een aanvullende verzekering. Nieuwe klanten melden zich aan tussen 12 november en 31 december. ${waaromInkomen(t.kans, t.grens)}${bedrijf ? " Voor zzp'ers geldt een grens per jaar." : ""}`,
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
        waarom: `Gratis reizen met de streekbus, buiten de spits. Het aantal passen is beperkt. ${waaromInkomen(t.kans, t.grens)}`,
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
      if (studeert) return { ...basis, kans: "nee", waarom: `Met studiefinanciering in de afgelopen ${jaren} jaar kunt u deze toeslag niet krijgen.` };
      const v = vermogenToets(l, invoer, paar ? "pw.vermogensgrens.gehuwden" : metKinderen ? "pw.vermogensgrens.alleenstaande_ouder" : "pw.vermogensgrens.alleenstaande");
      const t = toets();
      if (t.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw inkomen is hoger dan de bijstand.${grensZin(t.grens)}` };
      if (invoer.langLaagInkomen === "nee") return { ...basis, kans: "nee", waarom: `Deze toeslag is voor mensen die al ${jaren} jaar of langer een laag inkomen hebben.` };
      if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}.` };
      const open = invoer.langLaagInkomen !== "ja" || v.kans === "misschien" || t.kans === "misschien" || bedrijf;
      return {
        ...basis,
        kans: open ? "misschien" : "ja",
        waarom: `Extra geld voor mensen die al ${jaren} jaar of langer een laag inkomen hebben en geen kans op meer inkomen. ${v.zin}`,
      };
    }),
  );

  // Tegemoetkoming alleenverdieners: partner, grootste inkomen een UWV-uitkering, onder 100%, vermogen als zorgtoeslag.
  if (paar)
    uit.push(
      probeer(() => {
        const grootste = personen.reduce((a, b) => (b.nettoPerMaand > a.nettoPerMaand ? b : a));
        const uwv = !invoer.bijstand && grootste.soorten.includes("uwv");
        const basis = {
          id: "alleenverdieners",
          naam: "Tegemoetkoming voor alleenverdieners",
          groep: "gemeente" as const,
          bedrag: `${heel(l.bedrag("leiden.alleenverdieners.bedrag"))} per jaar`,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.alleenverdieners },
          bronnen: [...bron(l, "leiden.alleenverdieners.bedrag"), ...bron(l, "zt.vermogen.met_partner")],
        };
        if (!uwv) return { ...basis, kans: "nee", waarom: "Deze tegemoetkoming is voor stellen waarvan het grootste inkomen een uitkering van UWV is, zoals Wajong." };
        const t = toets();
        if (t.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw netto inkomen samen is niet lager dan de bijstand voor stellen.${grensZin(t.grens)}` };
        const v = vermogenToets(l, invoer, "zt.vermogen.met_partner");
        if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit samen zijn meer dan ${heel(v.grens)}.` };
        return {
          ...basis,
          kans: t.kans === "misschien" || v.kans === "misschien" ? "misschien" : "ja",
          waarom: `Voor stellen met een uitkering van UWV en weinig ander inkomen. Uw inkomen samen is lager dan de bijstand voor stellen.${grensZin(t.grens)} De gemeente kijkt ook of u minder overhoudt dan met alleen bijstand.`,
        };
      }),
    );

  // Studietoeslag (art. 36b Pw): studiefinanciering, en door ziekte of handicap niet kunnen werken naast de studie.
  if (studeert)
    uit.push(
      probeer(() => {
        const a = invoer.aanvrager.leeftijd;
        const id = a >= 21 ? "pw.studietoeslag.21" : a === 20 ? "pw.studietoeslag.20" : a === 19 ? "pw.studietoeslag.19" : "pw.studietoeslag.18";
        const uwv = invoer.aanvrager.soorten.includes("uwv");
        const basis = {
          id: "studietoeslag",
          naam: "Studietoeslag",
          groep: "gemeente" as const,
          bedrag: `minstens ${euro(l.bedrag(id))} per maand`,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.studietoeslag },
          bronnen: [CITATEN.pw36b, ...bron(l, id)],
        };
        if (invoer.studieMedisch === "nee")
          return { ...basis, kans: "nee", waarom: "Studietoeslag is voor studenten die door ziekte of een handicap niet kunnen werken naast hun studie." };
        return {
          ...basis,
          kans: uwv ? "misschien" : "ja",
          waarom: `Voor studenten met studiefinanciering die door ziekte of een handicap niet kunnen werken naast hun studie. De gemeente vraagt meestal een arts om advies.${uwv ? " Met een Wajong-uitkering kunt u geen studietoeslag krijgen." : ""}`,
        };
      }),
    );

  // Bijstand: alleen een melding. Onder de norm en onder de vermogensgrens: misschien recht op bijstand.
  if (!invoer.bijstand)
    uit.push(
      probeer(() => {
        const basis = {
          id: "bijstand",
          naam: "Bijstand",
          groep: "inkomen" as const,
          aanvragen: { tekst: "Meer informatie en aanvragen", url: URL.bijstand },
          bronnen: [CITATEN.pw13studie, ...bron(l, "pw.norm.alleenstaande"), ...bron(l, "pw.vermogensgrens.alleenstaande")],
        };
        if (studeert && invoer.aanvrager.leeftijd < 27)
          return { ...basis, kans: "nee", waarom: "Bent u jonger dan 27 jaar en krijgt u studiefinanciering? Dan kunt u geen bijstand krijgen." };
        const t = toets();
        if (t.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw inkomen is hoger dan de bijstand.${grensZin(t.grens)}` };
        const v = vermogenToets(l, invoer, paar ? "pw.vermogensgrens.gehuwden" : metKinderen ? "pw.vermogensgrens.alleenstaande_ouder" : "pw.vermogensgrens.alleenstaande");
        if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit zijn meer dan ${heel(v.grens)}. Dan moet u eerst dat geld gebruiken.` };
        return {
          ...basis,
          kans: "misschien",
          waarom: `Uw inkomen is lager dan de bijstand.${grensZin(t.grens)} ${v.zin} De gemeente kijkt ook naar uw woonsituatie en wie er bij u wonen.`,
        };
      }),
    );

  // Landelijke toeslagen, met de rekenkern van Leidenwerkt.
  uit.push(...toeslagen(l, invoer, personen));

  return uit.filter((u): u is Uitslag => !!u);
}

/** Vermogen tegen een grens. Bij een koopwoning telt een deel van de woning mee voor de bijstand: dan misschien. */
function vermogenToets(l: Lezer, invoer: CheckInvoer, grensId: string): { kans: Kans; grens: Bedrag; zin: string } {
  const grens = l.bedrag(grensId);
  if (invoer.vermogen === undefined)
    return { kans: "misschien", grens, zin: `U weet niet hoeveel geld en bezit u heeft. De grens is ${heel(grens)}.` };
  if (D(invoer.vermogen).gt(grens)) return { kans: "nee", grens, zin: "" };
  if (invoer.wonen === "koop" && grensId.startsWith("pw."))
    return { kans: "misschien", grens, zin: `Uw geld en bezit zijn niet meer dan ${heel(grens)}. De gemeente kijkt ook naar de waarde van uw huis.` };
  return { kans: "ja", grens, zin: `Uw geld en bezit zijn niet meer dan ${heel(grens)}.` };
}

/** Toetsingsinkomen per jaar (bruto), afgeleid uit het netto inkomen. Undefined als Leidenrekent het niet kan afleiden. */
function toetsingsinkomen(l: Lezer, invoer: CheckInvoer, personen: CheckPersoon[]): Bedrag | undefined {
  if (invoer.bijstand) {
    // Zoals Leidenwerkt: de bijstand (met vakantietoeslag) als uitkering, bij een paar half om half.
    const norm = l.bedrag(personen.length > 1 ? "pw.norm.gehuwden" : "pw.norm.alleenstaande").times(12);
    return personen.length > 1 ? brutoUitNetto(l, norm.div(2)).times(2) : brutoUitNetto(l, norm);
  }
  const vg = l.breuk("wml.vakantiebijslag");
  let totaal = NUL;
  for (const p of personen) {
    const s = p.soorten.filter((x) => x !== "geen");
    if (s.length === 0 || p.nettoPerMaand <= 0) continue;
    if (s.length > 1 || s[0] === "bedrijf" || s[0] === "studiefinanciering") return undefined;
    const netto = D(p.nettoPerMaand);
    totaal = totaal.plus(
      s[0] === "loon" ? brutoMaandUitNetto(l, netto, vg).times(12).times(vg.plus(1)) : brutoUitNetto(l, netto.times(12).times(vg.plus(1))),
    );
  }
  return totaal;
}

function toeslagen(l: Lezer, invoer: CheckInvoer, personen: CheckPersoon[]): (Uitslag | undefined)[] {
  const paar = personen.length > 1;
  const ti = probeer2(() => toetsingsinkomen(l, invoer, personen));
  const proef = { tekst: "Proefberekening van Dienst Toeslagen", url: URL.toeslagen };
  const geenBedrag =
    "Leidenrekent kan uw toeslag niet uitrekenen met dit soort inkomen. Doe de proefberekening van Dienst Toeslagen.";
  const kinderen: Kind[] = invoer.kinderen.map((k) => ({ leeftijd: k.leeftijd }));
  const uit: (Uitslag | undefined)[] = [];

  uit.push(
    probeer(() => {
      const v = vermogenToets(l, invoer, paar ? "zt.vermogen.met_partner" : "zt.vermogen.zonder_partner");
      const basis = { id: "zorgtoeslag", naam: "Zorgtoeslag", groep: "toeslagen" as const, aanvragen: proef, bronnen: bron(l, "zt.vermogen.zonder_partner") };
      if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit op 1 januari waren meer dan ${heel(v.grens)}.` };
      if (!ti) return { ...basis, kans: "misschien", waarom: geenBedrag };
      const bedrag = maandbedragToeslag(zorgtoeslag(l, ti, paar).div(12));
      if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen zorgtoeslag." };
      return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Hulp bij de kosten van uw zorgverzekering. ${v.zin}` };
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
        return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Extra geld voor ouders met kinderen jonger dan 18. ${v.zin}` };
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
      const volwassenKind = invoer.kinderen.some((k) => k.leeftijd >= 18);
      if (invoer.andereBewoners || volwassenKind)
        return { ...basis, kans: "misschien", waarom: "Er wonen nog andere volwassenen bij u. Hun inkomen en vermogen tellen mee. Leidenrekent rekent dat niet uit. Doe de proefberekening van Dienst Toeslagen." };
      if (personen.every((p) => p.leeftijd < 21))
        return { ...basis, kans: "misschien", waarom: "Voor jongeren onder de 21 jaar rekent Leidenrekent de huurtoeslag niet uit. Doe de proefberekening van Dienst Toeslagen." };
      if (!ti || invoer.kaleHuurPerMaand === undefined) return { ...basis, kans: "misschien", waarom: geenBedrag };
      const personenAantal = personen.length + invoer.kinderen.length;
      const r = huurtoeslag(l, D(invoer.kaleHuurPerMaand), ti, personenAantal);
      const bedrag = maandbedragToeslag(r.perMaand);
      if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met deze huur en dit inkomen krijgt u waarschijnlijk geen huurtoeslag." };
      return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Hulp bij het betalen van uw huur. ${v.zin}` };
    }),
  );

  if (invoer.kinderen.some((k) => k.leeftijd < 13))
    uit.push({
      id: "kot",
      naam: "Kinderopvangtoeslag",
      groep: "toeslagen",
      kans: "misschien",
      waarom:
        "Gaat uw kind naar een kinderopvang of gastouder? Dan kunt u kinderopvangtoeslag krijgen als u werkt, studeert, inburgert of een traject naar werk volgt. Met een partner geldt dat voor u allebei.",
      aanvragen: proef,
      bronnen: [CITATEN.kotWie],
    });

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
