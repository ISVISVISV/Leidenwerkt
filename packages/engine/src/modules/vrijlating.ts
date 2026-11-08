/**
 * Vrijlating van inkomsten uit arbeid, per regime (zie ../regimes.ts).
 *
 * - pw31 (tot en met 2026): art. 31 lid 2 onder n, r en y Pw, met lid 5
 *   (n en r niet onder de 27 jaar).
 * - pw34a (vanaf 2027): art. 34a Pw, met overgangsrecht uit art. 78ff:
 *   lid 2: wie vóór 2027 een vrijlating onder n had, houdt het oude
 *          onderdeel n (met het bedrag van 31 december 2026), uiterlijk
 *          12 maanden na 1 januari 2027;
 *   lid 3: wie vóór 2027 een vrijlating onder r had, krijgt voor de rest
 *          van die periode de vrijlating van art. 34a lid 1 onder a.
 *
 * Alle bedragen zijn netto per maand van één persoon.
 */
import { NUL, min, type Bedrag } from "../geld.ts";
import { euro } from "../geld.ts";
import type { Lezer } from "../regels.ts";
import { REGIMES, dagVoor, plusMaanden, regimeOp } from "../regimes.ts";
import type { Fase, Overgang2027 } from "../types.ts";

export interface VrijlatingVraag {
  fase: Fase;
  nettoArbeid: Bedrag;
  leeftijd: number;
  alleenstaandeOuderMetJongKind: boolean;
  medischUrenbeperkt?: boolean;
  /** Welke vrijlating de persoon op 31 december 2026 had (alleen relevant vanaf 2027). */
  overgang?: Overgang2027;
  /** Netto inkomen van het huishouden en de bijstandsnorm (voor de toets vooraf bij art. 34a). */
  huishoudinkomen?: Bedrag;
  norm?: Bedrag;
}

export interface VrijlatingUitkomst {
  bedrag: Bedrag;
  uitleg: string;
  aannames: string[];
}

const pct = (b: Bedrag) => `${b.times(100).toString().replace(".", ",")}%`;
const geen = (uitleg: string, aannames: string[] = []): VrijlatingUitkomst => ({ bedrag: NUL, uitleg, aannames });

export function vrijlating(l: Lezer, v: VrijlatingVraag): VrijlatingUitkomst {
  if (v.nettoArbeid.lte(0)) return geen("Geen inkomsten uit werk");
  const regime = regimeOp(l.datum);
  if (regime.id === "pw34a") return pw34a(l, v);
  return pw31(l, v);
}

function pw31(l: Lezer, v: VrijlatingVraag): VrijlatingUitkomst {
  const minLeeftijd = l.aantal("pw.vrijlating.minimumleeftijd");
  const nGeldt = v.fase === "start" && !minLeeftijd.gt(v.leeftijd);
  // Onderdeel y geldt "tenzij onderdeel n van toepassing is".
  if (v.medischUrenbeperkt && !nGeldt && v.fase !== "geen") {
    const p = l.breuk("pw.vrijlating_y.percentage");
    const m = l.bedrag("pw.vrijlating_y.maximum");
    return {
      bedrag: min(v.nettoArbeid.times(p), m),
      uitleg: `Vrijlating bij een medische urenbeperking: ${pct(p)} van het netto loon, maximaal ${euro(m)} per maand`,
      aannames: [],
    };
  }
  if (v.fase === "geen") return geen("Geen vrijlating toegepast");
  if (minLeeftijd.gt(v.leeftijd)) {
    return geen(`Onder de ${minLeeftijd.toString()} jaar geldt deze vrijlating niet`);
  }
  if (v.fase === "start") {
    const p = l.breuk("pw.vrijlating_n.percentage");
    const m = l.bedrag("pw.vrijlating_n.maximum");
    const duur = l.aantal("pw.vrijlating_n.duur");
    return {
      bedrag: min(v.nettoArbeid.times(p), m),
      uitleg: `Vrijlating maand 1 t/m ${duur.toString()}: ${pct(p)} van het netto loon, maximaal ${euro(m)} per maand`,
      aannames: [],
    };
  }
  if (!v.alleenstaandeOuderMetJongKind) {
    const duur = l.aantal("pw.vrijlating_n.duur");
    return geen(`Vanaf maand ${duur.plus(1).toString()} geen vrijlating meer`);
  }
  const p = l.breuk("pw.vrijlating_r.percentage");
  const m = l.bedrag("pw.vrijlating_r.maximum");
  l.aantal("pw.vrijlating_r.duur");
  return {
    bedrag: min(v.nettoArbeid.times(p), m),
    uitleg: `Vrijlating alleenstaande ouder: ${pct(p)} van het netto loon, maximaal ${euro(m)} per maand`,
    aannames: ["Er is aangenomen dat u de volledige zorg heeft voor een kind jonger dan 12 jaar."],
  };
}

