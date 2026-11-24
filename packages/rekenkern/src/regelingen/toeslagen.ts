/** Landelijke toeslagen van Dienst Toeslagen, met de rekenkern van Leidenwerkt. De kinderbijslag staat bij de SVB. */
import { CITATEN } from "../citaten.ts";
import { D, NUL, max, type Bedrag } from "../geld.ts";
import { huurtoeslag as huurtoeslagBerekenen, kindgebondenBudget, kinderopvangtoeslag, maandbedragToeslag, zorgtoeslag as zorgtoeslagBerekenen } from "../modules/toeslagen.ts";
import type { Kind } from "../types.ts";
import type { CheckPersoon } from "./types.ts";
import { URL, bron, heeft, heel, probeer, telbaarVermogen, toetsingsinkomen, vermogenToets, type MogelijkeUitslag } from "./basis.ts";
import type { Context } from "./context.ts";

/** Wat alle toeslagen nodig hebben: het bruto inkomen per jaar, of de reden dat Leidengeldwijzer het niet weet. */
interface ToeslagContext {
  /** Het toetsingsinkomen. Leeg als Leidengeldwijzer het niet uitrekent. */
  ti?: Bedrag;
  geenBedrag: string;
  proef: { tekst: string; url: string };
}

export function maakToeslagContext(c: Context): ToeslagContext {
  const { l, invoer, paar } = c;
  // Boven deze grens telt inkomen uit vermogen mee in het toetsingsinkomen. Dat rekent Leidengeldwijzer niet uit.
  const vermogenTeHoog = probeer(() =>
    telbaarVermogen(l, invoer.vermogen, "toeslagen").gt(l.bedrag(paar ? "toeslagen.vermogen.inkomen.met_partner" : "toeslagen.vermogen.inkomen.zonder_partner")),
  );
  const ti = vermogenTeHoog === false ? probeer(() => toetsingsinkomen(l, invoer, c.personen)) : undefined;
  const geenBedrag = vermogenTeHoog
    ? "Een deel van uw geld en bezit telt mee als inkomen. Leidengeldwijzer rekent dat niet uit. Doe de proefberekening van Dienst Toeslagen."
    : c.metAow
      ? "Met de AOW-leeftijd rekent Leidengeldwijzer alleen met AOW en pensioen. Met ander inkomen erbij kan Leidengeldwijzer uw toeslag niet uitrekenen. Doe de proefberekening van Dienst Toeslagen."
      : "Leidengeldwijzer kan uw toeslag niet uitrekenen met dit soort inkomen. Doe de proefberekening van Dienst Toeslagen.";
  return { ti, geenBedrag, proef: { tekst: "Proefberekening van Dienst Toeslagen", url: URL.toeslagen } };
}

export function zorgtoeslag(c: Context, z: ToeslagContext): MogelijkeUitslag {
  const { l, invoer, paar } = c;
  const v = vermogenToets(l, invoer, paar ? "zt.vermogen.met_partner" : "zt.vermogen.zonder_partner");
  const basis = { id: "zorgtoeslag", naam: "Zorgtoeslag", groep: "toeslagen" as const, wat: "Dit is geld voor de kosten van uw zorgverzekering.", aanvragen: z.proef, bronnen: bron(l, "zt.vermogen.zonder_partner") };
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit op 1 januari waren meer dan ${heel(v.grens)}.` };
  if (!z.ti) return { ...basis, kans: "misschien", waarom: z.geenBedrag };
  const bedrag = maandbedragToeslag(zorgtoeslagBerekenen(l, z.ti, paar).div(12));
  if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen zorgtoeslag." };
  return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Leidengeldwijzer heeft de toeslag uitgerekend met uw inkomen. ${v.zin}` };
}

