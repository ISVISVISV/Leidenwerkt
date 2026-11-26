import { useEffect, useRef, useState } from "react";
import { CITATEN, Lezer, euro, sociaalMinimum, standaardRegels, type Opvangsoort } from "@rekenhulp/rekenkern";
import { Bron, Datum, Keuze, Kopvlak, Vangnet, Veld, Vinkjes } from "@rekenhulp/ui";
import { aowVan, bedragId, bedragSoorten, metAow, soortOpties, controleer, naarInvoer, infoVan, rekendatum, vraagWerkNaastBijstand, vraagAantal, vraagAnderen, vraagInkomenKind, vraagOpvang, naarOpvang, type KindInfo, leegFormulier, minderjarigen, soortenId, uitkeringId, vraagHuur, vraagUitkering, vraagInkomen, vraagLangLaag, vraagStudie, type Fouten, type Formulier, type InkomenVelden } from "./formulier.ts";
import { Icoon } from "./iconen.tsx";
import { Overzicht } from "./Overzicht.tsx";
import { BEDRAGVRAAG, BEZIT, JA_NEE, LANG_LAAG, OPVANG_KEUZE, OPVANGSOORTEN, UITKERINGEN, VRAAG, woonOpties } from "./teksten.ts";

const STAPPEN = ["Uw huishouden", "Uw inkomen", "Geld en bezit", "Overzicht"];

type StapProps = { f: Formulier; zet: <K extends keyof Formulier>(k: K, v: Formulier[K]) => void; fouten: Fouten };

