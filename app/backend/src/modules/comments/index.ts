import { factory } from "@/factory.js";
import { addCommentRoute } from "./routes/add-comment.js";
import { deleteCommentRoute } from "./routes/delete-comment.js";
import { getCommentsRoute } from "./routes/get-comments.js";
import { reactionRoutes } from "./routes/reactions.js";
import { toggleSpamRoute } from "./routes/toggle-spam.js";
import { updateCommentRoute } from "./routes/update-comment.js";

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
  .route("/", getCommentsRoute)
  .route("/add", addCommentRoute)
  .route("/delete", deleteCommentRoute)
  .route("/update", updateCommentRoute)
  .route("/toggle-spam", toggleSpamRoute)
  .route("/reaction", reactionRoutes);

export default commentApp;
