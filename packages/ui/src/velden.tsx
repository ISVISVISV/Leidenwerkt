/**
 * Formuliervelden voor de apps in deze repository: uitleg bij een vraag, een invoerveld, een geboortedatum en een
 * keuzevraag. Alle velden zijn met het toetsenbord te bedienen en hebben een zichtbare en een voorgelezen naam.
 */
import { useState, type ReactNode } from "react";
import { alleenCijfers, datumInvoer, type Geboortedatum } from "./invoer.ts";

/**
 * Escape in een geopende uitleg sluit die uitleg en zet de focus terug op de knop "Meer uitleg".
 * Staat er in de uitleg een bron open, dan sluit Escape eerst alleen die bron.
 */
export const sluitMetEscape = (hintId: string, sluit: () => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key !== "Escape" || e.currentTarget.querySelector(".bron.open")) return;
  sluit();
  document.querySelector<HTMLButtonElement>(`button[aria-controls="${hintId}"]`)?.focus();
};

/** Korte uitleg (een tekst tot zo veel tekens) staat altijd zichtbaar onder de vraag. Langere uitleg staat achter "Meer uitleg". */
const KORT = 160;

/**
 * De uitleg bij een vraag. Kort: altijd zichtbaar, zodat niemand een knopje hoeft te vinden.
 * Lang, of met een bron: achter de tekstknop "Meer uitleg". Die blijft open tot de gebruiker hem weer sluit.
 */
function useUitleg(id: string, onderwerp: string, hint?: ReactNode, toelichting?: string) {
  const [open, setOpen] = useState(false);
  const kort = typeof hint === "string" && hint.length <= KORT;
  const zichtbaar = [toelichting, kort ? (hint as string) : undefined].filter(Boolean).join(" ");
  const extra = kort ? undefined : hint;
  const zichtbaarId = `${id}-toelichting`;
  const hintId = `${id}-hint`;
  const beschrijving = [zichtbaar ? zichtbaarId : "", extra && open ? hintId : ""].filter(Boolean);
  const blok = (
    <>
      {zichtbaar && (
        <p className="vraag-toelichting" id={zichtbaarId}>
          {zichtbaar}
        </p>
      )}
      {extra ? (
        <>
          <button
            type="button"
            className="info-knop"
            aria-expanded={open}
            aria-controls={hintId}
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && open) setOpen(false);
            }}
          >
            Meer uitleg
            <span className="sr">: {onderwerp}</span>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="hint" id={hintId} hidden={!open} onKeyDown={sluitMetEscape(hintId, () => setOpen(false))}>
            {extra}
          </div>
        </>
      ) : null}
    </>
  );
  return { blok, beschrijving };
}

export function Veld(props: {
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
  const uitleg = useUitleg(props.id, props.label, props.hint);
  const foutId = props.fout ? `${props.id}-fout` : undefined;
  return (
    <div className={`veld${props.fout ? " fout" : ""}`}>
      <div className="label-rij">
        <label htmlFor={props.id}>{props.label}</label>
      </div>
      {uitleg.blok}
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
          aria-describedby={[...uitleg.beschrijving, foutId].filter(Boolean).join(" ") || undefined}
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
export function Datum(props: {
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

export function Keuze<T extends string>(props: {
  naam: string;
  legend: string;
  hint?: ReactNode;
  fout?: string;
  opties: [T, string][];
  waarde: T;
  onChange: (v: T) => void;
}) {
  const uitleg = useUitleg(props.naam, props.legend, props.hint);
  const foutId = `${props.naam}-fout`;
  return (
    <fieldset
      className={`keuze${props.fout ? " fout" : ""}`}
      aria-describedby={[...uitleg.beschrijving, props.fout ? foutId : ""].filter(Boolean).join(" ") || undefined}
    >
      <legend>{props.legend}</legend>
      {uitleg.blok}
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

/** Een vraag waarbij meer antwoorden mogen. Een optie in `alleen` (bijvoorbeeld "Geen inkomen") zet de andere uit. */
export function Vinkjes<T extends string>(props: {
  naam: string;
  legend: string;
  hint?: ReactNode;
  fout?: string;
  opties: [T, string][];
  waarde: T[];
  alleen?: T;
  /** Korte uitleg die altijd zichtbaar onder de vraag staat, bijvoorbeeld "U kunt meer antwoorden kiezen." */
  toelichting?: string;
  onChange: (v: T[]) => void;
}) {
  const uitleg = useUitleg(props.naam, props.legend, props.hint, props.toelichting);
  const foutId = `${props.naam}-fout`;
  const wissel = (w: T, aan: boolean) => {
    if (!aan) return props.onChange(props.waarde.filter((x) => x !== w));
    if (w === props.alleen) return props.onChange([w]);
    props.onChange([...props.waarde.filter((x) => x !== props.alleen), w]);
  };
  return (
    <fieldset
      className={`keuze${props.fout ? " fout" : ""}`}
      aria-describedby={[...uitleg.beschrijving, props.fout ? foutId : ""].filter(Boolean).join(" ") || undefined}
    >
      <legend>{props.legend}</legend>
      {uitleg.blok}
      {props.fout && (
        <p className="foutmelding" id={foutId}>
          {props.fout}
        </p>
      )}
      {props.opties.map(([w, tekst]) => (
        <label key={w} className="optie">
          <input
            type="checkbox"
            name={props.naam}
            value={w}
            checked={props.waarde.includes(w)}
            aria-invalid={props.fout ? true : undefined}
            onChange={(e) => wissel(w, e.target.checked)}
          />
          <span>{tekst}</span>
        </label>
      ))}
    </fieldset>
  );
}
