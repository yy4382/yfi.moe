import { describeRoute, resolver, validator } from "hono-openapi";
import {
  deleteCommentRequest,
  deleteCommentResponse,
} from "@repo/api/comment/delete.model";
import { factory } from "@/factory.js";
import { deleteComment } from "../services/delete.js";

export const deleteCommentRoute = factory.createApp().post(
  "/",
  describeRoute({
    description: "Delete a comment",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment deleted successfully",
        content: {
          "application/json": {
            schema: resolver(deleteCommentResponse),
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
          "Forbidden: if the user does not have permission to delete the comment",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              description: "Error message",
              example: "You do not have permission to delete this comment",
            },
          },
        },
      },
      404: {
        description: "Not found: if the comment to delete does not exist",
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
  validator("json", deleteCommentRequest),
  async (c) => {
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
  },
);
