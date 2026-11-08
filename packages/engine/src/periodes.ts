/**
 * Beschrijft de perioden van de vrijlating in gewone taal, met concrete
 * percentages en bedragen uit de regeldata, per regime (zie regimes.ts).
 */
import { euro, type Bedrag } from "./geld.ts";
import { Lezer, OntbrekendeParameter, standaardRegels, type RegelSet } from "./regels.ts";
import { REGIMES, dagVoor, regimeOp } from "./regimes.ts";
import type { Fase, Invoer } from "./types.ts";

export interface Periode {
  fase: Fase;
  /** Korte naam, bijvoorbeeld "Maand 1 t/m 6". */
  naam: string;
  /** Wat de vrijlating in deze periode inhoudt. */
  regel: string;
}

export interface VrijlatingUitleg {
  periodes: Periode[];
  /** Zin over de vrijlating bij een medische urenbeperking, als die bekend is. */
  medisch?: string;
  /** Wettelijke grondslag, voor de bronvermelding. */
  bron: string;
}

const pct = (b: Bedrag) => b.times(100).toString().replace(".", ",") + "%";

const DAARNA =
  "Verdient u minder dan de bijstandsnorm, dan houdt u samen evenveel over als zonder werk: de bijstand vult uw loon aan tot de norm. Verdient u meer dan de norm, dan stopt de bijstand en houdt u uw hele netto loon. Daarin zit ook de arbeidskorting: korting op de belasting omdat u werkt.";

export function vrijlatingUitleg(invoer: Invoer, regels: RegelSet = standaardRegels): VrijlatingUitleg {
  const l = new Lezer(regels, invoer.datum);
  const regime = regimeOp(invoer.datum);
  const ouderJongKind = invoer.leefvorm === "alleenstaande_ouder" && invoer.kinderen.some((k) => k.leeftijd < 12);
  try {
    if (regime.id === "pw34a") {
      const p = l.breuk("pw.bijverdien.percentage");
      const duur = l.aantal("pw.bijverdien.duur").toNumber();
      const medisch = `Heeft u een medische urenbeperking? Dan geldt in plaats hiervan een andere vrijlating: ${pct(l.breuk("pw.bijverdien.medisch_percentage"))} van uw netto loon, zonder einddatum. U krijgt nooit twee vrijlatingen tegelijk.`;
      const bron = `${regime.grondslag}.`;
      if (invoer.overgang2027 === "n") {
        const oud = l.op(dagVoor(REGIMES.find((r) => r.id === "pw34a")!));
        return {
          periodes: [
            {
              fase: "start",
              naam: "Rest van uw 6 maanden",
              regel: `Uw vrijlating van vóór 2027 loopt door tot het einde van uw 6 maanden: u mag ${pct(oud.breuk("pw.vrijlating_n.percentage"))} van uw netto loon houden, maximaal ${euro(oud.bedrag("pw.vrijlating_n.maximum"))} per maand.`,
            },
            { fase: "later", naam: "Daarna", regel: `Daarna geen vrijlating meer. Vraag uw klantmanager of u daarna de nieuwe bijverdienregeling krijgt. ${DAARNA}` },
          ],
          medisch,
          bron,
        };
      }
      if (invoer.overgang2027 === "r") {
        return {
          periodes: [
            {
              fase: "start",
              naam: "Rest van uw periode",
              regel: `Uw vrijlating als alleenstaande ouder loopt door tot het einde van uw periode (ten hoogste 30 maanden). Vanaf 2027 mag u daarin ${pct(p)} van uw netto loon houden, zonder maximumbedrag.`,
            },
            { fase: "later", naam: "Daarna", regel: `Daarna geen vrijlating meer. ${DAARNA}` },
          ],
          medisch,
          bron,
        };
      }
      return {
        periodes: [
          { fase: "start", naam: `Maand 1 t/m ${duur}`, regel: `U mag ${pct(p)} van uw netto loon houden naast de bijstand. Er is geen maximumbedrag.` },
          {
            fase: "later",
            naam: `Vanaf maand ${duur + 1}`,
            regel: `Geen vrijlating meer, tenzij de gemeente die verlengt omdat meer uren werken voor u niet mogelijk is. ${DAARNA}`,
          },
        ],
        medisch,
        bron,
      };
    }

    // Regime tot en met 2026: art. 31 lid 2 onder n, r en y Pw.
    // Art. 31 lid 2 y geldt "tenzij onderdeel n van toepassing is"; onderdeel r geldt alleen als y niet van toepassing is.
    const medisch = `Heeft u een medische urenbeperking? Dan krijgt u na de eerste ${l.aantal("pw.vrijlating_n.duur").toString()} maanden (of als u jonger bent dan 27 jaar meteen) een andere vrijlating: ${pct(l.breuk("pw.vrijlating_y.percentage"))} van uw netto loon, maximaal ${euro(l.bedrag("pw.vrijlating_y.maximum"))} per maand, zonder einddatum. U krijgt nooit twee vrijlatingen tegelijk.`;
    const bron = "Participatiewet art. 31 lid 2 onder n, r en y, en lid 5.";
    const minLeeftijd = l.aantal("pw.vrijlating.minimumleeftijd");
    if (minLeeftijd.gt(invoer.leeftijd)) {
      return {
        periodes: [
          {
            fase: "geen",
            naam: "Zonder vrijlating",
            regel: `Omdat u jonger bent dan ${minLeeftijd.toString()} jaar, mag u in 2026 niets van uw loon extra houden naast de bijstand. Vanaf 1 januari 2027 geldt de nieuwe bijverdienregeling ook voor jongeren. ${DAARNA}`,
          },
        ],
        medisch,
        bron,
      };
    }
    const pn = l.breuk("pw.vrijlating_n.percentage");
    const mn = l.bedrag("pw.vrijlating_n.maximum");
    const dn = l.aantal("pw.vrijlating_n.duur").toNumber();
    const lijst: Periode[] = [
      { fase: "start", naam: `Maand 1 t/m ${dn}`, regel: `U mag ${pct(pn)} van uw netto loon houden naast de bijstand, maximaal ${euro(mn)} per maand.` },
    ];
    if (ouderJongKind && l.bestaat("pw.vrijlating_r.maximum")) {
      const pr = l.breuk("pw.vrijlating_r.percentage");
      const mr = l.bedrag("pw.vrijlating_r.maximum");
      const dr = l.aantal("pw.vrijlating_r.duur").toNumber();
      lijst.push(
        {
          fase: "later",
          naam: `Maand ${dn + 1} t/m ${dn + dr}`,
          regel: `Als alleenstaande ouder met een kind onder de 12 mag u ${pct(pr)} houden, maximaal ${euro(mr)} per maand.`,
        },
        { fase: "geen", naam: `Vanaf maand ${dn + dr + 1}`, regel: `Geen vrijlating meer. ${DAARNA}` },
      );
    } else {
      lijst.push({ fase: "later", naam: `Vanaf maand ${dn + 1}`, regel: `Geen vrijlating meer. ${DAARNA}` });
    }
    return { periodes: lijst, medisch, bron };
  } catch (e) {
    if (!(e instanceof OntbrekendeParameter)) throw e;
    return {
      periodes: [{ fase: "geen", naam: "Zonder vrijlating", regel: "De regels voor de vrijlating zijn voor deze datum nog niet bekend." }],
      bron: regime.grondslag,
    };
  }
}

/** Alleen de perioden (voor bestaande aanroepen). */
export function vrijlatingsPeriodes(invoer: Invoer, regels: RegelSet = standaardRegels): Periode[] {
  return vrijlatingUitleg(invoer, regels).periodes;
}
