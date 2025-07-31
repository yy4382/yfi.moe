import { describe, it, expect } from "vitest";
import {
  remarkHeadingIds,
  type MarkdownHeading,
} from "./remark-heading-ids.js";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { VFile } from "vfile";
import type { Root } from "mdast";
import { removePosition } from "unist-util-remove-position";

async function run(content: string): Promise<[MarkdownHeading[], Root]> {
  const vfile = new VFile(content);
  const processor = unified().use(remarkParse).use(remarkHeadingIds);
  const tree = await processor.run(processor.parse(vfile), vfile);
  removePosition(tree);
  return [vfile.data.headings as MarkdownHeading[], tree];
}

describe("remarkHeadingIds", () => {
  it("should add ids to headings", async () => {
    const [headings, tree] = await run("## Hello");
    expect(headings).toMatchInlineSnapshot(`
      [
        {
          "depth": 2,
          "slug": "hello",
          "text": "Hello",
        },
      ]
    `);
    expect(tree).toMatchSnapshot();
  });
  it("should add custom ids", async () => {
    const [headings, tree] = await run("# Hello {#custom-id}");
    expect(headings).toMatchInlineSnapshot(`
      [
        {
          "depth": 1,
          "slug": "custom-id",
          "text": "Hello",
        },
      ]
    `);
    expect(tree).toMatchSnapshot();
  });
  it("should handle complicated custom ids", async () => {
    const [headings, tree] = await run("# Hello`id` {#custom-id}");
    expect(headings).toMatchInlineSnapshot(`
      [
        {
          "depth": 1,
          "slug": "custom-id",
          "text": "Helloid",
        },
      ]
    `);
    expect(tree).toMatchSnapshot();
  });
});
