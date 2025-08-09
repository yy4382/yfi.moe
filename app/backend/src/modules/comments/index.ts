import { getComments } from "./services/get.js";
import { addComment } from "./services/add.js";
import { sendNotification } from "./services/notify.js";
import { deleteComment } from "./services/delete.js";
import { updateComment } from "./services/update.js";
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

const commentApp = factory
  .createApp()
  .post("/get", sValidator("json", getCommentsBody), async (c) => {
    const body = c.req.valid("json");
    const { comments, total } = await getComments(body, {
      db: c.get("db"),
      user: c.get("auth")?.user ?? null,
    });
    const resp = getCommentsResponse.parse({ comments, total });
    return c.json(resp, 200);
  })
  .post("/add", sValidator("json", addCommentBody), async (c) => {
    const body = c.req.valid("json");

    const result = await addComment(body, {
      db: c.get("db"),
      user: c.get("auth")?.user ?? null,
      ip: c.req.header("x-forwarded-for"),
      ua: c.req.header("user-agent"),
    });
    switch (result.result) {
      case "success": {
        const resp = addCommentResponse.parse(result.data);
        sendNotification(
          {
            id: result.data.data.id,
            userId: result.data.data.userId ?? undefined,
            path: body.path,
            name: result.data.data.displayName,
            email:
              result.data.data.visitorEmail ??
              result.data.data.userEmail ??
              undefined,
            rawContent: result.data.data.rawContent,
            renderedContent: result.data.data.content,
            isSpam: result.data.isSpam,
            replyToId: result.data.data.replyToId ?? undefined,
          },
          c.get("db"),
          c.get("notification"),
        );
        return c.json(resp, 200);
      }
      case "bad_req":
        return c.text(result.data.message, 400);
      default:
        return c.text("Internal Server Error", 500);
    }
  })
  .post("/delete", sValidator("json", deleteCommentRequest), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("auth")?.user;
    if (!user) {
      return c.text("Unauthorized", 401);
    }
    const result = await deleteComment(body.id, {
      db: c.get("db"),
      user,
    });
    switch (result.result) {
      case "success":
        return c.json(
          deleteCommentResponse.parse({ deletedIds: result.deletedIds }),
          200,
        );
      case "not_found":
        return c.text(result.message, 404);
      case "forbidden":
        return c.text(result.message, 403);
      default:
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
      },
    );
    switch (result.code) {
      case 200:
        return c.json(updateCommentResponse.parse(result.data), 200);
      case 400:
        return c.text(result.data, 400);
      case 403:
        return c.text(result.data, 403);
      case 404:
        return c.text(result.data, 404);
      default:
        throw new Error("should not happen");
    }
  });

export default commentApp;
