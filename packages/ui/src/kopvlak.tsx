/**
 * Het rode vlak boven aan de tools, in dezelfde stijl als de startpagina.
 * Laag: alleen een balk met de naam en de knop voor licht en donker. Dat is voor de vragen, zodat er weinig afleiding is.
 * Groot: ook een kop, een korte tekst en de lijntekening van Leiden. Dat is voor de eerste pagina en de uitkomst.
 * De molen draait en het water golft, net als op de startpagina (stijl.css). Niet bij "minder beweging".
 */
import type { ReactNode } from "react";
import { SKYLINE } from "./skyline.ts";
import { ThemaKnop } from "./thema.tsx";

/** Twee gekruiste sleutels, zoals in het wapen van Leiden. Eigen tekening. */
function Sleutels() {
  const sleutel = (
    <>
      <circle cx="0" cy="13" r="5.5" fill="none" strokeWidth="3.2" />
      <path d="M0 7.5V-17" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M0-16.5h-6v4h3M0-10.5h-5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
  return (
    <svg viewBox="-21 -22 42 44" width="24" height="25" stroke="currentColor" aria-hidden="true" focusable="false">
      <g transform="rotate(-40)">{sleutel}</g>
      <g transform="scale(-1 1) rotate(-40)">{sleutel}</g>
    </svg>
  );
}

export function Kopvlak({ tool, groot = false, breed = false, children }: { tool: string; groot?: boolean; breed?: boolean; children?: ReactNode }) {
  return (
    <header className={`kopvlak${groot ? " groot" : ""}${breed ? " breed" : ""}`}>
      <div className="kopvlak-binnen">
        <div className="kopvlak-rij">
          <a className="kopvlak-merk" href="../">
            <Sleutels />
            Rekenhulp voor Leidenaren
          </a>
          <span className="kopvlak-naam">{tool}</span>
          <ThemaKnop />
        </div>
        {groot && children}
      </div>
      {groot && <div className="kopvlak-stad" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SKYLINE }} />}
    </header>
  );
}
