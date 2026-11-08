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
  await page.getByLabel("In een koopwoning").check();
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
    // Huurt u, dan is de kale huur verplicht.
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await expect(page.getByText("Vul dit in.")).toBeVisible();
    await page.getByLabel("In een koopwoning").check();
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await page.getByLabel("Netto loon per maand (wat op mijn rekening komt)").check();
    await page.getByRole("textbox", { name: "Netto loon per maand" }).fill("1.100");
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

test("huurder van 25: huurtoeslag berekend, geen vrijlating onder 27, toeslagrisico concreet", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByLabel("Uw leeftijd").fill("25");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Kale huur per maand").fill("650");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("2.600");
  await page.getByRole("textbox", { name: "Uren per week" }).fill("32");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();

  const tabel = page.getByRole("table");
  await expect(tabel.getByRole("row", { name: /Huurtoeslag/ })).not.toContainText("niet berekend");
  await expect(page.locator(".antwoord")).not.toContainText("Niet meegerekend");
  await expect(page.locator(".signalen")).toContainText("Na een jaar werk moet u dan ongeveer");
  await page.getByLabel(/Uren per week:/).fill("8");
  await expect(page.locator(".toelichting")).toContainText("jonger bent dan 27 jaar");
  await geenToegankelijkheidsfouten(page);
});

test("letters worden niet geaccepteerd, voorbeeldtekst staat in lege vakken, huisgenoten tellen mee voor huurtoeslag", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  const leeftijd = page.getByLabel("Uw leeftijd");
  await expect(leeftijd).toHaveAttribute("placeholder", "bijv. 35");
  await leeftijd.pressSequentially("4a2b");
  await expect(leeftijd).toHaveValue("42");
  await page.getByLabel(/Hoeveel andere mensen van 27/).fill("1");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Kale huur per maand").pressSequentially("7x20,5o0");
  await expect(page.getByLabel("Kale huur per maand")).toHaveValue("720,50");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.getByText("Vul dit in.")).toBeVisible();
  await page.getByLabel("Bruto jaarinkomen van de anderen in huis, samen").fill("26.000");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.200");
  await page.getByRole("textbox", { name: "Uren per week" }).fill("20");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByRole("table").getByRole("row", { name: /Huurtoeslag/ })).not.toContainText("niet berekend");
  await expect(page.locator(".signalen")).not.toContainText("De vrijlating is tijdelijk");
  await geenToegankelijkheidsfouten(page);
});

test("zonder vaste woonplek, met medische urenbeperking: lagere norm, vrijlating onder y, jaarbedrag, urengrens en wettekst", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByLabel("Uw leeftijd").fill("45");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("In een zorginstelling, zoals een verpleeghuis").check();
  await expect(page.getByText("Deze rekenhulp kan dat niet berekenen")).toBeVisible();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.getByRole("heading", { name: "Uw woning" })).toBeVisible();
  await page.getByLabel("Ik heb geen vaste woonplek").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Ja, ik heb een medische urenbeperking").check();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.000");
  await page.getByRole("textbox", { name: "Uren per week" }).fill("16");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.locator(".antwoord")).toContainText("In de eerste 12 maanden");
  await expect(page.locator("#urengrens")).toContainText("uur per week heeft u met dit uurloon geen bijstand meer nodig");
  await page.getByLabel("Vanaf maand 7").check();
  await expect(page.locator(".toelichting")).toContainText("Met een medische urenbeperking mag u 15%");
  const bron = page.locator(".toelichting .bron").filter({ hasText: "onder y" });
  await bron.getByRole("button").click();
  await expect(bron.getByRole("tooltip")).toContainText("medisch urenbeperkt");
  await page.getByText("Bijstand", { exact: true }).first().click();
  await geenToegankelijkheidsfouten(page);
});

test("stel met kinderen en opvang: de gemeente vergoedt de eigen bijdrage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByLabel("Met mijn partner en kinderen").check();
  await page.getByLabel("Uw leeftijd").fill("33");
  await page.getByLabel("Leeftijd van uw partner").fill("35");
  await page.getByRole("group", { name: "Heeft uw partner betaald werk?" }).getByLabel("Ja").check();
  await page.getByRole("textbox", { name: "Bruto maandloon van uw partner" }).fill("700");
  await page.getByLabel("Leeftijd kind 1").fill("2");
  await page.getByText("Dit kind gaat naar de kinderopvang").click();
  await page.getByLabel("Uren opvang per maand").fill("70");
  await page.getByLabel("Prijs per uur").fill("12,50");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("In een koopwoning").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.300");
  await page.getByRole("textbox", { name: "Uren per week" }).fill("20");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByRole("table").getByRole("row", { name: /Vergoeding eigen bijdrage kinderopvang/ })).toBeVisible();
  await expect(page.locator(".signalen")).toContainText("vraag haar aan bij de gemeente");
  await geenToegankelijkheidsfouten(page);
});

test("woonvorm met begeleiding: instellingsnorm, geen huurtoeslag, uitleg over later zelfstandig wonen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByLabel("Uw leeftijd").fill("30");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel(/In een woonvorm met begeleiding/).check();
  await expect(page.getByText("€ 496,44 per maand", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("600");
  await page.getByRole("textbox", { name: "Uren per week" }).fill("8");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByRole("table")).not.toContainText("Huurtoeslag");
  await expect(page.locator(".signalen")).toContainText("Reken dan opnieuw, met uw nieuwe woning");
  await geenToegankelijkheidsfouten(page);
});
