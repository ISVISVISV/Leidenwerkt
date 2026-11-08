/**
 * Toegang tot regeldata op datum. Elke opgevraagde parameter wordt
 * vastgelegd, zodat het uitlegspoor precies laat zien wat is gebruikt.
 */
import { D, type Bedrag } from "./geld.ts";
import data from "./generated/regels.json" with { type: "json" };

export type Status = "geverifieerd" | "onbevestigd" | "ontbrekend";

export interface Bron {
  titel: string;
  url: string;
  geraadpleegd_op: string;
}

/** Letterlijke tekst uit de bron (zie regels/schema.ts). */
export interface BronCitaat {
  kop: string;
  tekst: string;
  url?: string;
  versie?: string;
}

export interface Schijf {
  vanaf: Bedrag;
  tot: Bedrag | null;
  basis: Bedrag;
  percentage: Bedrag;
}

export interface KotRij {
  vanaf: Bedrag;
  tot: Bedrag | null;
  eersteKind: Bedrag;
  volgendKind: Bedrag;
}

export interface RuweParameter {
  id: string;
  omschrijving: string;
  eenheid: string;
  waarde?: any;
  status: Status;
  bron?: Bron;
  citaat?: BronCitaat;
  notitie?: string;
  geldig_van: string;
  geldig_tot: string | null;
}

export interface GebruikteParameter {
  id: string;
  omschrijving: string;
  waarde: string;
  status: Status;
  bron?: Bron;
  citaat?: BronCitaat;
  geldigVan: string;
  notitie?: string;
}

/** Fout die aangeeft dat een onderdeel niet berekend kan worden. */
export class OntbrekendeParameter extends Error {
  constructor(
    public readonly parameterId: string,
    public readonly datum: string,
    public readonly toelichting?: string,
  ) {
    super(`Parameter ${parameterId} ontbreekt voor ${datum}${toelichting ? `: ${toelichting}` : ""}`);
  }
}

export class RegelSet {
  private readonly perId = new Map<string, RuweParameter[]>();

  constructor(parameters: RuweParameter[]) {
    for (const p of parameters) {
      const lijst = this.perId.get(p.id) ?? [];
      lijst.push(p);
      this.perId.set(p.id, lijst);
    }
    for (const lijst of this.perId.values()) lijst.sort((a, b) => (a.geldig_van < b.geldig_van ? -1 : 1));
  }

  /** Geeft de definitie die op `datum` geldt, of undefined. */
  zoek(id: string, datum: string): RuweParameter | undefined {
    const lijst = this.perId.get(id);
    if (!lijst) return undefined;
    let gevonden: RuweParameter | undefined;
    for (const p of lijst) {
      if (p.geldig_van > datum) break;
      gevonden = p;
    }
    if (!gevonden) return undefined;
    if (gevonden.geldig_tot && gevonden.geldig_tot < datum) return undefined;
    return gevonden;
  }

  /**
   * Parameters waarvan de laatste geldigheidsperiode vóór `datum` eindigt,
   * of die op `datum` de status 'ontbrekend' hebben. Gebruikt voor de
   * waarschuwing dat de regels voor een datum nog niet (allemaal) bekend zijn.
   */
  onbekendOp(datum: string): { id: string; omschrijving: string; laatsteDag: string | null }[] {
    const uit: { id: string; omschrijving: string; laatsteDag: string | null }[] = [];
    for (const [id, lijst] of this.perId) {
      const laatste = lijst[lijst.length - 1];
      const p = this.zoek(id, datum);
      const verlopen = !!laatste.geldig_tot && laatste.geldig_tot < datum;
      if (verlopen || (p && p.status === "ontbrekend" && lijst.some((x) => x.status !== "ontbrekend"))) {
        const bekend = [...lijst].reverse().find((x) => x.status !== "ontbrekend");
        uit.push({ id, omschrijving: laatste.omschrijving, laatsteDag: verlopen ? laatste.geldig_tot : (bekend?.geldig_tot ?? null) });
      }
    }
    return uit;
  }

  /** Alle ids, voor controles. */
  ids(): string[] {
    return [...this.perId.keys()];
  }