export function kgb(c: Context, z: ToeslagContext): MogelijkeUitslag {
  const { l, invoer, paar } = c;
  if (!invoer.kinderen.some((k) => k.leeftijd < 18)) return undefined;
  const v = vermogenToets(l, invoer, paar ? "kgb.vermogen.met_partner" : "kgb.vermogen.zonder_partner");
  const basis = { id: "kgb", naam: "Kindgebonden budget", groep: "toeslagen" as const, wat: "Dit is extra geld voor ouders met kinderen jonger dan 18 jaar.", aanvragen: z.proef, bronnen: bron(l, "kgb.vermogen.zonder_partner") };
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit waren meer dan ${heel(v.grens)}.` };
  if (!z.ti) return { ...basis, kans: "misschien", waarom: z.geenBedrag };
  const kinderen: Kind[] = invoer.kinderen.map((k) => ({ leeftijd: k.leeftijd }));
  const bedrag = maandbedragToeslag(kindgebondenBudget(l, z.ti, kinderen, paar).div(12));
  if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen kindgebonden budget." };
  return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Leidengeldwijzer heeft de toeslag uitgerekend met uw inkomen. ${v.zin}` };
}

export function huurtoeslag(c: Context, z: ToeslagContext): MogelijkeUitslag {
  const { l, invoer, paar, personen } = c;
  const basis = { id: "huurtoeslag", naam: "Huurtoeslag", groep: "toeslagen" as const, wat: "Dit is geld voor uw huur.", aanvragen: z.proef, bronnen: [CITATEN.htZelfstandig, ...bron(l, "ht.vermogen.zonder_partner")] };
  if (invoer.wonen !== "huur" && invoer.wonen !== "kamer") return undefined;
  if (invoer.wonen === "kamer") return { ...basis, kans: "nee", waarom: "U woont op een kamer. Huurtoeslag is er meestal alleen voor een woning met een eigen voordeur, keuken, wc en douche." };
  const v = vermogenToets(l, invoer, paar ? "ht.vermogen.met_partner" : "ht.vermogen.zonder_partner");
  if (v.kans === "nee") return { ...basis, kans: "nee", waarom: `Uw geld en bezit op 1 januari waren meer dan ${heel(v.grens)}.` };
  // Andere volwassenen in huis (huisgenoten en kinderen van 18 of ouder): hun inkomen telt mee (art. 7 Wet op de huurtoeslag).
  // Een kind dat op 1 januari jonger is dan 23, heeft een vrijstelling. Weet iemand een inkomen niet? Dan geen bedrag.
  const volwassenKinderen = invoer.kinderen.filter((k) => k.leeftijd >= 18);
  const anderen = invoer.andereBewoners || volwassenKinderen.length > 0;
  const onbekend =
    (invoer.andereBewoners && (invoer.andereBewonersInkomenJaar === undefined || !invoer.andereBewonersAantal)) || volwassenKinderen.some((k) => k.inkomenJaar === undefined);
  if (onbekend)
    return {
      ...basis,
      kans: "misschien",
      waarom: "Er wonen nog andere volwassenen bij u. Hun inkomen en hun geld en bezit tellen mee. Leidengeldwijzer rekent dat niet uit. Doe de proefberekening van Dienst Toeslagen.",
    };
  const inkomenAnderen = anderen
    ? volwassenKinderen.reduce((s, k) => {
        const jong = (k.leeftijdBeginJaar ?? k.leeftijd) < 23;
        const ink = D(k.inkomenJaar!);
        return s.plus(jong ? max(NUL, ink.minus(l.bedrag("ht.vrijstelling_kind_onder_23"))) : ink);
      }, D(invoer.andereBewoners ? invoer.andereBewonersInkomenJaar! : 0))
    : NUL;
  if (anderen) basis.bronnen.push(CITATEN.htMedebewoners, ...(volwassenKinderen.length > 0 ? [CITATEN.htInkomenKind, ...bron(l, "ht.vrijstelling_kind_onder_23")] : []));
  const anderenZin = anderen ? " Het inkomen van de andere volwassenen in huis telt mee. Hun geld en bezit telt ook mee. Dat rekent Leidengeldwijzer niet uit." : "";
  if (personen.every((p) => p.leeftijd < 21))
    return { ...basis, kans: "misschien", waarom: "Leidengeldwijzer rekent de huurtoeslag voor jongeren onder de 21 jaar niet uit. Doe de proefberekening van Dienst Toeslagen." };
  if (!z.ti || invoer.kaleHuurPerMaand === undefined) return { ...basis, kans: "misschien", waarom: z.geenBedrag };
  const personenAantal = personen.length + invoer.kinderen.length + (invoer.andereBewoners ? (invoer.andereBewonersAantal ?? 0) : 0);
  const r = huurtoeslagBerekenen(l, D(invoer.kaleHuurPerMaand), z.ti.plus(inkomenAnderen), personenAantal);
  const bedrag = maandbedragToeslag(r.perMaand);
  if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: `Met deze huur en dit inkomen krijgt u waarschijnlijk geen huurtoeslag.${anderenZin}` };
  return { ...basis, kans: v.kans, bedrag: `ongeveer ${heel(bedrag)} per maand`, waarom: `Leidengeldwijzer heeft de toeslag uitgerekend met uw inkomen. ${v.zin}${anderenZin}` };
}

