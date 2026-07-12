import type { LoaderContext } from "astro/loaders";
import { fs, vol } from "memfs";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  imageMetadataFileLoader,
  markdownFileSetLoader,
} from "../content-ingestion";

vi.mock("node:fs/promises", () => ({
  default: fs.promises,
}));

const githubServer = setupServer();

type StoredEntry = {
  id: string;
  body?: string;
  data: Record<string, unknown>;
  digest?: string;
};

function createContext(
  initialEntries: StoredEntry[] = [],
  initialMetadata: Record<string, unknown> = {},
) {
  const entries = new Map(initialEntries.map((entry) => [entry.id, entry]));
  const metadata = new Map<string, unknown>(Object.entries(initialMetadata));
  const watcherHandlers = new Map<string, (changedPath: string) => unknown>();

  const context = {
    store: {
      get: vi.fn((id: string) => entries.get(id)),
      set: vi.fn((entry: StoredEntry) => {
        if (entry.digest && entries.get(entry.id)?.digest === entry.digest) {
          return false;
        }
        entries.set(entry.id, entry);
        return true;
      }),
      delete: vi.fn((id: string) => entries.delete(id)),
      clear: vi.fn(() => entries.clear()),
      keys: vi.fn(() => entries.keys()),
    },
    meta: {
      get: vi.fn((key: string) => metadata.get(key)),
      set: vi.fn((key: string, value: unknown) => metadata.set(key, value)),
      delete: vi.fn((key: string) => metadata.delete(key)),
      has: vi.fn((key: string) => metadata.has(key)),
    },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    watcher: {
      add: vi.fn(),
      on: vi.fn((event: string, handler: (changedPath: string) => unknown) => {
        watcherHandlers.set(event, handler);
      }),
    },
    parseData: vi.fn(async ({ data }) => data),
    generateDigest: vi.fn((content: string) => `digest:${content}`),
  } as unknown as LoaderContext;

  return { context, entries, watcherHandlers };
}

function markdown(slug: string, title: string, body: string) {
  return `---\nslug: ${slug}\ntitle: ${title}\ndate: 2024-01-02\n---\n\n${body}`;
}

