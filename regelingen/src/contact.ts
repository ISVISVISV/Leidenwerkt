/**
 * Spreekuren en telefoonnummers voor de afdruk. Elke regel komt uit een officiële bron (CITATEN in de rekenkern):
 * goedeBuurTijden, stadsbank, toeslagenBellen en steunpuntBelastingdienst. Controleer ze als de bron verandert.
 */
export const GOEDE_BUUR = {
  naam: "Goede Buur Spreekuur",
  uitleg: "Wilt u hulp bij een aanvraag of bij uw geldzaken? Ga dan naar het Goede Buur Spreekuur. U hoeft geen afspraak te maken. De hulp is gratis.",
  tijden: ["Maandag van 9.00 tot 11.00 uur", "Dinsdag van 9.00 tot 11.00 uur", "Donderdag van 13.00 tot 15.00 uur", "In de Stadskamer: dinsdag van 9.30 tot 11.30 uur"],
  waar: "Het spreekuur is op deze plekken:",
  plekken: [
    ["Huis van de Buurt De Kooi", "Driftstraat 29"],
    ["Huis van de Buurt Het Gebouw", "Arubapad 2"],
    ["Huis van de Buurt Matilo", "Zaanstraat 126"],
    ["Huis van de Buurt Morschwijck", "Topaaslaan 19"],
    ["Speeltuinvereniging Ons Eiland", "Kortenaerstraat 61"],
    ["De Stadskamer", "Nieuwstraat 7"],
    ["Huis van de Buurt Op Eigen Wieken", "Valkenpad 5"],
    ["Huis van de Buurt Stevenshof", "Trix Terwindtstraat 4"],
    ["Huis van de Buurt Bos- en Gasthuis", "Boshuizerkade 119"],
  ] as [string, string][],
  bellen: "Tijdens de spreekuren kunt u de vrijwilligers bellen of appen: 06 – 21 42 76 37.",
};

export const CONTACT: { naam: string; regels: string[] }[] = [
  { naam: "Gemeente Leiden", regels: ["Bel 14 071. U kunt bellen van maandag tot en met vrijdag, van 9.00 tot 17.00 uur."] },
  { naam: "Stadsbank Leiden", regels: ["Heeft u schulden? Of maakt u zich zorgen over geld? Bel 14 071 en kies 1."] },
  {
    naam: "Dienst Toeslagen",
    regels: [
      "Bel 0800 - 0543. Dit nummer is gratis.",
      "U kunt bellen van maandag tot en met donderdag, van 8.00 tot 20.00 uur. Op vrijdag kan het van 8.00 tot 17.00 uur.",
      "U kunt ook langskomen. Het steunpunt van de Belastingdienst is in het Stadskantoor, Bargelaan 190. Het is open op vrijdag, van 9.00 tot 16.00 uur.",
      "Maak eerst een afspraak: www.belastingdienst.nl/langskomen.",
    ],
  },
];
