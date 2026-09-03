import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3210);
const CHANNEL = process.env.CI ? undefined : (process.env.PLAYWRIGHT_CHANNEL ?? 'chrome');
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * End-to-end coverage for the three flows the business depends on
 * (PROMPT.md §19, Phase 8). Chrome from the machine is reused so CI does not
 * have to download a browser bundle.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'uz-UZ',
  },
  projects: [
    {
      name: 'desktop',
      // Locally reuse the installed Chrome; on CI use Playwright's own Chromium,
      // which is what `playwright install chromium` provides.
      use: { ...devices['Desktop Chrome'], ...(CHANNEL ? { channel: CHANNEL } : {}) },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm start -p ${PORT}`,
        url: `${baseURL}/uz`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NEXT_PUBLIC_SITE_URL: baseURL,
          AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-secret-0000000000000000000000000000000=',
          NEXTAUTH_URL: baseURL,
        },
      },
});
