import { useEffect, useRef, useState, type ReactNode } from "react";
import { CITATEN, Lezer, euro, standaardRegels, type Opvangsoort } from "@leidenwerkt/engine";
import { Bron } from "./Bron.tsx";
import { alleenCijfers, controleer, datumInvoer, heeftOpvang, leeftijdOp, leegFormulier, maxUurprijs, nieuwKind, schuifSleutel, vandaag, vraagBewoners, vraagInkomenAnderen, vraagInkomenKind, bijIemandAnders, vraagWoonlasten, vraagJongeHuisgenoten, type Fouten, type Formulier, type JaNeeVraag, type Geboortedatum } from "./formulier.ts";
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
    <div className="pagina">
      <header className="kopregel">
        <p className="merk">Leidenwerkt</p>
        <p className="kopregel-tekst">Gratis rekenhulp voor Leidenaren met bijstand</p>
      </header>

      <main>
        {stap === 0 && <Start onStart={() => naarStap(1)} />}

        {stap > 0 && (
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
            {stap === 4 && (
              <button type="button" className="tweedeknop" onClick={() => window.print()}>
                Afdrukken
              </button>
            )}
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
          Uw gegevens blijven op uw eigen apparaat. Er wordt niets opgeslagen of verstuurd.
        </p>
        <p>
          Dit is een inschatting om u inzicht te geven. Wat u echt krijgt, bepalen de gemeente Leiden en Dienst Toeslagen.
          Leidenwerkt is geen product van de gemeente. De broncode is open (EUPL-1.2).
        </p>
        <p>Leidenwerkt is gemaakt door Ian Vriend, met hulp van AI. Versie {__VERSIE__}.</p>
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
        <li>het loon en het aantal uren van het werk dat u overweegt</li>
        <li>werkt u al? Dan ook het loon en de uren van dat werk</li>
        <li>werkt uw partner? Dan het bruto loon van uw partner</li>
        <li>krijgt u of uw partner een uitkering, alimentatie of ander inkomen? Dan het bedrag per maand</li>
        <li>uw kale huur of kostgeld per maand</li>
        <li>wonen er volwassenen bij u, of kinderen van 18 jaar of ouder? Dan hun inkomen per jaar</li>
        <li>gaan uw kinderen naar de opvang? Dan het aantal uren per week, en de prijs per uur als u die weet</li>
      </ul>
      <button type="button" className="hoofdknop" onClick={onStart}>
        Begin met rekenen
      </button>
    </section>
  );
}

/** Hoogste uurprijs voor de toeslag, als tekst ("11,23"), of leeg als die voor vandaag niet bekend is. */
const maxPrijsTekst = (soort: Opvangsoort) => {
  const p = maxUurprijs(new Lezer(standaardRegels, vandaag()), soort);
  return p > 0 ? p.toFixed(2).replace(".", ",") : "";
};

/** De tekst van de vraag bij een veld of keuze, voor de foutensamenvatting. */
function vraagVan(id: string): string {
  if (typeof document === "undefined") return "";
  const label = document.querySelector(`label[for="${id}"]`)?.textContent;
  if (label) return label.trim().replace(/[?:]$/, "");
  const legend = document.querySelector(`input[name="${id}"]`)?.closest("fieldset")?.querySelector("legend")?.textContent;
  return legend ? legend.trim().replace(/[?:]$/, "") : "";
}

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

/** Vrijstelling voor het inkomen van een kind jonger dan 23 (huurtoeslag), als tekst. */

/** Brengt de focus naar de vraag bij een foutmelding: het veld, of de eerste keuze van de groep. */
function naarVraag(id: string) {
  const doel =
    document.getElementById(id) ??
    [...document.querySelectorAll<HTMLInputElement>("input[name]")].find((el) => el.name.toLowerCase() === id.toLowerCase());
  doel?.focus();
  doel?.scrollIntoView({ block: "center" });
}

/** De overgangsvraag heeft pas zin als de bijstandsnormen voor vandaag bekend zijn. */
const normenBekend = () => new Lezer(standaardRegels, vandaag()).bestaat("pw.norm.alleenstaande");

