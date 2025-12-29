import { factory } from "../../factory.js";
import { createPostRoute } from "./routes/create.js";
import { deletePostRoute } from "./routes/delete.js";
import { getPostRoute } from "./routes/get.js";
import { listPostsRoute } from "./routes/list.js";
import { updatePostRoute } from "./routes/update.js";

export const postsRoutes = factory
  .createApp()
  .route("/", listPostsRoute)
  .route("/", createPostRoute)
  .route("/", getPostRoute)
  .route("/", updatePostRoute)
  .route("/", deletePostRoute);
