import { defineConfig, devices } from '@playwright/test';

const port = 8081;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL,
    locale: 'en-CA',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `corepack pnpm --filter @renoroute/mobile exec expo start --web --port ${port} --non-interactive`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      CI: '1',
      EXPO_NO_TELEMETRY: '1',
      BROWSER: 'none',
      EXPO_PUBLIC_E2E: '1',
      // Keeps the client signed out so the suite never calls production Auth.
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'replace-e2e',
    },
  },
});
