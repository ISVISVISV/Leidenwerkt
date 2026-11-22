/**
 * Eigen lijniconen bij de regelingen, getekend voor Leidengeldwijzer (geen bibliotheek, niets van buiten).
 * Alle iconen zijn decoratief: de naam van de regeling staat er altijd naast.
 */
import type { ReactNode } from "react";

const PADEN: Record<string, ReactNode> = {
  kind: (
    <>
      <circle cx="12" cy="6" r="3" />
      <path d="M8 21v-6l-2-4h12l-2 4v6" />
    </>
  ),
  laptop: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1" />
      <path d="M2 19h20" />
    </>
  ),
  zwem: (
    <>
      <path d="M2 16c2 0 2 1.5 4 1.5S8 16 10 16s2 1.5 4 1.5S16 16 18 16s2 1.5 4 1.5" />
      <path d="M2 20.5c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5" />
      <circle cx="15" cy="6" r="2" />
      <path d="M6 13l4-4 3 3" />
    </>
  ),
  sport: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  hart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  huis: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  euro: (
    <>
      <path d="M17 6a7 7 0 1 0 0 12" />
      <path d="M4 10h9M4 14h9" />
    </>
  ),
  hand: (
    <>
      <path d="M3 14h4l3 2h5a2 2 0 0 0 0-4h-3" />
      <path d="M7 14V9h3l4 3" />
      <path d="M3 20h12l6-4" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3" width="16" height="15" rx="2" />
      <path d="M4 11h16M8 21v-3M16 21v-3" />
      <circle cx="8" cy="14.5" r="0.6" />
      <circle cx="16" cy="14.5" r="0.6" />
    </>
  ),
  boek: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z" />
      <path d="M4 20a2 2 0 0 0 2 2h13v-4" />
    </>
  ),
  brief: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  vraag: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01" />
    </>
  ),
  tas: (
    <>
      <path d="M5 8h14l-1 13H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  pijl: <path d="M9 6l6 6-6 6" />,
  kruis: <path d="M6 6l12 12M18 6L6 18" />,
  print: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M6 14h12v7H6z" />
    </>
  ),
};

/** Welk icoon bij welke regeling hoort. */
const BIJ: Record<string, keyof typeof PADEN> = {
  kindtegoed: "kind",
  laptop: "laptop",
  zwemles: "zwem",
  volwassenenfonds: "sport",
  gemeentepolis: "hart",
  ovpas: "bus",
  iit: "euro",
  alleenverdieners: "euro",
  studietoeslag: "boek",
  smi: "kind",
  kwijtschelding: "brief",
  bijzondere_bijstand: "hand",
  bijstand: "euro",
  zorgtoeslag: "hart",
  kgb: "kind",
  huurtoeslag: "huis",
  kot: "kind",
  kinderbijslag: "kind",
  goede_buur: "vraag",
  stadsbank: "euro",
  voedselbank: "tas",
};

export function Icoon({ naam, regeling }: { naam?: keyof typeof PADEN; regeling?: string }) {
  const pad = PADEN[naam ?? BIJ[regeling ?? ""] ?? "euro"];
  return (
    <svg className="icoon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {pad}
    </svg>
  );
}

/** Een Sleutelpas in de kleuren van de pas: geel met een rode sleutel. Eigen tekening. */
export function Pasje() {
  return (
    <svg className="pasje" viewBox="0 0 120 76" width="96" height="61" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="116" height="72" rx="10" fill="#fdc83f" />
      <circle cx="34" cy="38" r="13" fill="none" stroke="#e3161b" strokeWidth="7" />
      <path d="M46 38h52" stroke="#e3161b" strokeWidth="7" strokeLinecap="round" />
      <path d="M84 38v12M94 38v9" stroke="#e3161b" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
