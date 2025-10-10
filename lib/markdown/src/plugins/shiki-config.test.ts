import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("shiki config", () => {
  let mod: typeof import("./shiki-config.js");

  beforeEach(async () => {
    vi.resetModules();
    mod = await import("./shiki-config.js");
  });

  const process = async (
    raw: string,
    shikiPreset: typeof mod.rehypeShikiPreset,
  ) => {
    const vfile = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(shikiPreset)
      .use(rehypeStringify)
      .process(raw);
    return String(vfile);
  };

  it("should work with 1 language", async () => {
    const raw = `
\`\`\`ts
console.log("Hello, world!");
\`\`\`
     `;
    const result = await process(raw, mod.rehypeShikiPreset);
    expect(result).toMatchSnapshot();
  });

  it("should work with 2 languages", async () => {
    const raw = `
\`\`\`ts
console.log("Hello, world!");
\`\`\`

\`\`\`python
print("Hello, world!");
\`\`\`
    `;
    const result = await process(raw, mod.rehypeShikiPreset);
    expect(result).toMatchSnapshot();
  });
  it("should work with 2 file with different languages", async () => {
    const raw1 = `
\`\`\`ts
console.log("Hello, world!");
\`\`\`
    `;
    const raw2 = `
\`\`\`python
print("Hello, world!");
\`\`\`
    `;
    const result1 = await process(raw1, mod.rehypeShikiPreset);
    expect(result1).toMatchSnapshot();
    const result2 = await process(raw2, mod.rehypeShikiPreset);
    expect(result2).toMatchSnapshot();
  });

  it("should not highlight inline code", async () => {
    const raw = `\`print("Hello, world!")\``;
    const result = await process(raw, mod.rehypeShikiPreset);
    expect(result).toMatchSnapshot();
  });
});