type StapProps = { f: Formulier; zet: <K extends keyof Formulier>(k: K, v: Formulier[K]) => void; fouten: Fouten };

/** Knop "i" die uitleg toont of verbergt. De uitleg blijft staan tot de gebruiker hem weer sluit. */
function InfoKnop({ open, onToggle, controls, onderwerp }: { open: boolean; onToggle: () => void; controls: string; onderwerp: string }) {
  return (
    <button
      type="button"
      className="info-knop"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) onToggle();
      }}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="22" height="22">
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="7.6" r="1.35" fill="currentColor" />
        <rect x="10.9" y="10.4" width="2.2" height="7.2" rx="1.1" fill="currentColor" />
      </svg>
      <span className="sr">{open ? `Uitleg verbergen: ${onderwerp}` : `Uitleg: ${onderwerp}`}</span>
    </button>
  );
}

function Veld(props: {
  id: string;
  label: string;
  hint?: ReactNode;
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
  const [uitleg, setUitleg] = useState(false);
  const hintId = props.hint ? `${props.id}-hint` : undefined;
  const foutId = props.fout ? `${props.id}-fout` : undefined;
  return (
    <div className={`veld${props.fout ? " fout" : ""}`}>
      <div className="label-rij">
        <label htmlFor={props.id}>{props.label}</label>
        {props.hint && <InfoKnop open={uitleg} onToggle={() => setUitleg(!uitleg)} controls={hintId!} onderwerp={props.label} />}
      </div>
      {props.hint && (
        <div className="hint" id={hintId} hidden={!uitleg}>
          {props.hint}
        </div>
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
          aria-describedby={[uitleg ? hintId : undefined, foutId].filter(Boolean).join(" ") || undefined}
          onChange={(e) => props.onChange(alleenCijfers(e.target.value, soort))}
          />
        </span>
        {props.achtervoegsel && <span>{props.achtervoegsel}</span>}
      </div>
    </div>
  );
}

/**
 * Geboortedatum in één vak: dag-maand-jaar. Wie alleen cijfers typt, krijgt de
 * streepjes vanzelf.
 */
function Datum(props: {
  id: string;
  legend: string;
  waarde: Geboortedatum;
  onChange: (v: Geboortedatum) => void;
  fout?: string;
  /** Geboortedatum van een kind: het voorbeeld past bij een kind. */
  kind?: boolean;
  /** De datum van de gebruiker zelf: de browser mag hem dan invullen. */
  eigen?: boolean;
}) {
  const foutId = `${props.id}-fout`;
  return (
    <div className={`veld${props.fout ? " fout" : ""}`}>
      <div className="label-rij">
        <label htmlFor={props.id}>{props.legend}</label>
      </div>
      {props.fout && (
        <p className="foutmelding" id={foutId}>
          {props.fout}
        </p>
      )}
      <div className="invoer">
        <span className="vak">
          <input
            id={props.id}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder={`bijv. ${props.kind ? "14-03-2018" : "14-03-1990"}`}
            autoComplete={props.eigen ? "bday" : "off"}
            className="datum"
            value={props.waarde}
            aria-invalid={props.fout ? true : undefined}
            aria-describedby={props.fout ? foutId : undefined}
            onChange={(e) => props.onChange(datumInvoer(e.target.value, props.waarde))}
          />
        </span>
      </div>
    </div>
  );
}

function Keuze<T extends string>(props: {
  naam: string;
  legend: string;
  hint?: ReactNode;
  fout?: string;
  opties: [T, string][];
  waarde: T;
  onChange: (v: T) => void;
}) {
  const [uitleg, setUitleg] = useState(false);
  const hintId = `${props.naam}-hint`;
  const foutId = `${props.naam}-fout`;
  return (
    <fieldset
      className={`keuze${props.fout ? " fout" : ""}`}
      aria-describedby={[props.hint && uitleg ? hintId : "", props.fout ? foutId : ""].filter(Boolean).join(" ") || undefined}
    >
      {props.hint ? (
        <>
          {/* De naam van de groep blijft de vraag zelf; zichtbaar staat de i-knop direct achter het laatste woord. */}
          <legend className="visueel-verborgen">{props.legend}</legend>
          <div className="vraag-rij">
            <span className="vraag-tekst" aria-hidden="true">
              {props.legend}
            </span>
            <InfoKnop open={uitleg} onToggle={() => setUitleg(!uitleg)} controls={hintId} onderwerp={props.legend} />
          </div>
        </>
      ) : (
        <legend>{props.legend}</legend>
      )}
      {props.hint && (
        <div className="hint" id={hintId} hidden={!uitleg}>
          {props.hint}
        </div>
      )}
      {props.fout && (
        <p className="foutmelding" id={foutId}>
          {props.fout}
        </p>
      )}
      {props.opties.map(([w, tekst]) => (
        <label key={w} className="optie">
          <input
            type="radio"
            name={props.naam}
            checked={props.waarde === w}
            aria-invalid={props.fout ? true : undefined}
            onChange={() => props.onChange(w)}
          />
          <span>{tekst}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** Een ja/nee-vraag heeft geen antwoord vooraf; pas na een keuze telt de waarde als beantwoord. */
const antwoordHulp =
  (f: Formulier, zet: StapProps["zet"]) =>
  (vraag: JaNeeVraag, fn: (v: string) => void) =>
  (v: string) => {
    zet("beantwoord", { ...f.beantwoord, [vraag]: true });
    fn(v);
  };

function StapHuishouden({ f, zet, fouten }: StapProps) {
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
          <legend>Kinderen die bij u wonen</legend>
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
                    voorbeeld="bijv. 10,50"
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
          <label className="vinkje">
            <input type="checkbox" checked={f.kinderalimentatieJa} onChange={(e) => zet("kinderalimentatieJa", e.target.checked)} />
            <span>{f.leefvorm === "paar" ? "Ik of mijn partner krijgt kinderalimentatie" : "Ik krijg kinderalimentatie"}</span>
          </label>
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

function StapWoning({ f, zet, fouten }: StapProps) {
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
                      Het bruto inkomen, zoals op de jaaropgave of de loonstrook van uw kind. Vul het hele bedrag in; de rekenhulp trekt zelf af
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
          ["uur", "Bruto loon per uur"],
        ]}
      />
      {per && (
        <Veld
          id={loonId}
          voorbeeld={per === "uur" ? "bijv. 15,00" : per === "week" ? "bijv. 420" : per === "netto" ? "bijv. 1.300" : per === "nettoweek" ? "bijv. 350" : "bijv. 1.800"}
          label={
            (per === "uur"
              ? "Bedrag per uur"
              : per === "week"
                ? "Bruto loon per week"
                : per === "netto"
                  ? "Netto loon per maand"
                  : per === "nettoweek"
                    ? "Netto loon per week"
                    : "Bruto loon per maand") + voor
          }
          hint={
            per === "uur"
              ? "Het bruto loon per uur. Staat in de vacature of het contract. 'Bruto' is het bedrag vóór belasting."
              : per === "netto" || per === "nettoweek"
                ? `Het bedrag dat u ${per === "netto" ? "elke maand" : "elke week"} op uw rekening krijgt, zonder vakantiegeld. Staat onderaan op de loonstrook. De rekenhulp telt het vakantiegeld zelf mee.${per === "nettoweek" ? " Krijgt u elke 4 weken loon? Deel het bedrag dan door 4." : ""}`
                : `Neem het loon uit uw contract of van uw loonstrook, zonder vakantiegeld. De rekenhulp telt het vakantiegeld zelf mee. 'Bruto' is het bedrag vóór belasting.${per === "week" ? " Krijgt u elke 4 weken loon? Deel het bedrag dan door 4." : ""}`
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

function StapWerk({ f, zet, fouten }: StapProps) {
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
        <fieldset className="groep">
          <legend>Uw werk nu</legend>
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
          <h2>{!f.werktNu ? "Het werk dat u overweegt" : f.verandering === "erbij" ? "Het extra werk" : "Het nieuwe werk"}</h2>
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
