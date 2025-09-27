import rehypeShiki from "@shikijs/rehype";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, it, expect } from "vitest";
import { rehypeCodeblockCopy } from "./rehype-codeblock-copy.js";

describe("rehypeCodeblockCopy", () => {
  it("should add a copy button to code blocks", async () => {
    const md = `
# ABC

\`\`\`ts
console.log("Hello, world!");
\`\`\`
    `;
    const vfile = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCodeblockCopy)
      .use(rehypeStringify)
      .process(md);
    expect(String(vfile)).toMatchSnapshot();
  });
  it("should not add button to non-code blocks", async () => {
    const md = `
# abc
a \`inline\` code block
`;
    const vfile = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCodeblockCopy)
      .use(rehypeStringify)
      .process(md);
    expect(String(vfile)).toMatchSnapshot();
  });
  it("should work with shiki", async () => {
    const md = `
\`\`\`ts
console.log("Hello, world!");
// comment
\`\`\`
    `;
    const vfile = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeRemoveComments)
      .use(rehypeShiki, {
        theme: "catppuccin-macchiato",
      })
      .use(rehypeCodeblockCopy)
      .use(rehypeStringify)
      .process(md);
    expect(String(vfile)).toMatchSnapshot();
  });
});
