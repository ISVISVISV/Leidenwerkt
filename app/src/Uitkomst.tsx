import { useMemo, useState } from "react";
import { bereken, verschilEersteJaar, citaatVoorParameter, euro, vrijlatingUitleg, regimeOp, standaardRegels, D, type Post, type Resultaat } from "@leidenwerkt/engine";
import { Bron } from "./Bron.tsx";
import { getal, ingevuld, naarInvoer, schuifStart, vasteFase, vandaag, type Formulier } from "./formulier.ts";

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

const ONDERDELEN: [string, string][] = [
  ["pw.", "de bijstand"],
  ["ib.", "de belasting"],
  ["zt.", "de zorgtoeslag"],
  ["ht.", "de huurtoeslag"],
  ["kgb.", "het kindgebonden budget"],
  ["kot.", "de kinderopvangtoeslag"],
  ["akw.", "de kinderbijslag"],
  ["leiden.", "de Leidse regelingen"],
];

/** Welke onderdelen nog geen officiële bedragen hebben voor een datum. */
function onbekendeOnderdelen(datum: string): string[] {
  const ids = standaardRegels.onbekendOp(datum).map((o) => o.id);
  return ONDERDELEN.filter(([prefix]) => ids.some((id) => id.startsWith(prefix))).map(([, naam]) => naam);
}

