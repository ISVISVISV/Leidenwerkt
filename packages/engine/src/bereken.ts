/**
 * Vergelijkt de huidige situatie met de situatie na (meer) werken.
 * Elke post wordt los berekend; ontbreekt een regel, dan wordt die post
 * niet berekend en valt hij buiten het verschil, in plaats van te gokken.
 */
import { D, NUL, centen, euro, type Bedrag } from "./geld.ts";
import { Lezer, OntbrekendeParameter, standaardRegels, type RegelSet } from "./regels.ts";
import { nettoLoon, brutoUitNetto, stuksgewijs, type LoonUitkomst } from "./modules/belasting.ts";
import { bijstandsnorm, vrijlating, aanvulling } from "./modules/bijstand.ts";
import { zorgtoeslag, kindgebondenBudget, huurtoeslag, kinderopvangtoeslag } from "./modules/toeslagen.ts";
import type { Invoer, Post, PostStatus, Postsoort, Resultaat, Signaal, Situatie, Stap, Werk } from "./types.ts";

const STATUS_VOLGORDE: PostStatus[] = ["ontbrekend", "onbevestigd", "geverifieerd", "invoer"];

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
  try {
    const bedrag = fn(b);
    if (bedrag === null) return null;
    return { id, label, soort, perMaand: centen(bedrag), status: laagste(l), stappen, parameters: l.gebruikt, aannames };
  } catch (e) {
    if (e instanceof OntbrekendeParameter || e instanceof Afhankelijk) {
      const reden =
        e instanceof OntbrekendeParameter
          ? `Gegevens ontbreken (${e.parameterId})${e.toelichting ? `: ${e.toelichting}` : ""}`
          : e.message;
      return { id, label, soort, perMaand: null, status: "ontbrekend", stappen, parameters: l.gebruikt, aannames, reden };
    }
    throw e;
  }
}

function laagste(l: Lezer): PostStatus {
  if (l.gebruikt.length === 0) return "invoer";
  let laagst: PostStatus = "invoer";
  for (const p of l.gebruikt) if (STATUS_VOLGORDE.indexOf(p.status) < STATUS_VOLGORDE.indexOf(laagst)) laagst = p.status;
  return laagst;
}

/** Bruto jaarloon exclusief vakantiegeld. */
function brutoJaarExcl(w: Werk | undefined): Bedrag {
  if (!w) return NUL;
  if (w.brutoMaandloon !== undefined) return D(w.brutoMaandloon).times(12);
  if (w.brutoVierwekenloon !== undefined) return D(w.brutoVierwekenloon).times(13);
  if (w.brutoUurloon !== undefined && w.urenPerWeek !== undefined) return D(w.brutoUurloon).times(w.urenPerWeek).times(52);
  return NUL;
}

/** Gemiddeld bruto maandloon exclusief vakantiegeld. */
export function brutoMaandloon(w: Werk | undefined): Bedrag {
  return brutoJaarExcl(w).div(12);
}

function brutoJaarloon(w: Werk | undefined): Bedrag {
  const vg = D(w?.vakantiegeld ?? 0.08);
  return brutoJaarExcl(w).times(vg.plus(1));
}

function pensioenJaar(w: Werk | undefined): Bedrag {
  return D(w?.pensioenpremiePerMaand ?? 0).times(12);
}

interface Kern {
  loon?: LoonUitkomst;
  loonPartner?: LoonUitkomst;
  nettoMaand?: Bedrag;
  nettoPartnerMaand?: Bedrag;
  bijstandMaand?: Bedrag;
}

