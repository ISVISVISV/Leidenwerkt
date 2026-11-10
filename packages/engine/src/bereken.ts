/**
 * Vergelijkt de huidige situatie met de situatie na (meer) werken.
 * Elke post wordt los berekend; ontbreekt een regel, dan wordt die post
 * niet berekend en valt hij buiten het verschil, in plaats van te gokken.
 * Elke post zegt of hij het verschil beïnvloedt en welke kant hij op gaat,
 * zodat de app kan melden hoe betrouwbaar het kopgetal is.
 */
import { D, NUL, centen, euro, max, type Bedrag } from "./geld.ts";
import { Lezer, OntbrekendeParameter, standaardRegels, type RegelSet } from "./regels.ts";
import { nettoLoon, brutoUitNetto, brutoMaandUitNetto, stuksgewijs, type LoonUitkomst } from "./modules/belasting.ts";
import { bijstandsnorm, aanvulling, woonkorting } from "./modules/bijstand.ts";
import { vrijlating } from "./modules/vrijlating.ts";
import { zorgtoeslag, kindgebondenBudget, huurtoeslag, kinderopvangtoeslag, maandbedragToeslag } from "./modules/toeslagen.ts";
import { regimeOp } from "./regimes.ts";
import { CITATEN, naarCitaat, type Citaat } from "./citaten.ts";
import type {
  Betrouwbaarheid,
  Fase,
  Invloed,
  Invoer,
  Post,
  PostStatus,
  Postsoort,
  Resultaat,
  Richting,
  Signaal,
  Situatie,
  Stap,
  TerugbetaalRisico,
  Werk,
} from "./types.ts";

const STATUS_VOLGORDE: PostStatus[] = ["ontbrekend", "onbevestigd", "geverifieerd", "invoer"];

/** Of een post het verschil beïnvloedt en wat hij doet als het inkomen uit werk stijgt. */
export const INVLOED: Record<string, { invloed: Invloed; richting?: Richting }> = {
  loon: { invloed: "ja", richting: "stijgt" },
  loon_partner: { invloed: "nee" },
  ander_inkomen: { invloed: "nee" },
  bijstand: { invloed: "ja", richting: "daalt" },
  zorgtoeslag: { invloed: "ja", richting: "daalt" },
  huurtoeslag: { invloed: "ja", richting: "daalt" },
  kgb: { invloed: "ja", richting: "daalt" },
  kinderbijslag: { invloed: "nee" },
  kot: { invloed: "ja", richting: "stijgt" },
  opvangkosten: { invloed: "ja", richting: "daalt" },
  bb_opvang: { invloed: "ja", richting: "wisselt" },
  iack: { invloed: "ja", richting: "stijgt" },
  reisvergoeding: { invloed: "ja", richting: "stijgt" },
  werkkosten: { invloed: "ja", richting: "daalt" },
};

class Afhankelijk extends Error {}

interface Bouw {
  l: Lezer;
  stap: (tekst: string, bedrag?: Bedrag) => void;
  aanname: (tekst: string) => void;
}

/** Bouwt één post. Geeft null als de post niet van toepassing is. */
function maakPost(
  regels: RegelSet,
  datum: string,
  id: string,
  label: string,
  soort: Postsoort,
  fn: (b: Bouw) => Bedrag | null,
): Post | null {
  const l = new Lezer(regels, datum);
  const stappen: Stap[] = [];
  const aannames: string[] = [];
  const b: Bouw = {
    l,
    stap: (tekst, bedrag) => stappen.push({ tekst, bedrag: bedrag ? centen(bedrag) : undefined }),
    aanname: (t) => aannames.push(t),
  };
  const meta = INVLOED[id] ?? { invloed: "onbekend" as const };
  try {
    const bedrag = fn(b);
    if (bedrag === null) return null;
    return { id, label, soort, perMaand: centen(bedrag), status: laagste(l), stappen, parameters: l.gebruikt, aannames, ...meta };
  } catch (e) {
    if (e instanceof OntbrekendeParameter || e instanceof Afhankelijk) {
      const reden =
        e instanceof OntbrekendeParameter
          ? "De bedragen hiervoor zijn voor deze datum nog niet bekend."
          : e.message;
      const ontbrekendeParameter = e instanceof OntbrekendeParameter ? e.parameterId : undefined;
      return { id, label, soort, perMaand: null, status: "ontbrekend", stappen, parameters: l.gebruikt, aannames, reden, ontbrekendeParameter, ...meta };
    }
    throw e;
  }
}

function laagste(l: Lezer): PostStatus {
  let laagst: PostStatus = "invoer";
  for (const p of l.gebruikt) if (STATUS_VOLGORDE.indexOf(p.status) < STATUS_VOLGORDE.indexOf(laagst)) laagst = p.status;
  return laagst;
}

/** Vakantiegeld van een baan als breuk. Na `metVakantiegeld` altijd ingevuld. */
function vgVan(w: Werk | undefined): Bedrag {
  return D(w?.vakantiegeld ?? 0);
}

/**
 * Vult bij elke baan het vakantiegeld in met het wettelijke minimum uit de
 * regeldata (art. 15 Wml), als de invoer het niet zelf noemt.
 */
export function metVakantiegeld(invoer: Invoer, regels: RegelSet = standaardRegels): Invoer {
  let standaard: number | undefined;
  try {
    standaard = Number(new Lezer(regels, invoer.datum).breuk("wml.vakantiebijslag").toString());
  } catch (e) {
    if (!(e instanceof OntbrekendeParameter)) throw e;
  }
  const vul = (w: Werk | undefined): Werk | undefined =>
    w && { ...w, vakantiegeld: w.vakantiegeld ?? standaard, bijbaan: w.bijbaan ? vul(w.bijbaan) : undefined };
  return {
    ...invoer,
    nieuwWerk: vul(invoer.nieuwWerk)!,
    huidigWerk: vul(invoer.huidigWerk),
    partner: invoer.partner && { ...invoer.partner, werk: vul(invoer.partner.werk) },
  };
}

/** Bruto jaarloon exclusief vakantiegeld. */
function brutoJaarExcl(w: Werk | undefined): Bedrag {
  return eigenBrutoJaarExcl(w).plus(w?.bijbaan ? brutoJaarExcl(w.bijbaan) : NUL);
}

/** Bruto jaarloon exclusief vakantiegeld van deze baan, zonder bijbaan. */
function eigenBrutoJaarExcl(w: Werk | undefined): Bedrag {
  if (!w) return NUL;
  const f = D(w.urenFactor ?? 1);
  if (w.brutoMaandloon !== undefined) return D(w.brutoMaandloon).times(12).times(f);
  if (w.brutoVierwekenloon !== undefined) return D(w.brutoVierwekenloon).times(13).times(f);
  if (w.brutoUurloon !== undefined && w.urenPerWeek !== undefined) return D(w.brutoUurloon).times(w.urenPerWeek).times(52).times(f);
  return NUL;
}

/**
 * Zet een netto maandloon om naar een bruto maandloon, met de regels van de
 * rekendatum. Ontbreken die regels, dan blijft het werk ongewijzigd en meldt
 * de post 'Netto loon' dat het niet berekend kon worden.
 */
