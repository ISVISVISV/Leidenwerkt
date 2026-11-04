/**
 * Beschrijft de perioden van de inkomstenvrijlating in gewone taal,
 * met concrete percentages en bedragen uit de regeldata.
 */
import { euro } from "./geld.ts";
import { Lezer, standaardRegels, type RegelSet } from "./regels.ts";
import type { Invoer } from "./types.ts";

export interface Periode {
  fase: Invoer["vrijlatingFase"];
  /** Korte naam, bijvoorbeeld "Maand 1 t/m 6". */
  naam: string;
  /** Wat de vrijlating in deze periode inhoudt. */
  regel: string;
}

const pct = (b: { times: (n: number) => { toString(): string } }) => b.times(100).toString().replace(".", ",") + "%";

export function vrijlatingsPeriodes(invoer: Invoer, regels: RegelSet = standaardRegels): Periode[] {
  const l = new Lezer(regels, invoer.datum);
  const ouderJongKind = invoer.leefvorm === "alleenstaande_ouder" && invoer.kinderen.some((k) => k.leeftijd < 12);
  try {
    if (l.bestaat("pw.bijverdien.percentage")) {
      const p = l.breuk("pw.bijverdien.percentage");
      const duur = l.aantal("pw.bijverdien.duur").toNumber();
      return [
        { fase: "start", naam: `Maand 1 t/m ${duur}`, regel: `U mag ${pct(p)} van uw netto loon houden naast de bijstand, zolang uw inkomen niet hoger is dan de bijstandsnorm.` },
        { fase: "later", naam: `Vanaf maand ${duur + 1}`, regel: "Geen vrijlating meer, tenzij de gemeente die verlengt. Uw hele netto loon gaat van de bijstand af." },
      ];
    }
    const pn = l.breuk("pw.vrijlating_n.percentage");
    const mn = l.bedrag("pw.vrijlating_n.maximum");
    const dn = l.aantal("pw.vrijlating_n.duur").toNumber();
    const lijst: Periode[] = [
      { fase: "start", naam: `Maand 1 t/m ${dn}`, regel: `U mag ${pct(pn)} van uw netto loon houden, maximaal ${euro(mn)} per maand.` },
    ];
    if (ouderJongKind && l.bestaat("pw.vrijlating_r.maximum")) {
      const pr = l.breuk("pw.vrijlating_r.percentage");
      const mr = l.bedrag("pw.vrijlating_r.maximum");
      const dr = l.aantal("pw.vrijlating_r.duur").toNumber();
      lijst.push(
        { fase: "later", naam: `Maand ${dn + 1} t/m ${dn + dr}`, regel: `Als alleenstaande ouder met een kind onder de 12 mag u ${pct(pr)} houden, maximaal ${euro(mr)} per maand.` },
        { fase: "geen", naam: `Vanaf maand ${dn + dr + 1}`, regel: "Geen vrijlating meer. Uw hele netto loon gaat van de bijstand af." },
      );
    } else {
      lijst.push({ fase: "later", naam: `Vanaf maand ${dn + 1}`, regel: "Geen vrijlating meer. Uw hele netto loon gaat van de bijstand af." });
    }
    return lijst;
  } catch {
    return [{ fase: "geen", naam: "Zonder vrijlating", regel: "De regels voor de vrijlating zijn voor deze datum niet bekend." }];
  }
}