describe("content ingestion", () => {
  beforeAll(() => githubServer.listen({ onUnhandledRequest: "error" }));

  afterAll(() => githubServer.close());

  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    githubServer.resetHandlers();
  });

  it("reconciles a local file-set collection through Astro's loader interface", async () => {
    vol.fromJSON({
      "/content/posts/hello.md": markdown("hello", "Hello", "Hello body"),
      "/content/posts/second.md": markdown("second", "Second", "Second body"),
    });
    const stale: StoredEntry = {
      id: "stale",
      data: {},
      body: "Old body",
      digest: "old-digest",
    };
    const { context, entries } = createContext([stale]);
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });

    await loader.load(context);

    expect([...entries.keys()].sort()).toEqual(["hello", "second"]);
    expect(entries.get("hello")).toMatchObject({
      id: "hello",
      body: "\nHello body",
      data: {
        slug: "hello",
        title: "Hello",
        publishedDate: new Date("2024-01-02"),
      },
    });
  });

  it("reuses an unchanged persisted Markdown entry by digest", async () => {
    const content = markdown("hello", "Hello", "Hello body");
    vol.fromJSON({ "/content/posts/hello.md": content });
    const persisted: StoredEntry = {
      id: "hello",
      data: { source: "persisted" },
      body: "Persisted body",
      digest: `digest:${content}`,
    };
    const { context, entries } = createContext([persisted]);
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });

    await loader.load(context);

    expect(context.parseData).not.toHaveBeenCalled();
    expect(entries.get("hello")).toBe(persisted);
  });

  it("preserves explicit publication, writing, and update dates", async () => {
    vol.fromJSON({
      "/content/posts/dates.md": `---
slug: dates
title: Dates
date: 2024-01-02
publishedDate: 2024-02-03
updated: 2024-03-04
---

Body`,
    });
    const { context, entries } = createContext();
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });

    await loader.load(context);

    expect(entries.get("dates")?.data).toMatchObject({
      writingDate: new Date("2024-01-02"),
      publishedDate: new Date("2024-02-03"),
      updatedDate: new Date("2024-03-04"),
    });
  });

  it("updates only the changed local Markdown entry during development", async () => {
    vol.fromJSON({
      "/content/posts/hello.md": markdown("hello", "Hello", "Initial body"),
    });
    const { context, entries, watcherHandlers } = createContext();
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });
    await loader.load(context);

    await fs.promises.writeFile(
      "/content/posts/hello.md",
      markdown("hello", "Hello", "Updated body"),
    );
    await fs.promises.writeFile(
      "/content/posts/not-announced.md",
      markdown("not-announced", "Hidden", "Hidden body"),
    );
    await watcherHandlers.get("change")?.("/content/posts/hello.md");

    expect([...entries.keys()]).toEqual(["hello"]);
    expect(entries.get("hello")?.body).toBe("\nUpdated body");
  });

  it("logs a failed local watch update and keeps the existing entry", async () => {
    vol.fromJSON({
      "/content/posts/hello.md": markdown("hello", "Hello", "Valid body"),
    });
    const { context, entries, watcherHandlers } = createContext();
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });
    await loader.load(context);

    await fs.promises.writeFile(
      "/content/posts/hello.md",
      "---\ntitle: Missing slug\ndate: 2024-01-02\n---\n\nInvalid body",
    );
    await watcherHandlers.get("change")?.("/content/posts/hello.md");

    expect(entries.get("hello")?.body).toBe("\nValid body");
    expect(context.logger.error).toHaveBeenCalledWith(
      expect.stringContaining("does not have a slug"),
    );
  });

  it("tracks local add, slug change, and unlink events by entry identity", async () => {
    vol.fromJSON({ "/content/posts": null });
    const { context, entries, watcherHandlers } = createContext();
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });
    await loader.load(context);

    await fs.promises.writeFile(
      "/content/posts/article.md",
      markdown("first-slug", "Article", "Body"),
    );
    await watcherHandlers.get("add")?.("/content/posts/article.md");
    expect([...entries.keys()]).toEqual(["first-slug"]);

    await fs.promises.writeFile(
      "/content/posts/article.md",
      markdown("replacement-slug", "Article", "Body"),
    );
    await watcherHandlers.get("change")?.("/content/posts/article.md");
    expect([...entries.keys()]).toEqual(["replacement-slug"]);

    await fs.promises.unlink("/content/posts/article.md");
    await watcherHandlers.get("unlink")?.("/content/posts/article.md");
    expect([...entries.keys()]).toEqual([]);
  });

  it("does not traverse nested directories in a local file-set collection", async () => {
    vol.fromJSON({
      "/content/posts/top-level.md": markdown(
        "top-level",
        "Top level",
        "Visible body",
      ),
      "/content/posts/nested/hidden.md": markdown(
        "nested",
        "Nested",
        "Hidden body",
      ),
    });
    const { context, entries } = createContext();
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });

    await loader.load(context);

    expect([...entries.keys()]).toEqual(["top-level"]);
  });

  it("warns when two Markdown files resolve to the same slug", async () => {
    vol.fromJSON({
      "/content/posts/first.md": markdown("duplicate", "First", "First body"),
      "/content/posts/second.md": markdown(
        "duplicate",
        "Second",
        "Second body",
      ),
    });
    const { context } = createContext();
    const loader = markdownFileSetLoader({
      source: "file:///content/posts",
      githubToken: "unused",
    });

    await loader.load(context);

    expect(context.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate slug "duplicate"'),
    );
  });

  it("reconciles a GitHub file-set collection and records its ref SHA", async () => {
    const content = markdown("github-post", "GitHub", "Remote body");
    let requestedRefPath = "";
    let requestedContentRef = "";
    let authorization = "";
    githubServer.use(
      http.get(
        "https://api.github.com/repos/:owner/:repo/git/ref/*",
        ({ request }) => {
          requestedRefPath = new URL(request.url).pathname;
          authorization = request.headers.get("Authorization") ?? "";
          return HttpResponse.json({ object: { sha: "sha-123" } });
        },
      ),
      http.get(
        "https://api.github.com/repos/:owner/:repo/contents/*",
        ({ request }) => {
          const requestedPath = new URL(request.url).pathname.split(
            "/contents/",
          )[1];
          if (requestedPath === "posts") {
            requestedContentRef = new URL(request.url).searchParams.get("ref")!;
            return HttpResponse.json([
              { type: "file", path: "posts/remote.md" },
              { type: "dir", path: "posts/nested" },
            ]);
          }
          if (requestedPath === "posts/remote.md") {
            return HttpResponse.json({
              name: "remote.md",
              encoding: "base64",
              content: Buffer.from(content).toString("base64"),
            });
          }
          return new HttpResponse(null, { status: 404 });
        },
      ),
    );
    const { context, entries } = createContext([], {
      lastSha: "previous-sha",
    });
    const loader = markdownFileSetLoader({
      source: "https://github.com/owner/repo/tree/main/content/posts",
      githubToken: "secret",
    });

    await loader.load(context);

    expect([...entries.keys()]).toEqual(["github-post"]);
    expect(entries.get("github-post")?.body).toBe("\nRemote body");
    expect(context.meta.set).toHaveBeenCalledWith("sourceRevision", "sha-123");
    expect(context.meta.delete).toHaveBeenCalledWith("lastSha");
    expect(requestedRefPath.endsWith("/git/ref/main/content")).toBe(true);
    expect(requestedContentRef).toBe("main/content");
    expect(authorization).toBe("Bearer secret");
  });

  it("does not reacquire GitHub files when the ref SHA is unchanged", async () => {
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "unchanged-sha" } }),
      ),
    );
    const persisted: StoredEntry = {
      id: "persisted",
      data: {},
      body: "Persisted body",
      digest: "persisted-digest",
    };
    const { context, entries } = createContext([persisted], {
      lastSha: "unchanged-sha",
    });
    const loader = markdownFileSetLoader({
      source: "https://github.com/owner/repo/tree/main/posts",
      githubToken: "secret",
    });

    await loader.load(context);

    expect(entries.get("persisted")).toBe(persisted);
    expect(context.parseData).not.toHaveBeenCalled();
    expect(context.meta.set).not.toHaveBeenCalled();
  });

  it("rejects an initial GitHub sync without committing its ref SHA", async () => {
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "failing-sha" } }),
      ),
      http.get(
        "https://api.github.com/repos/:owner/:repo/contents/*",
        ({ request }) => {
          const requestedPath = new URL(request.url).pathname.split(
            "/contents/",
          )[1];
          if (requestedPath === "posts") {
            return HttpResponse.json([
              { type: "file", path: "posts/invalid.md" },
            ]);
          }
          return HttpResponse.json({
            name: "invalid.md",
            encoding: "base64",
            content: Buffer.from("---\ntitle: Missing slug\n---\n").toString(
              "base64",
            ),
          });
        },
      ),
    );
    const { context } = createContext();
    const loader = markdownFileSetLoader({
      source: "https://github.com/owner/repo/tree/main/posts",
      githubToken: "secret",
    });

    await expect(loader.load(context)).rejects.toThrow("does not have a slug");
    expect(context.meta.set).not.toHaveBeenCalled();
  });

  it("rejects a GitHub file-set source that is not a directory", async () => {
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "file-sha" } }),
      ),
      http.get("https://api.github.com/repos/:owner/:repo/contents/*", () =>
        HttpResponse.json({ type: "file", path: "posts" }),
      ),
    );
    const { context } = createContext();
    const loader = markdownFileSetLoader({
      source: "https://github.com/owner/repo/tree/main/posts",
      githubToken: "secret",
    });

    await expect(loader.load(context)).rejects.toThrow("is not a directory");
  });

  it.each([
    {
      file: { name: "invalid.md", encoding: "utf-8", content: "plain" },
      error: "is not base64 encoded",
    },
    {
      file: { name: "invalid.md", encoding: "base64" },
      error: "does not contain content",
    },
  ])("rejects a GitHub file when it $error", async ({ file, error }) => {
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "invalid-file-sha" } }),
      ),
      http.get(
        "https://api.github.com/repos/:owner/:repo/contents/*",
        ({ request }) => {
          const requestedPath = new URL(request.url).pathname.split(
            "/contents/",
          )[1];
          if (requestedPath === "posts") {
            return HttpResponse.json([
              { type: "file", path: "posts/invalid.md" },
            ]);
          }
          return HttpResponse.json(file);
        },
      ),
    );
    const { context } = createContext();
    const loader = markdownFileSetLoader({
      source: "https://github.com/owner/repo/tree/main/posts",
      githubToken: "secret",
    });

    await expect(loader.load(context)).rejects.toThrow(error);
  });

  it("replaces a structured image-metadata collection with URL-keyed entries", async () => {
    vol.fromJSON({
      "/content/images.json": JSON.stringify([
        {
          url: "https://images.example/first.webp",
          width: 640,
          height: 480,
          blurhash: "first-hash",
        },
        {
          url: "https://images.example/second.webp",
          width: 1200,
          height: 800,
          blurhash: "second-hash",
        },
      ]),
    });
    const { context, entries } = createContext([
      { id: "stale", data: { url: "stale" } },
    ]);
    const loader = imageMetadataFileLoader({
      source: "file:///content/images.json",
      githubToken: "unused",
    });

    await loader.load(context);

    expect([...entries.keys()].sort()).toEqual([
      "https://images.example/first.webp",
      "https://images.example/second.webp",
    ]);
    expect(entries.get("https://images.example/first.webp")?.data).toEqual({
      url: "https://images.example/first.webp",
      width: 640,
      height: 480,
      blurhash: "first-hash",
    });
  });

  it("loads structured image metadata from GitHub with ref freshness", async () => {
    const metadata = [
      {
        url: "https://images.example/remote.webp",
        width: 800,
        height: 600,
        blurhash: "remote-hash",
      },
    ];
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "image-sha" } }),
      ),
      http.get("https://api.github.com/repos/:owner/:repo/contents/*", () =>
        HttpResponse.json({
          name: "images.json",
          encoding: "base64",
          content: Buffer.from(JSON.stringify(metadata)).toString("base64"),
        }),
      ),
    );
    const { context, entries } = createContext();
    const loader = imageMetadataFileLoader({
      source: "https://github.com/owner/repo/blob/main/images.json",
      githubToken: "secret",
    });

    await loader.load(context);

    expect([...entries.keys()]).toEqual(["https://images.example/remote.webp"]);
    expect(context.meta.set).toHaveBeenCalledWith(
      "sourceRevision",
      "image-sha",
    );
  });

  it("does not reacquire structured GitHub data at an unchanged revision", async () => {
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "unchanged-image-sha" } }),
      ),
    );
    const persisted: StoredEntry = {
      id: "https://images.example/persisted.webp",
      data: { url: "https://images.example/persisted.webp" },
    };
    const { context, entries } = createContext([persisted], {
      sourceRevision: "unchanged-image-sha",
    });
    const loader = imageMetadataFileLoader({
      source: "https://github.com/owner/repo/blob/main/images.json",
      githubToken: "secret",
    });

    await loader.load(context);

    expect(entries.get(persisted.id)).toBe(persisted);
    expect(context.parseData).not.toHaveBeenCalled();
  });

  it("does not commit a structured GitHub revision when parsing fails", async () => {
    githubServer.use(
      http.get("https://api.github.com/repos/:owner/:repo/git/ref/*", () =>
        HttpResponse.json({ object: { sha: "invalid-image-sha" } }),
      ),
      http.get("https://api.github.com/repos/:owner/:repo/contents/*", () =>
        HttpResponse.json({
          name: "images.json",
          encoding: "base64",
          content: Buffer.from("not JSON").toString("base64"),
        }),
      ),
    );
    const { context } = createContext();
    const loader = imageMetadataFileLoader({
      source: "https://github.com/owner/repo/blob/main/images.json",
      githubToken: "secret",
    });

    await expect(loader.load(context)).rejects.toThrow();
    expect(context.meta.set).not.toHaveBeenCalled();
  });

  it("replaces a local structured-file collection when its file changes", async () => {
    vol.fromJSON({
      "/content/images.json": JSON.stringify([
        {
          url: "https://images.example/first.webp",
          width: 640,
          height: 480,
          blurhash: "first-hash",
        },
      ]),
    });
    const { context, entries, watcherHandlers } = createContext();
    const loader = imageMetadataFileLoader({
      source: "file:///content/images.json",
      githubToken: "unused",
    });
    await loader.load(context);

    await fs.promises.writeFile(
      "/content/images.json",
      JSON.stringify([
        {
          url: "https://images.example/replacement.webp",
          width: 320,
          height: 200,
          blurhash: "replacement-hash",
        },
      ]),
    );
    await watcherHandlers.get("change")?.("/content/images.json");

    expect([...entries.keys()]).toEqual([
      "https://images.example/replacement.webp",
    ]);
  });

  it("warns when later image metadata replaces a duplicate URL", async () => {
    vol.fromJSON({
      "/content/images.json": JSON.stringify([
        {
          url: "https://images.example/duplicate.webp",
          width: 640,
          height: 480,
          blurhash: "first-hash",
        },
        {
          url: "https://images.example/duplicate.webp",
          width: 1280,
          height: 960,
          blurhash: "replacement-hash",
        },
      ]),
    });
    const { context, entries } = createContext();
    const loader = imageMetadataFileLoader({
      source: "file:///content/images.json",
      githubToken: "unused",
    });

    await loader.load(context);

    expect(context.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Duplicate image metadata URL "https://images.example/duplicate.webp"',
      ),
    );
    expect(
      entries.get("https://images.example/duplicate.webp")?.data.width,
    ).toBe(1280);
  });
});
