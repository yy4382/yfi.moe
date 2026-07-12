import type { DataStore, Loader, LoaderContext } from "astro/loaders";
import { z } from "astro/zod";
import { load } from "js-yaml";
import fs from "node:fs/promises";
import path from "node:path";
import { ofetch } from "ofetch";

type LoaderOptions = {
  source: string;
  githubToken: string;
};

type RawFile = {
  path: string;
  content: string;
};

type DataEntry = Parameters<DataStore["set"]>[0];
type Acquisition<T> =
  | { status: "unchanged" }
  | { status: "changed"; value: T; revision?: string };

type GithubLocation = {
  owner: string;
  repo: string;
  ref: string;
  path: string;
};

type SourceAcquirer<T> = {
  local: (source: string) => Promise<T>;
  githubLocation: (source: string) => GithubLocation;
  github: (
    request: ReturnType<typeof githubRequest>,
    location: GithubLocation,
  ) => Promise<T>;
};

const SOURCE_REVISION_KEY = "sourceRevision";
const LEGACY_SOURCE_REVISION_KEY = "lastSha";

export function markdownFileSetLoader(options: LoaderOptions): Loader {
  const fileToId = new Map<string, string>();

  return {
    name: "markdown-file-set-loader",
    async load(context) {
      const acquisition = await acquireFileSet(options, context);
      if (acquisition.status === "unchanged") {
        return;
      }

      const untouched = new Set(context.store.keys());

      for (const file of acquisition.value) {
        const result = await markdownEntry(file, context);
        untouched.delete(result.id);
        warnForDuplicateSlug(file.path, result.id, fileToId, context);
        fileToId.set(file.path, result.id);
        if (result.entry) {
          context.store.set(result.entry);
        }
      }

      untouched.forEach((id) => context.store.delete(id));
      if (acquisition.revision) {
        commitSourceRevision(context, acquisition.revision);
      }
      setupLocalFileSetWatch(options.source, context, fileToId);
    },
  };
}

function warnForDuplicateSlug(
  filePath: string,
  id: string,
  fileToId: Map<string, string>,
  context: LoaderContext,
) {
  const duplicatePath = [...fileToId].find(
    ([knownPath, knownId]) => knownPath !== filePath && knownId === id,
  )?.[0];
  if (duplicatePath) {
    context.logger.warn(
      `Duplicate slug "${id}" found in ${filePath}; it is also used by ${duplicatePath}`,
    );
  }
}

export function imageMetadataFileLoader(options: LoaderOptions): Loader {
  return {
    name: "image-metadata-file-loader",
    async load(context) {
      const acquisition = await acquireStructuredFile(options, context);
      if (acquisition.status === "unchanged") {
        return;
      }
      const file = acquisition.value;
      await replaceImageMetadata(file, context);
      if (acquisition.revision) {
        commitSourceRevision(context, acquisition.revision);
      }
      setupLocalStructuredFileWatch(options.source, context);
    },
  };
}

