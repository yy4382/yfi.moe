#!/usr/bin/env node
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stylexLayerOrder } from "../../stylex-layers.ts";

// Exercise real emitted CSS, including separately compiled comment rules.
// Run after build:frontend; no server, live data or application API is needed.
const build = resolve(process.argv[2] ?? "app/blog-astro/dist");
const html = await readFile(resolve(build, "index.html"), "utf8");
const prelude = `<style>${stylexLayerOrder}</style>`;
assert(html.includes(prelude), "SSR must emit the shared layer contract");
assert(html.indexOf(prelude) < html.indexOf('rel="stylesheet"'));
const hrefs = [...html.matchAll(/href="([^"]+\.css)"/g)].map(
  (match) => match[1],
);
assert(hrefs.length > 0, "Build must emit CSS assets");
const assets = await Promise.all(
  hrefs.map((href) => readFile(resolve(build, `.${href}`), "utf8")),
);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const css of [assets, [...assets].reverse()]) {
    await page.setContent(
      prelude + css.map((text) => `<style>${text}</style>`).join(""),
    );
    const result = await page.evaluate(() => {
      const rules = [];
      function visit(list, layer = "") {
        for (const rule of list) {
          if (rule instanceof CSSLayerBlockRule) {
            visit(rule.cssRules, layer ? `${layer}.${rule.name}` : rule.name);
          } else if (rule instanceof CSSStyleRule) {
            if (/^\.[\w-]+$/.test(rule.selectorText)) {
              rules.push({
                layer,
                selector: rule.selectorText,
                display: rule.style.display,
              });
            }
          }
        }
      }
      for (const sheet of document.styleSheets) visit(sheet.cssRules);
      const app = rules.find(
        (rule) => rule.layer.startsWith("app.") && rule.display === "block",
      );
      const comment = rules.find(
        (rule) =>
          rule.layer.startsWith("comment.") && rule.display === "inline-flex",
      );
      if (!app || !comment)
        throw new Error("Missing real app/comment atomic rules");

      // A late, high-specificity reset must lose to both component namespaces.
      const reset = document.createElement("style");
      reset.textContent =
        "@layer reset { #cascade-probe[data-check] { display: none; } }";
      document.head.append(reset);
      const probe = document.createElement("div");
      probe.id = "cascade-probe";
      probe.dataset.check = "";
      document.body.append(probe);
      const values = [];
      for (const selectors of [
        [comment.selector],
        [app.selector],
        [comment.selector, app.selector],
      ]) {
        probe.className = selectors
          .map((selector) => selector.slice(1))
          .join(" ");
        values.push(getComputedStyle(probe).display);
      }
      return values;
    });
    assert.deepEqual(result, ["inline-flex", "block", "block"]);
  }
  console.log(
    "Layer order verified: SSR prelude, both asset orders, late reset, app/comment precedence.",
  );
} finally {
  await browser.close();
}
