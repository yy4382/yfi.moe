import { describe, it, expect } from "vitest";
import {
  markdownToHeadings,
  markdownToHtml,
  markdownToHtmlAsync,
} from "../parse.js";
import { ArticlePreset, CommentPreset } from "../preset.js";

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

describe("comment", () => {
  async function test(comment: string) {
    return await markdownToHtml(comment, {
      stringifyAllowDangerous: false,
      preset: CommentPreset,
    });
  }
  it("should sanitize comment", async () => {
    const comment = `
<input name="abc" />

<div class="ttt">div测试</div>

<a href="test.yfi.moe">测试a</a>

<alert>abc</alert>

<script> alert("你好") </script>

Test normal content`;
    const sanitized = await test(comment);
    expect(sanitized).toMatchInlineSnapshot(`
      "<p>测试a</p>
      <p>abc</p>
      <p>Test normal content</p>"
    `);
  });
  it("should break with single line break", async () => {
    const comment = `
line 1
line 2

line 4
    `;
    const sanitized = await test(comment);
    expect(sanitized).toMatchInlineSnapshot(`
      "<p>line 1<br>
      line 2</p>
      <p>line 4</p>"
    `);
  });
  it("should gfm work: todo, autolink, strikethrough, footnote", async () => {
    const comment = `
- [ ] list 1 ~~delete~~
- [x] list 2[^1] www.autolink.com

[^1]: footnote
    `;
    const sanitized = await test(comment);
    expect(sanitized).toMatchInlineSnapshot(`
      "<ul class="contains-task-list">
      <li class="task-list-item"><input type="checkbox" disabled> list 1 <del>delete</del></li>
      <li class="task-list-item"><input type="checkbox" checked disabled> list 2<sup><a href="#user-content-fn-1" id="user-content-user-content-fnref-1" data-footnote-ref aria-describedby="user-content-footnote-label">1</a></sup> <a href="http://www.autolink.com" rel="nofollow noopener noreferrer ugc" target="_blank">www.autolink.com</a></li>
      </ul>
      <section data-footnotes class="footnotes"><h2 class="sr-only" id="user-content-footnote-label">Footnotes</h2>
      <ol>
      <li id="user-content-user-content-fn-1">
      <p>footnote <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>
      </li>
      </ol>
      </section>"
    `);
  });
  it("should gfm work: table", async () => {
    const comment = `
|cell 1|cell 2|
|---|---|
|cell 3|cell 4|
    `;
    const sanitized = await test(comment);
    expect(sanitized).toMatchInlineSnapshot(`
      "<table>
      <thead>
      <tr>
      <th>cell 1</th>
      <th>cell 2</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td>cell 3</td>
      <td>cell 4</td>
      </tr>
      </tbody>
      </table>"
    `);
  });
  it("should add props to external links", async () => {
    const comment = `
[link](https://www.google.com)
www.autolink.com
    `;
    const sanitized = await test(comment);
    expect(sanitized).toMatchInlineSnapshot(`
      "<p><a href="https://www.google.com" rel="nofollow noopener noreferrer ugc" target="_blank">link</a><br>
      <a href="http://www.autolink.com" rel="nofollow noopener noreferrer ugc" target="_blank">www.autolink.com</a></p>"
    `);
  });
});

describe("code highlight", () => {
  it("should highlight code", async () => {
    const comment = `
\`\`\`ts
console.log("Hello, world!");
\`\`\`
    `;
    const html = await markdownToHtmlAsync(comment, { preset: ArticlePreset });
    expect(html).toMatchInlineSnapshot(
      `"<pre class="shiki catppuccin-macchiato copy-code-pre" style="background-color:#24273a;color:#cad3f5" tabindex="0"><code><span class="line"><span style="color:#CAD3F5">console</span><span style="color:#8BD5CA">.</span><span style="color:#8AADF4;font-style:italic">log</span><span style="color:#CAD3F5">(</span><span style="color:#A6DA95">"Hello, world!"</span><span style="color:#CAD3F5">)</span><span style="color:#939AB7">;</span></span></code><copy-button></copy-button></pre>"`,
    );
  });
});
