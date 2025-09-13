import { getComments } from "./services/get.js";
import { addComment } from "./services/add/add.js";
import { deleteComment } from "./services/delete.js";
import { updateComment } from "./services/update.js";
import { toggleCommentSpam } from "./services/toggle-spam.js";
import { factory } from "@/factory.js";
import { sValidator } from "@hono/standard-validator";
import {
  getCommentsBody,
  getCommentsResponse,
} from "@repo/api/comment/get.model";
import {
  addCommentBody,
  addCommentResponse,
} from "@repo/api/comment/add.model";
import {
  updateCommentBody,
  updateCommentResponse,
} from "@repo/api/comment/update.model";
import {
  deleteCommentRequest,
  deleteCommentResponse,
} from "@repo/api/comment/delete.model";
import {
  toggleSpamRequest,
  toggleSpamResponse,
} from "@repo/api/comment/toggle-spam.model";

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
  .post("/get", sValidator("json", getCommentsBody), async (c) => {
    const body = c.req.valid("json");
    c.get("logger").debug(
      {
        path: body.path,
        sortBy: body.sortBy,
        limit: body.limit,
        offset: body.offset,
        userId: c.get("auth")?.user?.id,
      },
      "comments:get request",
    );
    const { comments, total } = await getComments(body, {
      db: c.get("db"),
      user: c.get("auth")?.user ?? null,
      logger: c.get("logger"),
    });
    const resp = getCommentsResponse.parse({ comments, total });
    c.get("logger").debug(
      { total, returned: comments.length },
      "comments:get response",
    );
    return c.json(resp, 200);
  })
  .post("/add", sValidator("json", addCommentBody), async (c) => {
    const body = c.req.valid("json");

    const result = await addComment(body, {
      db: c.get("db"),
      user: c.get("auth")?.user ?? null,
      ip: c.req.header("x-forwarded-for"),
      ua: c.req.header("user-agent"),
      akismet: c.get("akismet"),
      notificationService: c.get("notification"),
      logger: c.get("logger"),
    });
    switch (result.result) {
      case "success": {
        const resp = addCommentResponse.parse(result.data);
        c.get("logger").info(
          {
            path: body.path,
            isSpam: result.data.isSpam,
            userId: c.get("auth")?.user?.id,
          },
          "comments:add success",
        );
        return c.json(resp, 200);
      }
      case "bad_req":
        c.get("logger").warn(
          { message: result.data.message },
          "comments:add bad request",
        );
        return c.text(result.data.message, 400);
      default:
        c.get("logger").error({ result }, "comments:add unexpected error");
        return c.text("Internal Server Error", 500);
    }
  })
  .post("/delete", sValidator("json", deleteCommentRequest), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("auth")?.user;
    if (!user) {
      return c.text("Unauthorized", 401);
    }
    const deleteOptions = {
      db: c.get("db"),
      user,
      logger: c.get("logger"),
    };
    const result = await deleteComment(body.id, deleteOptions);
    switch (result.result) {
      case "success":
        c.get("logger").info(
          { deletedIds: result.deletedIds, userId: user.id },
          "comments:delete success",
        );
        return c.json(
          deleteCommentResponse.parse({ deletedIds: result.deletedIds }),
          200,
        );
      case "not_found":
        c.get("logger").warn(
          { commentId: body.id },
          "comments:delete not found",
        );
        return c.text(result.message, 404);
      case "forbidden":
        c.get("logger").warn(
          { commentId: body.id },
          "comments:delete forbidden",
        );
        return c.text(result.message, 403);
      default:
        c.get("logger").error({ result }, "comments:delete unexpected error");
        return c.text("Internal Server Error", 500);
    }
  })
  .post("/update", sValidator("json", updateCommentBody), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("auth")?.user;
    if (!user) {
      return c.text("Unauthorized", 401);
    }
    const result = await updateComment(
      body.id,
      {
        rawContent: body.rawContent,
      },
      {
        db: c.get("db"),
        user,
        logger: c.get("logger"),
      },
    );
    switch (result.code) {
      case 200:
        c.get("logger").info({ commentId: body.id }, "comments:update success");
        return c.json(updateCommentResponse.parse(result.data), 200);
      case 400:
        c.get("logger").warn(
          { commentId: body.id },
          "comments:update bad request",
        );
        return c.text(result.data, 400);
      case 403:
        c.get("logger").warn(
          { commentId: body.id },
          "comments:update forbidden",
        );
        return c.text(result.data, 403);
      case 404:
        c.get("logger").warn(
          { commentId: body.id },
          "comments:update not found",
        );
        return c.text(result.data, 404);
      default:
        throw new Error("should not happen");
    }
  })
  .post("/toggle-spam", sValidator("json", toggleSpamRequest), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("auth")?.user;

    const result = await toggleCommentSpam(body.id, body.isSpam, {
      db: c.get("db"),
      user: user ?? null,
      akismet: c.get("akismet"),
      logger: c.get("logger"),
    });

    switch (result.code) {
      case 200:
        c.get("logger").info(
          { commentId: body.id, isSpam: body.isSpam },
          "comments:toggle-spam success",
        );
        return c.json(toggleSpamResponse.parse(result.data), 200);
      case 401:
        c.get("logger").warn(
          { commentId: body.id },
          "comments:toggle-spam 401",
        );
        return c.text(result.data, 401);
      case 403:
        c.get("logger").warn(
          { commentId: body.id },
          "comments:toggle-spam 403",
        );
        return c.text(result.data, 403);
      case 404:
        c.get("logger").warn(
          { commentId: body.id },
          "comments:toggle-spam 404",
        );
        return c.text(result.data, 404);
      default:
        throw new Error("should not happen");
    }
  });

export default commentApp;