function metBruto(w: Werk | undefined, regels: RegelSet, datum: string): Werk | undefined {
  if (w?.bijbaan) {
    const { bijbaan, ...hoofd } = w;
    return { ...metBruto(hoofd, regels, datum)!, bijbaan: metBruto(bijbaan, regels, datum) };
  }
  if (!w || w.nettoMaandloon === undefined || w.brutoMaandloon !== undefined) return w;
  try {
    const l = new Lezer(regels, datum);
    const bruto = brutoMaandUitNetto(l, D(w.nettoMaandloon), vgVan(w));
    return { ...w, brutoMaandloon: Number(bruto.toFixed(2)) };
  } catch (e) {
    if (e instanceof OntbrekendeParameter) return w;
    throw e;
  }
}

/** Gemiddeld bruto maandloon exclusief vakantiegeld. */
export function brutoMaandloon(w: Werk | undefined): Bedrag {
  return brutoJaarExcl(w).div(12);
}

function brutoJaarloon(w: Werk | undefined): Bedrag {
  const vg = vgVan(w);
  return eigenBrutoJaarExcl(w).times(vg.plus(1)).plus(w?.bijbaan ? brutoJaarloon(w.bijbaan) : NUL);
}

function pensioenJaar(w: Werk | undefined): Bedrag {
  return D(w?.pensioenpremiePerMaand ?? 0).times(12).plus(w?.bijbaan ? pensioenJaar(w.bijbaan) : NUL);
}

interface Kern {
  loon?: LoonUitkomst;
  loonPartner?: LoonUitkomst;
  nettoMaand?: Bedrag;
  nettoPartnerMaand?: Bedrag;
  bijstandMaand?: Bedrag;
}

const AFGEROND = "Afgerond naar beneden op hele euro's, zoals Dienst Toeslagen doet";

