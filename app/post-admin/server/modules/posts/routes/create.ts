import { zValidator } from "@hono/zod-validator";
import { factory } from "../../../factory.js";
import { createPost } from "../services/post.service.js";
import { createPostSchema } from "../types.js";

export const createPostRoute = factory
  .createApp()
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const { slug, raw } = c.req.valid("json");

    try {
      await createPost(slug, raw);
      return c.json({ success: true }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create post";
      return c.json({ error: message }, 400);
    }
  });
