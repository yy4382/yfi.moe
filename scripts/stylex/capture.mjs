#!/usr/bin/env node
import { spawn } from "node:child_process";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  appPages,
  colorSchemes,
  componentShots,
  viewports,
} from "./matrix.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const appDir = resolve(repoRoot, "app/blog-astro");
const fixtureDir = resolve(scriptDir, "fixtures");
const requireFromRoot = createRequire(resolve(repoRoot, "package.json"));
const { chromium } = requireFromRoot("@playwright/test");

const options = parseArgs(process.argv.slice(2));
if (!options.mode || !["before", "after"].includes(options.mode)) {
  fail("--mode must be either before or after");
}

const baseURL = options.baseUrl ?? `http://127.0.0.1:${options.port}`;
const outputRoot = resolve(repoRoot, options.output, options.mode);
const runtime = {
  schemaVersion: 1,
  mode: options.mode,
  clockMode: options.clock,
  baseURL,
  generatedAt: new Date().toISOString(),
  screenshots: [],
};

let server;
let browser;
try {
  await mkdir(outputRoot, { recursive: true });
  if (options.append || options.resume) {
    let existingShots = [];
    try {
      const existing = JSON.parse(
        await readFile(resolve(outputRoot, "capture-report.json"), "utf8"),
      );
      existingShots = existing.screenshots.map((shot) => ({
        ...shot,
        clockMode:
          shot.clockMode && shot.clockMode !== "unknown"
            ? shot.clockMode
            : (existing.clockMode ?? "playwright"),
      }));
    } catch {}
    let recovered = await recoverExistingShots(existingShots);
    if (options.resumeSince)
      recovered = await filterShotsSince(recovered, options.resumeSince);
    runtime.screenshots.push(
      ...(options.resume
        ? recovered
        : recovered.filter((shot) => !willCapture(shot))),
    );
  }
  if (!options.baseUrl) {
    server = await startServer();
  }

  browser = await chromium.launch({ headless: true });
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    if (options.viewport && options.viewport !== viewportName) continue;
    for (const colorScheme of colorSchemes) {
      if (options.theme && options.theme !== colorScheme) continue;
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        colorScheme,
        locale: "zh-CN",
        timezoneId: "Asia/Shanghai",
        reducedMotion: "reduce",
      });
      if (options.clock === "native-date") {
        await context.addInitScript(() => {
          const NativeDate = window.Date;
          const started = NativeDate.now();
          const epoch = NativeDate.parse("2026-09-19T06:00:00.000Z");
          const now = () => epoch + NativeDate.now() - started;
          window.Date = new Proxy(NativeDate, {
            construct(target, args) {
              return Reflect.construct(target, args.length ? args : [now()]);
            },
            apply() {
              return new NativeDate(now()).toString();
            },
            get(target, key) {
              return key === "now" ? now : Reflect.get(target, key);
            },
          });
        });
      }
      await installNetworkFixtures(context, baseURL);
      const page = await context.newPage();
      page.setDefaultTimeout(10_000);
      if (options.clock === "playwright") {
        await page.clock.install({
          time: new Date("2026-09-19T06:00:00.000Z"),
        });
      }
      if (options.debug) {
        page.on("console", (message) =>
          console.log(`[browser:${message.type()}] ${message.text()}`),
        );
        page.on("pageerror", (error) =>
          console.log(`[browser:error] ${error.message}`),
        );
      }

      if (options.scope !== "components") {
        for (const target of appPages) {
          if (!matchesTarget(target.id)) continue;
          if (await shouldResume("app", target, viewportName, colorScheme))
            continue;
          await captureAppPage(page, target, viewportName, colorScheme);
        }
      }

      if (options.scope !== "app") {
        for (const target of componentShots) {
          if (!matchesTarget(target.id)) continue;
          if (target.viewport && target.viewport !== viewportName) continue;
          if (
            await shouldResume("component", target, viewportName, colorScheme)
          )
            continue;
          await captureComponent(page, target, viewportName, colorScheme);
        }
      }
      await context.close();
    }
  }
} finally {
  await browser?.close().catch(() => {});
  await server?.close().catch(() => {});
  const reportPath = resolve(outputRoot, "capture-report.json");
  await writeFile(reportPath, JSON.stringify(runtime, null, 2) + "\n");
  await writeMarkdownReport(reportPath);
}

const failed = runtime.screenshots.filter((shot) => shot.status === "failed");
const skipped = runtime.screenshots.filter((shot) => shot.status === "skipped");
console.log(
  `Captured ${runtime.screenshots.length - failed.length - skipped.length} screenshots; ${failed.length} failed; ${skipped.length} skipped.`,
);
if (failed.length) process.exitCode = 1;

