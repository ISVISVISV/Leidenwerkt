import { useEffect, useRef, useState } from "react";
import { CITATEN, type Inkomenssoort } from "@leidenwerkt/engine";
import { Bron, Datum, Keuze, Veld, Vinkjes } from "@leidenwerkt/ui";
import { bronVan, controleer, leegFormulier, minderjarigen, vraagHuur, vraagInkomen, vraagLangLaag, vraagNetto, vraagStudie, type Fouten, type Formulier } from "./formulier.ts";
import { Overzicht } from "./Overzicht.tsx";

const STAPPEN = ["Uw huishouden", "Uw inkomen", "Wonen en geld", "Overzicht"];
const JA_NEE: ["ja" | "nee", string][] = [
  ["nee", "Nee"],
  ["ja", "Ja"],
];

type StapProps = { f: Formulier; zet: <K extends keyof Formulier>(k: K, v: Formulier[K]) => void; fouten: Fouten };

export function App() {
  const [f, setF] = useState<Formulier>(leegFormulier);
  const [stap, setStap] = useState(0);
  const [fouten, setFouten] = useState<Fouten>({});
  const kop = useRef<HTMLHeadingElement>(null);
  const nuFout = stap > 0 && stap < STAPPEN.length ? controleer(f, stap) : {};
  const zichtbareFouten: Fouten = Object.fromEntries(Object.entries(fouten).filter(([id]) => id in nuFout));

  useEffect(() => {
    if (stap > 0) kop.current?.focus();
  }, [stap]);

  // De terugknop van de browser gaat een stap terug.
  useEffect(() => {
    history.replaceState({ stap: 0 }, "");
    const bijTerug = (e: PopStateEvent) => {
      setFouten({});
      setStap(typeof e.state?.stap === "number" ? (e.state.stap as number) : 0);
    };
    window.addEventListener("popstate", bijTerug);
    return () => window.removeEventListener("popstate", bijTerug);
  }, []);

  const naarStap = (doel: number) => {
    if (doel > stap) history.pushState({ stap: doel }, "");
    else if (doel < stap) history.go(doel - stap);
    setStap(doel);
  };
  const zet = <K extends keyof Formulier>(k: K, v: Formulier[K]) => setF((oud) => ({ ...oud, [k]: v }));
  const verder = () => {
    const nieuw = controleer(f, stap);
    setFouten(nieuw);
    if (Object.keys(nieuw).length === 0) naarStap(stap + 1);
    else requestAnimationFrame(() => document.querySelector<HTMLElement>(".foutsamenvatting")?.focus());
  };

  return (
    <div className="pagina">
      <header className="kopregel">
        <p className="merk">Werkversie</p>
        <p className="kopregel-tekst">Welke regelingen kunt u krijgen in Leiden?</p>
      </header>

      <main>
        {stap === 0 && <Start onStart={() => naarStap(1)} />}

        {stap > 0 && (
          <>
            <ol className="voortgang" aria-label="Voortgang">
              {STAPPEN.map((naam, i) => (
                <li key={naam} aria-current={i + 1 === stap ? "step" : undefined} className={i + 1 < stap || stap === STAPPEN.length ? "klaar" : undefined}>
                  <span className="nummer">{i + 1}</span>
                  <span className="naam">{naam}</span>
                  {i + 1 < stap && <span className="sr"> (klaar)</span>}
                </li>
              ))}
            </ol>
            <h1 ref={kop} tabIndex={-1}>
              {STAPPEN[stap - 1]}
            </h1>
            {stap < STAPPEN.length && Object.keys(zichtbareFouten).length > 0 && (
              <div className="melding waarschuwing foutsamenvatting" role="alert" tabIndex={-1}>
                <p>{Object.keys(zichtbareFouten).length === 1 ? "Eén vraag is nog niet goed ingevuld:" : `${Object.keys(zichtbareFouten).length} vragen zijn nog niet goed ingevuld:`}</p>
                <ul>
                  {Object.entries(zichtbareFouten).map(([id, melding]) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          naarVraag(id);
                        }}
                      >
                        {vraagVan(id) ? `${vraagVan(id)}: ` : ""}
                        {melding}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {stap === 1 && <StapHuishouden f={f} zet={zet} fouten={zichtbareFouten} />}
        {stap === 2 && <StapInkomen f={f} zet={zet} fouten={zichtbareFouten} />}
        {stap === 3 && <StapWonen f={f} zet={zet} fouten={zichtbareFouten} />}
        {stap === 4 && <Overzicht f={f} />}

        {stap > 0 && (
          <div className="knoppen">
            {stap < 4 && (
              <button type="button" className="hoofdknop" onClick={verder}>
                {stap === 3 ? "Bekijk het overzicht" : "Volgende stap"}
              </button>
            )}
            <button
              type="button"
              className="tweedeknop"
              onClick={() => {
                setFouten({});
                naarStap(stap - 1);
              }}
            >
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
          Wat u op deze website invult, blijft op uw eigen telefoon of computer. Het wordt niet verstuurd en niet bewaard. Sluit u de pagina, dan
          is alles weg.
        </p>
        <p>
          Deze check geeft een schatting. Of u een regeling echt krijgt, bepalen de gemeente Leiden en Dienst Toeslagen. Deze check is geen
          product van de gemeente.
        </p>
        <p>
          Gemaakt door Ian Vriend, met hulp van AI. Iedereen kan de{" "}
          <a href="https://github.com/ISVISVISV/Leidenwerkt" rel="noopener noreferrer">
            broncode
          </a>{" "}
          bekijken en gebruiken (licentie EUPL-1.2). Werkversie {__VERSIE__}.
        </p>
      </footer>
    </div>
  );
}

function Start({ onStart }: { onStart: () => void }) {
  return (
    <section className="start">
      <h1>Welke regelingen kunt u krijgen?</h1>
      <p className="inleiding">
        Heeft u een laag inkomen? Dan kunt u misschien hulp krijgen van de gemeente Leiden of geld van Dienst Toeslagen. Met deze check ziet u
        welke regelingen er zijn voor u. Het duurt ongeveer vijf minuten.
      </p>
      <p>U heeft nodig:</p>
      <ul>
        <li>uw netto inkomen per maand, en dat van uw partner</li>
        <li>uw kale huur per maand, als u huurt</li>
        <li>hoeveel geld en bezit u heeft, ongeveer</li>
      </ul>
      <p>De check is voor inwoners van Leiden van 18 jaar tot de AOW-leeftijd.</p>
      <button type="button" className="hoofdknop" onClick={onStart}>
        Begin de check
      </button>
    </section>
  );
}

/** Bron uit de regeldata (met bedragen die per periode veranderen). */
function BronVan({ id }: { id: string }) {
  const c = bronVan(id);
  return c ? <Bron citaat={c} /> : null;
}

/** De tekst van de vraag bij een veld of keuze, voor de foutensamenvatting. */
function vraagVan(id: string): string {
  if (typeof document === "undefined") return "";
  const label = document.querySelector(`label[for="${id}"]`)?.textContent;
  if (label) return label.trim().replace(/[?:]$/, "");
  const legend = document.querySelector(`input[name="${id}"]`)?.closest("fieldset")?.querySelector("legend")?.textContent;
  return legend ? legend.trim().replace(/[?:]$/, "") : "";
}

function naarVraag(id: string) {
  const doel = document.getElementById(id) ?? document.querySelector<HTMLInputElement>(`input[name="${id}"]`);
  doel?.focus();
  doel?.scrollIntoView({ block: "center" });
}

function StapHuishouden({ f, zet, fouten }: StapProps) {
  return (
    <section>
      <Keuze naam="leiden" legend="Woont u in de gemeente Leiden?" waarde={f.leiden} onChange={(v) => zet("leiden", v)} fout={fouten.leiden} opties={JA_NEE} />
      <Datum id="geboren" legend="Uw geboortedatum" eigen waarde={f.geboren} onChange={(v) => zet("geboren", v)} fout={fouten.geboren} />
      <Keuze
        naam="partner"
        legend="Woont u samen met een partner?"
        hint={
          <>
            <p className="hint-kop">Wie is uw partner?</p>
            <p>Uw partner is uw man of vrouw.</p>
            <p>
              Woont u samen met iemand en zorgt u voor elkaar? Dan is die persoon ook uw partner. U doet dan bijvoorbeeld samen boodschappen. Of u
              betaalt samen de rekeningen. U hoeft niet verliefd op elkaar te zijn.
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
        waarde={f.partner}
        onChange={(v) => zet("partner", v)}
        fout={fouten.partner}
        opties={JA_NEE}
      />
      {f.partner === "ja" && (
        <Datum id="partnerGeboren" legend="Geboortedatum van uw partner" waarde={f.partnerGeboren} onChange={(v) => zet("partnerGeboren", v)} fout={fouten.partnerGeboren} />
      )}

      <h2 className="deel">Kinderen</h2>
      <Keuze naam="heeftKinderen" legend="Heeft u kinderen die bij u wonen?" waarde={f.heeftKinderen} onChange={(v) => zet("heeftKinderen", v)} fout={fouten.heeftKinderen} opties={JA_NEE} />
      {f.heeftKinderen === "ja" && (
        <>
          {f.kinderen.map((k, i) => (
            <div key={i} className="kind">
              <Datum
                id={`kind${i}`}
                legend={f.kinderen.length > 1 ? `Geboortedatum van kind ${i + 1}` : "Geboortedatum van uw kind"}
                kind
                waarde={k}
                onChange={(v) => zet("kinderen", f.kinderen.map((x, j) => (i === j ? v : x)))}
                fout={fouten[`kind${i}`]}
              />
              {f.kinderen.length > 1 && (
                <button type="button" className="stilleknop" onClick={() => zet("kinderen", f.kinderen.filter((_, j) => j !== i))}>
                  Kind {i + 1} weghalen
                </button>
              )}
            </div>
          ))}
          <button type="button" className="tweedeknop" onClick={() => zet("kinderen", [...f.kinderen, ""])}>
            Nog een kind toevoegen
          </button>
          {minderjarigen(f) > 0 && (
            <Keuze
              naam="kinderbijslag"
              legend={minderjarigen(f) > 1 ? "Krijgt u kinderbijslag voor deze kinderen?" : "Krijgt u kinderbijslag voor dit kind?"}
              hint={
                <>
                  <p>Kinderbijslag krijgt u van de SVB voor kinderen jonger dan 18 jaar. Kies ook Ja als u een pleegkindvergoeding krijgt.</p>
                  <p className="bron-blok">
                    Bron: <Bron citaat={CITATEN.kindtegoedKind} />
                  </p>
                </>
              }
              waarde={f.kinderbijslag}
              onChange={(v) => zet("kinderbijslag", v)}
              fout={fouten.kinderbijslag}
              opties={JA_NEE}
            />
          )}
        </>
      )}
    </section>
  );
}

const SOORTEN: [Inkomenssoort, string][] = [
  ["loon", "Loon uit werk"],
  ["uwv", "Een uitkering van UWV, zoals WW, Wajong of WIA"],
  ["bedrijf", "Inkomen uit een eigen bedrijf"],
  ["studiefinanciering", "Studiefinanciering"],
  ["ander", "Ander inkomen, zoals alimentatie of pensioen"],
  ["geen", "Geen inkomen"],
];
const nettoHint = "Tel alles bij elkaar op. Zonder vakantiegeld. Tel toeslagen en kinderbijslag niet mee.";

function StapInkomen({ f, zet, fouten }: StapProps) {
  const paar = f.partner === "ja";
  return (
    <section>
      <Keuze
        naam="bijstand"
        legend={paar ? "Krijgt u samen bijstand van de gemeente?" : "Krijgt u bijstand van de gemeente?"}
        waarde={f.bijstand}
        onChange={(v) => zet("bijstand", v)}
        fout={fouten.bijstand}
        opties={JA_NEE}
      />
      {vraagInkomen(f) && (
        <>
          <Vinkjes naam="soorten" legend="Wat voor inkomen heeft u?" hint="U kunt meer dan één antwoord kiezen." opties={SOORTEN} alleen="geen" waarde={f.soorten} onChange={(v) => zet("soorten", v)} fout={fouten.soorten} />
          {vraagNetto(f.soorten) && (
            <Veld id="netto" label="Hoeveel inkomen heeft u netto per maand?" hint={nettoHint} voorbeeld="bijv. 1.400" voorvoegsel="€" waarde={f.netto} onChange={(v) => zet("netto", v)} fout={fouten.netto} />
          )}
          {paar && (
            <>
              <Vinkjes
                naam="partnerSoorten"
                legend="Wat voor inkomen heeft uw partner?"
                hint="U kunt meer dan één antwoord kiezen."
                opties={SOORTEN}
                alleen="geen"
                waarde={f.partnerSoorten}
                onChange={(v) => zet("partnerSoorten", v)}
                fout={fouten.partnerSoorten}
              />
              {vraagNetto(f.partnerSoorten) && (
                <Veld
                  id="partnerNetto"
                  label="Hoeveel inkomen heeft uw partner netto per maand?"
                  hint={nettoHint}
                  voorbeeld="bijv. 1.400"
                  voorvoegsel="€"
                  waarde={f.partnerNetto}
                  onChange={(v) => zet("partnerNetto", v)}
                  fout={fouten.partnerNetto}
                />
              )}
            </>
          )}
        </>
      )}
      {vraagStudie(f) && (
        <Keuze
          naam="studieMedisch"
          legend="Kunt u door ziekte of een handicap niet werken naast uw studie?"
          hint={
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.pw36b} />
            </p>
          }
          waarde={f.studieMedisch}
          onChange={(v) => zet("studieMedisch", v)}
          fout={fouten.studieMedisch}
          opties={JA_NEE}
        />
      )}
      {vraagLangLaag(f) && (
        <Keuze
          naam="langLaag"
          legend="Heeft u al 5 jaar of langer een laag inkomen?"
          hint="Laag betekent: niet hoger dan de bijstand."
          waarde={f.langLaag}
          onChange={(v) => zet("langLaag", v)}
          fout={fouten.langLaag}
          opties={[
            ["nee", "Nee"],
            ["ja", "Ja"],
            ["onbekend", "Weet ik niet"],
          ]}
        />
      )}
    </section>
  );
}

function StapWonen({ f, zet, fouten }: StapProps) {
  const paar = f.partner === "ja";
  return (
    <section>
      <Keuze
        naam="woont"
        legend="Waar woont u?"
        hint={
          <>
            <p>
              Huurt u, dan maakt het uit of u de keuken, wc of douche deelt met mensen die niet bij uw huishouden horen. Huurtoeslag is er meestal
              alleen voor een woning met een eigen voordeur, keuken, wc en douche. Een flat of appartement telt ook, als u die niet met anderen
              deelt.
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
        waarde={f.woont}
        fout={fouten.woont}
        onChange={(v) => zet("woont", v)}
        opties={[
          ["huur", "In een huurwoning met een eigen voordeur, keuken, wc en douche"],
          ["kamer", "Op een kamer, of in een woning waar ik de keuken, wc of douche deel"],
          ["koop", "In een koopwoning"],
          ["kostgeld", `Bij iemand anders in huis${paar ? " (niet bij uw partner)" : ""}, en ik betaal kostgeld of huur`],
          ["inwonend", `Bij iemand anders in huis${paar ? " (niet bij uw partner)" : ""}, en ik betaal niets voor mijn woonruimte`],
          ["dakloos", "Ik heb geen vaste woonplek"],
          ["instelling", "In een instelling of woonvorm waar ik zorg of begeleiding krijg"],
        ]}
      />
      {vraagHuur(f) && (
        <Veld
          id="kaleHuur"
          label="Kale huur per maand"
          hint="De kale huur is de huur zonder servicekosten en zonder gas, water en licht. Die staat in uw huurcontract of op het overzicht van de verhuurder."
          voorbeeld="bijv. 750"
          voorvoegsel="€"
          waarde={f.kaleHuur}
          onChange={(v) => zet("kaleHuur", v)}
          fout={fouten.kaleHuur}
        />
      )}
      <Keuze
        naam="andereBewoners"
        legend="Wonen er nog andere mensen bij u in huis?"
        hint={paar ? "Niet uw partner en niet uw kinderen." : "Niet uw kinderen."}
        waarde={f.andereBewoners}
        onChange={(v) => zet("andereBewoners", v)}
        fout={fouten.andereBewoners}
        opties={JA_NEE}
      />

      <h2 className="deel">Geld en bezit</h2>
      {!f.vermogenOnbekend && (
        <Veld
          id="vermogen"
          label={paar ? "Hoeveel geld en bezit heeft u samen?" : "Hoeveel geld en bezit heeft u?"}
          hint={
            <>
              <p>Bijvoorbeeld spaargeld, geld op uw bankrekening en een auto. Haal schulden eraf. Uw eigen huis telt hier niet mee.</p>
              <p className="bron-blok">
                Bron: <BronVan id="pw.vermogensgrens.alleenstaande" />
              </p>
            </>
          }
          voorbeeld="bijv. 2.500"
          voorvoegsel="€"
          waarde={f.vermogen}
          onChange={(v) => zet("vermogen", v)}
          fout={fouten.vermogen}
        />
      )}
      <label className="vinkje">
        <input type="checkbox" checked={f.vermogenOnbekend} onChange={(e) => zet("vermogenOnbekend", e.target.checked)} />
        <span>Ik weet het niet</span>
      </label>
    </section>
  );
}
