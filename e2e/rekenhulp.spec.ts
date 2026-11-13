import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function geenToegankelijkheidsfouten(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

const JA_NEE = ["partner", "heeftKinderen", "partnerWerkt", "heeftAnderInkomen", "krijgtKinderalimentatie", "woonlasten", "andereBewoners", "werktNu"];

/**
 * Naar de volgende stap. Ja/nee-vragen hebben geen antwoord vooraf; wat een test niet zelf beantwoordt,
 * krijgt hier "Nee", zodat elke test alleen invult wat voor die test telt.
 */
async function verder(page: Page, knop = "Volgende stap") {
  for (const naam of JA_NEE) {
    const keuzes = page.locator(`input[type=radio][name="${naam}"]`);
    if ((await keuzes.count()) === 0 || !(await keuzes.first().isVisible())) continue;
    if ((await page.locator(`input[type=radio][name="${naam}"]:checked`).count()) > 0) continue;
    await page.locator(`fieldset:has(input[name="${naam}"])`).getByRole("radio", { name: "Nee", exact: true }).check();
  }
  await page.getByRole("button", { name: knop }).click();
}

/** Kiest welk loonbedrag de gebruiker weet, in de eerste vraag daarover die nog geen antwoord heeft. */
async function kiesLoon(page: Page, optie: string) {
  const groepen = page.getByRole("group", { name: "Welk bedrag van uw loon weet u?" });
  for (let i = 0; i < (await groepen.count()); i++) {
    const g = groepen.nth(i);
    if ((await g.locator("input:checked").count()) === 0) {
      await g.getByLabel(optie, { exact: true }).check();
      return;
    }
  }
}

/** Vult een geboortedatum in waarmee iemand vandaag de gevraagde leeftijd heeft (1 januari van dat jaar). */
async function geboren(page: Page, vraag: string, leeftijd: number) {
  await page.getByLabel(vraag, { exact: true }).fill(`01-01-${new Date().getFullYear() - leeftijd}`);
}

test("alleenstaande doorloopt de stappen en krijgt een antwoord", async ({ page }) => {
  const extern: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("http://localhost:4173")) extern.push(req.url());
  });

  await page.goto("/");
  await geenToegankelijkheidsfouten(page);
  await page.getByRole("button", { name: "Begin met rekenen" }).click();

  // Stap 1: zonder antwoorden verder gaan geeft duidelijke foutmeldingen; ja/nee-vragen hebben geen antwoord vooraf.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutmelding").getByText("Kies Ja of Nee.").first()).toBeVisible();
  await verder(page);
  await expect(page.locator(".foutmelding").getByText("Vul dit in.").first()).toBeVisible();
  await geenToegankelijkheidsfouten(page);
  await geboren(page, "Uw geboortedatum", 35);
  await verder(page);

  // Stap 2
  await expect(page.getByRole("heading", { name: "Uw woning" })).toBeVisible();
  await page.getByLabel("In een koopwoning").check();
  await verder(page);

  // Stap 3
  await page.getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15,00");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("32");
  await geenToegankelijkheidsfouten(page);
  await verder(page, "Bereken wat ik overhoud");

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
    await verder(page);
    await geenToegankelijkheidsfouten(page);
    await geboren(page, "Uw geboortedatum", 40);
    await verder(page);
    // Er is geen woonsituatie vooraf gekozen.
    await verder(page);
    await expect(page.locator(".foutmelding").getByText("Kies waar u woont.")).toBeVisible();
    await page.getByLabel("In een koopwoning").check();
    await verder(page);
    await page.getByLabel("Netto loon per maand (wat op mijn rekening komt)").check();
    await page.getByRole("textbox", { name: "Netto loon per maand" }).fill("1.100");
    await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("20");
    await geenToegankelijkheidsfouten(page);
    await verder(page, "Bereken wat ik overhoud");
    await expect(page.locator(".antwoord-zin")).toBeVisible();
    await expect(page.getByRole("radio", { name: /^Maand 1 t\/\u2060?m 6$/ })).toBeVisible();
    await page.getByLabel("Vanaf maand 7").check();
  await expect(page.getByRole("group", { name: "Voor welke maanden wilt u de uitkomst zien?" })).toBeVisible();
    await expect(page.locator(".toelichting")).toContainText("Geen vrijlating meer");
    await geenToegankelijkheidsfouten(page);
  });
});

test("huurder van 25: huurtoeslag berekend, geen vrijlating onder 27, toeslagrisico concreet", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 25);
  await verder(page);
  await page.getByLabel(/In een huurwoning met een eigen voordeur/).check();
  await page.getByLabel("Kale huur per maand").fill("650");
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("2.600");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("32");
  await verder(page, "Bereken wat ik overhoud");

  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  await expect(tabel.getByRole("row", { name: /Huurtoeslag/ })).not.toContainText("niet berekend");
  await expect(page.locator(".antwoord")).not.toContainText("Niet meegerekend");
  await expect(page.locator(".signalen")).toContainText("moet u na een jaar ongeveer");
  await page.getByLabel(/Uren per week:/).fill("8");
  await expect(page.locator(".toelichting")).toContainText("jonger dan 27 jaar");
  await geenToegankelijkheidsfouten(page);
});