function situatie(invoer: Invoer, regels: RegelSet, naam: "huidig" | "werk", werk: Werk | undefined, fase: Fase): Post[] {
  const datum = invoer.datum;
  const paar = invoer.leefvorm === "paar";
  const partnerWerk = invoer.partner?.werk;
  const kern: Kern = {};
  const posten: (Post | null)[] = [];
  const nodig = <T>(v: T | undefined, wat: string): T => {
    if (v === undefined) throw new Afhankelijk(`Kan niet worden berekend omdat ${wat} ontbreekt`);
    return v;
  };

  // 1. Netto loon
  posten.push(
    maakPost(regels, datum, "loon", "Netto loon", "inkomen", ({ l, stap, aanname }) => {
      const bruto = brutoJaarloon(werk);
      if (bruto.isZero()) return null;
      const r = nettoLoon(l, bruto, pensioenJaar(werk));
      kern.loon = r;
      kern.nettoMaand = r.nettoJaar.div(12);
      if (werk?.nettoMaandloon !== undefined) {
        stap("Netto maandloon dat u invulde (zonder vakantiegeld)", D(werk.nettoMaandloon).times(werk.urenFactor ?? 1));
        aanname("U vulde netto loon in. De rekenhulp rekent dat terug naar bruto. Uw echte bruto loon kan iets anders zijn.");
      }
      if (werk?.brutoVierwekenloon !== undefined) stap("Bruto loon per 4 weken", D(werk.brutoVierwekenloon).times(werk.urenFactor ?? 1));
      stap("Bruto loon per maand (gemiddeld, zonder vakantiegeld)", brutoMaandloon(werk));
      if (werk?.vakantiegeld === undefined || D(werk.vakantiegeld).gt(0)) l.breuk("wml.vakantiebijslag");
      stap(
        `Vakantiegeld per maand (gemiddeld, ${vgVan(werk).times(100).toString().replace(".", ",")}% van het bruto loon)`,
        bruto.div(12).minus(brutoMaandloon(werk)),
      );
      if (werk?.vakantiegeldOnzeker) {
        aanname("U wist niet of het vakantiegeld al in uw uurloon zit. Er is gerekend met vakantiegeld erbij. Zit het er al in (all-in), dan houdt u iets minder over dan hier staat.");
      }
      if (werk?.vakantiegeld === 0) aanname("U gaf aan dat het vakantiegeld al in uw uurloon zit (all-in). Er is daarom geen vakantiegeld bij opgeteld.");
      stap("Loonbelasting en premies per maand", r.belasting.div(12));
      stap("Korting daarop: algemene heffingskorting per maand", r.ahk.div(12));
      stap("Korting daarop: arbeidskorting per maand", r.arbeidskorting.div(12));
      stap("U betaalt per maand aan belasting en premies", r.heffing.div(12));
      stap("Netto per maand (gemiddeld, inclusief vakantiegeld)", r.nettoJaar.div(12));
      aanname("Het vakantiegeld is over 12 maanden verdeeld; in werkelijkheid komt het meestal in mei of juni.");
      if (werk?.brutoVierwekenloon !== undefined) {
        aanname("Bij een vierwekenloon krijgt u 13 keer per jaar loon. Het loon is hier omgerekend naar een gemiddelde maand.");
      }
      aanname("Netto loon is benaderd met een jaarberekening; de loonstrook kan een paar euro afwijken.");
      if (werk?.bijbaan) {
        stap("Waarvan het extra werk, bruto per maand (zonder vakantiegeld)", brutoMaandloon(werk.bijbaan));
        aanname("Met twee banen is de belasting berekend over het totaal, zoals bij de belastingaangifte. Op de loonstroken kan het anders verdeeld zijn, omdat maar één werkgever de heffingskorting toepast.");
      }
      return kern.nettoMaand;
    }),
  );

  if (paar) {
    posten.push(
      maakPost(regels, datum, "loon_partner", "Netto loon partner", "inkomen", ({ l, stap }) => {
        const bruto = brutoJaarloon(partnerWerk);
        if (bruto.isZero()) return null;
        const r = nettoLoon(l, bruto, pensioenJaar(partnerWerk));
        kern.loonPartner = r;
        kern.nettoPartnerMaand = r.nettoJaar.div(12);
        stap("Bruto loon per maand (gemiddeld, zonder vakantiegeld)", brutoMaandloon(partnerWerk));
        stap("Netto per maand (gemiddeld, inclusief vakantiegeld)", r.nettoJaar.div(12));
        return kern.nettoPartnerMaand;
      }),
    );
  }

  // Ander inkomen (alimentatie, andere uitkering): in beide situaties gelijk.
  const ander = D(invoer.anderInkomenPerMaand ?? 0);
  if (ander.gt(0)) {
    posten.push(
      maakPost(regels, datum, "ander_inkomen", "Ander inkomen", "inkomen", ({ stap }) => {
        stap("Uw andere inkomen per maand, zoals u het invulde (netto)", ander);
        return ander;
      }),
    );
  }

  // 2. Bijstand
  const heeftJongKind = invoer.kinderen.some((k) => k.leeftijd < 12);
  posten.push(
    maakPost(regels, datum, "bijstand", "Bijstand", "inkomen", ({ l, stap, aanname }) => {
      const eigen = brutoJaarloon(werk).isZero() ? NUL : nodig(kern.nettoMaand, "het netto loon");
      const partner = brutoJaarloon(partnerWerk).isZero() ? NUL : nodig(kern.nettoPartnerMaand, "het netto loon van de partner");
      const basisnorm = bijstandsnorm(l, invoer);
      const korting = woonkorting(l, invoer);
      const norm = basisnorm.norm.minus(korting.bedrag);
      const uitleg = basisnorm.uitleg;
      const inkomen = eigen.plus(partner).plus(ander);
      if (!korting.bedrag.isZero()) {
        stap(uitleg, basisnorm.norm);
        stap(korting.tekst, korting.bedrag.neg());
        aanname(korting.aanname);
      }
      if (inkomen.isZero()) {
        stap(korting.bedrag.isZero() ? `${uitleg}. Zonder inkomen krijgt u de hele norm` : "Uw norm. Zonder inkomen krijgt u de hele norm", norm);
      } else {
        stap(korting.bedrag.isZero() ? uitleg : "Uw norm", norm);
        if (!eigen.isZero()) stap("Uw netto loon", eigen);
        if (!partner.isZero()) stap("Netto loon van uw partner", partner);
        if (!ander.isZero()) stap("Uw andere inkomen. Dit gaat helemaal van de bijstand af", ander);
      }
      const v1 = vrijlating(l, {
        fase,
        nettoArbeid: eigen,
        leeftijd: invoer.leeftijd,
        alleenstaandeOuderMetJongKind: invoer.leefvorm === "alleenstaande_ouder" && heeftJongKind,
        medischUrenbeperkt: invoer.medischUrenbeperkt,
        overgang: invoer.overgang2027,
        huishoudinkomen: inkomen,
        norm,
      });
      const vrij = v1.bedrag;
      if (!eigen.isZero()) stap(`Mag u houden: ${v1.uitleg.charAt(0).toLowerCase()}${v1.uitleg.slice(1)}`, vrij);
      if (!partner.isZero()) aanname("Voor het loon van uw partner is geen vrijlating meegerekend.");
      v1.aannames.forEach(aanname);
      const bijstand = aanvulling(norm, inkomen, vrij);
      if (!inkomen.isZero()) {
        const formule = vrij.isZero()
          ? `${euro(norm)} − ${euro(inkomen)}`
          : `${euro(norm)} − (${euro(inkomen)} − ${euro(vrij)})`;
        // De formule bevat de uitkomst al; geen apart bedrag ernaast.
        stap(bijstand.isZero() ? `Bijstand: ${formule} is minder dan nul, dus geen bijstand` : `Bijstand: ${formule} = ${euro(bijstand)}`);
      }
      kern.bijstandMaand = bijstand;
      aanname("Bijstand is netto en inclusief vakantietoeslag per maand gerekend; de gemeente betaalt de vakantietoeslag één keer per jaar uit.");
      aanname("De rekenhulp neemt aan dat u aan de regels voor bijstand voldoet, en dat uw spaargeld en bezit onder de grens voor bijstand en toeslagen blijven.");
      return bijstand;
    }),
  );

  // Toetsingsinkomen voor toeslagen (jaar, bruto, huishouden).
  const toetsingsinkomen = (l: Lezer, stap: Bouw["stap"], aanname: Bouw["aanname"]): Bedrag => {
    const bijstandJaar = nodig(kern.bijstandMaand, "de bijstand").times(12);
    const brutoBijstand = brutoUitNetto(l, bijstandJaar.plus(ander.times(12)));
    if (ander.gt(0)) {
      aanname("Uw andere inkomen is voor de toeslagen omgerekend naar bruto, alsof het een uitkering is. Kinderalimentatie telt bij Dienst Toeslagen niet mee; dan krijgt u iets meer toeslag dan hier staat.");
    }
    const loon = brutoJaarloon(werk).minus(pensioenJaar(werk)).plus(brutoJaarloon(partnerWerk).minus(pensioenJaar(partnerWerk)));
    const ti = loon.plus(brutoBijstand);
    if (loon.gt(0) && brutoBijstand.gt(0)) {
      stap("Bruto loon per jaar, met vakantiegeld", loon);
      stap(ander.gt(0) ? "Bijstand en ander inkomen per jaar, teruggerekend naar bruto" : "Bijstand per jaar, teruggerekend naar bruto", brutoBijstand);
    }
    stap("Geschat bruto inkomen per jaar van uw huishouden (Dienst Toeslagen kijkt naar het hele jaar)", ti);
    aanname("Het bruto bedrag van de bijstand is teruggerekend uit het netto bedrag; Dienst Toeslagen gebruikt het werkelijke bruto bedrag.");
    aanname("Dit is het inkomen bij een heel jaar in deze situatie. Begint het werk halverwege het jaar, dan ligt het inkomen over dat jaar ertussenin.");
    return ti;
  };

  // 3. Zorgtoeslag
  posten.push(
    maakPost(regels, datum, "zorgtoeslag", "Zorgtoeslag", "toeslag", ({ l, stap, aanname }) => {
      const ti = toetsingsinkomen(l, stap, aanname);
      const jaar = zorgtoeslag(l, ti, paar);
      const maand = maandbedragToeslag(jaar.div(12));
      stap(`Zorgtoeslag per maand. ${AFGEROND}`, maand);
      return maand;
    }),
  );

  // 4. Huurtoeslag
  if (invoer.wonen.soort === "huur" && invoer.wonen.kaleHuurPerMaand && invoer.wonen.zelfstandig !== false) {
    const wonen = invoer.wonen;
    posten.push(
      maakPost(regels, datum, "huurtoeslag", "Huurtoeslag", "toeslag", ({ l, stap, aanname }) => {
        const huisgenoten = invoer.kostendelers + (invoer.jongeHuisgenoten ?? 0);
        if (huisgenoten > 0 && invoer.huisgenotenInkomenJaar === undefined) {
          throw new Afhankelijk(
            "Het inkomen van uw huisgenoten telt mee voor de huurtoeslag. Vul bij 'Uw woning' in wat zij samen per jaar verdienen.",
          );
        }
        let rekeninkomen = toetsingsinkomen(l, stap, aanname);
        if (invoer.huisgenotenInkomenJaar !== undefined) {
          const anderen = D(invoer.huisgenotenInkomenJaar);
          stap("Plus het inkomen per jaar van uw huisgenoten (dit telt mee voor de huurtoeslag)", anderen);
          rekeninkomen = rekeninkomen.plus(anderen);
          stap("Inkomen per jaar van iedereen in huis samen", rekeninkomen);
        }
        const personen = 1 + (paar ? 1 : 0) + invoer.kinderen.length + huisgenoten;
        const h = huurtoeslag(l, D(wonen.kaleHuurPerMaand ?? 0), rekeninkomen, personen);
        stap("Rekenhuur: de kale huur, tot de maximale huurgrens", h.rekenhuur);
        stap("Basishuur: dit deel betaalt u altijd zelf", h.basishuur);
        if (!h.deelA.isZero()) stap("Deel A: het deel boven de basishuur tot de kwaliteitskortingsgrens, 100% vergoed", h.deelA);
        if (!h.deelB.isZero()) stap("Deel B: het deel tot de aftoppingsgrens, 65% vergoed", h.deelB);
        if (!h.deelC.isZero()) stap("Deel C: het deel boven de aftoppingsgrens, 40% vergoed", h.deelC);
        if (!h.correctie.isZero()) stap("Min de correctie omdat het inkomen boven het minimum-inkomensijkpunt ligt", h.correctie);
        const maand = maandbedragToeslag(h.perMaand);
        stap(`Huurtoeslag per maand. ${AFGEROND}`, maand);
        if (wonen.servicekostenPerMaand) aanname("Servicekosten tellen sinds 2026 niet meer mee voor de huurtoeslag.");
        return maand;
      }),
    );
  }

  // 5. Kindgebonden budget en kinderbijslag
  const minderjarig = invoer.kinderen.filter((k) => k.leeftijd < 18);
  if (minderjarig.length > 0) {
    posten.push(
      maakPost(regels, datum, "kgb", "Kindgebonden budget", "toeslag", ({ l, stap, aanname }) => {
        const ti = toetsingsinkomen(l, stap, aanname);
        const jaar = kindgebondenBudget(l, ti, invoer.kinderen, paar);
        const maand = maandbedragToeslag(jaar.div(12));
        stap(`Kindgebonden budget per maand. ${AFGEROND}`, maand);
        stap("Het kindgebonden budget telt niet mee als inkomen voor de bijstand.");
        return maand;
      }),
    );
    posten.push(
      maakPost(regels, datum, "kinderbijslag", "Kinderbijslag", "toeslag", ({ l, stap, aanname }) => {
        let totaal = NUL;
        for (const k of minderjarig) {
          const id = k.leeftijd <= 5 ? "akw.kwartaal.0_5" : k.leeftijd <= 11 ? "akw.kwartaal.6_11" : "akw.kwartaal.12_17";
          const kwartaal = l.bedrag(id);
          stap(`Kind van ${k.leeftijd} jaar: ${euro(kwartaal)} per kwartaal, per maand`, kwartaal.div(3));
          totaal = totaal.plus(kwartaal.div(3));
        }
        stap("Kinderbijslag telt niet mee voor uw bijstand en hangt niet af van uw inkomen. De SVB betaalt elk kwartaal. Hier ziet u een derde daarvan per maand.");
        stap("Kinderbijslag per maand, alle kinderen samen", totaal);
        return totaal;
      }),
    );
  }

  // 6. Kinderopvangtoeslag en opvangkosten (alleen als alle ouders werken)
  const opvangKinderen = invoer.kinderen.filter((k) => k.opvang && k.opvang.urenPerMaand > 0);
  const iedereenWerkt = !brutoJaarloon(werk).isZero() && (!paar || !brutoJaarloon(partnerWerk).isZero());
  if ((naam === "werk" || invoer.opvangNu) && opvangKinderen.length > 0 && iedereenWerkt) {
    let kostenPerMaand: Bedrag | undefined;
    let kotPerMaand: Bedrag | undefined;
    posten.push(
      maakPost(regels, datum, "kot", "Kinderopvangtoeslag", "toeslag", ({ l, stap, aanname }) => {
        const ti = toetsingsinkomen(l, stap, aanname);
        const r = kinderopvangtoeslag(l, ti, invoer.kinderen);
        r.perKind.forEach((k, i) =>
          stap(`${i === 0 ? "Eerste kind" : "Volgend kind"} (${k.leeftijd} jaar, ${k.uren} uur): ${k.percentage.times(100).toString().replace(".", ",")}% vergoed`, k.toeslag),
        );
        kostenPerMaand = r.kostenPerMaand;
        const maand = maandbedragToeslag(r.toeslagPerMaand);
        kotPerMaand = maand;
        stap(`Kinderopvangtoeslag per maand. ${AFGEROND}`, maand);
        aanname("De opvanguren zijn zoals u ze invulde, ook als u de urenschuif verplaatst.");
        if (opvangKinderen.some((k) => k.opvang!.uurprijsGeschat)) {
          aanname("U wist de prijs per uur van de kinderopvang niet. De rekenhulp rekent met de hoogste prijs per uur waarover u toeslag krijgt. Is de opvang duurder, dan betaalt u het verschil zelf.");
        }
        return maand;
      }),
    );
    posten.push(
      maakPost(regels, datum, "opvangkosten", "Kosten kinderopvang", "kosten", ({ stap }) => {
        const kosten = opvangKinderen.reduce((s, k) => s.plus(D(k.opvang!.urenPerMaand).times(k.opvang!.uurprijs)), NUL);
        stap("Uren × prijs per uur, alle kinderen samen", kosten);
        return kostenPerMaand ? kostenPerMaand.neg() : kosten.neg();
      }),
    );
    if (invoer.gemeente === "leiden") {
      posten.push(
        maakPost(regels, datum, "bb_opvang", "Vergoeding eigen bijdrage kinderopvang (gemeente)", "inkomen", ({ l, stap, aanname }) => {
          const kosten = nodig(kostenPerMaand, "de kosten van de opvang");
          const eigen = max(NUL, kosten.minus(nodig(kotPerMaand, "de kinderopvangtoeslag")));
          stap("Eigen bijdrage: kosten van de opvang min kinderopvangtoeslag", eigen);
          if (eigen.isZero()) return null;
          const vt = l.breuk("pw.vakantietoeslag");
          const vg = vgVan(werk);
          // Bijstandsnorm volgens art. 1 onder d: zonder kostendelersnorm, met een verlaging op grond van art. 27,
          // en voor een alleenstaande ouder 90% van de gezinsnorm.
          const norm = normBijzondereBijstand(l, invoer).times(D(1).minus(vt));
          stap("Bijstandsnorm voor de bijzondere bijstand, zonder vakantietoeslag", norm);
          const inkomen = (kern.nettoMaand ?? NUL)
            .div(vg.plus(1))
            .plus((kern.nettoPartnerMaand ?? NUL).div(vgVan(partnerWerk).plus(1)))
            .plus(nodig(kern.bijstandMaand, "de bijstand").times(D(1).minus(vt)))
            .plus(ander);
          stap(`Netto inkomen van ${paar ? "uw huishouden" : "u"} per maand (loon en bijstand), zonder vakantiegeld`, inkomen);
          const g0 = norm.times(l.breuk("leiden.bb.draagkracht.vrij_tot"));
          const g1 = norm.times(l.breuk("leiden.bb.draagkracht.grens1"));
          const g2 = norm.times(l.breuk("leiden.bb.draagkracht.grens2"));
          const deel = (van: Bedrag, tot: Bedrag | null) => max(NUL, (tot && inkomen.gt(tot) ? tot : inkomen).minus(van));
          const draagkracht = deel(g0, g1)
            .times(l.breuk("leiden.bb.draagkracht.pct1"))
            .plus(deel(g1, g2).times(l.breuk("leiden.bb.draagkracht.pct2")))
            .plus(deel(g2, null).times(l.breuk("leiden.bb.draagkracht.pct3")));
          stap(
            draagkracht.isZero()
              ? `Uw inkomen is niet hoger dan ${euro(g0)} (110% van de norm). U hoeft zelf niets bij te dragen`
              : "Wat u zelf moet bijdragen (draagkracht): een deel van uw inkomen boven 110% van de norm",
            draagkracht,
          );
          const vergoeding = max(NUL, eigen.minus(draagkracht));
          stap("Vergoeding: eigen bijdrage min wat u zelf moet bijdragen", vergoeding);
          aanname(
            "De gemeente Leiden vergoedt de eigen bijdrage voor kinderopvang als u de opvang anders niet kunt betalen en daardoor niet kunt werken (Beleidsregels bijzondere bijstand 2022). Er is aangenomen dat dat voor u zo is en dat u de vergoeding aanvraagt.",
          );
          aanname(`Voor de vergoeding kijkt de gemeente naar uw inkomen zonder vakantiegeld. Dat is hier benaderd door het gemiddelde netto loon te delen door ${vg.plus(1).toString().replace(".", ",")}.`);
          return vergoeding;
        }),
      );
    }
  }

  // 7. Combinatiekorting (alleenstaande ouder met kind onder 12, via aangifte)
  if (invoer.leefvorm === "alleenstaande_ouder" && heeftJongKind) {
    posten.push(
      maakPost(regels, datum, "iack", "Combinatiekorting (via belastingaangifte)", "inkomen", ({ l, stap, aanname }) => {
        if (brutoJaarloon(werk).isZero()) return null;
        const loon = nodig(kern.loon, "het netto loon");
        const iack = stuksgewijs(l.schijven("ib.iack"), loon.belastbaarJaar);
        const benut = iack.lte(loon.restBelasting) ? iack : loon.restBelasting;
        stap("Combinatiekorting volgens de tabel, per maand", iack.div(12));
        stap("Deel dat u terugkrijgt per maand (niet meer dan de belasting die u betaalt)", benut.div(12));
        aanname("De combinatiekorting krijgt u via de aangifte of een voorlopige aanslag, niet via de werkgever.");
        aanname("Inkomsten uit de bijstand zijn hierbij buiten beschouwing gelaten.");
        return benut.div(12);
      }),
    );
  }

  // 8. Werkkosten en vergoedingen
  const werktHier = !brutoJaarloon(werk).isZero();
  if (werk && werktHier && (werk.reiskostenvergoedingPerMaand ?? 0) > 0) {
    posten.push(
      maakPost(regels, datum, "reisvergoeding", "Reiskostenvergoeding werkgever", "inkomen", () => D(werk.reiskostenvergoedingPerMaand!)),
    );
  }
  if (werk && werktHier && ((werk.reiskostenPerMaand ?? 0) > 0 || (werk.overigeKostenPerMaand ?? 0) > 0)) {
    posten.push(
      maakPost(regels, datum, "werkkosten", "Reiskosten en andere werkkosten", "kosten", ({ stap }) => {
        const k = D(werk.reiskostenPerMaand ?? 0).plus(D(werk.overigeKostenPerMaand ?? 0));
        stap("Reiskosten plus andere werkkosten per maand", k);
        return k.neg();
      }),
    );
  }

  return posten.filter((p): p is Post => p !== null);
}

