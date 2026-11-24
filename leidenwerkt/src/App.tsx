/**
 * Leidenwerkt: het begin, de stappen van het formulier en de uitkomst.
 * Elke stap staat in een eigen bestand: StapHuishouden, StapWoning en StapWerk.
 */
import { useEffect, useRef, useState } from "react";
import { Kopvlak } from "@rekenhulp/ui";
import { controleer, leegFormulier, schuifSleutel, type Fouten, type Formulier } from "./formulier.ts";
import { StapHuishouden } from "./StapHuishouden.tsx";
import { StapWerk } from "./StapWerk.tsx";
import { StapWoning } from "./StapWoning.tsx";
import { Uitkomst } from "./Uitkomst.tsx";

const STAPPEN = ["Uw huishouden", "Uw woning", "Uw werk", "Uitkomst"];

export function App() {
  const [f, setF] = useState<Formulier>(leegFormulier);
  const [wissen, setWissen] = useState(false);
  const [stap, setStap] = useState(0);
  const [fouten, setFouten] = useState<Fouten>({});
  const [schuif, setSchuif] = useState<{ sleutel: string; uren: number } | undefined>();
  const kop = useRef<HTMLHeadingElement>(null);
  // Toon alleen meldingen die nog gelden: een opgeloste fout of een vraag die weg is, verdwijnt meteen.
  const nuFout = stap > 0 && stap < STAPPEN.length ? controleer(f, stap) : {};
  // De tekst blijft die van de laatste controle, zodat een schermlezer niet bij elke toetsaanslag iets nieuws voorleest.
  const zichtbareFouten: Fouten = Object.fromEntries(Object.entries(fouten).filter(([id]) => id in nuFout));

  useEffect(() => {
    if (stap > 0) kop.current?.focus();
  }, [stap]);

  // De terugknop van de browser gaat een stap terug in de rekenhulp, in plaats van de pagina te verlaten.
  const stand = useRef({ f, stap });
  stand.current = { f, stap };
  useEffect(() => {
    history.replaceState({ stap: 0 }, "");
    const bijTerug = (e: PopStateEvent) => {
      const doel = typeof e.state?.stap === "number" ? (e.state.stap as number) : 0;
      const nu = stand.current;
      // Vooruit kan alleen als de stappen ervoor goed zijn ingevuld.
      for (let s = Math.max(nu.stap, 1); s < doel; s++) {
        if (Object.keys(controleer(nu.f, s)).length > 0) {
          history.replaceState({ stap: nu.stap }, "");
          return;
        }
      }
      setFouten({});
      setWissen(false);
      setStap(doel);
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
    <>
      {/* De eerste pagina en de uitkomst hebben een groot rood vlak met de kop. Bij de vragen is het vlak laag. */}
      <Kopvlak tool="Leidenwerkt" groot={stap === 0 || stap === 4}>
        {stap === 0 && (
          <>
            <h1>Wat houdt u over als u gaat werken?</h1>
            <p className="kopvlak-tekst">Het duurt ongeveer vijf minuten.</p>
          </>
        )}
        {stap === 4 && (
          <>
            <h1 ref={kop} tabIndex={-1}>
              {STAPPEN[3]}
            </h1>
            <p className="kopvlak-tekst">
              Dit is een schatting. Leidenwerkt gebruikt alleen wat u heeft ingevuld. Leidenwerkt bewaart niets. Wilt u de uitkomst houden? Druk hem
              dan af. Of sla hem op als pdf.
            </p>
            <button type="button" className="tweedeknop" onClick={() => window.print()}>
              Afdrukken of opslaan als pdf
            </button>
          </>
        )}
      </Kopvlak>

      <div className="pagina">
        <main className={stap === 0 || stap === 4 ? "kaart over-rand" : "kaart"}>
          {stap === 0 && <Start onStart={() => naarStap(1)} />}

          {stap > 0 && stap < 4 && (
            <>
              <ol className="voortgang" aria-label="Voortgang">
                {STAPPEN.map((naam, i) => (
                  <li
                    key={naam}
                    aria-current={i + 1 === stap ? "step" : undefined}
                    className={i + 1 < stap || stap === STAPPEN.length ? "klaar" : undefined}
                  >
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
                  <p>
                    {Object.keys(zichtbareFouten).length === 1 ? "Eén vraag is nog niet goed ingevuld:" : `${Object.keys(zichtbareFouten).length} vragen zijn nog niet goed ingevuld:`}
                  </p>
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
          {stap === 2 && <StapWoning f={f} zet={zet} fouten={zichtbareFouten} />}
          {stap === 3 && <StapWerk f={f} zet={zet} fouten={zichtbareFouten} />}
          {stap === 4 && (
            <Uitkomst
              f={f}
              bewaardeUren={schuif?.sleutel === schuifSleutel(f) ? schuif.uren : undefined}
              onUren={(uren) => setSchuif({ sleutel: schuifSleutel(f), uren })}
            />
          )}

          {stap > 0 && (
            <div className="knoppen">
              {stap < 4 && (
                <button type="button" className="hoofdknop" onClick={verder}>
                  {stap === 3 ? "Bereken wat ik overhoud" : "Volgende stap"}
                </button>
              )}
              <button type="button" className="tweedeknop" onClick={() => { setFouten({}); naarStap(stap - 1); }}>
                {stap === 4 ? "Gegevens aanpassen" : "Vorige stap"}
              </button>
              {!wissen ? (
                <button type="button" className="stilleknop" onClick={() => setWissen(true)}>
                  Opnieuw beginnen
                </button>
              ) : (
                <div className="wissen" role="group" aria-label="Opnieuw beginnen">
                  <p>Alles wat u heeft ingevuld wordt gewist. Weet u het zeker?</p>
                  <button
                    type="button"
                    className="hoofdknop"
                    onClick={() => {
                      setF(leegFormulier);
                      setFouten({});
                      setWissen(false);
                      naarStap(0);
                    }}
                  >
                    Ja, alles wissen
                  </button>
                  <button type="button" className="tweedeknop" onClick={() => setWissen(false)}>
                    Nee, ga terug
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="voet">
          {stap === 0 && (
            <p>Deze rekenhulp is voor inwoners van Leiden van 21 jaar tot de AOW-leeftijd met algemene bijstand, ook als u geen vast adres heeft.</p>
          )}
          <p>
            Wat u op deze website invult, blijft op uw eigen telefoon of computer. Het wordt niet verstuurd en niet bewaard. Sluit u de pagina,
            dan is alles weg.
          </p>
          <p>
            Leidenwerkt biedt een schatting om u inzicht te geven. Wat u echt krijgt, bepalen de gemeente Leiden en Dienst Toeslagen.
            Leidenwerkt is geen product van de gemeente.
          </p>
          <p>
            Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI. Iedereen kan de{" "}
            <a href="https://github.com/ISVISVISV/Rekenhulp" rel="noopener noreferrer">
              broncode
            </a>{" "}
            bekijken en gebruiken (licentie EUPL-1.2). Versie {__VERSIE__}.
          </p>
        </footer>
      </div>
    </>
  );
}

function Start({ onStart }: { onStart: () => void }) {
  return (
    <section className="start">
      <p className="inleiding">Met deze rekenhulp ziet u wat werk betekent voor uw bijstand, uw toeslagen en wat u per maand overhoudt.</p>
      <p>U heeft nodig:</p>
      <ul>
        <li>het loon en het aantal uren van het werk dat u overweegt</li>
        <li>werkt u al? Dan ook het loon en de uren van dat werk</li>
        <li>werkt uw partner? Dan het bruto loon van uw partner</li>
        <li>krijgt u of uw partner een uitkering, alimentatie of ander inkomen? Dan het bedrag per maand</li>
        <li>uw kale huur of kostgeld per maand</li>
        <li>wonen er volwassenen bij u, of kinderen van 18 jaar of ouder? Dan hun inkomen per jaar</li>
        <li>Gaat uw kind naar de opvang terwijl u werkt? Vul dan in hoeveel uur per week dit is. Weet u de prijs per uur? Vul die dan ook in.</li>
      </ul>
      <button type="button" className="hoofdknop" onClick={onStart}>
        Begin met rekenen
      </button>
    </section>
  );
}

/** De tekst van de vraag bij een veld of keuze, voor de foutensamenvatting. */
function vraagVan(id: string): string {
  if (typeof document === "undefined") return "";
  const label = document.querySelector(`label[for="${id}"]`)?.textContent;
  if (label) return label.trim().replace(/[?:]$/, "");
  const legend = document.querySelector(`input[name="${id}"]`)?.closest("fieldset")?.querySelector("legend")?.textContent;
  return legend ? legend.trim().replace(/[?:]$/, "") : "";
}

/** Brengt de focus naar de vraag bij een foutmelding: het veld, of de eerste keuze van de groep. */
function naarVraag(id: string) {
  const doel =
    document.getElementById(id) ??
    [...document.querySelectorAll<HTMLInputElement>("input[name]")].find((el) => el.name.toLowerCase() === id.toLowerCase());
  doel?.focus();
  doel?.scrollIntoView({ block: "center" });
}
