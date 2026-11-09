import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function geenToegankelijkheidsfouten(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

/** Vult een geboortedatum in waarmee iemand vandaag de gevraagde leeftijd heeft (1 januari van dat jaar). */
async function geboren(page: Page, vraag: string, leeftijd: number) {
  const groep = page.getByRole("group", { name: vraag });
  await groep.getByLabel("Dag").fill("1");
  await groep.getByLabel("Maand").fill("1");
  await groep.getByLabel("Jaar").fill(String(new Date().getFullYear() - leeftijd));
}

test("alleenstaande doorloopt de stappen en krijgt een antwoord", async ({ page }) => {
  const extern: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("http://localhost:4173")) extern.push(req.url());
  });

  await page.goto("/");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Begin met rekenen" }).click();

  // Stap 1: zonder geboortedatum verder gaan geeft een duidelijke foutmelding.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutmelding").getByText("Vul dit in.").first()).toBeVisible();
  await geenToegankelijkheidsfouten(page);
  await geboren(page, "Uw geboortedatum", 35);
  await page.getByRole("button", { name: "Volgende stap" }).click();

  // Stap 2
  await expect(page.getByRole("heading", { name: "Uw woning" })).toBeVisible();
  await page.getByLabel("In een koopwoning").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();

  // Stap 3
  await page.getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bruto loon per uur" }).fill("15,00");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("32");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();

  // Uitkomst
  const antwoord = page.locator(".antwoord-zin");
  await expect(antwoord).toContainText("houdt u per maand ongeveer");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ })).toContainText("Bijstand");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ })).toContainText("Wat er binnenkomt");
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
    await geboren(page, "Uw geboortedatum", 40);
    await page.getByRole("button", { name: "Volgende stap" }).click();
    // Huurt u, dan is de kale huur verplicht.
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await expect(page.locator(".foutmelding").getByText("Vul dit in.").first()).toBeVisible();
    await page.getByLabel("In een koopwoning").check();
    await page.getByRole("button", { name: "Volgende stap" }).click();
    await page.getByLabel("Netto loon per maand (wat op mijn rekening komt)").check();
    await page.getByRole("textbox", { name: "Netto loon per maand" }).fill("1.100");
    await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("20");
    await geenToegankelijkheidsfouten(page);
    await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
    await expect(page.locator(".antwoord-zin")).toBeVisible();
    await expect(page.getByLabel("Maand 1 t/m 6")).toBeVisible();
    await page.getByLabel("Vanaf maand 7").check();
  await expect(page.getByRole("group", { name: "Welke periode wilt u zien?" })).toBeVisible();
    await expect(page.locator(".toelichting")).toContainText("Geen vrijlating meer");
    await geenToegankelijkheidsfouten(page);
  });
});

test("huurder van 25: huurtoeslag berekend, geen vrijlating onder 27, toeslagrisico concreet", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 25);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Kale huur per maand").fill("650");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("2.600");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("32");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();

  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  await expect(tabel.getByRole("row", { name: /Huurtoeslag/ })).not.toContainText("niet berekend");
  await expect(page.locator(".antwoord")).not.toContainText("Niet meegerekend");
  await expect(page.locator(".signalen")).toContainText("moet u na een jaar ongeveer");
  await page.getByLabel(/Uren per week:/).fill("8");
  await expect(page.locator(".toelichting")).toContainText("jonger bent dan 27 jaar");
  await geenToegankelijkheidsfouten(page);
});

test("letters worden niet geaccepteerd, voorbeeldtekst staat in lege vakken, huisgenoten tellen mee voor huurtoeslag", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  const zelf = page.getByRole("group", { name: "Uw geboortedatum" });
  await zelf.getByLabel("Dag").pressSequentially("1a4b");
  await expect(zelf.getByLabel("Dag")).toHaveValue("14");
  await zelf.getByLabel("Maand").fill("13");
  await zelf.getByLabel("Jaar").fill("1984");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutmelding").getByText("Vul een datum in die bestaat", { exact: false })).toBeVisible();
  await zelf.getByLabel("Maand").fill("3");
  await expect(page.getByLabel(/Hoeveel andere mensen van 27/)).toHaveAttribute("placeholder", "bijv. 0");
  await page.getByLabel(/Hoeveel andere mensen van 27/).fill("1");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Kale huur per maand").pressSequentially("7x20,5o0");
  await expect(page.getByLabel("Kale huur per maand")).toHaveValue("720,50");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutmelding").getByText("Vul dit in.").first()).toBeVisible();
  await page.getByLabel("Bruto jaarinkomen van de anderen in huis, samen").fill("26.000");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.200");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("20");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /Huurtoeslag/ })).not.toContainText("niet berekend");
  await expect(page.locator(".signalen")).not.toContainText("De vrijlating is tijdelijk");
  await geenToegankelijkheidsfouten(page);
});