export function App() {
  const [f, setF] = useState<Formulier>(leegFormulier);
  const [stap, setStap] = useState(0);
  const [fouten, setFouten] = useState<Fouten>({});
  const kop = useRef<HTMLHeadingElement>(null);
  const nuFout = stap > 0 && stap < STAPPEN.length ? controleer(f, stap) : {};
  const zichtbareFouten: Fouten = Object.fromEntries(Object.entries(fouten).filter(([id]) => id in nuFout));

  // Een nieuwe stap begint bovenaan de pagina, ook als u ver naar beneden stond. Daarna gaat de focus naar de kop,
  // zonder te scrollen, zodat een schermlezer de nieuwe stap voorleest.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (stap > 0) kop.current?.focus({ preventScroll: true });
  }, [stap]);

  // De terugknop van de browser gaat een stap terug.
  useEffect(() => {
    // De browser zet de positie op de pagina niet terug bij een stap terug: elke stap begint bovenaan.
    history.scrollRestoration = "manual";
    history.replaceState({ stap: 0 }, "");
    const bijTerug = (e: PopStateEvent) => {
      setFouten({});
      setStap(typeof e.state?.stap === "number" ? (e.state.stap as number) : 0);
    };
    window.addEventListener("popstate", bijTerug);
    return () => window.removeEventListener("popstate", bijTerug);
  }, []);

  const naarStap = (doel: number) => {
    if (doel > stap) history.pushState({ stap: doel }, "");
    else if (doel < stap) history.go(doel - stap);
    setStap(doel);
  };
  const zet = <K extends keyof Formulier>(k: K, v: Formulier[K]) => setF((oud) => ({ ...oud, [k]: v }));
  const verder = () => {
    const nieuw = controleer(f, stap);
    setFouten(nieuw);
    if (Object.keys(nieuw).length === 0) naarStap(stap + 1);
    else requestAnimationFrame(() => document.querySelector<HTMLElement>(".foutsamenvatting")?.focus());
  };

  return (
    <>
      {/* De eerste pagina en het overzicht hebben een groot rood vlak met de kop. Bij de vragen is het vlak laag. */}
      <Kopvlak tool="Leidengeldwijzer" groot={stap === 0 || stap === 4} breed={stap === 4}>
        {stap === 0 && (
          <>
            <h1>Welke regelingen kunt u krijgen?</h1>
            <p className="kopvlak-tekst">Dit duurt ongeveer 5 minuten.</p>
          </>
        )}
        {stap === 4 && (
          <>
            <h1 ref={kop} tabIndex={-1}>
              {STAPPEN[3]}
            </h1>
            <p className="kopvlak-tekst">
              Dit overzicht is een schatting. Leidengeldwijzer gebruikt alleen wat u heeft ingevuld. Leidengeldwijzer bewaart niets. Wilt u het
              overzicht houden? Druk het dan af. Of sla het op als pdf.
            </p>
            <button type="button" className="tweedeknop printknop" onClick={() => window.print()}>
              <Icoon naam="print" /> Afdrukken of opslaan als pdf
            </button>
          </>
        )}
      </Kopvlak>

      <div className={stap === 4 ? "pagina lgw breed" : "pagina lgw"}>
        <main className={stap === 4 ? "over-rand" : stap === 0 ? "kaart over-rand" : "kaart"}>
          {stap === 0 && <Start onStart={() => naarStap(1)} />}

          {stap > 0 && stap < 4 && (
            <>
              <ol className="voortgang" aria-label="Voortgang">
                {STAPPEN.map((naam, i) => (
                  <li key={naam} aria-current={i + 1 === stap ? "step" : undefined} className={i + 1 < stap || stap === STAPPEN.length ? "klaar" : undefined}>
                    <span className="nummer">{i + 1}</span>
                    <span className="naam">{naam}</span>
                    {i + 1 < stap && <span className="sr"> (klaar)</span>}
                  </li>
                ))}
              </ol>
              <h1 ref={kop} tabIndex={-1}>
                {STAPPEN[stap - 1]}
              </h1>
              {stap < STAPPEN.length && Object.keys(zichtbareFouten).length > 0 && (
                <div className="melding waarschuwing foutsamenvatting" role="alert" tabIndex={-1}>
                  <p>{Object.keys(zichtbareFouten).length === 1 ? "Eén vraag is nog niet goed ingevuld:" : `${Object.keys(zichtbareFouten).length} vragen zijn nog niet goed ingevuld:`}</p>
                  <ul>
                    {Object.entries(zichtbareFouten).map(([id, melding]) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            naarVraag(id);
                          }}
                        >
                          {vraagVan(id) ? `${vraagVan(id)}: ` : ""}
                          {melding}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {stap === 1 && <StapHuishouden f={f} zet={zet} fouten={zichtbareFouten} />}
          {stap === 2 && <StapInkomen f={f} zet={zet} fouten={zichtbareFouten} />}
          {stap === 3 && <StapGeld f={f} zet={zet} fouten={zichtbareFouten} />}
          {stap === 4 && (
            <Vangnet naam="Leidengeldwijzer">
              <Overzicht f={f} />
            </Vangnet>
          )}

          {stap > 0 && (
            <div className="knoppen">
              {stap < 4 && (
                <button type="button" className="hoofdknop" onClick={verder}>
                  {stap === 3 ? "Bekijk het overzicht" : "Volgende stap"}
                </button>
              )}
              <button
                type="button"
                className="tweedeknop"
                onClick={() => {
                  setFouten({});
                  naarStap(stap - 1);
                }}
              >
                {stap === 4 ? "Gegevens aanpassen" : "Vorige stap"}
              </button>
            </div>
          )}
        </main>

        <footer className="voet">
          <p>
            Wat u op deze website invult, blijft op uw eigen telefoon of computer. Het wordt niet verstuurd en niet bewaard. Sluit u de pagina, dan
            is alles weg.
          </p>
          <p>
            Leidengeldwijzer geeft een schatting. Krijgt u een regeling echt? Dat beslist de organisatie die de regeling geeft. Bijvoorbeeld de gemeente Leiden of Dienst Toeslagen. Leidengeldwijzer
            is geen product van de gemeente.
          </p>
          <p>
            Leidengeldwijzer is gemaakt door Ian Vriend, met hulp van AI. Iedereen kan de{" "}
            <a href="https://github.com/ISVISVISV/Rekenhulp" rel="noopener noreferrer">
              broncode
            </a>{" "}
            bekijken en gebruiken (licentie EUPL-1.2). Versie {__VERSIE__}.
          </p>
        </footer>
      </div>
    </>
  );
}

function Start({ onStart }: { onStart: () => void }) {
  return (
    <section className="start">
      <p className="inleiding">
        Heeft u een laag inkomen? Dan kunt u misschien hulp krijgen van de gemeente Leiden. U kunt misschien ook geld krijgen van Dienst
        Toeslagen. Leidengeldwijzer laat zien welke regelingen er voor u zijn.
      </p>
      <p>U heeft nodig:</p>
      <ul>
        <li>uw netto inkomen per maand</li>
        <li>het netto inkomen van uw partner per maand</li>
        <li>uw kale huur per maand, als u huurt</li>
        <li>hoeveel geld en bezit u ongeveer heeft</li>
      </ul>
      <p>Leidengeldwijzer is voor inwoners van Leiden van 18 jaar of ouder.</p>
      <button type="button" className="hoofdknop" onClick={onStart}>
        Begin de check
      </button>
    </section>
  );
}

/** Bron uit de regeldata (met bedragen die per periode veranderen). */
/** De tekst van de vraag bij een veld of keuze, voor de foutensamenvatting. */
function vraagVan(id: string): string {
  if (typeof document === "undefined") return "";
  const label = document.querySelector(`label[for="${id}"]`)?.textContent;
  if (label) return label.trim().replace(/[?:]$/, "");
  const legend = document.querySelector(`input[name="${id}"]`)?.closest("fieldset")?.querySelector("legend")?.textContent;
  return legend ? legend.trim().replace(/[?:]$/, "") : "";
}

function naarVraag(id: string) {
  const doel = document.getElementById(id) ?? document.querySelector<HTMLInputElement>(`input[name="${id}"]`);
  doel?.focus();
  doel?.scrollIntoView({ block: "center" });
}

function StapHuishouden({ f, zet, fouten }: StapProps) {
  const paar = f.partner === "ja";
  return (
    <section>
      <Datum id="geboren" legend={VRAAG.geboren} eigen waarde={f.geboren} onChange={(v) => zet("geboren", v)} fout={fouten.geboren} />
      <Keuze
        naam="partner"
        legend={VRAAG.partner}
        hint={
          <>
            <p className="hint-kop">Wie is uw partner?</p>
            <p>Uw partner is uw man of vrouw.</p>
            <p>
              Woont u samen met iemand en zorgt u voor elkaar? Dan is die persoon ook uw partner. U doet dan bijvoorbeeld samen boodschappen. Of u
              betaalt samen de rekeningen. U hoeft niet verliefd op elkaar te zijn.
            </p>
            <p className="hint-kop">Wie is geen partner?</p>
            <p>De volgende mensen zijn geen partner:</p>
            <ul>
              <li>uw vader of moeder</li>
              <li>uw kind</li>
              <li>de partner van uw vader of moeder</li>
              <li>iemand die bij u woont omdat u hulp nodig heeft</li>
              <li>iemand die bij u woont omdat hij of zij zelf hulp nodig heeft</li>
            </ul>
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.pw3} />
            </p>
          </>
        }
        waarde={f.partner}
        onChange={(v) => zet("partner", v)}
        fout={fouten.partner}
        opties={JA_NEE}
      />
      {f.partner === "ja" && (
        <Datum id="partnerGeboren" legend={VRAAG.partnerGeboren} waarde={f.partnerGeboren} onChange={(v) => zet("partnerGeboren", v)} fout={fouten.partnerGeboren} />
      )}

      <h2 className="deel">Kinderen</h2>
      <Keuze
        naam="heeftKinderen"
        legend={VRAAG.heeftKinderen}
        hint="Tel ook kinderen van 18 jaar of ouder. Woont uw kind een deel van de week bij u? Tel het dan ook mee."
        waarde={f.heeftKinderen} onChange={(v) => zet("heeftKinderen", v)} fout={fouten.heeftKinderen} opties={JA_NEE} />
      {f.heeftKinderen === "ja" && (
        <>
          <div className="kinderen-kader">
          {f.kinderen.map((k, i) => (
            <div key={i} className="kind">
              <Datum
                id={`kind${i}`}
                legend={VRAAG.kind(i, f.kinderen.length)}
                kind
                waarde={k}
                onChange={(v) => zet("kinderen", f.kinderen.map((x, j) => (i === j ? v : x)))}
                fout={fouten[`kind${i}`]}
              />
              <KindVragen f={f} i={i} zet={zet} fouten={fouten} />
              {f.kinderen.length > 1 && (
                <button
                  type="button"
                  className="stilleknop"
                  onClick={() => {
                    zet("kinderen", f.kinderen.filter((_, j) => j !== i));
                    zet("kindInfo", f.kindInfo.filter((_, j) => j !== i));
                  }}
                >
                  Kind {i + 1} verwijderen
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="tweedeknop toevoegknop"
            onClick={() => {
              const nieuw = f.kinderen.length;
              zet("kinderen", [...f.kinderen, ""]);
              // De focus gaat naar de geboortedatum van het nieuwe kind, net als in Leidenwerkt.
              requestAnimationFrame(() => document.getElementById(`kind${nieuw}`)?.focus());
            }}
          >
            Kind toevoegen
          </button>
          </div>
          {minderjarigen(f) > 0 && (
            <Keuze
              naam="kinderbijslag"
              legend={VRAAG.kinderbijslag}
              hint={
                <>
                  <p>Kinderbijslag krijgt u van de SVB voor kinderen jonger dan 18 jaar.</p>
                  <p className="bron-blok">
                    Bron: <Bron citaat={CITATEN.kinderbijslagWie} />
                  </p>
                </>
              }
              waarde={f.kinderbijslag}
              onChange={(v) => zet("kinderbijslag", v)}
              fout={fouten.kinderbijslag}
              opties={JA_NEE}
            />
          )}
        </>
      )}

      <h2 className="deel">Wonen</h2>
      <Keuze
        naam="woont"
        legend={VRAAG.woont}
        hint={
          <>
            <p>
              Huurt u, dan maakt het uit of u de keuken, wc of douche deelt met mensen die niet bij uw huishouden horen. Huurtoeslag is er meestal
              alleen voor een woning met een eigen voordeur, keuken, wc en douche. Een flat of appartement telt ook, als u die niet met anderen
              deelt.
            </p>
            <p>Woont u bij uw ouders, familie of vrienden? Kies dan een van de twee antwoorden die met "Bij iemand anders in huis" beginnen.</p>
            <p>
              Slaapt u in een daklozenopvang zonder begeleiding, of nu eens hier en dan weer daar? Kies dan "Ik heb geen vaste woonplek". Dat
              geldt ook als u geen adres heeft.
            </p>
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.htZelfstandig} />
            </p>
          </>
        }
        waarde={f.woont}
        fout={fouten.woont}
        onChange={(v) => zet("woont", v)}
        opties={woonOpties(paar)}
      />
      {vraagHuur(f) && (
        <Veld
          id="kaleHuur"
          label={VRAAG.kaleHuur}
          hint="De kale huur is de huur zonder servicekosten. Gas, water en licht tellen ook niet mee. U vindt de kale huur in uw huurcontract. Of op het overzicht van uw verhuurder."
          voorbeeld="bijv. 750"
          voorvoegsel="€"
          waarde={f.kaleHuur}
          onChange={(v) => zet("kaleHuur", v)}
          fout={fouten.kaleHuur}
        />
      )}
      <Keuze
        naam="andereBewoners"
        legend={VRAAG.andereBewoners}
        hint="Bijvoorbeeld een vriend of familielid. Uw partner en uw kinderen tellen hier niet mee."
        waarde={f.andereBewoners}
        onChange={(v) => zet("andereBewoners", v)}
        fout={fouten.andereBewoners}
        opties={JA_NEE}
      />
      {vraagAantal(f) && (
        <>
          <Veld id="andereAantal" label={VRAAG.andereAantal} voorbeeld="bijv. 1" waarde={f.andereAantal} onChange={(v) => zet("andereAantal", v)} fout={fouten.andereAantal} />
          <Veld
            id="andereOuder"
            label={VRAAG.andereOuder}
            hint={
              <>
                <p>
                  Niet iedereen telt mee. De meeste studenten tellen niet mee. Ook niet: iemand die met een contract en tegen een gewone prijs een
                  kamer van u huurt of bij u in de kost is, en die geen familie van u is. Huurt u zelf een kamer? Dan tellen andere kamerhuurders met
                  een eigen contract en een gewone huurprijs ook niet mee. Twijfelt u? Vraag het de gemeente.
                </p>
                <p className="bron-blok">
                  Bron: <Bron citaat={CITATEN.kostendelerUitzonderingen} />
                </p>
              </>
            }
            voorbeeld="bijv. 1"
            waarde={f.andereOuder}
            onChange={(v) => zet("andereOuder", v)}
            fout={fouten.andereOuder}
          />
        </>
      )}
      {vraagAnderen(f) && (
        <>
          {!f.andereOnbekend ? (
            <Veld
              id="andereInkomen"
              label={VRAAG.andereInkomen}
              hint={
                <>
                  <p>
                    Dit inkomen telt mee voor de huurtoeslag. Tel uw partner en uw kinderen hier niet mee. Weet u het niet precies? Vul dan een
                    schatting in. Heeft niemand inkomen? Vul dan 0 in. Weet u het niet? Kies dan "Ik weet dit inkomen niet".
                  </p>
                  <p className="bron-blok">
                    Bron: <Bron citaat={CITATEN.htMedebewoners} />
                  </p>
                </>
              }
              voorvoegsel="€"
              voorbeeld="bijv. 25.000"
              waarde={f.andereInkomen}
              onChange={(v) => zet("andereInkomen", v)}
              fout={fouten.andereInkomen}
            />
          ) : (
            <p className="vraag-tekst">{VRAAG.andereInkomen}</p>
          )}
          <label className="vinkje">
            <input type="checkbox" checked={f.andereOnbekend} onChange={(e) => zet("andereOnbekend", e.target.checked)} />
            <span>Ik weet dit inkomen niet</span>
          </label>
        </>
      )}

    </section>
  );
}

/** Per kind: de opvang (jonger dan 13) en het inkomen (18 jaar of ouder, voor de huurtoeslag). Zoals in Leidenwerkt. */
function KindVragen({ f, i, zet, fouten }: StapProps & { i: number }) {
  const k = f.kinderen[i];
  const info = infoVan(f, i);
  const zetInfo = (deel: Partial<KindInfo>) =>
    zet(
      "kindInfo",
      f.kinderen.map((_, j) => (j === i ? { ...infoVan(f, j), ...deel } : infoVan(f, j))),
    );
  const welke = f.kinderen.length > 1 ? `kind ${i + 1}` : "uw kind";
  return (
    <>
      {vraagOpvang(k) && (
        <Keuze naam={`opvang${i}`} legend={VRAAG.opvang} waarde={info.opvang} onChange={(v) => zetInfo({ opvang: v })} fout={fouten[`opvang${i}`]} opties={OPVANG_KEUZE} />
      )}
      {vraagOpvang(k) && naarOpvang(info) && (
        <div className="opvang">
          <Keuze naam={`soort${i}`} legend={VRAAG.soortOpvang} waarde={info.soort} onChange={(v) => zetInfo({ soort: v })} fout={fouten[`soort${i}`]} opties={OPVANGSOORTEN} />
          <Veld id={`kind${i}uren`} label={info.opvang === "straks" ? VRAAG.urenStraks : VRAAG.uren} voorbeeld="bijv. 16" waarde={info.uren} onChange={(v) => zetInfo({ uren: v })} fout={fouten[`kind${i}uren`]} achtervoegsel="uur" />
          <Veld
            id={`kind${i}prijs`}
            label={VRAAG.prijs}
            hint={
              info.soort && maxPrijsTekst(info.soort)
                ? `Weet u de prijs nog niet? Laat het vak dan leeg. Leidengeldwijzer rekent dan met € ${maxPrijsTekst(info.soort)} per uur. Dat is de hoogste prijs waarvoor u toeslag krijgt.`
                : "Weet u de prijs nog niet? Laat het vak dan leeg."
            }
            voorbeeld={`bijv. ${maxPrijsTekst(info.soort || "dagopvang") || "10,50"}`}
            voorvoegsel="€"
            waarde={info.prijs}
            onChange={(v) => zetInfo({ prijs: v })}
            fout={fouten[`kind${i}prijs`]}
          />
        </div>
      )}
      {vraagInkomenKind(f, k) && (
        <>
          {!info.inkomenOnbekend ? (
            <Veld
              id={`kind${i}inkomen`}
              label={VRAAG.inkomenKind(welke)}
              hint={
                <>
                  <p>
                    Dit inkomen telt mee voor de huurtoeslag. Kijk op de jaaropgave of de loonstrook van uw kind. Vul het hele bedrag in.
                    Leidengeldwijzer trekt zelf af wat niet meetelt. Studiefinanciering telt niet mee. Heeft uw kind geen inkomen? Vul dan 0 in.
                  </p>
                  <p className="bron-blok">
                    Bron: <Bron citaat={CITATEN.htInkomenKind} />
                  </p>
                </>
              }
              voorvoegsel="€"
              voorbeeld="bijv. 4.000"
              waarde={info.inkomen}
              onChange={(v) => zetInfo({ inkomen: v })}
              fout={fouten[`kind${i}inkomen`]}
            />
          ) : (
            <p className="vraag-tekst">{VRAAG.inkomenKind(welke)}</p>
          )}
          <label className="vinkje">
            <input type="checkbox" checked={info.inkomenOnbekend} onChange={(e) => zetInfo({ inkomenOnbekend: e.target.checked })} />
            <span>Ik weet dit inkomen niet</span>
          </label>
        </>
      )}
    </>
  );
}

/** Hoogste uurprijs voor de toeslag, als tekst ("11,23"), of leeg als die voor vandaag niet bekend is. Zoals in Leidenwerkt. */
const maxPrijsTekst = (soort: Opvangsoort) => {
  try {
    return new Lezer(standaardRegels, rekendatum().datum).bedrag(`kot.max_uurprijs.${soort}`).toFixed(2).replace(".", ",");
  } catch {
    return "";
  }
};

/**
 * Wat "inkomen op bijstandsniveau" betekent, met het bedrag voor dit huishouden: het sociaal minimum zonder vakantiegeld.
 * "Bijstandsniveau" is het woord van de gemeente zelf. "Laag" klinkt als een oordeel.
 * De gemeente kijkt naar 5 jaar. De bijstand was toen iets lager. Daarom "ongeveer".
 */
function laagUitleg(f: Formulier): string {
  try {
    return laagUitlegMetBedrag(f);
  } catch {
    return "Dat betekent: uw inkomen was niet hoger dan de bijstand. Ook als u geen bijstand kreeg.";
  }
}

function laagUitlegMetBedrag(f: Formulier): string {
  const invoer = naarInvoer(f);
  const l = new Lezer(standaardRegels, rekendatum().datum);
  const kostendelers = (invoer.kostendelers ?? 0) + invoer.kinderen.filter((k) => l.aantal("pw.kostendeler.minimumleeftijd").lte(k.leeftijd)).length;
  const grens = sociaalMinimum(l, f.partner === "ja", f.woont || "huur", kostendelers);
  const basis = "Dat betekent: uw inkomen was niet hoger dan de bijstand. Ook als u geen bijstand kreeg.";
  if (!grens) return basis;
  return `${basis} Voor uw huishouden is dat nu ongeveer ${euro(grens, true)} netto per maand. Vakantiegeld telt niet mee.`;
}

const nettoHint =
  "Netto is het bedrag dat u op uw bankrekening krijgt. Vul het bedrag in zonder vakantiegeld. Krijgt u elke maand een ander bedrag? Tel dan de laatste 3 maanden bij elkaar op. Deel dat door 3.";

function InkomenBlok({ v, partner, aow, onChange, fouten }: { v: InkomenVelden; partner: boolean; aow: boolean; onChange: (v: InkomenVelden) => void; fouten: Fouten }) {
  return (
    <>
      {partner && <h2 className="deel">Inkomen van uw partner</h2>}
      <Vinkjes
        naam={soortenId(partner)}
        legend={VRAAG.soorten(partner)}
        toelichting="U kunt meer antwoorden kiezen."
        opties={soortOpties(aow)}
        alleen="geen"
        waarde={v.soorten}
        onChange={(soorten) => onChange({ ...v, soorten })}
        fout={fouten[soortenId(partner)]}
      />
      {vraagUitkering(v, partner) && (
        <Keuze
          naam={uitkeringId(partner)}
          legend={VRAAG.uitkering(partner)}
          opties={UITKERINGEN}
          waarde={v.uitkering}
          onChange={(uitkering) => onChange({ ...v, uitkering })}
          fout={fouten[uitkeringId(partner)]}
        />
      )}
      {bedragSoorten(v, aow).map((s) => (
        <Veld
          key={s}
          id={bedragId(partner, s)}
          label={partner ? BEDRAGVRAAG[s].partner : BEDRAGVRAAG[s].u}
          hint={BEDRAGVRAAG[s].netto ? nettoHint : undefined}
          voorbeeld="bijv. 1.400"
          voorvoegsel="€"
          waarde={v.bedragen[s] ?? ""}
          onChange={(bedrag) => onChange({ ...v, bedragen: { ...v.bedragen, [s]: bedrag } })}
          fout={fouten[bedragId(partner, s)]}
        />
      ))}
    </>
  );
}

function StapInkomen({ f, zet, fouten }: StapProps) {
  const paar = f.partner === "ja";
  return (
    <section>
      <Keuze
        naam="bijstand"
        legend={VRAAG.bijstand(paar, metAow(f))}
        waarde={f.bijstand}
        onChange={(v) => zet("bijstand", v)}
        fout={fouten.bijstand}
        opties={JA_NEE}
      />
      {vraagWerkNaastBijstand(f) && (
        <Keuze
          naam="werktNaastBijstand"
          legend={VRAAG.werktNaastBijstand(paar)}
          hint="Dit is nodig voor de kinderopvangtoeslag."
          waarde={f.werktNaastBijstand}
          onChange={(v) => zet("werktNaastBijstand", v)}
          fout={fouten.werktNaastBijstand}
          opties={JA_NEE}
        />
      )}
      {vraagInkomen(f) && (
        <>
          <InkomenBlok v={f.inkomen} partner={false} aow={aowVan(f.geboren)} onChange={(v) => zet("inkomen", v)} fouten={fouten} />
          {paar && <InkomenBlok v={f.partnerInkomen} partner aow={aowVan(f.partnerGeboren)} onChange={(v) => zet("partnerInkomen", v)} fouten={fouten} />}
        </>
      )}
      {vraagStudie(f) && (
        <Keuze
          naam="studieMedisch"
          legend={VRAAG.studieMedisch}
          hint={
            <p className="bron-blok">
              Bron: <Bron citaat={CITATEN.pw36b} />
            </p>
          }
          waarde={f.studieMedisch}
          onChange={(v) => zet("studieMedisch", v)}
          fout={fouten.studieMedisch}
          opties={JA_NEE}
        />
      )}
      {vraagLangLaag(f) && (
        <Keuze
          naam="langLaag"
          legend={VRAAG.langLaag}
          hint={laagUitleg(f)}
          waarde={f.langLaag}
          onChange={(v) => zet("langLaag", v)}
          fout={fouten.langLaag}
          opties={LANG_LAAG}
        />
      )}
    </section>
  );
}

function StapGeld({ f, zet, fouten }: StapProps) {
  const paar = f.partner === "ja";
  return (
    <section>
      <Vinkjes
        naam="bezit"
        legend={VRAAG.bezit(paar)}
        toelichting="U kunt meer antwoorden kiezen."
        opties={BEZIT}
        alleen="niets"
        waarde={f.bezit}
        onChange={(v) => zet("bezit", v)}
        fout={fouten.bezit}
      />
      {f.bezit.includes("betaal") && (
        <Veld
          id="betaalrekening"
          label={VRAAG.betaal(paar)}
          hint="Staat u rood? Vul dan 0 in. Tel het bedrag op bij uw schulden."
          voorbeeld="bijv. 250"
          voorvoegsel="€"
          waarde={f.betaalrekening}
          onChange={(v) => zet("betaalrekening", v)}
          fout={fouten.betaalrekening}
        />
      )}
      {f.bezit.includes("spaar") && (
        <Veld
          id="spaarrekening"
          label={VRAAG.spaar(paar)}
          voorbeeld="bijv. 1.500"
          voorvoegsel="€"
          waarde={f.spaarrekening}
          onChange={(v) => zet("spaarrekening", v)}
          fout={fouten.spaarrekening}
        />
      )}
      {f.bezit.includes("voertuig") && (
        <>
          {f.voertuigen.map((w, i) => (
            <div key={i} className="kind">
              <Veld
                id={`voertuig${i}`}
                label={VRAAG.voertuig(i, f.voertuigen.length)}
                hint="Wat krijgt u ervoor als u hem nu verkoopt?"
                voorbeeld="bijv. 3.000"
                voorvoegsel="€"
                waarde={w}
                onChange={(v) => zet("voertuigen", f.voertuigen.map((x, j) => (i === j ? v : x)))}
                fout={fouten[`voertuig${i}`]}
              />
              {f.voertuigen.length > 1 && (
                <button type="button" className="stilleknop" onClick={() => zet("voertuigen", f.voertuigen.filter((_, j) => j !== i))}>
                  Auto, motor of scooter {i + 1} weghalen
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="tweedeknop toevoegknop"
            onClick={() => {
              const nieuw = f.voertuigen.length;
              zet("voertuigen", [...f.voertuigen, ""]);
              requestAnimationFrame(() => document.getElementById(`voertuig${nieuw}`)?.focus());
            }}
          >
            Auto, motor of scooter toevoegen
          </button>
        </>
      )}
      {f.bezit.includes("beleggingen") && (
        <Veld
          id="beleggingen"
          label={VRAAG.beleggingen(paar)}
          voorbeeld="bijv. 500"
          voorvoegsel="€"
          waarde={f.beleggingen}
          onChange={(v) => zet("beleggingen", v)}
          fout={fouten.beleggingen}
        />
      )}
      {f.bezit.includes("spullen") && (
        <Veld
          id="spullen"
          label={VRAAG.spullen}
          voorbeeld="bijv. 1.000"
          voorvoegsel="€"
          waarde={f.spullen}
          onChange={(v) => zet("spullen", v)}
          fout={fouten.spullen}
        />
      )}
      {f.bezit.includes("schuld") && (
        <Veld
          id="schulden"
          label={VRAAG.schulden(paar)}
          hint="Tel alle schulden bij elkaar op."
          voorbeeld="bijv. 2.000"
          voorvoegsel="€"
          waarde={f.schulden}
          onChange={(v) => zet("schulden", v)}
          fout={fouten.schulden}
        />
      )}
    </section>
  );
}
