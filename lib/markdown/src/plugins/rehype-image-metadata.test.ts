import { Element } from "hast";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import {
  rehypeImageMetadata,
  IMAGE_META_KEY,
} from "./rehype-image-metadata.js";

const SAMPLE_BLURHASH = "U8RW0b9F~q%M%MM{M{xu%Mj[Rjoft7M{ofof";

describe("rehypeImageMetadata", () => {
  it("adds image dimensions and blurhash placeholder", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeImageMetadata)
      .use(rehypeStringify);

    const file = new VFile("![Alt text](https://i.yfi.moe/test.webp)");
    file.data[IMAGE_META_KEY] = [
      {
        url: "https://i.yfi.moe/test.webp",
        width: 1440,
        height: 1080,
        blurhash: SAMPLE_BLURHASH,
      },
    ];

    const html = String(await processor.process(file));
    expect(html).toContain('width="1440"');
    expect(html).toContain('height="1080"');
    expect(html).toMatch(/background-image:/);
    expect(html).toContain('data-placeholder="blurhash"');
  });

  it("merges existing style with blurhash placeholder", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(() => (tree) => {
        visit(tree, "element", (node: Element) => {
          if (node.tagName === "img") {
            node.properties = {
              ...node.properties,
              style: "max-width:100%;",
            };
          }
        });
      })
      .use(rehypeImageMetadata)
      .use(rehypeStringify);

    const file = new VFile("![Alt](https://i.yfi.moe/image.webp)");
    file.data[IMAGE_META_KEY] = [
      {
        url: "https://i.yfi.moe/image.webp",
        width: 800,
        height: 600,
        blurhash: SAMPLE_BLURHASH,
      },
    ];

    const html = String(await processor.process(file));
    expect(html).toContain("max-width:100%;");
    expect(html).toMatch(/background-image:/);
  });
});
