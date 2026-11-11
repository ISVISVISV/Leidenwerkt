import { useEffect, useMemo, useState } from "react";
import { Lezer, woonkorting, bereken, verschilEersteJaar, citaatVoorParameter, euro, vrijlatingUitleg, regimeOp, standaardRegels, D, type Opvangsoort, type Post, type Resultaat } from "@leidenwerkt/engine";
import { Bron } from "./Bron.tsx";
import { LOON_PER, OPVANG, getal, ingevuld, ingevuldLoon, maxUurprijs, naarInvoer, schuifStart, vasteFase, vandaag, type Formulier } from "./formulier.ts";

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
  // Wie al 6 maanden of langer werkt, zit in de periode na de eerste vrijlating: de uitleg volgt de berekening.
  const vast = vasteFase(f);
  // Op papier staan alle meldingen uitgeklapt.
  useEffect(() => {
    const open = () => document.querySelectorAll("details.signaal").forEach((d) => ((d as HTMLDetailsElement).open = true));
    window.addEventListener("beforeprint", open);
    return () => window.removeEventListener("beforeprint", open);
  }, []);
  const wens = vast ?? gekozenFase;
  const fase = periodes.some((p) => p.fase === wens) ? wens : vast ? periodes[periodes.length - 1].fase : periodes[0].fase;
  const onbekend = useMemo(() => (teruggevallen ? onbekendeOnderdelen(vandaag()) : []), [teruggevallen]);
  const r = useMemo(() => bereken(naarInvoer(f, { uren, fase, datum })), [f, uren, fase, datum]);
  const zonder = useMemo(() => bereken(naarInvoer(f, { uren, fase: "geen", datum })), [f, uren, datum]);
  const voordeel = D(r.werk.besteedbaarPerMaand).minus(zonder.werk.besteedbaarPerMaand);
  const gekozen = periodes.find((p) => p.fase === fase) ?? periodes[0];
  const bijstandMetWerk = r.werk.posten.find((p) => p.id === "bijstand");
  const heeftBijstand = !!bijstandMetWerk && bijstandMetWerk.perMaand !== null && bijstandMetWerk.perMaand !== "0.00";
  // De zin over de vrijlating staat er alleen als de vrijlating in de gekozen periode iets oplevert.
  const vrijlatingTelt = heeftBijstand && voordeel.gt("0.5");
  // Loopt de bijstand in de periode hierna nog door?
  const volgende = periodes[periodes.findIndex((p) => p.fase === fase) + 1];
  const volgendeFase = volgende?.fase;
  const volgendeNaam = volgende?.naam;
  const rVolgende = useMemo(
    () => (volgendeFase ? bereken(naarInvoer(f, { uren, fase: volgendeFase, datum })) : undefined),
    [f, uren, volgendeFase, datum],
  );
  // De keuze voor de periode hangt af van de invoer, niet van de gekozen periode (anders verdwijnt ze na een klik).
  const rStart = useMemo(() => bereken(naarInvoer(f, { uren, fase: "start", datum })), [f, uren, datum]);
  const bijstandStart = rStart.werk.posten.find((p) => p.id === "bijstand");
  const voordeelStart = D(rStart.werk.besteedbaarPerMaand).minus(zonder.werk.besteedbaarPerMaand);
  const meerPeriodes =
    !vasteFase(f) && periodes.length > 1 && !!bijstandStart && bijstandStart.perMaand !== null && bijstandStart.perMaand !== "0.00";
  const perioden = useMemo(
    () =>
      meerPeriodes
        ? periodes.map((p) => ({ naam: p.naam, verschil: bereken(naarInvoer(f, { uren, fase: p.fase, datum })).verschilPerMaand }))
        : undefined,
    [meerPeriodes, periodes, f, uren, datum],
  );
  const eersteJaar = useMemo(
    () => verschilEersteJaar(naarInvoer(f, { uren, fase: "start", datum }), undefined, { vasteFase: vasteFase(f) }),
    [f, uren, datum],
  );
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

  // De urengrens is zonder vrijlating berekend; dat staat erbij als er in een periode wel vrijlating is.
  const metVrijlating = periodes.some((p) => p.fase !== "geen") && voordeelStart.gt("0.5");

  return (
    <section className="uitkomst">
      <p className="alleen-print afdruk-datum">
        Berekening van {leesbareDatum(vandaag())}, met de regels die gelden op {leesbareDatum(r.datum)}. Leidenwerkt versie {__VERSIE__}.
      </p>

      <Antwoord
        r={r}
        urenTekst={urenTekst(uren)}
        eersteJaar={eersteJaar.bedrag}
        perioden={perioden}
        periode={perioden ? gekozen.naam : undefined}
        stoptVanaf={meerPeriodes && rVolgende && bijstandVan(rVolgende) === "0.00" ? stopmoment(volgendeNaam) : undefined}
      />

      {r.signalen.some((s) => s.actie) && (
        <nav className="te-doen" aria-labelledby="te-doen">
          <h2 id="te-doen">Wat u nu kunt doen:</h2>
          <ul>
            {r.signalen.map((s, i) =>
              s.actie ? (
                <li key={i}>
                  <a
                    href={`#signaal-${i}`}
                    onClick={(e) => {
                      // Geen #-adres: de app gebruikt de geschiedenis voor de stappen.
                      e.preventDefault();
                      openSignaal(i);
                    }}
                  >
                    {s.kop}
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </nav>
      )}

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
              : `${metVrijlating ? "Zonder vrijlating heeft u" : "U heeft"} ${grensUren === minUren ? `met dit loon vanaf ${urenTekst(minUren)}` : `vanaf ${urenTekst(grensUren)} met dit uurloon`} geen bijstand meer nodig.${
                  uren < grensUren
                    ? ` Bij ${uren} uur vult de bijstand uw loon nog aan.`
                    : heeftBijstand
                      ? " Nu krijgt u nog bijstand, omdat u in deze periode een deel van uw loon mag houden."
                      : ""
                }`}
          </p>
        )}
        {meerPeriodes && (
          <fieldset className="keuze compact">
            <legend>Voor welke maanden wilt u de uitkomst zien?</legend>
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
            <strong>
              {vast
                ? "U werkt al 6 maanden of langer naast de bijstand."
                : meerPeriodes
                  ? `${gekozen.naam} ${f.werktNu ? "nadat u naast de bijstand bent gaan werken" : "na de start van uw werk"}.`
                  : `${gekozen.naam}.`}
            </strong>{" "}
            {gekozen.regel}
          </p>
          {f.werktNu && meerPeriodes && fase !== periodes[0].fase && (
            <p>De vrijlating loopt ook af voor het werk dat u nu al doet. Daarom is het bedrag bij "Nu" in deze periode anders dan in de eerste maanden.</p>
          )}
          {vrijlatingTelt && (
            <p>
              {zonderVrijlatingZin(zonder.verschilPerMaand)}
              De vrijlating is het deel van uw loon dat u naast de bijstand mag houden. Vraag uw contactpersoon bij de gemeente of de vrijlating voor u geldt. De gemeente beslist dat.
            </p>
          )}
          {f.medisch && meerPeriodes && fase === periodes[0].fase && (
            <p>
              Door uw medische urenbeperking houdt u ook na de eerste maanden een deel van uw loon naast de bijstand. Kies hierboven de latere maanden
              om dat te zien.
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
              houden. Hieronder ziet u nog de oude regels. Vraag uw contactpersoon bij de gemeente wat er voor u verandert.
            </p>
          )}
        </div>
      )}

      <Vergelijking r={r} allIn={(ingevuldLoon(f)?.allIn ?? "") === "ja"} tweeBanen={f.werktNu && f.verandering === "erbij"} />
      <TabelNoten f={f} r={r} />

      {r.signalen.length > 0 && (
        <section aria-labelledby="let-op">
          <h2 id="let-op">Goed om te weten</h2>
          <InkomenVoorGrenzen r={r} />
          <ul className="signalen">
            {r.signalen.map((s, i) => (
              <li key={i} className={`${s.soort} bron-blok`}>
                <details id={`signaal-${i}`} className="signaal">
                  <summary className="signaal-kop">{s.kop}</summary>
                  <p>{metLinks(s.tekst)}</p>
                  {s.bron && (
                    <span className="signaal-bron">
                      Bron: <Bron citaat={s.bron} />
                    </span>
                  )}
                </details>
              </li>
            ))}
          </ul>
          <p className="klein">
            Heeft u geen contactpersoon bij de gemeente, of weet u niet wie dat is? Bel de gemeente Leiden op 14 071 en kies 1.
          </p>
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
        <p className="klein niet-print">Berekend met de regels die gelden op {leesbareDatum(r.datum)}. Leidenwerkt versie {__VERSIE__}.</p>
      </section>
    </section>
  );
}

/** "Maand 7 t/m 36" of "Vanaf maand 7" wordt "Vanaf maand 7"; zonder maandnummer "Daarna". */
const stopmoment = (naam?: string) => {
  const maand = /maand (\d+)/i.exec(naam ?? "")?.[1];
  return maand ? `Vanaf maand ${maand}` : "Daarna";
};

const bijstandVan = (r: Resultaat) => r.werk.posten.find((p) => p.id === "bijstand")?.perMaand ?? null;

/** Eén zin over de bijstand: blijft die, of stopt die? Alleen voor wie nu bijstand krijgt. */
function bijstandZin(r: Resultaat, stoptVanaf?: string): string | undefined {
  const nu = r.huidig.posten.find((p) => p.id === "bijstand")?.perMaand;
  const met = bijstandVan(r);
  if (!nu || nu === "0.00" || met === null) return undefined;
  if (met === "0.00") return `Uw bijstand van ${euro(nu, true)} per maand stopt. Met dit werk heeft u genoeg inkomen om geen bijstand meer nodig te hebben.`;
  if (Number(met) < 1) return "U houdt bijna geen bijstand meer: minder dan € 1 per maand.";
  if (stoptVanaf) return `In deze periode houdt u nog ${euro(met, true)} bijstand per maand, door de vrijlating. ${stoptVanaf} stopt uw bijstand.`;
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
  eersteJaar,
  perioden,
  periode,
  stoptVanaf,
}: {
  r: Resultaat;
  urenTekst: string;
  eersteJaar: string;
  /** De gekozen periode, als er meer zijn. */
  periode?: string;
  /** Het verschil per maand in elke periode, als dat per periode verschilt. */
  perioden?: { naam: string; verschil: string }[];
  /** Stopt de bijstand in de volgende periode? Dan het moment, bijvoorbeeld "Vanaf maand 7". */
  stoptVanaf?: string;
}) {
  const v = Number(r.verschilPerMaand);
  const bedrag = euro(r.verschilPerMaand.replace("-", ""), true);
  // Bij meer periodes zegt de kop over welke periode hij gaat; het lijstje eronder toont ze allemaal.
  const wanneer = periode ? ` ${periodeInZin(periode)}` : "";
  const zin =
    Math.abs(v) < 10
      ? `Met dit werk houdt u${wanneer} per maand ongeveer evenveel over als nu.`
      : periode
        ? `Met dit werk houdt u${wanneer} ongeveer ${bedrag} per maand ${v > 0 ? "meer" : "minder"} over.`
        : `Met dit werk houdt u per maand ongeveer ${bedrag} ${v > 0 ? "meer" : "minder"} over.`;
  // Houdt iemand minder over en komt dat door kosten die hij zelf betaalt? Dan staat dat erbij.
  const kosten = eigenWerkkosten(r);
  const doorKosten = v <= -10 && kosten >= 1 && v + kosten > -10;
  const overBijstand = bijstandZin(r, stoptVanaf);
  return (
    <div className={`antwoord ${Math.abs(v) < 10 ? "gelijk" : v > 0 ? "meer" : "minder"}`} aria-live="polite">
      <p className="antwoord-zin">{zin}</p>
      {doorKosten && (
        <p className="antwoord-sub">Dat komt door de kosten voor het werk die u zelf betaalt: {euro(kosten.toFixed(2), true)} per maand.</p>
      )}
      {perioden ? (
        <>
          <p className="antwoord-sub">Bij {urenTekst}:</p>
          <ul className="antwoord-lijst">
            {perioden.map((p) => (
              <li key={p.naam}>{verschilRegel(p.naam, p.verschil, " per maand")}</li>
            ))}
            <li>{verschilRegel("De eerste 12 maanden samen", eersteJaar, "")}</li>
          </ul>
        </>
      ) : (
        <p className="antwoord-sub">Bij {urenTekst}.</p>
      )}
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

function Vergelijking({ r, allIn, tweeBanen }: { r: Resultaat; allIn?: boolean; tweeBanen?: boolean }) {
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
          {id === "loon" && tweeBanen ? ", beide banen" : ""}
          {(id === "loon" || id === "loon_partner") && !allIn ? " (met vakantiegeld)" : ""}
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
      <caption>Zo is het bedrag opgebouwd</caption>
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
                      {g.omschrijving}: <strong>{g.waardeTekst}</strong>
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

/** Maakt adressen van officiële sites in een melding klikbaar, bijvoorbeeld "leiden.nl/inkomenstoeslag". */
function metLinks(tekst: string) {
  const delen = tekst.split(/((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.nl\/[A-Za-z0-9\-/_]+)/g);
  return delen.map((d, i) =>
    i % 2 === 1 ? (
      <a key={i} href={d.startsWith("http") ? d : `https://${d}`} rel="noopener">
        {d}
      </a>
    ) : (
      d
    ),
  );
}

/** Een periodenaam midden in een zin: "Maand 1 t/m 6" wordt "in maand 1 t/m 6", "Vanaf maand 7" wordt "vanaf maand 7". */
function periodeInZin(naam: string) {
  const klein = naam.charAt(0).toLowerCase() + naam.slice(1);
  if (klein.startsWith("maand")) return `in ${klein}`;
  if (klein.startsWith("rest")) return `in de ${klein}`;
  return klein;
}

/** "Zonder vrijlating zou u in deze periode € 46 per maand meer overhouden dan nu." */
function zonderVrijlatingZin(verschil: string) {
  const v = Number(verschil);
  if (Math.abs(v) < 10) return "Zonder vrijlating zou u in deze periode ongeveer evenveel overhouden als nu.";
  return `Zonder vrijlating zou u in deze periode ${euro(verschil.replace("-", ""), true)} per maand ${v > 0 ? "meer" : "minder"} overhouden dan nu.`;
}

/** "Maand 7 t/m 36: € 150 meer per maand dan nu" of "…: ongeveer evenveel als nu". */
function verschilRegel(naam: string, verschil: string, per: string) {
  const v = Number(verschil);
  const drempel = per ? 10 : 120;
  if (Math.abs(v) < drempel) return `${naam}: ongeveer evenveel als nu`;
  return `${naam}: ${euro(verschil.replace("-", ""), true)} ${v > 0 ? "meer" : "minder"}${per} dan nu`;
}

/** Klapt een melding onder "Goed om te weten" open, voor de links onder "Wat u nu kunt doen". */
function openSignaal(i: number) {
  const el = document.getElementById(`signaal-${i}`);
  if (!(el instanceof HTMLDetailsElement)) return;
  el.open = true;
  el.scrollIntoView({ block: "start" });
  el.querySelector("summary")?.focus();
}

/** De meldingen met een inkomensgrens vergelijken die grens met dit bedrag: netto loon, bijstand en ander inkomen, zonder toeslagen. */
function InkomenVoorGrenzen({ r }: { r: Resultaat }) {
  const kleuren = "Klik op een kop voor meer uitleg. Oranje: hier verandert iets of moet u iets doen. Groen: dit blijft of kan voor u.";
  if (!r.signalen.some((s) => s.tekst.includes("(grens"))) return <p className="klein">{kleuren}</p>;
  const inkomen = r.werk.posten
    .filter((p) => ["loon", "loon_partner", "ander_inkomen", "bijstand"].includes(p.id) && p.perMaand)
    .reduce((s, p) => s + Number(p.perMaand), 0);
  return (
    <p className="klein">
      {kleuren} De grenzen hieronder gaan over uw netto loon en bijstand samen, zonder toeslagen: ongeveer {euro(inkomen.toFixed(2), true)} per
      maand.
    </p>
  );
}

/** Een ingevuld bedrag netjes als euro: "€ 1.250" of "€ 14,50". */
const bedragTekst = (tekst: string) => {
  const n = getal(tekst) ?? 0;
  return Number.isInteger(n) ? euro(String(n), true) : euro(n.toFixed(2));
};

/** Korte uitleg onder de tabel bij bedragen die anders zijn dan wat de gebruiker invulde of verwacht. */
function TabelNoten({ f, r }: { f: Formulier; r: Resultaat }) {
  const noten: string[] = [];
  const loon = ingevuldLoon(f);
  const nettoLoon = r.werk.posten.find((p) => p.id === "loon")?.perMaand;
  if (loon && nettoLoon && f.verandering !== "erbij") {
    const vakantiegeld = loon.per === "uur" && loon.allIn === "ja" ? "" : ", met het vakantiegeld erbij, verdeeld over 12 maanden";
    const omgerekend = loon.per === "maand" || loon.per === "netto" ? "" : ", omgerekend naar een maand";
    noten.push(
      `U vulde ${bedragTekst(loon.bedrag)} ${LOON_PER[loon.per]} in. In de tabel staat het netto loon per maand${loon.per === "netto" || loon.per === "netto4" ? "" : ", na belasting en premies"}${omgerekend}${vakantiegeld}.`,
    );
  }
  const l = new Lezer(standaardRegels, r.datum);
  const soorten = [...new Set(f.kinderen.filter((k) => k.opvang && !getal(k.uurprijs) && k.soort).map((k) => k.soort as Opvangsoort))];
  if (soorten.length > 0) {
    const delen = soorten.map((s) => `de ${OPVANG[s]} met ${euro(maxUurprijs(l, s).toFixed(2))}`);
    const lijst = delen.length > 1 ? `${delen.slice(0, -1).join(", ")} en ${delen[delen.length - 1]}` : delen[0];
    noten.push(
      `U wist de prijs per uur van ${soorten.map((s) => `de ${OPVANG[s]}`).join(" en ")} niet. De rekenhulp rekent voor ${lijst} per uur: de hoogste prijs waarover u kinderopvangtoeslag krijgt. Is de opvang duurder, dan betaalt u meer zelf.`,
    );
  }
  if (f.leefvorm === "paar" && f.partnerWerkt && getal(f.partnerBruto) && r.werk.posten.some((p) => p.id === "loon_partner")) {
    noten.push(
      `Uw partner: u vulde ${bedragTekst(f.partnerBruto)} bruto per maand in. In de tabel staat het netto loon per maand, na belasting en premies, met het vakantiegeld erbij, verdeeld over 12 maanden.`,
    );
  }
  const korting = woonkorting(l, naarInvoer(f, { fase: "start", datum: r.datum }));
  if (korting.bedrag.gt(0)) {
    noten.push(`${korting.reden}. Daardoor is uw bijstand ${euro(korting.bedrag, true)} per maand lager dan de gewone norm.`);
  }
  if (f.woont === "kostgeld") {
    noten.push(
      f.andereBewoners && (getal(f.kostendelers) ?? 0) > 0
        ? "Uw kostgeld verandert uw bijstand niet: u woont met volwassenen van 27 jaar of ouder, en dan geldt de kostendelersnorm."
        : korting.bedrag.gt(0)
          ? "Uw kostgeld zelf staat niet in de tabel; het deel voor uw woonruimte telt wel mee voor de bijstand, zie hierboven."
          : "Uw kostgeld verandert uw bijstand niet: het deel voor uw woonruimte is niet lager dan de grens.",
    );
  }
  const gelijk = ["zorgtoeslag", "huurtoeslag", "kgb"].filter((id) => {
    const nu = r.huidig.posten.find((p) => p.id === id)?.perMaand;
    const met = r.werk.posten.find((p) => p.id === id)?.perMaand;
    return nu && met && nu === met && nu !== "0.00";
  });
  if (gelijk.length > 0 && r.werk.posten.some((p) => p.id === "loon")) {
    const namen = gelijk.map((id) => r.werk.posten.find((p) => p.id === id)!.label.toLowerCase());
    const lijst = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}` : namen[0];
    noten.push(
      `${lijst.charAt(0).toUpperCase() + lijst.slice(1)} ${gelijk.length > 1 ? "blijven" : "blijft"} gelijk: uw geschatte jaarinkomen blijft ook met dit werk onder de grens waarboven ${gelijk.length > 1 ? "ze lager worden" : "die lager wordt"}.`,
    );
  }
  if (r.werk.posten.some((p) => p.id === "iack" && p.perMaand && p.perMaand !== "0.00")) {
    noten.push(
      "De combinatiekorting zit niet in uw loon. U krijgt haar van de Belastingdienst, via de aangifte of een voorlopige aanslag. In de tabel staat het bedrag per maand.",
    );
  }
  if (f.woont === "huur" && !f.zelfstandig) {
    noten.push("Huurtoeslag staat er niet in: voor een kamer of een woning waar u de keuken, wc of douche deelt, krijgt u meestal geen huurtoeslag.");
  } else if (f.woont === "kostgeld") {
    noten.push("Huurtoeslag staat er niet in: wie bij iemand anders in huis woont, krijgt meestal geen huurtoeslag.");
  }
  noten.push("Vaste lasten zoals huur, kostgeld en zorgpremie staan niet in de tabel. Die betaalt u met en zonder werk.");
  if (noten.length === 0) return null;
  return (
    <ul className="tabel-noten">
      {noten.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  );
}
