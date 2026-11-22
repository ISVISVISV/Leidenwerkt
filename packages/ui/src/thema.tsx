/**
 * Knop voor licht en donker. Zonder keuze volgt de pagina de instelling van het apparaat.
 * De keuze staat in localStorage ("thema"), zodat hij ook geldt op de andere pagina's van de rekenhulp.
 * Dat is alleen een voorkeur voor de weergave, geen gegeven dat iemand invult.
 */
import { useEffect, useState } from "react";

const SLEUTEL = "thema";
type Thema = "licht" | "donker";

const apparaat = (): Thema => (typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches ? "donker" : "licht");
const huidig = (): Thema => {
  const t = typeof document !== "undefined" ? document.documentElement.dataset.thema : undefined;
  return t === "licht" || t === "donker" ? t : apparaat();
};

export function ThemaKnop() {
  const [thema, setThema] = useState<Thema>("licht");
  useEffect(() => setThema(huidig()), []);
  const wissel = () => {
    const nieuw: Thema = huidig() === "donker" ? "licht" : "donker";
    document.documentElement.dataset.thema = nieuw;
    try {
      localStorage.setItem(SLEUTEL, nieuw);
    } catch {
      /* Zonder opslag werkt de knop alleen op deze pagina. */
    }
    setThema(nieuw);
  };
  return (
    <button type="button" className="thema-knop" aria-pressed={thema === "donker"} aria-label="Donkere modus" onClick={wissel}>
      {thema === "donker" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  );
}