async function captureAppPage(page, target, viewportName, colorScheme) {
  const record = makeRecord("app", target, viewportName, colorScheme);
  try {
    await visitStable(page, target.path, target.expectedStatus);
    await runAction(page, target.action);
    if (target.action) {
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    record.geometry = await settleVisualState(page);
    const file = resolve(
      outputRoot,
      "app",
      `${target.id}--${viewportName}--${colorScheme}.png`,
    );
    await mkdir(dirname(file), { recursive: true });
    record.fullPageGeometry = await screenshotFullPage(
      page,
      file,
      target.action === "wait-comments",
    );
    Object.assign(record, { status: "captured", file: relativeOutput(file) });
  } catch (error) {
    Object.assign(record, { status: "failed", error: formatError(error) });
  }
  runtime.screenshots.push(record);
  await persistCheckpoint();
}

async function captureComponent(page, target, viewportName, colorScheme) {
  const record = makeRecord("component", target, viewportName, colorScheme);
  try {
    await visitStable(page, target.path);
    await runAction(page, target.action);
    record.geometry = await settleVisualState(page);
    await assertActionState(page, target.action);
    let locator = target.hasText
      ? page.locator(target.locator, { hasText: target.hasText })
      : page.locator(target.locator);
    if (target.nth !== undefined) locator = locator.nth(target.nth);
    for (let index = 0; index < (target.ancestor ?? 0); index += 1) {
      locator = locator.locator("xpath=..");
    }
    if ((await locator.count()) === 0) {
      if (target.optional) {
        Object.assign(record, {
          status: "skipped",
          reason: "locator did not resolve in this state",
        });
        runtime.screenshots.push(record);
        await persistCheckpoint();
        return;
      }
      throw new Error(
        `No element matched ${target.locator}${target.hasText ? ` with text ${target.hasText}` : ""}`,
      );
    }
    const file = resolve(
      outputRoot,
      "components",
      `${target.id}--${viewportName}--${colorScheme}.png`,
    );
    await mkdir(dirname(file), { recursive: true });
    await locator
      .first()
      .screenshot({ path: file, animations: "allow", caret: "hide" });
    Object.assign(record, { status: "captured", file: relativeOutput(file) });
  } catch (error) {
    Object.assign(record, { status: "failed", error: formatError(error) });
  }
  runtime.screenshots.push(record);
  await persistCheckpoint();
}

async function visitStable(page, pathname, expectedStatus = 200) {
  await page.mouse.move(0, 0);
  if (
    pathname.includes("commentFixture=user") ||
    pathname.includes("commentFixture=admin")
  ) {
    const session = fixtureSession(
      pathname.includes("commentFixture=admin") ? "admin" : "user",
    );
    await page.context().addInitScript((fixture) => {
      if (
        location.search.includes("commentFixture=user") ||
        location.search.includes("commentFixture=admin")
      ) {
        localStorage.setItem(
          "yfi-session",
          JSON.stringify({ data: fixture, time: Date.now() }),
        );
      }
    }, session);
  }
  if (page.url().startsWith(baseURL)) {
    await page.evaluate(() => localStorage.clear());
  }
  const response = await page.goto(new URL(pathname, baseURL).toString(), {
    waitUntil: pathname.includes("ghFixture=loading")
      ? "domcontentloaded"
      : "networkidle",
    timeout: 30_000,
  });
  if (response?.status() !== expectedStatus) {
    throw new Error(
      `HTTP ${response?.status() ?? "unknown"} for ${pathname}; expected ${expectedStatus}`,
    );
  }
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
}

async function runAction(page, action) {
  if (!action) return;
  if (action.startsWith("comment-") || action === "wait-comments") {
    const commentIsland = page.locator(
      "astro-island[component-export='Comment']",
    );
    await commentIsland
      .locator("xpath=ancestor::section[1]")
      .scrollIntoViewIfNeeded();
    await commentIsland
      .locator("textarea, button")
      .first()
      .waitFor({ state: "attached" });
  }
  if (action === "scroll-article") {
    await page.evaluate(() => window.scrollTo(0, 520));
    await page.waitForTimeout(700);
  } else if (action === "open-drawer") {
    await page.evaluate(() => window.scrollTo(0, 520));
    await page.locator("header button").first().click();
    await page.getByText("前往……", { exact: true }).waitFor();
  } else if (action === "open-toc") {
    await page.locator("#article-container button").first().click();
    await page.locator("[data-slot='popover-popup']").waitFor();
  } else if (action === "date-popover") {
    await page.getByText("2024-03-03", { exact: true }).first().hover();
    await page
      .getByText("于 2024-03-01 08:15 开始写作", { exact: true })
      .waitFor();
  } else if (action === "wait-comments") {
    await page.getByText("Fixture Reader", { exact: true }).waitFor();
  } else if (action === "comment-visitor") {
    await page.getByText("使用社交账号登录", { exact: true }).waitFor();
    await page.getByRole("button", { name: "以游客身份留言" }).click();
    await page.locator("textarea").first().waitFor();
  } else if (action === "comment-dialog") {
    await page.getByText("使用社交账号登录", { exact: true }).waitFor();
    const loginBox = page
      .getByText("使用社交账号登录", { exact: true })
      .locator("xpath=..");
    await loginBox.locator("button").nth(1).click();
    await page.locator("[data-slot='dialog-content']").waitFor();
  } else if (action === "comment-dropdown") {
    await page.getByText("Fixture Reader", { exact: true }).waitFor();
    await page.getByLabel("更多评论操作").first().click();
    await page.locator("[data-slot='dropdown-menu-content']").waitFor();
  } else if (action === "comment-reply") {
    await page.getByText("Fixture Reader", { exact: true }).waitFor();
    await page.getByRole("button", { name: "回复" }).first().click();
    await page.getByRole("button", { name: "以游客身份留言" }).last().click();
    await page.locator("textarea[placeholder^='回复']").waitFor();
  } else if (action === "comment-reaction-picker") {
    await page.getByText("Fixture Reader", { exact: true }).waitFor();
    await page.getByLabel("添加表情").first().click();
    await page.getByLabel("thumbs up").waitFor();
  } else if (action === "comment-user") {
    await page.locator("img[alt='Fixture User']").waitFor();
  } else if (action === "comment-error") {
    await page.getByText(/加载评论失败/).waitFor();
  } else if (action === "comment-edit") {
    await openCommentAction(page, "编辑");
    await page.locator("#comment-101 textarea").waitFor();
  } else if (action === "comment-delete") {
    await openCommentAction(page, "删除");
    const fixture = new URL(page.url()).searchParams.get("commentFixture");
    if (fixture?.endsWith("-error"))
      await page.locator("[data-sonner-toast]").waitFor();
    else await page.getByText("暂无留言", { exact: true }).waitFor();
  } else if (action === "comment-update") {
    await openCommentAction(page, "编辑");
    const textarea = page.locator("#comment-101 textarea");
    await textarea.fill("Fixture edited comment");
    await page.getByRole("button", { name: "保存评论" }).click();
    const fixture = new URL(page.url()).searchParams.get("commentFixture");
    if (fixture?.endsWith("-error"))
      await page.locator("[data-sonner-toast]").waitFor();
    else
      await page.getByText("Fixture edited comment", { exact: true }).waitFor();
  } else if (action === "comment-reaction") {
    await page.getByText("Fixture Reader", { exact: true }).waitFor();
    await page.getByLabel("添加表情").first().click();
    await page.getByLabel("thumbs down").click();
    const fixture = new URL(page.url()).searchParams.get("commentFixture");
    if (fixture?.endsWith("-error"))
      await page.locator("[data-sonner-toast]").waitFor();
    else
      await page.locator("button[aria-pressed]", { hasText: "👎" }).waitFor();
  } else if (action === "github-loading") {
    const loadingCard = page.locator(
      "[data-article-embedded-element='github-repo'] a",
    );
    await loadingCard.waitFor();
    await loadingCard.locator("div").first().waitFor();
    if (
      await loadingCard
        .getByText("facebook/stylex", { exact: true })
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error(
        "GitHub loading fixture resolved before the skeleton screenshot",
      );
    }
    const skeletonShapes = await loadingCard.locator("div").count();
    if (skeletonShapes < 5 || (await loadingCard.boundingBox())?.height === 0) {
      throw new Error(
        "GitHub loading fixture did not render the skeleton geometry",
      );
    }
  } else if (action === "github-rate-limit") {
    await page.getByText("Rate limited by Github", { exact: false }).waitFor();
  } else if (action === "github-error") {
    await page
      .getByText("Could not load repository data for: facebook/stylex.", {
        exact: false,
      })
      .waitFor();
  } else if (action === "copy-code-success" || action === "copy-code-error") {
    await mockClipboard(page, action.endsWith("success"));
    const pre = page.locator("#article-content pre").first();
    await pre.locator("button").click();
    await page.mouse.move(0, 0);
    const stateIcon = action.endsWith("success")
      ? "svg.lucide-check"
      : "svg.lucide-x";
    await pre.locator(stateIcon).waitFor();
    await page.waitForTimeout(100);
  } else if (action === "copy-email-success" || action === "copy-email-error") {
    await mockClipboard(page, action.endsWith("success"));
    await page.locator(".copy-email").click();
    await page.locator("[data-sonner-toast]").waitFor();
  } else if (action === "subscribe-pending") {
    await page.getByRole("button", { name: "取消订阅" }).click();
    await page.getByText("取消订阅中...", { exact: true }).waitFor();
  } else if (action === "subscribe-click") {
    await page.getByRole("button", { name: "取消订阅" }).click();
    await page.waitForTimeout(100);
  } else if (action === "resubscribe-click") {
    await page.getByRole("button", { name: "取消订阅" }).click();
    await page.getByRole("button", { name: "重新订阅" }).click();
    await page.waitForTimeout(100);
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
  await page.waitForTimeout(100);
}

async function openCommentAction(page, label) {
  await page.getByText("Fixture Reader", { exact: true }).waitFor();
  await page.getByLabel("更多评论操作").first().click();
  await page.getByRole("menuitem", { name: label }).click();
}

async function mockClipboard(page, succeeds) {
  await page.evaluate((shouldSucceed) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          shouldSucceed
            ? Promise.resolve()
            : Promise.reject(new Error("Fixture clipboard error")),
      },
    });
  }, succeeds);
}

