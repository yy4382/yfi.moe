import { z } from "zod";
import { getGithubCollection } from "./github-loader";
import { cache } from "react";

type CollectionType<T extends z.ZodType> = {
  id: string;
  body: string;
  data: z.infer<T>;
};

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
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

export type Post = CollectionType<typeof postSchema>;

const pageSchema = baseSchema;
export type Page = CollectionType<typeof pageSchema>;

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
  throw new Error("ARTICLE_PAT is not set");
}

async function getPostCollection({
  includeDraft = false,
}: {
  includeDraft: boolean;
}): Promise<Post[]> {
  return (
    await getGithubCollection("posts", postSchema, {
      ...parseGhInfo(process.env.POST_GH_INFO),
      pat: process.env.ARTICLE_PAT ?? "",
    })
  )
    .filter((p) => includeDraft || p.data.published)
    .sort((a, b) => {
      return a.data.date.getTime() - b.data.date.getTime();
    });
}

async function getPageCollection(): Promise<Page[]> {
  return (
    await getGithubCollection("pages", pageSchema, {
      ...parseGhInfo(process.env.PAGE_GH_INFO),
      pat: process.env.ARTICLE_PAT ?? "",
    })
  ).sort((a, b) => {
    return a.data.date.getTime() - b.data.date.getTime();
  });
}

const cachedPostCollection = cache(getPostCollection);
const cachedPageCollection = cache(getPageCollection);

export {
  cachedPostCollection as getPostCollection,
  cachedPageCollection as getPageCollection,
};
