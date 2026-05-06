// ─────────────────────────────────────────────────────────────────────────────
// Playwright — tests e2e des golden paths critiques.
//
// Lance :
//   npm run test:e2e            # exécute les tests
//   npm run test:e2e -- --ui    # mode interactif
//
// La CI lance avec une vraie DB Postgres (service docker) — voir
// .github/workflows/ci.yml. En local, démarre `docker compose up -d`
// d'abord pour avoir Postgres + Redis.
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // évite les races sur la DB partagée
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // séquentiel — anti-flakiness sur DB partagée
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile Safari coverage critique pour le marché marocain.
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  webServer: process.env.CI
    ? undefined // CI : démarre l'app séparément avant
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