async function assertActionState(page, action) {
  if (action !== "copy-code-success" && action !== "copy-code-error") return;
  const pre = page.locator("#article-content pre").first();
  const stateIcon = action.endsWith("success")
    ? "svg.lucide-check"
    : "svg.lucide-x";
  if (!(await pre.locator(stateIcon).isVisible())) {
    throw new Error(
      `Copy button left the expected ${action.endsWith("success") ? "success" : "error"} state before screenshot`,
    );
  }
}

async function settleVisualState(page) {
  await page.evaluate(() => document.fonts.ready);
  const hasHydratedComments =
    (await page
      .locator(
        "#comment-101, astro-island[component-export='Comment'] textarea",
      )
      .count()) > 0;
  // AutoResizeHeight is driven by Motion and can briefly report the same outer
  // section size before its child/list positions continue moving. Always cross
  // the component's 0.6s animation window before considering it settled.
  await page.waitForTimeout(hasHydratedComments ? 2500 : 300);
  let previous = "";
  let stableFrames = 0;
  const requiredStableFrames = hasHydratedComments ? 10 : 3;
  for (
    let attempt = 0;
    attempt < 40 && stableFrames < requiredStableFrames;
    attempt += 1
  ) {
    const geometry = await page.evaluate(() => {
      const island = document.querySelector(
        "astro-island[component-export='Comment']",
      );
      const comment = island?.closest("section")?.getBoundingClientRect();
      const countText = [...document.querySelectorAll("span")].find((node) =>
        /^共\d+条留言$/.test(node.textContent?.trim() ?? ""),
      );
      const count = countText?.getBoundingClientRect();
      const firstComment = document
        .querySelector("#comment-101")
        ?.getBoundingClientRect();
      const animatedHeights = island
        ? [...island.querySelectorAll("[style]")]
            .filter(
              (node) =>
                node.style.height ||
                node.style.minHeight ||
                node.style.maxHeight,
            )
            .map((node) => {
              const rect = node.getBoundingClientRect();
              return [
                node.style.height,
                node.style.minHeight,
                node.style.maxHeight,
                rect.x,
                rect.y,
                rect.width,
                rect.height,
              ];
            })
        : [];
      const visualTargets = new Set(
        document
          .getAnimations()
          .map((animation) => animation.effect?.target)
          .filter((target) => target instanceof Element),
      );
      for (const node of island?.querySelectorAll("[style]") ?? [])
        visualTargets.add(node);
      for (const overlay of document.querySelectorAll(
        "[data-slot='popover-popup'], [data-vaul-drawer]",
      )) {
        visualTargets.add(overlay);
        for (const node of overlay.querySelectorAll("[style]"))
          visualTargets.add(node);
      }
      const visualStyles = [...visualTargets].map((node) => {
        const computed = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return [
          node.tagName,
          node.id,
          computed.opacity,
          computed.transform,
          computed.filter,
          rect.x,
          rect.y,
          rect.width,
          rect.height,
        ];
      });
      return JSON.stringify({
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
        comment: comment
          ? [comment.x, comment.y, comment.width, comment.height]
          : null,
        count: count ? [count.x, count.y, count.width, count.height] : null,
        firstComment: firstComment
          ? [
              firstComment.x,
              firstComment.y,
              firstComment.width,
              firstComment.height,
            ]
          : null,
        animatedHeights,
        visualStyles,
      });
    });
    stableFrames = geometry === previous ? stableFrames + 1 : 0;
    previous = geometry;
    await page.waitForTimeout(100);
  }
  if (stableFrames < requiredStableFrames) {
    throw new Error(
      `Visual geometry did not stabilize after ${requiredStableFrames} consecutive samples`,
    );
  }
  return previous ? JSON.parse(previous) : null;
}

