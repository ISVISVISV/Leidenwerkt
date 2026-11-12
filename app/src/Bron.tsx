import { useEffect, useId, useRef, useState } from "react";
import type { Citaat } from "@leidenwerkt/engine";

/**
 * Bronvermelding met de letterlijke tekst in een pop-up.
 * De bronnaam is een knop: klikken, tikken of Enter opent de tekst. Escape,
 * de knop Sluiten of klikken buiten de pop-up sluit hem; de focus gaat dan
 * terug naar de bronnaam. Onderaan staat de link naar de officiële bron.
 */
export function Bron({ citaat, label }: { citaat: Citaat; label?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const sluit = () => {
    setOpen(false);
    ref.current?.querySelector<HTMLButtonElement>(".bron-knop")?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") sluit();
    };
    const buiten = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", esc);
    document.addEventListener("pointerdown", buiten);
    return () => {
      document.removeEventListener("keydown", esc);
      document.removeEventListener("pointerdown", buiten);
    };
  }, [open]);

  const domein = (() => {
    try {
      return new URL(citaat.url).hostname.replace(/^www\./, "");
    } catch {
      return "de officiële bron";
    }
  })();

  return (
    <span className={`bron${open ? " open" : ""}`} ref={ref}>
      <button type="button" className="bron-knop" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {label ?? citaat.titel}
      </button>
      <span className="bron-tekst" id={id}>
        <strong>{citaat.titel}</strong> <span className="bron-versie">({citaat.versie})</span>
        <span className="bron-citaat">“{citaat.tekst}”</span>
        <a className="bron-link" href={citaat.url} target="_blank" rel="noreferrer noopener">
          Lees verder op {domein}
        </a>
        <button
          type="button"
          className="bron-sluit"
          onClick={sluit}
        >
          Sluiten
        </button>
      </span>
    </span>
  );
}