function situatie(
  invoer: Invoer,
  regels: RegelSet,
  naam: "huidig" | "werk",
  werk: Werk | undefined,
  fase: Invoer["vrijlatingFase"],
): Post[] {
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
      if (werk?.brutoVierwekenloon !== undefined) stap("Bruto loon per 4 weken", D(werk.brutoVierwekenloon));
      stap("Bruto loon per maand (gemiddeld, zonder vakantiegeld)", brutoMaandloon(werk));
      stap("Vakantiegeld per maand (gemiddeld)", bruto.div(12).minus(brutoMaandloon(werk)));
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

  // 2. Bijstand
  const heeftJongKind = invoer.kinderen.some((k) => k.leeftijd < 12);
  posten.push(
    maakPost(regels, datum, "bijstand", "Bijstand", "inkomen", ({ l, stap, aanname }) => {
      const eigen = brutoJaarloon(werk).isZero() ? NUL : nodig(kern.nettoMaand, "het netto loon");
      const partner = brutoJaarloon(partnerWerk).isZero() ? NUL : nodig(kern.nettoPartnerMaand, "het netto loon van de partner");
      const { norm, uitleg } = bijstandsnorm(l, invoer);
      stap(uitleg, norm);
      const inkomen = eigen.plus(partner);
      if (!inkomen.isZero()) stap("Netto inkomen uit werk in het huishouden", inkomen);
      const v1 = vrijlating(l, fase, eigen, inkomen, norm, invoer.leefvorm === "alleenstaande_ouder" && heeftJongKind);
      const v2 = paar ? vrijlating(l, fase, partner, inkomen, norm, false) : { bedrag: NUL, uitleg: "", aannames: [] };
      const vrij = v1.bedrag.plus(v2.bedrag);
      if (!eigen.isZero()) stap(v1.uitleg, v1.bedrag);
      if (!partner.isZero() && v2.uitleg) stap(`Partner: ${v2.uitleg}`, v2.bedrag);
      [...v1.aannames, ...v2.aannames].forEach(aanname);
      const bijstand = aanvulling(norm, inkomen, vrij);
      stap("Bijstand = norm − (inkomen − vrijgelaten deel)", bijstand);
      kern.bijstandMaand = bijstand;
      aanname("Bijstand is netto en inclusief vakantietoeslag per maand gerekend; de gemeente betaalt de vakantietoeslag één keer per jaar uit.");
      aanname("Er is aangenomen dat er geen vermogen boven de vermogensgrens is en dat aan alle voorwaarden voor bijstand wordt voldaan.");
      return bijstand;
    }),
  );

  // Toetsingsinkomen voor toeslagen (jaar, bruto, huishouden).
  const toetsingsinkomen = (l: Lezer, stap: Bouw["stap"], aanname: Bouw["aanname"]): Bedrag => {
    const bijstandJaar = nodig(kern.bijstandMaand, "de bijstand").times(12);
    const brutoBijstand = brutoUitNetto(l, bijstandJaar);
    const loon = brutoJaarloon(werk).minus(pensioenJaar(werk)).plus(brutoJaarloon(partnerWerk).minus(pensioenJaar(partnerWerk)));
    const ti = loon.plus(brutoBijstand);
    stap("Geschat bruto jaarinkomen van het huishouden (Dienst Toeslagen kijkt naar het hele jaar)", ti);
    aanname("Het bruto bedrag van de bijstand is teruggerekend uit het netto bedrag; Dienst Toeslagen gebruikt het werkelijke bruto bedrag.");
    aanname("Dit is het inkomen bij een heel jaar in deze situatie. Begint het werk halverwege het jaar, dan ligt het jaarinkomen ertussenin.");
    return ti;
  };

  // 3. Zorgtoeslag
  posten.push(
    maakPost(regels, datum, "zorgtoeslag", "Zorgtoeslag", "toeslag", ({ l, stap, aanname }) => {
      const ti = toetsingsinkomen(l, stap, aanname);
      const jaar = zorgtoeslag(l, ti, paar);
      stap("Zorgtoeslag per maand", jaar.div(12));
      aanname("Er is aangenomen dat het vermogen onder de vermogensgrens blijft.");
      return jaar.div(12);
    }),
  );

  // 4. Huurtoeslag
  if (invoer.wonen.soort === "huur" && invoer.wonen.kaleHuurPerMaand) {
    const wonen = invoer.wonen;
    posten.push(
      maakPost(regels, datum, "huurtoeslag", "Huurtoeslag", "toeslag", ({ l, stap, aanname }) => {
        if (invoer.kostendelers > 0) {
          throw new Afhankelijk("Met volwassen medebewoners telt hun inkomen mee voor de huurtoeslag; dat ondersteunt de rekenhulp nog niet");
        }
        const ti = toetsingsinkomen(l, stap, aanname);
        const rekenhuur = D(wonen.kaleHuurPerMaand ?? 0).plus(D(wonen.servicekostenPerMaand ?? 0));
        const personen = 1 + (paar ? 1 : 0) + invoer.kinderen.length;
        stap("Rekenhuur (kale huur plus servicekosten die meetellen)", rekenhuur);
        aanname("Alle opgegeven servicekosten zijn als subsidiabel aangenomen; in werkelijkheid tellen alleen bepaalde servicekosten mee.");
        return huurtoeslag(l, rekenhuur, ti, personen);
      }),
    );
  }

  // 5. Kindgebonden budget
  if (invoer.kinderen.some((k) => k.leeftijd < 18)) {
    posten.push(
      maakPost(regels, datum, "kgb", "Kindgebonden budget", "toeslag", ({ l, stap, aanname }) => {
        const ti = toetsingsinkomen(l, stap, aanname);
        const jaar = kindgebondenBudget(l, ti, invoer.kinderen, paar);
        stap("Kindgebonden budget per maand", jaar.div(12));
        aanname("Het kindgebonden budget telt niet mee als inkomen voor de bijstand.");
        return jaar.div(12);
      }),
    );
    posten.push(
      maakPost(regels, datum, "kinderbijslag", "Kinderbijslag", "toeslag", ({ l }) => {
        l.bedrag("akw.kwartaal.0_5");
        return NUL;
      }),
    );
  }

  // 6. Kinderopvangtoeslag en opvangkosten (alleen als alle ouders werken)
  const opvangKinderen = invoer.kinderen.filter((k) => k.opvang && k.opvang.urenPerMaand > 0);
  const iedereenWerkt = !brutoJaarloon(werk).isZero() && (!paar || !brutoJaarloon(partnerWerk).isZero());
  if (naam === "werk" && opvangKinderen.length > 0 && iedereenWerkt) {
    let kostenPerMaand: Bedrag | undefined;
    posten.push(
      maakPost(regels, datum, "kot", "Kinderopvangtoeslag", "toeslag", ({ l, stap, aanname }) => {
        const ti = toetsingsinkomen(l, stap, aanname);
        const r = kinderopvangtoeslag(l, ti, invoer.kinderen);
        r.perKind.forEach((k, i) =>
          stap(`${i === 0 ? "Eerste kind" : "Volgend kind"} (${k.leeftijd} jaar, ${k.uren} uur): ${k.percentage.times(100).toString()}% vergoed`, k.toeslag),
        );
        kostenPerMaand = r.kostenPerMaand;
        aanname("Er is aangenomen dat het aantal opvanguren past bij het aantal gewerkte uren.");
        return r.toeslagPerMaand;
      }),
    );
    posten.push(
      maakPost(regels, datum, "opvangkosten", "Kosten kinderopvang", "kosten", ({ stap }) => {
        const kosten = opvangKinderen.reduce((s, k) => s.plus(D(k.opvang!.urenPerMaand).times(k.opvang!.uurprijs)), NUL);
        stap("Uren × uurprijs, alle kinderen samen", kosten);
        return kostenPerMaand ? kostenPerMaand.neg() : kosten.neg();
      }),
    );
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
      maakPost(regels, datum, "werkkosten", "Reis- en werkkosten", "kosten", ({ stap }) => {
        const k = D(werk.reiskostenPerMaand ?? 0).plus(D(werk.overigeKostenPerMaand ?? 0));
        stap("Reiskosten plus overige kosten per maand", k);
        return k.neg();
      }),
    );
  }

  return posten.filter((p): p is Post => p !== null);
}