function pw34a(l: Lezer, v: VrijlatingVraag): VrijlatingUitkomst {
  const nieuw = REGIMES.find((r) => r.id === "pw34a")!;
  const overgangN = v.overgang === "n" && v.fase !== "geen" && l.datum < plusMaanden(nieuw.vanaf, l.aantal("pw.overgang_n.duur").toNumber());
  // Memorie van toelichting bij art. 34a (Kamerstuk 36582, nr. 3): "eerst getoetst [...] of er een inkomen
  // onder de bijstandsnorm is. Als het inkomen hoger is dan de bijstandsnorm eindigt het recht op bijstand
  // en wordt niet toegekomen aan de toepassing van het nieuwe artikel 34a." Niet bij het oude onderdeel n.
  if (!overgangN && v.huishoudinkomen && v.norm && v.huishoudinkomen.gt(v.norm)) {
    return geen("Uw inkomen is hoger dan de bijstandsnorm. Dan stopt de bijstand en geldt de bijverdienregeling niet");
  }
  if (v.medischUrenbeperkt && v.fase !== "geen") {
    const p = l.breuk("pw.bijverdien.medisch_percentage");
    return {
      bedrag: v.nettoArbeid.times(p),
      uitleg: `Bijverdienregeling bij een medische urenbeperking: ${pct(p)} van het netto loon`,
      aannames: [],
    };
  }
  if (v.fase === "geen") return geen("Geen vrijlating toegepast");

  if (v.overgang === "n") {
    const einde = plusMaanden(nieuw.vanaf, l.aantal("pw.overgang_n.duur").toNumber());
    if (l.datum < einde) {
      if (v.fase === "later") {
        return geen("Na de oude vrijlating van 6 maanden: geen vrijlating meer", [
          "De wet zegt niet of u na de oude vrijlating nog de nieuwe bijverdienregeling krijgt. Hier is aangenomen van niet. Vraag het uw klantmanager.",
        ]);
      }
      // Het oude onderdeel n, zoals het luidde op de dag voor de wijziging.
      const oud = l.op(dagVoor(nieuw));
      const p = oud.breuk("pw.vrijlating_n.percentage");
      const m = oud.bedrag("pw.vrijlating_n.maximum");
      oud.aantal("pw.vrijlating_n.duur");
      return {
        bedrag: min(v.nettoArbeid.times(p), m),
        uitleg: `Overgangsrecht: de oude vrijlating loopt door, ${pct(p)} van het netto loon, maximaal ${euro(m)} per maand`,
        aannames: [`Het bedrag van de oude vrijlating is dat van ${dagVoor(nieuw)}; het wordt niet meer verhoogd.`],
      };
    }
  }
  if (v.overgang === "r" && v.fase === "start") {
    const p = l.breuk("pw.bijverdien.percentage");
    return {
      bedrag: v.nettoArbeid.times(p),
      uitleg: `Overgangsrecht alleenstaande ouder: ${pct(p)} van het netto loon voor de rest van uw periode`,
      aannames: ["Uw oude vrijlating als alleenstaande ouder loopt door met het nieuwe percentage, voor de rest van de periode van ten hoogste 30 maanden."],
    };
  }
  const duur = l.aantal("pw.bijverdien.duur");
  if (v.fase === "later") {
    return geen(`Vanaf maand ${duur.plus(1).toString()} geen bijverdienregeling meer`, [
      `De gemeente kan de regeling na ${duur.toString()} maanden verlengen als meer uren werken voor u niet mogelijk is. Hier is aangenomen dat dat niet gebeurt.`,
    ]);
  }
  const p = l.breuk("pw.bijverdien.percentage");
  return {
    bedrag: v.nettoArbeid.times(p),
    uitleg: `Bijverdienregeling maand 1 t/m ${duur.toString()}: ${pct(p)} van het netto loon`,
    aannames: [],
  };
}
