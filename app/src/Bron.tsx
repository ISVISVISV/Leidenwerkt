import { useEffect, useId, useRef, useState } from "react";
import type { Citaat } from "@leidenwerkt/engine";

/**
 * Bronvermelding met de letterlijke tekst in een pop-up.
 * De bronnaam is zelf de knop: aanwijzen, focus (Tab) of tikken toont de
 * tekst. De pop-up blijft staan zolang de muis erop staat en sluit met Escape
 * (WCAG 1.4.13). Onderaan staat de link naar de officiële bron.
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
    const buiten = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setVast(false);
    };
    document.addEventListener("keydown", esc);
    document.addEventListener("pointerdown", buiten);
    return () => {
      document.removeEventListener("keydown", esc);
      document.removeEventListener("pointerdown", buiten);
    };
  }, []);

  const domein = (() => {
    try {
      return new URL(citaat.url).hostname.replace(/^www\./, "");
    } catch {
      return "de officiële bron";
    }
  })();

  return (
    <span
      className={`bron${vast ? " open" : ""}${weg ? " weg" : ""}`}
      ref={ref}
      onMouseLeave={() => setWeg(false)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) {
          setWeg(false);
          setVast(false);
        }
      }}
    >
      <button type="button" className="bron-knop" aria-expanded={vast} aria-controls={id} onClick={() => setVast(!vast)}>
        {label ?? citaat.titel}
      </button>
      <span className="bron-tekst" id={id}>
        <strong>{citaat.titel}</strong> <span className="bron-versie">({citaat.versie})</span>
        <span className="bron-citaat">“{citaat.tekst}”</span>
        <a className="bron-link" href={citaat.url} target="_blank" rel="noreferrer noopener">
          Lees verder op {domein}
        </a>
      </span>
    </span>
  );
}
