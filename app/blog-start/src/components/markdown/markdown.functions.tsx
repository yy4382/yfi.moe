import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { renderMarkdownArticleHtml } from "@/components/markdown/markdown.server";

const imageMetaSchema = z.array(
  z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
    blurhash: z.string(),
  }),
);

export const renderMarkdownArticle = createServerFn({ method: "POST" })
  .validator(
    z.object({
      content: z.string(),
      imageMeta: imageMetaSchema,
    }),
  )
  .handler(({ data }) => renderMarkdownArticleHtml(data));
