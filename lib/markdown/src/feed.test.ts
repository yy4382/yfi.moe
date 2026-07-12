import { describe, expect, it } from "vitest";
import { renderFeed } from "./feed.js";

describe("Feed mode", () => {
  it("renders embedded elements as static fallbacks and retains the warning", async () => {
    const html = await renderFeed(
      '::github-repo{user="yy4382" repo="yfi.moe"}',
    );

    expect(html).toContain(
      "在 RSS 阅读器中，一些组件可能无法正常显示。在浏览器中打开以获得更好的阅读体验。",
    );
    expect(html).toContain(
      '<a href="https://github.com/yy4382/yfi.moe">yy4382/yfi.moe</a>',
    );
    expect(html).not.toContain("::github-repo");
  });

  it("renders raw embedded elements using the same static fallbacks", async () => {
    const html = await renderFeed(`
<copy-button></copy-button>
<github-repo user="yy4382" repo="yfi.moe"></github-repo>
`);

    expect(html).toContain(
      '<a href="https://github.com/yy4382/yfi.moe">yy4382/yfi.moe</a>',
    );
    expect(html).not.toContain("copy-button");
    expect(html).not.toContain("github-repo");
  });

  it("fails on malformed raw embedded elements", async () => {
    await expect(
      renderFeed('<github-repo user="yy4382"></github-repo>'),
    ).rejects.toThrow(
      "github-repo must have only string user and repo properties",
    );
    await expect(
      renderFeed('::github-repo{user="yy4382" repo="yfi.moe" extra="value"}'),
    ).rejects.toThrow(
      "github-repo must have only string user and repo properties",
    );
  });
});