/**
 * Kinderopvangtoeslag: alleen voor kinderen die naar de opvang gaan. Werken of studeren alle ouders?
 * Dan rekent Leidengeldwijzer de toeslag uit. Anders kan het misschien, bijvoorbeeld met inburgering of een traject naar werk.
 */
export function kot(c: Context, z: ToeslagContext): MogelijkeUitslag {
  const { l, invoer } = c;
  const opvang = invoer.kinderen.filter((k) => k.leeftijd < 13 && k.opvang && k.opvang.urenPerMaand > 0);
  if (opvang.length === 0) return undefined;
  // Werken of studeren: loon, een eigen bedrijf of studiefinanciering. Met een partner moeten het allebei (art. 1.6 lid 3).
  const werkt = (p: CheckPersoon) => heeft(p, "loon") || heeft(p, "bedrijf") || heeft(p, "studiefinanciering");
  const basis = {
    id: "kot",
    naam: "Kinderopvangtoeslag",
    groep: "toeslagen" as const,
    wat: "Dit is geld voor de kosten van de kinderopvang. U betaalt zelf ook een deel.",
    aanvragen: z.proef,
    bronnen: [CITATEN.kotWie],
  };
  const aanvragerWerkt = werkt(invoer.aanvrager);
  const partnerWerkt = !invoer.partner || werkt(invoer.partner);
  if (!aanvragerWerkt || !partnerWerkt) {
    // Wie niet werkt en niet studeert, kan de toeslag soms toch krijgen: met inburgering of een traject naar werk (lid 1 en 3).
    // Met een partner ook als die zorg krijgt uit de Wet langdurige zorg (lid 8). Daar vraagt Leidengeldwijzer niet naar.
    const wie = !invoer.partner ? "u" : !aanvragerWerkt && !partnerWerkt ? "beiden" : !aanvragerWerkt ? "u" : "partner";
    const waarom = {
      u: "U werkt niet en u studeert niet. Dan krijgt u meestal geen kinderopvangtoeslag. Het kan wel als u inburgert of een traject naar werk volgt.",
      partner: "Uw partner werkt niet en studeert niet. Dan krijgt u meestal geen kinderopvangtoeslag. Het kan wel als uw partner inburgert of een traject naar werk volgt.",
      beiden: "U en uw partner werken niet en studeren niet. Dan krijgt u meestal geen kinderopvangtoeslag. Het kan wel als u allebei inburgert of een traject naar werk volgt.",
    }[wie];
    const wlz = invoer.partner && wie !== "beiden" ? ` Of als ${wie === "u" ? "u" : "uw partner"} zorg krijgt uit de Wet langdurige zorg.` : "";
    return { ...basis, kans: "nee", waarom: waarom + wlz, bronnen: invoer.partner ? [CITATEN.kotWie, CITATEN.kotPartner] : basis.bronnen };
  }
  if (!z.ti) return { ...basis, kans: "misschien", waarom: z.geenBedrag };
  const r = kinderopvangtoeslag(l, z.ti, opvang as Kind[]);
  const bedrag = maandbedragToeslag(r.toeslagPerMaand);
  if (bedrag.lte(0)) return { ...basis, kans: "nee", waarom: "Met dit inkomen krijgt u waarschijnlijk geen kinderopvangtoeslag." };
  const geschat = opvang.some((k) => k.opvang!.uurprijsGeschat);
  return {
    ...basis,
    kans: "ja",
    bedrag: `ongeveer ${heel(bedrag)} per maand`,
    waarom: `${invoer.partner ? "U en uw partner werken of studeren." : "U werkt of studeert."} Leidengeldwijzer heeft de toeslag uitgerekend met uw inkomen.${geschat ? " U weet de prijs per uur niet. Leidengeldwijzer rekent daarom met de hoogste prijs voor de toeslag." : ""}`,
  };
}
