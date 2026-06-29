import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Pixel 5'],
    baseURL: 'http://127.0.0.1:5173/ganjoorSearch/',
    locale: 'fa-IR',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173/ganjoorSearch/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
