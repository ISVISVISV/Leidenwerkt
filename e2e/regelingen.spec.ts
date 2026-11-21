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

  await kies(page, "Woont u in de gemeente Leiden?", "Ja");
  await page.getByLabel("Uw geboortedatum", { exact: true }).fill(jaar(35));
  await kies(page, "Woont u samen met een partner?", "Nee");
  await kies(page, "Heeft u kinderen die bij u wonen?", "Ja");
  await page.getByLabel("Geboortedatum van uw kind", { exact: true }).fill(jaar(8));
  await kies(page, "Krijgt u kinderbijslag voor dit kind?", "Ja");
  await page.getByRole("button", { name: "Volgende stap" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Uw inkomen" })).toBeFocused();
  await kies(page, "Krijgt u bijstand van de gemeente?", "Nee");
  await page.getByRole("group", { name: "Wat voor inkomen heeft u?" }).getByLabel("Loon uit werk").check();
  await page.getByLabel("Hoeveel inkomen heeft u netto per maand?").fill("1500");
  await kies(page, "Heeft u al 5 jaar of langer een laag inkomen?", "Nee");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Volgende stap" }).click();

  await kies(page, "Waar woont u?", "In een huurwoning met een eigen voordeur, keuken, wc en douche");
  await page.getByLabel("Kale huur per maand").fill("750");
  await kies(page, "Wonen er nog andere mensen bij u in huis?", "Nee");
  const bezit = page.getByRole("group", { name: "Wat heeft u?" });
  await bezit.getByLabel("Geld op een spaarrekening").check();
  await bezit.getByLabel("Een auto, motor of scooter").check();
  await page.getByLabel("Hoeveel geld staat er op uw spaarrekening?").fill("2000");
  await page.getByLabel("Hoeveel is uw auto, motor of scooter nu waard?").fill("3000");
  await page.getByRole("button", { name: "Nog een auto, motor of scooter toevoegen" }).click();
  await page.getByLabel("Hoeveel is auto, motor of scooter 2 nu waard?").fill("1500");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Bekijk het overzicht" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Overzicht" })).toBeVisible();
  const ja = page.locator(".groep.ja");
  for (const naam of ["Sleutelpas", "Kindtegoed", "Zwemles", "Huurtoeslag", "Zorgtoeslag", "Kindgebonden budget"])
    await expect(ja.getByRole("heading", { level: 3, name: naam })).toBeVisible();
  await expect(ja.getByText("€ 350 per jaar")).toBeVisible();
  // Wat waarschijnlijk niet kan, staat dichtgeklapt.
  await expect(page.locator("details.groep.nee")).not.toHaveAttribute("open", "");
  await geenToegankelijkheidsfouten(page);

  // Een bron opent met de letterlijke tekst.
  await ja.locator(".regeling").filter({ has: page.getByRole("heading", { level: 3, name: "Kindtegoed", exact: true }) }).locator(".bron-knop").first().click();
  await expect(page.locator(".bron.open .bron-citaat")).toContainText("€150");

  expect(extern).toEqual([]);
});

test("niet in Leiden: de check zegt dat hij alleen voor Leiden is", async ({ page }) => {
  await page.goto(ADRES);
  await page.getByRole("button", { name: "Begin de check" }).click();
  await kies(page, "Woont u in de gemeente Leiden?", "Nee");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutmelding").getByText("alleen voor inwoners van de gemeente Leiden")).toBeVisible();
});

test("met bijstand: geen vragen over het inkomen, wel de Sleutelpas vanzelf", async ({ page }) => {
  await page.goto(ADRES);
  await page.getByRole("button", { name: "Begin de check" }).click();
  await kies(page, "Woont u in de gemeente Leiden?", "Ja");
  await page.getByLabel("Uw geboortedatum", { exact: true }).fill(jaar(45));
  await kies(page, "Woont u samen met een partner?", "Nee");
  await kies(page, "Heeft u kinderen die bij u wonen?", "Nee");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await kies(page, "Krijgt u bijstand van de gemeente?", "Ja");
  await expect(page.getByRole("group", { name: "Wat voor inkomen heeft u?" })).toHaveCount(0);
  await kies(page, "Heeft u al 5 jaar of langer een laag inkomen?", "Weet ik niet");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await kies(page, "Waar woont u?", "In een koopwoning");
  await kies(page, "Wonen er nog andere mensen bij u in huis?", "Nee");
  await page.getByRole("group", { name: "Wat heeft u?" }).getByLabel("Niets van dit").check();
  await page.getByRole("button", { name: "Bekijk het overzicht" }).click();
  await expect(page.locator(".groep.ja .regeling").filter({ has: page.getByRole("heading", { level: 3, name: "Sleutelpas", exact: true }) })).toContainText("vanzelf");
  await expect(page.locator(".groep.misschien").getByRole("heading", { name: "Individuele inkomenstoeslag" })).toBeVisible();
});
