import type { components } from "@octokit/openapi-types";
import type { Loader, LoaderContext } from "astro/loaders";
import fs from "fs/promises";
import { ofetch } from "ofetch";
import path from "path";

type GithubContentFile = components["schemas"]["content-file"];

export type ImageMetaEntry = {
  url: string;
  width: number;
  height: number;
  blurhash: string;
};

interface ImageMetaFetcher<Options> {
  name: string;
  fetch: (
    ctx: LoaderContext,
  ) => Promise<{ rawContent: string; source: string }>;
  checkHasChanged?: (
    ctx: LoaderContext,
  ) => Promise<{ fresh: boolean; updateFailCb: () => void }>;
  shouldRefetchOnWatchChange?: (changedPath: string) => Promise<boolean>;
  setupFileWatch?: (ctx: LoaderContext) => Promise<void>;
}

const STORE_ID = "image-meta";

export function imageMetaLoader<Options>(
  fetcherBuilder: (options: Options) => ImageMetaFetcher<Options>,
): (options: Options) => Loader {
  return function loader(options: Options): Loader {
    const fetcher = fetcherBuilder(options);
    return {
      name: fetcher.name,
      async load(ctx) {
        const hasChanged = await fetcher.checkHasChanged?.(ctx);
        if (hasChanged?.fresh) {
          return;
        }

        await fetcher.setupFileWatch?.(ctx);

        async function onChange(changedPath: string) {
          const shouldRefetch =
            await fetcher.shouldRefetchOnWatchChange?.(changedPath);
          if (shouldRefetch) {
            ctx.logger.info(
              `Changed path: ${changedPath}, will refetch image metadata`,
            );
            await sync();
          }
        }

        ctx.watcher?.on("change", onChange);
        ctx.watcher?.on("unlink", onChange);
        ctx.watcher?.on("add", onChange);

        async function sync() {
          const untouched = new Set(ctx.store.keys());
          try {
            const { rawContent, source } = await fetcher.fetch(ctx);
            const parsedData = parseImageMeta(rawContent, source);
            const data = await ctx.parseData({
              id: STORE_ID,
              data: { entries: parsedData },
            });
            ctx.store.set({
              id: STORE_ID,
              body: rawContent,
              data,
              digest: ctx.generateDigest(rawContent),
            });
            untouched.delete(STORE_ID);
            untouched.forEach((key) => ctx.store.delete(key));
            ctx.logger.info(`Loaded image metadata from ${source}`);
          } catch (error) {
            ctx.logger.error(`Failed to fetch image metadata: ${error}`);
            hasChanged?.updateFailCb();
          }
        }

        await sync();
      },
    };
  };
}

function parseImageMeta(rawContent: string, source: string): ImageMetaEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (error) {
    throw new Error(
      `Invalid JSON in image metadata from ${source}: ${(error as Error).message}`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Image metadata from ${source} should be an array, got ${typeof parsed}`,
    );
  }
  parsed.forEach((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as ImageMetaEntry).url !== "string" ||
      typeof (item as ImageMetaEntry).width !== "number" ||
      typeof (item as ImageMetaEntry).height !== "number" ||
      typeof (item as ImageMetaEntry).blurhash !== "string"
    ) {
      throw new Error(
        `Invalid image metadata entry at index ${index} in ${source}`,
      );
    }
  });
  return parsed as ImageMetaEntry[];
}

type GithubFileOptions = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  pat: string;
};

export class GithubImageMetaFetcher implements ImageMetaFetcher<GithubFileOptions> {
  name = "github-image-meta-loader";
  private options: GithubFileOptions;
  private ofetcher: typeof ofetch;

  constructor(options: GithubFileOptions) {
    this.options = options;
    this.ofetcher = ofetch.create({
      headers: {
        Authorization: `Bearer ${options.pat}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      retry: 3,
      retryDelay: 500,
      timeout: 5000,
    });
  }

  static fetcherBuilder(options: GithubFileOptions) {
    return new GithubImageMetaFetcher(options);
  }

  async fetch(): Promise<{ rawContent: string; source: string }> {
    const file = await this.fetchFileContent();
    return {
      rawContent: this.decodeContent(file),
      source: `GitHub ${this.options.owner}/${this.options.repo}#${this.options.ref}/${this.options.path}`,
    };
  }

  private async fetchFileContent(): Promise<GithubContentFile> {
    const { owner, repo, ref, path: filePath } = this.options;
    const url = new URL(
      `repos/${owner}/${repo}/contents/${filePath}`,
      "https://api.github.com",
    );
    if (ref) {
      url.searchParams.set("ref", ref);
    }
    const data = await this.ofetcher(url.toString());
    if (!("content" in data)) {
      throw new Error(`The file at path ${filePath} does not contain content`);
    }
    return data;
  }

  private decodeContent(file: GithubContentFile) {
    if (file.encoding !== "base64") {
      throw new Error(
        `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
      );
    }
    return Buffer.from(file.content, "base64").toString("utf-8");
  }
}

type LocalFileOptions = {
  filePath: string;
};

export class LocalImageMetaFetcher implements ImageMetaFetcher<LocalFileOptions> {
  name = "local-image-meta-loader";
  private filePath: string;

  constructor(options: LocalFileOptions) {
    this.filePath = path.resolve(options.filePath);
  }

  static fetcherBuilder(options: string | LocalFileOptions) {
    if (typeof options === "string") {
      return new LocalImageMetaFetcher({ filePath: options });
    }
    return new LocalImageMetaFetcher(options);
  }

  async fetch(): Promise<{ rawContent: string; source: string }> {
    return {
      rawContent: await fs.readFile(this.filePath, "utf-8"),
      source: this.filePath,
    };
  }

  async shouldRefetchOnWatchChange(changedPath: string) {
    return path.resolve(changedPath) === this.filePath;
  }

  async setupFileWatch(ctx: LoaderContext) {
    if (ctx.watcher) {
      ctx.watcher.add(this.filePath);
      ctx.logger.info(`Added watcher for ${this.filePath}`);
    }
  }
}

const githubFileUrlRegex =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/blob\/(?<ref>[^/]+(?:\/[^/]+)*)\/(?<path>.+)$/;

export function parseGithubFileUrl(
  url: string,
): Omit<GithubFileOptions, "pat"> {
  const match = githubFileUrlRegex.exec(url);
  if (!match || !match.groups) {
    throw new Error(`Invalid GitHub file URL: ${url}`);
  }
  const { owner, repo, ref, path: filePath } = match.groups;
  return {
    owner,
    repo,
    ref,
    path: filePath,
  };
}

export const githubImageMetaLoader = imageMetaLoader(
  GithubImageMetaFetcher.fetcherBuilder,
);

export const localImageMetaLoader = imageMetaLoader(
  LocalImageMetaFetcher.fetcherBuilder,
);
