import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-700.css";
import "@leidenwerkt/ui/stijl.css";
import "./start.css";

// Knop voor licht en donker. Zonder keuze volgt de pagina de instelling van het apparaat.
// De keuze staat in localStorage ("thema"): alleen een voorkeur voor de weergave, geen gegeven dat iemand invult.
const knop = document.querySelector<HTMLButtonElement>(".thema-knop");
const donker = () => {
  const t = document.documentElement.dataset.thema;
  return t ? t === "donker" : matchMedia("(prefers-color-scheme: dark)").matches;
};
const toon = () => knop?.setAttribute("aria-pressed", String(donker()));
toon();
knop?.addEventListener("click", () => {
  const nieuw = donker() ? "licht" : "donker";
  document.documentElement.dataset.thema = nieuw;
  try {
    localStorage.setItem("thema", nieuw);
  } catch {
    /* Zonder opslag werkt de knop alleen op deze pagina. */
  }
  toon();
});
