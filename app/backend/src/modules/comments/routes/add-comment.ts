import { describeRoute, resolver, validator } from "hono-openapi";
import {
  addCommentBody,
  addCommentResponse,
} from "@repo/api/comment/add.model";
import { factory } from "@/factory.js";
import { addComment } from "../services/add/add.js";

export const addCommentRoute = factory.createApp().post(
  "/",
  describeRoute({
    description: "Add a new comment",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment added successfully",
        content: {
          "application/json": {
            schema: resolver(addCommentResponse),
          },
        },
      },
      400: {
        description: "Bad Request",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              description: "Error message",
              example: "昵称和邮箱不能为空",
            },
          },
        },
      },
      500: {
        description: "Internal Server Error",
        content: {
          "text/plain": {
            schema: { type: "string" },
          },
        },
      },
    },
  }),
  validator("json", addCommentBody),
  async (c) => {
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
  },
);