function som(posten: Post[], uitsluiten: Set<string>): Bedrag {
  return posten.filter((p) => p.perMaand !== null && !uitsluiten.has(p.id)).reduce((s, p) => s.plus(D(p.perMaand!)), NUL);
}

export function bereken(gegeven: Invoer, regels: RegelSet = standaardRegels): Resultaat {
  valideer(gegeven);
  const oorspronkelijk = metVakantiegeld(gegeven, regels);
  const invoer: Invoer = {
    ...oorspronkelijk,
    huidigWerk: metBruto(oorspronkelijk.huidigWerk, regels, oorspronkelijk.datum),
    nieuwWerk: metBruto(oorspronkelijk.nieuwWerk, regels, oorspronkelijk.datum)!,
  };
  const huidigePosten = situatie(invoer, regels, "huidig", invoer.huidigWerk, invoer.huidigeVrijlating ?? "geen");
  const werkPosten = situatie(invoer, regels, "werk", invoer.nieuwWerk, invoer.vrijlatingFase);

  // Posten die ergens niet berekend konden worden, vallen in beide situaties buiten het verschil.
  const nietMeegenomen = new Map<string, Resultaat["nietMeegenomen"][number]>();
  for (const p of [...huidigePosten, ...werkPosten]) {
    if (p.perMaand === null) {
      nietMeegenomen.set(p.id, { id: p.id, label: p.label, reden: p.reden ?? "Niet berekend", invloed: p.invloed, richting: p.richting });
    }
  }
  const uit = new Set(nietMeegenomen.keys());
  const besteedbaarHuidig = som(huidigePosten, uit);
  const besteedbaarWerk = som(werkPosten, uit);
  const verschil = besteedbaarWerk.minus(besteedbaarHuidig);

  const alle = [...huidigePosten, ...werkPosten].filter((p) => p.perMaand !== null);
  const zekerheid = alle.some((p) => p.status === "onbevestigd") ? "onbevestigd" : "geverifieerd";

  const huidig: Situatie = { naam: "huidig", posten: huidigePosten, besteedbaarPerMaand: centen(besteedbaarHuidig) };
  const werk: Situatie = { naam: "werk", posten: werkPosten, besteedbaarPerMaand: centen(besteedbaarWerk) };
  const regime = regimeOp(invoer.datum);
  const risico = terugbetaalrisico(huidig, werk);

  return {
    datum: invoer.datum,
    huidig,
    werk,
    verschilPerMaand: centen(verschil),
    verschilPerJaar: centen(verschil.times(12)),
    nietMeegenomen: [...nietMeegenomen.values()],
    zekerheid,
    betrouwbaarheid: betrouwbaarheid([...nietMeegenomen.values()], zekerheid),
    regime: { id: regime.id, naam: regime.naam, grondslag: regime.grondslag },
    terugbetaalrisico: risico,
    signalen: signalen(invoer, regels, huidig, werk, risico),
    aannames: [
      "De berekening gaat uit van een volledige maand in elke situatie, niet van de overgangsmaanden.",
      "'U houdt over' is wat binnenkomt, min de kosten van het werk en de kinderopvang. Vaste lasten zoals huur, zorgpremie en energie zijn er nog niet af. Die betaalt u met en zonder werk, dus voor het verschil maken ze niet uit.",
      ...(invoer.wonen.soort === "instelling"
        ? [
            "Er is aangenomen dat u voor uw verblijf in de instelling niets betaalt, ook niet als u gaat werken.",
          ]
        : []),
      ...(invoer.wonen.soort === "huur" && invoer.wonen.zelfstandig === false
        ? ["Als u de voordeur, keuken, wc of douche deelt, bijvoorbeeld op een kamer, krijgt u meestal geen huurtoeslag. Daarom is die niet meegerekend. Voor sommige kamers kan het wel; dat ziet u met de proefberekening van Dienst Toeslagen."]
        : []),
    ],
  };
}