function som(posten: Post[], uitsluiten: Set<string>): Bedrag {
  return posten.filter((p) => p.perMaand !== null && !uitsluiten.has(p.id)).reduce((s, p) => s.plus(D(p.perMaand!)), NUL);
}

export function bereken(invoer: Invoer, regels: RegelSet = standaardRegels): Resultaat {
  valideer(invoer);
  const huidigePosten = situatie(invoer, regels, "huidig", invoer.huidigWerk, invoer.huidigeVrijlating ?? "geen");
  const werkPosten = situatie(invoer, regels, "werk", invoer.nieuwWerk, invoer.vrijlatingFase);

  // Posten die ergens niet berekend konden worden, vallen in beide situaties buiten het verschil.
  const nietMeegenomen = new Map<string, { id: string; label: string; reden: string }>();
  for (const p of [...huidigePosten, ...werkPosten]) {
    if (p.perMaand === null) nietMeegenomen.set(p.id, { id: p.id, label: p.label, reden: p.reden ?? "Niet berekend" });
  }
  const uit = new Set(nietMeegenomen.keys());
  const besteedbaarHuidig = som(huidigePosten, uit);
  const besteedbaarWerk = som(werkPosten, uit);
  const verschil = besteedbaarWerk.minus(besteedbaarHuidig);

  const alle = [...huidigePosten, ...werkPosten].filter((p) => p.perMaand !== null);
  const zekerheid = alle.some((p) => p.status === "onbevestigd") ? "onbevestigd" : "geverifieerd";

  const huidig: Situatie = { naam: "huidig", posten: huidigePosten, besteedbaarPerMaand: centen(besteedbaarHuidig) };
  const werk: Situatie = { naam: "werk", posten: werkPosten, besteedbaarPerMaand: centen(besteedbaarWerk) };

  return {
    datum: invoer.datum,
    huidig,
    werk,
    verschilPerMaand: centen(verschil),
    verschilPerJaar: centen(verschil.times(12)),
    nietMeegenomen: [...nietMeegenomen.values()],
    zekerheid,
    signalen: signalen(invoer, regels, huidig, werk),
    aannames: [
      "De berekening gaat uit van een volledige maand in elke situatie, niet van de overgangsmaanden.",
      "Zorgpremie, eigen risico en andere vaste lasten zijn in beide situaties gelijk en daarom weggelaten.",
    ],
  };
}

