import type { LoaderContext } from "astro/loaders";
import { fs, vol } from "memfs";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { LocalFetcher, parseLocalUrl, localLoader } from "../local";

// Mock fs/promises to use memfs
vi.mock("node:fs/promises", () => ({
  default: fs.promises,
}));

// Test data constants
const TEST_CONTENT = {
  post1: `---
slug: hello-world
title: Hello World
date: 2024-01-01
---

Hello world content`,
  post2: `---
slug: second-post
title: Second Post
date: 2024-02-01
---

Second post content`,
  invalid: `No frontmatter here`,
} as const;

const TEST_PATHS = {
  contentDir: "/content/posts",
  otherDir: "/other",
  absoluteInside: "/content/posts/nested/file.md",
  absoluteOutside: "/somewhere/else.md",
} as const;

function createMockContext() {
  const storeMap = new Map();

  const store = {
    get: vi.fn((id: string) => storeMap.get(id)),
    set: vi.fn((entry) => {
      storeMap.set(entry.id, entry);
    }),
    delete: vi.fn((id: string) => storeMap.delete(id)),
    keys: vi.fn(() => storeMap.keys()),
  };

  const logger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  const parseDataMock = vi.fn(async ({ data }) => data);
  const generateDigestMock = vi.fn((value: string) => `digest:${value.length}`);

  const ctx = {
    store,
    logger,
    watcher: undefined,
    parseData: parseDataMock,
    generateDigest: generateDigestMock,
  } as unknown as LoaderContext;

  return {
    ctx,
    store,
    storeMap,
    logger,
    parseDataMock,
    generateDigestMock,
  };
}

describe("LocalFetcher", () => {
  beforeEach(() => {
    // Reset the in-memory filesystem before each test
    vol.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("fetches files from directory and reads content", async () => {
      vol.fromJSON({
        [`${TEST_PATHS.contentDir}/post1.md`]: TEST_CONTENT.post1,
      });

      const fetcher = new LocalFetcher(TEST_PATHS.contentDir);
      const { ctx } = createMockContext();

      const result = await fetcher.fetch(ctx);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        file: "post1.md",
        rawContent: TEST_CONTENT.post1,
      });
    });

    it("handles multiple files", async () => {
      vol.fromJSON({
        [`${TEST_PATHS.contentDir}/post1.md`]: TEST_CONTENT.post1,
        [`${TEST_PATHS.contentDir}/post2.md`]: TEST_CONTENT.post2,
      });

      const fetcher = new LocalFetcher(TEST_PATHS.contentDir);
      const { ctx } = createMockContext();

      const result = await fetcher.fetch(ctx);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.file).sort()).toEqual([
        "post1.md",
        "post2.md",
      ]);
      expect(result.find((r) => r.file === "post1.md")?.rawContent).toBe(
        TEST_CONTENT.post1,
      );
      expect(result.find((r) => r.file === "post2.md")?.rawContent).toBe(
        TEST_CONTENT.post2,
      );
    });

    it("returns empty array for empty directory", async () => {
      vol.fromJSON({
        [TEST_PATHS.contentDir]: null, // Create empty directory
      });

      const fetcher = new LocalFetcher(TEST_PATHS.contentDir);
      const { ctx } = createMockContext();

      const result = await fetcher.fetch(ctx);

      expect(result).toHaveLength(0);
    });
  });

  describe("shouldRefetchOnWatchChange", () => {
    it("returns true when changed file is inside watched directory", async () => {
      const fetcher = new LocalFetcher("content/posts");

      // Mock process.cwd() to return a known value
      const originalCwd = process.cwd();
      vi.spyOn(process, "cwd").mockReturnValue("/project");

      const result = await fetcher.shouldRefetchOnWatchChange(
        "/project/content/posts/article.md",
      );

      expect(result).toBe(true);

      // Restore
      vi.spyOn(process, "cwd").mockReturnValue(originalCwd);
    });

    it("returns true when changed file is in nested subdirectory", async () => {
      const fetcher = new LocalFetcher("content/posts");

      const originalCwd = process.cwd();
      vi.spyOn(process, "cwd").mockReturnValue("/project");

      const result = await fetcher.shouldRefetchOnWatchChange(
        "/project/content/posts/2024/article.md",
      );

      expect(result).toBe(true);

      vi.spyOn(process, "cwd").mockReturnValue(originalCwd);
    });

    it("returns false when changed file is outside watched directory", async () => {
      const fetcher = new LocalFetcher("content/posts");

      const originalCwd = process.cwd();
      vi.spyOn(process, "cwd").mockReturnValue("/project");

      const result = await fetcher.shouldRefetchOnWatchChange(
        "/project/content/pages/page.md",
      );

      expect(result).toBe(false);

      vi.spyOn(process, "cwd").mockReturnValue(originalCwd);
    });

    it("returns false when changed file is in parent directory", async () => {
      const fetcher = new LocalFetcher("content/posts");

      const originalCwd = process.cwd();
      vi.spyOn(process, "cwd").mockReturnValue("/project");

      const result = await fetcher.shouldRefetchOnWatchChange(
        "/project/content/config.json",
      );

      expect(result).toBe(false);

      vi.spyOn(process, "cwd").mockReturnValue(originalCwd);
    });
  });

  describe("fetcherBuilder", () => {
    it("creates a LocalFetcher instance", () => {
      const fetcher = LocalFetcher.fetcherBuilder(TEST_PATHS.contentDir);

      expect(fetcher).toBeInstanceOf(LocalFetcher);
      expect(fetcher.name).toBe("local-loader");
    });
  });
});

describe("parseLocalUrl", () => {
  it("parses valid file:// URLs", () => {
    expect(parseLocalUrl("file:///content/posts")).toBe("/content/posts");
    expect(parseLocalUrl("file://relative/path")).toBe("relative/path");
    expect(parseLocalUrl("file://")).toBe("");
  });

  it("throws error for invalid URLs", () => {
    expect(() => parseLocalUrl("/content/posts")).toThrow(
      "Invalid local URL: /content/posts",
    );
    expect(() => parseLocalUrl("http://example.com")).toThrow(
      "Invalid local URL: http://example.com",
    );
    expect(() => parseLocalUrl("")).toThrow("Invalid local URL: ");
  });
});

describe("localLoader integration", () => {
  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a working loader using yfiLoader", async () => {
    vol.fromJSON({
      [`${TEST_PATHS.contentDir}/test.md`]: TEST_CONTENT.post1,
    });

    const loader = localLoader(TEST_PATHS.contentDir);
    const { ctx, storeMap } = createMockContext();

    await loader.load(ctx);

    expect(storeMap.has("hello-world")).toBe(true);
    const entry = storeMap.get("hello-world");
    expect(entry.body.trim()).toBe("Hello world content");
  });
});