test("letters worden niet geaccepteerd, voorbeeldtekst staat in lege vakken, huisgenoten tellen mee voor huurtoeslag", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  const zelf = page.getByLabel("Uw geboortedatum");
  await expect(zelf).toHaveAttribute("placeholder", "bijv. 14-03-1990");
  await zelf.pressSequentially("1a4b13x1984");
  await expect(zelf).toHaveValue("14-13-1984");
  await verder(page);
  await expect(page.locator(".foutmelding").getByText("Vul een datum in die bestaat", { exact: false })).toBeVisible();
  // Na een fout gaat de focus naar de samenvatting bovenaan; de melding is een link naar de vraag.
  await expect(page.locator(".foutsamenvatting")).toBeFocused();
  await page.locator(".foutsamenvatting a").first().click();
  await expect(zelf).toBeFocused();
  await zelf.fill("14-3-1984");
  await verder(page);
  await page.getByLabel(/In een huurwoning met een eigen voordeur/).check();
  await page.getByLabel("Kale huur per maand").pressSequentially("7x20,5o0");
  await expect(page.getByLabel("Kale huur per maand")).toHaveValue("720,50");
  // De aantallen verschijnen pas als er andere bewoners zijn.
  await expect(page.getByLabel("Hoeveel van hen zijn 27 jaar of ouder?")).toHaveCount(0);
  await page.getByRole("group", { name: "Wonen er nog andere mensen van 18 jaar of ouder bij u in huis?" }).getByLabel("Ja").check();
  await expect(page.getByLabel("Hoeveel van hen zijn 27 jaar of ouder?")).toHaveAttribute("placeholder", "bijv. 1");
  await page.getByLabel("Hoeveel van hen zijn 27 jaar of ouder?").fill("1");
  await page.getByLabel("Hoeveel van hen zijn 18 tot en met 26 jaar?").fill("0");
  await verder(page);
  await expect(page.locator(".foutmelding").getByText("Vul dit in.").first()).toBeVisible();
  await page.getByLabel("Voor de huurtoeslag: bruto inkomen per jaar van uw huisgenoten, samen").fill("26.000");
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.200");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("20");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /Huurtoeslag/ })).not.toContainText("niet berekend");
  await expect(page.locator(".signalen")).not.toContainText("De vrijlating is tijdelijk");
  await geenToegankelijkheidsfouten(page);
});

test("zonder vaste woonplek, met medische urenbeperking: lagere norm, vrijlating onder y, jaarbedrag, urengrens en wettekst", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 45);
  await verder(page);
  await page.getByLabel("Ik heb geen vaste woonplek").check();
  await verder(page);
  await page.getByLabel("Ja, ik heb een medische urenbeperking").check();
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.000");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("16");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.locator(".antwoord")).toContainText("De eerste 12 maanden samen");
  await expect(page.locator("#urengrens")).toContainText("uur per week geen bijstand meer nodig");
  await page.getByLabel("Vanaf maand 7").check();
  await expect(page.locator(".toelichting")).toContainText("Met een medische urenbeperking mag u 15%");
  const bron = page.locator(".toelichting .bron").filter({ hasText: "onder y" });
  await bron.getByRole("button").click();
  await expect(bron.locator(".bron-tekst")).toContainText("medisch urenbeperkt");
  await bron.locator(".bron-knop").click();
  await geenToegankelijkheidsfouten(page);
});

test("stel met kinderen en opvang: de gemeente vergoedt de eigen bijdrage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Woont u samen met een partner?" }).getByLabel("Ja").check();
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Ja").check();
  await geboren(page, "Uw geboortedatum", 33);
  await geboren(page, "Geboortedatum van uw partner", 35);
  await page.getByRole("group", { name: "Heeft uw partner betaald werk?" }).getByLabel("Ja").check();
  await page.getByRole("textbox", { name: "Bruto maandloon van uw partner" }).fill("700");
  await page.getByRole("group", { name: "Hoe lang werkt uw partner al naast de bijstand?" }).getByLabel("6 maanden of langer").check();
  await geboren(page, "Geboortedatum kind 1", 2);
  await page.getByText("Dit kind gaat naar de kinderopvang").click();
  // Er is geen soort opvang vooraf gekozen.
  await expect(page.getByLabel("Kinderdagverblijf")).not.toBeChecked();
  await page.getByLabel("Hoeveel uur per week gaat dit kind naar de opvang?").fill("16");
  await verder(page);
  await expect(page.locator(".foutmelding").getByText("Kies de soort opvang.")).toBeVisible();
  await page.getByLabel("Kinderdagverblijf").check();
  await page.getByLabel("Prijs per uur").fill("12,50");
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.300");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("20");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /Vergoeding eigen bijdrage kinderopvang/ })).toBeVisible();
  await expect(page.locator(".signalen")).toContainText("vraag haar aan bij de gemeente");
  // Bovenaan staat wat de gebruiker nu kan doen, met een link naar de melding.
  await expect(page.getByRole("heading", { name: "Wat u nu kunt doen" })).toBeVisible();
  // Een link onder "Wat u nu kunt doen" klapt de melding open en blijft op de uitkomst.
  const link = page.locator(".te-doen a").first();
  const kop = await link.innerText();
  await link.click();
  await expect(page.getByRole("heading", { name: "Wat u nu kunt doen:" })).toBeVisible();
  const melding = page.locator("details.signaal", { has: page.locator("summary", { hasText: kop }) });
  await expect(melding).toHaveAttribute("open", "");
  await expect(melding.locator("summary")).toBeFocused();
  // De meldingen staan ingeklapt; een klik op de kop klapt ze open.
  const id = await page.locator("details.signaal:not([open])").first().getAttribute("id");
  const dicht = page.locator(`#${id}`);
  await dicht.locator("summary").click();
  await expect(dicht.locator("p")).toBeVisible();
  await geenToegankelijkheidsfouten(page);
});

