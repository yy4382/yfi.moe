import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const post = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/post" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    author: z.string().default("Yunfi"),
    image: z.string().optional(),
    updated: z.date(),
    categories: z.union([z.string().array(), z.string()]),
    tags: z.array(z.string()),
    series: z
      .object({
        title: z.string().optional(),
        id: z.string(),
        order: z.number().optional(),
      })
      .optional(),
    highlight: z.boolean().optional(),
    copyright: z.boolean().default(true),
  }),
});

const page = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/page" }),
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
    updated: z.date().optional(),
    author: z.string().default("Yunfi"),
    description: z.string().optional(),
    image: z.string().optional(),
    copyright: z.boolean().default(true),
  }),
});

export const collections = { post, page };