async function screenshotFullPage(page, file, useTallViewport) {
  if (!useTallViewport) {
    const stableFrames = await screenshotUntilStable(page, { fullPage: true });
    await writeFile(file, stableFrames.buffer);
    return { screenshotAttempts: stableFrames.attempts };
  }
  const originalViewport = page.viewportSize();
  if (!originalViewport)
    throw new Error("A fixed viewport is required for full-page capture");
  const originalGeometry = await readPageGeometry(page);
  const originalHeight = originalGeometry.documentHeight;
  const frozenViewportDeclarations = await freezeViewportUnitDeclarations(page);
  const frozenGeometry = await readPageGeometry(page);
  if (JSON.stringify(frozenGeometry) !== JSON.stringify(originalGeometry)) {
    throw new Error(
      "Freezing viewport-unit declarations changed the original viewport geometry",
    );
  }
  await page.setViewportSize({
    width: originalViewport.width,
    height: originalHeight,
  });
  await settleVisualState(page);
  const finalGeometry = await readPageGeometry(page);
  const finalHeight = finalGeometry.documentHeight;
  const finalViewport = page.viewportSize();
  if (
    !finalViewport ||
    JSON.stringify(finalGeometry) !== JSON.stringify(originalGeometry) ||
    finalViewport.height !== originalHeight
  ) {
    throw new Error(
      `Tall viewport changed document geometry: original=${originalHeight}, viewport=${finalViewport?.height ?? "unknown"}, document=${finalHeight}`,
    );
  }
  const stableFrames = await screenshotUntilStable(page, { fullPage: false });
  await writeFile(file, stableFrames.buffer);
  await page.setViewportSize(originalViewport);
  return {
    originalGeometry,
    frozenGeometry,
    finalGeometry,
    viewportHeight: finalViewport.height,
    frozenViewportDeclarations,
    screenshotAttempts: stableFrames.attempts,
  };
}