/** Hoe betrouwbaar is het kopgetal, en welke kant gaat een fout waarschijnlijk op? */
export function betrouwbaarheid(nietMeegenomen: Resultaat["nietMeegenomen"], zekerheid: "geverifieerd" | "onbevestigd"): Betrouwbaarheid {
  const relevant = nietMeegenomen.filter((n) => n.invloed !== "nee");
  if (relevant.length === 0) {
    return zekerheid === "geverifieerd"
      ? { niveau: "goed", richting: "geen", tekst: "Alle onderdelen zijn berekend met officiële bedragen." }
      : {
          niveau: "redelijk",
          richting: "onbekend",
          tekst: "Alle onderdelen zijn berekend, maar een deel van de bedragen is nog niet officieel bevestigd.",
        };
  }
  const dalers = relevant.filter((n) => n.richting === "daalt");
  const stijgers = relevant.filter((n) => n.richting === "stijgt");
  // "a, b en c"
  const namen = (l: typeof relevant) => {
    const n = l.map((x) => x.label.toLowerCase());
    return n.length > 1 ? `${n.slice(0, -1).join(", ")} en ${n[n.length - 1]}` : (n[0] ?? "");
  };
  if (dalers.length > 0 && stijgers.length === 0) {
    return {
      niveau: "beperkt",
      richting: "te_gunstig",
      tekst: `Niet meegerekend: ${namen(dalers)}. ${dalers.length > 1 ? "Die worden" : "Die wordt"} lager als u gaat werken. Het echte verschil is daarom waarschijnlijk kleiner dan hierboven staat.`,
    };
  }
  if (stijgers.length > 0 && dalers.length === 0) {
    return {
      niveau: "beperkt",
      richting: "te_ongunstig",
      tekst: `Niet meegerekend: ${namen(stijgers)}. ${stijgers.length > 1 ? "Die komen erbij of worden" : "Die komt erbij of wordt"} hoger als u gaat werken. Het echte verschil is daarom waarschijnlijk groter dan hierboven staat.`,
    };
  }
  return {
    niveau: "beperkt",
    richting: "onbekend",
    tekst: `Niet meegerekend: ${namen(relevant)}. Daardoor kan het echte verschil hoger of lager zijn dan hierboven staat.`,
  };
}

