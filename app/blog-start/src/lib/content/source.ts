import type { components } from "@octokit/openapi-types";
import yaml from "js-yaml";
import fs from "node:fs/promises";
import path from "node:path";
import { ofetch } from "ofetch";
import { z } from "zod";
import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import { getServerEnv } from "@/env/server";
import { findSimilarDocuments } from "@/lib/utils/similarity";

type GithubDirectory = components["schemas"]["content-directory"];
type GithubContentFile = components["schemas"]["content-file"];
type GithubRef = components["schemas"]["git-ref"];

const baseSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  slug: z.string(),
  writingDate: z.coerce.date().optional(),
  publishedDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  image: z.string().optional(),
  copyright: z.boolean().default(true),
});

const postSchema = baseSchema.extend({
  tags: z.array(z.string()),
  series: z
    .object({
      id: z.string(),
      order: z.number().optional(),
    })
    .optional(),
  highlight: z.boolean().optional(),
  published: z.boolean(),
});

const pageSchema = baseSchema;

const imageMetaSchema = z.array(
  z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
    blurhash: z.string(),
  }),
);

const postDateSchema = z.object({
  date: z.coerce.date(),
  publishedDate: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
});

export type ContentTimeData = Pick<
  z.infer<typeof baseSchema>,
  "writingDate" | "publishedDate" | "updatedDate"
>;
export type PostData = z.infer<typeof postSchema>;
export type PageData = z.infer<typeof pageSchema>;

export type ContentEntry<TData> = {
  id: string;
  body: string;
  data: TData;
};

export type ContentSummary<TData> = Pick<ContentEntry<TData>, "id" | "data">;

type GithubDirectoryOptions = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  pat: string;
};

type GithubFileOptions = GithubDirectoryOptions;

type DirectoryCache<T> = {
  version: string;
  entries: ContentEntry<T>[];
};

type FileCache<T> = {
  version: string;
  value: T;
};

const directoryCache = new Map<string, DirectoryCache<unknown>>();
const fileCache = new Map<string, FileCache<unknown>>();
const unavailableImageMetaSources = new Set<string>();

function githubFetcher(pat: string) {
  return ofetch.create({
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    retry: 3,
    retryDelay: 500,
    timeout: 5000,
  });
}

export async function getPosts() {
  const env = getServerEnv();
  return loadContentSource(env.POST_GH_INFO, postSchema, env.ARTICLE_PAT);
}

export async function getPages() {
  const env = getServerEnv();
  return loadContentSource(env.PAGE_GH_INFO, pageSchema, env.ARTICLE_PAT);
}

export async function getImageMeta(): Promise<ImageMeta[]> {
  const env = getServerEnv();
  if (unavailableImageMetaSources.has(env.IMAGE_META_SOURCE)) {
    return [];
  }

  try {
    return await loadImageMetaSource(env.IMAGE_META_SOURCE, env.ARTICLE_PAT);
  } catch (error) {
    unavailableImageMetaSources.add(env.IMAGE_META_SOURCE);
    console.warn(
      `Image metadata source is unavailable; rendering markdown images without generated metadata. ${(error as Error).message}`,
    );
    return [];
  }
}

export async function getSortedPosts(
  { noDrafts } = { noDrafts: process.env.NODE_ENV === "production" },
) {
  return (await getPosts())
    .filter((post) => (noDrafts ? post.data.published : true))
    .sort(
      (a, b) => Number(b.data.publishedDate) - Number(a.data.publishedDate),
    );
}

export async function getPost(slug: string) {
  return (await getPosts()).find((post) => post.id === slug);
}

export async function getPage(slug: string) {
  return (await getPages()).find((page) => page.id === slug);
}

export async function getAdjacentPosts(currentSlug: string) {
  const posts = await getSortedPosts();
  const currentIndex = posts.findIndex((post) => post.id === currentSlug);

  if (currentIndex === -1) {
    return { prev: undefined, next: undefined };
  }

  const prev = currentIndex > 0 ? posts[currentIndex - 1] : undefined;
  const next =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined;

  return { prev, next };
}

export async function getSeriesPosts(
  seriesId: string,
  { noDrafts } = { noDrafts: process.env.NODE_ENV === "production" },
) {
  const posts = await getSortedPosts({ noDrafts });

  return posts
    .filter((post) => post.data.series?.id === seriesId)
    .sort((a, b) => (a.data.series?.order ?? 0) - (b.data.series?.order ?? 0));
}

