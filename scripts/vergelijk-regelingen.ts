/**
 * Vergelijkt de uitkomst van checkRegelingen voor veel willekeurige invoer met een eerder vastgelegde uitkomst.
 * Bedoeld voor het ombouwen van de rekenkern zonder dat de uitkomst verandert.
 *   npx tsx scripts/vergelijk-regelingen.ts vastleggen <bestand>
 *   npx tsx scripts/vergelijk-regelingen.ts vergelijken <bestand>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { checkRegelingen, type CheckInvoer, type CheckPersoon } from "../packages/rekenkern/src/index.ts";

let zaad = 20261123;
const kans = () => ((zaad = (zaad * 1103515245 + 12345) % 2147483648) / 2147483648);
const tussen = (a: number, b: number) => a + Math.floor(kans() * (b - a + 1));
const kies = <T,>(xs: readonly T[]): T => xs[Math.floor(kans() * xs.length)];
const SOORTEN = ["loon", "uwv", "aow", "pensioen", "bedrijf", "studiefinanciering", "partneralimentatie", "kinderalimentatie", "ander"] as const;

function persoon(): CheckPersoon {
  const leeftijd = kies([18, 19, 20, 22, 25, 30, 40, 55, 66, 67, 70, 82]);
  const aow = leeftijd >= 67;
  const inkomen: CheckPersoon["inkomen"] = {};
  const n = tussen(0, 2);
  for (let i = 0; i < n; i++) inkomen[kies(SOORTEN)] = tussen(0, 30) * 100;
  return { leeftijd, aow, geborenVoor1946: leeftijd >= 81, geborenNa1971: leeftijd < 55, inkomen, uitkering: kies([undefined, "ww", "wajong", "wia"] as const) };
}

function invoer(): CheckInvoer {
  const paar = kans() < 0.4;
  const kinderen = Array.from({ length: tussen(0, 3) }, () => {
    const leeftijd = tussen(0, 30);
    return { leeftijd, leeftijdBeginJaar: leeftijd, inkomenJaar: leeftijd >= 18 && kans() < 0.8 ? tussen(0, 30) * 1000 : undefined, opvang: leeftijd < 13 && kans() < 0.3 ? { soort: "dagopvang", urenPerMaand: 80, uurprijs: 10, uurprijsGeschat: kans() < 0.5 } : undefined } as CheckInvoer["kinderen"][number];
  });
  const andereBewoners = kans() < 0.2;
  return {
    datum: kies(["2026-09-01", "2026-11-23"]),
    aanvrager: persoon(),
    partner: paar ? persoon() : undefined,
    kinderen,
    kinderbijslag: kinderen.some((k) => k.leeftijd < 18) ? kans() < 0.8 : undefined,
    bijstand: kans() < 0.25,
    langLaagInkomen: kies(["ja", "nee", "onbekend", undefined] as const),
    studieMedisch: kies(["ja", "nee", undefined] as const),
    wonen: kies(["huur", "huur", "kamer", "koop", "kostgeld", "inwonend", "dakloos", "instelling"] as const),
    kaleHuurPerMaand: kans() < 0.9 ? tussen(3, 12) * 75 : undefined,
    andereBewoners,
    andereBewonersAantal: andereBewoners ? tussen(1, 2) : undefined,
    andereBewonersInkomenJaar: andereBewoners && kans() < 0.7 ? tussen(0, 40) * 1000 : undefined,
    kostendelers: andereBewoners ? tussen(0, 2) : 0,
    vermogen: { betaalrekening: tussen(0, 50) * 100, spaarrekening: tussen(0, 300) * 100, voertuigen: kans() < 0.3 ? [tussen(1, 20) * 500] : [], beleggingen: 0, spullen: 0, schulden: kans() < 0.2 ? tussen(1, 50) * 1000 : 0 },
  };
}

const uitkomsten = Array.from({ length: 4000 }, () => {
  const i = invoer();
  return { invoer: i, uitslagen: checkRegelingen(i) };
});
const [actie, bestand] = process.argv.slice(2);
const tekst = JSON.stringify(uitkomsten);
if (actie === "vastleggen") {
  writeFileSync(bestand, tekst);
  console.log(`Vastgelegd: ${uitkomsten.length} invoer.`);
} else {
  const oud = JSON.parse(readFileSync(bestand, "utf8"));
  let verschil = 0;
  oud.forEach((o: { uitslagen: unknown }, i: number) => {
    if (JSON.stringify(o.uitslagen) !== JSON.stringify(uitkomsten[i].uitslagen)) {
      if (verschil < 3) console.log(`Verschil bij invoer ${i}:\n${JSON.stringify(o.uitslagen)}\n${JSON.stringify(uitkomsten[i].uitslagen)}`);
      verschil++;
    }
  });
  console.log(verschil === 0 ? `Gelijk: ${uitkomsten.length} invoer.` : `${verschil} verschillen.`);
  process.exit(verschil === 0 ? 0 : 1);
}
