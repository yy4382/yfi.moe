#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const requireFromRoot = createRequire(resolve(repoRoot, "package.json"));
const requireFromApp = createRequire(
  resolve(repoRoot, "app/blog-astro/package.json"),
);
const { chromium } = requireFromRoot("@playwright/test");
const sharp = requireFromApp("sharp");

const options = parseArgs(process.argv.slice(2));
const outputRoot = resolve(repoRoot, options.output);
const modes = [
  {
    name: "before",
    buildDir: resolve(repoRoot, options.beforeBuild),
    port: options.port,
  },
  {
    name: "after",
    buildDir: resolve(repoRoot, options.afterBuild),
    port: options.port + 1,
  },
];
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  captures: [],
  assertions: [],
  comparisons: [],
};

await mkdir(outputRoot, { recursive: true });
for (const mode of modes) await captureMode(mode);
await compareCaptures();
await writeFile(
  resolve(outputRoot, "report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
await writeMarkdown();

const failedAssertions = report.assertions.filter((item) => !item.passed);
const changed = report.comparisons.filter((item) => !item.exact);
console.log(
  `${report.captures.length} captures, ${report.assertions.length - failedAssertions.length}/${report.assertions.length} assertions passed, ${report.comparisons.length - changed.length}/${report.comparisons.length} exact comparisons.`,
);
if (failedAssertions.length || changed.length) process.exitCode = 1;

async function captureMode(mode) {
  const baseURL = `http://127.0.0.1:${mode.port}`;
  const server = await startServer(mode.buildDir, baseURL, mode.port);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const colorScheme of ["light", "dark"]) {
      for (const width of [639, 640, 1023, 1280]) {
        const context = await createContext(
          browser,
          { width, height: 900 },
          colorScheme,
        );
        const page = await context.newPage();
        await installNetworkFixtures(context);
        for (const target of [
          { id: "home", path: "/" },
          { id: "post-list", path: "/post" },
        ]) {
          await visitStable(page, baseURL, target.path);
          await save(
            page,
            mode.name,
            `responsive--${target.id}--${width}--${colorScheme}`,
            page,
          );
        }
        await context.close();
      }

      await captureDesktopInteractions(browser, mode, baseURL, colorScheme);
      await captureMobileInteractions(browser, mode, baseURL, colorScheme);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

async function captureDesktopInteractions(browser, mode, baseURL, colorScheme) {
  const context = await createContext(
    browser,
    { width: 1440, height: 1000 },
    colorScheme,
  );
  await installNetworkFixtures(context);
  const page = await context.newPage();

  await visitStable(page, baseURL, "/");
  await page.locator("header a[href='/post']").hover();
  await save(
    page,
    mode.name,
    `interaction--navbar-hover--desktop--${colorScheme}`,
    page.locator("header"),
  );

  await visitStable(page, baseURL, "/");
  const focused = await tabUntil(page, "header a[href='/post']");
  addAssertion(mode.name, `navbar-keyboard-focus--${colorScheme}`, focused);
  await save(
    page,
    mode.name,
    `interaction--navbar-focus--desktop--${colorScheme}`,
    page.locator("header"),
  );

  await visitStable(page, baseURL, "/");
  await page.locator("header a[href='/post']").click();
  await page.waitForURL((url) => url.pathname === "/post");
  addAssertion(
    mode.name,
    `navbar-navigation--${colorScheme}`,
    new URL(page.url()).pathname === "/post",
  );

  await visitStable(page, baseURL, "/post/stylex-migration");
  await page.getByText("2024-03-03", { exact: true }).first().hover();
  const datePopup = page.getByText("于 2024-03-01 08:15 开始写作", {
    exact: true,
  });
  await datePopup.waitFor();
  await save(
    page,
    mode.name,
    `interaction--date-hover--desktop--${colorScheme}`,
    datePopup.locator("xpath=.."),
  );
  await page.keyboard.press("Escape");
  await datePopup.waitFor({ state: "hidden" });
  addAssertion(
    mode.name,
    `date-popover-escape--${colorScheme}`,
    !(await datePopup.isVisible()),
  );
  await context.close();
}

async function captureMobileInteractions(browser, mode, baseURL, colorScheme) {
  const context = await createContext(
    browser,
    { width: 390, height: 844 },
    colorScheme,
  );
  await installNetworkFixtures(context);
  const page = await context.newPage();

  await visitStable(page, baseURL, "/post/stylex-migration");
  await page.evaluate(() => window.scrollTo(0, 520));
  await page.locator("header button").first().click();
  const drawer = page.locator("[data-vaul-drawer]");
  await drawer.waitFor();
  await save(
    page,
    mode.name,
    `interaction--mobile-drawer--${colorScheme}`,
    drawer,
  );
  await page.keyboard.press("Escape");
  await drawer.waitFor({ state: "hidden" });
  addAssertion(
    mode.name,
    `mobile-drawer-escape--${colorScheme}`,
    !(await drawer.isVisible()),
  );

  await visitStable(page, baseURL, "/post/stylex-migration");
  await page.locator("#article-container button").first().click();
  const popup = page.locator("[data-slot='popover-popup']");
  await popup.waitFor();
  await save(page, mode.name, `interaction--mobile-toc--${colorScheme}`, popup);
  await page.keyboard.press("Escape");
  await popup.waitFor({ state: "hidden" });
  addAssertion(
    mode.name,
    `mobile-toc-escape--${colorScheme}`,
    !(await popup.isVisible()),
  );
  await context.close();
}

async function createContext(browser, viewport, colorScheme) {
  return browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme,
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    reducedMotion: "reduce",
  });
}

async function visitStable(page, baseURL, pathname) {
  const response = await page.goto(new URL(pathname, baseURL).toString(), {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  if (response?.status() !== 200)
    throw new Error(`HTTP ${response?.status()} for ${pathname}`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation-delay:0s!important;animation-duration:0s!important;caret-color:transparent!important;scroll-behavior:auto!important;transition-delay:0s!important;transition-duration:0s!important}",
  });
  await settle(page);
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  let previous = "";
  let repeated = 0;
  for (let index = 0; index < 20 && repeated < 3; index += 1) {
    const value = await page.evaluate(
      () =>
        `${document.documentElement.scrollWidth}:${document.documentElement.scrollHeight}`,
    );
    repeated = value === previous ? repeated + 1 : 0;
    previous = value;
    await page.waitForTimeout(100);
  }
}

async function tabUntil(page, selector) {
  for (let index = 0; index < 20; index += 1) {
    await page.keyboard.press("Tab");
    if (
      await page.evaluate(
        (value) => document.activeElement?.matches(value) ?? false,
        selector,
      )
    )
      return true;
  }
  return false;
}

async function save(page, mode, id, subject) {
  await settle(page);
  const file = resolve(outputRoot, mode, `${id}.png`);
  await mkdir(dirname(file), { recursive: true });
  const isPage = subject === page;
  await subject.screenshot({
    path: file,
    fullPage: isPage,
    animations: "disabled",
    caret: "hide",
  });
  report.captures.push({ mode, id, file: `${mode}/${id}.png` });
}

function addAssertion(mode, id, passed) {
  report.assertions.push({ mode, id, passed });
}

async function compareCaptures() {
  const ids = report.captures
    .filter((item) => item.mode === "before")
    .map((item) => item.id);
  for (const id of ids) {
    const beforePath = resolve(outputRoot, "before", `${id}.png`);
    const afterPath = resolve(outputRoot, "after", `${id}.png`);
    const before = await sharp(beforePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const after = await sharp(afterPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const sameDimensions =
      before.info.width === after.info.width &&
      before.info.height === after.info.height;
    let changedPixels = sameDimensions ? 0 : null;
    if (sameDimensions) {
      for (let offset = 0; offset < before.data.length; offset += 4) {
        if (
          before.data[offset] !== after.data[offset] ||
          before.data[offset + 1] !== after.data[offset + 1] ||
          before.data[offset + 2] !== after.data[offset + 2] ||
          before.data[offset + 3] !== after.data[offset + 3]
        )
          changedPixels += 1;
      }
    }
    report.comparisons.push({
      id,
      sameDimensions,
      changedPixels,
      exact: sameDimensions && changedPixels === 0,
    });
  }
}

async function installNetworkFixtures(context) {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "api.github.com") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          name: "stylex",
          full_name: "facebook/stylex",
          html_url: "https://github.com/facebook/stylex",
          description:
            "StyleX is the styling system for ambitious user interfaces.",
          stargazers_count: 12345,
          forks_count: 987,
          language: "TypeScript",
          owner: { login: "facebook", avatar_url: "" },
        }),
      });
      return;
    }
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost")
      await route.continue();
    else await route.abort("blockedbyclient");
  });
}

