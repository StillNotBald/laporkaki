import { defineConfig, devices } from "@playwright/test";

// Record against a deployed URL with DEMO_BASE_URL (no local server then);
// default is the local production server the webServer block builds.
const baseURL = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3211";

export default defineConfig({
  testDir: "./e2e/demo",
  // The narrated journey (holds + slowMo + page loads) runs well past the
  // 30s default; the full demo cut is ~90s.
  timeout: 240_000,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "demo-video",
  use: {
    baseURL,
  },
  projects: [
    {
      name: "demo",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        video: { mode: "on", size: { width: 1280, height: 720 } },
        launchOptions: { slowMo: 250 },
      },
    },
  ],
  webServer: process.env.DEMO_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start -- -p 3211",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000,
      },
});