async function replaceImageMetadata(file: RawFile, context: LoaderContext) {
  const parsed = JSON.parse(file.content) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Image metadata from ${file.path} must be an array`);
  }

  context.store.clear();
  const seenUrls = new Set<string>();
  for (const rawEntry of parsed) {
    if (
      typeof rawEntry !== "object" ||
      rawEntry === null ||
      typeof (rawEntry as { url?: unknown }).url !== "string"
    ) {
      throw new Error(
        `Image metadata entry from ${file.path} does not have a URL`,
      );
    }
    const id = (rawEntry as { url: string }).url;
    if (seenUrls.has(id)) {
      context.logger.warn(
        `Duplicate image metadata URL "${id}" found in ${file.path}; the later entry will replace it`,
      );
    }
    seenUrls.add(id);
    const data = await context.parseData({ id, data: rawEntry });
    context.store.set({ id, data });
  }
}

function setupLocalStructuredFileWatch(source: string, context: LoaderContext) {
  if (!context.watcher || !source.startsWith("file://")) {
    return;
  }

  const filePath = localPath(source);
  context.watcher.add(filePath);
  context.watcher.on("change", async (changedPath) => {
    if (path.resolve(changedPath) !== filePath) {
      return;
    }
    try {
      await replaceImageMetadata(
        { path: filePath, content: await fs.readFile(filePath, "utf-8") },
        context,
      );
    } catch (error) {
      context.logger.error(`Failed to reload ${filePath}: ${error}`);
    }
  });
}

async function acquireFileSet(
  options: LoaderOptions,
  context: LoaderContext,
): Promise<Acquisition<RawFile[]>> {
  return acquireSource(options, context, {
    local: acquireLocalFiles,
    githubLocation: parseGithubDirectoryUrl,
    github: fetchGithubFiles,
  });
}

async function acquireLocalFiles(source: string): Promise<RawFile[]> {
  const directory = localPath(source);
  const files = (await fs.readdir(directory, { withFileTypes: true })).filter(
    (entry) => entry.isFile(),
  );
  return Promise.all(
    files.map(async (file) => {
      const filePath = path.resolve(directory, file.name);
      return {
        path: filePath,
        content: await fs.readFile(filePath, "utf-8"),
      };
    }),
  );
}

async function acquireLocalFile(source: string): Promise<RawFile> {
  const filePath = localPath(source);
  return { path: filePath, content: await fs.readFile(filePath, "utf-8") };
}

function localPath(source: string) {
  if (!source.startsWith("file://")) {
    throw new Error(`Invalid content source: ${source}`);
  }
  return path.resolve(source.slice("file://".length));
}

async function acquireStructuredFile(
  options: LoaderOptions,
  context: LoaderContext,
): Promise<Acquisition<RawFile>> {
  return acquireSource(options, context, {
    local: acquireLocalFile,
    githubLocation: parseGithubFileUrl,
    github: async (request, location) => ({
      path: location.path,
      content: await fetchGithubFile(request, location, location.path),
    }),
  });
}

async function acquireSource<T>(
  options: LoaderOptions,
  context: LoaderContext,
  acquirer: SourceAcquirer<T>,
): Promise<Acquisition<T>> {
  if (options.source.startsWith("file://")) {
    return {
      status: "changed",
      value: await acquirer.local(options.source),
    };
  }
  if (!options.source.startsWith("http")) {
    throw new Error(`Invalid content source: ${options.source}`);
  }

  const location = acquirer.githubLocation(options.source);
  const request = githubRequest(options.githubToken);
  const revision = await fetchGithubRevision(request, location);
  if (storedSourceRevision(context) === revision) {
    context.logger.info("No new commits, skipping sync");
    return { status: "unchanged" };
  }

  return {
    status: "changed",
    value: await acquirer.github(request, location),
    revision,
  };
}

function storedSourceRevision(context: LoaderContext) {
  return (
    context.meta.get(SOURCE_REVISION_KEY) ??
    context.meta.get(LEGACY_SOURCE_REVISION_KEY)
  );
}

function commitSourceRevision(context: LoaderContext, revision: string) {
  context.meta.set(SOURCE_REVISION_KEY, revision);
  if (context.meta.has(LEGACY_SOURCE_REVISION_KEY)) {
    context.meta.delete(LEGACY_SOURCE_REVISION_KEY);
  }
}

const githubFileUrl =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/blob\/(?<ref>[^/]+(?:\/[^/]+)*)\/(?<path>.+)$/;

function parseGithubFileUrl(source: string) {
  const match = githubFileUrl.exec(source);
  if (!match?.groups) {
    throw new Error(`Invalid GitHub file URL: ${source}`);
  }
  return {
    owner: match.groups.owner!,
    repo: match.groups.repo!,
    ref: match.groups.ref!,
    path: match.groups.path!,
  };
}

const githubDirectoryUrl =
  /^https:\/\/github\.com\/(?<owner>.+)\/(?<repo>.+)\/tree\/(?<ref>.+)\/(?<path>.*)$/;

async function fetchGithubFiles(
  request: ReturnType<typeof githubRequest>,
  location: GithubLocation,
): Promise<RawFile[]> {
  const directoryUrl = new URL(
    `repos/${location.owner}/${location.repo}/contents/${location.path}`,
    "https://api.github.com",
  );
  directoryUrl.searchParams.set("ref", location.ref);
  const contents = await request<
    Array<{ type: string; path: string }> | { type: string }
  >(directoryUrl.toString());
  if (!Array.isArray(contents)) {
    throw new Error(`GitHub path ${location.path} is not a directory`);
  }

  const files = await Promise.all(
    contents
      .filter((entry) => entry.type === "file")
      .map(async (entry) => ({
        path: entry.path,
        content: await fetchGithubFile(request, location, entry.path),
      })),
  );
  return files;
}

function parseGithubDirectoryUrl(source: string) {
  const match = githubDirectoryUrl.exec(source);
  if (!match?.groups) {
    throw new Error(`Invalid GitHub URL: ${source}`);
  }
  const rawRef = match.groups.ref!;
  return {
    owner: match.groups.owner!,
    repo: match.groups.repo!,
    path: match.groups.path!,
    ref: rawRef.includes("/") ? rawRef : `heads/${rawRef}`,
  };
}

function githubRequest(token: string) {
  return ofetch.create({
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    retry: 3,
    retryDelay: 500,
    timeout: 5000,
  });
}

async function fetchGithubRevision(
  request: ReturnType<typeof githubRequest>,
  location: GithubLocation,
) {
  const ref = location.ref.includes("/")
    ? location.ref
    : `heads/${location.ref}`;
  const refUrl = new URL(
    `repos/${location.owner}/${location.repo}/git/ref/${ref}`,
    "https://api.github.com",
  );
  const data = await request<{ object: { sha: string } }>(refUrl.toString());
  return data.object.sha;
}

async function fetchGithubFile(
  request: ReturnType<typeof githubRequest>,
  location: GithubLocation,
  filePath: string,
) {
  const fileUrl = new URL(
    `repos/${location.owner}/${location.repo}/contents/${filePath}`,
    "https://api.github.com",
  );
  fileUrl.searchParams.set("ref", location.ref);
  const file = await request<{
    name: string;
    content?: string;
    encoding?: string;
  }>(fileUrl.toString());
  if (typeof file.content !== "string") {
    throw new Error(`The file at path ${filePath} does not contain content`);
  }
  if (file.encoding !== "base64") {
    throw new Error(
      `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
    );
  }
  return Buffer.from(file.content, "base64").toString("utf-8");
}

