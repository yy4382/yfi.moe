import { defineConfig, devices } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(packageDir, "../backend");
const databasePath = resolve(packageDir, ".tmp/comment-e2e.db");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: "./test-results",
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm exec tsx src/index.ts",
      cwd: backendDir,
      env: {
        ...process.env,
        FRONTEND_URL: "http://localhost:3100",
        BACKEND_URL: "http://localhost:3101/api/",
        UNSUBSCRIBE_SECRET: "comment-e2e-unsubscribe-secret",
        BETTER_AUTH_SECRET: "comment-e2e-auth-secret-at-least-32-characters",
        DATABASE_URL: `file:${databasePath}`,
        GITHUB_CLIENT_ID: "comment-e2e-github-client",
        GITHUB_CLIENT_SECRET: "comment-e2e-github-secret",
        EMAIL_NOTIFICATION_ENABLED: "false",
        EMAIL_FROM: "comment-e2e@example.com",
        SMTP_HOST: "localhost",
        SMTP_PORT: "1025",
        SMTP_SECURE: "false",
        SMTP_USER: "comment-e2e",
        SMTP_PASS: "comment-e2e",
        LOG_LEVEL: "warn",
      },
      url: "http://localhost:3101/api/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm host",
      cwd: packageDir,
      url: "http://localhost:3100",
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