function bedragVan(s: Situatie, id: string): Bedrag | null {
  const p = s.posten.find((p) => p.id === id);
  return p && p.perMaand !== null ? D(p.perMaand) : null;
}

function signalen(invoer: Invoer, regels: RegelSet, huidig: Situatie, werk: Situatie): Signaal[] {
  const uit: Signaal[] = [];
  const bijstandNu = bedragVan(huidig, "bijstand");
  const bijstandWerk = bedragVan(werk, "bijstand");

  if (bijstandNu && bijstandNu.gt(0) && bijstandWerk && bijstandWerk.isZero()) {
    uit.push({
      soort: "info",
      tekst:
        "U heeft met dit werk waarschijnlijk geen bijstand meer nodig. Stopt het werk binnen 12 maanden, dan kunt u in Leiden een verkorte aanvraag doen (de 'Garantieknop').",
    });
  }
  if (invoer.vrijlatingFase === "start" && bijstandWerk && bijstandWerk.gt(0)) {
    uit.push({
      soort: "waarschuwing",
      tekst:
        "De vrijlating is tijdelijk. Daarna gaat een groter deel van uw loon van de bijstand af. Kies hierboven een latere periode om te zien wat u dan overhoudt.",
    });
  }
  for (const id of ["zorgtoeslag", "huurtoeslag", "kgb"]) {
    const a = bedragVan(huidig, id);
    const b = bedragVan(werk, id);
    if (a && b && b.lt(a.minus(5))) {
      uit.push({
        soort: "waarschuwing",
        tekst:
          "Uw toeslagen worden lager. Geef uw nieuwe inkomen meteen door via Mijn toeslagen; anders moet u later geld terugbetalen.",
      });
      break;
    }
  }

  // Leiden: Sleutelpas (gratis tot 130% van het sociaal minimum).
  const l = new Lezer(regels, invoer.datum);
  try {
    const grens = l.breuk("leiden.sleutelpas.inkomensgrens");
    const norm = bijstandsnorm(l, invoer).norm;
    const inkomen = ["loon", "loon_partner", "bijstand"].reduce((s, id) => s.plus(bedragVan(werk, id) ?? NUL), NUL);
    if (inkomen.gt(norm.times(grens))) {
      uit.push({
        soort: "info",
        tekst: `Met dit inkomen komt u waarschijnlijk niet meer in aanmerking voor de gratis Sleutelpas (grens: ongeveer ${euro(norm.times(grens), true)} netto per maand).`,
      });
    } else {
      uit.push({ soort: "info", tekst: "U komt waarschijnlijk nog in aanmerking voor de gratis Sleutelpas van de gemeente Leiden." });
    }
  } catch (e) {
    if (!(e instanceof OntbrekendeParameter)) throw e;
  }
  if (bijstandNu && bijstandNu.gt(0)) {
    const l2 = new Lezer(regels, invoer.datum);
    try {
      const id =
        invoer.leefvorm === "paar" ? "leiden.iit.basis.gehuwden" : invoer.leefvorm === "alleenstaande_ouder" ? "leiden.iit.basis.alleenstaande_ouder" : "leiden.iit.basis.alleenstaande";
      const bedrag = l2.bedrag(id);
      const jaren = l2.aantal("leiden.iit.referteperiode");
      uit.push({
        soort: "info",
        tekst: `Individuele inkomenstoeslag: heeft u al ${jaren} jaar een inkomen op bijstandsniveau, dan kunt u in Leiden één keer per jaar een extra bedrag krijgen. Voor uw situatie was dat ${euro(bedrag, true)} per jaar toen de regeling in 2020 begon; het bedrag wordt elk jaar verhoogd met de inflatie. Gaat uw inkomen boven de bijstandsnorm, dan vervalt dit recht. Aanvragen kan via leiden.nl/inkomenstoeslag.`,
      });
    } catch (e) {
      if (!(e instanceof OntbrekendeParameter)) throw e;
    }
  }
  if (invoer.nieuwWerk.brutoVierwekenloon !== undefined) {
    uit.push({
      soort: "waarschuwing",
      tekst:
        "U krijgt 13 keer per jaar loon. Eén keer per jaar krijgt u twee keer loon in dezelfde maand. In die maand krijgt u waarschijnlijk minder of geen bijstand, omdat de gemeente per maand kijkt wat u verdiende.",
    });
  }
  return uit;
}

