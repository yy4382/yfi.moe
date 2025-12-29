import { factory } from "../../../factory.js";
import { getPost } from "../services/post.service.js";

export const getPostRoute = factory.createApp().get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const post = await getPost(slug);

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  return c.json({ post });
});
