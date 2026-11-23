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
import { CONTACT, GOEDE_BUUR } from "./contact.ts";
import { Icoon, Pasje, Sleutels } from "./iconen.tsx";

const GROEPEN: { kans: Kans; kop: string; uitleg: string }[] = [
  { kans: "ja", kop: "Dit kunt u waarschijnlijk krijgen", uitleg: "Vraag het aan. Daarna beslist de organisatie die de regeling geeft." },
  { kans: "misschien", kop: "Dit kunt u misschien krijgen", uitleg: "Leidengeldwijzer weet het niet zeker. Bij elke regeling staat waarom." },
  { kans: "nee", kop: "Dit kunt u waarschijnlijk niet krijgen", uitleg: "Bij elke regeling staat waarom niet." },
];
const HULP = { kop: "Hulp nodig?" };

/**
 * De regelingen die u via de Sleutelpas krijgt: Kindtegoed, laptop en zwemles (Beleidsregels Sleutelpas 2026, hoofdstuk 2 en art. 3.2 en 3.3).
 * Het Volwassenenfonds staat er bewust niet bij. De beleidsregels zetten het tegoed wel op de Sleutelpas (art. 3.4 d),
 * maar u vraagt het aan via een tussenpersoon. De pagina van de gemeente noemt de Sleutelpas daarbij niet.
 */
const OP_DE_PAS = ["kindtegoed", "laptop", "zwemles"];

type Blok = "sleutelpas" | "gemeente" | "svb" | "uwv" | "toeslagen";
/** De volgorde van de blokken: eerst Leiden (met de Sleutelpas erin), dan het Rijk. */
const BLOKKEN: { blok: Exclude<Blok, "sleutelpas">; kop: string }[] = [
  { blok: "gemeente", kop: "Gemeente Leiden" },
  { blok: "svb", kop: "Sociale Verzekeringsbank" },
  { blok: "uwv", kop: "UWV" },
  { blok: "toeslagen", kop: "Dienst Toeslagen" },
];

