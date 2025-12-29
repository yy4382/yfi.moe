import { factory } from "../../../factory.js";
import { deletePost } from "../services/post.service.js";

export const deletePostRoute = factory
  .createApp()
  .delete("/:slug", async (c) => {
    const slug = c.req.param("slug");

    try {
      await deletePost(slug);
      return c.json({ success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete post";
      return c.json({ error: message }, 400);
    }
  });