export async function getSimilarPosts(
  currentSlug: string,
  limit = 3,
  { noDrafts } = { noDrafts: process.env.NODE_ENV === "production" },
) {
  const posts = await getSortedPosts({ noDrafts });
  const documents = posts.map((post) => ({
    id: post.id,
    text: `${post.data.title} ${post.data.description} ${post.data.tags.join(" ")} ${post.body}`,
  }));

  return findSimilarDocuments(currentSlug, documents, limit)
    .map((similar) => {
      const post = posts.find((p) => p.id === similar.id);
      return post ? { post, score: similar.score } : null;
    })
    .filter((item) => item !== null);
}

async function loadContentSource<TData>(
  source: string,
  schema: z.ZodType<TData>,
  pat: string,
): Promise<ContentEntry<TData>[]> {
  if (source.startsWith("http")) {
    return loadGithubDirectory(parseGithubUrl(source, pat), schema);
  }
  if (source.startsWith("file://")) {
    return loadLocalDirectory(parseLocalUrl(source), schema);
  }
  throw new Error(`Invalid content source URL: ${source}`);
}

async function loadImageMetaSource(source: string, pat: string) {
  if (source.startsWith("http")) {
    return loadGithubImageMeta(parseGithubFileUrl(source, pat));
  }
  if (source.startsWith("file://")) {
    return loadLocalImageMeta(parseLocalUrl(source));
  }
  throw new Error(`Invalid image metadata URL: ${source}`);
}

async function loadGithubDirectory<TData>(
  options: GithubDirectoryOptions,
  schema: z.ZodType<TData>,
) {
  const fetcher = githubFetcher(options.pat);
  const cacheKey = `github-dir:${options.owner}/${options.repo}/${options.ref}/${options.path}`;
  const refSha = await fetchGithubRefSha(fetcher, options);
  const cached = directoryCache.get(cacheKey);
  if (cached?.version === refSha) {
    return cached.entries as ContentEntry<TData>[];
  }

  const dir = await fetchGithubDir(fetcher, options);
  const files = dir.filter((file) => file.type === "file");
  const entries = await Promise.all(
    files.map(async (file) => {
      const content = await fetchGithubFile(fetcher, {
        ...options,
        path: file.path,
      });
      return processMarkdownFile(content, file.path, schema);
    }),
  );

  directoryCache.set(cacheKey, { version: refSha, entries });
  return entries;
}

async function loadLocalDirectory<TData>(
  dirname: string,
  schema: z.ZodType<TData>,
) {
  const absoluteDir = path.resolve(dirname);
  const files = await fs.readdir(absoluteDir);
  const version = await getDirectoryVersion(absoluteDir, files);
  const cacheKey = `local-dir:${absoluteDir}`;
  const cached = directoryCache.get(cacheKey);
  if (cached?.version === version) {
    return cached.entries as ContentEntry<TData>[];
  }

  const entries = await Promise.all(
    files.map(async (file) => {
      const rawContent = await fs.readFile(
        path.join(absoluteDir, file),
        "utf-8",
      );
      return processMarkdownFile(rawContent, file, schema);
    }),
  );

  directoryCache.set(cacheKey, { version, entries });
  return entries;
}

async function loadGithubImageMeta(options: GithubFileOptions) {
  const fetcher = githubFetcher(options.pat);
  const cacheKey = `github-file:${options.owner}/${options.repo}/${options.ref}/${options.path}`;
  const file = await fetchGithubFileObject(fetcher, options);
  const cached = fileCache.get(cacheKey);
  if (cached?.version === file.sha) {
    return cached.value as ImageMeta[];
  }
  const parsed = imageMetaSchema.parse(JSON.parse(decodeGithubFile(file)));
  fileCache.set(cacheKey, { version: file.sha, value: parsed });
  return parsed;
}

async function loadLocalImageMeta(filePath: string) {
  const absolutePath = path.resolve(filePath);
  const stat = await fs.stat(absolutePath);
  const cacheKey = `local-file:${absolutePath}`;
  const cached = fileCache.get(cacheKey);
  const version = String(stat.mtimeMs);
  if (cached?.version === version) {
    return cached.value as ImageMeta[];
  }
  const parsed = imageMetaSchema.parse(
    JSON.parse(await fs.readFile(absolutePath, "utf-8")),
  );
  fileCache.set(cacheKey, { version, value: parsed });
  return parsed;
}

