import { defineConfig, devices } from "@playwright/test";

// Parcours de navigation reels (clics, menus, accordeons, formulaires) sur le build
// de production. Lance a part de `npm run test` (qui reste la suite node --test) :
//   npm run build && npm run test:e2e
const PORT = Number(process.env.E2E_PORT ?? 3010);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 45_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    // Largeur tablette sous le point de rupture xl (1280 px) : c'est la mise en
    // page mobile qui doit s'afficher. Chromium suffit, pas de moteur supplementaire.
    { name: "tablette", use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 }, isMobile: false } },
    { name: "ordinateur", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }
  ],
  webServer: {
    command: `PORT=${PORT} HOSTNAME=127.0.0.1 NEXT_PUBLIC_SITE_URL=${baseURL} npm run start`,
    url: `${baseURL}/api/backend/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