test("woonvorm met begeleiding: instellingsnorm, geen huurtoeslag, uitleg over later zelfstandig wonen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 30);
  await verder(page);
  await page.getByLabel(/In een instelling of woonvorm waar ik zorg of begeleiding krijg/).check();
  await expect(page.getByText("€ 496,44 per maand", { exact: false })).toBeVisible();
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("600");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("8");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ })).not.toContainText("Huurtoeslag");
  await expect(page.locator(".signalen")).toContainText("Reken dan opnieuw.");
  await geenToegankelijkheidsfouten(page);
});

test("wie al werkt, kiest wat er verandert en vult niets dubbel in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 38);
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await page.getByRole("group", { name: "Heeft u nu al betaald werk naast uw bijstand?" }).getByLabel("Ja").check();
  await page.getByRole("group", { name: "Welk bedrag van uw loon weet u?" }).first().getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15,00");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("12");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.locator(".foutmelding").getByText("Kies wat er verandert.")).toBeVisible();
  await expect(page.locator(".foutmelding").getByText("Kies hoe lang u al werkt.")).toBeVisible();
  await expect(page.locator(".foutmelding").getByText("Kies een antwoord.", { exact: false })).toBeVisible();
  await page.getByLabel("Nee, ik krijg het apart").check();
  await page.getByLabel("6 maanden of langer").check();
  await page.getByLabel("Ik ga meer uren werken bij mijn huidige werk").check();
  await expect(page.getByRole("textbox", { name: "Bedrag per uur" })).toHaveCount(1);
  await page.getByLabel("Hoeveel uur per week gaat u in totaal werken?").fill("24");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.locator(".antwoord")).toContainText("Bij 24 uur per week");
  // Wie al 6 maanden werkt: geen keuze voor de periode; de schuif begint boven het huidige aantal uren.
  await expect(page.getByRole("group", { name: "Voor welke maanden wilt u de uitkomst zien?" })).toHaveCount(0);
  await expect(page.locator("#urenschuif")).toHaveAttribute("min", "13");
  await expect(page.locator("#urenschuif")).toHaveAttribute("aria-valuetext", "24 uur per week");
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await page.getByLabel("Ik neem er werk bij, naast mijn huidige werk").check();
  await expect(page.getByRole("heading", { name: "Het extra werk" })).toBeVisible();
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("500");
  await page.getByRole("textbox", { name: "Hoeveel uur per week gaat u bij het extra werk werken?" }).fill("8");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.getByText("Uren extra werk per week")).toBeVisible();
  await expect(page.locator(".antwoord")).toContainText("Bij 8 uur extra werk per week");
  await geenToegankelijkheidsfouten(page);
});

test("uurloon: vraag of het vakantiegeld al in het uurloon zit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 30);
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("20");
  await page.getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("14,50");
  await page.getByLabel("Ja, het is een all-in uurloon").check();
  await verder(page, "Bereken wat ik overhoud");
  await page.getByText("Bekijk de").click();
  await expect(page.locator("section[aria-labelledby='aannames'] details .aannames")).toContainText("all-in");
  await geenToegankelijkheidsfouten(page);
});

test("ander inkomen telt mee, de afdruk toont de invoer, en opnieuw beginnen wist alles", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 40);
  await page.getByRole("group", { name: "Heeft u ander inkomen dan bijstand en loon?" }).getByLabel("Ja").check();
  await page.getByLabel("Ander inkomen per maand (wat op uw rekening komt)").fill("250");
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("32");
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("2.600");
  await verder(page, "Bereken wat ik overhoud");
  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  await expect(tabel.getByRole("row", { name: /Ander inkomen/ })).toContainText("€ 250");
  await expect(page.locator(".signalen")).toContainText("Gemeentelijke belastingen");
  await expect(page.locator(".signalen")).toContainText("Zorgverzekering");
  await geenToegankelijkheidsfouten(page);
  // Afdruk: de invoer staat erbij, de bediening niet.
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".gegevens")).toContainText("Ander inkomen€ 250 netto per maand");
  await expect(page.locator("#urenschuif")).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Opnieuw beginnen" }).click();
  await page.getByRole("button", { name: "Ja, alles wissen" }).click();
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await expect(page.getByLabel("Uw geboortedatum")).toHaveValue("");
});

