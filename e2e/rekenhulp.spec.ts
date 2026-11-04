import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function geenToegankelijkheidsfouten(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

test("alleenstaande doorloopt de stappen en krijgt een antwoord", async ({ page }) => {
  const extern: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("http://localhost:4173")) extern.push(req.url());
  });

  await page.goto("/");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Begin met rekenen" }).click();

  // Stap 1: zonder leeftijd verder gaan geeft een duidelijke foutmelding.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.getByText("Vul dit in.")).toBeVisible();
  await geenToegankelijkheidsfouten(page);
  await page.getByLabel("Uw leeftijd").fill("35");
  await page.getByRole("button", { name: "Volgende stap" }).click();

  // Stap 2
  await expect(page.getByRole("heading", { name: "Uw woning" })).toBeVisible();
  await page.getByLabel("Nee, of ik weet het niet").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();

  // Stap 3
  await page.getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bruto loon per uur" }).fill("15,00");
  await page.getByRole("textbox", { name: "Uren per week" }).fill("32");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();

  // Uitkomst
  const antwoord = page.locator(".antwoord-zin");
  await expect(antwoord).toContainText("houdt u per maand ongeveer");
  await expect(page.getByRole("table")).toContainText("Bijstand");
  await expect(page.getByRole("table")).toContainText("Wat er binnenkomt");
  await geenToegankelijkheidsfouten(page);

  // De urenschuif past het antwoord aan.
  const voor = await antwoord.textContent();
  await page.getByLabel(/Uren per week:/).fill("16");
  await expect(antwoord).not.toHaveText(voor ?? "");

  expect(extern).toEqual([]);
});

test.describe("donkere modus", () => {
  test.use({ colorScheme: "dark" });

  test("formulier en uitkomst zijn toegankelijk in donkere modus", async ({ page }) => {
    await page.goto("/");
    await geenToegankelijkheidsfouten(page);
    await page.getByRole("button", { name: "Begin met rekenen" }).click();
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await geenToegankelijkheidsfouten(page);
    await page.getByLabel("Uw leeftijd").fill("40");
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.200");
    await page.getByRole("textbox", { name: "Uren per week" }).fill("20");
    await geenToegankelijkheidsfouten(page);
    await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
    await expect(page.locator(".antwoord-zin")).toBeVisible();
    await expect(page.getByLabel("Maand 1 t/m 6")).toBeVisible();
    await page.getByLabel("Vanaf maand 7").check();
    await expect(page.locator(".toelichting")).toContainText("Geen vrijlating meer");
    await geenToegankelijkheidsfouten(page);
  });
});
