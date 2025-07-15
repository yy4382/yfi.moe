import { describe, it, expect } from "vitest";
import { markdownToHeadings } from "../parse";

describe("to headings", () => {
  it("should return headings", async () => {
    const headings = await markdownToHeadings(
      "# Hello\n\n## World\n\n### Hello\n\n~~abc~~",
    );
    expect(headings).toEqual([
      { depth: 1, slug: "hello", text: "Hello" },
      { depth: 2, slug: "world", text: "World" },
      { depth: 3, slug: "hello-1", text: "Hello" },
    ]);
  });
});
