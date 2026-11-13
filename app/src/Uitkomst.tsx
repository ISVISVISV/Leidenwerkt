import { useEffect, useMemo, useState } from "react";
import { Lezer, woonkorting, bereken, verschilEersteJaar, citaatVoorParameter, euro, vrijlatingUitleg, regimeOp, standaardRegels, D, type Fase, type Opvangsoort, type Post, type Resultaat } from "@leidenwerkt/engine";
import { Bron } from "./Bron.tsx";
import { LOON_PER, OPVANG, euroTekst, getal, ingevuld, ingevuldLoon, maxUurprijs, naarInvoer, schuifStart, vasteFase, vandaag, vraagInkomenAnderen, vraagInkomenKind, type Formulier } from "./formulier.ts";

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

export function Uitkomst({ f, bewaardeUren, onUren }: { f: Formulier; bewaardeUren?: number; onUren?: (uren: number) => void }) {
  const start = schuifStart(f);
  const extra = start.wat === "extra";
  const maxUren = Math.max(extra ? 32 : 40, start.uren);
  // Bij "meer uren" kan de schuif niet onder het huidige aantal uren.
  const minUren = f.werktNu && f.verandering === "meer" ? Math.min(start.uren, Math.round(getal(f.nuUren) ?? 0) + 1) : 1;
  // Na "Gegevens aanpassen" staat de schuif weer waar hij stond, zolang uren en loon gelijk zijn gebleven.
  const [uren, zetUrenLokaal] = useState(() =>
    bewaardeUren !== undefined && bewaardeUren >= minUren && bewaardeUren <= maxUren ? bewaardeUren : start.uren,
  );
  const setUren = (u: number) => {
    zetUrenLokaal(u);
    onUren?.(u);
  };
  const urenTekst = (u: number) => `${u} uur ${extra ? "extra werk " : ""}per week`;
  const [gekozenFase, setFase] = useState<"start" | "later" | "geen">("start");
  const { datum, teruggevallen } = useMemo(() => bruikbareDatum(f), [f]);

  const uitleg = useMemo(() => vrijlatingUitleg(naarInvoer(f, { uren, fase: "start", datum })), [f, uren, datum]);
  // Periodes met precies dezelfde uitkomst als de periode ervoor worden één periode.
  // Werkt iemand al korter dan 6 maanden, dan is een deel van de eerste periode al voorbij. Hoeveel, weet de
  // rekenhulp niet; daarom geen "maand 1 t/m 6" en geen bedrag voor de eerste 12 maanden.
  const alBezig = f.werktNu && f.werktAl === "kort";
  const periodes = useMemo(() => {
    const samen = samenvoegen(uitleg.periodes, (fase) => bereken(naarInvoer(f, { uren, fase, datum })));
    return alBezig
      ? samen.map((p, i) => (i === 0 && p.fase === "start" ? { ...p, naam: "Tot 6 maanden nadat u naast de bijstand bent gaan werken" } : p))
      : samen;
  }, [uitleg, f, uren, datum, alBezig]);
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
        ? periodes.map((p) => ({ naam: p.naam, verschil: verschilZoalsTabel(bereken(naarInvoer(f, { uren, fase: p.fase, datum }))) }))
        : undefined,
    [meerPeriodes, periodes, f, uren, datum],
  );
  const eersteJaar = useMemo(() => {
    const motor = verschilEersteJaar(naarInvoer(f, { uren, fase: "start", datum }), undefined, { vasteFase: vasteFase(f) });
    // Met de bedragen per periode zoals ze in het lijstje staan, zodat "de eerste 12 maanden samen" na te rekenen is.
    const uitLijst = perioden && eersteJaarUitPerioden(perioden);
    return uitLijst ? { ...motor, bedrag: uitLijst } : motor;
  }, [f, uren, datum, perioden]);
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
        eersteJaar={alBezig ? undefined : eersteJaar.bedrag}
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
              : `${metVrijlating ? "Zonder vrijlating heeft u" : "U heeft"} vanaf ${urenTekst(grensUren)} geen bijstand meer nodig.${
                  uren < grensUren
                    ? ""
                    : heeftBijstand
                      ? " Met dit werk krijgt u in deze periode nog bijstand, omdat u een deel van uw loon mag houden."
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

      {f.werktNu && meerPeriodes && fase !== periodes[0].fase && (
        <p className="klein">
          De vrijlating loopt ook af voor het werk dat u nu al doet. Daarom is het bedrag bij "Nu" in deze periode anders dan in de eerste
          maanden, en zegt "meer" iets over het verschil, niet over hoeveel u overhoudt.
        </p>
      )}
      {heeftBijstand && (
        <div className="toelichting">
          <p>
            <strong>
              {vast
                ? "U werkt al 6 maanden of langer naast de bijstand."
                : meerPeriodes
                  ? gekozen.naam.includes("nadat u")
                    ? `${gekozen.naam}.`
                    : `${gekozen.naam} ${f.werktNu ? "nadat u naast de bijstand bent gaan werken" : "na de start van uw werk"}.`
                  : `${gekozen.naam}.`}
            </strong>{" "}
            {gekozen.regel}
            {vrijlatingTelt && " Het deel dat u mag houden, heet de vrijlating. De gemeente beslist of die voor u geldt."}
          </p>
          {vrijlatingTelt && (
            <p>
              {zonderVrijlatingZin(verschilZoalsTabel(zonder))}
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
            {(gekozen.citaten ?? uitleg.citaten).length > 0
              ? (gekozen.citaten ?? uitleg.citaten).map((c, i) => (
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
      <TabelNoten f={f} r={r} uren={uren} />

      {r.signalen.length > 0 && (
        <section aria-labelledby="let-op">
          <h2 id="let-op">Goed om te weten{meerPeriodes ? ` ${periodeInZin(gekozen.naam)}` : ""}</h2>
          <p className="klein niet-print">Klik op een kop voor meer uitleg. Oranje: hier verandert iets of moet u iets doen. Groen: dit blijft of kan voor u.</p>
          <ul className="signalen">
            {r.signalen.map((s, i) => (
              <li key={i} className={`${s.soort} bron-blok`}>
                <details id={`signaal-${i}`} className="signaal">
                  <summary className="signaal-kop">{s.kop}</summary>
                  <p>{metLinks(s.tekst)}</p>
                  {s.tekst.includes("De grens is ongeveer") && (
                    <p>
                      {f.leefvorm === "paar" ? "Uw inkomen samen" : "Uw inkomen"}, zonder toeslagen, is ongeveer {euro(inkomenVoorGrenzen(r).toFixed(2), true)} per maand, met vakantiegeld.
                    </p>
                  )}
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
            Weet u niet wie uw contactpersoon bij de gemeente is? Bel 14 071 en kies 1.
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
  const nuExact = r.huidig.posten.find((p) => p.id === "bijstand")?.perMaand;
  const metExact = bijstandVan(r);
  if (!nuExact || nuExact === "0.00" || metExact === null) return undefined;
  // Dezelfde bedragen als in de tabel.
  const nu = (tabelBedragen(r, r.huidig).get("bijstand") ?? D(nuExact)).toFixed(2);
  const met = metExact === "0.00" ? metExact : (tabelBedragen(r, r.werk).get("bijstand") ?? D(metExact)).toFixed(2);
  if (met === "0.00") return `Uw bijstand van ${euro(nu, true)} per maand stopt. Met dit werk heeft u genoeg inkomen om geen bijstand meer nodig te hebben.`;
  if (Number(metExact) < 1) return "U houdt bijna geen bijstand meer: minder dan € 1 per maand.";
  if (stoptVanaf) return `In deze periode houdt u nog ${euro(met, true)} bijstand per maand, door de vrijlating. ${stoptVanaf} stopt uw bijstand.`;
  return `U houdt ${euro(met, true)} bijstand per maand naast uw loon.`;
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
  eersteJaar?: string;
  /** De gekozen periode, als er meer zijn. */
  periode?: string;
  /** Het verschil per maand in elke periode, als dat per periode verschilt. */
  perioden?: { naam: string; verschil: string }[];
  /** Stopt de bijstand in de volgende periode? Dan het moment, bijvoorbeeld "Vanaf maand 7". */
  stoptVanaf?: string;
}) {
  const verschil = verschilZoalsTabel(r);
  const v = Number(verschil);
  const bedrag = euro(verschil.replace("-", ""), true);
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
            {eersteJaar !== undefined && <li>{verschilRegel("De eerste 12 maanden samen", eersteJaar, "")}</li>}
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

function waarde(p: Post | undefined, bedragen: Map<string, ReturnType<typeof D>>): string {
  if (!p) return "–";
  if (p.perMaand === null) return "niet berekend";
  return euro((bedragen.get(p.id) ?? D(p.perMaand)).toFixed(2), true);
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
  const bedragenNu = tabelBedragen(r, r.huidig);
  const bedragenWerk = tabelBedragen(r, r.werk);
  const meegeteld = (s: Resultaat["huidig"], kosten: boolean) => somZoalsTabel(r, s, kosten ? "eraf" : "binnen");
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
        <td>{waarde(a, bedragenNu)}</td>
        <td>{waarde(b, bedragenWerk)}</td>
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
          <td>{euro(somZoalsTabel(r, r.huidig), true)}</td>
          <td>{euro(somZoalsTabel(r, r.werk), true)}</td>
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

/** "Zonder vrijlating zou u € 46 per maand meer overhouden dan nu." */
function zonderVrijlatingZin(verschil: string) {
  const v = Number(verschil);
  if (Math.abs(v) < 10) return "Zonder vrijlating zou u ongeveer evenveel overhouden als nu.";
  return `Zonder vrijlating zou u ${euro(verschil.replace("-", ""), true)} per maand ${v > 0 ? "meer" : "minder"} overhouden dan nu.`;
}

/** "Maand 7 t/m 36: € 150 per maand meer" of "…: ongeveer evenveel als nu". */
function verschilRegel(naam: string, verschil: string, per: string) {
  const v = Number(verschil);
  const drempel = per ? 10 : 120;
  if (Math.abs(v) < drempel) return `${naam}: ongeveer evenveel als nu`;
  return `${naam}: ${euro(verschil.replace("-", ""), true)}${per} ${v > 0 ? "meer" : "minder"}`;
}

const LIDWOORD: Record<Opvangsoort, string> = { dagopvang: "het", bso: "de", gastouder: "de" };

/**
 * De eerste 12 maanden samen, uit het lijstje per periode ("Maand 1 t/m 6", "Maand 7 t/m 36", "Vanaf maand 7").
 * Lukt het niet om elke periode te lezen, dan undefined: dan geldt het bedrag van de rekenkern.
 */
function eersteJaarUitPerioden(perioden: { naam: string; verschil: string }[]): string | undefined {
  let totaal = D(0);
  let maanden = 0;
  for (const p of perioden) {
    const m = p.naam.match(/^Maand (\d+) t\/m (\d+)$/) ?? p.naam.match(/^Vanaf maand (\d+)$/);
    if (!m) return undefined;
    const van = Number(m[1]);
    const tot = Math.min(12, m[2] ? Number(m[2]) : 12);
    if (tot >= van) {
      totaal = totaal.plus(D(p.verschil).times(tot - van + 1));
      maanden += tot - van + 1;
    }
  }
  return maanden === 12 ? totaal.toFixed(2) : undefined;
}

/** Afronden op hele euro's, zoals euro(…, true): een halve euro naar boven. */
const heel = (x: string) => D(x).toDecimalPlaces(0, 4);

/**
 * De bedragen per rij zoals de tabel ze toont, op hele euro's. Elke rij wordt afgerond, behalve de bijstand:
 * die vult aan tot de norm (plus wat u mag houden), dus die neemt het afrondingsverschil van de andere rijen
 * op. Dan is "U houdt over" precies het afgeronde totaal, en verspringt het niet met € 1 als de urenschuif
 * een uur verschuift terwijl er in werkelijkheid niets verandert.
 */
function tabelBedragen(r: Resultaat, s: Resultaat["huidig"]): Map<string, ReturnType<typeof D>> {
  const posten = s.posten.filter((p) => p.perMaand !== null && !r.nietMeegenomen.some((n) => n.id === p.id));
  const uit = new Map(posten.map((p) => [p.id, heel(p.perMaand!)]));
  const bijstand = posten.find((p) => p.id === "bijstand");
  if (bijstand && !D(bijstand.perMaand!).isZero()) {
    const totaal = heel(posten.reduce((t, p) => t.plus(D(p.perMaand!)), D(0)).toFixed(2));
    const rest = posten.filter((p) => p.id !== "bijstand").reduce((t, p) => t.plus(uit.get(p.id)!), D(0));
    uit.set("bijstand", totaal.minus(rest));
  }
  return uit;
}

/** Som van de rijen zoals de tabel ze toont. Zo zijn totalen, "U houdt over" en alle verschillen na te rekenen. */
function somZoalsTabel(r: Resultaat, s: Resultaat["huidig"], wat: "binnen" | "eraf" | "alles" = "alles") {
  const bedragen = tabelBedragen(r, s);
  return s.posten
    .filter((p) => bedragen.has(p.id))
    .filter((p) => wat === "alles" || (p.soort === "kosten") === (wat === "eraf"))
    .reduce((t, p) => t.plus(bedragen.get(p.id)!), D(0));
}

/** Het verschil per maand zoals de tabel het toont: "U houdt over" met werk min nu. */
function verschilZoalsTabel(r: Resultaat): string {
  return somZoalsTabel(r, r.werk).minus(somZoalsTabel(r, r.huidig)).toFixed(2);
}

/**
 * Voegt opeenvolgende periodes samen als de uitkomst precies gelijk is, bijvoorbeeld als de bijstand al
 * eerder stopt. "Maand 7 t/m 36" en "Vanaf maand 37" worden dan "Vanaf maand 7".
 */
function samenvoegen<P extends { fase: Fase; naam: string }>(lijst: P[], reken: (fase: Fase) => Resultaat): P[] {
  const uit: P[] = [];
  let vorige: Resultaat | undefined;
  for (const p of lijst) {
    const nu = reken(p.fase);
    const laatste = uit[uit.length - 1];
    const begin = laatste?.naam.match(/^Maand (\d+) t\/m \d+$/);
    const eind = p.naam.match(/^(?:Maand \d+ t\/m (\d+)|Vanaf maand \d+)$/);
    if (laatste && vorige && begin && eind && gelijkeUitkomst(vorige, nu)) {
      uit[uit.length - 1] = { ...laatste, naam: eind[1] ? `Maand ${begin[1]} t/m ${eind[1]}` : `Vanaf maand ${begin[1]}` };
    } else {
      uit.push(p);
    }
    vorige = nu;
  }
  return uit;
}

function gelijkeUitkomst(a: Resultaat, b: Resultaat): boolean {
  const posten = (r: Resultaat) => JSON.stringify(r.werk.posten.map((p) => [p.id, p.perMaand]));
  return a.huidig.besteedbaarPerMaand === b.huidig.besteedbaarPerMaand && a.werk.besteedbaarPerMaand === b.werk.besteedbaarPerMaand && posten(a) === posten(b);
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
function inkomenVoorGrenzen(r: Resultaat): number {
  const bedragen = tabelBedragen(r, r.werk);
  return ["loon", "loon_partner", "ander_inkomen", "bijstand"].reduce((som, id) => som + Number(bedragen.get(id) ?? 0), 0);
}

const bedragTekst = euroTekst;

/** Korte uitleg onder de tabel bij bedragen die anders zijn dan wat de gebruiker invulde of verwacht. */
function TabelNoten({ f, r, uren }: { f: Formulier; r: Resultaat; uren: number }) {
  const noten: string[] = [];
  const loon = ingevuldLoon(f);
  const nettoLoon = r.werk.posten.find((p) => p.id === "loon")?.perMaand;
  if (loon && nettoLoon && f.verandering !== "erbij") {
    const vakantiegeld = loon.per === "uur" && loon.allIn === "ja" ? "" : ", met vakantiegeld, verdeeld over 12 maanden";
    const omgerekend = loon.per === "maand" || loon.per === "netto" ? "" : ", omgerekend naar een maand";
    // Bij een maand- of weekloon schaalt het loon mee met de urenschuif. Staat de schuif op een ander aantal
    // uren dan bij het ingevulde loon hoort, dan noemt de zin beide, zodat het bedrag in de tabel te volgen is.
    // Een bruto loon schaalt precies mee. Een netto loon niet: over meer loon betaalt u verhoudingsgewijs meer
    // belasting. Daarom komt het netto bedrag uit de tabel, zonder vakantiegeld (de rekenhulp rekent een netto
    // loon terug met het vakantiegeld als vast deel erbovenop).
    const ingevuldeUren = getal(f.werktNu && f.verandering === "meer" ? f.nuUren : f.uren) ?? 0;
    let geschaald = "";
    if (loon.per !== "uur" && ingevuldeUren > 0 && uren !== ingevuldeUren) {
      const netto = loon.per === "netto" || loon.per === "nettoweek";
      const perWeek = loon.per === "week" || loon.per === "nettoweek";
      const bedrag = netto
        ? (Number(nettoLoon) / (1 + Number(new Lezer(standaardRegels, r.datum).breuk("wml.vakantiebijslag")))) * (perWeek ? 12 / 52 : 1)
        : ((getal(loon.bedrag) ?? 0) * uren) / ingevuldeUren;
      geschaald = `, bij ${ingevuldeUren} uur per week. Bij ${uren} uur is dat ${netto ? "ongeveer " : ""}${euro(String(Math.round(bedrag)), true)} ${LOON_PER[loon.per]}`;
    }
    noten.push(
      `U vulde ${bedragTekst(loon.bedrag)} ${LOON_PER[loon.per]} in${geschaald}. In de tabel staat het netto loon${loon.per === "netto" || loon.per === "nettoweek" ? "" : ": na belasting en premies"}${omgerekend}${vakantiegeld}.`,
    );
  }
  if (r.werk.posten.some((p) => p.id === "huurtoeslag" && p.perMaand)) {
    const wie = [
      vraagInkomenAnderen(f) && f.huisgenotenOnbekend ? "uw huisgenoten" : "",
      f.kinderen.some((k) => vraagInkomenKind(f, k) && k.inkomenOnbekend) ? "uw kind" : "",
    ].filter(Boolean);
    if (wie.length > 0) noten.push(`Het inkomen van ${wie.join(" en ")} is niet meegeteld. Daardoor kan uw huurtoeslag lager zijn dan hier staat.`);
  }
  const l = new Lezer(standaardRegels, r.datum);
  const soorten = [...new Set(f.kinderen.filter((k) => k.opvang && !getal(k.uurprijs) && k.soort).map((k) => k.soort as Opvangsoort))];
  if (soorten.length > 0) {
    const delen = soorten.map((s) => `${LIDWOORD[s]} ${OPVANG[s]} met ${euro(maxUurprijs(l, s).toFixed(2))}`);
    const lijst = delen.length > 1 ? `${delen.slice(0, -1).join(", ")} en ${delen[delen.length - 1]}` : delen[0];
    noten.push(
      `U wist de prijs van ${soorten.map((s) => `${LIDWOORD[s]} ${OPVANG[s]}`).join(" en ")} niet. De rekenhulp rekent ${soorten.length > 1 ? `voor ${lijst}` : `met ${euro(maxUurprijs(l, soorten[0]).toFixed(2))}`} per uur: de hoogste prijs waarover u toeslag krijgt. Is de opvang duurder, dan betaalt u meer zelf.`,
    );
  }
  if (f.leefvorm === "paar" && f.partnerWerkt && getal(f.partnerBruto) && r.werk.posten.some((p) => p.id === "loon_partner")) {
    noten.push(
      `Uw partner: u vulde ${bedragTekst(f.partnerBruto)} bruto per maand in. In de tabel staat het netto loon: na belasting en premies, met vakantiegeld, verdeeld over 12 maanden.`,
    );
  }
  const korting = woonkorting(l, naarInvoer(f, { fase: "start", datum: r.datum }));
  if (korting.bedrag.gt(0)) {
    noten.push(`${korting.reden}. Daardoor is uw bijstand ${euro(korting.bedrag, true)} per maand lager dan de gewone norm.`);
  }
  if (f.woont === "kostgeld") {
    noten.push(
      (getal(f.kostendelers) ?? 0) > 0
        ? "Uw kostgeld verandert uw bijstand niet, omdat er iemand van 27 jaar of ouder bij u woont. Dan geldt de kostendelersnorm."
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
      `${lijst.charAt(0).toUpperCase() + lijst.slice(1)} ${gelijk.length > 1 ? "blijven" : "blijft"} gelijk, omdat uw inkomen onder de grens blijft waarboven ${gelijk.length > 1 ? "ze dalen" : "die daalt"}.`,
    );
  }
  const lager = ["zorgtoeslag", "huurtoeslag", "kgb"].filter((id) => {
    const nu = Number(r.huidig.posten.find((p) => p.id === id)?.perMaand ?? 0);
    const met = Number(r.werk.posten.find((p) => p.id === id)?.perMaand ?? 0);
    return nu > 0 && met < nu;
  });
  if (lager.length > 0 && r.werk.posten.some((p) => p.id === "loon")) {
    const namen = lager.map((id) => r.werk.posten.find((p) => p.id === id)?.label.toLowerCase() ?? (id === "kgb" ? "kindgebonden budget" : id));
    const lijst = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}` : namen[0];
    noten.push(`${lijst.charAt(0).toUpperCase() + lijst.slice(1)} ${lager.length > 1 ? "dalen" : "daalt"}, omdat uw inkomen stijgt.`);
  }
  if (r.werk.posten.some((p) => p.id === "iack" && p.perMaand && p.perMaand !== "0.00")) {
    noten.push(
      "De combinatiekorting krijgt u apart van de Belastingdienst, via de aangifte of een voorlopige aanslag.",
    );
  }
  if (f.woont === "huur" && !f.zelfstandig) {
    noten.push("Huurtoeslag staat er niet in: voor een kamer of een woning waar u de keuken, wc of douche deelt, krijgt u meestal geen huurtoeslag.");
  } else if (f.woont === "kostgeld" || f.woont === "inwonend") {
    noten.push("Huurtoeslag staat er niet in: wie bij iemand anders in huis woont, krijgt meestal geen huurtoeslag.");
  }
  noten.push("Vaste lasten zoals huur, kostgeld en zorgpremie staan niet in de tabel, want die betaalt u met en zonder werk.");
  if (noten.length === 0) return null;
  return (
    <ul className="tabel-noten">
      {noten.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  );
}