test("de terugknop van de browser gaat een stap terug en bewaart wat is ingevuld", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 40);
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await expect(page.getByRole("heading", { name: "Uw werk" })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("heading", { name: "Uw woning" })).toBeVisible();
  await expect(page.getByLabel("In een koopwoning")).toBeChecked();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Uw huishouden" })).toBeVisible();
  await expect(page.getByLabel("Uw geboortedatum")).toHaveValue(`01-01-${new Date().getFullYear() - 40}`);

  // Vooruit kan alleen als de stap goed is ingevuld.
  await page.getByLabel("Uw geboortedatum").fill("");
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Uw huishouden" })).toBeVisible();
  // Wie alleen cijfers typt, krijgt de streepjes vanzelf.
  await page.getByLabel("Uw geboortedatum").pressSequentially(`0101${new Date().getFullYear() - 40}`);
  await expect(page.getByLabel("Uw geboortedatum")).toHaveValue(`01-01-${new Date().getFullYear() - 40}`);
  await verder(page);
  await expect(page.getByRole("heading", { name: "Uw woning" })).toBeVisible();
  await page.getByRole("button", { name: "Vorige stap" }).click();
  await expect(page.getByRole("heading", { name: "Uw huishouden" })).toBeVisible();
});

test("op een kamer: wel de huur, geen huurtoeslag en geen vraag naar jonge huisgenoten; in een eigen huurwoning wel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 40);
  await verder(page);
  await page.getByLabel(/Op een kamer, of in een woning waar ik de keuken, wc of douche deel/).check();
  await expect(page.getByLabel("Kale huur per maand")).toHaveCount(0);
  await page.getByLabel("Huur per maand", { exact: true }).fill("450");
  await page.getByRole("group", { name: "Wonen er nog andere mensen van 18 jaar of ouder bij u in huis?" }).getByLabel("Ja").check();
  await expect(page.getByLabel("Hoeveel van hen zijn 18 tot en met 26 jaar?")).toHaveCount(0);
  await page.getByRole("group", { name: "Wonen er nog andere mensen van 18 jaar of ouder bij u in huis?" }).getByLabel("Nee").check();
  await geenToegankelijkheidsfouten(page);
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.000");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("16");
  await verder(page, "Bereken wat ik overhoud");
  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  await expect(tabel).not.toContainText("Huurtoeslag");

  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await page.getByRole("button", { name: "Vorige stap" }).click();
  await page.getByLabel(/In een huurwoning met een eigen voordeur/).check();
  await page.getByLabel("Kale huur per maand").fill("650");
  await verder(page);
  await verder(page, "Bereken wat ik overhoud");
  await expect(tabel).toContainText("Huurtoeslag");
});

test("de uitkomst zegt of de bijstand blijft of stopt, en noemt de eigen kosten als die het verschil maken", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 46);
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.200");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("19");
  await page.getByLabel(/Andere kosten door het werk/).fill("20");
  await verder(page, "Bereken wat ik overhoud");

  const antwoord = page.locator(".antwoord");
  await expect(antwoord).toContainText("bijstand per maand naast uw loon");
  // Onder de tabel staat waarom het loon anders is dan wat is ingevuld.
  await expect(page.locator(".tabel-noten")).toContainText("U vulde € 1.200 bruto per maand in.");
  await expect(page.locator(".tabel-noten")).toContainText("met vakantiegeld");
  const uitleg = page.locator(".toelichting");
  await expect(uitleg).toContainText("De gemeente beslist of die voor u geldt");

  // Na de vrijlating: evenveel inkomsten, dus de eigen kosten maken het verschil.
  await page.getByRole("group", { name: "Voor welke maanden wilt u de uitkomst zien?" }).getByRole("radio").last().check();
  await expect(antwoord).toContainText("minder over");
  await expect(antwoord).toContainText("Dat komt door de kosten voor het werk die u zelf betaalt: € 20 per maand.");
  await expect(uitleg).not.toContainText("Vraag uw contactpersoon bij de gemeente of de vrijlating voor u geldt");
  await expect(uitleg).toContainText("Kosten die u zelf voor het werk maakt, gaan daar nog af.");

  // Net boven de norm: alleen door de vrijlating is er de eerste maanden nog bijstand.
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("1.500");
  await verder(page, "Bereken wat ik overhoud");
  await expect(antwoord).toContainText("door de vrijlating. Vanaf maand 7 stopt uw bijstand.");
  await page.getByRole("group", { name: "Voor welke maanden wilt u de uitkomst zien?" }).getByRole("radio").last().check();
  await expect(antwoord).toContainText(/Uw bijstand van €\s?[\d.]+ per maand stopt\./);

  // Met een hoog loon stopt de bijstand meteen.
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("2.800");
  await verder(page, "Bereken wat ik overhoud");
  await expect(antwoord).toContainText(/Uw bijstand van €\s?[\d.]+ per maand stopt\./);
});