function bedragVan(s: Situatie, id: string): Bedrag | null {
  const p = s.posten.find((p) => p.id === id);
  return p && p.perMaand !== null ? D(p.perMaand) : null;
}

/** Toeslagen die met werk lager worden: wat u te veel krijgt als u niets doorgeeft. */
function terugbetaalrisico(huidig: Situatie, werk: Situatie): TerugbetaalRisico[] {
  const uit: TerugbetaalRisico[] = [];
  for (const id of ["zorgtoeslag", "huurtoeslag", "kgb"]) {
    const a = bedragVan(huidig, id);
    const b = bedragVan(werk, id);
    if (a && b && b.lt(a)) {
      const minder = a.minus(b);
      uit.push({
        id,
        label: huidig.posten.find((p) => p.id === id)!.label,
        nuPerMaand: centen(a),
        straksPerMaand: centen(b),
        minderPerMaand: centen(minder),
        perJaar: centen(minder.times(12)),
      });
    }
  }
  return uit;
}

/** Posten die samen het netto inkomen van het huishouden vormen. */
const INKOMEN = ["loon", "loon_partner", "ander_inkomen", "bijstand"];

/**
 * Bijstandsnorm voor de Leidse bijzondere bijstand (Beleidsregels 2022, art. 1 onder d): zonder
 * kostendelersnorm, met een verlaging op grond van art. 27, en voor een alleenstaande ouder 90% van de gezinsnorm.
 */
function normBijzondereBijstand(l: Lezer, invoer: Invoer): Bedrag {
  const zonderKostendelers: Invoer = { ...invoer, kostendelers: 0 };
  const basis =
    invoer.leefvorm === "alleenstaande_ouder"
      ? l.bedrag("pw.norm.gehuwden").times(l.breuk("leiden.bb.rekennorm_alleenstaande_ouder"))
      : bijstandsnorm(l, zonderKostendelers).norm;
  return basis.minus(woonkorting(l, zonderKostendelers).bedrag);
}

/** Letterlijke brontekst bij een parameter, voor een melding. */
function bronVan(l: Lezer, id: string): Citaat | undefined {
  const b = l.brontekst(id);
  return b ? naarCitaat(b.citaat, b.bron, b.geldigVan) : undefined;
}

