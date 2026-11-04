import { useMemo, useState } from "react";
import { bereken, euro, type Post, type Resultaat } from "@leidenwerkt/engine";
import { getal, naarInvoer, vandaag, type Formulier } from "./formulier.ts";

/** Zoekt de meest recente datum (vanaf vandaag terug) waarvoor de bijstand berekend kan worden. */
function bruikbareDatum(f: Formulier): { datum: string; teruggevallen: boolean } {
  const start = vandaag();
  const d = new Date(`${start}T12:00:00`);
  for (let i = 0; i < 24; i++) {
    const eind = new Date(d.getFullYear(), d.getMonth() - i + 1, 0);
    const datum = i === 0 ? start : `${eind.getFullYear()}-${String(eind.getMonth() + 1).padStart(2, "0")}-${String(eind.getDate()).padStart(2, "0")}`;
    const r = bereken(naarInvoer(f, { fase: "geen", datum }));
    if (!r.nietMeegenomen.some((n) => n.id === "bijstand" || n.id === "loon")) return { datum, teruggevallen: i > 0 };
  }
  return { datum: start, teruggevallen: false };
}

const leesbareDatum = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export function Uitkomst({ f }: { f: Formulier }) {
  const [uren, setUren] = useState(() => Math.round(getal(f.uren) ?? 24));
  const [fase, setFase] = useState<"start" | "later">("start");
  const { datum, teruggevallen } = useMemo(() => bruikbareDatum(f), [f]);

  const start = useMemo(() => bereken(naarInvoer(f, { uren, fase: "start", datum })), [f, uren, datum]);
  const later = useMemo(() => bereken(naarInvoer(f, { uren, fase: "later", datum })), [f, uren, datum]);
  const r = fase === "start" ? start : later;
  const fasenVerschillen = start.verschilPerMaand !== later.verschilPerMaand;

  return (
    <section className="uitkomst">
      <Antwoord r={r} uren={uren} />

      <div className="bediening">
        <label htmlFor="urenschuif">
          Uren per week: <output htmlFor="urenschuif">{uren}</output>
        </label>
        <input id="urenschuif" type="range" min={1} max={40} step={1} value={uren} onChange={(e) => setUren(Number(e.target.value))} />
        {fasenVerschillen && (
          <fieldset className="keuze compact">
            <legend>Periode</legend>
            <label className="optie">
              <input type="radio" name="fase" checked={fase === "start"} onChange={() => setFase("start")} />
              <span>De eerste maanden</span>
            </label>
            <label className="optie">
              <input type="radio" name="fase" checked={fase === "later"} onChange={() => setFase("later")} />
              <span>Daarna</span>
            </label>
          </fieldset>
        )}
      </div>

      {fasenVerschillen && (
        <p className="toelichting">
          In de eerste maanden mag u een deel van uw loon houden naast de bijstand. Daarna is dat minder. Kies hierboven welke periode u
          wilt zien.
        </p>
      )}

      {teruggevallen && (
        <p className="melding">
          Voor vandaag zijn nog niet alle officiële bedragen bekend. Daarom is gerekend met de regels van {leesbareDatum(datum)}.
        </p>
      )}

      <Vergelijking r={r} />

      {r.signalen.length > 0 && (
        <section aria-labelledby="let-op">
          <h2 id="let-op">Goed om te weten</h2>
          <ul className="signalen">
            {r.signalen.map((s, i) => (
              <li key={i} className={s.soort}>
                {s.tekst}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Uitleg r={r} />

      <section aria-labelledby="aannames">
        <h2 id="aannames">Waar deze berekening van uitgaat</h2>
        {(() => {
          const lijst = [...new Set([...r.aannames, ...r.werk.posten.flatMap((p) => p.aannames), ...r.huidig.posten.flatMap((p) => p.aannames)])];
          return (
            <details className="uitleg">
              <summary>Bekijk de {lijst.length} aannames</summary>
              <ul className="aannames">
                {lijst.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </details>
          );
        })()}
        <p className="klein">Berekend met de regels die gelden op {leesbareDatum(r.datum)}.</p>
      </section>
    </section>
  );
}

function Antwoord({ r, uren }: { r: Resultaat; uren: number }) {
  const v = Number(r.verschilPerMaand);
  const bedrag = euro(r.verschilPerMaand.replace("-", ""), true);
  const zin =
    Math.abs(v) < 10
      ? "Met dit werk houdt u per maand ongeveer evenveel over als nu."
      : v > 0
        ? `Met dit werk houdt u per maand ongeveer ${bedrag} meer over.`
        : `Met dit werk houdt u per maand ongeveer ${bedrag} minder over.`;
  return (
    <div className={`antwoord ${Math.abs(v) < 10 ? "gelijk" : v > 0 ? "meer" : "minder"}`} aria-live="polite">
      <p className="antwoord-zin">{zin}</p>
      <p className="antwoord-sub">
        Bij {uren} uur per week. Per jaar is dat {Math.abs(v) < 10 ? "ongeveer gelijk" : `${euro(r.verschilPerJaar.replace("-", ""), true)} ${v > 0 ? "meer" : "minder"}`}.
      </p>
      {r.zekerheid === "onbevestigd" && (
        <p className="antwoord-noot">Een deel van de bedragen is nog niet officieel bevestigd. Ze zijn hieronder gemarkeerd met een sterretje.</p>
      )}
      {r.nietMeegenomen.length > 0 && (
        <p className="antwoord-noot">
          Niet meegerekend: {r.nietMeegenomen.map((n) => n.label.toLowerCase()).join(", ")}. Zie de uitleg hieronder.
        </p>
      )}
    </div>
  );
}

const VOLGORDE = ["loon", "loon_partner", "bijstand", "reisvergoeding", "iack", "zorgtoeslag", "huurtoeslag", "kgb", "kinderbijslag", "kot", "opvangkosten", "werkkosten"];
const opVolgorde = (a: string, b: string) => VOLGORDE.indexOf(a) - VOLGORDE.indexOf(b);

function waarde(p: Post | undefined): string {
  if (!p) return "–";
  if (p.perMaand === null) return "niet berekend";
  return euro(p.perMaand, true);
}

function Vergelijking({ r }: { r: Resultaat }) {
  const ids: string[] = [];
  const labels = new Map<string, Post>();
  for (const p of [...r.huidig.posten, ...r.werk.posten]) {
    if (!labels.has(p.id)) {
      ids.push(p.id);
      labels.set(p.id, p);
    }
  }
  ids.sort(opVolgorde);
  const zichtbaar = ids.filter((id) => {
    const a = r.huidig.posten.find((p) => p.id === id);
    const b = r.werk.posten.find((p) => p.id === id);
    return !(a?.perMaand === "0.00" && (!b || b.perMaand === "0.00"));
  });
  return (
    <table className="vergelijking">
      <caption>Wat u per maand krijgt en betaalt</caption>
      <thead>
        <tr>
          <th scope="col">Per maand</th>
          <th scope="col">Nu</th>
          <th scope="col">Met dit werk</th>
        </tr>
      </thead>
      <tbody>
        {zichtbaar.map((id) => {
          const p = labels.get(id)!;
          const a = r.huidig.posten.find((x) => x.id === id);
          const b = r.werk.posten.find((x) => x.id === id);
          const onzeker = [a, b].some((x) => x?.status === "onbevestigd");
          return (
            <tr key={id} className={p.perMaand === null ? "leeg" : undefined}>
              <th scope="row">
                {p.label}
                {onzeker && (
                  <span className="ster" title="Nog niet officieel bevestigd">
                    *<span className="sr">nog niet officieel bevestigd</span>
                  </span>
                )}
              </th>
              <td>{waarde(a)}</td>
              <td>{waarde(b)}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">U houdt over</th>
          <td>{euro(r.huidig.besteedbaarPerMaand, true)}</td>
          <td>{euro(r.werk.besteedbaarPerMaand, true)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

function Uitleg({ r }: { r: Resultaat }) {
  const ids = [...new Set([...r.huidig.posten, ...r.werk.posten].map((p) => p.id))].sort(opVolgorde);
  return (
    <section aria-labelledby="uitleg">
      <h2 id="uitleg">Hoe is dit berekend?</h2>
      {ids.map((id) => {
        const a = r.huidig.posten.find((p) => p.id === id);
        const b = r.werk.posten.find((p) => p.id === id);
        const p = (b ?? a)!;
        const params = [...(a?.parameters ?? []), ...(b?.parameters ?? [])].filter((x, i, l) => l.findIndex((y) => y.id === x.id) === i);
        return (
          <details key={id} className="uitleg">
            <summary>{p.label}</summary>
            {p.perMaand === null && <p className="melding">{p.reden}</p>}
            {[
              ["Nu", a],
              ["Met dit werk", b],
            ].map(([kop, post]) =>
              post && typeof post !== "string" && post.stappen.length > 0 ? (
                <div key={kop as string}>
                  <h3>{kop as string}</h3>
                  <dl className="stappen">
                    {post.stappen.map((s, i) => (
                      <div key={i}>
                        <dt>{s.tekst}</dt>
                        <dd>{s.bedrag !== undefined ? euro(s.bedrag) : ""}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null,
            )}
            {params.length > 0 && (
              <>
                <h3>Gebruikte regels</h3>
                <ul className="bronnen">
                  {params.map((g) => (
                    <li key={g.id}>
                      {g.omschrijving}: <strong>{g.waarde}</strong>
                      {g.status === "onbevestigd" && <span className="label-onzeker"> nog niet officieel bevestigd</span>}
                      {g.bron && (
                        <>
                          {" "}
                          (<a href={g.bron.url} rel="noreferrer noopener" target="_blank">{g.bron.titel}</a>)
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </details>
        );
      })}
    </section>
  );
}
