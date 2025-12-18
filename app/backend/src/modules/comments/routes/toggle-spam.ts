import { describeRoute, resolver, validator } from "hono-openapi";
import {
  toggleSpamRequest,
  toggleSpamResponse,
} from "@repo/api/comment/toggle-spam.model";
import { factory } from "@/factory.js";
import { toggleCommentSpam } from "../services/toggle-spam.js";

export const toggleSpamRoute = factory.createApp().post(
  "/",
  describeRoute({
    description: "Mark a comment as spam or not spam",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment spam status updated successfully",
        content: {
          "application/json": {
            schema: resolver(toggleSpamResponse),
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
              example: "You do not have permission to perform this action",
            },
          },
        },
      },
      404: {
        description: "Not found: if the comment to  update does not exist",
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
  validator("json", toggleSpamRequest),
  async (c) => {
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
  },
);