function setupLocalFileSetWatch(
  source: string,
  context: LoaderContext,
  fileToId: Map<string, string>,
) {
  if (!context.watcher || !source.startsWith("file://")) {
    return;
  }

  const directory = localPath(source);
  const isImmediateFile = (changedPath: string) =>
    path.dirname(path.resolve(changedPath)) === directory;

  async function upsert(changedPath: string) {
    if (!isImmediateFile(changedPath)) {
      return;
    }

    const filePath = path.resolve(changedPath);
    try {
      const result = await markdownEntry(
        {
          path: filePath,
          content: await fs.readFile(filePath, "utf-8"),
        },
        context,
      );
      const oldId = fileToId.get(filePath);
      if (oldId && oldId !== result.id) {
        context.store.delete(oldId);
      }
      if (result.entry) {
        context.store.set(result.entry);
      }
      warnForDuplicateSlug(filePath, result.id, fileToId, context);
      fileToId.set(filePath, result.id);
    } catch (error) {
      context.logger.error(`Failed to reload ${filePath}: ${error}`);
    }
  }

  context.watcher.add(directory);
  context.watcher.on("change", upsert);
  context.watcher.on("add", upsert);
  context.watcher.on("unlink", (changedPath) => {
    if (!isImmediateFile(changedPath)) {
      return;
    }
    const filePath = path.resolve(changedPath);
    const id = fileToId.get(filePath);
    if (id) {
      context.store.delete(id);
      fileToId.delete(filePath);
    }
  });
}

async function markdownEntry(
  file: RawFile,
  context: LoaderContext,
): Promise<{ id: string; entry?: DataEntry }> {
  const { data, body } = parseFrontmatter(file.content);
  if (typeof data.slug !== "string" || !data.slug) {
    throw new Error(`File ${file.path} does not have a slug`);
  }

  const digest = context.generateDigest(file.content);
  if (context.store.get(data.slug)?.digest === digest) {
    return { id: data.slug };
  }

  const parsedData = await context.parseData({
    id: data.slug,
    data: normalizeDates(data),
  });

  return {
    id: data.slug,
    entry: {
      id: data.slug,
      body,
      data: parsedData,
      digest,
    },
  };
}

function parseFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  if (!match) {
    return { data: {}, body: markdown };
  }

  return {
    data: load(match[1]!) as Record<string, unknown>,
    body: markdown.slice(match[0].length),
  };
}

const dateSchema = z.object({
  date: z.coerce.date(),
  publishedDate: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
});

function normalizeDates(data: Record<string, unknown>) {
  const dates = dateSchema.parse(data);
  if (dates.publishedDate) {
    return {
      ...data,
      writingDate: dates.date,
      publishedDate: dates.publishedDate,
      updatedDate: dates.updated,
    };
  }

  return {
    ...data,
    writingDate: undefined,
    publishedDate: dates.date,
    updatedDate: dates.updated,
  };
}
