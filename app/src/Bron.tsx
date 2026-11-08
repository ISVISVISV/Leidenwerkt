import { useEffect, useId, useRef, useState } from "react";
import type { Citaat } from "@leidenwerkt/engine";

/**
 * Bronvermelding met de letterlijke wettekst in een pop-up.
 * De pop-up verschijnt bij aanwijzen en bij focus, blijft staan zolang de
 * muis erop staat, en sluit met Escape (WCAG 1.4.13). Met de knop blijft hij
 * open, ook op een telefoon.
 */
export function Bron({ citaat, label }: { citaat: Citaat; label?: string }) {
  const id = useId();
  const [vast, setVast] = useState(false);
  const [weg, setWeg] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVast(false);
        setWeg(true);
      }
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  return (
    <span
      className={`bron${vast ? " open" : ""}${weg ? " weg" : ""}`}
      ref={ref}
      onMouseLeave={() => setWeg(false)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setWeg(false);
      }}
    >
      <a href={citaat.url} target="_blank" rel="noreferrer noopener" aria-describedby={id}>
        {label ?? citaat.titel}
      </a>
      <button type="button" className="bron-knop" aria-expanded={vast} aria-controls={id} onClick={() => setVast(!vast)}>
        <span aria-hidden="true">§</span>
        <span className="sr">{vast ? "Wettekst verbergen" : "Wettekst tonen"}</span>
      </button>
      <span className="bron-tekst" role="tooltip" id={id}>
        <strong>{citaat.titel}</strong> <span className="bron-versie">({citaat.versie})</span>
        <span className="bron-citaat">“{citaat.tekst}”</span>
      </span>
    </span>
  );
}
