import { describeRoute, resolver, validator } from "hono-openapi";
import {
  updateCommentBody,
  updateCommentResponse,
} from "@repo/api/comment/update.model";
import { factory } from "@/factory.js";
import { updateComment } from "../services/update.js";

export const updateCommentRoute = factory.createApp().post(
  "/",
  describeRoute({
    description: "Update a comment",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment updated successfully",
        content: {
          "application/json": {
            schema: resolver(updateCommentResponse),
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
              example: "Content cannot be empty",
            },
          },
        },
      },
      401: {
        description: "Not authorized: if the user is not logged in",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              description: "Error message",
              example: "Unauthorized",
            },
          },
        },
      },
      403: {
        description:
          "Forbidden: if the user does not have permission to update the comment",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              description: "Error message",
              example: "You do not have permission to update this comment",
            },
          },
        },
      },
      404: {
        description: "Not found: if the comment to update does not exist",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              description: "Error message",
              example: "Comment not found",
            },
          },
        },
      },
    },
  }),
  validator("json", updateCommentBody),
  async (c) => {
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
  },
);
