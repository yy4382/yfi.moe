import { describe, expect, it } from "vitest";
import { renderExcerpt } from "./excerpt.js";

describe("Excerpt mode", () => {
  it("renders caller-selected Markdown as formatted HTML", async () => {
    const html = await renderExcerpt(
      "Preview with **bold** and [a link](/post).",
    );

    expect(html).toBe(
      '<p>Preview with <strong>bold</strong> and <a href="/post">a link</a>.</p>',
    );
  });
});