function signalen(invoer: Invoer, regels: RegelSet, huidig: Situatie, werk: Situatie, risico: TerugbetaalRisico[]): Signaal[] {
  const uit: Signaal[] = [];
  const bijstandNu = bedragVan(huidig, "bijstand");
  const bijstandWerk = bedragVan(werk, "bijstand");
  const l = new Lezer(regels, invoer.datum);
  const probeer = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      if (!(e instanceof OntbrekendeParameter)) throw e;
    }
  };

  if (bijstandNu && bijstandNu.gt(0) && bijstandWerk && bijstandWerk.isZero()) {
    probeer(() => {
      const termijn = l.aantal("leiden.garantieknop.termijn").toString();
      uit.push({
        soort: "info",
        kop: "Opnieuw bijstand aanvragen",
        bron: bronVan(l, "leiden.garantieknop.termijn"),
        tekst: `Met dit werk heeft u waarschijnlijk geen bijstand meer nodig. Stopt uw werk en vraagt u binnen ${termijn} maanden na het einde van uw bijstand opnieuw bijstand aan? Dan is aanvragen in Leiden makkelijker: de gemeente kan de gegevens gebruiken die ze al van u heeft.`,
      });
    });
  }
  if (risico.length > 0) {
    const totaal = risico.reduce((s, r) => s.plus(D(r.minderPerMaand)), NUL);
    const lijst = risico.map((r) => `${r.label.toLowerCase()} ${euro(r.minderPerMaand, true)}`).join(", ");
    uit.push({
      soort: "waarschuwing",
      kop: "Geef uw nieuwe inkomen door",
      actie: true,
      bron: CITATEN.awirTerugvordering,
      tekst: `Uw toeslagen gaan samen ${euro(totaal, true)} per maand omlaag (${lijst}). Geef uw nieuwe inkomen meteen door via Mijn toeslagen. Anders krijgt u elke maand ${euro(totaal, true)} te veel, en moet u na een jaar ongeveer ${euro(totaal.times(12), true)} terugbetalen.`,
    });
  }

  // Leiden: Sleutelpas en Kindtegoed (tot 130% van het sociaal minimum; Kindtegoed tot 140%).
  probeer(() => {
    const grens = l.breuk("leiden.sleutelpas.inkomensgrens");
    // Het sociaal minimum: de gewone bijstandsnorm, ook bij verblijf in een instelling (de Sleutelpas kent geen andere normen).
    const norm = bijstandsnorm(l, invoer.wonen.soort === "instelling" ? { ...invoer, wonen: { soort: "anders" } } : invoer).norm;
    const inkomen = INKOMEN.reduce((s, id) => s.plus(bedragVan(werk, id) ?? NUL), NUL);
    const kinderen = invoer.kinderen.filter((k) => k.leeftijd < 18);
    let kindtegoed = NUL;
    for (const k of kinderen) {
      kindtegoed = kindtegoed.plus(l.bedrag(k.leeftijd <= 3 ? "leiden.kindtegoed.0_3" : k.leeftijd <= 11 ? "leiden.kindtegoed.4_11" : "leiden.kindtegoed.12_17"));
    }
    const kt = kinderen.length > 0 ? ` Voor uw ${kinderen.length === 1 ? "kind" : "kinderen"} krijgt u dan ook Kindtegoed: ${euro(kindtegoed, true)} per jaar voor schoolspullen, sport en cultuur.` : "";
    if (inkomen.gt(norm.times(grens))) {
      let tekst = `Met dit inkomen komt u waarschijnlijk niet meer in aanmerking voor de gratis Sleutelpas (grens: ongeveer ${euro(norm.times(grens), true)} netto per maand).`;
      if (kinderen.length > 0) {
        const grens2 = l.breuk("leiden.kindtegoed.inkomensgrens");
        if (!inkomen.gt(norm.times(grens2))) {
          tekst += ` Het Kindtegoed van ${euro(kindtegoed, true)} per jaar houdt u waarschijnlijk wel, tot ongeveer ${euro(norm.times(grens2), true)} netto per maand.`;
        }
      }
      uit.push({ soort: "waarschuwing", kop: kinderen.length > 0 ? "Sleutelpas en Kindtegoed" : "Sleutelpas", tekst, bron: bronVan(l, "leiden.sleutelpas.inkomensgrens") });
    } else {
      uit.push({
        soort: "info",
        kop: kinderen.length > 0 ? "Sleutelpas en Kindtegoed" : "Sleutelpas",
        tekst: `U komt waarschijnlijk nog in aanmerking voor de gratis Sleutelpas van de gemeente Leiden.${kt}`,
        bron: bronVan(l, "leiden.sleutelpas.inkomensgrens"),
      });
    }
  });

  // Leiden: collectieve zorgverzekering voor minima (tot 120% van de norm voor de bijzondere bijstand).
  probeer(() => {
    const grens = normBijzondereBijstand(l, invoer).times(l.breuk("leiden.czm.inkomensgrens"));
    const inkomen = INKOMEN.reduce((s, id) => s.plus(bedragVan(werk, id) ?? NUL), NUL);
    const boven = inkomen.gt(grens);
    const grensTekst = `(grens: ongeveer ${euro(grens, true)} netto per maand)`;
    uit.push({
      soort: boven ? "waarschuwing" : "info",
      kop: "Zorgverzekering",
      bron: bronVan(l, "leiden.czm.inkomensgrens"),
      tekst: boven
        ? `Heeft u de collectieve zorgverzekering van de gemeente Leiden? Met dit inkomen betaalt de gemeente waarschijnlijk niet meer mee aan de premie ${grensTekst}. Dat is niet meegerekend.`
        : `De gemeente Leiden kan meebetalen aan de premie van de collectieve zorgverzekering. Met dit inkomen kan dat waarschijnlijk nog ${grensTekst}.`,
    });
    uit.push({
      soort: boven ? "waarschuwing" : "info",
      kop: "Zwemabonnement",
      bron: bronVan(l, "leiden.czm.inkomensgrens"),
      tekst: boven
        ? `Krijgt u van de gemeente Leiden een vergoeding voor een zwemabonnement? Met dit inkomen stopt die waarschijnlijk ${grensTekst}. Dat is niet meegerekend.`
        : `De gemeente Leiden kan een seizoenabonnement voor zwembad De Vliet of De Zijl vergoeden. Met dit inkomen kan dat waarschijnlijk nog ${grensTekst}.`,
    });
  });

  // Leiden: Volwassenenfonds Sport & Cultuur (tot 120% van het sociaal minimum).
  probeer(() => {
    const norm = bijstandsnorm(l, invoer.wonen.soort === "instelling" ? { ...invoer, wonen: { soort: "anders" } } : invoer).norm;
    const grens = norm.times(l.breuk("leiden.volwassenenfonds.inkomensgrens"));
    const maximum = euro(l.bedrag("leiden.volwassenenfonds.maximum"), true);
    const inkomen = INKOMEN.reduce((s, id) => s.plus(bedragVan(werk, id) ?? NUL), NUL);
    const boven = inkomen.gt(grens);
    uit.push({
      soort: boven ? "waarschuwing" : "info",
      kop: "Sport en cultuur",
      bron: bronVan(l, "leiden.volwassenenfonds.inkomensgrens"),
      tekst: boven
        ? `Met dit inkomen kunt u waarschijnlijk geen hulp meer krijgen van het Volwassenenfonds Sport & Cultuur (grens: ongeveer ${euro(grens, true)} netto per maand).`
        : `Het Volwassenenfonds Sport & Cultuur kan een sport of culturele activiteit voor u betalen, tot ${maximum} per jaar. Met dit inkomen kan dat waarschijnlijk nog (grens: ongeveer ${euro(grens, true)} netto per maand). Aanvragen gaat via een tussenpersoon; vraag het uw contactpersoon bij de gemeente.`,
    });
  });

  // Leiden: gratis OV-pas (tot 100% van het sociaal minimum; niet voor dak- en thuislozen).
  if (bijstandNu && bijstandNu.gt(0) && !(invoer.wonen.soort === "geen_woonkosten" && invoer.wonen.dakloos)) {
    probeer(() => {
      l.breuk("leiden.ovpas.inkomensgrens");
      const stopt = !!bijstandWerk && bijstandWerk.isZero();
      uit.push({
        soort: stopt ? "waarschuwing" : "info",
        kop: "Gratis OV-pas",
        bron: bronVan(l, "leiden.ovpas.inkomensgrens"),
        tekst: stopt
          ? "Met bijstand kunt u in Leiden een gratis pas voor de bus krijgen. Verdient u meer dan de bijstandsnorm, dan krijgt u die pas niet meer. De pas geldt niet in de ochtendspits en de avondspits."
          : "Zolang u bijstand krijgt, kunt u in Leiden een gratis pas voor de bus krijgen. De pas geldt op werkdagen van 9.00 tot 16.00 uur en na 18.30 uur, en in het weekend de hele dag.",
      });
    });
  }

  // Leiden: kwijtschelding van gemeentelijke belastingen vervalt (deels) boven de bijstandsnorm.
  if (bijstandNu && bijstandNu.gt(0) && bijstandWerk && bijstandWerk.isZero()) {
    probeer(() => {
      l.breuk("leiden.kwijtschelding.kosten_van_bestaan");
      uit.push({
        soort: "waarschuwing",
        kop: "Gemeentelijke belastingen",
        bron: bronVan(l, "leiden.kwijtschelding.kosten_van_bestaan"),
        tekst:
          "Met bijstand hoeft u de afvalstoffenheffing en de riool- en waterzorgheffing meestal niet te betalen (kwijtschelding). Verdient u meer dan de bijstandsnorm, dan moet u die misschien wel betalen, helemaal of voor een deel. Dat is niet meegerekend. Vraag het na bij de gemeente.",
      });
    });
  }

  if (bijstandNu && bijstandNu.gt(0)) {
    probeer(() => {
      const id =
        invoer.leefvorm === "paar" ? "leiden.iit.bedrag.gehuwden" : invoer.leefvorm === "alleenstaande_ouder" ? "leiden.iit.bedrag.alleenstaande_ouder" : "leiden.iit.bedrag.alleenstaande";
      const bedrag = l.bedrag(id);
      const jaren = l.aantal("leiden.iit.referteperiode").toString();
      const minLeeftijd = l.aantal("leiden.iit.minimumleeftijd");
      if (minLeeftijd.gt(invoer.leeftijd)) return;
      // Het recht hangt af van het inkomen: zolang er bijstand is, blijft het inkomen op de norm.
      const stopt = !!bijstandWerk && bijstandWerk.isZero();
      uit.push({
        soort: stopt ? "waarschuwing" : "info",
        kop: "Individuele inkomenstoeslag",
        bron: bronVan(l, "leiden.iit.referteperiode"),
        tekst: stopt
          ? `Heeft u al ${jaren} jaar of langer een inkomen niet hoger dan de bijstand, dan kunt u in Leiden één keer per 12 maanden ${euro(bedrag, true)} krijgen. Met dit werk verdient u meer dan de bijstandsnorm. Dan krijgt u deze toeslag waarschijnlijk niet meer. Dat is niet meegerekend.`
          : `Heeft u al ${jaren} jaar of langer een inkomen niet hoger dan de bijstand, dan kunt u in Leiden één keer per 12 maanden ${euro(bedrag, true)} krijgen. Met dit werk houdt u bijstand. Daarom kunt u deze toeslag waarschijnlijk blijven krijgen. Aanvragen kan via leiden.nl/inkomenstoeslag.`,
      });
    });
  }
  // Leiden: bijzondere bijstand voor de eigen bijdrage kinderopvang (Beleidsregels bijzondere bijstand 2022, CVDR677687).
  const opvang = bedragVan(werk, "opvangkosten");
  const kot = bedragVan(werk, "kot") ?? NUL;
  const vergoeding = bedragVan(werk, "bb_opvang");
  if (invoer.gemeente === "leiden" && opvang && opvang.neg().minus(kot).gt("0.5")) {
    const eigen = opvang.neg().minus(kot);
    const rest = vergoeding ? eigen.minus(vergoeding) : eigen;
    uit.push({
      soort: "waarschuwing",
      kop: vergoeding && vergoeding.gt(0) ? "Vraag de vergoeding voor de opvang aan" : "Eigen bijdrage kinderopvang",
      actie: vergoeding && vergoeding.gt(0) ? true : undefined,
      bron: CITATEN.bbKinderopvang,
      tekst:
        vergoeding && vergoeding.gt(0)
          ? `Na de kinderopvangtoeslag betaalt u nog ${euro(eigen, true)} per maand voor de opvang. De gemeente Leiden kan dit deel vergoeden. Dat heet bijzondere bijstand. Voorwaarde: u heeft de opvang nodig om te kunnen werken. Hoeveel u krijgt, hangt af van uw inkomen. Hier is ${euro(vergoeding, true)} per maand meegerekend${rest.gt("0.5") ? `; u betaalt zelf ${euro(rest, true)}` : ""}. Dit geldt ook als u door het werk geen bijstand meer krijgt. U krijgt de vergoeding niet vanzelf: vraag haar aan bij de gemeente, het liefst voordat u begint met werken.`
          : `Na de kinderopvangtoeslag betaalt u nog ${euro(eigen, true)} per maand voor de opvang. Met dit inkomen betaalt de gemeente Leiden hier waarschijnlijk niets van. Volgens de regels kunt u dit zelf betalen. Twijfelt u? Vraag het aan de gemeente.`,
    });
  }
  if (invoer.wonen.soort === "instelling") {
    uit.push({
      soort: "info",
      kop: "Als u later zelfstandig woont",
      bron: CITATEN.pw23inrichting,
      tekst:
        "De lagere norm geldt zolang u in de instelling woont. Woont u later zelfstandig, bijvoorbeeld in een eigen huurwoning? Dan krijgt u de gewone bijstandsnorm, en misschien huurtoeslag. Reken dan opnieuw.",
    });
  }
  // Partner werkt niet: dan rekent de app de opvang niet mee. Dat moet de gebruiker weten.
  if (invoer.leefvorm === "paar" && invoer.kinderen.some((k) => k.opvang && k.opvang.urenPerMaand > 0) && !werk.posten.some((p) => p.id === "kot")) {
    uit.push({
      soort: "waarschuwing",
      kop: "Kinderopvang is niet meegerekend",
      bron: CITATEN.kotBeidenWerken,
      tekst:
        "U vulde in dat uw partner niet werkt. Kinderopvangtoeslag krijgt u alleen als u en uw partner allebei werken, of een opleiding, een inburgeringscursus of een traject naar werk volgen. Daarom zijn de toeslag en de kosten van de opvang niet meegerekend. Volgt uw partner een opleiding of een traject? Kijk dan bij de proefberekening van Dienst Toeslagen.",
    });
  }
  // Alleen als er bijstand overblijft: zonder bijstand valt er niets te verrekenen.
  if (invoer.nieuwWerk.brutoVierwekenloon !== undefined && bijstandWerk && bijstandWerk.gt(0)) {
    uit.push({
      soort: "waarschuwing",
      kop: "Loon per 4 weken",
      bron: CITATEN.pw45,
      tekst:
        "U krijgt 13 keer per jaar loon. Eén keer per jaar krijgt u twee keer loon in dezelfde maand. In die maand krijgt u waarschijnlijk minder of geen bijstand, omdat de gemeente per maand kijkt wat u verdiende.",
    });
  }
  // Bovenaan wat iemand moet doen, dan wat er verandert of vervalt, dan wat blijft.
  const rang = (s: Signaal) => (s.actie ? 0 : s.soort === "waarschuwing" ? 1 : 2);
  return uit.map((s, i) => ({ s, i })).sort((a, b) => rang(a.s) - rang(b.s) || a.i - b.i).map((x) => x.s);
}

