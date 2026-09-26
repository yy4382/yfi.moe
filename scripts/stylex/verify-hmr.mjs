import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";

const path = new URL("./probe/src/components/probe.stylex.ts", import.meta.url);
const original = await readFile(path, "utf8");
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.goto("http://localhost:3101");
  await page.locator("astro-island:not([ssr])").waitFor({ state: "attached" });
  await writeFile(path, original.replace("padding: 24", "padding: 28"));
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector("main")).padding === "28px",
  );
  await writeFile(path, original);
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector("main")).padding === "24px",
  );
  assert.equal(
    await page.locator("main").evaluate((el) => getComputedStyle(el).padding),
    "24px",
  );
  console.log(
    "PASS: shared StyleX module edits update Astro CSS and restore without a manual reload",
  );
} finally {
  await writeFile(path, original);
  await browser.close();
}
