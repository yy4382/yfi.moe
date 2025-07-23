import {
  addCommentResponse,
  addCommentBody,
  getCommentsBody,
  getCommentsResponse,
  updateCommentBody,
  updateCommentResponse,
} from "./model";
import { getComments } from "./services/get";
import { addComment } from "./services/add";
import { sendNotification } from "./services/notify";
import { deleteComment } from "./services/delete";
import { updateComment } from "./services/update";
import { factory } from "../../factory";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";

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
        await sendNotification(
          {
            id: result.data.id,
            userId: result.data.userId,
            path: body.path,
            name: result.data.name,
            email: result.data.email,
            rawContent: result.data.rawContent,
            renderedContent: result.data.renderedContent,
            isSpam: result.data.isSpam,
            replyToId: result.data.replyToId,
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
  .post(
    "/delete",
    sValidator("json", z.object({ id: z.number() })),
    async (c) => {
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
            { deletedIds: z.array(z.number()).parse(result.deletedIds) },
            200,
          );
        case "not_found":
          return c.text(result.message, 404);
        case "forbidden":
          return c.text(result.message, 403);
        default:
          return c.text("Internal Server Error", 500);
      }
    },
  )
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
