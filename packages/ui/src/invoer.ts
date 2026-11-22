/** Invoer uit een formulier: datums en getallen zoals mensen ze typen. */

export type Geboortedatum = string;

export const legeDatum = (): Geboortedatum => "";

/**
 * Maakt van wat iemand typt een datum met streepjes. Wie alleen cijfers typt
 * (op een telefoon heeft het cijfertoetsenbord vaak geen streepje), krijgt de
 * streepjes vanzelf: 14031990 wordt 14-03-1990. Punten, schuine strepen en
 * spaties worden streepjes.
 */
export function datumInvoer(nieuw: string, oud: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nieuw.trim());
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
  const schoon = nieuw
    .replace(/[\s./]+/g, "-")
    .replace(/[^0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-/, "");
  // Bij wissen niets terugzetten, anders is een streepje niet weg te halen.
  if (nieuw.length < oud.length) return schoon.slice(0, 10);
  const eindigtOpStreep = schoon.endsWith("-");
  const delen = schoon.split("-").filter((d, i, alle) => d !== "" || i < alle.length - 1).slice(0, 3);
  for (let i = 0; i < 2; i++) {
    if (delen[i] !== undefined && delen[i]!.length > 2) {
      delen[i + 1] = delen[i]!.slice(2) + (delen[i + 1] ?? "");
      delen[i] = delen[i]!.slice(0, 2);
    }
  }
  if (delen[2] !== undefined) delen[2] = delen[2].slice(0, 4);
  let uit = delen.join("-");
  const laatste = delen[delen.length - 1] ?? "";
  if (delen.length < 3 && (laatste.length === 2 || (eindigtOpStreep && laatste.length > 0))) uit += "-";
  return uit;
}

/** De datum als JJJJ-MM-DD, of undefined als hij niet (volledig) is ingevuld of niet bestaat. */
export function isoDatum(g: Geboortedatum): string | undefined {
  const delen = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(g.trim());
  if (!delen) return undefined;
  const [d, m, j] = [Number(delen[1]), Number(delen[2]), Number(delen[3])];
  const datum = new Date(j, m - 1, d);
  if (datum.getFullYear() !== j || datum.getMonth() !== m - 1 || datum.getDate() !== d) return undefined;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${j}-${p(m)}-${p(d)}`;
}

/** Leeftijd in hele jaren op een datum (JJJJ-MM-DD). Undefined bij een ongeldige of toekomstige geboortedatum. */
export function leeftijdOp(g: Geboortedatum, datum: string): number | undefined {
  const geboren = isoDatum(g);
  if (!geboren || geboren > datum) return undefined;
  const jaren = Number(datum.slice(0, 4)) - Number(geboren.slice(0, 4));
  return datum.slice(5) < geboren.slice(5) ? jaren - 1 : jaren;
}

/** Leest "15,50", "15.50" of "1.250,00" als getal; leeg geeft undefined. */
export function getal(tekst: string): number | undefined {
  const schoon = tekst.trim().replace(/\s|€/g, "");
  if (schoon === "") return undefined;
  let genormaliseerd: string;
  if (schoon.includes(",")) genormaliseerd = schoon.replace(/\./g, "").replace(",", "."); // 1.250,50
  else if (/^\d{1,3}(\.\d{3})+$/.test(schoon)) genormaliseerd = schoon.replace(/\./g, ""); // 1.250
  else genormaliseerd = schoon; // 15.50 of 1250
  const n = Number(genormaliseerd);
  return Number.isFinite(n) ? n : NaN;
}

/** Laat alleen tekens door die in een getal horen; letters en andere tekens verdwijnen meteen. */
export function alleenCijfers(tekst: string, soort: "geheel" | "getal"): string {
  return soort === "geheel" ? tekst.replace(/[^0-9]/g, "") : tekst.replace(/[^0-9.,]/g, "");
}
