import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    headless: true,
  },
  webServer: {
    command: 'pnpm exec next start -p 3100',
    url: 'http://127.0.0.1:3100',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
