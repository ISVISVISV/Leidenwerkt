/**
 * Wat u nodig heeft voor de aanvraag, per regeling. Alleen als de bron het noemt; de bron staat er steeds bij.
 * Kort en in A2: de volledige lijst staat op de pagina waar u het aanvraagt.
 */
import { CITATEN, type Citaat } from "../citaten.ts";
import type { Context } from "./context.ts";
import type { Uitslag } from "./types.ts";

interface Meenemen {
  kop: string;
  lijst: string[];
  bron: Citaat;
}

const partner = "Heeft u een partner? Dan ook de papieren van uw partner.";
const inkomenPerJaar = "Uw inkomen per jaar. Heeft u een toeslagpartner? Dan ook het inkomen van uw partner.";

const MEENEMEN: Record<string, Meenemen> = {
  sleutelpas: {
    kop: "Bij de aanvraag stuurt u bewijzen van uw inkomen mee:",
    lijst: [
      "De laatste 3 specificaties van uw inkomen. Bijvoorbeeld uw loonstroken.",
      "Krijgt u bijstand, AIO, AOW, WIA of Wajong? Dan is de laatste specificatie genoeg.",
      "Heeft u een eigen bedrijf? Dan uw belastingaangifte van vorig jaar.",
    ],
    bron: CITATEN.meenemenSleutelpas,
  },
  laptop: {
    kop: "Zo vraagt u de laptop aan:",
    lijst: ["Neem de Sleutelpas van uw kind mee naar het Goede Buur Spreekuur. Op de pas staat de bon voor een laptop."],
    bron: CITATEN.meenemenLaptop,
  },
  ovpas: {
    kop: "Dit heeft u nodig:",
    lijst: ["De brief met een vouchercode, als u die heeft gekregen.", "Heeft u geen brief? Dan heeft u DigiD nodig."],
    bron: CITATEN.meenemenOv,
  },
  iit: {
    kop: "Online vraagt u het aan met DigiD. Per post stuurt u mee:",
    lijst: [
      "Afschriften van al uw bankrekeningen en spaarrekeningen van de laatste 2 maanden.",
      "Bewijzen van uw sollicitaties.",
      "Uw laatste loonstrook. Of de laatste specificatie van uw uitkering of pensioen.",
      partner,
    ],
    bron: CITATEN.meenemenIit,
  },
  alleenverdieners: {
    kop: "Online vraagt u het aan met DigiD. Per post stuurt u mee:",
    lijst: [
      "Afschriften van al uw bankrekeningen en spaarrekeningen van de laatste 2 maanden.",
      "Uw laatste loonstrook. Of de laatste specificatie van uw uitkering of pensioen.",
      "De papieren van uw partner.",
    ],
    bron: CITATEN.meenemenAlleenverdieners,
  },
  studietoeslag: {
    kop: "Online vraagt u het aan met DigiD. U stuurt een kopie mee van:",
    lijst: [
      "Uw inschrijving bij uw school.",
      "De brief van DUO over uw studiefinanciering.",
      "Uw stagecontract, als u stage loopt.",
      "Uw bankpas.",
      "Een verklaring van een specialist, als u die heeft.",
    ],
    bron: CITATEN.meenemenStudietoeslag,
  },
  smi: {
    kop: "Bij de aanvraag stuurt u mee:",
    lijst: [
      "Bewijzen van uw inkomen van de laatste maand. Verandert uw inkomen vaak? Dan van de laatste 3 maanden.",
      "Heeft u een eigen bedrijf? Dan ook uw jaarstukken en uw belastingaangifte.",
      "Een brief van uw hulpverlener over uw situatie.",
      "Een plan van aanpak.",
      "Heeft u een indicatie voor de Wet langdurige zorg? Dan een kopie daarvan.",
      partner,
    ],
    bron: CITATEN.meenemenSmi,
  },
  kwijtschelding: {
    kop: "U vraagt het aan in MijnBSGR, met DigiD. U geeft door:",
    lijst: [
      "Uw inkomen.",
      "Het geld op uw betaalrekening en uw spaarrekening.",
      "Uw premie voor de zorgverzekering.",
      "Uw huurtoeslag en zorgtoeslag.",
      "Uw leningen en schulden.",
      "Uw huur of hypotheek.",
      "De kosten van uw auto.",
    ],
    bron: CITATEN.meenemenKwijtschelding,
  },
  bijstand: {
    kop: "Dit heeft u altijd nodig:",
    lijst: [
      "Een geldig identiteitsbewijs.",
      "Bewijzen van uw inkomen. Bijvoorbeeld uw loonstrook.",
      "Afschriften van uw bankrekeningen van de laatste 3 maanden.",
      "Uw huurcontract en de gegevens van uw huisgenoten.",
      "DigiD, als u het online aanvraagt.",
    ],
    bron: CITATEN.meenemenBijstand,
  },
  zorgtoeslag: { kop: "U vraagt het aan in Mijn toeslagen. U heeft nodig:", lijst: [inkomenPerJaar], bron: CITATEN.meenemenZorgtoeslag },
  kgb: { kop: "U vraagt het aan in Mijn toeslagen. U heeft nodig:", lijst: [inkomenPerJaar], bron: CITATEN.meenemenKgb },
  huurtoeslag: {
    kop: "U vraagt het aan in Mijn toeslagen. U heeft nodig:",
    lijst: ["Uw huurcontract. U vult de kale huur in.", inkomenPerJaar],
    bron: CITATEN.meenemenHuurtoeslag,
  },
  kot: {
    kop: "U vraagt het aan in Mijn toeslagen. U heeft nodig:",
    lijst: [
      "Het contract met de opvang, of een rekening. Daarop staan de naam en het adres van de opvang, het nummer in het Landelijk Register Kinderopvang, de uren per maand en de prijs per uur.",
      inkomenPerJaar,
    ],
    bron: CITATEN.meenemenKot,
  },
};

/** Voegt toe wat u nodig heeft voor de aanvraag, met de bron. Niet bij "waarschijnlijk niet", en niet als u iets vanzelf krijgt. */
export function metMeenemen(u: Uitslag, c: Context): Uitslag {
  const m = MEENEMEN[u.id];
  if (!m || u.kans === "nee" || u.kans === "info") return u;
  // Met bijstand krijgt u de Sleutelpas vanzelf (art. 3.1).
  if (u.id === "sleutelpas" && c.invoer.bijstand && !c.metAow) return u;
  return { ...u, meenemen: { kop: m.kop, lijst: m.lijst }, bronnen: [...u.bronnen, m.bron] };
}