const leesbareDatum = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export function Uitkomst({ f }: { f: Formulier }) {
  const start = schuifStart(f);
  const extra = start.wat === "extra";
  const [uren, setUren] = useState(() => start.uren);
  const maxUren = Math.max(extra ? 32 : 40, start.uren);
  // Bij "meer uren" kan de schuif niet onder het huidige aantal uren.
  const minUren = f.werktNu && f.verandering === "meer" ? Math.min(start.uren, Math.round(getal(f.nuUren) ?? 0) + 1) : 1;
  const urenTekst = (u: number) => `${u} uur ${extra ? "extra werk " : ""}per week`;
  const [gekozenFase, setFase] = useState<"start" | "later" | "geen">("start");
  const { datum, teruggevallen } = useMemo(() => bruikbareDatum(f), [f]);

  const uitleg = useMemo(() => vrijlatingUitleg(naarInvoer(f, { uren, fase: "start", datum })), [f, uren, datum]);
  const periodes = uitleg.periodes;
  const fase = periodes.some((p) => p.fase === gekozenFase) ? gekozenFase : periodes[0].fase;
  const onbekend = useMemo(() => (teruggevallen ? onbekendeOnderdelen(vandaag()) : []), [teruggevallen]);
  const r = useMemo(() => bereken(naarInvoer(f, { uren, fase, datum })), [f, uren, fase, datum]);
  const zonder = useMemo(() => bereken(naarInvoer(f, { uren, fase: "geen", datum })), [f, uren, datum]);
  const voordeel = D(r.werk.besteedbaarPerMaand).minus(zonder.werk.besteedbaarPerMaand);
  const gekozen = periodes.find((p) => p.fase === fase) ?? periodes[0];
  const bijstandMetWerk = r.werk.posten.find((p) => p.id === "bijstand");
  const heeftBijstand = !!bijstandMetWerk && bijstandMetWerk.perMaand !== null && bijstandMetWerk.perMaand !== "0.00";
  // De zin over de vrijlating staat er alleen als de vrijlating in de gekozen periode iets oplevert.
  const vrijlatingTelt = heeftBijstand && voordeel.gt("0.5");
  // Na de laatste periode: loopt de bijstand dan nog door?
  const laatsteFase = periodes[periodes.length - 1].fase;
  const rLaatste = useMemo(() => bereken(naarInvoer(f, { uren, fase: laatsteFase, datum })), [f, uren, laatsteFase, datum]);
  // De keuze voor de periode hangt af van de invoer, niet van de gekozen periode (anders verdwijnt ze na een klik).
  const rStart = useMemo(() => bereken(naarInvoer(f, { uren, fase: "start", datum })), [f, uren, datum]);
  const bijstandStart = rStart.werk.posten.find((p) => p.id === "bijstand");
  const meerPeriodes =
    !vasteFase(f) && periodes.length > 1 && !!bijstandStart && bijstandStart.perMaand !== null && bijstandStart.perMaand !== "0.00";
  const eersteJaar = useMemo(() => verschilEersteJaar(naarInvoer(f, { uren, fase: "start", datum })), [f, uren, datum]);
  // Vanaf hoeveel uur per week is er blijvend geen bijstand meer nodig? Zonder vrijlating, want die is tijdelijk.
  const grensUren = useMemo(() => {
    const nu = bereken(naarInvoer(f, { uren: 1, fase: "geen", datum })).huidig.posten.find((p) => p.id === "bijstand");
    if (!nu || nu.perMaand === null || nu.perMaand === "0.00") return undefined;
    for (let u = minUren; u <= maxUren; u++) {
      const b = bereken(naarInvoer(f, { uren: u, fase: "geen", datum })).werk.posten.find((p) => p.id === "bijstand");
      if (b && b.perMaand === "0.00") return u;
    }
    return null;
  }, [f, datum, minUren, maxUren]);

  return (
    <section className="uitkomst">
      <p className="alleen-print afdruk-datum">
        Berekening van {leesbareDatum(vandaag())}, met de regels die gelden op {leesbareDatum(r.datum)}.
      </p>

      <Antwoord
        r={r}
        urenTekst={urenTekst(uren)}
        periode={meerPeriodes ? gekozen.naam : undefined}
        eersteJaar={eersteJaar.bedrag}
        stoptLater={meerPeriodes && fase !== laatsteFase && bijstandVan(rLaatste) === "0.00"}
      />

      <section className="alleen-print gegevens" aria-label="Wat u heeft ingevuld">
        <h2>Wat u heeft ingevuld</h2>
        <div className="gegevens-kolommen">
          {ingevuld(f, uren).map((blok) => (
            <div key={blok.kop}>
              <h3>{blok.kop}</h3>
              <dl>
                {blok.regels.map(([naam, waarde]) => (
                  <div key={naam}>
                    <dt>{naam}</dt>
                    <dd>{waarde}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <div className="bediening">
        <label htmlFor="urenschuif">
          {extra ? "Uren extra werk per week" : "Uren per week"}: <output htmlFor="urenschuif">{uren}</output>
        </label>
        <input
          id="urenschuif"
          type="range"
          min={minUren}
          max={maxUren}
          aria-valuetext={urenTekst(uren)}
          step={1}
          value={uren}
          aria-describedby={grensUren !== undefined ? "urengrens" : undefined}
          onChange={(e) => setUren(Number(e.target.value))}
        />
        {grensUren !== undefined && (
          <p className="urengrens" id="urengrens">
            {grensUren === null
              ? `Ook bij ${urenTekst(maxUren)} vult de bijstand uw loon nog aan.`
              : grensUren === minUren
                ? `Met dit loon heeft u vanaf ${urenTekst(minUren)} geen bijstand meer nodig.`
                : `Vanaf ${urenTekst(grensUren)} heeft u met dit uurloon geen bijstand meer nodig.${uren < grensUren ? ` Bij ${uren} uur vult de bijstand uw loon nog aan.` : ""}`}
          </p>
        )}
        {meerPeriodes && (
          <fieldset className="keuze compact">
            <legend>Welke periode wilt u zien?</legend>
            {periodes.map((p) => (
              <label className="optie" key={p.fase}>
                <input type="radio" name="fase" checked={fase === p.fase} onChange={() => setFase(p.fase)} />
                <span>{p.naam}</span>
              </label>
            ))}
          </fieldset>
        )}
      </div>

      {heeftBijstand && (
        <div className="toelichting">
          <p>
            <strong>{meerPeriodes ? `${gekozen.naam} ${f.werktNu ? "nadat u naast de bijstand bent gaan werken" : "na de start van uw werk"}.` : `${gekozen.naam}.`}</strong> {gekozen.regel}
          </p>
          {vrijlatingTelt && (
            <p>
              Dit levert u in deze periode {euro(voordeel, true)} per maand extra op. Vraag uw klantmanager of de vrijlating voor u geldt. De
              gemeente beslist dat.
            </p>
          )}
          <p className="klein bron-blok">
            Bron:{" "}
            {uitleg.citaten.length > 0
              ? uitleg.citaten.map((c, i) => (
                  <span key={c.titel}>
                    {i > 0 && ", "}
                    <Bron citaat={c} label={c.titel.replace(/^Participatiewet, /, i === 0 ? "Participatiewet, " : "")} />
                  </span>
                ))
              : uitleg.bron}
          </p>
        </div>
      )}

      {teruggevallen && (
        <div className="melding waarschuwing" role="status">
          <p>
            <strong>Let op: deze berekening gebruikt de regels van {leesbareDatum(datum)}.</strong> Voor vandaag (
            {leesbareDatum(vandaag())}) zijn nog niet alle officiële bedragen bekend
            {onbekend.length > 0 ? `, bijvoorbeeld voor ${onbekend.slice(0, 3).join(", ")}` : ""}. De bedragen die nu gelden kunnen
            anders zijn.
          </p>
          {regimeOp(vandaag()).id !== regimeOp(datum).id && (
            <p>
              Sinds {leesbareDatum(regimeOp(vandaag()).vanaf)} gelden ook andere regels voor het deel van uw loon dat u naast de bijstand mag
              houden. Hieronder ziet u nog de oude regels. Vraag uw klantmanager wat er voor u verandert.
            </p>
          )}
        </div>
      )}

      <Vergelijking r={r} />

      {r.signalen.length > 0 && (
        <section aria-labelledby="let-op">
          <h2 id="let-op">Goed om te weten</h2>
          <ul className="signalen">
            {r.signalen.map((s, i) => (
              <li key={i} className={`${s.soort} bron-blok`}>
                <strong className="signaal-kop">{s.kop}</strong>
                {s.tekst}
                {s.bron && (
                  <span className="signaal-bron">
                    Bron: <Bron citaat={s.bron} />
                  </span>
                )}
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
            <>
              <details className="uitleg niet-print">
                <summary>Bekijk de {lijst.length} aannames</summary>
                <ul className="aannames">
                  {lijst.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </details>
              <ul className="aannames alleen-print">
                {lijst.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          );
        })()}
        <p className="klein niet-print">Berekend met de regels die gelden op {leesbareDatum(r.datum)}.</p>
      </section>
    </section>
  );
}

const bijstandVan = (r: Resultaat) => r.werk.posten.find((p) => p.id === "bijstand")?.perMaand ?? null;

/** Eén zin over de bijstand: blijft die, of stopt die? Alleen voor wie nu bijstand krijgt. */
function bijstandZin(r: Resultaat, stoptLater: boolean): string | undefined {
  const nu = r.huidig.posten.find((p) => p.id === "bijstand")?.perMaand;
  const met = bijstandVan(r);
  if (!nu || nu === "0.00" || met === null) return undefined;
  if (met === "0.00") return "Uw bijstand stopt. Met dit werk is uw inkomen even hoog als de bijstandsnorm of hoger.";
  if (stoptLater) return `In deze periode houdt u nog ${euro(met, true)} bijstand per maand, door de vrijlating. Daarna stopt uw bijstand.`;
  return `U houdt bijstand: ${euro(met, true)} per maand, als aanvulling op uw loon.`;
}

/** Kosten voor het werk die iemand zelf betaalt: de kosten min de vergoeding van de werkgever, per maand. */
function eigenWerkkosten(r: Resultaat): number {
  const post = (posten: Post[], id: string) => Math.abs(Number(posten.find((p) => p.id === id)?.perMaand ?? 0));
  const netto = (posten: Post[]) => post(posten, "werkkosten") - post(posten, "reisvergoeding");
  return netto(r.werk.posten) - netto(r.huidig.posten);
}

function Antwoord({
  r,
  urenTekst,
  periode,
  eersteJaar,
  stoptLater,
}: {
  r: Resultaat;
  urenTekst: string;
  periode?: string;
  eersteJaar: string;
  stoptLater: boolean;
}) {
  const j = Number(eersteJaar);
  const jaarzin =
    Math.abs(j) < 120
      ? "Ook over de eerste 12 maanden samen houdt u ongeveer evenveel over als nu."
      : `In de eerste 12 maanden is dat samen ongeveer ${euro(eersteJaar.replace("-", ""), true)} ${j > 0 ? "meer" : "minder"}.`;
  const v = Number(r.verschilPerMaand);
  const bedrag = euro(r.verschilPerMaand.replace("-", ""), true);
  const zin =
    Math.abs(v) < 10
      ? "Met dit werk houdt u per maand ongeveer evenveel over als nu."
      : v > 0
        ? `Met dit werk houdt u per maand ongeveer ${bedrag} meer over.`
        : `Met dit werk houdt u per maand ongeveer ${bedrag} minder over.`;
  // Houdt iemand minder over en komt dat door kosten die hij zelf betaalt? Dan staat dat erbij.
  const kosten = eigenWerkkosten(r);
  const doorKosten = v <= -10 && kosten >= 1 && v + kosten > -10;
  const overBijstand = bijstandZin(r, stoptLater);
  return (
    <div className={`antwoord ${Math.abs(v) < 10 ? "gelijk" : v > 0 ? "meer" : "minder"}`} aria-live="polite">
      <p className="antwoord-zin">{zin}</p>
      {doorKosten && (
        <p className="antwoord-sub">Dat komt door de kosten voor het werk die u zelf betaalt: {euro(kosten.toFixed(2), true)} per maand.</p>
      )}
      <p className="antwoord-sub">
        Bij {urenTekst}{periode ? `, ${periode.charAt(0).toLowerCase() + periode.slice(1)} na de start` : ""}. {jaarzin}
      </p>
      {overBijstand && <p className="antwoord-sub antwoord-bijstand">{overBijstand}</p>}
      {r.betrouwbaarheid.niveau !== "goed" && <p className="antwoord-noot">{r.betrouwbaarheid.tekst}</p>}
      {r.zekerheid === "onbevestigd" && r.betrouwbaarheid.niveau === "beperkt" && (
        <p className="antwoord-noot">Een deel van de bedragen is nog niet officieel bevestigd. Ze zijn hieronder gemarkeerd met een sterretje.</p>
      )}
    </div>
  );
}

const VOLGORDE = ["loon", "loon_partner", "ander_inkomen", "bijstand", "reisvergoeding", "iack", "zorgtoeslag", "huurtoeslag", "kgb", "kinderbijslag", "kot", "bb_opvang", "opvangkosten", "werkkosten"];
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
  const meegeteld = (s: Resultaat["huidig"], kosten: boolean) =>
    s.posten
      .filter((p) => p.perMaand !== null && (p.soort === "kosten") === kosten && !r.nietMeegenomen.some((n) => n.id === p.id))
      .reduce((t, p) => t.plus(D(p.perMaand!)), D(0));
  const rij = (id: string) => {
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
  };
  const binnen = zichtbaar.filter((id) => labels.get(id)!.soort !== "kosten");
  const eraf = zichtbaar.filter((id) => labels.get(id)!.soort === "kosten");
  return (
    <table className="vergelijking">
      <caption>Zo is het bedrag opgebouwd (per maand)</caption>
      <thead>
        <tr>
          <th scope="col">Per maand</th>
          <th scope="col">Nu</th>
          <th scope="col">Met dit werk</th>
        </tr>
      </thead>
      <tbody>
        <tr className="groepkop">
          <th scope="rowgroup" colSpan={3}>
            Wat er binnenkomt
          </th>
        </tr>
        {binnen.map(rij)}
        <tr className="subtotaal">
          <th scope="row">Totaal binnen</th>
          <td>{euro(meegeteld(r.huidig, false), true)}</td>
          <td>{euro(meegeteld(r.werk, false), true)}</td>
        </tr>
      </tbody>
      {eraf.length > 0 && (
        <tbody>
          <tr className="groepkop">
            <th scope="rowgroup" colSpan={3}>
              Wat eraf gaat
            </th>
          </tr>
          {eraf.map(rij)}
          <tr className="subtotaal">
            <th scope="row">Totaal eraf</th>
            <td>{euro(meegeteld(r.huidig, true), true)}</td>
            <td>{euro(meegeteld(r.werk, true), true)}</td>
          </tr>
        </tbody>
      )}
      <tfoot>
        <tr>
          <th scope="row">U houdt over{eraf.length > 0 ? " (binnen min eraf)" : ""}</th>
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
    <section aria-labelledby="uitleg" className="niet-print">
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
                    <li key={g.id} className="bron-blok">
                      {g.omschrijving}: <strong>{g.waarde}</strong>
                      {g.status === "onbevestigd" && <span className="label-onzeker"> nog niet officieel bevestigd</span>}
                      {g.bron && (
                        <>
                          {" "}
                          (
                          {citaatVoorParameter(g) ? (
                            <Bron citaat={citaatVoorParameter(g)!} label={g.bron.titel} />
                          ) : (
                            <a href={g.bron.url} rel="noreferrer noopener" target="_blank">
                              {g.bron.titel}
                            </a>
                          )}
                          )
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

