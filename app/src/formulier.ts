import { Lezer, standaardRegels, type Invoer, type Kind, type Leefvorm, type Opvangsoort } from "@leidenwerkt/engine";

/** Hoogste uurprijs waarover kinderopvangtoeslag wordt gegeven, voor de rekendatum. */
export function maxUurprijs(l: Lezer, soort: Opvangsoort): number {
  try {
    return Number(l.bedrag(`kot.max_uurprijs.${soort}`).toFixed(2));
  } catch {
    return 0;
  }
}

export type LoonPer = "maand" | "netto" | "week" | "nettoweek" | "uur";
/** Leeg: nog niet gekozen. */
export type LoonPerKeuze = LoonPer | "";
/** Leeg: nog niet gekozen. */
export type AllIn = "" | "nee" | "ja" | "onbekend";
/** "kostgeld": bij iemand anders in huis, en betaalt een bedrag voor de woonruimte (kostgeld of huur). */
export type Woonsituatie = "huur" | "koop" | "inwonend" | "kostgeld" | "dakloos" | "instelling";

/** Geboortedatum zoals ingevuld, als tekst: dag-maand-jaar, bijvoorbeeld "14-03-1990". */
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

export interface KindVeld {
  geboren: Geboortedatum;
  opvang: boolean;
  /** Leeg: nog niet gekozen. */
  soort: Opvangsoort | "";
  uren: string;
  uurprijs: string;
  /** Bruto inkomen per jaar, voor de huurtoeslag; alleen bij een kind van 18 of ouder in een huurwoning. */
  inkomen: string;
  inkomenOnbekend: boolean;
}

/** Ja/nee-vragen zonder vooraf gekozen antwoord. */
export type JaNeeVraag = "partner" | "heeftKinderen" | "partnerWerkt" | "heeftAnderInkomen" | "woonlasten" | "andereBewoners" | "werktNu";

export interface Formulier {
  leefvorm: Leefvorm;
  geboren: Geboortedatum;
  partnerGeboren: Geboortedatum;
  partnerWerkt: boolean;
  partnerBruto: string;
  /** Hoe lang de partner al naast de bijstand werkt: bepaalt of het loon van de partner een vrijlating heeft. */
  partnerWerktAl: "" | "kort" | "lang";
  kinderen: KindVeld[];
  /** Ander inkomen van het huishouden, zoals alimentatie of een andere uitkering. */
  heeftAnderInkomen: boolean;
  anderInkomen: string;
  partneralimentatie: string;
  kinderalimentatie: string;
  /** Wonen er nog andere mensen in huis, naast partner en kinderen? */
  andereBewoners: boolean;
  kostendelers: string;
  /** Huisgenoten van 18 tot 27 jaar die geen kind van de gebruiker zijn. */
  jongeHuisgenoten: string;
  huisgenotenInkomen: string;
  /** De gebruiker weet het inkomen van de huisgenoten niet; dan geen huurtoeslag uitrekenen. */
  huisgenotenOnbekend: boolean;
  /** Welke ja/nee-vragen de gebruiker heeft beantwoord. */
  beantwoord: Partial<Record<JaNeeVraag, true>>;
  /** Woonsituatie. "instelling": instelling of woonvorm met begeleiding (norm art. 23 Pw). */
  woont: Woonsituatie | "";
  /** Eigen voordeur, keuken, wc en douche of bad (alleen bij huur). */
  zelfstandig: boolean;
  /** Betaalt zelf gas, licht en water (alleen zonder woonkosten). */
  woonlasten: boolean;
  kaleHuur: string;
  /** Vanaf 2027: welke vrijlating de gebruiker op 31 december 2026 al had. */
  overgang: "" | "n" | "r";
  werktNu: boolean;
  /** Wie al werkt: hoe lang al naast de bijstand? "lang" = 6 maanden of langer. */
  werktAl: "" | "kort" | "lang";
  /** Wie al werkt en opvang heeft: gaan de kinderen nu al naar de opvang? */
  opvangNu: "" | "ja" | "nee";
  /** Wie al werkt: wat verandert er? Meer uren, ander werk of werk erbij. */
  verandering: "" | "meer" | "ander" | "erbij";
  /** Bij "meer": het nieuwe totaal aantal uren bij het huidige werk. */
  meerUren: string;
  medisch: boolean;
  nuPer: LoonPerKeuze;
  nuLoon: string;
  nuUren: string;
  per: LoonPerKeuze;
  /** Bij een uurloon: zit het vakantiegeld er al in (all-in)? */
  allIn: AllIn;
  nuAllIn: AllIn;
  loon: string;
  uren: string;
  reiskosten: string;
  vergoeding: string;
  overigeKosten: string;
}

