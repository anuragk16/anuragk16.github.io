// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'line',
  use: { baseURL: BASE_URL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'python3 -m http.server 4173', url: BASE_URL, reuseExistingServer: true },
});
