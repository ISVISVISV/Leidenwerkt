/**
 * Exacte decimale rekenkunde voor bedragen. Er wordt nergens met
 * JavaScript-floats gerekend; alleen bij weergave wordt afgerond.
 */
import Decimal from "decimal.js";

const Dec = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export type Bedrag = InstanceType<typeof Dec>;

export function D(waarde: string | number | Bedrag): Bedrag {
  if (typeof waarde === "number" && !Number.isFinite(waarde)) throw new Error("ongeldig getal");
  return new Dec(waarde as any);
}

export const NUL = D(0);

export function max(...waarden: Bedrag[]): Bedrag {
  return waarden.reduce((a, b) => (a.gte(b) ? a : b));
}

export function min(...waarden: Bedrag[]): Bedrag {
  return waarden.reduce((a, b) => (a.lte(b) ? a : b));
}

/** Afronden op centen, als tekst met punt als scheidingsteken. */
export function centen(b: Bedrag): string {
  return b.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

/** Nederlandse weergave: € 1.234,56 (of hele euro's). */
export function euro(waarde: Bedrag | string, heleEuros = false): string {
  const b = typeof waarde === "string" ? D(waarde) : waarde;
  const afgerond = heleEuros ? b.toDecimalPlaces(0, Decimal.ROUND_HALF_UP) : b.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const negatief = afgerond.isNegative() && !afgerond.isZero();
  const [heel, deel] = afgerond.abs().toFixed(heleEuros ? 0 : 2).split(".");
  const metPunten = heel.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negatief ? "−\u00a0" : ""}€\u00a0${metPunten}${deel ? "," + deel : ""}`;
}
