/**
 * Het overzicht: per kans een groep, per aanbieder een blok, per regeling een tegel.
 * Een tegel toont naam en bedrag. Een klik opent een venster met de uitleg, de aanvraag en de bronnen.
 * Zo blijft het overzicht kort en hoeft niemand van de pagina af.
 *
 * Op papier is er geen venster: dan staat bij elke regeling de hele uitleg, met wat iemand heeft ingevuld.
 */
import { useEffect, useRef, useState } from "react";
import { checkRegelingen, type Kans, type Uitslag } from "@leidenwerkt/engine";
import { Bron } from "@leidenwerkt/ui";
import { ingevuld, naarInvoer, vandaag, type Formulier } from "./formulier.ts";
import { Icoon, Pasje } from "./iconen.tsx";

const GROEPEN: { kans: Kans; kop: string; uitleg: string }[] = [
  { kans: "ja", kop: "Dit kunt u waarschijnlijk krijgen", uitleg: "Vraag het aan. Daarna beslist de gemeente of Dienst Toeslagen." },
  { kans: "misschien", kop: "Dit kunt u misschien krijgen", uitleg: "Leidengeldwijzer weet het niet zeker. Bij elke regeling staat waarom." },
  { kans: "nee", kop: "Dit kunt u waarschijnlijk niet krijgen", uitleg: "Bij elke regeling staat waarom niet." },
];
const HULP = { kop: "Hulp nodig?", uitleg: "Deze hulp is er voor alle Leidenaren." };

/** De regelingen die op de Sleutelpas staan. */
const OP_DE_PAS = ["kindtegoed", "laptop", "zwemles", "volwassenenfonds"];

type Blok = "sleutelpas" | "gemeente" | "svb" | "toeslagen";
/** De volgorde van de blokken: eerst Leiden, dan het Rijk. */
const BLOKKEN: { blok: Blok; kop: string }[] = [
  { blok: "sleutelpas", kop: "Sleutelpas" },
  { blok: "gemeente", kop: "Gemeente Leiden" },
  { blok: "svb", kop: "Sociale Verzekeringsbank" },
  { blok: "toeslagen", kop: "Dienst Toeslagen" },
];

function blokVan(u: Uitslag, pasInGroep: boolean): Blok {
  if (u.id === "sleutelpas" || (pasInGroep && OP_DE_PAS.includes(u.id))) return "sleutelpas";
  if (u.groep === "toeslagen") return "toeslagen";
  if (u.groep === "svb") return "svb";
  return "gemeente";
}

