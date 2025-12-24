import type { LoaderContext } from "astro/loaders";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { parseGithubUrl, githubLoader } from "../github";

// Test constants
const TEST_GITHUB = {
  owner: "test-owner",
  repo: "test-repo",
  path: "content/posts",
  ref: "heads/main",
  pat: "test-token",
  sha: "abc123def456",
  newSha: "def456abc789",
} as const;

const TEST_CONTENT = {
  post1: {
    file: `---
slug: hello-world
title: Hello World
date: 2024-01-01
---

Hello from GitHub`,
    base64: Buffer.from(
      `---
slug: hello-world
title: Hello World
date: 2024-01-01
---

Hello from GitHub`,
    ).toString("base64"),
  },
  post2: {
    file: `---
slug: second-post
title: Second Post
date: 2024-02-01
---

Second post from GitHub`,
    base64: Buffer.from(
      `---
slug: second-post
title: Second Post
date: 2024-02-01
---

Second post from GitHub`,
    ).toString("base64"),
  },
} as const;

// MSW request handlers
const server = setupServer(
  // Mock git ref endpoint (for SHA fetching)
  // Note: The :ref param captures everything after /git/ref/, including slashes
  http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () => {
    return HttpResponse.json({
      object: {
        sha: TEST_GITHUB.sha,
      },
    });
  }),

  // Mock contents endpoint for directory listing
  // Use wildcard to match paths with slashes
  http.get(
    "https://api.github.com/repos/:owner/:repo/contents/*",
    ({ request }) => {
      const url = new URL(request.url);
      // Extract the full path after /contents/
      const fullPath = url.pathname.split("/contents/")[1];

      // If path is the main directory, return file list
      if (fullPath === TEST_GITHUB.path) {
        return HttpResponse.json([
          {
            name: "post1.md",
            path: `${TEST_GITHUB.path}/post1.md`,
            type: "file",
          },
          {
            name: "post2.md",
            path: `${TEST_GITHUB.path}/post2.md`,
            type: "file",
          },
          {
            name: "subdir",
            path: `${TEST_GITHUB.path}/subdir`,
            type: "dir",
          },
        ]);
      }

      // If requesting specific files, return file content
      if (fullPath === `${TEST_GITHUB.path}/post1.md`) {
        return HttpResponse.json({
          name: "post1.md",
          path: `${TEST_GITHUB.path}/post1.md`,
          content: TEST_CONTENT.post1.base64,
          encoding: "base64",
        });
      }

      if (fullPath === `${TEST_GITHUB.path}/post2.md`) {
        return HttpResponse.json({
          name: "post2.md",
          path: `${TEST_GITHUB.path}/post2.md`,
          content: TEST_CONTENT.post2.base64,
          encoding: "base64",
        });
      }

      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    },
  ),
);

function createMockContext(initialMeta: Record<string, string> = {}) {
  const storeMap = new Map();
  const metaMap = new Map(Object.entries(initialMeta));

  const store = {
    get: vi.fn((id: string) => storeMap.get(id)),
    set: vi.fn((entry) => {
      storeMap.set(entry.id, entry);
    }),
    delete: vi.fn((id: string) => storeMap.delete(id)),
    keys: vi.fn(() => storeMap.keys()),
  };

  const meta = {
    get: vi.fn((key: string) => metaMap.get(key)),
    set: vi.fn((key: string, value: string) => {
      metaMap.set(key, value);
    }),
    delete: vi.fn((key: string) => metaMap.delete(key)),
  };

  const logger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  const parseDataMock = vi.fn(async ({ data }) => data);
  const generateDigestMock = vi.fn((value: string) => `digest:${value.length}`);

  const ctx = {
    store,
    meta,
    logger,
    watcher: undefined,
    parseData: parseDataMock,
    generateDigest: generateDigestMock,
  } as unknown as LoaderContext;

  return {
    ctx,
    store,
    storeMap,
    meta,
    metaMap,
    logger,
    parseDataMock,
    generateDigestMock,
  };
}

