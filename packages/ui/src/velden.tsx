/**
 * Formuliervelden voor de apps in deze repository: een i-knop met uitleg, een invoerveld, een geboortedatum en een
 * keuzevraag. Alle velden zijn met het toetsenbord te bedienen en hebben een zichtbare en een voorgelezen naam.
 */
import { useState, type ReactNode } from "react";
import { alleenCijfers, datumInvoer, type Geboortedatum } from "./invoer.ts";

/** Een tekst gesplitst in alles behalve het laatste woord, en het laatste woord. */
const laatsteWoord = (t: string): [string, string] => {
  const i = t.lastIndexOf(" ");
  return i < 0 ? ["", t] : [t.slice(0, i + 1), t.slice(i + 1)];
};

/**
 * Escape in een geopende uitleg sluit die uitleg en zet de focus terug op het i-knopje.
 * Staat er in de uitleg een bron open, dan sluit Escape eerst alleen die bron.
 */
export const sluitMetEscape = (hintId: string, sluit: () => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key !== "Escape" || e.currentTarget.querySelector(".bron.open")) return;
  sluit();
  document.querySelector<HTMLButtonElement>(`button[aria-controls="${hintId}"]`)?.focus();
};

/** Knop "i" die uitleg toont of verbergt. De uitleg blijft staan tot de gebruiker hem weer sluit. */
export function InfoKnop({ open, onToggle, controls, onderwerp }: { open: boolean; onToggle: () => void; controls: string; onderwerp: string }) {
  return (
    <button
      type="button"
      className="info-knop"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) onToggle();
      }}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="22" height="22">
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="7.6" r="1.35" fill="currentColor" />
        <rect x="10.9" y="10.4" width="2.2" height="7.2" rx="1.1" fill="currentColor" />
      </svg>
      <span className="sr">{open ? `Uitleg verbergen: ${onderwerp}` : `Uitleg: ${onderwerp}`}</span>
    </button>
  );
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
  const [uitleg, setUitleg] = useState(false);
  const hintId = props.hint ? `${props.id}-hint` : undefined;
  const foutId = props.fout ? `${props.id}-fout` : undefined;
  return (
    <div className={`veld${props.fout ? " fout" : ""}`}>
      <div className="label-rij">
        {/* Het laatste woord houdt ruimte vrij voor de i-knop (zie .ruimte-i): de knop valt nooit alleen op een nieuwe regel. */}
        <label htmlFor={props.id}>
          {props.hint ? (
            <>
              {laatsteWoord(props.label)[0]}
              <span className="ruimte-i">{laatsteWoord(props.label)[1]}</span>
            </>
          ) : (
            props.label
          )}
        </label>
        {props.hint && <InfoKnop open={uitleg} onToggle={() => setUitleg(!uitleg)} controls={hintId!} onderwerp={props.label} />}
      </div>
      {props.hint && (
        <div className="hint" id={hintId} hidden={!uitleg} onKeyDown={sluitMetEscape(hintId!, () => setUitleg(false))}>
          {props.hint}
        </div>
      )}
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
          aria-describedby={[uitleg ? hintId : undefined, foutId].filter(Boolean).join(" ") || undefined}
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
  const [uitleg, setUitleg] = useState(false);
  const hintId = `${props.naam}-hint`;
  const foutId = `${props.naam}-fout`;
  return (
    <fieldset
      className={`keuze${props.fout ? " fout" : ""}`}
      aria-describedby={[props.hint && uitleg ? hintId : "", props.fout ? foutId : ""].filter(Boolean).join(" ") || undefined}
    >
      {props.hint ? (
        <>
          {/* De naam van de groep blijft de vraag zelf; zichtbaar staat de i-knop direct achter het laatste woord. */}
          <legend className="visueel-verborgen">{props.legend}</legend>
          <div className="vraag-rij">
            <span className="vraag-tekst" aria-hidden="true">
              {laatsteWoord(props.legend)[0]}
            </span>
            <span className="samen">
              <span className="vraag-tekst" aria-hidden="true">
                {laatsteWoord(props.legend)[1]}
              </span>
              <InfoKnop open={uitleg} onToggle={() => setUitleg(!uitleg)} controls={hintId} onderwerp={props.legend} />
            </span>
          </div>
        </>
      ) : (
        <legend>{props.legend}</legend>
      )}
      {props.hint && (
        <div className="hint" id={hintId} hidden={!uitleg} onKeyDown={sluitMetEscape(hintId!, () => setUitleg(false))}>
          {props.hint}
        </div>
      )}
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
  onChange: (v: T[]) => void;
}) {
  const [uitleg, setUitleg] = useState(false);
  const hintId = `${props.naam}-hint`;
  const foutId = `${props.naam}-fout`;
  const wissel = (w: T, aan: boolean) => {
    if (!aan) return props.onChange(props.waarde.filter((x) => x !== w));
    if (w === props.alleen) return props.onChange([w]);
    props.onChange([...props.waarde.filter((x) => x !== props.alleen), w]);
  };
  return (
    <fieldset
      className={`keuze${props.fout ? " fout" : ""}`}
      aria-describedby={[props.hint && uitleg ? hintId : "", props.fout ? foutId : ""].filter(Boolean).join(" ") || undefined}
    >
      {props.hint ? (
        <>
          <legend className="visueel-verborgen">{props.legend}</legend>
          <div className="vraag-rij">
            <span className="vraag-tekst" aria-hidden="true">
              {laatsteWoord(props.legend)[0]}
            </span>
            <span className="samen">
              <span className="vraag-tekst" aria-hidden="true">
                {laatsteWoord(props.legend)[1]}
              </span>
              <InfoKnop open={uitleg} onToggle={() => setUitleg(!uitleg)} controls={hintId} onderwerp={props.legend} />
            </span>
          </div>
        </>
      ) : (
        <legend>{props.legend}</legend>
      )}
      {props.hint && (
        <div className="hint" id={hintId} hidden={!uitleg} onKeyDown={sluitMetEscape(hintId, () => setUitleg(false))}>
          {props.hint}
        </div>
      )}
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