function valideer(invoer: Invoer) {
  const fouten: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoer.datum)) fouten.push("datum moet JJJJ-MM-DD zijn");
  if (invoer.leeftijd < 21 || invoer.leeftijd >= 67) fouten.push("de rekenhulp ondersteunt alleen leeftijden van 21 tot de AOW-leeftijd");
  if (invoer.leefvorm === "paar" && !invoer.partner) fouten.push("partnergegevens ontbreken");
  if (invoer.partner && (invoer.partner.leeftijd < 21 || invoer.partner.leeftijd >= 67)) fouten.push("partner moet 21 jaar of ouder zijn en jonger dan de AOW-leeftijd");
  if (invoer.leefvorm === "alleenstaande_ouder" && invoer.kinderen.length === 0) fouten.push("alleenstaande ouder zonder kinderen");
  if (invoer.kostendelers < 0 || !Number.isInteger(invoer.kostendelers)) fouten.push("aantal kostendelers ongeldig");
  for (const w of [invoer.nieuwWerk, invoer.huidigWerk, invoer.partner?.werk]) {
    if (!w) continue;
    for (const v of [w.brutoMaandloon, w.brutoVierwekenloon, w.brutoUurloon, w.urenPerWeek, w.reiskostenPerMaand, w.overigeKostenPerMaand]) {
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
