import { describe, expect, it } from "vitest";
import { renderComment } from "./comment.js";

describe("Comment mode", () => {
  it("sanitizes reader-authored HTML", async () => {
    const html = await renderComment(`
<input name="abc" />

<div class="unsafe">Visible text</div>

<script>alert("unsafe")</script>

Normal content
`);

    expect(html).toBe("<p>Normal content</p>");
  });

  it("turns a single line break into a visible break", async () => {
    const html = await renderComment("line 1\nline 2\n\nline 4");

    expect(html).toBe("<p>line 1<br>\nline 2</p>\n<p>line 4</p>");
  });

  it("supports the existing GFM comment syntax", async () => {
    const html = await renderComment(`
- [ ] list 1 ~~delete~~
- [x] list 2[^1] www.autolink.com

[^1]: footnote
`);

    expect(html).toContain('<ul class="contains-task-list">');
    expect(html).toContain("<del>delete</del>");
    expect(html).toContain('<section data-footnotes class="footnotes">');
  });

  it("isolates external user-generated links", async () => {
    const html = await renderComment("[link](https://www.google.com)");

    expect(html).toBe(
      '<p><a href="https://www.google.com" rel="nofollow noopener noreferrer ugc" target="_blank">link</a></p>',
    );
  });
});