const leesbareDatum = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export function Overzicht({ f }: { f: Formulier }) {
  const uitslagen = checkRegelingen(naarInvoer(f));
  const [open, setOpen] = useState<Uitslag | null>(null);
  const venster = useRef<HTMLDialogElement>(null);

  // Op papier staat alles: ook de dichtgeklapte groep gaat open.
  useEffect(() => {
    const openAlles = () => document.querySelectorAll<HTMLDetailsElement>(".overzicht details").forEach((d) => (d.open = true));
    window.addEventListener("beforeprint", openAlles);
    return () => window.removeEventListener("beforeprint", openAlles);
  }, []);

  // Het venster staat in de geschiedenis: de terugknop van de browser of telefoon sluit het.
  useEffect(() => {
    const terug = () => {
      if (!history.state?.venster) venster.current?.close();
    };
    window.addEventListener("popstate", terug);
    return () => window.removeEventListener("popstate", terug);
  }, []);
  useEffect(() => {
    if (open && venster.current && !venster.current.open) venster.current.showModal();
  }, [open]);

  const toon = (u: Uitslag) => {
    history.pushState({ ...history.state, venster: u.id }, "");
    setOpen(u);
  };
  const gesloten = () => {
    if (history.state?.venster) history.back();
    setOpen(null);
  };

  const tegel = (u: Uitslag) => <Tegel key={u.id} u={u} onOpen={() => toon(u)} />;
  const hulp = uitslagen.filter((u) => u.kans === "info");

  return (
    <section className="overzicht">
      <p className="alleen-print afdruk-datum">
        Overzicht van {leesbareDatum(vandaag())}. Leidengeldwijzer versie {__VERSIE__}.
      </p>
      <div className="overzicht-begin">
        <p className="inleiding">
          Dit overzicht is een schatting. Leidengeldwijzer gebruikt alleen wat u heeft ingevuld. Leidengeldwijzer bewaart niets. Wilt u het overzicht
          houden? Druk het dan af. Of sla het op als pdf.
        </p>
        <button type="button" className="tweedeknop printknop niet-print" onClick={() => window.print()}>
          <Icoon naam="print" /> Afdrukken of opslaan als pdf
        </button>
      </div>

      <div className="overzicht-raster">
        {GROEPEN.map((g) => {
          const lijst = uitslagen.filter((u) => u.kans === g.kans);
          if (lijst.length === 0) return null;
          const pasInGroep = lijst.some((u) => u.id === "sleutelpas");
          const kop = (
            <h2>
              {g.kop} ({lijst.length})
            </h2>
          );
          const blokken = BLOKKEN.map(({ blok, kop: blokKop }) => {
            const inBlok = lijst.filter((u) => blokVan(u, pasInGroep) === blok);
            if (inBlok.length === 0) return null;
            if (blok === "sleutelpas") {
              const pas = inBlok.find((u) => u.id === "sleutelpas")!;
              const opPas = inBlok.filter((u) => u.id !== "sleutelpas");
              return (
                <section key={blok} className="blok blok-pas" aria-label={blokKop}>
                  <PasTegel u={pas} onOpen={() => toon(pas)} />
                  {opPas.length > 0 && (
                    <>
                      <p className="blok-uitleg">Deze regelingen horen bij de Sleutelpas.</p>
                      <ul className="tegels">{opPas.map(tegel)}</ul>
                    </>
                  )}
                </section>
              );
            }
            return (
              <section key={blok} className="blok">
                <h3 className="blok-kop">{blokKop}</h3>
                <ul className="tegels">{inBlok.map(tegel)}</ul>
              </section>
            );
          });
          if (g.kans === "nee")
            return (
              <details key={g.kans} className="groep nee">
                <summary>{kop}</summary>
                <p className="groep-uitleg">{g.uitleg}</p>
                <div className="blok">
                  <ul className="tegels">{lijst.map(tegel)}</ul>
                </div>
              </details>
            );
          return (
            <div key={g.kans} className={`groep ${g.kans}`}>
              <div className="groep-kop">
                {kop}
                <p className="groep-uitleg">{g.uitleg}</p>
              </div>
              <div className="groep-inhoud">{blokken}</div>
            </div>
          );
        })}

        {hulp.length > 0 && (
          <div className="groep info">
            <div className="groep-kop">
              <h2>{HULP.kop}</h2>
              <p className="groep-uitleg">{HULP.uitleg}</p>
            </div>
            <div className="groep-inhoud">
              <div className="blok">
                <ul className="tegels een">{hulp.map(tegel)}</ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="alleen-print gegevens" aria-label="Wat u heeft ingevuld">
        <h2>Wat u heeft ingevuld</h2>
        <div className="gegevens-kolommen">
          {ingevuld(f).map((blok) => (
            <div key={blok.kop}>
              <h3>{blok.kop}</h3>
              <dl>
                {blok.regels.map(([naam, waarde], i) => (
                  <div key={i}>
                    <dt>{naam}</dt>
                    <dd>{waarde}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <dialog ref={venster} className="venster" aria-labelledby="venster-kop" onClose={gesloten}>
        {open && (
          <>
            <div className="venster-bovenkant">
              <span className={`tegel-icoon ${open.groep}`}>{open.id === "sleutelpas" ? <Pasje /> : <Icoon regeling={open.id} />}</span>
              <h2 id="venster-kop">{open.naam}</h2>
              <button type="button" className="sluitknop" aria-label="Sluiten" onClick={() => venster.current?.close()}>
                <Icoon naam="kruis" />
              </button>
            </div>
            <Uitleg u={open} />
          </>
        )}
      </dialog>
    </section>
  );
}

/** Een regeling als tegel. De uitleg staat er onzichtbaar bij: voor de afdruk. */
function Tegel({ u, onOpen }: { u: Uitslag; onOpen: () => void }) {
  return (
    <li className={`regeling ${u.kans}`} data-id={u.id}>
      <button type="button" className="tegel" aria-haspopup="dialog" onClick={onOpen}>
        <span className={`tegel-icoon ${u.groep}`}>
          <Icoon regeling={u.id} />
        </span>
        <span className="tegel-tekst">
          <span className="regeling-naam">{u.naam}</span>
          {u.bedrag && <span className="bedrag">{u.bedrag}</span>}
        </span>
        <Icoon naam="pijl" />
      </button>
      <div className="regeling-afdruk">
        <Uitleg u={u} />
      </div>
    </li>
  );
}

/** De Sleutelpas zelf: de kop van het blok, met het pasje. */
function PasTegel({ u, onOpen }: { u: Uitslag; onOpen: () => void }) {
  return (
    <div className={`regeling pas-tegel ${u.kans}`} data-id={u.id}>
      <button type="button" className="tegel" aria-haspopup="dialog" onClick={onOpen}>
        <Pasje />
        <span className="tegel-tekst">
          <span className="regeling-naam">{u.naam}</span>
          <span className="pas-uitleg">Met de Sleutelpas krijgt u korting op sport, cultuur en uitjes.</span>
        </span>
        <Icoon naam="pijl" />
      </button>
      <div className="regeling-afdruk">
        <Uitleg u={u} />
      </div>
    </div>
  );
}

/** Wat er over een regeling te weten is: bedrag, waarom, aanvragen en bronnen. In het venster en op papier. */
function Uitleg({ u }: { u: Uitslag }) {
  return (
    <div className="uitleg">
      {u.bedrag && <p className="uitleg-bedrag">{u.bedrag}</p>}
      <p className="waarom">{u.waarom}</p>
      {u.aanvragen && u.kans !== "nee" && (
        <a className="aanvraag hoofdknop" href={u.aanvragen.url} target="_blank" rel="noopener noreferrer">
          {u.aanvragen.tekst}
          <span className="sr"> (opent in een nieuw venster)</span>
        </a>
      )}
      <details className="regeling-bronnen">
        <summary>{u.bronnen.length > 1 ? "Bronnen" : "Bron"}</summary>
        <p className="bron-blok">
          {u.bronnen.map((b) => (
            <span key={b.titel} className="bron-regel">
              <Bron citaat={b} />{" "}
            </span>
          ))}
        </p>
      </details>
    </div>
  );
}
