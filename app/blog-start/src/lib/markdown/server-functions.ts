import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { z } from "zod";
import {
  getMarkdownHeadingList,
  renderPostDescriptionHtmlList,
  renderRssContentHtmlList,
} from "@/lib/markdown/markdown.server";

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
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => renderPostDescriptionHtmlList(data.posts));

export const getMarkdownHeadings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      content: z.string(),
    }),
  )
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => getMarkdownHeadingList(data.content));

export const renderRssContentHtml = createServerFn({ method: "POST" })
  .validator(
    z.object({
      bodies: z.array(z.string()),
    }),
  )
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => renderRssContentHtmlList(data.bodies));
