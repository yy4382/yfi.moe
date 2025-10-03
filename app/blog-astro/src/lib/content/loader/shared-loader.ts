import type { Loader, LoaderContext, DataStore } from "astro/loaders";
import { z } from "astro:content";
import yaml from "js-yaml";
import type { ContentTimeData } from "@/content.config";

type DataEntry = Parameters<DataStore["set"]>[0];
export interface ContentFetcher {
  name: string;
  checkHasChanged?: (
    ctx: LoaderContext,
  ) => Promise<{ fresh: boolean; updateFailCb: () => void }>;

  fetch: (
    ctx: LoaderContext,
  ) => Promise<{ file: string; rawContent: string }[]>;

  shouldRefetchOnWatchChange?: (changedPath: string) => Promise<boolean>;
}

export function yfiLoader<Options>(
  fetcherBuilder: (options: Options) => ContentFetcher,
): (options: Options) => Loader {
  function loader(options: Options): Loader {
    const fetcher = fetcherBuilder(options);
    return {
      name: fetcher.name,
      load: async (ctx) => {
        const hasChanged = await fetcher.checkHasChanged?.(ctx);
        if (hasChanged?.fresh) {
          return;
        }

        async function onChange(changedPath: string) {
          const shouldRefetch =
            await fetcher.shouldRefetchOnWatchChange?.(changedPath);
          if (shouldRefetch) {
            ctx.logger.info(`Changed path: ${changedPath}, will refetch`);
            await syncContent();
          }
        }

        ctx.watcher?.on("change", onChange);
        ctx.watcher?.on("unlink", onChange);
        ctx.watcher?.on("add", onChange);

        async function syncContent() {
          const untouched = new Set(ctx.store.keys());
          try {
            const fileRawContents = await fetcher.fetch(ctx);
            const files = await Promise.all(
              fileRawContents.map((file) =>
                processFile(file.rawContent, file.file, ctx),
              ),
            );

            files.forEach((file) => {
              untouched.delete(file.id);
              ctx.store.set(file);
              ctx.logger.info(`Loaded file ${file.id}`);
            });

            // removed files that no longer in repo
            untouched.forEach((id) => ctx.store.delete(id));
          } catch (error) {
            ctx.logger.error(`Failed to fetch content: ${error}`);
            hasChanged?.updateFailCb();
            return;
          }
        }
        await syncContent();
      },
    };
  }
  return loader;
}

type FrontmatterTransformer = (
  data: Record<string, unknown>,
) => Record<string, unknown>;

/**
 * Process a file and return the processed file.
 *
 * @param rawContent The raw content of the file.
 * @param file An Identifier for the file, typically the file path or name (user-readable, for error messages)
 * @param ctx The astro loader context.
 * @param frontmatterTransformer Transform the frontmatter data before adding to the data store.
 * @returns The processed file.
 */
async function processFile(
  rawContent: string,
  file: string,
  ctx: LoaderContext,
  frontmatterTransformer: FrontmatterTransformer = dateTransformer,
): Promise<DataEntry> {
  const { data, content } = parseMarkdownFrontmatter(rawContent);

  if (!data.slug || typeof data.slug !== "string") {
    throw new Error(`File ${file} does not have a slug`);
  }

  const parsedFm = await ctx.parseData({
    id: data.slug,
    data: frontmatterTransformer(data),
  });

  return {
    id: data.slug,
    body: content,
    data: parsedFm,
    digest: ctx.generateDigest(rawContent),
  };
}

const postDateSchema = z.object({
  date: z.coerce.date(),
  publishedDate: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
});

/**
 * Transform the frontmatter data to the content time data.
 *
 * This is only used for the blog post.
 *
 * Rules:
 * - If `publishedDate` is provided, use it as the published date, and use the `date` as the writing date.
 * - If `publishedDate` is not provided, use the `date` as the published date.
 * - `updated` renames to `updatedDate`.
 *
 * @param data The frontmatter data from raw content.
 * @returns The transformed data (including all fields, not only the transformed fields).
 */
function dateTransformer(data: Record<string, unknown>): ContentTimeData {
  const parsed = postDateSchema.parse(data);
  if (parsed.publishedDate) {
    return {
      ...data,
      writingDate: parsed.date,
      publishedDate: parsed.publishedDate,
      updatedDate: parsed.updated,
    };
  } else {
    return {
      ...data,
      writingDate: undefined,
      publishedDate: parsed.date,
      updatedDate: parsed.updated,
    };
  }
}

function parseMarkdownFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  if (!match) return { data: {}, content: markdown };

  const yamlStr = match[1]!;
  const content = markdown.slice(match[0].length);

  const data = yaml.load(yamlStr) as Record<string, unknown>;
  return { data, content };
}
