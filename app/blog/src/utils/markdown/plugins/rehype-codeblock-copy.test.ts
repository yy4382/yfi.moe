import { describe, it, expect } from "vitest";
import { rehypeCodeblockCopy } from "./rehype-codeblock-copy";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "@shikijs/rehype";
import { rehypeHast } from "./rehype-hast";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";

describe("rehypeCodeblockCopy", () => {
  it("should add a copy button to code blocks", async () => {
    const md = `
# ABC

\`\`\`ts
console.log("Hello, world!");
\`\`\`
    `;
    const hast = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCodeblockCopy)
      .use(rehypeHast, {
        removePosition: true,
      })
      .process(md);
    expect(JSON.stringify(JSON.parse(String(hast)), null, 2)).toMatchSnapshot();
  });
  it("should not add button to non-code blocks", async () => {
    const md = `
# abc
a \`inline\` code block
`;
    const hast = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCodeblockCopy)
      .use(rehypeHast, {
        removePosition: true,
      })
      .process(md);
    expect(JSON.stringify(JSON.parse(String(hast)), null, 2)).toMatchSnapshot();
  });
  it("should work with shiki", async () => {
    const md = `
\`\`\`ts
console.log("Hello, world!");
// comment
\`\`\`
    `;
    const hast = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeRemoveComments)
      .use(rehypeShiki, {
        theme: "catppuccin-macchiato",
      })
      .use(rehypeCodeblockCopy)
      .use(rehypeHast, {
        removePosition: true,
      })
      .process(md);
    expect(JSON.stringify(JSON.parse(String(hast)), null, 2)).toMatchSnapshot();
  });
});
