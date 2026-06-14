import type { components } from "@octokit/openapi-types";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import yaml from "js-yaml";
import { nitro } from "nitro/vite";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import font from "vite-plugin-font";
import tsconfigPaths from "vite-tsconfig-paths";
import { postPageSize } from "./src/lib/content/pagination";

type GithubDirectory = components["schemas"]["content-directory"];
type GithubContentFile = components["schemas"]["content-file"];
type GithubRef = components["schemas"]["git-ref"];

type GithubDirectoryOptions = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  pat?: string;
};

type StaticContentEntry = {
  slug: string;
  title?: string;
  date?: string;
  published?: boolean;
  tags?: string[];
};

const explicitStaticPaths = [
  "/",
  "/post",
  "/archive",
  "/about",
  "/credits",
  "/account/notification",
  "/feed.xml",
  "/sitemap-index.xml",
  "/sitemap-0.xml",
  "/robots.txt",
  "/404",
  "/achieve",
];

const dynamicPageRouteCollisions = new Set([
  "404",
  "about",
  "account",
  "achieve",
  "archive",
  "credits",
  "feed.xml",
  "post",
  "robots.txt",
  "sitemap-0.xml",
  "sitemap-index.xml",
  "tags",
]);

const appRootPath = fileURLToPath(new URL(".", import.meta.url));
const vercelOutputPath = fileURLToPath(
  new URL("../../.vercel/output", import.meta.url),
);
const serverEnvKeys = [
  "ARTICLE_PAT",
  "POST_GH_INFO",
  "PAGE_GH_INFO",
  "IMAGE_META_SOURCE",
] as const;
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, appRootPath, "");
  applyBuildServerEnv(env);
  const staticPages = await getStaticPrerenderPages(env);

  return {
    server: {
      port: 3000,
    },
    preview: {
      host: "127.0.0.1",
      port: 3000,
    },
    ssr: {
      external: ["sharp"],
    },
    plugins: [
      tsconfigPaths(),
      font.vite(),
      tanstackStart({
        rsc: {
          enabled: true,
        },
        spa: {
          enabled: true,
        },
        prerender: {
          enabled: true,
          autoSubfolderIndex: true,
          autoStaticPathsDiscovery: true,
          concurrency: 1,
          crawlLinks: false,
          failOnError: true,
          retryCount: 2,
          filter: ({ path }) => !path.startsWith("/api/"),
        },
        pages: staticPages,
      }),
      nitro({
        preset: "vercel",
        output: {
          dir: vercelOutputPath,
        },
      }),
      rsc(),
      tailwindcss(),
      react(),
    ],
  };
});

function applyBuildServerEnv(env: Record<string, string>) {
  for (const key of serverEnvKeys) {
    const value = env[key];
    if (!value) continue;
    process.env[key] ??= value;
  }
}

async function getStaticPrerenderPages(env: Record<string, string>) {
  const paths = new Set(explicitStaticPaths);
  const [posts, pages] = await Promise.all([
    loadStaticContent(env.POST_GH_INFO, env.ARTICLE_PAT).then((entries) =>
      entries.filter((entry) => entry.published === true),
    ),
    loadStaticContent(env.PAGE_GH_INFO, env.ARTICLE_PAT),
  ]);

  for (const post of posts) {
    paths.add(`/post/${post.slug}`);

    for (const tag of post.tags ?? []) {
      paths.add(`/tags/${encodeURIComponent(tag)}`);
    }
  }

  const postLastPage = Math.max(1, Math.ceil(posts.length / postPageSize));
  for (let page = 2; page <= postLastPage; page++) {
    paths.add(`/post/${page}`);
  }

  const tags = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  for (const [tag, total] of tags) {
    const tagPath = `/tags/${encodeURIComponent(tag)}`;
    paths.add(tagPath);

    const tagLastPage = Math.max(1, Math.ceil(total / postPageSize));
    for (let page = 2; page <= tagLastPage; page++) {
      paths.add(`${tagPath}/${page}`);
    }
  }

  for (const page of pages) {
    if (!dynamicPageRouteCollisions.has(page.slug)) {
      paths.add(`/${page.slug}`);
    }
  }

  return [
    ...Array.from(paths)
      .sort()
      .map((path) => ({
        path,
        prerender: { enabled: true },
      })),
  ];
}