test("zonder vaste woonplek, met medische urenbeperking: lagere norm, vrijlating onder y, jaarbedrag, urengrens en wettekst", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 45);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Ik heb geen vaste woonplek").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("Ja, ik heb een medische urenbeperking").check();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.000");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("16");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.locator(".antwoord")).toContainText("In de eerste 12 maanden");
  await expect(page.locator("#urengrens")).toContainText("uur per week heeft u met dit uurloon geen bijstand meer nodig");
  await page.getByLabel("Vanaf maand 7").check();
  await expect(page.locator(".toelichting")).toContainText("Met een medische urenbeperking mag u 15%");
  const bron = page.locator(".toelichting .bron").filter({ hasText: "onder y" });
  await bron.getByRole("button").click();
  await expect(bron.locator(".bron-tekst")).toContainText("medisch urenbeperkt");
  await page.getByText("Bijstand", { exact: true }).first().click();
  await geenToegankelijkheidsfouten(page);
});

test("stel met kinderen en opvang: de gemeente vergoedt de eigen bijdrage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByLabel("Met mijn partner en kinderen").check();
  await geboren(page, "Uw geboortedatum", 33);
  await geboren(page, "Geboortedatum van uw partner", 35);
  await page.getByRole("group", { name: "Heeft uw partner betaald werk?" }).getByLabel("Ja").check();
  await page.getByRole("textbox", { name: "Bruto maandloon van uw partner" }).fill("700");
  await geboren(page, "Geboortedatum kind 1", 2);
  await page.getByText("Dit kind gaat naar de kinderopvang").click();
  await page.getByLabel("Uren opvang per maand").fill("238,33");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutmelding").getByText("hoogstens 230 uur per kind per maand", { exact: false })).toBeVisible();
  await page.getByLabel("Uren opvang per maand").fill("70");
  await page.getByLabel("Prijs per uur").fill("12,50");
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("In een koopwoning").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.300");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("20");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /Vergoeding eigen bijdrage kinderopvang/ })).toBeVisible();
  await expect(page.locator(".signalen")).toContainText("vraag haar aan bij de gemeente");
  await geenToegankelijkheidsfouten(page);
});

test("woonvorm met begeleiding: instellingsnorm, geen huurtoeslag, uitleg over later zelfstandig wonen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 30);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel(/In een instelling of woonvorm met begeleiding/).check();
  await expect(page.getByText("€ 496,44 per maand", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("600");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("8");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ })).not.toContainText("Huurtoeslag");
  await expect(page.locator(".signalen")).toContainText("Reken dan opnieuw.");
  await geenToegankelijkheidsfouten(page);
});

test("wie al werkt, kiest wat er verandert en vult niets dubbel in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 38);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("In een koopwoning").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("group", { name: "Heeft u nu al betaald werk naast uw bijstand?" }).getByLabel("Ja").check();
  await page.getByRole("group", { name: "Welk loon weet u?" }).first().getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bruto loon per uur" }).fill("15,00");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("12");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.locator(".foutmelding").getByText("Kies wat er verandert.")).toBeVisible();
  await expect(page.locator(".foutmelding").getByText("Kies hoe lang u al werkt.")).toBeVisible();
  await page.getByLabel("6 maanden of langer").check();
  await page.getByLabel("Ik ga meer uren werken bij mijn huidige werk").check();
  await expect(page.getByRole("textbox", { name: "Bruto loon per uur" })).toHaveCount(1);
  await page.getByLabel("Hoeveel uur per week gaat u in totaal werken?").fill("24");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.locator(".antwoord")).toContainText("Bij 24 uur per week");
  // Wie al 6 maanden werkt: geen keuze voor de periode; de schuif begint boven het huidige aantal uren.
  await expect(page.getByRole("group", { name: "Welke periode wilt u zien?" })).toHaveCount(0);
  await expect(page.locator("#urenschuif")).toHaveAttribute("min", "13");
  await expect(page.locator("#urenschuif")).toHaveAttribute("aria-valuetext", "24 uur per week");
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await page.getByLabel("Ik neem er werk bij, naast mijn huidige werk").check();
  await expect(page.getByRole("heading", { name: "Het extra werk" })).toBeVisible();
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("500");
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).last().fill("8");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.getByText("Uren extra werk per week")).toBeVisible();
  await expect(page.locator(".antwoord")).toContainText("Bij 8 uur extra werk per week");
  await geenToegankelijkheidsfouten(page);
});

test("uurloon: vraag of het vakantiegeld al in het uurloon zit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 30);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByLabel("In een koopwoning").check();
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByRole("textbox", { name: /Hoeveel uur per week werkt u/ }).fill("20");
  await page.getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bruto loon per uur" }).fill("14,50");
  await page.getByLabel("Ja, het is een all-in uurloon").check();
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await page.getByText("Bekijk de").click();
  await expect(page.locator("section[aria-labelledby='aannames'] .aannames")).toContainText("all-in");
  await geenToegankelijkheidsfouten(page);
});
