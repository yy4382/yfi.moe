import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth.js";
import { gitRoutes } from "./modules/git/index.js";
import { postsRoutes } from "./modules/posts/index.js";

const app = new Hono()
  .basePath("/api")
  .use("/*", cors())
  .use("/*", authMiddleware)
  .route("/posts", postsRoutes)
  .route("/git", gitRoutes)
  .get("/health", (c) => c.json({ status: "ok" }));

export default app;
