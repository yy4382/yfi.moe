import { factory } from "@/factory.js";
import { commentsRoutes } from "./routes/comments.js";
import { reactionRoutes } from "./routes/reactions.js";

const commentApp = factory
  .createApp()
  .use(
    factory.createMiddleware(async (c, next) => {
      const logger = c.get("logger");
      const childLogger = logger.child({
        module: "comments",
      });
      c.set("logger", childLogger);
      return next();
    }),
  )
  .route("/", commentsRoutes)
  .route("/reaction", reactionRoutes);

export default commentApp;