test("bij iemand in huis met kostgeld: alleen het deel voor de woonruimte telt, en een laag bedrag verlaagt de bijstand", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 30);
  await verder(page);
  await page.getByLabel("Bij iemand anders in huis, en ik betaal kostgeld of huur").check();
  await page.getByLabel("Hoeveel betaalt u per maand voor uw woonruimte?").fill("150");
  // Bij iemand anders in huis: geen ja/nee-vraag, meteen het aantal. De persoon bij wie u woont is hier 25.
  await expect(page.getByRole("group", { name: /Wonen er nog andere mensen/ })).toHaveCount(0);
  await page.getByLabel(/Hoeveel mensen van 27 jaar of ouder wonen er in dat huis, naast u\?/).fill("0");
  await geenToegankelijkheidsfouten(page);
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("600");
  await page.getByRole("textbox", { name: /Hoeveel uur per week (werkt u|gaat u werken)/ }).fill("8");
  await verder(page, "Bereken wat ik overhoud");
  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  // Norm € 1.419,46 min (€ 202,78 − € 150) = € 1.366,68.
  await expect(tabel.getByRole("row", { name: /Bijstand/ })).toContainText("1.367");
  await expect(tabel).not.toContainText("Huurtoeslag");
  await expect(page.locator(".tabel-noten")).toContainText("bij iemand anders in huis woont");
});

test("netto loon per week, en inkomen van huisgenoten onbekend", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 39);
  await verder(page);
  await page.getByLabel(/In een huurwoning met een eigen voordeur/).check();
  await page.getByLabel("Kale huur per maand").fill("700");
  await page.getByRole("group", { name: "Wonen er nog andere mensen van 18 jaar of ouder bij u in huis?" }).getByLabel("Ja").check();
  await page.getByLabel("Hoeveel van hen zijn 27 jaar of ouder?").fill("2");
  await page.getByLabel("Hoeveel van hen zijn 18 tot en met 26 jaar?").fill("0");
  await page.getByLabel("Ik weet dit inkomen niet").check();
  await expect(page.locator("#huisgenotenInkomen")).toHaveCount(0);
  await geenToegankelijkheidsfouten(page);
  await verder(page);
  await page.getByLabel("Netto loon per week (wat op mijn rekening komt)").check();
  await page.getByRole("textbox", { name: /Netto loon per week/ }).fill("300");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("24");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.locator(".tabel-noten")).toContainText("U vulde € 300 netto per week in.");
  await expect(page.locator(".tabel-noten")).toContainText("omgerekend naar een maand");
  // Zonder hun inkomen rekent de rekenhulp toch door, en zegt dat onder de tabel.
  await expect(page.locator(".tabel-noten")).toContainText("Het inkomen van uw huisgenoten is niet meegeteld. Daardoor kan uw huurtoeslag lager zijn dan hier staat.");
});

test("omwegen: een oud bedrag blijft niet hangen, opgeloste fouten verdwijnen, en de urenschuif blijft staan", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 36);

  // Een kind toevoegen zonder geboortedatum geeft een fout; na Nee bij kinderen is die vraag weg, en de melding ook.
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Ja").check();
  await verder(page);
  await expect(page.getByRole("alert")).toContainText("Geboortedatum kind 1");
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Nee").check();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await verder(page);

  // Van huur naar kostgeld en terug: het veld begint steeds leeg.
  await page.getByLabel("In een huurwoning met een eigen voordeur, keuken, wc en douche").check();
  await page.getByLabel("Kale huur per maand").fill("750");
  await page.getByLabel("Bij iemand anders in huis, en ik betaal kostgeld of huur").check();
  await expect(page.getByLabel("Hoeveel betaalt u per maand voor uw woonruimte?")).toHaveValue("");
  await page.getByLabel("Hoeveel betaalt u per maand voor uw woonruimte?").fill("300");
  await page.getByLabel("In een huurwoning met een eigen voordeur, keuken, wc en douche").check();
  await expect(page.getByLabel("Kale huur per maand")).toHaveValue("");
  await page.getByLabel("Kale huur per maand").fill("750");
  await verder(page);

  // Een ander soort loon: het veld begint leeg.
  await kiesLoon(page, "Bruto loon per uur");
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15");
  await page.getByLabel("Netto loon per maand (wat op mijn rekening komt)").check();
  await expect(page.getByRole("textbox", { name: "Netto loon per maand voor deze uren" })).toHaveValue("");
  await page.getByLabel("Bruto loon per uur", { exact: true }).check();
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("20");
  await verder(page, "Bereken wat ik overhoud");

  // De schuif op 28; na "Gegevens aanpassen" en opnieuw rekenen staat hij nog op 28.
  const schuif = page.getByRole("slider");
  await schuif.fill("28");
  const bij28 = await page.locator(".antwoord-zin").innerText();
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await expect(page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ })).toHaveValue("20");
  await verder(page, "Bereken wat ik overhoud");
  await expect(schuif).toHaveValue("28");
  await expect(page.locator(".antwoord-zin")).toHaveText(bij28);
  // "Wat u heeft ingevuld" toont wat er is ingevuld, en dat de urenschuif is verschoven.
  await expect(page.getByText("20 uur per week, € 15 bruto per uur, vakantiegeld apart. U heeft de urenschuif verschoven naar 28 uur.").first()).toBeAttached();

  // Andere uren ingevuld: de schuif begint bij die uren.
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("24");
  await verder(page, "Bereken wat ik overhoud");
  await expect(schuif).toHaveValue("24");
});

