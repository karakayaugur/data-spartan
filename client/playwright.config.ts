import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  workers: 1,
  timeout: process.env["PW_SLOW_MO"] ? 120_000 : 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4300",
    launchOptions: { slowMo: Number(process.env["PW_SLOW_MO"] ?? 0) },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm start -- --host 127.0.0.1 --port 4300",
    url: "http://127.0.0.1:4300",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