async function screenshotUntilStable(page, { fullPage }) {
  let previous;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const current = await page.screenshot({
      fullPage,
      animations: "allow",
      caret: "hide",
    });
    if (previous?.equals(current))
      return { buffer: current, attempts: attempt };
    previous = current;
    await page.waitForTimeout(100);
  }
  throw new Error(
    "Native screenshot pixels did not stabilize in five consecutive captures",
  );
}

async function readPageGeometry(page) {
  return page.evaluate(() => {
    const comment = document
      .querySelector("astro-island[component-export='Comment']")
      ?.closest("section")
      ?.getBoundingClientRect();
    const copyEmail = document.querySelector(".copy-email");
    let footerRoot = copyEmail?.parentElement ?? null;
    while (footerRoot && !footerRoot.querySelector("img[alt='logo']"))
      footerRoot = footerRoot.parentElement;
    if (!footerRoot)
      throw new Error(
        "Could not resolve the footer root for full-page geometry",
      );
    const footer = footerRoot.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      comment: comment
        ? [comment.x, comment.y, comment.width, comment.height]
        : null,
      footer: [footer.x, footer.y, footer.width, footer.height],
    };
  });
}

async function freezeViewportUnitDeclarations(page) {
  return page.evaluate(() => {
    const viewportUnit = /(?:^|[^a-z])(dvh|svh|lvh|vh)(?:$|[^a-z])/i;
    const declarations = [];
    const visitRules = (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule && rule.selectorText) {
          const properties = [...rule.style].filter((property) =>
            viewportUnit.test(rule.style.getPropertyValue(property)),
          );
          if (properties.length)
            declarations.push([rule.selectorText, properties]);
        } else if ("cssRules" in rule) {
          try {
            visitRules(rule.cssRules);
          } catch {}
        }
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        visitRules(sheet.cssRules);
      } catch {}
    }
    let frozen = 0;
    for (const [selector, properties] of declarations) {
      let nodes;
      try {
        nodes = document.querySelectorAll(selector);
      } catch {
        continue;
      }
      for (const node of nodes) {
        const computed = getComputedStyle(node);
        for (const property of properties) {
          node.style.setProperty(
            property,
            computed.getPropertyValue(property),
            "important",
          );
          frozen += 1;
        }
      }
    }
    return frozen;
  });
}

