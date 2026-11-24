/** Stap 3 van Leidenwerkt: uw werk. Het werk dat u overweegt, en het werk dat u nu heeft. */
import { Lezer, standaardRegels } from "@rekenhulp/rekenkern";
import { Keuze, Veld } from "@rekenhulp/ui";
import { heeftOpvang, vandaag, type Fouten, type Formulier } from "./formulier.ts";
import { antwoordHulp, type StapProps } from "./stap.ts";

/** De overgangsvraag heeft pas zin als de bijstandsnormen voor vandaag bekend zijn. */
const normenBekend = () => new Lezer(standaardRegels, vandaag()).bestaat("pw.norm.alleenstaande");

function LoonVelden({
  prefix,
  per,
  loon,
  uren,
  zetPer,
  zetLoon,
  zetUren,
  allIn,
  zetAllIn,
  fouten,
  extra,
}: {
  /** Werk erbij, naast het huidige werk: de urenvraag gaat over het extra werk. */
  extra?: boolean;
  prefix: string;
  allIn: Formulier["allIn"];
  zetAllIn: (v: Formulier["allIn"]) => void;
  per: Formulier["per"];
  loon: string;
  uren: string;
  zetPer: (v: Formulier["per"]) => void;
  zetLoon: (v: string) => void;
  zetUren: (v: string) => void;
  fouten: Fouten;
}) {
  const loonId = prefix === "nu" ? "nuLoon" : "loon";
  const urenId = prefix === "nu" ? "nuUren" : "uren";
  const voor = per === "uur" ? "" : prefix === "nu" ? " voor de uren die u nu werkt" : " voor deze uren";
  return (
    <>
      <Veld
        id={urenId}
        label={prefix === "nu" ? "Hoeveel uur per week werkt u nu?" : extra ? "Hoeveel uur per week gaat u bij het extra werk werken?" : "Hoeveel uur per week gaat u werken?"}
        voorbeeld="bijv. 24"
        hint={
          prefix === "nu"
            ? "Gemiddeld per week. Werkt u wisselende uren? Neem het gemiddelde van de laatste maanden."
            : "Gemiddeld per week. Met de uren rekent de rekenhulp uit wat u per uur verdient. Zo ziet u bij de uitkomst wat meer of minder uren oplevert."
        }
        waarde={uren}
        onChange={zetUren}
        fout={fouten[urenId]}
        achtervoegsel="uur"
      />
      <Keuze
        naam={`${prefix}per`}
        legend="Welk bedrag van uw loon weet u?"
        waarde={per}
        onChange={zetPer}
        fout={fouten[`${prefix}per`]}
        opties={[
          ["maand", "Bruto loon per maand"],
          ["netto", "Netto loon per maand (wat op mijn rekening komt)"],
          ["week", "Bruto loon per week"],
          ["nettoweek", "Netto loon per week (wat op mijn rekening komt)"],
          ["vierweken", "Bruto loon per 4 weken"],
          ["nettovierweken", "Netto loon per 4 weken (wat op mijn rekening komt)"],
          ["uur", "Bruto loon per uur"],
        ]}
      />
      {per && (
        <Veld
          id={loonId}
          voorbeeld={per === "uur" ? "bijv. 15,00" : per === "week" ? "bijv. 420" : per === "netto" ? "bijv. 1.300" : per === "nettoweek" ? "bijv. 350" : per === "vierweken" ? "bijv. 1.650" : per === "nettovierweken" ? "bijv. 1.200" : "bijv. 1.800"}
          label={
            (per === "uur"
              ? "Bedrag per uur"
              : per === "week"
                ? "Bruto loon per week"
                : per === "netto"
                  ? "Netto loon per maand"
                  : per === "nettoweek"
                    ? "Netto loon per week"
                    : per === "vierweken"
                      ? "Bruto loon per 4 weken"
                      : per === "nettovierweken"
                        ? "Netto loon per 4 weken"
                        : "Bruto loon per maand") + voor
          }
          hint={
            per === "uur"
              ? "Het bruto loon per uur. Staat in de vacature of het contract. 'Bruto' is het bedrag vóór belasting."
              : per === "netto" || per === "nettoweek" || per === "nettovierweken"
                ? `Het bedrag dat u ${per === "netto" ? "elke maand" : per === "nettoweek" ? "elke week" : "elke 4 weken"} op uw rekening krijgt, zonder vakantiegeld. Staat onderaan op de loonstrook. De rekenhulp telt het vakantiegeld zelf mee.`
                : `Neem het loon uit uw contract of van uw loonstrook, zonder vakantiegeld. De rekenhulp telt het vakantiegeld zelf mee. 'Bruto' is het bedrag vóór belasting.`
          }
          waarde={loon}
          onChange={zetLoon}
          fout={fouten[loonId]}
          voorvoegsel="€"
        />
      )}
      {per === "uur" && (
        <Keuze
          naam={`${prefix}allIn`}
          legend="Zit het vakantiegeld al in dit uurloon?"
          hint="Meestal krijgt u het vakantiegeld apart, één keer per jaar. Bij uitzendwerk of in de horeca zit het soms al in het uurloon. Dat heet een all-in uurloon. Het staat in uw contract of op uw loonstrook."
          waarde={allIn}
          onChange={zetAllIn}
          fout={fouten[`${prefix}allIn`]}
          opties={[
            ["nee", "Nee, ik krijg het apart"],
            ["ja", "Ja, het is een all-in uurloon"],
            ["onbekend", "Ik weet het niet"],
          ]}
        />
      )}
    </>
  );
}

