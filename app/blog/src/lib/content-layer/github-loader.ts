import z from "zod";
import {
  fetchFileContent,
  fetchRepoDir,
  type Options,
} from "@/lib/github-client";
import yaml from "js-yaml";
import {
  ContentCollection,
  ContentLayerItem,
  ContentLayerListItem,
} from "./define-collection";
import { Redis } from "@upstash/redis";
import { yellow, blue } from "kleur/colors";

const redis = Redis.fromEnv({ cache: "force-cache" });

export class GithubCollection<T extends { slug: string }>
  implements ContentCollection<T>
{
  public collectionId: string;
  private schema: z.ZodType<T>;
  private options: Options;

  constructor(collectionId: string, schema: z.ZodType<T>, options: Options) {
    this.collectionId = collectionId;
    this.schema = schema;
    this.options = options;
  }

  private listCache: ContentLayerListItem<T>[] | null = null;
  private entryCache: Record<string, ContentLayerItem<T>> | null = null;

  private fetchRedisListPromise: Promise<ContentLayerListItem<T>[]> | null =
    null;
  private fetchRedisEntryPromises = new Map<
    string,
    Promise<ContentLayerItem<T> | null>
  >();

  public async clearCache() {
    this.listCache = null;
    this.entryCache = null;
    this.fetchRedisListPromise = null;
    this.fetchRedisEntryPromises.clear();
    await redis.del(`content-layer:${this.collectionId}`);

    // Scan and delete all keys matching the pattern
    const pattern = `content-layer:${this.collectionId}:*`;
    let cursor = "0";
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  }

  public async getCollection(): Promise<ContentLayerListItem<T>[]> {
    if (this.listCache) {
      console.debug(
        blue("[GithubCollection] getCollection local cache hit"),
        this.collectionId,
      );
      return this.listCache;
    } else {
      console.debug(
        yellow("[GithubCollection] getCollection local cache miss"),
        this.collectionId,
      );
    }
    const list = await this.fetchCollectionRedisAtomic();
    return list;
  }

  public async getEntry(slug: string): Promise<ContentLayerItem<T> | null> {
    if (this.entryCache && slug in this.entryCache) {
      console.debug(
        blue("[GithubCollection] getEntry local cache hit"),
        this.collectionId,
        slug,
      );
      return this.entryCache[slug];
    }
    console.debug(
      yellow("[GithubCollection] getEntry local cache miss"),
      this.collectionId,
      slug,
    );
    const data = await this.fetchEntryRedisAtomic(slug);
    return data;
  }

  public async getCollectionWithBody(): Promise<ContentLayerItem<T>[]> {
    const list = await this.getCollection();

    const data = (
      await Promise.all(list.map((item) => this.getEntry(item.id)))
    ).filter((item) => item !== null);
    return data;
  }

  private fromSourcePromise: Promise<ContentLayerItem<T>[]> | null = null;
  private setRedisPromise: Promise<
    readonly [ContentLayerListItem<T>[], Record<string, ContentLayerItem<T>>]
  > | null = null;

  private async fetchCollectionRedis() {
    const cacheKey = `content-layer:${this.collectionId}`;
    console.info(
      `[GithubCollection-${this.collectionId}] Reaching Redis for list`,
    );
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.debug(
        blue("[GithubCollection cache redis] getCollection redis cache hit"),
        this.collectionId,
      );
      this.listCache = cached as ContentLayerListItem<T>[];
      return cached as ContentLayerListItem<T>[];
    }
    console.debug(
      yellow(
        "[GithubCollection cache redis] fetchCollectionRedis redis cache miss",
      ),
      this.collectionId,
    );

    const [list] = await this.fetchFromSourceAndSetCacheAtomic();
    return list;
  }

  private async fetchCollectionRedisAtomic() {
    if (!this.fetchRedisListPromise) {
      this.fetchRedisListPromise = this.fetchCollectionRedis().finally(() => {
        this.fetchRedisListPromise = null;
      });
    }
    return this.fetchRedisListPromise;
  }
  private async fetchEntryRedis(
    slug: string,
  ): Promise<ContentLayerItem<T> | null> {
    const cacheKey = `content-layer:${this.collectionId}:${slug}`;
    console.info(
      `[GithubCollection-${this.collectionId}] Reaching Redis for entry: ${slug}`,
    );
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.debug(
        blue("[GithubCollection cache redis] fetchEntryRedis redis cache hit"),
        this.collectionId,
        slug,
      );
      this.entryCache = {
        ...this.entryCache,
        [slug]: cached as ContentLayerItem<T>,
      };
      return cached as ContentLayerItem<T>;
    }

    const [, entry] = await this.fetchFromSourceAndSetCacheAtomic();
    return entry[slug] ?? null;
  }
  private async fetchEntryRedisAtomic(slug: string) {
    if (!this.fetchRedisEntryPromises.has(slug)) {
      const p = this.fetchEntryRedis(slug).finally(() => {
        this.fetchRedisEntryPromises.delete(slug);
      });
      this.fetchRedisEntryPromises.set(slug, p);
    }
    return this.fetchRedisEntryPromises.get(slug)!;
  }

  private async fetchFromSourceAndSetCacheAtomic() {
    if (!this.setRedisPromise) {
      this.setRedisPromise = this.fetchFromSourceAndSetCache().finally(() => {
        this.setRedisPromise = null;
      });
    }
    return this.setRedisPromise;
  }

  private async fetchFromSourceAndSetCache() {
    if (!this.fromSourcePromise) {
      this.fromSourcePromise = this.fetchFromSource().finally(() => {
        this.fromSourcePromise = null;
      });
    }
    const list = await this.fromSourcePromise;
    this.listCache = list.map((item) => ({
      id: item.id,
      data: item.data,
    }));
    this.entryCache = Object.fromEntries(list.map((item) => [item.id, item]));
    await redis.mset({
      [`content-layer:${this.collectionId}`]: this.listCache,
      ...Object.fromEntries(
        list.map((item) => [
          `content-layer:${this.collectionId}:${item.id}`,
          item,
        ]),
      ),
    });
    return [this.listCache, this.entryCache] as const;
  }

  protected async fetchFromSource(): Promise<ContentLayerItem<T>[]> {
    const prefStart = performance.now();
    const filePaths = (await fetchRepoDir(this.options)).filter(
      (f) => f.type === "file",
    );
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const file = await fetchFileContent({
          ...this.options,
          path: filePath.path,
        });
        if (file.encoding !== "base64") {
          throw new Error(
            `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
          );
        }
        const rawContent = Buffer.from(file.content, "base64").toString(
          "utf-8",
        );
        const { data, content } = parseMarkdownFrontmatter(rawContent);
        const parsedData = this.schema.safeParse(data);
        if (!parsedData.success) {
          console.error(
            `[GithubCollection] ${this.collectionId} ${filePath.path} parse error`,
            z.prettifyError(parsedData.error),
            JSON.stringify(data),
          );
          return null;
        }
        return {
          id: parsedData.data.slug,
          body: content,
          data: parsedData.data,
        };
      }),
    );
    const prefEnd = performance.now();
    console.info(
      "[GithubCollection] GitHub fetch time",
      this.collectionId,
      prefEnd - prefStart,
      "ms",
    );
    return files.filter((f) => f !== null);
  }
}

function parseMarkdownFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  if (!match) return { data: {}, content: markdown };

  const yamlStr = match[1];
  const content = markdown.slice(match[0].length);

  const data = yaml.load(yamlStr);
  return { data, content };
}
