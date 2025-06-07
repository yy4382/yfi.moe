import { defineCollection, z } from "astro:content";
import { githubLoader } from "@utils/github-loader";
import { ARTICLE_PAT, PAGE_GH_INFO, POST_GH_INFO } from "astro:env/server";

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),

  date: z.date(),
  updated: z.date().optional(),

  image: z.string().optional(),
  copyright: z.boolean().default(true),
});

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

const post = defineCollection({
  loader: githubLoader({
    ...parseGhInfo(POST_GH_INFO),
    pat: ARTICLE_PAT,
  }),
  schema: baseSchema.extend({
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
  }),
});

const page = defineCollection({
  loader: githubLoader({
    ...parseGhInfo(PAGE_GH_INFO),
    pat: ARTICLE_PAT,
  }),
  schema: baseSchema,
});

export const collections = { post, page };
