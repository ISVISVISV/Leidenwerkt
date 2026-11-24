/**
 * De tweede app (werkversie): welke regelingen kunt u krijgen in Leiden? Draait op poort 4174.
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ADRES = "http://localhost:4174/";

async function geenToegankelijkheidsfouten(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}
const kies = (page: Page, groep: string, optie: string) => page.getByRole("group", { name: groep }).getByLabel(optie, { exact: true }).check();
const jaar = (leeftijd: number) => `01-01-${new Date().getFullYear() - leeftijd}`;

test("alleenstaande ouder met loon doorloopt de check en ziet een overzicht", async ({ page }) => {
  const extern: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("http://localhost:4174")) extern.push(req.url());
  });
  await page.goto(ADRES);
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Begin de check" }).click();

  // Zonder antwoorden: foutmeldingen, met een samenvatting bovenaan.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutsamenvatting")).toBeFocused();
  await geenToegankelijkheidsfouten(page);

  await page.getByLabel("Uw geboortedatum", { exact: true }).fill(jaar(35));
  await kies(page, "Woont u samen met een partner?", "Nee");
  await kies(page, "Heeft u kinderen die bij u wonen?", "Ja");
  await page.getByLabel("Geboortedatum van uw kind", { exact: true }).fill(jaar(8));
  // Een kind jonger dan 13: gaat het naar de opvang, nu of straks? Dan rekent Leidengeldwijzer de kinderopvangtoeslag uit.
  // Wie de opvang nog moet regelen, kiest "Nog niet". De prijs mag leeg blijven.
  await kies(page, "Gaat dit kind naar de opvang?", "Nog niet, maar dat wil ik");
  await kies(page, "Soort opvang", "Buitenschoolse opvang");
  await page.getByLabel("Hoeveel uur per week wilt u opvang voor dit kind?").fill("10");
  await expect(page.getByText("Weet u de prijs nog niet? Laat het vak dan leeg.")).toBeVisible();
  await kies(page, "Krijgt u kinderbijslag voor uw kinderen jonger dan 18 jaar?", "Ja");
  // De uitleg bij "5 jaar inkomen op bijstandsniveau" noemt het bedrag van de bijstand voor dit huishouden (zie stap 2).
  await kies(page, "Waar woont u?", "In een huurwoning met een eigen voordeur, keuken, wc en douche");
  await page.getByLabel("Kale huur per maand").fill("750");
  await kies(page, "Woont er nog iemand anders bij u?", "Nee");
  await page.getByRole("button", { name: "Volgende stap" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Uw inkomen" })).toBeFocused();
  await kies(page, "Krijgt u bijstand van de gemeente?", "Nee");
  const soorten = page.getByRole("group", { name: "Wat voor inkomen heeft u?" });
  await soorten.getByLabel("Loon uit werk").check();
  await soorten.getByLabel("Kinderalimentatie").check();
  await page.getByLabel("Hoeveel loon krijgt u netto per maand?").fill("1300");
  await page.getByLabel("Hoeveel kinderalimentatie krijgt u per maand?").fill("200");
  await kies(page, "Heeft u al 5 jaar of langer een inkomen op bijstandsniveau?", "Nee");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Volgende stap" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Geld en bezit" })).toBeFocused();
  const bezit = page.getByRole("group", { name: "Wat heeft u?" });
  await bezit.getByLabel("Geld op een spaarrekening").check();
  await bezit.getByLabel("Een auto, motor of scooter").check();
  await page.getByLabel("Hoeveel geld staat er op uw spaarrekening?").fill("2000");
  await page.getByLabel("Hoeveel is uw auto, motor of scooter nu waard?").fill("3000");
  await page.getByRole("button", { name: "Auto, motor of scooter toevoegen" }).click();
  await page.getByLabel("Hoeveel is auto, motor of scooter 2 nu waard?").fill("1500");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Bekijk het overzicht" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Overzicht" })).toBeVisible();
  const ja = page.locator(".groep.ja");
  // Eerst de Sleutelpas en wat erop staat, dan Dienst Toeslagen.
  const ids = await ja.locator(".regeling").evaluateAll((e) => e.map((x) => x.getAttribute("data-id")));
  expect(ids.slice(0, 3)).toEqual(["sleutelpas", "kindtegoed", "laptop"]);
  expect(ids.indexOf("zwemles")).toBeLessThan(ids.indexOf("huurtoeslag"));
  for (const id of ["zwemles", "huurtoeslag", "zorgtoeslag", "kgb", "kot"]) expect(ids).toContain(id);
  await expect(ja.getByRole("button", { name: /^Kindtegoed/ })).toContainText("€ 350 per jaar");
  // Wat waarschijnlijk niet kan, staat dichtgeklapt.
  await expect(page.locator("details.groep.nee")).not.toHaveAttribute("open", "");
  await geenToegankelijkheidsfouten(page);

  // Een tegel opent een venster met de uitleg. De bron opent met de letterlijke tekst. Esc sluit het venster.
  const knop = ja.getByRole("button", { name: /^Kindtegoed/ });
  await knop.click();
  const venster = page.getByRole("dialog", { name: "Kindtegoed" });
  await expect(venster).toBeVisible();
  await expect(venster.getByRole("link", { name: /Meer informatie en aanvragen/ })).toBeVisible();
  await geenToegankelijkheidsfouten(page);
  await venster.getByText("Bronnen", { exact: true }).click();
  await venster.locator(".bron-knop").first().click();
  await expect(venster.locator(".bron.open .bron-citaat")).toContainText("€150");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(venster).toBeHidden();
  await expect(knop).toBeFocused();
  // De terugknop sluit het venster ook, en blijft op het overzicht.
  await knop.click();
  await expect(venster).toBeVisible();
  await page.goBack();
  await expect(venster).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Overzicht" })).toBeVisible();

  expect(extern).toEqual([]);
});

test("stel: per persoon een bedrag per soort inkomen. Welke uitkering alleen bij studiefinanciering", async ({ page }) => {
  await page.goto(ADRES);
  await page.getByRole("button", { name: "Begin de check" }).click();
  await page.getByLabel("Uw geboortedatum", { exact: true }).fill(jaar(40));
  await kies(page, "Woont u samen met een partner?", "Ja");
  await page.getByLabel("Geboortedatum van uw partner", { exact: true }).fill(jaar(38));
  await kies(page, "Heeft u kinderen die bij u wonen?", "Nee");
  await kies(page, "Waar woont u?", "Op een kamer, of in een woning waar ik de keuken, wc of douche deel");
  await kies(page, "Woont er nog iemand anders bij u?", "Nee");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await kies(page, "Krijgt u samen bijstand van de gemeente?", "Nee");
  await page.getByRole("group", { name: "Wat voor inkomen heeft u?" }).getByLabel("Een uitkering van UWV").check();
  await expect(page.getByRole("group", { name: "Welke uitkering krijgt u?" })).toHaveCount(0);
  const soorten = page.getByRole("group", { name: "Wat voor inkomen heeft u?" });
  await soorten.getByLabel("Studiefinanciering").check();
  await expect(page.getByRole("group", { name: "Welke uitkering krijgt u?" })).toBeVisible();
  await soorten.getByLabel("Studiefinanciering").uncheck();
  await expect(page.getByRole("group", { name: "Welke uitkering krijgt u?" })).toHaveCount(0);
  await page.getByLabel("Hoeveel uitkering krijgt u netto per maand?").fill("1500");
  await page.getByRole("group", { name: "Wat voor inkomen heeft uw partner?" }).getByLabel("Geen inkomen").check();
  await kies(page, "Heeft u al 5 jaar of langer een inkomen op bijstandsniveau?", "Ja");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("group", { name: "Wat hebben u en uw partner samen?" }).getByLabel("Niets van dit").check();
  await page.getByRole("button", { name: "Bekijk het overzicht" }).click();
  await expect(page.locator('.groep.ja .regeling[data-id="alleenverdieners"]')).toBeVisible();
});

test("met bijstand: geen vragen over het inkomen, wel de Sleutelpas vanzelf", async ({ page }) => {
  await page.goto(ADRES);
  await page.getByRole("button", { name: "Begin de check" }).click();
  await page.getByLabel("Uw geboortedatum", { exact: true }).fill(jaar(45));
  await kies(page, "Woont u samen met een partner?", "Nee");
  await kies(page, "Heeft u kinderen die bij u wonen?", "Nee");
  await kies(page, "Waar woont u?", "In een koopwoning");
  await kies(page, "Woont er nog iemand anders bij u?", "Nee");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await kies(page, "Krijgt u bijstand van de gemeente?", "Ja");
  await expect(page.getByRole("group", { name: "Wat voor inkomen heeft u?" })).toHaveCount(0);
  await kies(page, "Heeft u al 5 jaar of langer een inkomen op bijstandsniveau?", "Weet ik niet");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("group", { name: "Wat heeft u?" }).getByLabel("Niets van dit").check();
  await page.getByRole("button", { name: "Bekijk het overzicht" }).click();
  await page.locator(".groep.ja").getByRole("button", { name: /^Sleutelpas/ }).click();
  await expect(page.getByRole("dialog", { name: "Sleutelpas" })).toContainText("vanzelf");
  await page.getByRole("button", { name: "Sluiten" }).click();
  await expect(page.locator('.groep.misschien .regeling[data-id="iit"]')).toBeVisible();
});

test("huisgenoten met een bekend inkomen: Leidengeldwijzer rekent de huurtoeslag uit", async ({ page }) => {
  await page.goto(ADRES);
  await page.getByRole("button", { name: "Begin de check" }).click();
  await page.getByLabel("Uw geboortedatum", { exact: true }).fill(jaar(45));
  await kies(page, "Woont u samen met een partner?", "Nee");
  await kies(page, "Heeft u kinderen die bij u wonen?", "Nee");
  await kies(page, "Waar woont u?", "In een huurwoning met een eigen voordeur, keuken, wc en douche");
  await page.getByLabel("Kale huur per maand").fill("750");
  await kies(page, "Woont er nog iemand anders bij u?", "Ja");
  await page.getByLabel("Hoeveel mensen zijn dat?").fill("1");
  await page.getByLabel("Hoeveel van hen zijn 27 jaar of ouder?").fill("1");
  await page.getByLabel("Hoeveel bruto inkomen hebben deze mensen samen per jaar?").fill("6000");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await kies(page, "Krijgt u bijstand van de gemeente?", "Nee");
  await page.getByRole("group", { name: "Wat voor inkomen heeft u?" }).getByLabel("Loon uit werk").check();
  await page.getByLabel("Hoeveel loon krijgt u netto per maand?").fill("1100");
  await expect(page.getByRole("group", { name: "Heeft u al 5 jaar of langer een inkomen op bijstandsniveau?" })).toContainText("netto per maand. Vakantiegeld telt niet mee.");
  await kies(page, "Heeft u al 5 jaar of langer een inkomen op bijstandsniveau?", "Nee");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("group", { name: "Wat heeft u?" }).getByLabel("Niets van dit").check();
  await page.getByRole("button", { name: "Bekijk het overzicht" }).click();
  await expect(page.locator('.groep.ja .regeling[data-id="huurtoeslag"] .bedrag')).toContainText("per maand");
  // Een huisgenoot van 27 jaar of ouder: de kostendelersnorm. De grens voor de bijstand is lager.
  await page.locator("details.groep.nee > summary").click();
  await page.getByRole("button", { name: /^Bijstand/ }).click();
  await expect(page.getByRole("dialog", { name: "Bijstand" })).toContainText("Daarom is deze grens lager.");
});
