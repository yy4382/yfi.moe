import type { LoaderContext } from "astro/loaders";
import { afterEach, describe, it, expect, vi } from "vitest";
import { yfiLoader, type ContentFetcher } from "../shared-loader";

type WatchHandler = (changedPath: string) => Promise<void> | void;

interface MockDataEntry {
  id: string;
  body: string;
  data: unknown;
  digest: string;
}

// Test data constants
const TEST_DATES = {
  writing: "2024-01-01",
  published: "2024-02-10",
  updated: "2024-02-12",
  fresh: "2024-05-01",
  second: "2024-03-01",
  secondUpdated: "2024-04-01",
} as const;

const createMarkdownContent = (
  slug: string,
  title: string,
  body: string,
  dates: { date?: string; publishedDate?: string; updated?: string } = {},
) => {
  const frontmatter = [
    "---",
    `slug: ${slug}`,
    dates.date && `date: ${dates.date}`,
    dates.publishedDate && `publishedDate: ${dates.publishedDate}`,
    dates.updated && `updated: ${dates.updated}`,
    `title: ${title}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");
  return `${frontmatter}\n\n${body}`;
};

function createMockContext(initialEntries: MockDataEntry[] = []) {
  const storeMap = new Map<string, MockDataEntry>();
  initialEntries.forEach((entry) => storeMap.set(entry.id, entry));

  const store = {
    get: vi.fn((id: string) => storeMap.get(id)),
    set: vi.fn((entry: MockDataEntry) => {
      storeMap.set(entry.id, entry);
    }),
    delete: vi.fn((id: string) => storeMap.delete(id)),
    keys: vi.fn(() => storeMap.keys()),
  };

  const logger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  const watcherHandlers: Record<string, WatchHandler> = {};
  const watcher = {
    on: vi.fn((event: string, handler: WatchHandler) => {
      watcherHandlers[event] = handler;
    }),
  };

  const parseDataMock = vi.fn(async ({ data }) => data);
  const generateDigestMock = vi.fn((value: string) => `digest:${value.length}`);

  const ctx = {
    store,
    logger,
    watcher,
    parseData: parseDataMock,
    generateDigest: generateDigestMock,
  } as unknown as LoaderContext;

  return {
    ctx,
    store,
    storeMap,
    logger,
    watcher,
    watcherHandlers,
    parseDataMock,
    generateDigestMock,
  };
}

// Helper to create test loaders
function createTestLoader(
  fetch: ContentFetcher["fetch"],
  options: {
    checkHasChanged?: ContentFetcher["checkHasChanged"];
    shouldRefetchOnWatchChange?: ContentFetcher["shouldRefetchOnWatchChange"];
    setupFileWatch?: ContentFetcher["setupFileWatch"];
  } = {},
) {
  const fetcher: ContentFetcher = {
    name: "test-loader",
    fetch,
    ...options,
  };
  return yfiLoader<undefined>(() => fetcher)(undefined);
}

describe("yfiLoader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("basic content loading", () => {
    it("stores fetched markdown entries and transforms dates with publishedDate", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/hello.md",
          rawContent: createMarkdownContent(
            "hello-world",
            "Hello",
            "Hello world!",
            {
              date: TEST_DATES.writing,
              publishedDate: TEST_DATES.published,
              updated: TEST_DATES.updated,
            },
          ),
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, storeMap, parseDataMock, generateDigestMock } =
        createMockContext();

      await loader.load(ctx);

      expect(fetch).toHaveBeenCalledOnce();
      expect(parseDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "hello-world",
          data: expect.objectContaining({
            slug: "hello-world",
            title: "Hello",
          }),
        }),
      );
      expect(generateDigestMock).toHaveBeenCalledWith(
        expect.stringContaining("Hello world!"),
      );

      const entry = storeMap.get("hello-world");
      expect(entry).toBeDefined();
      expect(entry?.body.trim()).toBe("Hello world!");

      const data = entry?.data as Record<string, unknown>;
      expect(data.publishedDate).toBeInstanceOf(Date);
      expect(data.writingDate).toBeInstanceOf(Date);
      expect(data.updatedDate).toBeInstanceOf(Date);
      expect((data.publishedDate as Date).toISOString()).toBe(
        new Date(TEST_DATES.published).toISOString(),
      );
      expect((data.writingDate as Date).toISOString()).toBe(
        new Date(TEST_DATES.writing).toISOString(),
      );
    });

    it("transforms dates using date as publishedDate when publishedDate is not provided", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/simple.md",
          rawContent: createMarkdownContent(
            "simple-post",
            "Simple",
            "Just a date",
            {
              date: TEST_DATES.writing,
            },
          ),
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, storeMap } = createMockContext();

      await loader.load(ctx);

      const entry = storeMap.get("simple-post");
      const data = entry?.data as Record<string, unknown>;

      expect(data.publishedDate).toBeInstanceOf(Date);
      expect((data.publishedDate as Date).toISOString()).toBe(
        new Date(TEST_DATES.writing).toISOString(),
      );
      expect(data.writingDate).toBeUndefined();
      expect(data.updatedDate).toBeUndefined();
    });

    it("removes entries that are no longer returned", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/fresh.md",
          rawContent: createMarkdownContent(
            "fresh-post",
            "Fresh",
            "Fresh content",
            {
              date: TEST_DATES.fresh,
            },
          ),
        },
      ]);

      const loader = createTestLoader(fetch);
      const staleEntry: MockDataEntry = {
        id: "stale-post",
        body: "Old body",
        data: {},
        digest: "stale",
      };

      const { ctx, storeMap, store } = createMockContext([staleEntry]);

      await loader.load(ctx);

      expect(store.delete).toHaveBeenCalledWith("stale-post");
      expect(storeMap.has("stale-post")).toBe(false);
      expect(storeMap.has("fresh-post")).toBe(true);
    });

    it("handles multiple entries updated in single fetch", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/first.md",
          rawContent: createMarkdownContent(
            "first-post",
            "First",
            "First content",
            {
              date: TEST_DATES.writing,
            },
          ),
        },
        {
          file: "posts/second.md",
          rawContent: createMarkdownContent(
            "second-post",
            "Second",
            "Second content",
            {
              date: TEST_DATES.published,
            },
          ),
        },
        {
          file: "posts/third.md",
          rawContent: createMarkdownContent(
            "third-post",
            "Third",
            "Third content",
            {
              date: TEST_DATES.updated,
            },
          ),
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, storeMap, logger } = createMockContext();

      await loader.load(ctx);

      expect(storeMap.size).toBe(3);
      expect(storeMap.has("first-post")).toBe(true);
      expect(storeMap.has("second-post")).toBe(true);
      expect(storeMap.has("third-post")).toBe(true);
      expect(logger.info).toHaveBeenCalledWith("Loaded file first-post");
      expect(logger.info).toHaveBeenCalledWith("Loaded file second-post");
      expect(logger.info).toHaveBeenCalledWith("Loaded file third-post");
    });
  });

  describe("content freshness check", () => {
    it("skips fetching when content is fresh", async () => {
      const fetch = vi.fn();
      const updateFailCb = vi.fn();
      const checkHasChanged = vi.fn(async () => ({
        fresh: true,
        updateFailCb,
      }));

      const loader = createTestLoader(fetch, { checkHasChanged });
      const { ctx, watcher } = createMockContext();

      await loader.load(ctx);

      expect(checkHasChanged).toHaveBeenCalledOnce();
      expect(fetch).not.toHaveBeenCalled();
      expect(watcher.on).not.toHaveBeenCalled();
      expect(updateFailCb).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("invokes updateFailCb and logs when fetching fails", async () => {
      const updateFailCb = vi.fn();
      const fetch = vi.fn().mockRejectedValue(new Error("boom"));
      const checkHasChanged = vi.fn(async () => ({
        fresh: false,
        updateFailCb,
      }));

      const loader = createTestLoader(fetch, { checkHasChanged });
      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(fetch).toHaveBeenCalledOnce();
      expect(updateFailCb).toHaveBeenCalledOnce();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch content"),
      );
    });

    it("throws error when slug is missing", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/no-slug.md",
          rawContent: "---\ntitle: No Slug\n---\n\nContent",
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("File posts/no-slug.md does not have a slug"),
      );
    });

    it("throws error when slug is not a string", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/bad-slug.md",
          rawContent: "---\nslug: 123\ntitle: Bad Slug\n---\n\nContent",
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("File posts/bad-slug.md does not have a slug"),
      );
    });

    it("handles files without frontmatter", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/no-frontmatter.md",
          rawContent: "Just plain content without frontmatter",
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("does not have a slug"),
      );
    });
  });

  describe("watcher integration", () => {
    it("refetches when watcher signals a relevant change", async () => {
      const firstFetch = [
        {
          file: "posts/hello.md",
          rawContent: createMarkdownContent(
            "hello-world",
            "Hello",
            "Initial body",
            {
              date: TEST_DATES.second,
            },
          ),
        },
      ];

      const secondFetch = [
        {
          file: "posts/hello.md",
          rawContent: createMarkdownContent(
            "hello-world",
            "Hello",
            "Updated body",
            {
              date: TEST_DATES.second,
              updated: TEST_DATES.secondUpdated,
            },
          ),
        },
      ];

      const fetch = vi
        .fn()
        .mockResolvedValueOnce(firstFetch)
        .mockResolvedValueOnce(secondFetch);

      const shouldRefetchOnWatchChange = vi.fn(async (changedPath: string) =>
        changedPath.endsWith("hello.md"),
      );

      const loader = createTestLoader(fetch, { shouldRefetchOnWatchChange });
      const { ctx, storeMap, watcherHandlers, logger } = createMockContext();

      await loader.load(ctx);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(watcherHandlers.change).toBeDefined();

      await watcherHandlers.change?.("posts/hello.md");

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(shouldRefetchOnWatchChange).toHaveBeenLastCalledWith(
        "posts/hello.md",
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("will refetch"),
      );

      const entry = storeMap.get("hello-world");
      expect(entry?.body.trim()).toBe("Updated body");
      const data = entry?.data as Record<string, unknown>;
      expect(data.updatedDate).toBeInstanceOf(Date);
    });

    it("does not refetch when shouldRefetchOnWatchChange returns false", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/test.md",
          rawContent: createMarkdownContent("test-post", "Test", "Content", {
            date: TEST_DATES.writing,
          }),
        },
      ]);

      const shouldRefetchOnWatchChange = vi.fn(async () => false);

      const loader = createTestLoader(fetch, { shouldRefetchOnWatchChange });
      const { ctx, watcherHandlers, logger } = createMockContext();

      await loader.load(ctx);
      expect(fetch).toHaveBeenCalledTimes(1);

      await watcherHandlers.change?.("posts/other.md");

      expect(fetch).toHaveBeenCalledTimes(1); // Still 1, no refetch
      expect(shouldRefetchOnWatchChange).toHaveBeenCalledWith("posts/other.md");
      expect(logger.info).not.toHaveBeenCalledWith(
        expect.stringContaining("will refetch"),
      );
    });

    it("handles unlink watcher event", async () => {
      const firstFetch = [
        {
          file: "posts/test.md",
          rawContent: createMarkdownContent("test-post", "Test", "Initial", {
            date: TEST_DATES.writing,
          }),
        },
      ];

      const secondFetch: typeof firstFetch = [];

      const fetch = vi
        .fn()
        .mockResolvedValueOnce(firstFetch)
        .mockResolvedValueOnce(secondFetch);

      const shouldRefetchOnWatchChange = vi.fn(async () => true);

      const loader = createTestLoader(fetch, { shouldRefetchOnWatchChange });
      const { ctx, storeMap, watcherHandlers, store } = createMockContext();

      await loader.load(ctx);
      expect(storeMap.has("test-post")).toBe(true);

      await watcherHandlers.unlink?.("posts/test.md");

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(store.delete).toHaveBeenCalledWith("test-post");
      expect(storeMap.has("test-post")).toBe(false);
    });

    it("handles add watcher event", async () => {
      const firstFetch: { file: string; rawContent: string }[] = [];

      const secondFetch = [
        {
          file: "posts/new.md",
          rawContent: createMarkdownContent("new-post", "New", "New content", {
            date: TEST_DATES.writing,
          }),
        },
      ];

      const fetch = vi
        .fn()
        .mockResolvedValueOnce(firstFetch)
        .mockResolvedValueOnce(secondFetch);

      const shouldRefetchOnWatchChange = vi.fn(async () => true);

      const loader = createTestLoader(fetch, { shouldRefetchOnWatchChange });
      const { ctx, storeMap, watcherHandlers } = createMockContext();

      await loader.load(ctx);
      expect(storeMap.has("new-post")).toBe(false);

      await watcherHandlers.add?.("posts/new.md");

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(storeMap.has("new-post")).toBe(true);
    });

    it("works when watcher is undefined", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/test.md",
          rawContent: createMarkdownContent("test-post", "Test", "Content", {
            date: TEST_DATES.writing,
          }),
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, storeMap } = createMockContext();

      // Remove watcher to simulate undefined
      (ctx as { watcher?: unknown }).watcher = undefined;

      await loader.load(ctx);

      expect(fetch).toHaveBeenCalledOnce();
      expect(storeMap.has("test-post")).toBe(true);
    });
  });

  describe("setupFileWatch integration", () => {
    it("calls setupFileWatch if provided by fetcher", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/test.md",
          rawContent: createMarkdownContent("test-post", "Test", "Content", {
            date: TEST_DATES.writing,
          }),
        },
      ]);

      const setupFileWatch = vi.fn(async () => {});

      const loader = createTestLoader(fetch, { setupFileWatch });
      const { ctx } = createMockContext();

      await loader.load(ctx);

      expect(setupFileWatch).toHaveBeenCalledOnce();
      expect(setupFileWatch).toHaveBeenCalledWith(ctx);
    });

    it("does not call setupFileWatch when checkHasChanged returns fresh", async () => {
      const fetch = vi.fn(async () => []);
      const setupFileWatch = vi.fn(async () => {});
      const checkHasChanged = vi.fn(async () => ({
        fresh: true,
        updateFailCb: vi.fn(),
      }));

      const loader = createTestLoader(fetch, {
        setupFileWatch,
        checkHasChanged,
      });
      const { ctx } = createMockContext();

      await loader.load(ctx);

      expect(checkHasChanged).toHaveBeenCalledOnce();
      expect(setupFileWatch).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    it("works when setupFileWatch is not provided", async () => {
      const fetch = vi.fn(async () => [
        {
          file: "posts/test.md",
          rawContent: createMarkdownContent("test-post", "Test", "Content", {
            date: TEST_DATES.writing,
          }),
        },
      ]);

      const loader = createTestLoader(fetch);
      const { ctx, storeMap } = createMockContext();

      await loader.load(ctx);

      expect(fetch).toHaveBeenCalledOnce();
      expect(storeMap.has("test-post")).toBe(true);
    });
  });
});