function blokVan(u: Uitslag, pasInGroep: boolean): Blok {
  if (u.id === "sleutelpas" || (pasInGroep && OP_DE_PAS.includes(u.id))) return "sleutelpas";
  if (u.groep === "toeslagen") return "toeslagen";
  if (u.groep === "svb") return "svb";
  if (u.groep === "uwv") return "uwv";
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
      <div className="overzicht-raster">
        {GROEPEN.map((g) => {
          const lijst = uitslagen.filter((u) => u.kans === g.kans);
          if (lijst.length === 0) return null;
          const pasInGroep = lijst.some((u) => u.id === "sleutelpas");
          const kop = (
            <h2 className="kans-kop">
              <KansTeken kans={g.kans} />
              <span>
                {g.kop} ({lijst.length})
              </span>
            </h2>
          );
          // De Sleutelpas is van de gemeente: het pas-blok staat binnen het blok van de gemeente Leiden, bovenaan.
          const blokken = BLOKKEN.map(({ blok, kop: blokKop }) => {
            const inBlok = lijst.filter((u) => blokVan(u, pasInGroep) === blok);
            const pasBlok = blok === "gemeente" ? lijst.filter((u) => blokVan(u, pasInGroep) === "sleutelpas") : [];
            if (inBlok.length === 0 && pasBlok.length === 0) return null;
            const pas = pasBlok.find((u) => u.id === "sleutelpas");
            const opPas = pasBlok.filter((u) => u.id !== "sleutelpas");
            return (
              <section key={blok} className={`blok ${blok}`}>
                <h3 className="blok-kop">
                  {blok === "gemeente" && <Sleutels />}
                  {blokKop}
                </h3>
                {pas && (
                  <div className="pas-blok">
                    <PasTegel u={pas} onOpen={() => toon(pas)} />
                    {opPas.length > 0 && (
                      <>
                        <p className="blok-uitleg">Deze regelingen horen bij de Sleutelpas.</p>
                        <ul className="tegels">{opPas.map(tegel)}</ul>
                      </>
                    )}
                  </div>
                )}
                {inBlok.length > 0 && <ul className="tegels">{inBlok.map(tegel)}</ul>}
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
            </div>
            <div className="groep-inhoud">
              <div className="blok">
                <ul className="tegels een">{hulp.map(tegel)}</ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="opnieuw niet-print">Verandert uw situatie? Doe de check dan opnieuw.</p>

      <Afdruk f={f} uitslagen={uitslagen} />

      <dialog ref={venster} className="venster" aria-labelledby="venster-kop" onClose={gesloten}>
        {open && (
          <>
            <div className="venster-bovenkant">
              {open.id === "sleutelpas" ? (
                <Pasje />
              ) : (
                <span className={`tegel-icoon ${open.groep}`}>
                  <Icoon regeling={open.id} />
                </span>
              )}
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

/** Een teken bij de kop van een groep: een vinkje, een vraagteken of een kruis. Zo zie je meteen het verschil. */
function KansTeken({ kans }: { kans: Kans }) {
  return (
    <span className={`kans-teken ${kans}`} aria-hidden="true">
      <Icoon naam={kans === "ja" ? "vink" : kans === "misschien" ? "vraagteken" : "kruis"} />
    </span>
  );
}

/**
 * De afdruk: kort, voor een spreekuur of voor thuis. Welke regelingen, waar u ze aanvraagt,
 * waar u hulp krijgt en wat u heeft ingevuld. Geen uitleg, geen bronnen en geen webadressen: die heeft u op papier niet nodig.
 */
function Afdruk({ f, uitslagen }: { f: Formulier; uitslagen: Uitslag[] }) {
  const toeslagen = uitslagen.some((u) => u.groep === "toeslagen" && u.kans !== "nee");
  return (
    <section className="alleen-print afdruk" aria-label="Afdruk">
      <p className="afdruk-datum">
        Overzicht van {leesbareDatum(vandaag())}. Leidengeldwijzer versie {__VERSIE__}.
      </p>
      <div className="afdruk-kolommen">
        <div>
          {GROEPEN.map((g) => {
            const lijst = uitslagen.filter((u) => u.kans === g.kans);
            if (lijst.length === 0) return null;
            const kop = (
              <h2 className="kans-kop">
                <KansTeken kans={g.kans} />
                <span>
                  {g.kop} ({lijst.length})
                </span>
              </h2>
            );
            if (g.kans === "nee")
              return (
                <section key={g.kans} className="afdruk-groep nee">
                  {kop}
                  <p>{lijst.map((u) => u.naam).join(", ")}.</p>
                </section>
              );
            const pasInGroep = lijst.some((u) => u.id === "sleutelpas");
            return (
              <section key={g.kans} className={`afdruk-groep ${g.kans}`}>
                {kop}
                {BLOKKEN.map(({ blok, kop: blokKop }) => {
                  // Op papier ook: de Sleutelpas en wat erop staat bovenaan bij de gemeente, wat op de pas staat iets ingesprongen.
                  const pasBlok = blok === "gemeente" ? lijst.filter((u) => blokVan(u, pasInGroep) === "sleutelpas") : [];
                  const inBlok = [...pasBlok, ...lijst.filter((u) => blokVan(u, pasInGroep) === blok)];
                  if (inBlok.length === 0) return null;
                  return (
                    <div key={blok} className={`afdruk-blok ${blok}`}>
                      <h3>{blokKop}</h3>
                      <ul>
                        {inBlok.map((u) => (
                          <li key={u.id} className={pasBlok.includes(u) && u.id !== "sleutelpas" ? "op-pas" : undefined}>
                            <span className="afdruk-naam">{u.naam}</span>
                            {u.bedrag && <span className="afdruk-bedrag">{u.bedrag}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>

        <section className="afdruk-contact">
          <h2>Hulp en contact</h2>
          <h3>{GOEDE_BUUR.naam}</h3>
          <p>{GOEDE_BUUR.uitleg}</p>
          <ul className="afdruk-tijden">
            {GOEDE_BUUR.tijden.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p>{GOEDE_BUUR.waar}</p>
          <ul className="afdruk-plekken">
            {GOEDE_BUUR.plekken.map(([plek, adres]) => (
              <li key={plek}>
                {plek}, {adres}
              </li>
            ))}
          </ul>
          <p>{GOEDE_BUUR.bellen}</p>
          {CONTACT.filter((c) => c.naam !== "Dienst Toeslagen" || toeslagen).map((c) => (
            <div key={c.naam}>
              <h3>{c.naam}</h3>
              {c.regels.map((r) => (
                <p key={r}>{r}</p>
              ))}
            </div>
          ))}
        </section>
      </div>

      <section className="gegevens">
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
    </section>
  );
}