async function startServer(buildDir, baseURL, port) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", baseURL);
    let path = resolve(
      buildDir,
      decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html",
    );
    if (!path.match(/\.[a-zA-Z0-9]+$/)) path = resolve(path, "index.html");
    try {
      const body = await readFile(path);
      response.setHeader("Content-Type", contentType(path));
      response.end(body);
    } catch {
      response.statusCode = 404;
      response.end(await readFile(resolve(buildDir, "404.html")));
    }
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, "127.0.0.1", resolveListen);
  });
  return {
    close: () =>
      new Promise((resolveClose, rejectClose) =>
        server.close((error) => (error ? rejectClose(error) : resolveClose())),
      ),
  };
}

function contentType(path) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js") || path.endsWith(".mjs"))
    return "text/javascript; charset=utf-8";
  if (path.endsWith(".woff2")) return "font/woff2";
  if (path.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

async function writeMarkdown() {
  const lines = [
    "# Responsive and interaction verification",
    "",
    `Exact screenshots: ${report.comparisons.filter((item) => item.exact).length}/${report.comparisons.length}.`,
    `Assertions: ${report.assertions.filter((item) => item.passed).length}/${report.assertions.length}.`,
    "",
    "| Capture | Exact | Changed pixels |",
    "| --- | --- | ---: |",
    ...report.comparisons.map(
      (item) =>
        `| ${item.id} | ${item.exact ? "yes" : "no"} | ${item.changedPixels ?? "dimension mismatch"} |`,
    ),
    "",
    "| Assertion | Mode | Passed |",
    "| --- | --- | --- |",
    ...report.assertions.map(
      (item) => `| ${item.id} | ${item.mode} | ${item.passed ? "yes" : "no"} |`,
    ),
    "",
  ];
  await writeFile(resolve(outputRoot, "report.md"), lines.join("\n"));
}

function parseArgs(args) {
  const parsed = {
    beforeBuild: "artifacts.local/stylex/baseline-dist",
    afterBuild: "artifacts.local/stylex/.build-fifth",
    output: "artifacts.local/stylex/interactions",
    port: 4210,
  };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--before-build") parsed.beforeBuild = args[++index];
    else if (args[index] === "--after-build") parsed.afterBuild = args[++index];
    else if (args[index] === "--output") parsed.output = args[++index];
    else if (args[index] === "--port") parsed.port = Number(args[++index]);
    else throw new Error(`Unknown argument: ${args[index]}`);
  }
  return parsed;
}