export const leegFormulier: Formulier = {
  leefvorm: "alleenstaande",
  geboren: legeDatum(),
  partnerGeboren: legeDatum(),
  partnerWerkt: false,
  partnerBruto: "",
  partnerWerktAl: "",
  kinderen: [],
  heeftAnderInkomen: false,
  anderInkomen: "",
  partneralimentatie: "",
  kinderalimentatie: "",
  andereBewoners: false,
  kostendelers: "",
  jongeHuisgenoten: "",
  huisgenotenInkomen: "",
  huisgenotenOnbekend: false,
  beantwoord: {},
  woont: "",
  zelfstandig: true,
  woonlasten: false,
  kaleHuur: "",
  overgang: "",
  werktNu: false,
  werktAl: "",
  opvangNu: "",
  verandering: "",
  meerUren: "",
  medisch: false,
  nuPer: "",
  nuLoon: "",
  nuUren: "",
  per: "",
  allIn: "",
  nuAllIn: "",
  loon: "",
  uren: "",
  reiskosten: "",
  vergoeding: "",
  overigeKosten: "",
};

export const nieuwKind = (): KindVeld => ({ geboren: legeDatum(), opvang: false, soort: "", uren: "", uurprijs: "", inkomen: "", inkomenOnbekend: false });

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

