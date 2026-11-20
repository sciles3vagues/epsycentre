import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI !== undefined ? 2 : 0,
  reporter: process.env.CI !== undefined ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Tests run against the production build to match what users get.
  webServer: {
    // --ignore-lock: one-off foreground server (Astro auto-backgrounds preview when it detects an AI agent,
    // which makes Playwright think the server exited and leaves an orphan process behind).
    command: `pnpm build && pnpm preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}`,
    // Always rebuild: reusing a server would silently test a stale dist/.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
