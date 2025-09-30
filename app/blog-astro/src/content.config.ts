import { defineCollection, z } from "astro:content";
import { ARTICLE_PAT, PAGE_GH_INFO, POST_GH_INFO } from "astro:env/server";
import { githubLoader } from "@/lib/content/github-loader";

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

export type ContentTimeData = Pick<
  z.infer<typeof baseSchema>,
  "writingDate" | "publishedDate" | "updatedDate"
>;

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
  const [owner, repo, ref, path] = slices as [string, string, string, string];
  return {
    owner,
    repo,
    ref,
    path,
  };
}

const post = defineCollection({
  loader: githubLoader({
    ...parseGhInfo(POST_GH_INFO),
    pat: ARTICLE_PAT,
  }),
  schema: postSchema,
});

const page = defineCollection({
  loader: githubLoader({
    ...parseGhInfo(PAGE_GH_INFO),
    pat: ARTICLE_PAT,
  }),
  schema: pageSchema,
});

export const collections = { post, page };