test("alleenstaande ouder: kinderopvangtoeslag aanvragen, meldingen per periode, periodes met dezelfde uitkomst samen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Ja").check();
  await geboren(page, "Uw geboortedatum", 34);
  await geboren(page, "Geboortedatum kind 1", 2);
  await page.getByText("Dit kind gaat naar de kinderopvang").click();
  await page.getByLabel("Kinderdagverblijf").check();
  await page.getByLabel("Hoeveel uur per week gaat dit kind naar de opvang?").fill("24");
  await verder(page);
  await page.getByLabel("In een huurwoning met een eigen voordeur, keuken, wc en douche").check();
  await page.getByLabel("Kale huur per maand").fill("690");
  await verder(page);
  await kiesLoon(page, "Bruto loon per uur");
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("14,75");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("24");
  await verder(page, "Bereken wat ik overhoud");

  await expect(page.locator(".te-doen")).toContainText("Vraag kinderopvangtoeslag aan");
  await expect(page.locator(".tabel-noten")).toContainText("U wist de prijs van het kinderdagverblijf niet");
  // De bijstand stopt na maand 6, dus maand 7 t/m 36 en vanaf maand 37 zijn één periode.
  await expect(page.getByRole("radio", { name: "Vanaf maand 7" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: /^Goed om te weten in maand 1 t\/\u2060?m 6$/ })).toBeVisible();
  // "t/m" blijft bij elkaar: geen regelafbreking na de schuine streep (onzichtbaar verbindingsteken).
  expect(await page.locator(".antwoord-zin").textContent()).toContain("t/\u2060m");
  await page.getByRole("radio", { name: "Vanaf maand 7" }).check();
  await expect(page.getByRole("heading", { name: "Goed om te weten vanaf maand 7" })).toBeVisible();
  // Kop en tabel zeggen hetzelfde bedrag.
  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  const over = (await tabel.getByRole("row", { name: /U houdt over/ }).innerText()).match(/€\s?([\d.]+)/g)!.map((t) => Number(t.replace(/[^\d]/g, "")));
  const kop = Number((await page.locator(".antwoord-zin").innerText()).match(/€\s?([\d.]+)/)![1].replace(/\./g, ""));
  expect(kop).toBe(over[1] - over[0]);
  await geenToegankelijkheidsfouten(page);
});

test("toetsenbord en invoer: halve uren, bron alleen op klik, focus na kind toevoegen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Ja").check();
  await expect(page.getByLabel("Geboortedatum kind 1")).toHaveAttribute("placeholder", "bijv. 14-03-2018");
  await page.getByRole("button", { name: "Kind toevoegen" }).click();
  await expect(page.getByLabel("Geboortedatum kind 2")).toBeFocused();
  await page.getByRole("button", { name: "Kind 2 verwijderen" }).click();
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Nee").check();
  await geboren(page, "Uw geboortedatum", 36);
  await verder(page);
  await page.getByLabel("In een huurwoning met een eigen voordeur, keuken, wc en douche").check();
  await page.getByLabel("Kale huur per maand").fill("750");
  await verder(page);
  await kiesLoon(page, "Bruto loon per uur");
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("2,5");
  await page.getByRole("button", { name: "Bereken wat ik overhoud" }).click();
  await expect(page.locator(".foutsamenvatting")).toContainText("Vul een heel aantal uren in");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("20");
  await verder(page, "Bereken wat ik overhoud");

  // Focus op een bron opent het venster niet; Enter wel; Escape sluit en zet de focus terug.
  const knop = page.locator(".toelichting .bron-knop").first();
  const tekst = page.locator(".toelichting .bron-tekst").first();
  await knop.focus();
  await expect(tekst).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(tekst).toBeVisible();
  await expect(knop).toHaveAttribute("aria-expanded", "true");
  await tekst.getByRole("button", { name: "Sluiten" }).focus();
  await page.keyboard.press("Escape");
  await expect(tekst).toBeHidden();
  await expect(knop).toBeFocused();
});

