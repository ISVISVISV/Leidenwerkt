/** Stap 1 van Leidenwerkt: uw huishouden. U, uw partner, het inkomen naast werk, de kinderen en de opvang. */
import { CITATEN, Lezer, standaardRegels, type Opvangsoort } from "@rekenhulp/rekenkern";
import { Bron, Datum, Keuze, Veld } from "@rekenhulp/ui";
import { leeftijdOp, maxUurprijs, nieuwKind, vandaag, type Formulier } from "./formulier.ts";
import { antwoordHulp, type StapProps } from "./stap.ts";

/** Hoogste uurprijs voor de toeslag, als tekst ("11,23"), of leeg als die voor vandaag niet bekend is. */
const maxPrijsTekst = (soort: Opvangsoort) => {
  const p = maxUurprijs(new Lezer(standaardRegels, vandaag()), soort);
  return p > 0 ? p.toFixed(2).replace(".", ",") : "";
};

export function StapHuishouden({ f, zet, fouten }: StapProps) {
  const metAntwoord = antwoordHulp(f, zet);
  const zetKind = (i: number, wijziging: Partial<Formulier["kinderen"][number]>) =>
    zet("kinderen", f.kinderen.map((k, j) => (i === j ? { ...k, ...wijziging } : k)));
  return (
    <section>
      <Keuze
        naam="partner"
        legend="Woont u samen met een partner?"
        hint={
          <>
            <p className="hint-kop">Wie is uw partner?</p>
            <p>Uw partner is uw man of vrouw.</p>
            <p>
              Woont u samen met iemand en zorgt u voor elkaar? Dan is die persoon ook uw partner. U doet dan bijvoorbeeld samen boodschappen. Of
              u betaalt samen de rekeningen. U hoeft niet verliefd op elkaar te zijn.
            </p>
            <p className="hint-kop">Wie is geen partner?</p>
            <p>De volgende mensen zijn geen partner:</p>
            <ul>
              <li>uw vader of moeder</li>
              <li>uw kind</li>
              <li>de partner van uw vader of moeder</li>
              <li>iemand die bij u woont omdat u hulp nodig heeft</li>
              <li>iemand die bij u woont omdat hij of zij zelf hulp nodig heeft</li>
            </ul>
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.pw3} />
            </p>
          </>
        }
        waarde={f.beantwoord.partner ? f.leefvorm === "paar" ? "ja" : "nee" : ""}
        onChange={metAntwoord("partner", (v) => zet("leefvorm", v === "ja" ? "paar" : f.kinderen.length > 0 ? "alleenstaande_ouder" : "alleenstaande"))}
        fout={fouten.partner}
        opties={[
          ["nee", "Nee"],
          ["ja", "Ja"],
        ]}
      />
      <Datum id="geboren" legend="Uw geboortedatum" eigen waarde={f.geboren} onChange={(v) => zet("geboren", v)} fout={fouten.geboren} />

      {f.leefvorm === "paar" && (
        <>
          <Datum
            id="partnerGeboren"
            legend="Geboortedatum van uw partner"
            waarde={f.partnerGeboren}
            onChange={(v) => zet("partnerGeboren", v)}
            fout={fouten.partnerGeboren}
          />
          <Keuze
            naam="partnerWerkt"
            legend="Heeft uw partner betaald werk?"
            hint="Kies alleen 'ja' als uw partner nu al werkt. Een bijbaan van een paar uur per week telt ook."
            waarde={f.beantwoord.partnerWerkt ? f.partnerWerkt ? "ja" : "nee" : ""}
            onChange={metAntwoord("partnerWerkt", (v) => zet("partnerWerkt", v === "ja"))}
        fout={fouten.partnerWerkt}
            opties={[
              ["nee", "Nee"],
              ["ja", "Ja"],
            ]}
          />
          {f.partnerWerkt && (
            <Veld
              id="partnerBruto"
              voorbeeld="bijv. 1.200"
              label="Bruto maandloon van uw partner"
              hint="Zonder vakantiegeld. Dit staat op de loonstrook."
              waarde={f.partnerBruto}
              onChange={(v) => zet("partnerBruto", v)}
              fout={fouten.partnerBruto}
              voorvoegsel="€"
            />
          )}
          {f.partnerWerkt && (
            <Keuze
              naam="partnerWerktAl"
              legend="Hoe lang werkt uw partner al naast de bijstand?"
              hint="Dit is nodig om uit te rekenen of uw partner een deel van het loon mag houden. Dat heet de vrijlating. Die geldt alleen in de eerste 6 maanden."
              waarde={f.partnerWerktAl}
              onChange={(v) => zet("partnerWerktAl", v)}
              fout={fouten.partnerWerktAl}
              opties={[
                ["kort", "Korter dan 6 maanden"],
                ["lang", "6 maanden of langer"],
              ]}
            />
          )}
        </>
      )}

      <Keuze
        naam="heeftAnderInkomen"
        legend={f.leefvorm === "paar" ? "Heeft u of uw partner ander inkomen dan bijstand en loon?" : "Heeft u ander inkomen dan bijstand en loon?"}
        hint={
          <>
            <p>
              Bijvoorbeeld partneralimentatie, een uitkering (zoals WW of Wajong) of een pensioen. Kinderalimentatie vult u hierna in, bij de kinderen. De gemeente vult uw inkomen aan tot de
              bijstandsnorm. Met ander inkomen krijgt u dus minder bijstand. Kinderbijslag, kindgebonden budget en toeslagen telt u niet mee;
              die rekent de rekenhulp zelf.
            </p>
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.pw32} />, <Bron citaat={CITATEN.alimentatie} />
            </p>
          </>
        }
        waarde={f.beantwoord.heeftAnderInkomen ? f.heeftAnderInkomen ? "ja" : "nee" : ""}
        onChange={metAntwoord("heeftAnderInkomen", (v) => zet("heeftAnderInkomen", v === "ja"))}
        fout={fouten.heeftAnderInkomen}
        opties={[
          ["nee", "Nee"],
          ["ja", "Ja"],
        ]}
      />
      {f.heeftAnderInkomen && (
        <div className="groep-velden">
          <p className="uitleg-paar">Vul in wat u heeft. Heeft u iets niet? Laat het vak leeg.</p>
          <Veld
            id="partneralimentatie"
            voorbeeld="bijv. 300"
            label="Partneralimentatie per maand (wat u ontvangt)"
            hint={
              <>
                <p>Alimentatie voor uzelf, van uw ex-partner. Over dit bedrag betaalt u nog belasting. De rekenhulp trekt die er zelf af.</p>
                <p className="bron-blok">
                  Bron: <Bron citaat={CITATEN.pw31lid3} />
                </p>
              </>
            }
            waarde={f.partneralimentatie}
            onChange={(v) => zet("partneralimentatie", v)}
            fout={fouten.partneralimentatie}
            voorvoegsel="€"
          />
          <Veld
            id="anderInkomen"
            voorbeeld="bijv. 250"
            label={f.leefvorm === "paar" ? "Ander inkomen per maand van u en uw partner samen (wat op uw rekening komt)" : "Ander inkomen per maand (wat op uw rekening komt)"}
            waarde={f.anderInkomen}
            onChange={(v) => zet("anderInkomen", v)}
            fout={fouten.anderInkomen}
            voorvoegsel="€"
          />
        </div>
      )}

      <h2 className="deel">Kinderen</h2>
      <Keuze
        naam="heeftKinderen"
        legend="Heeft u kinderen die bij u wonen?"
        hint="Alleen kinderen jonger dan 27 jaar. Woont er een kind van 27 jaar of ouder bij u? Dat vult u later in bij het onderdeel 'Uw woning'."
        waarde={f.beantwoord.heeftKinderen ? f.leefvorm === "alleenstaande_ouder" || f.kinderen.length > 0 ? "ja" : "nee" : ""}
        onChange={metAntwoord("heeftKinderen", (v) => {
          if (v === "ja") {
            if (f.kinderen.length === 0) zet("kinderen", [nieuwKind()]);
            if (f.leefvorm === "alleenstaande") zet("leefvorm", "alleenstaande_ouder");
          } else {
            zet("kinderen", []);
            if (f.leefvorm === "alleenstaande_ouder") zet("leefvorm", "alleenstaande");
          }
        })}
        fout={fouten.heeftKinderen}
        opties={[
          ["nee", "Nee"],
          ["ja", "Ja"],
        ]}
      />
      {(f.leefvorm === "alleenstaande_ouder" || (f.leefvorm === "paar" && f.kinderen.length > 0)) && (
        <fieldset className="groep">
          <legend className="visueel-verborgen">Kinderen die bij u wonen</legend>
          {fouten.kinderen && <p className="foutmelding">{fouten.kinderen}</p>}
          {f.kinderen.map((k, i) => (
            <div className="kind" key={i}>
              <Datum
                kind
                id={`kind${i}`}
                legend={`Geboortedatum kind ${i + 1}`}
                waarde={k.geboren}
                onChange={(v) => zetKind(i, { geboren: v })}
                fout={fouten[`kind${i}`]}
              />
              {(leeftijdOp(k.geboren, vandaag()) ?? 99) < 13 && (
                <Keuze
                  naam={`opvang${i}`}
                  legend="Als u gaat werken, gaat dit kind dan naar de opvang?"
                  waarde={k.opvangGekozen ? (k.opvang ? "ja" : "nee") : ""}
                  onChange={(v) => zetKind(i, { opvang: v === "ja", opvangGekozen: true })}
                  fout={fouten[`opvang${i}`]}
                  opties={[
                    ["nee", "Nee"],
                    ["ja", "Ja"],
                  ]}
                />
              )}
              {k.opvang && (
                <div className="opvang">
                  <Keuze
                    naam={`soort${i}`}
                    legend="Soort opvang"
                    waarde={k.soort}
                    onChange={(v) => zetKind(i, { soort: v })}
                    fout={fouten[`soort${i}`]}
                    opties={[
                      ["dagopvang", "Kinderdagverblijf"],
                      ["bso", "Buitenschoolse opvang"],
                      ["gastouder", "Gastouder"],
                    ]}
                  />
                  <Veld id={`kind${i}uren`} label="Hoeveel uur per week gaat dit kind naar de opvang?" voorbeeld="bijv. 16" waarde={k.uren} onChange={(v) => zetKind(i, { uren: v })} fout={fouten[`kind${i}uren`]} achtervoegsel="uur" />
                  <Veld
                    id={`kind${i}prijs`}
                    voorbeeld={`bijv. ${maxPrijsTekst(k.soort || "dagopvang") || "10,50"}`}
                    label="Prijs per uur"
                    hint={
                      k.soort && maxPrijsTekst(k.soort)
                        ? `Vraag het aan de opvang. Weet u het niet? Laat het vak leeg. De rekenhulp rekent dan met € ${maxPrijsTekst(k.soort)} per uur. Dat is de hoogste prijs per uur waarover u toeslag krijgt.`
                        : "Vraag dit na bij de opvang. Weet u het niet? Laat het vak dan leeg."
                    }
                    waarde={k.uurprijs}
                    onChange={(v) => zetKind(i, { uurprijs: v })}
                    fout={fouten[`kind${i}prijs`]}
                    voorvoegsel="€"
                  />
                </div>
              )}
              {f.kinderen.length > 1 && (
                <button type="button" className="linkknop" onClick={() => zet("kinderen", f.kinderen.filter((_, j) => j !== i))}>
                  Kind {i + 1} verwijderen
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="tweedeknop"
            onClick={() => {
              const nieuw = f.kinderen.length;
              zet("kinderen", [...f.kinderen, nieuwKind()]);
              // De focus gaat naar de geboortedatum van het nieuwe kind.
              requestAnimationFrame(() => document.getElementById(`kind${nieuw}`)?.focus());
            }}
          >
            Kind toevoegen
          </button>
          <Keuze
            naam="krijgtKinderalimentatie"
            legend={f.leefvorm === "paar" ? "Krijgt u of uw partner kinderalimentatie voor deze kinderen?" : "Krijgt u kinderalimentatie voor deze kinderen?"}
            waarde={f.beantwoord.krijgtKinderalimentatie ? f.kinderalimentatieJa ? "ja" : "nee" : ""}
            onChange={metAntwoord("krijgtKinderalimentatie", (v) => zet("kinderalimentatieJa", v === "ja"))}
            fout={fouten.krijgtKinderalimentatie}
            opties={[
              ["nee", "Nee"],
              ["ja", "Ja"],
            ]}
          />
          {f.kinderalimentatieJa && (
            <Veld
              id="kinderalimentatie"
              voorbeeld="bijv. 250"
              label="Kinderalimentatie per maand"
              hint={
                <>
                  <p>Dit telt mee voor de bijstand, maar niet voor de toeslagen. De rekenhulp houdt daar rekening mee.</p>
                  <p className="bron-blok">
                    Bron: <Bron citaat={CITATEN.alimentatie} />, <Bron citaat={CITATEN.toetsingsinkomenKinderalimentatie} />
                  </p>
                </>
              }
              waarde={f.kinderalimentatie}
              onChange={(v) => zet("kinderalimentatie", v)}
              fout={fouten.kinderalimentatie}
              voorvoegsel="€"
            />
          )}
        </fieldset>
      )}

    </section>
  );
}