export function vandaag(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Het inkomen van de anderen in huis is nodig voor de huurtoeslag: huisgenoten, of kinderen van 18 of ouder. */
/** De vraag naar andere bewoners heeft geen zin zonder vaste woonplek of in een instelling. */
export function vraagBewoners(f: Formulier): boolean {
  return f.woont !== "" && f.woont !== "dakloos" && f.woont !== "instelling";
}

/**
 * Wie bij iemand anders in huis woont, woont altijd met minstens één volwassene: degene bij wie hij woont.
 * Dan geen ja/nee-vraag, maar meteen het aantal van 27 jaar of ouder (de bewoner zelf meegeteld).
 */
export function bijIemandAnders(f: Formulier): boolean {
  return f.woont === "inwonend" || f.woont === "kostgeld";
}

/** Er wonen andere volwassenen in huis: gekozen bij de ja/nee-vraag, of vanzelf bij iemand anders in huis. */
function metAnderen(f: Formulier): boolean {
  return vraagBewoners(f) && (bijIemandAnders(f) || f.andereBewoners);
}

/**
 * Gas, licht en water telt alleen voor de verlaging bij geen woonkosten, en die geldt niet bij de
 * kostendelersnorm. Daarom pas na de vraag over andere bewoners, en alleen zonder volwassenen van 27+.
 */
export function vraagWoonlasten(f: Formulier): boolean {
  return f.woont === "inwonend" && f.kostendelers.trim() !== "" && (getal(f.kostendelers) ?? 0) === 0;
}

/** Huisgenoten van 18 tot en met 26 jaar tellen alleen mee voor de huurtoeslag. */
export function vraagJongeHuisgenoten(f: Formulier): boolean {
  return metAnderen(f) && f.woont === "huur" && f.zelfstandig;
}

export function aantalKostendelers(f: Formulier): number {
  return metAnderen(f) ? (getal(f.kostendelers) ?? 0) : 0;
}

export function aantalJongeHuisgenoten(f: Formulier): number {
  return vraagJongeHuisgenoten(f) ? (getal(f.jongeHuisgenoten) ?? 0) : 0;
}

/** Het inkomen van huisgenoten telt mee voor de huurtoeslag; alleen nodig in een zelfstandige huurwoning. */
export function vraagInkomenAnderen(f: Formulier): boolean {
  return f.woont === "huur" && f.zelfstandig && aantalKostendelers(f) + aantalJongeHuisgenoten(f) > 0;
}

/** Het inkomen van een kind van 18 of ouder telt mee voor de huurtoeslag (met een vrijstelling onder de 23). */
export function vraagInkomenKind(f: Formulier, k: KindVeld): boolean {
  return f.woont === "huur" && f.zelfstandig && (leeftijdOp(k.geboren, vandaag()) ?? 0) >= 18;
}

/** Hoogste aantal opvanguren per kind per maand waarover toeslag wordt berekend (uit de regeldata). */
export function maxOpvanguren(): number | undefined {
  try {
    return new Lezer(standaardRegels, vandaag()).aantal("kot.max_uren_per_maand").toNumber();
  } catch {
    return undefined;
  }
}

export type Fouten = Partial<Record<string, string>>;

export function controleer(f: Formulier, stap: number): Fouten {
  const fouten: Fouten = {};
  const moet = (veld: keyof Formulier | string, tekst: string, min: number, maxi: number, melding: string, verplicht = true) => {
    const n = getal(tekst);
    if (n === undefined) {
      if (verplicht) fouten[veld] = "Vul dit in.";
    } else if (Number.isNaN(n) || n < min || n > maxi) fouten[veld] = melding;
  };
  /** De urenschuif werkt in hele uren; een half uur zou stil worden afgerond. */
  const heleUren = (veld: string, tekst: string) => {
    const n = getal(tekst);
    if (!fouten[veld] && n !== undefined && !Number.isNaN(n) && !Number.isInteger(n)) fouten[veld] = "Vul een heel aantal uren in, bijvoorbeeld 20.";
  };
  if (stap === 1) {
    const kies = "Kies Ja of Nee.";
    if (!f.beantwoord.partner) fouten.partner = kies;
    if (!f.beantwoord.heeftKinderen) fouten.heeftKinderen = kies;
    if (f.leefvorm === "paar" && !f.beantwoord.partnerWerkt) fouten.partnerWerkt = kies;
    if (!f.beantwoord.heeftAnderInkomen) fouten.heeftAnderInkomen = kies;
    const geboren = (veld: string, g: Geboortedatum, min: number, maxi: number, melding: string) => {
      if (!g.trim()) fouten[veld] = "Vul dit in.";
      else if (!isoDatum(g)) fouten[veld] = `Vul een datum in die bestaat, met dag, maand en jaar. Bijvoorbeeld ${veld.startsWith("kind") ? "14-03-2018" : "14-03-1990"}.`;
      else if (isoDatum(g)! > vandaag()) fouten[veld] = "Deze datum ligt in de toekomst. Vul de geboortedatum in.";
      else {
        const leeftijd = leeftijdOp(g, vandaag())!;
        if (leeftijd < min || leeftijd > maxi) fouten[veld] = melding;
      }
    };
    geboren("geboren", f.geboren, 21, 66, "Deze rekenhulp werkt voor mensen van 21 tot 67 jaar.");
    if (f.leefvorm === "paar") geboren("partnerGeboren", f.partnerGeboren, 21, 66, "Uw partner moet 21 tot 67 jaar zijn.");
    if (f.leefvorm === "paar" && f.partnerWerkt) moet("partnerBruto", f.partnerBruto, 1, 20000, "Vul een bruto maandloon in.");
    if (f.leefvorm === "paar" && f.partnerWerkt && !f.partnerWerktAl) fouten.partnerWerktAl = "Kies hoe lang uw partner al werkt.";
    if (f.leefvorm === "alleenstaande_ouder" && f.kinderen.length === 0) fouten.kinderen = "Voeg minstens één kind toe.";
    f.kinderen.forEach((k, i) => {
      geboren(`kind${i}`, k.geboren, 0, 26, "Dit kind is 27 jaar of ouder. Haal het hier weg en vul het bij de volgende stap in, bij de andere bewoners.");
      if (k.opvang) {
        if (!k.soort) fouten[`soort${i}`] = "Kies de soort opvang.";
        // Uren per week; boven het maximum van de toeslag rekent de rekenkern de kosten wel, de toeslag niet.
        moet(`kind${i}uren`, k.uren, 1, 60, "Vul het aantal uur per week in, van 1 tot en met 60.");
        moet(`kind${i}prijs`, k.uurprijs, 1, 30, "Vul een prijs per uur in, bijvoorbeeld 11,50. Weet u het niet? Laat het vak dan leeg.", false);
      }
    });
    if (f.heeftAnderInkomen) {
      // Elk vak mag leeg; samen moet er wel iets ingevuld zijn.
      const vakken: [string, string][] = [
        ["partneralimentatie", f.partneralimentatie],
        ...(f.kinderen.length > 0 ? ([["kinderalimentatie", f.kinderalimentatie]] as [string, string][]) : []),
        ["anderInkomen", f.anderInkomen],
      ];
      for (const [veld, tekst] of vakken) if (tekst.trim() !== "") moet(veld, tekst, 0, 10000, "Vul een bedrag per maand in, bijvoorbeeld 250.");
      if (vakken.every(([, t]) => (getal(t) ?? 0) === 0) && !vakken.some(([v]) => fouten[v]))
        fouten.anderInkomen = "Vul bij minstens één soort inkomen een bedrag in. Of kies Nee bij de vraag hierboven.";
    }
  }
  if (stap === 2 && metAnderen(f)) {
    moet("kostendelers", f.kostendelers, 0, 10, "Vul een aantal van 0 tot 10 in.");
    if (vraagJongeHuisgenoten(f)) moet("jongeHuisgenoten", f.jongeHuisgenoten, 0, 10, "Vul een aantal van 0 tot 10 in.");
  }
  if (stap === 2 && vraagInkomenAnderen(f)) {
    if (!f.huisgenotenOnbekend) moet("huisgenotenInkomen", f.huisgenotenInkomen, 0, 500000, "Vul een bedrag per jaar in, bijvoorbeeld 25.000. Geen inkomen? Vul 0 in.");
  }
  if (stap === 2) {
    f.kinderen.forEach((k, i) => {
      if (vraagInkomenKind(f, k) && !k.inkomenOnbekend) moet(`kind${i}inkomen`, k.inkomen, 0, 500000, "Vul een bedrag per jaar in, bijvoorbeeld 4.000. Geen inkomen? Vul 0 in.");
    });
  }
  if (stap === 2 && !f.woont) fouten.woont = "Kies waar u woont.";
  if (stap === 2 && vraagWoonlasten(f) && !f.beantwoord.woonlasten) fouten.woonlasten = "Kies Ja of Nee.";
  if (stap === 2 && vraagBewoners(f) && !bijIemandAnders(f) && !f.beantwoord.andereBewoners) fouten.andereBewoners = "Kies Ja of Nee.";
  if (stap === 2 && (f.woont === "huur" || f.woont === "kostgeld")) {
    moet(
      "kaleHuur",
      f.kaleHuur,
      1,
      3000,
      f.woont === "kostgeld"
        ? "Vul in wat u per maand voor uw woonruimte betaalt, bijvoorbeeld 150."
        : f.zelfstandig
          ? "Vul de kale huur per maand in. Die staat in uw huurcontract of op het overzicht van de verhuurder."
          : "Vul de huur per maand in, bijvoorbeeld 450.",
    );
  }
  if (stap === 3) {
    if (!f.beantwoord.werktNu) fouten.werktNu = "Kies Ja of Nee.";
    const loonGrens = (per: LoonPerKeuze): [number, number, string] =>
      per === "uur"
        ? [1, 100, "Vul een bruto loon per uur in van € 1 tot € 100, bijvoorbeeld 15,00. Weet u uw loon per maand? Kies dat dan hierboven."]
        : per === "netto"
          ? [50, 15000, "Vul uw netto loon per maand in, bijvoorbeeld 1.500."]
          : per === "week"
            ? [10, 4000, "Vul uw bruto loon per week in, bijvoorbeeld 420."]
          : per === "nettoweek"
            ? [10, 4000, "Vul uw netto loon per week in, bijvoorbeeld 350."]
          : [50, 15000, "Vul uw bruto loon per maand in, bijvoorbeeld 1.800."];
    if (f.werktNu && !f.nuPer) fouten.nuper = "Kies welk bedrag u weet.";
    if ((!f.werktNu || f.verandering === "ander" || f.verandering === "erbij") && !f.per) fouten.straksper = "Kies welk bedrag u weet.";
    if (f.werktNu) {
      if (f.nuPer) moet("nuLoon", f.nuLoon, ...loonGrens(f.nuPer));
      moet("nuUren", f.nuUren, 1, 60, "Vul het aantal uren per week in, van 1 tot en met 60.");
      heleUren("nuUren", f.nuUren);
      if (!f.verandering) fouten.verandering = "Kies wat er verandert.";
      if (!f.werktAl) fouten.werktAl = "Kies hoe lang u al werkt.";
      if (heeftOpvang(f) && !f.opvangNu) fouten.opvangNu = "Kies of uw kind nu al naar de opvang gaat.";
    }
    if (f.werktNu && f.verandering === "meer") {
      const nu = getal(f.nuUren) ?? 0;
      moet("meerUren", f.meerUren, nu + 1, 60, `Vul in hoeveel uur u straks in totaal werkt: meer dan ${nu} en hoogstens 60.`);
      heleUren("meerUren", f.meerUren);
    } else if (!f.werktNu || f.verandering) {
      if (f.per) moet("loon", f.loon, ...loonGrens(f.per));
      moet("uren", f.uren, 1, 60, "Vul het aantal uren per week in, van 1 tot en met 60.");
      heleUren("uren", f.uren);
    }
    if (f.werktNu && f.nuPer === "uur" && !f.nuAllIn) fouten.nuallIn = "Kies een antwoord. Weet u het niet? Kies dan 'Ik weet het niet'.";
    if ((!f.werktNu || f.verandering === "ander" || f.verandering === "erbij") && f.per === "uur" && !f.allIn) {
      fouten.straksallIn = "Kies een antwoord. Weet u het niet? Kies dan 'Ik weet het niet'.";
    }
    for (const v of ["reiskosten", "vergoeding", "overigeKosten"] as const) moet(v, f[v], 0, 2000, "Vul een bedrag per maand in, of laat het vak leeg.", false);
  }
  return fouten;
}

/** Het loon zoals de gebruiker het invulde, voor het werk waarmee de uitkomst rekent. Bij "meer uren" het huidige loon. */
export function ingevuldLoon(f: Formulier): { bedrag: string; per: LoonPer; allIn: AllIn } | undefined {
  const nu = f.werktNu && f.verandering === "meer";
  const bedrag = nu ? f.nuLoon : f.loon;
  if (!getal(bedrag)) return undefined;
  const per = (nu ? f.nuPer : f.per) || "maand";
  return { bedrag, per, allIn: nu ? f.nuAllIn : f.allIn };
}

/** Uren opvang per week omgerekend naar een maand: 52 weken verdeeld over 12 maanden, op twee decimalen. */
export const urenPerMaand = (perWeek: number) => Math.round(((perWeek * 52) / 12) * 100) / 100;

/** Er is minstens één kind met opvang ingevuld. */
export function heeftOpvang(f: Formulier): boolean {
  return f.kinderen.some((k) => k.opvang);
}

/** Wie al 6 maanden of langer werkt, heeft de eerste vrijlating gehad: de app rekent dan met de periode daarna. */
export function vasteFase(f: Formulier): "later" | undefined {
  return f.werktNu && f.werktAl === "lang" ? "later" : undefined;
}

export function naarInvoer(f: Formulier, opties: { uren?: number; fase: Invoer["vrijlatingFase"]; datum: string }): Invoer {
  opties = { ...opties, fase: opties.fase === "geen" ? "geen" : (vasteFase(f) ?? opties.fase) };
  const l = new Lezer(standaardRegels, opties.datum);
  const kinderen: Kind[] = f.kinderen.map((k) => {
    const prijs = getal(k.uurprijs);
    const geschat = prijs === undefined;
    return {
      leeftijd: leeftijdOp(k.geboren, opties.datum) ?? 0,
      leeftijdBeginJaar: leeftijdOp(k.geboren, `${opties.datum.slice(0, 4)}-01-01`) ?? undefined,
      inkomenJaar: vraagInkomenKind(f, k) && !k.inkomenOnbekend ? getal(k.inkomen) : undefined,
      inkomenOnbekend: vraagInkomenKind(f, k) && k.inkomenOnbekend ? true : undefined,
      opvang: k.opvang
        ? { soort: k.soort || "dagopvang", urenPerMaand: urenPerMaand(getal(k.uren) ?? 0), uurprijs: geschat ? maxUurprijs(l, k.soort || "dagopvang") : prijs, uurprijsGeschat: geschat || undefined }
        : undefined,
    };
  });
  const paar = f.leefvorm === "paar";
  return {
    datum: opties.datum,
    gemeente: "leiden",
    leefvorm: f.leefvorm,
    leeftijd: leeftijdOp(f.geboren, opties.datum) ?? 0,
    partner: paar
      ? { leeftijd: leeftijdOp(f.partnerGeboren, opties.datum) ?? 0, werk: f.partnerWerkt ? { brutoMaandloon: getal(f.partnerBruto) ?? 0 } : undefined, werktKort: f.partnerWerkt && f.partnerWerktAl === "kort" }
      : undefined,
    kinderen,
    kostendelers: aantalKostendelers(f),
    jongeHuisgenoten: aantalJongeHuisgenoten(f),
    huisgenotenInkomenJaar: vraagInkomenAnderen(f) && !f.huisgenotenOnbekend ? getal(f.huisgenotenInkomen) : undefined,
    wonen:
      f.woont === "huur" || f.woont === "kostgeld"
        ? { soort: "huur", kaleHuurPerMaand: getal(f.kaleHuur), zelfstandig: f.woont === "huur" && f.zelfstandig }
        : f.woont === "inwonend" || f.woont === "dakloos"
          ? { soort: "geen_woonkosten", dakloos: f.woont === "dakloos", betaaltWoonlasten: f.woont === "inwonend" && f.woonlasten }
          : f.woont === "instelling"
            ? { soort: "instelling" }
            : { soort: "anders" },
    huidigWerk: f.werktNu ? loonWerk(f.nuPer, getal(f.nuLoon) ?? 0, getal(f.nuUren) ?? 0, undefined, f.nuAllIn) : undefined,
    nieuwWerk: {
      ...nieuwLoon(f, opties.uren),
      reiskostenPerMaand: getal(f.reiskosten),
      reiskostenvergoedingPerMaand: getal(f.vergoeding),
      overigeKostenPerMaand: getal(f.overigeKosten),
    },
    vrijlatingFase: opties.fase,
    // De vrijlating hoort bij de persoon, niet bij een baan: wie al werkt, zit nu in dezelfde periode.
    huidigeVrijlating: f.werktNu ? opties.fase : "geen",
    overgang2027: f.werktNu && f.overgang ? f.overgang : undefined,
    medischUrenbeperkt: f.medisch || undefined,
    anderInkomenPerMaand: f.heeftAnderInkomen ? getal(f.anderInkomen) : undefined,
    partneralimentatiePerMaand: f.heeftAnderInkomen ? getal(f.partneralimentatie) : undefined,
    kinderalimentatiePerMaand: f.heeftAnderInkomen && f.kinderen.length > 0 ? getal(f.kinderalimentatie) : undefined,
    opvangNu: f.werktNu && heeftOpvang(f) && f.opvangNu === "ja" ? true : undefined,
  };
}

/**
 * Het werk straks, afhankelijk van wat er verandert. `schuif` is het aantal uren
 * van de urenschuif: bij "meer" het nieuwe totaal, bij "erbij" de uren van het
 * extra werk, anders de uren van het (nieuwe) werk.
 */
function nieuwLoon(f: Formulier, schuif?: number) {
  const nu = () => loonWerk(f.nuPer, getal(f.nuLoon) ?? 0, getal(f.nuUren) ?? 0, undefined, f.nuAllIn);
  if (f.werktNu && f.verandering === "meer") {
    return loonWerk(f.nuPer, getal(f.nuLoon) ?? 0, getal(f.nuUren) ?? 0, schuif ?? getal(f.meerUren), f.nuAllIn);
  }
  const ander = loonWerk(f.per, getal(f.loon) ?? 0, getal(f.uren) ?? 0, schuif, f.allIn);
  if (f.werktNu && f.verandering === "erbij") return { ...nu(), bijbaan: ander };
  return ander;
}

/** Het aantal uren waarmee de urenschuif begint, en wat de schuif voorstelt. */
/**
 * Sleutel voor de stand van de urenschuif: de stand blijft bewaard zolang de
 * gegevens van het werk (uren en loon) niet veranderen.
 */
export function schuifSleutel(f: Formulier): string {
  return JSON.stringify([f.werktNu, f.verandering, f.uren, f.meerUren, f.per, f.loon, f.allIn, f.nuUren, f.nuPer, f.nuLoon, f.nuAllIn]);
}

export function schuifStart(f: Formulier): { uren: number; wat: "totaal" | "extra" } {
  if (f.werktNu && f.verandering === "meer") return { uren: Math.round(getal(f.meerUren) ?? 24), wat: "totaal" };
  if (f.werktNu && f.verandering === "erbij") return { uren: Math.round(getal(f.uren) ?? 8), wat: "extra" };
  return { uren: Math.round(getal(f.uren) ?? 24), wat: "totaal" };
}

/**
 * Zet het ingevulde loon om naar werk voor de engine. Bij een maand- of
 * weekloon schaalt het loon mee als de gebruiker met de urenschuif
 * een ander aantal uren kiest.
 */
function loonWerk(per: LoonPerKeuze, bedrag: number, uren: number, andereUren?: number, allIn: AllIn = "nee") {
  const nieuweUren = andereUren ?? uren;
  if (per === "uur") {
    return {
      brutoUurloon: bedrag,
      urenPerWeek: nieuweUren,
      ...(allIn === "ja" ? { vakantiegeld: 0 } : allIn === "onbekend" ? { vakantiegeldOnzeker: true } : {}),
    };
  }
  const urenFactor = uren > 0 ? nieuweUren / uren : 1;
  if (per === "week") return { brutoWeekloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
  if (per === "nettoweek") return { nettoWeekloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
  if (per === "netto") return { nettoMaandloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
  return { brutoMaandloon: bedrag, urenPerWeek: nieuweUren, urenFactor };
}

/** Laat alleen tekens door die in een getal horen; letters en andere tekens verdwijnen meteen. */
export function alleenCijfers(tekst: string, soort: "geheel" | "getal"): string {
  return soort === "geheel" ? tekst.replace(/[^0-9]/g, "") : tekst.replace(/[^0-9.,]/g, "");
}

/** Een geboortedatum als tekst, bijvoorbeeld "14-3-1990". */
const datumTekst = (g: Geboortedatum) => g.trim();
export const euroTekst = (t: string) => `€ ${t}`;

export const LOON_PER: Record<LoonPer, string> = { maand: "bruto per maand", netto: "netto per maand", week: "bruto per week", nettoweek: "netto per week", uur: "bruto per uur" };
export const OPVANG: Record<Opvangsoort, string> = { dagopvang: "kinderdagverblijf", bso: "buitenschoolse opvang", gastouder: "gastouder" };

/**
 * Wat de gebruiker heeft ingevuld, als korte regels per onderdeel. Voor de afdruk,
 * zodat invoer en uitkomst op één pagina staan. Toont wat er is ingevuld,
 * niet de stand van de urenschuif; die staat in de uitkomst zelf.
 */
export function ingevuld(f: Formulier): { kop: string; regels: [string, string][] }[] {
  const paar = f.leefvorm === "paar";
  const huishouden: [string, string][] = [
    ["Huishouden", f.leefvorm === "alleenstaande" ? "zonder partner en zonder kinderen" : f.leefvorm === "alleenstaande_ouder" ? "zonder partner, met kinderen" : f.kinderen.length > 0 ? "met partner en kinderen" : "met partner"],
    ["Geboren", datumTekst(f.geboren)],
  ];
  if (paar) {
    huishouden.push(["Partner geboren", datumTekst(f.partnerGeboren)]);
    huishouden.push(["Partner werkt", f.partnerWerkt ? `ja, ${euroTekst(f.partnerBruto)} bruto per maand; ${f.partnerWerktAl === "lang" ? "6 maanden of langer" : "korter dan 6 maanden"}` : "nee"]);
  }
  f.kinderen.forEach((k, i) => {
    const opvang = k.opvang ? `; ${k.soort ? OPVANG[k.soort] : "soort onbekend"}, ${k.uren} uur per week${k.uurprijs ? ` × ${euroTekst(k.uurprijs)}` : ", prijs onbekend"}` : "";
    huishouden.push([`Kind ${i + 1}`, `geboren ${datumTekst(k.geboren)}${opvang}`]);
  });
  if (!f.heeftAnderInkomen) huishouden.push(["Ander inkomen", "nee"]);
  else {
    if (getal(f.partneralimentatie)) huishouden.push(["Partneralimentatie", `${euroTekst(f.partneralimentatie)} per maand`]);
    if (f.kinderen.length > 0 && getal(f.kinderalimentatie)) huishouden.push(["Kinderalimentatie", `${euroTekst(f.kinderalimentatie)} per maand`]);
    if (getal(f.anderInkomen)) huishouden.push(["Ander inkomen", `${euroTekst(f.anderInkomen)} netto per maand`]);
  }

  const woning: [string, string][] = [];
  if (f.woont === "kostgeld") {
    woning.push(["Woning", "bij iemand anders in huis, betaalt kostgeld of huur"]);
    woning.push(["Voor de woonruimte", `${euroTekst(f.kaleHuur)} per maand`]);
  } else if (f.woont === "huur") {
    woning.push(["Woning", f.zelfstandig ? "huurwoning met eigen voordeur, keuken, wc en douche" : "kamer, of woning met gedeelde keuken, wc of douche"]);
    woning.push([f.zelfstandig ? "Kale huur" : "Huur", `${euroTekst(f.kaleHuur)} per maand`]);
    if (vraagInkomenAnderen(f)) woning.push(["Inkomen huisgenoten", f.huisgenotenOnbekend ? "onbekend" : `${euroTekst(f.huisgenotenInkomen)} bruto per jaar`]);
    f.kinderen.forEach((k, i) => {
      if (vraagInkomenKind(f, k)) woning.push([`Inkomen kind ${i + 1}`, k.inkomenOnbekend ? "onbekend" : `${euroTekst(k.inkomen)} bruto per jaar`]);
    });
  } else {
    woning.push([
      "Woning",
      f.woont === "koop"
        ? "koopwoning"
        : f.woont === "inwonend"
          ? `bij iemand in huis, betaalt niets voor de woonruimte; ${f.woonlasten ? "betaalt wel" : "betaalt geen"} gas, licht of water`
          : f.woont === "dakloos"
            ? "geen vaste woonplek"
            : "instelling met zorg of begeleiding",
    ]);
  }
  if (vraagBewoners(f)) {
    woning.push([
      "Andere bewoners",
      !metAnderen(f) || aantalKostendelers(f) + aantalJongeHuisgenoten(f) === 0
        ? "nee"
        : `${aantalKostendelers(f)} van 27 jaar of ouder${vraagJongeHuisgenoten(f) ? `, ${aantalJongeHuisgenoten(f)} van 18 tot en met 26 jaar` : ""}`,
    ]);
  }

  const loon = (per: LoonPerKeuze, bedrag: string, allIn: AllIn) =>
    `${euroTekst(bedrag)} ${LOON_PER[per || "maand"]}${per === "uur" && allIn !== "nee" ? (allIn === "ja" ? ", all-in" : ", all-in onbekend") : ""}`;
  const werk: [string, string][] = [];
  if (f.werktNu) {
    werk.push(["Werkt nu", `${f.nuUren} uur per week, ${loon(f.nuPer, f.nuLoon, f.nuAllIn)}; ${f.werktAl === "lang" ? "6 maanden of langer" : "korter dan 6 maanden"}`]);
    if (heeftOpvang(f)) werk.push(["Opvang nu al", f.opvangNu === "ja" ? "ja" : "nee"]);
  } else werk.push(["Werkt nu", "nee"]);
  if (f.werktNu && f.verandering === "meer") werk.push(["Straks", `${f.meerUren} uur per week bij het huidige werk`]);
  else if (f.werktNu && f.verandering === "erbij") werk.push(["Werk erbij", `${f.uren} uur per week; ${loon(f.per, f.loon, f.allIn)}`]);
  else werk.push([f.werktNu ? "Ander werk" : "Nieuw werk", `${f.uren} uur per week; ${loon(f.per, f.loon, f.allIn)}`]);
  if (f.medisch) werk.push(["Medische urenbeperking", "ja"]);
  const kosten = [
    f.reiskosten && `reiskosten ${euroTekst(f.reiskosten)}`,
    f.vergoeding && `reiskostenvergoeding ${euroTekst(f.vergoeding)}`,
    f.overigeKosten && `andere kosten ${euroTekst(f.overigeKosten)}`,
  ].filter(Boolean);
  werk.push(["Kosten per maand", kosten.length > 0 ? kosten.join(", ") : "geen ingevuld"]);

  return [
    { kop: "Huishouden", regels: huishouden },
    { kop: "Woning", regels: woning },
    { kop: "Werk", regels: werk },
  ];
}