export function StapWerk({ f, zet, fouten }: StapProps) {
  const metAntwoord = antwoordHulp(f, zet);
  return (
    <section>
      <Keuze
        naam="werktNu"
        legend="Heeft u nu al betaald werk naast uw bijstand?"
        waarde={f.beantwoord.werktNu ? f.werktNu ? "ja" : "nee" : ""}
        onChange={metAntwoord("werktNu", (v) => zet("werktNu", v === "ja"))}
        fout={fouten.werktNu}
        opties={[
          ["nee", "Nee"],
          ["ja", "Ja"],
        ]}
      />
      {f.werktNu && (
        <>
        <h2 className="deel">Uw werk nu</h2>
        <fieldset className="groep">
          <legend className="visueel-verborgen">Uw werk nu</legend>
          <LoonVelden
            prefix="nu"
            per={f.nuPer}
            loon={f.nuLoon}
            uren={f.nuUren}
            zetPer={(v) => {
              // Een bedrag hoort bij één soort loon; bij een andere keuze begint het veld leeg.
              if (v !== f.nuPer) zet("nuLoon", "");
              zet("nuPer", v);
            }}
            zetLoon={(v) => zet("nuLoon", v)}
            zetUren={(v) => zet("nuUren", v)}
            allIn={f.nuAllIn}
            zetAllIn={(v) => zet("nuAllIn", v)}
            fouten={fouten}
          />
          <Keuze
            naam="werktAl"
            legend="Hoe lang werkt u al naast de bijstand?"
            hint="In de eerste 6 maanden mag u een deel van uw loon extra houden. Daarna meestal niet meer. Zo weet de rekenhulp welke regel voor u geldt."
            waarde={f.werktAl}
            onChange={(v) => zet("werktAl", v)}
            fout={fouten.werktAl}
            opties={[
              ["kort", "Korter dan 6 maanden"],
              ["lang", "6 maanden of langer"],
            ]}
          />
          {heeftOpvang(f) && (
            <Keuze
              naam="opvangNu"
              legend={f.kinderen.filter((k) => k.opvang).length > 1 ? "Gaan uw kinderen nu al naar de kinderopvang?" : "Gaat uw kind nu al naar de kinderopvang?"}
              hint="Dan rekent de rekenhulp de kosten en de toeslag voor de kinderopvang ook mee in de situatie zoals die nu is."
              waarde={f.opvangNu}
              onChange={(v) => zet("opvangNu", v)}
              fout={fouten.opvangNu}
              opties={[
                ["ja", "Ja, met dezelfde uren"],
                ["nee", "Nee, dat begint pas met het nieuwe werk"],
              ]}
            />
          )}
        </fieldset>
        </>
      )}

      <Keuze
        naam="medisch"
        legend="Heeft de gemeente vastgesteld dat u door uw gezondheid minder uren kunt werken?"
        hint="Dit gaat over uzelf. De gemeente stelt dit vast na een medisch advies, en u heeft daar dan een brief over gekregen. Weet u het niet? Kies dan het eerste antwoord. Vraag het uw contactpersoon bij de gemeente."
        waarde={f.medisch ? "ja" : "nee"}
        onChange={(v) => zet("medisch", v === "ja")}
        opties={[
          ["nee", "Nee, of ik weet het niet"],
          ["ja", "Ja, ik heb een medische urenbeperking"],
        ]}
      />

      {f.werktNu && vandaag() >= "2027-01-01" && vandaag() < "2028-01-01" && normenBekend() && (
        <Keuze
          naam="overgang"
          legend="Mocht u in december 2026 al een deel van uw loon houden naast de bijstand?"
          waarde={f.overgang}
          onChange={(v) => zet("overgang", v)}
          opties={[
            ["", "Nee, of ik weet het niet"],
            ["n", "Ja, 25% van mijn loon (de eerste 6 maanden)"],
            ["r", "Ja, 12,5% als alleenstaande ouder"],
          ]}
        />
      )}

      {f.werktNu && (
        <Keuze
          naam="verandering"
          legend="Wat verandert er aan uw werk?"
          hint="Meer uren: u blijft bij dezelfde werkgever en werkt meer uren. Ander werk: u stopt met uw huidige werk en begint ergens anders. Werk erbij: u houdt uw huidige werk en neemt er een tweede baan bij."
          waarde={f.verandering}
          onChange={(v) => zet("verandering", v)}
          fout={fouten.verandering}
          opties={[
            ["meer", "Ik ga meer uren werken bij mijn huidige werk"],
            ["ander", "Ik krijg ander werk in plaats van mijn huidige werk"],
            ["erbij", "Ik neem er werk bij, naast mijn huidige werk"],
          ]}
        />
      )}

      {f.werktNu && f.verandering === "meer" && (
        <Veld
          id="meerUren"
          voorbeeld={`bijv. ${Math.min(60, (Number(f.nuUren) || 16) + 8)}`}
          label="Hoeveel uur per week gaat u in totaal werken?"
          hint={`Nu werkt u ${f.nuUren || "…"} uur per week. De rekenhulp gaat uit van hetzelfde uurloon.`}
          waarde={f.meerUren}
          onChange={(v) => zet("meerUren", v)}
          fout={fouten.meerUren}
          achtervoegsel="uur"
        />
      )}

      {(!f.werktNu || f.verandering === "ander" || f.verandering === "erbij") && (
        <>
          <h2 className="deel">{!f.werktNu ? "Het werk dat u overweegt" : f.verandering === "erbij" ? "Het extra werk" : "Het nieuwe werk"}</h2>
          <LoonVelden
            extra={f.werktNu && f.verandering === "erbij"}
            prefix="straks"
            per={f.per}
            loon={f.loon}
            uren={f.uren}
            zetPer={(v) => {
              // Een bedrag hoort bij één soort loon; bij een andere keuze begint het veld leeg.
              if (v !== f.per) zet("loon", "");
              zet("per", v);
            }}
            zetLoon={(v) => zet("loon", v)}
            zetUren={(v) => zet("uren", v)}
            allIn={f.allIn}
            zetAllIn={(v) => zet("allIn", v)}
            fouten={fouten}
          />
        </>
      )}
      <Veld
        id="reiskosten"
        voorbeeld="bijv. 40"
        label={!f.werktNu ? "Reiskosten per maand" : f.verandering === "ander" ? "Hoeveel meer reiskosten heeft het nieuwe werk per maand dan uw huidige werk?" : "Hoeveel reiskosten komen erbij per maand?"}
        hint={
          f.werktNu
            ? "Reist u straks vaker of verder dan nu? Vul in wat u daardoor meer betaalt. Bijvoorbeeld OV-kosten of benzine. Verandert er niets? Laat het vak leeg."
            : "Bijvoorbeeld OV-kosten of benzine."
        }
        waarde={f.reiskosten}
        onChange={(v) => zet("reiskosten", v)}
        fout={fouten.reiskosten}
        voorvoegsel="€"
      />
      <Veld
        id="vergoeding"
        voorbeeld="bijv. 40"
        label={f.werktNu ? "Hoeveel reiskostenvergoeding van de werkgever komt erbij per maand?" : "Reiskostenvergoeding van de werkgever per maand"}
        waarde={f.vergoeding}
        onChange={(v) => zet("vergoeding", v)}
        fout={fouten.vergoeding}
        voorvoegsel="€"
      />
      <Veld
        id="overigeKosten"
        voorbeeld="bijv. 10"
        label={f.werktNu ? "Hoeveel andere kosten door het werk komen erbij per maand?" : "Andere kosten door het werk per maand"}
        hint={heeftOpvang(f) ? "Bijvoorbeeld werkkleding. De kinderopvang vulde u al in bij uw huishouden." : "Bijvoorbeeld werkkleding."}
        waarde={f.overigeKosten}
        onChange={(v) => zet("overigeKosten", v)}
        fout={fouten.overigeKosten}
        voorvoegsel="€"
      />
    </section>
  );
}
