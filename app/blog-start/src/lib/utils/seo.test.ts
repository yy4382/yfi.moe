import { describe, expect, it } from "vitest";
import { buildSeo } from "./seo";

describe("buildSeo", () => {
  it("uses the canonical URL as og:url", () => {
    const seo = buildSeo({
      title: "Faster Shiki init",
      canonical: "https://yfi.moe/post/faster-shiki-init",
    });

    expect(seo.meta).toContainEqual({
      property: "og:url",
      content: "https://yfi.moe/post/faster-shiki-init",
    });
    expect(seo.links).toContainEqual({
      rel: "canonical",
      href: "https://yfi.moe/post/faster-shiki-init",
    });
  });
});