async function installNetworkFixtures(context, origin) {
  const fixtureState = new Map();
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      options.debug &&
      (url.pathname.startsWith("/api/") || url.pathname.startsWith("/__stylex"))
    ) {
      console.log(`[request] ${route.request().method()} ${url.pathname}`);
    }
    if (url.hostname === "api.github.com") {
      let frameURL;
      try {
        frameURL = new URL(route.request().frame().url());
      } catch {
        frameURL = new URL(origin);
      }
      const ghFixture = frameURL.searchParams.get("ghFixture");
      if (ghFixture === "loading") {
        await holdUntilNavigation(route);
        return;
      } else if (ghFixture === "rate-limit") {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ message: "API rate limit exceeded" }),
        });
        return;
      } else if (ghFixture === "error") {
        await route.fulfill({
          status: 500,
          contentType: "text/plain",
          body: "Fixture GitHub error",
        });
        return;
      }
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
    const isLocalFixtureHost =
      url.hostname === "127.0.0.1" || url.hostname === "localhost";
    if (
      isLocalFixtureHost &&
      (url.pathname.startsWith("/__stylex_fixture_api") ||
        url.pathname.startsWith("/api/"))
    ) {
      let frameURL;
      try {
        frameURL = new URL(route.request().frame().url());
      } catch {
        frameURL = new URL(origin);
      }
      const commentFixture = frameURL.searchParams.get("commentFixture");
      const subscribeFixture = frameURL.searchParams.get("subscribeFixture");
      const stateKey = frameURL.toString();
      const state = fixtureState.get(stateKey) ?? {
        deleted: false,
        updated: false,
        reacted: false,
      };
      fixtureState.set(stateKey, state);
      if (url.pathname.includes("comments/get") && commentFixture === "error") {
        await route.fulfill({
          status: 500,
          contentType: "text/plain",
          body: "Fixture comment error",
        });
        return;
      }
      if (
        url.pathname.includes("notification/unsubscribe") ||
        url.pathname.includes("notification/resubscribe")
      ) {
        if (subscribeFixture === "pending") {
          await holdUntilNavigation(route);
          return;
        }
        const payload =
          subscribeFixture === "error"
            ? { success: false, cause: "Fixture unsubscribe error" }
            : { success: true };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(payload),
        });
        return;
      }
      if (
        (commentFixture?.endsWith("-error") ||
          commentFixture?.endsWith("-success")) &&
        (url.pathname.includes("comments/delete") ||
          url.pathname.includes("comments/update") ||
          url.pathname.includes("/reaction/"))
      ) {
        if (commentFixture.endsWith("-error")) {
          await route.fulfill({
            status: 500,
            contentType: "text/plain",
            body: "Fixture mutation error",
          });
          return;
        }
        if (url.pathname.includes("comments/delete")) {
          state.deleted = true;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ deletedIds: [101, 102] }),
          });
          return;
        }
        if (url.pathname.includes("comments/update")) {
          state.updated = true;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: fixtureParent({ updated: true }) }),
          });
          return;
        }
        state.reacted = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 9,
            emojiKey: "👎",
            emojiRaw: "👎",
            user: {
              type: "user",
              id: "fixture-user",
              name: "Fixture User",
              image: fixtureAvatar("7c3aed"),
            },
          }),
        });
        return;
      }
      const payload = url.pathname.includes("get-session")
        ? commentFixture === "user"
          ? fixtureSession()
          : commentFixture === "admin"
            ? fixtureSession("admin")
            : null
        : url.pathname.includes("list-accounts")
          ? []
          : url.pathname.includes("comments/get")
            ? state.deleted
              ? { total: 0, cursor: 101, hasMore: false, comments: [] }
              : fixtureComments({
                  pagination: commentFixture === "pagination",
                  updated: state.updated,
                  reacted: state.reacted,
                  spam: commentFixture === "admin",
                })
            : { success: true, data: [] };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
      return;
    }
    if (url.origin !== new URL(origin).origin) {
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
}

async function startServer() {
  const buildDir = options.buildDir
    ? resolve(repoRoot, options.buildDir)
    : resolve(repoRoot, options.output, `.build-${options.mode}`);
  const env = {
    ...process.env,
    ARTICLE_PAT: "unused-local-fixture",
    POST_GH_INFO: pathToFileURL(resolve(fixtureDir, "posts")).href,
    PAGE_GH_INFO: pathToFileURL(resolve(fixtureDir, "pages")).href,
    IMAGE_META_SOURCE: pathToFileURL(resolve(fixtureDir, "image-metadata.json"))
      .href,
    WALINE_URL: `${baseURL}/__stylex_fixture_api/`,
    TZ: "Asia/Shanghai",
  };
  let tail = "";
  const remember = (chunk) => {
    tail = (tail + chunk.toString()).slice(-8000);
  };
  if (!options.buildDir) {
    const build = spawn(
      "pnpm",
      ["exec", "astro", "build", "--force", "--outDir", buildDir],
      { cwd: appDir, env, stdio: ["ignore", "pipe", "pipe"] },
    );
    build.stdout.on("data", remember);
    build.stderr.on("data", remember);
    const buildExit = await new Promise((resolveExit) =>
      build.once("exit", resolveExit),
    );
    if (buildExit !== 0)
      throw new Error(`Astro fixture build exited with ${buildExit}:\n${tail}`);
  }

  const httpServer = createServer(async (request, response) => {
    try {
      const requestURL = new URL(request.url ?? "/", baseURL);
      const pathname = decodeURIComponent(requestURL.pathname);
      const relativePath = pathname.replace(/^\/+/, "");
      let filePath = resolve(buildDir, relativePath || "index.html");
      if (
        !filePath.startsWith(`${buildDir}/`) &&
        filePath !== resolve(buildDir, "index.html")
      ) {
        response.writeHead(403).end();
        return;
      }
      if (!filePath.match(/\.[a-zA-Z0-9]+$/))
        filePath = resolve(filePath, "index.html");
      let body;
      try {
        body = await readFile(filePath);
      } catch {
        filePath = resolve(buildDir, "404.html");
        body = await readFile(filePath);
        response.statusCode = 404;
      }
      response.setHeader("Content-Type", contentType(filePath));
      response.setHeader("Cache-Control", "no-store");
      response.end(body);
    } catch (error) {
      response
        .writeHead(500, { "Content-Type": "text/plain" })
        .end(formatError(error));
    }
  });
  await new Promise((resolveListen, rejectListen) => {
    httpServer.once("error", rejectListen);
    httpServer.listen(options.port, "127.0.0.1", resolveListen);
  });
  return {
    close: () =>
      new Promise((resolveClose, rejectClose) => {
        httpServer.close((error) =>
          error ? rejectClose(error) : resolveClose(),
        );
      }),
  };
}

