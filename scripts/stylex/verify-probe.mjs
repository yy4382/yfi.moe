import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const output = new URL("../../artifacts.local/stylex/probe/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const results = [];
try {
  for (const mode of ["dev", "prod"]) {
    for (const colorScheme of ["light", "dark"]) {
      for (const width of [375, 1280]) {
        const page = await browser.newPage({
          viewport: { width, height: 812 },
          colorScheme,
        });
        console.log("Checking", mode, colorScheme, width);
        const errors = [];
        page.on(
          "pageerror",
          (error) => (errors.push(error.message), console.error(error.message)),
        );
        await page.goto(`http://localhost:${mode === "dev" ? 3101 : 3102}`);
        await page
          .locator("astro-island:not([ssr])")
          .waitFor({ state: "attached", timeout: 15000 });
        const main = page.locator("main");
        const computed = await main.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            width: s.width,
            padding: s.padding,
            background: s.backgroundColor,
          };
        });
        assert.equal(computed.width, width < 600 ? "240px" : "400px");
        assert.equal(computed.padding, "24px");
        assert.equal(
          computed.background,
          colorScheme === "dark" ? "rgb(34, 34, 34)" : "rgb(238, 238, 238)",
        );
        const button = page.getByRole("button", {
          name: "Count: 0",
          exact: true,
        });
        await button.hover();
        assert.equal(
          await button.evaluate((el) => getComputedStyle(el).backgroundColor),
          "rgb(68, 102, 119)",
        );
        await button.click();
        await page
          .getByRole("button", { name: "Count: 1", exact: true })
          .waitFor();
        assert.equal(
          await page
            .locator("main button")
            .evaluate((el) => getComputedStyle(el).width),
          "161px",
        );
        assert.deepEqual(errors, []);
        await main.screenshot({
          path: new URL(`${mode}-${colorScheme}-${width}.png`, output).pathname,
        });
        results.push({
          mode,
          colorScheme,
          width,
          computed,
          hydration: "pass",
          hover: "pass",
          dynamicStyles: "pass",
          errors,
        });
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
await writeFile(
  new URL("results.json", output),
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
