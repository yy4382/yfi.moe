import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";
import { renderArticle } from "./article.js";

describe("Article mode", () => {
  it("returns HAST with an outline that matches rendered heading ids", async () => {
    const result = await renderArticle("# Hello\n\n## Hello");

    expect(result.outline).toEqual([
      { depth: 1, id: "hello", text: "Hello" },
      { depth: 2, id: "hello-1", text: "Hello" },
    ]);
    expect(result.hast).toMatchObject({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h1",
          properties: { id: "hello" },
        },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "h2",
          properties: { id: "hello-1" },
        },
      ],
    });
  });

  it("enriches images with destination-supplied metadata", async () => {
    const { hast } = await renderArticle("![alt](https://i.yfi.moe/a.png)", {
      imageMetadata: [
        {
          url: "https://i.yfi.moe/a.png",
          width: 800,
          height: 600,
          blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
        },
      ],
    });
    const images: unknown[] = [];
    visit(hast, "element", (node) => {
      if (node.tagName === "img") images.push(node.properties);
    });

    expect(images).toEqual([
      expect.objectContaining({
        src: "https://i.yfi.moe/cdn-cgi/image/f=auto,w=640,fit=scale-down/a.png",
        width: 800,
        height: 600,
        "data-placeholder": "blurhash",
      }),
    ]);
  });

  it("emits the closed catalog of article embedded elements", async () => {
    const { hast } = await renderArticle(
      [
        "```ts",
        'console.log("hello");',
        "```",
        "",
        '::github-repo{user="yy4382" repo="yfi.moe"}',
      ].join("\n"),
    );
    const embeddedElements: { tagName: string; properties: unknown }[] = [];
    visit(hast, "element", (node) => {
      if (node.tagName === "copy-button" || node.tagName === "github-repo") {
        embeddedElements.push({
          tagName: node.tagName,
          properties: node.properties,
        });
      }
    });

    expect(embeddedElements).toEqual([
      { tagName: "copy-button", properties: {} },
      {
        tagName: "github-repo",
        properties: { user: "yy4382", repo: "yfi.moe" },
      },
    ]);
  });

  it("fails on malformed recognized embedded elements", async () => {
    await expect(renderArticle('::github-repo{user="yy4382"}')).rejects.toThrow(
      "github-repo directive must have a repo and user",
    );
    await expect(
      renderArticle('<github-repo user="yy4382"></github-repo>'),
    ).rejects.toThrow(
      "github-repo must have only string user and repo properties",
    );
    await expect(
      renderArticle('<copy-button extra="value"></copy-button>'),
    ).rejects.toThrow("copy-button must not have properties");
    await expect(
      renderArticle(
        '::github-repo{user="yy4382" repo="yfi.moe" extra="value"}',
      ),
    ).rejects.toThrow(
      "github-repo must have only string user and repo properties",
    );
  });
});
