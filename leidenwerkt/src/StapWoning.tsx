/** Stap 2 van Leidenwerkt: uw woning. Huur of koop, de woonlasten en wie er bij u woont. */
import { CITATEN, Lezer, euro, standaardRegels } from "@rekenhulp/rekenkern";
import { Bron, Keuze, Veld } from "@rekenhulp/ui";
import { leeftijdOp, vandaag, vraagBewoners, vraagInkomenAnderen, vraagInkomenKind, bijIemandAnders, vraagWoonlasten, vraagJongeHuisgenoten } from "./formulier.ts";
import { antwoordHulp, type StapProps } from "./stap.ts";

/** Bijstand bij verblijf in een instelling (art. 23 Pw) voor vandaag, als tekst. */
const instellingsnorm = () => {
  const l = new Lezer(standaardRegels, vandaag());
  try {
    const a = l.bedrag("pw.norm.inrichting.alleenstaande").plus(l.bedrag("pw.norm.inrichting.verhoging_alleenstaande"));
    const g = l.bedrag("pw.norm.inrichting.gehuwden").plus(l.bedrag("pw.norm.inrichting.verhoging_gehuwden"));
    return `${euro(a)} per maand als u geen partner heeft, ${euro(g)} voor u en uw partner samen`;
  } catch {
    return "";
  }
};

/** Gewone bijstandsnorm voor een alleenstaande voor vandaag, als tekst. */
const gewoneNorm = () => {
  try {
    return euro(new Lezer(standaardRegels, vandaag()).bedrag("pw.norm.alleenstaande"), true);
  } catch {
    return "";
  }
};

/** Woonkosten waaronder Leiden de bijstand verlaagt (10% van de gehuwdennorm), als tekst. */
const lageHuurGrens = () => {
  try {
    const l = new Lezer(standaardRegels, vandaag());
    return euro(l.bedrag("pw.norm.gehuwden").times(l.breuk("leiden.woonkosten.korting_geen_woonkosten")));
  } catch {
    return "";
  }
};

