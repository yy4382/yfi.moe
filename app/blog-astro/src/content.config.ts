import { defineCollection, z } from "astro:content";
import { ARTICLE_PAT, PAGE_GH_INFO, POST_GH_INFO } from "astro:env/server";
import { githubLoader, parseGithubUrl } from "@/lib/content/loader/github";
import { localLoader, parseLocalUrl } from "./lib/content/loader/local";

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

function getLoader(url: string) {
  if (url.startsWith("http")) {
    return githubLoader({
      ...parseGithubUrl(url),
      pat: ARTICLE_PAT,
    });
  } else if (url.startsWith("file://")) {
    return localLoader(parseLocalUrl(url));
  }
  throw new Error(`Invalid URL: ${url}`);
}

const post = defineCollection({
  loader: getLoader(POST_GH_INFO),
  schema: postSchema,
});

const page = defineCollection({
  loader: getLoader(PAGE_GH_INFO),
  schema: pageSchema,
});

export const collections = { post, page };
