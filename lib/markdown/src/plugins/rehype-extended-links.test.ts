import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { assert, describe, it } from "vitest";
import rehypeExtendedLinks from "./rehype-extended-links.js";
import type { Options } from "./rehype-extended-links.js";

describe("Package", () => {
  it("should expose the public api", () => {
    assert.isFunction(rehypeExtendedLinks);
  });
});

describe("Link type check", () => {
  // input: <a href="http://example.com">?</a>
  // expected: <a href="http://example.com" rel="nofollow">?</a>
  it("should not change a relative link", async () => {
    const input = `<a href="./example.html">relative</a>`;
    const result = await process(input, {});
    const output = `<a href="./example.html">relative</a>`;
    assert.equal(result, output);
  });

  it("should not change a fragment link", async () => {
    const input = '<a href="#example">fragment</a>';
    const expected = '<a href="#example">fragment</a>';
    const result = await process(input, {});
    assert.equal(result, expected);
  });
  it("should not change a search link", async () => {
    const input = `<a href="?search">search</a>`;
    const expected = '<a href="?search">search</a>';
    const result = await process(input, {});
    assert.equal(result, expected);
  });
  it("should not change a mailto link", async () => {
    const input = '<a href="mailto:a@b.com">mailto</a>';
    const expected = '<a href="mailto:a@b.com">mailto</a>';
    const result = await process(input, {});
    assert.equal(result, expected);
  });
  // input: <a href="//example.com">?</a>
  // expected: <a href="//example.com" rel="nofollow">?</a>
  it("should change a protocol-relative link", async () => {
    const input = `<a href="//example.com">?</a>`;
    const result = await process(input, {});
    const output = `<a href="//example.com" rel="nofollow">?</a>`;
    assert.equal(result, output);
  });
  it("should change a http link", async () => {
    const input = '<a href="http://example.com">http</a>';
    const expected = '<a href="http://example.com" rel="nofollow">http</a>';
    const result = await process(input, {});
    assert.equal(result, expected);
  });
  it("should change a https link", async () => {
    const input = '<a href="https://example.com">https</a>';
    const expected = '<a href="https://example.com" rel="nofollow">https</a>';
    const result = await process(input, {});
    assert.equal(result, expected);
  });
  it("should not change a www link", async () => {
    const input = '<a href="www.example.com">www</a>';
    const expected = '<a href="www.example.com">www</a>';
    const result = await process(input, {});
    assert.equal(result, expected);
  });
});
describe("Options check", () => {
  it("should wrap in span because content exist", async () => {
    const input = `<a href="//example.com">?</a>`;
    const options: Options = {
      content: {
        type: "element",
        tagName: "span",
        properties: {},
        children: [],
      },
    };
    const result = await process(input, options);
    const output = `<a href="//example.com" rel="nofollow">?<span></span></a>`;
    assert.equal(result, output);
  });

  it("should add preContent", async () => {
    const input = `<a href="//example.com">?</a>`;
    const options: Options = {
      preContent: {
        type: "element",
        tagName: "span",
        properties: { className: ["content"] },
        children: [{ type: "text", value: "content" }],
      },
    };
    const result = await process(input, options);
    const output = `<a href="//example.com" rel="nofollow"><span class="content">content</span>?</a>`;
    assert.equal(result, output);
  });
  it("should wrap in span if wrappedProperties contains", async () => {
    const input = `<a href="//example.com">?</a>`;
    const options: Options = {
      wrappedProperties: {
        className: ["link desc"],
      },
      preContent: {
        type: "element",
        tagName: "span",
        properties: {},
        children: [{ type: "text", value: "pre content" }],
      },
    };
    const result = await process(input, options);
    const output = `<a href="//example.com" rel="nofollow"><span>pre content</span><span class="link desc">?</span></a>`;
    assert.equal(result, output);
  });
});

describe("Dynamically generated tests", () => {
  const dynPreContentOptions: Options = {
    preContent(node) {
      const url = node.properties.href;
      if (!url) return undefined;
      const regex = /^(https?:\/\/)?(www\.)?github\.com\/.*/i;
      if (!regex.test(url as string)) return undefined;
      return {
        type: "element",
        tagName: "span",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "svg",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "use",
                properties: {
                  href: "#mdi--github",
                },
                children: [],
              },
            ],
          },
        ],
      };
    },
  };
  it("should add preContent to a link that matches the test function", async () => {
    const input = `<a href="https://github.com/abc">?</a>`;
    const result = await process(input, dynPreContentOptions);
    const output = `<a href="https://github.com/abc" rel="nofollow"><span><svg><use href="#mdi--github"></use></svg></span>?</a>`;
    assert.equal(result, output);
  });
  it("should not add preContent to a link that matches the test function", async () => {
    const input = `<a href="https://example.com">?</a>`;
    const result = await process(input, dynPreContentOptions);
    const output = `<a href="https://example.com" rel="nofollow">?</a>`;
    assert.equal(result, output);
  });

  it("should add rel to a link that matches the test function", async () => {
    const input = '<a href="http://example.com">http</a>';
    const options: Options = {
      test: (node) => {
        return node.properties.href === "http://example.com";
      },
    };
    const output = '<a href="http://example.com" rel="nofollow">http</a>';
    const result = await process(input, options);
    assert.equal(result, output);
  });

  it("should not add rel to a link that does not match the test function", async () => {
    const input = '<a href="http://example.com">http</a>';
    const options: Options = {
      test: (node) => {
        return node.properties.href === "http://foobar.com";
      },
    };
    const output = '<a href="http://example.com">http</a>';
    const result = await process(input, options);
    assert.equal(result, output);
  });
});

async function process(input: string, options: Options): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeExtendedLinks, options)
    .use(rehypeStringify)
    .process(input);
  return result.toString();
}