export function StapWoning({ f, zet, fouten }: StapProps) {
  const metAntwoord = antwoordHulp(f, zet);
  return (
    <section>
      <Keuze
        naam="woont"
        legend="Waar woont u?"
        hint={
          <>
            <p>
              Huurt u, dan maakt het uit of u de keuken, wc of douche deelt met mensen die niet bij uw huishouden horen. Huurtoeslag is er
              meestal alleen voor een woning met een eigen voordeur, keuken, wc en douche. Een flat of appartement telt ook, als u die
              niet met anderen deelt.
            </p>
            <p>Woont u bij uw ouders, familie of vrienden? Kies dan een van de twee antwoorden die met "Bij iemand anders in huis" beginnen.</p>
            <p>
              Slaapt u in een daklozenopvang zonder begeleiding, of nu eens hier en dan weer daar? Kies dan "Ik heb geen vaste woonplek". Dat
              geldt ook als u geen adres heeft.
            </p>
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.htZelfstandig} />
            </p>
          </>
        }
        waarde={f.woont === "huur" && !f.zelfstandig ? "kamer" : f.woont}
        fout={fouten.woont}
        onChange={(v) => {
          // Huur, kamerhuur en kostgeld zijn verschillende bedragen; bij een andere keuze begint het veld leeg.
          if (v !== (f.woont === "huur" && !f.zelfstandig ? "kamer" : f.woont)) zet("kaleHuur", "");
          zet("woont", v === "kamer" ? "huur" : v);
          if (v === "huur" || v === "kamer") zet("zelfstandig", v === "huur");
        }}
        opties={[
          ["huur", "In een huurwoning met een eigen voordeur, keuken, wc en douche"],
          ["kamer", "Op een kamer, of in een woning waar ik de keuken, wc of douche deel"],
          ["koop", "In een koopwoning"],
          ["kostgeld", `Bij iemand anders in huis${f.leefvorm === "paar" ? " (niet bij uw partner)" : ""}, en ik betaal kostgeld of huur`],
          ["inwonend", `Bij iemand anders in huis${f.leefvorm === "paar" ? " (niet bij uw partner)" : ""}, en ik betaal niets voor mijn woonruimte`],
          ["dakloos", "Ik heb geen vaste woonplek"],
          ["instelling", "In een instelling of woonvorm waar ik zorg of begeleiding krijg"],
        ]}
      />
      {f.woont === "instelling" && (
        <div className="melding" role="status">
          <p>
            Dit antwoord past als u in een instelling voor verpleging of verzorging woont, of in een woonvorm waar u slaapt en waar meer dan
            de helft van de dag hulp of begeleiding aanwezig is. U krijgt dan een lagere bijstand{instellingsnorm() ? `: ${instellingsnorm()}` : ""}.
            Zo kunt u het nagaan: dat bedrag staat op uw uitkeringsspecificatie.
          </p>
          <p>
            Krijgt u veel meer bijstand{gewoneNorm() ? `, bijvoorbeeld ${gewoneNorm()} als u geen partner heeft` : ""}? Dan rekent de gemeente u
            niet als bewoner van een instelling. Kies dan "Op een kamer" als u huur betaalt, of een van de antwoorden die met "Bij iemand anders
            in huis" beginnen. Twijfelt u? Vraag het uw begeleider of uw contactpersoon bij de gemeente.
          </p>
          <p className="bron-blok">
            Bron: <Bron citaat={CITATEN.pw23inrichting} />
          </p>
        </div>
      )}
      {(f.woont === "huur" || f.woont === "kostgeld") && (
        <>
          <Veld
            id="kaleHuur"
            voorbeeld={f.woont === "kostgeld" ? "bijv. 150" : f.zelfstandig ? "bijv. 650" : "bijv. 450"}
            label={f.woont === "kostgeld" ? "Hoeveel betaalt u per maand voor uw woonruimte?" : f.zelfstandig ? "Kale huur per maand" : "Huur per maand"}
            hint={
              f.woont === "kostgeld"
                ? `Betaalt u kostgeld, ook voor eten of de was? Vul dan alleen het deel in dat voor uw kamer of woonruimte is. Weet u dat niet? Vul dan het hele bedrag in en vraag het uw contactpersoon bij de gemeente.${lageHuurGrens() ? ` Betaalt u minder dan ${lageHuurGrens()} per maand voor uw woonruimte? Dan krijgt u minder bijstand: het verschil tussen ${lageHuurGrens()} en wat u betaalt. Dit geldt niet als er iemand van 27 jaar of ouder bij u woont.` : ""}`
                : f.zelfstandig
                  ? "Het huurbedrag uit uw huurcontract, zonder servicekosten en zonder gas, water en licht."
                  : `De huur zonder gas, water en licht, als u dat bedrag weet. Anders het hele bedrag.${lageHuurGrens() ? ` Is uw huur lager dan ${lageHuurGrens()} per maand? Dan krijgt u minder bijstand: het verschil tussen ${lageHuurGrens()} en uw huur. Dit geldt niet als er iemand van 27 jaar of ouder bij u woont.` : ""}`
            }
            waarde={f.kaleHuur}
            onChange={(v) => zet("kaleHuur", v)}
            fout={fouten.kaleHuur}
            voorvoegsel="€"
          />
        </>
      )}
      {vraagBewoners(f) && !bijIemandAnders(f) && (
        <Keuze
          naam="andereBewoners"
          legend={
            f.leefvorm === "paar" || f.kinderen.length > 0
              ? `Wonen er nog andere mensen van 18 jaar of ouder bij u in huis, naast uw ${f.leefvorm === "paar" ? (f.kinderen.length > 0 ? "partner en kinderen" : "partner") : "kinderen"}?`
              : "Wonen er nog andere mensen van 18 jaar of ouder bij u in huis?"
          }
          hint="Bijvoorbeeld uw ouders, een broer of zus, een vriend, een huisgenoot, iemand die een kamer van u huurt, of een eigen kind van 27 jaar of ouder. Wonen er meer volwassenen in huis? Dan kan uw bijstand lager zijn, omdat u de kosten kunt delen."
          waarde={f.beantwoord.andereBewoners ? f.andereBewoners ? "ja" : "nee" : ""}
          onChange={metAntwoord("andereBewoners", (v) => zet("andereBewoners", v === "ja"))}
        fout={fouten.andereBewoners}
          opties={[
            ["nee", "Nee"],
            ["ja", "Ja"],
          ]}
        />
      )}
      {vraagBewoners(f) && (f.andereBewoners || bijIemandAnders(f)) && (
        <>
          <Veld
            id="kostendelers"
            soort="geheel"
            voorbeeld="bijv. 1"
            label={
              bijIemandAnders(f)
                ? `Hoeveel mensen van 27 jaar of ouder wonen er in dat huis, naast u? Tel de persoon bij wie u woont mee.${f.leefvorm === "paar" || f.kinderen.length > 0 ? ` Uw ${f.leefvorm === "paar" ? (f.kinderen.length > 0 ? "partner en kinderen" : "partner") : "kinderen"} telt u niet mee.` : ""}`
                : "Hoeveel van hen zijn 27 jaar of ouder?"
            }
            hint={
              <>
                <p>
                  Niet iedereen telt mee. De meeste studenten tellen niet mee. Ook niet: iemand die met een contract en tegen een gewone prijs een
                  kamer van u huurt of bij u in de kost is, en die geen familie van u is. Huurt u zelf een kamer? Dan tellen andere kamerhuurders met
                  een eigen contract en een gewone huurprijs ook niet mee. Twijfelt u? Vraag het uw contactpersoon bij de gemeente.
                </p>
                <p className="bron-blok">
                  Bron: <Bron citaat={CITATEN.kostendelerUitzonderingen} />
                </p>
              </>
            }
            waarde={f.kostendelers}
            onChange={(v) => zet("kostendelers", v)}
            fout={fouten.kostendelers}
          />
          {vraagJongeHuisgenoten(f) && (
            <Veld
              id="jongeHuisgenoten"
              soort="geheel"
              voorbeeld="bijv. 0"
              label="Hoeveel van hen zijn 18 tot en met 26 jaar?"
              hint="Zij tellen niet mee voor de bijstand, wel voor de huurtoeslag."
              waarde={f.jongeHuisgenoten}
              onChange={(v) => zet("jongeHuisgenoten", v)}
              fout={fouten.jongeHuisgenoten}
            />
          )}
        </>
      )}
      {vraagWoonlasten(f) && (
        <Keuze
          naam="woonlasten"
          legend="Betaalt u zelf voor gas, licht of water?"
          hint="Betaalt degene bij wie u woont de rekening voor gas, licht en water? Kies dan Nee. Betaalt u er zelf voor, ook als u daarvoor geld aan iemand in huis geeft? Kies dan Ja. Zonder eigen kosten voor gas, licht en water verlaagt de gemeente de bijstand iets meer."
          waarde={f.beantwoord.woonlasten ? f.woonlasten ? "ja" : "nee" : ""}
          onChange={metAntwoord("woonlasten", (v) => zet("woonlasten", v === "ja"))}
        fout={fouten.woonlasten}
          opties={[
            ["nee", "Nee"],
            ["ja", "Ja"],
          ]}
        />
      )}
      {vraagInkomenAnderen(f) && !f.huisgenotenOnbekend && (
        <Veld
          id="huisgenotenInkomen"
          label="Voor de huurtoeslag: bruto inkomen per jaar van uw huisgenoten, samen"
          hint={
            <>
              <p>
                Dit telt mee voor de huurtoeslag. Het inkomen van uw partner en uw kinderen telt u hier niet mee. Weet u het niet precies? Vul
                dan een schatting in. Heeft niemand inkomen? Vul dan 0 in. Weet u het helemaal niet? Vink dan hieronder "Ik weet dit inkomen niet"
                aan. De rekenhulp rekent dan zonder hun inkomen.
              </p>
              <p className="bron-blok">
                Bron: <Bron citaat={CITATEN.htMedebewoners} />
              </p>
            </>
          }
          waarde={f.huisgenotenInkomen}
          onChange={(v) => zet("huisgenotenInkomen", v)}
          fout={fouten.huisgenotenInkomen}
          voorvoegsel="€"
          voorbeeld="bijv. 25.000"
        />
      )}
      {vraagInkomenAnderen(f) && f.huisgenotenOnbekend && (
        <p className="vraag-tekst">Voor de huurtoeslag: bruto inkomen per jaar van uw huisgenoten, samen</p>
      )}
      {vraagInkomenAnderen(f) && (
        <label className="vinkje">
          <input type="checkbox" checked={f.huisgenotenOnbekend} onChange={(e) => zet("huisgenotenOnbekend", e.target.checked)} />
          <span>Ik weet dit inkomen niet</span>
        </label>
      )}
      {f.kinderen.map((k, i) =>
        vraagInkomenKind(f, k) ? (
          <div key={i}>
            {/* Ook met het vinkje aan blijft de vraag zichtbaar, zodat het vinkje niet los onder een andere vraag staat. */}
            {k.inkomenOnbekend && (
              <p className="vraag-tekst">
                Voor de huurtoeslag: bruto inkomen per jaar van {f.kinderen.filter((x) => vraagInkomenKind(f, x)).length > 1 ? `kind ${i + 1}` : "uw kind"} van{" "}
                {leeftijdOp(k.geboren, vandaag())} jaar
              </p>
            )}
            {!k.inkomenOnbekend && (
              <Veld
                id={`kind${i}inkomen`}
                label={`Voor de huurtoeslag: bruto inkomen per jaar van ${f.kinderen.filter((x) => vraagInkomenKind(f, x)).length > 1 ? `kind ${i + 1}` : "uw kind"} van ${leeftijdOp(k.geboren, vandaag())} jaar`}
                hint={
                  <>
                    <p>
                      Het bruto inkomen, zoals op de jaaropgave of de loonstrook van uw kind. Vul het hele bedrag in. De rekenhulp trekt zelf af
                      wat niet meetelt. Studiefinanciering telt niet mee. Heeft uw kind geen inkomen? Vul dan 0 in.
                    </p>
                    <p className="bron-blok">
                      Bron: <Bron citaat={CITATEN.htInkomenKind} />
                    </p>
                  </>
                }
                waarde={k.inkomen}
                onChange={(v) => zet("kinderen", f.kinderen.map((x, j) => (j === i ? { ...x, inkomen: v } : x)))}
                fout={fouten[`kind${i}inkomen`]}
                voorvoegsel="€"
                voorbeeld="bijv. 4.000"
              />
            )}
            <label className="vinkje">
              <input
                type="checkbox"
                checked={k.inkomenOnbekend}
                onChange={(e) => zet("kinderen", f.kinderen.map((x, j) => (j === i ? { ...x, inkomenOnbekend: e.target.checked } : x)))}
              />
              <span>Ik weet dit inkomen niet</span>
            </label>
          </div>
        ) : null,
      )}
    </section>
  );
}
