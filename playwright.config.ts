import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: "http://localhost:4173",
    ...devices["Pixel 5"],
    // Lokaal kan een bestaande Chrome gebruikt worden: CHROME_PATH=/pad/naar/chrome
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  webServer: [
    {
      command: "npm run preview -w leidenwerkt -- --port 4173 --strictPort",
      url: "http://localhost:4173",
      reuseExistingServer: true,
    },
    // De tweede app (Leidengeldwijzer, nog niet gepubliceerd): e2e/leidengeldwijzer.spec.ts.
    {
      command: "npm run preview -w leidengeldwijzer -- --port 4174 --strictPort",
      url: "http://localhost:4174",
      reuseExistingServer: true,
    },
  ],
});
