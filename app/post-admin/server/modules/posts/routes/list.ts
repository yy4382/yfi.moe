import { factory } from "../../../factory.js";
import { listPosts } from "../services/post.service.js";

export const listPostsRoute = factory.createApp().get("/", async (c) => {
  const posts = await listPosts();
  return c.json({ posts });
});
