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
      command: "npm run preview -w app -- --port 4173 --strictPort",
      url: "http://localhost:4173",
      reuseExistingServer: true,
    },
    // De tweede app (Leidengeldwijzer, nog niet gepubliceerd): e2e/regelingen.spec.ts.
    {
      command: "npm run preview -w regelingen -- --port 4174 --strictPort",
      url: "http://localhost:4174",
      reuseExistingServer: true,
    },
  ],
});