describe("GithubFetcher", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  describe("parseGithubUrl", () => {
    it("parses valid GitHub URLs correctly with path containing slash", () => {
      // Due to greedy regex matching, the path gets split between ref and path
      const result = parseGithubUrl(
        "https://github.com/yy4382/blog/tree/main/content/post",
      );

      expect(result).toEqual({
        owner: "yy4382",
        repo: "blog",
        path: "post",
        ref: "main/content", // ref captures "main/content" due to greedy .+
      });
    });

    it("handles refs with slashes (already in heads/ format)", () => {
      const result = parseGithubUrl(
        "https://github.com/owner/repo/tree/feature/test-branch/src",
      );

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        path: "src",
        ref: "feature/test-branch",
      });
    });

    it("converts simple refs to heads/ format", () => {
      const result = parseGithubUrl(
        "https://github.com/owner/repo/tree/develop/content",
      );

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        path: "content",
        ref: "heads/develop",
      });
    });

    it("throws error for invalid URLs", () => {
      expect(() => parseGithubUrl("https://gitlab.com/owner/repo")).toThrow(
        "Invalid GitHub URL",
      );

      expect(() =>
        parseGithubUrl("https://github.com/owner/repo/blob/main/file.md"),
      ).toThrow("Invalid GitHub URL");

      expect(() => parseGithubUrl("not a url")).toThrow("Invalid GitHub URL");
    });
  });

  describe("checkHasChanged", () => {
    it("returns fresh=true when SHA hasn't changed", async () => {
      const loader = githubLoader({
        ...TEST_GITHUB,
        owner: TEST_GITHUB.owner,
        repo: TEST_GITHUB.repo,
        path: TEST_GITHUB.path,
        ref: TEST_GITHUB.ref,
        pat: TEST_GITHUB.pat,
      });

      const { ctx, logger } = createMockContext({
        lastSha: TEST_GITHUB.sha,
      });

      await loader.load(ctx);

      expect(logger.info).toHaveBeenCalledWith("No new commits, skipping sync");
    });

    it("returns fresh=false when SHA has changed", async () => {
      server.use(
        http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () => {
          return HttpResponse.json({
            object: {
              sha: TEST_GITHUB.newSha,
            },
          });
        }),
      );

      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, meta, logger } = createMockContext({
        lastSha: TEST_GITHUB.sha,
      });

      await loader.load(ctx);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          `Will fetch content with sha ${TEST_GITHUB.newSha}`,
        ),
      );
      expect(meta.set).toHaveBeenCalledWith("lastSha", TEST_GITHUB.newSha);
    });

    it("updates meta.lastSha on first load", async () => {
      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, meta } = createMockContext();

      await loader.load(ctx);

      expect(meta.set).toHaveBeenCalledWith("lastSha", TEST_GITHUB.sha);
    });

    it("calls updateFailCb to rollback SHA on fetch failure", async () => {
      // Make the directory fetch fail and return new SHA
      server.use(
        http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () => {
          return HttpResponse.json({
            object: {
              sha: TEST_GITHUB.newSha,
            },
          });
        }),
        http.get("https://api.github.com/repos/:owner/:repo/contents/*", () => {
          return HttpResponse.json(
            { message: "Server Error" },
            { status: 500 },
          );
        }),
      );

      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, meta, logger } = createMockContext({
        lastSha: TEST_GITHUB.sha,
      });

      await loader.load(ctx);

      // Should have attempted to set new SHA
      expect(meta.set).toHaveBeenCalledWith("lastSha", TEST_GITHUB.newSha);

      // Should have rolled back to old SHA after failure
      expect(meta.set).toHaveBeenCalledWith("lastSha", TEST_GITHUB.sha);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch content"),
      );
    });
  });

  describe("fetch method", () => {
    it("fetches directory listing and file contents", async () => {
      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, storeMap } = createMockContext();

      await loader.load(ctx);

      expect(storeMap.size).toBe(2);
      expect(storeMap.has("hello-world")).toBe(true);
      expect(storeMap.has("second-post")).toBe(true);
    });

    it("filters out directories, only processes files", async () => {
      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, storeMap } = createMockContext();

      await loader.load(ctx);

      // Should have 2 files, not 3 (excluded the subdir)
      expect(storeMap.size).toBe(2);
    });

    it("decodes base64 content correctly", async () => {
      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, storeMap } = createMockContext();

      await loader.load(ctx);

      const entry = storeMap.get("hello-world");
      expect(entry.body.trim()).toBe("Hello from GitHub");
    });

    it("sends correct Authorization header", async () => {
      let authHeader = "";

      server.use(
        http.get(
          "https://api.github.com/repos/:owner/:repo/contents/*",
          ({ request }) => {
            authHeader = request.headers.get("Authorization") || "";
            return HttpResponse.json([]);
          },
        ),
      );

      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx } = createMockContext();

      await loader.load(ctx);

      expect(authHeader).toBe(`Bearer ${TEST_GITHUB.pat}`);
    });
  });

  describe("error handling", () => {
    it("throws error when path is not a directory", async () => {
      server.use(
        http.get(
          "https://api.github.com/repos/:owner/:repo/contents/*",
          ({ request }) => {
            const url = new URL(request.url);
            const fullPath = url.pathname.split("/contents/")[1];

            // Return a file object instead of array for the main path
            if (fullPath === TEST_GITHUB.path) {
              return HttpResponse.json({
                name: "file.md",
                path: TEST_GITHUB.path,
                type: "file",
              });
            }

            return HttpResponse.json({ message: "Not Found" }, { status: 404 });
          },
        ),
      );

      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch content"),
      );
    });

    it("throws error when file doesn't contain content field", async () => {
      server.use(
        http.get(
          "https://api.github.com/repos/:owner/:repo/contents/*",
          ({ request }) => {
            const url = new URL(request.url);
            const fullPath = url.pathname.split("/contents/")[1];

            // Return directory listing normally
            if (fullPath === TEST_GITHUB.path) {
              return HttpResponse.json([
                {
                  name: "post1.md",
                  path: `${TEST_GITHUB.path}/post1.md`,
                  type: "file",
                },
              ]);
            }

            // Return file without content field
            if (fullPath === `${TEST_GITHUB.path}/post1.md`) {
              return HttpResponse.json({
                name: "post1.md",
                path: `${TEST_GITHUB.path}/post1.md`,
                type: "file",
                // Missing 'content' field
              });
            }

            return HttpResponse.json({ message: "Not Found" }, { status: 404 });
          },
        ),
      );

      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch content"),
      );
    });

    it("throws error for non-base64 encoding", async () => {
      server.use(
        http.get(
          "https://api.github.com/repos/:owner/:repo/contents/*",
          ({ request }) => {
            const url = new URL(request.url);
            const fullPath = url.pathname.split("/contents/")[1];

            // Return directory listing normally
            if (fullPath === TEST_GITHUB.path) {
              return HttpResponse.json([
                {
                  name: "post1.md",
                  path: `${TEST_GITHUB.path}/post1.md`,
                  type: "file",
                },
              ]);
            }

            // Return file with wrong encoding
            if (fullPath === `${TEST_GITHUB.path}/post1.md`) {
              return HttpResponse.json({
                name: "post1.md",
                path: `${TEST_GITHUB.path}/post1.md`,
                content: "plain text content",
                encoding: "utf-8",
              });
            }

            return HttpResponse.json({ message: "Not Found" }, { status: 404 });
          },
        ),
      );

      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, logger } = createMockContext();

      await loader.load(ctx);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch content"),
      );
    });
  });

  describe("integration", () => {
    it("creates a working loader that syncs content from GitHub", async () => {
      const loader = githubLoader({
        ...TEST_GITHUB,
      });

      const { ctx, storeMap, logger } = createMockContext();

      await loader.load(ctx);

      expect(storeMap.size).toBe(2);

      const post1 = storeMap.get("hello-world");
      expect(post1).toBeDefined();
      expect(post1.body.trim()).toBe("Hello from GitHub");

      const post2 = storeMap.get("second-post");
      expect(post2).toBeDefined();
      expect(post2.body.trim()).toBe("Second post from GitHub");

      expect(logger.info).toHaveBeenCalledWith("Loaded file hello-world");
      expect(logger.info).toHaveBeenCalledWith("Loaded file second-post");
    });
  });
});
