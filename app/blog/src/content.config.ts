import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { githubLoader } from "@utils/github-loader";
import { ARTICLE_PAT } from "astro:env/server";

const post = defineCollection({
  // loader: glob({ pattern: "**/*.md", base: "./src/content/post" }),
  loader: githubLoader({
    owner: "yy4382",
    repo: "blog-posts",
    ref: "release",
    path: "",
    pat: ARTICLE_PAT,
  }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    author: z.string().default("Yunfi"),
    image: z.string().optional(),
    updated: z.date(),
    categories: z
      .union([z.string().array(), z.string()])
      .transform((val, ctx) => {
        if (!Array.isArray(val)) return val;
        if (val.length >= 1) return val[0];
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one category is required",
        });
        return z.NEVER;
      }),
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