function processMarkdownFile<TData>(
  rawContent: string,
  file: string,
  schema: z.ZodType<TData>,
): ContentEntry<TData> {
  const { data, content } = parseMarkdownFrontmatter(rawContent);

  if (!data.slug || typeof data.slug !== "string") {
    throw new Error(`File ${file} does not have a slug`);
  }

  return {
    id: data.slug,
    body: content,
    data: schema.parse(dateTransformer(data)),
  };
}

function parseMarkdownFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  if (!match) return { data: {}, content: markdown };

  const yamlStr = match[1]!;
  const content = markdown.slice(match[0].length);
  const data = yaml.load(yamlStr) as Record<string, unknown>;
  return { data, content };
}

function dateTransformer(data: Record<string, unknown>) {
  const parsed = postDateSchema.parse(data);
  if (parsed.publishedDate) {
    return {
      ...data,
      writingDate: parsed.date,
      publishedDate: parsed.publishedDate,
      updatedDate: parsed.updated,
    };
  }
  return {
    ...data,
    writingDate: undefined,
    publishedDate: parsed.date,
    updatedDate: parsed.updated,
  };
}

async function getDirectoryVersion(dirname: string, files: string[]) {
  const stats = await Promise.all(
    files.map(async (file) => {
      const stat = await fs.stat(path.join(dirname, file));
      return `${file}:${stat.mtimeMs}:${stat.size}`;
    }),
  );
  return stats.sort().join("|");
}

async function fetchGithubRefSha(
  fetcher: typeof ofetch,
  options: GithubDirectoryOptions,
) {
  const url = new URL(
    `repos/${options.owner}/${options.repo}/git/ref/${options.ref}`,
    "https://api.github.com",
  );
  const data: GithubRef = await fetcher(url.toString());
  return data.object.sha;
}

async function fetchGithubDir(
  fetcher: typeof ofetch,
  options: GithubDirectoryOptions,
) {
  const url = new URL(
    `repos/${options.owner}/${options.repo}/contents/${options.path}`,
    "https://api.github.com",
  );
  if (options.ref) url.searchParams.set("ref", options.ref);
  const data = await fetcher(url.toString());
  if (!Array.isArray(data)) {
    throw new Error(`GitHub path ${options.path} is not a directory`);
  }
  return data as GithubDirectory;
}

async function fetchGithubFile(
  fetcher: typeof ofetch,
  options: GithubFileOptions,
) {
  return decodeGithubFile(await fetchGithubFileObject(fetcher, options));
}

async function fetchGithubFileObject(
  fetcher: typeof ofetch,
  options: GithubFileOptions,
) {
  const url = new URL(
    `repos/${options.owner}/${options.repo}/contents/${options.path}`,
    "https://api.github.com",
  );
  if (options.ref) url.searchParams.set("ref", options.ref);
  const data = await fetcher(url.toString());
  if (!("content" in data)) {
    throw new Error(`GitHub path ${options.path} does not contain content`);
  }
  return data as GithubContentFile;
}

function decodeGithubFile(file: GithubContentFile) {
  if (file.encoding !== "base64") {
    throw new Error(
      `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
    );
  }
  return Buffer.from(file.content, "base64").toString("utf-8");
}

const githubDirUrlRegex =
  /^https:\/\/github\.com\/(?<owner>.+)\/(?<repo>.+)\/tree\/(?<ref>.+)\/(?<path>.*)$/;

function parseGithubUrl(url: string, pat: string): GithubDirectoryOptions {
  const match = githubDirUrlRegex.exec(url);
  if (!match?.groups) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  const rawRef = match.groups.ref;
  const ref = rawRef.includes("/") ? rawRef : `heads/${rawRef}`;
  return {
    owner: match.groups.owner,
    repo: match.groups.repo,
    path: match.groups.path,
    ref,
    pat,
  };
}

const githubFileUrlRegex =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/blob\/(?<ref>[^/]+(?:\/[^/]+)*)\/(?<path>.+)$/;

function parseGithubFileUrl(url: string, pat: string): GithubFileOptions {
  const match = githubFileUrlRegex.exec(url);
  if (!match?.groups) {
    throw new Error(`Invalid GitHub file URL: ${url}`);
  }
  return {
    owner: match.groups.owner,
    repo: match.groups.repo,
    ref: match.groups.ref,
    path: match.groups.path,
    pat,
  };
}

function parseLocalUrl(url: string) {
  if (!url.startsWith("file://")) {
    throw new Error(`Invalid local URL: ${url}`);
  }
  return url.slice(7);
}
