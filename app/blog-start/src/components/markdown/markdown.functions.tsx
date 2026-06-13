import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { z } from "zod";
import { MarkdownArticle } from "@/components/markdown/markdown-article.server";

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
  .handler(async ({ data }) => {
    const Renderable = await renderServerComponent(
      <MarkdownArticle content={data.content} imageMeta={data.imageMeta} />,
    );
    return { Renderable };
  });