test("kind van 18 of ouder: eigen inkomen voor de huurtoeslag, en alle bedragen kloppen met de tabel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Ja").check();
  await geboren(page, "Uw geboortedatum", 48);
  await geboren(page, "Geboortedatum kind 1", 20);
  await verder(page);
  await page.getByLabel("In een huurwoning met een eigen voordeur, keuken, wc en douche").check();
  await page.getByLabel("Kale huur per maand").fill("780");
  const kind = page.getByRole("textbox", { name: /bruto inkomen per jaar van uw kind van 20 jaar/ });
  await expect(kind).toBeVisible();
  await page.getByLabel("Ik weet dit inkomen niet").check();
  await expect(kind).toHaveCount(0);
  await page.getByLabel("Ik weet dit inkomen niet").uncheck();
  await kind.fill("9.000");
  await verder(page);
  await kiesLoon(page, "Bruto loon per uur");
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("24");
  await verder(page, "Bereken wat ik overhoud");

  // De rekenhulp trekt de vrijstelling zelf af: van € 9.000 telt € 2.782 mee.
  await expect(page.locator("main")).toContainText("Plus het inkomen van uw kind boven € 6.218 per jaar");

  // Alle bedragen op de pagina zijn na te rekenen met de tabel.
  const getal = (t: string) => Number(t.replace(/[^\d-]/g, "").replace(/^-$/, "0"));
  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  for (const radio of await page.getByRole("radio").all()) {
    await radio.check();
    const kolommen = async (naam: RegExp) => (await tabel.getByRole("row", { name: naam }).locator("td").allInnerTexts()).map(getal);
    const [overNu, overMet] = await kolommen(/U houdt over/);
    const [binnenNu, binnenMet] = await kolommen(/Totaal binnen/);
    const eraf = (await tabel.getByRole("row", { name: /Totaal eraf/ }).count()) ? await kolommen(/Totaal eraf/) : [0, 0];
    expect(overNu).toBe(binnenNu - Math.abs(eraf[0]));
    expect(overMet).toBe(binnenMet - Math.abs(eraf[1]));
    const kop = getal((await page.locator(".antwoord-zin").innerText()).match(/€\s?[\d.]+/)![0]);
    expect(kop).toBe(Math.abs(overMet - overNu));
  }
  // De eerste 12 maanden samen = de bedragen per periode keer het aantal maanden.
  const regels = await page.locator(".antwoord-lijst li").allInnerTexts();
  if (regels.length > 1) {
    const bedragen = regels.map((r) => getal(r.match(/€\s?[\d.]+/)![0]));
    expect(bedragen[bedragen.length - 1]).toBe(bedragen[0] * 6 + bedragen[1] * 6);
  }
});

test("alimentatie: partneralimentatie na belasting, kinderalimentatie alleen met kinderen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Woont u samen met een partner?" }).getByLabel("Nee").check();
  await geboren(page, "Uw geboortedatum", 38);
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Nee").check();
  await page.getByRole("group", { name: "Heeft u ander inkomen dan bijstand en loon?" }).getByLabel("Ja").check();
  await expect(page.getByLabel("Kinderalimentatie per maand")).toHaveCount(0);
  // Niets ingevuld: een duidelijke melding.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutsamenvatting")).toContainText("Vul bij minstens één soort inkomen een bedrag in");
  await page.getByLabel("Partneralimentatie per maand (wat u ontvangt)").fill("300");
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("800");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("12");
  await verder(page, "Bereken wat ik overhoud");
  const tabel = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ });
  // € 300 − 35,75% belasting = € 192,75.
  await expect(tabel.getByRole("row", { name: /Partneralimentatie \(na belasting\)/ })).toContainText("€ 193");
  // Sleutelpas en Kindtegoed zijn twee aparte meldingen; grenzen met vakantiegeld.
  await expect(page.locator(".signalen")).toContainText("met vakantiegeld");
});

test("partner werkt korter dan 6 maanden: ook voor het loon van de partner een vrijlating", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Woont u samen met een partner?" }).getByLabel("Ja").check();
  await geboren(page, "Uw geboortedatum", 41);
  await geboren(page, "Geboortedatum van uw partner", 39);
  await page.getByRole("group", { name: "Heeft uw partner betaald werk?" }).getByLabel("Ja").check();
  await page.getByRole("textbox", { name: "Bruto maandloon van uw partner" }).fill("450");
  await page.getByRole("group", { name: "Hoe lang werkt uw partner al naast de bijstand?" }).getByLabel("Korter dan 6 maanden").check();
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("900");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("16");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.locator("main")).toContainText("Mag uw partner houden");
  await geenToegankelijkheidsfouten(page);
});

test("kinderalimentatie als ja/nee-vraag bij de kinderen, en de zin onder de tabel volgt de urenschuif", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await page.getByRole("group", { name: "Woont u samen met een partner?" }).getByLabel("Nee").check();
  await geboren(page, "Uw geboortedatum", 38);
  // Ander inkomen staat nu boven de kinderen, zonder vak voor kinderalimentatie.
  const anderInkomen = page.getByRole("group", { name: "Heeft u ander inkomen dan bijstand en loon?" });
  const kinderen = page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" });
  expect((await anderInkomen.boundingBox())!.y).toBeLessThan((await kinderen.boundingBox())!.y);
  await anderInkomen.getByLabel("Ja").check();
  await expect(page.getByLabel("Kinderalimentatie per maand")).toHaveCount(0);
  await anderInkomen.getByLabel("Nee").check();
  await kinderen.getByLabel("Ja").check();
  await geboren(page, "Geboortedatum kind 1", 6);
  await expect(page.getByLabel("Kinderalimentatie per maand")).toHaveCount(0);
  // Geen antwoord op de vraag naar kinderalimentatie: een melding.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutsamenvatting")).toContainText("Krijgt u kinderalimentatie voor deze kinderen: Kies Ja of Nee.");
  await page.getByRole("group", { name: "Krijgt u kinderalimentatie voor deze kinderen?" }).getByLabel("Ja").check();
  // Ja, maar geen bedrag: een melding.
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await expect(page.locator(".foutsamenvatting")).toContainText("Vul dit in");
  await page.getByLabel("Kinderalimentatie per maand").fill("250");
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Netto loon per maand (wat op mijn rekening komt)");
  await page.getByRole("textbox", { name: "Netto loon per maand voor deze uren" }).fill("1300");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("24");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /Kinderalimentatie/ })).toContainText("€ 250");
  await expect(page.getByText("U vulde € 1.300 netto per maand in. In de tabel")).toBeVisible();
  await page.getByRole("slider").fill("40");
  // Netto loon: het bruto loon schaalt mee, niet het netto loon. De zin past bij de tabel (netto zonder vakantiegeld × 1,08).
  await expect(page.getByText("U vulde € 1.300 netto per maand in, bij 24 uur per week. Bij 40 uur is dat ongeveer € 2.080 netto per maand. In de tabel")).toBeVisible();
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /Netto loon/ })).toContainText("€ 2.247");

  // Geen kinderen meer: de kinderalimentatie telt niet meer mee.
  await page.getByRole("button", { name: "Gegevens aanpassen" }).click();
  await page.getByRole("button", { name: "Vorige stap" }).click();
  await page.getByRole("button", { name: "Vorige stap" }).click();
  await page.getByRole("group", { name: "Heeft u kinderen die bij u wonen?" }).getByLabel("Nee").check();
  await verder(page);
  await verder(page);
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).getByRole("row", { name: /alimentatie|Ander inkomen/i })).toHaveCount(0);
});

