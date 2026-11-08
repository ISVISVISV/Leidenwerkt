import { useEffect, useRef, useState } from "react";
import { Lezer, standaardRegels, type Opvangsoort } from "@leidenwerkt/engine";
import { alleenCijfers, controleer, leegFormulier, maxUurprijs, nieuwKind, vandaag, type Fouten, type Formulier } from "./formulier.ts";
import { Uitkomst } from "./Uitkomst.tsx";

const STAPPEN = ["Uw huishouden", "Uw woning", "Uw werk", "Uitkomst"];

export function App() {
  const [f, setF] = useState<Formulier>(leegFormulier);
  const [stap, setStap] = useState(0);
  const [fouten, setFouten] = useState<Fouten>({});
  const kop = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (stap > 0) kop.current?.focus();
  }, [stap]);

  const zet = <K extends keyof Formulier>(k: K, v: Formulier[K]) => setF((oud) => ({ ...oud, [k]: v }));

  const verder = () => {
    const nieuw = controleer(f, stap);
    setFouten(nieuw);
    if (Object.keys(nieuw).length === 0) setStap(stap + 1);
    else requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
  };

  return (
    <div className="pagina">
      <header className="kopregel">
        <p className="merk">Leidenwerkt</p>
        <p className="kopregel-tekst">Gratis rekenhulp voor Leidenaren met bijstand</p>
      </header>

      <main>
        {stap === 0 && <Start onStart={() => setStap(1)} />}

        {stap > 0 && (
          <>
            <ol className="voortgang" aria-label="Voortgang">
              {STAPPEN.map((naam, i) => (
                <li key={naam} aria-current={i + 1 === stap ? "step" : undefined} className={i + 1 < stap ? "klaar" : undefined}>
                  <span className="nummer">{i + 1}</span>
                  <span className="naam">{naam}</span>
                  {i + 1 < stap && <span className="sr"> (klaar)</span>}
                </li>
              ))}
            </ol>
            <h1 ref={kop} tabIndex={-1}>
              {STAPPEN[stap - 1]}
            </h1>
          </>
        )}

        {stap === 1 && <StapHuishouden f={f} zet={zet} fouten={fouten} />}
        {stap === 2 && <StapWoning f={f} zet={zet} fouten={fouten} />}
        {stap === 3 && <StapWerk f={f} zet={zet} fouten={fouten} />}
        {stap === 4 && <Uitkomst f={f} />}

        {stap > 0 && (
          <div className="knoppen">
            {stap < 4 && (
              <button type="button" className="hoofdknop" onClick={verder}>
                {stap === 3 ? "Bereken wat ik overhoud" : "Volgende stap"}
              </button>
            )}
            <button type="button" className="tweedeknop" onClick={() => { setFouten({}); setStap(stap === 4 ? 3 : stap - 1); }}>
              {stap === 4 ? "Gegevens aanpassen" : "Vorige stap"}
            </button>
            {stap === 4 && (
              <button type="button" className="tweedeknop" onClick={() => window.print()}>
                Afdrukken
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="voet">
        <p>
          Uw gegevens blijven op uw eigen apparaat. Er wordt niets opgeslagen of verstuurd.
        </p>
        <p>
          Dit is een inschatting om u inzicht te geven. Wat u echt krijgt, bepalen de gemeente Leiden en Dienst Toeslagen.
          Leidenwerkt is geen product van de gemeente. De broncode is open (EUPL-1.2).
        </p>
        <p>Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI.</p>
      </footer>
    </div>
  );
}

function Start({ onStart }: { onStart: () => void }) {
  return (
    <section className="start">
      <h1>Hoeveel houdt u over als u gaat werken?</h1>
      <p className="inleiding">
        Met deze rekenhulp ziet u wat werk betekent voor uw bijstand, uw toeslagen en wat u per maand overhoudt. Het duurt ongeveer vijf
        minuten.
      </p>
      <p>U heeft nodig:</p>
      <ul>
        <li>het bruto loon (per maand, per 4 weken of per uur) en het aantal uren van het werk dat u overweegt;</li>
        <li>uw huur per maand, als u huurt;</li>
        <li>de leeftijden van uw kinderen, als u kinderen heeft.</li>
      </ul>
      <button type="button" className="hoofdknop" onClick={onStart}>
        Begin met rekenen
      </button>
      <p className="klein">
        Deze rekenhulp is voor inwoners van Leiden van 21 jaar tot de AOW-leeftijd met algemene bijstand.
      </p>
    </section>
  );
}

/** Hoogste uurprijs voor de toeslag, als tekst ("11,23"), of leeg als die voor vandaag niet bekend is. */
const maxPrijsTekst = (soort: Opvangsoort) => {
  const p = maxUurprijs(new Lezer(standaardRegels, vandaag()), soort);
  return p > 0 ? p.toFixed(2).replace(".", ",") : "";
};

/** De overgangsvraag heeft pas zin als de bijstandsnormen voor vandaag bekend zijn. */
const normenBekend = () => new Lezer(standaardRegels, vandaag()).bestaat("pw.norm.alleenstaande");

type StapProps = { f: Formulier; zet: <K extends keyof Formulier>(k: K, v: Formulier[K]) => void; fouten: Fouten };

function Veld(props: {
  id: string;
  label: string;
  hint?: string;
  waarde: string;
  onChange: (v: string) => void;
  fout?: string;
  voorvoegsel?: string;
  achtervoegsel?: string;
  breed?: boolean;
  /** "geheel": alleen cijfers (leeftijd, aantallen); "getal": ook komma en punt (bedragen, uren). */
  soort?: "geheel" | "getal";
  /** Voorbeeld dat licht in het lege vak staat. */
  voorbeeld?: string;
}) {
  const soort = props.soort ?? "getal";
  const hintId = props.hint ? `${props.id}-hint` : undefined;
  const foutId = props.fout ? `${props.id}-fout` : undefined;
  return (
    <div className={`veld${props.fout ? " fout" : ""}`}>
      <label htmlFor={props.id}>{props.label}</label>
      {props.hint && (
        <p className="hint" id={hintId}>
          {props.hint}
        </p>
      )}
      {props.fout && (
        <p className="foutmelding" id={foutId}>
          {props.fout}
        </p>
      )}
      <div className="invoer">
        <span className={`vak${props.voorvoegsel ? " met-voorvoegsel" : ""}`}>
          {props.voorvoegsel && (
            <span className="voorvoegsel" aria-hidden="true">
              {props.voorvoegsel}
            </span>
          )}
          <input
          id={props.id}
          type="text"
          inputMode={soort === "geheel" ? "numeric" : "decimal"}
          placeholder={props.voorbeeld}
          autoComplete="off"
          className={props.breed ? "breed" : undefined}
          value={props.waarde}
          aria-invalid={props.fout ? true : undefined}
          aria-describedby={[hintId, foutId].filter(Boolean).join(" ") || undefined}
          onChange={(e) => props.onChange(alleenCijfers(e.target.value, soort))}
          />
        </span>
        {props.achtervoegsel && <span>{props.achtervoegsel}</span>}
      </div>
    </div>
  );
}

function Keuze<T extends string>(props: { naam: string; legend: string; opties: [T, string][]; waarde: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="keuze">
      <legend>{props.legend}</legend>
      {props.opties.map(([w, tekst]) => (
        <label key={w} className="optie">
          <input type="radio" name={props.naam} checked={props.waarde === w} onChange={() => props.onChange(w)} />
          <span>{tekst}</span>
        </label>
      ))}
    </fieldset>
  );
}

function StapHuishouden({ f, zet, fouten }: StapProps) {
  const zetKind = (i: number, wijziging: Partial<Formulier["kinderen"][number]>) =>
    zet("kinderen", f.kinderen.map((k, j) => (i === j ? { ...k, ...wijziging } : k)));
  return (
    <section>
      <Keuze
        naam="leefvorm"
        legend="Met wie woont u?"
        waarde={f.leefvorm}
        onChange={(v) => {
          zet("leefvorm", v);
          if (v === "alleenstaande_ouder" && f.kinderen.length === 0) zet("kinderen", [nieuwKind()]);
          if (v === "alleenstaande") zet("kinderen", []);
        }}
        opties={[
          ["alleenstaande", "Alleen, zonder kinderen"],
          ["alleenstaande_ouder", "Alleen, met kinderen"],
          ["paar", "Met een partner (getrouwd of samenwonend), met of zonder kinderen"],
        ]}
      />
      <Veld id="leeftijd" label="Uw leeftijd" soort="geheel" voorbeeld="bijv. 35" waarde={f.leeftijd} onChange={(v) => zet("leeftijd", v)} fout={fouten.leeftijd} achtervoegsel="jaar" />

      {f.leefvorm === "paar" && (
        <>
          <Veld
            id="partnerLeeftijd"
            soort="geheel"
            voorbeeld="bijv. 40"
            label="Leeftijd van uw partner"
            waarde={f.partnerLeeftijd}
            onChange={(v) => zet("partnerLeeftijd", v)}
            fout={fouten.partnerLeeftijd}
            achtervoegsel="jaar"
          />
          <Keuze
            naam="partnerWerkt"
            legend="Heeft uw partner betaald werk?"
            waarde={f.partnerWerkt ? "ja" : "nee"}
            onChange={(v) => zet("partnerWerkt", v === "ja")}
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
        </>
      )}

      {f.leefvorm !== "alleenstaande" && (
        <fieldset className="groep">
          <legend>Kinderen die bij u wonen</legend>
          {fouten.kinderen && <p className="foutmelding">{fouten.kinderen}</p>}
          {f.kinderen.map((k, i) => (
            <div className="kind" key={i}>
              <Veld
                id={`kind${i}`}
                soort="geheel"
                voorbeeld="bijv. 6"
                label={`Leeftijd kind ${i + 1}`}
                waarde={k.leeftijd}
                onChange={(v) => zetKind(i, { leeftijd: v })}
                fout={fouten[`kind${i}`]}
                achtervoegsel="jaar"
              />
              {(Number(k.leeftijd) || 0) < 13 && k.leeftijd !== "" && (
                <label className="vinkje">
                  <input type="checkbox" checked={k.opvang} onChange={(e) => zetKind(i, { opvang: e.target.checked })} />
                  <span>Dit kind gaat naar de kinderopvang als ik werk</span>
                </label>
              )}
              {k.opvang && (
                <div className="opvang">
                  <Keuze
                    naam={`soort${i}`}
                    legend="Soort opvang"
                    waarde={k.soort}
                    onChange={(v) => zetKind(i, { soort: v })}
                    opties={[
                      ["dagopvang", "Kinderdagverblijf"],
                      ["bso", "Buitenschoolse opvang"],
                      ["gastouder", "Gastouder"],
                    ]}
                  />
                  <Veld id={`kind${i}uren`} label="Uren opvang per maand" voorbeeld="bijv. 60" waarde={k.uren} onChange={(v) => zetKind(i, { uren: v })} fout={fouten[`kind${i}uren`]} achtervoegsel="uur" />
                  <Veld
                    id={`kind${i}prijs`}
                    voorbeeld={`bijv. ${maxPrijsTekst(k.soort) || "11,00"}`}
                    label="Prijs per uur"
                    hint={
                      maxPrijsTekst(k.soort)
                        ? `Vraag dit na bij de opvang. Weet u het niet? Laat het vak dan leeg. Dan rekent de app met € ${maxPrijsTekst(k.soort)} per uur: het hoogste uurtarief waarover u toeslag krijgt.`
                        : "Vraag dit na bij de opvang. Weet u het niet? Laat het vak dan leeg."
                    }
                    waarde={k.uurprijs}
                    onChange={(v) => zetKind(i, { uurprijs: v })}
                    fout={fouten[`kind${i}prijs`]}
                    voorvoegsel="€"
                  />
                </div>
              )}
              <button type="button" className="linkknop" onClick={() => zet("kinderen", f.kinderen.filter((_, j) => j !== i))}>
                Kind {i + 1} verwijderen
              </button>
            </div>
          ))}
          <button type="button" className="tweedeknop" onClick={() => zet("kinderen", [...f.kinderen, nieuwKind()])}>
            Kind toevoegen
          </button>
        </fieldset>
      )}

      <Veld
        id="kostendelers"
        soort="geheel"
        voorbeeld="bijv. 0"
        label="Hoeveel andere volwassenen van 27 jaar of ouder wonen bij u in huis?"
        hint="Tel uw partner niet mee. Een volwassen kind of een huisgenoot telt wel mee."
        waarde={f.kostendelers}
        onChange={(v) => zet("kostendelers", v)}
        fout={fouten.kostendelers}
      />
    </section>
  );
}

function StapWoning({ f, zet, fouten }: StapProps) {
  return (
    <section>
      <Keuze
        naam="woont"
        legend="Waar woont u?"
        waarde={f.woont}
        onChange={(v) => zet("woont", v)}
        opties={[
          ["huur", "In een huurwoning of op een kamer"],
          ["koop", "In een koopwoning"],
          ["inwonend", "Bij iemand anders in huis, en ik betaal niets voor mijn woonruimte"],
          ["dakloos", "Ik heb geen vaste woonplek"],
          ["instelling", "In een instelling, zoals een zorginstelling of beschermd wonen"],
        ]}
      />
      {f.woont === "instelling" && (
        <div className="melding waarschuwing" role="status" id="woont-fout">
          <p>
            Woont u in een instelling? Dan krijgt u een ander bedrag aan bijstand, omdat de instelling een deel van uw kosten betaalt. Deze
            rekenhulp kan dat nog niet berekenen. Vraag uw klantmanager wat werken voor u betekent.
          </p>
          <p>Slaapt u in een daklozenopvang zonder begeleiding? Kies dan "Ik heb geen vaste woonplek".</p>
        </div>
      )}
      {f.woont === "huur" && (
        <>
          <Veld
            id="kaleHuur"
            voorbeeld="bijv. 650"
            label="Kale huur per maand"
            hint="De huur zonder servicekosten, gas, water en licht. Staat in uw huurcontract. Servicekosten tellen sinds 2026 niet mee voor de huurtoeslag."
            waarde={f.kaleHuur}
            onChange={(v) => zet("kaleHuur", v)}
            fout={fouten.kaleHuur}
            voorvoegsel="€"
          />
          <Keuze
            naam="zelfstandig"
            legend="Heeft uw woning een eigen voordeur, keuken, wc en douche of bad?"
            waarde={f.zelfstandig ? "ja" : "nee"}
            onChange={(v) => zet("zelfstandig", v === "ja")}
            opties={[
              ["ja", "Ja, die zijn alleen voor mijn huishouden"],
              ["nee", "Nee, ik deel er een of meer met anderen (bijvoorbeeld op een kamer)"],
            ]}
          />
          {(Number(f.kostendelers) || 0) > 0 && (
            <Veld
              id="huisgenotenInkomen"
              label="Bruto jaarinkomen van uw huisgenoten samen"
              hint="Het inkomen van de huisgenoten van 27 jaar of ouder telt mee voor de huurtoeslag. Een schatting is genoeg. Hebben zij geen inkomen? Vul dan 0 in."
              waarde={f.huisgenotenInkomen}
              onChange={(v) => zet("huisgenotenInkomen", v)}
              fout={fouten.huisgenotenInkomen}
              voorvoegsel="€"
              voorbeeld="bijv. 25.000"
            />
          )}
        </>
      )}
      {(f.woont === "inwonend" || f.woont === "dakloos") && (
        <Keuze
          naam="woonlasten"
          legend="Betaalt u zelf voor gas, licht of water?"
          waarde={f.woonlasten ? "ja" : "nee"}
          onChange={(v) => zet("woonlasten", v === "ja")}
          opties={[
            ["nee", "Nee"],
            ["ja", "Ja"],
          ]}
        />
      )}
    </section>
  );
}

function LoonVelden({
  prefix,
  per,
  loon,
  uren,
  zetPer,
  zetLoon,
  zetUren,
  fouten,
}: {
  prefix: string;
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
  return (
    <>
      <Keuze
        naam={`${prefix}per`}
        legend="Welk loon weet u?"
        waarde={per}
        onChange={zetPer}
        opties={[
          ["maand", "Bruto loon per maand"],
          ["netto", "Netto loon per maand (wat op mijn rekening komt)"],
          ["vierweken", "Bruto loon per 4 weken"],
          ["uur", "Bruto loon per uur"],
        ]}
      />
      <Veld
        id={loonId}
        voorbeeld={per === "uur" ? "bijv. 15,00" : per === "vierweken" ? "bijv. 1.650" : per === "netto" ? "bijv. 1.300" : "bijv. 1.800"}
        label={
          per === "uur" ? "Bruto loon per uur" : per === "vierweken" ? "Bruto loon per 4 weken" : per === "netto" ? "Netto loon per maand" : "Bruto loon per maand"
        }
        hint={
          per === "uur"
            ? "Staat in de vacature of het contract."
            : per === "netto"
              ? "Het bedrag dat u elke maand op uw rekening krijgt, zonder vakantiegeld. Staat onderaan op de loonstrook."
              : "Zonder vakantiegeld. Staat in het contract of op de loonstrook. 'Bruto' is het bedrag vóór belasting."
        }
        waarde={loon}
        onChange={zetLoon}
        fout={fouten[loonId]}
        voorvoegsel="€"
      />
      <Veld id={urenId} label="Uren per week" voorbeeld="bijv. 24" waarde={uren} onChange={zetUren} fout={fouten[urenId]} achtervoegsel="uur" />
    </>
  );
}

function StapWerk({ f, zet, fouten }: StapProps) {
  return (
    <section>
      <Keuze
        naam="werktNu"
        legend="Heeft u nu al betaald werk naast uw bijstand?"
        waarde={f.werktNu ? "ja" : "nee"}
        onChange={(v) => zet("werktNu", v === "ja")}
        opties={[
          ["nee", "Nee"],
          ["ja", "Ja"],
        ]}
      />
      {f.werktNu && (
        <fieldset className="groep">
          <legend>Uw werk nu</legend>
          <LoonVelden
            prefix="nu"
            per={f.nuPer}
            loon={f.nuLoon}
            uren={f.nuUren}
            zetPer={(v) => zet("nuPer", v)}
            zetLoon={(v) => zet("nuLoon", v)}
            zetUren={(v) => zet("nuUren", v)}
            fouten={fouten}
          />
        </fieldset>
      )}

      <Keuze
        naam="medisch"
        legend="Heeft de gemeente vastgesteld dat u door uw gezondheid minder uren kunt werken?"
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

      <h2>{f.werktNu ? "Uw werk straks, alles bij elkaar" : "Het werk dat u overweegt"}</h2>
      {f.werktNu && (
        <p className="hint">
          Vul hier in wat u straks in totaal verdient en werkt. Houdt u uw huidige baan en komt er werk bij? Tel dan beide bij elkaar op.
        </p>
      )}
      <LoonVelden
        prefix="straks"
        per={f.per}
        loon={f.loon}
        uren={f.uren}
        zetPer={(v) => zet("per", v)}
        zetLoon={(v) => zet("loon", v)}
        zetUren={(v) => zet("uren", v)}
        fouten={fouten}
      />
      <Veld
        id="reiskosten"
        voorbeeld="bijv. 40"
        label="Reiskosten per maand"
        hint="Bijvoorbeeld bus, trein of benzine. Laat leeg als u fietst of loopt."
        waarde={f.reiskosten}
        onChange={(v) => zet("reiskosten", v)}
        fout={fouten.reiskosten}
        voorvoegsel="€"
      />
      <Veld
        id="vergoeding"
        voorbeeld="bijv. 40"
        label="Reiskostenvergoeding van de werkgever per maand"
        waarde={f.vergoeding}
        onChange={(v) => zet("vergoeding", v)}
        fout={fouten.vergoeding}
        voorvoegsel="€"
      />
      <Veld
        id="overigeKosten"
        voorbeeld="bijv. 10"
        label="Andere kosten door het werk per maand"
        hint="Bijvoorbeeld werkkleding. Kosten voor kinderopvang vult u bij stap 1 in."
        waarde={f.overigeKosten}
        onChange={(v) => zet("overigeKosten", v)}
        fout={fouten.overigeKosten}
        voorvoegsel="€"
      />
    </section>
  );
}
