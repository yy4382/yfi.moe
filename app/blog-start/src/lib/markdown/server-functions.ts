import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { markdownToHeadings, markdownToHtml } from "@repo/markdown/parse";
import { ArticlePresetFast, ArticleRSSPreset } from "@repo/markdown/preset";
import { getDesc } from "@/lib/content/get-description";

export const renderPostDescriptionHtml = createServerFn({ method: "POST" })
  .validator(
    z.object({
      posts: z.array(
        z.object({
          body: z.string(),
          description: z.string().optional(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) =>
    data.posts.map(
      (post) =>
        post.description ||
        markdownToHtml(getDesc(post.body), { preset: ArticlePresetFast }),
    ),
  );

export const getMarkdownHeadings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      content: z.string(),
    }),
  )
  .handler(async ({ data }) => markdownToHeadings(data.content));

export const renderRssContentHtml = createServerFn({ method: "POST" })
  .validator(
    z.object({
      bodies: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) =>
    data.bodies.map((body) =>
      markdownToHtml(body, { preset: ArticleRSSPreset }),
    ),
  );
