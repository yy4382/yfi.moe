import { z } from "zod";
import { GithubCollection } from "./github-loader";
import { ContentLayerItem, ContentLayerListItem } from "./define-collection";
import { compareAsc, compareDesc } from "date-fns";

const baseSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  slug: z.string(),

  date: z.date(),
  updated: z.date().optional(),

  image: z.string().optional(),
  copyright: z.boolean().default(true),
});

const postSchema = baseSchema.extend({
  tags: z.array(z.string()),
  series: z
    .object({
      title: z.string().optional(),
      id: z.string(),
      order: z.number().optional(),
    })
    .optional(),
  highlight: z.boolean().optional(),
  published: z.boolean(),
});

export type PostData = z.infer<typeof postSchema>;

const pageSchema = baseSchema;
export type PageData = z.infer<typeof pageSchema>;

function parseGhInfo(info: string | undefined) {
  if (!info) {
    throw new Error("GH info is not set");
  }
  const slices = info.split("__");
  if (slices.length !== 4) {
    throw new Error(`Invalid GH info format: ${info}`);
  }
  const [owner, repo, ref, path] = slices;
  return {
    owner,
    repo,
    ref,
    path,
  };
}

if (process.env.ARTICLE_PAT === undefined) {
  console.error("[GITHUB COLLECTIONS] ARTICLE_PAT is not set");
  throw new Error("ARTICLE_PAT is not set");
}

class PostCollection extends GithubCollection<PostData> {
  public async getCollection({
    includeDraft = false,
    order = "desc",
  }: { includeDraft?: boolean; order?: "asc" | "desc" } = {}): Promise<
    ContentLayerListItem<PostData>[]
  > {
    const result = await super.getCollection();
    return result
      .filter((item) => includeDraft || item.data.published)
      .sort((a, b) => {
        return order === "asc"
          ? compareAsc(a.data.date, b.data.date)
          : compareDesc(a.data.date, b.data.date);
      });
  }

  public async getCollectionWithBody({
    includeDraft = false,
    order = "desc",
  }: { includeDraft?: boolean; order?: "asc" | "desc" } = {}): Promise<
    ContentLayerItem<PostData>[]
  > {
    const result = await super.getCollectionWithBody();
    return result
      .filter((item) => includeDraft || item.data.published)
      .sort((a, b) => {
        return order === "asc"
          ? compareAsc(a.data.date, b.data.date)
          : compareDesc(a.data.date, b.data.date);
      });
  }

  public async getEntry(
    slug: string,
    { includeDraft = false }: { includeDraft?: boolean } = {},
  ): Promise<ContentLayerItem<PostData> | null> {
    const result = await super.getEntry(slug);
    if (!result) return result;
    if (!includeDraft && !result.data.published) {
      return null;
    }
    return result;
  }
  protected async fetchFromSource(): Promise<ContentLayerItem<PostData>[]> {
    const parentResult = await super.fetchFromSource();
    return parentResult.map((item) => {
      if (item.data.description === "") {
        item.data.description = getDesc(item.body);
      }
      return item;
    });
  }
}

export const postCollection = new PostCollection("posts", postSchema, {
  ...parseGhInfo(process.env.POST_GH_INFO),
  pat: process.env.ARTICLE_PAT ?? "",
});

export const pageCollection = new GithubCollection("pages", pageSchema, {
  ...parseGhInfo(process.env.PAGE_GH_INFO),
  pat: process.env.ARTICLE_PAT ?? "",
});

function truncateAtClosestNewline(str: string, targetPosition = 150) {
  while (str.startsWith("\n")) {
    str = str.slice(1);
  }
  let newPosition = str.lastIndexOf("\n", targetPosition);

  if (newPosition === -1) {
    newPosition = str.indexOf("\n", targetPosition);
    if (newPosition === -1) {
      return str;
    }
  }

  // 截取字符串到换行符的位置
  return str.substring(0, newPosition);
}

function getDesc(
  content: string,
  config?: { length?: number; tryMore?: boolean },
) {
  const { length = 70, tryMore = true } = config || {};
  content = content.trim();
  if (tryMore) {
    const moreIndex = content.indexOf("<!--more-->");
    if (moreIndex !== -1) {
      content = content.substring(0, moreIndex).trim();
    } else {
      content = truncateAtClosestNewline(content, length);
    }
  } else {
    content = truncateAtClosestNewline(content, length);
  }
  return content;
}