test("urenschuif bij een bruto maandloon: het bedrag in de zin schaalt precies mee", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 38);
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Bruto loon per maand");
  await page.getByRole("textbox", { name: "Bruto loon per maand" }).fill("2300");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("32");
  await verder(page, "Bereken wat ik overhoud");
  await page.getByRole("slider").fill("36");
  await expect(page.getByText("U vulde € 2.300 bruto per maand in, bij 32 uur per week. Bij 36 uur is dat € 2.588 bruto per maand.")).toBeVisible();
});

test("Escape in een geopende uitleg sluit die en zet de focus terug op het i-knopje", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  const knop = page.locator(".info-knop").first();
  await knop.click();
  const uitleg = page.locator(`#${await knop.getAttribute("aria-controls")}`);
  const bronknop = uitleg.locator(".bron-knop").first();
  // Eerst een bron open: Escape sluit alleen de bron.
  await bronknop.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".bron.open")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".bron.open")).toHaveCount(0);
  await expect(knop).toHaveAttribute("aria-expanded", "true");
  // Daarna, met de focus op de bronknop: Escape sluit de uitleg.
  await expect(bronknop).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(knop).toHaveAttribute("aria-expanded", "false");
  await expect(knop).toBeFocused();
});

test("afronding: bij de maximale vrijlating verspringt het bedrag niet met € 1 per uur", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 36);
  await verder(page);
  await page.getByLabel(/In een huurwoning met een eigen voordeur/).check();
  await page.getByLabel("Kale huur per maand").fill("750");
  await verder(page);
  await kiesLoon(page, "Bruto loon per uur");
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("20");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await verder(page, "Bereken wat ik overhoud");
  const zinnen = new Set<string>();
  for (let u = 17; u <= 24; u++) {
    await page.getByRole("slider").fill(String(u));
    const houdtOver = page.getByRole("table", { name: /Zo is het bedrag opgebouwd/ }).locator("tfoot td").last();
    zinnen.add(`${await page.locator(".antwoord-zin").innerText()}|${await houdtOver.innerText()}`);
  }
  expect(zinnen.size).toBe(1);
});

test("regelingen: met bijstand telt het vrijgelaten deel van het loon niet mee", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 36);
  await verder(page);
  await page.getByLabel(/In een huurwoning met een eigen voordeur/).check();
  await page.getByLabel("Kale huur per maand").fill("750");
  await verder(page);
  await kiesLoon(page, "Bruto loon per uur");
  await page.getByRole("textbox", { name: "Bedrag per uur" }).fill("15");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("20");
  await page.getByLabel("Nee, ik krijg het apart").check();
  await verder(page, "Bereken wat ik overhoud");
  // Maand 1 t/m 6: nog bijstand door de vrijlating.
  const polis = page.locator("details.signaal", { has: page.locator("summary", { hasText: "Zorgverzekering" }) });
  await expect(polis).toContainText("kunt u de Gemeentepolis");
  await expect(polis).toContainText("U krijgt nog bijstand. Het deel van uw loon dat u mag houden, telt voor deze regeling niet mee.");
  await expect(polis).not.toContainText("zonder toeslagen, is ongeveer");
});

test("loon per 4 weken: eigen keuze, met de melding over twee keer loon in één maand", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin met rekenen" }).click();
  await geboren(page, "Uw geboortedatum", 36);
  await verder(page);
  await page.getByLabel("In een koopwoning").check();
  await verder(page);
  await kiesLoon(page, "Netto loon per 4 weken (wat op mijn rekening komt)");
  await page.getByRole("textbox", { name: /Netto loon per 4 weken/ }).fill("1100");
  await page.getByRole("textbox", { name: /Hoeveel uur per week gaat u werken/ }).fill("20");
  await verder(page, "Bereken wat ik overhoud");
  await expect(page.locator(".signalen")).toContainText("Loon per 4 weken");
  await expect(page.getByText(/U vulde €\s1\.100 netto per 4 weken in/)).toBeVisible();
});
