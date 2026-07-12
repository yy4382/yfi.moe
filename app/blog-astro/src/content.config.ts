import { z } from "astro/zod";
import type { infer as zInfer } from "astro/zod";
import { defineCollection } from "astro:content";
import {
  ARTICLE_PAT,
  IMAGE_META_SOURCE,
  PAGE_GH_INFO,
  POST_GH_INFO,
} from "astro:env/server";
import {
  imageMetadataFileLoader,
  markdownFileSetLoader,
} from "@/lib/content/loader/content-ingestion";

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
  zInfer<typeof baseSchema>,
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

export type PostData = zInfer<typeof postSchema>;

const pageSchema = baseSchema;
export type PageData = zInfer<typeof pageSchema>;

const imageMetaSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  blurhash: z.string(),
});

const post = defineCollection({
  loader: markdownFileSetLoader({
    source: POST_GH_INFO,
    githubToken: ARTICLE_PAT,
  }),
  schema: postSchema,
});

const page = defineCollection({
  loader: markdownFileSetLoader({
    source: PAGE_GH_INFO,
    githubToken: ARTICLE_PAT,
  }),
  schema: pageSchema,
});

const imageMeta = defineCollection({
  loader: imageMetadataFileLoader({
    source: IMAGE_META_SOURCE,
    githubToken: ARTICLE_PAT,
  }),
  schema: imageMetaSchema,
});

export const collections = { post, page, imageMeta };