function valideer(invoer: Invoer) {
  const fouten: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoer.datum)) fouten.push("datum moet JJJJ-MM-DD zijn");
  if (invoer.leeftijd < 21 || invoer.leeftijd >= 67) fouten.push("de rekenhulp ondersteunt alleen leeftijden van 21 tot de AOW-leeftijd");
  if (invoer.leefvorm === "paar" && !invoer.partner) fouten.push("partnergegevens ontbreken");
  if (invoer.partner && (invoer.partner.leeftijd < 21 || invoer.partner.leeftijd >= 67)) fouten.push("partner moet 21 jaar of ouder zijn en jonger dan de AOW-leeftijd");
  if (invoer.leefvorm === "alleenstaande_ouder" && invoer.kinderen.length === 0) fouten.push("alleenstaande ouder zonder kinderen");
  if (invoer.kostendelers < 0 || !Number.isInteger(invoer.kostendelers)) fouten.push("aantal kostendelers ongeldig");
  if (invoer.jongeHuisgenoten !== undefined && (invoer.jongeHuisgenoten < 0 || !Number.isInteger(invoer.jongeHuisgenoten))) {
    fouten.push("aantal jonge huisgenoten ongeldig");
  }
  if (invoer.huisgenotenInkomenJaar !== undefined && (!Number.isFinite(invoer.huisgenotenInkomenJaar) || invoer.huisgenotenInkomenJaar < 0)) {
    fouten.push("inkomen huisgenoten ongeldig");
  }
  for (const w of [invoer.nieuwWerk, invoer.nieuwWerk.bijbaan, invoer.huidigWerk, invoer.huidigWerk?.bijbaan, invoer.partner?.werk]) {
    if (!w) continue;
    for (const v of [w.brutoMaandloon, w.brutoVierwekenloon, w.nettoMaandloon, w.brutoUurloon, w.urenPerWeek, w.reiskostenPerMaand, w.overigeKostenPerMaand]) {
      if (v !== undefined && (!Number.isFinite(v) || v < 0)) fouten.push("bedragen en uren mogen niet negatief zijn");
    }
    if (w.urenPerWeek !== undefined && w.urenPerWeek > 60) fouten.push("meer dan 60 uur per week wordt niet ondersteund");
  }
  if (fouten.length) throw new InvoerFout(fouten);
}

export class InvoerFout extends Error {
  constructor(readonly fouten: string[]) {
    super(fouten.join("; "));
  }
}

/**
 * Verschil in de eerste 12 maanden na de start van het werk: de maanden van de
 * eerste vrijlatingsperiode ("start") plus de maanden daarna ("later").
 */
export function verschilEersteJaar(invoer: Invoer, regels: RegelSet = standaardRegels): { bedrag: string; startMaanden: number } {
  const l = new Lezer(regels, invoer.datum);
  let duur = 6;
  try {
    duur = l.aantal(regimeOp(invoer.datum).id === "pw34a" ? "pw.bijverdien.duur" : "pw.vrijlating_n.duur").toNumber();
  } catch (e) {
    if (!(e instanceof OntbrekendeParameter)) throw e;
  }
  const start = Math.min(12, duur);
  const metFase = (fase: Fase) =>
    D(bereken({ ...invoer, vrijlatingFase: fase, huidigeVrijlating: invoer.huidigWerk ? fase : invoer.huidigeVrijlating }, regels).verschilPerMaand);
  const totaal = metFase("start").times(start).plus(start < 12 ? metFase("later").times(12 - start) : NUL);
  return { bedrag: centen(totaal), startMaanden: start };
}
