import { zValidator } from "@hono/zod-validator";
import { factory } from "../../../factory.js";
import { updatePost } from "../services/post.service.js";
import { updatePostSchema } from "../types.js";

export const updatePostRoute = factory
  .createApp()
  .put("/:slug", zValidator("json", updatePostSchema), async (c) => {
    const slug = c.req.param("slug");
    const body = c.req.valid("json");

    try {
      await updatePost(slug, body.frontmatter, body.content);
      return c.json({ success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update post";
      return c.json({ error: message }, 400);
    }
  });