function contentType(path) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js") || path.endsWith(".mjs"))
    return "text/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".woff2")) return "font/woff2";
  if (path.endsWith(".ttf")) return "font/ttf";
  return "application/octet-stream";
}

async function holdUntilNavigation(route) {
  const request = route.request();
  let page;
  try {
    page = request.frame().page();
  } catch {
    return;
  }
  await new Promise((resolvePending) => {
    const finish = () => {
      page.off("request", onRequest);
      page.off("close", finish);
      resolvePending();
    };
    const onRequest = (nextRequest) => {
      if (nextRequest !== request && nextRequest.isNavigationRequest())
        finish();
    };
    page.on("request", onRequest);
    page.once("close", finish);
  });
  await route.abort("aborted").catch(() => {});
}

async function shouldResume(scope, target, viewport, colorScheme) {
  if (!options.resume) return false;
  const shot = runtime.screenshots.find(
    (entry) =>
      entry.scope === scope &&
      entry.id === target.id &&
      entry.viewport === viewport &&
      entry.colorScheme === colorScheme &&
      entry.status === "captured",
  );
  if (!shot?.file) return false;
  try {
    await access(resolve(outputRoot, shot.file));
    return true;
  } catch {
    return false;
  }
}

async function persistCheckpoint() {
  await writeFile(
    resolve(outputRoot, "capture-report.json"),
    JSON.stringify(runtime, null, 2) + "\n",
  );
}

async function writeMarkdownReport(jsonPath) {
  const coverage = JSON.parse(
    await readFile(resolve(scriptDir, "coverage.json"), "utf8"),
  );
  const lines = [
    `# StyleX visual capture: ${options.mode}`,
    "",
    `Base URL: \`${baseURL}\``,
    "",
    "| Scope | Target | Viewport | Theme | Status |",
    "| --- | --- | --- | --- | --- |",
    ...runtime.screenshots.map(
      (shot) =>
        `| ${shot.scope} | ${shot.id} | ${shot.viewport} | ${shot.colorScheme} | ${shot.status}${shot.error ? `: ${shot.error.replaceAll("|", "\\|")}` : ""} |`,
    ),
    "",
    "## Known partial coverage",
    "",
    ...coverage.partial.map(
      (item) => `- **${item.component}**: missing ${item.missing.join(", ")}.`,
    ),
    "",
  ];
  await writeFile(jsonPath.replace(/\.json$/, ".md"), lines.join("\n"));
}

function parseArgs(args) {
  const parsed = {
    port: 4179,
    output: "artifacts.local/stylex",
    scope: "all",
    append: false,
    clock: "native-date",
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--mode") parsed.mode = args[++index];
    else if (arg === "--base-url") parsed.baseUrl = args[++index];
    else if (arg === "--port") parsed.port = Number(args[++index]);
    else if (arg === "--output") parsed.output = args[++index];
    else if (arg === "--scope") parsed.scope = args[++index];
    else if (arg === "--target") parsed.target = args[++index];
    else if (arg === "--append") parsed.append = true;
    else if (arg === "--resume") parsed.resume = true;
    else if (arg === "--resume-since") parsed.resumeSince = args[++index];
    else if (arg === "--build-dir") parsed.buildDir = args[++index];
    else if (arg === "--debug") parsed.debug = true;
    else if (arg === "--viewport") parsed.viewport = args[++index];
    else if (arg === "--theme") parsed.theme = args[++index];
    else if (arg === "--clock") parsed.clock = args[++index];
    else fail(`Unknown argument: ${arg}`);
  }
  if (!["all", "app", "components"].includes(parsed.scope))
    fail("--scope must be all, app, or components");
  if (!["native-date", "playwright"].includes(parsed.clock))
    fail("--clock must be native-date or playwright");
  return parsed;
}

function matchesTarget(id) {
  if (!options.target) return true;
  return options.target
    .split(",")
    .some(
      (target) =>
        target === id ||
        (target.endsWith("*") && id.startsWith(target.slice(0, -1))),
    );
}

function willCapture(shot) {
  if (!matchesTarget(shot.id)) return false;
  if (options.viewport && options.viewport !== shot.viewport) return false;
  if (options.theme && options.theme !== shot.colorScheme) return false;
  if (options.scope === "app" && shot.scope !== "app") return false;
  if (options.scope === "components" && shot.scope !== "component")
    return false;
  return true;
}