async function loadStaticContent(source: string | undefined, pat?: string) {
  if (!source) {
    return [];
  }

  if (source.startsWith("file://")) {
    return loadLocalStaticContent(source.slice("file://".length));
  }

  if (source.startsWith("http")) {
    return loadGithubStaticContent(parseGithubDirectoryUrl(source, pat));
  }

  throw new Error(`Invalid content source URL: ${source}`);
}

async function loadLocalStaticContent(dirname: string) {
  const absoluteDir = path.resolve(appRootPath, dirname);
  const files = await fs.readdir(absoluteDir);
  const entries = await Promise.all(
    files.map(async (file) =>
      parseStaticContentEntry(
        await fs.readFile(path.join(absoluteDir, file), "utf-8"),
      ),
    ),
  );
  return entries.filter((entry) => entry !== undefined);
}

async function loadGithubStaticContent(options: GithubDirectoryOptions) {
  const fetcher = githubFetcher(options.pat);
  const refSha = await fetchGithubRefSha(fetcher, options);
  const files = (
    await fetchGithubDir(fetcher, {
      ...options,
      ref: refSha,
    })
  ).filter((file) => file.type === "file");

  const entries = await Promise.all(
    files.map(async (file) =>
      parseStaticContentEntry(
        decodeGithubFile(
          await fetchGithubFileObject(fetcher, {
            ...options,
            ref: refSha,
            path: file.path,
          }),
        ),
      ),
    ),
  );
  return entries.filter((entry) => entry !== undefined);
}

function parseStaticContentEntry(
  markdown: string,
): StaticContentEntry | undefined {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  const data = yaml.load(match?.[1] ?? "") as Record<string, unknown> | null;
  if (!data || typeof data.slug !== "string") {
    return undefined;
  }

  return {
    slug: data.slug,
    title: typeof data.title === "string" ? data.title : undefined,
    date: parseContentDate(data),
    published: typeof data.published === "boolean" ? data.published : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
  };
}

function parseContentDate(data: Record<string, unknown>) {
  const value = data.publishedDate ?? data.date;
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    !(value instanceof Date)
  ) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

function githubFetcher(pat: string | undefined) {
  return async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      headers: {
        ...(pat ? { Authorization: `Bearer ${pat}` } : {}),
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub content request failed: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  };
}

async function fetchGithubRefSha(
  fetcher: ReturnType<typeof githubFetcher>,
  options: GithubDirectoryOptions,
) {
  const url = new URL(
    `repos/${options.owner}/${options.repo}/git/ref/${options.ref}`,
    "https://api.github.com",
  );
  const data = await fetcher<GithubRef>(url.toString());
  return data.object.sha;
}

async function fetchGithubDir(
  fetcher: ReturnType<typeof githubFetcher>,
  options: GithubDirectoryOptions,
) {
  const url = new URL(
    `repos/${options.owner}/${options.repo}/contents/${options.path}`,
    "https://api.github.com",
  );
  url.searchParams.set("ref", options.ref);
  const data = await fetcher<unknown>(url.toString());
  if (!Array.isArray(data)) {
    throw new Error(`GitHub path ${options.path} is not a directory`);
  }
  return data as GithubDirectory;
}

async function fetchGithubFileObject(
  fetcher: ReturnType<typeof githubFetcher>,
  options: GithubDirectoryOptions,
) {
  const url = new URL(
    `repos/${options.owner}/${options.repo}/contents/${options.path}`,
    "https://api.github.com",
  );
  url.searchParams.set("ref", options.ref);
  const data = await fetcher<unknown>(url.toString());
  if (!data || typeof data !== "object" || !("content" in data)) {
    throw new Error(`GitHub path ${options.path} does not contain content`);
  }
  return data as GithubContentFile;
}

function decodeGithubFile(file: GithubContentFile) {
  if (file.encoding !== "base64") {
    throw new Error(`File ${file.name} is not base64 encoded`);
  }
  return Buffer.from(file.content, "base64").toString("utf-8");
}

function parseGithubDirectoryUrl(
  url: string,
  pat: string | undefined,
): GithubDirectoryOptions {
  const parsed = new URL(url);
  const [, owner, repo, tree, ref, ...pathParts] = parsed.pathname.split("/");
  if (!owner || !repo || tree !== "tree" || !ref) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  return {
    owner,
    repo,
    path: pathParts.join("/"),
    ref: ref.includes("/") ? ref : `heads/${ref}`,
    pat,
  };
}