  /** Datum van de meest recente geldigheid, voor weergave "regels bijgewerkt tot". */
  laatsteGeldigheid(): string {
    let max = "";
    for (const lijst of this.perId.values()) for (const p of lijst) if (p.geldig_van > max) max = p.geldig_van;
    return max;
  }
}

export const ruweParameters = (data as { parameters: RuweParameter[] }).parameters;
export const standaardRegels = new RegelSet(ruweParameters);

/**
 * Leest parameters voor één berekening en houdt bij welke zijn gebruikt.
 */
export class Lezer {
  constructor(
    private readonly regels: RegelSet,
    readonly datum: string,
    readonly gebruikt: GebruikteParameter[] = [],
  ) {}

  /**
   * Lezer voor een andere datum die in hetzelfde uitlegspoor schrijft.
   * Alleen voor overgangsrecht, waar de wet verwijst naar regels zoals
   * die op een eerdere dag luidden.
   */
  op(datum: string): Lezer {
    return new Lezer(this.regels, datum, this.gebruikt);
  }

  private haal(id: string): RuweParameter {
    const p = this.regels.zoek(id, this.datum);
    if (!p) throw new OntbrekendeParameter(id, this.datum, "geen regel voor deze datum");
    if (p.status === "ontbrekend" || !p.waarde) throw new OntbrekendeParameter(id, this.datum, p.notitie);
    return p;
  }

  private noteer(p: RuweParameter, waarde: string) {
    if (!this.gebruikt.some((g) => g.id === p.id)) {
      this.gebruikt.push({
        id: p.id,
        omschrijving: p.omschrijving,
        waarde,
        status: p.status,
        bron: p.bron,
        citaat: p.citaat,
        geldigVan: p.geldig_van,
        notitie: p.notitie,
      });
    }
  }

  /** De letterlijke brontekst bij een parameter op deze datum, zonder de parameter als 'gebruikt' te noteren. */
  brontekst(id: string): { citaat: BronCitaat; bron: Bron; geldigVan: string } | undefined {
    const p = this.regels.zoek(id, this.datum);
    return p?.citaat && p.bron ? { citaat: p.citaat, bron: p.bron, geldigVan: p.geldig_van } : undefined;
  }

  bestaat(id: string): boolean {
    const p = this.regels.zoek(id, this.datum);
    return !!p && p.status !== "ontbrekend";
  }

  bedrag(id: string): Bedrag {
    const p = this.haal(id);
    if (p.waarde.soort !== "bedrag") throw new Error(`${id} is geen bedrag`);
    this.noteer(p, p.waarde.bedrag);
    return D(p.waarde.bedrag);
  }

  breuk(id: string): Bedrag {
    const p = this.haal(id);
    if (p.waarde.soort !== "percentage") throw new Error(`${id} is geen percentage`);
    this.noteer(p, `${D(p.waarde.breuk).times(100).toString()}%`);
    return D(p.waarde.breuk);
  }

  aantal(id: string): Bedrag {
    const p = this.haal(id);
    if (p.waarde.soort !== "aantal") throw new Error(`${id} is geen aantal`);
    this.noteer(p, p.waarde.aantal);
    return D(p.waarde.aantal);
  }

  schijven(id: string): Schijf[] {
    const p = this.haal(id);
    if (p.waarde.soort !== "schijven") throw new Error(`${id} is geen schijventabel`);
    this.noteer(p, "tabel");
    return p.waarde.schijven.map((s: any) => ({
      vanaf: D(s.vanaf),
      tot: s.tot === null ? null : D(s.tot),
      basis: D(s.basis ?? "0"),
      percentage: D(s.percentage),
    }));
  }

  kotTabel(id: string): KotRij[] {
    const p = this.haal(id);
    if (p.waarde.soort !== "kot_tabel") throw new Error(`${id} is geen kinderopvangtabel`);
    this.noteer(p, "tabel");
    return p.waarde.rijen.map((r: any) => ({
      vanaf: D(r.vanaf),
      tot: r.tot === null ? null : D(r.tot),
      eersteKind: D(r.eerste_kind),
      volgendKind: D(r.volgend_kind),
    }));
  }
}