async function recoverExistingShots(records) {
  const byKey = new Map(
    records.map((shot) => [
      `${shot.scope}/${shot.id}/${shot.viewport}/${shot.colorScheme}`,
      shot,
    ]),
  );
  const definitions = [
    ...appPages.map((target) => ({ scope: "app", target })),
    ...componentShots.map((target) => ({ scope: "component", target })),
  ];
  for (const { scope, target } of definitions) {
    for (const viewport of Object.keys(viewports)) {
      if (target.viewport && target.viewport !== viewport) continue;
      for (const colorScheme of colorSchemes) {
        const key = `${scope}/${target.id}/${viewport}/${colorScheme}`;
        const relative = `${scope === "app" ? "app" : "components"}/${target.id}--${viewport}--${colorScheme}.png`;
        try {
          await access(resolve(outputRoot, relative));
          if (!byKey.has(key) || byKey.get(key).status !== "captured") {
            byKey.set(key, {
              scope,
              id: target.id,
              path: target.path,
              viewport,
              colorScheme,
              clockMode: "unknown",
              status: "captured",
              file: relative,
            });
          }
        } catch {}
      }
    }
  }
  return [...byKey.values()];
}

async function filterShotsSince(records, resumeSince) {
  const threshold = new Date(resumeSince).getTime();
  if (!Number.isFinite(threshold))
    fail(`Invalid --resume-since timestamp: ${resumeSince}`);
  const kept = [];
  for (const shot of records) {
    if (!shot.file || shot.status !== "captured") continue;
    try {
      if ((await stat(resolve(outputRoot, shot.file))).mtimeMs >= threshold)
        kept.push(shot);
    } catch {}
  }
  return kept;
}

function fixtureSession(role = "user") {
  return {
    user: {
      id: "fixture-user",
      name: "Fixture User",
      email: "fixture@example.com",
      image: fixtureAvatar("7c3aed"),
      role,
    },
    session: {
      id: "fixture-session",
      userId: "fixture-user",
      token: "fixture",
      expiresAt: "2030-01-01T00:00:00.000Z",
    },
  };
}

function fixtureParent({ updated = false, spam = false } = {}) {
  const base = {
    content: updated
      ? "<p>Fixture edited comment</p>"
      : "<p>迁移后的评论排版应当与基线完全一致。</p>",
    rawContent: updated
      ? "Fixture edited comment"
      : "迁移后的评论排版应当与基线完全一致。",
    parentId: null,
    replyToId: null,
    path: "/post/stylex-migration",
    createdAt: "2026-09-18T08:00:00.000Z",
    updatedAt: "2026-09-18T08:00:00.000Z",
    anonymousName: null,
    userId: null,
    userIp: null,
    userAgent: null,
    userName: null,
    userEmail: null,
    visitorEmail: "reader@example.com",
    isSpam: spam,
  };
  return {
    ...base,
    id: 101,
    displayName: "Fixture Reader",
    visitorName: "Fixture Reader",
    userImage: fixtureAvatar("7c3aed"),
    ownedByViewer: true,
    reactions: [
      {
        id: 1,
        emojiKey: "👍",
        emojiRaw: "👍",
        user: { type: "guest", key: "fixture-owner" },
      },
      {
        id: 2,
        emojiKey: "🎉",
        emojiRaw: "🎉",
        user: {
          type: "user",
          id: "another",
          name: "Another",
          image: fixtureAvatar("db2777"),
        },
      },
    ],
  };
}

function fixtureComments({
  pagination = false,
  updated = false,
  reacted = false,
  spam = false,
} = {}) {
  const parent = fixtureParent({ updated, spam });
  if (reacted) {
    parent.reactions.push({
      id: 9,
      emojiKey: "👎",
      emojiRaw: "👎",
      user: {
        type: "user",
        id: "fixture-user",
        name: "Fixture User",
        image: fixtureAvatar("7c3aed"),
      },
    });
  }
  const child = {
    ...parent,
    id: 102,
    content: "<p>这是用于缩进和回复链接的子评论。</p>",
    rawContent: "这是用于缩进和回复链接的子评论。",
    parentId: 101,
    replyToId: 101,
    displayName: "Fixture Reply",
    visitorName: "Fixture Reply",
    userImage: fixtureAvatar("0891b2"),
    ownedByViewer: false,
    reactions: [],
  };
  return {
    total: pagination ? 12 : 1,
    cursor: 101,
    hasMore: pagination,
    comments: [
      {
        data: parent,
        children: {
          data: [child],
          hasMore: pagination,
          cursor: 102,
          total: pagination ? 12 : 1,
        },
      },
    ],
  };
}

function fixtureAvatar(color) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' rx='18' fill='%23${color}'/%3E%3C/svg%3E`;
}

function makeRecord(scope, target, viewport, colorScheme) {
  return {
    scope,
    id: target.id,
    path: target.path,
    viewport,
    colorScheme,
    clockMode: options.clock,
    status: "pending",
  };
}

function relativeOutput(file) {
  return file.slice(outputRoot.length + 1);
}

function formatError(error) {
  return error instanceof Error ? error.message.split("\n")[0] : String(error);
}

function fail(message) {
  console.error(message);
  process.exit(2);
}
