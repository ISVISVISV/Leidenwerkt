import { useEffect } from "react";
import { checkRegelingen, type Kans, type Uitslag } from "@leidenwerkt/engine";
import { Bron } from "@leidenwerkt/ui";
import { naarInvoer, type Formulier } from "./formulier.ts";

const GROEPEN: { kans: Kans; kop: string; uitleg: string }[] = [
  { kans: "ja", kop: "Dit kunt u waarschijnlijk krijgen", uitleg: "Vraag het aan. De gemeente of Dienst Toeslagen kijkt of u het echt krijgt." },
  { kans: "misschien", kop: "Dit kunt u misschien krijgen", uitleg: "Leidenrekent weet het niet zeker. Bij elke regeling staat waarom." },
  { kans: "nee", kop: "Dit kunt u waarschijnlijk niet krijgen", uitleg: "Bij elke regeling staat waarom niet." },
];

export function Overzicht({ f }: { f: Formulier }) {
  const uitslagen = checkRegelingen(naarInvoer(f));
  // Op papier staat alles: ook de dichtgeklapte groep gaat open.
  useEffect(() => {
    const open = () => document.querySelectorAll<HTMLDetailsElement>(".overzicht details").forEach((d) => (d.open = true));
    window.addEventListener("beforeprint", open);
    return () => window.removeEventListener("beforeprint", open);
  }, []);
  return (
    <section className="overzicht">
      <p className="inleiding">
        Dit overzicht is een schatting met wat u heeft ingevuld. Er wordt niets bewaard. Wilt u het overzicht houden? Druk het af of sla het
        op als pdf.
      </p>
      {GROEPEN.map((g) => {
        const lijst = uitslagen.filter((u) => u.kans === g.kans);
        if (lijst.length === 0) return null;
        const inhoud = (
          <>
            <p>{g.uitleg}</p>
            <ul className="regelingen">
              {lijst.map((u) => (
                <Regeling key={u.id} u={u} />
              ))}
            </ul>
          </>
        );
        return g.kans === "nee" ? (
          <details key={g.kans} className={`groep ${g.kans}`}>
            <summary>
              <h2>
                {g.kop} ({lijst.length})
              </h2>
            </summary>
            {inhoud}
          </details>
        ) : (
          <div key={g.kans} className={`groep ${g.kans}`}>
            <h2>
              {g.kop} ({lijst.length})
            </h2>
            {inhoud}
          </div>
        );
      })}
    </section>
  );
}

function Regeling({ u }: { u: Uitslag }) {
  return (
    <li className={`regeling ${u.kans}`} data-id={u.id}>
      <h3>{u.naam}</h3>
      {u.bedrag && <p className="bedrag">{u.bedrag}</p>}
      <p className="waarom">{u.waarom}</p>
      {u.aanvragen && u.kans !== "nee" && (
        <p>
          <a className="aanvraag" href={u.aanvragen.url} target="_blank" rel="noopener noreferrer">
            {u.aanvragen.tekst}
            <span className="sr"> (opent in een nieuw venster)</span>
          </a>
        </p>
      )}
      <p className="bron-blok">
        {u.bronnen.length > 1 ? "Bronnen: " : "Bron: "}
        {u.bronnen.map((b) => (
          <span key={b.titel} className="bron-regel">
            <Bron citaat={b} />
          </span>
        ))}
      </p>
    </li>
  );
}
